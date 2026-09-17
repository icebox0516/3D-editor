/**
 * tests/domain/assets/modelBaseHeight.test.ts —— 模型贴地抬升常量与结构判别测试
 * （T9.2 贴地共面 z-fighting 消除，先测后码）。
 *
 * 覆盖：
 * - MODEL_BASE_HEIGHT 存在性与取值不变式：0.03（> 网格线抬升 0.02、< road 语义
 *   baseHeight 0.06——夹在两层之间不与既有层序冲突）；单一真相源供五路落点引用
 *   （放置 buildTransform / 拖放 defaultAssetTransform / 工厂缺省 / 贴地命令承托层 /
 *   gizmo 高度吸附候选层），各路断言一律引本常量（全仓无第二处魔数的验收锁定）；
 * - isModelObject 结构判别（含合法 asset 引用；region / 基座对象为 false）。
 * 边界：纯数据测试零 THREE；分层 DAG 下 domain 可被 editor/runtime/app 共同导入。
 */
import { describe, expect, it } from 'vitest';
import { isModelObject, MODEL_BASE_HEIGHT } from '../../../src/domain/assets';
import { getSemanticDefinition } from '../../../src/domain/regions';
import type { ModelObject } from '../../../src/domain/assets';
import type { RegionObject } from '../../../src/domain/regions';
import type { SceneObject } from '../../../src/scene/SceneObject';

function makeModel(): ModelObject {
  return {
    id: 'model_t',
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

function makeRegion(): RegionObject {
  return {
    id: 'region_t',
    type: 'region',
    name: 'r',
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
        { x: 4, y: 4 },
      ],
      baseHeight: 0,
      closed: true,
    },
    semantic: { type: 'building', properties: {} },
    style: { presetId: 'building.default', overrides: {} },
  };
}

describe('MODEL_BASE_HEIGHT · 模型贴地抬升常量（T9.2）', () => {
  it('存在且取值 0.03', () => {
    expect(MODEL_BASE_HEIGHT).toBe(0.03);
  });

  it('不变式：> 网格线抬升 0.02（模型底面高于网格线层）', () => {
    // 网格线 y=0.02（Renderer.makeGridHelper「深度冲突双保险」先例，量级锁定于此）
    expect(MODEL_BASE_HEIGHT).toBeGreaterThan(0.02);
  });

  it('不变式：< road 语义 baseHeight 0.06（不与贴地表层最低档冲突）', () => {
    const road = getSemanticDefinition('road');
    expect(road).toBeDefined();
    expect(MODEL_BASE_HEIGHT).toBeLessThan(road!.defaultBaseHeight);
  });
});

describe('isModelObject · 结构判别（domain 单一实现）', () => {
  it('含合法 asset 引用 → true', () => {
    expect(isModelObject(makeModel() as SceneObject)).toBe(true);
  });

  it('region（三层结构）与基座对象 → false', () => {
    expect(isModelObject(makeRegion() as SceneObject)).toBe(false);
    expect(
      isModelObject({ id: 'group_x', type: 'group', name: 'g' } as unknown as SceneObject),
    ).toBe(false);
  });
});
