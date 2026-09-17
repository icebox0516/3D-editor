/**
 * editor/commands/CreateObjectCommand —— 创建对象命令。
 *
 * 职责：把一个完整 SceneObject 加入场景；undo 移除；redo 以同 id 恢复。
 * 边界：构造时深拷贝快照（外部后续修改原对象不影响命令重放）；
 *      目标 id 已存在时 execute 返回 false（避免 SceneManager.addObject 抛错进入半执行态）；
 *      undo 移除对象时同步清理选中集；redo 对已存在同 id 对象幂等跳过。
 */
import { deepClone } from '../../core/utils';
import type { SceneObject } from '../../scene/SceneObject';
import { CommandBase } from './Command';
import type { CommandContext } from './CommandContext';

export class CreateObjectCommand extends CommandBase {
  readonly name = 'CreateObjectCommand';
  /** 待创建对象的深拷贝快照（命令存续期内不受外部修改影响） */
  private readonly snapshot: SceneObject;

  constructor(obj: SceneObject) {
    super();
    this.snapshot = deepClone(obj);
  }

  canExecute(): boolean {
    return true; // 数据在构造时已齐备，存在性冲突在 execute 时判定
  }

  execute(ctx: CommandContext): boolean {
    if (ctx.sceneManager.getObject(this.snapshot.id) !== undefined) {
      return false; // id 冲突：保持场景原状，不入历史
    }
    ctx.sceneManager.addObject(deepClone(this.snapshot));
    this.emitSceneChanged(ctx);
    return true;
  }

  undo(ctx: CommandContext): void {
    ctx.sceneManager.removeObject(this.snapshot.id); // 不存在时静默（幂等重放）
    this.deselectIfSelected(ctx, this.snapshot.id);
    this.emitSceneChanged(ctx);
  }

  redo(ctx: CommandContext): void {
    if (ctx.sceneManager.getObject(this.snapshot.id) !== undefined) return; // 幂等重放
    ctx.sceneManager.addObject(deepClone(this.snapshot));
    this.emitSceneChanged(ctx);
  }
}
