/**
 * tests/runtime/procedural/tree/salixStructure.test.ts —— 垂柳枝干结构真实性
 * 测试（T011.12，对称 ligustrum organization——方法复制，数值锚为垂柳自己的
 * 2026-09-23 续作会话终测（规范种子 = morphSeedOf(id, 0)，探针六轮回调后定档）；
 * **互生细长卡沿索散簇挂点 + 卡沿索下倾（STRAND_TILT）+ 无花果资产 uv 域 +
 * 垂帘帘缘带 = 垂柳独有断言组**）。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildSalixGeometry 消费扩展 stats，与资产
 * 入口契约（asset_tree_salix.asset）互补——本文件锁「结构怎么长」，那边锁「契约
 * 怎么传」）：
 * - 确定性：同 rng seed + 同 shapeProfile 两次构建 → 全属性逐位相等、stats 账目全等；
 *   rng 消费恒等 85485（消费顺序即契约——次数变化 = 随机流重排；011.3 ③ 教训：包裹
 *   rng 闭包逐调用计数口径；跨槽/跨 seed 随保留簇数浮动（通透 roll 计数机制，先例
 *   同款记档））；
 * - 组序恰 2（D15 免组膨胀：皮 0 / 单叶卡 1——无花果资产组 0 纯皮拓扑）；皮拓扑面数
 *   恒等 26180（6 骨架 + 1 领导拓扑，主干径向 14 承载谐波 {4,6}）；组账守恒
 *   （组 0 = 皮拓扑 / 组 1 = 卡×2）；
 * - 主次分级：五级拓扑计数恒等 [7,21,63,189,378]；各级平均起径严格递减；一级骨架枝
 *   （含领导枝）≥ 2.2× 次级、≥ 12× 末梢——「所有分枝视觉权重接近即不达标」的结构化判据
 *   （终测 L1/L2 2.82 / L1/L5 54.1——垂索细化档）；**垂索径记档**：L5 实起径
 *   ~1.6mm（radiusRatio 末端 0.40 陡减 × L4 挂点径），低于族常量末径地板 0.004m →
 *   L5 管呈 1.6→4mm 地板抬升（亚厘米倒锥，中景观距不可辨；远细于地板的 2mm 索径端
 *   不可达——族常量约束记档，profile 注释同步）；
 * - **互生细长卡沿索散簇挂点（垂柳独有身份组——「叶沿垂索密排（间距 ≈0.25–0.5 叶
 *   长）、互生错位」crown-a 双问 [6] 的几何落地；黄金角螺旋互生（单叶系互生主流
 *   语言继承 platanus/triadica），vs 女贞 decussate 对生不继承）**：每簇存活叶量
 *   ≤ 10（L4 候选 10 / L5 候选 9 的上限）且均值 ≥ 4.5（预算半）；簇账守恒（簇账 =
 *   总卡数）；卡几何域（宽 0.02–0.03m / **长/宽 ∈ 8–18 变比例域**（真叶 9–16 ×
 *   0.5–1.5cm ×2 家族映射 + 文献域 6–32/照片读 8–12 的工程并域——冻结接口））；
 *   **互生方位不成对指纹**：簇内卡方位差 ∈ [150°,210°] 的成对率 ≤ 0.30（黄金角
 *   137.5° 步进 + 抖动下对生式正对罕见——vs 女贞 decussate ≥ 0.4 的反向判据）；
 *   **卡沿索下倾读向（STRAND_TILT 0.38——「叶尖沿索轴朝下、部分微外翻」Spec 终审
 *   补强 [6] 的卡向弱表达）**：卡尖 Y < 卡根 Y 的卡占比 ≥ 0.6（垂索切向近垂直向下
 *   → 卡向含下倾分量；终测 0.79）；
 * - **uv 域身份标记（家族探针断言纪律；无花果资产——任务书裁决 2：柔荑花序先叶开放
 *   3–4 月、蒴果 4–5 月，生长季 9–10 月主语境不可见）**：**v∈[3,7) 顶点数 = 0
 *   （花果域全空——裁决 2 的结构锁）**；皮组顶点 v < 2.5（皮管弧长域实测 max 1.90
 *   ——10m 级最长拱枝弧 ×0.42 压缩，≤≈2.0 < 2.5 族纪律）且 u ≤ 1（环向 θ/2π 与
 *   底盖 0.5+0.5cosθ 域）；叶组 uv 标准 0–1 四边形域（v 轴 = 叶基 0 → 叶尖 1、
 *   u = 叶宽方向——狭披针 SDF 消费的几何侧不变式）；
 * - 冠内通透（显式规则）：候选 → 存活存在剔卡且枝干通道/空腔/密度场三规则实际命中；
 *   外密内疏——内核保留率显著低于外壳（家族方向沿用；通透档 0.80）；枝干通道——
 *   存活叶卡挂点（根边中点 = 过滤判定口径）距通道线段带内数为 0；通透不挖空整层
 *   ——冠顶/冠底 1/3 高度带均有存活叶卡；
 * - 枝梢驱动叶簇（家族方法沿用）：簇-枝梢绑定（簇中心贴挂点 + 簇方向 = 挂点枝切向
 *   单位向量 + L5 末梢挂簇占主导）；簇间间隙（minSeparation 0.44 距离抑制）；
 *   shellBias 平摊（互生散布团块域分布）；
 * - 贴地契约：minY 精确 0（原点 = 底部中心）；**垂帘极值触地锁 rawMinY ≥ −0.08**
 *   （叶卡极值斜伸的 ≤8cm 穿地允许带——帘缘止于地上 0.45–2.13m 的设计带内，大幅
 *   负值 = 垂索主体生成至地面下的隐性风险位；终测 8 槽 −0.01～−0.06）；
 * - **树高锚（任务书口径：≈10m 实测断言）**：slot-0 总高落 [8.8, 10.8]（≈10m 生产
 *   锚——探针六轮回调后终测 9.83：弱领导 0.30 下骨架拱链外泄系数槽间波动，参数域
 *   10.0–10.6 终测涌现 8.43–11.22 全落 8–12 带）；**垂帘帘缘带**：slot-0 视觉冠底
 *   /实高 ∈ [0.12, 0.30]（minLeafY 1.94/9.83 ≈ 0.197——Spec「多数止于其上 1–2m」
 *   [6] 带内的标准槽读数）；
 * - 树皮起伏确定性（暗灰黑波状不规则纵沟脊第 13 语言——amplitude 0.028 / {4,6} /
 *   drift 6.2）：主干环截面起伏存在（极差/环均径 3.0–6.5% 实测带 + 最大极差 ≥
 *   10mm 深沟量级——〔终测 seg0–2 带 [4.30, 4.71]% / 14.7–20.0mm；vs 女贞 0.016
 *   浅沟档 9.1mm 深一档〕）；**L1 首环极差 = 0 级（亚视觉地板 3.0mm——起径 <
 *   0.107m 的管平滑发射，仅主干有效起伏，「垂柳细枝 2–6mm 光滑」[6] 的几何侧读向，
 *   暗灰黑色调/沟脊色对比/残桩归材质层）**；wrap 位浮点级无缝；
 * - shapeProfile 参数面真实驱动：canopyDensity 压低 → 叶卡数显著下降。
 * 边界：构建产物 afterEach 统一 dispose。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { buildSalixGeometry } from '../../../../src/runtime/procedural/tree/salix/salixGeometry';
import type { SalixGeometryResult } from '../../../../src/runtime/procedural/tree/salix/salixGeometry';
import { SALIX_SLOT0_PROFILE } from '../../../../src/runtime/procedural/tree/salix/salixShapeProfile';

const SEED0 = morphSeedOf('asset_tree_salix', 0);
/** slot-0 三档 rng 消费快照（2026-09-23 终测，包裹闭包逐调用计数——任何条件跳过
 *  消费都违约；跨槽/跨 seed 随保留簇数变化（通透 roll 计数 = 存活候选数——先例
 *  同机制；互生逐卡独立 r̂：每卡 8 次固定（phi 抖动 1 + 球面抖动 2 + r̂ 1 + 滚转
 *  1 + 宽 1 + 长宽比 1 + rand 1）——L5 候选 9/L4 候选 10 的六轮回调定档值） */
const RNG_CALLS_LOCK = 85485;
/** 皮拓扑面数（6 骨架 + 1 领导：主干 406（14 段 ×14 + 底盖 14——径向 14 承载谐波
 * {4,6} 奈奎斯特域 7 内留 1 档边际）+ L1 1120 + L2 2352 + L3 3780 + L4 9450 +
 * L5 9072——槽间恒等的结构性保证） */
const BARK_TRIS_LOCK = 26180;
/** 垂帘极值触地锁（叶卡极值 ≤8cm 穿地允许带——见模块头） */
const RAW_MIN_Y_FLOOR = -0.08;

const built: SalixGeometryResult[] = [];

function buildTracked(seed: number, profile = SALIX_SLOT0_PROFILE): SalixGeometryResult {
  const result = buildSalixGeometry(mulberry32(seed), profile);
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
    const a = buildSalixGeometry(mulberry32(SEED0));
    const b = buildTracked(SEED0, SALIX_SLOT0_PROFILE);
    built.push(a);
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.stats).toEqual(b.stats);
  }, 30000);

  it(`rng 消费恒等 ${RNG_CALLS_LOCK}（消费顺序即契约——次数变化 = 随机流重排）`, () => {
    const stream = mulberry32(SEED0);
    let calls = 0;
    buildTracked(SEED0); // 账目构建（dispose 归 afterEach）
    const stream2 = mulberry32(SEED0);
    buildSalixGeometry(
      () => {
        calls++;
        return stream2();
      },
      SALIX_SLOT0_PROFILE,
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
    expect(geometry.groups, '应恰 2 组（皮 0 / 单叶卡 1——无花果资产组 0 纯皮拓扑）').toHaveLength(2);
    expect(geometry.groups[0]!.materialIndex).toBe(0);
    expect(geometry.groups[1]!.materialIndex).toBe(1);
  }, 30000);

  it('各级平均起径严格递减；L1 ≥ 2.2×L2 且 L1 ≥ 12×L5（层级对比可感知判据；终测 L1/L2 2.82 / L1/L5 54.1——垂索细化档）', () => {
    const { stats } = buildTracked(SEED0);
    const radii = stats.levelMeanStartRadius;
    expect(radii).toHaveLength(5);
    for (let i = 0; i < 4; i++) {
      expect(radii[i]!, `L${i + 1} 均起径应大于 L${i + 2}`).toBeGreaterThan(radii[i + 1]!);
    }
    expect(radii[0]! / radii[1]!).toBeGreaterThanOrEqual(2.2);
    expect(radii[0]! / radii[4]!).toBeGreaterThanOrEqual(12);
  }, 30000);

  it('垂索径记档锁：L5 实起径 < 4mm 地板（radiusRatio 末端陡减实测——1.6mm 级起径 + 末径地板抬升的亚厘米倒锥记档，中景观距不可辨；族常量地板约束见 profile 注释）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.levelMeanStartRadius[4]!, 'L5 均起径应落亚厘米带（垂索细化）').toBeLessThan(0.006);
    expect(stats.levelMeanStartRadius[4]!).toBeGreaterThan(0.0005);
  }, 30000);
});

describe('互生细长卡沿索散簇挂点（垂柳独有身份——「叶沿垂索密排、互生错位」crown-a 双问 [6]；黄金角螺旋互生继承，vs 女贞 decussate 不继承）', () => {
  it('每簇存活叶量 ≤ 10（L4 候选 10 / L5 候选 9 上限）且均值 ≥ 4.5（预算半）；簇账守恒（簇账 = 总卡数）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.clusterLeafMax, '逐簇存活数应 ≤ 每簇候选上限 10').toBeLessThanOrEqual(10);
    expect(stats.clusterLeafMean, '逐簇均值应 ≥ 预算半（互生散簇存活典型 5–9；终测 6.84）').toBeGreaterThanOrEqual(4.5);
    expect(stats.clusterLeaves.reduce((s, n) => s + n, 0)).toBe(stats.leafCards);
  }, 30000);

  it('卡几何域：宽 ∈ [0.02, 0.03]、长/宽 ∈ [8, 18] 变比例域（真叶 9–16 × 0.5–1.5cm ×2 家族映射 + 文献域 6–32/照片读 8–12 工程并域 Spec [1][3][6]——冻结接口，与 salixMaterials 狭披针 SDF 同域）', () => {
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
        w < SALIX_SLOT0_PROFILE.leafWidthMin - 1e-4 ||
        w > SALIX_SLOT0_PROFILE.leafWidthMin + SALIX_SLOT0_PROFILE.leafWidthSpan + 1e-4 ||
        aspect < SALIX_SLOT0_PROFILE.leafAspectMin - 1e-4 ||
        aspect > SALIX_SLOT0_PROFILE.leafAspectMin + SALIX_SLOT0_PROFILE.leafAspectSpan + 1e-4
      ) {
        bad++;
      }
    }
    expect(cards, '卡扫描数应 = stats.leafCards').toBe(stats.leafCards);
    expect(bad, '卡宽应 ∈ [0.02, 0.03]、长/宽应 ∈ [8, 18]（1e-4 容差 = Float32 顶点存储噪声）').toBe(0);
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
    // 组 0 = 纯皮拓扑：树皮语义位恒 0（无花果资产组 0 无附加块）
    const bark = result.geometry.groups[0]!;
    let badZero = 0;
    for (let i = bark.start; i < bark.start + bark.count; i++) {
      if (rand.array[i]! !== 0 || bend.array[i]! !== 0) badZero++;
    }
    expect(badZero, '组 0 aLeafRand/aBend 应恒 0（皮拓扑刚性）').toBe(0);
  }, 30000);
});

describe('uv 域身份标记（无花果资产——任务书裁决 2：柔荑花序 3–4 月 / 蒴果 4–5 月不覆盖 9–10 月主语境；家族探针断言纪律）', () => {
  it('v∈[3,7) 顶点数 = 0（花果域全空——裁决 2 的结构锁）；皮组顶点 v < 2.5（弧长域实测 max 1.90——10m 级最长拱枝弧 ×0.42 压缩）且 u ≤ 1（环向 + 底盖域）；叶组 uv 标准 0–1 四边形域', () => {
    const result = buildTracked(SEED0);
    const uv = result.geometry.getAttribute('uv');
    const count = result.geometry.getAttribute('position').count;
    let flowerDomain = 0;
    let barkMaxV = 0;
    let barkBadU = 0;
    for (let i = 0; i < count; i++) {
      const u = uv.array[i * 2]!;
      const v = uv.array[i * 2 + 1]!;
      if (v >= 3 && v < 7) flowerDomain++;
      else if (v < 3) {
        if (u > 1 + 1e-6) barkBadU++;
        barkMaxV = Math.max(barkMaxV, v);
      }
    }
    expect(flowerDomain, '无花果资产：v∈[3,7) 花果域应全空（任务书裁决 2 的结构锁）').toBe(0);
    expect(barkBadU, '皮组顶点 u 应 ≤ 1（环向 θ/2π + 底盖 0.5+0.5cosθ 域）').toBe(0);
    expect(barkMaxV, '皮管弧长域 max v 应 < 2.5（实测 1.90——×0.42 压缩系数；≤≈2.0 < 2.5 族纪律）').toBeLessThan(2.5);
    // 叶组 uv 标准 0–1 四边形域（v 轴 = 叶基 0 → 叶尖 1；u 0–1 叶宽方向）
    const leaf = result.geometry.groups[1]!;
    let badLeafUv = 0;
    for (let i = leaf.start; i < leaf.start + leaf.count; i++) {
      const u = uv.array[i * 2]!;
      const v = uv.array[i * 2 + 1]!;
      if (u < -1e-6 || u > 1 + 1e-6 || v < -1e-6 || v > 1 + 1e-6) badLeafUv++;
    }
    expect(badLeafUv, '叶卡 uv 应落标准 0–1 四边形域（材质狭披针 SDF 的几何侧不变式）').toBe(0);
  }, 30000);

  it('组账守恒：组 0 三角 = 纯皮拓扑（无花果资产——组 0 无果/花附加块）；组 1 三角 = 单叶卡 × 2', () => {
    const result = buildTracked(SEED0);
    const { stats } = result;
    const group0Tris = result.geometry.groups[0]!.count / 3;
    const group1Tris = result.geometry.groups[1]!.count / 3;
    expect(group0Tris, '组 0 三角 = 纯皮拓扑（裁决 2 无花果账目）').toBe(stats.barkTriangles);
    expect(group1Tris, '组 1 三角 = 纯单叶卡 × 2').toBe(stats.leafCards * 2);
  }, 30000);
});

describe('冠内通透（显式规则：通道 / 局部空腔 / 内层密度衰减）', () => {
  /** 存活叶卡挂点数组（根边中点 = 顶点 0,1 均值 = 通透过滤时的候选中心——与规则判定
   *  口径严格对齐；组 1 纯卡无附加块） */
  function cardRootMidpoints(result: SalixGeometryResult): { x: number; y: number; z: number }[] {
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

  it('通透规则实际生效：存在剔卡，且枝干通道/空腔/密度场三规则均命中；账目守恒', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.leafCards).toBeLessThan(stats.leafCandidates);
    expect(stats.channelRejects, '枝干通道应实际剔卡（骨架枝与叶幕重叠区）').toBeGreaterThan(0);
    expect(stats.voidRejects, '局部空腔应实际剔卡（间隙 0.1–0.25 通透档）').toBeGreaterThan(0);
    expect(stats.gradientRejects, '内层密度衰减应实际剔卡').toBeGreaterThan(0);
    expect(stats.leafCards).toBe(stats.leafCandidates - stats.channelRejects - stats.voidRejects - stats.gradientRejects);
  }, 30000);

  it('外密内疏：内核（q<0.4）叶卡保留率显著低于外壳（q>0.6），外壳保留随通透档（0.80——间隙 0.1–0.25 读向；终测内 0.29 级 / 外 0.79 级）', () => {
    const { stats } = buildTracked(SEED0);
    const innerCand = stats.qCandidates[0]! + stats.qCandidates[1]!;
    const innerSurv = stats.qSurvived[0]! + stats.qSurvived[1]!;
    const shellCand = stats.qCandidates[3]! + stats.qCandidates[4]!;
    const shellSurv = stats.qSurvived[3]! + stats.qSurvived[4]!;
    expect(innerCand, '内核应有候选卡').toBeGreaterThan(50);
    const innerRet = innerSurv / innerCand;
    const shellRet = shellSurv / shellCand;
    expect(shellRet, '外壳保留率应 ≥ 密度×0.85（通透档外壳高保留）').toBeGreaterThanOrEqual(
      SALIX_SLOT0_PROFILE.canopyDensity * 0.85,
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

  it('通透不挖空整层：冠顶与冠底 1/3 高度带均有存活叶卡（垂帘纵向均匀覆垂——crownTopBias 0.00 中性）', () => {
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
    expect(bottom, '冠底 1/3 带应有存活卡（垂帘下覆读向）').toBeGreaterThan(100);
    expect(top, '冠顶 1/3 带应有存活卡（拱顶圆读向）').toBeGreaterThan(100);
  }, 30000);
});

describe('枝梢驱动叶簇（家族方法沿用：枝梢 → 簇空间 → 互生螺旋散排）', () => {
  it('簇-枝梢绑定：簇数 > 0、L5 末梢挂簇占主导；簇中心贴挂点（垂柳簇半径 0.26–0.40 的前移量级）；簇方向 = 枝切向单位向量；簇账目守恒', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.clusters.length, '应有保留簇').toBeGreaterThan(0);
    const l5 = stats.clusters.filter((c) => c.level === 4).length;
    const l4 = stats.clusters.filter((c) => c.level === 3).length;
    expect(l5, 'L5 末梢簇应占主导（末级垂索外段受光区）').toBeGreaterThan(l4);
    // 簇剔除账目守恒：保留 + 剔除 = 簇位总数（每 L5 枝 clustersL5 簇 + 每 L4 枝 clustersL4 簇）
    expect(stats.clusters.length + stats.clustersCulled).toBe(
      stats.levelBranches[4]! * SALIX_SLOT0_PROFILE.clustersL5 + stats.levelBranches[3]! * SALIX_SLOT0_PROFILE.clustersL4,
    );
    // 簇中心 = 挂点沿切向前移极近一位（前移 ≤ 0.2×簇半径 ≤ 0.2×0.47（L4 ×1.18 上限）+
    // t 抖动余量——cm 级
    let maxBind = 0;
    let maxUnitErr = 0;
    for (const c of stats.clusters) {
      maxBind = Math.max(maxBind, Math.hypot(c.cx - c.attachX, c.cy - c.attachY, c.cz - c.attachZ));
      maxUnitErr = Math.max(maxUnitErr, Math.abs(Math.hypot(c.dirX, c.dirY, c.dirZ) - 1));
    }
    expect(maxBind, '簇中心到挂点距离应 < 0.12m（中簇前移 + 抖动量级）').toBeLessThan(0.12);
    expect(maxUnitErr, '簇方向应为单位向量').toBeLessThan(1e-6);
  }, 30000);

  it('簇间间隙：近邻簇中心距 ≥ 0.44×(ri+rj) 的簇占比 ≥ 90%（clusterMinSeparation=0.44 距离抑制保证下界——垂帘列距保险）', () => {
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
      if (nnRatio >= 0.44) pass++;
    }
    expect(pass / n, '近邻簇对应以 0.44×(ri+rj) 间隙的占比').toBeGreaterThanOrEqual(0.9);
  }, 30000);

  it('shellBias 平摊：存活卡簇内归一化半径均值 ≥ 0.7（shellBias=0.44/γ=0.85 互生散布团块域分布——叶沿簇域分布；终测 0.796）', () => {
    const { stats } = buildTracked(SEED0);
    expect(stats.leafRhat).toHaveLength(stats.leafCards);
    const mean = stats.leafRhat.reduce((s, r) => s + r, 0) / stats.leafRhat.length;
    expect(mean, '存活卡 r̂ 均值应 ≥ 0.7（互生散布团块域分布）').toBeGreaterThanOrEqual(0.7);
  }, 30000);
});

describe('树皮起伏确定性（暗灰黑波状不规则纵沟脊第 13 语言——amplitude 0.028 / {4,6} / drift 6.2，任务书裁决 7）', () => {
  /** 皮组某管某段 ring A 的顶点索引（a0 = 每四边形首顶点；发射序 = 主干 → 底盖 → L1 → 深度优先首链） */
  function ringRadii(result: SalixGeometryResult, base: number, seg: number, radial: number): number[] {
    const pos = result.geometry.getAttribute('position');
    const idx = Array.from({ length: radial }, (_, j) => base + (seg * radial + j) * 6);
    const cx = idx.reduce((s, v) => s + pos.array[v * 3]!, 0) / radial;
    const cy = idx.reduce((s, v) => s + pos.array[v * 3 + 1]!, 0) / radial;
    const cz = idx.reduce((s, v) => s + pos.array[v * 3 + 2]!, 0) / radial;
    return idx.map((v) =>
      Math.hypot(pos.array[v * 3]! - cx, pos.array[v * 3 + 1]! - cy, pos.array[v * 3 + 2]! - cz),
    );
  }

  /** 皮组顶点流发射偏移（slot-0 拓扑：主干 14 段 ×14 管（1176 顶点）+ 14 三角底盖（42
   *  顶点）→ 首骨架枝 L1（1218）→ 深度优先首链 L2/L3/L4 → 首 L5 管） */
  const TRUNK_RADIAL = SALIX_SLOT0_PROFILE.trunk.radial;
  const TRUNK_SEGS = SALIX_SLOT0_PROFILE.trunk.segs;
  const L1_BASE = TRUNK_SEGS * TRUNK_RADIAL * 6 + TRUNK_RADIAL * 3; // 1218
  const L5_BASE =
    L1_BASE +
    10 * 8 * 6 + // L1：10 段 ×8 径向
    8 * 7 * 6 + // L2
    5 * 6 * 6 + // L3
    5 * 5 * 6; // L4 → 首 L5 管（2658）

  it('主干全部环截面极差/环均径 ∈ [3.0%, 6.5%]，最大极差 ≥ 10mm（深沟量级——0.028 幅度 × 基径 0.30–0.36 × flare；终测带 [4.30, 4.71]% / 14.7–20.0mm）', () => {
    const result = buildTracked(SEED0);
    expect(result.stats.barkTriangles, '皮拓扑不受起伏影响（emitTube 只动顶点域）').toBe(BARK_TRIS_LOCK);
    let maxAbs = 0;
    for (let seg = 0; seg < TRUNK_SEGS; seg++) {
      const radii = ringRadii(result, 0, seg, TRUNK_RADIAL);
      const mean = radii.reduce((s, r) => s + r, 0) / radii.length;
      const range = Math.max(...radii) - Math.min(...radii);
      maxAbs = Math.max(maxAbs, range);
      expect(range / mean, `主干环 ${seg} 极差/均径应 ≥ 3.0%（深沟可辨）`).toBeGreaterThanOrEqual(0.03);
      expect(range / mean, `主干环 ${seg} 极差/均径应 ≤ 6.5%（沟脊不夸张）`).toBeLessThanOrEqual(0.065);
    }
    expect(maxAbs * 1000, '主干最大极差应 ≥ 10mm（0.028 深沟档量级——含 flare 环峰值）').toBeGreaterThanOrEqual(10);
  }, 30000);

  it('亚视觉地板：L1/L5 首环极差 < 1e-6（起径 < 0.107m 的管平滑发射——仅主干有效起伏；「垂柳细枝 2–6mm 光滑」[6] 的几何侧读向，暗灰黑色调/沟脊色对比/残桩归材质层；1e-6 容差 = Float32 顶点存储噪声）', () => {
    const result = buildTracked(SEED0);
    const l1 = ringRadii(result, L1_BASE, 0, SALIX_SLOT0_PROFILE.levels[0]!.radial);
    const l1Range = Math.max(...l1) - Math.min(...l1);
    const l5 = ringRadii(result, L5_BASE, 0, SALIX_SLOT0_PROFILE.levels[4]!.radial);
    const l5Range = Math.max(...l5) - Math.min(...l5);
    expect(l1Range, 'L1 首环极差应 = 0 级（起径 0.09 级 < 0.107 地板——圆管）').toBeLessThan(1e-6);
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

describe('贴地契约 / 垂帘触地锁 / 参数面驱动 / 树高锚（任务书口径）', () => {
  it('minY 精确 0（原点 = 底部中心；贴地平移语义）', () => {
    const result = buildTracked(SEED0);
    result.geometry.computeBoundingBox();
    expect(Math.abs(result.geometry.boundingBox!.min.y)).toBeLessThanOrEqual(0.001);
  }, 30000);

  it(`垂帘极值触地锁：rawMinY ≥ ${RAW_MIN_Y_FLOOR}（叶卡极值斜伸的 ≤8cm 穿地允许带——帘缘止于地上 0.45–2.13m 设计带；大幅负值 = 垂索主体生成至地面下的隐性风险位；终测 -0.031）`, () => {
    const result = buildTracked(SEED0);
    expect(result.stats.rawMinY, '原始 minY 应 ≥ -0.08（垂帘帘缘带前提——探针六轮回调定档锁）').toBeGreaterThanOrEqual(RAW_MIN_Y_FLOOR);
  }, 30000);

  it('树高锚：slot-0 总高落 [8.8, 10.8]（≈10m 生产锚——参数域 10.0–10.6 涌现带；终测 9.83）+ 垂帘帘缘带：视觉冠底/实高 ∈ [0.12, 0.30]（Spec「多数止于其上 1–2m」[6] 带内标准槽读数；终测 0.197）', () => {
    const result = buildTracked(SEED0);
    result.geometry.computeBoundingBox();
    const h = result.geometry.boundingBox!.max.y - result.geometry.boundingBox!.min.y;
    expect(h, 'slot-0 总高应落 ≈10m 锚域（8–12 生产域中带）').toBeGreaterThanOrEqual(8.8);
    expect(h).toBeLessThanOrEqual(10.8);
    // 视觉冠底 = 叶卡最低 Y（T009.3 口径：挂高段 + 横展角 + upturn + 领导枝链涌现）
    const leaf = result.geometry.groups[1]!;
    const pos = result.geometry.getAttribute('position');
    let minLeafY = Infinity;
    for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
      let y = 0;
      for (let k = 0; k < 6; k++) y += pos.array[(base + k) * 3 + 1]!;
      minLeafY = Math.min(minLeafY, y / 6);
    }
    const crownBase = minLeafY / h;
    expect(crownBase, 'slot-0 视觉冠底/实高应落带 0.12–0.30（帘缘止于地上 1–2m 的标准槽）').toBeGreaterThanOrEqual(0.12);
    expect(crownBase).toBeLessThanOrEqual(0.3);
  }, 30000);

  it('canopyDensity 压低 → 叶卡数显著下降（同 seed 同拓扑，密度场真实消费）', () => {
    const base = buildTracked(SEED0);
    const sparse = buildTracked(SEED0, { ...SALIX_SLOT0_PROFILE, canopyDensity: 0.25 });
    expect(sparse.stats.barkTriangles).toBe(base.stats.barkTriangles); // 皮拓扑不受密度影响
    expect(sparse.stats.leafCards).toBeLessThan(base.stats.leafCards * 0.5);
  }, 30000);
});
