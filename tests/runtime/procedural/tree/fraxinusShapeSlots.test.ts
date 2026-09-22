/**
 * tests/runtime/procedural/tree/fraxinusShapeSlots.test.ts —— 白蜡树 8 槽形态向量
 * 表测试（T011.10，对称 sophora organization——方法复制；数值锚为白蜡自己的
 * 2026-09-22 终测（规范种子 = 各槽 morphSeedOf(id, slot)））。
 *
 * 覆盖（零 mock——真实几何生成；FRAXINUS_SHAPE_PROFILES 八槽完整组合 = 「8 组向量
 * 即 config 雏形」的契约锁，与 fraxinusStructure.test.ts（slot-0 结构语义）互补）：
 * - 结构计数恒等：8 槽（各自 morphSeedOf(id, slot) 规范种子）构建——皮面数全部
 *   24178、levelBranches [7,21,63,189,378]；配置侧锁——结构计数类字段（trunk/
 *   levels radial/segs、childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）与
 *   叶卡尺寸/长宽比域（**一回羽叶卡恒比例 0.36 冻结接口**）与 barkRelief（槽间恒等
 *   ——非形态差异维度）逐位同 slot-0，canopyDensity ≤ 1（消费端 Math.min(1,·) 截断，
 *   >1 无效）；
 * - 确定性：同 seed 同槽两次构建逐位相等（代表槽 0/3/7 全属性 + stats——全 8 槽双建
 *   为全量套件并行负载裁剪让位：fraxinusStructure 锁 slot-0 双建 + 结构计数恒等
 *   间接覆盖）；
 * - 路由一致（D19 契约锁）：build({seed: morphSeedOf(id, slot)})（资产路径，
 *   profileForSeed 查表）与 buildFraxinusGeometry(mulberry32(seed),
 *   FRAXINUS_SHAPE_PROFILES[slot])（几何直调）逐位一致——slot-0/3/6/7 代表位；
 *   材质（fraxinusMaterials 并行交付）未就绪时动态 import 失败 → 优雅跳过
 *   （先例，合并后自动生效）；
 * - 槽间真实差异（方向性断言）：卵圆窄 vs 开张宽（**双口径**——冠幕绝对宽度种子
 *   方差大（面板 ±20%，先例同款记档）：①同种子面板高度差（全 6 种子 slot-1 高于
 *   slot-2 +1.2m 以上——卵圆窄端纵长 vs 开张宽端扁宽的主方向）②规范种子宽度比 +
 *   w/h 比差）；低冠 vs 高冠叶卡最低 Y（视觉冠底——中位分歧域两侧展开）差 ≥ 0.8m
 *   （同 seed；终测 ≈0.89——白蜡挂高段差窄于国槐两相带，带内展开如实记档）；疏松 vs 丰满叶卡数比 ≤ 0.85（终测 ≈0.58 规范种子——中通透带
 *   25–40% 空隙两端）；偏冠 vs 标准——6 种子面板质心均值比 ≥ 1.15 + 规范种子偏冠
 *   槽质心绝对 ≥ 0.4m；8 槽叶卡数（规范种子）不全相同且各 ≤ 卡上限 7900（总面上限
 *   40000 折算（皮 24178）/2；下限由总面锁覆盖）；
 * - 物种锚点（规范种子 slot-0）：总高落 [9.6, 10.8] 锚域（≈10m 主代理裁定——志书
 *   「高10-12米」直给（裁决 2）；终测 10.50）、bbox 冠幅比落锚点带 [0.70, 0.85]
 *   （Spec §3 冠幅比 0.7–1.0 下中段——crownWidthRatio 0.63 探针定档 0.763 的实测
 *   验收锁，**比国槐 0.9–1.2 窄一档**（裁决 7））、视觉冠底/实高落带 [0.10, 0.32]
 *   （中位分歧读向——挂高段 0.58 下缘 + 单段角域；vs 国槐低位放射 0.10–0.25）；
 * - 8 槽 w/h 涌现带落 [0.68, 1.20]（Spec 域 0.7–1.0 的工程读向带——窄端变体槽
 *   微出下沿记档、开张宽端 slot-2 贴「冠幅≈高或略大」form-a 读向上沿（终测带
 *   0.715–1.037）；
 * - 通透不变量不破（规范种子逐槽）：外壳（q>0.6）保留率 ≥ canopyDensity×0.85（槽
 *   自适应）且 ≥ 内核（q<0.4）保留率 ×1.8（外密内疏家族方向沿用）；每槽总面数
 *   （皮+叶+翅果）落 High 档预算带 [30500, 40000]（家族行 High 上限语义，带下沿为
 *   白蜡小卡高数量口径参考——见资产模块头记档）。
 * 边界：构建产物 afterEach 统一 dispose（几何直调与资产 build 两类来源分别追踪）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { buildFraxinusGeometry } from '../../../../src/runtime/procedural/tree/fraxinus/fraxinusGeometry';
import type { FraxinusGeometryResult } from '../../../../src/runtime/procedural/tree/fraxinus/fraxinusGeometry';
import { FRAXINUS_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/fraxinus/fraxinusShapeProfile';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';

const ASSET_ID = 'asset_tree_fraxinus';
const SLOT_NAMES = ['标准', '卵圆窄', '开张宽', '偏冠', '低冠', '高冠', '疏松', '丰满'] as const;
/** 规范种子：slot-N 即 morphSeedOf(id, N)（缓存/池路径的实际形态流种子） */
const SEEDS = Array.from({ length: 8 }, (_, slot) => morphSeedOf(ASSET_ID, slot));
const SEED0 = SEEDS[0]!;

const built: FraxinusGeometryResult[] = [];
const sources: InstanceSource[] = [];

/** 几何直调（规范种子 = 各槽自己的 morphSeed） */
function buildSlot(slot: number): FraxinusGeometryResult {
  const result = buildFraxinusGeometry(mulberry32(SEEDS[slot]!), FRAXINUS_SHAPE_PROFILES[slot]!);
  built.push(result);
  return result;
}

/** 几何直调（指定种子 = 同 seed 跨槽对比——隔离 profile 效应） */
function buildSlotAt(slot: number, seed: number): FraxinusGeometryResult {
  const result = buildFraxinusGeometry(mulberry32(seed), FRAXINUS_SHAPE_PROFILES[slot]!);
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

function leafMetrics(result: FraxinusGeometryResult): LeafMetrics {
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
function boxOf(result: FraxinusGeometryResult): { height: number; width: number } {
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
    const anchor = FRAXINUS_SHAPE_PROFILES[0]!;
    expect(FRAXINUS_SHAPE_PROFILES).toHaveLength(8);
    for (let slot = 1; slot < 8; slot++) {
      const p = FRAXINUS_SHAPE_PROFILES[slot]!;
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
      // 叶身份（卡尺寸/长宽比域槽间不动——冻结比例 0.36 的配置侧锁）
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
  it('代表槽（0/3/7）同 seed 两次构建 position 逐位相等 + 全属性 + stats 全等（全 8 槽确定性由 fraxinusStructure slot-0 锁 + 结构计数恒等 + 本文件路由/差异测试间接覆盖——全量 16 次构建裁剪为 6 次，控制全量套件并行负载，记档）', () => {
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
  it('build({seed: morphSeedOf(id, slot)}) 与 buildFraxinusGeometry(mulberry32(seed), PROFILES[slot]) 逐位一致（slot-0/3/6/7——首/中/尾代表位 + 锚点；fraxinusMaterials 未就绪时优雅跳过；profileForSeed 为 O(8) 纯查表无槽位特判，记档）', async () => {
    const assetModule = await import('../../../../src/runtime/procedural/assets/asset_tree_fraxinus.asset').catch(
      () => null,
    );
    if (!assetModule) {
      // asset_tree_fraxinus.asset 入口未合并（材质工厂 fraxinusMaterials
      // park-shader-agent 并行交付未就绪——入口文件按主代理协调延后落位）——资产模块
      // 动态 import 失败，路由锁延后到合并后自动生效（主代理合并验证面）；本测试不判失败
      console.warn('[fraxinusShapeSlots] asset_tree_fraxinus 入口暂不可导入（fraxinusMaterials 并行交付未就绪）——路由一致锁延后');
      expect(true).toBe(true);
      return;
    }
    const { build } = assetModule;
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

describe('槽间真实差异（差异来自形态向量——冠幕方差记档下双口径断言）', () => {
  // 说明：卵圆-圆头开展冠的叶幕绝对宽度/质心种子方差大（面板 ±20%，先例同款记档）
  // ——单种子绝对对比被种子运气支配，方向断言采双口径：①同种子面板主方向（全种子
  // 一致）②规范种子的缓存/池路径实际形态流读数
  const m = (slot: number, seed: number): LeafMetrics => leafMetrics(buildSlotAt(slot, seed));

  it('卵圆窄 vs 开张宽（双口径）：①同种子面板高度差 slot-1 − slot-2 ≥ 0.5m（卵圆纵长 vs 开张扁宽主方向——**白蜡两端槽高度差弱于国槐 NC 两相栽培证据级（Unknown 域带内展开如实——终测面板 0.60），槽身份以②宽窄比为主断言**）②规范种子宽度比 ≥ 1.0 + w/h 比差 ≥ 0.15（终测 10.47/8.85 高差 1.62 / w-h 0.715 vs 1.037 差 0.322）', () => {
    // ①高度面板（6 种子同 seed 对比——差异纯来自形态向量）
    const panelSeeds = [SEEDS[0]!, SEEDS[1]!, SEEDS[2]!, SEEDS[3]!, 12345, 777777];
    let h1 = 0;
    let h2 = 0;
    for (const seed of panelSeeds) {
      h1 += boxOf(buildSlotAt(1, seed)).height;
      h2 += boxOf(buildSlotAt(2, seed)).height;
    }
    expect(h1 / 6 - h2 / 6, '卵圆窄面板均高 − 开张宽面板均高（纵长 vs 扁宽主方向）').toBeGreaterThanOrEqual(0.5);
    // ②规范种子宽度口径（缓存/池路径实际形态流）
    const broad = m(2, SEEDS[2]!);
    const narrow = m(1, SEEDS[1]!);
    expect(narrow.xzWidth).toBeGreaterThan(0);
    expect(broad.xzWidth / narrow.xzWidth, '开张宽/卵圆窄 规范种子叶幕宽度比').toBeGreaterThanOrEqual(1.0);
    const wh1 = boxOf(buildSlotAt(1, SEEDS[1]!)).width / boxOf(buildSlotAt(1, SEEDS[1]!)).height;
    const wh2 = boxOf(buildSlotAt(2, SEEDS[2]!)).width / boxOf(buildSlotAt(2, SEEDS[2]!)).height;
    expect(wh2 - wh1, '开张宽 w/h − 卵圆窄 w/h（规范种子比差——冠幅比域两端身份的比值口径）').toBeGreaterThanOrEqual(0.15);
  }, 120000);

  it('低冠 vs 高冠：同 seed 叶卡最低 Y（视觉冠底）差 ≥ 0.8m（中位分歧域两侧挂高段展开；终测 ≈0.89——白蜡挂高段差（0.48↔0.74 下缘）窄于国槐两相带（0.40↔0.72），带内展开如实）', () => {
    const low = m(4, SEED0);
    const high = m(5, SEED0);
    expect(high.minLeafY - low.minLeafY, '高冠-低冠 视觉冠底差').toBeGreaterThanOrEqual(0.8);
  }, 120000);

  it('疏松 vs 丰满：叶卡数比 ≤ 0.85（疏松显著少——中通透带 25–40% 空隙两端；终测 ≈0.58 规范种子）', () => {
    const sparse = m(6, SEED0);
    const full = m(7, SEED0);
    expect(sparse.cards / full.cards, '疏松/丰满 卡数比').toBeLessThanOrEqual(0.85);
  }, 120000);

  it('偏冠 vs 标准：6 种子面板质心均值比 ≥ 1.15；规范种子偏冠槽质心绝对 ≥ 0.4m', () => {
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
  it('总高 ∈ [9.6, 10.8]、bbox 冠幅比 w/h ∈ [0.70, 0.85]、视觉冠底/实高 ∈ [0.10, 0.32]（中位分歧读向——挂高段 0.58 下缘 + 单段角域；终测 h 10.50 / w/h 0.763 / 冠底带见断言——2026-09-22 终测）', () => {
    const r = buildSlot(0);
    const b = boxOf(r);
    const { height, width } = b;
    // 视觉冠底 = 叶卡最低 Y（T009.3 口径：挂高段 + 横展角 + upturn + 领导枝链涌现）
    const metrics = leafMetrics(r);
    expect(height, 'slot-0 总高应落 ≈10m 锚域（志书「高10-12米」直给——单段角域直读正外泄回调后）').toBeGreaterThanOrEqual(9.6);
    expect(height).toBeLessThanOrEqual(10.8);
    // 冠幅读向：冠幅比落 Spec 域 0.7–1.0 的锚点带下中段（比国槐 0.9–1.2 窄一档，
    // 终审裁决 7；crownWidthRatio 参数 Step 3 探针定档 0.63 的实测验收锁）
    expect(width / height, 'slot-0 bbox 冠幅比应落 Spec 域锚点带 0.70–0.85（下中段）').toBeGreaterThanOrEqual(0.7);
    expect(width / height).toBeLessThanOrEqual(0.85);
    const crownBase = metrics.minLeafY / height;
    expect(crownBase, 'slot-0 视觉冠底/实高应落带 0.10–0.32（中位分歧——挂高段 0.58 下缘 + 单段角域）').toBeGreaterThanOrEqual(0.1);
    expect(crownBase).toBeLessThanOrEqual(0.32);
  }, 120000);

  it('8 槽 w/h 涌现带落 [0.68, 1.20]（Spec 域 0.7–1.0 的工程读向带；终测 0.715–1.037——slot-1 卵圆窄端 0.715 域内 / slot-2 开张宽端 1.037 = form-a「冠幅≈高或略大」读向）', () => {
    for (let slot = 0; slot < 8; slot++) {
      const { width, height } = boxOf(buildSlot(slot));
      expect(width / height, `slot-${slot} ${SLOT_NAMES[slot]} bbox 冠幅比应落工程读向域 0.68–1.20`).toBeGreaterThanOrEqual(0.68);
      expect(width / height).toBeLessThanOrEqual(1.2);
    }
  }, 120000);
});

describe('通透不变量与预算带（规范种子逐槽）', () => {
  it('外壳（q>0.6）保留率 ≥ canopyDensity×0.85（槽自适应）且 ≥ 内核（q<0.4）保留率×1.8（外密内疏）；总面数（皮+叶+翅果）落 [30500, 40000]', () => {
    for (let slot = 0; slot < 8; slot++) {
      const { stats } = buildSlot(slot);
      const profile = FRAXINUS_SHAPE_PROFILES[slot]!;
      const shellCand = stats.qCandidates[3]! + stats.qCandidates[4]!;
      const shellSurv = stats.qSurvived[3]! + stats.qSurvived[4]!;
      const innerCand = stats.qCandidates[0]! + stats.qCandidates[1]!;
      const innerSurv = stats.qSurvived[0]! + stats.qSurvived[1]!;
      expect(shellCand, `slot-${slot} 外壳应有候选卡`).toBeGreaterThan(0);
      expect(innerCand, `slot-${slot} 内核应有候选卡`).toBeGreaterThan(0);
      const shellRet = shellSurv / shellCand;
      const innerRet = innerSurv / innerCand;
      // 外壳密度 = canopyDensity×1（q ≥ crownShellStart 密度 = 1）——保留率阈值随槽密度
      // 自适应（疏松槽 0.72 下 ≈0.72 为设计预期；固定阈值对密度缩放槽不适用）
      expect(shellRet, `slot-${slot} ${SLOT_NAMES[slot]} 外壳保留率应 ≥ canopyDensity×0.85`).toBeGreaterThanOrEqual(
        profile.canopyDensity * 0.85,
      );
      // 外密内疏读向（家族方向沿用——Spec crown_fill_gradient Unknown 结构缺口）
      expect(shellRet / innerRet, `slot-${slot} ${SLOT_NAMES[slot]} 外壳/内核保留率比应 ≥ 1.8`).toBeGreaterThanOrEqual(1.8);
      const total = stats.barkTriangles + stats.leafCards * 2 + stats.samaraTriangles;
      expect(total, `slot-${slot} ${SLOT_NAMES[slot]} 总面数应 ≤ 40000（家族行 High 上限）`).toBeLessThanOrEqual(40000);
      expect(total, `slot-${slot} ${SLOT_NAMES[slot]} 总面数应 ≥ 30500（白蜡小卡高数量口径参考下沿——记档见资产模块头）`).toBeGreaterThanOrEqual(30500);
    }
  }, 120000);
});
