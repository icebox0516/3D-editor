/**
 * editor/commands/Command —— 命令基础接口与公共基类。
 *
 * 职责：声明一切可见场景修改的统一抽象（id/name/execute/undo/redo/canExecute）；
 *      CommandBase 提供公共能力——命令 id 发号（cmd_ 前缀）、成功变更后统一广播
 *      scene:changed（source=命令名）、对象移出场景时同步清理选中集。
 * 边界：一切可见修改必须经 Command（CONTRACTS.md #4）；命令保存 before/after 深拷贝快照，
 *      undo/redo 完全可逆且对已消失对象幂等重放（依赖 SceneManager 的静默语义）；
 *      零渲染——只经 CommandContext 操作数据与事件。
 */
import { createId } from '../../core/id';
import type { ID } from '../../core/types';
import type { CommandContext } from './CommandContext';

/** 命令接口：所有可见场景修改的唯一载体（签名以 CONTRACTS.md 为准） */
export interface Command {
  /** 命令实例 ID（createId('cmd') 生成，cmd_ 前缀） */
  readonly id: ID;
  /** 命令名（事件 attribution 用，如 scene:changed 的 source） */
  readonly name: string;
  /** 执行命令；失败（对象不存在等）返回 false 且不得产生部分副作用 */
  execute(ctx: CommandContext): boolean;
  /** 撤销到 before；对已失效状态幂等（不抛错） */
  undo(ctx: CommandContext): void;
  /** 重做到 after；对已失效状态幂等（不抛错） */
  redo(ctx: CommandContext): void;
  /** 基于构造入参的前置检查（无上下文）：不满足则 HistoryManager 直接拒绝执行 */
  canExecute(): boolean;
}

/** 命令公共基类：id 发号 + 统一事件广播 + 选中集清理 */
export abstract class CommandBase implements Command {
  readonly id: ID = createId('cmd');
  abstract readonly name: string;

  abstract execute(ctx: CommandContext): boolean;
  abstract undo(ctx: CommandContext): void;
  abstract redo(ctx: CommandContext): void;
  abstract canExecute(): boolean;

  /**
   * 成功的 execute/undo/redo 后统一广播 scene:changed（source=命令名）。
   * SceneManager 的增删改查方法也会发各自的 scene:changed（source=方法名），
   * 命令级这一次提供变更归因（哪个命令造成了本次可见修改），供 UI/渲染层响应。
   */
  protected emitSceneChanged(ctx: CommandContext): void {
    ctx.eventBus.emit('scene:changed', { source: this.name });
  }

  /** 对象移出场景时同步清理选中集（幂等：未选中则无任何事件） */
  protected deselectIfSelected(ctx: CommandContext, objectId: ID): void {
    if (ctx.selection.isSelected(objectId)) {
      ctx.selection.remove(objectId);
    }
  }
}
