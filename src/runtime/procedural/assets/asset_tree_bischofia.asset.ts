/**
 * runtime/procedural/assets/asset_tree_bischofia.asset —— 程序化植物资产：重阳木
 * （Bischofia polycarpa (H. Léveillé) Airy Shaw，T011.8 阔叶家族第九实例——方法复制自
 * 乌桕 asset_tree_triadica（最新方法模板），长江流域公园夏绿单干中龄个体 ≈10m：
 * **三出复叶卡挂点（家族复叶第二型——放射对称型）+ 伞形-开展圆头冠（两段 scaffold
 * 角带）+ 褐色纵裂深沟宽脊扭转树皮**——**无花果资产**（夏相幼果亚厘米显著性极低 +
 * 春花/熟果相外——终审 ③-2 裁决，几何/材质均无花果账目与 v∈[4,7) uv 域））。
 *
 * 职责：D19 契约链上的 slot-0 锚点形态资产——build(params?) 以 mulberry32(params.seed)
 *      驱动全部分枝/叶簇随机量（**rng 消费顺序即契约**：同 seed 逐位同结果；无花果挂点
 *      ——消费全在骨架/簇/通透 roll），几何生成全部在
 *      ./tree/bischofia/bischofiaGeometry（五级递归分枝 + 锥度枝干 + 末级枝**三出复叶
 *      卡**散簇烘焙 + 冠内通透三规则 + 树皮近景微起伏——家族方法整体复制；重阳木算法
 *      细节：**三出复叶卡挂点语言**（家族复叶第二型——1 卡承载整枚三出复叶（全展幅
 *      20–30cm Verified [1][3] × ≈1.4 工程映射 → 卡宽 0.21–0.315 × 长/宽 1.3333
 *      **恒比例冻结 0.75**（三出展幅放射对称宽于栾树羽叶 0.60）；分卡方案 3 小叶卡/
 *      挂点 = 3× tri 成本 vs 单卡 2 tri 的三判据裁定（Step 1 判定 A）——三小叶结构归
 *      材质 SDF 层；卡 v 轴 = 总柄基 0 → 顶小叶尖 1，总柄裸段 v∈[0,0.35] 为材质 SDF
 *      裸柄线域）+ 黄金角互生螺旋簇内方位 + 平展取向（长总柄 9–13.5cm 飘逸））、
 *      **伞形-开展圆头冠**（两段 scaffold 角带（SCAFFOLD_BAND：挂高段归一位置分带——
 *      下带 +15° 近水平 70–90°（伞形下缘大枝横展，>90° 微下垂自然允许）/ 上带 −15°
 *      斜上 40–60°（圆头顶闭合），form-a 双问数值带 + FRPS「大枝斜展」Verified [1]
 *      per 终审裁决 4；确定性零 rng）+ 干向长度分级 ×1.14→×0.72（伞形放张）+ upturn
 *      链低正 [0.10,…,0.03]（端部收口 + 冠缘细枝横展微垂读向——winter-fruit [7]）+
 *      领导枝弱 0.48（伞形无强单顶）+ 大枝虬曲（wander 0.10 中高）——涌现 w/h
 *      0.733–0.992 全槽落工程域 0.7–1.0）、干高 0.25–0.33（form-a 干高 1/4–1/3 双问
 *      [7]）、**褐纵裂深沟宽脊 + 扭转中-深浮雕**（0.028/{3,4,5}/6.5——FRPS「树皮褐色，
 *      厚6毫米，纵裂」Verified [1] + bark-a 老龄宽脊扭转/bark-b 中龄档 [7]；**抬档
 *      亚视觉地板 3.5mm：仅主干有效起伏、全部分枝管光滑**（「细枝红褐-灰褐较光滑带
 *      皮孔」[7]——皮孔/色序归材质层））——全部数值依据
 *      docs/research/bischofia-reference.md Spec 1.0（生产一律以文末「终审记档」③ 逐项
 *      裁决 + ④ 生产口径终版为准：树高锚 ≈10m 裁决 1、花果不做裁决 2、冠幅比 0.8–1.0
 *      裁决 3、两段 scaffold 采纳裁决 4、叶色弱差裁决 5），逐字段注释见
 *      ./tree/bischofia/bischofiaShapeProfile。
 *      形态参数类型 = 阔叶家族契约 ./tree/broadleaf/broadleafShapeProfile 第九实例；
 *      build 内做 morphSeed → slot → profile 路由（profileForSeed O(8) 纯查表，非槽
 *      种子回落 slot-0——公共签名不变，不扩 ProceduralBuild）。params.seed 缺省回落
 *      slot-0 锚点 morphSeed（morphSeedOf('asset_tree_bischofia', 0)——与
 *      ProceduralSourceCache 传入值逐位一致：无参路径 = 缓存路径 = 同一棵锚点树）。
 *      尺度参照真实乔木：中龄公园个体锚 ≈10m 高（速生伞形开展——与栾树同量级、高于
 *      乌桕 9.5m 半档；FRPS 上限 15m，生产域 8–12m Inferred per 终审裁决 1；速生上探
 *      12 变体入 slot-1）；8 槽带 8.78–10.73m 高 / 7.16–9.64m 宽
 *      （proceduralProfile 全槽实测带，2026-09-21 终测）；槽间树高差由各槽领导比回调
 *      定档（10m 级领导链复利外伸的种子实现差异——回调记档见 profile 各槽注释）；
 *      **伞形两段角的叶幕绝对宽度种子方差大（面板 ±20%）——域带收口以规范种子锁定**
 *      （探针记档，见 bischofiaShapeSlots 测试注释）；原点 = 底部中心 minY 精确 0。
 * 材质分层表（materialIndex → 部件 → 材质；配方在 ./tree/bischofia/
 *      bischofiaMaterials——park-shader-agent 并行交付，导出签名冻结（与
 *      triadicaMaterials 同构）：createBischofiaLeafMaterial / createBischofiaBarkMaterial
 *      / createBischofiaLeafDepthMaterial，均 (level?: ProceduralLevel) => 材质）：
 *      0 树皮（主干+五级枝+底盖——**无花果资产：组 0 = 纯皮拓扑**）——
 *        createBischofiaBarkMaterial(level)：褐-深灰褐纵裂深沟宽脊 + 裂纹扭转（FRPS
 *        「树皮褐色，厚6毫米，纵裂」Verified [1] + bark-a/b 照片 [7]——九资产第 9 树皮
 *        语言；几何侧仅主干起伏浮雕 + 抬档地板下分枝管光滑，**褐色基调/宽脊扭转纹/
 *        细枝红褐皮孔色序/当年生枝绿色近景身份点主体在材质层**）
 *      1 三出复叶卡（L4/L5 末级枝散簇烘焙）—— createBischofiaLeafMaterial(level)：
 *        中绿-深绿复叶基调（正叶中绿-深绿 Inferred [7]）+ **三出复叶 SDF**（放射对称
 *        型——三叶场并集 + 总柄裸段 v∈[0,0.35] 裸柄线域：顶生大（柄 1.5–4(–6)cm）+
 *        两侧小（近无柄 3–14mm）、小叶卵形-椭圆状卵形、先端突尖-短渐尖、基圆-浅心、
 *        缘钝细齿 4–5/cm——vs 栾树两级窗列的复叶第二型材质侧表达）+ aLeafRand 逐叶
 *        变奏 + 风动（aSeed 整树缓摆 + aBend 快颤——长总柄复叶飘逸双层）
 *      注：层间 mergeGeometries useGroups=true → 恰 2 组（皮 0 / 叶 1，D15 免组膨胀）；
 *      叶影裁切深度材质走 InstanceSource 契约通道 customDepthMaterial
 *      （T009.5 立契）：build 返回 createBischofiaLeafDepthMaterial(level)
 *      （档位匹配，分档语义在工厂内）。
 * 叶卡顶点属性（几何固有，冻结契约沿用）：aLeafRand（逐叶随机 ∈ [0,1)，同卡 6 顶点
 *      同值；皮组恒 0）、aBend（风动摆幅权重，卡内根→尖非降（总柄基→顶小叶尖）；皮组
 *      恒 0）。
 * 边界：每次调用 new 全部 geometry/material/深度材质（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象，D17）；不建模记档（Spec 有事实、本资产不表达）：
 *      三出复叶内部结构（顶大侧小/小叶柄差/小叶三相/缘钝细齿/纸质——归材质 SDF）、
 *      总柄裸段（归材质 SDF 裸柄线域）、**花**（4–5 月春相总状绿穗——相外，终审 ③-2
 *      不做）、**夏相幼果/秋冬红果串**（幼果 2–3mm 亚厘米显著性极低 + 熟期 10–11 月
 *      相外——终审 ③-2 不做，身份标志记档）、秋色黄主导带橙红（归材质/风格层）、新叶
 *      红褐 flush（归材质变奏候选）、当年生枝绿色皮孔色序与芽（归材质/毫米级）、托叶
 *      （早落）、叶背面色差（Unknown 弱差归材质）、倾斜个体（变体档）、心材红色
 *      （不可见）——详见 bischofiaShapeProfile 模块头。
 * LOD（T011.8 三档交付，家族方法逐位复制）：build 透传 params.level（缺省 'high'——
 *      旧无参路径逐位不变）到几何与皮/叶材质工厂；三档同 rng 流同骨架/簇位决策
 *      （档间不变量、Mid ⊂ High 掩码口径与发射计划见 bischofiaGeometry 模块头），
 *      材质档位变体与 customProgramCacheKey 档位唯一在 bischofiaMaterials；levels
 *      声明三档（D27 首版最小化 [{id}]——调度阈值归 Runtime 常量不进 Profile）。
 * LOD 预算锁定账目（预算制 D19.8——bischofiaGeometry 模块头引用此处）：锁定预算
 *      （三角形，皮 + 复叶卡 = 总面）High ≤ 40000 且 ≥ 27000（重阳木参考下沿——
 *      复叶中卡中量语义：单卡面积 ≈0.09m² 中值 vs 栾树 0.36 ×0.25，同覆盖率下卡数
 *      天然高于栾树大卡、密度语义由中卡数量承载，记档同 platanus/栾树/triadica 先例
 *      口径）/ Mid 6000–10000 / Low 1500–3000——**家族行沿用**
 *      （docs/procedural-assets/lod-spec.md §5.2 阔叶乔木行，T009.6 锁定不重开；本任务
 *      不回写家族表）。8 槽 × 3 档实测带（2026-09-21 终测，规范种子）：High 总面
 *      **28282–30372**（slot-6 疏松最低 / slot-7 丰满最高；复叶卡 2052–3097 × 2、
 *      保留簇 383–461/簇位 945）；Mid 总面 **6092–6872**（复叶卡 789–1179 ≈ High
 *      存活卡 × 0.375——中卡簇 8 选 3 掩码率）；Low 总面 **1902–2214**（壳卡 = 保留簇
 *      × 2 × 宽轴 0.75 × 半幅——三出复叶比例在 Low 延续）；皮恒 24178 / 4514 / 370
 *      （High/Mid/Low——主干 14 段 ×14 + 底盖 14 + 五级 7/21/63/189/378 枝，拓扑
 *      6 骨架 + 1 领导；Low 370 = 330 量级档）；rng 消费 slot-0 三档恒等 **73232**
 *      （快照锁）、跨槽 72984–73608 ±0.4%（通透 roll 计数机制，八先例同款——无花果
 *      零 rng 无消费口径问题）；minY 三档恒 0。
 */
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { buildBischofiaGeometry } from '../tree/bischofia/bischofiaGeometry';
import { BISCHOFIA_SHAPE_PROFILES } from '../tree/bischofia/bischofiaShapeProfile';
import {
  createBischofiaBarkMaterial,
  createBischofiaLeafDepthMaterial,
  createBischofiaLeafMaterial,
} from '../tree/bischofia/bischofiaMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_tree_bischofia',
  name: '重阳木',
  category: 'plant',
  tags: ['植物', '树', '重阳木', 'Bischofia polycarpa', 'broadleaf'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 8 }, // D19：8 形态槽（T011.8 八槽形态向量全量交付）
  variants: { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 }, // 参照朴树/香樟/榉树/银杏/悬铃木/栾树/乌桕量级（D13 无新增依赖）
  triangleCount: 29644, // 实数 = slot-0 锚点 High 档结构计数（皮 24178 恒定 + 复叶卡 2733×2；无花果资产——无附加元素账目；多档起声明面取细模档；见模块头预算锁定账目）
  levels: [{ id: 'high' }, { id: 'mid' }, { id: 'low' }], // LOD 三档（D27 首版最小化 [{id}]——阈值归 Runtime 常量，不进 Profile）
  taxonomy: { category: 'plant', family: 'broadleaf' }, // 阔叶家族契约第九实例（tree/broadleaf/，T010.1；大戟科（Euphorbiaceae）被子植物按家族形态域归 broadleaf——落叶阔叶第五例、复叶第二型（三出放射对称），记档见资产模块头）
  proceduralProfile: {
    // 跨 8 槽细模包围盒实测带（T011.8 终测 2026-09-21：h 8.78–10.73 / w 7.16–9.64，
    // 声明带外沿放宽——实测带全含）。
    // 物种锚 slot-0 ≈9.9m 高 / 8.4m 冠幅 / w-h 比 0.852（≈10m 中龄公园个体——速生伞形
    // 开展与栾树同量级、高于乌桕 9.5m 半档，主代理裁定 per 终审裁决 1；与夏栎 ≈8/朴树
    // ≈8.5/香樟 ≈8.6/榉树 ≈8/银杏 ≈8.2/悬铃木 ≈12/栾树 ≈10/乌桕 ≈9.5 同语境混植——
    // 速生上探 12 变体入 slot-1 终测 10.73 为 8 槽最高）；槽间差异（slot-1 速生窄端
    // w/h 0.733 贴下沿 / slot-2 幼龄开张宽端 0.992 贴上沿——冠幅比工程域 0.7–1.0 内
    // 两端（Spec 域 0.8–1.0 的开张带读向）；slot-4 低冠 / slot-5 高冠视觉冠底差同 seed
    // 1.84m——干高 0.25–0.33 域两侧展开，记档见 bischofiaShapeProfile 各槽注释）
    heightRange: { min: 8.7, max: 10.8 },
    widthRange: { min: 7.1, max: 9.7 },
  },
};

/**
 * morphSeed → shapeProfile 路由（T011.8 八槽形态向量）：枚举 8 槽 morphSeedOf 逐位比对
 * 还原 slot 索引（O(8) 纯查表，确定性）；非槽种子（如测试直传任意 seed）与未填槽一并
 * 回落 slot-0 标准组合（八先例前后行为兼容同构）。**不扩展 ProceduralBuild 公共签名**。
 */
function profileForSeed(seed: number) {
  for (let slot = 0; slot < 8; slot++) {
    if (seed === morphSeedOf(meta.id, slot)) return BISCHOFIA_SHAPE_PROFILES[Math.min(slot, BISCHOFIA_SHAPE_PROFILES.length - 1)]!;
  }
  return BISCHOFIA_SHAPE_PROFILES[0]!;
}

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.seed = morphSeed（SourceCache 传 morphSeedOf(assetId, slot)；缺省 = slot-0 锚点）
  const seed = params?.seed ?? morphSeedOf(meta.id, 0);
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧路径逐位不变；
  // 不参与 shapeSlot/morphSeed/sourceKey 形态身份——档位缓存维度归 ProceduralSourceCache）
  const level = params?.level ?? 'high';
  const rng = mulberry32(seed);
  const { geometry } = buildBischofiaGeometry(rng, profileForSeed(seed), level);
  const bark = createBischofiaBarkMaterial(level); // 组 0（契约序 [皮, 复叶卡]——mergeGeometries 层序；无花果资产：组 0 = 纯皮拓扑，无附加块材质接口）
  const leaf = createBischofiaLeafMaterial(level);
  // 影 pass 叶影裁切走 InstanceSource 契约通道——工厂每次 new（build 契约「每次调用 new
  // 全部资源」天然满足），档位随 level 匹配；归源所有（缓存 dispose）
  return {
    geometry,
    material: [bark, leaf],
    customDepthMaterial: createBischofiaLeafDepthMaterial(level),
  };
}
