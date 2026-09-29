/**
 * tests/runtime/procedural/tree/metasequoiaShapeSlots.test.ts —— 水杉 8 槽形态向量
 * **配置侧**测试（T012.2 Step 2；组织对称 cedrusShapeSlots 先例、内容按新增语义裁定
 * ——D40 五者准入：**新任务新语义**〔契约定稿转正 + 可选位 8 + 水杉参数面——对生挂点
 * 语言 / 羽卡细质地 / 密连续锥 / 双器官账目 / 干基膨大 / 顶梢不消费〕；不复制公共
 * 能力测试）。
 *
 * 覆盖（Step 2 边界 = 参数面——**零几何消费**：几何/资产入口消费者 Step 3 交付后由
 * metasequoiaStructure / 路由测试补全〔皮面数恒等实测 / 同 seed 逐位复现 / build 直调
 * 一致〕，本文件锁配置侧可判定的全部不变量）：
 * - 结构计数恒等（配置侧锁）：8 槽 tierCount / tierBranchCount / trunk·levels 的
 *   radial·segs / childPlan / clustersL5·L4 / longShootCardsL5·L4 / coneCandidates /
 *   strobili.candidates / tierRank* 数组长度逐位同 slot-0——皮面数恒等与 rng 消费次数
 *   恒等的结构性前提（展开继承纪律；rng 无条件消费纪律的消费次数与数据分支无关）；
 * - 叶身份与挂点语言恒等：羽卡元素数 / 卡尺度与轮廓比域 / 球果与枯穗组（尺寸·账目·
 *   色）/ needleMaterial / bark / wind 全组逐位同 slot-0 + 挂点语言位（tierPhaseStagger /
 *   clusterAzimuthStep / tierGapBand 零端）全槽恒等（叶与器官身份 + 对生语言不随槽变）；
 *   canopyDensity ≤ 1（消费端截断，>1 无效）；
 * - 槽差异真实（伪差异禁止——方向性断言，数值见 metasequoiaShapeProfile 各槽注释）：
 *   树高轴（幼树 < 标准 < 老树 + 8 槽全域 ⊂ [15, 25] Spec 生产域）/ 冠幅轴（幼极窄 <
 *   标准 < 老阔圆锥，首末比 ≥ 1.5 + 全槽 ⊂ [0.20, 0.32]）/ 干高轴（低枝 vs 立木净干
 *   差 ≥ 0.10 + 全槽 ⊂ [0.35, 0.50]）/ 干基膨大轴（全槽 ⊂ [1.3, 2.0] + 年龄轴单调
 *   升）/ 年龄轴（幼→中→老：垂帘乘子单调升、顶梢段占比单调降）/ 偏冠（对内破缺
 *   rank 首末比 ≥ 1.5 且 ≥ 标准 ×1.4 + asymmetry 升）/ 疏密（疏松/丰满密度比 ≤ 0.86）+
 *   8 槽向量不全等（槽身份可辨）；
 * - slot-0 锚点域（判定 10 + Spec 尺度锚）：树高 ∈ [19, 21]（≈20 生产锚——**同源风动
 *   树高锚断言**：材质锚直读 totalHeight，无独立锚字段）/ 冠幅 ∈ [0.23, 0.27] / 干高 ∈
 *   [0.38, 0.42] / 膨大 ∈ [1.5, 1.7] / tierCount ∈ [8, 12]（密层预估带）/ 层角梯度方向
 *   （base > top——下部平展上部上举）且落 Spec 终审精化域（base ∈ [70, 85]、top ∈
 *   [30, 50]，自垂直角）；
 * - 水杉新语义（判定路径首证断言）：密连续锥（tierGapBand 全槽 === 0 无层隙 + 收顶
 *   指数 ≥ 1）/ 对生挂点语言（tierPhaseStagger 90° + clusterAzimuthStep π/2 +
 *   tierBranchCount 2 对生成对）/ 羽卡尺度（主卡尺度域 ⊂ [0.15, 0.32]——**Step 4
 *   密度校准带 0.18–0.30**：初版真羽近真域被像素证伪（M25 亚像素）→ 对齐雪松
 *   ≥0.3m 实证带，近景单卡大于实物羽枝 = 雪松同款取舍；轮廓比 ∈ [1.5, 3] 卵状
 *   椭圆；元素数 ∈ [12, 28] 二列算术——羽列软质感由 SDF 内部密度承载）/ 末级轻垂（droop 链单调 + 末级 ∈ (0.15, 0.40]——vs 雪松垂帘 >0.3 端）/
 *   顶梢不消费（leaderDroop 与 windLeader* 全槽 === 0——族内可选·雪松消费位的显式
 *   零占位锁）/ 球果下垂账目（尺寸 ⊂ [0.014, 0.025] Spec 近真 + 候选 ∈ [1, 3] 单生 +
 *   keep ≤ 0.45 零星-少量档 + classRatio === 1 单 cohort 锁）/ 雄序枯穗（尺寸 ⊂
 *   [0.03, 0.05] s04 实证 + 候选 ∈ [2, 6] + keep ∈ (0, 0.5]）/ 树皮条片（单元域 ⊂
 *   [0.05, 0.35] + 沟深 > 0.5 深索端——vs 雪松浅-中 0.45）/ 风动两成分（全部 >
 *   0；羽枝细颤频率与幅度均 > 整冠慢摆——判定 8 主成分；leader 成分 === 0）；
 * - **契约转正回归锁**（012.2 族级职责）：cedrus 实例化（CEDRUS_SLOT0_PROFILE）对
 *   转正后契约类型零变化——编译期保证（本文件 import 即编译断言：转正只增可选位，
 *   cedrus 字面量零触碰）+ 字段位计数断言（cedrus 键位 53 = 47 扁平 + 6 嵌套组，
 *   新可选位全部缺席）+ 水杉键位 56（53 + 挂点语言 2 + strobili 组 1）且 ⊇ cedrus
 *   全部键位（必选位零删改）。
 */
import { describe, expect, it } from 'vitest';
import {
  METASEQUOIA_SHAPE_PROFILES,
  METASEQUOIA_SLOT0_PROFILE,
} from '../../../../src/runtime/procedural/tree/metasequoia/metasequoiaShapeProfile';
import { CEDRUS_SLOT0_PROFILE } from '../../../../src/runtime/procedural/tree/cedrus/cedrusShapeProfile';

const SLOT_NAMES = [
  '标准',
  '幼树极窄',
  '老树阔圆锥',
  '密林挤压',
  '低枝开阔',
  '偏冠',
  '疏松',
  '丰满',
] as const;

describe('结构计数恒等（配置侧锁——皮面数与 rng 消费恒等的前提）', () => {
  it('8 槽结构计数类字段逐位同 slot-0（展开继承纪律）', () => {
    const anchor = METASEQUOIA_SHAPE_PROFILES[0]!;
    expect(METASEQUOIA_SHAPE_PROFILES).toHaveLength(8);
    expect(anchor).toBe(METASEQUOIA_SLOT0_PROFILE);
    for (let slot = 1; slot < 8; slot++) {
      const p = METASEQUOIA_SHAPE_PROFILES[slot]!;
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
      // 簇位 / 散生卡（0 占位）/ 球果与枯穗候选（rng 无条件消费的固定计数）
      expect(p.clustersL5, `slot-${slot} clustersL5`).toBe(anchor.clustersL5);
      expect(p.clustersL4, `slot-${slot} clustersL4`).toBe(anchor.clustersL4);
      expect(p.longShootCardsL5, `slot-${slot} longShootCardsL5`).toBe(anchor.longShootCardsL5);
      expect(p.longShootCardsL4, `slot-${slot} longShootCardsL4`).toBe(anchor.longShootCardsL4);
      expect(p.coneCandidates, `slot-${slot} coneCandidates`).toBe(anchor.coneCandidates);
      expect(p.strobili?.strobilusCandidates, `slot-${slot} strobilusCandidates`).toBe(
        anchor.strobili?.strobilusCandidates,
      );
      // rank 数组长度（值连续可差量——长度是计数）
      expect(p.tierRankLength, `slot-${slot} tierRankLength 长度`).toHaveLength(anchor.tierRankLength.length);
      expect(p.tierRankRadius, `slot-${slot} tierRankRadius 长度`).toHaveLength(anchor.tierRankRadius.length);
      // 消费端截断——>1 为无效值禁出现
      expect(p.canopyDensity, `slot-${slot} canopyDensity 应 ≤ 1`).toBeLessThanOrEqual(1);
    }
  });

  it('叶身份与挂点语言类字段全组逐位同 slot-0（叶与器官身份 + 对生语言不随槽变）', () => {
    const anchor = METASEQUOIA_SHAPE_PROFILES[0]!;
    for (let slot = 1; slot < 8; slot++) {
      const p = METASEQUOIA_SHAPE_PROFILES[slot]!;
      // 羽卡身份（元素数 / 尺寸域 / 轮廓比域 / 散生占位）
      expect(p.rosetteNeedles, `slot-${slot} rosetteNeedles`).toBe(anchor.rosetteNeedles);
      expect(p.rosetteCardMin, `slot-${slot} rosetteCardMin`).toBe(anchor.rosetteCardMin);
      expect(p.rosetteCardSpan, `slot-${slot} rosetteCardSpan`).toBe(anchor.rosetteCardSpan);
      expect(p.needleCardLenMin, `slot-${slot} needleCardLenMin`).toBe(anchor.needleCardLenMin);
      expect(p.needleCardLenSpan, `slot-${slot} needleCardLenSpan`).toBe(anchor.needleCardLenSpan);
      expect(p.needleCardAspectMin, `slot-${slot} needleCardAspectMin`).toBe(anchor.needleCardAspectMin);
      expect(p.needleCardAspectSpan, `slot-${slot} needleCardAspectSpan`).toBe(anchor.needleCardAspectSpan);
      // 球果账目组（尺寸·账目·单 cohort 占位·三色）
      expect(p.coneFruitingZone, `slot-${slot} coneFruitingZone`).toBe(anchor.coneFruitingZone);
      expect(p.coneKeepRatio, `slot-${slot} coneKeepRatio`).toBe(anchor.coneKeepRatio);
      expect(p.coneSizeMin, `slot-${slot} coneSizeMin`).toBe(anchor.coneSizeMin);
      expect(p.coneSizeSpan, `slot-${slot} coneSizeSpan`).toBe(anchor.coneSizeSpan);
      expect(p.coneClassRatio, `slot-${slot} coneClassRatio`).toBe(anchor.coneClassRatio);
      expect(p.coneColorMature, `slot-${slot} coneColorMature`).toBe(anchor.coneColorMature);
      expect(p.coneColorYoung, `slot-${slot} coneColorYoung`).toBe(anchor.coneColorYoung);
      expect(p.coneAxisColor, `slot-${slot} coneAxisColor`).toBe(anchor.coneAxisColor);
      // 雄序枯穗组（嵌套组整体）
      expect(p.strobili, `slot-${slot} strobili 应 spread 继承 slot-0`).toEqual(anchor.strobili);
      // 嵌套组整体（针叶色 / 树皮 / 风动）
      expect(p.needleMaterial, `slot-${slot} needleMaterial 应 spread 继承 slot-0`).toEqual(anchor.needleMaterial);
      expect(p.bark, `slot-${slot} bark 应 spread 继承 slot-0`).toEqual(anchor.bark);
      expect(p.wind, `slot-${slot} wind 应 spread 继承 slot-0`).toEqual(anchor.wind);
      // 挂点语言身份（对生交错 / 零端层隙——语言不随槽变）
      expect(p.tierPhaseStagger, `slot-${slot} tierPhaseStagger`).toBe(anchor.tierPhaseStagger);
      expect(p.clusterAzimuthStep, `slot-${slot} clusterAzimuthStep`).toBe(anchor.clusterAzimuthStep);
      expect(p.tierGapBand, `slot-${slot} tierGapBand`).toBe(anchor.tierGapBand);
    }
  });
});

describe('槽差异真实（伪差异禁止——方向性断言，数值锚见各槽注释）', () => {
  const p = (slot: number) => METASEQUOIA_SHAPE_PROFILES[slot]!;

  it('树高轴：幼树 < 标准 < 老树；8 槽全域 ⊂ [15, 25]（任务主轴 + Spec 生产域 18–25 的幼端下探）', () => {
    for (let slot = 0; slot < 8; slot++) {
      expect(p(slot).totalHeight, `slot-${slot} ${SLOT_NAMES[slot]} totalHeight`).toBeGreaterThanOrEqual(15);
      expect(p(slot).totalHeight).toBeLessThanOrEqual(25);
    }
    expect(p(1).totalHeight, '幼树应低于标准').toBeLessThan(p(0).totalHeight);
    expect(p(0).totalHeight, '标准应低于老树').toBeLessThan(p(2).totalHeight);
    expect(Math.max(...METASEQUOIA_SHAPE_PROFILES.map((x) => x.totalHeight)) -
      Math.min(...METASEQUOIA_SHAPE_PROFILES.map((x) => x.totalHeight)), '树高轴展开幅度 ≥ 8m').toBeGreaterThanOrEqual(8);
  });

  it('冠幅轴：幼极窄 < 标准 < 老阔圆锥（首末比 ≥ 1.5）；全槽 ⊂ [0.20, 0.32]', () => {
    for (let slot = 0; slot < 8; slot++) {
      expect(p(slot).crownWidthRatio, `slot-${slot} crownWidthRatio`).toBeGreaterThanOrEqual(0.2);
      expect(p(slot).crownWidthRatio).toBeLessThanOrEqual(0.32);
    }
    expect(p(2).crownWidthRatio / Math.min(p(1).crownWidthRatio, p(3).crownWidthRatio), '阔圆锥/极窄 冠幅比').toBeGreaterThanOrEqual(1.5);
    expect(p(1).crownWidthRatio, '幼树应窄于标准').toBeLessThan(p(0).crownWidthRatio);
    expect(p(0).crownWidthRatio, '标准应窄于老树').toBeLessThan(p(2).crownWidthRatio);
  });

  it('干高轴：立木净干 vs 低枝差 ≥ 0.10；全槽 ⊂ [0.35, 0.50]（Spec 干高域）', () => {
    for (let slot = 0; slot < 8; slot++) {
      expect(p(slot).trunkHeightRatio, `slot-${slot} trunkHeightRatio`).toBeGreaterThanOrEqual(0.35);
      expect(p(slot).trunkHeightRatio).toBeLessThanOrEqual(0.5);
    }
    expect(p(3).trunkHeightRatio - Math.min(p(1).trunkHeightRatio, p(4).trunkHeightRatio), '立木-低枝 干高差').toBeGreaterThanOrEqual(0.1);
  });

  it('干基膨大轴：全槽 ⊂ [1.3, 2.0]（Spec ×1.5–2.0 中龄合理域的外推带）；年龄轴单调升（幼 1.3 < 标 1.6 < 老 2.0）', () => {
    for (let slot = 0; slot < 8; slot++) {
      expect(p(slot).trunkFlareRatio, `slot-${slot} trunkFlareRatio`).toBeGreaterThanOrEqual(1.3);
      expect(p(slot).trunkFlareRatio).toBeLessThanOrEqual(2.0);
    }
    expect(p(1).trunkFlareRatio, '幼树膨大最弱').toBeLessThan(p(0).trunkFlareRatio);
    expect(p(0).trunkFlareRatio, '标准膨大应弱于老树').toBeLessThan(p(2).trunkFlareRatio);
  });

  it('年龄轴（幼→中→老）：垂帘乘子单调升、顶梢段占比单调降', () => {
    expect(p(1).fringeLengthRatio, '幼树垂帘应最短').toBeLessThan(p(0).fringeLengthRatio);
    expect(p(0).fringeLengthRatio, '老树垂帘应最长').toBeLessThan(p(2).fringeLengthRatio);
    expect(p(2).fringeLengthRatio - p(1).fringeLengthRatio, '垂帘年龄轴展开 ≥ 0.2').toBeGreaterThanOrEqual(0.2);
    expect(p(1).leaderLengthRatio, '幼树顶梢段占比应最大（尖塔主导）').toBeGreaterThan(p(0).leaderLengthRatio);
    expect(p(0).leaderLengthRatio, '中龄顶梢段占比应大于老树').toBeGreaterThan(p(2).leaderLengthRatio);
  });

  it('偏冠（对的破缺）：rank 首末比 ≥ 1.5 且 ≥ 标准 ×1.4；asymmetry 升（跨层同方位相干偏侧）', () => {
    const lopsided = p(5);
    const anchor = p(0);
    const ratio = (a: number[]) => a[0]! / a[a.length - 1]!;
    expect(ratio(lopsided.tierRankLength), '偏冠槽 rank 首末比').toBeGreaterThanOrEqual(1.5);
    expect(ratio(lopsided.tierRankLength), '偏冠槽 rank 首末比应 ≥ 标准 ×1.4').toBeGreaterThanOrEqual(ratio(anchor.tierRankLength) * 1.4);
    expect(lopsided.crownAsymmetry, '偏冠槽 asymmetry 应升').toBeGreaterThan(anchor.crownAsymmetry);
  });

  it('疏密轴：疏松/丰满 密度比 ≤ 0.86', () => {
    expect(p(6).canopyDensity / p(7).canopyDensity, '疏松/丰满 密度比').toBeLessThanOrEqual(0.86);
  });

  it('8 槽向量不全等（槽身份可辨——差量展开不退化为复制）', () => {
    const serialized = new Set(METASEQUOIA_SHAPE_PROFILES.map((x) => JSON.stringify(x)));
    expect(serialized.size, '8 槽应至少有两个不同向量').toBeGreaterThan(1);
  });
});

describe('slot-0 锚点域（Step 1 判定 10 + Spec 尺度锚）', () => {
  const anchor = METASEQUOIA_SHAPE_PROFILES[0]!;

  it('开阔孤立中龄密尖塔锚：树高 ∈ [19, 21]（≈20 生产锚——风动树高锚同源断言）/ 冠幅 ∈ [0.23, 0.27] / 干高 ∈ [0.38, 0.42] / 膨大 ∈ [1.5, 1.7] / tierCount ∈ [8, 12]', () => {
    expect(anchor.totalHeight, 'slot-0 生产锚 ≈20m（Inferred；材质风动锚同源直读本字段）').toBeGreaterThanOrEqual(19);
    expect(anchor.totalHeight).toBeLessThanOrEqual(21);
    expect(anchor.crownWidthRatio, 'slot-0 冠幅比锚 ≈0.25（Spec 域 0.22–0.30）').toBeGreaterThanOrEqual(0.23);
    expect(anchor.crownWidthRatio).toBeLessThanOrEqual(0.27);
    expect(anchor.trunkHeightRatio, 'slot-0 干高锚 ≈0.40（Spec 域 0.35–0.50）').toBeGreaterThanOrEqual(0.38);
    expect(anchor.trunkHeightRatio).toBeLessThanOrEqual(0.42);
    expect(anchor.trunkFlareRatio, 'slot-0 干基膨大锚 ≈1.6（NC 域 ×1.6–1.9 中值）').toBeGreaterThanOrEqual(1.5);
    expect(anchor.trunkFlareRatio).toBeLessThanOrEqual(1.7);
    expect(anchor.tierCount, 'slot-0 主层数 8–12（判定 1 密层预估带 Inferred-待探针）').toBeGreaterThanOrEqual(8);
    expect(anchor.tierCount).toBeLessThanOrEqual(12);
  });

  it('层角梯度方向：全槽 base > top（下部平展上部上举）且落 Spec 终审精化域 base ∈ [70, 85]、top ∈ [30, 50]（自垂直角）', () => {
    for (let slot = 0; slot < 8; slot++) {
      const s = METASEQUOIA_SHAPE_PROFILES[slot]!;
      expect(s.tierAngleBase, `slot-${slot} tierAngleBase`).toBeGreaterThan(s.tierAngleTop);
      expect(s.tierAngleBase).toBeGreaterThanOrEqual(70);
      expect(s.tierAngleBase).toBeLessThanOrEqual(85);
      expect(s.tierAngleTop).toBeGreaterThanOrEqual(30);
      expect(s.tierAngleTop).toBeLessThanOrEqual(50);
    }
  });
});

describe('水杉新语义（判定路径首证——对生/羽卡/连续锥/双器官/轻垂的参数语义）', () => {
  const anchor = METASEQUOIA_SHAPE_PROFILES[0]!;

  it('密连续锥冠：tierGapBand 全槽 === 0（无层隙——vs 雪松层叠带隙）；收顶指数 ≥ 1、收顶比 ∈ (0, 0.3]（窄塔急收）', () => {
    for (const s of METASEQUOIA_SHAPE_PROFILES) {
      expect(s.tierGapBand, '层隙带应零端消费（密连续锥）').toBe(0);
      expect(s.tierProfileExponent).toBeGreaterThanOrEqual(1);
      expect(s.tierRadiusTaper).toBeGreaterThan(0);
      expect(s.tierRadiusTaper).toBeLessThanOrEqual(0.3);
    }
  });

  it('对生挂点语言：tierBranchCount 2（对生成对）+ tierPhaseStagger 90°（层间交错）+ clusterAzimuthStep π/2（对生交错叶序）全槽恒等', () => {
    for (const s of METASEQUOIA_SHAPE_PROFILES) {
      expect(s.tierBranchCount, '每层 1 对生对').toBe(2);
      expect(s.tierPhaseStagger, '层间交错角（度）').toBe(90);
      expect(s.clusterAzimuthStep, '簇挂点方位步进（弧度）').toBeCloseTo(Math.PI / 2, 10);
    }
  });

  it('羽卡尺度：主卡尺度域 ⊂ [0.15, 0.32]（Step 4 密度校准带 0.18–0.30——对齐雪松 ≥0.3m 实证；初版真羽近真域被像素证伪）；轮廓比 ∈ [1.5, 3]（卵状椭圆）；元素数 ∈ [12, 28]（二列算术）', () => {
    expect(anchor.rosetteCardMin, '羽卡长域下限').toBeGreaterThanOrEqual(0.15);
    expect(anchor.rosetteCardMin + anchor.rosetteCardSpan, '羽卡长域上限').toBeLessThanOrEqual(0.32);
    expect(anchor.needleCardAspectMin, '羽卡轮廓比下限').toBeGreaterThanOrEqual(1.5);
    expect(anchor.needleCardAspectMin + anchor.needleCardAspectSpan, '羽卡轮廓比上限').toBeLessThanOrEqual(3);
    expect(anchor.rosetteNeedles, '羽卡 SDF 叶元素数落二列算术域').toBeGreaterThanOrEqual(12);
    expect(anchor.rosetteNeedles).toBeLessThanOrEqual(28);
  });

  it('末级轻垂：levels droop 逐级单调不降；全槽末级 ∈ (0.15, 0.40]（轻度——vs 雪松层缘垂帘 >0.3 端）', () => {
    for (const s of METASEQUOIA_SHAPE_PROFILES) {
      for (let i = 1; i < s.levels.length; i++) {
        expect(s.levels[i]!.droop, `levels[${i}].droop 应 ≥ 前级`).toBeGreaterThanOrEqual(s.levels[i - 1]!.droop);
      }
      const last = s.levels[s.levels.length - 1]!.droop;
      expect(last, '末级 droop 应 > 0.15（下垂方向恒在）').toBeGreaterThan(0.15);
      expect(last, '末级 droop 应 ≤ 0.40（轻垂档——垂帘重端归雪松谱系）').toBeLessThanOrEqual(0.4);
    }
  });

  it('顶梢不消费：leaderDroop 与 windLeader* 全槽 === 0（族内可选·雪松消费位的显式零占位锁）', () => {
    for (const s of METASEQUOIA_SHAPE_PROFILES) {
      expect(s.leaderDroop, 'leader 通直无点头').toBe(0);
      expect(s.wind.windLeaderAmplitude, '顶梢风动成分不消费').toBe(0);
      expect(s.wind.windLeaderFrequency).toBe(0);
    }
  });

  it('球果下垂账目：尺寸 ⊂ [0.014, 0.025]（Spec 近真 1.4–2.5cm）+ 候选 ∈ [1, 3]（单生）+ keep ≤ 0.45（零星-少量档）+ classRatio === 1（单 cohort 锁）', () => {
    expect(anchor.coneSizeMin).toBeGreaterThanOrEqual(0.014);
    expect(anchor.coneSizeMin + anchor.coneSizeSpan).toBeLessThanOrEqual(0.025);
    expect(anchor.coneCandidates).toBeGreaterThanOrEqual(1);
    expect(anchor.coneCandidates).toBeLessThanOrEqual(3);
    expect(anchor.coneKeepRatio, '零星-少量量级档（介于雪松正向与无果之间偏轻）').toBeLessThanOrEqual(0.45);
    expect(anchor.coneClassRatio, '当年熟单 cohort——两类并存位不消费').toBe(1);
  });

  it('雄序枯穗第二器官：尺寸 ⊂ [0.03, 0.05]（s04 实证 3–5cm）+ 候选 ∈ [2, 6] + keep ∈ (0, 0.5]', () => {
    const st = anchor.strobili!;
    expect(st.strobilusSizeMin).toBeGreaterThanOrEqual(0.03);
    expect(st.strobilusSizeMin + st.strobilusSizeSpan).toBeLessThanOrEqual(0.05);
    expect(st.strobilusCandidates).toBeGreaterThanOrEqual(2);
    expect(st.strobilusCandidates).toBeLessThanOrEqual(6);
    expect(st.strobilusKeepRatio).toBeGreaterThan(0);
    expect(st.strobilusKeepRatio).toBeLessThanOrEqual(0.5);
  });

  it('树皮纵长条片：单元长域 ⊂ [0.05, 0.35] + 沟深 > 0.5（深索端——vs 雪松浅-中沟）', () => {
    expect(anchor.bark.barkPlateMin).toBeGreaterThanOrEqual(0.05);
    expect(anchor.bark.barkPlateMin + anchor.bark.barkPlateSpan).toBeLessThanOrEqual(0.35);
    expect(anchor.bark.barkGrooveDepth, '深索状浮雕（s08 Observed）').toBeGreaterThan(0.5);
    expect(anchor.bark.barkGrooveDepth).toBeLessThan(1);
  });

  it('风动两成分：tier/fringe 全部 > 0；羽枝细颤频率与幅度均 > 整冠慢摆（判定 8 末级高频细颤为主成分）', () => {
    const w = anchor.wind;
    for (const value of [w.windTierAmplitude, w.windTierFrequency, w.windFringeAmplitude, w.windFringeFrequency]) {
      expect(value).toBeGreaterThan(0);
    }
    expect(w.windFringeFrequency, '羽枝颤频率应高于整冠慢摆').toBeGreaterThan(w.windTierFrequency);
    expect(w.windFringeAmplitude, '羽枝颤幅度应大于整冠慢摆（主成分）').toBeGreaterThan(w.windTierAmplitude);
  });
});

describe('契约转正回归锁（012.2 族级职责——cedrus 实例化对定稿契约零变化）', () => {
  it('cedrus 键位零变化：53 位（47 扁平 + 6 嵌套组）；转正新增可选位全部缺席（可选字段零触碰——编译期保证由本文件 import 承担）', () => {
    const keys = Object.keys(CEDRUS_SLOT0_PROFILE);
    expect(keys, 'cedrus slot-0 键位数（转正只增可选位——必选位零增删）').toHaveLength(53);
    for (const optional of ['tierPhaseStagger', 'clusterAzimuthStep', 'strobili'] as const) {
      expect(keys, `cedrus 不应提供可选位 ${optional}`).not.toContain(optional);
    }
    expect(Object.keys(CEDRUS_SLOT0_PROFILE.needleMaterial), 'cedrus needleMaterial 键位数').toHaveLength(4);
    expect(
      Object.keys(CEDRUS_SLOT0_PROFILE.needleMaterial),
      'cedrus needleMaterial 不应提供可选位 needleFaceContrast',
    ).not.toContain('needleFaceContrast');
  });

  it('水杉键位：56 位（53 必选同形 + 挂点语言 2 + strobili 组 1）；⊇ cedrus 全部键位（必选位零删改）+ 新可选位在位', () => {
    const metaKeys = Object.keys(METASEQUOIA_SLOT0_PROFILE);
    expect(metaKeys).toHaveLength(56);
    for (const key of Object.keys(CEDRUS_SLOT0_PROFILE)) {
      expect(metaKeys, `水杉应含 cedrus 同位必选键 ${key}`).toContain(key);
    }
    for (const optional of ['tierPhaseStagger', 'clusterAzimuthStep', 'strobili'] as const) {
      expect(metaKeys, `水杉应消费新可选位 ${optional}`).toContain(optional);
    }
    expect(METASEQUOIA_SLOT0_PROFILE.needleMaterial.needleFaceContrast, '两面温和色差位在位（族内差异轴）').toBeDefined();
  });
});
