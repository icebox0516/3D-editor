/**
 * ui/tools/regionQuickApply —— 三步流第三步「赋类型与样式」快选（T6.5）。
 *
 * 职责：绘制完成后的未分类 RegionObject 选中时，Context Toolbar 浮出类型芯片 +
 *      样式缩略图快选条；本模块提供其纯数据模型与一次性应用入口——
 *   - quickApplyChips：八类芯片（water/grass/plaza/parking/bare_land/road/building/poi），
 *     语义注册表（SEMANTIC_DEFINITIONS）驱动，排除 unclassified（初始态）与 custom（更多）；
 *   - presetOptions：样式快选条 = EditorFacade.registries.presets.find(shape × semantic)
 *     过滤（**元数据唯一途径，禁止 import runtime**，分域契约 §0 规则 2）；
 *     无命中回退 default_solid 兜底；色样取 defaultParams 的 color 参数默认值；
 *   - applySemanticAndPreset：一次点击一步到位——ChangeSemanticCommand（类型切换含
 *     自动归层 + 新类型默认预设 + overrides 清空）与 ChangePresetCommand（点选预设）
 *     经 BatchCommand 合并为**一条历史**（2026-09-11 审计定稿）：undo 一次整体回退
 *     （类型/图层/样式一并恢复），redo 恢复；语义属性默认值（road.width=6 等）随
 *     ChangeSemanticCommand 的 properties 载荷写入。
 * 边界：ui 层零 runtime/io；命令组装只在 editor 层命令类；非 RegionObject 目标
 *      execute 返回 false（零历史、原样不动）。
 */
import type { ID } from '../../core/types';
import { getSemanticDefinition, isRegionObject } from '../../domain/regions';
import type { SemanticType, ShapeType } from '../../domain/regions';
import { SEMANTIC_DEFINITIONS } from '../../domain/regions';
import type { EditorFacade } from '../../editor/EditorFacade';
import type { SceneManager } from '../../scene/SceneManager';
import { BatchCommand } from '../../editor/commands/BatchCommand';
import { ChangePresetCommand } from '../../editor/commands/ChangePresetCommand';
import { ChangeSemanticCommand } from '../../editor/commands/ChangeSemanticCommand';

/** 类型芯片 */
export interface QuickApplyChip {
  type: SemanticType;
  label: string;
}

/** 样式快选条一项 */
export interface QuickPresetOption {
  id: string;
  name: string;
  /** 色样（defaultParams 的 color 参数默认值；无颜色参数缺省） */
  color?: string;
}

/** 语义注册表 → 八类芯片（排除 unclassified 与 custom；注册表顺序即展示顺序） */
export function quickApplyChips(): QuickApplyChip[] {
  return SEMANTIC_DEFINITIONS.filter((def) => def.type !== 'unclassified' && def.type !== 'custom').map(
    (def) => ({ type: def.type, label: def.label }),
  );
}

/** 预设元数据注册表的最小结构（EditorFacade.registries.presets 的结构子集，便于测试注入） */
interface PresetSource {
  find(shapeType: ShapeType, semanticType: SemanticType): { id: string; name: string; defaultParams: { key: string; default: string | number | boolean }[] }[];
  get(id: string): { id: string; name: string; defaultParams: { key: string; default: string | number | boolean }[] } | undefined;
}

/**
 * 样式快选条：shape × semantic 双维过滤；无命中回退 default_solid（兜底预设支持
 * 全形状全语义）；色样取 defaultParams 的 color 参数默认值。
 */
export function presetOptions(presets: PresetSource, shapeType: ShapeType, semanticType: SemanticType): QuickPresetOption[] {
  const toOption = (meta: { id: string; name: string; defaultParams: { key: string; default: string | number | boolean }[] }): QuickPresetOption => ({
    id: meta.id,
    name: meta.name,
    color: pickColor(meta.defaultParams),
  });
  const hits = presets.find(shapeType, semanticType).map(toOption);
  if (hits.length > 0) return hits;
  const fallback = presets.get('default_solid');
  return fallback ? [toOption(fallback)] : [];
}

/** 参数表 color 默认值（无颜色参数返回 undefined） */
function pickColor(params: { key: string; default: string | number | boolean }[]): string | undefined {
  const color = params.find((p) => p.key === 'color');
  return typeof color?.default === 'string' ? color.default : undefined;
}

/** 语义定义参数默认值 → properties 载荷（ChangeSemanticCommand 整体替换语义层） */
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
 * 一步到位应用（类型 + 样式一条历史）：BatchCommand[ChangeSemanticCommand（自动归层 +
 * 默认预设语义）、ChangePresetCommand（点选预设）]。返回是否成功（目标非 RegionObject
 * 或命令失败 → false，场景与历史零变化）。
 */
export function applySemanticAndPreset(
  facade: EditorFacade,
  objectId: ID,
  semanticType: SemanticType,
  presetId: string,
): boolean {
  return applySemanticAndPresetCore(facade.history, facade.scene, objectId, semanticType, presetId);
}

/** 应用入口的解耦核（测试可注入轻量 history/scene；组件层走门面版） */
export function applySemanticAndPresetCore(
  history: { execute(cmd: unknown): boolean },
  scene: SceneManager,
  objectId: ID,
  semanticType: SemanticType,
  presetId: string,
): boolean {
  const target = scene.getObject(objectId);
  if (!target || !isRegionObject(target)) return false; // 过渡期按对象 type 派发（§D）
  const batch = new BatchCommand([
    new ChangeSemanticCommand(objectId, {
      type: semanticType,
      properties: defaultPropertiesOf(semanticType),
    }),
    new ChangePresetCommand(objectId, { presetId, overrides: {} }),
  ]);
  return history.execute(batch);
}
