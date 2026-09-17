/**
 * domain/assets/AssetReference —— 场景对象对模型资产的引用。
 *
 * 职责：只存 assetId，指向 AssetRegistry 中注册的 ModelAsset；不内联资源数据。
 *      T002.3（D6 烘焙式变体）增补可选 seed：程序化资产放置瞬间掷出，
 *      渲染侧按 seed 经 domain/assets/variants 确定性复算变体（缩放/旋转已烘进
 *      transform，seed 主要驱动 instanceColor 色相复算）；同 seed 同结果，
 *      撤销/重做/场景重载后逐位一致。GLB 与拖放（确定性语义）不带 seed。
 * 边界：纯数据。
 */
import type { ID } from '../../core/types';

export interface AssetReference {
  assetId: ID;
  /** 烘焙式变体 seed（可选；数字，非负整数惯例但不做结构约束——序列化整体透传） */
  seed?: number;
}
