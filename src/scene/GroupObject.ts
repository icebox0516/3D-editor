/**
 * scene/GroupObject —— 纯组织节点（组壳）类型与守卫（T8.5）。
 *
 * 职责：声明 'group' 对象类型——Outliner 层级树的容器节点：只有 SceneObject 基座字段
 *      （id/name/parentId/layerId/visible/locked/transform/properties），无
 *      shape/semantic/style/asset 等业务扩展层。
 * 语义（任务书 T8.5 + 阶段门 2026-09-13 裁定，UE Actor Folders / Blender Collections 先例）：
 *   - 纯组织节点：组不传递变换（transform 恒等，成员世界变换不因挂组改变）；
 *   - 删组不删成员（成员上提父级）；子对象 layerId 独立于组（组不动图层归属）；
 *   - 组可嵌套；空组保留（不自动清除）；组壳 layerId 建议默认 null（无图层语义）。
 * 边界：纯数据类型 + 结构守卫，零行为零渲染；id 前缀 group_（CONTRACTS #7 增补，
 *      工厂在 editor/factories/groupFactory——scene 层不生成 id）。
 */
import type { SceneObject } from './SceneObject';

/** 组对象类型字面量（SceneObject.type 合法值之一） */
export const GROUP_OBJECT_TYPE = 'group';

/** 组壳：SceneObject 基座即全部（无业务扩展层；transform 恒等由工厂与命令共同保证） */
export interface GroupObject extends SceneObject {
  type: typeof GROUP_OBJECT_TYPE;
}

/** 组壳类型守卫（type 字面量判定；不做深层校验） */
export function isGroupObject(obj: SceneObject): obj is GroupObject {
  return obj.type === GROUP_OBJECT_TYPE;
}
