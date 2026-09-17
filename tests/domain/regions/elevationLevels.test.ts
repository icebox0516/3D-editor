/**
 * tests/domain/regions/elevationLevels.test.ts —— 高度层候选纯函数测试（T8.1，先测后码）。
 *
 * 覆盖：
 * - baseLevelOf：region = baseHeight + position.y（分域契约 §A 高度合成）；model = position.y；
 * - derivedHeightOf：building 按语义参数 height（显式值 / 缺省回退语义定义默认 10）；
 *   未声明 height 参数的语义与 model 恒 0（不做 GLB 包围盒测量——任务书明确不做）；
 * - collectElevationLevels：地面 0 恒在；各对象贡献底/顶面层；去重；排除集；非法值忽略；
 * - nearestLevelBelow：贴地目标层 = 候选中 ≤ 当前值的最大者（无 → 0 兜底）；
 * - collectElevationSnapLevels（T9.2）：gizmo 吸附候选 = 裸候选按拖拽目标类型施加模型
 *   抬升（全为模型 → + MODEL_BASE_HEIGHT；含 region / 空目标 → 裸值不变）。
 * 边界：纯函数零 THREE；SceneObject 结构由场景层工厂构造（region 三层结构 / model asset 引用）。
 */
import { describe, expect, it } from 'vitest';
import type { ModelObject } from '../../../src/domain/assets';
import { MODEL_BASE_HEIGHT } from '../../../src/domain/assets';
import type { RegionObject } from '../../../src/domain/regions';
import {
  baseLevelOf,
  collectElevationLevels,
  collectElevationSnapLevels,
  derivedHeightOf,
  nearestLevelBelow,
} from '../../../src/domain/regions';
import type { SceneObject } from '../../../src/scene/SceneObject';

function makeRegion(overrides: {
  baseHeight?: number;
  y?: number;
  semantic?: string;
  height?: number;
  id?: string;
}): RegionObject {
  const { baseHeight = 0, y = 0, semantic = 'building', height, id = 'region_t' } = overrides;
  return {
    id,
    type: 'region',
    name: 'r',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: {
      position: { x: 0, y, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
    shape: {
      type: 'polygon',
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
      ],
      baseHeight,
      closed: true,
    },
    semantic: {
      type: semantic as RegionObject['semantic']['type'],
      properties: height === undefined ? {} : { height },
    },
    style: { presetId: 'building.default', overrides: {} },
  };
}

function makeModel(y: number, id = 'model_t'): ModelObject {
  return {
    id,
    type: 'model',
    name: 'm',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: {
      position: { x: 0, y, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
    asset: { assetId: 'asset_x' },
  };
}

describe('baseLevelOf · 底面高度层', () => {
  it('region = shape.baseHeight + transform.position.y（高度合成）', () => {
    expect(baseLevelOf(makeRegion({ baseHeight: 0.06, y: 2 }) as SceneObject)).toBeCloseTo(2.06, 12);
  });

  it('model = transform.position.y', () => {
    expect(baseLevelOf(makeModel(1.5) as SceneObject)).toBeCloseTo(1.5, 12);
  });
});

describe('derivedHeightOf · 派生高（语义注册表驱动）', () => {
  it('building 显式 height → 派生高 = 该值', () => {
    expect(derivedHeightOf(makeRegion({ height: 18 }) as SceneObject)).toBeCloseTo(18, 12);
  });

  it('building 未显式 height → 回退语义定义默认（10）', () => {
    expect(derivedHeightOf(makeRegion({}) as SceneObject)).toBeCloseTo(10, 12);
  });

  it('未声明 height 参数的语义（road 等）→ 0；model → 0（不做包围盒测量）', () => {
    expect(derivedHeightOf(makeRegion({ semantic: 'road' }) as SceneObject)).toBe(0);
    expect(derivedHeightOf(makeModel(3) as SceneObject)).toBe(0);
  });
});

describe('collectElevationLevels · 候选高度层收集', () => {
  it('地面 0 恒在（空场景）', () => {
    expect(collectElevationLevels([], [])).toEqual([0]);
  });

  it('region 贡献底/顶面层（baseHeight 与 baseHeight+派生高）；model 仅底面', () => {
    const building = makeRegion({ baseHeight: 0.06, y: 2, height: 18 }); // 底 2.06 / 顶 20.06
    const road = makeRegion({ semantic: 'road', baseHeight: 0.06, id: 'region_road' }); // 底/顶 0.06
    const model = makeModel(3.5); // 底 3.5（无顶面派生）
    const levels = collectElevationLevels([building, road, model] as SceneObject[], []);
    expect(levels).toHaveLength(5);
    expect(levels[0]).toBeCloseTo(0, 10);
    expect(levels[1]).toBeCloseTo(2.06, 10);
    expect(levels[2]).toBeCloseTo(20.06, 10);
    expect(levels[3]).toBeCloseTo(0.06, 10);
    expect(levels[4]).toBeCloseTo(3.5, 10);
  });

  it('排除集过滤 + 同值去重', () => {
    const a = makeRegion({ baseHeight: 0, y: 0, id: 'region_a' });
    const b = makeRegion({ baseHeight: 0, y: 0, id: 'region_b' }); // 与 a 同层
    // 排除 a：只剩 b 的层（0 底 + 10 顶）
    expect(collectElevationLevels([a, b] as SceneObject[], ['region_a'])).toEqual([
      0,
      10,
    ]);
  });
});

describe('nearestLevelBelow · 贴地目标层', () => {
  const levels = [0, 2.06, 10, 20.06];

  it('取候选中 ≤ 当前值的最大者', () => {
    expect(nearestLevelBelow(15, levels)).toBe(10);
    expect(nearestLevelBelow(20.06, levels)).toBe(20.06); // 恰在层上 → 原层
    expect(nearestLevelBelow(7, levels)).toBe(2.06);
  });

  it('低于全部候选 → 0 兜底（抬回地面）', () => {
    expect(nearestLevelBelow(-3, levels)).toBe(0);
  });

  it('空候选 → 0（地面恒在语义）', () => {
    expect(nearestLevelBelow(5, [])).toBe(0);
  });
});

describe('collectElevationSnapLevels · gizmo 吸附候选的模型抬升映射（T9.2）', () => {
  it('拖拽目标全为模型 → 候选层含 lift（地面 0 → MODEL_BASE_HEIGHT，承托层同理）', () => {
    // road 无派生高 → 只贡献底面层 0.06（承托层先例：道路顶面）
    const support = makeRegion({ semantic: 'road', baseHeight: 0.06, y: 0, id: 'region_support' });
    const dragged = makeModel(0.03, 'model_a');
    const objects = [support, dragged] as SceneObject[];
    expect(collectElevationSnapLevels(objects, ['model_a'])).toEqual([
      MODEL_BASE_HEIGHT,
      0.06 + MODEL_BASE_HEIGHT,
    ]);
  });

  it('拖拽目标含 region（含混合选中）→ 候选层保持裸值（region 精确贴附语义不变）', () => {
    const support = makeRegion({ semantic: 'road', baseHeight: 0.06, y: 0, id: 'region_support' });
    const draggedRegion = makeRegion({ y: 3, id: 'region_d' });
    const draggedModel = makeModel(0.03, 'model_a');
    const objects = [support, draggedRegion, draggedModel] as SceneObject[];
    // 拖拽目标自身被排除（候选只含 support 的 0 / 0.06），且不施加 lift
    expect(collectElevationSnapLevels(objects, ['region_d', 'model_a'])).toEqual([0, 0.06]);
  });

  it('空排除集 → 裸值（无拖拽目标语境，不施加抬升）', () => {
    const support = makeRegion({ semantic: 'road', baseHeight: 0.06, y: 0 });
    expect(collectElevationSnapLevels([support] as SceneObject[], [])).toEqual([0, 0.06]);
  });
});
