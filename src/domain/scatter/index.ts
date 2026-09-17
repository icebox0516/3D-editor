/**
 * domain/scatter 汇总导出：种子化确定性撒点纯函数（T003.1，D8/D17）+ 配方覆写解析（T003.3，D18）。
 *
 * 边界：只依赖 core（分层 DAG）；零 THREE 零 DOM——撒点算法零渲染依赖由分层检查强制。
 */
export * from './scatter';
export * from './recipe';
