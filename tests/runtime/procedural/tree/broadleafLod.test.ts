/**
 * tests/runtime/procedural/tree/broadleafLod.test.ts —— 夏栎 LOD 三档几何不变量测试
 * （T009.6，正式化已删探针 __lod-probe 的打印观察——本文件全部断言）。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildBroadleafGeometry 三档，与资产路由测试
 * （asset_tree_3a.test.ts）互补——本文件锁「档间不变量怎么成立」，那边锁「build
 * 契约怎么传 level」）：
 * - High 逐位不动：缺省调用（profile + level 双缺省）= 显式 'high' 逐位相等；slot-0
 *   皮面 20724 / rng 消费 177234 快照延续（009.1–009.4 路径不回归的纪律锁）；
 * - rng 三档恒等：同 seed 三档 rng 消费次数全等 177234（「发射省略不省略消费」纪律——
 *   Mid/Low 被省略发射的站点/叶候选照常足额消费，消费序列档间一致是簇表/通道/候选
 *   跨档全等的前提）；
 * - 档间同源账目：mid/low 的 stats.clusters / clustersCulled / channels / leafCandidates
 *   与 high 逐位全等（簇位表与候选生成不随档变化——Low 壳卡 = High 簇位表驱动的前提）；
 * - Mid ⊂ High：Mid 存活卡是 High 存活卡的逐位子集（XZ 位置块精确匹配 + 匹配卡 Y 差
 *   恒为单一贴地平移常量——几何尾部 minY 平移只改 Y，Mid 皮面采样不同致偏移档间不同；
 *   j % 3 === 1 掩码只作用于烘焙阶段；Mid 逐簇烘焙叶量 ≤ High 同簇；卡数比 ≈ 7/22
 *   统计口径复核；slot-0/6/7 三槽取证：卡数最少 / 最多 + 锚点）；
 * - Low 壳卡账目：leafCards = 保留簇 × 2、leafTriangles = 保留簇 × 4（8 槽全扫）；
 * - 预算锁定（D19.8）：8 槽 × 3 档总面落锁定预算 High ≤ 40000 / Mid 6000–10000 /
 *   Low 1500–3000（锁定账目与依据见 asset_tree_3a.asset 模块头）；
 * - 档间 bbox 一致：同槽三档 XZ 跨 / 总高差 ≤ 0.4m（LOW_SHELL_MARGIN 口径）、
 *   minY 三档全 0（贴地平移语义不随档变化）；
 * - Mid/Low 确定性：同 seed 同档两次构建 position/aBend 逐位复现、stats 全等；
 * - 法线健康：三档法线属性存在且逐分量有限无 NaN（Low 壳卡水平法线同样覆盖）。
 * 边界：构建产物 afterEach 统一 dispose；8 槽 × 3 档横扫集中在单测试内复用 24 次构建
 *      （预算/bbox/壳卡账目/法线四类断言一次跑完，避免逐 describe 重复构建拖慢）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import type { ProceduralLevel } from '../../../../src/domain/assets';
import { buildBroadleafGeometry } from '../../../../src/runtime/procedural/tree/broadleafGeometry';
import type { BroadleafTreeResult } from '../../../../src/runtime/procedural/tree/broadleafGeometry';
import { TREE3A_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/tree3aShapeProfile';

const LEVELS: ProceduralLevel[] = ['high', 'mid', 'low'];
const SEED0 = morphSeedOf('asset_tree_3a', 0);
/** rng 消费快照（三档恒等——009.1 起延续，任何条件跳过消费都违约） */
const RNG_CALLS_LOCK = 177234;
/** High slot-0 皮面快照（皮拓扑恒等不动——broadleafStructure 同款锁） */
const BARK_TRIS_LOCK = 20724;
/** 档间 bbox 容差（LOW_SHELL_MARGIN 口径——见 broadleafGeometry 常量注释） */
const SPAN_TOLERANCE = 0.4;

const built: BroadleafTreeResult[] = [];

function track(result: BroadleafTreeResult): BroadleafTreeResult {
  built.push(result);
  return result;
}

/** 槽位构建（seed + 槽 profile + 档位——与资产路径 profileForSeed 同路由口径） */
function buildSlot(slot: number, level: ProceduralLevel = 'high'): BroadleafTreeResult {
  return track(
    buildBroadleafGeometry(
      mulberry32(morphSeedOf('asset_tree_3a', slot)),
      TREE3A_SHAPE_PROFILES[Math.min(slot, TREE3A_SHAPE_PROFILES.length - 1)]!,
      level,
    ),
  );
}

afterEach(() => {
  for (const { geometry } of built.splice(0)) geometry.dispose();
});

/** bbox 跨度账目（XZ 最大水平跨 / 总高 / minY） */
function spanOf(result: BroadleafTreeResult): { xz: number; y: number; minY: number } {
  result.geometry.computeBoundingBox();
  const b = result.geometry.boundingBox!;
  return {
    xz: Math.max(b.max.x - b.min.x, b.max.z - b.min.z),
    y: b.max.y - b.min.y,
    minY: b.min.y,
  };
}

/** 叶组逐卡 XZ 位置块键（6 顶点 × x,z 共 12 分量 join）+ 首顶点 Y——Mid ⊂ High 匹配口径：
 *  几何尾部 minY 贴地平移只改 Y 分量，Mid 皮面采样不同 → 全局 Y 偏移档间不同，raw Y
 *  不可逐位比；X/Z 不受平移影响逐位可比，公共卡 Y 差 = 单一常量偏移（贴地平移差） */
function leafCardXZ(result: BroadleafTreeResult): { keys: string[]; y0: number[] } {
  const leaf = result.geometry.groups[1]!;
  const pos = result.geometry.getAttribute('position');
  const keys: string[] = [];
  const y0: number[] = [];
  for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
    const nums: number[] = [];
    for (let v = 0; v < 6; v++) {
      nums.push(pos.array[(base + v) * 3]!, pos.array[(base + v) * 3 + 2]!);
    }
    keys.push(nums.join(','));
    y0.push(pos.array[base * 3 + 1]!);
  }
  return { keys, y0 };
}

describe('High 逐位不动（缺省档回归锁）', () => {
  it('缺省调用（profile + level 双缺省）= 显式 high：position/aBend 数组与 stats 逐位全等', () => {
    const a = track(buildBroadleafGeometry(mulberry32(SEED0)));
    const b = buildSlot(0, 'high');
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.geometry.getAttribute('aBend').array).toEqual(b.geometry.getAttribute('aBend').array);
    expect(a.stats).toEqual(b.stats);
  }, 30000);

  it(`slot-0 皮面 ${BARK_TRIS_LOCK} / rng 消费 ${RNG_CALLS_LOCK} 快照延续（High 快照口径）`, () => {
    const stream = mulberry32(SEED0);
    let calls = 0;
    const { stats } = track(
      buildBroadleafGeometry(
        () => {
          calls++;
          return stream();
        },
        TREE3A_SHAPE_PROFILES[0]!,
        'high',
      ),
    );
    expect(stats.barkTriangles).toBe(BARK_TRIS_LOCK);
    expect(calls).toBe(RNG_CALLS_LOCK);
  }, 30000);
});

describe('rng 消费三档恒等（发射省略不省略消费）', () => {
  it(`同 seed 三档 rng 消费均 ${RNG_CALLS_LOCK}（Mid/Low 发射省略不省略消费的纪律锁）`, () => {
    for (const level of LEVELS) {
      const stream = mulberry32(SEED0);
      let calls = 0;
      track(
        buildBroadleafGeometry(
          () => {
            calls++;
            return stream();
          },
          TREE3A_SHAPE_PROFILES[0]!,
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
  it('Mid 存活卡 XZ 位置块逐位 ∈ High 卡集（Y 差 = 单一贴地平移常量）、逐簇烘焙叶量 ≤ High 同簇、卡数比 ≈ 7/22（slot-0/6/7）', () => {
    for (const slot of [0, 6, 7]) {
      const high = buildSlot(slot);
      const mid = buildSlot(slot, 'mid');
      // 掩码统计口径：Mid 卡数 ≈ High 存活卡 × 7/22（31.8%——±10% 带内复核）
      expect(mid.stats.leafCards, `slot-${slot} Mid 应有存活卡`).toBeGreaterThan(0);
      const ratio = mid.stats.leafCards / high.stats.leafCards;
      expect(ratio, `slot-${slot} Mid/High 卡数比应 ≈ 7/22（实测 ${ratio.toFixed(4)}）`).toBeGreaterThan((7 / 22) * 0.9);
      expect(ratio).toBeLessThan((7 / 22) * 1.1);
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

describe('8 槽 × 3 档横扫（预算锁定 / Low 壳卡账目 / 档间 bbox 一致 / 法线健康）', () => {
  it('总面落锁定预算（High ≤40K / Mid 6–10K / Low 1.5–3K，D19.8）；同槽三档跨度差 ≤0.4m、minY 全 0；Low 壳卡 = 簇 × 2；法线有限', () => {
    for (let slot = 0; slot < 8; slot++) {
      const spans = {} as Record<ProceduralLevel, { xz: number; y: number; minY: number }>;
      const leafCardsByLevel = {} as Record<ProceduralLevel, number>;
      for (const level of LEVELS) {
        const r = buildSlot(slot, level);
        const total = r.stats.barkTriangles + r.stats.leafTriangles;
        // 预算锁定（锁定账目与依据见 asset_tree_3a.asset 模块头）
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
