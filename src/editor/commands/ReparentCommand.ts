/**
 * editor/commands/ReparentCommand —— 换父/同层排序命令（T8.5 拖拽落点的统一载体）。
 *
 * 落点三形态（Outliner drop indicator 三态同源）：
 *   - into：挂入目标组（parentId = 目标组 id；parentId null = 上提根级，落根级末尾）；
 *     目标必须存在且为组壳（挂入非组 = 非法落点，UI 层已拦，命令层再守一道）；
 *   - before / after：同层插入排序——作为锚点的兄弟插到其前/后（after 在前序上 =
 *     锚点整棵子树之后）；新父级隐式取锚点 parentId；
 *   - 环检测：into 目标为自身或自身后代、before/after 锚点在自身子树内 → execute
 *     false 零副作用（树形无环不变式）。
 * 顺序语义：数组顺序 = 搬移后森林前序（同父兄弟序 = 数组序）；整棵子树随迁。
 * 边界：无变化（parentId 与数组顺序均不变）execute false 不入历史；对象/锚点不存在
 *      false；undo/redo 复原 parentId 与数组顺序；幂等重放不抛错；零 THREE。
 */
import type { ID } from '../../core/types';
import { isGroupObject } from '../../scene/GroupObject';
import {
  appendChildNode,
  buildHierarchyForest,
  descendantsOf,
  detachSubtreeNode,
  flattenHierarchyIds,
  insertSiblingNode,
} from '../../scene/hierarchy';
import { CommandBase } from './Command';
import type { CommandContext } from './CommandContext';

/** 拖拽落点（与 ui/panels/hierarchyModel 的 drop zone 三态同构） */
export type ReparentTarget =
  | { kind: 'into'; parentId: ID | null }
  | { kind: 'before'; anchorId: ID }
  | { kind: 'after'; anchorId: ID };

export class ReparentCommand extends CommandBase {
  readonly name = 'ReparentCommand';
  private readonly objectId: ID;
  private readonly target: ReparentTarget;

  /** before/after 记账（execute 成功时捕获） */
  private before: { parentId: ID | null; ids: ID[] } | null = null;
  private after: { parentId: ID | null; ids: ID[] } | null = null;

  constructor(objectId: ID, target: ReparentTarget) {
    super();
    this.objectId = objectId;
    this.target = target;
  }

  canExecute(): boolean {
    return true; // 目标与落点合法性在 execute 时判定（含环检测）
  }

  execute(ctx: CommandContext): boolean {
    const objects = ctx.sceneManager.getObjects();
    const obj = ctx.sceneManager.getObject(this.objectId);
    if (!obj) return false;
    const beforeParentId = obj.parentId; // 活引用，先取值防 updateObject 后读不到 before

    const forest = buildHierarchyForest(objects);
    const node = detachSubtreeNode(forest, this.objectId);
    if (node === null) return false;

    let newParentId: ID | null;
    if (this.target.kind === 'into') {
      const parentId = this.target.parentId;
      if (parentId !== null) {
        const parent = ctx.sceneManager.getObject(parentId);
        if (parent === undefined || !isGroupObject(parent)) return false; // 挂入目标必须是组壳
        if (parentId === this.objectId) return false; // 挂到自身
        if (descendantsOf(objects, this.objectId).has(parentId)) return false; // 挂到自身后代（环）
      }
      appendChildNode(forest, parentId, node);
      newParentId = parentId;
    } else {
      const anchorId = this.target.anchorId;
      if (anchorId === this.objectId) return false; // 锚点即自身（无语义落点）
      const anchor = ctx.sceneManager.getObject(anchorId);
      if (anchor === undefined) return false;
      if (descendantsOf(objects, this.objectId).has(anchorId)) return false; // 锚点在自身子树内（环）
      if (!insertSiblingNode(forest, anchorId, node, this.target.kind)) return false;
      newParentId = anchor.parentId; // 同层排序：新父级隐式取锚点父级
    }

    const beforeIds = objects.map((o) => o.id);
    const afterIds = flattenHierarchyIds(forest);
    const orderChanged =
      beforeIds.length !== afterIds.length || beforeIds.some((id, i) => id !== afterIds[i]);
    if (beforeParentId === newParentId && !orderChanged) return false; // 无变化 no-op 不入历史

    if (beforeParentId !== newParentId) {
      ctx.sceneManager.updateObject(this.objectId, { parentId: newParentId });
    }
    ctx.sceneManager.reorderObjects(afterIds);

    this.before = { parentId: beforeParentId, ids: beforeIds };
    this.after = { parentId: newParentId, ids: afterIds };
    this.emitSceneChanged(ctx);
    return true;
  }

  undo(ctx: CommandContext): void {
    if (this.before === null) return;
    ctx.sceneManager.updateObject(this.objectId, { parentId: this.before.parentId });
    ctx.sceneManager.reorderObjects(this.before.ids);
    this.emitSceneChanged(ctx);
  }

  redo(ctx: CommandContext): void {
    if (this.after === null) return;
    ctx.sceneManager.updateObject(this.objectId, { parentId: this.after.parentId });
    ctx.sceneManager.reorderObjects(this.after.ids);
    this.emitSceneChanged(ctx);
  }
}
