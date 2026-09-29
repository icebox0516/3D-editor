/**
 * runtime/procedural/assets/asset_tree_cedrus.asset —— 程序化植物资产：雪松
 * （Cedrus deodara (Roxb.) G. Don，松科雪松属常绿乔木，FRPS 7:200 正名「雪松」，
 * T012.1 针叶家族 conifer **第一实例/首例**：层状轮生骨架 + 长短枝双挂点 + 层隙观感
 * 带 + 球果直立账目四重新形态语言首证——与阔叶 13 树方法同源、挂点语言从零改写）。
 * 公园孤立中龄个体 ≈16.5m（Spec §2 生产锚 15–18m 带中值——高于阔叶 8–12m 族锚，
 * 混植层次来源）。
 *
 * 职责：D19 契约链上的 slot-0 锚点形态资产——build(params?) 以 mulberry32(params.seed)
 * 驱动全部分枝/簇位随机量（**rng 消费顺序即契约**：同 seed 逐位同结果；**球果账目零
 * rng**——posHash 确定性布点，vs platanus 果序 rng roll 的组 0 带状浮动规避记档），
 * 几何生成全部在 ./tree/cedrus/cedrusGeometry（层位量化挂点 + 层角梯度 + 层板拱形/
 * 外缘下卷 + droop 垂帘链 + 顶梢专路 + 末两级长短枝双挂点 + 层隙密度场 + 球果直立
 * 账目 + LOD 三档同流派生——机制映射与结构计数见该文件模块头）。形态参数类型 =
 * 针叶家族契约草案 ./tree/conifer/coniferShapeProfile（雪松 = 第一实例，D37.2 草案
 * 首证）；数值与槽组合见 ./tree/cedrus/cedrusShapeProfile（全部数值依据
 * docs/research/cedrus-reference.md Spec 1.0 含终审记档）；build 内做 morphSeed →
 * slot → profile 路由（profileForSeed O(8) 纯查表，非槽种子回落 slot-0——公共签名
 * 不变，不扩 ProceduralBuild）。params.seed 缺省回落 slot-0 锚点 morphSeed
 * （morphSeedOf('asset_tree_cedrus', 0)——与 ProceduralSourceCache 传入值逐位一致）。
 * 原点 = 底部中心 minY 精确 0。
 *
 * 材质分层表（materialIndex → 部件 → 材质；配方在 ./tree/cedrus/cedrusMaterials
 * ——park-shader-agent 并行交付，导出签名冻结〔沿 camphor/ligustrum 常绿单卡先例，
 * 无 preset 尾参〕：createCedrusNeedleMaterial / createCedrusBarkMaterial /
 * createCedrusNeedleDepthMaterial，均 (level?: ProceduralLevel) => 材质）：
 * 0 树皮（主干+五级枝+底盖+**球果卡**）—— createCedrusBarkMaterial(level)：
 *   深灰鳞状方块片独立语言位（bark 组 3–8cm 方-长方板块 / 沟浅-中近黑 / 块顶浅灰褐
 *   ——Spec §5 Verified，vs 阔叶纵沟脊/片剥谱系分化）；**按 uv v 域分流球果配方**
 *   （将熟 v∈[5,6) 绿→红褐转色档〔u = 逐果色档〕/ 幼果 v∈[6,7) 淡绿 / 宿存中轴
 *   v∈[7,8) 细梗淡褐——材质侧冻结接口）；深度材质皮组 aLeafRand=0 实心守卫覆盖果影
 * 1 针叶卡（短枝莲座簇卡 + 长枝散生针卡）—— createCedrusNeedleMaterial(level)：
 *   灰绿-蓝绿-银灰粉调身份（阳银荫深受光色差 + 无两面色差——针叶辐射着生）+
 *   莲座簇 SDF（20 针放射——新形态语言，3b 侧最小扩展）+ aLeafRand 逐卡变奏 +
 *   风动两层三成分（aSeed 整层慢摆 + aBend 垂帘高频颤 + 顶梢摆幅——树高锚 =
 *   profile.totalHeight 同源 16.5 级，阔叶 8–12m 锚 → 1/实测树高重锚）
 * 注：层间 mergeGeometries useGroups=true → 恰 2 组（皮 0 / 针叶卡 1，D15 免组膨胀）；
 * **球果卡入皮组（组 0）**——cedrusGeometry 模块头记档的冻结接口（uv v 域身份标记 +
 * aLeafRand/aBend 随组恒 0——球果刚性，摆动语义归材质层/缺口候选）；叶影裁切深度
 * 材质走 InstanceSource 契约通道 customDepthMaterial（T009.5 立契）：build 返回
 * createCedrusNeedleDepthMaterial(level)（档位匹配，分档语义在工厂内）。
 * 色卡（D44）：**default 单卡终态**（T012.1 待裁决位 4 + Spec §5 正面证据：FRPS「终年
 * 常绿」+ NC State evergreen 无秋色字段〔阴性记档〕+ 冬季三点照片直证——全年叶色稳定
 * 无季相卡；年内新梢银灰白粉调 = 叶龄域内变体非季相）；swatch #6b8273（灰绿-蓝绿中调
 * ——合并阶段同源回写：= cedrusMaterials 针叶构造色 sun 0x9db3a6 / shade 0x39503f
 * 的严格中点，vs 工程冻结初值 0x6b8a72 ΔG 8——T024 swatch = 叶构造色三处同源纪律）。
 *
 * LOD（T012.1 Step 3a 三档交付，家族方法逐位复制）：build 透传 params.level（缺省
 * 'high'——旧无参路径逐位不变）到几何与皮/针材质工厂；三档同 rng 流同骨架/簇位/球果
 * 决策（档间不变量、Mid ⊂ High 掩码口径与发射计划见 cedrusGeometry 模块头），材质档位
 * 变体与 customProgramCacheKey 档位唯一在 cedrusMaterials；levels 声明三档（D27 首版
 * 最小化 [{id}]——调度阈值归 Runtime 常量不进 Profile）。
 *
 * LOD 预算锁定账目（预算制 D19.8；**conifer 候选带探针实测锁定**——T012.1 待裁决位 2，
 * 实测 2026-09-29 规范种子，回写 lod-spec §5.2 归主代理）：候选带 **High ≤ 40000 /
 * Mid 6000–10000 / Low 1500–3000**（对齐 broadleaf 锁定行；Canopy ≤ 500 归 proxy 侧）。
 * **Step 4 密度校准 2026-09-29 终测带**（D30 一轮校准：五帧 + B25 逆光判读「层板
 * 稀疏 / winter-like」→ 簇位 1120→2464 + 莲座簇**交叉双卡** + 卡面 0.30–0.44 + 散生
 * 卡 2/1 + 簇抑制 0.10——M25 冠区点亮 14.7%→33.0%、B25 逆光 ~5–10%→26.2%）：**High
 * 总面 32224–38382**（皮恒 28142 + 莲座簇双卡 + 散生卡 + 球果 58–87 × 4；slot-6 疏松
 * 最低 / slot-2 宽塔密簇最高，上限用满 96%）⊂ 带内（参考下沿 30000）；**Mid 总面
 * 6288–9396**（皮恒 3950 + 每簇保首卡掩码 + 球果全量保留〔身份信号〕）；**Low 总面
 * 1632–2578**（皮恒 1030 + 壳卡 = ⌈保留簇/3⌉ × 2、球果省略记档〔远距亚像素〕）；rng
 * 消费 slot-0 三档恒等 37764（快照锁）、跨槽 35408–38246 ±4%（通透 roll 计数机制——
 * 簇级抑制保留簇数浮动，13 阔叶先例同款；校准前 32507）；
 * 皮拓扑槽间恒等：L1–L5 = [29, 56, 112, 224, 448]（28 层枝 + 1 顶梢）；层间距涌现
 * 1.49–1.91m ⊂ Spec 算术推断 1.5–2m（Unknown 项的探针验证——slot-1/3 幼树立枝贴地
 * 型下沿 1.49 属干高比域端涌现，记档）；minY 三档恒 0；树高涌现 = profile 树高
 * ×0.95–1.02（slot-0 实测 15.97 vs 锚 16.5〔−3.2% ⊂ ±10% 树高锚容差〕——顶梢点头
 * 段的确定性回落）。
 *
 * 边界：每次调用 new 全部 geometry/material/深度材质（所有权随调用移交调用方，缓存会
 * dispose，禁止模块级共享对象，D17）；不建模记档（Spec 有事实、本资产几何不表达）：
 * 莲座簇内针形/三棱截面/气孔线（归 3b SDF）、雄球花（秋末抽出早春散粉后落——物候窗
 * 主视觉不消费，Spec §5）、老树平台顶极端态（Unknown 不消费）、glaucous 银灰栽培型
 * （色相域内微调不另立槽）、真轮生对生度（近轮生 + 抖动工程表达）——详见
 * cedrusShapeProfile 模块头 Unknown/不消费记档。
 */
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { buildCedrusGeometry } from '../tree/cedrus/cedrusGeometry';
import { CEDRUS_SHAPE_PROFILES } from '../tree/cedrus/cedrusShapeProfile';
import {
  createCedrusBarkMaterial,
  createCedrusNeedleDepthMaterial,
  createCedrusNeedleMaterial,
} from '../tree/cedrus/cedrusMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_tree_cedrus',
  name: '雪松',
  category: 'plant',
  tags: ['植物', '树', '雪松', 'conifer', '常绿', 'Cedrus deodara'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 8 }, // D19：8 形态槽（T012.1 八槽形态向量——树高 12.5–19.5 × 冠幅 0.30–0.50 × 干高 0.10–0.40 × 年龄轴 × 疏密轴；层数 6–8 轴结构计数恒等不进槽，记缺口候选归 T012 族门）
  variants: { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 }, // 参照阔叶 13 树量级（D13 无新增依赖）
  triangleCount: 37042, // 实数 = slot-0 锚点 High 档结构计数（Step 4 密度校准后：皮 28142 恒定 + 针叶卡 4306×2 + 球果 72×4；多档起声明面取细模档；见模块头预算锁定账目）
  levels: [{ id: 'high' }, { id: 'mid' }, { id: 'low' }], // LOD 三档（D27 首版最小化 [{id}]——阈值归 Runtime 常量，不进 Profile）
  // Runtime 表示能力声明（T021.7 接线，D41 §三.2）：乔木 canopy 链 High → Mid → Canopy →
  // Culled（阔叶 13 树现状同构——T012.1 待裁决位 3：出生即声明 canopy；conifer canopy 经
  // BroadleafCanopyProxy 统一实现派生、冠色进 CROWN_PRESETS 同源——**proxy/材质表 conifer
  // 行合并阶段随 cedrusMaterials 落地回填**〔Step 3a 并行期 inert 锚先行，见
  // BROADLEAF_CANOPY_CROWN_PRESETS 行注释〕）；low 不进有效链——保留为构建档位
  representations: ['high', 'mid', 'canopy'],
  taxonomy: { category: 'plant', family: 'conifer' }, // 针叶家族契约第一实例（tree/conifer/，T012.1 D37.2 草案首证——松科 Pinaceae 裸子乔木按家族形态域归 conifer 新 family 行，taxonomy 归类表 0→1）
  presets: [{ id: 'default', label: '默认', swatch: '#6b8273' }], // 色卡终态（T012.1 待裁决位 4 + Spec §5 正面证据）：default 单卡——FRPS「终年常绿」+ NC evergreen 无秋色字段（阴性）+ 冬季三点照片直证，全年叶色稳定无季相卡；年内新梢银灰白粉调 = 叶龄域内变体非季相（D44 #1/#7 不投机建卡）；swatch = 针叶构造色 sun/shade 严格中点（合并阶段同源回写 0x6b8a72→0x6b8273，ΔG 8——T024 三处同源纪律：meta ↔ cedrusMaterials 构造色 ↔ CROWN_PRESETS 行）
  proceduralProfile: {
    // 跨 8 槽细模包围盒实测带（Step 4 密度校准后 2026-09-29 终测：h 12.07–19.33 /
    // w 4.50–13.06——卡面 0.30–0.44 上调后冠幅带外溢 ≈+0.5m）。物种锚 slot-0 ≈15.82m
    // 高 / 9.18m 冠幅（Spec 生产锚 16.5〔15–18 带中值〕×0.959 涌现——顶梢点头段回落
    // −4.1% ⊂ ±10% 树高锚容差；与阔叶 8–12m 族锚同语境混植的中-高量级差）；槽间差异
    // （slot-3 挤压窄塔 6.91 宽 / slot-2 成熟宽塔 13.06 宽——任务主轴 0.3–0.5 冠幅比
    // 两端涌现）如实入带
    heightRange: { min: 11.9, max: 19.5 },
    widthRange: { min: 4.3, max: 13.2 },
  },
};

/**
 * morphSeed → shapeProfile 路由（T012.1 八槽形态向量）：枚举 8 槽 morphSeedOf 逐位比对
 * 还原 slot 索引（O(8) 纯查表，确定性）；非槽种子（如测试直传任意 seed）与未填槽一并
 * 回落 slot-0 标准组合（阔叶 13 树前后行为兼容同构）。**不扩展 ProceduralBuild 公共签名**。
 */
function profileForSeed(seed: number) {
  for (let slot = 0; slot < 8; slot++) {
    if (seed === morphSeedOf(meta.id, slot)) return CEDRUS_SHAPE_PROFILES[Math.min(slot, CEDRUS_SHAPE_PROFILES.length - 1)]!;
  }
  return CEDRUS_SHAPE_PROFILES[0]!;
}

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.seed = morphSeed（SourceCache 传 morphSeedOf(assetId, slot)；缺省 = slot-0 锚点）
  const seed = params?.seed ?? morphSeedOf(meta.id, 0);
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧路径逐位不变；
  // 不参与 shapeSlot/morphSeed/sourceKey 形态身份——档位缓存维度归 ProceduralSourceCache）
  const level = params?.level ?? 'high';
  const rng = mulberry32(seed);
  const { geometry } = buildCedrusGeometry(rng, profileForSeed(seed), level);
  // 组 0 皮（干+枝+底盖+球果卡，uv v 域分流配方）/ 组 1 针叶卡（莲座簇+散生）——契约序
  // [皮, 针叶卡] = mergeGeometries 层序（cedrusGeometry 冻结接口）；常绿单卡无 preset 尾参
  const bark = createCedrusBarkMaterial(level);
  const needle = createCedrusNeedleMaterial(level);
  // 影 pass 针叶裁切走 InstanceSource 契约通道——工厂每次 new（build 契约「每次调用 new
  // 全部资源」天然满足），档位随 level 匹配；归源所有（缓存 dispose）
  return {
    geometry,
    material: [bark, needle],
    customDepthMaterial: createCedrusNeedleDepthMaterial(level),
  };
}
