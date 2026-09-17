/**
 * editor/commands/CommandContext —— 命令执行上下文。
 *
 * 职责：声明命令执行所需的全部依赖（场景数据源、选中集、事件总线）。
 * 边界：按 CONTRACTS.md 契约为 { sceneManager, selection, eventBus }——
 *      不含 runtime（命令经事件驱动渲染）与 history（History 由调用方持有，
 *      避免命令与历史管理器循环依赖）；命令只经此上下文读写场景，零渲染。
 */
import type { EventBus } from '../../core/events/EventBus';
import type { SceneManager } from '../../scene/SceneManager';
import type { SelectionManager } from '../../scene/SelectionManager';

/** 命令执行上下文：命令的一切副作用只经此三个入口发生 */
export interface CommandContext {
  /** 场景唯一数据源（只增删改查） */
  sceneManager: SceneManager;
  /** 当前选中集（如删除对象时同步清理选中） */
  selection: SelectionManager;
  /** 事件总线（广播具体事件与 scene:changed） */
  eventBus: EventBus;
}
