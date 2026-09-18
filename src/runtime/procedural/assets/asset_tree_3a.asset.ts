/**
 * runtime/procedural/assets/asset_tree_3a.asset —— 程序化植物资产：夏栎（3A 阔叶树，T008.2）。
 *
 * 职责：D19 契约链上的 slot-0 锚点形态资产——build(params?) 以 mulberry32(params.seed)
 *      驱动全部分枝/叶簇随机量（**rng 消费顺序即契约**：同 seed 逐位同结果），几何生成
 *      全部在 ./tree/broadleafGeometry（五级递归分枝 + 锥度枝干 + T009.2 枝梢驱动叶簇
 *      烘焙——L4/L5 枝梢挂簇、簇内壳偏置发卡、簇级距离抑制 + 冠内通透三规则过滤；
 *      T009.1 起形态参数消费 ./tree/tree3aShapeProfile 的夏栎私有 shapeProfile——
 *      build 内做 morphSeed → slot → profile 路由，公共签名不变；皮拓扑恒定皮面数恒等、
 *      叶簇卡数随簇级剔除与通透规则在同槽同 seed 下恒定）。params.seed 缺省回落 slot-0
 *      锚点 morphSeed（morphSeedOf('asset_tree_3a', 0)——domain 纯函数，与
 *      ProceduralSourceCache 传入值逐位一致：无参路径 = 缓存路径 = 同一棵锚点树，
 *      008.3 调材质看到的永远是它）。
 *      尺度参照真实乔木：总高 7.4–8.5m、冠幅 5.4–6.6m；原点 = 底部中心 minY 精确 0。
 * 材质分层表（materialIndex → 部件 → 材质；配方在 ./tree/tree3aMaterials——onBeforeCompile
 *      注入工厂，SDF 叶形/透光/风动/树皮配方与成本记账见该模块头）：
 *      0 树皮（主干+五级枝+底盖）—— createTree3aBarkMaterial：灰主调灰褐 #5c534a
 *        （T009.4 灰度校正，Spec bark_color Verified [6]）/ m 0 /
 *        r 0.93 / FrontSide；脊-沟-板+节疤+苔痕（uv 域+位置域门控）+ 整树缓摆（与叶同
 *        公式同相位；aBend 恒 0 快颤层天然不作用）
 *      1 叶簇卡（L4/L5 枝梢簇内烘焙——T009.2 枝梢驱动叶簇）—— createTree3aLeafMaterial：
 *        叶绿 #4e7c33 / m 0 / r 0.85 /
 *        DoubleSide（卡面双面可见；three 双面光照自动翻背面法线）；SDF 橡叶形 alpha
 *        （alphaTest 0.5 + alphaToCoverage 抗锯边）+ 背光透射 + aLeafRand 逐叶变奏 +
 *        风动（整树缓摆 aSeed 相位 + aBend 叶片快颤）；uTime 经材质级 uniforms 接
 *        TimeUniformService（D19.7：uTime 全局风帧 / aSeed 个体相位）
 *      注：层间 mergeGeometries useGroups=true → 恰 2 组（皮 0 / 叶 1，D15 免组膨胀）；
 *      叶影裁切深度材质（createTree3aLeafDepthMaterial）无 InstanceSource 契约通道——
 *      产品路径降级为影无裁切（2026-09-18 起池路径桶网格已投影，叶影 = 整卡剪影），
 *      DEV 舞台自持 Mesh 挂（取舍记档见 tree3aMaterials 头）。
 * 叶卡顶点属性（几何固有，冻结契约）：aLeafRand（逐叶随机 ∈ [0,1)，同卡 6 顶点同值）、
 *      aBend（风动摆幅权重 = 离枝距离 + 冠内高度权重，卡内根→尖非降；树皮组恒 0）。
 * 边界：每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会 dispose，
 *      禁止模块级共享对象，D17）；8 槽差异归 008.5（本资产只交付 slot-0，shapeFamily
 *      size 8 为槽路由声明面）。
 * LOD（T009.6 夏栎三档交付）：build 透传 params.level（缺省 'high'——旧无参路径逐位
 *      不变）到几何与皮/叶材质工厂；三档同 rng 流同骨架决策（档间不变量、Mid⊂High 掩码
 *      口径与发射计划见 broadleafGeometry 模块头 T009.6 段），材质档位变体（Mid 去节疤
 *      /Low 去透光等）见 tree3aMaterials；levels 声明三档（D27 首版最小化 [{id}]——调度
 *      阈值归 Runtime 常量不进 Profile，距离切换 T006 消费）。
 * LOD 预算锁定账目（预算制 D19.8——broadleafGeometry 模块头引用此处）：锁定预算
 *      （三角形，皮 + 叶 = 总面）High ≤ 40000 / Mid 6000–10000 / Low 1500–3000。
 *      8 槽 × 3 档实测带（2026-09-19 探针）：High 总面 28754–38780（slot-6 最低 /
 *      slot-7 最高；叶卡 4015–9028、保留簇 333–455）、Mid 总面 6414–9650（叶卡
 *      1266–2884 ≈ High 存活卡 × 7/22）、Low 总面 1662–2150（壳卡 = 保留簇 × 2）；
 *      皮恒 20724 / 3882 / 330、rng 消费三档恒等 177234、minY 三档恒 0。锁定依据：
 *      候选带为初始参考——High 以 40K 上限锁入（slot-6 实测 28754 略低于候选带下限
 *      30K，面数预算意义在上限）；Mid/Low 实测带均落候选带内，按候选带锁入。
 */
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { buildBroadleafGeometry } from '../tree/broadleafGeometry';
import { TREE3A_SHAPE_PROFILES } from '../tree/tree3aShapeProfile';
import { createTree3aBarkMaterial, createTree3aLeafMaterial } from '../tree/tree3aMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_tree_3a',
  name: '夏栎',
  category: 'plant',
  tags: ['植物', '树', '橡树', 'broadleaf', '3a'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 8 }, // D19：8 形态槽（本任务只做 slot-0 锚点；跨槽差异归 008.5）
  variants: { scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 }, // 参照 asset_oak 量级
  triangleCount: 35058, // 实数 = slot-0 锚点 High 档结构计数（皮 20724 恒定 + 叶簇卡 7167×2，簇级剔除 + 冠内通透规则确定；多档起声明面取细模档；见完成记录）
  levels: [{ id: 'high' }, { id: 'mid' }, { id: 'low' }], // LOD 三档（T009.6 夏栎内容交付；D27 首版最小化 [{id}]——阈值归 Runtime 常量，不进 Profile）
};

/**
 * morphSeed → shapeProfile 路由（T009.1 slot → 结构配置）：枚举 8 槽 morphSeedOf
 * 逐位比对还原 slot 索引（O(8) 纯查表，确定性）；非槽种子（如测试直传任意 seed）
 * 与未填槽一并回落 slot-0 标准组合（009.3 前后行为兼容——未列槽结构一致，
 * 差异仅来自 morphSeed 随机流）。**不扩展 ProceduralBuild 公共签名**。
 */
function profileForSeed(seed: number) {
  for (let slot = 0; slot < 8; slot++) {
    if (seed === morphSeedOf(meta.id, slot)) return TREE3A_SHAPE_PROFILES[Math.min(slot, TREE3A_SHAPE_PROFILES.length - 1)]!;
  }
  return TREE3A_SHAPE_PROFILES[0]!;
}

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.seed = morphSeed（SourceCache 传 morphSeedOf(assetId, slot)；缺省 = slot-0 锚点）
  const seed = params?.seed ?? morphSeedOf(meta.id, 0);
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧路径逐位不变；
  // 不参与 shapeSlot/morphSeed/sourceKey 形态身份——档位缓存维度归 ProceduralSourceCache）
  const level = params?.level ?? 'high';
  const rng = mulberry32(seed);
  const { geometry } = buildBroadleafGeometry(rng, profileForSeed(seed), level);
  const bark = createTree3aBarkMaterial(level); // 组 0（契约序 [皮, 叶]——mergeGeometries 层序）
  const leaf = createTree3aLeafMaterial(level);
  return { geometry, material: [bark, leaf] };
}
