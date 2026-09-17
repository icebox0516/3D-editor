/**
 * tests/editor/draw/DrawLineTool.test.ts —— 路径（线）绘制工具测试（FakePort，零 three）。
 *
 * 覆盖（T3.2 验收 + 阶段门裁定 2026-09-09 + T6.5 形状驱动改造）：
 * - 激活校验：缺参数 / 非法 shape / shape 不匹配 → 抛错且 activeTool 复位 null；
 * - 相机：默认切顶视 + 锁旋转；perspective:true 保留原机位；退出恢复；
 * - 绘制流：点击加点、移动实时预览（updateDrawPreview，closed=false）、双击完成 →
 *   场景 +1 RegionObject（shape.type='line'、closed=false、顶点顺序一致、
 *   unclassified + default_solid）、每次完成恰 1 条历史（绘制期间历史零增长）、自动选中；
 * - 双击位置为新点时补入后再完成；与末点重合（浏览器双击两次 down）时去重；
 * - 顶点不足（<2）完成被拦：draw:status 错误提示、场景零变化、已绘点保留可续绘；
 * - 长度/顶点实时累计（事件 payload：3-4-5 折线 3+4=7、vertexCount）；
 * - 正交锁定（Shift，仅沿主轴偏移）、45° 锁定（A 键切换，落点在 45° 方向）、
 *   网格吸附（G，默认 1m）；
 * - ESC（唯一退出手势，T5.8）：清预览、退出、场景与历史零变化。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { DrawLineTool } from '../../../src/editor/tools/draw/DrawLineTool';
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

function setup(): ShapeDrawFixture<DrawLineTool> {
  const fx = setupShapeDraw(new DrawLineTool(createDrawGridConfig(1)));
  fx.tools.activate('draw-line', { shape: 'line' });
  return fx;
}

describe('DrawLineTool 激活校验与相机', () => {
  it('shape 不匹配（line 工具收 polygon）→ 抛错且 activeTool 复位 null', () => {
    const fx = setupShapeDraw(new DrawLineTool(createDrawGridConfig(1)));
    expect(() => fx.tools.activate('draw-line', { shape: 'polygon' })).toThrow(/line/);
    expect(fx.tools.getActiveTool()).toBeNull();
  });

  it('缺参数 → 抛错', () => {
    const fx = setupShapeDraw(new DrawLineTool(createDrawGridConfig(1)));
    expect(() => fx.tools.activate('draw-line')).toThrow(/shape/);
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
    const fx = setupShapeDraw(new DrawLineTool(createDrawGridConfig(1)));
    fx.tools.activate('draw-line', { shape: 'line', perspective: true });
    expect(fx.camera.modes).toEqual([]);
    fx.tools.deactivate();
    expect(fx.camera.modes).toEqual([]);
    expect(fx.camera.orthoLocks.at(-1)).toBe(false);
  });
});

describe('DrawLineTool 绘制流与历史', () => {
  let fx: ShapeDrawFixture<DrawLineTool>;
  beforeEach(() => {
    fx = setup();
  });

  it('两点 + 双击 → 场景 +1 line RegionObject（顶点顺序一致、closed=false、三层字段、自动选中）；绘制期间历史零增长，完成后恰 1 条', () => {
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerMove(pointer(10, 10));
    fx.tool.onPointerDown(pointer(10, 10));
    expect(fx.history.canUndo()).toBe(false); // 加点不入历史

    fx.viewport.setGround(20, 20, { x: 3, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(20, 20));
    fx.tool.onDoubleClick(pointer(20, 20)); // 双击位置 = 末点 → 去重

    const regions = regionsOf(fx.sceneManager);
    expect(regions).toHaveLength(1);
    const region = regions[0]!;
    expect(region.shape.type).toBe('line');
    expect(region.shape.points).toEqual([{ x: 0, y: 0 }, { x: 3, y: 0 }]);
    expect(region.shape.closed).toBe(false);
    expect(region.semantic).toEqual({ type: 'unclassified', properties: {} });
    expect(region.style).toEqual({ presetId: 'default_solid', overrides: {} });
    expect(fx.selection.getSelectedIds()).toEqual([region.id]);
    expect(undoDepth(fx.history)).toBe(1);

    fx.history.undo();
    expect(regionsOf(fx.sceneManager)).toHaveLength(0);
  });

  it('双击位置为新点 → 补入后完成（3 顶点）', () => {
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(20, 20, { x: 3, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(20, 20));
    fx.viewport.setGround(30, 30, { x: 3, y: 0, z: 4 });
    fx.tool.onDoubleClick(pointer(30, 30));

    expect(regionsOf(fx.sceneManager)[0]!.shape.points).toEqual([
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 4 },
    ]);
  });

  it('半成品只经预览：points + cursor 弹性段、closed=false', () => {
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(30, 30, { x: 3, y: 0, z: 4 });
    fx.tool.onPointerMove(pointer(30, 30));

    expect(fx.preview.lastDrawState?.geometryType).toBe('LineString');
    expect(fx.preview.lastDrawState?.closed).toBe(false);
    expect(fx.preview.lastDrawState?.points).toEqual([{ x: 0, y: 0 }]);
    expect(fx.preview.lastDrawState?.cursor).toEqual({ x: 3, y: 4 });
  });

  it('完成后清预览可续绘第二条（每次完成各一条历史）', () => {
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(20, 20, { x: 4, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(20, 20));
    fx.tool.onDoubleClick(pointer(20, 20));
    expect(fx.preview.clearCount).toBe(1);

    fx.viewport.setGround(30, 30, { x: 10, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(30, 30));
    fx.viewport.setGround(40, 40, { x: 14, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(40, 40));
    fx.tool.onDoubleClick(pointer(40, 40));

    expect(regionsOf(fx.sceneManager)).toHaveLength(2);
    expect(undoDepth(fx.history)).toBe(2);
  });

  it('顶点不足（1 点双击）被拦：错误提示、场景零变化、已绘点保留可续绘', () => {
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onDoubleClick(pointer(10, 10));

    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
    expect((fx.statuses.at(-1) as { error?: string }).error).toMatch(/至少需要 2 个点/);

    // 已绘点保留：续绘第二点后可完成
    fx.viewport.setGround(20, 20, { x: 4, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(20, 20));
    fx.tool.onDoubleClick(pointer(20, 20));
    expect(regionsOf(fx.sceneManager)).toHaveLength(1);
  });
});

describe('DrawLineTool 绘制辅助（实时测度与键位）', () => {
  let fx: ShapeDrawFixture<DrawLineTool>;
  beforeEach(() => {
    fx = setup();
  });

  it('3-4-5 折线：长度实时 3+4=7（含游标段）、vertexCount 随点数', () => {
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(20, 20, { x: 3, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(20, 20));
    fx.viewport.setGround(30, 30, { x: 3, y: 0, z: 4 });
    fx.tool.onPointerMove(pointer(30, 30));

    const last = fx.statuses.at(-1) as { length?: number; vertexCount?: number; area?: number };
    expect(last.length).toBeCloseTo(7, 10);
    expect(last.vertexCount).toBe(2);
    expect(last.area).toBeUndefined(); // 线不发面积
  });

  it('Shift 正交锁定：第二点仅沿主轴偏移', () => {
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(20, 20, { x: 3, y: 0, z: 2 });
    fx.tool.onPointerDown(pointer(20, 20, { shiftKey: true }));

    expect(fx.preview.lastDrawState?.points).toEqual([{ x: 0, y: 0 }, { x: 3, y: 0 }]);
  });

  it('A 键 45° 锁定：后续落点吸附到最近 45° 方向（1,2 → 45° 线 + 网格 → (2,2)）', () => {
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onKeyDown(key('a'));
    fx.viewport.setGround(20, 20, { x: 1, y: 0, z: 2 });
    fx.tool.onPointerMove(pointer(20, 20));

    const last = fx.statuses.at(-1) as { cursor?: { x: number; y: number } };
    expect(last.cursor).toEqual({ x: 2, y: 2 }); // 63.4° → 45° 方向 + 距离 √5 + 1m 网格
  });

  it('网格吸附默认开（1m）；G 键切换', () => {
    fx.viewport.setGround(10, 10, { x: 1.4, y: 0, z: 2.6 });
    fx.tool.onPointerMove(pointer(10, 10));
    expect((fx.statuses.at(-1) as { cursor?: { x: number; y: number } }).cursor).toEqual({ x: 1, y: 3 });

    fx.tool.onKeyDown(key('g'));
    fx.viewport.setGround(20, 20, { x: 1.4, y: 0, z: 2.6 });
    fx.tool.onPointerMove(pointer(20, 20));
    expect((fx.statuses.at(-1) as { cursor?: { x: number; y: number } }).cursor).toEqual({ x: 1.4, y: 2.6 });
  });
});

describe('DrawLineTool 取消', () => {
  it('ESC（ToolManager.cancel）：清预览、退出、场景与历史零变化', () => {
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

  it('工具内 ESC 防御路径：清草稿清预览、工具保持激活、零 Command', () => {
    const fx = setup();
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));

    fx.tool.onKeyDown(ESC);

    expect(fx.preview.clearCount).toBe(1);
    expect(fx.tools.getActiveTool()).toBe(fx.tool);
    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
  });

  it('右键 onPointerDown（防御路径）：清草稿，零 Command', () => {
    const fx = setup();
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));

    fx.tool.onPointerDown(pointer(10, 10, { button: 'right' }));

    expect(fx.preview.clearCount).toBe(1);
    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
  });
});
