/**
 * tests/runtime/procedural/tree/ligustrumStructure.test.ts —— 女贞枝干结构真实性
 * 测试（T011.11，对称 fraxinus organization——方法复制，数值锚为女贞自己的
 * 2026-09-22 终测（规范种子 = morphSeedOf(id, 0)）；**单叶卡 decussate 对生簇挂点
 * + 肾形核果满冠下垂密簇零 rng 账目 + 无花资产 uv 域（果域 v∈[4,5] + 隔离带空）
 * = 女贞独有断言组**）。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildLigustrumGeometry 消费扩展 stats，与资产
 * 入口契约（asset_tree_ligustrum.asset）互补——本文件锁「结构怎么长」，那边锁「契约
 * 怎么传」）：
 * - 确定性：同 rng seed + 同 shapeProfile 两次构建 → 全属性逐位相等、stats 账目全等；
 *   rng 消费恒等 85055（消费顺序即契约——次数变化 = 随机流重排；011.3 ③ 教训：包裹
 *   rng 闭包逐调用计数口径；**核果挂点零 rng（确定性账目）——消费全在骨架/簇/通透
 *   roll**；跨槽/跨 seed 随保留簇数浮动（通透 roll 计数机制，先例同款记档）；
 * - 组序恰 2（D15 免组膨胀：皮 0 / 单叶卡 1——**核果入皮组（组 0）**）；皮拓扑面数
 *   恒等 24236（6 骨架 + 1 领导拓扑，主干径向 16 承载细窄脊谐波 {5,7}）；组账守恒
 *   （组 0 = 皮拓扑 + 核果 / 组 1 = 卡×2）；
 * - 主次分级：五级拓扑计数恒等 [7,21,63,189,378]；各级平均起径严格递减；一级骨架枝
 *   （含领导枝）≥ 2.2× 次级、≥ 12× 末梢——「所有分枝视觉权重接近即不达标」的结构化判据；
 * - **单叶卡 decussate 对生簇挂点（女贞独有身份，家族首例对生单叶挂点语言——任务书
 *   裁决 5：「叶对生，单叶」属级 Verified [3][4][7] 的几何落地，沿 fraxinus 机制直接
 *   继承）**：每簇存活叶量 ≤ 10（对生叶节位合并抽象候选上限 = 5 对生对）且均值 ≥ 预算
 *   半（5）；簇账守恒（簇账 = 总卡数）；卡几何域（宽 0.06–0.16m / **长/宽 ∈ 1.7–2.8
 *   变比例域**（真叶 6–17 × 3–8cm ×2 家族映射——vs 白蜡复叶卡恒比例冻结，单叶系
 *   变比例如实映射）落 profile 域）；**对生结构双指纹**：①簇内卡方位成对性（卡中心
 *   相对簇心方位差 ∈ [150°,210°] 的成对率 ≥ 0.4——decussate 对内正对 ±180°〔+jitter
 *   ±11.5° + wobble 噪声〕+ 同轴循环对的复合成对读向；随机方位期望成对率 ≈ 0.17，
 *   阈值区分度足）②对内共享节位 r̂（对首卡消费 rng、对次卡复用——同节对生语义：
 *   同簇相邻烘焙卡对 rhat 严格相等比例 ≥ 0.30）；
 * - **uv 域身份标记 + 肾形核果账目（女贞独有断言组——核果做（任务书裁决 1）/ 花不做
 *   （裁决 2）；家族探针断言纪律沿用；2026-09-22 主代理终审裁定对齐族冻结 v 轴口径）**：
 *   果域 v∈[4,5] 顶点数 = 果卡 × 12（正反双 quad 4 tri × 3 顶点）；
 *   **v∈[3,4) 顶点数 = 0（隔离带空——皮管弧长域与果域的隔离带）**；**v∈[5,7)
 *   顶点数 = 0（无花资产——裁决 2 的结构锁）**；皮组其余顶点 v < 2.5（皮管弧长域
 *   实测 max 1.609——8m 级最长枝弧 ×0.5，≤≈2.9 族纪律内）且 u ≤ 1（环向 θ/2π 与
 *   底盖 0.5+0.5cosθ 域）；叶组
 *   uv 标准 0–1 四边形域（v 轴 = 叶基 0 → 叶尖 1、u = 叶宽方向——材质单叶 SDF 的
 *   几何侧不变式）；核果账目（簇数/果卡数/三角 = 果卡 × 4；簇数落满冠密簇定值带
 *   35–60（实测 39–59）；果卡数 ∈ [8×簇, 12×簇]——「数十果/序」视觉密度档的全域
 *   确定性分布账目锁；果卡总数落 350–650 数量级带（实测 399–590））；
 * - 冠内通透（显式规则）：候选 → 存活存在剔卡且枝干通道/密度场两规则实际命中；外密
 *   内疏——内核保留率显著低于外壳（家族方向沿用；常绿密档）；枝干通道——存活叶卡
 *   挂点（根边中点 = 过滤判定口径）距通道线段带内数为 0；通透不挖空整层——冠顶/
 *   冠底 1/3 高度带均有存活叶卡；
 * - 枝梢驱动叶簇（家族方法沿用）：簇-枝梢绑定（簇中心贴挂点 + 簇方向 = 挂点枝切向
 *   单位向量 + L5 末梢挂簇占主导）；簇间间隙（minSeparation 0.52 距离抑制）；
 *   shellBias 平摊（对生散布团块域分布）；
 * - 贴地契约：minY 精确 0（原点 = 底部中心）；
 * - **树高锚（任务书口径：≈8m 实测断言）**：slot-0 总高落 [7.8, 9.0]（≈8m 终审裁决
 *   2 维持——form-d 单整树样木主锚；终测 8.41——树高域/领导比两轮回调后锚域中带）；
 * - 树皮起伏确定性（灰褐细窄纵脊浅沟低浮雕——amplitude 0.016 / {5,7} / drift 3.4）：
 *   主干环截面起伏存在（极差/环均径 2.0–4.5% 实测带 + 最大极差 ≥ 3.5mm 毫米级——
 *   细浅脊沟量级域〔vs 樟 0.036 深纵裂低两档〕）；**L1/L5 环极差 = 0 级（亚视觉
 *   地板 3.0mm——起径 < 0.1875m 的管平滑发射，仅主干有效起伏，「皮孔在枝不在干」
 *   FRPS [1] 的几何侧读向，灰褐色调/细纹质感归材质层）**；wrap 位浮点级无缝；
 * - shapeProfile 参数面真实驱动：canopyDensity 压低 → 叶卡数显著下降。
 * 边界：构建产物 afterEach 统一 dispose。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { buildLigustrumGeometry } from '../../../../src/runtime/procedural/tree/ligustrum/ligustrumGeometry';
import type { LigustrumGeometryResult } from '../../../../src/runtime/procedural/tree/ligustrum/ligustrumGeometry';
import { LIGUSTRUM_SLOT0_PROFILE } from '../../../../src/runtime/procedural/tree/ligustrum/ligustrumShapeProfile';

const SEED0 = morphSeedOf('asset_tree_ligustrum', 0);
/** slot-0 High rng 消费快照（2026-09-22 终测，包裹闭包逐调用计数——任何条件跳过消费
 *  都违约；核果挂点零 rng（确定性账目）——消费全在骨架/簇/通透 roll；跨槽/跨 seed 随
 *  保留簇数变化（通透 roll 计数 = 存活候选数——先例同机制；对生对内共享 r̂ 的消费
 *  结构：对首卡 8 次/对次卡 7 次——j 奇偶确定性，固定次数纪律不破） */
const RNG_CALLS_LOCK = 85055;
/** 皮拓扑面数（6 骨架 + 1 领导：主干 464（14 段 ×16 + 底盖 16——径向 16 承载细窄脊
 * 谐波 {5,7}）+ L1 1008 + L2 2352 + L3 3780 + L4 7560 + L5 9072——槽间恒等的结构性保证） */
const BARK_TRIS_LOCK = 24236;

const built: LigustrumGeometryResult[] = [];

function buildTracked(seed: number, profile = LIGUSTRUM_SLOT0_PROFILE): LigustrumGeometryResult {
  const result = buildLigustrumGeometry(mulberry32(seed), profile);
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
    const a = buildLigustrumGeometry(mulberry32(SEED0));
    const b = buildTracked(SEED0, LIGUSTRUM_SLOT0_PROFILE);
    built.push(a);
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.stats).toEqual(b.stats);
  }, 30000);

  it(`rng 消费恒等 ${RNG_CALLS_LOCK}（消费顺序即契约——次数变化 = 随机流重排；核果挂点零 rng）`, () => {
    const stream = mulberry32(SEED0);
    let calls = 0;
    buildTracked(SEED0); // 账目构建（dispose 归 afterEach）
    const stream2 = mulberry32(SEED0);
    buildLigustrumGeometry(
      () => {
        calls++;
        return stream2();
      },
      LIGUSTRUM_SLOT0_PROFILE,
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
    expect(geometry.groups, '应恰 2 组（皮+核果 0 / 单叶卡 1——核果入皮组）').toHaveLength(2);
    expect(geometry.groups[0]!.materialIndex).toBe(0);
    expect(geometry.groups[1]!.materialIndex).toBe(1);
  }, 30000);

  it('各级平均起径严格递减；L1 ≥ 2.2×L2 且 L1 ≥ 12×L5（层级对比可感知判据；终测 L1/L2 2.9 / L1/L5 22.3）', () => {
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

describe('单叶卡 decussate 对生簇挂点（女贞独有身份——家族首例对生单叶挂点语言，任务书裁决 5「叶对生，单叶」属级 Verified [3][4][7]）', () => {
  it('每簇存活叶量 ≤ 10（对生叶节位合并抽象候选上限 = 5 对生对）且均值 ≥ 5（预算半）；簇账守恒（簇账 = 总卡数）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.clusterLeafMax, '逐簇存活数应 ≤ 每簇候选 10').toBeLessThanOrEqual(10);
    expect(stats.clusterLeafMean, '逐簇均值应 ≥ 预算半（对生散簇存活典型 6–10；终测 8.07）').toBeGreaterThanOrEqual(5);
    expect(stats.clusterLeaves.reduce((s, n) => s + n, 0)).toBe(stats.leafCards);
  }, 30000);

  it('卡几何域：宽 ∈ [0.06, 0.16]、长/宽 ∈ [1.7, 2.8] 变比例域（真叶 6–17 × 3–8cm ×2 家族映射 Spec [1][2]——单叶系变比例如实映射，vs 白蜡复叶卡恒比例冻结）', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    // 组 1 纯单叶卡（无花资产——组 1 无附加块，逐 6 顶点直扫）
    const leaf = result.geometry.groups[1]!;
    const pos = result.geometry.getAttribute('position');
    let bad = 0;
    let cards = 0;
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
        w < LIGUSTRUM_SLOT0_PROFILE.leafWidthMin - 1e-4 ||
        w > LIGUSTRUM_SLOT0_PROFILE.leafWidthMin + LIGUSTRUM_SLOT0_PROFILE.leafWidthSpan + 1e-4 ||
        aspect < LIGUSTRUM_SLOT0_PROFILE.leafAspectMin - 1e-4 ||
        aspect > LIGUSTRUM_SLOT0_PROFILE.leafAspectMin + LIGUSTRUM_SLOT0_PROFILE.leafAspectSpan + 1e-4
      ) {
        bad++;
      }
    }
    expect(cards, '卡扫描数应 = stats.leafCards').toBe(stats.leafCards);
    expect(bad, '卡宽应 ∈ [0.06, 0.16]、长/宽应 ∈ [1.7, 2.8]（1e-4 容差 = Float32 顶点存储噪声）').toBe(0);
  }, 30000);

  it('对生结构指纹①：簇内卡方位成对性——方位差 ∈ [150°,210°] 的成对率 ≥ 0.4（decussate 对内正对 ±180° + 同轴循环对复合；vs 黄金角互生均匀方位期望 ≈ 0.17）', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    const leaf = result.geometry.groups[1]!;
    const pos = result.geometry.getAttribute('position');
    // 烘焙序按 clusterLeaves 计数切分归簇（候选序 = 簇生成序 × j 序——同簇连续）
    let base = leaf.start;
    let totalCards = 0;
    let pairedCount = 0;
    for (let ci = 0; ci < stats.clusterLeaves.length; ci++) {
      const n = stats.clusterLeaves[ci]!;
      const cluster = stats.clusters[ci]!;
      const angles: number[] = [];
      for (let k = 0; k < n; k++) {
        let x = 0;
        let z = 0;
        for (let v = 0; v < 6; v++) {
          x += pos.array[(base + v) * 3]!;
          z += pos.array[(base + v) * 3 + 2]!;
        }
        x /= 6;
        z /= 6;
        angles.push(Math.atan2(z - cluster.cz, x - cluster.cx));
        base += 6;
      }
      totalCards += n;
      // 全对方位差统计（圆周差取 ≤180°）
      let pairsInWindow = 0;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          let d = Math.abs(angles[i]! - angles[j]!) * (180 / Math.PI);
          if (d > 180) d = 360 - d;
          if (d >= 150 && d <= 210) pairsInWindow++;
        }
      }
      pairedCount += pairsInWindow;
    }
    expect(totalCards).toBe(stats.leafCards);
    const pairRate = pairedCount / totalCards;
    expect(pairRate, `簇内方位成对率应 ≥ 0.4（decussate 对生读向；实测 ${pairRate.toFixed(3)}）`).toBeGreaterThanOrEqual(0.4);
  }, 30000);

  it('对生结构指纹②：对内共享节位 r̂——同簇相邻烘焙卡对 rhat 严格相等比例 ≥ 0.30（对首卡消费/对次卡复用的同节对生语义；随机独立 r̂ 期望 ≈ 0）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.leafRhat).toHaveLength(stats.leafCards);
    // 烘焙序按 clusterLeaves 切分；簇内相邻对中同对（j, j+1 同对）rhat 相等
    let idx = 0;
    let adjacent = 0;
    let equal = 0;
    for (const n of stats.clusterLeaves) {
      for (let k = 0; k + 1 < n; k++) {
        adjacent++;
        if (stats.leafRhat[idx + k] === stats.leafRhat[idx + k + 1]) equal++;
      }
      idx += n;
    }
    expect(adjacent, '应有簇内相邻卡对').toBeGreaterThan(0);
    const ratio = equal / adjacent;
    expect(ratio, `同簇相邻卡对 rhat 相等比例应 ≥ 0.30（对内共享节位；实测 ${ratio.toFixed(3)}）`).toBeGreaterThanOrEqual(0.3);
  }, 30000);

  it('aBend 卡内根→尖非降（单叶卡契约——根 = 叶基、尖 = 叶尖）；aLeafRand ∈ [0,1) 且组 0 恒 0', () => {
    const result = buildTracked(SEED0);
    const bend = result.geometry.getAttribute('aBend');
    const rand = result.geometry.getAttribute('aLeafRand');
    const leaf = result.geometry.groups[1]!;
    let badBend = 0;
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      // 根边（顶点 0,1,3 = 叶基）/ 尖边（2,4,5 = 叶尖）——bendRoot ≤ bendTip
      if (bend.array[base]! > bend.array[base + 2]! + 1e-9) badBend++;
    }
    expect(badBend, '卡内 aBend 应根→尖非降').toBe(0);
    const count = result.geometry.getAttribute('position').count;
    let badRand = 0;
    for (let i = 0; i < count; i++) {
      if (rand.array[i]! < 0 || rand.array[i]! >= 1) badRand++;
    }
    expect(badRand, 'aLeafRand 应 ∈ [0,1)').toBe(0);
    // 组 0 = 皮拓扑 + 核果：树皮语义位恒 0（核果刚性——aLeafRand/aBend 随皮组恒 0）
    const bark = result.geometry.groups[0]!;
    let badZero = 0;
    for (let i = bark.start; i < bark.start + bark.count; i++) {
      if (rand.array[i]! !== 0 || bend.array[i]! !== 0) badZero++;
    }
    expect(badZero, '组 0 aLeafRand/aBend 应恒 0（皮 + 核果刚性悬垂）').toBe(0);
  }, 30000);
});

describe('uv 域身份标记 + 肾形核果账目（女贞独有断言组——核果做（任务书裁决 1）/ 花不做（裁决 2）；家族探针断言纪律沿用）', () => {
  it('果域 v∈[4,5] 顶点数 = 果卡 × 12；v∈[3,4) 顶点数 = 0（隔离带空）；v∈[5,7) 顶点数 = 0（无花资产）；皮组其余顶点 v < 2.5（弧长域实测 max 1.609）且 u ≤ 1（环向 + 底盖域）；叶组 uv 标准 0–1 四边形域', () => {
    const result = buildTracked(SEED0);
    const uv = result.geometry.getAttribute('uv');
    const count = result.geometry.getAttribute('position').count;
    let fruitDomain = 0;
    let isolationBand = 0;
    let flowerDomain = 0;
    let barkMaxV = 0;
    let barkBadU = 0;
    for (let i = 0; i < count; i++) {
      const u = uv.array[i * 2]!;
      const v = uv.array[i * 2 + 1]!;
      if (v >= 4 && v < 5) fruitDomain++;
      else if (v >= 3 && v < 4) isolationBand++;
      else if (v >= 5 && v < 7) flowerDomain++;
      else if (v < 3) {
        if (u > 1 + 1e-6) barkBadU++;
        barkMaxV = Math.max(barkMaxV, v);
      }
    }
    expect(fruitDomain, '果域顶点应 = 果卡 × 12（正反双 quad 4 tri × 3 顶点——uv (u,4.0)(u,4.0)(u,4.97)）').toBe(
      result.stats.drupeCards * 12,
    );
    expect(isolationBand, 'v∈[3,4) 隔离带应空（皮管弧长域与果域隔离——platanus 域碰撞先例教训）').toBe(0);
    expect(flowerDomain, '无花资产：v∈[5,7) 花域应空（任务书裁决 2 的结构锁）').toBe(0);
    expect(barkBadU, '皮组其余顶点 u 应 ≤ 1（环向 θ/2π + 底盖 0.5+0.5cosθ 域）').toBe(0);
    expect(barkMaxV, '皮管弧长域 max v 应 < 2.5（实测 1.609——8m 级最长枝弧 ×0.5；≤≈2.9 族纪律内无需压缩）').toBeLessThan(2.5);
    // 叶组 uv 标准 0–1 四边形域（v 轴 = 叶基 0 → 叶尖 1；u 0–1 叶宽方向）
    const leaf = result.geometry.groups[1]!;
    let badLeafUv = 0;
    for (let i = leaf.start; i < leaf.start + leaf.count; i++) {
      const u = uv.array[i * 2]!;
      const v = uv.array[i * 2 + 1]!;
      if (u < -1e-6 || u > 1 + 1e-6 || v < -1e-6 || v > 1 + 1e-6) badLeafUv++;
    }
    expect(badLeafUv, '叶卡 uv 应落标准 0–1 四边形域（材质单叶 SDF 的几何侧不变式）').toBe(0);
  }, 30000);

  it('组账守恒：组 0 三角 = 皮拓扑 + 核果（果卡 × 4）；组 1 三角 = 单叶卡 × 2', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    const group0Tris = result.geometry.groups[0]!.count / 3;
    const group1Tris = result.geometry.groups[1]!.count / 3;
    expect(group0Tris, '组 0 三角 = 皮拓扑 + 核果（核果入皮组——材质按 v 域分流）').toBe(
      stats.barkTriangles + stats.drupeTriangles,
    );
    expect(group1Tris, '组 1 三角 = 纯单叶卡 × 2').toBe(stats.leafCards * 2);
  }, 30000);

  it('核果账目：簇数落满冠密簇定值带 35–60（实测 39–59——8 槽终测带）；果卡数 ∈ [8×簇, 12×簇]（「数十果/序」视觉密度档全域分布）；三角 = 果卡 × 4（正反双 quad）；果卡总数落 350–650 数量级带（实测 399–590）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.drupeClusters, 'slot-0 应有核果簇（满冠下垂密簇身份信号——任务书裁决 1）').toBeGreaterThanOrEqual(35);
    expect(stats.drupeClusters).toBeLessThanOrEqual(60);
    expect(stats.drupeCards, '果卡数应 ≥ 8×簇（每簇最少 8 果卡）').toBeGreaterThanOrEqual(stats.drupeClusters * 8);
    expect(stats.drupeCards, '果卡数应 ≤ 12×簇（每簇最多 12 果卡——视觉密度档上沿）').toBeLessThanOrEqual(stats.drupeClusters * 12);
    expect(stats.drupeTriangles).toBe(stats.drupeCards * 4);
    expect(stats.drupeCards, '果卡总数应落 350–650 数量级带（绝对数不承重——视觉密度档工程定档）').toBeGreaterThanOrEqual(350);
    expect(stats.drupeCards).toBeLessThanOrEqual(650);
  }, 30000);
});

describe('冠内通透（显式规则：通道 / 内层密度衰减 / 局部空腔）', () => {
  /** 存活叶卡挂点数组（根边中点 = 顶点 0,1 均值 = 通透过滤时的候选中心——与规则判定
   *  口径严格对齐；组 1 纯卡无附加块） */
  function cardRootMidpoints(result: LigustrumGeometryResult): { x: number; y: number; z: number }[] {
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
    expect(stats.channelRejects, '枝干通道应实际剔卡（骨架枝与叶幕重叠区）').toBeGreaterThan(0);
    expect(stats.gradientRejects, '内层密度衰减应实际剔卡').toBeGreaterThan(0);
    expect(stats.leafCards).toBe(stats.leafCandidates - stats.channelRejects - stats.voidRejects - stats.gradientRejects);
  }, 30000);

  it('外密内疏：内核（q<0.4）叶卡保留率显著低于外壳（q>0.6），外壳保留随常绿密档（0.95——空隙 5–15% 读向；终测内 0.37 级 / 外 0.95 级）', () => {
    const { stats } = buildTracked(SEED0);
    const innerCand = stats.qCandidates[0]! + stats.qCandidates[1]!;
    const innerSurv = stats.qSurvived[0]! + stats.qSurvived[1]!;
    const shellCand = stats.qCandidates[3]! + stats.qCandidates[4]!;
    const shellSurv = stats.qSurvived[3]! + stats.qSurvived[4]!;
    expect(innerCand, '内核应有候选卡').toBeGreaterThan(50);
    const innerRet = innerSurv / innerCand;
    const shellRet = shellSurv / shellCand;
    expect(shellRet, '外壳保留率应 ≥ 密度×0.85（常绿密档外壳高保留）').toBeGreaterThanOrEqual(
      LIGUSTRUM_SLOT0_PROFILE.canopyDensity * 0.85,
    );
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

describe('枝梢驱动叶簇（家族方法沿用：枝梢 → 簇空间 → decussate 对生散排）', () => {
  it('簇-枝梢绑定：簇数 > 0、L5 末梢挂簇占主导；簇中心贴挂点（cm 级）；簇方向 = 枝切向单位向量；簇账目守恒', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.clusters.length, '应有保留簇').toBeGreaterThan(0);
    const l5 = stats.clusters.filter((c) => c.level === 4).length;
    const l4 = stats.clusters.filter((c) => c.level === 3).length;
    expect(l5, 'L5 末梢簇应占主导（末级枝外段受光区）').toBeGreaterThan(l4);
    // 簇剔除账目守恒：保留 + 剔除 = 簇位总数（每 L5 枝 clustersL5 簇 + 每 L4 枝 clustersL4 簇）
    expect(stats.clusters.length + stats.clustersCulled).toBe(
      stats.levelBranches[4]! * LIGUSTRUM_SLOT0_PROFILE.clustersL5 + stats.levelBranches[3]! * LIGUSTRUM_SLOT0_PROFILE.clustersL4,
    );
    // 簇中心 = 挂点沿切向前移极近一位（前移 ≤ 0.2×簇半径 ≤ 0.2×0.207（L4 ×1.15 上限）=
    // 0.041m——cm 级
    let maxBind = 0;
    let maxUnitErr = 0;
    for (const c of stats.clusters) {
      maxBind = Math.max(maxBind, Math.hypot(c.cx - c.attachX, c.cy - c.attachY, c.cz - c.attachZ));
      maxUnitErr = Math.max(maxUnitErr, Math.abs(Math.hypot(c.dirX, c.dirY, c.dirZ) - 1));
    }
    expect(maxBind, '簇中心到挂点距离应 < 0.08m（cm 级——前移 ≤ 0.2×簇半径）').toBeLessThan(0.08);
    expect(maxUnitErr, '簇方向应为单位向量').toBeLessThan(1e-6);
  }, 30000);

  it('簇间间隙：近邻簇中心距 ≥ 0.5×(ri+rj) 的簇占比 ≥ 90%（clusterMinSeparation=0.52 距离抑制保证下界——大簇散布语义）', () => {
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

  it('shellBias 平摊：存活卡簇内归一化半径均值 ≥ 0.7（shellBias=0.46/γ=0.85 对生散布团块域分布——叶沿簇域分布；终测 0.783）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.leafRhat).toHaveLength(stats.leafCards);
    const mean = stats.leafRhat.reduce((s, r) => s + r, 0) / stats.leafRhat.length;
    expect(mean, '存活卡 r̂ 均值应 ≥ 0.7（对生散布团块域分布）').toBeGreaterThanOrEqual(0.7);
  }, 30000);
});

describe('树皮起伏确定性（灰褐细窄纵脊浅沟低浮雕——amplitude 0.016 / {5,7} / drift 3.4，任务书裁决 7 第 12 语言）', () => {
  /** 皮组某管某段 ring A 的顶点索引（a0 = 每四边形首顶点；发射序 = 主干 → 底盖 → L1 → 深度优先首链） */
  function ringRadii(result: LigustrumGeometryResult, base: number, seg: number, radial: number): number[] {
    const pos = result.geometry.getAttribute('position');
    const idx = Array.from({ length: radial }, (_, j) => base + (seg * radial + j) * 6);
    const cx = idx.reduce((s, v) => s + pos.array[v * 3]!, 0) / radial;
    const cy = idx.reduce((s, v) => s + pos.array[v * 3 + 1]!, 0) / radial;
    const cz = idx.reduce((s, v) => s + pos.array[v * 3 + 2]!, 0) / radial;
    return idx.map((v) =>
      Math.hypot(pos.array[v * 3]! - cx, pos.array[v * 3 + 1]! - cy, pos.array[v * 3 + 2]! - cz),
    );
  }

  /** 皮组顶点流发射偏移（slot-0 拓扑：主干 14 段 ×16 管 + 16 三角底盖 → 首骨架枝 L1 →
   *  深度优先首链 L2/L3/L4 → 首 L5 管） */
  const TRUNK_RADIAL = LIGUSTRUM_SLOT0_PROFILE.trunk.radial;
  const TRUNK_SEGS = LIGUSTRUM_SLOT0_PROFILE.trunk.segs;
  const L1_BASE = TRUNK_SEGS * TRUNK_RADIAL * 6 + TRUNK_RADIAL * 3; // 1392
  const L5_BASE =
    L1_BASE +
    9 * 8 * 6 + // L1：9 段 ×8 径向
    8 * 7 * 6 + // L2
    5 * 6 * 6 + // L3
    4 * 5 * 6; // L4 → 首 L5 管（2460）

  it('主干全部环截面极差/环均径 ∈ [2.0%, 4.5%]，最大极差 ≥ 3.5mm（毫米级低浮雕——细窄脊浅沟〔FRPS 灰褐 + bark-a/b 细浅纹 [1][10]〕；0.016 幅度 × 基径 0.22–0.28 × flare；终测带 [2.47, 3.47]% / 9.1mm）', () => {
    const result = buildTracked(SEED0);
    expect(result.stats.barkTriangles, '皮拓扑不受起伏影响（emitTube 只动顶点域）').toBe(BARK_TRIS_LOCK);
    let maxAbs = 0;
    for (let seg = 0; seg < TRUNK_SEGS; seg++) {
      const radii = ringRadii(result, 0, seg, TRUNK_RADIAL);
      const mean = radii.reduce((s, r) => s + r, 0) / radii.length;
      const range = Math.max(...radii) - Math.min(...radii);
      maxAbs = Math.max(maxAbs, range);
      expect(range / mean, `主干环 ${seg} 极差/均径应 ≥ 2.0%（低浮雕可辨）`).toBeGreaterThanOrEqual(0.02);
      expect(range / mean, `主干环 ${seg} 极差/均径应 ≤ 4.5%（低浮雕不夸张）`).toBeLessThanOrEqual(0.045);
    }
    expect(maxAbs * 1000, '主干最大极差应 ≥ 3.5mm（0.016 幅度下细浅脊沟量级——含 flare 环峰值）').toBeGreaterThanOrEqual(3.5);
  }, 30000);

  it('亚视觉地板：L1/L5 首环极差 < 1e-6（起径 < 0.1875m 的管平滑发射——仅主干有效起伏；「皮孔在枝不在干」FRPS [1] 的几何侧读向，灰褐色调/细纹质感归材质层；1e-6 容差 = Float32 顶点存储噪声）', () => {
    const result = buildTracked(SEED0);
    const l1 = ringRadii(result, L1_BASE, 0, LIGUSTRUM_SLOT0_PROFILE.levels[0]!.radial);
    const l1Range = Math.max(...l1) - Math.min(...l1);
    const l5 = ringRadii(result, L5_BASE, 0, LIGUSTRUM_SLOT0_PROFILE.levels[4]!.radial);
    const l5Range = Math.max(...l5) - Math.min(...l5);
    expect(l1Range, 'L1 首环极差应 = 0 级（起径 0.07–0.09 < 0.1875 地板——圆管）').toBeLessThan(1e-6);
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

describe('贴地契约 / 参数面驱动 / 树高锚（任务书口径）', () => {
  it('minY 精确 0（原点 = 底部中心；贴地平移语义）', () => {
    const result = buildTracked(SEED0);
    result.geometry.computeBoundingBox();
    expect(Math.abs(result.geometry.boundingBox!.min.y)).toBeLessThanOrEqual(0.001);
  }, 30000);

  it('树高锚：slot-0 总高落 [7.8, 9.0]（≈8m 终审裁决 2 维持——form-d 单整树样木主锚；终测 8.41——树高域/领导比两轮回调后锚域中带）', () => {
    const result = buildTracked(SEED0);
    result.geometry.computeBoundingBox();
    const h = result.geometry.boundingBox!.max.y - result.geometry.boundingBox!.min.y;
    expect(h, 'slot-0 总高应落 ≈8m 锚域（6–10m 生产域的中带）').toBeGreaterThanOrEqual(7.8);
    expect(h).toBeLessThanOrEqual(9.0);
  }, 30000);

  it('canopyDensity 压低 → 叶卡数显著下降（同 seed 同拓扑，密度场真实消费）', () => {
    const base = buildTracked(SEED0);
    const sparse = buildTracked(SEED0, { ...LIGUSTRUM_SLOT0_PROFILE, canopyDensity: 0.25 });
    expect(sparse.stats.barkTriangles).toBe(base.stats.barkTriangles); // 皮拓扑不受密度影响
    expect(sparse.stats.leafCards).toBeLessThan(base.stats.leafCards * 0.5);
  }, 30000);
});
