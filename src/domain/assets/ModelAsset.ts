/**
 * domain/assets/ModelAsset —— 可复用模型资产的定义（注册于 AssetRegistry）。
 *
 * 职责：描述一个模型资源的元数据：分类、文件路径、标签与默认变换。
 * 边界：纯数据；场景中不保存模型文件本体，只保存 AssetReference 引用（CONTRACTS.md Asset 概念）。
 *      AssetDefaults 不实现（明确排除项，默认值由本结构字段覆盖）。
 *      LOD Proxy 档（低模 GLB 作代理 Representation）语义位：**未实装/未经验证**
 *      （规范收录见 docs/procedural-assets/lod-spec.md §3，D27.3/T006.2 留痕）——
 *      届时过增量决策定接口，不预写占位字段。
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
