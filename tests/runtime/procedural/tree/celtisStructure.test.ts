/**
 * tests/runtime/procedural/tree/celtisStructure.test.ts —— 朴树枝干结构真实性测试
 * （T011.1，对称夏栎 tree3aStructure 组织——方法复制首跑）。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildCeltisGeometry 消费扩展 stats，与资产入口
 * 契约（asset_tree_celtis.asset）互补——本文件锁「结构怎么长」，那边锁「契约怎么传」）：
 * - 确定性：同 rng seed + 同 shapeProfile 两次构建 → 全属性逐位相等、stats 账目全等；
 *   profile 缺省调用 = slot-0 标准组合显式传入（锚点回落路径）；
 * - 主次分级：五级拓扑计数恒等 [7,21,63,189,378]（6 骨架 + 1 领导；皮面数恒等的前提，
 *   皮 24178 锁）；各级平均起径严格递减；一级骨架枝（含领导枝）≥ 2.2× 次级、
 *   ≥ 12× 末梢——「所有分枝视觉权重接近即不达标」的结构化判据；
 * - 冠内通透（显式规则）：候选 → 存活存在剔卡且密度场/空腔两规则实际命中（通道为
 *   拓扑保险）；外密内疏——内核保留率显著低于外壳（crown_fill_gradient Verified [6]）；
 *   枝干通道——存活叶卡挂点（根边中点 = 过滤判定口径）距通道线段带内数为 0；通透不
 *   挖空整层——冠顶/冠底 1/3 高度带均有存活叶卡；
 * - 枝梢驱动叶簇（家族方法沿用）：簇-枝梢绑定（簇中心贴挂点 + 簇方向 = 挂点枝切向
 *   单位向量 + L5 末梢挂簇占主导）；簇间间隙（近邻簇中心距 ≥ gapFactor×(ri+rj) 占比）；
 *   shellBias 外偏（存活卡簇内归一化半径均值）；每簇叶量域与卡几何域（宽 0.07–0.11m /
 *   长宽比 1.3–2.0 落 profile 域——朴树叶身份 Spec Verified [3][5][6]）；
 * - 贴地契约：minY 精确 0（原点 = 底部中心）；
 * - shapeProfile 参数面真实驱动：canopyDensity 压低 → 叶卡数显著下降。
 * 边界：构建产物 afterEach 统一 dispose。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { buildCeltisGeometry } from '../../../../src/runtime/procedural/tree/celtis/celtisGeometry';
import type { CeltisGeometryResult } from '../../../../src/runtime/procedural/tree/celtis/celtisGeometry';
import { CELTIS_SLOT0_PROFILE } from '../../../../src/runtime/procedural/tree/celtis/celtisShapeProfile';

const SEED0 = morphSeedOf('asset_tree_celtis', 0);

const built: CeltisGeometryResult[] = [];

function buildTracked(seed: number, profile = CELTIS_SLOT0_PROFILE): CeltisGeometryResult {
  const result = buildCeltisGeometry(mulberry32(seed), profile);
  built.push(result);
  return result;
}

afterEach(() => {
  for (const { geometry } of built.splice(0)) geometry.dispose();
});

describe('确定性（shapeProfile 路径）', () => {
  it('同 seed + 同 profile 两次构建：position/normal/aLeafRand/aBend 逐位相等、stats 账目全等', () => {
    const a = buildTracked(SEED0);
    const b = buildTracked(SEED0);
    for (const attr of ['position', 'normal', 'aLeafRand', 'aBend'] as const) {
      expect(a.geometry.getAttribute(attr).array).toEqual(b.geometry.getAttribute(attr).array);
    }
    expect(a.stats).toEqual(b.stats);
  }, 30000);

  it('profile 缺省 = slot-0 标准组合显式传入（锚点回落路径逐位一致）', () => {
    const a = buildCeltisGeometry(mulberry32(SEED0));
    const b = buildTracked(SEED0, CELTIS_SLOT0_PROFILE);
    built.push(a);
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.stats).toEqual(b.stats);
  }, 30000);
});

describe('主次分级（一级骨架枝 vs 末梢枝视觉权重落差）', () => {
  it('五级拓扑计数恒等 [7,21,63,189,378]、皮面数恒等 24178（槽间皮恒定的前提）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.levelBranches).toEqual([7, 21, 63, 189, 378]);
    expect(stats.barkTriangles).toBe(24178);
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

describe('冠内通透（显式规则：通道 / 内层密度衰减 / 局部空腔）', () => {
  /** 存活叶卡挂点数组（根边中点 = 顶点 0,1 均值 = 通透过滤时的候选中心——与规则判定
   *  口径严格对齐；6 顶点质心含卡体向外的伸展，越带属卡几何伪影非规则失效） */
  function cardRootMidpoints(result: CeltisGeometryResult): { x: number; y: number; z: number }[] {
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

  it('通透规则实际生效：存在剔卡，且密度场与空腔两规则均命中（通道为拓扑保险）；账目守恒', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.leafCards).toBeLessThan(stats.leafCandidates);
    expect(stats.gradientRejects, '内层密度衰减应实际剔卡').toBeGreaterThan(0);
    expect(stats.voidRejects, '局部空腔应实际剔卡').toBeGreaterThan(0);
    expect(stats.leafCards).toBe(stats.leafCandidates - stats.channelRejects - stats.voidRejects - stats.gradientRejects);
  }, 30000);

  it('外密内疏：内核（q<0.4）叶卡保留率显著低于外壳（q>0.6），外壳近满（crown_fill_gradient）', () => {
    const { stats } = buildTracked(SEED0);
    // q = 冠内归一化径向深度（相对该高度冠壳半径——与密度场同口径）；叶卡背景分布由
    // 枝路径决定，通透规则的作用体现在保留率随 q 递增（外密内疏的结构化证据）
    const innerCand = stats.qCandidates[0]! + stats.qCandidates[1]!;
    const innerSurv = stats.qSurvived[0]! + stats.qSurvived[1]!;
    const shellCand = stats.qCandidates[3]! + stats.qCandidates[4]!;
    const shellSurv = stats.qSurvived[3]! + stats.qSurvived[4]!;
    expect(innerCand, '内核应有候选卡（挂点放宽后内层有挂）').toBeGreaterThan(100);
    const innerRet = innerSurv / innerCand;
    const shellRet = shellSurv / shellCand;
    expect(shellRet, '外壳保留率应近满（冠壳叶密）').toBeGreaterThanOrEqual(0.9);
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

describe('枝梢驱动叶簇（家族方法沿用：枝梢 → 簇空间 → 叶片分布）', () => {
  it('簇-枝梢绑定：簇数 > 0、L5 末梢挂簇占主导；簇中心贴挂点（cm 级）；簇方向 = 枝切向单位向量；簇账目守恒', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.clusters.length, '应有保留簇').toBeGreaterThan(0);
    const l5 = stats.clusters.filter((c) => c.level === 4).length;
    const l4 = stats.clusters.filter((c) => c.level === 3).length;
    expect(l5, 'L5 末梢簇应占主导（叶互生一年生细枝）').toBeGreaterThan(l4);
    // 簇剔除账目守恒：保留 + 剔除 = 簇位总数（每 L5 枝 clustersL5 簇 + 每 L4 枝 clustersL4 簇）
    expect(stats.clusters.length + stats.clustersCulled).toBe(
      stats.levelBranches[4]! * CELTIS_SLOT0_PROFILE.clustersL5 + stats.levelBranches[3]! * CELTIS_SLOT0_PROFILE.clustersL4,
    );
    // 簇中心 = 挂点沿切向前移极近一位（前移 ≤ 0.2×簇半径 ≤ 0.2×0.175 < 0.05m——cm 级）
    let maxBind = 0;
    let maxUnitErr = 0;
    for (const c of stats.clusters) {
      maxBind = Math.max(maxBind, Math.hypot(c.cx - c.attachX, c.cy - c.attachY, c.cz - c.attachZ));
      maxUnitErr = Math.max(maxUnitErr, Math.abs(Math.hypot(c.dirX, c.dirY, c.dirZ) - 1));
    }
    expect(maxBind, '簇中心到挂点距离应 < 0.05m（cm 级）').toBeLessThan(0.05);
    expect(maxUnitErr, '簇方向应为单位向量').toBeLessThan(1e-6);
  }, 30000);

  it('簇间间隙：近邻簇中心距 ≥ 0.5×(ri+rj) 的簇占比 ≥ 90%（clusterMinSeparation=0.55 距离抑制保证下界）', () => {
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

  it('shellBias 外偏：存活卡簇内归一化半径均值 ≥ 0.6（叶沿簇壳分布、簇内稀疏成腔）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.leafRhat).toHaveLength(stats.leafCards);
    const mean = stats.leafRhat.reduce((s, r) => s + r, 0) / stats.leafRhat.length;
    expect(mean, '存活卡 r̂ 均值应 ≥ 0.6（shellBias=0.62/γ=0.8 外偏）').toBeGreaterThanOrEqual(0.6);
  }, 30000);

  it('每簇叶量域 + 卡几何域：逐簇存活数 ≤ 每簇预算且总数守恒；卡宽/长宽比落 profile 域（朴树叶身份 Spec Verified）', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    const budget = Math.max(CELTIS_SLOT0_PROFILE.clusterLeavesL5, CELTIS_SLOT0_PROFILE.clusterLeavesL4);
    expect(stats.clusterLeafMax).toBeLessThanOrEqual(budget);
    expect(stats.clusterLeafMean).toBeGreaterThanOrEqual(budget * 0.5);
    expect(stats.clusterLeaves.reduce((s, n) => s + n, 0)).toBe(stats.leafCards);
    // 卡几何域：从叶组顶点提取（宽 = 根边长，长 = 根→尖；聚合扫描一次断言）
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
        w < CELTIS_SLOT0_PROFILE.leafWidthMin - 1e-6 ||
        w > CELTIS_SLOT0_PROFILE.leafWidthMin + CELTIS_SLOT0_PROFILE.leafWidthSpan + 1e-6 ||
        aspect < CELTIS_SLOT0_PROFILE.leafAspectMin - 1e-6 ||
        aspect > CELTIS_SLOT0_PROFILE.leafAspectMin + CELTIS_SLOT0_PROFILE.leafAspectSpan + 1e-6
      ) {
        bad++;
      }
    }
    expect(bad, '卡宽应 ∈ [0.07, 0.11]、长宽比 ∈ [1.3, 2.0]（profile 域）').toBe(0);
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
    const sparse = buildTracked(SEED0, { ...CELTIS_SLOT0_PROFILE, canopyDensity: 0.25 });
    expect(sparse.stats.barkTriangles).toBe(base.stats.barkTriangles); // 皮拓扑不受密度影响
    expect(sparse.stats.leafCards).toBeLessThan(base.stats.leafCards * 0.5);
  }, 30000);
});
