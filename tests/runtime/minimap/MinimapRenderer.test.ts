/**
 * tests/runtime/minimap/MinimapRenderer.test.ts —— 园区导航小地图第二视图结构测试（T7.7，先测后码）。
 *
 * node 无 DOM/WebGL：装置传 host=null（无头形态——派生轮廓同步/视野 overlay 逻辑可测，
 * canvas 与 GL 渲染归浏览器验收 T7.8）。覆盖：
 * - 派生轮廓同步（EventBus 驱动）：构造时全量同步；polygon→俯视填充面、line→带宽条带、
 *   point/model→标记点（批合并单 Points）；transform 变更重建、style-only 变更不触碰；
 * - 可见性联动：对象 visible ∧ 图层 visible（任一为假不出现在小地图）；
 * - 生命周期：object:removed / scene:changed(clear) 全清；dispose 幂等 + 事件退订；
 * - 装置级开销锁定：派生 scene 恒 3 组（轮廓组 + 标记批 + overlay 线），可渲染对象数
 *   = 可见轮廓数 + 2（draw call 增量上限锁定）；
 * - 视野 overlay：render(主相机) 后四边形 + 朝向线顶点有限非零。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { EventBus } from '../../../src/core/events/EventBus';
import { createId } from '../../../src/core/id';
import type { RegionObject, RegionShape, SemanticType } from '../../../src/domain/regions';
import type { ModelObject } from '../../../src/domain/assets';
import type { Layer } from '../../../src/scene/Layer';
import { SceneManager } from '../../../src/scene/SceneManager';
import {
  MODEL_MINIMAP_COLOR,
  MINIMAP_MARKER_RENDER_ORDER,
  SEMANTIC_MINIMAP_COLORS,
  MinimapRenderer,
} from '../../../src/runtime/MinimapRenderer';

// ── 装置与数据工厂 ──────────────────────────────────────────

function makeShape(type: RegionShape['type'], points: { x: number; y: number }[]): RegionShape {
  return {
    type,
    points,
    baseHeight: 0,
    closed: type !== 'line' && type !== 'point',
  };
}

function makeRegion(
  over: {
    id?: string;
    semanticType?: SemanticType;
    shape?: RegionShape;
    position?: { x: number; y: number; z: number };
    layerId?: string | null;
    visible?: boolean;
  } = {},
): RegionObject {
  return {
    id: over.id ?? createId('region'),
    type: 'region',
    name: '区域',
    parentId: null,
    layerId: over.layerId ?? null,
    visible: over.visible ?? true,
    locked: false,
    transform: {
      position: over.position ?? { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
    shape: over.shape ?? makeShape('polygon', [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 8 },
      { x: 0, y: 8 },
    ]),
    semantic: { type: over.semanticType ?? 'unclassified', properties: {} },
    style: { presetId: 'default_solid', overrides: {} },
  };
}

function makeModel(over: { id?: string; position?: { x: number; y: number; z: number } } = {}): ModelObject {
  return {
    id: over.id ?? createId('model'),
    type: 'model',
    name: '模型',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: {
      position: over.position ?? { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
    asset: { assetId: 'asset_tree' },
  };
}

function makeLayer(id: string, visible = true): Layer {
  return { id, name: `图层 ${id}`, visible, locked: false, opacity: 1, order: 0, objectIds: [] };
}

function setup(): { bus: EventBus; scene: SceneManager } {
  const bus = new EventBus();
  const scene = new SceneManager(bus);
  return { bus, scene };
}

/** 主相机替身（俯视前倾，模拟编辑器默认机位） */
function mainCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(50, 1.6, 1, 10000);
  camera.position.set(60, 50, 80);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  return camera;
}

// ── 派生轮廓同步 ────────────────────────────────────────────

describe('MinimapRenderer：派生轮廓同步（EventBus 驱动）', () => {
  it('构造时全量同步已存在对象（先加对象后建小地图）', () => {
    const { bus, scene } = setup();
    scene.addObject(makeRegion({ semanticType: 'water' }));
    const minimap = new MinimapRenderer(null, { eventBus: bus, sceneManager: scene });
    expect(minimap.outlineCount).toBe(1);
    minimap.dispose();
  });

  it('object:created polygon → 俯视填充面（语义配色 + 透明材质）', () => {
    const { bus, scene } = setup();
    const minimap = new MinimapRenderer(null, { eventBus: bus, sceneManager: scene });
    scene.addObject(makeRegion({ semanticType: 'water' }));
    expect(minimap.outlineCount).toBe(1);
    const mesh = minimap.outlineAt(0) as THREE.Mesh;
    expect(mesh).toBeTruthy();
    const material = mesh.material as THREE.MeshBasicMaterial;
    expect(material.color.getHex()).toBe(SEMANTIC_MINIMAP_COLORS.water);
    expect(material.transparent).toBe(true);
    expect(mesh.geometry.getAttribute('position').count).toBeGreaterThanOrEqual(4);
    minimap.dispose();
  });

  it('object:created line（road）→ 带宽条带（三角化索引 > 0）', () => {
    const { bus, scene } = setup();
    const minimap = new MinimapRenderer(null, { eventBus: bus, sceneManager: scene });
    scene.addObject(
      makeRegion({
        semanticType: 'road',
        shape: makeShape('line', [
          { x: 0, y: 0 },
          { x: 20, y: 0 },
          { x: 20, y: 15 },
        ]),
      }),
    );
    const mesh = minimap.outlineAt(0) as THREE.Mesh;
    expect(mesh.geometry.getIndex()!.count).toBeGreaterThan(0);
    expect((mesh.material as THREE.MeshBasicMaterial).color.getHex()).toBe(SEMANTIC_MINIMAP_COLORS.road);
    minimap.dispose();
  });

  it('point region 与 model 对象 → 标记批（单 Points，顶点色按语义/模型色）', () => {
    const { bus, scene } = setup();
    const minimap = new MinimapRenderer(null, { eventBus: bus, sceneManager: scene });
    scene.addObject(makeRegion({ semanticType: 'poi', shape: makeShape('point', [{ x: 12, y: -4 }]) }));
    scene.addObject(makeModel({ position: { x: -8, y: 0, z: 30 } }));
    expect(minimap.outlineCount).toBe(0); // 标记不占轮廓面
    const markers = minimap.markersMesh;
    expect(markers).toBeTruthy();
    const position = markers.geometry.getAttribute('position') as THREE.BufferAttribute;
    expect(position.count).toBe(2);
    const color = markers.geometry.getAttribute('color') as THREE.BufferAttribute;
    const poiColor = new THREE.Color(SEMANTIC_MINIMAP_COLORS.poi);
    expect(color.getX(0)).toBeCloseTo(poiColor.r, 6);
    expect(color.getY(0)).toBeCloseTo(poiColor.g, 6);
    expect(color.getZ(0)).toBeCloseTo(poiColor.b, 6);
    const modelColor = new THREE.Color(MODEL_MINIMAP_COLOR);
    expect(color.getX(1)).toBeCloseTo(modelColor.r, 6);
    expect(color.getY(1)).toBeCloseTo(modelColor.g, 6);
    expect(color.getZ(1)).toBeCloseTo(modelColor.b, 6);
    expect(markers.renderOrder).toBe(MINIMAP_MARKER_RENDER_ORDER);
    minimap.dispose();
  });

  it('object:updated transform → 轮廓几何重建（世界顶点平移）', () => {
    const { bus, scene } = setup();
    const minimap = new MinimapRenderer(null, { eventBus: bus, sceneManager: scene });
    const region = makeRegion({ semanticType: 'grass' });
    scene.addObject(region);
    const before = (minimap.outlineAt(0) as THREE.Mesh).geometry.getAttribute('position') as THREE.BufferAttribute;
    const minXBefore = Math.min(before.getX(0), before.getX(1), before.getX(2), before.getX(3));

    scene.updateObject(region.id, {
      transform: {
        position: { x: 100, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
    });
    const after = (minimap.outlineAt(0) as THREE.Mesh).geometry.getAttribute('position') as THREE.BufferAttribute;
    const minXAfter = Math.min(after.getX(0), after.getX(1), after.getX(2), after.getX(3));
    expect(minXAfter - minXBefore).toBeCloseTo(100, 6);
    minimap.dispose();
  });

  it('object:updated 仅 style 变更 → 轮廓不动（同 mesh 引用、同顶点）', () => {
    const { bus, scene } = setup();
    const minimap = new MinimapRenderer(null, { eventBus: bus, sceneManager: scene });
    const region = makeRegion();
    scene.addObject(region);
    const meshBefore = minimap.outlineAt(0);
    const posBefore = ((meshBefore as THREE.Mesh).geometry.getAttribute('position') as THREE.BufferAttribute).clone();

    scene.updateObject(region.id, {
      style: { presetId: 'custom.x', overrides: { color: '#123456' } },
    } as never);
    expect(minimap.outlineAt(0)).toBe(meshBefore);
    const posAfter = ((minimap.outlineAt(0) as THREE.Mesh).geometry.getAttribute('position') as THREE.BufferAttribute);
    expect(posAfter.array).toEqual(posBefore.array);
    minimap.dispose();
  });

  it('对象 visible=false → 轮廓/标记移除；恢复可见 → 回来', () => {
    const { bus, scene } = setup();
    const minimap = new MinimapRenderer(null, { eventBus: bus, sceneManager: scene });
    const region = makeRegion({ semanticType: 'building' });
    scene.addObject(region);
    expect(minimap.outlineCount).toBe(1);
    scene.updateObject(region.id, { visible: false });
    expect(minimap.outlineCount).toBe(0);
    scene.updateObject(region.id, { visible: true });
    expect(minimap.outlineCount).toBe(1);
    minimap.dispose();
  });

  it('图层 visible=false → 成员整体移除（对象可见性 ∧ 图层可见性）；恢复 → 回来', () => {
    const { bus, scene } = setup();
    const layer = makeLayer('layer_a');
    scene.addLayer(layer);
    const minimap = new MinimapRenderer(null, { eventBus: bus, sceneManager: scene });
    scene.addObject(makeRegion({ semanticType: 'plaza', layerId: 'layer_a' }));
    expect(minimap.outlineCount).toBe(1);

    scene.updateLayer('layer_a', { visible: false });
    expect(minimap.outlineCount).toBe(0);
    scene.updateLayer('layer_a', { visible: true });
    expect(minimap.outlineCount).toBe(1);
    minimap.dispose();
  });

  it('添加到隐藏图层的对象 → 不出现', () => {
    const { bus, scene } = setup();
    const layer = makeLayer('layer_hidden', false);
    scene.addLayer(layer);
    const minimap = new MinimapRenderer(null, { eventBus: bus, sceneManager: scene });
    scene.addObject(makeRegion({ semanticType: 'grass', layerId: 'layer_hidden' }));
    expect(minimap.outlineCount).toBe(0);
    minimap.dispose();
  });

  it('object:removed → 移除；scene:changed(clear) → 全清（含标记）', () => {
    const { bus, scene } = setup();
    const minimap = new MinimapRenderer(null, { eventBus: bus, sceneManager: scene });
    const a = makeRegion({ semanticType: 'water' });
    const b = makeModel();
    scene.addObject(a);
    scene.addObject(b);
    expect(minimap.outlineCount).toBe(1);
    expect(minimap.markersMesh.geometry.getAttribute('position').count).toBe(1);

    scene.removeObject(a.id);
    expect(minimap.outlineCount).toBe(0);
    scene.clear();
    expect(minimap.outlineCount).toBe(0);
    expect(minimap.markersMesh.geometry.getAttribute('position').count).toBe(0);
    minimap.dispose();
  });
});

// ── 装置开销与生命周期 ──────────────────────────────────────

describe('MinimapRenderer：装置开销与生命周期', () => {
  it('派生 scene 恒 3 组（轮廓组 + 标记批 + overlay 线）；可渲染对象数 = 可见轮廓 + 2', () => {
    const { bus, scene } = setup();
    const minimap = new MinimapRenderer(null, { eventBus: bus, sceneManager: scene });
    scene.addObject(makeRegion({ semanticType: 'water' }));
    scene.addObject(makeRegion({ semanticType: 'road', shape: makeShape('line', [{ x: 0, y: 0 }, { x: 30, y: 0 }]) }));
    scene.addObject(makeModel());

    expect(minimap.scene.children.length).toBe(3);
    const renderables = countRenderables(minimap.scene);
    // 2 轮廓 + 1 标记批 + 1 overlay = 4（装置级 draw call 锁定：轮廓数 + 2）
    expect(renderables).toBe(minimap.outlineCount + 2);
    minimap.dispose();
  });

  it('无头形态：render(主相机) 不抛错；overlay 顶点有限且非全零', () => {
    const { bus, scene } = setup();
    const minimap = new MinimapRenderer(null, { eventBus: bus, sceneManager: scene });
    scene.addObject(makeRegion({ semanticType: 'water' }));
    expect(() => minimap.render(mainCamera())).not.toThrow();

    const overlay = minimap.overlayLine;
    const position = overlay.geometry.getAttribute('position') as THREE.BufferAttribute;
    // 5 段（四边形闭合 4 段 + 朝向 1 段）× 2 端点
    expect(position.count).toBe(10);
    let anyNonZero = false;
    for (let i = 0; i < position.count; i += 1) {
      expect(Number.isFinite(position.getX(i))).toBe(true);
      expect(Number.isFinite(position.getZ(i))).toBe(true);
      if (position.getX(i) !== 0 || position.getZ(i) !== 0) anyNonZero = true;
    }
    expect(anyNonZero).toBe(true);
    minimap.dispose();
  });

  it('setVisible(false) → 不可渲染且 render 空转；恢复 → 可渲染', () => {
    const { bus, scene } = setup();
    const minimap = new MinimapRenderer(null, { eventBus: bus, sceneManager: scene });
    expect(minimap.isRenderable).toBe(true);
    minimap.setVisible(false);
    expect(minimap.isRenderable).toBe(false);
    expect(() => minimap.render(mainCamera())).not.toThrow();
    minimap.setVisible(true);
    expect(minimap.isRenderable).toBe(true);
    minimap.dispose();
  });

  it('dispose 幂等；dispose 后 EventBus 再发事件不再增长派生节点（退订生效）', () => {
    const { bus, scene } = setup();
    const minimap = new MinimapRenderer(null, { eventBus: bus, sceneManager: scene });
    minimap.dispose();
    expect(() => minimap.dispose()).not.toThrow();
    expect(() => scene.addObject(makeRegion())).not.toThrow();
    expect(minimap.outlineCount).toBe(0);
    expect(minimap.scene.children.length).toBe(0);
  });
});

/** 场景内可渲染对象计数（Mesh / Line / Points；沿 AxesIndicator 测试口径） */
function countRenderables(root: THREE.Object3D): number {
  let count = 0;
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (mesh.isMesh || (node as THREE.Line).isLine || (node as THREE.Points).isPoints) count += 1;
  });
  return count;
}
