/**
 * tests/runtime/GizmoImpl.pose.test.ts —— Gizmo 姿态换算纯函数测试（T2.4，先测后码）。
 *
 * 覆盖：
 * - objectPoseToTransform：Object3D（position/rotation(Euler,XYZ)/scale）→ 业务 Transform；
 * - applyTransformToObject：业务 Transform → Object3D（含 Y 旋转）；
 * - 往返一致性：A → Transform → B，两对象世界矩阵一致；
 * - Gizmo 拖拽语义：Transform 为纯值快照（修改返回值不影响源对象）。
 * 边界：node 环境只测纯换算；TransformControls 交互（DOM）由浏览器验收覆盖。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { Transform } from '../../src/core/types';
import { applyTransformToObject, objectPoseToTransform } from '../../src/runtime/services/GizmoImpl';

describe('objectPoseToTransform / applyTransformToObject', () => {
  it('Object3D 姿态 → 业务 Transform（位置/弧度旋转/缩放）', () => {
    const o = new THREE.Object3D();
    o.position.set(1, 2, 3);
    o.rotation.set(0.1, Math.PI / 4, -0.2);
    o.scale.set(2, 3, 4);

    const t = objectPoseToTransform(o);
    expect(t.position).toEqual({ x: 1, y: 2, z: 3 });
    expect(t.rotation).toEqual({ x: 0.1, y: Math.PI / 4, z: -0.2 });
    expect(t.scale).toEqual({ x: 2, y: 3, z: 4 });
  });

  it('业务 Transform → Object3D', () => {
    const t: Transform = {
      position: { x: -5, y: 0.5, z: 8 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      scale: { x: 1, y: 1.5, z: 0.5 },
    };
    const o = new THREE.Object3D();
    applyTransformToObject(o, t);
    expect(o.position.toArray()).toEqual([-5, 0.5, 8]);
    expect(o.rotation.y).toBeCloseTo(Math.PI / 2, 12);
    expect(o.scale.toArray()).toEqual([1, 1.5, 0.5]);
  });

  it('往返一致：A → Transform → B，矩阵逐元素相等', () => {
    const a = new THREE.Object3D();
    a.position.set(4, 1, -7);
    a.rotation.set(0.2, -Math.PI / 3, 0.15);
    a.scale.set(1.2, 0.8, 2);

    const b = new THREE.Object3D();
    applyTransformToObject(b, objectPoseToTransform(a));

    a.updateMatrix();
    b.updateMatrix();
    expect(b.matrix.toArray()).toEqual(a.matrix.toArray());
  });

  it('返回值为纯值快照：修改 Transform 不影响源对象', () => {
    const o = new THREE.Object3D();
    o.position.set(1, 1, 1);
    const t = objectPoseToTransform(o);
    t.position.x = 99;
    t.scale.y = 42;
    expect(o.position.x).toBe(1);
    expect(o.scale.y).toBe(1);
  });
});
