/**
 * tests/runtime/procedural/tree/bischofiaStructure.test.ts —— 重阳木枝干结构真实性
 * 测试（T011.8，对称栾树/乌桕 organization——方法复制，数值锚为重阳木自己的
 * 2026-09-21 终测（规范种子 = morphSeedOf(id, 0)）；**三出复叶中卡簇挂点 + 两段
 * scaffold 角带伞形 + 无花果资产 uv 双域 = 重阳木独有断言组**）。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildBischofiaGeometry 消费扩展 stats，与资产
 * 入口契约（asset_tree_bischofia.asset）互补——本文件锁「结构怎么长」，那边锁「契约
 * 怎么传」）：
 * - 确定性：同 rng seed + 同 shapeProfile 两次构建 → 全属性逐位相等、stats 账目全等；
 *   rng 消费恒等 73232（消费顺序即契约——次数变化 = 随机流重排；011.3 ③ 教训：包裹
 *   rng 闭包逐调用计数口径；**无花果挂点（Step 1 判定 C）——消费全在骨架/簇/通透
 *   roll**；跨槽/跨 seed 随保留簇数浮动 ±0.4%（实测 72984–73608）——通透 roll 计数
 *   机制，八先例同款记档）；
 * - 组序恰 2（D15 免组膨胀：皮 0 / 复叶卡 1——**组 0 = 纯皮拓扑（无花果资产：无附加
 *   元素入皮组）**）；皮面数恒等 24178（6 骨架 + 1 领导拓扑）；
 * - 主次分级：五级拓扑计数恒等 [7,21,63,189,378]；各级平均起径严格递减；一级骨架枝
 *   （含领导枝）≥ 2.2× 次级、≥ 12× 末梢——「所有分枝视觉权重接近即不达标」的结构化判据；
 * - **三出复叶中卡簇挂点（重阳木独有身份，家族复叶第二型——Spec §4/域扩展节 B 三出
 *   复叶互生散生 Verified [1][3] + Step 1 判定 A/B）**：每簇存活叶量 ≤ 8（互生节位
 *   合并抽象候选上限）且均值 ≥ 预算半（4）；簇账守恒（簇账 = 总卡数）；卡几何域
 *   （宽 0.21–0.315m / **长/宽 = 1/0.75 恒比例**（冻结接口——尺寸抖动仅缩放；三出
 *   展幅放射对称宽于栾树羽叶 0.60）落 profile 域）；
 * - **uv 域身份标记双重隔离（无花果资产结构锁——Step 1 判定 C：无 v∈[4,7) 花果域）**：
 *   v∈[4,7) 顶点数 = 0（无花果域断言）；皮组其余顶点 v < 2.5（皮管弧长域实测 max
 *   1.99——10m 级最长枝弧 ×0.5）；叶组 uv 标准 0–1 四边形域（v 轴 = 总柄基 0 →
 *   顶小叶尖 1——材质 SDF 裸柄线域 v∈[0,0.35] 的几何侧不变式）；组账守恒（组 0 =
 *   纯皮拓扑、组 1 = 卡 × 2）；
 * - 冠内通透（显式规则）：候选 → 存活存在剔卡且枝干通道/密度场两规则实际命中；外密
 *   内疏——内核保留率显著低于外壳（外密内疏家族方向沿用——Spec crown_fill_gradient
 *   Unknown 结构缺口）；枝干通道——存活叶卡挂点（根边中点 = 过滤判定口径）距通道
 *   线段带内数为 0；通透不挖空整层——冠顶/冠底 1/3 高度带均有存活叶卡；
 * - 枝梢驱动叶簇（家族方法沿用）：簇-枝梢绑定（簇中心贴挂点 + 簇方向 = 挂点枝切向
 *   单位向量 + L5 末梢挂簇占主导）；簇间间隙（minSeparation 0.55 距离抑制）；shellBias
 *   平摊（互生散布宽域平摊）；
 * - 贴地契约：minY 精确 0（原点 = 底部中心）；
 * - 树皮起伏确定性（褐纵裂深沟宽脊 + 扭转中-深浮雕——amplitude 0.028 / {3,4,5} /
 *   drift 6.5）：主干环截面起伏存在（极差/环均径 3.6–6.1% 实测带 + 最大极差 ≥ 10mm
 *   毫米级——中-深档读向 bark-a/bark-b [7]）；**L1/L5 环极差 = 0 级（抬档亚视觉地板
 *   3.5mm——起径 <0.125m 的管平滑发射，仅主干有效起伏，「细枝光滑」fruit-c/bark-a
 *   [7] 的几何侧读向，皮孔/色序归材质层）**；wrap 位浮点级无缝；
 * - shapeProfile 参数面真实驱动：canopyDensity 压低 → 叶卡数显著下降。
 * 边界：构建产物 afterEach 统一 dispose。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { buildBischofiaGeometry } from '../../../../src/runtime/procedural/tree/bischofia/bischofiaGeometry';
import type { BischofiaGeometryResult } from '../../../../src/runtime/procedural/tree/bischofia/bischofiaGeometry';
import { BISCHOFIA_SLOT0_PROFILE } from '../../../../src/runtime/procedural/tree/bischofia/bischofiaShapeProfile';

const SEED0 = morphSeedOf('asset_tree_bischofia', 0);
/** slot-0 High rng 消费快照（2026-09-21 终测，包裹闭包逐调用计数——任何条件跳过消费
 *  都违约；无花果挂点（Step 1 判定 C）——消费全在骨架/簇/通透 roll；跨槽/跨 seed 随
 *  保留簇数变化 ±0.4%（实测 72984–73608；通透 roll 计数 = 存活候选数——八先例同机制） */
const RNG_CALLS_LOCK = 73232;
/** 皮拓扑面数（6 骨架 + 1 领导：主干 406 + L1 1008 + L2 2352 + L3 3780 + L4 7560 +
 *  L5 9072——槽间恒等的结构性保证） */
const BARK_TRIS_LOCK = 24178;

const built: BischofiaGeometryResult[] = [];

function buildTracked(seed: number, profile = BISCHOFIA_SLOT0_PROFILE): BischofiaGeometryResult {
  const result = buildBischofiaGeometry(mulberry32(seed), profile);
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
    const a = buildBischofiaGeometry(mulberry32(SEED0));
    const b = buildTracked(SEED0, BISCHOFIA_SLOT0_PROFILE);
    built.push(a);
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.stats).toEqual(b.stats);
  }, 30000);

  it(`rng 消费恒等 ${RNG_CALLS_LOCK}（消费顺序即契约——次数变化 = 随机流重排；无花果挂点零 rng）`, () => {
    const stream = mulberry32(SEED0);
    let calls = 0;
    buildTracked(SEED0); // 账目构建（dispose 归 afterEach）
    const stream2 = mulberry32(SEED0);
    buildBischofiaGeometry(
      () => {
        calls++;
        return stream2();
      },
      BISCHOFIA_SLOT0_PROFILE,
      'high',
    ).geometry.dispose();
    void stream;
    expect(calls).toBe(RNG_CALLS_LOCK);
  }, 30000);
});

describe('组序与皮拓扑（D15 恰 2 组 + 结构计数恒等）', () => {
  it(`五级拓扑计数恒等 [7,21,63,189,378]、皮面数恒等 ${BARK_TRIS_LOCK}（6 骨架 + 1 领导——槽间皮恒定的前提）`, () => {
    const { stats, geometry } = buildTracked(SEED0);
    expect(stats.levelBranches).toEqual([7, 21, 63, 189, 378]);
    expect(stats.barkTriangles).toBe(BARK_TRIS_LOCK);
    expect(geometry.groups, '应恰 2 组（皮 0 / 复叶卡 1——无花果资产：组 0 = 纯皮拓扑）').toHaveLength(2);
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

describe('三出复叶中卡簇挂点（重阳木独有身份——家族复叶第二型，Spec §4 三出复叶互生散生 Verified [1][3] + Step 1 判定 A/B）', () => {
  it('每簇存活叶量 ≤ 8（互生节位合并抽象候选上限）且均值 ≥ 4（预算半）；簇账守恒（簇账 = 总卡数）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.clusterLeafMax, '逐簇存活数应 ≤ 每簇候选 8').toBeLessThanOrEqual(8);
    expect(stats.clusterLeafMean, '逐簇均值应 ≥ 预算半（互生散簇存活典型 4–7）').toBeGreaterThanOrEqual(4);
    expect(stats.clusterLeaves.reduce((s, n) => s + n, 0)).toBe(stats.leafCards);
  }, 30000);

  it('卡几何域：宽 ∈ [0.21, 0.315]、长/宽 = 1/0.75 恒比例（冻结接口——尺寸抖动仅缩放不改比例；三出展幅 20–30cm ×1.4 映射 Spec [1][3]）', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    // 组 1 纯复叶卡（无花果资产——组 1 无附加块，逐 6 顶点直扫）
    const leaf = result.geometry.groups[1]!;
    const pos = result.geometry.getAttribute('position');
    let bad = 0;
    let cards = 0;
    const aspectLock = 1 / 0.75;
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
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
        w < BISCHOFIA_SLOT0_PROFILE.leafWidthMin - 1e-4 ||
        w > BISCHOFIA_SLOT0_PROFILE.leafWidthMin + BISCHOFIA_SLOT0_PROFILE.leafWidthSpan + 1e-4 ||
        Math.abs(aspect - aspectLock) > 1e-4
      ) {
        bad++;
      }
    }
    expect(cards, '卡扫描数应 = stats.leafCards').toBe(stats.leafCards);
    expect(bad, '卡宽应 ∈ [0.21, 0.315]、长/宽恒 = 1/0.75（冻结比例卡；1e-4 容差 = Float32 顶点存储噪声）').toBe(0);
  }, 30000);

  it('aBend 卡内根→尖非降（复叶卡契约）；aLeafRand ∈ [0,1) 且组 0 恒 0', () => {
    const result = buildTracked(SEED0);
    const bend = result.geometry.getAttribute('aBend');
    const rand = result.geometry.getAttribute('aLeafRand');
    const leaf = result.geometry.groups[1]!;
    let badBend = 0;
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      // 根边（顶点 0,1,3 = 总柄基）/ 尖边（2,4,5 = 顶小叶尖）——bendRoot ≤ bendTip
      if (bend.array[base]! > bend.array[base + 2]! + 1e-9) badBend++;
    }
    expect(badBend, '卡内 aBend 应根→尖非降').toBe(0);
    const count = result.geometry.getAttribute('position').count;
    let badRand = 0;
    for (let i = 0; i < count; i++) {
      if (rand.array[i]! < 0 || rand.array[i]! >= 1) badRand++;
    }
    expect(badRand, 'aLeafRand 应 ∈ [0,1)').toBe(0);
    // 组 0 = 纯皮拓扑（无花果资产）：树皮语义位恒 0
    const bark = result.geometry.groups[0]!;
    let badZero = 0;
    for (let i = bark.start; i < bark.start + bark.count; i++) {
      if (rand.array[i]! !== 0 || bend.array[i]! !== 0) badZero++;
    }
    expect(badZero, '组 0 aLeafRand/aBend 应恒 0').toBe(0);
  }, 30000);
});

describe('uv 域身份标记双重隔离（无花果资产结构锁——Step 1 判定 C：无 v∈[4,7) 花果域；家族探针断言纪律沿用）', () => {
  it('v∈[4,7) 顶点数 = 0（无花果域断言）；皮组其余顶点 v < 2.5（皮管弧长域实测 max 1.99）；叶组 uv 标准 0–1 四边形域', () => {
    const result = buildTracked(SEED0);
    const uv = result.geometry.getAttribute('uv');
    const count = result.geometry.getAttribute('position').count;
    let inForbidden = 0;
    let barkMaxV = 0;
    for (let i = 0; i < count; i++) {
      const v = uv.array[i * 2 + 1]!;
      if (v >= 4 && v < 7) inForbidden++;
    }
    const bark = result.geometry.groups[0]!;
    for (let i = bark.start; i < bark.start + bark.count; i++) {
      barkMaxV = Math.max(barkMaxV, uv.array[i * 2 + 1]!);
    }
    expect(inForbidden, '无花果资产：v∈[4,7) 域应空（无花果账目——终审 ③-2 裁决的结构锁）').toBe(0);
    expect(barkMaxV, '皮管弧长域 max v 应 < 2.5（实测 1.99——10m 级最长枝弧 ×0.5）').toBeLessThan(2.5);
    // 叶组 uv 标准 0–1 四边形域（v 轴 = 总柄基 0 → 顶小叶尖 1；u 0–1）
    const leaf = result.geometry.groups[1]!;
    let badLeafUv = 0;
    for (let i = leaf.start; i < leaf.start + leaf.count; i++) {
      const u = uv.array[i * 2]!;
      const v = uv.array[i * 2 + 1]!;
      if (u < -1e-6 || u > 1 + 1e-6 || v < -1e-6 || v > 1 + 1e-6) badLeafUv++;
    }
    expect(badLeafUv, '叶卡 uv 应落标准 0–1 四边形域（材质 SDF 裸柄线域 v∈[0,0.35] 的几何侧不变式）').toBe(0);
  }, 30000);

  it('组账守恒：组 0 三角 = 纯皮拓扑（无花果资产——无附加块）；组 1 三角 = 复叶卡 × 2', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    const group0Tris = result.geometry.groups[0]!.count / 3;
    const group1Tris = result.geometry.groups[1]!.count / 3;
    expect(group0Tris, '组 0 三角 = 纯皮拓扑（无花果资产）').toBe(stats.barkTriangles);
    expect(group1Tris, '组 1 三角 = 纯复叶卡 × 2').toBe(stats.leafCards * 2);
  }, 30000);
});

describe('冠内通透（显式规则：通道 / 内层密度衰减 / 局部空腔）', () => {
  /** 存活叶卡挂点数组（根边中点 = 顶点 0,1 均值 = 通透过滤时的候选中心——与规则判定
   *  口径严格对齐；组 1 纯卡无附加块） */
  function cardRootMidpoints(result: BischofiaGeometryResult): { x: number; y: number; z: number }[] {
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

  it('通透规则实际生效：存在剔卡，且枝干通道与密度场两规则均命中；账目守恒', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.leafCards).toBeLessThan(stats.leafCandidates);
    expect(stats.channelRejects, '枝干通道应实际剔卡（伞形下带水平骨架与叶幕重叠区）').toBeGreaterThan(0);
    expect(stats.gradientRejects, '内层密度衰减应实际剔卡').toBeGreaterThan(0);
    expect(stats.leafCards).toBe(stats.leafCandidates - stats.channelRejects - stats.voidRejects - stats.gradientRejects);
  }, 30000);

  it('外密内疏：内核（q<0.4）叶卡保留率显著低于外壳（q>0.6），外壳高保留（外密内疏家族方向沿用——Spec crown_fill_gradient Unknown 结构缺口）', () => {
    const { stats } = buildTracked(SEED0);
    const innerCand = stats.qCandidates[0]! + stats.qCandidates[1]!;
    const innerSurv = stats.qSurvived[0]! + stats.qSurvived[1]!;
    const shellCand = stats.qCandidates[3]! + stats.qCandidates[4]!;
    const shellSurv = stats.qSurvived[3]! + stats.qSurvived[4]!;
    expect(innerCand, '内核应有候选卡').toBeGreaterThan(50);
    const innerRet = innerSurv / innerCand;
    const shellRet = shellSurv / shellCand;
    expect(shellRet, '外壳保留率应高保留（中密大叶层叠——Spec §3 中带）').toBeGreaterThanOrEqual(0.85);
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

describe('枝梢驱动叶簇（家族方法沿用：枝梢 → 簇空间 → 互生螺旋散排）', () => {
  it('簇-枝梢绑定：簇数 > 0、L5 末梢挂簇占主导；簇中心贴挂点（cm 级）；簇方向 = 枝切向单位向量；簇账目守恒', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.clusters.length, '应有保留簇').toBeGreaterThan(0);
    const l5 = stats.clusters.filter((c) => c.level === 4).length;
    const l4 = stats.clusters.filter((c) => c.level === 3).length;
    expect(l5, 'L5 末梢簇应占主导（末级枝外段受光区）').toBeGreaterThan(l4);
    // 簇剔除账目守恒：保留 + 剔除 = 簇位总数（每 L5 枝 clustersL5 簇 + 每 L4 枝 clustersL4 簇）
    expect(stats.clusters.length + stats.clustersCulled).toBe(
      stats.levelBranches[4]! * BISCHOFIA_SLOT0_PROFILE.clustersL5 + stats.levelBranches[3]! * BISCHOFIA_SLOT0_PROFILE.clustersL4,
    );
    // 簇中心 = 挂点沿切向前移极近一位（前移 ≤ 0.2×簇半径 ≤ 0.2×0.276（L4 ×1.2 上限）=
    // 0.055m——cm 级
    let maxBind = 0;
    let maxUnitErr = 0;
    for (const c of stats.clusters) {
      maxBind = Math.max(maxBind, Math.hypot(c.cx - c.attachX, c.cy - c.attachY, c.cz - c.attachZ));
      maxUnitErr = Math.max(maxUnitErr, Math.abs(Math.hypot(c.dirX, c.dirY, c.dirZ) - 1));
    }
    expect(maxBind, '簇中心到挂点距离应 < 0.08m（cm 级——前移 ≤ 0.2×簇半径）').toBeLessThan(0.08);
    expect(maxUnitErr, '簇方向应为单位向量').toBeLessThan(1e-6);
  }, 30000);

  it('簇间间隙：近邻簇中心距 ≥ 0.5×(ri+rj) 的簇占比 ≥ 90%（clusterMinSeparation=0.55 距离抑制保证下界——散簇语义）', () => {
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

describe('树皮起伏确定性（褐纵裂深沟宽脊 + 扭转中-深浮雕——amplitude 0.028 / {3,4,5} / drift 6.5）', () => {
  /** 皮组某管某段 ring A 的顶点索引（a0 = 每四边形首顶点；发射序 = 主干 → 底盖 → L1 → 深度优先首链） */
  function ringRadii(result: BischofiaGeometryResult, base: number, seg: number, radial: number): number[] {
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
  const TRUNK_RADIAL = BISCHOFIA_SLOT0_PROFILE.trunk.radial;
  const TRUNK_SEGS = BISCHOFIA_SLOT0_PROFILE.trunk.segs;
  const L1_BASE = TRUNK_SEGS * TRUNK_RADIAL * 6 + TRUNK_RADIAL * 3; // 1218
  const L5_BASE =
    L1_BASE +
    9 * 8 * 6 + // L1：9 段 ×8 径向
    8 * 7 * 6 + // L2
    5 * 6 * 6 + // L3
    4 * 5 * 6; // L4 → 首 L5 管（2406）

  it('主干全部环截面极差/环均径 ∈ [2.5%, 7%]，最大极差 ≥ 10mm（毫米级中-深浮雕——bark-a「脊宽沟深」/bark-b 中龄档读向 [7]；实测带 3.6–6.1% / 18.0mm）', () => {
    const result = buildTracked(SEED0);
    expect(result.stats.barkTriangles, '皮拓扑不受起伏影响（emitTube 只动顶点域）').toBe(BARK_TRIS_LOCK);
    let maxAbs = 0;
    for (let seg = 0; seg < TRUNK_SEGS; seg++) {
      const radii = ringRadii(result, 0, seg, TRUNK_RADIAL);
      const mean = radii.reduce((s, r) => s + r, 0) / radii.length;
      const range = Math.max(...radii) - Math.min(...radii);
      maxAbs = Math.max(maxAbs, range);
      expect(range / mean, `主干环 ${seg} 极差/均径应 ≥ 2.5%（中-深浮雕可辨）`).toBeGreaterThanOrEqual(0.025);
      expect(range / mean, `主干环 ${seg} 极差/均径应 ≤ 7%（中-深档不夸张）`).toBeLessThanOrEqual(0.07);
    }
    expect(maxAbs * 1000, '主干最大极差应 ≥ 10mm（基径 0.25–0.31m × flare × 幅度比 2.8%；终测 18.0mm）').toBeGreaterThanOrEqual(10);
  }, 30000);

  it('抬档亚视觉地板：L1/L5 首环极差 < 1e-6（起径 < 0.125m 的管平滑发射——仅主干有效起伏；「细枝红褐-灰褐较光滑带皮孔」fruit-c/bark-a [7]，皮孔/色序归材质层；1e-6 容差 = Float32 顶点存储噪声，实测 ~1e-7）', () => {
    const result = buildTracked(SEED0);
    const l1 = ringRadii(result, L1_BASE, 0, BISCHOFIA_SLOT0_PROFILE.levels[0]!.radial);
    const l1Range = Math.max(...l1) - Math.min(...l1);
    const l5 = ringRadii(result, L5_BASE, 0, BISCHOFIA_SLOT0_PROFILE.levels[4]!.radial);
    const l5Range = Math.max(...l5) - Math.min(...l5);
    expect(l1Range, 'L1 首环极差应 = 0 级（起径 0.09–0.10 < 0.125 抬档地板——圆管）').toBeLessThan(1e-6);
    expect(l5Range, 'L5 首环极差应 = 0 级（末梢亚毫米层被地板跳过）').toBeLessThan(1e-6);
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
    const sparse = buildTracked(SEED0, { ...BISCHOFIA_SLOT0_PROFILE, canopyDensity: 0.25 });
    expect(sparse.stats.barkTriangles).toBe(base.stats.barkTriangles); // 皮拓扑不受密度影响
    expect(sparse.stats.leafCards).toBeLessThan(base.stats.leafCards * 0.5);
  }, 30000);
});
