/**
 * tests/editor/tools/vertexSnapPipeline.test.ts —— 顶点编辑吸附管线工厂测试（T8.1，先测后码）。
 *
 * 覆盖（与 DrawToolBase.applyAids 完全同语义——editor 纯函数单一真相源复用）：
 * - Shift 正交锁定：主轴取偏移大者，且优先于 A 键角度锁定（互斥）；
 * - A 键 45° 锁定（session.angleLock）：方向吸附保持距离；
 * - G 网格吸附（session.enabled ∧ drawGrid.snapEnabled ∧ 总开关）三取「与」；
 * - Ctrl 临时反转总状态：master on + Ctrl → 网格不吸；master off + Ctrl → 网格吸；
 * - 角度锁定不受总开关 / Ctrl 影响（绘制辅助锁定三键语义，任务书 §4）。
 * 边界：node 纯函数测试（管线为 editor 层工厂，runtime VertexSnapPipeline 结构化消费）。
 */
import { describe, expect, it } from 'vitest';
import type { Vec2 } from '../../../src/core/types';
import { createDrawGridConfig } from '../../../src/editor/tools/draw/DrawGridConfig';
import { createSnapTiersConfig } from '../../../src/editor/services/snapTiersConfig';
import { createVertexSnapPipeline } from '../../../src/editor/tools/vertexSnapPipeline';
import type { VertexSnapSession } from '../../../src/editor/tools/VertexEditTool';

const anchor: Vec2 = { x: 0, y: 0 };

function makePipeline(session: Partial<VertexSnapSession> = {}, master = true) {
  const snapSession: VertexSnapSession = { enabled: true, angleLock: false, ...session };
  const drawGrid = createDrawGridConfig(5);
  drawGrid.snapEnabled = true;
  const tiers = createSnapTiersConfig();
  tiers.masterEnabled = master;
  return { pipeline: createVertexSnapPipeline(snapSession, drawGrid, tiers), snapSession, drawGrid, tiers };
}

describe('正交与角度锁定（与绘制管线同语义）', () => {
  it('Shift：偏移大者为主轴投影（x 偏移大 → 锁 X）', () => {
    const { pipeline, drawGrid } = makePipeline();
    drawGrid.snapEnabled = false; // 关网格，纯看正交语义
    const p = pipeline.apply({ x: 6.3, y: 1.2 }, anchor, { shiftKey: true, ctrlKey: false });
    expect(p).toEqual({ x: 6.3, y: 0 });
  });

  it('Shift 正交锁定优先于 A 键角度锁定（互斥，Shift 优先）', () => {
    const { pipeline, drawGrid, tiers } = makePipeline({ angleLock: true });
    drawGrid.snapEnabled = false; // 关网格，纯看锁定语义
    tiers.masterEnabled = false; // 总开关也不影响锁定
    // 偏移 |x|<|y| → 锁 Z：x=anchor.x、y 保留（45° 锁定不会生效扭曲 x）
    const p = pipeline.apply({ x: 3, y: 8 }, anchor, { shiftKey: true, ctrlKey: true });
    expect(p.x).toBe(0);
    expect(p.y).toBeCloseTo(8, 9);
  });

  it('A 键 45°：126.87° 方向吸附到 135°，距离保持（无 Shift）', () => {
    const { pipeline, drawGrid } = makePipeline({ angleLock: true });
    drawGrid.snapEnabled = false;
    const p = pipeline.apply({ x: -3, y: 4 }, anchor, { shiftKey: false, ctrlKey: false });
    const d = 5 * Math.SQRT1_2;
    expect(p.x).toBeCloseTo(-d, 9);
    expect(p.y).toBeCloseTo(d, 9);
  });

  it('A 键关闭（默认）：无角度锁定', () => {
    const { pipeline, drawGrid } = makePipeline();
    drawGrid.snapEnabled = false;
    const p = pipeline.apply({ x: -3, y: 4 }, anchor, { shiftKey: false, ctrlKey: false });
    expect(p).toEqual({ x: -3, y: 4 });
  });
});

describe('网格吸附门控（G 会话 ∧ 全局 ∧ 总开关）', () => {
  it('全开：落点吸附 5m 网格（锁定之后施加）', () => {
    const { pipeline } = makePipeline();
    const p = pipeline.apply({ x: 6.3, y: 1.2 }, anchor, { shiftKey: false, ctrlKey: false });
    expect(p).toEqual({ x: 5, y: 0 });
  });

  it('G 会话关（enabled=false）→ 不吸附', () => {
    const { pipeline } = makePipeline({ enabled: false });
    const p = pipeline.apply({ x: 6.3, y: 1.2 }, anchor, { shiftKey: false, ctrlKey: false });
    expect(p).toEqual({ x: 6.3, y: 1.2 });
  });

  it('总开关（master）关 → 网格不吸，但角度锁定不受影响', () => {
    const { pipeline } = makePipeline({ angleLock: true }, false);
    // 网格部分被压制：126.87° 方向吸附 135° 后距离 5 → (−3.54, 3.54)，非网格点
    const p = pipeline.apply({ x: -3, y: 4 }, anchor, { shiftKey: false, ctrlKey: false });
    const d = 5 * Math.SQRT1_2;
    expect(p.x).toBeCloseTo(-d, 9);
    expect(p.y).toBeCloseTo(d, 9);
  });
});

describe('Ctrl 临时反转总状态（拖拽会话内）', () => {
  it('master on + Ctrl → 网格不吸（临时关）', () => {
    const { pipeline } = makePipeline();
    const p = pipeline.apply({ x: 6.3, y: 1.2 }, anchor, { shiftKey: false, ctrlKey: true });
    expect(p).toEqual({ x: 6.3, y: 1.2 });
  });

  it('master off + Ctrl → 网格吸（临时开）', () => {
    const { pipeline } = makePipeline({}, false);
    const p = pipeline.apply({ x: 6.3, y: 1.2 }, anchor, { shiftKey: false, ctrlKey: true });
    expect(p).toEqual({ x: 5, y: 0 });
  });

  it('反转只作用网格门控，不启用角度锁定', () => {
    const { pipeline } = makePipeline({}, false);
    const p = pipeline.apply({ x: -3, y: 4 }, anchor, { shiftKey: false, ctrlKey: true });
    // 网格吸：(−5, 5)；若错误地启用了 45° 锁定会得到 (−3.54, 3.54)
    expect(p).toEqual({ x: -5, y: 5 });
  });
});
