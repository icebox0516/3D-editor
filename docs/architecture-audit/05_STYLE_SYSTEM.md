# 05 · 样式系统（Style System）

> 本文是后续讨论「程序化样式（Procedural Style）」的核心依据。全部结论来自 `src/runtime/styles/`、`src/registries/StylePresetRegistry.ts`、`src/domain/` 实际代码。

## 系统全貌：双轨注册 + 引擎托管

```
                      ┌─── 元数据轨（UI 可见）─────────────────┐
 *.preset.ts 插件文件  │  export const meta: StylePresetMeta    │
 (src/runtime/styles/ │ （id/name/category/thumbnail/          │
  <分类>/<名>.preset.ts)│   supportedShapes/supportedSemantics/ │
        │              │   defaultParams: StyleParameter[]）    │
        │ import.meta.glob eager 扫描（routes.ts:120-122）      │
        ├──────────────────────────────────────────┬───────────┘
        │                                          │
        ▼                                          ▼
 runtime/styles/routes.ts                 app/bootstrap.ts:359-367
 （构建路由表 presetId→build，             收割 meta 注册进
   含 seam registerBuildRoute）            registries/StylePresetRegistry
        │                                          │
        ▼                                          ▼
 runtime/styles/engine.ts                 ui 读元数据唯一途径
 （createStyle/updateStyle/disposeStyle   （预设列表/参数表单生成）
   + materialPool 材质模板池）
```

- 「双轨」原因：DAG 禁止 registries→runtime（注册表永不含构建函数，`StylePresetRegistry.ts:12-13`），也禁止 ui→runtime（UI 经 facade.registries.presets 读元数据，`EditorFacade.ts:32`）。
- 一致性守门：`diffPresetConsistency`（routes.ts:100-110）——meta 有 build 无 → UI 灰显 + Toast；build 有 meta 无 → 不注册不暴露。`isPresetBuildable(id)` 为 UI 灰显判定（:93）。

## 1. 类型定义

- **`StylePresetMeta`**（`src/registries/StylePresetRegistry.ts:23-36`）：见上图。`id` 为命名空间键（如 `'water.standard'`），**非 createId 实例前缀体系**；例外 `default_solid`（T6.1 钉死，`semanticDefinitions.ts:56`）。
- **`StyleParameter`**（`src/domain/styles/StyleParameter.ts:12-23`）：`{key,label,type:'color'|'number'|'boolean'|'select',default,min?,max?,step?,options?}`——语义参数与样式参数**共用同一形态**。
- **`StyleInstance`**（`src/runtime/styles/types.ts:11-24`，强制统一返回契约）：

```ts
interface StyleInstance {
  object: THREE.Object3D;        // 根渲染对象（Mesh/Line/Points；Group 根不参与模板共享）
  material: THREE.Material;      // 主材质（引擎可能换绑）
  presetId: string;
  supportedShapes: ShapeType[];
  update(params): void;          // 只改参数/uniform，禁止重建几何
  setGeometry(geometry): void;   // 形状变更后几何重绑（旧几何不释放，归调用方）
  dispose(): void;               // 只释放插件自建辅助资源
}
type StylePresetBuild = (geometry: THREE.BufferGeometry, params: Record<string, unknown>) => StyleInstance;
```

- **`StylePresetPluginModule`**（types.ts:27-31）：插件文件导出形态 `{ meta?, build? }` 同文件。

## 2. Style Registry 与 Preset 注册方式

- `StylePresetRegistry`（registries 层）：register（重复抛错）/get/list/find(shape×semantic 双维过滤，:55-61)。
- `routes.ts` 构建路由（runtime 层）：`registerPresetModule`（glob 与测试共用，:43-66）+ seam `registerBuildRoute/unregisterBuildRoute`（:75-85，测试/动态注册不依赖文件扫描）。
- 装配：bootstrap 启动时 `collectPresetPluginMetas()` eager 收割 → 逐个 register（重复 id 经 `app:notify` 告警跳过，`bootstrap.ts:360-367`）。

## 3. 当前有哪些 Style（24 套，全量清单）

24 个 `*.preset.ts` 文件（`ls src/runtime/styles/*/*.preset.ts` 实测；README「21 套」为 T6.3 新交付口径，测试 `matrix.test.ts:23` 明确「24 套 = 21 新 + 3 既有」）：

| 分类 | 预设 | 特征（代码可见） |
|---|---|---|
| base(6) | `default_solid` | 兜底基线，MeshStandardMaterial，color/opacity；全形状×全语义（default_solid.preset.ts） |
| | `default_wireframe` | 线框 |
| | `flat` | 纯色 |
| | `grid` | **ShaderMaterial** 世界 XZ 网格线（grid.preset.ts:32） |
| | `holo` | 全息 |
| | `test.shader` | **ShaderMaterial + uTime 动画钩子**（shader_test.preset.ts:33-60） |
| building(2) | `building.default` / `building.modern` | **几何生成型**：轮廓提取 + ExtrudeGeometry 挤出（buildingExtrude.ts:35-37 extractOutlineLoop + extrudeOutline），读 `params.semantic.height` |
| grass(3) | `landscape/lawn/tech` | 面材质 |
| parking(2) | `standard/tech` | |
| plaza(3) | `paving/stone/tech` | |
| poi(3) | `beam`（**自建 CylinderGeometry** + ShaderMaterial，beam.preset.ts:4,43）/ `billboard`（Sprite + DataTexture 像素生成）/ `marker` | |
| road(2) | `standard/asphalt` | 条带几何面材质 |
| water(3) | `dynamic`（flowSpeed 参数**仅数据保存**，零时间动画纪律，dynamic.preset.ts:6-7,64）/ `standard/tech` | |

## 4. Style 与 semantic 的关系

- **元数据过滤**：`supportedSemantics` 参与 `find(shape, semantic)` 过滤（UI 显示用），**不参与引擎校验**（engine.ts:70 注释「supportedSemantics 为 UI 过滤显示用，不参与引擎校验」）——任何预设可被任何语义对象使用（若 UI 不拦截）。
- **默认绑定**：语义定义携带 `defaultPresetId`（十类各一，`semanticDefinitions.ts:56-122`）——赋类型时命令重置样式；`bare_land` 无专属预设保持 default_solid。
- **参数通路**：引擎把 `semanticProperties` 以**保留键 `semantic`** 并入 build 参数（engine.ts:74-77）——building 预设读 `params.semantic.height` 挤出。用户覆写**不得伪造**该键（`omitReserved` 剥离，engine.ts:44-48）。

## 5. Style 与 shape 的关系

- `supportedShapes` 参与**引擎创建前校验**：不命中 → 降级 default_solid + Toast（engine.ts:66-69）。
- 面类预设声明 `SURFACE_SHAPES`（presetShapes.ts 派生常量）；point 形状产 0.3m 锚点四边形（`POINT_ANCHOR_SIZE`，GeometryBuilder.ts:35）保证通用预设可见。

## 6. 参数覆写机制（解析管线）

`runtime/styles/params.ts:44-56 resolvePresetParams(defaultParams, overrides)`：

1. overrides 命中且类型匹配 → 生效（number 按 [min,max] 钳制）；
2. 类型不符 → 回退默认值（垃圾值不流入材质）；
3. 默认值同样钳制；未在参数表声明的键一律忽略；保留键 `semantic` 不在此处理。

插件内部另有双保险 `readColor/readNumber`（presetHelpers.ts:11-18——防直接调用/无 meta 透传场景）。

## 7. Style → Three.js 表现的转化（引擎三入口）

`runtime/styles/engine.ts`：

- **createStyle(geometry, shapeType, semanticType, presetId, overrides?, semanticProperties?)**（:57-100）：
  路由缺失/形状不支持/build 抛错 → 三路降级 `buildFallback`（default_solid 静态直连 + Toast，:103-109，不崩溃）→ 材质策略 `applyMaterialPolicy`（:88-97）：有效覆写非空 → 独享材质；否则 → 共享模板（首个实例材质即模板，后续弃新绑模板）。
- **updateStyle(instance, params)**（:139-160）：增量合并（本次合并到上次覆写之上）→ 重新解析 → 共享实例先**写时复制提升**（promoteToClone :110-117，克隆模板 + 引用计数-1）→ `instance.update(resolved)`。
- **disposeStyle(instance)**（:167-187）：插件自建资源 → 材质归置（模板引用计数-1，归零 dispose 本体 / 独享直释）；**几何恒不释放**（归调用方）。

### 资源归属（插件授权规则，types.ts:6-19 ——引擎托管的核心纪律）

1. **材质生命周期归引擎**：同预设多实例共享模板（materialPool）；带覆写独享；update 写时复制。插件 update() 必须读「当前」材质（引用 instance.material，勿闭包捕获）；dispose() 不得释放材质与传入几何。
2. **几何归调用方**（RegionRenderer 创建并拥有 BufferGeometry）；createStyle 传入、setGeometry 重绑。
3. 根对象须 Mesh/Line/Points（有 material 槽位）；Group 根自管材质不参与共享。
4. update() 只改参数/uniform，禁止重建几何；形状变更走 setGeometry。

## 8. Material 如何创建 / 是否复用

- 每个插件 build 内自行 `new THREE.MeshStandardMaterial / ShaderMaterial / SpriteMaterial`。
- **复用机制 = materialPool 模板池**（materialPool.ts）：缓存键**仅 presetId、无 params 签名维度**——模板恒为默认参数形态；带 overrides 的实例从不入池（:8-12 头注裁定）。引用计数，最后一个实例释放才 dispose 模板（:45-58）。
- 写时复制：共享实例改参数前 `template.material.clone()` 提升为独享（engine.ts:110-117）——保证共享模板永不被单对象改写。

## 9. Geometry 是否创建

- **引擎与多数插件不创建几何**——几何由调用方（RegionRenderer 经 GeometryBuilder）创建传入。
- **例外（几何生成型预设）**：building 两套从传入三角网提取轮廓后 `ExtrudeGeometry` 自建挤出几何（插件自建独占，height 变化/setGeometry 时重建并释放旧挤出几何，buildingExtrude.ts:20-22）；poi.beam 自建 CylinderGeometry；poi.billboard Sprite。
- GeometryBuilder（runtime/geometry/GeometryBuilder.ts）按 shape.type 分派：面类→`polygonSurfaceGeometry`（ShapeGeometry 三角化+rotateX）；line→`centerlineRibbonGeometry` 条带（读 semantic.width）+ 沿中心线 UV；point→PlaneGeometry 锚点。

## 10. Shader 使用情况

见 01 文档 §7：ShaderMaterial 用于 grid/test.shader/beam 三预设 + 诊断 normals 模式；onBeforeCompile 用于网格距离淡出。uTime 动画钩子存在且由渲染循环驱动（shader_test），但**引擎无普遍的实例 tick 通路**——除 shader_test 的 uTime 外，预设没有每帧更新机制（dynamic.preset 头注「零时间动画纪律」明确 flowSpeed 仅存数据）。

## 11. 程序化纹理

- 无图片纹理预设（无 PBR 贴图、无程序化噪声纹理材质）。
- CanvasTexture/DataTexture 仅用于：天空背景、轴标签、测量/绘制文字 sprite、poi.billboard 像素生成——均为**辅助 UI 类纹理**，非表面材质纹理。

## 12. 实例化

- 样式系统自身**不做实例化**——InstancedMesh 仅用于 ModelObject 资产池（InstancedAssetPool，见 06/07 文档）。RegionObject 每对象一个 wrapper + 一个样式实例（材质经模板池共享）。
- 诊断 normals 材质含 `USE_INSTANCING` 分支（RenderModeState.ts:134-155）——为 override 覆盖实例化资产而写。

## 13. Style 更新时如何刷新渲染对象（RegionRenderer 分派）

`RegionRenderer.update(root, obj, keys)`（RegionRenderer.ts:100-160）按 object:updated keys 精确分派：

| 变更 | 路径 | 几何 | 材质/实例 |
|---|---|---|---|
| `shape` | rebuildGeometry → setGeometry | **重建**（旧几何 dispose） | 不动 |
| `semantic` 类型变 | swapStyle（dispose+create） | **复用原 BufferGeometry**（顶点不动） | 新实例 |
| `semantic` 同类型参数 | line 按 width 重建几何；updateStyle(semantic=…) 透传 | line 重建/其余不动 | update 只改参数（building 自授权重挤出） |
| `style` presetId 变 / overrides 键删除 | swapStyle | 复用 | 新实例 |
| `style` 同 preset 调参 | updateStyle(overrides) | 不动 | update 改材质参数 |

override 键删除回退：引擎增量合并不支持删键 → RegionRenderer 自记 overrideKeys 检测删除走 dispose+create（:186-193）。

## 14. 是否支持运行时切换 Style

**支持**。切预设 = `ChangePresetCommand`（style 整体替换，额外发 `style:changed`）→ `object:updated{keys:['style']}` → swapStyle。切换零几何重建（BufferGeometry 复用）、wrapper 根恒定（RuntimeObjectMap/Gizmo/框选引用稳定，RegionRenderer 头注）。失败安全：非法 presetId 走引擎降级 default_solid + Toast。

---

## 四概念辨析（审计要求）

| 概念 | 当前是否存在 | 载体 |
|---|---|---|
| **Style Definition**（样式定义） | **存在但拆成两半**：元数据（StylePresetMeta，registries 可见）+ 构建函数（build，runtime 路由表）| 同一 `*.preset.ts` 文件导出，物理同文件、逻辑分离 |
| **Style Parameters**（参数） | 存在 | 三层：meta.defaultParams 定义 → 对象 style.overrides 覆写 → resolvePresetParams 解析产物（+保留键 semantic） |
| **Style Generator**（生成器） | **部分存在**：build 函数即生成器，但**输入被限定为 (geometry, params)**——不接收时间/相机/随机种子等上下文 | `StylePresetBuild` 签名（types.ts:26） |
| **Render Result**（渲染结果） | 存在且**明确不入数据** | StyleInstance 仅运行期内存；场景只存 presetId+overrides |

**结论**：四概念已分离，但 Generator 的输入空间窄（无时间维度钩子——uTime 仅 shader_test 特例、无每帧 tick 通路、无随机种子/scatter 参数）。

## 「形状/语义/样式」三层数据 vs 渲染管线对照

| 数据层 | 渲染消费点 | 备注 |
|---|---|---|
| shape | GeometryBuilder（面/线/点几何）→ 插件 setGeometry | road 条带宽度例外读 semantic |
| semantic | GeometryBuilder（line width）；引擎保留键并入参数 → 插件（building height 挤出） | 类型切换触发样式重置（命令层联动） |
| style | 引擎路由 + 参数解析 + 材质策略 | 与几何解耦（swapStyle 复用几何） |

## 如果未来增加「GPU Procedural Style」，当前系统最适合从哪里扩展？（现状分析 + 推断）

> 以下为**推断/建议**，非当前事实。

1. **最自然的扩展点是 `StylePresetBuild` 插件契约本身**：签名 `(geometry, params) => StyleInstance` 已容纳 ShaderMaterial（shader_test 证明）；草地/沥青/水面类 GPU 程序化材质 = 新 preset 文件 + ShaderMaterial + uniforms 来自 params——**零引擎改动**即可实现「表面着色型」程序化样式。
2. **缺口一（时间/动画）——已核实为占位状态**：`shader_test` 头注称 uTime「渲染循环驱动（T6.4 接线）」，但 grep 全仓证实 **Renderer/RenderLoop 无任何推进 uTime 的代码**（uniform 恒 0，波纹静止）；测试 `engine.test.ts:493` 只断言「uTime 不受参数通道影响、归渲染循环」，同样不驱动。即**引擎当前没有任何实例 tick / 时间推进通路**——文档描述（T6.4 接线）与代码实际不符，属未完成接线。若需要流动水面等动画，此为第一缺口。
3. **缺口二（散布/实例化型样式，如森林=区域上散树）**：当前契约「几何归调用方、单 geometry 单实例」——插件无法为区域生成多实例散布对象。需要放宽：允许插件返回 Group 根（契约已允许但「Group 根不参与模板共享」）并自管 InstancedMesh；或引擎增加 scatter 型实例池。`supportedShapes/supportedSemantics` 过滤机制可原样复用。
4. **缺口三（纹理）**：无程序化纹理设施；GPU 生成纹理由 ShaderMaterial 内置（无需引擎支持），CPU 生成需插件自建（授权规则 1 允许「子对象、渲染目标等」自建资源并在 dispose 释放）。
5. **参数面板**：`StyleParameter` 四控件类型（color/number/boolean/select）对程序化样式够用（密度/种子/风速均为 number）；复杂参数（贴图引用、嵌套规则）需扩展类型。
6. **性能边界**：materialPool 无 params 签名维度——程序化样式若普遍带 overrides，模板池将退化为全独享材质（现状设计「带覆写实例从不入池」），材质数 = 对象数。对 ShaderMaterial 而言 uniform 不同可共享材质（uniforms 按实例存储需 InstancedMesh attribute 或多材质）——当前引擎无 per-instance uniform 机制。
