/**
 * tests/runtime/GizmoImpl.groupDelta.test.ts —— Gizmo 多对象成组变换增量纯函数测试
 * （T7.5 先测后码）。
 *
 * 覆盖（D = proxyFinal ∘ proxyStart⁻¹，after_i = D ∘ before_i）：
 * - transformToMatrix / matrixToTransform：与 Object3D 姿态（Euler XYZ）往返一致；
 * - composeGroupDelta + applyGroupDelta：
 *   - 平移：成员整体平移，旋转/缩放不变，质心平移量 = 增量平移量；
 *   - 旋转：绕组枢轴（质心 = proxy 初始位置）旋转，成员自身旋转叠加；
 *   - 缩放：绕组枢轴缩放，成员偏移与自身缩放同比放大；
 * - 单选路径回归：before == proxyStart 时 after == proxyFinal（绕自身原点）；
 * - 矩阵等价性：M(after) == D · M(before) 逐元素成立（非 Euler 表象差异）。
 * 边界：node 环境只测纯函数（three 数学区）；TransformControls 交互留浏览器验收。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { Transform } from '../../src/core/types';
import {
  applyGroupDelta,
  applyTransformToObject,
  composeGroupDelta,
  matrixToTransform,
  objectPoseToTransform,
  transformToMatrix,
} from '../../src/runtime/services/GizmoImpl';

const TOL = 1e-9;

function closeToMatrix(actual: THREE.Matrix4, expected: THREE.Matrix4) {
  const a = actual.toArray();
  const b = expected.toArray();
  for (let i = 0; i < 16; i++) {
    expect(Math.abs(a[i]! - b[i]!)).toBeLessThanOrEqual(TOL * 8);
  }
}

function makeTransform(
  position: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1],
): Transform {
  return {
    position: { x: position[0], y: position[1], z: position[2] },
    rotation: { x: rotation[0], y: rotation[1], z: rotation[2] },
    scale: { x: scale[0], y: scale[1], z: scale[2] },
  };
}

describe('transformToMatrix / matrixToTransform（姿态矩阵往返）', () => {
  it('与 Object3D（Euler XYZ）矩阵逐元素一致；往返还原 Transform', () => {
    const t = makeTransform([4, 1, -7], [0.2, -Math.PI / 3, 0.15], [1.2, 0.8, 2]);
    const o = new THREE.Object3D();
    applyTransformToObject(o, t);
    o.updateMatrix();

    closeToMatrix(transformToMatrix(t), o.matrix);

    const round = matrixToTransform(transformToMatrix(t));
    const or2 = new THREE.Object3D();
    applyTransformToObject(or2, round);
    or2.updateMatrix();
    closeToMatrix(or2.matrix, o.matrix);
  });
});

/** 数值分量级断言（TRS 三分量逐字段；避免 toEqual 的浮点严格相等） */
function expectVecClose(actual: { x: number; y: number; z: number }, expected: { x: number; y: number; z: number }) {
  expect(actual.x).toBeCloseTo(expected.x, 9);
  expect(actual.y).toBeCloseTo(expected.y, 9);
  expect(actual.z).toBeCloseTo(expected.z, 9);
}

describe('composeGroupDelta / applyGroupDelta（成组增量 D ∘ before）', () => {
  it('平移：成员整体平移，旋转/缩放不变；质心平移量 = 增量平移量', () => {
    const proxyStart = makeTransform([10, 0, 5]); // 组枢轴 = 质心
    const proxyFinal = makeTransform([15, 2, 5]); // 平移 (5, 2, 0)
    const delta = composeGroupDelta(proxyStart, proxyFinal);

    const beforeA = makeTransform([13, 0, 8], [0.3, 0, 0], [2, 2, 2]);
    const beforeB = makeTransform([7, 0, 2], [0, 0.5, 0], [1, 1, 1]);
    const afterA = applyGroupDelta(beforeA, delta);
    const afterB = applyGroupDelta(beforeB, delta);

    expectVecClose(afterA.position, { x: 18, y: 2, z: 8 });
    expectVecClose(afterB.position, { x: 12, y: 2, z: 2 });
    expectVecClose(afterA.rotation, beforeA.rotation); // 旋转不变
    expectVecClose(afterB.rotation, beforeB.rotation);
    expectVecClose(afterA.scale, beforeA.scale); // 缩放不变
    expectVecClose(afterB.scale, beforeB.scale);

    // 质心平移量 = 增量平移量
    const cx0 = (beforeA.position.x + beforeB.position.x) / 2;
    const cy0 = (beforeA.position.y + beforeB.position.y) / 2;
    const cx1 = (afterA.position.x + afterB.position.x) / 2;
    const cy1 = (afterA.position.y + afterB.position.y) / 2;
    expect(cx1 - cx0).toBeCloseTo(5, 9);
    expect(cy1 - cy0).toBeCloseTo(2, 9);
  });

  it('旋转：绕组枢轴（质心）旋转，成员偏移与朝向同增量旋转', () => {
    const pivot = makeTransform([10, 0, 0]); // 质心
    const rotated = makeTransform([10, 0, 0], [0, Math.PI / 2, 0]); // 绕 Y +90°
    const delta = composeGroupDelta(pivot, rotated);

    const before = makeTransform([13, 0, 0]); // 质心 +X 方向 3m
    const after = applyGroupDelta(before, delta);

    // 偏移 (3,0,0) 绕 Y +90° → (0,0,-3)：最终 (10, 0, -3)
    expect(after.position.x).toBeCloseTo(10, 9);
    expect(after.position.y).toBeCloseTo(0, 9);
    expect(after.position.z).toBeCloseTo(-3, 9);
    // 成员自身朝向叠加同一旋转
    expect(after.rotation.y).toBeCloseTo(Math.PI / 2, 9);
    expectVecClose(after.scale, before.scale);
  });

  it('缩放：绕组枢轴缩放，成员偏移与自身缩放同比放大', () => {
    const pivot = makeTransform([10, 0, 0]);
    const scaled = makeTransform([10, 0, 0], [0, 0, 0], [2, 2, 2]);
    const delta = composeGroupDelta(pivot, scaled);

    const before = makeTransform([13, 0, 4], [0, 0.4, 0], [1.5, 1, 0.5]);
    const after = applyGroupDelta(before, delta);

    // 偏移 (3,0,4) ×2 → (6,0,8)：最终 (16, 0, 8)
    expect(after.position.x).toBeCloseTo(16, 9);
    expect(after.position.y).toBeCloseTo(0, 9);
    expect(after.position.z).toBeCloseTo(8, 9);
    // 自身缩放同比放大；旋转不变
    expectVecClose(after.scale, { x: 3, y: 2, z: 1 });
    expect(after.rotation.y).toBeCloseTo(0.4, 9);
  });

  it('矩阵等价：M(after) == D · M(before)（一般旋转 + 等比缩放增量，TRS 可表示）', () => {
    const proxyStart = makeTransform([2, 1, -3], [0.1, 0.2, -0.15], [1, 1, 1]);
    // 等比缩放（非等比 × 成员旋转会产生剪切——超出 TRS 可表示域，decompose 吸收，
    // 属 Transform 结构既有边界，不在此断言）
    const proxyFinal = makeTransform([6, 2, 1], [-0.2, 0.8, 0.3], [1.5, 1.5, 1.5]);
    const delta = composeGroupDelta(proxyStart, proxyFinal);

    const before = makeTransform([12, -2, 7], [0.4, -0.9, 1.1], [2, 0.6, 1.3]);
    const after = applyGroupDelta(before, delta);

    const expected = new THREE.Matrix4().multiplyMatrices(delta, transformToMatrix(before));
    closeToMatrix(transformToMatrix(after), expected);
  });

  it('单选路径回归：before == proxyStart 时 after == proxyFinal（绕自身原点）', () => {
    const before = makeTransform([5, 3, -2], [0.2, Math.PI / 4, -0.3], [1.1, 1, 0.9]);
    const final = makeTransform([9, 3, -2], [0.2, (3 * Math.PI) / 4, -0.3], [1.1, 1, 0.9]);
    const delta = composeGroupDelta(before, final);
    const after = applyGroupDelta(before, delta);

    // after == final（平移 + 绕自身原点旋转的成员，自身不发生平移之外的位移）
    expect(after.position.x).toBeCloseTo(final.position.x, 9);
    expect(after.position.y).toBeCloseTo(final.position.y, 9);
    expect(after.position.z).toBeCloseTo(final.position.z, 9);
    closeToMatrix(transformToMatrix(after), transformToMatrix(final));
  });

  it('纯值快照：applyGroupDelta 不改入参 Transform', () => {
    const delta = composeGroupDelta(makeTransform([0, 0, 0]), makeTransform([1, 0, 0]));
    const before = makeTransform([1, 2, 3]);
    const snapshot = JSON.parse(JSON.stringify(before)) as Transform;
    applyGroupDelta(before, delta);
    expect(before).toEqual(snapshot);
  });

  it('objectPoseToTransform 一致性：Object3D 姿态经矩阵合成后语义不变（y 旋转）', () => {
    const o = new THREE.Object3D();
    applyTransformToObject(o, makeTransform([1, 0, 0], [0, Math.PI / 2, 0]));
    const t = objectPoseToTransform(o);
    closeToMatrix(transformToMatrix(t), transformToMatrix(makeTransform([1, 0, 0], [0, Math.PI / 2, 0])));
  });
});
