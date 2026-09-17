/**
 * runtime/geometry/GeometryBuilder —— RegionShape+RegionSemantic → THREE.BufferGeometry（T6.4）。
 *
 * 职责（分域契约 stage6-region.md §C「几何构建」）：
 *   GeometryBuilder(shape, semantic) → BufferGeometry——参数化点列（来自 T6.1 domain 纯函数，
 *   展开结果已存于 shape.points）→ 三角化/UV/法线；baseHeight → y 平移（高度合成规则 §A：
 *   最终 y = shape.baseHeight + transform.position.y，position.y 由对象 transform 供给，
 *   不在此叠加）；道路带宽面在此生成（读 semantic.properties.width）——样式插件不做业务几何；
 *   带宽生成仅对 shape.type='line'：polygon 形状 + road 语义走平面贴地渲染（width 忽略）；
 *   building 立体挤出不属于本构建器（由 building 预设 build 内按 height 实现，
 *   其基座偏移由 R6 修复读取本构建器产出的 boundingBox.min.y）。
 * 形状分派：
 *   - 面类五形状（polygon/rectangle/circle/ellipse/freehand）→ polygonSurfaceGeometry
 *     （ShapeGeometry 三角化；UV 世界坐标尺度（米）= ShapeGeometry 自带 (x, -z)；法线朝上）；
 *   - line → centerlineRibbonGeometry（恒产条带几何）+ 沿中心线累计长度 UV（R10）；
 *   - point → 非退化锚点小四边形（R4：poi 预设自会忽略该几何，通用预设落在 point 上
 *     仍有可见锚点）。
 * 边界：输入 domain 纯数据（只读，不修改入参）；输出几何归调用方（RegionRenderer 创建并
 *      拥有、负责释放——types.ts 授权规则 2）；退化输入（面类 <3 点 / line <2 点）返回
 *      空几何不抛错（上游 validateRegionShape 拦截，此处防御兜底）。
 */
import type { RegionSemantic, RegionShape } from '../../domain/regions';
import * as THREE from 'three';
import { centerlineRibbonGeometry, polygonSurfaceGeometry } from '../renderers/geometryBuilders';

/**
 * line 形状带宽缺省值（R3）。
 * 依据：v1 registries/definitions/road.ts centerline 模式默认宽 6m，
 * 与 domain semanticDefinitions road.width 默认值 6 一致。
 * 仅当 semantic.properties.width 为有限数且 > 0 时采用自定义宽度，否则回退本缺省。
 */
export const DEFAULT_LINE_WIDTH = 6;

/**
 * point 形状锚点四边形边长（米，R4：0.2–0.5m 量级取中值 0.3）。
 * 非退化保证：通用预设（default_solid 等）落在 point 上仍有可见锚点。
 */
export const POINT_ANCHOR_SIZE = 0.3;

/** 读取 line 带宽：有限数且 > 0 才采用，否则回退缺省（R3） */
function readLineWidth(semantic: RegionSemantic): number {
  const width = semantic.properties.width;
  return typeof width === 'number' && Number.isFinite(width) && width > 0 ? width : DEFAULT_LINE_WIDTH;
}

/**
 * 条带几何补 UV（R10）：centerlineRibbonGeometry 顶点布局为 left[i]/right[i] 交错
 * （索引 2i / 2i+1）；s = 沿中心线累计长度（米）、t = 横向（left=0 / right=1）。
 * 点列过滤规则与 centerlineRibbonGeometry 内部一致（Number.isFinite）。
 */
function applyRibbonUV(geometry: THREE.BufferGeometry, points: readonly { x: number; y: number }[]): void {
  const position = geometry.getAttribute('position');
  if (!position || position.count === 0) return;
  const pts = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  const uv = new Float32Array(pts.length * 2 * 2);
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    if (i > 0) {
      const prev = pts[i - 1]!;
      const cur = pts[i]!;
      s += Math.hypot(cur.x - prev.x, cur.y - prev.y);
    }
    uv[i * 4 + 0] = s; // left[i].u
    uv[i * 4 + 1] = 0; // left[i].v
    uv[i * 4 + 2] = s; // right[i].u
    uv[i * 4 + 3] = 1; // right[i].v
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

/**
 * 几何构建入口（分域契约 §C 签名）。
 * 幂等纯函数：每次调用产出独立 BufferGeometry；不修改入参。
 */
export function GeometryBuilder(shape: RegionShape, semantic: RegionSemantic): THREE.BufferGeometry {
  switch (shape.type) {
    case 'line':
      return buildLine(shape, semantic);
    case 'point':
      return buildPoint(shape);
    default:
      // 面类五形状：点列 → 贴地三角网（elevation = baseHeight，高度合成基线）
      return polygonSurfaceGeometry(shape.points, shape.baseHeight);
  }
}

/** line → 带宽条带（width 读 semantic.properties.width，R3；UV 补充 R10） */
function buildLine(shape: RegionShape, semantic: RegionSemantic): THREE.BufferGeometry {
  const geometry = centerlineRibbonGeometry(shape.points, readLineWidth(semantic), shape.baseHeight);
  applyRibbonUV(geometry, shape.points);
  return geometry;
}

/** point → 锚点小四边形（中心在锚点、y=baseHeight、PlaneGeometry 自带 UV/法线朝上） */
function buildPoint(shape: RegionShape): THREE.BufferGeometry {
  const anchor = shape.points[0] ?? { x: 0, y: 0 };
  const geometry = new THREE.PlaneGeometry(POINT_ANCHOR_SIZE, POINT_ANCHOR_SIZE);
  geometry.rotateX(-Math.PI / 2); // XY → XZ，法线 (0,0,1) → (0,1,0) 朝上
  geometry.translate(anchor.x, shape.baseHeight, anchor.y);
  return geometry;
}
