/**
 * app/editorActionsCore —— 编辑动作共享核心（T5.2 自 app/input 抽取）。
 *
 * 职责：剪贴板（内部快照）/ 删除 / 全选 / 取消选择等「菜单与键盘快捷键共需」的
 *      编辑动作单一实现——InputController（快捷键）与 createEditorActions（主菜单
 *      路由）共用同一实例，剪贴板互通；行为与 T2.4 input.ts 私有实现逐条等价
 *      （tests/app/input.shortcuts.test.ts 守护回归）。
 *      - 删除选中：每对象一条 DeleteObjectCommand，多个经 BatchCommand 合并为一条历史；
 *      - 复制：剪贴板存对象深拷贝快照（零命令、不落系统剪贴板）；
 *      - 粘贴：快照换新 id、位置偏移 +1 m（X/Z），经 CreateObjectCommand 一条历史，
 *        完成后选中新副本；连续粘贴从原始快照偏移（幂等）；
 *      - 全选：选中全部「未锁定」对象（对象自身 locked 或所属图层 locked 均排除，
 *        与 SelectTool 点击/框选的锁定语义一致）；取消选择 = 清空选中集；
 *      - 贴地（T8.1）：选中对象 y 落到下方最近高度候选层（地面 0 + 其余对象底/顶面
 *        派生层，domain 纯函数与 gizmo 高度吸附同源）；多对象一条 BatchCommand；
 *      - 分组/解散组（T8.5）：Ctrl+G / Ctrl+Shift+G 与右键菜单 ctx.group / ctx.ungroup
 *        共用的动作核心——建组 = 选中对象收编新组壳（组名自动去重编号）、解散 = 选中
 *        集中的组壳批量成员上提，各一条可撤销历史；空选/无组可解散安全 no-op。
 * 边界：app 层组合根件；零 DOM / 零 THREE；剪贴板为内存态（不入历史）。
 *      subscribe 供 UI（菜单 enabled 的 hasClipboard 位）感知剪贴板空/非空变化。
 */
import { BatchCommand } from '../editor/commands/BatchCommand';
import { CreateObjectCommand } from '../editor/commands/CreateObjectCommand';
import { DeleteObjectCommand } from '../editor/commands/DeleteObjectCommand';
import { GroupCommand } from '../editor/commands/GroupCommand';
import { TransformCommand } from '../editor/commands/TransformCommand';
import { UngroupCommand } from '../editor/commands/UngroupCommand';
import type { Command } from '../editor/commands/Command';
import type { HistoryManager } from '../editor/history/HistoryManager';
import { createId } from '../core/id';
import { deepClone } from '../core/utils';
import { isModelObject, MODEL_BASE_HEIGHT } from '../domain/assets';
import {
  baseLevelOf,
  collectElevationLevels,
  nearestLevelBelow,
} from '../domain/regions';
import { isGroupObject } from '../scene/GroupObject';
import type { SceneManager } from '../scene/SceneManager';
import type { SceneObject } from '../scene/SceneObject';
import type { SelectionManager } from '../scene/SelectionManager';

/** 依赖（由组合根装配；与 InputController 共享同一批实例） */
export interface EditorActionsCoreDeps {
  history: HistoryManager;
  sceneManager: SceneManager;
  selection: SelectionManager;
}

/** 复制/粘贴的位置偏移（米，X/Z 同加；T2.4 既有语义） */
export const PASTE_OFFSET_M = 1;

export class EditorActionsCore {
  private readonly deps: EditorActionsCoreDeps;
  /** 内部剪贴板：最近一次复制的对象深拷贝快照（不落系统剪贴板） */
  private clipboard: SceneObject[] = [];
  private readonly listeners = new Set<() => void>();

  constructor(deps: EditorActionsCoreDeps) {
    this.deps = deps;
  }

  /** 剪贴板变化通知（复制写入时触发；粘贴/删除不改剪贴板内容） */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  hasClipboard(): boolean {
    return this.clipboard.length > 0;
  }

  /** 删除选中对象：每对象一条 DeleteObjectCommand；多对象经 BatchCommand 合并为一条历史 */
  deleteSelection(): void {
    const ids = this.deps.selection.getSelectedIds();
    if (ids.length === 0) return;

    const commands: Command[] = [];
    for (const id of ids) {
      if (this.deps.sceneManager.getObject(id) !== undefined) {
        commands.push(new DeleteObjectCommand(id));
      }
    }
    if (commands.length === 0) return;

    this.deps.history.execute(
      commands.length === 1 ? commands[0] : new BatchCommand(commands),
    );
  }

  /** 复制选中：内部剪贴板存对象深拷贝快照（零命令、零场景变化） */
  copySelection(): void {
    this.clipboard = this.deps.selection
      .getSelectedIds()
      .map((id) => this.deps.sceneManager.getObject(id))
      .filter((obj): obj is SceneObject => obj !== undefined)
      .map((obj) => deepClone(obj));
    for (const listener of this.listeners) listener();
  }

  /** 粘贴：剪贴板快照换新 id、位置偏移 +1 m，经命令入场景（一条历史），选中新对象 */
  pasteClipboard(): void {
    if (this.clipboard.length === 0) return;
    const created = this.createCopies(this.clipboard);
    if (created.length > 0) this.deps.selection.selectMany(created.map((o) => o.id));
  }

  /** 原地复制选中（Ctrl+D 语义）：等价复制 + 粘贴一步（偏移 1 m） */
  duplicateSelection(): void {
    if (this.deps.selection.getSelectedIds().length === 0) return;
    this.copySelection();
    this.pasteClipboard();
  }

  /** 剪切（编辑菜单）：复制快照 + 删除原对象（一条删除历史） */
  cutSelection(): void {
    this.copySelection();
    this.deleteSelection();
  }

  /** 全选：选中全部未锁定对象（自身或所属图层锁定均排除——与 SelectTool 语义一致） */
  selectAll(): void {
    const ids = this.deps.sceneManager
      .getObjects()
      .filter((obj) => !this.isLocked(obj))
      .map((obj) => obj.id);
    this.deps.selection.selectMany(ids);
  }

  /** 取消选择：清空选中集 */
  deselectAll(): void {
    this.deps.selection.clear();
  }

  /**
   * 贴地（T8.1 R5，右键菜单 + End 键）：选中对象 y 落到下方最近高度候选层——
   * 候选 = 地面 0 + 其余对象底/顶面派生层（domain/regions/elevationLevels 纯函数，
   * 与 gizmo 高度吸附同一候选管线）；region 按「底面（baseHeight+position.y）归层」
   * 换算 position.y（分域契约 §A 高度合成）。逐对象一条 TransformCommand，
   * 多对象经 BatchCommand 合并为一条历史；零位移对象跳过（全部零位移不 execute）。
   * T9.2 承托层语义：模型落点 = 承托层 + MODEL_BASE_HEIGHT（模型底面永远比承托面高
   * lift——落地面 0 + lift、贴道路顶 0.06 + lift，不再与承托面精确共面）；region 不抬
   * （baseHeight 阶梯自带层序，仍精确贴附换算）；已在 lift 层的模型零位移不入历史。
   */
  dropSelectionToGround(): void {
    const ids = this.deps.selection.getSelectedIds();
    if (ids.length === 0) return;
    const levels = collectElevationLevels(this.deps.sceneManager.getObjects(), ids);
    const commands: Command[] = [];
    for (const id of ids) {
      const obj = this.deps.sceneManager.getObject(id);
      if (!obj) continue;
      const bottom = baseLevelOf(obj);
      const target = nearestLevelBelow(bottom, levels);
      const delta = target + (isModelObject(obj) ? MODEL_BASE_HEIGHT : 0) - bottom;
      if (delta === 0) continue; // 已贴地：零位移不入历史
      const after = deepClone(obj.transform);
      after.position.y += delta;
      commands.push(new TransformCommand(id, obj.transform, after));
    }
    if (commands.length === 0) return;
    this.deps.history.execute(
      commands.length === 1 ? commands[0] : new BatchCommand(commands),
    );
  }

  // ── 内部 ────────────────────────────────────────────────

  /**
   * 建组（T8.5 Ctrl+G / ctx.group）：选中对象收编为新组壳子级，一条可撤销历史；
   * 组名自动编号（「分组」「分组 2」…，避让既有对象名）；空选 no-op。
   */
  groupSelection(): void {
    const ids = this.deps.selection.getSelectedIds();
    if (ids.length === 0) return;
    const existing = new Set(this.deps.sceneManager.getObjects().map((o) => o.name));
    let n = 1;
    let name = '分组';
    while (existing.has(name)) {
      n += 1;
      name = `分组 ${n}`;
    }
    this.deps.history.execute(new GroupCommand(ids, name));
  }

  /**
   * 解散组（T8.5 Ctrl+Shift+G / ctx.ungroup）：选中集中的组壳批量解散（成员上提），
   * 一条可撤销历史；选中集无组壳（或对象已删除）no-op 零历史。
   */
  ungroupSelection(): void {
    const groupIds = this.deps.selection
      .getSelectedIds()
      .filter((id) => {
        const obj = this.deps.sceneManager.getObject(id);
        return obj !== undefined && isGroupObject(obj);
      });
    if (groupIds.length === 0) return;
    this.deps.history.execute(new UngroupCommand(groupIds));
  }

  /** 由快照生成偏移副本并经命令入场景（一条历史），返回成功创建的副本（失败为空） */
  private createCopies(source: readonly SceneObject[]): SceneObject[] {
    const copies = source.map((snapshot) => offsetClone(snapshot));
    const commands = copies.map((copy) => new CreateObjectCommand(copy));
    const batch = commands.length === 1 ? commands[0] : new BatchCommand(commands);
    return this.deps.history.execute(batch) ? copies : [];
  }

  /** 对象锁定 = 自身 locked ∨ 所属图层 locked（无图层视为未锁） */
  private isLocked(obj: SceneObject): boolean {
    if (obj.locked) return true;
    if (obj.layerId === null) return false;
    return this.deps.sceneManager.getLayer(obj.layerId)?.locked === true;
  }
}

/** 对象快照 → 偏移副本（新 id 沿用原 id 前缀；位置 +1 m；其余字段深拷贝保持） */
function offsetClone(snapshot: SceneObject): SceneObject {
  const copy = deepClone(snapshot);
  const prefixMatch = /^([a-z]+)_/.exec(snapshot.id);
  copy.id = createId(prefixMatch ? `${prefixMatch[1]}_` : 'element_');
  copy.transform.position = {
    ...copy.transform.position,
    x: copy.transform.position.x + PASTE_OFFSET_M,
    z: copy.transform.position.z + PASTE_OFFSET_M,
  };
  return copy;
}
