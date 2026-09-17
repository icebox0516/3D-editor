/**
 * editor/commands/ChangeLayerCommand —— 图层归属修改命令。
 *
 * 职责：把对象迁移到目标图层（layerId，null 表示脱离图层）；undo/redo 完整往返，
 *      图层成员派生索引（layer.objectIds）由 SceneManager 依据 layerId 自动同步。
 * 边界：目标图层存在性不做前置校验（SceneManager 对缺失图层静默跳过索引迁移，
 *      校验属 domain/validate 职责）；对象不存在时 execute 返回 false；
 *      从未成功执行过时 undo/redo 无操作（幂等）。
 */
import type { ID } from '../../core/types';
import { CommandBase } from './Command';
import type { CommandContext } from './CommandContext';

export class ChangeLayerCommand extends CommandBase {
  readonly name = 'ChangeLayerCommand';
  private readonly objectId: ID;
  private readonly after: ID | null;
  private before: ID | null = null;
  /** 是否成功执行过（区分「未执行」与「before 恰为 null」两种空值） */
  private executed = false;

  constructor(objectId: ID, layerId: ID | null) {
    super();
    this.objectId = objectId;
    this.after = layerId;
  }

  canExecute(): boolean {
    return true; // 目标图层 id 已给定，对象存在性在 execute 时判定
  }

  execute(ctx: CommandContext): boolean {
    const target = ctx.sceneManager.getObject(this.objectId);
    if (!target) return false;
    this.before = target.layerId;
    this.executed = true;
    ctx.sceneManager.updateObject(this.objectId, { layerId: this.after });
    this.emitSceneChanged(ctx);
    return true;
  }

  undo(ctx: CommandContext): void {
    if (!this.executed) return;
    ctx.sceneManager.updateObject(this.objectId, { layerId: this.before });
    this.emitSceneChanged(ctx);
  }

  redo(ctx: CommandContext): void {
    if (!this.executed) return;
    ctx.sceneManager.updateObject(this.objectId, { layerId: this.after });
    this.emitSceneChanged(ctx);
  }
}
