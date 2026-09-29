/**
 * runtime/procedural/assets/asset_tree_juniperus.asset —— 程序化植物资产：圆柏
 * （Juniperus chinensis (L.) Ant.，柏科 Cupressaceae 刺柏属常绿乔木、雌雄异株，
 * T012.3 针叶家族 conifer **第三实例——契约定稿态增量消费例 + 鳞叶首例**：高度域
 * 连续散生骨架〔层位字段退化消费〕+ 绳状鳞卡第 3 叶语言 + 刺叶 minority 双叶型
 * 并存〔族内首例〕+ 柱/卵双冠轮廓 + 浆果双熟度账目 + 干基微膨——方法复制自
 * 雪松/水杉两先例，挂点语言按圆柏改写）。公园开阔中龄个体 ≈8m（Spec §尺度锚
 * 生产锚 6–10m——显著低于阔叶 8–12m 族锚 / 雪松 16.5 / 水杉 20 混植最高量级，
 * 北方庭园主力位的中小量级层）。FRPS 7:362「为普遍栽培的庭园树种」——公园语境
 * 常见度强档。
 *
 * 职责：D19 契约链上的 slot-0 锚点形态资产——build(params?) 以 mulberry32(params.seed)
 * 驱动全部分枝/簇位随机量（**rng 消费顺序即契约**：同 seed 逐位同结果；**浆果账目
 * 零 rng**——posHash 确定性布点），几何生成全部在 ./tree/juniperus/juniperusGeometry
 * （高度域连续散生层位退化挂点〔层间随机旋 rng 方位散布 + 大抖动破层 + 零端层隙〕
 * + 层角梯度 + 柱/卵双型冠轮廓 + 绳簇散生挂点 + 交叉双卡 + 刺叶卡 minority +
 * 浆果双熟度账目 + LOD 三档同流派生——机制映射与结构计数见该文件模块头）。
 * 形态参数类型 = 针叶家族契约 ./tree/conifer/coniferShapeProfile（**定稿 80 位**
 * ——012.2 转正；圆柏 = 第三实例定稿态增量消费）；数值与槽组合见
 * ./tree/juniperus/juniperusShapeProfile（全部数值依据
 * docs/research/juniperus-reference.md Spec **@1.1** 含终审记档）；build 内做
 * morphSeed → slot → profile 路由（profileForSeed O(8) 纯查表，非槽种子回落
 * slot-0——公共签名不变，不扩 ProceduralBuild）。params.seed 缺省回落 slot-0
 * 锚点 morphSeed（morphSeedOf('asset_tree_juniperus', 0)——与
 * ProceduralSourceCache 传入值逐位一致）。原点 = 底部中心 minY 精确 0。
 *
 * 材质分层表（materialIndex → 部件 → 材质；配方在 ./tree/juniperus/
 * juniperusMaterials——park-shader-agent 并行交付，**导出签名冻结**〔沿 cedrus
 * 常绿单卡先例，无 preset 尾参〕：createJuniperusNeedleMaterial /
 * createJuniperusBarkMaterial / createJuniperusNeedleDepthMaterial，均
 * (level?: ProceduralLevel) => 材质）：
 * 0 树皮（主干+五级枝+底盖+**浆果卡**）—— createJuniperusBarkMaterial(level)：
 *   第 16 树皮语言 = 灰-灰褐基调纵长条片剥落（条片机制沿第 15 语言〔水杉〕+ 色相轴
 *   换灰-灰褐——vs 雪松鳞状方块片第 14 / 水杉红褐基调第 15；bark 组全 3b 消费）；
 *   **按 uv v 域二分支**（皮条片 v<1.0 逐管归一域 / 浆果 [1.0,1.95]——**u 色档域
 *   双熟度编码**：u ≥ 0.5 翌年霜熟果暗蓝紫+白霜 / u < 0.5 当年绿幼果——juniperus
 *   Materials 冻结声明，几何侧实编码一致）；深度材质皮组 aLeafRand=0 实心守卫
 *   覆盖果影
 * 1 叶卡（绳状鳞卡 L4/L5+顶梢 + 刺叶卡 minority + Low 壳卡）——
 *   createJuniperusNeedleMaterial(level)：**双叶型并存族内首例**——绳状鳞卡 SDF
 *   第 3 叶语言（对生行窗列 + 四列错位法，绳单元 24/14/8 High/Mid/Low）+ 刺卡帧
 *   v∈[2,3) 同材质 minority + 无两面色差（终审修正口径同雪松）+ 受光色差 ramp +
 *   白粉弱档 + 新梢黄绿 + 风动**两成分**（aSeed 整冠低频小幅**主成分** + aBend 末级
 *   细幅微颤——密实质量体判定 8；树高锚 = profile.totalHeight 同源 8 级〔材质侧
 *   JUNIPERUS_TREE_HEIGHT_NOMINAL = 8 同值〕；顶梢成分不消费〔windLeader* 零占位〕）
 * 注：层间 mergeGeometries useGroups=true → 恰 2 组（皮 0 / 叶卡 1，D15 免组膨胀）；
 * **浆果卡入皮组（组 0）**——juniperusGeometry 模块头记档的冻结接口（uv v 域身份
 * 标记 + aLeafRand/aBend 随组恒 0——浆果刚性，摆动语义归材质层/缺口候选）；叶影
 * 裁切深度材质走 InstanceSource 契约通道 customDepthMaterial（T009.5 立契）：
 * build 返回 createJuniperusNeedleDepthMaterial(level)（档位匹配，分档语义在工厂
 * 内）。params.preset 忽略（常绿单卡资产——D44 未支持色卡 build 忽略此参的占位
 * 期行为；cedrus 同款）。
 *
 * 色卡（D44）：**default 单卡终态**（012.3 待裁决位 4 + Spec §5.1——常绿无季相
 * 证据不建卡：FRPS/FoC/NC 三源无秋色语句〔阴性〕+「deep green」全年稳定，雌雄
 * 异株果相/新梢黄绿 = 域内变体非季相〔D44 #1/#7 不投机建卡〕）。default =
 * **深绿-暗绿带灰蓝霜调**（Spec §5.1 Verified+Observed 身份色——「密实无层冠体 +
 * 深绿-蓝绿灰色调」远景第一读向）；swatch **#4a5d47** = needleMaterial
 * needleColorSun 0x64785e / needleColorShade 0x2f4230 **严格中点**（cedrus 常绿
 * 构造中点式——阳灰绿亮/荫深绿暗受光 ramp 的中距积分读向）。**三处同源纪律
 * （T024）**：meta presets swatch ↔ juniperusMaterials 绳卡构造色 0x4a5d47（3b
 * 已同值交付）↔ CROWN_PRESETS 行（Step 3a 先锁色——沿 cedrus inert 锚先例）。
 *
 * LOD（T012.3 Step 3a 三档交付，家族方法复制）：build 透传 params.level（缺省
 * 'high'——旧无参路径逐位不变）到几何与皮/叶材质工厂；三档同 rng 流同骨架/簇位/
 * 器官决策（档间不变量、Mid 站点掩码 %4 保交叉双卡与发射计划见 juniperusGeometry
 * 模块头），材质档位变体与 customProgramCacheKey 档位唯一在 juniperusMaterials；
 * levels 声明三档（D27 首版最小化 [{id}]——调度阈值归 Runtime 常量不进 Profile）。
 *
 * LOD 预算锁定账目（预算制 D19.8；conifer 行已锁——T012.1，非候选带流程：实测
 * 落带记档 = **Step 3a 初版探针 2026-09-29**，8 槽 × 3 档〔Step 4 密度校准回路
 * 开放——出带调簇密度或抑制〕）：**High ≤ 40000 / Mid 6000–10000 / Low
 * 1500–3000 / Canopy ≤ 500**。实测带：**High 26438–38892**（皮恒 16918〔主干
 * 288 + 底盖 12 + L1 2058〔21 管 = 20 层枝 + 顶梢〕+ L2 2400 + L3 3200 + L4 3840
 * + L5 5120〕+ 绳卡/刺卡 4196–10469 张 ×2 + 浆果 264–370 枚 ×4；slot-1 幼尖塔
 * 最低 / slot-2 老树阔卵密簇最高——上限用满 66–98%，沿雪松校准先例带）；**Mid
 * 6264–9204**（皮恒 2838 + 存活簇位 /5 × 交叉双卡 + 刺卡全局序 /5 + 浆果全量
 * 〔身份信号——双熟度并存〕——**Step 4 校准 %4 → %5 掩码保带**）；**Low 1860–2810**
 * （皮恒 750 + 壳卡 = ⌈保留簇/5⌉ × 2、浆果省略〔远距亚像素 6–8mm〕）；rng 消费
 * slot-0 三档恒等 **61045**（快照锁——浆果账目零 rng；**Step 4 校准联动 56851 →
 * 61045**：簇 13/9 + 顶梢 10）、minY 三档恒 0；slot-0 High 总面 **34174** = 皮
 * 16918 + 绳卡 7308×2 + 刺卡 686×2 + 浆果 317×4（meta triangleCount 实数）；
 * 树高涌现 = profile 树高 ×1.02–1.11（slot-0 8.19 vs 锚 8——冠顶形成位预留后
 * 残余 +2.4%）。**Step 4 密度校准记档（2026-09-29，M25 同式冠带窗口 8.0% →
 * 17.6%/绿像素 +119%）**：簇 12/8 → 13/9 + 顶梢 6 → 10、绳卡 0.18–0.30 →
 * 0.24–0.32、轮廓比 2.6–4.2 → 2.0–3.2、末级 CHILD_LENGTH_RATIO [0.58, 0.85]
 * → [0.66, 0.95]、卡姿沿枝前向 0.2 → 0.55 + 全方位斜立倾侧带、childPlan ts
 * 外推、slot-2/7 抑制微调保预算带——详细校准账目见 docs/acceptance/t012/012.3/。
 *
 * 边界：每次调用 new 全部 geometry/material/深度材质（所有权随调用移交调用方，缓存
 * 会 dispose，禁止模块级共享对象，D17）；不建模记档（Spec 有事实、本资产几何不
 * 表达）：雄球花春花相（2–4 月物候窗——主语境 9 月末不消费，判定 5 明文 + 雌雄
 * 异株果实账目按雌株锚记档 Constraints）、鳞叶背面腺体（照片不可读——Spec §5.1
 * 近景细节位可选未取）、老树扭曲干极端态（俄罗斯古树旁证不进生产域）、匍匐变种
 * 铺地柏/沙地柏 + 龙柏 'Kaizuka'（形态域外/后续任务复用本 Spec 骨架域）、刺叶/
 * 鳞叶比例的年龄轴分化（longShootCards 计数类恒等——比例轴缺口记档归族门，见
 * juniperusShapeProfile 模块头）——详见该文件 Unknown/不消费记档。
 */
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { buildJuniperusGeometry } from '../tree/juniperus/juniperusGeometry';
import { JUNIPERUS_SHAPE_PROFILES } from '../tree/juniperus/juniperusShapeProfile';
import {
  createJuniperusBarkMaterial,
  createJuniperusNeedleDepthMaterial,
  createJuniperusNeedleMaterial,
} from '../tree/juniperus/juniperusMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_tree_juniperus',
  name: '圆柏',
  category: 'plant',
  tags: ['植物', '树', '圆柏', 'conifer', '常绿', 'Juniperus chinensis'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 8 }, // D19：8 形态槽（T012.3 八槽形态向量——树高 4.5–10 × 冠形双型〔狭圆柱 0.22–0.30 / 卵圆 0.50 / 阔卵老树端 0.80〕× 干高 0.10–0.22 × 年龄轴〔幼尖塔→中龄定型→老树阔卵〕× 疏密轴；层数 10 密层轴结构计数恒等不进槽〔散生退化消费——记缺口候选归 T012 族门，沿两先例同位〕）
  variants: { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 }, // 参照雪松/水杉量级（D13 无新增依赖）
  triangleCount: 34174, // 实数 = slot-0 锚点 High 档（**Step 4 密度校准 2026-09-29**：皮 16918 恒定 + 绳卡 7308×2 + 刺卡 686×2 + 浆果 317×4——簇 13/9 + 顶梢 10 校准联动；多档起声明面取细模档；见模块头预算锁定账目）
  levels: [{ id: 'high' }, { id: 'mid' }, { id: 'low' }], // LOD 三档（D27 首版最小化 [{id}]——阈值归 Runtime 常量，不进 Profile）
  // Runtime 表示能力声明（D41 §三.2）：乔木 canopy 链 High → Mid → Canopy → Culled
  //（012.3 待裁决位 3：出生即声明 canopy——常绿密实冠的远景代理链；conifer canopy
  // 经 BroadleafCanopyProxy 统一实现派生、冠色进 CROWN_PRESETS 同源——**proxy/
  // 物种表 conifer 行随 3c 合并阶段落地回填**〔沿 cedrus/metasequoia 3c 接线先例；
  // CROWN_PRESETS 圆柏行已先行〕）；low 不进有效链——保留为构建档位
  representations: ['high', 'mid', 'canopy'],
  taxonomy: { category: 'plant', family: 'conifer' }, // 针叶家族契约第三实例/定稿态增量消费例（tree/conifer/ 定稿 80 位——柏科 Cupressaceae 刺柏属常绿裸子乔木按家族形态域归 conifer，taxonomy 归类表 2→3）
  presets: [
    // 色卡终态（012.3 待裁决位 4 + Spec §5.1）：default 单卡——常绿无季相证据不建卡
    //（三源无秋色语句阴性 + 深绿全年稳定；新梢黄绿/雌株果相 = 域内变体非季相）。
    // swatch #4a5d47 = needleColorSun 0x64785e / needleColorShade 0x2f4230 严格中点
    //（cedrus 常绿构造中点式）。三处同源：meta ↔ juniperusMaterials 绳卡构造色
    // 0x4a5d47（3b 已同值交付）↔ CROWN_PRESETS 行（Step 3a 先锁色）
    { id: 'default', label: '默认', swatch: '#4a5d47' },
  ],
  proceduralProfile: {
    // 跨 8 槽细模包围盒实测带（Step 3a 探针 2026-09-29：h 4.60–10.27 / w 1.24–9.29
    //——绳卡 0.18–0.30 + 刺卡 0.12–0.20 外伸涌现）。物种锚 slot-0 = 8.19m 高
    //（Spec 生产锚 8〔6–10 带中值上段〕×1.024 涌现——冠顶形成位预留后残余 +2.4%）/
    // 2.56m 冠幅（crownWidthRatio 0.28 × 卡外伸涌现——密实狭圆柱的中距体量；与阔叶
    // 8–12m / 雪松 16.5 / 水杉 20 锚同语境混植的中小量级层——北方庭园主力位）；
    // 槽间差异（slot-1 幼尖塔 1.24 宽 / slot-2 老树阔卵 9.29 宽——任务主轴柱/卵
    // 双型冠幅比两端涌现）如实入带
    heightRange: { min: 4.5, max: 10.9 }, // 实测落带（**Step 4 校准联动 2026-09-29：10.4 → 10.9**——末级链 +27% 推升树高涌现 ×1.02–1.11 → ×1.09〔slot-2 实测 10.866〕）
    widthRange: { min: 1.1, max: 10.5 }, // 同上（**9.5 → 10.5**：childPlan 外推 + 末级链增长推升 XZ 跨〔slot-2 实测 10.398——表观冠幅涌现 +12% 记档，族门横向复核项〕）
  },
};

/**
 * morphSeed → shapeProfile 路由（T012.3 八槽形态向量）：枚举 8 槽 morphSeedOf 逐位
 * 比对还原 slot 索引（O(8) 纯查表，确定性）；非槽种子（如测试直传任意 seed）与未填
 * 槽一并回落 slot-0 标准组合（雪松/水杉/阔叶 13 树前后行为兼容同构）。**不扩展
 * ProceduralBuild 公共签名**。
 */
function profileForSeed(seed: number) {
  for (let slot = 0; slot < 8; slot++) {
    if (seed === morphSeedOf(meta.id, slot)) return JUNIPERUS_SHAPE_PROFILES[Math.min(slot, JUNIPERUS_SHAPE_PROFILES.length - 1)]!;
  }
  return JUNIPERUS_SHAPE_PROFILES[0]!;
}

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.seed = morphSeed（SourceCache 传 morphSeedOf(assetId, slot)；缺省 = slot-0 锚点）
  const seed = params?.seed ?? morphSeedOf(meta.id, 0);
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧路径逐位不变；
  // 不参与 shapeSlot/morphSeed/sourceKey 形态身份——档位缓存维度归 ProceduralSourceCache）
  const level = params?.level ?? 'high';
  // params.preset = 色卡 id（D44）：常绿单卡资产忽略（cedrus 同款占位期行为——
  // default 卡 = 现行材质行为，无卡间差异）
  const rng = mulberry32(seed);
  const { geometry } = buildJuniperusGeometry(rng, profileForSeed(seed), level);
  // 组 0 皮（干+枝+底盖+浆果卡，uv v 域二分支配方）/ 组 1 叶卡（绳卡+刺卡+Low 壳卡）
  // ——契约序 [皮, 叶卡] = mergeGeometries 层序（juniperusGeometry 冻结接口）
  const bark = createJuniperusBarkMaterial(level);
  const leaf = createJuniperusNeedleMaterial(level);
  // 影 pass 叶卡裁切走 InstanceSource 契约通道——工厂每次 new（build 契约「每次调用
  // new 全部资源」天然满足），档位随 level 匹配；归源所有（缓存 dispose）
  return {
    geometry,
    material: [bark, leaf],
    customDepthMaterial: createJuniperusNeedleDepthMaterial(level),
  };
}
