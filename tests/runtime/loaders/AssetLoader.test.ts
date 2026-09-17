/**
 * tests/runtime/loaders/AssetLoader.test.ts —— 实例化源抽取测试（T5.9 缺陷修复，先测后码）。
 *
 * 覆盖（缺陷 B：多 Mesh 模板此前只取首个 Mesh，实例化渲染与射线拾取只覆盖首部件——
 * 用户点击凉亭柱/顶等视觉主体永远选不中；浏览器实测 2026-09-11 近景截图确认
 * 已放置凉亭仅渲染底座）：
 * - 单 Mesh 模板：引用共享（geometry 同一引用、derived=false，零派生开销）；
 * - 多 Mesh 模板（凉亭式：底座 + 高处柱/顶，各带节点变换）：烘焙世界变换合并为单
 *   geometry + 材质数组（groups 对齐）；顶点数 = 部件和；包围盒覆盖全部部件世界位置；
 * - 不可合并形态（属性集不一致 / 蒙皮）：保守回退首 Mesh（T2.3 旧语义）；
 * - 模板无 Mesh → reject 语义（throw）。
 * 边界：不触 GLTFLoader（node 无 fetch/URL，阶段门约定）——直测导出的纯函数
 *      extractInstanceSource；加载/缓存/生命周期由浏览器路径与代码审查覆盖。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { extractInstanceSource } from '../../../src/runtime/loaders/AssetLoader';

/** 部件网格：box 位于自身局部原点，由父节点变换摆放（模拟 GLB 节点层级） */
function part(
  size: [number, number, number],
  position: [number, number, number],
  name: string,
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshStandardMaterial({ color: 0x888888 }),
  );
  mesh.name = name;
  mesh.position.set(...position);
  return mesh;
}

/** 凉亭式多 Mesh 模板：底座在原点、柱子在 y=3、尖顶在 y=5.5（视觉主体远离首部件） */
function pavilionTemplate(): THREE.Group {
  const root = new THREE.Group();
  root.add(part([3, 0.3, 3], [0, 0.15, 0], 'platform'));
  root.add(part([0.3, 3, 0.3], [1, 3, 1], 'column-1'));
  root.add(part([0.3, 3, 0.3], [-1, 3, -1], 'column-2'));
  root.add(part([3.4, 0.6, 3.4], [0, 5.5, 0], 'roof'));
  return root;
}

function vertexCount(geometry: THREE.BufferGeometry): number {
  return geometry.getAttribute('position').count;
}

describe('extractInstanceSource：单 Mesh 模板', () => {
  it('引用共享：geometry/material 取首个 Mesh 原引用，derived=false', () => {
    const template = new THREE.Group();
    const only = part([1, 2, 1], [0, 1, 0], 'only');
    template.add(only);

    const { source, derived } = extractInstanceSource(template, 'asset_single');
    expect(derived).toBe(false);
    expect(source.geometry).toBe(only.geometry);
    expect(source.material).toBe(only.material);
  });
});

describe('extractInstanceSource：多 Mesh 模板合并（缺陷 B 修复）', () => {
  it('烘焙节点变换合并：单 geometry 覆盖全部部件、材质数组与 groups 对齐部件数', () => {
    const template = pavilionTemplate();
    const parts = [...template.children] as THREE.Mesh[];
    const expectedVertices = parts.reduce((sum, p) => sum + vertexCount(p.geometry), 0);

    const { source, derived } = extractInstanceSource(template, 'asset_pavilion');

    expect(derived).toBe(true); // 派生合并资源（AssetLoader.dispose 释放）
    expect(vertexCount(source.geometry)).toBe(expectedVertices);
    expect(Array.isArray(source.material)).toBe(true);
    const materials = source.material as THREE.Material[];
    expect(materials).toHaveLength(parts.length);
    expect(materials[0]).toBe(parts[0].material); // 顺序对齐（groups materialIndex）
    const groups = source.geometry.groups;
    expect(groups).toHaveLength(parts.length);
    // groups 材质索引按部件顺序 0..n-1（mergeGeometries useGroups 语义）
    expect(groups.map((g) => g.materialIndex)).toEqual(parts.map((_, i) => i));

    // 烘焙正确：合并包围盒覆盖全部部件的世界位置（柱顶 y≈4.5、尖顶 y≈5.8）
    source.geometry.computeBoundingBox();
    const box = source.geometry.boundingBox!;
    expect(box.max.y).toBeGreaterThan(5);
    expect(box.min.y).toBeCloseTo(0, 5);
    expect(Math.abs(box.max.x)).toBeGreaterThan(1);
  });

  it('模板部件节点带旋转/缩放时同样烘焙进合并几何', () => {
    const template = new THREE.Group();
    const rotated = part([1, 1, 1], [0, 0, 0], 'rot');
    rotated.rotation.y = Math.PI / 4;
    rotated.scale.set(2, 2, 2);
    template.add(part([1, 1, 1], [0, 0.5, 0], 'base'));
    template.add(rotated);

    const { source } = extractInstanceSource(template, 'asset_rot');
    source.geometry.computeBoundingBox();
    // 旋转 45° + scale 2 的盒对角线 ≈ 2*sqrt(2) ≈ 2.83（超出未变换的 ±1）
    expect(source.geometry.boundingBox!.max.x).toBeGreaterThan(1.3);
  });

  it('属性集不一致（一个部件含 uv、一个不含）→ 保守回退首 Mesh 引用', () => {
    const template = new THREE.Group();
    const withUv = part([1, 1, 1], [0, 0, 0], 'a');
    withUv.geometry.setAttribute(
      'uv',
      new THREE.BufferAttribute(new Float32Array(withUv.geometry.getAttribute('position').count * 2), 2),
    );
    template.add(withUv);
    const noUv = part([1, 1, 1], [2, 0, 0], 'b');
    noUv.geometry.deleteAttribute('uv'); // BoxGeometry 默认带 uv，删除才构成属性集不一致
    template.add(noUv);

    const { source, derived } = extractInstanceSource(template, 'asset_mixed');
    expect(derived).toBe(false);
    expect(source.geometry).toBe(withUv.geometry);
    expect(vertexCount(source.geometry)).toBe(vertexCount(withUv.geometry));
  });

  it('蒙皮部件 → 回退首 Mesh（蒙皮合并丢失骨骼语义，保守不合并）', () => {
    const template = new THREE.Group();
    template.add(part([1, 1, 1], [0, 0, 0], 'base'));
    const skinned = part([1, 1, 1], [1, 0, 0], 'skinned') as THREE.Mesh & { isSkinnedMesh: true };
    skinned.isSkinnedMesh = true;
    template.add(skinned);

    const { source, derived } = extractInstanceSource(template, 'asset_skinned');
    expect(derived).toBe(false);
    expect(source.geometry).toBe((template.children[0] as THREE.Mesh).geometry);
  });

  it('模板无 Mesh → throw（reject 语义不变）', () => {
    const template = new THREE.Group();
    expect(() => extractInstanceSource(template, 'asset_empty')).toThrow(/无可实例化 Mesh/);
  });
});
