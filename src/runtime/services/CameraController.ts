/**
 * runtime/services/CameraController —— CameraPort 的运行时实现（依赖倒置实现端）。
 *
 * 职责：getMode/setMode（机位模式跟踪 + 透视 / 顶视 / 正视 / 侧视预设机位，保持当前观察距离与目标）、
 *      setOrthoLock（绘制模式禁用旋转）、focusObjects / focusAll（包围盒取景）。
 * 边界：只操作相机与 OrbitControls，不改业务数据；顶/正/侧视用「固定方位角 + 透视相机」
 *      实现（一期不做真正的 OrthographicCamera 切换，交由 T1.9 GUI 验收评估观感）。
 * 实现注记：接口定义在 editor/services/ports（CameraPort），分层 DAG 禁止 runtime→editor
 *      导入（兄弟层），故不 implements 接口，以结构化类型保持签名一致，
 *      兼容性由 app 组合根装配时编译期校验。
 */
import type { ID } from '../../core/types';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { RuntimeObjectMap } from '../RuntimeObjectMap';

/** 默认观察距离（机位切换时无既有距离可用） */
const DEFAULT_DISTANCE = 120;
/** 包围盒取景余量（距离在“恰好容纳”基础上的放大系数） */
const FOCUS_MARGIN = 1.4;

/** 相机机位模式（与 editor/services/ports 的 CameraPort.setMode 参数字面量集一致） */
export type CameraMode = 'perspective' | 'top' | 'front' | 'side';

export class CameraController {
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly map: RuntimeObjectMap;
  /** 当前机位模式（setMode 写入；启动默认 perspective；getMode 读取——T4.1 B3 契约增补） */
  private mode: CameraMode = 'perspective';

  constructor(camera: THREE.PerspectiveCamera, controls: OrbitControls, map: RuntimeObjectMap) {
    this.camera = camera;
    this.controls = controls;
    this.map = map;
  }

  getMode(): CameraMode {
    return this.mode;
  }

  setMode(mode: CameraMode): void {
    this.mode = mode;
    const target = this.controls.target.clone();
    const distance =
      this.camera.position.distanceTo(target) > 1e-6
        ? this.camera.position.distanceTo(target)
        : DEFAULT_DISTANCE;
    switch (mode) {
      case 'top':
        // 正上方俯视（X 向微偏，避免俯仰角 0 的万向锁）
        this.camera.position.set(target.x + distance * 1e-3, target.y + distance, target.z);
        break;
      case 'front':
        this.camera.position.set(target.x, target.y, target.z + distance);
        break;
      case 'side':
        this.camera.position.set(target.x + distance, target.y, target.z);
        break;
      case 'perspective':
      default:
        this.camera.position.set(
          target.x + distance * 0.5,
          target.y + distance * 0.7,
          target.z + distance * 0.8,
        );
        break;
    }
    this.camera.lookAt(target);
    this.controls.update();
  }

  setOrthoLock(locked: boolean): void {
    this.controls.enableRotate = !locked;
  }

  /**
   * 平移观察目标到地面点（T7.7 小地图导航）：controls.target 与相机位置同 delta
   * 平移——观察距离与姿态保持、高度分量不动（纯 XZ 平移）；随后 controls.update()。
   * 小地图拖拽/点击经 app 组合根注入的回调路由至此（CameraPort 契约不动）。
   */
  panTargetTo(x: number, z: number): void {
    const dx = x - this.controls.target.x;
    const dz = z - this.controls.target.z;
    if (dx === 0 && dz === 0) {
      this.controls.update();
      return;
    }
    this.camera.position.x += dx;
    this.camera.position.z += dz;
    this.controls.target.x = x;
    this.controls.target.z = z;
    this.controls.update();
  }

  focusObjects(ids: ID[]): void {
    const box = new THREE.Box3();
    let found = false;
    for (const id of ids) {
      const object = this.map.get(id);
      if (!object) continue;
      box.expandByObject(object);
      found = true;
    }
    if (found) this.focusBox(box);
  }

  focusAll(): void {
    const box = new THREE.Box3();
    let found = false;
    for (const id of this.map.ids()) {
      const object = this.map.get(id);
      if (!object) continue;
      box.expandByObject(object);
      found = true;
    }
    if (found) this.focusBox(box);
  }

  /**
   * 包围盒取景：目标居中、距离按包围球半径与垂直/水平双视场角估算（保持当前观察方向）。
   * 旧实现只看垂直 fov——编辑器左右面板固定占宽、视口偏窄（aspect<1 附近）时横向内容
   * 聚焦后被左右裁掉；水平 fov 由垂直 fov 与 aspect 推导（hFov = 2·atan(tan(vFov/2)·aspect)），
   * 取两方向“恰好容纳包围球”距离的较大者再乘余量。
   */
  private focusBox(box: THREE.Box3): void {
    if (box.isEmpty()) return;
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const center = sphere.center;
    const radius = Math.max(sphere.radius, 1);
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    const aspect = Math.max(this.camera.aspect, 1e-6);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const distance = Math.max(radius / Math.sin(vFov / 2), radius / Math.sin(hFov / 2), 2) * FOCUS_MARGIN;

    const direction = this.camera.position.clone().sub(this.controls.target);
    if (direction.lengthSq() < 1e-9) direction.set(0.5, 0.7, 0.8);
    direction.normalize().multiplyScalar(distance);

    this.camera.position.copy(center).add(direction);
    this.controls.target.copy(center);
    this.controls.update();
  }
}
