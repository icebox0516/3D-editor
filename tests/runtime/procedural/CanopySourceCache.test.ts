/**
 * tests/runtime/procedural/CanopySourceCache.test.ts —— canopy 表示源缓存测试（T021.7，D41 §10.2/§10.3/§十一）。
 *
 * 覆盖（零 mock——真实 021.6 工厂 + 真实树种 asset_tree_3a，routes glob 自动注册 meta）：
 * - 源形态成套：material = [干柱, 冠卡] 两材质组、customDepthMaterial = Canopy Depth
 *   Material（RGBADepthPacking）、bounds = RenderBounds 球形（center/radius 与几何
 *   boundingSphere 逐值一致——§四.3 随几何成套、归缓存所有）；
 * - uTime 成套消费（021.6 遗留②核实锁）：trunk/card 材质级 uniforms.uTime 与 depth
 *   onBeforeCompile 绑定的 shader.uniforms.uTime **同一对象引用**（TimeUniformService
 *   写主材质一次、深度程序同帧——拆开挂 depth 失去更新源的防线）；
 * - 槽路由（morphSeed 语义与 provideSource 现状一致）：同槽不同 seed → 同条目；
 *   seed 缺省 = seed 0 路由；不同槽 → 独立条目（geometry 异引用）；
 * - 缓存语义：同 (assetId, seed) 二次 load 同引用不重建（缓存不淘汰、天然有界）；
 * - 生命周期：dispose 释放 geometry + 两材质 + 深度材质各恰一次、size 归零、幂等；
 *   双实例隔离（D17——A.dispose 不误释放 B 条目）；
 * - 失败语义：非 13 乔木 assetId → reject 且不缓存（size 0，错误含 assetId）。
 * 边界：每测试 new 独立实例（会话私有）；afterEach 统一 dispose 兜底。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { shapeSlotOf } from '../../../src/domain/assets';
import { CanopySourceCache } from '../../../src/runtime/procedural/CanopySourceCache';

const caches: CanopySourceCache[] = [];

afterEach(() => {
  for (const cache of caches.splice(0)) cache.dispose();
});

function newCache(): CanopySourceCache {
  const cache = new CanopySourceCache();
  caches.push(cache);
  return cache;
}

/** 材质级 uniforms 的最小结构面（TimeBridgedMaterial 形态） */
type TimeBridged = THREE.Material & { uniforms?: { uTime?: { value: number } } };

/** onBeforeCompile 假 shader（两注入点齐备——缺失即抛是工厂契约） */
function fakeShader(): { uniforms: Record<string, { value: number }>; vertexShader: string } {
  return {
    uniforms: {},
    vertexShader: '#include <common>\nvoid main() {\n\t#include <begin_vertex>\n}',
  };
}

describe('源形态成套（geometry + [干柱,冠卡] + 深度材质 + bounds）', () => {
  it('material 数组恰 2 项、customDepthMaterial = MeshDepthMaterial(RGBADepthPacking)、bounds 与几何包围球逐值一致', async () => {
    const cache = newCache();
    const source = await cache.load('asset_tree_3a', 5);
    expect(Array.isArray(source.material)).toBe(true);
    const materials = source.material as THREE.Material[];
    expect(materials).toHaveLength(2); // 组序 [0=干柱, 1=冠卡]——恰 2 组几何契约对齐
    expect(materials[0]).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(materials[1]).toBeInstanceOf(THREE.MeshStandardMaterial);
    const depth = source.customDepthMaterial as THREE.MeshDepthMaterial;
    expect(depth).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(depth.depthPacking).toBe(THREE.RGBADepthPacking);
    // bounds 成套（§四.3 RenderBounds——球形契约，随几何成套）
    source.geometry.computeBoundingSphere();
    const sphere = source.geometry.boundingSphere!;
    expect(source.bounds).toBeDefined();
    expect(source.bounds!.radius).toBeCloseTo(sphere.radius, 9);
    expect(source.bounds!.center.x).toBeCloseTo(sphere.center.x, 9);
    expect(source.bounds!.center.y).toBeCloseTo(sphere.center.y, 9);
    expect(source.bounds!.center.z).toBeCloseTo(sphere.center.z, 9);
  });
});

describe('uTime 成套消费（021.6 遗留②核实——三材质共享同一 uTime 对象）', () => {
  it('trunk/card 材质级 uniforms.uTime 同一对象；depth onBeforeCompile 绑定同一对象（服务写主材质一次三材质同帧）', async () => {
    const cache = newCache();
    const source = await cache.load('asset_tree_3a', 5);
    const [trunk, card] = source.material as TimeBridged[];
    const trunkUTime = (trunk as TimeBridged).uniforms?.uTime;
    const cardUTime = (card as TimeBridged).uniforms?.uTime;
    expect(trunkUTime).toBeDefined();
    expect(cardUTime).toBeDefined();
    expect(cardUTime).toBe(trunkUTime); // 两主材质共享同一对象
    // depth：材质级 uniforms 不挂（服务只扫 node.material）——onBeforeCompile 绑同一共享对象
    const depth = source.customDepthMaterial as THREE.MeshDepthMaterial;
    expect((depth as TimeBridged).uniforms?.uTime).toBeUndefined();
    const shader = fakeShader();
    type OnCompileShader = Parameters<NonNullable<THREE.MeshDepthMaterial['onBeforeCompile']>>[0];
    depth.onBeforeCompile?.(shader as unknown as OnCompileShader, null!); // 工厂闭包不消费 renderer 参
    expect(shader.uniforms.uTime).toBe(trunkUTime); // 深度程序 uniform = 同一对象引用
    // 写主材质一次 → 深度程序读数同帧同值（影 pass 风摆与主渲染同相）
    trunkUTime!.value = 12.5;
    expect(shader.uniforms.uTime!.value).toBe(12.5);
  });
});

describe('槽路由（seed → slot → morphSeed，与 ProceduralSourceCache 同语义）', () => {
  it('同槽不同 seed → 同条目同引用；seed 缺省 = seed 0 路由', async () => {
    const size = 8; // tree3a shapeFamily.size
    const s1 = 100;
    let s2 = 101;
    while (shapeSlotOf(s2, size) !== shapeSlotOf(s1, size)) s2++;
    expect(s2).not.toBe(s1);
    const cache = newCache();
    const a = await cache.load('asset_tree_3a', s1);
    const b = await cache.load('asset_tree_3a', s2);
    expect(b).toBe(a); // 同槽同 sourceKey::canopy 条目
    expect(cache.size).toBe(1);
    const viaDefault = await cache.load('asset_tree_3a');
    expect(viaDefault).toBe(await cache.load('asset_tree_3a', 0)); // 缺省按 0 路由
  });

  it('不同槽 → 独立条目（geometry 异引用）；同 (id, seed) 二次 load 同引用不重建', async () => {
    const size = 8;
    const s1 = 0;
    let s2 = 1;
    while (shapeSlotOf(s2, size) === shapeSlotOf(s1, size)) s2++;
    const cache = newCache();
    const a = await cache.load('asset_tree_3a', s1);
    const b = await cache.load('asset_tree_3a', s2);
    expect(b).not.toBe(a);
    expect(b.geometry).not.toBe(a.geometry);
    expect(cache.size).toBe(2);
    const again = await cache.load('asset_tree_3a', s1);
    expect(again).toBe(a); // 缓存不淘汰、不重复构建
    expect(cache.size).toBe(2);
  });
});

describe('生命周期（Source/Cache 拥有并释放；Pool 只挂引用）', () => {
  it('dispose：geometry + 两材质 + 深度材质各释放恰一次、size 归零、幂等', async () => {
    const cache = newCache();
    const source = await cache.load('asset_tree_3a', 3);
    let geoDisposed = 0;
    let matDisposed = 0;
    let depthDisposed = 0;
    source.geometry.addEventListener('dispose', () => geoDisposed++);
    for (const m of source.material as THREE.Material[]) m.addEventListener('dispose', () => matDisposed++);
    source.customDepthMaterial!.addEventListener('dispose', () => depthDisposed++);
    cache.dispose();
    expect(geoDisposed).toBe(1);
    expect(matDisposed).toBe(2);
    expect(depthDisposed).toBe(1);
    expect(cache.size).toBe(0);
    cache.dispose(); // 幂等
    expect(geoDisposed).toBe(1);
    expect(matDisposed).toBe(2);
    expect(depthDisposed).toBe(1);
  });

  it('双实例隔离（D17）：A.dispose 不误释放 B 条目——B 仍命中同引用', async () => {
    const a = newCache();
    const b = newCache();
    const fromA = await a.load('asset_tree_3a', 3);
    const fromB = await b.load('asset_tree_3a', 3);
    expect(fromA).not.toBe(fromB); // 各自构建（会话私有）
    let bGeoDisposed = 0;
    fromB.geometry.addEventListener('dispose', () => bGeoDisposed++);
    a.dispose();
    expect(bGeoDisposed).toBe(0); // A 只释放自己的资源
    expect(await b.load('asset_tree_3a', 3)).toBe(fromB); // B 缓存仍命中
  });
});

describe('失败语义（镜像 ProceduralSourceCache：失败不缓存坏结果）', () => {
  it('非 13 乔木 assetId（streetlamp）→ reject 且错误含 assetId、size 不变', async () => {
    const cache = newCache();
    await expect(cache.load('asset_streetlamp')).rejects.toThrow(/asset_streetlamp/);
    expect(cache.size).toBe(0);
  });
});
