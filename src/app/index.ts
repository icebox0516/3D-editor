// app 层：bootstrap 组合根 —— 装配各层依赖并注入 Port 实现，可导入一切层。
// bootstrap.ts：createEditor(canvas, opts) → EditorFacade；默认场景（环境预设 + 8 图层）；
//               归层（resolveLayerFor / importElements）；资产清单（loadManifest / registerAssets）。
// input.ts：DOM 输入接线（归一化 PointerEventInfo/KeyboardEventInfo → ToolManager，
//           及 Ctrl+Z/Y、Delete、ESC、W/E/R 全局快捷键表）。
export * from './bootstrap';
export * from './input';
