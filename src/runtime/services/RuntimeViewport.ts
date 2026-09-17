/**
 * runtime/services/RuntimeViewport —— ViewportPort 的运行时实现（依赖倒置实现端）。
 *
 * 职责：pickObject（射线拾取 → userData.objectId 反查业务 id）、
 *      groundPoint（射线 → 地面平面 y=0 世界坐标，供绘制/放置共用画板语义）。
 * 边界：只读相机与业务内容组；x/y 为视口相对 CSS 像素坐标（PointerEventInfo.screenX/Y 语义）；
 *      预览组/环境组不在拾取根内，天然不被拾取。
 * 实现注记：接口定义在 editor/services/ports（ViewportPort），但分层 DAG 禁止
 *      runtime→editor 导入（兄弟层），故本类不 implements 接口，而以结构化类型
 *      （TS structural typing）保持签名一致——兼容性由 app 组合根装配时编译期校验。
 *      T2.3：实例化渲染（InstancedMesh）没有逐对象根，命中改为携带 instanceId——
 *      经注入的 resolveInstancedHit（Renderer 接 InstancedAssetPool.resolvePick）
 *      由槽位反查业务 id；缺省（无池）时回落 userData.objectId 反查。
 *      T003.3（D18.7）：散布实例纳入拾取——散布 root（contentGroup 的兄弟）并入
 *      射线目标，命中经注入的 scatterPick.resolvePick 映射回源 id（regionId）走既有
 *      区域选中链路；两根同场公平竞争（three 全局按距离排序），不可见块组由
 *      resolvePick 的可见性守卫挡下（r186 raycaster 不跳 visible=false 子树）。
 */
import type { ID, Vec3 } from '../../core/types';
import * as THREE from 'three';
import type { RuntimeObjectMap } from '../RuntimeObjectMap';

/** InstancedMesh 命中反查（assetId 池内 instanceId 槽 → 业务 id；非实例命中返回 null） */
export type InstancedHitResolver = (hit: THREE.Intersection) => ID | null;

/** 散布拾取源（T003.3，D18.7）：渲染根 + 命中反查（散布 InstancedMesh → 所属源 id） */
export interface ScatterPickSource {
  /** 散布渲染根（Renderer 挂 scene、contentGroup 兄弟；子树 = 块 Group × 实例网格） */
  root: THREE.Object3D;
  /** 命中反查（不可见/非散布命中返回 null——可见性守卫在 manager.resolvePick 内） */
  resolvePick: (hit: THREE.Intersection) => ID | null;
}

/** 地面兜底交点的最大相机距离（米）：近水平射线的极远交点数值不可信，超限返回 null（调研坑③） */
const SURFACE_GROUND_MAX_DISTANCE = 2000;

export class RuntimeViewport {
  private readonly canvas: HTMLCanvasElement;
  private readonly camera: THREE.Camera;
  /** 拾取根：仅业务内容组（预览/环境排除） */
  private readonly pickRoot: THREE.Object3D;
  private readonly map: RuntimeObjectMap;
  private readonly resolveInstancedHit?: InstancedHitResolver;
  /** 散布拾取源（可选——无散布管线时缺省，拾取集合不变） */
  private readonly scatterPick?: ScatterPickSource;
  private readonly raycaster = new THREE.Raycaster();
  private readonly groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // y=0 地面

  constructor(
    canvas: HTMLCanvasElement,
    camera: THREE.Camera,
    pickRoot: THREE.Object3D,
    map: RuntimeObjectMap,
    resolveInstancedHit?: InstancedHitResolver,
    scatterPick?: ScatterPickSource,
  ) {
    this.canvas = canvas;
    this.camera = camera;
    this.pickRoot = pickRoot;
    this.map = map;
    this.resolveInstancedHit = resolveInstancedHit;
    this.scatterPick = scatterPick;
    // T8.4 islands：未归类对象在诊断档下移入 DIAG_LAYER——raycaster 默认掩码仅 layer 0
    // 会导致点选失效，开全层（沿 GizmoImpl TransformControls enableAll 先例）。
    // 安全性：拾取根只含业务内容组，环境/预览/辅助不在其内，开全层不引入误拾取。
    // （散布 root 同理：其子树只含散布实例网格，无环境/辅助混入。）
    this.raycaster.layers.enableAll();
  }

  pickObject(x: number, y: number): ID | null {
    const ndc = this.toNDC(x, y);
    if (!ndc) return null;
    this.raycaster.setFromCamera(ndc, this.camera);
    // 散布 root 并入射线目标（D18.7）：与业务内容全局按距离排序公平竞争，
    // 最近的合法命中先出（散布实例不比普通对象优先，也不被压制）
    const targets = this.scatterPick
      ? [...this.pickRoot.children, this.scatterPick.root]
      : this.pickRoot.children;
    const hits = this.raycaster.intersectObjects(targets, true);
    for (const hit of hits) {
      // InstancedMesh 命中携带 instanceId → 池内槽位反查业务 id
      const instanced = this.resolveInstancedHit?.(hit) ?? null;
      if (instanced) return instanced;
      // 散布命中 → 源 id（regionId）→ 既有区域选中链路（instanceId 无逐实例语义，不用）
      const scatterId = this.scatterPick?.resolvePick(hit) ?? null;
      if (scatterId) return scatterId;
      // 命中子 Mesh 时沿父链定位业务根对象
      const id = this.map.findId(hit.object);
      if (id) return id;
    }
    return null;
  }

  groundPoint(x: number, y: number): Vec3 | null {
    const ndc = this.toNDC(x, y);
    if (!ndc) return null;
    this.raycaster.setFromCamera(ndc, this.camera);
    const point = new THREE.Vector3();
    const hit = this.raycaster.ray.intersectPlane(this.groundPlane, point);
    return hit ? { x: point.x, y: point.y, z: point.z } : null;
  }

  /**
   * 测量拾取（T10.1，ViewportPort 契约增补；stage10-measure §B）：三分支——
   *  1. 表面优先：pickRoot（content 业务内容组）raycast 最近命中交点世界坐标；
   *     AUX/gizmo/网格/地面辅助不在拾取根内，天然不可拾取（与 pickObject 同集合）；
   *  2. 地面兜底：未命中对象 → 射线交 y=0 平面；
   *  3. 近水平限距：地面交点距相机 > 2000m（近水平射线极远交点，数值不可信）
   *     返回 null；表面命中（实际对象，有限距离）不设此限。
   */
  surfacePoint(x: number, y: number): Vec3 | null {
    const ndc = this.toNDC(x, y);
    if (!ndc) return null;
    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObjects(this.pickRoot.children, true);
    if (hits.length > 0) {
      const p = hits[0]!.point;
      return { x: p.x, y: p.y, z: p.z };
    }
    const point = new THREE.Vector3();
    const hit = this.raycaster.ray.intersectPlane(this.groundPlane, point);
    if (!hit) return null; // 射线背离地面（仰望）
    if (point.distanceTo(this.raycaster.ray.origin) > SURFACE_GROUND_MAX_DISTANCE) return null;
    return { x: point.x, y: point.y, z: point.z };
  }

  /**
   * 框选拾取（T2.4）：屏幕矩形（CSS 像素，任意对角次序）→ 与对象包围盒屏幕投影
   * 相交的业务 id 集。实现：逐业务对象取包围盒（Box3.setFromObject，含实例池锚点
   * 上装饰的共享子网格），8 个角点投影到屏幕，任一角落入矩形即视为相交；
   * 包围盒跨越相机后方（投影不可信）时保守判交。隐藏/未加载（空包围盒）对象跳过。
   */
  pickInRect(x0: number, y0: number, x1: number, y1: number): ID[] {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return [];
    const minX = Math.min(x0, x1);
    const maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1);
    const maxY = Math.max(y0, y1);

    const hits: ID[] = [];
    const box = new THREE.Box3();
    const corner = new THREE.Vector3();
    for (const id of this.map.ids()) {
      const object = this.map.get(id);
      if (!object) continue;
      box.setFromObject(object);
      if (box.isEmpty()) continue;
      if (this.boxIntersectsRect(box, corner, rect, minX, minY, maxX, maxY)) {
        hits.push(id);
      }
    }
    return hits;
  }

  /** 包围盒 8 角投影与屏幕矩形相交判定；任一角位于相机后方（z < -1）保守视为相交 */
  private boxIntersectsRect(
    box: THREE.Box3,
    corner: THREE.Vector3,
    rect: DOMRect,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ): boolean {
    for (let i = 0; i < 8; i++) {
      corner.set(
        i & 1 ? box.max.x : box.min.x,
        i & 2 ? box.max.y : box.min.y,
        i & 4 ? box.max.z : box.min.z,
      );
      corner.project(this.camera);
      if (corner.z < -1) return true; // 跨越相机近后方：投影翻转不可信，保守相交
      const sx = rect.left + ((corner.x + 1) / 2) * rect.width;
      const sy = rect.top + ((1 - corner.y) / 2) * rect.height;
      if (sx >= minX && sx <= maxX && sy >= minY && sy <= maxY) return true;
    }
    return false;
  }

  /** 视口 CSS 像素 → NDC（画布尺寸为零时返回 null） */
  private toNDC(x: number, y: number): THREE.Vector2 | null {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return new THREE.Vector2(
      ((x - rect.left) / rect.width) * 2 - 1,
      -((y - rect.top) / rect.height) * 2 + 1,
    );
  }
}
