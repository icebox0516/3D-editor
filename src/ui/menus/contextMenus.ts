/**
 * ui/menus/contextMenus —— 四类右键菜单纯模型（T5.8，纯数据 + 纯函数，node 可测）。
 *
 * 职责：buildContextMenu(source, state) 按需求第三十三章推导四类菜单清单——
 *   - viewport-object（视口 pickObject 命中）：复制 / 粘贴 / 删除(danger) / 聚焦(F) /
 *     贴地(End，T8.1) / 隐藏 / 锁定 / 移动至图层 ▾（图层清单）/ 重命名（聚焦 Inspector 名称字段）/
 *     批量重命名…（T8.3 弹层，作用域 = 选中集）；
 *   - viewport-blank（视口空白）：创建对象 ▾（七形状绘制入口，T6.5 新流程——多边形/
 *     矩形/圆形/椭圆/自由/路径/点，同垂直条与创建菜单）/ 视角 ▾ / 渲染模式 ▾ / 网格 /
 *     显示设置(disabled)；绘制中额外首项「取消绘制 (Esc)」；
 *   - outliner-row（大纲行）：重命名 / 批量重命名…(T8.3) / 复制 / 删除(danger) /
 *     隐藏 / 锁定 / 聚焦 / 贴地(End，T8.1) / 移动至图层 ▾；
 *   - asset-card（内容浏览器卡片）：添加到场景（= 点击放置）/ 复制 / 重命名 / 删除 /
 *     查看详情（后四项 P1 占位禁用）。
 * actionId 协议（与主菜单 menuModel 同约定，一经定义不得改名，只可追加）：
 *   - 通用动作直接复用 app/actions 既有路由 id（edit.copy / edit.paste / edit.delete /
 *     view.camera-* / view.render-* / view.grid——渲染模式与主菜单/HUD 同一环境通道）；
 *   - 上下文专属动作用 ctx.* 前缀，由 App 层上下文处理器路由；带参数的子项
 *     （图层 / 形状类型 / 资产）复用父 actionId、参数走 arg 字段——派发单元 =
 *     (id, arg)，快照契约只登记父 id（组件 React key 用 id:arg 组合）。
 * 隐藏/锁定通道：SceneObject.visible/locked（契约既有字段）经 UpdateObjectCommand
 *   ——与大纲行 IconToggle 同路，非占位。T8.6 观察项①：纯组织组壳（isGroup）右键
 *   菜单不出这两项——不级联成员属空转；批量隐藏走「选中组内对象」→ 成员行路径。
 * 边界：ui 层零 runtime / io；纯数据模块零 React 依赖（组件呈现归 ContextMenu.tsx）。
 */
import type { ShapeType } from '../../domain/regions';
import type { CameraMode, RenderMode } from './menuModel';

/** 四类菜单来源（右键点按视口命中/空白、大纲行、内容浏览器卡片） */
export type ContextMenuSource = 'viewport-object' | 'viewport-blank' | 'outliner-row' | 'asset-card';

/** 菜单条目（可点项；子菜单经 children 展开） */
export interface ContextMenuItemDef {
  /** 稳定点分 action id（通用 = app/actions 既有 id；专属 = ctx.*） */
  id: string;
  label: string;
  /** 键帽提示（只标注当前真实生效的组合） */
  shortcut?: string;
  enabled: boolean;
  /** 勾选态（单选组当前位 / 开关） */
  checked?: boolean;
  /** 破坏性操作（视觉警示 --danger） */
  danger?: boolean;
  /** 子菜单（移动至图层 / 创建对象 / 视角 / 渲染模式；T8.4 起可含 separator 分区——渲染模式常规/诊断两组） */
  children?: ContextMenuEntry[];
  /** 动作参数（ctx.move-to-layer=目标图层 id；ctx.create=形状类型；ctx.add-to-scene=资产 id） */
  arg?: string;
}

/** 分隔线 */
export interface ContextMenuSeparatorDef {
  separator: true;
}

export type ContextMenuEntry = ContextMenuItemDef | ContextMenuSeparatorDef;

/** 条目类型收窄（'id' in 判别；组件与测试过滤分隔线共用） */
export function isContextMenuItem(entry: ContextMenuEntry): entry is ContextMenuItemDef {
  return 'id' in entry;
}

/** buildContextMenu 的状态输入（App 装配层从各 store 汇总） */
export interface ContextMenuState {
  /** 门面已装配（未装配时一切动作禁用） */
  ready: boolean;
  /** 有选中（打开菜单前右键目标已归一进选中集——复制/删除/聚焦/隐藏/锁定的作用域） */
  hasSelection: boolean;
  /** 内部剪贴板有内容（粘贴 enabled） */
  hasClipboard: boolean;
  /** 绘制/放置进行中（视口空白菜单追加首项「取消绘制」） */
  drawing: boolean;
  cameraMode: CameraMode;
  renderMode: RenderMode;
  /** 环境网格可见（网格开关 checked） */
  gridVisible: boolean;
  /** 图层清单（移动至图层子菜单；SceneManager.getLayers 顺序） */
  layers: ReadonlyArray<{ id: string; name: string }>;
  /** 目标对象（视口命中 / 大纲行；隐藏/锁定文案随状态切换） */
  object?: { id: string; visible: boolean; locked: boolean; isGroup?: boolean };
  /** 选中集含组壳（T8.5：「解散组」enabled 位） */
  selectionHasGroup?: boolean;
  /** 创建对象子菜单入口（T6.5 七形状新流程；toolIA SHAPE_CREATE_ENTRIES 派生） */
  createEntries?: ReadonlyArray<{ shapeType: ShapeType; label: string; hint?: string }>;
}

/** 一个菜单（条目树；命名沿 ContextToolbarModel 先例——组件名留给呈现层） */
export interface ContextMenuModel {
  source: ContextMenuSource;
  entries: ContextMenuEntry[];
}

const sep: ContextMenuSeparatorDef = { separator: true };

/** 便捷项构造 */
function item(id: string, label: string, extra: Partial<ContextMenuItemDef> = {}): ContextMenuItemDef {
  return { id, label, enabled: true, ...extra };
}

/** 视角子菜单（四机位单选组，复用主菜单 view.camera-* actionId） */
function viewMenu(state: ContextMenuState): ContextMenuItemDef {
  const modes: ReadonlyArray<{ id: string; mode: CameraMode; label: string }> = [
    { id: 'view.camera-perspective', mode: 'perspective', label: '透视' },
    { id: 'view.camera-top', mode: 'top', label: '顶' },
    { id: 'view.camera-front', mode: 'front', label: '前' },
    { id: 'view.camera-side', mode: 'side', label: '侧' },
  ];
  return item('ctx.view', '视角', {
    enabled: state.ready,
    children: modes.map((m) =>
      item(m.id, m.label, { enabled: state.ready, checked: state.cameraMode === m.mode }),
    ),
  });
}

/**
 * 渲染模式子菜单（六态单选组，与主菜单/HUD Shaded ▼ 同一环境通道；T8.4 常规/诊断
 * 两组以 separator 分隔——诊断档会话级，保存场景时组合根剥离 renderMode 键）。
 */
function renderModeMenu(state: ContextMenuState): ContextMenuItemDef {
  const modes: ReadonlyArray<{ id: string; mode: RenderMode; label: string }> = [
    { id: 'view.render-shaded', mode: 'shaded', label: '着色' },
    { id: 'view.render-wireframe', mode: 'wireframe', label: '线框' },
    { id: 'view.render-xray', mode: 'xray', label: 'X-Ray' },
    { id: 'view.render-clay', mode: 'clay', label: '灰模（Clay）' },
    { id: 'view.render-normals', mode: 'normals', label: '法线（Normals）' },
    { id: 'view.render-islands', mode: 'islands', label: '孤岛高亮' },
  ];
  const children: ContextMenuEntry[] = [];
  modes.forEach((m, i) => {
    if (i === 3) children.push(sep); // 常规三态 | 诊断三档 组间分隔线
    children.push(item(m.id, m.label, { enabled: state.ready, checked: state.renderMode === m.mode }));
  });
  return item('ctx.render-mode', '渲染模式', {
    enabled: state.ready,
    children,
  });
}

/** 移动至图层子菜单（图层清单；子项复用父 actionId，arg=图层 id） */
function moveMenu(state: ContextMenuState, enabled: boolean): ContextMenuItemDef {
  return item('ctx.move-to-layer', '移动至图层', {
    enabled: enabled && state.ready,
    children: state.layers.map((layer) =>
      item('ctx.move-to-layer', layer.name, { arg: layer.id, enabled: enabled && state.ready }),
    ),
  });
}

/**
 * 对象操作段（视口对象 / 大纲行共用：隐藏/锁定文案随目标状态切换）。
 * T8.6 观察项①裁决：目标为纯组织组壳（isGroup）时不产出——组壳 visible/locked
 * 不级联成员（实测空转，仅污染 undo 栈）；批量隐藏走「选中组内对象」→ 成员行路径。
 */
function objectEntries(state: ContextMenuState): ContextMenuEntry[] {
  const ready = state.ready;
  const hasSelection = ready && state.hasSelection;
  const target = state.object;
  if (target?.isGroup === true) return [];
  return [
    item('ctx.hide', target?.visible === false ? '显示' : '隐藏', { enabled: hasSelection }),
    item('ctx.lock', target?.locked === true ? '解锁' : '锁定', { enabled: hasSelection }),
  ];
}

/** 分组段（T8.5）：分组 ← 有选中；解散组 ← 选中集含组壳（快捷键与 InputController 同源） */
function groupEntries(state: ContextMenuState): ContextMenuEntry[] {
  const ready = state.ready;
  const hasSelection = ready && state.hasSelection;
  return [
    item('ctx.group', '分组', { enabled: hasSelection, shortcut: 'Ctrl G' }),
    item('ctx.ungroup', '解散组', {
      enabled: ready && state.hasSelection && (state.selectionHasGroup ?? false),
      shortcut: 'Ctrl ⇧ G',
    }),
  ];
}

/** 视口对象菜单 */
function viewportObjectMenu(state: ContextMenuState): ContextMenuEntry[] {
  const ready = state.ready;
  const hasSelection = ready && state.hasSelection;
  return [
    item('edit.copy', '复制', { enabled: hasSelection, shortcut: 'Ctrl C' }),
    item('edit.paste', '粘贴', { enabled: ready && state.hasClipboard, shortcut: 'Ctrl V' }),
    item('edit.delete', '删除', { enabled: hasSelection, shortcut: 'Delete', danger: true }),
    ...groupEntries(state),
    item('ctx.focus', '聚焦', { enabled: hasSelection, shortcut: 'F' }),
    item('ctx.drop-to-ground', '贴地', { enabled: hasSelection, shortcut: 'End' }),
    ...objectEntries(state),
    moveMenu(state, hasSelection),
    item('ctx.rename', '重命名', { enabled: hasSelection }),
    // T8.3：批量重命名弹层（作用域 = 选中集；前缀+序号 / 查找替换双模式）
    item('ctx.batch-rename', '批量重命名…', { enabled: hasSelection }),
  ];
}

/** 视口空白菜单 */
function viewportBlankMenu(state: ContextMenuState): ContextMenuEntry[] {
  const ready = state.ready;
  const entries: ContextMenuEntry[] = [];
  if (state.drawing) {
    entries.push(item('ctx.cancel-draw', '取消绘制', { enabled: ready, shortcut: 'Esc' }), sep);
  }
  entries.push(
    item('ctx.create', '创建对象', {
      enabled: ready,
      children: (state.createEntries ?? []).map((entry) =>
        item('ctx.create', entry.label, { arg: entry.shapeType, enabled: ready }),
      ),
    }),
    viewMenu(state),
    renderModeMenu(state),
    item('view.grid', '网格', { enabled: ready, checked: state.gridVisible }),
    item('ctx.display-settings', '显示设置', { enabled: false }), // P1 占位
  );
  return entries;
}

/** Outliner 行菜单 */
function outlinerRowMenu(state: ContextMenuState): ContextMenuEntry[] {
  const ready = state.ready;
  const hasSelection = ready && state.hasSelection;
  const entries: ContextMenuEntry[] = [
    item('ctx.rename', '重命名', { enabled: hasSelection }),
    // T8.3：批量重命名弹层（筛选+全选后的单图层筛选集高频入口，作用域 = 选中集）
    item('ctx.batch-rename', '批量重命名…', { enabled: hasSelection }),
    ...groupEntries(state),
  ];
  // 组行专属（T8.5 阶段门裁定纳入，UE 选文件夹=选中成员先例）：
  // 「选中组内对象」= 仅选成员不选壳（纯组织节点的一键批量入口）
  if (state.object?.isGroup === true) {
    entries.push(item('ctx.select-group-members', '选中组内对象', { enabled: ready }));
  }
  entries.push(
    item('edit.copy', '复制', { enabled: hasSelection, shortcut: 'Ctrl C' }),
    item('edit.delete', '删除', { enabled: hasSelection, shortcut: 'Delete', danger: true }),
    ...objectEntries(state),
    item('ctx.focus', '聚焦', { enabled: hasSelection, shortcut: 'F' }),
    item('ctx.drop-to-ground', '贴地', { enabled: hasSelection, shortcut: 'End' }),
    moveMenu(state, hasSelection),
  );
  return entries;
}

/** Content Browser 卡片菜单 */
function assetCardMenu(state: ContextMenuState): ContextMenuEntry[] {
  return [
    item('ctx.add-to-scene', '添加到场景', { enabled: state.ready }),
    item('ctx.asset-copy', '复制', { enabled: false }),
    item('ctx.asset-rename', '重命名', { enabled: false }),
    item('ctx.asset-delete', '删除', { enabled: false }),
    item('ctx.asset-details', '查看详情', { enabled: false }), // P1
  ];
}

/**
 * 构建四类右键菜单（纯函数）。清单顺序为稳定契约（tests/ui/menus 快照守护）；
 * enabled 规则见各菜单构造器注释；disabled 项可见不隐藏（需求 §39）。
 */
export function buildContextMenu(source: ContextMenuSource, state: ContextMenuState): ContextMenuModel {
  switch (source) {
    case 'viewport-object':
      return { source, entries: viewportObjectMenu(state) };
    case 'viewport-blank':
      return { source, entries: viewportBlankMenu(state) };
    case 'outliner-row':
      return { source, entries: outlinerRowMenu(state) };
    case 'asset-card':
      return { source, entries: assetCardMenu(state) };
  }
}
