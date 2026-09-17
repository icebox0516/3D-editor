/**
 * tests/domain/regions/regionObject.test.ts —— RegionObject 三层结构与类型守卫测试（T6.1，先测后码）。
 *
 * 覆盖：
 * - ShapeType 七类枚举（分域契约 §A 逐字一致）；
 * - isRegionObject 守卫：type 'region' 且 shape/semantic/style 三字段齐备才判真；
 * - RegionObject extends SceneObject 结构（type 字面量 'region'）。
 * 边界：纯数据类型测试，零渲染。
 */
import { describe, expect, it } from 'vitest';
import { createId } from '../../../src/core/id';
import {
  SHAPE_TYPES,
  isRegionObject,
} from '../../../src/domain/regions';
import type { RegionObject } from '../../../src/domain/regions';
import type { SceneObject } from '../../../src/scene/SceneObject';

/** 构造完整合法的 RegionObject 夹具（可用 overrides 覆盖任意字段） */
export function makeRegion(overrides: Partial<RegionObject> = {}): RegionObject {
  return {
    id: createId('region'),
    type: 'region',
    name: '未命名区域 1',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
    shape: {
      type: 'polygon',
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 3 },
        { x: 0, y: 3 },
      ],
      baseHeight: 0,
      closed: true,
    },
    semantic: { type: 'unclassified', properties: {} },
    style: { presetId: 'default_solid', overrides: {} },
    ...overrides,
  };
}

/** 非 region 对象夹具（type 'building'：isRegionObject 必须判否；v1 Element 已删，局部形状即可） */
function makeForeignObject(): SceneObject {
  return {
    id: createId('element'),
    type: 'building',
    name: '建筑',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
  };
}

describe('ShapeType（七类形状枚举）', () => {
  it('与分域契约 §A 逐字一致', () => {
    expect([...SHAPE_TYPES]).toEqual([
      'polygon',
      'rectangle',
      'circle',
      'ellipse',
      'freehand',
      'line',
      'point',
    ]);
  });
});

describe('isRegionObject（RegionObject 类型守卫）', () => {
  it('完整三层结构的 region 对象判真', () => {
    const region = makeRegion();
    expect(isRegionObject(region as SceneObject)).toBe(true);
  });

  it('非 region 类型对象判否', () => {
    expect(isRegionObject(makeForeignObject())).toBe(false);
  });

  it('type 非 region 判否', () => {
    const region = makeRegion({ type: 'building' } as never);
    expect(isRegionObject(region as unknown as SceneObject)).toBe(false);
  });

  it('type 为 region 但缺 shape/semantic/style 任一字段判否', () => {
    const { shape, ...withoutShape } = makeRegion();
    void shape;
    expect(isRegionObject(withoutShape as unknown as SceneObject)).toBe(false);

    const { semantic, ...withoutSemantic } = makeRegion();
    void semantic;
    expect(isRegionObject(withoutSemantic as unknown as SceneObject)).toBe(false);

    const { style, ...withoutStyle } = makeRegion();
    void style;
    expect(isRegionObject(withoutStyle as unknown as SceneObject)).toBe(false);
  });
});

describe('RegionObject 结构（三层字段）', () => {
  it('shape/semantic/style 与契约字段一致', () => {
    const region = makeRegion();
    expect(region.type).toBe('region');
    expect(region.id).toMatch(/^region_/);
    expect(region.shape).toEqual({
      type: 'polygon',
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 3 },
        { x: 0, y: 3 },
      ],
      baseHeight: 0,
      closed: true,
    });
    expect(region.semantic).toEqual({ type: 'unclassified', properties: {} });
    expect(region.style).toEqual({ presetId: 'default_solid', overrides: {} });
  });

  it('shape.options 可选缓存参数（圆半径等派生参数由调用方写入）', () => {
    const region = makeRegion({
      shape: {
        type: 'circle',
        points: [],
        baseHeight: 0,
        closed: true,
        options: { radius: 5, segments: 64 },
      },
    });
    expect(region.shape.options).toEqual({ radius: 5, segments: 64 });
  });
});
