/**
 * editor/EditorFacade —— app 组合根装配后交给 UI 的唯一门面（接口）。
 *
 * 职责：聚合场景数据源 / 选中集 / 历史 / 工具管理器 / 四大注册表，并提供场景级
 *      打开（openScene）、保存（saveScene）与释放（dispose）三个入口；
 *      UI 层（React 组件）只经本门面与 EventBus→zustand store 与编辑器交互（CONTRACTS.md #11）。
 * 边界：签名以 CONTRACTS.md「editor/EditorFacade」一节为准，本文件不得重定义；
 *      接口定义于 editor 层（ui 可导入 editor，不可导入 app），实现在 app/bootstrap
 *      （openScene/saveScene 需要 io 层序列化器，editor 与 io 为兄弟层，DAG 禁止互导）。
 *      T6.9：registries 删 v1 elements/styles 两字段（旧契约类型面删除）。
 */
import type { SceneData } from '../scene/SceneData';
import type { SceneManager } from '../scene/SceneManager';
import type { SelectionManager } from '../scene/SelectionManager';
import type {
  AssetRegistry,
  CommandRegistry,
  StylePresetRegistry,
  ToolRegistry,
} from '../registries';
import type { HistoryManager } from './history/HistoryManager';
import type { ToolManager } from './tools/ToolManager';

export interface EditorFacade {
  scene: SceneManager;
  selection: SelectionManager;
  history: HistoryManager;
  tools: ToolManager;
  registries: {
    assets: AssetRegistry;
    tools: ToolRegistry;
    commands: CommandRegistry;
    /** 样式预设元数据（阶段 6 T6.2 增补，分域契约 §B）：ui 读预设元数据唯一途径；纯数据，永不含构建函数 */
    presets: StylePresetRegistry;
  };
  /** 以给定场景数据全量替换当前场景（对象/图层/环境），清空历史与选中 */
  openScene(data: SceneData): void;
  /** 序列化当前 SceneData 为场景 JSON 文本（version "2.0"） */
  saveScene(): string;
  /** 释放运行时资源与输入接线；幂等 */
  dispose(): void;
}
