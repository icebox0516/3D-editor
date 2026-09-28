/**
 * tests/runtime/instancing/fadeGeometry.test.ts —— 包装几何面回归（T021.7 缺陷 D1）。
 *
 * D1 机制（three 0.186 源码定位）：材质数组网格经 WebGLRenderer.projectObject 按
 * `geometry.groups` 逐组推渲染项——**空组 = 零渲染项 = 整树静默消失**（021.7 视觉
 * 冒烟：乔木 [皮,叶] / canopy [干柱,冠卡] 过渡帧消失；021.3 单测 fixture 不带
 * groups 故未暴露）。Mesh.raycast 材质数组分支同按 groups 逐组求交（拾取链同受益）。
 *
 * 覆盖（node 直测，无 WebGL）：
 * - groups 值拷贝：≥2 组源经 acquire 换装逐组值相等且组对象非同引用（改包装组
 *   不殃及源）；空组源包装后仍空（单材质语义零变化）；
 * - ensureFadeBuffer / writeFadeRange 换装闭环：材质数组网格换装后 geometry 非源、
 *   groups 完整（缺陷复现面——修复前此处为空组）；
 * - 池复用与容量路径 groups 不丢：release→acquire 同源复用；acquire 对池内包装
 *   原地扩容（alignCapacity 换 fade 缓冲）；ensureFadeBuffer 已包装原地扩路径——
 *   三者均只动 aFadeOut 缓冲，groups 原样；
 * - 其余值拷贝义务面：drawRange 值拷（renderBufferDirect 无条件消费）；
 *   morphAttributes 键图浅拷 + 条目引用共享；morphTargetsRelative 随拷。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  FadeGeometryPool,
  ensureFadeBuffer,
  FADE_ATTRIBUTE,
  writeFadeRange,
} from '../../../src/runtime/instancing/fadeGeometry';

// ── 工具 ─────────────────────────────────────────────────────────────────────

/** 两组建一个材质数组源几何（仿乔木 [皮,叶]：6 索引两组各 3，materialIndex 0/1） */
function makeGroupedSource(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6 * 3), 3));
  geometry.setIndex([0, 1, 2, 3, 4, 5]);
  geometry.addGroup(0, 3, 0);
  geometry.addGroup(3, 3, 1);
  return geometry;
}

/** 逐组值相等断言（start/count/materialIndex 三字段，不用引用相等） */
function expectGroupsToMatch(actual: THREE.BufferGeometry, expected: THREE.BufferGeometry): void {
  expect(actual.groups, '组数应与源一致').toHaveLength(expected.groups.length);
  for (let i = 0; i < expected.groups.length; i++) {
    const a = actual.groups[i]!;
    const e = expected.groups[i]!;
    expect(a.start, `组 ${i} start`).toBe(e.start);
    expect(a.count, `组 ${i} count`).toBe(e.count);
    expect(a.materialIndex, `组 ${i} materialIndex`).toBe(e.materialIndex);
    expect(a, `组 ${i} 应为独立组对象（值拷贝非引用共享）`).not.toBe(e);
  }
}

// ── groups 值拷贝（D1 修复面）──────────────────────────────────────────────

describe('acquire：groups 值拷贝（材质数组渲染路径消费面）', () => {
  it('≥2 组源包装后逐组值相等且组对象非同引用；改包装组不殃及源', () => {
    const pool = new FadeGeometryPool();
    const source = makeGroupedSource();
    const wrapper = pool.acquire(source, 4);
    expectGroupsToMatch(wrapper, source);
    // 引用隔离的语义验证：改包装组值，源组原样
    wrapper.groups[0]!.count = 999;
    expect(source.groups[0]!.count).toBe(3);
  });

  it('空组源（单材质）包装后仍空——单材质语义零变化', () => {
    const pool = new FadeGeometryPool();
    const source = new THREE.BufferGeometry();
    source.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6 * 3), 3));
    const wrapper = pool.acquire(source, 2);
    expect(wrapper.groups).toHaveLength(0);
  });
});

describe('ensureFadeBuffer / writeFadeRange：换装闭环（缺陷复现面）', () => {
  it('材质数组网格经 writeFadeRange 换装：geometry 换为包装（非源）且 groups 完整', () => {
    const pool = new FadeGeometryPool();
    const source = makeGroupedSource();
    const mesh = new THREE.Mesh(source, [
      new THREE.MeshBasicMaterial(),
      new THREE.MeshBasicMaterial(),
    ]);
    writeFadeRange(mesh, source, pool, 0, 4, 0.5, 4);
    expect(mesh.geometry).not.toBe(source); // 已换装包装几何
    expect(mesh.geometry.groups, '修复前此处为空组 → projectObject 零渲染项').toHaveLength(2);
    expect(mesh.geometry.getAttribute(FADE_ATTRIBUTE).count).toBe(4);
    mesh.material.forEach((m) => m.dispose());
  });

  it('几何已带 aFadeOut（此前过渡过）则不换装——groups 面不涉及', () => {
    const pool = new FadeGeometryPool();
    const source = makeGroupedSource();
    const mesh = new THREE.Mesh(source, [
      new THREE.MeshBasicMaterial(),
      new THREE.MeshBasicMaterial(),
    ]);
    writeFadeRange(mesh, source, pool, 0, 2, 0.5, 2);
    const first = mesh.geometry;
    writeFadeRange(mesh, source, pool, 0, 2, 1, 2); // 第二次走 existing 快路径
    expect(mesh.geometry).toBe(first);
    expect(mesh.geometry.groups).toHaveLength(2);
    mesh.material.forEach((m) => m.dispose());
  });
});

// ── 池复用与容量路径（groups 不丢）──────────────────────────────────────────

describe('池复用与容量路径：groups 不丢', () => {
  it('release→acquire 同源复用：组值保持', () => {
    const pool = new FadeGeometryPool();
    const source = makeGroupedSource();
    const first = pool.acquire(source, 4);
    pool.release(first);
    const second = pool.acquire(source, 4);
    expect(second).toBe(first); // 池化复用同一对象
    expectGroupsToMatch(second, source);
  });

  it('acquire 复用路径容量不足（alignCapacity 原地换 fade 缓冲）：groups 原样', () => {
    const pool = new FadeGeometryPool();
    const source = makeGroupedSource();
    pool.release(pool.acquire(source, 2));
    const grown = pool.acquire(source, 8); // 池内包装容量 2 < 8 → 换缓冲
    expect(grown.getAttribute(FADE_ATTRIBUTE).count).toBe(8);
    expectGroupsToMatch(grown, source);
  });

  it('ensureFadeBuffer 已包装原地扩路径（换 fade 缓冲不动 geometry）：groups 不丢', () => {
    const pool = new FadeGeometryPool();
    const source = makeGroupedSource();
    const mesh = new THREE.Mesh(source, [
      new THREE.MeshBasicMaterial(),
      new THREE.MeshBasicMaterial(),
    ]);
    ensureFadeBuffer(mesh, source, pool, 2);
    const wrapped = mesh.geometry;
    const grown = ensureFadeBuffer(mesh, source, pool, 16); // existing.count 2 < 16 → 原地扩
    expect(grown.count).toBe(16);
    expect(mesh.geometry).toBe(wrapped); // 原地换缓冲，不重建包装
    expect(mesh.geometry.groups).toHaveLength(2);
    expect(mesh.geometry.getAttribute(FADE_ATTRIBUTE)).toBe(grown);
    mesh.material.forEach((m) => m.dispose());
  });
});

// ── 其余值拷贝义务面（随 D1 一并补的渲染路径消费面）────────────────────────

describe('drawRange / morphAttributes：包装义务面', () => {
  it('drawRange 值拷贝（renderBufferDirect 无条件与 group 区间求交）', () => {
    const pool = new FadeGeometryPool();
    const source = makeGroupedSource();
    source.setDrawRange(1, 4);
    const wrapper = pool.acquire(source, 4);
    expect(wrapper.drawRange.start).toBe(1);
    expect(wrapper.drawRange.count).toBe(4);
    expect(wrapper.drawRange).not.toBe(source.drawRange); // 值拷贝
  });

  it('缺省 drawRange 源包装后保持缺省（0, Infinity）', () => {
    const pool = new FadeGeometryPool();
    const source = makeGroupedSource();
    const wrapper = pool.acquire(source, 4);
    expect(wrapper.drawRange.start).toBe(0);
    expect(wrapper.drawRange.count).toBe(Infinity);
  });

  it('morphAttributes 键图浅拷 + 条目引用共享；morphTargetsRelative 随拷', () => {
    const pool = new FadeGeometryPool();
    const source = makeGroupedSource();
    const morph = new THREE.BufferAttribute(new Float32Array(6 * 3), 3);
    source.morphAttributes.position = [morph];
    source.morphTargetsRelative = true;
    const wrapper = pool.acquire(source, 4);
    expect(wrapper.morphAttributes).not.toBe(source.morphAttributes); // 键图独立
    expect(wrapper.morphAttributes.position?.[0]).toBe(morph); // 条目零复制（共享引用）
    expect(wrapper.morphTargetsRelative).toBe(true);
  });

  it('无 morph 源包装后 morphAttributes 为空键图（GL 缺省路径零变化）', () => {
    const pool = new FadeGeometryPool();
    const source = makeGroupedSource();
    const wrapper = pool.acquire(source, 4);
    expect(wrapper.morphAttributes.position).toBeUndefined();
    expect(wrapper.morphTargetsRelative).toBe(false);
  });
});
