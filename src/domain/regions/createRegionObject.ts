/**
 * domain/regions/createRegionObject —— RegionObject 工厂（阶段 6 T6.5）。
 *
 * 职责：按三层契约组装一个完整 RegionObject（分域契约 contracts/stage6-region.md §A）：
 *   - shape 由调用方（七形状绘制工具 / 导入 / 面板形状切换）给定，本工厂只深拷贝落库；
 *   - semantic 缺省 unclassified、properties 取语义定义的参数默认值（道路 width=6 等）；
 *   - style 缺省 = 语义定义的 defaultPresetId + 空 overrides（unclassified → default_solid）；
 *   - 命名缺省「未命名区域」（带序号版本由调用方计算：工具按场景现存 region 计数 +1）；
 *   - layerId 由调用方解析传入（绘制完成时按语义默认图层名查找，缺层落 null）。
 * 边界：纯数据工厂，零渲染；语义定义单一真相源 = semanticDefinitions（注册表同源装载）；
 *      id 走 createId('region_') 前缀体系（全局约束 7 增补）。
 */
import { createId } from '../../core/id';
import type { ID, Transform } from '../../core/types';
import { deepClone } from '../../core/utils';
import type { Vec2 } from '../../core/types';
import { getSemanticDefinition } from './semanticDefinitions';
import type { SemanticType } from './semanticDefinitions';
import type { RegionObject, RegionShape } from './RegionObject';

/** RegionObject 构造入参（shape 必给；其余缺省沿语义定义） */
export interface CreateRegionInit {
  /** 几何层（深拷贝落库，不与调用方共享引用） */
  shape: RegionShape;
  /** 语义类型（缺省 unclassified = 绘制完成初始态） */
  semanticType?: SemanticType;
  /** 对象名（缺省「未命名区域」；序号版本由调用方计算后传入） */
  name?: string;
  /** 归属图层（缺省 null = 未分层；赋类型自动归层语义归 ChangeSemanticCommand） */
  layerId?: ID | null;
}

/** 单位变换（每次调用全新对象） */
function identityTransform(): Transform {
  return {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };
}

/** 语义定义参数默认值 → properties 初始快照（深拷贝数值） */
function defaultPropertiesOf(semanticType: SemanticType): Record<string, unknown> {
  const def = getSemanticDefinition(semanticType);
  if (!def) return {};
  const properties: Record<string, unknown> = {};
  for (const param of def.properties) {
    properties[param.key] = deepClone(param.default);
  }
  return properties;
}

/**
 * 组装 RegionObject：semantic 缺省 unclassified；style 缺省 = 该语义 defaultPresetId；
 * 未知语义类型抛错（注册制守门，禁止静默降级到表外类型）。
 */
export function createRegionObject(init: CreateRegionInit): RegionObject {
  const semanticType = init.semanticType ?? 'unclassified';
  const def = getSemanticDefinition(semanticType);
  if (!def) {
    throw new Error(`未知语义类型: ${String(semanticType)}`);
  }
  const shape = deepClone(init.shape);
  return {
    id: createId('region'),
    type: 'region',
    name: init.name ?? '未命名区域',
    parentId: null,
    layerId: init.layerId ?? null,
    visible: true,
    locked: false,
    transform: identityTransform(),
    properties: {},
    shape,
    semantic: {
      type: semanticType,
      properties: defaultPropertiesOf(semanticType),
    },
    style: { presetId: def.defaultPresetId, overrides: {} },
  };
}

/** 业务 Vec2 数组深拷贝（调用方组装 points 时的便捷助手） */
export function clonePoints(points: readonly Vec2[]): Vec2[] {
  return points.map((p) => ({ x: p.x, y: p.y }));
}
