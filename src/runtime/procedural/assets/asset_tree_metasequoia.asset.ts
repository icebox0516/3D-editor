/**
 * runtime/procedural/assets/asset_tree_metasequoia.asset —— 程序化植物资产：水杉
 * （Metasequoia glyptostroboides Hu & W. C. Cheng，柏科水杉属落叶乔木，单种属，
 * T012.2 针叶家族 conifer **第二实例——契约转正例**：对生轮生层位挂点 + 羽状小枝
 * 卡 + 密连续锥冠 + 球果下垂/雄序枯穗双器官账目 + 干基膨大五重改写首证——方法
 * 复制自雪松先例，挂点语言从零改写）。公园孤立中龄个体 ≈20m（Spec §3 尺度锚
 * 18–25m 带中值——高于阔叶 8–12m 族锚、高于雪松 16.5m 锚，混植最高量级层）。
 *
 * 职责：D19 契约链上的 slot-0 锚点形态资产——build(params?) 以 mulberry32(params.seed)
 * 驱动全部分枝/簇位随机量（**rng 消费顺序即契约**：同 seed 逐位同结果；**双器官
 * 账目零 rng**——posHash 确定性布点），几何生成全部在 ./tree/metasequoia/
 * metasequoiaGeometry（对生成对层位挂点 + 层间交错 90° + 层角梯度 + 密连续锥零端
 * 层隙 + droop 轻垂链 + 顶梢通直羽簇 + 末两级羽簇对生叶序挂点 + 交叉双卡 + 球果
 * 长柄下垂账目 + 雄序枯穗账目 + LOD 三档同流派生——机制映射与结构计数见该文件
 * 模块头）。形态参数类型 = 针叶家族契约 ./tree/conifer/coniferShapeProfile
 * （**定稿**——本任务转正；水杉 = 第二实例/转正例）；数值与槽组合见
 * ./tree/metasequoia/metasequoiaShapeProfile（全部数值依据
 * docs/research/metasequoia-reference.md Spec 1.0 含终审记档）；build 内做
 * morphSeed → slot → profile 路由（profileForSeed O(8) 纯查表，非槽种子回落
 * slot-0——公共签名不变，不扩 ProceduralBuild）。params.seed 缺省回落 slot-0
 * 锚点 morphSeed（morphSeedOf('asset_tree_metasequoia', 0)——与
 * ProceduralSourceCache 传入值逐位一致）。原点 = 底部中心 minY 精确 0。
 *
 * 材质分层表（materialIndex → 部件 → 材质；配方在 ./tree/metasequoia/
 * metasequoiaMaterials——park-shader-agent 并行交付，**导出签名冻结**〔沿
 * ginkgo 双卡先例——叶工厂带 preset 尾参〕：createMetasequoiaNeedleMaterial /
 * createMetasequoiaBarkMaterial / createMetasequoiaNeedleDepthMaterial，needle =
 * (level?: ProceduralLevel, preset?: string) => 材质、bark/depth =
 * (level?: ProceduralLevel) => 材质）：
 * 0 树皮（主干+五级枝+底盖+**球果卡+枯穗卡**）—— createMetasequoiaBarkMaterial(level)：
 *   纵长条片-纤维剥落第 15 树皮语言（红褐/桂皮棕基调 + 脊:沟 2–3:1 深索 + 长纤维
 *   条翘边——Spec §5.4 Verified+Observed，vs 雪松鳞状方块片第 14 语言——同科两
 *   语言轴）；**按 uv v 域分流器官配方**（球果 v∈[1,2) 未熟绿果中心放射 SDF /
 * 枯穗 v∈[2,3) 沿穗轴枯褐——**三级帧域判别阈值 1.0/2.0**，材质侧冻结接口）；
 *   深度材质皮组 aLeafRand=0 实心守卫覆盖器官影
 * 1 羽状小枝卡（L4/L5 + 顶梢羽簇 + Low 壳卡）—— createMetasequoiaNeedleMaterial(
 *   level, preset)：羽卡 SDF（二列条形叶 22/14/8 元素 High/Mid/Low——SDF 内部归
 *   3b）+ 两面温和色差（needleFaceContrast 0.22——上深下浅，vs 雪松无两面差）+
 *   aLeafRand 逐卡变奏 + 风动**两成分**（aSeed 整冠低频小幅 + aBend 末级高频细颤
 *   〔主成分〕——树高锚 = profile.totalHeight 同源 20 级；顶梢成分不消费
 *   〔windLeader* 零占位〕）
 * 注：层间 mergeGeometries useGroups=true → 恰 2 组（皮 0 / 羽卡 1，D15 免组膨胀）；
 * **球果卡 + 枯穗卡入皮组（组 0）**——metasequoiaGeometry 模块头记档的冻结接口
 * （uv v 域身份标记 + aLeafRand/aBend 随组恒 0——器官刚性，摆动语义归材质层/缺口
 * 候选）；叶影裁切深度材质走 InstanceSource 契约通道 customDepthMaterial
 * （T009.5 立契）：build 返回 createMetasequoiaNeedleDepthMaterial(level)（档位
 * 匹配，分档语义在工厂内）。
 *
 * 色卡（D44）：**default + autumn 双卡终态**（012.2 待裁决位 4 + Spec §5.2 四源
 * 正面证据——落叶季相卡；跨树同名 id 域）：default = 主语境 9 月末**亮黄绿**（s04
 * Pisa 2024-09-30 Observed 实证 + FoC "yellowish green" Verified；swatch #8ab65a
 * = profile needleColorSun 同值——亮黄绿端中心）；autumn = **锈橙-红褐**（FoC
 * "turning orange or red" / MoBot "red-bronze" / NC "brownish copper" / Wiki
 * "foxy reddish brown" 四源措辞中值偏红褐 + s10 10-26 Observed 锈橙/琥珀约半
 * 〔Spec §5.2 判定②〕；swatch #a55d2c = 锈橙 0xc07632 × 红褐 0x8b4526 中值——
 * hue ≈22° 锈橙红褐、暗于 zelkova 橙铜 #c4804a / triadica 绯红 #c65e3e 的秋末
 * 深调读向）。**三处同源纪律（T024）**：meta presets swatch ↔ metasequoiaMaterials
 * 构造色中心 ↔ CROWN_PRESETS 行（default/autumn 两行——broadleafCanopyMaterials
 * 已先行回填；材质构造色中心色由 3b 对齐本 swatch——冻结接口）。
 *
 * LOD（T012.2 Step 3a 三档交付，家族方法复制）：build 透传 params.level（缺省
 * 'high'——旧无参路径逐位不变）到几何与皮/羽材质工厂；三档同 rng 流同骨架/簇位/
 * 器官决策（档间不变量、Mid 站点掩码保交叉双卡与发射计划见 metasequoiaGeometry
 * 模块头），材质档位变体与 customProgramCacheKey 档位唯一在 metasequoiaMaterials；
 * levels 声明三档（D27 首版最小化 [{id}]——调度阈值归 Runtime 常量不进 Profile）。
 *
 * LOD 预算锁定账目（预算制 D19.8；conifer 行已锁——T012.1，本资产非候选带流程：
 * 实测落带记档 = **Step 4 密度校准终测 2026-09-29 规范种子**，8 槽 × 3 档探针
 * 〔校准 = 羽卡 0.055–0.10 → 0.18–0.30 + 簇位 6/4 → 12/8 + 簇抑制 0.08 → 0.02 +
 * Mid/Low 抽稀档位同步 %3 / stride 5——终诊羽卡密度/尺度不足，初版带 23808–27356
 * 被 Step 4 取代〕）：**High ≤ 40000 / Mid 6000–10000 / Low 1500–3000 /
 * Canopy ≤ 500**。实测带：**High 27088–35156**（皮恒 17136〔主干 518 + L1 2058
 * 〔21 管〕+ L2 2400 + L3 3200 + L4 3840 + L5 5120〕+ 羽卡 4686–8752 张 ×2 +
 * 球果 ×4 + 枯穗 ×4；slot-6 疏松最低 / slot-7 密端与 slot-2 宽冠密簇并列最高
 * ——上限用满 68–88%，slot-0 32172 = 80.4% 沿雪松校准先例带）；**Mid 7090–9654**
 * （皮恒 2874 + 存活簇位/3 × 交叉双卡 + 双器官全量〔身份信号〕——卡数比 0.345–
 * 0.388）；**Low 2076–2838**（皮恒 786 + 壳卡 = ⌈保留簇/5⌉ × 2、双器官省略
 * 〔远距亚像素记档〕）；rng 消费 slot-0 三档恒等 50463（快照锁——双器官零 rng，
 * 消费全在骨架/簇/卡/通透 roll）；minY 三档恒 0；slot-0 High 总面 **32172** =
 * 皮 17136 + 羽卡 7260×2 + 球果 39×4 + 枯穗 90×4（meta triangleCount 实数）；
 * 层间距涌现 1.17m（密层——vs 雪松 1.74）；树高涌现 = profile 树高 ×0.98–1.01
 * （slot-0 实测 20.00 vs 锚 20——顶梢通直无点头段回落）。
 *
 * 边界：每次调用 new 全部 geometry/material/深度材质（所有权随调用移交调用方，缓存
 * 会 dispose，禁止模块级共享对象，D17）；不建模记档（Spec 有事实、本资产几何不
 * 表达）：冬态裸枝骨架相（脱落性小枝冬季整枝脱落——非主语境季相卡，presets 双卡
 * = default 秋绿 + autumn 锈橙红褐）、雄球花活体花期相（2–3 月散粉——非 9–10 月
 * 主语境；主语境消费上年枯穗）、熟果深褐相/宿存中轴（当年 10–11 月熟整果脱落——
 * 主语境绿果单 cohort；宿存中轴类不消费）、密植林分冠幅展至 0.5 端（生产锚 =
 * 公园孤立木窄段，Step 2 记档）、小枝二型宿存/脱落分化（羽卡统一脱落单元抽象）
 * ——详见 metasequoiaShapeProfile 模块头 Unknown/不消费记档。
 */
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { buildMetasequoiaGeometry } from '../tree/metasequoia/metasequoiaGeometry';
import { METASEQUOIA_SHAPE_PROFILES } from '../tree/metasequoia/metasequoiaShapeProfile';
import {
  createMetasequoiaBarkMaterial,
  createMetasequoiaNeedleDepthMaterial,
  createMetasequoiaNeedleMaterial,
} from '../tree/metasequoia/metasequoiaMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_tree_metasequoia',
  name: '水杉',
  category: 'plant',
  tags: ['植物', '树', '水杉', 'conifer', '落叶', 'Metasequoia glyptostroboides'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 8 }, // D19：8 形态槽（T012.2 八槽形态向量——树高 15–25 × 冠幅 0.20–0.32 × 干高 0.35–0.50 × 膨大 1.3–2.0 × 年龄轴 × 疏密轴；层数 8–12 轴结构计数恒等不进槽，记缺口候选归 T012 族门——沿雪松同位先例）
  variants: { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 }, // 参照雪松/阔叶量级（D13 无新增依赖）
  triangleCount: 32172, // 实数 = slot-0 锚点 High 档（Step 4 密度校准后：皮 17136 恒定 + 羽卡 7260×2 + 球果 39×4 + 枯穗 90×4；多档起声明面取细模档；见模块头预算锁定账目）
  levels: [{ id: 'high' }, { id: 'mid' }, { id: 'low' }], // LOD 三档（D27 首版最小化 [{id}]——阈值归 Runtime 常量，不进 Profile）
  // Runtime 表示能力声明（D41 §三.2）：乔木 canopy 链 High → Mid → Canopy → Culled
  //（出生即声明 canopy——012.2 待裁决位 3；conifer canopy 经 BroadleafCanopyProxy
  // 统一实现派生、冠色进 CROWN_PRESETS 同源——**物种表/proxy 接入表 conifer 行随
  // metasequoiaMaterials 合并阶段落地回填**〔沿 cedrus 3c 接线先例；CROWN_PRESETS
  // 水杉两行已先行〕）；low 不进有效链——保留为构建档位
  representations: ['high', 'mid', 'canopy'],
  taxonomy: { category: 'plant', family: 'conifer' }, // 针叶家族契约第二实例/转正例（tree/conifer/ 定稿——柏科水杉属落叶裸子乔木按家族形态域归 conifer，taxonomy 归类表 1→2）
  presets: [
    // 色卡终态（012.2 待裁决位 4 + Spec §5.2 四源证据）：default = 9 月末亮黄绿
    //（s04 Observed 主语境锚 + FoC "yellowish green"——swatch = needleColorSun 同值
    // 亮黄绿端中心）；autumn = 锈橙-红褐（四源措辞中值偏红褐 + s10 Observed——
    // #a55d2c = 锈橙×红褐中值）。三处同源：meta ↔ metasequoiaMaterials 构造色中心
    //（3b 对齐本 swatch——冻结接口）↔ CROWN_PRESETS 两行（已先行回填）
    { id: 'default', label: '默认', swatch: '#8ab65a' },
    { id: 'autumn', label: '秋·锈橙红褐', swatch: '#a55d2c' },
  ],
  proceduralProfile: {
    // 跨 8 槽细模包围盒实测带（**Step 4 密度校准后终测 2026-09-29：h 15.06–25.16 /
    // w 3.14–9.18**〔初版 h 15.07–25.05 / w 2.90–9.40——羽卡 0.18–0.30 上调后外伸
    // 涌现 +5cm 高 / 冠幅收窄于带内〕）。物种锚 slot-0 = 20.02m 高（Spec 生产锚 20
    // ×1.001 涌现——顶梢通直无回落）/ 6.70m 冠幅（crownWidthRatio 0.25 × 大卡外伸
    // 涌现——密尖塔的中距体量；与阔叶 8–12m / 雪松 16.5m 锚同语境混植的最高量级
    // 层）；槽间差异（slot-1 幼树极窄 3.14 宽 / slot-2 老树阔圆锥 9.18 宽——任务
    // 主轴 0.20–0.32 冠幅比两端涌现）如实入带
    heightRange: { min: 15.0, max: 25.4 },
    widthRange: { min: 2.8, max: 9.5 },
  },
};

/**
 * morphSeed → shapeProfile 路由（T012.2 八槽形态向量）：枚举 8 槽 morphSeedOf 逐位
 * 比对还原 slot 索引（O(8) 纯查表，确定性）；非槽种子（如测试直传任意 seed）与未填
 * 槽一并回落 slot-0 标准组合（雪松/阔叶 13 树前后行为兼容同构）。**不扩展
 * ProceduralBuild 公共签名**。
 */
function profileForSeed(seed: number) {
  for (let slot = 0; slot < 8; slot++) {
    if (seed === morphSeedOf(meta.id, slot)) return METASEQUOIA_SHAPE_PROFILES[Math.min(slot, METASEQUOIA_SHAPE_PROFILES.length - 1)]!;
  }
  return METASEQUOIA_SHAPE_PROFILES[0]!;
}

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.seed = morphSeed（SourceCache 传 morphSeedOf(assetId, slot)；缺省 = slot-0 锚点）
  const seed = params?.seed ?? morphSeedOf(meta.id, 0);
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧路径逐位不变；
  // 不参与 shapeSlot/morphSeed/sourceKey 形态身份——档位缓存维度归 ProceduralSourceCache）
  const level = params?.level ?? 'high';
  // params.preset = 色卡 id（D44「冠变干不变」）：仅羽卡材质消费（几何/树皮/深度材质
  // 不随卡——geometry 与 customDepthMaterial 跨卡共享层契约）；缺省 = 默认卡
  const preset = params?.preset;
  const rng = mulberry32(seed);
  const { geometry } = buildMetasequoiaGeometry(rng, profileForSeed(seed), level);
  // 组 0 皮（干+枝+底盖+球果/枯穗卡，uv v 域分流配方）/ 组 1 羽卡——契约序
  // [皮, 羽卡] = mergeGeometries 层序（metasequoiaGeometry 冻结接口）
  const bark = createMetasequoiaBarkMaterial(level);
  const feather = createMetasequoiaNeedleMaterial(level, preset);
  // 影 pass 羽卡裁切走 InstanceSource 契约通道——工厂每次 new（build 契约「每次调用
  // new 全部资源」天然满足），档位随 level 匹配；归源所有（缓存 dispose）
  return {
    geometry,
    material: [bark, feather],
    customDepthMaterial: createMetasequoiaNeedleDepthMaterial(level),
  };
}
