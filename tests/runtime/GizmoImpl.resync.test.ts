/**
 * tests/runtime/GizmoImpl.resync.test.ts —— 代理重同步测试（T8.6 缺陷①，先测后码）。
 *
 * 缺陷背景：attach 是一次性快照（getTransform 读一次写 proxy），此后场景对象变化
 * （undo/redo/贴地/阵列/属性面板批量改值）不回写 proxy——手柄漂移在旧位姿
 * （sceneZ=0 vs proxyZ=20 实测）。resync 对当前挂载集重读场景 transform 写回 proxy。
 *
 * 覆盖：
 * - 单选：attach 后场景 transform 变化 → resync → proxy 姿态重同步（undo 回滚语义）；
 * - 多选：resync → proxy = 新质心 + 单位旋转/缩放（组枢轴语义，T7.5 锚点架构）；
 * - resync 只写 proxy、不触发 applyPreview（预览通道零副作用）；
 * - 组壳（getTransform → null，T8.5）：全组壳不挂载、resync 无操作不抛错；
 * - 挂载后部分 id 失效（如 undo 成组）→ resync 剔除之，按剩余集重同步；
 * - 全部失效 → resync 等价 detach（姿态不动、再次调用无副作用）；
 * - 未挂载（空集）→ resync 无操作不抛错。
 * 边界：node 环境以 stub domElement 构造真实 GizmoImpl（TransformControls 事件接线
 * 正常建立）；拖拽会话中抑制（dragging 态自守卫）依赖 TransformControls 指针交互，
 * 由浏览器验收覆盖（沿 GizmoImpl.pose.test.ts 既有口径）。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { ID, Transform } from '../../src/core/types';
import { GizmoImpl } from '../../src/runtime/services/GizmoImpl';
import { objectPoseToTransform } from '../../src/runtime/services/GizmoImpl';

/** stub domElement：TransformControls connect/disconnect 只需事件方法 + style */
function stubDomElement(): HTMLElement {
  return {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    style: {},
  } as unknown as HTMLElement;
}

function t(x: number, y = 0, z = 0, ry = 0): Transform {
  return {
    position: { x, y, z },
    rotation: { x: 0, y: ry, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };
}

describe('GizmoImpl.resync 代理重同步（undo/redo 漂移修复）', () => {
  let scene: THREE.Object3D;
  let transforms: Map<ID, Transform>;
  let previews: Array<{ id: ID; t: Transform }>;
  let gizmo: GizmoImpl;

  beforeEach(() => {
    scene = new THREE.Object3D();
    transforms = new Map();
    previews = [];
    gizmo = new GizmoImpl({
      camera: new THREE.Camera(),
      domElement: stubDomElement(),
      scene,
      orbit: null,
      getTransform: (id) => transforms.get(id) ?? null,
      applyPreview: (id, tr) => previews.push({ id, t: tr }),
    });
  });

  /** 场景内代理（attach/拖拽/resync 的姿态写回目标） */
  function proxyPose(): Transform {
    const proxy = scene.getObjectByName('__gizmo_proxy__');
    expect(proxy).not.toBeNull();
    return objectPoseToTransform(proxy!);
  }

  it('单选：attach 后场景 transform 变化 + resync → proxy 重同步（undo 回滚语义）', () => {
    const a = 'a' as ID;
    transforms.set(a, t(0, 0, 0));
    gizmo.attach([a]);
    expect(proxyPose()).toEqual(t(0, 0, 0));

    // 模拟拖拽提交后的场景数据（proxyZ=20 位姿），再模拟 undo 回滚到 0
    transforms.set(a, t(0, 0, 20));
    gizmo.resync();
    expect(proxyPose()).toEqual(t(0, 0, 20));

    transforms.set(a, t(1, 2, 0, Math.PI / 4)); // undo 回滚到新位姿（含旋转）
    gizmo.resync();
    expect(proxyPose()).toEqual(t(1, 2, 0, Math.PI / 4));
  });

  it('多选：resync → proxy = 新质心 + 单位旋转/缩放（组枢轴语义）', () => {
    const a = 'a' as ID;
    const b = 'b' as ID;
    transforms.set(a, t(0, 0, 0));
    transforms.set(b, t(10, 0, 0));
    gizmo.attach([a, b]);
    expect(proxyPose()).toEqual(t(5, 0, 0)); // 初始质心

    transforms.set(a, t(4, 0, 6));
    transforms.set(b, t(10, 0, 2));
    gizmo.resync();
    const pose = proxyPose();
    expect(pose.position).toEqual({ x: 7, y: 0, z: 4 }); // 新质心
    expect(pose.rotation).toEqual({ x: 0, y: 0, z: 0 }); // 组枢轴恒单位姿态
    expect(pose.scale).toEqual({ x: 1, y: 1, z: 1 });
  });

  it('resync 只写 proxy：applyPreview 预览通道零调用', () => {
    const a = 'a' as ID;
    transforms.set(a, t(0, 0, 0));
    gizmo.attach([a]);
    transforms.set(a, t(0, 0, 20));
    gizmo.resync();
    expect(previews).toHaveLength(0);
  });

  it('组壳（getTransform → null）不回归：全组壳不挂载，resync 无操作不抛错', () => {
    const shell = 'shell' as ID; // map 中不存在 → getTransform 返 null（T8.5 组壳语义）
    gizmo.attach([shell]);
    expect(proxyPose()).toEqual(t(0, 0, 0)); // 未挂载，姿态不动

    expect(() => gizmo.resync()).not.toThrow();
    expect(proxyPose()).toEqual(t(0, 0, 0));
  });

  it('挂载后部分 id 失效（undo 成组等）→ resync 剔除之，按剩余集重同步', () => {
    const a = 'a' as ID;
    const b = 'b' as ID;
    transforms.set(a, t(0, 0, 0));
    transforms.set(b, t(10, 0, 0));
    gizmo.attach([a, b]);
    expect(proxyPose().position.x).toBe(5);

    transforms.delete(b); // b 变组壳（getTransform → null）
    transforms.set(a, t(3, 0, 8));
    gizmo.resync();
    expect(proxyPose()).toEqual(t(3, 0, 8)); // 剩余单选语义：proxy = a 的变换（非质心）
  });

  it('全部失效 → resync 等价 detach：姿态不动、再次调用无副作用', () => {
    const a = 'a' as ID;
    transforms.set(a, t(2, 0, 2));
    gizmo.attach([a]);
    expect(proxyPose()).toEqual(t(2, 0, 2));

    transforms.delete(a);
    gizmo.resync();
    expect(proxyPose()).toEqual(t(2, 0, 2)); // 姿态保持，不抛错
    expect(() => gizmo.resync()).not.toThrow();
  });

  it('未挂载（attach 前 / 空集）→ resync 无操作不抛错', () => {
    expect(() => gizmo.resync()).not.toThrow();
    gizmo.attach([]);
    expect(() => gizmo.resync()).not.toThrow();
    expect(proxyPose()).toEqual(t(0, 0, 0));
  });
});
