/**
 * ui/layout/layoutPresets —— 工作区布局预设与序列化纯模块（T7.3）。
 *
 * 职责：
 *   - 四布局预设（需求 29 章）：default 默认（= workspaceStore INITIAL）/ minimal 极简
 *     （三区全隐藏，仅视口）/ build 搭建（强化 Content Browser + Scene：底部 280 展开、
 *     右列收起）/ analysis 分析（强化 Viewport + Inspector：左列与底部收起、右列 360）；
 *     预设 = 布局字段的完整快照（尺寸全部在钳制表域内），**不含 mode**——mode 是工作态
 *     非布局态（T7.1 裁定）；唯一例外：「恢复默认」动作 = default 预设 + setMode('scene')
 *     （T7.3 门裁定，由弹层组合执行）；
 *   - 快照序列化：serialize / deserialize（布局字段 + mode）；损坏 JSON / 非对象 → null，
 *     非法枚举（inspectorTab / browser.category / WorkModeId）→ 字段级静默回退默认，
 *     越界尺寸 → 过钳制表；**mode 反序列化校验 MODES enabled——analysis 不可恢复，
 *     落 'scene'**；
 *   - matchPreset：当前布局命中判定（纯比较，不比 mode；未命中 = 自定义态 null）；
 *   - 命名个人布局 CRUD（需求 30 章）：保存（重名覆盖）/ 列举 / 删除 / 重命名
 *     （T8.3，保序、撞名拒绝），localStorage 持久化沿 browserModel 先例（最小
 *     storage 接口注入、损坏数据静默回退）；
 *   - 布局文件导出/导入（T8.3）：载荷 = name + 布局字段（sanitize 规整）；
 *     导入结构非法整体拒收（null → 调用方 Toast 提示）、字段级非法回退默认；
 *     往返无损（导出→删→导入→应用等价）。
 * 边界：ui 层纯逻辑（node 可测，无 jsdom）；布局与场景数据解耦——只进 localStorage，
 *      不触碰 SceneData / serializer（T7.3 验收项）；不触碰 EditorFacade / EventBus。
 */
import { MODES } from '../tools/toolIA';
import type { WorkModeId } from '../tools/toolIA';
import {
  BROWSER_EXPANDED_H,
  PANEL_SIZE_SPECS,
  clampPanelSize,
} from './workspaceStore';
import type {
  BrowserPanelState,
  HiddenPanels,
  InspectorTabId,
} from './workspaceStore';

// ── 类型 ────────────────────────────────────────────────────

/** 预设 id（需求 29 章四预设；顺序 = 弹层呈现序） */
export type LayoutPresetId = 'default' | 'minimal' | 'build' | 'analysis';

/**
 * 布局字段完整快照（预设与个人布局的载荷）。mode 不在内——工作态非布局态
 * （T7.1 裁定；唯一例外「恢复默认」动作由弹层组合 default 预设 + scene）。
 */
export interface LayoutFields {
  leftWidth: number;
  rightWidth: number;
  bottomHeight: number;
  hiddenPanels: HiddenPanels;
  collapsedSections: Record<string, boolean>;
  inspectorTab: InspectorTabId;
  browser: BrowserPanelState;
}

/** 一枚布局预设（纯数据） */
export interface LayoutPreset {
  id: LayoutPresetId;
  label: string;
  /** 一句职责描述（弹层 tooltip） */
  hint: string;
  layout: LayoutFields;
}

/**
 * 工作区快照：布局字段 + 显式工作模式 + 小地图开关（持久化的完整载荷）。
 * minimapVisible（T7.7）：UI 偏好随快照持久化，缺字段回退 true（仅显式 false 隐藏）；
 * 不属 LayoutFields——预设/个人布局/命中判定均不含（沿 mode 的「非布局态」先例）。
 */
export interface WorkspaceSnapshot {
  layout: LayoutFields;
  mode: WorkModeId;
  minimapVisible: boolean;
}

/** 命名个人布局（存储键 = 布局名） */
export interface NamedLayout {
  name: string;
  layout: LayoutFields;
}

/** 最小 storage 接口（localStorage 子集，便于注入 fake；沿 browserModel 先例） */
export interface WorkspaceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// ── storage 键 ──────────────────────────────────────────────

/** 自动快照（布局字段 + mode）在 localStorage 的键 */
export const WORKSPACE_STORAGE_KEY = 't3d-editor.workspace';

/** 命名个人布局表在 localStorage 的键（JSON 对象：布局名 → 布局字段） */
export const WORKSPACE_LAYOUTS_STORAGE_KEY = 't3d-editor.workspace-layouts';

/** 默认 storage：浏览器 localStorage；不可用（隐私模式/测试环境）返回 null */
function defaultStorage(): WorkspaceStorage | null {
  try {
    if (typeof globalThis.localStorage !== 'undefined') {
      const ls = globalThis.localStorage;
      return { getItem: (k) => ls.getItem(k), setItem: (k, v) => ls.setItem(k, v), removeItem: (k) => ls.removeItem(k) };
    }
  } catch {
    /* 访问 localStorage 本身可能抛错（部分隐私模式） */
  }
  return null;
}

// ── 四预设（需求 29 章）────────────────────────────────────

/** 布局字段默认值（= workspaceStore INITIAL 的布局子集，两处保持一致） */
function defaultLayoutFields(): LayoutFields {
  return {
    leftWidth: PANEL_SIZE_SPECS.left.default,
    rightWidth: PANEL_SIZE_SPECS.right.default,
    bottomHeight: PANEL_SIZE_SPECS.bottom.default,
    hiddenPanels: { left: false, right: false, bottom: false },
    collapsedSections: {},
    inspectorTab: 'object',
    browser: { expanded: false, category: 'all', search: '' },
  };
}

/**
 * 四预设数据表（尺寸全部在钳制表域内）：
 * - default 默认：四区齐备（Scene / Viewport / Inspector / Content Browser 紧凑条）；
 * - minimal 极简：三区全隐藏仅视口（尺寸保持默认，恢复显示时宽度合理）；
 * - build 搭建：左列显 260 / 右列隐藏 / 底部 280 展开（browser.expanded = true）；
 * - analysis 分析：左列隐藏 / 底部隐藏 / 右列 360（强化视口 + 检查器；
 *   Analysis 面板本身为契约排除项，预设仅 = 两区强化）。
 */
export const LAYOUT_PRESETS: readonly LayoutPreset[] = [
  {
    id: 'default',
    label: '默认',
    hint: '四区齐备：大纲 · 视口 · 检查器 · 内容浏览器',
    layout: defaultLayoutFields(),
  },
  {
    id: 'minimal',
    label: '极简',
    hint: '仅保留视口（三面板区全部收起）',
    layout: {
      ...defaultLayoutFields(),
      hiddenPanels: { left: true, right: true, bottom: true },
    },
  },
  {
    id: 'build',
    label: '搭建',
    hint: '强化内容浏览器与大纲（右面板收起）',
    layout: {
      ...defaultLayoutFields(),
      bottomHeight: BROWSER_EXPANDED_H,
      hiddenPanels: { left: false, right: true, bottom: false },
      browser: { expanded: true, category: 'all', search: '' },
    },
  },
  {
    id: 'analysis',
    label: '分析',
    hint: '强化视口与检查器（左栏与浏览器收起）',
    layout: {
      ...defaultLayoutFields(),
      rightWidth: 360,
      hiddenPanels: { left: true, right: false, bottom: true },
    },
  },
];

/** 按 id 查预设（未知 id 兜底 default） */
export function layoutPresetOf(id: LayoutPresetId): LayoutPreset {
  return LAYOUT_PRESETS.find((p) => p.id === id) ?? LAYOUT_PRESETS[0]!;
}

// ── 序列化（快照往返）─────────────────────────────────────

/** 尺寸字段回退：有限数字 → 钳制表折算；其余（缺省/非数字/NaN/Infinity）→ 表默认 */
function sizeOr(zone: 'left' | 'right' | 'bottom', raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return clampPanelSize(zone, raw);
  return PANEL_SIZE_SPECS[zone].default;
}

const INSPECTOR_TABS: readonly InspectorTabId[] = ['object', 'environment', 'settings'];

/**
 * 未知载荷 → 合法布局字段（字段级静默回退：非法枚举/缺省回默认、越界尺寸过钳制表；
 * 折叠表仅保留真值键——与 store 记账约定一致）。非对象载荷 → null（整体丢弃）。
 */
function sanitizeLayoutFields(raw: unknown): LayoutFields | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const src = raw as Record<string, unknown>;

  const hiddenRaw = typeof src.hiddenPanels === 'object' && src.hiddenPanels !== null && !Array.isArray(src.hiddenPanels)
    ? (src.hiddenPanels as Record<string, unknown>)
    : {};
  const hiddenPanels: HiddenPanels = {
    left: hiddenRaw.left === true,
    right: hiddenRaw.right === true,
    bottom: hiddenRaw.bottom === true,
  };

  const collapsed: Record<string, boolean> = {};
  const collapsedRaw = typeof src.collapsedSections === 'object' && src.collapsedSections !== null && !Array.isArray(src.collapsedSections)
    ? (src.collapsedSections as Record<string, unknown>)
    : {};
  for (const [key, value] of Object.entries(collapsedRaw)) {
    if (value === true) collapsed[key] = true; // 仅保留折叠中的键（store 同约定）
  }

  const browserRaw = typeof src.browser === 'object' && src.browser !== null && !Array.isArray(src.browser)
    ? (src.browser as Record<string, unknown>)
    : {};
  const category = typeof browserRaw.category === 'string' && browserRaw.category !== '' ? browserRaw.category : 'all';
  const browser: BrowserPanelState = {
    expanded: browserRaw.expanded === true,
    category,
    search: typeof browserRaw.search === 'string' ? browserRaw.search : '',
  };

  return {
    leftWidth: sizeOr('left', src.leftWidth),
    rightWidth: sizeOr('right', src.rightWidth),
    bottomHeight: sizeOr('bottom', src.bottomHeight),
    hiddenPanels,
    collapsedSections: collapsed,
    inspectorTab: INSPECTOR_TABS.includes(src.inspectorTab as InspectorTabId)
      ? (src.inspectorTab as InspectorTabId)
      : 'object',
    browser,
  };
}

/** mode 回退：启用模式原样；禁用（analysis）/未知/非字符串 → 'scene'（T7.3 门裁定；
 *  T10.2 measure 转正后经 MODES.enabled 自动可恢复，无本表硬编码） */
function sanitizeMode(raw: unknown): WorkModeId {
  if (typeof raw === 'string' && MODES.some((m) => m.id === raw && m.enabled)) {
    return raw as WorkModeId;
  }
  return 'scene';
}

/**
 * 序列化快照（布局字段平铺 + mode + minimapVisible；mode 合法性由调用方保证——
 * store 内为 WorkModeId；minimapVisible 缺省 true=显示，T7.7 增补字段向后兼容旧快照）。
 */
export function serializeWorkspaceSnapshot(
  layout: LayoutFields,
  mode: WorkModeId,
  minimapVisible = true,
): string {
  return JSON.stringify({ ...layout, mode, minimapVisible });
}

/**
 * 反序列化快照：损坏 JSON / 非对象载荷 → null（调用方保持默认，静默）；
 * 字段级非法回退默认（见 sanitizeLayoutFields）；mode 经 MODES enabled 校验
 * （analysis 不可恢复，落 'scene'；measure T10.2 转正可恢复）；minimapVisible 仅显式 false 为隐藏
 * （缺字段/非法值 → true，T7.7）。
 */
export function deserializeWorkspaceSnapshot(raw: string): WorkspaceSnapshot | null {
  if (typeof raw !== 'string' || raw === '') return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const layout = sanitizeLayoutFields(parsed);
  if (layout === null) return null;
  return {
    layout,
    mode: sanitizeMode((parsed as Record<string, unknown>).mode),
    minimapVisible: (parsed as Record<string, unknown>).minimapVisible === false ? false : true,
  };
}

// ── matchPreset（命中判定，不比 mode）─────────────────────

/** 折叠表相等 = 键集一致（store 约定键值恒为 true） */
function sameCollapsed(a: Record<string, boolean>, b: Record<string, boolean>): boolean {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return ka.length === kb.length && kb.every((k) => a[k] === true);
}

function sameLayout(a: LayoutFields, b: LayoutFields): boolean {
  return (
    a.leftWidth === b.leftWidth &&
    a.rightWidth === b.rightWidth &&
    a.bottomHeight === b.bottomHeight &&
    a.hiddenPanels.left === b.hiddenPanels.left &&
    a.hiddenPanels.right === b.hiddenPanels.right &&
    a.hiddenPanels.bottom === b.hiddenPanels.bottom &&
    sameCollapsed(a.collapsedSections, b.collapsedSections) &&
    a.inspectorTab === b.inspectorTab &&
    a.browser.expanded === b.browser.expanded &&
    a.browser.category === b.browser.category &&
    a.browser.search === b.browser.search
  );
}

/** 当前布局命中哪枚预设（不比 mode）；未命中 → null（自定义态） */
export function matchPreset(layout: LayoutFields): LayoutPresetId | null {
  for (const preset of LAYOUT_PRESETS) {
    if (sameLayout(layout, preset.layout)) return preset.id;
  }
  return null;
}

/** 从 store 状态切片提取布局字段（深拷贝，外部不可借引用污染 store） */
export function pickLayoutFields(
  state: LayoutFields,
): LayoutFields {
  return {
    leftWidth: state.leftWidth,
    rightWidth: state.rightWidth,
    bottomHeight: state.bottomHeight,
    hiddenPanels: { ...state.hiddenPanels },
    collapsedSections: { ...state.collapsedSections },
    inspectorTab: state.inspectorTab,
    browser: { ...state.browser },
  };
}

// ── 命名个人布局 CRUD（需求 30 章）────────────────────────

/** 读取布局表：storage 不可用 / 损坏 JSON / 非对象表 → 空表；单项非对象丢弃 */
export function listNamedLayouts(storage: WorkspaceStorage | null = defaultStorage()): NamedLayout[] {
  if (!storage) return [];
  let raw: string | null = null;
  try {
    raw = storage.getItem(WORKSPACE_LAYOUTS_STORAGE_KEY);
  } catch {
    return [];
  }
  if (typeof raw !== 'string' || raw === '') return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return [];
  const entries: NamedLayout[] = [];
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    const name = key.trim();
    const layout = sanitizeLayoutFields(value);
    if (name === '' || layout === null) continue;
    entries.push({ name, layout });
  }
  return entries;
}

/** 读取布局表原始对象（写路径共用；损坏 → 空表重写） */
function readLayoutMap(storage: WorkspaceStorage): Record<string, unknown> {
  try {
    const raw = storage.getItem(WORKSPACE_LAYOUTS_STORAGE_KEY);
    if (typeof raw !== 'string' || raw === '') return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return parsed as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * 保存命名布局：名字首尾裁剪；空名 / storage 不可用 / 写入失败 → false；
 * 重名覆盖（不产生重复项）。布局载荷经 sanitize 规整（尺寸钳制 + 深拷贝）。
 */
export function saveNamedLayout(
  name: string,
  layout: LayoutFields,
  storage: WorkspaceStorage | null = defaultStorage(),
): boolean {
  const trimmed = name.trim();
  if (!storage || trimmed === '') return false;
  const normalized = sanitizeLayoutFields(layout);
  if (normalized === null) return false;
  try {
    const map = readLayoutMap(storage);
    map[trimmed] = normalized;
    storage.setItem(WORKSPACE_LAYOUTS_STORAGE_KEY, JSON.stringify(map));
    return true;
  } catch {
    return false; // 配额/隐私模式：布局仅存于内存（本会话弹层仍可用）
  }
}

/** 删除命名布局：不存在 → false；清空后移除存储键 */
export function deleteNamedLayout(
  name: string,
  storage: WorkspaceStorage | null = defaultStorage(),
): boolean {
  const trimmed = name.trim();
  if (!storage || trimmed === '') return false;
  try {
    const map = readLayoutMap(storage);
    if (!(trimmed in map)) return false;
    delete map[trimmed];
    if (Object.keys(map).length === 0) storage.removeItem(WORKSPACE_LAYOUTS_STORAGE_KEY);
    else storage.setItem(WORKSPACE_LAYOUTS_STORAGE_KEY, JSON.stringify(map));
    return true;
  } catch {
    return false;
  }
}

/**
 * 重命名命名布局（T8.3）：条目顺序保持（按原键序重写整表，不把改名项挪到末尾）；
 * 旧名不存在 / 新名空白 / 新名撞既有布局 → false（拒绝静默覆盖，沿模板改名撞名先例）；
 * 裁剪后同名（无实际变化）→ true。storage 不可用 / 写入失败 → false。
 */
export function renameNamedLayout(
  name: string,
  nextName: string,
  storage: WorkspaceStorage | null = defaultStorage(),
): boolean {
  const trimmed = name.trim();
  const next = nextName.trim();
  if (!storage || trimmed === '' || next === '') return false;
  try {
    const map = readLayoutMap(storage);
    if (!(trimmed in map)) return false;
    if (next !== trimmed && next in map) return false; // 撞名拒绝
    const rebuilt: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(map)) {
      rebuilt[key === trimmed ? next : key] = entry; // 保序替换键
    }
    storage.setItem(WORKSPACE_LAYOUTS_STORAGE_KEY, JSON.stringify(rebuilt));
    return true;
  } catch {
    return false;
  }
}

// ── 布局文件导出 / 导入（T8.3；本地文件即止，不做云同步）────

/** 布局文件载荷（JSON 文件形态：name + 布局字段嵌套） */
export interface LayoutFilePayload {
  name: string;
  layout: LayoutFields;
}

/**
 * 导出串：布局字段经 sanitize 规整（尺寸钳制 + 深拷贝）+ name（首尾裁剪），
 * pretty JSON（2 空格缩进，便于人工检查）；空名 / 纯空白名 → null。
 */
export function serializeLayoutExport(name: string, layout: LayoutFields): string | null {
  const trimmed = name.trim();
  const normalized = sanitizeLayoutFields(layout);
  if (trimmed === '' || normalized === null) return null;
  return JSON.stringify({ name: trimmed, layout: normalized }, null, 2);
}

/**
 * 导入（整体拒收 + 字段级回退双层语义）：
 * - 结构非法整体拒收 null——损坏 JSON / 非对象载荷 / 缺 name / name 非字符串 /
 *   空白名 / layout 缺失或非对象（调用方 Toast 提示）；
 * - layout 字段级非法沿 sanitize 语义回退（越界尺寸过钳制表、非法枚举回默认）。
 * 与 serializeLayoutExport 往返无损（导出已 sanitize，导入幂等）。
 */
export function parseLayoutImport(raw: string): LayoutFilePayload | null {
  if (typeof raw !== 'string' || raw === '') return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
  const src = parsed as Record<string, unknown>;
  const name = typeof src.name === 'string' ? src.name.trim() : '';
  if (name === '') return null;
  const layout = sanitizeLayoutFields(src.layout);
  if (layout === null) return null;
  return { name, layout };
}
