/**
 * editor/commands/TransformCommand —— 变换命令（移动/旋转/缩放）。
 *
 * 职责：把对象 transform 从 before 改到 after（Gizmo 拖拽结束等场景）；
 *      undo 回到 before，redo 回到 after，逐字段完全可逆。
 * 边界：before 以 execute 时刻场景实际状态为准（构造入参的 before 仅作前置校验与兜底，
 *      防调用方传入过期快照导致 undo 落点错误）；after 在构造时深拷贝；
 *      canExecute 校验 before/after 结构合法；对象不存在时 execute 返回 false；
 *      undo/redo 经 SceneManager.updateObject 对已消失对象静默（幂等重放）。
 */
import { isTransform } from '../../core/types';
import type { ID, Transform } from '../../core/types';
import { CommandBase } from './Command';
import type { CommandContext } from './CommandContext';

export class TransformCommand extends CommandBase {
  readonly name = 'TransformCommand';
  private readonly objectId: ID;
  private readonly after: Transform;
  private before: Transform;

  constructor(objectId: ID, before: Transform, after: Transform) {
    super();
    this.objectId = objectId;
    this.before = { ...before }; // 结构守卫保证纯值，浅拷贝即可；execute 时以实际状态覆盖
    this.after = { ...after };
  }

  canExecute(): boolean {
    // 无上下文的前置检查：before/after 必须是结构合法的 Transform（拒绝 NaN/Infinity 等）
    return isTransform(this.before) && isTransform(this.after);
  }

  execute(ctx: CommandContext): boolean {
    const target = ctx.sceneManager.getObject(this.objectId);
    if (!target || !isTransform(target.transform)) return false;
    this.before = { ...target.transform }; // 以执行时实际状态为 before（事务语义）
    ctx.sceneManager.updateObject(this.objectId, { transform: { ...this.after } });
    this.emitSceneChanged(ctx);
    return true;
  }

  undo(ctx: CommandContext): void {
    ctx.sceneManager.updateObject(this.objectId, { transform: { ...this.before } });
    this.emitSceneChanged(ctx);
  }

  redo(ctx: CommandContext): void {
    ctx.sceneManager.updateObject(this.objectId, { transform: { ...this.after } });
    this.emitSceneChanged(ctx);
  }
}
