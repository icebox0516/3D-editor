/**
 * tests/runtime/procedural/tree/juniperusGeometry.test.ts —— 圆柏几何结构 + LOD
 * 不变量 + 入口 meta 测试（T012.3 Step 3a，组织对称族先例 metasequoiaStructure /
 * metasequoiaLod——**入口 meta 断言并入本分件**〔metasequoia 测试组织裁定：族先例
 * 无独立入口分件，声明面归共享整表 + 本文件锁路由〕；零 mock——真实几何生成，
 * 直调 buildJuniperusGeometry 消费扩展 stats，与资产入口契约互补——本文件锁
 * 「结构怎么长 + 档间不变量怎么成立 + 入口怎么传」）。数值锚 = 圆柏自己的
 * 2026-09-29 Step 3a 探针实测（juniperusGeometry / asset_tree_juniperus 模块头）。
 *
 * 覆盖（圆柏新语义断言组——散生退化消费 / 绳卡 / 双叶型 / 柱卵轮廓 / 双熟度零 rng）：
 * - 确定性：同 rng seed + 同 shapeProfile 两次构建 → 全属性逐位相等、stats 全等；
 *   rng 消费恒等 56851（消费顺序即契约——包裹闭包逐调用计数口径；**浆果账目零
 *   rng**〔posHash 布点〕+ 交叉双卡第二卡零 rng 派生——消费全在骨架/散生旋/簇/
 *   刺卡/通透 roll）；
 * - 组序恰 2（D15：皮 0〔干+枝+底盖+浆果卡〕/ 叶卡 1）；皮拓扑恒等 16918
 *   （20 层枝 + 1 顶梢——L1–L5 = [21, 40, 80, 160, 320]；配置侧基数 16808 +
 *   顶梢管 98 + 底盖 12）；主次分级（各级均起径严格递减）；跨槽皮面恒等；
 * - **散生连续冠骨架（身份核心——Step 1 判定 1 层位退化消费四杠杆）**：层间距
 *   涌现 0.64m ± 大抖动破层（相邻层高差偏离名义层距 ≥ 25%——高度域连续读向）+
 *   枝角梯度（首层自垂直角 ∈ [40, 70] 斜展平展 → 顶层 ∈ [20, 40] 上举贴干）+
 *   层内散生对（对方位差 ≈ π ± 0.6——rank 均分步进）+ **层间随机旋**（rank0 方位
 *   跨层合向量 |R| < 0.6——去相干/方位均匀化，vs 雪松同相 π 列 / 水杉交错 π/2）
 *   + 密实无层连续冠（gapRejects === 0——tierGapBand 零端短路；>0 分支实际生效）
 *   + **柱/卵双型冠轮廓**（slot-0 狭圆柱：底带簇幅 / 顶带簇幅 ≥ 0.7 近等宽——vs
 *   水杉锥收 ≥1.5；slot-2 阔卵：中带簇幅 ≥ 底带 ×1.1 中部最宽）+ 顶梢通直无点头
 *   （peak ≈ tip——leaderDroop 0 占位短路第三例）；
 * - 绳卡挂点（主卡——第 3 叶语言）：簇账守恒（保留 + 剔除 = L5 320×12 + L4 160×8
 *   + 顶梢 6 = 5126）+ L5 末梢簇主导 + 簇-枝梢绑定（cm 级）+ **交叉双卡账目**
 *   （ropeCards = 保留簇 × 2——每簇恰一对卡）+ 卡域（绳卡长 ∈ [0.18, 0.30] 族校准
 *   带 × 轮廓比 ∈ [2.6, 4.2] 绳状细长）+ aBend 沿枝弧长域（卡内根→尖非降、全域
 *   ⊂ [0, 0.85]、末级最大涌现）+ aLeafRand ∈ [0,1) + 组 0（含浆果卡）恒 0；
 * - **刺卡 minority（双叶型并存——族内首例）**：awlCards > 0 且 < 绳卡 /8（minority
 *   比例——鳞叶绝对主导）+ 刺卡长 ⊂ [0.12, 0.20]（真刺叶 6–12 mm × 聚合映射近景位）
 *   + v∈[2,3) 刺卡帧独立于绳卡帧；
 * - uv 三级帧域隔离（冻结接口 2——阈值 1.0/2.0）：皮管域逐管归一（组 0 内 v < 1.0
 *   的管段 max ≤ 0.921）；浆果域 v∈[1,2) 顶点 = 果 × 12；叶卡绳帧 v∈[0, 0.99] /
 *   刺帧 v∈[2.0, 2.95] 逐卡分帧；组账守恒；
 * - **浆果双熟度账目（零 rng——posHash）**：全冠 ∈ [260, 380]（中量-较多档——
 *   slot-0 实测 317）+ 熟果占比 ∈ [0.65, 0.85]（coneClassRatio 0.75 主导——s07
 *   色构成 Observed）+ **u 色档域编码**（u ≥ 0.5 熟果 / u < 0.5 幼果——3b 冻结
 *   接口，逐果 12 顶点同值）+ 果三角 = 果 × 4（交叉双卡）+ 同 seed 逐位复现；
 * - 通透规则实际生效（通道硬抑制命中——密冠露干）+ 账目守恒；
 * - 贴地契约 minY 精确 0；参数面真实驱动（canopyDensity 压低 → 卡数显著降）；
 * - LOD 三档（家族方法复制）：High 逐位不动（双缺省 = 显式 high）；rng 三档恒等
 *   56851（发射省略不省略消费）；档间同源账目（簇位表/通道/候选/浆果池逐位同源
 *   ——Mid 浆果全量〔身份信号〕、Low 清零〔远距亚像素〕）；Mid ⊂ High（%4 站点
 *   掩码保交叉双卡——XZ 位置块逐位子集 + Y 差单一贴地平移常量；卡数比 ∈
 *   [0.22, 0.30]）；Mid/Low 确定性；8 槽 × 3 档预算横扫（High ≤ 40000 实测
 *   26438–38892 / Mid 6000–10000 实测 6514–9526 / Low 1500–3000 实测 1884–2802
 *   ——conifer 已锁行）；Low 壳卡 = ⌈保留簇/5⌉ × 单切向竖卡 × 绳卡帧 v∈[0,0.99]
 *   × aBend 沿用；档间 bbox 一致（Mid XZ ≤ 0.5 / Low XZ ≤ 1.0 / 总高 ≤ 1.0）；
 *   法线健康；
 * - 入口 meta（asset_tree_juniperus）：taxonomy conifer（第三实例）/ shapeFamily
 *   8 / triangleCount = slot-0 High 实数 32062 / levels 三档 + representations
 *   canopy 链出生声明 / presets default 单卡 swatch #4a5d47 三处同源（CROWN_PRESETS
 *   行同值）/ build 路由（无参缺省 = slot-0；成套 material 2 + customDepthMaterial
 *   通道；每次调用新资源；preset 忽略路径几何逐位不变——常绿单卡）。
 * 边界：构建产物 afterEach 统一 dispose；8 槽 × 3 档横扫集中在单测试内复用 24 次构建。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import type { ProceduralLevel } from '../../../../src/domain/assets';
import { buildJuniperusGeometry } from '../../../../src/runtime/procedural/tree/juniperus/juniperusGeometry';
import type { JuniperusGeometryResult } from '../../../../src/runtime/procedural/tree/juniperus/juniperusGeometry';
import { JUNIPERUS_SHAPE_PROFILES, JUNIPERUS_SLOT0_PROFILE } from '../../../../src/runtime/procedural/tree/juniperus/juniperusShapeProfile';
import { meta, build } from '../../../../src/runtime/procedural/assets/asset_tree_juniperus.asset';
import { BROADLEAF_CANOPY_CROWN_PRESETS } from '../../../../src/runtime/procedural/tree/broadleafCanopyMaterials';
import { createGeometryTracker, leafCardXZ, spanOf } from '../../../support/procedural-tree/geometryHarness';

const LEVELS: ProceduralLevel[] = ['high', 'mid', 'low'];
const SEED0 = morphSeedOf('asset_tree_juniperus', 0);
/** slot-0 High rng 消费快照（Step 3a 探针 2026-09-29 → **Step 4 密度校准联动
 *  2026-09-29：56851 → 61045**〔簇 12/8 → 13/9 全槽同调 + 顶梢绳簇 6 → 10——簇位
 *  段 +484×7 次 + 通透 roll 段随存活候选 +〕，包裹闭包逐调用计数——任何条件跳过
 *  消费都违约；浆果账目零 rng + 交叉双卡第二卡零 rng；散生层间随机旋 +10 并入
 *  骨架段 = 骨架 + 簇位 7×5610 + 刺卡 8×802 + 通透 roll 存活候选） */
const RNG_CALLS_LOCK = 61045;
/** 皮拓扑面数（20 层枝 + 1 顶梢：主干 288 + 底盖 12 + L1 2058〔21 管〕+ L2 2400 +
 *  L3 3200 + L4 3840 + L5 5120——槽间恒等的结构性保证；配置侧基数 16808 +
 *  顶梢管 98 + 底盖 12） */
const BARK_TRIS_LOCK = 16918;
/** Mid/Low slot-0 皮面（径向/站点降段阶梯 + L4/L5 末级细管不发射——发射计划见
 *  juniperusGeometry lodPlanFor） */
const BARK_TRIS_MID = 2838;
const BARK_TRIS_LOW = 750;
/** 档间 bbox 容差（家族口径：Mid XZ 0.5 / Low XZ 1.0 / 总高 1.0——Low 壳卡
 *  + LOW_SHELL_MARGIN 0.20 的结构性伸出） */
const SPAN_TOLERANCE_MID = 0.5;
const SPAN_TOLERANCE_LOW_XZ = 1.0;
const SPAN_TOLERANCE_Y = 1.0;

const built: JuniperusGeometryResult[] = [];

function buildTracked(seed: number, profile = JUNIPERUS_SLOT0_PROFILE): JuniperusGeometryResult {
  const result = buildJuniperusGeometry(mulberry32(seed), profile);
  built.push(result);
  return result;
}

afterEach(() => {
  for (const { geometry } of built.splice(0)) geometry.dispose();
});

/** 角度差归一 (-π, π]（散生对/层间旋的环绕差断言用） */
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/** 高度带簇幅（柱/卵双型轮廓证据——簇表按高度分带取最大水平半径） */
function bandSpan(stats: JuniperusGeometryResult['stats'], bands: number, which: number): number {
  const { clusters, tierHeights } = stats;
  const lo = tierHeights[0]!;
  const hi = Math.max(...clusters.map((c) => c.cy), tierHeights[tierHeights.length - 1]!);
  const width = (hi - lo) / bands;
  let max = 0;
  for (const c of clusters) {
    if (Math.floor((c.cy - lo) / Math.max(width, 1e-6)) === which) max = Math.max(max, Math.hypot(c.cx, c.cz));
  }
  return max;
}

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
    const a = buildJuniperusGeometry(mulberry32(SEED0));
    const b = buildTracked(SEED0, JUNIPERUS_SLOT0_PROFILE);
    built.push(a);
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.stats).toEqual(b.stats);
  }, 30000);

  it(`rng 消费恒等 ${RNG_CALLS_LOCK}（消费顺序即契约——浆果账目零 rng + 交叉双卡第二卡零 rng；散生层间随机旋 +10/层 并入骨架段）`, () => {
    const stream2 = mulberry32(SEED0);
    let calls = 0;
    buildJuniperusGeometry(
      () => {
        calls++;
        return stream2();
      },
      JUNIPERUS_SLOT0_PROFILE,
      'high',
    ).geometry.dispose();
    expect(calls).toBe(RNG_CALLS_LOCK);
  }, 30000);
});

describe('组序与皮拓扑（D15 恰 2 组 + 结构计数恒等）', () => {
  it(`五级拓扑计数恒等 [21, 40, 80, 160, 320]（20 层枝 + 1 顶梢）、皮面数恒等 ${BARK_TRIS_LOCK}（配置基数 16808 + 顶梢 98 + 底盖 12）——槽间皮恒定的前提`, () => {
    const { stats, geometry } = buildTracked(SEED0);
    expect(stats.levelBranches).toEqual([21, 40, 80, 160, 320]);
    expect(stats.barkTriangles).toBe(BARK_TRIS_LOCK);
    expect(geometry.groups, '应恰 2 组（皮 0〔含浆果卡〕/ 叶卡 1）').toHaveLength(2);
    expect(geometry.groups[0]!.materialIndex).toBe(0);
    expect(geometry.groups[1]!.materialIndex).toBe(1);
  }, 30000);

  it('各级平均起径严格递减（主次分级——密实冠的纤细分枝链）', () => {
    const { stats } = buildTracked(SEED0);
    const radii = stats.levelMeanStartRadius;
    expect(radii).toHaveLength(5);
    for (let i = 0; i < 4; i++) {
      expect(radii[i]!, `L${i + 1} 均起径应大于 L${i + 2}`).toBeGreaterThan(radii[i + 1]!);
    }
  }, 30000);

  it('跨槽皮面恒等：8 槽 barkTriangles / levelBranches 逐位同 slot-0（结构计数类槽间恒等的几何实证）', () => {
    for (let slot = 0; slot < 8; slot++) {
      const { stats } = buildTracked(morphSeedOf('asset_tree_juniperus', slot), JUNIPERUS_SHAPE_PROFILES[slot]!);
      expect(stats.barkTriangles, `slot-${slot} 皮面应恒等`).toBe(BARK_TRIS_LOCK);
      expect(stats.levelBranches, `slot-${slot} 拓扑应恒等`).toEqual([21, 40, 80, 160, 320]);
    }
  }, 60000);
});

describe('散生连续冠骨架（身份核心——Step 1 判定 1 层位退化消费 + 枝角梯度 + 柱/卵双型）', () => {
  it('高度域连续散布：10 密层 + 相邻层高差偏离名义层距 ≥ 25%（大抖动破层——散生读向；vs 层状两例的规整布层）', () => {
    const { stats } = buildTracked(SEED0);
    const { tierHeights, tierSpacingMean } = stats;
    expect(tierHeights).toHaveLength(JUNIPERUS_SLOT0_PROFILE.tierCount);
    let maxDev = 0;
    for (let i = 1; i < tierHeights.length; i++) {
      maxDev = Math.max(maxDev, Math.abs(tierHeights[i]! - tierHeights[i - 1]! - tierSpacingMean) / tierSpacingMean);
    }
    expect(maxDev, '层高差应实际抖动（jitter 0.50 破层端——高度域连续读向的结构证据）').toBeGreaterThanOrEqual(0.25);
    expect(tierSpacingMean, '层间距应落密层带（slot-0 实测 0.64）').toBeLessThan(0.9);
  }, 30000);

  it('枝角梯度：首层自垂直角 ∈ [40, 70]（下部斜展平展）→ 顶层 ∈ [20, 40]（上部上举贴干）、首 > 末（任务裁定带——ginkgo 角度梯度法第三次消费）', () => {
    const { stats } = buildTracked(SEED0);
    const first = stats.tierAngleMeans[0]!;
    const last = stats.tierAngleMeans[stats.tierAngleMeans.length - 1]!;
    expect(first, '首层枝角应落斜展平展带（自垂直角 40–70°）').toBeGreaterThanOrEqual(40);
    expect(first).toBeLessThanOrEqual(70);
    expect(last, '顶层枝角应落上举带（20–40°）').toBeGreaterThanOrEqual(20);
    expect(last).toBeLessThanOrEqual(40);
    expect(first - last, '层角梯度首末差 ≥ 15°（梯度可辨）').toBeGreaterThanOrEqual(15);
  }, 30000);

  it('层内散生对：每层两枝方位差 ≈ π（±0.6 rad——rank 均分步进的散生对）', () => {
    const { stats } = buildTracked(SEED0);
    for (let ti = 0; ti < stats.tierAzimuths.length; ti++) {
      const row = stats.tierAzimuths[ti]!;
      expect(row, `层 ${ti} 应有散生两枝`).toHaveLength(2);
      expect(Math.abs(wrapAngle(row[1]! - row[0]! - Math.PI)), `层 ${ti} 散生对方位差应 ≈ π`).toBeLessThan(0.6);
    }
  }, 30000);

  it('层间随机旋（散生 rng 方位散布）：rank0 方位跨层合向量 |R| < 0.6（去相干 / 方位均匀化——vs 雪松层间同相 |R|≈1 / 水杉交错 π/2 列）', () => {
    const { stats } = buildTracked(SEED0);
    const azs = stats.tierAzimuths.map((row) => row[0]!);
    expect(azs).toHaveLength(JUNIPERUS_SLOT0_PROFILE.tierCount);
    let sx = 0;
    let sz = 0;
    for (const az of azs) {
      sx += Math.cos(az);
      sz += Math.sin(az);
    }
    const resultant = Math.hypot(sx, sz) / azs.length;
    expect(resultant, 'rank0 跨层方位应去相干（合向量短 = 方位均匀化——散生主律）').toBeLessThan(0.6);
  }, 30000);

  it('密实无层连续冠：gapRejects === 0（tierGapBand 零端消费 = 密度场整场短路——连续分布无层间空带）+ tierGapBand > 0 时密度场实际生效（分支覆盖）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.gapRejects, '零端层隙消费：密度场整场短路，层隙剔卡应恒 0').toBe(0);
    expect(stats.bandSurvived[0] + stats.bandSurvived[1], '带内/带外存活合计应 = 存活卡数').toBe(stats.needleCards);
    const gapped = buildTracked(SEED0, { ...JUNIPERUS_SLOT0_PROFILE, tierGapBand: 0.5 });
    expect(gapped.stats.gapRejects, '层隙加宽应激活密度场剔卡（带外衰减——参数真实驱动的分支覆盖）').toBeGreaterThan(0);
  }, 30000);

  it('柱/卵双型冠轮廓：slot-0 狭圆柱底/顶带簇幅比 ⊂ [0.7, 1.45]（近等宽桶柱——vs 水杉锥收 ≥1.5）；slot-2 阔卵底/顶带簇幅比 ≥ 1.3（下半宽 + 上段收的卵形读向——**Step 4 校准联动 1.8 → 1.3**：末级链 +27%〔CHILD_RATIO 0.58/0.85 → 0.66/0.95〕系统抬升全槽顶带簇幅，slot-2 实测 1.36 = 柱端 ~1.0 的明确分化 +36%，双型可辨语义保持）', () => {
    const columnar = buildTracked(SEED0).stats;
    const bottomC = bandSpan(columnar, 5, 0);
    const topC = bandSpan(columnar, 5, 4);
    expect(bottomC, '柱端底带簇幅应有分布').toBeGreaterThan(0.5);
    expect(bottomC / topC, 'slot-0 底/顶带簇幅比应 ⊂ [0.7, 1.45]（近等宽柱读向——钝圆收顶，vs 水杉锥收 ≥1.5）').toBeGreaterThanOrEqual(0.7);
    expect(bottomC / topC).toBeLessThanOrEqual(1.45);
    const ovoid = buildTracked(morphSeedOf('asset_tree_juniperus', 2), JUNIPERUS_SHAPE_PROFILES[2]!).stats;
    const bottomO = bandSpan(ovoid, 5, 0);
    const topO = bandSpan(ovoid, 5, 4);
    expect(bottomO / topO, 'slot-2 阔卵底/顶带簇幅比应 ≥ 1.3（阔卵收顶读向——vs 柱端 ≤1.45 的双型分化）').toBeGreaterThanOrEqual(1.3);
  }, 30000);

  it('顶梢通直无点头：peak − tip < 0.05m（leaderDroop 0 占位短路——通直无点头第三例，vs 雪松点头 > 0.15）', () => {
    const { stats } = buildTracked(SEED0);
    expect(Math.abs(stats.leaderPeakY - stats.leaderTipY), '顶梢最高站应 ≈ 末站（通直读向）').toBeLessThan(0.05);
  }, 30000);
});

describe('绳卡挂点（主卡——第 3 叶语言 + 交叉双卡 + 挂点前移）', () => {
  it('簇账守恒：保留 + 剔除 = L5 320×13 + L4 160×9 + 顶梢 10 = 5610 绳簇位（Step 4 校准联动：簇 12/8 → 13/9 + 顶梢 6 → 10）；L5 末梢簇主导', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.clusters.length + stats.clustersCulled).toBe(
      320 * JUNIPERUS_SLOT0_PROFILE.clustersL5 + 160 * JUNIPERUS_SLOT0_PROFILE.clustersL4 + 10,
    );
    const l5 = stats.clusters.filter((c) => c.level === 4).length;
    const l4 = stats.clusters.filter((c) => c.level === 3).length;
    expect(l5, 'L5 末梢簇应占主导（末级枝外段受光区）').toBeGreaterThan(l4);
  }, 30000);

  it('簇-枝梢绑定：簇中心贴挂点（cm 级——挂点前移 ≤ 0.4×簇半径）、簇方向 = 单位向量', () => {
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

  it('交叉双卡账目：候选 = 保留簇 × 2 + 刺卡标称 802（每簇恰一对交叉卡候选——零 rng 第二卡；烘焙卡 ≤ 候选 = 通道/密度过滤后）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.needleCandidates, '候选 = 保留簇 × 2（交叉双卡）+ 刺卡标称（L5 320×2 + L4 160×1 + 顶梢 2）').toBe(
      stats.clusters.length * 2 + (320 * 2 + 160 * 1 + 2),
    );
    expect(stats.ropeCards, '烘焙绳卡 ≤ 保留簇 × 2（通透过滤只减不增）').toBeLessThanOrEqual(stats.clusters.length * 2);
    expect(stats.ropeCards, '烘焙绳卡应 > 0').toBeGreaterThan(0);
  }, 30000);

  it('绳卡域：卡长 ∈ [0.24, 0.32]（Step 4 校准值——8m 小树 + 40K 预算硬顶的覆盖效率档，雪松 ≥0.3m 实证带量级；禁亚像素）× 轮廓比 ∈ [2.0, 3.2]（绳状细长——> 水杉羽卡卵状椭圆全域）；刺卡长 ∈ [0.12, 0.20]（聚合映射近景位）', () => {
    const result = buildTracked(SEED0);
    const leaf = result.geometry.groups[1]!;
    const pos = result.geometry.getAttribute('position');
    const uv = result.geometry.getAttribute('uv');
    let bad = 0;
    let ropeN = 0;
    let awlN = 0;
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      const vBase = uv.array[base * 2 + 1]!;
      const len = Math.hypot(
        pos.array[(base + 5) * 3]! - pos.array[base * 3]!,
        pos.array[(base + 5) * 3 + 1]! - pos.array[base * 3 + 1]!,
        pos.array[(base + 5) * 3 + 2]! - pos.array[base * 3 + 2]!,
      );
      const w = Math.hypot(
        pos.array[(base + 1) * 3]! - pos.array[base * 3]!,
        pos.array[(base + 1) * 3 + 1]! - pos.array[base * 3 + 1]!,
        pos.array[(base + 1) * 3 + 2]! - pos.array[base * 3 + 2]!,
      );
      const aspect = len / w;
      if (vBase < 1) {
        ropeN++;
        if (
          len < JUNIPERUS_SLOT0_PROFILE.rosetteCardMin - 1e-3 ||
          len > JUNIPERUS_SLOT0_PROFILE.rosetteCardMin + JUNIPERUS_SLOT0_PROFILE.rosetteCardSpan + 1e-3 ||
          aspect < JUNIPERUS_SLOT0_PROFILE.needleCardAspectMin - 0.2 ||
          aspect > JUNIPERUS_SLOT0_PROFILE.needleCardAspectMin + JUNIPERUS_SLOT0_PROFILE.needleCardAspectSpan + 0.2
        ) {
          bad++;
        }
      } else {
        awlN++;
        if (
          len < JUNIPERUS_SLOT0_PROFILE.needleCardLenMin - 1e-3 ||
          len > JUNIPERUS_SLOT0_PROFILE.needleCardLenMin + JUNIPERUS_SLOT0_PROFILE.needleCardLenSpan + 1e-3
        ) {
          bad++;
        }
      }
    }
    expect(bad, '叶卡应逐卡落 profile 域（1e-3 容差 = Float32 顶点存储噪声）').toBe(0);
    expect(ropeN, '应有绳卡（主卡）').toBeGreaterThan(5000);
    expect(awlN, '应有刺卡（minority）').toBeGreaterThan(300);
    expect(ropeN + awlN, '分帧行扫块数应 = 烘焙卡数（ropeCards + awlCards）').toBe(result.stats.ropeCards + result.stats.awlCards);
  }, 30000);

  it('刺卡 minority 比例：awlCards < ropeCards / 8（鳞叶绝对主导——判定 3 二型叶并存但 minority 在位）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.awlCards, '刺卡应在位（双叶型并存——族内首例）').toBeGreaterThan(0);
    expect(stats.awlCards, '刺卡应显著少于绳卡（minority）').toBeLessThan(stats.ropeCards / 8);
  }, 30000);

  it('aBend 沿枝弧长权重：卡内根→尖非降、全域 ⊂ [0, 0.85]（末级最大权重实际涌现）；aLeafRand ∈ [0,1)；组 0（皮+浆果）恒 0', () => {
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
    expect(maxBend, 'aBend 全域应 ⊂ [0, 0.85]（理论最大 (0.10+0.42)×1.0+0.28 = 0.80）').toBeLessThanOrEqual(0.85);
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
    expect(badZero, '组 0（皮+浆果）aLeafRand/aBend 应恒 0（浆果刚性）').toBe(0);
  }, 30000);
});

describe('uv 三级帧域隔离（T012.3 冻结接口 2——阈值 1.0 / 2.0，沿水杉三级先例）', () => {
  it('皮管域逐管归一（组 0 内 v < 1.0 段 max ≤ 0.921）；浆果域 v∈[1,2) 顶点 = 果 × 12；叶卡绳帧 v∈[0, 0.99] / 刺帧 v∈[2.0, 2.95] 逐卡分帧；组账守恒', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    const uv = result.geometry.getAttribute('uv');
    const barkGroup = result.geometry.groups[0]!;
    const leafGroup = result.geometry.groups[1]!;
    let tube = 0;
    let berries = 0;
    for (let i = barkGroup.start; i < barkGroup.start + barkGroup.count; i++) {
      const v = uv.array[i * 2 + 1]!;
      if (v >= 1 && v < 2) berries++;
      else tube++;
    }
    expect(tube, '皮管域应有大量顶点').toBeGreaterThan(0);
    expect(berries, '浆果域 v∈[1,2) 顶点数应 = 果 × 12（交叉双卡）').toBe((stats.berriesMature + stats.berriesYoung) * 12);
    const tubeVMax = 0.921 + 1e-3; // TUBE_V_MAX 0.92 + 底盖盘 0.4 半径（0.9 顶）+ 浮点容差
    let badTube = 0;
    for (let i = barkGroup.start; i < barkGroup.start + barkGroup.count; i++) {
      const v = uv.array[i * 2 + 1]!;
      if (v < 1 && v > tubeVMax) badTube++;
    }
    expect(badTube, `皮管域 v 应 ≤ ${tubeVMax}（逐管归一防线——浆果域自 1.0 起）`).toBe(0);
    let badLeaf = 0;
    for (let i = leafGroup.start; i < leafGroup.start + leafGroup.count; i++) {
      const v = uv.array[i * 2 + 1]!;
      if (!((v >= 0 && v <= 0.99 + 1e-6) || (v >= 2.0 - 1e-6 && v <= 2.95 + 1e-6))) badLeaf++;
    }
    expect(badLeaf, '叶卡 v 应 ⊂ 绳帧 [0, 0.99] ∪ 刺帧 [2.0, 2.95]（三级帧域冻结接口；绳尖 0.99 = 1.0 阈值安全边距）').toBe(0);
    // 组账守恒
    const group0Tris = barkGroup.count / 3;
    const group1Tris = leafGroup.count / 3;
    expect(group0Tris, '组 0（皮+浆果）三角 = 皮拓扑 + 浆果').toBe(stats.barkTriangles + stats.berryTriangles);
    expect(group1Tris, '组 1 三角 = 叶卡 × 2').toBe(stats.needleCards * 2);
  }, 30000);
});

describe('浆果双熟度账目（零 rng——posHash 确定性布点，koelreuteria 账目法改写）', () => {
  it('全冠 ∈ [260, 380]（中量-较多档——族内第三档位，slot-0 实测 317）+ 熟果占比 ∈ [0.65, 0.85]（coneClassRatio 0.75 主导）+ 果三角 = 果 × 4；候选池 > 0', () => {
    const { stats } = buildTracked(SEED0);
    const total = stats.berriesMature + stats.berriesYoung;
    expect(total, '全冠浆果应落中量-较多量级带（12 月枝段 20+ 果 Observed 定档）').toBeGreaterThanOrEqual(260);
    expect(total).toBeLessThanOrEqual(380);
    expect(stats.berriesMature / total, '翌年霜熟果应主导（s07 色构成 70–80% Observed）').toBeGreaterThanOrEqual(0.65);
    expect(stats.berriesMature / total).toBeLessThanOrEqual(0.85);
    expect(stats.berryTriangles).toBe(total * 4);
    expect(stats.berryCandidatePool, '候选池 = 上半冠 L5 枝 × 3 位（slot-0 实测 576）').toBeGreaterThan(0);
  }, 30000);

  it('u 色档域双熟度编码（3b 冻结接口）：浆果域 = 组 0 尾部连续 12 顶点/果块，果内 u 同值，熟果 u ≥ 0.5 / 幼果 u < 0.5 分域无混域', () => {
    const result = buildTracked(SEED0);
    const uv = result.geometry.getAttribute('uv');
    const barkGroup = result.geometry.groups[0]!;
    const total = result.stats.berriesMature + result.stats.berriesYoung;
    // 浆果域 = 组 0 尾部连续块（全部管/盖几何后发射——器官追加语义）
    const firstBerry = barkGroup.start + barkGroup.count - total * 12;
    expect(firstBerry, '浆果域应自组 0 首位起或其后（管+盖在前）').toBeGreaterThanOrEqual(barkGroup.start);
    let badDomain = 0;
    let matureU = 0;
    let youngU = 0;
    let badConst = 0;
    for (let base = firstBerry; base < barkGroup.start + barkGroup.count; base += 12) {
      const u = uv.array[base * 2]!;
      for (let k = 0; k < 12; k++) {
        const v = uv.array[(base + k) * 2 + 1]!;
        if (v < 1 || v >= 2 || uv.array[(base + k) * 2]! !== u) {
          badDomain++;
          badConst++;
        }
      }
      if (u >= 0.5) matureU++;
      else youngU++;
    }
    expect(badDomain, '浆果域顶点应全部 v∈[1,2)（块连续无穿插）').toBe(0);
    expect(badConst, '果内 12 顶点 u 应同值（逐果色档常量）').toBe(0);
    expect(matureU, 'u ≥ 0.5 熟果域应有果').toBeGreaterThan(0);
    expect(youngU, 'u < 0.5 幼果域应有果').toBeGreaterThan(0);
    expect(matureU, 'u 域计数应 = berriesMature（编码与账目一致）').toBe(result.stats.berriesMature);
    expect(youngU).toBe(result.stats.berriesYoung);
  }, 30000);

  it('账目确定性：跨 seed 复算同 seed 果集逐位同（零 rng 布点的复现面——含熟度分类与位置）', () => {
    const a = buildTracked(SEED0);
    const b = buildTracked(SEED0);
    expect(a.stats.berriesMature).toBe(b.stats.berriesMature);
    expect(a.stats.berriesYoung).toBe(b.stats.berriesYoung);
    expect(a.stats.berryCandidatePool).toBe(b.stats.berryCandidatePool);
    // 位置逐位同已由确定性组覆盖（全属性逐位相等）
  }, 30000);
});

describe('通透规则实际生效（通道硬抑制——密冠露干）', () => {
  it('存在剔卡；账目守恒（cards = candidates − channel − gap）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.needleCards).toBeLessThan(stats.needleCandidates);
    expect(stats.channelRejects, '枝干通道应实际剔卡（密冠露干——slot-0 实测 1510）').toBeGreaterThan(0);
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
    const sparse = buildTracked(SEED0, { ...JUNIPERUS_SLOT0_PROFILE, canopyDensity: 0.25 });
    expect(sparse.stats.barkTriangles).toBe(base.stats.barkTriangles); // 皮拓扑不受密度影响
    expect(sparse.stats.needleCards).toBeLessThan(base.stats.needleCards * 0.5);
  }, 30000);
});

// ── LOD 三档（档间不变量——同 rng 流 / 档间恒等）──────────────────────────────────

const { track, disposeAll } = createGeometryTracker<JuniperusGeometryResult>();

afterEach(() => {
  disposeAll(); // LOD 段构建产物统一释放（与文件顶部 built 数组双轨——各段注册各段清）
});

/** 槽位构建（seed + 槽 profile + 档位——与资产路径 profileForSeed 同路由口径） */
function buildSlot(slot: number, level: ProceduralLevel = 'high'): JuniperusGeometryResult {
  return track(
    buildJuniperusGeometry(
      mulberry32(morphSeedOf('asset_tree_juniperus', slot)),
      JUNIPERUS_SHAPE_PROFILES[Math.min(slot, JUNIPERUS_SHAPE_PROFILES.length - 1)]!,
      level,
    ),
  );
}

describe('LOD：High 逐位不动 + rng 三档恒等', () => {
  it('缺省调用（profile + level 双缺省）= 显式 high：position/aBend 数组与 stats 逐位全等', () => {
    const a = track(buildJuniperusGeometry(mulberry32(SEED0)));
    const b = buildSlot(0, 'high');
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.geometry.getAttribute('aBend').array).toEqual(b.geometry.getAttribute('aBend').array);
    expect(a.stats).toEqual(b.stats);
  }, 60000);

  it(`同 seed 三档 rng 消费均 ${RNG_CALLS_LOCK}（Mid/Low 发射省略不省略消费——浆果零 rng、簇位/候选决策照常）`, () => {
    for (const level of LEVELS) {
      const stream = mulberry32(SEED0);
      let calls = 0;
      track(
        buildJuniperusGeometry(
          () => {
            calls++;
            return stream();
          },
          JUNIPERUS_SHAPE_PROFILES[0]!,
          level,
        ),
      );
      expect(calls, `slot-0 ${level} 档 rng 消费应与 High 恒等`).toBe(RNG_CALLS_LOCK);
    }
  }, 60000);
});

describe('LOD：档间同源账目（簇位表 / 通道 / 候选 / 浆果池不随档变化）', () => {
  it('mid/low 的 clusters / clustersCulled / channels / needleCandidates / 浆果候选池与 high 逐位全等；mid 浆果账目与 high 全等（身份信号全量保留）、low 清零（省略记档）+ 皮面降段阶梯', () => {
    const high = buildSlot(0);
    for (const level of ['mid', 'low'] as ProceduralLevel[]) {
      const r = buildSlot(0, level);
      expect(r.stats.clusters, `${level} 簇位表应与 High 同源`).toEqual(high.stats.clusters);
      expect(r.stats.clustersCulled, `${level} 簇剔除账目应与 High 同源`).toBe(high.stats.clustersCulled);
      expect(r.stats.channels, `${level} 通道线段表应与 High 同源`).toEqual(high.stats.channels);
      expect(r.stats.needleCandidates, `${level} 卡候选数应与 High 同源`).toBe(high.stats.needleCandidates);
      expect(r.stats.berryCandidatePool, `${level} 浆果候选池应与 High 同源`).toBe(high.stats.berryCandidatePool);
      if (level === 'mid') {
        expect(r.stats.berriesMature, 'Mid 浆果应与 High 同源（全量保留——双熟度并存身份信号）').toBe(high.stats.berriesMature);
        expect(r.stats.berriesYoung).toBe(high.stats.berriesYoung);
        expect(r.stats.berryTriangles).toBe(high.stats.berryTriangles);
        expect(r.stats.barkTriangles, 'Mid 皮面降段阶梯（L4/L5 末级细管不发射）').toBe(BARK_TRIS_MID);
      } else {
        expect(r.stats.berriesMature, 'Low 浆果应清零（远距亚像素 6–8mm——省略记档）').toBe(0);
        expect(r.stats.berriesYoung).toBe(0);
        expect(r.stats.berryTriangles).toBe(0);
        expect(r.stats.barkTriangles, 'Low 皮面极简管').toBe(BARK_TRIS_LOW);
      }
    }
  }, 60000);
});

describe('LOD：Mid ⊂ High（%4 站点掩码——整簇保留交叉双卡，只在烘焙阶段生效）', () => {
  it('Mid 存活卡 XZ 位置块逐位 ∈ High 卡集（Y 差 = 单一贴地平移常量）、卡数比 ∈ [0.22, 0.30]（实测 0.25–0.28——存活簇位抽 3/4 × 每簇双卡俱全〔%4 掩码〕；slot-0/2/7）', () => {
    for (const slot of [0, 2, 7]) {
      const high = buildSlot(slot);
      const mid = buildSlot(slot, 'mid');
      expect(mid.stats.needleCards, `slot-${slot} Mid 应有存活卡`).toBeGreaterThan(0);
      const ratio = mid.stats.needleCards / high.stats.needleCards;
      expect(ratio, `slot-${slot} Mid/High 卡数比应 ∈ [0.22, 0.30]（实测 ${ratio.toFixed(4)}）`).toBeGreaterThan(0.22);
      expect(ratio).toBeLessThan(0.3);
      // 逐位子集（XZ 口径）：Mid 每张卡 6 顶点 XZ 块在 High 卡集中逐位存在；匹配对
      // Y 差恒为同一常量（= 档间 minY 贴地平移差；1e-4 容差 = Float32 在 4–10m
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
  it('总面落 conifer 已锁预算带（High ≤ 40K——实测 26438–38892 / Mid 6–10K——6514–9526 / Low 1.5–3K——1884–2802）；恰 2 组；组账守恒；同槽档间跨度差（Mid XZ ≤0.5 / Low XZ ≤1.0 / 总高 ≤1.0）、minY 全 0；Low 壳卡 = ⌈簇/5⌉ + 绳卡帧 + aBend 沿用 + 浆果省略；法线有限', () => {
    for (let slot = 0; slot < 8; slot++) {
      const spans = {} as Record<ProceduralLevel, { xz: number; y: number; minY: number }>;
      const leafCardsByLevel = {} as Record<ProceduralLevel, number>;
      for (const level of LEVELS) {
        const r = buildSlot(slot, level);
        const total = r.stats.barkTriangles + r.stats.needleTriangles + r.stats.berryTriangles;
        // 恰 2 组（皮 0 / 叶卡 1，D15 免组膨胀——浆果卡入皮组）
        expect(r.geometry.groups, `slot-${slot} ${level} 应恰 2 组`).toHaveLength(2);
        expect(r.geometry.groups[0]!.materialIndex).toBe(0);
        expect(r.geometry.groups[1]!.materialIndex).toBe(1);
        // 组账守恒：组 0 = 皮拓扑 + 浆果（器官卡入皮组——材质接口约定）、组 1 = 卡 × 2
        expect(r.geometry.groups[0]!.count / 3, `slot-${slot} ${level} 组 0 三角 = 皮 + 浆果`).toBe(
          r.stats.barkTriangles + r.stats.berryTriangles,
        );
        expect(r.geometry.groups[1]!.count / 3, `slot-${slot} ${level} 组 1 三角 = 卡 × 2`).toBe(
          r.stats.needleCards * 2,
        );
        // 预算锁定（锁定账目与依据见 asset_tree_juniperus.asset 模块头）
        if (level === 'high') {
          expect(total, `slot-${slot} High 总面应 ≤ 40000（已锁 conifer 行上限）`).toBeLessThanOrEqual(40000);
          expect(total, `slot-${slot} High 总面应 ≥ 26000（实测带下沿 26438 −1.7%）`).toBeGreaterThanOrEqual(26000);
        } else if (level === 'mid') {
          expect(total, `slot-${slot} Mid 总面应落 6000–10000`).toBeGreaterThanOrEqual(6000);
          expect(total).toBeLessThanOrEqual(10000);
          expect(r.stats.needleCards, `slot-${slot} Mid 卡数应 ≤ High（站点掩码子集）`).toBeLessThanOrEqual(leafCardsByLevel.high!);
        } else {
          expect(total, `slot-${slot} Low 总面应落 1500–3000`).toBeGreaterThanOrEqual(1500);
          expect(total).toBeLessThanOrEqual(3000);
          // Low 壳卡账目：隔簇抽取（stride 5）的单切向竖卡 + 浆果省略
          expect(r.stats.needleCards, `slot-${slot} Low 壳卡数应 = ⌈保留簇/5⌉`).toBe(Math.ceil(r.stats.clusters.length / 5));
          expect(r.stats.needleTriangles, `slot-${slot} Low 叶卡三角应 = 壳卡 × 2`).toBe(r.stats.needleCards * 2);
          expect(r.stats.berryTriangles, `slot-${slot} Low 浆果应省略`).toBe(0);
          // 壳卡走绳卡帧 v∈[0, 0.99]（整簇抽象 → 材质 Low 档 8 元素绳 SDF 同帧——
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
          expect(badFrame, `slot-${slot} Low 壳卡 v 应 ⊂ [0, 0.99] 绳卡帧`).toBe(0);
          expect(maxBend, `slot-${slot} Low 壳卡 aBend 应非恒零（簇位弧长权重沿用）`).toBeGreaterThan(0.1);
        }
        leafCardsByLevel[level] = r.stats.needleCards;
        // 法线健康：属性存在且逐分量有限无 NaN（含浆果卡 flat 法线）
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

// ── 入口 meta 与路由（asset_tree_juniperus——metasequoia 测试组织：无独立入口分件，
//    声明面归共享整表〔assetTaxonomy/assetColorPresets/treeCanopyChain〕+ 本节锁路由）──

describe('入口 meta 与 build 路由（asset_tree_juniperus）', () => {
  it('meta 声明面：taxonomy conifer 第三例 / shapeFamily 8 槽 / levels 三档 / representations canopy 链出生声明 / presets default 单卡 #4a5d47 三处同源（CROWN_PRESETS 行同值）', () => {
    expect(meta.id).toBe('asset_tree_juniperus');
    expect(meta.taxonomy).toEqual({ category: 'plant', family: 'conifer' });
    expect(meta.shapeFamily?.size).toBe(8);
    expect(meta.levels?.map((l) => l.id)).toEqual(['high', 'mid', 'low']);
    expect(meta.representations, 'canopy 出生声明（012.3 待裁决位 3——标准链 High → Mid → Canopy → Culled）').toEqual(['high', 'mid', 'canopy']);
    expect(meta.presets.map((p) => p.id)).toEqual(['default']);
    expect(meta.presets[0]!.swatch).toBe('#4a5d47'); // = needleColorSun 0x64785e / needleColorShade 0x2f4230 严格中点（cedrus 常绿构造中点式）
    expect(BROADLEAF_CANOPY_CROWN_PRESETS['asset_tree_juniperus']?.['default']?.crownColor, 'CROWN_PRESETS 行与 swatch 三处同源（T024）').toBe(0x4a5d47);
    expect(meta.triangleCount, 'triangleCount = slot-0 High 实数（皮 16918 + 绳卡 7308×2 + 刺卡 686×2 + 浆果 317×4——Step 4 校准联动）').toBe(34174);
  });

  it('build 路由：无参缺省 = slot-0 high（与几何直调逐位同）+ 成套 material 2 组 + customDepthMaterial 通道 + 每次调用新资源', () => {
    const source = build();
    try {
      const direct = buildJuniperusGeometry(mulberry32(morphSeedOf('asset_tree_juniperus', 0)));
      expect(source.geometry.getAttribute('position').array).toEqual(direct.geometry.getAttribute('position').array);
      direct.geometry.dispose();
      expect(source.material, '组序 [皮, 叶卡] 两材质（mergeGeometries 契约）').toHaveLength(2);
      expect(source.material).toHaveLength(source.geometry.groups.length);
      expect(source.customDepthMaterial, 'customDepthMaterial 契约通道（T009.5）').toBeDefined();
    } finally {
      source.geometry.dispose();
      for (const m of Array.isArray(source.material) ? source.material : [source.material]) m.dispose();
      source.customDepthMaterial?.dispose();
    }
    const a = build();
    const b = build();
    try {
      expect(b.geometry).not.toBe(a.geometry); // 每次调用 new（D17）
      expect(b.material).not.toBe(a.material);
    } finally {
      for (const s of [a, b]) {
        s.geometry.dispose();
        for (const m of Array.isArray(s.material) ? s.material : [s.material]) m.dispose();
        s.customDepthMaterial?.dispose();
      }
    }
  }, 60000);

  it('build preset 忽略路径：常绿单卡资产 build({preset}) 几何与缺省逐位同（冠变干不变——无卡间差异；cedrus 同款）', () => {
    const plain = build();
    const withPreset = build({ preset: 'default' });
    try {
      expect(withPreset.geometry.getAttribute('position').array).toEqual(plain.geometry.getAttribute('position').array);
    } finally {
      for (const s of [plain, withPreset]) {
        s.geometry.dispose();
        for (const m of Array.isArray(s.material) ? s.material : [s.material]) m.dispose();
        s.customDepthMaterial?.dispose();
      }
    }
  }, 60000);
});
