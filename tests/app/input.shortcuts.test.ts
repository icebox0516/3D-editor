/**
 * tests/app/input.shortcuts.test.ts —— 输入接线快捷键补全测试（T2.4 奠基；T6.5 键表适配）。
 *
 * 覆盖（任务书「快捷键补全」+ 验收「复制/粘贴/删除/聚焦全部经命令且可撤销」）：
 * - F：聚焦当前选中（camera.focusObjects(ids)）；无选中不调用；Home：全景 focusAll；
 * - Ctrl+C → Ctrl+V：粘贴生成新对象（新 id、位置偏移 +1m），经 CreateObjectCommand 一条历史，
 *   undo 移除、redo 恢复；多选经 BatchCommand 合并为一条；粘贴后选中新对象；
 * - Ctrl+D：原地复制选中（偏移 1m），一条历史；
 * - 空剪贴板 Ctrl+V：无操作零命令；
 * - W/E/R：激活 TransformTool 并携带 translate/rotate/scale（经 gizmo.setMode 观测）；
 * - 放置工具激活时 R 归 PlacementTool（不切 gizmo 模式、工具不变）；W/E 同理不抢占；
 * - Delete：删除选中并入历史（既有行为回归）；
 * - T6.5 形状驱动键表：Q 选择；1 区域（记忆上次子工具）/ 2 路径 / 3 点 / 4 资产放置
 *   （数字键经 e.code 稳定判定，Shift+1..5 区域子工具直切）；同键再按退出（toggle）；
 *   键位与 toolIA VERTICAL_TOOLS 同源。
 * - T7.4 Tab 纯三维模式：Tab → workspaceStore.pure3d 翻位 + preventDefault；
 *   进入时激活绘制工具被 cancel；Shift/Ctrl/Alt 叠加与文本输入焦点不路由。
 *
 * 环境为 node：DOM 事件经最小 FakeEventTarget 注入（InputController 只依赖
 * addEventListener/removeEventListener 与事件字段；数字键路由依赖 e.code，Fake 事件
 * 由 key 派生 code，Shift 组合（e.key 为标点）可显式指定 code）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { createId } from '../../src/core/id';
import type { ID, Transform } from '../../src/core/types';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import type { SceneObject } from '../../src/scene/SceneObject';
import { createRegionObject } from '../../src/domain/regions';
import { AssetRegistry } from '../../src/registries/AssetRegistry';
import { HistoryManager } from '../../src/editor/history/HistoryManager';
import type { ToolContext } from '../../src/editor/tools';
import { PlacementTool } from '../../src/editor/tools/PlacementTool';
import { SelectTool } from '../../src/editor/tools/SelectTool';
import { ToolManager } from '../../src/editor/tools/ToolManager';
import { TransformTool } from '../../src/editor/tools/TransformTool';
import { DrawCircleTool } from '../../src/editor/tools/draw/DrawCircleTool';
import { DrawEllipseTool } from '../../src/editor/tools/draw/DrawEllipseTool';
import { DrawFreehandTool } from '../../src/editor/tools/draw/DrawFreehandTool';
import { DrawLineTool } from '../../src/editor/tools/draw/DrawLineTool';
import { DrawPointTool } from '../../src/editor/tools/draw/DrawPointTool';
import { DrawPolygonTool } from '../../src/editor/tools/draw/DrawPolygonTool';
import { DrawRectangleTool } from '../../src/editor/tools/draw/DrawRectangleTool';
import { createDrawGridConfig } from '../../src/editor/tools/draw/DrawGridConfig';
import type {
  CameraPort,
  GizmoPort,
  PreviewPort,
  ViewportPort,
} from '../../src/editor/services/ports';
import { MeasureSession } from '../../src/editor/services/measure';
import { MeasureTool } from '../../src/editor/tools/measure';
import { InputController } from '../../src/app/input';
import { VERTICAL_TOOLS } from '../../src/ui/tools/toolIA';
import { useEditorStore } from '../../src/ui/store';
import { useWorkspaceStore } from '../../src/ui/layout/workspaceStore';

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
    for (const handler of this.handlers.get(type) ?? []) handler(event);
  }
}

interface FakeKeyboardEvent {
  key: string;
  /** 物理 code（数字键路由依赖；缺省由 key 派生：数字 → DigitN、字母 → KeyX） */
  code?: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  preventDefault?: () => void;
  target?: unknown;
}

/** key → 物理键 code 派生（浏览器 KeyboardEvent 语义的最小子集） */
function deriveCode(key: string): string {
  if (/^[0-9]$/.test(key)) return `Digit${key}`;
  if (/^[a-z]$/i.test(key)) return `Key${key.toUpperCase()}`;
  return '';
}

function keyEvent(e: FakeKeyboardEvent): Record<string, unknown> {
  return {
    key: e.key,
    code: e.code ?? deriveCode(e.key),
    ctrlKey: e.ctrlKey ?? false,
    metaKey: e.metaKey ?? false,
    shiftKey: e.shiftKey ?? false,
    altKey: e.altKey ?? false,
    preventDefault: e.preventDefault ?? vi.fn(),
    target: e.target ?? null,
  };
}

// ── Fake Ports ───────────────────────────────────────────────

class RecordingCamera implements CameraPort {
  readonly focused: ID[][] = [];
  focusAllCount = 0;
  getMode(): 'perspective' | 'top' | 'front' | 'side' {
    return 'perspective';
  }
  setMode(): void {}
  setOrthoLock(): void {}
  focusObjects(ids: ID[]): void {
    this.focused.push([...ids]);
  }
  focusAll(): void {
    this.focusAllCount += 1;
  }
}

class NullViewport implements ViewportPort {
  pickObject(): ID | null {
    return null;
  }
  groundPoint() {
    return { x: 0, y: 0, z: 0 };
  }
  surfacePoint(): null {
    return null;
  }
}
class NullPreview implements PreviewPort {
  showGhost(): void {}
  updateGhost(): void {}
  hideGhost(): void {}
  updateDrawPreview(): void {}
  clear(): void {}
}

class RecordingGizmo implements GizmoPort {
  readonly attached: ID[][] = [];
  readonly modes: string[] = [];
  detachCount = 0;
  private cb: ((info: { objectId: ID; before: Transform; after: Transform }) => void) | null = null;
  attach(ids: ID[]): void {
    this.attached.push([...ids]);
  }
  detach(): void {
    this.detachCount += 1;
  }
  resync(): void {} // T8.6 缺陷①：port 增补，本测试不关注
  setMode(mode: 'translate' | 'rotate' | 'scale'): void {
    this.modes.push(mode);
  }
  onDragEnd(cb: (info: { objectId: ID; before: Transform; after: Transform }) => void): void {
    this.cb = cb;
  }
  emit(info: { objectId: ID; before: Transform; after: Transform }): void {
    this.cb?.(info);
  }
}

// ── 夹具 ─────────────────────────────────────────────────────

/** region 探针对象（T6.7：v1 building 要素夹具已删，复制/粘贴/删除用 region 驱动） */
function makeObject(name = '对象', x = 0, z = 0): SceneObject {
  const region = createRegionObject({
    shape: {
      type: 'polygon',
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 3 },
      ],
      baseHeight: 0,
      closed: true,
    },
    name,
  });
  return {
    ...region,
    transform: { ...region.transform, position: { x, y: 0, z } },
  };
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

  const camera = new RecordingCamera();
  const gizmo = new RecordingGizmo();
  const ctx: ToolContext = {
    sceneManager,
    selection,
    history,
    registries: { assets },
    viewport: new NullViewport(),
    camera,
    preview: new NullPreview(),
    eventBus,
  };
  const tools = new ToolManager(ctx);
  tools.register(new SelectTool(null));
  tools.register(new TransformTool(gizmo));
  tools.register(new PlacementTool());
  // 测量工具（T10.1 Delete 路由用）：真实 MeasureSession + no-op 覆盖层 Port
  const measureSession = new MeasureSession(eventBus);
  const measurePort = { updateDraft() {}, updateMeasurements() {}, clear() {} };
  tools.register(new MeasureTool('distance', measureSession, measurePort));
  const drawGrid = createDrawGridConfig();
  // 七形状绘制工具全量注册（与 app/bootstrap 装配一致，Shift+1..5 子工具直切可达）
  for (const tool of [
    new DrawPolygonTool(drawGrid),
    new DrawRectangleTool(drawGrid),
    new DrawCircleTool(drawGrid),
    new DrawEllipseTool(drawGrid),
    new DrawFreehandTool(drawGrid),
    new DrawLineTool(drawGrid),
    new DrawPointTool(drawGrid),
  ]) {
    tools.register(tool);
  }
  tools.activate('select');

  const viewportElement = new FakeEventTarget();
  const keyboardTarget = new FakeEventTarget();
  const input = new InputController({
    viewportElement: viewportElement as unknown as HTMLElement,
    keyboardTarget: keyboardTarget as unknown as Window,
    tools,
    history,
    sceneManager,
    selection,
    camera,
  });
  input.attach();

  const press = (e: FakeKeyboardEvent) => keyboardTarget.dispatch('keydown', keyEvent(e));

  return { eventBus, sceneManager, selection, history, camera, gizmo, tools, input, press, measureSession };
}

/** 撤销栈深度（往返测量后复原） */
function undoDepth(history: HistoryManager): number {
  let depth = 0;
  while (history.undo()) depth += 1;
  for (let i = 0; i < depth; i++) history.redo();
  return depth;
}

describe('InputController 快捷键：聚焦', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('F：聚焦当前选中集', () => {
    const a = makeObject();
    const b = makeObject('B', 5, 5);
    fx.sceneManager.addObject(a);
    fx.sceneManager.addObject(b);
    fx.selection.selectMany([a.id, b.id]);

    fx.press({ key: 'f' });
    expect(fx.camera.focused).toEqual([[a.id, b.id]]);
  });

  it('F 无选中：不调用聚焦', () => {
    fx.press({ key: 'f' });
    expect(fx.camera.focused).toEqual([]);
  });

  it('Home：全景聚焦一次', () => {
    fx.press({ key: 'Home' });
    expect(fx.camera.focusAllCount).toBe(1);
  });
});

describe('InputController 快捷键：复制 / 粘贴 / 复制偏移', () => {
  let fx: ReturnType<typeof setup>;
  let obj: SceneObject;
  beforeEach(() => {
    fx = setup();
    obj = makeObject('总部', 3, 7);
    fx.sceneManager.addObject(obj);
    fx.selection.select(obj.id);
  });

  it('Ctrl+C → Ctrl+V：新 id、位置 +1m 偏移、一条历史、粘贴后选中副本', () => {
    fx.press({ key: 'c', ctrlKey: true });
    expect(fx.sceneManager.getObjects()).toHaveLength(1); // 复制本身零命令零变化
    expect(fx.history.canUndo()).toBe(false);

    fx.press({ key: 'v', ctrlKey: true });
    const objects = fx.sceneManager.getObjects();
    expect(objects).toHaveLength(2);
    const copy = objects.find((o) => o.id !== obj.id)!;
    expect(copy.id).not.toBe(obj.id);
    expect(copy.id).toMatch(/^region_/);
    expect(copy.name).toBe('总部');
    expect(copy.transform.position).toEqual({ x: 4, y: 0, z: 8 });
    expect(fx.selection.getSelectedIds()).toEqual([copy.id]);

    // 一条历史：undo 移除副本、redo 恢复
    expect(undoDepth(fx.history)).toBe(1);
    expect(fx.history.undo()).toBe(true);
    expect(fx.sceneManager.getObjects()).toHaveLength(1);
    expect(fx.history.redo()).toBe(true);
    expect(fx.sceneManager.getObjects()).toHaveLength(2);
  });

  it('多选粘贴：BatchCommand 合并一条历史（一次 undo 全撤）', () => {
    const other = makeObject('B', 10, 10);
    fx.sceneManager.addObject(other);
    fx.selection.selectMany([obj.id, other.id]);

    fx.press({ key: 'c', ctrlKey: true });
    fx.press({ key: 'v', ctrlKey: true });
    expect(fx.sceneManager.getObjects()).toHaveLength(4);
    expect(undoDepth(fx.history)).toBe(1);
  });

  it('连续两次粘贴：两条历史、各偏移 +1m（从原始快照偏移）', () => {
    fx.press({ key: 'c', ctrlKey: true });
    fx.press({ key: 'v', ctrlKey: true });
    fx.selection.select(obj.id); // 回到原始对象
    fx.press({ key: 'v', ctrlKey: true });
    const copies = fx.sceneManager.getObjects().filter((o) => o.id !== obj.id);
    expect(copies).toHaveLength(2);
    expect(undoDepth(fx.history)).toBe(2);
  });

  it('Ctrl+D：复制选中（+1m）一条历史', () => {
    fx.press({ key: 'd', ctrlKey: true });
    const objects = fx.sceneManager.getObjects();
    expect(objects).toHaveLength(2);
    const copy = objects.find((o) => o.id !== obj.id)!;
    expect(copy.transform.position).toEqual({ x: 4, y: 0, z: 8 });
    expect(undoDepth(fx.history)).toBe(1);
  });

  it('空剪贴板 Ctrl+V：无操作零命令', () => {
    expect(() => fx.press({ key: 'v', ctrlKey: true })).not.toThrow();
    expect(fx.sceneManager.getObjects()).toHaveLength(1);
    expect(fx.history.canUndo()).toBe(false);
  });

  it('模型对象粘贴保留 asset 引用与 model_ 前缀', () => {
    type ModelLike = SceneObject & { asset: { assetId: string } };
    const model: ModelLike = {
      id: createId('model'),
      type: 'model',
      name: '树',
      parentId: null,
      layerId: null,
      visible: true,
      locked: false,
      transform: {
        position: { x: 2, y: 0, z: 2 },
        rotation: { x: 0, y: 1, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      properties: {},
      asset: { assetId: 'asset_tree' },
    };
    fx.sceneManager.addObject(model);
    fx.selection.selectMany([model.id]);

    fx.press({ key: 'd', ctrlKey: true });
    const copy = fx.sceneManager
      .getObjects()
      .find((o): o is ModelLike => o.id !== model.id && o.type === 'model')!;
    expect(copy.id).toMatch(/^model_/);
    expect(copy.asset.assetId).toBe('asset_tree');
    expect(copy.transform.rotation).toEqual(model.transform.rotation);
  });
});

describe('InputController 快捷键：W/E/R 工具路由', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('W/E/R：激活变换工具并设置对应 gizmo 模式', () => {
    fx.press({ key: 'w' });
    expect(fx.tools.getActiveTool()?.id).toBe('transform');
    expect(fx.gizmo.modes).toEqual(['translate']);

    fx.press({ key: 'e' });
    expect(fx.gizmo.modes).toEqual(['translate', 'rotate']);

    fx.press({ key: 'r' });
    expect(fx.gizmo.modes).toEqual(['translate', 'rotate', 'scale']);
  });

  it('放置工具激活时 R 归 PlacementTool：工具不变、gizmo 模式不受扰', () => {
    fx.press({ key: 'w' }); // 先进变换模式
    fx.tools.activate('placement', { assetId: 'asset_tree' });
    expect(fx.tools.getActiveTool()?.id).toBe('placement');

    fx.press({ key: 'r' });
    expect(fx.tools.getActiveTool()?.id).toBe('placement'); // 未被抢占
    expect(fx.gizmo.modes).toEqual(['translate']); // 未追加 scale
  });

  it('Ctrl+R 不触发模式切换（浏览器刷新语义让位）', () => {
    fx.press({ key: 'r', ctrlKey: true });
    expect(fx.tools.getActiveTool()?.id).toBe('select');
    expect(fx.gizmo.modes).toEqual([]);
  });
});

describe('InputController 快捷键：删除（回归）', () => {
  it('Delete 删除选中并入历史', () => {
    const fx = setup();
    const a = makeObject();
    const b = makeObject('B');
    fx.sceneManager.addObject(a);
    fx.sceneManager.addObject(b);
    fx.selection.selectMany([a.id, b.id]);

    fx.press({ key: 'Delete' });
    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(undoDepth(fx.history)).toBe(1);
    fx.history.undo();
    expect(fx.sceneManager.getObjects()).toHaveLength(2);
  });

  it('测量工具激活时 Delete 归工具语义（T10.1）：选中对象不删、删除上一条测量', () => {
    const fx = setup();
    const obj = makeObject();
    fx.sceneManager.addObject(obj);
    fx.selection.select(obj.id);
    fx.measureSession.add({
      id: 'measure_route1',
      kind: 'distance',
      points: [
        { x: 0, y: 0, z: 0 },
        { x: 3, y: 4, z: 0 },
      ],
      createdAt: 1,
    });

    fx.tools.activate('measure.distance');
    fx.press({ key: 'Delete' });

    expect(fx.sceneManager.getObjects()).toHaveLength(1); // 对象整删路径不触发
    expect(fx.selection.isSelected(obj.id)).toBe(true);
    expect(fx.measureSession.list()).toHaveLength(0); // 删除上一条测量
    expect(fx.history.canUndo()).toBe(false); // 零 Command
  });
});

describe('InputController 快捷键：分组 / 解散组（T8.5）', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('Ctrl+G：选中对象建组一条历史，undo 复原', () => {
    const a = makeObject('甲');
    const b = makeObject('乙');
    fx.sceneManager.addObject(a);
    fx.sceneManager.addObject(b);
    fx.selection.selectMany([a.id, b.id]);

    fx.press({ key: 'g', ctrlKey: true });
    const objects = fx.sceneManager.getObjects();
    expect(objects).toHaveLength(3);
    const group = objects.find((o) => o.type === 'group')!;
    expect(group).toBeDefined();
    expect(fx.sceneManager.getObject(a.id)!.parentId).toBe(group.id);
    expect(fx.sceneManager.getObject(b.id)!.parentId).toBe(group.id);
    expect(undoDepth(fx.history)).toBe(1);
  });

  it('Ctrl+Shift+G：解散选中组（成员上提）一条历史', () => {
    const a = makeObject('甲');
    const b = makeObject('乙');
    fx.sceneManager.addObject(a);
    fx.sceneManager.addObject(b);
    fx.selection.selectMany([a.id, b.id]);
    fx.press({ key: 'g', ctrlKey: true });
    const group = fx.sceneManager.getObjects().find((o) => o.type === 'group')!;

    fx.selection.select(group.id);
    fx.press({ key: 'G', shiftKey: true, ctrlKey: true });
    expect(fx.sceneManager.getObjects().some((o) => o.type === 'group')).toBe(false);
    expect(fx.sceneManager.getObject(a.id)!.parentId).toBeNull();
    expect(fx.sceneManager.getObject(b.id)!.parentId).toBeNull();
    expect(undoDepth(fx.history)).toBe(2); // 建组 + 解散各一条
  });

  it('空选 Ctrl+G / 无组可解散 Ctrl+Shift+G：no-op 零历史', () => {
    fx.press({ key: 'g', ctrlKey: true });
    expect(fx.history.canUndo()).toBe(false);
    fx.press({ key: 'G', shiftKey: true, ctrlKey: true });
    expect(fx.history.canUndo()).toBe(false);

    const a = makeObject('甲'); // 只选普通对象：解散无组可解
    fx.sceneManager.addObject(a);
    fx.selection.select(a.id);
    fx.press({ key: 'G', shiftKey: true, ctrlKey: true });
    expect(fx.history.canUndo()).toBe(false);
    expect(fx.sceneManager.getObject(a.id)).toBeDefined();
  });

  it('粘贴保留层级：复制组成员（单独）→ 副本 parentId 指向原组', () => {
    const a = makeObject('甲');
    fx.sceneManager.addObject(a);
    fx.selection.select(a.id);
    fx.press({ key: 'g', ctrlKey: true }); // 建组
    const group = fx.sceneManager.getObjects().find((o) => o.type === 'group')!;

    fx.selection.select(a.id);
    fx.press({ key: 'c', ctrlKey: true });
    fx.press({ key: 'v', ctrlKey: true });
    const objects = fx.sceneManager.getObjects();
    expect(objects).toHaveLength(3);
    const copy = objects.find((o) => o.id !== a.id && o.type === 'region')!;
    expect(copy.parentId).toBe(group.id); // 副本仍在组内
  });
});

describe('InputController 快捷键：Q / 数字键与 gizmo 记账（T6.5 形状驱动键表）', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
    useEditorStore.getState().setDrawTarget(null);
    useEditorStore.getState().setGizmoMode('translate');
    useEditorStore.setState({ lastAreaShape: 'polygon', lastAssetId: null });
  });

  it('Q：从变换 / 绘制态回到选择工具', () => {
    fx.press({ key: '2' }); // 进入路径绘制
    expect(fx.tools.getActiveTool()?.id).toBe('draw-line');
    fx.press({ key: 'q' });
    expect(fx.tools.getActiveTool()?.id).toBe('select');
  });

  it('1 / 2 / 3：区域（记忆子工具）/ 路径 / 点进入对应绘制工具', () => {
    fx.press({ key: '1' });
    expect(fx.tools.getActiveTool()?.id).toBe('draw-polygon'); // 缺省记忆 = 多边形
    fx.press({ key: 'q' });
    fx.press({ key: '2' });
    expect(fx.tools.getActiveTool()?.id).toBe('draw-line');
    fx.press({ key: 'q' });
    fx.press({ key: '3' });
    expect(fx.tools.getActiveTool()?.id).toBe('draw-point');
  });

  it('Shift+1..5：区域组子工具直切（e.code 判定，Shift 下 e.key 为标点）', () => {
    fx.press({ key: '@', code: 'Digit2', shiftKey: true }); // ⇧2 → 矩形
    expect(fx.tools.getActiveTool()?.id).toBe('draw-rectangle');
    fx.press({ key: 'q' });
    fx.press({ key: '%', code: 'Digit5', shiftKey: true }); // ⇧5 → 自由形状
    expect(fx.tools.getActiveTool()?.id).toBe('draw-freehand');
  });

  it('1 记忆上次子工具：⇧2 切矩形后再按 1 进入矩形', () => {
    fx.press({ key: '@', code: 'Digit2', shiftKey: true });
    fx.press({ key: 'q' });
    fx.press({ key: '1' });
    expect(fx.tools.getActiveTool()?.id).toBe('draw-rectangle');
  });

  it('键 4 无记忆资产：不激活（先在内容浏览器选择资产）', () => {
    fx.press({ key: '4' });
    expect(fx.tools.getActiveTool()?.id).toBe('select');
  });

  it('键 4 有记忆资产：进入放置工具', () => {
    useEditorStore.setState({ lastAssetId: 'asset_tree' });
    fx.press({ key: '4' });
    expect(fx.tools.getActiveTool()?.id).toBe('placement');
  });

  it('激活中再按同键 → cancel 退出（drawTarget 记账保留供重入）', () => {
    fx.press({ key: '2' });
    expect(fx.tools.getActiveTool()?.id).toBe('draw-line');
    fx.press({ key: '2' });
    expect(fx.tools.getActiveTool()).toBeNull();
    expect(useEditorStore.getState().drawTarget).toEqual({ shapeType: 'line' });
  });

  it('同组不同形状（⇧1 多边形 → ⇧3 圆形）→ 切换而非退出', () => {
    fx.press({ key: '!', code: 'Digit1', shiftKey: true }); // ⇧1 → 多边形
    fx.press({ key: '#', code: 'Digit3', shiftKey: true }); // ⇧3 → 圆形
    expect(fx.tools.getActiveTool()?.id).toBe('draw-circle');
    expect(useEditorStore.getState().drawTarget).toEqual({ shapeType: 'circle' });
  });

  it('W/E/R 经共享入口写 store.gizmoMode 记账（键盘与点击同路）', () => {
    fx.press({ key: 'e' });
    expect(fx.tools.getActiveTool()?.id).toBe('transform');
    expect(useEditorStore.getState().gizmoMode).toBe('rotate');
    fx.press({ key: 'r' });
    expect(useEditorStore.getState().gizmoMode).toBe('scale');
  });

  it('Ctrl 修饰不触发（Ctrl+Q / Ctrl+1 让位浏览器组合）', () => {
    fx.press({ key: '2' });
    fx.press({ key: 'q', ctrlKey: true });
    expect(fx.tools.getActiveTool()?.id).toBe('draw-line'); // 未被 Ctrl+Q 抢占
    fx.press({ key: '1', ctrlKey: true });
    expect(fx.tools.getActiveTool()?.id).toBe('draw-line');
  });

  it('键位与 toolIA 键表同源（1–4 → VERTICAL_TOOLS 同一组工具）', () => {
    for (const item of VERTICAL_TOOLS) {
      // 区域主钮解析记忆子工具（缺省多边形）；放置需资产记忆（区域 toolId 为记忆解析占位）
      useEditorStore.setState({ lastAreaShape: 'polygon', lastAssetId: 'asset_tree' });
      fx.press({ key: 'q' });
      fx.press({ key: item.key });
      expect(fx.tools.getActiveTool()?.id, `按 ${item.key} 应进入 ${item.toolId}`).toBe(
        item.toolId,
      );
    }
  });
});

// ── Tab 纯三维工作模式（T7.4）────────────────────────────────

describe('InputController 快捷键：Tab 纯三维模式', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
    useWorkspaceStore.getState().setPure3d(false);
  });

  it('Tab → pure3d 翻位 + preventDefault 调用（阻断焦点遍历默认行为）', () => {
    const preventDefault = vi.fn();
    fx.press({ key: 'Tab', preventDefault });
    expect(useWorkspaceStore.getState().pure3d).toBe(true);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('再按 Tab 退出（双向切换）', () => {
    fx.press({ key: 'Tab' });
    fx.press({ key: 'Tab' });
    expect(useWorkspaceStore.getState().pure3d).toBe(false);
  });

  it('进入时激活绘制工具被 cancel（togglePure3d 共享入口语义）', () => {
    fx.press({ key: '2' }); // draw-line
    expect(fx.tools.getActiveTool()?.id).toBe('draw-line');
    fx.press({ key: 'Tab' });
    expect(fx.tools.getActiveTool()).toBeNull();
    expect(useWorkspaceStore.getState().pure3d).toBe(true);
  });

  it('Shift+Tab / Ctrl+Tab / Alt+Tab 不路由（浏览器组合让位）', () => {
    fx.press({ key: 'Tab', shiftKey: true });
    expect(useWorkspaceStore.getState().pure3d).toBe(false);
    fx.press({ key: 'Tab', ctrlKey: true });
    expect(useWorkspaceStore.getState().pure3d).toBe(false);
    fx.press({ key: 'Tab', metaKey: true }); // Mac Cmd 映射 ctrl 语义
    expect(useWorkspaceStore.getState().pure3d).toBe(false);
    fx.press({ key: 'Tab', altKey: true });
    expect(useWorkspaceStore.getState().pure3d).toBe(false);
  });

  it('文本输入焦点时 Tab 不拦截（isEditableTarget 既有守卫复用）', () => {
    fx.press({ key: 'Tab', target: { tagName: 'input' } });
    expect(useWorkspaceStore.getState().pure3d).toBe(false);
    fx.press({ key: 'Tab', target: { isContentEditable: true } });
    expect(useWorkspaceStore.getState().pure3d).toBe(false);
  });
});
