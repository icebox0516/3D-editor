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
 * - 跨色卡共享与 preset 维度（T024.1，D44 #1/#3——ginkgo default + autumn 真卡）：
 *   两卡两条目 geometry/customDepthMaterial/bounds 同引用（共享单份）、材质按卡私有；
 *   冠卡色随卡（物种表 #8ab45d → 覆写 #d4b737）、干柱色不随卡；uTime 跨卡同源
 *   （两卡干柱材质 uniforms.uTime 同一对象 + 共享 depth 绑同一对象——成套契约窄化为
 *   「uTime 引用同源」）；dispose 共享份各恰一次（不随条目数翻倍）；携 preset 的
 *   未接入树种请求 reject 语义不变。
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

// ── 跨色卡共享与 preset 维度（T024.1，D44 #1/#3——ginkgo default + autumn 真卡）──────────

describe('跨色卡共享与 preset 维度（冠卡随卡分桶、geometry/depth/uTime/bounds 跨卡单份）', () => {
  it('ginkgo 两卡两条目：geometry/customDepthMaterial/bounds 同引用、材质按卡私有；冠卡色随卡（#8ab45d → #d4b737）、干柱色不随卡（冠变干不变）', async () => {
    const cache = newCache();
    const seed = 3;
    const a = await cache.load('asset_tree_ginkgo', seed); // 默认卡（preset 缺省）
    const b = await cache.load('asset_tree_ginkgo', seed, 'autumn'); // 秋金黄卡
    expect(cache.size).toBe(2); // 冠卡随卡分桶（D44 #3 分桶硬要求）
    expect(cache.sharedSize).toBe(1); // 同槽跨卡 = 一行共享登记
    expect(b.geometry).toBe(a.geometry); // canopy 几何与卡无关——共享单份
    expect(b.customDepthMaterial).toBe(a.customDepthMaterial); // 深度材质与卡无关（色不进深度）
    expect(b.bounds).toBe(a.bounds); // bounds 随几何派生一次（共享）
    const [trunkA, cardA] = a.material as THREE.MeshStandardMaterial[];
    const [trunkB, cardB] = b.material as THREE.MeshStandardMaterial[];
    expect(trunkA).not.toBe(trunkB); // 材质数组按卡条目私有
    expect(cardA).not.toBe(cardB);
    expect(cardA.color.getHex()).toBe(0x8ab45d); // ginkgo 物种表冠色（默认卡零变化）
    expect(cardB.color.getHex()).toBe(0xd4b737); // autumn 覆写（与近景叶基调同源同值）
    expect(trunkA.color.getHex()).toBe(trunkB.color.getHex()); // 干柱色不随卡
    expect(trunkA.color.getHex()).toBe(0x6b665c); // ginkgo 皮色
  });

  it('uTime 跨卡同源（成套契约窄化）：两卡条目干柱材质 uniforms.uTime 同一对象、共享 depth 绑同一对象——写任一即达深度', async () => {
    const cache = newCache();
    const a = await cache.load('asset_tree_ginkgo', 3);
    const b = await cache.load('asset_tree_ginkgo', 3, 'autumn');
    const trunkA = (a.material as TimeBridged[])[0]!;
    const trunkB = (b.material as TimeBridged[])[0]!;
    const uTimeA = trunkA.uniforms?.uTime;
    expect(uTimeA).toBeDefined();
    expect(trunkB.uniforms?.uTime).toBe(uTimeA); // 跨卡同源（后到卡注入共享 uTime）
    // 共享 depth：材质级 uniforms 不挂（服务只扫 node.material），onBeforeCompile 绑共享对象
    const depth = b.customDepthMaterial as THREE.MeshDepthMaterial;
    expect((depth as TimeBridged).uniforms?.uTime).toBeUndefined();
    const shader = fakeShader();
    type OnCompileShader = Parameters<NonNullable<THREE.MeshDepthMaterial['onBeforeCompile']>>[0];
    depth.onBeforeCompile?.(shader as unknown as OnCompileShader, null!); // 工厂闭包不消费 renderer 参
    expect(shader.uniforms.uTime).toBe(uTimeA); // 深度程序 uniform = 同一对象引用
    // TimeUniformService 写任一卡的任一主材质一次 → 深度程序读数同帧同值
    trunkB.uniforms!.uTime!.value = 33.25;
    expect(shader.uniforms.uTime!.value).toBe(33.25);
  });

  it('dispose 全量释放（引用计数清零路径）：两卡共享 geometry/深度各恰一次（不随条目数翻倍）、两卡私有材质共 4 项各一次；幂等、条目与登记清空', async () => {
    const cache = newCache();
    const a = await cache.load('asset_tree_ginkgo', 3);
    const b = await cache.load('asset_tree_ginkgo', 3, 'autumn');
    let geoDisposed = 0;
    let depthDisposed = 0;
    let matDisposed = 0;
    a.geometry.addEventListener('dispose', () => geoDisposed++);
    a.customDepthMaterial!.addEventListener('dispose', () => depthDisposed++);
    const allMaterials = [
      ...(a.material as THREE.Material[]),
      ...(b.material as THREE.Material[]),
    ];
    for (const m of allMaterials) m.addEventListener('dispose', () => matDisposed++);
    cache.dispose();
    expect(geoDisposed).toBe(1); // 共享单份恰一次（两条目不翻倍）
    expect(depthDisposed).toBe(1);
    expect(matDisposed).toBe(4); // 两卡 × [干柱, 冠卡] 私有材质
    expect(cache.size).toBe(0);
    expect(cache.sharedSize).toBe(0); // 登记清空
    cache.dispose(); // 幂等
    expect(geoDisposed).toBe(1);
    expect(depthDisposed).toBe(1);
    expect(matDisposed).toBe(4);
  });

  it('后到色卡跳过几何工厂（canopy 几何与卡无关）：首卡后 load 他卡条目持共享引用、不再产出新几何；携 preset 的未接入树种请求 reject 语义不变', async () => {
    const cache = newCache();
    const a = await cache.load('asset_tree_ginkgo', 3);
    const b = await cache.load('asset_tree_ginkgo', 3, 'autumn');
    // 共享单份证据：第二卡条目几何 = 首卡交付（几何工厂只在首卡路径调用——实现为
    // 互斥分支；若第二卡重建几何，引用必然分离）
    expect(b.geometry).toBe(a.geometry);
    expect(cache.sharedSize).toBe(1);
    // 失败语义不随卡变化：未接入树种携 preset 同样 reject 且不缓存、不动既有条目
    await expect(cache.load('asset_streetlamp', undefined, 'autumn')).rejects.toThrow(/asset_streetlamp/);
    expect(cache.size).toBe(2);
    expect(cache.sharedSize).toBe(1);
  });
});
