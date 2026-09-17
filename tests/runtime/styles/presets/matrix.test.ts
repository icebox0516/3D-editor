/**
 * tests/runtime/styles/presets/matrix.test.ts —— T6.3 预设库全量矩阵测试（任务书 F.3）。
 *
 * 覆盖：
 * - 收割清单：25 套插件 meta（24 正式 = 21 新 + default_solid/default_wireframe/test.shader，
 *   另 T003.3 dev 散布冒烟临时 1 套——003.5 处置），id 唯一；
 * - meta 完整性：category 命名空间前段 / thumbnail data-URI SVG ≤300 字符 / 参数形态 /
 *   supportedShapes·supportedSemantics 声明锁定（面类五 / line / point / 全七全十）；
 * - 过滤矩阵：shape(7) × semantic(10) 全网格，StylePresetRegistry.find 结果与各 meta
 *   supportedShapes×supportedSemantics 声明逐格一致；
 * - 交叉验证：semanticDefinitions.defaultPresetId 指向的预设均在库内且可构建（isPresetBuildable）。
 */
import { describe, expect, it } from 'vitest';
import { SEMANTIC_TYPES, SHAPE_TYPES } from '../../../../src/domain/regions';
import type { SemanticType, ShapeType } from '../../../../src/domain/regions';
import { getSemanticDefinition } from '../../../../src/domain/regions';
import { StylePresetRegistry } from '../../../../src/registries';
import {
  collectPresetPluginMetas,
  isPresetBuildable,
} from '../../../../src/runtime/styles/routes';
import { assertDefaultParamsForm } from './helpers';

/** T6.3 预设库全量清单（24 套 = 21 新 + 3 既有测试/基线插件；另 T003.3 dev 散布冒烟临时 1 套，003.5 处置） */
const EXPECTED_PRESET_IDS = [
  // 既有（T6.2）
  'default_solid', 'default_wireframe', 'test.shader',
  // 迁移 10
  'water.standard', 'water.dynamic', 'water.tech',
  'grass.lawn', 'grass.landscape', 'grass.tech',
  'parking.standard', 'parking.tech',
  'road.standard', 'road.asphalt',
  // 新增 9
  'plaza.paving', 'plaza.stone', 'plaza.tech',
  'base.flat', 'base.holo', 'base.grid',
  'poi.billboard', 'poi.beam', 'poi.marker',
  // 改造 2
  'building.default', 'building.modern',
  // T003.3 临时（端到端验收用 dev 散布配方；003.5 正式样式落地时移除本行）
  'dev.scatter_smoke',
] as const;

const SURFACE_FIVE: ShapeType[] = ['polygon', 'rectangle', 'circle', 'ellipse', 'freehand'];
const ALL_SEVEN: ShapeType[] = [...SHAPE_TYPES];
const ALL_TEN: SemanticType[] = [...SEMANTIC_TYPES];

/** T6.3 交付的 21 套（既有 3 套 T6.2 插件与 T003.3 dev 临时件不在 thumbnail 公共要求内） */
const NON_T63_IDS = new Set([
  'default_solid', 'default_wireframe', 'test.shader', 'dev.scatter_smoke',
]);
const T63_PRESET_IDS = EXPECTED_PRESET_IDS.filter((id) => !NON_T63_IDS.has(id));

describe('T6.3 预设库收割清单', () => {
  const metas = collectPresetPluginMetas();

  it('恰好 25 套（24 正式 + 1 dev 临时），id 唯一且与清单逐字一致', () => {
    expect(metas.map((m) => m.id).sort()).toEqual([...EXPECTED_PRESET_IDS].sort());
    expect(new Set(metas.map((m) => m.id)).size).toBe(25);
  });

  it('全部 25 套均有构建路由（meta 无 build 名单为空，无灰显预设）', () => {
    for (const id of EXPECTED_PRESET_IDS) expect(isPresetBuildable(id)).toBe(true);
  });

  it('meta 完整性：category 命名空间前段 + 参数形态 + 声明合法（全 25 套）', () => {
    for (const meta of metas) {
      expect(meta.category, `${meta.id} category`).toBeTruthy();
      if (meta.id.includes('.')) {
        expect(meta.category).toBe(meta.id.split('.')[0]);
      }
      assertDefaultParamsForm(meta);
      expect(meta.supportedShapes.length).toBeGreaterThan(0);
      expect(meta.supportedSemantics.length).toBeGreaterThan(0);
      for (const shape of meta.supportedShapes) expect(SHAPE_TYPES).toContain(shape);
      for (const semantic of meta.supportedSemantics) expect(SEMANTIC_TYPES).toContain(semantic);
    }
  });

  it('thumbnail：T6.3 交付 21 套均为 data-URI SVG 静态色块且 ≤300 字符（任务书 D 公共要求）', () => {
    expect(T63_PRESET_IDS).toHaveLength(21);
    for (const id of T63_PRESET_IDS) {
      const meta = metas.find((m) => m.id === id)!;
      expect(meta.thumbnail, `${id} thumbnail`).toBeTruthy();
      expect(meta.thumbnail!.startsWith('data:image/svg+xml,')).toBe(true);
      expect(meta.thumbnail!.length, `${id} thumbnail ≤300 字符`).toBeLessThanOrEqual(300);
    }
  });
});

describe('supportedShapes / supportedSemantics 声明锁定', () => {
  it('面类预设（water×3 / grass×3 / parking×2 / plaza×3 / building×2）= 面类五形状 × 单语义', () => {
    const surfaceCases: ReadonlyArray<readonly [string, SemanticType]> = [
      ['water.standard', 'water'], ['water.dynamic', 'water'], ['water.tech', 'water'],
      ['grass.lawn', 'grass'], ['grass.landscape', 'grass'], ['grass.tech', 'grass'],
      ['parking.standard', 'parking'], ['parking.tech', 'parking'],
      ['plaza.paving', 'plaza'], ['plaza.stone', 'plaza'], ['plaza.tech', 'plaza'],
      ['building.default', 'building'], ['building.modern', 'building'],
    ];
    for (const [id, semantic] of surfaceCases) {
      const meta = collectPresetPluginMetas().find((m) => m.id === id)!;
      expect(meta.supportedShapes, id).toEqual(SURFACE_FIVE);
      expect(meta.supportedSemantics, id).toEqual([semantic]);
    }
  });

  it('道路（road×2）= 面类五形状 + line × [road]（T6.4 R2：polygon 形状 + road 语义走平面贴地渲染）', () => {
    for (const id of ['road.standard', 'road.asphalt']) {
      const meta = collectPresetPluginMetas().find((m) => m.id === id)!;
      expect(meta.supportedShapes, id).toEqual([...SURFACE_FIVE, 'line']);
      expect(meta.supportedSemantics, id).toEqual(['road']);
    }
  });

  it('poi 三套 = [point] × [poi]', () => {
    for (const id of ['poi.billboard', 'poi.beam', 'poi.marker']) {
      const meta = collectPresetPluginMetas().find((m) => m.id === id)!;
      expect(meta.supportedShapes, id).toEqual(['point']);
      expect(meta.supportedSemantics, id).toEqual(['poi']);
    }
  });

  it('base 通用三套（flat/holo/grid）= 全七形状 × 全十语义', () => {
    for (const id of ['base.flat', 'base.holo', 'base.grid']) {
      const meta = collectPresetPluginMetas().find((m) => m.id === id)!;
      expect(meta.supportedShapes, id).toEqual(ALL_SEVEN);
      expect(meta.supportedSemantics, id).toEqual(ALL_TEN);
    }
  });
});

describe('过滤矩阵（shape × semantic 全网格，验收项）', () => {
  const registry = new StylePresetRegistry();
  for (const meta of collectPresetPluginMetas()) registry.register(meta);

  it('find 结果与各 meta 声明逐格一致（7 × 10 = 70 格）', () => {
    for (const shape of SHAPE_TYPES) {
      for (const semantic of SEMANTIC_TYPES) {
        const found = registry.find(shape, semantic).map((m) => m.id).sort();
        const declared = collectPresetPluginMetas()
          .filter((m) => m.supportedShapes.includes(shape) && m.supportedSemantics.includes(semantic))
          .map((m) => m.id)
          .sort();
        expect(found, `find(${shape}, ${semantic})`).toEqual(declared);
      }
    }
  });

  it('任意格必含兜底基线 default_solid（降级保证）', () => {
    for (const shape of SHAPE_TYPES) {
      for (const semantic of SEMANTIC_TYPES) {
        expect(registry.find(shape, semantic).map((m) => m.id)).toContain('default_solid');
      }
    }
  });

  it('抽样：水面格含水三套不含道路；道路线格只增 road×2 与全形状基线；道路面格含 road×2（R2 扩形）；POI 点格含 poi 三套', () => {
    const waterCell = registry.find('polygon', 'water').map((m) => m.id);
    expect(waterCell).toContain('water.standard');
    expect(waterCell).not.toContain('road.standard');
    expect(waterCell).not.toContain('poi.billboard');

    const roadCell = registry.find('line', 'road').map((m) => m.id).sort();
    expect(roadCell).toEqual([
      'base.flat', 'base.grid', 'base.holo', 'default_solid', 'default_wireframe',
      'road.asphalt', 'road.standard', 'test.shader',
    ].sort());

    // R2（T6.4）：polygon 形状 + road 语义端到端成立（平面贴地渲染，width 忽略）
    const roadSurfaceCell = registry.find('polygon', 'road').map((m) => m.id);
    expect(roadSurfaceCell).toContain('road.standard');
    expect(roadSurfaceCell).toContain('road.asphalt');
    expect(roadSurfaceCell).not.toContain('poi.billboard');

    const poiCell = registry.find('point', 'poi').map((m) => m.id);
    expect(poiCell).toContain('poi.billboard');
    expect(poiCell).toContain('poi.beam');
    expect(poiCell).toContain('poi.marker');
    expect(poiCell).not.toContain('water.standard');
  });
});

describe('defaultPresetId 交叉验证（semanticDefinitions ↔ 预设库）', () => {
  it('十类语义的默认预设均在库内且可构建', () => {
    for (const semantic of SEMANTIC_TYPES) {
      const def = getSemanticDefinition(semantic)!;
      const presetId = def.defaultPresetId;
      expect(collectPresetPluginMetas().map((m) => m.id), `${semantic} → ${presetId}`).toContain(presetId);
      expect(isPresetBuildable(presetId), `${presetId} 可构建`).toBe(true);
    }
  });
});
