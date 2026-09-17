/**
 * tests/editor/draw/cameraModeCoexist.test.ts —— HUD 机位下拉与绘制工具并存语义
 * 回归测试（T5.7，先测后码）。
 *
 * 场景：绘制中经 HUD「Perspective ▼」切机位（CameraPort.setMode 直调，不经工具系统）。
 * 锁定语义（T4.1 savedMode 恢复不受影响 + 机位切换不抢工具）：
 * - setMode 不打断激活中的绘制工具（getActiveTool 不变、绘制会话可继续完成）；
 * - orthoLock 不被解除（无 setOrthoLock(false) 逃逸）；
 * - 退出绘制仍恢复进入前机位（savedMode）并解锁。
 */
import { describe, expect, it } from 'vitest';
import { DrawPointTool } from '../../../src/editor/tools/draw/DrawPointTool';
import { pointer, setupShapeDraw } from './fakes';

describe('绘制中切机位：不抢工具 / orthoLock 并存 / savedMode 恢复', () => {
  it('HUD 机位切换（setMode 直调）不打断绘制，可继续落点完成', () => {
    const fixture = setupShapeDraw(new DrawPointTool());
    fixture.tools.activate('draw-point', { shape: 'point', perspective: false });
    // 进入绘制：切顶视 + 锁旋转
    expect(fixture.camera.mode).toBe('top');
    expect(fixture.camera.orthoLocks).toEqual([true]);

    // 绘制第一个点（点击即成；沿 DrawPointTool.test 连击模式——预置两个不同地面点）
    fixture.viewport.setGround(10, 10, { x: 1, y: 0, z: 1 });
    fixture.viewport.setGround(30, 40, { x: 3, y: 0, z: 4 });
    fixture.tool.onPointerDown(pointer(10, 10));
    expect(fixture.sceneManager.getObjects()).toHaveLength(1);

    // HUD 机位下拉切到侧视（不经工具系统，模拟 CameraPort.setMode 直调）
    fixture.camera.setMode('side');
    expect(fixture.tools.getActiveTool()?.id).toBe('draw-point'); // 工具未被抢走
    expect(fixture.camera.orthoLocks).toEqual([true]); // orthoLock 未被解除

    // 绘制会话仍可继续完成（连续绘制第二点）
    fixture.tool.onPointerDown(pointer(30, 40));
    expect(fixture.sceneManager.getObjects()).toHaveLength(2);
  });

  it('退出绘制：恢复进入前机位（savedMode）并解锁——T4.1 语义不回归', () => {
    const fixture = setupShapeDraw(new DrawPointTool());
    fixture.camera.mode = 'front'; // 预设进入前机位
    fixture.tools.activate('draw-point', { shape: 'point', perspective: false });

    // 绘制中用户经 HUD 切机位
    fixture.camera.setMode('side');

    fixture.tools.deactivate();
    expect(fixture.camera.mode).toBe('front'); // 恢复进入前机位（非 top 非 side）
    expect(fixture.camera.orthoLocks).toEqual([true, false]); // 进入锁 / 退出解锁
  });

  it('perspective:true 进入（不切顶视）：HUD 切机位后退出不强行复位（enteredTop=false 不恢复）', () => {
    const fixture = setupShapeDraw(new DrawPointTool());
    fixture.tools.activate('draw-point', { shape: 'point', perspective: true });
    expect(fixture.camera.modes).toEqual([]); // 保留用户机位，未切 top

    fixture.camera.setMode('top'); // HUD 切换
    fixture.tools.deactivate();
    expect(fixture.camera.mode).toBe('top'); // perspective 进入不记录恢复（既有语义）
    expect(fixture.camera.orthoLocks).toEqual([true, false]);
  });
});
