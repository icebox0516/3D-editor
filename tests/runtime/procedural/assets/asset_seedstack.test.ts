/**
 * tests/runtime/procedural/assets/asset_seedstack.test.ts —— DEV 参数化资产测试（T008.1）。
 *
 * 覆盖：
 * - meta 契约：id / DEV 分类 / shapeFamily size 4 / triangleCount 上界声明 / variants；
 * - build 级 seed 语义（不涉对象 seed）：同 morphSeed 两次 build 逐位同结果
 *   （position/uv/color 数组全等）；异 morphSeed 异形态（数组不同）；
 * - 无参调用确定性（固定缺省 seed：缩略图/旧通路）；
 * - 几何纪律：三角面 ≤ meta.triangleCount（≤100 面预算）、样本内上界可达、
 *   原点 = 底面中心（boundingBox.minY = 0 贴地语义）、单材质单值形态（非数组）。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { build, meta } from '../../../../src/runtime/procedural/assets/asset_seedstack.asset';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';

/** 释放一次 build 产物的全部资源 */
function disposeSource(source: InstanceSource): void {
  source.geometry.dispose();
  if (Array.isArray(source.material)) {
    for (const material of source.material) material.dispose();
  } else {
    source.material.dispose();
  }
}

/** 索引几何三角面实数 */
function triangleCountOf(geometry: THREE.BufferGeometry): number {
  const index = geometry.getIndex();
  const position = geometry.getAttribute('position');
  return (index ? index.count : position.count) / 3;
}

describe('meta 契约', () => {
  it('id / DEV 分类 / shapeFamily / variants / 面数声明齐备', () => {
    expect(meta.id).toBe('asset_seedstack');
    expect(meta.category).toBe('dev');
    expect(meta.shapeFamily).toEqual({ size: 4 });
    expect(meta.variants).toBeDefined();
    expect(meta.triangleCount).toBe(72);
  });
});

describe('build 级 seed 语义（D19.2 参数化契约）', () => {
  it('同 morphSeed 两次 build：position / uv / color 数组逐位全等', () => {
    const a = build({ seed: 12345 });
    const b = build({ seed: 12345 });
    try {
      expect(a.geometry.getAttribute('position').array).toEqual(
        b.geometry.getAttribute('position').array,
      );
      expect(a.geometry.getAttribute('uv').array).toEqual(b.geometry.getAttribute('uv').array);
      expect(a.geometry.getAttribute('color').array).toEqual(
        b.geometry.getAttribute('color').array,
      );
    } finally {
      disposeSource(a);
      disposeSource(b);
    }
  });

  it('异 morphSeed 异形态：position 与 color 数组均不同（build 级 seed，不涉对象 seed）', () => {
    const a = build({ seed: 1 });
    const b = build({ seed: 2 });
    try {
      expect(a.geometry.getAttribute('position').array).not.toEqual(
        b.geometry.getAttribute('position').array,
      );
      expect(a.geometry.getAttribute('color').array).not.toEqual(
        b.geometry.getAttribute('color').array,
      );
    } finally {
      disposeSource(a);
      disposeSource(b);
    }
  });

  it('无参调用确定性：两次 build() 逐位同结果（固定缺省 seed）', () => {
    const a = build();
    const b = build();
    try {
      expect(a.geometry.getAttribute('position').array).toEqual(
        b.geometry.getAttribute('position').array,
      );
    } finally {
      disposeSource(a);
      disposeSource(b);
    }
  });

  it('每次调用构造新资源（geometry / material 引用不同——缓存契约）', () => {
    const a = build({ seed: 9 });
    const b = build({ seed: 9 });
    try {
      expect(b.geometry).not.toBe(a.geometry);
      expect(b.material).not.toBe(a.material);
    } finally {
      disposeSource(a);
      disposeSource(b);
    }
  });
});

describe('几何纪律', () => {
  it('三角面 ≤ meta.triangleCount（≤100 面预算）；样本内上界可达（6 层 × 12 面）', () => {
    let max = 0;
    for (let seed = 0; seed < 50; seed++) {
      const source = build({ seed });
      const tris = triangleCountOf(source.geometry);
      expect(tris).toBeLessThanOrEqual(meta.triangleCount!);
      expect(tris).toBeLessThanOrEqual(100);
      max = Math.max(max, tris);
      disposeSource(source);
    }
    expect(max).toBe(meta.triangleCount); // 声明 = 实测上界（层数上限 6 的样本确定性）
  });

  it('原点 = 底面中心：boundingBox.minY = 0（首层底缘贴地）', () => {
    for (const seed of [0, 7, 4242]) {
      const source = build({ seed });
      try {
        source.geometry.computeBoundingBox();
        expect(source.geometry.boundingBox?.min.y).toBeCloseTo(0, 5);
        expect(source.geometry.boundingBox?.max.y).toBeGreaterThan(0.8); // 4 层下限 > 0.88、上界 > 2
      } finally {
        disposeSource(source);
      }
    }
  });

  it('单材质单值形态（非数组）+ vertexColors', () => {
    const source = build({ seed: 55 });
    try {
      expect(Array.isArray(source.material)).toBe(false);
      const material = source.material as THREE.MeshStandardMaterial;
      expect(material.vertexColors).toBe(true);
    } finally {
      disposeSource(source);
    }
  });
});
