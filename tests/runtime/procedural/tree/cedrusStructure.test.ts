/**
 * tests/runtime/procedural/tree/cedrusStructure.test.ts —— 雪松枝干结构真实性测试
 * （T012.1 Step 3a，对称 koelreuteriaStructure 组织——方法复制；**层状轮生骨架 =
 * 雪松独有断言组**：层位量化挂点 / 层角梯度 / 层板拱形 / 顶梢点头 / 层隙带 / 球果
 * 直立账目——conifer 首例的结构证据面）。数值锚 = 雪松自己的 2026-09-29 探针终测。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildCedrusGeometry 消费扩展 stats，与资产入口
 * 契约（asset_tree_cedrus.asset）互补——本文件锁「结构怎么长」，那边锁「契约怎么传」）：
 * - 确定性：同 rng seed + 同 shapeProfile 两次构建 → 全属性逐位相等、stats 账目全等；
 *   rng 消费恒等 37764（Step 4 密度校准 2026-09-29 后值；消费顺序即契约——包裹闭包逐
 *   调用计数口径〔011.3 ③ 教训〕；**球果账目零 rng + 莲座第二卡零 rng 派生**——消费
 *   全在骨架/簇/卡/通透 roll；跨槽 35408–38246 ±4%——
 *   通透 roll 计数 = 存活候选数随簇级抑制保留数浮动，13 阔叶先例同机制记档）；
 * - 组序恰 2（D15：皮 0〔干+枝+底盖+球果卡〕/ 针叶卡 1）；皮拓扑恒等 28142（28 层枝 +
 *   1 顶梢——L1–L5 = [29, 56, 112, 224, 448]）；主次分级（各级均起径严格递减、
 *   L1 ≥ 2.2×L2、L1 ≥ 12×L5）；
 * - **层状轮生骨架（身份核心——Step 1 判定 1 机制逐项）**：7 层挂高单调升 + 首层挂高 ≈
 *   trunkHeightRatio × 树高 + **层间距 ∈ [1.5, 2.0]**（Spec 算术推断 1.5–2m Unknown 项
 *   的探针验证——slot-0 实测 1.743）+ 层角梯度（首层自垂直角 ∈ [70, 90] 近水平 → 顶层
 *   ∈ [35, 60] 上举、首 > 末）+ 顶梢下垂点头（peak − tip > 0.15m——实测 0.49）+
 *   **跨槽皮面恒等**（8 槽 barkTriangles / levelBranches 逐位同——结构计数类槽间恒等
 *   的几何实证）；
 * - 长短枝双挂点（ginkgo 机制继承）：簇账守恒（保留 + 剔除 = L5 448×2 + L4 224×1）+
 *   L5 末梢簇主导 + 簇-枝梢绑定（簇心贴挂点 cm 级、簇方向单位向量）+ 卡二型域
 *   （莲座方卡边长 ∈ [0.10, 0.16] / 散生针卡长 ∈ [0.05, 0.09] × 长宽比 ∈ [7, 12]——
 *   细长针形语言 vs 阔叶 <2）；
 * - uv 域身份标记隔离（冻结接口——platanus 66 顶点碰撞教训）：隔离带 v∈[4,5) 顶点数 =
 *   0；将熟 v∈[5,6) / 幼果 v∈[6,7) / 宿存中轴 v∈[7,8) 顶点 = 各类果 × 12；皮管域
 *   v < 3.5（主干逐管归一 3.4——16.5m 级干长侵入球果域的必要防线）；组账守恒；
 *   **针卡双帧 uv 域**（材质侧定义并行契约——合并阶段对齐 2026-09-29）：莲座方卡
 *   v∈[2,3]（中心放射 SDF 帧——卡内帧 (u,v−2)∈[0,1]² 闭区间）/ 散生针卡 v∈[0,1]
 *   （经典帧）/ 双帧隔离带 (1,2) 开区间零顶点；
 * - 球果直立账目（零 rng——posHash 确定性）：全冠总果 ∈ [40, 90]（「中龄树全冠数十枚」
 *   Inferred 的定档带——slot-0 实测 72）+ **两类并存**（将熟 > 0 且幼果 > 0——翌年熟
 *   时窗错位主语境）+ 宿存中轴 > 0 + 果三角 = 果 × 4（交叉双卡）+ 同 seed 逐位复现；
 * - 层隙观感带（vs 阔叶外密内疏的分化证据）：带内保留率 ≥ 0.85 且空带保留率 ≤ 带内 ×
 *   0.3（簇按层聚集 + 层间留空的结构化读数——带内 91.4% / 空带 5.6% 实测）+ 空带有
 *   候选与存活（垂帘端部稀疏穿带，非清零）；
 * - 通透规则实际生效（通道 + 层隙密度场两规则均命中）+ 账目守恒；
 * - aBend 卡内根→尖非降 + aLeafRand ∈ [0,1) + 组 0（含球果）恒 0（冻结契约）；
 * - 贴地契约 minY 精确 0；参数面真实驱动（canopyDensity 压低 / tierGapBand 加宽）。
 * 边界：构建产物 afterEach 统一 dispose。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { buildCedrusGeometry } from '../../../../src/runtime/procedural/tree/cedrus/cedrusGeometry';
import type { CedrusGeometryResult } from '../../../../src/runtime/procedural/tree/cedrus/cedrusGeometry';
import { CEDRUS_SHAPE_PROFILES, CEDRUS_SLOT0_PROFILE } from '../../../../src/runtime/procedural/tree/cedrus/cedrusShapeProfile';

const SEED0 = morphSeedOf('asset_tree_cedrus', 0);
/** slot-0 High rng 消费快照（**Step 4 密度校准后 2026-09-29 终测**，包裹闭包逐调用
 *  计数——任何条件跳过消费都违约；球果账目零 rng——消费全在骨架/簇/卡/通透 roll；
 *  莲座簇第二卡零 rng 派生；跨槽 35408–38246 ±4%（通透 roll 计数 = 存活候选数随簇级
 *  抑制保留数浮动——13 阔叶先例同机制；校准回调前 32507） */
const RNG_CALLS_LOCK = 37764;
/** 皮拓扑面数（28 层枝 + 1 顶梢：主干 462 + 顶梢 128 + L1 3584 + L2 4704 + L3 5376 +
 *  L4 6720 + L5 7168——槽间恒等的结构性保证） */
const BARK_TRIS_LOCK = 28142;

const built: CedrusGeometryResult[] = [];

function buildTracked(seed: number, profile = CEDRUS_SLOT0_PROFILE): CedrusGeometryResult {
  const result = buildCedrusGeometry(mulberry32(seed), profile);
  built.push(result);
  return result;
}

afterEach(() => {
  for (const { geometry } of built.splice(0)) geometry.dispose();
});

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
    const a = buildCedrusGeometry(mulberry32(SEED0));
    const b = buildTracked(SEED0, CEDRUS_SLOT0_PROFILE);
    built.push(a);
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.stats).toEqual(b.stats);
  }, 30000);

  it(`rng 消费恒等 ${RNG_CALLS_LOCK}（消费顺序即契约——球果账目零 rng；次数变化 = 随机流重排）`, () => {
    const stream2 = mulberry32(SEED0);
    let calls = 0;
    buildCedrusGeometry(
      () => {
        calls++;
        return stream2();
      },
      CEDRUS_SLOT0_PROFILE,
      'high',
    ).geometry.dispose();
    expect(calls).toBe(RNG_CALLS_LOCK);
  }, 30000);
});

describe('组序与皮拓扑（D15 恰 2 组 + 结构计数恒等）', () => {
  it(`五级拓扑计数恒等 [29, 56, 112, 224, 448]（28 层枝 + 1 顶梢）、皮面数恒等 ${BARK_TRIS_LOCK}——槽间皮恒定的前提`, () => {
    const { stats, geometry } = buildTracked(SEED0);
    expect(stats.levelBranches).toEqual([29, 56, 112, 224, 448]);
    expect(stats.barkTriangles).toBe(BARK_TRIS_LOCK);
    expect(geometry.groups, '应恰 2 组（皮 0〔含球果卡〕/ 针叶卡 1）').toHaveLength(2);
    expect(geometry.groups[0]!.materialIndex).toBe(0);
    expect(geometry.groups[1]!.materialIndex).toBe(1);
  }, 30000);

  it('各级平均起径严格递减；L1 ≥ 2.2×L2 且 L1 ≥ 12×L5（层级对比可感知判据——massive 层枝 vs 垂帘细枝）', () => {
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
      const { stats } = buildTracked(morphSeedOf('asset_tree_cedrus', slot), CEDRUS_SHAPE_PROFILES[slot]!);
      expect(stats.barkTriangles, `slot-${slot} 皮面应恒等`).toBe(BARK_TRIS_LOCK);
      expect(stats.levelBranches, `slot-${slot} 拓扑应恒等`).toEqual([29, 56, 112, 224, 448]);
    }
  }, 60000);
});

describe('层状轮生骨架（身份核心——Step 1 判定 1 机制逐项）', () => {
  it(`7 层挂高单调升；首层挂高 ≈ trunkHeightRatio × 树高（±15%）；层间距 ∈ [1.5, 2.0]（Spec 算术推断 Unknown 项的探针验证——slot-0 实测 1.743）`, () => {
    const { stats } = buildTracked(SEED0);
    const { tierHeights, tierSpacingMean } = stats;
    expect(tierHeights).toHaveLength(CEDRUS_SLOT0_PROFILE.tierCount);
    for (let i = 1; i < tierHeights.length; i++) {
      expect(tierHeights[i]!, `层 ${i} 挂高应高于层 ${i - 1}`).toBeGreaterThan(tierHeights[i - 1]!);
    }
    const firstExpect = CEDRUS_SLOT0_PROFILE.totalHeight * CEDRUS_SLOT0_PROFILE.trunkHeightRatio;
    expect(Math.abs(tierHeights[0]! - firstExpect) / firstExpect, '首层挂高应 ≈ trunkHeightRatio × 树高').toBeLessThanOrEqual(0.15);
    expect(tierSpacingMean, '层间距应落 Spec 算术推断带 1.5–2m').toBeGreaterThanOrEqual(1.5);
    expect(tierSpacingMean).toBeLessThanOrEqual(2.0);
  }, 30000);

  it('层角梯度：首层自垂直角 ∈ [70, 90]（下部近水平）→ 顶层 ∈ [35, 60]（上部上举）、首 > 末（Spec §4 层角分层变化域）', () => {
    const { stats } = buildTracked(SEED0);
    const first = stats.tierAngleMeans[0]!;
    const last = stats.tierAngleMeans[stats.tierAngleMeans.length - 1]!;
    expect(first, '首层枝角应近水平（自垂直角 60–90° 带内）').toBeGreaterThanOrEqual(70);
    expect(first).toBeLessThanOrEqual(90);
    expect(last, '顶层枝角应上举（30–60° 带内）').toBeGreaterThanOrEqual(35);
    expect(last).toBeLessThanOrEqual(60);
    expect(first - last, '层角梯度首末差 ≥ 25°（梯度可辨）').toBeGreaterThanOrEqual(25);
  }, 30000);

  it('顶梢下垂点头：peak − tip > 0.15m（「顶梢细尖明显下垂点头」TSO Verified——实测 slot-0 0.49m）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.leaderPeakY - stats.leaderTipY, '顶梢最高站应高于末站（点头读向）').toBeGreaterThan(0.15);
  }, 30000);

  it('层板收顶：顶层半径因子显著小于基底层（尖塔剪影——tierRadiusTaper 锥形收顶消费）', () => {
    // 锥形收顶由 tierRadiusTaper/exponent 驱动层枝长——用簇位 XZ 分布复核：上层簇径向
    // 跨度显著小于下层（首层簇最大水平半径 > 顶层簇最大水平半径 × 1.5）
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
    expect(bottom / top, '首层带簇最大半径应 ≥ 顶层带 × 1.5（基部最宽 + 上 1/4 渐尖）').toBeGreaterThanOrEqual(1.5);
  }, 30000);
});

describe('长短枝双挂点（ginkgo 机制继承——短枝莲座簇卡 + 长枝散生针卡）', () => {
  it('簇账守恒：保留 + 剔除 = L5 448×4 + L4 224×3 = 2464 簇位（Step 4 密度校准后计数）；L5 末梢簇主导', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.clusters.length + stats.clustersCulled).toBe(
      448 * CEDRUS_SLOT0_PROFILE.clustersL5 + 224 * CEDRUS_SLOT0_PROFILE.clustersL4,
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

  it('卡二型域：莲座方卡边长 ∈ [0.10, 0.16]、散生针卡长 ∈ [0.05, 0.09] × 长宽比 ∈ [7, 12]（细长针形语言 vs 阔叶 <2）', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    const leaf = result.geometry.groups[1]!;
    const pos = result.geometry.getAttribute('position');
    let squares = 0;
    let needles = 0;
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
      if (aspect > 3) {
        // 散生针卡（aspect 7–12）
        needles++;
        if (
          len < CEDRUS_SLOT0_PROFILE.needleCardLenMin - 1e-3 ||
          len > CEDRUS_SLOT0_PROFILE.needleCardLenMin + CEDRUS_SLOT0_PROFILE.needleCardLenSpan + 1e-3 ||
          aspect < CEDRUS_SLOT0_PROFILE.needleCardAspectMin - 0.2 ||
          aspect > CEDRUS_SLOT0_PROFILE.needleCardAspectMin + CEDRUS_SLOT0_PROFILE.needleCardAspectSpan + 0.2
        ) {
          bad++;
        }
      } else {
        // 莲座方卡（边长 = 卡宽 ≈ 卡长）
        squares++;
        const side = (w + len) / 2;
        if (
          side < CEDRUS_SLOT0_PROFILE.rosetteCardMin - 1e-3 ||
          side > CEDRUS_SLOT0_PROFILE.rosetteCardMin + CEDRUS_SLOT0_PROFILE.rosetteCardSpan + 1e-3
        ) {
          bad++;
        }
      }
    }
    expect(squares + needles, '卡扫描数应 = stats.needleCards').toBe(stats.needleCards);
    expect(squares, '应有莲座方卡').toBe(stats.rosetteCards);
    expect(needles, '应有散生针卡').toBe(stats.longCards);
    expect(bad, '卡域应逐卡落 profile 域（1e-3 容差 = Float32 顶点存储噪声）').toBe(0);
  }, 30000);

  it('aBend 卡内根→尖非降（针卡契约）；aLeafRand ∈ [0,1)；组 0（皮+球果）恒 0', () => {
    const result = buildTracked(SEED0);
    const bend = result.geometry.getAttribute('aBend');
    const rand = result.geometry.getAttribute('aLeafRand');
    const leaf = result.geometry.groups[1]!;
    let badBend = 0;
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      if (bend.array[base]! > bend.array[base + 2]! + 1e-9) badBend++;
    }
    expect(badBend, '卡内 aBend 应根→尖非降').toBe(0);
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
    expect(badZero, '组 0（皮+球果）aLeafRand/aBend 应恒 0').toBe(0);
  }, 30000);
});

describe('uv 域身份标记隔离（冻结接口——platanus 66 顶点碰撞教训，探针断言强制）', () => {
  it('隔离带 v∈[4,5) 顶点数 = 0；三类果域顶点 = 各类果 × 12；皮管域 v < 3.5（主干逐管归一 3.4——16.5m 级干长防线；扫描限组 0——组 1 莲座帧 v∈[2,3) 不入皮管口径）；组账守恒', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    const uv = result.geometry.getAttribute('uv');
    const barkGroup = result.geometry.groups[0]!;
    let gap = 0;
    let mature = 0;
    let young = 0;
    let axis = 0;
    let maxTubeV = 0;
    for (let i = barkGroup.start; i < barkGroup.start + barkGroup.count; i++) {
      const v = uv.array[i * 2 + 1]!;
      if (v >= 7 && v < 8) axis++;
      else if (v >= 6 && v < 7) young++;
      else if (v >= 5 && v < 6) mature++;
      else if (v >= 4) gap++;
      else maxTubeV = Math.max(maxTubeV, v);
    }
    expect(gap, '隔离带 [4,5) 应空（球果域与皮管域的隔离带）').toBe(0);
    expect(mature, '将熟果域 v∈[5,6) 顶点数应 = 果 × 12（交叉双卡）').toBe(stats.conesMature * 12);
    expect(young, '幼果域 v∈[6,7) 顶点数应 = 果 × 12').toBe(stats.conesYoung * 12);
    expect(axis, '宿存中轴域 v∈[7,8) 顶点数应 = 果 × 12').toBe(stats.conesAxis * 12);
    expect(maxTubeV, '皮管弧长域 max v 应 < 3.5（主干逐管归一 3.4 + 枝管 ×0.5 短弧）').toBeLessThan(3.5);
    // 组账守恒
    const group0Tris = result.geometry.groups[0]!.count / 3;
    const group1Tris = result.geometry.groups[1]!.count / 3;
    expect(group0Tris, '组 0（皮+球果）三角 = 皮拓扑 + 球果').toBe(stats.barkTriangles + stats.coneTriangles);
    expect(group1Tris, '组 1 三角 = 针叶卡 × 2').toBe(stats.needleCards * 2);
  }, 30000);

  it('针卡双帧 uv 域（材质侧定义并行契约——合并阶段对齐 2026-09-29）：莲座方卡 v∈[2,3]（卡内帧 (u, v−2)∈[0,1]² 闭区间——中心放射 SDF 帧）、散生针卡 v∈[0,1]（针基→针尖经典帧）、双帧隔离带 (1,2) 开区间零顶点', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    const uv = result.geometry.getAttribute('uv');
    const pos = result.geometry.getAttribute('position');
    const leaf = result.geometry.groups[1]!;
    let rosette = 0;
    let longs = 0;
    let bad = 0;
    let gapBand = 0;
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      // 二型判别 = 卡长宽比（方卡 ≈1 / 细长针卡 7–12——与卡域测试同口径）
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
      const isRosette = len / w <= 3;
      if (isRosette) rosette++;
      else longs++;
      for (let k = 0; k < 6; k++) {
        const v = uv.array[(base + k) * 2 + 1]!;
        // 卡内帧 = 闭区间 [0,1]²：散生针尖端点 v=1.0 / 莲座顶端点 v=3.0 为合法帧值
        // （材质判据阈值 1.5 仍路由正确帧）；隔离带 = 开区间 (1,2) 零产出
        if (v > 1 && v < 2) gapBand++;
        if (isRosette && (v < 2 || v > 3)) bad++;
        if (!isRosette && (v < 0 || v > 1)) bad++;
      }
    }
    expect(rosette, '莲座卡扫描数应 = stats.rosetteCards').toBe(stats.rosetteCards);
    expect(longs, '散生卡扫描数应 = stats.longCards').toBe(stats.longCards);
    expect(gapBand, '双帧隔离带 (1,2) 应零顶点（材质判据阈值 1.5 的路由前提）').toBe(0);
    expect(bad, '莲座卡 v 应 ⊂ [2,3]、散生卡 v 应 ⊂ [0,1]（闭区间卡内帧）').toBe(0);
  }, 30000);
});

describe('球果直立账目（零 rng——posHash 确定性布点，koelreuteria 账目法改写）', () => {
  it('全冠总果 ∈ [40, 90]（「中龄树全冠数十枚」Inferred 定档带——slot-0 实测 72）；两类并存（将熟 > 0 且幼果 > 0——翌年熟时窗错位）+ 宿存中轴 > 0；果三角 = 果 × 4', () => {
    const { stats } = buildTracked(SEED0);
    const total = stats.conesMature + stats.conesYoung + stats.conesAxis;
    expect(total, '全冠总果应落数十量级带').toBeGreaterThanOrEqual(40);
    expect(total).toBeLessThanOrEqual(90);
    expect(stats.conesMature, '将熟果应 > 0（上年授粉将熟——主语境 9–10 月）').toBeGreaterThan(0);
    expect(stats.conesYoung, '当年幼果应 > 0（两类并存——翌年熟时窗错位 Verified）').toBeGreaterThan(0);
    expect(stats.conesAxis, '宿存中轴应 > 0（果熟种鳞散落留枝——稀疏位）').toBeGreaterThan(0);
    expect(stats.coneTriangles).toBe(total * 4);
    expect(stats.coneCandidatePool, '候选池 = 上半冠 L2 层板枝 × 3 候选位（slot-0 实测 168）').toBeGreaterThan(100);
  }, 30000);

  it('账目确定性：跨 seed 复算同 seed 果集逐位同（含位置——零 rng 布点的复现面）', () => {
    const a = buildTracked(SEED0);
    const b = buildTracked(SEED0);
    expect(a.stats.conesMature).toBe(b.stats.conesMature);
    expect(a.stats.conesYoung).toBe(b.stats.conesYoung);
    expect(a.stats.conesAxis).toBe(b.stats.conesAxis);
    // 位置逐位同已由确定性组覆盖（全属性逐位相等）；此处锁账目面的语义独立性
  }, 30000);
});

describe('层隙观感带（vs 阔叶外密内疏的分化证据——簇按层聚集 + 层间留空）', () => {
  it('带内保留率 ≥ 0.85 且空带保留率 ≤ 带内 × 0.3（slot-0 实测 91.4% / 5.6%）；空带有候选与存活（垂帘端部稀疏穿带，非清零）', () => {
    const { stats } = buildTracked(SEED0);
    const [bandCand, gapCand] = stats.bandCandidates;
    const [bandSurv, gapSurv] = stats.bandSurvived;
    expect(bandCand, '带内应有候选（簇按层聚集）').toBeGreaterThan(1000);
    expect(gapCand, '空带应有候选（droop 垂帘链下垂入带）').toBeGreaterThan(50);
    const bandRet = bandSurv / bandCand;
    const gapRet = gapSurv / Math.max(1, gapCand);
    expect(bandRet, '带内保留率应近满（层板内部密实）').toBeGreaterThanOrEqual(0.85);
    expect(gapRet / bandRet, '空带保留率应显著低于带内（层间天光缝隙）').toBeLessThanOrEqual(0.3);
    expect(gapSurv, '空带应有存活卡（垂帘穿带——非清零硬切）').toBeGreaterThan(0);
  }, 30000);
});

describe('通透规则实际生效（通道硬抑制 + 层隙密度场 roll）', () => {
  it('存在剔卡，两规则均命中；账目守恒（cards = candidates − channel − gap）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.needleCards).toBeLessThan(stats.needleCandidates);
    expect(stats.channelRejects, '枝干通道应实际剔卡（层隙露干——slot-0 实测 36）').toBeGreaterThan(0);
    expect(stats.gapRejects, '层隙密度场应实际剔卡（slot-0 实测 383）').toBeGreaterThan(0);
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
    const sparse = buildTracked(SEED0, { ...CEDRUS_SLOT0_PROFILE, canopyDensity: 0.25 });
    expect(sparse.stats.barkTriangles).toBe(base.stats.barkTriangles); // 皮拓扑不受密度影响
    expect(sparse.stats.needleCards).toBeLessThan(base.stats.needleCards * 0.5);
  }, 30000);

  it('tierGapBand 加宽 → 空带剔卡显著上升（层隙带参数真实驱动）', () => {
    const base = buildTracked(SEED0);
    const wide = buildTracked(SEED0, { ...CEDRUS_SLOT0_PROFILE, tierGapBand: 0.5 });
    expect(wide.stats.gapRejects, '层隙加宽应显著增加密度场剔卡').toBeGreaterThan(base.stats.gapRejects * 1.5);
  }, 30000);
});
