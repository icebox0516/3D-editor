/**
 * runtime/RuntimeObjectMap —— 业务对象 ↔ Three.js 对象的双向映射表。
 *
 * 职责：维护「业务 ID → THREE.Object3D」正向映射；set 时自动写入
 *      root.userData.objectId（唯一允许的 userData 内容，CONTRACTS.md #3），
 *      提供 getId / findId 反查（findId 沿父链上行，供射线拾取命中子 Mesh 时定位根对象）。
 * 边界：纯映射容器，不创建/销毁 Object3D，不触碰业务数据；
 *      userData 仅存 objectId 映射辅助，禁止存放任何业务数据。
 */
import type { ID } from '../core/types';
import type * as THREE from 'three';

export class RuntimeObjectMap {
  private readonly byId = new Map<ID, THREE.Object3D>();

  /** 建立映射并写入 userData.objectId；重复 id 覆盖（旧对象的 userData 清理映射字段） */
  set(id: ID, object: THREE.Object3D): void {
    const prev = this.byId.get(id);
    if (prev && prev !== object) delete prev.userData.objectId;
    this.byId.set(id, object);
    object.userData.objectId = id;
  }

  /** 按业务 id 取运行时对象；不存在返回 undefined */
  get(id: ID): THREE.Object3D | undefined {
    return this.byId.get(id);
  }

  /** 从对象自身 userData 反查业务 id（经 set 写入）；未映射返回 null */
  getId(object: THREE.Object3D): ID | null {
    const id = object.userData.objectId;
    return typeof id === 'string' ? id : null;
  }

  /** 沿父链向上查找最近的业务 id（拾取命中子对象时定位根；根对象等价 getId） */
  findId(object: THREE.Object3D): ID | null {
    let node: THREE.Object3D | null = object;
    while (node) {
      const id = node.userData.objectId;
      if (typeof id === 'string') return id;
      node = node.parent;
    }
    return null;
  }

  /** 是否已映射该 id */
  has(id: ID): boolean {
    return this.byId.has(id);
  }

  /** 解除映射并返回被移除的对象（清理其 userData.objectId）；不存在返回 undefined（幂等） */
  delete(id: ID): THREE.Object3D | undefined {
    const object = this.byId.get(id);
    if (!object) return undefined;
    this.byId.delete(id);
    if (object.userData.objectId === id) delete object.userData.objectId;
    return object;
  }

  /** 清空全部映射（不销毁对象，对象销毁由各 Adapter 的 dispose 负责） */
  clear(): void {
    for (const object of this.byId.values()) {
      delete object.userData.objectId;
    }
    this.byId.clear();
  }

  /** 全部业务 id（快照数组） */
  ids(): ID[] {
    return [...this.byId.keys()];
  }

  /** 映射数量 */
  size(): number {
    return this.byId.size;
  }
}
