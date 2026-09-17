/**
 * io 层汇总导出：serializer / importer / exporter / manifest。
 *
 * 职责：数据导入、导出与序列化，产出/消费标准 SceneData（version "2.0"）与
 *      RegionObject 导入产物（T6.9：JsonImporter v2 零注册表依赖）；
 *      资产清单（manifest）读取与灌注（路径保持相对语义，URL 解析在组合根）；
 *      场景模板（T8.2）：内置静态 JSON 模板 + 用户模板 localStorage CRUD。
 * 边界：只依赖 core/scene/domain（分层 DAG）；零渲染（禁止 THREE）；
 *      导入产物是可编辑的 RegionObject，不是不可编辑的 Mesh（需求文档·数据导入）。
 */
export * from './SceneSerializer';
export * from './JsonImporter';
export * from './SceneExporter';
export * from './AssetManifest';
export * from './templates';
