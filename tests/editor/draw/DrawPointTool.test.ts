/**
 * tests/editor/draw/DrawPointTool.test.ts —— 点（POI）绘制工具测试（FakePort，零 three）。
 *
 * 覆盖（T3.2 验收 + 阶段门裁定 2026-09-09 + T6.5 形状驱动改造）：
 * - 激活校验：缺参数 / 非法 shape / shape 不匹配 → 抛错且 activeTool 复位 null；
 * - 相机：默认进入切顶视 + 锁旋转，退出恢复透视 + 解锁；perspective:true 不动机位只锁旋转；
 * - 点击放置：左键 → 场景 +1 point RegionObject（坐标 = 地面点经网格吸附、closed=false、
 *   unclassified + default_solid、region_ 前缀）+ 自动选中；完成后工具保持激活（连续放置）；
 * - 网格吸附默认开（1m），G 键切换；Shift 正交锁定（第二点仅沿主轴偏移）；
 * - 历史粒度（阶段门，T6.5 沿用）：连续点绘制段合并为 1 条历史（undo 一次全撤）；
 *   重新激活另起一段；
 * - 预览隔离：移动期间零对象零命令，预览只经 PreviewPort.updateDrawPreview；
 * - draw:status：移动发出游标坐标，放置后 vertexCount=1，不含 length/area；
 * - ESC（唯一退出手势，T5.8）：清预览、零 Command；已放置对象保留且选中保留（三步流）；
 * - 相同落点连击去重（双击语义只落一枚）。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { DrawPointTool } from '../../../src/editor/tools/draw/DrawPointTool';
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

function setup(): ShapeDrawFixture<DrawPointTool> {
  const fx = setupShapeDraw(new DrawPointTool(createDrawGridConfig(1)));
  fx.tools.activate('draw-point', { shape: 'point' });
  return fx;
}

describe('DrawPointTool 激活校验', () => {
  it('缺少参数 → 抛错且 activeTool 复位 null', () => {
    const fx = setupShapeDraw(new DrawPointTool(createDrawGridConfig(1)));
    expect(() => fx.tools.activate('draw-point')).toThrow(/shape/);
    expect(fx.tools.getActiveTool()).toBeNull();
  });

  it('参数非对象 → 抛错', () => {
    const fx = setupShapeDraw(new DrawPointTool(createDrawGridConfig(1)));
    expect(() => fx.tools.activate('draw-point', 42)).toThrow(/shape/);
  });

  it('非法 shape → 抛错', () => {
    const fx = setupShapeDraw(new DrawPointTool(createDrawGridConfig(1)));
    expect(() => fx.tools.activate('draw-point', { shape: 'ghost' })).toThrow(/shape/);
    expect(fx.tools.getActiveTool()).toBeNull();
  });

  it('shape 不匹配（point 工具收 line）→ 抛错且复位', () => {
    const fx = setupShapeDraw(new DrawPointTool(createDrawGridConfig(1)));
    expect(() => fx.tools.activate('draw-point', { shape: 'line' })).toThrow(/point/);
    expect(fx.tools.getActiveTool()).toBeNull();
  });
});

describe('DrawPointTool 相机', () => {
  it('默认进入：切顶视 + 锁旋转；退出：恢复透视 + 解锁', () => {
    const fx = setup();
    expect(fx.camera.modes).toEqual(['top']);
    expect(fx.camera.orthoLocks).toEqual([true]);

    fx.tools.deactivate();
    expect(fx.camera.modes).toEqual(['top', 'perspective']);
    expect(fx.camera.orthoLocks[fx.camera.orthoLocks.length - 1]).toBe(false);
  });

  it('perspective:true → 不切机位（保留透视）只锁旋转；退出不切机位', () => {
    const fx = setupShapeDraw(new DrawPointTool(createDrawGridConfig(1)));
    fx.tools.activate('draw-point', { shape: 'point', perspective: true });

    expect(fx.camera.modes).toEqual([]);
    expect(fx.camera.orthoLocks).toEqual([true]);

    fx.tools.deactivate();
    expect(fx.camera.modes).toEqual([]);
    expect(fx.camera.orthoLocks[fx.camera.orthoLocks.length - 1]).toBe(false);
  });
});

describe('DrawPointTool 点击放置', () => {
  let fx: ShapeDrawFixture<DrawPointTool>;
  beforeEach(() => {
    fx = setup();
  });

  it('左键 → 场景 +1 point RegionObject：坐标、三层字段、region_ 前缀、可见未锁定、自动选中、工具保持激活', () => {
    fx.tool.onPointerDown(pointer(10, 10));

    const regions = regionsOf(fx.sceneManager);
    expect(regions).toHaveLength(1);
    const region = regions[0]!;
    expect(region.id.startsWith('region_')).toBe(true);
    expect(region.shape.type).toBe('point');
    expect(region.shape.points).toEqual([{ x: 0, y: 0 }]);
    expect(region.shape.closed).toBe(false);
    expect(region.semantic).toEqual({ type: 'unclassified', properties: {} });
    expect(region.style).toEqual({ presetId: 'default_solid', overrides: {} });
    expect(region.visible).toBe(true);
    expect(region.locked).toBe(false);
    expect(region.layerId).toBeNull();
    expect(fx.selection.getSelectedIds()).toEqual([region.id]);
    expect(fx.tools.getActiveTool()).toBe(fx.tool); // 连续放置：不回选择
  });

  it('网格吸附默认开（1m）：落点 (5.4, 2.6) → (5, 3)', () => {
    fx.viewport.setGround(10, 10, { x: 5.4, y: 0, z: 2.6 });
    fx.tool.onPointerDown(pointer(10, 10));

    expect(regionsOf(fx.sceneManager)[0]!.shape.points).toEqual([{ x: 5, y: 3 }]);
  });

  it('G 键关闭网格吸附：落点保留原始坐标；再按 G 恢复', () => {
    fx.viewport.setGround(10, 10, { x: 5.4, y: 0, z: 2.6 });
    fx.tool.onKeyDown(key('g'));
    fx.tool.onPointerDown(pointer(10, 10));

    expect(regionsOf(fx.sceneManager)[0]!.shape.points).toEqual([{ x: 5.4, y: 2.6 }]);

    fx.tool.onKeyDown(key('G')); // 大写同样生效
    fx.viewport.setGround(20, 20, { x: 5.4, y: 0, z: 2.6 });
    fx.tool.onPointerDown(pointer(20, 20));
    expect(regionsOf(fx.sceneManager)[1]!.shape.points).toEqual([{ x: 5, y: 3 }]);
  });

  it('Shift 正交锁定：第二点仅沿主轴偏移（X 主轴 → z 取锚点）', () => {
    fx.viewport.setGround(10, 10, { x: 0, y: 0, z: 0 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.viewport.setGround(20, 20, { x: 3, y: 0, z: 2 });
    fx.tool.onPointerDown(pointer(20, 20, { shiftKey: true }));

    const coords = regionsOf(fx.sceneManager).map((r) => r.shape.points[0]);
    expect(coords).toEqual([
      { x: 0, y: 0 },
      { x: 3, y: 0 },
    ]);
  });

  it('相同落点连击去重（双击语义只落一枚）', () => {
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(10, 10)); // 同屏幕坐标 → 同地面点 → 去重

    expect(regionsOf(fx.sceneManager)).toHaveLength(1);
  });
});

describe('DrawPointTool 历史粒度（阶段门：连续段合并 1 条，T6.5 沿用）', () => {
  let fx: ShapeDrawFixture<DrawPointTool>;
  beforeEach(() => {
    fx = setup();
  });

  it('连续 3 击 → 3 个 region、历史恰好 1 条（undo 一次全撤）、末枚选中', () => {
    fx.viewport.setGround(10, 10, { x: 1, y: 0, z: 1 });
    fx.viewport.setGround(20, 20, { x: 2, y: 0, z: 2 });
    fx.viewport.setGround(30, 30, { x: 3, y: 0, z: 3 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(20, 20));
    fx.tool.onPointerDown(pointer(30, 30));

    const regions = regionsOf(fx.sceneManager);
    expect(regions).toHaveLength(3);
    expect(fx.selection.getSelectedIds()).toEqual([regions[2]!.id]);
    expect(undoDepth(fx.history)).toBe(1); // undoDepth 会清选中（undo+redo），置后断言

    fx.history.undo();
    expect(regionsOf(fx.sceneManager)).toHaveLength(0);
  });

  it('绘制期间历史零增长；重新激活另起一段', () => {
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(10, 10));
    expect(fx.history.canUndo()).toBe(true); // 第一段 1 条

    // 重新激活（ToolManager 完整切换）= 另起会话段
    fx.tools.activate('draw-point', { shape: 'point' });
    fx.tool.onPointerDown(pointer(10, 10));

    expect(regionsOf(fx.sceneManager)).toHaveLength(2);
    expect(undoDepth(fx.history)).toBe(2);
  });
});

describe('DrawPointTool 预览隔离与状态事件', () => {
  let fx: ShapeDrawFixture<DrawPointTool>;
  beforeEach(() => {
    fx = setup();
  });

  it('移动期间零对象零命令；预览只经 updateDrawPreview（geometryType=Point）', () => {
    fx.tool.onPointerMove(pointer(10, 10));
    fx.tool.onPointerMove(pointer(20, 20));

    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
    expect(fx.preview.ghostCalls).toBe(0);
    expect(fx.preview.drawUpdates.length).toBeGreaterThan(0);
    expect(fx.preview.lastDrawState?.geometryType).toBe('Point');
    expect(fx.preview.lastDrawState?.cursor).toEqual({ x: 0, y: 0 });
  });

  it('draw:status：移动发出游标坐标（吸附后），不含 length/area；放置后 vertexCount=1', () => {
    fx.viewport.setGround(10, 10, { x: 2.4, y: 0, z: 1.2 });
    fx.tool.onPointerMove(pointer(10, 10));

    const moving = fx.statuses.at(-1) as {
      cursor?: { x: number; y: number };
      length?: number;
      area?: number;
      vertexCount?: number;
    };
    expect(moving.cursor).toEqual({ x: 2, y: 1 });
    expect(moving.length).toBeUndefined();
    expect(moving.area).toBeUndefined();
    expect(moving.vertexCount).toBeUndefined(); // 尚未放置

    fx.tool.onPointerDown(pointer(10, 10));
    const placed = fx.statuses.at(-1) as { vertexCount?: number };
    expect(placed.vertexCount).toBe(1);
  });

  it('点击处无地面投影：不放置、不入历史、不发状态', () => {
    fx.viewport.setGround(40, 40, null);
    const before = fx.statuses.length;
    fx.tool.onPointerDown(pointer(40, 40));

    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
    expect(fx.statuses.length).toBe(before);
  });
});

describe('DrawPointTool 退出', () => {
  it('ESC（ToolManager.cancel）：清预览、退出工具、零新命令；已放置对象与选中保留（三步流闭环）', () => {
    const fx = setup();
    fx.tool.onPointerMove(pointer(10, 10));
    fx.tool.onPointerDown(pointer(10, 10));
    const placed = regionsOf(fx.sceneManager);
    expect(placed).toHaveLength(1);

    fx.tools.cancel();

    expect(fx.tools.getActiveTool()).toBeNull();
    expect(fx.preview.clearCount).toBe(1);
    expect(regionsOf(fx.sceneManager)).toHaveLength(1);
    expect(fx.selection.getSelectedIds()).toEqual([placed[0]!.id]); // 选中保留
    expect(fx.history.canUndo()).toBe(true); // 仍是放置时的那 1 条
  });

  it('工具内 ESC 防御路径（onKeyDown）：只清预览，不退工具、零 Command', () => {
    const fx = setup();
    fx.tool.onPointerMove(pointer(10, 10));

    fx.tool.onKeyDown(ESC);

    expect(fx.preview.clearCount).toBe(1);
    expect(fx.tools.getActiveTool()).toBe(fx.tool);
    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
  });

  it('右键 onPointerDown（防御路径，T5.8 起输入层不再转发右键）：清预览、不放置', () => {
    const fx = setup();
    fx.tool.onPointerMove(pointer(10, 10));

    fx.tool.onPointerDown(pointer(10, 10, { button: 'right' }));

    expect(fx.preview.clearCount).toBe(1);
    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.canUndo()).toBe(false);
  });

  it('退出后重新激活：状态复位（吸附/锁定/会话批次重新开始）', () => {
    const fx = setup();
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onKeyDown(key('g')); // 会话内关掉吸附
    fx.tools.cancel();

    fx.tools.activate('draw-point', { shape: 'point' });
    fx.viewport.setGround(10, 10, { x: 2.4, y: 0, z: 1.2 });
    fx.tool.onPointerDown(pointer(10, 10));

    // 吸附默认恢复开启：2.4,1.2 → 2,1
    expect(regionsOf(fx.sceneManager)[1]!.shape.points).toEqual([{ x: 2, y: 1 }]);
  });
});

describe('DrawPointTool 归层与命名（T6.5：unclassified 初始态）', () => {
  it('场景有「未分类」图层 → 放置归层（含连续段第 2 枚）；无该图层 → layerId=null', () => {
    const fx = setupShapeDraw(new DrawPointTool(createDrawGridConfig(1)));
    const layer = fx.addLayer('未分类');
    fx.tools.activate('draw-point', { shape: 'point' });
    fx.viewport.setGround(10, 10, { x: 1, y: 0, z: 2 });
    fx.viewport.setGround(20, 20, { x: 3, y: 0, z: 4 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(20, 20));

    const regions = regionsOf(fx.sceneManager);
    expect(regions).toHaveLength(2);
    for (const region of regions) expect(region.layerId).toBe(layer.id);
    expect([...layer.objectIds].sort()).toEqual([...regions.map((r) => r.id)].sort()); // 派生索引同步
    expect(regions[0]!.name).toBe('未命名区域 1');
    expect(regions[1]!.name).toBe('未命名区域 2');

    const fx2 = setup();
    fx2.tool.onPointerDown(pointer(10, 10));
    expect(regionsOf(fx2.sceneManager)[0]!.layerId).toBeNull();
  });

  it('mergeBatch 连续段：第 3 枚触发撤销重建更大批 → 全部归层不丢；undo/redo 后仍在图层', () => {
    const fx = setupShapeDraw(new DrawPointTool(createDrawGridConfig(1)));
    const layer = fx.addLayer('未分类');
    fx.tools.activate('draw-point', { shape: 'point' });
    fx.viewport.setGround(10, 10, { x: 1, y: 0, z: 1 });
    fx.viewport.setGround(20, 20, { x: 2, y: 0, z: 2 });
    fx.viewport.setGround(30, 30, { x: 3, y: 0, z: 3 });
    fx.tool.onPointerDown(pointer(10, 10));
    fx.tool.onPointerDown(pointer(20, 20));
    fx.tool.onPointerDown(pointer(30, 30)); // 会话批次撤销重建路径

    const regions = regionsOf(fx.sceneManager);
    expect(regions).toHaveLength(3);
    for (const region of regions) expect(region.layerId).toBe(layer.id);
    expect(undoDepth(fx.history)).toBe(1); // 仍是一条历史

    fx.history.undo();
    fx.history.redo();
    for (const region of regionsOf(fx.sceneManager)) expect(region.layerId).toBe(layer.id);
  });

  it('绘制期间删除目标图层 → 完成时解析失败 → layerId=null（完成时解析语义）', () => {
    const fx = setupShapeDraw(new DrawPointTool(createDrawGridConfig(1)));
    const layer = fx.addLayer('未分类');
    fx.tools.activate('draw-point', { shape: 'point' });
    fx.sceneManager.removeLayer(layer.id); // 激活后、落点前图层被删
    fx.tool.onPointerDown(pointer(10, 10));
    expect(regionsOf(fx.sceneManager)[0]!.layerId).toBeNull();
  });
});

describe('DrawPointTool 机位恢复（T4.1 B3：activate 记录原机位、退出还原）', () => {
  function setupAt(mode: 'perspective' | 'top' | 'front' | 'side', perspective = false): ShapeDrawFixture<DrawPointTool> {
    const fx = setupShapeDraw(new DrawPointTool(createDrawGridConfig(1)));
    fx.camera.mode = mode; // 预设进入绘制前的用户机位
    fx.tools.activate('draw-point', { shape: 'point', perspective });
    return fx;
  }

  it('front 机位进入（默认自动切 top）→ 退出恢复 front（不再硬编码 perspective）', () => {
    const fx = setupAt('front');
    expect(fx.camera.modes).toEqual(['top']);
    fx.tools.deactivate();
    expect(fx.camera.modes).toEqual(['top', 'front']);
    expect(fx.camera.getMode()).toBe('front');
  });

  it('perspective 机位进入 → 退出恢复 perspective（等价现状行为）', () => {
    const fx = setupAt('perspective');
    fx.tools.deactivate();
    expect(fx.camera.modes).toEqual(['top', 'perspective']);
  });

  it('perspective:true 进入（不切 top）→ 退出不动相机（savedMode 不消费）', () => {
    const fx = setupAt('front', true);
    expect(fx.camera.modes).toEqual([]);
    fx.tools.deactivate();
    expect(fx.camera.modes).toEqual([]);
  });

  it('连续两段：第一段退出已恢复 front，第二段以 front 为新基准再恢复', () => {
    const fx = setupAt('front');
    fx.tools.deactivate(); // ['top', 'front']，FakeCamera.mode='front'
    fx.tools.activate('draw-point', { shape: 'point' });
    fx.tools.deactivate();
    expect(fx.camera.modes).toEqual(['top', 'front', 'top', 'front']);
  });
});
