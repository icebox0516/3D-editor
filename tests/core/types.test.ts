import { describe, expect, it } from 'vitest';
import { isEuler, isTransform, isVec2, isVec3 } from '../../src/core/types';

describe('isVec2', () => {
  it('接受含有限数值 x/y 的对象', () => {
    expect(isVec2({ x: 1, y: -2 })).toBe(true);
    expect(isVec2({ x: 0, y: 0 })).toBe(true);
    expect(isVec2({ x: 1.5, y: 2.5 })).toBe(true);
  });

  it('拒绝非法输入', () => {
    expect(isVec2(null)).toBe(false);
    expect(isVec2(undefined)).toBe(false);
    expect(isVec2('x')).toBe(false);
    expect(isVec2(3)).toBe(false);
    expect(isVec2([1, 2])).toBe(false);
    expect(isVec2({ x: 1 })).toBe(false);
    expect(isVec2({ x: 1, y: '2' })).toBe(false);
    expect(isVec2({ x: 1, y: NaN })).toBe(false);
    expect(isVec2({ x: 1, y: Infinity })).toBe(false);
  });
});

describe('isVec3', () => {
  it('接受含有限数值 x/y/z 的对象', () => {
    expect(isVec3({ x: 1, y: 2, z: 3 })).toBe(true);
  });

  it('拒绝缺 z 或字段非法的输入', () => {
    expect(isVec3({ x: 1, y: 2 })).toBe(false);
    expect(isVec3({ x: 1, y: 2, z: '3' })).toBe(false);
    expect(isVec3(null)).toBe(false);
    expect(isVec3([1, 2, 3])).toBe(false);
  });
});

describe('isEuler', () => {
  it('接受弧度 Euler 结构', () => {
    expect(isEuler({ x: 0, y: Math.PI / 2, z: 0 })).toBe(true);
  });

  it('拒绝缺失或非法的分量', () => {
    expect(isEuler({ x: 0, y: 0 })).toBe(false);
    expect(isEuler({ x: 0, y: NaN, z: 0 })).toBe(false);
    expect(isEuler('0,0,0')).toBe(false);
  });
});

describe('isTransform', () => {
  it('接受合法 Transform（position/scale 为 Vec3，rotation 为 Euler）', () => {
    expect(
      isTransform({
        position: { x: 0, y: 1, z: 2 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      }),
    ).toBe(true);
  });

  it('拒绝结构破损的 Transform', () => {
    expect(isTransform(null)).toBe(false);
    expect(isTransform({ position: { x: 0, y: 1, z: 2 }, rotation: {}, scale: null })).toBe(false);
    expect(
      isTransform({
        position: { x: 0, y: 1 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      }),
    ).toBe(false);
  });
});
