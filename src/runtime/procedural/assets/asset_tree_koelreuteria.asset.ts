/**
 * runtime/procedural/assets/asset_tree_koelreuteria.asset —— 程序化植物资产：栾树
 * （Koelreuteria bipinnata Franchet 复羽叶栾树 FOC 广义，T011.6 阔叶家族第七实例
 * ——方法复制自悬铃木 asset_tree_platanus（最新方法模板），公园单干中龄个体 ≈10m：
 * **复叶卡挂点（家族复叶首例）+ 开展圆头-伞形冠 + 夏花秋果双信号**——挂点语言/冠形/
 * 花果三重身份与六先例分化最大的实例；生产主力相 = 黄山栾树相（FRPS var.
 * integrifoliola 口径小叶全缘，FOC Vol.12 并入 K. bipinnata——种定名判据链见 Spec §1
 * 终审裁决 6）。
 *
 * 职责：D19 契约链上的 slot-0 锚点形态资产——build(params?) 以 mulberry32(params.seed)
 *      驱动全部分枝/叶簇随机量（**rng 消费顺序即契约**：同 seed 逐位同结果；**花果
 *      挂点零 rng**——确定性账目法（保留 L5 簇位百分位高度带 + 位置散列排序 + 固定
 *      步长抽选），vs platanus 果序 rng roll 先例的组 0 带状浮动规避记档），几何生成
 *      全部在 ./tree/koelreuteria/koelreuteriaGeometry（五级递归分枝 + 锥度枝干 +
 *      末级枝**复叶卡**疏簇烘焙 + 顶生圆锥**花序交叉卡**（夏花）+ 冠缘**灯笼蒴果串**
 *      （秋果）+ 冠内通透三规则 + 树皮近景微起伏——家族方法整体复制；栾树算法细节：
 *      **复叶卡挂点语言**（家族复叶首例——1 卡承载整枚二回羽叶（总长 45–70cm
 *      Verified [2][4] × ≈1.4 工程映射 → 卡宽 0.38–0.56 × 长/宽 1.6667 **恒比例冻结
 *      0.60**；分卡方案 35–70 小叶卡爆预算 vs 单卡 2 tri 的三判据裁定——小叶结构归
 *      材质 SDF 层）+ 黄金角互生螺旋簇内方位 + 平展取向 + 大簇大间距疏排）、**开展
 *      圆头-伞形冠**（低挂高段 0.55–0.73 + 广角 40–56° + ascending→arching 外弯
 *      漂移（外向 0.34 + 下垂 0.10 随 t 增强，确定性零 rng）+ 七实例首个含负 upturn 链
 *      （L5 −0.02 枝梢微下垂 [8][9]）——涌现 w/h 0.710–0.979 全槽落工程域 0.7–1.0）、
 *      **夏花秋果双信号**（花 = 冠面上部第 55 百分位带 + 上抬 0.26–0.50m 高出叶幕、
 *      每序一对交叉竖卡（宽/长比 0.65 冻结）、uv v∈[5.0,5.95] 花域；果 = 冠缘中下
 *      第 50 百分位以下、八面体灯笼 8 tri/果（径 8.4–14cm = 真蒴果 4–7 × 3.5–5cm
 *      中值 5.5×4.2 × 2 工程映射）、下垂弧链 5–6 灯笼/串、uv v∈[6.0,6.97] 果域
 *      u = 逐果色档（色序多代并存）——**均入皮组（组 0）** + 隔离带 v∈[4,5) 空
 *      （platanus 66 顶点碰撞先例教训——探针断言在 koelreuteriaStructure 测试锁））、
 *      干高 0.26–0.32（trunk_height_ratio Unknown + form-b ≈2m 低分枝单源弱方向）、
 *      **浅色光滑树皮浅浮雕最浅档**（0.013/{3,5,6}/5——主代理补充证据终版 bark-b：
 *      浅灰白-灰褐光滑 + 密布皮孔麻点 + 局部浅细纵裂 + 无剥落；皮孔麻点主体在材质层，
 *      几何仅主干有效起伏（L1 起径 0.09–0.11 < 0.115 亚视觉地板））——全部数值依据
 *      docs/research/koelreuteria-reference.md Spec 1.0（生产一律以文末「终审记档」④
 *      生产口径终版 + 「主代理补充证据记档」为准：复叶计数域裁决 2 / 花果覆盖率
 *      裁决 3 / 果尺寸锚文献裁决 4 / 树高锚 10m 保守 9–11 裁决 7 / 树皮主代理终版 /
 *      多干记档不建模），逐字段注释见 ./tree/koelreuteria/koelreuteriaShapeProfile。
 *      形态参数类型 = 阔叶家族契约 ./tree/broadleaf/broadleafShapeProfile 第七实例；
 *      build 内做 morphSeed → slot → profile 路由（profileForSeed O(8) 纯查表，非槽
 *      种子回落 slot-0——公共签名不变，不扩 ProceduralBuild）。params.seed 缺省回落
 *      slot-0 锚点 morphSeed（morphSeedOf('asset_tree_koelreuteria', 0)——与
 *      ProceduralSourceCache 传入值逐位一致：无参路径 = 缓存路径 = 同一棵锚点树）。
 *      尺度参照真实乔木：中龄公园个体锚 ≈10m 高（主代理裁定——8–12m 弱 Inferred
 *      收口 9–11 默认 10，终审裁决 7；速生上探 12 变体入 slot-1）；8 槽带 9.82–11.44m
 *      高 / 8.13–9.89m 宽（proceduralProfile 全槽实测带，2026-09-21 终测——花果挂点
 *      确定性零 rng 账目法定稿后的 rng 流）；槽间树高差由各槽领导比回调定档（10m 级
 *      领导链复利外伸 ≈×1.8 的种子实现差异——回调记档见 profile 各槽注释）；
 *      原点 = 底部中心 minY 精确 0。
 * 材质分层表（materialIndex → 部件 → 材质；配方在 ./tree/koelreuteria/
 *      koelreuteriaMaterials——park-shader-agent 并行交付，导出签名冻结（与
 *      platanusMaterials 同构）：createKoelreuteriaLeafMaterial /
 *      createKoelreuteriaBarkMaterial / createKoelreuteriaLeafDepthMaterial，均
 *      (level?: ProceduralLevel) => 材质）：
 *      0 树皮（主干+五级枝+底盖+**花卡+灯笼果**）—— createKoelreuteriaBarkMaterial
 *        (level)：浅色光滑 + 皮孔麻点 + 局部浅细纵裂（bark-b 双系统补证 + FRPS
 *        「皮孔圆形至椭圆形」「枝具小疣点」Verified [2]——七资产第 7 树皮语言，vs 朴树
 *        平滑-浅裂小斑块：分化点 = 皮孔麻点密度 + 浅色粉质感）；**按 uv v 域分流花/
 *        果配方**（花 v∈[5,6) 金黄团块 + 瓣基橙红斑、果 v∈[6,7] 鲑粉-玫红-褐多色档
 *        （u = 逐果色档通道）——材质侧冻结接口）；深度材质皮组 aLeafRand=0 实心守卫
 *        覆盖花果影
 *      1 复叶卡（L4/L5 末级枝疏簇烘焙）—— createKoelreuteriaLeafMaterial(level)：
 *        中绿复叶基调（正面中绿/背面浅绿灰绿密短柔毛 Verified [2][4]）+ **复叶 SDF**
 *        （二回羽状：主轴 + 羽片 4–5(–6) 对 × 每羽片 5–7(–9) 枚 + 顶生小叶、小叶斜卵
 *        形全缘主力↔细齿变体——沿卡 v 轴排布，家族复叶首例的材质侧表达）+ aLeafRand
 *        逐叶变奏 + 风动（aSeed 整树缓摆 + aBend 快颤——复叶整体摆 + 小叶颤双层）
 *      注：层间 mergeGeometries useGroups=true → 恰 2 组（皮 0 / 叶 1，D15 免组膨胀）；
 *      **花果入皮组（组 0）**——koelreuteriaGeometry 模块头记档的冻结接口（uv v 域
 *        身份标记 + aLeafRand/aBend 随组恒 0——花穗/果串刚性悬垂，摆动语义归材质层/
 *        缺口候选）；叶影裁切深度材质走 InstanceSource 契约通道 customDepthMaterial
 *        （T009.5 立契）：build 返回 createKoelreuteriaLeafDepthMaterial(level)
 *        （档位匹配，分档语义在工厂内）。
 * 叶卡顶点属性（几何固有，冻结契约沿用）：aLeafRand（逐叶随机 ∈ [0,1)，同卡 6 顶点
 *      同值；皮组含花果恒 0）、aBend（风动摆幅权重，卡内根→尖非降；皮组含花果恒 0）。
 * 边界：每次调用 new 全部 geometry/material/深度材质（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象，D17）；不建模记档（Spec 有事实、本资产不表达）：
 *      小叶结构（羽片对数/每羽片枚数/斜卵形/全缘↔内弯细齿/近无柄/基部偏斜——归材质
 *      SDF）、花瓣 4 与瓣基橙红斑（归材质）、蒴果色序细节与膜质网纹（归材质 u 通道）、
 *      花序-果序分支结构（卡/串抽象）、秋色黄、冬态宿存干果、多干丛生（现象 Verified
 *      [9][12] 频率 Unknown——结构差异不落连续参数记档）、幼态一回羽状叶（单源
 *      Unknown）、芽（Unknown）、新叶色（Unknown）、小枝疣点皮孔与红褐一年生枝（归
 *      材质）——详见 koelreuteriaShapeProfile 模块头。
 * LOD（T011.6 三档交付，家族方法逐位复制）：build 透传 params.level（缺省 'high'——
 *      旧无参路径逐位不变）到几何与皮/叶材质工厂；三档同 rng 流同骨架/簇位/花果决策
 *      （档间不变量、Mid ⊂ High 掩码口径与发射计划见 koelreuteriaGeometry 模块头），
 *      材质档位变体与 customProgramCacheKey 档位唯一在 koelreuteriaMaterials；levels
 *      声明三档（D27 首版最小化 [{id}]——调度阈值归 Runtime 常量不进 Profile）。
 * LOD 预算锁定账目（预算制 D19.8——koelreuteriaGeometry 模块头引用此处）：锁定预算
 *      （三角形，皮 + 复叶卡 + 花序 + 果串 = 总面）High ≤ 40000 且 ≥ 24000（栾树参考
 *      下沿——复叶大卡低数量语义：单卡面积 ≈0.36m² 中值 vs 悬铃木 0.10 ×3.6、真复叶
 *      45–70cm 即六资产最大单叶 ×≈3，同覆盖率下卡数天然低，密度语义由大卡覆盖率承载
 *      ——记档同 platanus/银杏先例口径）/ Mid 6000–10000 / Low 1500–3000——**家族行
 *      沿用**（docs/procedural-assets/lod-spec.md §5.2 阔叶乔木行，T009.6 锁定不重开；
 *      本任务不回写家族表）。8 槽 × 3 档实测带（2026-09-21 终测，规范种子——花果
 *      挂点确定性零 rng 账目法定稿后的 rng 流）：High 总面 24134–24680（slot-6 疏松
 *      最低 / slot-4 低冠果串最重最高；复叶卡 664–865 × 2 + 花序 39–47 序 × 4 + 灯笼
 *      216–251 × 8、保留簇 301–339/簇位 810）；Mid 总面 6318–6642（复叶卡 216–291 ≈
 *      High 存活卡 × 0.33——疏簇 3 选 1 掩码率 + 花果全量保留（身份信号 [12]））；
 *      Low 总面 1534–1686（壳卡 = 保留簇 × 2、花果省略记档——Low 观距亚像素）；皮恒
 *      20782 / 3882 / 330（High/Mid/Low——主干 14 段 ×14 + 底盖 14 + 五级 6/18/54/
 *      162/324 枝，拓扑 5 骨架 + 1 领导）；rng 消费 slot-0 三档恒等 28444（快照锁）、
 *      跨槽 28441–28555 ±0.2%（通透 roll 计数机制，六先例同款——花果零 rng 无消费
 *      口径问题）；minY 三档恒 0。
 */
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { buildKoelreuteriaGeometry } from '../tree/koelreuteria/koelreuteriaGeometry';
import { KOELREUTERIA_SHAPE_PROFILES } from '../tree/koelreuteria/koelreuteriaShapeProfile';
import {
  createKoelreuteriaBarkMaterial,
  createKoelreuteriaLeafDepthMaterial,
  createKoelreuteriaLeafMaterial,
} from '../tree/koelreuteria/koelreuteriaMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_tree_koelreuteria',
  name: '栾树',
  category: 'plant',
  tags: ['植物', '树', '栾树', '复羽叶栾树', '黄山栾树', '灯笼树', 'broadleaf'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 8 }, // D19：8 形态槽（T011.6 八槽形态向量全量交付）
  variants: { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 }, // 参照朴树/香樟/榉树/银杏/悬铃木量级（D13 无新增依赖）
  triangleCount: 24268, // 实数 = slot-0 锚点 High 档结构计数（皮 20782 恒定 + 复叶卡 793×2 + 花序 43 序×4 + 灯笼 216×8；多档起声明面取细模档；见模块头预算锁定账目）
  levels: [{ id: 'high' }, { id: 'mid' }, { id: 'low' }], // LOD 三档（D27 首版最小化 [{id}]——阈值归 Runtime 常量，不进 Profile）
  taxonomy: { category: 'plant', family: 'broadleaf' }, // 阔叶家族契约第七实例（tree/broadleaf/，T010.1；无患子科（Sapindaceae）被子植物按家族形态域归 broadleaf——落叶阔叶第四例、复叶首例，记档见资产模块头）
  proceduralProfile: {
    // 跨 8 槽细模包围盒实测带（T011.6 终测 2026-09-21：h 9.82–11.44 / w 8.13–9.89）。
    // 物种锚 slot-0 ≈9.9m 高 / 8.7m 冠幅 / w-h 比 0.877（≈10m 中龄公园个体——主代理
    // 裁定，8–12m 弱 Inferred 收口 9–11 默认 10 per 终审裁决 7；与夏栎 ≈8/朴树 ≈8.5/
    // 香樟 ≈8.6/榉树 ≈8/银杏 ≈8.2/悬铃木 ≈12 同语境混植的中量级——速生上探 12 变体
    // 入 slot-1 终测 11.44 为 8 槽最高）；槽间差异（slot-1 速生窄端 w/h 0.710 贴下沿 /
    // slot-2 老龄开张伞形端 w/h 0.979 贴上沿——冠幅比工程域 0.7–1.0 内两端；slot-4
    // 低冠视觉冠底 0.093 / slot-5 高冠 0.223——干高 Unknown 域两侧展开，记档见
    // koelreuteriaShapeProfile 各槽注释）
    heightRange: { min: 9.8, max: 11.5 },
    widthRange: { min: 8.1, max: 9.9 },
  },
};

/**
 * morphSeed → shapeProfile 路由（T011.6 八槽形态向量）：枚举 8 槽 morphSeedOf 逐位比对
 * 还原 slot 索引（O(8) 纯查表，确定性）；非槽种子（如测试直传任意 seed）与未填槽一并
 * 回落 slot-0 标准组合（六先例前后行为兼容同构）。**不扩展 ProceduralBuild 公共签名**。
 */
function profileForSeed(seed: number) {
  for (let slot = 0; slot < 8; slot++) {
    if (seed === morphSeedOf(meta.id, slot)) return KOELREUTERIA_SHAPE_PROFILES[Math.min(slot, KOELREUTERIA_SHAPE_PROFILES.length - 1)]!;
  }
  return KOELREUTERIA_SHAPE_PROFILES[0]!;
}

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.seed = morphSeed（SourceCache 传 morphSeedOf(assetId, slot)；缺省 = slot-0 锚点）
  const seed = params?.seed ?? morphSeedOf(meta.id, 0);
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧路径逐位不变；
  // 不参与 shapeSlot/morphSeed/sourceKey 形态身份——档位缓存维度归 ProceduralSourceCache）
  const level = params?.level ?? 'high';
  const rng = mulberry32(seed);
  const { geometry } = buildKoelreuteriaGeometry(rng, profileForSeed(seed), level);
  const bark = createKoelreuteriaBarkMaterial(level); // 组 0（契约序 [皮, 复叶卡]——mergeGeometries 层序；花卡+灯笼果并入皮组（uv v 域身份标记），材质接口记档见模块头）
  const leaf = createKoelreuteriaLeafMaterial(level);
  // 影 pass 叶影裁切走 InstanceSource 契约通道——工厂每次 new（build 契约「每次调用 new
  // 全部资源」天然满足），档位随 level 匹配；归源所有（缓存 dispose）
  return {
    geometry,
    material: [bark, leaf],
    customDepthMaterial: createKoelreuteriaLeafDepthMaterial(level),
  };
}
