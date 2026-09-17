/**
 * ui/store —— zustand 状态桥（EventBus → React 可订阅状态）。
 *
 * 职责：把编辑器事件（selection:changed / history:changed / tool:changed / scene:changed /
 *      draw:status）映射为 React 组件可订阅的最小状态：selectedIds、canUndo/canRedo、
 *      activeToolId、sceneVersion（每次场景变更递增，面板据此重读 facade.scene）、
 *      drawStatus（T3.3 绘制状态栏载荷）、measureStatus/measureCount（T10.2 测量读数
 *      与会话计数——measure:status / measure:changed 桥接，「删除上一条/清除全部」
 *      可用态与状态栏测量读数段的数据源）、drawTarget（绘制选择记账，T5.6 起由垂直
 *      工具条 / Context Toolbar 切换器 / OutlinerPanel 创建菜单写入）与 gizmoMode
 *      （T5.6 变换模式记账，键盘与点击经共享激活入口写入）；T5.7 增 cursorPos
 *      （游标地面坐标，视口节流写入）、cameraMode（机位会话记账，setMode 各入口写回）
 *      与 session（组合根注入的视口会话服务——HUD/状态栏读数与环境/网格配置通道）；
 *      T5.8 增 contextMenu（右键点按/大纲行/资产卡片的上下文菜单目标态，开闭经
 *      openContextMenu/closeContextMenu，呈现归 ContextMenu 组件）；
 *      并持有 EditorFacade 引用与组合根注入的服务 Port（camera，供场景树「定位」、
 *      视图按钮等非数据操作）。
 * 边界：ui 层只依赖 core/editor（分层 DAG：禁止 runtime/io）；不缓存场景对象本体
 *      （SceneManager 是唯一数据源，组件按 sceneVersion 重读），不直接操作 THREE。
 *      命令驱动的一次修改会触发两次 scene:changed（SceneManager + Command 归因）——
 *      版本号递增天然幂等，多一次重渲染无害。
 */
import { create } from 'zustand';
import type { EventBus } from '../core/events/EventBus';
import type { DrawStatusPayload, MeasureStatusPayload } from '../core/events/events';
import type { ID, Vec3 } from '../core/types';
import type { SemanticType, ShapeType } from '../domain/regions';
import type { SceneEnvironment, SceneGrid } from '../scene/SceneData';
import type { EditorFacade } from '../editor/EditorFacade';
import type { CameraPort, FootprintGhostPort } from '../editor/services/ports';
import type { GizmoMode } from './tools/toolIA';

/**
 * 测量会话最小结构（EditorHandle.measure 的结构子集；app 装配时注入 MeasureSession
 * 单例——T10.2「删除上一条 / 清除全部」按钮的调用端口，沿 camera/session 先例，
 * 避免 ui→app 导入；会话生命周期归组合根，切模式/切工具均不清空）。
 */
export interface MeasureSessionPort {
  removeLast(): boolean;
  clear(): void;
}

/** 组合根注入的服务 Port（App 层装配；面板经 store 取用，不经 props 逐层透传） */
export interface EditorStoreServices {
  camera?: CameraPort;
  /**
   * 视口会话服务（T5.7）：组合根注入 EditorHandle 结构超集——ui 层以最小结构类型
   * 声明依赖（沿 camera: CameraPort 先例），避免 ui→app 导入（分层 DAG 禁止）。
   * HUD/状态栏经此读场景名 / 运行指标 / 环境与网格配置、解析地面投影。
   */
  session?: ViewportSessionServices;
  /**
   * 足迹幽灵预览（T7.6）：对齐弹层 hover / 阵列 popover 实时参数的目标位置足迹框
   * （App 装配时注入 EditorHandle.footprintGhost——runtime PreviewManager 实现）。
   */
  footprintGhost?: FootprintGhostPort;
  /** 测量会话（T10.2）：删除上一条 / 清除全部的动作端口（EditorHandle.measure） */
  measure?: MeasureSessionPort;
}

/**
 * 视口会话服务最小结构（EditorHandle 的结构子集；app 装配时整柄注入）：
 * 渲染模式与环境/网格走 setEnvironment/setGrid 通道（零契约变更），读取均为幂等快照。
 */
export interface ViewportSessionServices {
  groundPoint(x: number, y: number): Vec3 | null;
  getViewportStats(): { fps: number; triangles: number; drawCalls: number };
  getSceneName(): string;
  getEnvironment(): SceneEnvironment;
  setEnvironment(env: SceneEnvironment): void;
  getGrid(): SceneGrid;
  setGrid(grid: SceneGrid): void;
}

/** 相机机位（CameraPort.getMode 同形；无事件通道，store 记账保证菜单/HUD checked 同源） */
export type CameraModeId = 'perspective' | 'top' | 'front' | 'side';

/**
 * 上下文菜单目标（T5.8）：右键点按视口（App 命中判定后写入）/ 大纲行 / 资产卡片。
 * 坐标为 client CSS 像素（与 InputController.onContextMenuRequest / DOM onContextMenu 同一坐标系）；
 * 视口命中的对象在大纲外选中已由打开方归一（右键目标进选中集，菜单动作作用于选中集）。
 */
export type ContextMenuTarget =
  | { source: 'viewport-object'; x: number; y: number; objectId: ID }
  | { source: 'viewport-blank'; x: number; y: number }
  | { source: 'outliner-row'; x: number; y: number; objectId: ID }
  | { source: 'asset-card'; x: number; y: number; assetId: ID };

/** 绘制目标（T6.5 形状驱动：垂直条 / 数字键 / 创建菜单经共享入口记账；
 *  供绘制中段显示当前形状与再次进入时重激活对应工具） */
export interface DrawTarget {
  shapeType: ShapeType;
}

/** 形状驱动三步流快选可用的选中对象快照（RegionQuickApply 数据源；
 *  面板按 sceneVersion 重读门面，此结构仅承载「是否展示」的派生输入） */
export interface QuickApplyTarget {
  objectId: ID;
  shapeType: ShapeType;
  semanticType: SemanticType;
}

export interface EditorStoreState {
  /** 已绑定的编辑器门面（未绑定为 null） */
  facade: EditorFacade | null;
  /** 相机 Port（未注入为 null；场景树定位 / 聚焦接线） */
  camera: CameraPort | null;
  selectedIds: ID[];
  canUndo: boolean;
  canRedo: boolean;
  activeToolId: string | null;
  /** 放置模式当前资产（UI 记账；tool:changed 为非放置工具时自动清空） */
  placingAssetId: ID | null;
  /** 最近一次绘制状态载荷（draw:status → 状态栏；空载荷 {} 复位显示） */
  drawStatus: DrawStatusPayload | null;
  /** 最近一次测量读数载荷（measure:status → 状态栏测量段；仅含 kind 的复位载荷清段） */
  measureStatus: MeasureStatusPayload | null;
  /** 测量会话条目数（measure:changed{count} → 「删除上一条 / 清除全部」可用态） */
  measureCount: number;
  /** 测量会话端口（T10.2 删除上一条 / 清除全部动作；未注入为 null） */
  measure: MeasureSessionPort | null;
  /** 最近一次绘制选择（数字键 / 垂直条 / 创建菜单写入；工具切走不清空，供重入与中段显示） */
  drawTarget: DrawTarget | null;
  /** 区域组记忆子工具（T6.5：键 1 / 区域主钮激活上次使用的面类形状；缺省多边形） */
  lastAreaShape: ShapeType;
  /** 最近一次放置的资产 id（T6.5 资产组入口：键 4 / 垂直条重放；placingAssetId 随工具
   *  切换清空，此字段跨工具保留） */
  lastAssetId: ID | null;
  /** 最近一次激活的 Gizmo 变换模式（T5.6：键盘 W/E/R 与 Context Toolbar 三钮经共享
   *  入口 activateTransformTool 写入，保证激活态与最后激活模式一致；缺省 translate） */
  gizmoMode: GizmoMode;
  /** 视口会话服务（T5.7：HUD/状态栏读数与配置通道；未注入为 null） */
  session: ViewportSessionServices | null;
  /** 足迹幽灵预览（T7.6 对齐/阵列目标位置预览；未注入为 null） */
  footprintGhost: FootprintGhostPort | null;
  /** 游标地面坐标（视口 pointermove 30ms 节流 → session.groundPoint；离开画布清空） */
  cursorPos: Vec3 | null;
  /** 当前相机机位（无事件通道的会话记账：setMode 各入口写回，菜单/HUD checked 同源） */
  cameraMode: CameraModeId;
  /** 打开中的上下文菜单（T5.8；null = 关闭） */
  contextMenu: ContextMenuTarget | null;
  /** 场景版本号：任意 scene:changed 递增，面板据此重读门面 */
  sceneVersion: number;

  /** 绑定门面与事件总线（先按当前状态初始同步）；返回解绑函数（等价 detach） */
  attach(facade: EditorFacade, eventBus: EventBus, services?: EditorStoreServices): () => void;
  /** 解绑：退订全部事件并复位状态 */
  detach(): void;
  setPlacingAssetId(id: ID | null): void;
  setDrawTarget(target: DrawTarget | null): void;
  /** 区域组子工具记忆（切换面类形状时写入） */
  setLastAreaShape(shape: ShapeType): void;
  /** 资产组重放记忆（放置资产时写入，跨工具保留） */
  setLastAssetId(id: ID | null): void;
  setGizmoMode(mode: GizmoMode): void;
  setCursorPos(pos: Vec3 | null): void;
  setCameraMode(mode: CameraModeId): void;
  /** 打开上下文菜单（右键点按 / 大纲行 / 资产卡片） */
  openContextMenu(target: ContextMenuTarget): void;
  /** 关闭上下文菜单 */
  closeContextMenu(): void;
}

const PLACEMENT_TOOL_ID = 'placement';

/** 当前生效的退订函数（模块级单例：同一时刻只绑定一个编辑器实例） */
let unsubscribe: (() => void) | null = null;

const INITIAL = {
  facade: null,
  camera: null as CameraPort | null,
  session: null as ViewportSessionServices | null,
  footprintGhost: null as FootprintGhostPort | null,
  selectedIds: [] as ID[],
  canUndo: false,
  canRedo: false,
  activeToolId: null,
  placingAssetId: null,
  drawStatus: null,
  measureStatus: null,
  measureCount: 0,
  measure: null as MeasureSessionPort | null,
  drawTarget: null,
  lastAreaShape: 'polygon' as ShapeType,
  lastAssetId: null as ID | null,
  gizmoMode: 'translate' as GizmoMode,
  cursorPos: null as Vec3 | null,
  cameraMode: 'perspective' as CameraModeId,
  contextMenu: null as ContextMenuTarget | null,
  sceneVersion: 0,
};

export const useEditorStore = create<EditorStoreState>((set, get) => ({
  ...INITIAL,

  attach(facade, eventBus, services) {
    get().detach();
    set({
      facade,
      camera: services?.camera ?? null,
      session: services?.session ?? null,
      footprintGhost: services?.footprintGhost ?? null,
      measure: services?.measure ?? null,
      selectedIds: facade.selection.getSelectedIds(),
      canUndo: facade.history.canUndo(),
      canRedo: facade.history.canRedo(),
      activeToolId: facade.tools.getActiveTool()?.id ?? null,
      placingAssetId: null,
      drawStatus: null,
      measureStatus: null,
      measureCount: 0,
      drawTarget: null,
      lastAreaShape: 'polygon',
      lastAssetId: null,
      gizmoMode: 'translate',
      cursorPos: null,
      cameraMode: services?.camera?.getMode() ?? 'perspective',
      contextMenu: null,
    });
    const offs = [
      eventBus.on('selection:changed', (p) => set({ selectedIds: [...p.selectedIds] })),
      eventBus.on('history:changed', (p) => set({ canUndo: p.canUndo, canRedo: p.canRedo })),
      eventBus.on('tool:changed', (p) =>
        set((s) => ({
          activeToolId: p.toolId,
          placingAssetId: p.toolId === PLACEMENT_TOOL_ID ? s.placingAssetId : null,
        })),
      ),
      eventBus.on('scene:changed', () => set((s) => ({ sceneVersion: s.sceneVersion + 1 }))),
      // 绘制状态栏：载荷直存（渲染分节在 StatusBar；空载荷 {} = 复位显示）
      eventBus.on('draw:status', (p) => set({ drawStatus: { ...p } })),
      // 测量读数段（T10.2）：载荷直存（分节归 describeMeasureStatus；
      // 仅含 kind 的复位载荷 = 清段）；会话增删清 → 计数（按钮可用态）
      eventBus.on('measure:status', (p) => set({ measureStatus: { ...p } })),
      eventBus.on('measure:changed', (p) => set({ measureCount: p.count })),
    ];
    unsubscribe = () => {
      for (const off of offs) off();
    };
    return () => get().detach();
  },

  detach() {
    unsubscribe?.();
    unsubscribe = null;
    set({ ...INITIAL, sceneVersion: get().sceneVersion });
  },

  setPlacingAssetId(id) {
    set({ placingAssetId: id });
  },

  setDrawTarget(target) {
    set({ drawTarget: target });
  },

  setLastAreaShape(shape) {
    set({ lastAreaShape: shape });
  },

  setLastAssetId(id) {
    set({ lastAssetId: id });
  },

  setGizmoMode(mode) {
    set({ gizmoMode: mode });
  },

  setCursorPos(pos) {
    set({ cursorPos: pos });
  },

  setCameraMode(mode) {
    set({ cameraMode: mode });
  },

  openContextMenu(target) {
    set({ contextMenu: target });
  },

  closeContextMenu() {
    set({ contextMenu: null });
  },
}));
