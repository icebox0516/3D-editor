/**
 * editor/commands/ChangePropertyCommand —— 业务属性修改命令。
 *
 * 职责：把 patch 浅合并进对象 properties（如修改建筑高度）；undo 恢复完整原 properties
 *      （含移除 patch 新增的键）；redo 重新应用。
 * 边界：before/after 保存整个 properties 记录的深拷贝（而非仅 patch 键），保证键的
 *      增删完全可逆；对象不存在时 execute 返回 false；undo/redo 幂等。
 */
import { deepClone } from '../../core/utils';
import type { ID } from '../../core/types';
import { CommandBase } from './Command';
import type { CommandContext } from './CommandContext';

export class ChangePropertyCommand extends CommandBase {
  readonly name = 'ChangePropertyCommand';
  private readonly objectId: ID;
  /** 待合并的属性补丁（构造时深拷贝） */
  private readonly patch: Record<string, unknown>;
  private beforeProperties: Record<string, unknown> | null = null;
  private afterProperties: Record<string, unknown> | null = null;

  constructor(objectId: ID, patch: Record<string, unknown>) {
    super();
    this.objectId = objectId;
    this.patch = deepClone(patch);
  }

  canExecute(): boolean {
    return true; // patch 已给定，存在性在 execute 时判定
  }

  execute(ctx: CommandContext): boolean {
    const target = ctx.sceneManager.getObject(this.objectId);
    if (!target) return false;
    this.beforeProperties = deepClone(target.properties);
    this.afterProperties = { ...this.beforeProperties, ...this.patch };
    ctx.sceneManager.updateObject(this.objectId, {
      properties: deepClone(this.afterProperties),
    });
    this.emitSceneChanged(ctx);
    return true;
  }

  undo(ctx: CommandContext): void {
    if (!this.beforeProperties) return;
    ctx.sceneManager.updateObject(this.objectId, {
      properties: deepClone(this.beforeProperties),
    });
    this.emitSceneChanged(ctx);
  }

  redo(ctx: CommandContext): void {
    if (!this.afterProperties) return;
    ctx.sceneManager.updateObject(this.objectId, {
      properties: deepClone(this.afterProperties),
    });
    this.emitSceneChanged(ctx);
  }
}
