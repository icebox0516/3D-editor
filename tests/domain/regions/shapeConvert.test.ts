/**
 * tests/domain/regions/shapeConvert.test.ts —— 形状类型切换与参数化重生成纯函数测试（T6.6，先测后码）。
 *
 * 覆盖（任务书 §几何：切换按包围盒/中心自动转换顶点，规则用测试锁定）：
 * - convertShape：七类目标转换矩阵——rectangle=包围盒四角（options 缓存 width/height/centerX/centerY）、
 *   circle=包围盒中心+半径 max(w,h)/2（options 缓存 radius/segments，segments 尊重源 options）、
 *   ellipse=包围盒两半轴（radiusX/radiusY/segments）、polygon/freehand=点列原样（closed=true）、
 *   line=点列原样（closed=false）、point=首点；baseHeight 恒保留；同类型转换=等值拷贝；
 *   空/退化点列防御（不抛错：退化时点列原样、不造参数 options）；
 * - bboxOf：空点列退化原点零尺寸；单点零尺寸；
 * - parametricEntriesOf：参数化形状（矩形/圆/椭圆）可编辑参数清单（options 优先、缺失按点列
 *   包围盒反推）；非参数化形状（polygon/freehand/line/point）返回 null；
 * - applyParametricValue：单参数重生成点列（圆/椭圆保持中心、矩形保持中心）+ 合并 options
 *   （segments 等未改键保留）；非法输入（非参数化形状 / 非正数值）返回等值拷贝不动。
 * 边界：纯数据测试，零渲染；点列不重复闭合点（closed 由 shape.closed 表达）。
 */
import { describe, expect, it } from 'vitest';
import type { RegionShape } from '../../../src/domain/regions';
import { DEFAULT_CIRCLE_SEGMENTS } from '../../../src/domain/regions';
import {
  applyParametricValue,
  bboxOf,
  convertShape,
  parametricEntriesOf,
} from '../../../src/domain/regions/shapeConvert';

/** 4×3 矩形域（bbox：w=4 h=3 center=(2,1.5)；面积 12、周长 14） */
function makeShape(overrides: Partial<RegionShape> = {}): RegionShape {
  return {
    type: 'polygon',
    points: [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 3 },
      { x: 0, y: 3 },
    ],
    baseHeight: 0.5,
    closed: true,
    ...overrides,
  };
}

describe('bboxOf：点列 → 包围盒', () => {
  it('常规点列：min/max/宽高/中心', () => {
    expect(bboxOf(makeShape().points)).toEqual({
      minX: 0,
      minY: 0,
      maxX: 4,
      maxY: 3,
      width: 4,
      height: 3,
      centerX: 2,
      centerY: 1.5,
    });
  });

  it('空点列防御：退化原点零尺寸（不抛错）', () => {
    expect(bboxOf([])).toEqual({
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0,
      centerX: 0,
      centerY: 0,
    });
  });

  it('单点：零尺寸包围盒，中心即该点', () => {
    expect(bboxOf([{ x: 7, y: -2 }])).toMatchObject({ width: 0, height: 0, centerX: 7, centerY: -2 });
  });
});

describe('convertShape：七类目标转换矩阵', () => {
  it('→ rectangle：包围盒四角（逆时针）+ options 缓存 width/height/centerX/centerY', () => {
    const next = convertShape(makeShape(), 'rectangle');
    expect(next.type).toBe('rectangle');
    expect(next.closed).toBe(true);
    expect(next.points).toEqual([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 3 },
      { x: 0, y: 3 },
    ]);
    expect(next.options).toEqual({ width: 4, height: 3, centerX: 2, centerY: 1.5 });
  });

  it('→ circle：半径 = max(w,h)/2、圆心 = 包围盒中心、64 段；options 缓存 radius/segments', () => {
    const next = convertShape(makeShape(), 'circle');
    expect(next.type).toBe('circle');
    expect(next.closed).toBe(true);
    expect(next.points).toHaveLength(DEFAULT_CIRCLE_SEGMENTS);
    // circlePoints 首点在正 X 轴：平移到中心后 = (centerX + r, centerY)
    expect(next.points[0]).toEqual({ x: 4, y: 1.5 });
    expect(next.options).toEqual({ radius: 2, segments: DEFAULT_CIRCLE_SEGMENTS });
  });

  it('→ ellipse：segments 尊重源 options（参数化形状互转沿用绘制缓存段数）', () => {
    const source = makeShape({ type: 'circle', options: { radius: 1, segments: 32 } });
    const next = convertShape(source, 'ellipse');
    expect(next.points).toHaveLength(32);
    expect(next.options).toMatchObject({ segments: 32 });
  });

  it('→ ellipse：两半轴 = 包围盒半宽/半高；options 缓存 radiusX/radiusY/segments', () => {
    const next = convertShape(makeShape(), 'ellipse');
    expect(next.type).toBe('ellipse');
    expect(next.points).toHaveLength(DEFAULT_CIRCLE_SEGMENTS);
    expect(next.points[0]).toEqual({ x: 4, y: 1.5 });
    expect(next.options).toEqual({
      radiusX: 2,
      radiusY: 1.5,
      segments: DEFAULT_CIRCLE_SEGMENTS,
    });
  });

  it('→ polygon / freehand：点列原样、closed=true、options 清空', () => {
    for (const targetType of ['polygon', 'freehand'] as const) {
      const source = makeShape({ type: 'circle', options: { radius: 9, segments: 32 } });
      const next = convertShape(source, targetType);
      expect(next.type).toBe(targetType);
      expect(next.closed).toBe(true);
      expect(next.points).toEqual(source.points);
      expect(next.options).toBeUndefined();
    }
  });

  it('→ line：点列原样、closed=false', () => {
    const next = convertShape(makeShape(), 'line');
    expect(next.type).toBe('line');
    expect(next.closed).toBe(false);
    expect(next.points).toEqual(makeShape().points);
    expect(next.options).toBeUndefined();
  });

  it('→ point：取首点、closed=false', () => {
    const next = convertShape(makeShape(), 'point');
    expect(next.type).toBe('point');
    expect(next.closed).toBe(false);
    expect(next.points).toEqual([{ x: 0, y: 0 }]);
    expect(next.options).toBeUndefined();
  });

  it('baseHeight 恒保留（任何目标类型）', () => {
    expect(convertShape(makeShape(), 'line').baseHeight).toBe(0.5);
    expect(convertShape(makeShape(), 'point').baseHeight).toBe(0.5);
  });

  it('同类型转换：等值拷贝（新引用，不共享点对象/options）', () => {
    const source = makeShape({ type: 'circle', options: { radius: 2, segments: 32 } });
    const next = convertShape(source, 'circle');
    expect(next).toEqual(source);
    expect(next.points).not.toBe(source.points);
    expect(next.points[0]).not.toBe(source.points[0]);
    expect(next.options).not.toBe(source.options);
  });

  it('空点列防御：→ point 取包围盒中心（原点）；→ rectangle 点列原样、不造 options', () => {
    const empty = makeShape({ points: [] });
    expect(() => convertShape(empty, 'point')).not.toThrow();
    expect(convertShape(empty, 'point').points).toEqual([{ x: 0, y: 0 }]);
    const rect = convertShape(empty, 'rectangle');
    expect(rect.points).toEqual([]);
    expect(rect.options).toBeUndefined();
    expect(() => convertShape(empty, 'circle')).not.toThrow();
  });

  it('单点退化（零尺寸包围盒）→ 参数化形状：点列原样、不造 options（不虚构几何）', () => {
    const single = makeShape({ points: [{ x: 7, y: -2 }] });
    for (const targetType of ['rectangle', 'circle', 'ellipse'] as const) {
      const next = convertShape(single, targetType);
      expect(next.type).toBe(targetType);
      expect(next.points).toEqual([{ x: 7, y: -2 }]);
      expect(next.options).toBeUndefined();
    }
  });
});

describe('parametricEntriesOf：参数化形状可编辑参数', () => {
  it('rectangle：options 优先', () => {
    const shape = makeShape({
      type: 'rectangle',
      options: { width: 10, height: 6, centerX: 5, centerY: 3 },
    });
    expect(parametricEntriesOf(shape)).toEqual([
      { key: 'width', value: 10 },
      { key: 'height', value: 6 },
    ]);
  });

  it('rectangle：options 缺失按点列包围盒反推', () => {
    const shape = makeShape({ type: 'rectangle' });
    expect(parametricEntriesOf(shape)).toEqual([
      { key: 'width', value: 4 },
      { key: 'height', value: 3 },
    ]);
  });

  it('circle：radius options 优先；缺失按包围盒反推 max(w,h)/2', () => {
    expect(parametricEntriesOf(makeShape({ type: 'circle', options: { radius: 5, segments: 64 } }))).toEqual([
      { key: 'radius', value: 5 },
    ]);
    expect(parametricEntriesOf(makeShape({ type: 'circle' }))).toEqual([{ key: 'radius', value: 2 }]);
  });

  it('ellipse：半轴逐键反推（部分缺失按包围盒兜底）', () => {
    expect(
      parametricEntriesOf(makeShape({ type: 'ellipse', options: { radiusX: 8, segments: 64 } })),
    ).toEqual([
      { key: 'radiusX', value: 8 },
      { key: 'radiusY', value: 1.5 },
    ]);
  });

  it('非参数化形状（polygon/freehand/line/point）返回 null', () => {
    for (const type of ['polygon', 'freehand', 'line', 'point'] as const) {
      expect(parametricEntriesOf(makeShape({ type, closed: false }))).toBeNull();
    }
  });
});

describe('applyParametricValue：单参数重生成点列', () => {
  it('circle 半径：保持中心、重生成 64 点、options 更新且 segments 保留', () => {
    const source = makeShape({
      type: 'circle',
      points: [{ x: 0, y: 0 }], // 退化防御：中心由包围盒反推（此处原点）
      options: { radius: 1, segments: 32 },
    });
    const next = applyParametricValue(source, 'radius', 7);
    expect(next.type).toBe('circle');
    expect(next.options).toEqual({ radius: 7, segments: 32 });
    expect(next.points).toHaveLength(32);
    expect(next.points[0]).toEqual({ x: 7, y: 0 });
    expect(next.baseHeight).toBe(0.5);
    expect(next.closed).toBe(true);
  });

  it('circle：options 缺 segments → 用缺省 64 段', () => {
    const source = makeShape({ type: 'circle', options: { radius: 1 } });
    expect(applyParametricValue(source, 'radius', 3).points).toHaveLength(DEFAULT_CIRCLE_SEGMENTS);
  });

  it('ellipse 改短半轴：中心保持、另一轴与 segments 保留', () => {
    // 预置一个中心 (2,1.5) 的椭圆
    const source = convertShape(makeShape(), 'ellipse');
    const next = applyParametricValue(source, 'radiusY', 5);
    expect(next.options).toMatchObject({ radiusX: 2, radiusY: 5, segments: DEFAULT_CIRCLE_SEGMENTS });
    expect(next.points[0]).toEqual({ x: 4, y: 1.5 }); // 长半轴端点不动（中心未变）
  });

  it('rectangle 改宽度：中心与高度保留、四角重生成', () => {
    const source = convertShape(makeShape(), 'rectangle'); // 中心 (2,1.5) 4×3
    const next = applyParametricValue(source, 'width', 10);
    expect(next.options).toEqual({ width: 10, height: 3, centerX: 2, centerY: 1.5 });
    expect(next.points).toEqual([
      { x: -3, y: 0 },
      { x: 7, y: 0 },
      { x: 7, y: 3 },
      { x: -3, y: 3 },
    ]);
  });

  it('rectangle：options 缺中心 → 按点列包围盒中心', () => {
    const source = makeShape({ type: 'rectangle' }); // 无 options，中心 (2,1.5)
    const next = applyParametricValue(source, 'height', 8);
    expect(next.options).toEqual({ width: 4, height: 8, centerX: 2, centerY: 1.5 });
  });

  it('非法输入防御：非参数化形状 / 非正数值 / 非有限值 → 等值拷贝不动', () => {
    const polygon = makeShape();
    expect(applyParametricValue(polygon, 'radius', 5)).toEqual(polygon);
    const circle = makeShape({ type: 'circle', options: { radius: 2, segments: 64 } });
    expect(applyParametricValue(circle, 'radius', 0)).toEqual(circle);
    expect(applyParametricValue(circle, 'radius', -1)).toEqual(circle);
    expect(applyParametricValue(circle, 'radius', Number.NaN)).toEqual(circle);
    expect(applyParametricValue(circle, 'unknown', 5)).toEqual(circle);
  });
});
