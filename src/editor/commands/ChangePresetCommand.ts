/**
 * editor/commands/ChangePresetCommand —— RegionObject 样式层修改命令（阶段 6 T6.1）。
 *
 * 职责：整体替换 RegionObject 的 style（RegionStyle：presetId + overrides）——预设切换与
 *      覆写参数变更同承载；每次成功应用广播 style:changed + scene:changed（沿 v1 样式命令
 *      先例，渲染侧据此 dispose+create 新实例，几何复用）。
 * 边界：只改 style 引用数据，不触碰 shape/semantic/transform（三层解耦，分域契约 §A）；
 *      目标必须是 RegionObject（isRegionObject 守卫），否则 execute 返回 false（T6.7：
 *      v1 样式命令已删，非 RegionObject 无样式通道）；快照深拷贝；undo/redo 幂等。
 *      presetId 为样式插件注册键（如 'water.flow'），存在性由 runtime 样式引擎在消费时校验
 *      （失败降级 default_solid，§C），本命令不做注册表前置检查。
 */
import { deepClone } from '../../core/utils';
import type { ID } from '../../core/types';
import { isRegionObject } from '../../domain/regions';
import type { RegionStyle } from '../../domain/regions';
import type { SceneObject } from '../../scene/SceneObject';
import { CommandBase } from './Command';
import type { CommandContext } from './CommandContext';

export class ChangePresetCommand extends CommandBase {
  readonly name = 'ChangePresetCommand';
  private readonly objectId: ID;
  private readonly after: RegionStyle;
  private before: RegionStyle | null = null;

  constructor(objectId: ID, style: RegionStyle) {
    super();
    this.objectId = objectId;
    this.after = deepClone(style);
  }

  canExecute(): boolean {
    // presetId 是样式插件的注册键，空串即无有效引用（存在性校验归 runtime 消费侧降级路径）
    return typeof this.after.presetId === 'string' && this.after.presetId !== '';
  }

  execute(ctx: CommandContext): boolean {
    const target = ctx.sceneManager.getObject(this.objectId);
    if (!target || !isRegionObject(target)) {
      return false; // 对象不存在，或非 RegionObject（T6.7：旧要素及其样式命令已删）
    }
    this.before = deepClone(target.style);
    ctx.sceneManager.updateObject(this.objectId, {
      style: deepClone(this.after),
    } as Partial<SceneObject>);
    ctx.eventBus.emit('style:changed', { objectId: this.objectId });
    this.emitSceneChanged(ctx);
    return true;
  }

  undo(ctx: CommandContext): void {
    if (!this.before) return;
    ctx.sceneManager.updateObject(this.objectId, {
      style: deepClone(this.before),
    } as Partial<SceneObject>);
    ctx.eventBus.emit('style:changed', { objectId: this.objectId });
    this.emitSceneChanged(ctx);
  }

  redo(ctx: CommandContext): void {
    ctx.sceneManager.updateObject(this.objectId, {
      style: deepClone(this.after),
    } as Partial<SceneObject>);
    ctx.eventBus.emit('style:changed', { objectId: this.objectId });
    this.emitSceneChanged(ctx);
  }
}
