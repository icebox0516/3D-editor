/**
 * domain/regions/footprint —— 足迹派生纯函数（T8.1 R3）。
 *
 * 职责：line region（道路）的条带半宽派生——道路渲染面 = 中心线 ± width/2 带宽
 *      （GeometryBuilder 分域契约 §C：带宽仅对 shape.type='line' 的 road 语义生成；
 *      polygon 形状 + road 语义 width 忽略）。对象吸附/对齐参考线的候选足迹需按
 *      条带边缘（而非中心线）取值（T8.1 验收「道路条带边缘作为对齐候选」），
 *      与 runtime GeometryBuilder 同一取参规则（semantic.properties.width 优先、
 *      缺省回退语义注册表默认值——注册制取参，禁止散落 type 判断）。
 * 边界：纯函数，零 THREE、不修改入参；非 line/road 对象恒 0（无条带）。
 */
import { isRegionObject } from './RegionObject';
import { getSemanticDefinition } from './semanticDefinitions';
import type { SceneObject } from '../../scene/SceneObject';

/**
 * 条带半宽（米）：line + road 语义 = width/2（显式值优先，缺省回退语义定义默认 6/2）；
 * 其余对象（polygon 形状 road、非 road 语义、model）恒 0。
 */
export function roadBandHalfWidth(obj: SceneObject): number {
  if (!isRegionObject(obj)) return 0;
  if (obj.shape.type !== 'line' || obj.semantic.type !== 'road') return 0;
  const raw = obj.semantic.properties.width;
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw / 2;
  const def = getSemanticDefinition('road');
  const fallback = def?.properties.find((p) => p.key === 'width')?.default;
  return typeof fallback === 'number' && Number.isFinite(fallback) && fallback > 0 ? fallback / 2 : 0;
}
