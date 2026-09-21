/**
 * runtime/procedural/assets/asset_tree_triadica.asset —— 程序化植物资产：乌桕
 * （Triadica sebifera (Linnaeus) Small，T011.7 阔叶家族第八实例——方法复制自栾树
 * asset_tree_koelreuteria / 悬铃木 asset_tree_platanus（最新方法模板），长江流域城市
 * 公园夏绿单干中龄个体 ≈9.5m：**菱形中卡互生散布挂点 + 开展圆头冠 + 绿闭蒴果序弯垂
 * 轴**——挂点语言/冠形/果序三重身份；大戟科乌桕属（FOC Vol.11 现口径，旧口径
 * Sapium sebiferum 记档见 Spec §1）；建模目标相 = 生长季夏季绿叶相（秋色红/白蜡
 * 种子相记档不建模）。
 *
 * 职责：D19 契约链上的 slot-0 锚点形态资产——build(params?) 以 mulberry32(params.seed)
 *      驱动全部分枝/叶簇随机量（**rng 消费顺序即契约**：同 seed 逐位同结果；**果序
 *      挂点零 rng**——确定性账目法（保留 L5 簇位冠外域判据 q ≥ 0.40 + 位置散列排序
 *      + 固定步长抽选），vs platanus 果序 rng roll 先例的组 0 带状浮动规避记档），
 *      几何生成全部在 ./tree/triadica/triadicaGeometry（五级递归分枝 + 锥度枝干 +
 *      末级枝菱形中卡散簇烘焙 + 绿闭蒴果序弯垂轴 + 冠内通透三规则 + 树皮近景微起伏
 *      ——家族方法整体复制；乌桕算法细节：**互生单叶「中卡簇」挂点**（单叶互生散生
 *      非簇生 Verified [1][3][7]——黄金角互生螺旋簇内方位 + 菱形中卡 0.08–0.14 ×
 *      长宽比 0.80–1.20 近等宽（FOC "nearly as long as wide" Verified [4]——家族
 *      第七种叶形语言）+ 每簇 8 候选中量合并抽象 + 长柄平展摊开取向）、**开展圆头
 *      冠**（干向挂点分级（低枝 ×1.06 平展 +12…14° / 高枝 ×0.74 收角 −6…−8°）+
 *      广角骨架 50–68°（FRPS「枝广展」Verified [1]）+ 散布互生方位 + 领导中庸偏弱
 *      0.44 + 末级 upturn 低值承载冠缘平展/微垂读向——涌现 w/h 0.861 ∈ 工程域
 *      0.8–1.0）、**绿闭蒴果序**（Spec 判定做 Verified [1][3][5][7]——夏季相绿闭
 *      小蒴果径 ≈2.4–3.0cm（真径 1–1.5cm ×2 工程映射）、沿弯垂总状轴散挂枝顶/冠缘
 *      外段、每轴 2–4 果步距 0.09–0.13 非密串、八面体 8 tri/果（实测 60–84 果/树）；**账目入皮组（组
 *      0）**：果序顶点 uv v∈[4,5] 果域 + u = 逐果熟度 + aBend/aLeafRand 随皮组恒 0；
 *      皮管弧长域不得侵入 [4,5)（隔离带断言在 triadicaStructure 测试锁）；Mid 保留 /
 *      Low 省略记档）、净干 0.17–0.26（form-a 低分枝单源 Inferred + 主代理带内推）
 *      、暗灰窄纵裂树皮中-深浮雕（0.027/{3,4,5}/2.8——窄纵脊连续族；暗色调/窄条翘皮
 *      /幼干灰绿主体在 triadicaMaterials 材质层）——全部数值依据
 *      docs/research/triadica-reference.md Spec 1.0 生产取用版（正文 + 终审记档：
 *      树高锚 ≈9.5m 主代理裁定、外缘微垂不建下垂语言、冠幅比 0.8–1.0 维持），逐字段
 *      注释见 ./tree/triadica/triadicaShapeProfile。形态参数类型 = 阔叶家族契约
 *      ./tree/broadleaf/broadleafShapeProfile 第八实例；build 内做 morphSeed → slot →
 *      profile 路由（profileForSeed O(8) 纯查表，非槽种子回落 slot-0——公共签名不变，
 *      不扩 ProceduralBuild）。params.seed 缺省回落 slot-0 锚点 morphSeed
 *      （morphSeedOf('asset_tree_triadica', 0)——与 ProceduralSourceCache 传入值逐位
 *      一致：无参路径 = 缓存路径 = 同一棵锚点树）。
 *      尺度参照真实乔木：长江流域公园夏绿中龄个体锚 ≈9.5m 高 / ≈8.2m 冠幅（主代理
 *      裁定——终审 9–10m 带内中值；slot-0 实测 9.52m 高 / 8.20m 宽 / w-h 比 0.861；
 *      速生开展等幅冠：与栾树 ≈10m 相当、低于悬铃木 12m、高于夏栎 8m；8 槽带
 *      9.08–10.14m 高 / 6.36–9.57m 宽——proceduralProfile 全槽实测带；槽间树高差由
 *      各槽领导比回调定档（9.5m 级领导链复利外伸的种子实现差异——回调记档见
 *      profile 各槽注释））；原点 = 底部中心 minY 精确 0。
 * 材质分层表（materialIndex → 部件 → 材质；配方在 ./tree/triadica/triadicaMaterials
 *      ——park-shader-agent 并行交付，导出签名冻结（与 koelreuteria/platanusMaterials
 *      同构）：createTriadicaLeafMaterial / createTriadicaBarkMaterial /
 *      createTriadicaLeafDepthMaterial，均 (level?: ProceduralLevel) => 材质）：
 *      0 树皮（主干+五级枝+底盖+**绿闭蒴果序**）—— createTriadicaBarkMaterial(level)：
 *        暗灰-灰褐窄纵裂 + 窄条翘皮（FRPS「树皮暗灰色，有纵裂纹」Verified [1] + NC
 *        "peel off in vertical, narrow strips" [5]——第 8 树皮语言（乌桕 = 第八实例：
 *        夏栎1 朴2 樟3 榉4 银杏5 悬铃木6 栾树7 乌桕8）；vs 夏栎/樟深纵裂
 *        无翘皮、榉/悬大片剥落、栾浅色光滑皮孔：分化点 = 暗色调 + 窄条翘皮 + 幼干灰绿
 *        龄级反差；**按 uv v 域分流**：v < 4 皮管域纵裂翘皮配方、v∈[4,5] 果域绿闭果
 *        配方（u = 逐果熟度通道：绿 → 转黑前夜梯度 [1][5]）——材质侧冻结接口）；
 *        深度材质皮组 aLeafRand=0 实心守卫天然覆盖果影
 *      1 叶簇卡（L4/L5 末级枝散簇烘焙）—— createTriadicaLeafMaterial(level)：正面
 *        中绿-深绿有光泽/背面稍浅（非粉绿级 Verified [5][6]）+ **菱形叶 SDF**（菱形/
 *        菱状卵形、全缘、先端骤尖长尾尖、基部阔楔-钝或浅心——Spec §4 Verified
 *        [1][3][4]，家族第七种叶形语言）+ 脉纹偏黄（NC "Conspicuous yellow veins"
 *        [5]）+ **叶柄与柄顶 2 腺体**（毫米级近景——triadicaMaterials 承载，几何不建）
 *        + 新叶铜红 flush 冠内零星点缀（材质变奏候选）+ aLeafRand 逐叶变奏 + 风动
 *        （aSeed 整树缓摆 + aBend 快颤——长柄叶颤动飘逸感）
 *      注：层间 mergeGeometries useGroups=true → 恰 2 组（皮 0 / 叶 1，D15 免组膨胀）；
 *      **果序入皮组（组 0）**——triadicaGeometry 模块头记档的冻结接口（uv v 域身份
 *        标记 + aLeafRand/aBend 随组恒 0——果序刚性悬垂，摆动语义归材质层）；叶影
 *        裁切深度材质走 InstanceSource 契约通道 customDepthMaterial（T009.5 立契）：
 *        build 返回 createTriadicaLeafDepthMaterial(level)（档位匹配，分档语义在工厂内）。
 * 叶卡顶点属性（几何固有，冻结契约沿用）：aLeafRand（逐叶随机 ∈ [0,1)，同卡 6 顶点
 *      同值；皮组含果序恒 0）、aBend（风动摆幅权重，卡内根→尖非降；皮组含果序恒 0
 *      ——果序刚性悬垂记档）。
 * 边界：每次调用 new 全部 geometry/material/深度材质（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象，D17）；不建模记档（Spec 有事实、本资产不表达）：
 *      菱形轮廓细节/骤尖尾头/全缘/基部相轴/侧脉网结（归材质 SDF）、叶柄与柄顶 2 腺体
 *      （归材质层）、托叶、花（判定不做——黄绿穗弱显著）、白蜡种子相（非夏季主相）、
 *      秋色红、新叶铜红（归材质变奏）、小枝亮绿皮孔色序（归材质）、地衣银斑（归材质
 *      候选）、多干萌生（记档不建模）、乳状汁液毒性（非形态）——详见
 *      triadicaShapeProfile 模块头。
 * LOD（T011.7 三档交付，家族方法逐位复制）：build 透传 params.level（缺省 'high'——
 *      旧无参路径逐位不变）到几何与皮/叶材质工厂；三档同 rng 流同骨架/簇位/果序决策
 *      （档间不变量、Mid ⊂ High 掩码口径与发射计划见 triadicaGeometry 模块头），材质
 *      档位变体与 customProgramCacheKey 档位唯一在 triadicaMaterials；levels 声明三档
 *      （D27 首版最小化 [{id}]——调度阈值归 Runtime 常量不进 Profile）。
 * LOD 预算锁定账目（预算制 D19.8——triadicaGeometry 模块头引用此处）：锁定预算
 *      （三角形，皮 + 叶卡 + 果序 = 总面）High ≤ 40000 且 ≥ 29000（乌桕参考下沿
 *      ——中卡中量语义：单卡面积 ≈0.011m² 中值、同覆盖率下卡数天然高于大卡资产，
 *      密度语义由中卡数量承载，记档同 platanus/栾树先例口径）/ Mid 6000–10000 /
 *      Low 1500–3000——**家族行沿用**（docs/procedural-assets/lod-spec.md §5.2 阔叶
 *      乔木行，T009.6 锁定不重开；本任务不回写家族表）。8 槽 × 3 档实测带
 *      （2026-09-21 终测，规范种子）：High 总面 29862–32786（slot-6 疏松最低 /
 *      slot-2 丰满最高；叶卡 2578–3980 ×2 + 果序 60–84 果 ×8（19–28 轴）、保留簇
 *      472–584）、Mid 总面 6968–8128（叶卡 963–1483 ≈ High 存活卡 × 0.375——中卡簇
 *      8 选 3 掩码率 + 果序全量保留）、Low 总面 2258–2706（壳卡 = 保留簇 × 2、果序
 *      省略记档）；皮恒 24178 / 4514 / 370（High/Mid/Low——主干 14 段 ×14 + 底盖 14 +
 *      五级 7/21/63/189/378 枝，拓扑 6 骨架 + 1 领导）；rng 消费槽内三档恒等
 *      （slot-0 快照 74592；跨槽随保留簇数变化 73696–74592 ±0.6%——通透 roll 计数
 *      机制，七先例同款；果序零 rng 无消费口径问题）；minY 三档恒 0。
 */
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { buildTriadicaGeometry } from '../tree/triadica/triadicaGeometry';
import { TRIADICA_SHAPE_PROFILES } from '../tree/triadica/triadicaShapeProfile';
import { createTriadicaBarkMaterial, createTriadicaLeafDepthMaterial, createTriadicaLeafMaterial } from '../tree/triadica/triadicaMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_tree_triadica',
  name: '乌桕',
  category: 'plant',
  tags: ['植物', '树', '乌桕', '桕子树', '木子树', 'broadleaf'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 8 }, // D19：8 形态槽（T011.7 八槽形态向量全量交付）
  variants: { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 }, // 参照朴树/香樟/榉树/银杏/悬铃木/栾树量级（D13 无新增依赖）
  triangleCount: 32574, // 实数 = slot-0 锚点 High 档结构计数（皮 24178 恒定 + 散簇叶卡 3862×2 + 果序 84 果×8；多档起声明面取细模档；见模块头预算锁定账目）
  levels: [{ id: 'high' }, { id: 'mid' }, { id: 'low' }], // LOD 三档（D27 首版最小化 [{id}]——阈值归 Runtime 常量，不进 Profile）
  taxonomy: { category: 'plant', family: 'broadleaf' }, // 阔叶家族契约第八实例（tree/broadleaf/，T010.1；大戟科（Euphorbiaceae）被子植物按家族形态域归 broadleaf——落叶阔叶第五例、菱形叶首例，记档见资产模块头）
  proceduralProfile: {
    // 跨 8 槽细模包围盒实测带（T011.7 终测 2026-09-21：h 9.08–10.14 / w 6.36–9.57）。
    // 物种锚 slot-0 = 9.52m 高 / 8.20m 冠幅 / w-h 比 0.861（≈9.5m 长江流域公园夏绿中龄
    // 个体——主代理裁定，终审 9–10m 带内中值；速生开展等幅冠——与夏栎 ≈8/朴树 ≈8.5/
    // 香樟 ≈8.6/榉树 ≈8/银杏 ≈8.2/悬铃木 ≈12/栾树 ≈10 同语境混植的中量级）；槽间差异
    // （slot-1 幼相窄端 w/h 0.700 微出下沿记档 / slot-2 老龄开展端 w/h 0.953 / slot-7
    // 丰满端 0.986——冠幅比工程域 0.8–1.0 带内展开；slot-4 低冠视觉冠底 0.139 / slot-5
    // 高冠 0.207——净干带 0.15–0.30 两侧展开，记档见 triadicaShapeProfile 各槽注释）
    heightRange: { min: 9.0, max: 10.2 },
    widthRange: { min: 6.3, max: 9.7 },
  },
};

/**
 * morphSeed → shapeProfile 路由（T011.7 八槽形态向量）：枚举 8 槽 morphSeedOf 逐位比对
 * 还原 slot 索引（O(8) 纯查表，确定性）；非槽种子（如测试直传任意 seed）与未填槽一并
 * 回落 slot-0 标准组合（七先例前后行为兼容同构）。**不扩展 ProceduralBuild 公共签名**。
 */
function profileForSeed(seed: number) {
  for (let slot = 0; slot < 8; slot++) {
    if (seed === morphSeedOf(meta.id, slot)) return TRIADICA_SHAPE_PROFILES[Math.min(slot, TRIADICA_SHAPE_PROFILES.length - 1)]!;
  }
  return TRIADICA_SHAPE_PROFILES[0]!;
}

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.seed = morphSeed（SourceCache 传 morphSeedOf(assetId, slot)；缺省 = slot-0 锚点）
  const seed = params?.seed ?? morphSeedOf(meta.id, 0);
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧路径逐位不变；
  // 不参与 shapeSlot/morphSeed/sourceKey 形态身份——档位缓存维度归 ProceduralSourceCache）
  const level = params?.level ?? 'high';
  const rng = mulberry32(seed);
  const { geometry } = buildTriadicaGeometry(rng, profileForSeed(seed), level);
  const bark = createTriadicaBarkMaterial(level); // 组 0（契约序 [皮, 叶]——mergeGeometries 层序；绿闭蒴果序并入皮组（uv v 域身份标记），材质接口记档见模块头）
  const leaf = createTriadicaLeafMaterial(level);
  // 影 pass 叶影裁切走 InstanceSource 契约通道——工厂每次 new（build 契约「每次调用 new
  // 全部资源」天然满足），档位随 level 匹配；归源所有（缓存 dispose）
  return {
    geometry,
    material: [bark, leaf],
    customDepthMaterial: createTriadicaLeafDepthMaterial(level),
  };
}
