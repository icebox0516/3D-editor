/**
 * editor/commands/MergeRoadCommand —— 道路合并命令（T7.6 R5）。
 *
 * 职责：把两条端点相邻（距离 ≤ 0.5m，domain detectRoadAdjacency）的 road line region
 *      合并为一条——四种邻接情形按序拼接（end-start / end-end / start-start / start-end），
 *      丢弃第二段共享端点；结果写入 first（保留 first 的 id/名称/图层/语义/样式），
 *      删除 second；单命令单历史。
 * 边界：execute 以 live 场景为准；邻接判定在世界坐标（points + transform.position
 *      x/z 偏移）上进行，合并点列写回 first 时换算回 first 局部坐标（两段 position
 *      不同也正确拼接）；undo 还原 first shape + 重加 second（execute 时深拷贝快照，
 *      含其图层/位置原样）；redo 幂等重放；非邻接 / 同 id / 非 line → execute false
 *      零副作用。
 */
import type { ID } from '../../core/types';
import { deepClone } from '../../core/utils';
import { detectRoadAdjacency, isRegionObject, mergeRoadPoints } from '../../domain/regions';
import type { RegionObject, RegionShape } from '../../domain/regions';
import type { SceneObject } from '../../scene/SceneObject';
import { CommandBase } from './Command';
import type { CommandContext } from './CommandContext';

export class MergeRoadCommand extends CommandBase {
  readonly name = 'MergeRoadCommand';
  private readonly firstId: ID;
  private readonly secondId: ID;
  private beforeFirstShape: RegionShape | null = null;
  private mergedShape: RegionShape | null = null;
  private secondSnapshot: RegionObject | null = null;

  constructor(firstId: ID, secondId: ID) {
    super();
    this.firstId = firstId;
    this.secondId = secondId;
  }

  canExecute(): boolean {
    return this.firstId !== this.secondId;
  }

  execute(ctx: CommandContext): boolean {
    if (this.firstId === this.secondId) return false;
    const first = ctx.sceneManager.getObject(this.firstId);
    const second = ctx.sceneManager.getObject(this.secondId);
    if (!first || !second || !isRegionObject(first) || !isRegionObject(second)) return false;
    if (first.shape.type !== 'line' || second.shape.type !== 'line') return false;

    // 世界坐标端点（points + position x/z 偏移）
    const fa = { x: first.transform.position.x, z: first.transform.position.z };
    const fb = { x: second.transform.position.x, z: second.transform.position.z };
    const aWorld = first.shape.points.map((p) => ({ x: p.x + fa.x, y: p.y + fa.z }));
    const bWorld = second.shape.points.map((p) => ({ x: p.x + fb.x, y: p.y + fb.z }));

    const adjacency = detectRoadAdjacency(aWorld, bWorld);
    if (!adjacency) return false; // 非邻接：保持场景原状

    const mergedWorld = mergeRoadPoints(aWorld, bWorld, adjacency.case);
    this.beforeFirstShape = deepClone(first.shape);
    this.mergedShape = {
      ...deepClone(first.shape),
      points: mergedWorld.map((p) => ({ x: p.x - fa.x, y: p.y - fa.z })), // 换回 first 局部
    };
    this.secondSnapshot = deepClone(second);

    ctx.sceneManager.updateObject(this.firstId, {
      shape: deepClone(this.mergedShape),
    } as Partial<SceneObject>);
    ctx.sceneManager.removeObject(this.secondId);
    this.deselectIfSelected(ctx, this.secondId);
    this.emitSceneChanged(ctx);
    return true;
  }

  undo(ctx: CommandContext): void {
    if (!this.beforeFirstShape || !this.secondSnapshot) return;
    if (ctx.sceneManager.getObject(this.secondId) === undefined) {
      ctx.sceneManager.addObject(deepClone(this.secondSnapshot));
    }
    ctx.sceneManager.updateObject(this.firstId, {
      shape: deepClone(this.beforeFirstShape),
    } as Partial<SceneObject>);
    this.emitSceneChanged(ctx);
  }

  redo(ctx: CommandContext): void {
    if (!this.mergedShape || !this.secondSnapshot) return;
    ctx.sceneManager.removeObject(this.secondId); // 不存在时静默（幂等重放）
    this.deselectIfSelected(ctx, this.secondId);
    ctx.sceneManager.updateObject(this.firstId, {
      shape: deepClone(this.mergedShape),
    } as Partial<SceneObject>);
    this.emitSceneChanged(ctx);
  }
}
