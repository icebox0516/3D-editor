/**
 * tests/runtime/procedural/tree/triadicaStructure.test.ts —— 乌桕枝干结构真实性测试
 * （T011.7，对称悬铃木 platanusStructure / 栾树 koelreuteriaStructure 组织——方法复制，
 * 数值锚为乌桕自己的 2026-09-21 终测（确定性零 rng 果序账目法定稿后的 rng 流）；
 * **菱形中卡互生散布挂点 + 绿闭蒴果序弯垂轴 = 乌桕独有断言组**）。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildTriadicaGeometry 消费扩展 stats，与资产
 * 入口契约（asset_tree_triadica.asset）互补——本文件锁「结构怎么长」，那边锁
 * 「契约怎么传」）：
 * - 确定性：同 rng seed + 同 shapeProfile 两次构建 → 全属性逐位相等、stats 账目全等；
 *   rng 消费恒等 74592（消费顺序即契约——次数变化 = 随机流重排；011.3 ③ 教训：包裹
 *   rng 闭包逐调用计数口径；**果序挂点零 rng**（确定性账目法——无消费口径问题）；
 *   跨槽/跨 seed 随保留簇数浮动 ±0.6%——通透 roll 计数机制，七先例同款记档）；
 * - 组序恰 2（D15 免组膨胀：皮 0 / 叶 1——**果序入皮组**）；皮面数恒等 24178（6 骨架 +
 *   1 领导拓扑）；
 * - 主次分级：五级拓扑计数恒等 [7,21,63,189,378]；各级平均起径严格递减；一级骨架枝
 *   （含领导枝）≥ 2.2× 次级、≥ 12× 末梢——「所有分枝视觉权重接近即不达标」的结构化判据；
 * - **菱形中卡散布挂点（乌桕独有身份，Spec §4/域扩展节 B 单叶互生散生非簇生
 *   Verified [1][3][7]）**：每簇存活叶量 ≤ 8（中卡簇候选上限）且均值 ≥ 预算半（4）；
 *   簇账守恒（簇账 = 总卡数）；卡几何域（宽 0.08–0.14m / 长宽比 0.80–1.20 近等宽落
 *   profile 域——FOC "nearly as long as wide" Verified [4]，菱形本质）；aBend 卡内
 *   根→尖非降 + aLeafRand ∈ [0,1) 且组 0（含果序）恒 0；
 * - **uv 域身份标记双重隔离（冻结接口强制——platanus v∈[2,3] 与皮管弧长域碰撞 66
 *   顶点先例教训 + koelreuteria 三重隔离探针先例）**：隔离带 v∈[2.5,4) 顶点数 = 0；
 *   果域 v≥4 顶点 = 果 × 24；皮组其余顶点 v < 2.5（皮管弧长域实测 max 2.31——
 *   9.5m 级最长枝弧 ×0.5，断言 < 2.5 带边际）；组账守恒（组 0 = 皮拓扑 + 果序、
 *   组 1 = 纯叶卡 × 2）；
 * - **绿闭蒴果序（Spec 判定做——§4 果序姿态与账目 Verified [1][3][5][7] + 终审
 *   ③-5 复核链）**：挂点/果数账目（果/轴 ∈ [2,4]——每轴 2–4 果主代理判定；总量
 *   60–84 悬铃木 84–131 量级下调）；果序三角 = 果 × 8（八面体最小表达，入皮组——
 *   triadicaMaterials 冻结接口：皮组 aLeafRand=0 实心守卫覆盖果影）；**弯垂轴下垂**
 *   ——果序顶点均值 Y 低于叶卡均值 Y（「果期轴弯垂」[7] 果-c「拱弯-下垂果序轴」的
 *   方向性读数）；
 * - 冠内通透（显式规则）：候选 → 存活存在剔卡且通道/空腔/密度场三规则实际命中；
 *   外密内疏——内核保留率显著低于外壳（家族方向沿用——Spec crown_fill_gradient
 *   Unknown）；枝干通道——存活叶卡挂点（根边中点 = 过滤判定口径）距通道线段带内数
 *   为 0；通透不挖空整层——冠顶/冠底 1/3 高度带均有存活叶卡；
 * - 枝梢驱动叶簇（家族方法沿用）：簇-枝梢绑定（簇中心贴挂点 + 簇方向 = 挂点枝切向
 *   单位向量 + L5 末梢挂簇占主导）；簇间间隙（散簇 minSeparation 0.54）；shellBias
 *   平摊（互生散布宽域平摊）；
 * - 贴地契约：minY 精确 0（原点 = 底部中心）；
 * - 树皮起伏确定性（暗灰窄纵裂中-深浮雕——amplitude 0.027 / {3,4,5} / drift 2.8）：
 *   主干环截面起伏存在（极差/环均径带 3.7–5.0% 实测 + 最大极差 ≥ 12mm——中-深端
 *   中裂带读向 FRPS「有纵裂纹」Verified [1]）、沿枝级递减（主干强末梢弱、L2 以下
 *   亚视觉地板圆管——L5 实测极差 0）、wrap 位浮点级无缝；
 * - shapeProfile 参数面真实驱动：canopyDensity 压低 → 叶卡数显著下降。
 * 边界：构建产物 afterEach 统一 dispose。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { buildTriadicaGeometry } from '../../../../src/runtime/procedural/tree/triadica/triadicaGeometry';
import type { TriadicaGeometryResult } from '../../../../src/runtime/procedural/tree/triadica/triadicaGeometry';
import { TRIADICA_SLOT0_PROFILE } from '../../../../src/runtime/procedural/tree/triadica/triadicaShapeProfile';

const SEED0 = morphSeedOf('asset_tree_triadica', 0);
/** slot-0 High rng 消费快照（2026-09-21 终测，包裹闭包逐调用计数——任何条件跳过消费
 *  都违约；果序挂点零 rng（确定性账目法）——消费全在骨架/簇/通透 roll；跨槽/跨 seed
 *  随保留簇数变化 ±0.6%（通透 roll 计数 = 存活候选数——七先例同机制） */
const RNG_CALLS_LOCK = 74592;
/** 皮拓扑面数（6 骨架 + 1 领导：主干 406 + L1 1008 + L2 2352 + L3 3780 + L4 7560 +
 *  L5 9072——槽间恒等的结构性保证） */
const BARK_TRIS_LOCK = 24178;

const built: TriadicaGeometryResult[] = [];

function buildTracked(seed: number, profile = TRIADICA_SLOT0_PROFILE): TriadicaGeometryResult {
  const result = buildTriadicaGeometry(mulberry32(seed), profile);
  built.push(result);
  return result;
}

afterEach(() => {
  for (const { geometry } of built.splice(0)) geometry.dispose();
});

describe('确定性（shapeProfile 路径 + rng 消费恒等）', () => {
  it('同 seed + 同 profile 两次构建：position/normal/aLeafRand/aBend 逐位相等、stats 账目全等', () => {
    const a = buildTracked(SEED0);
    const b = buildTracked(SEED0);
    for (const attr of ['position', 'normal', 'aLeafRand', 'aBend'] as const) {
      expect(a.geometry.getAttribute(attr).array).toEqual(b.geometry.getAttribute(attr).array);
    }
    expect(a.stats).toEqual(b.stats);
  }, 30000);

  it('profile 缺省 = slot-0 标准组合显式传入（锚点回落路径逐位一致）', () => {
    const a = buildTriadicaGeometry(mulberry32(SEED0));
    const b = buildTracked(SEED0, TRIADICA_SLOT0_PROFILE);
    built.push(a);
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.stats).toEqual(b.stats);
  }, 30000);

  it(`rng 消费恒等 ${RNG_CALLS_LOCK}（消费顺序即契约——次数变化 = 随机流重排；果序挂点零 rng）`, () => {
    const stream = mulberry32(SEED0);
    let calls = 0;
    buildTracked(SEED0); // 账目构建（dispose 归 afterEach）
    const stream2 = mulberry32(SEED0);
    buildTriadicaGeometry(
      () => {
        calls++;
        return stream2();
      },
      TRIADICA_SLOT0_PROFILE,
      'high',
    ).geometry.dispose();
    void stream;
    expect(calls).toBe(RNG_CALLS_LOCK);
  }, 30000);
});

describe('组序与皮拓扑（D15 恰 2 组 + 结构计数恒等）', () => {
  it(`五级拓扑计数恒等 [7,21,63,189,378]、皮面数恒等 ${BARK_TRIS_LOCK}（6 骨架 + 1 领导——槽间皮恒定的前提）`, () => {
    const { stats, geometry } = buildTracked(SEED0);
    expect(stats.levelBranches).toEqual([7, 21, 63, 189, 378]);
    expect(stats.barkTriangles).toBe(BARK_TRIS_LOCK);
    expect(geometry.groups, '应恰 2 组（皮 0 / 叶 1——果序入皮组）').toHaveLength(2);
    expect(geometry.groups[0]!.materialIndex).toBe(0);
    expect(geometry.groups[1]!.materialIndex).toBe(1);
  }, 30000);

  it('各级平均起径严格递减；L1 ≥ 2.2×L2 且 L1 ≥ 12×L5（层级对比可感知判据）', () => {
    const { stats } = buildTracked(SEED0);
    const radii = stats.levelMeanStartRadius;
    expect(radii).toHaveLength(5);
    for (let i = 0; i < 4; i++) {
      expect(radii[i]!, `L${i + 1} 均起径应大于 L${i + 2}`).toBeGreaterThan(radii[i + 1]!);
    }
    expect(radii[0]! / radii[1]!).toBeGreaterThanOrEqual(2.2);
    expect(radii[0]! / radii[4]!).toBeGreaterThanOrEqual(12);
  }, 30000);
});

describe('菱形中卡散布挂点（乌桕独有身份——Spec §4 单叶互生散生非簇生 Verified [1][3][7]）', () => {
  it('每簇存活叶量 ≤ 8（中卡簇候选上限）且均值 ≥ 4（预算半）；簇账守恒（簇账 = 总卡数）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.clusterLeafMax, '逐簇存活数应 ≤ 每簇候选 8').toBeLessThanOrEqual(8);
    expect(stats.clusterLeafMean, '逐簇均值应 ≥ 预算半（互生散布存活典型 4–7）').toBeGreaterThanOrEqual(4);
    expect(stats.clusterLeaves.reduce((s, n) => s + n, 0)).toBe(stats.leafCards);
  }, 30000);

  it('卡几何域：宽 ∈ [0.08, 0.14]、长宽比 ∈ [0.80, 1.20]（profile 域——近等宽菱形口径，FOC "nearly as long as wide" Verified [4]）', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    // 组 1 纯叶卡（果序入皮组）——逐 6 顶点直扫（果序块在组 0，无跨步误入）
    const leaf = result.geometry.groups[1]!;
    const pos = result.geometry.getAttribute('position');
    let bad = 0;
    let cards = 0;
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      cards++;
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
        w < TRIADICA_SLOT0_PROFILE.leafWidthMin - 1e-4 ||
        w > TRIADICA_SLOT0_PROFILE.leafWidthMin + TRIADICA_SLOT0_PROFILE.leafWidthSpan + 1e-4 ||
        aspect < TRIADICA_SLOT0_PROFILE.leafAspectMin - 1e-4 ||
        aspect > TRIADICA_SLOT0_PROFILE.leafAspectMin + TRIADICA_SLOT0_PROFILE.leafAspectSpan + 1e-4
      ) {
        bad++;
      }
    }
    expect(cards, '卡扫描数应 = stats.leafCards').toBe(stats.leafCards);
    expect(bad, '卡宽应 ∈ [0.08, 0.14]、长宽比 ∈ [0.80, 1.20]（profile 域——菱形中卡近等宽）').toBe(0);
  }, 30000);

  it('aBend 卡内根→尖非降（叶卡契约）；aLeafRand ∈ [0,1) 且组 0（含果序）恒 0', () => {
    const result = buildTracked(SEED0);
    const bend = result.geometry.getAttribute('aBend');
    const rand = result.geometry.getAttribute('aLeafRand');
    const leaf = result.geometry.groups[1]!;
    let badBend = 0;
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      // 根边（顶点 0,1,3）/ 尖边（2,4,5）——bendRoot 0.12·hw ≤ bendTip 0.52+0.44·hw
      if (bend.array[base]! > bend.array[base + 2]! + 1e-9) badBend++;
    }
    expect(badBend, '卡内 aBend 应根→尖非降').toBe(0);
    const count = result.geometry.getAttribute('position').count;
    let badRand = 0;
    for (let i = 0; i < count; i++) {
      if (rand.array[i]! < 0 || rand.array[i]! >= 1) badRand++;
    }
    expect(badRand, 'aLeafRand 应 ∈ [0,1)').toBe(0);
    // 组 0 = 皮 + 果序：树皮语义位恒 0（果序刚性——冻结接口）
    const bark = result.geometry.groups[0]!;
    let badZero = 0;
    for (let i = bark.start; i < bark.start + bark.count; i++) {
      if (rand.array[i]! !== 0 || bend.array[i]! !== 0) badZero++;
    }
    expect(badZero, '组 0（皮+果序）aLeafRand/aBend 应恒 0').toBe(0);
  }, 30000);
});

describe('uv 域身份标记双重隔离（冻结接口——platanus 66 顶点碰撞先例教训 + koelreuteria 探针先例，断言强制）', () => {
  it('隔离带 v∈[2.5,4) 顶点数 = 0；果域 v≥4 顶点 = 果 × 24；皮组其余顶点 v < 2.5（皮管弧长域不得侵入 [4,5)）', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    const uv = result.geometry.getAttribute('uv');
    const count = result.geometry.getAttribute('position').count;
    let gap = 0;
    let fruitVerts = 0;
    let barkMaxV = 0;
    for (let i = 0; i < count; i++) {
      const v = uv.array[i * 2 + 1]!;
      if (v >= 4) fruitVerts++;
      else if (v >= 2.5) gap++;
      else barkMaxV = Math.max(barkMaxV, v);
    }
    expect(gap, '隔离带 [2.5,4) 应空（果域与皮管弧长域的隔离带）').toBe(0);
    expect(fruitVerts, '果域 v≥4 顶点数应 = 果 × 24（八面体 8 面 × 3 顶点）').toBe(stats.fruitBalls * 24);
    expect(barkMaxV, '皮管弧长域 max v 应 < 2.5（实测 1.87——9.5m 级最长枝弧 ×0.5；8 槽 max 2.31）').toBeLessThan(2.5);
  }, 30000);

  it('组账守恒：组 0 三角 = 皮拓扑 + 果序；组 1 三角 = 叶卡 × 2；果序三角 = 果 × 8（果序入皮组——材质接口约定）', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    const group0Tris = result.geometry.groups[0]!.count / 3;
    const group1Tris = result.geometry.groups[1]!.count / 3;
    expect(stats.fruitTriangles, '八面体最小表达 8 tri/果').toBe(stats.fruitBalls * 8);
    expect(group0Tris, '组 0（皮+果序）三角 = 皮拓扑 + 果序（果序入皮组记档——材质接口约定）').toBe(
      stats.barkTriangles + stats.fruitTriangles,
    );
    expect(group1Tris, '组 1 三角 = 纯叶卡 × 2').toBe(stats.leafCards * 2);
  }, 30000);
});

describe('绿闭蒴果序（Spec 判定做——§4 果序姿态与账目 Verified [1][3][5][7]，生产口径终审 ③-5）', () => {
  /** 全几何按 uv v 域取均值 Y（果 v≥4——入皮组）；叶卡均值取组 1 纯卡 */
  function fruitMeanY(result: TriadicaGeometryResult): { n: number; mean: number } {
    const pos = result.geometry.getAttribute('position');
    const uv = result.geometry.getAttribute('uv');
    const count = pos.count;
    let n = 0;
    let sum = 0;
    for (let i = 0; i < count; i++) {
      if (uv.array[i * 2 + 1]! >= 4) {
        n++;
        sum += pos.array[i * 3 + 1]!;
      }
    }
    return { n, mean: n > 0 ? sum / n : 0 };
  }

  it('每轴 2–4 果（「每轴 2–4 果」主代理判定）；总量显著性低-中（实测 84 果 ∈ 60–84 带——悬铃木 84–131 量级下调）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.fruitSites, '应有果序挂点').toBeGreaterThan(0);
    const perSite = stats.fruitBalls / stats.fruitSites;
    expect(perSite, '果/轴应 ∈ [2,4]（每轴 2–4 果沿轴散布非密串）').toBeGreaterThanOrEqual(2);
    expect(perSite).toBeLessThanOrEqual(4);
    expect(stats.fruitBalls, '总量显著性低-中（实测 84 果，8 槽带 60–84）').toBeGreaterThanOrEqual(50);
    expect(stats.fruitBalls).toBeLessThanOrEqual(90);
  }, 30000);

  it('弯垂轴下垂：果序顶点均值 Y < 叶卡均值 Y（「果期轴弯垂」[7] 果-c 拱弯-下垂果序轴的方向读数）', () => {
    const result = buildTracked(SEED0);
    const fruit = fruitMeanY(result);
    expect(fruit.n, '应有果域顶点').toBeGreaterThan(0);
    const leaf = result.geometry.groups[1]!;
    const pos = result.geometry.getAttribute('position');
    let cN = 0;
    let cSum = 0;
    for (let base = leaf.start; base < leaf.start + leaf.count; base++) {
      cN++;
      cSum += pos.array[base * 3 + 1]!;
    }
    expect(fruit.mean, '果序均值 Y 应低于叶卡均值 Y（弯垂轴沿轴下垂）').toBeLessThan(cSum / cN);
  }, 30000);
});

describe('冠内通透（显式规则：通道 / 内层密度衰减 / 局部空腔）', () => {
  /** 存活叶卡挂点数组（根边中点 = 顶点 0,1 均值 = 通透过滤时的候选中心——与规则判定
   *  口径严格对齐；组 1 纯卡无附加块） */
  function cardRootMidpoints(result: TriadicaGeometryResult): { x: number; y: number; z: number }[] {
    const leaf = result.geometry.groups[1]!;
    const pos = result.geometry.getAttribute('position');
    const roots: { x: number; y: number; z: number }[] = [];
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      roots.push({
        x: (pos.array[base * 3]! + pos.array[(base + 1) * 3]!) / 2,
        y: (pos.array[base * 3 + 1]! + pos.array[(base + 1) * 3 + 1]!) / 2,
        z: (pos.array[base * 3 + 2]! + pos.array[(base + 1) * 3 + 2]!) / 2,
      });
    }
    return roots;
  }

  it('通透规则实际生效：存在剔卡，且通道/空腔/密度场三规则均命中；账目守恒', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.leafCards).toBeLessThan(stats.leafCandidates);
    expect(stats.channelRejects, '枝干通道应实际剔卡（slot-0 实测 89）').toBeGreaterThan(0);
    expect(stats.voidRejects, '局部空腔应实际剔卡（slot-0 实测 26——40–55% 空隙大空腔带）').toBeGreaterThan(0);
    expect(stats.gradientRejects, '内层密度衰减应实际剔卡').toBeGreaterThan(0);
    expect(stats.leafCards).toBe(stats.leafCandidates - stats.channelRejects - stats.voidRejects - stats.gradientRejects);
  }, 30000);

  it('外密内疏：内核（q<0.4）叶卡保留率显著低于外壳（q>0.6），外壳近满（家族方向沿用——crown_fill_gradient Unknown）', () => {
    const { stats } = buildTracked(SEED0);
    const innerCand = stats.qCandidates[0]! + stats.qCandidates[1]!;
    const innerSurv = stats.qSurvived[0]! + stats.qSurvived[1]!;
    const shellCand = stats.qCandidates[3]! + stats.qCandidates[4]!;
    const shellSurv = stats.qSurvived[3]! + stats.qSurvived[4]!;
    expect(innerCand, '内核应有候选卡（slot-0 实测 424——中卡散布内核候选基数中档）').toBeGreaterThan(200);
    const innerRet = innerSurv / innerCand;
    const shellRet = shellSurv / shellCand;
    // 中-疏基调（canopyDensity 0.88）：外壳保留率阈值取 0.85（密度自适应口径——
    // koelreuteriaShapeSlots 同款；实测 0.891）
    expect(shellRet, '外壳保留率应近满（中-疏冠壳——Spec §3 Inferred [7]）').toBeGreaterThanOrEqual(0.85);
    expect(innerRet / shellRet, '内核保留率应显著低于外壳').toBeLessThanOrEqual(0.55);
  }, 30000);

  it('枝干通道：存活叶卡挂点距任一通道线段 < r-0.05 的数量为 0（主干大枝进冠不被封死；判定点 = 根边中点 = 过滤口径）', () => {
    const result = buildTracked(SEED0);
    const roots = cardRootMidpoints(result);
    let invasion = 0;
    for (const c of roots) {
      for (const ch of result.stats.channels) {
        const dx = c.x - ch.ax;
        const dy = c.y - ch.ay;
        const dz = c.z - ch.az;
        const ex = ch.bx - ch.ax;
        const ey = ch.by - ch.ay;
        const ez = ch.bz - ch.az;
        const lenSq = ex * ex + ey * ey + ez * ez;
        const t = Math.max(0, Math.min(1, (dx * ex + dy * ey + dz * ez) / lenSq));
        const dist = Math.hypot(dx - ex * t, dy - ey * t, dz - ez * t);
        if (dist < ch.r - 0.05) invasion++;
      }
    }
    expect(invasion, '通道保护带内不应有存活叶卡').toBe(0);
  }, 30000);

  it('通透不挖空整层：冠顶与冠底 1/3 高度带均有存活叶卡（冠壳轮廓连续）', () => {
    const result = buildTracked(SEED0);
    const leaf = result.geometry.groups[1]!;
    const pos = result.geometry.getAttribute('position');
    const ys: number[] = [];
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      let y = 0;
      for (let k = 0; k < 6; k++) y += pos.array[(base + k) * 3 + 1]!;
      ys.push(y / 6);
    }
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const third = (yMax - yMin) / 3;
    const bottom = ys.filter((y) => y < yMin + third).length;
    const top = ys.filter((y) => y > yMax - third).length;
    expect(bottom, '冠底 1/3 带应有存活卡').toBeGreaterThan(100);
    expect(top, '冠顶 1/3 带应有存活卡').toBeGreaterThan(100);
  }, 30000);
});

describe('枝梢驱动叶簇（家族方法沿用：枝梢 → 簇空间 → 互生螺旋散排）', () => {
  it('簇-枝梢绑定：簇数 > 0、L5 末梢挂簇占主导；簇中心贴挂点（cm 级）；簇方向 = 枝切向单位向量；簇账目守恒', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.clusters.length, '应有保留簇').toBeGreaterThan(0);
    const l5 = stats.clusters.filter((c) => c.level === 4).length;
    const l4 = stats.clusters.filter((c) => c.level === 3).length;
    expect(l5, 'L5 末梢簇应占主导（末级枝外段受光区）').toBeGreaterThan(l4);
    // 簇剔除账目守恒：保留 + 剔除 = 簇位总数（每 L5 枝 clustersL5 簇 + 每 L4 枝 clustersL4 簇）
    expect(stats.clusters.length + stats.clustersCulled).toBe(
      stats.levelBranches[4]! * TRIADICA_SLOT0_PROFILE.clustersL5 + stats.levelBranches[3]! * TRIADICA_SLOT0_PROFILE.clustersL4,
    );
    // 簇中心 = 挂点沿切向前移极近一位（前移 ≤ 0.2×簇半径 ≤ 0.2×0.192（L4 ×1.2 上限）=
    // 0.038m——cm 级）
    let maxBind = 0;
    let maxUnitErr = 0;
    for (const c of stats.clusters) {
      maxBind = Math.max(maxBind, Math.hypot(c.cx - c.attachX, c.cy - c.attachY, c.cz - c.attachZ));
      maxUnitErr = Math.max(maxUnitErr, Math.abs(Math.hypot(c.dirX, c.dirY, c.dirZ) - 1));
    }
    expect(maxBind, '簇中心到挂点距离应 < 0.08m（cm 级——前移 ≤ 0.2×簇半径）').toBeLessThan(0.08);
    expect(maxUnitErr, '簇方向应为单位向量').toBeLessThan(1e-6);
  }, 30000);

  it('簇间间隙：近邻簇中心距 ≥ 0.5×(ri+rj) 的簇占比 ≥ 90%（clusterMinSeparation=0.54 距离抑制保证下界——散簇语义）', () => {
    const { stats } = buildTracked(SEED0);
    const n = stats.clusters.length;
    let pass = 0;
    for (let i = 0; i < n; i++) {
      const a = stats.clusters[i]!;
      let nnRatio = Infinity;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const b = stats.clusters[j]!;
        const d = Math.hypot(a.cx - b.cx, a.cy - b.cy, a.cz - b.cz);
        nnRatio = Math.min(nnRatio, d / (a.radius + b.radius));
      }
      if (nnRatio >= 0.5) pass++;
    }
    expect(pass / n, '近邻簇对应以 0.5×(ri+rj) 间隙的占比').toBeGreaterThanOrEqual(0.9);
  }, 30000);

  it('shellBias 平摊：存活卡簇内归一化半径均值 ≥ 0.7（shellBias=0.42/γ=0.9 互生散布宽域平摊——叶沿簇域分布）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.leafRhat).toHaveLength(stats.leafCards);
    const mean = stats.leafRhat.reduce((s, r) => s + r, 0) / stats.leafRhat.length;
    expect(mean, '存活卡 r̂ 均值应 ≥ 0.7（互生散布平摊——实测 0.80）').toBeGreaterThanOrEqual(0.7);
  }, 30000);
});

describe('树皮起伏确定性（暗灰窄纵裂中-深浮雕——amplitude 0.027 / {3,4,5} / drift 2.8）', () => {
  /** 皮组某管某段 ring A 的顶点索引（a0 = 每四边形首顶点；发射序 = 主干 → 底盖 → L1 → 深度优先首链） */
  function ringRadii(result: TriadicaGeometryResult, base: number, seg: number, radial: number): number[] {
    const pos = result.geometry.getAttribute('position');
    const idx = Array.from({ length: radial }, (_, j) => base + (seg * radial + j) * 6);
    const cx = idx.reduce((s, v) => s + pos.array[v * 3]!, 0) / radial;
    const cy = idx.reduce((s, v) => s + pos.array[v * 3 + 1]!, 0) / radial;
    const cz = idx.reduce((s, v) => s + pos.array[v * 3 + 2]!, 0) / radial;
    return idx.map((v) =>
      Math.hypot(pos.array[v * 3]! - cx, pos.array[v * 3 + 1]! - cy, pos.array[v * 3 + 2]! - cz),
    );
  }

  /** 皮组顶点流发射偏移（slot-0 拓扑：主干 14 段 ×14 管 + 14 三角底盖 → 首骨架枝 L1 →
   *  深度优先首链 L2/L3/L4 → 首 L5 管） */
  const TRUNK_RADIAL = TRIADICA_SLOT0_PROFILE.trunk.radial;
  const TRUNK_SEGS = TRIADICA_SLOT0_PROFILE.trunk.segs;
  const L1_BASE = TRUNK_SEGS * TRUNK_RADIAL * 6 + TRUNK_RADIAL * 3; // 1218
  const L5_BASE =
    L1_BASE +
    9 * 8 * 6 + // L1：9 段 ×8 径向
    8 * 7 * 6 + // L2
    5 * 6 * 6 + // L3
    4 * 5 * 6; // L4 → 首 L5 管（2286）

  it('主干全部环截面极差/环均径 ∈ [2.5%, 6.5%]，最大极差 ≥ 12mm（中-深浮雕中裂带——FRPS「有纵裂纹」Verified [1] + 照片深纵脊沟 [7]；实测带 3.7–5.0% / 17.2mm）', () => {
    const result = buildTracked(SEED0);
    expect(result.stats.barkTriangles, '皮拓扑不受起伏影响（emitTube 只动顶点域）').toBe(BARK_TRIS_LOCK);
    let maxAbs = 0;
    for (let seg = 0; seg < TRUNK_SEGS; seg++) {
      const radii = ringRadii(result, 0, seg, TRUNK_RADIAL);
      const mean = radii.reduce((s, r) => s + r, 0) / radii.length;
      const range = Math.max(...radii) - Math.min(...radii);
      maxAbs = Math.max(maxAbs, range);
      expect(range / mean, `主干环 ${seg} 极差/均径应 ≥ 2.5%（纵裂脊沟可辨）`).toBeGreaterThanOrEqual(0.025);
      expect(range / mean, `主干环 ${seg} 极差/均径应 ≤ 6.5%（中裂带不夸张）`).toBeLessThanOrEqual(0.065);
    }
    expect(maxAbs * 1000, '主干最大极差应 ≥ 12mm（基径 0.26–0.32m × flare × 幅度比 2.7%；实测 17.2mm）').toBeGreaterThanOrEqual(12);
  }, 30000);

  it('起伏幅度沿枝级递减：主干极差 > L1 首环极差 > L5 首环极差；L5 绝对量 < 1mm 级（亚视觉地板 → 圆管）', () => {
    const result = buildTracked(SEED0);
    const trunkMax = Math.max(
      ...Array.from({ length: TRUNK_SEGS }, (_, seg) => {
        const radii = ringRadii(result, 0, seg, TRUNK_RADIAL);
        return Math.max(...radii) - Math.min(...radii);
      }),
    );
    const l1 = ringRadii(result, L1_BASE, 0, TRIADICA_SLOT0_PROFILE.levels[0]!.radial);
    const l1Range = Math.max(...l1) - Math.min(...l1);
    const l5 = ringRadii(result, L5_BASE, 0, TRIADICA_SLOT0_PROFILE.levels[4]!.radial);
    const l5Range = Math.max(...l5) - Math.min(...l5);
    expect(trunkMax, '主干极差应大于 L1').toBeGreaterThan(l1Range);
    expect(l1Range, 'L1 首环极差应 ≥ 1.2mm（粗枝端纵裂浮雕——窄纵裂显于粗干 [1][5]）').toBeGreaterThanOrEqual(0.0012);
    expect(l1Range, 'L1 极差应大于 L5').toBeGreaterThan(l5Range);
    expect(l5Range * 1000, 'L5 极差应 < 1mm（末梢亚毫米层被地板跳过——实测圆管 0）').toBeLessThan(1);
  }, 30000);

  it('环向连续无缝：wrap 顶点对位置差 < 1e-9（环级共享预算——实测恰为 0）', () => {
    const result = buildTracked(SEED0);
    const pos = result.geometry.getAttribute('position');
    let maxDiff = 0;
    // 主干每段 quad radial−1 的 th1 顶点（a0 系 j=radial−1 的第 2 顶点）vs quad 0 的 th0
    // 顶点（j=0 的第 1 顶点）——A 侧同环；B 侧（b1/b0）成对同查
    for (let seg = 0; seg < TRUNK_SEGS; seg++) {
      const qa = (seg * TRUNK_RADIAL + (TRUNK_RADIAL - 1)) * 6; // quad radial−1 起点
      const q0 = (seg * TRUNK_RADIAL + 0) * 6; // quad 0 起点
      const pairs: [number, number][] = [
        [qa + 1, q0 + 0], // A 环 th1（quad radial−1 的 a1）vs th0（quad 0 的 a0）
        [qa + 2, q0 + 5], // B 环 th1（quad radial−1 的 b1）vs th0（quad 0 的 b0）
      ];
      for (const [i, j] of pairs) {
        const d = Math.hypot(
          pos.array[i * 3]! - pos.array[j * 3]!,
          pos.array[i * 3 + 1]! - pos.array[j * 3 + 1]!,
          pos.array[i * 3 + 2]! - pos.array[j * 3 + 2]!,
        );
        maxDiff = Math.max(maxDiff, d);
      }
    }
    expect(maxDiff, 'wrap 位浮点级无缝').toBeLessThan(1e-9);
  }, 30000);
});

describe('贴地契约与参数面驱动', () => {
  it('minY 精确 0（原点 = 底部中心；贴地平移语义）', () => {
    const result = buildTracked(SEED0);
    result.geometry.computeBoundingBox();
    expect(Math.abs(result.geometry.boundingBox!.min.y)).toBeLessThanOrEqual(0.001);
  }, 30000);

  it('canopyDensity 压低 → 叶卡数显著下降（同 seed 同拓扑，密度场真实消费）', () => {
    const base = buildTracked(SEED0);
    const sparse = buildTracked(SEED0, { ...TRIADICA_SLOT0_PROFILE, canopyDensity: 0.25 });
    expect(sparse.stats.barkTriangles).toBe(base.stats.barkTriangles); // 皮拓扑不受密度影响
    expect(sparse.stats.leafCards).toBeLessThan(base.stats.leafCards * 0.5);
  }, 30000);
});
