/**
 * tests/runtime/procedural/tree/salixLod.test.ts —— 垂柳 LOD 三档几何不变量
 * 测试（T011.12，对称 ligustrum organization——方法复制；快照数为垂柳自己的
 * 2026-09-23 续作会话终测锚（规范种子，探针六轮回调后定档））。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildSalixGeometry 三档，与资产入口契约
 * 互补——本文件锁「档间不变量怎么成立」）：
 * - High 逐位不动：缺省调用（profile + level 双缺省）= 显式 'high' 逐位相等；slot-0
 *   皮面 26180 / rng 消费 86115 快照延续（2026-09-23 工程密度回调后；快照口径 = 槽内跨档恒等；跨槽/跨 seed 消费数
 *   随保留簇数变化——先例同机制）；
 *   **meta.triangleCount = slot-0 High 实数（皮 + 单叶卡两账合计——写死 meta 前用
 *   build 实测核对的锁；资产入口静态 import，T020 软跳过清除）**；
 * - rng 三档恒等：同 seed 三档 rng 消费次数全等 86115（「发射省略不省略消费」纪律
 *   ——Low 壳卡不烘焙簇内叶卡但簇位/候选决策照常）；
 * - 档间同源账目：mid/low 的 stats.clusters / clustersCulled / channels /
 *   leafCandidates 与 high 逐位全等（Low 壳卡 = High 簇位表驱动的前提）；
 * - Mid ⊂ High：Mid 存活卡是 High 存活卡的逐位子集（XZ 位置块精确匹配 + 匹配卡 Y 差
 *   恒为单一贴地平移常量；j % 3 === 1 掩码只作用于烘焙阶段——L5 簇 9 选 3 / L4 簇
 *   10 选 3）；Mid 逐簇烘焙叶量 ≤ High 同簇；卡数比 ≈ 0.31 统计口径复核（终测
 *   密度回调后终测 0.325–0.331）；slot-0/6/7 三槽取证（卡数最少 / 最多 + 锚点）；
 * - **Low 壳卡账目（垂柳分化口径）：leafCards = 保留簇 × 1 单竖卡（簇位沿索拉长 →
 *   保留簇 640–822 级（vs 先例 ~474；密度回调 0.44→0.38 抑制后），双竖卡口径越 Low 预算上沿——单竖卡落带
 *   记档；宽轴 = 0.077 × 半幅（卡长宽比域 8–18 中位 13 的倒数延续——垂帘窄竖
 *   剪影））、叶组三角 = 保留簇 × 2（8 槽全扫）**；
 * - 预算锁定（D19.8，家族行沿用）：8 槽 × 3 档总面落锁定预算 High ≤ 40000 且
 *   ≥ 33000（垂柳细叶中数量档参考下沿——见资产模块头记档；密度回调后终测带 35610–38564）/
 *   Mid 6000–10000（终测 8716–9742）/ Low 1500–3000（终测 1650–2014）；
 * - 恰 2 组（皮 0 / 单叶卡 1，D15——无花果资产组 0 纯皮拓扑）；组账守恒（组 0 =
 *   皮 / 组 1 = 卡×2）；档间 bbox 一致：Mid XZ 跨差 ≤ 0.90m、Low XZ 跨差 ≤ 1.4m
 *   （**垂柳细长卡口径**——High 细长卡沿索斜伸的单卡极值毛边 vs Low 竖直壳卡主
 *   轮廓的结构性差（实测至 1.03m），vs 先例大卡平展口径 0.75 放宽记档；Mid 掩码
 *   下单张极值卡可整档缺失——先例同款容差）、Mid/Low 总高差 ≤ 1.0m、minY 三档全 0；
 * - Mid/Low 确定性：同 seed 同档两次构建 position/aBend 逐位复现、stats 全等；
 * - 法线健康：三档法线属性存在且逐分量有限无 NaN。
 * 边界：构建产物 afterEach 统一 dispose；8 槽 × 3 档横扫集中在单测试内复用 24 次构建。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import type { ProceduralLevel } from '../../../../src/domain/assets';
import { meta } from '../../../../src/runtime/procedural/assets/asset_tree_salix.asset';
import { buildSalixGeometry } from '../../../../src/runtime/procedural/tree/salix/salixGeometry';
import type { SalixGeometryResult } from '../../../../src/runtime/procedural/tree/salix/salixGeometry';
import { SALIX_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/salix/salixShapeProfile';
import { createGeometryTracker, leafCardXZ, spanOf } from '../../../support/procedural-tree/geometryHarness';

const LEVELS: ProceduralLevel[] = ['high', 'mid', 'low'];
const SEED0 = morphSeedOf('asset_tree_salix', 0);
/** rng 消费快照（slot-0 三档恒等——任何条件跳过消费都违约；槽内快照，跨槽/跨 seed
 *  随保留簇数变化（通透 roll 计数机制——先例同款）） */
const RNG_CALLS_LOCK = 86115;
/** High slot-0 皮面快照（皮拓扑恒等不动——salixStructure 同款锁） */
const BARK_TRIS_LOCK = 26180;
/** Mid/Low slot-0 皮面（径向/站点降段阶梯 + L5/L2–L5 不发射——发射计划见
 *  salixGeometry lodPlanFor；**Mid 5648 账目勘误记档：初记 4514 为 L4 段数笔误
 *  （189 × 3 段 × 3 × 2 = 3402 非 2268）**——6 骨架 + 1 领导拓扑） */
const BARK_TRIS_MID = 5648;
const BARK_TRIS_LOW = 370;
/** 档间 bbox 容差：Mid XZ 0.90m（L5 9 选 3 / L4 10 选 3 掩码下单张极值卡
 *  （≤ 簇半径 + 0.32m 斜伸——细长卡档最长 0.54m）可整档缺失；实测带 0.65–0.87
 *  （slot-5 高位单干外伸最大）——同 Low 口径的细长卡毛边记档）；**Low XZ 1.4m（垂柳细长卡口径——
 *  High 细长卡（0.16–0.54m）沿索斜伸的单卡极值毛边使 High XZ 显著大于簇群主
 *  轮廓（slot-2 浅垂端垂索最斜、毛边最大，实测差 1.33m），Low 竖直壳卡（宽轴
 *  0.077×半幅 ≈ 5cm 水平伸出）保簇群主轮廓不保毛边——毛边为远距亚像素细线、
 *  观感差异远小于 bbox 差（档间视觉连续由 Stage 档间取证覆盖），vs 先例大卡
 *  平展口径 0.75 放宽记档）**；总高 1.0m */
const SPAN_TOLERANCE_MID = 0.9;
const SPAN_TOLERANCE_LOW_XZ = 1.4;
const SPAN_TOLERANCE_Y = 1.0;
/** Low 壳卡宽轴比（细长卡中位长宽比 1/13 ≈ 0.077——卡长宽比域 8–18 中位的倒数
 *  在 Low 壳卡的延续——垂帘窄竖剪影） */
const LOW_SHELL_WIDTH_RATIO = 0.077;

const { track, disposeAll } = createGeometryTracker<SalixGeometryResult>();

/** 槽位构建（seed + 槽 profile + 档位——与资产路径 profileForSeed 同路由口径） */
function buildSlot(slot: number, level: ProceduralLevel = 'high'): SalixGeometryResult {
  return track(
    buildSalixGeometry(
      mulberry32(morphSeedOf('asset_tree_salix', slot)),
      SALIX_SHAPE_PROFILES[Math.min(slot, SALIX_SHAPE_PROFILES.length - 1)]!,
      level,
    ),
  );
}

afterEach(() => {
  disposeAll();
});

describe('High 逐位不动（缺省档回归锁）', () => {
  it('缺省调用（profile + level 双缺省）= 显式 high：position/aBend 数组与 stats 逐位全等', () => {
    const a = track(buildSalixGeometry(mulberry32(SEED0)));
    const b = buildSlot(0, 'high');
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.geometry.getAttribute('aBend').array).toEqual(b.geometry.getAttribute('aBend').array);
    expect(a.stats).toEqual(b.stats);
  }, 120000); // 沿先例：套件并行负载下 30s 余量不足，超时上限 120s——断言语义零变化

  it(`slot-0 皮面 ${BARK_TRIS_LOCK} / rng 消费 ${RNG_CALLS_LOCK} 快照延续（High 快照口径）`, () => {
    const stream = mulberry32(SEED0);
    let calls = 0;
    const { stats } = track(
      buildSalixGeometry(
        () => {
          calls++;
          return stream();
        },
        SALIX_SHAPE_PROFILES[0]!,
        'high',
      ),
    );
    expect(stats.barkTriangles).toBe(BARK_TRIS_LOCK);
    expect(calls).toBe(RNG_CALLS_LOCK);
  }, 120000);

  it('meta.triangleCount = slot-0 High 实数（皮 26180 + 单叶卡 ×2 两账合计——写死 meta 前用 build 实测核对的锁，同 salixShapeSlots 路由锁口径）', () => {
    const { stats } = buildSlot(0, 'high');
    expect(
      meta.triangleCount,
      'meta.triangleCount 应 = slot-0 High 实测总面（皮拓扑 + 单叶卡 ×2——无花果资产无果账）',
    ).toBe(stats.barkTriangles + stats.leafTriangles);
  }, 60000);
});

describe('rng 消费三档恒等（发射省略不省略消费——簇位/候选决策照常）', () => {
  it(`同 seed 三档 rng 消费均 ${RNG_CALLS_LOCK}（Mid/Low 发射省略不省略消费的纪律锁——Low 壳卡不烘焙簇内叶卡但候选决策照常）`, () => {
    for (const level of LEVELS) {
      const stream = mulberry32(SEED0);
      let calls = 0;
      track(
        buildSalixGeometry(
          () => {
            calls++;
            return stream();
          },
          SALIX_SHAPE_PROFILES[0]!,
          level,
        ),
      );
      expect(calls, `slot-0 ${level} 档 rng 消费应与 High 恒等`).toBe(RNG_CALLS_LOCK);
    }
  }, 60000);
});

describe('档间同源账目（簇位表 / 通道 / 候选不随档变化）', () => {
  it(`mid/low 的 clusters / clustersCulled / channels / leafCandidates 与 high 逐位全等；mid/low 皮面降段阶梯（Mid ${BARK_TRIS_MID}（账目勘误记档）/ Low ${BARK_TRIS_LOW}）`, () => {
    const high = buildSlot(0);
    for (const level of ['mid', 'low'] as ProceduralLevel[]) {
      const r = buildSlot(0, level);
      expect(r.stats.clusters, `${level} 簇位表应与 High 同源`).toEqual(high.stats.clusters);
      expect(r.stats.clustersCulled, `${level} 簇剔除账目应与 High 同源`).toBe(high.stats.clustersCulled);
      expect(r.stats.channels, `${level} 通道线段表应与 High 同源`).toEqual(high.stats.channels);
      expect(r.stats.leafCandidates, `${level} 叶候选数应与 High 同源`).toBe(high.stats.leafCandidates);
      if (level === 'mid') {
        expect(r.stats.barkTriangles, 'Mid 皮面降段阶梯（5648——L4 3402 账目勘误后实数）').toBe(BARK_TRIS_MID);
      } else {
        expect(r.stats.barkTriangles, 'Low 皮面极简管（370 量级档——6 骨架 + 1 领导拓扑）').toBe(BARK_TRIS_LOW);
      }
    }
  }, 60000);
});

describe('Mid ⊂ High（j % 3 === 1 掩码只在烘焙阶段生效——L5 簇 9 选 3 / L4 簇 10 选 3）', () => {
  it('Mid 存活卡 XZ 位置块逐位 ∈ High 卡集（Y 差 = 单一贴地平移常量）、逐簇烘焙叶量 ≤ High 同簇、卡数比 ≈ 0.31（slot-0/6/7）', () => {
    for (const slot of [0, 6, 7]) {
      const high = buildSlot(slot);
      const mid = buildSlot(slot, 'mid');
      // 掩码统计口径：Mid 卡数 ≈ High 存活卡 × 0.31（L5 9 选 3 / L4 10 选 3 混合——±18% 带内复核）
      expect(mid.stats.leafCards, `slot-${slot} Mid 应有存活卡`).toBeGreaterThan(0);
      const ratio = mid.stats.leafCards / high.stats.leafCards;
      expect(ratio, `slot-${slot} Mid/High 卡数比应 ∈ [0.25, 0.37]（实测 ${ratio.toFixed(4)}）`).toBeGreaterThan(0.25);
      expect(ratio).toBeLessThan(0.37);
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

describe('8 槽 × 3 档横扫（预算锁定 / 恰 2 组 / Low 壳卡单竖卡账目与 0.077 宽轴比例 / 档间 bbox 一致 / 法线健康）', () => {
  it('总面落锁定预算（High 33–40K / Mid 6–10K / Low 1.5–3K，D19.8）；恰 2 组；组账守恒（组 0 = 纯皮、组 1 = 卡）；同槽档间跨度差（Mid XZ ≤0.90 / Low XZ ≤1.4 / 总高 ≤1.0）、minY 全 0；Low 壳卡 = 簇 × 1 单竖卡且宽轴/高轴 = 2×0.077；法线有限', () => {
    for (let slot = 0; slot < 8; slot++) {
      const spans = {} as Record<ProceduralLevel, { xz: number; y: number; minY: number }>;
      const leafCardsByLevel = {} as Record<ProceduralLevel, number>;
      for (const level of LEVELS) {
        const r = buildSlot(slot, level);
        const total = r.stats.barkTriangles + r.stats.leafTriangles;
        // 恰 2 组（皮 0 / 单叶卡 1，D15 免组膨胀——无花果资产组 0 纯皮拓扑）
        expect(r.geometry.groups, `slot-${slot} ${level} 应恰 2 组`).toHaveLength(2);
        expect(r.geometry.groups[0]!.materialIndex).toBe(0);
        expect(r.geometry.groups[1]!.materialIndex).toBe(1);
        // 组账守恒：组 0 = 纯皮拓扑（无花果资产）、组 1 = 卡 × 2
        expect(r.geometry.groups[0]!.count / 3, `slot-${slot} ${level} 组 0 三角 = 纯皮拓扑`).toBe(
          r.stats.barkTriangles,
        );
        expect(r.geometry.groups[1]!.count / 3, `slot-${slot} ${level} 组 1 三角 = 卡 × 2`).toBe(
          r.stats.leafCards * 2,
        );
        // 预算锁定（锁定账目与依据见 asset_tree_salix.asset 模块头）
        if (level === 'high') {
          expect(total, `slot-${slot} High 总面应 ≤ 40000（上限预算）`).toBeLessThanOrEqual(40000);
          // 垂柳细叶中数量档参考下沿 33000（细长卡覆盖率高——记档同先例口径）
          expect(total, `slot-${slot} High 总面应 ≥ 33000（垂柳细叶中数量档参考下沿）`).toBeGreaterThanOrEqual(33000);
        } else if (level === 'mid') {
          expect(total, `slot-${slot} Mid 总面应落 6000–10000`).toBeGreaterThanOrEqual(6000);
          expect(total).toBeLessThanOrEqual(10000);
          expect(r.stats.leafCards, `slot-${slot} Mid 卡数应 ≤ High（掩码子集）`).toBeLessThanOrEqual(leafCardsByLevel.high!);
        } else {
          expect(total, `slot-${slot} Low 总面应落 1500–3000`).toBeGreaterThanOrEqual(1500);
          expect(total).toBeLessThanOrEqual(3000);
          // Low 壳卡账目（垂柳分化口径）：每保留簇 1 张离心切向单竖卡（× 2 tri）
          expect(r.stats.leafCards, `slot-${slot} Low 壳卡数应 = 保留簇 × 1（单竖卡口径——垂柳簇位沿索拉长的分化记档）`).toBe(r.stats.clusters.length);
          expect(r.stats.leafTriangles, `slot-${slot} Low 叶卡三角应 = 保留簇 × 2`).toBe(r.stats.clusters.length * 2);
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
        // Low 壳卡比例：宽轴 = 0.077 × 半幅（细长卡中位长宽比延续——先例同构口径：
        // 根边（顶点 0→1 = 2×halfW）/ 高轴（顶点 0→5 = half）恒 = 2 × 0.077）
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
          expect(worst, `slot-${slot} Low 壳卡宽轴/高轴应恒 = 2×0.077（细长卡中位长宽比延续；1e-3 容差 = Float32 噪声）`).toBeLessThan(1e-3);
        }
      }
      // 档间 bbox 一致（垂柳细长卡口径容差——Mid XZ ≤0.90（掩码极值卡缺失——细长卡毛边口径）/ Low
      // XZ ≤1.2（High 细长卡沿索斜伸的单卡极值毛边 vs 壳卡竖直主轮廓的结构性差，
      // 记档见容差常量注释）/ 总高 ≤1.0）
      for (const level of ['mid', 'low'] as ProceduralLevel[]) {
        const xzTol = level === 'mid' ? SPAN_TOLERANCE_MID : SPAN_TOLERANCE_LOW_XZ;
        expect(Math.abs(spans[level].xz - spans.high.xz), `slot-${slot} ${level} XZ 跨与 High 差应 ≤ ${xzTol}m`).toBeLessThanOrEqual(xzTol);
        expect(Math.abs(spans[level].y - spans.high.y), `slot-${slot} ${level} 总高与 High 差应 ≤ 1.0m`).toBeLessThanOrEqual(SPAN_TOLERANCE_Y);
      }
    }
  }, 120000);
});
