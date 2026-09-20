/**
 * runtime/procedural/assets/asset_tree_camphor.asset —— 程序化植物资产：香樟
 * （Cinnamomum camphora，T011.2 阔叶家族第三实例——方法复制自朴树 asset_tree_celtis，
 * 常绿阔叶首个实例）。
 *
 * 职责：D19 契约链上的 slot-0 锚点形态资产——build(params?) 以 mulberry32(params.seed)
 *      驱动全部分枝/叶簇随机量（**rng 消费顺序即契约**：同 seed 逐位同结果），几何生成
 *      全部在 ./tree/camphor/camphorGeometry（五级递归分枝 + 锥度枝干 + 枝梢驱动叶簇烘焙
 *      + 冠内通透三规则 + 树皮近景微起伏——家族方法整体复制；香樟算法细节：干更矮
 *      （干高参数域 0.38–0.43 vs 朴树 0.44–0.50）、骨架 5+1 开张横展 46–68°、广卵形冠
 *      （外层 upturn 上收的冠缘收口）、常绿满密通透参数收束（空隙 10–15%）、纵裂深沟
 *      树皮微起伏（0.036 / {3,4,6} / drift 3.2——vs 朴树浅斑 0.016/{4,5,6}/16、夏栎纵脊
 *      0.033/{3,4,5}/0.85 三分化）、狭长卵状椭圆叶卡 0.06–0.095m × 1.8–2.4 长宽比
 *      ——全部数值依据 docs/research/camphor-reference.md Spec 1.0（含主代理终审记档），
 *      逐字段注释见 ./tree/camphor/camphorShapeProfile）。形态参数类型 = 阔叶家族契约
 *      ./tree/broadleaf/broadleafShapeProfile 第三实例；build 内做 morphSeed → slot →
 *      profile 路由（profileForSeed O(8) 纯查表，非槽种子回落 slot-0——公共签名不变，
 *      不扩 ProceduralBuild）。params.seed 缺省回落 slot-0 锚点 morphSeed
 *      （morphSeedOf('asset_tree_camphor', 0)——与 ProceduralSourceCache 传入值逐位一致：
 *      无参路径 = 缓存路径 = 同一棵锚点树）。
 *      尺度参照真实乔木：中龄公园个体锚 ≈8m 高 / ≈6.9m 冠幅（8 槽带 7.41–9.32m 高 /
 *      5.09–7.96m 宽——proceduralProfile 全槽实测带）；原点 = 底部中心 minY 精确 0。
 * 材质分层表（materialIndex → 部件 → 材质；配方在 ./tree/camphor/camphorMaterials——
 *      park-shader-agent 并行交付，导出签名冻结（与 celtisMaterials 同构）：
 *      createCamphorBarkMaterial / createCamphorLeafMaterial /
 *      createCamphorLeafDepthMaterial，均 (level?: ProceduralLevel) => 材质）：
 *      0 树皮（主干+五级枝+底盖）—— createCamphorBarkMaterial(level)：香樟黄褐-灰褐
 *        纵裂深沟皮（Spec bark_archetype Verified [1][2][6]——与夏栎脊沟、朴树浅斑
 *        三分化；几何侧微起伏幅度 0.036 / 谐波 {3,4,6} / drift 3.2 见 profile）
 *      1 叶簇卡（L4/L5 枝梢簇内烘焙）—— createCamphorLeafMaterial(level)：浓绿-深绿
 *        常绿基调 + SDF 卵状椭圆全缘叶（离基三出脉 + 脉腋腺窝——Spec §4 叶形节）+
 *        两面区分（上面光泽/背面灰绿粉感）+ aLeafRand 逐叶变奏 + 风动（aSeed 整树
 *        缓摆 + aBend 快颤）
 *      注：层间 mergeGeometries useGroups=true → 恰 2 组（皮 0 / 叶 1，D15 免组膨胀）；
 *      叶影裁切深度材质走 InstanceSource 契约通道 customDepthMaterial（T009.5 立契）：
 *      build 返回 createCamphorLeafDepthMaterial(level)（档位匹配，分档语义在工厂内）。
 * 叶卡顶点属性（几何固有，冻结契约沿用）：aLeafRand（逐叶随机 ∈ [0,1)，同卡 6 顶点同
 *      值）、aBend（风动摆幅权重，卡内根→尖非降；树皮组恒 0）。
 * 边界：每次调用 new 全部 geometry/material/深度材质（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象，D17）；不建模记档（Spec 有事实、本资产不表达）：
 *      樟脑气味（语义）、果实 6–8mm（面数尺度不可辨）、春季换叶季相（归材质/风格层）、
 *      叶柄（叶卡抽象）、离基三出脉/脉腋腺窝几何形（归材质 SDF）、苔藓附生（归树皮
 *      材质）——详见 camphorShapeProfile 模块头。
 * LOD（T011.2 三档交付，家族方法逐位复制）：build 透传 params.level（缺省 'high'——
 *      旧无参路径逐位不变）到几何与皮/叶材质工厂；三档同 rng 流同骨架决策（档间不变量、
 *      Mid ⊂ High 掩码口径与发射计划见 camphorGeometry 模块头），材质档位变体与
 *      customProgramCacheKey 档位唯一在 camphorMaterials；levels 声明三档（D27 首版
 *      最小化 [{id}]——调度阈值归 Runtime 常量不进 Profile）。
 * LOD 预算锁定账目（预算制 D19.8——camphorGeometry 模块头引用此处）：锁定预算
 *      （三角形，皮 + 叶 = 总面）High ≤ 40000 且 ≥ 28754 / Mid 6000–10000 / Low
 *      1500–3000——**家族行沿用**（docs/procedural-assets/lod-spec.md §5.2 阔叶乔木行，
 *      T009.6 锁定不重开；本任务不回写家族表）。8 槽 × 3 档实测带（2026-09-19 探针，
 *      规范种子）：High 总面 29202–37228（slot-6 疏松最低 / slot-7 丰满最高；叶卡
 *      4210–8223、保留簇 327–535）、Mid 总面 6722–9348（叶卡 1317–2735 ≈ High 存活卡
 *      × 6/18）、Low 总面 1658–2470（壳卡 = 保留簇 × 2）；皮恒 20782 / 3882 / 330
 *      （High/Mid/Low——主干 14 段 ×14 + 底盖 14 + 五级 6/18/54/162/324 枝；Mid 径向降
 *      6/5/4/3/3/3 + L5 不发射、Low 主干+L1 极简）、rng 消费槽内三档恒等（slot-0 快照
 *      147058；跨槽 145294–148948 随保留簇数——夏栎/朴树同机制）、minY 三档恒 0。
 *      锁定依据：实测带全部落家族行带内 → 按家族行锁入（High 下沿 28754 为夏栎实测带
 *      参考下沿——slot-6 实测 29202 高于下沿不阻塞，记档；Mid/Low 出带须调结构计数
 *      重测——未触发；slot-6 密度 0.76 初值实测 28772 距下沿仅 18 面无余量，回调 0.79
 *      留余量——探针记录见 camphorShapeProfile slot-6 注释）。
 */
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { buildCamphorGeometry } from '../tree/camphor/camphorGeometry';
import { CAMPHOR_SHAPE_PROFILES } from '../tree/camphor/camphorShapeProfile';
import { createCamphorBarkMaterial, createCamphorLeafDepthMaterial, createCamphorLeafMaterial } from '../tree/camphor/camphorMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_tree_camphor',
  name: '香樟',
  category: 'plant',
  tags: ['植物', '树', '樟树', '香樟', 'broadleaf'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 8 }, // D19：8 形态槽（T011.2 八槽形态向量全量交付）
  variants: { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 }, // 参照朴树量级（D13 无新增依赖）
  triangleCount: 33702, // 实数 = slot-0 锚点 High 档结构计数（皮 20782 恒定 + 叶簇卡 6460×2；多档起声明面取细模档；见模块头预算锁定账目）
  levels: [{ id: 'high' }, { id: 'mid' }, { id: 'low' }], // LOD 三档（D27 首版最小化 [{id}]——阈值归 Runtime 常量，不进 Profile）
  taxonomy: { category: 'plant', family: 'broadleaf' }, // 阔叶家族契约第三实例（tree/broadleaf/，T010.1；常绿阔叶首个实例——常绿性无家族字段，由密度参数 + 材质表达，见报告契约缺口记档）
  proceduralProfile: {
    // 跨 8 槽细模包围盒实测带（T011.2 探针：h 7.41–9.32 / w 5.09–7.96）。
    // 物种锚 slot-0 ≈8.58m 高 / 6.86m 冠幅（≈8m 中龄公园个体，Spec §2 弱 Inferred——
    // 与夏栎 ≈8m、朴树 ≈8.5m 同语境可混植量级）；槽间差异（slot-3 偏冠 7.96 宽 /
    // slot-7 丰满 7.77 宽——朴树 slot-3 9.90 同类容纳域量级收窄）如实入带
    heightRange: { min: 7.41, max: 9.32 },
    widthRange: { min: 5.09, max: 7.96 },
  },
};

/**
 * morphSeed → shapeProfile 路由（T011.2 八槽形态向量）：枚举 8 槽 morphSeedOf 逐位比对
 * 还原 slot 索引（O(8) 纯查表，确定性）；非槽种子（如测试直传任意 seed）与未填槽一并
 * 回落 slot-0 标准组合（夏栎/朴树前后行为兼容同构）。**不扩展 ProceduralBuild 公共签名**。
 */
function profileForSeed(seed: number) {
  for (let slot = 0; slot < 8; slot++) {
    if (seed === morphSeedOf(meta.id, slot)) return CAMPHOR_SHAPE_PROFILES[Math.min(slot, CAMPHOR_SHAPE_PROFILES.length - 1)]!;
  }
  return CAMPHOR_SHAPE_PROFILES[0]!;
}

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.seed = morphSeed（SourceCache 传 morphSeedOf(assetId, slot)；缺省 = slot-0 锚点）
  const seed = params?.seed ?? morphSeedOf(meta.id, 0);
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧路径逐位不变；
  // 不参与 shapeSlot/morphSeed/sourceKey 形态身份——档位缓存维度归 ProceduralSourceCache）
  const level = params?.level ?? 'high';
  const rng = mulberry32(seed);
  const { geometry } = buildCamphorGeometry(rng, profileForSeed(seed), level);
  const bark = createCamphorBarkMaterial(level); // 组 0（契约序 [皮, 叶]——mergeGeometries 层序）
  const leaf = createCamphorLeafMaterial(level);
  // 影 pass 叶影裁切走 InstanceSource 契约通道——工厂每次 new（build 契约「每次调用 new
  // 全部资源」天然满足），档位随 level 匹配；归源所有（缓存 dispose）
  return {
    geometry,
    material: [bark, leaf],
    customDepthMaterial: createCamphorLeafDepthMaterial(level),
  };
}
