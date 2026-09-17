/**
 * editor/tools/TransformTool —— 变换工具（T1.6 桩 → T2.4 完整实现；T7.5 多对象手势聚合）。
 *
 * 职责：activate 时把 Gizmo 挂到当前选中集（经 GizmoPort.attach）并按参数设置模式
 *      （W/E/R 由 app 层 input 路由为 translate/rotate/scale）；Gizmo 拖拽期间的中间
 *      变换由 runtime 直接写渲染对象（预览隔离：不发事件、不进历史）；拖拽结束经
 *      onDragEnd 收到一次性 {objectId, before, after}，转成 TransformCommand 交
 *      HistoryManager 执行（一切可见修改经 Command）。
 *      多对象手势（T7.5）：GizmoImpl 多目标拖拽结束时对每个目标各回调一次（同一
 *      手势 N 次同步回调，GizmoPort 签名零变更）——本工具聚合为一条 BatchCommand
 *      合一条历史（N=1 直接单条不包 Batch）；聚合机制 = 微任务冲刷（同一手势的
 *      N 次回调同步连发，事件循环轮转即手势边界；真实手势由宏任务分隔，冲刷必先
 *      于下一手势）。
 *      工具激活期间订阅 selection:changed：场景树/框选改变选中集时 gizmo 跟随重挂；
 *      订阅 scene:changed（T8.6 缺陷①）：undo/redo 等命令路径改场景 transform 后经
 *      GizmoPort.resync 重同步代理（undo 不改选中集不触发重挂，不重同步则手柄漂移
 *      在旧位姿；拖拽会话中的自反馈由 resync 契约防打断）。
 * 边界：GizmoPort 经构造注入（ToolContext 契约不含 gizmo，避免改契约签名；T2.4 裁定
 *      构造注入够用）；注入 null 时为纯桩（无头装配，attach/detach 均无操作）；
 *      本工具不处理点击选中（避免与 Gizmo 拖拽的 pointer 事件互相干扰——选中经
 *      SelectTool / 场景树完成，ESC / 右键退回选择工具）；零 THREE。
 */
import type { ID, Transform } from '../../core/types';
import type { GizmoPort, PointerEventInfo } from '../services/ports';
import { BatchCommand } from '../commands/BatchCommand';
import { TransformCommand } from '../commands/TransformCommand';
import type { Tool, ToolContext } from './Tool';

/** Gizmo 模式（与 GizmoPort.setMode 参数一致） */
export type TransformMode = 'translate' | 'rotate' | 'scale';

/** activate(params) 既定结构：{ mode?: TransformMode } */
export interface TransformParams {
  mode?: TransformMode;
}

const MODES: readonly TransformMode[] = ['translate', 'rotate', 'scale'];

export class TransformTool implements Tool {
  readonly id = 'transform';
  readonly name = '变换';

  /** GizmoPort（null：无头装配桩行为） */
  private readonly gizmo: GizmoPort | null;
  private ctx: ToolContext | null = null;
  /** selection:changed 退订函数（激活期间 gizmo 跟随选中集） */
  private offSelection: (() => void) | null = null;
  /** scene:changed 退订函数（激活期间场景数据变化 → 代理重同步，T8.6 缺陷①） */
  private offScene: (() => void) | null = null;
  /** 当前手势聚合中的拖拽结束信息（同一手势 N 目标 = N 次同步回调） */
  private pendingDrags: Array<{ objectId: ID; before: Transform; after: Transform }> = [];
  /** 手势冲刷是否已排程（同一手势只排一个微任务） */
  private flushScheduled = false;

  constructor(gizmo: GizmoPort | null = null) {
    this.gizmo = gizmo;
  }

  activate(ctx: ToolContext, params?: unknown): void {
    const mode = parseMode(params);
    this.ctx = ctx;
    const gizmo = this.gizmo;
    if (!gizmo) return; // 无 Gizmo 实现（无头装配）：桩

    gizmo.setMode(mode);
    // 拖拽结束回调 → 手势聚合（N>1 一条 BatchCommand、N=1 直接单条 TransformCommand）
    gizmo.onDragEnd((info) => {
      this.pendingDrags.push(info);
      if (this.flushScheduled) return;
      this.flushScheduled = true;
      queueMicrotask(() => this.flushGesture());
    });
    gizmo.attach(ctx.selection.getSelectedIds());

    // 选中集变化（场景树点击 / 框选）→ gizmo 重挂（视口与场景树双向同步）
    this.offSelection = ctx.eventBus.on('selection:changed', () => {
      gizmo.attach(ctx.selection.getSelectedIds());
    });

    // 场景数据变化（undo/redo/贴地/阵列/属性面板改值等命令路径）→ 代理重同步
    // （T8.6 缺陷①：undo 不改选中集、不触发上面的重挂，而 attach 是一次性快照，
    // 不重同步则手柄漂移在旧位姿）。不做 source 过滤——SceneManager 与命令层双发
    // 事件且来源值无法区分业务路径；防拖拽自反馈由 GizmoPort.resync 契约保证
    // （实现方按 TransformControls dragging 态自守卫，拖拽会话中无操作）。
    this.offScene = ctx.eventBus.on('scene:changed', () => {
      gizmo.resync();
    });
  }

  deactivate(): void {
    this.offSelection?.();
    this.offSelection = null;
    this.offScene?.();
    this.offScene = null;
    this.ctx = null;
    this.pendingDrags = [];
    this.gizmo?.detach();
  }

  onPointerDown(_e: PointerEventInfo): void {
    // Gizmo 自行消费拖拽事件；点击选中归 SelectTool（避免拖拽手柄误改选中集）
  }

  onPointerMove(_e: PointerEventInfo): void {}

  onPointerUp(_e: PointerEventInfo): void {}

  cancel(): void {
    // 拖拽中的 Gizmo 属临时预览：退出手势即脱离挂载，不产生任何 Command
    this.gizmo?.detach();
  }

  /**
   * 手势冲刷（微任务）：N>1 → N 条 TransformCommand 经 BatchCommand 合一条历史
   * （多选拖拽 = 单条可撤销历史）；N=1 → 直接单条；工具已停用（ctx 置空）丢弃。
   */
  private flushGesture(): void {
    this.flushScheduled = false;
    const batch = this.pendingDrags;
    this.pendingDrags = [];
    const ctx = this.ctx;
    if (!ctx || batch.length === 0) return;
    if (batch.length === 1) {
      const { objectId, before, after } = batch[0]!;
      ctx.history.execute(new TransformCommand(objectId, before, after));
      return;
    }
    ctx.history.execute(
      new BatchCommand(batch.map((d) => new TransformCommand(d.objectId, d.before, d.after))),
    );
  }
}

/** 模式参数解析：缺省 translate；非法值抛错（activate 失败快速暴露接线错误） */
function parseMode(raw: unknown): TransformMode {
  if (raw === undefined) return 'translate';
  if (typeof raw === 'object' && raw !== null) {
    const mode = (raw as Record<string, unknown>).mode;
    if (mode === undefined) return 'translate';
    if (typeof mode === 'string' && (MODES as readonly string[]).includes(mode)) {
      return mode as TransformMode;
    }
  }
  throw new Error('TransformTool: 参数 mode 必须是 translate | rotate | scale');
}
