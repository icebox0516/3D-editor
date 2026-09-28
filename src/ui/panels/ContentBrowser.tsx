/**
 * ui/panels/ContentBrowser —— 底部内容浏览器（T5.5，自左栏 AssetLibraryPanel 升级吸收）。
 *
 * 双态结构：
 *   - 紧凑态（60px 默认）：单行 = 标题 + 命中读数 + 分类芯片行（全部/收藏/各分类，横向滚动）
 *     + 搜索框 + 展开钮 + 隐藏 ×；点芯片 = 选定分类并同时展开；输入搜索词自动展开。
 *   - 展开态（280px 目标高）：顶部行同紧凑态（展开钮转收起钮）+ 资产网格卡片
 *     （缩略图 + 名称 + 分类色标 + 收藏星标），网格占满 body（T022：标签行与
 *     左分类纵栏已删，分类切换只走 bar 芯片一行）。
 * 交互：
 *   - 点击卡片 → onPick（组合根激活 placement 工具；随机采样语义在工具内，本面板不感知）；
 *   - 拖拽卡片 → dragstart 写 dataTransfer（application/x-asset-id + text/plain 兜底），
 *     视口侧 dragover/drop 接线在 App 层（ui 不 import app）；
 *   - 右键卡片 → store.openContextMenu('asset-card')（T5.8 四类上下文菜单之一；
 *     添加到场景 = 点击放置同路，其余项 P1 占位禁用）；
 *   - 收藏星标 → localStorage 持久化（browserModel 唯一真相源）；
 *   - 色卡色点（T024.4）→ 卡片右下覆盖条（presets.length>1 才渲染）：点选持久化
 *     localStorage（browserModel 唯一真相源，默认卡省略不落盘）并即时生效于放置入口；
 *     正在放置该资产时点色点 = 重激活换卡（onPick 在事件时刻读到新选中）；
 *     拖拽卡片随色卡写 preset mime（仅非默认卡）。
 * 混排（T002.2，D7/D13）：数据源 = 统一 AssetDescriptor（GLB file 与程序化 procedural
 *   同库混排，过滤/搜索/收藏对两者一视同仁）；程序化卡片左上角 kind 角标区分来源
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
import type { AssetColorPresetMeta, AssetCommonMeta, AssetDescriptor } from '../../domain/assets';
import { DEFAULT_COLOR_PRESET_ID, resolveDeclaredPreset } from '../../domain/assets';
import { useEditorStore } from '../store';
import { useWorkspaceStore } from '../layout/workspaceStore';
import {
  ASSET_DRAG_MIME,
  ASSET_PRESET_DRAG_MIME,
  BROWSER_CATEGORY_ALL,
  BROWSER_CATEGORY_DEV,
  BROWSER_CATEGORY_FAVORITES,
  assetCategoryLabel,
  buildCategories,
  categoryMarkColor,
  filterAssets,
  isBrowserExpanded,
  loadFavoriteIds,
  loadPresetSelection,
  selectAssetPreset,
  toggleFavorite,
} from './browserModel';
import type { BrowserAsset, PresetSelectionMap } from './browserModel';

/** 混排卡片视图条目：BrowserAsset 公共面 + 渲染附加（kind 标注 + 缩略图归一） */
interface BrowserEntry extends BrowserAsset {
  kind: AssetDescriptor['kind'];
  /** file → manifest SVG 占位/离屏快照；procedural → 离屏快照回填（未就绪 undefined → 字形占位） */
  thumbnail?: string;
  /** 色卡声明（T024.4；仅 procedural 携带——`...d.asset` spread 自然带入，file/GLB 无此字段） */
  presets?: readonly AssetColorPresetMeta[];
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

  const expanded = isBrowserExpanded(browser.expanded, bottomHeight);

  // 收藏真相源 localStorage：初始一次读入，切换即持久化（不进 zustand——面板私有状态）
  const [favoriteIds, setFavoriteIds] = useState(() => loadFavoriteIds());
  // 色卡选中真相源 localStorage（T024.4）：同收藏先例——初始一次读入，切换即持久化
  const [presetSelection, setPresetSelection] = useState<PresetSelectionMap>(() => loadPresetSelection());

  /** 混排视图条目：描述符解包（公共面 + kind + 缩略图归一）；BrowserEntry 结构兼容 BrowserAsset。
   *  DEV 分类先过滤（T008.1：管线验证资产不进产品栏——列表/分类芯片共用 entries） */
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
  const favoriteCount = useMemo(
    () => entries.reduce((n, a) => n + (favoriteIds.has(a.id) ? 1 : 0), 0),
    [entries, favoriteIds],
  );
  const visible = useMemo(
    () =>
      filterAssets(entries, {
        query: browser.search,
        category:
          browser.category === BROWSER_CATEGORY_FAVORITES
            ? BROWSER_CATEGORY_ALL
            : browser.category,
        favoritesOnly: browser.category === BROWSER_CATEGORY_FAVORITES,
        favoriteIds,
      }),
    [entries, browser.search, browser.category, favoriteIds],
  );

  const onToggleStar = (assetId: string): void => {
    setFavoriteIds(toggleFavorite(assetId, favoriteIds));
  };

  /** 点选色卡（T024.4）：持久化新选中；正放置该资产 → 重激活（App 事件时刻读到新选中，Ghost 立即换卡） */
  const onSelectPreset = (asset: BrowserEntry, cardId: string): void => {
    setPresetSelection(selectAssetPreset(asset.id, cardId, presetSelection));
    if (activeToolId === 'placement' && placingAssetId === asset.id) onPick(asset);
  };

  /** 选中一个分类：紧凑态点芯片 = 选分类并同时展开（任务书 21 章）；展开态仅切换 */
  const selectCategory = (key: string): void => {
    setBrowserCategory(key);
    if (!expanded) setBrowserExpanded(true);
  };

  /** 搜索：紧凑态输入非空词自动展开（60px 行内无结果区，展开给出即时反馈） */
  const onSearchChange = (value: string): void => {
    setBrowserSearch(value);
    if (!expanded && value.trim() !== '') setBrowserExpanded(true);
  };

  const onCardDragStart = (e: DragEvent<HTMLDivElement>, asset: BrowserEntry): void => {
    e.dataTransfer.setData(ASSET_DRAG_MIME, asset.id);
    e.dataTransfer.setData('text/plain', asset.id); // 跨应用兜底（拖入文本目标仍是资产 id）
    // 色卡随拖（T024.4）：仅非默认卡写 preset mime（default/未声明 → 不写，App 读侧宽容回默认卡）
    const preset = resolveDeclaredPreset(asset.presets, presetSelection[asset.id]);
    if (preset !== undefined) e.dataTransfer.setData(ASSET_PRESET_DRAG_MIME, preset);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const chip = (key: string, label: string, count: number) => (
    <button
      type="button"
      key={key}
      className={`ed-chip${browser.category === key ? ' ed-chip--active' : ''}`}
      aria-pressed={browser.category === key}
      onClick={() => selectCategory(key)}
    >
      <span className="ed-chip__label">{label}</span>
      <span className="ed-chip__count">{count}</span>
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

      {/* 展开态主体：资产网格（T022：标签/排序工具行与左分类纵栏已删，占满 body） */}
      <div className="ed-browser__body">
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
                // 色卡（T024.4）：多卡才渲染色点条（单卡/空表/GLB 不出）；激活卡 id 按声明表
                // 校验派生（已删卡宽容回退 default），点 default 卡 = 删条目自然派生回默认卡
                const cards = asset.presets ?? [];
                const hasPresets = cards.length > 1;
                const activeCard = hasPresets
                  ? (resolveDeclaredPreset(cards, presetSelection[asset.id]) ?? DEFAULT_COLOR_PRESET_ID)
                  : null;
                return (
                  <div
                    className={`ed-card${placing ? ' ed-card--active' : ''}${hasPresets ? ' ed-card--presetted' : ''}`}
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
                    {hasPresets ? (
                      <span className="ed-card__presets" role="group" aria-label={`${asset.name} 色卡`}>
                        {cards.map((card) => {
                          const active = card.id === activeCard;
                          return (
                            <button
                              type="button"
                              key={card.id}
                              className={`ed-card__preset-dot${active ? ' ed-card__preset-dot--on' : ''}`}
                              style={{ backgroundColor: card.swatch }}
                              aria-pressed={active}
                              aria-label={`色卡 ${card.label}`}
                              title={active ? `当前色卡：${card.label}` : `切换到「${card.label}」`}
                              onClick={() => onSelectPreset(asset, card.id)}
                            />
                          );
                        })}
                      </span>
                    ) : null}
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
