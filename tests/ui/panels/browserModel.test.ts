/**
 * tests/ui/panels/browserModel.test.ts —— Content Browser 纯逻辑测试（先测后码，T5.5）。
 *
 * 覆盖：
 * - 收藏真相源 localStorage（自 tests/ui/assetLibrary.test.ts 等价迁移，T5.5 吸收 assetLibrary.ts）：
 *   toggle 持久化 JSON 数组、损坏 JSON 容错、storage 不可用不抛错；FAVORITES_STORAGE_KEY
 *   键值字符串原样保留（用户既有收藏数据兼容）；
 * - 搜索命中 name / tags（不区分大小写）；分类过滤；收藏过滤与组合（迁移等价）；
 * - 分类数据构建：首次出现顺序、label 取 metadata.categoryLabel 回退 slug、计数（迁移等价）；
 * - 双态派生：isBrowserExpanded（store 展开位 + 底部行高联合判定，拖 splitter 抬高 = 展开）；
 * - 拖放 mime 纯部分：isAssetDrag（dragover 阶段只读 types）/ parseAssetDragId（mime 优先、
 *   text/plain 兜底、空白与缺失 → null）；
 * - 分类色标：categoryMarkColor 确定性（同输入同输出、不同分类可区分、任意 slug 不抛错）；
 * - DEV 分类过滤（T008.1）：visibleBrowserAssets 排除 category=dev（管线验证资产
 *   不进产品栏；分类/标签芯片随过滤上游同步排除）。
 * 边界：纯函数 + 注入 storage，不渲染 DOM（vitest node 环境）；组件壳归浏览器目检。
 */
import { describe, expect, it } from 'vitest';
import type { ModelAsset } from '../../../src/domain/assets';
import {
  ASSET_DRAG_MIME,
  BROWSER_CATEGORY_ALL,
  BROWSER_CATEGORY_FAVORITES,
  FAVORITES_STORAGE_KEY,
  buildCategories,
  buildTagChips,
  categoryMarkColor,
  filterAssets,
  isAssetDrag,
  isBrowserExpanded,
  loadFavoriteIds,
  parseAssetDragId,
  saveFavoriteIds,
  sortAssets,
  toggleFavorite,
  visibleBrowserAssets,
} from '../../../src/ui/panels/browserModel';
import type { BrowserAsset } from '../../../src/ui/panels/browserModel';
import { PANEL_SIZE_SPECS } from '../../../src/ui/layout/workspaceStore';

function makeAsset(partial: Partial<ModelAsset> = {}): ModelAsset {
  return {
    id: 'asset_tree',
    name: '行道树',
    category: 'plant',
    file: 'models/plant/tree.glb',
    tags: ['植物', 'tree'],
    defaultScale: { x: 1, y: 1, z: 1 },
    defaultRotation: { x: 0, y: 0, z: 0 },
    metadata: { categoryLabel: '植物' },
    ...partial,
  };
}

/** fake localStorage：内存 Map，可模拟跨刷新（同一实例重复 load） */
function fakeStorage(): Storage & { written: string[] } {
  const data = new Map<string, string>();
  return {
    length: 0,
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: () => null,
    removeItem: (key: string) => void data.delete(key),
    setItem: (key: string, value: string) => void data.set(key, value),
    get written() {
      return [...data.keys()];
    },
  } as never;
}

const ASSETS: ModelAsset[] = [
  makeAsset(),
  makeAsset({
    id: 'asset_car',
    name: '轿车',
    category: 'vehicle',
    file: 'models/vehicle/car.glb',
    tags: ['车辆', 'car'],
    metadata: { categoryLabel: '车辆' },
  }),
  makeAsset({
    id: 'asset_pavilion',
    name: '凉亭',
    category: 'building',
    file: 'models/building/pavilion.glb',
    tags: ['建筑', 'pavilion'],
    metadata: { categoryLabel: '建筑' },
  }),
];

describe('收藏：localStorage 真相源（自 assetLibrary.test.ts 迁移）', () => {
  it('存储键字符串原样保留（既有用户收藏数据兼容）', () => {
    expect(FAVORITES_STORAGE_KEY).toBe('t3d-editor.asset-favorites');
  });

  it('空 / 损坏 JSON / 非数组 → 空 Set，不抛错', () => {
    const storage = fakeStorage();
    expect(loadFavoriteIds(storage).size).toBe(0);
    storage.setItem(FAVORITES_STORAGE_KEY, '{oops');
    expect(loadFavoriteIds(storage).size).toBe(0);
    storage.setItem(FAVORITES_STORAGE_KEY, '"just a string"');
    expect(loadFavoriteIds(storage).size).toBe(0);
  });

  it('数组中的非字符串项被过滤', () => {
    const storage = fakeStorage();
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(['asset_tree', 42, null]));
    expect([...loadFavoriteIds(storage)]).toEqual(['asset_tree']);
  });

  it('toggle 持久化；从同一 storage 重读得到新集合（跨刷新保留）', () => {
    const storage = fakeStorage();
    const toggled = toggleFavorite('asset_tree', loadFavoriteIds(storage), storage);
    expect(toggled.has('asset_tree')).toBe(true);

    // 模拟刷新：组件重新 mount 后重新 load
    const reloaded = loadFavoriteIds(storage);
    expect(reloaded.has('asset_tree')).toBe(true);

    const removed = toggleFavorite('asset_tree', reloaded, storage);
    expect(removed.has('asset_tree')).toBe(false);
    expect(loadFavoriteIds(storage).has('asset_tree')).toBe(false);
  });

  it('storage 不可用（null）：读写均不抛错，返回空集合', () => {
    expect(loadFavoriteIds(null).size).toBe(0);
    expect(saveFavoriteIds(['a'], null)).toBeUndefined();
    expect(toggleFavorite('a', loadFavoriteIds(null), null).has('a')).toBe(true);
  });
});

describe('filterAssets：搜索 / 分类 / 收藏（迁移等价）', () => {
  it('无过滤 → 全量', () => {
    expect(filterAssets(ASSETS, {})).toHaveLength(3);
  });

  it('搜索命中 name（不区分大小写）', () => {
    expect(filterAssets(ASSETS, { query: '轿车' }).map((a) => a.id)).toEqual(['asset_car']);
    expect(filterAssets(ASSETS, { query: '凉亭' }).map((a) => a.id)).toEqual(['asset_pavilion']);
    expect(filterAssets(ASSETS, { query: '消防' })).toEqual([]); // 无命中
  });

  it('搜索命中 tags（不区分大小写）', () => {
    expect(filterAssets(ASSETS, { query: 'CAR' }).map((a) => a.id)).toEqual(['asset_car']);
    expect(filterAssets(ASSETS, { query: 'tree' }).map((a) => a.id)).toEqual(['asset_tree']);
  });

  it('空白关键词 → 不过滤（全量，UI 清空输入框语义）', () => {
    expect(filterAssets(ASSETS, { query: '   ' })).toHaveLength(3);
  });

  it('分类过滤', () => {
    expect(filterAssets(ASSETS, { category: 'vehicle' }).map((a) => a.id)).toEqual(['asset_car']);
    expect(filterAssets(ASSETS, { category: 'plant' }).map((a) => a.id)).toEqual(['asset_tree']);
  });

  it('收藏过滤与组合过滤', () => {
    const favorites = new Set(['asset_tree', 'asset_pavilion']);
    expect(filterAssets(ASSETS, { favoritesOnly: true, favoriteIds: favorites }).map((a) => a.id)).toEqual([
      'asset_tree',
      'asset_pavilion',
    ]);
    expect(
      filterAssets(ASSETS, { query: '亭', favoritesOnly: true, favoriteIds: favorites }).map((a) => a.id),
    ).toEqual(['asset_pavilion']);
    expect(filterAssets(ASSETS, { category: 'vehicle', favoritesOnly: true, favoriteIds: favorites })).toEqual([]);
  });
});

describe('buildCategories：分类数据（迁移等价）', () => {
  it('首次出现顺序 + label 取 categoryLabel 回退 slug + 计数', () => {
    const withUnknown: ModelAsset[] = [
      ...ASSETS,
      makeAsset({ id: 'asset_rock', name: 'rock', category: 'misc', file: 'models/misc/rock.glb', tags: [], metadata: undefined }),
    ];
    const cats = buildCategories(withUnknown);
    expect(cats).toEqual([
      { key: 'plant', label: '植物', count: 1 },
      { key: 'vehicle', label: '车辆', count: 1 },
      { key: 'building', label: '建筑', count: 1 },
      { key: 'misc', label: 'misc', count: 1 },
    ]);
  });

  it('同分类聚合计数', () => {
    const two = [
      makeAsset(),
      makeAsset({ id: 'asset_bush', name: '灌木', file: 'models/plant/bush.glb' }),
    ];
    expect(buildCategories(two)).toEqual([{ key: 'plant', label: '植物', count: 2 }]);
  });
});

describe('isBrowserExpanded：双态派生（展开位 ∨ 行高超出紧凑高）', () => {
  const COMPACT = PANEL_SIZE_SPECS.bottom.min; // 60

  it('未展开且行高 = 紧凑高 → 紧凑态', () => {
    expect(isBrowserExpanded(false, COMPACT)).toBe(false);
    expect(isBrowserExpanded(false, PANEL_SIZE_SPECS.bottom.default)).toBe(false);
  });

  it('展开位为 true → 展开态（无论行高）', () => {
    expect(isBrowserExpanded(true, COMPACT)).toBe(true);
    expect(isBrowserExpanded(true, 280)).toBe(true);
  });

  it('拖 Splitter 把行高抬出紧凑高 → 视为展开（即使展开位仍 false）', () => {
    expect(isBrowserExpanded(false, COMPACT + 1)).toBe(true);
    expect(isBrowserExpanded(false, 320)).toBe(true);
  });

  it('分类哨兵常量：全部 / 收藏（与 filterAssets 语义对齐）', () => {
    expect(BROWSER_CATEGORY_ALL).toBe('all');
    expect(BROWSER_CATEGORY_FAVORITES).toBe('__favorites__');
    expect(filterAssets(ASSETS, { category: BROWSER_CATEGORY_ALL })).toHaveLength(3);
  });
});

describe('拖放 mime 纯部分', () => {
  it('isAssetDrag：types 含自定义 mime 才视为资产拖拽（dragover 只读 types）', () => {
    expect(isAssetDrag([ASSET_DRAG_MIME])).toBe(true);
    expect(isAssetDrag(['text/plain', ASSET_DRAG_MIME])).toBe(true);
    expect(isAssetDrag(['text/plain'])).toBe(false);
    expect(isAssetDrag([])).toBe(false);
  });

  it('mime 常量为 application/x-asset-id（跨组件约定）', () => {
    expect(ASSET_DRAG_MIME).toBe('application/x-asset-id');
  });

  it('parseAssetDragId：mime 优先，text/plain 兜底，首尾空白裁剪', () => {
    expect(parseAssetDragId('asset_tree', 'ignored')).toBe('asset_tree');
    expect(parseAssetDragId('  asset_tree  ', '')).toBe('asset_tree');
    expect(parseAssetDragId('', 'asset_car')).toBe('asset_car');
  });

  it('parseAssetDragId：两路都缺失 / 纯空白 → null（非法载荷不产生命令）', () => {
    expect(parseAssetDragId('', '')).toBeNull();
    expect(parseAssetDragId('   ', '  ')).toBeNull();
  });
});

describe('categoryMarkColor：分类色标（确定性）', () => {
  it('同输入同输出（跨会话稳定）', () => {
    expect(categoryMarkColor('plant')).toBe(categoryMarkColor('plant'));
    expect(categoryMarkColor('vehicle')).toBe(categoryMarkColor('vehicle'));
  });

  it('不同分类产生可区分颜色（常见 slug 抽样）', () => {
    const colors = new Set(['plant', 'vehicle', 'building', 'misc'].map((slug) => categoryMarkColor(slug)));
    expect(colors.size).toBeGreaterThan(1);
  });

  it('任意 slug（含空串 / Unicode）不抛错且返回 CSS 颜色串', () => {
    for (const slug of ['', '植物', 'a-very-long-category-slug-name']) {
      const color = categoryMarkColor(slug);
      expect(typeof color).toBe('string');
      expect(color).toMatch(/^hsl\(/);
    }
  });
});

// ── T8.3：标签芯片筛选 + 排序 ─────────────────────────────

describe('filterAssets：标签筛选（T8.3，与分类/搜索 AND 叠加）', () => {
  const pavilion = makeAsset({ id: 'a1', name: '凉亭', category: 'building', tags: ['建筑', '亭'] });
  const tree = makeAsset({ id: 'a2', name: '行道树', category: 'plant', tags: ['植物', '行道'] });
  const bench = makeAsset({ id: 'a3', name: '长椅', category: 'furniture', tags: ['设施', '座椅'] });

  it('单标签：命中含该标签的全部资产（跨分类）', () => {
    const hits = filterAssets([pavilion, tree, bench], { tag: '建筑' });
    expect(hits.map((a) => a.id)).toEqual(['a1']);
  });

  it('标签 × 分类 AND 叠加', () => {
    const hits = filterAssets([pavilion, tree], { tag: '植物', category: 'plant' });
    expect(hits.map((a) => a.id)).toEqual(['a2']);
    expect(filterAssets([pavilion, tree], { tag: '植物', category: 'building' })).toEqual([]);
  });

  it('标签 × 搜索 AND 叠加（搜索仍命中 name/tags）', () => {
    const hits = filterAssets([pavilion, tree], { tag: '亭', query: '凉' });
    expect(hits.map((a) => a.id)).toEqual(['a1']);
    expect(filterAssets([pavilion, tree], { tag: '亭', query: '树' })).toEqual([]);
  });

  it('未指定标签 → 不过滤（向后兼容）', () => {
    expect(filterAssets([pavilion, tree], {})).toHaveLength(2);
  });

  it('无命中标签 → 空结果（不抛错）', () => {
    expect(filterAssets([pavilion], { tag: '不存在' })).toEqual([]);
  });
});

describe('buildTagChips：标签聚合（T8.3）', () => {
  it('全资产 tags 聚合去重 + 计数，顺序 = 首次出现序', () => {
    const a = makeAsset({ id: 'a1', tags: ['建筑', '亭'] });
    const b = makeAsset({ id: 'a2', tags: ['植物', '建筑'] });
    const chips = buildTagChips([a, b]);
    expect(chips).toEqual([
      { tag: '建筑', count: 2 },
      { tag: '亭', count: 1 },
      { tag: '植物', count: 1 },
    ]);
  });

  it('同一资产内重复标签只计一次；空标签串不产出芯片', () => {
    const a = makeAsset({ id: 'a1', tags: ['灯', '灯', ''] });
    expect(buildTagChips([a])).toEqual([{ tag: '灯', count: 1 }]);
  });

  it('空清单 / 全空 tags → 空芯片集', () => {
    expect(buildTagChips([])).toEqual([]);
    expect(buildTagChips([makeAsset({ id: 'a1', tags: [] })])).toEqual([]);
  });
});

describe('sortAssets：排序下拉（T8.3，面板会话态）', () => {
  const pavilion = makeAsset({ id: 'a1', name: '凉亭', category: 'building' });
  const tree = makeAsset({ id: 'a2', name: '行道树', category: 'plant' });
  const bench = makeAsset({ id: 'a3', name: '长椅', category: 'furniture' });

  it('default → 保持传入顺序（现状序）', () => {
    expect(sortAssets([pavilion, tree, bench], 'default').map((a) => a.id)).toEqual([
      'a1',
      'a2',
      'a3',
    ]);
  });

  it('name → 按名称字典序（码点序，跨环境确定性；不依赖 ICU 整理数据）', () => {
    // 输入打乱（长椅/行道树/凉亭）→ 码点序：凉(U+51C9) < 行(U+884C) < 长(U+957F)
    expect(sortAssets([bench, tree, pavilion], 'name').map((a) => a.id)).toEqual([
      'a1',
      'a2',
      'a3',
    ]);
    // ASCII 大小写：大写码点在前（确定性）
    const upper = makeAsset({ id: 'u', name: 'Zeta' });
    const lower = makeAsset({ id: 'l', name: 'alpha' });
    expect(sortAssets([lower, upper], 'name').map((a) => a.id)).toEqual(['u', 'l']);
  });

  it('category → 按分类首现序归组，组内保持原序（稳定）', () => {
    // 传入顺序 plant 在前、building 其次、furniture 最后 → 组间按首现序
    expect(sortAssets([tree, pavilion, bench, tree], 'category').map((a) => a.id)).toEqual([
      'a2',
      'a2',
      'a1',
      'a3',
    ]);
  });
});

describe('混排（T002.2，D7/D13）：GLB 与程序化条目一视同仁', () => {
  /** 混排夹具：2 GLB（makeAsset，带 categoryLabel）+ 2 程序化（BrowserAsset 字面量——D17 meta 形态：无 file/metadata/thumbnail） */
  const MIXED: BrowserAsset[] = [
    makeAsset({
      id: 'asset_pavilion',
      name: '凉亭',
      category: 'building',
      tags: ['建筑', 'pavilion'],
      metadata: { categoryLabel: '建筑' },
    }),
    {
      id: 'asset_trashbin',
      name: '垃圾桶',
      category: 'facility',
      tags: ['设施', 'trashbin'],
      defaultScale: { x: 1, y: 1, z: 1 },
      defaultRotation: { x: 0, y: 0, z: 0 },
    },
    {
      id: 'asset_bench',
      name: '长椅',
      category: 'facility',
      tags: ['设施'],
      defaultScale: { x: 1, y: 1, z: 1 },
      defaultRotation: { x: 0, y: 0, z: 0 },
    },
    makeAsset({
      id: 'asset_car',
      name: '轿车',
      category: 'vehicle',
      tags: ['车辆'],
      metadata: { categoryLabel: '车辆' },
    }),
  ];

  it('搜索命中程序化条目的 name / tags（大小写不敏感）', () => {
    expect(filterAssets(MIXED, { query: '垃圾桶' }).map((a) => a.id)).toEqual(['asset_trashbin']);
    expect(filterAssets(MIXED, { query: 'TRASH' }).map((a) => a.id)).toEqual(['asset_trashbin']);
  });

  it('分类过滤对程序化分类（无 categoryLabel 的 slug）同样生效', () => {
    expect(filterAssets(MIXED, { category: 'facility' }).map((a) => a.id)).toEqual([
      'asset_trashbin',
      'asset_bench',
    ]);
  });

  it('标签筛选跨 kind 聚合命中（GLB 与程序化共享标签空间）', () => {
    expect(filterAssets(MIXED, { tag: '设施' }).map((a) => a.id)).toEqual([
      'asset_trashbin',
      'asset_bench',
    ]);
  });

  it('收藏过滤：程序化 id 与 GLB id 同一收藏集合', () => {
    const favoriteIds = new Set(['asset_trashbin', 'asset_car']);
    expect(filterAssets(MIXED, { favoritesOnly: true, favoriteIds }).map((a) => a.id)).toEqual([
      'asset_trashbin',
      'asset_car',
    ]);
  });

  it('buildCategories：混排聚合计数；程序化分类 label 回退 slug、GLB 取 categoryLabel', () => {
    expect(buildCategories(MIXED)).toEqual([
      { key: 'building', label: '建筑', count: 1 },
      { key: 'facility', label: 'facility', count: 2 },
      { key: 'vehicle', label: '车辆', count: 1 },
    ]);
  });

  it('buildTagChips：程序化 tags 与 GLB tags 同一聚合（首现序）', () => {
    const chips = buildTagChips(MIXED);
    expect(chips.find((c) => c.tag === '设施')).toEqual({ tag: '设施', count: 2 });
    expect(chips.map((c) => c.tag)).toEqual(['建筑', 'pavilion', '设施', 'trashbin', '车辆']);
  });

  it('sortAssets：name 字典序混排生效（两种 kind 交错归位）', () => {
    // 码点序：凉(U+51C9) < 垃(U+5783) < 轿(U+8F7C) < 长(U+957F)——GLB/程序化交错
    expect(sortAssets(MIXED, 'name').map((a) => a.id)).toEqual([
      'asset_pavilion',
      'asset_trashbin',
      'asset_car',
      'asset_bench',
    ]);
  });
});

describe('DEV 分类过滤（T008.1：管线验证资产不进产品栏）', () => {
  const WITH_DEV = [
    ...ASSETS,
    makeAsset({
      id: 'asset_seedstack',
      name: 'DEV·种子塔',
      category: 'dev',
      file: 'models/dev/seedstack.glb',
      tags: ['dev', 'seedstack'],
    }),
  ];

  it('visibleBrowserAssets：过滤 category=dev，其余原样保留（含顺序）', () => {
    expect(visibleBrowserAssets(WITH_DEV).map((a) => a.id)).toEqual([
      'asset_tree',
      'asset_car',
      'asset_pavilion',
    ]);
  });

  it('过滤上游一处生效：分类芯片与标签芯片均不含 dev 条目', () => {
    const visible = visibleBrowserAssets(WITH_DEV);
    expect(buildCategories(visible).map((c) => c.key)).not.toContain('dev');
    expect(buildTagChips(visible).map((c) => c.tag)).not.toContain('seedstack');
  });
});
