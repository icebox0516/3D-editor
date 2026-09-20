/**
 * tests/runtime/procedural/tree/ginkgoStructure.test.ts —— 银杏枝干结构真实性测试
 * （T011.4，对称榉树 zelkovaStructure 组织——方法复制，数值锚为银杏自己的实测；
 * 长短枝双挂点 = 银杏独有断言组）。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildGinkgoGeometry 消费扩展 stats，与资产入口
 * 契约（asset_tree_ginkgo.asset）互补——本文件锁「结构怎么长」，那边锁「契约怎么传」）：
 * - 确定性：同 rng seed + 同 shapeProfile 两次构建 → 全属性逐位相等、stats 账目全等；
 *   rng 消费恒等 82756（消费顺序即契约——次数变化 = 随机流重排；011.3 ③ 教训：包裹
 *   rng 闭包逐调用计数口径）；
 * - 组序恰 2（D15 免组膨胀：皮 0 / 叶 1）；皮面数恒等 20782（5 骨架 + 1 领导拓扑，
 *   同榉树/香樟 5+1 结构计数）；
 * - 主次分级：五级拓扑计数恒等 [6,18,54,162,324]；各级平均起径严格递减；一级骨架枝
 *   （含领导枝）≥ 2.2× 次级、≥ 12× 末梢——「所有分枝视觉权重接近即不达标」的结构化判据；
 * - **长短枝双挂点（银杏独有身份，Spec §4 Verified [1][2][3]）**：短枝莲座卡（spur）
 *   与长枝散生卡（long）两类并存且占比合理（长枝卡 25–45%——散生单片读向）；
 *   每簇莲座叶量 ≤ 8（FRPS「3–8 叶簇生」域上沿 [1]）且均值 ≥ 4（典型 4–6 [4][7]）；
 *   簇账 + 散生账 = 总卡数（账目守恒）；
 * - 冠内通透（显式规则）：候选 → 存活存在剔卡且密度场/空腔两规则实际命中（通道为
 *   拓扑保险）；外密内疏——内核保留率显著低于外壳（crown_fill_gradient Inferred [7]）；
 *   枝干通道——存活叶卡挂点（根边中点 = 过滤判定口径）距通道线段带内数为 0；通透不
 *   挖空整层——冠顶/冠底 1/3 高度带均有存活叶卡；
 * - 枝梢驱动叶簇（家族方法沿用）：簇-枝梢绑定（簇中心贴挂点 + 簇方向 = 挂点枝切向
 *   单位向量 + L5 末梢挂簇占主导）；簇间间隙；shellBias 外偏；卡几何域（宽 0.10–0.16m /
 *   长宽比 0.62–0.91 落 profile 域——扇形宽>高反向口径 Spec [1][2][7]）；
 * - 贴地契约：minY 精确 0（原点 = 底部中心）；
 * - 树皮起伏确定性（浅-中纵裂脊沟——amplitude 0.030 / {4,5,6} / drift 2.6）：主干
 *   环截面起伏存在（极差/环均径带 + 厘米级下沿纵裂量级——bark_relief 浅-中 per 终审
 *   C-6；vs 榉树毫米级 [1.5%,4%] 带放宽——第五种树皮语言分化）、沿枝级递减（主干强
 *   末梢弱）、wrap 位浮点级无缝；
 * - shapeProfile 参数面真实驱动：canopyDensity 压低 → 叶卡数显著下降。
 * 边界：构建产物 afterEach 统一 dispose。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { buildGinkgoGeometry } from '../../../../src/runtime/procedural/tree/ginkgo/ginkgoGeometry';
import type { GinkgoGeometryResult } from '../../../../src/runtime/procedural/tree/ginkgo/ginkgoGeometry';
import { GINKGO_SLOT0_PROFILE } from '../../../../src/runtime/procedural/tree/ginkgo/ginkgoShapeProfile';

const SEED0 = morphSeedOf('asset_tree_ginkgo', 0);
/** slot-0 High rng 消费快照（2026-09-20 探针实测，包裹闭包逐调用计数——任何条件
 *  跳过消费都违约；profile 冠幅/领导链校准定稿后定值；跨 seed 随保留簇数变化（通透
 *  roll 每存活候选 1 次）——四先例同机制） */
const RNG_CALLS_LOCK = 82756;

const built: GinkgoGeometryResult[] = [];

function buildTracked(seed: number, profile = GINKGO_SLOT0_PROFILE): GinkgoGeometryResult {
  const result = buildGinkgoGeometry(mulberry32(seed), profile);
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
    const a = buildGinkgoGeometry(mulberry32(SEED0));
    const b = buildTracked(SEED0, GINKGO_SLOT0_PROFILE);
    built.push(a);
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.stats).toEqual(b.stats);
  }, 30000);

  it(`rng 消费恒等 ${RNG_CALLS_LOCK}（消费顺序即契约——次数变化 = 随机流重排）`, () => {
    const stream = mulberry32(SEED0);
    let calls = 0;
    buildTracked(SEED0); // 账目构建（dispose 归 afterEach）
    const stream2 = mulberry32(SEED0);
    buildGinkgoGeometry(
      () => {
        calls++;
        return stream2();
      },
      GINKGO_SLOT0_PROFILE,
      'high',
    ).geometry.dispose();
    void stream;
    expect(calls).toBe(RNG_CALLS_LOCK);
  }, 30000);
});

describe('组序与皮拓扑（D15 恰 2 组 + 结构计数恒等）', () => {
  it(`五级拓扑计数恒等 [6,18,54,162,324]、皮面数恒等 20782（5 骨架 + 1 领导——槽间皮恒定的前提）`, () => {
    const { stats, geometry } = buildTracked(SEED0);
    expect(stats.levelBranches).toEqual([6, 18, 54, 162, 324]);
    expect(stats.barkTriangles).toBe(20782);
    expect(geometry.groups, '应恰 2 组（皮 0 / 叶 1）').toHaveLength(2);
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

describe('长短枝双挂点（银杏独有身份——Spec §4 二型系统 Verified [1][2][3]）', () => {
  it('两类卡并存：莲座卡（spur）与散生卡（long）均有烘焙，散生占比 25–45%（螺旋散生单片读向 [3]）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.spurCards, '短枝莲座卡应 > 0').toBeGreaterThan(0);
    expect(stats.longCards, '长枝散生卡应 > 0').toBeGreaterThan(0);
    expect(stats.leafCards).toBe(stats.spurCards + stats.longCards);
    const longShare = stats.longCards / stats.leafCards;
    expect(longShare, `散生卡占比应 25–45%（实测 ${longShare.toFixed(3)}）`).toBeGreaterThanOrEqual(0.25);
    expect(longShare).toBeLessThanOrEqual(0.45);
  }, 30000);

  it('每簇莲座叶量 ≤ 8（FRPS 3–8 域上沿 [1]）且均值 ≥ 4（典型 4–6 [4][7]）；簇账 + 散生账守恒', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.clusterLeafMax, '逐簇莲座存活数应 ≤ 每簇候选 8').toBeLessThanOrEqual(8);
    expect(stats.clusterLeafMean, '逐簇均值应 ≥ 4（典型 4–6 带下沿）').toBeGreaterThanOrEqual(4);
    expect(stats.clusterLeaves.reduce((s, n) => s + n, 0)).toBe(stats.spurCards);
  }, 30000);
});

describe('冠内通透（显式规则：通道 / 内层密度衰减 / 局部空腔）', () => {
  /** 存活叶卡挂点数组（根边中点 = 顶点 0,1 均值 = 通透过滤时的候选中心——与规则判定
   *  口径严格对齐；6 顶点质心含卡体向外的伸展，越带属卡几何伪影非规则失效） */
  function cardRootMidpoints(result: GinkgoGeometryResult): { x: number; y: number; z: number }[] {
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
    expect(shellRet, '外壳保留率应近满（中-密冠壳——Spec §3 Inferred [7]）').toBeGreaterThanOrEqual(0.9);
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

describe('枝梢驱动叶簇（家族方法沿用：枝梢 → 簇空间 → 莲座叶片分布）', () => {
  it('簇-枝梢绑定：簇数 > 0、L5 末梢挂簇占主导；簇中心贴挂点（cm 级）；簇方向 = 枝切向单位向量；簇账目守恒', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.clusters.length, '应有保留簇').toBeGreaterThan(0);
    const l5 = stats.clusters.filter((c) => c.level === 4).length;
    const l4 = stats.clusters.filter((c) => c.level === 3).length;
    expect(l5, 'L5 末梢簇应占主导（短枝遍布末级枝外段受光区）').toBeGreaterThan(l4);
    // 簇剔除账目守恒：保留 + 剔除 = 簇位总数（每 L5 枝 clustersL5 簇 + 每 L4 枝 clustersL4 簇）
    expect(stats.clusters.length + stats.clustersCulled).toBe(
      stats.levelBranches[4]! * GINKGO_SLOT0_PROFILE.clustersL5 + stats.levelBranches[3]! * GINKGO_SLOT0_PROFILE.clustersL4,
    );
    // 簇中心 = 挂点沿切向前移极近一位（前移 ≤ 0.2×簇半径 ≤ 0.2×0.16 < 0.05m——cm 级）
    let maxBind = 0;
    let maxUnitErr = 0;
    for (const c of stats.clusters) {
      maxBind = Math.max(maxBind, Math.hypot(c.cx - c.attachX, c.cy - c.attachY, c.cz - c.attachZ));
      maxUnitErr = Math.max(maxUnitErr, Math.abs(Math.hypot(c.dirX, c.dirY, c.dirZ) - 1));
    }
    expect(maxBind, '簇中心到挂点距离应 < 0.05m（cm 级）').toBeLessThan(0.05);
    expect(maxUnitErr, '簇方向应为单位向量').toBeLessThan(1e-6);
  }, 30000);

  it('簇间间隙：近邻簇中心距 ≥ 0.5×(ri+rj) 的簇占比 ≥ 90%（clusterMinSeparation=0.50 距离抑制保证下界）', () => {
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

  it('shellBias 外偏：存活卡簇内归一化半径均值 ≥ 0.6（莲座浅壳 0.50 + 散生 stick-out 归一——叶沿簇壳分布）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.leafRhat).toHaveLength(stats.leafCards);
    const mean = stats.leafRhat.reduce((s, r) => s + r, 0) / stats.leafRhat.length;
    expect(mean, '存活卡 r̂ 均值应 ≥ 0.6（shellBias=0.50/γ=0.8 莲座浅壳外偏）').toBeGreaterThanOrEqual(0.6);
  }, 30000);

  it('每簇叶量域 + 卡几何域：逐簇存活数 ≤ 每簇预算且总数守恒；卡宽/长宽比落 profile 域（扇形宽>高反向口径 Spec Verified/Inferred）', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    const budget = Math.max(GINKGO_SLOT0_PROFILE.clusterLeavesL5, GINKGO_SLOT0_PROFILE.clusterLeavesL4);
    expect(stats.clusterLeafMax).toBeLessThanOrEqual(budget);
    expect(stats.clusterLeafMean).toBeGreaterThanOrEqual(budget * 0.5);
    expect(stats.clusterLeaves.reduce((s, n) => s + n, 0) + stats.longCards).toBe(stats.leafCards);
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
        w < GINKGO_SLOT0_PROFILE.leafWidthMin - 1e-6 ||
        w > GINKGO_SLOT0_PROFILE.leafWidthMin + GINKGO_SLOT0_PROFILE.leafWidthSpan + 1e-6 ||
        aspect < GINKGO_SLOT0_PROFILE.leafAspectMin - 1e-6 ||
        aspect > GINKGO_SLOT0_PROFILE.leafAspectMin + GINKGO_SLOT0_PROFILE.leafAspectSpan + 1e-6
      ) {
        bad++;
      }
    }
    expect(bad, '卡宽应 ∈ [0.10, 0.16]、长宽比 ∈ [0.62, 0.91]（profile 域——扇形宽>高）').toBe(0);
  }, 30000);
});

describe('树皮起伏确定性（浅-中纵裂脊沟——amplitude 0.030 / {4,5,6} / drift 2.6）', () => {
  /** 皮组某管某段 ring A 的顶点索引（a0 = 每四边形首顶点；发射序 = 主干 → 底盖 → L1 → 深度优先首链） */
  function ringRadii(result: GinkgoGeometryResult, base: number, seg: number, radial: number): number[] {
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
  const TRUNK_RADIAL = GINKGO_SLOT0_PROFILE.trunk.radial;
  const TRUNK_SEGS = GINKGO_SLOT0_PROFILE.trunk.segs;
  const L1_BASE = TRUNK_SEGS * TRUNK_RADIAL * 6 + TRUNK_RADIAL * 3; // 1218
  const L5_BASE =
    L1_BASE +
    9 * 8 * 6 + // L1：9 段 ×8 径向
    8 * 7 * 6 + // L2
    5 * 6 * 6 + // L3
    4 * 5 * 6; // L4 → 首 L5 管（2286）

  it('主干全部环截面极差/环均径 ∈ [2%, 8%]，最大极差 ≥ 9mm（厘米级下沿纵裂——浅-中纵裂 per 终审 C-6；vs 榉树毫米级 [1.5%,4%] 带放宽——第五种树皮语言量级分化)', () => {
    const result = buildTracked(SEED0);
    expect(result.stats.barkTriangles, '皮拓扑不受起伏影响（emitTube 只动顶点域）').toBe(20782);
    let maxAbs = 0;
    for (let seg = 0; seg < TRUNK_SEGS; seg++) {
      const radii = ringRadii(result, 0, seg, TRUNK_RADIAL);
      const mean = radii.reduce((s, r) => s + r, 0) / radii.length;
      const range = Math.max(...radii) - Math.min(...radii);
      maxAbs = Math.max(maxAbs, range);
      expect(range / mean, `主干环 ${seg} 极差/均径应 ≥ 2%（纵裂可辨）`).toBeGreaterThanOrEqual(0.02);
      expect(range / mean, `主干环 ${seg} 极差/均径应 ≤ 8%（浅-中端不夸张——中龄相）`).toBeLessThanOrEqual(0.08);
    }
    expect(maxAbs * 1000, '主干最大极差应 ≥ 9mm（厘米级下沿——基径 0.26–0.32m × flare × 幅度比 3.0%；探针实测）').toBeGreaterThanOrEqual(9);
  }, 30000);

  it('起伏幅度沿枝级递减：主干极差 > L1 首环极差 > L5 首环极差；L5 绝对量 < 1mm 级（亚视觉地板 → 圆管）', () => {
    const result = buildTracked(SEED0);
    const trunkMax = Math.max(
      ...Array.from({ length: TRUNK_SEGS }, (_, seg) => {
        const radii = ringRadii(result, 0, seg, TRUNK_RADIAL);
        return Math.max(...radii) - Math.min(...radii);
      }),
    );
    const l1 = ringRadii(result, L1_BASE, 0, GINKGO_SLOT0_PROFILE.levels[0]!.radial);
    const l1Range = Math.max(...l1) - Math.min(...l1);
    const l5 = ringRadii(result, L5_BASE, 0, GINKGO_SLOT0_PROFILE.levels[4]!.radial);
    const l5Range = Math.max(...l5) - Math.min(...l5);
    expect(trunkMax, '主干极差应大于 L1').toBeGreaterThan(l1Range);
    expect(l1Range, 'L1 首环极差应 ≥ 1.5mm（粗枝端同裂——幼即裂 Verified [1][2]）').toBeGreaterThanOrEqual(0.0015);
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
    const sparse = buildTracked(SEED0, { ...GINKGO_SLOT0_PROFILE, canopyDensity: 0.25 });
    expect(sparse.stats.barkTriangles).toBe(base.stats.barkTriangles); // 皮拓扑不受密度影响
    expect(sparse.stats.leafCards).toBeLessThan(base.stats.leafCards * 0.5);
  }, 30000);
});
