# 04 · 对象生命周期（Object Lifecycle）

> 追踪四条真实代码路径，全部标注文件与关键函数。行号以当前工作区为准。

## A. 绘制区域（以多边形为例）

```
用户点击垂直条「区域」/ 数字键 1
  └─ ui/tools/VerticalToolbar.tsx:129-133
       → toolIA.toggleRegionDraw / toggleShapeDraw（toolIA.ts:1104-1122）
       → tools.activate(shapeToolId(shape), { shape })          # ToolManager.activate (ToolManager.ts:42-57)
         先 active?.deactivate() → emit tool:changed
         六形状工具完成后回选择：tool.setExitToSelect(() => tools.activate('select'))
         （组合根接线 bootstrap.ts:471-473；点工具 exitsOnComplete=false 保持连续）

视口左键点击（每次落点）
  └─ app/input.ts:152-170  DOM pointerdown → PointerEventInfo → tools.getActiveTool()?.onPointerDown(e)
  └─ editor/tools/draw/DrawPolygonTool（extends DrawToolBase）
       草稿持有：DrawToolBase.ts:97-115 工具实例字段 + DrawSession.ts:26-44（points[]/cursor，纯内存）
       辅助管线：DrawToolBase.applyAids(:366-383)
         Shift 正交 orthoLock > A 键 45° angleLock（互斥）> G 网格 gridSnap
         （三个纯函数 editor/tools/draw/snap.ts:15/24/46；
          G = 会话开关 ∧ DrawGridConfig.snapEnabled 共享配置，默认 5m）
       草稿可视化：ctx.preview.updateDrawPreview（PreviewPort）
         → runtime/services/PreviewManager.ts:155（Points 顶点 + Line 折线 + 半透明面 + CanvasTexture 文字 sprite，AUX_LAYER）
       状态栏读数：eventBus.emit('draw:status', {length, area, cursor, vertexCount})（events.ts:31-49）
         → ui/store.ts:229 → StatusBar.describeDrawStatus（StatusBar.tsx:55-78）

双击闭合（dblclick → onDoubleClick）
  └─ DrawSession.complete()（DrawSession.ts:62-81）
       组装 Polygon≥3 + 自动闭合环 → domain/validate/validateGeometry 校验
       失败抛 DrawValidationError（顶点不足 :100-105）/ 状态栏 draw:status.error 显示自相交拦截
       （自由形状另有 simplifyFreehand + smoothFreehand 管线 DrawFreehandTool.ts:110-125；
        参数化形状矩形/圆/椭圆走 DragShapeToolBase.completeDrag :141-160，拖拽松手即成）

完成创建
  └─ DrawToolBase.commitShape(:264-279)
       createRegionObject({ shape })(domain/regions/createRegionObject.ts:62-92)
         → semantic 缺省 unclassified + properties={}（该类型无参数）
         → style = { presetId: 'default_solid', overrides: {} }（unclassified 钉死，semanticDefinitions.ts:56）
         → id = createId('region')
       ctx.history.execute(new CreateObjectCommand(region))     # 一条历史
       selection.select(region.id)                               # 完成即选中
       exitsOnComplete → exitToSelect() 回选择工具

类型 + 样式赋值（三步流第二步）
  └─ ui/components/ContextToolbar 类型芯片（RegionQuickApply / regionQuickApply.ts:104-121）
       applySemanticAndPresetCore → BatchCommand[ChangeSemanticCommand + ChangePresetCommand] 一条历史
       ChangeSemanticCommand（ChangeSemanticCommand.ts:73-88）三联动：
         semantic 整体替换 + layerId 按语义 defaultLayerName 查名迁移 + style 重置为该类型默认预设
       ChangePresetCommand（:47）额外 emit style:changed{objectId}

Command → Scene → Render
  └─ CreateObjectCommand.execute → SceneManager.addObject
       emit object:created + scene:changed（SceneManager.ts:44-52）
  └─ runtime/SceneSync.ts:34-38 订阅 object:created → handlers.attach(obj)
  └─ Renderer.attach（Renderer.ts:497-521）
       非 model 非 group → rendererRegistry.get('region') → RegionRenderer.create（RegionRenderer.ts:70-92）
         GeometryBuilder(shape, semantic) → BufferGeometry（面类 polygonSurfaceGeometry / line 条带+UV / point 锚点）
         createStyle(geometry, shapeType, semanticType, presetId, overrides, semantic.properties)
           → runtime/styles/engine.ts:57 → routes.getBuildRoute(presetId) → 插件 build → StyleInstance
           → applyMaterialPolicy（无覆写→共享材质模板 materialPool）
         wrapper Group 挂 instance.object → RuntimeObjectMap.set(id, wrapper) → contentGroup.add
  └─ 连续渲染循环下一帧呈现（RenderLoop rAF，RenderLoop.ts:86-102）
```

**历史粒度**：面/线/多边形每次完成各一条历史；**点工具例外**——连续点击按段合并（`DrawPointTool.ts:107-142` 会话批次协议：每次提交先 undo 弹出本会话已入栈批次 → 与新命令重建更大 BatchCommand 入栈）。

## B. 放置资产

```
资产库（ContentBrowser）
  └─ 启动：App.tsx → bootstrap.loadManifest('assets/manifest.json')（bootstrap.ts:204-215）
       fetch → io/AssetManifest.loadManifest 校验（版本门/必填/缺省归一，AssetManifest.ts:75-119）
       → resolveAssetUrl 相对路径→URL → registerAssets → AssetRegistry 灌注（幂等）
  └─ ui/panels/ContentBrowser.tsx 点击卡片（分类/搜索/标签/收藏/排序 = browserModel.ts 纯函数）
       → setPlacingAssetId + tools.activate('placement', { assetId, continuous: true })

Ghost 预览
  └─ editor/tools/PlacementTool.ts activate
       ctx.preview.showGhost(assetId)（PreviewPort）
       → runtime/services/PreviewManager.ts:109 先放 2×2 半透明占位盒（0x4ec9ff）
         → assetLoader.instantiate(assetId) 异步 clone(true) 替换（ghostToken 竞态防护 :59,123-124）
       pointermove → updateGhost 跟随（surfacePoint 落点）

点击场景落位
  └─ PlacementTool.onPointerDown(:135-175)
       ctx.viewport.groundPoint(x,y)（RuntimeViewport.ts:69 射线交 y=0）
       buildTransform(:289-306)：y = ground.y + MODEL_BASE_HEIGHT(0.03)（domain/assets/ModelObject.ts:33）
         R 键累计 keyRotationY += π/4(:188-192)；滚轮缩放系数夹 [0.2,5](:195-201)
       factories/modelFactory.createModelObjectAt(:66-79)：id=createId('model')，asset={assetId}
       commitPlacement(:240-274)：
         mergeBatch=true（默认）→ 会话批次协议（同点工具：undo 弹本会话批 → 重建 BatchCommand）
           连续放置 N 次 = 一条历史（一次 Ctrl+Z 撤整段；被外部命令顶替则另起会话 :254-259）
         mergeBatch=false → 逐条 CreateObjectCommand

Command → Scene → Renderer
  └─ SceneManager.addObject → object:created → SceneSync → Renderer.attach
       isModelObject(obj) → attachModel（Renderer.ts:983-1000）
         instancedPool.attach(obj)（InstancedAssetPool.ts:152-176）
           返回「锚点」Object3D——脱离渲染树（anchorRoot 永不入场景 :127），供
           RuntimeObjectMap/包围盒取景；源就绪后 decorateAnchor(:508) 补共享 Mesh 子节点
           → map.set(obj.id, anchor) + modelIds.add
           → pool.update(id, transform, effectiveVisible) 写实例矩阵
         池内 reconcile(:384-402)：ensurePool 发起 loadInstanceSource（AssetLoader.ts:78）
           → GLTFLoader 加载（无 DRACO）→ 单 Mesh 直接引用 / 多 Mesh 烘焙 matrixWorld 后
             mergeGeometries 合并（T5.9，不可合并回退首 Mesh）
           → 0=拆池 / 1=普通 Mesh（实例化不值得）/ ≥2=InstancedMesh（同资产一个 Draw Call）
             扩容翻倍（capacityFor :92），只换 InstancedBufferAttribute 不换 Mesh 对象(:440-449)
       拾取：InstancedMesh 命中携带 instanceId → resolvePick(:206) 反查业务 id
```

**Ghost 不走实例池**（PreviewManager 独立克隆路径，`InstancedAssetPool.ts` 头注 :12）。

## C. 编辑对象（Inspector 改值 + Gizmo 拖拽两条代表路径）

### C1. Inspector 数值输入

```
选择 → ui/panels/InspectorPanel.tsx:157-166 订阅 selectedIds + sceneVersion 重读 facade.scene
  模型纯函数：inspectorModel.sectionsFor / describeSelection（:136/:174）
  region 分派：regionInspectorModel.sectionsForRegion（:80）——四分组（基础/几何/业务类型/表现样式），
    形状参数与语义参数按注册定义（StyleParameter）自动生成控件
提交（如 transform 数值）
  └─ InspectorPanel.commit()(:392-409)
       重读 live 对象构造 before/after → new TransformCommand → facade.history.execute
  名称/可见/锁定 → UpdateObjectCommand（:510，仅白名单三键，UpdateObjectCommand.ts:33 非法键抛错）
  图层 → ChangeLayerCommand(:561)；类型下拉 → ChangeSemanticCommand（regionInspectorModel.ts:212）
  语义参数逐键 → semanticPropertyChange（regionInspectorModel.ts:220）→ ChangeSemanticCommand（同类型路径）
  样式参数 → ChangePresetCommand（style 整体替换）
Command → SceneManager.updateObject(id, patch)
  └─ emit object:updated{keys} → SceneSync → Renderer.update(id, keys)（Renderer.ts:524-563）
       keys 含 'shape' → RegionRenderer.rebuildGeometry（几何重生成+setGeometry，材质不动）
       keys 含 'semantic' 且类型变 → swapStyle（dispose 旧实例+create 新，几何复用）
       keys 含 'semantic' 同类型 → updateStyle(params.semantic=…) 透传插件
       keys 含 'style' → presetId 比对：不同=swapStyle / 相同=updateStyle 调参
       公共属性幂等重应用 applySceneObjectState
```

### C2. Gizmo 拖拽（TransformTool）

```
W/E/R 或 QWER 组激活 → toolIA.activateTransformTool（toolIA.ts:1088-1091）
  → tools.activate('transform', {mode}) → TransformTool.activate(:59-88)
    gizmo.setMode + attach(选中集) + onDragEnd 回调注册

拖拽（runtime 层全程，零 Command）
  └─ GizmoImpl（TransformControls 封装，GizmoImpl.ts）
       dragging-changed(:233)：停/启 OrbitControls、快照 before、prepareObjectSnap
       objectChange(:255)：applyPreview ——
         单选：Renderer.applyGizmoPreview（Renderer.ts:601-611）直写根对象 transform
         实例化模型：instancedPool.update(id, t) 只写矩阵槽（所见即所得，锚点不在渲染树）
         多选(T7.5)：proxy=质心组枢轴，增量 D=proxyFinal∘proxyStart⁻¹ 合成到 N 目标
       吸附（同文件）：总开关 Ctrl XOR（:396）；网格 setTranslationSnap(:406)；旋转步进(:421)；
         对象吸附候选 collectSnapCandidates(:725)/snapFootprintToCandidates(:764) + AlignGuides 参考线；
         高度层 snapElevationDelta(:822)（候选层经 domain collectElevationSnapLevels 从 SceneData 派生）

松手提交（唯一 Command 点）
  └─ finishDrag(:548) → onDragEnd 回调（N 目标 N 次）
  └─ TransformTool.flushGesture(:117-131，微任务冲刷聚合)
       N=1 → TransformCommand(objectId, before, after) 一条
       N>1 → BatchCommand(N×TransformCommand) 一条
  └─ TransformCommand.execute 覆写 before 为 execute 时实际状态（事务语义 :37）
       → SceneManager.updateObject(id, {transform}) → object:updated{keys:['transform']}
       → Renderer.update → applySceneObjectState（region 根）或 pool.update（model 实例）
```

## D. 撤销

```
Ctrl+Z
  └─ app/input.ts:207-344 onKeyDown 路由（defaultPrevented/isEditableTarget 豁免）
       → facade.history.undo()（editor/history/HistoryManager.ts:43-52）
  └─ cmd = undoStack.pop() → cmd.undo(ctx) → redoStack.push
  └─ 以 CreateObjectCommand.undo 为例：SceneManager.removeObject(id)（幂等，对象不存在静默）
       emit object:removed + scene:changed
  └─ 组合根订阅联动（bootstrap.ts:516-518）：object:removed → selection.remove 同步清选中
  └─ SceneSync: object:removed → Renderer.detach(id)（Renderer.ts:566-582）
       map.delete + removeFromParent；instancedPool.detach（entries.splice 前移压缩+reindex+reconcile）
       model：只移除不 dispose（共享模板资源）；region：adapter.dispose(root)
         → disposeStyle（插件自建资源 + 材质归置：共享模板引用计数-1，归零才 dispose 模板本体）
         → geometry.dispose（几何归 RegionRenderer）
  └─ history:changed → store（canUndo/canRedo）→ 菜单/快捷键可用态
  └─ 下一帧渲染即移除（连续渲染，无需显式 invalidate）
```

Undo 对「已消失对象幂等重放」依赖 SceneManager 静默语义（updateObject 对不存在 id 静默忽略，`SceneManager.ts:78-80` 注释「命令重放必须对已删除对象幂等」）。

## 历史合并的真实实现位置（重要事实）

`Command` 接口**没有 merge/mergeInto 方法**（`Command.ts:16-29`）；HistoryManager 也无合并逻辑。连续操作合并为一条历史的实际机制全部在**工具层「会话批次协议」**：

| 场景 | 实现位置 | 机制 |
|---|---|---|
| 连续放置 | `PlacementTool.ts:240-274` | 每次提交先 `history.undo()` 弹出本会话批次 → 重建更大 BatchCommand 入栈 |
| 连续点绘制 | `DrawPointTool.ts:107-142` | 同上协议 |
| 多目标拖拽 | `TransformTool.ts:117-131` | 微任务冲刷聚合，一次手势 N 命令包一个 BatchCommand |
| 批量导入/对齐/阵列/批量编辑 | `importElements`（bootstrap.ts:178-184）/ `alignCommand`（alignArrayModel.ts:171）/ multiEditModel 各 batch*Command | 构造期一次打包 BatchCommand |

BatchCommand：execute 顺序执行、失败**逆序回滚**（`BatchCommand.ts:34-37`）；`HistoryManager.mergeBatch=false` 时按 getChildren() 展开逐条入栈（`HistoryManager.ts:31-33`）。

## 删除与 GPU 资源释放（对象生命周期终点）

- region：`detach` → `adapter.dispose(root)` → `disposeStyle(rec.instance)`（材质归置：独享直释 / 模板引用计数）+ `rec.geometry.dispose()`（`RegionRenderer.ts:135-142`）。
- model：只从池中摘除（splice+reconcile），**共享 geometry/material 不 dispose**——统一由 `AssetLoader.dispose` 释放（`Renderer.dispose` 顺序：instancedPool.dispose 先于 loader，`Renderer.ts:796-797`）。
- 实例矩阵缓冲：拆池/离开实例化形态时 `InstancedMesh.dispose()` 释放（`teardownPool`/`activateSingle`，InstancedAssetPool.ts:409-427）。
- undo 重建：CreateObjectCommand.redo 以**原 id** 恢复（`CreateObjectCommand.ts:28-47`）——渲染对象全量重建（无缓存复活机制）。
