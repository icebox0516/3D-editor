# 分域契约 · v1 旧要素体系（T6.7 退役 · T6.9 契约类型面删除）

> **终局收口（2026-09-12，T6.9 done）**：Element / ElementRegistry / StyleRegistry / StyleDefinition / StyleReference / resolveStyle 契约类型面已从 CONTRACTS.md 与源码**整体删除**（JsonImporter v2 零注册表依赖后零消费者；StyleParameter/StyleParameterType 保留迁 domain/styles/StyleParameter.ts）；场景文件 v2（'2.0'）拒读 v1 旧格式（按需门用户裁决：旧数据兼容整体不做）。
> **退役完成（2026-09-12，T6.7 done · commit 01b53a5）**：旧要素/旧渲染器/v1 命令（ChangeGeometry/ChangeStyle）/19 套 StyleDefinition 数据已从源码删除；Element / ElementRegistry / StyleRegistry / StyleDefinition / resolveStyle 作为 CONTRACTS.md 基础契约类型面保留（空表装配，JsonImporter 与 EditorFacade.registries 形状依赖），其最终去留随 T6.9 数据格式 v2 一并收口。本文件自此为**历史参考**，不再约束新代码。
> 2026-09-11 自 CONTRACTS.md 拆离（按需读取重构）。**触及旧要素 / 旧样式定义的任务必读**：T6.1（共存过渡）、T6.5/T6.6（旧面板分支保留期）、T6.7（删除边界依据）。
> 退役注记（2026-09-11 阶段 6 立项）：building / marker 要素体系于 T6.6/T6.7 删除，其余 Element 由 RegionObject 体系（contracts/stage6-region.md）取代；过渡期本文件契约保持有效。StyleParameter / StyleParameterType 留在 CONTRACTS.md 基础契约（阶段 6 插件复用）。

```ts
// ── domain/styles（v1 定义形态）────────────────────────────
export interface StyleReference { styleId: ID; overrides?: Record<string, string | number | boolean> }
export interface StyleDefinition { id: ID; name: string; elementType: string; parameters: StyleParameter[]; material: MaterialSpec }
export interface ResolvedStyle { styleId: ID; values: Record<string, string | number | boolean>; material: MaterialSpec }  // material 为深拷贝副本
/** 三级优先级合成：全局预设 < 图层覆盖 < 对象 overrides；类型不匹配的覆盖值回退下一优先级；数值受 min/max 钳制 */
export function resolveStyle(def: StyleDefinition, layerOverrides?: Record<string, unknown>, objectOverrides?: Record<string, unknown>): ResolvedStyle;

// ── domain/elements ────────────────────────────────────────
export interface Element extends SceneObject { geometry: GeometryData; style: StyleReference }
// 注：属性接口用 type 别名而非 interface——interface 无隐式索引签名，与 SceneObject.properties: Record<string, unknown> 冲突（TS2430）；type 结构完全等价（2026-09-09 T1.2 按需门确认）
export type BuildingProperties = { height: number; baseHeight: number; floors: number }
export interface BuildingElement extends Element { type: 'building'; properties: BuildingProperties }
export type RoadProperties = { mode: 'centerline' | 'polygon'; width: number }
export interface RoadElement extends Element { type: 'road'; properties: RoadProperties }
export interface GreenElement  extends Element { type: 'green' }
export interface WaterElement  extends Element { type: 'water' }
export interface ParkingElement extends Element { type: 'parking' }
```
