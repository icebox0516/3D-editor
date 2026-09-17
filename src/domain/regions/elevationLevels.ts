/**
 * domain/regions/elevationLevels —— 高度层候选纯函数（T8.1 R2/R5）。
 *
 * 职责：从 SceneData（SceneObject 结构）派生「高度吸附候选层」——地面 y=0 + 场景内
 *      其他对象的底面/顶面层。region 底面 = shape.baseHeight + transform.position.y
 *      （分域契约 §A 高度合成）；顶面 = 底面 + 派生高（按语义注册表声明的 height 参数
 *      ——如 building，缺省回退语义定义默认值）；model 底面 = position.y（不做 GLB
 *      包围盒测量——任务书明确不做，无派生高）。同义函数同时服务两路消费：
 *      runtime gizmo translate Y 拖拽吸附（Renderer 经闭包注入 GizmoImpl）与
 *      editor 贴地命令（EditorActionsCore）——domain 层为两者公共下层（DAG）。
 * 边界：纯函数，零 THREE、零 DOM、不修改入参；候选仅经 SceneData/语义注册表派生。
 * T9.2 增补：collectElevationSnapLevels 在裸候选之上按拖拽目标类型施加模型贴地
 * 抬升（MODEL_BASE_HEIGHT，单一数值源在 domain/assets/ModelObject）——gizmo 吸附
 * 候选含 lift；贴地命令侧由 EditorActionsCore 逐对象施加（混合选中语义不同形）。
 */
import { isRegionObject } from './RegionObject';
import { getSemanticDefinition } from './semanticDefinitions';
import { isModelObject, MODEL_BASE_HEIGHT } from '../assets';
import type { SceneObject } from '../../scene/SceneObject';
import type { ID } from '../../core/types';

/**
 * 对象底面高度层（世界 y）：
 * region = shape.baseHeight + transform.position.y；model = transform.position.y。
 */
export function baseLevelOf(obj: SceneObject): number {
  if (isRegionObject(obj)) {
    return obj.shape.baseHeight + obj.transform.position.y;
  }
  return obj.transform.position.y;
}

/**
 * 对象派生高（顶面相对底面的抬升，米）：
 * region 按语义注册表声明的 height 参数（显式值优先，缺省回退语义定义 default；
 * 未声明该参数的语义恒 0）；model 恒 0（不做包围盒测量）。
 * 注册制取参（读取 SemanticDefinition.properties），禁止散落 type 判断。
 */
export function derivedHeightOf(obj: SceneObject): number {
  if (!isRegionObject(obj)) return 0;
  const def = getSemanticDefinition(obj.semantic.type);
  const param = def?.properties.find((p) => p.key === 'height');
  if (!param) return 0;
  const raw = obj.semantic.properties.height;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const fallback = param.default;
  return typeof fallback === 'number' && Number.isFinite(fallback) ? fallback : 0;
}

/**
 * 候选高度层收集：地面 0 恒在 + 各对象底/顶面层（排除集先行过滤；同值去重；
 * 非有限值忽略）。返回顺序 = 地面 + 对象序（去重保首个出现位）。
 */
export function collectElevationLevels(
  objects: readonly SceneObject[],
  excludeIds: readonly ID[],
): number[] {
  const exclude = new Set(excludeIds);
  const seen = new Set<number>();
  const levels: number[] = [];
  const push = (value: number): void => {
    if (!Number.isFinite(value)) return;
    if (seen.has(value)) return;
    seen.add(value);
    levels.push(value);
  };
  push(0); // 地面恒在
  for (const obj of objects) {
    if (exclude.has(obj.id)) continue;
    const bottom = baseLevelOf(obj);
    push(bottom);
    const height = derivedHeightOf(obj);
    if (height > 0) push(bottom + height);
  }
  return levels;
}

/**
 * 贴地目标层：候选中 ≤ 当前值的最大者（对象悬空时落到下方最近层）；
 * 低于全部候选（含地面）→ 0 兜底（抬回地面）。
 */
export function nearestLevelBelow(currentY: number, levels: readonly number[]): number {
  let best = 0;
  for (const level of levels) {
    if (!Number.isFinite(level)) continue;
    if (level <= currentY && level > best) best = level;
  }
  return best;
}

/**
 * gizmo 高度吸附候选（T9.2 增补）：裸候选（collectElevationLevels）按拖拽目标类型
 * 施加模型抬升——排除集（拖拽目标）全部为模型时候选层 + MODEL_BASE_HEIGHT
 * （承托面 + lift 语义：地面 0 → lift、道路顶 0.06 → 0.06+lift……模型吸附落点
 * 永不与承托面精确共面）；含任何非模型（region 有自己的 baseHeight 阶梯，精确
 * 贴附语义不变）或空排除集（无拖拽目标语境）→ 裸值原样返回。
 * 与贴地命令（EditorActionsCore 逐对象 + lift）同源不同形：gizmo 单底面快照
 * 吸附只能整组施加，混合选中按保守侧（region 精确）处理。
 */
export function collectElevationSnapLevels(
  objects: readonly SceneObject[],
  excludeIds: readonly ID[],
): number[] {
  const levels = collectElevationLevels(objects, excludeIds);
  const exclude = new Set(excludeIds);
  const dragged = objects.filter((o) => exclude.has(o.id));
  if (dragged.length === 0 || !dragged.every(isModelObject)) return levels;
  return levels.map((level) => level + MODEL_BASE_HEIGHT);
}
