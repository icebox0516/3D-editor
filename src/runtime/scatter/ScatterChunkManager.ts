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
 *  - 选档 = 块粒度（§4.3 候选保守策略）：代表点 = 块 AABB 最近点（box.clampPoint）、
 *    代表 scale = 块内实例 max（保守偏高档）、半径 = 当档源几何包围球；统一走 006.1
 *    评估器（domain 纯函数，不复制选档逻辑），LodSubject 在本管组装（评估器不感知 chunk）。
 *  - 帧内时序（D27.6）：frame(camera, lodEnabled) 在块视锥剔除之后逐 (块×资产) 评估——
 *    档位每帧派生态，不进 Scene / Command / 持久状态；迟滞参考 current 由本管持有
 *    （ChunkLodState.current，逐帧传入评估器）。
 *  - 换档重建时机：目标档源就绪即重建（首建冷源经微任务到达后回调重建，旧档持续
 *    渲染到新档就绪——换档点无 pop）；'culled'（超远）= 调度结果：网格 visible=false，
 *    桶保留（回视即时恢复）。LOD 总开关（Renderer 持有、逐帧传入）：off = 恒 High +
 *    culled 旁路（评估器语义）——非 high 桶全部确定性重建回 high。
 */
import type { ProceduralVariants } from '../../domain/assets';
import { applyAssetVariants } from '../../domain/assets';
import type { ProceduralLevel } from '../../domain/assets';
import type { LodRepresentation } from '../../domain/lod/lodEvaluation';
import { evaluateLodRepresentation } from '../../domain/lod/lodEvaluation';
import type { ScatterChunk, ScatterInstance, ScatterParams } from '../../domain/scatter';
import { scatterChunk, scatterInfluenceRadius } from '../../domain/scatter';
import type { InstanceSource } from '../instancing/InstancedAssetPool';
import { hueOffsetToMultiplier } from '../instancing/instanceTint';
import { lodViewOfCamera } from '../instancing/lodView';
import type { Vec2 } from '../../core/types';
import * as THREE from 'three';

/** 块索引（整数格；世界块矩形 = [i·S,(i+1)·S) × [j·S,(j+1)·S)，S = chunkSizeM） */
export interface ScatterChunkKey {
  i: number;
  j: number;
}

/** 依赖注入窄接口（仿 AssetSourceRouter：Renderer 注入真实路由，测试注 fake 工厂） */
export interface ScatterChunkManagerOptions {
  /** assetId + 档位 → 实例化源（与 InstancedAssetPool 同源路由；level 为档位维度，
   *  缺省 'high'——无档资产的源路由行为与现状逐位一致；几何/材质共享，本管绝不 dispose） */
  provideSource: (assetId: string, level?: ProceduralLevel) => Promise<InstanceSource>;
  /** assetId → 程序化 meta 的变体声明（hueJitter>0 时逐实例色相微差；缺省无色） */
  getAssetVariants?: (assetId: string) => ProceduralVariants | undefined;
  /**
   * assetId → 已声明档位列表（T006.3 选档输入，levels meta 的 id 集）；缺省/空 =
   * 单档语义（评估器按 ['high'] 处理）。Renderer 注入注册表查询；每资产缓存一次。
   */
  getAssetLevels?: (assetId: string) => ProceduralLevel[] | undefined;
  /** 块边长（米，>0；缺省 32。T006 LOD 分档要调） */
  chunkSizeM?: number;
}

/** 默认块边长（米）：D9 承重墙的初始裁定值 */
export const CHUNK_SIZE_M = 32;

/** (块×资产) 网格运行态（容量翻倍扩容、缩容保留、mesh 对象引用稳定——仿池）。
 *  T006.3：entry 即「当档桶」——level 为桶维度（换档 = 拆旧桶建新桶，Mesh 对象与
 *  geometry/material 绑定创建，不做桶内换 Source）。 */
interface MeshEntry {
  readonly mesh: THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
  capacity: number;
  /** 桶档位（创建时绑定；与 chunk.lod 的目标档比对判定换档） */
  readonly level: ProceduralLevel;
  /** 网格全部实例的紧致世界 AABB（块剔除盒的组成部分；写槽位时顺带累积） */
  readonly box: THREE.Box3;
}

/**
 * (块×资产) 的 LOD 运行态（T006.3）：每帧派生评估的全部帧间状态都在此——
 * current = 迟滞参考（本管持有、逐帧传入评估器）；level = 当前期望桶档（源就绪的
 * 已渲染档；culled 期间保持最后档）；maxScale = 块内实例 max scale（§4.3 保守偏高档，
 * 重撒时更新）；pending = 在途换档目标（源未就绪时登记，到达回调重建）。
 */
interface ChunkLodState {
  current: LodRepresentation | undefined;
  level: ProceduralLevel;
  maxScale: number;
  pending?: ProceduralLevel;
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
  /** assetId → 实例数据（源未就绪/失败时登记；源到达后建网格） */
  readonly pending: Map<string, ScatterInstance[]>;
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
  /** `${i}:${j}` → 块（覆盖块内含实例的块；空块即回收不入表） */
  readonly chunks: Map<string, ChunkState>;
}

/** 管理器级源缓存（跨源共享同 (assetId × level) 源；同桶只加载一次，失败告警一次
 *  不重试——仿池。T006.3 起按档分桶：键 = `${assetId}::${level}`，radius 为源几何
 *  包围球半径的惰性缓存（选档输入；档间轮廓连续不变量下各档近似同值）） */
interface AssetSourceState {
  source: InstanceSource | null;
  failed: boolean;
  /** 源几何包围球半径（到达时算定；未就绪 = 0——评估路径以其 >0 为就绪判据） */
  radius: number;
}

/** 初始容量与扩容策略（翻倍；避免逐块抖动重撒时逐实例扩容） */
const MIN_CAPACITY = 4;
function capacityFor(count: number): number {
  let capacity = MIN_CAPACITY;
  while (capacity < count) capacity *= 2;
  return capacity;
}

function chunkKeyString(key: ScatterChunkKey): string {
  return `${key.i}:${key.j}`;
}

/** (assetId × level) 源缓存键（档位维度后缀——与池桶/ProceduralSourceCache 同构口径） */
function assetStateKey(assetId: string, level: ProceduralLevel): string {
  return `${assetId}::${level}`;
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
const _meshBox = new THREE.Box3();
const _chunkBox = new THREE.Box3();
const _viewProjection = new THREE.Matrix4();
const _frustum = new THREE.Frustum();
/** LOD 代表点暂存（块 AABB 最近点 = clampPoint(相机位)；值即时拷入纯数据入参） */
const _nearestPoint = new THREE.Vector3();

export class ScatterChunkManager {
  /** 渲染根（Renderer 挂 scene——contentGroup 兄弟；子树 = 块 Group × (源×块)） */
  readonly root = new THREE.Group();

  private readonly sources = new Map<string, SourceState>();
  private readonly assetStates = new Map<string, AssetSourceState>();
  /** 实例网格 → 所属源 id（拾取反查，D18.7；网格 dispose 时同步摘除，与源共生命周期） */
  private readonly meshOwners = new Map<THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>, string>();
  private readonly provideSource: (assetId: string, level?: ProceduralLevel) => Promise<InstanceSource>;
  private readonly getAssetVariants: (assetId: string) => ProceduralVariants | undefined;
  private readonly getAssetLevels: (assetId: string) => ProceduralLevel[] | undefined;
  private readonly declaredLevelsCache = new Map<string, ProceduralLevel[]>();
  private readonly chunkSize: number;
  private disposed = false;

  constructor(options: ScatterChunkManagerOptions) {
    this.provideSource = options.provideSource;
    this.getAssetVariants = options.getAssetVariants ?? (() => undefined);
    this.getAssetLevels = options.getAssetLevels ?? (() => undefined);
    this.chunkSize = options.chunkSizeM && options.chunkSizeM > 0 ? options.chunkSizeM : CHUNK_SIZE_M;
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
    const state: SourceState = { id, params, baseY, visible: inheritVisible, chunks: new Map() };
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
   *    的既有行为）时逐 (块×资产) 走 006.1 评估器——subject = { 块 AABB 最近点,
   *    当档源几何包围球半径, 块内 max scale }（§4.3 候选保守策略），迟滞参考 current
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
          const asset = this.assetStates.get(assetStateKey(assetId, lod.level));
          if (!asset || asset.radius <= 0 || lod.maxScale <= 0) continue; // 源未就绪/零尺度：评估缺输入，跳过
          const target = evaluateLodRepresentation({
            view,
            subject: {
              point: { x: _nearestPoint.x, y: _nearestPoint.y, z: _nearestPoint.z },
              radius: asset.radius,
              scale: lod.maxScale,
            },
            declaredLevels: this.declaredLevelsOf(assetId),
            current: lod.current,
            lodEnabled,
          });
          lod.current = target;
          const entry = chunk.meshes.get(assetId);
          if (target === 'culled') {
            if (entry) entry.mesh.visible = false;
            lod.pending = undefined;
            continue;
          }
          if (entry) entry.mesh.visible = true;
          if (target === lod.level) {
            if (lod.pending !== undefined) lod.pending = undefined;
            continue;
          }
          if (lod.pending === target) continue; // 重建在途（冷源），不重复登记
          this.scheduleChunkAssetRelevel(state, chunk, assetId, target);
        }
      }
    }
  }

  /** 资产声明档位（缓存首次查询；空数组 = 单档语义，评估器自处理） */
  private declaredLevelsOf(assetId: string): ProceduralLevel[] {
    const cached = this.declaredLevelsCache.get(assetId);
    if (cached) return cached;
    const declared = this.getAssetLevels(assetId) ?? [];
    this.declaredLevelsCache.set(assetId, declared);
    return declared;
  }

  /** 运行态快照（DEV 冒烟 stats：drawCalls/triangles 由 Renderer.getViewportStats 补齐） */
  getStats(): { totalChunks: number; visibleChunks: number; instances: number } {
    let totalChunks = 0;
    let visibleChunks = 0;
    let instances = 0;
    for (const state of this.sources.values()) {
      for (const chunk of state.chunks.values()) {
        totalChunks += 1;
        if (chunk.group.visible) visibleChunks += 1;
        for (const entry of chunk.meshes.values()) instances += entry.mesh.count;
      }
    }
    return { totalChunks, visibleChunks, instances };
  }

  /** 停止一切并整片回收（Renderer.dispose 在源释放之前调用；幂等） */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const id of [...this.sources.keys()]) this.teardownSource(id);
    this.assetStates.clear(); // 只清缓存条目（源端资源归 loader/缓存统一释放）
    this.meshOwners.clear();
    this.root.removeFromParent();
  }

  // ── 内部：块计算与网格维护 ───────────────────────────────

  /**
   * (块×资产) 换档重建调度（T006.3）：登记在途目标档 → 目标档源就绪即同步重建；
   * 冷源（首次加载）经微任务到达后由 applyPendingLevelRebuilds 回调重建——期间旧档
   * 桶持续渲染，换档点无 pop。重复调度同一目标幂等跳过（frame 路径已过滤）。
   */
  private scheduleChunkAssetRelevel(
    state: SourceState,
    chunk: ChunkState,
    assetId: string,
    level: ProceduralLevel,
  ): void {
    const lod = chunk.lod.get(assetId);
    if (!lod || lod.pending === level) return;
    lod.pending = level;
    const asset = this.requestAsset(assetId, level);
    if (asset.source) this.rebuildChunkAsset(state, chunk, assetId, level);
  }

  /**
   * 换档重建执行：确定性重撒（同 seed 同结果——scatterChunk 纯函数，实例集合与旧档
   * 逐位一致）→ 拆旧档桶（实例缓冲释放，共享模板资源不动）→ 以目标档 InstanceSource
   * 成套建新桶（geometry/material 与档绑定创建——D27.4「不做桶内换 Source」）。
   * 同步完成拆旧建新（单 JS 块内无渲染观测点——无缺帧闪烁）。目标档实例为零（参数
   * 在途变更的防御路径）→ 摘桶按空资产语义回收。
   */
  private rebuildChunkAsset(
    state: SourceState,
    chunk: ChunkState,
    assetId: string,
    level: ProceduralLevel,
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
    const old = chunk.meshes.get(assetId);
    if (old) {
      old.mesh.removeFromParent();
      old.mesh.dispose(); // 只释放实例矩阵/颜色缓冲（共享 geometry/material 不动）
      this.meshOwners.delete(old.mesh);
      chunk.meshes.delete(assetId);
    }
    if (instances.length === 0) {
      chunk.lod.delete(assetId);
      if (chunk.meshes.size === 0 && chunk.pending.size === 0) {
        this.teardownChunk(chunk);
        state.chunks.delete(chunkKeyString(chunk.key));
      }
      return;
    }
    this.writeChunkAssetMesh(chunk, assetId, instances, state.baseY, level);
    this.refreshChunkBox(chunk, state.baseY);
  }

  /**
   * 冷源到达后的在途换档收敛：全部源 × 块中 lod.pending 指向 (assetId, level) 的
   * (块×资产) 逐个确定性重建（块/源可能已在等待期间被拆——按 Map 现存态自然跳过）。
   */
  private applyPendingLevelRebuilds(assetId: string, level: ProceduralLevel): void {
    for (const state of this.sources.values()) {
      for (const chunk of state.chunks.values()) {
        const lod = chunk.lod.get(assetId);
        if (lod?.pending === level) this.rebuildChunkAsset(state, chunk, assetId, level);
      }
    }
  }

  /** 单块重撒：scatterChunk → 按 assetId 分组 → 网格写入 / 未就绪登记 / 空块回收 */
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
        pending: new Map(),
        lod: new Map(),
      };
      chunk.group.name = `chunk:${key.i}:${key.j}`;
      chunk.group.visible = state.visible; // 隐藏源局部重算扩出的新块不闪现（frame 随后接管）
      this.initChunkBox(chunk, state.baseY);
      this.root.add(chunk.group);
      state.chunks.set(keyStr, chunk);
    }

    // 资产退出本块：合批网格释放（实例归零即拆，容量不保留——块空回收语义）
    for (const assetId of [...chunk.meshes.keys()]) {
      if (byAsset.has(assetId)) continue;
      const entry = chunk.meshes.get(assetId)!;
      entry.mesh.removeFromParent();
      entry.mesh.dispose(); // 只释放实例矩阵/颜色缓冲（共享 geometry/material 不动）
      this.meshOwners.delete(entry.mesh); // 拾取反查表同步摘除（网格已不可命中）
      chunk.meshes.delete(assetId);
    }
    for (const assetId of [...chunk.pending.keys()]) {
      if (!byAsset.has(assetId)) chunk.pending.delete(assetId);
    }
    for (const assetId of [...chunk.lod.keys()]) {
      if (!byAsset.has(assetId)) chunk.lod.delete(assetId); // LOD 运行态随资产进出块成对清理
    }

    for (const [assetId, list] of byAsset) {
      // 新资产初始 'high'（attach 时无相机评估，首帧 frame 评估即校正；迟滞无参考
      // 按名义档起步——无残留状态）；既有资产保持当期期望档（局部重算不改档位状态）
      const lod =
        chunk.lod.get(assetId) ?? { current: undefined, level: 'high' as const, maxScale: 1 };
      chunk.lod.set(assetId, lod);
      const asset = this.requestAsset(assetId, lod.level);
      if (asset.source) this.writeChunkAssetMesh(chunk, assetId, list, state.baseY, lod.level);
      else chunk.pending.set(assetId, list); // 未就绪/失败均登记（失败渲染不可能，数据不崩不弃）
    }

    if (chunk.meshes.size === 0 && chunk.pending.size === 0) {
      this.teardownChunk(chunk); // 块整空（多边形缩走）：块 Group 回收
      state.chunks.delete(keyStr);
      return;
    }
    this.refreshChunkBox(chunk, state.baseY);
  }

  /** 取或发起源加载（同 (assetId × level) 管理器内只一次；失败告警一次不重试——仿池） */
  private requestAsset(assetId: string, level: ProceduralLevel): AssetSourceState {
    const key = assetStateKey(assetId, level);
    const existing = this.assetStates.get(key);
    if (existing) return existing;
    const asset: AssetSourceState = { source: null, failed: false, radius: 0 };
    this.assetStates.set(key, asset);
    this.provideSource(assetId, level)
      .then((source) => {
        asset.source = source;
        if (!source.geometry.boundingSphere) source.geometry.computeBoundingSphere();
        asset.radius = source.geometry.boundingSphere?.radius ?? 0;
        if (this.disposed) return; // dispose 后迟到的源：只记录不建网格
        this.buildPendingMeshes(assetId, level);
        this.applyPendingLevelRebuilds(assetId, level);
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
   * 换档在途不走 pending 路径），到达的正是该档源时才建。
   */
  private buildPendingMeshes(assetId: string, level: ProceduralLevel): void {
    const asset = this.assetStates.get(assetStateKey(assetId, level));
    if (!asset?.source) return;
    for (const state of this.sources.values()) {
      for (const chunk of state.chunks.values()) {
        const list = chunk.pending.get(assetId);
        if (!list) continue;
        const lod = chunk.lod.get(assetId);
        if (!lod || lod.level !== level) continue; // 期望档已变：本档源到达不建（换档路径接管）
        chunk.pending.delete(assetId);
        this.writeChunkAssetMesh(chunk, assetId, list, state.baseY, level);
        this.refreshChunkBox(chunk, state.baseY);
      }
    }
  }

  /**
   * (块×资产) 当档桶网格写入：源取 (assetId, level)（当期期望档——源就绪是调用前提，
   * 未就绪走 pending 登记）；容量不足换缓冲不换对象（mesh 引用稳定——仅同档复用，
   * 跨档桶由 rebuildChunkAsset 拆建、绝不复用旧桶 Mesh：D27.4「不做桶内换 Source」），
   * 全槽重写矩阵；资产声明 hueJitter>0 时逐实例 instanceColor（变体只吃色相——
   * scale/rotation 已由撒点参数管辖，不二次掷骰）；无声明零开销（不建颜色缓冲，
   * GLB 资产行为零变化）。顺带累积实例紧致世界 AABB（逐轴最大绝对角偏移对任意 Y
   * 旋转恒为有效包围）与块内 max scale（T006.3 选档代表 scale，§4.3）。
   * 收尾 computeBoundingSphere 保持 three 逐对象剔除的球有效（扩容换缓冲后陈旧球
   * 会被渲染器误剔除——沿池 writeAllSlots 先例）。
   */
  private writeChunkAssetMesh(
    chunk: ChunkState,
    assetId: string,
    list: readonly ScatterInstance[],
    baseY: number,
    level: ProceduralLevel,
  ): void {
    const asset = this.assetStates.get(assetStateKey(assetId, level));
    if (!asset?.source) return; // 防御：源必已就绪（登记路径不进此处）
    const lod = chunk.lod.get(assetId);
    if (lod) lod.maxScale = 1; // 重撒后随写槽循环重累积
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
      mesh.castShadow = true; // 块 visible=false 时阴影 pass 同零提交（验收口径）
      chunk.group.add(mesh);
      this.meshOwners.set(mesh, chunk.sourceId); // 拾取反查登记（网格生灭与条目严格成对）
      entry = { mesh, capacity, level, box: new THREE.Box3() };
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
    // 几何逐轴最大绝对角偏移（Y 旋转只会重排角点，分量最大恒有效）。
    // boundingBox 惰性：程序化 build / GLB 抽取均不算——首次触碰补算一次（缓存共享
    // 模板上，池与本管同源受益），绝无 null 分支的 ±0.5 占位（占位盒 Y 向失真 →
    // 剔除盒过瘦 → 高资产块被过早剔出视锥）
    const geometry = asset.source.geometry;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const geoBox = geometry.boundingBox!;
    _meshBox.min.set(
      -Math.max(Math.abs(geoBox.min.x), Math.abs(geoBox.max.x)),
      -Math.max(Math.abs(geoBox.min.y), Math.abs(geoBox.max.y)),
      -Math.max(Math.abs(geoBox.min.z), Math.abs(geoBox.max.z)),
    );
    _meshBox.max.set(-_meshBox.min.x, -_meshBox.min.y, -_meshBox.min.z);
    entry.box.makeEmpty();
    const variants = this.getAssetVariants(assetId);
    const tint = variants && (variants.hueJitter ?? 0) > 0 ? variants : null;
    if (tint) this.ensureColorBuffer(mesh, entry.capacity); // 容量对齐（setColorAt 惰性建按旧容量定尺寸的越界坑，同池）
    for (let slot = 0; slot < count; slot++) {
      const inst = list[slot]!;
      if (lod && inst.scale > lod.maxScale) lod.maxScale = inst.scale; // §4.3 代表 scale = 块内 max
      _euler.set(0, inst.rotationY, 0);
      _quaternion.setFromEuler(_euler);
      _position.set(inst.position.x, baseY, inst.position.y);
      _scale.setScalar(inst.scale);
      mesh.setMatrixAt(slot, _matrix.compose(_position, _quaternion, _scale));
      _chunkBox.min.set(
        _position.x + _meshBox.min.x * inst.scale,
        _position.y + _meshBox.min.y * inst.scale,
        _position.z + _meshBox.min.z * inst.scale,
      );
      _chunkBox.max.set(
        _position.x + _meshBox.max.x * inst.scale,
        _position.y + _meshBox.max.y * inst.scale,
        _position.z + _meshBox.max.z * inst.scale,
      );
      entry.box.union(_chunkBox);
      if (tint) {
        const { hueOffset } = applyAssetVariants(tint, inst.variantSeed);
        mesh.setColorAt(slot, hueOffsetToMultiplier(hueOffset));
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere(); // three 逐对象剔除用（见方法头注记）
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

  /** 块 AABB 重算：XZ 块矩形 ∪ 各网格实例紧致 AABB（identity 变换链 → 网格盒即世界系） */
  private refreshChunkBox(chunk: ChunkState, baseY: number): void {
    this.initChunkBox(chunk, baseY);
    for (const entry of chunk.meshes.values()) {
      if (!entry.box.isEmpty()) chunk.box.union(entry.box);
    }
  }

  /** 拆块：移出渲染根并释放全部实例缓冲（共享模板资源不动）；LOD 运行态一并清理 */
  private teardownChunk(chunk: ChunkState): void {
    for (const entry of chunk.meshes.values()) {
      entry.mesh.removeFromParent();
      entry.mesh.dispose();
      this.meshOwners.delete(entry.mesh);
    }
    chunk.meshes.clear();
    chunk.pending.clear();
    chunk.lod.clear();
    chunk.group.removeFromParent();
  }

  /** 拆源：整片块回收（幂等） */
  private teardownSource(id: string): void {
    const state = this.sources.get(id);
    if (!state) return;
    for (const chunk of [...state.chunks.values()]) this.teardownChunk(chunk);
    state.chunks.clear();
    this.sources.delete(id);
  }
}
