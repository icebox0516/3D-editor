/**
 * tests/runtime/procedural/tree/bischofiaShapeSlots.test.ts —— 重阳木 8 槽形态向量表
 * 测试（T011.8，对称栾树/乌桕 organization——方法复制；数值锚为重阳木自己的
 * 2026-09-21 终测（规范种子 = 各槽 morphSeedOf(id, slot)））。
 *
 * 覆盖（零 mock——真实几何生成；BISCHOFIA_SHAPE_PROFILES 八槽完整组合 = 「8 组向量
 * 即 config 雏形」的契约锁，与 bischofiaStructure.test.ts（slot-0 结构语义）互补）：
 * - 结构计数恒等：8 槽（各自 morphSeedOf(id, slot) 规范种子）构建——皮面数全部 24178、
 *   levelBranches [7,21,63,189,378]；配置侧锁——结构计数类字段（trunk/levels
 *   radial/segs、childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）与叶卡尺寸/
 *   长宽比域（**三出复叶卡恒比例 0.75 冻结接口**）与 barkRelief（槽间恒等——非形态
 *   差异维度）逐位同 slot-0，canopyDensity ≤ 1（消费端 Math.min(1,·) 截断，>1 无效）；
 * - 确定性：同 seed 同槽两次构建逐位相等（代表槽 0/3/7 全属性 + stats——全 8 槽双建
 *   为全量套件并行负载裁剪让位：bischofiaStructure 锁 slot-0 双建 + 结构计数恒等
 *   间接覆盖）；
 * - 路由一致（D19 契约锁）：build({seed: morphSeedOf(id, slot)})（资产路径，
 *   profileForSeed 查表）与 buildBischofiaGeometry(mulberry32(seed),
 *   BISCHOFIA_SHAPE_PROFILES[slot])（几何直调）逐位一致——slot-0/3/6/7 代表位
 *   （资产入口静态 import——import 失败即测试红，T020 软跳过清除）；
 * - 槽间真实差异（方向性断言）：**伞形两段角的叶幕绝对宽度种子方差大（面板 ±20%，
 *   2026-09-21 探针记档）——速生窄端（slot-1）与幼龄开张宽端（slot-2）的方向断言采
 *   双口径：①同种子面板高度差（全 10 种子 slot-1 高于 slot-2 +1.4–2.0m——速生上探
 *   vs 幼龄矮冠的主方向读数，种子稳健）②规范种子宽度比与 w/h 比差（宽度方向的缓存/
 *   池路径实际形态流口径）**；低冠 vs 高冠叶卡最低 Y（视觉冠底——干高 0.25–0.33 域
 *   两侧展开）差 ≥ 0.9m（同 seed 终测 ≈1.84m）；疏松 vs 丰满叶卡数比 ≤ 0.85（终测
 *   ≈0.663 规范种子 / 0.688 同 seed——中密带疏密两端）；偏冠 vs 标准——6 种子面板质心
 *   均值比 ≥ 1.15（终测 ≈1.45）；规范种子下偏冠槽质心绝对 ≥ 0.4m 且 ≥ 1.25× 标准槽
 *   （终测 1.20m / slot-0 规范种子质心 0.92m——绝对读数为主口径）；8 槽叶卡数（规范
 *   种子）不全相同且各 ≤ 卡上限 7900（总面上限 40000 折算（皮 24178）/2；下限由总面
 *   锁覆盖）；
 * - 物种锚点（规范种子 slot-0）：总高落 9.0–11.0m 锚域（≈10m 主代理裁定——速生伞形
 *   开展与栾树同量级，终测 9.90）、bbox 冠幅比落 Spec 域 0.80–1.00（Spec §3 冠幅比
 *   0.8–1.0 + 终审裁决 3——Step 3 探针定档 0.852 的实测验收锁）、视觉冠底/实高落带
 *   [0.12, 0.28]（干高 0.25–0.33 form-a 双问域）；
 * - 8 槽 w/h 涌现带落工程域 0.70–1.00（家族行——briefing 生产口径；终测带
 *   0.733–0.992：slot-1 速生窄端贴下沿 / slot-2 幼龄开张宽端贴上沿）；
 * - 通透不变量不破（规范种子逐槽）：外壳（q>0.6）保留率 ≥ canopyDensity×0.85（槽
 *   自适应）且 ≥ 内核（q<0.4）保留率 ×1.8（外密内疏家族方向沿用）；每槽总面数（皮+
 *   叶）落 High 档预算带 [27000, 40000]（家族行 High 上限语义，带下沿为重阳木复叶
 *   中卡口径参考——见资产模块头记档）。
 * 边界：构建产物 afterEach 统一 dispose（几何直调与资产 build 两类来源分别追踪）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { build } from '../../../../src/runtime/procedural/assets/asset_tree_bischofia.asset';
import { buildBischofiaGeometry } from '../../../../src/runtime/procedural/tree/bischofia/bischofiaGeometry';
import type { BischofiaGeometryResult } from '../../../../src/runtime/procedural/tree/bischofia/bischofiaGeometry';
import { BISCHOFIA_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/bischofia/bischofiaShapeProfile';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';

const ASSET_ID = 'asset_tree_bischofia';
const SLOT_NAMES = ['标准', '挺拔', '展开', '偏冠', '低冠', '高冠', '疏松', '丰满'] as const;
/** 规范种子：slot-N 即 morphSeedOf(id, N)（缓存/池路径的实际形态流种子） */
const SEEDS = Array.from({ length: 8 }, (_, slot) => morphSeedOf(ASSET_ID, slot));
const SEED0 = SEEDS[0]!;

const built: BischofiaGeometryResult[] = [];
const sources: InstanceSource[] = [];

/** 几何直调（规范种子 = 各槽自己的 morphSeed） */
function buildSlot(slot: number): BischofiaGeometryResult {
  const result = buildBischofiaGeometry(mulberry32(SEEDS[slot]!), BISCHOFIA_SHAPE_PROFILES[slot]!);
  built.push(result);
  return result;
}

/** 几何直调（指定种子 = 同 seed 跨槽对比——隔离 profile 效应） */
function buildSlotAt(slot: number, seed: number): BischofiaGeometryResult {
  const result = buildBischofiaGeometry(mulberry32(seed), BISCHOFIA_SHAPE_PROFILES[slot]!);
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

/** 叶卡空间度量（6 顶点/卡取质心；组 1 纯复叶卡——无花果资产无附加块）：
 *  XZ 跨度 / 最低 Y / 质心对原点（树干轴）偏移 / 卡数 */
interface LeafMetrics {
  cards: number;
  xzWidth: number;
  minLeafY: number;
  centroidOffset: number;
}

function leafMetrics(result: BischofiaGeometryResult): LeafMetrics {
  const leaf = result.geometry.groups[1]!;
  const pos = result.geometry.getAttribute('position');
  let xMin = Infinity;
  let xMax = -Infinity;
  let zMin = Infinity;
  let zMax = -Infinity;
  let yMin = Infinity;
  let sx = 0;
  let sz = 0;
  let n = 0;
  for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
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

/** bbox 度量（总高 / XZ 跨度） */
function boxOf(result: BischofiaGeometryResult): { height: number; width: number } {
  result.geometry.computeBoundingBox();
  const b = result.geometry.boundingBox!;
  return {
    height: b.max.y - b.min.y,
    width: Math.max(b.max.x - b.min.x, b.max.z - b.min.z),
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
    const anchor = BISCHOFIA_SHAPE_PROFILES[0]!;
    expect(BISCHOFIA_SHAPE_PROFILES).toHaveLength(8);
    for (let slot = 1; slot < 8; slot++) {
      const p = BISCHOFIA_SHAPE_PROFILES[slot]!;
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
      // 叶身份（卡尺寸/长宽比域槽间不动——冻结比例 0.75 的配置侧锁）
      expect(p.leafWidthMin, `slot-${slot} leafWidthMin`).toBe(anchor.leafWidthMin);
      expect(p.leafWidthSpan, `slot-${slot} leafWidthSpan`).toBe(anchor.leafWidthSpan);
      expect(p.leafAspectMin, `slot-${slot} leafAspectMin`).toBe(anchor.leafAspectMin);
      expect(p.leafAspectSpan, `slot-${slot} leafAspectSpan（恒比例——span 必须为 0）`).toBe(anchor.leafAspectSpan);
      // 树皮微起伏槽间恒等（非形态差异维度——slot-0 定义 spread 继承）
      expect(p.barkRelief, `slot-${slot} barkRelief 应 spread 继承 slot-0`).toEqual(anchor.barkRelief);
      // 消费端 Math.min(1,·) 截断——>1 为无效值禁出现
      expect(p.canopyDensity, `slot-${slot} canopyDensity 应 ≤ 1`).toBeLessThanOrEqual(1);
    }
  });
});

describe('确定性（同 seed 同槽逐位复现）', () => {
  it('代表槽（0/3/7）同 seed 两次构建 position 逐位相等 + 全属性 + stats 全等（全 8 槽确定性由 bischofiaStructure slot-0 锁 + 结构计数恒等 + 本文件路由/差异测试间接覆盖——全量 16 次构建裁剪为 6 次，控制全量套件并行负载，记档）', () => {
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
  it('build({seed: morphSeedOf(id, slot)}) 与 buildBischofiaGeometry(mulberry32(seed), PROFILES[slot]) 逐位一致（slot-0/3/6/7——首/中/尾代表位 + 锚点；profileForSeed 为 O(8) 纯查表无槽位特判，记档）', () => {
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

describe('槽间真实差异（差异来自形态向量——伞形两段角方差记档下双口径断言）', () => {
  // 说明：伞形两段角（下带近水平 70–90°）的叶幕绝对宽度种子方差大（面板 ±20%，
  // 2026-09-21 探针记档）——单种子绝对宽度对比被种子运气支配（探针实测同 seed 反向
  // 样本），方向断言采双口径：①同种子面板高度差（主方向——全种子一致）②规范种子
  // 宽度比 + w/h 比差（宽度方向的实际形态流口径）
  const m = (slot: number, seed: number): LeafMetrics => leafMetrics(buildSlotAt(slot, seed));

  it('挺拔 vs 展开（双口径）：①同种子面板高度差 slot-1 − slot-2 ≥ 1.2m（探针全 10 种子 +1.4–2.0m——速生上探 vs 幼龄矮冠主方向）②规范种子宽度比 ≥ 1.15 + w/h 比差 ≥ 0.10（终测 9.64/7.86 = 1.23 / 0.992 − 0.733 = 0.259）', () => {
    // ①高度面板（6 种子同 seed 对比——差异纯来自形态向量）
    const panelSeeds = [SEEDS[0]!, SEEDS[1]!, SEEDS[2]!, SEEDS[3]!, 12345, 777777];
    let h1 = 0;
    let h2 = 0;
    for (const seed of panelSeeds) {
      h1 += boxOf(buildSlotAt(1, seed)).height;
      h2 += boxOf(buildSlotAt(2, seed)).height;
    }
    expect(h1 / 6 - h2 / 6, '挺拔面板均高 − 展开面板均高（速生上探 vs 幼龄开张矮冠）').toBeGreaterThanOrEqual(1.2);
    // ②规范种子宽度口径（缓存/池路径实际形态流）
    const broad = m(2, SEEDS[2]!);
    const narrow = m(1, SEEDS[1]!);
    expect(narrow.xzWidth).toBeGreaterThan(0);
    expect(broad.xzWidth / narrow.xzWidth, '展开/挺拔 规范种子叶幕宽度比').toBeGreaterThanOrEqual(1.15);
    const wh1 = boxOf(buildSlotAt(1, SEEDS[1]!)).width / boxOf(buildSlotAt(1, SEEDS[1]!)).height;
    const wh2 = boxOf(buildSlotAt(2, SEEDS[2]!)).width / boxOf(buildSlotAt(2, SEEDS[2]!)).height;
    expect(wh2 - wh1, '展开 w/h − 挺拔 w/h（规范种子比差——伞形冠槽间身份的比值口径）').toBeGreaterThanOrEqual(0.1);
  }, 120000);

  it('低冠 vs 高冠：同 seed 叶卡最低 Y（视觉冠底）差 ≥ 0.9m（终测 ≈1.84m——干高 0.25–0.33 域两侧挂高段展开）', () => {
    const low = m(4, SEED0);
    const high = m(5, SEED0);
    expect(high.minLeafY - low.minLeafY, '高冠-低冠 视觉冠底差').toBeGreaterThanOrEqual(0.9);
  }, 120000);

  it('疏松 vs 丰满：叶卡数比 ≤ 0.85（疏松显著少——中密带疏密两端；终测 ≈0.663 规范种子 / 0.688 同 seed）', () => {
    const sparse = m(6, SEED0);
    const full = m(7, SEED0);
    expect(sparse.cards / full.cards, '疏松/丰满 卡数比').toBeLessThanOrEqual(0.85);
  }, 120000);

  it('偏冠 vs 标准：6 种子面板质心均值比 ≥ 1.15（终测 ≈1.45）；规范种子偏冠槽绝对 ≥ 0.4m 且 ≥ 1.25× 标准槽（终测 1.20m / 标准槽 0.92m——绝对读数为主口径）', () => {
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
    expect(canonicalLopsided / canonicalAnchor, '规范种子偏冠/标准 质心比').toBeGreaterThanOrEqual(1.25);
  }, 60000);

  it('8 槽叶卡数（规范种子）不全相同且各 ≤ 卡上限 7900（总面上限 40000 折算（皮 24178）/2；总面下限由通透/预算带测试锁定）', () => {
    const counts = new Set<number>();
    for (let slot = 0; slot < 8; slot++) {
      const { stats } = buildSlot(slot);
      counts.add(stats.leafCards);
      expect(stats.leafCards, `slot-${slot} ${SLOT_NAMES[slot]} 叶卡数应 ≤ 7900`).toBeLessThanOrEqual(7900);
    }
    expect(counts.size, '8 槽叶卡数应不全相同（槽身份可辨）').toBeGreaterThan(1);
  }, 120000);
});

describe('物种锚点（规范种子 slot-0——Spec 尺度与比例域）', () => {
  it('总高 ∈ [9.0, 11.0]、bbox 冠幅比 w/h ∈ [0.80, 1.00]、视觉冠底/实高 ∈ [0.12, 0.28]（干高 0.25–0.33 form-a 双问域 per Spec；终测 h 9.90 / w/h 0.852 / 冠底 0.177——2026-09-21 终测）', () => {
    const r = buildSlot(0);
    const b = boxOf(r);
    const { height, width } = b;
    // 视觉冠底 = 叶卡最低 Y（T009.3 口径：挂高段 + 两段横展角 + upturn + 领导枝链涌现）
    const metrics = leafMetrics(r);
    expect(height, 'slot-0 总高应落 ≈10m 锚域（主代理裁定——速生伞形开展与栾树同量级）').toBeGreaterThanOrEqual(9.0);
    expect(height).toBeLessThanOrEqual(11.0);
    // 冠幅读向：冠幅比落 Spec 域 0.8–1.0（Spec §3/终审裁决 3——伞形开展等幅族；
    // crownWidthRatio 参数 Step 3 探针定档 0.48 的实测验收锁，见 shapeProfile 注释）
    expect(width / height, 'slot-0 bbox 冠幅比应落 Spec 域 0.80–1.00（Spec §3 冠幅比 0.8–1.0）').toBeGreaterThanOrEqual(0.8);
    expect(width / height).toBeLessThanOrEqual(1.0);
    const crownBase = metrics.minLeafY / height;
    expect(crownBase, 'slot-0 视觉冠底/实高应落带 0.12–0.28（干高 0.25–0.33 域 + form-a 双问）').toBeGreaterThanOrEqual(0.12);
    expect(crownBase).toBeLessThanOrEqual(0.28);
  }, 120000);

  it('8 槽 w/h 涌现带落工程域 0.70–1.00（家族行；终测 0.733–0.992——slot-1 速生窄端贴下沿 / slot-2 幼龄开张宽端贴上沿，伞形方差记档见上）', () => {
    for (let slot = 0; slot < 8; slot++) {
      const { width, height } = boxOf(buildSlot(slot));
      expect(width / height, `slot-${slot} ${SLOT_NAMES[slot]} bbox 冠幅比应落工程域 0.70–1.00`).toBeGreaterThanOrEqual(0.7);
      expect(width / height).toBeLessThanOrEqual(1.0);
    }
  }, 120000);
});

describe('通透不变量与预算带（规范种子逐槽）', () => {
  it('外壳（q>0.6）保留率 ≥ canopyDensity×0.85（槽自适应）且 ≥ 内核（q<0.4）保留率×1.8（外密内疏）；总面数（皮+叶）落 [27000, 40000]', () => {
    for (let slot = 0; slot < 8; slot++) {
      const { stats } = buildSlot(slot);
      const profile = BISCHOFIA_SHAPE_PROFILES[slot]!;
      const shellCand = stats.qCandidates[3]! + stats.qCandidates[4]!;
      const shellSurv = stats.qSurvived[3]! + stats.qSurvived[4]!;
      const innerCand = stats.qCandidates[0]! + stats.qCandidates[1]!;
      const innerSurv = stats.qSurvived[0]! + stats.qSurvived[1]!;
      expect(shellCand, `slot-${slot} 外壳应有候选卡`).toBeGreaterThan(0);
      expect(innerCand, `slot-${slot} 内核应有候选卡`).toBeGreaterThan(0);
      const shellRet = shellSurv / shellCand;
      const innerRet = innerSurv / innerCand;
      // 外壳密度 = canopyDensity×1（q ≥ crownShellStart 密度 = 1）——保留率阈值随槽密度
      // 自适应（疏松槽 0.82 下 ≈0.82 为设计预期；固定阈值对密度缩放槽不适用）
      expect(shellRet, `slot-${slot} ${SLOT_NAMES[slot]} 外壳保留率应 ≥ canopyDensity×0.85`).toBeGreaterThanOrEqual(
        profile.canopyDensity * 0.85,
      );
      // 外密内疏读向（家族方向沿用——Spec crown_fill_gradient Unknown 结构缺口）
      expect(shellRet / innerRet, `slot-${slot} ${SLOT_NAMES[slot]} 外壳/内核保留率比应 ≥ 1.8`).toBeGreaterThanOrEqual(1.8);
      const total = stats.barkTriangles + stats.leafCards * 2;
      expect(total, `slot-${slot} ${SLOT_NAMES[slot]} 总面数应 ≤ 40000（家族行 High 上限）`).toBeLessThanOrEqual(40000);
      expect(total, `slot-${slot} ${SLOT_NAMES[slot]} 总面数应 ≥ 27000（重阳木复叶中卡口径参考下沿——记档见资产模块头）`).toBeGreaterThanOrEqual(27000);
    }
  }, 120000);
});
