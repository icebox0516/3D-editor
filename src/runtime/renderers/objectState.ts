/**
 * runtime/renderers/objectState —— 业务对象公共属性 → THREE.Object3D 单向应用纯函数。
 *
 * 职责：SceneObject 的名称/变换/可见性写入 Object3D（name/position/rotation/scale/
 *      visible），供 Renderer（模型对象锚点/实例路径）与 RegionRenderer（区域对象根）
 *      复用。T6.7 自 ElementRenderer（已随旧要素体系删除）迁移至此——原类内联实现
 *      逐字一致，仅迁文件不改语义。
 * 边界：只读业务数据单向应用，零反向写；userData 不经此函数（objectId 登记归 RuntimeObjectMap）。
 */
import type * as THREE from 'three';
import type { SceneObject } from '../../scene/SceneObject';

/** 公共业务属性 → Object3D（名称/变换/可见性）；只读数据单向应用，runtime 各处复用 */
export function applySceneObjectState(root: THREE.Object3D, obj: SceneObject): void {
  root.name = obj.name;
  const { position, rotation, scale } = obj.transform;
  root.position.set(position.x, position.y, position.z);
  root.rotation.set(rotation.x, rotation.y, rotation.z);
  root.scale.set(scale.x, scale.y, scale.z);
  root.visible = obj.visible;
}
