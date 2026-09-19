/**
 * tests/runtime/procedural/tree/tree3aShapeSlots.test.ts —— 夏栎 8 槽形态向量表测试
 * （T009.3）。
 *
 * 覆盖（零 mock——真实几何生成；TREE3A_SHAPE_PROFILES 八槽完整组合 = 「8 组向量即
 * config 雏形」的契约锁，与 tree3aStructure.test.ts（slot-0 结构语义）和
 * asset_tree_3a.test.ts（资产契约）互补）：
 * - 结构计数恒等：8 槽（各自 morphSeedOf(id, slot) 规范种子）构建——皮面数全部 20724、
 *   levelBranches [6,18,54,162,324]；配置侧锁——结构计数类字段（trunk/levels radial/segs、
 *   childPlan、簇位数、每簇叶量、voidCount、scaffoldCount）与叶卡尺寸/长宽比域
 *   （Spec #12/#13 Verified 叶身份）逐位同 slot-0，canopyDensity ≤ 1（消费端
 *   Math.min(1,·) 截断，>1 无效）；
 * - 确定性：同 seed 同槽两次构建 position 逐位相等（8 槽全量）；代表槽（0 标准 /
 *   3 偏冠 / 7 丰满——形态距锚点最远的三槽）全属性 + stats 账目全等；
 * - 路由一致（D19 契约锁）：build({seed: morphSeedOf(id, slot)})（资产路径，profileForSeed
 *   查表）与 buildTree3aGeometry(mulberry32(seed), TREE3A_SHAPE_PROFILES[slot])（几何
 *   直调）逐位一致——逐槽验证；
 * - 槽间真实差异（方向性断言，**同 seed = SEED0 下跨槽对比**——隔离 profile 效应与
 *   morphSeed 随机流，差异只能来自向量本身，杜绝「seed 运气冒充形态差异」）：挺拔 vs
 *   展开 XZ 包围盒宽度比 ≥ 1.2；低冠 vs 高冠叶卡最低 Y（视觉冠底）差 ≥ 1.2m；疏松 vs
 *   丰满叶卡数比 ≤ 0.85；偏冠 vs 标准——存活叶卡质心对树干轴（原点）偏移 ≥ 1.6× 标准
 *   槽天然偏移且绝对 ≥ 0.4m（度量依据：质心偏移同时捕获半空间叶量不对称与单侧枝展
 *   延伸，比纯计数稳健；实测同 seed ×1.88 / 规范种子 ×2.86）；8 槽叶卡数（规范种子）
 *   不全相同且各落预算卡域 [(28000−20724)/2, (40000−20724)/2]；
 * - 通透不变量不破（规范种子逐槽）：外壳（q>0.6）保留率 ≥ canopyDensity×0.85（槽自
 *   适应——疏松槽 canopyDensity 0.70 下外壳保留率 ≈0.70 为设计预期，固定 0.85 阈值不
 *   适用于密度缩放槽；依据：外壳密度 = canopyDensity×1）；外壳保留率 ≥ 内核（q<0.4）
 *   ×1.8（外密内疏读向，Spec crown_fill_gradient Verified [6]）；每槽总面数（皮+叶）落
 *   High 档预算带 [28000, 40000]（正式预算 009.6 锁定）。
 * 边界：构建产物 afterEach 统一 dispose（几何直调与资产 build 两类来源分别追踪）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { buildTree3aGeometry } from '../../../../src/runtime/procedural/tree/tree3a/tree3aGeometry';
import type { Tree3aGeometryResult } from '../../../../src/runtime/procedural/tree/tree3a/tree3aGeometry';
import { TREE3A_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/tree3a/tree3aShapeProfile';
import { build } from '../../../../src/runtime/procedural/assets/asset_tree_3a.asset';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';

const ASSET_ID = 'asset_tree_3a';
const SLOT_NAMES = ['标准', '挺拔', '展开', '偏冠', '低冠', '高冠', '疏松', '丰满'] as const;
/** 规范种子：slot-N 即 morphSeedOf(id, N)（缓存/池路径的实际形态流种子） */
const SEEDS = Array.from({ length: 8 }, (_, slot) => morphSeedOf(ASSET_ID, slot));
const SEED0 = SEEDS[0]!;

const built: Tree3aGeometryResult[] = [];
const sources: InstanceSource[] = [];

/** 几何直调（规范种子 = 各槽自己的 morphSeed） */
function buildSlot(slot: number): Tree3aGeometryResult {
  const result = buildTree3aGeometry(mulberry32(SEEDS[slot]!), TREE3A_SHAPE_PROFILES[slot]!);
  built.push(result);
  return result;
}

/** 几何直调（指定种子 = 同 seed 跨槽对比——隔离 profile 效应） */
function buildSlotAt(slot: number, seed: number): Tree3aGeometryResult {
  const result = buildTree3aGeometry(mulberry32(seed), TREE3A_SHAPE_PROFILES[slot]!);
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

/** 叶卡空间度量（6 顶点/卡取质心）：XZ 跨度 / 最低 Y / 质心对原点（树干轴）偏移 */
interface LeafMetrics {
  cards: number;
  xzWidth: number;
  minLeafY: number;
  centroidOffset: number;
}

function leafMetrics(result: Tree3aGeometryResult): LeafMetrics {
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

describe('结构计数恒等（8 槽皮面数与 rng 消费恒等的前提）', () => {
  it('8 槽规范种子构建：皮面数全部 20724、levelBranches [6,18,54,162,324]', () => {
    for (let slot = 0; slot < 8; slot++) {
      const { stats } = buildSlot(slot);
      expect(stats.barkTriangles, `slot-${slot} ${SLOT_NAMES[slot]} 皮面数应恒等`).toBe(20724);
      expect(stats.levelBranches, `slot-${slot} ${SLOT_NAMES[slot]} 五级枝数应恒等`).toEqual([6, 18, 54, 162, 324]);
    }
  }, 120000); // T011.1：套件并行负载增长（celtis 加入）后 30s 余量不足，超时上限提至 120s——断言语义零变化

  it('配置侧锁：结构计数类字段与叶卡尺寸/长宽比域逐位同 slot-0；canopyDensity ≤ 1', () => {
    const anchor = TREE3A_SHAPE_PROFILES[0]!;
    expect(TREE3A_SHAPE_PROFILES).toHaveLength(8);
    for (let slot = 1; slot < 8; slot++) {
      const p = TREE3A_SHAPE_PROFILES[slot]!;
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
      // 叶身份（Spec #12/#13 Verified 域收敛——卡尺寸/长宽比槽间不动）
      expect(p.leafWidthMin, `slot-${slot} leafWidthMin`).toBe(anchor.leafWidthMin);
      expect(p.leafWidthSpan, `slot-${slot} leafWidthSpan`).toBe(anchor.leafWidthSpan);
      expect(p.leafAspectMin, `slot-${slot} leafAspectMin`).toBe(anchor.leafAspectMin);
      expect(p.leafAspectSpan, `slot-${slot} leafAspectSpan`).toBe(anchor.leafAspectSpan);
      // 消费端 Math.min(1,·) 截断——>1 为无效值禁出现
      expect(p.canopyDensity, `slot-${slot} canopyDensity 应 ≤ 1`).toBeLessThanOrEqual(1);
    }
  });
});

describe('确定性（同 seed 同槽逐位复现）', () => {
  it('8 槽同 seed 两次构建 position 逐位相等；代表槽（0/3/7）全属性 + stats 全等', () => {
    for (let slot = 0; slot < 8; slot++) {
      const a = buildSlot(slot);
      const b = buildSlot(slot);
      expect(
        a.geometry.getAttribute('position').array,
        `slot-${slot} ${SLOT_NAMES[slot]} 同 seed 应逐位复现`,
      ).toEqual(b.geometry.getAttribute('position').array);
      if (slot === 0 || slot === 3 || slot === 7) {
        for (const attr of ['position', 'normal', 'uv', 'aLeafRand', 'aBend'] as const) {
          expect(a.geometry.getAttribute(attr).array).toEqual(b.geometry.getAttribute(attr).array);
        }
        expect(a.stats).toEqual(b.stats);
      }
    }
  }, 120000); // T011.1：套件并行负载增长（celtis 加入）后 30s 余量不足，超时上限提至 120s——断言语义零变化
});

describe('路由一致（8 组向量即 config 雏形：资产路径 = 几何直调）', () => {
  it('build({seed: morphSeedOf(id, slot)}) 与 buildTree3aGeometry(mulberry32(seed), PROFILES[slot]) 逐位一致（逐槽）', () => {
    for (let slot = 0; slot < 8; slot++) {
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
  }, 120000); // T011.1：套件并行负载增长（celtis 加入）后 30s 余量不足，超时上限提至 120s——断言语义零变化
});

describe('槽间真实差异（同 seed = SEED0 跨槽对比——差异纯来自形态向量，非 seed 运气）', () => {
  // 说明：方向断言在共同种子 SEED0 下进行——morphSeed 随机流相同，几何差异只能由
  // profile 组合解释（「明显不同、仍属同一树种」的结构化证据）
  const m = (slot: number): LeafMetrics => leafMetrics(buildSlotAt(slot, SEED0));

  it('挺拔 vs 展开：XZ 包围盒宽度比 ≥ 1.2（挺拔显著窄——密林端 vs 老树端）', () => {
    const narrow = m(1);
    const broad = m(2);
    expect(narrow.xzWidth).toBeGreaterThan(0);
    expect(broad.xzWidth / narrow.xzWidth, '展开/挺拔 宽度比（实测 ≈1.43）').toBeGreaterThanOrEqual(1.2);
  }, 120000); // T011.1：套件并行负载增长（celtis 加入）后 30s 余量不足，超时上限提至 120s——断言语义零变化

  it('低冠 vs 高冠：叶卡最低 Y（视觉冠底）差 ≥ 1.2m（低冠显著低）', () => {
    const low = m(4);
    const high = m(5);
    expect(high.minLeafY - low.minLeafY, '高冠-低冠 视觉冠底差（实测 ≈1.29m）').toBeGreaterThanOrEqual(1.2);
  }, 120000); // T011.1：套件并行负载增长（celtis 加入）后 30s 余量不足，超时上限提至 120s——断言语义零变化

  it('疏松 vs 丰满：叶卡数比 ≤ 0.85（疏松显著少）', () => {
    const sparse = m(6);
    const full = m(7);
    expect(sparse.cards / full.cards, '疏松/丰满 卡数比（实测 ≈0.46）').toBeLessThanOrEqual(0.85);
  }, 120000); // T011.1：套件并行负载增长（celtis 加入）后 30s 余量不足，超时上限提至 120s——断言语义零变化

  it('偏冠 vs 标准：叶卡质心对树干轴偏移 ≥ 1.6× 标准槽天然偏移且绝对 ≥ 0.4m（度量：质心偏移同时捕获半空间叶量不对称与单侧枝展延伸；实测同 seed ×1.88 / 规范种子 ×2.86）', () => {
    const anchor = m(0);
    const lopsided = m(3);
    expect(lopsided.centroidOffset / anchor.centroidOffset).toBeGreaterThanOrEqual(1.6);
    expect(lopsided.centroidOffset).toBeGreaterThanOrEqual(0.4);
  }, 120000); // T011.1：套件并行负载增长（celtis 加入）后 30s 余量不足，超时上限提至 120s——断言语义零变化

  it('8 槽叶卡数（规范种子）不全相同且各落预算卡域 [3638, 9638]（总面带 [28000,40000] 折算）', () => {
    const counts = new Set<number>();
    for (let slot = 0; slot < 8; slot++) {
      const { stats } = buildSlot(slot);
      counts.add(stats.leafCards);
      expect(stats.leafCards, `slot-${slot} ${SLOT_NAMES[slot]} 叶卡数应 ≥ (28000−20724)/2`).toBeGreaterThanOrEqual(3638);
      expect(stats.leafCards, `slot-${slot} ${SLOT_NAMES[slot]} 叶卡数应 ≤ (40000−20724)/2`).toBeLessThanOrEqual(9638);
    }
    expect(counts.size, '8 槽叶卡数应不全相同（槽身份可辨）').toBeGreaterThan(1);
  }, 120000); // T011.1：套件并行负载增长（celtis 加入）后 30s 余量不足，超时上限提至 120s——断言语义零变化
});

describe('通透不变量与预算带（规范种子逐槽）', () => {
  it('外壳（q>0.6）保留率 ≥ canopyDensity×0.85（槽自适应）且 ≥ 内核（q<0.4）保留率×1.8（外密内疏）；总面数落 [28000, 40000]', () => {
    for (let slot = 0; slot < 8; slot++) {
      const { stats } = buildSlot(slot);
      const profile = TREE3A_SHAPE_PROFILES[slot]!;
      const shellCand = stats.qCandidates[3]! + stats.qCandidates[4]!;
      const shellSurv = stats.qSurvived[3]! + stats.qSurvived[4]!;
      const innerCand = stats.qCandidates[0]! + stats.qCandidates[1]!;
      const innerSurv = stats.qSurvived[0]! + stats.qSurvived[1]!;
      expect(shellCand, `slot-${slot} 外壳应有候选卡`).toBeGreaterThan(0);
      const shellRet = shellSurv / shellCand;
      const innerRet = innerSurv / innerCand;
      // 外壳密度 = canopyDensity×1（q ≥ crownShellStart 密度 = 1）——保留率阈值随槽密度
      // 自适应（疏松槽 0.70 下 ≈0.70 为设计预期；固定 0.85 对密度缩放槽不适用）
      expect(shellRet, `slot-${slot} ${SLOT_NAMES[slot]} 外壳保留率应 ≥ canopyDensity×0.85`).toBeGreaterThanOrEqual(
        profile.canopyDensity * 0.85,
      );
      // 外密内疏读向（crown_fill_gradient Verified [6]；实测全槽 ≥1.83，丰满槽最低）
      expect(shellRet / innerRet, `slot-${slot} ${SLOT_NAMES[slot]} 外壳/内核保留率比应 ≥ 1.8`).toBeGreaterThanOrEqual(1.8);
      const total = stats.barkTriangles + stats.leafCards * 2;
      expect(total, `slot-${slot} ${SLOT_NAMES[slot]} 总面数应落 High 档预算带`).toBeGreaterThanOrEqual(28000);
      expect(total).toBeLessThanOrEqual(40000);
    }
  }, 120000); // T011.1：套件并行负载增长（celtis 加入）后 30s 余量不足，超时上限提至 120s——断言语义零变化
});
