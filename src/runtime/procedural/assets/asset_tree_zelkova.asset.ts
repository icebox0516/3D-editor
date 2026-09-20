/**
 * runtime/procedural/assets/asset_tree_zelkova.asset —— 程序化植物资产：榉树
 * （光叶榉 Zelkova serrata，T011.3 阔叶家族第四实例——方法复制自香樟
 * asset_tree_camphor，落叶阔叶第二实例：vase 形冠 + 光滑片状剥落树皮——形态语言
 * 与三先例分化最大的落叶阔叶）。
 *
 * 职责：D19 契约链上的 slot-0 锚点形态资产——build(params?) 以 mulberry32(params.seed)
 *      驱动全部分枝/叶簇随机量（**rng 消费顺序即契约**：同 seed 逐位同结果），几何生成
 *      全部在 ./tree/zelkova/zelkovaGeometry（五级递归分枝 + 锥度枝干 + 枝梢驱动叶簇烘焙
 *      + 冠内通透三规则 + 树皮近景微起伏——家族方法整体复制；榉树算法细节：干高中庸域
 *      （干高参数域 0.33–0.38 vs 香樟 0.38–0.43）、骨架 5+1 开张 42–60° 后上拱 + 末级
 *      上举（upturn 链五级全面高于三先例——vase 冠「上宽下窄 + 顶部圆穹」驱动链）、
 *      中-密通透（空隙 20–35%）、光滑基底薄片剥落斑驳微起伏树皮（0.015 / {3,5,6} /
 *      drift 11——vs 夏栎脊沟 0.033/{3,4,5}/0.85、朴树浅斑 0.016/{4,5,6}/16、香樟纵裂
 *      0.036/{3,4,6}/3.2 四分化第四种语言）、细质密叶小卡 0.04–0.06m × 1.8–2.4 长宽比
 *      ——全部数值依据 docs/research/zelkova-reference.md Spec 1.0（含主代理终审记档），
 *      逐字段注释见 ./tree/zelkova/zelkovaShapeProfile）。形态参数类型 = 阔叶家族契约
 *      ./tree/broadleaf/broadleafShapeProfile 第四实例；build 内做 morphSeed → slot →
 *      profile 路由（profileForSeed O(8) 纯查表，非槽种子回落 slot-0——公共签名不变，
 *      不扩 ProceduralBuild）。params.seed 缺省回落 slot-0 锚点 morphSeed
 *      （morphSeedOf('asset_tree_zelkova', 0)——与 ProceduralSourceCache 传入值逐位一致：
 *      无参路径 = 缓存路径 = 同一棵锚点树）。
 *      尺度参照真实乔木：中龄公园个体锚 ≈8m 高 / ≈6.6m 冠幅（8 槽带 7.47–9.68m 高 /
 *      4.96–8.52m 宽——proceduralProfile 全槽实测带；slot-4 Wireless 低矮开张端宽 > 高
 *      1.14、slot-3 偏冠端高 9.68——品种群轴展开的槽间差异如实入带，OSU 品种证据见
 *      zelkovaShapeProfile 各槽注释）；原点 = 底部中心 minY 精确 0。
 * 材质分层表（materialIndex → 部件 → 材质；配方在 ./tree/zelkova/zelkovaMaterials——
 *      park-shader-agent 并行交付，导出签名冻结（与 camphorMaterials 同构）：
 *      createZelkovaBarkMaterial / createZelkovaLeafMaterial /
 *      createZelkovaLeafDepthMaterial，均 (level?: ProceduralLevel) => 材质）：
 *      0 树皮（主干+五级枝+底盖）—— createZelkovaBarkMaterial(level)：灰白-灰绿光滑
 *        基底 + 奶油白-浅褐-锈橙暖色薄片剥落斑驳（Spec bark_archetype 四源 Verified
 *        [1][2][3][4][7]——四资产唯一带橙锈新斑的树皮语言，斑色归材质层；几何侧微起伏
 *        幅度 0.015 / 谐波 {3,5,6} / drift 11 见 profile）
 *      1 叶簇卡（L4/L5 枝梢簇内烘焙）—— createZelkovaLeafMaterial(level)：中绿-深绿
 *        细质密叶基调 + SDF 卵形渐尖叶（叶基稍偏斜 + 全缘尖头单锯齿 + 羽状脉直伸齿尖
 *        ——榆科三件套，Spec §4 叶形节 Verified）+ 两面区分（上面半光泽微糙/背面浅绿
 *        无粉感）+ aLeafRand 逐叶变奏 + 风动（aSeed 整树缓摆 + aBend 快颤）
 *      注：层间 mergeGeometries useGroups=true → 恰 2 组（皮 0 / 叶 1，D15 免组膨胀）；
 *      叶影裁切深度材质走 InstanceSource 契约通道 customDepthMaterial（T009.5 立契）：
 *      build 返回 createZelkovaLeafDepthMaterial(level)（档位匹配，分档语义在工厂内）。
 * 叶卡顶点属性（几何固有，冻结契约沿用）：aLeafRand（逐叶随机 ∈ [0,1)，同卡 6 顶点同
 *      值）、aBend（风动摆幅权重，卡内根→尖非降；树皮组恒 0）。
 * 边界：每次调用 new 全部 geometry/material/深度材质（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象，D17）；不建模记档（Spec 有事实、本资产不表达）：
 *      核果 2.5–3.5mm（面数尺度不可辨）、秋色叶橙-橙红（季相归材质/风格层，任务书
 *      「秋色不建模记档」）、花小绿色（不显眼）、叶柄（叶卡抽象）、叶基偏斜/单尖锯齿/
 *      羽状脉直伸齿尖（归材质 SDF）、冬芽圆锥状卵形（冬季裸枝语义不在常绿态观感资产）、
 *      苔藓地衣少量（归树皮材质）、两榉辨析轴（叶背毛被/冬芽并生/当年生枝色——近景
 *      材质变体维度记档）——详见 zelkovaShapeProfile 模块头。
 * LOD（T011.3 三档交付，家族方法逐位复制）：build 透传 params.level（缺省 'high'——
 *      旧无参路径逐位不变）到几何与皮/叶材质工厂；三档同 rng 流同骨架决策（档间不变量、
 *      Mid ⊂ High 掩码口径与发射计划见 zelkovaGeometry 模块头），材质档位变体与
 *      customProgramCacheKey 档位唯一在 zelkovaMaterials；levels 声明三档（D27 首版
 *      最小化 [{id}]——调度阈值归 Runtime 常量不进 Profile）。
 * LOD 预算锁定账目（预算制 D19.8——zelkovaGeometry 模块头引用此处）：锁定预算
 *      （三角形，皮 + 叶 = 总面）High ≤ 40000 且 ≥ 28754 / Mid 6000–10000 / Low
 *      1500–3000——**家族行沿用**（docs/procedural-assets/lod-spec.md §5.2 阔叶乔木行，
 *      T009.6 锁定不重开；本任务不回写家族表）。8 槽 × 3 档实测带（2026-09-20 探针，
 *      规范种子）：High 总面 32148–37568（slot-6 疏松最低 / slot-7 丰满最高；叶卡
 *      5683–8393、保留簇 490–646）、Mid 总面 7662–9496（叶卡 1890–2807 ≈ High 存活卡
 *      × 6/18）、Low 总面 2290–2914（壳卡 = 保留簇 × 2）；皮恒 20782 / 3882 / 330
 *      （High/Mid/Low——主干 14 段 ×14 + 底盖 14 + 五级 6/18/54/162/324 枝，拓扑同
 *      香樟 5+1；Mid 径向降 6/5/4/3/3/3 + L5 不发射、Low 主干+L1 极简）、rng 消费槽内
 *      三档恒等（slot-0 快照 150046；跨槽随保留簇数变化——夏栎/朴树/香樟同机制）、
 *      minY 三档恒 0。锁定依据：实测带全部落家族行带内 → 按家族行锁入（High 下沿
 *      28754 为夏栎实测带参考下沿——slot-6 实测 32148 高于下沿余量充足，记档；Mid/Low
 *      出带须调结构计数重测——未触发；每簇叶量 18 维持定档：簇均存活 10.6–15.3 卡、
 *      High 带内上部留余量，无需朴树 18→16 型下调——探针记档）。
 */
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { buildZelkovaGeometry } from '../tree/zelkova/zelkovaGeometry';
import { ZELKOVA_SHAPE_PROFILES } from '../tree/zelkova/zelkovaShapeProfile';
import { createZelkovaBarkMaterial, createZelkovaLeafDepthMaterial, createZelkovaLeafMaterial } from '../tree/zelkova/zelkovaMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_tree_zelkova',
  name: '榉树',
  category: 'plant',
  tags: ['植物', '树', '榉树', '光叶榉', 'broadleaf'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 8 }, // D19：8 形态槽（T011.3 八槽形态向量全量交付）
  variants: { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 }, // 参照朴树/香樟量级（D13 无新增依赖）
  triangleCount: 36820, // 实数 = slot-0 锚点 High 档结构计数（皮 20782 恒定 + 叶簇卡 8019×2；多档起声明面取细模档；见模块头预算锁定账目）
  levels: [{ id: 'high' }, { id: 'mid' }, { id: 'low' }], // LOD 三档（D27 首版最小化 [{id}]——阈值归 Runtime 常量，不进 Profile）
  taxonomy: { category: 'plant', family: 'broadleaf' }, // 阔叶家族契约第四实例（tree/broadleaf/，T010.1；落叶阔叶第二实例——落叶性无家族字段，由材质/季相层表达，记档同香樟常绿先例）
  proceduralProfile: {
    // 跨 8 槽细模包围盒实测带（T011.3 探针：h 7.47–9.68 / w 4.96–8.52）。
    // 物种锚 slot-0 ≈7.96m 高 / 6.59m 冠幅（≈8m 中龄公园个体，Spec §2 弱 Inferred——
    // 与夏栎 ≈8m、朴树 ≈8.5m、香樟 ≈8.6m 同语境可混植量级）；槽间差异（slot-3 偏冠
    // 高端 9.68 / slot-4 Wireless 低垂开张宽 8.52（宽 > 高 1.14）——OSU 品种群轴展开
    // 如实入带，记档见 zelkovaShapeProfile 各槽注释）
    heightRange: { min: 7.47, max: 9.68 },
    widthRange: { min: 4.96, max: 8.52 },
  },
};

/**
 * morphSeed → shapeProfile 路由（T011.3 八槽形态向量）：枚举 8 槽 morphSeedOf 逐位比对
 * 还原 slot 索引（O(8) 纯查表，确定性）；非槽种子（如测试直传任意 seed）与未填槽一并
 * 回落 slot-0 标准组合（夏栎/朴树/香樟前后行为兼容同构）。**不扩展 ProceduralBuild 公共签名**。
 */
function profileForSeed(seed: number) {
  for (let slot = 0; slot < 8; slot++) {
    if (seed === morphSeedOf(meta.id, slot)) return ZELKOVA_SHAPE_PROFILES[Math.min(slot, ZELKOVA_SHAPE_PROFILES.length - 1)]!;
  }
  return ZELKOVA_SHAPE_PROFILES[0]!;
}

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.seed = morphSeed（SourceCache 传 morphSeedOf(assetId, slot)；缺省 = slot-0 锚点）
  const seed = params?.seed ?? morphSeedOf(meta.id, 0);
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧路径逐位不变；
  // 不参与 shapeSlot/morphSeed/sourceKey 形态身份——档位缓存维度归 ProceduralSourceCache）
  const level = params?.level ?? 'high';
  const rng = mulberry32(seed);
  const { geometry } = buildZelkovaGeometry(rng, profileForSeed(seed), level);
  const bark = createZelkovaBarkMaterial(level); // 组 0（契约序 [皮, 叶]——mergeGeometries 层序）
  const leaf = createZelkovaLeafMaterial(level);
  // 影 pass 叶影裁切走 InstanceSource 契约通道——工厂每次 new（build 契约「每次调用 new
  // 全部资源」天然满足），档位随 level 匹配；归源所有（缓存 dispose）
  return {
    geometry,
    material: [bark, leaf],
    customDepthMaterial: createZelkovaLeafDepthMaterial(level),
  };
}
