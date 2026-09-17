/**
 * tests/runtime/PreviewManager.draw.test.ts —— 绘制预览 3D 扩展测试（T3.2）。
 *
 * 覆盖：
 * - Line：顶点标记（Points）+ 折线（Line），无填充面；
 * - Polygon：半透明填充面（Mesh）+ 轮廓 + 测面积文字 sprite（Sprite，CanvasTexture）；
 * - 文字 sprite 仅在游标存在（活跃绘制）时显示：2D 框选矩形（SelectTool 经
 *   updateDrawPreview 传入 cursor:null 的闭合矩形）保留为无文字标注的填充预览；
 * - Point：只有顶点标记；
 * - 无 DOM（node 环境）：跳过文字 sprite 不抛错；
 * - clear()：清空全部绘制预览子对象。
 * 边界：three 场景图纯 JS 可在 node 构造（不渲染）；CanvasTexture 用最小 document 桩。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { PreviewManager } from '../../src/runtime/services/PreviewManager';

/** 取 PreviewManager 挂在场景上的预览容器组 */
function previewGroup(scene: THREE.Scene): THREE.Group {
  const group = scene.children.find((c) => (c as THREE.Group).name === '__preview__') as
    | THREE.Group
    | undefined;
  expect(group).toBeDefined();
  return group!;
}

/** 容器内子对象类型列表（如 ['Points','Line','Mesh','Sprite']） */
function childKinds(scene: THREE.Scene): string[] {
  return previewGroup(scene).children.map((c) => c.type);
}

function makeManager(): { scene: THREE.Scene; manager: PreviewManager } {
  const scene = new THREE.Scene();
  const manager = new PreviewManager(scene, null);
  return { scene, manager };
}

/** 最小 2D 上下文桩（font/textBaseline/fillStyle 为可赋值属性） */
function stubDocument(): void {
  const ctx2d = {
    font: '',
    textBaseline: '',
    fillStyle: '',
    clearRect: () => {},
    fillRect: () => {},
    fillText: () => {},
    measureText: (t: string) => ({ width: t.length * 10 }),
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ctx2d,
  };
  vi.stubGlobal('document', { createElement: () => canvas });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PreviewManager 绘制预览 3D 扩展', () => {
  it('LineString：顶点标记 + 折线 + 测长文字 sprite；无填充面', () => {
    stubDocument();
    const { scene, manager } = makeManager();
    manager.updateDrawPreview({
      geometryType: 'LineString',
      points: [
        { x: 0, y: 0 },
        { x: 3, y: 0 },
      ],
      cursor: { x: 3, y: 4 },
      closed: false,
    });

    const kinds = childKinds(scene);
    expect(kinds).toContain('Points');
    expect(kinds).toContain('Line');
    expect(kinds).toContain('Sprite');
    expect(kinds).not.toContain('Mesh');
    manager.dispose();
  });

  it('Polygon：半透明填充面（Mesh）+ 测面积文字 sprite', () => {
    stubDocument();
    const { scene, manager } = makeManager();
    manager.updateDrawPreview({
      geometryType: 'Polygon',
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
      ],
      cursor: { x: 0, y: 4 },
      closed: true,
    });

    const kinds = childKinds(scene);
    expect(kinds).toContain('Mesh');
    expect(kinds).toContain('Sprite');
    expect(kinds).toContain('Points');
    expect(kinds).toContain('Line');

    // 填充材质半透明且双面（贴地面片法线朝下，需 DoubleSide 才可见）
    const mesh = previewGroup(scene).children.find((c) => c.type === 'Mesh') as THREE.Mesh;
    const material = mesh.material as THREE.MeshBasicMaterial;
    expect(material.transparent).toBe(true);
    expect(material.opacity).toBeLessThan(1);
    expect(material.side).toBe(THREE.DoubleSide);
    manager.dispose();
  });

  it('2D 框选矩形保留：cursor:null 的闭合矩形 → 有填充面、无文字 sprite', () => {
    stubDocument();
    const { scene, manager } = makeManager();
    manager.updateDrawPreview({
      geometryType: 'Polygon',
      points: [
        { x: -5, y: -5 },
        { x: 5, y: -5 },
        { x: 5, y: 5 },
        { x: -5, y: 5 },
      ],
      cursor: null,
      closed: true,
    });

    const kinds = childKinds(scene);
    expect(kinds).toContain('Mesh'); // 框选矩形保留（填充）
    expect(kinds).toContain('Line');
    expect(kinds).not.toContain('Sprite'); // 无测度标注
    manager.dispose();
  });

  it('Point：只有顶点标记（无折线/填充/文字）', () => {
    stubDocument();
    const { scene, manager } = makeManager();
    manager.updateDrawPreview({
      geometryType: 'Point',
      points: [{ x: 1, y: 2 }],
      cursor: { x: 3, y: 4 },
      closed: false,
    });

    expect(childKinds(scene)).toEqual(['Points']);
    manager.dispose();
  });

  it('无 DOM 环境（node）：跳过文字 sprite 不抛错，其余预览正常', () => {
    const { scene, manager } = makeManager();
    expect(() =>
      manager.updateDrawPreview({
        geometryType: 'Polygon',
        points: [
          { x: 0, y: 0 },
          { x: 4, y: 0 },
          { x: 4, y: 4 },
        ],
        cursor: { x: 0, y: 4 },
        closed: true,
      }),
    ).not.toThrow();

    const kinds = childKinds(scene);
    expect(kinds).toContain('Mesh');
    expect(kinds).toContain('Line');
    expect(kinds).not.toContain('Sprite');
    manager.dispose();
  });

  it('多次更新复用容器（子对象数不随更新次数增长）', () => {
    stubDocument();
    const { scene, manager } = makeManager();
    for (let i = 0; i < 5; i++) {
      manager.updateDrawPreview({
        geometryType: 'Polygon',
        points: [
          { x: 0, y: 0 },
          { x: i + 1, y: 0 },
          { x: i + 1, y: i + 1 },
        ],
        cursor: { x: 0, y: i + 1 },
        closed: true,
      });
    }
    expect(previewGroup(scene).children).toHaveLength(4); // Points + Line + Mesh + Sprite
    manager.dispose();
  });

  it('clear()：清空全部绘制预览子对象', () => {
    stubDocument();
    const { scene, manager } = makeManager();
    manager.updateDrawPreview({
      geometryType: 'Polygon',
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
      ],
      cursor: { x: 0, y: 4 },
      closed: true,
    });
    expect(previewGroup(scene).children.length).toBeGreaterThan(0);

    manager.clear();
    expect(previewGroup(scene).children).toHaveLength(0);
    manager.dispose();
  });
});
