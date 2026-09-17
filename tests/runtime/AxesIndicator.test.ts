/**
 * tests/runtime/AxesIndicator.test.ts —— 左下角坐标轴指示器结构测试（T5.7，先测后码）。
 *
 * node 无 DOM/WebGL：装置传 host=null（无头形态——结构与姿态逻辑可测，渲染与 canvas 归浏览器验收）。
 * 覆盖：
 * - 场景结构：1 条三轴线段（单几何合并，6 顶点）+ 1 个三字符标签网格（3 四边形 12 顶点）——
 *   渲染对象数 2 ≤ 3（draw call 增量上限的装置级锁定）；
 * - 轴配色行业惯例：X 红 / Y 绿 / Z 蓝（顶点色）；
 * - syncFrom：仅同步旋转（四元数），指示器相机位置保持不动；
 * - 标签公告板：update 后每个标签四边形中心仍位于对应轴端附近（面向相机的偏移不改变锚点）；
 * - 开关与生命周期：setVisible 切换渲染资格；dispose 幂等、无头不抛错。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { AxesIndicator, LABEL_INSET } from '../../src/runtime/AxesIndicator';

/** 三轴端点单位向量（标签锚点断言用） */
const AXIS_ENDS: ReadonlyArray<[number, number, number]> = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

function makeIndicator(): AxesIndicator {
  return new AxesIndicator(null);
}

describe('AxesIndicator：场景结构', () => {
  it('两个渲染对象（三轴线段 + 标签网格）——draw call 增量 ≤3 的装置锁定', () => {
    const axes = makeIndicator();
    expect(axes.scene.children.length).toBe(2);
    const renderables = axes.scene.children.filter((c) => (c as THREE.Mesh).isMesh || (c as THREE.Line).isLine);
    expect(renderables.length).toBe(2);
    axes.dispose();
  });

  it('三轴线段：单几何 6 顶点（原点 ×3 + 轴端 ×3），顶点色 X 红 / Y 绿 / Z 蓝', () => {
    const axes = makeIndicator();
    const line = axes.scene.children.find((c) => (c as THREE.Line).isLine) as THREE.LineSegments;
    expect(line).toBeTruthy();
    const position = line.geometry.getAttribute('position') as THREE.BufferAttribute;
    expect(position.count).toBe(6);
    // 顶点偶数位为原点、奇数位为轴端
    expect([position.getX(1), position.getY(1), position.getZ(1)]).toEqual(AXIS_ENDS[0]);
    expect([position.getX(3), position.getY(3), position.getZ(3)]).toEqual(AXIS_ENDS[1]);
    expect([position.getX(5), position.getY(5), position.getZ(5)]).toEqual(AXIS_ENDS[2]);

    const color = line.geometry.getAttribute('color') as THREE.BufferAttribute;
    expect(color).toBeTruthy();
    const axisColor = (i: number): THREE.Color =>
      new THREE.Color(color.getX(i), color.getY(i), color.getZ(i));
    // 行业惯例：X 红 / Y 绿 / Z 蓝（色相断言，不锁具体色值）
    const [xColor, yColor, zColor] = [axisColor(1), axisColor(3), axisColor(5)];
    const hsl = (c: THREE.Color): [number, number, number] => {
      const out = { h: 0, s: 0, l: 0 };
      c.getHSL(out);
      return [out.h, out.s, out.l];
    };
    expect(hsl(xColor)[0]).toBeLessThan(0.08); // 红：色相靠近 0
    expect(hsl(yColor)[0]).toBeGreaterThan(0.25); // 绿
    expect(hsl(yColor)[0]).toBeLessThan(0.5);
    expect(hsl(zColor)[0]).toBeGreaterThan(0.55); // 蓝
    expect(hsl(zColor)[0]).toBeLessThan(0.7);
    axes.dispose();
  });

  it('标签网格：3 个四边形 12 顶点（X/Y/Z 字符贴图的三单元格 UV）', () => {
    const axes = makeIndicator();
    const labels = axes.scene.children.find((c) => (c as THREE.Mesh).isMesh && !(c as THREE.Line).isLine) as THREE.Mesh;
    expect(labels).toBeTruthy();
    const position = labels.geometry.getAttribute('position') as THREE.BufferAttribute;
    expect(position.count).toBe(12);
    const uv = labels.geometry.getAttribute('uv') as THREE.BufferAttribute;
    expect(uv.count).toBe(12);
    axes.dispose();
  });
});

describe('AxesIndicator：姿态同步', () => {
  it('syncFrom：仅复制主相机四元数（旋转），位置保持不动', () => {
    const axes = makeIndicator();
    const main = new THREE.PerspectiveCamera(50, 1, 1, 100);
    main.position.set(60, 50, 80);
    main.lookAt(10, 0, -5);
    main.updateMatrixWorld();

    const before = axes.camera.position.clone();
    axes.syncFrom(main);
    expect(axes.camera.quaternion.equals(main.quaternion)).toBe(true);
    expect(axes.camera.position.equals(before)).toBe(true); // 仅旋转：不跟随主相机位置
    axes.dispose();
  });

  it('update：标签四边形中心保持在对应轴端锚点附近（公告板旋转不改锚点）', () => {
    const axes = makeIndicator();
    const main = new THREE.PerspectiveCamera(50, 1, 1, 100);
    main.position.set(60, 50, 80);
    main.lookAt(0, 0, 0);
    main.updateMatrixWorld();

    axes.syncFrom(main);
    axes.updateLabels();

    const labels = axes.scene.children.find((c) => (c as THREE.Mesh).isMesh) as THREE.Mesh;
    const position = labels.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let quad = 0; quad < 3; quad += 1) {
      const cx = (position.getX(quad * 4) + position.getX(quad * 4 + 2)) / 2;
      const cy = (position.getY(quad * 4) + position.getY(quad * 4 + 2)) / 2;
      const cz = (position.getZ(quad * 4) + position.getZ(quad * 4 + 2)) / 2;
      const [ex, ey, ez] = AXIS_ENDS[quad]!;
      // 中心 = 轴端方向 × LABEL_INSET（公告板只改变朝向，不改变锚点）
      expect(Math.abs(cx - ex * LABEL_INSET)).toBeLessThan(0.3);
      expect(Math.abs(cy - ey * LABEL_INSET)).toBeLessThan(0.3);
      expect(Math.abs(cz - ez * LABEL_INSET)).toBeLessThan(0.3);
    }
    axes.dispose();
  });
});

describe('AxesIndicator：开关与生命周期', () => {
  it('默认可见可渲染；setVisible(false) 后跳过渲染；再开恢复', () => {
    const axes = makeIndicator();
    expect(axes.isRenderable).toBe(true);
    axes.setVisible(false);
    expect(axes.isRenderable).toBe(false);
    axes.setVisible(true);
    expect(axes.isRenderable).toBe(true);
    axes.dispose();
  });

  it('无头形态：render 不抛错（无 WebGLRenderer 时安全空转）', () => {
    const axes = makeIndicator();
    const main = new THREE.PerspectiveCamera(50, 1, 1, 100);
    expect(() => axes.render(main)).not.toThrow();
    axes.dispose();
  });

  it('dispose 幂等；dispose 后不可渲染', () => {
    const axes = makeIndicator();
    axes.dispose();
    axes.dispose();
    expect(axes.isRenderable).toBe(false);
  });
});
