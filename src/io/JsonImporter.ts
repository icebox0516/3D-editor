/**
 * io/JsonImporter —— 配置化 JSON 导入器（映射驱动，T6.9 v2 重设计）。
 *
 * 职责：按 ImportMapping 把外部 JSON 转为 RegionObject（与手绘对象完全同构——导入后
 *      可正常编辑、改样式、改参数），并给出字段级错误定位。零注册表依赖（构造无参，
 *      语义/预设默认值直接读 domain/regions/semanticDefinitions 单一真相源）。
 *
 * 映射语义（任务书裁决 B 逐字实现，测试锁定）：
 * - version：必须恰为 '2.0'（v1 映射形态拒绝）；
 * - semanticType：十类语义之一（取代 v1 elementType），决定默认预设/图层/参数/baseHeight；
 * - rootArray：点分 JSON Path 定位对象数组（支持数组下标段，如 "data.buildings.0"）；
 * - geometry.format：
 *     · 'xy-array'  [[x,y],…]          → 顶点表（Vec2 = {x, y}，y 即世界 z）
 *     · 'xyz-array' [[x,y,z],…]        → 顶点表（取 x 与 z，中间高度分量丢弃）
 *     · 'ring-array' [[[x,y],…],…]     → 环数组（rings[0] 为外环）
 * - geometry.shape：可选显式覆写（polygon / line / point）。无覆写时推断：
 *     ring-array → polygon；xy/xyz-array 单点 → point、≥2 点 → line。
 *     覆写 polygon + xy/xyz 数据 = 点列视为环（走环校验 + 自动补闭合）；
 *     line 需 ≥2 点（单点报错）；point 需恰 1 点（多点报错）；
 * - ring-array 多环：取 rings[0] 为外环 points，内环全部丢弃并为每条内环记一条告警；
 * - fields：目标属性 ← 源字段路径；支持 "floors*3" 表达式（源值 × 数值乘数，含小数）。
 *     目标键 "name" 特殊处理为对象名，其余写入 semantic.properties（值最终覆盖
 *     语义默认值与 defaults）。映射源字段视为必填：任一字段缺失/类型不符 →
 *     该对象整体非法（错误进 errors，不入 objects）；
 * - defaults：presetId（缺省 = 语义 defaultPresetId）、layerName（缺省 = 语义
 *     defaultLayerName，写入 metadata.layerName 供 bootstrap 按名归层）、其余键作为
 *     semantic.properties 默认值（字段映射值优先）。
 *
 * RegionObject 产出规则：closed = polygon ? true : false；baseHeight = 语义
 * defaultBaseHeight；options 不写（导入形状为显式点列，无参数化缓存）；
 * id 经 createRegionObject 工厂（region_ 前缀、默认 transform、三层结构齐备）。
 *
 * 几何校验宽限（裁决 C，沿用 v1）：polygon 目标形状过 validateGeometry（环深拷贝上
 * 执行，修复后的坐标写入最终 shape.points）——NOT_CLOSED 补闭合点与顺时针反转就地
 * 修复 → 收录对象 + errors 附「已修复」说明；SELF_INTERSECT / TOO_FEW_VERTICES /
 * INVALID_COORD 不可修复 → 对象排除 + 错误。line/point 直通（天然合法）。
 *
 * 边界：映射配置错误与 raw 非对象直接抛错（调用方问题）；数据级问题一律进 errors
 *      不抛错；零渲染；不执行入场景（由调用方经 Command 完成）。
 */
import type { Vec2 } from '../core/types';
import { deepClone } from '../core/utils';
import { createRegionObject } from '../domain/regions';
import type { RegionObject } from '../domain/regions';
import { getSemanticDefinition } from '../domain/regions';
import type { SemanticType } from '../domain/regions';
import { validateGeometry } from '../domain/validate/validateGeometry';
import type { ValidationError } from '../domain/validate/validateGeometry';

/** JSON 导入映射配置（v2，任务书裁决 B 形态） */
export interface ImportMapping {
  /** 映射版本（必须恰为 '2.0'） */
  version: '2.0';
  /** 对象数组的 JSON Path，如 "data.buildings" */
  rootArray: string;
  /** 语义类型（十类，取代 v1 elementType） */
  semanticType: SemanticType;
  geometry: {
    /** 几何数据源字段路径 */
    path: string;
    format: 'xy-array' | 'xyz-array' | 'ring-array';
    /** 显式形状覆写（xy/xyz 足迹场景）；缺省按 format 与点数推断 */
    shape?: 'polygon' | 'line' | 'point';
  };
  /** 属性映射：目标属性 ← 源字段路径（支持 "floors*3" 表达式）；目标键 "name" → 对象名 */
  fields: Record<string, string>;
  defaults: {
    /** 缺省 = 语义 defaultPresetId */
    presetId?: string;
    /** 缺省 = 语义 defaultLayerName（写入 metadata.layerName） */
    layerName?: string;
    /** 其余键 → semantic.properties 默认值（字段映射值优先） */
    [k: string]: unknown;
  };
}

/** 导入错误：path 为字段级定位（如 "data.buildings[2].footprint[1]"） */
export interface ImportError {
  path: string;
  message: string;
}

/** parse 结果：合法对象与字段级错误（宽限修复的对象在 objects，附说明性 error） */
export interface ImportResult {
  objects: RegionObject[];
  errors: ImportError[];
}

/** 目标形状三态（shape 覆写 / 推断结果） */
type TargetShape = 'polygon' | 'line' | 'point';

/** 可自动修复（宽限收录）的校验错误码；顺时针反转不报错，无需列入 */
const AUTO_FIXABLE_CODES = new Set<ValidationError['code']>(['NOT_CLOSED']);

const GEOMETRY_FORMATS = ['xy-array', 'xyz-array', 'ring-array'] as const;
const SHAPE_OVERRIDES = ['polygon', 'line', 'point'] as const;

/** 字段表达式：源字段路径 × 数值乘数（如 "floors*3"、"attrs.floors * 2.5"） */
const FIELD_EXPR_RE = /^([A-Za-z_][\w]*(?:\.[\w]+)*)\s*\*\s*(\d+(?:\.\d+)?)$/;

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** 沿点分路径取值（支持数组下标段）；任一段缺失/类型不通返回 undefined */
function resolvePath(source: unknown, path: string): unknown {
  let current: unknown = source;
  for (const segment of path.split('.')) {
    if (Array.isArray(current)) {
      const index = Number(segment);
      if (!Number.isInteger(index) || index < 0) return undefined;
      current = current[index];
    } else if (isPlainRecord(current)) {
      current = current[segment];
    } else {
      return undefined;
    }
  }
  return current;
}

/** 映射配置结构守卫（配置错误直接抛错，与数据错误分流） */
function assertValidMapping(mapping: ImportMapping): void {
  if (!isPlainRecord(mapping)) {
    throw new Error('JsonImporter.parse: 映射配置必须是 JSON 对象');
  }
  if (mapping.version !== '2.0') {
    throw new Error(`JsonImporter.parse: 映射 version 必须为 "2.0"（实际："${String(mapping.version)}"）`);
  }
  if (typeof mapping.rootArray !== 'string' || mapping.rootArray === '') {
    throw new Error('JsonImporter.parse: 映射缺少合法 rootArray（对象数组的 JSON Path）');
  }
  if (typeof mapping.semanticType !== 'string' || !getSemanticDefinition(mapping.semanticType)) {
    throw new Error(
      `JsonImporter.parse: 映射 semanticType 非法："${String(mapping.semanticType)}"（合法十类：unclassified/water/grass/plaza/parking/bare_land/road/building/poi/custom）`,
    );
  }
  const geometry = mapping.geometry;
  if (
    !isPlainRecord(geometry) ||
    typeof geometry.path !== 'string' ||
    geometry.path === '' ||
    !GEOMETRY_FORMATS.includes(geometry.format as (typeof GEOMETRY_FORMATS)[number])
  ) {
    throw new Error(
      `JsonImporter.parse: 映射 geometry 非法（path 非空字符串，format 取值：${GEOMETRY_FORMATS.join('/')}）`,
    );
  }
  if (
    geometry.shape !== undefined &&
    !(SHAPE_OVERRIDES as readonly string[]).includes(geometry.shape)
  ) {
    throw new Error(
      `JsonImporter.parse: 映射 geometry.shape 覆写非法："${String(geometry.shape)}"（合法值：${SHAPE_OVERRIDES.join('/')}）`,
    );
  }
  if (mapping.fields !== undefined && !isPlainRecord(mapping.fields)) {
    throw new Error('JsonImporter.parse: 映射 fields 必须是对象（目标属性 → 源字段路径）');
  }
  for (const [target, spec] of Object.entries(mapping.fields ?? {})) {
    if (typeof spec !== 'string' || spec === '') {
      throw new Error(`JsonImporter.parse: 字段映射 "${target}" 的源路径必须是非空字符串`);
    }
  }
  if (mapping.defaults !== undefined && !isPlainRecord(mapping.defaults)) {
    throw new Error('JsonImporter.parse: 映射 defaults 必须是对象');
  }
}

/**
 * 解析单条顶点列表：[[x,y],…]（arity=2）或 [[x,y,z],…]（arity=3，取 x 与 z）。
 * 失败记录字段级错误（定位到具体坐标点）并返回 undefined。
 */
function parsePointList(
  raw: unknown,
  path: string,
  arity: 2 | 3,
  errors: ImportError[],
): Vec2[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) {
    errors.push({
      path,
      message: arity === 3 ? '坐标数组必须是非空的 [x,y,z] 数组' : '坐标数组必须是非空的 [x,y] 数组',
    });
    return undefined;
  }
  const points: Vec2[] = [];
  for (let i = 0; i < raw.length; i++) {
    const pointPath = `${path}[${i}]`;
    const point = raw[i];
    if (!Array.isArray(point) || point.length < arity) {
      errors.push({ path: pointPath, message: `坐标点必须是长度 ≥ ${arity} 的数值数组` });
      return undefined;
    }
    const coords: number[] = [];
    for (let d = 0; d < arity; d++) {
      const c = point[d];
      if (typeof c !== 'number' || !Number.isFinite(c)) {
        errors.push({ path: pointPath, message: `坐标分量 ${d} 非法（必须为有限数值）` });
        return undefined;
      }
      coords.push(c);
    }
    points.push(arity === 3 ? { x: coords[0]!, y: coords[2]! } : { x: coords[0]!, y: coords[1]! });
  }
  return points;
}

/** 解析单个字段映射（支持 path / path*multiplier）；失败记录字段级错误并返回 undefined */
function resolveField(
  item: Record<string, unknown>,
  spec: string,
  base: string,
  errors: ImportError[],
): unknown {
  const expr = FIELD_EXPR_RE.exec(spec);
  if (expr) {
    const sourcePath = expr[1]!;
    const multiplier = Number(expr[2]);
    const value = resolvePath(item, sourcePath);
    const path = `${base}.${sourcePath}`;
    if (value === undefined || value === null) {
      errors.push({ path, message: `字段缺失：映射源 "${spec}" 不存在` });
      return undefined;
    }
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      errors.push({
        path,
        message: `表达式字段源值必须是有限数值（"${spec}" 的源类型为 ${typeof value}）`,
      });
      return undefined;
    }
    return value * multiplier;
  }

  const value = resolvePath(item, spec);
  if (value === undefined || value === null) {
    errors.push({ path: `${base}.${spec}`, message: `字段缺失：映射源 "${spec}" 不存在` });
    return undefined;
  }
  if (typeof value === 'object') {
    errors.push({
      path: `${base}.${spec}`,
      message: '字段值必须是 JSON 原始值（string/number/boolean）',
    });
    return undefined;
  }
  return value;
}

/**
 * 解析全部字段映射：返回 { name?, values }；任一字段失败则收集该字段错误并返回
 * undefined（映射源字段必填 → 对象整体非法）。目标键 "name" 转为对象名。
 */
function resolveFields(
  item: Record<string, unknown>,
  fields: Record<string, string>,
  base: string,
  errors: ImportError[],
): { name: string | undefined; values: Record<string, unknown> } | undefined {
  let ok = true;
  let name: string | undefined;
  const values: Record<string, unknown> = {};
  for (const [target, spec] of Object.entries(fields)) {
    const value = resolveField(item, spec, base, errors);
    if (value === undefined) {
      ok = false;
      continue;
    }
    if (target === 'name') {
      name = String(value);
    } else {
      values[target] = value;
    }
  }
  return ok ? { name, values } : undefined;
}

export class JsonImporter {
  /** 零注册表依赖：语义/预设默认值直读 domain 单一真相源 */
  constructor() {}

  /**
   * 按映射把外部 JSON 解析为 RegionObject 集合。
   * 抛错：映射配置非法 / raw 非对象；数据级错误一律进 errors。
   */
  parse(raw: unknown, mapping: ImportMapping): ImportResult {
    assertValidMapping(mapping);
    if (!isPlainRecord(raw)) {
      throw new Error('JsonImporter.parse: 导入数据必须是 JSON 对象');
    }

    const objects: RegionObject[] = [];
    const errors: ImportError[] = [];

    const root = resolvePath(raw, mapping.rootArray);
    if (root === undefined || root === null) {
      errors.push({
        path: mapping.rootArray,
        message: `根数组不存在（映射 rootArray="${mapping.rootArray}"）`,
      });
      return { objects, errors };
    }
    if (!Array.isArray(root)) {
      errors.push({
        path: mapping.rootArray,
        message: `根数组必须是数组（映射 rootArray="${mapping.rootArray}"）`,
      });
      return { objects, errors };
    }

    root.forEach((item, index) => {
      this.importItem(item, index, mapping, objects, errors);
    });
    return { objects, errors };
  }

  /** 导入单条数据项：解析几何与字段 → 工厂创建 → defaults/fields 覆盖 → 校验管线过滤 */
  private importItem(
    item: unknown,
    index: number,
    mapping: ImportMapping,
    objects: RegionObject[],
    errors: ImportError[],
  ): void {
    const base = `${mapping.rootArray}[${index}]`;
    if (!isPlainRecord(item)) {
      errors.push({ path: base, message: '数据项必须是 JSON 对象' });
      return;
    }

    const shape = this.parseShape(item, mapping, base, errors);
    if (!shape) return;

    const fields = resolveFields(item, mapping.fields ?? {}, base, errors);
    if (!fields) return;

    const def = getSemanticDefinition(mapping.semanticType)!; // 映射守卫已校验合法
    const defaults = mapping.defaults ?? {};

    // 经工厂创建：与手绘对象同一构造路径（region_ 前缀 ID、三层结构、默认 transform）
    const region = createRegionObject({
      shape,
      semanticType: mapping.semanticType,
      ...(fields.name !== undefined ? { name: fields.name } : {}),
    });

    // semantic.properties 合成：语义默认值（工厂已写）← defaults 非特殊键 ← 字段映射值
    for (const [key, value] of Object.entries(defaults)) {
      if (key === 'presetId' || key === 'layerName') continue;
      if (!(key in fields.values)) region.semantic.properties[key] = deepClone(value);
    }
    for (const [key, value] of Object.entries(fields.values)) {
      region.semantic.properties[key] = value;
    }

    // 样式层：defaults.presetId 优先，缺省回退语义默认预设
    if (typeof defaults.presetId === 'string' && defaults.presetId !== '') {
      region.style = { presetId: defaults.presetId, overrides: {} };
    }
    // 归层线索：defaults.layerName 优先，缺省回退语义默认图层（bootstrap 按名解析）
    const layerName =
      typeof defaults.layerName === 'string' && defaults.layerName !== ''
        ? defaults.layerName
        : def.defaultLayerName;
    region.metadata = { ...region.metadata, layerName };

    objects.push(region);
  }

  /**
   * 解析数据项几何 → RegionShape（类型推断/覆写 + 宽限校验，修复坐标写入 points）；
   * 失败（数据错误或不可修复校验错误）记录错误并返回 undefined。
   */
  private parseShape(
    item: Record<string, unknown>,
    mapping: ImportMapping,
    base: string,
    errors: ImportError[],
  ): RegionObject['shape'] | undefined {
    const spec = mapping.geometry;
    const path = `${base}.${spec.path}`;
    const raw = resolvePath(item, spec.path);
    if (raw === undefined || raw === null) {
      errors.push({ path, message: `缺少几何数据（映射 geometry.path="${spec.path}"）` });
      return undefined;
    }

    const def = getSemanticDefinition(mapping.semanticType)!;
    let points: Vec2[] | undefined;
    let target: TargetShape;

    if (spec.format === 'ring-array') {
      if (!Array.isArray(raw) || raw.length === 0) {
        errors.push({ path, message: 'ring-array 几何必须是非空环数组' });
        return undefined;
      }
      const rings: Vec2[][] = [];
      for (let r = 0; r < raw.length; r++) {
        const ring = parsePointList(raw[r], `${path}[${r}]`, 2, errors);
        if (!ring) return undefined;
        rings.push(ring);
      }
      // v2 区域单环：rings[0] 为外环 points，内环全部丢弃并逐条记告警
      points = rings[0]!;
      for (let r = 1; r < rings.length; r++) {
        errors.push({ path: `${path}[${r}]`, message: `内环丢弃（v2 区域单环，仅保留外环 rings[0]）` });
      }
      target = spec.shape ?? 'polygon';
    } else {
      const arity: 2 | 3 = spec.format === 'xyz-array' ? 3 : 2;
      const parsed = parsePointList(raw, path, arity, errors);
      if (!parsed) return undefined;
      points = parsed;
      target = spec.shape ?? (points.length === 1 ? 'point' : 'line');
    }

    // 覆写与数据不符：line 需 ≥2 点；point 需恰 1 点
    if (target === 'line' && points.length < 2) {
      errors.push({ path, message: `line 形状需要至少 2 个点（实际 ${points.length} 个）` });
      return undefined;
    }
    if (target === 'point' && points.length !== 1) {
      errors.push({ path, message: `point 形状需要恰 1 个点（实际 ${points.length} 个）` });
      return undefined;
    }

    // polygon 走环校验宽限管线（深拷贝上执行，修复后的坐标写入最终 points）
    if (target === 'polygon') {
      const geometry = { type: 'Polygon' as const, coordinates: [deepClone(points)] };
      const result = validateGeometry(geometry);
      for (const err of result.errors) {
        errors.push({ path, message: err.message });
      }
      if (result.errors.some((e) => !AUTO_FIXABLE_CODES.has(e.code))) return undefined;
      points = geometry.coordinates[0]!;
    }

    return {
      type: target,
      points,
      baseHeight: def.defaultBaseHeight,
      closed: target === 'polygon',
    };
  }
}
