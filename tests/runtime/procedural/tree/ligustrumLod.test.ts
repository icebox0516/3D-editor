/**
 * tests/runtime/procedural/tree/ligustrumLod.test.ts —— 女贞 LOD 三档几何不变量
 * 测试（T011.11，对称 fraxinus organization——方法复制；快照数为女贞自己的
 * 2026-09-22 终测锚（规范种子））。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildLigustrumGeometry 三档，与资产入口契约
 * 互补——本文件锁「档间不变量怎么成立」）：
 * - High 逐位不动：缺省调用（profile + level 双缺省）= 显式 'high' 逐位相等；slot-0
 *   皮面 24236 / rng 消费 85055 快照延续（快照口径 = 槽内跨档恒等；跨槽/跨 seed 消费数
 *   随保留簇数变化——先例同机制；核果挂点零 rng 无消费口径问题）；
 *   **meta.triangleCount = slot-0 High 实数（皮 + 单叶卡 + 核果簇三账合计——写死 meta
 *   前用 build 实测核对的锁；资产入口静态 import，T020 软跳过清除）**；
 * - rng 三档恒等：同 seed 三档 rng 消费次数全等 85055（「发射省略不省略消费」纪律
 *   ——Low 壳卡不烘焙簇内叶卡与核果簇但簇位/候选/果簇决策照常）；
 * - 档间同源账目：mid/low 的 stats.clusters / clustersCulled / channels /
 *   leafCandidates 与 high 逐位全等（Low 壳卡 = High 簇位表驱动的前提）；
 * - **核果簇档位策略（本资产独有断言组）：Mid 果账与 High 逐位全等（全量保留——
 *   身份信号，先例 Mid 果全量）；Low 果账 = 0（省略记档——远距亚像素，同先例 Low
 *   果处理）；8 槽簇数落满冠密簇定值带 35–60（终测 39–59——Mid 预算带约束记档见
 *   asset 模块头）**；
 * - Mid ⊂ High：Mid 存活卡是 High 存活卡的逐位子集（XZ 位置块精确匹配 + 匹配卡 Y 差
 *   恒为单一贴地平移常量；j % 3 === 1 掩码只作用于烘焙阶段——单叶卡簇 10 选 3）；Mid 逐簇
 *   烘焙叶量 ≤ High 同簇；卡数比 ≈ 0.30 统计口径复核（终测 0.302）；
 *   slot-0/6/7 三槽取证（卡数最少 / 最多 + 锚点）；
 * - Low 壳卡账目：leafCards = 保留簇 × 2、叶组三角 = 保留簇 × 4（8 槽全扫）；
 *   **Low 壳卡宽轴 = 0.44 × 半幅（单叶卡中位长宽比 1/2.25 在 Low 延续——变比例域的
 *   档间剪影中位比例；先例同构口径：根边（2×halfW）/ 高轴（half）恒 = 2×0.44）**；
 * - 预算锁定（D19.8，家族行沿用）：8 槽 × 3 档总面落锁定预算 High ≤ 40000 且
 *   ≥ 30500（女贞参考下沿——大卡中数量语义记档同先例口径；终测带 31032–36458）/
 *   Mid 6000–10000（终测 7666–9846）/ Low 1500–3000（终测 2038–2746）；
 * - 恰 2 组（皮+核果 0 / 单叶卡 1，D15）；组账守恒（组 0 = 皮 + 核果 / 组 1 = 卡×2）；
 *   档间 bbox 一致：Mid XZ 跨差 ≤ 0.65m、Low XZ 跨差 ≤ 0.75m（**大卡口径**——High
 *   大卡极值伸出（≤ 簇半径 + 0.34m 斜伸）vs 壳卡半幅（簇半径 + 0.22m）×0.44 宽轴，
 *   且 Mid 10 选 3 掩码下单张极值卡可整档缺失；先例同款容差）、Mid/Low 总高差 ≤ 1.0m、
 *   minY 三档全 0；
 * - Mid/Low 确定性：同 seed 同档两次构建 position/aBend 逐位复现、stats 全等；
 * - 法线健康：三档法线属性存在且逐分量有限无 NaN。
 * 边界：构建产物 afterEach 统一 dispose；8 槽 × 3 档横扫集中在单测试内复用 24 次构建。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import type { ProceduralLevel } from '../../../../src/domain/assets';
import { meta } from '../../../../src/runtime/procedural/assets/asset_tree_ligustrum.asset';
import { buildLigustrumGeometry } from '../../../../src/runtime/procedural/tree/ligustrum/ligustrumGeometry';
import type { LigustrumGeometryResult } from '../../../../src/runtime/procedural/tree/ligustrum/ligustrumGeometry';
import { LIGUSTRUM_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/ligustrum/ligustrumShapeProfile';
import { createGeometryTracker, leafCardXZ, spanOf } from '../../../support/procedural-tree/geometryHarness';

const LEVELS: ProceduralLevel[] = ['high', 'mid', 'low'];
const SEED0 = morphSeedOf('asset_tree_ligustrum', 0);
/** rng 消费快照（slot-0 三档恒等——任何条件跳过消费都违约；槽内快照，跨槽/跨 seed
 *  随保留簇数变化（通透 roll 计数机制——先例同款）；核果挂点零 rng */
const RNG_CALLS_LOCK = 85055;
/** High slot-0 皮面快照（皮拓扑恒等不动——ligustrumStructure 同款锁） */
const BARK_TRIS_LOCK = 24236;
/** Mid/Low slot-0 皮面（径向/站点降段阶梯 + L5/L2–L5 不发射——发射计划见
 *  ligustrumGeometry lodPlanFor；Low 370 = 330 量级档——6 骨架 + 1 领导拓扑） */
const BARK_TRIS_MID = 4514;
const BARK_TRIS_LOW = 370;
/** 档间 bbox 容差（大卡口径——先例同款）：Mid XZ 0.65m（10 选 3 掩码下单张极值卡
 *  （≤ 簇半径 + 0.34 斜伸）可整档缺失）；Low XZ 0.75m（High 大卡极值伸出 vs 壳卡
 *  宽轴 (簇半径+0.22)×0.44 的结构性差）；总高 1.0m */
const SPAN_TOLERANCE_MID = 0.65;
const SPAN_TOLERANCE_LOW_XZ = 0.75;
const SPAN_TOLERANCE_Y = 1.0;
/** Low 壳卡宽轴比（单叶卡中位长宽比 1/2.25 ≈ 0.44——变比例域的档间剪影中位比例） */
const LOW_SHELL_WIDTH_RATIO = 0.44;

const { track, disposeAll } = createGeometryTracker<LigustrumGeometryResult>();

/** 槽位构建（seed + 槽 profile + 档位——与资产路径 profileForSeed 同路由口径） */
function buildSlot(slot: number, level: ProceduralLevel = 'high'): LigustrumGeometryResult {
  return track(
    buildLigustrumGeometry(
      mulberry32(morphSeedOf('asset_tree_ligustrum', slot)),
      LIGUSTRUM_SHAPE_PROFILES[Math.min(slot, LIGUSTRUM_SHAPE_PROFILES.length - 1)]!,
      level,
    ),
  );
}

afterEach(() => {
  disposeAll();
});

describe('High 逐位不动（缺省档回归锁）', () => {
  it('缺省调用（profile + level 双缺省）= 显式 high：position/aBend 数组与 stats 逐位全等', () => {
    const a = track(buildLigustrumGeometry(mulberry32(SEED0)));
    const b = buildSlot(0, 'high');
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.geometry.getAttribute('aBend').array).toEqual(b.geometry.getAttribute('aBend').array);
    expect(a.stats).toEqual(b.stats);
  }, 120000); // 沿先例：套件并行负载下 30s 余量不足，超时上限 120s——断言语义零变化

  it(`slot-0 皮面 ${BARK_TRIS_LOCK} / rng 消费 ${RNG_CALLS_LOCK} 快照延续（High 快照口径）`, () => {
    const stream = mulberry32(SEED0);
    let calls = 0;
    const { stats } = track(
      buildLigustrumGeometry(
        () => {
          calls++;
          return stream();
        },
        LIGUSTRUM_SHAPE_PROFILES[0]!,
        'high',
      ),
    );
    expect(stats.barkTriangles).toBe(BARK_TRIS_LOCK);
    expect(calls).toBe(RNG_CALLS_LOCK);
  }, 120000);

  it('meta.triangleCount = slot-0 High 实数（皮 24236 + 单叶卡 ×2 + 核果果卡 ×4 三账合计——写死 meta 前用 build 实测核对的锁，同 ligustrumShapeSlots 路由锁口径）', () => {
    const { stats } = buildSlot(0, 'high');
    expect(
      meta.triangleCount,
      'meta.triangleCount 应 = slot-0 High 实测总面（皮拓扑 + 单叶卡 ×2 + 核果果卡 ×4）',
    ).toBe(stats.barkTriangles + stats.leafTriangles + stats.drupeTriangles);
  }, 60000);
});

describe('rng 消费三档恒等（发射省略不省略消费——簇位/候选/果簇决策照常）', () => {
  it(`同 seed 三档 rng 消费均 ${RNG_CALLS_LOCK}（Mid/Low 发射省略不省略消费的纪律锁——Low 壳卡不烘焙簇内叶卡与核果簇但候选决策照常）`, () => {
    for (const level of LEVELS) {
      const stream = mulberry32(SEED0);
      let calls = 0;
      track(
        buildLigustrumGeometry(
          () => {
            calls++;
            return stream();
          },
          LIGUSTRUM_SHAPE_PROFILES[0]!,
          level,
        ),
      );
      expect(calls, `slot-0 ${level} 档 rng 消费应与 High 恒等`).toBe(RNG_CALLS_LOCK);
    }
  }, 60000);
});

describe('档间同源账目（簇位表 / 通道 / 候选 / 核果簇不随档变化）', () => {
  it('mid/low 的 clusters / clustersCulled / channels / leafCandidates 与 high 逐位全等；mid/low 皮面降段阶梯', () => {
    const high = buildSlot(0);
    for (const level of ['mid', 'low'] as ProceduralLevel[]) {
      const r = buildSlot(0, level);
      expect(r.stats.clusters, `${level} 簇位表应与 High 同源`).toEqual(high.stats.clusters);
      expect(r.stats.clustersCulled, `${level} 簇剔除账目应与 High 同源`).toBe(high.stats.clustersCulled);
      expect(r.stats.channels, `${level} 通道线段表应与 High 同源`).toEqual(high.stats.channels);
      expect(r.stats.leafCandidates, `${level} 叶候选数应与 High 同源`).toBe(high.stats.leafCandidates);
      if (level === 'mid') {
        expect(r.stats.barkTriangles, 'Mid 皮面降段阶梯').toBe(BARK_TRIS_MID);
      } else {
        expect(r.stats.barkTriangles, 'Low 皮面极简管（330 量级档——6 骨架 + 1 领导拓扑）').toBe(BARK_TRIS_LOW);
      }
    }
  }, 60000);

  it('核果簇档位策略：Mid 果账与 High 逐位全等（全量保留——身份信号，先例 Mid 果全量）；Low 果账 = 0（省略记档——远距亚像素）', () => {
    const high = buildSlot(0);
    const mid = buildSlot(0, 'mid');
    const low = buildSlot(0, 'low');
    expect(mid.stats.drupeClusters, 'Mid 核果簇应全量保留（身份信号）').toBe(high.stats.drupeClusters);
    expect(mid.stats.drupeCards, 'Mid 核果果卡账应与 High 恒等（同一簇位表 + 同一散列抽选）').toBe(high.stats.drupeCards);
    expect(mid.stats.drupeTriangles).toBe(high.stats.drupeTriangles);
    expect(low.stats.drupeClusters, 'Low 核果簇应省略（远距亚像素——先例 Low 果处理）').toBe(0);
    expect(low.stats.drupeCards).toBe(0);
    expect(low.stats.drupeTriangles).toBe(0);
  }, 60000);
});

describe('Mid ⊂ High（j % 3 === 1 掩码只在烘焙阶段生效——单叶卡簇 10 选 3）', () => {
  it('Mid 存活卡 XZ 位置块逐位 ∈ High 卡集（Y 差 = 单一贴地平移常量）、逐簇烘焙叶量 ≤ High 同簇、卡数比 ≈ 0.30（slot-0/6/7）', () => {
    for (const slot of [0, 6, 7]) {
      const high = buildSlot(slot);
      const mid = buildSlot(slot, 'mid');
      // 掩码统计口径：Mid 卡数 ≈ High 存活卡 × 0.30（单叶卡簇 10 选 3——±20% 带内复核）
      expect(mid.stats.leafCards, `slot-${slot} Mid 应有存活卡`).toBeGreaterThan(0);
      const ratio = mid.stats.leafCards / high.stats.leafCards;
      expect(ratio, `slot-${slot} Mid/High 卡数比应 ∈ [0.24, 0.36]（实测 ${ratio.toFixed(4)}）`).toBeGreaterThan(0.24);
      expect(ratio).toBeLessThan(0.36);
      // 逐位子集（XZ 口径）：Mid 每张卡 6 顶点 XZ 块在 High 卡集中逐位存在；匹配对
      // Y 差恒为同一常量（= 档间 minY 贴地平移差——掩码过滤不改卡几何，只平移整树）
      const midCards = leafCardXZ(mid);
      expect(midCards.keys).toHaveLength(mid.stats.leafCards);
      const highCards = leafCardXZ(high);
      const highYByKey = new Map(highCards.keys.map((k, i) => [k, highCards.y0[i]!]));
      const missing = midCards.keys.filter((k) => !highYByKey.has(k));
      expect(missing, `slot-${slot} Mid 卡 XZ 应逐位 ⊂ High（失配 ${missing.length} 张）`).toHaveLength(0);
      const offset = midCards.y0[0]! - highYByKey.get(midCards.keys[0]!)!;
      for (let i = 0; i < midCards.keys.length; i++) {
        const dy = midCards.y0[i]! - highYByKey.get(midCards.keys[i]!)!;
        if (Math.abs(dy - offset) > 1e-6) {
          expect(dy, `slot-${slot} Mid/High 匹配卡 Y 差应恒为单一贴地平移常量 ${offset}`).toBe(offset);
        }
      }
      // 逐簇账目对齐：Mid 掩码子集 → 每簇烘焙叶量 ≤ High 同簇
      expect(mid.stats.clusterLeaves).toHaveLength(high.stats.clusterLeaves.length);
      for (let i = 0; i < high.stats.clusterLeaves.length; i++) {
        expect(mid.stats.clusterLeaves[i]!).toBeLessThanOrEqual(high.stats.clusterLeaves[i]!);
      }
    }
  }, 90000);
});

describe('Mid/Low 确定性（同 seed 同档逐位复现）', () => {
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

describe('8 槽 × 3 档横扫（预算锁定 / 恰 2 组 / Low 壳卡账目与 0.44 宽轴比例 / 核果簇定值带 / 档间 bbox 一致 / 法线健康）', () => {
  it('总面落锁定预算（High 30.5–40K / Mid 6–10K / Low 1.5–3K，D19.8）；恰 2 组；组账守恒（组 0 = 皮+核果、组 1 = 卡）；核果簇数落满冠密簇定值带 35–60；同槽档间跨度差（Mid XZ ≤0.65 / Low XZ ≤0.75 / 总高 ≤1.0）、minY 全 0；Low 壳卡 = 簇 × 2 且宽轴/高轴 = 2×0.44；法线有限', () => {
    for (let slot = 0; slot < 8; slot++) {
      const spans = {} as Record<ProceduralLevel, { xz: number; y: number; minY: number }>;
      const leafCardsByLevel = {} as Record<ProceduralLevel, number>;
      for (const level of LEVELS) {
        const r = buildSlot(slot, level);
        const total = r.stats.barkTriangles + r.stats.leafTriangles + r.stats.drupeTriangles;
        // 恰 2 组（皮+核果 0 / 单叶卡 1，D15 免组膨胀——核果入皮组）
        expect(r.geometry.groups, `slot-${slot} ${level} 应恰 2 组`).toHaveLength(2);
        expect(r.geometry.groups[0]!.materialIndex).toBe(0);
        expect(r.geometry.groups[1]!.materialIndex).toBe(1);
        // 组账守恒：组 0 = 皮拓扑 + 核果（果卡 × 4）、组 1 = 卡 × 2
        expect(r.geometry.groups[0]!.count / 3, `slot-${slot} ${level} 组 0 三角 = 皮拓扑 + 核果`).toBe(
          r.stats.barkTriangles + r.stats.drupeTriangles,
        );
        expect(r.geometry.groups[1]!.count / 3, `slot-${slot} ${level} 组 1 三角 = 卡 × 2`).toBe(
          r.stats.leafCards * 2,
        );
        // 预算锁定（锁定账目与依据见 asset_tree_ligustrum.asset 模块头）
        if (level === 'high') {
          expect(total, `slot-${slot} High 总面应 ≤ 40000（上限预算）`).toBeLessThanOrEqual(40000);
          // 女贞参考下沿 30500（大卡中数量语义——记档同先例口径）
          expect(total, `slot-${slot} High 总面应 ≥ 30500（女贞参考下沿）`).toBeGreaterThanOrEqual(30500);
          // 核果簇满冠密簇定值带（High 全量——终测 39–59）
          expect(r.stats.drupeClusters, `slot-${slot} High 核果簇数应落满冠密簇定值带 35–60`).toBeGreaterThanOrEqual(35);
          expect(r.stats.drupeClusters).toBeLessThanOrEqual(60);
        } else if (level === 'mid') {
          expect(total, `slot-${slot} Mid 总面应落 6000–10000`).toBeGreaterThanOrEqual(6000);
          expect(total).toBeLessThanOrEqual(10000);
          expect(r.stats.leafCards, `slot-${slot} Mid 卡数应 ≤ High（掩码子集）`).toBeLessThanOrEqual(leafCardsByLevel.high!);
        } else {
          expect(total, `slot-${slot} Low 总面应落 1500–3000`).toBeGreaterThanOrEqual(1500);
          expect(total).toBeLessThanOrEqual(3000);
          // Low 壳卡账目：每保留簇交叉双竖卡（2 卡 × 2 三角）；核果簇省略
          expect(r.stats.leafCards, `slot-${slot} Low 壳卡数应 = 保留簇 × 2`).toBe(r.stats.clusters.length * 2);
          expect(r.stats.leafTriangles, `slot-${slot} Low 叶卡三角应 = 保留簇 × 4`).toBe(r.stats.clusters.length * 4);
        }
        leafCardsByLevel[level] = r.stats.leafCards;
        // 法线健康：属性存在且逐分量有限无 NaN
        const nrm = r.geometry.getAttribute('normal');
        expect(nrm, `slot-${slot} ${level} 法线属性应存在`).toBeTruthy();
        let bad = 0;
        for (let i = 0; i < nrm.array.length; i++) if (!Number.isFinite(nrm.array[i])) bad++;
        expect(bad, `slot-${slot} ${level} 法线应有限无 NaN`).toBe(0);
        // bbox：minY 贴地（贴地平移语义不随档变化）
        const s = spanOf(r);
        expect(Math.abs(s.minY), `slot-${slot} ${level} minY 应为 0`).toBeLessThanOrEqual(0.001);
        spans[level] = s;
        // Low 壳卡比例：宽轴 = 0.44 × 半幅（变比例域的档间剪影中位比例——先例同构口径：
        // 根边（顶点 0→1 = 2×halfW）/ 高轴（顶点 0→5 = half）恒 = 2 × 0.44）
        if (level === 'low') {
          const pos = r.geometry.getAttribute('position');
          const g1 = r.geometry.groups[1]!;
          let worst = 0;
          for (let base = g1.start; base < g1.start + g1.count; base += 6) {
            const w = Math.hypot(
              pos.array[(base + 1) * 3]! - pos.array[base * 3]!,
              pos.array[(base + 1) * 3 + 1]! - pos.array[base * 3 + 1]!,
              pos.array[(base + 1) * 3 + 2]! - pos.array[base * 3 + 2]!,
            );
            const h = Math.hypot(
              pos.array[(base + 5) * 3]! - pos.array[base * 3]!,
              pos.array[(base + 5) * 3 + 1]! - pos.array[base * 3 + 1]!,
              pos.array[(base + 5) * 3 + 2]! - pos.array[base * 3 + 2]!,
            );
            worst = Math.max(worst, Math.abs(w / h - 2 * LOW_SHELL_WIDTH_RATIO));
          }
          expect(worst, `slot-${slot} Low 壳卡宽轴/高轴应恒 = 2×0.44（单叶中位长宽比延续；1e-3 容差 = Float32 噪声）`).toBeLessThan(1e-3);
        }
      }
      // 档间 bbox 一致（大卡口径容差——Mid XZ ≤0.65（掩码极值卡缺失）/ Low XZ ≤0.75
      // （High 大卡极值伸出 vs 壳卡宽轴的结构性差）/ 总高 ≤1.0）
      for (const level of ['mid', 'low'] as ProceduralLevel[]) {
        const xzTol = level === 'mid' ? SPAN_TOLERANCE_MID : SPAN_TOLERANCE_LOW_XZ;
        expect(Math.abs(spans[level].xz - spans.high.xz), `slot-${slot} ${level} XZ 跨与 High 差应 ≤ ${xzTol}m`).toBeLessThanOrEqual(xzTol);
        expect(Math.abs(spans[level].y - spans.high.y), `slot-${slot} ${level} 总高与 High 差应 ≤ 1.0m`).toBeLessThanOrEqual(SPAN_TOLERANCE_Y);
      }
    }
  }, 120000);
});
