/**
 * ui/panels/multiEditModel —— Inspector 多选批量编辑模型纯函数（T7.5）。
 *
 * 职责：选中对象列表 → 公共可编辑字段描述符集（每字段值为收敛值或 MIXED——
 *      差异检测：全同 → 收敛值，有异 → MIXED）；同语义 region 收敛判定
 *      （全部为 region 且 semantic.type 相同时追加 region 批量组）；
 *      异类型全 region 选中集按 semantic.type 分节（T8.3 multiRegionSectionsOf：
 *      每节 T7.5 同构字段，批量命令作用域 = 节内对象集）；
 *      批量命令规划（图层/语义参数/基准高度/预设/预设覆写 → N 条子命令经
 *      BatchCommand 合一条历史，N=1 直接单命令；语义参数与预设覆写逐键提交——
 *      载荷按各对象自身 properties/overrides 合成，只写该键不触碰其余键）。
 * 边界：纯数据/纯逻辑，零渲染零 React；ui 层只依赖 core/scene/domain/editor
 *      （分层 DAG）；显隐/锁定批量沿用 outlinerModel.buildGroupToggleCommand
 *      （组级开关同一语义，不重复实现）；一切可见修改经 Command。
 */
import type { ID } from '../../core/types';
import type { SceneObject } from '../../scene/SceneObject';
import { getSemanticDefinition, isRegionObject } from '../../domain/regions';
import type { RegionObject, RegionStyle, SemanticType } from '../../domain/regions';
import type { StyleParameter } from '../../domain/styles';
import type { Command } from '../../editor/commands';
import { BatchCommand } from '../../editor/commands/BatchCommand';
import { ChangeLayerCommand } from '../../editor/commands/ChangeLayerCommand';
import { ChangePresetCommand } from '../../editor/commands/ChangePresetCommand';
import { ChangeSemanticCommand } from '../../editor/commands/ChangeSemanticCommand';
import { ChangeShapeCommand } from '../../editor/commands/ChangeShapeCommand';
import { semanticTypeChange } from './regionInspectorModel';
import { resolvePresetValues } from './regionInspectorModel';

// ── 差异检测 ────────────────────────────────────────────────

/** 混合值标记：选中集在该字段上存在不同值（不覆盖、显示占位「Mixed」） */
export const MIXED: unique symbol = Symbol('multi-edit-mixed');

/** 收敛结果兜底：空输入（undefined）按 MIXED 处理（null 是合法收敛值，不兜底） */
function orMixed<T>(value: Converged<T> | undefined): Converged<T> {
  return value === undefined ? MIXED : value;
}

/** 字段收敛值：全同 → T；有异 → MIXED */
export type Converged<T> = T | typeof MIXED;

/**
 * 值列表 → 收敛值：全同（SameValueZero 语义，=== 对基本类型）返回该值；
 * 有异返回 MIXED；空输入返回 undefined（调用方保证非空，防御语义）。
 */
export function convergeValues<T>(values: readonly T[]): Converged<T> | undefined {
  if (values.length === 0) return undefined;
  const first = values[0];
  for (const v of values) {
    if (v !== first) return MIXED;
  }
  return first;
}

// ── 字段描述符 ──────────────────────────────────────────────

/** 语义/预设参数字段（携带声明元数据 + 收敛值；渲染按 type 分派控件） */
export interface MultiParamField {
  key: string;
  label: string;
  type: StyleParameter['type'];
  value: Converged<string | number | boolean>;
  min?: number;
  max?: number;
  step?: number;
  options?: StyleParameter['options'];
}

/** 同语义 region 批量组字段（全部为 region 且 semantic.type 相同时存在） */
export interface MultiRegionFields {
  semanticType: SemanticType;
  /** 语义参数逐键收敛（按语义定义 properties 声明序；有效值语义：缺失/非法键回退默认值） */
  semanticParams: MultiParamField[];
  /** 基准高度（shape.baseHeight；与变换组位置 Y 两层叠加生效，分域契约 §A） */
  baseHeight: Converged<number>;
  presetId: Converged<string>;
}

/** 多选公共可编辑字段集 */
export interface MultiEditFields {
  count: number;
  /** 图层归属（null = 未分层；有异 MIXED） */
  layerId: Converged<ID | null>;
  visible: Converged<boolean>;
  locked: Converged<boolean>;
  /** region 批量组（同语义收敛判定：全部 region 且 semantic.type 相同；否则 null 只显示通用组） */
  region: MultiRegionFields | null;
}

/** 语义参数有效值：properties 键值类型匹配声明时取原值，缺失/类型不符回退默认 */
function effectiveSemanticValue(
  param: StyleParameter,
  properties: Record<string, unknown>,
): string | number | boolean {
  const raw = properties[param.key];
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
    if (typeof raw === param.type) return raw;
  }
  return param.default;
}

/** StyleParameter 声明 → 字段元数据（不含值） */
function paramMetaOf(param: StyleParameter): Omit<MultiParamField, 'value'> {
  return {
    key: param.key,
    label: param.label,
    type: param.type,
    min: param.min,
    max: param.max,
    step: param.step,
    options: param.options,
  };
}

/**
 * 对象列表 → 多选公共字段集。region 组收敛判定：全部为 region 且 semantic.type
 * 相同（有效语义定义存在）；语义参数逐键收敛（缺失键按定义默认值参与收敛）。
 * T8.3：异类型全 region 选中集的分节形态见 multiRegionSectionsOf——本函数的
 * region 字段维持 T7.5 单类型语义（等价于分节数组的唯一节）。
 */
export function multiEditFieldsOf(objects: readonly SceneObject[]): MultiEditFields {
  const sections = multiRegionSectionsOf(objects);
  const region: MultiRegionFields | null =
    sections.length === 1 && getSemanticDefinition(sections[0]!.semanticType) !== undefined
      ? sections[0]!.fields
      : null;

  return {
    count: objects.length,
    layerId: orMixed(convergeValues(objects.map((o) => o.layerId))),
    visible: orMixed(convergeValues(objects.map((o) => o.visible))),
    locked: orMixed(convergeValues(objects.map((o) => o.locked))),
    region,
  };
}

/**
 * 异类型多选分节（T8.3）：全部为 region 的选中集按 semantic.type 分节——
 * 每节 = 类型 + 显示名（语义定义 label）+ 节内对象集 + T7.5 同构收敛字段；
 * 节序 = 类型在选中集中的首次出现序。混入非 region（model）对象时语义节
 * 整体不产出（通用组仍对全量选中生效，沿 T7.5 现状语义）；纯同类型多选
 * 退化为单节（与 T7.5 单 region 组行为等价，只多节头）。
 */
export interface MultiRegionSection {
  semanticType: SemanticType;
  /** 节头显示名（语义定义 label；未注册回退原始类型串） */
  label: string;
  /** 节内对象集（选中序子集）——一切批量命令的作用域 */
  regions: RegionObject[];
  /** 节内收敛字段（T7.5 MultiRegionFields 同构；semanticType 与节一致） */
  fields: MultiRegionFields;
}

/** 对象列表 → 按语义类型分节的 region 组清单（全 region 选中集专用） */
export function multiRegionSectionsOf(objects: readonly SceneObject[]): MultiRegionSection[] {
  const regions = objects.filter(isRegionObject);
  if (regions.length === 0 || regions.length !== objects.length) return [];

  const order: SemanticType[] = [];
  const groups = new Map<SemanticType, RegionObject[]>();
  for (const region of regions) {
    const type = region.semantic.type;
    const bucket = groups.get(type);
    if (bucket) bucket.push(region);
    else {
      order.push(type);
      groups.set(type, [region]);
    }
  }

  return order.map((type) => {
    const sectionRegions = groups.get(type)!;
    return {
      semanticType: type,
      label: getSemanticDefinition(type)?.label ?? type,
      regions: sectionRegions,
      fields: regionFieldsOf(sectionRegions),
    };
  });
}

/** 同语义 region 集 → T7.5 region 组收敛字段（multiEditFieldsOf / 分节共用） */
function regionFieldsOf(regions: readonly RegionObject[]): MultiRegionFields {
  return {
    semanticType: regions[0]!.semantic.type,
    semanticParams: semanticParamFields(regions),
    baseHeight: orMixed(convergeValues(regions.map((r) => r.shape.baseHeight))),
    presetId: orMixed(convergeValues(regions.map((r) => r.style.presetId))),
  };
}

/** 同语义 region 集 → 语义参数逐键收敛字段（声明序） */
function semanticParamFields(regions: readonly RegionObject[]): MultiParamField[] {
  const def = getSemanticDefinition(regions[0]!.semantic.type);
  if (!def) return [];
  return def.properties.map((param) => ({
    ...paramMetaOf(param),
    value: orMixed(
      convergeValues(regions.map((r) => effectiveSemanticValue(param, r.semantic.properties))),
    ),
  }));
}

/**
 * 预设参数逐键收敛（面板在 presetId 收敛时据当前预设 defaultParams 调用）：
 * 各对象显示值按 resolvePresetValues 语义合成（默认 < overrides + 数值钳制）后收敛；
 * presetId 有异返回 null（预设参数跨预设无公共语义，面板不显示该表单）。
 */
export function convergePresetParams(
  regions: readonly RegionObject[],
  parameters: readonly StyleParameter[],
): MultiParamField[] | null {
  if (regions.length === 0) return null;
  const presetId = convergeValues(regions.map((r) => r.style.presetId));
  if (presetId === MIXED) return null;
  return parameters.map((param) => ({
    ...paramMetaOf(param),
    value: orMixed(
      convergeValues(
        regions.map((r) => resolvePresetValues([param], r.style.overrides)[param.key]),
      ),
    ),
  }));
}

// ── 批量命令规划（N 条子命令合一条历史；N=1 直接单命令）────────

/** 命令列表包装：空 → null（不产生空历史）；单条 → 直接返回；多条 → BatchCommand */
function wrapCommands(commands: Command[]): Command | null {
  if (commands.length === 0) return null;
  return commands.length === 1 ? commands[0]! : new BatchCommand(commands);
}

/** 图层归属批量：ChangeLayerCommand × N（同一目标图层应用到全部对象） */
export function batchLayerCommand(
  objects: readonly SceneObject[],
  layerId: ID | null,
): Command | null {
  return wrapCommands(objects.map((o) => new ChangeLayerCommand(o.id, layerId)));
}

/**
 * 语义类型切换批量：同一 semantic 载荷（新类型默认参数）应用到全部——
 * 自动归层 / 默认预设 / overrides 清空由 ChangeSemanticCommand ① 路径完成。
 */
export function batchSemanticTypeCommand(
  regions: readonly RegionObject[],
  nextType: SemanticType,
): Command | null {
  const payload = semanticTypeChange(nextType);
  return wrapCommands(regions.map((r) => new ChangeSemanticCommand(r.id, payload)));
}

/**
 * 语义参数逐键批量：只写该键到全部对象——各对象载荷 = 自身 properties 合并该键
 * （其余键各自保留），ChangeSemanticCommand ② 路径（类型/归层/样式不动）。
 */
export function batchSemanticPropertyCommand(
  regions: readonly RegionObject[],
  key: string,
  value: string | number | boolean,
): Command | null {
  return wrapCommands(
    regions.map(
      (r) =>
        new ChangeSemanticCommand(r.id, {
          type: r.semantic.type,
          properties: { ...r.semantic.properties, [key]: value },
        }),
    ),
  );
}

/** 基准高度批量：ChangeShapeCommand × N——只替换 baseHeight，各自点列/类型原样保留 */
export function batchBaseHeightCommand(
  regions: readonly RegionObject[],
  baseHeight: number,
): Command | null {
  return wrapCommands(
    regions.map((r) => new ChangeShapeCommand(r.id, { ...r.shape, baseHeight })),
  );
}

/**
 * 预设批量：同一预设应用到全部（presetId + overrides 整体替换）；载荷未带 seed 时
 * 各对象继承自身 seed（D18：批量换预设不洗掉散布种子——undo 换回散布逐位复原）。
 */
export function batchPresetCommand(
  regions: readonly RegionObject[],
  style: RegionStyle,
): Command | null {
  return wrapCommands(
    regions.map((r) => {
      const seed = style.seed ?? (typeof r.style.seed === 'number' && Number.isFinite(r.style.seed) ? r.style.seed : undefined);
      return new ChangePresetCommand(
        r.id,
        typeof seed === 'number' ? { ...style, seed } : { presetId: style.presetId, overrides: style.overrides },
      );
    }),
  );
}

/**
 * 预设参数逐键批量：presetId 各自不变（update 路径）——各对象载荷 = 自身
 * overrides 合并该键，其余覆写键与 seed 各自保留。
 */
export function batchPresetOverrideCommand(
  regions: readonly RegionObject[],
  key: string,
  value: unknown,
): Command | null {
  return wrapCommands(
    regions.map((r) => {
      const next: RegionStyle = {
        presetId: r.style.presetId,
        overrides: { ...r.style.overrides, [key]: value },
      };
      if (typeof r.style.seed === 'number' && Number.isFinite(r.style.seed)) next.seed = r.style.seed;
      return new ChangePresetCommand(r.id, next);
    }),
  );
}
