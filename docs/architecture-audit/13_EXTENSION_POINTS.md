# 13 · 未来扩展点分析（Extension Points）

> 针对三个未来方向做**现状分析**（只分析、不实现）。每条结论区分【当前事实】与【推断/建议】。

---

## 方向 A：Procedural Style（草地/沥青/水泥/砖石/森林/花坛/水面）

目标形态：`Style → Generator → GPU Shader / Instancing / Scatter`。

### 当前可复用的地基【当前事实】

1. **插件契约已容纳 Shader**：`StylePresetBuild = (geometry, params) => StyleInstance`（types.ts:26）——shader_test/grid/beam 三套 ShaderMaterial 预设证明任意 shader 可挂载且参数经 update 只改 uniforms（engine.test.ts:469-493 锁定）。
2. **参数体系完备**：`StyleParameter` 四控件类型（color/number/boolean/select）+ 钳制/回退解析 + overrides 覆写 + 运行时切换（05 §14）——密度/种子/风速类参数零改动可用。
3. **双轨注册天然支持新增**：新 preset 文件放入 `src/runtime/styles/<分类>/` 即被 import.meta.glob 收割——meta 自动进 UI、build 自动可路由（routes.ts:120-122），**零注册代码**。
4. **降级安全网**：预设缺失/形状不支持/build 抛错 → default_solid + Toast（engine.ts 三路降级）。
5. **图层/诊断/序列化全部兼容**：场景只存 presetId+overrides（加载即重建）；诊断 override 分遍对 ShaderMaterial 同样生效（RenderModeState）。

### 表面着色型（草地纹理/沥青/水泥/砖石 shader）——最顺路径【推断】

新 preset + ShaderMaterial（程序化噪声/棋盘格/砖纹 fragment shader），params 驱动 uniforms。**引擎零改动**。唯一注意：带 overrides 的实例独享材质（D2）——同类大面积使用同参数时应保持默认参数或接受材质数增长。

### 散布型（森林/花坛 = 区域上散布实例）——需基础设施【推断】

当前缺口（05/12 文档 D1-D3）：
1. 插件根对象可为 Group（契约允许）但「Group 根不参与模板共享」（types.ts:17）——插件可自建 InstancedMesh 并在 dispose 释放（授权规则 1 允许「子对象、渲染目标等」）。**最小可行路径：插件内自管 InstancedMesh**，不动引擎；代价是不享受 materialPool 且需自写随机散布（seed 参数）。
2. 散布源（树模型）从哪来？插件 build 签名无资产访问权——需要：a) 引擎在 params 注入资产源（类比 semantic 保留键，新增保留键如 `assets`）；或 b) 散布型样式改走「Style 引用 Asset」数据模型（方向 C）。**这是方向 A 与 C 的交汇点。**
3. 时间动画（水面流动）：需给 StyleInstance 增可选 `update(dt)` 或 RenderLoop 注册回调——当前无此通路（uTime 未接线教训，A2）。

### 最适合的扩展点排序【推断】

1. `StylePresetBuild` 插件文件本身（表面着色型，零改动）；
2. `StyleInstance` 契约扩展（可选 tick/update(dt) + 保留键资产注入）；
3. 引擎级 scatter 实例池（若要共享散布几何——可复用 InstancedAssetPool 的形态分派/矩阵槽/拾取反查设计，按「presetId+assetId 组合键」分池）。

---

## 方向 B：Procedural Asset（Tree_A/Tree_B/Bush_A/Lamp_A/Bench_A）

目标形态：`Asset Browser → 选择 → Ghost → 放置 → Instance`——即程序生成几何顶替 GLB 文件，其余链路不变。

### 当前链路的「静态 GLB 假设点」盘点【当前事实】

| 环节 | 现状 | 对程序化资产的态度 |
|---|---|---|
| 定义（ModelAsset） | `file: string` 指向 .glb；manifest 校验必填 file | **唯一强绑定点**：需新增资源形态字段（如 `generator`/`kind`）或 file 协议约定 |
| 注册（AssetRegistry） | 纯元数据，不关心来源 | 兼容——注册表对 file 无语义 |
| 浏览/搜索/标签/收藏（browserModel） | 纯元数据操作 | 兼容 |
| 缩略图 | SVG 占位 → OffscreenSnapshotter 离屏渲染 GLB 实例 | 需扩展快照源（renderer 已具备渲染任意场景对象能力） |
| Ghost | PreviewManager.showGhost → assetLoader.instantiate（GLB clone） | 需 instantiate 分派程序化分支 |
| 放置（PlacementTool→ModelObject） | 只写 assetId+transform | **完全兼容**（引用间接性收益） |
| 渲染（InstancedAssetPool） | `InstanceSourceProvider = (assetId) => Promise<InstanceSource>` 注入接口（InstancedAssetPool.ts:26-27，Renderer.ts:385 注入 loader.loadInstanceSource） | **最佳接入点**——provider 已是依赖注入，换实现零池改动 |
| 池形态分派/矩阵槽/拾取 | geometry+material 源无关 | 兼容（程序生成几何天然单 Mesh，契合合并管线） |

### 最自然接入点【推断】

**一个「程序化源 provider」并列于 AssetLoader**：按 assetId 查 ModelAsset 的 generator 字段 → 程序构建 BufferGeometry+Material → 返回 InstanceSource。Renderer 构造处把两源合并注入（bootstrap 装配层改动 ~10 行级）。Ghost 与缩略图各需一个分派点（instantiate/snapshot）。

### 需要扩展的模块清单【推断】

- `ModelAsset`：资源形态字段（generator/params 默认值）+ manifest schema version 升级；
- `AssetLoader.instantiate` / `loadInstanceSource`：按形态分派；
- `ThumbnailCache` 生产者：程序化渲染快照；
- （可选）`ModelObject`：实例参数位（D5）——若需每实例随机变体；变体渲染需池内 per-instance attribute（当前矩阵 16 float 之外无自定义 instanced attribute 通路——InstancedMesh 本身支持 `setColorAt`/instanced attributes，池未暴露）。

### 不适合继续扩展的地方【推断】

- 把生成参数塞 `ModelAsset.metadata`（自由字段 UI/渲染均不消费——影子通道）；
- 绕过 InstanceSourceProvider 直接在 InstancedAssetPool 加特判（破坏「池不感知来源」的现有边界）。

---

## 方向 C：Style 引用 Asset（Natural Forest = Oak 40% + Pine 20% + Bush 30% + Flower 10%）

目标形态：`Style → Asset References → Scatter Rules`——区域对象经样式系统引用多个资产按规则散布。

### 当前架构支持度分析【当前事实】

- **RegionStyle 只有 `{presetId, overrides}`**（RegionObject.ts:43-47）——无 asset 引用位、无规则位。
- **样式与资产系统当前零连接**：runtime/styles 不 import loaders/instancing（依赖图确认）；引擎参数通道只有保留键 `semantic`。
- **但两侧地基都有「组合规则」的先例形态**：样式参数表（StyleParameter[] 数组结构）与资产 tags/分类筛选；InstancedAssetPool 已解决「多实例同源合批 + 拾取反查 + 增删矩阵槽」的全部运行期难题——散布本质是「一个 region 派生 N 个虚拟放置」。

### 实现该方向的三个候选挂点【推断】

1. **预设元数据携带（UI 无感型）**：StylePresetMeta.defaultParams 增加 select/asset 类参数（值=assetId）+ 规则参数（密度/权重表）。序列化零变化（overrides 已自由 Record）。**优点：改动最小；缺点：规则表达力受参数表单限制，多资产权重表难以用现有控件表达。**
2. **RegionStyle 扩展引用结构（数据模型型）**：`style.assets?: Array<{assetId, weight, ...rules}>`——需要：RegionObject 类型扩展 + SceneSerializer 校验放宽（D6，group 增量放行先例）+ Inspector 新分组 + 渲染消费端。**表达力完整，改动面最大。**
3. **独立 ScatterObject 第四对象类型（对象模型型）**：新增 `type:'scatter'` 对象（region 面积源 + 资产规则）——走 RendererRegistry 注册新 adapter（正是注册制设计的扩展路径：`register('scatter', adapter)`，RendererRegistry.ts:30-36）。**优点：不污染 region 三层契约、撤销/序列化复用基座；缺点：新对象类型的全套成本（命令/面板/大纲）。**

### 方向 C 与 A/B 的复用关系【推断】

- 散布运行期直接复用方向 B 的程序化源 provider + InstancedAssetPool（按 assetId 分池天然支持多资产混布——每资产一池恰好对应权重表）；
- 撒点算法（泊松盘/抖动网格 + 种子）放 domain 纯函数（对齐 elevationLevels/footprint 先例，可单测）；
- GPU scatter（compute 生成变换）在当前 WebGL 无 compute 约束下不可行——CPU 撒点 + GPU instancing 渲染即达 Level 2+，GPU Scatter（Level 4）需 WebGPU，属架构外跃迁。

---

## 五问总结

### 1. 当前哪些模块可以直接复用？

- 双轨注册（routes + StylePresetRegistry）、参数解析（params.ts）、材质模板池、降级安全网、RegionRenderer 换装管线（方向 A 表面型全部直接复用）；
- InstanceSourceProvider 注入接口、InstancedAssetPool 全部机制、Ghost/放置/拾取链路（方向 B 渲染端直接复用）；
- AssetRegistry/浏览器/搜索/标签/收藏（B/C 元数据端直接复用）；
- domain 纯函数先例（散布算法的归宿形态）、RendererRegistry 注册制（新对象类型入口）。

### 2. 哪些模块需要扩展？

- `StyleInstance` 契约（tick/资产源注入——A 动画与散布）；
- `ModelAsset`/manifest schema（资源形态字段——B）；
- `AssetLoader.instantiate`/ThumbnailCache（程序化分派——B）；
- `RegionStyle` 或新对象类型（引用结构——C）；
- SceneSerializer 校验（新字段/新类型放行——C）。

### 3. 哪些模块设计上不适合继续扩展？

- **materialPool 的「presetId 单键无参数维度」**：设计裁定（materialPool.ts:8-12）明确「带覆写实例从不入池」——程序化样式普遍带参时该池自动退化为空转；不适合原地加 params 签名（键空间爆炸），适合换「ShaderMaterial 共享 + per-instance uniform」新机制；
- **CommandRegistry 的 `(data:any)` 工厂**：未消费且弱类型——新命令继续直接 new 即可，不建议向注册表靠拢；
- **`shape.options` 自由 Record**：不适合继续塞散布规则（无 schema 影子通道）；
- **Layer.order/SceneEnvironment 开放键**：网格/渲染模式先例证明环境通道可承载视口态，但**不应**承载散布规则等对象级数据（作用域错配）。

### 4. 哪些数据模型可能需要调整？

- `RegionStyle`（asset 引用位——方向 C 候选 2/3）；
- `ModelObject`（实例参数位——方向 B 变体需求时）；
- `ModelAsset`（generator 字段——方向 B）；
- `StyleParameter`（若需 asset 引用型控件——C 候选 1）；
- EventMap（散布预览/进度类事件，若做异步生成）。

### 5. 哪些地方是未来 GPU Procedural 的最佳接入点？

1. **`StylePresetBuild` 插件层**（表面 shader——即刻可用）；
2. **`InstanceSourceProvider` seam**（程序化几何源——注入接口已就位）；
3. **RenderLoop/StyleInstance tick**（时间维度——当前缺口，uTime 教训）；
4. **InstancedMesh per-instance attribute 通路**（变体着色/缩放——池层小扩展）；
5. **WebGPU/TSL 为零基础**——任何 Level 4（compute scatter）路线都是新渲染后端引入，不属于「扩展」范畴（当前 Renderer 构造硬编码 WebGLRenderer，Renderer.ts:336；无抽象渲染后端接口）。

---

## 风险提示（承接 12 文档 D 系列）

按「最小阻力路径」演进时，最先撞到的墙依次是：**材质数膨胀**（D2，参数化样式普及）→ **散布无基础设施**（D3）→ **数据模型无引用位**（D4）→ **格式校验 fail-fast**（D6）。建议在动工前先定「Style 引用 Asset」的数据模型归属（C 候选 1/2/3 三选一），因为它决定 A/B 两侧接口的形状。
