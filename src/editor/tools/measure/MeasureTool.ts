/**
 * editor/tools/measure/MeasureTool —— 四类测量工具单实现类（阶段 10，T10.1）。
 *
 * 职责：distance（逐点 + 双击/Enter 完成）/ height（2 点自动完成三读数）/
 *      area（≥3 非共线 + 双击/Enter 完成）/ angle（3 点 ∠ABC 自动完成）的统一交互——
 * 一实现类 + kind 参数（沿 DrawToolBase shapeType 先例），四个实例以
 * measure.distance / measure.height / measure.area / measure.angle 注册 ToolRegistry。
 * 交互语义按 contracts/stage10-measure.md §A 表：
 *  - 拾取经 ViewportPort.surfacePoint（表面优先/地面兜底/近水平限距），测量**不切顶视、
 *    不锁旋转**（与绘制不同：测量常在透视下贴立面）；
 *  - 吸附 G（网格，会话开关）/Shift（正交）/A（45°）作用于 x/z（draw/snap 纯函数复用），
 *    拾取 y 值保留不锁定；
 *  - 双击重复点 ε=0.01m 去重；拦截（顶点不足/共线）发 error 状态、草稿保留可修正；
 *  - Delete/退格 = 「删除上一条」（有草稿先弃草稿）；
 *  - 完成后 MeasureSession.add（measure:changed）+ 草稿复位，支持连续测量。
 * 四不变式之「零场景副作用」在此落地：不选对象、不改 transform、不产生 Command；
 * cancel()（ESC）只清当前草稿，完整保留已提交测量项。
 * 边界：零 THREE；渲染经 MeasurePort（依赖倒置，runtime 实现 MeasureOverlay）；
 *      不继承 DrawToolBase（不切机位/不锁旋转/不产 Command，但双击完成、ESC 取消、
 *      G/Shift/A 辅助键语义同构）。
 */
import type { MeasureStatusPayload } from '../../../core/events/events';
import type { MeasureKind, Vec2, Vec3 } from '../../../core/types';
import { angleDeg, dist3, isCollinearXZ, polygonAreaXZ, polylineLength3 } from '../../../core/math';
import type { MeasureItem, MeasureSession } from '../../services/measure';
import { createMeasureItem } from '../../services/measure';
import type { MeasurePort } from '../../services/ports';
import type { KeyboardEventInfo, PointerEventInfo } from '../../services/ports';
import type { Tool, ToolContext } from '../Tool';
import { angleLock, gridSnap, orthoLock } from '../draw/snap';
import type { DrawGridConfig } from '../draw/DrawGridConfig';
import { createDrawGridConfig } from '../draw/DrawGridConfig';

/** 角度锁定步长（度；与 DrawToolBase 一致） */
const ANGLE_STEP_DEG = 45;
/** 双击重复点去重阈值（米）：ε 内视为同一点丢弃 */
const DEDUP_EPSILON = 0.01;

/** 四测量工具 id（注册键；stage10 §E） */
export const MEASURE_TOOL_IDS = [
  'measure.distance',
  'measure.height',
  'measure.area',
  'measure.angle',
] as const;
export type MeasureToolId = (typeof MEASURE_TOOL_IDS)[number];

/** 工具 id → kind 判定（app/input Delete 路由用：测量工具激活时 Delete 归工具语义） */
export function isMeasureToolId(id: string): id is MeasureToolId {
  return (MEASURE_TOOL_IDS as readonly string[]).includes(id);
}

const KIND_NAMES: Record<MeasureKind, string> = {
  distance: '距离测量',
  height: '高度差测量',
  area: '面积测量',
  angle: '角度测量',
};

export class MeasureTool implements Tool {
  readonly id: MeasureToolId;
  readonly name: string;
  private readonly kind: MeasureKind;
  private readonly session: MeasureSession;
  private readonly overlay: MeasurePort;
  /** 共享网格吸附配置（组合根注入，与绘制工具同源；缺省独立对象 5m + 吸附开） */
  private readonly drawGrid: DrawGridConfig;

  private ctx: ToolContext | null = null;
  /** 草稿已固定点（世界坐标） */
  private points: Vec3[] = [];
  /** 当前游标（吸附管线产出；拾取失败保留上次） */
  private cursor: Vec3 | null = null;
  /** 最近一次原始拾取（辅助键切换后原地重投影基准） */
  private lastPick: Vec3 | null = null;
  private lastShift = false;
  /** A 键 45° 锁定开关（默认关） */
  private lock45 = false;
  /** G 键网格吸附开关（默认开；与全局 snapEnabled 取「与」） */
  private gridSnapEnabled = true;
  /** 是否已向 MeasurePort 推过草稿（清理时避免空触 Port；沿 DrawToolBase previewShown 先例） */
  private draftShown = false;

  constructor(kind: MeasureKind, session: MeasureSession, overlay: MeasurePort, drawGrid?: DrawGridConfig) {
    this.kind = kind;
    this.id = `measure.${kind}` as MeasureToolId;
    this.name = KIND_NAMES[kind];
    this.session = session;
    this.overlay = overlay;
    this.drawGrid = drawGrid ?? createDrawGridConfig();
  }

  activate(ctx: ToolContext, _params?: unknown): void {
    this.ctx = ctx;
    this.resetDraftState();
    // 刻意不切机位、不锁旋转（契约 §A：测量常在透视下贴立面）
  }

  deactivate(): void {
    this.resetDraftState();
    this.clearDraft(); // 切工具弃草稿呈现（已提交项归会话/覆盖层提交层，不动）
    this.ctx = null;
  }

  onPointerMove(e: PointerEventInfo): void {
    const p = this.resolvePoint(e);
    if (p === null) return; // 表面与地面均无有效拾取：保留游标上次位置
    this.cursor = p;
    this.pushDraft();
    this.emitStatus();
  }

  onPointerDown(e: PointerEventInfo): void {
    if (e.button !== 'left') {
      // 防御路径：右键/中键即取消手势（激活态退出由 ToolManager.cancel 负责）
      this.cancel();
      return;
    }
    const p = this.resolvePoint(e);
    if (p === null) return; // 无有效拾取：不落点
    this.cursor = p;
    if (!this.isDuplicateOfLast(p)) {
      this.points.push(p);
      this.onPointAdded();
    }
    this.pushDraft();
    this.emitStatus();
  }

  onPointerUp(_e: PointerEventInfo): void {
    // 完成语义在 pointerDown（height/angle 自动完成）与双击/Enter（distance/area）
  }

  /** 双击：位置为新点（ε 外）时补入后完成；distance/area 生效（height/angle 已自动完成） */
  onDoubleClick(e: PointerEventInfo): void {
    const p = this.resolvePoint(e);
    if (p !== null) {
      this.cursor = p;
      if (!this.isDuplicateOfLast(p)) {
        this.points.push(p);
        this.onPointAdded(); // height/angle 理论到不了（点数已满即提交），防御调用无害
      }
    }
    this.finish();
  }

  onKeyDown(e: KeyboardEventInfo): void {
    if (!this.ctx) return;
    if (e.key === 'Escape') {
      // 防御路径：就地清草稿（激活态退出由 app 层 input → ToolManager.cancel 负责）
      this.cancel();
      return;
    }
    if (e.ctrlKey || e.altKey) return; // 组合键归浏览器/应用级快捷键
    if (e.key === 'Enter') {
      if (this.kind === 'distance' || this.kind === 'area') this.finish();
      return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      this.deleteLast();
      return;
    }
    const key = e.key.toLowerCase();
    if (key === 'a') {
      this.lock45 = !this.lock45;
      this.refreshFromLastPick();
    } else if (key === 'g') {
      this.gridSnapEnabled = !this.gridSnapEnabled;
      this.refreshFromLastPick();
    }
  }

  /** 退出手势：只弃草稿（updateDraft(null) + 复位状态），已提交测量项完整保留（零 Command） */
  cancel(): void {
    if (!this.ctx) return;
    this.resetDraftState();
    this.clearDraft();
    this.emitResetStatus();
  }

  // ── 内部：拾取与吸附 ────────────────────────────────────

  /** 表面拾取 + 辅助管线（null = 表面与地面均无有效拾取） */
  private resolvePoint(e: PointerEventInfo): Vec3 | null {
    if (!this.ctx) return null;
    const pick = this.ctx.viewport.surfacePoint(e.screenX, e.screenY);
    if (!pick) return null;
    this.lastPick = pick;
    this.lastShift = e.shiftKey;
    return this.applyAids(pick, e.shiftKey);
  }

  /** 落点管线（x/z 域）：Shift 正交（主轴取偏移大者）或 A 45° 锁定 → G 网格吸附；y 保留不锁定 */
  private applyAids(raw: Vec3, shiftKey: boolean): Vec3 {
    let xz: Vec2 = { x: raw.x, y: raw.z };
    const from = this.anchorXZ();
    if (from) {
      if (shiftKey) {
        const axis: 'x' | 'z' =
          Math.abs(xz.x - from.x) >= Math.abs(xz.y - from.y) ? 'x' : 'z';
        xz = orthoLock(from, xz, axis);
      } else if (this.lock45) {
        xz = angleLock(from, xz, ANGLE_STEP_DEG);
      }
    }
    // 会话开关（G 键）与全局开关（菜单）取「与」——任一关闭即不吸附（沿 DrawToolBase 语义）
    if (this.gridSnapEnabled && this.drawGrid.snapEnabled) {
      xz = gridSnap(xz, this.drawGrid.spacing);
    }
    return { x: xz.x, y: raw.y, z: xz.y };
  }

  /** 吸附锚点 = 草稿末点 x/z（Vec2 = x, 世界 z） */
  private anchorXZ(): Vec2 | null {
    const last = this.points[this.points.length - 1];
    return last ? { x: last.x, y: last.z } : null;
  }

  /** 双击/连击去重：与草稿末点三维距离 < ε 视为重复（契约：ε=0.01m） */
  private isDuplicateOfLast(p: Vec3): boolean {
    const last = this.points[this.points.length - 1];
    return last !== undefined && dist3(last, p) < DEDUP_EPSILON;
  }

  /** 辅助键切换后按最近拾取原地重投影（游标/草稿/状态同步刷新） */
  private refreshFromLastPick(): void {
    if (!this.lastPick) return;
    this.cursor = this.applyAids(this.lastPick, this.lastShift);
    this.pushDraft();
    this.emitStatus();
  }

  // ── 内部：完成与提交 ────────────────────────────────────

  /** 落点钩子：height 2 点 / angle 3 点自动完成 */
  private onPointAdded(): void {
    if (this.kind === 'height' && this.points.length === 2) {
      this.commit();
    } else if (this.kind === 'angle' && this.points.length === 3) {
      this.commit();
    }
  }

  /** 双击/Enter 完成：distance ≥2；area ≥3 非共线；拦截发 error、草稿保留 */
  private finish(): void {
    if (this.kind === 'distance') {
      if (this.points.length < 2) {
        this.emitStatus({ error: '距离测量至少需要 2 个点' });
        return;
      }
      this.commit();
    } else if (this.kind === 'area') {
      if (this.points.length < 3) {
        this.emitStatus({ error: '面积测量至少需要 3 个点' });
        return;
      }
      if (isCollinearXZ(this.points)) {
        this.emitStatus({ error: '顶点共线，无法围成面积' });
        return;
      }
      this.commit();
    }
    // height/angle：完成在第 2/3 点自动触发，此处无操作
  }

  /** 提交当前草稿入会话并复位（支持连续测量；「删除上一条」依据 createdAt 时序） */
  private commit(): void {
    const item: MeasureItem = createMeasureItem(this.kind, this.points);
    this.session.add(item); // → measure:changed（覆盖层提交层的事件源）
    this.syncCommitted();
    this.resetDraftState();
    this.clearDraft();
    this.emitResetStatus();
  }

  /** 已提交层整组刷新（工具自身提交/删除路径；外部会话变更经 measure:changed 订阅同路） */
  private syncCommitted(): void {
    this.overlay.updateMeasurements(this.session.list());
  }

  /** Delete/退格：有草稿先弃草稿；无草稿删除上一条（契约 §A「删除」） */
  private deleteLast(): void {
    if (this.points.length > 0 || this.cursor !== null) {
      this.resetDraftState();
      this.clearDraft();
      this.emitResetStatus();
      return;
    }
    if (this.session.removeLast()) this.syncCommitted(); // 空表 false：安全无操作
  }

  /** 草稿状态复位（点列/游标/辅助键基准；不动 lock45/gridSnapEnabled 会话级开关） */
  private resetDraftState(): void {
    this.points = [];
    this.cursor = null;
    this.lastPick = null;
  }

  /** 清草稿呈现（从未推送时不触 Port） */
  private clearDraft(): void {
    if (!this.draftShown) return;
    this.draftShown = false;
    this.overlay.updateDraft(null);
  }

  /** 草稿推送（覆盖层唯一可见通道；弹性段 = 末点→cursor，area 为闭合环+cursor） */
  private pushDraft(): void {
    this.draftShown = true;
    this.overlay.updateDraft({
      kind: this.kind,
      points: this.points.map((p) => ({ ...p })),
      cursor: this.cursor ? { ...this.cursor } : null,
    });
  }

  // ── 内部：状态事件 ──────────────────────────────────────

  /** 复位载荷：仅含 kind（沿 draw:status 空载荷复位先例——kind 为契约必填字段） */
  private emitResetStatus(): void {
    this.ctx?.eventBus.emit('measure:status', { kind: this.kind });
  }

  /** 实时读数（字段按 kind 最小集；error 随下一次正常状态自然清除） */
  private emitStatus(extra: { error?: string } = {}): void {
    if (!this.ctx) return;
    const payload: MeasureStatusPayload = { kind: this.kind, ...extra };
    if (this.cursor) payload.cursor = { ...this.cursor };
    const cursor = this.cursor;
    switch (this.kind) {
      case 'distance': {
        const last = this.points[this.points.length - 1];
        if (last && cursor) payload.segment = dist3(last, cursor);
        payload.total = polylineLength3(cursor ? [...this.points, cursor] : [...this.points]);
        if (this.points.length === 0) delete payload.total; // 无固定点无累计
        break;
      }
      case 'height': {
        const a = this.points[0];
        if (a && cursor) {
          payload.segment = dist3(a, cursor);
          payload.horizontal = Math.hypot(cursor.x - a.x, cursor.z - a.z);
          payload.dh = cursor.y - a.y; // 可负
        }
        break;
      }
      case 'area': {
        if (this.points.length >= 1 && cursor) {
          payload.area = polygonAreaXZ([...this.points, cursor]);
        }
        break;
      }
      case 'angle': {
        const [a, b] = this.points;
        if (a && b && cursor) payload.angle = angleDeg(a, b, cursor);
        break;
      }
    }
    this.ctx.eventBus.emit('measure:status', payload);
  }
}
