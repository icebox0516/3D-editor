/**
 * editor/commands/ChangeShapeCommand —— RegionObject 形状层修改命令（阶段 6 T6.1）。
 *
 * 职责：整体替换 RegionObject 的 shape（RegionShape 纯数据）——形状类型切换（polygon→rectangle
 *      等）与 points/options/baseHeight/closed 变更同承载；undo 恢复原形状，redo 应用新形状。
 * 边界：只改 shape 数据，渲染几何由 runtime 依据事件重建（改形状不改类型与样式，分域契约 §A）；
 *      目标必须是 RegionObject（isRegionObject 守卫），否则 execute 返回 false（过渡期与旧要素
 *      并存、按对象 type 由调用侧派发，§D）；快照深拷贝；undo/redo 幂等。
 */
import { deepClone } from '../../core/utils';
import type { ID } from '../../core/types';
import { isRegionObject, isShapeType } from '../../domain/regions';
import type { RegionShape } from '../../domain/regions';
import type { SceneObject } from '../../scene/SceneObject';
import { CommandBase } from './Command';
import type { CommandContext } from './CommandContext';

export class ChangeShapeCommand extends CommandBase {
  readonly name = 'ChangeShapeCommand';
  private readonly objectId: ID;
  private readonly after: RegionShape;
  private before: RegionShape | null = null;

  constructor(objectId: ID, shape: RegionShape) {
    super();
    this.objectId = objectId;
    this.after = deepClone(shape);
  }

  canExecute(): boolean {
    // 结构前置检查（无上下文）：七类形状之一 + 点列/基准高度/闭合标志形态合法
    return (
      isShapeType(this.after.type) &&
      Array.isArray(this.after.points) &&
      typeof this.after.baseHeight === 'number' &&
      typeof this.after.closed === 'boolean'
    );
  }

  execute(ctx: CommandContext): boolean {
    const target = ctx.sceneManager.getObject(this.objectId);
    if (!target || !isRegionObject(target)) {
      return false; // 对象不存在，或非 RegionObject（T6.7：旧要素及其几何命令已删）
    }
    this.before = deepClone(target.shape);
    ctx.sceneManager.updateObject(this.objectId, {
      shape: deepClone(this.after),
    } as Partial<SceneObject>);
    this.emitSceneChanged(ctx);
    return true;
  }

  undo(ctx: CommandContext): void {
    if (!this.before) return;
    ctx.sceneManager.updateObject(this.objectId, {
      shape: deepClone(this.before),
    } as Partial<SceneObject>);
    this.emitSceneChanged(ctx);
  }

  redo(ctx: CommandContext): void {
    ctx.sceneManager.updateObject(this.objectId, {
      shape: deepClone(this.after),
    } as Partial<SceneObject>);
    this.emitSceneChanged(ctx);
  }
}
