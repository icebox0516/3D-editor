/**
 * domain/regions/shapeConvert —— 形状类型切换与参数化重生成纯函数（阶段 6 T6.6）。
 *
 * 职责：
 *  - convertShape：RegionShape → 目标形状类型（七类互转）——切换后顶点按包围盒/中心自动转换
 *    （需求《绘制需求变更.md》§三「形状类型可切换」）：rectangle=包围盒四角（options 缓存
 *    width/height/centerX/centerY）、circle=包围盒中心+半径 max(w,h)/2（options 缓存
 *    radius/segments，segments 尊重源 options）、ellipse=包围盒两半轴（radiusX/radiusY/segments）、
 *    polygon/freehand=点列原样（closed=true）、line=点列原样（closed=false）、point=首点
 *    （空点列取包围盒中心=原点）；baseHeight 恒保留；点列不重复闭合点。
 *  - parametricEntriesOf / applyParametricValue：参数化形状（矩形/圆/椭圆）的可编辑参数清单
 *    与单参数重生成（面板「几何」组圆半径/椭圆两半轴/矩形长宽编辑 → 经 shapePoints 纯函数
 *    重生成点列 + 更新 options，单条 ChangeShapeCommand 的数据准备）。
 * 边界：纯函数、零渲染；**不构造 RegionObject、不改语义/样式层**（三层解耦，分域契约 §A）；
 *      空/退化点列防御（零尺寸包围盒 → 目标为参数化形状时点列原样、不虚构 options）；
 *      参数初值 options 优先、缺失按点列包围盒反推（§0 参数化形状点生成归 domain 先例）。
 */
import type { Vec2 } from '../../core/types';
import { deepClone } from '../../core/utils';
import type { RegionShape, ShapeType } from './RegionObject';
import {
  DEFAULT_CIRCLE_SEGMENTS,
  circlePoints,
  ellipsePoints,
  rectanglePoints,
} from './shapePoints';

// ── 包围盒 ──────────────────────────────────────────────────

/** 点列包围盒（宽高为零尺寸退化；空点列 = 原点零尺寸，不抛错） */
export interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/** 点列 → 包围盒（空点列退化原点零尺寸） */
export function bboxOf(points: readonly Vec2[]): BBox {
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;
  if (points.length > 0) {
    minX = maxX = points[0]!.x;
    minY = maxY = points[0]!.y;
    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

// ── options 读取助手 ────────────────────────────────────────

/** options 数值键读取（非有限数值视为缺失） */
function readNumber(options: Record<string, unknown> | undefined, key: string): number | undefined {
  const raw = options?.[key];
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : undefined;
}

/** 分段数读取（合法整数 ≥3 才透传，否则缺省 64） */
function readSegments(options: Record<string, unknown> | undefined): number {
  const raw = readNumber(options, 'segments');
  return raw !== undefined && Number.isInteger(raw) && raw >= 3 ? raw : DEFAULT_CIRCLE_SEGMENTS;
}

/** 点列深拷贝 */
function clonePoints(points: readonly Vec2[]): Vec2[] {
  return points.map((p) => ({ x: p.x, y: p.y }));
}

/** 以原点为中心的点列平移到 center（circlePoints/ellipsePoints 的配套，沿 DrawCircleTool 先例） */
function translateTo(points: readonly Vec2[], center: Vec2): Vec2[] {
  return points.map((p) => ({ x: center.x + p.x, y: center.y + p.y }));
}

// ── 形状类型切换 ────────────────────────────────────────────

/**
 * 形状类型切换：按包围盒/中心自动转换顶点（规则见模块头）。同类型 = 等值拷贝；
 * 退化点列（空/单点 → 零尺寸包围盒）目标为参数化形状时点列原样、不造 options（不虚构几何）；
 * baseHeight 恒保留；点列与 options 均为新引用（调用方可直接作 ChangeShapeCommand 载荷）。
 */
export function convertShape(shape: RegionShape, targetType: ShapeType): RegionShape {
  if (shape.type === targetType) {
    return {
      type: shape.type,
      points: clonePoints(shape.points),
      baseHeight: shape.baseHeight,
      closed: shape.closed,
      options: shape.options === undefined ? undefined : deepClone(shape.options),
    };
  }

  const base = { baseHeight: shape.baseHeight };
  const box = bboxOf(shape.points);
  const center = { x: box.centerX, y: box.centerY };
  const degenerate = box.width <= 0 || box.height <= 0;

  switch (targetType) {
    case 'rectangle': {
      if (degenerate) {
        return { type: 'rectangle', points: clonePoints(shape.points), closed: true, ...base };
      }
      return {
        type: 'rectangle',
        points: rectanglePoints(box.width, box.height, center),
        closed: true,
        options: { width: box.width, height: box.height, centerX: center.x, centerY: center.y },
        ...base,
      };
    }
    case 'circle': {
      if (degenerate) {
        return { type: 'circle', points: clonePoints(shape.points), closed: true, ...base };
      }
      const radius = Math.max(box.width, box.height) / 2;
      const segments = readSegments(shape.options);
      return {
        type: 'circle',
        points: translateTo(circlePoints(radius, segments), center),
        closed: true,
        options: { radius, segments },
        ...base,
      };
    }
    case 'ellipse': {
      if (degenerate) {
        return { type: 'ellipse', points: clonePoints(shape.points), closed: true, ...base };
      }
      const radiusX = box.width / 2;
      const radiusY = box.height / 2;
      const segments = readSegments(shape.options);
      return {
        type: 'ellipse',
        points: translateTo(ellipsePoints(radiusX, radiusY, segments), center),
        closed: true,
        options: { radiusX, radiusY, segments },
        ...base,
      };
    }
    case 'polygon':
    case 'freehand':
      return { type: targetType, points: clonePoints(shape.points), closed: true, ...base };
    case 'line':
      return { type: 'line', points: clonePoints(shape.points), closed: false, ...base };
    case 'point': {
      const first = shape.points[0];
      return {
        type: 'point',
        points: [first ? { x: first.x, y: first.y } : { x: center.x, y: center.y }],
        closed: false,
        ...base,
      };
    }
  }
}

// ── 参数化形状编辑 ──────────────────────────────────────────

/** 参数化形状可编辑参数（面板「几何」组控件初值；options 优先、缺失按点列包围盒反推） */
export interface ParametricEntry {
  key: string;
  value: number;
}

/** 参数化形状（矩形/圆/椭圆）→ 可编辑参数清单；非参数化形状（polygon/freehand/line/point）返回 null */
export function parametricEntriesOf(shape: RegionShape): ParametricEntry[] | null {
  const box = bboxOf(shape.points);
  const fromOptions = (key: string, fallback: number): number =>
    readNumber(shape.options, key) ?? fallback;
  switch (shape.type) {
    case 'rectangle':
      return [
        { key: 'width', value: fromOptions('width', box.width) },
        { key: 'height', value: fromOptions('height', box.height) },
      ];
    case 'circle':
      return [{ key: 'radius', value: fromOptions('radius', Math.max(box.width, box.height) / 2) }];
    case 'ellipse':
      return [
        { key: 'radiusX', value: fromOptions('radiusX', box.width / 2) },
        { key: 'radiusY', value: fromOptions('radiusY', box.height / 2) },
      ];
    default:
      return null;
  }
}

/** 等值拷贝（非法输入防御的返回值） */
function copyOf(shape: RegionShape): RegionShape {
  return convertShape(shape, shape.type);
}

/**
 * 单参数重生成：改值 → 经 shapePoints 纯函数重生成点列（中心保持：圆/椭圆取当前点列包围盒
 * 中心、矩形取 options 中心·缺失按包围盒）+ 合并更新 options（segments 等未改键保留）。
 * 非参数化形状 / 未知参数键 / 非正非有限数值 → 等值拷贝不动（防御，不抛错）。
 */
export function applyParametricValue(shape: RegionShape, key: string, value: number): RegionShape {
  if (!Number.isFinite(value) || value <= 0) return copyOf(shape);
  const options = shape.options ?? {};
  const box = bboxOf(shape.points);
  const segments = readSegments(options);
  const keepCenter = (): Vec2 => ({
    x: readNumber(options, 'centerX') ?? box.centerX,
    y: readNumber(options, 'centerY') ?? box.centerY,
  });

  switch (shape.type) {
    case 'rectangle': {
      if (key !== 'width' && key !== 'height') return copyOf(shape);
      const center = keepCenter();
      const width = key === 'width' ? value : readNumber(options, 'width') ?? box.width;
      const height = key === 'height' ? value : readNumber(options, 'height') ?? box.height;
      return {
        type: 'rectangle',
        points: rectanglePoints(width, height, center),
        baseHeight: shape.baseHeight,
        closed: true,
        options: { width, height, centerX: center.x, centerY: center.y },
      };
    }
    case 'circle': {
      if (key !== 'radius') return copyOf(shape);
      const center = { x: box.centerX, y: box.centerY };
      return {
        type: 'circle',
        points: translateTo(circlePoints(value, segments), center),
        baseHeight: shape.baseHeight,
        closed: true,
        options: { radius: value, segments },
      };
    }
    case 'ellipse': {
      if (key !== 'radiusX' && key !== 'radiusY') return copyOf(shape);
      const center = { x: box.centerX, y: box.centerY };
      const radiusX = key === 'radiusX' ? value : readNumber(options, 'radiusX') ?? box.width / 2;
      const radiusY = key === 'radiusY' ? value : readNumber(options, 'radiusY') ?? box.height / 2;
      return {
        type: 'ellipse',
        points: translateTo(ellipsePoints(radiusX, radiusY, segments), center),
        baseHeight: shape.baseHeight,
        closed: true,
        options: { radiusX, radiusY, segments },
      };
    }
    default:
      return copyOf(shape);
  }
}
