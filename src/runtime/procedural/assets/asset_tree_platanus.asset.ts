/**
 * runtime/procedural/assets/asset_tree_platanus.asset —— 程序化植物资产：悬铃木
 * （Platanus × acerifolia (Ait.) Willd. 二球悬铃木，T011.5 阔叶家族第六实例——方法
 * 复制自银杏 asset_tree_ginkgo（最新方法模板），公园自然冠单干中龄个体：**大叶疏簇
 * 挂点 + 阔卵-圆头冠 + 宿存成对球果**——挂点语言/冠形/果序三重身份与五先例分化
 * 最大的实例；俗名英桐（志书系）/法桐（民间系）不做种下分裂）。
 *
 * 职责：D19 契约链上的 slot-0 锚点形态资产——build(params?) 以 mulberry32(params.seed)
 *      驱动全部分枝/叶簇/果序随机量（**rng 消费顺序即契约**：同 seed 逐位同结果），
 *      几何生成全部在 ./tree/platanus/platanusGeometry（五级递归分枝 + 锥度枝干 +
 *      末级枝疏簇烘焙 + 宿存球状果序 + 冠内通透三规则 + 树皮近景微起伏——家族方法
 *      整体复制；悬铃木算法细节：**大叶疏簇挂点**（互生一节一叶、节间 3–5cm
 *      Verified/Inferred [3][4][9]——黄金角互生螺旋簇内方位 + 大卡 0.30–0.44 ×
 *      长宽比 0.70–0.90 宽>长（六资产最大叶）+ 每簇 5 候选低量合并抽象 + 平展摊开
 *      取向）、**阔卵-圆头冠**（干向挂点分级（低枝 ×1.10 平展 +10…12° / 高枝 ×0.72
 *      收角 −6…−8°）+ 斜上-平展广角 36–54° + 散布互生方位 + 领导中庸 0.50——涌现
 *      w/h 0.683 ∈ 工程域 0.6–0.75）、**宿存成对球果**（Spec 判定做 Verified
 *      [1][3][7][8][9]——L5 簇位 0.22 承载率 × 85% 成对，八面体 8 面/球、径 ≈5–6.4cm
 *      （真径 2.5cm ×2 工程映射）、长梗下垂叶幕下；**账目入叶组**：果序顶点 uv
 *      v∈[4,5] 果序域 + aBend 恒 0 + aLeafRand 随皮组恒 0；
 *      Mid 保留 / Low 省略记档）、干高 0.25–0.35（六实例首个 Inferred 支撑域——涌现
 *      视觉冠底 0.296）、光滑斑块剥落浅起伏树皮（0.014/{3,5,6}/11——vs 夏栎脊沟
 *      0.033/{3,4,5}/0.85、朴树浅斑 0.016/{4,5,6}/16、香樟纵裂 0.036/{3,4,6}/3.2、
 *      榉树光滑剥落 0.015/{3,5,6}/11、银杏浅-中纵裂 0.030/{4,5,6}/2.6 六分化贴榉树
 *      光滑端——**三色带斑块拼贴主体在 platanusMaterials 材质层**）——全部数值依据
 *      docs/research/platanus-reference.md Spec 1.0（含终审记档：form-a/b 照片作废、
 *      树高 ≈12m 主代理裁定保守低端、裂深典型 1/2 深端 2/3 记档、斑块 1/8–1/12 细端
 *      1/20 记档、容许低位双主枝记档不建模），逐字段注释见
 *      ./tree/platanus/platanusShapeProfile。形态参数类型 = 阔叶家族契约
 *      ./tree/broadleaf/broadleafShapeProfile 第六实例；build 内做 morphSeed → slot →
 *      profile 路由（profileForSeed O(8) 纯查表，非槽种子回落 slot-0——公共签名不变，
 *      不扩 ProceduralBuild）。params.seed 缺省回落 slot-0 锚点 morphSeed
 *      （morphSeedOf('asset_tree_platanus', 0)——与 ProceduralSourceCache 传入值逐位
 *      一致：无参路径 = 缓存路径 = 同一棵锚点树）。
 *      尺度参照真实乔木：中龄公园个体锚 ≈12m 高 / ≈8m 冠幅（**主代理裁定保守低端**
 *      ——12–14m 弱 Inferred per 终审记档；悬铃木速生大乔木「中龄个体显著大于先例锚」
 *      Spec §2 原文——与夏栎 ≈8m/朴树 ≈8.5m/香樟 ≈8.6m/榉树 ≈8m/银杏 ≈8.2m 同语境
 *      混植的上层大乔突出量级；8 槽带 11.53–12.79m 高 / 6.52–8.79m 宽——
 *      proceduralProfile 全槽实测带；槽间树高差由各槽领导比回调定档（12m 级领导链
 *      复利外伸 ≈×1.9 的种子实现差异——slot-2/4/7 回调记档见 profile 各槽注释））；
 *      原点 = 底部中心 minY 精确 0。
 * 材质分层表（materialIndex → 部件 → 材质；配方在 ./tree/platanus/platanusMaterials
 *      ——park-shader-agent 并行交付，导出签名冻结（与 zelkova/ginkgoMaterials 同构）：
 *      createPlatanusLeafMaterial / createPlatanusBarkMaterial /
 *      createPlatanusLeafDepthMaterial，均 (level?: ProceduralLevel) => 材质）：
 *      0 树皮（主干+五级枝+底盖）—— createPlatanusBarkMaterial(level)：光滑斑块剥落
 *        三色带拼贴（「树皮光滑，大片块状脱落」FRPS Verified [1] + FOC "smooth,
 *        exfoliating in plates" [4]——新露斑奶油白-浅黄绿/过渡斑灰绿-橄榄/老斑灰褐-
 *        深褐多代并存、斑块 ≈1/8–1/12 干径细端 1/20 记档、大片地图状、六资产唯一
 *        「多色带地图拼贴」语言——vs 榉树暖色小片斑驳三重分化（色温/斑尺度/对比）；
 *        几何侧浅起伏 0.014/{3,5,6}/11 见 profile——斑驳主体在材质层）
 *      1 叶簇卡（L4/L5 末级枝疏簇烘焙）—— createPlatanusLeafMaterial(level)：中绿大
 *        叶粗质基调（正面中绿/背面浅绿、近无毛无白粉 Verified [1][5][7]）+ SDF 掌状
 *        5 裂大叶（阔卵形宽 15–22cm、裂深典型 1/2（深端 2/3 记档）、中央裂片阔三角
 *        宽≈长渐尖、每裂片 0–2 粗齿、截形基、离基掌状 3 脉——Spec §4 Verified
 *        [1][3][4][8][9]，第六种叶形语言）+ aLeafRand 逐叶变奏 + 风动（aSeed 整树
 *        缓摆 + aBend 快颤）
 *      注：层间 mergeGeometries useGroups=true → 恰 2 组（皮 0 / 叶 1，D15 免组膨胀）；
 *      **宿存果序入皮组（组 0）**——platanusMaterials 模块头记档的冻结接口：皮材质
 *        冠上部红褐偏色近似绿褐果球（褐系近似、可接受记档）+ 深度材质 aLeafRand=0
 *        皮组实心守卫覆盖果影（果序顶点 uv v∈[4,5] 果序域身份标记、aLeafRand/aBend
 *        随组恒 0——几何侧账目见 platanusGeometry）；叶影裁切深度材质走
 *        InstanceSource 契约通道 customDepthMaterial（T009.5 立契）：build 返回
 *        createPlatanusLeafDepthMaterial(level)（档位匹配，分档语义在工厂内）。
 * 叶卡顶点属性（几何固有，冻结契约沿用）：aLeafRand（逐叶随机 ∈ [0,1)，同卡 6 顶点
 *      同值；皮组含果序恒 0）、aBend（风动摆幅权重，卡内根→尖非降；皮组含果序恒 0
 *      ——果序刚性悬垂记档）。
 * 边界：每次调用 new 全部 geometry/material/深度材质（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象，D17）；不建模记档（Spec 有事实、本资产不表达）：
 *      掌状裂轮廓/裂深/裂片齿/离基三脉/截形基（归材质 SDF）、叶柄与叶柄下芽、托叶、
 *      小枝二色（嫩枝灰黄绒毛/老枝红褐——归材质层）、秋色黄褐、行道 pollard 抹头相、
 *      容许低位双主枝自然变体（终审 C-5 记档不建模——单干主导口径）、花/春相、品种
 *      窄化、果序宿存花柱刺状（归材质）——详见 platanusShapeProfile 模块头。
 * LOD（T011.5 三档交付，家族方法逐位复制）：build 透传 params.level（缺省 'high'——
 *      旧无参路径逐位不变）到几何与皮/叶材质工厂；三档同 rng 流同骨架/簇位/果序决策
 *      （档间不变量、Mid ⊂ High 掩码口径与发射计划见 platanusGeometry 模块头），
 *      材质档位变体与 customProgramCacheKey 档位唯一在 platanusMaterials；levels
 *      声明三档（D27 首版最小化 [{id}]——调度阈值归 Runtime 常量不进 Profile）。
 * LOD 预算锁定账目（预算制 D19.8——platanusGeometry 模块头引用此处）：锁定预算
 *      （三角形，皮 + 叶卡 + 果序 = 总面）High ≤ 40000 且 ≥ 27000（悬铃木参考下沿
 *      ——大卡低数量语义：单卡面积 ≈银杏 ×7.7、同覆盖率卡数天然低，密度语义由大卡
 *      覆盖率承载，低于夏栎参考 28754 不阻塞，记档同银杏先例口径）/ Mid 6000–10000 /
 *      Low 1500–3000——**家族行沿用**（docs/procedural-assets/lod-spec.md §5.2 阔叶
 *      乔木行，T009.6 锁定不重开；本任务不回写家族表）。8 槽 × 3 档实测带
 *      （2026-09-20 探针，规范种子）：High 总面 27456–28769（slot-6 疏松最低 /
 *      slot-7 丰满最高；叶卡 1295–1752 ×2 + 果序 672–1048（84–131 球 ×8）、保留簇
 *      371–447）、Mid 总面 6208–6968（叶卡 503–702 ≈ High 存活卡 × 0.40——疏簇
 *      5 选 2 掩码率 + 果序全量保留）、Low 总面 1854–2158（壳卡 = 保留簇 × 2、果序
 *      省略记档）；皮恒 24178 / 4514 / 370（High/Mid/Low——主干 14 段 ×14 + 底盖 14 +
 *      五级 7/21/63/189/378 枝，拓扑 6 骨架 + 1 领导）；rng 消费槽内三档恒等
 *      （slot-0 快照 51453；跨槽随保留簇数变化 51363–51743 ±0.4%——通透 roll 计数
 *      机制，五先例同款）；minY 三档恒 0。
 */
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { buildPlatanusGeometry } from '../tree/platanus/platanusGeometry';
import { PLATANUS_SHAPE_PROFILES } from '../tree/platanus/platanusShapeProfile';
import { createPlatanusBarkMaterial, createPlatanusLeafDepthMaterial, createPlatanusLeafMaterial } from '../tree/platanus/platanusMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_tree_platanus',
  name: '悬铃木',
  category: 'plant',
  tags: ['植物', '树', '悬铃木', '二球悬铃木', '法国梧桐', 'broadleaf'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 8 }, // D19：8 形态槽（T011.5 八槽形态向量全量交付）
  variants: { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 }, // 参照朴树/香樟/榉树/银杏量级（D13 无新增依赖）
  triangleCount: 28466, // 实数 = slot-0 锚点 High 档结构计数（皮 24178 恒定 + 疏簇叶卡 1684×2 + 果序 115 球×8；多档起声明面取细模档；见模块头预算锁定账目）
  levels: [{ id: 'high' }, { id: 'mid' }, { id: 'low' }], // LOD 三档（D27 首版最小化 [{id}]——阈值归 Runtime 常量，不进 Profile）
  taxonomy: { category: 'plant', family: 'broadleaf' }, // 阔叶家族契约第六实例（tree/broadleaf/，T010.1；悬铃木科（Platanaceae）被子植物按家族形态域归 broadleaf——落叶阔叶第三例，方法适配先例记档同榉树/银杏）
  proceduralProfile: {
    // 跨 8 槽细模包围盒实测带（T011.5 探针：h 11.53–12.79 / w 6.52–8.79）。
    // 物种锚 slot-0 ≈11.6m 高 / 7.95m 冠幅 / w-h 比 0.683（≈12m 中龄公园个体——主代理
    // 裁定保守低端，弱推断 per 终审记档；悬铃木速生大乔木为同语境混植的上层大乔突出
    // 量级——与夏栎 ≈8m 等五先例可混植）；槽间差异（slot-1 幼相窄端 w 6.52 / slot-2
    // 老龄开张端 w 8.79——冠形联动轴两端；slot-4 低冠视觉冠底 0.198 / slot-5 高冠
    // 0.314——干高 Inferred 域两端展开，记档见 platanusShapeProfile 各槽注释）
    heightRange: { min: 11.5, max: 12.8 },
    widthRange: { min: 6.5, max: 8.8 },
  },
};

/**
 * morphSeed → shapeProfile 路由（T011.5 八槽形态向量）：枚举 8 槽 morphSeedOf 逐位比对
 * 还原 slot 索引（O(8) 纯查表，确定性）；非槽种子（如测试直传任意 seed）与未填槽一并
 * 回落 slot-0 标准组合（夏栎/朴树/香樟/榉树/银杏前后行为兼容同构）。**不扩展 ProceduralBuild 公共签名**。
 */
function profileForSeed(seed: number) {
  for (let slot = 0; slot < 8; slot++) {
    if (seed === morphSeedOf(meta.id, slot)) return PLATANUS_SHAPE_PROFILES[Math.min(slot, PLATANUS_SHAPE_PROFILES.length - 1)]!;
  }
  return PLATANUS_SHAPE_PROFILES[0]!;
}

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.seed = morphSeed（SourceCache 传 morphSeedOf(assetId, slot)；缺省 = slot-0 锚点）
  const seed = params?.seed ?? morphSeedOf(meta.id, 0);
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧路径逐位不变；
  // 不参与 shapeSlot/morphSeed/sourceKey 形态身份——档位缓存维度归 ProceduralSourceCache）
  const level = params?.level ?? 'high';
  const rng = mulberry32(seed);
  const { geometry } = buildPlatanusGeometry(rng, profileForSeed(seed), level);
  const bark = createPlatanusBarkMaterial(level); // 组 0（契约序 [皮, 叶]——mergeGeometries 层序；果序并入皮组，材质接口记档见模块头）
  const leaf = createPlatanusLeafMaterial(level);
  // 影 pass 叶影裁切走 InstanceSource 契约通道——工厂每次 new（build 契约「每次调用 new
  // 全部资源」天然满足），档位随 level 匹配；归源所有（缓存 dispose）
  return {
    geometry,
    material: [bark, leaf],
    customDepthMaterial: createPlatanusLeafDepthMaterial(level),
  };
}
