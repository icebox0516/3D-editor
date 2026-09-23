/**
 * tests/runtime/procedural/tree/salixShapeSlots.test.ts —— 垂柳 8 槽形态向量
 * 表测试（T011.12，对称 ligustrum organization——方法复制；数值锚为垂柳自己的
 * 2026-09-23 续作会话终测（规范种子 = 各槽 morphSeedOf(id, slot)，探针六轮回调后
 * 定档））。
 *
 * 覆盖（零 mock——真实几何生成；SALIX_SHAPE_PROFILES 八槽完整组合 = 「8 组向量
 * 即 config 雏形」的契约锁，与 salixStructure.test.ts（slot-0 结构语义）互补）：
 * - 结构计数恒等：8 槽（各自 morphSeedOf(id, slot) 规范种子）构建——皮面数全部
 *   26180、levelBranches [7,21,63,189,378]；配置侧锁——结构计数类字段（trunk/
 *   levels radial/segs、childPlan、簇位数、每簇叶量（L5 9 / L4 10）、voidCount、
 *   scaffoldCount）与叶卡尺寸/长宽比域（**细长卡变比例域 8–18 整体继承——冻结
 *   接口域，span ≠ 0 为垂柳口径**）与 barkRelief（槽间恒等——非形态差异维度）
 *   逐位同 slot-0，canopyDensity ≤ 1（消费端 Math.min(1,·) 截断，>1 无效）；
 * - 确定性：同 seed 同槽两次构建逐位相等（代表槽 0/3/7 全属性 + stats——全 8 槽
 *   双建为全量套件并行负载裁剪让位：salixStructure 锁 slot-0 双建 + 结构计数恒等
 *   间接覆盖）；
 * - 路由一致（D19 契约锁）：build({seed: morphSeedOf(id, slot)})（资产路径，
 *   profileForSeed 查表）与 buildSalixGeometry(mulberry32(seed),
 *   SALIX_SHAPE_PROFILES[slot])（几何直调）逐位一致——slot-0/3/6/7 代表位
 *   （资产入口静态 import——import 失败即测试红，T020 软跳过清除）；
 * - 槽间真实差异（方向性断言，垂柳四轴——垂幕长度 / 冠幅比 / 干形三型 / 垂坠度）：
 *   深垂帘 vs 浅垂帘（**双口径**——帘幕绝对读数种子方差（面板 ±20%，先例同款记档）：
 *   ①同种子面板帘缘差（全 6 种子 slot-1 帘缘低于 slot-2 ≥ 0.4m——垂幕长度主轴的
 *   主方向）②规范种子帘缘绝对差 + 卡数比（深垂长链 → 挂点多 → 卡多：slot-1 卡数
 *   ≥ slot-2 × 1.05））；宽冠 vs 窄冠（双口径——①同种子面板冠幕宽度差 ②规范种子
 *   w/h 比差 ≥ 0.05）；高位单干 vs 基部斜弯（同 seed 帘缘差 ≥ 1.2m——干形轴三型
 *   的冠底展开；终测 ≈1.65）；强垂坠 vs 浅垂帘（L5 簇切向垂直度差 ≥ 0.03——垂坠
 *   度轴（upturn 负链加深 + 垂索更直）；终测 0.705 vs 0.632）；8 槽叶卡数（规范
 *   种子）不全相同且各 ≤ 卡上限 6910（总面上限 40000 折算（皮 26180）/2；下限由
 *   总面锁覆盖）；
 * - 物种锚点（规范种子 slot-0）：总高落 [8.8, 10.8] 锚域（≈10m 生产锚——探针六轮
 *   回调后终测 9.83）、bbox 冠幅比落锚点带 [1.0, 1.3]（Spec §3 终审修正域——
 *   crownWidthRatio 0.52 探针定档（密度回调后读数 1.135）的实测验收锁（喷泉链外泄系数 ×2.2 的回推，
 *   见 profile 注释））、视觉冠底/实高落带 [0.12, 0.30]（帘缘止于地上 1–2m [6]
 *   的标准槽读向；终测 0.197）；
 * - 8 槽 w/h 涌现带落 [1.0, 1.3]（Spec 域直读——slot-1 深垂帘窄端 1.046 / slot-6
 *   斜弯宽端 1.295 = 域两端身份；密度回调后终测带 1.046–1.295）与 8 槽树高带 [8.3, 11.4]
 *   （Spec §2 生产锚 8–12m 带内；密度回调后终测 8.46–11.22）；**垂幕段（腰口径）工程带
 *   [0.28, 0.45]**（喷泉腰（半径 ≥ 0.85×rmax 叶卡带）→ 帘缘的垂帘纵跨——照片
 *   判读域 2/5–2/3 含拱背垂索的保守口径记档；密度回调后终测 0.324–0.395）；
 * - 通透不变量不破（规范种子逐槽）：外壳（q>0.6）保留率 ≥ canopyDensity×0.85
 *   （槽自适应）且 ≥ 内核（q<0.4）保留率 ×1.8（外密内疏家族方向沿用）；每槽总面数
 *   （皮+叶）落 High 档预算带 [33000, 40000]（家族行 High 上限语义，带下沿为
 *   垂柳细叶中数量口径参考——见资产模块头记档）。
 * 边界：构建产物 afterEach 统一 dispose（几何直调与资产 build 两类来源分别追踪）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { build } from '../../../../src/runtime/procedural/assets/asset_tree_salix.asset';
import { buildSalixGeometry } from '../../../../src/runtime/procedural/tree/salix/salixGeometry';
import type { SalixGeometryResult } from '../../../../src/runtime/procedural/tree/salix/salixGeometry';
import { SALIX_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/salix/salixShapeProfile';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';

const ASSET_ID = 'asset_tree_salix';
const SLOT_NAMES = ['标准', '深垂帘', '浅垂帘', '宽冠', '窄冠', '高位单干', '基部斜弯', '强垂坠'] as const;
/** 规范种子：slot-N 即 morphSeedOf(id, N)（缓存/池路径的实际形态流种子） */
const SEEDS = Array.from({ length: 8 }, (_, slot) => morphSeedOf(ASSET_ID, slot));
const SEED0 = SEEDS[0]!;

const built: SalixGeometryResult[] = [];
const sources: InstanceSource[] = [];

/** 几何直调（规范种子 = 各槽自己的 morphSeed） */
function buildSlot(slot: number): SalixGeometryResult {
  const result = buildSalixGeometry(mulberry32(SEEDS[slot]!), SALIX_SHAPE_PROFILES[slot]!);
  built.push(result);
  return result;
}

/** 几何直调（指定种子 = 同 seed 跨槽对比——隔离 profile 效应） */
function buildSlotAt(slot: number, seed: number): SalixGeometryResult {
  const result = buildSalixGeometry(mulberry32(seed), SALIX_SHAPE_PROFILES[slot]!);
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

/** 叶卡空间度量（6 顶点/卡取质心；组 1 纯单叶卡——无花资产无附加块）：
 *  XZ 跨度 / 最低 Y（帘缘）/ 卡数 */
interface LeafMetrics {
  cards: number;
  xzWidth: number;
  minLeafY: number;
}

function leafMetrics(result: SalixGeometryResult): LeafMetrics {
  const leaf = result.geometry.groups[1]!;
  const pos = result.geometry.getAttribute('position');
  let xMin = Infinity;
  let xMax = -Infinity;
  let zMin = Infinity;
  let zMax = -Infinity;
  let yMin = Infinity;
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
    n++;
  }
  return {
    cards: n,
    xzWidth: Math.max(xMax - xMin, zMax - zMin),
    minLeafY: yMin,
  };
}

/** bbox 度量（总高 / XZ 跨度） */
function boxOf(result: SalixGeometryResult): { height: number; width: number } {
  result.geometry.computeBoundingBox();
  const b = result.geometry.boundingBox!;
  return {
    height: b.max.y - b.min.y,
    width: Math.max(b.max.x - b.min.x, b.max.z - b.min.z),
  };
}

/** 垂幕段（腰口径）：喷泉腰（半径 ≥ 0.85×rmax 叶卡带 Y 均值）→ 帘缘的垂帘纵跨 / 树高
 *  ——照片判读域 2/5–2/3 含拱背垂索，腰口径为保守下界（挂点最高→帘缘的全跨度口径
 *  0.72–0.87 为上界参考——记档见资产模块头） */
function curtainSpan(result: SalixGeometryResult): number {
  const leaf = result.geometry.groups[1]!;
  const pos = result.geometry.getAttribute('position');
  const box = boxOf(result);
  const centers: { x: number; y: number; z: number }[] = [];
  let rMax = 0;
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
    rMax = Math.max(rMax, Math.hypot(x / 6, z / 6));
  }
  const waist = centers.filter((c) => Math.hypot(c.x, c.z) >= 0.85 * rMax);
  const waistY = waist.reduce((s, c) => s + c.y, 0) / waist.length;
  const minY = Math.min(...centers.map((c) => c.y));
  return (waistY - minY) / box.height;
}

describe('结构计数恒等（8 槽皮面数与 rng 消费恒等的前提）', () => {
  it('8 槽规范种子构建：皮面数全部 26180、levelBranches [7,21,63,189,378]', () => {
    for (let slot = 0; slot < 8; slot++) {
      const { stats } = buildSlot(slot);
      expect(stats.barkTriangles, `slot-${slot} ${SLOT_NAMES[slot]} 皮面数应恒等`).toBe(26180);
      expect(stats.levelBranches, `slot-${slot} ${SLOT_NAMES[slot]} 五级枝数应恒等`).toEqual([7, 21, 63, 189, 378]);
    }
  }, 120000); // 沿先例：套件并行负载下 30s 余量不足，超时上限 120s——断言语义零变化

  it('配置侧锁：结构计数类字段 / 叶卡尺寸域 / barkRelief 逐位同 slot-0；canopyDensity ≤ 1；细长卡长宽比域变比例（span ≠ 0——垂柳冻结接口域口径）', () => {
    const anchor = SALIX_SHAPE_PROFILES[0]!;
    expect(SALIX_SHAPE_PROFILES).toHaveLength(8);
    for (let slot = 1; slot < 8; slot++) {
      const p = SALIX_SHAPE_PROFILES[slot]!;
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
      // 叶身份（卡尺寸/长宽比域槽间不动——冻结接口域整体继承的配置侧锁）
      expect(p.leafWidthMin, `slot-${slot} leafWidthMin`).toBe(anchor.leafWidthMin);
      expect(p.leafWidthSpan, `slot-${slot} leafWidthSpan`).toBe(anchor.leafWidthSpan);
      expect(p.leafAspectMin, `slot-${slot} leafAspectMin`).toBe(anchor.leafAspectMin);
      expect(p.leafAspectSpan, `slot-${slot} leafAspectSpan（变比例域整体继承——垂柳冻结接口口径）`).toBe(anchor.leafAspectSpan);
      // 树皮微起伏槽间恒等（非形态差异维度——slot-0 定义 spread 继承）
      expect(p.barkRelief, `slot-${slot} barkRelief 应 spread 继承 slot-0`).toEqual(anchor.barkRelief);
      // 消费端 Math.min(1,·) 截断——>1 为无效值禁出现
      expect(p.canopyDensity, `slot-${slot} canopyDensity 应 ≤ 1`).toBeLessThanOrEqual(1);
    }
  });
});

describe('确定性（同 seed 同槽逐位复现）', () => {
  it('代表槽（0/3/7）同 seed 两次构建 position 逐位相等 + 全属性 + stats 全等（全 8 槽确定性由 salixStructure slot-0 锁 + 结构计数恒等 + 本文件路由/差异测试间接覆盖——全量 16 次构建裁剪为 6 次，控制全量套件并行负载，记档）', () => {
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
  it('build({seed: morphSeedOf(id, slot)}) 与 buildSalixGeometry(mulberry32(seed), PROFILES[slot]) 逐位一致（slot-0/3/6/7——首/中/尾代表位 + 锚点；profileForSeed 为 O(8) 纯查表无槽位特判，记档）', () => {
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

describe('槽间真实差异（差异来自形态向量——垂幕幕缘方差记档下双口径断言）', () => {
  // 说明：垂帘帘缘/幕宽绝对读数种子方差大（面板 ±20%，先例同款记档）——单种子绝对
  // 对比被种子运气支配，方向断言采双口径：①同种子面板主方向（全种子一致）②规范种子
  // 的缓存/池路径实际形态流读数
  const m = (slot: number, seed: number): LeafMetrics => leafMetrics(buildSlotAt(slot, seed));

  it('深垂帘 vs 浅垂帘（双口径——垂幕长度主轴）：①同种子面板帘缘差 slot-2 − slot-1 ≥ 0.4m（浅垂端帘缘更高的主方向）②规范种子帘缘绝对差 ≥ 0.4m + 深垂帘卡数 ≥ 浅垂帘 × 1.05（长链挂点多；密度回调后终测帘缘 1.25 vs 2.10 / 卡数 6192 vs 5129）', () => {
    // ①帘缘面板（6 种子同 seed 对比——差异纯来自形态向量）
    const panelSeeds = [SEEDS[0]!, SEEDS[1]!, SEEDS[2]!, SEEDS[3]!, 12345, 777777];
    let deep = 0;
    let shallow = 0;
    for (const seed of panelSeeds) {
      deep += m(1, seed).minLeafY;
      shallow += m(2, seed).minLeafY;
    }
    expect(shallow / 6 - deep / 6, '浅垂帘面板均帘缘 − 深垂帘面板均帘缘（垂幕长度主方向）').toBeGreaterThanOrEqual(0.4);
    // ②规范种子（缓存/池路径实际形态流）+ 卡数口径
    const deepCanonical = m(1, SEEDS[1]!);
    const shallowCanonical = m(2, SEEDS[2]!);
    expect(shallowCanonical.minLeafY - deepCanonical.minLeafY, '规范种子帘缘差（浅垂端更高）').toBeGreaterThanOrEqual(0.4);
    expect(deepCanonical.cards / shallowCanonical.cards, '深垂帘/浅垂帘 卡数比（长链挂点多）').toBeGreaterThanOrEqual(1.05);
  }, 120000);

  it('宽冠 vs 窄冠（双口径——冠幅比主轴）：①同种子面板冠幕宽度差（slot-3 − slot-4 面板均差 ≥ 0.3m）②规范种子 w/h 比差 ≥ 0.05（密度回调后终测 slot-3 1.149 / slot-4 1.077；域两端身份另由 8 槽带断言覆盖）', () => {
    const panelSeeds = [SEEDS[0]!, SEEDS[1]!, SEEDS[2]!, SEEDS[3]!, 12345, 777777];
    let broad = 0;
    let narrow = 0;
    for (const seed of panelSeeds) {
      broad += m(3, seed).xzWidth;
      narrow += m(4, seed).xzWidth;
    }
    expect(broad / 6 - narrow / 6, '宽冠面板均宽 − 窄冠面板均宽（冠幅比主方向）').toBeGreaterThanOrEqual(0.3);
    const wh3 = boxOf(buildSlotAt(3, SEEDS[3]!)).width / boxOf(buildSlotAt(3, SEEDS[3]!)).height;
    const wh4 = boxOf(buildSlotAt(4, SEEDS[4]!)).width / boxOf(buildSlotAt(4, SEEDS[4]!)).height;
    expect(wh3 - wh4, '宽冠 w/h − 窄冠 w/h（规范种子比差——冠幅比域两端身份的比值口径）').toBeGreaterThanOrEqual(0.05);
  }, 120000);

  it('高位单干 vs 基部斜弯：同 seed 帘缘差 ≥ 1.2m（干形轴三型的冠底展开——挂高段上移 vs 近基低叉 + 垂索低垂；终测 ≈1.65）', () => {
    const low = m(5, SEED0);
    const base = m(6, SEED0);
    expect(low.minLeafY - base.minLeafY, '高位单干-基部斜弯 帘缘差（视觉冠底）').toBeGreaterThanOrEqual(1.2);
  }, 120000);

  it('强垂坠 vs 浅垂帘：L5 簇切向垂直度差 ≥ 0.03（垂坠度轴——upturn 负链加深 + 垂索更直 vs 浅坠；终测 0.705 vs 0.632）', () => {
    const verticality = (slot: number, seed: number): number => {
      const r = buildSlotAt(slot, seed);
      const l5 = r.stats.clusters.filter((c) => c.level === 4);
      expect(l5.length, `slot-${slot} 应有 L5 簇`).toBeGreaterThan(0);
      return l5.reduce((s, c) => s - c.dirY, 0) / l5.length;
    };
    expect(verticality(7, SEED0) - verticality(2, SEED0), '强垂坠-浅垂帘 L5 切向垂直度差（垂坠度主方向）').toBeGreaterThanOrEqual(0.03);
  }, 120000);

  it('8 槽叶卡数（规范种子）不全相同且各 ≤ 卡上限 6910（总面上限 40000 折算（皮 26180）/2；总面下限由通透/预算带测试锁定）', () => {
    const counts = new Set<number>();
    for (let slot = 0; slot < 8; slot++) {
      const { stats } = buildSlot(slot);
      counts.add(stats.leafCards);
      expect(stats.leafCards, `slot-${slot} ${SLOT_NAMES[slot]} 叶卡数应 ≤ 6910`).toBeLessThanOrEqual(6910);
    }
    expect(counts.size, '8 槽叶卡数应不全相同（槽身份可辨）').toBeGreaterThan(1);
  }, 120000);
});

describe('物种锚点（规范种子 slot-0——Spec 尺度与比例域）', () => {
  it('总高 ∈ [8.8, 10.8]、bbox 冠幅比 w/h ∈ [1.0, 1.3]、视觉冠底/实高 ∈ [0.12, 0.30]（帘缘止于地上 1–2m 标准槽读向；终测 h 9.83 / w/h 1.135（密度回调后）/ 冠底 0.197——2026-09-23 终测 + 同日密度回调复测）', () => {
    const r = buildSlot(0);
    const b = boxOf(r);
    const { height, width } = b;
    // 视觉冠底 = 叶卡最低 Y（T009.3 口径：挂高段 + 横展角 + upturn + 领导枝链涌现）
    const metrics = leafMetrics(r);
    expect(height, 'slot-0 总高应落 ≈10m 锚域（8–12 生产域中带）').toBeGreaterThanOrEqual(8.8);
    expect(height).toBeLessThanOrEqual(10.8);
    // 冠幅读向：冠幅比落 Spec 终审修正域 1.0–1.3 的锚点带中段（crownWidthRatio 参数
    // Step 3 探针定档 0.52（喷泉链外泄系数 ×2.2 回推）的实测验收锁）
    expect(width / height, 'slot-0 bbox 冠幅比应落 Spec 域 1.0–1.3（中段）').toBeGreaterThanOrEqual(1.0);
    expect(width / height).toBeLessThanOrEqual(1.3);
    const crownBase = metrics.minLeafY / height;
    expect(crownBase, 'slot-0 视觉冠底/实高应落带 0.12–0.30（帘缘止于地上 1–2m 的标准槽）').toBeGreaterThanOrEqual(0.12);
    expect(crownBase).toBeLessThanOrEqual(0.3);
  }, 120000);

  it('8 槽 w/h 涌现带落 [1.0, 1.3]（Spec 终审修正域直读——slot-1 深垂帘窄端 / slot-6 斜弯宽端 = 域两端身份；密度回调后终测 1.046–1.295）', () => {
    for (let slot = 0; slot < 8; slot++) {
      const { width, height } = boxOf(buildSlot(slot));
      expect(width / height, `slot-${slot} ${SLOT_NAMES[slot]} bbox 冠幅比应落 Spec 域 1.0–1.3`).toBeGreaterThanOrEqual(1.0);
      expect(width / height).toBeLessThanOrEqual(1.3);
    }
  }, 120000);

  it('8 槽树高带 [8.3, 11.4]（Spec §2 生产锚 8–12m 带内；密度回调后终测 8.46–11.22——slot-6 斜弯矮端 / slot-1 深垂帘高端）+ 垂幕段（腰口径）工程带 [0.28, 0.45]（照片判读域 2/5–2/3 含拱背垂索的保守口径记档；密度回调后终测 0.324–0.395）', () => {
    for (let slot = 0; slot < 8; slot++) {
      const r = buildSlot(slot);
      const { height } = boxOf(r);
      expect(height, `slot-${slot} ${SLOT_NAMES[slot]} 总高应落 8–12 生产锚带（工程带 8.3–11.4）`).toBeGreaterThanOrEqual(8.3);
      expect(height).toBeLessThanOrEqual(11.4);
      const span = curtainSpan(r);
      expect(span, `slot-${slot} ${SLOT_NAMES[slot]} 垂幕段（腰口径）应落工程带 0.28–0.45（实测 ${span.toFixed(3)}）`).toBeGreaterThanOrEqual(0.28);
      expect(span).toBeLessThanOrEqual(0.45);
    }
  }, 120000);
});

describe('通透不变量与预算带（规范种子逐槽）', () => {
  it('外壳（q>0.6）保留率 ≥ canopyDensity×0.85（槽自适应）且 ≥ 内核（q<0.4）保留率×1.8（外密内疏）；总面数（皮+叶）落 [33000, 40000]', () => {
    for (let slot = 0; slot < 8; slot++) {
      const { stats } = buildSlot(slot);
      const profile = SALIX_SHAPE_PROFILES[slot]!;
      const shellCand = stats.qCandidates[3]! + stats.qCandidates[4]!;
      const shellSurv = stats.qSurvived[3]! + stats.qSurvived[4]!;
      const innerCand = stats.qCandidates[0]! + stats.qCandidates[1]!;
      const innerSurv = stats.qSurvived[0]! + stats.qSurvived[1]!;
      expect(shellCand, `slot-${slot} 外壳应有候选卡`).toBeGreaterThan(0);
      expect(innerCand, `slot-${slot} 内核应有候选卡`).toBeGreaterThan(0);
      const shellRet = shellSurv / shellCand;
      const innerRet = innerSurv / innerCand;
      // 外壳密度 = canopyDensity×1（q ≥ crownShellStart 密度 = 1）——保留率阈值随槽密度
      // 自适应（密度缩放槽下固定阈值不适用）
      expect(shellRet, `slot-${slot} ${SLOT_NAMES[slot]} 外壳保留率应 ≥ canopyDensity×0.85`).toBeGreaterThanOrEqual(
        profile.canopyDensity * 0.85,
      );
      // 外密内疏读向（家族方向沿用——Spec crown_fill_gradient Unknown 结构缺口）
      expect(shellRet / innerRet, `slot-${slot} ${SLOT_NAMES[slot]} 外壳/内核保留率比应 ≥ 1.8`).toBeGreaterThanOrEqual(1.8);
      const total = stats.barkTriangles + stats.leafCards * 2;
      expect(total, `slot-${slot} ${SLOT_NAMES[slot]} 总面数应 ≤ 40000（家族行 High 上限）`).toBeLessThanOrEqual(40000);
      expect(total, `slot-${slot} ${SLOT_NAMES[slot]} 总面数应 ≥ 33000（垂柳细叶中数量口径参考下沿——记档见资产模块头）`).toBeGreaterThanOrEqual(33000);
    }
  }, 120000);
});
