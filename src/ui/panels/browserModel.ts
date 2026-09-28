/**
 * ui/panels/browserModel —— Content Browser 的纯逻辑（可测，不渲染；T5.5）。
 *
 * 职责（自 assetLibrary.ts 原样吸收 + 扩展）：
 *   - 收藏（星标）localStorage 持久化（UI 唯一真相源；FAVORITES_STORAGE_KEY 键值字符串
 *     原样保留——用户既有收藏数据兼容）；
 *   - 面板过滤（搜索命中 name/tags、分类过滤、收藏过滤）与分类数据构建
 *     （label 取 metadata.categoryLabel 回退 slug——GLB 附加字段，程序化无则回退）；
 *   - 双态派生 isBrowserExpanded（store 展开位 ∨ 底部行高超出紧凑高——Splitter 抬高
 *     视为展开）；
 *   - 拖放 mime 纯部分：ASSET_DRAG_MIME / isAssetDrag（dragover 只读 types）/ parseAssetDragId
 *     （mime 优先、text/plain 兜底）——卡片 dragstart 与 App drop 接线的共同约定；
 *   - 分类色标 categoryMarkColor：slug 哈希 → 确定性 HSL（数据编码色，非 UI 强调色）。
 * 混排（T002.2，D7/D13）：过滤/分类数据构建全部编程到 BrowserAsset（AssetCommonMeta
 *      公共面 + GLB 可选 metadata）——GLB（file）与程序化（procedural）条目一视同仁，kind 不参与
 *      任何检索语义（功能隔离零）。T022：标签芯片聚合与排序档随浏览器简化删除。
 * 边界：ui 层只依赖 domain 与本层 layout（分层 DAG）；storage 以最小结构注入（node 测试
 *      用 fake 模拟 localStorage），globalThis.localStorage 不可用时静默返回空集合（不抛错）。
 */
import type { AssetCommonMeta } from '../../domain/assets';
import { PANEL_SIZE_SPECS } from '../layout/workspaceStore';

/** 收藏 id 集合在 localStorage 的键（自 assetLibrary.ts 原样保留，勿改——既有数据兼容） */
export const FAVORITES_STORAGE_KEY = 't3d-editor.asset-favorites';

/**
 * 浏览器条目最小面：AssetCommonMeta 公共面 + GLB 附加的可选 metadata（仅取
 * categoryLabel 做分类展示名）。ModelAsset 与 ProceduralAssetMeta 均结构兼容——
 * 检索/聚合/排序函数对两种 kind 同一份逻辑（T002.2 混排）。
 */
export type BrowserAsset = AssetCommonMeta & { metadata?: Record<string, unknown> };

/** 资产拖拽自定义 mime（卡片 dragstart 写入、视口 dragover/drop 检测） */
export const ASSET_DRAG_MIME = 'application/x-asset-id';

/** 分类筛选哨兵：全部 / 收藏（具体分类用 asset.category slug） */
export const BROWSER_CATEGORY_ALL = 'all';
export const BROWSER_CATEGORY_FAVORITES = '__favorites__';

/**
 * DEV 分类（T008.1）：管线验证资产（如 asset_seedstack）的 category 值——注册表
 * 照常登记（缓存/池/测试全链路消费），仅产品资产栏不展示。
 */
export const BROWSER_CATEGORY_DEV = 'dev';

/**
 * 产品可见条目：过滤 DEV 分类（列表、分类芯片、标签芯片的公共上游——一处过滤，
 * 三处推导同步排除）。DEV 资产供管线验证与测试消费，不进产品浏览面。
 */
export function visibleBrowserAssets<T extends BrowserAsset>(assets: readonly T[]): T[] {
  return assets.filter((asset) => asset.category !== BROWSER_CATEGORY_DEV);
}

// ── 收藏持久化 ──────────────────────────────────────────────

/** 面板所需的最小 storage 结构（localStorage 子集，便于注入 fake） */
export interface AssetLibraryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** 默认 storage：浏览器 localStorage；不可用（隐私模式/测试环境）返回 null */
function defaultStorage(): AssetLibraryStorage | null {
  try {
    if (typeof globalThis.localStorage !== 'undefined') return globalThis.localStorage;
  } catch {
    /* 访问 localStorage 本身可能抛错（部分隐私模式） */
  }
  return null;
}

/** 读取收藏集合：损坏 JSON / 非数组 / storage 不可用 → 空 Set（面板渲染永不因此失败） */
export function loadFavoriteIds(storage: AssetLibraryStorage | null = defaultStorage()): Set<string> {
  if (!storage) return new Set();
  let raw: string | null = null;
  try {
    raw = storage.getItem(FAVORITES_STORAGE_KEY);
  } catch {
    return new Set();
  }
  if (typeof raw !== 'string') return new Set();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string'));
  } catch {
    return new Set();
  }
}

/** 持久化收藏集合（JSON 数组）；storage 不可用静默跳过 */
export function saveFavoriteIds(ids: Iterable<string>, storage: AssetLibraryStorage | null = defaultStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* 配额/隐私模式：收藏仅存于本次会话内存 */
  }
}

/** 切换收藏：返回新集合并立即持久化（写入失败不影响内存集合） */
export function toggleFavorite(
  assetId: string,
  current: ReadonlySet<string>,
  storage: AssetLibraryStorage | null = defaultStorage(),
): Set<string> {
  const next = new Set(current);
  if (next.has(assetId)) next.delete(assetId);
  else next.add(assetId);
  saveFavoriteIds(next, storage);
  return next;
}

// ── 过滤 ────────────────────────────────────────────────────

export interface AssetFilter {
  /** 搜索关键词：命中 name 或 tags（不区分大小写）；空白 → 不过滤 */
  query?: string;
  /** 分类 key（asset.category）；'all' 或 undefined → 不过滤 */
  category?: string;
  /** 仅看收藏 */
  favoritesOnly?: boolean;
  /** 收藏集合（favoritesOnly 时生效） */
  favoriteIds?: ReadonlySet<string>;
}

/** 面板过滤：保持传入顺序（注册表顺序；GLB 与程序化混排不重排）。泛型保留调用方的元素类型（视图条目带 kind/缩略图） */
export function filterAssets<T extends BrowserAsset>(assets: readonly T[], filter: AssetFilter): T[] {
  const query = filter.query?.trim().toLowerCase() ?? '';
  const category = filter.category && filter.category !== BROWSER_CATEGORY_ALL ? filter.category : null;
  const favorites = filter.favoritesOnly ? filter.favoriteIds ?? new Set<string>() : null;
  return assets.filter((asset) => {
    if (category !== null && asset.category !== category) return false;
    if (favorites !== null && !favorites.has(asset.id)) return false;
    if (query !== '') {
      const inName = asset.name.toLowerCase().includes(query);
      const inTags = asset.tags.some((t) => t.toLowerCase().includes(query));
      if (!inName && !inTags) return false;
    }
    return true;
  });
}

// ── 分类数据 ───────────────────────────────────────────────

export interface AssetCategoryInfo {
  /** asset.category（目录 slug） */
  key: string;
  /** 展示名：metadata.categoryLabel 回退 slug */
  label: string;
  count: number;
}

/** 分类展示名：GLB metadata.categoryLabel 回退 slug（程序化无 metadata → slug） */
export function assetCategoryLabel(asset: BrowserAsset): string {
  const label = asset.metadata?.categoryLabel;
  return typeof label === 'string' && label !== '' ? label : asset.category;
}

/** 分类列表：按条目首次出现顺序聚合计数（混排输入同规则） */
export function buildCategories(assets: readonly BrowserAsset[]): AssetCategoryInfo[] {
  const order: string[] = [];
  const byKey = new Map<string, number>(); // key → count
  for (const asset of assets) {
    const count = byKey.get(asset.category);
    if (count === undefined) {
      order.push(asset.category);
      byKey.set(asset.category, 1);
    } else {
      byKey.set(asset.category, count + 1);
    }
  }
  return order.map((key) => {
    const sample = assets.find((a) => a.category === key);
    return { key, label: sample ? assetCategoryLabel(sample) : key, count: byKey.get(key) ?? 0 };
  });
}

// ── 双态派生 ───────────────────────────────────────────────

/**
 * Content Browser 是否处于展开态：store 展开位为真，或底部行高被 Splitter 拖出紧凑高
 * （拖高 = 用户要更多空间 → 按展开布局呈现；收起按钮把行高一并收回 60）。
 */
export function isBrowserExpanded(expanded: boolean, bottomHeight: number): boolean {
  return expanded || bottomHeight > PANEL_SIZE_SPECS.bottom.min;
}

// ── 拖放 mime 纯部分 ───────────────────────────────────────

/** 拖拽载荷是否资产（dragover 阶段只读 dataTransfer.types，getData 受保护不可用） */
export function isAssetDrag(types: readonly string[]): boolean {
  return types.includes(ASSET_DRAG_MIME);
}

/** 解析拖拽资产 id：自定义 mime 优先、text/plain 兜底；首尾空白裁剪；两路皆空 → null */
export function parseAssetDragId(mimeData: string, fallbackText: string): string | null {
  const fromMime = mimeData.trim();
  if (fromMime !== '') return fromMime;
  const fromText = fallbackText.trim();
  return fromText !== '' ? fromText : null;
}

// ── 分类色标 ───────────────────────────────────────────────

/**
 * 分类色标（数据编码色，非 UI 强调色）：slug 确定性哈希 → HSL 色相（固定中饱和/中亮度，
 * 暗底可辨）。同 slug 跨会话稳定；新分类零登记自动可用。DESIGN.md「琥珀唯一强调」约束
 * 不受影响——色标是内容分类编码，不表达激活/选中语义。
 */
export function categoryMarkColor(category: string): string {
  let hash = 0;
  for (const ch of category) {
    hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) | 0;
  }
  const hue = ((hash % 360) + 360) % 360;
  return `hsl(${hue} 42% 58%)`;
}
