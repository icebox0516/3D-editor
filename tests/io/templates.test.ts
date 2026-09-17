/**
 * tests/io/templates.test.ts —— 场景模板模块测试（T8.2，先测后码）。
 *
 * 覆盖（任务书 §1 + 主代理裁决 R1–R3）：
 * - 内置模板：模块加载即经 SceneSerializer.deserialize 校验（fail-fast 构建期断言）；
 *   空园区与 createDefaultSceneData() 完全同构（剥 id 深比——file.new-empty 实例化
 *   语义的关键断言）；示例园区 6 对象 / 11 图层 / 语义归层一致 / environment day；
 * - regenerateSceneIds：全量 id 重建（scene/layer/region|model 前缀）、layerId /
 *   parentId / layer.objectIds 一致重映射、陈旧引用剔除（沿 openScene 过滤语义）、
 *   深拷贝零共享引用、剥离 id 后内容同构；
 * - userTemplates CRUD：fake storage 注入（沿 layoutPresets 测试先例）、重名覆盖、
 *   容量 count-limit / size-limit 两路拒存、QuotaExceeded 拒存、损坏条目静默跳过、
 *   rename / delete、storage 不可用降级。
 * 边界：node 纯逻辑（无 jsdom；localStorage 经参数注入，绝不触 globalThis）。
 */
import { describe, expect, it } from 'vitest';
import { createDefaultSceneData, DEFAULT_LAYER_NAMES } from '../../src/app/bootstrap';
import type { ModelObject } from '../../src/domain/assets';
import { createRegionObject } from '../../src/domain/regions';
import type { RegionObject } from '../../src/domain/regions';
import type { SceneData } from '../../src/scene/SceneData';
import {
  BUILTIN_TEMPLATES,
  regenerateSceneIds,
} from '../../src/io/templates';
import {
  USER_TEMPLATES_MAX_COUNT,
  USER_TEMPLATES_MAX_TOTAL_CHARS,
  USER_TEMPLATES_STORAGE_KEY,
  deleteUserTemplate,
  listUserTemplates,
  renameUserTemplate,
  saveUserTemplate,
} from '../../src/io/templates/userTemplates';
import type { TemplateStorage } from '../../src/io/templates/userTemplates';

/** 剥离全部 id 及 id 引用（layerId/parentId/objectIds）后的形态（同构断言用：其余字段深比） */
function stripSceneIds(data: SceneData): unknown {
  return {
    ...data,
    id: '',
    layers: data.layers.map((l) => ({ ...l, id: '', objectIds: [] })),
    objects: data.objects.map((o) => ({ ...o, id: '', layerId: null, parentId: null })),
  };
}

/** Map 桩 storage（沿 tests/ui/layout/layoutPresets.test.ts 先例的最小子集） */
function fakeStorage(initial: Record<string, string> = {}): TemplateStorage & { dump(): Record<string, string> } {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => void store.set(k, v),
    removeItem: (k) => void store.delete(k),
    dump: () => Object.fromEntries(store),
  };
}

/** 含两个 region 的最小场景（userTemplates 载荷用） */
function makeScene(name: string): SceneData {
  const base = createDefaultSceneData(name);
  const buildingLayer = base.layers.find((l) => l.name === '建筑')!;
  const roadLayer = base.layers.find((l) => l.name === '道路')!;
  const office = createRegionObject({
    shape: {
      type: 'polygon',
      points: [
        { x: 0, y: 0 },
        { x: 8, y: 0 },
        { x: 8, y: 6 },
        { x: 0, y: 6 },
        { x: 0, y: 0 },
      ],
      baseHeight: 0,
      closed: true,
    },
    semanticType: 'building',
    name: '办公楼',
    layerId: buildingLayer.id,
  });
  const road = createRegionObject({
    shape: {
      type: 'line',
      points: [
        { x: -10, y: 2 },
        { x: 12, y: 2 },
      ],
      baseHeight: 0.06,
      closed: false,
    },
    semanticType: 'road',
    name: '小路',
    layerId: roadLayer.id,
  });
  base.objects = [office, road];
  buildingLayer.objectIds = [office.id];
  roadLayer.objectIds = [road.id];
  return base;
}

describe('内置模板 BUILTIN_TEMPLATES（加载即 deserialize 校验）', () => {
  it('两套：builtin-empty「空园区」/ builtin-sample「示例园区」，builtin 恒 true，version 2.0', () => {
    expect(BUILTIN_TEMPLATES.map((t) => [t.id, t.name, t.builtin])).toEqual([
      ['builtin-empty', '空园区', true],
      ['builtin-sample', '示例园区', true],
    ]);
    for (const t of BUILTIN_TEMPLATES) {
      expect(t.scene.version).toBe('2.0');
    }
  });

  it('空园区与 createDefaultSceneData() 完全同构（name / day / 11 层名序 / 0 对象 / 图层默认字段）', () => {
    const empty = BUILTIN_TEMPLATES.find((t) => t.id === 'builtin-empty')!.scene;
    // 模块加载已过 deserialize 校验；再显式往返一次证明文件形态合法
    expect(empty.name).toBe('未命名场景');
    expect(empty.environment).toEqual({ preset: 'day' });
    expect(empty.layers.map((l) => l.name)).toEqual([...DEFAULT_LAYER_NAMES]);
    expect(empty.objects).toEqual([]);
    expect(stripSceneIds(regenerateSceneIds(empty))).toEqual(stripSceneIds(createDefaultSceneData()));
  });

  it('示例园区：6 对象 / 11 图层（默认层名序）/ environment day / 对象归层与 objectIds 一致', () => {
    const sample = BUILTIN_TEMPLATES.find((t) => t.id === 'builtin-sample')!.scene;
    expect(sample.name).toBe('示例园区');
    expect(sample.environment).toEqual({ preset: 'day' });
    expect(sample.layers.map((l) => l.name)).toEqual([...DEFAULT_LAYER_NAMES]);
    expect(sample.objects).toHaveLength(6);

    const layerIds = new Set(sample.layers.map((l) => l.id));
    const objectsById = new Map(sample.objects.map((o) => [o.id, o] as const));
    for (const layer of sample.layers) {
      for (const id of layer.objectIds) {
        expect(objectsById.has(id), `图层 ${layer.name} 引用未知对象 ${id}`).toBe(true);
        expect(objectsById.get(id)!.layerId, `对象 ${id} 的 layerId 应指向其所在图层`).toBe(layer.id);
      }
      expect(layerIds.has(layer.id)).toBe(true);
    }
    // 每个对象都被其 layer.objectIds 收录（派生索引一致）
    for (const obj of sample.objects) {
      const layer = sample.layers.find((l) => l.id === obj.layerId)!;
      expect(layer.objectIds).toContain(obj.id);
    }
  });

  it('示例园区六对象语义/形状三层结构（逐对象：shape/semantic/style 与归层图层名）', () => {
    const sample = BUILTIN_TEMPLATES.find((t) => t.id === 'builtin-sample')!.scene;
    const byName = new Map(sample.objects.map((o) => [o.name, o as RegionObject] as const));
    expect([...byName.keys()].sort()).toEqual(
      ['中央绿地', '南门', '园区主路', '景观湖', '综合办公楼', '研发中心'].sort(),
    );

    const office = byName.get('综合办公楼')!;
    expect(office.type).toBe('region');
    expect(office.shape.type).toBe('polygon');
    expect(office.shape.closed).toBe(true);
    expect(office.shape.points[0]).toEqual(office.shape.points[office.shape.points.length - 1]); // 显式闭合
    expect(office.semantic.type).toBe('building');
    expect(typeof office.semantic.properties.height).toBe('number');
    expect(office.style).toEqual({ presetId: 'building.default', overrides: {} });
    expect(sample.layers.find((l) => l.id === office.layerId)!.name).toBe('建筑');

    const road = byName.get('园区主路')!;
    expect(road.shape.type).toBe('line');
    expect(road.shape.closed).toBe(false);
    expect(road.shape.baseHeight).toBeCloseTo(0.06);
    expect(road.semantic.type).toBe('road');
    expect(road.semantic.properties.width).toBe(8);
    expect(road.style.presetId).toBe('road.standard');

    const grass = byName.get('中央绿地')!;
    expect(grass.semantic.type).toBe('grass');
    expect(grass.style.presetId).toBe('grass.lawn');
    expect(grass.shape.baseHeight).toBeCloseTo(0.12);

    const lake = byName.get('景观湖')!;
    expect(lake.semantic.type).toBe('water');
    expect(lake.style.presetId).toBe('water.standard');
    expect(lake.shape.baseHeight).toBeCloseTo(0.18);

    const gate = byName.get('南门')!;
    expect(gate.shape.type).toBe('point');
    expect(gate.shape.points).toHaveLength(1);
    expect(gate.shape.closed).toBe(false);
    expect(gate.semantic.type).toBe('poi');
    expect(gate.style.presetId).toBe('poi.billboard');

    // 每对象 transform/visible/locked/parentId 与工厂产出形态对齐
    for (const obj of sample.objects) {
      expect(obj.visible).toBe(true);
      expect(obj.locked).toBe(false);
      expect(obj.parentId).toBeNull();
      expect(obj.transform).toEqual({
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      });
    }
  });
});

describe('regenerateSceneIds（实例化：模板只读、实例全新）', () => {
  const sample = BUILTIN_TEMPLATES.find((t) => t.id === 'builtin-sample')!.scene;

  it('全量 id 重建：scene_ / layer_ / region_ 前缀，与原 id 零交集', () => {
    const out = regenerateSceneIds(sample);
    expect(out.id).toMatch(/^scene_/);
    expect(out.id).not.toBe(sample.id);
    const oldIds = new Set<string>([sample.id, ...sample.layers.map((l) => l.id), ...sample.objects.map((o) => o.id)]);
    for (const layer of out.layers) {
      expect(layer.id).toMatch(/^layer_/);
      expect(oldIds.has(layer.id)).toBe(false);
    }
    for (const obj of out.objects) {
      expect(obj.id).toMatch(/^region_/);
      expect(oldIds.has(obj.id)).toBe(false);
    }
    // 新 id 全局唯一
    const allNew = [out.id, ...out.layers.map((l) => l.id), ...out.objects.map((o) => o.id)];
    expect(new Set(allNew).size).toBe(allNew.length);
  });

  it('layerId / parentId / layer.objectIds 一致重映射', () => {
    const out = regenerateSceneIds(sample);
    const outLayerById = new Map(out.layers.map((l) => [l.id, l] as const));
    const outObjectById = new Map(out.objects.map((o) => [o.id, o] as const));
    sample.objects.forEach((oldObj, i) => {
      const newObj = out.objects[i]!;
      expect(outLayerById.has(newObj.layerId!)).toBe(true);
      // 新 layerId 指向与旧同名的图层
      const oldLayerName = sample.layers.find((l) => l.id === oldObj.layerId)!.name;
      expect(outLayerById.get(newObj.layerId!)!.name).toBe(oldLayerName);
      void outObjectById;
    });
    for (const layer of out.layers) {
      for (const id of layer.objectIds) {
        expect(outObjectById.get(id)!.layerId).toBe(layer.id);
      }
    }
  });

  it('model 对象用 model_ 前缀', () => {
    const tree: ModelObject = {
      id: 'model-src-1',
      type: 'model',
      name: '行道树',
      parentId: null,
      layerId: null,
      visible: true,
      locked: false,
      transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      properties: {},
      asset: { assetId: 'asset_tree' },
    };
    const scene = regenerateSceneIds({
      ...makeScene('带模型'),
      objects: [...makeScene('带模型').objects, tree],
    });
    const model = scene.objects.find((o) => o.type === 'model')!;
    expect(model.id).toMatch(/^model_/);
    expect(scene.objects.filter((o) => o.type === 'region').every((o) => o.id.startsWith('region_'))).toBe(true);
  });

  it('陈旧引用剔除：layerId 指向不存在图层 → null；objectIds 引用不存在对象 → 剔除；parentId 指向不存在对象 → null', () => {
    const scene = makeScene('陈旧引用');
    const orphan = { ...scene.objects[0]!, layerId: 'layer_ghost', parentId: 'region_ghost' };
    scene.objects = [...scene.objects, orphan];
    scene.layers[0]!.objectIds = [...scene.layers[0]!.objectIds, 'region_ghost'];
    const out = regenerateSceneIds(scene);
    const restored = out.objects.find((o) => o.name === orphan.name && o.parentId === null && o.layerId === null);
    expect(restored).toBeDefined();
    expect(out.layers[0]!.objectIds).not.toContain('region_ghost');
    expect(out.layers[0]!.objectIds.every((id) => out.objects.some((o) => o.id === id))).toBe(true);
  });

  it('深拷贝零共享引用：改动产物不影响模板原数据', () => {
    const source = BUILTIN_TEMPLATES.find((t) => t.id === 'builtin-sample')!.scene;
    const before = JSON.stringify(source);
    const out = regenerateSceneIds(source);
    out.name = '被改掉的实例';
    out.layers[0]!.name = '被改掉的图层';
    out.objects[0]!.name = '被改掉的对象';
    (out.objects[0] as RegionObject).semantic.properties.height = 999;
    out.environment.preset = 'night';
    expect(JSON.stringify(source)).toBe(before);
  });

  it('剥离 id 后内容同构（name / environment / 层字段 / 对象内容不变）', () => {
    const out = regenerateSceneIds(sample);
    expect(stripSceneIds(out)).toEqual(stripSceneIds(sample));
  });
});

describe('userTemplates localStorage CRUD（键 t3d-editor.templates）', () => {
  it('save → list 往返：id 为 tpl_ 前缀、builtin false、scene 深相等', () => {
    const storage = fakeStorage();
    const scene = makeScene('我的园区');
    const result = saveUserTemplate('我的园区', scene, storage);
    expect(result).toEqual({ ok: true });

    const list = listUserTemplates(storage);
    expect(list).toHaveLength(1);
    expect(list[0]!.id).toMatch(/^tpl_/);
    expect(list[0]!.name).toBe('我的园区');
    expect(list[0]!.builtin).toBe(false);
    expect(list[0]!.scene).toEqual(scene);
    expect(storage.dump()[USER_TEMPLATES_STORAGE_KEY]).toBeDefined();
  });

  it('重名覆盖（不产生重复项，内容为新场景）', () => {
    const storage = fakeStorage();
    saveUserTemplate('同名', makeScene('第一版'), storage);
    const second = makeScene('第二版');
    expect(saveUserTemplate('同名', second, storage)).toEqual({ ok: true });
    const list = listUserTemplates(storage);
    expect(list).toHaveLength(1);
    expect(list[0]!.scene.name).toBe('第二版');
    expect(list[0]!.scene).toEqual(second);
  });

  it('名字首尾裁剪；空名拒存', () => {
    const storage = fakeStorage();
    expect(saveUserTemplate('  名字  ', makeScene('x'), storage)).toEqual({ ok: true });
    expect(listUserTemplates(storage)[0]!.name).toBe('名字');
    expect(saveUserTemplate('   ', makeScene('x'), storage)).toEqual({ ok: false, reason: 'invalid-name' });
  });

  it('容量兜底 count-limit：保存后总数超过 20 套拒存', () => {
    const storage = fakeStorage();
    for (let i = 1; i <= USER_TEMPLATES_MAX_COUNT; i++) {
      expect(saveUserTemplate(`模板${i}`, makeScene(`场景${i}`), storage)).toEqual({ ok: true });
    }
    expect(saveUserTemplate('第21套', makeScene('超限'), storage)).toEqual({ ok: false, reason: 'count-limit' });
    expect(listUserTemplates(storage)).toHaveLength(USER_TEMPLATES_MAX_COUNT);
    // 覆盖已有名不增条数，仍可保存
    expect(saveUserTemplate('模板1', makeScene('覆盖'), storage)).toEqual({ ok: true });
  });

  it('容量兜底 size-limit：总载荷超 1,000,000 字符拒存', () => {
    const storage = fakeStorage();
    const huge = makeScene('巨大场景');
    huge.objects[0]!.name = 'x'.repeat(USER_TEMPLATES_MAX_TOTAL_CHARS);
    expect(saveUserTemplate('巨大模板', huge, storage)).toEqual({ ok: false, reason: 'size-limit' });
    expect(listUserTemplates(storage)).toHaveLength(0);
  });

  it('QuotaExceededError 同样拒存返回 quota', () => {
    const storage = fakeStorage();
    const throwing: TemplateStorage = {
      getItem: storage.getItem,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: storage.removeItem,
    };
    expect(saveUserTemplate('任何', makeScene('x'), throwing)).toEqual({ ok: false, reason: 'quota' });
  });

  it('损坏条目静默跳过（非对象 / 缺字段 / scene 非法不进清单、不抛错）', () => {
    const storage = fakeStorage({
      [USER_TEMPLATES_STORAGE_KEY]: JSON.stringify([
        { id: 'tpl_ok', name: '好的', scene: makeScene('好的') }, // 合法
        '不是对象',
        { id: 'tpl_x', name: '' }, // 空名
        { id: '', name: '缺id' }, // 空 id
        { id: 'tpl_y', name: '缺场景' }, // 缺 scene
        { id: 'tpl_z', name: '坏场景', scene: { version: '1.0' } }, // scene 非法
      ]),
    });
    const list = listUserTemplates(storage);
    expect(list.map((t) => t.name)).toEqual(['好的']);
  });

  it('整体载荷非数组 / 损坏 JSON → 空清单', () => {
    expect(listUserTemplates(fakeStorage({ [USER_TEMPLATES_STORAGE_KEY]: '{"not":"array"}' }))).toEqual([]);
    expect(listUserTemplates(fakeStorage({ [USER_TEMPLATES_STORAGE_KEY]: '{oops' }))).toEqual([]);
    expect(listUserTemplates(fakeStorage())).toEqual([]);
  });

  it('rename：改名成功；未知 id / 空名失败；改到既有名不产生重名', () => {
    const storage = fakeStorage();
    saveUserTemplate('旧名', makeScene('x'), storage);
    saveUserTemplate('另一套', makeScene('y'), storage);
    expect(renameUserTemplate('tpl_unknown', '新名', storage)).toBe(false);
    expect(renameUserTemplate(listUserTemplates(storage)[0]!.id, '   ', storage)).toBe(false);
    const target = listUserTemplates(storage).find((t) => t.name === '旧名')!;
    expect(renameUserTemplate(target.id, '新名', storage)).toBe(true);
    const names = listUserTemplates(storage).map((t) => t.name).sort();
    expect(names).toEqual(['另一套', '新名']);
    // 改到既有名 → 覆盖语义（重名合并，id 保留被改名者）
    const another = listUserTemplates(storage).find((t) => t.name === '另一套')!;
    expect(renameUserTemplate(another.id, '新名', storage)).toBe(true);
    expect(listUserTemplates(storage).map((t) => t.name)).toEqual(['新名']);
  });

  it('delete：删除成功；未知 id 失败；清空后移除存储键', () => {
    const storage = fakeStorage();
    saveUserTemplate('唯一', makeScene('x'), storage);
    expect(deleteUserTemplate('tpl_unknown', storage)).toBe(false);
    const id = listUserTemplates(storage)[0]!.id;
    expect(deleteUserTemplate(id, storage)).toBe(true);
    expect(listUserTemplates(storage)).toEqual([]);
    expect(storage.dump()[USER_TEMPLATES_STORAGE_KEY]).toBeUndefined();
    expect(deleteUserTemplate(id, storage)).toBe(false);
  });

  it('storage 不可用（null）：list 空、save 拒存 storage-unavailable', () => {
    expect(listUserTemplates(null)).toEqual([]);
    expect(saveUserTemplate('任何', makeScene('x'), null)).toEqual({ ok: false, reason: 'storage-unavailable' });
    expect(renameUserTemplate('tpl_x', '名', null)).toBe(false);
    expect(deleteUserTemplate('tpl_x', null)).toBe(false);
  });
});
