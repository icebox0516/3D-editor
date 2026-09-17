/**
 * tests/editor/PlacementTool.enhanced.test.ts —— 放置工具增强测试（T2.2）。
 *
 * 覆盖（T2.2 验收标准）：
 * - 滚轮缩放 Ghost 预览：每档 ±0.1，夹取 [0.2, 5]；未显示 Ghost 时不触 Port；
 *   落点时进 CreateObjectCommand 的 transform（所见即所放）；done 后忽略；
 * - R 键旋转 Ghost 预览：每按 +45°（π/4），大小写均生效，Ctrl/Alt 组合忽略；
 *   与资产默认、随机旋转相加落入放置 transform；
 * - 随机旋转/缩放 200 次采样全部落在 [min, max]（相对资产默认值；默认合并批次下兼测会话增长）；
 * - mergeBatch（默认 true）：连续放置 N 次仅 1 条历史（BatchCommand 会话批次原地增长，
 *   每次点击后对象即时可见），undo 一次全撤、redo 一次全恢复；false 时逐条入栈逐个撤销；
 *   退出后重新激活另起会话；continuous:false 同样经批次合并为 1 条；
 * - 回归：ESC 退出（T5.8 唯一退出手势）不删除已放置对象；地面吸附恒开（落点 y=0，groundPoint 保证）。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import type { ID, Transform, Vec3 } from '../../src/core/types';
import { deepClone } from '../../src/core/utils';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import type { ModelAsset } from '../../src/domain/assets';
import { MODEL_BASE_HEIGHT } from '../../src/domain/assets';
import type { ModelObject } from '../../src/domain/assets';
import { AssetRegistry } from '../../src/registries/AssetRegistry';
import { HistoryManager } from '../../src/editor/history/HistoryManager';
import type { ToolContext } from '../../src/editor/tools';
import { PlacementTool } from '../../src/editor/tools/PlacementTool';
import { ToolManager } from '../../src/editor/tools/ToolManager';
import type {
  CameraPort,
  DrawPreviewState,
  KeyboardEventInfo,
  PointerEventInfo,
  PreviewPort,
  ViewportPort,
} from '../../src/editor/services/ports';

/** 预置地面坐标的 Fake 视口（沿用 PlacementTool.test.ts 的 Fake ports 模式） */
class FakeViewport implements ViewportPort {

  /** 测量拾取（T10.1 ViewportPort 增补）：本工具测试不消费，恒 null */
  surfacePoint(): null {
    return null;
  }
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
    return stored === undefined ? this.groundDefault : stored;
  }
}

class FakeCamera implements CameraPort {
  getMode(): 'perspective' | 'top' | 'front' | 'side' {
    return 'perspective';
  }
  setMode(): void {}
  setOrthoLock(): void {}
  focusObjects(): void {}
  focusAll(): void {}
}

/** 记录型 Fake 预览：Ghost 调用全留痕，供预览参数断言 */
class FakePreview implements PreviewPort {
  readonly shown: Array<{ assetId: ID; t: Transform }> = [];
  readonly updates: Transform[] = [];
  hideCount = 0;
  visible = false;
  readonly drawUpdates: DrawPreviewState[] = [];
  clearCount = 0;

  showGhost(assetId: ID, t: Transform): void {
    this.visible = true;
    this.shown.push({ assetId, t: deepClone(t) });
  }
  updateGhost(t: Transform): void {
    if (!this.visible) throw new Error('updateGhost 在未 showGhost 时调用');
    this.updates.push(deepClone(t));
  }
  hideGhost(): void {
    this.hideCount += 1;
    this.visible = false;
  }
  updateDrawPreview(state: DrawPreviewState): void {
    this.drawUpdates.push(state);
  }
  clear(): void {
    this.clearCount += 1;
    this.visible = false;
  }
}

function makeAsset(overrides: Partial<ModelAsset> = {}): ModelAsset {
  return {
    id: 'asset_tree',
    name: '测试树',
    category: 'tree',
    file: 'models/tree/tree.glb',
    tags: ['tree'],
    defaultScale: { x: 1, y: 1, z: 1 },
    defaultRotation: { x: 0, y: 0, z: 0 },
    ...overrides,
  };
}

function pointer(x: number, y: number, overrides: Partial<PointerEventInfo> = {}): PointerEventInfo {
  return { screenX: x, screenY: y, button: 'left', ctrlKey: false, shiftKey: false, altKey: false, ...overrides };
}

function key(k: string, overrides: Partial<KeyboardEventInfo> = {}): KeyboardEventInfo {
  return { key: k, ctrlKey: false, shiftKey: false, altKey: false, ...overrides };
}

const WHEEL_UP = 100; // 浏览器滚轮一档的典型 deltaY
const WHEEL_DOWN = -100;

function setup(asset: ModelAsset = makeAsset()) {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const history = new HistoryManager({ sceneManager, selection, eventBus });

  const assets = new AssetRegistry();
  assets.register({ kind: 'file', asset });

  const viewport = new FakeViewport();
  viewport.setGround(10, 10, { x: 5, y: 0, z: 0 });
  viewport.setGround(20, 20, { x: 6, y: 0, z: 1 });
  viewport.setGround(30, 30, { x: 7, y: 0, z: 2 });

  const preview = new FakePreview();
  const ctx: ToolContext = {
    sceneManager,
    selection,
    history,
    registries: { assets },
    viewport,
    camera: new FakeCamera(),
    preview,
    eventBus,
  };
  const tools = new ToolManager(ctx);
  const tool = new PlacementTool();
  tools.register(tool);

  return { eventBus, sceneManager, selection, history, asset, viewport, preview, ctx, tools, tool };
}

function modelObjects(sceneManager: SceneManager): ModelObject[] {
  return sceneManager.getObjects((o) => o.type === 'model') as ModelObject[];
}

describe('PlacementTool 滚轮缩放预览', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
    fx.tools.activate('placement', { assetId: fx.asset.id, continuous: true });
  });

  it('正向滚轮每档 +0.1：Ghost 立即缩放，且落点进放置 transform（连续模式保留）', () => {
    fx.tool.onPointerMove(pointer(10, 10));
    expect(fx.preview.shown[0].t.scale).toEqual({ x: 1, y: 1, z: 1 });

    fx.tool.onWheel!(WHEEL_UP);
    expect(fx.preview.updates).toHaveLength(1);
    expect(fx.preview.updates[0].scale.x).toBeCloseTo(1.1, 10);
    expect(fx.preview.updates[0].scale.y).toBeCloseTo(1.1, 10);
    expect(fx.preview.updates[0].scale.z).toBeCloseTo(1.1, 10);

    fx.tool.onWheel!(WHEEL_UP);
    expect(fx.preview.updates[1].scale.x).toBeCloseTo(1.2, 10);

    fx.tool.onPointerDown(pointer(10, 10));
    const obj = modelObjects(fx.sceneManager)[0];
    expect(obj.transform.scale.x).toBeCloseTo(1.2, 10);
    expect(obj.transform.scale.y).toBeCloseTo(1.2, 10);
    expect(obj.transform.scale.z).toBeCloseTo(1.2, 10);

    // 连续模式：滚轮系数保留到下一枚
    fx.tool.onPointerDown(pointer(20, 20));
    expect(modelObjects(fx.sceneManager)[1].transform.scale.x).toBeCloseTo(1.2, 10);
  });

  it('持续缩放夹取 [0.2, 5]：下界 0.2、上界 5，不越界不为 NaN', () => {
    fx.tool.onPointerMove(pointer(10, 10));

    for (let i = 0; i < 10; i++) fx.tool.onWheel!(WHEEL_DOWN);
    expect(fx.preview.updates.at(-1)!.scale.x).toBeCloseTo(0.2, 10);
    fx.tool.onWheel!(WHEEL_DOWN); // 越过下界仍夹在 0.2
    expect(fx.preview.updates.at(-1)!.scale.x).toBeCloseTo(0.2, 10);

    for (let i = 0; i < 100; i++) fx.tool.onWheel!(WHEEL_UP);
    const s = fx.preview.updates.at(-1)!.scale;
    expect(s.x).toBeCloseTo(5, 10);
    expect(Number.isFinite(s.x)).toBe(true);
    expect(Number.isFinite(s.y)).toBe(true);
    expect(Number.isFinite(s.z)).toBe(true);
  });

  it('Ghost 未显示时滚轮：不触 Port，仅更新内部 scale，下次 move 亮出新值', () => {
    fx.tool.onWheel!(WHEEL_UP);

    expect(fx.preview.shown).toHaveLength(0);
    expect(fx.preview.updates).toHaveLength(0);

    fx.tool.onPointerMove(pointer(10, 10));
    expect(fx.preview.shown).toHaveLength(1);
    expect(fx.preview.shown[0].t.scale.x).toBeCloseTo(1.1, 10);
  });

  it('单次模式放置完成后：滚轮与 R 键均忽略（不再更新预览）', () => {
    fx.tools.activate('placement', { assetId: fx.asset.id, continuous: false });
    fx.tool.onPointerMove(pointer(10, 10));
    fx.tool.onPointerDown(pointer(10, 10));
    expect(modelObjects(fx.sceneManager)).toHaveLength(1);
    const updatesBefore = fx.preview.updates.length;

    fx.tool.onWheel!(WHEEL_UP);
    fx.tool.onKeyDown(key('r'));

    expect(fx.preview.updates.length).toBe(updatesBefore);
    expect(modelObjects(fx.sceneManager)).toHaveLength(1);
  });
});

describe('PlacementTool R 键旋转预览', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
    fx.tools.activate('placement', { assetId: fx.asset.id, continuous: true });
  });

  it('每按一次 r 绕 Y +45°（可叠加），Ghost 即时更新', () => {
    fx.tool.onPointerMove(pointer(10, 10));
    expect(fx.preview.shown[0].t.rotation.y).toBe(0);

    fx.tool.onKeyDown(key('r'));
    expect(fx.preview.updates[0].rotation.y).toBeCloseTo(Math.PI / 4, 10);

    fx.tool.onKeyDown(key('r'));
    expect(fx.preview.updates[1].rotation.y).toBeCloseTo(Math.PI / 2, 10);
  });

  it('大写 R 同样生效；Ctrl/Alt 组合键忽略', () => {
    fx.tool.onPointerMove(pointer(10, 10));

    fx.tool.onKeyDown(key('R'));
    expect(fx.preview.updates.at(-1)!.rotation.y).toBeCloseTo(Math.PI / 4, 10);

    fx.tool.onKeyDown(key('r', { ctrlKey: true }));
    fx.tool.onKeyDown(key('r', { altKey: true }));
    expect(fx.preview.updates.length).toBe(1); // 组合键未产生新更新
  });

  it('R 旋转与资产默认、随机旋转相加落入放置 transform（Ghost 与落点一致）', () => {
    const asset = makeAsset({ defaultRotation: { x: 0, y: 0.2, z: 0 } });
    const f = setup(asset);
    f.tools.activate('placement', {
      assetId: asset.id,
      continuous: true,
      randomRotation: [0.1, 0.1],
    });
    f.tool.onPointerMove(pointer(10, 10));
    f.tool.onKeyDown(key('r'));

    const expected = 0.2 + 0.1 + Math.PI / 4;
    expect(f.preview.updates.at(-1)!.rotation.y).toBeCloseTo(expected, 10);

    f.tool.onPointerDown(pointer(10, 10));
    expect(modelObjects(f.sceneManager)[0].transform.rotation.y).toBeCloseTo(expected, 10);
  });
});

describe('PlacementTool 随机区间 200 采样', () => {
  it('200 次采样全部落在 [min,max]（相对资产默认；默认合并批次兼测会话增长）', () => {
    const asset = makeAsset({
      defaultScale: { x: 2, y: 2, z: 2 },
      defaultRotation: { x: 0, y: 0.5, z: 0 },
    });
    const fx = setup(asset);
    fx.tools.activate('placement', {
      assetId: asset.id,
      continuous: true, // mergeBatch 缺省 true：兼测 200 枚增长批次
      randomRotation: [-0.5, 0.5],
      randomScale: [0.8, 1.2],
    });

    for (let i = 0; i < 200; i++) {
      fx.tool.onPointerDown(pointer(10, 10));
    }

    const objs = modelObjects(fx.sceneManager);
    expect(objs).toHaveLength(200);
    for (const o of objs) {
      expect(o.transform.rotation.y).toBeGreaterThanOrEqual(0); // 默认 0.5 − 0.5
      expect(o.transform.rotation.y).toBeLessThanOrEqual(1); // 默认 0.5 + 0.5
      const factor = o.transform.scale.x / 2; // 相对默认 2 的均匀系数
      expect(factor).toBeGreaterThanOrEqual(0.8);
      expect(factor).toBeLessThanOrEqual(1.2);
      expect(o.transform.scale.y).toBeCloseTo(o.transform.scale.x, 12);
      expect(o.transform.scale.z).toBeCloseTo(o.transform.scale.x, 12);
    }

    // 200 枚仅 1 条历史：undo 一次全撤
    expect(fx.history.undo()).toBe(true);
    expect(modelObjects(fx.sceneManager)).toHaveLength(0);
    expect(fx.history.undo()).toBe(false);
  });
});

describe('PlacementTool BatchCommand 合并', () => {
  it('默认 mergeBatch=true：连续放置 3 次仅 1 条历史，每次点击后对象即时可见，undo 一次全撤、redo 一次全恢复', () => {
    const fx = setup();
    fx.tools.activate('placement', { assetId: fx.asset.id, continuous: true });

    fx.tool.onPointerDown(pointer(10, 10));
    expect(modelObjects(fx.sceneManager)).toHaveLength(1); // 即时可见
    fx.tool.onPointerDown(pointer(20, 20));
    expect(modelObjects(fx.sceneManager)).toHaveLength(2);
    fx.tool.onPointerDown(pointer(30, 30));
    expect(modelObjects(fx.sceneManager)).toHaveLength(3);
    expect(fx.history.canUndo()).toBe(true);

    // 仅 1 条历史：undo 一次全撤，第二次 undo 无命令
    expect(fx.history.undo()).toBe(true);
    expect(modelObjects(fx.sceneManager)).toHaveLength(0);
    expect(fx.history.undo()).toBe(false);

    // redo 一次全恢复
    expect(fx.history.redo()).toBe(true);
    expect(modelObjects(fx.sceneManager)).toHaveLength(3);
    expect(fx.history.redo()).toBe(false);
  });

  it('mergeBatch=false：逐条入栈，undo 逐个撤销（T1.6 语义）', () => {
    const fx = setup();
    fx.tools.activate('placement', { assetId: fx.asset.id, continuous: true, mergeBatch: false });

    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(20, 20));
    fx.tool.onPointerDown(pointer(30, 30));
    expect(modelObjects(fx.sceneManager)).toHaveLength(3);

    expect(fx.history.undo()).toBe(true);
    expect(modelObjects(fx.sceneManager)).toHaveLength(2);
    expect(fx.history.undo()).toBe(true);
    expect(modelObjects(fx.sceneManager)).toHaveLength(1);
    expect(fx.history.undo()).toBe(true);
    expect(modelObjects(fx.sceneManager)).toHaveLength(0);
    expect(fx.history.undo()).toBe(false);
  });

  it('会话隔离：退出后重新激活，两个会话各自合并为 1 条', () => {
    const fx = setup();
    fx.tools.activate('placement', { assetId: fx.asset.id, continuous: true });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(20, 20));
    fx.tools.cancel();

    fx.tools.activate('placement', { assetId: fx.asset.id, continuous: true });
    fx.tool.onPointerDown(pointer(30, 30));
    expect(modelObjects(fx.sceneManager)).toHaveLength(3);

    expect(fx.history.undo()).toBe(true); // 撤销第二会话（1 枚）
    expect(modelObjects(fx.sceneManager)).toHaveLength(2);
    expect(fx.history.undo()).toBe(true); // 撤销第一会话（2 枚）
    expect(modelObjects(fx.sceneManager)).toHaveLength(0);
    expect(fx.history.undo()).toBe(false);
  });

  it('单次模式（continuous:false + 默认合并）：1 次放置 = 1 条历史', () => {
    const fx = setup();
    fx.tools.activate('placement', { assetId: fx.asset.id, continuous: false });
    fx.tool.onPointerDown(pointer(10, 10));

    expect(modelObjects(fx.sceneManager)).toHaveLength(1);
    expect(fx.history.undo()).toBe(true);
    expect(modelObjects(fx.sceneManager)).toHaveLength(0);
    expect(fx.history.undo()).toBe(false);
  });
});

describe('PlacementTool 增强回归', () => {
  it('ESC 退出：已放置对象保留（合并批次 undo 一次全撤）', () => {
    const fx = setup();
    fx.tools.activate('placement', { assetId: fx.asset.id, continuous: true });
    fx.tool.onPointerMove(pointer(10, 10));
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(20, 20));

    fx.tool.onKeyDown(key('Escape'));

    expect(fx.preview.visible).toBe(false);
    expect(modelObjects(fx.sceneManager)).toHaveLength(2); // 不删除已放置对象
    expect(fx.history.undo()).toBe(true);
    expect(modelObjects(fx.sceneManager)).toHaveLength(0);
  });

  it('退出手势（ESC → ToolManager.cancel 路径，T5.8 起唯一退出手势）：已放置对象保留', () => {
    const fx = setup();
    fx.tools.activate('placement', { assetId: fx.asset.id, continuous: true });
    fx.tool.onPointerMove(pointer(10, 10));
    fx.tool.onPointerDown(pointer(10, 10));

    fx.tools.cancel();

    expect(fx.tools.getActiveTool()).toBeNull();
    expect(fx.preview.visible).toBe(false);
    expect(modelObjects(fx.sceneManager)).toHaveLength(1);
    expect(fx.history.canUndo()).toBe(true);
  });

  it('地面吸附恒开：放置对象全部落在地面抬升层 y=MODEL_BASE_HEIGHT（groundPoint 保证 + T9.2 贴地微抬）', () => {
    const fx = setup();
    fx.tools.activate('placement', { assetId: fx.asset.id, continuous: true });

    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(20, 20));
    fx.tool.onPointerDown(pointer(30, 30));

    for (const o of modelObjects(fx.sceneManager)) {
      expect(o.transform.position.y).toBe(MODEL_BASE_HEIGHT);
    }
  });
});
