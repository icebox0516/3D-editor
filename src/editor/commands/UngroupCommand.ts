/**
 * editor/commands/UngroupCommand —— 解散组命令（T8.5）。
 *
 * 职责：解散给定的组壳——
 *   - 仅删组节点、成员上提父级（不删成员；成员世界变换与图层归属原样保留）；
 *   - 直接子级（含子组）整体上提到组的父级、插在组的原兄弟位（数组顺序 = 搬移后
 *     森林前序，孙辈层级随父保持）；
 *   - 多组批量解散并一条历史；空组解散 = 仅删节点；
 *   - execute 成功后选中上提后的直接成员（UE 文件夹删除后成员保留语义 + 后续批量
 *     操作入口）。
 * 边界：清单中的非组对象跳过（全部非组 execute false 零副作用）；undo 同 id 复原
 *      组壳（深拷贝快照）、成员 parentId 与数组顺序；幂等重放不抛错；零 THREE。
 */
import { deepClone } from '../../core/utils';
import type { ID } from '../../core/types';
import type { SceneObject } from '../../scene/SceneObject';
import { isGroupObject } from '../../scene/GroupObject';
import {
  buildHierarchyForest,
  detachSubtreeNode,
  flattenHierarchyIds,
  insertChildNodesAt,
  siblingIndexOf,
} from '../../scene/hierarchy';
import { CommandBase } from './Command';
import type { CommandContext } from './CommandContext';

/** 上提记账：直接子级 id + 前后 parentId（before = 组 id，after = 组的父级） */
interface LiftRecord {
  id: ID;
  before: ID;
  after: ID | null;
}

export class UngroupCommand extends CommandBase {
  readonly name = 'UngroupCommand';
  private readonly groupIds: readonly ID[];

  /** before 记账（execute 成功时捕获） */
  private snapshots: SceneObject[] | null = null;
  private beforeIds: ID[] | null = null;
  private lifted: LiftRecord[] | null = null;
  private afterIds: ID[] | null = null;

  constructor(groupIds: readonly ID[]) {
    super();
    this.groupIds = [...groupIds];
  }

  canExecute(): boolean {
    return this.groupIds.length > 0; // 组存在性与类型在 execute 判定
  }

  execute(ctx: CommandContext): boolean {
    // 解析存活组壳（去重、保持入参序；非组对象跳过）
    const groups: SceneObject[] = [];
    const seen = new Set<ID>();
    for (const id of this.groupIds) {
      if (seen.has(id)) continue;
      const obj = ctx.sceneManager.getObject(id);
      if (obj !== undefined && isGroupObject(obj)) {
        seen.add(id);
        groups.push(obj);
      }
    }
    if (groups.length === 0) return false;

    const objects = ctx.sceneManager.getObjects();
    const forest = buildHierarchyForest(objects);
    const lifted: LiftRecord[] = [];

    for (const group of groups) {
      const slot = siblingIndexOf(forest, group.id);
      const node = detachSubtreeNode(forest, group.id);
      if (node === null || slot < 0) continue; // 防御：森林中找不到（不应发生）
      // 直接子级上提到组的父级、插在组原兄弟位（前序上 = 组整棵子树去掉组壳本身）
      const kids = [...node.children];
      insertChildNodesAt(forest, group.parentId, slot, kids);
      for (const kid of kids) {
        lifted.push({ id: kid.obj.id, before: group.id, after: group.parentId });
      }
    }

    const beforeIds = objects.map((o) => o.id);
    const afterIds = flattenHierarchyIds(forest);

    // 落盘：删组壳（清选中）→ 成员 parentId 上提 → 数组重排
    for (const group of groups) {
      ctx.sceneManager.removeObject(group.id);
      this.deselectIfSelected(ctx, group.id);
    }
    for (const lift of lifted) {
      ctx.sceneManager.updateObject(lift.id, { parentId: lift.after });
    }
    ctx.sceneManager.reorderObjects(afterIds);

    this.snapshots = groups.map((g) => deepClone(g));
    this.beforeIds = beforeIds;
    this.lifted = lifted;
    this.afterIds = afterIds;

    const liftedAlive = lifted
      .map((l) => l.id)
      .filter((id) => ctx.sceneManager.getObject(id) !== undefined);
    if (liftedAlive.length > 0) {
      ctx.selection.selectMany(liftedAlive); // 解散后选上提成员（空组解散则维持原选中）
    }
    this.emitSceneChanged(ctx);
    return true;
  }

  undo(ctx: CommandContext): void {
    if (this.snapshots === null || this.beforeIds === null || this.lifted === null) return;
    for (const snapshot of this.snapshots) {
      if (ctx.sceneManager.getObject(snapshot.id) === undefined) {
        ctx.sceneManager.addObject(deepClone(snapshot)); // 同 id 恢复
      }
    }
    for (const lift of this.lifted) {
      ctx.sceneManager.updateObject(lift.id, { parentId: lift.before });
    }
    ctx.sceneManager.reorderObjects(this.beforeIds);
    this.emitSceneChanged(ctx);
  }

  redo(ctx: CommandContext): void {
    if (this.snapshots === null || this.afterIds === null || this.lifted === null) return;
    for (const snapshot of this.snapshots) {
      ctx.sceneManager.removeObject(snapshot.id); // 不存在时静默（幂等重放）
      this.deselectIfSelected(ctx, snapshot.id);
    }
    for (const lift of this.lifted) {
      ctx.sceneManager.updateObject(lift.id, { parentId: lift.after });
    }
    ctx.sceneManager.reorderObjects(this.afterIds);
    this.emitSceneChanged(ctx);
  }
}
