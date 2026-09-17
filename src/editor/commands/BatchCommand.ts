/**
 * editor/commands/BatchCommand —— 批量原子命令。
 *
 * 职责：把多个子 Command 打包为一个原子命令：execute 顺序执行全部子命令，
 *      任一失败立即逆序回滚已执行部分并返回 false；undo 逆序全部撤销、redo 顺序全部重做，
 *      在 HistoryManager 默认配置下合并为一条历史（一次 undo/redo 处理整批）。
 * 边界：子命令列表构造时复制（外部增删不影响）；canExecute 聚合全部子命令结果；
 *      空批不可执行；连续放置/批量改样式等场景经此合并，避免撤销 N 次按 N 下。
 */
import { CommandBase } from './Command';
import type { Command } from './Command';
import type { CommandContext } from './CommandContext';

export class BatchCommand extends CommandBase {
  readonly name = 'BatchCommand';
  private readonly children: Command[];

  constructor(commands: Command[]) {
    super();
    this.children = [...commands];
  }

  canExecute(): boolean {
    return this.children.length > 0 && this.children.every((child) => child.canExecute());
  }

  execute(ctx: CommandContext): boolean {
    if (this.children.length === 0) return false; // 空批无语义，不入历史
    const executed: Command[] = [];
    for (const child of this.children) {
      const ok = child.canExecute() && child.execute(ctx);
      if (!ok) {
        // 原子性：逆序回滚已执行子命令，后续子命令不再执行
        for (let i = executed.length - 1; i >= 0; i--) {
          executed[i].undo(ctx);
        }
        return false;
      }
      executed.push(child);
    }
    this.emitSceneChanged(ctx);
    return true;
  }

  undo(ctx: CommandContext): void {
    for (let i = this.children.length - 1; i >= 0; i--) {
      this.children[i].undo(ctx);
    }
    this.emitSceneChanged(ctx);
  }

  redo(ctx: CommandContext): void {
    for (const child of this.children) {
      child.redo(ctx);
    }
    this.emitSceneChanged(ctx);
  }

  /** 子命令副本（HistoryManager mergeBatch:false 时按子命令逐条入栈用） */
  getChildren(): Command[] {
    return [...this.children];
  }
}
