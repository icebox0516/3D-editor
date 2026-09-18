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
 *      0 树皮（主干+五级枝+底盖）—— createTree3aBarkMaterial：暖灰褐 #63513f / m 0 /
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
 *      size 8 为槽路由声明面）；levels 为 LOD 接口位占位（恒单档 'high'，T006 消费）。
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
  triangleCount: 35058, // 实数 = slot-0 锚点结构计数（皮 20724 恒定 + 叶簇卡 7167×2，簇级剔除 + 冠内通透规则确定；见完成记录）
  levels: [{ id: 'high' }], // LOD 接口位：单档细模占位
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
  const rng = mulberry32(seed);
  const { geometry } = buildBroadleafGeometry(rng, profileForSeed(seed));
  const bark = createTree3aBarkMaterial(); // 组 0（契约序 [皮, 叶]——mergeGeometries 层序）
  const leaf = createTree3aLeafMaterial();
  return { geometry, material: [bark, leaf] };
}
