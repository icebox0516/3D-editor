/**
 * tests/app/gestureClassifier.test.ts —— 右键手势分类器测试（T5.8，先测后码）。
 *
 * 行业惯例手势迁移（UE/Unity）：右键拖拽 = 旋转视角（OrbitControls 消费），
 * 右键点按（无拖拽）= 上下文菜单。分类器职责：
 * - 纯函数 classifyRightButton(dx, dy, dtMs)：位移 < 4px 且在时间窗内 → 'tap'，否则 'drag'；
 * - InputController 集成：pointerdown 记起点 → pointerup 分类；
 *   'tap' → onContextMenuRequest(x, y)（App 装配打开菜单）；'drag' → 无动作（旋转已消费）；
 * - 右键 / 中键 pointerdown 不再转发工具（左键归工具层）；右键不再退出工具——
 *   ESC 成为唯一退出手势；已 preventDefault 的按键（如菜单内 Esc）不再触发工具退出。
 *
 * 环境 node：DOM 事件经 FakeEventTarget 注入（沿 input.shortcuts.test.ts 先例）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import { HistoryManager } from '../../src/editor/history/HistoryManager';
import type { ToolManager } from '../../src/editor/tools/ToolManager';
import type { CameraPort } from '../../src/editor/services/ports';
import {
  RIGHT_TAP_MAX_DISTANCE_PX,
  RIGHT_TAP_MAX_MS,
  InputController,
  classifyRightButton,
} from '../../src/app/input';

// ── Fake DOM ─────────────────────────────────────────────────

class FakeEventTarget {
  private readonly handlers = new Map<string, Set<(e: unknown) => void>>();
  addEventListener(type: string, handler: (e: unknown) => void): void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
  }
  removeEventListener(type: string, handler: (e: unknown) => void): void {
    this.handlers.get(type)?.delete(handler);
  }
  dispatch(type: string, event: Record<string, unknown>): void {
    for (const handler of [...(this.handlers.get(type) ?? [])]) handler(event);
  }
}

interface FakePointerFields {
  clientX?: number;
  clientY?: number;
  button?: number;
  preventDefault?: () => void;
}

function pointerEvent(e: FakePointerFields = {}): Record<string, unknown> {
  return {
    clientX: e.clientX ?? 0,
    clientY: e.clientY ?? 0,
    button: e.button ?? 0,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    preventDefault: e.preventDefault ?? vi.fn(),
  };
}

function keyEvent(key: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    key,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    target: null,
    preventDefault: vi.fn(),
    ...extra,
  };
}

// ── 纯函数边界 ────────────────────────────────────────────────

describe('classifyRightButton 纯函数边界', () => {
  it('零位移 + 时间窗内 → tap', () => {
    expect(classifyRightButton(0, 0, 0)).toBe('tap');
    expect(classifyRightButton(0, 0, RIGHT_TAP_MAX_MS)).toBe('tap');
  });

  it('位移阈值：欧氏距离 < 4px → tap；≥ 4px → drag', () => {
    expect(classifyRightButton(3.99, 0, 100)).toBe('tap');
    expect(classifyRightButton(4, 0, 100)).toBe('drag');
    expect(classifyRightButton(5, 0, 100)).toBe('drag');
  });

  it('对角位移按欧氏距离判定（3,3 ≈ 4.24 → drag；2,2 ≈ 2.83 → tap）', () => {
    expect(classifyRightButton(3, 3, 100)).toBe('drag');
    expect(classifyRightButton(2, 2, 100)).toBe('tap');
  });

  it('负位移同权（往返拖拽回到起点附近的水平/垂直分量）', () => {
    expect(classifyRightButton(-2, -2, 100)).toBe('tap');
    expect(classifyRightButton(-4, 1, 100)).toBe('drag');
  });

  it('时间窗：dtMs 超窗 → drag（慢长按不视为点按，防拖拽回原点误判菜单）', () => {
    expect(classifyRightButton(0, 0, RIGHT_TAP_MAX_MS)).toBe('tap');
    expect(classifyRightButton(0, 0, RIGHT_TAP_MAX_MS + 1)).toBe('drag');
    // 位移超阈 + 时间窗内 → 仍 drag（位移优先）
    expect(classifyRightButton(50, 0, 50)).toBe('drag');
  });

  it('阈值常量契约：4px / 500ms', () => {
    expect(RIGHT_TAP_MAX_DISTANCE_PX).toBe(4);
    expect(RIGHT_TAP_MAX_MS).toBe(500);
  });
});

// ── InputController 集成 ──────────────────────────────────────

/** 最小 ToolManager 替身（记录 onPointerDown 转发与 cancel 次数；模块级复用，每用例清零） */
const tool = (() => {
  let active = true;
  let cancelCount = 0;
  const pointerDowns: Array<{ button: string; x: number; y: number }> = [];
  const pointerUps: string[] = [];
  return {
    pointerDowns,
    pointerUps,
    get cancelCount(): number {
      return cancelCount;
    },
    /** 每用例复位（模块级单例替身） */
    reset(): void {
      active = true;
      cancelCount = 0;
      pointerDowns.length = 0;
      pointerUps.length = 0;
    },
    getActiveTool: () =>
      active
        ? {
            id: 'fake',
            onPointerDown: (e: { button: string; screenX: number; screenY: number }) => {
              pointerDowns.push({ button: e.button, x: e.screenX, y: e.screenY });
            },
            onPointerUp: (e: { button: string }) => {
              pointerUps.push(e.button);
            },
            onPointerMove: () => {},
          }
        : null,
    cancel: () => {
      active = false;
      cancelCount += 1;
    },
  };
})();

function setup(opts: { onContextMenuRequest?: (x: number, y: number) => void } = {}) {
  const viewportElement = new FakeEventTarget();
  const keyboardTarget = new FakeEventTarget();
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const history = new HistoryManager({ sceneManager, selection, eventBus });
  const camera: CameraPort = {
    getMode: () => 'perspective',
    setMode: () => {},
    setOrthoLock: () => {},
    focusObjects: () => {},
    focusAll: () => {},
  };
  const input = new InputController({
    viewportElement: viewportElement as unknown as HTMLElement,
    keyboardTarget: keyboardTarget as unknown as Window,
    tools: tool as unknown as ToolManager,
    history,
    sceneManager,
    selection,
    camera,
    onContextMenuRequest: opts.onContextMenuRequest,
  });
  input.attach();
  const key = (k: string, extra?: Record<string, unknown>) =>
    keyboardTarget.dispatch('keydown', keyEvent(k, extra));
  return { viewportElement, keyboardTarget, input, key };
}

describe('InputController 右键手势路由（T5.8）', () => {
  beforeEach(() => {
    tool.reset();
  });

  it('右键点按（<4px、时间窗内）：pointerup 时发 contextmenu 请求（含坐标）', () => {
    const onRequest = vi.fn();
    const fx = setup({ onContextMenuRequest: onRequest });

    fx.viewportElement.dispatch('pointerdown', pointerEvent({ clientX: 320, clientY: 240, button: 2 }));
    fx.viewportElement.dispatch('pointerup', pointerEvent({ clientX: 321, clientY: 242, button: 2 }));

    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(onRequest).toHaveBeenCalledWith(321, 242); // 菜单坐标 = 抬起点
  });

  it('右键拖拽（≥4px）：不发菜单请求、不退出工具（旋转由 OrbitControls 消费）', () => {
    const onRequest = vi.fn();
    const fx = setup({ onContextMenuRequest: onRequest });

    fx.viewportElement.dispatch('pointerdown', pointerEvent({ clientX: 100, clientY: 100, button: 2 }));
    fx.viewportElement.dispatch('pointerup', pointerEvent({ clientX: 260, clientY: 180, button: 2 }));

    expect(onRequest).not.toHaveBeenCalled();
    expect(tool.cancelCount).toBe(0);
  });

  it('右键长按超时间窗的判定归纯函数时间窗用例（集成零位移快速抬起为 tap 的对端行为）', () => {
    // 集成测试 down→up 同步发生（dtMs≈0），长按窗口语义由 classifyRightButton 纯函数
    // 用例守护（RIGHT_TAP_MAX_MS 边界）；此处补零位移抬起的正路径。
    const onRequest = vi.fn();
    const fx = setup({ onContextMenuRequest: onRequest });

    fx.viewportElement.dispatch('pointerdown', pointerEvent({ clientX: 50, clientY: 50, button: 2 }));
    fx.viewportElement.dispatch('pointerup', pointerEvent({ clientX: 50, clientY: 50, button: 2 }));
    expect(onRequest).toHaveBeenCalledTimes(1);
  });

  it('拖拽后的点按：起点按最近一次 pointerdown 重置（拖拽中点按归新会话）', () => {
    const onRequest = vi.fn();
    const fx = setup({ onContextMenuRequest: onRequest });

    // 第一次：拖拽（不触发菜单，且不清残留——等待下一次 down 重置）
    fx.viewportElement.dispatch('pointerdown', pointerEvent({ clientX: 0, clientY: 0, button: 2 }));
    fx.viewportElement.dispatch('pointerup', pointerEvent({ clientX: 300, clientY: 300, button: 2 }));
    expect(onRequest).not.toHaveBeenCalled();

    // 第二次：新起点快速点按 → 菜单（以新会话位移判定，不受上次拖拽影响）
    fx.viewportElement.dispatch('pointerdown', pointerEvent({ clientX: 400, clientY: 300, button: 2 }));
    fx.viewportElement.dispatch('pointerup', pointerEvent({ clientX: 401, clientY: 301, button: 2 }));
    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(onRequest).toHaveBeenCalledWith(401, 301);
  });

  it('无右键 pointerdown 的孤立 pointerup：安全忽略', () => {
    const onRequest = vi.fn();
    const fx = setup({ onContextMenuRequest: onRequest });

    fx.viewportElement.dispatch('pointerup', pointerEvent({ clientX: 10, clientY: 10, button: 2 }));
    expect(onRequest).not.toHaveBeenCalled();
  });

  it('右键 / 中键 pointerdown 不转发工具 onPointerDown（左键正常转发）', () => {
    const fx = setup();

    fx.viewportElement.dispatch('pointerdown', pointerEvent({ clientX: 10, clientY: 10, button: 0 }));
    fx.viewportElement.dispatch('pointerdown', pointerEvent({ clientX: 10, clientY: 10, button: 1 }));
    fx.viewportElement.dispatch('pointerdown', pointerEvent({ clientX: 10, clientY: 10, button: 2 }));

    expect(tool.pointerDowns).toEqual([{ button: 'left', x: 10, y: 10 }]);
  });

  it('中键 pointerup 不转发工具（配对 pointerdown 未进工具层）', () => {
    const fx = setup();
    fx.viewportElement.dispatch('pointerdown', pointerEvent({ clientX: 10, clientY: 10, button: 1 }));
    fx.viewportElement.dispatch('pointerup', pointerEvent({ clientX: 12, clientY: 12, button: 1 }));
    expect(tool.pointerDowns).toEqual([]); // 中键全程不经工具
    expect(tool.pointerUps).toEqual([]);
  });

  it('右键 pointerup 同样不转发工具（分类器独占）', () => {
    const fx = setup();
    fx.viewportElement.dispatch('pointerdown', pointerEvent({ clientX: 5, clientY: 5, button: 2 }));
    fx.viewportElement.dispatch('pointerup', pointerEvent({ clientX: 5, clientY: 5, button: 2 }));
    expect(tool.pointerDowns).toEqual([]);
    expect(tool.pointerUps).toEqual([]);
  });

  it('ESC 仍是唯一退出手势（tools.cancel）', () => {
    const fx = setup();
    fx.key('Escape');
    expect(tool.cancelCount).toBe(1);
  });

  it('已 preventDefault 的按键不进快捷键体系（菜单内 Esc 关菜单不退出工具）', () => {
    const fx = setup();
    fx.key('Escape', { defaultPrevented: true });
    expect(tool.cancelCount).toBe(0);
  });

  it('原生 contextmenu 事件继续 preventDefault（抑制浏览器默认菜单）', () => {
    const fx = setup();
    const preventDefault = vi.fn();
    fx.viewportElement.dispatch('contextmenu', { preventDefault });
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('未装配 onContextMenuRequest 时右键点按安全无操作（可选依赖）', () => {
    const fx = setup();
    expect(() => {
      fx.viewportElement.dispatch('pointerdown', pointerEvent({ clientX: 5, clientY: 5, button: 2 }));
      fx.viewportElement.dispatch('pointerup', pointerEvent({ clientX: 5, clientY: 5, button: 2 }));
    }).not.toThrow();
  });

  it('左键 pointerup 不参与右键分类（不触发菜单请求）', () => {
    const onRequest = vi.fn();
    const fx = setup({ onContextMenuRequest: onRequest });

    fx.viewportElement.dispatch('pointerdown', pointerEvent({ clientX: 5, clientY: 5, button: 0 }));
    fx.viewportElement.dispatch('pointerup', pointerEvent({ clientX: 6, clientY: 6, button: 0 }));

    expect(onRequest).not.toHaveBeenCalled();
  });
});
