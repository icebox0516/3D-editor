/**
 * tests/domain/regions/footprint.test.ts —— 道路条带半宽派生测试（T8.1 R3，先测后码）。
 *
 * 覆盖：line+road 显式 width → 半宽；缺省回退语义定义默认 6/2；polygon 形状 road
 * （width 忽略）、非 road 语义、model → 恒 0；非法 width 回退默认。
 */
import { describe, expect, it } from 'vitest';
import type { ModelObject } from '../../../src/domain/assets';
import { createRegionObject } from '../../../src/domain/regions';
import type { RegionObject } from '../../../src/domain/regions';
import { roadBandHalfWidth } from '../../../src/domain/regions';
import type { SceneObject } from '../../../src/scene/SceneObject';

function makeLineRegion(overrides: {
  semantic?: string;
  shapeType?: 'line' | 'polygon';
  width?: number;
}): RegionObject {
  const { semantic = 'road', shapeType = 'line', width } = overrides;
  const region = createRegionObject({
    shape: {
      type: shapeType,
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      baseHeight: 0.06,
      closed: false,
    },
    semanticType: semantic as RegionObject['semantic']['type'],
  });
  if (width !== undefined) region.semantic.properties = { width };
  return region;
}

function makeModel(): ModelObject {
  return {
    id: 'model_f',
    type: 'model',
    name: 'm',
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
    asset: { assetId: 'asset_x' },
  };
}

describe('roadBandHalfWidth · 条带半宽', () => {
  it('line + road 显式 width=8 → 4', () => {
    expect(roadBandHalfWidth(makeLineRegion({ width: 8 }) as SceneObject)).toBe(4);
  });

  it('缺省 width → 回退语义定义默认 6 → 3', () => {
    expect(roadBandHalfWidth(makeLineRegion({}) as SceneObject)).toBe(3);
  });

  it('非法 width（0/负/NaN）→ 回退默认 3', () => {
    expect(roadBandHalfWidth(makeLineRegion({ width: 0 }) as SceneObject)).toBe(3);
    expect(roadBandHalfWidth(makeLineRegion({ width: -2 }) as SceneObject)).toBe(3);
    expect(roadBandHalfWidth(makeLineRegion({ width: Number.NaN }) as SceneObject)).toBe(3);
  });

  it('polygon 形状 road（width 忽略）/ 非 road 语义 / model → 恒 0', () => {
    expect(roadBandHalfWidth(makeLineRegion({ shapeType: 'polygon', width: 8 }) as SceneObject)).toBe(0);
    expect(roadBandHalfWidth(makeLineRegion({ semantic: 'building' }) as SceneObject)).toBe(0);
    expect(roadBandHalfWidth(makeModel() as SceneObject)).toBe(0);
  });
});
