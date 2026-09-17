/**
 * editor/history/HistoryManager —— 撤销/重做历史管理器。
 *
 * 职责：execute(cmd) 校验（canExecute）并执行，成功入撤销栈且清空重做栈，失败不入栈；
 *      undo()/redo() 弹栈回放（LIFO）；canUndo()/canRedo() 查询；clear() 清空两侧栈；
 *      每次栈变更经 EventBus 广播 history:changed（canUndo/canRedo）。
 * 边界：持有 CommandContext 但不放入 CommandContext（命令不感知历史，避免循环依赖）；
 *      mergeBatch 选项（默认 true）：BatchCommand 合并为一条历史；置 false 时批量命令
 *      仍原子执行，但按子命令逐条入栈（每次 undo 撤销一个，满足「是否合并可配置」）；
 *      命令执行失败（false 返回）对栈零副作用。
 */
import type { Command, CommandContext } from '../commands';
import { BatchCommand } from '../commands/BatchCommand';

export class HistoryManager {
  private readonly ctx: CommandContext;
  private readonly mergeBatch: boolean;
  private readonly undoStack: Command[] = [];
  private readonly redoStack: Command[] = [];

  constructor(ctx: CommandContext, opts?: { mergeBatch?: boolean }) {
    this.ctx = ctx;
    this.mergeBatch = opts?.mergeBatch !== false; // 默认合并为一条历史
  }

  /** 执行命令：canExecute 拒绝或 execute 失败返回 false（栈零副作用）；成功入栈并清空重做栈 */
  execute(cmd: Command): boolean {
    if (!cmd.canExecute()) return false;
    if (!cmd.execute(this.ctx)) return false;

    if (!this.mergeBatch && cmd instanceof BatchCommand) {
      const children = cmd.getChildren();
      this.undoStack.push(...(children.length > 0 ? children : [cmd]));
    } else {
      this.undoStack.push(cmd);
    }
    this.redoStack.length = 0;
    this.emitChanged();
    return true;
  }

  /** 撤销最近一条命令并压入重做栈；空栈返回 false */
  undo(): boolean {
    const cmd = this.undoStack.pop();
    if (!cmd) return false;
    cmd.undo(this.ctx);
    this.redoStack.push(cmd);
    this.emitChanged();
    return true;
  }

  /** 重做最近撤销的命令并压回撤销栈；空栈返回 false */
  redo(): boolean {
    const cmd = this.redoStack.pop();
    if (!cmd) return false;
    cmd.redo(this.ctx);
    this.undoStack.push(cmd);
    this.emitChanged();
    return true;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /** 清空撤销与重做栈（命令对场景的已生效修改不回滚） */
  clear(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.emitChanged();
  }

  private emitChanged(): void {
    this.ctx.eventBus.emit('history:changed', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    });
  }
}
