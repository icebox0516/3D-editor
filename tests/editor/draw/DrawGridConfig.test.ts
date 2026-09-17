/**
 * tests/editor/draw/DrawGridConfig.test.ts —— 吸附全局开关测试（T5.2，先测后码；
 * T6.5 适配形状驱动：三点击工具改产 RegionObject，断言改读 shape.points）。
 *
 * 覆盖（任务书「工具 → 吸附（checked = 网格吸附开关，接 DrawGridConfig 共享步长
 * 对象的开关位）」+ 主代理裁定 2）：
 * - createDrawGridConfig 默认 { spacing: 5, snapEnabled: true }（与渲染网格缺省一致）；
 * - snapEnabled=false：绘制工具落点管线不做网格吸附（原坐标直落）；
 * - snapEnabled=true：吸附恢复（与既有行为一致，回归）；
 * - 会话级 G 键与全局开关为「与」关系：任一关闭即不吸附。
 * 边界：零 three（FakePort 装置见 ./fakes）；共享对象由 bootstrap 构造注入
 *      （EditorHandle.drawGrid 同一实例，主代理 2026-09-10 裁定）。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { DrawPointTool } from '../../../src/editor/tools/draw/DrawPointTool';
import { DrawLineTool } from '../../../src/editor/tools/draw/DrawLineTool';
import { DrawPolygonTool } from '../../../src/editor/tools/draw/DrawPolygonTool';
import {
  DEFAULT_DRAW_GRID_SPACING,
  createDrawGridConfig,
  type DrawGridConfig,
} from '../../../src/editor/tools/draw/DrawGridConfig';
import {
  key,
  pointer,
  regionsOf,
  setupShapeDraw,
  type ShapeDrawFixture,
} from './fakes';

describe('createDrawGridConfig 默认值', () => {
  it('spacing = 5（与 SceneGrid 缺省间距统一）、snapEnabled = true', () => {
    const config = createDrawGridConfig();
    expect(config.spacing).toBe(DEFAULT_DRAW_GRID_SPACING);
    expect(config.snapEnabled).toBe(true);
  });
});

describe('全局吸附开关：DrawPointTool 落点', () => {
  let fx: ShapeDrawFixture<DrawPointTool>;
  let grid: DrawGridConfig;

  beforeEach(() => {
    grid = createDrawGridConfig(1);
    fx = setupShapeDraw(new DrawPointTool(grid));
    // 游标/落点均落在非整数格点（1 m 网格下必然被吸附改写）
    fx.viewport.groundDefault = { x: 0.4, y: 0, z: 0.6 };
    fx.tools.activate('draw-point', { shape: 'point' });
  });

  it('snapEnabled=true（默认）：落点被吸附到最近格点', () => {
    fx.tool.onPointerDown(pointer(10, 10));
    const [placed] = regionsOf(fx.sceneManager);
    expect(placed.shape.points).toEqual([{ x: 0, y: 1 }]);
  });

  it('snapEnabled=false：落点保持原始坐标（不被吸附）', () => {
    grid.snapEnabled = false;
    fx.tool.onPointerDown(pointer(10, 10));
    const [placed] = regionsOf(fx.sceneManager);
    expect(placed.shape.points).toEqual([{ x: 0.4, y: 0.6 }]);
  });
});

describe('全局吸附开关：与绘制会话 G 键取与', () => {
  it('全局关 + G 键切会话开：仍不吸附；全局开 + 会话关：不吸附；双开才吸附', () => {
    const grid = createDrawGridConfig(1);
    grid.snapEnabled = false;
    const fx = setupShapeDraw(new DrawPointTool(grid));
    fx.viewport.groundDefault = { x: 0.4, y: 0, z: 0.6 };
    fx.tools.activate('draw-point', { shape: 'point' });

    /** 最近一次放置的点形状坐标（点工具每次点击即时完成，取末位） */
    const lastPlaced = (): { x: number; y: number } => {
      const placed = regionsOf(fx.sceneManager);
      return placed[placed.length - 1]!.shape.points[0]!;
    };

    fx.tool.onKeyDown(key('g')); // 会话级切换不影响全局关闭结论
    fx.tool.onPointerDown(pointer(10, 10));
    expect(lastPlaced()).toEqual({ x: 0.4, y: 0.6 });

    grid.snapEnabled = true; // 全局开，但会话开关仍处于关
    fx.tool.onPointerDown(pointer(11, 11));
    expect(lastPlaced()).toEqual({ x: 0.4, y: 0.6 });

    fx.tool.onKeyDown(key('g')); // 会话也开 → 吸附生效
    fx.tool.onPointerDown(pointer(12, 12));
    expect(lastPlaced()).toEqual({ x: 0, y: 1 });
  });
});

describe('全局吸附开关：线 / 面工具一致尊重', () => {
  it('DrawLineTool：snapEnabled=false 顶点保持原坐标', () => {
    const grid = createDrawGridConfig(1);
    grid.snapEnabled = false;
    const fx = setupShapeDraw(new DrawLineTool(grid));
    fx.tools.activate('draw-line', { shape: 'line' });

    fx.viewport.setGround(10, 10, { x: 1.3, y: 0, z: 2.7 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(20, 20, { x: 2.6, y: 0, z: 0.5 });
    fx.tool.onPointerDown(pointer(20, 20));
    fx.tool.onDoubleClick(pointer(20, 20)); // 双击位置 = 末点 → 去重后完成

    const [line] = regionsOf(fx.sceneManager);
    expect(line.shape.points).toEqual([
      { x: 1.3, y: 2.7 },
      { x: 2.6, y: 0.5 },
    ]);
  });

  it('DrawPolygonTool：snapEnabled=true 吸附到格点（回归）', () => {
    const grid = createDrawGridConfig(1);
    const fx = setupShapeDraw(new DrawPolygonTool(grid));
    fx.tools.activate('draw-polygon', { shape: 'polygon' });

    fx.viewport.setGround(10, 10, { x: 1.3, y: 0, z: 2.7 }); // → (1,3)
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(20, 20, { x: 3.6, y: 0, z: 2.7 }); // → (4,3)
    fx.tool.onPointerDown(pointer(20, 20));
    fx.viewport.setGround(30, 30, { x: 3.6, y: 0, z: 0.4 }); // → (4,0)
    fx.tool.onPointerDown(pointer(30, 30));
    fx.tool.onDoubleClick(pointer(30, 30));

    const [polygon] = regionsOf(fx.sceneManager);
    // 顶点顺序经 validateGeometry 自动定向（逆时针）；环不重复闭合点（closed 字段表达）
    expect(polygon.shape.points).toEqual([
      { x: 1, y: 3 },
      { x: 4, y: 0 },
      { x: 4, y: 3 },
    ]);
  });
});
