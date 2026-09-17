/**
 * tests/ui/tools/toolIA.measure.test.ts —— 测量模式整合测试（T10.2，先测后码）。
 *
 * 覆盖（任务书 §1/§3 + stage10 §E）：
 * - MEASURE_SUBTOOLS：四子工具表（distance/height/area/angle）——toolId 与
 *   editor/tools/measure MEASURE_TOOL_IDS 同源、label/hint 齐备、无数字键；
 * - toggleMeasureTool（垂直条 / 芯片 / 菜单共用入口）：激活 → 激活中再触同 kind →
 *   cancel 退出（tool:changed(null)）；异 kind 即切；
 * - activateWorkMode('measure')：T10.2 启用（写入 workspaceStore.mode）；
 *   切出测量模式**不清空 MeasureSession**（会话生命周期归组合根——仅「清除全部」
 *   与显式动作清，stage10 §A）；
 * - contextToolsFor 测量态中段：四 kind 芯片（当前 kind active）+ 手势提示，
 *   与 draw / vertexEdit / roadSplit 中段互斥；非测量工具 → measure 段 null；
 * - contextActionsFor：测量工具激活期间 → null（中段归测量态，沿绘制/放置先例）。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { createEditor } from '../../../src/app/bootstrap';
import { MEASURE_TOOL_IDS } from '../../../src/editor/tools/measure';
import { createMeasureItem } from '../../../src/editor/services/measure';
import { createRegionObject } from '../../../src/domain/regions';
import { useWorkspaceStore } from '../../../src/ui/layout/workspaceStore';
import {
  MEASURE_SUBTOOLS,
  activateWorkMode,
  contextActionsFor,
  contextToolsFor,
  toggleMeasureTool,
} from '../../../src/ui/tools/toolIA';

/** contextToolsFor 最小状态输入 */
function stateOf(activeToolId: string | null) {
  return { activeToolId, gizmoMode: 'translate' as const, snapEnabled: true, gridVisible: true };
}

beforeEach(() => {
  useWorkspaceStore.getState().setMode('scene');
});

// ── MEASURE_SUBTOOLS（垂直条 / 芯片 / 菜单共用数据表）─────────

describe('MEASURE_SUBTOOLS（四测量子工具表，无数字键）', () => {
  it('四 kind 按固定序（distance/height/area/angle）；toolId 与引擎 MEASURE_TOOL_IDS 同源', () => {
    expect(MEASURE_SUBTOOLS.map((s) => s.kind)).toEqual(['distance', 'height', 'area', 'angle']);
    expect(MEASURE_SUBTOOLS.map((s) => s.toolId)).toEqual([...MEASURE_TOOL_IDS]);
  });

  it('label / hint 齐备（tooltip 与芯片文案单一真相源）', () => {
    for (const sub of MEASURE_SUBTOOLS) {
      expect(sub.label.length).toBeGreaterThan(0);
      expect(sub.hint.length).toBeGreaterThan(0);
    }
    const labels = MEASURE_SUBTOOLS.map((s) => s.label);
    expect(labels).toEqual(['距离', '高度差', '面积', '角度']);
  });
});

// ── toggleMeasureTool（共享激活入口）─────────────────────────

describe('toggleMeasureTool（垂直条 / 芯片 / 菜单同路）', () => {
  it('激活 → measure.distance；再触同 kind → cancel 退出', () => {
    const facade = createEditor(null);
    toggleMeasureTool(facade.tools, 'distance');
    expect(facade.tools.getActiveTool()?.id).toBe('measure.distance');

    toggleMeasureTool(facade.tools, 'distance'); // 再点退出
    expect(facade.tools.getActiveTool()).toBeNull();
    facade.dispose();
  });

  it('异 kind 即切（height → area，草稿弃、会话保留）', () => {
    const facade = createEditor(null);
    toggleMeasureTool(facade.tools, 'height');
    facade.measure.add(createMeasureItem('height', [
      { x: 0, y: 0, z: 0 },
      { x: 3, y: 4, z: 0 },
    ]));
    toggleMeasureTool(facade.tools, 'area');
    expect(facade.tools.getActiveTool()?.id).toBe('measure.area');
    expect(facade.measure.list()).toHaveLength(1); // 切子工具不清会话
    facade.dispose();
  });
});

// ── 模式启用语义（stage10 §E）────────────────────────────────

describe('测量模式启用（activateWorkMode + 会话生命周期）', () => {
  it("activateWorkMode('measure') 接受并写入 workspaceStore.mode", () => {
    const facade = createEditor(null);
    expect(activateWorkMode('measure', facade.tools)).toBe(true);
    expect(useWorkspaceStore.getState().mode).toBe('measure');
    facade.dispose();
  });

  it('切入测量模式：激活中的绘制工具先 cancel（沿既有模式切换语义）', () => {
    const facade = createEditor(null);
    facade.tools.activate('draw-polygon', { shape: 'polygon', perspective: false });
    expect(activateWorkMode('measure', facade.tools)).toBe(true);
    expect(facade.tools.getActiveTool()).toBeNull(); // cancel（ESC 同路零 Command）
    facade.dispose();
  });

  it('切出测量模式不清空 MeasureSession（会话归组合根生命周期）', () => {
    const facade = createEditor(null);
    activateWorkMode('measure', facade.tools);
    facade.measure.add(createMeasureItem('distance', [
      { x: 0, y: 0, z: 0 },
      { x: 5, y: 0, z: 0 },
    ]));
    expect(facade.measure.list()).toHaveLength(1);

    expect(activateWorkMode('scene', facade.tools)).toBe(true);
    expect(facade.measure.list()).toHaveLength(1); // 模式退出不清空（stage10 §A）

    facade.measure.clear(); // 显式动作才清
    expect(facade.measure.list()).toHaveLength(0);
    facade.dispose();
  });
});

// ── ContextToolbar 测量态中段（contextToolsFor）──────────────

describe('contextToolsFor（测量工具激活态中段）', () => {
  it('measure.* 激活 → measure 段：四 kind 芯片（当前位 active）+ 手势提示；其余中段 null', () => {
    const model = contextToolsFor(stateOf('measure.distance'));
    expect(model.measure).not.toBeNull();
    expect(model.measure!.kindOptions.map((o) => o.value)).toEqual([
      'distance',
      'height',
      'area',
      'angle',
    ]);
    expect(model.measure!.kindOptions.find((o) => o.value === 'distance')!.active).toBe(true);
    expect(model.measure!.kindOptions.filter((o) => o.active)).toHaveLength(1); // 单选位
    expect(model.measure!.hint).toContain('Esc');
    expect(model.draw).toBeNull();
    expect(model.vertexEdit).toBeNull();
    expect(model.roadSplit).toBeNull();
  });

  it('四 kind 各自命中 measure 段（height/area/angle 同构）', () => {
    for (const id of MEASURE_TOOL_IDS) {
      expect(contextToolsFor(stateOf(id)).measure).not.toBeNull();
    }
  });

  it('非测量工具 → measure 段 null（select / draw-* / vertex-edit / 空闲）', () => {
    expect(contextToolsFor(stateOf('select')).measure).toBeNull();
    expect(contextToolsFor(stateOf('draw-polygon')).measure).toBeNull();
    expect(contextToolsFor(stateOf('vertex-edit')).measure).toBeNull();
    expect(contextToolsFor(stateOf(null)).measure).toBeNull();
  });
});

// ── 上下文工具矩阵互斥（测量激活期间中段归测量态）────────────

describe('contextActionsFor（测量工具激活期间 → null）', () => {
  it('有选中 + measure.distance 激活 → null（沿绘制/放置/顶点编辑/道路分割先例）', () => {
    const region = createRegionObject({
      shape: {
        type: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 8, y: 0 },
          { x: 8, y: 8 },
        ],
        baseHeight: 0,
        closed: true,
      },
      semanticType: 'building',
    });
    expect(contextActionsFor([region], 'measure.distance')).toBeNull();
    expect(contextActionsFor([region], 'measure.angle')).toBeNull();
  });
});
