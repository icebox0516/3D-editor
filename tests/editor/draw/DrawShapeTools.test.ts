/**
 * tests/editor/draw/DrawShapeTools.test.ts —— 参数化形状绘制工具测试（T6.5，FakePort，零 three）。
 *
 * 覆盖（矩形/圆形/椭圆/自由形状四工具 + 完成即回选择的公共语义）：
 * - 激活校验：缺参数 / 非法 shape / shape 与工具不匹配 → 抛错且 activeTool 复位 null；
 * - 相机：默认进入切顶视 + 锁旋转，退出恢复（沿 DrawToolBase 基座行为）；
 * - 矩形：按下拖拽松开 → RegionObject（shape.type=rectangle、4 顶点 CCW、options 缓存
 *   width/height/centerX/centerY、closed=true）；退化拖拽（零宽/零高）被拦（error 状态、零命令）；
 * - 圆形：中心按住拖半径松开 → RegionObject（circle、options radius/segments=64、顶点 64）；
 * - 椭圆：两段拖拽（先水平半轴再垂直半轴）→ RegionObject（ellipse、options radiusX/radiusY）；
 * - 自由形状：按住跟踪松手 → 简化+平滑后闭合 RegionObject（freehand、options simplify/smooth）；
 *   顶点不足（<3）被拦；自相交（八字跟踪）被拦（已跟踪点保留可修正——按住重拖另起）；
 * - 三步流公共语义：完成 → CreateObjectCommand 一条历史 + 自动选中新对象 + 经完成钩子
 *   回选择工具（应用层注入的 exitToSelect）；RegionObject 语义/样式三层字段齐备
 *   （semantic=unclassified + default_solid；baseHeight=0；命名「未命名区域 N」）；
 * - 状态栏：vertexCount 随形状发出（矩形 4 / 圆 64 / 椭圆 64 / 自由=跟踪点数）；
 *   面类同时发 length+area；ESC 取消零命令。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  DrawCircleTool,
  DrawEllipseTool,
  DrawFreehandTool,
  DrawRectangleTool,
} from '../../../src/editor/tools/draw';
import { createDrawGridConfig, type DrawGridConfig } from '../../../src/editor/tools/draw';
import { simplifyFreehand, smoothFreehand } from '../../../src/domain/regions';
import type { Vec2 } from '../../../src/core/types';
import type { Tool } from '../../../src/editor/tools';
import {
  ESC,
  key,
  pointer,
  regionsOf,
  setupShapeDraw,
  undoDepth,
  type ShapeDrawFixture,
} from './fakes';

/** 近零吸附步长（原始坐标断言） */
function noSnap() {
  return createDrawGridConfig(0.0001);
}

function setup<T extends Tool>(ToolClass: new (grid?: DrawGridConfig) => T, shape: string): ShapeDrawFixture<T> {
  const tool = new ToolClass(noSnap());
  const fx = setupShapeDraw(tool);
  fx.tools.activate(tool.id, { shape });
  return fx;
}

describe('参数化形状工具 · 激活校验', () => {
  it('缺少参数 → 抛错且 activeTool 复位 null', () => {
    const fx = setupShapeDraw(new DrawRectangleTool());
    expect(() => fx.tools.activate('draw-rectangle')).toThrow(/shape/);
    expect(fx.tools.getActiveTool()).toBeNull();
  });

  it('非法 shape → 抛错', () => {
    const fx = setupShapeDraw(new DrawCircleTool());
    expect(() => fx.tools.activate('draw-circle', { shape: 'banana' })).toThrow(/shape/);
  });

  it('shape 与工具不匹配（矩形工具收 circle）→ 抛错且复位', () => {
    const fx = setupShapeDraw(new DrawRectangleTool());
    expect(() => fx.tools.activate('draw-rectangle', { shape: 'circle' })).toThrow(/rectangle/);
    expect(fx.tools.getActiveTool()).toBeNull();
  });

  it('默认进入：切顶视 + 锁旋转；退出恢复透视 + 解锁', () => {
    const fx = setup(DrawRectangleTool, 'rectangle');
    expect(fx.camera.modes).toEqual(['top']);
    expect(fx.camera.orthoLocks).toEqual([true]);
    fx.tools.deactivate();
    expect(fx.camera.modes).toEqual(['top', 'perspective']);
    expect(fx.camera.orthoLocks.at(-1)).toBe(false);
  });
});

describe('DrawRectangleTool（拖两角）', () => {
  let fx: ShapeDrawFixture<DrawRectangleTool>;
  beforeEach(() => {
    fx = setup(DrawRectangleTool, 'rectangle');
  });

  it('拖拽 (0,0)→(4,3) 松开 → region +1：4 顶点 CCW、options 缓存、closed=true、一条历史', () => {
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(40, 30, { x: 4, y: 0, z: 3 });
    fx.tool.onPointerMove(pointer(40, 30));
    fx.tool.onPointerUp(pointer(40, 30));

    const regions = regionsOf(fx.sceneManager);
    expect(regions).toHaveLength(1);
    const region = regions[0]!;
    expect(region.shape.type).toBe('rectangle');
    expect(region.shape.points).toEqual([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 3 },
      { x: 0, y: 3 },
    ]);
    expect(region.shape.closed).toBe(true);
    expect(region.shape.options).toEqual({ width: 4, height: 3, centerX: 2, centerY: 1.5 });
    expect(undoDepth(fx.history)).toBe(1);
  });

  it('反向拖拽（右上→左下）自动归一为同一矩形', () => {
    fx.viewport.setGround(10, 10, { x: 4, y: 0, z: 3 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(40, 30, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerUp(pointer(40, 30));

    const shape = regionsOf(fx.sceneManager)[0]!.shape;
    expect(shape.points).toEqual([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 3 },
      { x: 0, y: 3 },
    ]);
  });

  it('拖拽期间预览为闭合四边形 + 状态栏 length/area/vertexCount', () => {
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(40, 30, { x: 4, y: 0, z: 3 });
    fx.tool.onPointerMove(pointer(40, 30));

    expect(fx.sceneManager.getObjects()).toHaveLength(0); // 半成品不进场景
    expect(fx.history.canUndo()).toBe(false);
    expect(fx.preview.lastDrawState?.closed).toBe(true);
    expect(fx.preview.lastDrawState?.points).toHaveLength(4);
    const last = fx.statuses.at(-1) as { length?: number; area?: number; vertexCount?: number };
    expect(last.vertexCount).toBe(4);
    expect(last.area).toBeCloseTo(12, 10);
    expect(last.length).toBeCloseTo(14, 10);
  });

  it('零尺寸拖拽（原地点击松开）被拦：错误提示、零命令、草稿清空', () => {
    fx.viewport.setGround(10, 10, { x: 1, y: 0, z: 1 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerUp(pointer(10, 10));

    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
    const last = fx.statuses.at(-1) as { error?: string };
    expect(last.error).toBeTruthy();
  });
});

describe('DrawCircleTool（中心拖半径）', () => {
  let fx: ShapeDrawFixture<DrawCircleTool>;
  beforeEach(() => {
    fx = setup(DrawCircleTool, 'circle');
  });

  it('中心 (2,1) 拖至 (5,1) 松开 → 64 顶点圆、options {radius:3, segments:64}、closed', () => {
    fx.viewport.setGround(10, 10, { x: 2, y: 0, z: 1 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(50, 10, { x: 5, y: 0, z: 1 });
    fx.tool.onPointerMove(pointer(50, 10));
    fx.tool.onPointerUp(pointer(50, 10));

    const region = regionsOf(fx.sceneManager)[0]!;
    expect(region.shape.type).toBe('circle');
    expect(region.shape.points).toHaveLength(64);
    expect(region.shape.closed).toBe(true);
    expect(region.shape.options).toEqual({ radius: 3, segments: 64 });
    // 首点在中心正 X 方向：圆心 (2,1) + 半径 3 → (5,1)
    expect(region.shape.points[0]).toEqual({ x: 5, y: 1 });
  });

  it('拖拽期间状态：vertexCount=64、面积≈πr²（64 段内接多边形）', () => {
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(40, 10, { x: 2, y: 0, z: 0 });
    fx.tool.onPointerMove(pointer(40, 10));

    const last = fx.statuses.at(-1) as { vertexCount?: number; area?: number };
    expect(last.vertexCount).toBe(64);
    expect(last.area).toBeCloseTo(Math.PI * 4, 1);
  });

  it('零半径松开被拦：错误提示、零命令', () => {
    fx.viewport.setGround(10, 10, { x: 1, y: 0, z: 1 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerUp(pointer(10, 10));
    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect((fx.statuses.at(-1) as { error?: string }).error).toBeTruthy();
  });
});

describe('DrawEllipseTool（两轴拖拽）', () => {
  let fx: ShapeDrawFixture<DrawEllipseTool>;
  beforeEach(() => {
    fx = setup(DrawEllipseTool, 'ellipse');
  });

  it('两段拖拽：中心(1,1)→(4,1) 定 X 半轴 3，再 (1,1)→(1,3) 定 Y 半轴 2', () => {
    // 第一段：水平半轴
    fx.viewport.setGround(10, 10, { x: 1, y: 0, z: 1 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(40, 10, { x: 4, y: 0, z: 1 });
    fx.tool.onPointerMove(pointer(40, 10));
    fx.tool.onPointerUp(pointer(40, 10));
    // 第一段结束尚未创建
    expect(fx.sceneManager.getObjects()).toHaveLength(0);

    // 第二段：垂直半轴
    fx.viewport.setGround(10, 10, { x: 1, y: 0, z: 1 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(10, 30, { x: 1, y: 0, z: 3 });
    fx.tool.onPointerMove(pointer(10, 30));
    fx.tool.onPointerUp(pointer(10, 30));

    const region = regionsOf(fx.sceneManager)[0]!;
    expect(region.shape.type).toBe('ellipse');
    expect(region.shape.points).toHaveLength(64);
    expect(region.shape.options).toEqual({ radiusX: 3, radiusY: 2, segments: 64 });
    expect(region.shape.points[0]).toEqual({ x: 4, y: 1 }); // 中心 + radiusX
    expect(undoDepth(fx.history)).toBe(1);
  });

  it('第一段预览为半轴线（LineString、不闭合）；第二段预览为椭圆面', () => {
    fx.viewport.setGround(10, 10, { x: 1, y: 0, z: 1 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(40, 10, { x: 4, y: 0, z: 1 });
    fx.tool.onPointerMove(pointer(40, 10));
    expect(fx.preview.lastDrawState?.geometryType).toBe('LineString');
    expect(fx.preview.lastDrawState?.closed).toBe(false);
    fx.tool.onPointerUp(pointer(40, 10));

    fx.viewport.setGround(10, 10, { x: 1, y: 0, z: 1 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(10, 30, { x: 1, y: 0, z: 3 });
    fx.tool.onPointerMove(pointer(10, 30));
    expect(fx.preview.lastDrawState?.geometryType).toBe('Polygon');
    expect(fx.preview.lastDrawState?.closed).toBe(true);
  });

  it('第一段零半轴被拦；ESC 取消回到第一阶段且零命令', () => {
    fx.viewport.setGround(10, 10, { x: 1, y: 0, z: 1 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerUp(pointer(10, 10)); // 零水平位移
    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect((fx.statuses.at(-1) as { error?: string }).error).toBeTruthy();

    // 完成第一阶段后 ESC：清草稿、零命令
    fx.viewport.setGround(10, 10, { x: 1, y: 0, z: 1 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(40, 10, { x: 4, y: 0, z: 1 });
    fx.tool.onPointerUp(pointer(40, 10));
    fx.tool.onKeyDown(ESC);
    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
    expect(fx.preview.clearCount).toBeGreaterThanOrEqual(1);
  });
});

describe('DrawFreehandTool（按住跟踪，松手简化闭合）', () => {
  let fx: ShapeDrawFixture<DrawFreehandTool>;
  beforeEach(() => {
    fx = setupShapeDraw(new DrawFreehandTool(noSnap()));
    fx.tools.activate('draw-freehand', { shape: 'freehand' });
  });

  /** 沿给定点列按下-跟踪-松开 */
  function stroke(points: Vec2[]): void {
    fx.viewport.setGround(10, 10, { x: points[0]!.x, y: 0, z: points[0]!.y });
    fx.tool.onPointerDown(pointer(10, 10));
    for (const p of points.slice(1)) {
      fx.viewport.setGround(20, 20, { x: p.x, y: 0, z: p.y });
      fx.tool.onPointerMove(pointer(20, 20));
    }
    const last = points[points.length - 1]!;
    fx.viewport.setGround(30, 30, { x: last.x, y: 0, z: last.y });
    fx.tool.onPointerUp(pointer(30, 30));
  }

  it('大方环跟踪 → 简化+平滑后闭合（与管线纯函数逐点一致）、options 记录 simplify/smooth', () => {
    const tracked: Vec2[] = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 4, y: 0.1 },
      { x: 4, y: 2 },
      { x: 4, y: 4 },
      { x: 2, y: 4 },
      { x: 0, y: 4 },
      { x: 0, y: 2 },
    ];
    stroke(tracked);

    const region = regionsOf(fx.sceneManager)[0]!;
    expect(region.shape.type).toBe('freehand');
    expect(region.shape.closed).toBe(true);
    // 管线 = simplifyFreehand(0.2) → smoothFreehand(1)（domain 纯函数同源对照）
    const expected = smoothFreehand(simplifyFreehand(tracked, 0.2), 1);
    expect(region.shape.points).toEqual(expected);
    // 端点保持：首尾为跟踪起止点；平滑后点数翻倍级增长（角点保留）
    expect(region.shape.points[0]).toEqual(tracked[0]);
    expect(region.shape.points.at(-1)).toEqual(tracked.at(-1));
    expect(region.shape.points.length).toBeGreaterThanOrEqual(8);
    expect((region.shape.options as { simplify?: number }).simplify).toBeCloseTo(0.2, 10);
    expect((region.shape.options as { smooth?: number }).smooth).toBe(1);
  });

  it('跟踪期间：vertexCount 随跟踪点数增长、预览为开放折线', () => {
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(20, 20, { x: 1, y: 0, z: 0 });
    fx.tool.onPointerMove(pointer(20, 20));
    fx.viewport.setGround(30, 30, { x: 2, y: 0, z: 1 });
    fx.tool.onPointerMove(pointer(30, 30));

    const last = fx.statuses.at(-1) as { vertexCount?: number };
    expect(last.vertexCount).toBe(3);
    expect(fx.preview.lastDrawState?.closed).toBe(false);
    expect(fx.sceneManager.getObjects()).toHaveLength(0);
  });

  it('顶点不足（原地单击松开）被拦：错误提示、零命令', () => {
    stroke([{ x: 1, y: 1 }]);
    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
    expect((fx.statuses.at(-1) as { error?: string }).error).toMatch(/3/);
  });

  it('自相交八字跟踪被拦：错误提示、零命令', () => {
    stroke([
      { x: 0, y: 0 },
      { x: 4, y: 4 },
      { x: 0, y: 4 },
      { x: 4, y: 0 },
    ]);
    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
    const last = fx.statuses.at(-1) as { error?: string };
    expect(last.error).toMatch(/相交/);
  });
});

describe('三步流公共语义（完成即创建 + 自动选中 + 回选择工具）', () => {
  it('矩形完成 → 选中新对象 + 完成钩子被调用（应用层据此回选择工具）+ 状态栏复位', () => {
    const fx = setup(DrawRectangleTool, 'rectangle');
    const exits: number[] = [];
    fx.tool.setExitToSelect(() => exits.push(1));

    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(40, 30, { x: 4, y: 0, z: 3 });
    fx.tool.onPointerUp(pointer(40, 30));

    const region = regionsOf(fx.sceneManager)[0]!;
    expect(fx.selection.getSelectedIds()).toEqual([region.id]);
    expect(exits).toHaveLength(1);
    // 完成后状态栏复位（空载荷）
    expect(fx.statuses.at(-1)).toEqual({});
  });

  it('产出的 RegionObject 三层字段：unclassified + default_solid + baseHeight 0 + 命名计数', () => {
    const fx = setup(DrawCircleTool, 'circle');
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(40, 10, { x: 3, y: 0, z: 0 });
    fx.tool.onPointerUp(pointer(40, 10));

    const region = regionsOf(fx.sceneManager)[0]!;
    expect(region.type).toBe('region');
    expect(region.id.startsWith('region_')).toBe(true);
    expect(region.name).toBe('未命名区域 1');
    expect(region.semantic).toEqual({ type: 'unclassified', properties: {} });
    expect(region.style).toEqual({ presetId: 'default_solid', overrides: {} });
    expect(region.shape.baseHeight).toBe(0);
    expect(region.transform.position).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('场景已有「未分类」图层 → 完成归层；无该图层 → layerId=null', () => {
    const fx = setup(DrawRectangleTool, 'rectangle');
    const layer = fx.addLayer('未分类');
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(40, 30, { x: 4, y: 0, z: 3 });
    fx.tool.onPointerUp(pointer(40, 30));
    expect(regionsOf(fx.sceneManager)[0]!.layerId).toBe(layer.id);

    const fx2 = setup(DrawRectangleTool, 'rectangle');
    fx2.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx2.tool.onPointerDown(pointer(10, 10));
    fx2.viewport.setGround(40, 30, { x: 4, y: 0, z: 3 });
    fx2.tool.onPointerUp(pointer(40, 30));
    expect(regionsOf(fx2.sceneManager)[0]!.layerId).toBeNull();
  });

  it('undo 撤销创建：对象消失、选中清空；redo 恢复', () => {
    const fx = setup(DrawRectangleTool, 'rectangle');
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(40, 30, { x: 4, y: 0, z: 3 });
    fx.tool.onPointerUp(pointer(40, 30));
    const id = regionsOf(fx.sceneManager)[0]!.id;

    fx.history.undo();
    expect(regionsOf(fx.sceneManager)).toHaveLength(0);
    expect(fx.selection.getSelectedIds()).not.toContain(id);
    fx.history.redo();
    expect(regionsOf(fx.sceneManager)).toHaveLength(1);
  });

  it('ESC（工具内防御）：清草稿清预览、零命令；默认 5m 吸附生效', () => {
    const snapFx = setupShapeDraw(new DrawRectangleTool()); // 默认 5m 网格吸附
    snapFx.tools.activate('draw-rectangle', { shape: 'rectangle' });
    snapFx.viewport.setGround(10, 10, { x: 0.4, y: 0, z: 0.4 });
    snapFx.tool.onPointerDown(pointer(10, 10));
    snapFx.viewport.setGround(40, 30, { x: 4.4, y: 0, z: 3.4 });
    snapFx.tool.onPointerUp(pointer(40, 30));
    // 网格吸附默认开（5m 步长）：0.4→0、4.4→5 → 5×5 矩形
    expect(regionsOf(snapFx.sceneManager)[0]!.shape.options).toEqual({
      width: 5,
      height: 5,
      centerX: 2.5,
      centerY: 2.5,
    });

    const fx2 = setup(DrawRectangleTool, 'rectangle');
    fx2.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx2.tool.onPointerDown(pointer(10, 10));
    fx2.viewport.setGround(40, 30, { x: 4, y: 0, z: 3 });
    fx2.tool.onKeyDown(ESC);
    expect(fx2.preview.clearCount).toBe(1);
    expect(fx2.sceneManager.getObjects()).toHaveLength(0);
    expect(fx2.history.canUndo()).toBe(false);
    expect(fx2.tools.getActiveTool()).toBe(fx2.tool); // 工具内 ESC 不退出激活
  });

  it('A 键 45° 锁定：矩形对角拖拽被锁到 45° 方向（正方形或轴上退化拦截）', () => {
    const fx = setupShapeDraw(new DrawRectangleTool(noSnap()));
    fx.tools.activate('draw-rectangle', { shape: 'rectangle' });
    fx.tool.onKeyDown(key('a')); // 开启 45° 锁定
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(40, 30, { x: 3, y: 0, z: 2 });
    fx.tool.onPointerMove(pointer(40, 30));
    fx.tool.onPointerUp(pointer(40, 30));
    // 45° 锁定：|dx| == |dy| → 正方形（2.4/2.4 吸附前锁到 √13 距离的 45° 点）
    const region = regionsOf(fx.sceneManager)[0];
    if (region) {
      const xs = region.shape.points.map((p) => p.x);
      const ys = region.shape.points.map((p) => p.y);
      expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(Math.max(...ys) - Math.min(...ys), 6);
    } else {
      expect((fx.statuses.at(-1) as { error?: string }).error).toBeTruthy();
    }
  });
});
