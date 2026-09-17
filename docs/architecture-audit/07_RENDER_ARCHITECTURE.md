# 07 · 渲染架构（Three.js / GPU / Render Architecture）

> 从 Three.js 初始化开始追踪。核心文件：`src/runtime/Renderer.ts`（1,069 行渲染总管）。

## 初始化链（Renderer 构造，Renderer.ts:331-492）

```
new THREE.WebGLRenderer({ canvas, antialias: true })            # :336 WebGL2（three r186 默认）
  setPixelRatio(min(dpr,2)) / outputColorSpace=SRGBColorSpace
  shadowMap.enabled=true, type=PCFShadowMap（r186 适配 :340-341）
new THREE.Scene()                                                # :343
new THREE.PerspectiveCamera(50, aspect, near=1, far=10000)       # :350（深度比 10000:1，防 z-fighting 收敛）
new OrbitControls(camera, canvas)                                # :353-369
  手势重映射（UE/Unity 惯例）：LEFT=null（点选归工具层）/ MIDDLE=PAN / RIGHT=ROTATE
  maxPolarAngle < π/2（不钻地下）/ damping 0.08 / touches.ONE=null
scene ← envGroup（环境）+ contentGroup（业务对象拾取根）
applyEnvironment()：天空 CanvasTexture 渐变背景 + HemisphereLight + DirectionalLight
  （带 2048² 阴影，range ±160）+ 2000m 地面 Plane（polygonOffset 1/1 正偏置）+ GridHelper
  （y=0.02 抬升 + polygonOffset -1/-1 + onBeforeCompile 距离淡出 200→1000m）
```

## 对象分派与同步（事件驱动，非轮询）

- `SceneSync`（SceneSync.ts:29-53）订阅 `object:created/updated/removed`、`layer:updated`、`scene:changed(source==='clear')` → 翻译为 attach/update/detach/resyncAll/onLayerUpdated 回调（Renderer 注入实现）。**Renderer 获取 SceneManager 的方式 = 构造注入 + 事件驱动同步**。
- `Renderer.attach(obj)`（Renderer.ts:497-521）分派：
  - `type==='group'` → `NON_RENDERABLE_TYPES` 静默跳过（:256,503）；
  - `isModelObject` → `attachModel` → **InstancedAssetPool**（锚点脱离渲染树）；
  - 其余 → `RendererRegistry.get(obj.type)` 取 `ObjectAdapter`（默认注册表仅 `'region'`→RegionRenderer，RendererRegistry.ts:44-49；未注册类型 console.warn 跳过 :510-512）。
- `RuntimeObjectMap`：id↔Object3D 双向映射，`userData.objectId` 唯一允许内容；`findId` 沿父链上行供拾取定位根。

## 各子系统

### renderer / scene / camera / controls

- 三 WebGLRenderer 拓扑：主视口（Renderer.ts:336）+ 小地图（MinimapRenderer，独立 canvas/renderer/正交俯视相机 up=(0,0,-1)，~30Hz 节流）+ 轴指示器（AxesIndicator 88×88，每帧同步主相机四元数）+ 按需离屏快照 renderer（ThumbnailCache OffscreenSnapshotter）。
- **AGENTS.md 金丝雀警告的根源**：外部调试桥绑定最后创建的上下文 = 小地图——本项目自有约束，非代码缺陷（见 AGENTS.md T8.4 增补）。

### lights

- 环境预设四套（day/dusk/night/tech，Renderer.ts:126-175）：HemisphereLight + DirectionalLight（castShadow，shadow.bias -0.0004）。灯光 layer 开全层（分遍时内容遍仍需光照，:866-870）。

### materials / geometry / mesh

- region：wrapper Group（恒定根）→ StyleInstance.object（插件 Mesh/Sprite）——见 05 文档。
- 几何：GeometryBuilder + geometryBuilders.ts（ShapeGeometry 三角化 / 手写条带索引几何 / PlaneGeometry 锚点）；building 挤出几何由预设自建（ExtrudeGeometry）。
- model：AssetLoader 模板（GLB clone 或合并单几何）；InstancedAssetPool 渲染根 `__instanced_assets__`（:135）。

### render loop

- `RenderLoop`（RenderLoop.ts:86-102）：rAF **连续渲染**（有意决策，勿改按需渲染——AGENTS.md 硬约束）；帧异常兜底上报一次、连败 30 帧熔断、start/stop/dispose 幂等。
- 每帧（renderFrame :679-708）：syncCanvasSize（逐帧尺寸自检，第二通道）→ controls.update → vertexEdit.frame（屏幕恒定尺寸句柄）→ alignGuides.frame → measureOverlay.frame → 渲染（shaded 单遍 / 其余分遍）→ frameStats.tick → axesIndicator.render → minimap.render。
- 指标：`getViewportStats()` = 1s 滑动窗口 fps + renderer.info.render 快照（:744-750）。

### resize

- 双通道：ResizeObserver（bootstrap.ts:485-489）+ 逐帧自检 `ViewportResizePolicy`（幂等判定，布局未稳 300×150 时的错误比例帧会被下一帧纠正——StrictMode 双挂载防线，bootstrap.ts:476-489 注释）。

### picking / raycasting

- `RuntimeViewport`（services/RuntimeViewport.ts）：`pickObject`（:53，THREE.Raycaster → contentGroup → InstancedMesh 命中经 `resolvePick` 反查业务 id → map.findId 父链上行）；`groundPoint`（:69，射线交 y=0）；`surfacePoint`（:86，表面优先→地面兜底→>2000m 限距 null，测量工具用）；`pickInRect`（:108，包围盒 8 角屏幕投影框选）。
- raycaster.layers.enableAll()（:50，islands 诊断层兜底可拾）。
- Gizmo/顶点编辑各有独立 raycaster（仅命中句柄/辅助层）。

### postprocess

- **无后处理管线**（无 EffectComposer/Pass）。多效果经「分遍渲染 + overrideMaterial」达成（见渲染模式）。

### shader

- 自写 GLSL 五处（详见 01 §7 / 05 §10）：shader_test/grid/beam 预设、normals 诊断材质（含 USE_INSTANCING 分支）、网格距离淡出 onBeforeCompile。

### render target / WebGPU / TSL / WGSL / compute

- **当前项目未发现该能力**：无 WebGLRenderTarget 业务使用（仅缩略图离屏 renderer 内部隐含）、无 WebGPU、无 TSL、无 WGSL、无 compute shader。

### GPU resource lifecycle

- region detach：disposeStyle（模板引用计数/独享直释）+ geometry.dispose（RegionRenderer.ts:135-142）。
- model detach：只摘池槽，共享模板资源不释放；`Renderer.dispose` 顺序：pool.dispose（释放实例矩阵缓冲）→ loader.dispose（释放 GLB 模板 geometry/材质）→ renderModes.dispose → controls/renderer.dispose（Renderer.ts:778-802）。
- 环境：applyEnvironment 整组重建 + clearEnvironment disposeObjectTree + 背景纹理 dispose。
- **不调用 forceContextLoss**（StrictMode 双挂载共享上下文，历史冻结 bug，:773-777）。
- ContextLossWatchdog：丢失 console.error 一次（three 默认只 log 且静默空转）+ 恢复后强制重设尺寸立即重绘。

## 渲染模式（六态分遍）

`RenderModeState` + `composeRenderPasses`（RenderModeState.ts:86-97）：

| 模式 | 遍数 | 实现 |
|---|---|---|
| shaded | 1 | 常规（相机全层） |
| wireframe / xray / clay / normals | 3 | 环境(ENV_LAYER=2,带背景+阴影) → 内容(layer 0, overrideMaterial) → 辅助(AUX_LAYER=3) |
| islands | 4 | + DIAG_LAYER=4 亮遍（未归类 layerId===null 对象整树换层，一次性遍历不进帧路径） |

- 遍间 `autoClear=false` 共享深度缓冲；override 材质令牌制（primary/dim/highlight）由 RenderModeState 解析；**切换只改状态零材质遍历**（islands 例外换层）。
- Sprite 不被 overrideMaterial 覆盖（已知边界，applyIslandsLayer :929-931 注释）。
- 诊断档（clay/normals/islands）**会话级**：保存场景时组合根剥离 renderMode 键（bootstrap.ts:607-608）。

## 图层应用

- 可见性 = 对象 visible ∧ 图层 visible（effectiveVisible :952-955）；实例池按实例零缩放矩阵编码。
- 透明度乘算：材质基准（WeakMap 记忆）× layer.opacity（layerState.ts:19-44，含 Sprite；**材质数组（GLB 多材质组）跳过**；模型实例共享模板不做乘算）。

---

## 重点问题解答

### 当前到底是 WebGL 还是 WebGPU？

**WebGL（WebGL2，three r186 默认上下文）**。无 WebGPU/TSL/WGSL/compute 任何代码。

### Three.js 在项目哪一层出现？

仅 `src/runtime/**` + `src/app/**` + `src/main.tsx`（check:layers 白名单强制）。editor/ui/domain 等对渲染的全部引用经 **Port 接口**（声明在 `editor/services/ports.ts`，实现在 runtime，app 注入）。

### 是否存在统一 Renderer / RenderManager？

**是**：`runtime/Renderer.ts` 单类总管——对象同步、环境、渲染模式、图层、Port 实例族（viewport/cameraController/preview/gizmo/vertexEdit/alignGuides/measureOverlay/minimap/axesIndicator）全部在其构造中创建并持有。无独立 "RenderManager" 命名，职责即总管（头注「渲染总管」）。

### RegionObject 如何映射成 Three Object？

`SceneSync → attach → RegionRenderer.create`：GeometryBuilder 产几何 → createStyle 产 StyleInstance → **wrapper Group**（恒定根：预设/类型切换只换 wrapper 内子节点，RuntimeObjectMap/Gizmo/框选引用稳定）→ contentGroup。更新按 keys 精确分派（几何重建/实例换/参数改三路，见 05 §13）。

### ModelObject 如何映射成 Three Object？

`attachModel → InstancedAssetPool.attach` 返回**锚点**（脱离渲染树）入 RuntimeObjectMap；渲染走池（1=Mesh / ≥2=InstancedMesh）。变换更新 = `pool.update` 单槽写矩阵；Gizmo 拖拽预览同路（applyGizmoPreview :601-611）。

### Geometry 是否复用？

- region：**每对象独立 BufferGeometry**（GeometryBuilder 幂等纯函数每次新产出；shape 变更时旧几何 dispose 换新；类型/预设切换复用同一几何对象）。
- model：**同 assetId 全实例共享一份源几何**（单 Mesh 引用或多 Mesh 合并产物）；Ghost 独立 clone 共享引用（clone(true) 不复制几何数据）。
- 参数化重复形状（如 100 个同半径圆）无几何去重/缓存。

### Material 是否复用？

- 样式：**materialPool 按 presetId 共享模板**（默认参数形态；带覆写独享；写时复制提升）。同预设同默认参数的 N 个 region → 1 份材质。
- model：同 assetId 共享 GLB 模板材质（材质数组场景整体引用）。
- 环境材质：每次 applyEnvironment 整组重建（预设切换频率低）。

### InstancedMesh 如何分池？

按 `assetId` 一池（`pools: Map<string, AssetPool>`）；池内阈值分派（0/1/≥2）；容量翻倍只换矩阵缓冲；隐藏=零缩放矩阵；islands 诊断可拆双网格（暗/亮侧）。

### 删除对象时 GPU 资源是否释放？

**按归属精确释放**：region 几何（调用方）与独享材质即释，共享模板引用计数；model 池槽压缩即释实例矩阵相关缓冲（扩容缓冲随池/形态切换释放），GLB 模板**不随单对象删除释放**（常驻至 Renderer.dispose）。无泄漏路径证据（dispose 成对，测试覆盖）。

### Style 修改时是否重新创建 Geometry / Material？

- 调参（updateStyle）：**只改材质参数/uniform，几何不动、材质对象不换**（可能发生一次写时复制 clone）。
- 切预设/切类型：**样式实例重建（新材质），几何显式复用**（swapStyle 用原 BufferGeometry，RegionRenderer「解耦断言②③」）。
- 改 shape/line 宽度：**几何重建**（旧 dispose），材质不动。

### 当前最主要的性能瓶颈可能在哪里？

> 推断（基于结构分析，非实测瓶颈定位）：

1. **连续渲染 + 逐帧自检/controls.update**：恒定 rAF 渲染（有意决策）；大场景空闲仍耗 GPU——但这是产品决策不是缺陷。
2. **区域对象逐个 wrapper + 逐个几何**：每个 region 一个 draw call 级实体（共享材质减状态切换，但不合批）——数千区域时 draw call 压力上升（renderer.info.calls 已暴露监测）。
3. **glTF 多 Mesh 合并在加载期一次性完成**（好）；但**同 assetId 大模型 × 多实例共享 OK；不同 asset 各一池**，资产种类多时 InstancedMesh 数量 = 资产种类数（尚好）。
4. **islands/顶点编辑/参考线/测量覆盖层的 frame() 每帧调用**——均有 O(1) 早退（无激活零开销，头注注明）。
5. **图层透明度乘算遍历整树材质**（applyLayerToMembers 每次 layer:updated 遍历成员）——图层面板拖 opacity 松手才提交（README 口径），频率可控。
6. `SceneManager.getObjects()` 在 gizmo 吸附候选（getObjectIds）与高度层派生（getElevationLevels）中**每次拖拽帧全量过滤**（GizmoImpl 调用，Renderer.ts:433-440）——对象数大时拖拽帧成本线性增长（现状无 SpatialIndex 加速——`spatial/SpatialIndex.ts` 为无消费方占位）。

## 当前 GPU 能力等级

| 等级 | 能力 | 状态 | 证据 |
|---|---|---|---|
| Level 0 | 普通 Mesh | ✅ | 各处基础 Mesh |
| Level 1 | 共享 Geometry / Material | ✅ | materialPool 模板池（style）；AssetLoader 模板共享（model）；GLB 合并单几何 |
| Level 2 | Instancing | ✅ | InstancedAssetPool（≥2 同资产合批，单 Draw Call；动态矩阵槽更新 DynamicDrawUsage） |
| Level 3 | Shader Procedural | ✅（局部） | ShaderMaterial 预设 3 套（grid/test.shader/beam）+ normals 诊断 + onBeforeCompile 注入；**但无时间推进（uTime 恒 0，见 05）、无程序化纹理/散布** |
| Level 4 | GPU Compute / GPU Scatter | ❌ | 当前项目未发现该能力 |
| Level 5 | GPU Culling / Indirect / LOD | ❌ | 当前项目未发现该能力（LOD 在 CONTRACTS 明确排除项；无 indirect draw；剔除走 three 内建视锥剔除） |

**综合判定：Level 2（Instancing）为主，Level 3 具备受限形态（静态 ShaderMaterial 可挂载、无动画/散布管线）。**
