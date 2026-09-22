/**
 * runtime/procedural/assets/asset_tree_ligustrum.asset —— 程序化植物资产：女贞
 * （Ligustrum lucidum W. T. Aiton f. lucidum 女贞原变型本尊——种定名三源裁定：
 * FRPS 61:153 独立种两变型 + FOC Vol.15 Comment 常绿 (4–)5–6(–9) 脉 = f. lucidum
 * （落叶变型 f. latifolium 江苏特有不入相）+ GBIF ACCEPTED；近缘日本女贞 L.
 * japonicum（大灌木 3–5m + 果椭圆形）非长江流域城市绿化对象不混，T011.11 阔叶家族
 * 第十二实例——方法复制自白蜡 asset_tree_fraxinus（**最直接模板**：decussate 对生
 * 挂点 + 满冠带果簇账目 + 果簇卡入皮组 uv 果域——单叶卡替代复叶卡）与香樟
 * asset_tree_camphor（常绿密冠参数面），长江流域城市公园/行道中龄单干个体 ≈8m
 * （**常绿第二例**——香樟后，常绿语义 = 密度参数 + 材质表达，沿 011.2 缺口 A 口径）：
 * **对生单叶卡 decussate 簇（家族首例对生单叶挂点语言——「叶对生，单叶……全缘」
 * 属级 Verified，与白蜡对生复叶共享「对生」位、叶层面为单叶；卡宽 0.06–0.16 ×
 * 长宽比 1.7–2.8 变比例 = 真叶 6–17 × 3–8cm ×2 家族映射）+ 卵圆-广卵满密常绿冠
 * （camphor 广卵法端稍紧：单干 + 中低分枝 0.30 + 中角骨架 30–60° + 空隙 5–15%
 * 密档 + 团块 1/6–1/4 冠宽大簇）+ 肾形核果满冠下垂密簇（果期 7 月至翌年 5 月完全
 * 覆盖 9–10 月主语境——做，任务书裁决 1：真果 7–10 × 4–6mm ×2 → 果长
 * 0.014–0.020 × 果宽 0.008–0.012；每簇 8–12 果卡映射「数十果/序」视觉密度档——
 * 绝对数不承重；满冠带 q ≥ 0.30 + 位置散列 + 固定步长抽选的零 rng 确定性账目；
 * 扁平 quad 正反双面 4 tri/果卡；uv 果域 **v∈[4.0,4.97]** + u 逐果色档入皮组
 * （组 0））+ 灰褐细窄纵脊浅沟低浮雕树皮（第 12 语言，裁决 7：0.016/{5,7}/3.4
 * ——沟深低于樟、脊细于白蜡；主干 radial 16 承载细窄脊奈奎斯特域）——**无花资产**
 * （圆锥花序 5–7 月不覆盖 9–10 月主语境——任务书裁决 2 不做，几何/材质均无花账目
 * 与 v∈[5,7) uv 域）。
 *
 * 职责：D19 契约链上的 slot-0 锚点形态资产——build(params?) 以 mulberry32(params.seed)
 *      驱动全部分枝/叶簇随机量（**rng 消费顺序即契约**：同 seed 逐位同结果；核果
 *      挂点 = 确定性账目零 rng——消费全在骨架/簇/通透 roll），几何生成全部在
 *      ./tree/ligustrum/ligustrumGeometry（五级递归分枝 + 锥度枝干 + 末级枝**单叶卡
 *      decussate 对生簇**烘焙 + **肾形核果满冠下垂密簇**确定性抽选 + 冠内通透三
 *      规则 + 树皮近景微起伏——家族方法整体复制自 fraxinus；女贞算法细节与全部数值
 *      依据 docs/research/ligustrum-reference.md Spec 1.0（**生产一律以文末「主代理
 *      终审记档」修正后口径为准**：form-cn 整树主张已否证、整树锚 = form-d 单样木），
 *      逐字段注释见 ./tree/ligustrum/ligustrumShapeProfile。形态参数类型 = 阔叶家族
 *      契约 ./tree/broadleaf/broadleafShapeProfile 第十二实例；build 内做 morphSeed →
 *      slot → profile 路由（profileForSeed O(8) 纯查表，非槽种子回落 slot-0——公共
 *      签名不变，不扩 ProceduralBuild）。params.seed 缺省回落 slot-0 锚点 morphSeed
 *      （morphSeedOf('asset_tree_ligustrum', 0)——与 ProceduralSourceCache 传入值逐位
 *      一致：无参路径 = 缓存路径 = 同一棵锚点树）。尺度参照真实乔木：中龄城市个体锚
 *      ≈8m 高（终审裁决 2 维持——form-d 单整树样木 ≈8m 双系统一致 + NC 栽培域 4.6–
 *      15.2m + 25m 志书上限的中龄带，中档证据如实；与夏栎 ≈8/朴树 ≈8.5/香樟 ≈8.6/
 *      榉树 ≈8 同语境混植）；**8 槽带 7.08–8.50m 高 / 5.41–8.54m 宽**（proceduralProfile
 *      全槽实测带，2026-09-22 终测）；槽间树高差由各槽领导比定档（**Step 3 探针回调
 *      记档（2026-09-22，三轮）**：①初值树高域 7.5–8.3 + 领导 0.50 实测 slot-0 涌现
 *      8.82 偏 ≈8m 锚 +0.8——广卵上收链 + 中庸领导的纵向外泄，回调树高域 7.3–8.1 +
 *      领导 0.48 终测 slot-0 **8.41** 落锚域；②初值 crownWidthRatio 0.64 实测 w/h
 *      0.949 出主档上沿——**大卡（卡长至 0.34m）叶尖极值外泄系数 ≈ ×1.45**（vs
 *      白蜡小卡 ×1.19），回调 0.54 终测 slot-0 **w/h 0.822** 落 0.75–0.85 主档中带；
 *      ③slot-1/5 两轮回调（0.56→0.62→0.65 / 0.56→0.60→0.63 + 角域微调）终测 0.712/
 *      0.695 落窄端读向；**slot-0 视觉冠底/实高 0.301**（minY 2.53/8.41——干高占比
 *      ≈0.30 form-d + bark-b 双证的目标带；**Stage 与材质树高锚消费口径：实测涌现
 *      8.41 / 材质 nominal 8.0（LIGUSTRUM_TREE_HEIGHT_NOMINAL）——同步轮归
 *      ligustrumMaterials/Stage 侧**）；回调记档见 profile 各槽注释）；原点 = 底部
 *      中心 minY 精确 0。
 * 材质分层表（materialIndex → 部件 → 材质；配方在 ./tree/ligustrum/ligustrumMaterials
 *      ——park-shader-agent 并行交付，导出签名冻结（与 fraxinusMaterials 同构）：
 *      createLigustrumBarkMaterial / createLigustrumLeafMaterial /
 *      createLigustrumLeafDepthMaterial，均 (level?: ProceduralLevel) => 材质）：
 *      0 树皮 + 核果（主干+五级枝+底盖+肾形核果满冠下垂密簇——**核果入皮组：uv 果域
 *      标记 v∈[4,5] + u = 逐果色档**（2026-09-22 主代理终审裁定：派遣简报 u 轴系
 *      误写，对齐 triadica/sophora/fraxinus 族冻结口径 v 轴），材质按 v 域分流核果配方）——
 *        createLigustrumBarkMaterial(level)：灰褐细窄纵脊浅沟低浮雕（第 12 树皮语言，
 *        任务书裁决 7——几何侧仅主干起伏浮雕 + 抬档地板下分枝管光滑）+ 干面细纹浅色
 *        质感（fine maple-like）+ 小枝两档（当年生黄褐-红调 vs 老枝灰褐）+ 肾形核果
 *        域色序（绿-白绿未熟→紫黑蓝黑被白粉 + 肾形轮廓 + 白粉霜感——u 通道（翻转后
 *        自由轴，材质双轴容错判据自动路由））
 *      1 单叶卡（L4/L5 末级枝 decussate 对生簇烘焙）——
 *        createLigustrumLeafMaterial(level)：深绿革质强光泽基调（「上面光亮」FRPS
 *        Verified——**单面镜档**：背面无 glaucous 不提亮偏冷、两面色差弱档淡绿级，
 *        vs 樟「亮面+粉背」分化；roughness 档位调参沿 011.2 缺口 B 口径下限）+
 *        **卵形-长卵形-椭圆-宽椭圆单叶 SDF 全缘平坦零载波**（先端锐尖-渐尖变指数
 *        域 + 侧脉细弱不显近零信号 + 无腺窝无离基三出——叶材质面较樟简化；卡 v=0
 *        叶基 → v=1 叶尖、宽/长比域 1.7–2.8 变比例）+ aLeafRand 逐叶变奏 + 风动
 *        （aSeed 整树缓摆 + aBend 快颤；风动不进 depth pass）
 *      注：层间 mergeGeometries useGroups=true → 恰 2 组（皮 0 / 叶 1，D15 免组
 *      膨胀）；叶影裁切深度材质走 InstanceSource 契约通道 customDepthMaterial
 *      （T009.5 立契）：build 返回 createLigustrumLeafDepthMaterial(level)
 *      （档位匹配，分档语义在工厂内）。
 * 叶卡顶点属性（几何固有，冻结契约沿用）：aLeafRand（逐叶随机 ∈ [0,1)，同卡 6
 *      顶点同值；皮组（含核果卡）恒 0）、aBend（风动摆幅权重，卡内根→尖非降（叶基
 *      →叶尖）；皮组（含核果卡）恒 0）。
 * 边界：每次调用 new 全部 geometry/material/深度材质（所有权随调用移交调用方，
 *      缓存会 dispose，禁止模块级共享对象，D17）；不建模记档（Spec 有事实、本资产
 *      不表达）：单叶内部结构（形/缘/先端/脉/柄/两面色——归材质 SDF）；**花**（圆锥
 *      花序 8–20 × 8–25cm 顶生白 5–7 月——Verified，任务书裁决 2 不做：时窗错位）；
 *      果色序细档与宿存冬态（归材质 v 通道/风格层）；芽（Spec Unknown）；丛生多干相
 *      （form-b 归化林地）；f. latifolium 落叶变型；新叶红铜调（归材质变体轴）；树皮
 *      灰褐色调/细纹浅色质感/细鳞微翘/枝上皮孔（归材质层）；小枝两档色（归材质层）
 *      ——详见 ligustrumShapeProfile 模块头。
 * LOD（T011.11 三档交付，家族方法逐位复制自 fraxinus）：build 透传 params.level
 *      （缺省 'high'——旧无参路径逐位不变）到几何与皮/叶材质工厂；三档同 rng 流
 *      同骨架/簇位/果簇决策（档间不变量、Mid ⊂ High 掩码口径与发射计划见
 *      ligustrumGeometry 模块头；**核果簇 Mid 全量保留（身份信号——满冠下垂密簇
 *      中距可读）/ Low 省略**——先例 Low 果处理），材质档位变体与 customProgramCacheKey
 *      档位唯一在 ligustrumMaterials；levels 声明三档（D27 首版最小化 [{id}]——调度
 *      阈值归 Runtime 常量不进 Profile）。
 * LOD 预算锁定账目（预算制 D19.8——ligustrumGeometry 模块头引用此处）：锁定预算
 *      （三角形，皮 + 单叶卡 + 核果簇 = 总面）High ≤ 40000（家族行上沿语义，无绝对
 *      下沿——大卡中数量语义记档同先例口径）/ Mid 6000–10000 / Low 1500–3000——
 *      **家族行沿用**（docs/procedural-assets/lod-spec.md §5.2 阔叶乔木行，T009.6
 *      锁定不重开；本任务不回写家族表）。8 槽 × 3 档实测带（2026-09-22 终测，规范
 *      种子 = morphSeedOf(id, slot)）：High 总面 **31032–36458**（slot-6 疏松最低 /
 *      slot-7 丰满最高；单叶卡 2600–4931 × 2、核果簇 39–59 × 果卡 399–590 × 4 tri、
 *      保留簇 474 级/簇位 945）；Mid 总面 **7666–9846**（单叶卡 778–1486 ≈ High
 *      存活卡 × 0.30——单叶卡簇 10 选 3 掩码率 + 果簇全量保留；**STRIDE 6 探针定档
 *      记档**：STRIDE 5 实测 slot-2/7 Mid 越带上沿（10076/10260 > 10000）回调 6）；
 *      Low 总面 **2038–2746**（壳卡 = 保留簇 × 2 × 宽轴 0.44（单叶中位长宽比
 *      1/2.25）× 半幅——变比例域的档间剪影中位比例；核果簇省略记档）；皮恒
 *      24236 / 4514 / 370（High/Mid/Low——主干 14 段 ×16（**径向 16 承载细窄脊谐波
 *      {5,7}**）+ 底盖 16 + 五级 7/21/63/189/378 枝，拓扑 6 骨架 + 1 领导）；rng
 *      消费 slot-0 三档恒等 **85055**（快照锁）、跨槽随保留簇数浮动（通透 roll 计数
 *      机制，先例同款——核果挂点零 rng 无消费口径问题）；minY 三档恒 0；8 槽 w/h
 *      涌现带 **0.695–1.104**（slot-0 锚点 0.822 落 0.75–0.85 主档中带 / slot-1 卵圆
 *      窄端 0.712 + slot-5 高冠 0.695 窄端微出下沿记档 / slot-2 开展宽端 1.104 =
 *      form-a「开展端 1.0–1.2」读向）。
 */
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { buildLigustrumGeometry } from '../tree/ligustrum/ligustrumGeometry';
import { LIGUSTRUM_SHAPE_PROFILES } from '../tree/ligustrum/ligustrumShapeProfile';
import {
  createLigustrumBarkMaterial,
  createLigustrumLeafDepthMaterial,
  createLigustrumLeafMaterial,
} from '../tree/ligustrum/ligustrumMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_tree_ligustrum',
  name: '女贞',
  category: 'plant',
  tags: ['植物', '树', '女贞', 'Ligustrum lucidum', 'broadleaf'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 8 }, // D19：8 形态槽（T011.11 八槽形态向量全量交付）
  variants: { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 }, // 参照族内先例量级（D13 无新增依赖）
  triangleCount: 33770, // 实数 = slot-0 锚点 High 档结构计数（皮 24236 恒定 + 单叶卡 3827×2 + 核果 470 果卡 ×4；多档起声明面取细模档；见模块头预算锁定账目）
  levels: [{ id: 'high' }, { id: 'mid' }, { id: 'low' }], // LOD 三档（D27 首版最小化 [{id}]——阈值归 Runtime 常量，不进 Profile）
  taxonomy: { category: 'plant', family: 'broadleaf' }, // 阔叶家族契约第十二实例（tree/broadleaf/，T010.1；木犀科（Oleaceae）被子植物按家族形态域归 broadleaf——常绿阔叶第二例（香樟后）、家族首例对生单叶挂点语言，记档见资产模块头）
  proceduralProfile: {
    // 跨 8 槽细模包围盒实测带（T011.11 终测 2026-09-22：h 7.08–8.50 / w 5.41–8.54，
    // 声明带外沿放宽——实测带全含）。
    // 物种锚 slot-0 ≈8.4m 高 / 6.9m 冠幅 / w-h 比 0.822（≈8m 中龄城市个体——终审
    // 裁决 2 维持：form-d 单整树样木双系统一致 + NC 栽培域中龄带；与夏栎 ≈8/朴树
    // ≈8.5/香樟 ≈8.6/榉树 ≈8 同语境混植）；槽间差异（slot-1 卵圆窄端 8.12 纵长 /
    // slot-2 开展宽端 7.74 扁宽 w-h 1.104 = form-a「开展端」读向 / slot-5 高冠 /
    // slot-4 低冠视觉冠底差同 seed 实测见 ligustrumShapeSlots 测试注释）
    heightRange: { min: 7.0, max: 8.6 },
    widthRange: { min: 5.3, max: 8.7 },
  },
};

/**
 * morphSeed → shapeProfile 路由（T011.11 八槽形态向量）：枚举 8 槽 morphSeedOf
 * 逐位比对还原 slot 索引（O(8) 纯查表，确定性）；非槽种子（如测试直传任意 seed）
 * 与未填槽一并回落 slot-0 标准组合（先例前后行为兼容同构）。**不扩展
 * ProceduralBuild 公共签名**。
 */
function profileForSeed(seed: number) {
  for (let slot = 0; slot < 8; slot++) {
    if (seed === morphSeedOf(meta.id, slot)) return LIGUSTRUM_SHAPE_PROFILES[Math.min(slot, LIGUSTRUM_SHAPE_PROFILES.length - 1)]!;
  }
  return LIGUSTRUM_SHAPE_PROFILES[0]!;
}

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.seed = morphSeed（SourceCache 传 morphSeedOf(assetId, slot)；缺省 = slot-0 锚点）
  const seed = params?.seed ?? morphSeedOf(meta.id, 0);
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧路径逐位不变；
  // 不参与 shapeSlot/morphSeed/sourceKey 形态身份——档位缓存维度归 ProceduralSourceCache）
  const level = params?.level ?? 'high';
  const rng = mulberry32(seed);
  const { geometry } = buildLigustrumGeometry(rng, profileForSeed(seed), level);
  const bark = createLigustrumBarkMaterial(level); // 组 0（契约序 [皮+核果, 单叶卡]——mergeGeometries 层序；核果按 v∈[4,5] 果域标记入皮组，材质按域分流核果配方）
  const leaf = createLigustrumLeafMaterial(level);
  // 影 pass 叶影裁切走 InstanceSource 契约通道——工厂每次 new（build 契约「每次调用
  // new 全部资源」天然满足），档位随 level 匹配；归源所有（缓存 dispose）
  return {
    geometry,
    material: [bark, leaf],
    customDepthMaterial: createLigustrumLeafDepthMaterial(level),
  };
}
