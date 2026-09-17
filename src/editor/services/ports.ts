/**
 * editor/services/ports —— 渲染能力 Port 接口（依赖倒置的接口端）。
 *
 * 职责：声明 editor 层（工具/命令编排）所需的视口拾取、相机控制、临时预览能力契约。
 * 边界：纯接口 + 纯数据类型，零渲染——禁止任何 THREE 类型或导入（CONTRACTS.md #5）；
 *      实现在 runtime（RuntimeViewport / CameraController / PreviewManager），
 *      由 app 组合根装配注入（T1.6），editor 层仅面向本接口编程。
 *
 * 契约来源：docs/archive/plan-phase1/CONTRACTS.md「editor/services（Port 接口，runtime 实现，app 注入）」一节，
 * 签名以契约为准；本文件不得重定义签名（GizmoPort 等其余 Port 由后续任务按需增补）。
 */
import type { ID, MeasureKind, Transform, Vec2, Vec3 } from '../../core/types';
import type { GeometryType } from '../../domain/geometry';
import type { MeasureItem } from './measure';

/** 指针事件信息（UI 层从 DOM 事件归一化后传入，视口相对 CSS 像素坐标） */
export interface PointerEventInfo {
  screenX: number;
  screenY: number;
  button: 'left' | 'right' | 'middle';
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

/** 键盘事件信息（UI 层从 DOM 事件归一化后传入） */
export interface KeyboardEventInfo {
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

/** 视口拾取 Port：射线拾取、地面投影与测量表面拾取 */
export interface ViewportPort {
  /** 射线拾取 → 命中对象的业务 objectId（未命中返回 null） */
  pickObject(x: number, y: number): ID | null;
  /** Raycast → 地面平面（y=0）世界坐标（射线背离地面时返回 null） */
  groundPoint(x: number, y: number): Vec3 | null;
  /**
   * 测量拾取（2026-09-15 阶段 10 增补，第十一次契约修订；定义见
   * contracts/stage10-measure.md §B）：表面优先（content 对象 raycast 交点世界坐标；
   * AUX 层/gizmo/网格/地面辅助不可拾取），未命中落地面 y=0 平面；射线-平面近水平
   * （交点距相机 > 2000m）返回 null（调研坑③限距）。
   */
  surfacePoint(x: number, y: number): Vec3 | null;
}

/** 相机控制 Port */
export interface CameraPort {
  /**
   * 当前机位模式（2026-09-10 契约增补，T4.1 按需门批准）：runtime 实现内部跟踪
   * （setMode 写入、启动默认 'perspective'）。绘制工具进入时记录原机位、退出时恢复。
   */
  getMode(): 'perspective' | 'top' | 'front' | 'side';
  setMode(mode: 'perspective' | 'top' | 'front' | 'side'): void;
  /** 绘制模式限制旋转（正交锁定） */
  setOrthoLock(locked: boolean): void;
  focusObjects(ids: ID[]): void;
  focusAll(): void;
}

/** 绘制过程预览状态（DrawSession 临时数据，不入 Scene、不入历史） */
export interface DrawPreviewState {
  geometryType: GeometryType;
  points: Vec2[];
  cursor: Vec2 | null;
  closed: boolean;
}

/** 临时预览 Port：放置 Ghost 与绘制预览，全部不进入正式 Scene、不产生历史记录 */
export interface PreviewPort {
  showGhost(assetId: ID, t: Transform): void;
  updateGhost(t: Transform): void;
  hideGhost(): void;
  updateDrawPreview(state: DrawPreviewState): void;
  clear(): void;
}

/**
 * 变换 Gizmo Port：拖拽手柄的挂载/模式/拖拽结束回调。
 * 增补注记（T1.6）：按 CONTRACTS.md ports 一节既定签名增补；运行时实现在 T2.4
 * （runtime/gizmo），此前注入方传 null（TransformTool 桩不依赖其存在）。
 */
export interface GizmoPort {
  /** 将 Gizmo 挂到给定对象集合（空数组等价 detach） */
  attach(ids: ID[]): void;
  detach(): void;
  setMode(mode: 'translate' | 'rotate' | 'scale'): void;
  /**
   * 对当前挂载集重读场景 transform 同步代理姿态（T8.6 缺陷①）：attach 是一次性
   * 快照，undo/redo/贴地/阵列等命令路径改场景数据后须由调用方触发重同步，否则
   * 手柄漂移在旧位姿。拖拽会话进行中为无操作（实现方按 TransformControls
   * dragging 态自守卫，防自反馈打断手势）；未挂载无操作。
   */
  resync(): void;
  /** 拖拽结束回调（一次性 before/after），由 TransformTool 转成 TransformCommand */
  onDragEnd(cb: (info: { objectId: ID; before: Transform; after: Transform }) => void): void;
}

/**
 * 框选拾取能力（可选扩展 Port，T2.4）：屏幕矩形 → 与对象包围盒屏幕投影相交的业务 id 集。
 * 增补注记（T2.4）：CONTRACTS.md 的 ViewportPort 未列本方法——作为独立可选能力接口增补
 * （不改既有签名），由 SelectTool 构造注入；runtime RuntimeViewport 以结构化类型实现，
 * 未注入时选择工具退化为纯点击语义。是否并入正式 ViewportPort 契约由主代理决策。
 */
export interface RectPickPort {
  /** 屏幕矩形（CSS 像素，任意对角次序）内投影相交的对象 id（注册顺序） */
  pickInRect(x0: number, y0: number, x1: number, y1: number): ID[];
}

/**
 * 顶点编辑 Port（阶段 6 T6.8，定义在分域契约 contracts/stage6-region.md §C——本文件
 * 为 editor 接口端，签名逐字一致；模式沿 GizmoPort：runtime 实现、app 注入）。
 */
export interface VertexEditPort {
  /** 顶点拖动结束回调（一次性 before/after 点列），由 editor 层编辑会话转成 ChangeShapeCommand */
  onDragEnd(cb: (info: { objectId: ID; before: Vec2[]; after: Vec2[] }) => void): void;
}

/**
 * 顶点编辑会话控制（可选扩展 Port，T6.8）：VertexEditPort（契约 §C）只定义 onDragEnd
 * 提交通道；会话挂载/点列同步/悬停删除转发作为独立可选能力接口增补（沿 RectPickPort
 * T2.4 先例——不改 VertexEditPort 签名），由 VertexEditTool 构造注入；runtime
 * VertexEditImpl 以结构化类型实现，未注入时为无头桩。是否并入正式契约由主代理决策。
 */
export interface VertexEditSessionPort {
  /** 开始编辑会话：runtime 渲染顶点/边中点句柄（closed 决定首尾边与约束族） */
  beginSession(info: { objectId: ID; points: Vec2[]; closed: boolean }): void;
  /** 同步工作点列（提交回环/撤销/重做后的句柄重排） */
  setPoints(points: Vec2[]): void;
  /** 删除当前悬停顶点（Delete/Backspace 转发；违例约束由实现拦截提示；无悬停返回 false） */
  requestVertexRemoval(): boolean;
  /** 结束会话：移除句柄、清理拖拽态、按场景数据恢复预览几何 */
  endSession(): void;
}

/**
 * 足迹幽灵预览（可选扩展 Port，T7.6）：对齐弹层 hover / 阵列 popover 实时参数的
 * 「目标位置足迹框」预览通道。沿 RectPickPort（T2.4）/ VertexEditSessionPort（T6.8）
 * 先例增补——不改 PreviewPort 既有签名；runtime PreviewManager 以结构化类型实现
 * （细线矩形 + 轻填充、不可拾取、不入 Scene 数据/历史），未注入时为无操作。
 * 是否并入正式契约由主代理决策。
 */
export interface FootprintGhost {
  /** 足迹中心（XZ 世界坐标；Vec2 = x, 世界 z） */
  center: Vec2;
  /** 足迹尺寸（米；model 无编辑层足迹 → 2×2 占位框，与 ghost placeholder 2,2,2 先例一致） */
  size: Vec2;
  /** 抬升（缺省统一预览层高，与绘制预览 0.25 一致） */
  elevation?: number;
}

export interface FootprintGhostPort {
  /** 显示一组足迹框（整组替换） */
  showFootprints(footprints: readonly FootprintGhost[]): void;
  /** 清除足迹预览 */
  clearFootprints(): void;
}

// ── 阶段 10 测量覆盖层（T10.1，定义在分域契约 contracts/stage10-measure.md §B）──

/** 测量草稿（进行中测量）：已固定点 + 游标弹性段端点 */
export interface MeasureDraft {
  kind: MeasureKind;
  /** 已固定点（世界坐标） */
  points: Vec3[];
  /** 游标弹性段端点（无有效拾取时 null） */
  cursor: Vec3 | null;
}

/**
 * 测量覆盖层 Port（runtime 实现 MeasureOverlay，app 注入；模式沿 PreviewPort 先例）：
 * 草稿与已提交测量项的整组替换呈现——「可见但不入历史」（会话态四不变式之渲染侧）。
 */
export interface MeasurePort {
  /** 草稿整组替换（null = 清草稿）；弹性段 = points 末点→cursor 连线（area 为闭合环+cursor） */
  updateDraft(draft: MeasureDraft | null): void;
  /** 已提交测量项整组替换（空数组 = 隐藏已提交层；草稿不受影响） */
  updateMeasurements(items: readonly MeasureItem[]): void;
  /** 清全部（草稿 + 已提交；模式退出/清除全部用） */
  clear(): void;
}
