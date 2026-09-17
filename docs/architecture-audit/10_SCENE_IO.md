# 10 · 持久化与场景格式（Scene IO）

## JSON schema（v2，实际字段）

`SceneSerializer.serialize` = `JSON.stringify(data, null, 2)` **整体透传**（`SceneSerializer.ts:89-91`）——schema 即 `SceneData` 类型本身：

```jsonc
{
  "version": "2.0",                  // 固定；版本门仅认 '2.0'（:28）
  "id": "scene_xxx",                 // 缺省宽容回退 createId('scene')
  "name": "未命名场景",
  "environment": {                   // 开放扩展键（SceneData.ts:13-16）
    "preset": "day",                 // day/dusk/night/tech；非法回退 day
    "grid":     { "visible": true, "size": 2000, "spacing": 5 },   // 可选
    "renderMode": "shaded",          // 可选；诊断三档保存时被组合根剥离
    "axes":     { "visible": true }  // 可选
  },
  "layers": [ { "id","name","visible","locked","opacity","order","objectIds" } ],
  "objects": [ /* SceneObject 平铺数组，见 03 文档结构图；parentId 嵌套随数组序保序 */ ]
}
```

region 对象三层字段（shape/semantic/style）整体透传；model 对象含 `asset:{assetId}`；group 纯基座。

## v1 / v2 与 migration

- **v1 不支持、无迁移层**：`SUPPORTED_VERSIONS` 仅 '2.0'，v1 文件 deserialize 抛「不支持的场景文件版本…v1 旧格式已停止支持」（:28,112-116）。用户裁决 2026-09-12 不做旧要素转换层（CONTRACTS #9）。
- 'group' 为 **2.0 版本号不变的增量放行**（T8.5，前向兼容：旧 reader 拒绝新类型属 fail-fast 正常行为；新 reader 放行 group）。
- **无版本迁移框架**——未来格式演进需参照 group 先例（增量放行 + 版本门收紧）或升版本号 + 显式迁移函数（当前无此设施）。

## 校验（deserialize，fail-fast 路径化错误）

- 根对象/JSON 合法性 → version 门 → objects/layers 必须数组 → `assertValidObjects`（:47-84）：type ∈ region/model/group；region 须 shape/semantic/style 三层齐备 + shape.type 七枚举 + semantic.type 十枚举 + points 为数组（**结构级**校验；数字合法性/自相交归 domain 校验管线——导入路径才跑）。model/group 不做结构校验。
- id/name/environment 宽容回退（:133-144）。

## save / load / import / export

| 操作 | 实现 | 说明 |
|---|---|---|
| 保存 | `bootstrap.saveScene()`（:602-618）组 SceneData（全 deepClone）→ serialize；**诊断档 renderMode 剥离在此出口**（:607-608）；App 层 `defaultDownloadJson` Blob 下载文件（actions.ts:154-162） | 不走 localStorage |
| 打开 | `defaultPickFile` 动态 input（actions.ts:74）→ deserialize → `facade.openScene(data)`（bootstrap.ts:578-600：deactivate 工具 → selection.clear → sceneManager.clear（scene:changed{clear} → Renderer resyncAll）→ 逐层 addLayer（objectIds 过滤陈旧引用）→ 逐对象 addObject → history.clear） | 事件驱动渲染重建 |
| 导出 | `io/SceneExporter.export` **薄壳直委托 serialize**（:15-17）——与保存同构，无额外处理 | 「导出 JSON」与「保存」同一出口（actions.ts:282） |
| 导入 | `io/JsonImporter`（外部数据 → RegionObject），见下 | 与「打开场景文件」是两条不同通路 |

### JsonImporter（映射配置化导入）

- 映射结构 `ImportMapping`（JsonImporter.ts:51-75）：`version('2.0' 必须恰等)/rootArray(点分 JSON Path，支持数组下标)/semanticType(十类)/geometry{path, format: 'xy-array'|'xyz-array'|'ring-array', shape?}/fields/defaults`。示例 `assets/mappings/building.example.json`。
- 几何：ring-array 取 rings[0] 外环（内环丢弃记告警）；xy/xyz 单点→point、≥2→line（默认 polygon）；xyz 取 x 与 z 弃中间高度。
- 字段映射：目标键 "name"→对象名，其余入 semantic.properties；`floors*3` 表达式（FIELD_EXPR_RE :99，乘数解析 :216-233）；映射源必填缺失则整对象非法。
- defaults：presetId 缺省=语义 defaultPresetId；layerName 写 `metadata.layerName`（bootstrap.resolveLayerFor 按名归层）。
- 自动修复：NOT_CLOSED 自动补闭合+顺时针反转后收录（AUTO_FIXABLE_CODES :93）；SELF_INTERSECT 等不可修复排除。
- **ID 重生成**：经 `createRegionObject` 工厂 → 全部 `region_` 新 id（:342）。
- 批量：actions.ts:524-553 多文件 → 预览弹层（逐文件计数/告警，失败置灰不阻断）→ 一次 `importElements`（bootstrap.ts:178-184）BatchCommand **一条历史**（一次 Ctrl+Z 全部撤销）。

## template

- **内置模板**：`io/templates/empty-campus.json`（11 空图层）/ `sample-campus.json`（6 region 示例：办公楼/研发中心/主路/湖/绿地/大门）。模块加载时经 deserialize 校验一次（fail-fast，templates/index.ts:42-51）。id 为固定字符串 `builtin-empty`/`builtin-sample`（注册表键命名空间，不走 createId 体系）。
- **个人模板**：localStorage `t3d-editor.templates`（userTemplates.ts:24），上限 20 条 / 1,000,000 字符，重名覆盖，拒存五原因分类，storage 注入式可测。
- **实例化 = 深拷贝 + 全量 id 重生成**：`regenerateSceneIds`（templates/index.ts:66-95）——deepClone + scene_/layer_/region_|model_ 全部重发号 + layerId/parentId/objectIds 一致重映射 + 陈旧引用剔除。模板只读、实例全新。
- 入口：菜单「文件 → 新建场景 ▾」→ actions.newSceneFromTemplate（:467）；dirty 先弹确认。

## asset reference / style reference

- **asset**：场景只存 `assetId` 字符串 → 运行期按 AssetRegistry 查 ModelAsset → AssetLoader 按 file URL 加载。**引用完整性无校验**：manifest 中删除资产后打开旧场景，对象仍渲染为空占位（attachModel 走池，loadInstanceSource 失败 console.warn 一次「实例不渲染」，InstancedAssetPool.ensurePool catch；Renderer.ts:1023-1025 「模型加载失败，保留空占位」）。无缺失资产报告 UI。
- **style**：场景只存 `presetId + overrides` → 运行期经样式引擎路由重建。**失败安全**：presetId 未注册 → 降级 default_solid + Toast（engine.ts:60-63）——场景文件对样式系统演进天然容错。

---

## 重点问题解答

### Scene JSON 是否保存 Render Result？

**否**。无材质对象、无 THREE 结构、无样式实例、无渲染模式诊断档、无测量数据——只存描述数据 + 引用。渲染产物全部可由 (presetId, overrides, semantic, shape) 确定性重建（样式引擎幂等）。

### 是否只保存「描述数据」？

是——形状（点列+类型+参数缓存）、语义（类型+参数）、样式引用（ID+覆写）、变换、层级（parentId+数组序）、图层清单与派生索引（objectIds 会重过滤）、环境配置。附加的 `shape.options`（参数化缓存）与 `metadata`（layerName 等）也属描述性数据。

### Style 是否可以重新生成？

**可以**——且是设计核心：加载后 RegionRenderer.create 按当前注册的预设重建 StyleInstance。版本间样式演进（预设改名/删除/参数变化）的后果：改名/删除 → 降级 default_solid + Toast（不崩）；参数增删 → resolvePresetParams 按新参数表解析（旧覆写未知键忽略）。

### Asset 是否通过 ID 引用？

是（`asset.assetId`）。见上文「asset reference」——含无完整性校验的现状事实。

### 如果未来增加 Procedural Asset，Scene JSON 是否需要改变？

> 推断（非当前事实）：

- **若程序化资产只替代「GLB 文件来源」**（AssetRegistry 条目带 generator 元数据、渲染期程序构建几何）：**ModelObject 结构不变、Scene JSON 不变**——`asset:{assetId}` 引用形态天然兼容（正是引用间接性的收益）。
- **若需要每实例参数**（随机种子/变体/高度缩放范围）：**需要改变**——ModelObject 需扩展（如 `asset.params` 或基座 properties 承载）；序列化是整体透传，新字段旧 reader 会原样保留（updateObject 透传任意键，RegionObject.ts:29-30 注释「T1.5 勘误」先例），但 deserialize 的 model 结构校验目前不做（不会拦截），**向后兼容风险低但契约上应显式声明**。
- **若 Style 引用 Asset（森林=区域+散布规则）**：需在 RegionStyle 或新层增加 asset 引用与 scatter 规则字段——v2 schema 需扩展（region 三层之外的第四层或 style 内嵌）；版本门与 fail-fast 校验（assertValidObjects 目前强校验三层齐备）需同步放宽。这是**改动面最大的方向**，详见 13 文档方向 C。
