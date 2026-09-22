/**
 * runtime/procedural/assets/asset_tree_fraxinus.asset —— 程序化植物资产：白蜡树
 * （Fraxinus chinensis subsp. chinensis 白蜡树原亚种本尊——种定名终审裁决 1：FRPS
 * 61:30 独立种口径 + FOC Vol.15 两亚种口径收口 subsp. chinensis（subsp.
 * rhynchophylla 花曲柳北方原生不含长江流域 + 属级「白蜡树最常见于栽培」）；「白蜡」
 * 命源 = 白蜡虫产蜡经济用途非叶背蜡感〔叶背不做蜡白过度引申〕，T011.10 阔叶家族
 * 第十一实例——方法复制自国槐 asset_tree_sophora（**最直接模板**：白蜡 = 直接
 * 羽状第二实例，同型不同数值对照），长江流域公园夏绿单干中龄个体 ≈10m：**一回
 * 奇数羽状复叶卡 decussate 对生簇（家族复叶第四型 / 对生系首例——三重对生〔复叶
 * 对生 + 小叶对生 + 芽对生〕裁决 8 的挂点级实现，vs 国槐黄金角互生螺旋）+ 卵圆-
 * 圆头开展冠（中位分歧 scaffold + 开展外斜大枝，冠幅比 0.7–1.0 比国槐 0.9–1.2
 * 窄一档裁决 7）+ 匙形翅果帘幕簇（夏末盛挂身份信号——做，裁决 4/5：满冠分布 vs
 * 国槐冠缘散点，uv 果域 v∈[4,5] 入皮组）+ 灰褐浅-中纵裂树皮（第 11 语言，裁决 6）**
 * ——**无花资产**（无花冠最弱信号 + 窗口短 + 身份四信号已足——终审裁决 3，几何/
 * 材质均无花账目与 v∈[5,7) uv 域））。
 *
 * 职责：D19 契约链上的 slot-0 锚点形态资产——build(params?) 以 mulberry32(params.seed)
 *      驱动全部分枝/叶簇随机量（**rng 消费顺序即契约**：同 seed 逐位同结果；翅果
 *      挂点 = 确定性账目零 rng——消费全在骨架/簇/通透 roll），几何生成全部在
 *      ./tree/fraxinus/fraxinusGeometry（五级递归分枝 + 锥度枝干 + 末级枝**一回
 *      羽叶卡 decussate 对生簇**烘焙 + **匙形翅果帘幕簇**确定性抽选 + 冠内通透三
 *      规则 + 树皮近景微起伏——家族方法整体复制自 sophora；白蜡算法细节：**对生
 *      挂点语言**（簇内复叶卡方位 φ_j = ⌊j/2⌋×90° + (j mod 2)×180° + 微抖动——
 *      相邻叶对交互 ±90°（decussate）+ 对内共享节位 r̂（同节对生语义）；卡宽
 *      0.076–0.126 × 长/宽 2.7778 **恒比例冻结 0.36**（小叶更大更少故略宽于国槐
 *      0.34）；卡 uv v=0 复叶基部（裸柄段）→ v=1 顶生小叶尖、u=0.5 叶轴中轴——
 *      冻结接口）+ **匙形翅果帘幕簇**（终审裁决 4/5 做：**满冠帘幕带 q ≥ 0.30**
 *      （vs 国槐 0.42 冠外带——裁决 5 挂点分布密度显著高于国槐的账目实现）+
 *      保留 L5 簇位 + 位置散列排序 + 固定步长抽选（SAMARA_STRIDE 5）的**零 rng
 *      确定性账目**（011.6/011.7/011.9 先例）；单果 3–4cm × 4–6mm 匙形〔FRPS
 *      Verified 裁决 5〕× 2 家族映射 → 果长 0.06–0.08 / 果宽 0.008–0.012；每簇
 *      8–12 果（簇 10 枚级 [12]）；**扁平 quad 面片正反双 quad = 4 tri/果**
 *      （「双 tri 双面渲染」冻结接口——双面由几何侧承担〔材质组 0 FrontSide〕：
 *      冠下仰观〔fruit-c 主视角〕背面可见）；实测 **50–67 簇/树、501–678 果**
 *      （8 槽，2026-09-22 终测——任务书 400–900 果/40–90 簇数量级带内定档：
 *      Mid 预算带（10000 − 皮 4514 − Mid 叶面）下双面 quad 4 tri/果的簇数-果数
 *      平衡，记档）；**uv 果域标记 v∈[4.0,4.97]** 入皮组（组 0）——材质按域识别
 *      （triadica/sophora 先例）、u = 逐果色档（嫩绿→黄绿→淡褐材质通道））+
 *      **卵圆-圆头开展冠**（**单段角域直读** 44–66° 斜上-开展外斜中带——无国槐
 *      两段角带（中位分歧无低位放射身份）+ 挂高段中位 0.58–0.78（vs 国槐
 *      0.52–0.74 低位）+ 无干向长度分级（rank 乘子承担环内势差）+ upturn 链低正
 *      [0.08,…,0.03] + 领导枝弱-中庸 0.50（圆头冠顶由上段骨架链共构）——涌现
 *      w/h **0.715–1.037** 全槽落 Spec 域 0.7–1.0 读向带（slot-0 锚点 0.763 下
 *      中段 / slot-1 卵圆窄端 0.715 / slot-2 开张宽端 1.037 = form-a「冠幅≈高
 *      或略大」读向））、干高 0.26–0.34（trunk_height_ratio Unknown + 中位分歧
 *      读向带内映射；低/高端变体 slot-4/5 槽位化记档）、**灰褐浅细纵裂中低档浮雕**
 *      （0.020/{4,6}/3.6——FRPS「树皮灰褐色，纵裂」[1] + 多源中景照片合并 [12]；
 *      浮雕幅度比国槐 0.032 低一档（浅细脊沟 vs 厚脊深沟）；**亚视觉地板 3.5mm：
 *      仅主干有效起伏、全部分枝管光滑**（「幼干-大枝近光滑 + 浅裂显于主干」裁决 6
 *      ——皮孔/灰褐色调/地衣绿斑主体在材质层））——全部数值依据
 *      docs/research/fraxinus-reference.md Spec 1.0（生产一律以文末「终审记档」③
 *      终审裁决八项为准），逐字段注释见 ./tree/fraxinus/fraxinusShapeProfile。
 *      形态参数类型 = 阔叶家族契约 ./tree/broadleaf/broadleafShapeProfile 第十一
 *      实例；build 内做 morphSeed → slot → profile 路由（profileForSeed O(8) 纯查
 *      表，非槽种子回落 slot-0——公共签名不变，不扩 ProceduralBuild）。
 *      params.seed 缺省回落 slot-0 锚点 morphSeed（morphSeedOf('asset_tree_
 *      fraxinus', 0)——与 ProceduralSourceCache 传入值逐位一致：无参路径 = 缓存
 *      路径 = 同一棵锚点树）。尺度参照真实乔木：中龄公园个体锚 ≈10m 高（志书
 *      「高10-12米」直给——罕见志书级体量锚，裁决 2；与夏栎 ≈8/朴树 ≈8.5/香樟
 *      ≈8.6/榉树 ≈8/银杏 ≈8.2/悬铃木 ≈12/栾树 ≈10/乌桕 ≈9.5/重阳木 ≈10/国槐
 *      ≈10 同语境混植）；8 槽带 8.57–10.50m 高 / 6.94–9.79m 宽
 *      （proceduralProfile 全槽实测带，2026-09-22 终测）；槽间树高差由各槽领导比
 *      定档（**Step 3 探针回调记档（2026-09-22）**：初值树高域 9.9–10.7 + upturn
 *      链 [0.09,…,0.04] + crownWidthRatio 0.52 实测涌现 9.10–12.16 正外泄
 *      +1.0–1.5（单段角域直读无两段带横展泄压——slot-1 出 12m 生产域上界）且
 *      w/h 全带偏窄（0.53–1.16 横展外泄系数仅 ×1.19）；三轮回调：树高域 9.2–10.0
 *      + upturn 链降档 [0.08,…,0.03] + crownWidthRatio 全槽抬升（锚点 0.52→0.63
 *      + 角域 46–62 → 44–66）+ 两端槽修正（slot-1/5 领导比 0.56/0.54 → 0.50
 *      + slot-2 宽端 0.55→0.53）终测 slot-0 10.50 落 ≈10 锚域、w/h 全带
 *      0.715–1.037 落 Spec 读向带，回调记档见 profile 各槽注释）；原点 = 底部中心
 *      minY 精确 0。
 * 材质分层表（materialIndex → 部件 → 材质；配方在 ./tree/fraxinus/fraxinusMaterials
 *      ——park-shader-agent 并行交付，导出签名冻结（与 sophoraMaterials 同构）：
 *      createFraxinusBarkMaterial / createFraxinusLeafMaterial /
 *      createFraxinusLeafDepthMaterial，均 (level?: ProceduralLevel) => 材质）：
 *      0 树皮 + 翅果（主干+五级枝+底盖+匙形翅果帘幕簇——**翅果入皮组：uv 果域
 *      标记 v∈[4,5] + u = 逐果色档**，材质按 v 域分流翅果配方）——
 *        createFraxinusBarkMaterial(level)：灰褐浅-中纵裂（浅细脊沟、无剥落无
 *        碎翘）+ 幼干-大枝近光滑 + 皮孔小不明显（第 11 树皮语言，终审裁决 6——
 *        FRPS/照片多源；几何侧仅主干起伏浮雕 + 抬档地板下分枝管光滑）+ 匙形
 *        翅果域色序（嫩绿→黄绿→淡褐 + 桨形轮廓边缘微暗线 + 微透亮——u 通道）
 *      1 一回羽叶卡（L4/L5 末级枝 decussate 对生簇烘焙）——
 *        createFraxinusLeafMaterial(level)：中绿-亮绿细碎均质冠面基调（上面中绿
 *        亮绿/下面浅绿-灰绿两面色差弱于国槐级归材质 [12]）+ **一回奇数羽叶 SDF
 *        对生严格变体**（小叶 5–7 枚 = 2–3 对严格对生窗列 + 顶生近等大 1.0–1.15×
 *        独立窗位 + 裸柄段更长 ≈0.28–0.35（v=0.285 起排）+ 缘整齐锐锯齿载波〔vs
 *        国槐全缘——复叶系缘齿对照轴〕+ 小叶卵形-倒卵状长圆形-披针形三相——卡
 *        v=0 基部 → v=1 顶生小叶尖、u=0.5 叶轴中轴、宽/长 0.36 冻结接口）+
 *        aLeafRand 逐叶变奏 + 风动（aSeed 整树缓摆 + aBend 快颤）
 *      注：层间 mergeGeometries useGroups=true → 恰 2 组（皮 0 / 叶 1，D15 免组
 *      膨胀）；叶影裁切深度材质走 InstanceSource 契约通道 customDepthMaterial
 *      （T009.5 立契）：build 返回 createFraxinusLeafDepthMaterial(level)
 *      （档位匹配，分档语义在工厂内）。
 * 叶卡顶点属性（几何固有，冻结契约沿用）：aLeafRand（逐叶随机 ∈ [0,1)，同卡 6
 *      顶点同值；皮组（含翅果）恒 0）、aBend（风动摆幅权重，卡内根→尖非降（复叶
 *      基部→顶生小叶尖）；皮组（含翅果）恒 0）。
 * 边界：每次调用 new 全部 geometry/material/深度材质（所有权随调用移交调用方，
 *      缓存会 dispose，禁止模块级共享对象，D17）；不建模记档（Spec 有事实、本资产
 *      不表达）：一回羽叶内部结构（小叶严格对生窗列/顶生近等大/裸柄段/小叶三相/
 *      锐锯齿/两面色差——归材质 SDF）；**花**（圆锥花序 5–10cm/无花冠/萼 1–3mm
 *      ——Verified [1][2][12]，终审裁决 3 不做）；翅果色序细档与宿存冬态（归材质
 *      u 通道/风格层）；对生芽序（冬态-早春近景信号，夏绿相不建模）；嫩枝交互
 *      扁平（属级 Verified [5]——亚厘米级近景信号，归缺口候选）；秋色黄（记档不
 *      建模）；山地 gnarled 相（form-b 变体端）；subsp. rhynchophylla 北方亚种
 *      差分（Spec §6）；树皮皮孔与地衣绿斑（归材质层）；多干萌生相（萌发力强
 *      [1]——频率 Unknown，变体端不进 8 槽）——详见 fraxinusShapeProfile 模块头。
 * LOD（T011.10 三档交付，家族方法逐位复制自 sophora）：build 透传 params.level
 *      （缺省 'high'——旧无参路径逐位不变）到几何与皮/叶材质工厂；三档同 rng 流
 *      同骨架/簇位/果簇决策（档间不变量、Mid ⊂ High 掩码口径与发射计划见
 *      fraxinusGeometry 模块头；**翅果簇 Mid 全量保留（身份信号——夏末满冠帘幕
 *      中距可读 [12]）/ Low 省略**——triadica/koelreuteria/sophora Low 果处理
 *      先例），材质档位变体与 customProgramCacheKey 档位唯一在 fraxinusMaterials；
 *      levels 声明三档（D27 首版最小化 [{id}]——调度阈值归 Runtime 常量不进
 *      Profile）。
 * LOD 预算锁定账目（预算制 D19.8——fraxinusGeometry 模块头引用此处）：锁定预算
 *      （三角形，皮 + 复叶卡 + 翅果簇 = 总面）High ≤ 40000（家族行上沿语义，无绝对
 *      下沿——小卡高数量语义记档同 platanus/栾/triadica/bischofia/sophora 先例
 *      口径）/ Mid 6000–10000 / Low 1500–3000——**家族行沿用**
 *      （docs/procedural-assets/lod-spec.md §5.2 阔叶乔木行，T009.6 锁定不重开；
 *      本任务不回写家族表）。8 槽 × 3 档实测带（2026-09-22 终测，规范种子）：
 *      High 总面 **31310–35678**（slot-6 疏松最低 / slot-7 丰满最高；复叶卡
 *      2564–4394 × 2、翅果簇 50–67 × 果 501–678 × 4 tri、保留簇 477–500 级/
 *      簇位 945）；Mid 总面 **8080–9862**（复叶卡 781–1318 ≈ High 存活卡 × 0.30
 *      ——小卡簇 10 选 3 掩码率 + 果簇全量保留）；Low 总面 **2046–2466**（壳卡 =
 *      保留簇 × 2 × 宽轴 0.36 × 半幅——复叶卡比例在 Low 延续；翅果簇省略记档）；
 *      皮恒 24178 / 4514 / 370（High/Mid/Low——主干 14 段 ×14 + 底盖 14 + 五级
 *      7/21/63/189/378 枝，拓扑 6 骨架 + 1 领导）；rng 消费 slot-0 三档恒等
 *      **85085**（快照锁）、跨槽随保留簇数浮动（通透 roll 计数机制，先例同款
 *      ——翅果挂点零 rng 无消费口径问题）；minY 三档恒 0。
 */
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { buildFraxinusGeometry } from '../tree/fraxinus/fraxinusGeometry';
import { FRAXINUS_SHAPE_PROFILES } from '../tree/fraxinus/fraxinusShapeProfile';
import {
  createFraxinusBarkMaterial,
  createFraxinusLeafDepthMaterial,
  createFraxinusLeafMaterial,
} from '../tree/fraxinus/fraxinusMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_tree_fraxinus',
  name: '白蜡树',
  category: 'plant',
  tags: ['植物', '树', '白蜡树', 'Fraxinus chinensis', 'broadleaf'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 8 }, // D19：8 形态槽（T011.10 八槽形态向量全量交付）
  variants: { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 }, // 参照朴树/香樟/榉树/银杏/悬铃木/栾树/乌桕/重阳木/国槐量级（D13 无新增依赖）
  triangleCount: 33920, // 实数 = slot-0 锚点 High 档结构计数（皮 24178 恒定 + 复叶卡 3749×2 + 翅果 561 果 ×4；多档起声明面取细模档；见模块头预算锁定账目）
  levels: [{ id: 'high' }, { id: 'mid' }, { id: 'low' }], // LOD 三档（D27 首版最小化 [{id}]——阈值归 Runtime 常量，不进 Profile）
  taxonomy: { category: 'plant', family: 'broadleaf' }, // 阔叶家族契约第十一实例（tree/broadleaf/，T010.1；木犀科（Oleaceae）被子植物按家族形态域归 broadleaf——落叶阔叶第八例、复叶第四型（一回奇数羽状对生系首例），记档见资产模块头）
  proceduralProfile: {
    // 跨 8 槽细模包围盒实测带（T011.10 终测 2026-09-22：h 8.57–10.50 / w 6.94–9.79，
    // 声明带外沿放宽——实测带全含）。
    // 物种锚 slot-0 ≈10.5m 高 / 8.0m 冠幅 / w-h 比 0.763（≈10m 中龄公园个体——志书
    // 「高10-12米」直给（罕见志书级体量锚，裁决 2）；与夏栎 ≈8/朴树 ≈8.5/香樟
    // ≈8.6/榉树 ≈8/银杏 ≈8.2/悬铃木 ≈12/栾树 ≈10/乌桕 ≈9.5/重阳木 ≈10/国槐 ≈10
    // 同语境混植）；槽间差异（slot-1 卵圆窄端 10.47 纵向长 / slot-2 开张宽端 8.85
    // 扁宽 w-h 1.037 = form-a「冠幅≈高或略大」读向 / slot-5 高冠 / slot-4 低冠
    // 视觉冠底差同 seed 实测见 fraxinusShapeSlots 测试注释）
    heightRange: { min: 8.5, max: 10.6 },
    widthRange: { min: 6.9, max: 9.9 },
  },
};

/**
 * morphSeed → shapeProfile 路由（T011.10 八槽形态向量）：枚举 8 槽 morphSeedOf
 * 逐位比对还原 slot 索引（O(8) 纯查表，确定性）；非槽种子（如测试直传任意 seed）
 * 与未填槽一并回落 slot-0 标准组合（十先例前后行为兼容同构）。**不扩展
 * ProceduralBuild 公共签名**。
 */
function profileForSeed(seed: number) {
  for (let slot = 0; slot < 8; slot++) {
    if (seed === morphSeedOf(meta.id, slot)) return FRAXINUS_SHAPE_PROFILES[Math.min(slot, FRAXINUS_SHAPE_PROFILES.length - 1)]!;
  }
  return FRAXINUS_SHAPE_PROFILES[0]!;
}

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.seed = morphSeed（SourceCache 传 morphSeedOf(assetId, slot)；缺省 = slot-0 锚点）
  const seed = params?.seed ?? morphSeedOf(meta.id, 0);
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧路径逐位不变；
  // 不参与 shapeSlot/morphSeed/sourceKey 形态身份——档位缓存维度归 ProceduralSourceCache）
  const level = params?.level ?? 'high';
  const rng = mulberry32(seed);
  const { geometry } = buildFraxinusGeometry(rng, profileForSeed(seed), level);
  const bark = createFraxinusBarkMaterial(level); // 组 0（契约序 [皮+翅果, 复叶卡]——mergeGeometries 层序；翅果按 v∈[4,5] 果域标记入皮组，材质按域分流翅果配方）
  const leaf = createFraxinusLeafMaterial(level);
  // 影 pass 叶影裁切走 InstanceSource 契约通道——工厂每次 new（build 契约「每次调用
  // new 全部资源」天然满足），档位随 level 匹配；归源所有（缓存 dispose）
  return {
    geometry,
    material: [bark, leaf],
    customDepthMaterial: createFraxinusLeafDepthMaterial(level),
  };
}
