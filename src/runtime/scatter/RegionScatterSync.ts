/**
 * runtime/scatter/RegionScatterSync —— region ↔ ScatterChunkManager 绑定（T003.3，D4/D5/D18）。
 *
 * 职责：把「区域样式携带散布配方」接到 003.2 分块实例化管线——由 Renderer 的
 *      attach / update / detach / resyncAll / onLayerUpdated 钩子顺带喂入（散布是横切
 *      关注点：不另起第二个 SceneSync、不改 RegionRenderer——事件翻译仍归 SceneSync
 *      单一职责，本类只做 region → 散布源的增量路由）。
 * 路由（D18）：
 *  - presetId / 配方变：新 preset 无 scatter 段 → removeSource（「换入即散、换出即清」，
 *    D4 换装语义）；有 → 此前无源走 setSource 全量、有源走下方局部路径（由生效参数
 *    比对自然分派——同 id 配方内容变化也覆盖在内）；
 *  - 同 preset 的 overrides / seed 变、shape.points 变（顶点编辑）→
 *    computeAffectedChunks(old, new) + recomputeChunks（参数完全相等时返回 []，天然 no-op）；
 *  - baseHeight / transform.position.y 变 → setSource 换 baseY（Y 属矩阵值，全部块的
 *    矩阵都要动，按受影响块列表的局部重算覆盖不了）；
 *  - 对象 / 图层显隐变 → setSourceVisible（源级显隐，喂 Renderer.effectiveVisible
 *    的「对象 visible ∧ 图层 visible」合成结果）。
 * 从宽策略：region 任何 update 都重算生效参数 + baseY + 可见性，幂等短路保证零误伤
 *      ——比精抠 keys 键集稳健（顶点拖拽高频发 'shape'，键集分派反而易漏）。
 * 坐标语义：shape.points 为区域局部 XZ 点列，撒点管线吃世界坐标——世界多边形 =
 *      shape.points 逐点叠加 transform.position（XZ），与区域表面同口径（GeometryBuilder
 *      以局部点列拍几何、wrapper 根挂 position——gizmo 平移时表面与散布一起动）；Y 由
 *      baseY 合成（baseHeight + position.y，分域契约 §A），scale/rotation 不参与
 *      （v1 常量基面，沿既有注释语义）。
 * 边界：只读 Scene（SceneManager 按取对象，反向修改禁止）；记录持参数快照（多边形
 *      深拷——比对基准不被后续变异污染；世界多边形为本类新建数组，绝不回写场景点列）；散布实例不进对象表/撤销栈/
 *      大纲（D5）。meta 查询走 runtime/styles/routes 的 getRouteMeta（与 build 路由
 *      同源：无构建路由的预设表面已降级，散布不半应用；bootstrap 注册表经
 *      collectPresetPluginMetas 同源收割，零分叉）。
 */
import type { ID } from '../../core/types';
import type { RegionObject } from '../../domain/regions';
import { isRegionObject } from '../../domain/regions';
import { composeScatterParams, resolveScatterSeed } from '../../domain/scatter';
import type { ScatterParams } from '../../domain/scatter';
import type { SceneObject } from '../../scene/SceneObject';
import type { SceneManager } from '../../scene/SceneManager';
import { getRouteMeta } from '../styles/routes';
import { ScatterChunkManager, computeAffectedChunks } from './ScatterChunkManager';

/** 组装依赖（Renderer 构造注入；测试注 fake manager / fake 可见性谓词） */
export interface RegionScatterSyncOptions {
  /** 分块实例化管线（Renderer 会话私有实例；本类不持有其生命周期） */
  manager: ScatterChunkManager;
  /** 场景数据只读源（update / resyncAll 按取对象） */
  sceneManager: SceneManager;
  /** 对象有效可见性（对象 visible ∧ 图层 visible；Renderer 注入复用同一实现，单一真相源） */
  effectiveVisible: (obj: SceneObject) => boolean;
}

/** 每 region 的上次生效状态（增量路由的比对基准） */
interface SyncRecord {
  /** 上次生效撒点输入（多边形深拷快照——见 snapshotParams） */
  params: ScatterParams;
  /** 上次生效世界基面 y（shape.baseHeight + transform.position.y） */
  baseY: number;
}

/** 参数快照：多边形逐点深拷，其余浅拷（撒点输出只依赖这些值字段） */
function snapshotParams(params: ScatterParams): ScatterParams {
  return { ...params, polygon: params.polygon.map((p) => ({ x: p.x, y: p.y })) };
}

export class RegionScatterSync {
  private readonly manager: ScatterChunkManager;
  private readonly sceneManager: SceneManager;
  private readonly effectiveVisible: (obj: SceneObject) => boolean;
  private readonly records = new Map<ID, SyncRecord>();
  private disposed = false;

  constructor(options: RegionScatterSyncOptions) {
    this.manager = options.manager;
    this.sceneManager = options.sceneManager;
    this.effectiveVisible = options.effectiveVisible;
  }

  // ── Renderer 钩子入口（事件由 SceneSync 翻译，Renderer 顺带喂入）────────

  /** 对象挂载：region → 建立散布源（幂等——已存在按参数比对走增量路径） */
  attach(obj: SceneObject): void {
    if (this.disposed || !isRegionObject(obj)) return;
    this.syncRegion(obj);
  }

  /**
   * 对象更新（从宽，不认 keys）：region → 重算生效参数 + baseY + 可见性。
   * 未登记但配方有效 = 补建（自愈 attach 漏失）；幂等短路保证无关更新零误伤。
   */
  update(id: ID): void {
    if (this.disposed) return;
    const obj = this.sceneManager.getObject(id);
    if (!obj || !isRegionObject(obj)) return;
    this.syncRegion(obj);
  }

  /** 对象卸载：摘散布源（幂等；非 region / 无源安全 no-op；dispose 后 no-op） */
  detach(id: ID): void {
    if (this.disposed) return;
    this.detachUnchecked(id);
  }

  /**
   * 结构性变更（场景重载 / clear）的兜底全量 reconcile：清孤儿记录（场景已无对应
   * 对象——clear 不逐对象发事件）；存活对象由 Renderer.resyncAll 的 detach/attach
   * 钩子序列驱动逐个重建，此处不重复建源（避免整片双重全量重建）。
   */
  resyncAll(): void {
    if (this.disposed) return;
    for (const id of [...this.records.keys()]) {
      if (this.sceneManager.getObject(id) === undefined) this.detach(id);
    }
  }

  /** 图层属性更新：成员 region 只刷源级显隐（图层变更不触碰参数与几何） */
  onLayerUpdated(layerId: ID): void {
    if (this.disposed) return;
    const layer = this.sceneManager.getLayer(layerId);
    if (!layer) return;
    for (const objectId of layer.objectIds) {
      if (!this.records.has(objectId)) continue;
      const obj = this.sceneManager.getObject(objectId);
      if (obj) this.manager.setSourceVisible(objectId, this.effectiveVisible(obj));
    }
  }

  /** 停止绑定并摘除全部源（Renderer.dispose 链上先于 manager.dispose 调用；幂等） */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const id of [...this.records.keys()]) this.detachUnchecked(id);
  }

  // ── 内部：region → 散布源路由 ─────────────────────────────

  /** 无 disposed 守卫的摘除（dispose 循环内部复用；外部一律走 detach） */
  private detachUnchecked(id: ID): void {
    this.manager.removeSource(id);
    this.records.delete(id);
  }

  /**
   * 单 region 增量同步（全部路由的汇合点）：
   * 生效输入 = composeScatterParams(polygon × 配方 × overrides × seed) + baseY + 可见性，
   * 与记录比对后分派 setSource（全量）/ recomputeChunks（局部）/ removeSource / no-op。
   */
  private syncRegion(region: RegionObject): void {
    const recipe = getRouteMeta(region.style.presetId)?.scatter;
    const record = this.records.get(region.id);
    if (!recipe) {
      if (record) this.detach(region.id); // 换出到表面型预设：散布随换而清
      return;
    }
    // 世界多边形 = shape.points 逐点叠加 transform.position（XZ；撒点管线吃世界坐标，
    // 与区域表面的「几何 + 根偏移」组合同口径——gizmo 平移时表面与散布一起动）；
    // 本类新建数组，绝不回写场景点列。Y 走下方 baseY 合成，scale/rotation 不参与
    const offsetX = region.transform.position.x;
    const offsetZ = region.transform.position.z;
    const nextParams = composeScatterParams({
      polygon: region.shape.points.map((p) => ({ x: p.x + offsetX, y: p.y + offsetZ })),
      recipe,
      overrides: region.style.overrides,
      seed: resolveScatterSeed(region.style.seed, region.id),
    });
    // 世界基面 y 与表面几何同口径（GeometryBuilder 以 baseHeight 拍 y、wrapper 挂
    // transform.position.y——高度合成规则 §A）
    const nextBaseY = region.shape.baseHeight + region.transform.position.y;
    if (!record || record.baseY !== nextBaseY) {
      // 无源（首建 / 补建）或基面移动：全量重建（幂等，确定性输入下逐位一致）
      this.manager.setSource(region.id, nextParams, nextBaseY);
    } else {
      const keys = computeAffectedChunks(record.params, nextParams);
      if (keys.length > 0) this.manager.recomputeChunks(region.id, keys, nextParams);
    }
    this.records.set(region.id, { params: snapshotParams(nextParams), baseY: nextBaseY });
    this.manager.setSourceVisible(region.id, this.effectiveVisible(region));
  }
}
