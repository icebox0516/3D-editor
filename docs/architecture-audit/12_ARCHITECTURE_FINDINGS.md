# 12 · 问题与风险地图（Architecture Findings）

> 基于真实代码的审计发现。分级：P0（阻断/严重错误）／P1（违背声明不变式或用户可感缺陷）／P2（功能缺口/潜在风险）／P3（低危技术债）。**未发现 P0**。每条附证据与影响范围；不为凑数立项。

## A. 明确存在的问题（当前即成立）

### A1 · 图层新建/删除绕过 Command、不可撤销 —— P1

- **证据**：`src/ui/panels/OutlinerPanel.tsx:1062-1077`（addLayer 直调 `facade.scene.addLayer`）、`:1084-1087`（removeLayer 直调 `facade.scene.removeLayer`）；注释自述「任务书授权，P0 不可撤销」。
- **对照声明**：`README.md:145`「一切可见修改经 Command（可撤销重做）」；CONTRACTS #4 同。图层合并有 MergeLayerCommand（可撤销），新建/删除没有。
- **影响**：用户删除图层（成员全部落未分层）后 Ctrl+Z 无法恢复；「一切可撤销」的产品承诺存在反例。属**授权例外**而非 bug，但与文档不变式冲突，应视为已知边界显式化。

### A2 · uTime 动画钩子未接线（文档-代码不一致）—— P2

- **证据**：`shader_test.preset.ts:10` 头注称 uTime「渲染循环驱动（T6.4 接线）」，但全仓 grep 无任何推进 uTime 的代码（Renderer/RenderLoop 零命中）；`tests/runtime/styles/engine.test.ts:493` 只断言「uTime 归渲染循环、不受参数影响」，同样不驱动。uniform 恒 0，波纹静止。
- **影响**：样式系统「动画能力」现状为占位；water.dynamic 的 flowSpeed 同理「仅数据保存」（该文件头注已诚实声明）。若未来做动态水面，会误以为钩子已通。

### A3 · 模型对象的图层透明度不生效 —— P2

- **证据**：`Renderer.ts:945`「模型克隆/实例共享模板材质，不做图层透明度乘算」；`layerState.ts` 乘算只对 region 树生效。
- **影响**：用户把「模型」图层透明度调低，视口中模型不变化——功能缺口，代码注释自认（共享模板材质的写时改造代价）。

### A4 · 多材质数组（GLB 多材质组）透明度乘算跳过 —— P2

- **证据**：`layerState.ts:17`「材质数组（GLTF 多材质组）跳过（沿旧要素现状语义）」；`layerState.ts:41-43` 实现中 `Array.isArray(material) return`。
- **影响**：带多材质的 GLB（合并管线产出材质数组的资产）设为半透明图层时无效果——与 A3 叠加形成「region 生效、部分 model 不生效」的不一致观感。

### A5 · 死事件：`style:changed` / `asset:registered` 无生产消费者 —— P3

- **证据**：EventMap 定义（`events.ts:70-71`）；`style:changed` 仅 ChangePresetCommand 发出、`asset:registered` 仅 io 灌注时发出；生产代码订阅方为零（渲染走 object:updated keys 驱动，不依赖 style:changed）。
- **影响**：契约面与实际数据流不符，新读者会误以为样式渲染依赖该事件。

### A6 · 注释/文档级陈旧 —— P3

- `SceneObject.ts:11` 仍写「element_ / model_ / scene_ 前缀」——`element_` 已随 v1 删除（CONTRACTS #7 勘误）。
- `README.md:3`「六层单向依赖架构」——CONTRACTS/check:layers 实为九层（措辞残留，非行为差异）。
- ObjectAdapter.ts 头注提及「ElementRenderer 体系覆盖六类要素」——该体系已删除（文件内无此引用，头注 :10-12 陈旧）。

## B. 潜在架构风险（条件触发）

### B1 · 环境预设双表同键约定耦合 —— P2

- **证据**：`app/bootstrap.ts:117-123`（id+label）与 `runtime/Renderer.ts:126-175`（id+渲染参数）两张表靠相同 id 字符串约定同步，无编译期约束（id 为普通 string）。
- **影响**：新增/改名环境预设需改两处；漏改一侧静默回退 day（`ENVIRONMENT_PRESETS[env.preset] ?? day`，Renderer.ts:809）。触发条件：低频（预设稳定），故 P2 低位。

### B2 · 历史栈无上限 + deepClone 快照 —— P2

- **证据**：`HistoryManager.ts:18-19` 双栈无 limit；命令构造普遍 deepClone（CreateObjectCommand 构造快照、ChangePropertyCommand 存整个 properties 深拷贝）。
- **影响**：长会话大量编辑（尤其阵列一次 N 份、批量导入大场景）内存单调增长；现状无释放策略。触发条件：超长会话/超大场景。

### B3 · 拖拽帧全量对象扫描，SpatialIndex 未接线 —— P2

- **证据**：Gizmo 吸附候选与高度层派生每次调用 `sceneManager.getObjects()` 全量过滤（`Renderer.ts:433-440` getObjectIds/getElevationLevels，GizmoImpl 拖拽帧消费）；`runtime/spatial/SpatialIndex.ts` 为无消费方占位（头注 :10 自述）。
- **影响**：对象数数千级时移动拖拽帧成本线性上升（吸附候选 O(n) 足迹计算）。现状规模（园区级）可接受；资产散布类扩展会放大。

### B4 · check:layers 正则解析 import —— P3

- **证据**：`scripts/check-layer-deps.mjs:78-81` 自述「正则即可，无需 AST」。覆盖静态 import/动态 import/require，但理论上可被字符串拼接动态导入绕过。
- **影响**：守护脚本的完备性依赖正则模式；现状仓库无绕过写法，风险低。

### B5 · UI store 模块级单例 —— P3

- **证据**：`ui/store.ts:165-167`「模块级单例：同一时刻只绑定一个编辑器实例」。
- **影响**：同页多编辑器实例（如嵌入预览）不可行——现状产品形态单编辑器，无实际损害。

### B6 · 多 Mesh GLB 合并压平子结构 —— P3

- **证据**：`AssetLoader.extractInstanceSource`（:119）对多 Mesh 烘焙 matrixWorld 后 mergeGeometries 单几何，材质数组保留；不可合并回退首 Mesh。
- **影响**：依赖节点层级动画/独立子材质状态机的 GLB 被静态化。对静态园区资产是合理取舍（T5.9 决策），构成资产类型的隐性约束。

### B7 · 第四个按需 WebGL 上下文 —— P3

- **证据**：`ThumbnailCache.OffscreenSnapshotter`（:209）懒建独立小 renderer（128×96）。
- **影响**：浏览器 WebGL 上下文总量有限（典型 ~16）；单编辑器仅 1 个快照上下文 + 3 常驻，安全。多实例/嵌入场景需注意。

## C. 当前可接受的技术债（明确记录，无需立即处理）

| # | 项 | 证据 | 说明 |
|---|---|---|---|
| C1 | SpatialIndex 占位无消费 | `spatial/SpatialIndex.ts:10` 头注 | 预留 BVH/四叉树替换点，自述占位 |
| C2 | SceneExporter 薄壳 | `SceneExporter.ts:15-17` 直委托 serialize | 与保存同构，「导出」语义留位 |
| C3 | CommandRegistry 装配未消费 | bootstrap:637-688 注册 15 type；生产零 `create()` 调用 | 扩展点设施；`(data:any)` 签名弱 |
| C4 | `shape.options` 自由 Record 无 schema | `RegionObject.ts:31-32` | 参数化缓存按约定写入，无类型约束 |
| C5 | 一次命令修改触发两次 scene:changed | `store.ts:19-21` 注释自认 | 版本号递增幂等，多一次重渲染无害 |
| C6 | 语义层高 defaultBaseHeight 写入 shape 层 | semanticDefinitions / createRegionObject | 三层解耦的文档化破例（高度合成规则需要） |
| C7 | toolIA.ts 单文件 ~1100 行多职责 | 02/08 文档 | 工具表+快捷键+模式+上下文矩阵集中；有测试锁定 |
| C8 | undo→redo 渲染对象全量重建 | CreateObjectCommand.redo 原 id 恢复 → attach | 无缓存复活机制；园区规模可接受 |
| C9 | 中文资产 id（asset_建筑1） | assets/manifest.json | 功能正常，跨系统互操作时可能需转码注意 |
| C10 | 顶/正/侧机位为固定方位角透视（非真正交） | `CameraController.ts:6-7` 头注自述 | 有意简化，无正交投影需求 |
| C11 | islands 模式 Sprite 不被 override 覆盖 | `Renderer.ts:929-931` 注释 | 已知边界沿承 |

## D. 后续扩展时可能产生的问题（面向 Procedural Style / Asset，详见 13）

| # | 问题 | 证据 | 影响 |
|---|---|---|---|
| D1 | **样式系统无时间推进通路**——uTime 占位未接线、无实例 tick 协议 | A2；engine/types 无 update(dt) | GPU Procedural 动态样式（流动水面/生长）第一缺口 —— P2 |
| D2 | **materialPool 无 params 签名维度**——带覆写实例从不入池 | `materialPool.ts:8-12` 头注裁定 | 程序化样式普遍带参数时材质数=对象数（uniform 差异本可共享 ShaderMaterial）；且写时复制 clone 会丢 uniform 值外的自定义（如 onBeforeCompile 注入需重建）—— P2 |
| D3 | **Style 无散布/实例化输出能力**——契约单 geometry 单实例、Group 根自管材质不参与共享 | `types.ts:6-19` 授权规则 | 「森林=区域上散树」类样式无基础设施；需新实例池或放宽插件根对象契约 —— P2 |
| D4 | **RegionStyle 无 Asset 引用位**——style 仅 presetId+overrides | `RegionObject.ts:43-47` | Style→Asset References（Natural Forest=40% Oak…）需新数据模型字段与序列化扩展 —— P2（扩展前） |
| D5 | **ModelObject 无实例参数位**——仅 assetId+transform | `ModelObject.ts:8-10` | Procedural Asset 每实例变体（种子/高度范围）无承载处 —— P3 |
| D6 | **deserialize 强校验 region 三层齐备**——新增第四层（scatter 规则）会被 fail-fast 拒绝 | `SceneSerializer.ts:47-84` | 格式扩展需同步放宽校验 + 版本策略（group 增量放行先例可循）—— P3 |
| D7 | **InstanceSourceProvider 无参数签名**——(assetId)→Promise 固定源 | `InstancedAssetPool.ts:26-27` | 程序化资产按参数生成源需扩展 provider 签名（接入点本身是注入接口，改动局部）—— P3 |

## 汇总

- P0：无。
- P1：1 项（A1 图层命令例外）。
- P2：A2/A3/A4 + B1/B2/B3 + D1-D4（扩展前瞻）。
- P3：其余。

**总体判断**：架构纪律执行度高（分层守护脚本 + 注册制 + 命令覆盖 + 测试 1989 基线），现存问题多为「授权例外未文档化」与「面向未来的能力缺口」两类，无阻断性缺陷。
