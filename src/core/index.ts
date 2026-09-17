/**
 * core 层汇总导出：types / id / events / math / random / utils。
 *
 * 职责：全项目基础类型与纯函数能力；上层经此或经子路径导入均可。
 * 边界：core 不依赖任何层与任何外部包（分层 DAG 的根，见 CONTRACTS.md #1）。
 */
export * from './types';
export * from './id';
export * from './events/events';
export { EventBus } from './events/EventBus';
export * from './math';
export * from './random';
export * from './utils';
