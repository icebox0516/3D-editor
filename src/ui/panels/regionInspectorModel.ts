/**
 * ui/panels/regionInspectorModel —— RegionObject 四分组面板模型纯函数（阶段 6 T6.6）。
 *
 * 职责：选中单个 type 'region' 对象时，检查器按「基础信息 / 几何 / 业务类型 / 表现样式」
 *      四分组重组（需求《绘制需求变更.md》§7.3）+ 变换组保留（通用组）：
 *   - sectionsForRegion：分组清单（组头附注 = 形状/语义中文名；几何组携带字段描述符），
 *     由 sectionsFor 按 isRegionObject 分派（T6.7：非 region 对象走通用组，旧要素分支已删）；
 *   - geometryFieldsFor：几何组字段——参数化编辑（矩形长宽/圆半径/椭圆两半轴，初值 options
 *     优先·缺失按点列包围盒反推，改值经 domain shapeConvert 重生成点列）+ 基准高度
 *     （shape.baseHeight，与变换组位置 Y 两层叠加生效，分域契约 §A 高度合成）+ 派生只读
 *     （顶点数/面积/周长——面类 polygonArea + 闭合周长、线 polylineLength 作周长语义、
 *     点坐标只读 x/z）；
 *   - 语义选项与命令载荷：semanticTypeOptions 十类下拉（SEMANTIC_DEFINITIONS 驱动）、
 *     semanticTypeChange（类型切换 = 新类型默认参数整体替换，自动归层/默认预设/overrides
 *     清空由 ChangeSemanticCommand 内部完成）、semanticPropertyChange（参数变更 = 类型不变
 *     的 ② 路径，仅 properties）；
 *   - 预设选项与命令载荷：regionPresetOptions（EditorFacade.registries.presets.find 双维
 *     过滤 + default_solid 兜底，沿 regionQuickApply.presetOptions 先例；缩略图取 meta.thumbnail、
 *     色样取 defaultParams 的 color 默认值）、presetSelect（切换 = overrides 清空）、
 *     presetOverrideUpdate（改参 = presetId 不变的 update 路径，runtime reconcile 不闪变）；
 *   - resolvePresetValues：defaultParams 默认 < overrides 合成 + 数值 min/max 钳制；
 *   - resolveRegionStyleTargets：region 版四档作用域过滤（2026-09-11 审计定稿）：
 *     当前对象=仅自身 / 同类型=过滤 semantic.type / 当前图层=过滤 layerId
 *     （未分层退化为仅自身）/ 同预设=过滤 style.presetId；仅 RegionObject 参与批量；
 *     当前对象恒含且居首。
 * 边界：纯数据/纯逻辑，零渲染零 React；ui 层只依赖 core/scene/domain/registries/editor
 *      （分层 DAG：禁止 runtime/io）；预设元数据唯一途径 = 结构化 PresetSource
 *      （EditorFacade.registries.presets 注入，禁止 import runtime，分域契约 §0 规则 2）。
 */
import { dist, polygonArea, polylineLength } from '../../core/math';
import {
  SEMANTIC_DEFINITIONS,
  getSemanticDefinition,
  isRegionObject,
  parametricEntriesOf,
} from '../../domain/regions';
import type {
  RegionObject,
  RegionSemantic,
  RegionShape,
  RegionStyle,
  SemanticType,
  ShapeType,
} from '../../domain/regions';
import type { StyleParameter } from '../../domain/styles';
import type { SceneObject } from '../../scene/SceneObject';
import type { SemanticChange } from '../../editor/commands/ChangeSemanticCommand';
import { SHAPE_DRAW_LABELS } from '../tools/toolIA';
import type { InspectorParamField, InspectorSection } from './inspectorModel';
import type { StyleApplyScope } from './StyleParametersForm';

/** 面类形状（派生面积 + 闭合周长；line/point 另有周长/坐标语义） */
const FACE_SHAPE_TYPES: readonly ShapeType[] = ['polygon', 'rectangle', 'circle', 'ellipse', 'freehand'];

/** RegionObject 面板类型中文名（旧注册表无 region，基础信息组只读行取值） */
export const REGION_TYPE_LABEL = '区域';

/** 参数化形状参数 → 展示名（沿绘制工具与需求 §三 用语；未登记键回退键名） */
const SHAPE_PARAM_LABELS: Readonly<Record<string, string>> = {
  width: '宽度',
  height: '长度',
  radius: '半径',
  radiusX: '长半轴',
  radiusY: '短半轴',
};

/** 闭合环周长：折线长 + 闭合边（点列不重复闭合点，closed 由 shape.closed 表达） */
function closedPerimeter(points: { x: number; y: number }[]): number {
  if (points.length < 2) return 0;
  return polylineLength(points) + dist(points[points.length - 1]!, points[0]!);
}

// ── 分组清单 ────────────────────────────────────────────────

/**
 * RegionObject → 四分组 + 变换组（组序固定：基础信息/几何/业务类型/表现样式/变换）。
 * 几何组携带字段描述符（fields）；通用组（transform/metadata/advanced，model 等非
 * region 对象）不经本函数（sectionsFor 按 isRegionObject 分派）。
 */
export function sectionsForRegion(obj: RegionObject): InspectorSection[] {
  return [
    { id: 'region-basic', label: '基础信息' },
    {
      id: 'region-geometry',
      label: '几何',
      hint: SHAPE_DRAW_LABELS[obj.shape.type],
      fields: geometryFieldsFor(obj.shape),
    },
    {
      id: 'region-semantic',
      label: '业务类型',
      hint: semanticLabelOf(obj.semantic.type),
    },
    { id: 'region-style', label: '表现样式' },
    { id: 'transform', label: '变换', hint: 'm · deg' },
  ];
}

/** 语义类型中文名（SEMANTIC_DEFINITIONS label；未注册回退原始串） */
function semanticLabelOf(type: SemanticType): string {
  return getSemanticDefinition(type)?.label ?? type;
}

// ── 几何组字段 ──────────────────────────────────────────────

/**
 * RegionShape → 几何组字段描述符：参数化编辑（矩形/圆/椭圆）+ 基准高度 +
 * 派生只读（顶点数恒有；面类面积+闭合周长、线周长=polylineLength、点坐标只读）。
 */
export function geometryFieldsFor(shape: RegionShape): InspectorParamField[] {
  const fields: InspectorParamField[] = [];

  const entries = parametricEntriesOf(shape);
  if (entries) {
    for (const entry of entries) {
      fields.push({
        kind: 'shape-param-number',
        key: entry.key,
        label: SHAPE_PARAM_LABELS[entry.key] ?? entry.key,
        value: entry.value,
        precision: 2,
        step: 0.5,
        min: 0.1,
        unit: 'm',
      });
    }
  }

  fields.push({
    kind: 'base-height-number',
    key: 'baseHeight',
    label: '基准高度',
    value: shape.baseHeight,
    precision: 2,
    step: 0.1,
    min: 0,
    unit: 'm',
  });

  fields.push({
    kind: 'derived-number',
    key: 'derived:vertexCount',
    label: '顶点数',
    value: shape.points.length,
    precision: 0,
    unit: '个',
  });

  if (FACE_SHAPE_TYPES.includes(shape.type)) {
    fields.push({
      kind: 'derived-number',
      key: 'derived:area',
      label: '面积',
      value: polygonArea(shape.points),
      precision: 1,
      unit: 'm²',
    });
    fields.push({
      kind: 'derived-number',
      key: 'derived:perimeter',
      label: '周长',
      value: closedPerimeter(shape.points),
      precision: 2,
      unit: 'm',
    });
  } else if (shape.type === 'line') {
    fields.push({
      kind: 'derived-number',
      key: 'derived:perimeter',
      label: '周长',
      value: polylineLength(shape.points),
      precision: 2,
      unit: 'm',
    });
  } else if (shape.type === 'point') {
    const first = shape.points[0];
    if (first) {
      fields.push({ kind: 'coord', key: 'derived:coord', label: '坐标', x: first.x, y: first.y });
    }
  }

  return fields;
}

/** 从几何组字段中取出参数化编辑字段（组件渲染辅助） */
export function parametricFieldsOf(fields: readonly InspectorParamField[]): InspectorParamField[] {
  return fields.filter((f) => f.kind === 'shape-param-number');
}

// ── 业务类型：选项与命令载荷 ─────────────────────────────────

/** 十类语义下拉项（SEMANTIC_DEFINITIONS 驱动，注册表顺序即展示顺序） */
export function semanticTypeOptions(): { value: SemanticType; label: string }[] {
  return SEMANTIC_DEFINITIONS.map((def) => ({ value: def.type, label: def.label }));
}

/** 语义定义参数默认值 → properties 载荷（沿 createRegionObject/regionQuickApply 同构先例） */
function defaultPropertiesOf(type: SemanticType): Record<string, unknown> {
  const def = getSemanticDefinition(type);
  if (!def) return {};
  const properties: Record<string, unknown> = {};
  for (const param of def.properties) {
    properties[param.key] = param.default;
  }
  return properties;
}

/**
 * 类型切换载荷：新类型 + 该类默认参数（road.width=6 / building.height=10）。
 * 自动归层 + 默认预设 + overrides 清空由 ChangeSemanticCommand 内部完成（① 路径一条历史）。
 */
export function semanticTypeChange(nextType: SemanticType): SemanticChange {
  return { type: nextType, properties: defaultPropertiesOf(nextType) };
}

/**
 * 业务参数变更载荷：类型不变 + properties 整体替换（② 路径——几何顶点与样式不动，
 * 渲染侧按 update/setGeometry 路径消化）。
 */
export function semanticPropertyChange(
  semantic: RegionSemantic,
  key: string,
  value: string | number | boolean,
): SemanticChange {
  return { type: semantic.type, properties: { ...semantic.properties, [key]: value } };
}

// ── 表现样式：预设选项与命令载荷 ─────────────────────────────

/** 预设注册表最小结构（EditorFacade.registries.presets 的结构子集，便于测试注入） */
export interface RegionPresetSource {
  find(
    shapeType: ShapeType,
    semanticType: SemanticType,
  ): RegionPresetMetaLike[];
  get(id: string): RegionPresetMetaLike | undefined;
}

/** 预设元数据最小结构（StylePresetMeta 的结构子集） */
interface RegionPresetMetaLike {
  id: string;
  name: string;
  thumbnail?: string;
  defaultParams: readonly { key: string; default: unknown }[];
}

/** 预设网格一项 */
export interface RegionPresetOption {
  id: string;
  name: string;
  /** 缩略图静态资源引用（data-URI SVG 串可直接 <img src>；缺省由色块兜底） */
  thumbnail?: string;
  /** 色样（defaultParams 的 color 参数默认值；无颜色参数缺省） */
  color?: string;
}

/**
 * 预设网格数据源：shape × semantic 双维过滤；无命中回退 default_solid（沿
 * regionQuickApply.presetOptions 先例）；缩略图取 meta.thumbnail、色样取 color 默认值。
 */
export function regionPresetOptions(
  presets: RegionPresetSource,
  shapeType: ShapeType,
  semanticType: SemanticType,
): RegionPresetOption[] {
  const toOption = (meta: RegionPresetMetaLike): RegionPresetOption => ({
    id: meta.id,
    name: meta.name,
    thumbnail: meta.thumbnail,
    color: pickColor(meta.defaultParams),
  });
  const hits = presets.find(shapeType, semanticType).map(toOption);
  if (hits.length > 0) return hits;
  const fallback = presets.get('default_solid');
  return fallback ? [toOption(fallback)] : [];
}

/** 参数表 color 默认值（无颜色参数返回 undefined） */
function pickColor(params: readonly { key: string; default: unknown }[]): string | undefined {
  const color = params.find((p) => p.key === 'color');
  return typeof color?.default === 'string' ? color.default : undefined;
}

/** 切换预设载荷：overrides 清空（整体替换，渲染侧 dispose+create）；seed 保留（D18：换 preset 不动 seed，undo 换回散布复原） */
export function presetSelect(presetId: string, current?: RegionStyle): RegionStyle {
  const seed = current?.seed;
  return typeof seed === 'number' && Number.isFinite(seed)
    ? { presetId, overrides: {}, seed }
    : { presetId, overrides: {} };
}

/**
 * 参数覆写载荷：presetId 不变（update 路径而非重建——runtime 经 scene:changed reconcile
 * 只调 instance.update，不闪变）+ overrides 现有键合并保留 + seed 原样透传（D18）。
 */
export function presetOverrideUpdate(style: RegionStyle, key: string, value: unknown): RegionStyle {
  const next: RegionStyle = { presetId: style.presetId, overrides: { ...style.overrides, [key]: value } };
  if (typeof style.seed === 'number' && Number.isFinite(style.seed)) next.seed = style.seed;
  return next;
}

/** seed 重掷载荷（D18）：presetId/overrides 不动，仅写新 seed（随机源由调用方掷） */
export function presetSeedUpdate(style: RegionStyle, seed: number): RegionStyle {
  return { presetId: style.presetId, overrides: style.overrides, seed };
}

/**
 * 作用域/批量应用的 seed 继承（D18-5：seed 区域私有）——payload 携带的 seed 是当前
 * 对象的透传，落到其他目标时丢弃、继承目标自身 seed（无 seed 则省略键走派生）。
 * 仅 presetSeedUpdate（有意改 seed）不走此通道。
 */
export function withTargetSeed(payload: RegionStyle, target: RegionStyle): RegionStyle {
  const seed = typeof target.seed === 'number' && Number.isFinite(target.seed) ? target.seed : undefined;
  if (seed === undefined) return { presetId: payload.presetId, overrides: payload.overrides };
  return { presetId: payload.presetId, overrides: payload.overrides, seed };
}

/**
 * 预设参数表单显示值：defaultParams 默认 < 对象 overrides 合成；数值受 min/max 钳制
 * （沿 StyleParameter 语义；Layer 无样式覆盖字段）。
 */
export function resolvePresetValues(
  parameters: readonly StyleParameter[],
  overrides: Record<string, unknown> | undefined,
): Record<string, string | number | boolean> {
  const values: Record<string, string | number | boolean> = {};
  for (const param of parameters) {
    const overridden = overrides?.[param.key];
    // 非基本类型覆写值（异常数据）回退参数默认值
    const raw: string | number | boolean =
      typeof overridden === 'string' || typeof overridden === 'number' || typeof overridden === 'boolean'
        ? overridden
        : param.default;
    if (param.type === 'number' && typeof raw === 'number') {
      let clamped = raw;
      if (typeof param.min === 'number') clamped = Math.max(param.min, clamped);
      if (typeof param.max === 'number') clamped = Math.min(param.max, clamped);
      values[param.key] = clamped;
    } else {
      values[param.key] = raw;
    }
  }
  return values;
}

// ── 四档作用域（region 版）──────────────────────────────────

/** 作用域展示字典（region 版：第四档标签「同预设」） */
export const REGION_STYLE_SCOPE_OPTIONS: ReadonlyArray<{ value: StyleApplyScope; label: string }> = [
  { value: 'object', label: '当前对象' },
  { value: 'type', label: '同类型对象' },
  { value: 'layer', label: '当前图层' },
  { value: 'style', label: '同预设' },
];

/**
 * 作用域 → 批量目标集（保持场景顺序；当前对象恒含且居首）。过滤映射（2026-09-11 审计
 * 定稿）：当前对象=仅自身 / 同类型=semantic.type 相同（仅 RegionObject）/ 当前图层=
 * layerId 相同（未分层退化为仅自身）/ 同预设=style.presetId 相同（仅 RegionObject）。
 */
export function resolveRegionStyleTargets(
  scope: StyleApplyScope,
  current: SceneObject,
  objects: readonly SceneObject[],
): string[] {
  const region = isRegionObject(current) ? current : null;
  let ids: string[];
  switch (scope) {
    case 'type':
      ids = region
        ? objects
            .filter((o) => isRegionObject(o) && o.semantic.type === region.semantic.type)
            .map((o) => o.id)
        : [];
      break;
    case 'layer':
      ids =
        current.layerId === null
          ? []
          : objects
              .filter((o) => o.layerId === current.layerId && isRegionObject(o))
              .map((o) => o.id);
      break;
    case 'style':
      ids = region
        ? objects
            .filter((o) => isRegionObject(o) && o.style.presetId === region.style.presetId)
            .map((o) => o.id)
        : [];
      break;
    case 'object':
    default:
      ids = [];
      break;
  }
  if (!ids.includes(current.id)) ids = [current.id, ...ids];
  return ids;
}
