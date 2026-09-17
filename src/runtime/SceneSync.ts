/**
 * runtime/SceneSync —— EventBus → 渲染同步的事件驱动纯逻辑。
 *
 * 职责：把 object:created / object:updated / object:removed / layer:updated 与
 *      scene:changed(clear) 翻译为 attach / update / detach / resyncAll /
 *      onLayerUpdated 回调，使 Renderer（WebGL 相关、无法 node 单测）只实现回调本身；
 *      事件 → 操作的翻译逻辑在本类，可纯 node 测试（任务书「拆为可测纯逻辑」要求）。
 * 边界：只读 SceneManager（按 id 取对象）；不创建/持有任何 Three.js 资源；
 *      start/stop 幂等，stop 后完全退订。
 */
import type { EventBus } from '../core/events/EventBus';
import type { ID } from '../core/types';
import type { SceneObject } from '../scene/SceneObject';
import type { SceneManager } from '../scene/SceneManager';

/** 渲染侧需实现的同步回调（Renderer 注入） */
export interface SceneSyncHandlers {
  /** 对象创建 → 创建运行时对象并挂载 */
  attach(obj: SceneObject): void;
  /** 对象更新 → 按 keys 增量同步 */
  update(id: ID, keys: string[]): void;
  /** 对象移除 → 卸载并释放运行时对象 */
  detach(id: ID): void;
  /** 结构性变更（clear）→ 全量重建视图 */
  resyncAll(): void;
  /** 图层属性更新 → 重新应用图层可见性/透明度（可选） */
  onLayerUpdated?(layerId: ID): void;
}

export class SceneSync {
  private readonly bus: EventBus;
  private readonly sceneManager: SceneManager;
  private readonly handlers: SceneSyncHandlers;
  private offs: Array<() => void> = [];

  constructor(bus: EventBus, sceneManager: SceneManager, handlers: SceneSyncHandlers) {
    this.bus = bus;
    this.sceneManager = sceneManager;
    this.handlers = handlers;
  }

  /** 订阅事件（幂等；重复 start 不重复订阅） */
  start(): void {
    if (this.offs.length > 0) return;
    this.offs.push(
      this.bus.on('object:created', (p) => {
        const obj = this.sceneManager.getObject(p.objectId);
        if (obj) this.handlers.attach(obj);
      }),
      this.bus.on('object:updated', (p) => this.handlers.update(p.objectId, p.keys)),
      this.bus.on('object:removed', (p) => this.handlers.detach(p.objectId)),
      this.bus.on('scene:changed', (p) => {
        // 仅结构性批量变更走全量重建；常规 source 已由 object:* 精确驱动
        if (p.source === 'clear') this.handlers.resyncAll();
      }),
      this.bus.on('layer:updated', (p) => this.handlers.onLayerUpdated?.(p.layerId)),
    );
  }

  /** 退订全部事件（幂等） */
  stop(): void {
    for (const off of this.offs) off();
    this.offs = [];
  }

  /** 显式全量重同步：对场景当前每个对象先 detach 后 attach（视图重建） */
  resync(): void {
    for (const obj of this.sceneManager.getObjects()) {
      this.handlers.detach(obj.id);
      this.handlers.attach(obj);
    }
  }
}
