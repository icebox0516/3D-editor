/**
 * app/input —— DOM 输入接线（组合根的一部分）。
 *
 * 职责：把浏览器原生事件归一化为 PointerEventInfo / KeyboardEventInfo 后转发给
 *      ToolManager（editor 层零 DOM 依赖）；并挂全局快捷键表（T2.4 补全，T5.6 扩展）：
 *      - Ctrl/Cmd+Z 撤销、Ctrl/Y 或 Ctrl+Shift+Z 重做（经 HistoryManager）；
 *      - Delete/Backspace 删除选中（每对象 DeleteObjectCommand，多个经 BatchCommand 合并为一条历史）；
 *      - Ctrl+C / Ctrl+V 剪贴板（内部快照：新 id、位置偏移 +1m，经 CreateObjectCommand）；
 *      - Ctrl+D 原地复制选中（偏移 1m，等价复制+粘贴一步）；
 *      - Ctrl+G 建组 / Ctrl+Shift+G 解散组（T8.5：经 EditorActionsCore 与右键菜单同路，
 *        粘贴副本保留 parentId 层级挂靠）；
 *      - F 聚焦选中（camera.focusObjects）、Home 全景（camera.focusAll）；
 *      - End 贴地选中（T8.1：y 落到下方最近高度候选层，与右键菜单同路）；
 *      - Q 选择工具、数字键垂直条（T6.5 形状驱动键表：Shift+1..5 区域子工具直切、
 *        1 区域（记忆上次）/ 2 路径 / 3 点 / 4 资产放置 toggle）——经 ui/tools/toolIA
 *        键表与共享激活入口路由（与 Context Toolbar / 垂直条点击同路，单一真相源）；
 *      - Alt+1..6 工作模式直切（T7.1 六启用模式，需求 24 章表序；Alt+7/8 目标禁用
 *        不绑定）——经 toolIA.resolveAltDigitMode + activateWorkMode（与 Scene ▼ 选择器 /
 *        视图菜单三路同源；激活绘制/放置工具时先走 cancel 语义，不产生 Command）；
 *      - W/E/R：translate/rotate/scale（经 toolIA.activateTransformTool 激活并写
 *        store.gizmoMode 记账）；放置工具激活时 R（及 W/E）归 PlacementTool
 *        （Ghost 旋转等工具内语义），不互相抢占；
 *      - G 仍为 DrawToolBase 工具内会话级吸附开关（转发激活工具，不在本表拦截）；
 *      - Tab：纯三维工作模式进入/退出（T7.4 需求 14 章）——经 toolIA.togglePure3d
 *        （与视图菜单三路同源；进入时激活绘制/放置/顶点编辑工具先 cancel）；
 *        Shift/Ctrl/Alt 叠加让位浏览器组合，文本输入焦点经 isEditableTarget 豁免；
 *      - ESC：ToolManager.cancel()——T5.8 起唯一退出手势（右键已迁移，见下）。
 * 手势（T5.8 行业惯例迁移，UE/Unity 同款）：
 *      - 左键：纯选择/确认（OrbitControls.LEFT=null，本控制器转发工具层）；
 *      - 右键拖拽：旋转视角（OrbitControls.RIGHT=ROTATE 消费，不经工具层）；
 *      - 右键点按（位移 <4px 且时间窗内）：上下文菜单——pointerdown 记起点，
 *        pointerup 经 classifyRightButton 分类，tap 发 onContextMenuRequest(x, y)
 *        （App 装配打开菜单；拖拽中再点按按最近一次 pointerdown 重置起点）；
 *      - 中键拖拽：平移（OrbitControls.MIDDLE=PAN 消费）；右/中键一律不转发工具。
 * 边界：app 层可导入一切（分层 DAG 顶端）；只做「归一化 + 路由」，不含业务逻辑——
 *      剪贴板/删除/全选等编辑动作自 T5.2 起抽取至 editorActionsCore（与主菜单
 *      createEditorActions 共用同一实例，剪贴板互通），本控制器仅委托调用，
 *      行为与抽取前逐条等价（tests/app/input.shortcuts.test.ts 守护）。
 */
import type { HistoryManager } from '../editor/history/HistoryManager';
import type { CameraPort, KeyboardEventInfo, PointerEventInfo } from '../editor/services/ports';
import type { ToolManager } from '../editor/tools/ToolManager';
import { isMeasureToolId } from '../editor/tools/measure';
import type { SceneManager } from '../scene/SceneManager';
import { SelectionManager } from '../scene/SelectionManager';
import {
  KEY_TO_TRANSFORM_MODE,
  SELECT_KEY,
  VERTEX_EDIT_TOOL_ID,
  activateSelectTool,
  activateTransformTool,
  activateWorkMode,
  resolveAltDigitMode,
  resolveDigitAction,
  togglePlacement,
  togglePure3d,
  toggleRegionDraw,
  toggleShapeDraw,
} from '../ui/tools/toolIA';
import { useEditorStore } from '../ui/store';
import { EditorActionsCore } from './editorActionsCore';

/** 输入接线依赖（由组合根装配） */
export interface InputDeps {
  /** 指针事件监听目标（通常为视口 canvas） */
  viewportElement: HTMLElement;
  /** 键盘事件监听目标（默认 window） */
  keyboardTarget?: Window;
  tools: ToolManager;
  history: HistoryManager;
  sceneManager: SceneManager;
  selection: SelectionManager;
  /** 相机 Port（F 聚焦 / Home 全景） */
  camera: CameraPort;
  /** 共享编辑动作核心（与主菜单同实例剪贴板互通；缺省独立构造，行为不变） */
  actions?: EditorActionsCore;
  /**
   * 右键点按（无拖拽）→ 上下文菜单请求（T5.8；坐标为 client CSS 像素 = 抬起点）。
   * App 装配时打开对应菜单；未注入时右键点按安全无操作。
   */
  onContextMenuRequest?: (x: number, y: number) => void;
}

/** 右键点按判定的位移阈值（欧氏距离，CSS 像素）：≥ 视为拖拽（旋转） */
export const RIGHT_TAP_MAX_DISTANCE_PX = 4;

/** 右键点按判定的时间窗（毫秒）：超窗不视为点按（防拖拽回原点误判菜单） */
export const RIGHT_TAP_MAX_MS = 500;

/**
 * 右键手势分类（纯函数，node 可测）：
 * 位移欧氏距离 < 4px 且按下→抬起在时间窗内 → 'tap'（上下文菜单），否则 'drag'（旋转，
 * OrbitControls 已消费拖拽）。时间窗守护「拖出又拖回起点」类往返——位移小但耗时长。
 */
export function classifyRightButton(dx: number, dy: number, dtMs: number): 'tap' | 'drag' {
  if (Math.hypot(dx, dy) >= RIGHT_TAP_MAX_DISTANCE_PX) return 'drag';
  if (dtMs > RIGHT_TAP_MAX_MS) return 'drag';
  return 'tap';
}

/** 右键点按会话记账（pointerdown 起点 → pointerup 分类） */
interface RightPressSession {
  x: number;
  y: number;
  time: number;
}

/** 拥有工具内按键语义的工具（W/E/R 不抢占，转发给工具自身） */
const TOOL_KEY_OWNERSHIP = new Set(['placement']);

export class InputController {
  private readonly deps: InputDeps & { keyboardTarget: Window };
  /** 编辑动作共享核心（剪贴板/删除等；bootstrap 注入或独立构造） */
  private readonly actions: EditorActionsCore;
  /** 右键按下会话（pointerup 分类用；null = 无待分类按下） */
  private rightPress: RightPressSession | null = null;
  private attached = false;
  private readonly boundHandlers: Array<[EventTarget, string, EventListenerOrEventListenerObject]> = [];

  constructor(deps: InputDeps) {
    this.deps = { ...deps, keyboardTarget: deps.keyboardTarget ?? window };
    this.actions =
      deps.actions ??
      new EditorActionsCore({
        history: deps.history,
        sceneManager: deps.sceneManager,
        selection: deps.selection,
      });
  }

  /** 开始监听（幂等） */
  attach(): void {
    if (this.attached) return;
    this.attached = true;

    const viewport = this.deps.viewportElement;
    const keyboard = this.deps.keyboardTarget;

    // 指针事件：归一化后转发激活工具。T5.8 手势迁移：
    //  - 左键转发工具（点选/框选/绘制确认；旋转已归右拖，OrbitControls.LEFT=null）；
    //  - 右键：pointerdown 记起点（最近一次 down 重置——拖拽中点按归新会话），
    //    pointerup 经 classifyRightButton 分类：tap → 上下文菜单请求；drag（旋转）无动作；
    //  - 中键：平移（OrbitControls.MIDDLE=PAN 消费），不进工具层。
    this.listen(viewport, 'pointerdown', (e) => {
      const pe = e as PointerEvent;
      if (pe.button === 1 || pe.button === 2) {
        if (pe.button === 2) {
          this.rightPress = { x: pe.clientX, y: pe.clientY, time: this.now() };
        }
        return; // 中/右键一律不转发工具
      }
      this.deps.tools.getActiveTool()?.onPointerDown(this.toPointerInfo(pe));
    });
    this.listen(viewport, 'pointermove', (e) => {
      this.deps.tools.getActiveTool()?.onPointerMove(this.toPointerInfo(e as PointerEvent));
    });
    this.listen(viewport, 'pointerup', (e) => {
      const pe = e as PointerEvent;
      if (pe.button === 2) {
        this.classifyRightUp(pe);
        return; // 右键抬起不转发工具
      }
      if (pe.button === 1) return; // 中键抬起不转发（配对 pointerdown 未进工具层）
      this.deps.tools.getActiveTool()?.onPointerUp(this.toPointerInfo(pe));
    });
    this.listen(viewport, 'dblclick', (e) => {
      this.deps.tools.getActiveTool()?.onDoubleClick?.(this.toPointerInfo(e as MouseEvent));
    });
    this.listen(viewport, 'wheel', (e) => {
      this.deps.tools.getActiveTool()?.onWheel?.((e as WheelEvent).deltaY);
    });
    this.listen(viewport, 'contextmenu', (e) => e.preventDefault());

    // 键盘：全局快捷键表 + 其余按键转发激活工具
    this.listen(keyboard, 'keydown', (e) => this.onKeyDown(e as KeyboardEvent));
  }
  /** 移除全部监听（幂等）；共享核心剪贴板归组合根生命周期管理（facade.dispose 一并消亡） */
  dispose(): void {
    for (const [target, type, handler] of this.boundHandlers) {
      target.removeEventListener(type, handler);
    }
    this.boundHandlers.length = 0;
    this.rightPress = null;
    this.attached = false;
  }

  // ── 内部 ────────────────────────────────────────────────

  /** 右键抬起分类：无待分类按下 → 忽略；tap → 发上下文菜单请求（抬起点坐标） */
  private classifyRightUp(e: PointerEvent): void {
    const press = this.rightPress;
    this.rightPress = null;
    if (!press) return;
    const gesture = classifyRightButton(
      e.clientX - press.x,
      e.clientY - press.y,
      this.now() - press.time,
    );
    if (gesture === 'tap') this.deps.onContextMenuRequest?.(e.clientX, e.clientY);
  }

  /** 单调时钟（可测性：集成测试 down→up 同步发生，dtMs≈0） */
  private now(): number {
    return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.defaultPrevented) return; // 已消费按键（如菜单内 Esc 关菜单）不进编辑器快捷键体系
    if (isEditableTarget(e.target)) return; // 文本输入中的按键不进编辑器快捷键体系

    const ctrl = e.ctrlKey || e.metaKey; // Mac 的 Cmd 映射到 ctrl 语义
    const key = e.key.toLowerCase();

    if (ctrl && key === 'z') {
      e.preventDefault();
      if (e.shiftKey) this.deps.history.redo();
      else this.deps.history.undo();
      return;
    }
    if (ctrl && key === 'y') {
      e.preventDefault();
      this.deps.history.redo();
      return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      // 顶点编辑激活时归工具语义（删除悬停顶点，T6.8）——对象整删路径不触发
      if (this.deps.tools.getActiveTool()?.id === VERTEX_EDIT_TOOL_ID) {
        this.deps.tools.getActiveTool()?.onKeyDown?.(this.toKeyboardInfo(e));
        return;
      }
      // 测量工具激活时归工具语义（有草稿弃草稿/无草稿删除上一条，T10.1 契约 §A）
      // ——对象整删路径不触发（沿顶点编辑先例）
      const active = this.deps.tools.getActiveTool();
      if (active && isMeasureToolId(active.id)) {
        active.onKeyDown?.(this.toKeyboardInfo(e));
        return;
      }
      this.actions.deleteSelection();
      return;
    }
    if (ctrl && key === 'c') {
      this.actions.copySelection();
      return;
    }
    if (ctrl && key === 'v') {
      e.preventDefault();
      this.actions.pasteClipboard();
      return;
    }
    if (ctrl && key === 'd') {
      e.preventDefault();
      this.actions.duplicateSelection();
      return;
    }
    // Ctrl+G / Ctrl+Shift+G：建组 / 解散组（T8.5，PS/AI 跨域惯例；与右键菜单
    // ctx.group / ctx.ungroup 同一动作核心——空选/无组可解散时 no-op 零历史）
    if (ctrl && key === 'g') {
      e.preventDefault();
      if (e.shiftKey) this.actions.ungroupSelection();
      else this.actions.groupSelection();
      return;
    }
    if (e.key === 'Escape') {
      this.deps.tools.cancel();
      return;
    }
    // Tab → 纯三维工作模式进入/退出（T7.4，需求 14 章；与视图菜单 view.pure3d 三路
    // 同源——togglePure3d 含激活绘制/放置/顶点编辑工具的 cancel 语义 + 关右键菜单）；
    // Shift/Ctrl/Alt 叠加的 Tab 不路由（浏览器组合让位：焦点反向遍历 / 标签页 / 窗口切换）
    if (e.key === 'Tab' && !ctrl && !e.altKey && !e.shiftKey) {
      e.preventDefault(); // 阻断焦点遍历默认行为
      togglePure3d(this.deps.tools);
      return;
    }
    if (!ctrl && !e.altKey && key === 'f') {
      const ids = this.deps.selection.getSelectedIds();
      if (ids.length > 0) this.deps.camera.focusObjects(ids);
      return;
    }
    if (!ctrl && !e.altKey && e.key === 'Home') {
      this.deps.camera.focusAll();
      return;
    }
    // End → 贴地（T8.1 R5，UE Snap to Floor 先例；与右键菜单 ctx.drop-to-ground 同一
    // 动作核心——选中对象 y 落到下方最近高度候选层；无选中时动作核心安全无操作）
    if (!ctrl && !e.altKey && e.key === 'End') {
      e.preventDefault();
      this.actions.dropSelectionToGround();
      return;
    }
    // Q → 选择工具（与 Context Toolbar Q 钮同路；Ctrl+Q 等浏览器组合让位）
    if (!ctrl && !e.altKey && key === SELECT_KEY) {
      activateSelectTool(this.deps.tools);
      return;
    }
    // Alt+1..6 → 工作模式直切（T7.1；与 Scene ▼ 选择器 / 视图菜单三路同源；
    // Alt+7/8 目标禁用不绑定回落；Shift 叠加不路由——区域子工具直切仍归 Shift+1..5）
    if (!ctrl && e.altKey) {
      const modeId = resolveAltDigitMode({ code: e.code, altKey: true, shiftKey: e.shiftKey });
      if (modeId !== null) {
        e.preventDefault(); // 阻断浏览器 Alt 系默认行为（如 Firefox 菜单栏聚焦）
        activateWorkMode(modeId, this.deps.tools);
        return;
      }
    }
    // 数字键（T6.5 形状驱动键表，e.code 稳定判定——Shift 组合下 e.key 是标点）：
    //  - Shift+1..5 → 区域组五子工具直切（多边形/矩形/圆形/椭圆/自由）
    //  - 1..4 → 垂直条四项 toggle（1 区域=记忆上次子工具 / 2 路径 / 3 点 / 4 放置）
    if (!ctrl && !e.altKey) {
      const digit = resolveDigitAction({ code: e.code, shiftKey: e.shiftKey });
      if (digit !== null) {
        if (digit.kind === 'area-sub') {
          toggleShapeDraw(this.deps.tools, digit.shapeType);
        } else if (digit.key === '4') {
          // 资产放置：重放最近资产；无记忆时不激活（内容浏览器选择后经 lastAssetId 记忆）
          togglePlacement(
            this.deps.tools,
            this.deps.sceneManager,
            useEditorStore.getState().lastAssetId,
          );
        } else if (digit.key === '1') {
          toggleRegionDraw(this.deps.tools);
        } else {
          const shape = digit.key === '2' ? 'line' : 'point';
          toggleShapeDraw(this.deps.tools, shape);
        }
        return;
      }
    }
    if (!ctrl && !e.altKey && key in KEY_TO_TRANSFORM_MODE) {
      // 工具内按键归当前工具（如放置中 R = 旋转 Ghost），不切换 gizmo 模式
      if (TOOL_KEY_OWNERSHIP.has(this.deps.tools.getActiveTool()?.id ?? '')) {
        this.deps.tools.getActiveTool()?.onKeyDown?.(this.toKeyboardInfo(e));
        return;
      }
      // W/E/R 经共享入口（激活 + store.gizmoMode 记账，与 Context Toolbar 点击同路）
      activateTransformTool(this.deps.tools, KEY_TO_TRANSFORM_MODE[key]!);
      return;
    }

    // 其余按键转发激活工具（归一化 KeyboardEventInfo）
    this.deps.tools.getActiveTool()?.onKeyDown?.(this.toKeyboardInfo(e));
  }

  /** DOM PointerEvent → PointerEventInfo（client 坐标即视口相对 CSS 像素，与 ViewportPort 语义一致） */
  private toPointerInfo(e: PointerEvent | MouseEvent): PointerEventInfo {
    return {
      screenX: e.clientX,
      screenY: e.clientY,
      button: mapButton(e.button),
      ctrlKey: e.ctrlKey || e.metaKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
    };
  }

  private toKeyboardInfo(e: KeyboardEvent): KeyboardEventInfo {
    return {
      key: e.key,
      ctrlKey: e.ctrlKey || e.metaKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
    };
  }

  /** 注册并记录监听（供 dispose 成对移除）；handler 统一收 Event，具体类型在各监听点收窄 */
  private listen(target: EventTarget, type: string, handler: (e: Event) => void): void {
    const listener = handler as EventListener;
    target.addEventListener(type, listener);
    this.boundHandlers.push([target, type, listener]);
  }
}

/** DOM button 编号 → PointerEventInfo.button */
function mapButton(button: number): PointerEventInfo['button'] {
  if (button === 2) return 'right';
  if (button === 1) return 'middle';
  return 'left';
}

/** 快捷键忽略文本输入场景（input/textarea/contenteditable；node 测试无 HTMLElement，按结构判定） */
function isEditableTarget(target: EventTarget | null): boolean {
  if (typeof target !== 'object' || target === null) return false;
  const el = target as { isContentEditable?: unknown; tagName?: unknown };
  if (el.isContentEditable === true) return true;
  const tag = typeof el.tagName === 'string' ? el.tagName.toLowerCase() : '';
  return tag === 'input' || tag === 'textarea' || tag === 'select';
}
