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
import type { AssetTaxonomy } from './taxonomy';

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
 * LOD 档位 id 枚举（D27.7 三值定死）：'high' = 细模；'mid' / 'low' 由各资产 LOD 任务提供内容。
 * proxy/impostor 不进类型枚举（规范语义位归 T010.3，规范真相源 = docs/procedural-assets/lod-spec.md）；
 * culled 是调度结果而非声明档位，不进枚举。Runtime build/缓存参数直接复用本类型（runtime/procedural/types.ts）。
 */
export type ProceduralLevel = 'high' | 'mid' | 'low';

/**
 * LOD 档位声明——levels 是资产内容声明（D23 职责切分：T009.6 首次提供多档夏栎实现
 * 并落地 Runtime level 维度；T006 只负责运行时距离切换/Chunk/Batch 消费）。
 * 类型形态不变；'mid' / 'low' 由资产按家族预算实测填充。
 */
export interface ProceduralLevelDescriptor {
  /** 档位 id：'high' = 细模；'mid' / 'low' 由各资产 LOD 任务提供内容 */
  id: ProceduralLevel;
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
  /** 分类声明（T010.2，D22 三级可寻址——大类 → family → asset；**必填**——程序化资产
   *  一次定契约避免二次迁移。浏览语义，不承载渲染/放置行为分支；值域与依据见
   *  ./taxonomy 与 docs/procedural-assets/metadata-taxonomy.md）。
   *  与 category（现行 UI 分组键，自由字符串）正交共存：category 不改、UI 分组行为不变 */
  taxonomy: AssetTaxonomy;
  /** 尺寸声明（可选；通用维度语义与数值纪律见 ProceduralProfile） */
  proceduralProfile?: ProceduralProfile;
}

/** 闭区间数值范围（米；min ≤ max；记录实测带，两位小数精度） */
export interface Range {
  min: number;
  max: number;
}

/**
 * 程序化资产尺寸声明（T010.2，可选；浏览语义——T016 按尺寸筛选/排序消费）。
 * 只收**通用维度语义**：总高/水平展幅对任何程序化资产（消防栓/路灯/灌木）都成立；
 * 植物专属术语（冠幅 crownWidth 等）禁入本层与一切公共协议字段（D20.6/D22——
 * 消防车/建筑/路灯不应被迫回答「冠幅是什么」），冠幅语义由家族契约层承载
 * （tree/broadleaf 契约已有 crown* 字段，浏览侧换算用 widthRange 通用语）。
 * 数值纪律：只填有真实依据的实测值（细模档源几何包围盒，跨形态槽取带；取证
 * 记录见 T010.2 完成记录），无依据不填——字段全可选，不投机造数。
 */
export interface ProceduralProfile {
  /** 总高带（米）：原点 = 底面中心（minY=0）→ 包围盒 maxY；跨形态槽取实测 min/max */
  heightRange?: Range;
  /** 水平展幅带（米）：max(X 展幅, Z 展幅)——水平包围盒两轴取大；跨形态槽取实测 min/max */
  widthRange?: Range;
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
