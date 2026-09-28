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
  /**
   * 材质基调色卡 id（T024，D44 #4——可选，与 seed 同层整体透传）：指向资产 meta
   * presets 声明的卡；**默认卡省略不落盘**（缺省 = DEFAULT_COLOR_PRESET_ID，旧场景
   * 零迁移）；放置 Command 携带随撤销重做走。读侧宽容：未声明的卡 id 由渲染入口
   * 归一回默认卡（已删卡场景不崩）。instanceColor 群内微差与此正交（D44 #5）。
   */
  preset?: string;
}
