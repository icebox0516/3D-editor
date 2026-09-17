/**
 * editor/tools/VertexEditTool —— 顶点编辑编辑会话（阶段 6 T6.8，解禁项末档）。
 *
 * 职责：面/线（含点）RegionObject 的 shape.points 顶点级编辑的 editor 侧会话——
 *  - activate：目标解析（params.objectId / 选中集兜底）→ 经 domain editableShapeOf
 *    转换为编辑点列（参数化形状进入编辑即转 polygon 自由点列，options 缓存失效不携带；
 *    转换仅存在于会话内存，首次提交时随 after 落库——零修改退出不产生历史）→
 *    port.beginSession 挂载 runtime 顶点句柄；
 *  - 提交通道（分域契约 §C）：runtime 顶点手势（拖动/插入/删除）→ VertexEditPort.
 *    onDragEnd 一次性 before/after 点列 → 本会话组装目标 RegionShape（type=polygon/
 *    line/point、points=after、baseHeight 取 live）→ ChangeShapeCommand 一条历史
 *    （松手提交；零位移与陈旧回调丢弃）；全程不改 semantic/style（三层解耦）；
 *  - 会话内场景同步：object:updated(shape)（提交回环/撤销/重做）→ port.setPoints
 *    句柄重排；object:removed → 会话自动退出清理；
 *  - G 键切换会话级网格吸附开关、A 键切换 45° 角度锁定（共享 snap 会话对象，
 *    组合根注入 runtime 吸附管线；T8.1 A 键与绘制管线同语义）；
 *    Delete/Backspace → port.requestVertexRemoval（删除悬停顶点，app 层 input 路由）；
 *  - 退出：Esc 经 app 层 input → ToolManager.cancel（既有路径）；双击同一对象经
 *    exitToSelect 钩子退出（组合根注入，沿 DrawToolBase 先例）。
 * 边界：零 THREE；句柄渲染/拖拽预览/读数推送全在 runtime（VertexEditImpl），本工具只
 *      经 Port 交互；拖拽中间帧零事件零命令（预览隔离）；一切可见修改经 Command。
 */
import type { ID, Vec2 } from '../../core/types';
import {
  clonePoints,
  editableShapeOf,
  editableShapeTypeOf,
  isRegionObject,
  pointsEqual,
} from '../../domain/regions';
import type { RegionShape } from '../../domain/regions';
import { ChangeShapeCommand } from '../commands/ChangeShapeCommand';
import type { VertexEditPort, VertexEditSessionPort } from '../services/ports';
import type { KeyboardEventInfo, PointerEventInfo } from '../services/ports';
import type { Tool, ToolContext } from './Tool';

/** activate(params) 既定结构：{ objectId?: ID }（缺省取选中集首个 region） */
export interface VertexEditParams {
  objectId?: ID;
}

/** 工具注册键（ui/tools/toolIA 同源引用） */
export const VERTEX_EDIT_TOOL_ID = 'vertex-edit';

/** 会话吸附开关载体（组合根创建并注入 runtime 吸附管线闭包，单一真相源） */
export interface VertexSnapSession {
  /** G 键网格吸附会话开关（默认开） */
  enabled: boolean;
  /** A 键 45° 角度锁定会话开关（T8.1；默认关——与绘制管线同语义，Shift 正交优先互斥） */
  angleLock: boolean;
}

/** runtime 手势结束信息（与 VertexEditPort.onDragEnd 载荷一致） */
type VertexGestureInfo = { objectId: ID; before: Vec2[]; after: Vec2[] };

export class VertexEditTool implements Tool {
  readonly id = VERTEX_EDIT_TOOL_ID;
  readonly name = '顶点编辑';

  /** Port（VertexEditPort 契约 + 会话控制；null：无头装配桩行为） */
  private readonly port: (VertexEditPort & VertexEditSessionPort) | null;
  /** 会话吸附开关（与 runtime 吸附管线共享同一对象） */
  private readonly snapSession: VertexSnapSession;
  /** 退出钩子（双击同一对象退出；组合根注入「回选择工具」应用层策略） */
  private exitToSelect: (() => void) | null = null;

  private ctx: ToolContext | null = null;
  private objectId: ID | null = null;
  /** 会话目标形状类型（面类统一 polygon；line/point 保持）与闭合标志 */
  private sessionShapeType: 'polygon' | 'line' | 'point' = 'polygon';
  private sessionClosed = true;
  /** 会话期事件退订 */
  private offUpdated: (() => void) | null = null;
  private offRemoved: (() => void) | null = null;

  constructor(
    port: (VertexEditPort & VertexEditSessionPort) | null,
    snapSession?: VertexSnapSession,
  ) {
    this.port = port;
    this.snapSession = snapSession ?? { enabled: true, angleLock: false };
  }

  /** 注入退出钩子（双击退出；沿 DrawToolBase.setExitToSelect 先例） */
  setExitToSelect(hook: (() => void) | null): void {
    this.exitToSelect = hook;
  }

  activate(ctx: ToolContext, params?: unknown): void {
    const objectId = this.resolveTarget(ctx, params);
    const obj = ctx.sceneManager.getObject(objectId);
    if (!obj || !isRegionObject(obj)) {
      throw new Error('VertexEditTool: 目标必须是区域（region）对象');
    }
    this.ctx = ctx;
    this.objectId = objectId;
    const editable = editableShapeOf(obj.shape);
    this.sessionShapeType = editableShapeTypeOf(obj.shape);
    this.sessionClosed = editable.closed;
    this.snapSession.enabled = true;
    this.snapSession.angleLock = false; // 会话辅助键复位（与绘制工具 activate 同惯例）

    const port = this.port;
    if (port) {
      // 提交通道：runtime 顶点手势（拖动/插入/删除共用）→ 一条 ChangeShapeCommand
      port.onDragEnd((info) => this.commit(info));
      port.beginSession({ objectId, points: clonePoints(editable.points), closed: editable.closed });
    }

    // 会话内场景同步：shape 变更（提交回环/撤销/重做）→ 句柄重排
    this.offUpdated = ctx.eventBus.on('object:updated', ({ objectId: id, keys }) => {
      if (id !== this.objectId) return;
      if (keys.includes('shape')) this.syncPoints();
    });
    // 对象消失（删除/撤销创建）→ 会话退出清理
    this.offRemoved = ctx.eventBus.on('object:removed', ({ objectId: id }) => {
      if (id === this.objectId) this.cleanup();
    });
  }

  deactivate(): void {
    this.cleanup();
  }

  onPointerDown(_e: PointerEventInfo): void {
    // 句柄拖拽由 runtime 直接消费（TransformControls 同模式）；本工具不拾取对象
  }

  onPointerMove(_e: PointerEventInfo): void {}

  onPointerUp(_e: PointerEventInfo): void {}

  /** 双击同一对象 → 退出编辑（入口对称：双击进入/双击退出） */
  onDoubleClick(e: PointerEventInfo): void {
    const ctx = this.ctx;
    const id = this.objectId;
    if (!ctx || id === null) return;
    const hitId = ctx.viewport.pickObject(e.screenX, e.screenY);
    if (hitId === id) this.exitToSelect?.();
  }

  onKeyDown(e: KeyboardEventInfo): void {
    if (e.key === 'Escape') {
      // 防御路径：就地清理（激活态退出由 app 层 input → ToolManager.cancel 负责）
      this.cleanup();
      return;
    }
    if (e.ctrlKey || e.altKey) return; // 组合键归浏览器/应用级快捷键
    const key = e.key.toLowerCase();
    if (key === 'g') {
      this.snapSession.enabled = !this.snapSession.enabled;
    } else if (key === 'a') {
      // A 键 45° 角度锁定（T8.1）：与绘制管线同语义（Shift 正交优先互斥；
      // runtime 管线内实现——editor/tools/vertexSnapPipeline 单一真相源）
      this.snapSession.angleLock = !this.snapSession.angleLock;
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      this.port?.requestVertexRemoval(); // 删除悬停顶点（违例由 runtime 拦截提示）
    }
  }

  /** 退出手势：结束会话（零 Command）；激活态退出由 ToolManager 负责 */
  cancel(): void {
    this.cleanup();
  }

  /** 当前是否正在编辑给定对象（面板按钮态 / 双击退出的数据源） */
  isEditing(objectId: ID): boolean {
    return this.objectId === objectId;
  }

  // ── 内部 ────────────────────────────────────────────────

  /** 目标解析：params.objectId → 选中集首个 region；无合法目标抛错（activate 快速失败） */
  private resolveTarget(ctx: ToolContext, params?: unknown): ID {
    const fromParams =
      typeof params === 'object' && params !== null
        ? (params as Record<string, unknown>).objectId
        : undefined;
    if (typeof fromParams === 'string' && fromParams !== '') return fromParams;
    for (const id of ctx.selection.getSelectedIds()) {
      const obj = ctx.sceneManager.getObject(id);
      if (obj && isRegionObject(obj)) return id;
    }
    throw new Error('VertexEditTool: 缺少编辑目标（需要 { objectId } 或选中一个区域对象）');
  }

  /** runtime 手势结束 → 一条 ChangeShapeCommand（before 快照由命令从 live 场景取） */
  private commit(info: VertexGestureInfo): void {
    const ctx = this.ctx;
    if (!ctx || this.objectId === null || info.objectId !== this.objectId) return; // 陈旧回调丢弃
    if (pointsEqual(info.before, info.after)) return; // 零位移手势不入历史
    const live = ctx.sceneManager.getObject(this.objectId);
    if (!live || !isRegionObject(live)) return;
    const shape: RegionShape = {
      type: this.sessionShapeType, // 参数化形状首次提交即落库为 polygon 自由点列
      points: clonePoints(info.after),
      baseHeight: live.shape.baseHeight,
      closed: this.sessionClosed,
      // options 不携带：进入编辑即转自由点列，原参数化缓存失效
    };
    ctx.history.execute(new ChangeShapeCommand(this.objectId, shape));
  }

  /** 场景点列 → 句柄重排（object:updated(shape) 触发：提交回环/撤销/重做） */
  private syncPoints(): void {
    const ctx = this.ctx;
    const id = this.objectId;
    if (!ctx || id === null) return;
    const live = ctx.sceneManager.getObject(id);
    if (!live || !isRegionObject(live)) return;
    this.port?.setPoints(editableShapeOf(live.shape).points);
  }

  /** 会话清理（幂等，cancel/deactivate 连调安全）：退订 + endSession；零 Command */
  private cleanup(): void {
    if (this.objectId === null) return; // 幂等：ToolManager.cancel 会连调 cancel + deactivate
    this.offUpdated?.();
    this.offUpdated = null;
    this.offRemoved?.();
    this.offRemoved = null;
    this.port?.endSession();
    this.objectId = null;
    this.ctx = null;
  }
}
