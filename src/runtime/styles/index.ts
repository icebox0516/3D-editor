/**
 * runtime/styles 汇总导出：插件化样式引擎（阶段 6 T6.2）。
 *
 * 职责：样式引擎统一入口（engine）+ 构建路由（routes）+ 插件契约类型（types）+
 *      参数解析（params）。一预设一文件（base/<name>.preset.ts，同文件导出 meta 与 build），
 *      经 routes 的 import.meta.glob eager 收割；仅 runtime / app 可见（分域契约 §0）。
 * 边界：THREE 合法区；materialPool / presetHelpers 为引擎与插件内部件，不经本出口暴露。
 * 退役注记：v1 旧要素样式体系（旧材质工厂 + 19 套按要素样式定义）已随 T6.7 旧要素删除；
 *      StyleRegistry 亦于 T6.9 随旧契约类型面删除（预设元数据统一走 StylePresetRegistry）。
 */
export * from './types';
export * from './params';
export * from './routes';
export * from './engine';
