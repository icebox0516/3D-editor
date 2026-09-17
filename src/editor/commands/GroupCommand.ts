/**
 * editor/commands/GroupCommand —— 建组命令（T8.5）。
 *
 * 职责：把一组选中对象收编为新组壳的直接子级——
 *   - 组壳经 groupFactory 构建（transform 恒等 / layerId null / id 前缀 group_），
 *     构造时一次成型、execute/undo/redo 同 id 重放；
 *   - 组落位：全部成员同父（含同为根级）→ 组落该父级下、插在首成员（数组序最前的
 *     成员）原位；成员来自不同父级 → 组落根级；
 *   - 成员迁入不改世界变换（组为纯组织节点，组壳恒等变换；成员 transform 原样保留）；
 *   - 成员各自整棵子树随迁（成员本身是组时其子孙保持挂靠）；
 *   - 数组顺序 = 搬移后森林前序（组插在首成员原位，成员按入参序紧随其后），
 *     经 SceneManager.reorderObjects 落盘（同父兄弟序 = 数组序语义）；
 *   - execute 成功后选中新组壳（链式 Ctrl+Shift+G 解散 / 右键「选中组内对象」入口）。
 * 边界：单条历史（含批量成员）；成员缺失（已删除）静默剔除，全部缺失 execute false
 *      零副作用；undo 复原成员 parentId、组节点与数组顺序；幂等重放不抛错；零 THREE。
 */
import { deepClone } from '../../core/utils';
import type { ID } from '../../core/types';
import type { GroupObject } from '../../scene/GroupObject';
import {
  appendChildNode,
  buildHierarchyForest,
  childrenIndexOf,
  detachSubtreeNode,
  flattenHierarchyIds,
  insertChildNodesAt,
} from '../../scene/hierarchy';
import type { HierarchyNode } from '../../scene/hierarchy';
import { createGroupObject } from '../factories/groupFactory';
import { CommandBase } from './Command';
import type { CommandContext } from './CommandContext';

export class GroupCommand extends CommandBase {
  readonly name = 'GroupCommand';
  private readonly memberIds: readonly ID[];
  /** 组壳构建快照（构造时成型；execute/redo 以深拷贝入场景，命令存续期内不受外部修改影响） */
  private readonly groupSnapshot: GroupObject;

  /** before 记账（execute 成功时捕获；未执行过为 null） */
  private before: { ids: ID[]; parents: Array<{ id: ID; parentId: ID | null }> } | null = null;
  /** after 记账（新数组顺序；成员 parentId 一律指向组壳 id） */
  private afterIds: ID[] | null = null;

  constructor(memberIds: readonly ID[], name?: string) {
    super();
    this.memberIds = [...memberIds];
    this.groupSnapshot = createGroupObject({ name });
  }

  canExecute(): boolean {
    return this.memberIds.length > 0; // 空清单无语义（成员存在性在 execute 判定）
  }

  execute(ctx: CommandContext): boolean {
    // 解析存活成员（去重、保持入参序）
    const memberIds: ID[] = [];
    const memberSet = new Set<ID>();
    for (const id of this.memberIds) {
      if (memberSet.has(id)) continue;
      if (ctx.sceneManager.getObject(id) !== undefined) {
        memberIds.push(id);
        memberSet.add(id);
      }
    }
    if (memberIds.length === 0) return false;

    const objects = ctx.sceneManager.getObjects();

    // 组落位父级：全部成员同父（含同为 null）→ 该父级；否则根级
    let commonParent: ID | null = null;
    {
      const first = ctx.sceneManager.getObject(memberIds[0]!)!;
      commonParent = first.parentId;
      for (const id of memberIds) {
        if (ctx.sceneManager.getObject(id)!.parentId !== commonParent) {
          commonParent = null;
          break;
        }
      }
    }

    // 新数组顺序：森林搬移（摘成员子树 → 组节点收编 → 插到首成员原兄弟位）
    const forest = buildHierarchyForest(objects);
    const siblings = childrenIndexOf(objects).get(commonParent) ?? [];
    const firstMemberSlot = siblings.findIndex((o) => memberSet.has(o.id));
    const collected: HierarchyNode[] = [];
    for (const id of memberIds) {
      const node = detachSubtreeNode(forest, id);
      if (node !== null) collected.push(node);
    }
    if (collected.length === 0) return false; // 防御：森林中找不到任何成员
    const groupNode: HierarchyNode = { obj: this.groupSnapshot, depth: 0, children: collected };
    if (firstMemberSlot >= 0) {
      insertChildNodesAt(forest, commonParent, firstMemberSlot, [groupNode]);
    } else {
      appendChildNode(forest, commonParent, groupNode);
    }

    const beforeIds = objects.map((o) => o.id);
    const beforeParents = memberIds.map((id) => ({
      id,
      parentId: ctx.sceneManager.getObject(id)!.parentId,
    }));
    const afterIds = flattenHierarchyIds(forest);

    // 组壳落位父级（构造缺省根级；execute 依成员共同父级覆写——id 不变，undo/redo
    // 深拷贝重放时 parentId 已固化在快照上）
    this.groupSnapshot.parentId = commonParent;

    // 落盘：成员 parentId → 组壳；组壳入场景；数组重排
    for (const id of memberIds) {
      ctx.sceneManager.updateObject(id, { parentId: this.groupSnapshot.id });
    }
    ctx.sceneManager.addObject(deepClone(this.groupSnapshot));
    ctx.sceneManager.reorderObjects(afterIds);

    this.before = { ids: beforeIds, parents: beforeParents };
    this.afterIds = afterIds;

    ctx.selection.select(this.groupSnapshot.id); // 建组后选中新组壳（链式解散入口）
    this.emitSceneChanged(ctx);
    return true;
  }

  undo(ctx: CommandContext): void {
    if (this.before === null || this.afterIds === null) return; // 从未成功执行过
    ctx.sceneManager.removeObject(this.groupSnapshot.id); // 不存在时静默（幂等重放）
    this.deselectIfSelected(ctx, this.groupSnapshot.id);
    for (const { id, parentId } of this.before.parents) {
      ctx.sceneManager.updateObject(id, { parentId });
    }
    ctx.sceneManager.reorderObjects(this.before.ids);
    this.emitSceneChanged(ctx);
  }

  redo(ctx: CommandContext): void {
    if (this.before === null || this.afterIds === null) return;
    if (ctx.sceneManager.getObject(this.groupSnapshot.id) === undefined) {
      ctx.sceneManager.addObject(deepClone(this.groupSnapshot));
    }
    for (const { id } of this.before.parents) {
      ctx.sceneManager.updateObject(id, { parentId: this.groupSnapshot.id });
    }
    ctx.sceneManager.reorderObjects(this.afterIds);
    this.emitSceneChanged(ctx);
  }
}
