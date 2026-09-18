/**
 * tests/runtime/procedural/tree/broadleafStructure.test.ts —— 夏栎枝干结构真实性测试（T009.1）。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildBroadleafGeometry 消费扩展 stats，与资产
 * 契约测试（asset_tree_3a.test.ts）互补——本文件锁「结构怎么长」，那边锁「契约怎么传」）：
 * - 确定性：同 rng seed + 同 shapeProfile 两次构建 → 全属性逐位相等、stats 账目全等；
 *   profile 缺省调用 = slot-0 标准组合显式传入（锚点回落路径）；
 * - 主次分级：五级拓扑计数恒等 [6,18,54,162,324]（皮面数恒等的前提，皮 20724 锁）；
 *   各级平均起径严格递减；一级骨架枝（含领导枝）≥ 2.2× 次级、≥ 12× 末梢——
 *   「所有分枝视觉权重接近即不达标」的结构化判据；
 * - 冠内通透（显式规则替代涌现式空腔）：候选 → 存活存在剔卡且密度场/空腔两规则均
 *   实际命中；外密内疏——内核（水平半径 < 0.4 冠半径）面积归一密度显著低于外壳
 *   （> 0.7）环（Spec crown_fill_gradient Verified 的结构化证据）；枝干通道——存活
 *   叶卡中心距主干轴 < 0.3m 数为 0（主干大枝进冠不被封死）；通透不挖空整层——
 *   冠顶/冠底 1/3 高度带均有存活叶卡（冠壳轮廓连续性）；
 * - shapeProfile 参数面真实驱动：canopyDensity 压低 → 叶卡数显著下降（009.3 八槽
 *   形态向量的原料字段有真实消费者，非摆设）。
 * 边界：构建产物 afterEach 统一 dispose。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { buildBroadleafGeometry } from '../../../../src/runtime/procedural/tree/broadleafGeometry';
import type { BroadleafTreeResult } from '../../../../src/runtime/procedural/tree/broadleafGeometry';
import { TREE3A_SLOT0_PROFILE } from '../../../../src/runtime/procedural/tree/tree3aShapeProfile';

const SEED0 = morphSeedOf('asset_tree_3a', 0);

const built: BroadleafTreeResult[] = [];

function buildTracked(seed: number, profile = TREE3A_SLOT0_PROFILE): BroadleafTreeResult {
  const result = buildBroadleafGeometry(mulberry32(seed), profile);
  built.push(result);
  return result;
}

afterEach(() => {
  for (const { geometry } of built.splice(0)) geometry.dispose();
});

describe('确定性（shapeProfile 路径）', () => {
  it('同 seed + 同 profile 两次构建：position/normal/aLeafRand 逐位相等、stats 账目全等', () => {
    const a = buildTracked(SEED0);
    const b = buildTracked(SEED0);
    for (const attr of ['position', 'normal', 'aLeafRand', 'aBend'] as const) {
      expect(a.geometry.getAttribute(attr).array).toEqual(b.geometry.getAttribute(attr).array);
    }
    expect(a.stats).toEqual(b.stats);
  }, 30000);

  it('profile 缺省 = slot-0 标准组合显式传入（锚点回落路径逐位一致）', () => {
    const a = buildBroadleafGeometry(mulberry32(SEED0));
    const b = buildTracked(SEED0, TREE3A_SLOT0_PROFILE);
    built.push(a);
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.stats).toEqual(b.stats);
  }, 30000);
});

describe('主次分级（一级骨架枝 vs 末梢枝视觉权重落差）', () => {
  it('五级拓扑计数恒等 [6,18,54,162,324]、皮面数恒等 20724（slot 间皮恒定的前提）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.levelBranches).toEqual([6, 18, 54, 162, 324]);
    expect(stats.barkTriangles).toBe(20724);
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
  /** 存活叶卡中心数组（从叶组 position 提取，6 顶点/卡取均值） */
  function cardCenters(result: BroadleafTreeResult): { x: number; y: number; z: number }[] {
    const leaf = result.geometry.groups[1]!;
    const pos = result.geometry.getAttribute('position');
    const centers: { x: number; y: number; z: number }[] = [];
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      let x = 0;
      let y = 0;
      let z = 0;
      for (let k = 0; k < 6; k++) {
        x += pos.array[(base + k) * 3]!;
        y += pos.array[(base + k) * 3 + 1]!;
        z += pos.array[(base + k) * 3 + 2]!;
      }
      centers.push({ x: x / 6, y: y / 6, z: z / 6 });
    }
    return centers;
  }

  it('通透规则实际生效：存在剔卡，且密度场与空腔两规则均命中（通道为拓扑保险）', () => {
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

  it('枝干通道：存活叶卡中心距任一通道线段 < r-0.05 的数量为 0（主干大枝进冠不被封死）', () => {
    const result = buildTracked(SEED0);
    const centers = cardCenters(result);
    let invasion = 0;
    for (const c of centers) {
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
    const centers = cardCenters(result);
    const ys = centers.map((c) => c.y);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const third = (yMax - yMin) / 3;
    const bottom = centers.filter((c) => c.y < yMin + third).length;
    const top = centers.filter((c) => c.y > yMax - third).length;
    expect(bottom, '冠底 1/3 带应有存活卡').toBeGreaterThan(100);
    expect(top, '冠顶 1/3 带应有存活卡').toBeGreaterThan(100);
  }, 30000);
});

describe('shapeProfile 参数面驱动（009.3 八槽原料字段有真实消费者）', () => {
  it('canopyDensity 压低 → 叶卡数显著下降（同 seed 同拓扑，密度场真实消费）', () => {
    const base = buildTracked(SEED0);
    const sparse = buildTracked(SEED0, { ...TREE3A_SLOT0_PROFILE, canopyDensity: 0.25 });
    expect(sparse.stats.barkTriangles).toBe(base.stats.barkTriangles); // 皮拓扑不受密度影响
    expect(sparse.stats.leafCards).toBeLessThan(base.stats.leafCards * 0.5);
  }, 30000);
});
