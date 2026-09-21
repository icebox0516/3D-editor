/**
 * runtime/procedural/assets/asset_tree_sophora.asset —— 程序化植物资产：国槐
 * （Styphnolobium japonicum (L.) Schott 现用名口径〔FRPS 40:92 / FOC Vol.10 均采
 * Sophora japonica 传统口径——同种实体，终审裁决 1〕，T011.9 阔叶家族第十实例——
 * 方法复制自重阳木 asset_tree_bischofia（最新方法模板），长江流域公园夏绿单干中龄
 * 个体 ≈10m：**一回奇数羽状复叶卡（家族复叶第三型——窗列单级化 + 顶生独立窗位）+
 * 开展宽圆头冠（主枝低位放射两段角带 + 弱领导，族内最开展档 0.9–1.2）+ 末级枝
 * zigzag 弱表达 + 念珠荚果串（夏末盛挂身份信号——uv 果域 v∈[4,5] 入皮组）+ 灰褐
 * 深纵裂厚脊树皮（第 10 语言）**——**无花资产**（乳白低对比 + 窗口短 + 五信号已足
 * ——终审裁决 3，几何/材质均无花账目与 v∈[5,7) uv 域））。
 *
 * 职责：D19 契约链上的 slot-0 锚点形态资产——build(params?) 以 mulberry32(params.seed)
 *      驱动全部分枝/叶簇随机量（**rng 消费顺序即契约**：同 seed 逐位同结果；荚果挂点
 *      = 确定性账目零 rng——消费全在骨架/簇/通透 roll），几何生成全部在
 *      ./tree/sophora/sophoraGeometry（五级递归分枝 + 锥度枝干 + 末级枝**一回羽叶卡**
 *      散簇烘焙 + **念珠荚果串**确定性抽选 + 冠内通透三规则 + 树皮近景微起伏——家族
 *      方法整体复制；国槐算法细节：**一回羽叶卡挂点语言**（家族复叶第三型——1 卡
 *      承载整枚一回奇数羽叶（15–25cm Verified [1][2] × ≈1.4 工程映射 → 卡长
 *      0.21–0.35 / 卡宽 0.07–0.12 × 长/宽 2.9412 **恒比例冻结 0.34**；主代理 Step 1
 *      判定：窗列单级化——小叶对生窗列 + 顶生小叶窗位 + 裸轴基段全部归材质 SDF 层；
 *      卡 uv v=0 复叶基部 → v=1 顶生小叶尖、u=0.5 叶轴中轴——冻结接口）+ 黄金角
 *      互生螺旋簇内方位 + 平展取向）、**念珠荚果串**（终审裁决 4 做：moniliform 串珠
 *      九资产独有——串沿末级枝梢下垂挂、保留 L5 簇位冠外带判据 + 位置散列排序 +
 *      固定步长抽选的**零 rng 确定性账目**（011.6/011.7 先例）；珠 3–10/串（平方偏置
 *      串均 ≈5.5，志书种子 1–6 粒下段加权）、珠径 ≈1cm ×2 家族映射（r 0.009–0.011）、
 *      串长主域 2.5–8cm ×2（珠距短串疏-长串紧负相关——珠间缢缩可见，裁决 5）；实测
 *      **49–63 串/树、237–319 珠**（8 槽，2026-09-21 终测——任务书 60–120 数量级
 *      目标的低端定档：珠串 Mid 全量保留（triadica/koelreuteria 先例）+ Mid 预算带
 *      10000 − 皮 4514 − Mid 叶面（小卡簇 10 选 3 掩码 ≈1900–2900）下的串数上限，
 *      记档）；**uv 果域标记 v∈[4.0,4.97]** 入皮组（组 0）——材质按域识别（triadica
 *      果域先例）、u = 逐珠色档（绿→黄绿→黄褐色序材质通道））、**开展宽圆头冠**
 *      （两段 scaffold 角带（SCAFFOLD_BAND：挂高段归一位置分带——下带 +15° 近水平
 *      69–87° **主枝低位放射横展**（NC open-grown 低位分枝 Verified [4]）/ 上带
 *      −15° 斜上 39–57°（宽圆头顶闭合），确定性零 rng）+ 挂高段低 0.52–0.74（族内
 *      低档）+ 干向长度分级 ×1.10→×0.74（低位长枝放射放张）+ upturn 链低正 + 领导枝
 *      弱-中庸 0.48（宽圆头顶由上带骨架链共构）+ **末级枝 zigzag 确定性交替偏置**
 *      （L4/L5 ±amp 段序交替，零 rng——twig-a 双问 [6] 的弱表达，裁决 9：夏绿相
 *      叶幕覆盖下不显著记档、冬态不建模）——涌现 w/h 0.886–1.147 全槽落 Spec 域
 *      0.9–1.2 读向带（slot-0 0.960 中带；窄端变体槽 0.886–0.895 微出下沿记档））、
 *      干高 0.24–0.32（净干 2–3m 级建议 Inferred + 低位放射下段；两相栽培 NC
 *      Verified [4]——培训直干相 slot-1 / 开放低分枝相 slot-2 槽位化）、**灰褐深纵裂
 *      厚脊沟中-深偏高档浮雕**（0.032/{3,4,6}/5.5——FRPS「灰褐色，具纵裂纹」[1] +
 *      NC deep fissures [4] + 照片三源 [6]；**抬档亚视觉地板 3.5mm：仅主干有效起伏、
 *      全部分枝管光滑**；交叉网状/暗色瘤突/愈合疤/灰褐色调主体在材质层）——全部
 *      数值依据 docs/research/sophora-reference.md Spec 1.0（生产一律以文末「终审
 *      记档」④ 终审裁决十项为准），逐字段注释见 ./tree/sophora/sophoraShapeProfile。
 *      形态参数类型 = 阔叶家族契约 ./tree/broadleaf/broadleafShapeProfile 第十实例；
 *      build 内做 morphSeed → slot → profile 路由（profileForSeed O(8) 纯查表，非槽
 *      种子回落 slot-0——公共签名不变，不扩 ProceduralBuild）。params.seed 缺省回落
 *      slot-0 锚点 morphSeed（morphSeedOf('asset_tree_sophora', 0)——与
 *      ProceduralSourceCache 传入值逐位一致：无参路径 = 缓存路径 = 同一棵锚点树）。
 *      尺度参照真实乔木：中龄公园个体锚 ≈10m 高（开展宽冠树高不宜取高端——裁决 2
 *      负相关读向记档；与夏栎 ≈8/朴树 ≈8.5/香樟 ≈8.6/榉树 ≈8/银杏 ≈8.2/悬铃木
 *      ≈12/栾树 ≈10/乌桕 ≈9.5/重阳木 ≈10 同语境混植）；8 槽带 9.23–11.36m 高 /
 *      9.30–11.01m 宽（proceduralProfile 全槽实测带，2026-09-21 终测）；槽间树高差
 *      由各槽领导比回调定档（**Step 3 探针回调记档**：初值领导 0.42 + 树高域
 *      9.7–10.5 实测涌现 8.08–9.84 偏锚域下沿——弱领导 + 宽扁冠的涌现折减 ~1.5m，
 *      回调领导 +0.06 / 树高域 10.1–10.9 后 slot-0 10.34 落锚域中带，回调记档见
 *      profile 各槽注释）；原点 = 底部中心 minY 精确 0。
 * 材质分层表（materialIndex → 部件 → 材质；配方在 ./tree/sophora/sophoraMaterials
 *      ——park-shader-agent 并行交付，导出签名冻结（与 bischofiaMaterials 同构）：
 *      createSophoraBarkMaterial / createSophoraLeafMaterial /
 *      createSophoraLeafDepthMaterial，均 (level?: ProceduralLevel) => 材质）：
 *      0 树皮 + 荚果（主干+五级枝+底盖+念珠珠串——**荚果入皮组：uv 果域标记
 *      v∈[4,5] + u = 逐珠色档**，材质按 v 域分流荚果配方）——
 *        createSophoraBarkMaterial(level)：灰褐-深灰褐深纵裂厚脊沟基调 + 纵为主
 *        局部交叉网状次级层 + 散在暗色瘤突 + 愈合疤弱表达（第 10 树皮语言，终审
 *        裁决 6——FRPS/NC/照片三源；几何侧仅主干起伏浮雕 + 抬档地板下分枝管光滑）
 *        + 念珠荚果域色序（绿→黄绿→黄褐 + 珠间缢缩暗缝 + 肉质光润——u 通道）
 *      1 一回羽叶卡（L4/L5 末级枝散簇烘焙）—— createSophoraLeafMaterial(level)：
 *        中绿-亮绿细碎均质冠面基调（上面中绿亮绿/下面灰白两面色差归材质 [1][2][6]）
 *        + **一回奇数羽叶 SDF（窗列单级化）**（小叶 4–7 对对生/近对生窗列 + 顶生
 *        小叶独立窗位 + 裸轴基段 bare 门控减法式 + 小叶卵状披针形/渐尖小尖头/基稍
 *        偏斜/全缘——卡 v=0 基部 → v=1 顶生小叶尖、u=0.5 叶轴中轴、宽/长 0.34
 *        冻结接口）+ aLeafRand 逐叶变奏 + 风动（aSeed 整树缓摆 + aBend 快颤）
 *      注：层间 mergeGeometries useGroups=true → 恰 2 组（皮 0 / 叶 1，D15 免组膨胀）；
 *      叶影裁切深度材质走 InstanceSource 契约通道 customDepthMaterial
 *      （T009.5 立契）：build 返回 createSophoraLeafDepthMaterial(level)
 *      （档位匹配，分档语义在工厂内）。
 * 叶卡顶点属性（几何固有，冻结契约沿用）：aLeafRand（逐叶随机 ∈ [0,1)，同卡 6 顶点
 *      同值；皮组（含荚果）恒 0）、aBend（风动摆幅权重，卡内根→尖非降（复叶基部→
 *      顶生小叶尖）；皮组（含荚果）恒 0）。
 * 边界：每次调用 new 全部 geometry/material/深度材质（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象，D17）；不建模记档（Spec 有事实、本资产不表达）：
 *      一回羽叶内部结构（小叶窗列/顶生窗位/裸轴段/小叶三相/两面色差/小托叶/叶柄基
 *      膨大藏芽——归材质 SDF）；**花**（顶生金字塔形圆锥花序 15–30cm/乳白/旗瓣紫脉
 *      纹——Verified [1][2][4][6]，终审裁决 3 不做）；荚果肉质质感细档（归材质 u
 *      通道）；当年生枝绿色 + 皮孔（裁决 8——归材质层）；秋色金黄（归材质/风格层）；
 *      冬态 zigzag 裸枝相（裁决 9 弱表达仅）；多干古树相（form-b 老树变体端）；龙爪
 *      槐垂枝变型与种内变种谱（FRPS Verified——记档不建模）；芽（Unknown）——详见
 *      sophoraShapeProfile 模块头。
 * LOD（T011.9 三档交付，家族方法逐位复制）：build 透传 params.level（缺省 'high'——
 *      旧无参路径逐位不变）到几何与皮/叶材质工厂；三档同 rng 流同骨架/簇位/果串
 *      决策（档间不变量、Mid ⊂ High 掩码口径与发射计划见 sophoraGeometry 模块头；
 *      **荚果串 Mid 全量保留（身份信号）/ Low 省略**——triadica/koelreuteria Low
 *      果处理先例），材质档位变体与 customProgramCacheKey 档位唯一在
 *      sophoraMaterials；levels 声明三档（D27 首版最小化 [{id}]——调度阈值归
 *      Runtime 常量不进 Profile）。
 * LOD 预算锁定账目（预算制 D19.8——sophoraGeometry 模块头引用此处）：锁定预算
 *      （三角形，皮 + 复叶卡 + 荚果串 = 总面）High ≤ 40000（家族行上沿语义，无绝对
 *      下沿——**小卡高数量语义**：单卡面积 ≈0.025m² 中值 vs 重阳 0.09 ×0.28，密度
 *      语义由小卡数量承载，记档同 platanus/栾/triadica/bischofia 先例口径）/ Mid
 *      6000–10000 / Low 1500–3000——**家族行沿用**（docs/procedural-assets/
 *      lod-spec.md §5.2 阔叶乔木行，T009.6 锁定不重开；本任务不回写家族表）。
 *      8 槽 × 3 档实测带（2026-09-21 终测，规范种子）：High 总面 **32430–35700**
 *      （slot-6 疏松最低 / slot-7 丰满最高；复叶卡 3178–4517 × 2、荚果串
 *      1896–2552、保留簇 423–521/簇位 945）；Mid 总面 **8330–9720**（复叶卡
 *      960–1427 ≈ High 存活卡 × 0.30——小卡簇 10 选 3 掩码率 + 果串全量保留）；
 *      Low 总面 **2062–2454**（壳卡 = 保留簇 × 2 × 宽轴 0.34 × 半幅——复叶卡比例
 *      在 Low 延续；荚果串省略记档）；皮恒 24178 / 4514 / 370（High/Mid/Low——主干
 *      14 段 ×14 + 底盖 14 + 五级 7/21/63/189/378 枝，拓扑 6 骨架 + 1 领导）；rng
 *      消费 slot-0 三档恒等 **89876**（快照锁）、跨槽 89266–90446 ±0.7%（通透 roll
 *      计数机制，九先例同款——荚果挂点零 rng 无消费口径问题）；minY 三档恒 0。
 */
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { buildSophoraGeometry } from '../tree/sophora/sophoraGeometry';
import { SOPHORA_SHAPE_PROFILES } from '../tree/sophora/sophoraShapeProfile';
import {
  createSophoraBarkMaterial,
  createSophoraLeafDepthMaterial,
  createSophoraLeafMaterial,
} from '../tree/sophora/sophoraMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_tree_sophora',
  name: '国槐',
  category: 'plant',
  tags: ['植物', '树', '国槐', 'Styphnolobium japonicum', 'broadleaf'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 8 }, // D19：8 形态槽（T011.9 八槽形态向量全量交付）
  variants: { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 }, // 参照朴树/香樟/榉树/银杏/悬铃木/栾树/乌桕/重阳木量级（D13 无新增依赖）
  triangleCount: 34922, // 实数 = slot-0 锚点 High 档结构计数（皮 24178 恒定 + 复叶卡 4116×2 + 荚果串 314 珠 ×8；多档起声明面取细模档；见模块头预算锁定账目）
  levels: [{ id: 'high' }, { id: 'mid' }, { id: 'low' }], // LOD 三档（D27 首版最小化 [{id}]——阈值归 Runtime 常量，不进 Profile）
  taxonomy: { category: 'plant', family: 'broadleaf' }, // 阔叶家族契约第十实例（tree/broadleaf/，T010.1；豆科（Fabaceae）被子植物按家族形态域归 broadleaf——落叶阔叶第七例、复叶第三型（一回奇数羽状窗列单级化），记档见资产模块头）
  proceduralProfile: {
    // 跨 8 槽细模包围盒实测带（T011.9 终测 2026-09-21：h 9.23–11.36 / w 9.30–11.01，
    // 声明带外沿放宽——实测带全含）。
    // 物种锚 slot-0 ≈10.3m 高 / 9.9m 冠幅 / w-h 比 0.960（≈10m 中龄公园个体——开展
    // 宽冠树高不宜取高端（裁决 2 负相关读向）；与夏栎 ≈8/朴树 ≈8.5/香樟 ≈8.6/榉树
    // ≈8/银杏 ≈8.2/悬铃木 ≈12/栾树 ≈10/乌桕 ≈9.5/重阳木 ≈10 同语境混植）；槽间差异
    // （slot-5 高冠 11.36 为 8 槽最高 / slot-2 开放生长矮冠宽端 9.23——w/h 1.147 贴
    // Spec 域 0.9–1.2 上沿；slot-1 培训直干窄端 / slot-5 高冠窄端 w/h 0.886–0.895
    // 微出 0.9 下沿（窄端变体槽读向记档）；slot-4 低冠 / slot-5 高冠视觉冠底差同
    // seed 实测见 sophoraShapeSlots 测试注释）
    heightRange: { min: 9.2, max: 11.4 },
    widthRange: { min: 9.2, max: 11.1 },
  },
};

/**
 * morphSeed → shapeProfile 路由（T011.9 八槽形态向量）：枚举 8 槽 morphSeedOf 逐位比对
 * 还原 slot 索引（O(8) 纯查表，确定性）；非槽种子（如测试直传任意 seed）与未填槽一并
 * 回落 slot-0 标准组合（九先例前后行为兼容同构）。**不扩展 ProceduralBuild 公共签名**。
 */
function profileForSeed(seed: number) {
  for (let slot = 0; slot < 8; slot++) {
    if (seed === morphSeedOf(meta.id, slot)) return SOPHORA_SHAPE_PROFILES[Math.min(slot, SOPHORA_SHAPE_PROFILES.length - 1)]!;
  }
  return SOPHORA_SHAPE_PROFILES[0]!;
}

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.seed = morphSeed（SourceCache 传 morphSeedOf(assetId, slot)；缺省 = slot-0 锚点）
  const seed = params?.seed ?? morphSeedOf(meta.id, 0);
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧路径逐位不变；
  // 不参与 shapeSlot/morphSeed/sourceKey 形态身份——档位缓存维度归 ProceduralSourceCache）
  const level = params?.level ?? 'high';
  const rng = mulberry32(seed);
  const { geometry } = buildSophoraGeometry(rng, profileForSeed(seed), level);
  const bark = createSophoraBarkMaterial(level); // 组 0（契约序 [皮+荚果, 复叶卡]——mergeGeometries 层序；荚果按 v∈[4,5] 果域标记入皮组，材质按域分流荚果配方）
  const leaf = createSophoraLeafMaterial(level);
  // 影 pass 叶影裁切走 InstanceSource 契约通道——工厂每次 new（build 契约「每次调用 new
  // 全部资源」天然满足），档位随 level 匹配；归源所有（缓存 dispose）
  return {
    geometry,
    material: [bark, leaf],
    customDepthMaterial: createSophoraLeafDepthMaterial(level),
  };
}
