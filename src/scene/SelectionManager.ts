/**
 * scene/SelectionManager —— 当前选中对象 ID 集合的管理者。
 *
 * 职责：维护选中列表（select/add/remove/selectMany/clear），查询（getSelectedIds/isSelected），
 *      选择集实际发生变化时经 EventBus 广播 selection:changed（负载为选中 ID 的副本数组）。
 * 边界：只管理 ID 序列，不持有对象引用、不校验 ID 是否存在于场景、不与渲染关联；
 *      无变化（重复 select、add 已选、remove 未选、空 clear）不发出事件。
 */
import type { EventBus } from '../core/events/EventBus';
import type { ID } from '../core/types';

export class SelectionManager {
  private readonly eventBus: EventBus;
  private readonly selected: ID[] = [];

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /** 单选：以 id 替换整个选择集 */
  select(id: ID): void {
    this.replace([id]);
  }

  /** 追加选择：已存在则无操作 */
  add(id: ID): void {
    if (this.selected.includes(id)) return;
    this.selected.push(id);
    this.emitChanged();
  }

  /** 从选择集中移除：不存在则无操作 */
  remove(id: ID): void {
    const index = this.selected.indexOf(id);
    if (index === -1) return;
    this.selected.splice(index, 1);
    this.emitChanged();
  }

  /** 批量替换：去重并保持首次出现顺序 */
  selectMany(ids: ID[]): void {
    const next: ID[] = [];
    for (const id of ids) {
      if (!next.includes(id)) next.push(id);
    }
    this.replace(next);
  }

  clear(): void {
    this.replace([]);
  }

  /** 选中 ID 的副本数组（外部修改不影响内部状态） */
  getSelectedIds(): ID[] {
    return [...this.selected];
  }

  isSelected(id: ID): boolean {
    return this.selected.includes(id);
  }

  /** 整体替换；序列完全一致（含顺序）则视为无变化，不发事件 */
  private replace(next: ID[]): void {
    if (
      next.length === this.selected.length &&
      next.every((id, i) => id === this.selected[i])
    ) {
      return;
    }
    this.selected.length = 0;
    this.selected.push(...next);
    this.emitChanged();
  }

  private emitChanged(): void {
    this.eventBus.emit('selection:changed', { selectedIds: [...this.selected] });
  }
}
