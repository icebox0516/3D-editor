/**
 * tests/ui/tools/toolIA.shapes.test.ts —— 形状驱动工具信息架构测试（T6.5，先测后码）。
 *
 * 覆盖：
 * - AREA_SUBTOOLS：区域组五子工具（多边形/矩形/圆形/椭圆/自由，子键 Shift+1..5）；
 * - VERTICAL_TOOLS：四分组垂直条（1 区域 / 2 路径 / 3 点 / 4 放置；变换组归 ContextToolbar）；
 *   VERTICAL_KEY_TO_TOOL 与之同源；
 * - shapeToolId：七形状 → 工具 id 映射；SHAPE_DRAW_LABELS 七形状显示名；
 * - toggleShapeDraw / toggleRegionDraw：激活 + drawTarget 记账 + lastAreaShape 记忆；
 *   激活中再触同形状 → cancel 退出；同组不同形状 → 切换；
 * - togglePlacement：有 lastAssetId → 激活放置（Models 图层解析）；无资产 → false 不激活；
 * - resolveDigitAction：e.code Digit1..5 + Shift → 区域子工具直切；Digit1..4 无 Shift →
 *   垂直条 toggle；其余 null；
 * - deriveMode：形状驱动派生（面类 → terrain、line → road、point → annotation、placement → decoration）；
 * - contextToolsFor：绘制态中段 = 面类形状切换器（五子工具芯片）+ 提示；线/点无切换器。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { createEditor } from '../../../src/app/bootstrap';
import { useEditorStore } from '../../../src/ui/store';
import {
  AREA_SUBTOOLS,
  KEY_TO_TRANSFORM_MODE,
  SELECT_KEY,
  SHAPE_DRAW_LABELS,
  VERTICAL_KEY_TO_TOOL,
  VERTICAL_TOOLS,
  contextToolsFor,
  deriveMode,
  resolveDigitAction,
  shapeToolId,
  togglePlacement,
  toggleRegionDraw,
  toggleShapeDraw,
} from '../../../src/ui/tools/toolIA';
import type { DrawContextSection } from '../../../src/ui/tools/toolIA';

function resetStore(): void {
  const s = useEditorStore.getState();
  s.setDrawTarget(null);
  useEditorStore.setState({ lastAreaShape: 'polygon', lastAssetId: null });
}

beforeEach(resetStore);

describe('AREA_SUBTOOLS（区域组五子工具）', () => {
  it('五项：多边形/矩形/圆形/椭圆/自由；子键 Shift+1..5；工具 id 对应', () => {
    expect(AREA_SUBTOOLS.map((t) => t.shapeType)).toEqual([
      'polygon',
      'rectangle',
      'circle',
      'ellipse',
      'freehand',
    ]);
    expect(AREA_SUBTOOLS.map((t) => t.subKey)).toEqual(['1', '2', '3', '4', '5']);
    expect(AREA_SUBTOOLS.map((t) => t.toolId)).toEqual([
      'draw-polygon',
      'draw-rectangle',
      'draw-circle',
      'draw-ellipse',
      'draw-freehand',
    ]);
    for (const tool of AREA_SUBTOOLS) {
      expect(tool.label.length).toBeGreaterThan(0);
      expect(tool.hint.length).toBeGreaterThan(0);
      expect(tool.toolId).toBe(shapeToolId(tool.shapeType));
    }
  });
});

describe('VERTICAL_TOOLS（四分组垂直条）', () => {
  it('四项：1 区域 / 2 路径 / 3 点 / 4 放置（任务书 §7.1 数据表）', () => {
    expect(VERTICAL_TOOLS.map((t) => t.id)).toEqual(['region', 'line', 'point', 'placement']);
    expect(VERTICAL_TOOLS.map((t) => t.key)).toEqual(['1', '2', '3', '4']);
    expect(VERTICAL_TOOLS.map((t) => t.toolId)).toEqual([
      'draw-polygon', // 区域主钮 = 记忆子工具（运行时按 lastAreaShape 解析）
      'draw-line',
      'draw-point',
      'placement',
    ]);
    for (const tool of VERTICAL_TOOLS) {
      expect(tool.label.length).toBeGreaterThan(0);
      expect(tool.hint.length).toBeGreaterThan(0);
    }
  });

  it('VERTICAL_KEY_TO_TOOL 与四项同源（键 → 同一对象引用）', () => {
    expect(Object.keys(VERTICAL_KEY_TO_TOOL)).toEqual(VERTICAL_TOOLS.map((t) => t.key));
    for (const tool of VERTICAL_TOOLS) {
      expect(VERTICAL_KEY_TO_TOOL[tool.key]).toBe(tool);
    }
  });
});

describe('shapeToolId / SHAPE_DRAW_LABELS（七形状映射）', () => {
  it('七形状 → 工具 id；显示名齐备', () => {
    expect(shapeToolId('polygon')).toBe('draw-polygon');
    expect(shapeToolId('rectangle')).toBe('draw-rectangle');
    expect(shapeToolId('circle')).toBe('draw-circle');
    expect(shapeToolId('ellipse')).toBe('draw-ellipse');
    expect(shapeToolId('freehand')).toBe('draw-freehand');
    expect(shapeToolId('line')).toBe('draw-line');
    expect(shapeToolId('point')).toBe('draw-point');
    expect(Object.keys(SHAPE_DRAW_LABELS)).toHaveLength(7);
    expect(SHAPE_DRAW_LABELS.polygon).toBe('多边形');
    expect(SHAPE_DRAW_LABELS.freehand).toBe('自由形状');
  });
});

describe('toggleShapeDraw / toggleRegionDraw（共享入口）', () => {
  it('激活对应形状工具并记账 drawTarget；面类同时记忆 lastAreaShape', () => {
    const facade = createEditor(null);
    toggleShapeDraw(facade.tools, 'rectangle');
    expect(facade.tools.getActiveTool()!.id).toBe('draw-rectangle');
    expect(useEditorStore.getState().drawTarget).toEqual({ shapeType: 'rectangle' });
    expect(useEditorStore.getState().lastAreaShape).toBe('rectangle');
    facade.dispose();
  });

  it('激活中再触同形状 → cancel 退出（记账保留供重入）', () => {
    const facade = createEditor(null);
    toggleShapeDraw(facade.tools, 'circle');
    toggleShapeDraw(facade.tools, 'circle');
    expect(facade.tools.getActiveTool()).toBeNull();
    expect(useEditorStore.getState().drawTarget).toEqual({ shapeType: 'circle' });
    facade.dispose();
  });

  it('同组不同形状（多边形 → 矩形）→ 切换而非退出；线/点形状不改 lastAreaShape', () => {
    const facade = createEditor(null);
    toggleShapeDraw(facade.tools, 'polygon');
    toggleShapeDraw(facade.tools, 'rectangle');
    expect(facade.tools.getActiveTool()!.id).toBe('draw-rectangle');

    toggleShapeDraw(facade.tools, 'line');
    expect(useEditorStore.getState().lastAreaShape).toBe('rectangle'); // 线不触碰区域记忆
    toggleShapeDraw(facade.tools, 'point');
    expect(useEditorStore.getState().lastAreaShape).toBe('rectangle');
    facade.dispose();
  });

  it('toggleRegionDraw：按 lastAreaShape 记忆激活（默认 polygon）；记忆更新后随新形状', () => {
    const facade = createEditor(null);
    toggleRegionDraw(facade.tools);
    expect(facade.tools.getActiveTool()!.id).toBe('draw-polygon');
    useEditorStore.setState({ lastAreaShape: 'freehand' });
    toggleRegionDraw(facade.tools);
    expect(facade.tools.getActiveTool()!.id).toBe('draw-freehand');
    facade.dispose();
  });
});

describe('togglePlacement（资产组入口）', () => {
  it('无 lastAssetId → false 不激活', () => {
    const facade = createEditor(null);
    const asset = { ...facade.registries.assets.list()[0] }; // 无资产注册也为空
    void asset;
    expect(togglePlacement(facade.tools, facade.scene, null)).toBe(false);
    expect(facade.tools.getActiveTool()).toBeNull();
    facade.dispose();
  });

  it('注册资产并记忆 lastAssetId → 激活放置工具（Models 图层解析）', () => {
    const facade = createEditor(null);
    const model = facade.scene.getLayers().find((l) => l.name === 'Models')!;
    facade.registries.assets.register({
      kind: 'file',
      asset: {
        id: 'asset_probe',
        name: '探针资产',
        category: 'plant',
        file: 'models/plant/probe.glb',
        tags: [],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
      },
    });
    expect(togglePlacement(facade.tools, facade.scene, 'asset_probe')).toBe(true);
    expect(facade.tools.getActiveTool()!.id).toBe('placement');
    facade.dispose();
    void model;
  });
});

describe('resolveDigitAction（数字键路由：code 稳定判定 + Shift 直切）', () => {
  it('Shift + Digit1..5 → 区域子工具直切；无 Shift + Digit1..4 → 垂直条 toggle', () => {
    expect(resolveDigitAction({ code: 'Digit1', shiftKey: true })).toEqual({
      kind: 'area-sub',
      shapeType: 'polygon',
    });
    expect(resolveDigitAction({ code: 'Digit5', shiftKey: true })).toEqual({
      kind: 'area-sub',
      shapeType: 'freehand',
    });
    expect(resolveDigitAction({ code: 'Digit1', shiftKey: false })).toEqual({ kind: 'vertical', key: '1' });
    expect(resolveDigitAction({ code: 'Digit4', shiftKey: false })).toEqual({ kind: 'vertical', key: '4' });
    // Shift+6..9 与 Digit0 不路由（回落工具转发）
    expect(resolveDigitAction({ code: 'Digit6', shiftKey: true })).toBeNull();
    expect(resolveDigitAction({ code: 'Digit0', shiftKey: false })).toBeNull();
    expect(resolveDigitAction({ code: 'KeyA', shiftKey: false })).toBeNull();
  });
});

describe('deriveMode（形状驱动派生）', () => {
  it('面类 → terrain；line → road；point → annotation；placement → decoration；无记账兜底 scene', () => {
    expect(deriveMode('draw-rectangle', { shapeType: 'rectangle' })).toBe('terrain');
    expect(deriveMode('draw-freehand', { shapeType: 'freehand' })).toBe('terrain');
    expect(deriveMode('draw-line', { shapeType: 'line' })).toBe('road');
    expect(deriveMode('draw-point', { shapeType: 'point' })).toBe('annotation');
    expect(deriveMode('placement', null)).toBe('decoration');
    expect(deriveMode('draw-polygon', null)).toBe('scene');
    expect(deriveMode('select', null)).toBe('scene');
  });
});

describe('contextToolsFor（绘制态中段：形状切换器）', () => {
  function drawSection(shapeType: string): DrawContextSection | null {
    return contextToolsFor({
      activeToolId: shapeToolId(shapeType as never),
      gizmoMode: 'translate',
      snapEnabled: true,
      gridVisible: true,
      drawTarget: { shapeType: shapeType as never },
    }).draw;
  }

  it('面类绘制中：五形状切换芯片（当前项 active）+ 提示文案', () => {
    const draw = drawSection('circle')!;
    expect(draw).not.toBeNull();
    expect(draw.shapeOptions.map((o) => o.value)).toEqual([
      'polygon',
      'rectangle',
      'circle',
      'ellipse',
      'freehand',
    ]);
    expect(draw.shapeOptions.find((o) => o.active)?.value).toBe('circle');
    expect(draw.hint).toContain('Esc');
  });

  it('线/点绘制中：无形状切换芯片（各自单工具），仅提示', () => {
    const line = drawSection('line')!;
    expect(line.shapeOptions).toHaveLength(0);
    expect(line.hint).toContain('双击');
    const point = drawSection('point')!;
    expect(point.shapeOptions).toHaveLength(0);
    expect(point.hint).toContain('点击放置');
  });

  it('默认组六项不变（QWER + 吸附 + 网格）', () => {
    const model = contextToolsFor({
      activeToolId: 'select',
      gizmoMode: 'translate',
      snapEnabled: true,
      gridVisible: true,
    });
    expect(model.tools.map((t) => t.id)).toEqual([
      'select',
      'translate',
      'rotate',
      'scale',
      'snap',
      'grid',
    ]);
    expect(model.draw).toBeNull();
  });
});

describe('键表常量（单一真相源不变项）', () => {
  it('Q 选择 / G 吸附 / W-E-R 变换', () => {
    expect(SELECT_KEY).toBe('q');
    expect(KEY_TO_TRANSFORM_MODE).toEqual({ w: 'translate', e: 'rotate', r: 'scale' });
  });
});
