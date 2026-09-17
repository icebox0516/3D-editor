/**
 * runtime/styles/presetHelpers —— 插件参数防御性读取小工具。
 *
 * 职责：引擎已按 meta 解析参数（类型/钳制保证），但插件 build 也可能被直接调用
 *      （测试 seam / 无 meta 路由透传原始参数），故插件内做一次防御性收窄：
 *      类型不符回退默认值，number 额外钳制——与 engine/params 语义一致的双保险。
 * 边界：零状态纯函数；仅 runtime/styles 插件使用。
 */

/** 读颜色参数：非 string 回退 fallback（'#rrggbb' 约定，THREE.Color 可解析格式均可） */
export function readColor(value: unknown, fallback: string): string {
  return typeof value === 'string' && value !== '' ? value : fallback;
}

/** 读数值参数：非有限数回退 fallback，可选 [min,max] 钳制 */
export function readNumber(value: unknown, fallback: number, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}
