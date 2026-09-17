/**
 * runtime/services/VertexEditImpl —— 顶点编辑句柄层（阶段 6 T6.8，依赖倒置实现端）。
 *
 * 职责：用自建句柄网格实现「编辑会话 → 拖拽预览 → 一次性 before/after」（模式沿
 * GizmoImpl T2.4 先例）：
 *  1. beginSession({objectId, points, closed})：编辑对象顶点/边中点渲染为可拖拽
 *     handle（顶点 = 琥珀球、边中点 = 小八面体；AUX_LAYER 划层——内容拾取
 *     （layer 0）不可见，拾取隔离的结构保障；句柄网格不入内容组/RuntimeObjectMap）；
 *  2. 拖拽中（pointermove）：射线 → 顶点平面投影 → 吸附管线（组合根注入：G 网格吸附
 *     与 Shift 正交复用 editor/tools/draw/snap 纯函数）→ 世界↔局部换算（wrapper 逆矩阵）
 *     → 直写工作点列 → 节流 flush（rAF 合帧：句柄跟随 + previewShape 几何重绑 + 读数
 *     draw:status 推送）；期间零事件（除读数通道）零命令（预览隔离）；
 *  3. 手势结束（pointerup）：一次性 onDragEnd 回调 {objectId, before, after}——
 *     拖动 / Alt+点击边中点插入 / 右键点按（Delete 转发）删除共用此通道，由 editor
 *     层 VertexEditTool 转 ChangeShapeCommand（分域契约 §C 通路）；
 *  4. 删除约束（≥3 面 / ≥2 线 / 点恒不可删）在本层拦截，经 draw:status error 提示；
 *  5. endSession：句柄清理 + restoreShape 按场景数据权威恢复几何（零修改退出回到
 *     原参数化形状渲染）+ 状态栏空载荷复位。
 * 边界：只读场景数据（getRegion 由 Renderer 提供）；不发命令不进历史；右键点按句柄
 *      stopImmediatePropagation 阻断 app 层上下文菜单路径（监听注册序先于 InputController）；
 *      接口定义在 editor/services/ports（VertexEditPort + VertexEditSessionPort），分层
 *      DAG 禁止 runtime→editor 导入，故不 implements 而以结构化类型保持签名一致。
 */
import type { ID, Vec2 } from '../../core/types';
import { dist, polygonArea, polylineLength } from '../../core/math';
import type { EventBus } from '../../core/events/EventBus';
import type { DrawStatusPayload } from '../../core/events/events';
import type { RegionObject } from '../../domain/regions';
import { canRemoveVertex, insertVertexAt, removeVertexAt } from '../../domain/regions';
import type { EditableShapeType } from '../../domain/regions';
import * as THREE from 'three';
import { AUX_LAYER } from '../RenderModeState';

/** 右键点按判定的位移阈值（CSS 像素；沿 app/input classifyRightButton 语义） */
const RIGHT_TAP_MAX_DISTANCE_PX = 4;

/** 句柄世界尺寸（米）：顶点球 / 边中点八面体（基础几何；屏幕尺寸由 frame() 缩放） */
const VERTEX_HANDLE_RADIUS = 0.45;
const MID_HANDLE_RADIUS = 0.26;
/** 句柄目标屏幕直径（CSS 像素；frame() 按相机距离自适应缩放至该值） */
const VERTEX_HANDLE_PX = 13;
const MID_HANDLE_PX = 9;

/** 句柄配色（DESIGN.md 视觉语言：琥珀 = 「当前正在被操作的东西」） */
const COLOR_VERTEX = 0xe8a33d; // --accent
const COLOR_VERTEX_HOVER = 0xf2b654; // --accent-hover
const COLOR_VERTEX_DRAG = 0xffe3ad;
const COLOR_MID = 0xe8a33d;
const COLOR_MID_HOVER = 0xf2b654;

/**
 * 吸附管线（组合根注入；runtime 不导入 editor 层的 DAG 约束下的复用形态）：
 * 组合根闭包 editor/tools/draw/snap 的 gridSnap/orthoLock/angleLock 纯函数注入本层，
 * 同一函数服务绘制与顶点编辑两条链路（单一真相源；T8.1 增 A 键 45° 锁定与
 * Ctrl 临时反转吸附总状态——modifiers.ctrlKey 由拖拽指针事件透传）。
 */
export interface VertexSnapPipeline {
  /** 原始世界落点 → 吸附/锁定后落点（anchor = 被拖顶点按下时世界坐标） */
  apply(
    raw: Vec2,
    anchor: Vec2,
    modifiers: { shiftKey: boolean; ctrlKey: boolean },
  ): Vec2;
}

/** VertexEditImpl 装配依赖（Renderer 提供） */
export interface VertexEditDeps {
  camera: THREE.Camera;
  /** 句柄交互监听目标（与 OrbitControls/InputController 同一 canvas） */
  domElement: HTMLElement;
  /** 句柄网格挂载场景（渲染树；独立于内容组） */
  scene: THREE.Object3D;
  /** 拖拽期间需要停用的相机轨道控制（可空） */
  orbit?: { enabled: boolean } | null;
  /** 事件总线（读数 draw:status 推送；runtime→UI 合法通道） */
  eventBus: EventBus;
  /** 吸附管线（组合根注入；缺省不吸附） */
  snap?: VertexSnapPipeline;
  /** 业务 id → 渲染根与场景数据（世界↔局部换算与 baseHeight/semantic 读取；不存在返回 null） */
  getRegion(id: ID): { root: THREE.Object3D; region: RegionObject } | null;
  /** 拖拽/插删中的工作点列 → 几何预览重绑（Renderer 分派 RegionRenderer.applyShapePreview） */
  previewShape(id: ID, working: { type: EditableShapeType; points: Vec2[]; closed: boolean }): void;
  /** 会话结束 → 按场景数据权威恢复几何（Renderer 分派 update(id, ['shape'])） */
  restoreShape(id: ID): void;
  /** 节流调度（缺省 requestAnimationFrame；无 rAF 环境同步执行——node 测试可注入手动队列） */
  schedule?(fn: () => void): void;
}

/** 顶点手势结束信息（结构与 editor VertexEditPort.onDragEnd 载荷一致） */
export interface VertexGestureInfo {
  objectId: ID;
  before: Vec2[];
  after: Vec2[];
}

/** 进行中的顶点拖拽 */
interface DragState {
  index: number;
  before: Vec2[];
  /** 拖拽投影平面（y = 顶点世界高度） */
  plane: THREE.Plane;
  /** 被拖顶点按下时世界坐标（吸附/正交参照） */
  anchorWorld: Vec2;
  handle: THREE.Mesh | null;
}

/** 右键点按会话（down 记起点与命中句柄 → up 分类） */
interface RightPressState {
  x: number;
  y: number;
  vertexIndex: number | null;
}

interface EditSession {
  objectId: ID;
  points: Vec2[];
  closed: boolean;
}

export class VertexEditImpl {
  readonly deps: VertexEditDeps;
  /** 句柄网格根（独立组，不入内容组——不可被业务拾取命中） */
  readonly handlesRoot = new THREE.Group();

  /** 常驻共享资源（dispose 释放；句柄重建只增删 Mesh 不复制资源） */
  private readonly vertexGeometry = new THREE.SphereGeometry(VERTEX_HANDLE_RADIUS, 14, 10);
  private readonly midGeometry = new THREE.OctahedronGeometry(MID_HANDLE_RADIUS);
  private readonly vertexMaterial = new THREE.MeshBasicMaterial({
    color: COLOR_VERTEX,
    transparent: true,
    opacity: 0.95,
    depthTest: false,
  });
  private readonly vertexHoverMaterial = new THREE.MeshBasicMaterial({
    color: COLOR_VERTEX_HOVER,
    transparent: true,
    depthTest: false,
  });
  private readonly vertexDragMaterial = new THREE.MeshBasicMaterial({
    color: COLOR_VERTEX_DRAG,
    transparent: true,
    depthTest: false,
  });
  private readonly midMaterial = new THREE.MeshBasicMaterial({
    color: COLOR_MID,
    transparent: true,
    opacity: 0.55,
    depthTest: false,
  });
  private readonly midHoverMaterial = new THREE.MeshBasicMaterial({
    color: COLOR_MID_HOVER,
    transparent: true,
    opacity: 0.9,
    depthTest: false,
  });

  private session: EditSession | null = null;
  private drag: DragState | null = null;
  private rightPress: RightPressState | null = null;
  /** 悬停句柄（Delete 转发删除与高亮反馈的目标） */
  private hoveredVertex = -1;
  private hoveredMid = -1;
  private dragEndCb: ((info: VertexGestureInfo) => void) | null = null;
  /** 节流合帧（rAF 期间多次 pointermove 只 flush 一次） */
  private flushScheduled = false;
  private readonly raycaster = new THREE.Raycaster();
  private readonly groundVec = new THREE.Vector3();
  private readonly localVec = new THREE.Vector3();
  private disposed = false;

  constructor(deps: VertexEditDeps) {
    this.deps = deps;
    this.handlesRoot.name = '__vertex_edit__';
    this.handlesRoot.traverse((node) => node.layers.set(AUX_LAYER));
    this.handlesRoot.layers.set(AUX_LAYER);
    deps.scene.add(this.handlesRoot);
    this.raycaster.layers.set(AUX_LAYER); // 仅命中句柄（拾取隔离）

    const el = deps.domElement;
    el.addEventListener('pointerdown', this.onPointerDown);
    el.addEventListener('pointermove', this.onPointerMove);
    el.addEventListener('pointerup', this.onPointerUp);
  }

  // ── Port 签名（VertexEditPort + VertexEditSessionPort，结构化类型一致） ──

  onDragEnd(cb: (info: VertexGestureInfo) => void): void {
    this.dragEndCb = cb;
  }

  beginSession(info: { objectId: ID; points: Vec2[]; closed: boolean }): void {
    this.endSession(); // 幂等：先清既有会话
    this.session = {
      objectId: info.objectId,
      points: info.points.map((p) => ({ x: p.x, y: p.y })),
      closed: info.closed,
    };
    this.relayoutHandles();
    this.emitStatus();
  }

  setPoints(points: Vec2[]): void {
    if (!this.session) return;
    this.session.points = points.map((p) => ({ x: p.x, y: p.y }));
    this.relayoutHandles();
  }

  /** 删除当前悬停顶点（Delete/Backspace 转发；违例拦截提示；无悬停返回 false） */
  requestVertexRemoval(): boolean {
    if (this.hoveredVertex < 0 || !this.session) return false;
    return this.removeVertexAt(this.hoveredVertex);
  }

  endSession(): void {
    if (!this.session) return;
    const objectId = this.session.objectId;
    this.abortDrag();
    this.session = null;
    this.hoveredVertex = -1;
    this.hoveredMid = -1;
    this.clearHandles();
    this.deps.restoreShape(objectId); // 按场景数据权威恢复（零修改退出回到原参数化形状）
    this.deps.eventBus.emit('draw:status', {}); // 状态栏复位（空载荷语义沿绘制工具）
  }

  /** 释放（Renderer.dispose 调用） */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    const el = this.deps.domElement;
    el.removeEventListener('pointerdown', this.onPointerDown);
    el.removeEventListener('pointermove', this.onPointerMove);
    el.removeEventListener('pointerup', this.onPointerUp);
    this.abortDrag();
    this.session = null;
    this.clearHandles();
    this.vertexGeometry.dispose();
    this.midGeometry.dispose();
    this.vertexMaterial.dispose();
    this.vertexHoverMaterial.dispose();
    this.vertexDragMaterial.dispose();
    this.midMaterial.dispose();
    this.midHoverMaterial.dispose();
    this.handlesRoot.removeFromParent();
  }

  /**
   * 渲染循环回调（Renderer.renderFrame 每帧调用）：句柄屏幕恒定尺寸——世界空间
   * 几何按相机距离自适应缩放（远大近小），保证任意观察距离下可点可辨（沿
   * TransformControls 屏幕恒定手柄语义）。无会话时 O(1) 早退，常调零风险。
   */
  frame(): void {
    const session = this.session;
    if (!session || this.disposed) return;
    const camera = this.deps.camera;
    const rect = this.deps.domElement.getBoundingClientRect();
    const viewH = rect.height > 0 ? rect.height : 1;
    // 每像素世界高度（单位相机距离）：透视 = 2·tan(fov/2)/画布高；正交 = (top-bottom)/高
    const worldPerPx =
      camera instanceof THREE.PerspectiveCamera
        ? (2 * Math.tan((camera.fov * Math.PI) / 360)) / viewH
        : Math.abs((camera as THREE.OrthographicCamera).top - (camera as THREE.OrthographicCamera).bottom) / viewH;
    const camPos = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
    const world = new THREE.Vector3();
    for (const handle of this.handlesRoot.children) {
      handle.getWorldPosition(world);
      const dist = Math.max(world.distanceTo(camPos), 0.001);
      const isVertex = (handle.userData as { kind?: string }).kind === 'vertex';
      const targetPx = isVertex ? VERTEX_HANDLE_PX : MID_HANDLE_PX;
      const radius = isVertex ? VERTEX_HANDLE_RADIUS : MID_HANDLE_RADIUS;
      // 屏幕直径 targetPx → 世界直径 = targetPx · worldPerPx · dist → scale
      handle.scale.setScalar((targetPx * worldPerPx * dist) / (2 * radius));
    }
  }

  // ── 内部：事件处理 ────────────────────────────────────────

  private onPointerDown = (e: Event): void => {
    if (this.disposed || !this.session) return;
    const ev = e as PointerEvent;
    const hit = this.raycastHandles(ev.clientX, ev.clientY);
    if (ev.button === 2) {
      // 右键：点按命中句柄 → 阻断 app 层上下文菜单路径（记录待 up 分类删除）；
      // 未命中（右拖旋转视角）不拦截
      this.rightPress = { x: ev.clientX, y: ev.clientY, vertexIndex: null };
      if (hit?.kind === 'vertex') {
        this.rightPress.vertexIndex = hit.index;
        ev.stopImmediatePropagation?.();
      }
      return;
    }
    if (ev.button !== 0) return;

    // Alt+点击边中点 → 插入顶点（边中点句柄即插入指示）
    if (ev.altKey && hit?.kind === 'mid') {
      this.insertMidpoint(hit.index);
      return;
    }

    // 左键按下顶点句柄 → 开始拖拽
    if (hit?.kind === 'vertex') {
      const entry = this.deps.getRegion(this.session.objectId);
      if (!entry) return;
      const handle = this.vertexHandle(hit.index);
      const world = handle
        ? handle.getWorldPosition(new THREE.Vector3())
        : entry.root.localToWorld(new THREE.Vector3(this.session.points[hit.index]!.x, entry.region.shape.baseHeight, this.session.points[hit.index]!.y));
      this.drag = {
        index: hit.index,
        before: this.session.points.map((p) => ({ x: p.x, y: p.y })),
        plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -world.y),
        anchorWorld: { x: world.x, y: world.z },
        handle,
      };
      if (this.deps.orbit) this.deps.orbit.enabled = false;
      this.setHandleMaterial(hit.index, 'vertex', 'drag');
    }
  };

  private onPointerMove = (e: Event): void => {
    if (this.disposed || !this.session) return;
    const ev = e as PointerEvent;
    if (this.drag) {
      this.updateDrag(ev);
      return;
    }
    this.updateHover(ev.clientX, ev.clientY);
  };

  private onPointerUp = (e: Event): void => {
    if (this.disposed || !this.session) return;
    const ev = e as PointerEvent;

    if (ev.button === 2) {
      // 右键抬起：点按（位移 < 阈值）且按下时命中顶点句柄 → 删除
      const press = this.rightPress;
      this.rightPress = null;
      if (!press || press.vertexIndex === null) return;
      const moved = Math.hypot(ev.clientX - press.x, ev.clientY - press.y);
      if (moved >= RIGHT_TAP_MAX_DISTANCE_PX) return; // 拖拽（旋转视角）
      this.removeVertexAt(press.vertexIndex);
      return;
    }
    if (ev.button !== 0) return;

    // 左键抬起：结束拖拽 → 一次性 before/after（零位移由 editor 侧跳过）
    const drag = this.drag;
    if (!drag) return;
    this.flushPending(); // 未合帧的最终位置先落地（this.drag 仍有效；句柄/预览与回调一致）
    this.drag = null;
    this.flushScheduled = false;
    if (this.deps.orbit) this.deps.orbit.enabled = true;
    this.setHandleMaterial(drag.index, 'vertex', this.hoveredVertex === drag.index ? 'hover' : 'normal');
    this.dragEndCb?.({
      objectId: this.session.objectId,
      before: drag.before,
      after: this.session.points.map((p) => ({ x: p.x, y: p.y })),
    });
  };

  // ── 内部：手势操作 ────────────────────────────────────────

  /** 拖拽中：射线 → 顶点平面 → 吸附管线 → 世界↔局部 → 工作点列 + 节流 flush */
  private updateDrag(ev: PointerEvent): void {
    const drag = this.drag;
    const session = this.session;
    if (!drag || !session) return;
    const ndc = this.toNDC(ev.clientX, ev.clientY);
    if (!ndc) return;
    this.raycaster.setFromCamera(ndc, this.deps.camera);
    const world = this.raycaster.ray.intersectPlane(drag.plane, this.groundVec);
    if (!world) return; // 视线背离平面：保留上次位置
    let p: Vec2 = { x: world.x, y: world.z };
    if (this.deps.snap) {
      // ctrlKey/metaKey → ctrl 语义（与 InputController.toPointerInfo 归一一致）：
      // 管线内做总开关临时反转（T8.1 R4）
      p = this.deps.snap.apply(p, drag.anchorWorld, {
        shiftKey: ev.shiftKey,
        ctrlKey: ev.ctrlKey || ev.metaKey,
      });
    }
    const entry = this.deps.getRegion(session.objectId);
    if (!entry) return;
    const local = entry.root.worldToLocal(this.localVec.set(p.x, -drag.plane.constant, p.y));
    session.points[drag.index] = { x: local.x, y: local.z };
    this.scheduleFlush();
  }

  /** Alt+点击边中点：插入中点顶点 → 句柄重排 + 预览 + 一次性回调 */
  private insertMidpoint(edgeIndex: number): void {
    const session = this.session;
    if (!session) return;
    const handle = this.midHandle(edgeIndex);
    const midLocal = handle ? ({ ...handle.userData.mid } as Vec2) : null;
    if (!midLocal) return;
    const before = session.points.map((p) => ({ x: p.x, y: p.y }));
    session.points = insertVertexAt(session.points, edgeIndex, midLocal);
    this.relayoutHandles();
    this.deps.previewShape(session.objectId, this.workingShape());
    this.emitStatus();
    this.dragEndCb?.({
      objectId: session.objectId,
      before,
      after: session.points.map((p) => ({ x: p.x, y: p.y })),
    });
  }

  /** 删除顶点：约束拦截（≥3 面 / ≥2 线 / 点恒不可删）→ draw:status error；成功 → 一次性回调 */
  private removeVertexAt(index: number): boolean {
    const session = this.session;
    if (!session) return false;
    const kind = this.sessionShapeType();
    if (!canRemoveVertex(kind, session.points.length)) {
      const hint =
        kind === 'polygon'
          ? '面形状至少保留 3 个顶点'
          : kind === 'line'
            ? '线形状至少保留 2 个顶点'
            : '点形状不可删除顶点';
      this.deps.eventBus.emit('draw:status', { error: hint });
      return false;
    }
    const before = session.points.map((p) => ({ x: p.x, y: p.y }));
    session.points = removeVertexAt(session.points, index);
    this.hoveredVertex = -1;
    this.relayoutHandles();
    this.deps.previewShape(session.objectId, this.workingShape());
    this.emitStatus();
    this.dragEndCb?.({
      objectId: session.objectId,
      before,
      after: session.points.map((p) => ({ x: p.x, y: p.y })),
    });
    return true;
  }

  /** 拖拽中断（endSession/dispose）：恢复 orbit、句柄材质复位（工作点列由恢复路径回滚） */
  private abortDrag(): void {
    if (!this.drag) return;
    const index = this.drag.index;
    this.drag = null;
    this.flushScheduled = false;
    if (this.deps.orbit) this.deps.orbit.enabled = true;
    this.setHandleMaterial(index, 'vertex', 'normal');
  }

  // ── 内部：句柄网格 ────────────────────────────────────────

  /** 全量重建句柄网格（beginSession/setPoints/插删后；共享几何/材质零复制） */
  private relayoutHandles(): void {
    this.clearHandles();
    const session = this.session;
    if (!session) return;
    const entry = this.deps.getRegion(session.objectId);
    if (!entry) return;
    entry.root.updateMatrixWorld(true);
    const y = entry.region.shape.baseHeight;
    for (let i = 0; i < session.points.length; i++) {
      const p = session.points[i]!;
      const handle = new THREE.Mesh(this.vertexGeometry, this.vertexMaterial);
      handle.userData = { kind: 'vertex', index: i, local: { x: p.x, y: p.y } };
      handle.layers.set(AUX_LAYER);
      handle.renderOrder = 1000;
      handle.position.copy(entry.root.localToWorld(new THREE.Vector3(p.x, y, p.y)));
      this.handlesRoot.add(handle);
    }
    const edges = session.closed ? session.points.length : session.points.length - 1;
    for (let i = 0; i < edges; i++) {
      const a = session.points[i]!;
      const b = session.points[(i + 1) % session.points.length]!;
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const handle = new THREE.Mesh(this.midGeometry, this.midMaterial);
      handle.userData = { kind: 'mid', index: i, mid };
      handle.layers.set(AUX_LAYER);
      handle.renderOrder = 999;
      handle.position.copy(entry.root.localToWorld(new THREE.Vector3(mid.x, y, mid.y)));
      this.handlesRoot.add(handle);
    }
    this.frame(); // 挂载即按当前相机定尺寸（不等下一帧，消除 3px 空窗）
  }

  /** 拖拽 flush：仅移动被拖句柄（其余不动；句柄缺失时全量重排兜底） */
  private layoutDraggedHandle(): void {
    const drag = this.drag;
    const session = this.session;
    if (!drag || !session) return;
    const entry = this.deps.getRegion(session.objectId);
    if (!entry) return;
    if (!drag.handle) {
      this.relayoutHandles();
      return;
    }
    const p = session.points[drag.index]!;
    drag.handle.position.copy(
      entry.root.localToWorld(new THREE.Vector3(p.x, entry.region.shape.baseHeight, p.y)),
    );
  }

  private clearHandles(): void {
    this.handlesRoot.clear();
  }

  private vertexHandle(index: number): THREE.Mesh | null {
    return (
      (this.handlesRoot.children.find(
        (c) => (c.userData as { kind?: string }).kind === 'vertex' && (c.userData as { index?: number }).index === index,
      ) as THREE.Mesh | undefined) ?? null
    );
  }

  private midHandle(edgeIndex: number): THREE.Mesh | null {
    return (
      (this.handlesRoot.children.find(
        (c) => (c.userData as { kind?: string }).kind === 'mid' && (c.userData as { index?: number }).index === edgeIndex,
      ) as THREE.Mesh | undefined) ?? null
    );
  }

  /** 句柄材质态切换（normal / hover / drag） */
  private setHandleMaterial(index: number, kind: 'vertex' | 'mid', state: 'normal' | 'hover' | 'drag'): void {
    const handle = kind === 'vertex' ? this.vertexHandle(index) : this.midHandle(index);
    if (!handle) return;
    handle.material =
      kind === 'vertex'
        ? state === 'drag'
          ? this.vertexDragMaterial
          : state === 'hover'
            ? this.vertexHoverMaterial
            : this.vertexMaterial
        : state === 'hover'
          ? this.midHoverMaterial
          : this.midMaterial;
  }

  /** 悬停高亮 + 光标（Delete 转发删除的目标） */
  private updateHover(clientX: number, clientY: number): void {
    const hit = this.raycastHandles(clientX, clientY);
    const nextVertex = hit?.kind === 'vertex' ? hit.index : -1;
    const nextMid = hit?.kind === 'mid' ? hit.index : -1;
    if (nextVertex !== this.hoveredVertex) {
      if (this.hoveredVertex >= 0) this.setHandleMaterial(this.hoveredVertex, 'vertex', 'normal');
      if (nextVertex >= 0) this.setHandleMaterial(nextVertex, 'vertex', 'hover');
      this.hoveredVertex = nextVertex;
    }
    if (nextMid !== this.hoveredMid) {
      if (this.hoveredMid >= 0) this.setHandleMaterial(this.hoveredMid, 'mid', 'normal');
      if (nextMid >= 0) this.setHandleMaterial(nextMid, 'mid', 'hover');
      this.hoveredMid = nextMid;
    }
    if (this.deps.domElement.style) {
      this.deps.domElement.style.cursor = nextVertex >= 0 ? 'move' : nextMid >= 0 ? 'copy' : '';
    }
  }

  /** 句柄射线命中（仅句柄网格——对象面片在句柄后方不影响，拾取优先级保障） */
  private raycastHandles(clientX: number, clientY: number): { kind: 'vertex' | 'mid'; index: number } | null {
    if (this.handlesRoot.children.length === 0) return null;
    const ndc = this.toNDC(clientX, clientY);
    if (!ndc) return null;
    this.raycaster.setFromCamera(ndc, this.deps.camera);
    const hits = this.raycaster.intersectObjects(this.handlesRoot.children, false);
    const first = hits[0];
    if (!first) return null;
    const data = first.object.userData as { kind?: string; index?: number };
    if (data?.kind !== 'vertex' && data?.kind !== 'mid') return null;
    return { kind: data.kind, index: data.index ?? -1 };
  }

  // ── 内部：节流 / 读数 / 杂项 ──────────────────────────────

  /** rAF 合帧：多次 pointermove 只 flush 一次（句柄跟随 + 预览重建 + 读数） */
  private scheduleFlush(): void {
    if (this.flushScheduled) return;
    this.flushScheduled = true;
    this.schedule(() => {
      this.flushScheduled = false;
      this.flushPending();
    });
  }

  private flushPending(): void {
    if (!this.drag || !this.session) return;
    this.layoutDraggedHandle();
    this.deps.previewShape(this.session.objectId, this.workingShape());
    this.emitStatus();
  }

  /** 会话工作形状（previewShape 载荷：类型按 closed/点数派生） */
  private workingShape(): { type: EditableShapeType; points: Vec2[]; closed: boolean } {
    const session = this.session!;
    return { type: this.sessionShapeType(), points: session.points, closed: session.closed };
  }

  private sessionShapeType(): EditableShapeType {
    const session = this.session;
    if (!session) return 'polygon';
    if (session.closed) return 'polygon';
    return session.points.length <= 1 ? 'point' : 'line';
  }

  /** 读数推送（draw:status，沿绘制工具通道）：顶点数恒有；面附面积+周长、线附长度；拖动附游标 */
  private emitStatus(): void {
    const session = this.session;
    if (!session) return;
    const payload: DrawStatusPayload = { vertexCount: session.points.length };
    const type = this.sessionShapeType();
    if (type !== 'point') {
      payload.length =
        type === 'polygon'
          ? polylineLength(session.points) +
            (session.points.length > 1 ? dist(session.points[session.points.length - 1]!, session.points[0]!) : 0)
          : polylineLength(session.points);
      if (type === 'polygon') payload.area = polygonArea(session.points);
    }
    if (this.drag) payload.cursor = { ...session.points[this.drag.index]! };
    this.deps.eventBus.emit('draw:status', payload);
  }

  private toNDC(clientX: number, clientY: number): THREE.Vector2 | null {
    const rect = this.deps.domElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
  }

  /** 节流调度（缺省 rAF；无 rAF 环境（node）同步执行） */
  private schedule(fn: () => void): void {
    const custom = this.deps.schedule;
    if (custom) {
      custom(fn);
      return;
    }
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(fn);
    else fn();
  }
}
