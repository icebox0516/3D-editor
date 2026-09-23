/**
 * tests/runtime/procedural/tree/camphorLod.test.ts —— 香樟 LOD 三档几何不变量测试
 * （T011.2，对称朴树 celtisLod 组织——方法复制；快照数为香樟自己的实测锚）。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildCamphorGeometry 三档，与资产入口契约互补——
 * 本文件锁「档间不变量怎么成立」）：
 * - High 逐位不动：缺省调用（profile + level 双缺省）= 显式 'high' 逐位相等；slot-0
 *   皮面 20782 / rng 消费 147058 快照延续（快照口径 = 槽内跨档恒等；跨槽消费数随保留
 *   簇数变化——朴树同机制）；
 * - rng 三档恒等：同 seed 三档 rng 消费次数全等 147058（「发射省略不省略消费」纪律）；
 * - 档间同源账目：mid/low 的 stats.clusters / clustersCulled / channels / leafCandidates
 *   与 high 逐位全等（Low 壳卡 = High 簇位表驱动的前提）；
 * - Mid ⊂ High：Mid 存活卡是 High 存活卡的逐位子集（XZ 位置块精确匹配 + 匹配卡 Y 差
 *   恒为单一贴地平移常量；j % 3 === 1 掩码只作用于烘焙阶段）；Mid 逐簇烘焙叶量 ≤ High
 *   同簇；卡数比 ≈ 6/18 统计口径复核；slot-0/6/7 三槽取证（卡数最少 / 最多 + 锚点）；
 * - Low 壳卡账目：leafCards = 保留簇 × 2、leafTriangles = 保留簇 × 4（8 槽全扫）；
 * - 预算锁定（D19.8，家族行沿用）：8 槽 × 3 档总面落锁定预算 High ≤ 40000 / Mid
 *   6000–10000 / Low 1500–3000（锁定账目与依据见 asset_tree_camphor.asset 模块头；
 *   High 下沿 ≥ 28754 在 camphorShapeSlots 通透预算带测试锁）；
 * - 恰 2 组（皮 0 / 叶 1，D15）；档间 bbox 一致：同槽三档 XZ 跨 / 总高差 ≤ 0.4m
 *   （LOW_SHELL_MARGIN 口径）、minY 三档全 0；
 * - Mid/Low 确定性：同 seed 同档两次构建 position/aBend 逐位复现、stats 全等；
 * - 法线健康：三档法线属性存在且逐分量有限无 NaN（Low 壳卡水平法线同样覆盖）。
 * 边界：构建产物 afterEach 统一 dispose；8 槽 × 3 档横扫集中在单测试内复用 24 次构建。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import type { ProceduralLevel } from '../../../../src/domain/assets';
import { buildCamphorGeometry } from '../../../../src/runtime/procedural/tree/camphor/camphorGeometry';
import type { CamphorGeometryResult } from '../../../../src/runtime/procedural/tree/camphor/camphorGeometry';
import { CAMPHOR_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/camphor/camphorShapeProfile';
import { createGeometryTracker, leafCardXZ, spanOf } from '../../../support/procedural-tree/geometryHarness';

const LEVELS: ProceduralLevel[] = ['high', 'mid', 'low'];
const SEED0 = morphSeedOf('asset_tree_camphor', 0);
/** rng 消费快照（slot-0 三档恒等——任何条件跳过消费都违约；槽内快照，跨槽随保留簇数变化） */
const RNG_CALLS_LOCK = 147058;
/** High slot-0 皮面快照（皮拓扑恒等不动——camphorStructure 同款锁） */
const BARK_TRIS_LOCK = 20782;
/** 档间 bbox 容差（LOW_SHELL_MARGIN 口径——见 camphorGeometry 常量注释） */
const SPAN_TOLERANCE = 0.4;

const { track, disposeAll } = createGeometryTracker<CamphorGeometryResult>();

/** 槽位构建（seed + 槽 profile + 档位——与资产路径 profileForSeed 同路由口径） */
function buildSlot(slot: number, level: ProceduralLevel = 'high'): CamphorGeometryResult {
  return track(
    buildCamphorGeometry(
      mulberry32(morphSeedOf('asset_tree_camphor', slot)),
      CAMPHOR_SHAPE_PROFILES[Math.min(slot, CAMPHOR_SHAPE_PROFILES.length - 1)]!,
      level,
    ),
  );
}

afterEach(() => {
  disposeAll();
});

describe('High 逐位不动（缺省档回归锁）', () => {
  it('缺省调用（profile + level 双缺省）= 显式 high：position/aBend 数组与 stats 逐位全等', () => {
    const a = track(buildCamphorGeometry(mulberry32(SEED0)));
    const b = buildSlot(0, 'high');
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.geometry.getAttribute('aBend').array).toEqual(b.geometry.getAttribute('aBend').array);
    expect(a.stats).toEqual(b.stats);
  }, 120000); // 沿朴树先例：套件并行负载下 30s 余量不足，超时上限 120s——断言语义零变化

  it(`slot-0 皮面 ${BARK_TRIS_LOCK} / rng 消费 ${RNG_CALLS_LOCK} 快照延续（High 快照口径）`, () => {
    const stream = mulberry32(SEED0);
    let calls = 0;
    const { stats } = track(
      buildCamphorGeometry(
        () => {
          calls++;
          return stream();
        },
        CAMPHOR_SHAPE_PROFILES[0]!,
        'high',
      ),
    );
    expect(stats.barkTriangles).toBe(BARK_TRIS_LOCK);
    expect(calls).toBe(RNG_CALLS_LOCK);
  }, 120000);
});

describe('rng 消费三档恒等（发射省略不省略消费）', () => {
  it(`同 seed 三档 rng 消费均 ${RNG_CALLS_LOCK}（Mid/Low 发射省略不省略消费的纪律锁）`, () => {
    for (const level of LEVELS) {
      const stream = mulberry32(SEED0);
      let calls = 0;
      track(
        buildCamphorGeometry(
          () => {
            calls++;
            return stream();
          },
          CAMPHOR_SHAPE_PROFILES[0]!,
          level,
        ),
      );
      expect(calls, `slot-0 ${level} 档 rng 消费应与 High 恒等`).toBe(RNG_CALLS_LOCK);
    }
  }, 60000);
});

describe('档间同源账目（簇位表 / 通道 / 候选不随档变化）', () => {
  it('mid/low 的 clusters / clustersCulled / channels / leafCandidates 与 high 逐位全等', () => {
    const high = buildSlot(0);
    for (const level of ['mid', 'low'] as ProceduralLevel[]) {
      const r = buildSlot(0, level);
      expect(r.stats.clusters, `${level} 簇位表应与 High 同源`).toEqual(high.stats.clusters);
      expect(r.stats.clustersCulled, `${level} 簇剔除账目应与 High 同源`).toBe(high.stats.clustersCulled);
      expect(r.stats.channels, `${level} 通道线段表应与 High 同源`).toEqual(high.stats.channels);
      expect(r.stats.leafCandidates, `${level} 叶候选数应与 High 同源`).toBe(high.stats.leafCandidates);
    }
  }, 60000);
});

describe('Mid ⊂ High（j % 3 === 1 掩码只在烘焙阶段生效）', () => {
  it('Mid 存活卡 XZ 位置块逐位 ∈ High 卡集（Y 差 = 单一贴地平移常量）、逐簇烘焙叶量 ≤ High 同簇、卡数比 ≈ 6/18（slot-0/6/7）', () => {
    for (const slot of [0, 6, 7]) {
      const high = buildSlot(slot);
      const mid = buildSlot(slot, 'mid');
      // 掩码统计口径：Mid 卡数 ≈ High 存活卡 × 6/18（33.3%——±10% 带内复核）
      expect(mid.stats.leafCards, `slot-${slot} Mid 应有存活卡`).toBeGreaterThan(0);
      const ratio = mid.stats.leafCards / high.stats.leafCards;
      expect(ratio, `slot-${slot} Mid/High 卡数比应 ≈ 6/18（实测 ${ratio.toFixed(4)}）`).toBeGreaterThan((6 / 18) * 0.9);
      expect(ratio).toBeLessThan((6 / 18) * 1.1);
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

describe('8 槽 × 3 档横扫（预算锁定 / 恰 2 组 / Low 壳卡账目 / 档间 bbox 一致 / 法线健康）', () => {
  it('总面落锁定预算（High ≤40K / Mid 6–10K / Low 1.5–3K，D19.8）；恰 2 组；同槽三档跨度差 ≤0.4m、minY 全 0；Low 壳卡 = 簇 × 2；法线有限', () => {
    for (let slot = 0; slot < 8; slot++) {
      const spans = {} as Record<ProceduralLevel, { xz: number; y: number; minY: number }>;
      const leafCardsByLevel = {} as Record<ProceduralLevel, number>;
      for (const level of LEVELS) {
        const r = buildSlot(slot, level);
        const total = r.stats.barkTriangles + r.stats.leafTriangles;
        // 恰 2 组（皮 0 / 叶 1，D15 免组膨胀）
        expect(r.geometry.groups, `slot-${slot} ${level} 应恰 2 组`).toHaveLength(2);
        expect(r.geometry.groups[0]!.materialIndex).toBe(0);
        expect(r.geometry.groups[1]!.materialIndex).toBe(1);
        // 预算锁定（锁定账目与依据见 asset_tree_camphor.asset 模块头）
        if (level === 'high') {
          expect(total, `slot-${slot} High 总面应 ≤ 40000（上限预算）`).toBeLessThanOrEqual(40000);
        } else if (level === 'mid') {
          expect(total, `slot-${slot} Mid 总面应落 6000–10000`).toBeGreaterThanOrEqual(6000);
          expect(total).toBeLessThanOrEqual(10000);
          expect(r.stats.leafCards, `slot-${slot} Mid 卡数应 ≤ High（掩码子集）`).toBeLessThanOrEqual(leafCardsByLevel.high!);
        } else {
          expect(total, `slot-${slot} Low 总面应落 1500–3000`).toBeGreaterThanOrEqual(1500);
          expect(total).toBeLessThanOrEqual(3000);
          // Low 壳卡账目：每保留簇交叉双竖卡（2 卡 × 2 三角）
          expect(r.stats.leafCards, `slot-${slot} Low 壳卡数应 = 保留簇 × 2`).toBe(r.stats.clusters.length * 2);
          expect(r.stats.leafTriangles, `slot-${slot} Low 叶三角应 = 保留簇 × 4`).toBe(r.stats.clusters.length * 4);
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
      }
      // 档间 bbox 一致（LOW_SHELL_MARGIN 口径 ≤ 0.4m）
      for (const level of ['mid', 'low'] as ProceduralLevel[]) {
        expect(Math.abs(spans[level].xz - spans.high.xz), `slot-${slot} ${level} XZ 跨与 High 差应 ≤ 0.4m`).toBeLessThanOrEqual(SPAN_TOLERANCE);
        expect(Math.abs(spans[level].y - spans.high.y), `slot-${slot} ${level} 总高与 High 差应 ≤ 0.4m`).toBeLessThanOrEqual(SPAN_TOLERANCE);
      }
    }
  }, 120000);
});
