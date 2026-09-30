/**
 * tests/runtime/procedural/tree/bungeanaLod.test.ts —— 白皮松 LOD 档间不变量
 * 测试（T012.4 Step 3a，组织对称族先例 juniperusGeometry.test LOD 段 /
 * metasequoiaLod；零 mock——真实几何生成三档同流比对）。数值锚 = 白皮松自己的
 * 2026-09-30 Step 3a 探针实测（bungeanaGeometry / asset_tree_bungeana 模块头）。
 *
 * 覆盖（LOD 档间不变量——lod-spec §2.3 资产侧验收面 + conifer 已锁预算行）：
 * - High 逐位不动（双缺省 = 显式 high——旧无参路径逐位不变）；
 * - rng 三档恒等 51863（发射省略不省略消费——Mid/Low 被省略发射的站点/簇位
 *   照常足额消费；果账目零 rng）；
 * - 档间同源账目（簇位表 / 通道 / 候选 / 果候选池逐位全等——决策表不随档变化；
 *   **Mid/Low 果省略**〔近景点彩级非身份信号——vs 圆柏浆果 Mid 全量的取舍差异
 *   记档〕+ 皮面降段阶梯 2850/762）；
 * - Mid ⊂ High（%4 站点掩码整簇保留交叉双卡——XZ 位置块逐位子集 + Y 差单一
 *   贴地平移常量；卡数比 ∈ [0.24, 0.27]——存活簇位抽 3/4 × 每簇双卡俱全）；
 * - Mid/Low 确定性（同 seed 同档逐位复现）；
 * - 8 槽 × 3 档预算横扫：High ≤ 40000 实测 31548–37108 / Mid 6000–10000 实测
 *   6544–7846 / Low 1500–3000 实测 2592–2758（conifer 已锁行）；恰 2 组；
 *   组账守恒；Low 壳卡 = ⌈簇/5⌉ × 单切向竖卡 × 束卡帧 v∈[0,0.99] × aBend 沿用
 *   × 果省略；同槽档间 bbox 一致（Mid XZ ≤0.5 / Low XZ ≤1.0 / 总高 ≤1.0）；
 *   minY 全 0；法线健康。
 * 边界：构建产物 afterEach 统一 dispose；24 次构建集中在单测试内复用。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import type { ProceduralLevel } from '../../../../src/domain/assets';
import { buildBungeanaGeometry } from '../../../../src/runtime/procedural/tree/bungeana/bungeanaGeometry';
import type { BungeanaGeometryResult } from '../../../../src/runtime/procedural/tree/bungeana/bungeanaGeometry';
import { BUNGEANA_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/bungeana/bungeanaShapeProfile';
import { createGeometryTracker, leafCardXZ, spanOf } from '../../../support/procedural-tree/geometryHarness';

const ID = 'asset_tree_bungeana';
const SEED0 = morphSeedOf(ID, 0);
const LEVELS: ProceduralLevel[] = ['high', 'mid', 'low'];
/** slot-0 三档 rng 消费快照（Step 3a 探针 2026-09-30——果账目零 rng；与
 *  bungeanaStructure RNG_CALLS_LOCK 同值双锁〔分件组织——juniperusGeometry
 *  单件先例的拆分位〕） */
const RNG_CALLS_LOCK = 51863;
/** 皮面降段阶梯（High 拓扑恒等 16996 归 Structure 分件锁；Mid/Low = 径向
 *  14/7/6/5/4/4 → 6/5/4/3/3/3 / 6/4/3/3/3/3 + 隔 1 抽 1 + L4/L5〔Mid〕/
 *  L2–L5〔Low〕细管不发射的发射计划账） */
const BARK_TRIS_MID = 2850;
const BARK_TRIS_LOW = 762;
/** 档间 bbox 容差（家族口径：Mid XZ 0.5 / Low XZ 1.0 / 总高 1.0——Low 壳卡
 *  + LOW_SHELL_MARGIN 0.20 的结构性伸出） */
const SPAN_TOLERANCE_MID = 0.5;
const SPAN_TOLERANCE_LOW_XZ = 1.0;
const SPAN_TOLERANCE_Y = 1.0;

const { track, disposeAll } = createGeometryTracker<BungeanaGeometryResult>();

afterEach(() => {
  disposeAll();
});

/** 槽位构建（seed + 槽 profile + 档位——与资产路径 profileForSeed 同路由口径） */
function buildSlot(slot: number, level: ProceduralLevel = 'high'): BungeanaGeometryResult {
  return track(
    buildBungeanaGeometry(
      mulberry32(morphSeedOf(ID, slot)),
      BUNGEANA_SHAPE_PROFILES[Math.min(slot, BUNGEANA_SHAPE_PROFILES.length - 1)]!,
      level,
    ),
  );
}

describe('LOD：High 逐位不动 + rng 三档恒等', () => {
  it('缺省调用（profile + level 双缺省）= 显式 high：position/aBend 数组与 stats 逐位全等', () => {
    const a = track(buildBungeanaGeometry(mulberry32(SEED0)));
    const b = buildSlot(0, 'high');
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.geometry.getAttribute('aBend').array).toEqual(b.geometry.getAttribute('aBend').array);
    expect(a.stats).toEqual(b.stats);
  }, 60000);

  it(`同 seed 三档 rng 消费均 ${RNG_CALLS_LOCK}（Mid/Low 发射省略不省略消费——果零 rng、簇位/候选决策照常）`, () => {
    for (const level of LEVELS) {
      const stream = mulberry32(SEED0);
      let calls = 0;
      track(
        buildBungeanaGeometry(
          () => {
            calls++;
            return stream();
          },
          BUNGEANA_SHAPE_PROFILES[0]!,
          level,
        ),
      );
      expect(calls, `slot-0 ${level} 档 rng 消费应与 High 恒等`).toBe(RNG_CALLS_LOCK);
    }
  }, 60000);
});

describe('LOD：档间同源账目（簇位表 / 通道 / 候选 / 果候选池不随档变化）', () => {
  it('mid/low 的 clusters / clustersCulled / channels / needleCandidates / 果候选池与 high 逐位全等；mid/low 果账目清零（近景点彩级省略——vs 圆柏 Mid 全量的取舍差异）+ 皮面降段阶梯', () => {
    const high = buildSlot(0);
    for (const level of ['mid', 'low'] as ProceduralLevel[]) {
      const r = buildSlot(0, level);
      expect(r.stats.clusters, `${level} 簇位表应与 High 同源`).toEqual(high.stats.clusters);
      expect(r.stats.clustersCulled, `${level} 簇剔除账目应与 High 同源`).toBe(high.stats.clustersCulled);
      expect(r.stats.channels, `${level} 通道线段表应与 High 同源`).toEqual(high.stats.channels);
      expect(r.stats.needleCandidates, `${level} 卡候选数应与 High 同源`).toBe(high.stats.needleCandidates);
      expect(r.stats.coneCandidatePool, `${level} 果候选池应与 High 同源（决策表档间同源——省略只在发射）`).toBe(high.stats.coneCandidatePool);
      expect(r.stats.conesMature, `${level} 果应省略（近景点彩级——幼果 1–2cm 中距亚像素非身份信号）`).toBe(0);
      expect(r.stats.conesYoung).toBe(0);
      expect(r.stats.coneTriangles).toBe(0);
      expect(r.stats.barkTriangles, `${level} 皮面降段阶梯`).toBe(level === 'mid' ? BARK_TRIS_MID : BARK_TRIS_LOW);
    }
  }, 60000);
});

describe('LOD：Mid ⊂ High（%4 站点掩码——整簇保留交叉双卡，只在烘焙阶段生效）', () => {
  it('Mid 存活卡 XZ 位置块逐位 ∈ High 卡集（Y 差 = 单一贴地平移常量）、卡数比 ∈ [0.24, 0.27]（存活簇位抽 3/4 × 每簇双卡俱全；slot-0/2/7）', () => {
    for (const slot of [0, 2, 7]) {
      const high = buildSlot(slot);
      const mid = buildSlot(slot, 'mid');
      expect(mid.stats.needleCards, `slot-${slot} Mid 应有存活卡`).toBeGreaterThan(0);
      const ratio = mid.stats.needleCards / high.stats.needleCards;
      expect(ratio, `slot-${slot} Mid/High 卡数比应 ∈ [0.24, 0.27]（实测 ${ratio.toFixed(4)}）`).toBeGreaterThanOrEqual(0.24);
      expect(ratio).toBeLessThanOrEqual(0.27);
      // 逐位子集（XZ 口径）：Mid 每张卡 6 顶点 XZ 块在 High 卡集中逐位存在；匹配对
      // Y 差恒为同一常量（= 档间 minY 贴地平移差；1e-4 容差 = Float32 在 8–14m
      // 量级的顶点量化噪声）
      const midCards = leafCardXZ(mid);
      expect(midCards.keys).toHaveLength(mid.stats.needleCards);
      const highCards = leafCardXZ(high);
      const highYByKey = new Map(highCards.keys.map((k, i) => [k, highCards.y0[i]!]));
      const missing = midCards.keys.filter((k) => !highYByKey.has(k));
      expect(missing, `slot-${slot} Mid 卡 XZ 应逐位 ⊂ High（失配 ${missing.length} 张）`).toHaveLength(0);
      const offset = midCards.y0[0]! - highYByKey.get(midCards.keys[0]!)!;
      for (let i = 0; i < midCards.keys.length; i++) {
        const dy = midCards.y0[i]! - highYByKey.get(midCards.keys[i]!)!;
        if (Math.abs(dy - offset) > 1e-4) {
          expect(dy, `slot-${slot} Mid/High 匹配卡 Y 差应恒为单一贴地平移常量 ${offset}`).toBe(offset);
        }
      }
    }
  }, 90000);
});

describe('LOD：Mid/Low 确定性（同 seed 同档逐位复现）', () => {
  it('mid/low 两次构建 position/aBend 逐位相等、stats 全等', () => {
    for (const level of ['mid', 'low'] as ProceduralLevel[]) {
      const a = buildSlot(0, level);
      const b = buildSlot(0, level);
      expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
      expect(a.geometry.getAttribute('aBend').array).toEqual(b.geometry.getAttribute('aBend').array);
      expect(a.stats).toEqual(b.stats);
    }
  }, 60000);
});

describe('LOD：8 槽 × 3 档横扫（预算锁定 / 恰 2 组 / Low 壳卡账目 / 档间 bbox 一致 / 法线健康）', () => {
  it('总面落 conifer 已锁预算带（High ≤ 40K——实测 31548–37108 / Mid 6–10K——6544–7846 / Low 1.5–3K——2592–2758）；恰 2 组；组账守恒；同槽档间跨度差（Mid XZ ≤0.5 / Low XZ ≤1.0 / 总高 ≤1.0）、minY 全 0；Low 壳卡 = ⌈簇/5⌉ + 束卡帧 + aBend 沿用 + 果省略；法线有限', () => {
    for (let slot = 0; slot < 8; slot++) {
      const spans = {} as Record<ProceduralLevel, { xz: number; y: number; minY: number }>;
      const leafCardsByLevel = {} as Record<ProceduralLevel, number>;
      for (const level of LEVELS) {
        const r = buildSlot(slot, level);
        const total = r.stats.barkTriangles + r.stats.needleTriangles + r.stats.coneTriangles;
        // 恰 2 组（皮 0 / 叶卡 1，D15 免组膨胀——果卡入皮组）
        expect(r.geometry.groups, `slot-${slot} ${level} 应恰 2 组`).toHaveLength(2);
        expect(r.geometry.groups[0]!.materialIndex).toBe(0);
        expect(r.geometry.groups[1]!.materialIndex).toBe(1);
        // 组账守恒：组 0 = 皮拓扑 + 果（器官卡入皮组——材质接口约定）、组 1 = 卡 × 2
        expect(r.geometry.groups[0]!.count / 3, `slot-${slot} ${level} 组 0 三角 = 皮 + 果`).toBe(
          r.stats.barkTriangles + r.stats.coneTriangles,
        );
        expect(r.geometry.groups[1]!.count / 3, `slot-${slot} ${level} 组 1 三角 = 卡 × 2`).toBe(
          r.stats.needleCards * 2,
        );
        // 预算锁定（锁定账目与依据见 asset_tree_bungeana.asset 模块头）
        if (level === 'high') {
          expect(total, `slot-${slot} High 总面应 ≤ 40000（已锁 conifer 行上限）`).toBeLessThanOrEqual(40000);
          expect(total, `slot-${slot} High 总面应 ≥ 30000（实测带下沿 31548 −5%）`).toBeGreaterThanOrEqual(30000);
        } else if (level === 'mid') {
          expect(total, `slot-${slot} Mid 总面应落 6000–10000`).toBeGreaterThanOrEqual(6000);
          expect(total).toBeLessThanOrEqual(10000);
          expect(r.stats.needleCards, `slot-${slot} Mid 卡数应 ≤ High（站点掩码子集）`).toBeLessThanOrEqual(leafCardsByLevel.high!);
        } else {
          expect(total, `slot-${slot} Low 总面应落 1500–3000`).toBeGreaterThanOrEqual(1500);
          expect(total).toBeLessThanOrEqual(3000);
          // Low 壳卡账目：隔簇抽取（stride 5）的单切向竖卡 + 果省略
          expect(r.stats.needleCards, `slot-${slot} Low 壳卡数应 = ⌈保留簇/5⌉`).toBe(Math.ceil(r.stats.clusters.length / 5));
          expect(r.stats.needleTriangles, `slot-${slot} Low 叶卡三角应 = 壳卡 × 2`).toBe(r.stats.needleCards * 2);
          expect(r.stats.coneTriangles, `slot-${slot} Low 果应省略`).toBe(0);
          // 壳卡走束卡帧 v∈[0, 0.99]（整簇抽象 → 材质 Low 档束 SDF 同帧——
          // 「Low 单卡」冻结接口）+ aBend 沿用（沿枝弧长语义 Low 不失——非恒零）
          const lowUv = r.geometry.getAttribute('uv');
          const lowBend = r.geometry.getAttribute('aBend');
          const lowLeaf = r.geometry.groups[1]!;
          let badFrame = 0;
          let maxBend = 0;
          for (let i = lowLeaf.start; i < lowLeaf.start + lowLeaf.count; i++) {
            const v = lowUv.array[i * 2 + 1]!;
            if (v < 0 || v > 0.99 + 1e-6) badFrame++;
            maxBend = Math.max(maxBend, lowBend.array[i]!);
          }
          expect(badFrame, `slot-${slot} Low 壳卡 v 应 ⊂ [0, 0.99] 束卡帧`).toBe(0);
          expect(maxBend, `slot-${slot} Low 壳卡 aBend 应非恒零（簇位弧长权重沿用）`).toBeGreaterThan(0.1);
        }
        leafCardsByLevel[level] = r.stats.needleCards;
        // 法线健康：属性存在且逐分量有限无 NaN（含果卡 flat 法线）
        const nrm = r.geometry.getAttribute('normal');
        expect(nrm, `slot-${slot} ${level} 法线属性应存在`).toBeTruthy();
        let bad = 0;
        for (let i = 0; i < nrm.array.length; i++) if (!Number.isFinite(nrm.array[i])) bad++;
        expect(bad, `slot-${slot} ${level} 法线应有限无 NaN`).toBe(0);
        // bbox：minY 贴地（贴地平移语义不随档变化）
        const s = spanOf(r);
        expect(Math.abs(s.minY), `slot-${slot} ${level} minY 应为 0`).toBeLessThanOrEqual(0.001);
        spans[level] = s;
      }
      // 档间 bbox 一致（Mid XZ ≤0.5m；Low XZ ≤1.0m〔竖向壳卡 + 0.20 余量的结构性
      // 伸出〕/ 总高 ≤1.0m）
      for (const level of ['mid', 'low'] as ProceduralLevel[]) {
        const xzTol = level === 'mid' ? SPAN_TOLERANCE_MID : SPAN_TOLERANCE_LOW_XZ;
        expect(Math.abs(spans[level].xz - spans.high.xz), `slot-${slot} ${level} XZ 跨与 High 差应 ≤ ${xzTol}m`).toBeLessThanOrEqual(xzTol);
        expect(Math.abs(spans[level].y - spans.high.y), `slot-${slot} ${level} 总高与 High 差应 ≤ 1.0m`).toBeLessThanOrEqual(SPAN_TOLERANCE_Y);
      }
    }
  }, 120000);
});
