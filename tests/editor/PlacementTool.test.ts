/**
 * tests/editor/PlacementTool.test.ts —— 放置工具测试。
 *
 * 覆盖（T1.6 验收标准）：
 * - activate 参数校验：缺 assetId / 未注册资产 → 抛错且工具复位（activeTool=null）；
 * - Ghost 生命周期：首次 move → showGhost；后续 move → updateGhost；Ghost 只经 PreviewPort，
 *   全程不进 SceneManager（对象数为 0）；
 * - 连续放置：move+左键×3 → 场景恰好 3 个 ModelObject（model_ 前缀、asset 引用正确、
 *   位置=点击处地面坐标），历史恰好 3 条（undo×3 后场景空、第 4 次 undo false）
 *   【T2.2 起默认 mergeBatch=true，本用例显式 mergeBatch:false 锁定逐条入栈语义；
 *   合并默认行为见 PlacementTool.enhanced.test.ts】；
 * - 退出手势（ESC → ToolManager.cancel 路径，T5.8 起唯一退出手势）：activeTool=null、已放置对象保留、Ghost 隐藏、零新 Command；
 * - 工具内右键 onPointerDown / ESC onKeyDown 防御路径：仅清理 Ghost，不产生任何对象与命令；
 * - 随机旋转/缩放落在配置区间（多枚采样全部命中区间）；
 * - 无随机参数 → 使用资产默认旋转/缩放；
 * - groundPoint 为 null（射线背向地面）：点击不放置、move 不更新 Ghost；
 * - continuous:false → 放置一次后 Ghost 隐藏、后续左键不再放置。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import type { ID, Transform, Vec3 } from '../../src/core/types';
import { deepClone } from '../../src/core/utils';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import { MODEL_BASE_HEIGHT } from '../../src/domain/assets';
import type { ModelAsset } from '../../src/domain/assets';
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

/** 预置地面坐标的 Fake 视口：groundAt 按屏幕坐标映射，缺省返回 groundDefault */
class FakeViewport implements ViewportPort {

  /** 测量拾取（T10.1 ViewportPort 增补）：本工具测试不消费，恒 null */
  surfacePoint(): null {
    return null;
  }
  readonly groundCalls: Array<[number, number]> = [];
  private readonly groundAt = new Map<string, Vec3 | null>();
  groundDefault: Vec3 | null = { x: 0, y: 0, z: 0 };

  setGround(x: number, y: number, p: Vec3 | null): void {
    this.groundAt.set(`${x},${y}`, p);
  }

  pickObject(): ID | null {
    return null;
  }

  groundPoint(x: number, y: number): Vec3 | null {
    this.groundCalls.push([x, y]);
    const stored = this.groundAt.get(`${x},${y}`);
    return stored === undefined ? this.groundDefault : stored; // 显式 null 是合法返回值（非缺省）
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

/** 记录型 Fake 预览：Ghost 全部调用留痕，供「不进 SceneManager」与生命周期断言 */
class FakePreview implements PreviewPort {
  readonly shown: Array<{ assetId: ID; t: Transform }> = [];
  readonly updates: Transform[] = [];
  hideCount = 0;
  visible = false;
  lastGhostAssetId: ID | null = null;
  readonly drawUpdates: DrawPreviewState[] = [];
  clearCount = 0;

  showGhost(assetId: ID, t: Transform): void {
    this.visible = true;
    this.lastGhostAssetId = assetId;
    this.shown.push({ assetId, t: deepClone(t) });
  }
  updateGhost(t: Transform): void {
    if (!this.visible) throw new Error('updateGhost 在未 showGhost 时调用');
    this.updates.push(deepClone(t));
  }
  hideGhost(): void {
    this.hideCount += 1;
    this.visible = false;
    this.lastGhostAssetId = null;
  }
  updateDrawPreview(state: DrawPreviewState): void {
    this.drawUpdates.push(state);
  }
  clear(): void {
    this.clearCount += 1;
    this.visible = false;
    this.lastGhostAssetId = null;
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

const ESC: KeyboardEventInfo = { key: 'Escape', ctrlKey: false, shiftKey: false, altKey: false };

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
  viewport.setGround(40, 40, null); // 射线背向地面

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

/** 取场景中的 ModelObject（按创建语义过滤） */
function modelObjects(sceneManager: SceneManager): ModelObject[] {
  return sceneManager.getObjects((o) => o.type === 'model') as ModelObject[];
}

describe('PlacementTool 激活校验', () => {
  it('缺少参数（assetId 缺失）→ 抛错且 activeTool 复位 null', () => {
    const fx = setup();
    expect(() => fx.tools.activate('placement')).toThrow(/assetId/);
    expect(fx.tools.getActiveTool()).toBeNull();
  });

  it('assetId 未注册 → 抛错且 activeTool 复位 null', () => {
    const fx = setup();
    expect(() => fx.tools.activate('placement', { assetId: 'asset_ghost' })).toThrow(/未注册/);
    expect(fx.tools.getActiveTool()).toBeNull();
  });
});

describe('PlacementTool Ghost 生命周期', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
    fx.tools.activate('placement', { assetId: fx.asset.id, continuous: true });
  });

  it('首次移动 → showGhost(assetId, 地面变换)；再次移动 → updateGhost（showGhost 只调一次）', () => {
    fx.tool.onPointerMove(pointer(10, 10));
    fx.tool.onPointerMove(pointer(20, 20));

    expect(fx.preview.shown).toHaveLength(1);
    expect(fx.preview.shown[0].assetId).toBe(fx.asset.id);
    // y = 地面 0 + MODEL_BASE_HEIGHT（T9.2 贴地微抬；ground.y 恒 0）
    expect(fx.preview.shown[0].t.position).toEqual({ x: 5, y: MODEL_BASE_HEIGHT, z: 0 });
    expect(fx.preview.updates).toHaveLength(1);
    expect(fx.preview.updates[0].position).toEqual({ x: 6, y: MODEL_BASE_HEIGHT, z: 1 });
  });

  it('Ghost 从不进入 SceneManager：移动期间场景对象数为 0', () => {
    fx.tool.onPointerMove(pointer(10, 10));
    fx.tool.onPointerMove(pointer(20, 20));
    fx.tool.onPointerMove(pointer(30, 30));

    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.preview.visible).toBe(true);
  });

  it('地面投影为 null 的移动：不更新 Ghost（保留上次位置）', () => {
    fx.tool.onPointerMove(pointer(10, 10));
    fx.tool.onPointerMove(pointer(40, 40));

    expect(fx.preview.updates).toHaveLength(0);
    expect(fx.preview.shown).toHaveLength(1);
  });

  it('deactivate 隐藏 Ghost（切换工具自动清理）', () => {
    fx.tool.onPointerMove(pointer(10, 10));
    fx.tools.deactivate();

    expect(fx.preview.visible).toBe(false);
    expect(fx.preview.hideCount).toBe(1);
    expect(fx.tools.getActiveTool()).toBeNull();
  });
});

describe('PlacementTool 连续放置', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
    fx.tools.activate('placement', { assetId: fx.asset.id, continuous: true });
  });

  it('移动+左键×3 → 场景 3 个 ModelObject，位置与点击处地面坐标一致，历史恰好 3 条（mergeBatch:false 逐条入栈）', () => {
    // T2.2 起默认 mergeBatch=true（会话合并为 1 条）；本测试锁定关闭合并时的逐条语义
    fx.tools.activate('placement', { assetId: fx.asset.id, continuous: true, mergeBatch: false });
    fx.tool.onPointerMove(pointer(10, 10));
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerMove(pointer(20, 20));
    fx.tool.onPointerDown(pointer(20, 20));
    fx.tool.onPointerMove(pointer(30, 30));
    fx.tool.onPointerDown(pointer(30, 30));

    const objs = modelObjects(fx.sceneManager);
    expect(objs).toHaveLength(3);
    // 落点 y = MODEL_BASE_HEIGHT（T9.2 贴地微抬：与地面拉开稳定间距消共面 z-fighting）
    expect(objs.map((o) => o.transform.position)).toEqual([
      { x: 5, y: MODEL_BASE_HEIGHT, z: 0 },
      { x: 6, y: MODEL_BASE_HEIGHT, z: 1 },
      { x: 7, y: MODEL_BASE_HEIGHT, z: 2 },
    ]);

    // 历史恰好 3 条：undo×3 全部成功，第 4 次失败
    expect(fx.history.undo()).toBe(true);
    expect(fx.history.undo()).toBe(true);
    expect(fx.history.undo()).toBe(true);
    expect(fx.history.undo()).toBe(false);
    expect(modelObjects(fx.sceneManager)).toHaveLength(0);
  });

  it('放置对象为合法 ModelObject：model_ 前缀 id、asset 引用、可见未锁定', () => {
    fx.tool.onPointerDown(pointer(10, 10));

    const objs = modelObjects(fx.sceneManager);
    expect(objs).toHaveLength(1);
    const obj = objs[0];
    expect(obj.id.startsWith('model_')).toBe(true);
    expect(obj.asset).toEqual({ assetId: fx.asset.id });
    expect(obj.name).toBe(fx.asset.name);
    expect(obj.visible).toBe(true);
    expect(obj.locked).toBe(false);
    expect(obj.parentId).toBeNull();
    expect(obj.layerId).toBeNull();
  });

  it('可选参数 layerId：放置对象归入指定图层（缺省 null 由组合根决定；非法值抛错）', () => {
    fx.tools.activate('placement', { assetId: fx.asset.id, layerId: 'layer_models' });
    fx.tool.onPointerDown(pointer(10, 10));
    expect(modelObjects(fx.sceneManager)[0].layerId).toBe('layer_models');

    fx.tools.activate('placement', { assetId: fx.asset.id, layerId: null });
    fx.tool.onPointerDown(pointer(20, 20));
    expect(modelObjects(fx.sceneManager)[1].layerId).toBeNull();

    expect(() => fx.tools.activate('placement', { assetId: fx.asset.id, layerId: 42 })).toThrow(/layerId/);
    expect(fx.tools.getActiveTool()).toBeNull();
  });

  it('连续模式放置后 Ghost 保持可见（下一枚继续放置）', () => {
    fx.tool.onPointerMove(pointer(10, 10));
    fx.tool.onPointerDown(pointer(10, 10));

    expect(fx.preview.visible).toBe(true);
    expect(fx.preview.hideCount).toBe(0);

    fx.tool.onPointerDown(pointer(20, 20));
    expect(modelObjects(fx.sceneManager)).toHaveLength(2);
  });

  it('点击处无地面投影 → 不放置、不入历史', () => {
    fx.tool.onPointerDown(pointer(40, 40));

    expect(modelObjects(fx.sceneManager)).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
  });

  it('放置经 CreateObjectCommand：scene:changed 出现命令名 source（命令驱动归因）', () => {
    const sources: string[] = [];
    fx.eventBus.on('scene:changed', (p) => sources.push(p.source));

    fx.tool.onPointerDown(pointer(10, 10));

    // 既有语义：SceneManager.addObject 发 source='addObject'，命令再发 source='CreateObjectCommand'
    expect(sources).toContain('addObject');
    expect(sources).toContain('CreateObjectCommand');
  });

  it('放置落点 y = MODEL_BASE_HEIGHT（五路一致性之点击放置路；贴地微抬消共面 z-fighting，T9.2）', () => {
    fx.tool.onPointerMove(pointer(10, 10));
    fx.tool.onPointerDown(pointer(10, 10));

    expect(fx.preview.shown[0].t.position.y).toBeCloseTo(MODEL_BASE_HEIGHT, 10); // Ghost 所见即所放
    expect(modelObjects(fx.sceneManager)[0].transform.position.y).toBeCloseTo(MODEL_BASE_HEIGHT, 10);
  });
});

describe('PlacementTool 退出', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
    fx.tools.activate('placement', { assetId: fx.asset.id, continuous: true });
  });

  it('退出手势（ESC → ToolManager.cancel 路径，T5.8 起唯一退出手势）：activeTool=null、已放置对象保留、Ghost 隐藏、零新命令', () => {
    fx.tool.onPointerMove(pointer(10, 10));
    fx.tool.onPointerDown(pointer(10, 10));
    expect(modelObjects(fx.sceneManager)).toHaveLength(1);

    fx.tools.cancel(); // input.ts 将 ESC 路由到 ToolManager.cancel()（T5.8：右键已迁移为菜单/旋转）

    expect(fx.tools.getActiveTool()).toBeNull();
    expect(fx.preview.visible).toBe(false);
    expect(modelObjects(fx.sceneManager)).toHaveLength(1);
    expect(fx.history.canUndo()).toBe(true); // 仍有放置命令可撤销
  });

  it('ESC（onKeyDown 防御路径）：清理 Ghost 且零 Command', () => {
    fx.tool.onPointerMove(pointer(10, 10));

    fx.tool.onKeyDown(ESC);

    expect(fx.preview.visible).toBe(false);
    expect(modelObjects(fx.sceneManager)).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
  });

  it('右键 onPointerDown（防御路径，T5.8 起输入层不再转发右键）：清理 Ghost，不放置、零命令', () => {
    fx.tool.onPointerMove(pointer(10, 10));

    fx.tool.onPointerDown(pointer(10, 10, { button: 'right' }));

    expect(fx.preview.visible).toBe(false);
    expect(modelObjects(fx.sceneManager)).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
  });

  it('退出后重新激活：状态复位，可继续放置', () => {
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tools.cancel();

    fx.tools.activate('placement', { assetId: fx.asset.id, continuous: true });
    fx.tool.onPointerDown(pointer(20, 20));

    expect(modelObjects(fx.sceneManager)).toHaveLength(2);
  });
});

describe('PlacementTool 随机旋转/缩放', () => {
  it('随机旋转/缩放落在配置区间（8 枚采样全部命中）', () => {
    const fx = setup();
    fx.tools.activate('placement', {
      assetId: fx.asset.id,
      continuous: true,
      randomRotation: [-0.5, 0.5],
      randomScale: [0.8, 1.2],
    });

    for (let i = 0; i < 8; i++) {
      fx.tool.onPointerDown(pointer(10, 10));
    }

    const objs = modelObjects(fx.sceneManager);
    expect(objs).toHaveLength(8);
    for (const o of objs) {
      expect(o.transform.rotation.y).toBeGreaterThanOrEqual(-0.5);
      expect(o.transform.rotation.y).toBeLessThanOrEqual(0.5);
      expect(o.transform.scale.x).toBeGreaterThanOrEqual(0.8);
      expect(o.transform.scale.x).toBeLessThanOrEqual(1.2);
      expect(o.transform.scale.y).toBe(o.transform.scale.x);
      expect(o.transform.scale.z).toBe(o.transform.scale.x);
    }
  });

  it('无随机参数 → 使用资产默认旋转/缩放', () => {
    const asset = makeAsset({
      defaultScale: { x: 2, y: 3, z: 4 },
      defaultRotation: { x: 0.1, y: 0.2, z: 0.3 },
    });
    const fx = setup(asset);
    fx.tools.activate('placement', { assetId: asset.id, continuous: true });

    fx.tool.onPointerDown(pointer(10, 10));

    const obj = modelObjects(fx.sceneManager)[0];
    expect(obj.transform.rotation).toEqual({ x: 0.1, y: 0.2, z: 0.3 });
    expect(obj.transform.scale).toEqual({ x: 2, y: 3, z: 4 });
  });

  it('随机值相对资产默认：rotation.y = 默认 + 采样值，scale = 默认 × 采样系数', () => {
    const asset = makeAsset({
      defaultScale: { x: 2, y: 2, z: 2 },
      defaultRotation: { x: 0, y: 1, z: 0 },
    });
    const fx = setup(asset);
    fx.tools.activate('placement', {
      assetId: asset.id,
      continuous: true,
      randomRotation: [0, 0.5],
      randomScale: [1, 1],
    });

    for (let i = 0; i < 6; i++) {
      fx.tool.onPointerDown(pointer(10, 10));
    }

    for (const o of modelObjects(fx.sceneManager)) {
      expect(o.transform.rotation.y).toBeGreaterThanOrEqual(1);
      expect(o.transform.rotation.y).toBeLessThanOrEqual(1.5);
      expect(o.transform.scale).toEqual({ x: 2, y: 2, z: 2 });
    }
  });

  it('非法随机区间（min>max）→ activate 抛错', () => {
    const fx = setup();
    expect(() =>
      fx.tools.activate('placement', { assetId: fx.asset.id, randomRotation: [1, -1] }),
    ).toThrow(/区间/);
    expect(fx.tools.getActiveTool()).toBeNull();
  });
});

describe('PlacementTool 单次放置模式', () => {
  it('continuous:false → 放置一次后 Ghost 隐藏、后续左键不再放置', () => {
    const fx = setup();
    fx.tools.activate('placement', { assetId: fx.asset.id, continuous: false });

    fx.tool.onPointerMove(pointer(10, 10));
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(20, 20));
    fx.tool.onPointerMove(pointer(20, 20));

    expect(modelObjects(fx.sceneManager)).toHaveLength(1);
    expect(fx.preview.visible).toBe(false);
    expect(fx.history.canUndo()).toBe(true);
    // 历史恰好 1 条
    expect(fx.history.undo()).toBe(true);
    expect(fx.history.undo()).toBe(false);
  });
});
