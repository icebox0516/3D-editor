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
 * LOD 档位声明（T003.4 接口位占位，T006/006.1 实装消费）。
 * 本阶段每资产恒单档 'high'（细模即唯一档）：纯数据声明、管线零消费，build 契约
 * （无参同步单产物）不随档位扩展——多档 build 路由到 T006 再定。
 */
export interface ProceduralLevelDescriptor {
  /** 档位 id：'high' = 细模（当前唯一档）；'medium' / 'low' 预留给 T006 */
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
  /** 细模三角形实数（面数纪律声明：单株 ≤2000 是撒点预算与 LOD 压线前提；
   *  可选字段，声明即与几何实测一致，由资产测试锁定） */
  triangleCount?: number;
  /** LOD 档位（接口位占位；缺省视为单档细模，与显式声明单档等价） */
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
