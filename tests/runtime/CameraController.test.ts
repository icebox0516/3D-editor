/**
 * tests/runtime/CameraController.test.ts —— CameraPort 实现端状态测试（T4.1 B3，先测后码）。
 *
 * 覆盖：
 * - getMode：初始 'perspective'；setMode 写入后 getMode 同步（top/front/side/perspective 全枚举）；
 * - 结构化兼容：CameraController 不 implements CameraPort（分层 DAG 禁止 runtime→editor），
 *   以赋值 `const port: CameraPort = controller` 做编译期结构校验 + 运行时签名齐备断言；
 * - setMode 姿态行为保持：top = 目标正上方（距离保持）；setOrthoLock 翻转 enableRotate。
 * 边界：node 环境无 DOM，OrbitControls 用最小替身（CameraController 只消费
 *      target / update() / enableRotate）；three 仅出现在 tests/runtime（白名单允许）。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraController } from '../../src/runtime/services/CameraController';
import type { CameraPort } from '../../src/editor/services/ports';
import { RuntimeObjectMap } from '../../src/runtime/RuntimeObjectMap';

/** 最小 OrbitControls 替身：只满足 CameraController 消费面（target / update / enableRotate） */
function stubControls(): OrbitControls {
  return { target: new THREE.Vector3(), update: () => {}, enableRotate: true } as unknown as OrbitControls;
}

function makeController(): { controller: CameraController; camera: THREE.PerspectiveCamera; controls: OrbitControls } {
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(50, 60, 80);
  const controls = stubControls();
  const controller = new CameraController(camera, controls, new RuntimeObjectMap());
  return { controller, camera, controls };
}

describe('CameraController.getMode（T4.1 B3：CameraPort 契约增补）', () => {
  it('初始机位模式为 perspective', () => {
    expect(makeController().controller.getMode()).toBe('perspective');
  });

  it('setMode 写入后 getMode 同步（全枚举：top / front / side / perspective）', () => {
    const { controller } = makeController();
    for (const mode of ['top', 'front', 'side', 'perspective'] as const) {
      controller.setMode(mode);
      expect(controller.getMode()).toBe(mode);
    }
  });

  it('结构化兼容 CameraPort：编译期赋值通过 + 运行时签名齐备', () => {
    const { controller } = makeController();
    const port: CameraPort = controller; // DAG 由 tests 豁免；赋值通过 = 结构兼容
    expect(typeof port.getMode).toBe('function');
    expect(typeof port.setMode).toBe('function');
    expect(typeof port.setOrthoLock).toBe('function');
    expect(typeof port.focusObjects).toBe('function');
    expect(typeof port.focusAll).toBe('function');
  });
});

describe('CameraController 既有行为保持（回归锚点）', () => {
  it('setMode("top")：相机移到目标正上方且保持观察距离（X 向微偏防万向锁）', () => {
    const { controller, camera, controls } = makeController();
    const distance = camera.position.distanceTo(controls.target);
    controller.setMode('top');
    expect(camera.position.y).toBeCloseTo(distance, 6);
    expect(Math.abs(camera.position.x - controls.target.x)).toBeLessThan(distance * 1e-2);
    expect(camera.position.z).toBeCloseTo(controls.target.z, 6);
  });

  it('setOrthoLock：true 禁用旋转，false 恢复', () => {
    const { controller, controls } = makeController();
    controller.setOrthoLock(true);
    expect(controls.enableRotate).toBe(false);
    controller.setOrthoLock(false);
    expect(controls.enableRotate).toBe(true);
  });
});

describe('CameraController.panTargetTo（T7.7 小地图导航：平移观察目标）', () => {
  /** 带 update 调用计数的 controls 替身 */
  function stubControlsCounting(): { controls: OrbitControls; updateCalls: { count: number } } {
    const updateCalls = { count: 0 };
    const controls = {
      target: new THREE.Vector3(),
      update: () => {
        updateCalls.count += 1;
      },
      enableRotate: true,
    } as unknown as OrbitControls;
    return { controls, updateCalls };
  }

  it('target 与相机位置同 delta 平移：观察距离与朝向保持不变', () => {
    const camera = new THREE.PerspectiveCamera(50, 1, 1, 10000);
    camera.position.set(60, 50, 80);
    const { controls } = stubControlsCounting();
    const controller = new CameraController(camera, controls, new RuntimeObjectMap());
    const beforeDistance = camera.position.distanceTo(controls.target);
    const beforeDirection = camera.position.clone().sub(controls.target).normalize();

    controller.panTargetTo(-40, 120);
    expect(controls.target.x).toBe(-40);
    expect(controls.target.z).toBe(120);
    expect(camera.position.distanceTo(controls.target)).toBeCloseTo(beforeDistance, 9);
    const afterDirection = camera.position.clone().sub(controls.target).normalize();
    expect(afterDirection.dot(beforeDirection)).toBeCloseTo(1, 9);
  });

  it('target.y 与相机高度不变（纯地面平移）；controls.update 被调用', () => {
    const camera = new THREE.PerspectiveCamera(50, 1, 1, 10000);
    camera.position.set(10, 50, 20);
    const { controls, updateCalls } = stubControlsCounting();
    controls.target.set(5, 3, 7);
    const controller = new CameraController(camera, controls, new RuntimeObjectMap());

    controller.panTargetTo(100, -200);
    expect(controls.target.y).toBe(3); // 高度分量不动
    expect(camera.position.y).toBe(50);
    expect(updateCalls.count).toBe(1);
  });

  it('连续拖拽调用（指针跟随语义）：每次都把 target 精确带到指定地面点', () => {
    const camera = new THREE.PerspectiveCamera(50, 1, 1, 10000);
    camera.position.set(0, 40, 0);
    const { controls } = stubControlsCounting();
    const controller = new CameraController(camera, controls, new RuntimeObjectMap());
    controller.panTargetTo(10, 10);
    controller.panTargetTo(-5, 30);
    controller.panTargetTo(0, 0);
    expect(controls.target.x).toBe(0);
    expect(controls.target.z).toBe(0);
    // 相机相对偏移保持初始姿态（初始 target 原点、相机正上方）
    expect(camera.position.x).toBeCloseTo(0, 9);
    expect(camera.position.z).toBeCloseTo(0, 9);
  });
});

describe('CameraController.focusAll / focusObjects（包围球 + 垂直/水平双视场角适配）', () => {
  /** 装配带指定 aspect 相机 + 映射表（注册一个 BoxGeometry(400,1,1) 宽扁对象） */
  function makeFocusSetup(aspect: number): {
    controller: CameraController;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    map: RuntimeObjectMap;
  } {
    const camera = new THREE.PerspectiveCamera(50, aspect, 1, 10000);
    camera.position.set(60, 50, 80);
    const controls = stubControls();
    const map = new RuntimeObjectMap();
    map.set('obj_wide', new THREE.Mesh(new THREE.BoxGeometry(400, 1, 1)));
    return { controller: new CameraController(camera, controls, map), camera, controls, map };
  }

  it('窄视口（aspect<1）宽扁对象：水平视场角主导取景，横向内容完整入画', () => {
    const { controller, camera, controls } = makeFocusSetup(0.5);
    controller.focusAll();
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * 0.5);
    // BoxGeometry(400,1,1) 的包围球半径 = 对角线一半 ≈ 200.0025
    const radius = Math.hypot(200, 0.5, 0.5);
    const expected = (radius / Math.sin(hFov / 2)) * 1.4; // 水平方向容纳距离更大，应主导
    expect(camera.position.distanceTo(controls.target)).toBeCloseTo(expected, 3);
    expect(controls.target.length()).toBeCloseTo(0, 6); // 目标移到包围盒中心（原点）
  });

  it('宽视口（aspect>1）：垂直视场角主导取景（水平方向反而更宽裕）', () => {
    const { controller, camera, controls } = makeFocusSetup(2);
    controller.focusAll();
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const radius = Math.hypot(200, 0.5, 0.5);
    const expected = (radius / Math.sin(vFov / 2)) * 1.4; // 垂直方向主导（aspect>1 时水平 fov 更大、容纳距离更短）
    expect(camera.position.distanceTo(controls.target)).toBeCloseTo(expected, 3);
  });

  it('focusObjects 与 focusAll 同一取景路径；空场景不取景（相机不动）', () => {
    const camera = new THREE.PerspectiveCamera(50, 1, 1, 10000);
    camera.position.set(60, 50, 80);
    const controls = stubControls();
    const map = new RuntimeObjectMap();
    const controller = new CameraController(camera, controls, map);
    controller.focusAll();
    expect(camera.position.distanceTo(new THREE.Vector3(60, 50, 80))).toBe(0);
    controller.focusObjects(['missing_id']);
    expect(camera.position.distanceTo(new THREE.Vector3(60, 50, 80))).toBe(0);
  });
});
