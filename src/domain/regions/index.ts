/**
 * domain/regions 汇总导出：RegionObject 三层结构、语义定义数据、参数化形状点生成、校验适配。
 *
 * 阶段 6（形状驱动创建与样式引擎）的纯数据基座（T6.1 交付）：Shape/Semantic/Style 三层解耦，
 * 与旧要素体系（domain/elements）过渡期并存（分域契约 §D；T6.7 旧要素删除后本模块为唯一体系）。
 * 边界：只依赖 core 与 scene（分层 DAG）；零渲染——禁止任何 THREE 类型或导入。
 */
export * from './RegionObject';
export * from './semanticDefinitions';
export * from './elevationLevels';
export * from './footprint';
export * from './shapePoints';
export * from './shapeConvert';
export * from './validateRegionShape';
export * from './createRegionObject';
export * from './vertexEdit';
export * from './roadGeometry';
