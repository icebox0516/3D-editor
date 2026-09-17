/**
 * ui/layout/workspaceStore —— 四区一层布局工作区状态（T5.1）。
 *
 * 职责：面板区尺寸（左/右列宽、底部行高，写入一律经钳制表）、区域级隐藏
 *      （hiddenPanels：该列/行宽高归零，视口 1fr 自动扩展不留空白，需求 §四）、
 *      面板分区折叠（collapsedSections 按分区键记账，PanelFrame 折叠收成标题条；
 *      Inspector 折叠分组同表记账，键 inspector.<section>，T5.4）、Inspector 标签态
 *      （inspectorTab：跨选变化保持 + 「设置」action 跳转目标，T5.4）、Content Browser
 *      双态/分类/搜索（browser：展开位联动底部行高，写入经钳制入口，T5.5）、
 *      applyLayout 一次性应用布局快照（T7.3：预设 / 个人布局 / 持久化恢复共用入口）
 *      与 resetLayout 复位。纯函数（钳制 / 占比）独立导出供 node 测试。
 * 边界：ui 层布局状态，与编辑器数据无关——不触碰 EditorFacade / EventBus /
 *      SceneManager；面板内容组件只读订阅，装配层（App）负责接线到 CSS Grid。
 *      T7.3 起布局字段 + mode 随 t3d-editor.workspace 快照持久化（见
 *      layout/layoutPresets + layout/workspacePersistence），本 store 仍为内存唯一真相源。
 */
import { create } from 'zustand';
import type { WorkModeId } from '../tools/toolIA';
import type { LayoutFields } from './layoutPresets';

/** 可调尺寸的面板区（隐藏粒度与此一致） */
export type PanelZone = 'left' | 'right' | 'bottom';

/** 区域尺寸钳制表条目 */
export interface PanelSizeSpec {
  min: number;
  max: number;
  default: number;
}

/**
 * 区域尺寸钳制表（需求 §四「默认空间比例」，docs/archive/plan-phase1/archive/ui升级.md）：
 * 左 180–420 默认 260 / 右 240–480 默认 320 / 底 60–320 默认 60（紧凑 = 下界）。
 */
export const PANEL_SIZE_SPECS: Readonly<Record<PanelZone, PanelSizeSpec>> = {
  left: { min: 180, max: 420, default: 260 },
  right: { min: 240, max: 480, default: 320 },
  bottom: { min: 60, max: 320, default: 60 },
};

/** 左侧垂直工具条常驻宽（需求 §四：48–56 固定，取 48；本任务空占位） */
export const VTOOL_W = 48;

/** Content Browser 展开目标高（T5.5；在底部钳制域 60–320 内，双态切换与 Splitter 共用钳制入口） */
export const BROWSER_EXPANDED_H = 280;

/** 尺寸写入钳制（Splitter 拖拽 / 键盘步进的唯一入口，越界一律折回表内） */
export function clampPanelSize(zone: PanelZone, px: number): number {
  const spec = PANEL_SIZE_SPECS[zone];
  return Math.min(spec.max, Math.max(spec.min, px));
}

/** 区域级隐藏记账（true = 该列/行收起归零） */
export interface HiddenPanels {
  left: boolean;
  right: boolean;
  bottom: boolean;
}

/** Inspector 三标签 id（T5.4 三标签化：对象属性 / 环境设置 / 全局设置） */
export type InspectorTabId = 'object' | 'environment' | 'settings';

/** Content Browser 状态（T5.5）：双态位 + 分类筛选 + 搜索关键词（分类哨兵值见 panels/browserModel） */
export interface BrowserPanelState {
  /** 展开位（true = 280px 展开态；false = 60px 紧凑态。行高另可被 Splitter 独立拖动） */
  expanded: boolean;
  /** 分类筛选：'all'（全部）/ '__favorites__'（收藏）/ 具体 slug（panels/browserModel 哨兵） */
  category: string;
  /** 搜索关键词（命中 name/tags；空白 = 不过滤） */
  search: string;
}

/** viewportShare 入参（与 store 字段同形，便于直接传切片） */
export interface ViewportSharePanels {
  leftWidth: number;
  rightWidth: number;
  hiddenPanels: HiddenPanels;
}

/**
 * 视口水平占比 = 视口列宽 / 窗口宽（自检函数，需求 §四/§43.1）：
 * 1920×1080 默认布局 ≈ (1920−48−260−320)/1920 ≈ 67% ≥ 65%；左右全隐藏 ≈ 97% ≥ 90%。
 * 越界宽度按钳制表折算（占比对拖拽中间态稳健）；窗口过窄时截在 [0,1]。
 * viewH 为签名预留（面积口径 / HUD 归后续任务），当前口径为宽度。
 */
export function viewportShare(viewW: number, viewH: number, panels: ViewportSharePanels): number {
  void viewH;
  const left = panels.hiddenPanels.left ? 0 : clampPanelSize('left', panels.leftWidth);
  const right = panels.hiddenPanels.right ? 0 : clampPanelSize('right', panels.rightWidth);
  const share = (viewW - VTOOL_W - left - right) / viewW;
  return Math.min(1, Math.max(0, share));
}

export interface WorkspaceState {
  /** 左面板列宽（px，钳制表内） */
  leftWidth: number;
  /** 右面板列宽（px，钳制表内） */
  rightWidth: number;
  /** 底部浏览器行高（px，钳制表内；60 = 紧凑） */
  bottomHeight: number;
  /** 区域级隐藏（列/行宽高归零） */
  hiddenPanels: HiddenPanels;
  /** 分区折叠记账（键建议「区域.面板」，如 'left.scene'；仅保留折叠中的键） */
  collapsedSections: Record<string, boolean>;
  /** Inspector 当前标签（跨选变化保持；「设置」action / 菜单跳转目标，T5.4） */
  inspectorTab: InspectorTabId;
  /** Content Browser 双态/分类/搜索（T5.5） */
  browser: BrowserPanelState;
  /**
   * 显式工作模式（T7.1：六模式 UE 式聚焦体系；默认 scene）。
   * 显示模式 = combineMode(mode, activeToolId, drawTarget)——绘制/放置激活期间
   * 临时切派生态，退出恢复显式模式。**随布局快照持久化**（t3d-editor.workspace，
   * T7.3 落地；反序列化经 MODES enabled 校验——analysis 不可恢复落 scene；measure T10.2 转正可恢复）。
   * 工作态非布局态：resetLayout 不复位本字段（T7.1 裁定）；预设/个人布局不含本字段——
   * 唯一例外「恢复默认」动作 = default 预设 + setMode('scene')（T7.3 门裁定）。
   * 切换入口统一走 toolIA.activateWorkMode（含绘制/放置工具 cancel 语义）——
   * 选择器 / Alt+1..6 / 视图菜单三路同源。
   */
  mode: WorkModeId;

  /**
   * 纯三维工作模式（T7.4，需求 14 章：Tab 进入/退出）：隐藏三大面板区 + 垂直工具条 +
   * 上下文条 + 状态栏，仅留顶栏菜单条 + 视口 HUD + 底部基础操作提示（App 装配层经
   * zone 变量覆写消费）。工作态非布局态（沿 T7.1 mode 裁定）：applyLayout / resetLayout
   * 均不触碰本字段；**不进 WorkspaceSnapshot**（serialize 显式字段平铺天然不含，
   * 守护测试见 tests/ui/layout/workspacePersistence.test.ts）——刷新后回到非纯三维。
   * 切换入口统一走 toolIA.togglePure3d（含绘制/放置/顶点编辑 cancel 语义）——
   * Tab 键 / 视图菜单三路同源。
   */
  pure3d: boolean;

  /**
   * 小地图显示开关（T7.7，需求 §12.4：右下角园区导航小地图，默认弱存在感可开关）。
   * UI 偏好非布局字段：applyLayout / resetLayout 不触碰（沿 mode/pure3d 裁定）；
   * **随 t3d-editor.workspace 快照持久化**（T7.7 增补字段，缺省 true=显示）。
   * 开关入口 = 视口 HUD 齿轮 Viewport Options「小地图」项；生效经 App 装配层
   * 调用组合根 EditorHandle.setMinimapVisible（ui 层零 runtime 导入）。
   */
  minimapVisible: boolean;

  /** 一次性应用布局字段快照（T7.3：预设/个人布局/持久化恢复共用；等价逐字段 set，尺寸经钳制入口；mode 不在参数内） */
  applyLayout(layout: LayoutFields): void;

  /** 写入区域尺寸（钳制后生效） */
  setPanelSize(zone: PanelZone, px: number): void;
  /** 切换区域隐藏 */
  togglePanelHidden(zone: PanelZone): void;
  /** 幂等设置区域隐藏（工具条开关 / 面板组隐藏按钮共用） */
  setPanelHidden(zone: PanelZone, hidden: boolean): void;
  /** 切换分区折叠 */
  toggleCollapsed(sectionKey: string): void;
  /** 设置 Inspector 标签（TabStrip 受控切换 / action 跳转共用） */
  setInspectorTab(tab: InspectorTabId): void;
  /** 切换 Content Browser 双态（展开 = 行高 280 / 收起 = 行高 60，均经钳制入口；筛选与搜索保持） */
  setBrowserExpanded(expanded: boolean): void;
  /** 设置分类筛选（紧凑态点芯片 = 选分类并展开，展开动作由组件一并调用） */
  setBrowserCategory(category: string): void;
  /** 设置搜索关键词 */
  setBrowserSearch(query: string): void;
  /** 设置显式工作模式（薄记账入口；带 cancel 语义的切换走 toolIA.activateWorkMode） */
  setMode(mode: WorkModeId): void;
  /** 设置纯三维模式（薄记账入口，幂等；带 cancel 语义的切换走 toolIA.togglePure3d，T7.4） */
  setPure3d(pure3d: boolean): void;
  /** 设置小地图显示（薄记账入口，幂等；T7.7 持久化随快照写回） */
  setMinimapVisible(visible: boolean): void;
  /** 复位全部布局默认（工作模式与纯三维为工作态，不复位——T7.1/T7.4 裁定） */
  resetLayout(): void;
}

const INITIAL = {
  leftWidth: PANEL_SIZE_SPECS.left.default,
  rightWidth: PANEL_SIZE_SPECS.right.default,
  bottomHeight: PANEL_SIZE_SPECS.bottom.default,
  hiddenPanels: { left: false, right: false, bottom: false } as HiddenPanels,
  collapsedSections: {} as Record<string, boolean>,
  inspectorTab: 'object' as InspectorTabId,
  browser: { expanded: false, category: 'all', search: '' } as BrowserPanelState,
  mode: 'scene' as WorkModeId,
  pure3d: false,
  minimapVisible: true,
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  ...INITIAL,

  setPanelSize(zone, px) {
    const value = clampPanelSize(zone, px);
    if (zone === 'left') set({ leftWidth: value });
    else if (zone === 'right') set({ rightWidth: value });
    else set({ bottomHeight: value });
  },

  togglePanelHidden(zone) {
    set((s) => ({ hiddenPanels: { ...s.hiddenPanels, [zone]: !s.hiddenPanels[zone] } }));
  },

  setPanelHidden(zone, hidden) {
    set((s) =>
      s.hiddenPanels[zone] === hidden ? s : { hiddenPanels: { ...s.hiddenPanels, [zone]: hidden } },
    );
  },

  toggleCollapsed(sectionKey) {
    set((s) => {
      const collapsedSections = { ...s.collapsedSections };
      if (collapsedSections[sectionKey]) delete collapsedSections[sectionKey];
      else collapsedSections[sectionKey] = true;
      return { collapsedSections };
    });
  },

  setInspectorTab(tab) {
    set((s) => (s.inspectorTab === tab ? s : { inspectorTab: tab }));
  },

  setBrowserExpanded(expanded) {
    // 双态切换与 Splitter 拖拽共用钳制入口（T5.5）：展开 → 280 / 收起 → 紧凑下界 60
    set((s) => ({
      browser: { ...s.browser, expanded },
      bottomHeight: clampPanelSize('bottom', expanded ? BROWSER_EXPANDED_H : PANEL_SIZE_SPECS.bottom.min),
    }));
  },

  setBrowserCategory(category) {
    set((s) => (s.browser.category === category ? s : { browser: { ...s.browser, category } }));
  },

  setBrowserSearch(query) {
    set((s) => (s.browser.search === query ? s : { browser: { ...s.browser, search: query } }));
  },

  setMode(mode) {
    set((s) => (s.mode === mode ? s : { mode }));
  },

  setPure3d(pure3d) {
    set((s) => (s.pure3d === pure3d ? s : { pure3d }));
  },

  setMinimapVisible(visible) {
    set((s) => (s.minimapVisible === visible ? s : { minimapVisible: visible }));
  },

  applyLayout(layout) {
    // 深拷贝入参（预设表/反序列化产物不与 store 共享引用）+ 尺寸过钳制入口
    set({
      leftWidth: clampPanelSize('left', layout.leftWidth),
      rightWidth: clampPanelSize('right', layout.rightWidth),
      bottomHeight: clampPanelSize('bottom', layout.bottomHeight),
      hiddenPanels: { ...layout.hiddenPanels },
      collapsedSections: { ...layout.collapsedSections },
      inspectorTab: layout.inspectorTab,
      browser: { ...layout.browser },
    });
  },

  resetLayout() {
    set({
      leftWidth: INITIAL.leftWidth,
      rightWidth: INITIAL.rightWidth,
      bottomHeight: INITIAL.bottomHeight,
      hiddenPanels: { ...INITIAL.hiddenPanels },
      collapsedSections: {},
      inspectorTab: INITIAL.inspectorTab,
      browser: { ...INITIAL.browser },
    });
  },
}));
