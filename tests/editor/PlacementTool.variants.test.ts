/**
 * tests/editor/PlacementTool.variants.test.ts —— 烘焙式变体掷骰注入测试（T002.3，D6）。
 *
 * 覆盖（editor 层零 THREE；fake registry/viewport/preview 沿 PlacementTool.test.ts 先例）：
 * - seed 注入：程序化资产（声明变体）每枚放置 obj.asset.seed 为非负整数；
 * - 变体合成进 transform（确定性对账）：seed → applyAssetVariants 采样与
 *   transform 的缩放/旋转增量逐项吻合（与默认值、R 键、滚轮、既有随机参数乘性/加性合成）；
 * - Ghost 所见即所放：放置前 Ghost transform 与落地对象一致（hue 不在 Ghost 呈现——
 *   只在 transform 维度断言）；
 * - 连放每枚重摇（含新 seed）；
 * - GLB 路径零变化：无 seed、transform = 资产默认；
 * - 程序化但未声明变体 / 全 0 → 不掷 seed；
 * - 撤销重做往返：mergeBatch 会话批 undo/redo 后 seed 与 transform 逐位复原。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import type { ID, Transform, Vec3 } from '../../src/core/types';
import { applyAssetVariants } from '../../src/domain/assets';
import type { AssetDescriptor, ModelAsset, ModelObject, ProceduralAssetMeta } from '../../src/domain/assets';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
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

// ── fakes（沿 PlacementTool.test.ts 同款）────────────────────

class FakeViewport implements ViewportPort {
  surfacePoint(): null {
    return null;
  }
  pickObject(): ID | null {
    return null;
  }
  groundPoint(): Vec3 | null {
    return { x: 5, y: 0, z: 1 };
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

class FakePreview implements PreviewPort {
  readonly shown: Array<{ assetId: ID; t: Transform }> = [];
  readonly updates: Transform[] = [];
  visible = false;
  hideCount = 0;
  readonly drawUpdates: DrawPreviewState[] = [];
  clearCount = 0;

  showGhost(assetId: ID, t: Transform): void {
    this.visible = true;
    this.shown.push({ assetId, t: { position: { ...t.position }, rotation: { ...t.rotation }, scale: { ...t.scale } } });
  }
  updateGhost(t: Transform): void {
    if (!this.visible) throw new Error('updateGhost 在未 showGhost 时调用');
    this.updates.push({ position: { ...t.position }, rotation: { ...t.rotation }, scale: { ...t.scale } });
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

// ── 夹具 ────────────────────────────────────────────────────

const PROC_ID = 'asset_proc_bin';

function makeProceduralAsset(overrides: Partial<ProceduralAssetMeta> = {}): ProceduralAssetMeta {
  return {
    id: PROC_ID,
    name: '程序化垃圾桶',
    category: 'facility',
    tags: ['设施'],
    defaultScale: { x: 2, y: 2, z: 2 },
    defaultRotation: { x: 0, y: 0.3, z: 0 },
    variants: { scaleJitter: 0.1, rotationJitter: 15, hueJitter: 8 },
    ...overrides,
  };
}

const FILE_ASSET: ModelAsset = {
  id: 'asset_file_tree',
  name: 'GLB 树',
  category: 'tree',
  file: 'models/tree.glb',
  tags: [],
  defaultScale: { x: 1, y: 2, z: 1 },
  defaultRotation: { x: 0.1, y: 0.2, z: 0.3 },
};

function setup(asset: ProceduralAssetMeta | ModelAsset, kind: 'procedural' | 'file') {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const history = new HistoryManager({ sceneManager, selection, eventBus });
  const assets = new AssetRegistry();
  const descriptor: AssetDescriptor =
    kind === 'procedural'
      ? { kind: 'procedural', asset: asset as ProceduralAssetMeta }
      : { kind: 'file', asset: asset as ModelAsset };
  assets.register(descriptor);
  const viewport = new FakeViewport();
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
  return { eventBus, sceneManager, history, asset, preview, tools, tool };
}

function pointer(): PointerEventInfo {
  return { screenX: 10, screenY: 10, button: 'left', ctrlKey: false, shiftKey: false, altKey: false };
}

function key(k: string): KeyboardEventInfo {
  return { key: k, ctrlKey: false, shiftKey: false, altKey: false };
}

function modelObjects(sceneManager: SceneManager): ModelObject[] {
  return sceneManager.getObjects((o) => o.type === 'model') as ModelObject[];
}

/** 放置 n 枚（同一点击点） */
function placeN(fx: ReturnType<typeof setup>, n: number): ModelObject[] {
  for (let i = 0; i < n; i++) fx.tool.onPointerDown(pointer());
  return modelObjects(fx.sceneManager);
}

// ── 测试 ────────────────────────────────────────────────────

describe('PlacementTool：变体 seed 注入与合成', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup(makeProceduralAsset(), 'procedural');
    fx.tools.activate('placement', { assetId: PROC_ID });
  });

  it('每枚放置掷 seed：obj.asset.seed 为非负整数', () => {
    const objs = placeN(fx, 6);
    expect(objs).toHaveLength(6);
    for (const obj of objs) {
      expect(typeof obj.asset.seed).toBe('number');
      expect(Number.isInteger(obj.asset.seed)).toBe(true);
      expect(obj.asset.seed).toBeGreaterThanOrEqual(0);
    }
  });

  it('变体采样合成进 transform（确定性对账：seed → applyAssetVariants 逐项吻合）', () => {
    const asset = fx.asset as ProceduralAssetMeta;
    const objs = placeN(fx, 8);
    for (const obj of objs) {
      const sample = applyAssetVariants(asset.variants, obj.asset.seed!);
      // 缩放 = defaultScale × 变体系数（无 randomScale / 滚轮 = 1）
      expect(obj.transform.scale.x).toBeCloseTo(asset.defaultScale.x * sample.scaleFactor, 12);
      expect(obj.transform.scale.y).toBeCloseTo(asset.defaultScale.y * sample.scaleFactor, 12);
      expect(obj.transform.scale.z).toBeCloseTo(asset.defaultScale.z * sample.scaleFactor, 12);
      // 旋转 = defaultRotation.y + 变体偏移（无 randomRotation / R 键 = 0）
      expect(obj.transform.rotation.y).toBeCloseTo(asset.defaultRotation.y + sample.rotationYOffset, 12);
      // D17 半宽：全体命中声明区间
      expect(obj.transform.scale.x).toBeGreaterThanOrEqual(2 * 0.9);
      expect(obj.transform.scale.x).toBeLessThanOrEqual(2 * 1.1);
      expect(obj.transform.rotation.y).toBeGreaterThanOrEqual(0.3 - (15 * Math.PI) / 180);
      expect(obj.transform.rotation.y).toBeLessThanOrEqual(0.3 + (15 * Math.PI) / 180);
    }
  });

  it('Ghost 所见即所放：放置前 Ghost transform 与落地对象一致', () => {
    fx.tool.onPointerMove(pointer());
    const ghostT = fx.preview.shown[0].t;
    fx.tool.onPointerDown(pointer());
    const placed = modelObjects(fx.sceneManager)[0];
    expect(placed.transform.position).toEqual(ghostT.position);
    expect(placed.transform.rotation).toEqual(ghostT.rotation);
    expect(placed.transform.scale).toEqual(ghostT.scale);
  });

  it('连放每枚重摇（含新 seed）：10 枚 seed 不全同', () => {
    const objs = placeN(fx, 10);
    const seeds = new Set(objs.map((o) => o.asset.seed));
    expect(seeds.size).toBeGreaterThan(1);
  });

  it('变体与既有随机参数 / R 键 / 滚轮乘性加性合成', () => {
    const asset = fx.asset as ProceduralAssetMeta;
    // 固定既有随机量（区间退化为常量）：rotation +0.1、scale ×1——变体是唯一变量之一
    fx.tools.activate('placement', {
      assetId: PROC_ID,
      randomRotation: [0.1, 0.1],
      randomScale: [1, 1],
    });
    fx.tool.onPointerMove(pointer());
    fx.tool.onKeyDown(key('r')); // +45°
    fx.tool.onWheel(1); // 滚轮一档 +0.1
    fx.tool.onPointerDown(pointer());

    const obj = modelObjects(fx.sceneManager)[0];
    const sample = applyAssetVariants(asset.variants, obj.asset.seed!);
    const expectedScale = 2 * 1 * 1.1 * sample.scaleFactor;
    const expectedRotY = 0.3 + 0.1 + Math.PI / 4 + sample.rotationYOffset;
    expect(obj.transform.scale.x).toBeCloseTo(expectedScale, 12);
    expect(obj.transform.rotation.y).toBeCloseTo(expectedRotY, 12);
  });

  it('撤销重做往返：mergeBatch 会话批 undo/redo 后 seed 与 transform 逐位复原', () => {
    const before = placeN(fx, 3);
    expect(fx.history.undo()).toBe(true); // 会话批合并为 1 条：一次全撤
    expect(modelObjects(fx.sceneManager)).toHaveLength(0);
    expect(fx.history.redo()).toBe(true);
    const after = modelObjects(fx.sceneManager);
    expect(after).toHaveLength(3);
    for (let i = 0; i < 3; i++) {
      expect(after[i].id).toBe(before[i].id);
      expect(after[i].asset.seed).toBe(before[i].asset.seed); // 同 seed 同变体（D6 确定性）
      expect(after[i].transform.scale).toEqual(before[i].transform.scale);
      expect(after[i].transform.rotation).toEqual(before[i].transform.rotation);
    }
  });
});

describe('PlacementTool：变体不启用的路径', () => {
  it('GLB（file 资产）：无 seed、transform = 资产默认（路径零变化）', () => {
    const fx = setup(FILE_ASSET, 'file');
    fx.tools.activate('placement', { assetId: FILE_ASSET.id });
    const objs = placeN(fx, 3);
    for (const obj of objs) {
      expect('seed' in obj.asset).toBe(false);
      expect(obj.asset).toEqual({ assetId: FILE_ASSET.id });
      expect(obj.transform.rotation).toEqual(FILE_ASSET.defaultRotation);
      expect(obj.transform.scale).toEqual(FILE_ASSET.defaultScale);
    }
  });

  it('程序化但未声明 variants → 不掷 seed', () => {
    const fx = setup(makeProceduralAsset({ variants: undefined }), 'procedural');
    fx.tools.activate('placement', { assetId: PROC_ID });
    const objs = placeN(fx, 2);
    for (const obj of objs) expect(obj.asset.seed).toBeUndefined();
  });

  it('程序化但声明全 0 → 不掷 seed、transform = 默认', () => {
    const fx = setup(
      makeProceduralAsset({ variants: { scaleJitter: 0, rotationJitter: 0, hueJitter: 0 } }),
      'procedural',
    );
    fx.tools.activate('placement', { assetId: PROC_ID });
    const objs = placeN(fx, 2);
    for (const obj of objs) {
      expect(obj.asset.seed).toBeUndefined();
      expect(obj.transform.rotation.y).toBeCloseTo(0.3, 12);
      expect(obj.transform.scale.x).toBeCloseTo(2, 12);
    }
  });
});
