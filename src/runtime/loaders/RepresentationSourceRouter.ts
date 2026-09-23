/**
 * runtime/loaders/RepresentationSourceRouter —— 表示感知源路由契约（T021.1 类型层落位）。
 *
 * 职责：「表示 → source provider」开放式扩展结构的**类型与路由表形态**真相源
 *      （D41 §十一/§十六）。RepresentationSourceRouter 门面（现有 ProceduralSourceCache /
 *      AssetSourceRouter 之上的表示感知层）在 021.7 接线——内部路由：high/mid/low →
 *      现有 ProceduralSourceCache；canopy → BroadleafCanopyProxy / CanopySourceCache
 *      （T021.6）；未来 impostor → ImpostorSourceCache。本文件只落契约类型与路由表
 *      结构，**不接线**现有 provideSource 流、不建运行时门面实例（021.1 任务边界）。
 * 扩展契约（§十六）：**新增一个 Representation（如未来 Impostor）= 且仅 =**——
 *      ① 扩 domain/lod/representation 的 RuntimeRepresentation 联合类型 +
 *      ② 本路由表类型加一行 provider 注册 + ③ 声明面 lod-spec.md 增量修订；
 *      不重写 Runtime。provider 形态对齐 §十一：
 *      provideRepresentationSource(assetId, seed, representation) →
 *      { geometry, material, customDepthMaterial?, bounds? }——即返回 InstanceSource
 *      （其 bounds 字段 = RenderBounds，随几何成套、归 Source/Cache 所有并释放，
 *      Pool / Scatter / Picking / Lifecycle 不需要知道表示的具体来源）。
 * 边界：纯类型零运行时、零 THREE import（THREE 类型经 InstanceSource 结构引用）；
 *      representation 永不进 sourceKey / 形态身份（D19/D23.2）；散布链 provideSource
 *      签名从 (assetId, level?) 到 (assetId, representation?) 的演化归 021.7。
 */
import type { RuntimeRepresentation } from '../../domain/lod/representation';
import type { InstanceSource } from '../instancing/InstancedAssetPool';

/**
 * 表示感知源提供者（D41 §十一）：assetId + 对象 seed（槽路由用，同现有
 * provideSource 语义）+ Runtime 表示 → 实例化源（geometry / material /
 * customDepthMaterial? / bounds? 成套——§10.3 所有权归 Source/Cache）。
 */
export type RepresentationSourceProvider = (
  assetId: string,
  seed: number | undefined,
  representation: RuntimeRepresentation,
) => Promise<InstanceSource>;

/**
 * 表示 → provider 路由表（§十六 开放式扩展结构的注册形态）：
 * Partial——未注册表示的资产走现有无表示路由（现状流不动）；Readonly——注册后
 * 表结构不被运行时改写（表由装配期构建，021.7 门面消费）。canopy 行由 T021.6
 * CanopySourceCache 注册、021.7 接线；impostor 行按 §六.5 预留承诺届时 = 扩联合
 * 类型 + 本表加一行 + lod-spec 增量修订，不重写 Runtime。
 */
export type RepresentationSourceRouteTable = Readonly<
  Partial<Record<RuntimeRepresentation, RepresentationSourceProvider>>
>;
