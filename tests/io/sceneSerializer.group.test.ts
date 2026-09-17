/**
 * tests/io/sceneSerializer.group.test.ts —— group 对象类型序列化测试（T8.5 §1，先测后码）。
 *
 * 覆盖：
 * - 反序列化放行 'group' 类型（2.0 增量扩展，阶段门 2026-09-13 裁定）；
 * - group 对象不做结构校验（同 model 待遇——无 shape/semantic/style/asset 结构要求）；
 * - 序列化往返：组层级（嵌套一层）无损——parentId 指向、数组顺序（同父兄弟序）全保留；
 * - 未知类型仍路径化报错（fail-fast 语义不回退）。
 * 边界：node 纯逻辑，零 React / 零 THREE。
 */
import { describe, expect, it } from 'vitest';
import { SceneSerializer } from '../../src/io/SceneSerializer';
import type { SceneData } from '../../src/scene/SceneData';

const serializer = new SceneSerializer();

function makeScene(objects: unknown[]): string {
  return JSON.stringify({
    version: '2.0',
    id: 'scene_1',
    name: '测试场景',
    environment: { preset: 'day' },
    layers: [],
    objects,
  });
}

function group(id: string, parentId: string | null, name = id): Record<string, unknown> {
  return {
    id,
    type: 'group',
    name,
    parentId,
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

describe('SceneSerializer：group 类型放行（T8.5）', () => {
  it('group 对象反序列化成功（含顶层 group 与嵌套 group 的 parentId 指向）', () => {
    const json = makeScene([group('group_a', null), group('group_b', 'group_a')]);
    const data = serializer.deserialize(json);
    expect(data.objects).toHaveLength(2);
    expect(data.objects[0]).toMatchObject({ id: 'group_a', type: 'group', parentId: null });
    expect(data.objects[1]).toMatchObject({ id: 'group_b', type: 'group', parentId: 'group_a' });
  });

  it('group 不做结构校验：缺 properties / transform 仍放行（同 model 待遇）', () => {
    const json = makeScene([{ id: 'group_x', type: 'group', name: '空壳', parentId: null }]);
    const data = serializer.deserialize(json);
    expect(data.objects[0]!.id).toBe('group_x');
  });

  it('未知类型仍路径化报错（错误信息含路径与合法类型清单）', () => {
    const json = makeScene([group('group_a', null), { id: 'x_1', type: 'folder', name: 'x' }]);
    expect(() => serializer.deserialize(json)).toThrowError(/objects\[1\]\.type/);
    expect(() => serializer.deserialize(json)).toThrowError(/folder/);
  });
});

describe('SceneSerializer：组层级往返无损（T8.5）', () => {
  it('serialize → deserialize 往返：嵌套一层组层级 + 同父兄弟序全保留', () => {
    const before: SceneData = {
      version: '2.0',
      id: 'scene_1',
      name: '往返',
      environment: { preset: 'day' },
      layers: [],
      objects: ([
        { ...(group('group_a', null, '园区甲') as object), type: 'group' },
        { ...(group('group_b', null, '园区乙') as object), type: 'group' },
        { ...(group('group_inner', 'group_a', '内层组') as object), type: 'group' },
        {
          id: 'region_1',
          type: 'region',
          name: '成员1',
          parentId: 'group_inner',
          layerId: null,
          visible: true,
          locked: false,
          transform: {
            position: { x: 1, y: 2, z: 3 },
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
            ],
            baseHeight: 0,
            closed: true,
          },
          semantic: { type: 'plaza', properties: {} },
          style: { presetId: 'default_solid', overrides: {} },
        },
        {
          id: 'model_1',
          type: 'model',
          name: '树',
          parentId: 'group_a',
          layerId: null,
          visible: true,
          locked: false,
          transform: {
            position: { x: 5, y: 0, z: 5 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
          },
          properties: {},
          asset: { assetId: 'asset_tree' },
        },
      ] as unknown) as SceneData['objects'],
    };

    const after = serializer.deserialize(serializer.serialize(before));
    expect(after.objects.map((o) => o.id)).toEqual(before.objects.map((o) => o.id)); // 数组序（= 同父兄弟序）
    for (let i = 0; i < before.objects.length; i++) {
      expect(after.objects[i]!.parentId).toBe(before.objects[i]!.parentId);
    }
    // 嵌套一层：region_1 挂 group_inner，group_inner 挂 group_a，model_1 挂 group_a
    const byId = new Map(after.objects.map((o) => [o.id, o]));
    expect(byId.get('region_1')!.parentId).toBe('group_inner');
    expect(byId.get('group_inner')!.parentId).toBe('group_a');
    expect(byId.get('model_1')!.parentId).toBe('group_a');
  });
});
