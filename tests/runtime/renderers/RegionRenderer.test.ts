/**
 * tests/runtime/renderers/RegionRenderer.test.ts —— RegionObject 渲染器生命周期测试（T6.4，先测后码）。
 *
 * 覆盖（任务书验收 + 主代理裁决 R5/R8/R9）：
 * - create：wrapper Group（map 根恒定）、样式实例子节点挂载、公共属性应用；
 * - 三类修改解耦（2026-09-11 审计拆分断言）：
 *   ①改 shape → 几何重生成 + setGeometry 重绑，旧几何由渲染器 dispose；
 *     材质实例与样式参数不动（material 引用不变）；
 *   ②切语义类型 → dispose 旧实例 + createStyle 新实例，**几何顶点不动**
 *     （同一 BufferGeometry 对象传入新实例）；子节点换新、wrapper 根不变；
 *   ③切预设 → dispose + create，几何复用不重建；调参数（同 presetId）→ updateStyle
 *     路径（object 引用不变）；
 * - 命令键形兼容：ChangeSemanticCommand 参数变更 ['semantic','layerId','style']
 *   不误判为切类型/切预设；ChangeShapeCommand ['shape']、ChangePresetCommand ['style']；
 * - line 形状语义参数（road.width）变更 → 几何重生成 + setGeometry（材质不重建）；
 * - semantic 属性经 updateStyle 保留键透传到插件；
 * - overrides 键删除（回默认值）→ 引擎增量合并不生效，渲染器走 dispose+create（几何仍复用）；
 * - 零泄漏（R9）：dispose 后几何 dispose 事件触发；materialPool 模板引用计数归零
 *   （两个 region 共用预设，逐一删除，最后释放模板本体）；
 * - 图层联动（R8）：applyLayerOpacityToTree 对 Mesh 与 Sprite 材质乘算图层透明度、
 *   恢复 layerOpacity=1 回基准值。
 * 装置：临时预设经 registerBuildRoute seam 注入（隔离 materialPool 模块级缓存），
 *      真实 THREE 材质（沿 engine.test 范式，node 可实例化、不做 WebGL 渲染）。
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { RegionObject, ShapeType } from '../../../src/domain/regions';
import { registerBuildRoute, unregisterBuildRoute } from '../../../src/runtime/styles/routes';
import type { StyleInstance, StylePresetBuild } from '../../../src/runtime/styles/types';

// 被测模块（先失败后实现的 TDD 引入）
import { RegionRenderer } from '../../../src/runtime/renderers/RegionRenderer';
import { applyLayerOpacityToTree } from '../../../src/runtime/renderers/layerState';

/** dispose 事件计数（Material/BufferGeometry 均 dispatch 'dispose'） */
function countDisposes(target: THREE.Material | THREE.BufferGeometry): { count: () => number } {
  let n = 0;
  target.addEventListener('dispose', () => {
    n += 1;
  });
  return { count: () => n };
}

// ── 临时预设工厂（seam 注入，不依赖文件系统；隔离模板池）────────

const ALL_SHAPES: ShapeType[] = ['polygon', 'rectangle', 'circle', 'ellipse', 'freehand', 'line', 'point'];
const tempRoutes: string[] = [];
const liveWrappers: THREE.Object3D[] = [];

/** 引擎 update 透传到插件的参数记录（保留键 semantic 断言用） */
const capturedUpdates: Record<string, unknown>[] = [];

function registerTempPreset(id: string, opts: { capture?: boolean } = {}): string {
  const build: StylePresetBuild = (geometry, params) => {
    const color = typeof params.color === 'string' && params.color !== '' ? params.color : '#4a6fa5';
    const opacity = typeof params.opacity === 'number' ? params.opacity : 1;
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      opacity,
      transparent: opacity < 1,
    });
    const mesh = new THREE.Mesh(geometry, material);
    const instance: StyleInstance = {
      object: mesh,
      material,
      presetId: id,
      supportedShapes: [...ALL_SHAPES],
      update(p) {
        if (opts.capture) capturedUpdates.push(p);
        const mat = instance.material as THREE.MeshStandardMaterial;
        if (typeof p.color === 'string' && p.color !== '') mat.color.set(p.color);
        if (typeof p.opacity === 'number' && Number.isFinite(p.opacity)) {
          mat.opacity = p.opacity;
          mat.transparent = p.opacity < 1;
        }
      },
      setGeometry(next) {
        mesh.geometry = next;
      },
      dispose() {
        mesh.removeFromParent();
      },
    };
    return instance;
  };
  registerBuildRoute(id, build, {
    id,
    name: id,
    supportedShapes: [...ALL_SHAPES],
    supportedSemantics: ['unclassified', 'water', 'grass', 'plaza', 'parking', 'bare_land', 'road', 'building', 'poi', 'custom'],
    defaultParams: [
      { key: 'color', label: '颜色', type: 'color', default: '#4a6fa5' },
      { key: 'opacity', label: '透明度', type: 'number', default: 1, min: 0, max: 1 },
    ],
  });
  tempRoutes.push(id);
  return id;
}

const PRESET_A = 'test.rr_water';
const PRESET_B = 'test.rr_grass';
const renderer = new RegionRenderer();

beforeEach(() => {
  registerTempPreset(PRESET_A, { capture: true });
  registerTempPreset(PRESET_B);
  capturedUpdates.length = 0;
});

afterEach(() => {
  for (const root of liveWrappers.splice(0)) renderer.dispose(root);
  for (const id of tempRoutes.splice(0)) unregisterBuildRoute(id);
});

// ── fixture ─────────────────────────────────────────────────

const RECT = [
  { x: -5, y: -4 },
  { x: 5, y: -4 },
  { x: 5, y: 4 },
  { x: -5, y: 4 },
];

function makeRegion(overrides: Partial<RegionObject> = {}): RegionObject {
  return {
    id: 'region_t1',
    type: 'region',
    name: '测试区域',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: { position: { x: 1, y: 2, z: 3 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    properties: {},
    shape: { type: 'polygon', points: RECT, baseHeight: 0.12, closed: true },
    semantic: { type: 'water', properties: {} },
    style: { presetId: PRESET_A, overrides: {} },
    ...overrides,
  };
}

/** create + 登记（afterEach 统一 dispose） */
function mount(obj: RegionObject): THREE.Object3D {
  const root = renderer.create(obj);
  liveWrappers.push(root);
  return root;
}

/** 当前样式实例的根 mesh 几何 */
function meshGeometry(root: THREE.Object3D): THREE.BufferGeometry {
  return (root.children[0] as THREE.Mesh).geometry;
}

// ── create ──────────────────────────────────────────────────

describe('create', () => {
  it('返回 wrapper Group：样式实例子节点挂载、公共属性应用', () => {
    const obj = makeRegion();
    const root = renderer.create(obj);
    liveWrappers.push(root);
    expect(root).toBeInstanceOf(THREE.Group);
    expect(root.children).toHaveLength(1);
    expect(root.name).toBe('测试区域');
    expect(root.position).toEqual(new THREE.Vector3(1, 2, 3));
    expect(root.visible).toBe(true);
    expect(meshGeometry(root).getAttribute('position').count).toBeGreaterThan(0);
  });

  it('Mesh 子节点 receiveShadow=true；castShadow 由预设自决（临时预设未设 → false；building 挤出为 true 见 building.test）', () => {
    const root = mount(makeRegion());
    const mesh = root.children[0] as THREE.Mesh;
    expect(mesh.receiveShadow).toBe(true);
    expect(mesh.castShadow).toBe(false); // 渲染器只写 receiveShadow，不覆盖插件自设值
  });
});

// ── 三类修改解耦 ────────────────────────────────────────────

describe('① 改 shape：几何重建重绑，材质不动', () => {
  it("keys=['shape'] → setGeometry 新几何、旧几何 dispose、material 引用不变", () => {
    const obj = makeRegion();
    const root = mount(obj);
    const mesh = root.children[0] as THREE.Mesh;
    const material = mesh.material;
    const oldGeometry = mesh.geometry;
    const oldDisposes = countDisposes(oldGeometry);

    const next = makeRegion({
      shape: { type: 'polygon', points: [{ x: 0, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 6 }, { x: 0, y: 6 }], baseHeight: 0.12, closed: true },
    });
    renderer.update(root, next, ['shape']);

    expect(mesh.geometry).not.toBe(oldGeometry); // 新几何重绑
    expect(oldDisposes.count()).toBe(1); // 旧几何由渲染器释放（授权规则 2）
    expect(mesh.material).toBe(material); // 材质实例不动
    expect(root.children[0]).toBe(mesh); // object 引用不动
  });

  it('几何顶点确实更新（新点列外沿生效）', () => {
    const root = mount(makeRegion());
    renderer.update(
      root,
      makeRegion({ shape: { type: 'polygon', points: [{ x: 0, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 6 }, { x: 0, y: 6 }], baseHeight: 0.12, closed: true } }),
      ['shape'],
    );
    meshGeometry(root).computeBoundingBox();
    const box = meshGeometry(root).boundingBox!;
    expect(box.max.x).toBeCloseTo(8, 5);
    expect(box.max.z).toBeCloseTo(6, 5);
  });
});

describe('② 切语义类型：dispose 旧实例 + create 新实例，几何不动', () => {
  it("keys=['semantic','layerId','style']（ChangeSemanticCommand 键形）→ 子节点换新、同一 BufferGeometry 复用", () => {
    const obj = makeRegion();
    const root = mount(obj);
    const oldMesh = root.children[0] as THREE.Mesh;
    const oldMaterial = oldMesh.material as THREE.Material;
    const oldMaterialDisposes = countDisposes(oldMaterial);
    const geometry = meshGeometry(root);

    // 类型切换命令：semantic 换 grass + 命令层重置样式（新类型默认预设 + overrides 清空）
    const next = makeRegion({
      semantic: { type: 'grass', properties: {} },
      layerId: 'layer_grass',
      style: { presetId: PRESET_B, overrides: {} },
    });
    renderer.update(root, next, ['semantic', 'layerId', 'style']);

    expect(root.children[0]).not.toBe(oldMesh); // 子节点换新（材质随预设重建）
    expect(meshGeometry(root)).toBe(geometry); // 几何顶点不动（同一 BufferGeometry 对象）
    expect(oldMaterialDisposes.count()).toBe(1); // 旧实例材质释放（独享/模板归置经 disposeStyle）
    expect(root.position).toEqual(new THREE.Vector3(1, 2, 3)); // wrapper 公共属性保持
  });

  it('undo 回切：几何仍复用（前后 BufferGeometry 身份一致）', () => {
    const root = mount(makeRegion());
    const geometry = meshGeometry(root);
    renderer.update(root, makeRegion({ semantic: { type: 'grass', properties: {} }, style: { presetId: PRESET_B, overrides: {} } }), ['semantic', 'layerId', 'style']);
    renderer.update(root, makeRegion(), ['semantic', 'layerId', 'style']);
    expect(meshGeometry(root)).toBe(geometry);
  });
});

describe('语义参数变更（同类型）：不重建材质', () => {
  it('line 形状 road.width 变更 → 几何重生成 + setGeometry，material 不变', () => {
    const obj = makeRegion({
      shape: { type: 'line', points: [{ x: 0, y: 0 }, { x: 10, y: 0 }], baseHeight: 0.06, closed: false },
      semantic: { type: 'road', properties: { width: 4 } },
      style: { presetId: PRESET_A, overrides: {} },
    });
    const root = mount(obj);
    const mesh = root.children[0] as THREE.Mesh;
    const oldGeometry = mesh.geometry;
    const oldDisposes = countDisposes(oldGeometry);

    renderer.update(
      root,
      makeRegion({
        shape: { type: 'line', points: [{ x: 0, y: 0 }, { x: 10, y: 0 }], baseHeight: 0.06, closed: false },
        semantic: { type: 'road', properties: { width: 9 } },
        style: { presetId: PRESET_A, overrides: {} },
      }),
      ['semantic', 'layerId', 'style'], // ChangeSemanticCommand 参数变更键形（style 值未变）
    );

    expect(mesh.geometry).not.toBe(oldGeometry); // width 生效：几何重建
    expect(oldDisposes.count()).toBe(1);
    expect(root.children[0]).toBe(mesh); // 实例对象不换（不走 dispose+create）
    // 材质语义等价（共享模板实例经 updateStyle 可能被引擎写时复制提升 clone，颜色保持默认）
    expect((mesh.material as THREE.MeshStandardMaterial).color.getHexString()).toBe('4a6fa5');
    // 新几何条带宽度 9（左右顶点距离）
    const position = mesh.geometry.getAttribute('position');
    const left = new THREE.Vector3(position.getX(0), 0, position.getZ(0));
    const right = new THREE.Vector3(position.getX(1), 0, position.getZ(1));
    expect(left.distanceTo(right)).toBeCloseTo(9, 5);
  });

  it('semantic 属性经 updateStyle 保留键透传到插件（building.height 通路）', () => {
    const root = mount(makeRegion({ semantic: { type: 'building', properties: { height: 10 } } }));
    capturedUpdates.length = 0;
    renderer.update(
      root,
      makeRegion({ semantic: { type: 'building', properties: { height: 20 } } }),
      ['semantic', 'layerId', 'style'],
    );
    expect(capturedUpdates.length).toBeGreaterThan(0);
    expect(capturedUpdates.at(-1)!.semantic).toEqual({ height: 20 });
  });

  it('参数变更（含 style 键但 presetId/键集不变）不误判为切预设：object 引用不变', () => {
    const root = mount(makeRegion());
    const mesh = root.children[0] as THREE.Mesh;
    renderer.update(root, makeRegion({ semantic: { type: 'water', properties: { depth: 2 } } }), ['semantic', 'layerId', 'style']);
    expect(root.children[0]).toBe(mesh);
  });
});

describe('③ 改 style：切预设 dispose+create（几何复用），调参数 update', () => {
  it("keys=['style'] presetId 不同 → 子节点换新、几何复用（BufferGeometry 身份不变）", () => {
    const root = mount(makeRegion());
    const geometry = meshGeometry(root);
    const oldMesh = root.children[0] as THREE.Mesh;

    renderer.update(root, makeRegion({ style: { presetId: PRESET_B, overrides: {} } }), ['style']);

    expect(root.children[0]).not.toBe(oldMesh);
    expect(meshGeometry(root)).toBe(geometry); // 几何复用不重建
  });

  it('同 presetId 调参数（overrides 值变）→ updateStyle 路径：object 引用不变、参数生效', () => {
    const root = mount(makeRegion({ style: { presetId: PRESET_A, overrides: { color: '#4a6fa5' } } })); // 同默认值覆写 → 独享材质
    const mesh = root.children[0] as THREE.Mesh;
    renderer.update(root, makeRegion({ style: { presetId: PRESET_A, overrides: { color: '#ff0000' } } }), ['style']);
    expect(root.children[0]).toBe(mesh); // 不换对象
    expect((mesh.material as THREE.MeshStandardMaterial).color.getHexString()).toBe('ff0000');
  });

  it('overrides 键删除（回默认值）→ dispose+create 路径（引擎增量合并不支持删键）；几何仍复用', () => {
    const root = mount(makeRegion({ style: { presetId: PRESET_A, overrides: { color: '#ff0000', opacity: 0.5 } } }));
    const geometry = meshGeometry(root);
    const mesh = root.children[0] as THREE.Mesh;

    renderer.update(root, makeRegion({ style: { presetId: PRESET_A, overrides: { color: '#ff0000' } } }), ['style']); // opacity 键被删除

    expect(root.children[0]).not.toBe(mesh); // 走 dispose+create
    expect(meshGeometry(root)).toBe(geometry); // 几何复用
    const mat = (root.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
    expect(mat.opacity).toBeCloseTo(1, 5); // opacity 回默认（增量合并做不到）
    expect(mat.color.getHexString()).toBe('ff0000'); // 保留键仍生效
  });

  it('键集仅新增（无删除）→ update 路径（不 dispose+create）', () => {
    const root = mount(makeRegion({ style: { presetId: PRESET_A, overrides: { color: '#ff0000' } } }));
    const mesh = root.children[0] as THREE.Mesh;
    renderer.update(root, makeRegion({ style: { presetId: PRESET_A, overrides: { color: '#ff0000', opacity: 0.5 } } }), ['style']);
    expect(root.children[0]).toBe(mesh);
    expect((mesh.material as THREE.MeshStandardMaterial).opacity).toBeCloseTo(0.5, 5);
  });
});

// ── 其他键形与幂等 ──────────────────────────────────────────

describe('键形兼容与幂等', () => {
  it("keys=['layerId']（仅归层）→ 不触碰几何/样式，只重应用公共属性", () => {
    const root = mount(makeRegion());
    const mesh = root.children[0] as THREE.Mesh;
    const geometry = mesh.geometry;
    renderer.update(root, makeRegion({ layerId: 'layer_x', name: '改名' }), ['layerId']);
    expect(root.children[0]).toBe(mesh);
    expect(mesh.geometry).toBe(geometry);
    expect(root.name).toBe('改名');
  });

  it('keys 缺省（全量）→ 形状重生成 + 参数路径，全部幂等不炸', () => {
    const root = mount(makeRegion());
    renderer.update(root, makeRegion({ name: '全量' }));
    expect(root.name).toBe('全量');
    expect(meshGeometry(root).getAttribute('position').count).toBeGreaterThan(0);
  });
});

// ── 零泄漏（R9）─────────────────────────────────────────────

describe('dispose 零泄漏', () => {
  it('dispose：几何 dispose 事件触发、材质释放、记录清理（重复 dispose 幂等）', () => {
    const obj = makeRegion({ style: { presetId: PRESET_A, overrides: { color: '#ff0000' } } }); // 独享材质
    const root = renderer.create(obj);
    const geometry = meshGeometry(root);
    const material = (root.children[0] as THREE.Mesh).material as THREE.Material;
    const geoDisposes = countDisposes(geometry);
    const matDisposes = countDisposes(material);

    renderer.dispose(root);
    expect(geoDisposes.count()).toBe(1); // 几何归渲染器释放
    expect(matDisposes.count()).toBe(1); // 独享材质随 disposeStyle 释放
    renderer.dispose(root); // 幂等
    expect(geoDisposes.count()).toBe(1);
  });

  it('删除对象 → materialPool 模板引用计数归零（最后一个释放模板本体）', () => {
    const a = renderer.create(makeRegion({ id: 'region_a', style: { presetId: PRESET_B, overrides: {} } }));
    const b = renderer.create(makeRegion({ id: 'region_b', style: { presetId: PRESET_B, overrides: {} } }));
    const templateA = (a.children[0] as THREE.Mesh).material as THREE.Material;
    const templateB = (b.children[0] as THREE.Mesh).material as THREE.Material;
    expect(templateA).toBe(templateB); // 无覆写共享模板
    const templateDisposes = countDisposes(templateA);

    renderer.dispose(a);
    expect(templateDisposes.count()).toBe(0); // b 仍在用
    renderer.dispose(b);
    expect(templateDisposes.count()).toBe(1); // 最后一个释放模板
  });

  it('切换预设/类型期间的中间材质全部释放（dispose 后无残留引用）', () => {
    const root = mount(makeRegion());
    renderer.update(root, makeRegion({ semantic: { type: 'grass', properties: {} }, style: { presetId: PRESET_B, overrides: {} } }), ['semantic', 'layerId', 'style']);
    renderer.update(root, makeRegion({ style: { presetId: PRESET_A, overrides: {} } }), ['style']);
    // afterEach dispose 收尾；引擎模板簿记 WeakMap 无强引用，模板引用计数由上例锁定
  });
});

// ── 图层联动（R8）───────────────────────────────────────────

describe('applyLayerOpacityToTree（图层透明度乘算）', () => {
  it('Mesh 材质：opacity = 基准 × layerOpacity，transparent 联动；恢复回基准', () => {
    const material = new THREE.MeshStandardMaterial({ opacity: 0.8, transparent: true });
    const root = new THREE.Group();
    root.add(new THREE.Mesh(new THREE.PlaneGeometry(), material));
    const baseOpacity = new WeakMap<THREE.Material, number>();

    applyLayerOpacityToTree(root, 0.5, baseOpacity);
    expect(material.opacity).toBeCloseTo(0.4, 5);
    expect(material.transparent).toBe(true);

    applyLayerOpacityToTree(root, 1, baseOpacity); // 还原（layerOpacity=1）
    expect(material.opacity).toBeCloseTo(0.8, 5);
  });

  it('Sprite 材质（poi.billboard 根为 Sprite）同样乘算', () => {
    const material = new THREE.SpriteMaterial({ opacity: 1 });
    const root = new THREE.Group();
    root.add(new THREE.Sprite(material));
    const baseOpacity = new WeakMap<THREE.Material, number>();

    applyLayerOpacityToTree(root, 0.3, baseOpacity);
    expect(material.opacity).toBeCloseTo(0.3, 5);
    applyLayerOpacityToTree(root, 1, baseOpacity);
    expect(material.opacity).toBeCloseTo(1, 5);
  });

  it('材质数组（GLTF 多材质组）跳过不误写（沿旧要素现状语义）', () => {
    const m1 = new THREE.MeshStandardMaterial();
    const m2 = new THREE.MeshStandardMaterial();
    const root = new THREE.Group();
    root.add(new THREE.Mesh(new THREE.PlaneGeometry(), [m1, m2]));
    const baseOpacity = new WeakMap<THREE.Material, number>();
    applyLayerOpacityToTree(root, 0.5, baseOpacity);
    expect(m1.opacity).toBeCloseTo(1, 5);
    expect(m2.opacity).toBeCloseTo(1, 5);
  });
});
