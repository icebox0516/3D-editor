/**
 * runtime/styles/params —— 预设参数解析（默认值 ← 覆写 + 钳制 + 类型回退）。
 *
 * 职责：把 preset meta.defaultParams 与用户 overrides 合成为最终生效参数集。
 * 语义沿 v1 domain/styles resolveStyle 三级合成先例（T6.2 任务书裁定；该函数已随
 * T6.9 旧类型面删除，本模块为同一语义的现存实现）：
 *   - overrides 命中且类型匹配 → 生效（number 按 [min,max] 钳制）；
 *   - 类型不符（如 number 参数收到 string）→ 回退默认值，垃圾值不流入渲染材质；
 *   - 默认值同样遵守 min/max 钳制；
 *   - 未在参数表声明的键一律忽略（保留键 semantic 由引擎在解析后另行写入）。
 * 边界：纯函数、零 THREE；与 registries 元数据无耦合（defaultParams 由调用方传入）。
 */
import { clamp } from '../../core/utils';
import type { StyleParameter } from '../../domain/styles';

/** 解析结果：参数键 -> 生效值（原始类型） */
export type ResolvedPresetParams = Record<string, string | number | boolean>;

/** 判断候选值是否与参数类型匹配（select 接受 string|number；color 仅 string——沿 v1 resolveStyle 先例） */
function matchesType(param: StyleParameter, value: unknown): boolean {
  switch (param.type) {
    case 'color':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'select':
      return typeof value === 'string' || typeof value === 'number';
  }
}

/** 解析单个参数：覆写优先（类型匹配），否则默认值；number 结果做 min/max 钳制 */
function resolveValue(param: StyleParameter, overrides: Record<string, unknown>): string | number | boolean {
  const candidate = overrides[param.key];
  const min = param.min ?? Number.NEGATIVE_INFINITY;
  const max = param.max ?? Number.POSITIVE_INFINITY;
  if (candidate !== undefined && matchesType(param, candidate)) {
    return param.type === 'number' ? clamp(candidate as number, min, max) : (candidate as string | number | boolean);
  }
  if (param.type === 'number' && typeof param.default === 'number') {
    return clamp(param.default, min, max); // 默认值同样遵守钳制
  }
  return param.default;
}

/** 合成最终生效参数集：meta.defaultParams + overrides（未知键忽略；semantic 保留键不在此处理） */
export function resolvePresetParams(
  defaultParams: readonly StyleParameter[],
  overrides?: Record<string, unknown>,
): ResolvedPresetParams {
  const values: ResolvedPresetParams = {};
  const source = overrides ?? {};
  for (const param of defaultParams) {
    values[param.key] = resolveValue(param, source);
  }
  return values;
}
