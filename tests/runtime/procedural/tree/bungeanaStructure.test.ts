/**
 * tests/runtime/procedural/tree/bungeanaStructure.test.ts —— 白皮松几何结构 +
 * 入口 meta 测试（T012.4 Step 3a，组织对称族先例 juniperusGeometry.test /
 * metasequoiaStructure——**LOD 档间不变量拆归 bungeanaLod.test 分件**〔派遣简报
 * 交付件名〕；零 mock——真实几何生成，直调 buildBungeanaGeometry 消费扩展
 * stats。数值锚 = 白皮松自己的 2026-09-30 Step 3a 探针实测〔bungeanaGeometry /
 * asset_tree_bungeana 模块头〕。
 *
 * 覆盖（白皮松新语义断言组——散生退化直承 / 三针束聚合卡 / 开张卵圆→伞形平顶
 * 包络 / 双态果账目 / 多干近似 slot-7 / 解析冠顶适配）：
 * - 确定性：同 rng seed + 同 shapeProfile 两次构建 → 全属性逐位相等、stats 全等；
 *   rng 消费恒等 51863（消费顺序即契约——包裹闭包逐调用计数口径；**果账目零
 *   rng**〔posHash 布点〕+ 交叉双卡第二卡零 rng 派生——消费全在骨架/散生旋/簇/
 *   通透 roll）；
 * - 组序恰 2（D15：皮 0〔干+枝+底盖+果卡〕/ 叶卡 1）；皮拓扑恒等 16996（20 层枝
 *   + 1 顶梢——L1–L5 = [21, 40, 80, 160, 320]；配置侧基数 16884 + 顶梢管 98 +
 *   底盖 14）；主次分级（各级均起径严格递减）；跨槽皮面恒等；
 * - **散生连续冠骨架（判定 1——层位退化消费直承 012.3 路径）**：层间距涌现
 *   0.46m ± 大抖动破层（相邻层高差偏离名义层距 ≥ 25%——高度域连续读向）+
 *   枝角梯度（首层自垂直角 ∈ [50, 80] 斜展近水平 → 顶层 ∈ [22, 48] 上举）+
 *   层内散生对（对方位差 ≈ π ± 0.6）+ **层间随机旋**（rank0 方位跨层合向量
 *   |R| < 0.6——去相干/方位均匀化）+ 无层连续冠（gapRejects === 0——tierGapBand
 *   零端短路；>0 分支实际生效）+ 顶梢通直无点头（peak ≈ tip——leaderDroop 0
 *   占位短路）；
 * - **开张卵圆→伞形平顶冠包络（判定 2——第 4 冠轮廓包络型 + 解析冠顶适配）**：
 *   8 槽树高涌现 ⊂ ±5% profile 锚（解析冠顶适配的结构证据——max(attach(u)+
 *   climb(u)) = 树高解）；冠幅比涌现 ⊂ ±13%（族先例级涌现带）；slot 差异三型
 *   宽塔急收（slot-1 中带/顶带簇幅 ≥ 1.8）/ 开张卵圆中宽（slot-0 中带 > 顶带）/
 *   伞形平顶近等宽外抛（slot-2 顶带 ≥ 0.8×中带）+ slot-7 多干伞状渐宽（顶带
 *   ≥ 1.2×中带）；
 * - 束卡挂点（第 4 叶语言——束生短枝单律）：簇账守恒（保留 + 剔除 = L5 320×12
 *   + L4 160×8 + 顶梢 8 = 5128）+ L5 末梢簇主导 + 簇-枝梢绑定（cm 级）+
 *   **交叉双卡账目**（候选 = 保留簇 × 2——每簇恰一对卡）+ 卡域（束卡长 ∈
 *   [0.26, 0.32] 族终值带直采 × 轮廓比 ∈ [1.6, 2.6] 蓬松放射刷——下限 < 圆柏
 *   绳卡 2.0 的语言区分锁）+ aBend 沿枝弧长域（卡内根→尖非降、全域 ⊂ [0,
 *   0.85]、末级最大涌现）+ aLeafRand ∈ [0,1) + 组 0（含果卡）恒 0；
 * - **束生单律负证据**：候选账 = 保留簇 × 2（零散生单针/刺卡通路——vs 圆柏
 *   +802 刺卡候选的双叶型并存）；
 * - uv 双帧域隔离（冻结接口②——材质判别阈值 1.0）：皮管域逐管归一（组 0 内
 *   v < 1.0 的管段 max ≤ 0.921）；果域 v∈[1,2) 顶点 = 果 × 12；叶卡束帧 v∈
 *   [0, 0.99]（**无刺卡帧**——vs 圆柏三级帧域）；组账守恒；
 * - **双态果账目（零 rng——posHash）**：全冠 ∈ [40, 85]（低量单生点彩档——
 *   slot-0 实测 64）+ **幼果主导**占比 ∈ [0.65, 0.88]（coneClassRatio 0.25 反向
 *   档——vs 圆柏熟果主导 0.75）+ **u 色档域编码**（u ≥ 0.5 近熟 / u < 0.5 幼果
 *   ——3b 冻结编码，逐果 12 顶点同值）+ 果三角 = 果 × 4（交叉双卡）+ 同 seed
 *   逐位复现；
 * - **多干近似 slot-7（判定 1 评估结论——纯连续参数组合）**：L1 均起径 ≥ slot-0
 *   ×1.05（rank 双强 1.40/1.28 起径乘子净效应——挂点径锥度抵消后实测 ×1.08）+ 首层角显著更陡（48° 上举端）+
 *   冠体渐宽（伞状——rank 双强 + 低位分叉读向）；
 * - 通透规则实际生效（通道硬抑制命中——疏散冠露干）+ 账目守恒；贴地契约 minY
 *   精确 0；参数面真实驱动（canopyDensity 压低 → 卡数显著降 / slot-6 疏冠
 *   gapRejects > 0）；
 * - 入口 meta（asset_tree_bungeana）：taxonomy conifer 第四例 / shapeFamily 8 /
 *   triangleCount = slot-0 High 实数 36752 / levels 三档 + representations canopy
 *   链出生声明 / presets default 单卡 swatch = sun/shade 严格中点（常绿构造中点
 *   式——**色值推导断言自 profile**，冻结接口⑤单源 Materials 的测试侧锁）↔
 *   CROWN_PRESETS 行 0x606d47 三处同源 / build 路由（无参缺省 = slot-0；成套
 *   material 2 + customDepthMaterial 通道；每次调用新资源；preset 忽略路径几何
 *   逐位不变——**3b bungeanaMaterials 已并行交付入树，冻结接口对账一致**）。
 * 边界：构建产物 afterEach 统一 dispose；跨槽断言集中复用构建。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { buildBungeanaGeometry } from '../../../../src/runtime/procedural/tree/bungeana/bungeanaGeometry';
import type { BungeanaGeometryResult } from '../../../../src/runtime/procedural/tree/bungeana/bungeanaGeometry';
import {
  BUNGEANA_SHAPE_PROFILES,
  BUNGEANA_SLOT0_PROFILE,
} from '../../../../src/runtime/procedural/tree/bungeana/bungeanaShapeProfile';
import { BROADLEAF_CANOPY_CROWN_PRESETS } from '../../../../src/runtime/procedural/tree/broadleafCanopyMaterials';
import { meta, build } from '../../../../src/runtime/procedural/assets/asset_tree_bungeana.asset';
import { createGeometryTracker } from '../../../support/procedural-tree/geometryHarness';

const ID = 'asset_tree_bungeana';
const SEED0 = morphSeedOf(ID, 0);
/** slot-0 High rng 消费快照（Step 3a 探针 2026-09-30，包裹闭包逐调用计数——任何
 *  条件跳过消费都违约；果账目零 rng + 交叉双卡第二卡零 rng；散生层间随机旋 +10
 *  并入骨架段 = 骨架 + 束簇位 7×5128 + 通透 roll 存活候选段） */
const RNG_CALLS_LOCK = 51863;
/** 皮拓扑面数（20 层枝 + 1 顶梢：主干 364 + 底盖 14 + L1 2058〔21 管〕+ L2 2400
 *  + L3 3200 + L4 3840 + L5 5120——槽间恒等的结构性保证；配置侧基数 16884 +
 *  顶梢管 98 + 底盖 14） */
const BARK_TRIS_LOCK = 16996;
/** 束簇位标称（L5 320×12 + L4 160×8 + 顶梢 8——rng 消费次数恒定的固定计数） */
const CLUSTER_SITES_NOMINAL = 320 * 12 + 160 * 8 + 8;

const { track, disposeAll } = createGeometryTracker<BungeanaGeometryResult>();

function buildTracked(seed: number, profile = BUNGEANA_SLOT0_PROFILE): BungeanaGeometryResult {
  const result = buildBungeanaGeometry(mulberry32(seed), profile);
  track(result);
  return result;
}

afterEach(() => {
  disposeAll();
});

/** 角度差归一 (-π, π]（散生对/层间旋的环绕差断言用） */
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/** 高度带簇幅（冠轮廓证据——簇表按高度分带取最大水平半径） */
function bandSpan(stats: BungeanaGeometryResult['stats'], bands: number, which: number): number {
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
    const a = buildBungeanaGeometry(mulberry32(SEED0));
    const b = buildTracked(SEED0, BUNGEANA_SLOT0_PROFILE);
    track(a);
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.stats).toEqual(b.stats);
  }, 30000);

  it(`rng 消费恒等 ${RNG_CALLS_LOCK}（消费顺序即契约——果账目零 rng + 交叉双卡第二卡零 rng；散生层间随机旋 +10/层 并入骨架段）`, () => {
    const stream2 = mulberry32(SEED0);
    let calls = 0;
    buildBungeanaGeometry(
      () => {
        calls++;
        return stream2();
      },
      BUNGEANA_SLOT0_PROFILE,
      'high',
    ).geometry.dispose();
    expect(calls).toBe(RNG_CALLS_LOCK);
  }, 30000);
});

describe('组序与皮拓扑（D15 恰 2 组 + 结构计数恒等）', () => {
  it(`五级拓扑计数恒等 [21, 40, 80, 160, 320]（20 层枝 + 1 顶梢）、皮面数恒等 ${BARK_TRIS_LOCK}（配置基数 16884 + 顶梢 98 + 底盖 14）——槽间皮恒定的前提`, () => {
    const { stats, geometry } = buildTracked(SEED0);
    expect(stats.levelBranches).toEqual([21, 40, 80, 160, 320]);
    expect(stats.barkTriangles).toBe(BARK_TRIS_LOCK);
    expect(geometry.groups, '应恰 2 组（皮 0〔含果卡〕/ 叶卡 1）').toHaveLength(2);
    expect(geometry.groups[0]!.materialIndex).toBe(0);
    expect(geometry.groups[1]!.materialIndex).toBe(1);
  }, 30000);

  it('各级平均起径严格递减（主次分级——细长斜展枝链）', () => {
    const { stats } = buildTracked(SEED0);
    const radii = stats.levelMeanStartRadius;
    expect(radii).toHaveLength(5);
    for (let i = 0; i < 4; i++) {
      expect(radii[i]!, `L${i + 1} 均起径应大于 L${i + 2}`).toBeGreaterThan(radii[i + 1]!);
    }
  }, 30000);

  it('跨槽皮面恒等：8 槽 barkTriangles / levelBranches 逐位同 slot-0（结构计数类槽间恒等的几何实证）', () => {
    for (let slot = 0; slot < 8; slot++) {
      const { stats } = buildTracked(morphSeedOf(ID, slot), BUNGEANA_SHAPE_PROFILES[slot]!);
      expect(stats.barkTriangles, `slot-${slot} 皮面应恒等`).toBe(BARK_TRIS_LOCK);
      expect(stats.levelBranches, `slot-${slot} 拓扑应恒等`).toEqual([21, 40, 80, 160, 320]);
    }
  }, 60000);
});

describe('散生连续冠骨架（判定 1 层位退化消费直承 + 枝角梯度）', () => {
  it('高度域连续散布：10 密层 + 相邻层高差偏离名义层距 ≥ 25%（大抖动破层——散生读向；vs 层状两例的规整布层）', () => {
    const { stats } = buildTracked(SEED0);
    const { tierHeights, tierSpacingMean } = stats;
    expect(tierHeights).toHaveLength(BUNGEANA_SLOT0_PROFILE.tierCount);
    let maxDev = 0;
    for (let i = 1; i < tierHeights.length; i++) {
      maxDev = Math.max(maxDev, Math.abs(tierHeights[i]! - tierHeights[i - 1]! - tierSpacingMean) / tierSpacingMean);
    }
    expect(maxDev, '层高差应实际抖动（jitter 0.50 破层端——高度域连续读向的结构证据）').toBeGreaterThanOrEqual(0.25);
    expect(tierSpacingMean, '层间距应落密层带（11.5m 级 ≈0.46 实测）').toBeGreaterThan(0.15);
    expect(tierSpacingMean).toBeLessThan(1.1);
  }, 30000);

  it('枝角梯度：首层自垂直角 ∈ [50, 80]（下部斜展近水平）→ 顶层 ∈ [22, 48]（上部上举）、首 > 末（Spec 斜展裁定带）', () => {
    const { stats } = buildTracked(SEED0);
    const first = stats.tierAngleMeans[0]!;
    const last = stats.tierAngleMeans[stats.tierAngleMeans.length - 1]!;
    expect(first, '首层枝角应落斜展带（自垂直角 50–80°）').toBeGreaterThanOrEqual(50);
    expect(first).toBeLessThanOrEqual(80);
    expect(last, '顶层枝角应落上举带（22–48°）').toBeGreaterThanOrEqual(22);
    expect(last).toBeLessThanOrEqual(48);
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

  it('层间随机旋（散生 rng 方位散布）：rank0 方位跨层合向量 |R| < 0.6（去相干 / 方位均匀化）', () => {
    const { stats } = buildTracked(SEED0);
    const azs = stats.tierAzimuths.map((row) => row[0]!);
    expect(azs).toHaveLength(BUNGEANA_SLOT0_PROFILE.tierCount);
    let sx = 0;
    let sz = 0;
    for (const az of azs) {
      sx += Math.cos(az);
      sz += Math.sin(az);
    }
    const resultant = Math.hypot(sx, sz) / azs.length;
    expect(resultant, 'rank0 跨层方位应去相干（合向量短 = 方位均匀化——散生主律）').toBeLessThan(0.6);
  }, 30000);

  it('无层连续冠：gapRejects === 0（tierGapBand 零端消费 = 密度场整场短路——疏散半透光冠的连续分布）+ tierGapBand > 0 时密度场实际生效（分支覆盖）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.gapRejects, '零端层隙消费：密度场整场短路，层隙剔卡应恒 0').toBe(0);
    expect(stats.bandSurvived[0] + stats.bandSurvived[1], '带内/带外存活合计应 = 存活卡数').toBe(stats.needleCards);
    const gapped = buildTracked(SEED0, { ...BUNGEANA_SLOT0_PROFILE, tierGapBand: 0.5 });
    expect(gapped.stats.gapRejects, '层隙加宽应激活密度场剔卡（带外衰减——参数真实驱动的分支覆盖）').toBeGreaterThan(0);
  }, 30000);

  it('顶梢通直无点头：peak − tip < 0.05m（leaderDroop 0 占位短路——无点头第三例，vs 雪松点头 > 0.15）', () => {
    const { stats } = buildTracked(SEED0);
    expect(Math.abs(stats.leaderPeakY - stats.leaderTipY), '顶梢最高站应 ≈ 末站（通直读向）').toBeLessThan(0.05);
  }, 30000);
});

describe('开张卵圆→伞形平顶冠包络（判定 2 第 4 冠轮廓包络型 + 解析冠顶适配）', () => {
  it('8 槽树高涌现 ⊂ ±5% profile 锚（解析冠顶适配：max(attach(u)+climb(u)) = 树高解——vs 单常数预留的跨槽失锁）', () => {
    for (let slot = 0; slot < 8; slot++) {
      const r = buildTracked(morphSeedOf(ID, slot), BUNGEANA_SHAPE_PROFILES[slot]!);
      r.geometry.computeBoundingBox();
      const h = r.geometry.boundingBox!.max.y - r.geometry.boundingBox!.min.y;
      const dev = Math.abs(h / BUNGEANA_SHAPE_PROFILES[slot]!.totalHeight - 1);
      expect(dev, `slot-${slot} 树高涌现应 ⊂ ±5%（实测 ${h.toFixed(2)} vs 锚 ${BUNGEANA_SHAPE_PROFILES[slot]!.totalHeight}）`).toBeLessThanOrEqual(0.05);
    }
  }, 60000);

  it('8 槽冠幅比涌现 ⊂ ±13%（层发射位 K(θ) 包络归一——族先例级涌现带，juniperus +12% 记档同量级）', () => {
    for (let slot = 0; slot < 8; slot++) {
      const r = buildTracked(morphSeedOf(ID, slot), BUNGEANA_SHAPE_PROFILES[slot]!);
      r.geometry.computeBoundingBox();
      const b = r.geometry.boundingBox!;
      const ratio = Math.max(b.max.x - b.min.x, b.max.z - b.min.z) / (b.max.y - b.min.y);
      const dev = Math.abs(ratio / BUNGEANA_SHAPE_PROFILES[slot]!.crownWidthRatio - 1);
      expect(dev, `slot-${slot} 冠幅比涌现应 ⊂ ±13%（实测 ${ratio.toFixed(3)} vs 锚 ${BUNGEANA_SHAPE_PROFILES[slot]!.crownWidthRatio}）`).toBeLessThanOrEqual(0.13);
    }
  }, 60000);

  it('谱系三型分化：宽塔急收（slot-1 中带/顶带 ≥ 1.8）↔ 开张卵圆中宽（slot-0 中带 ≥ 1.02× 顶带且 ⊆ 1.6）↔ 伞形平顶近等宽外抛（slot-2 顶带 ≥ 0.8× 中带——exp<1 新端型首用）', () => {
    const tower = buildTracked(morphSeedOf(ID, 1), BUNGEANA_SHAPE_PROFILES[1]!).stats;
    expect(bandSpan(tower, 5, 1) / bandSpan(tower, 5, 4), 'slot-1 宽塔应急收（中带/顶带簇幅 ≥ 1.8——taper 0.40 塔形）').toBeGreaterThanOrEqual(1.8);
    const ovoid = buildTracked(SEED0).stats;
    expect(bandSpan(ovoid, 5, 2) / bandSpan(ovoid, 5, 4), 'slot-0 开张卵圆中带应宽于顶带（中下部最宽的卵形权重——指数 1.6）').toBeGreaterThanOrEqual(1.02);
    expect(bandSpan(ovoid, 5, 2) / bandSpan(ovoid, 5, 4)).toBeLessThanOrEqual(1.6);
    const umbrella = buildTracked(morphSeedOf(ID, 2), BUNGEANA_SHAPE_PROFILES[2]!).stats;
    expect(bandSpan(umbrella, 5, 4) / bandSpan(umbrella, 5, 2), 'slot-2 伞形平顶应近等宽外抛（顶带 ≥ 0.8× 中带——taper 0.85 + exp 0.90 顶平截）').toBeGreaterThanOrEqual(0.8);
  }, 60000);
});

describe('束卡挂点（第 4 叶语言——束生短枝单律 + 交叉双卡 + 挂点前移）', () => {
  it(`簇账守恒：保留 + 剔除 = ${CLUSTER_SITES_NOMINAL} 束簇位（L5 320×12 + L4 160×8 + 顶梢 8）；L5 末梢簇主导`, () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.clusters.length + stats.clustersCulled).toBe(CLUSTER_SITES_NOMINAL);
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

  it('交叉双卡账目 + 束生单律负证据：候选 = 保留簇 × 2（每簇恰一对交叉卡——零 rng 第二卡；**无散生单针/刺卡候选**——vs 圆柏 +802 双叶型并存）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.needleCandidates, '候选应恰 = 保留簇 × 2（束生单律——零额外叶型候选）').toBe(stats.clusters.length * 2);
    expect(stats.needleCards, '烘焙束卡 ≤ 保留簇 × 2（通透过滤只减不增）').toBeLessThanOrEqual(stats.clusters.length * 2);
    expect(stats.needleCards, '烘焙束卡应 > 0').toBeGreaterThan(0);
  }, 30000);

  it('束卡域：卡长 ∈ [0.26, 0.32]（族终值带直采——012.3 几何轮终值 0.24–0.32 ⊂ 带；禁亚像素）× 轮廓比 ∈ [1.6, 2.6]（蓬松放射刷——下限 < 圆柏绳卡 2.0 的语言区分锁）', () => {
    const result = buildTracked(SEED0);
    const leaf = result.geometry.groups[1]!;
    const pos = result.geometry.getAttribute('position');
    const uv = result.geometry.getAttribute('uv');
    let bad = 0;
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      const vBase = uv.array[base * 2 + 1]!;
      expect(vBase, '束卡帧根边 v 应 = 0（双帧域）').toBeLessThan(1);
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
      if (
        len < BUNGEANA_SLOT0_PROFILE.rosetteCardMin - 1e-3 ||
        len > BUNGEANA_SLOT0_PROFILE.rosetteCardMin + BUNGEANA_SLOT0_PROFILE.rosetteCardSpan + 1e-3 ||
        aspect < BUNGEANA_SLOT0_PROFILE.needleCardAspectMin - 0.2 ||
        aspect > BUNGEANA_SLOT0_PROFILE.needleCardAspectMin + BUNGEANA_SLOT0_PROFILE.needleCardAspectSpan + 0.2
      ) {
        bad++;
      }
    }
    expect(bad, '束卡应逐卡落 profile 域（1e-3 容差 = Float32 顶点存储噪声）').toBe(0);
  }, 30000);

  it('aBend 沿枝弧长权重：卡内根→尖非降、全域 ⊂ [0, 0.85]（末级最大权重实际涌现）；aLeafRand ∈ [0,1)；组 0（皮+果）恒 0', () => {
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
    expect(badZero, '组 0（皮+果）aLeafRand/aBend 应恒 0（果刚性）').toBe(0);
  }, 30000);
});

describe('uv 双帧域隔离（T012.4 冻结接口②——材质判别阈值 1.0；束生单律无刺卡帧）', () => {
  it('皮管域逐管归一（组 0 内 v < 1.0 段 max ≤ 0.921）；果域 v∈[1,2) 顶点 = 果 × 12；叶卡束帧 v∈[0, 0.99]；组账守恒', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    const uv = result.geometry.getAttribute('uv');
    const barkGroup = result.geometry.groups[0]!;
    const leafGroup = result.geometry.groups[1]!;
    let tube = 0;
    let cones = 0;
    for (let i = barkGroup.start; i < barkGroup.start + barkGroup.count; i++) {
      const v = uv.array[i * 2 + 1]!;
      if (v >= 1 && v < 2) cones++;
      else tube++;
    }
    expect(tube, '皮管域应有大量顶点').toBeGreaterThan(0);
    expect(cones, '果域 v∈[1,2) 顶点数应 = 果 × 12（交叉双卡）').toBe((stats.conesMature + stats.conesYoung) * 12);
    const tubeVMax = 0.921 + 1e-3; // TUBE_V_MAX 0.92 + 底盖盘 0.4 半径（0.9 顶）+ 浮点容差
    let badTube = 0;
    for (let i = barkGroup.start; i < barkGroup.start + barkGroup.count; i++) {
      const v = uv.array[i * 2 + 1]!;
      if (v < 1 && v > tubeVMax) badTube++;
    }
    expect(badTube, `皮管域 v 应 ≤ ${tubeVMax}（逐管归一防线——果域自 1.0 起）`).toBe(0);
    let badLeaf = 0;
    for (let i = leafGroup.start; i < leafGroup.start + leafGroup.count; i++) {
      const v = uv.array[i * 2 + 1]!;
      if (!(v >= 0 && v <= 0.99 + 1e-6)) badLeaf++;
    }
    expect(badLeaf, '叶卡 v 应 ⊂ 束帧 [0, 0.99]（双帧域冻结接口②；束尖 0.99 = 1.0 阈值安全边距；无刺卡帧——vs 圆柏三级）').toBe(0);
    // 组账守恒
    const group0Tris = barkGroup.count / 3;
    const group1Tris = leafGroup.count / 3;
    expect(group0Tris, '组 0（皮+果）三角 = 皮拓扑 + 果').toBe(stats.barkTriangles + stats.coneTriangles);
    expect(group1Tris, '组 1 三角 = 叶卡 × 2').toBe(stats.needleCards * 2);
  }, 30000);
});

describe('双态果账目（零 rng——posHash 确定性布点，koelreuteria 账目法）', () => {
  it('全冠 ∈ [40, 85]（低量单生点彩档——族内第四档位，slot-0 实测 64）+ 幼果主导占比 ∈ [0.65, 0.88]（coneClassRatio 0.25 反向档——vs 圆柏熟果主导 0.75）+ 果三角 = 果 × 4；候选池 > 0', () => {
    const { stats } = buildTracked(SEED0);
    const total = stats.conesMature + stats.conesYoung;
    expect(total, '全冠果应落低量单生量级带（Spec §5.3 精确档落空按低量消费——判定 6 点彩级）').toBeGreaterThanOrEqual(40);
    expect(total).toBeLessThanOrEqual(85);
    expect(stats.conesYoung / total, '一年生绿幼果应主导（两年熟 → 生长季主视觉幼果在位——FRPS 机制）').toBeGreaterThanOrEqual(0.65);
    expect(stats.conesYoung / total).toBeLessThanOrEqual(0.88);
    expect(stats.coneTriangles).toBe(total * 4);
    expect(stats.coneCandidatePool, '候选池 = 上半冠 L5 枝 × 1 位（单生）').toBeGreaterThan(0);
  }, 30000);

  it('u 色档域双态编码（3b 冻结编码）：果域 = 组 0 尾部连续 12 顶点/果块，果内 u 同值，近熟 u ≥ 0.5 / 幼果 u < 0.5 分域无混域', () => {
    const result = buildTracked(SEED0);
    const uv = result.geometry.getAttribute('uv');
    const barkGroup = result.geometry.groups[0]!;
    const total = result.stats.conesMature + result.stats.conesYoung;
    // 果域 = 组 0 尾部连续块（全部管/盖几何后发射——器官追加语义）
    const firstCone = barkGroup.start + barkGroup.count - total * 12;
    expect(firstCone, '果域应自组 0 首位起或其后（管+盖在前）').toBeGreaterThanOrEqual(barkGroup.start);
    let badDomain = 0;
    let matureU = 0;
    let youngU = 0;
    let badConst = 0;
    for (let base = firstCone; base < barkGroup.start + barkGroup.count; base += 12) {
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
    expect(badDomain, '果域顶点应全部 v∈[1,2)（块连续无穿插）').toBe(0);
    expect(badConst, '果内 12 顶点 u 应同值（逐果色档常量）').toBe(0);
    expect(matureU, 'u ≥ 0.5 近熟域应有果（少量并存）').toBeGreaterThan(0);
    expect(youngU, 'u < 0.5 幼果域应有果（主导）').toBeGreaterThan(0);
    expect(matureU, 'u 域计数应 = conesMature（编码与账目一致）').toBe(result.stats.conesMature);
    expect(youngU).toBe(result.stats.conesYoung);
  }, 30000);

  it('账目确定性：跨 seed 复算同 seed 果集逐位同（零 rng 布点的复现面——含双态分类与位置）', () => {
    const a = buildTracked(SEED0);
    const b = buildTracked(SEED0);
    expect(a.stats.conesMature).toBe(b.stats.conesMature);
    expect(a.stats.conesYoung).toBe(b.stats.conesYoung);
    expect(a.stats.coneCandidatePool).toBe(b.stats.coneCandidatePool);
    // 位置逐位同已由确定性组覆盖（全属性逐位相等）
  }, 30000);
});

describe('多干近似 slot-7（判定 1 评估结论——连续参数组合零契约修订）', () => {
  it('L1 均起径 ≥ slot-0 ×1.05（rank 双强 1.40/1.28 起径乘子——净效应记档：slot-7 层挂高带压低后落干上段锥度细区，粗壮乘子被挂点径部分抵消，实测 ×1.08）+ 首层角显著更陡（48° 上举端 vs 65°）+ 冠体渐宽（顶带 ≥ 1.2× 中带——低位分叉伞状读向）', () => {
    const s0 = buildTracked(SEED0).stats;
    const s7 = buildTracked(morphSeedOf(ID, 7), BUNGEANA_SHAPE_PROFILES[7]!).stats;
    expect(s7.levelMeanStartRadius[0]!, 'slot-7 L1 均起径应粗于 slot-0（双主枝粗壮——rank 起径乘子的净效应）').toBeGreaterThanOrEqual(s0.levelMeanStartRadius[0]! * 1.05);
    expect(s7.tierAngleMeans[0]!, 'slot-7 首层角应更陡（上举端——分叉外张的低位枝上举）').toBeLessThan(s0.tierAngleMeans[0]! - 10);
    expect(bandSpan(s7, 5, 4) / bandSpan(s7, 5, 1), 'slot-7 冠体应渐宽（伞状——双干上举观感）').toBeGreaterThanOrEqual(1.2);
  }, 30000);
});

describe('通透规则实际生效（通道硬抑制——疏散冠露干）', () => {
  it('存在剔卡；账目守恒（cards = candidates − channel − gap）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.needleCards).toBeLessThan(stats.needleCandidates);
    expect(stats.channelRejects, '枝干通道应实际剔卡（疏散冠露干——slot-0 实测 110）').toBeGreaterThan(0);
    expect(stats.needleCards).toBe(stats.needleCandidates - stats.channelRejects - stats.gapRejects);
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
    const sparse = buildTracked(SEED0, { ...BUNGEANA_SLOT0_PROFILE, canopyDensity: 0.25 });
    expect(sparse.stats.barkTriangles).toBe(base.stats.barkTriangles); // 皮拓扑不受密度影响
    expect(sparse.stats.needleCards).toBeLessThan(base.stats.needleCards * 0.5);
  }, 30000);

  it('slot-6 疏冠 gapRejects > 0（canopyDensity 0.80 疏散下限——判定 4 caveat 参数面落位的几何消费）', () => {
    const { stats } = buildTracked(morphSeedOf(ID, 6), BUNGEANA_SHAPE_PROFILES[6]!);
    expect(stats.gapRejects, '疏冠槽密度 roll 应实际剔卡（0.80 × roll 阈）').toBeGreaterThan(0);
  }, 30000);
});

// ── 入口 meta 与路由（asset_tree_bungeana——juniperusGeometry.test 组织对称：
//    无独立入口分件，声明面归共享整表〔assetTaxonomy/assetColorPresets/
//    treeCanopyChain〕+ 本节锁路由。**3b bungeanaMaterials 已并行交付入树**——
//    冻结接口②③⑥对账一致，入口静态 import 全绿）──

/** 常绿构造中点式 swatch 推导（冻结接口⑤ 测试侧锁——profile sun/shade 严格中点，与 3b 构造色 / CROWN_PRESETS 三处同源） */
function midpointSwatch(a: number, b: number): string {
  const ch = (x: number): number => (x >> 16) & 0xff;
  const cs = (x: number): number => (x >> 8) & 0xff;
  const cb = (x: number): number => x & 0xff;
  const r = Math.round((ch(a) + ch(b)) / 2);
  const g = Math.round((cs(a) + cs(b)) / 2);
  const bl = Math.round((cb(a) + cb(b)) / 2);
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0')}`;
}

describe('入口 meta 与 build 路由（asset_tree_bungeana）', () => {
  it('meta 声明面：taxonomy conifer 第四例 / shapeFamily 8 槽 / levels 三档 / representations canopy 链出生声明 / presets default 单卡 swatch = profile sun/shade 严格中点（冻结接口⑤——色值单源 Materials，测试自 profile 推导锁）↔ CROWN_PRESETS 行 0x606d47 三处同源', () => {
    expect(meta.id).toBe(ID);
    expect(meta.taxonomy).toEqual({ category: 'plant', family: 'conifer' });
    expect(meta.shapeFamily?.size).toBe(8);
    expect(meta.levels?.map((l) => l.id)).toEqual(['high', 'mid', 'low']);
    expect(meta.representations, 'canopy 出生声明（012.4 待裁决位 3——标准链 High → Mid → Canopy → Culled）').toEqual(['high', 'mid', 'canopy']);
    expect(meta.presets.map((p) => p.id)).toEqual(['default']);
    const derived = midpointSwatch(
      BUNGEANA_SLOT0_PROFILE.needleMaterial.needleColorSun,
      BUNGEANA_SLOT0_PROFILE.needleMaterial.needleColorShade,
    );
    expect(meta.presets[0]!.swatch, 'swatch 应 = needleColorSun 0x77864f / needleColorShade 0x49543e 严格中点（cedrus/juniperus 常绿构造中点式第三例——入口引 3b 常量，值由 profile 推导唯一确定）').toBe(derived);
    expect(BROADLEAF_CANOPY_CROWN_PRESETS[ID]?.['default']?.crownColor, 'CROWN_PRESETS 行与 swatch 三处同源（T024；Step 3a 先锁色）').toBe(0x606d47);
    expect(BROADLEAF_CANOPY_CROWN_PRESETS[ID]?.['autumn']).toBeUndefined();
    expect(meta.triangleCount, 'triangleCount = slot-0 High 实数（皮 16996 + 束卡 9750×2 + 果 64×4）').toBe(36752);
  }, 30000);

  it('build 路由：无参缺省 = slot-0 high（与几何直调逐位同）+ 成套 material 2 组 + customDepthMaterial 通道 + 每次调用新资源', () => {
    const source = build();
    try {
      const direct = buildBungeanaGeometry(mulberry32(morphSeedOf(ID, 0)));
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

  it('build preset 忽略路径：常绿单卡资产 build({preset}) 几何与缺省逐位同（冠变干不变——无卡间差异；cedrus/juniperus 同款）', () => {
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
