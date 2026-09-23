/**
 * runtime/procedural/assets/asset_tree_salix.asset —— 程序化植物资产：垂柳
 * （Salix babylonica L. 杨柳科柳属落叶乔木——定名三差分见 salixShapeProfile 模块头：
 * 小枝淡褐黄/淡褐带紫（vs 绦柳黄色）+ 叶狭披针-线状披针（长宽比 ≥8 vs 旱柳系披针
 * 4–8）+ 叶背浅绿带绿（vs 苍白-带白）〔FRPS 20(2):138 / FOC Vol.4 Verified〕），
 * T011.12 阔叶家族第十三实例——方法复制自女贞 asset_tree_ligustrum（**最直接模板：
 * 第十二实例化最新世代**——互生挂点黄金角螺旋 / 8 槽差量 / LOD 三档发射计划 /
 * 单叶卡 uv 0–1 契约；女贞 decussate 对生与核果账目为女贞私有不继承），中国城市
 * 公园水边中龄个体 ≈10m（Spec §2 生产锚 8–12m 带中值偏上——物种上限 12–18m + NC
 * 园艺典型 9–12m 高宽同域 + form-a 岸线粗估佐证）：**垂枝冠首例（家族契约应力位，
 * Step 1 判定①档——现有 BroadleafShapeProfile 参数域内表达，零契约修订、D31.2
 * 未触发的实证）**：喷泉状/伞状垂帘冠（顶部拱圆 + 四周垂帘下覆）+ 骨架外展-拱起
 * 与末级近垂直下垂的两层反向角结构（L3/L4/L5 upturn 强负链 [-0.85,-1.35,-1.55]
 * ——先例 11 树带 [-0.04,+0.41] 的量级极端化而非域外）+ 末级链加长 + 垂索细化
 * （4–8mm 量级带）+ 簇沿切向垂帘（簇方向 = 垂索切向近垂直向下 → 簇平面近水平 →
 * 卡沿垂索放射下倾——「叶尖沿索轴朝下、部分微外翻」Spec 终审补强 [6] 的卡向弱
 * 表达 STRAND_TILT）+ 狭披针细叶互生簇（卡宽 0.02–0.03 × 长宽比域 8–18 冻结接口
 * ——几何卡与 salixMaterials 狭披针 SDF 包络同域）+ 通透档（间隙 0.1–0.25）+
 * 低叉单干中间型干形（slot-0；三型跨槽分化：slot-5 高位单干 / slot-6 基部斜弯）
 * ——**无花果资产**（柔荑花序先叶开放花期 3–4 月、蒴果 4–5 月，生长季 9–10 月
 * 主语境不可见——任务书裁决 2 时窗错位判据（ligustrum 先例直接适用），几何/
 * 材质均无花果账目与 v∈[3,7) uv 域）。
 *
 * 职责：D19 契约链上的 slot-0 锚点形态资产——build(params?) 以 mulberry32(params.seed)
 *      驱动全部分枝/叶簇随机量（**rng 消费顺序即契约**：同 seed 逐位同结果），几何
 *      生成全部在 ./tree/salix/salixGeometry（五级递归分枝 + 锥度枝干 + 末级枝
 *      **互生细长单叶卡簇沿索散布**烘焙 + 冠内通透三规则 + 树皮近景微起伏——家族
 *      方法整体复制自 ligustrum），全部数值依据 docs/research/salix-reference.md
 *      Spec 1.0（含主代理采样终审修正口径：冠幅比上沿 1.3 / 垂幕深域并集 2/5–2/3 /
 *      叶沿索轴取向），逐字段注释见 ./tree/salix/salixShapeProfile。形态参数类型 =
 *      阔叶家族契约 ./tree/broadleaf/broadleafShapeProfile 第十三实例；build 内做
 *      morphSeed → slot → profile 路由（profileForSeed O(8) 纯查表，非槽种子回落
 *      slot-0——公共签名不变，不扩 ProceduralBuild）。params.seed 缺省回落 slot-0
 *      锚点 morphSeed（morphSeedOf('asset_tree_salix', 0)——与 ProceduralSourceCache
 *      传入值逐位一致：无参路径 = 缓存路径 = 同一棵锚点树）。尺度参照真实乔木：
 *      中龄公园水边个体锚 ≈10m（**8 槽带 8.46–11.22m 高 / 10.15–12.79m 宽**，
 *      proceduralProfile 全槽实测带，2026-09-23 续作会话终测 + 同日工程密度回调后
 *      复测）；**Step 3 探针回调记档（六轮，2026-09-23）**：①初值树高域 9.4–10.0 实测涌现 8.97–12.81 跨域
 *      （弱领导 0.30 下骨架拱链外泄系数 ~×0.88–1.2 槽间波动——T009.3 弱领导翻转
 *      语义的垂柳极端端），经 8.7–9.3 → 终值 **10.0–10.6** 终测涌现 8.43–11.22
 *      全落 8–12 带、slot-0 **9.83** ≈10 锚；②初值 crownWidthRatio 0.72 → 涌现
 *      w/h 1.38 出域上沿（垂帘链外伸 + 细长卡沿索斜下外伸的横向合成外泄系数
 *      ≈ ×2.2），经 0.60（1.36 仍越）→ 0.54（角域联动）→ 终值 **0.52** 终测涌现
 *      **1.140** 落 1.0–1.3 中带（8 槽终测带 **1.046–1.269**：slot-1 深垂帘 1.046
 *      窄端 / slot-6 斜弯宽冠 1.269 宽端）；③scaffoldAngle 初值大值域直读 22–58°
 *      实测喷泉腰过低（3.7–5.0m ≈ 0.4–0.5h）+ 冠幅越域，收窄至 **20–36°**（Spec
 *      域 20–60° 内窄端带——拱高读向优先）终测腰 0.5–0.56h；④垂幕深初值
 *      lengthRatioBase 0.74 实测垂索穿地（rawMinY 至 -1.30）+ 树高越锚，终值
 *      **0.70**：终测帘缘 0.45–2.13m（Spec「多数止于其上 1–2m」[6] 带内 + 低垂
 *      个体端）、**垂幕段双口径记档**（腰口径（拱缘→帘缘）0.326–0.400 / 垂索全
 *      跨度口径（挂点最高→帘缘）0.72–0.87——照片判读域 2/5–2/3 含拱背垂索，腰
 *      口径保守下探、全跨度口径为上界参考，两口径夹 Spec 域）；⑤每簇候选 12/12
 *      → **9（L5）/10（L4）**（High 总面越 40000 上限的回调——slot-1 初测 40934）；
 *      ⑥clusterMinSeparation 0.50 → **0.44**（保留簇 587–752——Low 档（= 皮 370 +
 *      簇 × 2）下沿的补偿回调）；⑦**工程密度回调（2026-09-23 单发视觉优化，非 Spec
 *      变更——用户反馈「叶片太过稀疏」/中景（15–25m）帘幕「一缕一缕」不连续）**：
 *      canopyDensity 0.80 → **0.88** + coreDensityFloor 0.06 → **0.10** + 空腔半径
 *      域 0.55–0.95 → **0.45–0.78** + clusterMinSeparation 0.44 → **0.38**——四参数
 *      全部**零 rng 位移**（骨架/簇位/冠形逐位不变，只改通透存活率与保留簇集），
 *      单叶卡带 3894–5176 → **4715–6192**（+21% 级）；**候选数上调路线探针否决
 *      记档**：12/12 实测 Mid 总面 10458 越带 + rng 流平移重摇整树（slot-1 w/h
 *      涌现 1.336 / slot-2 0.986 双越 Spec 域 1.0–1.3）——密度改由密度场/空腔/簇
 *      抑制承载（剖面记档见 salixShapeProfile 三处回调注释）。原点 = 底部中心 minY 精确 0（叶卡极值斜伸的
 *      ≤8cm 穿地允许带 rawMinY ≥ −0.08——终测 8 槽 −0.01～−0.06，密度回调后逐槽
 *      不变）；**VIEW_TARGET_Y
 *      参考（3c Stage 消费）：slot-0 High 档整体包围盒中心 4.92（≈0.50h——垂枝
 *      冠心偏低读向）/ 叶组中心 5.23（密度回调后——垂帘下段加密使叶质心下移
 *      0.6m）**。回调记档详见 profile 各槽注释。
 * 材质分层表（materialIndex → 部件 → 材质；配方在 ./tree/salix/salixMaterials
 *      ——park-shader-agent 并行交付，导出签名冻结（与 ligustrumMaterials 同构）：
 *      createSalixBarkMaterial / createSalixLeafMaterial /
 *      createSalixLeafDepthMaterial，均 (level?: ProceduralLevel) => 材质 +
 *      SALIX_TREE_HEIGHT_NOMINAL 树高锚）：
 *      0 树皮（主干+五级枝+底盖——暗灰黑波状不规则纵沟脊第 13 语言：几何侧仅主干
 *        起伏浮雕（amplitudeRatio 0.028 / 谐波 {4,6} / drift 6.2 波状档）+ 抬档地板
 *        3.0mm 下全部分枝管光滑；色调/沟脊色对比/修剪残桩/小枝淡褐黄单档归材质层）
 *        ——createSalixBarkMaterial(level)
 *      1 单叶卡（L4/L5 末级枝互生螺旋散簇沿索烘焙）——createSalixLeafMaterial
 *        (level)：狭披针形细叶 SDF（长宽比域 8–18 与几何卡同域冻结接口——高频细齿
 *        载波 + 近零侧脉 + 先端长渐尖）+ 黄绿调弱两面色差 + 高透 + 风动两层（垂索
 *        高频低幅颤动 + 整帘低频摆）+ aLeafRand 逐叶变奏
 *      注：层间 mergeGeometries useGroups=true → 恰 2 组（皮 0 / 叶 1，D15 免组
 *      膨胀——无花果资产：组 0 纯皮拓扑，v∈[3,7) 全空）；叶影裁切深度材质走
 *      InstanceSource 契约通道 customDepthMaterial（T009.5 立契）：build 返回
 *      createSalixLeafDepthMaterial(level)（档位匹配，分档语义在工厂内）。
 * 叶卡顶点属性（几何固有，冻结契约沿用）：aLeafRand（逐叶随机 ∈ [0,1)，同卡 6
 *      顶点同值；皮组恒 0）、aBend（风动摆幅权重，卡内根→尖非降（叶基 → 叶尖）；
 *      皮组恒 0）。
 * 边界：每次调用 new 全部 geometry/material/深度材质（所有权随调用移交调用方，
 *      缓存会 dispose，禁止模块级共享对象，D17）；不建模记档（Spec 有事实、本资产
 *      不表达）：柔荑花序/蒴果（早春时窗错位——裁决 2）；芽（冬态）；真多干丛生相
 *      （结构差异不落连续参数——slot-6 斜弯弱表达记档）；曲枝垂柳 f. tortuosa /
 *      旱柳系变体（不消费变体）；单叶内部结构（狭披针包络/细锯齿/长渐尖/羽状脉/
 *      叶柄/两面色——归材质 SDF 层）；树皮暗灰色调/沟脊色对比/残桩（归材质层）
 *      ——详见 salixShapeProfile 模块头。
 * LOD（T011.12 三档交付，家族方法逐位复制自 ligustrum）：build 透传 params.level
 *      （缺省 'high'——旧无参路径逐位不变）到几何与皮/叶材质工厂；三档同 rng 流
 *      同骨架/簇位决策（档间不变量、Mid ⊂ High 掩码口径与发射计划见
 *      salixGeometry 模块头），材质档位变体与 customProgramCacheKey 档位唯一在
 *      salixMaterials；levels 声明三档（D27 首版最小化 [{id}]——调度阈值归
 *      Runtime 常量不进 Profile）。
 * LOD 预算锁定账目（预算制 D19.8——salixGeometry 模块头引用此处）：锁定预算
 *      （三角形，皮 + 单叶卡 = 总面）High ≤ 40000（家族行上沿语义）/ Mid 6000–
 *      10000 / Low 1500–3000——**家族行沿用**（docs/procedural-assets/lod-spec.md
 *      §5.2 阔叶乔木行，T009.6 锁定不重开；本任务不回写家族表）。8 槽 × 3 档实测带
 *      （2026-09-23 续作会话终测 + 同日工程密度回调（⑦）后复测，规范种子 =
 *      morphSeedOf(id, slot)）：High 总面 **35610–38564**（slot-6 斜弯最低 / slot-1
 *      深垂帘最高；单叶卡 4715–6192 × 2、保留簇 640–822 / 簇位 945）；Mid 总面
 *      **8716–9742**（单叶卡 1534–2047 ≈ High 存活卡 × 0.33——L5 簇 9 选 3 + L4 簇
 *      10 选 3 掩码率 j%3===1；皮 5648）；Low 总面 **1650–2014**（**壳卡 = 保留簇
 *      × 1 单竖卡（垂柳分化：簇位沿索拉长 → 保留簇 640–822 级（vs 先例 ~474），双
 *      竖卡口径越 Low 预算上沿——单竖卡落带记档；宽轴 = 0.077 × 半幅 = 卡长宽比域
 *      8–18 中位 13 的倒数延续——垂帘窄竖剪影）× 2 tri + 皮 370**）；皮恒 **26180 /
 *      5648 / 370**（High/Mid/Low——主干 14 段 ×14 + 底盖 14 + 五级 7/21/63/189/378 枝，
 *      拓扑 6 骨架 + 1 领导；Mid L4 = 3402 账目勘误记档：初记 2268 为段数笔误）；
 *      rng 消费 slot-0 三档恒等 **86115**（快照锁——密度回调后随保留簇 663 → 731
 *      上调）、跨槽随保留簇数浮动（通透 roll 计数机制，先例同款）；minY 三档恒 0；
 *      8 槽 w/h 涌现带 **1.046–1.295**（slot-0 锚点 1.135 落 1.0–1.3 主档中带 /
 *      slot-1 深垂帘窄端 1.046 + slot-6 斜弯宽端 1.295（密度回调后极值叶卡存活
 *      增多的 +0.026 读数）= Spec 域两端身份）；树高带 **8.46–11.22**（slot-0
 *      9.83 ≈10 锚——密度回调后 slot-6 顶梢叶卡存活使 8.43 → 8.46）。
 */
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { buildSalixGeometry } from '../tree/salix/salixGeometry';
import { SALIX_SHAPE_PROFILES } from '../tree/salix/salixShapeProfile';
import {
  createSalixBarkMaterial,
  createSalixLeafDepthMaterial,
  createSalixLeafMaterial,
} from '../tree/salix/salixMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_tree_salix',
  name: '垂柳',
  category: 'plant',
  tags: ['植物', '树', '垂柳', 'Salix babylonica', 'broadleaf'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 8 }, // D19：8 形态槽（T011.12 八槽形态向量全量交付——垂幕长度/冠幅比/干形三型/垂坠度四轴）
  variants: { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 }, // 参照族内先例量级（D13 无新增依赖）
  triangleCount: 37332, // 实数 = slot-0 锚点 High 档结构实数（皮 26180 恒定 + 单叶卡 5576×2——2026-09-23 工程密度回调后；多档起声明面取细模档；见模块头预算锁定账目）
  levels: [{ id: 'high' }, { id: 'mid' }, { id: 'low' }], // LOD 三档（D27 首版最小化 [{id}]——阈值归 Runtime 常量，不进 Profile）
  taxonomy: { category: 'plant', family: 'broadleaf' }, // 阔叶家族契约第十三实例（tree/broadleaf/，T010.1；杨柳科（Salicaceae）被子植物按家族形态域归 broadleaf——垂枝冠首例（契约应力位①档实证），记档见资产模块头）
  proceduralProfile: {
    // 跨 8 槽细模包围盒实测带（T011.12 终测 2026-09-23 + 同日工程密度回调后复测：
    // h 8.46–11.22 / w 10.15–12.79，声明带外沿放宽——实测带全含）。
    // 物种锚 slot-0 ≈9.8m 高 / 11.2m 冠幅 / w-h 比 1.140（≈10m 公园水边中龄个体——
    // Spec §2 生产锚 8–12m 带中值；与夏栎 ≈8 / 女贞 ≈8.4 同语境可混植、10m 级档差
    // 记档）；槽间差异（slot-1 深垂帘 11.0m 长帘纵读 / slot-6 斜弯 8.4m 低垂宽展
    // w-h 1.269 宽端 / slot-5 高位单干 10.9m——干形轴三型 + 垂幕轴的涌现读向同
    // seed 实测见 salixShapeSlots 测试注释）
    heightRange: { min: 8.3, max: 11.4 },
    widthRange: { min: 10.0, max: 13.0 },
  },
};

/**
 * morphSeed → shapeProfile 路由（T011.12 八槽形态向量）：枚举 8 槽 morphSeedOf
 * 逐位比对还原 slot 索引（O(8) 纯查表，确定性）；非槽种子（如测试直传任意 seed）
 * 与未填槽一并回落 slot-0 标准组合（先例前后行为兼容同构）。**不扩展
 * ProceduralBuild 公共签名**。
 */
function profileForSeed(seed: number) {
  for (let slot = 0; slot < 8; slot++) {
    if (seed === morphSeedOf(meta.id, slot)) return SALIX_SHAPE_PROFILES[Math.min(slot, SALIX_SHAPE_PROFILES.length - 1)]!;
  }
  return SALIX_SHAPE_PROFILES[0]!;
}

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.seed = morphSeed（SourceCache 传 morphSeedOf(assetId, slot)；缺省 = slot-0 锚点）
  const seed = params?.seed ?? morphSeedOf(meta.id, 0);
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧路径逐位不变；
  // 不参与 shapeSlot/morphSeed/sourceKey 形态身份——档位缓存维度归 ProceduralSourceCache）
  const level = params?.level ?? 'high';
  const rng = mulberry32(seed);
  const { geometry } = buildSalixGeometry(rng, profileForSeed(seed), level);
  const bark = createSalixBarkMaterial(level); // 组 0（契约序 [皮, 单叶卡]——mergeGeometries 层序）
  const leaf = createSalixLeafMaterial(level);
  // 影 pass 叶影裁切走 InstanceSource 契约通道——工厂每次 new（build 契约「每次调用
  // new 全部资源」天然满足），档位随 level 匹配；归源所有（缓存 dispose）
  return {
    geometry,
    material: [bark, leaf],
    customDepthMaterial: createSalixLeafDepthMaterial(level),
  };
}
