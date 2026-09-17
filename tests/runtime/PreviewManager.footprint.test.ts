/**
 * tests/runtime/PreviewManager.footprint.test.ts —— 足迹幽灵预览测试（T7.6 R6，先测后码）。
 *
 * 覆盖：
 * - showFootprints：每足迹一个矩形线框（Line）+ 轻填充面（Mesh），位于默认抬升 0.25
 *   （与绘制预览一致）或自定义 elevation；零/负尺寸足迹跳过（防退化几何）；
 * - 整组替换语义：再次 showFootprints 重建（旧几何释放）；
 * - clearFootprints：移除并释放；空数组等价清空；
 * - dispose：足迹组随预览组一并清理（几何释放、共享材质不受影响——draw preview 仍可用）。
 * 边界：three 场景图纯 JS 可在 node 构造（不渲染）；几何释放经 geometry.dispose 间谍断言。
 */
import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { PreviewManager } from '../../src/runtime/services/PreviewManager';

function makeManager(): { scene: THREE.Scene; manager: PreviewManager } {
  const scene = new THREE.Scene();
  const manager = new PreviewManager(scene, null);
  return { scene, manager };
}

/** 预览容器组 */
function previewGroup(scene: THREE.Scene): THREE.Group {
  const group = scene.children.find((c) => (c as THREE.Group).name === '__preview__') as
    | THREE.Group
    | undefined;
  expect(group).toBeDefined();
  return group!;
}

/** 容器内足迹子组（showFootprints 挂载） */
function footprintGroup(scene: THREE.Scene): THREE.Group | undefined {
  return previewGroup(scene).children.find(
    (c) => (c as THREE.Group).name === '__footprints__',
  ) as THREE.Group | undefined;
}

describe('PreviewManager.showFootprints / clearFootprints（足迹幽灵）', () => {
  it('每足迹 = 线框 + 填充面，中心/尺寸/默认抬升 0.25 生效', () => {
    const { scene, manager } = makeManager();
    manager.showFootprints([
      { center: { x: 10, y: 5 }, size: { x: 8, y: 4 } },
      { center: { x: 0, y: 0 }, size: { x: 2, y: 2 }, elevation: 0.6 },
    ]);

    const group = footprintGroup(scene);
    expect(group).toBeDefined();
    // 每足迹 Line + Mesh 两个子对象
    expect(group!.children).toHaveLength(4);
    const line = group!.children.find((c) => c.type === 'Line')!;
    expect(line).toBeDefined();
    expect(line.position).toEqual(new THREE.Vector3(10, 0.25, 5));
    const fill = group!.children.find((c) => c.type === 'Mesh')!;
    expect(fill).toBeDefined();
    expect(fill.position).toEqual(new THREE.Vector3(10, 0.25, 5));

    const custom = group!.children.filter((c) => c.position.y === 0.6);
    expect(custom).toHaveLength(2); // 自定义抬升的线框 + 填充
  });

  it('整组替换：再次 showFootprints 重建（旧几何 dispose）', () => {
    const { scene, manager } = makeManager();
    manager.showFootprints([{ center: { x: 0, y: 0 }, size: { x: 4, y: 4 } }]);
    const firstGeometries = footprintGroup(scene)!.children.map((c) => {
      const spy = vi.spyOn((c as THREE.Mesh | THREE.Line).geometry, 'dispose');
      return { spy, geometry: (c as THREE.Mesh | THREE.Line).geometry };
    });

    manager.showFootprints([
      { center: { x: 1, y: 1 }, size: { x: 2, y: 2 } },
      { center: { x: 9, y: 9 }, size: { x: 2, y: 2 } },
    ]);
    const group = footprintGroup(scene)!;
    expect(group.children).toHaveLength(4); // 2 × (Line + Mesh)
    for (const { spy } of firstGeometries) expect(spy).toHaveBeenCalled();
  });

  it('零/负尺寸足迹跳过（防退化几何）', () => {
    const { scene, manager } = makeManager();
    manager.showFootprints([
      { center: { x: 0, y: 0 }, size: { x: 0, y: 0 } },
      { center: { x: 0, y: 0 }, size: { x: -1, y: 2 } },
      { center: { x: 5, y: 5 }, size: { x: 2, y: 2 } },
    ]);
    expect(footprintGroup(scene)!.children).toHaveLength(2); // 仅一个合法足迹
  });

  it('clearFootprints：移除足迹组并释放几何；空数组等价清空', () => {
    const { scene, manager } = makeManager();
    manager.showFootprints([{ center: { x: 0, y: 0 }, size: { x: 2, y: 2 } }]);
    const geometry = (footprintGroup(scene)!.children[0] as THREE.Line).geometry;
    const disposeSpy = vi.spyOn(geometry, 'dispose');

    manager.clearFootprints();
    expect(footprintGroup(scene)).toBeUndefined();
    expect(disposeSpy).toHaveBeenCalled();

    manager.showFootprints([{ center: { x: 0, y: 0 }, size: { x: 2, y: 2 } }]);
    manager.showFootprints([]);
    expect(footprintGroup(scene)).toBeUndefined();
  });

  it('足迹清理不影响绘制预览通道（共享材质单一实例）', () => {
    const { scene, manager } = makeManager();
    manager.updateDrawPreview({
      geometryType: 'LineString',
      points: [
        { x: 0, y: 0 },
        { x: 5, y: 0 },
      ],
      cursor: null,
      closed: false,
    });
    manager.showFootprints([{ center: { x: 0, y: 0 }, size: { x: 2, y: 2 } }]);
    manager.clearFootprints();
    // 绘制预览线仍在（预览组内）
    const kinds = previewGroup(scene).children.map((c) => c.type);
    expect(kinds).toContain('Line');
    manager.dispose();
  });
});
