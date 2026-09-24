/**
 * runtime/scatter/ScatterChunkManager —— 分块实例化管线（T003.2，D9）。
 *
 * 职责：散布区域（源）→ 空间分块 → 每 (源×块×资产) 一个 InstancedMesh 的合批渲染。
 *  1. 块 = 固定尺寸世界对齐网格（默认 32m，构造可覆写——T006 LOD 要调），块矩形半开
 *     [i·S,(i+1)·S) × [j·S,(j+1)·S)（与撒点网格同原点对齐，无缝无重叠）。分块是
 *     剔除 / 局部重算 / 合批三者的共同单元（D9）——散布渲染的承重墙。
 *  2. 撒点经 domain scatterChunk 逐块计算（确定性：cell 哈希与遍历顺序无关，003.1
 *     已锁函数层），块内按 assetId 分组合批；实例矩阵 = (x, baseY, z) + rotationY +
 *     uniform scale（撒点输出已含全部抖动，管线下再掷）。逐实例色：资产 meta 声明
 *     hueJitter>0 时 applyAssetVariants(variants, variantSeed) 只取 hueOffset →
 *     hueOffsetToMultiplier 写 instanceColor（同 T002.3 语义；散布不二次掷
 *     scale/rotation——那由撒点参数管辖，此处只吃色相）。
 *  3. 局部重算（003.3 的机制根基）：recomputeChunks(id, keys[, params]) 只重撒列出
 *     的块，其余块 InstancedMesh 矩阵缓冲逐位不动（不触碰即不变）；受影响块集合由
 *     导出的纯函数 computeAffectedChunks 保守计算（bbox ∪ bbox 各外扩撒点影响半径）。
 *  4. 逐块视锥剔除：frame(camera) 每帧以块 AABB 开关块 Group 的 visible（three 对
 *     visible=false 整子树零提交——主渲染与阴影 pass 同口径，draw call 归零的验收依据）。
 *     003.3 增源级显隐（setSourceVisible：对象/图层可见性合成结果）——隐藏源整片
 *     visible=false 且不参与拾取（resolvePick 可见性守卫）。
 *
 * 边界（D5：散布实例是管线内部派生数据，不是场景对象）：
 *  - root Group 由 Renderer 挂 scene（contentGroup 的兄弟）；003.3 起 RuntimeViewport
 *    把 root 并入拾取射线（D18.7 拾取反查），命中经 resolvePick 映射回源 id（regionId）
 *    走既有区域选中链路；映射表私有 Map<mesh, sourceId>，网格绝不携带
 *    userData.objectId、不进 RuntimeObjectMap / 撤销栈 / 大纲（D5 红线）。
 *  - 几何/材质来自注入的 provideSource（与 InstancedAssetPool 同源路由 AssetSourceRouter），
 *    共享资源绝不 dispose——InstancedMesh.dispose 只释放实例矩阵/颜色缓冲，模板归源端。
 *  - 容量策略仿池：翻倍扩容（换缓冲不换 mesh 对象，引用稳定）、缩容保留容量、
 *    (块×资产) 实例归零即拆网格释放缓冲（块整空 → 块 Group 回收，区域回来重建）。
 *  - 异步源仿池：未就绪先登记实例数据（pending），源到达后建网格；失败告警一次不重试
 *    不崩（登记数据保留，渲染不可能）。manager 会话私有（Renderer 构造 / dispose 链
 *    管理），绝不模块级单例——StrictMode 双挂载安全（D17）。
 *  - LOD 分档 / 拾取映射 / 样式序列化明确不做（T006 / 003.3）→ LOD 分档自 T006.3 起
 *    由本管承担（拾取映射/样式序列化仍不做）。
 *
 * chunk × source × level 分桶与换档（T006.3，D27.4/D27.6）：
 *  - 桶维度 = 块 × 资产 × 档：MeshEntry 携带 level，(块×资产) 同时只有一个当档桶在
 *    渲染；**不做「桶内换 Source」**——换档 = 确定性重撒重建（同 seed 同结果，scatterChunk
 *    纯函数保证实例集合逐位一致，只换当档 InstanceSource 成套的 geometry/material）。
 *  - 选档 = region × chunk × asset 四维粒度（D41 §4.4 正式定义；T006.3 起结构性即如此
 *    ——source 即 region 维，T021.2 核实记档）：代表点 = 块 AABB 最近点（box.clampPoint）、
 *    代表 scale = 桶内最大实例 scale（保守偏高档，**全集口径**——抽稀前撒点集，T021.2
 *    收紧：选档输入与密度抽稀解耦）、半径 = High 档派生稳定基准（T006.6
 *    assetId 级冻结缓存，与当档解耦——换档不换选档输入）；统一走 domain 评估器
 *    （T021.2 起为表示链选档：输入 = effectiveRepresentationChain 有效链，representations
 *    声明优先 / levels 派生），LodSubject 在本管组装（评估器不感知 chunk）。
 *  - 帧内时序（D27.6）：frame(camera, lodEnabled) 在块视锥剔除之后逐 (块×资产) 评估——
 *    档位每帧派生态，不进 Scene / Command / 持久状态；迟滞参考 current 由本管持有
 *    （ChunkLodState.current，逐帧传入评估器）。
 *  - 换档重建时机：目标档源就绪即重建（首建冷源经微任务到达后回调重建，旧档持续
 *    渲染到新档就绪——换档点无 pop）；'culled'（超远）= 调度结果：网格 visible=false，
 *    桶保留（回视即时恢复）。LOD 总开关（Renderer 持有、逐帧传入）：off = 恒 High +
 *    culled 旁路（评估器语义）——非 high 桶全部确定性重建回 high。
 *
 * 批次控制（T006.4 立项，006.3 遗留治理面——防「块 × 资产 × 表示」批次数爆炸；
 * T021.4 键迁移与密度解耦，D41 §八/§九）：
 *  - 密度（T021.4，D41 §八——Density Policy 与表示解耦）：全表示默认密度 100%
 *    （DENSITY_FULL_KEEP），**几何降档不触发实例抽稀**（旧 BATCH_POLICY.
 *    levelInstanceKeep.low=0.5 的档位联动废止——选档换表示不丢实例，同 seed 同块
 *    跨表示实例集合逐位一致）。写入路径保留 Density 输入面（thinInstances +
 *    keepThinnedInstance 确定性规则，domain）：100% 默认下行为 = 不抽稀（零拷贝）；
 *    75%/50% 降密只存在于 021.8 Density 专项的独立 A/B 通道，本管不实装密度旋钮。
 *    抽稀在 runtime 消费侧按实例稳定序过滤、撒点确定性契约不动（006.4 记档裁定沿）。
 *  - 块自适应合并（稀疏块合批）：构造注入 sparseMerge（缺省关闭 = 管线独立使用既有
 *    行为，沿 frame(lodEnabled=false) 缺省先例；Renderer 注入 BATCH_POLICY）后，
 *    **允许合批的表示**（isBatchMergeAllowed——批次键绑 representation §九；第一版
 *    = mid/low/canopy，high 恒否=近处全保真+细粒度视锥剔除）且 (块×资产) 实例数 ≤
 *    阈值的块并入「超块合并桶」= (源 × 超块 × 资产 × 表示) 一个 InstancedMesh
 *    （groupFactor×groupFactor 个相邻块共享，挂 root 直下、由 three 逐对象包围球自动
 *    视锥剔除——合并盒变大对远档可接受，§4.3 演进方向记档）。密集块（超阈值）与
 *    high 档保持自有细块。合并/拆出 = 同批实例同矩阵重写（像素零变化——合并组建立/
 *    拆除不产生可见跳变）；合并组重建确定性 = 成员按 (i,j) 升序逐块重撒（scatterChunk
 *    纯函数）。合并成员被 culled = 实例退出该帧合并桶写入（lod.memberCulled 标记 +
 *    组重建；回视恢复重入——自有桶口径的 mesh.visible 等价物）。块生命周期：局部
 *    重算/摘源重建/撤销重做经同一确定性路径自然一致（合并组随源生灭）。
 *  - LOD 分布（D27.9 双口径 + D41 §十三升级）：getLodDistribution 只读快照——自有桶
 *    + 合并桶各表示实例数与桶数（提交口径；culled 成员实例计 culled）+ 过渡计数面
 *    （021.3）+ transitionTargets / shadowCasterInstances（021.4 接线），经
 *    runtime/lodDistribution 纯计数器。
 *
 * 表示过渡执行（T021.3，D41 §五；桶维度宽化 region × chunk × asset × representation）：
 *  - domain/lod/transition 状态机（纯函数）逐 (块×资产) 步进——ChunkLodState 持有
 *    SelectionState（transition 字段，D41 §10.1 五字段原形），执行提交决策：
 *    硬切位（High↔Mid / Mid↔Low / 多级跳档）= 确定性重撒重建（源就绪即重建、未就绪
 *    lod.pending 排队——沿既有语义）；dither 位（{mid|low}↔canopy）= 双表示共存——
 *    当档桶保留 + chunk.incoming 客座桶（同块同资产的目标表示桶，**过渡期免合并**——
 *    客座桶走自有细块，避免合并组重建 churn；完成迁移后经常规重建归并）；
 *    fade-out 退场（Low/Canopy → Culled）= 当档桶逐实例 aFadeOut 退场度写出
 *    （chunk × asset 粒度桶内均匀值）、终态零提交（自有桶 mesh.visible=false /
 *    合并成员 memberCulled 退组——沿既有 culled 机制，决策线到终态间的退场带内
 *    正常渲染）。fade 属性缝契约见 runtime/instancing/fadeGeometry（aFadeOut 包装
 *    几何——散布多桶共享源几何，逐桶 fade 不能直挂，见彼头注）。
 *  - 过渡期剔除并集（D41 §四.3）：lod.box（块盒基）在双表示期并入客座表示的实例
 *    盒（writeInstanceRange 同一累积路径）；客座拆除后从当档集确定性重算。
 */
import type { ProceduralVariants } from '../../domain/assets';
import { applyAssetVariants } from '../../domain/assets';
import { DENSITY_FULL_KEEP, isBatchMergeAllowed, thinInstances } from '../../domain/lod/batchPolicy';
import type {
  LodSelectionOutcome,
  RepresentationCapability,
  RuntimeRepresentation,
  SelectionState,
} from '../../domain/lod/representation';
import { effectiveRepresentationChain } from '../../domain/lod/representation';
import { evaluateLodRepresentation, normalizedViewDistance } from '../../domain/lod/lodEvaluation';
import { isShadowCasterFor, shadowPolicyOf } from '../../domain/lod/shadowPolicy';
import { steadySelectionState, stepTransition, transitionKindOf } from '../../domain/lod/transition';
import type { ScatterChunk, ScatterInstance, ScatterParams } from '../../domain/scatter';
import { scatterChunk, scatterInfluenceRadius } from '../../domain/scatter';
import type { InstanceSource } from '../instancing/InstancedAssetPool';
import { shadowDepthMaterialOf } from '../instancing/InstancedAssetPool';
import { FadeGeometryPool, writeFadeRange } from '../instancing/fadeGeometry';
import { hueOffsetToMultiplier } from '../instancing/instanceTint';
import { lodViewOfCamera } from '../instancing/lodView';
import type { LodDistribution } from '../lodDistribution';
import { LodDistributionCounter } from '../lodDistribution';
import { LodReferenceSphereCache } from '../lodReference';
import type { Vec2 } from '../../core/types';
import * as THREE from 'three';

/** 块索引（整数格；世界块矩形 = [i·S,(i+1)·S) × [j·S,(j+1)·S)，S = chunkSizeM） */
export interface ScatterChunkKey {
  i: number;
  j: number;
}

/** 依赖注入窄接口（仿 AssetSourceRouter：Renderer 注入真实路由，测试注 fake 工厂） */
export interface ScatterChunkManagerOptions {
  /** assetId + 表示 → 实例化源（与 InstancedAssetPool 同源路由；表示为桶维度，
   *  缺省 'high'——无档资产的源路由行为与现状逐位一致；T021.3 起宽化到
   *  RuntimeRepresentation——canopy 目标位执行路径落代码，真实资产 021.7 接线前
   *  不可达；几何/材质共享，本管绝不 dispose） */
  provideSource: (
    assetId: string,
    representation?: RuntimeRepresentation,
  ) => Promise<InstanceSource>;
  /** assetId → 程序化 meta 的变体声明（hueJitter>0 时逐实例色相微差；缺省无色） */
  getAssetVariants?: (assetId: string) => ProceduralVariants | undefined;
  /**
   * assetId → 资产表示能力投影（T021.2 选档输入，表示能力驱动）：AssetDescriptor meta
   * 的 representations / levels 两字段（RepresentationCapability）；选档消费
   * effectiveRepresentationChain（representations 声明优先、levels 派生回退——021.1
   * 契约）。缺省/均未声明 = 单档语义（链 ['high']）。Renderer 注入注册表查询；每资产
   * 缓存一次。旧 getAssetLevels（levels 直查）由本字段取代（T021.2）。
   */
  getRepresentationCapability?: (assetId: string) => RepresentationCapability | undefined;
  /**
   * 块自适应合并策略（T006.4）：粗档（mid/low）下 (块×资产) 实例数 ≤ maxInstancesPerChunk
   * 的块并入 groupFactor×groupFactor 超块合并桶（相邻同资产块共享一个 InstancedMesh）。
   * 缺省 undefined = 关闭——管线独立使用保持既有「每 (块×资产) 一桶」行为（沿 frame
   * lodEnabled 缺省 false 先例）；Renderer 注入 BATCH_POLICY 对应字段（生产开）。
   */
  sparseMerge?: { maxInstancesPerChunk: number; groupFactor: number };
  /** 块边长（米，>0；缺省 32。T006 LOD 分档要调） */
  chunkSizeM?: number;
}

/** 默认块边长（米）：D9 承重墙的初始裁定值 */
export const CHUNK_SIZE_M = 32;

/** (块×资产) 自有桶网格运行态（容量翻倍扩容、缩容保留、mesh 对象引用稳定——仿池）。
 *  T006.3：entry 即「当档桶」——level（T021.3 宽化 RuntimeRepresentation）为桶维度
 *  （换表示 = 拆旧桶建新桶，Mesh 对象与 geometry/material 绑定创建，不做桶内换
 *  Source）。T006.4：实例紧致 AABB 迁至 ChunkLodState.box（自有桶 / 合并桶两路径
 *  同源更新——选档代表点与块剔除盒跨桶形态稳定，合并/拆出不改块盒）。 */
interface MeshEntry {
  readonly mesh: THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
  capacity: number;
  /** 桶表示（创建时绑定；与 chunk.lod 的目标表示比对判定换档） */
  readonly level: RuntimeRepresentation;
}

/**
 * (源 × 超块 × 资产 × 档) 合并桶（T006.4 块自适应合并）：粗档稀疏 (块×资产) 的
 * 合批容器——groupFactor×groupFactor 相邻块的当档实例写进同一个 InstancedMesh（挂
 * root 直下，three 逐对象包围球自动视锥剔除；identity 变换链 → 实例矩阵即世界矩阵）。
 * members = 成员块键集（重建按 (i,j) 升序确定性遍历）；mesh/capacity 语义同 MeshEntry
 * （整桶重写式重建，无逐槽增量）。合并桶随源生灭（SourceState.merged），成员进出
 * 由 writeChunkAssetBuckets 的合并判定驱动。
 */
interface MergedBucket {
  /** SourceState.merged 键（`${superI}:${superJ}::${assetId}::${level}`） */
  readonly key: string;
  /** 超块键（成员块 key = floor(key.i / factor), floor(key.j / factor) 同组） */
  readonly superKey: ScatterChunkKey;
  readonly assetId: string;
  readonly level: RuntimeRepresentation;
  /** 成员块键集（`${i}:${j}`；重建时升序遍历——确定性） */
  readonly members: Set<string>;
  mesh: THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | null;
  capacity: number;
}

/**
 * (块×资产) 的 LOD 运行态（T006.3）：每帧派生评估的全部帧间状态都在此——
 * current = 迟滞参考（本管持有、逐帧传入评估器；LodSelectionOutcome = 表示或
 * 'culled' 提交终态，T021.1 类型迁移）；level = 当前期望桶档（源就绪的
 * 已渲染档；culled 期间保持最后档）；maxScale = 桶内最大实例 scale（保守偏高档，
 * **全集口径**：抽稀前确定性撒点集，T021.2 收紧——抽稀不改变选档输入，重撒时更新）；
 * pending = 在途换档目标（源未就绪时登记，到达回调重建）。
 * T006.4 增补：box = 该 (块×资产) 全部实例（当档提交集——T021.4 密度默认 100% 下 =
 * 全量撒点集；字段保留密度口径语义供 021.8 A/B 通道）的紧致世界 AABB（自有桶/
 * 合并桶同源维护，块盒与选档代表的稳定基）；instanceCount = 当档实例数（分布
 * 与 stats 口径）；mergedBucket = 合并组成员态（undefined = 自有细块）；memberCulled =
 * 合并成员被 culled 排除中（实例退出合并桶当帧写入，回视重入——自有桶 culled 的
 * mesh.visible 等价物）。
 * 选档粒度注（T021.2 核实）：本态按 SourceState(=region) → ChunkState → assetId 三级
 * 挂载 = **region × chunk × asset 四维**（D41 §4.4 正式定义；T006.3 的 source 即
 * region 维——结构性等价，无需接线改造）。
 */
interface ChunkLodState {
  current: LodSelectionOutcome | undefined;
  level: RuntimeRepresentation;
  maxScale: number;
  pending?: RuntimeRepresentation;
  /** (块×资产) 实例紧致世界 AABB（写实例路径顺带累积；块盒 = ∪ 各资产 box） */
  readonly box: THREE.Box3;
  /** 当档实例数（含 memberCulled 排除中的真值——分布/合并判定口径；密度 100% 默认 = 全量） */
  instanceCount: number;
  /** 合并组所属桶（undefined = 自有细块桶 / 无桶） */
  mergedBucket?: MergedBucket;
  /** 合并成员被 culled 排除中（自有桶口径用 mesh.visible，不用本标记） */
  memberCulled: boolean;
  /**
   * 表示过渡状态机持有（T021.3，D41 §10.1 五字段原形；null = 首评前）。首评以
   * steadySelectionState(level) 起步，每帧 frame 经 domain stepTransition 推进。
   */
  transition: SelectionState | null;
  /**
   * 阴影表示缓存（T021.5，§5.4 中点切换）：最近一次 TransitionCommit.
   * shadowRepresentation（连续派生——每帧幂等，不消费 midpointCrossed 边沿〔留诊断〕）。
   * 消费面：自有桶/客座桶 cast 判定（refreshShadowCast）、合并桶成员 OR 语义与
   * shadowCasterInstances 计数；首评前 = level。
   */
  shadowRepresentation: RuntimeRepresentation;
  /** 展示表示缓存（提交口径：终态 cull → 'culled'，否则 SelectionState.current——
   *  分布计数与诊断消费；undefined = 未评估（回退 current ?? level） */
  display: LodSelectionOutcome | undefined;
  /** 过渡中标记缓存（transitionActive 透传——分布过渡计数面消费） */
  transitionActive: boolean;
  /** 当桶 aFadeOut 退场度缓存（0 = 完整呈现；写出判重——稳态零写零缓冲） */
  fadeOut: number;
  /** 合并桶内本成员写入区起点（rebuildMergedBucket 顺序分配；fade 区间写出用） */
  mergedOffset: number;
}

/** 单块运行态：块 Group（视锥剔除的开关单元）+ AABB + 合批网格 + 未就绪登记 */
interface ChunkState {
  readonly key: ScatterChunkKey;
  /** 所属源 id（mesh → 源反查表 resolvePick 的取值来源；块随源生灭，恒有效） */
  readonly sourceId: string;
  /** 块根（name=chunk:i:j 供调试/测试定位；持 identity 变换——实例矩阵即世界矩阵） */
  readonly group: THREE.Group;
  /** 块 AABB（frame 剔除判交用；XZ 为块矩形，Y 由实例网格包围盒并入） */
  readonly box: THREE.Box3;
  /** assetId → 合批网格（已就绪源） */
  readonly meshes: Map<string, MeshEntry>;
  /**
   * assetId → 过渡客座桶（T021.3 dither 双表示的目标表示侧——canopy 目标位；
   * 建立于 fade>0 且目标源就绪、拆除于完成迁移 / 回退 / 决策改向。过渡期免合并）
   */
  readonly incoming: Map<string, MeshEntry>;
  /** assetId → 实例数据（源未就绪/失败时登记；源到达后建网格。T006.4：列表为原始
   *  撒点全集——到达写入时按 Density 输入面裁定（100% 全量），只读消费不二次掷骰） */
  readonly pending: Map<string, readonly ScatterInstance[]>;
  /** assetId → LOD 运行态（T006.3；新资产初始 high、源就绪后评估接管） */
  readonly lod: Map<string, ChunkLodState>;
}

/** 散布源 = 一个区域 = { id, params, baseY }（003.3 起由 Feature/Style 驱动） */
interface SourceState {
  readonly id: string;
  params: ScatterParams;
  baseY: number;
  /** 源级显隐（对象 visible ∧ 图层 visible 的合成结果，RegionScatterSync 喂入）：false → 整片不渲染不可拾取 */
  visible: boolean;
  /** `${i}:${j}` → 块（覆盖块内含实例的块；空块即回收不入表——含合并成员） */
  readonly chunks: Map<string, ChunkState>;
  /** T006.4 合并桶表（`${superI}:${superJ}::${assetId}::${level}` → 桶；随源生灭） */
  readonly merged: Map<string, MergedBucket>;
}

/** 管理器级源缓存（跨源共享同 (assetId × level) 源；同桶只加载一次，失败告警一次
 *  不重试——仿池。T006.3 起按档分桶：键 = `${assetId}::${level}`。选档不取各档源
 *  半径——T006.6 起选档基准 = High 档源一次派生按 assetId 冻结的稳定基准
 *  （referenceSpheres，与当前档位解耦：同一 (块×资产) 任意档位下选档度量恒定）；
 *  本表只服务渲染源本身（当档 geometry/material 成套供给） */
interface AssetSourceState {
  source: InstanceSource | null;
  failed: boolean;
}

/** 初始容量与扩容策略（翻倍；避免逐块抖动重撒时逐实例扩容） */
const MIN_CAPACITY = 4;
function capacityFor(count: number): number {
  let capacity = MIN_CAPACITY;
  while (capacity < count) capacity *= 2;
  return capacity;
}

/**
 * 桶代表 scale（T021.2 口径收紧，D41 §4.4）：region × chunk × asset 桶内最大实例
 * scale——保守偏高档（大树更晚降档）。**全集口径 = 密度过滤前的确定性撒点集**
 * （T021.4 后密度默认 100% 全量，021.8 A/B 通道降密时该口径保证选档读数不随密度
 * 平移）：同一桶任意表示/密度下代表 scale 恒定（与 T006.6 稳定基准球同护栏——
 * 选档读数不随渲染表示平移）。空集回退占位 1（建桶路径列表恒非空——防御面）。
 */
function maxScaleOf(list: readonly ScatterInstance[]): number {
  let max = 0;
  for (const inst of list) {
    if (inst.scale > max) max = inst.scale;
  }
  return max > 0 ? max : 1;
}

function chunkKeyString(key: ScatterChunkKey): string {
  return `${key.i}:${key.j}`;
}

/**
 * 网格提交态判定（分布统计 shadowCasterInstances 口径用，T021.4）：块组可见（视锥
 * 剔除 / 源显隐的写手）∧ 网格自身可见（LOD culled 的写手）——两开关共同决定主渲染
 * 与影遍的零提交（resolvePick 可见性守卫同口径）。castShadow 由调用方另判（T021.5
 * 起建网格点按 Shadow Policy + 阴影表示〔中点切换〕维护——mesh.castShadow 读取即
 * 真值：自有/客座桶 per-chunk 精确、合并桶成员 OR 语义）。
 */
function isSubmittedMesh(
  mesh: THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>,
): boolean {
  return (mesh.parent?.visible ?? true) && mesh.visible && mesh.count > 0;
}

/** (assetId × representation) 源缓存键（表示维度后缀——与池桶/ProceduralSourceCache 同构口径） */
function assetStateKey(assetId: string, representation: RuntimeRepresentation): string {
  return `${assetId}::${representation}`;
}

/** 块矩形（半开 [min,max)；与撒点 chunk 语义同构） */
function chunkRectOf(key: ScatterChunkKey, sizeM: number): ScatterChunk {
  return {
    minX: key.i * sizeM,
    minZ: key.j * sizeM,
    maxX: (key.i + 1) * sizeM,
    maxZ: (key.j + 1) * sizeM,
  };
}

/** 多边形 bbox（<3 顶点 → null；退化输入与 scatter 同语义——登记源但零块） */
function polygonBBox(polygon: Vec2[]): { minX: number; minZ: number; maxX: number; maxZ: number } | null {
  if (!Array.isArray(polygon) || polygon.length < 3) return null;
  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;
  for (const p of polygon) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minZ) minZ = p.y;
    if (p.y > maxZ) maxZ = p.y;
  }
  if (!Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minZ) || !Number.isFinite(maxZ)) {
    return null;
  }
  return { minX, minZ, maxX, maxZ };
}

/**
 * 覆盖块索引（升序 i 主序）：AABB [x0,x1]×[z0,z1]（各外扩 pad）触及的块。
 * 边界闭合取 floor(max)：坐标恰落块边界（如 x=64@S=32）时归右侧块——与 scatterChunk
 * 半开 [min,max) 归属一致（该点只会出现在块 2 的输出里，块 1 覆盖它就漏撒）。
 */
function coveredChunkKeys(
  bbox: { minX: number; minZ: number; maxX: number; maxZ: number },
  pad: number,
  sizeM: number,
): ScatterChunkKey[] {
  const i0 = Math.floor((bbox.minX - pad) / sizeM);
  const i1 = Math.floor((bbox.maxX + pad) / sizeM);
  const j0 = Math.floor((bbox.minZ - pad) / sizeM);
  const j1 = Math.floor((bbox.maxZ + pad) / sizeM);
  const keys: ScatterChunkKey[] = [];
  for (let i = i0; i <= i1; i++) {
    for (let j = j0; j <= j1; j++) keys.push({ i, j });
  }
  return keys;
}

/**
 * 撒点参数逐值相等（多边形按顶点顺序逐点比对）。
 * 原始值直比（不做默认值归一）：「等价但写法不同」（如 clustering 0 vs undefined）
 * 判不等 → computeAffectedChunks 回全量受影响——保守方向安全（多算不少算）。
 */
function scatterParamsEqual(a: ScatterParams, b: ScatterParams): boolean {
  if (a.polygon.length !== b.polygon.length) return false;
  for (let k = 0; k < a.polygon.length; k++) {
    if (a.polygon[k]!.x !== b.polygon[k]!.x || a.polygon[k]!.y !== b.polygon[k]!.y) return false;
  }
  if (a.densityPerM2 !== b.densityPerM2 || a.seed !== b.seed) return false;
  if (a.clustering !== b.clustering) return false;
  if (a.clusterRadiusM !== b.clusterRadiusM) return false;
  if (a.edgeFalloffM !== b.edgeFalloffM) return false;
  if (a.sampler !== b.sampler) return false;
  const ar = a.scaleRange;
  const br = b.scaleRange;
  if ((ar === undefined) !== (br === undefined)) return false;
  if (ar && br && (ar.min !== br.min || ar.max !== br.max)) return false;
  const aa = a.assets ?? [];
  const ba = b.assets ?? [];
  if (aa.length !== ba.length) return false;
  for (let k = 0; k < aa.length; k++) {
    if (aa[k]!.assetId !== ba[k]!.assetId || aa[k]!.weight !== ba[k]!.weight) return false;
  }
  return true;
}

/**
 * 保守受影响块集合（纯函数，供 003.3 局部重算与单测）：
 * bbox(old) ∪ bbox(new) 各外扩撒点影响半径（edgeFalloff + clusterRadius + clusterStep，
 * 见 domain scatterInfluenceRadius）的覆盖块，去重后 (i,j) 升序。
 * - 多边形逐点相等但全局参数（density/seed/assets/clustering/scaleRange/...）变化 →
 *   外扩并集自然覆盖全部含实例块（pad ≥ 0 恒 ⊇ bbox 覆盖），即「全部块」；
 * - 参数完全相等 → []（无变化，recomputeChunks 空集 no-op）；
 * - 保守性：宁可多列（重撒幂等、确定性不变），不可漏列（漏列 = 陈旧实例残留）。
 */
export function computeAffectedChunks(
  oldParams: ScatterParams,
  newParams: ScatterParams,
  chunkSizeM = CHUNK_SIZE_M,
): ScatterChunkKey[] {
  if (scatterParamsEqual(oldParams, newParams)) return [];
  const size = chunkSizeM > 0 ? chunkSizeM : CHUNK_SIZE_M;
  const seen = new Set<string>();
  const keys: ScatterChunkKey[] = [];
  for (const params of [oldParams, newParams]) {
    const bbox = polygonBBox(params.polygon);
    if (!bbox) continue;
    for (const key of coveredChunkKeys(bbox, scatterInfluenceRadius(params), size)) {
      const str = chunkKeyString(key);
      if (seen.has(str)) continue;
      seen.add(str);
      keys.push(key);
    }
  }
  keys.sort((a, b) => a.i - b.i || a.j - b.j);
  return keys;
}

// 组合/剔除的模块级暂存（单线程渲染运行时；three 自身同款惯例）
const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scale = new THREE.Vector3();
const _matrix = new THREE.Matrix4();
/** 几何逐轴绝对包围暂存（geometryAbsExtentOf 返回值——同步消费，无逃逸） */
const _geometryExtent = new THREE.Box3();
const _chunkBox = new THREE.Box3();
const _viewProjection = new THREE.Matrix4();
const _frustum = new THREE.Frustum();
/** LOD 代表点暂存（块 AABB 最近点 = clampPoint(相机位)；值即时拷入纯数据入参） */
const _nearestPoint = new THREE.Vector3();

/**
 * 几何逐轴最大绝对角偏移包围盒（返回模块暂存 _geometryExtent；调用方同步消费）。
 * Y 旋转只会重排角点，分量最大恒有效；boundingBox 惰性：程序化 build / GLB 抽取均
 * 不算——首次触碰补算一次（缓存共享模板上，池与本管同源受益），绝无 null 分支的
 * ±0.5 占位（占位盒 Y 向失真 → 剔除盒过瘦 → 高资产块被过早剔出视锥）。
 */
function geometryAbsExtentOf(geometry: THREE.BufferGeometry): THREE.Box3 {
  if (!geometry.boundingBox) geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  _geometryExtent.min.set(
    -Math.max(Math.abs(box.min.x), Math.abs(box.max.x)),
    -Math.max(Math.abs(box.min.y), Math.abs(box.max.y)),
    -Math.max(Math.abs(box.min.z), Math.abs(box.max.z)),
  );
  _geometryExtent.max.set(-_geometryExtent.min.x, -_geometryExtent.min.y, -_geometryExtent.min.z);
  return _geometryExtent;
}

export class ScatterChunkManager {
  /** 渲染根（Renderer 挂 scene——contentGroup 兄弟；子树 = 块 Group × (源×块)） */
  readonly root = new THREE.Group();

  private readonly sources = new Map<string, SourceState>();
  private readonly assetStates = new Map<string, AssetSourceState>();
  /** 实例网格 → 所属源 id（拾取反查，D18.7；网格 dispose 时同步摘除，与源共生命周期） */
  private readonly meshOwners = new Map<THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>, string>();
  private readonly provideSource: (
    assetId: string,
    representation?: RuntimeRepresentation,
  ) => Promise<InstanceSource>;
  private readonly getAssetVariants: (assetId: string) => ProceduralVariants | undefined;
  private readonly getRepresentationCapability: (assetId: string) => RepresentationCapability | undefined;
  /** 有效表示链缓存（assetId → effectiveRepresentationChain 产物，T021.2；帧路径零重复归一） */
  private readonly representationChains = new Map<string, readonly RuntimeRepresentation[]>();
  /**
   * LOD 选档稳定基准（T006.6，D28.2）：assetId → High 档派生冻结基准球——选档
   * 半径恒取此（与 (块×资产) 当前期望档解耦，见 frame）；high 源到达时派生
   * （requestAsset）。
   */
  private readonly referenceSpheres = new LodReferenceSphereCache();
  /** aFadeOut 包装几何池（T021.3）：散布桶网格过渡期换装共享源几何顶点属性的包装几何 */
  private readonly fadeGeometries = new FadeGeometryPool();
  private readonly chunkSize: number;
  /** T006.4 合并策略（factor 语义化为每轴块数取整除；maxInstances ≤ 0 或 factor < 2 = 关闭） */
  private readonly mergeMaxInstances: number;
  private readonly mergeFactor: number;
  private disposed = false;

  constructor(options: ScatterChunkManagerOptions) {
    this.provideSource = options.provideSource;
    this.getAssetVariants = options.getAssetVariants ?? (() => undefined);
    this.getRepresentationCapability = options.getRepresentationCapability ?? (() => undefined);
    this.chunkSize = options.chunkSizeM && options.chunkSizeM > 0 ? options.chunkSizeM : CHUNK_SIZE_M;
    const merge = options.sparseMerge;
    this.mergeMaxInstances =
      merge && merge.maxInstancesPerChunk > 0 && merge.groupFactor >= 2
        ? merge.maxInstancesPerChunk
        : 0;
    this.mergeFactor = this.mergeMaxInstances > 0 && merge ? merge.groupFactor : 2;
    this.root.name = '__scatter_chunks__';
  }

  // ── 源（散布区域）生命周期 ───────────────────────────────

  /**
   * 登记/重建源（全量）：按 params.polygon bbox 计算覆盖块，逐块 scatterChunk →
   * 块内按 assetId 分组合批。同 id 重复调用 = 整片重建（幂等；确定性输入下输出逐位
   * 一致）。baseY 为源内全部实例的世界 y（v1 常量基面；003.3 起可换地表采样）。
   */
  setSource(id: string, params: ScatterParams, baseY = 0): void {
    if (this.disposed) return;
    const inheritVisible = this.sources.get(id)?.visible ?? true; // 重建继承显隐态（调用方无须重复喂 setSourceVisible）
    this.teardownSource(id);
    const state: SourceState = {
      id,
      params,
      baseY,
      visible: inheritVisible,
      chunks: new Map(),
      merged: new Map(),
    };
    this.sources.set(id, state);
    const bbox = polygonBBox(params.polygon);
    if (!bbox) return; // 退化多边形：登记源但零块（scatterChunk 同语义返回空）
    for (const key of coveredChunkKeys(bbox, 0, this.chunkSize)) {
      this.recomputeChunk(state, key);
    }
    if (!state.visible) {
      for (const chunk of state.chunks.values()) chunk.group.visible = false; // 隐藏源重建：新块立即整片不可见
    }
  }

  /**
   * 局部重算（003.3 机制根基）：只重撒列出的块，其余块的 InstancedMesh 矩阵缓冲
   * 逐位不动（本方法不触碰它们）。params 可选置换源参数（配合 computeAffectedChunks：
   * 调用方先算受影响块集，再以新参数重算这些块）；拓扑变化（块增/块空）由重算路径
   * 自然处理——列出块撒空即回收，未列块不新建。未知 id 安全 no-op。
   */
  recomputeChunks(id: string, keys: readonly ScatterChunkKey[], params?: ScatterParams): void {
    if (this.disposed) return;
    const state = this.sources.get(id);
    if (!state) return;
    if (params) state.params = params;
    for (const key of keys) this.recomputeChunk(state, key);
  }

  /** 摘除源：整片回收（块 Group 全拆、实例缓冲全释放；幂等） */
  removeSource(id: string): void {
    this.teardownSource(id);
  }

  /**
   * 源级显隐（003.3，对象 visible ∧ 图层 visible 的合成结果；幂等）：
   * false → 已有块立即整片 visible=false（不待下一帧——渲染零提交与拾取守卫即刻生效）；
   * true  → 不立即改写（可见性归 frame 的视锥判定管辖，连续渲染下一帧自然恢复）。
   * 与视锥剔除同用块 Group visible 一个开关：主渲染 / 阴影 pass / 拾取守卫三口径一致。
   */
  setSourceVisible(id: string, visible: boolean): void {
    if (this.disposed) return;
    const state = this.sources.get(id);
    if (!state || state.visible === visible) return;
    state.visible = visible;
    if (!visible) {
      for (const chunk of state.chunks.values()) chunk.group.visible = false;
      // T006.4：合并桶直挂 root（不在块组下），源隐藏同帧一并归零提交（与块组同口径）
      for (const bucket of state.merged.values()) {
        if (bucket.mesh) bucket.mesh.visible = false;
      }
    }
  }

  /**
   * 拾取反查（D18.7，D5）：散布 InstancedMesh 命中 → 所属源 id（regionId）；
   * 非散布网格 / 块组不可见 / 网格不可见 → null。可见性守卫是必须的显式挡板——
   * three r186 的 Raycaster 不跳过 visible=false 子树（只测 layers），源隐藏、视锥
   * 剔除的块与 LOD 超远裁剪的网格（T006.3 culled：组可见、网格 visible=false）都会
   * 被射线命中；以块 Group visible 与网格 visible（帧剔除/源显隐与 LOD culled 的
   * 共同写手）为「所见即所得」判据。instanceId 本层用不上（整源选中语义）。
   */
  resolvePick(hit: THREE.Intersection): string | null {
    const object = hit.object as THREE.InstancedMesh | null;
    if (!object || !object.isInstancedMesh) return null;
    const owner = this.meshOwners.get(object);
    if (owner === undefined) return null;
    if (!(object.parent?.visible ?? true)) return null;
    if (!object.visible) return null; // T006.3：LOD culled 网格不可拾取
    return owner;
  }

  // ── 帧路径（Renderer.renderFrame 在 controls.update 后调用）──

  /**
   * 逐块视锥剔除 + 逐 (块×资产) LOD 评估（T006.3；Renderer.renderFrame 在 controls 后、
   * render 前调用——D27.6 帧内时序：块剔除之后、render 之前评估档位）：
   *  - 剔除：Frustum = projectionMatrix × matrixWorldInverse 逐块 Box3 判交 → 块 Group
   *    visible 开关（three 对 visible=false 整子树零提交——主渲染与阴影 pass 同口径）；
   *  - LOD：lodEnabled（Renderer 持有的总开关，逐帧传入；缺省 false = 管线独立使用时
   *    的既有行为）时逐 (块×资产)（region × chunk × asset 粒度，D41 §4.4）走 domain
   *    评估器（T021.2 起为表示链选档）——subject = { 块 AABB 最近点, High 档派生稳定
   *    基准半径（T006.6——与当前档位解耦）, 桶内最大实例 scale（全集口径，§4.4 保守
   *    偏高档） }，迟滞参考 current
   *    由 ChunkLodState 持有；目标档 ≠ 当档桶 → 确定性重撒重建（源就绪即重建，冷源
   *    到达后回调）；'culled' → 网格 visible=false（桶保留，回视即时恢复）；
   *    lodEnabled=false → 评估器语义恒 High + culled 旁路（回退对比与兜底）。
   *  无源 O(1) 早退；相机矩阵自更新。RenderModeState 分遍改 camera.layers.mask 不影响
   *  本路径（visible 与层正交）。LOD 评估对剔除外的块照常进行（块回视口时档位/迟滞
   *  状态已就绪，且 culled 的块不会因 group.visible=false 而饿死）。
   */
  frame(camera: THREE.Camera, lodEnabled = false): void {
    if (this.disposed || this.sources.size === 0) return;
    camera.updateMatrixWorld();
    _viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    _frustum.setFromProjectionMatrix(_viewProjection);
    const view = lodViewOfCamera(camera);
    for (const state of this.sources.values()) {
      // 源级显隐与视锥剔除合成一个开关（隐藏源重建/扩块时也保持 false，不闪现）
      for (const chunk of state.chunks.values()) {
        chunk.group.visible = state.visible && _frustum.intersectsBox(chunk.box);
        if (chunk.lod.size === 0) continue;
        camera.getWorldPosition(_position);
        chunk.box.clampPoint(_position, _nearestPoint); // §4.3：代表点 = 块最近点
        for (const [assetId, lod] of chunk.lod) {
          // T006.6：选档基准 = High 档派生稳定半径（与当前档位解耦——换档不换选档
          // 输入）；防御回退（不可达：新资产 high 起步、首评前基准必已派生）= 当前档
          // 源球过渡（确定性、不冻结）
          const radius = this.referenceRadiusOf(assetId, lod.level);
          if (radius <= 0 || lod.maxScale <= 0) continue; // 基准未就绪/零尺度：评估缺输入，跳过
          const subject = {
            point: { x: _nearestPoint.x, y: _nearestPoint.y, z: _nearestPoint.z },
            radius,
            scale: lod.maxScale,
          };
          const target = evaluateLodRepresentation({
            view,
            subject,
            representations: this.representationChainOf(assetId),
            current: lod.current,
            lodEnabled,
          });
          const metric = normalizedViewDistance(view, subject);
          lod.current = target;
          this.stepChunkAssetTransition(state, chunk, assetId, lod, target, metric);
        }
      }
      // T006.4 合并桶提交态归一（源显隐 ∧ 有实例；成员 culled 排除后 count=0 → 零提交）
      for (const bucket of state.merged.values()) {
        if (bucket.mesh) bucket.mesh.visible = state.visible && bucket.mesh.count > 0;
      }
    }
  }

  /**
   * (块×资产) 过渡步进与提交执行（T021.3）：domain 状态机（stepTransition 纯函数）
   * 产出 SelectionState 推进 + 提交决策，映射到本管机制——
   *  - 硬切位（含多级跳档 / 非 {low,canopy} 起点的 cull）：完成即既有确定性重撒重建
   *    （源就绪即时；冷源 lod.pending 排队、到达回调 applyPendingLevelRebuilds 重建）；
   *  - dither 位：incoming 客座桶生命周期（fade>0 且目标源就绪时建立，完成 / 回退 /
   *    决策改向拆除——过渡期免合并记档见类头）+ 双侧 aFadeOut 写出 + 客座提交门控；
   *  - fade-out 退场位：当档桶逐实例 aFadeOut 写出（自有桶全槽 / 合并桶成员区间）+
   *    终态可见性（mesh.visible / memberCulled——沿既有 culled 机制，退场带内正常渲染）；
   *  - 完成迁移（硬切即时 / dither 带末）：拆客座 → rebuildChunkAsset（确定性重撒，
   *    常规合并裁定归位）→ 状态机 steady 归位。
   */
  private stepChunkAssetTransition(
    state: SourceState,
    chunk: ChunkState,
    assetId: string,
    lod: ChunkLodState,
    selection: LodSelectionOutcome,
    metric: number,
  ): void {
    // 目标表示源就绪度（'culled' 无目标源恒就绪）；发起/取源（冷源排队语义）
    let sourceReady = true;
    if (selection !== 'culled' && selection !== lod.level) {
      sourceReady = this.requestAsset(assetId, selection).source !== null;
    }
    const prev = lod.transition ?? steadySelectionState(lod.level);
    const { state: next, commit } = stepTransition({
      state: prev,
      selection,
      metric,
      sourceReady,
    });
    lod.transition = next;
    lod.display = commit.culled ? 'culled' : next.current;
    lod.transitionActive = next.transitionActive;
    // T021.5：阴影表示缓存（§5.4 中点切换——TransitionCommit.shadowRepresentation 连续
    // 派生，每帧幂等；不消费 midpointCrossed 边沿〔留诊断面，无状态推导优先〕；cast
    // 标志刷新归各提交执行点——applyCulledCommit / 建桶点 / applyPending* 收敛点）
    lod.shadowRepresentation = commit.shadowRepresentation;

    const kind = transitionKindOf(prev.current, selection);

    // 表示目标硬切：完成即重建；冷源排队（lod.pending——到达回调重建，沿既有语义）
    if (kind === 'hard-cut' && selection !== 'culled' && selection !== lod.level) {
      if (commit.completed) {
        lod.pending = undefined;
        this.disposeIncomingBucket(state, chunk, assetId);
        this.rebuildChunkAsset(state, chunk, assetId, selection);
        if (lod.transition) lod.transition = steadySelectionState(selection);
        lod.display = selection;
        return;
      }
      if (lod.pending !== selection) lod.pending = selection;
      this.applyCulledCommit(state, chunk, assetId, lod, commit);
      return;
    }

    // dither 双表示：客座桶生命周期 + 双侧 fade（dither 型 selection 必为表示）
    if (kind === 'dither' && selection !== 'culled') {
      if (commit.submitTarget) {
        this.writeIncomingBucket(state, chunk, assetId, selection);
        const incoming = chunk.incoming.get(assetId);
        if (incoming) {
          writeFadeRange(
            incoming.mesh,
            this.sourceGeometryOf(assetId, selection)!,
            this.fadeGeometries,
            0,
            incoming.mesh.count,
            1 - commit.fadeTarget,
            incoming.capacity,
          );
          incoming.mesh.visible = commit.fadeTarget > 0; // fade 0 客座零提交（省 DC）
        }
        this.writeOwnFade(chunk, assetId, lod, commit);
      } else {
        this.disposeIncomingBucket(state, chunk, assetId);
        this.writeOwnFade(chunk, assetId, lod, commit);
      }
      if (commit.completed) {
        this.disposeIncomingBucket(state, chunk, assetId);
        lod.pending = undefined;
        this.rebuildChunkAsset(state, chunk, assetId, selection);
        if (lod.transition) lod.transition = steadySelectionState(selection);
        lod.display = selection;
        return;
      }
      this.applyCulledCommit(state, chunk, assetId, lod, commit);
      return;
    }

    // fade-out 退场（kind === 'fade-out'，selection === 'culled'）：当档桶逐实例退场写出
    if (kind === 'fade-out') {
      this.writeOwnFade(chunk, assetId, lod, commit);
      this.applyCulledCommit(state, chunk, assetId, lod, commit);
      return;
    }

    // 稳态 / 决策回落（kind === 'none'）：清残客座、fade 归零
    this.disposeIncomingBucket(state, chunk, assetId);
    this.writeOwnFade(chunk, assetId, lod, commit);
    this.applyCulledCommit(state, chunk, assetId, lod, commit);
  }

  /**
   * 终态 cull 可见性执行（沿既有机制，T021.3 改为 commit.culled 驱动——fade-out 型
   * 在退场带末才触发、硬切型瞬时；恢复路径同帧回 true / 重入合并组）：自有桶
   * mesh.visible 开关（桶保留，回视即时恢复）；合并成员 memberCulled 退组重建。
   * T021.5：可见性翻转后重算阴影标志（culled 提交终态 cast/receive 一并 false 的
   * belt-and-braces——§七 Cull=off 与 shadowCasterInstances 计数语义自洽；恢复路径
   * 同帧复原策略值）。本方法在每个非完成提交路径尾步被调（稳态亦然）——阴影 cast
   * 标志随之中点翻转点逐帧刷新（refreshShadowCast 幂等）。
   */
  private applyCulledCommit(
    state: SourceState,
    chunk: ChunkState,
    assetId: string,
    lod: ChunkLodState,
    commit: { culled: boolean },
  ): void {
    const entry = chunk.meshes.get(assetId);
    if (commit.culled) {
      lod.pending = undefined;
      if (lod.mergedBucket) {
        if (!lod.memberCulled) {
          lod.memberCulled = true;
          this.rebuildMergedBucket(state, lod.mergedBucket);
        }
      } else if (entry) {
        entry.mesh.visible = false;
      }
      this.refreshShadowCast(state, chunk, assetId, lod);
      return;
    }
    if (entry) entry.mesh.visible = true;
    if (lod.mergedBucket && lod.memberCulled) {
      // 回视恢复：实例重入合并桶（确定性重建，矩阵同源——无跳变）
      lod.memberCulled = false;
      this.rebuildMergedBucket(state, lod.mergedBucket);
    }
    this.refreshShadowCast(state, chunk, assetId, lod);
  }

  /**
   * (块×资产) 阴影 cast 标志刷新（T021.5，每帧幂等；语义在 domain shadowPolicy、
   * 执行在本管）：
   *  - 自有桶 per-chunk 精确：castShadow = 提交中（mesh.visible = culled 写手）∧
   *    isShadowCasterFor(当档表示, 阴影表示)（§5.4 中点切换——dither 中点后当档桶
   *    让棒、fade-out 退场期恒 cast 至 culled）；receiveShadow 静态按表示（canopy
   *    false），仅整桶零提交时一并 false（belt-and-braces）；
   *  - 客座桶目标侧：cast = isShadowCasterFor(目标表示, 阴影表示)（中点前 false、
   *    中点后 true——恰一侧）；receive 静态按目标表示；
   *  - 合并桶成员 **OR 语义**（主代理裁定）：合并桶内各 chunk×asset 的 midpoint 可能
   *    错开数帧——任一成员该表示仍是 shadowRepresentation 则整桶 cast；短暂双投
   *    窗口在远场稀疏块、影 texel ~16cm 下不可辨（记档 021.8 观察点）。
   */
  private refreshShadowCast(
    state: SourceState,
    chunk: ChunkState,
    assetId: string,
    lod: ChunkLodState,
  ): void {
    const policy = shadowPolicyOf(lod.level);
    const entry = chunk.meshes.get(assetId);
    if (entry) {
      entry.mesh.castShadow =
        entry.mesh.visible && isShadowCasterFor(lod.level, lod.shadowRepresentation);
      entry.mesh.receiveShadow = policy.receive && entry.mesh.visible;
    }
    const incoming = chunk.incoming.get(assetId);
    if (incoming) {
      incoming.mesh.castShadow = isShadowCasterFor(incoming.level, lod.shadowRepresentation);
      incoming.mesh.receiveShadow = shadowPolicyOf(incoming.level).receive;
    }
    const bucket = lod.mergedBucket;
    if (bucket?.mesh) {
      bucket.mesh.castShadow = bucket.mesh.visible && this.mergedBucketCasts(state, bucket);
      bucket.mesh.receiveShadow = shadowPolicyOf(bucket.level).receive && bucket.mesh.visible;
    }
  }

  /** 合并桶 cast OR 判定（成员扫描）：任一成员 !memberCulled ∧ 阴影表示 === 桶表示 */
  private mergedBucketCasts(state: SourceState, bucket: MergedBucket): boolean {
    for (const memberKey of bucket.members) {
      const lod = state.chunks.get(memberKey)?.lod.get(bucket.assetId);
      if (!lod || lod.mergedBucket !== bucket) continue;
      if (!lod.memberCulled && isShadowCasterFor(bucket.level, lod.shadowRepresentation)) return true;
    }
    return false;
  }

  /**
   * 当档桶 fade 写出（fade-out 退场 / dither 旧侧）：退场度 = 1 − fadeCurrent；值缓存
   * 判重（稳态 0 零写零缓冲）。自有桶全槽均匀值（chunk × asset 粒度过渡态）；合并桶
   * 按成员写入区间分写。
   */
  private writeOwnFade(
    chunk: ChunkState,
    assetId: string,
    lod: ChunkLodState,
    commit: { fadeCurrent: number },
  ): void {
    const fadeOut = 1 - commit.fadeCurrent;
    if (lod.fadeOut === fadeOut) return;
    lod.fadeOut = fadeOut;
    const sourceGeometry = this.sourceGeometryOf(assetId, lod.level);
    if (!sourceGeometry) return;
    const merged = lod.mergedBucket?.mesh;
    if (merged) {
      writeFadeRange(
        merged,
        sourceGeometry,
        this.fadeGeometries,
        lod.mergedOffset,
        lod.instanceCount,
        fadeOut,
        (lod.mergedBucket?.capacity ?? 0),
      );
      return;
    }
    const entry = chunk.meshes.get(assetId);
    if (entry) {
      writeFadeRange(
        entry.mesh,
        sourceGeometry,
        this.fadeGeometries,
        0,
        entry.mesh.count,
        fadeOut,
        entry.capacity,
      );
    }
  }

  /** (assetId × representation) 源几何（fade 缓冲包装的源身份；未就绪 → undefined） */
  private sourceGeometryOf(assetId: string, representation: RuntimeRepresentation): THREE.BufferGeometry | undefined {
    return this.assetStates.get(assetStateKey(assetId, representation))?.source?.geometry;
  }

  /**
   * 写/建 (块×资产) 过渡客座桶（dither 目标表示侧；调用前提 = 目标源就绪）：确定性
   * 重撒同规则实例（密度默认 100% 全保真——§八 Density，与表示无关），写矩阵 +
   * lod.box 并入客座实例盒（Union 剔除，§四.3）。容量翻倍、桶对象复用（同目标
   * 表示）；**过渡期免合并**（完成迁移后 rebuildChunkAsset 常规裁定归并）。fade 值
   * 由调用方随后写出。
   */
  private writeIncomingBucket(
    state: SourceState,
    chunk: ChunkState,
    assetId: string,
    target: RuntimeRepresentation,
  ): void {
    const asset = this.assetStates.get(assetStateKey(assetId, target));
    if (!asset?.source) return; // 防御：调用前提（submitTarget 隐含就绪）
    const lod = chunk.lod.get(assetId);
    if (!lod) return;
    const list = this.densityThin(this.memberInstances(state, chunk, assetId));
    let entry = chunk.incoming.get(assetId);
    if (!entry || entry.level !== target) {
      if (entry) this.disposeIncomingBucketEntry(chunk, entry, assetId);
      const capacity = capacityFor(list.length);
      const mesh = new THREE.InstancedMesh(asset.source.geometry, asset.source.material, capacity);
      mesh.name = `incoming:${state.id}:${chunk.key.i}:${chunk.key.j}:${assetId}:${target}`;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      // T021.5：客座桶目标侧阴影策略（块组可见性管辖影 pass 同零提交）：cast = 中点
      // 判定——isShadowCasterFor(目标表示, 当前阴影表示)（创建时按现值，冷源迟到跳档
      // 场景〔applyPendingIncoming〕亦成立；每帧 refreshShadowCast 细化）；receive 静态
      // 按目标表示（canopy false）；depth 三档映射 shadowDepthMaterialOf（canopy 挂
      // 源深度材质——simplified 构造）
      mesh.castShadow = isShadowCasterFor(target, lod.shadowRepresentation);
      const incomingPolicy = shadowPolicyOf(target);
      mesh.receiveShadow = incomingPolicy.receive;
      const incomingDepth = shadowDepthMaterialOf(target, asset.source);
      if (incomingDepth !== undefined) mesh.customDepthMaterial = incomingDepth;
      chunk.group.add(mesh);
      this.meshOwners.set(mesh, chunk.sourceId); // 拾取反查（fade 期命中 → 源 id，§12）
      entry = { mesh, capacity, level: target };
      chunk.incoming.set(assetId, entry);
    } else if (entry.capacity < list.length) {
      entry.capacity = capacityFor(list.length);
      const attribute = new THREE.InstancedBufferAttribute(
        new Float32Array(entry.capacity * 16),
        16,
      );
      attribute.setUsage(THREE.DynamicDrawUsage);
      entry.mesh.instanceMatrix = attribute;
    }
    const mesh = entry.mesh;
    mesh.count = list.length;
    const geoExtent = geometryAbsExtentOf(asset.source.geometry);
    // Union 剔除：lod.box 不清空——客座实例盒并入当档盒之上（§四.3 并集语义）
    const variants = this.getAssetVariants(assetId);
    const tint = variants && (variants.hueJitter ?? 0) > 0 ? variants : null;
    if (tint && list.length > 0) this.ensureColorBuffer(mesh, entry.capacity);
    this.writeInstanceRange(mesh, 0, list, state.baseY, geoExtent, tint, lod);
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
    this.refreshChunkBox(chunk, state.baseY);
  }

  /**
   * 拆客座桶（完成迁移 / 回退 / 决策改向 / 资产退出块）：包装几何归还池、lod.box 从
   * 当档集确定性重算（客座盒退出并集）、块盒刷新。
   */
  private disposeIncomingBucket(state: SourceState, chunk: ChunkState, assetId: string): void {
    const entry = chunk.incoming.get(assetId);
    if (!entry) return;
    this.disposeIncomingBucketEntry(chunk, entry, assetId);
    const lod = chunk.lod.get(assetId);
    if (lod) {
      this.recomputeLodBoxFromCurrent(state, chunk, assetId, lod);
      this.refreshChunkBox(chunk, state.baseY);
    }
  }

  /** 客座桶网格拆除（矩阵缓冲释放；共享模板不动；fade 包装几何归还池） */
  private disposeIncomingBucketEntry(chunk: ChunkState, entry: MeshEntry, assetId: string): void {
    const sourceGeometry = this.sourceGeometryOf(assetId, entry.level);
    if (sourceGeometry && entry.mesh.geometry !== sourceGeometry) {
      this.fadeGeometries.release(entry.mesh.geometry);
    }
    entry.mesh.removeFromParent();
    entry.mesh.dispose(); // 只释放实例矩阵/颜色缓冲（共享 geometry/material 不动）
    this.meshOwners.delete(entry.mesh);
    chunk.incoming.delete(assetId);
  }

  /** lod.box 从当期提交集（密度 100% 默认 = 全量撒点集）确定性重算（客座拆除后退出
   *  Union；mesh=null 只累积盒） */
  private recomputeLodBoxFromCurrent(
    state: SourceState,
    chunk: ChunkState,
    assetId: string,
    lod: ChunkLodState,
  ): void {
    lod.box.makeEmpty();
    const sourceGeometry = this.sourceGeometryOf(assetId, lod.level);
    if (!sourceGeometry) return;
    const list = this.densityThin(this.memberInstances(state, chunk, assetId));
    if (list.length === 0) return;
    const geoExtent = geometryAbsExtentOf(sourceGeometry);
    this.writeInstanceRange(null, 0, list, state.baseY, geoExtent, null, lod);
  }

  /**
   * 资产有效表示链（T021.2 表示能力驱动，缓存首次查询）：effectiveRepresentationChain
   * 产物——representations 声明优先、levels 派生回退、均未声明单档 ['high']（021.1
   * 契约；评估器对空链另有缺省单档防御）。
   */
  private representationChainOf(assetId: string): readonly RuntimeRepresentation[] {
    const cached = this.representationChains.get(assetId);
    if (cached) return cached;
    const chain = effectiveRepresentationChain(this.getRepresentationCapability(assetId) ?? {});
    this.representationChains.set(assetId, chain);
    return chain;
  }

  /**
   * 选档稳定基准半径（T006.6）：High 档派生冻结缓存优先；防御回退（会话内不可达
   * 路径：新资产 high 起步、块首评前基准必已派生）= 当前档源球半径过渡——确定性、
   * 不冻结，基准就绪即被取代（保证评估输入恒为正、不阻塞不报错）。
   */
  private referenceRadiusOf(assetId: string, representation: RuntimeRepresentation): number {
    const reference = this.referenceSpheres.get(assetId);
    if (reference) return reference.radius;
    return (
      this.assetStates.get(assetStateKey(assetId, representation))?.source?.geometry.boundingSphere
        ?.radius ?? 0
    );
  }

  /**
   * 运行态快照（DEV 冒烟 stats：drawCalls/triangles 由 Renderer.getViewportStats 补齐）。
   * instances = 登记口径（自有桶 count——含 culled 隐藏桶的缓冲实例 + 合并桶当帧写入集
   * + 过渡客座桶 count，T021.3）；提交口径（各档渲染中实例）见 getLodDistribution。
   */
  getStats(): { totalChunks: number; visibleChunks: number; instances: number } {
    let totalChunks = 0;
    let visibleChunks = 0;
    let instances = 0;
    for (const state of this.sources.values()) {
      for (const chunk of state.chunks.values()) {
        totalChunks += 1;
        if (chunk.group.visible) visibleChunks += 1;
        for (const entry of chunk.meshes.values()) instances += entry.mesh.count;
        for (const entry of chunk.incoming.values()) instances += entry.mesh.count; // T021.3 客座
      }
      for (const bucket of state.merged.values()) {
        if (bucket.mesh) instances += bucket.mesh.count;
      }
    }
    return { totalChunks, visibleChunks, instances };
  }

  /**
   * LOD 分布双口径只读快照（T006.4，D27.9 归因数据；T021.3 过渡计数面；T021.4 口径
   * 升级——D41 §十三）：自有桶 + 合并桶各表示实例数与桶数 + 过渡计数面 + 目标表示
   * 口径 + 阴影投射计数。口径：实例按当前展示表示（lod.display ?? current ?? level；
   * culled 实例含合并成员被排除的真值集）；桶按提交口径（自有桶/合并桶各计 1——culled
   * 中自有桶计 culled，合并桶按 mesh 存在的表示计、其 culled 成员只计实例不另计桶）；
   * transitionTargets = 过渡中 (块×资产) 的实例按 SelectionState.target 归档（与
   * instances/transition 计数面合流不重复计——非过渡单元不计、客座侧不单列）；
   * shadowCasterInstances = 提交中网格（parent 可见 ∧ mesh 可见 ∧ castShadow）的实例
   * 数合计——**T021.5 策略驱动真值口径**：建网格点 castShadow 按 Shadow Policy +
   * 阴影表示（§5.4 中点切换）维护——自有/客座桶 per-chunk 精确（中点切换后当档桶
   * 不计、客座桶计）、合并桶成员 OR 语义，本字段自动跟随策略值。
   * O(块×资产) 遍历，供验收报表/调试按需调用，不进帧路径。
   */
  getLodDistribution(): LodDistribution {
    const counter = new LodDistributionCounter();
    for (const state of this.sources.values()) {
      for (const chunk of state.chunks.values()) {
        for (const [assetId, lod] of chunk.lod) {
          if (lod.mergedBucket) continue; // 合并成员经合并桶口径（下行循环），不双计
          const entry = chunk.meshes.get(assetId);
          if (!entry) continue; // 源未就绪（pending 登记）：无桶无实例
          const rep = lod.display ?? lod.current ?? lod.level;
          counter.add(rep, entry.mesh.count, 1);
          // T021.5：castShadow 读取即真值（refreshShadowCast 按策略+阴影表示维护）
          if (isSubmittedMesh(entry.mesh) && entry.mesh.castShadow) {
            counter.addShadowCasters(entry.mesh.count);
          }
          if (lod.transitionActive) {
            counter.addTransition(lod.instanceCount, 1, 0);
            counter.addTransitionTarget(lod.transition?.target ?? lod.level, lod.instanceCount);
          }
        }
        // T021.3 过渡客座桶（dither 目标侧；count=0 零提交计 culled）
        for (const entry of chunk.incoming.values()) {
          const rep = entry.mesh.count > 0 ? entry.level : 'culled';
          counter.add(rep, entry.mesh.count, 1);
          // T021.5：castShadow 读取即真值（中点后目标侧才计）
          if (isSubmittedMesh(entry.mesh) && entry.mesh.castShadow) {
            counter.addShadowCasters(entry.mesh.count);
          }
          if (entry.mesh.count > 0) counter.addTransition(0, 1, 1);
        }
      }
      for (const bucket of state.merged.values()) {
        if (!bucket.mesh) continue;
        // 桶按提交口径：提交中计桶档；整桶零提交（源隐藏/全成员 culled → count=0）计 culled
        const rep = bucket.mesh.visible && bucket.mesh.count > 0 ? bucket.level : 'culled';
        counter.add(rep, bucket.mesh.count, 1);
        if (rep !== 'culled' && bucket.mesh.castShadow) counter.addShadowCasters(bucket.mesh.count);
        for (const memberKey of bucket.members) {
          const chunk = state.chunks.get(memberKey);
          const lod = chunk?.lod.get(bucket.assetId);
          if (!lod || lod.mergedBucket !== bucket) continue;
          if (lod.memberCulled) {
            counter.add('culled', lod.instanceCount, 0);
            continue;
          }
          if (lod.transitionActive) {
            counter.addTransition(lod.instanceCount, 1, 0);
            counter.addTransitionTarget(lod.transition?.target ?? lod.level, lod.instanceCount);
          }
        }
      }
    }
    return counter.snapshot();
  }

  /** 停止一切并整片回收（Renderer.dispose 在源释放之前调用；幂等） */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const id of [...this.sources.keys()]) this.teardownSource(id);
    this.assetStates.clear(); // 只清缓存条目（源端资源归 loader/缓存统一释放）
    this.referenceSpheres.clear();
    this.fadeGeometries.clear(); // T021.3：包装几何池清空（GL 缓冲随上下文消亡）
    this.meshOwners.clear();
    this.root.removeFromParent();
  }

  // ── 内部：块计算与网格维护 ───────────────────────────────

  /**
   * 换档重建执行（T006.3；T021.3 过渡状态机化——调度归 stepChunkAssetTransition）：
   * 确定性重撒（同 seed 同结果——scatterChunk 纯函数，实例集合跨表示逐位一致；
   * T021.4 密度默认 100% 全保真——换表示零实例丢失）→ 拆旧档桶（自有桶实例缓冲释放 /
   * 合并桶退组重建，共享模板资源不动）→ 以目标表示 InstanceSource 成套建新桶（自有
   * 细块或合并桶——writeChunkAssetBuckets 统一裁定，D27.4「不做桶内换 Source」两形态
   * 同守）。同步完成拆旧建新（单 JS 块内无渲染观测点——无缺帧闪烁）。目标档实例为零
   * （参数在途变更的防御路径）→ 摘桶按空资产语义回收。
   */
  private rebuildChunkAsset(
    state: SourceState,
    chunk: ChunkState,
    assetId: string,
    level: RuntimeRepresentation,
  ): void {
    const asset = this.assetStates.get(assetStateKey(assetId, level));
    if (!asset?.source) return; // 未就绪：lod.pending 已登记，到达回调重建
    const lod = chunk.lod.get(assetId);
    if (!lod) return;
    const instances = scatterChunk(state.params, chunkRectOf(chunk.key, this.chunkSize)).filter(
      (inst) => inst.assetId === assetId,
    );
    lod.level = level;
    lod.pending = undefined;
    this.disposeOwnMesh(chunk, assetId);
    this.leaveMergedBucket(state, chunk, assetId);
    if (instances.length === 0) {
      chunk.lod.delete(assetId);
      this.recycleChunkIfEmpty(state, chunk);
      return;
    }
    this.writeChunkAssetBuckets(state, chunk, assetId, instances, level);
  }

  /**
   * 冷源到达后的在途换档收敛：全部源 × 块中 lod.pending 指向 (assetId, level) 的
   * (块×资产) 逐个确定性重建（块/源可能已在等待期间被拆——按 Map 现存态自然跳过）。
   */
  private applyPendingLevelRebuilds(assetId: string, level: RuntimeRepresentation): void {
    for (const state of this.sources.values()) {
      for (const chunk of state.chunks.values()) {
        const lod = chunk.lod.get(assetId);
        if (lod?.pending === level) {
          this.rebuildChunkAsset(state, chunk, assetId, level);
          // 排队收敛后状态机归位 + 展示缓存同步（迁移已完成——防陈旧 queued current
          // 卡住后续决策分支、防分布计数残留排队期旧值）
          lod.transition = steadySelectionState(level);
          lod.display = level;
          lod.shadowRepresentation = level; // T021.5：稳态随迁（下一帧连续派生幂等重申）
        }
      }
    }
  }

  /**
   * 冷源到达后的 dither 排队客座收敛（T021.3）：全部源 × 块中过渡状态机 target 指向
   * 本表示且源未就绪（排队中）的 (块×资产) 建客座桶（fade 值下一帧 frame 续写——
   * 到达即建桶使 flush 语义与硬切重建对齐）。
   */
  private applyPendingIncoming(assetId: string, representation: RuntimeRepresentation): void {
    for (const state of this.sources.values()) {
      for (const chunk of state.chunks.values()) {
        const lod = chunk.lod.get(assetId);
        const transition = lod?.transition;
        if (
          !lod ||
          !transition ||
          transition.target !== representation ||
          transition.sourceReady ||
          transition.current === representation
        ) {
          continue;
        }
        if (transitionKindOf(transition.current, representation) !== 'dither') continue;
        this.writeIncomingBucket(state, chunk, assetId, representation);
      }
    }
  }

  /** 单块重撒：scatterChunk → 按 assetId 分组 → 网格/合并桶写入 / 未就绪登记 / 空块回收 */
  private recomputeChunk(state: SourceState, key: ScatterChunkKey): void {
    const keyStr = chunkKeyString(key);
    const instances = scatterChunk(state.params, chunkRectOf(key, this.chunkSize));
    const byAsset = new Map<string, ScatterInstance[]>();
    for (const inst of instances) {
      let list = byAsset.get(inst.assetId);
      if (!list) {
        list = [];
        byAsset.set(inst.assetId, list);
      }
      list.push(inst);
    }

    let chunk = state.chunks.get(keyStr);
    if (!chunk) {
      if (byAsset.size === 0) return; // 新块即空：不建（覆盖块含多边形空洞/边角）
      chunk = {
        key,
        sourceId: state.id,
        group: new THREE.Group(),
        box: new THREE.Box3(),
        meshes: new Map(),
        incoming: new Map(),
        pending: new Map(),
        lod: new Map(),
      };
      chunk.group.name = `chunk:${key.i}:${key.j}`;
      chunk.group.visible = state.visible; // 隐藏源局部重算扩出的新块不闪现（frame 随后接管）
      this.initChunkBox(chunk, state.baseY);
      this.root.add(chunk.group);
      state.chunks.set(keyStr, chunk);
    }

    // 资产退出本块：合批网格释放（实例归零即拆，容量不保留——块空回收语义）；
    // T006.4：合并成员先退组（组无成员即拆、余组确定性重建）；T021.3：过渡客座桶
    // 随资产进出块成对拆除
    for (const assetId of [...chunk.meshes.keys()]) {
      if (byAsset.has(assetId)) continue;
      const entry = chunk.meshes.get(assetId)!;
      const sourceGeometry = this.sourceGeometryOf(assetId, entry.level);
      if (sourceGeometry && entry.mesh.geometry !== sourceGeometry) {
        this.fadeGeometries.release(entry.mesh.geometry); // T021.3：fade 包装归还池
      }
      entry.mesh.removeFromParent();
      entry.mesh.dispose(); // 只释放实例矩阵/颜色缓冲（共享 geometry/material 不动）
      this.meshOwners.delete(entry.mesh); // 拾取反查表同步摘除（网格已不可命中）
      chunk.meshes.delete(assetId);
    }
    for (const assetId of [...chunk.incoming.keys()]) {
      if (!byAsset.has(assetId)) this.disposeIncomingBucket(state, chunk, assetId);
    }
    for (const assetId of [...chunk.pending.keys()]) {
      if (!byAsset.has(assetId)) chunk.pending.delete(assetId);
    }
    for (const assetId of [...chunk.lod.keys()]) {
      if (byAsset.has(assetId)) continue;
      this.leaveMergedBucket(state, chunk, assetId); // T006.4：合并运行态随资产进出块成对清理
      chunk.lod.delete(assetId);
    }

    for (const [assetId, list] of byAsset) {
      // 新资产初始 'high'（attach 时无相机评估，首帧 frame 评估即校正；迟滞无参考
      // 按名义档起步——无残留状态）；既有资产保持当期期望档（局部重算不改档位状态）
      const lod =
        chunk.lod.get(assetId) ?? {
          current: undefined,
          level: 'high' as const,
          maxScale: 1,
          box: new THREE.Box3(),
          instanceCount: 0,
          memberCulled: false,
          transition: null,
          shadowRepresentation: 'high' as const, // T021.5：首评前 = 桶档（未评估回退口径沿）
          display: undefined,
          transitionActive: false,
          fadeOut: 0,
          mergedOffset: 0,
        };
      chunk.lod.set(assetId, lod);
      this.requestAsset(assetId, lod.level); // 发起/取源（未就绪 → writeChunkAssetBuckets 登记 pending）
      this.writeChunkAssetBuckets(state, chunk, assetId, list, lod.level);
      // T021.3：参数变更期在途 dither 客座桶按新参数确定性刷新（fade 值下一帧续写）；
      // 硬切排队/稳态残留客座即拆
      if (chunk.incoming.has(assetId)) {
        const st = lod.transition;
        if (st && st.target !== lod.level && transitionKindOf(lod.level, st.target) === 'dither') {
          this.writeIncomingBucket(state, chunk, assetId, st.target);
        } else {
          this.disposeIncomingBucket(state, chunk, assetId);
        }
      }
    }

    this.recycleChunkIfEmpty(state, chunk);
  }

  /**
   * 块回收判定（T006.4 从 recomputeChunk 尾步提炼）：自有桶与登记全空 **且无合并成员**
   * （合并成员的实例在合并桶里，块组内无网格）→ 拆块回收；否则刷新块 AABB。
   */
  private recycleChunkIfEmpty(state: SourceState, chunk: ChunkState): void {
    const hasMergedMember = (() => {
      for (const lod of chunk.lod.values()) if (lod.mergedBucket) return true;
      return false;
    })();
    if (chunk.meshes.size === 0 && chunk.pending.size === 0 && !hasMergedMember) {
      this.teardownChunk(state, chunk); // 块整空（多边形缩走）：块 Group 回收
      state.chunks.delete(chunkKeyString(chunk.key));
      return;
    }
    this.refreshChunkBox(chunk, state.baseY);
  }

  /** 取或发起源加载（同 (assetId × level) 管理器内只一次；失败告警一次不重试——仿池） */
  private requestAsset(assetId: string, representation: RuntimeRepresentation): AssetSourceState {
    const key = assetStateKey(assetId, representation);
    const existing = this.assetStates.get(key);
    if (existing) return existing;
    const asset: AssetSourceState = { source: null, failed: false };
    this.assetStates.set(key, asset);
    this.provideSource(assetId, representation)
      .then((source) => {
        asset.source = source;
        if (!source.geometry.boundingSphere) source.geometry.computeBoundingSphere();
        // T006.6：high 源到达即派生选档稳定基准（assetId 冻结一次——选档自此与当前
        // 档位解耦，换档不换选档输入；同 key 几何确定性恒等，冻结幂等）
        if (representation === 'high') this.referenceSpheres.freezeFromHighSource(assetId, source);
        if (this.disposed) return; // dispose 后迟到的源：只记录不建网格
        this.buildPendingMeshes(assetId, representation);
        this.applyPendingLevelRebuilds(assetId, representation);
        this.applyPendingIncoming(assetId, representation); // T021.3：dither 排队客座收敛
      })
      .catch((err: unknown) => {
        if (!asset.failed) {
          asset.failed = true;
          console.warn('[ScatterChunkManager] 散布资产源加载失败，实例不渲染', assetId, err);
        }
      });
    return asset;
  }

  /**
   * 源就绪：为全部块的该资产登记数据补建网格（仿池「源到达后一次性建网格」）。
   * T006.3：按 (assetId, level) 取源——登记发生在当期期望档 lod.level（新资产 high、
   * 换档在途不走 pending 路径），到达的正是该档源时才建。T006.4：写入统一走
   * writeChunkAssetBuckets（自有细块 / 合并桶 / 抽稀统一裁定路径）。
   */
  private buildPendingMeshes(assetId: string, level: RuntimeRepresentation): void {
    const asset = this.assetStates.get(assetStateKey(assetId, level));
    if (!asset?.source) return;
    for (const state of this.sources.values()) {
      for (const chunk of state.chunks.values()) {
        const list = chunk.pending.get(assetId);
        if (!list) continue;
        const lod = chunk.lod.get(assetId);
        if (!lod || lod.level !== level) continue; // 期望档已变：本档源到达不建（换档路径接管）
        chunk.pending.delete(assetId);
        this.writeChunkAssetBuckets(state, chunk, assetId, list, level);
      }
    }
  }

  /**
   * (块×资产) 当档桶统一写入路径（T006.4 自 recomputeChunk / buildPendingMeshes /
   * rebuildChunkAsset 三入口收敛）：源未就绪 → pending 登记（原始列表，到达后经本路径
   * 再裁定）；就绪 → 密度过滤（thinInstances——Density 输入面恒全量 DENSITY_FULL_KEEP
   * 100%，§八：换表示不丢实例；100% 下零拷贝）→ 合并裁定（允许合批表示
   * （isBatchMergeAllowed）∧ 稀疏 → 合并桶；否则自有细块桶——leaveMergedBucket 先行
   * 保证组员态与桶态一致）。两形态同源写实例（writeInstanceRange），块盒统一由
   * lod.box 汇聚。
   */
  private writeChunkAssetBuckets(
    state: SourceState,
    chunk: ChunkState,
    assetId: string,
    rawList: readonly ScatterInstance[],
    level: RuntimeRepresentation,
  ): void {
    const lod = chunk.lod.get(assetId);
    if (!lod) return; // 防御：调用前提（资产必在 chunk.lod）
    const asset = this.assetStates.get(assetStateKey(assetId, level));
    if (!asset?.source) {
      chunk.pending.set(assetId, rawList); // 未就绪/失败均登记（失败渲染不可能，数据不崩不弃）
      return;
    }
    const list = this.densityThin(rawList);
    lod.instanceCount = list.length;
    lod.maxScale = maxScaleOf(rawList); // T021.2 代表 scale 全集口径（密度过滤前——选档输入与表示/密度解耦）
    if (this.shouldMergeBucket(level, list.length)) {
      const superKey = this.superKeyOf(chunk.key);
      const target = this.mergedBucketFor(state, superKey, assetId, level);
      if (lod.mergedBucket && lod.mergedBucket !== target) {
        this.leaveMergedBucket(state, chunk, assetId); // 跨档/跨组残员态：先退旧组（余组重建）
      }
      this.disposeOwnMesh(chunk, assetId);
      target.members.add(chunkKeyString(chunk.key));
      lod.mergedBucket = target;
      this.rebuildMergedBucket(state, target);
    } else {
      this.leaveMergedBucket(state, chunk, assetId);
      this.writeChunkAssetMesh(chunk, assetId, list, state.baseY, level);
    }
    this.refreshChunkBox(chunk, state.baseY);
  }

  /**
   * 密度过滤（T021.4，D41 §八——Density 与表示解耦）：domain thinInstances 确定性
   * 过滤，密度输入恒 DENSITY_FULL_KEEP（全表示默认 100%——**选档换表示不丢实例**；
   * 100% 下零拷贝返回）。旧 thinForLevel（按表示查 levelInstanceKeep）随密度职责
   * 废止拆除；75%/50% 降密归 021.8 Density 专项 A/B 通道（本管不实装密度旋钮）。
   */
  private densityThin(list: readonly ScatterInstance[]): readonly ScatterInstance[] {
    return thinInstances(list, DENSITY_FULL_KEEP);
  }

  /** 合并裁定（T006.4；T021.4 批次键迁移）：注入开启 ∧ 允许合批的表示
   *  （isBatchMergeAllowed——§九绑 representation；high 恒否=近处全保真+细粒度剔除，
   *  mid/low/canopy 允许）∧ 稀疏（≤ 阈值）。过渡客座桶不经本裁定（免合并记档） */
  private shouldMergeBucket(representation: RuntimeRepresentation, count: number): boolean {
    return (
      this.mergeMaxInstances > 0 && isBatchMergeAllowed(representation) && count <= this.mergeMaxInstances
    );
  }

  /** 块键 → 合并组超块键（floor 整除；groupFactor=2 即 (i>>1, j>>1) 的 2×2 超块） */
  private superKeyOf(key: ScatterChunkKey): ScatterChunkKey {
    return { i: Math.floor(key.i / this.mergeFactor), j: Math.floor(key.j / this.mergeFactor) };
  }

  /** 取或建合并桶（挂 root 直下；mesh 于 rebuildMergedBucket 按需创建——先登记后成桶） */
  private mergedBucketFor(
    state: SourceState,
    superKey: ScatterChunkKey,
    assetId: string,
    level: RuntimeRepresentation,
  ): MergedBucket {
    const key = `${superKey.i}:${superKey.j}::${assetId}::${level}`;
    let bucket = state.merged.get(key);
    if (!bucket) {
      bucket = { key, superKey, assetId, level, members: new Set(), mesh: null, capacity: 0 };
      state.merged.set(key, bucket);
    }
    return bucket;
  }

  /** 退出合并组（幂等）：摘成员；组空即拆（实例缓冲释放，共享模板不动）；余组确定性重建 */
  private leaveMergedBucket(state: SourceState, chunk: ChunkState, assetId: string): void {
    const lod = chunk.lod.get(assetId);
    const bucket = lod?.mergedBucket;
    if (!lod || !bucket) return;
    lod.mergedBucket = undefined;
    lod.memberCulled = false;
    bucket.members.delete(chunkKeyString(chunk.key));
    if (bucket.members.size === 0) this.teardownMergedBucket(state, bucket);
    else this.rebuildMergedBucket(state, bucket);
  }

  /** 拆合并桶：网格移除释放 + 表项摘除（源 teardown / 组空回收路径） */
  private teardownMergedBucket(state: SourceState, bucket: MergedBucket): void {
    if (bucket.mesh) {
      const sourceGeometry = this.sourceGeometryOf(bucket.assetId, bucket.level);
      if (sourceGeometry && bucket.mesh.geometry !== sourceGeometry) {
        this.fadeGeometries.release(bucket.mesh.geometry); // T021.3：fade 包装归还池
      }
      bucket.mesh.removeFromParent();
      bucket.mesh.dispose(); // 只释放实例矩阵/颜色缓冲（共享 geometry/material 不动）
      this.meshOwners.delete(bucket.mesh);
      bucket.mesh = null;
      bucket.capacity = 0;
    }
    state.merged.delete(bucket.key);
  }

  /**
   * 合并桶整桶重建（T006.4 唯一写路径——成员进出/换表示/culled 排除/局部重算全部经此）：
   * 成员按 (i,j) 升序逐块确定性重撒（scatterChunk 纯函数 + 密度过滤同规则 100% 全量）
   * → 顺序写入同一 InstancedMesh（实例序 = 成员块序 × 块内撒点序——确定性）；
   * memberCulled 成员的实例退出当帧写入（lod.box/maxScale 仍按全集累积——选档输入与
   * 块盒稳定）。容量翻倍、mesh 引用组内稳定（拆组建新除外）；收尾
   * computeBoundingSphere（three 逐对象视锥剔除用——合并桶直挂 root，不占块组剔除）。
   */
  private rebuildMergedBucket(state: SourceState, bucket: MergedBucket): void {
    const asset = this.assetStates.get(assetStateKey(bucket.assetId, bucket.level));
    if (!asset?.source) return; // 源未就绪：组员态已登记，源到达路径再收敛（防御）
    // 成员收集（升序确定性）：逐块重撒 + 密度过滤（100% 全量），instanceCount/box/
    // maxScale 全集口径刷新
    const parts: { chunk: ChunkState; lod: ChunkLodState; list: readonly ScatterInstance[] }[] = [];
    let total = 0;
    for (const memberKey of this.sortedMemberKeys(bucket)) {
      const chunk = state.chunks.get(memberKey);
      const lod = chunk?.lod.get(bucket.assetId);
      if (!chunk || !lod || lod.mergedBucket !== bucket) {
        bucket.members.delete(memberKey); // 陈旧成员自愈摘除（防御——正常路径经 leaveMergedBucket）
        continue;
      }
      const raw = this.memberInstances(state, chunk, bucket.assetId);
      const list = this.densityThin(raw);
      lod.instanceCount = list.length;
      lod.maxScale = maxScaleOf(raw); // T021.2 代表 scale 全集口径（密度过滤前）
      if (!lod.memberCulled) total += list.length;
      parts.push({ chunk, lod, list });
    }
    if (parts.length === 0) {
      this.teardownMergedBucket(state, bucket); // 全员已退出（culled 不算退出——空组防御）
      return;
    }
    if (!bucket.mesh) {
      bucket.capacity = capacityFor(total);
      const mesh = new THREE.InstancedMesh(
        asset.source.geometry,
        asset.source.material,
        bucket.capacity,
      );
      mesh.name = `merge:${state.id}:${bucket.superKey.i}:${bucket.superKey.j}:${bucket.assetId}:${bucket.level}`;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      // T021.5：depth 三档映射（归源所有只挂引用）；cast/receive 收尾统一落值（OR 语义）
      const mergedDepth = shadowDepthMaterialOf(bucket.level, asset.source);
      if (mergedDepth !== undefined) mesh.customDepthMaterial = mergedDepth;
      this.root.add(mesh); // 直挂 root：three 逐对象包围球自动视锥剔除（合并盒 = 成员实例并集）
      this.meshOwners.set(mesh, state.id); // 拾取反查（命中 → 源 id；culled 成员实例已退出写入不可命中）
      bucket.mesh = mesh;
    } else if (bucket.capacity < total) {
      bucket.capacity = capacityFor(total);
      const attribute = new THREE.InstancedBufferAttribute(
        new Float32Array(bucket.capacity * 16),
        16,
      );
      attribute.setUsage(THREE.DynamicDrawUsage);
      bucket.mesh.instanceMatrix = attribute;
      // instanceColor 由 tint 分支按新容量对齐重建（随后全量重写）
    }
    const mesh = bucket.mesh;
    mesh.count = total;
    const geoExtent = geometryAbsExtentOf(asset.source.geometry);
    const variants = this.getAssetVariants(bucket.assetId);
    const tint = variants && (variants.hueJitter ?? 0) > 0 ? variants : null;
    if (tint && total > 0) this.ensureColorBuffer(mesh, bucket.capacity);
    let offset = 0;
    for (const { chunk, lod, list } of parts) {
      lod.box.makeEmpty();
      lod.mergedOffset = offset; // T021.3：成员写入区起点（fade 区间写出锚）
      this.writeInstanceRange(
        lod.memberCulled ? null : mesh,
        offset,
        list,
        state.baseY,
        geoExtent,
        tint,
        lod,
      );
      // T021.3：成员退场度随重建重写（fade-out 中的成员在全量重写后保持续写值）
      if (!lod.memberCulled && lod.fadeOut !== 0) {
        writeFadeRange(
          mesh,
          asset.source.geometry,
          this.fadeGeometries,
          offset,
          list.length,
          lod.fadeOut,
          bucket.capacity,
        );
      }
      if (!lod.memberCulled) offset += list.length;
      this.refreshChunkBox(chunk, state.baseY);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
    mesh.visible = state.visible && total > 0;
    // T021.5：合并桶阴影策略收尾落值（源隐藏/零实例 visible=false，影 pass 同零提交）：
    // cast = 成员 OR 语义（mergedBucketCasts——midpoint 错开数帧的短暂双投记档 021.8
    // 观察点）；receive 静态按桶表示（整桶零提交 belt-and-braces 一并 false）
    mesh.castShadow = mesh.visible && this.mergedBucketCasts(state, bucket);
    mesh.receiveShadow = shadowPolicyOf(bucket.level).receive && mesh.visible;
  }

  /** 成员块键升序快照（(i,j) 数值序——重建确定性遍历序） */
  private sortedMemberKeys(bucket: MergedBucket): string[] {
    const keys: { i: number; j: number; str: string }[] = [];
    for (const str of bucket.members) {
      const [i, j] = str.split(':');
      keys.push({ i: Number(i), j: Number(j), str });
    }
    keys.sort((a, b) => a.i - b.i || a.j - b.j);
    return keys.map((k) => k.str);
  }

  /** 成员块实例（重撒 + 资产过滤——密度过滤前全集；同 seed 确定性，与自有桶路径同规则） */
  private memberInstances(
    state: SourceState,
    chunk: ChunkState,
    assetId: string,
  ): readonly ScatterInstance[] {
    return scatterChunk(state.params, chunkRectOf(chunk.key, this.chunkSize)).filter(
      (inst) => inst.assetId === assetId,
    );
  }

  /**
   * (块×资产) 自有细块桶网格写入（writeChunkAssetBuckets 的非合并分支；list 为抽稀后
   * 当档集）：源取 (assetId, level)（源就绪是调用前提）；容量不足换缓冲不换对象
   * （mesh 引用稳定——仅同档复用，跨档桶由 rebuildChunkAsset 拆建、绝不复用旧桶 Mesh：
   * D27.4「不做桶内换 Source」），全槽重写矩阵；hueJitter>0 时逐实例 instanceColor
   * （无声明零开销）。实例紧致 AABB 写入 lod.box（T006.4 迁自 MeshEntry——两桶形态
   * 同源）；收尾 computeBoundingSphere 保持 three 逐对象剔除的球有效（沿池先例）。
   */
  private writeChunkAssetMesh(
    chunk: ChunkState,
    assetId: string,
    list: readonly ScatterInstance[],
    baseY: number,
    level: RuntimeRepresentation,
  ): void {
    const asset = this.assetStates.get(assetStateKey(assetId, level));
    if (!asset?.source) return; // 防御：源必已就绪（登记路径不进此处）
    const lod = chunk.lod.get(assetId);
    if (!lod) return;
    const count = list.length;
    let entry = chunk.meshes.get(assetId);
    if (!entry || entry.level !== level) {
      if (entry) {
        // 跨档残桶（防御路径）：先拆旧桶再建新桶——Mesh 与当档 geometry/material 绑定创建
        entry.mesh.removeFromParent();
        entry.mesh.dispose();
        this.meshOwners.delete(entry.mesh);
        chunk.meshes.delete(assetId);
        entry = undefined;
      }
      const capacity = capacityFor(count);
      const mesh = new THREE.InstancedMesh(asset.source.geometry, asset.source.material, capacity);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      // T021.5：阴影策略驱动（cast 初值 = 策略值——refreshShadowCast 每帧按提交态与
      // 阴影表示〔中点切换〕细化；块 visible=false 时影 pass 同零提交〔验收口径〕；
      // depth 三档映射 shadowDepthMaterialOf——归源所有只挂引用）
      const ownPolicy = shadowPolicyOf(level);
      mesh.castShadow = ownPolicy.cast;
      mesh.receiveShadow = ownPolicy.receive;
      const ownDepth = shadowDepthMaterialOf(level, asset.source);
      if (ownDepth !== undefined) mesh.customDepthMaterial = ownDepth;
      chunk.group.add(mesh);
      this.meshOwners.set(mesh, chunk.sourceId); // 拾取反查登记（网格生灭与条目严格成对）
      entry = { mesh, capacity, level };
      chunk.meshes.set(assetId, entry);
    } else if (entry.capacity < count) {
      // 扩容：重建矩阵缓冲（保留同一 mesh 对象，渲染引用稳定——沿池先例）
      entry.capacity = capacityFor(count);
      const attribute = new THREE.InstancedBufferAttribute(
        new Float32Array(entry.capacity * 16),
        16,
      );
      attribute.setUsage(THREE.DynamicDrawUsage);
      entry.mesh.instanceMatrix = attribute;
      // instanceColor 由下方 tint 分支按新容量对齐重建（旧值随后全量重写）
    }
    const mesh = entry.mesh;
    mesh.count = count;
    const geoExtent = geometryAbsExtentOf(asset.source.geometry);
    lod.box.makeEmpty();
    const variants = this.getAssetVariants(assetId);
    const tint = variants && (variants.hueJitter ?? 0) > 0 ? variants : null;
    if (tint && count > 0) this.ensureColorBuffer(mesh, entry.capacity); // 容量对齐（setColorAt 惰性建按旧容量定尺寸的越界坑，同池）
    this.writeInstanceRange(mesh, 0, list, baseY, geoExtent, tint, lod);
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere(); // three 逐对象剔除用（见方法头注记）
  }

  /**
   * 实例区间写入（自有桶 offset=0 / 合并桶逐成员续写共用）：矩阵 = (x, baseY, z) +
   * rotationY + uniform scale；mesh 为 null = 只累积运行态不写矩阵（合并成员 culled
   * 排除——lod.box 按当档集累积）。顺带累积实例紧致世界 AABB（逐轴最大绝对角偏移对
   * 任意 Y 旋转恒为有效包围）。代表 scale（lod.maxScale）不在此累积——T021.2 起按
   * 密度过滤前全集口径由写入路径统一计算（maxScaleOf，选档输入与表示/密度解耦）。
   */
  private writeInstanceRange(
    mesh: THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | null,
    offset: number,
    list: readonly ScatterInstance[],
    baseY: number,
    geoExtent: THREE.Box3,
    tint: ProceduralVariants | null,
    lod: ChunkLodState,
  ): void {
    for (let slot = 0; slot < list.length; slot++) {
      const inst = list[slot]!;
      _euler.set(0, inst.rotationY, 0);
      _quaternion.setFromEuler(_euler);
      _position.set(inst.position.x, baseY, inst.position.y);
      _scale.setScalar(inst.scale);
      if (mesh) mesh.setMatrixAt(offset + slot, _matrix.compose(_position, _quaternion, _scale));
      _chunkBox.min.set(
        _position.x + geoExtent.min.x * inst.scale,
        _position.y + geoExtent.min.y * inst.scale,
        _position.z + geoExtent.min.z * inst.scale,
      );
      _chunkBox.max.set(
        _position.x + geoExtent.max.x * inst.scale,
        _position.y + geoExtent.max.y * inst.scale,
        _position.z + geoExtent.max.z * inst.scale,
      );
      lod.box.union(_chunkBox);
      if (mesh && tint) {
        const { hueOffset } = applyAssetVariants(tint, inst.variantSeed);
        mesh.setColorAt(offset + slot, hueOffsetToMultiplier(hueOffset));
      }
    }
  }

  /** 确保颜色缓冲存在且容量对齐（不足则重建；本路径随后全量重写，旧值无需保留） */
  private ensureColorBuffer(
    mesh: THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>,
    capacity: number,
  ): void {
    const existing = mesh.instanceColor;
    if (existing && existing.count >= capacity) return;
    const next = new THREE.InstancedBufferAttribute(
      new Float32Array(capacity * 3).fill(1),
      3,
    );
    next.setUsage(THREE.DynamicDrawUsage);
    mesh.instanceColor = next;
  }

  /** 块 AABB 初值：块矩形 XZ + 零高 y 带 [baseY,baseY]（网格未建时占位，剔除零误伤） */
  private initChunkBox(chunk: ChunkState, baseY: number): void {
    chunk.box.min.set(chunk.key.i * this.chunkSize, baseY, chunk.key.j * this.chunkSize);
    chunk.box.max.set((chunk.key.i + 1) * this.chunkSize, baseY, (chunk.key.j + 1) * this.chunkSize);
  }

  /** 块 AABB 重算：XZ 块矩形 ∪ 各 (块×资产) 实例紧致 AABB（lod.box——自有/合并两桶
   *  形态同源；identity 变换链 → 实例盒即世界系） */
  private refreshChunkBox(chunk: ChunkState, baseY: number): void {
    this.initChunkBox(chunk, baseY);
    for (const lod of chunk.lod.values()) {
      if (!lod.box.isEmpty()) chunk.box.union(lod.box);
    }
  }

  /** 拆自有桶（实例缓冲释放，共享模板资源不动；无桶幂等 no-op；fade 包装归还池） */
  private disposeOwnMesh(chunk: ChunkState, assetId: string): void {
    const entry = chunk.meshes.get(assetId);
    if (!entry) return;
    const sourceGeometry = this.sourceGeometryOf(assetId, entry.level);
    if (sourceGeometry && entry.mesh.geometry !== sourceGeometry) {
      this.fadeGeometries.release(entry.mesh.geometry); // T021.3：fade 包装归还池
    }
    entry.mesh.removeFromParent();
    entry.mesh.dispose(); // 只释放实例矩阵/颜色缓冲（共享 geometry/material 不动）
    this.meshOwners.delete(entry.mesh);
    chunk.meshes.delete(assetId);
  }

  /** 拆块：移出渲染根并释放全部实例缓冲（共享模板资源不动）；LOD 运行态一并清理
   *  （合并成员先退组——余组重建/空组即拆，见 leaveMergedBucket） */
  private teardownChunk(state: SourceState, chunk: ChunkState): void {
    for (const assetId of [...chunk.lod.keys()]) this.leaveMergedBucket(state, chunk, assetId);
    for (const assetId of [...chunk.incoming.keys()]) {
      this.disposeIncomingBucketEntry(chunk, chunk.incoming.get(assetId)!, assetId); // T021.3 客座
    }
    for (const assetId of [...chunk.meshes.keys()]) {
      this.disposeOwnMesh(chunk, assetId); // 复用释放语义（fade 包装归还池）
    }
    chunk.meshes.clear();
    chunk.pending.clear();
    chunk.lod.clear();
    chunk.group.removeFromParent();
  }

  /** 拆源：整片块回收 + 合并桶全拆（幂等）。先断开全部合并成员引用再拆桶——拆源路径
   *  无「余组」语义（组随源整体消亡），避免逐块退组触发 N 次余组重建（纯浪费）。 */
  private teardownSource(id: string): void {
    const state = this.sources.get(id);
    if (!state) return;
    for (const chunk of state.chunks.values()) {
      for (const lod of chunk.lod.values()) lod.mergedBucket = undefined;
    }
    for (const bucket of [...state.merged.values()]) this.teardownMergedBucket(state, bucket);
    state.merged.clear();
    for (const chunk of [...state.chunks.values()]) this.teardownChunk(state, chunk);
    state.chunks.clear();
    this.sources.delete(id);
  }
}
