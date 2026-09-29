/**
 * tests/runtime/procedural/tree/cedrusShapeSlots.test.ts —— 雪松 8 槽形态向量**配置侧**
 * 测试（T012.1 Step 2；组织对称 ginkgoShapeSlots 先例、内容按新增语义裁定——D40 五者
 * 准入：**新任务新契约**〔ConiferShapeProfile 草案首证——字段结构即 config 雏形〕+
 * **新增结构·参数语义**〔层状轮生/长短枝双挂点/层隙带/球果账目——无阔叶对应物〕；
 * 不复制公共能力测试）。
 *
 * 覆盖（Step 2 边界 = 参数面——**零几何消费**：几何/资产入口消费者 Step 3 交付后由
 * cedrusStructure / 路由测试补全〔皮面数恒等实测 / 同 seed 逐位复现 / build 直调一致〕，
 * 本文件锁配置侧可判定的全部不变量）：
 * - 结构计数恒等（配置侧锁）：8 槽 tierCount / tierBranchCount / trunk·levels 的
 *   radial·segs / childPlan / clustersL5·L4 / longShootCardsL5·L4 / coneCandidates /
 *   tierRank* 数组长度逐位同 slot-0——皮面数恒等与 rng 消费次数恒等的结构性前提
 *   （展开继承纪律）；
 * - 叶身份恒等：莲座针数 / 卡尺寸与长宽比域 / 球果组（尺寸·账目·色）/ needleMaterial /
 *   bark / wind 全组逐位同 slot-0（叶与器官身份不随槽变）；canopyDensity ≤ 1
 *   （消费端截断，>1 无效）；
 * - 槽差异真实（伪差异禁止——方向性断言，数值见 cedrusShapeProfile 各槽注释）：
 *   树高轴（幼树 < 标准 < 成熟 + 8 槽全域 ⊂ [12, 20]）/ 冠幅轴（挤压窄塔 < 标准 <
 *     成熟宽塔，首末比 ≥ 1.6 + 全槽 ⊂ [0.3, 0.5]）/ 干高轴（低枝贴地 vs 立木净干
 *     差 ≥ 0.25 + 全槽 ⊂ [0.1, 0.4]）/ 年龄轴（幼→中→成：层隙带与垂帘加长单调升、
 *     顶梢占比单调降）/ 偏冠（rank 首末比 ≥ 1.5 且 ≥ 标准 ×1.4 + asymmetry 升）/
 *     疏密（疏松/丰满密度比 ≤ 0.86 + 层隙反向）+ 8 槽向量不全等（槽身份可辨）；
 * - slot-0 锚点域（判定 9 + Spec 锚）：树高 ∈ [15, 18]（生产锚——**同源风动树高锚
 *   断言**：材质锚直读 totalHeight，无独立锚字段）/ 冠幅 ∈ [0.35, 0.5] / 干高 ∈
 *   [0.2, 0.3] / tierCount ∈ [6, 7] / 层角梯度方向（base > top——下部平展上部上举）
 *   且落 Spec 域（base ∈ [60, 90]、top ∈ [30, 60]，自垂直角）；
 * - 草案新语义（针叶族字段的首证断言）：锥形收顶（tierRadiusTaper ∈ (0, 0.5] +
 *   exponent ≥ 1）/ 垂帘姿态链（levels droop 逐级单调不降且末级 > 0.3——层缘垂帘
 *   读向）/ 莲座针数 ∈ [15, 25]（Spec 簇密度锚）/ 针卡长宽比 ≥ 5 且 ≤ 15（细长针
 *   形语言——vs 阔叶 <2）/ 球果近真尺寸 ⊂ [0.07, 0.12] + 候选 ∈ [2, 4]（Spec 单枝
 *   2–4）+ 两类并存比 ∈ (0, 1) / 树皮块片 ⊂ [0.03, 0.08] + 沟深 ∈ (0, 1)（Spec
 *   3–8cm 鳞状块片）/ 风动三成分方向（全部 > 0；高频颤频率 > 整层慢摆；顶梢摆幅 >
 *   整层摆幅——Spec 风动读向 Inferred 的参数化方向）。
 */
import { describe, expect, it } from 'vitest';
import {
  CEDRUS_SHAPE_PROFILES,
  CEDRUS_SLOT0_PROFILE,
} from '../../../../src/runtime/procedural/tree/cedrus/cedrusShapeProfile';

const SLOT_NAMES = [
  '标准',
  '幼树密贴',
  '成熟宽塔',
  '挤压窄塔',
  '低枝贴地',
  '偏冠',
  '疏松',
  '丰满',
] as const;

describe('结构计数恒等（配置侧锁——皮面数与 rng 消费恒等的前提）', () => {
  it('8 槽结构计数类字段逐位同 slot-0（展开继承纪律）', () => {
    const anchor = CEDRUS_SHAPE_PROFILES[0]!;
    expect(CEDRUS_SHAPE_PROFILES).toHaveLength(8);
    expect(anchor).toBe(CEDRUS_SLOT0_PROFILE);
    for (let slot = 1; slot < 8; slot++) {
      const p = CEDRUS_SHAPE_PROFILES[slot]!;
      // 层结构计数（层 × 每层枝 = L1 拓扑基——改值即改皮面数与 rng 消费数）
      expect(p.tierCount, `slot-${slot} ${SLOT_NAMES[slot]} tierCount`).toBe(anchor.tierCount);
      expect(p.tierBranchCount, `slot-${slot} ${SLOT_NAMES[slot]} tierBranchCount`).toBe(anchor.tierBranchCount);
      // 主干 / 逐级拓扑预算
      expect(`${p.trunk.radial}/${p.trunk.segs}`, `slot-${slot} trunk radial/segs`).toBe(
        `${anchor.trunk.radial}/${anchor.trunk.segs}`,
      );
      expect(
        p.levels.map((l) => `${l.radial}/${l.segs}`),
        `slot-${slot} levels radial/segs`,
      ).toEqual(anchor.levels.map((l) => `${l.radial}/${l.segs}`));
      expect(p.childPlan, `slot-${slot} childPlan`).toEqual(anchor.childPlan);
      // 簇位 / 散生卡 / 球果候选（rng 无条件消费的固定计数）
      expect(p.clustersL5, `slot-${slot} clustersL5`).toBe(anchor.clustersL5);
      expect(p.clustersL4, `slot-${slot} clustersL4`).toBe(anchor.clustersL4);
      expect(p.longShootCardsL5, `slot-${slot} longShootCardsL5`).toBe(anchor.longShootCardsL5);
      expect(p.longShootCardsL4, `slot-${slot} longShootCardsL4`).toBe(anchor.longShootCardsL4);
      expect(p.coneCandidates, `slot-${slot} coneCandidates`).toBe(anchor.coneCandidates);
      // rank 数组长度（值连续可差量——长度是计数）
      expect(p.tierRankLength, `slot-${slot} tierRankLength 长度`).toHaveLength(anchor.tierRankLength.length);
      expect(p.tierRankRadius, `slot-${slot} tierRankRadius 长度`).toHaveLength(anchor.tierRankRadius.length);
      // 消费端截断——>1 为无效值禁出现
      expect(p.canopyDensity, `slot-${slot} canopyDensity 应 ≤ 1`).toBeLessThanOrEqual(1);
    }
  });

  it('叶身份类字段全组逐位同 slot-0（叶与器官身份不随槽变）', () => {
    const anchor = CEDRUS_SHAPE_PROFILES[0]!;
    for (let slot = 1; slot < 8; slot++) {
      const p = CEDRUS_SHAPE_PROFILES[slot]!;
      // 莲座簇与针卡身份
      expect(p.rosetteNeedles, `slot-${slot} rosetteNeedles`).toBe(anchor.rosetteNeedles);
      expect(p.rosetteCardMin, `slot-${slot} rosetteCardMin`).toBe(anchor.rosetteCardMin);
      expect(p.rosetteCardSpan, `slot-${slot} rosetteCardSpan`).toBe(anchor.rosetteCardSpan);
      expect(p.needleCardLenMin, `slot-${slot} needleCardLenMin`).toBe(anchor.needleCardLenMin);
      expect(p.needleCardLenSpan, `slot-${slot} needleCardLenSpan`).toBe(anchor.needleCardLenSpan);
      expect(p.needleCardAspectMin, `slot-${slot} needleCardAspectMin`).toBe(anchor.needleCardAspectMin);
      expect(p.needleCardAspectSpan, `slot-${slot} needleCardAspectSpan`).toBe(anchor.needleCardAspectSpan);
      // 球果账目组（尺寸·账目·两类并存比·三色）
      expect(p.coneFruitingZone, `slot-${slot} coneFruitingZone`).toBe(anchor.coneFruitingZone);
      expect(p.coneKeepRatio, `slot-${slot} coneKeepRatio`).toBe(anchor.coneKeepRatio);
      expect(p.coneSizeMin, `slot-${slot} coneSizeMin`).toBe(anchor.coneSizeMin);
      expect(p.coneSizeSpan, `slot-${slot} coneSizeSpan`).toBe(anchor.coneSizeSpan);
      expect(p.coneClassRatio, `slot-${slot} coneClassRatio`).toBe(anchor.coneClassRatio);
      expect(p.coneColorMature, `slot-${slot} coneColorMature`).toBe(anchor.coneColorMature);
      expect(p.coneColorYoung, `slot-${slot} coneColorYoung`).toBe(anchor.coneColorYoung);
      expect(p.coneAxisColor, `slot-${slot} coneAxisColor`).toBe(anchor.coneAxisColor);
      // 嵌套组整体（针叶色 / 树皮 / 风动）
      expect(p.needleMaterial, `slot-${slot} needleMaterial 应 spread 继承 slot-0`).toEqual(anchor.needleMaterial);
      expect(p.bark, `slot-${slot} bark 应 spread 继承 slot-0`).toEqual(anchor.bark);
      expect(p.wind, `slot-${slot} wind 应 spread 继承 slot-0`).toEqual(anchor.wind);
    }
  });
});

describe('槽差异真实（伪差异禁止——方向性断言，数值锚见各槽注释）', () => {
  const p = (slot: number) => CEDRUS_SHAPE_PROFILES[slot]!;

  it('树高轴：幼树 < 标准 < 成熟；8 槽全域 ⊂ [12, 20]（任务主轴 + Spec 域）', () => {
    for (let slot = 0; slot < 8; slot++) {
      expect(p(slot).totalHeight, `slot-${slot} ${SLOT_NAMES[slot]} totalHeight`).toBeGreaterThanOrEqual(12);
      expect(p(slot).totalHeight).toBeLessThanOrEqual(20);
    }
    expect(p(1).totalHeight, '幼树应低于标准').toBeLessThan(p(0).totalHeight);
    expect(p(0).totalHeight, '标准应低于成熟').toBeLessThan(p(2).totalHeight);
    expect(Math.max(...CEDRUS_SHAPE_PROFILES.map((x) => x.totalHeight)) -
      Math.min(...CEDRUS_SHAPE_PROFILES.map((x) => x.totalHeight)), '树高轴展开幅度 ≥ 6m').toBeGreaterThanOrEqual(6);
  });

  it('冠幅轴：挤压窄塔 < 标准 < 成熟宽塔（首末比 ≥ 1.6）；全槽 ⊂ [0.3, 0.5]', () => {
    for (let slot = 0; slot < 8; slot++) {
      expect(p(slot).crownWidthRatio, `slot-${slot} crownWidthRatio`).toBeGreaterThanOrEqual(0.3);
      expect(p(slot).crownWidthRatio).toBeLessThanOrEqual(0.5);
    }
    expect(p(2).crownWidthRatio / p(3).crownWidthRatio, '宽塔/窄塔 冠幅比').toBeGreaterThanOrEqual(1.6);
    expect(p(3).crownWidthRatio, '窄塔应窄于标准').toBeLessThan(p(0).crownWidthRatio);
    expect(p(0).crownWidthRatio, '标准应窄于宽塔').toBeLessThan(p(2).crownWidthRatio);
  });

  it('干高轴：低枝贴地 vs 立木净干差 ≥ 0.25；全槽 ⊂ [0.1, 0.4]', () => {
    for (let slot = 0; slot < 8; slot++) {
      expect(p(slot).trunkHeightRatio, `slot-${slot} trunkHeightRatio`).toBeGreaterThanOrEqual(0.1);
      expect(p(slot).trunkHeightRatio).toBeLessThanOrEqual(0.4);
    }
    expect(p(3).trunkHeightRatio - p(4).trunkHeightRatio, '立木-低枝 干高差').toBeGreaterThanOrEqual(0.25);
  });

  it('年龄轴（幼→中→成）：层隙带与垂帘加长单调升、顶梢段占比单调降', () => {
    expect(p(1).tierGapBand, '幼树层隙应最窄（密贴）').toBeLessThan(p(0).tierGapBand);
    expect(p(0).tierGapBand, '中龄层隙应窄于成熟（层展）').toBeLessThan(p(2).tierGapBand);
    expect(p(1).fringeLengthRatio, '幼树垂帘应最短').toBeLessThan(p(0).fringeLengthRatio);
    expect(p(0).fringeLengthRatio, '成熟垂帘应最长').toBeLessThan(p(2).fringeLengthRatio);
    expect(p(2).fringeLengthRatio - p(1).fringeLengthRatio, '垂帘年龄轴展开 ≥ 0.3').toBeGreaterThanOrEqual(0.3);
    expect(p(1).leaderLengthRatio, '幼树顶梢占比应最大（金字塔主导）').toBeGreaterThan(p(0).leaderLengthRatio);
    expect(p(0).leaderLengthRatio, '中龄顶梢占比应大于成熟').toBeGreaterThan(p(2).leaderLengthRatio);
  });

  it('偏冠：rank 首末比 ≥ 1.5 且 ≥ 标准 ×1.4；asymmetry 升（跨层同方位相干偏侧）', () => {
    const lopsided = p(5);
    const anchor = p(0);
    const ratio = (a: number[]) => a[0]! / a[a.length - 1]!;
    expect(ratio(lopsided.tierRankLength), '偏冠槽 rank 首末比').toBeGreaterThanOrEqual(1.5);
    expect(ratio(lopsided.tierRankLength), '偏冠槽 rank 首末比应 ≥ 标准 ×1.4').toBeGreaterThanOrEqual(ratio(anchor.tierRankLength) * 1.4);
    expect(lopsided.crownAsymmetry, '偏冠槽 asymmetry 应升').toBeGreaterThan(anchor.crownAsymmetry);
  });

  it('疏密轴：疏松/丰满 密度比 ≤ 0.86；层隙反向（疏端带更宽）', () => {
    expect(p(6).canopyDensity / p(7).canopyDensity, '疏松/丰满 密度比').toBeLessThanOrEqual(0.86);
    expect(p(6).tierGapBand, '疏松槽层隙应宽于丰满槽').toBeGreaterThan(p(7).tierGapBand);
  });

  it('8 槽向量不全等（槽身份可辨——差量展开不退化为复制）', () => {
    const serialized = new Set(CEDRUS_SHAPE_PROFILES.map((x) => JSON.stringify(x)));
    expect(serialized.size, '8 槽应至少有两个不同向量').toBeGreaterThan(1);
  });
});

describe('slot-0 锚点域（Step 1 判定 9 + Spec 生产锚）', () => {
  const anchor = CEDRUS_SHAPE_PROFILES[0]!;

  it('开阔孤立中龄型锚：树高 ∈ [15, 18]（= 风动树高锚同源断言）/ 冠幅 ∈ [0.35, 0.5] / 干高 ∈ [0.2, 0.3] / tierCount ∈ [6, 7]', () => {
    expect(anchor.totalHeight, 'slot-0 生产锚 15–18m（Inferred；材质风动锚同源直读本字段）').toBeGreaterThanOrEqual(15);
    expect(anchor.totalHeight).toBeLessThanOrEqual(18);
    expect(anchor.crownWidthRatio, 'slot-0 冠幅比锚 ≈0.4（Spec 域 0.35–0.5）').toBeGreaterThanOrEqual(0.35);
    expect(anchor.crownWidthRatio).toBeLessThanOrEqual(0.5);
    expect(anchor.trunkHeightRatio, 'slot-0 干高锚 ≈0.25（Spec 域 0.1–0.4）').toBeGreaterThanOrEqual(0.2);
    expect(anchor.trunkHeightRatio).toBeLessThanOrEqual(0.3);
    expect(anchor.tierCount, 'slot-0 主层数 6–7（Spec 计数带 6–8 承重）').toBeGreaterThanOrEqual(6);
    expect(anchor.tierCount).toBeLessThanOrEqual(7);
  });

  it('层角梯度方向：全槽 base > top（下部平展上部上举）且落 Spec 域 base ∈ [60, 90]、top ∈ [30, 60]（自垂直角）', () => {
    for (let slot = 0; slot < 8; slot++) {
      const s = CEDRUS_SHAPE_PROFILES[slot]!;
      expect(s.tierAngleBase, `slot-${slot} tierAngleBase`).toBeGreaterThan(s.tierAngleTop);
      expect(s.tierAngleBase).toBeGreaterThanOrEqual(60);
      expect(s.tierAngleBase).toBeLessThanOrEqual(90);
      expect(s.tierAngleTop).toBeGreaterThanOrEqual(30);
      expect(s.tierAngleTop).toBeLessThanOrEqual(60);
    }
  });
});

describe('草案新语义（针叶族字段首证——无阔叶对应物的参数语义）', () => {
  const anchor = CEDRUS_SHAPE_PROFILES[0]!;

  it('锥形收顶：tierRadiusTaper ∈ (0, 0.5] 且 exponent ≥ 1（上段渐尖收顶的形状参数域）', () => {
    for (const s of CEDRUS_SHAPE_PROFILES) {
      expect(s.tierRadiusTaper).toBeGreaterThan(0);
      expect(s.tierRadiusTaper).toBeLessThanOrEqual(0.5);
      expect(s.tierProfileExponent).toBeGreaterThanOrEqual(1);
    }
  });

  it('垂帘姿态链：levels droop 逐级单调不降；全槽末级 > 0.15（下垂方向恒在）、锚点槽末级 > 0.3（层缘垂帘读向——droop 为针叶姿态语言，自垂直链；幼树槽垂帘弱表达为设计值）', () => {
    for (const s of CEDRUS_SHAPE_PROFILES) {
      for (let i = 1; i < s.levels.length; i++) {
        expect(s.levels[i]!.droop, `levels[${i}].droop 应 ≥ 前级`).toBeGreaterThanOrEqual(s.levels[i - 1]!.droop);
      }
      expect(s.levels[s.levels.length - 1]!.droop, '末级 droop 应 > 0.15（下垂方向恒在）').toBeGreaterThan(0.15);
    }
    expect(
      anchor.levels[anchor.levels.length - 1]!.droop,
      'slot-0 末级 droop 应 > 0.3（中龄层展锚的垂帘读向）',
    ).toBeGreaterThan(0.3);
  });

  it('针叶身份：莲座针数 ∈ [15, 25]（Spec 簇密度锚）；针卡长宽比 ∈ [5, 15]（细长针形语言——vs 阔叶 <2）', () => {
    expect(anchor.rosetteNeedles, '莲座簇针数落 Spec 三源合域').toBeGreaterThanOrEqual(15);
    expect(anchor.rosetteNeedles).toBeLessThanOrEqual(25);
    expect(anchor.needleCardAspectMin, '针卡长宽比下限').toBeGreaterThanOrEqual(5);
    expect(anchor.needleCardAspectMin + anchor.needleCardAspectSpan, '针卡长宽比上限').toBeLessThanOrEqual(15);
  });

  it('球果账目：尺寸 ⊂ [0.07, 0.12]（近真 7–12cm）+ 候选 ∈ [2, 4]（单枝 2–4）+ 两类并存比 ∈ (0, 1)', () => {
    expect(anchor.coneSizeMin).toBeGreaterThanOrEqual(0.07);
    expect(anchor.coneSizeMin + anchor.coneSizeSpan).toBeLessThanOrEqual(0.12);
    expect(anchor.coneCandidates).toBeGreaterThanOrEqual(2);
    expect(anchor.coneCandidates).toBeLessThanOrEqual(4);
    expect(anchor.coneClassRatio).toBeGreaterThan(0);
    expect(anchor.coneClassRatio).toBeLessThan(1);
  });

  it('树皮鳞状块片：块片域 ⊂ [0.03, 0.08]（Spec 3–8cm）+ 沟深 ∈ (0, 1)', () => {
    expect(anchor.bark.barkPlateMin).toBeGreaterThanOrEqual(0.03);
    expect(anchor.bark.barkPlateMin + anchor.bark.barkPlateSpan).toBeLessThanOrEqual(0.08);
    expect(anchor.bark.barkGrooveDepth).toBeGreaterThan(0);
    expect(anchor.bark.barkGrooveDepth).toBeLessThan(1);
  });

  it('风动三成分方向：全部 > 0；高频颤频率 > 整层慢摆；顶梢摆幅 > 整层摆幅（Spec 风动读向 Inferred 的参数化方向）', () => {
    const w = anchor.wind;
    for (const value of [w.windTierAmplitude, w.windTierFrequency, w.windFringeAmplitude, w.windFringeFrequency, w.windLeaderAmplitude, w.windLeaderFrequency]) {
      expect(value).toBeGreaterThan(0);
    }
    expect(w.windFringeFrequency, '垂帘颤频率应高于整层慢摆').toBeGreaterThan(w.windTierFrequency);
    expect(w.windLeaderAmplitude, '顶梢摆幅应大于整层摆幅').toBeGreaterThan(w.windTierAmplitude);
  });
});
