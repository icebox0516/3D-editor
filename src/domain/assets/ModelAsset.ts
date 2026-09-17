/**
 * domain/assets/ModelAsset —— 可复用模型资产的定义（注册于 AssetRegistry）。
 *
 * 职责：描述一个模型资源的元数据：分类、文件路径、标签与默认变换。
 * 边界：纯数据；场景中不保存模型文件本体，只保存 AssetReference 引用（CONTRACTS.md Asset 概念）。
 *      AssetDefaults 不实现（明确排除项，默认值由本结构字段覆盖）。
 */
import type { AssetCommonMeta } from './AssetDescriptor';

export interface ModelAsset extends AssetCommonMeta {
  /** 相对 assets 根的模型文件路径（.glb） */
  file: string;
  /** 缩略图路径（可选） */
  thumbnail?: string;
  /** 附加元数据（如多边形数、来源） */
  metadata?: Record<string, unknown>;
}
