/**
 * tests/app/phase1.acceptance.test.ts —— 全链路验收流程的可执行版（T6.7 重写为阶段 6 形态）。
 *
 * 流程（形状驱动三步流 + 资产链路）：
 *   新建场景 → 绘制多边形生成未分类区域 → 赋类型（building：自动迁入「建筑」图层 +
 *   默认预设 + 默认参数）→ 改业务参数（height）→ 撤销/重做
 *   → 资产库选树 → PlacementTool 连续放置 3 棵 → ESC 退出（T5.8 唯一退出手势）
 *   → 移动/旋转/缩放（数值 → TransformCommand）→ 保存 → 重新打开 → 完整恢复
 *
 * 数据流标注（每个环节）：
 *   [1] createEditor(null, {ports, assets})      app/bootstrap 组合根 → EditorFacade（默认环境 + 11 图层）
 *   [2] tools.activate('draw-polygon', {shape})  editor → DrawToolBase 三步流：完成创建 RegionObject
 *       （未分类 + default_solid）+ 自动选中 + 回选择工具（T6.5）
 *   [3] ChangeSemanticCommand(id, {type, properties})
 *                                               editor → semantic 替换 + 自动归层（按语义 defaultLayerName）
 *                                               + 默认预设（T6.1：一条历史整体回退）
 *   [4] ChangePropertyCommand / ChangeSemanticCommand ②  业务参数变更（height）
 *   [5] history.undo()/redo()                     editor → 命令 before/after 回放 → history:changed
 *   [6] tools.activate('placement', {assetId})   editor → PreviewPort(Ghost) / ViewportPort(groundPoint) → CreateObjectCommand
 *       tools.cancel()                            ESC → Ghost 清理，已放置对象保留，零 Command
 *   [7] TransformCommand(id, before, after)       属性面板数值输入 → transform 替换
 *   [8] facade.saveScene() → SceneSerializer.deserialize → facade.openScene(data)   io ⇄ scene 全量恢复
 *
 * 核心校验点：全程零 THREE（本文件不导入 three）；一切修改经 Command 可撤销；
 *            重开后语义/样式/参数/位置完全一致。
 * 运行环境：node（FakePort 代替 WebGL；浏览器视觉验证属 T1.9/T6.10）。
 * T6.7 注记：原「导入 JSON 生成建筑」链路依赖已删除的 v1 要素注册表——外部 JSON 导入
 *            在 T6.9 重设计前为预期过渡态（注册表空表 → parse 抛「未注册的要素类型」），
 *            映射语义回归由 tests/io/JsonImporter.test.ts 以测试内联假定义覆盖。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import type { ID, Transform, Vec3 } from '../../src/core/types';
import { deepClone } from '../../src/core/utils';
import type { ModelAsset, ModelObject } from '../../src/domain/assets';
import { MODEL_BASE_HEIGHT } from '../../src/domain/assets';
import type { RegionObject } from '../../src/domain/regions';
import type { SceneData } from '../../src/scene/SceneData';
import { ChangePropertyCommand } from '../../src/editor/commands/ChangePropertyCommand';
import { ChangeSemanticCommand } from '../../src/editor/commands/ChangeSemanticCommand';
import { CreateObjectCommand } from '../../src/editor/commands/CreateObjectCommand';
import { TransformCommand } from '../../src/editor/commands/TransformCommand';
import type {
  CameraPort,
  DrawPreviewState,
  PointerEventInfo,
  PreviewPort,
  ViewportPort,
} from '../../src/editor/services/ports';
import type { EditorFacade } from '../../src/editor/EditorFacade';
import { SceneSerializer } from '../../src/io/SceneSerializer';
import {
  DEFAULT_LAYER_NAMES,
  createEditor,
  defaultLayerIdFor,
} from '../../src/app/bootstrap';
import manifestJson from '../../assets/manifest.json';

// ── Fake Port（runtime 缺席；结构化实现 editor/services/ports 契约）──────────

class FakeViewport implements ViewportPort {

  /** 测量拾取（T10.1 ViewportPort 增补）：本工具测试不消费，恒 null */
  surfacePoint(): null {
    return null;
  }
  private readonly groundAt = new Map<string, Vec3>();
  setGround(x: number, y: number, p: Vec3): void {
    this.groundAt.set(`${x},${y}`, p);
  }
  pickObject(): ID | null {
    return null;
  }
  groundPoint(x: number, y: number): Vec3 | null {
    return this.groundAt.get(`${x},${y}`) ?? { x, y: 0, z: y };
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
  visible = false;
  shownAssetIds: ID[] = [];
  hideCount = 0;
  showGhost(assetId: ID, _t: Transform): void {
    this.visible = true;
    this.shownAssetIds.push(assetId);
  }
  updateGhost(_t: Transform): void {
    if (!this.visible) throw new Error('updateGhost 在未 showGhost 时调用');
  }
  hideGhost(): void {
    this.visible = false;
    this.hideCount += 1;
  }
  updateDrawPreview(_state: DrawPreviewState): void {}
  clear(): void {
    this.visible = false;
  }
}

const left = (x: number, y: number): PointerEventInfo => ({
  screenX: x,
  screenY: y,
  button: 'left',
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
});

const manifestAssets = manifestJson.assets as ModelAsset[];

/** 可比对的对象快照（排除派生/无关字段，保留验收关心的全部业务字段） */
function snapshot(facade: EditorFacade): Record<ID, unknown> {
  const out: Record<ID, unknown> = {};
  for (const obj of facade.scene.getObjects()) out[obj.id] = deepClone(obj);
  return out;
}

describe('全链路验收流程（可执行版 · 阶段 6 形态）', () => {
  let viewport: FakeViewport;
  let preview: FakePreview;
  let facade: EditorFacade;

  beforeEach(() => {
    viewport = new FakeViewport();
    preview = new FakePreview();
    // [1] 组合根装配：无头（canvas=null）+ 注入 Fake Port + 真实 manifest 资产
    facade = createEditor(null, {
      ports: { viewport, camera: new FakeCamera(), preview },
      assets: manifestAssets,
    });
  });

  it('[1] 新建场景：默认环境预设「白天」+ 11 个默认图层（十语义 + 模型）+ 空对象集', () => {
    const data = JSON.parse(facade.saveScene()) as SceneData;
    expect(data.version).toBe('2.0');
    expect(data.environment.preset).toBe('day');
    expect(data.layers.map((l) => l.name)).toEqual([...DEFAULT_LAYER_NAMES]);
    expect(data.layers).toHaveLength(11);
    expect(data.objects).toEqual([]);
    for (const layer of data.layers) {
      expect(layer.id).toMatch(/^layer_/);
      expect(layer.visible).toBe(true);
      expect(layer.locked).toBe(false);
      expect(layer.opacity).toBe(1);
    }
    // 注册表就位（T6.9：ElementRegistry/StyleRegistry 已随旧契约类型面删除）、
    // manifest 全量资产、12 个工具（T6.8 增 vertex-edit；T7.6 增 road-split）、21 套预设
    expect(facade.registries.assets.list()).toHaveLength(manifestAssets.length + 18); // T002.4 设施 5 种 + T003.4 植物 4 种 + T008.1 DEV 种子塔 + T008.2 夏栎 + T011.1 朴树 + T011.2 香樟 + T011.3 榉树 + T011.4 银杏 + T011.5 悬铃木 + T011.6 栾树 + T011.7 乌桕（同库混排）
    expect(facade.registries.assets.findByKind('procedural').map((d) => d.asset.id)).toEqual([
      'asset_flower',
      'asset_oak',
      'asset_pine',
      'asset_seedstack',
      'asset_shrub',
      'asset_tree_3a',
      'asset_tree_camphor',
      'asset_tree_celtis',
      'asset_tree_ginkgo',
      'asset_tree_koelreuteria',
      'asset_tree_platanus',
      'asset_tree_triadica',
      'asset_tree_zelkova',
      'asset_hydrant',
      'asset_parkbench',
      'asset_signpost',
      'asset_streetlamp',
      'asset_trashbin',
    ]);
    expect(facade.registries.presets.list().length).toBeGreaterThanOrEqual(21);
    expect(facade.registries.tools.list().map((t) => t.id).sort()).toEqual([
      'draw-circle',
      'draw-ellipse',
      'draw-freehand',
      'draw-line',
      'draw-point',
      'draw-polygon',
      'draw-rectangle',
      'measure.angle',
      'measure.area',
      'measure.distance',
      'measure.height',
      'placement',
      'road-split',
      'select',
      'transform',
      'vertex-edit',
    ]);
  });

  it('全链路：绘制区域 → 赋类型（自动归层+默认预设）→ 改参数 → 撤销重做 → 放置 3 棵树 → ESC 退出 → 数值变换 → 保存重开一致', () => {
    // ── [2] 绘制多边形：三点击 + 双击闭合 → 未分类 RegionObject + 自动选中 + 回选择 ──
    const ground = new Map<string, Vec3>([
      ['10,10', { x: 0, y: 0, z: 0 }],
      ['20,20', { x: 4, y: 0, z: 0 }],
      ['30,30', { x: 4, y: 0, z: 4 }],
    ]);
    for (const [key, p] of ground) viewport.setGround(Number(key.split(',')[0]), Number(key.split(',')[1]), p);
    facade.tools.activate('draw-polygon', { shape: 'polygon' });
    const draw = facade.tools.getActiveTool()!;
    draw.onPointerDown(left(10, 10));
    draw.onPointerDown(left(20, 20));
    draw.onDoubleClick?.(left(30, 30));

    const regions = facade.scene.getObjects((o) => o.type === 'region') as RegionObject[];
    expect(regions).toHaveLength(1);
    const region = regions[0]!;
    expect(region.id).toMatch(/^region_/);
    expect(region.semantic.type).toBe('unclassified'); // 三步流 ②：初始态未分类
    expect(region.style.presetId).toBe('default_solid');
    expect(region.shape.type).toBe('polygon');
    expect(region.shape.points).toHaveLength(3);
    // T6.7 裁定：绘制完成自动归入「未分类」语义默认层（DrawToolBase 按语义 defaultLayerName
    // 归层，与 11 层默认场景一致）——非 null；赋类型撤销后回退到该层
    const unclassifiedLayer = facade.scene.getLayers().find((l) => l.name === '未分类')!;
    expect(unclassifiedLayer).toBeDefined();
    expect(region.layerId).toBe(unclassifiedLayer.id);
    expect(facade.selection.getSelectedIds()).toEqual([region.id]);
    expect(facade.tools.getActiveTool()!.id).toBe('select');
    expect(facade.history.canUndo()).toBe(true); // 绘制创建可撤销

    // ── [3] 赋类型 building：ChangeSemanticCommand 自动迁入「建筑」图层 + 默认预设 + 默认参数 ──
    expect(
      facade.history.execute(new ChangeSemanticCommand(region.id, { type: 'building', properties: { height: 10 } })),
    ).toBe(true);
    const building = facade.scene.getObject(region.id) as RegionObject;
    const buildingLayer = facade.scene.getLayers().find((l) => l.name === '建筑')!;
    expect(buildingLayer).toBeDefined();
    expect(building.layerId).toBe(buildingLayer.id); // 语义默认图层（一条历史内完成）
    expect(building.semantic.type).toBe('building');
    expect(building.semantic.properties).toEqual({ height: 10 });
    expect(building.style).toEqual({ presetId: 'building.default', overrides: {} });
    expect(buildingLayer.objectIds).toContain(building.id);

    // ── [4] 修改业务参数：ChangeSemanticCommand ② 路径（类型不变仅 properties）──
    expect(
      facade.history.execute(new ChangeSemanticCommand(region.id, { type: 'building', properties: { height: 60 } })),
    ).toBe(true);
    expect((facade.scene.getObject(region.id) as RegionObject).semantic.properties.height).toBe(60);

    // ChangePropertyCommand（属性面板通用键路径）写 SceneObject.properties 通用属性袋
    // （region 业务参数在 semantic.properties，面板语义参数走 ChangeSemanticCommand ②）
    expect(facade.history.execute(new ChangePropertyCommand(region.id, { height: 66 }))).toBe(true);
    expect((facade.scene.getObject(region.id) as RegionObject).properties.height).toBe(66);

    // ── [5] 撤销 / 重做（Ctrl+Z / Ctrl+Shift+Z 经 app/input 路由到同一 API）──
    expect(facade.history.undo()).toBe(true); // 撤销 ChangeProperty
    expect((facade.scene.getObject(region.id) as RegionObject).semantic.properties.height).toBe(60);
    expect(facade.history.undo()).toBe(true); // 撤销 height 60
    expect((facade.scene.getObject(region.id) as RegionObject).semantic.properties.height).toBe(10);
    expect(facade.history.undo()).toBe(true); // 撤销赋类型：语义/图层/预设整体回退
    const reverted = facade.scene.getObject(region.id) as RegionObject;
    expect(reverted.semantic.type).toBe('unclassified');
    expect(reverted.layerId).toBe(unclassifiedLayer.id); // 回退到绘制创建时的「未分类」层（T6.7 裁定）
    expect(reverted.style.presetId).toBe('default_solid');
    expect(facade.history.redo()).toBe(true); // 重做赋类型
    expect((facade.scene.getObject(region.id) as RegionObject).semantic.type).toBe('building');

    // ── [6] 模型放置：AssetRegistry 取树 → PlacementTool 连续放 3 棵 → ESC 退出 ──
    const tree = facade.registries.assets.findByCategory('plant')[0];
    expect(tree).toBeDefined();
    expect(tree.asset.id).toBe('asset_tree');

    // 资产面板点击 → app 层按类型默认表决定归属（model → 「模型」层）→ 激活放置工具
    facade.tools.activate('placement', { assetId: tree.asset.id, layerId: defaultLayerIdFor(facade.scene, 'model') });
    expect(facade.tools.getActiveTool()?.id).toBe('placement');
    const tool = facade.tools.getActiveTool()!;

    const spots: Vec3[] = [
      { x: 10, y: 0, z: 40 },
      { x: 20, y: 0, z: 40 },
      { x: 30, y: 0, z: 40 },
    ];
    spots.forEach((p, i) => viewport.setGround(100 + i, 200, p));

    const objectCountBefore = facade.scene.getObjects().length;
    spots.forEach((_, i) => {
      tool.onPointerMove(left(100 + i, 200));
      expect(preview.visible).toBe(true); // Ghost 只经 PreviewPort，不进场景
      expect(facade.scene.getObjects().length).toBe(objectCountBefore + i);
      tool.onPointerDown(left(100 + i, 200));
      tool.onPointerUp(left(100 + i, 200));
    });
    expect(preview.shownAssetIds.every((id) => id === tree.asset.id)).toBe(true);

    const trees = facade.scene.getObjects((o) => o.type === 'model') as ModelObject[];
    expect(trees).toHaveLength(3);
    trees.forEach((t, i) => {
      expect(t.id).toMatch(/^model_/);
      expect(t.asset.assetId).toBe(tree.asset.id);
      // 落点 = 地面 XZ + 贴地抬升 y（T9.2：消平面模型与地面共面 z-fighting）
      expect(t.transform.position).toEqual({
        x: spots[i].x,
        y: MODEL_BASE_HEIGHT,
        z: spots[i].z,
      });
      expect(t.transform.scale).toEqual(tree.asset.defaultScale);
    });
    // 放置对象归入「模型」层（app 归层规则：type→默认图层表，经 PlacementParams.layerId 随命令落地）
    const modelsLayer = facade.scene.getLayers().find((l) => l.name === '模型')!;
    for (const t of trees) expect(t.layerId).toBe(modelsLayer.id);
    expect(modelsLayer.objectIds).toEqual(trees.map((t) => t.id));

    // ESC 退出（T5.8 唯一退出手势）：Ghost 清理、工具退出、已放置对象保留、零新 Command
    const undoDepthBefore = countUndoDepth(facade);
    facade.tools.cancel();
    expect(facade.tools.getActiveTool()).toBeNull();
    expect(preview.visible).toBe(false);
    expect(facade.scene.getObjects((o) => o.type === 'model')).toHaveLength(3);
    expect(countUndoDepth(facade)).toBe(undoDepthBefore);

    // ── [7] 选中树移动 / 旋转 / 缩放：属性面板数值输入 → TransformCommand ──
    const firstTree = trees[0];
    facade.selection.select(firstTree.id);
    const before = deepClone(firstTree.transform);
    const after: Transform = {
      position: { x: 12.5, y: 0, z: 42 },
      rotation: { x: 0, y: Math.PI / 4, z: 0 },
      scale: { x: 1.5, y: 1.5, z: 1.5 },
    };
    expect(facade.history.execute(new TransformCommand(firstTree.id, before, after))).toBe(true);
    expect(facade.scene.getObject(firstTree.id)!.transform).toEqual(after);
    expect(facade.history.undo()).toBe(true);
    expect(facade.scene.getObject(firstTree.id)!.transform).toEqual(before);
    expect(facade.history.redo()).toBe(true);
    expect(facade.scene.getObject(firstTree.id)!.transform).toEqual(after);

    // ── [8] 保存 → 重新打开 → 完整恢复 ──
    const beforeSave = snapshot(facade);
    const layersBefore = deepClone(facade.scene.getLayers());
    const json = facade.saveScene();
    const data = new SceneSerializer().deserialize(json);
    expect(data.objects).toHaveLength(4); // 1 区域 + 3 树
    expect(data.layers).toHaveLength(11);
    expect(data.environment.preset).toBe('day');

    // 场景文件只存数据定义与引用：对象内只有 presetId / assetId 引用，无样式/模型本体、无渲染字段
    for (const obj of data.objects) {
      expect(obj).not.toHaveProperty('material');
      expect(obj).not.toHaveProperty('isMesh');
      expect(obj).not.toHaveProperty('position'); // transform.position 才是业务字段
    }

    facade.openScene(data);
    expect(facade.history.canUndo()).toBe(false); // 重开清空历史
    expect(facade.selection.getSelectedIds()).toEqual([]);
    expect(snapshot(facade)).toEqual(beforeSave);
    expect(facade.scene.getLayers()).toEqual(layersBefore);

    // 二次保存与首次保存字节级一致（往返稳定）
    expect(facade.saveScene()).toBe(json);

    // 重开后的对象仍可继续经命令编辑（同一数据结构、同一命令链）
    const reopened = facade.scene.getObject(region.id) as RegionObject;
    expect(reopened.semantic.type).toBe('building');
    expect(reopened.semantic.properties.height).toBe(10);
    expect(facade.history.execute(new ChangePropertyCommand(region.id, { height: 66 }))).toBe(true);
    expect((facade.scene.getObject(region.id) as RegionObject).properties.height).toBe(66);
  });

  it('核心校验：全部可见修改均有命令记录且可撤销到初始空场景', () => {
    // 1 绘制创建（经工具内部 CreateObjectCommand）
    const ground = new Map<string, Vec3>([
      ['10,10', { x: 0, y: 0, z: 0 }],
      ['20,20', { x: 4, y: 0, z: 0 }],
      ['30,30', { x: 4, y: 0, z: 4 }],
    ]);
    for (const [key, p] of ground) viewport.setGround(Number(key.split(',')[0]), Number(key.split(',')[1]), p);
    facade.tools.activate('draw-polygon', { shape: 'polygon' });
    const draw = facade.tools.getActiveTool()!;
    draw.onPointerDown(left(10, 10));
    draw.onPointerDown(left(20, 20));
    draw.onDoubleClick?.(left(30, 30));
    const regionId = facade.scene.getObjects()[0]!.id;
    facade.history.execute(new ChangeSemanticCommand(regionId, { type: 'water', properties: {} })); // 2
    facade.history.execute(new ChangePropertyCommand(regionId, { height: 99 })); // 3
    facade.tools.activate('placement', { assetId: 'asset_tree' });
    const tool = facade.tools.getActiveTool()!;
    tool.onPointerMove(left(1, 1));
    tool.onPointerDown(left(1, 1)); // 4
    facade.tools.cancel();
    const manual: RegionObject = {
      id: 'region_manual_1',
      type: 'region',
      name: '手绘区域',
      parentId: null,
      layerId: null,
      visible: true,
      locked: false,
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      properties: {},
      shape: { type: 'point', points: [], baseHeight: 0, closed: false },
      semantic: { type: 'unclassified', properties: {} },
      style: { presetId: 'default_solid', overrides: {} },
    };
    facade.history.execute(new CreateObjectCommand(manual)); // 5（手绘路径：同一 CreateObjectCommand）

    let steps = 0;
    while (facade.history.undo()) steps += 1;
    expect(steps).toBe(5);
    expect(facade.scene.getObjects()).toEqual([]);
    expect(facade.scene.getLayers()).toHaveLength(11); // 图层为场景结构，不随对象命令撤销

    let redone = 0;
    while (facade.history.redo()) redone += 1;
    expect(redone).toBe(5);
    expect(facade.scene.getObjects()).toHaveLength(3); // 1 绘制区域 + 1 树 + 1 手绘区域
  });

  it('dispose 幂等且退出激活工具', () => {
    facade.tools.activate('select');
    facade.dispose();
    expect(facade.tools.getActiveTool()).toBeNull();
    expect(() => facade.dispose()).not.toThrow();
  });
});

/** 经 undo/redo 往返测量撤销栈深度（HistoryManager 无 size API，验收测试自行度量） */
function countUndoDepth(facade: EditorFacade): number {
  let depth = 0;
  while (facade.history.undo()) depth += 1;
  for (let i = 0; i < depth; i++) facade.history.redo();
  return depth;
}
