/**
 * tests/runtime/minimap/minimapLayout.test.ts —— 小地图视域 fit 与像素↔世界映射纯函数测试（T7.7，先测后码）。
 *
 * 覆盖（零 THREE、node 直测）：
 * - fitMinimapView：空/退化包围盒 → 默认视域（原点居中、默认跨度）；
 *   宽扁/高瘦包围盒 → 等比适配（含边距后双方向完整可见）；最小跨度钳制；
 * - 世界→像素：北（-Z）在画布上方（y 更小）、X 向右；
 * - 像素↔世界往返恒等；边距内的世界点映射进画布内。
 */
import { describe, expect, it } from 'vitest';
import {
  MINIMAP_DEFAULT_SPAN,
  MINIMAP_MARGIN_PX,
  MINIMAP_MIN_SPAN,
  fitMinimapView,
  minimapPixelToWorld,
  minimapWorldToPixel,
} from '../../../src/runtime/minimap/minimapLayout';

const W = 200;
const H = 140;

describe('fitMinimapView：包围盒 → 正交视域', () => {
  it('空包围盒（null）→ 默认视域：原点居中、跨度 = MINIMAP_DEFAULT_SPAN', () => {
    const view = fitMinimapView(null, W, H);
    expect(view.widthPx).toBe(W);
    expect(view.heightPx).toBe(H);
    expect(view.centerX).toBe(0);
    expect(view.centerZ).toBe(0);
    // 垂直方向 140px 更紧：worldPerPixel = DEFAULT_SPAN / (H - 2·margin)
    expect(view.worldPerPixel).toBeCloseTo(MINIMAP_DEFAULT_SPAN / (H - 2 * MINIMAP_MARGIN_PX), 9);
  });

  it('退化包围盒（min==max 单点）→ 最小跨度钳制（不无限放大）', () => {
    const view = fitMinimapView({ minX: 10, maxX: 10, minZ: -5, maxZ: -5 }, W, H);
    expect(view.centerX).toBe(10);
    expect(view.centerZ).toBe(-5);
    // 单点：span 双向取 MIN_SPAN（30m），竖直方向更紧（140px < 200px）主导缩放
    expect(view.worldPerPixel).toBeCloseTo(MINIMAP_MIN_SPAN / (H - 2 * MINIMAP_MARGIN_PX), 9);
  });

  it('宽扁包围盒（X 主导）→ 水平方向决定缩放；XZ 双向含边距完整可见', () => {
    const bounds = { minX: -300, maxX: 300, minZ: -40, maxZ: 40 };
    const view = fitMinimapView(bounds, W, H);
    expect(view.centerX).toBe(0);
    expect(view.centerZ).toBe(0);
    expect(view.worldPerPixel).toBeCloseTo(600 / (W - 2 * MINIMAP_MARGIN_PX), 9);
    // 完整可见：四角映射进画布 [margin, W-margin] × [margin, H-margin]
    for (const p of [
      { x: -300, y: -40 },
      { x: 300, y: -40 },
      { x: 300, y: 40 },
      { x: -300, y: 40 },
    ]) {
      const px = minimapWorldToPixel(view, p);
      expect(px.x).toBeGreaterThanOrEqual(MINIMAP_MARGIN_PX - 1e-9);
      expect(px.x).toBeLessThanOrEqual(W - MINIMAP_MARGIN_PX + 1e-9);
      expect(px.y).toBeGreaterThanOrEqual(MINIMAP_MARGIN_PX - 1e-9);
      expect(px.y).toBeLessThanOrEqual(H - MINIMAP_MARGIN_PX + 1e-9);
    }
  });

  it('高瘦包围盒（Z 主导）→ 垂直方向决定缩放', () => {
    const view = fitMinimapView({ minX: -10, maxX: 10, minZ: -250, maxZ: 250 }, W, H);
    expect(view.worldPerPixel).toBeCloseTo(500 / (H - 2 * MINIMAP_MARGIN_PX), 9);
  });

  it('非法包围盒（max < min）按空场景处理（默认视域，不抛错）', () => {
    const view = fitMinimapView({ minX: 100, maxX: -100, minZ: 0, maxZ: 0 }, W, H);
    expect(view.centerX).toBe(0);
    expect(view.worldPerPixel).toBeCloseTo(MINIMAP_DEFAULT_SPAN / (H - 2 * MINIMAP_MARGIN_PX), 9);
  });
});

describe('minimapWorldToPixel / minimapPixelToWorld：双向映射', () => {
  it('北（-Z）在画布上方（更小 y）、东（+X）在画布右方（更大 x）', () => {
    const view = fitMinimapView(null, W, H);
    const north = minimapWorldToPixel(view, { x: 0, y: -50 });
    const south = minimapWorldToPixel(view, { x: 0, y: 50 });
    expect(north.y).toBeLessThan(H / 2);
    expect(south.y).toBeGreaterThan(H / 2);
    const east = minimapWorldToPixel(view, { x: 50, y: 0 });
    const west = minimapWorldToPixel(view, { x: -50, y: 0 });
    expect(east.x).toBeGreaterThan(W / 2);
    expect(west.x).toBeLessThan(W / 2);
  });

  it('视域中心 ↔ 画布中心', () => {
    const view = fitMinimapView({ minX: -100, maxX: 50, minZ: 20, maxZ: 120 }, W, H);
    const center = minimapWorldToPixel(view, { x: view.centerX, y: view.centerZ });
    expect(center.x).toBeCloseTo(W / 2, 9);
    expect(center.y).toBeCloseTo(H / 2, 9);
  });

  it('世界→像素→世界 往返恒等（任意视域/任意点）', () => {
    const view = fitMinimapView({ minX: -400, maxX: 120, minZ: -80, maxZ: 600 }, W, H);
    for (const p of [
      { x: -400, y: -80 },
      { x: 120, y: 600 },
      { x: -17.5, y: 233.25 },
    ]) {
      const px = minimapWorldToPixel(view, p);
      const back = minimapPixelToWorld(view, px.x, px.y);
      expect(back.x).toBeCloseTo(p.x, 6);
      expect(back.y).toBeCloseTo(p.y, 6);
    }
  });

  it('画布角点映射到视域四角（halfExtent 对应关系）', () => {
    const view = fitMinimapView(null, W, H);
    const tl = minimapPixelToWorld(view, 0, 0); // 画布左上 = 世界西北
    expect(tl.x).toBeCloseTo(view.centerX - (W / 2) * view.worldPerPixel, 6);
    expect(tl.y).toBeCloseTo(view.centerZ - (H / 2) * view.worldPerPixel, 6);
  });
});
