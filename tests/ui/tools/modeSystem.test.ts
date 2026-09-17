/**
 * tests/ui/tools/modeSystem.test.ts —— 显式工作模式体系与上下文工具矩阵测试
 * （T7.1，先测后码；node 纯逻辑覆盖，组件 GUI 行为留 T7.8 验收——沿 T2.1 先例）。
 *
 * 覆盖（任务书「实现要点」逐项）：
 * - combineMode：显式模式透传（非绘制/放置工具）；绘制/放置激活期间显示派生态
 *   （面类 → terrain、line → road、point → annotation、placement → decoration），
 *   工具退出恢复显式模式；绘制工具激活但无 drawTarget 记账 → 显式模式兜底；
 * - MODES 模式元数据：六模式转正 enabled（scene/build/road/terrain/decoration/
 *   annotation），measure/analysis 维持 disabled + tooltip；每模式 accent（tokens.css
 *   令牌名，六色互异）/ verticalGroup（垂直条置顶组映射）/ hudHint / inspectorGuide
 *   （模式说明 + 快速开始）齐备；
 * - contextActionsFor 上下文工具矩阵全覆盖：单选 building（复制/轮廓编辑/楼层步进/
 *   对齐·阵列占位）、单选 road line（复制/节点编辑/宽度步进/分割·合并占位/对齐·阵列
 *   占位）、单选其他 region / model（复制）、多选（对齐·阵列占位；批量编辑不占位）、
 *   空选 / 绘制态 / 顶点编辑态 / 放置态 → null（与绘制中段/顶点编辑指引互斥）；
 *   步进器 value 取 semantic.properties 现值（缺省 floors=1 / width=语义定义默认 6）、
 *   min 按语义定义参数截断（width ≥ 0；floors ≥ 1）；
 * - resolveAltDigitMode / ALT_MODE_ORDER：Alt+1..6 → 六启用模式直切（需求 24 章表序
 *   scene/build/road/terrain/decoration/annotation）；Alt+7/8 目标禁用不绑定（null 预留）；
 *   无 Alt / Shift+Alt / 非数字键 → null；
 * - workspaceStore.mode：默认 scene + setMode 写入（T7.1 内存态不落盘；resetLayout
 *   属布局复位，不改工作模式）；
 * - activateWorkMode：三路同源共享入口——写 store.mode；激活绘制/放置工具时先走
 *   cancel 语义（不产生 Command，history 不变）；禁用模式拒绝；非绘制工具不抢占；
 * - togglePure3d（T7.4 纯三维模式共享入口）：进入翻位 + draw-* / placement / vertex-edit
 *   激活先 cancel（ESC 同路零 Command）+ 关右键菜单；select/transform 不被动；
 *   退出只翻位不动工具；tools 为 null 仅翻位；
 * - 步进器命令路由：semanticPropertyChange 载荷经 ChangeSemanticCommand 一条历史
 *   可撤销可重做（undo 恢复原值）。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { createEditor } from '../../../src/app/bootstrap';
import { createRegionObject } from '../../../src/domain/regions';
import type { RegionObject, RegionShape } from '../../../src/domain/regions';
import type { ModelAsset } from '../../../src/domain/assets';
import { CreateObjectCommand } from '../../../src/editor/commands';
import { ChangeSemanticCommand } from '../../../src/editor/commands/ChangeSemanticCommand';
import type { SceneObject } from '../../../src/scene/SceneObject';
import { useEditorStore } from '../../../src/ui/store';
import { useWorkspaceStore } from '../../../src/ui/layout/workspaceStore';
import { semanticPropertyChange } from '../../../src/ui/panels/regionInspectorModel';
import {
  ALT_MODE_ORDER,
  MODES,
  activateWorkMode,
  alignMenuModel,
  combineMode,
  contextActionsFor,
  contextToolsFor,
  resolveAltDigitMode,
  togglePure3d,
  toggleShapeDraw,
} from '../../../src/ui/tools/toolIA';
import type { ContextMatrixItem } from '../../../src/ui/tools/toolIA';

// ── 夹具 ────────────────────────────────────────────────────

const POLYGON_SHAPE: RegionShape = {
  type: 'polygon',
  points: [
    { x: 0, y: 0 },
    { x: 8, y: 0 },
    { x: 8, y: 8 },
    { x: 0, y: 8 },
  ],
  baseHeight: 0,
  closed: true,
};

const LINE_SHAPE: RegionShape = {
  type: 'line',
  points: [
    { x: 0, y: 0 },
    { x: 12, y: 0 },
  ],
  baseHeight: 0.06,
  closed: false,
};

function buildingRegion(floors?: number): RegionObject {
  const region = createRegionObject({ shape: POLYGON_SHAPE, semanticType: 'building' });
  if (floors !== undefined) region.semantic.properties.floors = floors;
  return region;
}

function roadRegion(width?: number, shape: RegionShape = LINE_SHAPE): RegionObject {
  const region = createRegionObject({ shape, semanticType: 'road' });
  if (width !== undefined) region.semantic.properties.width = width;
  return region;
}

/** 非 region 通用对象（model 等）最小夹具 */
function plainObject(type = 'model'): SceneObject {
  return {
    id: `plain_${type}`,
    type,
    name: '探针对象',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    properties: {},
  };
}

/** 全局 store 记账复位（activateWorkMode / toggleShapeDraw 会写入） */
function resetStores(): void {
  const s = useEditorStore.getState();
  s.setDrawTarget(null);
  useEditorStore.setState({ lastAreaShape: 'polygon' });
  useWorkspaceStore.getState().setMode('scene');
}

beforeEach(resetStores);

// ── combineMode（显示模式 = 派生 ⊕ 显式）─────────────────────

describe('combineMode（显式模式 + 工具派生合成）', () => {
  it('非绘制/放置工具：显式模式透传', () => {
    expect(combineMode('build', 'select', null)).toBe('build');
    expect(combineMode('terrain', 'transform', null)).toBe('terrain');
    expect(combineMode('scene', null, null)).toBe('scene');
    expect(combineMode('annotation', 'vertex-edit', null)).toBe('annotation');
  });

  it('绘制激活期间显示派生态（面类→terrain / line→road / point→annotation）', () => {
    expect(combineMode('build', 'draw-rectangle', { shapeType: 'rectangle' })).toBe('terrain');
    expect(combineMode('road', 'draw-polygon', { shapeType: 'polygon' })).toBe('terrain');
    expect(combineMode('scene', 'draw-line', { shapeType: 'line' })).toBe('road');
    expect(combineMode('road', 'draw-point', { shapeType: 'point' })).toBe('annotation');
  });

  it('放置激活期间显示 decoration（与显式模式无关）', () => {
    expect(combineMode('terrain', 'placement', null)).toBe('decoration');
    expect(combineMode('scene', 'placement', null)).toBe('decoration');
  });

  it('绘制工具激活但无 drawTarget 记账 → 显式模式兜底（防隐形状态）', () => {
    expect(combineMode('road', 'draw-polygon', null)).toBe('road');
    expect(combineMode('scene', 'draw-polygon', null)).toBe('scene');
  });
});

// ── MODES 模式元数据（六转正 + 两占位）───────────────────────

describe('MODES（七模式启用 + analysis 禁用占位；T10.2 measure 转正）', () => {
  it('八模式顺序固定（= 需求 24 章表序 = ALT_MODE_ORDER 键序）；七模式 enabled，analysis 禁用', () => {
    expect(MODES.map((m) => m.id)).toEqual([
      'scene',
      'build',
      'road',
      'terrain',
      'decoration',
      'annotation',
      'measure',
      'analysis',
    ]);
    expect(MODES.filter((m) => m.enabled).map((m) => m.id)).toEqual([
      'scene',
      'build',
      'road',
      'terrain',
      'decoration',
      'annotation',
      'measure',
    ]);
  });

  it('七启用模式中文名齐备', () => {
    const labels = Object.fromEntries(MODES.map((m) => [m.id, m.label]));
    expect(labels.scene).toBe('场景');
    expect(labels.build).toBe('建造');
    expect(labels.road).toBe('道路');
    expect(labels.terrain).toBe('地形');
    expect(labels.annotation).toBe('标注');
    expect(labels.decoration).toBe('装饰');
    expect(labels.measure).toBe('测量');
  });

  it('analysis 灰显占位（tooltip 后续版本，选择器与菜单两处同源）', () => {
    const mode = MODES.find((m) => m.id === 'analysis')!;
    expect(mode.enabled).toBe(false);
    expect(mode.hint).toContain('后续版本');
  });

  it('七启用模式元数据齐备：accent 令牌名（互异）+ hudHint + inspectorGuide', () => {
    const enabled = MODES.filter((m) => m.enabled);
    const accents = new Set<string>();
    for (const mode of enabled) {
      expect(mode.accent).toMatch(/^--mode-/);
      accents.add(mode.accent!);
      expect(mode.hudHint.length).toBeGreaterThan(0);
      expect(mode.inspectorGuide.title.length).toBeGreaterThan(0);
      expect(mode.inspectorGuide.description.length).toBeGreaterThan(0);
      expect(mode.inspectorGuide.quickStart.length).toBeGreaterThan(0);
    }
    expect(accents.size).toBe(enabled.length); // 七色互异
  });

  it('模式 → 垂直条置顶分组映射（scene 全展开；build/terrain→区域；road→路径；annotation→点；decoration→资产；measure→measure）', () => {
    const groupOf = (id: string) => MODES.find((m) => m.id === id)!.verticalGroup;
    expect(groupOf('scene')).toBeNull();
    expect(groupOf('build')).toBe('region');
    expect(groupOf('terrain')).toBe('region');
    expect(groupOf('road')).toBe('line');
    expect(groupOf('annotation')).toBe('point');
    expect(groupOf('decoration')).toBe('placement');
    expect(groupOf('measure')).toBe('measure');
  });
});

// ── contextActionsFor（上下文工具矩阵；T7.6 占位转正后新矩阵）─────

describe('contextActionsFor（上下文工具矩阵全覆盖）', () => {
  const kinds = (items: readonly ContextMatrixItem[]) => items.map((i) => i.kind);
  const ids = (items: readonly ContextMatrixItem[]) => items.map((i) => i.id);

  it('空选择 → null；绘制 / 顶点编辑 / 道路分割 / 放置激活期间 → null（与既有中段互斥）', () => {
    const building = buildingRegion();
    expect(contextActionsFor([], 'select')).toBeNull();
    expect(contextActionsFor([building], 'draw-polygon')).toBeNull();
    expect(contextActionsFor([building], 'vertex-edit')).toBeNull();
    expect(contextActionsFor([building], 'road-split')).toBeNull();
    expect(contextActionsFor([building], 'placement')).toBeNull();
  });

  it('单选 building：复制 / 轮廓编辑 / 楼层步进（floors ±1，缺省 1，min 1）/ 阵列（对齐单选无意义不显示）', () => {
    const building = buildingRegion();
    const model = contextActionsFor([building], 'select')!;
    expect(model.objectId).toBe(building.id);
    expect(kinds(model.items)).toEqual(['action', 'action', 'stepper', 'action']);
    expect(ids(model.items)).toEqual(['duplicate', 'vertex-edit', 'floors', 'array']);
    const stepper = model.items[2]!;
    expect(stepper).toMatchObject({ paramKey: 'floors', value: 1, step: 1, min: 1, precision: 0 });
    expect(model.items[1]!.kind === 'action' && model.items[1]!.label).toBe('轮廓编辑');
  });

  it('单选 building（floors=5）：步进器读现值 5', () => {
    const model = contextActionsFor([buildingRegion(5)], 'select')!;
    const stepper = model.items[2]!;
    expect(stepper.kind === 'stepper' && stepper.value).toBe(5);
  });

  it('单选 road line：复制 / 节点编辑 / 宽度步进（width ±0.5m，默认 6，min 0 按语义定义截断）/ 分割 / 阵列', () => {
    const road = roadRegion();
    const model = contextActionsFor([road], 'select')!;
    expect(kinds(model.items)).toEqual(['action', 'action', 'stepper', 'action', 'action']);
    expect(ids(model.items)).toEqual(['duplicate', 'vertex-edit', 'width', 'road-split', 'array']);
    expect(model.items[1]!.kind === 'action' && model.items[1]!.label).toBe('节点编辑');
    const stepper = model.items[2]!;
    expect(stepper).toMatchObject({ paramKey: 'width', value: 6, step: 0.5, min: 0, unit: 'm', precision: 1 });
  });

  it('单选 road（width=8.5）：步进器读现值 8.5；road polygon（宽幅忽略）走通用分支复制+阵列', () => {
    const lined = contextActionsFor([roadRegion(8.5)], 'select')!;
    const stepper = lined.items[2]!;
    expect(stepper.kind === 'stepper' && stepper.value).toBe(8.5);

    const polygonRoad = contextActionsFor([roadRegion(undefined, POLYGON_SHAPE)], 'select')!;
    expect(ids(polygonRoad.items)).toEqual(['duplicate', 'array']);
  });

  it('单选其他 region（water / unclassified）与 model：复制 + 阵列', () => {
    const water = createRegionObject({ shape: POLYGON_SHAPE, semanticType: 'water' });
    expect(ids(contextActionsFor([water], 'select')!.items)).toEqual(['duplicate', 'array']);
    const unclassified = createRegionObject({ shape: POLYGON_SHAPE });
    expect(ids(contextActionsFor([unclassified], 'select')!.items)).toEqual(['duplicate', 'array']);
    expect(ids(contextActionsFor([plainObject()], 'select')!.items)).toEqual(['duplicate', 'array']);
  });

  it('多选：对齐 + 阵列（无合并条件时不显示合并项），无单选目标', () => {
    const model = contextActionsFor([buildingRegion(), roadRegion()], 'select')!;
    expect(model.objectId).toBeNull();
    expect(ids(model.items)).toEqual(['align', 'array']);
  });

  it('多选合并：恰选 2 条端点相邻 road line → 追加合并项；不相邻 / 混选 / 非恰两条不显示', () => {
    // 相邻：a 世界 (0,0)→(20,0)；b 偏移 20 → (20,0)→(40,0)（a.end = b.start 重合）
    const a = adjacentRoad('甲');
    const b = adjacentRoad('乙', 20);
    expect(ids(contextActionsFor([a, b], 'select')!.items)).toEqual(['align', 'array', 'road-merge']);

    // 不相邻：b 偏移 100
    const far = adjacentRoad('远', 100);
    expect(ids(contextActionsFor([a, far], 'select')!.items)).toEqual(['align', 'array']);

    // 混选（building + road）：不显示合并
    expect(ids(contextActionsFor([a, buildingRegion()], 'select')!.items)).toEqual(['align', 'array']);

    // 三条 road：非恰两条，不显示
    const c = adjacentRoad('丙', 40);
    expect(ids(contextActionsFor([a, b, c], 'select')!.items)).toEqual(['align', 'array']);
  });
});

// ── contextToolsFor（道路分割中段 + 互斥，T7.6 R7）──────────

describe('contextToolsFor（road-split 激活态中段）', () => {
  it("road-split 激活 → roadSplit 提示段（含节点/Esc 指引）；其余中段互斥为 null", () => {
    const model = contextToolsFor(stateOf('road-split'));
    expect(model.roadSplit).not.toBeNull();
    expect(model.roadSplit!.hint).toContain('节点');
    expect(model.roadSplit!.hint).toContain('Esc');
    expect(model.draw).toBeNull();
    expect(model.vertexEdit).toBeNull();
  });

  it('非 road-split（select / draw-* / vertex-edit）→ roadSplit 段为 null', () => {
    expect(contextToolsFor(stateOf('select')).roadSplit).toBeNull();
    expect(contextToolsFor(stateOf('draw-polygon')).roadSplit).toBeNull();
    expect(contextToolsFor(stateOf('vertex-edit')).roadSplit).toBeNull();
    expect(contextToolsFor(stateOf(null)).roadSplit).toBeNull();
  });
});

// ── alignMenuModel（对齐弹层八菜单，T7.6 R1）────────────────

describe('alignMenuModel（八菜单项；均布 <3 disabled 可见）', () => {
  it('八项齐备（X/Z × 最小/居中/最大 + 均布）；n≥3 全可用', () => {
    const menu = alignMenuModel(3);
    expect(menu.map((m) => m.mode)).toEqual([
      'min-x',
      'center-x',
      'max-x',
      'min-z',
      'center-z',
      'max-z',
      'distribute-x',
      'distribute-z',
    ]);
    expect(menu.every((m) => !m.disabled)).toBe(true);
  });

  it('n=2：均布两项 disabled 可见，其余可用', () => {
    const menu = alignMenuModel(2);
    const distribute = menu.filter((m) => m.mode.startsWith('distribute'));
    expect(distribute).toHaveLength(2);
    expect(distribute.every((m) => m.disabled)).toBe(true);
    expect(menu.filter((m) => !m.mode.startsWith('distribute')).every((m) => !m.disabled)).toBe(true);
  });
});

// ── road-split 的 cancel 谓词（activateWorkMode / togglePure3d）──

describe('road-split 互斥 cancel 谓词（T7.6 R7）', () => {
  it('activateWorkMode：road-split 激活时先 cancel（零 Command，工具退出）', () => {
    const facade = createEditor(null);
    const road = adjacentRoad('切换');
    facade.scene.addObject(road);
    facade.tools.activate('road-split', { objectId: road.id });
    expect(facade.tools.getActiveTool()?.id).toBe('road-split');

    expect(activateWorkMode('build', facade.tools)).toBe(true);
    expect(facade.tools.getActiveTool()?.id ?? null).toBeNull(); // cancel 后无激活
    expect(facade.history.canUndo()).toBe(false); // 零命令
    facade.dispose();
  });

  it('togglePure3d：进入纯三维时 road-split 先 cancel + 关右键菜单', () => {
    const facade = createEditor(null);
    const road = adjacentRoad('纯三维');
    facade.scene.addObject(road);
    facade.tools.activate('road-split', { objectId: road.id });

    togglePure3d(facade.tools);
    expect(useWorkspaceStore.getState().pure3d).toBe(true);
    expect(facade.tools.getActiveTool()?.id ?? null).toBeNull();
    togglePure3d(facade.tools); // 复位（退出纯三维）
    expect(useWorkspaceStore.getState().pure3d).toBe(false);
    facade.dispose();
  });
});

// ── 夹具（道路线，世界端点按 position 偏移）──────────────────

/** 三点道路线（局部 (0,0)→(10,0)→(20,0)），position.x = offset 平移端点 */
function adjacentRoad(name: string, offset = 0): RegionObject {
  const region = createRegionObject({
    shape: {
      type: 'line',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 20, y: 0 },
      ],
      baseHeight: 0.06,
      closed: false,
    },
    semanticType: 'road',
    name,
  });
  region.transform.position = { x: offset, y: 0, z: 0 };
  return region;
}

/** contextToolsFor 最小状态输入 */
function stateOf(activeToolId: string | null) {
  return { activeToolId, gizmoMode: 'translate' as const, snapEnabled: true, gridVisible: true };
}

// ── Alt 数字键路由（键表单一真相源）─────────────────────────

describe('resolveAltDigitMode / ALT_MODE_ORDER（Alt+1..7 直切；8 预留；T10.2 第 7 位启用）', () => {
  it('键表：需求 24 章表序 scene/build/road/terrain/decoration/annotation/measure，8 为 null 预留', () => {
    expect(ALT_MODE_ORDER).toEqual([
      'scene',
      'build',
      'road',
      'terrain',
      'decoration',
      'annotation',
      'measure',
      null,
    ]);
  });

  it('Alt+Digit1..7 → 七启用模式；Alt+Digit8 → null（analysis 禁用不绑定）', () => {
    expect(resolveAltDigitMode({ code: 'Digit1', altKey: true, shiftKey: false })).toBe('scene');
    expect(resolveAltDigitMode({ code: 'Digit4', altKey: true, shiftKey: false })).toBe('terrain');
    expect(resolveAltDigitMode({ code: 'Digit5', altKey: true, shiftKey: false })).toBe('decoration');
    expect(resolveAltDigitMode({ code: 'Digit6', altKey: true, shiftKey: false })).toBe('annotation');
    expect(resolveAltDigitMode({ code: 'Digit7', altKey: true, shiftKey: false })).toBe('measure');
    expect(resolveAltDigitMode({ code: 'Digit8', altKey: true, shiftKey: false })).toBeNull();
  });

  it('无 Alt / Shift+Alt / Digit0 / 非数字 code → null（与既有键位零冲突）', () => {
    expect(resolveAltDigitMode({ code: 'Digit1', altKey: false, shiftKey: false })).toBeNull();
    expect(resolveAltDigitMode({ code: 'Digit1', altKey: false, shiftKey: true })).toBeNull();
    expect(resolveAltDigitMode({ code: 'Digit1', altKey: true, shiftKey: true })).toBeNull();
    expect(resolveAltDigitMode({ code: 'Digit0', altKey: true, shiftKey: false })).toBeNull();
    expect(resolveAltDigitMode({ code: 'KeyA', altKey: true, shiftKey: false })).toBeNull();
  });
});

// ── workspaceStore.mode（内存态，T7.3 随布局持久化）──────────

describe('workspaceStore.mode（显式工作模式内存态）', () => {
  it('默认 scene；setMode 写入', () => {
    expect(useWorkspaceStore.getState().mode).toBe('scene');
    useWorkspaceStore.getState().setMode('road');
    expect(useWorkspaceStore.getState().mode).toBe('road');
    useWorkspaceStore.getState().setMode('scene');
    expect(useWorkspaceStore.getState().mode).toBe('scene');
  });

  it('resetLayout 复位布局不改工作模式（mode 是工作态非布局态）', () => {
    useWorkspaceStore.getState().setMode('terrain');
    useWorkspaceStore.getState().resetLayout();
    expect(useWorkspaceStore.getState().mode).toBe('terrain');
    useWorkspaceStore.getState().setMode('scene');
  });
});

// ── activateWorkMode（三路同源共享入口）─────────────────────

describe('activateWorkMode（选择器 / Alt 键 / 视图菜单三路同源）', () => {
  it('写 workspaceStore.mode 并返回 true', () => {
    const facade = createEditor(null);
    expect(activateWorkMode('terrain', facade.tools)).toBe(true);
    expect(useWorkspaceStore.getState().mode).toBe('terrain');
    facade.dispose();
  });

  it('激活绘制工具时先走 cancel 语义：工具退出、零 Command（history 不变）', () => {
    const facade = createEditor(null);
    toggleShapeDraw(facade.tools, 'line');
    expect(facade.tools.getActiveTool()!.id).toBe('draw-line');
    const canUndoBefore = facade.history.canUndo();
    expect(activateWorkMode('build', facade.tools)).toBe(true);
    expect(facade.tools.getActiveTool()).toBeNull(); // cancel（ESC 同路，不产生 Command）
    expect(facade.history.canUndo()).toBe(canUndoBefore);
    expect(useWorkspaceStore.getState().mode).toBe('build');
    facade.dispose();
  });

  it('禁用模式（analysis）拒绝：返回 false 且 mode 不变；measure 已启用（T10.2）', () => {
    const facade = createEditor(null);
    expect(activateWorkMode('analysis', facade.tools)).toBe(false);
    expect(useWorkspaceStore.getState().mode).toBe('scene');
    expect(activateWorkMode('measure', facade.tools)).toBe(true);
    expect(useWorkspaceStore.getState().mode).toBe('measure');
    useWorkspaceStore.getState().setMode('scene');
    facade.dispose();
  });

  it('非绘制/放置工具（transform）激活时不抢占：仅切模式', () => {
    const facade = createEditor(null);
    facade.tools.activate('transform', { mode: 'translate' });
    expect(activateWorkMode('road', facade.tools)).toBe(true);
    expect(facade.tools.getActiveTool()!.id).toBe('transform');
    expect(useWorkspaceStore.getState().mode).toBe('road');
    facade.dispose();
  });
});

// ── togglePure3d（纯三维模式共享切换入口，T7.4）──────────────

/** 放置工具测试资产（注册进 facade 资产表后可激活 placement） */
const TREE_ASSET: ModelAsset = {
  id: 'asset_tree',
  name: '树',
  category: 'plant',
  file: 'models/plant/tree.glb',
  tags: [],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
};

describe('togglePure3d（Tab 键 / 视图菜单三路同源，T7.4）', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().setPure3d(false);
    useEditorStore.getState().closeContextMenu();
  });

  it('进入：翻位 true（空白状态无副作用）', () => {
    const facade = createEditor(null);
    togglePure3d(facade.tools);
    expect(useWorkspaceStore.getState().pure3d).toBe(true);
    facade.dispose();
  });

  it('进入：draw-polygon 激活 → cancel（ESC 同路，零 Command）', () => {
    const facade = createEditor(null);
    toggleShapeDraw(facade.tools, 'polygon');
    expect(facade.tools.getActiveTool()!.id).toBe('draw-polygon');
    const canUndoBefore = facade.history.canUndo();
    togglePure3d(facade.tools);
    expect(facade.tools.getActiveTool()).toBeNull();
    expect(facade.history.canUndo()).toBe(canUndoBefore);
    expect(useWorkspaceStore.getState().pure3d).toBe(true);
    facade.dispose();
  });

  it('进入：placement 激活 → cancel（不产生 Command）', () => {
    const facade = createEditor(null);
    facade.registries.assets.register({ kind: 'file', asset: TREE_ASSET });
    facade.tools.activate('placement', { assetId: TREE_ASSET.id, layerId: null });
    expect(facade.tools.getActiveTool()!.id).toBe('placement');
    const canUndoBefore = facade.history.canUndo();
    togglePure3d(facade.tools);
    expect(facade.tools.getActiveTool()).toBeNull();
    expect(facade.history.canUndo()).toBe(canUndoBefore);
    expect(useWorkspaceStore.getState().pure3d).toBe(true);
    facade.dispose();
  });

  it('进入：vertex-edit 激活 → cancel（T7.4 扩裁：顶点编辑会话同属防隐形状态）', () => {
    const facade = createEditor(null);
    const region = buildingRegion();
    facade.scene.addObject(region);
    facade.tools.activate('vertex-edit', { objectId: region.id });
    expect(facade.tools.getActiveTool()!.id).toBe('vertex-edit');
    togglePure3d(facade.tools);
    expect(facade.tools.getActiveTool()).toBeNull();
    expect(useWorkspaceStore.getState().pure3d).toBe(true);
    facade.dispose();
  });

  it('进入：select / transform 激活不被动（不抢占）', () => {
    const facade = createEditor(null);
    facade.tools.activate('transform', { mode: 'translate' });
    togglePure3d(facade.tools);
    expect(facade.tools.getActiveTool()!.id).toBe('transform');
    expect(useWorkspaceStore.getState().pure3d).toBe(true);
    facade.dispose();
  });

  it('进入：打开的右键上下文菜单被关闭（防隐形浮层）', () => {
    const facade = createEditor(null);
    useEditorStore.getState().openContextMenu({ source: 'viewport-blank', x: 10, y: 10 });
    expect(useEditorStore.getState().contextMenu).not.toBeNull();
    togglePure3d(facade.tools);
    expect(useEditorStore.getState().contextMenu).toBeNull();
    facade.dispose();
  });

  it('退出：只翻位，不动激活工具与布局字段（布局从未被 pure3d 修改）', () => {
    const facade = createEditor(null);
    useWorkspaceStore.getState().setPanelSize('left', 333);
    togglePure3d(facade.tools); // 进入
    facade.tools.activate('select');
    togglePure3d(facade.tools); // 退出
    expect(useWorkspaceStore.getState().pure3d).toBe(false);
    expect(facade.tools.getActiveTool()!.id).toBe('select');
    expect(useWorkspaceStore.getState().leftWidth).toBe(333); // 布局字段原样
    facade.dispose();
  });

  it('tools 为 null：仅翻位不抛错（装配前 / 边缘调用安全）', () => {
    togglePure3d(null);
    expect(useWorkspaceStore.getState().pure3d).toBe(true);
    togglePure3d(null);
    expect(useWorkspaceStore.getState().pure3d).toBe(false);
  });
});

// ── 步进器命令路由（经 ChangeSemanticCommand 一条历史）────────

describe('步进器命令路由（semanticPropertyChange → ChangeSemanticCommand）', () => {
  it('floors ±1：一条历史写入 semantic.properties，undo 恢复原值、redo 复现', () => {
    const facade = createEditor(null);
    const region = buildingRegion();
    facade.history.execute(new CreateObjectCommand(region));
    facade.selection.select(region.id);

    const commit = (next: number) => {
      const live = facade.scene.getObject(region.id) as RegionObject;
      facade.history.execute(new ChangeSemanticCommand(region.id, semanticPropertyChange(live.semantic, 'floors', next)));
    };
    commit(2); // floors 1 → 2（±1 步进）
    let live = facade.scene.getObject(region.id) as RegionObject;
    expect(live.semantic.properties.floors).toBe(2);

    facade.history.undo();
    live = facade.scene.getObject(region.id) as RegionObject;
    expect(live.semantic.properties.floors).toBeUndefined(); // 恢复「无 floors 键」原状

    facade.history.redo();
    live = facade.scene.getObject(region.id) as RegionObject;
    expect(live.semantic.properties.floors).toBe(2);
    facade.dispose();
  });
});
