/**
 * runtime/ObjectAdapter —— 「业务数据 → Three.js 对象」单向映射的适配器抽象。
 *
 * 职责：声明 create（SceneObject → Object3D）/ update（数据变更同步到既有对象）/
 *      dispose（释放运行时资源）三段生命周期，由各具体适配器实现
 *      （ElementRenderer 体系覆盖六类要素；模型对象由 Renderer 经 AssetLoader 适配）。
 * 边界：适配器只读 Scene 数据，禁止反向修改 SceneObject 任何属性；
 *      产出的 Object3D 根节点由 RuntimeObjectMap 统一登记 userData.objectId。
 */
import type * as THREE from 'three';
import type { SceneObject } from '../scene/SceneObject';

export abstract class ObjectAdapter {
  /** 依据业务数据创建运行时对象（全新 Object3D，专属资源可安全释放） */
  abstract create(obj: SceneObject): THREE.Object3D;

  /**
   * 将数据变更同步到既有运行时对象。
   * @param keys 变更字段名列表（来自 object:updated 事件）；缺省视为全量刷新。
   *             实现应按字段粒度增量更新（如仅 style 变更只重建材质、保留几何引用）。
   */
  abstract update(root: THREE.Object3D, obj: SceneObject, keys?: string[]): void;

  /** 释放该运行时对象的专属资源（共享资源——如资产克隆——不得在此释放） */
  abstract dispose(root: THREE.Object3D): void;
}
