/**
 * editor/tools/RoadSplitTool —— 道路分割工具（T7.6 R4，零 THREE）。
 *
 * 职责：单选 road line region 在内部转角顶点处一分为二——
 *  - activate(params {objectId})：解析目标（须 region + shape.type==='line'，否则抛错）；
 *    经 VertexEditSessionPort.beginSession（points + closed:false）复用 T6.8 句柄层
 *    视觉显示节点；同时 port.onDragEnd(() => {}) 置空中性化拖拽提交（VertexEditTool
 *    每次 activate 重挂回调，置空安全，防陈旧回调误提交）；
 *  - 交互：onPointerDown（左键）→ viewport.groundPoint → 最近内部顶点（index
 *    1..n−2，端点不可分割；世界坐标 = 局部点列 + live position 偏移）在容差 1.5m
 *    内为候选 → 执行 SplitRoadCommand（单命令单历史）→ 结束会话回选择工具
 *    （setExitToSelect 组合根注入，沿 VertexEditTool 先例——工具层不持 ToolManager）
 *    并 selectMany 两段；
 *  - 命中失败（无候选）：app:notify（kind 'info'）提示「点击道路转角节点处分割」；
 *  - 退出：ESC 经 app 层 input → ToolManager.cancel（既有路径）→ endSession 零命令。
 * 边界：零 THREE；句柄渲染全在 runtime（VertexEditImpl），本工具只经 Port 交互；
 *      分割命令不依赖 port（无头装配仍可执行，句柄层仅视觉辅助）。
 */
import type { ID, Vec2 } from '../../core/types';
import { clonePoints, isRegionObject } from '../../domain/regions';
import { SplitRoadCommand } from '../commands/SplitRoadCommand';
import type { VertexEditPort, VertexEditSessionPort } from '../services/ports';
import type { PointerEventInfo, KeyboardEventInfo } from '../services/ports';
import type { Tool, ToolContext } from './Tool';

/** activate(params) 既定结构：{ objectId?: ID }（缺省取选中集首个 road line） */
export interface RoadSplitParams {
  objectId?: ID;
}

/** 工具注册键（ui/tools/toolIA 同源引用） */
export const ROAD_SPLIT_TOOL_ID = 'road-split';

/** Context Toolbar 激活态中段提示（VertexEditSection 同构） */
export const ROAD_SPLIT_HINT = '点击道路转角节点分割 · Esc 退出';

/** 内部顶点拾取容差（米，主代理建议 1.5） */
export const ROAD_SPLIT_PICK_TOLERANCE_M = 1.5;

export class RoadSplitTool implements Tool {
  readonly id = ROAD_SPLIT_TOOL_ID;
  readonly name = '道路分割';

  /** Port（VertexEditPort 契约 + 会话控制；null：无头装配桩行为） */
  private readonly port: (VertexEditPort & VertexEditSessionPort) | null;
  /** 退出钩子（分割完成后回选择工具；组合根注入应用层策略） */
  private exitToSelect: (() => void) | null = null;

  private ctx: ToolContext | null = null;
  private objectId: ID | null = null;
  /** 会话点列缓存（候选计算数据源；局部坐标，命中判定时加 live position 偏移） */
  private points: Vec2[] = [];

  constructor(port: (VertexEditPort & VertexEditSessionPort) | null) {
    this.port = port;
  }

  /** 注入退出钩子（分割完成后回选择；沿 VertexEditTool.setExitToSelect 先例） */
  setExitToSelect(hook: (() => void) | null): void {
    this.exitToSelect = hook;
  }

  activate(ctx: ToolContext, params?: unknown): void {
    const objectId = this.resolveTarget(ctx, params);
    const obj = ctx.sceneManager.getObject(objectId);
    if (!obj || !isRegionObject(obj) || obj.shape.type !== 'line') {
      throw new Error('RoadSplitTool: 目标必须是道路线（line region）对象');
    }
    this.ctx = ctx;
    this.objectId = objectId;
    this.points = clonePoints(obj.shape.points);

    const port = this.port;
    if (port) {
      // 中性化陈旧拖拽回调（VertexEditTool 每次 activate 重挂；置空安全）
      port.onDragEnd(() => {});
      port.beginSession({ objectId, points: clonePoints(this.points), closed: false });
    }
  }

  deactivate(): void {
    this.cleanup();
  }

  onPointerDown(e: PointerEventInfo): void {
    const ctx = this.ctx;
    if (!ctx || this.objectId === null || e.button !== 'left') return;
    const index = this.findCandidate(e);
    if (index === null) {
      ctx.eventBus.emit('app:notify', { message: '点击道路转角节点处分割', kind: 'info' });
      return;
    }
    const targetId = this.objectId;
    const command = new SplitRoadCommand(targetId, index);
    const ok = ctx.history.execute(command);
    // 结束会话 → 回选择工具（组合根钩子）→ 选中两段
    this.cleanup();
    this.exitToSelect?.();
    if (ok) ctx.selection.selectMany([targetId, command.createdId]);
  }

  onPointerMove(_e: PointerEventInfo): void {
    // 候选高亮归 runtime 句柄层（当前不区分悬停态）；分割判定在 onPointerDown 现算
  }

  onPointerUp(_e: PointerEventInfo): void {}

  /** 退出手势：结束会话（零 Command）；激活态退出由 ToolManager 负责 */
  cancel(): void {
    this.cleanup();
  }

  onKeyDown(_e: KeyboardEventInfo): void {}

  /** 当前是否正在编辑给定对象（面板/矩阵按钮态判定） */
  isEditing(objectId: ID): boolean {
    return this.objectId === objectId;
  }

  // ── 内部 ────────────────────────────────────────────────

  /** 目标解析：params.objectId → 选中集首个 road line；无合法目标抛错（activate 快速失败） */
  private resolveTarget(ctx: ToolContext, params?: unknown): ID {
    const fromParams =
      typeof params === 'object' && params !== null
        ? (params as Record<string, unknown>).objectId
        : undefined;
    if (typeof fromParams === 'string' && fromParams !== '') return fromParams;
    for (const id of ctx.selection.getSelectedIds()) {
      const obj = ctx.sceneManager.getObject(id);
      if (obj && isRegionObject(obj) && obj.shape.type === 'line') return id;
    }
    throw new Error('RoadSplitTool: 缺少分割目标（需要 { objectId } 或选中一条道路线）');
  }

  /**
   * 地面点 → 最近内部顶点（index 1..n−2，距离 ≤ 容差；无候选 null）。
   * 候选 = 局部点列 + live position(x/z) 偏移的世界坐标（被 gizmo 移动过的道路
   * 同样命中——句柄层 localToWorld 同位渲染）。
   */
  private findCandidate(e: PointerEventInfo): number | null {
    const ctx = this.ctx;
    if (!ctx || this.objectId === null) return null;
    const ground = ctx.viewport.groundPoint(e.screenX, e.screenY);
    if (!ground) return null;
    const live = ctx.sceneManager.getObject(this.objectId);
    if (!live) return null;
    const px = live.transform.position.x;
    const pz = live.transform.position.z;
    let bestIndex: number | null = null;
    let bestDist = ROAD_SPLIT_PICK_TOLERANCE_M;
    for (let i = 1; i <= this.points.length - 2; i++) {
      const p = this.points[i]!;
      const d = Math.hypot(p.x + px - ground.x, p.y + pz - ground.z);
      if (d <= bestDist) {
        bestIndex = i;
        bestDist = d;
      }
    }
    return bestIndex;
  }

  /** 会话清理（幂等，cancel/deactivate 连调安全）：endSession；零 Command */
  private cleanup(): void {
    if (this.objectId === null) return;
    this.port?.endSession();
    this.objectId = null;
    this.ctx = null;
    this.points = [];
  }
}
