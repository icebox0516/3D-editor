/**
 * editor/tools/Tool —— 工具基础接口与工具上下文。
 *
 * 职责：声明「用户现在要做什么」的交互抽象——工具产生意图，Command 落地修改；
 *      ToolContext 汇聚工具所需的全部依赖（数据源/选中集/历史/注册表/Port/事件总线）。
 * 边界：签名以 CONTRACTS.md「editor/tools」一节为准；渲染能力只经 Port
 *      （viewport/camera/preview，runtime 实现、app 注入），零 THREE；
 *      工具不得直接写 SceneManager（一切可见修改经 Command → HistoryManager）；
 *      cancel 只清理临时状态（Ghost/绘制预览等），不产生任何 Command。
 */
import type { EventBus } from '../../core/events/EventBus';
import type { AssetRegistry } from '../../registries';
import type { SceneManager } from '../../scene/SceneManager';
import type { SelectionManager } from '../../scene/SelectionManager';
import type { HistoryManager } from '../history/HistoryManager';
import type { CameraPort, KeyboardEventInfo, PointerEventInfo, PreviewPort, ViewportPort } from '../services/ports';

/** 工具上下文：activate 时由 ToolManager 注入（依赖倒置，app 组合根装配） */
export interface ToolContext {
  /** 场景唯一数据源（工具只读；修改走 Command） */
  sceneManager: SceneManager;
  /** 当前选中集 */
  selection: SelectionManager;
  /** 历史管理器（工具经此执行命令，不直接改场景） */
  history: HistoryManager;
  /** 资产注册表（T6.9：v1 elements/styles 已随旧契约类型面删除，收窄为 { assets }） */
  registries: { assets: AssetRegistry };
  /** 视口拾取 Port（射线拾取/地面投影，runtime 实现） */
  viewport: ViewportPort;
  /** 相机控制 Port */
  camera: CameraPort;
  /** 临时预览 Port（Ghost/绘制预览，不入 Scene、不入历史） */
  preview: PreviewPort;
  /** 事件总线 */
  eventBus: EventBus;
}

/** 工具接口：同一时刻仅一个激活（ToolManager 保证互斥） */
export interface Tool {
  /** 工具 id（tool_ 语义前缀的注册键，如 'select' / 'placement' / 'transform'） */
  readonly id: string;
  /** 展示名 */
  readonly name: string;
  /** 激活：接收上下文与工具参数（params 结构由各工具自定义并校验，非法参数抛错） */
  activate(ctx: ToolContext, params?: unknown): void;
  /** 停用：清理全部临时状态（含 Port 预览），之后不得再响应事件 */
  deactivate(): void;
  onPointerDown(e: PointerEventInfo): void;
  onPointerMove(e: PointerEventInfo): void;
  onPointerUp(e: PointerEventInfo): void;
  /** 可选：双击（如选中文本/进入编辑） */
  onDoubleClick?(e: PointerEventInfo): void;
  /** 可选：键盘（ESC 等退出手势也可由 app 层统一路由到 ToolManager.cancel） */
  onKeyDown?(e: KeyboardEventInfo): void;
  /** 可选：滚轮（delta 为纵向滚动量） */
  onWheel?(delta: number): void;
  /** ESC / 右键：清理临时状态，不产生任何 Command */
  cancel(): void;
}
