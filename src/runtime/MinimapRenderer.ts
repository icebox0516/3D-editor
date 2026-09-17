/**
 * runtime/MinimapRenderer —— 右下角园区导航小地图（T7.7，需求 §12.4，第二视图）。
 *
 * 结构（沿 AxesIndicator 先例）：独立 canvas overlay（.ed-viewport__minimap，定位样式由
 * ui 层 CSS 承担）+ 独立小 WebGLRenderer + 派生俯视轮廓 scene + 正交俯视相机
 * （up=(0,0,-1)，北=-Z 在上）。不渲染主场景——维护派生简化轮廓：
 *   - region polygon 五面类 → 俯视填充面（ShapeGeometry）；
 *   - region line（道路）→ 中心线加宽条带（centerlineRibbonGeometry 复用）；
 *   - region point / model 对象 → 标记点（全部合并进单个 THREE.Points，屏幕恒定像素大小）；
 *   - MeshBasicMaterial 低饱和制图配色按语义十类着色（数据编码色，非 UI 强调色）。
 * 视野 overlay：纯函数 viewFootprint 计算主相机地面足迹四边形 + 朝向线
 * （琥珀线框，与 --accent 对应关系沿 §5.12 先例）。
 *
 * 同步与节流：
 *  - 轮廓层：EventBus 驱动即时增删改（object:created/updated/removed、layer:updated
 *    可见性联动、scene:changed(clear) 全量重建）；构造时按当前场景全量同步一次；
 *  - 视野 overlay：render() 帧驱动内检测主相机位姿变化，变化才重算（≥33ms 节流）；
 *  - GL 渲染：变化才绘制（needsRender + ≥33ms 节流，上限 ~30Hz）；隐藏/无头零开销。
 *    独立小上下文——主 renderer.info 口径（getViewportStats）不受本渲染污染。
 *
 * 生命周期与降级：
 *  - 宿主为空或无 DOM（node 测试）：无头形态——派生 scene / 同步 / overlay 逻辑可用，
 *    canvas 与 WebGLRenderer 不创建，render() 空转不抛错；
 *  - WebGL 初始化失败：降级无头并移除空 canvas，主渲染不受影响；
 *  - dispose 释放全部自有资源（几何/材质/标记批）并移除 canvas；幂等；
 *    绝不 forceContextLoss（独立小上下文，同 AxesIndicator / Renderer 语义）。
 *
 * 交互（浏览器形态，canvas 自有 pointer 事件）：拖拽（>4px 判定）持续 panTargetTo
 * 指针世界坐标；单击（未过拖拽阈值）跳转同语义；像素↔世界换算 = minimapLayout 纯函数
 * （换算精确到像素，无额外容差——语义即「指针处地面点」）。导航回调经 setNavigate
 * 注入（app 组合根 → CameraController.panTargetTo）。
 */
import * as THREE from 'three';
import type { EventBus } from '../core/events/EventBus';
import type { ID } from '../core/types';
import type { ModelObject } from '../domain/assets';
import { isRegionObject } from '../domain/regions';
import type { RegionObject, SemanticType } from '../domain/regions';
import type { SceneObject } from '../scene/SceneObject';
import type { SceneManager } from '../scene/SceneManager';
import { computeViewFootprint } from './minimap/viewFootprint';
import type { FrustumInput } from './minimap/viewFootprint';
import { fitMinimapView, minimapPixelToWorld } from './minimap/minimapLayout';
import type { Bounds2, MinimapView } from './minimap/minimapLayout';
import { centerlineRibbonGeometry, polygonSurfaceGeometry } from './renderers/geometryBuilders';

/** 小地图语义配色（低饱和制图色带；数据编码色，见 DESIGN.md §2 视口内容豁免条目） */
export const SEMANTIC_MINIMAP_COLORS: Readonly<Record<SemanticType, number>> = {
  unclassified: 0x6f7684,
  water: 0x4f7f95,
  grass: 0x63866b,
  plaza: 0x8d8574,
  parking: 0x757a88,
  bare_land: 0x87795f,
  road: 0x676d7a,
  building: 0x997f6d,
  poi: 0xb08d62,
  custom: 0x767d8a,
};

/** 模型对象标记色（中性亮灰蓝，与语义色带同明度带） */
export const MODEL_MINIMAP_COLOR = 0x98a0b0;

/** 俯视制图层叠序（painter 序：地表 < 道路 < 绿地 < 水面 < 建筑 < 标记 < overlay） */
const SEMANTIC_MINIMAP_ORDER: Readonly<Record<SemanticType, number>> = {
  unclassified: 0,
  bare_land: 0,
  plaza: 1,
  parking: 1,
  custom: 1,
  road: 2,
  grass: 3,
  water: 4,
  building: 10,
  poi: 11,
};

/** 标记批与视野 overlay 的 renderOrder（恒在最上） */
export const MINIMAP_MARKER_RENDER_ORDER = 20;
const OVERLAY_RENDER_ORDER = 100;

/** line（道路）带宽缺省（与 GeometryBuilder.DEFAULT_LINE_WIDTH 同源值） */
const DEFAULT_LINE_WIDTH = 6;
/** 拖拽判定阈值（CSS 像素；与 InputController 右键点按 <4px 分类同量级） */
const DRAG_THRESHOLD_PX = 4;
/** 视野 overlay 重算与 GL 绘制共用的最小间隔（ms；上限 ~30Hz） */
const RENDER_MIN_INTERVAL_MS = 33;
/** 正交相机高度与裁剪（深度不参与遮挡：depthTest 全关，只需覆盖 y≈0 层） */
const CAMERA_HEIGHT = 1000;
const CAMERA_NEAR = 1;
const CAMERA_FAR = 2000;
/** 视野 overlay 朝向指示线长度（占视域短边的比例） */
const HEADING_LENGTH_RATIO = 0.14;

export interface MinimapRendererOptions {
  /** 事件总线（轮廓同步事件源；与主 Renderer 共享同一实例） */
  eventBus: EventBus;
  /** 场景数据唯一源（只读：getObject/getObjects/getLayer） */
  sceneManager: SceneManager;
  /** 画布宽（CSS 像素，缺省 200） */
  width?: number;
  /** 画布高（CSS 像素，缺省 140） */
  height?: number;
}

/** 一枚轮廓条目（节点 + 俯视包围盒，视域 fit 数据源） */
interface OutlineEntry {
  node: THREE.Mesh;
  bounds: Bounds2;
}

export class MinimapRenderer {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.OrthographicCamera;
  /** 标记批（全部 point/model 合并单 Points；测试探针兼用） */
  readonly markersMesh: THREE.Points;
  /** 视野 overlay 线（四边形闭合 + 朝向线；测试探针兼用） */
  readonly overlayLine: THREE.LineSegments;

  private readonly sceneManager: SceneManager;
  private readonly outlineGroup = new THREE.Group();
  private readonly markersMaterial: THREE.PointsMaterial;
  private readonly overlayGeometry: THREE.BufferGeometry;
  private readonly overlayMaterial: THREE.LineBasicMaterial;
  private readonly canvas: HTMLCanvasElement | null;
  private readonly renderer: THREE.WebGLRenderer | null;
  private readonly materials = new Map<SemanticType, THREE.MeshBasicMaterial>();
  private readonly outlines = new Map<ID, OutlineEntry>();
  private readonly markers = new Map<ID, { x: number; z: number; color: number }>();
  private readonly offs: Array<() => void> = [];
  private readonly widthPx: number;
  private readonly heightPx: number;
  private view: MinimapView;
  private boundsDirty = true;
  private needsRender = true;
  private lastRenderAt = 0;
  private lastOverlayAt = 0;
  private readonly overlayCamPos = new THREE.Vector3(Infinity, 0, 0);
  private readonly overlayCamQuat = new THREE.Quaternion();
  private navigate: ((x: number, z: number) => void) | null = null;
  private pointer: { id: number; startX: number; startY: number; moved: boolean } | null = null;
  private visible = true;
  private disposed = false;

  constructor(host: HTMLElement | null, options: MinimapRendererOptions) {
    this.sceneManager = options.sceneManager;
    this.widthPx = options.width ?? 200;
    this.heightPx = options.height ?? 140;
    this.view = fitMinimapView(null, this.widthPx, this.heightPx);

    // ── 标记批（单 draw call，屏幕恒定像素大小）──
    this.markersMaterial = new THREE.PointsMaterial({
      size: 5,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthTest: false,
    });
    this.markersMesh = new THREE.Points(emptyGeometry(), this.markersMaterial);
    this.markersMesh.renderOrder = MINIMAP_MARKER_RENDER_ORDER;
    this.markersMesh.frustumCulled = false; // 屏幕像素尺寸标记不做视锥剔除

    // ── 视野 overlay（四边形闭合 4 段 + 朝向 1 段，单几何合并）──
    this.overlayGeometry = new THREE.BufferGeometry();
    this.overlayGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(10 * 3), 3),
    );
    this.overlayMaterial = new THREE.LineBasicMaterial({
      color: 0xe8a33d, // --accent（#e8a33d）对应，§5.12 对照先例
      transparent: true,
      opacity: 0.9,
      depthTest: false,
    });
    this.overlayLine = new THREE.LineSegments(this.overlayGeometry, this.overlayMaterial);
    this.overlayLine.renderOrder = OVERLAY_RENDER_ORDER;
    this.overlayLine.frustumCulled = false;

    this.scene.add(this.outlineGroup);
    this.scene.add(this.markersMesh);
    this.scene.add(this.overlayLine);

    // ── 俯视正交相机（北=-Z 在上）──
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, CAMERA_NEAR, CAMERA_FAR);
    this.camera.up.set(0, 0, -1);
    this.applyView(this.view);

    // ── EventBus 订阅（轮廓同步）+ 构造时全量同步一次 ──
    const bus = options.eventBus;
    this.offs.push(
      bus.on('object:created', (p) => this.syncObject(p.objectId)),
      bus.on('object:updated', (p) => {
        if (this.affectsOutline(p.keys)) this.syncObject(p.objectId);
      }),
      bus.on('object:removed', (p) => {
        this.removeOutline(p.objectId);
        this.removeMarker(p.objectId);
      }),
      bus.on('layer:updated', (p) => this.syncLayer(p.layerId)),
      bus.on('scene:changed', (p) => {
        if (p.source === 'clear') this.rebuildAll();
      }),
    );
    this.rebuildAll();

    // ── canvas / WebGLRenderer / pointer（宿主为空或无 DOM → 无头形态）──
    let canvas: HTMLCanvasElement | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    if (host !== null && typeof document !== 'undefined') {
      canvas = document.createElement('canvas');
      canvas.className = 'ed-viewport__minimap';
      canvas.width = this.widthPx;
      canvas.height = this.heightPx;
      canvas.setAttribute('aria-label', '园区导航小地图：拖拽或点击平移相机视角');
      canvas.title = '小地图：拖拽平移视角 · 点击跳转';
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio ?? 1, 2));
        renderer.setSize(this.widthPx, this.heightPx, false);
      } catch (err) {
        console.warn('[MinimapRenderer] 小地图 WebGL 初始化失败，小地图不可用', err);
        renderer = null;
        canvas.remove();
        canvas = null;
      }
      if (canvas !== null) {
        host.appendChild(canvas);
        this.bindPointer(canvas);
      }
    }
    this.canvas = canvas;
    this.renderer = renderer;
  }

  /** 是否具备渲染资格（可见且未销毁；无头形态缺渲染器时 render() 内部再判并空转） */
  get isRenderable(): boolean {
    return this.visible && !this.disposed;
  }

  /** 显示开关（Viewport Options「小地图」项 → workspaceStore → 组合根驱动） */
  setVisible(visible: boolean): void {
    this.visible = visible;
    if (this.canvas !== null) this.canvas.style.display = visible ? '' : 'none';
  }

  /** 导航回调注入（app 组合根 → CameraController.panTargetTo；拖拽/点击平移相机目标） */
  setNavigate(cb: ((x: number, z: number) => void) | null): void {
    this.navigate = cb;
  }

  // ── 测试探针（装置级结构断言；生产代码不消费）──────────

  /** 当前轮廓面数量 */
  get outlineCount(): number {
    return this.outlineGroup.children.length;
  }

  /** 按序取轮廓面节点 */
  outlineAt(index: number): THREE.Object3D | undefined {
    return this.outlineGroup.children[index];
  }

  // ── 同步（EventBus → 派生轮廓）────────────────────────

  /** 影响轮廓的更新键（style 层与小地图无关） */
  private affectsOutline(keys: string[] | undefined): boolean {
    if (keys === undefined) return true;
    return keys.some(
      (key) =>
        key === 'transform' ||
        key === 'shape' ||
        key === 'semantic' ||
        key === 'visible' ||
        key === 'layerId',
    );
  }

  /** 全量重建（构造时 / scene:changed(clear)） */
  private rebuildAll(): void {
    for (const id of [...this.outlines.keys()]) this.removeOutline(id);
    for (const id of [...this.markers.keys()]) this.removeMarker(id);
    for (const obj of this.sceneManager.getObjects()) this.syncObject(obj.id);
  }

  /** 对象级同步：不可见移除；region 面/线 → 轮廓；point/model → 标记 */
  private syncObject(id: ID): void {
    if (this.disposed) return;
    const obj = this.sceneManager.getObject(id);
    if (!obj || !this.effectiveVisible(obj)) {
      const had = this.removeOutline(id) || this.removeMarker(id);
      if (had) this.markDirty();
      return;
    }
    const markerKind = markerKindOf(obj);
    if (markerKind !== null) {
      this.removeOutline(id);
      const color =
        markerKind === 'model'
          ? MODEL_MINIMAP_COLOR
          : SEMANTIC_MINIMAP_COLORS[(obj as RegionObject).semantic.type];
      this.markers.set(id, { x: obj.transform.position.x, z: obj.transform.position.z, color });
      this.rebuildMarkersGeometry();
      this.markDirty();
      return;
    }
    this.removeMarker(id);
    if (isRegionObject(obj)) {
      this.syncOutline(obj);
    } else {
      this.removeOutline(id);
    }
  }

  /** region 轮廓同步：面类 → 填充面；line → 带宽条带（几何整体重建，transform 烘入） */
  private syncOutline(obj: RegionObject): void {
    this.removeOutline(obj.id);
    const geometry = buildOutlineGeometry(obj);
    if (geometry === null) return;
    const semantic = obj.semantic.type;
    const mesh = new THREE.Mesh(geometry, this.materialFor(semantic));
    mesh.renderOrder = SEMANTIC_MINIMAP_ORDER[semantic];
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    this.outlineGroup.add(mesh);
    this.outlines.set(obj.id, {
      node: mesh,
      bounds: { minX: box.min.x, maxX: box.max.x, minZ: box.min.z, maxZ: box.max.z },
    });
    this.markDirty();
  }

  /** 移除一枚轮廓（释放几何；材质共享不释放）；返回是否存在 */
  private removeOutline(id: ID): boolean {
    const entry = this.outlines.get(id);
    if (!entry) return false;
    this.outlines.delete(id);
    this.outlineGroup.remove(entry.node);
    entry.node.geometry.dispose();
    this.markDirty();
    return true;
  }

  /** 移除一枚标记；返回是否存在 */
  private removeMarker(id: ID): boolean {
    if (!this.markers.delete(id)) return false;
    this.rebuildMarkersGeometry();
    this.markDirty();
    return true;
  }

  /** 标记批几何整体重建（数量小——point/model 类对象；单 draw call） */
  private rebuildMarkersGeometry(): void {
    const entries = [...this.markers.values()];
    const positions = new Float32Array(entries.length * 3);
    const colors = new Float32Array(entries.length * 3);
    const color = new THREE.Color();
    entries.forEach((entry, i) => {
      positions[i * 3] = entry.x;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = entry.z;
      color.setHex(entry.color);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const old = this.markersMesh.geometry;
    this.markersMesh.geometry = geometry;
    old.dispose();
  }

  /** 图层更新 → 成员逐个重同步（可见性联动） */
  private syncLayer(layerId: ID): void {
    if (this.disposed) return;
    const layer = this.sceneManager.getLayer(layerId);
    if (!layer) return;
    for (const id of layer.objectIds) this.syncObject(id);
  }

  /** 对象有效可见性（对象 visible ∧ 图层 visible；与主 Renderer 同语义） */
  private effectiveVisible(obj: SceneObject): boolean {
    const layer = obj.layerId !== null ? this.sceneManager.getLayer(obj.layerId) : undefined;
    return obj.visible && (!layer || layer.visible !== false);
  }

  /** 语义共享材质（惰性建；dispose 统一释放） */
  private materialFor(semantic: SemanticType): THREE.MeshBasicMaterial {
    let material = this.materials.get(semantic);
    if (!material) {
      material = new THREE.MeshBasicMaterial({
        color: SEMANTIC_MINIMAP_COLORS[semantic],
        transparent: true,
        opacity: 0.78,
        depthTest: false,
      });
      this.materials.set(semantic, material);
    }
    return material;
  }

  /** 轮廓/标记变化：视域待重 fit + 待重绘 */
  private markDirty(): void {
    this.boundsDirty = true;
    this.needsRender = true;
  }

  // ── 视域 fit（轮廓包围盒 → 正交相机）─────────────────

  /** 重算场景包围盒 → fit 视域 → 相机重置（变化才触发重绘） */
  private refreshView(): void {
    this.boundsDirty = false;
    const next = fitMinimapView(this.computeBounds(), this.widthPx, this.heightPx);
    const changed =
      next.centerX !== this.view.centerX ||
      next.centerZ !== this.view.centerZ ||
      next.worldPerPixel !== this.view.worldPerPixel;
    this.view = next;
    if (changed) {
      this.applyView(next);
      this.needsRender = true;
    }
  }

  /** 全部轮廓 + 标记的俯视包围盒（空场景返回 null → 默认视域） */
  private computeBounds(): Bounds2 | null {
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const entry of this.outlines.values()) {
      minX = Math.min(minX, entry.bounds.minX);
      maxX = Math.max(maxX, entry.bounds.maxX);
      minZ = Math.min(minZ, entry.bounds.minZ);
      maxZ = Math.max(maxZ, entry.bounds.maxZ);
    }
    for (const marker of this.markers.values()) {
      minX = Math.min(minX, marker.x);
      maxX = Math.max(maxX, marker.x);
      minZ = Math.min(minZ, marker.z);
      maxZ = Math.max(maxZ, marker.z);
    }
    if (minX > maxX || minZ > maxZ) return null;
    return { minX, maxX, minZ, maxZ };
  }

  /** 视域 → 正交相机参数（北=-Z 在上：up=(0,0,-1)） */
  private applyView(view: MinimapView): void {
    const halfW = (view.worldPerPixel * view.widthPx) / 2;
    const halfH = (view.worldPerPixel * view.heightPx) / 2;
    this.camera.left = -halfW;
    this.camera.right = halfW;
    this.camera.top = halfH;
    this.camera.bottom = -halfH;
    this.camera.position.set(view.centerX, CAMERA_HEIGHT, view.centerZ);
    this.camera.lookAt(view.centerX, 0, view.centerZ);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld(true);
  }

  // ── 帧驱动（Renderer.renderFrame 同款位置调用）────────

  /**
   * 帧驱动：视域重 fit（脏时）→ 主相机位姿变化检测（变化才重算 overlay，≥33ms 节流）
   * → needsRender 时绘制（≥33ms 节流）。隐藏时尽早返回零开销；无头形态 GL 空转。
   */
  render(mainCamera: THREE.Camera): void {
    if (!this.isRenderable) return;
    if (this.boundsDirty) this.refreshView();
    const now = nowMs();
    if (this.overlayStale(mainCamera) && now - this.lastOverlayAt >= RENDER_MIN_INTERVAL_MS) {
      this.updateOverlay(mainCamera);
      this.lastOverlayAt = now;
    }
    if (!this.needsRender) return;
    if (now - this.lastRenderAt < RENDER_MIN_INTERVAL_MS) return;
    this.lastRenderAt = now;
    this.needsRender = false;
    this.renderer?.render(this.scene, this.camera);
  }

  /** 主相机位姿是否较上次 overlay 更新有变化 */
  private overlayStale(mainCamera: THREE.Camera): boolean {
    return (
      !this.overlayCamPos.equals(mainCamera.position) ||
      !this.overlayCamQuat.equals(mainCamera.quaternion)
    );
  }

  /** 视野 overlay 重算（纯函数 viewFootprint；写回单几何 10 顶点） */
  private updateOverlay(mainCamera: THREE.Camera): void {
    this.overlayCamPos.copy(mainCamera.position);
    this.overlayCamQuat.copy(mainCamera.quaternion);

    const forward = _forward.set(0, 0, -1).applyQuaternion(mainCamera.quaternion);
    const up = _up.set(0, 1, 0).applyQuaternion(mainCamera.quaternion);
    const perspective = mainCamera as THREE.PerspectiveCamera;
    const ortho = mainCamera as THREE.OrthographicCamera;
    const frustum: FrustumInput =
      mainCamera.type === 'OrthographicCamera'
        ? {
            kind: 'ortho',
            halfWidth: (ortho.right - ortho.left) / 2,
            halfHeight: (ortho.top - ortho.bottom) / 2,
          }
        : {
            kind: 'perspective',
            fovY: (perspective.fov * Math.PI) / 180,
            aspect: perspective.aspect,
          };
    const footprint = computeViewFootprint({
      position: mainCamera.position,
      forward,
      up,
      frustum,
      far: perspective.far, // Perspective/Orthographic 相机均有 far（Camera 基类无此字段）
    });

    const quad = footprint.quad;
    // 四边形闭合 4 段（q0→q1→q2→q3→q0）
    const segments: Array<[number, number, number, number]> = [
      [quad[0].x, quad[0].y, quad[1].x, quad[1].y],
      [quad[1].x, quad[1].y, quad[2].x, quad[2].y],
      [quad[2].x, quad[2].y, quad[3].x, quad[3].y],
      [quad[3].x, quad[3].y, quad[0].x, quad[0].y],
    ];
    // 朝向线：相机地面投影 → 沿 heading 延伸（视域短边比例长度）
    const span = Math.min(
      this.view.worldPerPixel * this.view.widthPx,
      this.view.worldPerPixel * this.view.heightPx,
    );
    const len = HEADING_LENGTH_RATIO * span;
    segments.push([
      mainCamera.position.x,
      mainCamera.position.z,
      mainCamera.position.x + footprint.heading.x * len,
      mainCamera.position.z + footprint.heading.y * len,
    ]);
    const position = this.overlayGeometry.getAttribute('position') as THREE.BufferAttribute;
    segments.forEach(([x0, z0, x1, z1], i) => {
      position.setXYZ(i * 2, x0, 1, z0);
      position.setXYZ(i * 2 + 1, x1, 1, z1);
    });
    position.needsUpdate = true;
    this.overlayGeometry.computeBoundingSphere();
    this.needsRender = true;
  }

  // ── 交互（canvas 自有 pointer 事件；仅浏览器形态）──────

  private bindPointer(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointercancel', this.onPointerCancel);
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (e.button !== 0 || this.pointer !== null) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    this.pointer = { id: e.pointerId, startX: e.offsetX, startY: e.offsetY, moved: false };
  };

  private onPointerMove = (e: PointerEvent): void => {
    const p = this.pointer;
    if (!p || e.pointerId !== p.id) return;
    if (!p.moved && Math.hypot(e.offsetX - p.startX, e.offsetY - p.startY) > DRAG_THRESHOLD_PX) {
      p.moved = true;
    }
    if (p.moved) this.navigateAt(e.offsetX, e.offsetY);
  };

  private onPointerUp = (e: PointerEvent): void => {
    const p = this.pointer;
    if (!p || e.pointerId !== p.id) return;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    this.pointer = null;
    if (!p.moved) this.navigateAt(e.offsetX, e.offsetY); // 单击跳转（无拖拽阈值内）
  };

  private onPointerCancel = (): void => {
    this.pointer = null;
  };

  /** 指针画布坐标 → 世界地面点 → 导航回调（panTargetTo 指针世界坐标） */
  private navigateAt(px: number, py: number): void {
    if (this.boundsDirty) this.refreshView();
    const world = minimapPixelToWorld(this.view, px, py);
    this.navigate?.(world.x, world.y);
  }

  // ── 生命周期 ────────────────────────────────────────────

  /** 释放全部自有资源并移除 canvas（幂等；不触碰主渲染器，无 forceContextLoss） */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const off of this.offs) off();
    this.offs.length = 0;
    if (this.canvas !== null) {
      this.canvas.removeEventListener('pointerdown', this.onPointerDown);
      this.canvas.removeEventListener('pointermove', this.onPointerMove);
      this.canvas.removeEventListener('pointerup', this.onPointerUp);
      this.canvas.removeEventListener('pointercancel', this.onPointerCancel);
    }
    for (const entry of this.outlines.values()) entry.node.geometry.dispose();
    this.outlines.clear();
    this.outlineGroup.clear();
    this.markers.clear();
    this.markersMesh.geometry.dispose();
    this.markersMaterial.dispose();
    this.overlayGeometry.dispose();
    this.overlayMaterial.dispose();
    this.scene.clear();
    for (const material of this.materials.values()) material.dispose();
    this.materials.clear();
    this.renderer?.dispose(); // 独立小上下文：只释放本实例 GL 对象
    this.canvas?.remove();
  }
}

// ── 模块级工具 ─────────────────────────────────────────────

/** 空几何（标记批初始占位；0 顶点不产生 draw call） */
function emptyGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(0), 3));
  return geometry;
}

/** 标记类对象判定：point 形状 region / model 对象（返回 null = 非标记） */
function markerKindOf(obj: SceneObject): 'point' | 'model' | null {
  if (isRegionObject(obj)) return obj.shape.type === 'point' ? 'point' : null;
  if (typeof (obj as ModelObject).asset?.assetId === 'string') return 'model';
  return null;
}

/** region 轮廓几何（世界坐标烘入 transform；退化形状返回 null） */
function buildOutlineGeometry(obj: RegionObject): THREE.BufferGeometry | null {
  let geometry: THREE.BufferGeometry | null = null;
  const points = obj.shape.points;
  if (obj.shape.type === 'line') {
    const ribbon = centerlineRibbonGeometry(points, readLineWidth(obj), 0);
    if ((ribbon.getAttribute('position')?.count ?? 0) > 0) geometry = ribbon;
    else ribbon.dispose(); // 退化折线（<2 有效点）防御兜底
  } else if (points.length >= 3) {
    // 面类五形状：点列已是展开顶点（参数化形状由绘制工具写入 points）
    geometry = polygonSurfaceGeometry(points, 0);
  }
  if (geometry === null) return null;
  const t = obj.transform;
  _matrix.compose(
    _vec3.set(t.position.x, t.position.y, t.position.z),
    _quat.setFromEuler(_euler.set(t.rotation.x, t.rotation.y, t.rotation.z)),
    _scale.set(t.scale.x, t.scale.y, t.scale.z),
  );
  geometry.applyMatrix4(_matrix);
  return geometry;
}

/** line 带宽：semantic.properties.width（有限正数），否则缺省（GeometryBuilder 同源规则） */
function readLineWidth(obj: RegionObject): number {
  const width = obj.semantic.properties.width;
  return typeof width === 'number' && Number.isFinite(width) && width > 0 ? width : DEFAULT_LINE_WIDTH;
}

/** 单调时钟（节流计时；node 无 performance.now 时回退 Date.now） */
function nowMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

// 模块级暂存（单线程渲染运行时；three 自身同款惯例）
const _forward = new THREE.Vector3();
const _up = new THREE.Vector3();
const _matrix = new THREE.Matrix4();
const _vec3 = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scale = new THREE.Vector3();
