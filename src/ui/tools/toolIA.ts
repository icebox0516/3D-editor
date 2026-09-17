/**
 * ui/tools/toolIA —— 工具信息架构（T5.6 奠基；T6.5 形状驱动重构）：垂直工具条 /
 * Context Toolbar / 工作模式的纯数据与纯函数（node 可测），外加键盘与点击共用的
 * 薄激活入口。
 *
 * 职责（T6.5《绘制需求变更.md》§7.1 键表）：
 *   - VERTICAL_TOOLS：四分组垂直条数据表——绘制组 1 区域（子工具见 AREA_SUBTOOLS，
 *     主键记忆上次）/ 2 路径 / 3 点，资产组 4 放置；变换组 Q/W/E/R 沿 ContextToolbar
 *     QWER 组不变（键位纯字母不动）；旧六要素入口移除（旧要素体系 T6.7 删）；
 *   - AREA_SUBTOOLS：区域组五子工具（多边形/矩形/圆形/椭圆/自由），Shift+1..5 直切，
 *     记忆归 store.lastAreaShape；
 *   - resolveDigitAction：数字键路由（e.code 稳定判定：Shift+Digit1..5 → 子工具直切；
 *     Digit1..4 → 垂直条 toggle；Shift 与数字的组合在 e.key 上是标点，必须走 code）；
 *   - shapeToolId / SHAPE_DRAW_LABELS：七形状 → 工具 id / 显示名单一真相源；
 *   - deriveMode：形状驱动八模式派生（面类 → terrain、line → road、point → annotation、
 *     placement → decoration，scene 兜底）；
 *   - T7.1 显式工作模式体系：workspaceStore.mode（显式态）+ combineMode（显示模式 =
 *     绘制/放置期间派生态 ⊕ 其余显式态）+ MODES 模式转正元数据（label/accent/
 *     verticalGroup/hudHint/inspectorGuide；T7.1 六模式 + T10.2 measure 第七模式）+
 *     activateWorkMode 三路同源切换入口（ContextToolbar 选择器 / input.ts Alt+1..7 /
 *     视图菜单 view.mode-*）——模式是「工作域焦点」而非权限闸门（门 Q2：不绑定绘制
 *     语义，工具任何模式可用）；
 *   - T7.4 togglePure3d 纯三维模式共享切换入口（Tab 键 / 视图菜单 view.pure3d 三路
 *     同源）：进入时 draw-* / placement / vertex-edit 先 cancel + 关右键菜单，退出只翻位；
 *   - resolveAltDigitMode / ALT_MODE_ORDER：Alt+1..7 七启用模式直切键表（需求 24 章
 *     表序 + T10.2 第 7 位 measure；Alt+8 目标禁用不绑定，null 预留）；
 *   - MEASURE_SUBTOOLS / toggleMeasureTool（阶段 10 T10.2）：四测量子工具表（无数字键）
 *     与共享激活入口——垂直条测量分组 / ContextToolbar 四 kind 芯片 / 工具菜单子菜单
 *     三路同路；测量态 ContextToolbar 中段见 contextToolsFor 的 measure 分支；
 *   - contextActionsFor：上下文工具矩阵（门 Q4 四分裁定，数据表驱动注册制）——单选
 *     building（复制/轮廓编辑/楼层步进/占位）、单选 road line（复制/节点编辑/宽度
 *     步进/占位）、单选其他（复制）、多选（占位）；步进器经 ChangeSemanticCommand
 *     写 semantic.properties（分域契约 §A ② 业务参数路径，一条历史）；
 *   - contextToolsFor：默认组（QWER + 吸附 + 网格）+ 绘制态动态中段（面类五形状切换
 *     芯片 + 完成提示），三步流完成后的类型/样式快选归 regionQuickApply 模块；
 *   - 共享激活入口（toggleShapeDraw / toggleRegionDraw / togglePlacement /
 *     activateTransformTool / activateSelectTool）：键盘（app/input）与点击（垂直条 /
 *     ContextToolbar / 创建菜单）同路，写 store 记账（drawTarget / lastAreaShape）。
 * 边界：ui 层只依赖 core/domain/registries/editor（分层 DAG：禁止 runtime/io）；
 *      G 键语义 =「网格吸附会话开关（DrawToolBase / 顶点编辑工具内）」；全局侧归
 *      吸附总开关 tool.snap（T8.1 起压下网格/对象/角度/高度分项，不涉绘制三键）。
 */
import type { EditorFacade } from '../../editor/EditorFacade';
import type { ToolManager } from '../../editor/tools/ToolManager';
import { MODEL_LAYER_NAME } from '../../domain/assets';
import { AREA_SHAPE_TYPES } from '../../editor/tools/draw/DrawToolBase';
import { VertexEditTool } from '../../editor/tools/VertexEditTool';
import { ROAD_SPLIT_TOOL_ID } from '../../editor/tools/RoadSplitTool';
import { isMeasureToolId } from '../../editor/tools/measure';
import { detectRoadAdjacency, getSemanticDefinition, isRegionObject } from '../../domain/regions';
import type { RegionObject, SemanticType, ShapeType } from '../../domain/regions';
import type { SceneObject } from '../../scene/SceneObject';
import type { ID, MeasureKind, Vec2 } from '../../core/types';
import { useEditorStore } from '../store';
import type { DrawTarget } from '../store';
import { useWorkspaceStore } from '../layout/workspaceStore';
import type { AlignMode } from './alignArrayModel';

// ── 类型 ────────────────────────────────────────────────────

/** Gizmo 变换模式（W/E/R 三态） */
export type GizmoMode = 'translate' | 'rotate' | 'scale';

/** 八工作模式（需求第二十四章；T7.1 六模式 + T10.2 measure 转正可手选，analysis 禁用占位） */
export type WorkModeId =
  | 'scene'
  | 'build'
  | 'road'
  | 'terrain'
  | 'annotation'
  | 'decoration'
  | 'measure'
  | 'analysis';

/** Inspector 空态引导卡文案（模式说明 + 快速开始；数据驱动纯展示） */
export interface WorkModeGuide {
  /** 卡片标题（含模式语境） */
  title: string;
  /** 模式说明（一到两句职责描述） */
  description: string;
  /** 快速开始引导（一行可照做的入口指引） */
  quickStart: string;
}

/** 垂直条图标键（组件层映射 lucide 图标；键 = 项 id） */
export type VerticalIconKey = 'region' | 'line' | 'point' | 'placement' | 'measure';

/** 垂直工具条一项：分组 × 键位 × 工具 */
export interface VerticalToolDef {
  /** 稳定项 id */
  id: VerticalIconKey;
  /** 显示名（tooltip 主体 / aria） */
  label: string;
  /** 图标键（组件层映射 lucide 图标；区域主钮随记忆子工具换图标） */
  icon: VerticalIconKey;
  /** 数字快捷键（tooltip 展示） */
  key: string;
  /** 绘制工具 id（placement 为放置工具；region 主钮 = 记忆子工具的运行时解析） */
  toolId: string;
  /** tooltip 一句操作提示 */
  hint: string;
}

/** 区域组子工具项（Shift+1..5 直切 / 主键 1 记忆激活） */
export interface AreaSubtoolDef {
  shapeType: Extract<ShapeType, 'polygon' | 'rectangle' | 'circle' | 'ellipse' | 'freehand'>;
  label: string;
  /** 直切子键（Shift + 数字；与主键 1 配合呈现 Shift+1..5） */
  subKey: string;
  toolId: string;
  hint: string;
}

/** 工作模式表项 */
export interface WorkModeDef {
  id: WorkModeId;
  label: string;
  /** 可否手选（T7.1 六模式 + T10.2 measure 转正；analysis 禁用占位——契约排除项，解禁走按需门） */
  enabled: boolean;
  /** 禁选原因（tooltip） */
  hint: string;
  /**
   * 模式专属色 tokens.css 令牌名（如 '--mode-scene'；组件层经 var() 消费，
   * 仅用于模式徽标/引导卡的描边与文字，不作大面积填充）。
   * 禁用模式（analysis）不会成为显示模式，无专属色（null）。
   */
  accent: string | null;
  /** 垂直工具条置顶分组（null = 全部展开无折叠，scene 专用；映射余组进「更多」抽屉） */
  verticalGroup: VerticalIconKey | null;
  /** HUD 一行操作引导文案（模式徽标下方） */
  hudHint: string;
  /** Inspector 空态引导卡文案（无选中时显示，随模式切换更新） */
  inspectorGuide: WorkModeGuide;
}

/** Context Toolbar 默认组工具项 */
export interface ContextToolItem {
  id: 'select' | 'translate' | 'rotate' | 'scale' | 'snap' | 'grid';
  kind: 'tool' | 'toggle';
  label: string;
  /** 键帽（网格 toggle 无快捷键 → 空串） */
  key: string;
  /** 图标键（组件层映射 lucide 图标） */
  icon: 'select' | 'translate' | 'rotate' | 'scale' | 'snap' | 'grid';
  /** 工具项激活位（QWER 组） */
  active?: boolean;
  /** 开关项勾选位（吸附/网格） */
  checked?: boolean;
}

/** 绘制态中段选项（形状切换芯片） */
export interface DrawContextOption {
  value: string;
  label: string;
  active: boolean;
}

/** 绘制态动态中段（形状切换 + 完成提示） */
export interface DrawContextSection {
  /** 面类五形状切换芯片（线/点单工具为空数组 → 组件不渲染切换器） */
  shapeOptions: DrawContextOption[];
  /** 完成提示文案（含退出手势说明） */
  hint: string;
}

/** 顶点编辑态动态中段（T6.8：操作指引提示） */
export interface VertexEditContextSection {
  /** 编辑操作提示文案（拖动/插入/删除/退出手势） */
  hint: string;
}

/** 道路分割态动态中段（T7.6 R7：与 VertexEditSection 同构） */
export interface RoadSplitContextSection {
  /** 编辑操作提示文案（点击节点/退出手势） */
  hint: string;
}

/** 测量态动态中段（阶段 10 T10.2：四 kind 芯片即切 + 手势提示） */
export interface MeasureContextSection {
  /** 四测量 kind 切换芯片（沿绘制五形状芯片先例；当前激活位 active） */
  kindOptions: DrawContextOption[];
  /** 当前 kind 操作提示（完成 / 删除上一条 / 退出手势） */
  hint: string;
}

/** contextToolsFor 的状态输入 */
export interface ContextToolbarState {
  activeToolId: string | null;
  gizmoMode: GizmoMode;
  /** 网格吸附全局开关（DrawGridConfig.snapEnabled；G 键会话开关与之独立；
   *  T7.6 起 gizmo translate 网格吸附同源消费） */
  snapEnabled: boolean;
  /** 环境网格可见（environment.grid.visible） */
  gridVisible: boolean;
  /** 最近一次绘制选择（绘制中段构建输入） */
  drawTarget?: DrawTarget | null;
}

/** Context Toolbar 完整模型 */
export interface ContextToolbarModel {
  tools: readonly ContextToolItem[];
  /** 绘制态动态中段（非绘制为 null） */
  draw: DrawContextSection | null;
  /** 顶点编辑态动态中段（非 vertex-edit 激活为 null；与 draw 互斥，T6.8） */
  vertexEdit: VertexEditContextSection | null;
  /** 道路分割态动态中段（非 road-split 激活为 null；T7.6 与其余中段互斥） */
  roadSplit: RoadSplitContextSection | null;
  /** 测量态动态中段（非 measure.* 激活为 null；阶段 10 与其余中段互斥） */
  measure: MeasureContextSection | null;
}

// ── 键表（单一真相源：input.ts / menuModel / tooltip 同源取键） ──

export const SELECT_TOOL_ID = 'select';
export const TRANSFORM_TOOL_ID = 'transform';
export const PLACEMENT_TOOL_ID = 'placement';
/** 顶点编辑工具（T6.8；editor/tools/VertexEditTool 同源） */
export const VERTEX_EDIT_TOOL_ID = 'vertex-edit';

/** 道路分割工具（T7.6；editor/tools/RoadSplitTool 同源再导出，组件层消费） */
export { ROAD_SPLIT_TOOL_ID };

/** Q → 选择工具 */
export const SELECT_KEY = 'q';

/** G → 网格吸附开关（DrawToolBase 会话级语义保持不动；网格显隐不配键） */
export const SNAP_KEY = 'g';

/** W/E/R → translate/rotate/scale（input.ts 快捷键路由复用） */
export const KEY_TO_TRANSFORM_MODE: Readonly<Record<string, GizmoMode>> = {
  w: 'translate',
  e: 'rotate',
  r: 'scale',
};

// ── 七形状映射（单一真相源）─────────────────────────────────

/** 七形状 → 绘制工具 id */
const SHAPE_TOOL_IDS: Readonly<Record<ShapeType, string>> = {
  polygon: 'draw-polygon',
  rectangle: 'draw-rectangle',
  circle: 'draw-circle',
  ellipse: 'draw-ellipse',
  freehand: 'draw-freehand',
  line: 'draw-line',
  point: 'draw-point',
};

/** 查形状类型对应的绘制工具 id */
export function shapeToolId(shape: ShapeType): string {
  return SHAPE_TOOL_IDS[shape];
}

/** 七形状 → 显示名（菜单/提示/tooltip 同源） */
export const SHAPE_DRAW_LABELS: Readonly<Record<ShapeType, string>> = {
  polygon: '多边形',
  rectangle: '矩形',
  circle: '圆形',
  ellipse: '椭圆',
  freehand: '自由形状',
  line: '路径',
  point: '点',
};

/** 七形状 → 绘制交互提示（ContextToolbar 中段 / 菜单 tooltip 同源） */
export const SHAPE_DRAW_HINTS: Readonly<Record<ShapeType, string>> = {
  polygon: '点击添加顶点 · 双击闭合 · Esc 退出',
  rectangle: '拖拽两个对角成矩形 · Esc 退出',
  circle: '中心按住拖出半径 · Esc 退出',
  ellipse: '两段拖拽定两半轴 · Esc 退出',
  freehand: '按住跟踪轮廓 · 松手闭合简化 · Esc 退出',
  line: '点击添加折点 · 双击结束 · Esc 退出',
  point: '点击放置 · 连续放置 · Esc 退出',
};

/** 七形状创建菜单清单（右键空白菜单「创建 ▾」与大纲「创建 ▾」共用数据源） */
export const SHAPE_CREATE_ENTRIES: readonly { shapeType: ShapeType; label: string; hint: string }[] = (
  ['polygon', 'rectangle', 'circle', 'ellipse', 'freehand', 'line', 'point'] as const
).map((shapeType) => ({
  shapeType,
  label: SHAPE_DRAW_LABELS[shapeType],
  hint: SHAPE_DRAW_HINTS[shapeType],
}));

// ── AREA_SUBTOOLS / VERTICAL_TOOLS（任务书 §7.1 数据表）─────

/** 区域组五子工具（Shift+1..5 直切；记忆归 store.lastAreaShape，缺省多边形） */
export const AREA_SUBTOOLS: readonly AreaSubtoolDef[] = [
  {
    shapeType: 'polygon',
    label: '多边形',
    subKey: '1',
    toolId: 'draw-polygon',
    hint: '点击顶点圈出轮廓，双击闭合',
  },
  {
    shapeType: 'rectangle',
    label: '矩形',
    subKey: '2',
    toolId: 'draw-rectangle',
    hint: '拖拽两个对角成矩形',
  },
  {
    shapeType: 'circle',
    label: '圆形',
    subKey: '3',
    toolId: 'draw-circle',
    hint: '中心按住拖出半径',
  },
  {
    shapeType: 'ellipse',
    label: '椭圆',
    subKey: '4',
    toolId: 'draw-ellipse',
    hint: '两段拖拽定长半轴与短半轴',
  },
  {
    shapeType: 'freehand',
    label: '自由形状',
    subKey: '5',
    toolId: 'draw-freehand',
    hint: '按住跟踪轮廓，松手简化闭合',
  },
];

/** 四分组垂直条（1 区域 / 2 路径 / 3 点 / 4 放置；变换组 QWER 沿 ContextToolbar 不变） */
export const VERTICAL_TOOLS: readonly VerticalToolDef[] = [
  {
    id: 'region',
    label: '绘制区域',
    icon: 'region',
    key: '1',
    toolId: 'draw-polygon', // 主钮占位：运行时按 store.lastAreaShape 解析记忆子工具
    hint: '先绘面状形状生成未分类区域，再赋类型与样式（Shift+1..5 直切子工具）',
  },
  {
    id: 'line',
    label: '绘制路径',
    icon: 'line',
    key: '2',
    toolId: 'draw-line',
    hint: '沿路径点击折点，双击结束生成未分类区域',
  },
  {
    id: 'point',
    label: '绘制点',
    icon: 'point',
    key: '3',
    toolId: 'draw-point',
    hint: '点击放置点（POI），可连续放置',
  },
  {
    id: 'placement',
    label: '资产放置',
    icon: 'placement',
    key: '4',
    toolId: 'placement',
    hint: '重放上次的资产；首次请先在内容浏览器选择资产',
  },
];

/** 数字键 → 垂直工具项（与 VERTICAL_TOOLS 同源；input.ts 路由用） */
export const VERTICAL_KEY_TO_TOOL: Readonly<Record<string, VerticalToolDef>> = Object.fromEntries(
  VERTICAL_TOOLS.map((tool) => [tool.key, tool]),
) as Record<string, VerticalToolDef>;

// ── MEASURE_SUBTOOLS（阶段 10 测量分组：四子工具，无数字键）──

/** 测量子工具项（垂直条测量分组 / ContextToolbar 芯片 / 工具菜单子菜单共用数据源；
 *  无数字快捷键——1–4 已占不扩位（stage10 §E）） */
export interface MeasureSubtoolDef {
  kind: MeasureKind;
  /** 工具 id = `measure.${kind}`（ToolRegistry 注册键，与引擎 MEASURE_TOOL_IDS 同源） */
  toolId: string;
  label: string;
  /** tooltip 一句操作提示（垂直条 / 菜单） */
  hint: string;
}

/** 四测量子工具表（距离/高度差/面积/角度；顺序 = MEASURE_TOOL_IDS 注册序） */
export const MEASURE_SUBTOOLS: readonly MeasureSubtoolDef[] = [
  {
    kind: 'distance',
    toolId: 'measure.distance',
    label: '距离',
    hint: '点击逐点拾取表面或地面，双击 / Enter 结束',
  },
  {
    kind: 'height',
    toolId: 'measure.height',
    label: '高度差',
    hint: '拾取两点自动完成，读空间 / 水平 / ΔH 三值',
  },
  {
    kind: 'area',
    toolId: 'measure.area',
    label: '面积',
    hint: '点击圈出面域（至少 3 点非共线），双击 / Enter 结束',
  },
  {
    kind: 'angle',
    toolId: 'measure.angle',
    label: '角度',
    hint: '拾取三点（第二点为角点）自动完成',
  },
];

/** 测量工具 id → kind（`measure.<kind>` 前缀收窄；非测量 id 由调用侧 isMeasureToolId 先判） */
export function measureKindOfToolId(id: string): MeasureKind {
  return id.slice('measure.'.length) as MeasureKind;
}

/** 测量态中段操作提示（四 kind 各一；含删除/退出手势——ContextToolbar / 菜单 tooltip 同源） */
export const MEASURE_CTX_HINTS: Readonly<Record<MeasureKind, string>> = {
  distance: '点击拾取点 · 双击 / Enter 结束 · Delete 删除上一条 · Esc 退出',
  height: '拾取两点自动完成（读空间 / 水平 / ΔH）· Delete 删除上一条 · Esc 退出',
  area: '点击圈面（≥3 点非共线）· 双击 / Enter 结束 · Delete 删除上一条 · Esc 退出',
  angle: '拾取三点（第二点为角点）自动完成 · Delete 删除上一条 · Esc 退出',
};

// ── resolveDigitAction（数字键路由，e.code 稳定判定）────────

/** 数字键路由结果：区域子工具直切 / 垂直条 toggle（null = 不路由，回落工具转发） */
export type DigitAction =
  | { kind: 'area-sub'; shapeType: AreaSubtoolDef['shapeType'] }
  | { kind: 'vertical'; key: string }
  | null;

/** resolveDigitAction 输入（KeyboardEvent 的稳定子集） */
export interface DigitKeyInput {
  /** 物理键 code（'Digit1'..'Digit9'；Shift 组合下 e.key 变标点，code 不变） */
  code: string;
  shiftKey: boolean;
}

/** 数字键路由（纯函数）：Shift+Digit1..5 → 五形状直切；Digit1..4 → 垂直条四项 */
export function resolveDigitAction(e: DigitKeyInput): DigitAction {
  const match = /^Digit([0-9])$/.exec(e.code);
  if (!match) return null;
  const digit = match[1]!;
  if (e.shiftKey) {
    const sub = AREA_SUBTOOLS.find((t) => t.subKey === digit);
    return sub ? { kind: 'area-sub', shapeType: sub.shapeType } : null;
  }
  return digit in VERTICAL_KEY_TO_TOOL ? { kind: 'vertical', key: digit } : null;
}

// ── deriveMode / combineMode / MODES ────────────────────────

/** 形状类型 → 派生工作模式（面类区域 → terrain；线 → road；点 → annotation） */
const SHAPE_TO_MODE: Readonly<Record<ShapeType, WorkModeId>> = {
  polygon: 'terrain',
  rectangle: 'terrain',
  circle: 'terrain',
  ellipse: 'terrain',
  freehand: 'terrain',
  line: 'road',
  point: 'annotation',
};

/**
 * 工具状态 → 派生工作模式（纯函数）：select / transform / 空闲 / 未知 → scene；
 * draw-* 按 drawTarget.shapeType 派生（无记账兜底 scene）；placement → decoration。
 * T7.1 起为 combineMode 的派生半部（显示模式合成用），组件层消费 combineMode。
 */
export function deriveMode(activeToolId: string | null, drawTarget: DrawTarget | null): WorkModeId {
  if (activeToolId === PLACEMENT_TOOL_ID) return 'decoration';
  if (activeToolId !== null && activeToolId.startsWith('draw-')) {
    if (drawTarget === null) return 'scene';
    return SHAPE_TO_MODE[drawTarget.shapeType] ?? 'scene';
  }
  return 'scene';
}

/**
 * 显示模式合成（纯函数，T7.1）：绘制/放置工具激活期间显示派生态（面类 → terrain、
 * line → road、point → annotation、placement → decoration），工具退出恢复显式模式；
 * 绘制工具激活但无 drawTarget 记账 → 显式模式兜底（防隐形状态）。
 * ContextToolbar 徽标 / HUD 徽标 / 垂直条分组 / Inspector 引导卡同一数据源。
 */
export function combineMode(
  explicitMode: WorkModeId,
  activeToolId: string | null,
  drawTarget: DrawTarget | null,
): WorkModeId {
  const derived = deriveMode(activeToolId, drawTarget);
  return derived === 'scene' ? explicitMode : derived;
}

/** 禁用模式共享引导（measure/analysis 无模式语境，统一占位文案） */
const DISABLED_MODE_GUIDE: WorkModeGuide = {
  title: '暂无选中对象',
  description: '该模式暂未提供。',
  quickStart: '请在场景中选择一个对象',
};

/**
 * 八模式表（T7.1 六模式转正 + T10.2 measure 第七模式启用；analysis 灰显占位——
 * 契约排除项，解禁走按需门）。
 * accent 对应 tokens.css --mode-* 令牌（DESIGN.md §2/§5.22 登记）；verticalGroup 为
 * 垂直条置顶分组映射（scene = null 全部展开无折叠；measure 分组四测量子工具无数字键）。
 */
export const MODES: readonly WorkModeDef[] = [
  {
    id: 'scene',
    label: '场景',
    enabled: true,
    hint: '选择 / 变换对象的基础模式',
    accent: '--mode-scene',
    verticalGroup: null,
    hudHint: '点选 / 框选对象，W/E/R 变换，Alt+1..7 切换工作模式',
    inspectorGuide: {
      title: '场景模式',
      description: '管理场景中的对象：选择、变换、组织图层与大纲。',
      quickStart: '在视口点击对象查看属性；拖拽空白处框选多个对象。',
    },
  },
  {
    id: 'build',
    label: '建造',
    enabled: true,
    hint: '建筑与设施的创建与编辑',
    accent: '--mode-build',
    verticalGroup: 'region',
    hudHint: '按 1 绘制区域后赋「建筑」类型，选中建筑可步进楼层',
    inspectorGuide: {
      title: '建造模式',
      description: '专注建筑与设施：绘制区域后赋建筑类型，调整高度与楼层。',
      quickStart: '按 1（或 ⇧1..5 直切形状）绘制建筑轮廓，完成后点「建筑」芯片。',
    },
  },
  {
    id: 'road',
    label: '道路',
    enabled: true,
    hint: '道路创建与编辑',
    accent: '--mode-road',
    verticalGroup: 'line',
    hudHint: '按 2 绘制路径，选中道路可调宽度、编辑节点',
    inspectorGuide: {
      title: '道路模式',
      description: '专注路网：沿中心线绘制道路，调整宽度与走向。',
      quickStart: '按 2 绘制路径（点击折点、双击结束），完成后赋「道路」类型。',
    },
  },
  {
    id: 'terrain',
    label: '地形',
    enabled: true,
    hint: '地形与地面区域',
    accent: '--mode-terrain',
    verticalGroup: 'region',
    hudHint: '按 1 绘制地面区域（水面 / 绿地 / 广场 / 停车场等）',
    inspectorGuide: {
      title: '地形模式',
      description: '专注地面铺装：水面、绿地、广场、停车场等地表区域。',
      quickStart: '按 1 绘制区域形状，完成后点类型芯片一步赋型与样式。',
    },
  },
  {
    id: 'decoration',
    label: '装饰',
    enabled: true,
    hint: '植物、车辆与设施等模型资产',
    accent: '--mode-decoration',
    verticalGroup: 'placement',
    hudHint: '底部内容浏览器选资产后视口点击放置，按 4 重放最近',
    inspectorGuide: {
      title: '装饰模式',
      description: '专注模型装饰：植物、车辆、设施等资产摆放。',
      quickStart: '在底部内容浏览器点击资产卡片，再于视口点击放置。',
    },
  },
  {
    id: 'annotation',
    label: '标注',
    enabled: true,
    hint: '标注、POI 与点对象',
    accent: '--mode-annotation',
    verticalGroup: 'point',
    hudHint: '按 3 放置 POI 点位（连续放置，一段一条历史）',
    inspectorGuide: {
      title: '标注模式',
      description: '专注点位标注：POI 兴趣点与位置标记。',
      quickStart: '按 3 后在视口点击放置点位，连续点击连续放置。',
    },
  },
  {
    id: 'measure',
    label: '测量',
    enabled: true,
    hint: '距离 / 高度差 / 面积 / 角度四类会话态测量',
    accent: '--mode-measure',
    verticalGroup: 'measure',
    hudHint: '垂直条选测量类型后点击拾取；双击 / Enter 完成，Delete 删上一条',
    inspectorGuide: {
      title: '测量模式',
      description: '会话态测量距离、高度差、面积与角度：测量线不入场景、不入历史，清除全部即时重置。',
      quickStart: '垂直条（或 工具 → 测量）选择测量类型，视口点击拾取点；高度差 / 角度拾满自动完成。',
    },
  },
  {
    id: 'analysis',
    label: '分析',
    enabled: false,
    hint: '后续版本提供（当前为排除项，启用需按需门批准）',
    accent: null,
    verticalGroup: null,
    hudHint: '后续版本提供',
    inspectorGuide: DISABLED_MODE_GUIDE,
  },
];

/** 按模式 id 查模式表项（未知 id 兜底 scene） */
export function workModeOf(id: WorkModeId): WorkModeDef {
  return MODES.find((m) => m.id === id) ?? MODES[0]!;
}

// ── Alt+数字键路由（七启用模式直切键表）────────────────────

/**
 * Alt+1..8 键表（单一真相源：input.ts 路由 / 视图菜单 shortcut 同源派生）。
 * 序 = 需求第二十四章表序（scene/build/road/terrain/decoration/annotation）；
 * 第 7 位 = measure（T10.2 启用）；第 8 位 = analysis（目标禁用，不绑定，null 预留）。
 */
export const ALT_MODE_ORDER: readonly (WorkModeId | null)[] = [
  'scene',
  'build',
  'road',
  'terrain',
  'decoration',
  'annotation',
  'measure',
  null, // Alt+8 预留（analysis 禁用）
];

/** resolveAltDigitMode 输入（KeyboardEvent 稳定子集；e.code 判定数字物理键） */
export interface AltDigitInput {
  code: string;
  altKey: boolean;
  shiftKey?: boolean;
}

/**
 * Alt+数字键 → 工作模式（纯函数）：Alt+Digit1..7 直切七启用模式（表序见
 * ALT_MODE_ORDER）；Alt+8 目标禁用不绑定；无 Alt / Shift 叠加 / Digit0 / 非数字
 * code → null（回落既有键位体系，零冲突）。
 */
export function resolveAltDigitMode(e: AltDigitInput): WorkModeId | null {
  if (!e.altKey || e.shiftKey === true) return null;
  const match = /^Digit([1-9])$/.exec(e.code);
  if (!match) return null;
  return ALT_MODE_ORDER[Number(match[1]) - 1] ?? null;
}

// ── activateWorkMode（三路同源切换入口）────────────────────

/**
 * 切换显式工作模式（ContextToolbar 选择器 / input.ts Alt 键 / 视图菜单 view.mode-*
 * 三路同源）：禁用模式拒绝（false）；若有激活绘制/放置工具先走 cancel 语义（ESC 同路，
 * 不产生 Command，防隐形状态——沿 T7.4 任务书同语义先例）；非绘制/放置工具不抢占；
 * 测量工具激活期间切模式同理不抢占、**不清空 MeasureSession**（会话生命周期归组合根，
 * stage10 §A）。显式态写 workspaceStore.mode（随工作区布局快照持久化——t3d-editor.
 * workspace，T7.3 落地；analysis 反序列化不可恢复，落 scene）。
 */
export function activateWorkMode(mode: WorkModeId, tools: ToolManager | null): boolean {
  const def = MODES.find((m) => m.id === mode);
  if (!def?.enabled) return false;
  const active = tools?.getActiveTool() ?? null;
  if (
    active !== null &&
    (active.id.startsWith('draw-') ||
      active.id === PLACEMENT_TOOL_ID ||
      active.id === ROAD_SPLIT_TOOL_ID)
  ) {
    tools!.cancel();
  }
  useWorkspaceStore.getState().setMode(mode);
  return true;
}

// ── togglePure3d（纯三维模式共享切换入口，T7.4）─────────────

/**
 * 切换纯三维工作模式（Tab 键 / 视图菜单 view.pure3d 三路同源，需求 14 章）：
 * - 进入（当前 false）：若激活工具为 draw-* / placement / vertex-edit → tools.cancel()
 *   （ESC 同路，不产生 Command，防隐形状态——vertex-edit 为任务书「绘制/放置」之外的
 *   主代理扩裁：顶点编辑会话同属防隐形状态原则）；select / transform 不动。随后关闭
 *   可能开着的右键菜单浮层（closeContextMenu）。
 * - 退出（当前 true）：只翻位，不动工具、不动任何布局字段——pure3d 从不修改布局
 *   （zone 变量由 App 装配层临时覆写），退出精确还原由此免费成立。
 * 工作态非布局态：不随工作区快照持久化（workspaceStore T7.4 裁定）。
 */
export function togglePure3d(tools: ToolManager | null): void {
  const pure3d = useWorkspaceStore.getState().pure3d;
  if (!pure3d) {
    const active = tools?.getActiveTool() ?? null;
    if (
      active !== null &&
      (active.id.startsWith('draw-') ||
        active.id === PLACEMENT_TOOL_ID ||
        active.id === VERTEX_EDIT_TOOL_ID ||
        active.id === ROAD_SPLIT_TOOL_ID)
    ) {
      tools!.cancel();
    }
    useEditorStore.getState().closeContextMenu();
  }
  useWorkspaceStore.getState().setPure3d(!pure3d);
}

// ── contextToolsFor ─────────────────────────────────────────

/** 默认组静态定义（激活/勾选位按状态填充） */
const DEFAULT_CONTEXT_TOOLS: readonly ContextToolItem[] = [
  { id: 'select', kind: 'tool', label: '选择', key: SELECT_KEY, icon: 'select' },
  { id: 'translate', kind: 'tool', label: '移动', key: 'w', icon: 'translate' },
  { id: 'rotate', kind: 'tool', label: '旋转', key: 'e', icon: 'rotate' },
  { id: 'scale', kind: 'tool', label: '缩放', key: 'r', icon: 'scale' },
  // 吸附 toggle = 总开关语义（T8.1：off 压下全部吸附分项；Ctrl 拖拽临时反转）——
  // 不再标 G 键帽（G 为绘制/顶点编辑会话内网格键，非本开关快捷键）
  { id: 'snap', kind: 'toggle', label: '吸附', key: '', icon: 'snap' },
  // 网格显隐 toggle 不配快捷键（G 已归吸附语义，2026-09-10 主代理裁定）
  { id: 'grid', kind: 'toggle', label: '网格', key: '', icon: 'grid' },
];

/** 顶点编辑态提示（与 SHAPE_DRAW_HINTS 同源风格；退出两手势：Esc / 双击同一对象） */
export const VERTEX_EDIT_HINT =
  '拖动顶点 · Alt+点击边中点插入 · 右键或 Delete 删除 · G 网格 / A 45° · Esc 退出';

/** 道路分割态提示（T7.6 R7；与 VERTEX_EDIT_HINT 同源风格） */
export const ROAD_SPLIT_CTX_HINT = '点击道路转角节点分割 · Esc 退出';

/**
 * 构建 Context Toolbar 模型（纯函数）：默认组 QWER 激活位 = activeToolId（transform
 * 钮再按 gizmoMode 细分）；吸附/网格勾选位 = snapEnabled / gridVisible；绘制态
 * （draw-* 且有 drawTarget）追加中段——面类五形状切换芯片（同组即切），线/点单工具
 * 仅提示文案；顶点编辑态（vertex-edit）/ 道路分割态（road-split）/ 测量态（measure.*，
 * T10.2）中段为四 kind 芯片 + 操作指引（各态互斥；渲染优先级 draw > vertexEdit >
 * road-split > measure）。
 */
export function contextToolsFor(state: ContextToolbarState): ContextToolbarModel {
  const isTransform = state.activeToolId === TRANSFORM_TOOL_ID;
  const tools = DEFAULT_CONTEXT_TOOLS.map((tool) => {
    if (tool.kind === 'toggle') {
      return tool.id === 'snap'
        ? { ...tool, checked: state.snapEnabled }
        : { ...tool, checked: state.gridVisible };
    }
    if (tool.id === 'select') return { ...tool, active: state.activeToolId === SELECT_TOOL_ID };
    return { ...tool, active: isTransform && state.gizmoMode === tool.id };
  }) as ContextToolItem[];

  if (state.activeToolId === VERTEX_EDIT_TOOL_ID) {
    return { tools, draw: null, vertexEdit: { hint: VERTEX_EDIT_HINT }, roadSplit: null, measure: null };
  }
  if (state.activeToolId === ROAD_SPLIT_TOOL_ID) {
    return { tools, draw: null, vertexEdit: null, roadSplit: { hint: ROAD_SPLIT_CTX_HINT }, measure: null };
  }
  if (state.activeToolId !== null && isMeasureToolId(state.activeToolId)) {
    const kind = measureKindOfToolId(state.activeToolId);
    return {
      tools,
      draw: null,
      vertexEdit: null,
      roadSplit: null,
      measure: {
        kindOptions: MEASURE_SUBTOOLS.map((sub) => ({
          value: sub.kind,
          label: sub.label,
          active: sub.kind === kind,
        })),
        hint: MEASURE_CTX_HINTS[kind],
      },
    };
  }

  const drawing = state.activeToolId !== null && state.activeToolId.startsWith('draw-');
  if (!drawing || !state.drawTarget) {
    return { tools, draw: null, vertexEdit: null, roadSplit: null, measure: null };
  }

  const shape = state.drawTarget.shapeType;
  const shapeOptions: DrawContextOption[] = AREA_SHAPE_TYPES.includes(shape)
    ? AREA_SUBTOOLS.map((sub) => ({
        value: sub.shapeType,
        label: sub.label,
        active: sub.shapeType === shape,
      }))
    : [];

  return {
    tools,
    draw: { shapeOptions, hint: SHAPE_DRAW_HINTS[shape] },
    vertexEdit: null,
    roadSplit: null,
    measure: null,
  };
}

// ── contextActionsFor（上下文工具矩阵，门 Q4 四分裁定；T7.6 占位转正）─────

/** 矩阵动作项（可点执行：复制走 Ctrl+D 既有路由 / 顶点编辑走 toggleVertexEdit /
 *  分割走 road-split 工具激活 / 对齐·阵列·合并走 alignArrayModel 与 MergeRoadCommand） */
export interface ContextActionItem {
  kind: 'action';
  id: 'duplicate' | 'vertex-edit' | 'align' | 'array' | 'road-split' | 'road-merge';
  label: string;
  /** 操作提示（tooltip） */
  hint: string;
}

/** 矩阵步进器项（业务参数 ±步进；经 ChangeSemanticCommand 写 semantic.properties，一次一条历史） */
export interface ContextStepperItem {
  kind: 'stepper';
  id: string;
  label: string;
  /** semantic.properties 业务参数键 */
  paramKey: string;
  /** 当前值（semantic.properties 现值；缺省 = 步进器表默认值） */
  value: number;
  step: number;
  min: number;
  max?: number;
  unit?: string;
  /** 读数小数位（等宽数字展示） */
  precision: number;
}

export type ContextMatrixItem = ContextActionItem | ContextStepperItem;

/** 矩阵模型（ContextToolbar 中段渲染输入） */
export interface ContextActionModel {
  /** 单选目标 id（动作派发用；多选为 null） */
  objectId: ID | null;
  items: readonly ContextMatrixItem[];
}

/** 步进器规格（数据表：语义 × 参数键 → 步进/默认/单位；min/max 以语义定义参数优先截断） */
interface StepperSpec {
  id: string;
  paramKey: string;
  label: string;
  semantic: SemanticType;
  step: number;
  /** properties 缺省时的显示值（宽度 = 语义定义默认 6；楼层 = 1） */
  fallback: number;
  /** 语义定义未声明该参数时的兜底下界（floors 不在定义内，取 1） */
  fallbackMin: number;
  unit?: string;
  precision: number;
}

const STEPPER_SPECS: readonly StepperSpec[] = [
  {
    id: 'floors',
    paramKey: 'floors',
    label: '楼层',
    semantic: 'building',
    step: 1,
    fallback: 1,
    fallbackMin: 1,
    precision: 0,
  },
  {
    id: 'width',
    paramKey: 'width',
    label: '宽度',
    semantic: 'road',
    step: 0.5,
    fallback: 6,
    fallbackMin: 0,
    unit: 'm',
    precision: 1,
  },
];

/** 对齐项（多选 ≥2；T7.6 R1 转正——弹层八菜单经 alignArrayModel 执行） */
const ALIGN_ITEM: ContextActionItem = {
  kind: 'action',
  id: 'align',
  label: '对齐',
  hint: '对齐选中对象（悬停菜单项预览目标位置）',
};

/** 阵列项（单选/多选；T7.6 R2 转正——popover 预览后确认） */
const ARRAY_ITEM: ContextActionItem = {
  kind: 'action',
  id: 'array',
  label: '阵列',
  hint: '沿方向线性阵列选中对象（参数实时预览，确认一条历史）',
};

/** 分割项（单选 road line；T7.6 R4 转正——激活 road-split 工具） */
const ROAD_SPLIT_ITEM: ContextActionItem = {
  kind: 'action',
  id: 'road-split',
  label: '分割',
  hint: '在转角节点处分割道路（点击节点确认 · Esc 退出）',
};

/** 合并项（恰选 2 条相邻 road line；T7.6 R5 visible-when-applicable） */
const ROAD_MERGE_ITEM: ContextActionItem = {
  kind: 'action',
  id: 'road-merge',
  label: '合并',
  hint: '合并两条相邻道路（保留前者，一条历史）',
};

/**
 * 语义 × 形状 → 专属矩阵项数据表（注册制：新增类型只改本表，禁止组件内散落 if）。
 * T7.6 占位转正：building = 轮廓编辑 + 楼层步进 + 阵列（对齐单选无意义不显示）；
 * road（限 line）= 节点编辑 + 宽度步进 + 分割 + 阵列。
 */
const SEMANTIC_MATRIX: readonly {
  semantic: SemanticType;
  /** 形状限定（缺省 = 任意形状命中） */
  shapes?: readonly ShapeType[];
  vertexEditLabel: string;
  stepper: StepperSpec;
  extraActions: readonly ContextActionItem[];
}[] = [
  {
    semantic: 'building',
    vertexEditLabel: '轮廓编辑',
    stepper: STEPPER_SPECS[0]!,
    extraActions: [ARRAY_ITEM],
  },
  {
    semantic: 'road',
    shapes: ['line'],
    vertexEditLabel: '节点编辑',
    stepper: STEPPER_SPECS[1]!,
    extraActions: [ROAD_SPLIT_ITEM, ARRAY_ITEM],
  },
];

/** 通用复制项（单选/多选通用；执行走 Ctrl+D 既有路由——onAction('edit.duplicate')） */
const DUPLICATE_ITEM: ContextActionItem = {
  kind: 'action',
  id: 'duplicate',
  label: '复制',
  hint: '原地复制选中（Ctrl+D，偏移 1m）',
};

/** 步进器项构建：现值 = semantic.properties 数值现值（缺省表 fallback）；min/max 以语义定义参数定义优先截断 */
function stepperItemOf(spec: StepperSpec, properties: Record<string, unknown>): ContextStepperItem {
  const raw = properties[spec.paramKey];
  const value = typeof raw === 'number' && Number.isFinite(raw) ? raw : spec.fallback;
  // min/max 按语义定义参数定义截断（road.width 定义 min 0；floors 不在定义内取兜底 1）
  const defParam = getSemanticDefinition(spec.semantic)?.properties.find((p) => p.key === spec.paramKey);
  const defMin = defParam?.min;
  const defMax = defParam?.max;
  return {
    kind: 'stepper',
    id: spec.id,
    label: spec.label,
    paramKey: spec.paramKey,
    value,
    step: spec.step,
    min: typeof defMin === 'number' ? defMin : spec.fallbackMin,
    ...(typeof defMax === 'number' ? { max: defMax } : {}),
    ...(spec.unit !== undefined ? { unit: spec.unit } : {}),
    precision: spec.precision,
  };
}

/**
 * 合并资格（R5 visible-when-applicable，纯函数）：恰选 2 条 road line region 且
 * 端点相邻（世界坐标 = points + position(x/z)，容差 0.5m——domain 单一真相源）。
 */
export function canMergeRoads(selection: readonly SceneObject[]): boolean {
  if (selection.length !== 2) return false;
  const roads = selection.filter(
    (obj): obj is RegionObject =>
      isRegionObject(obj) && obj.semantic.type === 'road' && obj.shape.type === 'line',
  );
  if (roads.length !== 2) return false;
  const world = (r: RegionObject): Vec2[] =>
    r.shape.points.map((p) => ({
      x: p.x + r.transform.position.x,
      y: p.y + r.transform.position.z,
    }));
  return detectRoadAdjacency(world(roads[0]!), world(roads[1]!)) !== null;
}

/**
 * 上下文工具矩阵（纯函数，门 Q4 四分裁定；T7.6 占位转正）：
 * - 空选择 / 绘制 / 顶点编辑 / 道路分割 / 放置 / 测量激活期间 → null（与既有绘制中段、
 *   顶点编辑指引、道路分割指引、放置态、测量态中段互斥——中段归专属态）；
 * - 单选 building 族 region → 复制 / 轮廓编辑 / 楼层步进 / 阵列（对齐单选无意义不显示）；
 * - 单选 road（line region）→ 复制 / 节点编辑 / 宽度步进 / 分割 / 阵列；
 * - 单选其他 region / model → 复制 / 阵列（unclassified 单选由调用侧叠加
 *   RegionQuickApply 快选条）；
 * - 多选 → 对齐（≥2）+ 阵列 + 合并（恰 2 条相邻 road line 时追加；不相邻不显示）。
 * 步进器消费方：ContextActions 组件经 ChangeSemanticCommand 写 semantic.properties
 * （分域契约 §A ② 业务参数路径，一次一条历史）。
 */
export function contextActionsFor(
  selection: readonly SceneObject[],
  activeToolId: string | null,
): ContextActionModel | null {
  if (selection.length === 0) return null;
  // 绘制 / 顶点编辑 / 道路分割 / 放置 / 测量态中段归专属态（互斥关系保持）
  if (
    activeToolId !== null &&
    (activeToolId.startsWith('draw-') ||
      activeToolId === VERTEX_EDIT_TOOL_ID ||
      activeToolId === ROAD_SPLIT_TOOL_ID ||
      activeToolId === PLACEMENT_TOOL_ID ||
      isMeasureToolId(activeToolId))
  ) {
    return null;
  }

  if (selection.length > 1) {
    const items: ContextActionItem[] = [ALIGN_ITEM, ARRAY_ITEM];
    if (canMergeRoads(selection)) items.push(ROAD_MERGE_ITEM);
    return { objectId: null, items };
  }

  const target = selection[0]!;
  if (!isRegionObject(target)) {
    return { objectId: target.id, items: [DUPLICATE_ITEM, ARRAY_ITEM] };
  }

  const rule = SEMANTIC_MATRIX.find(
    (entry) =>
      entry.semantic === target.semantic.type &&
      (entry.shapes === undefined || entry.shapes.includes(target.shape.type)),
  );
  if (!rule) {
    return { objectId: target.id, items: [DUPLICATE_ITEM, ARRAY_ITEM] };
  }
  return {
    objectId: target.id,
    items: [
      DUPLICATE_ITEM,
      {
        kind: 'action',
        id: 'vertex-edit',
        label: rule.vertexEditLabel,
        hint: `${rule.vertexEditLabel}（顶点编辑，Esc 退出）`,
      },
      stepperItemOf(rule.stepper, target.semantic.properties),
      ...rule.extraActions,
    ],
  };
}

// ── 对齐弹层菜单模型（T7.6 R1）──────────────────────────────

/** 对齐菜单项（八模式；均布项在对象数 <3 时 disabled 可见） */
export interface AlignMenuEntry {
  mode: AlignMode;
  label: string;
  hint: string;
  /** 均布项（distribute-*）在 count < 3 时禁用（无中间对象） */
  disabled: boolean;
}

/** 八菜单项数据表（X/Z 最小·居中·最大 + 均布；图标映射归组件层） */
const ALIGN_MENU_TABLE: ReadonlyArray<{ mode: AlignMode; label: string; hint: string }> = [
  { mode: 'min-x', label: 'X 最小', hint: '全体左边缘对齐到选集最左' },
  { mode: 'center-x', label: 'X 居中', hint: '全体水平中心对齐到选集中心' },
  { mode: 'max-x', label: 'X 最大', hint: '全体右边缘对齐到选集最右' },
  { mode: 'min-z', label: 'Z 最小', hint: '全体上边缘对齐到选集最上' },
  { mode: 'center-z', label: 'Z 居中', hint: '全体垂直中心对齐到选集中心' },
  { mode: 'max-z', label: 'Z 最大', hint: '全体下边缘对齐到选集最下' },
  { mode: 'distribute-x', label: 'X 均布', hint: '水平等间距分布（需至少 3 个对象）' },
  { mode: 'distribute-z', label: 'Z 均布', hint: '垂直等间距分布（需至少 3 个对象）' },
];

/** 对齐弹层菜单模型（纯函数：count < 3 时均布项 disabled 可见，其余恒可用） */
export function alignMenuModel(count: number): readonly AlignMenuEntry[] {
  return ALIGN_MENU_TABLE.map((entry) => ({
    ...entry,
    disabled: (entry.mode === 'distribute-x' || entry.mode === 'distribute-z') && count < 3,
  }));
}

// ── 共享激活入口（键盘与点击同路；模块唯一的非纯节） ────────

/**
 * 激活变换工具（QWER 组 W/E/R 的共享入口）：先写 store.gizmoMode 记账
 * （Context Toolbar 三钮激活态与最后激活模式一致），再激活工具。
 */
export function activateTransformTool(tools: ToolManager, mode: GizmoMode): void {
  useEditorStore.getState().setGizmoMode(mode);
  tools.activate(TRANSFORM_TOOL_ID, { mode });
}

/** 激活选择工具（Q 的共享入口）：无参数无记账，仅为路径统一。 */
export function activateSelectTool(tools: ToolManager): void {
  tools.activate(SELECT_TOOL_ID);
}

/**
 * 形状绘制 toggle（数字键 / 垂直条 / 创建菜单 / ContextToolbar 形状切换共用）：
 * 激活中再触同形状 → tools.cancel() 退出（既有订阅 tool:changed(null) → 自动回
 * select，零改动）；否则激活 { shape, perspective } 并记账 drawTarget；面类同时
 * 记忆 lastAreaShape（区域组主键 1 / 主钮重入的数据源）。
 */
export function toggleShapeDraw(tools: ToolManager, shape: ShapeType, perspective = false): void {
  const store = useEditorStore.getState();
  const sameShape =
    tools.getActiveTool()?.id === shapeToolId(shape) && store.drawTarget?.shapeType === shape;
  if (sameShape) {
    tools.cancel();
    return;
  }
  tools.activate(shapeToolId(shape), { shape, perspective });
  store.setDrawTarget({ shapeType: shape });
  if (AREA_SHAPE_TYPES.includes(shape)) {
    store.setLastAreaShape(shape as AreaSubtoolDef['shapeType']);
  }
}

/** 区域组主入口（键 1 / 区域主钮）：按 store.lastAreaShape 记忆激活子工具 */
export function toggleRegionDraw(tools: ToolManager, perspective = false): void {
  toggleShapeDraw(tools, useEditorStore.getState().lastAreaShape, perspective);
}

/**
 * 测量子工具 toggle（阶段 10 T10.2；垂直条测量分组 / ContextToolbar 四 kind 芯片 /
 * 工具菜单子菜单三路共用）：激活中再触同 kind → tools.cancel() 退出（沿
 * toggleShapeDraw 先例——订阅 tool:changed(null) 自动回 select）；异 kind 即切
 * （MeasureTool.deactivate 自弃草稿，已提交测量项归会话不动）。
 */
export function toggleMeasureTool(tools: ToolManager, kind: MeasureKind): void {
  const toolId = `measure.${kind}`;
  if (tools.getActiveTool()?.id === toolId) {
    tools.cancel();
    return;
  }
  tools.activate(toolId);
}

/**
 * 资产组入口（键 4 / 放置钮）：重放 store.lastAssetId 资产（默认「模型」图层，
 * 层名 = domain/assets.MODEL_LAYER_NAME，T6.7 旧表删除后的单一真相源）；
 * 无记忆资产返回 false（调用方 Toast 提示先去内容浏览器选择）。
 */
export function togglePlacement(
  tools: ToolManager,
  scene: { getLayers(): ReadonlyArray<{ id: string; name: string }> },
  assetId: string | null,
): boolean {
  if (!assetId) return false;
  const layerId = scene.getLayers().find((l) => l.name === MODEL_LAYER_NAME)?.id ?? null;
  tools.activate(PLACEMENT_TOOL_ID, { assetId, layerId });
  return true;
}

/** 三步流便捷入口（facade 供组件层直调）：toggleShapeDraw 的门面版 */
export function enterShapeDraw(facade: EditorFacade, shape: ShapeType, perspective = false): void {
  toggleShapeDraw(facade.tools, shape, perspective);
}

/**
 * 顶点编辑入口（T6.8，面板「编辑顶点」按钮 / 双击对象共用）：
 * 编辑中再触同一对象 → 回选择工具（再次点击退出）；否则激活 vertex-edit 携带目标。
 */
export function toggleVertexEdit(tools: ToolManager, objectId: ID): void {
  const active = tools.getActiveTool();
  if (active instanceof VertexEditTool && active.isEditing(objectId)) {
    activateSelectTool(tools);
    return;
  }
  tools.activate(VERTEX_EDIT_TOOL_ID, { objectId });
}
