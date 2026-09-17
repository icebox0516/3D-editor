/**
 * domain 层汇总导出：geometry / regions / styles / assets / validate。
 *
 * 职责：园区业务的纯数据模型（几何、区域对象、样式参数元数据、资产）与领域校验
 *      （validateGeometry）。T6.9：v1 elements（Element 旧要素基础接口）已随旧契约
 *      类型面删除——RegionObject（domain/regions）为唯一业务对象体系。
 * 边界：只依赖 core 与 scene（分层 DAG：domain→core,scene）；零渲染——禁止任何 THREE
 *      类型或导入（CONTRACTS.md #5），渲染几何/材质由 runtime 依据这些纯数据生成。
 */
export * from './geometry';
export * from './regions';
export * from './styles';
export * from './assets';
export * from './validate/validateGeometry';
