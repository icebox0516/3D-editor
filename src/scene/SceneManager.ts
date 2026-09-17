/**
 * scene/SceneManager —— 场景数据唯一数据源的增删改查容器。
 *
 * 职责：持有全部 SceneObject 与 Layer，提供 getObject/addObject/removeObject/updateObject/
 *      getObjects/getLayer(s)/clear 等纯数据操作，并在变更时经 EventBus 广播
 *      object:created / object:updated / object:removed / layer:updated / scene:changed。
 * 边界：只增删改查——不校验（domain/validate 负责）、不计算、不发命令（editor/commands 负责）；
 *      每个变更操作恰好发出一次 scene:changed（source 为方法名）；clear 为结构性批量清空，
 *      只发一次 scene:changed，不逐对象发 object:removed（订阅方按 scene:changed 全量重同步）。
 *
 * 补充说明（超出 CONTRACTS.md 显式列出的最小集）：契约只给了 getLayer/getLayers，
 * 但图层必须可写入才有意义，故补充 addLayer/updateLayer/removeLayer 三个同风格方法；
 * layer.objectIds 为派生索引，由本类依据对象 layerId 自动维护。
 */
import type { EventBus } from '../core/events/EventBus';
import type { ID } from '../core/types';
import type { Layer } from './Layer';
import type { SceneObject } from './SceneObject';

export class SceneManager {
  private readonly eventBus: EventBus;
  private readonly objects = new Map<ID, SceneObject>();
  private readonly layers = new Map<ID, Layer>();

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  // ── 对象 ────────────────────────────────────────────────

  getObject(id: ID): SceneObject | undefined {
    return this.objects.get(id);
  }

  /** 添加对象（重复 id 抛错）；emit object:created + scene:changed */
  addObject(obj: SceneObject): void {
    if (this.objects.has(obj.id)) {
      throw new Error(`SceneManager.addObject: 对象 id 重复（${obj.id}）`);
    }
    this.objects.set(obj.id, obj);
    if (obj.layerId !== null) this.moveLayerMembership(null, obj.layerId, obj.id);
    this.eventBus.emit('object:created', { objectId: obj.id });
    this.eventBus.emit('scene:changed', { source: 'addObject' });
  }

  /** 移除对象并返回之；不存在返回 undefined（无事件）；emit object:removed + scene:changed */
  removeObject(id: ID): SceneObject | undefined {
    const obj = this.objects.get(id);
    if (!obj) return undefined;
    this.objects.delete(id);
    if (obj.layerId !== null) this.moveLayerMembership(obj.layerId, null, id);
    this.eventBus.emit('object:removed', { objectId: id });
    this.eventBus.emit('scene:changed', { source: 'removeObject' });
    return obj;
  }

  /**
   * 浅合并 patch 到目标对象；emit object:updated(keys) + scene:changed（空 patch 不发事件）。
   * - 不允许改 id：patch.id 与当前不同则抛错（相同视为无变化，放行）；
   * - 对象不存在时静默忽略（命令重放必须对已删除对象幂等）；
   * - patch.layerId 变化时自动迁移两图层的 objectIds 派生索引。
   */
  updateObject<K extends keyof SceneObject>(id: ID, patch: Partial<Pick<SceneObject, K>>): void {
    const target = this.objects.get(id);
    if (!target) return;
    const source = patch as Partial<SceneObject>; // 放宽 K 以便统一按 keyof SceneObject 访问
    if (source.id !== undefined && source.id !== id) {
      throw new Error(`SceneManager.updateObject: 不允许修改对象 id（${id} -> ${String(source.id)}）`);
    }
    const keys = Object.keys(patch) as (keyof SceneObject)[];
    if (keys.length === 0) return;
    const prevLayerId = target.layerId;
    for (const key of keys) {
      (target as Record<keyof SceneObject, unknown>)[key] = source[key];
    }
    if (keys.includes('layerId')) {
      this.moveLayerMembership(prevLayerId, target.layerId, id);
    }
    this.eventBus.emit('object:updated', { objectId: id, keys: keys as string[] });
    this.eventBus.emit('scene:changed', { source: 'updateObject' });
  }

  /** 全部对象（或按谓词过滤）的快照数组；元素为存活对象引用 */
  getObjects(pred?: (o: SceneObject) => boolean): SceneObject[] {
    const all = [...this.objects.values()];
    return pred ? all.filter(pred) : all;
  }

  /**
   * 按给定 id 全序重排对象（T8.5 同层排序语义：SceneData.objects 平铺数组内
   * 同父兄弟顺序 = 数组内顺序，重排 = 换数组顺序）。
   * 契约补充方法（沿 addLayer/updateLayer/removeLayer 同款先例）：
   * - 清单中的已知 id 按清单序排列；未知 id 忽略；遗漏的存活对象追加尾部（保原相对序）；
   * - 顺序与当前一致时幂等静默（不发事件）；有变化时 emit scene:changed（source=reorderObjects），
   *   不逐对象发 object:updated（结构性批量变更，订阅方按 scene:changed 全量重同步）。
   */
  reorderObjects(orderedIds: readonly ID[]): void {
    const next: SceneObject[] = [];
    const seen = new Set<ID>();
    for (const id of orderedIds) {
      const obj = this.objects.get(id);
      if (obj !== undefined && !seen.has(id)) {
        next.push(obj);
        seen.add(id);
      }
    }
    for (const obj of this.objects.values()) {
      if (!seen.has(obj.id)) {
        next.push(obj);
        seen.add(obj.id);
      }
    }
    const current = [...this.objects.values()];
    const changed = current.length !== next.length || current.some((obj, i) => obj !== next[i]);
    if (!changed) return; // 幂等静默：顺序无变化不发事件
    this.objects.clear();
    for (const obj of next) this.objects.set(obj.id, obj);
    this.eventBus.emit('scene:changed', { source: 'reorderObjects' });
  }

  // ── 图层（契约补充方法，见文件头说明）──────────────────

  /** 添加图层（重复 id 抛错）；回填已指向该图层的对象到 objectIds；emit scene:changed */
  addLayer(layer: Layer): void {
    if (this.layers.has(layer.id)) {
      throw new Error(`SceneManager.addLayer: 图层 id 重复（${layer.id}）`);
    }
    this.layers.set(layer.id, layer);
    for (const obj of this.objects.values()) {
      if (obj.layerId === layer.id && !layer.objectIds.includes(obj.id)) {
        layer.objectIds.push(obj.id);
      }
    }
    this.eventBus.emit('scene:changed', { source: 'addLayer' });
  }

  /**
   * 浅合并 patch 到目标图层（objectIds 为派生索引，patch 中被忽略）；
   * emit layer:updated + scene:changed。改 id 抛错；图层不存在静默忽略。
   */
  updateLayer<K extends keyof Layer>(id: ID, patch: Partial<Pick<Layer, K>>): void {
    const layer = this.layers.get(id);
    if (!layer) return;
    const source = patch as Partial<Layer>; // 放宽 K 以便统一按 keyof Layer 访问
    if (source.id !== undefined && source.id !== id) {
      throw new Error(`SceneManager.updateLayer: 不允许修改图层 id（${id} -> ${String(source.id)}）`);
    }
    const keys = (Object.keys(patch) as (keyof Layer)[]).filter((k) => k !== 'objectIds');
    if (keys.length === 0) return;
    for (const key of keys) {
      (layer as Record<keyof Layer, unknown>)[key] = source[key];
    }
    this.eventBus.emit('layer:updated', { layerId: id });
    this.eventBus.emit('scene:changed', { source: 'updateLayer' });
  }

  /**
   * 移除图层并返回之；成员对象的 layerId 置 null（对象本体保留）。
   * 结构性批量变更只发一次 scene:changed，不逐对象发 object:updated。
   */
  removeLayer(id: ID): Layer | undefined {
    const layer = this.layers.get(id);
    if (!layer) return undefined;
    this.layers.delete(id);
    for (const objectId of [...layer.objectIds]) {
      const obj = this.objects.get(objectId);
      if (obj) obj.layerId = null;
    }
    this.eventBus.emit('scene:changed', { source: 'removeLayer' });
    return layer;
  }

  getLayer(id: ID): Layer | undefined {
    return this.layers.get(id);
  }

  getLayers(): Layer[] {
    return [...this.layers.values()];
  }

  // ── 整体 ────────────────────────────────────────────────

  /** 清空全部对象与图层；只发一次 scene:changed（不逐对象发 object:removed） */
  clear(): void {
    this.objects.clear();
    this.layers.clear();
    this.eventBus.emit('scene:changed', { source: 'clear' });
  }

  // ── 内部：图层成员派生索引维护 ──────────────────────────

  /** 将 objectId 的成员记录从 oldLayerId 迁移到 newLayerId（图层不存在则跳过该侧） */
  private moveLayerMembership(oldLayerId: ID | null, newLayerId: ID | null, objectId: ID): void {
    if (oldLayerId === newLayerId) return;
    if (oldLayerId !== null) {
      const oldLayer = this.layers.get(oldLayerId);
      if (oldLayer) {
        oldLayer.objectIds = oldLayer.objectIds.filter((x) => x !== objectId);
      }
    }
    if (newLayerId !== null) {
      const newLayer = this.layers.get(newLayerId);
      if (newLayer && !newLayer.objectIds.includes(objectId)) {
        newLayer.objectIds.push(objectId);
      }
    }
  }
}
