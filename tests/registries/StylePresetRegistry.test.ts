/**
 * tests/registries/StylePresetRegistry.test.ts —— 样式预设元数据注册表测试（T6.2，先测后码）。
 *
 * 覆盖：
 * - StylePresetMeta 形态（§B 逐字：id/name/category?/thumbnail?/supportedShapes/supportedSemantics/defaultParams）；
 * - register / get / list 基础语义（模式对齐 T6.1 SemanticRegistry：重复注册抛错、保持注册顺序）；
 * - find(shapeType, semanticType) 双维过滤；
 * - 纯数据边界：永不含构建函数（类型层 + 源码零 THREE 导入自检，主守门仍是 check:layers）。
 */
import { describe, expect, it } from 'vitest';
import type { StyleParameter } from '../../src/domain/styles';
import type { ShapeType } from '../../src/domain/regions';
import { StylePresetRegistry } from '../../src/registries/StylePresetRegistry';
import type { StylePresetMeta } from '../../src/registries/StylePresetRegistry';
// Vite raw import：直接取源码文本做零 THREE 自检（无需 node:fs 类型）
import registrySource from '../../src/registries/StylePresetRegistry.ts?raw';

const ALL_SHAPES: ShapeType[] = ['polygon', 'rectangle', 'circle', 'ellipse', 'freehand', 'line', 'point'];

function makeMeta(over: Partial<StylePresetMeta> = {}): StylePresetMeta {
  return {
    id: 'base.solid',
    name: '实体',
    supportedShapes: ['polygon', 'rectangle'],
    supportedSemantics: ['unclassified', 'grass'],
    defaultParams: [
      { key: 'color', label: '颜色', type: 'color', default: '#909399' },
      { key: 'opacity', label: '透明度', type: 'number', default: 1, min: 0, max: 1 },
    ],
    ...over,
  };
}

describe('StylePresetRegistry（register / get / list）', () => {
  it('空表：list 空、get undefined', () => {
    const registry = new StylePresetRegistry();
    expect(registry.list()).toEqual([]);
    expect(registry.get('base.solid')).toBeUndefined();
  });

  it('register 后 get 可查，list 保持注册顺序', () => {
    const registry = new StylePresetRegistry();
    const a = makeMeta();
    const b = makeMeta({ id: 'water.flow', name: '流动水面' });
    registry.register(a);
    registry.register(b);
    expect(registry.get('base.solid')).toBe(a);
    expect(registry.get('water.flow')).toBe(b);
    expect(registry.list().map((m) => m.id)).toEqual(['base.solid', 'water.flow']);
  });

  it('meta 形态逐字沿 §B：可选 category/thumbnail、defaultParams 沿 StyleParameter', () => {
    const registry = new StylePresetRegistry();
    const params: StyleParameter[] = [
      { key: 'color', label: '颜色', type: 'color', default: '#3E7BFA' },
      { key: 'speed', label: '流速', type: 'number', default: 1, min: 0, max: 4, step: 0.1 },
      { key: 'glow', label: '发光', type: 'boolean', default: false },
      { key: 'mode', label: '模式', type: 'select', default: 'a', options: [{ value: 'a', label: 'A' }] },
    ];
    const meta = makeMeta({ category: 'water', thumbnail: 'thumbnails/water-flow.svg', defaultParams: params });
    registry.register(meta);
    expect(registry.get('base.solid')).toEqual(meta);
    expect(registry.get('base.solid')?.defaultParams).toEqual(params);
  });

  it('重复注册同 id 抛错', () => {
    const registry = new StylePresetRegistry();
    registry.register(makeMeta());
    expect(() => registry.register(makeMeta())).toThrow(/已注册/);
  });

  it('非法 meta（空对象 / 缺 id）抛错', () => {
    const registry = new StylePresetRegistry();
    expect(() => registry.register(null as unknown as StylePresetMeta)).toThrow();
    expect(() => registry.register({} as StylePresetMeta)).toThrow();
    expect(() => registry.register({ name: '无 id' } as unknown as StylePresetMeta)).toThrow();
  });
});

describe('StylePresetRegistry.find（shape × semantic 双维过滤）', () => {
  it('命中：形状与语义都在支持列表内', () => {
    const registry = new StylePresetRegistry();
    registry.register(makeMeta());
    expect(registry.find('polygon', 'unclassified')).toHaveLength(1);
    expect(registry.find('rectangle', 'grass')).toHaveLength(1);
  });

  it('形状不在 supportedShapes → 不返回', () => {
    const registry = new StylePresetRegistry();
    registry.register(makeMeta());
    expect(registry.find('line', 'unclassified')).toEqual([]);
  });

  it('语义不在 supportedSemantics → 不返回', () => {
    const registry = new StylePresetRegistry();
    registry.register(makeMeta());
    expect(registry.find('polygon', 'water')).toEqual([]);
  });

  it('多预设按两维取交集，保持注册顺序', () => {
    const registry = new StylePresetRegistry();
    registry.register(makeMeta({ id: 'a.first', supportedShapes: ALL_SHAPES, supportedSemantics: ['water'] }));
    registry.register(makeMeta({ id: 'a.second', supportedShapes: ['polygon'], supportedSemantics: ['water', 'grass'] }));
    registry.register(makeMeta({ id: 'b.third', supportedShapes: ALL_SHAPES, supportedSemantics: ['poi'] }));
    expect(registry.find('polygon', 'water').map((m) => m.id)).toEqual(['a.first', 'a.second']);
    expect(registry.find('circle', 'poi').map((m) => m.id)).toEqual(['b.third']);
  });
});

describe('scatter 散布配方段（T003.3/D18：同构两段可选）', () => {
  it('可选 scatter 段随 meta 注册存取（纯数据引用透传）', () => {
    const registry = new StylePresetRegistry();
    const scatter = {
      assets: [
        { assetId: 'asset_oak', weight: 40 },
        { assetId: 'asset_bush', weight: 30 },
      ],
      densityPerM2: 0.02,
      clustering: 0.4,
      edgeFalloffM: 2,
      scaleRange: { min: 0.9, max: 1.1 },
    };
    registry.register(makeMeta({ id: 'grass.woodland', scatter }));
    expect(registry.get('grass.woodland')?.scatter).toBe(scatter);
  });

  it('无 scatter 段 = 表面型预设，字段 undefined（存量 meta 不受影响）', () => {
    const registry = new StylePresetRegistry();
    registry.register(makeMeta());
    expect(registry.get('base.solid')?.scatter).toBeUndefined();
  });

  it('find 双维过滤不因 scatter 段改变行为', () => {
    const registry = new StylePresetRegistry();
    registry.register(
      makeMeta({ id: 'grass.woodland', supportedShapes: ALL_SHAPES, scatter: { assets: [{ assetId: 'a', weight: 1 }], densityPerM2: 0.1 } }),
    );
    expect(registry.find('polygon', 'grass').map((m) => m.id)).toEqual(['grass.woodland']);
    expect(registry.find('polygon', 'water')).toEqual([]);
  });
});

describe('分层自检（registries 零 THREE，主守门为 check:layers）', () => {
  it('StylePresetRegistry 源码零 three 导入（重申可导入性与纯数据边界）', () => {
    expect(registrySource).not.toMatch(/\bfrom\s+['"]three(\/|$)/);
    expect(registrySource).not.toMatch(/\bimport\s*\(\s*['"]three(\/|$)/);
  });

  it('注册表实例不含构建函数字段（纯元数据）', () => {
    const registry = new StylePresetRegistry();
    registry.register(makeMeta());
    const stored = registry.get('base.solid');
    expect(stored).toBeDefined();
    for (const value of Object.values(stored as unknown as Record<string, unknown>)) {
      expect(typeof value).not.toBe('function');
    }
  });
});
