/**
 * tests/io/SceneExporter.test.ts —— 基础导出器测试（T1.7 验收标准；T6.9 v2 收口）。
 *
 * 覆盖：导出标准场景 JSON（与 SceneSerializer.serialize 完全一致）、
 *      导出内容可被 SceneSerializer.deserialize 完整读回（v2 往返）、
 *      场景文件只存数据定义与引用（对象内只有 presetId 引用与纯数据，
 *      不含样式/模型本体）。
 */
import { describe, expect, it } from 'vitest';
import type { RegionObject } from '../../src/domain/regions';
import type { SceneData } from '../../src/scene/SceneData';
import { SceneExporter, SceneSerializer } from '../../src/io';

function makeScene(): SceneData {
  const region: RegionObject = {
    id: 'region_1',
    type: 'region',
    name: '总部大楼',
    parentId: null,
    layerId: 'layer_1',
    visible: true,
    locked: false,
    transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    properties: {},
    shape: {
      type: 'polygon',
      points: [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 10 }, { x: 0, y: 10 }, { x: 0, y: 0 }],
      baseHeight: 0,
      closed: true,
    },
    semantic: { type: 'building', properties: { height: 30 } },
    style: { presetId: 'building.default', overrides: {} },
  };
  return {
    version: '2.0',
    id: 'scene_exp',
    name: '导出演示',
    environment: { preset: 'day' },
    layers: [
      { id: 'layer_1', name: '建筑', visible: true, locked: false, opacity: 1, order: 0, objectIds: ['region_1'] },
    ],
    objects: [region],
  };
}

describe('SceneExporter', () => {
  const exporter = new SceneExporter();
  const serializer = new SceneSerializer();

  it('导出标准场景 JSON：与 SceneSerializer.serialize 输出逐字节一致', () => {
    expect(exporter.export(makeScene())).toBe(serializer.serialize(makeScene()));
  });

  it('导出内容可被 SceneSerializer.deserialize 完整读回（往返一致）', () => {
    const scene = makeScene();
    expect(serializer.deserialize(exporter.export(scene))).toEqual(scene);
  });

  it('导出 JSON 含 version "2.0" 与全部对象/图层', () => {
    const json = JSON.parse(exporter.export(makeScene()));
    expect(json.version).toBe('2.0');
    expect(json.objects).toHaveLength(1);
    expect(json.layers).toHaveLength(1);
  });

  it('场景文件只存数据定义与引用：对象内是 presetId 引用而非样式本体', () => {
    const json = JSON.parse(exporter.export(makeScene()));
    const region = json.objects[0];
    expect(region.style).toEqual({ presetId: 'building.default', overrides: {} });
    expect(JSON.stringify(json)).not.toContain('defaultParams');
  });
});
