/**
 * tests/editor/draw/DrawPolygonTool.test.ts —— 多边形绘制工具测试（FakePort，零 three）。
 *
 * 覆盖（T3.2 验收 + 阶段门裁定 2026-09-09 + T6.5 形状驱动改造）：
 * - 激活校验：缺参数 / 非法 shape / shape 不匹配 → 抛错且 activeTool 复位 null；
 * - 相机：默认切顶视 + 锁旋转；perspective:true 保留原机位；退出恢复；
 * - 绘制流：点击加点、双击闭合 → 场景 +1 RegionObject（shape.type='polygon'、顶点
 *   顺序一致、环不重复闭合点）、semantic=unclassified + default_solid；绘制全程历史栈
 *   长度不变，完成后恰好 +1（每次完成各一条历史）；完成后自动选中；
 * - 面积/长度/顶点实时：3-4-5 直角三角形面积 = 6、周长链累计、vertexCount 随点数；
 * - 自相交完成被拦：draw:status 错误、场景零变化、历史零变化、已绘点保留（预览仍在）；
 * - 顶点不足（<3）被拦；网格吸附默认开（1m）；
 * - ESC（唯一退出手势，T5.8）：清预览、退出、场景与历史零变化；右键仅剩工具内防御路径。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { DrawPolygonTool } from '../../../src/editor/tools/draw/DrawPolygonTool';
import { createDrawGridConfig } from '../../../src/editor/tools/draw';
import {
  ESC,
  key,
  pointer,
  regionsOf,
  setupShapeDraw,
  undoDepth,
  type ShapeDrawFixture,
} from './fakes';

function setup(): ShapeDrawFixture<DrawPolygonTool> {
  const fx = setupShapeDraw(new DrawPolygonTool(createDrawGridConfig(1)));
  fx.tools.activate('draw-polygon', { shape: 'polygon' });
  return fx;
}

describe('DrawPolygonTool 激活校验与相机', () => {
  it('shape 不匹配（polygon 工具收 rectangle）→ 抛错且 activeTool 复位 null', () => {
    const fx = setupShapeDraw(new DrawPolygonTool(createDrawGridConfig(1)));
    expect(() => fx.tools.activate('draw-polygon', { shape: 'rectangle' })).toThrow(/polygon/);
    expect(fx.tools.getActiveTool()).toBeNull();
  });

  it('非法 shape → 抛错', () => {
    const fx = setupShapeDraw(new DrawPolygonTool(createDrawGridConfig(1)));
    expect(() => fx.tools.activate('draw-polygon', { shape: 'banana' })).toThrow(/shape/);
  });

  it('默认进入：切顶视 + 锁旋转；退出恢复透视 + 解锁', () => {
    const fx = setup();
    expect(fx.camera.modes).toEqual(['top']);
    expect(fx.camera.orthoLocks).toEqual([true]);
    fx.tools.deactivate();
    expect(fx.camera.modes).toEqual(['top', 'perspective']);
    expect(fx.camera.orthoLocks.at(-1)).toBe(false);
  });

  it('perspective:true → 不切机位只锁旋转；退出不切机位', () => {
    const fx = setupShapeDraw(new DrawPolygonTool(createDrawGridConfig(1)));
    fx.tools.activate('draw-polygon', { shape: 'polygon', perspective: true });
    expect(fx.camera.modes).toEqual([]);
    fx.tools.deactivate();
    expect(fx.camera.modes).toEqual([]);
    expect(fx.camera.orthoLocks.at(-1)).toBe(false);
  });
});

describe('DrawPolygonTool 绘制流与历史', () => {
  let fx: ShapeDrawFixture<DrawPolygonTool>;
  beforeEach(() => {
    fx = setup();
  });

  it('4 点 + 双击 → 场景 +1 polygon RegionObject：顶点顺序一致且不重复闭合、三层字段齐备、完成后恰 1 条历史 + 自动选中', () => {
    const corners: Array<[number, number, { x: number; y: number; z: number }]> = [
      [10, 10, { x: 0, y: 0, z: 0 }],
      [20, 20, { x: 4, y: 0, z: 0 }],
      [30, 30, { x: 4, y: 0, z: 4 }],
      [40, 40, { x: 0, y: 0, z: 4 }],
    ];
    for (const [sx, sy, ground] of corners) {
      fx.viewport.setGround(sx, sy, ground);
      fx.tool.onPointerMove(pointer(sx, sy));
      fx.tool.onPointerDown(pointer(sx, sy));
      expect(fx.history.canUndo()).toBe(false); // 绘制全程历史栈长度不变
    }

    fx.tool.onDoubleClick(pointer(40, 40)); // 双击位置 = 末点 → 去重后闭合

    const regions = regionsOf(fx.sceneManager);
    expect(regions).toHaveLength(1);
    const region = regions[0]!;
    expect(region.type).toBe('region');
    expect(region.shape.type).toBe('polygon');
    expect(region.shape.points).toEqual([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 4 },
      { x: 0, y: 4 }, // 不重复闭合点（closed 由 shape.closed 表达）
    ]);
    expect(region.shape.closed).toBe(true);
    expect(region.semantic).toEqual({ type: 'unclassified', properties: {} });
    expect(region.style).toEqual({ presetId: 'default_solid', overrides: {} });
    expect(fx.selection.getSelectedIds()).toEqual([region.id]); // 自动选中
    expect(undoDepth(fx.history)).toBe(1); // 完成后恰好 +1

    fx.history.undo();
    expect(regionsOf(fx.sceneManager)).toHaveLength(0);
  });

  it('半成品不进场景：加点与移动期间零对象、零命令、预览 closed=true', () => {
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(20, 20, { x: 4, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(20, 20));
    fx.viewport.setGround(30, 30, { x: 4, y: 0, z: 4 });
    fx.tool.onPointerMove(pointer(30, 30));

    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
    expect(fx.preview.lastDrawState?.closed).toBe(true);
    expect(fx.preview.lastDrawState?.points).toEqual([{ x: 0, y: 0 }, { x: 4, y: 0 }]);
    expect(fx.preview.lastDrawState?.cursor).toEqual({ x: 4, y: 4 });
  });

  it('完成后清预览并可续绘第二块（每次完成各一条历史；未注入完成钩子时工具保持激活）', () => {
    for (const [sx, sy, g] of [
      [10, 10, { x: 0, y: 0, z: 0 }],
      [20, 20, { x: 4, y: 0, z: 0 }],
      [30, 30, { x: 4, y: 0, z: 4 }],
    ] as const) {
      fx.viewport.setGround(sx, sy, g);
      fx.tool.onPointerDown(pointer(sx, sy));
    }
    fx.tool.onDoubleClick(pointer(30, 30));
    expect(fx.preview.clearCount).toBe(1);

    for (const [sx, sy, g] of [
      [10, 10, { x: 10, y: 0, z: 0 }],
      [20, 20, { x: 12, y: 0, z: 0 }],
      [30, 30, { x: 12, y: 0, z: 2 }],
    ] as const) {
      fx.viewport.setGround(sx, sy, g);
      fx.tool.onPointerDown(pointer(sx, sy));
    }
    fx.tool.onDoubleClick(pointer(30, 30));

    expect(regionsOf(fx.sceneManager)).toHaveLength(2);
    expect(undoDepth(fx.history)).toBe(2);
  });
});

describe('DrawPolygonTool 绘制辅助（实时测度）', () => {
  let fx: ShapeDrawFixture<DrawPolygonTool>;
  beforeEach(() => {
    fx = setup();
  });

  it('3-4-5 直角三角形：面积 = 6、周长链累计（3+4）、vertexCount 随点数', () => {
    const tri: Array<[number, number, { x: number; y: number; z: number }]> = [
      [10, 10, { x: 0, y: 0, z: 0 }],
      [20, 20, { x: 3, y: 0, z: 0 }],
      [30, 30, { x: 3, y: 0, z: 4 }],
    ];
    for (const [sx, sy, ground] of tri) {
      fx.viewport.setGround(sx, sy, ground);
      fx.tool.onPointerDown(pointer(sx, sy));
    }

    const afterThird = fx.statuses.at(-1) as {
      area?: number;
      length?: number;
      vertexCount?: number;
    };
    expect(afterThird.area).toBeCloseTo(6, 10);
    expect(afterThird.length).toBeCloseTo(7, 10); // 已绘链长（含游标段）
    expect(afterThird.vertexCount).toBe(3);

    // 游标回到起点：实时环面积仍 = 6
    fx.tool.onPointerMove(pointer(10, 10));
    const last = fx.statuses.at(-1) as { area?: number };
    expect(last.area).toBeCloseTo(6, 10);
  });

  it('网格吸附默认开（1m）：落点 (1.4, 2.6) → (1, 3)', () => {
    fx.viewport.setGround(10, 10, { x: 1.4, y: 0, z: 2.6 });
    fx.tool.onPointerMove(pointer(10, 10));

    const last = fx.statuses.at(-1) as { cursor?: { x: number; y: number } };
    expect(last.cursor).toEqual({ x: 1, y: 3 });
  });

  it('G 键关闭网格吸附后保留原始坐标', () => {
    fx.tool.onKeyDown(key('g'));
    fx.viewport.setGround(10, 10, { x: 1.4, y: 0, z: 2.6 });
    fx.tool.onPointerMove(pointer(10, 10));

    const last = fx.statuses.at(-1) as { cursor?: { x: number; y: number } };
    expect(last.cursor).toEqual({ x: 1.4, y: 2.6 });
  });

  it('Shift 正交锁定：第二点仅沿主轴偏移', () => {
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(20, 20, { x: 3, y: 0, z: 2 });
    fx.tool.onPointerDown(pointer(20, 20, { shiftKey: true }));

    expect(fx.preview.lastDrawState?.points).toEqual([{ x: 0, y: 0 }, { x: 3, y: 0 }]);
  });
});

describe('DrawPolygonTool 校验拦截', () => {
  let fx: ShapeDrawFixture<DrawPolygonTool>;
  beforeEach(() => {
    fx = setup();
  });

  it('自相交（八字形）完成被拦：draw:status 错误、场景与历史零变化、已绘点保留（预览仍在）', () => {
    const bowtie: Array<[number, number, { x: number; y: number; z: number }]> = [
      [10, 10, { x: 0, y: 0, z: 0 }],
      [20, 20, { x: 4, y: 0, z: 0 }],
      [30, 30, { x: 0, y: 0, z: 4 }],
      [40, 40, { x: 4, y: 0, z: 4 }],
    ];
    for (const [sx, sy, ground] of bowtie) {
      fx.viewport.setGround(sx, sy, ground);
      fx.tool.onPointerDown(pointer(sx, sy));
    }

    fx.tool.onDoubleClick(pointer(40, 40));

    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
    const blocked = fx.statuses.at(-1) as { error?: string };
    expect(blocked.error).toBeTruthy();
    expect(blocked.error).toMatch(/相交/);
    // 已绘点保留：预览仍显示 4 个顶点（供用户修正后重试）
    expect(fx.preview.lastDrawState?.points).toHaveLength(4);
  });

  it('顶点不足（2 点双击）被拦：错误提示、场景零变化', () => {
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(20, 20, { x: 4, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(20, 20));
    fx.tool.onDoubleClick(pointer(20, 20));

    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
    expect((fx.statuses.at(-1) as { error?: string }).error).toMatch(/至少需要 3 个点/);
  });
});

describe('DrawPolygonTool 取消', () => {
  it('ESC（ToolManager.cancel）：半成品清空、清预览、退出、场景与历史零变化', () => {
    const fx = setup();
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(20, 20, { x: 4, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(20, 20));

    fx.tools.cancel();

    expect(fx.tools.getActiveTool()).toBeNull();
    expect(fx.preview.clearCount).toBe(1);
    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
  });

  it('工具内 ESC 防御路径：清草稿与预览、工具保持激活、后续双击因顶点不足被拦', () => {
    const fx = setup();
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));

    fx.tool.onKeyDown(ESC);

    expect(fx.preview.clearCount).toBe(1);
    expect(fx.tools.getActiveTool()).toBe(fx.tool);

    fx.tool.onDoubleClick(pointer(10, 10));
    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect((fx.statuses.at(-1) as { error?: string }).error).toBeTruthy();
  });

  it('右键 onPointerDown（防御路径，T5.8 起输入层不再转发右键）：清草稿，零 Command', () => {
    const fx = setup();
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));

    fx.tool.onPointerDown(pointer(10, 10, { button: 'right' }));

    expect(fx.preview.clearCount).toBe(1);
    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
  });
});

describe('DrawPolygonTool 归层与命名（T6.5：unclassified 初始态）', () => {
  it('场景有「未分类」图层 → 完成 → layerId 指向该图层', () => {
    const fx = setupShapeDraw(new DrawPolygonTool(createDrawGridConfig(1)));
    const layer = fx.addLayer('未分类');
    fx.tools.activate('draw-polygon', { shape: 'polygon' });
    const corners: Array<[number, number, { x: number; y: number; z: number }]> = [
      [10, 10, { x: 0, y: 0, z: 0 }],
      [20, 20, { x: 4, y: 0, z: 0 }],
      [30, 30, { x: 4, y: 0, z: 4 }],
    ];
    for (const [sx, sy, ground] of corners) {
      fx.viewport.setGround(sx, sy, ground);
      fx.tool.onPointerDown(pointer(sx, sy));
    }
    fx.tool.onDoubleClick(pointer(30, 30));

    const region = regionsOf(fx.sceneManager)[0]!;
    expect(region.layerId).toBe(layer.id);
    expect(layer.objectIds).toEqual([region.id]); // 派生索引同步
    expect(region.name).toBe('未命名区域 1');
  });

  it('场景无「未分类」图层 → layerId=null（现状兼容）', () => {
    const fx = setup(); // 不添加任何图层
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.viewport.setGround(20, 20, { x: 4, y: 0, z: 0 });
    fx.viewport.setGround(30, 30, { x: 4, y: 0, z: 4 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(20, 20));
    fx.tool.onPointerDown(pointer(30, 30));
    fx.tool.onDoubleClick(pointer(30, 30));

    expect(regionsOf(fx.sceneManager)[0]!.layerId).toBeNull();
  });
});
