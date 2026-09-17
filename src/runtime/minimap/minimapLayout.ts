/**
 * runtime/minimap/minimapLayout —— 小地图视域 fit 与像素↔世界双向映射（T7.7）。
 *
 * 纯函数模块（零 THREE，node 可测）：
 *  - fitMinimapView：场景包围盒 → 俯视正交视域（等比适配、含边距、最小/默认跨度钳制）；
 *  - minimapWorldToPixel / minimapPixelToWorld：世界 XZ ↔ 画布 CSS 像素。
 *
 * 坐标约定（与主渲染顶视惯例一致）：北 = 世界 -Z 在画布上方（像素 y 小）、
 * 东 = +X 在画布右方（像素 x 大）；业务 Vec2 = (x, 世界 z)。
 *
 * 边界：只做数值换算，不触碰相机对象/DOM；画布尺寸以 CSS 像素计量
 *      （devicePixelRatio 缩放由渲染层承担，交互层消费 CSS 像素）。
 */

/** 小地图默认画布尺寸（CSS 像素；观感可调，任务书建议 ~200×140） */
export const MINIMAP_WIDTH_PX = 200;
export const MINIMAP_HEIGHT_PX = 140;

/** fit 边距（像素）：包围盒距画布边缘的安全留白 */
export const MINIMAP_MARGIN_PX = 8;

/** 空场景默认视域跨度（世界米）：无对象时展示以原点为中心的默认范围 */
export const MINIMAP_DEFAULT_SPAN = 240;

/** 最小视域跨度（世界米）：单点/极小场景防过度放大 */
export const MINIMAP_MIN_SPAN = 30;

/** XZ 平面包围盒 */
export interface Bounds2 {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/** 小地图当前视域（fit 产物；像素↔世界换算的参数集） */
export interface MinimapView {
  widthPx: number;
  heightPx: number;
  /** 视域中心（世界 XZ） */
  centerX: number;
  centerZ: number;
  /** 缩放：一个 CSS 像素代表的世界单位数 */
  worldPerPixel: number;
}

/** 包围盒是否有效（非空且 max ≥ min） */
function validBounds(bounds: Bounds2 | null): bounds is Bounds2 {
  return (
    bounds !== null &&
    Number.isFinite(bounds.minX) &&
    Number.isFinite(bounds.maxX) &&
    Number.isFinite(bounds.minZ) &&
    Number.isFinite(bounds.maxZ) &&
    bounds.maxX >= bounds.minX &&
    bounds.maxZ >= bounds.minZ
  );
}

/**
 * 场景包围盒 → 俯视正交视域：等比适配使包围盒（含边距）完整可见；
 * 空/非法包围盒 → 原点居中默认跨度；跨度下限 MINIMAP_MIN_SPAN 防过度放大。
 */
export function fitMinimapView(
  bounds: Bounds2 | null,
  widthPx: number,
  heightPx: number,
): MinimapView {
  const width = Math.max(widthPx, 1);
  const height = Math.max(heightPx, 1);
  const usableW = Math.max(width - 2 * MINIMAP_MARGIN_PX, 1);
  const usableH = Math.max(height - 2 * MINIMAP_MARGIN_PX, 1);

  if (!validBounds(bounds)) {
    return {
      widthPx: width,
      heightPx: height,
      centerX: 0,
      centerZ: 0,
      worldPerPixel: Math.max(
        MINIMAP_DEFAULT_SPAN / usableW,
        MINIMAP_DEFAULT_SPAN / usableH,
      ),
    };
  }

  const spanX = Math.max(bounds.maxX - bounds.minX, MINIMAP_MIN_SPAN);
  const spanZ = Math.max(bounds.maxZ - bounds.minZ, MINIMAP_MIN_SPAN);
  return {
    widthPx: width,
    heightPx: height,
    centerX: (bounds.minX + bounds.maxX) / 2,
    centerZ: (bounds.minZ + bounds.maxZ) / 2,
    worldPerPixel: Math.max(spanX / usableW, spanZ / usableH),
  };
}

/** 世界 XZ → 画布 CSS 像素（北在上：z 越小像素 y 越小） */
export function minimapWorldToPixel(view: MinimapView, world: { x: number; y: number }): {
  x: number;
  y: number;
} {
  return {
    x: view.widthPx / 2 + (world.x - view.centerX) / view.worldPerPixel,
    y: view.heightPx / 2 + (world.y - view.centerZ) / view.worldPerPixel,
  };
}

/** 画布 CSS 像素 → 世界 XZ（minimapWorldToPixel 的逆） */
export function minimapPixelToWorld(view: MinimapView, px: number, py: number): {
  x: number;
  y: number;
} {
  return {
    x: view.centerX + (px - view.widthPx / 2) * view.worldPerPixel,
    y: view.centerZ + (py - view.heightPx / 2) * view.worldPerPixel,
  };
}
