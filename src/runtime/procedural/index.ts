/**
 * runtime/procedural 汇总导出：程序化资产模块（T002.1，D17）。
 *
 * 职责：程序化资产统一入口——插件契约类型（types）+ 构建路由（routes）+
 *      会话私有构建缓存（ProceduralSourceCache）。一资产一文件
 *      （assets/<name>.asset.ts，同文件导出 meta 与 build），经 routes 的
 *      import.meta.glob eager 收割，资产文件本身不经本出口 re-export
 *      （meta 走 collectProceduralAssetMetas 收割口，build 走路由表——
 *      re-export 泛名 meta/build 只会污染出口命名空间）。
 * 边界：THREE 合法区（分层 DAG 由 check:layers 守门）；本模块只被 runtime / app
 *      及组合根消费，domain / editor / ui / registries 永不反向依赖。
 */
export * from './types';
export * from './routes';
export * from './ProceduralSourceCache';
