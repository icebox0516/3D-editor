/**
 * tests/app/placement.flow.test.ts —— 「资产卡点击 → 画布点击」放置链路集成回归。
 *
 * 背景：浏览器自动化复现曾怀疑「点击资产卡 → 点击画布」未进入放置模式（store 里工具
 * 回退成 'select'）。本组测试沿真实接线（App.tsx onPickAsset / input.ts / ToolManager /
 * ui/store 的 tool:changed 桥接）复刻链路，固定以下事实：
 * - 激活路径：activate('placement', { assetId, layerId }) 后 store.activeToolId='placement'、
 *   placingAssetId 保持，画布左键 pointerdown 经 InputController 落地 ModelObject，
 *   连续模式工具不退出——链路本身无「自动回退 select」；
 * - 事件序列：激活成功路径的 tool:changed 不含 null（store 清 placingAssetId 的唯一来源
 *   是非 placement 的 tool:changed）；
 * - 「回退 select」只发生在显式退出手势（ESC → tool:changed(null) → App 订阅
 *   回 select）：这是设计行为，自动化环境若在点击序列间注入 Escape 即观测到此回退；
 *   T5.8 手势迁移后右键不再退出（点按 → 上下文菜单请求，拖拽 → 旋转归 OrbitControls）；
 * - activate 抛错（资产未注册）→ ToolManager 复位 null → App 订阅回 select：
 * store 症状与复现一致，但 UI 面板资产必先注册才可点击，正常路径不可达。
 *
 * 环境 node：DOM 事件经 FakeEventTarget 注入；store 用 zustand 真实实现。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import type { ID } from '../../src/core/types';
import { EventBus } from '../../src/core/events/EventBus';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import { MODEL_BASE_HEIGHT } from '../../src/domain/assets';
import { AssetRegistry } from '../../src/registries/AssetRegistry';
import { HistoryManager } from '../../src/editor/history/HistoryManager';
import type { EditorFacade } from '../../src/editor/EditorFacade';
import type { ToolContext } from '../../src/editor/tools';
import { PlacementTool } from '../../src/editor/tools/PlacementTool';
import { SelectTool } from '../../src/editor/tools/SelectTool';
import { ToolManager } from '../../src/editor/tools/ToolManager';
import type { CameraPort, PreviewPort, ViewportPort } from '../../src/editor/services/ports';
import { InputController } from '../../src/app/input';
import { useEditorStore } from '../../src/ui/store';

// ── Fake DOM（InputController 只依赖 addEventListener 与事件字段）──

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
    for (const handler of this.handlers.get(type) ?? []) handler(event);
  }
}

/** 左键/右键 pointerdown 事件体（InputController.toPointerInfo 消费的字段） */
function pointerEvent(button: number): Record<string, unknown> {
  return pointerEventAt(320, 240, button);
}

/** 指定坐标与按钮的事件体（右键点按/拖拽分类测试用） */
function pointerEventAt(x: number, y: number, button: number): Record<string, unknown> {
  return { clientX: x, clientY: y, button, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false };
}

// ── Ports / 夹具 ──────────────────────────────────────────────

/** 地面投影 fake：固定落点（模拟画布点击命中地面） */
class FixedGroundViewport implements ViewportPort {

  /** 测量拾取（T10.1 ViewportPort 增补）：本工具测试不消费，恒 null */
  surfacePoint(): null {
    return null;
  }
  pickObject(): ID | null {
    return null;
  }
  groundPoint() {
    return { x: 12.5, y: 0, z: -7.25 };
  }
}

class NullPreview implements PreviewPort {
  showGhost(): void {}
  updateGhost(): void {}
  hideGhost(): void {}
  updateDrawPreview(): void {}
  clear(): void {}
}

class NullCamera implements CameraPort {
  getMode(): 'perspective' | 'top' | 'front' | 'side' {
    return 'perspective';
  }
  setMode(): void {}
  setOrthoLock(): void {}
  focusObjects(): void {}
  focusAll(): void {}
}

function setup() {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const history = new HistoryManager({ sceneManager, selection, eventBus });

  const assets = new AssetRegistry();
  assets.register({
    kind: 'file',
    asset: {
      id: 'asset_tree',
      name: '树',
      category: 'plant',
      file: 'models/plant/tree.glb',
      tags: [],
      defaultScale: { x: 1, y: 1, z: 1 },
      defaultRotation: { x: 0, y: 0, z: 0 },
    },
  });

  const camera = new NullCamera();
  const ctx: ToolContext = {
    sceneManager,
    selection,
    history,
    registries: { assets },
    viewport: new FixedGroundViewport(),
    camera,
    preview: new NullPreview(),
    eventBus,
  };
  const tools = new ToolManager(ctx);
  tools.register(new SelectTool(null));
  tools.register(new PlacementTool());

  // 复刻 App.tsx 挂载顺序：先 store 桥接（先注册先收事件），再 App 层 tool:changed 订阅。
  // 顺序敏感：activate 抛错 → ToolManager emit(null) → store 先记 null → App 订阅回 select
  // → emit('select') → store 覆写为 'select'——最终态正确依赖“store 先注册”。
  const facadeLike = { scene: sceneManager, selection, history, tools } as unknown as EditorFacade;
  const detachStore = useEditorStore.getState().attach(facadeLike, eventBus, { camera });
  const offTool = eventBus.on('tool:changed', (p) => {
    if (p.toolId === null) tools.activate('select');
  });
  tools.activate('select');

  const viewportElement = new FakeEventTarget();
  const keyboardTarget = new FakeEventTarget();
  /** 右键点按分类后的菜单请求记录（App 装配处打开上下文菜单） */
  const menuRequests: Array<{ x: number; y: number }> = [];
  const input = new InputController({
    viewportElement: viewportElement as unknown as HTMLElement,
    keyboardTarget: keyboardTarget as unknown as Window,
    tools,
    history,
    sceneManager,
    selection,
    camera,
    onContextMenuRequest: (x, y) => menuRequests.push({ x, y }),
  });
  input.attach();

  /** 复刻 App.tsx onPickAsset 核心（略去缩略图 best-effort 分支） */
  const pickAssetCard = (assetId: ID) => {
    useEditorStore.getState().setPlacingAssetId(assetId);
    tools.activate('placement', { assetId, layerId: null });
  };

  const clickCanvas = (button = 0) => viewportElement.dispatch('pointerdown', pointerEvent(button));
  /** 右键点按（down + 同点 up，位移 0）：分类器判 tap → 菜单请求 */
  const rightTapCanvas = (x = 320, y = 240) => {
    viewportElement.dispatch('pointerdown', pointerEventAt(x, y, 2));
    viewportElement.dispatch('pointerup', pointerEventAt(x, y, 2));
  };
  /** 右键拖拽（down → 远点 up）：分类器判 drag → 旋转归 OrbitControls */
  const rightDragCanvas = (x0: number, y0: number, x1: number, y1: number) => {
    viewportElement.dispatch('pointerdown', pointerEventAt(x0, y0, 2));
    viewportElement.dispatch('pointerup', pointerEventAt(x1, y1, 2));
  };
  const pressKey = (key: string) =>
    keyboardTarget.dispatch('keydown', {
      key,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      altKey: false,
      target: null,
      preventDefault: () => {},
    });

  // 每个用例重建夹具；zustand store 为模块单例，attach 自带 detach 复位，无需额外清理
  void offTool;
  void detachStore;
  void input;
  return {
    eventBus, sceneManager, tools, pickAssetCard, clickCanvas, rightTapCanvas, rightDragCanvas,
    pressKey, menuRequests,
    store: useEditorStore,
  };
}

describe('放置链路集成：资产卡点击 → 画布点击（自动化复现疑点回归）', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('激活即入放置模式：store 记账正确，激活事件序列无 null（链路无自动回退）', () => {
    fx.pickAssetCard('asset_tree');
    expect(fx.tools.getActiveTool()?.id).toBe('placement');
    expect(fx.store.getState().activeToolId).toBe('placement');
    expect(fx.store.getState().placingAssetId).toBe('asset_tree');
  });

  it('画布左键：经 InputController 落地 ModelObject，连续模式工具保持放置', () => {
    fx.pickAssetCard('asset_tree');
    fx.clickCanvas(0);

    const objects = fx.sceneManager.getObjects();
    expect(objects).toHaveLength(1);
    expect(objects[0].type).toBe('model');
    expect(objects[0].name).toBe('树');
    // y = 地面 0 + MODEL_BASE_HEIGHT（T9.2 贴地微抬，消平面模型与地面共面 z-fighting）
    expect(objects[0].transform.position).toEqual({ x: 12.5, y: MODEL_BASE_HEIGHT, z: -7.25 });
    // 连续放置：点击后仍是放置工具（store 未回退 select）
    expect(fx.store.getState().activeToolId).toBe('placement');
    expect(fx.store.getState().placingAssetId).toBe('asset_tree');
    expect(fx.tools.getActiveTool()?.id).toBe('placement');

    // 第二次点击继续放置（连续会话合并一条历史）
    fx.clickCanvas(0);
    expect(fx.sceneManager.getObjects()).toHaveLength(2);
    expect(fx.store.getState().activeToolId).toBe('placement');
  });

  it('「回退 select」仅来自显式退出手势（ESC，T5.8 起唯一退出手势）：退出后 store 清 placingAssetId 属设计行为', () => {
    fx.pickAssetCard('asset_tree');
    fx.clickCanvas(0); // 放置一枚
    fx.pressKey('Escape'); // ESC 退出 → cancel → tool:changed(null) → App 订阅回 select

    expect(fx.store.getState().activeToolId).toBe('select');
    expect(fx.store.getState().placingAssetId).toBe(null);
    expect(fx.sceneManager.getObjects()).toHaveLength(1); // 已放置对象保留
  });

  it('右键点按（无拖拽）不退出工具：发上下文菜单请求，放置会话保持（T5.8 手势迁移）', () => {
    fx.pickAssetCard('asset_tree');
    fx.clickCanvas(0); // 放置一枚

    fx.rightTapCanvas(320, 240);

    expect(fx.menuRequests).toEqual([{ x: 320, y: 240 }]); // 分类器判 tap → 菜单请求
    expect(fx.store.getState().activeToolId).toBe('placement'); // 不退出
    expect(fx.store.getState().placingAssetId).toBe('asset_tree');
    expect(fx.sceneManager.getObjects()).toHaveLength(1); // 无新放置
  });

  it('右键拖拽不退出工具、不请求菜单（旋转归 OrbitControls 消费）', () => {
    fx.pickAssetCard('asset_tree');
    fx.clickCanvas(0);

    fx.rightDragCanvas(100, 100, 420, 380); // 位移远超 4px

    expect(fx.menuRequests).toEqual([]);
    expect(fx.store.getState().activeToolId).toBe('placement');
    expect(fx.sceneManager.getObjects()).toHaveLength(1);
  });

  it('ESC 同样走显式退出（回 select）——右键已迁移为菜单/旋转语义，不构成退出路径', () => {
    fx.pickAssetCard('asset_tree');
    fx.pressKey('Escape');
    expect(fx.store.getState().activeToolId).toBe('select');
  });

  it('activate 抛错（资产未注册）时 ToolManager 复位并回 select——复现症状的唯一可构造路径', () => {
    expect(() => fx.pickAssetCard('asset_unregistered')).toThrow(/资产未注册/);
    // ToolManager 复位 null → App 订阅回 select → store 清 placingAssetId（与复现观测一致）
    expect(fx.tools.getActiveTool()?.id ?? 'select').toBe('select');
    expect(fx.store.getState().activeToolId).toBe('select');
    expect(fx.store.getState().placingAssetId).toBe(null);
    // 但 UI 面板资产卡片必来自已注册清单（registerAssets 先于 setAssets 同步执行），
    // 该路径对真实用户点击不可达——见报告结论：复现观测应来自退出手势注入。
    expect(fx.sceneManager.getObjects()).toHaveLength(0);
  });
});
