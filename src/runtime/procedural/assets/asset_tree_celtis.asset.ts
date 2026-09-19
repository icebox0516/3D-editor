/**
 * runtime/procedural/assets/asset_tree_celtis.asset —— 程序化植物资产：朴树
 * （Celtis sinensis，T011.1 阔叶家族第二实例——方法复制自夏栎 asset_tree_3a）。
 *
 * 职责：D19 契约链上的 slot-0 锚点形态资产——build(params?) 以 mulberry32(params.seed)
 *      驱动全部分枝/叶簇随机量（**rng 消费顺序即契约**：同 seed 逐位同结果），几何生成
 *      全部在 ./tree/celtis/celtisGeometry（五级递归分枝 + 锥度枝干 + 枝梢驱动叶簇烘焙
 *      + 冠内通透三规则 + 树皮近景微起伏——夏栎方法整体复制，朴树算法细节：干更高
 *      （干高参数域 0.44–0.50 vs 夏栎 0.40–0.46）、横展上举 46–64°、领导枝中庸强度、
 *      低浮雕小斑块树皮、短圆卵形叶卡 0.07–0.11m × 1.3–2.0 长宽比——全部数值依据
 *      docs/research/celtis-reference.md Spec 1.0，逐字段注释见
 *      ./tree/celtis/celtisShapeProfile）。形态参数类型 = 阔叶家族契约
 *      ./tree/broadleaf/broadleafShapeProfile 第二实例；build 内做 morphSeed → slot →
 *      profile 路由（profileForSeed O(8) 纯查表，非槽种子回落 slot-0——公共签名不变，
 *      不扩 ProceduralBuild）。params.seed 缺省回落 slot-0 锚点 morphSeed
 *      （morphSeedOf('asset_tree_celtis', 0)——与 ProceduralSourceCache 传入值逐位一致：
 *      无参路径 = 缓存路径 = 同一棵锚点树）。
 *      尺度参照真实乔木：中龄公园个体锚 ≈8.5m 高 / ≈7.4m 冠幅（8 槽带 7.56–9.82m 高 /
 *      6.06–9.90m 宽——proceduralProfile 全槽实测带）；原点 = 底部中心 minY 精确 0。
 * 材质分层表（materialIndex → 部件 → 材质；配方在 ./tree/celtis/celtisMaterials——
 *      park-shader-agent 并行交付，导出签名冻结（与 tree3aMaterials 同构）：
 *      createCeltisBarkMaterial / createCeltisLeafMaterial /
 *      createCeltisLeafDepthMaterial，均 (level?: ProceduralLevel) => 材质）：
 *      0 树皮（主干+五级枝+底盖）—— createCeltisBarkMaterial(level)：朴树灰白-灰褐
 *        平滑-浅裂小斑块低浮雕皮（Spec bark_archetype Verified [1][2][5][6]——与夏栎
 *        脊沟语言分化；几何侧微起伏幅度 0.016 / 谐波 {4,5,6} / drift 16 见 profile）
 *      1 叶簇卡（L4/L5 枝梢簇内烘焙）—— createCeltisLeafMaterial(level)：夏绿中-深绿
 *        双面区分 + SDF 卵形叶（三出脉基部 + 上半部齿——Spec 叶形节）+ aLeafRand 逐叶
 *        变奏 + 风动（aSeed 整树缓摆 + aBend 快颤）
 *      注：层间 mergeGeometries useGroups=true → 恰 2 组（皮 0 / 叶 1，D15 免组膨胀）；
 *      叶影裁切深度材质走 InstanceSource 契约通道 customDepthMaterial（T009.5 立契）：
 *      build 返回 createCeltisLeafDepthMaterial(level)（档位匹配，分档语义在工厂内）。
 * 叶卡顶点属性（几何固有，冻结契约沿用）：aLeafRand（逐叶随机 ∈ [0,1)，同卡 6 顶点同
 *      值）、aBend（风动摆幅权重，卡内根→尖非降；树皮组恒 0）。
 * 边界：每次调用 new 全部 geometry/material/深度材质（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象，D17）；不建模记档（Spec 有事实、本资产不表达）：
 *      核果 5–7mm（面数尺度不可辨）、秋色季相（交付夏绿冠层）、叶柄、弱水平层纹
 *      （低置信）——详见 celtisShapeProfile 模块头。
 * LOD（T011.1 三档交付，夏栎 T009.6 方法逐位复制）：build 透传 params.level（缺省
 *      'high'——旧无参路径逐位不变）到几何与皮/叶材质工厂；三档同 rng 流同骨架决策
 *      （档间不变量、Mid ⊂ High 掩码口径与发射计划见 celtisGeometry 模块头），材质
 *      档位变体与 customProgramCacheKey 档位唯一在 celtisMaterials（并行交付面）；
 *      levels 声明三档（D27 首版最小化 [{id}]——调度阈值归 Runtime 常量不进 Profile）。
 * LOD 预算锁定账目（预算制 D19.8——celtisGeometry 模块头引用此处）：锁定预算
 *      （三角形，皮 + 叶 = 总面）High ≤ 40000 / Mid 6000–10000 / Low 1500–3000——
 *      **家族行沿用**（docs/procedural-assets/lod-spec.md §5.2 阔叶乔木行，T009.6 锁定
 *      不重开；本任务不回写家族表）。8 槽 × 3 档实测带（2026-09-19 探针，规范种子）：
 *      High 总面 31556–39366（slot-6 疏松最低 / slot-0 标准最高；叶卡 3689–7594、
 *      保留簇 446–597）、Mid 总面 6782–9262（叶卡 1134–2374 ≈ High 存活卡 × 5/16）、
 *      Low 总面 2154–2758（壳卡 = 保留簇 × 2）；皮恒 24178 / 4514 / 370（High/Mid/Low
 *      ——主干 14 段 ×14 + 底盖 14 + 五级 7/21/63/189/378 枝；Mid 径向降 6/5/4/3/3/3 +
 *      L5 不发射、Low 主干+L1 极简）、rng 消费槽内三档恒等（slot-0 快照 155072；跨槽
 *      152656–155072 随保留簇数——夏栎同机制）、minY 三档恒 0。锁定依据：实测带全部
 *      落家族行带内 → 按家族行锁入（High 上限语义——slot-6 实测 31556 低于夏栎实测带
 *      下沿 28754 不阻塞，记档；Mid/Low 出带须调结构计数重测——未触发）。
 */
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { buildCeltisGeometry } from '../tree/celtis/celtisGeometry';
import { CELTIS_SHAPE_PROFILES } from '../tree/celtis/celtisShapeProfile';
import { createCeltisBarkMaterial, createCeltisLeafDepthMaterial, createCeltisLeafMaterial } from '../tree/celtis/celtisMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_tree_celtis',
  name: '朴树',
  category: 'plant',
  tags: ['植物', '树', '朴树', 'broadleaf'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 8 }, // D19：8 形态槽（T011.1 八槽形态向量全量交付）
  variants: { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 }, // 参照夏栎量级（D13 无新增依赖）
  triangleCount: 39366, // 实数 = slot-0 锚点 High 档结构计数（皮 24178 恒定 + 叶簇卡 7594×2；多档起声明面取细模档；见模块头预算锁定账目）
  levels: [{ id: 'high' }, { id: 'mid' }, { id: 'low' }], // LOD 三档（D27 首版最小化 [{id}]——阈值归 Runtime 常量，不进 Profile）
  taxonomy: { category: 'plant', family: 'broadleaf' }, // 阔叶家族契约第二实例（tree/broadleaf/，T010.1）
  proceduralProfile: {
    // 跨 8 槽细模包围盒实测带（T011.1 探针：h 7.562–9.820 / w 6.065–9.896）。
    // 物种锚 slot-0 ≈8.57m 高 / 7.39m 冠幅（≈8m 中龄公园个体，Spec §2 弱 Inferred）；
    // 槽间差异（slot-3 偏冠 9.89 宽 / slot-4 低冠 9.51 宽——夏栎 slot-3 9.80 同量级
    // 容纳域）如实入带
    heightRange: { min: 7.56, max: 9.82 },
    widthRange: { min: 6.06, max: 9.9 },
  },
};

/**
 * morphSeed → shapeProfile 路由（T011.1 八槽形态向量）：枚举 8 槽 morphSeedOf 逐位比对
 * 还原 slot 索引（O(8) 纯查表，确定性）；非槽种子（如测试直传任意 seed）与未填槽一并
 * 回落 slot-0 标准组合（夏栎前后行为兼容同构）。**不扩展 ProceduralBuild 公共签名**。
 */
function profileForSeed(seed: number) {
  for (let slot = 0; slot < 8; slot++) {
    if (seed === morphSeedOf(meta.id, slot)) return CELTIS_SHAPE_PROFILES[Math.min(slot, CELTIS_SHAPE_PROFILES.length - 1)]!;
  }
  return CELTIS_SHAPE_PROFILES[0]!;
}

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.seed = morphSeed（SourceCache 传 morphSeedOf(assetId, slot)；缺省 = slot-0 锚点）
  const seed = params?.seed ?? morphSeedOf(meta.id, 0);
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧路径逐位不变；
  // 不参与 shapeSlot/morphSeed/sourceKey 形态身份——档位缓存维度归 ProceduralSourceCache）
  const level = params?.level ?? 'high';
  const rng = mulberry32(seed);
  const { geometry } = buildCeltisGeometry(rng, profileForSeed(seed), level);
  const bark = createCeltisBarkMaterial(level); // 组 0（契约序 [皮, 叶]——mergeGeometries 层序）
  const leaf = createCeltisLeafMaterial(level);
  // 影 pass 叶影裁切走 InstanceSource 契约通道——工厂每次 new（build 契约「每次调用 new
  // 全部资源」天然满足），档位随 level 匹配；归源所有（缓存 dispose）
  return {
    geometry,
    material: [bark, leaf],
    customDepthMaterial: createCeltisLeafDepthMaterial(level),
  };
}
