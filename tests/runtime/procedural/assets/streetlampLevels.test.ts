/**
 * tests/runtime/procedural/assets/streetlampLevels.test.ts —— 路灯 LOD 两档内容与
 * 档间不变量测试（T006.2：009.6 level 契约跨资产复用验证，非植物第二消费者）。
 *
 * 覆盖（零 mock——真实 THREE 几何；与 facilityAssets.test.ts 的通用健康检查互补，
 * 本文件锁「两档内容与档间不变量怎么成立 + 无 shapeFamily 多档资产的缓存路由」）：
 * - High 无参路径回归锁：build() 与 build({level:'high'}) 逐位相等 + stats 快照
 *   （516 顶点 / 328 面 / 逐组索引计数 / bbox h 4.2075 / w 0.8944——T002.4 现状与
 *   T010.2 探针口径延续，即「改造前后逐位一致」的证明）；
 * - Low 明显降面：136 面（≈ High 41.5%）/ 228 顶点 / 逐组索引计数锁；
 * - 分层结构档间不变：两档均 6 组、materialIndex 序列逐位相同（颜色分层语义连续的前提）；
 * - 法线健康：两档几何非索引化后法线逐分量有限无 NaN 且模长 ≈1（归一）；
 * - 档间色一致：逐 materialIndex 底色 / metalness / roughness / emissive / emissiveIntensity
 *   High 与 Low 逐位相等（每次 build 新材质实例——比的是值不是引用）；
 * - 体量一致：bbox 主尺寸带（h 两档差 ≤0.005 / w 差 ≤0.05——Low 圆周多边形内接微收）
 *   + minY 两档贴地 ±0.001；
 * - Low 确定性：同档两次构建 position 逐位复现；
 * - 防御回落：mid（未声明档）= low 逐位（与 006.1 resolveDeclaredLevel 等距取更低档同语义）；
 * - meta 声明：levels 恰 [{high},{low}]（两档、有序）、triangleCount = High 实测 328；
 * - 缓存集成（真实路由）：两档独立条目/独立引用、缺省 level 与显式 high 同键同条目、
 *   seed 不参与键（无 shapeFamily——形态身份 = assetId，两档 sourceKey 路由一致）、
 *   evict 单档精确释放且另一档不受影响；
 * - 其余 4 设施资产缓存回归：恒单档（未声明多档）键不含 level 后缀——high/low 请求
 *   同条目单条目（T006.2 键规则扩展零波及的证明）。
 * 边界：直接 build 产物与缓存实例登记后 afterEach 统一 dispose，不跨测试泄漏 GPU 资源。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { ProceduralSourceCache } from '../../../../src/runtime/procedural/ProceduralSourceCache';
import { build, meta as streetlampMeta } from '../../../../src/runtime/procedural/assets/streetlamp.asset';
import { meta as parkbenchMeta } from '../../../../src/runtime/procedural/assets/parkbench.asset';
import { meta as trashbinMeta } from '../../../../src/runtime/procedural/assets/trashbin.asset';
import { meta as hydrantMeta } from '../../../../src/runtime/procedural/assets/hydrant.asset';
import { meta as signpostMeta } from '../../../../src/runtime/procedural/assets/signpost.asset';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';

/** High 快照（改造前基线实测，T010.2 探针同口径） */
const HIGH_VERTS = 516;
const HIGH_TRIS = 328;
const HIGH_GROUP_INDEX_COUNTS = [192, 144, 144, 120, 192, 192];
const HIGH_BBOX = { h: 4.2075, w: 0.8944 };
/** Low 快照（降径向分段 6/6/6/4/6/6 实测） */
const LOW_VERTS = 228;
const LOW_TRIS = 136;
const LOW_GROUP_INDEX_COUNTS = [72, 72, 72, 48, 72, 72];
/** 档间 bbox 主尺寸容差（Low 圆周多边形内接致灯头端微收；高度轴不变） */
const SPAN_TOLERANCE = { h: 0.005, w: 0.05 };

const built: InstanceSource[] = [];
const caches: ProceduralSourceCache[] = [];

afterEach(() => {
  for (const source of built.splice(0)) {
    source.geometry.dispose();
    const mats = Array.isArray(source.material) ? source.material : [source.material];
    for (const m of new Set(mats)) m.dispose();
  }
  for (const cache of caches.splice(0)) cache.dispose();
});

function buildTracked(source: InstanceSource): InstanceSource {
  built.push(source);
  return source;
}

/** material 统一为数组形态 */
function materialsOf(source: InstanceSource): THREE.MeshStandardMaterial[] {
  return (Array.isArray(source.material) ? source.material : [source.material]) as THREE.MeshStandardMaterial[];
}

/** 三角面数（索引几何） */
function trisOf(source: InstanceSource): number {
  return source.geometry.getIndex()!.count / 3;
}

/** bbox 主尺寸账目（水平展幅取 X/Z 大者） */
function spanOf(source: InstanceSource): { h: number; w: number; minY: number } {
  source.geometry.computeBoundingBox();
  const b = source.geometry.boundingBox!;
  return { h: b.max.y - b.min.y, w: Math.max(b.max.x - b.min.x, b.max.z - b.min.z), minY: b.min.y };
}

describe('High 无参路径回归锁（现状逐位不变）', () => {
  it('build() 与 build({ level: "high" })：position/normal/uv/index 逐位相等，分组 materialIndex 序列一致', () => {
    const a = buildTracked(build());
    const b = buildTracked(build({ level: 'high' }));
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.geometry.getAttribute('normal').array).toEqual(b.geometry.getAttribute('normal').array);
    expect(a.geometry.getAttribute('uv').array).toEqual(b.geometry.getAttribute('uv').array);
    expect(a.geometry.getIndex()!.array).toEqual(b.geometry.getIndex()!.array);
    expect(a.geometry.groups.map((g) => g.materialIndex)).toEqual(b.geometry.groups.map((g) => g.materialIndex));
  });

  it(`stats 快照：${HIGH_VERTS} 顶点 / ${HIGH_TRIS} 面 / 逐组索引计数 / bbox h ${HIGH_BBOX.h} / w ${HIGH_BBOX.w}（T002.4→T006.2 不回归）`, () => {
    const source = buildTracked(build());
    expect(source.geometry.getAttribute('position').count).toBe(HIGH_VERTS);
    expect(trisOf(source)).toBe(HIGH_TRIS);
    expect(source.geometry.groups.map((g) => g.count)).toEqual(HIGH_GROUP_INDEX_COUNTS);
    expect(source.geometry.groups.map((g) => g.materialIndex)).toEqual([0, 1, 2, 3, 4, 5]);
    const span = spanOf(source);
    expect(Math.abs(span.h - HIGH_BBOX.h)).toBeLessThanOrEqual(0.001);
    expect(Math.abs(span.w - HIGH_BBOX.w)).toBeLessThanOrEqual(0.001);
    expect(Math.abs(span.minY)).toBeLessThanOrEqual(0.001);
  });
});

describe('Low 档内容（明显降面，轮廓 / 体量 / 颜色分层连续）', () => {
  it(`面数锁：${LOW_TRIS} 面（< High 50%）、${LOW_VERTS} 顶点、逐组索引计数`, () => {
    const low = buildTracked(build({ level: 'low' }));
    expect(trisOf(low)).toBe(LOW_TRIS);
    expect(LOW_TRIS).toBeLessThan(HIGH_TRIS * 0.5); // 明显降面（实测比 ≈ 41.5%）
    expect(low.geometry.getAttribute('position').count).toBe(LOW_VERTS);
    expect(low.geometry.groups.map((g) => g.count)).toEqual(LOW_GROUP_INDEX_COUNTS);
  });

  it('分层结构档间不变：两档均 6 组、materialIndex 序列逐位相同', () => {
    const high = buildTracked(build());
    const low = buildTracked(build({ level: 'low' }));
    expect(low.geometry.groups).toHaveLength(6);
    expect(low.geometry.groups.map((g) => g.materialIndex)).toEqual(
      high.geometry.groups.map((g) => g.materialIndex),
    );
  });

  it('法线健康：两档非索引化后法线逐分量有限无 NaN 且模长 ≈1（归一）', () => {
    for (const source of [buildTracked(build()), buildTracked(build({ level: 'low' }))]) {
      const flat = source.geometry.toNonIndexed();
      const nrm = flat.getAttribute('normal');
      expect(nrm).toBeTruthy();
      let bad = 0;
      for (let i = 0; i < nrm.array.length; i += 3) {
        const x = nrm.array[i]!;
        const y = nrm.array[i + 1]!;
        const z = nrm.array[i + 2]!;
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) bad++;
        else if (Math.abs(Math.sqrt(x * x + y * y + z * z) - 1) > 1e-3) bad++;
      }
      expect(bad).toBe(0);
      flat.dispose();
    }
  });

  it('档间色一致：逐 materialIndex 底色/metalness/roughness/emissive 逐位相等', () => {
    const high = materialsOf(buildTracked(build()));
    const low = materialsOf(buildTracked(build({ level: 'low' })));
    expect(low).toHaveLength(high.length);
    for (let i = 0; i < high.length; i++) {
      expect(low[i]!.color.getHex(), `materialIndex ${i} 底色应档间一致`).toBe(high[i]!.color.getHex());
      expect(low[i]!.metalness).toBe(high[i]!.metalness);
      expect(low[i]!.roughness).toBe(high[i]!.roughness);
      expect(low[i]!.emissive.getHex()).toBe(high[i]!.emissive.getHex());
      expect(low[i]!.emissiveIntensity).toBe(high[i]!.emissiveIntensity);
    }
  });

  it(`体量一致：bbox h 两档差 ≤${SPAN_TOLERANCE.h} / w 差 ≤${SPAN_TOLERANCE.w}、minY 两档贴地`, () => {
    const highSpan = spanOf(buildTracked(build()));
    const lowSpan = spanOf(buildTracked(build({ level: 'low' })));
    expect(Math.abs(lowSpan.h - highSpan.h)).toBeLessThanOrEqual(SPAN_TOLERANCE.h);
    expect(Math.abs(lowSpan.w - highSpan.w)).toBeLessThanOrEqual(SPAN_TOLERANCE.w);
    expect(Math.abs(lowSpan.minY)).toBeLessThanOrEqual(0.001);
  });

  it('Low 确定性：同档两次构建 position 逐位复现', () => {
    const a = buildTracked(build({ level: 'low' }));
    const b = buildTracked(build({ level: 'low' }));
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
  });

  it('防御回落：mid（未声明档）与 low 逐位相等（等距取更低档，对齐 006.1 resolveDeclaredLevel）', () => {
    const mid = buildTracked(build({ level: 'mid' }));
    const low = buildTracked(build({ level: 'low' }));
    expect(mid.geometry.getAttribute('position').array).toEqual(low.geometry.getAttribute('position').array);
  });

  it('meta 声明：levels 恰 [{high},{low}]（有序）、triangleCount = High 实测', () => {
    expect(streetlampMeta.levels?.map((l) => l.id)).toEqual(['high', 'low']);
    expect(streetlampMeta.levels?.every((l) => Object.keys(l).length === 1)).toBe(true); // D27.12 首版最小化 [{id}]
    const high = buildTracked(build());
    expect(streetlampMeta.triangleCount).toBe(trisOf(high));
  });
});

describe('缓存集成（真实 streetlamp 路由：assetId::level 双维）', () => {
  it('两档独立条目/独立引用；缺省 level 与显式 high 同键；seed 不参与键（身份 = assetId）', async () => {
    const cache = new ProceduralSourceCache();
    caches.push(cache);
    const high = await cache.load(streetlampMeta.id);
    expect(cache.size).toBe(1);
    const highAgain = await cache.load(streetlampMeta.id, { level: 'high' });
    expect(highAgain).toBe(high); // 缺省 = high 同键同条目
    expect(cache.size).toBe(1);
    const low = await cache.load(streetlampMeta.id, { level: 'low' });
    expect(cache.size).toBe(2); // 两档不撞同键
    expect(low.geometry).not.toBe(high.geometry);
    expect(low.material).not.toBe(high.material);
    expect(trisOf(high)).toBe(HIGH_TRIS);
    expect(trisOf(low)).toBe(LOW_TRIS);
    // 无 shapeFamily：seed 不参与键——不同 seed 同档命中同条目（sourceKey 路由一致）
    const lowOtherSeed = await cache.load(streetlampMeta.id, { seed: 987654, level: 'low' });
    expect(lowOtherSeed).toBe(low);
    expect(cache.size).toBe(2);
  });

  it('evict 单档独立释放：low 档资源 dispose 恰一次、high 仍命中不重建、释放后可重建', async () => {
    const cache = new ProceduralSourceCache();
    caches.push(cache);
    const high = await cache.load(streetlampMeta.id);
    const low = await cache.load(streetlampMeta.id, { level: 'low' });
    let lowGeoDisposed = 0;
    let lowMatDisposed = 0;
    low.geometry.addEventListener('dispose', () => lowGeoDisposed++);
    for (const m of new Set(materialsOf(low))) m.addEventListener('dispose', () => lowMatDisposed++);
    expect(cache.evict(streetlampMeta.id, { level: 'low' })).toBe(true);
    expect(cache.size).toBe(1);
    expect(lowGeoDisposed).toBe(1);
    expect(lowMatDisposed).toBe(6); // 缓存按 material 数组逐项 dispose：金属共享实例 ×4 + 壳 + 板 = 6 次事件
    // 另一档不受影响：命中同引用
    expect(await cache.load(streetlampMeta.id)).toBe(high);
    // 幂等：已释放档再 evict 未命中
    expect(cache.evict(streetlampMeta.id, { level: 'low' })).toBe(false);
    expect(cache.size).toBe(1);
    // 释放后可重建
    const lowRebuilt = await cache.load(streetlampMeta.id, { level: 'low' });
    expect(lowRebuilt).not.toBe(low);
    expect(trisOf(lowRebuilt)).toBe(LOW_TRIS);
    expect(cache.size).toBe(2);
  });

  it('其余 4 设施资产缓存回归：恒单档键不含 level 后缀——high/low 请求同条目、单条目', async () => {
    const others = [parkbenchMeta, trashbinMeta, hydrantMeta, signpostMeta];
    const cache = new ProceduralSourceCache();
    caches.push(cache);
    for (const other of others) {
      expect(other.levels?.length ?? 0).toBeLessThanOrEqual(1); // 均未声明多档
      const a = await cache.load(other.id, { level: 'high' });
      const b = await cache.load(other.id, { level: 'low' }); // level 不参与键 → 命中同条目
      expect(b, `${other.id} 恒单档：low 请求应命中同条目`).toBe(a);
      expect(cache.size, `${other.id} 应恰占一个缓存条目`).toBe(others.indexOf(other) + 1);
    }
    expect(cache.size).toBe(others.length);
  });
});
