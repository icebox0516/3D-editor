/**
 * ui/panels/ContentBrowser —— 底部内容浏览器（T5.5，自左栏 AssetLibraryPanel 升级吸收）。
 *
 * 双态结构：
 *   - 紧凑态（60px 默认）：单行 = 标题 + 命中读数 + 分类芯片行（全部/收藏/各分类，横向滚动）
 *     + 搜索框 + 展开钮 + 隐藏 ×；点芯片 = 选定分类并同时展开；输入搜索词自动展开。
 *   - 展开态（280px 目标高）：顶部行同紧凑态（展开钮转收起钮）+ 标签/排序工具行
 *     （T8.3：manifest tags 聚合芯片点击切换筛选，与分类/搜索 AND 叠加 + 排序下拉
 *     默认/名称/分类；会话态不入持久化）+ 左分类纵栏（含计数）+ 右资产网格卡片
 *     （缩略图 + 名称 + 分类色标 + 收藏星标）。
 * 交互：
 *   - 点击卡片 → onPick（组合根激活 placement 工具；随机采样语义在工具内，本面板不感知）；
 *   - 拖拽卡片 → dragstart 写 dataTransfer（application/x-asset-id + text/plain 兜底），
 *     视口侧 dragover/drop 接线在 App 层（ui 不 import app）；
 *   - 右键卡片 → store.openContextMenu('asset-card')（T5.8 四类上下文菜单之一；
 *     添加到场景 = 点击放置同路，其余项 P1 占位禁用）；
 *   - 收藏星标 → localStorage 持久化（browserModel 唯一真相源）。
 * 混排（T002.2，D7/D13）：数据源 = 统一 AssetDescriptor（GLB file 与程序化 procedural
 *   同库混排，过滤/搜索/标签/收藏对两者一视同仁）；程序化卡片左上角 kind 角标区分来源
 *   （仅视觉标注，无功能隔离），缩略图 = 组合根离屏快照回填（proceduralThumbnails prop），
 *   未就绪/失败时首字形占位兜底（不阻塞浏览）。
 * 边界：只读 store 与 props（UI 边界 #11）；双态/分类/搜索存 workspaceStore.browser
 *      （resetLayout 复位），展开派生 = browser.expanded ∨ 行高超出紧凑高（Splitter 拖高
 *      即展开）；视觉一律 tokens.css 变量（DESIGN.md「夜间制图台」：琥珀单一强调、
 *      等宽读数、高密度），分类色标为数据编码色（browserModel.categoryMarkColor）。
 */
import { useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import { Boxes } from 'lucide-react';
import type { AssetCommonMeta, AssetDescriptor } from '../../domain/assets';
import { useEditorStore } from '../store';
import { useWorkspaceStore } from '../layout/workspaceStore';
import {
  ASSET_DRAG_MIME,
  BROWSER_CATEGORY_ALL,
  BROWSER_CATEGORY_DEV,
  BROWSER_CATEGORY_FAVORITES,
  assetCategoryLabel,
  buildCategories,
  buildTagChips,
  categoryMarkColor,
  filterAssets,
  isBrowserExpanded,
  loadFavoriteIds,
  sortAssets,
  toggleFavorite,
} from './browserModel';
import type { AssetSortKey, BrowserAsset } from './browserModel';

/** 混排卡片视图条目：BrowserAsset 公共面 + 渲染附加（kind 标注 + 缩略图归一） */
interface BrowserEntry extends BrowserAsset {
  kind: AssetDescriptor['kind'];
  /** file → manifest SVG 占位/离屏快照；procedural → 离屏快照回填（未就绪 undefined → 字形占位） */
  thumbnail?: string;
}

interface ContentBrowserProps {
  /** 统一描述符列表（GLB + 程序化混排；组合根自注册表读出） */
  assets: readonly AssetDescriptor[];
  /** 程序化资产缩略图（assetId → dataURL；组合根离屏快照异步回填） */
  proceduralThumbnails?: ReadonlyMap<string, string>;
  /** 点击卡片 → 放置模式（组合根接线；与拖放为等价放置路径） */
  onPick: (asset: AssetCommonMeta) => void;
  /** 隐藏所在面板组（底部浏览器行整组收起；恢复经上下文条开关）。由装配层注入 */
  onHideZone?: () => void;
}

/** 筛选选中项：全部 / 收藏 / 具体分类 key（哨兵值见 browserModel） */
type RailSelection = typeof BROWSER_CATEGORY_ALL | typeof BROWSER_CATEGORY_FAVORITES | string;

/** 名称首字（占位字形，缩略图缺失时的兜底） */
function initialChar(name: string): string {
  const first = [...name.trim()][0] ?? '?';
  return /[a-z]/.test(first) ? first.toUpperCase() : first;
}

function StarIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
      <path d="M8 1.8l1.9 3.8 4.2.6-3 3 .7 4.2L8 11.4l-3.8 2 .7-4.2-3-3 4.2-.6z" />
    </svg>
  );
}

export function ContentBrowser({
  assets,
  proceduralThumbnails,
  onPick,
  onHideZone,
}: ContentBrowserProps) {
  const activeToolId = useEditorStore((s) => s.activeToolId);
  const placingAssetId = useEditorStore((s) => s.placingAssetId);

  const browser = useWorkspaceStore((s) => s.browser);
  const bottomHeight = useWorkspaceStore((s) => s.bottomHeight);
  const setBrowserExpanded = useWorkspaceStore((s) => s.setBrowserExpanded);
  const setBrowserCategory = useWorkspaceStore((s) => s.setBrowserCategory);
  const setBrowserSearch = useWorkspaceStore((s) => s.setBrowserSearch);

  const rail: RailSelection = browser.category;
  const expanded = isBrowserExpanded(browser.expanded, bottomHeight);

  // 收藏真相源 localStorage：初始一次读入，切换即持久化（不进 zustand——面板私有状态）
  const [favoriteIds, setFavoriteIds] = useState(() => loadFavoriteIds());
  /** 标签筛选（T8.3：面板会话态，不入持久化；null = 不筛） */
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  /** 排序档（T8.3：面板会话态，不入持久化） */
  const [sortKey, setSortKey] = useState<AssetSortKey>('default');

  /** 混排视图条目：描述符解包（公共面 + kind + 缩略图归一）；BrowserEntry 结构兼容 BrowserAsset。
   *  DEV 分类先过滤（T008.1：管线验证资产不进产品栏——列表/分类/标签芯片共用 entries） */
  const entries = useMemo<BrowserEntry[]>(
    () =>
      assets
        .filter((d) => d.asset.category !== BROWSER_CATEGORY_DEV)
        .map((d) =>
          d.kind === 'file'
            ? { kind: d.kind, ...d.asset, thumbnail: d.asset.thumbnail }
            : { kind: d.kind, ...d.asset, thumbnail: proceduralThumbnails?.get(d.asset.id) },
        ),
    [assets, proceduralThumbnails],
  );

  const categories = useMemo(() => buildCategories(entries), [entries]);
  const tagChips = useMemo(() => buildTagChips(entries), [entries]);
  const favoriteCount = useMemo(
    () => entries.reduce((n, a) => n + (favoriteIds.has(a.id) ? 1 : 0), 0),
    [entries, favoriteIds],
  );
  const visible = useMemo(
    () =>
      sortAssets(
        filterAssets(entries, {
          query: browser.search,
          category: rail === BROWSER_CATEGORY_FAVORITES ? BROWSER_CATEGORY_ALL : rail,
          favoritesOnly: rail === BROWSER_CATEGORY_FAVORITES,
          favoriteIds,
          tag: tagFilter ?? undefined,
        }),
        sortKey,
      ),
    [entries, browser.search, rail, favoriteIds, tagFilter, sortKey],
  );

  const onToggleStar = (assetId: string): void => {
    setFavoriteIds(toggleFavorite(assetId, favoriteIds));
  };

  /** 选中一个分类：紧凑态点芯片 = 选分类并同时展开（任务书 21 章）；展开态仅切换 */
  const selectCategory = (key: RailSelection): void => {
    setBrowserCategory(key);
    if (!expanded) setBrowserExpanded(true);
  };

  /** 搜索：紧凑态输入非空词自动展开（60px 行内无结果区，展开给出即时反馈） */
  const onSearchChange = (value: string): void => {
    setBrowserSearch(value);
    if (!expanded && value.trim() !== '') setBrowserExpanded(true);
  };

  const onCardDragStart = (e: DragEvent<HTMLDivElement>, asset: BrowserAsset): void => {
    e.dataTransfer.setData(ASSET_DRAG_MIME, asset.id);
    e.dataTransfer.setData('text/plain', asset.id); // 跨应用兜底（拖入文本目标仍是资产 id）
    e.dataTransfer.effectAllowed = 'copy';
  };

  const chip = (key: RailSelection, label: string, count: number) => (
    <button
      type="button"
      key={key}
      className={`ed-chip${rail === key ? ' ed-chip--active' : ''}`}
      aria-pressed={rail === key}
      onClick={() => selectCategory(key)}
    >
      <span className="ed-chip__label">{label}</span>
      <span className="ed-chip__count">{count}</span>
    </button>
  );

  const railItem = (key: RailSelection, label: string, count: number) => (
    <button
      type="button"
      key={key}
      className={`ed-browser__rail-item${rail === key ? ' ed-browser__rail-item--active' : ''}`}
      aria-pressed={rail === key}
      onClick={() => selectCategory(key)}
    >
      {key !== BROWSER_CATEGORY_ALL && key !== BROWSER_CATEGORY_FAVORITES && (
        <span
          className="ed-browser__rail-dot"
          style={{ backgroundColor: categoryMarkColor(key) }}
          aria-hidden="true"
        />
      )}
      <span className="ed-browser__rail-label">{label}</span>
      <span className="ed-browser__rail-count">{count}</span>
    </button>
  );

  return (
    <aside
      className={`ed-panel ed-panel--fill ed-browser${expanded ? ' ed-browser--expanded' : ' ed-browser--compact'}`}
      aria-label="内容浏览器"
    >
      {/* 顶部行（紧凑/展开共用）：标题 + 读数 + 芯片行 + 搜索 + 双态钮 + 隐藏 × */}
      <div className="ed-browser__bar">
        <span className="ed-browser__title">内容浏览器</span>
        <span className="ed-readout ed-browser__count" aria-live="polite">
          {visible.length}/{entries.length}
        </span>
        <div className="ed-browser__chips" role="group" aria-label="分类筛选">
          {chip(BROWSER_CATEGORY_ALL, '全部', entries.length)}
          {chip(BROWSER_CATEGORY_FAVORITES, '收藏', favoriteCount)}
          {categories.map((c) => chip(c.key, c.label, c.count))}
        </div>
        <input
          className="ed-input ed-browser__search"
          type="search"
          value={browser.search}
          placeholder="搜索名称 / 标签"
          aria-label="搜索资产"
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <button
          type="button"
          className="ed-browser__toggle"
          aria-expanded={expanded}
          title={expanded ? '收起内容浏览器' : '展开内容浏览器'}
          onClick={() => setBrowserExpanded(!expanded)}
        >
          <span className="ed-browser__toggle-caret" aria-hidden="true">
            {expanded ? '▲' : '▼'}
          </span>
          <span className="ed-browser__toggle-text">{expanded ? '收起' : '展开'}</span>
        </button>
        {onHideZone ? (
          <button
            type="button"
            className="ed-frame__hide ed-browser__hide"
            aria-label="隐藏底部浏览器"
            title="隐藏浏览器行（上下文条可恢复）"
            onClick={onHideZone}
          >
            ×
          </button>
        ) : null}
      </div>

      {/* 展开态工具行（T8.3）：标签芯片（聚合去重，点击切换筛选，与分类/搜索 AND 叠加）
          + 排序下拉；紧凑态不渲染（现状回归零） */}
      {expanded ? (
        <div className="ed-browser__tags" role="group" aria-label="标签筛选与排序">
          <div className="ed-browser__chips" aria-label="标签筛选">
            {tagChips.map((chip) => (
              <button
                type="button"
                key={chip.tag}
                className={`ed-chip${tagFilter === chip.tag ? ' ed-chip--active' : ''}`}
                aria-pressed={tagFilter === chip.tag}
                title={tagFilter === chip.tag ? `清除标签筛选「${chip.tag}」` : `筛选标签「${chip.tag}」（与分类/搜索叠加）`}
                onClick={() => setTagFilter(tagFilter === chip.tag ? null : chip.tag)}
              >
                <span className="ed-chip__label">{chip.tag}</span>
                <span className="ed-chip__count">{chip.count}</span>
              </button>
            ))}
            {tagChips.length === 0 ? <span className="ed-readout">清单未含标签</span> : null}
          </div>
          <div className="ed-browser__sort">
            <label className="ed-field__label" htmlFor="browser-sort">
              排序
            </label>
            <div className="ed-select-wrap">
              <select
                id="browser-sort"
                className="ed-input ed-select"
                value={sortKey}
                aria-label="资产排序"
                onChange={(e) => setSortKey(e.target.value as AssetSortKey)}
              >
                <option value="default">默认</option>
                <option value="name">名称</option>
                <option value="category">分类</option>
              </select>
            </div>
          </div>
        </div>
      ) : null}

      {/* 展开态主体：左分类纵栏（含计数）+ 右资产网格 */}
      <div className="ed-browser__body">
        <div className="ed-browser__rail" role="group" aria-label="分类列表">
          {railItem(BROWSER_CATEGORY_ALL, '全部', entries.length)}
          {railItem(BROWSER_CATEGORY_FAVORITES, '收藏', favoriteCount)}
          {categories.map((c) => railItem(c.key, c.label, c.count))}
        </div>
        <div className="ed-browser__grid">
          {entries.length === 0 ? (
            <div className="ed-empty">
              <strong>清单为空</strong>
              运行 <code>npm run assets:scan</code> 扫描模型
              <br />
              占位模型：<code>npm run assets:generate</code>
            </div>
          ) : visible.length === 0 ? (
            <div className="ed-empty">
              <strong>无匹配资产</strong>
              {browser.search.trim() !== '' ? `未命中「${browser.search.trim()}」` : '当前筛选下没有资产'}
            </div>
          ) : (
            <div className="ed-asset-grid" role="list">
              {visible.map((asset) => {
                const placing = activeToolId === 'placement' && placingAssetId === asset.id;
                const starred = favoriteIds.has(asset.id);
                return (
                  <div
                    className={`ed-card${placing ? ' ed-card--active' : ''}`}
                    key={asset.id}
                    role="listitem"
                    data-asset-id={asset.id}
                    draggable
                    onDragStart={(e) => onCardDragStart(e, asset)}
                    onContextMenu={(e) => {
                      e.preventDefault(); // 抑制浏览器默认菜单（T5.8 右键菜单体系）
                      useEditorStore
                        .getState()
                        .openContextMenu({
                          source: 'asset-card',
                          x: e.clientX,
                          y: e.clientY,
                          assetId: asset.id,
                        });
                    }}
                  >
                    <button
                      type="button"
                      className="ed-card__main"
                      onClick={() => onPick(asset)}
                      aria-pressed={placing}
                      title={`${asset.name} · 拖入视口放置或点击进入放置模式`}
                    >
                      <span className="ed-card__thumb">
                        {asset.thumbnail ? (
                          <img src={asset.thumbnail} alt="" loading="lazy" draggable={false} />
                        ) : (
                          <span className="ed-card__glyph" aria-hidden="true">
                            {initialChar(asset.name)}
                          </span>
                        )}
                        {asset.kind === 'procedural' ? (
                          <span
                            className="ed-card__kind"
                            aria-hidden="true"
                            title="程序化资产（代码生成）"
                          >
                            <Boxes size={11} strokeWidth={1.75} />
                          </span>
                        ) : null}
                      </span>
                      <span className="ed-card__name">{asset.name}</span>
                      <span className="ed-card__cat">
                        <span
                          className="ed-card__cat-dot"
                          style={{ backgroundColor: categoryMarkColor(asset.category) }}
                          aria-hidden="true"
                        />
                        {assetCategoryLabel(asset)}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`ed-card__star${starred ? ' ed-card__star--on' : ''}`}
                      onClick={() => onToggleStar(asset.id)}
                      aria-pressed={starred}
                      aria-label={starred ? `取消收藏 ${asset.name}` : `收藏 ${asset.name}`}
                      title={starred ? '取消收藏' : '收藏'}
                    >
                      <StarIcon />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
