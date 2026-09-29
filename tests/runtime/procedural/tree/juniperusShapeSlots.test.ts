/**
 * tests/runtime/procedural/tree/juniperusShapeSlots.test.ts —— 圆柏 8 槽形态向量
 * **配置侧**测试（T012.3 Step 2；组织对称族先例 metasequoiaShapeSlots、内容按新增
 * 语义裁定——D40 五者准入：**新任务新语义**〔契约定稿态增量消费第三例 + 圆柏参数
 * 面——散生退化消费挂点 / 绳状鳞卡第 3 叶语言 + 刺叶 minority 双叶型并存 / 柱卵
 * 双冠轮廓 / 浆果双熟度账目 / 第 16 树皮语言 / 干基微膨 / 顶梢不消费〕；不复制
 * 公共能力测试）。
 *
 * 覆盖（Step 2 边界 = 参数面——**零几何消费**：几何/资产入口消费者 Step 3 交付后由
 * juniperusStructure / 路由测试补全〔皮面数恒等实测 / 同 seed 逐位复现 / build 直调
 * 一致〕，本文件锁配置侧可判定的全部不变量）：
 * - 结构计数恒等（配置侧锁）：8 槽 tierCount / tierBranchCount / trunk·levels 的
 *   radial·segs / childPlan / clustersL5·L4 / longShootCardsL5·L4 / coneCandidates /
 *   tierRank* 数组长度逐位同 slot-0——皮面数恒等与 rng 消费次数恒等的结构性前提
 *   （展开继承纪律；rng 无条件消费纪律的消费次数与数据分支无关）；
 * - 叶身份与挂点语言恒等：绳卡元素数 / 绳卡与刺卡尺度域 / 轮廓比域 / 球果组（尺寸·
 *   账目·色）/ needleMaterial / bark / wind 全组逐位同 slot-0 + 散生挂点语言位
 *   （tierPhaseStagger / clusterAzimuthStep **双省略** = rng 方位散布语言 + tierGapBand
 *   零端）全槽恒等（叶与器官身份 + 散生语言不随槽变）；canopyDensity ≤ 1；
 * - 槽差异真实（伪差异禁止——方向性断言，数值见 juniperusShapeProfile 各槽注释）：
 *   树高轴（幼尖塔 < 标准狭圆柱 < 老树阔卵 + 8 槽全域 ⊂ [4, 10] 判定 9 主轴）/
 *   冠形双型轴（狭圆柱槽 ⊂ [0.2, 0.3] ↔ 卵圆槽 ∈ [0.4, 0.6] ↔ 阔卵老树端 ∈
 *   [0.7, 0.9]）/ 干高轴（枝到地 vs 净干差 ≥ 0.10 + 全槽 ⊂ [0.10, 0.25]）/ 干基
 *   微膨轴（全槽 ⊂ [1.0, 1.3] Spec 域 + 年龄轴单调升）/ 年龄轴（幼→中→老：垂帘
 *   乘子单调升、顶梢段占比单调降）/ 偏冠（散生对内破缺 rank 首末比 ≥ 1.5 且 ≥
 *   标准 ×1.4 + asymmetry 升）/ 疏密（疏松/丰满密度比 ≤ 0.86）+ 8 槽向量不全等；
 * - slot-0 锚点域（判定 9 + Spec 尺度锚）：树高 ∈ [7.5, 8.5]（≈8 生产锚——**同源
 *   风动树高锚断言**：材质锚直读 totalHeight，无独立锚字段）/ 冠幅 ∈ [0.26, 0.30] /
 *   干高 ∈ [0.13, 0.17] / 微膨 ∈ [1.1, 1.2] / tierCount ∈ [9, 12]（密层退化带）/
 *   枝角梯度方向（全槽 base > top 且落任务裁定带 base ∈ [40, 70]、top ∈ [20, 40]，
 *   自垂直角）；
 * - 圆柏新语义（判定路径首证断言）：散生退化消费（tierSpacingJitter 全槽 ≥ 0.40
 *   大抖动破层 + tierGapBand 全槽 === 0 无层隙 + 双省略挂点语言——判定 1 退化路径
 *   零契约新增的锁）；柱/卵双冠轮廓（柱端 tierRadiusTaper ≥ 0.8 近等宽 ↔ 阔卵端
 *   收顶指数 ≥ 1.7 且冠幅 ≥ 0.7 中下部最宽）；双叶型并存（longShootCards > 0 刺叶
 *   minority 消费——族内首例双叶型 + 刺卡长域 ⊂ [0.10, 0.22] 近景位 + 绳卡尺度域
 *   ⊂ [0.15, 0.32] 族校准带——禁亚像素初值）；紧密直伸（levels droop 链单调 +
 *   末级 ∈ (0, 0.10] 近零端——三例最低幅 vs 水杉轻垂/雪松垂帘）；顶梢不消费
 *   （leaderDroop 与 windLeader* 全槽 === 0——族内可选·雪松消费位的显式零占位锁
 *   第三例）；浆果双熟度账目（尺寸 ⊂ [0.005, 0.009] Spec 近真 6–8 mm + 候选 ∈
 *   [2, 4] 小簇 + keep ∈ (0.4, 0.7] 中量-较多档 + classRatio ∈ (0.5, 0.9) 熟果
 *   主导的双熟度消费锁 + 双色distinct）；雄球花不消费（strobili === undefined）+
 *   无两面色差（needleFaceContrast === undefined）；树皮第 16 语言（单元域 ⊂
 *   [0.05, 0.25] + 沟深 ∈ (0.4, 0.7) 中深 + 三色 R≥G≥B 灰-灰褐基调——无水杉红褐
 *   基调的语言区分锁）；风动两成分（整冠摆幅度 > 末级微颤——密实质量体主成分
 *   判定 8，与水杉羽颤主成分反向；leader 成分 === 0）；密实带（canopyDensity
 *   全槽 ≥ 0.85——密实 90–95% 身份的参数面投影）；
 * - **参数面自检断言（T030 试行）**：模块头算术摘要 vs 数据行一致性（拓扑展开
 *   L1–L5 = [20, 40, 80, 160, 320] + 皮面基数 16808 + 绳卡标称位 5600〔Step 4
 *   校准 12/8 → 13/9〕 + 刺卡标称位 800——拦截笔误类缺陷，012.1 childPlan 笔误
 *   实证）+ 定稿态消费键位锁（顶层 53 = 47 必选扁平 + 6 嵌套组；needleMaterial
 *   4；可选 3 位全部缺席——省略即散生 rng 语言与雄球花不做）。
 */
import { describe, expect, it } from 'vitest';
import {
  JUNIPERUS_SHAPE_PROFILES,
  JUNIPERUS_SLOT0_PROFILE,
} from '../../../../src/runtime/procedural/tree/juniperus/juniperusShapeProfile';

const SLOT_NAMES = [
  '标准狭圆柱',
  '幼尖塔',
  '老树阔卵',
  '卵圆中龄',
  '高狭圆柱',
  '偏冠',
  '疏松',
  '丰满',
] as const;

describe('结构计数恒等（配置侧锁——皮面数与 rng 消费恒等的前提）', () => {
  it('8 槽结构计数类字段逐位同 slot-0（展开继承纪律）', () => {
    const anchor = JUNIPERUS_SHAPE_PROFILES[0]!;
    expect(JUNIPERUS_SHAPE_PROFILES).toHaveLength(8);
    expect(anchor).toBe(JUNIPERUS_SLOT0_PROFILE);
    for (let slot = 1; slot < 8; slot++) {
      const p = JUNIPERUS_SHAPE_PROFILES[slot]!;
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
      // 簇位 / 刺卡（双叶型并存——两族计数均恒等）/ 球果候选（rng 无条件消费的固定计数）
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

  it('叶身份与挂点语言类字段全组逐位同 slot-0（叶与器官身份 + 散生语言不随槽变）', () => {
    const anchor = JUNIPERUS_SHAPE_PROFILES[0]!;
    for (let slot = 1; slot < 8; slot++) {
      const p = JUNIPERUS_SHAPE_PROFILES[slot]!;
      // 绳卡身份（元素数 / 尺寸域 / 轮廓比域）+ 刺卡身份（长域——双叶型两侧）
      expect(p.rosetteNeedles, `slot-${slot} rosetteNeedles`).toBe(anchor.rosetteNeedles);
      expect(p.rosetteCardMin, `slot-${slot} rosetteCardMin`).toBe(anchor.rosetteCardMin);
      expect(p.rosetteCardSpan, `slot-${slot} rosetteCardSpan`).toBe(anchor.rosetteCardSpan);
      expect(p.needleCardLenMin, `slot-${slot} needleCardLenMin`).toBe(anchor.needleCardLenMin);
      expect(p.needleCardLenSpan, `slot-${slot} needleCardLenSpan`).toBe(anchor.needleCardLenSpan);
      expect(p.needleCardAspectMin, `slot-${slot} needleCardAspectMin`).toBe(anchor.needleCardAspectMin);
      expect(p.needleCardAspectSpan, `slot-${slot} needleCardAspectSpan`).toBe(anchor.needleCardAspectSpan);
      // 球果账目组（账位·存活·尺寸·双熟度比·三色）
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
      // 挂点语言身份（散生 rng 散布——双省略 + 零端层隙，语言不随槽变）
      expect(p.tierPhaseStagger, `slot-${slot} tierPhaseStagger 应省略（散生 rng 方位）`).toBeUndefined();
      expect(p.clusterAzimuthStep, `slot-${slot} clusterAzimuthStep 应省略（散生 rng 方位）`).toBeUndefined();
      expect(p.tierGapBand, `slot-${slot} tierGapBand`).toBe(anchor.tierGapBand);
    }
  });
});

describe('槽差异真实（伪差异禁止——方向性断言，数值锚见各槽注释）', () => {
  const p = (slot: number) => JUNIPERUS_SHAPE_PROFILES[slot]!;

  it('树高轴：幼尖塔 < 标准狭圆柱 < 老树阔卵；8 槽全域 ⊂ [4, 10]（判定 9 主轴）', () => {
    for (let slot = 0; slot < 8; slot++) {
      expect(p(slot).totalHeight, `slot-${slot} ${SLOT_NAMES[slot]} totalHeight`).toBeGreaterThanOrEqual(4);
      expect(p(slot).totalHeight).toBeLessThanOrEqual(10);
    }
    expect(p(1).totalHeight, '幼尖塔应低于标准').toBeLessThan(p(0).totalHeight);
    expect(p(0).totalHeight, '标准应低于老树').toBeLessThan(p(2).totalHeight);
    expect(Math.max(...JUNIPERUS_SHAPE_PROFILES.map((x) => x.totalHeight)) -
      Math.min(...JUNIPERUS_SHAPE_PROFILES.map((x) => x.totalHeight)), '树高轴展开幅度 ≥ 5m').toBeGreaterThanOrEqual(5);
  });

  it('冠形双型轴：狭圆柱槽 ⊂ [0.2, 0.3]（slot-0/1/4）↔ 卵圆槽 ∈ [0.4, 0.6]（slot-3）↔ 阔卵老树端 ∈ [0.7, 0.9]（slot-2）', () => {
    for (const slot of [0, 1, 4]) {
      expect(p(slot).crownWidthRatio, `slot-${slot} ${SLOT_NAMES[slot]} 狭圆柱冠幅比`).toBeGreaterThanOrEqual(0.2);
      expect(p(slot).crownWidthRatio).toBeLessThanOrEqual(0.3);
    }
    expect(p(3).crownWidthRatio, '卵圆中龄冠幅比（Spec 卵圆带 0.4–0.6）').toBeGreaterThanOrEqual(0.4);
    expect(p(3).crownWidthRatio).toBeLessThanOrEqual(0.6);
    expect(p(2).crownWidthRatio, '老树阔卵冠幅比（Spec 老树端 0.7–0.9）').toBeGreaterThanOrEqual(0.7);
    expect(p(2).crownWidthRatio).toBeLessThanOrEqual(0.9);
    expect(p(1).crownWidthRatio, '幼尖塔应窄于标准').toBeLessThan(p(0).crownWidthRatio);
  });

  it('干高轴：枝到地 vs 净干差 ≥ 0.10；全槽 ⊂ [0.10, 0.25]（判定 9 主轴域 + Spec 0.1–0.2）', () => {
    for (let slot = 0; slot < 8; slot++) {
      expect(p(slot).trunkHeightRatio, `slot-${slot} trunkHeightRatio`).toBeGreaterThanOrEqual(0.1);
      expect(p(slot).trunkHeightRatio).toBeLessThanOrEqual(0.25);
    }
    expect(Math.max(p(2).trunkHeightRatio, p(6).trunkHeightRatio) -
      Math.min(p(1).trunkHeightRatio, p(7).trunkHeightRatio), '净干-枝到地 干高差').toBeGreaterThanOrEqual(0.1);
  });

  it('干基微膨轴：全槽 ⊂ [1.0, 1.3]（Spec 常态或微膨 ≤×1.3 弱读——水杉膨大字段的低值端消费）；年龄轴单调升（幼 1.05 < 标 1.15 < 老 1.28）', () => {
    for (let slot = 0; slot < 8; slot++) {
      expect(p(slot).trunkFlareRatio, `slot-${slot} trunkFlareRatio`).toBeGreaterThanOrEqual(1.0);
      expect(p(slot).trunkFlareRatio).toBeLessThanOrEqual(1.3);
    }
    expect(p(1).trunkFlareRatio, '幼树微膨最弱').toBeLessThan(p(0).trunkFlareRatio);
    expect(p(0).trunkFlareRatio, '标准微膨应弱于老树').toBeLessThan(p(2).trunkFlareRatio);
  });

  it('年龄轴（幼→中→老）：垂帘乘子单调升、顶梢段占比单调降', () => {
    expect(p(1).fringeLengthRatio, '幼尖塔垂帘应最短').toBeLessThan(p(0).fringeLengthRatio);
    expect(p(0).fringeLengthRatio, '老树垂帘应最长').toBeLessThan(p(2).fringeLengthRatio);
    expect(p(2).fringeLengthRatio - p(1).fringeLengthRatio, '垂帘年龄轴展开 ≥ 0.10').toBeGreaterThanOrEqual(0.1);
    expect(p(1).leaderLengthRatio, '幼尖塔顶梢段占比应最大（尖塔主导）').toBeGreaterThan(p(0).leaderLengthRatio);
    expect(p(0).leaderLengthRatio, '中龄顶梢段占比应大于老树').toBeGreaterThan(p(2).leaderLengthRatio);
  });

  it('偏冠（散生对的破缺）：rank 首末比 ≥ 1.5 且 ≥ 标准 ×1.4；asymmetry 升', () => {
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
    const serialized = new Set(JUNIPERUS_SHAPE_PROFILES.map((x) => JSON.stringify(x)));
    expect(serialized.size, '8 槽应至少有两个不同向量').toBeGreaterThan(1);
  });
});

describe('slot-0 锚点域（Step 1 判定 9 + Spec 尺度锚）', () => {
  const anchor = JUNIPERUS_SHAPE_PROFILES[0]!;

  it('开阔中龄狭圆柱锚：树高 ∈ [7.5, 8.5]（≈8 生产锚——风动树高锚同源断言）/ 冠幅 ∈ [0.26, 0.30] / 干高 ∈ [0.13, 0.17] / 微膨 ∈ [1.1, 1.2] / tierCount ∈ [9, 12]', () => {
    expect(anchor.totalHeight, 'slot-0 生产锚 ≈8m（Inferred——显著低于水杉 20/雪松 16.5 锚；材质风动锚同源直读本字段）').toBeGreaterThanOrEqual(7.5);
    expect(anchor.totalHeight).toBeLessThanOrEqual(8.5);
    expect(anchor.crownWidthRatio, 'slot-0 冠幅比锚 ≈0.28（Spec 狭圆柱带 0.2–0.3 中值）').toBeGreaterThanOrEqual(0.26);
    expect(anchor.crownWidthRatio).toBeLessThanOrEqual(0.3);
    expect(anchor.trunkHeightRatio, 'slot-0 干高锚 ≈0.15（Spec 域 0.1–0.2 中值）').toBeGreaterThanOrEqual(0.13);
    expect(anchor.trunkHeightRatio).toBeLessThanOrEqual(0.17);
    expect(anchor.trunkFlareRatio, 'slot-0 干基微膨锚 ≈1.15（Spec 常态或微膨 ≤1.3）').toBeGreaterThanOrEqual(1.1);
    expect(anchor.trunkFlareRatio).toBeLessThanOrEqual(1.2);
    expect(anchor.tierCount, 'slot-0 主层数 9–12（密层退化带 Inferred-待探针）').toBeGreaterThanOrEqual(9);
    expect(anchor.tierCount).toBeLessThanOrEqual(12);
  });

  it('枝角梯度方向：全槽 base > top（下部平展上部上举）且落任务裁定带 base ∈ [40, 70]、top ∈ [20, 40]（自垂直角——判定 1 枝角梯度第三次消费）', () => {
    for (let slot = 0; slot < 8; slot++) {
      const s = JUNIPERUS_SHAPE_PROFILES[slot]!;
      expect(s.tierAngleBase, `slot-${slot} tierAngleBase`).toBeGreaterThan(s.tierAngleTop);
      expect(s.tierAngleBase).toBeGreaterThanOrEqual(40);
      expect(s.tierAngleBase).toBeLessThanOrEqual(70);
      expect(s.tierAngleTop).toBeGreaterThanOrEqual(20);
      expect(s.tierAngleTop).toBeLessThanOrEqual(40);
    }
  });
});

describe('圆柏新语义（判定路径首证——散生/绳卡/双叶型/柱卵轮廓/双熟度账目的参数语义）', () => {
  const anchor = JUNIPERUS_SHAPE_PROFILES[0]!;

  it('散生退化消费（判定 1——零契约新增的锁）：tierSpacingJitter 全槽 ≥ 0.40（大抖动破层）+ tierGapBand 全槽 === 0（无层隙连续冠）+ 挂点语言双省略（rng 方位散布——同雪松近轮散布省略式）', () => {
    for (const s of JUNIPERUS_SHAPE_PROFILES) {
      expect(s.tierSpacingJitter, '层位垂直抖动应大抖动破层端（散生退化）').toBeGreaterThanOrEqual(0.4);
      expect(s.tierGapBand, '层隙带应零端消费（密实无层连续冠）').toBe(0);
      expect(s.tierPhaseStagger, '层间方位交错应省略（散生 rng）').toBeUndefined();
      expect(s.clusterAzimuthStep, '簇挂点方位步进应省略（散生 rng）').toBeUndefined();
    }
  });

  it('柱/卵双冠轮廓（判定 2——族内第三冠体语言）：柱端 slot-0/4 tierRadiusTaper ≥ 0.8（上下近等宽 + 顶部钝圆收）+ 指数 ≤ 1.3（近柱体）；阔卵端 slot-2 指数 ≥ 1.7（中下部最宽）', () => {
    for (const slot of [0, 4]) {
      expect(JUNIPERUS_SHAPE_PROFILES[slot]!.tierRadiusTaper, `slot-${slot} 柱端收顶比（近等宽桶柱——vs 雪松 0.22/水杉 0.15 锥收）`).toBeGreaterThanOrEqual(0.8);
      expect(JUNIPERUS_SHAPE_PROFILES[slot]!.tierProfileExponent).toBeLessThanOrEqual(1.3);
    }
    expect(anchor.tierRadiusTaper, '标准狭圆柱收顶比应 ≥ 卵圆端（柱近等宽 ↔ 卵中宽）').toBeGreaterThanOrEqual(JUNIPERUS_SHAPE_PROFILES[3]!.tierRadiusTaper);
    expect(JUNIPERUS_SHAPE_PROFILES[2]!.tierProfileExponent, '阔卵端收顶指数（中下部最宽卵形权重）').toBeGreaterThanOrEqual(1.7);
    expect(JUNIPERUS_SHAPE_PROFILES[3]!.tierProfileExponent, '卵圆端收顶指数').toBeGreaterThanOrEqual(1.5);
    expect(JUNIPERUS_SHAPE_PROFILES[1]!.tierRadiusTaper, '幼尖塔急收端（尖塔谱系）').toBeLessThanOrEqual(0.5);
  });

  it('双叶型并存（判定 3——族内首例）：longShootCards L5/L4 > 0（刺叶 minority 消费——cedrus 散生针卡机制复用）+ 刺卡长域 ⊂ [0.10, 0.22]（近景身份细节位——判定 3 明文中距无质量贡献）', () => {
    expect(anchor.longShootCardsL5, 'L5 刺卡计数（minority > 0）').toBeGreaterThan(0);
    expect(anchor.longShootCardsL4, 'L4 刺卡计数（minority > 0）').toBeGreaterThan(0);
    expect(anchor.needleCardLenMin, '刺卡长域下限').toBeGreaterThanOrEqual(0.1);
    expect(anchor.needleCardLenMin + anchor.needleCardLenSpan, '刺卡长域上限').toBeLessThanOrEqual(0.22);
    // minority 比例读向：刺卡 ≪ 绳卡（同枝挂点基数 2 vs 12）
    expect(anchor.longShootCardsL5, '刺卡应显著少于绳卡（鳞叶绝对主导）').toBeLessThan(anchor.clustersL5 / 2);
  });

  it('绳卡尺度带（第 3 叶语言主卡——禁亚像素初值）：主卡尺度域 ⊂ [0.15, 0.32]（**Step 4 校准值 0.24–0.32**——8m 小树 + 40K 预算硬顶的覆盖效率档，雪松 ≥0.3m 实证带量级）；轮廓比 ∈ [2.0, 4.8]（**校准联动下限 2.2 → 2.0**——加宽 30% 换 SDF 绳列中距占空；绳状细长读向保持 > 水杉羽卡全域均值）；元素数 ∈ [16, 32]（真列距 2.5–5mm 的 SDF 抽象）', () => {
    expect(anchor.rosetteCardMin, '绳卡长域下限（校准带下限 0.24）').toBeGreaterThanOrEqual(0.15);
    expect(anchor.rosetteCardMin + anchor.rosetteCardSpan, '绳卡长域上限（校准带上限 0.32）').toBeLessThanOrEqual(0.32);
    expect(anchor.needleCardAspectMin, '绳卡轮廓比下限（绳状细长）').toBeGreaterThanOrEqual(2.0);
    expect(anchor.needleCardAspectMin + anchor.needleCardAspectSpan, '绳卡轮廓比上限').toBeLessThanOrEqual(4.8);
    expect(anchor.rosetteNeedles, '绳卡 SDF 叶元素数落抽象域').toBeGreaterThanOrEqual(16);
    expect(anchor.rosetteNeedles).toBeLessThanOrEqual(32);
  });

  it('密实带：canopyDensity 全槽 ≥ 0.85（密实 90–95% 实心 Observed 的参数面投影——vs 水杉疏端 0.82）', () => {
    for (const s of JUNIPERUS_SHAPE_PROFILES) {
      expect(s.canopyDensity, '密实无层连续冠身份下限').toBeGreaterThanOrEqual(0.85);
      expect(s.canopyDensity).toBeLessThanOrEqual(1);
    }
  });

  it('紧密直伸（droop 链三例最低幅）：levels droop 逐级单调不降；全槽末级 ∈ (0, 0.10]（鳞叶小枝紧密直伸 Verified——vs 水杉轻垂 (0.15, 0.40]/雪松垂帘）', () => {
    for (const s of JUNIPERUS_SHAPE_PROFILES) {
      for (let i = 1; i < s.levels.length; i++) {
        expect(s.levels[i]!.droop, `levels[${i}].droop 应 ≥ 前级`).toBeGreaterThanOrEqual(s.levels[i - 1]!.droop);
      }
      const last = s.levels[s.levels.length - 1]!.droop;
      expect(last, '末级 droop 应 > 0（直伸链近零但方向恒在）').toBeGreaterThan(0);
      expect(last, '末级 droop 应 ≤ 0.10（紧密直伸档——轻垂端归水杉谱系）').toBeLessThanOrEqual(0.1);
    }
  });

  it('顶梢不消费：leaderDroop 与 windLeader* 全槽 === 0（族内可选·雪松消费位的显式零占位锁——通直无点头第三例）', () => {
    for (const s of JUNIPERUS_SHAPE_PROFILES) {
      expect(s.leaderDroop, 'leader 通直无点头').toBe(0);
      expect(s.wind.windLeaderAmplitude, '顶梢风动成分不消费').toBe(0);
      expect(s.wind.windLeaderFrequency).toBe(0);
    }
  });

  it('浆果双熟度账目（判定 5）：尺寸 ⊂ [0.005, 0.009]（Spec 近真 6–8 mm）+ 候选 ∈ [2, 4]（腋生 2–4 枚小簇）+ keep ∈ (0.4, 0.7]（中量-较多档——族内第三档位）+ classRatio ∈ (0.5, 0.9)（熟果主导的双熟度并存锁）+ 双色 distinct', () => {
    expect(anchor.coneSizeMin).toBeGreaterThanOrEqual(0.005);
    expect(anchor.coneSizeMin + anchor.coneSizeSpan).toBeLessThanOrEqual(0.009);
    expect(anchor.coneCandidates).toBeGreaterThanOrEqual(2);
    expect(anchor.coneCandidates).toBeLessThanOrEqual(4);
    expect(anchor.coneKeepRatio, '中量-较多量级档（vs 水杉轻量 0.30）').toBeGreaterThan(0.4);
    expect(anchor.coneKeepRatio).toBeLessThanOrEqual(0.7);
    expect(anchor.coneClassRatio, '将熟果占比应过半（霜果主导——s07 色构成 70–80%）').toBeGreaterThan(0.5);
    expect(anchor.coneClassRatio).toBeLessThan(0.9);
    expect(anchor.coneColorMature, '双熟度双色应 distinct（暗蓝紫褐熟果 vs 绿幼果）').not.toBe(anchor.coneColorYoung);
  });

  it('雄球花不消费 + 无两面色差：strobili === undefined（春季物候窗不消费——判定 5 明文）+ needleFaceContrast === undefined（终审修正口径：无两面色差同雪松）', () => {
    for (const s of JUNIPERUS_SHAPE_PROFILES) {
      expect(s.strobili, '雄球花第二器官组应省略整组').toBeUndefined();
      expect(s.needleMaterial.needleFaceContrast, '两面色差位应省略（无两面差语义）').toBeUndefined();
    }
  });

  it('树皮第 16 语言（灰-灰褐基调纵长条片）：单元长域 ⊂ [0.05, 0.25] + 沟深 ∈ (0.4, 0.7)（中深——介于雪松浅-中与水杉深索）+ 三色 R≥G≥B（灰-灰褐读向——无水杉红褐基调的语言区分锁）', () => {
    expect(anchor.bark.barkPlateMin).toBeGreaterThanOrEqual(0.05);
    expect(anchor.bark.barkPlateMin + anchor.bark.barkPlateSpan).toBeLessThanOrEqual(0.25);
    expect(anchor.bark.barkGrooveDepth, '沟脊浮雕中深端').toBeGreaterThan(0.4);
    expect(anchor.bark.barkGrooveDepth).toBeLessThan(0.7);
    for (const color of [anchor.bark.barkBaseColor, anchor.bark.barkPlateColor, anchor.bark.barkGrooveColor]) {
      const r = (color >> 16) & 0xff;
      const g = (color >> 8) & 0xff;
      const b = color & 0xff;
      expect(r, `树皮色 0x${color.toString(16)} R≥G（灰-灰褐基调）`).toBeGreaterThanOrEqual(g);
      expect(g, `树皮色 0x${color.toString(16)} G≥B`).toBeGreaterThanOrEqual(b);
    }
  });

  it('风动两成分（判定 8——密实质量体）：tier/fringe 全部 > 0；整冠摆幅度 > 末级微颤（主成分——与水杉羽颤主成分反向）；微颤频率 > 慢摆频率', () => {
    const w = anchor.wind;
    for (const value of [w.windTierAmplitude, w.windTierFrequency, w.windFringeAmplitude, w.windFringeFrequency]) {
      expect(value).toBeGreaterThan(0);
    }
    expect(w.windTierAmplitude, '整冠摆幅度应大于末级微颤（密实质量体主成分）').toBeGreaterThan(w.windFringeAmplitude);
    expect(w.windFringeFrequency, '末级微颤频率应高于整冠慢摆').toBeGreaterThan(w.windTierFrequency);
  });
});

describe('参数面自检断言（T030 试行——模块头算术摘要 vs 数据行一致性 + 拓扑展开，拦截笔误类缺陷）', () => {
  const anchor = JUNIPERUS_SHAPE_PROFILES[0]!;

  it('拓扑展开：L1 = tierCount × tierBranchCount = 20；childPlan 逐级 ×2 → L1–L5 = [20, 40, 80, 160, 320]（模块头摘要）', () => {
    const l1 = anchor.tierCount * anchor.tierBranchCount;
    expect(l1, 'L1 层枝数').toBe(20);
    const counts: number[] = [l1];
    for (const plan of anchor.childPlan) {
      counts.push(counts[counts.length - 1]! * plan.ts.length);
    }
    expect(counts, '逐级枝数展开（皮面与 rng 消费的结构性来源）').toEqual([20, 40, 80, 160, 320]);
    expect(anchor.childPlan, '四过渡级（L1→L5）').toHaveLength(4);
    expect(anchor.levels, '五级枝拓扑').toHaveLength(5);
  });

  it('皮面基数：trunk 288 + L1 1960 + L2 2400 + L3 3200 + L4 3840 + L5 5120 = 16808（模块头「皮恒 16808」）', () => {
    const counts = [20, 40, 80, 160, 320];
    const trunkFaces = anchor.trunk.radial * anchor.trunk.segs * 2;
    expect(trunkFaces, '主干皮面').toBe(288);
    let sum = trunkFaces;
    anchor.levels.forEach((level, i) => {
      sum += counts[i]! * level.radial * level.segs * 2;
    });
    expect(sum, '皮面基数（跨槽恒等的结构性数值——模块头摘要一致）').toBe(16808);
  });

  it('卡账标称位：绳卡 L5 320×13 + L4 160×9 = 5600（Step 4 校准联动 12/8 → 13/9）；刺卡 320×2 + 160×1 = 800（模块头摘要）', () => {
    const rope = anchor.clustersL5 * 320 + anchor.clustersL4 * 160;
    const awl = anchor.longShootCardsL5 * 320 + anchor.longShootCardsL4 * 160;
    expect(rope, '绳卡标称挂点位').toBe(5600);
    expect(awl, '刺卡标称挂点位（双叶型 minority）').toBe(800);
    expect((rope + awl) * 4, '交叉双卡 4 tri 标称卡面').toBe(25600);
  });

  it('定稿态消费键位锁：顶层 53（47 必选扁平 + 6 嵌套组）；needleMaterial 4；可选 3 位全部缺席（省略即散生 rng 语言 + 雄球花不做——消费差异记档归族门）', () => {
    const keys = Object.keys(JUNIPERUS_SLOT0_PROFILE);
    expect(keys, '顶层键位（47 扁平 + needleMaterial/bark/wind/trunk/levels/childPlan）').toHaveLength(53);
    for (const optional of ['tierPhaseStagger', 'clusterAzimuthStep', 'strobili'] as const) {
      expect(keys, `不应提供可选位 ${optional}（省略即语义）`).not.toContain(optional);
    }
    expect(Object.keys(JUNIPERUS_SLOT0_PROFILE.needleMaterial), 'needleMaterial 键位').toHaveLength(4);
    expect(
      Object.keys(JUNIPERUS_SLOT0_PROFILE.needleMaterial),
      '不应提供可选位 needleFaceContrast（无两面差省略）',
    ).not.toContain('needleFaceContrast');
    // 双叶型消费位在位（cedrus 侧族内可选位——本例第二消费者）
    for (const consumed of ['needleCardLenMin', 'longShootCardsL5', 'coneClassRatio', 'coneColorYoung', 'coneAxisColor'] as const) {
      expect(keys, `双叶型/双熟度消费位 ${consumed} 应在位（必选字段显式消费）`).toContain(consumed);
    }
  });
});
