/**
 * tests/runtime/procedural/tree/platanusShapeSlots.test.ts —— 悬铃木 8 槽形态向量表测试
 * （T011.5，对称银杏 ginkgoShapeSlots 组织——方法复制；数值锚为悬铃木自己的实测）。
 *
 * 覆盖（零 mock——真实几何生成；PLATANUS_SHAPE_PROFILES 八槽完整组合 = 「8 组向量即
 * config 雏形」的契约锁，与 platanusStructure.test.ts（slot-0 结构语义）互补）：
 * - 结构计数恒等：8 槽（各自 morphSeedOf(id, slot) 规范种子）构建——皮面数全部 24178、
 *   levelBranches [7,21,63,189,378]；配置侧锁——结构计数类字段（trunk/levels
 *   radial/segs、childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）与叶卡尺寸/
 *   长宽比域（阔卵宽>长口径 Spec [1][3][9]）与 barkRelief（槽间恒等——非形态差异
 *   维度）逐位同 slot-0，canopyDensity ≤ 1（消费端 Math.min(1,·) 截断，>1 无效）；
 * - 确定性：同 seed 同槽两次构建逐位相等（代表槽 0/3/7 全属性 + stats——全 8 槽双建
 *   为全量套件并行负载裁剪让位：platanusStructure 锁 slot-0 双建 + 结构计数恒等间接
 *   覆盖）；
 * - 路由一致（D19 契约锁）：build({seed: morphSeedOf(id, slot)})（资产路径，
 *   profileForSeed 查表）与 buildPlatanusGeometry(mulberry32(seed),
 *   PLATANUS_SHAPE_PROFILES[slot])（几何直调）逐位一致——slot-0/3/6/7 代表位（资产
 *   入口静态 import——import 失败即测试红，T020 软跳过清除）；
 * - 槽间真实差异（方向性断言，同 seed = SEED0 下跨槽对比——隔离 profile 效应与
 *   morphSeed 随机流，差异只能来自向量本身，杜绝「seed 运气冒充形态差异」）：挺拔 vs
 *   展开 叶幕 XZ 宽度比 ≥ 1.3（探针实测 ≈1.75——散布互生骨架无轮生集中放张，槽对比
 *   强于银杏 1.18）；低冠 vs 高冠叶卡最低 Y（视觉冠底——干高 Inferred 域的槽维度
 *   展开）差 ≥ 0.9m（实测 ≈1.20m）；疏松 vs 丰满叶卡数比 ≤ 0.85（实测 ≈0.74——
 *   crown_transparency 20–30% 带内疏密两端）；偏冠 vs 标准——6 种子面板质心均值比
 *   ≥ 1.15（实测 ≈1.21）；规范种子下偏冠槽质心绝对 ≥ 0.4m 且 ≥ 1.35× 标准槽（实测
 *   1.55m / slot-0 规范种子质心 0.06m 居中——绝对读数为主口径）；8 槽叶卡数（规范
 *   种子）不全相同且各落卡上限 (40000−24178)/2（果序入总面账，下限由总面锁覆盖）；
 * - 物种锚点（规范种子 slot-0）：总高落 11.0–12.8m 锚域、视觉冠底/实高落 Inferred
 *   域带 [0.25, 0.35]（六实例首个 Inferred 支撑干高域）、bbox 冠幅比落工程域
 *   0.60–0.75（Step 3 探针定档 0.683——冠幅参数校准的实测验收锁）；
 * - 通透不变量不破（规范种子逐槽）：外壳（q>0.6）保留率 ≥ canopyDensity×0.85（槽
 *   自适应）且 ≥ 内核（q<0.4）保留率 ×1.8（外密内疏，Spec crown_fill_gradient
 *   Inferred [9]）；每槽总面数（皮+叶+果序）落 High 档预算带 [27000, 40000]（家族行
 *   High 上限语义，带下沿为悬铃木大卡口径参考——见资产模块头记档）。
 * 边界：构建产物 afterEach 统一 dispose（几何直调与资产 build 两类来源分别追踪）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { build } from '../../../../src/runtime/procedural/assets/asset_tree_platanus.asset';
import { buildPlatanusGeometry } from '../../../../src/runtime/procedural/tree/platanus/platanusGeometry';
import type { PlatanusGeometryResult } from '../../../../src/runtime/procedural/tree/platanus/platanusGeometry';
import { PLATANUS_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/platanus/platanusShapeProfile';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';

const ASSET_ID = 'asset_tree_platanus';
const SLOT_NAMES = ['标准', '挺拔', '展开', '偏冠', '低冠', '高冠', '疏松', '丰满'] as const;
/** 规范种子：slot-N 即 morphSeedOf(id, N)（缓存/池路径的实际形态流种子） */
const SEEDS = Array.from({ length: 8 }, (_, slot) => morphSeedOf(ASSET_ID, slot));
const SEED0 = SEEDS[0]!;

const built: PlatanusGeometryResult[] = [];
const sources: InstanceSource[] = [];

/** 几何直调（规范种子 = 各槽自己的 morphSeed） */
function buildSlot(slot: number): PlatanusGeometryResult {
  const result = buildPlatanusGeometry(mulberry32(SEEDS[slot]!), PLATANUS_SHAPE_PROFILES[slot]!);
  built.push(result);
  return result;
}

/** 几何直调（指定种子 = 同 seed 跨槽对比——隔离 profile 效应） */
function buildSlotAt(slot: number, seed: number): PlatanusGeometryResult {
  const result = buildPlatanusGeometry(mulberry32(seed), PLATANUS_SHAPE_PROFILES[slot]!);
  built.push(result);
  return result;
}

afterEach(() => {
  for (const { geometry } of built.splice(0)) geometry.dispose();
  for (const source of sources.splice(0)) {
    source.geometry.dispose();
    for (const material of Array.isArray(source.material) ? source.material : [source.material]) {
      material.dispose();
    }
  }
});

/** 叶卡空间度量（6 顶点/卡取质心；果序块 uv v≥4 跳过——组 1 纯卡，防御性）：XZ 跨度 / 最低 Y / 质心对
 *  原点（树干轴）偏移 / 卡数 */
interface LeafMetrics {
  cards: number;
  xzWidth: number;
  minLeafY: number;
  centroidOffset: number;
}

function leafMetrics(result: PlatanusGeometryResult): LeafMetrics {
  const leaf = result.geometry.groups[1]!;
  const pos = result.geometry.getAttribute('position');
  const uv = result.geometry.getAttribute('uv');
  let xMin = Infinity;
  let xMax = -Infinity;
  let zMin = Infinity;
  let zMax = -Infinity;
  let yMin = Infinity;
  let sx = 0;
  let sz = 0;
  let n = 0;
  for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
    if (uv.array[base * 2 + 1]! >= 4) continue; // 果序块跳过（防御性）
    let x = 0;
    let y = 0;
    let z = 0;
    for (let k = 0; k < 6; k++) {
      x += pos.array[(base + k) * 3]!;
      y += pos.array[(base + k) * 3 + 1]!;
      z += pos.array[(base + k) * 3 + 2]!;
    }
    x /= 6;
    y /= 6;
    z /= 6;
    xMin = Math.min(xMin, x);
    xMax = Math.max(xMax, x);
    zMin = Math.min(zMin, z);
    zMax = Math.max(zMax, z);
    yMin = Math.min(yMin, y);
    sx += x;
    sz += z;
    n++;
  }
  return {
    cards: n,
    xzWidth: Math.max(xMax - xMin, zMax - zMin),
    minLeafY: yMin,
    centroidOffset: Math.hypot(sx / n, sz / n),
  };
}

describe('结构计数恒等（8 槽皮面数与 rng 消费恒等的前提）', () => {
  it('8 槽规范种子构建：皮面数全部 24178、levelBranches [7,21,63,189,378]', () => {
    for (let slot = 0; slot < 8; slot++) {
      const { stats } = buildSlot(slot);
      expect(stats.barkTriangles, `slot-${slot} ${SLOT_NAMES[slot]} 皮面数应恒等`).toBe(24178);
      expect(stats.levelBranches, `slot-${slot} ${SLOT_NAMES[slot]} 五级枝数应恒等`).toEqual([7, 21, 63, 189, 378]);
    }
  }, 120000); // 沿先例：套件并行负载下 30s 余量不足，超时上限 120s——断言语义零变化

  it('配置侧锁：结构计数类字段 / 叶卡尺寸域 / barkRelief 逐位同 slot-0；canopyDensity ≤ 1', () => {
    const anchor = PLATANUS_SHAPE_PROFILES[0]!;
    expect(PLATANUS_SHAPE_PROFILES).toHaveLength(8);
    for (let slot = 1; slot < 8; slot++) {
      const p = PLATANUS_SHAPE_PROFILES[slot]!;
      // 结构计数类（改值即改皮面数 / rng 消费次数——槽间禁改）
      expect(p.trunk.radial, `slot-${slot} trunk.radial`).toBe(anchor.trunk.radial);
      expect(p.trunk.segs, `slot-${slot} trunk.segs`).toBe(anchor.trunk.segs);
      expect(p.scaffoldCount, `slot-${slot} scaffoldCount`).toBe(anchor.scaffoldCount);
      expect(p.voidCount, `slot-${slot} voidCount`).toBe(anchor.voidCount);
      expect(p.clustersL5, `slot-${slot} clustersL5`).toBe(anchor.clustersL5);
      expect(p.clustersL4, `slot-${slot} clustersL4`).toBe(anchor.clustersL4);
      expect(p.clusterLeavesL5, `slot-${slot} clusterLeavesL5`).toBe(anchor.clusterLeavesL5);
      expect(p.clusterLeavesL4, `slot-${slot} clusterLeavesL4`).toBe(anchor.clusterLeavesL4);
      expect(
        p.levels.map((l) => `${l.radial}/${l.segs}`),
        `slot-${slot} levels radial/segs`,
      ).toEqual(anchor.levels.map((l) => `${l.radial}/${l.segs}`));
      expect(p.childPlan, `slot-${slot} childPlan`).toEqual(anchor.childPlan);
      // 叶身份（卡尺寸/长宽比域槽间不动——Spec 域收敛）
      expect(p.leafWidthMin, `slot-${slot} leafWidthMin`).toBe(anchor.leafWidthMin);
      expect(p.leafWidthSpan, `slot-${slot} leafWidthSpan`).toBe(anchor.leafWidthSpan);
      expect(p.leafAspectMin, `slot-${slot} leafAspectMin`).toBe(anchor.leafAspectMin);
      expect(p.leafAspectSpan, `slot-${slot} leafAspectSpan`).toBe(anchor.leafAspectSpan);
      // 树皮微起伏槽间恒等（非形态差异维度——slot-0 定义 spread 继承）
      expect(p.barkRelief, `slot-${slot} barkRelief 应 spread 继承 slot-0`).toEqual(anchor.barkRelief);
      // 消费端 Math.min(1,·) 截断——>1 为无效值禁出现
      expect(p.canopyDensity, `slot-${slot} canopyDensity 应 ≤ 1`).toBeLessThanOrEqual(1);
    }
  });
});

describe('确定性（同 seed 同槽逐位复现）', () => {
  it('代表槽（0/3/7）同 seed 两次构建 position 逐位相等 + 全属性 + stats 全等（全 8 槽确定性由 platanusStructure slot-0 锁 + 结构计数恒等 + 本文件路由/差异测试间接覆盖——全量 16 次构建裁剪为 6 次，控制全量套件并行负载，记档）', () => {
    for (const slot of [0, 3, 7]) {
      const a = buildSlot(slot);
      const b = buildSlot(slot);
      for (const attr of ['position', 'normal', 'uv', 'aLeafRand', 'aBend'] as const) {
        expect(
          a.geometry.getAttribute(attr).array,
          `slot-${slot} ${SLOT_NAMES[slot]} 同 seed 应逐位复现`,
        ).toEqual(b.geometry.getAttribute(attr).array);
      }
      expect(a.stats).toEqual(b.stats);
    }
  }, 120000);
});

describe('路由一致（8 组向量即 config 雏形：资产路径 = 几何直调）', () => {
  it('build({seed: morphSeedOf(id, slot)}) 与 buildPlatanusGeometry(mulberry32(seed), PROFILES[slot]) 逐位一致（slot-0/3/6/7——首/中/尾代表位 + 锚点；profileForSeed 为 O(8) 纯查表无槽位特判，记档）', () => {
    for (const slot of [0, 3, 6, 7]) {
      const seed = SEEDS[slot]!;
      const asset = build({ seed });
      sources.push(asset);
      const direct = buildSlot(slot);
      expect(
        asset.geometry.getAttribute('position').array,
        `slot-${slot} ${SLOT_NAMES[slot]} 资产路由应与直调逐位一致`,
      ).toEqual(direct.geometry.getAttribute('position').array);
      expect(asset.geometry.getAttribute('aLeafRand').array).toEqual(
        direct.geometry.getAttribute('aLeafRand').array,
      );
    }
  }, 60000);
});

describe('槽间真实差异（同 seed = SEED0 跨槽对比——差异纯来自形态向量，非 seed 运气）', () => {
  // 说明：方向断言在共同种子 SEED0 下进行——morphSeed 随机流相同，几何差异只能由
  // profile 组合解释（「明显不同、仍属同一树种」的结构化证据）
  const m = (slot: number): LeafMetrics => leafMetrics(buildSlotAt(slot, SEED0));

  it('挺拔 vs 展开：叶幕 XZ 宽度比 ≥ 1.3（实测 ≈1.75——散布互生骨架的槽间对比强于银杏 1.18；幼相窄端 vs 老龄开张圆头端——Spec §6 冠形联动轴两端）', () => {
    const narrow = m(1);
    const broad = m(2);
    expect(narrow.xzWidth).toBeGreaterThan(0);
    expect(broad.xzWidth / narrow.xzWidth, '展开/挺拔 叶幕宽度比').toBeGreaterThanOrEqual(1.3);
  }, 120000);

  it('低冠 vs 高冠：叶卡最低 Y（视觉冠底）差 ≥ 0.9m（实测 ≈1.20m——干高 Inferred 域 0.25–0.35 的槽维度展开）', () => {
    const low = m(4);
    const high = m(5);
    expect(high.minLeafY - low.minLeafY, '高冠-低冠 视觉冠底差').toBeGreaterThanOrEqual(0.9);
  }, 120000);

  it('疏松 vs 丰满：叶卡数比 ≤ 0.85（疏松显著少——crown_transparency 20–30% 带内疏密两端；实测 ≈0.74）', () => {
    const sparse = m(6);
    const full = m(7);
    expect(sparse.cards / full.cards, '疏松/丰满 卡数比').toBeLessThanOrEqual(0.85);
  }, 120000);

  it('偏冠 vs 标准：6 种子面板质心均值比 ≥ 1.15（实测 ≈1.21）；规范种子偏冠槽绝对 ≥ 0.4m 且 ≥ 1.35× 标准槽（实测 1.55m / 标准槽 0.06m 居中——绝对读数为主口径）', () => {
    const panelSeeds = [SEEDS[0]!, SEEDS[1]!, SEEDS[2]!, SEEDS[3]!, 12345, 777777];
    const centroidOf = (slot: number, seed: number): number => leafMetrics(buildSlotAt(slot, seed)).centroidOffset;
    let sumAnchor = 0;
    let sumLopsided = 0;
    for (const seed of panelSeeds) {
      sumAnchor += centroidOf(0, seed);
      sumLopsided += centroidOf(3, seed);
    }
    expect(sumLopsided / sumAnchor, '偏冠/标准 质心面板均值比').toBeGreaterThanOrEqual(1.15);
    // 规范种子（缓存/池路径实际形态流）下的绝对与相对读数
    const canonicalLopsided = centroidOf(3, SEEDS[3]!);
    const canonicalAnchor = centroidOf(0, SEEDS[0]!);
    expect(canonicalLopsided, '规范种子偏冠槽质心绝对偏移').toBeGreaterThanOrEqual(0.4);
    expect(canonicalLopsided / canonicalAnchor, '规范种子偏冠/标准 质心比').toBeGreaterThanOrEqual(1.35);
  }, 60000);

  it('8 槽叶卡数（规范种子）不全相同且各 ≤ 卡上限 7911（总面上限 40000 折算；总面下限由通透/预算带测试锁定——果序入总面账）', () => {
    const counts = new Set<number>();
    for (let slot = 0; slot < 8; slot++) {
      const { stats } = buildSlot(slot);
      counts.add(stats.leafCards);
      expect(stats.leafCards, `slot-${slot} ${SLOT_NAMES[slot]} 叶卡数应 ≤ (40000−24178)/2`).toBeLessThanOrEqual(7911);
    }
    expect(counts.size, '8 槽叶卡数应不全相同（槽身份可辨）').toBeGreaterThan(1);
  }, 120000);
});

describe('物种锚点（规范种子 slot-0——Spec 尺度与比例域）', () => {
  it('总高 ∈ [11.0, 12.8]、bbox 冠幅比 w/h ∈ [0.60, 0.75]、视觉冠底/实高 ∈ [0.25, 0.35]（干高 Inferred 域 per Spec [9]；实测 h 11.63 / w/h 0.683 / 冠底 0.296——2026-09-20 探针）', () => {
    const r = buildSlot(0);
    r.geometry.computeBoundingBox();
    const b = r.geometry.boundingBox!;
    const height = b.max.y - b.min.y;
    const width = Math.max(b.max.x - b.min.x, b.max.z - b.min.z);
    // 视觉冠底 = 叶卡最低 Y（T009.3 口径：挂高段 + 横展角 + upturn + 领导枝链涌现）
    const metrics = leafMetrics(r);
    expect(height, 'slot-0 总高应落 ≈12m 锚域（主代理裁定保守低端——弱推断 per 终审记档）').toBeGreaterThanOrEqual(11.0);
    expect(height).toBeLessThanOrEqual(12.8);
    // 冠幅读向：冠幅比落工程域 0.6–0.75（Spec 0.6–0.8 建模带；终审处置 4 维持——
    // crownWidthRatio 参数 Step 3 探针定档 0.46 的实测验收锁，见 platanusShapeProfile 注释）
    expect(width / height, 'slot-0 bbox 冠幅比应落工程域 0.60–0.75（Spec §3/终审处置 4）').toBeGreaterThanOrEqual(0.6);
    expect(width / height).toBeLessThanOrEqual(0.75);
    const crownBase = metrics.minLeafY / height;
    expect(crownBase, 'slot-0 视觉冠底/实高应落 Inferred 域带 0.25–0.35（六实例首个实测落域）').toBeGreaterThanOrEqual(0.25);
    expect(crownBase).toBeLessThanOrEqual(0.35);
  }, 120000);
});

describe('通透不变量与预算带（规范种子逐槽）', () => {
  it('外壳（q>0.6）保留率 ≥ canopyDensity×0.85（槽自适应）且 ≥ 内核（q<0.4）保留率×1.8（外密内疏）；总面数（皮+叶+果序）落 [27000, 40000]', () => {
    for (let slot = 0; slot < 8; slot++) {
      const { stats } = buildSlot(slot);
      const profile = PLATANUS_SHAPE_PROFILES[slot]!;
      const shellCand = stats.qCandidates[3]! + stats.qCandidates[4]!;
      const shellSurv = stats.qSurvived[3]! + stats.qSurvived[4]!;
      const innerCand = stats.qCandidates[0]! + stats.qCandidates[1]!;
      const innerSurv = stats.qSurvived[0]! + stats.qSurvived[1]!;
      expect(shellCand, `slot-${slot} 外壳应有候选卡`).toBeGreaterThan(0);
      const shellRet = shellSurv / shellCand;
      const innerRet = innerSurv / innerCand;
      // 外壳密度 = canopyDensity×1（q ≥ crownShellStart 密度 = 1）——保留率阈值随槽密度
      // 自适应（疏松槽 0.82 下 ≈0.82 为设计预期；固定阈值对密度缩放槽不适用）
      expect(shellRet, `slot-${slot} ${SLOT_NAMES[slot]} 外壳保留率应 ≥ canopyDensity×0.85`).toBeGreaterThanOrEqual(
        profile.canopyDensity * 0.85,
      );
      // 外密内疏读向（crown_fill_gradient Inferred [9]）
      expect(shellRet / innerRet, `slot-${slot} ${SLOT_NAMES[slot]} 外壳/内核保留率比应 ≥ 1.8`).toBeGreaterThanOrEqual(1.8);
      const total = stats.barkTriangles + stats.leafCards * 2 + stats.fruitTriangles;
      expect(total, `slot-${slot} ${SLOT_NAMES[slot]} 总面数应 ≤ 40000（家族行 High 上限）`).toBeLessThanOrEqual(40000);
      expect(total, `slot-${slot} ${SLOT_NAMES[slot]} 总面数应 ≥ 27000（悬铃木大卡口径参考下沿——低于夏栎 28754 不阻塞，实测锁定见资产模块头）`).toBeGreaterThanOrEqual(27000);
    }
  }, 120000);
});
