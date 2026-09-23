/**
 * tests/runtime/procedural/tree/platanusStructure.test.ts —— 悬铃木枝干结构真实性测试
 * （T011.5，对称银杏 ginkgoStructure 组织——方法复制，数值锚为悬铃木自己的实测；
 * 大叶疏簇挂点 + 宿存球状果序 = 悬铃木独有断言组）。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildPlatanusGeometry 消费扩展 stats，与资产
 * 入口契约（asset_tree_platanus.asset）互补——本文件锁「结构怎么长」，那边锁
 * 「契约怎么传」）：
 * - 确定性：同 rng seed + 同 shapeProfile 两次构建 → 全属性逐位相等、stats 账目全等；
 *   rng 消费恒等 51453（消费顺序即契约——次数变化 = 随机流重排；011.3 ③ 教训：包裹
 *   rng 闭包逐调用计数口径；跨槽/跨 seed 随保留簇数浮动 ±0.4%——通透 roll 计数机制，
 *   五先例同款记档）；
 * - 组序恰 2（D15 免组膨胀：皮 0 / 叶 1——果序入叶组）；皮面数恒等 24178（6 骨架 +
 *   1 领导拓扑）；
 * - 主次分级：五级拓扑计数恒等 [7,21,63,189,378]；各级平均起径严格递减；一级骨架枝
 *   （含领导枝）≥ 2.2× 次级、≥ 12× 末梢——「所有分枝视觉权重接近即不达标」的结构化判据；
 * - **大叶疏簇挂点（悬铃木独有身份，Spec §4/域扩展节 B 互生一节一叶 Verified/
 *   Inferred [3][4][9]）**：每簇存活叶量 ≤ 5（卡尺度合并抽象候选上限）且均值 ≥ 预算
 *   半（2.5）；簇账守恒（簇账 = 总卡数）；卡几何域（宽 0.30–0.44m / 长宽比 0.70–0.90
 *   落 profile 域——阔卵宽>长口径 Spec [1][3][9]——六资产最大叶）；
 * - **宿存球状果序（Spec 判定做 Verified [1][3][7][8][9]）**：挂点/球数账目（球/点
 *   ∈ [1,2] 且成对主导 ≥1.5×——「二球」名源）；果序三角 = 球 × 26（二十面体球 20 +
 *   细梗 6——每球恰一梗，**入皮组**——platanusMaterials 冻结接口：皮组 aLeafRand=0
 *   实心守卫覆盖果影）；
 *   组 0 三角 = 皮拓扑 + 果序、组 1 三角 = 纯叶卡（组账守恒）；果序顶点数 = 球 × 78；
 *   长梗下垂——果序顶点均值 Y 低于叶卡均值 Y（「pendulous at least in fruit」FOC [4]
 *   的方向性读数）；
 * - 冠内通透（显式规则）：候选 → 存活存在剔卡且密度场/空腔两规则实际命中（通道为
 *   拓扑保险）；外密内疏——内核保留率显著低于外壳（crown_fill_gradient Inferred [9]）；
 *   枝干通道——存活叶卡挂点（根边中点 = 过滤判定口径）距通道线段带内数为 0；通透不
 *   挖空整层——冠顶/冠底 1/3 高度带均有存活叶卡；
 * - 枝梢驱动叶簇（家族方法沿用）：簇-枝梢绑定（簇中心贴挂点 + 簇方向 = 挂点枝切向
 *   单位向量 + L5 末梢挂簇占主导）；簇间大间隙（疏簇 minSeparation 0.55）；shellBias
 *   平摊；
 * - 贴地契约：minY 精确 0（原点 = 底部中心）；
 * - 树皮起伏确定性（光滑斑块剥落浅浮雕——amplitude 0.014 / {3,5,6} / drift 11）：主干
 *   环截面起伏存在（极差/环均径带 + 毫米级量级——bark_relief 浅端 Inferred [1][9]；
 *   vs 银杏厘米级 [2%,8%] 带收窄——光滑剥落族量级贴榉树）、沿枝级递减（主干强末梢弱、
 *   L2 以下亚视觉地板圆管）、wrap 位浮点级无缝；
 * - shapeProfile 参数面真实驱动：canopyDensity 压低 → 叶卡数显著下降。
 * 边界：构建产物 afterEach 统一 dispose。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { buildPlatanusGeometry } from '../../../../src/runtime/procedural/tree/platanus/platanusGeometry';
import type { PlatanusGeometryResult } from '../../../../src/runtime/procedural/tree/platanus/platanusGeometry';
import { PLATANUS_SLOT0_PROFILE } from '../../../../src/runtime/procedural/tree/platanus/platanusShapeProfile';

const SEED0 = morphSeedOf('asset_tree_platanus', 0);
/** slot-0 High rng 消费快照（2026-09-20 探针实测，包裹闭包逐调用计数——任何条件
 *  跳过消费都违约；profile 校准定稿后定值；跨槽/跨 seed 随保留簇数变化 ±0.4%（通透
 *  roll 计数 = 存活候选数——五先例同机制） */
const RNG_CALLS_LOCK = 51453;

const built: PlatanusGeometryResult[] = [];

function buildTracked(seed: number, profile = PLATANUS_SLOT0_PROFILE): PlatanusGeometryResult {
  const result = buildPlatanusGeometry(mulberry32(seed), profile);
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
    const a = buildPlatanusGeometry(mulberry32(SEED0));
    const b = buildTracked(SEED0, PLATANUS_SLOT0_PROFILE);
    built.push(a);
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.stats).toEqual(b.stats);
  }, 30000);

  it(`rng 消费恒等 ${RNG_CALLS_LOCK}（消费顺序即契约——次数变化 = 随机流重排）`, () => {
    const stream = mulberry32(SEED0);
    let calls = 0;
    buildTracked(SEED0); // 账目构建（dispose 归 afterEach）
    const stream2 = mulberry32(SEED0);
    buildPlatanusGeometry(
      () => {
        calls++;
        return stream2();
      },
      PLATANUS_SLOT0_PROFILE,
      'high',
    ).geometry.dispose();
    void stream;
    expect(calls).toBe(RNG_CALLS_LOCK);
  }, 30000);
});

describe('组序与皮拓扑（D15 恰 2 组 + 结构计数恒等）', () => {
  it(`五级拓扑计数恒等 [7,21,63,189,378]、皮面数恒等 24178（6 骨架 + 1 领导——槽间皮恒定的前提）`, () => {
    const { stats, geometry } = buildTracked(SEED0);
    expect(stats.levelBranches).toEqual([7, 21, 63, 189, 378]);
    expect(stats.barkTriangles).toBe(24178);
    expect(geometry.groups, '应恰 2 组（皮 0 / 叶 1——果序入叶组）').toHaveLength(2);
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

describe('大叶疏簇挂点（悬铃木独有身份——Spec §4 互生一节一叶 Verified/Inferred [3][4][9]）', () => {
  it('每簇存活叶量 ≤ 5（合并抽象候选上限）且均值 ≥ 2.5（预算半）；簇账守恒（簇账 = 总卡数）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.clusterLeafMax, '逐簇存活数应 ≤ 每簇候选 5').toBeLessThanOrEqual(5);
    expect(stats.clusterLeafMean, '逐簇均值应 ≥ 预算半（互生疏排存活典型 3–5）').toBeGreaterThanOrEqual(2.5);
    expect(stats.clusterLeaves.reduce((s, n) => s + n, 0)).toBe(stats.leafCards);
  }, 30000);

  it('卡几何域：宽 ∈ [0.30, 0.44]、长宽比 ∈ [0.70, 0.90]（profile 域——阔卵宽>长，六资产最大叶 Spec [1][3][9]）', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    // 卡几何域：从叶组卡顶点提取（宽 = 根边长，长 = 根→尖；聚合扫描一次断言）。
    // 组 1 纯叶卡（果序入皮组）——守卫跳过（防御性，当前组 1 无果序块）
    const leaf = result.geometry.groups[1]!;
    const pos = result.geometry.getAttribute('position');
    const uv = result.geometry.getAttribute('uv');
    let bad = 0;
    let cards = 0;
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      if (uv.array[base * 2 + 1]! >= 2) continue; // 果序顶点块跳过（非 6 顶点卡）
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
        w < PLATANUS_SLOT0_PROFILE.leafWidthMin - 1e-6 ||
        w > PLATANUS_SLOT0_PROFILE.leafWidthMin + PLATANUS_SLOT0_PROFILE.leafWidthSpan + 1e-6 ||
        aspect < PLATANUS_SLOT0_PROFILE.leafAspectMin - 1e-6 ||
        aspect > PLATANUS_SLOT0_PROFILE.leafAspectMin + PLATANUS_SLOT0_PROFILE.leafAspectSpan + 1e-6
      ) {
        bad++;
      }
    }
    expect(cards, '卡扫描数应 = stats.leafCards').toBe(stats.leafCards);
    expect(bad, '卡宽应 ∈ [0.30, 0.44]、长宽比 ∈ [0.70, 0.90]（profile 域——宽>长大卡）').toBe(0);
  }, 30000);
});

describe('宿存球状果序（Spec 判定做——§2/域扩展节 B Verified [1][3][7][8][9]）', () => {
  it('账目守恒：组 0 三角 = 皮拓扑 + 果序三角；组 1 三角 = 卡 × 2（纯叶卡）；果序三角 = 球 × 26；果序顶点 = 球 × 78（二十面体球 + 细梗，入皮组）', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    const group0Tris = result.geometry.groups[0]!.count / 3;
    const group1Tris = result.geometry.groups[1]!.count / 3;
    expect(stats.fruitTriangles).toBe(stats.fruitBalls * 26);
    expect(group0Tris, '组 0（皮+果序）三角 = 皮拓扑 + 果序 × 26（果序入皮组记档——材质接口约定）').toBe(
      stats.barkTriangles + stats.fruitTriangles,
    );
    expect(group1Tris, '组 1 三角 = 纯叶卡 × 2').toBe(stats.leafCards * 2);
    // uv v≥4 果序域顶点数 = 球 × 78（几何身份标记的全几何扫描——v≥4 与皮管弧长域隔离）
    const uv = result.geometry.getAttribute('uv');
    const count = result.geometry.getAttribute('position').count;
    let fruitVerts = 0;
    for (let i = 0; i < count; i++) {
      if (uv.array[i * 2 + 1]! >= 4) fruitVerts++;
    }
    expect(fruitVerts, '果序域（uv v≥4）顶点数应 = 球 × 78').toBe(stats.fruitBalls * 78);
  }, 30000);

  it('每果枝典型 2 球（「二球」名源 [1][3][5]）：球/挂点 ∈ [1, 2] 且成对主导（≥ 1.5×）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.fruitSites, '应有果序挂点').toBeGreaterThan(0);
    const perSite = stats.fruitBalls / stats.fruitSites;
    expect(perSite, '球/挂点应 ∈ [1,2]（FRPS 1–2 稀 3 取典型带）').toBeGreaterThanOrEqual(1);
    expect(perSite).toBeLessThanOrEqual(2);
    expect(perSite, '成对应主导（85% 成对率）').toBeGreaterThanOrEqual(1.5);
  }, 30000);

  it('长梗下垂叶幕下：果序顶点均值 Y < 叶卡均值 Y（FOC "pendulous at least in fruit" [4] 方向读数）', () => {
    const result = buildTracked(SEED0);
    const pos = result.geometry.getAttribute('position');
    const uv = result.geometry.getAttribute('uv');
    const count = pos.count;
    let fN = 0, fSum = 0;
    for (let i = 0; i < count; i++) {
      if (uv.array[i * 2 + 1]! >= 4) { fN++; fSum += pos.array[i * 3 + 1]!; }
    }
    // 叶卡均值取组 1 纯卡（组 0 含皮管——低值管段会拉低对照侧）
    const leaf = result.geometry.groups[1]!;
    let cN = 0, cSum = 0;
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      for (let k = 0; k < 6; k++) { cN++; cSum += pos.array[(base + k) * 3 + 1]!; }
    }
    expect(fN).toBeGreaterThan(0);
    expect(fSum / fN, '果序均值 Y 应低于叶卡均值 Y（垂挂冠底）').toBeLessThan(cSum / cN);
  }, 30000);
});

describe('冠内通透（显式规则：通道 / 内层密度衰减 / 局部空腔）', () => {
  /** 存活叶卡挂点数组（根边中点 = 顶点 0,1 均值 = 通透过滤时的候选中心——与规则判定
   *  口径严格对齐；果序块跳过） */
  function cardRootMidpoints(result: PlatanusGeometryResult): { x: number; y: number; z: number }[] {
    const leaf = result.geometry.groups[1]!;
    const pos = result.geometry.getAttribute('position');
    const uv = result.geometry.getAttribute('uv');
    const roots: { x: number; y: number; z: number }[] = [];
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      if (uv.array[base * 2 + 1]! >= 2) continue; // 果序块（24 顶点）按 6 跨步会误入——跳过
      roots.push({
        x: (pos.array[base * 3]! + pos.array[(base + 1) * 3]!) / 2,
        y: (pos.array[base * 3 + 1]! + pos.array[(base + 1) * 3 + 1]!) / 2,
        z: (pos.array[base * 3 + 2]! + pos.array[(base + 1) * 3 + 2]!) / 2,
      });
    }
    return roots;
  }

  it('通透规则实际生效：存在剔卡，且密度场与空腔两规则均命中（通道为拓扑保险）；账目守恒', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.leafCards).toBeLessThan(stats.leafCandidates);
    expect(stats.gradientRejects, '内层密度衰减应实际剔卡').toBeGreaterThan(0);
    expect(stats.voidRejects, '局部空腔应实际剔卡').toBeGreaterThan(0);
    expect(stats.leafCards).toBe(stats.leafCandidates - stats.channelRejects - stats.voidRejects - stats.gradientRejects);
  }, 30000);

  it('外密内疏：内核（q<0.4）叶卡保留率显著低于外壳（q>0.6），外壳近满（crown_fill_gradient）', () => {
    const { stats } = buildTracked(SEED0);
    const innerCand = stats.qCandidates[0]! + stats.qCandidates[1]!;
    const innerSurv = stats.qSurvived[0]! + stats.qSurvived[1]!;
    const shellCand = stats.qCandidates[3]! + stats.qCandidates[4]!;
    const shellSurv = stats.qSurvived[3]! + stats.qSurvived[4]!;
    expect(innerCand, '内核应有候选卡（挂点放宽后内层有挂）').toBeGreaterThan(100);
    const innerRet = innerSurv / innerCand;
    const shellRet = shellSurv / shellCand;
    expect(shellRet, '外壳保留率应近满（中-疏冠壳——Spec §3 Inferred [9]）').toBeGreaterThanOrEqual(0.9);
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
    const uv = result.geometry.getAttribute('uv');
    const ys: number[] = [];
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      if (uv.array[base * 2 + 1]! >= 2) continue;
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

describe('枝梢驱动叶簇（家族方法沿用：枝梢 → 簇空间 → 互生螺旋疏排）', () => {
  it('簇-枝梢绑定：簇数 > 0、L5 末梢挂簇占主导；簇中心贴挂点（cm 级）；簇方向 = 枝切向单位向量；簇账目守恒', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.clusters.length, '应有保留簇').toBeGreaterThan(0);
    const l5 = stats.clusters.filter((c) => c.level === 4).length;
    const l4 = stats.clusters.filter((c) => c.level === 3).length;
    expect(l5, 'L5 末梢簇应占主导（末级枝外段受光区）').toBeGreaterThan(l4);
    // 簇剔除账目守恒：保留 + 剔除 = 簇位总数（每 L5 枝 clustersL5 簇 + 每 L4 枝 clustersL4 簇）
    expect(stats.clusters.length + stats.clustersCulled).toBe(
      stats.levelBranches[4]! * PLATANUS_SLOT0_PROFILE.clustersL5 + stats.levelBranches[3]! * PLATANUS_SLOT0_PROFILE.clustersL4,
    );
    // 簇中心 = 挂点沿切向前移极近一位（前移 ≤ 0.2×簇半径 ≤ 0.2×0.36（L4 ×1.2 上限）=
    // 0.072m——cm 级）
    let maxBind = 0;
    let maxUnitErr = 0;
    for (const c of stats.clusters) {
      maxBind = Math.max(maxBind, Math.hypot(c.cx - c.attachX, c.cy - c.attachY, c.cz - c.attachZ));
      maxUnitErr = Math.max(maxUnitErr, Math.abs(Math.hypot(c.dirX, c.dirY, c.dirZ) - 1));
    }
    expect(maxBind, '簇中心到挂点距离应 < 0.08m（cm 级——前移 ≤ 0.2×簇半径）').toBeLessThan(0.08);
    expect(maxUnitErr, '簇方向应为单位向量').toBeLessThan(1e-6);
  }, 30000);

  it('簇间大间隙：近邻簇中心距 ≥ 0.5×(ri+rj) 的簇占比 ≥ 90%（clusterMinSeparation=0.55 距离抑制保证下界——疏簇语义）', () => {
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
    expect(mean, '存活卡 r̂ 均值应 ≥ 0.7（互生散布平摊）').toBeGreaterThanOrEqual(0.7);
  }, 30000);
});

describe('树皮起伏确定性（光滑斑块剥落浅浮雕——amplitude 0.014 / {3,5,6} / drift 11）', () => {
  /** 皮组某管某段 ring A 的顶点索引（a0 = 每四边形首顶点；发射序 = 主干 → 底盖 → L1 → 深度优先首链） */
  function ringRadii(result: PlatanusGeometryResult, base: number, seg: number, radial: number): number[] {
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
  const TRUNK_RADIAL = PLATANUS_SLOT0_PROFILE.trunk.radial;
  const TRUNK_SEGS = PLATANUS_SLOT0_PROFILE.trunk.segs;
  const L1_BASE = TRUNK_SEGS * TRUNK_RADIAL * 6 + TRUNK_RADIAL * 3; // 1218
  const L5_BASE =
    L1_BASE +
    9 * 8 * 6 + // L1：9 段 ×8 径向
    8 * 7 * 6 + // L2
    5 * 6 * 6 + // L3
    4 * 5 * 6; // L4 → 首 L5 管（2286）

  it('主干全部环截面极差/环均径 ∈ [0.8%, 6%]，最大极差 ≥ 8mm（毫米级浅浮雕——bark_relief 光滑剥落浅端 Inferred [1][9]；vs 银杏厘米级 [2%,8%] 收窄——光滑剥落族量级分化）', () => {
    const result = buildTracked(SEED0);
    expect(result.stats.barkTriangles, '皮拓扑不受起伏影响（emitTube 只动顶点域）').toBe(24178);
    let maxAbs = 0;
    for (let seg = 0; seg < TRUNK_SEGS; seg++) {
      const radii = ringRadii(result, 0, seg, TRUNK_RADIAL);
      const mean = radii.reduce((s, r) => s + r, 0) / radii.length;
      const range = Math.max(...radii) - Math.min(...radii);
      maxAbs = Math.max(maxAbs, range);
      expect(range / mean, `主干环 ${seg} 极差/均径应 ≥ 0.8%（斑缘浮雕可辨）`).toBeGreaterThanOrEqual(0.008);
      expect(range / mean, `主干环 ${seg} 极差/均径应 ≤ 6%（浅浮雕不夸张——光滑端）`).toBeLessThanOrEqual(0.06);
    }
    expect(maxAbs * 1000, '主干最大极差应 ≥ 8mm（基径 0.30–0.36m × flare × 幅度比 1.4%；探针实测 10.5mm）').toBeGreaterThanOrEqual(8);
  }, 30000);

  it('起伏幅度沿枝级递减：主干极差 > L1 首环极差 > L5 首环极差；L5 绝对量 < 1mm 级（亚视觉地板 → 圆管）', () => {
    const result = buildTracked(SEED0);
    const trunkMax = Math.max(
      ...Array.from({ length: TRUNK_SEGS }, (_, seg) => {
        const radii = ringRadii(result, 0, seg, TRUNK_RADIAL);
        return Math.max(...radii) - Math.min(...radii);
      }),
    );
    const l1 = ringRadii(result, L1_BASE, 0, PLATANUS_SLOT0_PROFILE.levels[0]!.radial);
    const l1Range = Math.max(...l1) - Math.min(...l1);
    const l5 = ringRadii(result, L5_BASE, 0, PLATANUS_SLOT0_PROFILE.levels[4]!.radial);
    const l5Range = Math.max(...l5) - Math.min(...l5);
    expect(trunkMax, '主干极差应大于 L1').toBeGreaterThan(l1Range);
    expect(l1Range, 'L1 首环极差应 ≥ 1.2mm（粗枝端斑缘浮雕——大片剥落显于粗干 [1][4]）').toBeGreaterThanOrEqual(0.0012);
    expect(l1Range, 'L1 极差应大于 L5').toBeGreaterThan(l5Range);
    expect(l5Range * 1000, 'L5 极差应 < 1mm（末梢亚毫米层被地板跳过——实测圆管）').toBeLessThan(1);
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
    const sparse = buildTracked(SEED0, { ...PLATANUS_SLOT0_PROFILE, canopyDensity: 0.25 });
    expect(sparse.stats.barkTriangles).toBe(base.stats.barkTriangles); // 皮拓扑不受密度影响
    expect(sparse.stats.leafCards).toBeLessThan(base.stats.leafCards * 0.5);
  }, 30000);
});
