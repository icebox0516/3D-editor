/**
 * runtime/procedural/assets/asset_tree_ginkgo.asset —— 程序化植物资产：银杏
 * （Ginkgo biloba Linn.，T011.4 阔叶家族第五实例——方法复制自榉树 asset_tree_zelkova，
 * 单科单属单种活化石、雄株口径：**长短枝双挂点** + 圆锥-广卵过渡冠——叶挂点语言与
 * 冠形读向与四先例分化最大的实例）。
 *
 * 职责：D19 契约链上的 slot-0 锚点形态资产——build(params?) 以 mulberry32(params.seed)
 *      驱动全部分枝/叶簇随机量（**rng 消费顺序即契约**：同 seed 逐位同结果），几何生成
 *      全部在 ./tree/ginkgo/ginkgoGeometry（五级递归分枝 + 锥度枝干 + 短枝莲座簇/长枝
 *      螺旋散生双挂点烘焙 + 冠内通透三规则 + 树皮近景微起伏——家族方法整体复制；银杏
 *      算法细节：**长短枝二型系统**（短枝莲座簇 8 候选/簇，通透过滤后逐簇典型 4–7 片
 *      = FRPS「3–8 叶簇生」Verified + 长枝散生卡 L5×5/L4×3 黄金角螺旋——FOC "spirally
 *      arranged" [3]）、**圆锥-广卵过渡冠**（excurrent 强领导 0.54 五实例最高 + 大枝近
 *      轮生（挂高段窄跨度 0.16 + asymmetry 0.32 低抖动）+ 干向挂点高度分级锥度
 *      （低枝长而平展 ×1.22 / 高枝短而陡立 ×0.68 + 角度梯度 ±20°→−8°）+ 斜上收敛
 *      32–48° 最窄冠幅比涌现 0.581）、干高工程默认域 0.34–0.40（Unknown·无实证 per
 *      Spec 终审 C-3）、浅-中纵裂脊沟微起伏树皮（0.030 / {4,5,6} / drift 2.6——vs 夏栎
 *      脊沟 0.033/{3,4,5}/0.85、朴树浅斑 0.016/{4,5,6}/16、香樟纵裂 0.036/{3,4,6}/3.2、
 *      榉树光滑剥落 0.015/{3,5,6}/11 五分化第五种量级）、扇形大卡 0.10–0.16m ×
 *      0.62–0.91 长宽比（宽>高反向口径）——全部数值依据 docs/research/ginkgo-
 *      reference.md Spec 1.0（含终审记档：form 系照片读数作废、干高降 Unknown、冠幅比
 *      0.55–0.65 改园艺域 + fall 实测支撑），逐字段注释见 ./tree/ginkgo/ginkgoShapeProfile。
 *      形态参数类型 = 阔叶家族契约 ./tree/broadleaf/broadleafShapeProfile 第五实例；build
 *      内做 morphSeed → slot → profile 路由（profileForSeed O(8) 纯查表，非槽种子回落
 *      slot-0——公共签名不变，不扩 ProceduralBuild）。params.seed 缺省回落 slot-0 锚点
 *      morphSeed（morphSeedOf('asset_tree_ginkgo', 0)——与 ProceduralSourceCache 传入值
 *      逐位一致：无参路径 = 缓存路径 = 同一棵锚点树）。
 *      尺度参照真实乔木：中龄公园个体锚 ≈8m 高 / ≈4.7m 冠幅（工程锚弱推断 per 终审
 *      C-1；8 槽带 7.80–8.77m 高 / 3.82–5.89m 宽——proceduralProfile 全槽实测带；
 *      slot-1 Princeton Sentry 窄端冠幅比 0.447 微出建模域下沿、slot-5 高冠 8.77m 贴
 *      锚域上沿——品种群轴展开的槽间差异如实入带，OSU 品种证据见 ginkgoShapeProfile
 *      各槽注释）；原点 = 底部中心 minY 精确 0。
 * 材质分层表（materialIndex → 部件 → 材质；配方在 ./tree/ginkgo/ginkgoMaterials——
 *      park-shader-agent 并行交付，导出签名冻结（与 zelkovaMaterials 同构）：
 *      createGinkgoBarkMaterial / createGinkgoLeafMaterial / createGinkgoLeafDepthMaterial，
 *      均 (level?: ProceduralLevel) => 材质）：
 *      0 树皮（主干+五级枝+底盖）—— createGinkgoBarkMaterial(level)：灰褐纵裂脊沟
 *        （幼即浅纵裂→老深纵裂粗糙 Verified [1][2]；中龄取浅-中相——脊宽 ≈干径
 *        1/10–1/15、沟脊对比中-高、伴生树瘤记档；几何侧微起伏 0.030/{4,5,6}/2.6 见
 *        profile）
 *      1 叶簇卡（L4/L5 短枝莲座簇 + 长枝散生烘焙）—— createGinkgoLeafMaterial(level)：
 *        淡绿-中绿细质密叶基调（五资产最淡叶色——两面同色无粉感 Verified [1][2][7]）+
 *        SDF 扇形叶（宽楔基 + 全缘 + 波状缺刻 60%/2 裂 30%/近全缘 10% + 二叉分歧脉
 *        ——五资产唯一非中轴脉型，Spec §4 叶形/叶脉节 Verified）+ aLeafRand 逐叶变奏 +
 *        风动（aSeed 整树缓摆 + aBend 快颤——长柄扇叶颤动语言 [7]）
 *      注：层间 mergeGeometries useGroups=true → 恰 2 组（皮 0 / 叶 1，D15 免组膨胀）；
 *      叶影裁切深度材质走 InstanceSource 契约通道 customDepthMaterial（T009.5 立契）：
 *      build 返回 createGinkgoLeafDepthMaterial(level)（档位匹配，分档语义在工厂内）。
 * 叶卡顶点属性（几何固有，冻结契约沿用）：aLeafRand（逐叶随机 ∈ [0,1)，同卡 6 顶点同
 *      值）、aBend（风动摆幅权重，卡内根→尖非降；树皮组恒 0）。
 * 边界：每次调用 new 全部 geometry/material/深度材质（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象，D17）；不建模记档（Spec 有事实、本资产不表达）：
 *      秋色金黄 ≈90%+ 纯金黄（季相归材质/风格层，任务书「秋色不建模记档」）、种子白果
 *      （雌株不进生产口径）、雄球花、落叶一夜集中行为、叶柄细长（卡抽象）、扇形轮廓/
 *      缺刻/2 裂/二叉脉（归材质 SDF）、冬芽、小枝三色（淡褐黄→灰/短枝黑灰——归材质层）、
 *      树瘤/苔藓地衣（归树皮材质）——详见 ginkgoShapeProfile 模块头。
 * LOD（T011.4 三档交付，家族方法逐位复制）：build 透传 params.level（缺省 'high'——
 *      旧无参路径逐位不变）到几何与皮/叶材质工厂；三档同 rng 流同骨架决策（档间不变量、
 *      Mid ⊂ High 掩码口径与发射计划见 ginkgoGeometry 模块头），材质档位变体与
 *      customProgramCacheKey 档位唯一在 ginkgoMaterials；levels 声明三档（D27 首版
 *      最小化 [{id}]——调度阈值归 Runtime 常量不进 Profile）。
 * LOD 预算锁定账目（预算制 D19.8——ginkgoGeometry 模块头引用此处）：锁定预算（三角形，
 *      皮 + 叶 = 总面）High ≤ 40000 且 ≥ 27000 / Mid 6000–10000 / Low 1500–3000——
 *      **家族行沿用**（docs/procedural-assets/lod-spec.md §5.2 阔叶乔木行，T009.6 锁定
 *      不重开；本任务不回写家族表）。8 槽 × 3 档实测带（2026-09-20 探针，规范种子）：
 *      High 总面 27892–31050（slot-6 疏松最低 / slot-5 高冠最高；叶卡 3555–5134 =
 *      莲座卡 2064–3265 + 散生卡 1465–1884、保留簇 382–483）、Mid 总面 6622–7774
 *      （叶卡 1370–2054 ≈ High 存活卡 × 0.37——莲座 3/8 + 散生 L5 2/5 混合掩码率）、
 *      Low 总面 1858–2262（壳卡 = 保留簇 × 2）；皮恒 20782 / 3882 / 330（High/Mid/Low
 *      ——主干 14 段 ×14 + 底盖 14 + 五级 6/18/54/162/324 枝，拓扑同榉树/香樟 5+1；
 *      Mid 径向降 6/5/4/3/3/3 + L5 不发射、Low 主干+L1 极简）、rng 消费槽内三档恒等
 *      （slot-0 快照 82756；跨槽随保留簇数变化——四先例同机制）、minY 三档恒 0。
 *      锁定依据：Mid/Low 实测带全部落家族行带内 → 按家族行锁入；**High 下沿 27000 为
 *      银杏自己的参考下沿**（夏栎实测带参考下沿 28754 之下——扇形大卡 0.10–0.16m 宽
 *      的单卡覆盖面积 ≈榉树小卡 ×2.2，同卡数下叶幕覆盖率更高，卡数天然低于小卡资产、
 *      密度语义由覆盖率承载——低于夏栎参考不阻塞，记档；Mid 出带须调结构计数重测——
 *      未触发）。
 */
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { buildGinkgoGeometry } from '../tree/ginkgo/ginkgoGeometry';
import { GINKGO_SHAPE_PROFILES } from '../tree/ginkgo/ginkgoShapeProfile';
import { createGinkgoBarkMaterial, createGinkgoLeafDepthMaterial, createGinkgoLeafMaterial } from '../tree/ginkgo/ginkgoMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_tree_ginkgo',
  name: '银杏',
  category: 'plant',
  tags: ['植物', '树', '银杏', '白果', 'broadleaf'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 8 }, // D19：8 形态槽（T011.4 八槽形态向量全量交付）
  variants: { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 }, // 参照朴树/香樟/榉树量级（D13 无新增依赖）
  triangleCount: 30458, // 实数 = slot-0 锚点 High 档结构计数（皮 20782 恒定 + 莲座/散生叶卡 4838×2；多档起声明面取细模档；见模块头预算锁定账目）
  levels: [{ id: 'high' }, { id: 'mid' }, { id: 'low' }], // LOD 三档（D27 首版最小化 [{id}]——阈值归 Runtime 常量，不进 Profile）
  taxonomy: { category: 'plant', family: 'broadleaf' }, // 阔叶家族契约第五实例（tree/broadleaf/，T010.1；银杏为裸子植物（gymnosperm [4]）但按家族形态域归 broadleaf 家族——叶序/冠形方法适配先例（落叶阔叶第三例），裸子语义无家族字段，记档同榉树落叶先例）
  proceduralProfile: {
    // 跨 8 槽细模包围盒实测带（T011.4 探针：h 7.80–8.77 / w 3.82–5.89）。
    // 物种锚 slot-0 ≈8.17m 高 / 4.75m 冠幅 / w-h 比 0.581（≈8m 中龄公园个体工程锚——
    // 弱推断 per 终审 C-1；五资产最窄冠，与夏栎 ≈8m、朴树 ≈8.5m、香樟 ≈8.6m、榉树
    // ≈8m 同语境可混植量级）；槽间差异（slot-1 Princeton Sentry 窄端 w 3.82 / slot-2
    // Autumn Gold 阔圆锥端 w 5.89 / slot-5 高冠 h 8.77——OSU 品种群轴展开如实入带，
    // 记档见 ginkgoShapeProfile 各槽注释）
    heightRange: { min: 7.8, max: 8.8 },
    widthRange: { min: 3.8, max: 5.9 },
  },
};

/**
 * morphSeed → shapeProfile 路由（T011.4 八槽形态向量）：枚举 8 槽 morphSeedOf 逐位比对
 * 还原 slot 索引（O(8) 纯查表，确定性）；非槽种子（如测试直传任意 seed）与未填槽一并
 * 回落 slot-0 标准组合（夏栎/朴树/香樟/榉树前后行为兼容同构）。**不扩展 ProceduralBuild 公共签名**。
 */
function profileForSeed(seed: number) {
  for (let slot = 0; slot < 8; slot++) {
    if (seed === morphSeedOf(meta.id, slot)) return GINKGO_SHAPE_PROFILES[Math.min(slot, GINKGO_SHAPE_PROFILES.length - 1)]!;
  }
  return GINKGO_SHAPE_PROFILES[0]!;
}

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.seed = morphSeed（SourceCache 传 morphSeedOf(assetId, slot)；缺省 = slot-0 锚点）
  const seed = params?.seed ?? morphSeedOf(meta.id, 0);
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧路径逐位不变；
  // 不参与 shapeSlot/morphSeed/sourceKey 形态身份——档位缓存维度归 ProceduralSourceCache）
  const level = params?.level ?? 'high';
  const rng = mulberry32(seed);
  const { geometry } = buildGinkgoGeometry(rng, profileForSeed(seed), level);
  const bark = createGinkgoBarkMaterial(level); // 组 0（契约序 [皮, 叶]——mergeGeometries 层序）
  const leaf = createGinkgoLeafMaterial(level);
  // 影 pass 叶影裁切走 InstanceSource 契约通道——工厂每次 new（build 契约「每次调用 new
  // 全部资源」天然满足），档位随 level 匹配；归源所有（缓存 dispose）
  return {
    geometry,
    material: [bark, leaf],
    customDepthMaterial: createGinkgoLeafDepthMaterial(level),
  };
}
