/**
 * tests/runtime/procedural/tree/metasequoiaStructure.test.ts —— 水杉枝干结构真实性
 * 测试（T012.2 Step 3a，对称 cedrusStructure 组织——方法复制；**对生轮生挂点 / 羽卡
 * 对生叶序 / 密连续锥 / 双器官下垂账目 / 顶梢通直 = 水杉独有断言组**——conifer
 * 转正例的结构证据面）。数值锚 = 水杉自己的 2026-09-29 探针终测。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildMetasequoiaGeometry 消费扩展 stats，与
 * 资产入口契约（asset_tree_metasequoia.asset）互补——本文件锁「结构怎么长」，那边
 * 锁「契约怎么传」）：
 * - 确定性：同 rng seed + 同 shapeProfile 两次构建 → 全属性逐位相等、stats 账目全等；
 *   rng 消费恒等 50463（**Step 4 密度校准终测 2026-09-29**〔初版 28965 被 12/8 簇位
 *   取代〕；消费顺序即契约——包裹闭包逐调用计数口径〔011.3 ③ 教训〕；**双器官账目
 *   零 rng + 交叉双卡第二卡零 rng 派生**——消费全在骨架/簇/卡/通透 roll）；
 * - 组序恰 2（D15：皮 0〔干+枝+底盖+球果/枯穗卡〕/ 羽卡 1）；皮拓扑恒等 17136
 *   （20 层枝 + 1 顶梢——L1–L5 = [21, 40, 80, 160, 320]）；主次分级（各级均起径
 *   严格递减、L1 ≥ 2.2×L2、L1 ≥ 12×L5——纤细分枝链）；
 * - **对生轮生骨架（身份核心——Step 1 判定 1 机制逐项）**：10 层挂高单调升 + 首层
 *   挂高 ≈ trunkHeightRatio × 树高 + **层间距 ∈ [0.9, 1.6]**（密层读向——vs 雪松
 *   1.5–2.0 疏层；slot-0 实测 1.17）+ 层角梯度（首层自垂直角 ∈ [70, 90] 近水平 →
 *   顶层 ∈ [30, 60] 上举、首 > 末——s01 终审精化域）+ **对生成对**（层内对方位差
 *   ≈ π ± 0.5——「twigs…in opposite pairs」Verified）+ **层间交错 90°**（相邻层
 *   同 rank 方位差 ≈ π/2 ± 0.6——decussate 观感）+ **顶梢通直无点头**（peak − tip
 *   < 0.05——leaderDroop 0 占位短路，vs 雪松 > 0.15 点头）+ **跨槽皮面恒等**（8 槽
 *   barkTriangles / levelBranches 逐位同——结构计数类槽间恒等的几何实证）；
 * - 羽簇挂点（对生叶序单挂点——判定 2）：簇账守恒（保留 + 剔除 = L5 320×12 +
 *   L4 160×8 + 顶梢 6 = 5126——**Step 4 密度校准值 12/8**〔初版 6/4 = 2566〕）
 *   + L5 末梢簇主导 + 簇-枝梢绑定（簇心贴挂点 cm 级、簇方向单位向量）+ 卡域
 *   （羽卡长 ∈ [0.18, 0.30] × 轮廓比 ∈ [1.8, 2.6] 卵状椭圆——**Step 4 密度校准
 *   带**：对齐雪松 ≥0.3m 实证；细质地身份由 SDF 内部羽列密度承载）+ aBend 沿枝弧长域（卡内根→尖
 *   非降、全域 ⊂ [0, 0.85]、**末级权重 > L4**——末级最大冻结语义）+ aLeafRand
 *   ∈ [0,1) + 组 0（含器官卡）恒 0；
 * - uv 三级帧域隔离（冻结接口——vs 雪松双帧域）：皮管域逐管归一（组 0 内 v < 1.0
 *   的管段 max ≤ 0.921 + ε——球果域自 1.0 起的必要防线）；球果卡 v∈[1,2) 顶点 =
 *   果 × 12 / 枯穗卡 v∈[2,3) 顶点 = 穗 × 12 / 羽卡 v∈[0, 0.99]（尖 0.99 = 1.0
 *   判别阈值安全边距）；组账守恒；
 * - 双器官下垂账目（零 rng——posHash 确定性）：球果全冠 ∈ [15, 60]（「零星-少量」
 *   Observed 量级定档带——slot-0 实测 39）+ **单 cohort 锁**（无类别拆分——当年
 *   熟绿果一类）+ 果三角 = 果 × 4（交叉双卡）+ 枯穗 ∈ [40, 140]（s04 残留读向
 *   量级——slot-0 实测 90）+ 穗三角 = 穗 × 4 + 同 seed 逐位复现；
 * - 密连续锥（判定 3——vs 雪松层隙带）：gapRejects === 0（tierGapBand 零端消费 =
 *   密度场整场短路——连续分布无层间空带）+ tierGapBand > 0 时密度场实际生效
 *   （参数真实驱动的分支覆盖）；
 * - 通透规则实际生效（通道硬抑制命中——密冠露干）+ 账目守恒；
 * - 贴地契约 minY 精确 0；参数面真实驱动（canopyDensity 压低）。
 * 边界：构建产物 afterEach 统一 dispose。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { buildMetasequoiaGeometry } from '../../../../src/runtime/procedural/tree/metasequoia/metasequoiaGeometry';
import type { MetasequoiaGeometryResult } from '../../../../src/runtime/procedural/tree/metasequoia/metasequoiaGeometry';
import { METASEQUOIA_SHAPE_PROFILES, METASEQUOIA_SLOT0_PROFILE } from '../../../../src/runtime/procedural/tree/metasequoia/metasequoiaShapeProfile';

const SEED0 = morphSeedOf('asset_tree_metasequoia', 0);
/** slot-0 High rng 消费快照（探针终测 2026-09-29，包裹闭包逐调用计数——任何条件
 *  跳过消费都违约；双器官账目零 rng——消费全在骨架/簇/卡/通透 roll；交叉双卡第二
 *  卡零 rng 派生） */
const RNG_CALLS_LOCK = 50463;
/** 皮拓扑面数（20 层枝 + 1 顶梢：主干 518 + L1 2058 + L2 2400 + L3 3200 + L4 3840 +
 *  L5 5120——槽间恒等的结构性保证） */
const BARK_TRIS_LOCK = 17136;

const built: MetasequoiaGeometryResult[] = [];

function buildTracked(seed: number, profile = METASEQUOIA_SLOT0_PROFILE): MetasequoiaGeometryResult {
  const result = buildMetasequoiaGeometry(mulberry32(seed), profile);
  built.push(result);
  return result;
}

afterEach(() => {
  for (const { geometry } of built.splice(0)) geometry.dispose();
});

/** 角度差归一 (-π, π]（对生成对/层间交错的环绕差断言用） */
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

describe('确定性（shapeProfile 路径 + rng 消费恒等）', () => {
  it('同 seed + 同 profile 两次构建：position/normal/aLeafRand/aBend/uv 逐位相等、stats 账目全等', () => {
    const a = buildTracked(SEED0);
    const b = buildTracked(SEED0);
    for (const attr of ['position', 'normal', 'uv', 'aLeafRand', 'aBend'] as const) {
      expect(a.geometry.getAttribute(attr).array).toEqual(b.geometry.getAttribute(attr).array);
    }
    expect(a.stats).toEqual(b.stats);
  }, 30000);

  it('profile 缺省 = slot-0 标准组合显式传入（锚点回落路径逐位一致）', () => {
    const a = buildMetasequoiaGeometry(mulberry32(SEED0));
    const b = buildTracked(SEED0, METASEQUOIA_SLOT0_PROFILE);
    built.push(a);
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.stats).toEqual(b.stats);
  }, 30000);

  it(`rng 消费恒等 ${RNG_CALLS_LOCK}（消费顺序即契约——双器官账目零 rng；次数变化 = 随机流重排；Step 4 校准后新锁）`, () => {
    const stream2 = mulberry32(SEED0);
    let calls = 0;
    buildMetasequoiaGeometry(
      () => {
        calls++;
        return stream2();
      },
      METASEQUOIA_SLOT0_PROFILE,
      'high',
    ).geometry.dispose();
    expect(calls).toBe(RNG_CALLS_LOCK);
  }, 30000);
});

describe('组序与皮拓扑（D15 恰 2 组 + 结构计数恒等）', () => {
  it(`五级拓扑计数恒等 [21, 40, 80, 160, 320]（20 层枝 + 1 顶梢）、皮面数恒等 ${BARK_TRIS_LOCK}——槽间皮恒定的前提`, () => {
    const { stats, geometry } = buildTracked(SEED0);
    expect(stats.levelBranches).toEqual([21, 40, 80, 160, 320]);
    expect(stats.barkTriangles).toBe(BARK_TRIS_LOCK);
    expect(geometry.groups, '应恰 2 组（皮 0〔含球果/枯穗卡〕/ 羽卡 1）').toHaveLength(2);
    expect(geometry.groups[0]!.materialIndex).toBe(0);
    expect(geometry.groups[1]!.materialIndex).toBe(1);
  }, 30000);

  it('各级平均起径严格递减；L1 ≥ 2.2×L2 且 L1 ≥ 12×L5（层级对比可辨——纤细分枝链 vs 密尖塔冠)', () => {
    const { stats } = buildTracked(SEED0);
    const radii = stats.levelMeanStartRadius;
    expect(radii).toHaveLength(5);
    for (let i = 0; i < 4; i++) {
      expect(radii[i]!, `L${i + 1} 均起径应大于 L${i + 2}`).toBeGreaterThan(radii[i + 1]!);
    }
    expect(radii[0]! / radii[1]!).toBeGreaterThanOrEqual(2.2);
    expect(radii[0]! / radii[4]!).toBeGreaterThanOrEqual(12);
  }, 30000);

  it('跨槽皮面恒等：8 槽 barkTriangles / levelBranches 逐位同 slot-0（结构计数类槽间恒等的几何实证）', () => {
    for (let slot = 0; slot < 8; slot++) {
      const { stats } = buildTracked(morphSeedOf('asset_tree_metasequoia', slot), METASEQUOIA_SHAPE_PROFILES[slot]!);
      expect(stats.barkTriangles, `slot-${slot} 皮面应恒等`).toBe(BARK_TRIS_LOCK);
      expect(stats.levelBranches, `slot-${slot} 拓扑应恒等`).toEqual([21, 40, 80, 160, 320]);
    }
  }, 60000);
});

describe('对生轮生骨架（身份核心——Step 1 判定 1 机制逐项）', () => {
  it(`10 层挂高单调升；首层挂高 ≈ trunkHeightRatio × 树高（±15%）；层间距 ∈ [0.9, 1.6]（密层——vs 雪松 1.5–2.0 疏层；slot-0 实测 1.17）`, () => {
    const { stats } = buildTracked(SEED0);
    const { tierHeights, tierSpacingMean } = stats;
    expect(tierHeights).toHaveLength(METASEQUOIA_SLOT0_PROFILE.tierCount);
    for (let i = 1; i < tierHeights.length; i++) {
      expect(tierHeights[i]!, `层 ${i} 挂高应高于层 ${i - 1}`).toBeGreaterThan(tierHeights[i - 1]!);
    }
    const firstExpect = METASEQUOIA_SLOT0_PROFILE.totalHeight * METASEQUOIA_SLOT0_PROFILE.trunkHeightRatio;
    expect(Math.abs(tierHeights[0]! - firstExpect) / firstExpect, '首层挂高应 ≈ trunkHeightRatio × 树高').toBeLessThanOrEqual(0.15);
    expect(tierSpacingMean, '层间距应落密层带 0.9–1.6m').toBeGreaterThanOrEqual(0.9);
    expect(tierSpacingMean).toBeLessThanOrEqual(1.6);
  }, 30000);

  it('层角梯度：首层自垂直角 ∈ [70, 90]（下部近水平）→ 顶层 ∈ [30, 60]（上部上举）、首 > 末（s01 终审精化域 70–85→30–50）', () => {
    const { stats } = buildTracked(SEED0);
    const first = stats.tierAngleMeans[0]!;
    const last = stats.tierAngleMeans[stats.tierAngleMeans.length - 1]!;
    expect(first, '首层枝角应近水平（自垂直角 70–90° 带内）').toBeGreaterThanOrEqual(70);
    expect(first).toBeLessThanOrEqual(90);
    expect(last, '顶层枝角应上举（30–60° 带内）').toBeGreaterThanOrEqual(30);
    expect(last).toBeLessThanOrEqual(60);
    expect(first - last, '层角梯度首末差 ≥ 25°（梯度可辨）').toBeGreaterThanOrEqual(25);
  }, 30000);

  it('对生成对：每层两枝方位差 ≈ π（±0.5 rad——「twigs…in opposite pairs」Verified 的层内实现）', () => {
    const { stats } = buildTracked(SEED0);
    for (let ti = 0; ti < stats.tierAzimuths.length; ti++) {
      const row = stats.tierAzimuths[ti]!;
      expect(row, `层 ${ti} 应有对生两枝`).toHaveLength(2);
      expect(Math.abs(wrapAngle(row[1]! - row[0]! - Math.PI)), `层 ${ti} 对生对方位差应 ≈ π`).toBeLessThan(0.5);
    }
  }, 30000);

  it('层间交错 90°：相邻层同 rank 方位差 ≈ π/2（±0.6 rad——decussate 观感，tierPhaseStagger 消费证据）', () => {
    const { stats } = buildTracked(SEED0);
    for (let ti = 0; ti + 1 < stats.tierAzimuths.length; ti++) {
      for (const r of [0, 1]) {
        const diff = wrapAngle(stats.tierAzimuths[ti + 1]![r]! - stats.tierAzimuths[ti]![r]!);
        expect(Math.abs(diff - Math.PI / 2), `层 ${ti}→${ti + 1} rank${r} 方位差应 ≈ π/2`).toBeLessThan(0.6);
      }
    }
  }, 30000);

  it('顶梢通直无点头：peak − tip < 0.05m（leaderDroop 0 占位短路——vs 雪松点头 > 0.15；slot-0 实测 0.000）', () => {
    const { stats } = buildTracked(SEED0);
    expect(Math.abs(stats.leaderPeakY - stats.leaderTipY), '顶梢最高站应 ≈ 末站（通直读向）').toBeLessThan(0.05);
  }, 30000);

  it('锥形收顶：首层带簇最大水平半径 ≥ 顶层带 × 1.5（近线性指数锥形收顶——密连续锥剪影）', () => {
    const { stats } = buildTracked(SEED0);
    const bottomBand = stats.tierHeights[0]!;
    const topBand = stats.tierHeights[stats.tierHeights.length - 1]!;
    const spanAt = (y: number): number => {
      let max = 0;
      for (const c of stats.clusters) {
        if (Math.abs(c.cy - y) < 1.0) max = Math.max(max, Math.hypot(c.cx, c.cz));
      }
      return max;
    };
    const bottom = spanAt(bottomBand);
    const top = spanAt(topBand);
    expect(bottom, '首层带簇应有分布').toBeGreaterThan(1);
    expect(bottom / top, '首层带簇最大半径应 ≥ 顶层带 × 1.5').toBeGreaterThanOrEqual(1.5);
  }, 30000);
});

describe('羽簇挂点（对生叶序单挂点——Step 1 判定 2 新形态语言）', () => {
  it('簇账守恒：保留 + 剔除 = L5 320×12 + L4 160×8 + 顶梢 6 = 5126 羽簇位（Step 4 校准值）；L5 末梢簇主导', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.clusters.length + stats.clustersCulled).toBe(
      320 * METASEQUOIA_SLOT0_PROFILE.clustersL5 + 160 * METASEQUOIA_SLOT0_PROFILE.clustersL4 + 6,
    );
    const l5 = stats.clusters.filter((c) => c.level === 4).length;
    const l4 = stats.clusters.filter((c) => c.level === 3).length;
    expect(l5, 'L5 末梢簇应占主导（末级枝外段受光区）').toBeGreaterThan(l4);
  }, 30000);

  it('簇-枝梢绑定：簇中心贴挂点（cm 级）、簇方向 = 单位向量', () => {
    const { stats } = buildTracked(SEED0);
    let maxBind = 0;
    let maxUnitErr = 0;
    for (const c of stats.clusters) {
      maxBind = Math.max(maxBind, Math.hypot(c.cx - c.attachX, c.cy - c.attachY, c.cz - c.attachZ));
      maxUnitErr = Math.max(maxUnitErr, Math.abs(Math.hypot(c.dirX, c.dirY, c.dirZ) - 1));
    }
    expect(maxBind, '簇中心到挂点距离应 < 0.09m（前移 ≤ 0.4×簇半径）').toBeLessThan(0.09);
    expect(maxUnitErr, '簇方向应为单位向量').toBeLessThan(1e-6);
  }, 30000);

  it('羽卡域：卡长 ∈ [0.18, 0.30]（Step 4 密度校准带——对齐雪松 ≥0.3m 实证；近景单卡大于实物羽枝 = 雪松同款取舍）、轮廓比 ∈ [1.8, 2.6]（卵状椭圆）', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    const leaf = result.geometry.groups[1]!;
    const pos = result.geometry.getAttribute('position');
    let bad = 0;
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      const w = Math.hypot(
        pos.array[(base + 1) * 3]! - pos.array[base * 3]!,
        pos.array[(base + 1) * 3 + 1]! - pos.array[base * 3 + 1]!,
        pos.array[(base + 1) * 3 + 2]! - pos.array[base * 3 + 2]!,
      );
      const len = Math.hypot(
        pos.array[(base + 5) * 3]! - pos.array[base * 3]!,
        pos.array[(base + 5) * 3 + 1]! - pos.array[base * 3 + 1]!,
        pos.array[(base + 5) * 3 + 2]! - pos.array[base * 3 + 2]!,
      );
      const aspect = len / w;
      if (
        len < METASEQUOIA_SLOT0_PROFILE.rosetteCardMin - 1e-3 ||
        len > METASEQUOIA_SLOT0_PROFILE.rosetteCardMin + METASEQUOIA_SLOT0_PROFILE.rosetteCardSpan + 1e-3 ||
        aspect < METASEQUOIA_SLOT0_PROFILE.needleCardAspectMin - 0.2 ||
        aspect > METASEQUOIA_SLOT0_PROFILE.needleCardAspectMin + METASEQUOIA_SLOT0_PROFILE.needleCardAspectSpan + 0.2
      ) {
        bad++;
      }
    }
    expect(bad, '羽卡应逐卡落 profile 长/轮廓比域（1e-3 容差 = Float32 顶点存储噪声）').toBe(0);
    expect(stats.needleCards, '应全部为羽卡（无散生单针——0 占位；Step 4 校准后 slot-0 实测 7260）').toBeGreaterThan(6000);
  }, 30000);

  it('aBend 沿枝弧长权重：卡内根→尖非降、全域 ⊂ [0, 0.85]（末级 L5 尖端最大 0.80 实测——末级最大冻结语义）；aLeafRand ∈ [0,1)；组 0（皮+器官）恒 0', () => {
    const result = buildTracked(SEED0);
    const bend = result.geometry.getAttribute('aBend');
    const rand = result.geometry.getAttribute('aLeafRand');
    const leaf = result.geometry.groups[1]!;
    let badBend = 0;
    let maxBend = 0;
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      if (bend.array[base]! > bend.array[base + 2]! + 1e-9) badBend++;
      maxBend = Math.max(maxBend, bend.array[base + 2]!);
    }
    expect(badBend, '卡内 aBend 应根→尖非降').toBe(0);
    expect(maxBend, 'aBend 全域应 ⊂ [0, 0.85]（(0.10+0.42)×1.0+0.28 = 0.80 理论最大）').toBeLessThanOrEqual(0.85);
    expect(maxBend, 'aBend 最大值应 > 0.7（末级最大权重实际涌现——非恒零占位）').toBeGreaterThan(0.7);
    const count = result.geometry.getAttribute('position').count;
    let badRand = 0;
    for (let i = 0; i < count; i++) {
      if (rand.array[i]! < 0 || rand.array[i]! >= 1) badRand++;
    }
    expect(badRand, 'aLeafRand 应 ∈ [0,1)').toBe(0);
    const barkGroup = result.geometry.groups[0]!;
    let badZero = 0;
    for (let i = barkGroup.start; i < barkGroup.start + barkGroup.count; i++) {
      if (rand.array[i]! !== 0 || bend.array[i]! !== 0) badZero++;
    }
    expect(badZero, '组 0（皮+器官）aLeafRand/aBend 应恒 0').toBe(0);
  }, 30000);
});

describe('uv 三级帧域隔离（T012.2 冻结接口——判别阈值 1.0 / 2.0，vs 雪松双帧域 1.5）', () => {
  it('皮管域逐管归一（组 0 内 v < 1.0 段 max ≤ 0.921）；球果域 v∈[1,2) 顶点 = 果 × 12；枯穗域 v∈[2,3) 顶点 = 穗 × 12；羽卡 v∈[0, 0.99]（尖 0.99 阈值安全边距）；组账守恒', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    const uv = result.geometry.getAttribute('uv');
    const barkGroup = result.geometry.groups[0]!;
    const leafGroup = result.geometry.groups[1]!;
    let tube = 0;
    let cones = 0;
    let strobili = 0;
    for (let i = barkGroup.start; i < barkGroup.start + barkGroup.count; i++) {
      const v = uv.array[i * 2 + 1]!;
      if (v >= 2) strobili++;
      else if (v >= 1) cones++;
      else tube++;
    }
    expect(tube, '皮管域应有大量顶点').toBeGreaterThan(0);
    expect(cones, '球果域 v∈[1,2) 顶点数应 = 果 × 12（交叉双卡）').toBe(stats.conesBaked * 12);
    expect(strobili, '枯穗域 v∈[2,3) 顶点数应 = 穗 × 12').toBe(stats.strobiliBaked * 12);
    // 皮管域（含底盖 v ≤ 0.9）：逐 v 校验上界
    const tubeVMax = 0.921 + 1e-3; // TUBE_V_MAX 0.92 + 底盖盘 0.4 半径（0.9 顶）+ 浮点容差
    let badTube = 0;
    for (let i = barkGroup.start; i < barkGroup.start + barkGroup.count; i++) {
      const v = uv.array[i * 2 + 1]!;
      if (v < 1 && v > tubeVMax) badTube++;
    }
    expect(badTube, `皮管域 v 应 ≤ ${tubeVMax}（逐管归一防线——球果域自 1.0 起）`).toBe(0);
    let badLeaf = 0;
    for (let i = leafGroup.start; i < leafGroup.start + leafGroup.count; i++) {
      const v = uv.array[i * 2 + 1]!;
      if (v < 0 || v > 0.99 + 1e-6) badLeaf++;
    }
    expect(badLeaf, '羽卡 v 应 ⊂ [0, 0.99]（尖 0.99 = 1.0 判别阈值安全边距）').toBe(0);
    // 组账守恒
    const group0Tris = barkGroup.count / 3;
    const group1Tris = leafGroup.count / 3;
    expect(group0Tris, '组 0（皮+器官）三角 = 皮拓扑 + 球果 + 枯穗').toBe(
      stats.barkTriangles + stats.coneTriangles + stats.strobiliTriangles,
    );
    expect(group1Tris, '组 1 三角 = 羽卡 × 2').toBe(stats.needleCards * 2);
  }, 30000);
});

describe('双器官下垂账目（零 rng——posHash 确定性布点，koelreuteria 账目法改写）', () => {
  it('球果全冠 ∈ [15, 60]（「零星-少量」Observed 定档带——slot-0 实测 39）+ 单 cohort（无类别拆分——当年熟绿果）+ 果三角 = 果 × 4；候选池 > 0', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.conesBaked, '全冠总果应落零星-少量量级带').toBeGreaterThanOrEqual(15);
    expect(stats.conesBaked).toBeLessThanOrEqual(60);
    expect(stats.coneTriangles).toBe(stats.conesBaked * 4);
    expect(stats.coneCandidatePool, '候选池 = 上半冠 L3 层枝 × 2 候选位（slot-0 实测 128）').toBeGreaterThan(0);
  }, 30000);

  it('雄序枯穗 ∈ [40, 140]（s04 残留读向量级——slot-0 实测 90）+ 穗三角 = 穗 × 4 + 候选池 > 球果池（第二器官 4 候选/位）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.strobiliBaked, '全冠枯穗应落残留量级带').toBeGreaterThanOrEqual(40);
    expect(stats.strobiliBaked).toBeLessThanOrEqual(140);
    expect(stats.strobiliTriangles).toBe(stats.strobiliBaked * 4);
    expect(stats.strobiliCandidatePool, '枯穗候选池应 > 球果池（4 候选/位 vs 2）').toBeGreaterThan(stats.coneCandidatePool);
  }, 30000);

  it('账目确定性：跨 seed 复算同 seed 果/穗集逐位同（含位置——零 rng 布点的复现面）', () => {
    const a = buildTracked(SEED0);
    const b = buildTracked(SEED0);
    expect(a.stats.conesBaked).toBe(b.stats.conesBaked);
    expect(a.stats.strobiliBaked).toBe(b.stats.strobiliBaked);
    // 位置逐位同已由确定性组覆盖（全属性逐位相等）；此处锁账目面的语义独立性
  }, 30000);
});

describe('密连续锥（判定 3——tierGapBand 零端消费 = 密度场整场短路）', () => {
  it('gapRejects === 0（slot-0 密度 1.0 + 零端层隙——连续分布无层间空带，vs 雪松层隙剔卡 383）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.gapRejects, '零端层隙消费：密度场整场短路，层隙剔卡应恒 0').toBe(0);
    expect(stats.bandSurvived[0] + stats.bandSurvived[1], '带内/带外存活合计应 = 存活卡数').toBe(stats.needleCards);
  }, 30000);

  it('tierGapBand > 0 时密度场实际生效（参数真实驱动的分支覆盖——雪松层隙语言路径）', () => {
    const wide = buildTracked(SEED0, { ...METASEQUOIA_SLOT0_PROFILE, tierGapBand: 0.5 });
    expect(wide.stats.gapRejects, '层隙加宽应激活密度场剔卡（带外衰减）').toBeGreaterThan(0);
  }, 30000);
});

describe('通透规则实际生效（通道硬抑制——密冠露干）', () => {
  it('存在剔卡；账目守恒（cards = candidates − channel − gap）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.needleCards).toBeLessThan(stats.needleCandidates);
    expect(stats.channelRejects, '枝干通道应实际剔卡（密冠露干——slot-0 Step 4 后实测 1214）').toBeGreaterThan(0);
    expect(stats.needleCards).toBe(
      stats.needleCandidates - stats.channelRejects - stats.gapRejects,
    );
  }, 30000);
});

describe('贴地契约与参数面驱动', () => {
  it('minY 精确 0（原点 = 底部中心；贴地平移语义）', () => {
    const result = buildTracked(SEED0);
    result.geometry.computeBoundingBox();
    expect(Math.abs(result.geometry.boundingBox!.min.y)).toBeLessThanOrEqual(0.001);
  }, 30000);

  it('canopyDensity 压低 → 卡数显著下降（同 seed 同拓扑，密度场真实消费）', () => {
    const base = buildTracked(SEED0);
    const sparse = buildTracked(SEED0, { ...METASEQUOIA_SLOT0_PROFILE, canopyDensity: 0.25 });
    expect(sparse.stats.barkTriangles).toBe(base.stats.barkTriangles); // 皮拓扑不受密度影响
    expect(sparse.stats.needleCards).toBeLessThan(base.stats.needleCards * 0.5);
  }, 30000);
});
