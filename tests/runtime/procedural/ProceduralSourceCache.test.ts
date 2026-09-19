/**
 * tests/runtime/procedural/ProceduralSourceCache.test.ts —— 会话私有构建缓存测试（T002.1，D17）。
 *
 * 覆盖：
 * - 命中：同 id 两次 load 同一引用、size 恒 1、build 只调一次（计数 build 经 seam 注入）；
 * - 失败语义（镜像 AssetLoader）：未注册 id reject 且含 id、size 不变；
 *   build 抛错 reject 且不缓存，修复后重新注册再 load 成功；
 * - dispose：dispose 事件计数断言释放（零 mock 风格——真实 THREE 对象 +
 *   addEventListener('dispose')）；material 数组形态每项都释放；size 归零；幂等；
 * - 双实例隔离：A.dispose() 不影响 B（引用不变、不重建、B 资源不被误释放）。
 * - 槽路由与契约第一锁（T008.1，D19）：未声明 shapeFamily 回退 assetId 键 + 无参 build；
 *   声明资产按 shapeSlotOf 路由 sourceKey、build 收 morphSeedOf；S1 ≠ S2 同槽 →
 *   同条目、build 一次、Geometry/Material 同引用（硬测试）；seed 缺省按 0 路由。
 * - LOD 档位维度（T009.6 Step 1，D23/D27.7）：同槽三档独立条目/独立引用；同档二次
 *   load 命中不重建；缺省 level 与显式 'high' 同键同条目；level 透传 build；evict
 *   单档精确释放（另一档不受影响、未命中 false、幂等）；未声明 shapeFamily 带 level
 *   仍无参 build 单条目（现状逐位一致）；sourceKeyOf 输出形态原样（level 不掺形态身份）。
 * - customDepthMaterial 释放（T009.5）：evict 单条目与 dispose 全量均释放源所持影
 *   pass 深度材质（恰一次、互不误伤、幂等）。
 * 边界：绝无模块级单例——每测试 new 独立实例（D17 StrictMode 双挂载裁定）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { ProceduralAssetMeta } from '../../../src/domain/assets';
import { morphSeedOf, shapeSlotOf, sourceKeyOf } from '../../../src/domain/assets';
import { ProceduralSourceCache } from '../../../src/runtime/procedural/ProceduralSourceCache';
import type { InstanceSource } from '../../../src/runtime/instancing/InstancedAssetPool';
import {
  registerProceduralRoute,
  unregisterProceduralRoute,
} from '../../../src/runtime/procedural/routes';
import type { ProceduralBuildParams } from '../../../src/runtime/procedural/types';

const tempIds: string[] = [];
const caches: ProceduralSourceCache[] = [];

afterEach(() => {
  for (const cache of caches.splice(0)) cache.dispose();
  for (const id of tempIds.splice(0)) unregisterProceduralRoute(id);
});

/** 每测试独立实例（会话私有；afterEach 统一 dispose 兜底） */
function newCache(): ProceduralSourceCache {
  const cache = new ProceduralSourceCache();
  caches.push(cache);
  return cache;
}

/** 计数构建器：记录调用次数；materialArray 控制产出形态 */
function countingBuild(calls: { count: number }, materialArray = false): () => InstanceSource {
  return () => {
    calls.count++;
    const material = materialArray
      ? [new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()]
      : new THREE.MeshStandardMaterial();
    return { geometry: new THREE.BoxGeometry(), material };
  };
}

describe('命中与单次构建', () => {
  it('同 id 两次 load 返回同一引用、size 恒 1、build 只被调用一次', async () => {
    const id = 'test.cache_hit';
    tempIds.push(id);
    const calls = { count: 0 };
    registerProceduralRoute(id, countingBuild(calls));
    const cache = newCache();
    const a = await cache.load(id);
    const b = await cache.load(id);
    expect(b).toBe(a);
    expect(cache.size).toBe(1);
    expect(calls.count).toBe(1);
  });
});

describe('失败语义（镜像 AssetLoader：失败不缓存坏结果）', () => {
  it('未注册 id：reject 且错误信息含该 id；size 不变', async () => {
    const cache = newCache();
    await expect(cache.load('test.nope')).rejects.toThrow(/test\.nope/);
    expect(cache.size).toBe(0);
  });

  it('build 抛错：reject、不缓存（size 0）；修复后重新注册再 load 成功', async () => {
    const id = 'test.cache_broken';
    tempIds.push(id);
    registerProceduralRoute(id, () => {
      throw new Error('构建炸了');
    });
    const cache = newCache();
    await expect(cache.load(id)).rejects.toThrow(/test\.cache_broken/);
    expect(cache.size).toBe(0);
    // 修复：注销坏路由，重新 seam 注册同 id 新 build
    unregisterProceduralRoute(id);
    registerProceduralRoute(id, countingBuild({ count: 0 }));
    const source = await cache.load(id);
    expect(source.geometry).toBeInstanceOf(THREE.BufferGeometry);
    expect(cache.size).toBe(1);
  });
});

describe('dispose 释放', () => {
  it('单值 material：geometry 与 material 均触发 dispose 事件；size 归零；二次调用幂等', async () => {
    const id = 'test.cache_dispose_single';
    tempIds.push(id);
    let source!: InstanceSource;
    registerProceduralRoute(id, () => {
      source = { geometry: new THREE.BoxGeometry(), material: new THREE.MeshStandardMaterial() };
      return source;
    });
    const cache = newCache();
    await cache.load(id);
    let geoDisposed = 0;
    let matDisposed = 0;
    source.geometry.addEventListener('dispose', () => geoDisposed++);
    (source.material as THREE.Material).addEventListener('dispose', () => matDisposed++);
    cache.dispose();
    expect(geoDisposed).toBe(1);
    expect(matDisposed).toBe(1);
    expect(cache.size).toBe(0);
    expect(() => cache.dispose()).not.toThrow();
    expect(geoDisposed).toBe(1); // 幂等：二次调用不重复释放
    expect(matDisposed).toBe(1);
  });

  it('material 数组形态：每项都释放', async () => {
    const id = 'test.cache_dispose_array';
    tempIds.push(id);
    const materials: THREE.Material[] = [];
    registerProceduralRoute(id, () => {
      const material = [
        new THREE.MeshStandardMaterial(),
        new THREE.MeshStandardMaterial(),
        new THREE.MeshStandardMaterial(),
      ];
      materials.push(...material);
      return { geometry: new THREE.BoxGeometry(), material };
    });
    const cache = newCache();
    await cache.load(id);
    const disposed = { count: 0 };
    for (const material of materials) material.addEventListener('dispose', () => disposed.count++);
    cache.dispose();
    expect(disposed.count).toBe(materials.length);
    expect(cache.size).toBe(0);
  });

  it('dispose 后同 id 再 load：视为未命中重新构建（坏缓存不留存）', async () => {
    const id = 'test.cache_rebuild_after_dispose';
    tempIds.push(id);
    const calls = { count: 0 };
    registerProceduralRoute(id, countingBuild(calls));
    const cache = newCache();
    const first = await cache.load(id);
    cache.dispose();
    const second = await cache.load(id);
    expect(second).not.toBe(first);
    expect(calls.count).toBe(2);
    expect(cache.size).toBe(1);
  });
});

describe('双实例隔离（D17：绝无模块级单例）', () => {
  it('A.dispose() 后 B 缓存仍命中：引用不变、不重建、B 资源不被误释放', async () => {
    const id = 'test.cache_iso';
    tempIds.push(id);
    const calls = { count: 0 };
    registerProceduralRoute(id, countingBuild(calls));
    const a = newCache();
    const b = newCache();
    const fromA = await a.load(id);
    const fromB = await b.load(id);
    expect(fromA).not.toBe(fromB); // 各自构建，互不共享
    expect(calls.count).toBe(2);
    let bGeoDisposed = 0;
    fromB.geometry.addEventListener('dispose', () => bGeoDisposed++);
    a.dispose();
    expect(bGeoDisposed).toBe(0); // A 只释放自己的资源
    const again = await b.load(id);
    expect(again).toBe(fromB); // B 缓存仍命中
    expect(calls.count).toBe(2); // B 未重建
    expect(b.size).toBe(1);
  });
});

// ── 槽路由与契约第一锁（T008.1，D19.2–D19.4）──────────────────

/** 记录型构建器：记录每次收到的入参（含 undefined——无参调用的契约证明） */
function recordingBuild(log: { calls: number; params: (ProceduralBuildParams | undefined)[] }) {
  return (params?: ProceduralBuildParams): InstanceSource => {
    log.calls++;
    log.params.push(params);
    return { geometry: new THREE.BoxGeometry(), material: new THREE.MeshStandardMaterial() };
  };
}

/** 声明 shapeFamily 的最小 meta（size 桽数可调） */
function familyMeta(id: string, size: number): ProceduralAssetMeta {
  return {
    id,
    name: `临时形态族资产 ${id}`,
    category: 'test',
    taxonomy: { category: 'dev' }, // T010.2 必填分类（临时管线测试资产 → dev）
    tags: ['test'],
    defaultScale: { x: 1, y: 1, z: 1 },
    defaultRotation: { x: 0, y: 0, z: 0 },
    shapeFamily: { size },
  };
}

describe('槽路由（声明 shapeFamily 的资产按 sourceKey 缓存）', () => {
  it('未声明 shapeFamily：键回退 assetId、build 以无参调用（params === undefined，现状逐位一致）', async () => {
    const id = 'test.route_no_family';
    tempIds.push(id);
    const log = { calls: 0, params: [] as (ProceduralBuildParams | undefined)[] };
    const bareMeta = familyMeta(id, 0);
    delete bareMeta.shapeFamily;
    registerProceduralRoute(id, recordingBuild(log), bareMeta);
    const cache = newCache();
    const a = await cache.load(id, { seed: 123 });
    const b = await cache.load(id, { seed: 456 }); // seed/preset 不参与路由（无声明）
    expect(b).toBe(a);
    expect(cache.size).toBe(1);
    expect(log.calls).toBe(1);
    expect(log.params).toEqual([undefined]); // 无参调用：preset 一并忽略
  });

  it('契约第一锁（核心证明）：S1 ≠ S2 但同槽 → sourceKey 相同、morphSeed 逐位相同、build 仅一次、Geometry/Material 同引用', async () => {
    const id = 'test.route_first_lock';
    tempIds.push(id);
    const size = 4;
    const log = { calls: 0, params: [] as (ProceduralBuildParams | undefined)[] };
    registerProceduralRoute(id, recordingBuild(log), familyMeta(id, size));
    // 找同槽种子对（S1 ≠ S2 → 同 slot）
    const s1 = 100;
    let s2 = 101;
    while (shapeSlotOf(s2, size) !== shapeSlotOf(s1, size)) s2++;
    expect(s2).not.toBe(s1);
    const slot = shapeSlotOf(s1, size);
    expect(shapeSlotOf(s2, size)).toBe(slot);
    const cache = newCache();
    const a = await cache.load(id, { seed: s1 });
    const b = await cache.load(id, { seed: s2 });
    expect(b).toBe(a); // 同槽同条目（命中缓存）
    expect(log.calls).toBe(1); // build 仅执行一次
    expect(log.params).toHaveLength(1);
    // 传入 build 的 seed = morphSeed(assetId, slot)——与对象 seed 无关（第一锁）
    expect(log.params[0]?.seed).toBe(morphSeedOf(id, slot));
    expect(log.params[0]?.seed).not.toBe(s1);
    expect(log.params[0]?.seed).not.toBe(s2);
    // Geometry 与 Material 同引用（共享 Source 的直接证明）
    expect(b.geometry).toBe(a.geometry);
    expect(b.material).toBe(a.material);
    expect(cache.size).toBe(1);
  });

  it('不同槽 → 不同缓存条目、build 两次、各自收到对应槽的 morphSeed', async () => {
    const id = 'test.route_multi_slot';
    tempIds.push(id);
    const size = 4;
    const log = { calls: 0, params: [] as (ProceduralBuildParams | undefined)[] };
    registerProceduralRoute(id, recordingBuild(log), familyMeta(id, size));
    const seeds = [0, 1, 2, 3, 4]; // 样本内可覆盖多槽
    const slotOfSeed = seeds.map((s) => shapeSlotOf(s, size));
    const distinctSlots = new Set(slotOfSeed);
    const cache = newCache();
    const sources = await Promise.all(seeds.map((s) => cache.load(id, { seed: s })));
    expect(cache.size).toBe(distinctSlots.size); // 槽数 = 缓存条目数
    expect(log.calls).toBe(distinctSlots.size);
    expect(new Set(sources).size).toBe(distinctSlots.size); // 异槽异实例
    // 每次收到的 seed 与该次路由槽位配套（log 顺序 = 构建顺序 ≠ 调用顺序，按值集合校验）
    const gotSeeds = log.params.map((p) => p?.seed);
    for (const slot of distinctSlots) expect(gotSeeds).toContain(morphSeedOf(id, slot));
  });

  it('seed 缺省按 0 参与路由（确定性回退）：load(id) 与 load(id, { seed: 0 }) 命中同条目', async () => {
    const id = 'test.route_seed_default';
    tempIds.push(id);
    const size = 3;
    const log = { calls: 0, params: [] as (ProceduralBuildParams | undefined)[] };
    registerProceduralRoute(id, recordingBuild(log), familyMeta(id, size));
    const cache = newCache();
    const a = await cache.load(id);
    const b = await cache.load(id, { seed: 0 });
    expect(b).toBe(a);
    expect(log.calls).toBe(1);
    expect(log.params[0]?.seed).toBe(morphSeedOf(id, shapeSlotOf(0, size)));
  });
});

// ── LOD 档位维度（T009.6 Step 1，D23/D27.7）──────────────────

describe('LOD 档位维度（档位几何独立缓存、独立释放）', () => {
  it('同 assetId 同 seed 不同 level（high/mid/low）→ 3 个独立缓存条目、geometry/material 引用互不相同', async () => {
    const id = 'test.lod_three_levels';
    tempIds.push(id);
    const log = { calls: 0, params: [] as (ProceduralBuildParams | undefined)[] };
    registerProceduralRoute(id, recordingBuild(log), familyMeta(id, 4));
    const cache = newCache();
    const seed = 7;
    const high = await cache.load(id, { seed, level: 'high' });
    const mid = await cache.load(id, { seed, level: 'mid' });
    const low = await cache.load(id, { seed, level: 'low' });
    expect(cache.size).toBe(3); // 同槽三档 = 三条目（档位独立缓存）
    expect(log.calls).toBe(3);
    expect(mid.geometry).not.toBe(high.geometry);
    expect(low.geometry).not.toBe(high.geometry);
    expect(low.geometry).not.toBe(mid.geometry);
    expect(mid.material).not.toBe(high.material); // 档间不共享（evict 独立释放的前提）
  });

  it('同 level 二次 load → 同引用命中、build 只调一次（档位内不重复构建）', async () => {
    const id = 'test.lod_same_level_hit';
    tempIds.push(id);
    const calls = { count: 0 };
    registerProceduralRoute(id, countingBuild(calls), familyMeta(id, 2));
    const cache = newCache();
    const a = await cache.load(id, { seed: 5, level: 'mid' });
    const b = await cache.load(id, { seed: 5, level: 'mid' });
    expect(b).toBe(a);
    expect(calls.count).toBe(1);
    expect(cache.size).toBe(1);
  });

  it('level 缺省与显式 high 同键同条目（缺省 = high）', async () => {
    const id = 'test.lod_default_high';
    tempIds.push(id);
    const calls = { count: 0 };
    registerProceduralRoute(id, countingBuild(calls), familyMeta(id, 2));
    const cache = newCache();
    const a = await cache.load(id, { seed: 5 });
    const b = await cache.load(id, { seed: 5, level: 'high' });
    expect(b).toBe(a);
    expect(calls.count).toBe(1);
    expect(cache.size).toBe(1);
  });

  it('level 透传：mid 请求 build params.level === mid；缺省请求 params.level === high', async () => {
    const id = 'test.lod_passthrough';
    tempIds.push(id);
    const size = 2;
    const log = { calls: 0, params: [] as (ProceduralBuildParams | undefined)[] };
    registerProceduralRoute(id, recordingBuild(log), familyMeta(id, size));
    const s1 = 1;
    let s2 = s1 + 1;
    while (shapeSlotOf(s2, size) === shapeSlotOf(s1, size)) s2++; // 异槽避免缓存命中
    const cache = newCache();
    await cache.load(id, { seed: s1, level: 'mid' });
    await cache.load(id, { seed: s2 });
    expect(log.calls).toBe(2);
    expect(log.params[0]?.level).toBe('mid');
    expect(log.params[1]?.level).toBe('high');
  });

  it('evict 精确释放单档单槽：该档 geometry/material 释放、另一档仍命中不重建；未命中 false；幂等', async () => {
    const id = 'test.lod_evict';
    tempIds.push(id);
    const byLevel = new Map<string, InstanceSource>();
    const calls = { count: 0 };
    registerProceduralRoute(
      id,
      (params?: ProceduralBuildParams): InstanceSource => {
        calls.count++;
        const source: InstanceSource = {
          geometry: new THREE.BoxGeometry(),
          material: new THREE.MeshStandardMaterial(),
        };
        byLevel.set(params?.level ?? 'high', source);
        return source;
      },
      familyMeta(id, 2),
    );
    const cache = newCache();
    const seed = 3;
    const high = await cache.load(id, { seed }); // 缺省 high
    await cache.load(id, { seed, level: 'mid' });
    expect(cache.size).toBe(2);
    const midSource = byLevel.get('mid')!;
    let midGeoDisposed = 0;
    let midMatDisposed = 0;
    midSource.geometry.addEventListener('dispose', () => midGeoDisposed++);
    (midSource.material as THREE.Material).addEventListener('dispose', () => midMatDisposed++);
    // 未命中（该档不在缓存）：false、不动缓存
    expect(cache.evict(id, { seed, level: 'low' })).toBe(false);
    expect(cache.size).toBe(2);
    // 精确释放 mid：条目消失、资源释放、另一档不受影响
    expect(cache.evict(id, { seed, level: 'mid' })).toBe(true);
    expect(midGeoDisposed).toBe(1);
    expect(midMatDisposed).toBe(1);
    expect(cache.size).toBe(1);
    // 幂等：同档再 evict 已未命中
    expect(cache.evict(id, { seed, level: 'mid' })).toBe(false);
    // 另一档仍在且可用：命中同引用、不重建
    const highAgain = await cache.load(id, { seed });
    expect(highAgain).toBe(high);
    expect(calls.count).toBe(2);
    // mid 档再 load 视为未命中重新构建（释放后可重建）
    await cache.load(id, { seed, level: 'mid' });
    expect(calls.count).toBe(3);
    expect(cache.size).toBe(2);
  });

  it('未声明 shapeFamily：带 level 请求 → build 仍无参调用（params === undefined）、缓存单条目（现状逐位一致）', async () => {
    const id = 'test.lod_no_family';
    tempIds.push(id);
    const log = { calls: 0, params: [] as (ProceduralBuildParams | undefined)[] };
    const bareMeta = familyMeta(id, 0);
    delete bareMeta.shapeFamily;
    registerProceduralRoute(id, recordingBuild(log), bareMeta);
    const cache = newCache();
    const a = await cache.load(id, { level: 'mid' });
    const b = await cache.load(id, { level: 'low' });
    expect(b).toBe(a); // level 不参与无声明资产的键
    expect(cache.size).toBe(1);
    expect(log.calls).toBe(1);
    expect(log.params).toEqual([undefined]); // 无参调用：level 一并忽略（恒单档资产）
    // evict 同口径：无声明键不含 level，单条目整体释放
    expect(cache.evict(id, { level: 'low' })).toBe(true);
    expect(cache.size).toBe(0);
  });

  it('sourceKeyOf 输出形态原样（level 不掺形态身份——D23.2）', () => {
    expect(sourceKeyOf('test.tree', 2)).toBe('test.tree:slot-2');
    expect(sourceKeyOf('test.tree', 2, 'p')).toBe('test.tree:p:slot-2');
    expect(sourceKeyOf('test.tree')).toBe('test.tree');
  });
});

// ── customDepthMaterial 释放（T009.5 影 pass 深度材质归源所有）──────────────────

describe('customDepthMaterial 释放（T009.5：源所持影 pass 深度材质随条目释放）', () => {
  it('evict 精确释放条目：customDepthMaterial 一并 dispose 恰一次；缓存内其他档不受影响；幂等未命中不重复释放', async () => {
    const id = 'test.depth_evict';
    tempIds.push(id);
    const depths: THREE.MeshDepthMaterial[] = [];
    registerProceduralRoute(
      id,
      (): InstanceSource => {
        const depth = new THREE.MeshDepthMaterial();
        depths.push(depth);
        return {
          geometry: new THREE.BoxGeometry(),
          material: new THREE.MeshStandardMaterial(),
          customDepthMaterial: depth,
        };
      },
      familyMeta(id, 2),
    );
    const cache = newCache();
    const seed = 3;
    await cache.load(id, { seed, level: 'high' });
    await cache.load(id, { seed, level: 'mid' });
    expect(depths).toHaveLength(2);
    const disposed = depths.map(() => 0);
    depths.forEach((depth, i) => depth.addEventListener('dispose', () => disposed[i]!++));

    expect(cache.evict(id, { seed, level: 'high' })).toBe(true);
    expect(disposed).toEqual([1, 0]); // 只释放被 evict 档的深度材质（另一档不动）
    expect(cache.size).toBe(1);
    expect(cache.evict(id, { seed, level: 'high' })).toBe(false); // 幂等：已释放条目未命中
    expect(disposed).toEqual([1, 0]);
  });

  it('dispose 全量释放：每条目 customDepthMaterial 均释放恰一次；二次调用幂等不重复', async () => {
    const id = 'test.depth_dispose_all';
    tempIds.push(id);
    const depths: THREE.MeshDepthMaterial[] = [];
    registerProceduralRoute(
      id,
      (): InstanceSource => {
        const depth = new THREE.MeshDepthMaterial();
        depths.push(depth);
        return {
          geometry: new THREE.BoxGeometry(),
          material: new THREE.MeshStandardMaterial(),
          customDepthMaterial: depth,
        };
      },
      familyMeta(id, 2),
    );
    const cache = newCache();
    const seed = 0;
    await cache.load(id, { seed, level: 'high' });
    await cache.load(id, { seed, level: 'mid' });
    await cache.load(id, { seed, level: 'low' });
    let depthDisposed = 0;
    for (const depth of depths) depth.addEventListener('dispose', () => depthDisposed++);
    cache.dispose();
    expect(depthDisposed).toBe(3); // 全量条目的深度材质均释放
    cache.dispose(); // 幂等
    expect(depthDisposed).toBe(3);
  });
});
