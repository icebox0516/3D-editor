# 06 · 资产系统（Asset System）

## 链路总览

```
assets/manifest.json（scan-assets.mjs 生成）
  → app/bootstrap.loadManifest（fetch + io/AssetManifest.loadManifest 校验 + 相对路径→URL）
  → registerAssets → AssetRegistry（registries 层）
  → ui/panels/ContentBrowser（分类/搜索/标签/收藏/排序）
  → PlacementTool（Ghost 预览 + 点击放置）
  → ModelObject{asset:{assetId}} 经 CreateObjectCommand 入 Scene
  → Renderer.attachModel → InstancedAssetPool（1=Mesh / ≥2=InstancedMesh）+ AssetLoader 模板缓存
```

## 1. Asset 的数据结构

`ModelAsset`（`src/domain/assets/ModelAsset.ts:11-25`）：

```ts
{ id: ID, name: string, category: string,        // 对应 assets/models/{category}/ 目录
  file: string,                                   // 相对 assets 根的 .glb 路径
  thumbnail?: string, tags: string[],
  defaultScale: Vec3, defaultRotation: Euler,     // 放置默认变换
  metadata?: Record<string, unknown> }            // placeholder/categoryLabel/triangles/bytes 等
```

场景侧引用 `AssetReference = { assetId: ID }`（AssetReference.ts:8-10）——**只存 ID，不内联资源**。

## 2. manifest 格式（实际文件核对）

`assets/manifest.json`（13 条目 / 8 分类，含中文文件名与中文 id 如 `asset_建筑1`）：

```json
{ "version": "1.0",
  "generator": "scripts/scan-assets.mjs",
  "assets": [ { id, name, category, file, thumbnail, tags[],
                defaultScale{x,y,z}, defaultRotation{x,y,z},
                metadata{ placeholder?, categoryLabel, triangles?, bytes } } ] }
```

校验 `io/AssetManifest.loadManifest`（AssetManifest.ts:75-119）：版本门、必填 id/name/category/file、缺省归一（tags→[]、scale→1、rotation→0）、重复 id 抛错。**无 runtime 类型信息**（无「是否程序化」字段）、无 LOD/变体、无依赖声明。

实际分类（models/ 目录）：building(4) / character(1) / device(1) / fire-safety(1) / plant(4) / public-facility(1) / road-facility(1) / vehicle(1)。

## 3. 分类 / 搜索 / 标签 / 收藏（ContentBrowser，browserModel.ts 纯函数）

- 分类：`buildCategories`（:141-157，首现序聚合 + 计数，label 取 metadata.categoryLabel 回退 slug）。
- 搜索：`filterAssets`（:106-122，name/tags 不区分大小写；与分类/收藏/标签 **AND** 叠加）。注册表侧另有 `AssetRegistry.search`（:64-80）同语义。
- 标签：`buildTagChips`（:168-186，manifest tags 聚合芯片，展开态显示）。
- 收藏：localStorage `t3d-editor.asset-favorites`（:21），`toggleFavorite`（:49-88，损坏静默空集）。
- 排序：`sortAssets`（:205-215，default/name/category，**会话态组件 useState 不入持久化**，ContentBrowser.tsx:83-87）。
- 双态（收起/展开）与面板尺寸走 workspaceStore.browser。

## 4. Asset 与 ModelObject 的关联

放置时 `modelFactory.createModelObjectAt`（modelFactory.ts:66-79）把 `{assetId}` 写入对象；渲染期 `InstancedAssetPool` 按 `assetId` 分池，`AssetLoader` 按 `assetId` 模板缓存。**运行期换资产**：`Renderer.update` keys 含 'asset' 时经池重挂（跨 assetId 池内自动迁移，Renderer.ts:546-548；InstancedAssetPool.attach 同 id 换资产先 detach 再入新池 :158-166）。

## 5. 是否只支持 GLB / GLTF

- **加载器只挂 GLTFLoader**（AssetLoader.ts:17,25），无 DRACO/KTX2/Meshopt 解码器（子代理核实）。
- manifest `file` 字段语义上指 .glb；**无格式校验强制**（loadManifest 只查必填字符串）——放 .gltf 理论上 GLTFLoader 也能载，但工具链（scan-assets 只扫 .glb）与文档口径均为 GLB。OBJ/FBX 在 CONTRACTS「明确排除项」。
- 缩略图体系：SVG 静态占位（scan-assets 生成）→ 首次点击/拖放触发 IndexedDB 缓存的离屏真实快照（ThumbnailCache 三级：内存 Map → IndexedDB `t3d-editor/thumbnails` → OffscreenSnapshotter 128×96 独立 WebGLRenderer 懒建，key=`assetId@bytes`）。

## 6. 是否支持程序生成资产

**部分**——工具链支持、运行时不支持：
- `scripts/generate-assets.mjs`（npm run assets:generate）可**离线程序生成占位 GLB** 写入 assets/models 并重生成 manifest（manifest metadata.placeholder=true 标记，建筑 1/2/3 为用户手动放置真实模型入库）。
- **运行时无程序化资产概念**：Asset 定义无 generator/kind 字段，AssetRegistry 只收静态元数据；「Procedural Asset」接入点分析见 13 文档。

## 7. Instancing 实现要点（InstancedAssetPool.ts）

- **每 assetId 一池**（`pools: Map<assetId, AssetPool>`）；业务层无感——仍逐 ModelObject 调 `attach`。
- 形态分派 `reconcile`（:384-402）：0=拆池；**1=普通 Mesh**（activateSingle :409，实例化开销不值得；userData.objectId 反查拾取）；**≥2=InstancedMesh**（activateInstanced :427，同资产全部实例共享一份 geometry/material、一个 Draw Call）。
- 矩阵：`attach/update` 经 `composeMatrixInto`（隐藏实例=**零缩放矩阵**：不渲染不可拾取，:104-112）；单实例 transform 更新只 `setMatrixAt×1`（writeEntry :465-496）+ needsUpdate + computeBoundingSphere。
- 扩容：翻倍（capacityFor :92，MIN_CAPACITY=4），**只换 InstancedBufferAttribute 不换 Mesh 对象**（渲染引用稳定，:440-449）。
- 删除：`detach` = entries.splice 前移压缩 + reindex + reconcile（其余实例矩阵值不变）。
- 跨池迁移：同 id 换 assetId 先 detach 再入新池（:158-166）。
- **锚点机制**：attach 返回脱离渲染树的 Object3D（anchorRoot 永不入场景 :127）——供 RuntimeObjectMap / CameraController 包围盒取景；源就绪后 decorateAnchor(:508) 补共享 Mesh 子节点。「同资产 500 实例 → 场景渲染对象数 = 1 个 InstancedMesh」。
- 诊断分组（islands 模式）：`setDiagnosticGrouping(classify, DIAG_LAYER)`（:235）——纯一侧整网格换层；混合池主网格收暗侧 + 临时第二 InstancedMesh 收亮侧，共享源资源只各持一份矩阵缓冲（PoolSplit/ensureSplit :283-）。

## 8. 多实例管理 / 实例删除 / 更新

见上节；补充：undo/redo 经 CreateObjectCommand 的 addObject/removeObject → Renderer attach/detach → 池登记/摘除，**undo 重挂追加到池尾**（entries 插入序，头注 :42）。图层可见性/透明度：可见性编码进实例矩阵（零缩放）；**透明度不对模型实例乘算**（共享模板材质，Renderer.ts:945 注释「模型克隆/实例共享模板材质，不做图层透明度乘算」）。

## 9. Asset 是否有独立生命周期

**没有独立的生命周期管理器**。资产一经注册常驻（无 unregister 调用点、无引用计数卸载）；GLB 模板缓存由 AssetLoader 持有，`Renderer.dispose` 时统一释放（instancedPool.dispose 先于 loader，Renderer.ts:796-797）。运行期无热重载/无按需卸载（`templates` Map 失败即删可重试，AssetLoader.ts:40-50）。

## 10. Ghost 如何生成

`PlacementTool` activate → `ctx.preview.showGhost(assetId)`（PreviewPort）→ `runtime/services/PreviewManager.ts:109`：先立即放 2×2 半透明占位盒（0x4ec9ff，:85-90）→ `assetLoader.instantiate` 异步 clone(true)（共享几何/材质的独立实例）替换占位，ghostToken 竞态防护（:59,123-124）。Ghost 挂 AUX_LAYER、不入 Scene、不入 RuntimeObjectMap、不入历史（PreviewManager 头注）。**Ghost 不走 InstancedAssetPool**（池头注 :12「选中高亮与 Ghost 预览不走本池」）。

---

## 「资产定义」与「渲染对象」是否已经分离？

**已经分离，且是多级分离**：

1. **定义**（ModelAsset 元数据，磁盘 manifest + AssetRegistry）与**资源**（GLB 二进制，AssetLoader 模板缓存）分离；
2. **场景引用**（ModelObject.asset.assetId 字符串）与**渲染实例**（InstancedAssetPool 槽位/锚点）分离——对象删除只摘槽，模板资源不动；
3. **模板**（loadInstanceSource 产物：单 Mesh 引用或多 Mesh 合并后的单 geometry+材质数组）与**实例渲染**（矩阵槽）分离。

唯一运行期耦合点：`extractInstanceSource`（AssetLoader.ts:119）对多 Mesh GLB 做 **matrixWorld 烘焙 + mergeGeometries 合并成单几何**（T5.9）——合并产物丢失子节点结构（选择「不可合并回退首 Mesh」），意味着**依赖节点级动画/独立子材质动画的 GLB 会被压平**（现状事实，对静态园区资产合理）。

## 如果未来增加 Procedural Asset，最自然的接入点在哪里？（推断/建议）

> 非当前事实。

1. **注册表轨**：`AssetRegistry.register(ModelAsset)` 本身不区分静态/程序化——`file` 字段是唯一资源指针。程序化资产需要新的资源形态字段（如 `generator: 'tree_a'`）或以 `file` 约定协议承载；manifest schema（version '1.0'）与 `loadManifest` 校验需同步扩展。
2. **源提供者 seam**：`InstanceSourceProvider = (assetId) => Promise<InstanceSource>`（InstancedAssetPool.ts:27）是**最佳接入点**——它已是依赖注入接口，Renderer 把 AssetLoader.loadInstanceSource 注入（Renderer.ts:385）。程序化资产 = 换一个 provider：按 generator 参数构建 BufferGeometry+Material 返回 InstanceSource，**池与渲染层零改动**（程序生成几何天然单 Mesh，正好契合合并管线）。
3. **Ghost/缩略图**：PreviewManager 占位盒先行的策略天然兼容异步生成；ThumbnailCache 需要程序化渲染快照（OffscreenSnapshotter 已具备渲染任意 InstanceSource 的能力潜力，现仅从 GLB 实例化取源）。
4. **参数化实例**：当前 ModelObject 只有 transform——若每实例需要随机变体（高度/色调），需扩展 ModelObject 数据（如 `asset.params`）+ 池内 per-instance attribute（当前矩阵仅 16 float，无自定义 instanced attribute 通路）。
5. **不支持继续扩展的地方**：`metadata` 自由字段可带参数但 UI/渲染均不消费；把生成参数塞 metadata 属于影子通道，不建议。
