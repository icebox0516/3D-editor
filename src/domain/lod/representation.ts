/**
 * domain/lod/representation —— Runtime 表示与提交状态契约类型（T021.1，D41）。
 *
 * 职责：六概念分离（D41 §二）中「Representation」与「submit state」的类型真相源——
 *      RuntimeRepresentation 表示联合、LodSubmitState 提交终态、LodSelectionOutcome
 *      调度判定产出联合、SelectionState 选档状态形状、ShadowPolicy 阴影策略类型、
 *      RenderBounds 渲染边界，以及能力驱动的有效链纯函数。运行面规范唯一真相源 =
 *      docs/procedural-assets/representation-runtime.md（§三 模型 / §四.3 双 Bounds /
 *      §七 阴影 / §十 状态与键 / §十一 路由 / §十六 扩展契约）；声明面字段语义真相源 =
 *      docs/procedural-assets/lod-spec.md §2——两面互指，本模块不复制对方正文。
 * 边界：纯类型 + 纯函数，零 THREE（check:layers 强制）。本模块不回引 domain/assets
 *      （有效链输入用结构化最小投影，见 RepresentationCapability 注），保持域内文件
 *      DAG 单向：lodEvaluation → AssetDescriptor → representation → core。
 *      纪律：'culled' 不是表示（提交终态独立建模，D41 §三.1）；'impostor' 架构预留
 *      不进联合、零占位（D27.7/D27.12 防幽灵字段）；representation 永不进 sourceKey /
 *      形态身份（D19/D23.2）；本模块不感知任何资产类型（禁止 TreeLOD 类专属逻辑，
 *      §十五.1——换一个资产仍成立的语义才落此处）。
 */
import type { Vec3 } from '../../core/types';

/**
 * Runtime 渲染表示联合（D41 §三.1 第一阶段）：
 * 'high' | 'mid' | 'low' = 资产几何档位充当的运行表示（与 ProceduralLevel 构建档位
 * 同名同值——资产 build 出什么档，Runtime 就能展示什么表示）；
 * 'canopy' = 远景冠层代理表示（内容自 T021.6 BroadleafCanopyProxy 起提供）。
 * 不含 'impostor'（架构预留，§十六扩展契约——届时扩本联合 + 注册 provider 即接入）；
 * 不含 'culled'（提交终态，见 LodSubmitState）。
 */
export type RuntimeRepresentation = 'high' | 'mid' | 'low' | 'canopy';

/**
 * LOD 提交终态（submit state，D41 §三.1/§十.2）：'culled' 是 Runtime 最终提交状态
 * （超远 / 被裁剪——不渲染、不可拾取），不是表示档位、不进桶类型、不进资产声明。
 * 从 RuntimeRepresentation 联合移出独立建模（T021.1 原地演化，旧 LodRepresentation
 * 退役）；与表示的并集见 LodSelectionOutcome。
 */
export type LodSubmitState = 'culled';

/**
 * LOD 调度判定产出（Selection 的输出域）：目标 Runtime 表示，或超远裁剪提交终态。
 * 消费面：选档评估器返回值 / 迟滞参考（LodEvaluationInput.current、两链 currentLod /
 * ChunkLodState.current）/ 分布计数键（runtime/lodDistribution）。替代旧
 * LodRepresentation = ProceduralLevel | 'culled' 的语义槽位（调度结果与表示分离命名，
 * D41 §一.4）。
 */
export type LodSelectionOutcome = RuntimeRepresentation | LodSubmitState;

/**
 * 选档状态形状（D41 §10.1 原文，按粒度实例化：放置链 per-object、散布链每
 * (region × chunk × asset) 一份）。021.1 只立形状；消费归 021.2（选档重写）与
 * 021.3（过渡）。Shadow / Density 是 Policy 层每帧派生视图，**不进状态体**（§10.1）；
 * 本状态是运行时派生态，不进 Scene / Command / 持久化（D27.6 延续）。
 */
export interface SelectionState {
  /** 当前正在展示的表示 */
  current: RuntimeRepresentation;
  /** 已决定要去的表示（≠ current 时进入过渡） */
  target: RuntimeRepresentation;
  /** 目标表示 Source 是否就绪（pending 并入本标志） */
  sourceReady: boolean;
  /** 过渡进度 0..1（0 = 未开始，1 = 完成） */
  transition: number;
  /** 过渡是否进行中（Current ≠ Target 且双表示共存期） */
  transitionActive: boolean;
}

/**
 * 阴影策略类型（D41 §七：从主表示独立、由统一 Runtime 调度）。021.1 只立类型；
 * 策略默认值表与按表示驱动归 021.5（现状池建网格统一 cast/receive=true，不在本任务
 * 改动——策略层落位后由表示驱动）。冻结域不动：Shadow Camera / T018 环境 / Sun
 * Direction 一律不改（§七）。
 */
export interface ShadowPolicy {
  /** 是否进 shadow pass */
  cast: boolean;
  /** 主渲染是否采样阴影 */
  receive: boolean;
  /** 深度表示：full = 完整（现状 High）/ simplified = 冠层轮廓级（Canopy，禁完整叶片 SDF）/ none = 不参与 */
  depth: 'full' | 'simplified' | 'none';
}

/**
 * 渲染边界球（RenderBounds，D41 §四.3/§十一）：当前表示的**真实几何边界**，用于视锥
 * 剔除。与 SelectionBounds（选档基准）分别命名、互不替代：后者恒取 High 派生稳定基准
 * 球（runtime/lodReference 派生缓存，D28.4 非资产声明、不随当前表示变化），本类型则
 * 随表示几何逐档成套、由 Source 契约提供（InstanceSource.bounds，归 Source/Cache 所有）。
 * 过渡期 Union(Current, Target) 规则归 021.3 消费侧。球形 center + radius 与选档度量
 * 输入同形（零 THREE 纯数据；runtime 侧由 THREE.Sphere 实现）。
 */
export interface RenderBounds {
  /** 球心（源几何局部系） */
  center: Vec3;
  /** 半径（世界尺度 = radius × 实例 scale，同选档口径） */
  radius: number;
}

/**
 * 表示固定序（D41 §三.2：high → mid → low → canopy）：有效链输出排序、调度序数比较
 * （lodEvaluation 的 representationOrdinal）与分布键序的唯一基准。culled 是提交终态
 * 不在本序（比较时恒视为最远端）。
 */
export const REPRESENTATION_ORDER: readonly RuntimeRepresentation[] = [
  'high',
  'mid',
  'low',
  'canopy',
];

/**
 * 资产表示能力声明（有效链函数的最小投影——AssetDescriptor meta 的
 * representations / levels 两字段，函数不感知资产类型，§十五.1）。
 */
export interface RepresentationCapability {
  /**
   * meta.representations（Runtime 表示能力声明，声明优先）：资产声明它能在 Runtime
   * 展示哪些表示。空数组 / 未声明 = 未声明语义（走 levels 派生）。
   */
  representations?: readonly RuntimeRepresentation[];
  /**
   * meta.levels 的 id 集（资产构建档位声明，representations 未声明时的派生源）。
   * 类型 = 构建档位（结构同 ProceduralLevel，domain/assets/AssetDescriptor 真相源；
   * 'canopy' 不是 build 档故不在本型）——本模块不回引 domain/assets 保持 DAG 单向，
   * 调用方传 ProceduralLevel[] 结构兼容。
   */
  levels?: readonly Exclude<RuntimeRepresentation, 'canopy'>[];
}

/**
 * 能力驱动有效链（D41 §三.2 纯函数）：输入资产能力声明，输出按固定序
 * （REPRESENTATION_ORDER：high → mid → low → canopy）排列的有效表示链。
 *  - representations 声明优先（非空即生效；乱序输入按固定序归一、重复去重）；
 *  - 未声明（缺省 / 空数组）→ 从 levels 派生（构建档位即表示能力）；
 *  - 均未声明 / 派生后为空 → 单档 ['high']（缺省单档语义，lod-spec §2.2）；
 *  - 越类型值（JS 侧手写声明的脏值）防御过滤——全滤空按未声明回单档。
 * culled 是提交终态不在链中（链的末端裁剪语义归选档/提交侧，不混入表示类型）。
 * 不感知资产类型、零 THREE；021.1 只落契约（本函数无运行时消费方——接线归 021.7
 * RepresentationSourceRouter / 选档消费归 021.2）。
 */
export function effectiveRepresentationChain(
  capability: RepresentationCapability,
): RuntimeRepresentation[] {
  // representations 非空即生效（空数组 = 病态声明，视同未声明回退 levels 派生）
  const declared = capability.representations?.length
    ? capability.representations
    : capability.levels;
  if (!declared || declared.length === 0) return ['high'];
  const known = new Set<string>(REPRESENTATION_ORDER);
  const present = new Set(declared.filter((rep) => known.has(rep)));
  if (present.size === 0) return ['high'];
  return REPRESENTATION_ORDER.filter((rep) => present.has(rep));
}
