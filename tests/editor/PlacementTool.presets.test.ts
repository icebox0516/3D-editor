/**
 * tests/editor/PlacementTool.presets.test.ts —— 放置链色卡注入测试（T024.1，D44 #4/#8）。
 *
 * 覆盖（editor 层零 THREE；fake registry/viewport/preview 沿 PlacementTool.variants 先例）：
 * - PlacementParams.preset → 每枚落地 obj.asset.preset 携卡（连续放置逐枚携带）；
 * - Ghost 调用携卡：PreviewPort fake 断言 showGhost 第四参（D44 #8 Ghost 带卡）；
 * - 未声明卡 / 空串 / 非字符串 / file 资产携卡 → activate throw（写侧 fail-fast，
 *   与 parseParams 现行风格一致——读侧宽容回退归 Renderer choke point）；
 * - 不传 preset → obj.asset 无 preset 字段（默认卡省略不落盘，D44 #4）；
 * - 显式 preset='default'（DEFAULT_COLOR_PRESET_ID）同样省略（缺省 = default 语义）。
 */
import { describe, expect, it } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import type { ID, Transform, Vec3 } from '../../src/core/types';
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

// ── fakes（沿 PlacementTool.variants.test.ts 同款）────────────────

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

/** PreviewPort fake：showGhost 记录全参（T024.1 增第四参 preset 断言位） */
class FakePreview implements PreviewPort {
  readonly shown: Array<{ assetId: ID; t: Transform; seed?: number; preset?: string }> = [];
  readonly updates: Transform[] = [];
  visible = false;
  hideCount = 0;
  readonly drawUpdates: DrawPreviewState[] = [];
  clearCount = 0;

  showGhost(assetId: ID, t: Transform, seed?: number, preset?: string): void {
    this.visible = true;
    this.shown.push({
      assetId,
      seed,
      preset,
      t: { position: { ...t.position }, rotation: { ...t.rotation }, scale: { ...t.scale } },
    });
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

const PROC_ID = 'asset_ginkgo';

function makeProceduralAsset(overrides: Partial<ProceduralAssetMeta> = {}): ProceduralAssetMeta {
  return {
    id: PROC_ID,
    name: '程序化银杏',
    category: 'tree',
    tags: ['乔木'],
    defaultScale: { x: 1, y: 1, z: 1 },
    defaultRotation: { x: 0, y: 0, z: 0 },
    taxonomy: { category: 'plant', family: 'broadleaf' }, // ginkgo asset 声明镜像（T010.2 必填分类）
    // T024 试点树形态：default + 秋金黄双卡（ginkgo 声明镜像）
    presets: [
      { id: 'default', label: '默认', swatch: '#8ab45d' },
      { id: 'autumn', label: '秋·金黄', swatch: '#e0b34a' },
    ],
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

// ── 测试 ────────────────────────────────────────────────────

describe('PlacementTool：色卡 preset 注入（T024.1）', () => {
  it('PlacementParams.preset → 每枚落地 obj.asset.preset 携卡（连续放置逐枚携带）', () => {
    const fx = setup(makeProceduralAsset(), 'procedural');
    fx.tools.activate('placement', { assetId: PROC_ID, preset: 'autumn' });
    for (let i = 0; i < 3; i++) fx.tool.onPointerDown(pointer());
    const objs = modelObjects(fx.sceneManager);
    expect(objs).toHaveLength(3);
    for (const obj of objs) expect(obj.asset.preset).toBe('autumn');
  });

  it('Ghost 调用携卡：showGhost 第四参 = 激活卡（首显与连放 roll 后两处调用点）', () => {
    const fx = setup(makeProceduralAsset(), 'procedural');
    fx.tools.activate('placement', { assetId: PROC_ID, preset: 'autumn' });
    fx.tool.onPointerMove(pointer()); // 首显调用点
    fx.tool.onPointerDown(pointer()); // 连放 roll 后调用点
    expect(fx.preview.shown).toHaveLength(2);
    for (const call of fx.preview.shown) expect(call.preset).toBe('autumn');
    expect(modelObjects(fx.sceneManager)[0].asset.preset).toBe('autumn');
  });

  it('未声明卡 → activate throw（写侧 fail-fast，工具复位无激活）', () => {
    const fx = setup(makeProceduralAsset(), 'procedural');
    expect(() => fx.tools.activate('placement', { assetId: PROC_ID, preset: 'spring' })).toThrow(
      /色卡/,
    );
    // throw 后工具未激活：pointerDown 不产生对象
    fx.tool.onPointerDown(pointer());
    expect(modelObjects(fx.sceneManager)).toHaveLength(0);
  });

  it('空串 / 非字符串 preset → activate throw（参数结构非法）', () => {
    const fx = setup(makeProceduralAsset(), 'procedural');
    expect(() => fx.tools.activate('placement', { assetId: PROC_ID, preset: '' })).toThrow(
      /preset 必须是非空字符串/,
    );
    expect(() =>
      fx.tools.activate('placement', { assetId: PROC_ID, preset: 42 as unknown as string }),
    ).toThrow(/preset 必须是非空字符串/);
  });

  it('file 资产携卡 → activate throw（GLB 无色卡声明面）', () => {
    const fx = setup(FILE_ASSET, 'file');
    expect(() =>
      fx.tools.activate('placement', { assetId: FILE_ASSET.id, preset: 'autumn' }),
    ).toThrow(/色卡/);
  });

  it('不传 preset → obj.asset 无 preset 字段（默认卡省略不落盘，D44 #4）；Ghost 第四参 undefined', () => {
    const fx = setup(makeProceduralAsset(), 'procedural');
    fx.tools.activate('placement', { assetId: PROC_ID });
    fx.tool.onPointerMove(pointer());
    fx.tool.onPointerDown(pointer());
    const obj = modelObjects(fx.sceneManager)[0];
    expect('preset' in obj.asset).toBe(false);
    expect(fx.preview.shown[0].preset).toBeUndefined();
  });

  it("显式 preset='default'（DEFAULT_COLOR_PRESET_ID）同样省略——缺省 = default 语义，不落冗余字段", () => {
    const fx = setup(makeProceduralAsset(), 'procedural');
    fx.tools.activate('placement', { assetId: PROC_ID, preset: 'default' });
    fx.tool.onPointerDown(pointer());
    const obj = modelObjects(fx.sceneManager)[0];
    expect('preset' in obj.asset).toBe(false);
  });

  it('空卡表（presets: []，无色卡资产）任何卡值 → activate throw', () => {
    const fx = setup(makeProceduralAsset({ presets: [] }), 'procedural');
    expect(() => fx.tools.activate('placement', { assetId: PROC_ID, preset: 'default' })).toThrow(
      /色卡/,
    );
    expect(() => fx.tools.activate('placement', { assetId: PROC_ID })).not.toThrow(); // 不传 = 默认卡合法
    fx.tool.onPointerDown(pointer());
    expect('preset' in modelObjects(fx.sceneManager)[0].asset).toBe(false);
  });

  it('撤销重做往返：preset 随对象复原（会话批合并路径）', () => {
    const fx = setup(makeProceduralAsset(), 'procedural');
    fx.tools.activate('placement', { assetId: PROC_ID, preset: 'autumn' });
    for (let i = 0; i < 2; i++) fx.tool.onPointerDown(pointer());
    const before = modelObjects(fx.sceneManager);
    expect(fx.history.undo()).toBe(true);
    expect(modelObjects(fx.sceneManager)).toHaveLength(0);
    expect(fx.history.redo()).toBe(true);
    const after = modelObjects(fx.sceneManager);
    expect(after).toHaveLength(2);
    for (let i = 0; i < 2; i++) {
      expect(after[i].id).toBe(before[i].id);
      expect(after[i].asset.preset).toBe('autumn');
    }
  });
});

describe('PlacementTool：色卡与既有手势正交', () => {
  it('携卡会话内 R 键 / 滚轮照常生效（色卡不扰动变换手势）', () => {
    const fx = setup(makeProceduralAsset(), 'procedural');
    fx.tools.activate('placement', { assetId: PROC_ID, preset: 'autumn' });
    fx.tool.onPointerMove(pointer());
    fx.tool.onKeyDown(key('r')); // +45°
    fx.tool.onWheel(1); // ×1.1
    fx.tool.onPointerDown(pointer());
    const obj = modelObjects(fx.sceneManager)[0];
    expect(obj.asset.preset).toBe('autumn');
    expect(obj.transform.rotation.y).toBeCloseTo(Math.PI / 4, 12);
    expect(obj.transform.scale.x).toBeCloseTo(1.1, 12);
  });
});
