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
 *  - LOD 分档 / 拾取映射 / 样式序列化明确不做（T006 / 003.3）。
 */
import type { ProceduralVariants } from '../../domain/assets';
import { applyAssetVariants } from '../../domain/assets';
import type { ScatterChunk, ScatterInstance, ScatterParams } from '../../domain/scatter';
import { scatterChunk, scatterInfluenceRadius } from '../../domain/scatter';
import type { InstanceSource } from '../instancing/InstancedAssetPool';
import { hueOffsetToMultiplier } from '../instancing/instanceTint';
import type { Vec2 } from '../../core/types';
import * as THREE from 'three';

/** 块索引（整数格；世界块矩形 = [i·S,(i+1)·S) × [j·S,(j+1)·S)，S = chunkSizeM） */
export interface ScatterChunkKey {
  i: number;
  j: number;
}

/** 依赖注入窄接口（仿 AssetSourceRouter：Renderer 注入真实路由，测试注 fake 工厂） */
export interface ScatterChunkManagerOptions {
  /** assetId → 实例化源（与 InstancedAssetPool 同源；几何/材质共享，本管绝不 dispose） */
  provideSource: (assetId: string) => Promise<InstanceSource>;
  /** assetId → 程序化 meta 的变体声明（hueJitter>0 时逐实例色相微差；缺省无色） */
  getAssetVariants?: (assetId: string) => ProceduralVariants | undefined;
  /** 块边长（米，>0；缺省 32。T006 LOD 分档要调） */
  chunkSizeM?: number;
}

/** 默认块边长（米）：D9 承重墙的初始裁定值 */
export const CHUNK_SIZE_M = 32;

/** (块×资产) 网格运行态（容量翻倍扩容、缩容保留、mesh 对象引用稳定——仿池） */
interface MeshEntry {
  readonly mesh: THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
  capacity: number;
  /** 网格全部实例的紧致世界 AABB（块剔除盒的组成部分；写槽位时顺带累积） */
  readonly box: THREE.Box3;
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

/** 管理器级源缓存（跨源共享同 assetId 源；同资产只加载一次，失败告警一次不重试——仿池） */
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

function chunkKeyString(key: ScatterChunkKey): string {
  return `${key.i}:${key.j}`;
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

export class ScatterChunkManager {
  /** 渲染根（Renderer 挂 scene——contentGroup 兄弟；子树 = 块 Group × (源×块)） */
  readonly root = new THREE.Group();

  private readonly sources = new Map<string, SourceState>();
  private readonly assetStates = new Map<string, AssetSourceState>();
  /** 实例网格 → 所属源 id（拾取反查，D18.7；网格 dispose 时同步摘除，与源共生命周期） */
  private readonly meshOwners = new Map<THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>, string>();
  private readonly provideSource: (assetId: string) => Promise<InstanceSource>;
  private readonly getAssetVariants: (assetId: string) => ProceduralVariants | undefined;
  private readonly chunkSize: number;
  private disposed = false;

  constructor(options: ScatterChunkManagerOptions) {
    this.provideSource = options.provideSource;
    this.getAssetVariants = options.getAssetVariants ?? (() => undefined);
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
   * 非散布网格 / 块组不可见 → null。可见性守卫是必须的显式挡板——three r186 的
   * Raycaster 不跳过 visible=false 子树（只测 layers），源隐藏与视锥剔除的块都
   * 会被射线命中；以块 Group visible（源显隐与帧剔除共同写手）为「所见即所得」
   * 判据。instanceId 本层用不上（整源选中语义，无逐实例操作）。
   */
  resolvePick(hit: THREE.Intersection): string | null {
    const object = hit.object as THREE.InstancedMesh | null;
    if (!object || !object.isInstancedMesh) return null;
    const owner = this.meshOwners.get(object);
    if (owner === undefined) return null;
    if (!(object.parent?.visible ?? true)) return null;
    return owner;
  }

  // ── 帧路径（Renderer.renderFrame 在 controls.update 后调用）──

  /**
   * 逐块视锥剔除：Frustum = projectionMatrix × matrixWorldInverse 逐块 Box3 判交 →
   * 块 Group visible 开关（three 对 visible=false 整子树零提交——主渲染与阴影 pass
   * 同口径）。无源 O(1) 早退；相机矩阵自更新（render 前调用的时序自主，不依赖上一帧
   * 残留）。RenderModeState 分遍改 camera.layers.mask 不影响本路径（visible 与层正交）。
   */
  frame(camera: THREE.Camera): void {
    if (this.disposed || this.sources.size === 0) return;
    camera.updateMatrixWorld();
    _viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    _frustum.setFromProjectionMatrix(_viewProjection);
    for (const state of this.sources.values()) {
      // 源级显隐与视锥剔除合成一个开关（隐藏源重建/扩块时也保持 false，不闪现）
      for (const chunk of state.chunks.values()) {
        chunk.group.visible = state.visible && _frustum.intersectsBox(chunk.box);
      }
    }
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

    for (const [assetId, list] of byAsset) {
      const asset = this.assetStates.get(assetId) ?? this.requestAsset(assetId);
      if (asset.source) this.writeChunkAssetMesh(chunk, assetId, list, state.baseY);
      else chunk.pending.set(assetId, list); // 未就绪/失败均登记（失败渲染不可能，数据不崩不弃）
    }

    if (chunk.meshes.size === 0 && chunk.pending.size === 0) {
      this.teardownChunk(chunk); // 块整空（多边形缩走）：块 Group 回收
      state.chunks.delete(keyStr);
      return;
    }
    this.refreshChunkBox(chunk, state.baseY);
  }

  /** 取或发起源加载（同 assetId 管理器内只一次；失败告警一次不重试——仿池） */
  private requestAsset(assetId: string): AssetSourceState {
    const existing = this.assetStates.get(assetId);
    if (existing) return existing;
    const asset: AssetSourceState = { source: null, failed: false };
    this.assetStates.set(assetId, asset);
    this.provideSource(assetId)
      .then((source) => {
        asset.source = source;
        if (this.disposed) return; // dispose 后迟到的源：只记录不建网格
        this.buildPendingMeshes(assetId);
      })
      .catch((err: unknown) => {
        if (!asset.failed) {
          asset.failed = true;
          console.warn('[ScatterChunkManager] 散布资产源加载失败，实例不渲染', assetId, err);
        }
      });
    return asset;
  }

  /** 源就绪：为全部块的该资产登记数据补建网格（仿池「源到达后一次性建网格」） */
  private buildPendingMeshes(assetId: string): void {
    const asset = this.assetStates.get(assetId);
    if (!asset?.source) return;
    for (const state of this.sources.values()) {
      for (const chunk of state.chunks.values()) {
        const list = chunk.pending.get(assetId);
        if (!list) continue;
        chunk.pending.delete(assetId);
        this.writeChunkAssetMesh(chunk, assetId, list, state.baseY);
        this.refreshChunkBox(chunk, state.baseY);
      }
    }
  }

  /**
   * (块×资产) 网格写入：容量不足换缓冲不换对象（mesh 引用稳定），全槽重写矩阵；
   * 资产声明 hueJitter>0 时逐实例 instanceColor（变体只吃色相——scale/rotation 已由
   * 撒点参数管辖，不二次掷骰）；无声明零开销（不建颜色缓冲，GLB 资产行为零变化）。
   * 顺带累积实例紧致世界 AABB（逐轴最大绝对角偏移对任意 Y 旋转恒为有效包围）——
   * 块剔除盒用它而非 boundingSphere.getBoundingBox（球的包围盒按对角线膨胀 ~√2，
   * 32m 块会胖出 ~12m，边缘块误可见；此路径 O(n) 已在写槽循环内，零额外遍历）。
   * 收尾 computeBoundingSphere 保持 three 逐对象剔除的球有效（扩容换缓冲后陈旧球
   * 会被渲染器误剔除——沿池 writeAllSlots 先例）。
   */
  private writeChunkAssetMesh(
    chunk: ChunkState,
    assetId: string,
    list: readonly ScatterInstance[],
    baseY: number,
  ): void {
    const asset = this.assetStates.get(assetId);
    if (!asset?.source) return; // 防御：源必已就绪（登记路径不进此处）
    const count = list.length;
    let entry = chunk.meshes.get(assetId);
    if (!entry) {
      const capacity = capacityFor(count);
      const mesh = new THREE.InstancedMesh(asset.source.geometry, asset.source.material, capacity);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.castShadow = true; // 块 visible=false 时阴影 pass 同零提交（验收口径）
      chunk.group.add(mesh);
      this.meshOwners.set(mesh, chunk.sourceId); // 拾取反查登记（网格生灭与条目严格成对）
      entry = { mesh, capacity, box: new THREE.Box3() };
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

  /** 拆块：移出渲染根并释放全部实例缓冲（共享模板资源不动） */
  private teardownChunk(chunk: ChunkState): void {
    for (const entry of chunk.meshes.values()) {
      entry.mesh.removeFromParent();
      entry.mesh.dispose();
      this.meshOwners.delete(entry.mesh);
    }
    chunk.meshes.clear();
    chunk.pending.clear();
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
