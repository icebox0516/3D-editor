/**
 * editor/commands/MergeLayerCommand —— 图层合并命令（T8.3 §4）。
 *
 * 职责：把源图层全部成员迁移到目标图层并删除源图层，**一条可撤销历史**——
 *      execute = 成员迁移（逐对象 layerId 改写，SceneManager 自动维护派生索引）
 *      + removeLayer(源)；undo = addLayer(源快照复活——name/order/visible/locked/
 *      opacity 与成员索引全保留) + 成员回迁；redo = 再次执行（快照重取，对已失效
 *      状态幂等）。空图层合并 = 等价删除（零成员迁移，undo 复活空层）。
 * 边界：目标弹层排除源自身与「未分类」哨兵（layerId===null 不在面板、天然不可作
 *      源/目标）由 UI 层保证；本命令只校验 source !== target 与两图层存在性；
 *      图层其余删除路径（SceneManager 直调不可撤销）为 T5.3 既有授权语义，不在此改。
 */
import type { ID } from '../../core/types';
import type { Layer } from '../../scene/Layer';
import { CommandBase } from './Command';
import type { CommandContext } from './CommandContext';

export class MergeLayerCommand extends CommandBase {
  readonly name = 'MergeLayerCommand';
  private readonly sourceId: ID;
  private readonly targetId: ID;
  /** 源图层快照（execute 时深拷贝；undo 复活用） */
  private sourceSnapshot: Layer | null = null;
  /** 迁移成员（execute 时场景中实际存在的对象 id，场景序；undo 回迁） */
  private memberIds: ID[] = [];
  private executed = false;

  constructor(sourceLayerId: ID, targetLayerId: ID) {
    super();
    this.sourceId = sourceLayerId;
    this.targetId = targetLayerId;
  }

  canExecute(): boolean {
    return this.sourceId !== this.targetId;
  }

  execute(ctx: CommandContext): boolean {
    if (!this.canExecute()) return false;
    const source = ctx.sceneManager.getLayer(this.sourceId);
    const target = ctx.sceneManager.getLayer(this.targetId);
    if (!source || !target) return false;

    // 快照源层（深拷贝成员索引——undo 复活的完整 Layer）
    this.sourceSnapshot = { ...source, objectIds: [...source.objectIds] };
    // 迁移成员以场景实际对象为准（layerId === 源），派生索引可能滞后于外部构造
    this.memberIds = ctx.sceneManager
      .getObjects((o) => o.layerId === this.sourceId)
      .map((o) => o.id);
    for (const id of this.memberIds) {
      ctx.sceneManager.updateObject(id, { layerId: this.targetId });
    }
    const removed = ctx.sceneManager.removeLayer(this.sourceId);
    if (!removed) return false;
    this.executed = true;
    this.emitSceneChanged(ctx);
    return true;
  }

  undo(ctx: CommandContext): void {
    if (!this.executed || !this.sourceSnapshot) return;
    // 复活源层（快照原样；addLayer 回填已指向该图层的对象——此时成员尚在目标层，
    // 快照 objectIds 承载原索引，回迁时 moveLayerMembership 去重合并后恰为原集）
    if (ctx.sceneManager.getLayer(this.sourceId) === undefined) {
      ctx.sceneManager.addLayer({ ...this.sourceSnapshot, objectIds: [...this.sourceSnapshot.objectIds] });
    }
    // 成员回迁（updateObject 静默跳过已删除对象——幂等）
    for (const id of this.memberIds) {
      ctx.sceneManager.updateObject(id, { layerId: this.sourceId });
    }
    this.emitSceneChanged(ctx);
  }

  redo(ctx: CommandContext): void {
    // 重放 execute：快照与成员重取（undo 已复活源层），对失效状态幂等
    this.execute(ctx);
  }
}
