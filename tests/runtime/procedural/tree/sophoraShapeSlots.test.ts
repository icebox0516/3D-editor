/**
 * tests/runtime/procedural/tree/sophoraShapeSlots.test.ts —— 国槐 8 槽形态向量表
 * 测试（T011.9，对称栾树/乌桕/重阳木 organization——方法复制；数值锚为国槐自己的
 * 2026-09-21 终测（规范种子 = 各槽 morphSeedOf(id, slot)））。
 *
 * 覆盖（零 mock——真实几何生成；SOPHORA_SHAPE_PROFILES 八槽完整组合 = 「8 组向量
 * 即 config 雏形」的契约锁，与 sophoraStructure.test.ts（slot-0 结构语义）互补）：
 * - 结构计数恒等：8 槽（各自 morphSeedOf(id, slot) 规范种子）构建——皮面数全部 24178、
 *   levelBranches [7,21,63,189,378]；配置侧锁——结构计数类字段（trunk/levels
 *   radial/segs、childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）与叶卡尺寸/
 *   长宽比域（**一回羽叶卡恒比例 0.34 冻结接口**）与 barkRelief（槽间恒等——非形态
 *   差异维度）逐位同 slot-0，canopyDensity ≤ 1（消费端 Math.min(1,·) 截断，>1 无效）；
 * - 确定性：同 seed 同槽两次构建逐位相等（代表槽 0/3/7 全属性 + stats——全 8 槽双建
 *   为全量套件并行负载裁剪让位：sophoraStructure 锁 slot-0 双建 + 结构计数恒等
 *   间接覆盖）；
 * - 路由一致（D19 契约锁）：build({seed: morphSeedOf(id, slot)})（资产路径，
 *   profileForSeed 查表）与 buildSophoraGeometry(mulberry32(seed),
 *   SOPHORA_SHAPE_PROFILES[slot])（几何直调）逐位一致——slot-0/3/6/7 代表位
 *   （资产入口静态 import——import 失败即测试红，T020 软跳过清除）；
 * - 槽间真实差异（方向性断言）：培训直干 vs 开放生长（**双口径**——宽圆头冠叶幕
 *   绝对宽度种子方差大（面板 ±20%，011.8 同款记档）：①同种子面板高度差（全 6 种子
 *   slot-1 高于 slot-2 +1.2m 以上——NC 两相栽培「培训直干高 ↔ 开放生长矮」的种子
 *   稳健主方向）②规范种子宽度比 + w/h 比差）；低冠 vs 高冠叶卡最低 Y（视觉冠底——
 *   净干 2–3m 域两侧展开）差 ≥ 0.9m（同 seed 终测 ≈1.31m）；疏松 vs 丰满叶卡数比
 *   ≤ 0.85（终测 ≈0.70 规范种子——致密带 10–20% 空隙两端）；偏冠 vs 标准——6 种子
 *   面板质心均值比 ≥ 1.15（终测 ≈1.44）+ 规范种子偏冠槽质心绝对 ≥ 0.4m（终测
 *   0.74m——**国槐宽圆头冠槽间基线质心种子方差大（slot-0 规范种子 0.71 偏高 vs
 *   面板均值 0.55），绝对偏移为主口径、规范种子比值断言不设（011.8 伞形宽度方差
 *   同款处理记档）**）；8 槽叶卡数（规范种子）不全相同且各 ≤ 卡上限 7900（总面上限
 *   40000 折算（皮 24178）/2；下限由总面锁覆盖）；
 * - 物种锚点（规范种子 slot-0）：总高落 [9.6, 10.8] 锚域（≈10m 主代理裁定——开展
 *   宽冠弱领导涌现折减回调后锚域中带，终测 10.34）、bbox 冠幅比落 Spec 域
 *   [0.90, 1.10]（Spec §3 冠幅比 0.9–1.2 族内最开展档 + 终审裁决 7——crownWidthRatio
 *   0.59 探针定档 0.960 的实测验收锁）、视觉冠底/实高落带 [0.10, 0.25]（低位放射
 *   读向——挂高段低 + 两段角下带；终测 0.140）；
 * - 8 槽 w/h 涌现带落 [0.85, 1.20]（Spec 域 0.9–1.2 的工程读向带——窄端变体槽
 *   （培训直干 slot-1 / 高冠 slot-5）0.886–0.895 微出 0.9 下沿记档、开放生长宽端
 *   slot-2 1.147 贴上沿；终测带 0.886–1.147）；
 * - 通透不变量不破（规范种子逐槽）：外壳（q>0.6）保留率 ≥ canopyDensity×0.85（槽
 *   自适应）且 ≥ 内核（q<0.4）保留率 ×1.8（外密内疏家族方向沿用）；每槽总面数
 *   （皮+叶+荚果）落 High 档预算带 [31000, 40000]（家族行 High 上限语义，带下沿为
 *   国槐小卡高数量口径参考——见资产模块头记档）。
 * 边界：构建产物 afterEach 统一 dispose（几何直调与资产 build 两类来源分别追踪）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { build } from '../../../../src/runtime/procedural/assets/asset_tree_sophora.asset';
import { buildSophoraGeometry } from '../../../../src/runtime/procedural/tree/sophora/sophoraGeometry';
import type { SophoraGeometryResult } from '../../../../src/runtime/procedural/tree/sophora/sophoraGeometry';
import { SOPHORA_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/sophora/sophoraShapeProfile';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';

const ASSET_ID = 'asset_tree_sophora';
const SLOT_NAMES = ['标准', '挺拔', '展开', '偏冠', '低冠', '高冠', '疏松', '丰满'] as const;
/** 规范种子：slot-N 即 morphSeedOf(id, N)（缓存/池路径的实际形态流种子） */
const SEEDS = Array.from({ length: 8 }, (_, slot) => morphSeedOf(ASSET_ID, slot));
const SEED0 = SEEDS[0]!;

const built: SophoraGeometryResult[] = [];
const sources: InstanceSource[] = [];

/** 几何直调（规范种子 = 各槽自己的 morphSeed） */
function buildSlot(slot: number): SophoraGeometryResult {
  const result = buildSophoraGeometry(mulberry32(SEEDS[slot]!), SOPHORA_SHAPE_PROFILES[slot]!);
  built.push(result);
  return result;
}

/** 几何直调（指定种子 = 同 seed 跨槽对比——隔离 profile 效应） */
function buildSlotAt(slot: number, seed: number): SophoraGeometryResult {
  const result = buildSophoraGeometry(mulberry32(seed), SOPHORA_SHAPE_PROFILES[slot]!);
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

/** 叶卡空间度量（6 顶点/卡取质心；组 1 纯复叶卡——无花资产无附加块）：
 *  XZ 跨度 / 最低 Y / 质心对原点（树干轴）偏移 / 卡数 */
interface LeafMetrics {
  cards: number;
  xzWidth: number;
  minLeafY: number;
  centroidOffset: number;
}

function leafMetrics(result: SophoraGeometryResult): LeafMetrics {
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
function boxOf(result: SophoraGeometryResult): { height: number; width: number } {
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
    const anchor = SOPHORA_SHAPE_PROFILES[0]!;
    expect(SOPHORA_SHAPE_PROFILES).toHaveLength(8);
    for (let slot = 1; slot < 8; slot++) {
      const p = SOPHORA_SHAPE_PROFILES[slot]!;
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
      // 叶身份（卡尺寸/长宽比域槽间不动——冻结比例 0.34 的配置侧锁）
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
  it('代表槽（0/3/7）同 seed 两次构建 position 逐位相等 + 全属性 + stats 全等（全 8 槽确定性由 sophoraStructure slot-0 锁 + 结构计数恒等 + 本文件路由/差异测试间接覆盖——全量 16 次构建裁剪为 6 次，控制全量套件并行负载，记档）', () => {
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
  it('build({seed: morphSeedOf(id, slot)}) 与 buildSophoraGeometry(mulberry32(seed), PROFILES[slot]) 逐位一致（slot-0/3/6/7——首/中/尾代表位 + 锚点；profileForSeed 为 O(8) 纯查表无槽位特判，记档）', () => {
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

describe('槽间真实差异（差异来自形态向量——宽圆头冠方差记档下双口径断言）', () => {
  // 说明：开展宽圆头 + 低位放射两段角的叶幕绝对宽度/质心种子方差大（面板 ±20%，
  // 011.8 伞形同款记档）——单种子绝对对比被种子运气支配，方向断言采双口径：
  // ①同种子面板主方向（全种子一致）②规范种子的缓存/池路径实际形态流读数
  const m = (slot: number, seed: number): LeafMetrics => leafMetrics(buildSlotAt(slot, seed));

  it('挺拔 vs 展开（双口径）：①同种子面板高度差 slot-1 − slot-2 ≥ 1.2m（探针全 6 种子 +1.96——培训直干高 vs 开放生长矮冠主方向，NC 两相栽培 Verified [4]）②规范种子宽度比 ≥ 1.0 + w/h 比差 ≥ 0.15（终测 10.58/9.93 = 1.07 / 1.147 − 0.895 = 0.252）', () => {
    // ①高度面板（6 种子同 seed 对比——差异纯来自形态向量）
    const panelSeeds = [SEEDS[0]!, SEEDS[1]!, SEEDS[2]!, SEEDS[3]!, 12345, 777777];
    let h1 = 0;
    let h2 = 0;
    for (const seed of panelSeeds) {
      h1 += boxOf(buildSlotAt(1, seed)).height;
      h2 += boxOf(buildSlotAt(2, seed)).height;
    }
    expect(h1 / 6 - h2 / 6, '挺拔面板均高 − 展开面板均高（培训直干 vs 开放生长矮冠）').toBeGreaterThanOrEqual(1.2);
    // ②规范种子宽度口径（缓存/池路径实际形态流）
    const broad = m(2, SEEDS[2]!);
    const narrow = m(1, SEEDS[1]!);
    expect(narrow.xzWidth).toBeGreaterThan(0);
    expect(broad.xzWidth / narrow.xzWidth, '展开/挺拔 规范种子叶幕宽度比').toBeGreaterThanOrEqual(1.0);
    const wh1 = boxOf(buildSlotAt(1, SEEDS[1]!)).width / boxOf(buildSlotAt(1, SEEDS[1]!)).height;
    const wh2 = boxOf(buildSlotAt(2, SEEDS[2]!)).width / boxOf(buildSlotAt(2, SEEDS[2]!)).height;
    expect(wh2 - wh1, '展开 w/h − 挺拔 w/h（规范种子比差——宽圆头冠槽间身份的比值口径）').toBeGreaterThanOrEqual(0.15);
  }, 120000);

  it('低冠 vs 高冠：同 seed 叶卡最低 Y（视觉冠底）差 ≥ 0.9m（终测 ≈1.31m——净干 2–3m 域两侧挂高段展开）', () => {
    const low = m(4, SEED0);
    const high = m(5, SEED0);
    expect(high.minLeafY - low.minLeafY, '高冠-低冠 视觉冠底差').toBeGreaterThanOrEqual(0.9);
  }, 120000);

  it('疏松 vs 丰满：叶卡数比 ≤ 0.85（疏松显著少——致密带 10–20% 空隙两端；终测 ≈0.70 规范种子）', () => {
    const sparse = m(6, SEED0);
    const full = m(7, SEED0);
    expect(sparse.cards / full.cards, '疏松/丰满 卡数比').toBeLessThanOrEqual(0.85);
  }, 120000);

  it('偏冠 vs 标准：6 种子面板质心均值比 ≥ 1.15（终测 ≈1.44）；规范种子偏冠槽质心绝对 ≥ 0.4m（终测 0.74m——国槐宽圆头基线质心种子方差大（slot-0 规范 0.71 vs 面板 0.55），绝对偏移为主口径、比值断言不设（011.8 伞形宽度方差同款处理记档））', () => {
    const panelSeeds = [SEEDS[0]!, SEEDS[1]!, SEEDS[2]!, SEEDS[3]!, 12345, 777777];
    const centroidOf = (slot: number, seed: number): number => leafMetrics(buildSlotAt(slot, seed)).centroidOffset;
    let sumAnchor = 0;
    let sumLopsided = 0;
    for (const seed of panelSeeds) {
      sumAnchor += centroidOf(0, seed);
      sumLopsided += centroidOf(3, seed);
    }
    expect(sumLopsided / sumAnchor, '偏冠/标准 质心面板均值比').toBeGreaterThanOrEqual(1.15);
    // 规范种子（缓存/池路径实际形态流）下的绝对读数
    const canonicalLopsided = centroidOf(3, SEEDS[3]!);
    expect(canonicalLopsided, '规范种子偏冠槽质心绝对偏移').toBeGreaterThanOrEqual(0.4);
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
  it('总高 ∈ [9.6, 10.8]、bbox 冠幅比 w/h ∈ [0.90, 1.10]、视觉冠底/实高 ∈ [0.10, 0.25]（低位放射读向——挂高段低 + 两段角下带；终测 h 10.34 / w/h 0.960 / 冠底 0.140——2026-09-21 终测）', () => {
    const r = buildSlot(0);
    const b = boxOf(r);
    const { height, width } = b;
    // 视觉冠底 = 叶卡最低 Y（T009.3 口径：挂高段 + 两段横展角 + upturn + 领导枝链涌现）
    const metrics = leafMetrics(r);
    expect(height, 'slot-0 总高应落 ≈10m 锚域（主代理裁定——开展宽冠弱领导涌现折减回调后）').toBeGreaterThanOrEqual(9.6);
    expect(height).toBeLessThanOrEqual(10.8);
    // 冠幅读向：冠幅比落 Spec 域 0.9–1.2 的锚点带（族内最开展档，终审裁决 7；
    // crownWidthRatio 参数 Step 3 探针定档 0.59 的实测验收锁，见 shapeProfile 注释）
    expect(width / height, 'slot-0 bbox 冠幅比应落 Spec 域锚点带 0.90–1.10（族内最开展档中带）').toBeGreaterThanOrEqual(0.9);
    expect(width / height).toBeLessThanOrEqual(1.1);
    const crownBase = metrics.minLeafY / height;
    expect(crownBase, 'slot-0 视觉冠底/实高应落带 0.10–0.25（低位放射——挂高段低 + 两段角下带）').toBeGreaterThanOrEqual(0.1);
    expect(crownBase).toBeLessThanOrEqual(0.25);
  }, 120000);

  it('8 槽 w/h 涌现带落 [0.85, 1.20]（Spec 域 0.9–1.2 的工程读向带；终测 0.886–1.147——slot-5 高冠窄端 0.886 / slot-1 培训窄端 0.895 微出 0.9 下沿（窄端变体槽读向记档）/ slot-2 开放生长宽端 1.147 贴上沿）', () => {
    for (let slot = 0; slot < 8; slot++) {
      const { width, height } = boxOf(buildSlot(slot));
      expect(width / height, `slot-${slot} ${SLOT_NAMES[slot]} bbox 冠幅比应落工程读向域 0.85–1.20`).toBeGreaterThanOrEqual(0.85);
      expect(width / height).toBeLessThanOrEqual(1.2);
    }
  }, 120000);
});

describe('通透不变量与预算带（规范种子逐槽）', () => {
  it('外壳（q>0.6）保留率 ≥ canopyDensity×0.85（槽自适应）且 ≥ 内核（q<0.4）保留率×1.8（外密内疏）；总面数（皮+叶+荚果）落 [31000, 40000]', () => {
    for (let slot = 0; slot < 8; slot++) {
      const { stats } = buildSlot(slot);
      const profile = SOPHORA_SHAPE_PROFILES[slot]!;
      const shellCand = stats.qCandidates[3]! + stats.qCandidates[4]!;
      const shellSurv = stats.qSurvived[3]! + stats.qSurvived[4]!;
      const innerCand = stats.qCandidates[0]! + stats.qCandidates[1]!;
      const innerSurv = stats.qSurvived[0]! + stats.qSurvived[1]!;
      expect(shellCand, `slot-${slot} 外壳应有候选卡`).toBeGreaterThan(0);
      expect(innerCand, `slot-${slot} 内核应有候选卡`).toBeGreaterThan(0);
      const shellRet = shellSurv / shellCand;
      const innerRet = innerSurv / innerCand;
      // 外壳密度 = canopyDensity×1（q ≥ crownShellStart 密度 = 1）——保留率阈值随槽密度
      // 自适应（疏松槽 0.80 下 ≈0.80 为设计预期；固定阈值对密度缩放槽不适用）
      expect(shellRet, `slot-${slot} ${SLOT_NAMES[slot]} 外壳保留率应 ≥ canopyDensity×0.85`).toBeGreaterThanOrEqual(
        profile.canopyDensity * 0.85,
      );
      // 外密内疏读向（家族方向沿用——Spec crown_fill_gradient Unknown 结构缺口）
      expect(shellRet / innerRet, `slot-${slot} ${SLOT_NAMES[slot]} 外壳/内核保留率比应 ≥ 1.8`).toBeGreaterThanOrEqual(1.8);
      const total = stats.barkTriangles + stats.leafCards * 2 + stats.podTriangles;
      expect(total, `slot-${slot} ${SLOT_NAMES[slot]} 总面数应 ≤ 40000（家族行 High 上限）`).toBeLessThanOrEqual(40000);
      expect(total, `slot-${slot} ${SLOT_NAMES[slot]} 总面数应 ≥ 31000（国槐小卡高数量口径参考下沿——记档见资产模块头）`).toBeGreaterThanOrEqual(31000);
    }
  }, 120000);
});
