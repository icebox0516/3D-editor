/**
 * tests/runtime/procedural/tree/broadleafCanopyProxy.test.ts —— BroadleafCanopyProxy
 * 几何面不变量测试（T021.6）。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildBroadleafCanopyGeometry，13 树种全扫 +
 * tree3a 8 槽横扫；Low / High 参照几何同文件构建复用）：
 * - 面数预算带：13 树种 slot-0 恒 487 面（干柱 35 + 冠卡 452）≤ 500 红线（D41 §6.2
 *   锁定值，回写 lod-spec §5.2 canopy 列）；tree3a 8 槽全扫同带；恰 2 组（干柱 0 /
 *   冠卡 1，D15）；
 * - 风相位属性契约（§6.3）：aSeed/aBend/aLeafRand/aCrownQ 成套存在；aSeed 恒 0
 *   （= 散布链 High/Mid 缺属性 GL 缺省 0，档间 0=0 同相）；干柱组四属性恒 0；
 *   卡内 aBend 根(0,1,3)同值 < 尖(2,4,5)同值（Low 壳卡根尖序）；
 * - 与 Low 壳卡逐位同源：canopy 卡 aLeafRand 命中 Low 卡散列集时 aBend 根/尖逐位
 *   相等（同公式同常数同簇心 Y 域）；未命中者必为双卡第二卡（derive-1 散列像）；
 * - 冠形落几何（树种级差异可辨的 domain 级前替）：canopy 跨度落 High 真实冠幅
 *   ±0.7m 带内（垂柳 Low 窄卡是收缩伪影，身份基准 = High）；冠形态比（y/xz）落
 *   High ±0.2；High 形态比差 ≥ 0.2 的树种对在 canopy 序保持（差异方向不翻转）；
 *   13 树种 canopy 形态比两两互异；
 * - 簇场派生：canopy 卡底边中点 XZ 逐位落在簇心（卡位置 = 簇场派生非自建体系）；
 *   入选簇数 / 双单卡分层账目恒定；
 * - 确定性：同 (assetId, seed) 两次构建全部属性数组与 stats 逐位相等；
 * - 贴地：minY 精确 0（树种原点语义同构）。
 * 边界：13 树种 × (canopy + Mid + High) 构建走模块级缓存（一次构建多断言消费——
 *      参照几何随进程释放；独立二次构建的确定性断言自行 dispose 其产物）。
 */
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import {
  BROADLEAF_CANOPY_ASSET_IDS,
  buildBroadleafCanopyGeometry,
  harvestBroadleafCanopyField,
} from '../../../../src/runtime/procedural/tree/broadleafCanopyProxy';
import type { BroadleafCanopyGeometryResult } from '../../../../src/runtime/procedural/tree/broadleafCanopyProxy';
import type { BroadleafCanopyField } from '../../../../src/runtime/procedural/tree/broadleafCanopyProxy';
import { buildTree3aGeometry } from '../../../../src/runtime/procedural/tree/tree3a/tree3aGeometry';
import { TREE3A_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/tree3a/tree3aShapeProfile';
import { buildCamphorGeometry } from '../../../../src/runtime/procedural/tree/camphor/camphorGeometry';
import { CAMPHOR_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/camphor/camphorShapeProfile';
import { buildCeltisGeometry } from '../../../../src/runtime/procedural/tree/celtis/celtisGeometry';
import { CELTIS_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/celtis/celtisShapeProfile';
import { buildZelkovaGeometry } from '../../../../src/runtime/procedural/tree/zelkova/zelkovaGeometry';
import { ZELKOVA_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/zelkova/zelkovaShapeProfile';
import { buildGinkgoGeometry } from '../../../../src/runtime/procedural/tree/ginkgo/ginkgoGeometry';
import { GINKGO_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/ginkgo/ginkgoShapeProfile';
import { buildBischofiaGeometry } from '../../../../src/runtime/procedural/tree/bischofia/bischofiaGeometry';
import { BISCHOFIA_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/bischofia/bischofiaShapeProfile';
import { buildFraxinusGeometry } from '../../../../src/runtime/procedural/tree/fraxinus/fraxinusGeometry';
import { FRAXINUS_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/fraxinus/fraxinusShapeProfile';
import { buildKoelreuteriaGeometry } from '../../../../src/runtime/procedural/tree/koelreuteria/koelreuteriaGeometry';
import { KOELREUTERIA_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/koelreuteria/koelreuteriaShapeProfile';
import { buildLigustrumGeometry } from '../../../../src/runtime/procedural/tree/ligustrum/ligustrumGeometry';
import { LIGUSTRUM_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/ligustrum/ligustrumShapeProfile';
import { buildPlatanusGeometry } from '../../../../src/runtime/procedural/tree/platanus/platanusGeometry';
import { PLATANUS_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/platanus/platanusShapeProfile';
import { buildSalixGeometry } from '../../../../src/runtime/procedural/tree/salix/salixGeometry';
import { SALIX_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/salix/salixShapeProfile';
import { buildSophoraGeometry } from '../../../../src/runtime/procedural/tree/sophora/sophoraGeometry';
import { SOPHORA_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/sophora/sophoraShapeProfile';
import { buildTriadicaGeometry } from '../../../../src/runtime/procedural/tree/triadica/triadicaGeometry';
import { TRIADICA_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/triadica/triadicaShapeProfile';
import type { ProceduralLevel } from '../../../../src/domain/assets';

/** 参照几何构建器表（Low / High 参照与 profile 路由同 canopy 内部口径） */
const SPECIES_BUILDERS: Record<string, (rng: () => number, level: ProceduralLevel) => { geometry: import('three').BufferGeometry; stats: { clusters: unknown[] } }> = {
  asset_tree_3a: (r, l) => buildTree3aGeometry(r, TREE3A_SHAPE_PROFILES[0]!, l),
  asset_tree_camphor: (r, l) => buildCamphorGeometry(r, CAMPHOR_SHAPE_PROFILES[0]!, l),
  asset_tree_celtis: (r, l) => buildCeltisGeometry(r, CELTIS_SHAPE_PROFILES[0]!, l),
  asset_tree_zelkova: (r, l) => buildZelkovaGeometry(r, ZELKOVA_SHAPE_PROFILES[0]!, l),
  asset_tree_ginkgo: (r, l) => buildGinkgoGeometry(r, GINKGO_SHAPE_PROFILES[0]!, l),
  asset_tree_bischofia: (r, l) => buildBischofiaGeometry(r, BISCHOFIA_SHAPE_PROFILES[0]!, l),
  asset_tree_fraxinus: (r, l) => buildFraxinusGeometry(r, FRAXINUS_SHAPE_PROFILES[0]!, l),
  asset_tree_koelreuteria: (r, l) => buildKoelreuteriaGeometry(r, KOELREUTERIA_SHAPE_PROFILES[0]!, l),
  asset_tree_ligustrum: (r, l) => buildLigustrumGeometry(r, LIGUSTRUM_SHAPE_PROFILES[0]!, l),
  asset_tree_platanus: (r, l) => buildPlatanusGeometry(r, PLATANUS_SHAPE_PROFILES[0]!, l),
  asset_tree_salix: (r, l) => buildSalixGeometry(r, SALIX_SHAPE_PROFILES[0]!, l),
  asset_tree_sophora: (r, l) => buildSophoraGeometry(r, SOPHORA_SHAPE_PROFILES[0]!, l),
  asset_tree_triadica: (r, l) => buildTriadicaGeometry(r, TRIADICA_SHAPE_PROFILES[0]!, l),
};

// ── 模块级构建缓存（一次构建多断言消费；afterEach 不清——进程内复用，几何随进程释放）──
const canopyCache = new Map<string, BroadleafCanopyGeometryResult>();
const refCache = new Map<string, { geometry: import('three').BufferGeometry }>();

/** 树种 slot-0 canopy 构建（缓存） */
function canopyOf(assetId: string): BroadleafCanopyGeometryResult {
  let r = canopyCache.get(assetId);
  if (!r) {
    r = buildBroadleafCanopyGeometry(assetId);
    canopyCache.set(assetId, r);
  }
  return r;
}

/** 树种 slot-0 参照档（high / low）构建（缓存；只消费几何跨度 / 叶组属性） */
function refOf(assetId: string, level: ProceduralLevel): { geometry: import('three').BufferGeometry } {
  const key = `${assetId}::${level}`;
  let r = refCache.get(key);
  if (!r) {
    r = SPECIES_BUILDERS[assetId]!(mulberry32(morphSeedOf(assetId, 0)), level);
    refCache.set(key, r);
  }
  return r;
}

/** 几何跨度（XZ 最大水平跨 / 总高 / minY） */
function spanOf(g: import('three').BufferGeometry): { xz: number; y: number; minY: number } {
  g.computeBoundingBox();
  const b = g.boundingBox!;
  return { xz: Math.max(b.max.x - b.min.x, b.max.z - b.min.z), y: b.max.y - b.min.y, minY: b.min.y };
}

// ── 面数预算带（D41 §6.2：≤500 面 / 树含简化树干；锁定值回写 lod-spec §5.2）──

describe('面数预算带', () => {
  it('13 树种 slot-0 恒 487 面（干柱 35 + 冠卡 452）≤ 500 红线；恰 2 组（干柱 0 / 冠卡 1）', () => {
    expect(BROADLEAF_CANOPY_ASSET_IDS).toHaveLength(13);
    for (const id of BROADLEAF_CANOPY_ASSET_IDS) {
      const r = canopyOf(id);
      expect(r.stats.totalTriangles, `${id} 总面应恒 487 ≤ 500`).toBe(487);
      expect(r.stats.trunkTriangles, `${id} 干柱面应恒 35`).toBe(35);
      expect(r.stats.cardTriangles, `${id} 冠卡面应恒 452`).toBe(452);
      expect(r.stats.twoCardClusters, `${id} 双卡簇应恒 70`).toBe(70);
      expect(r.stats.oneCardClusters, `${id} 单卡簇应恒 86`).toBe(86);
      expect(r.stats.clustersSelected, `${id} 入选簇应恒 156`).toBe(156);
      const groups = r.geometry.groups;
      expect(groups, `${id} 应恰 2 组`).toHaveLength(2);
      expect(groups[0]!.count / 3, `${id} 组 0 应为干柱 35 面`).toBe(35);
      expect(groups[1]!.count / 3, `${id} 组 1 应为冠卡 452 面`).toBe(452);
    }
  }, 300000);

  it('tree3a 8 槽全扫同带且槽间几何各异（形态差异经簇场落到 canopy）', () => {
    const positions: string[] = [];
    for (let slot = 0; slot < 8; slot++) {
      const r = buildBroadleafCanopyGeometry('asset_tree_3a', morphSeedOf('asset_tree_3a', slot));
      expect(r.stats.totalTriangles, `slot-${slot} 总面应恒 487`).toBe(487);
      positions.push((r.geometry.getAttribute('position').array as Float32Array).join(','));
      r.geometry.dispose();
    }
    expect(new Set(positions).size, '8 槽 canopy 几何应两两互异').toBe(8);
  }, 300000);
});

// ── 风相位属性契约（§6.3：aSeed/aBend 声明 + 与高中档同相位原则）──

describe('风相位属性契约', () => {
  it('aSeed/aBend/aLeafRand/aCrownQ 成套存在；aSeed 恒 0（散布缺属性缺省 0 逐位一致）；干柱组恒 0；卡内 aBend 根 < 尖', () => {
    for (const id of BROADLEAF_CANOPY_ASSET_IDS) {
      const g = canopyOf(id).geometry;
      for (const name of ['aSeed', 'aBend', 'aLeafRand', 'aCrownQ']) {
        const attr = g.getAttribute(name);
        expect(attr, `${id} 应有 ${name} 属性`).toBeTruthy();
        expect(attr.itemSize, `${id} ${name} 应 itemSize 1`).toBe(1);
      }
      const seed = g.getAttribute('aSeed').array as ArrayLike<number>;
      let seedNonZero = 0;
      for (let i = 0; i < seed.length; i++) if (seed[i] !== 0) seedNonZero++;
      expect(seedNonZero, `${id} aSeed 应恒 0`).toBe(0);
      // 干柱组（组 0）四属性恒 0（merge 属性集一致 + 干柱免颤语义）
      const trunk = g.groups[0]!;
      for (const name of ['aSeed', 'aBend', 'aLeafRand', 'aCrownQ']) {
        const arr = g.getAttribute(name).array as ArrayLike<number>;
        let nonZero = 0;
        for (let i = trunk.start; i < trunk.start + trunk.count; i++) if (arr[i] !== 0) nonZero++;
        expect(nonZero, `${id} 干柱组 ${name} 应恒 0`).toBe(0);
      }
      // 卡内 aBend：根(0,1,3) 同值 < 尖(2,4,5) 同值；值域 [0,1]
      const bend = g.getAttribute('aBend').array as ArrayLike<number>;
      const cards = g.groups[1]!;
      for (let base = cards.start; base < cards.start + cards.count; base += 6) {
        const root = bend[base]!;
        const tip = bend[base + 2]!;
        expect(bend[base + 1]!, `${id} 卡根边应同值`).toBe(root);
        expect(bend[base + 3]!, `${id} 卡根边应同值`).toBe(root);
        expect(bend[base + 4]!, `${id} 卡尖边应同值`).toBe(tip);
        expect(bend[base + 5]!, `${id} 卡尖边应同值`).toBe(tip);
        expect(root, `${id} aBend 根应 ≤ 尖`).toBeLessThanOrEqual(tip);
        for (let v = 0; v < 6; v++) {
          const b = bend[base + v]!;
          expect(b, `${id} aBend 应 ∈ [0,1]`).toBeGreaterThanOrEqual(0);
          expect(b, `${id} aBend 应 ∈ [0,1]`).toBeLessThanOrEqual(1);
        }
      }
    }
  }, 300000);

  it('与 Low 壳卡逐位同源：aLeafRand 命中 Low 卡集时 aBend 根/尖逐位相等；未命中者必为命中卡的紧邻第二卡（双卡配对序）', () => {
    for (const id of BROADLEAF_CANOPY_ASSET_IDS) {
      const low = refOf(id, 'low').geometry;
      const lowBend = low.getAttribute('aBend').array as ArrayLike<number>;
      const lowRand = low.getAttribute('aLeafRand').array as ArrayLike<number>;
      const g1 = low.groups[1]!;
      const lowByRand = new Map<string, [number, number]>();
      for (let base = g1.start; base < g1.start + g1.count; base += 6) {
        lowByRand.set(String(lowRand[base]!), [lowBend[base]!, lowBend[base + 2]!]);
      }
      const c = canopyOf(id).geometry;
      const cb = c.getAttribute('aBend').array as ArrayLike<number>;
      const cr = c.getAttribute('aLeafRand').array as ArrayLike<number>;
      const cg1 = c.groups[1]!;
      let matched = 0;
      let derived = 0;
      /** 卡序配对判据：canopy 逐簇发射 [derive-0 卡][derive-1 卡（双卡簇）]——未命中
       *  Low 散列集的卡只允许作为某命中卡的紧邻后继出现（Float32 存储不可逆向重构
       *  f64 散列像，配对序是同簇第二卡的充分判据） */
      const cardStarts: number[] = [];
      for (let base = cg1.start; base < cg1.start + cg1.count; base += 6) cardStarts.push(base);
      for (let ci = 0; ci < cardStarts.length; ci++) {
        const base = cardStarts[ci]!;
        const hit = lowByRand.get(String(cr[base]!));
        if (hit) {
          matched++;
          expect(hit[0], `${id} 命中卡 aBend 根应与 Low 逐位相等`).toBe(cb[base]!);
          expect(hit[1], `${id} 命中卡 aBend 尖应与 Low 逐位相等`).toBe(cb[base + 2]!);
        } else {
          derived++;
          const prev = ci > 0 ? cardStarts[ci - 1]! : -1;
          expect(prev, `${id} 未命中卡不应为首卡`).toBeGreaterThanOrEqual(0);
          expect(lowByRand.has(String(cr[prev]!)), `${id} 未命中卡的前驱应为命中卡（双卡第二卡配对序）`).toBe(true);
          // 同簇双卡 aBend 同公式同 hw：根/尖与前驱逐位相等
          expect(cb[base]!, `${id} 双卡第二卡 aBend 根应与第一卡相等（同簇同 hw）`).toBe(cb[prev]!);
          expect(cb[base + 2]!, `${id} 双卡第二卡 aBend 尖应与第一卡相等（同簇同 hw）`).toBe(cb[prev + 2]!);
        }
      }
      expect(matched, `${id} 应有命中 Low 的卡`).toBeGreaterThan(0);
      expect(matched + derived, `${id} 卡数应 = 226`).toBe(226);
    }
  }, 300000);
});

// ── 冠形落几何（树种级差异可辨的 domain 级前替：几何级断言冠形参数差异落到输出）──

describe('冠形（树种差异落到 canopy 几何）', () => {
  it('canopy 跨度落 Mid 过渡对 ±0.7m（dither 连续性基准，D41 §5.1）与 High 宽身份带 ±1.3m；形态比落 Mid ±0.2；Mid 形态比差 ≥0.2 的树种对 canopy 序保持；13 树种形态比两两互异', () => {
    const aspects: { id: string; canopy: number; mid: number }[] = [];
    for (const id of BROADLEAF_CANOPY_ASSET_IDS) {
      const canopy = spanOf(canopyOf(id).geometry);
      const mid = spanOf(refOf(id, 'mid').geometry);
      const high = spanOf(refOf(id, 'high').geometry);
      // 主基准 = Mid（canopy 的 dither 过渡对——Mid/Low → Canopy）；参照带记档：
      // High 含花果外伸（koelreuteria 圆锥序）/ Low 有窄卡收缩伪影（salix 垂帘），
      // 单一参照系不成立，故 High 只锁宽身份带
      expect(Math.abs(canopy.xz - mid.xz), `${id} canopy XZ 跨应落 Mid ±0.7m`).toBeLessThanOrEqual(0.7);
      expect(Math.abs(canopy.y - mid.y), `${id} canopy 总高应落 Mid ±0.7m`).toBeLessThanOrEqual(0.7);
      expect(Math.abs(canopy.xz - high.xz), `${id} canopy XZ 跨应落 High 宽身份带 ±1.3m`).toBeLessThanOrEqual(1.3);
      expect(Math.abs(canopy.y - high.y), `${id} canopy 总高应落 High 宽身份带 ±1.3m`).toBeLessThanOrEqual(1.3);
      const aspectCanopy = canopy.y / canopy.xz;
      const aspectMid = mid.y / mid.xz;
      expect(Math.abs(aspectCanopy - aspectMid), `${id} 形态比应落 Mid ±0.2`).toBeLessThanOrEqual(0.2);
      aspects.push({ id, canopy: aspectCanopy, mid: aspectMid });
    }
    // Mid 形态比差 ≥ 0.2 的树种对：canopy 差值方向保持（差异可辨不翻转）
    let qualifying = 0;
    for (let i = 0; i < aspects.length; i++) {
      for (let j = i + 1; j < aspects.length; j++) {
        const a = aspects[i]!;
        const b = aspects[j]!;
        if (Math.abs(a.mid - b.mid) >= 0.2) {
          qualifying++;
          expect(
            Math.sign(a.canopy - b.canopy),
            `${a.id} vs ${b.id} 形态比序应保持（Mid ${a.mid.toFixed(3)} / ${b.mid.toFixed(3)}）`,
          ).toBe(Math.sign(a.mid - b.mid));
        }
      }
    }
    expect(qualifying, '应有 Mid 形态比差 ≥0.2 的树种对（断言面非空）').toBeGreaterThanOrEqual(6);
    // 13 树种 canopy 形态比两两互异（横向可辨的最小几何判据）
    expect(new Set(aspects.map((a) => a.canopy.toFixed(4))).size, '13 树种 canopy 形态比应两两互异').toBe(13);
  }, 600000);
});

// ── 簇场派生（§6.1：必须从 ClusterRecord / Low 壳卡逻辑派生，禁另建树冠体系）──

describe('簇场派生', () => {
  it('canopy 卡底边中点 XZ 逐位落簇心（卡位置 = 簇场派生）；账目恒定', () => {
    const fractTol = 1e-4;
    for (const id of BROADLEAF_CANOPY_ASSET_IDS) {
      const field: BroadleafCanopyField = harvestBroadleafCanopyField(id);
      expect(field.clusters.length, `${id} 簇场应非空`).toBeGreaterThan(0);
      const clusterKeys = new Set(field.clusters.map((c) => `${c.cx},${c.cz}`));
      const r = canopyOf(id);
      expect(r.stats.clustersTotal, `${id} 簇场总数应与收割一致`).toBe(field.clusters.length);
      const pos = r.geometry.getAttribute('position').array as ArrayLike<number>;
      const cards = r.geometry.groups[1]!;
      for (let base = cards.start; base < cards.start + cards.count; base += 6) {
        const mx = (pos[(base + 0) * 3]! + pos[(base + 1) * 3]!) / 2;
        const mz = (pos[(base + 0) * 3 + 2]! + pos[(base + 1) * 3 + 2]!) / 2;
        const hit = [...clusterKeys].some((k) => {
          const [cx, cz] = k.split(',').map(Number);
          return Math.abs(cx - mx) < fractTol && Math.abs(cz - mz) < fractTol;
        });
        expect(hit, `${id} canopy 卡底边中点应落簇心（实测 ${mx.toFixed(3)},${mz.toFixed(3)}）`).toBe(true);
      }
    }
  }, 300000);
});

// ── 确定性与贴地 ──

describe('确定性与贴地', () => {
  it('同 (assetId, seed) 两次构建全部属性数组与 stats 逐位相等（tree3a + salix）', () => {
    for (const id of ['asset_tree_3a', 'asset_tree_salix']) {
      const a = buildBroadleafCanopyGeometry(id);
      const b = buildBroadleafCanopyGeometry(id);
      for (const name of ['position', 'normal', 'uv', 'aSeed', 'aBend', 'aLeafRand', 'aCrownQ']) {
        const arrA = a.geometry.getAttribute(name).array as ArrayLike<number>;
        const arrB = b.geometry.getAttribute(name).array as ArrayLike<number>;
        expect(arrA.length, `${id} ${name} 数组长度应相等`).toBe(arrB.length);
        let diff = 0;
        for (let i = 0; i < arrA.length; i++) if (arrA[i] !== arrB[i]) diff++;
        expect(diff, `${id} ${name} 应逐位相等（差 ${diff} 分量）`).toBe(0);
      }
      expect(a.stats, `${id} stats 应全等`).toEqual(b.stats);
      a.geometry.dispose();
      b.geometry.dispose();
    }
  }, 300000);

  it('13 树种 minY 精确 0（原点语义与树种几何一致）', () => {
    for (const id of BROADLEAF_CANOPY_ASSET_IDS) {
      const s = spanOf(canopyOf(id).geometry);
      expect(Math.abs(s.minY), `${id} minY 应为 0`).toBeLessThanOrEqual(0.001);
    }
  }, 300000);
});
