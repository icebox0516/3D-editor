/**
 * domain/assets/AssetDescriptor —— 统一资产描述符与程序化资产 meta（T002.1，D17）。
 *
 * 职责：注册表层（AssetRegistry）的统一条目形态——GLB 文件资产（manifest 灌注）与
 *      程序化资产（代码扫描）同库混排，按 kind 可辨识分派（D7）；程序化 meta 与变体
 *      范围声明的唯一类型真相源（generator 代码在 runtime/procedural，此处只有纯数据形态）。
 * 边界：纯数据 + 纯类型守卫；build 函数永不进入本层（分层 DAG 禁止 domain→runtime）。
 *      与 ModelAsset 的 import 均为 type-only（编译期擦除，无运行时环）。
 */
import type { Euler, ID, Vec3 } from '../../core/types';
import type { ModelAsset } from './ModelAsset';

/** 两种资产 meta 的公共字段（检索与放置姿态公共面：工厂/注册表按此编程，两种 kind 通吃） */
export interface AssetCommonMeta {
  id: ID;
  name: string;
  /** 分类（英文小写值域，如 'building' / 'facility'；GLB 由 models 目录推导，程序化为 meta 显式声明） */
  category: string;
  tags: string[];
  /** 放置时的默认缩放 */
  defaultScale: Vec3;
  /** 放置时的默认旋转（弧度） */
  defaultRotation: Euler;
}

/**
 * 变体范围声明（D17 裁定：jitter 值 = 围绕标称值的最大偏离，均匀分布半宽）。
 * 缺省 0 = 无抖动。T002.1 只定义形态，消费在 T002.3（seed 掷骰烘进 transform/instanceColor）。
 */
export interface ProceduralVariants {
  /** 缩放最大偏离（相对乘性）：0.15 → ×U[0.85, 1.15] */
  scaleJitter?: number;
  /** 绕 Y 旋转最大偏离（度）：15 → ±15°（180 即全向） */
  rotationJitter?: number;
  /** 色相最大偏离（度）：8 → ±8° */
  hueJitter?: number;
}

/**
 * LOD 档位声明——levels 是资产内容声明（D23 职责切分：T009.6 首次提供多档夏栎实现
 * 并落地 Runtime level 维度；T006 只负责运行时距离切换/Chunk/Batch 消费）。
 * 类型形态不变；'medium' / 'low' 由资产按家族预算实测填充。
 */
export interface ProceduralLevelDescriptor {
  /** 档位 id：'high' = 细模；'medium' / 'low' 由各资产 LOD 任务提供内容 */
  id: 'high' | 'medium' | 'low';
}

/**
 * 程序化资产 meta：真相源是同文件的 generator 代码（D7），不设 file/thumbnail 字段
 * （缩略图走 002.2 离屏快照管线）；分类为显式声明，不靠目录推导（D17）。
 */
export interface ProceduralAssetMeta extends AssetCommonMeta {
  /** 变体范围声明（可选；数值语义见 ProceduralVariants） */
  variants?: ProceduralVariants;
  /** 形态族声明（可选；D19——一资产多形态槽）：size = 槽数，由资产自行声明
   *  （是资产配置而非协议常量——具体数值由声明方资产的任务锁定，本类型不写死）；
   *  声明后对象 seed 经三流域派生路由到槽（domain/assets/shapeFamily） */
  shapeFamily?: { size: number };
  /** 三角形实数（D23：实际内容统计值/预算记录字段——具体预算由资产族与 LOD 验收锁定，
   *  不构成公共硬契约；旧「单株 ≤2000」为 003.4 旧小植物时期口径，仅存历史记录） */
  triangleCount?: number;
  /** LOD 档位（缺省视为单档细模，与显式声明单档等价；多档内容由 T009.6 起提供，D23） */
  levels?: ProceduralLevelDescriptor[];
}

/** 统一资产描述符：kind 可辨识联合（D7/D17——不拍平，字段存在性由类型保证） */
export type AssetDescriptor =
  | { kind: 'file'; asset: ModelAsset }
  | { kind: 'procedural'; asset: ProceduralAssetMeta };

/** 收窄守卫：GLB 文件资产（有 file 路径，AssetLoader 可加载） */
export function isFileAssetDescriptor(
  d: AssetDescriptor,
): d is { kind: 'file'; asset: ModelAsset } {
  return d.kind === 'file';
}

/** 收窄守卫：程序化资产（build 路由在 runtime/procedural） */
export function isProceduralAssetDescriptor(
  d: AssetDescriptor,
): d is { kind: 'procedural'; asset: ProceduralAssetMeta } {
  return d.kind === 'procedural';
}
