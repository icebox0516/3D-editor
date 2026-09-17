/**
 * editor/commands/DeleteObjectCommand —— 删除对象命令（T8.5 组感知）。
 *
 * 职责：从场景移除指定对象；undo 以同 id 恢复原对象（含全部字段）与数组位置；
 *      redo 再次删除。
 * T8.5 删组不删成员（UE 删文件夹不删 Actor 先例）：目标含直接子级时仅删节点本身，
 *      子级上提到目标的父级（parentId ← 目标 parentId；无子级行为与既往完全一致），
 *      成员世界变换与图层归属零变化；数组顺序在删除时保持、undo 时经 reorder 复原
 *      （addObject 追加尾部，须重排回原位）。
 * 边界：before 快照在 execute 成功时刻捕获（深拷贝）；对象不存在时 execute 返回 false；
 *      删除时同步清理选中集（已删除对象不可停留在选中态）；
 *      undo/redo 对已失效状态幂等（不抛错）。
 */
import { deepClone } from '../../core/utils';
import type { ID } from '../../core/types';
import type { SceneObject } from '../../scene/SceneObject';
import { childrenIndexOf } from '../../scene/hierarchy';
import { CommandBase } from './Command';
import type { CommandContext } from './CommandContext';

export class DeleteObjectCommand extends CommandBase {
  readonly name = 'DeleteObjectCommand';
  private readonly objectId: ID;
  /** 被删对象的深拷贝快照（execute 成功时捕获；未执行过则为 null） */
  private snapshot: SceneObject | null = null;
  /** 删除前数组顺序（undo 复原位置；addObject 追加尾部须重排） */
  private beforeIds: ID[] | null = null;
  /** 直接子级上提记账（before = 目标 id；after = 目标 parentId） */
  private lifted: Array<{ id: ID; before: ID; after: ID | null }> | null = null;

  constructor(objectId: ID) {
    super();
    this.objectId = objectId;
  }

  canExecute(): boolean {
    return true; // 目标 id 已给定，存在性在 execute 时判定
  }

  execute(ctx: CommandContext): boolean {
    const target = ctx.sceneManager.getObject(this.objectId);
    if (!target) return false; // 对象不存在：不入历史
    this.snapshot = deepClone(target);
    this.beforeIds = ctx.sceneManager.getObjects().map((o) => o.id);
    this.lifted = childrenIndexOf(ctx.sceneManager.getObjects())
      .get(target.id)
      ?.map((child) => ({ id: child.id, before: target.id, after: target.parentId })) ?? [];

    ctx.sceneManager.removeObject(this.objectId);
    this.deselectIfSelected(ctx, this.objectId);
    for (const lift of this.lifted) {
      ctx.sceneManager.updateObject(lift.id, { parentId: lift.after }); // 成员上提父级
    }
    this.emitSceneChanged(ctx);
    return true;
  }

  undo(ctx: CommandContext): void {
    if (!this.snapshot || !this.beforeIds || !this.lifted) return; // 从未成功执行过，无 before 可恢复
    if (ctx.sceneManager.getObject(this.snapshot.id) === undefined) {
      ctx.sceneManager.addObject(deepClone(this.snapshot)); // 同 id 恢复（追加尾部）
    }
    for (const lift of this.lifted) {
      ctx.sceneManager.updateObject(lift.id, { parentId: lift.before }); // 子级挂回
    }
    ctx.sceneManager.reorderObjects(this.beforeIds); // 复原数组位置
    this.emitSceneChanged(ctx);
  }

  redo(ctx: CommandContext): void {
    if (!this.snapshot || !this.lifted) return;
    ctx.sceneManager.removeObject(this.objectId); // 不存在时静默（幂等重放）
    this.deselectIfSelected(ctx, this.objectId);
    for (const lift of this.lifted) {
      ctx.sceneManager.updateObject(lift.id, { parentId: lift.after });
    }
    this.emitSceneChanged(ctx);
  }
}
