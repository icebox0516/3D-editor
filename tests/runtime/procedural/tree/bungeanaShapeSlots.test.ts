/**
 * tests/runtime/procedural/tree/bungeanaShapeProfile.test.ts —— 白皮松 8 槽形态
 * 向量**参数面自检**测试（T012.4 Step 2；组织对称族先例 juniperusShapeSlots、
 * 内容按新增语义裁定——D40 五者准入：**新任务新语义**〔契约定稿态增量消费第四例
 * + 白皮松参数面——散生退化消费直承 / 三针束聚合卡第 4 叶语言〔束生单律散生单针
 * 零占位〕/ 开张卵圆→伞形平顶冠谱系〔exp<1 新端型〕/ 双态两年熟低量果账目 / 第 17
 * 白基调斑驳皮〔弱浮雕〕/ 无两面色差第 4 数据点 / 多干近似 slot / 年龄皮色轴无
 * 承载位记档〕；不复制公共能力测试）。
 *
 * 覆盖（Step 2 边界 = 参数面——**零几何消费**：几何/资产入口消费者 Step 3 交付后
 * 由 bungeanaStructure / 路由测试补全〔皮面数恒等实测 / 同 seed 逐位复现 / build
 * 直调一致〕，本文件锁配置侧可判定的全部不变量）：
 * - 结构计数恒等（配置侧锁）：8 槽 tierCount / tierBranchCount / trunk·levels 的
 *   radial·segs / childPlan / clustersL5·L4 / longShootCardsL5·L4 / coneCandidates /
 *   tierRank* 数组长度逐位同 slot-0——皮面数恒等与 rng 消费次数恒等的结构性前提
 *   （展开继承纪律；rng 无条件消费纪律的消费次数与数据分支无关）；
 * - 叶身份与挂点语言恒等：束卡元素数 / 束卡与散生单针尺度域（后者零占位）/ 轮廓
 *   比域 / 球果组（尺寸·账目·色）/ needleMaterial / bark / wind 全组逐位同 slot-0
 *   + 散生挂点语言位（tierPhaseStagger / clusterAzimuthStep **双省略** = rng 方位
 *   散布语言 + tierGapBand 零端）全槽恒等（叶与器官身份 + 散生语言不随槽变）；
 *   canopyDensity ≤ 1；
 * - 槽差异真实（伪差异禁止——方向性断言，数值见 bungeanaShapeProfile 各槽注释）：
 *   树高轴（幼宽塔 < 标准开张卵圆 < 老树伞形 + 8 槽全域 ⊂ [8, 15] 判定 10 主轴）/
 *   冠形谱系轴（宽塔 slot-1 ⊂ [0.55, 0.65] ↔ 开张卵圆 slot-0 ∈ [0.80, 0.90] ⊂
 *   中龄 0.7–1.0 ↔ 伞形平顶 slot-2 > 1.2）/ 裸干轴（0.25–0.36 ⊂ Spec 0.25–0.4）/
 *   干基轴（全槽 ⊂ [1.0, 1.3] Spec 域 + 年龄轴单调升）/ 年龄轴（幼→中→老：层角
 *   base/top 单调升、垂帘乘子单调升、顶梢段占比单调降）/ 偏冠（散生对内破缺 rank
 *   首末比 ≥ 1.5 且 ≥ 标准 ×1.4 + asymmetry 升）/ 疏密（疏冠/满基准密度比 ≤ 0.86）+
 *   8 槽向量不全等；
 * - slot-0 锚点域（判定 10 + Spec 尺度锚）：树高 ∈ [11, 12]（~11–12 m 锚——**同源
 *   风动树高锚断言**：材质锚直读 totalHeight，无独立锚字段）/ 冠幅 ∈ [0.80, 0.90] /
 *   裸干 ∈ [0.28, 0.32] / 膨大 ∈ [1.1, 1.2] / tierCount ∈ [9, 12]（密层退化带）/
 *   枝角梯度方向（全槽 base > top 且落裁定带 base ∈ [40, 80]、top ∈ [20, 60]，
 *   自垂直角）；
 * - 白皮松新语义（判定路径首证断言）：散生退化消费（tierSpacingJitter 全槽 ≥ 0.40
 *   大抖动破层 + tierGapBand 全槽 === 0 无层隙 + 双省略挂点语言——判定 1 直承 012.3
 *   路径零契约新增的锁）；冠形谱系（宽塔急收 taper ≤ 0.5 ↔ 开张卵圆指数 ≥ 1.5 中
 *   下部最宽 ↔ 伞形平顶端 taper ≥ 0.8 且指数 ≤ 1.0 且 top 角 ≥ 50 平顶开张——
 *   **exp<1 新端型首用锁**）；束生单律（longShootCards 与 needleCardLen* 全槽 === 0
 *   ——散生单针通路零占位，第 4 挂点律负证据）；束卡尺度域 ⊂ [0.20, 0.32] 族终值
 *   带（禁亚像素初值）+ 轮廓比 ∈ [1.4, 2.8] 蓬松放射刷（下限 < 圆柏绳卡 2.0 的语言
 *   区分）+ 元素数 ∈ [8, 20] 真束算术域；疏散冠密度带（canopyDensity 全槽 ≥ 0.80
 *   ——半透光疏散身份的参数面下限，判定 4 caveat 落位）；细长直伸-端部微垂（levels
 *   droop 链单调 + 末级 ∈ (0, 0.10] 低幅端）；顶梢不消费（leaderDroop 与
 *   windLeader* 全槽 === 0——零占位第三例〔水杉/圆柏/白皮松〕）；双态两年熟低量
 *   果账目（尺寸 ⊂ [0.008, 0.05] 幼果-近熟域 + 候选 === 1 单生 + keep ∈ (0.1,
 *   0.35] 低量点彩档 + classRatio ∈ (0.1, 0.5) **幼果主导**反向档 + 双色 distinct）；
 *   雄球花不消费（strobili === undefined）+ 无两面色差（needleFaceContrast ===
 *   undefined——无差轴第 4 数据点）；树皮第 17 语言（单元域 ⊂ [0.05, 0.30] + 沟深
 *   ≤ 0.30 弱浮雕近光滑端——族内最低档 + 三色亮度单调 plate > base > groove 白基调
 *   + plate 近白低饱和〔通道 ≥ 180 且极差 ≤ 25〕+ base/groove R≥G≥B 灰褐-近黑
 *   ——**非褐色系白基调语言区分锁**）；风动两成分（整冠摆幅度 > 末级束颤——硬针
 *   小惯量小幅读向 + 束颤频率 > 慢摆频率 + leader 成分 === 0）；
 * - **参数面自检断言（沿 012.1 childPlan 笔误实证先例）**：模块头算术摘要 vs 数据
 *   行一致性（拓扑展开 L1–L5 = [20, 40, 80, 160, 320] + 皮面基数 16884 + 束卡标称
 *   位 5120 + 卡面标称 20480——拦截笔误类缺陷）+ 定稿态消费键位锁（顶层 53 = 47
 *   必选扁平 + 6 嵌套组；needleMaterial 4；可选 3 位全部缺席——省略即散生 rng 语言
 *   与雄球花不做）。
 */
import { describe, expect, it } from 'vitest';
import {
  BUNGEANA_SHAPE_PROFILES,
  BUNGEANA_SLOT0_PROFILE,
} from '../../../../src/runtime/procedural/tree/bungeana/bungeanaShapeProfile';

const SLOT_NAMES = [
  '标准开张卵圆',
  '幼态宽塔',
  '老树伞形平顶',
  '中老开张广卵',
  '紧凑中小',
  '偏冠',
  '疏冠透天',
  '多干变体(近似)',
] as const;

describe('结构计数恒等（配置侧锁——皮面数与 rng 消费恒等的前提）', () => {
  it('8 槽结构计数类字段逐位同 slot-0（展开继承纪律）', () => {
    const anchor = BUNGEANA_SHAPE_PROFILES[0]!;
    expect(BUNGEANA_SHAPE_PROFILES).toHaveLength(8);
    expect(anchor).toBe(BUNGEANA_SLOT0_PROFILE);
    for (let slot = 1; slot < 8; slot++) {
      const p = BUNGEANA_SHAPE_PROFILES[slot]!;
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
      // 簇位（束卡单挂点通路）/ 散生单针卡（零占位计数恒等）/ 球果候选（rng 无条件消费的固定计数）
      expect(p.clustersL5, `slot-${slot} clustersL5`).toBe(anchor.clustersL5);
      expect(p.clustersL4, `slot-${slot} clustersL4`).toBe(anchor.clustersL4);
      expect(p.longShootCardsL5, `slot-${slot} longShootCardsL5`).toBe(anchor.longShootCardsL5);
      expect(p.longShootCardsL4, `slot-${slot} longShootCardsL4`).toBe(anchor.longShootCardsL4);
      expect(p.coneCandidates, `slot-${slot} coneCandidates`).toBe(anchor.coneCandidates);
      // rank 数组长度（值连续可差量——长度是计数；slot-5 破缺 / slot-7 双强均在长度 2 内表达）
      expect(p.tierRankLength, `slot-${slot} tierRankLength 长度`).toHaveLength(anchor.tierRankLength.length);
      expect(p.tierRankRadius, `slot-${slot} tierRankRadius 长度`).toHaveLength(anchor.tierRankRadius.length);
      // 消费端截断——>1 为无效值禁出现
      expect(p.canopyDensity, `slot-${slot} canopyDensity 应 ≤ 1`).toBeLessThanOrEqual(1);
    }
  });

  it('叶身份与挂点语言类字段全组逐位同 slot-0（叶与器官身份 + 散生语言不随槽变）', () => {
    const anchor = BUNGEANA_SHAPE_PROFILES[0]!;
    for (let slot = 1; slot < 8; slot++) {
      const p = BUNGEANA_SHAPE_PROFILES[slot]!;
      // 束卡身份（元素数 / 尺寸域 / 散生单针零占位域 / 轮廓比域）
      expect(p.rosetteNeedles, `slot-${slot} rosetteNeedles`).toBe(anchor.rosetteNeedles);
      expect(p.rosetteCardMin, `slot-${slot} rosetteCardMin`).toBe(anchor.rosetteCardMin);
      expect(p.rosetteCardSpan, `slot-${slot} rosetteCardSpan`).toBe(anchor.rosetteCardSpan);
      expect(p.needleCardLenMin, `slot-${slot} needleCardLenMin`).toBe(anchor.needleCardLenMin);
      expect(p.needleCardLenSpan, `slot-${slot} needleCardLenSpan`).toBe(anchor.needleCardLenSpan);
      expect(p.needleCardAspectMin, `slot-${slot} needleCardAspectMin`).toBe(anchor.needleCardAspectMin);
      expect(p.needleCardAspectSpan, `slot-${slot} needleCardAspectSpan`).toBe(anchor.needleCardAspectSpan);
      // 球果账目组（账位·存活·尺寸·双态比·三色）
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
  const p = (slot: number) => BUNGEANA_SHAPE_PROFILES[slot]!;

  it('树高轴：幼宽塔 < 标准开张卵圆 < 老树伞形；8 槽全域 ⊂ [8, 15]（判定 10 主轴——Spec 生产锚 9–15 慢生收窄）', () => {
    for (let slot = 0; slot < 8; slot++) {
      expect(p(slot).totalHeight, `slot-${slot} ${SLOT_NAMES[slot]} totalHeight`).toBeGreaterThanOrEqual(8);
      expect(p(slot).totalHeight).toBeLessThanOrEqual(15);
    }
    expect(p(1).totalHeight, '幼宽塔应低于标准').toBeLessThan(p(0).totalHeight);
    expect(p(0).totalHeight, '标准应低于老树伞形').toBeLessThan(p(2).totalHeight);
    expect(Math.max(...BUNGEANA_SHAPE_PROFILES.map((x) => x.totalHeight)) -
      Math.min(...BUNGEANA_SHAPE_PROFILES.map((x) => x.totalHeight)), '树高轴展开幅度 ≥ 5m').toBeGreaterThanOrEqual(5);
  });

  it('冠形谱系轴（判定 2 第 4 冠轮廓包络型）：宽塔 slot-1 ⊂ [0.55, 0.65] ↔ 开张卵圆 slot-0 ∈ [0.80, 0.90]（Spec 中龄 0.7–1.0）↔ 伞形平顶 slot-2 > 1.2（Spec 老树端）', () => {
    expect(p(1).crownWidthRatio, '幼宽塔冠幅比下限（宽塔带）').toBeGreaterThanOrEqual(0.55);
    expect(p(1).crownWidthRatio).toBeLessThanOrEqual(0.65);
    expect(p(0).crownWidthRatio, 'slot-0 开张卵圆（判定 10 锚带 0.8–0.9）').toBeGreaterThanOrEqual(0.8);
    expect(p(0).crownWidthRatio).toBeLessThanOrEqual(0.9);
    expect(p(2).crownWidthRatio, '老树伞形端应 > 1.2（Spec 老树伞形端）').toBeGreaterThan(1.2);
    expect(p(1).crownWidthRatio, '幼宽塔应窄于标准').toBeLessThan(p(0).crownWidthRatio);
    expect(p(4).crownWidthRatio, '紧凑个体应 ⊂ 中龄带 0.7–1.0').toBeGreaterThanOrEqual(0.7);
    expect(p(4).crownWidthRatio).toBeLessThanOrEqual(1.0);
  });

  it('裸干轴：全槽 ⊂ [0.25, 0.40]（Spec 0.25–0.4 Verified 双问）；净干抬升-低位分叉展开 ≥ 0.09', () => {
    for (let slot = 0; slot < 8; slot++) {
      expect(p(slot).trunkHeightRatio, `slot-${slot} trunkHeightRatio`).toBeGreaterThanOrEqual(0.25);
      expect(p(slot).trunkHeightRatio).toBeLessThanOrEqual(0.4);
    }
    expect(Math.max(p(2).trunkHeightRatio) - Math.min(p(7).trunkHeightRatio), '老树净干抬升 vs 多干低位分叉差').toBeGreaterThanOrEqual(0.09);
  });

  it('干基膨大轴：全槽 ⊂ [1.0, 1.3]（Spec ≤×1.3 弱膨常态 Inferred——水杉强端字段的低值端消费）；年龄轴单调升（幼 1.06 < 标 1.15 < 老 1.24）', () => {
    for (let slot = 0; slot < 8; slot++) {
      expect(p(slot).trunkFlareRatio, `slot-${slot} trunkFlareRatio`).toBeGreaterThanOrEqual(1.0);
      expect(p(slot).trunkFlareRatio).toBeLessThanOrEqual(1.3);
    }
    expect(p(1).trunkFlareRatio, '幼树弱膨最弱').toBeLessThan(p(0).trunkFlareRatio);
    expect(p(0).trunkFlareRatio, '标准弱膨应弱于老树').toBeLessThan(p(2).trunkFlareRatio);
  });

  it('年龄轴（幼→中→老，冠形谱系端承载）：层角 base/top 单调升、垂帘乘子单调升、顶梢段占比单调降', () => {
    expect(p(1).tierAngleBase, '幼宽塔下枝角应小于标准（幼态斜上端）').toBeLessThan(p(0).tierAngleBase);
    expect(p(0).tierAngleBase, '标准下枝角应小于老树伞形（下枝近水平端）').toBeLessThan(p(2).tierAngleBase);
    expect(p(1).tierAngleTop, '幼宽塔上枝角应小于标准').toBeLessThan(p(0).tierAngleTop);
    expect(p(0).tierAngleTop, '标准上枝角应小于老树伞形平顶（顶平截开张端）').toBeLessThan(p(2).tierAngleTop);
    expect(p(1).fringeLengthRatio, '幼态垂帘应最短（刚直端）').toBeLessThan(p(0).fringeLengthRatio);
    expect(p(0).fringeLengthRatio, '老树伞缘垂帘应最长').toBeLessThan(p(2).fringeLengthRatio);
    expect(p(2).fringeLengthRatio - p(1).fringeLengthRatio, '垂帘年龄轴展开 ≥ 0.06').toBeGreaterThanOrEqual(0.06);
    expect(p(1).leaderLengthRatio, '幼态顶梢段占比应最大（宽塔顶梢主导强）').toBeGreaterThan(p(0).leaderLengthRatio);
    expect(p(0).leaderLengthRatio, '中龄顶梢段占比应大于老树伞形平顶').toBeGreaterThan(p(2).leaderLengthRatio);
  });

  it('偏冠（散生对的破缺）：rank 首末比 ≥ 1.5 且 ≥ 标准 ×1.4；asymmetry 升', () => {
    const lopsided = p(5);
    const anchor = p(0);
    const ratio = (a: number[]) => a[0]! / a[a.length - 1]!;
    expect(ratio(lopsided.tierRankLength), '偏冠槽 rank 首末比').toBeGreaterThanOrEqual(1.5);
    expect(ratio(lopsided.tierRankLength), '偏冠槽 rank 首末比应 ≥ 标准 ×1.4').toBeGreaterThanOrEqual(ratio(anchor.tierRankLength) * 1.4);
    expect(lopsided.crownAsymmetry, '偏冠槽 asymmetry 应升').toBeGreaterThan(anchor.crownAsymmetry);
  });

  it('多干近似（slot-7——判定 1 低位粗枝上举路径，模块头评估记档）：双低位 rank 均强化（min 长度乘子 ≥ 1.25、min 起径乘子 ≥ 1.2——非单侧破缺）+ 裸干低位端 ≤ 0.26 + 下枝上举陡端 ≤ 55 且 < 标准', () => {
    const multi = p(7);
    expect(Math.min(...multi.tierRankLength), '多干近似双 rank 长度均强化').toBeGreaterThanOrEqual(1.25);
    expect(Math.min(...multi.tierRankRadius), '多干近似双 rank 起径均强化（粗壮假干）').toBeGreaterThanOrEqual(1.2);
    expect(multi.trunkHeightRatio, '低位分叉端裸干比应 ≤ 0.26').toBeLessThanOrEqual(0.26);
    expect(multi.tierAngleBase, '低位枝上举陡端（分叉外张 40–70° 的上举端）').toBeLessThanOrEqual(55);
    expect(multi.tierAngleBase, '多干近似下枝角应上举于标准开张卵圆').toBeLessThan(p(0).tierAngleBase);
  });

  it('疏密轴：疏冠/满基准 密度比 ≤ 0.86（疏散冠疏端 0.80 ↔ 满基准 1.0）', () => {
    expect(p(6).canopyDensity / p(0).canopyDensity, '疏冠/满基准 密度比').toBeLessThanOrEqual(0.86);
  });

  it('8 槽向量不全等（槽身份可辨——差量展开不退化为复制）', () => {
    const serialized = new Set(BUNGEANA_SHAPE_PROFILES.map((x) => JSON.stringify(x)));
    expect(serialized.size, '8 槽应至少有两个不同向量').toBeGreaterThan(1);
  });
});

describe('slot-0 锚点域（Step 1 判定 10 + Spec 尺度锚）', () => {
  const anchor = BUNGEANA_SHAPE_PROFILES[0]!;

  it('开阔中龄开张卵圆锚：树高 ∈ [11, 12]（~11–12 m 锚——风动树高锚同源断言）/ 冠幅 ∈ [0.80, 0.90] / 裸干 ∈ [0.28, 0.32] / 弱膨 ∈ [1.1, 1.2] / tierCount ∈ [9, 12]', () => {
    expect(anchor.totalHeight, 'slot-0 生产锚 ~11.5m（Inferred 9–15 中位偏上——慢生；材质风动锚同源直读本字段）').toBeGreaterThanOrEqual(11);
    expect(anchor.totalHeight).toBeLessThanOrEqual(12);
    expect(anchor.crownWidthRatio, 'slot-0 冠幅比锚 ≈0.85（判定 10 锚带 0.8–0.9 + Spec 中龄 0.7–1.0）').toBeGreaterThanOrEqual(0.8);
    expect(anchor.crownWidthRatio).toBeLessThanOrEqual(0.9);
    expect(anchor.trunkHeightRatio, 'slot-0 裸干锚 ≈0.30（Spec 0.25–0.4 中值）').toBeGreaterThanOrEqual(0.28);
    expect(anchor.trunkHeightRatio).toBeLessThanOrEqual(0.32);
    expect(anchor.trunkFlareRatio, 'slot-0 干基弱膨锚 ≈1.15（Spec ≤1.3）').toBeGreaterThanOrEqual(1.1);
    expect(anchor.trunkFlareRatio).toBeLessThanOrEqual(1.2);
    expect(anchor.tierCount, 'slot-0 主层数 9–12（密层退化带 Inferred-待探针）').toBeGreaterThanOrEqual(9);
    expect(anchor.tierCount).toBeLessThanOrEqual(12);
  });

  it('枝角梯度方向：全槽 base > top（下部平展上部上举）且落裁定带 base ∈ [40, 80]、top ∈ [20, 60]（自垂直角——Spec 斜展 Verified + s08 分叉外张 40–70° Observed 裁定带）', () => {
    for (let slot = 0; slot < 8; slot++) {
      const s = BUNGEANA_SHAPE_PROFILES[slot]!;
      expect(s.tierAngleBase, `slot-${slot} tierAngleBase`).toBeGreaterThan(s.tierAngleTop);
      expect(s.tierAngleBase).toBeGreaterThanOrEqual(40);
      expect(s.tierAngleBase).toBeLessThanOrEqual(80);
      expect(s.tierAngleTop).toBeGreaterThanOrEqual(20);
      expect(s.tierAngleTop).toBeLessThanOrEqual(60);
    }
  });
});

describe('白皮松新语义（判定路径首证——散生直承/束卡第 4 叶语言/冠谱系新端型/双态果账/第 17 白斑驳皮的参数语义）', () => {
  const anchor = BUNGEANA_SHAPE_PROFILES[0]!;

  it('散生退化消费（判定 1 直承 012.3——零契约新增的锁）：tierSpacingJitter 全槽 ≥ 0.40（大抖动破层）+ tierGapBand 全槽 === 0（无层隙连续冠）+ 挂点语言双省略（rng 方位散布）', () => {
    for (const s of BUNGEANA_SHAPE_PROFILES) {
      expect(s.tierSpacingJitter, '层位垂直抖动应大抖动破层端（散生退化）').toBeGreaterThanOrEqual(0.4);
      expect(s.tierGapBand, '层隙带应零端消费（散生连续冠）').toBe(0);
      expect(s.tierPhaseStagger, '层间方位交错应省略（散生 rng）').toBeUndefined();
      expect(s.clusterAzimuthStep, '簇挂点方位步进应省略（散生 rng——束螺旋为卡内 SDF 微观律）').toBeUndefined();
    }
  });

  it('冠形谱系（判定 2——第 4 冠轮廓包络型）：宽塔急收 slot-1 taper ≤ 0.5 + 指数 ⊂ [1.1, 1.5] ↔ 开张卵圆 slot-0 指数 ≥ 1.5（中下部最宽）↔ 伞形平顶 slot-2 taper ≥ 0.8 + 指数 ≤ 1.0 + top 角 ≥ 50（exp<1 新端型首用锁）', () => {
    expect(p1().tierRadiusTaper, '宽塔急收端（金字塔塔形）').toBeLessThanOrEqual(0.5);
    expect(p1().tierProfileExponent).toBeGreaterThanOrEqual(1.1);
    expect(p1().tierProfileExponent).toBeLessThanOrEqual(1.5);
    expect(anchor.tierProfileExponent, '开张卵圆中下部最宽卵形权重').toBeGreaterThanOrEqual(1.5);
    const umbrella = BUNGEANA_SHAPE_PROFILES[2]!;
    expect(umbrella.tierRadiusTaper, '伞形端近等宽外抛（顶层枝长 ≈ 底层）').toBeGreaterThanOrEqual(0.8);
    expect(umbrella.tierProfileExponent, '伞形端指数 < 1（顶阔新端型——族内首用，Unknown ⑥留档）').toBeLessThanOrEqual(1.0);
    expect(umbrella.tierAngleTop, '伞形平顶上枝开张 ≥ 50（顶平截读向）').toBeGreaterThanOrEqual(50);
    expect(anchor.tierRadiusTaper, '开张卵圆收顶比应 < 伞形端（中宽 ↔ 顶阔）').toBeLessThan(umbrella.tierRadiusTaper);
  });

  it('束生单律（判定 3/12——第 4 挂点律的负证据锁）：longShootCards L5/L4 === 0 + needleCardLen 域 === 0（散生单针通路零占位——从圆柏消费回落水杉式零占位，第四数据点）', () => {
    for (const s of BUNGEANA_SHAPE_PROFILES) {
      expect(s.longShootCardsL5, 'L5 散生单针卡应零占位（束生短枝单律）').toBe(0);
      expect(s.longShootCardsL4, 'L4 散生单针卡应零占位').toBe(0);
      expect(s.needleCardLenMin, '散生单针卡长域下限应零占位').toBe(0);
      expect(s.needleCardLenSpan, '散生单针卡长域跨度应零占位').toBe(0);
    }
  });

  it('束卡尺度带（第 4 叶语言主卡——禁亚像素初值）：主卡尺度域 ⊂ [0.20, 0.32]（族内最新终值带 0.24–0.32 直采起步——判定 3 明文带）；轮廓比 ∈ [1.4, 2.8]（蓬松放射刷——下限 < 圆柏绳卡 2.0 的语言区分）；元素数 ∈ [8, 20]（真束 5–16 算术域）', () => {
    expect(anchor.rosetteCardMin, '束卡长域下限（终值带起步）').toBeGreaterThanOrEqual(0.2);
    expect(anchor.rosetteCardMin + anchor.rosetteCardSpan, '束卡长域上限（终值带上限 0.32）').toBeLessThanOrEqual(0.32);
    expect(anchor.needleCardAspectMin, '束卡轮廓比下限（蓬松放射刷——宽于绳卡）').toBeGreaterThanOrEqual(1.4);
    expect(anchor.needleCardAspectMin + anchor.needleCardAspectSpan, '束卡轮廓比上限').toBeLessThanOrEqual(2.8);
    expect(anchor.rosetteNeedles, '束卡 SDF 束元素数落真域算术抽象').toBeGreaterThanOrEqual(8);
    expect(anchor.rosetteNeedles).toBeLessThanOrEqual(20);
  });

  it('疏散冠密度带（判定 4 caveat 落位）：canopyDensity 全槽 ∈ [0.80, 1.0]（半透光疏散身份参数面下限——疏散由簇卡形态/透射承载，低于 0.80 即非本资产密度语言）', () => {
    for (const s of BUNGEANA_SHAPE_PROFILES) {
      expect(s.canopyDensity, '疏散冠身份下限').toBeGreaterThanOrEqual(0.8);
      expect(s.canopyDensity).toBeLessThanOrEqual(1);
    }
  });

  it('细长直伸-端部微垂（针硬挺 Verified）：levels droop 逐级单调不降；全槽末级 ∈ (0, 0.10] 低幅端（vs 水杉轻垂 / 雪松垂帘）', () => {
    for (const s of BUNGEANA_SHAPE_PROFILES) {
      for (let i = 1; i < s.levels.length; i++) {
        expect(s.levels[i]!.droop, `levels[${i}].droop 应 ≥ 前级`).toBeGreaterThanOrEqual(s.levels[i - 1]!.droop);
      }
      const last = s.levels[s.levels.length - 1]!.droop;
      expect(last, '末级 droop 应 > 0（方向恒在）').toBeGreaterThan(0);
      expect(last, '末级 droop 应 ≤ 0.10（硬挺直伸档）').toBeLessThanOrEqual(0.1);
    }
  });

  it('顶梢不消费：leaderDroop 与 windLeader* 全槽 === 0（族内可选·雪松消费位的显式零占位锁——直立刚硬无点头，不消费第三例）', () => {
    for (const s of BUNGEANA_SHAPE_PROFILES) {
      expect(s.leaderDroop, 'leader 直立无点头').toBe(0);
      expect(s.wind.windLeaderAmplitude, '顶梢风动成分不消费').toBe(0);
      expect(s.wind.windLeaderFrequency).toBe(0);
    }
  });

  it('双态两年熟低量果账目（判定 6——近景点彩级）：尺寸 ⊂ [0.008, 0.05]（幼果 1–1.5cm Verified + 近熟半熟外推）+ 候选 === 1（Spec 单生 Verified）+ keep ∈ (0.1, 0.35]（低量点彩档——vs 水杉 0.30 / 圆柏 0.55）+ classRatio ∈ (0.1, 0.5)（**幼果主导反向档**——vs 圆柏熟果主导 0.75）+ 双色 distinct', () => {
    expect(anchor.coneSizeMin).toBeGreaterThanOrEqual(0.008);
    expect(anchor.coneSizeMin + anchor.coneSizeSpan).toBeLessThanOrEqual(0.05);
    expect(anchor.coneCandidates, '单生律（FRPS「通常单生」）').toBe(1);
    expect(anchor.coneKeepRatio, '低量点彩档（幼果中距亚像素）').toBeGreaterThan(0.1);
    expect(anchor.coneKeepRatio).toBeLessThanOrEqual(0.35);
    expect(anchor.coneClassRatio, '幼果主导（一年生绿幼果为主 + 少量近熟）').toBeGreaterThan(0.1);
    expect(anchor.coneClassRatio).toBeLessThan(0.5);
    expect(anchor.coneColorMature, '双态双色应 distinct（近熟淡绿-黄褐 vs 绿幼果）').not.toBe(anchor.coneColorYoung);
  });

  it('雄球花不消费 + 无两面色差：strobili === undefined（物候窗特异——判定 7 明文）+ needleFaceContrast === undefined（无差轴第 4 数据点——雪松/圆柏/白皮松）', () => {
    for (const s of BUNGEANA_SHAPE_PROFILES) {
      expect(s.strobili, '雄球花第二器官组应省略整组').toBeUndefined();
      expect(s.needleMaterial.needleFaceContrast, '两面色差位应省略（无两面差语义）').toBeUndefined();
    }
  });

  it('树皮第 17 语言（白基调多色斑驳薄片剥落）：单元域 ⊂ [0.05, 0.30] + 沟深 ≤ 0.30（**近光滑弱浮雕——族内最低档** vs 雪松 0.45/圆柏 0.55/水杉 0.68）+ 三色亮度单调 plate > base > groove（白基调）+ plate 近白低饱和（通道 ≥ 180 且极差 ≤ 25）+ base/groove R≥G≥B 灰褐-近黑（非褐色系语言区分锁）', () => {
    expect(anchor.bark.barkPlateMin).toBeGreaterThanOrEqual(0.05);
    expect(anchor.bark.barkPlateMin + anchor.bark.barkPlateSpan).toBeLessThanOrEqual(0.3);
    expect(anchor.bark.barkGrooveDepth, '近光滑弱浮雕端（斑块色差为主浮雕——s07/s08 Verified）').toBeLessThanOrEqual(0.3);
    const lum = (c: number) => (((c >> 16) & 0xff) + ((c >> 8) & 0xff) + (c & 0xff)) / 3;
    const plate = lum(anchor.bark.barkPlateColor);
    const base = lum(anchor.bark.barkBaseColor);
    const groove = lum(anchor.bark.barkGrooveColor);
    expect(plate, '乳白斑块亮度 > 灰褐基面（白基调主导 40–65%）').toBeGreaterThan(base);
    expect(base, '灰褐基面亮度 > 近黑沟端').toBeGreaterThan(groove);
    expect(plate, '白基调锁：乳白端亮度 ≥ 沟端 × 2.5（远景白干第一识别特征）').toBeGreaterThanOrEqual(groove * 2.5);
    for (const [name, color] of [['plate', anchor.bark.barkPlateColor], ['base', anchor.bark.barkBaseColor], ['groove', anchor.bark.barkGrooveColor]] as const) {
      const r = (color >> 16) & 0xff;
      const g = (color >> 8) & 0xff;
      const b = color & 0xff;
      if (name === 'plate') {
        expect(r, `plate 白基调通道下限（近白）`).toBeGreaterThanOrEqual(180);
        expect(Math.max(r, g, b) - Math.min(r, g, b), 'plate 低饱和（乳白灰白——非彩色）').toBeLessThanOrEqual(25);
      } else {
        expect(r, `${name} R≥G（灰褐/近黑读向）`).toBeGreaterThanOrEqual(g);
        expect(g, `${name} G≥B`).toBeGreaterThanOrEqual(b);
      }
    }
  });

  it('风动两成分（判定 9——硬针小惯量读向）：tier/fringe 全部 > 0；整冠摆幅度 > 末级束颤（束颤小幅）；束颤频率 > 慢摆频率（高频小幅）；leader 成分 === 0', () => {
    const w = anchor.wind;
    for (const value of [w.windTierAmplitude, w.windTierFrequency, w.windFringeAmplitude, w.windFringeFrequency]) {
      expect(value).toBeGreaterThan(0);
    }
    expect(w.windTierAmplitude, '整冠摆幅度应大于末级束颤（小幅读向）').toBeGreaterThan(w.windFringeAmplitude);
    expect(w.windFringeFrequency, '束颤频率应高于整冠慢摆（硬针束惯量小）').toBeGreaterThan(w.windTierFrequency);
  });
});

describe('参数面自检断言（模块头算术摘要 vs 数据行一致性 + 拓扑展开，拦截笔误类缺陷——012.1 childPlan 笔误实证先例）', () => {
  const anchor = BUNGEANA_SHAPE_PROFILES[0]!;

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

  it('皮面基数：trunk 364 + L1 1960 + L2 2400 + L3 3200 + L4 3840 + L5 5120 = 16884（模块头「皮恒 16884」——trunk 14×13 与 11.5 m 级匹配）', () => {
    const counts = [20, 40, 80, 160, 320];
    const trunkFaces = anchor.trunk.radial * anchor.trunk.segs * 2;
    expect(trunkFaces, '主干皮面（14×13×2）').toBe(364);
    let sum = trunkFaces;
    anchor.levels.forEach((level, i) => {
      sum += counts[i]! * level.radial * level.segs * 2;
    });
    expect(sum, '皮面基数（跨槽恒等的结构性数值——模块头摘要一致）').toBe(16884);
  });

  it('卡账标称位：束卡 L5 320×12 + L4 160×8 = 5120（族终值带起步档）；散生单针卡 0（束生单律——卡账单轨）；交叉双卡 4 tri 标称卡面 20480（模块头摘要）', () => {
    const fascicle = anchor.clustersL5 * 320 + anchor.clustersL4 * 160;
    expect(fascicle, '束卡标称挂点位').toBe(5120);
    const awl = anchor.longShootCardsL5 * 320 + anchor.longShootCardsL4 * 160;
    expect(awl, '散生单针卡标称位（束生单律零占位）').toBe(0);
    expect((fascicle + awl) * 4, '交叉双卡 4 tri 标称卡面').toBe(20480);
  });

  it('定稿态消费键位锁：顶层 53（47 必选扁平 + 6 嵌套组）；needleMaterial 4；可选 3 位全部缺席（省略即散生 rng 语言 + 雄球花不做——消费差异记档归族门）+ 族内可选消费位在位', () => {
    const keys = Object.keys(BUNGEANA_SLOT0_PROFILE);
    expect(keys, '顶层键位（47 扁平 + needleMaterial/bark/wind/trunk/levels/childPlan）').toHaveLength(53);
    for (const optional of ['tierPhaseStagger', 'clusterAzimuthStep', 'strobili'] as const) {
      expect(keys, `不应提供可选位 ${optional}（省略即语义）`).not.toContain(optional);
    }
    expect(Object.keys(BUNGEANA_SLOT0_PROFILE.needleMaterial), 'needleMaterial 键位').toHaveLength(4);
    expect(
      Object.keys(BUNGEANA_SLOT0_PROFILE.needleMaterial),
      '不应提供可选位 needleFaceContrast（无两面差省略）',
    ).not.toContain('needleFaceContrast');
    // 族内可选消费位在位（必选字段显式消费：双态果账 + 微白粉 + 散生单针零占位锁）
    for (const consumed of ['needleCardLenMin', 'longShootCardsL5', 'coneClassRatio', 'coneColorYoung', 'coneAxisColor'] as const) {
      expect(keys, `双态果账/零占位消费位 ${consumed} 应在位（必选字段显式消费）`).toContain(consumed);
    }
    expect(Object.keys(BUNGEANA_SLOT0_PROFILE.needleMaterial), '微白粉族内可选位应在位（本例消费——第三消费者）').toContain('needleGlaucousBloom');
  });
});

/** 冠形谱系断言的 slot-1 快捷引用（幼态宽塔槽） */
function p1() {
  return BUNGEANA_SHAPE_PROFILES[1]!;
}
