/**
 * runtime/procedural/assets/asset_tree_bungeana.asset —— 程序化植物资产：白皮松
 * （*Pinus bungeana* Zucc. ex Endl.，松科松属常绿乔木、中国特有，T012.4 针叶家族
 * conifer **第四实例——契约定稿态增量消费 + 松属针束首例**：高度域连续散生骨架
 * 〔层位退化消费直承 012.3〕+ 三针束聚合卡第 4 叶语言〔束生短枝单律〕+ 开张卵圆→
 * 伞形平顶冠谱系〔exp<1 新端型首用〕+ 双态两年熟低量果账目 + 干基弱膨 ≤1.3 +
 * **第 17 树皮语言白基调多色斑驳薄片剥落（identity 级——远景白干 = 第一识别特征，
 * M75 可辨性 Unknown ⑤）**——方法复制自雪松/水杉/圆柏三先例，挂点语言按白皮松
 * 改写）。公园开阔中龄个体 ≈11.5m（Spec §尺度锚中龄公园生产锚 9–15m 中位偏上
 * ——慢生三源一致；体量介于雪松 15–18 / 水杉 18–25 与圆柏 6–10 之间）。FRPS
 * 7:234「树姿优美，树皮白色或褐白相间、极为美观，为优良的庭园树种」——公园
 * 语境常见度强档 + 华北乡土位。
 *
 * 职责：D19 契约链上的 slot-0 锚点形态资产——build(params?) 以 mulberry32(params.seed)
 * 驱动全部分枝/簇位随机量（**rng 消费顺序即契约**：同 seed 逐位同结果，slot-0
 * 三档恒等 51863；**果账目零 rng**——posHash 确定性布点），几何生成全部在
 * ./tree/bungeana/bungeanaGeometry（高度域连续散生层位退化挂点〔层间随机旋 rng
 * 方位散布 + 大抖动破层 + 零端层隙〕+ 层角梯度 + **解析冠顶适配**〔开张卵圆→
 * 伞形平顶包络落高——8 槽树高涌现 ⊂ ±3.2%〕+ 三针束聚合卡散生挂点 + 交叉双卡
 * + 双态果账目 + LOD 三档同流派生——机制映射与结构计数见该文件模块头）。
 * 形态参数类型 = 针叶家族契约 ./tree/conifer/coniferShapeProfile（定稿 80 位
 * ——012.2 转正；白皮松 = 第四实例定稿态增量消费——真实消费 64 / 零值 8 /
 * 不适用 8，消费差异记档见 bungeanaShapeProfile 模块头）；数值与槽组合见
 * ./tree/bungeana/bungeanaShapeProfile（全部数值依据
 * docs/research/bungeana-reference.md Spec **@1.1** 含终审记档）；build 内做
 * morphSeed → slot → profile 路由（profileForSeed O(8) 纯查表，非槽种子回落
 * slot-0——公共签名不变，不扩 ProceduralBuild）。params.seed 缺省回落 slot-0
 * 锚点 morphSeed（morphSeedOf('asset_tree_bungeana', 0)——与
 * ProceduralSourceCache 传入值逐位一致）。原点 = 底部中心 minY 精确 0。
 *
 * 材质分层表（materialIndex → 部件 → 材质；配方在 ./tree/bungeana/
 * bungeanaMaterials——**冻结接口 ⑥（3b 已交付，对账一致）**：具名导出
 * `createBungeanaMaterials(level?) => BungeanaMaterialSet { needle, bark, depth }`
 * ——bark = 树皮材质〔皮管 v<1.0 + 果卡 v∈[1,2) 域分流配方——冻结接口②〕/
 * needle = 束卡材质 / depth = 叶影裁切深度材质（冻结接口④）；per-level
 * customProgramCacheKey 档位唯一归 3b）：
 * 0 树皮（主干+五级枝+底盖+**果卡**）—— 束生单律双帧域（冻结接口②：束卡
 *   v∈[0,1) / 果卡 v∈[1,2)，材质判别阈值 1.0——vs 圆柏三级帧域，本资产无
 *   刺卡帧）；**第 17 树皮语言 = 白基调多色斑驳薄片剥落**（bark 组 3b 消费——
 *   乳白 plate / 灰褐 base / 近黑 groove + 弱浮雕 0.18 族内最低 + 株内「上白
 *   下深」大梯度沿干高度 3b 承载；几何侧零起伏场）；果域双态 u 色档编码
 *   （u ≥ 0.5 近熟淡绿-黄褐 0xa2985a / u < 0.5 一年生绿幼果 0x5d7a44——
 *   bungeanaGeometry 与 bungeanaMaterials 冻结同码）；深度材质皮组 aLeafRand=0
 *   实心守卫覆盖果影
 * 1 叶卡（三针束聚合卡 L4/L5+顶梢 + Low 壳卡）—— 束卡 SDF 第 4 叶语言
 *   （束内 3 针扇形 + 束螺旋排列 + 束间距 ≈针长 1/3–1/2 = SDF 内部近景身份；
 *   无两面色差——族内第 4 数据点；受光 ramp 阳黄绿/阴灰绿；微白粉 0.10；
 *   亚像素退化门继承 012.3 导数感知门；风动**两成分**：aSeed 整冠低频慢摆 +
 *   aBend 末级束高频小幅颤〔硬针小惯量——判定 9〕；树高锚 = profile.
 *   totalHeight 同源 11.5 级；顶梢成分不消费〔windLeader* 零占位〕）
 * 注：层间 mergeGeometries useGroups=true → 恰 2 组（皮 0 / 叶卡 1，D15 免组
 * 膨胀）；**果卡入皮组（组 0）**——bungeanaGeometry 模块头记档的冻结接口
 * （uv v 域身份标记 + aLeafRand/aBend 随组恒 0——果刚性）；叶影裁切深度材质走
 * InstanceSource 契约通道 customDepthMaterial（T009.5 立契）：build 返回
 * createBungeanaMaterials(level).depth（档位匹配，分档语义在工厂内）。
 * params.preset 忽略（常绿单卡资产——D44 未支持色卡 build 忽略此参的占位期
 * 行为；cedrus/juniperus 同款）。
 *
 * 色卡（D44）：**default 单卡终态**（012.4 待裁决位 4 + Spec §5.2——常绿无季相
 * 证据不建卡：FRPS/FoC/NC 三源无秋色语句〔阴性〕+ 深绿-中绿带黄绿/灰绿全年
 * 稳定，新梢黄绿 = 域内变体非季相〔D44 #1/#7 不投机建卡〕）。swatch = **
 * needleColorSun/Shade 严格中点**（cedrus/juniperus 常绿构造中点式第三例）——
 * **色值零内嵌（冻结接口⑤：Geometry/入口零 hex 色值字面量）**：入口
 * constructDefaultSwatch 自 profile 针色组按族先例公式推导（3b 束卡构造色同式
 * 同值 #606d47——对账一致）；CROWN_PRESETS 行（Step 3a 先锁色 0x606d47——沿
 * cedrus/juniperus inert 锚先例，broadleafCanopyMaterials 侧）与 meta swatch /
 * 3b 构造色三处同源（T024 纪律）。
 *
 * LOD（T012.4 Step 3a 三档交付，家族方法复制）：build 透传 params.level（缺省
 * 'high'——旧无参路径逐位不变）到几何与材质工厂；三档同 rng 流同骨架/簇位/
 * 器官决策（档间不变量、Mid 站点掩码 %4 保交叉双卡与发射计划见 bungeanaGeometry
 * 模块头），材质档位变体与 customProgramCacheKey 档位唯一在 bungeanaMaterials；
 * levels 声明三档（D27 首版最小化 [{id}]——调度阈值归 Runtime 常量不进 Profile）。
 *
 * LOD 预算锁定账目（预算制 D19.8；conifer 行已锁——T012.1，非候选带流程：实测
 * 落带记档 = **Step 3a 初版探针 2026-09-30**，8 槽 × 3 档〔Step 4 密度校准回路
 * 开放——出带调簇密度或抑制〕）：**High ≤ 40000 / Mid 6000–10000 / Low
 * 1500–3000 / Canopy ≤ 500**。实测带：**High 31548–37108**（皮恒 16996〔配置
 * 基数 16884 + 顶梢管 98 + 底盖 14；主干 364 + L1 2058〔21 管 = 20 层枝 + 顶梢〕
 * + L2–L5 2400/3200/3840/5120〕+ 束卡 7134–9914 张 ×2 + 果 50–71 枚 ×4；
 * slot-6 疏冠 0.80 最低 / slot-7 多干近似 rank 双强最高）；**Mid 6544–7846**
 * （皮恒 2850 + 存活簇位 /4 × 交叉双卡 + **果省略**〔近景点彩级非身份信号——
 * vs 圆柏浆果 Mid 全量的取舍差异记档〕）；**Low 2592–2758**（皮恒 762 + 壳卡
 * = ⌈保留簇/5⌉ × 2、果省略）；rng 消费 slot-0 三档恒等 **51863**（快照锁——
 * 果账目零 rng）、minY 三档恒 0；slot-0 High 总面 **36752** = 皮 16996 + 束卡
 * 9750×2 + 果 64×4（meta triangleCount 实数）；树高涌现 8.59–13.55 vs 锚
 * 8.5–14（解析冠顶适配 ⊂ ±3.2%）、冠幅比涌现 ⊂ ±11%（族先例级——juniperus
 * +8.7%/+12% 记档同量级）。
 *
 * 边界：每次调用 new 全部 geometry/material/深度材质（所有权随调用移交调用方，
 * 缓存会 dispose，禁止模块级共享对象，D17）；不建模记档（Spec 有事实、本资产
 * 几何不表达）：雄球花春花相（4–5 月物候窗——主语境 9 月末不消费，判定 7
 * 明文 + Spec 反证「可见性显著」但物候窗判定维持，012.3 同判）、冬芽红褐 /
 * 一年生小枝灰绿（近景细节位 = 3b 新梢黄绿梯度承载）、老树 S 形扭曲干极端态
 * （不进生产域）、真近基并立多干 s01 型（slot-7 低位粗枝上举近似承载 s08 型
 * ——D31.2 候选归族门 012.5，bungeanaShapeProfile 模块头评估记档）、束内 3
 * 针扇形 / 束螺旋 / 束间距（SDF 内部近景身份——3b 承载，判定 3 层级分工）、
 * 树皮年龄三段序列槽间轴（bark 叶身份类槽间恒等——缺口候选归族门 012.5，
 * 替代承载 = 株内上白下深 3b 梯度 + 冠形谱系端年龄暗示）——详见该文件
 * Unknown/不消费记档。
 */
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { buildBungeanaGeometry } from '../tree/bungeana/bungeanaGeometry';
import { BUNGEANA_SHAPE_PROFILES, BUNGEANA_SLOT0_PROFILE } from '../tree/bungeana/bungeanaShapeProfile';
// 冻结接口 ⑥（3b 已交付对账一致——{ needle, bark, depth } 成套工厂）：入口只引
// Materials 工厂产物；**色值零内嵌（冻结接口⑤）**——swatch 由 profile 针色组按
// 常绿构造中点式推导（cedrus/juniperus 先例第三例；3b 构造中点同式同值 #606d47，
// CROWN_PRESETS 行已同值先锁——三处同源）
import { createBungeanaMaterials } from '../tree/bungeana/bungeanaMaterials';

/**
 * 常绿构造中点式 swatch 推导（冻结接口⑤——色值零内嵌：入口不含任何 hex 色值
 * 字面量，由 profile 针色组按族先例公式构造；3b 束卡构造色同式同值〔#606d47〕，
 * CROWN_PRESETS 行同值——三处同源，T024 纪律）。
 */
function constructDefaultSwatch(): string {
  const sun = BUNGEANA_SLOT0_PROFILE.needleMaterial.needleColorSun;
  const shade = BUNGEANA_SLOT0_PROFILE.needleMaterial.needleColorShade;
  const ch = (x: number): number => (x >> 16) & 0xff;
  const cs = (x: number): number => (x >> 8) & 0xff;
  const cb = (x: number): number => x & 0xff;
  const r = Math.round((ch(sun) + ch(shade)) / 2);
  const g = Math.round((cs(sun) + cs(shade)) / 2);
  const b = Math.round((cb(sun) + cb(shade)) / 2);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export const meta: ProceduralAssetMeta = {
  id: 'asset_tree_bungeana',
  name: '白皮松',
  category: 'plant',
  tags: ['植物', '树', '白皮松', 'conifer', '常绿', 'Pinus bungeana', '三针一束', '白皮'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 8 }, // D19：8 形态槽（T012.4 八槽形态向量——树高 8.5–14 ⊂ Spec 9–15 主轴〔幼端 8.5 = 慢生幼树个体〕× 冠形谱系〔宽塔幼态 0.60 ↔ 开张卵圆 0.85 ↔ 中老广卵 1.00 ↔ 伞形平顶老端 1.25——第 4 冠轮廓包络型〕× 裸干 0.25–0.36 × 开张度 × 疏密轴 0.80–1.00 × 多干变体 slot-7 × 果量恒定低量点彩；层数 10 密层轴结构计数恒等不进槽〔散生退化消费——记缺口候选归 T012 族门，沿三先例同位第四例〕）
  variants: { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 }, // 参照雪松/水杉/圆柏量级（D13 无新增依赖）
  triangleCount: 36752, // 实数 = slot-0 锚点 High 档（Step 3a 探针 2026-09-30：皮 16996 恒定 + 束卡 9750×2 + 果 64×4；多档起声明面取细模档；见模块头预算锁定账目）
  levels: [{ id: 'high' }, { id: 'mid' }, { id: 'low' }], // LOD 三档（D27 首版最小化 [{id}]——阈值归 Runtime 常量，不进 Profile）
  // Runtime 表示能力声明（D41 §三.2）：乔木 canopy 链 High → Mid → Canopy → Culled
  //（012.4 待裁决位 3：出生即声明 canopy——开张卵圆/伞形冠的远景代理链；conifer
  // canopy 经 BroadleafCanopyProxy 统一实现派生、冠色进 CROWN_PRESETS 同源——
  // **proxy/物种表 bungeana 行随 3c 合并阶段落地回填**〔沿 cedrus/metasequoia/
  // juniperus 3c 接线先例；CROWN_PRESETS 白皮松行已先行〕）；low 不进有效链
  //——保留为构建档位
  representations: ['high', 'mid', 'canopy'],
  taxonomy: { category: 'plant', family: 'conifer' }, // 针叶家族契约第四实例/定稿态增量消费例（tree/conifer/ 定稿 80 位——松科松属常绿裸子乔木按家族形态域归 conifer，taxonomy 归类表 conifer 3→4）
  presets: [
    // 色卡终态（012.4 待裁决位 4 + Spec §5.2）：default 单卡——常绿无季相证据
    // 不建卡（三源无秋色语句阴性 + 深绿-中绿全年稳定；新梢黄绿 = 域内变体非
    // 季相）。swatch = needleColorSun/Shade 严格中点（cedrus/juniperus 常绿构造
    // 中点式第三例）——**冻结接口⑤：色值零内嵌**，constructDefaultSwatch 自
    // profile 针色组推导（3b 束卡构造色同式同值 #606d47）；三处同源：meta ↔
    // bungeanaMaterials 构造色 ↔ CROWN_PRESETS 行（Step 3a 先锁色）
    { id: 'default', label: '默认', swatch: constructDefaultSwatch() },
  ],
  proceduralProfile: {
    // 跨 8 槽细模包围盒实测带（Step 3a 探针 2026-09-30：h 8.59–13.55 / w 4.69–15.29
    //——束卡 0.26–0.32 外伸 + 解析冠顶适配落带）。物种锚 slot-0 = 11.38m 高
    //（Spec 生产锚 11.5〔9–15m 带中位偏上——慢生注记〕×0.99 落高）/ 9.76m 冠幅
    //（crownWidthRatio 0.85 × 包络归一——开张卵圆的中距体量；与阔叶 8–12m /
    // 雪松 16.5 / 水杉 20 / 圆柏 8 锚同语境混植）；槽间差异（slot-1 幼宽塔 4.69
    // 宽 / slot-2 老树伞形平顶 15.29 宽 13.55 高——任务主轴冠形谱系两端涌现）
    // 如实入带
    heightRange: { min: 8.4, max: 13.7 },
    widthRange: { min: 4.5, max: 15.5 },
  },
};

/**
 * morphSeed → shapeProfile 路由（T012.4 八槽形态向量）：枚举 8 槽 morphSeedOf
 * 逐位比对还原 slot 索引（O(8) 纯查表，确定性）；非槽种子（如测试直传任意
 * seed）与未填槽一并回落 slot-0 标准组合（雪松/水杉/圆柏/阔叶 13 树前后行为
 * 兼容同构）。**不扩展 ProceduralBuild 公共签名**。
 */
function profileForSeed(seed: number) {
  for (let slot = 0; slot < 8; slot++) {
    if (seed === morphSeedOf(meta.id, slot)) return BUNGEANA_SHAPE_PROFILES[Math.min(slot, BUNGEANA_SHAPE_PROFILES.length - 1)]!;
  }
  return BUNGEANA_SHAPE_PROFILES[0]!;
}

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.seed = morphSeed（SourceCache 传 morphSeedOf(assetId, slot)；缺省 = slot-0 锚点）
  const seed = params?.seed ?? morphSeedOf(meta.id, 0);
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧路径逐位不变；
  // 不参与 shapeSlot/morphSeed/sourceKey 形态身份——档位缓存维度归 ProceduralSourceCache）
  const level = params?.level ?? 'high';
  // params.preset = 色卡 id（D44）：常绿单卡资产忽略（cedrus/juniperus 同款占位期
  // 行为——default 卡 = 现行材质行为，无卡间差异）
  const rng = mulberry32(seed);
  const { geometry } = buildBungeanaGeometry(rng, profileForSeed(seed), level);
  // 组 0 皮（干+枝+底盖+果卡，uv v 域双帧分流配方）/ 组 1 叶卡（束卡+Low 壳卡）
  // ——契约序 [皮, 叶卡] = mergeGeometries 层序（bungeanaGeometry 冻结接口）
  const materials = createBungeanaMaterials(level);
  // 影 pass 叶卡裁切走 InstanceSource 契约通道——工厂每次 new（build 契约「每次
  // 调用 new 全部资源」天然满足），档位随 level 匹配；归源所有（缓存 dispose）
  return {
    geometry,
    material: [materials.bark, materials.needle],
    customDepthMaterial: materials.depth,
  };
}
