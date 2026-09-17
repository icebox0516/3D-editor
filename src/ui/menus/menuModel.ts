/**
 * ui/menus/menuModel —— 主菜单模型（T5.2，纯数据 + 纯函数，node 可测）。
 *
 * 职责：七菜单（文件/编辑/场景/资产/工具/视图/帮助）的菜单项清单、enabled 矩阵与
 *      checked 位全部由 buildMenus(state) 纯函数推导；菜单组件（MenuBar）只做呈现
 *      与键盘交互，点击项只发 actionId 回调（onAction），不感知 io / 门面。
 *      actionId 为稳定点分字符串（'file.save' / 'edit.undo' / 'view.panel-left'…），
 *      是 T5.6（快捷键注册）与 T5.8（右键菜单）复用的轻量契约——一经定义不得改名，
 *      只可追加（全清单快照见 tests/ui/menus/menuModel.test.ts）。
 * 约定：disabled 项可见不隐藏（需求 §39「新功能准入」精神），组件层统一 tooltip
 *      「后续版本提供」；快捷键键帽只标注当前真实生效的组合——工具类键位（Q/1–4/
 *      ⇧1–5/G/W·E·R）自 ui/tools/toolIA 键表派生（T5.6 起与 input.ts 路由同源，
 *      单一真相源；T6.5 形状驱动键表），编辑类行为（Ctrl 系等）为静态登记。
 * 边界：ui 层零 runtime / io 导入；SaveState 类型来自本层 saveStatus。
 */
import type { SaveState } from '../saveStatus';
import {
  ALT_MODE_ORDER,
  AREA_SUBTOOLS,
  KEY_TO_TRANSFORM_MODE,
  MEASURE_SUBTOOLS,
  MODES,
  SELECT_KEY,
  SNAP_KEY,
  VERTICAL_TOOLS,
} from '../tools/toolIA';
import type { WorkModeId } from '../tools/toolIA';

/** 七个主菜单 id（顺序即呈现顺序） */
export type MenuId = 'file' | 'edit' | 'scene' | 'asset' | 'tool' | 'view' | 'help';

/** 菜单项定义（可点条目；actionId 即回调协议） */
export interface MenuItemDef {
  /** 稳定点分 action id（轻量契约，T5.6/T5.8 复用） */
  id: string;
  label: string;
  /** 键帽提示（只标注当前真实生效的组合；缺省不显示） */
  shortcut?: string;
  enabled: boolean;
  /** 勾选态（开关 / 单选组当前位） */
  checked?: boolean;
  /** 破坏性操作（删除等，视觉警示） */
  danger?: boolean;
}

/** 分隔线（不可聚焦不占 actionId） */
export interface MenuSeparatorDef {
  separator: true;
}

/**
 * 子菜单（T7.1「视图 → 工作模式」）：父项展开子弹层，子项为常规条目。
 * 父项 id 为稳定点分 id（不派发——点击/Enter 语义 = 展开子菜单）。
 * T8.2 起 items 放宽为 MenuEntry[]（「新建场景 ▾」需 separator 分区：空场景 /
 * 内置模板 / 用户模板 / 管理项四区；分区仅 separator 无 header 行——子菜单无
 * header 先例；组件层 SubmenuRow 渲染与键盘导航跳过 separator）。
 */
export interface MenuSubmenuDef {
  submenu: true;
  id: string;
  label: string;
  enabled: boolean;
  items: MenuEntry[];
}

/** 菜单条目 = 可点项 | 分隔线 | 子菜单 */
export type MenuEntry = MenuItemDef | MenuSeparatorDef | MenuSubmenuDef;

/** 一个顶层菜单 */
export interface Menu {
  id: MenuId;
  label: string;
  items: MenuEntry[];
}

/**
 * 视口渲染模式（T5.7 生效：环境通道 environment.renderMode，字面量与 scene 层
 * ViewportRenderMode 同集；T8.4 扩六态——诊断三档 clay/normals/islands 会话级，
 * 保存时由组合根剥离 renderMode 键，不入场景文件）。
 */
export type RenderMode = 'shaded' | 'wireframe' | 'xray' | 'clay' | 'normals' | 'islands';

/** 相机机位（CameraPort.getMode 同形） */
export type CameraMode = 'perspective' | 'top' | 'front' | 'side';

/**
 * 场景模板清单条目（T8.2「新建场景 ▾」子菜单数据源；App 装配层组装 =
 * 内置模板清单 + io/templates userTemplates 清单——ui 不 import io，载荷中转）。
 */
export interface TemplateSummary {
  id: string;
  name: string;
  builtin: boolean;
}

/** buildMenus 的状态输入（App 装配层从各 store 汇总） */
export interface MenuState {
  /** 门面已装配（未装配时一切门面动作禁用） */
  ready: boolean;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  /** 内部剪贴板有内容（EditorActionsCore.subscribe 驱动） */
  hasClipboard: boolean;
  /** 有未保存修改（保存状态机派生） */
  dirty: boolean;
  saveState: SaveState;
  /** 三区面板显隐（workspaceStore.hiddenPanels） */
  panelsHidden: { left: boolean; right: boolean; bottom: boolean };
  cameraMode: CameraMode;
  renderMode: RenderMode;
  /** 环境网格可见（environment.grid.visible） */
  gridVisible: boolean;
  /** 吸附总开关（T8.1：snapTiers.masterEnabled——off 压下全部吸附分项，与 Context Toolbar 吸附钮同源） */
  snapEnabled: boolean;
  /** README.md 可达（HEAD 探测；不可达时操作说明禁用） */
  readmeAvailable: boolean;
  /** 当前显式工作模式（T7.1：视图菜单模式子菜单 checked 位；workspaceStore.mode） */
  workMode: WorkModeId;
  /** 纯三维工作模式（T7.4：视图菜单 checked 位；workspaceStore.pure3d） */
  pure3d: boolean;
  /** 园区导航小地图显示开关（T7.7：视图菜单 checked 位；workspaceStore.minimapVisible） */
  minimapVisible: boolean;
  /** 当前激活工具 id（T10.2：「工具 → 测量」子菜单 checked 位与激活测量工具同源） */
  activeToolId: string | null;
  /** 场景模板清单（T8.2「新建场景 ▾」：内置在前、用户在后；空用户区显占位行） */
  templates: TemplateSummary[];
}

/** 占位项统一构造（恒禁用） */
function placeholder(id: string, label: string): MenuItemDef {
  return { id, label, enabled: false };
}

/** 便捷项构造（enabled 由调用处给出，其余可选） */
function item(id: string, label: string, extra: Partial<MenuItemDef> = {}): MenuItemDef {
  return { id, label, enabled: true, ...extra };
}

const sep: MenuSeparatorDef = { separator: true };

/**
 * 「新建场景 ▾」子菜单（T8.2）：空场景（= 实例化内置「空园区」模板）｜内置模板区｜
 * 用户模板区（空时 disabled 占位行，沿 placeholder 惯例可见不隐藏）｜管理入口，
 * 四区以 separator 分区（无 header 行）。
 */
function newSceneSubmenu(ready: boolean, templates: readonly TemplateSummary[]): MenuSubmenuDef {
  const builtin = templates.filter((t) => t.builtin);
  const user = templates.filter((t) => !t.builtin);
  const userItems: MenuEntry[] =
    user.length > 0
      ? user.map((t) => item(`file.new-from-${t.id}`, t.name, { enabled: ready }))
      : [placeholder('file.no-user-templates', '暂无用户模板——用「另存为模板…」创建')];
  return {
    submenu: true,
    id: 'file.new',
    label: '新建场景',
    enabled: ready,
    items: [
      item('file.new-empty', '空场景', { enabled: ready }),
      sep,
      ...builtin.map((t) => item(`file.new-from-${t.id}`, t.name, { enabled: ready })),
      sep,
      ...userItems,
      sep,
      item('file.manage-templates', '管理模板…', { enabled: ready }),
    ],
  };
}

/**
 * 构建七菜单（纯函数）。
 * enabled 规则：
 * - 门面动作（文件/编辑有效项/吸附/视角/网格/面板）要求 ready；
 * - 撤销/重做 ← canUndo / canRedo；复制/删除/取消选择 ← hasSelection；粘贴 ← hasClipboard；
 * - 保存三兄弟在 saveState === 'saving' 时禁用（防重入）；
 * - help.shortcuts / help.about 为纯 UI 弹层，不依赖门面；
 * - 禁用占位项（P1/P2 功能）恒 false，可见不隐藏；渲染模式三项 T5.7 起随 ready 启用。
 */
export function buildMenus(state: MenuState): Menu[] {
  const ready = state.ready;
  const notSaving = state.saveState !== 'saving';

  return [
    {
      id: 'file',
      label: '文件',
      items: [
        // T8.2：可点「新建场景」→ 子菜单（空场景 / 内置模板 / 用户模板 / 管理入口）
        newSceneSubmenu(ready, state.templates),
        item('file.open', '打开…', { enabled: ready }),
        item('file.save', '保存', { enabled: ready && notSaving }),
        item('file.save-as', '另存为…', { enabled: ready && notSaving }),
        // T8.2：另存为模板（当前场景快照存 localStorage，同一分隔组内紧跟「另存为…」）
        item('file.save-as-template', '另存为模板…', { enabled: ready }),
        sep,
        item('file.import-json', '导入 JSON…', { enabled: ready }),
        item('file.export', '导出场景', { enabled: ready && notSaving }),
        sep,
        // T5.4：右面板 Inspector「全局设置」标签定位（右面板隐藏时恢复显示）
        item('file.scene-settings', '场景设置', { enabled: ready }),
      ],
    },
    {
      id: 'edit',
      label: '编辑',
      items: [
        item('edit.undo', '撤销', {
          enabled: ready && state.canUndo,
          shortcut: 'Ctrl Z',
        }),
        item('edit.redo', '重做', {
          enabled: ready && state.canRedo,
          shortcut: 'Ctrl ⇧ Z',
        }),
        sep,
        placeholder('edit.cut', '剪切'),
        item('edit.copy', '复制', {
          enabled: ready && state.hasSelection,
          shortcut: 'Ctrl C',
        }),
        item('edit.paste', '粘贴', {
          enabled: ready && state.hasClipboard,
          shortcut: 'Ctrl V',
        }),
        item('edit.duplicate', '原地复制', {
          enabled: ready && state.hasSelection,
          shortcut: 'Ctrl D',
        }),
        item('edit.delete', '删除', {
          enabled: ready && state.hasSelection,
          shortcut: 'Delete',
          danger: true,
        }),
        sep,
        item('edit.select-all', '全选', { enabled: ready }),
        item('edit.deselect', '取消选择', { enabled: ready && state.hasSelection }),
        sep,
        placeholder('edit.batch-edit', '批量编辑'),
      ],
    },
    {
      id: 'scene',
      label: '场景',
      items: [
        item('scene.layers', '图层管理', { enabled: ready }),
        placeholder('scene.validate', '场景校验'),
        placeholder('scene.stats', '场景统计'),
        placeholder('scene.switch', '切换场景'),
      ],
    },
    {
      id: 'asset',
      label: '资产',
      items: [
        item('asset.browser', '资产管理', { enabled: ready }),
        placeholder('asset.import-model', '导入模型'),
        placeholder('asset.materials', '素材管理'),
      ],
    },
    {
      id: 'tool',
      label: '工具',
      items: [
        // T10.2：「测量」占位 → 四子工具子菜单（距离/高度差/面积/角度；checked 随激活
        // 测量工具同源；激活经 app 层 toggleMeasureTool——与垂直条/芯片同路）
        {
          submenu: true,
          id: 'tool.measure',
          label: '测量',
          enabled: ready,
          items: MEASURE_SUBTOOLS.map((sub) =>
            item(`tool.measure-${sub.kind}`, sub.label, {
              enabled: ready,
              checked: state.activeToolId === sub.toolId,
            }),
          ),
        },
        placeholder('tool.annotate', '标注'),
        placeholder('tool.align', '对齐'),
        item('tool.snap', '吸附', {
          enabled: ready,
          checked: state.snapEnabled,
        }),
        placeholder('tool.array', '阵列'),
        placeholder('tool.analyze', '分析'),
      ],
    },
    {
      id: 'view',
      label: '视图',
      items: [
        item('view.panel-left', '左面板', {
          enabled: ready,
          checked: !state.panelsHidden.left,
        }),
        item('view.panel-right', '右面板', {
          enabled: ready,
          checked: !state.panelsHidden.right,
        }),
        item('view.panel-bottom', '底部浏览器', {
          enabled: ready,
          checked: !state.panelsHidden.bottom,
        }),
        // T7.4 纯三维模式入口（需求 14 章；与 Tab 键 / HUD 提示三路同源——
        // toolIA.togglePure3d 共享切换：进入时取消激活绘制/放置/顶点编辑工具）
        item('view.pure3d', '纯三维模式', {
          enabled: ready,
          checked: state.pure3d,
          shortcut: 'Tab',
        }),
        sep,
        // T7.1 工作模式子菜单：八项（六启用 + 两禁用灰显），与 Scene ▼ 选择器 /
        // Alt+1..6 快捷键三路同源（toolIA MODES / ALT_MODE_ORDER 单一真相源）
        {
          submenu: true,
          id: 'view.modes',
          label: '工作模式',
          enabled: ready,
          items: MODES.map((mode) => {
            // MODES 呈现序 = 需求 24 章表序 = ALT_MODE_ORDER 键序（位次 i ⇒ Alt+i）；
            // 键帽只标注真实生效组合：六启用模式；7/8 预留位（measure/analysis）不显示
            const altIndex = ALT_MODE_ORDER.indexOf(mode.id);
            return item(`view.mode-${mode.id}`, mode.label, {
              enabled: ready && mode.enabled,
              checked: state.workMode === mode.id,
              ...(mode.enabled && altIndex >= 0 ? { shortcut: `Alt ${altIndex + 1}` } : {}),
            });
          }),
        },
        sep,
        item('view.camera-perspective', '透视', {
          enabled: ready,
          checked: state.cameraMode === 'perspective',
        }),
        item('view.camera-top', '顶', {
          enabled: ready,
          checked: state.cameraMode === 'top',
        }),
        item('view.camera-front', '前', {
          enabled: ready,
          checked: state.cameraMode === 'front',
        }),
        item('view.camera-side', '侧', {
          enabled: ready,
          checked: state.cameraMode === 'side',
        }),
        sep,
        // 渲染模式（T5.7 生效）：环境通道 environment.renderMode（与 HUD Shaded ▼ 同源）
        item('view.render-shaded', '着色', {
          enabled: ready,
          checked: state.renderMode === 'shaded',
        }),
        item('view.render-wireframe', '线框', {
          enabled: ready,
          checked: state.renderMode === 'wireframe',
        }),
        item('view.render-xray', 'X-Ray', {
          enabled: ready,
          checked: state.renderMode === 'xray',
        }),
        // T8.4 诊断三档（组间 separator 分隔，无 header 行——沿子菜单分区先例）：
        // 灰模（Clay）/ 法线（Normals）/ 孤岛高亮（数据卫生档；HUD 同源角标计数）。
        // 会话级视口态——保存场景时剥离 renderMode 键（bootstrap.saveScene）。
        sep,
        item('view.render-clay', '灰模（Clay）', {
          enabled: ready,
          checked: state.renderMode === 'clay',
        }),
        item('view.render-normals', '法线（Normals）', {
          enabled: ready,
          checked: state.renderMode === 'normals',
        }),
        item('view.render-islands', '孤岛高亮', {
          enabled: ready,
          checked: state.renderMode === 'islands',
        }),
        sep,
        item('view.grid', '网格', {
          enabled: ready,
          checked: state.gridVisible,
        }),
        placeholder('view.guides', '辅助线'),
        // T7.7 小地图开关（与齿轮 Viewport Options「小地图」同源——workspaceStore
        // .minimapVisible 记账 + 随工作区快照持久化；App 订阅驱动 runtime 显隐）
        item('view.minimap', '小地图', {
          enabled: ready,
          checked: state.minimapVisible,
        }),
        placeholder('view.workspace', '工作区布局'),
      ],
    },
    {
      id: 'help',
      label: '帮助',
      items: [
        item('help.shortcuts', '快捷键…'),
        item('help.readme', '操作说明', { enabled: state.readmeAvailable }),
        item('help.about', '关于…'),
      ],
    },
  ];
}

/** 收集全部 actionId（顺序保持菜单项序；子菜单父项不派发不收录、子项展开收录——含嵌套子菜单与 separator 跳过；契约快照测试用） */
export function collectActionIds(menus: Menu[]): string[] {
  const ids: string[] = [];
  const pushEntry = (entry: MenuEntry): void => {
    if ('separator' in entry) return;
    if ('submenu' in entry) {
      for (const child of entry.items) pushEntry(child);
      return;
    }
    ids.push(entry.id);
  };
  for (const menu of menus) {
    for (const entry of menu.items) pushEntry(entry);
  }
  return ids;
}

// ── 帮助内容静态数据 ─────────────────────────────────────────

/** 快捷键帮助表条目（keys 为键帽文本；内容整理自 app/input 既有快捷键表） */
export interface ShortcutHelpEntry {
  keys: string;
  label: string;
  /** 分组（全局 / 绘制中 / 变换） */
  group: string;
}

/** 工具键行键帽（自 toolIA 键表派生——与 input.ts 路由同源，单一真相源） */
const WER_KEYS = Object.keys(KEY_TO_TRANSFORM_MODE)
  .map((k) => k.toUpperCase())
  .join(' / ');
const VERTICAL_KEYS = `${VERTICAL_TOOLS[0]!.key}–${VERTICAL_TOOLS[VERTICAL_TOOLS.length - 1]!.key}`;
const AREA_SUB_KEYS = `⇧ ${AREA_SUBTOOLS[0]!.subKey}–${AREA_SUBTOOLS[AREA_SUBTOOLS.length - 1]!.subKey}`;
/** Alt 模式键帽行（toolIA ALT_MODE_ORDER 派生——与 input.ts 路由同源，单一真相源） */
const ALT_MODE_KEYS = `Alt 1–${ALT_MODE_ORDER.filter((m) => m !== null).length}`;

/** 快捷键弹层数据（编辑类行为静态；工具类键位从 toolIA 键表派生，T5.6 起同源；T6.5 形状驱动键表） */
export const SHORTCUT_HELP: readonly ShortcutHelpEntry[] = [
  { keys: 'Ctrl Z', label: '撤销', group: '全局' },
  { keys: 'Ctrl ⇧ Z / Ctrl Y', label: '重做', group: '全局' },
  { keys: 'Ctrl C', label: '复制选中', group: '全局' },
  { keys: 'Ctrl V', label: '粘贴选中', group: '全局' },
  { keys: 'Ctrl D', label: '原地复制（偏移 1 m）', group: '全局' },
  { keys: 'Delete / ⌫', label: '删除选中', group: '全局' },
  { keys: 'F', label: '聚焦选中', group: '全局' },
  { keys: 'Home', label: '全景', group: '全局' },
  { keys: 'End', label: '贴地（选中对象落到下方最近高度层）', group: '全局' },
  { keys: 'Esc', label: '退出当前工具（唯一退出手势；右键=菜单/旋转）', group: '全局' },
  { keys: 'Tab', label: '纯三维模式 进入 / 退出', group: '全局' },
  { keys: SELECT_KEY.toUpperCase(), label: '选择工具', group: '全局' },
  { keys: ALT_MODE_KEYS, label: '工作模式直切（场景/建造/道路/地形/装饰/标注/测量；Alt 8 预留）', group: '全局' },
  { keys: VERTICAL_KEYS, label: '垂直工具条：区域 / 路径 / 点 / 资产（再按退出；1 记忆上次子工具）', group: '全局' },
  { keys: AREA_SUB_KEYS, label: '区域子工具直切：多边形 / 矩形 / 圆形 / 椭圆 / 自由', group: '全局' },
  { keys: 'Ctrl（拖拽中）', label: '临时反转吸附总状态（移动/旋转/顶点编辑拖拽；松开恢复）', group: '全局' },
  { keys: WER_KEYS, label: '移动 / 旋转 / 缩放（变换工具）', group: '变换' },
  { keys: 'Shift', label: '正交锁定（沿主轴）', group: '绘制中' },
  { keys: 'A', label: '45° 角度锁定（绘制 / 顶点编辑）', group: '绘制中' },
  { keys: SNAP_KEY.toUpperCase(), label: '网格吸附开关（本工具会话）', group: '绘制中' },
  { keys: 'Delete / ⌫', label: '测量中：删除上一条测量（有草稿先弃草稿）', group: '绘制中' },
  { keys: '双击 / 松手', label: '完成绘制（线/多边形双击；拖拽与自由形状松手）', group: '绘制中' },
];

/** 关于弹层信息（版本/技术栈硬编码；构建信息归 T7 打包任务） */
export const ABOUT_INFO = {
  product: '园区编辑器',
  version: '0.1.0（阶段 5 · UI 重构）',
  stack: 'React 19 · three.js · zustand · Vite',
  description: '三维园区编辑器——分层架构（core / scene / domain / editor / runtime / io / ui / app）。',
} as const;
