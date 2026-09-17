/**
 * editor/commands/SplitRoadCommand —— 道路分割命令（T7.6 R4）。
 *
 * 职责：把单条 road line region 在指定内部顶点处一分为二——原对象 shape.points
 *      ← points[0..i]（前段），新建副本（deepClone + region_ 前缀新 id + points[i..end]
 *      后段 + 名称 `${原名} 2`），transform/semantic/style/layerId 保留；单命令单历史
 *      （BatchCommand 语义不适用，任务书裁定）。
 * 边界：execute 以 live 场景为准（切分点列校验归 domain splitRoadPoints）；新对象 id
 *      在构造时生成一次（redo 稳定）；undo = 删副本 + 还原原 shape；redo 幂等重放
 *      （沿 CreateObject/ChangeShape 语义先例）；目标非 region/非 line 或 index 非法
 *      → execute false 零副作用；line 点列不涉 transform 换算（分割不改 position）。
 */
import { createId } from '../../core/id';
import type { ID } from '../../core/types';
import { deepClone } from '../../core/utils';
import { isRegionObject, splitRoadPoints } from '../../domain/regions';
import type { RegionObject, RegionShape } from '../../domain/regions';
import type { SceneObject } from '../../scene/SceneObject';
import { CommandBase } from './Command';
import type { CommandContext } from './CommandContext';

export class SplitRoadCommand extends CommandBase {
  readonly name = 'SplitRoadCommand';
  private readonly objectId: ID;
  private readonly splitIndex: number;
  /** 副本 id：构造时生成一次（redo 重放稳定） */
  readonly createdId: ID = createId('region_');
  private beforeShape: RegionShape | null = null;
  private afterShape: RegionShape | null = null;
  private copySnapshot: RegionObject | null = null;

  constructor(objectId: ID, splitIndex: number) {
    super();
    this.objectId = objectId;
    this.splitIndex = splitIndex;
  }

  canExecute(): boolean {
    return Number.isInteger(this.splitIndex) && this.splitIndex >= 1;
  }

  execute(ctx: CommandContext): boolean {
    const target = ctx.sceneManager.getObject(this.objectId);
    if (!target || !isRegionObject(target) || target.shape.type !== 'line') return false;
    const parts = splitRoadPoints(target.shape.points, this.splitIndex);
    if (!parts) return false;
    if (ctx.sceneManager.getObject(this.createdId) !== undefined) return false; // id 冲突防半执行

    this.beforeShape = deepClone(target.shape);
    this.afterShape = { ...deepClone(target.shape), points: parts.first };

    const copy = deepClone(target) as RegionObject;
    copy.id = this.createdId;
    copy.shape = { ...deepClone(target.shape), points: parts.second };
    copy.name = `${target.name} 2`;
    this.copySnapshot = deepClone(copy);

    ctx.sceneManager.updateObject(this.objectId, {
      shape: deepClone(this.afterShape),
    } as Partial<SceneObject>);
    ctx.sceneManager.addObject(deepClone(copy));
    this.emitSceneChanged(ctx);
    return true;
  }

  undo(ctx: CommandContext): void {
    if (!this.beforeShape || !this.copySnapshot) return;
    ctx.sceneManager.removeObject(this.createdId);
    this.deselectIfSelected(ctx, this.createdId);
    ctx.sceneManager.updateObject(this.objectId, {
      shape: deepClone(this.beforeShape),
    } as Partial<SceneObject>);
    this.emitSceneChanged(ctx);
  }

  redo(ctx: CommandContext): void {
    if (!this.afterShape || !this.copySnapshot) return;
    if (ctx.sceneManager.getObject(this.createdId) === undefined) {
      ctx.sceneManager.addObject(deepClone(this.copySnapshot));
    }
    ctx.sceneManager.updateObject(this.objectId, {
      shape: deepClone(this.afterShape),
    } as Partial<SceneObject>);
    this.emitSceneChanged(ctx);
  }
}
