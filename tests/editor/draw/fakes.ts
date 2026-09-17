/**
 * tests/editor/draw/fakes —— 绘制/编辑工具测试共用装置（非测试文件，vitest 不收集）。
 *
 * 提供：FakeViewport（屏幕坐标 → 预置地面点）、FakeCamera（记录 setMode/setOrthoLock）、
 * FakePreview（记录 updateDrawPreview / clear）、setupShapeDraw 装配（EventBus +
 * SceneManager + HistoryManager + ToolManager + draw:status 收集）。
 * 边界：零 three（editor 层工具只面向 Port），所有断言数据来自 Fake 的调用留痕；
 *      T6.9：v1 要素/样式注册装置（setupDraw/makeElementDef/makeStyle/elementsOf）已随
 *      旧契约类型面删除——七形状工具只产 RegionObject，零注册依赖。
 */
import { EventBus } from '../../../src/core/events/EventBus';
import { createId } from '../../../src/core/id';
import type { ID, Vec3 } from '../../../src/core/types';
import type { RegionObject } from '../../../src/domain/regions';
import { AssetRegistry } from '../../../src/registries/AssetRegistry';
import { HistoryManager } from '../../../src/editor/history/HistoryManager';
import type {
  CameraPort,
  DrawPreviewState,
  KeyboardEventInfo,
  PointerEventInfo,
  PreviewPort,
  ViewportPort,
} from '../../../src/editor/services/ports';
import type { Tool, ToolContext } from '../../../src/editor/tools';
import { ToolManager } from '../../../src/editor/tools/ToolManager';
import type { Layer } from '../../../src/scene/Layer';
import { SceneManager } from '../../../src/scene/SceneManager';
import { SelectionManager } from '../../../src/scene/SelectionManager';

// ── Fake Port ─────────────────────────────────────────────

/** 预置地面坐标的 Fake 视口：groundPoint 按屏幕坐标查表，缺省返回 groundDefault（surfacePoint 恒 null——绘制工具不消费） */
export class FakeViewport implements ViewportPort {
  private readonly groundAt = new Map<string, Vec3 | null>();
  groundDefault: Vec3 | null = { x: 0, y: 0, z: 0 };

  setGround(x: number, y: number, p: Vec3 | null): void {
    this.groundAt.set(`${x},${y}`, p);
  }

  pickObject(): ID | null {
    return null;
  }

  groundPoint(x: number, y: number): Vec3 | null {
    const stored = this.groundAt.get(`${x},${y}`);
    return stored === undefined ? this.groundDefault : stored; // 显式 null 是合法返回值
  }

  surfacePoint(): Vec3 | null {
    return null;
  }
}

/**
 * 记录型 Fake 相机：验证进入绘制切顶视 + 锁旋转、退出恢复原机位（T4.1 B3：
 * getMode/setMode 维护当前模式，测试可预设进入前机位，如 mode='front'） */
export class FakeCamera implements CameraPort {
  /** 当前机位模式（getMode 读；setMode 写；测试可直接预设） */
  mode: 'perspective' | 'top' | 'front' | 'side' = 'perspective';
  readonly modes: string[] = [];
  readonly orthoLocks: boolean[] = [];

  getMode(): 'perspective' | 'top' | 'front' | 'side' {
    return this.mode;
  }

  setMode(mode: 'perspective' | 'top' | 'front' | 'side'): void {
    this.mode = mode;
    this.modes.push(mode);
  }
  setOrthoLock(locked: boolean): void {
    this.orthoLocks.push(locked);
  }
  focusObjects(): void {}
  focusAll(): void {}
}

/** 记录型 Fake 预览：绘制预览调用全留痕（Ghost 路径不应被绘制工具触达） */
export class FakePreview implements PreviewPort {
  readonly drawUpdates: DrawPreviewState[] = [];
  clearCount = 0;
  ghostCalls = 0;

  showGhost(): void {
    this.ghostCalls += 1;
  }
  updateGhost(): void {
    this.ghostCalls += 1;
  }
  hideGhost(): void {
    this.ghostCalls += 1;
  }
  updateDrawPreview(state: DrawPreviewState): void {
    this.drawUpdates.push(state);
  }
  clear(): void {
    this.clearCount += 1;
  }

  get lastDrawState(): DrawPreviewState | undefined {
    return this.drawUpdates[this.drawUpdates.length - 1];
  }
}

// ── 事件构造 ──────────────────────────────────────────────

export function pointer(
  x: number,
  y: number,
  overrides: Partial<PointerEventInfo> = {},
): PointerEventInfo {
  return {
    screenX: x,
    screenY: y,
    button: 'left',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...overrides,
  };
}

export function key(k: string, overrides: Partial<KeyboardEventInfo> = {}): KeyboardEventInfo {
  return { key: k, ctrlKey: false, shiftKey: false, altKey: false, ...overrides };
}

export const ESC = key('Escape');

// ── 装配 ──────────────────────────────────────────────────

export interface DrawFixture<T extends Tool = Tool> {
  eventBus: EventBus;
  sceneManager: SceneManager;
  selection: SelectionManager;
  history: HistoryManager;
  viewport: FakeViewport;
  camera: FakeCamera;
  preview: FakePreview;
  ctx: ToolContext;
  tools: ToolManager;
  tool: T;
  /** draw:status 事件负载收集（订阅即收集，含历史） */
  statuses: unknown[];
}

/** 形状绘制工具测试环境（在 DrawFixture 之上补 addLayer 便捷入口；零注册依赖——形状工具只产 RegionObject） */
export type ShapeDrawFixture<T extends Tool> = DrawFixture<T> & {
  /** 向测试场景添加具名图层（归层用例；返回 Layer 供 id 断言） */
  addLayer(name: string): Layer;
};

/**
 * 装配一个形状绘制工具测试环境（无注册依赖：形状工具只产 RegionObject）；
 * 激活由用例自行调用（params { shape, perspective? }）。
 */
export function setupShapeDraw<T extends Tool>(tool: T): ShapeDrawFixture<T> {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const history = new HistoryManager({ sceneManager, selection, eventBus });

  const ctx: ToolContext = {
    sceneManager,
    selection,
    history,
    registries: { assets: new AssetRegistry() },
    viewport: new FakeViewport(),
    camera: new FakeCamera(),
    preview: new FakePreview(),
    eventBus,
  };
  const tools = new ToolManager(ctx);
  tools.register(tool);

  const statuses: unknown[] = [];
  eventBus.on('draw:status', (p) => statuses.push(p));

  return {
    eventBus,
    sceneManager,
    selection,
    history,
    viewport: ctx.viewport as FakeViewport,
    camera: ctx.camera as FakeCamera,
    preview: ctx.preview as FakePreview,
    ctx,
    tools,
    tool,
    statuses,
    addLayer: (name: string) => addLayer(sceneManager, name),
  };
}

/** 历史深度计数（undo 到底再 redo 还原，不改变最终状态） */
export function undoDepth(history: HistoryManager): number {
  let n = 0;
  while (history.undo()) n += 1;
  while (history.redo()) {
    /* 还原 */
  }
  return n;
}

/** 场景中全部 RegionObject（type === 'region' 收窄） */
export function regionsOf(sceneManager: SceneManager): RegionObject[] {
  return sceneManager.getObjects((o) => o.type === 'region') as RegionObject[];
}

/** 向测试场景添加具名图层（T4.1 B1 归层用例：返回 Layer 供 id 断言） */
export function addLayer(
  sceneManager: SceneManager,
  name: string,
): Layer {
  const layer: Layer = {
    id: createId('layer'),
    name,
    visible: true,
    locked: false,
    opacity: 1,
    order: sceneManager.getLayers().length,
    objectIds: [],
  };
  sceneManager.addLayer(layer);
  return layer;
}
