> **归档说明（2026-09-19，D27）**：本文件为用户提供的 LOD 架构参考输入（原根目录 `LOD方案参考.md`），经 grilling 两轮 + 对抗审核逐题裁定吸收进正式文档体系——决策 = DECISIONS.md D27，任务结构 = `tasks/006-*`，LOD 规范真相源 = T010.3 产出。本文件为归档输入材料不再更新，与正式决策冲突时以 DECISIONS.md 为准。

下面这版按“任务书 / Agent 可直接执行”的方式整理，重点把**公共 Asset Runtime LOD**与**夏栎这个首个验证资产**彻底分开，避免后续 Agent 把 LOD 做成植物专属能力。

# 通用 Asset Runtime LOD 与大规模资产渲染方案

## 1. 目标

为三维园区编辑器建立一套**与资产类型无关的通用 Asset Runtime LOD 能力**。

该能力必须同时服务后续的：

* 植物
* 建筑
* 道路设施
* 车辆
* 设备
* 自然物
* GLB 资产
* 程序化资产

夏栎只是第一 个用于验证该体系的真实高质量资产，**不得因为 T009 夏栎实现而将 LOD 架构设计成“植物专用方案”**。

核心目标：

> 资产负责提供可用的多级 Representation；Asset Runtime 负责根据可见性、空间分块和屏幕空间尺寸，在不同 Representation 之间进行统一调度，并通过 Chunk + Render Bucket + Batch 实现大规模场景稳定渲染。

---

# 2. 核心设计原则

## 2.1 LOD 是 Asset Runtime 公共能力

LOD 不属于某个具体资产，也不属于植物系统。

错误设计：

```text
TreeLOD
VegetationLOD
PlantLOD
```

正确设计：

```text
Asset Runtime
├── Visibility / Culling
├── LOD Evaluation
├── Representation Selection
├── Render Bucket
└── Batch Rendering
```

任何资产只要声明自己支持哪些 Representation，就可以被统一 Runtime 调度。

---

## 2.2 Asset 不负责“什么时候切换”

资产只负责声明：

```text
有哪些 Representation
每个 Representation 如何生成
每个 Representation 的质量预算
每个 Representation 是否支持 Shadow / Picking 等能力
```

Runtime 负责：

```text
当前是否可见
当前应该使用哪个 Representation
什么时候切换
如何防抖
如何分桶
如何批量渲染
何时彻底裁剪
```

禁止把距离判断、相机逻辑、Chunk 逻辑写进具体资产。

---

## 2.3 sourceKey 与 LOD 完全解耦

现有 `sourceKey` 继续只表达：

> “这是什么资产形态？”

例如：

```text
asset_tree_3a:slot-0
```

代表：

```text
夏栎 / slot-0
```

LOD 不参与：

```text
shapeSlot
morphSeed
sourceKey
```

Runtime 内部可以进一步形成渲染桶：

```text
sourceKey + level
sourceKey + representation
sourceKey + chunk + level
```

但这些都是 Runtime 层概念，不改变资产身份。

---

# 3. Representation 模型

统一定义“资产当前可以用什么方式表示”。

建议至少支持以下语义：

```text
High
Mid
Low
Proxy
Impostor
Culled
```

不是所有资产必须提供全部档位。

例如：

```text
夏栎：
High / Mid / Low / Impostor

建筑：
High / Mid / Proxy

路灯：
High / Low

消防栓：
High / Low

车辆：
High / Mid / Low / Impostor
```

因此 Runtime 必须支持**不完整 LOD 链**。

不能假设所有资产都必须：

```text
High → Mid → Low → Impostor
```

---

# 4. Asset LOD Profile

资产通过自己的 LOD Profile 声明 Representation。

示意：

```ts
interface AssetLODProfile {
  levels: AssetLODLevel[];
  policy?: AssetLODPolicy;
}

interface AssetLODLevel {
  id: 'high' | 'mid' | 'low' | 'proxy' | 'impostor';
  screenSize?: number;
  maxDistance?: number;
  triangleBudget?: number;
  castShadow?: boolean;
  pickable?: boolean;
}
```

实际字段可以根据现有 Asset Contract 最小化设计，禁止提前堆积无实际消费者的字段。

原则：

> Profile 描述资产能力，不承担 Runtime 调度逻辑。

---

# 5. LOD 选择规则

## 5.1 不采用“所有资产统一距离阈值”

错误：

```text
0–25m High
25–80m Mid
80–200m Low
```

原因：

不同资产尺寸差异巨大。

例如：

```text
建筑 = 40m
夏栎 = 8m
汽车 = 4m
消防栓 = 0.8m
设备 = 0.3m
```

相同距离下，它们在屏幕中的占比完全不同。

---

## 5.2 优先使用屏幕空间尺寸

LOD 主要根据：

```text
屏幕空间尺寸
```

决定 Representation。

距离只是辅助参数。

推荐逻辑：

```text
World Bounds
    ↓
Camera Distance
    ↓
Projected Screen Size
    ↓
LOD Policy
    ↓
Representation
```

例如：

```text
> 180 px      High
80–180 px     Mid
25–80 px      Low
8–25 px       Proxy / Impostor
< 8 px        Culled
```

这些数值只是初始设计，不是固定验收值。

最终阈值必须结合项目实际资产和性能测试锁定。

---

# 6. Chunk 是空间管理单位，不是 LOD 本身

Chunk 的核心职责：

```text
空间组织
+
快速可见性判断
+
LOD 管理范围
+
批次组织
```

推荐执行链：

```text
Scene
 ↓
Spatial Chunk
 ↓
Frustum Culling
 ↓
Visible Instances
 ↓
LOD Evaluation
 ↓
Representation Selection
 ↓
Render Bucket
 ↓
Batch Rendering
```

Chunk 不应该决定资产到底是什么 Representation。

Chunk 只是 Runtime 管理和裁剪的空间单位。

---

# 7. Chunk 与 LOD 的关系

第一阶段允许使用：

```text
Chunk 粒度 LOD
```

即：

```text
Chunk → 根据代表距离选择档位
```

但架构不能把它锁死为永远“整块同档”。

长期目标：

```text
Chunk = 空间裁剪单位
LOD = Representation 决策
```

在需要时允许进一步演进为：

```text
Chunk 内部多个 Render Bucket
```

例如：

```text
Chunk 12
 ├── Tree High
 ├── Tree Mid
 ├── Lamp Low
 └── Building Proxy
```

从而避免因为一个 Chunk 内资产距离不同而强制全部使用同一档。

---

# 8. Render Bucket

Render Bucket 是 Runtime 的核心执行单位。

建议概念：

```text
RenderBucketKey =
  Chunk
  +
  Asset Source
  +
  Representation
```

例如：

```text
chunk-12 / asset_tree_3a:slot-0 / high
chunk-12 / asset_tree_3a:slot-0 / mid
chunk-18 / asset_tree_3a:slot-0 / low
chunk-18 / street_lamp / low
```

Bucket 内再决定具体采用：

```text
InstancedMesh
Mesh
Proxy Mesh
Impostor Mesh
```

---

# 9. Instancing 规则

现有 `InstancedMesh` 继续作为 WebGL2 主要批量渲染手段。

原则：

```text
相同 Source
+
相同 Representation
+
相同 Render Bucket
=
优先合批
```

不能因为增加 LOD 而退化成：

```text
一棵资产 = 一个 Mesh
```

LOD 系统的目标不是简单降低三角形，而是：

> 在保证批次规模、可见性和资产表现的同时降低 GPU 工作量。

---

# 10. Culling

LOD 之前必须先做可见性裁剪。

基本顺序：

```text
Instance
 ↓
Chunk Cull
 ↓
Frustum Cull
 ↓
Distance / Screen Size
 ↓
LOD
```

看不见的对象不进入后续 LOD 和渲染。

第一阶段使用 WebGL2 现有 CPU/Chunk Runtime 可接受。

**不为了模仿 WebGPU 项目而提前引入 WebGPU Compute。**

后续如果实际性能验证表明 CPU Culling 已成为明确瓶颈，再独立评估 GPU Compute / WebGPU 后端。

---

# 11. 远距离 Representation

远距离不应该简单理解成“低模”。

建议 Runtime 支持：

```text
High
 ↓
Mid
 ↓
Low
 ↓
Proxy / Impostor
 ↓
Culled
```

其中：

### Low

真实几何，但是明显降低：

* 枝条
* 面数
* 叶簇
* 几何细节
* Shader 成本

### Proxy

只保留：

* 主要轮廓
* 基本体量
* 必要颜色
* 必要拾取/阴影特征

### Impostor

使用：

* Billboard
* 多视角 Atlas
* Albedo
* Normal
* Depth

用于非常远的资产。

Impostor 是**通用 Representation 能力**，不是植物专属功能。

---

# 12. Shader LOD

LOD 不只是几何 LOD。

对于 GPU 成本较高的资产，还必须允许：

```text
几何 LOD
+
Shader LOD
```

例如夏栎：

### High

保留：

```text
SDF 叶形
叶脉
噪声
透光
叶片风动
树皮细节
```

### Mid

降低：

```text
噪声频率
叶脉复杂度
透光强度/计算量
叶片微动作
```

### Low

只保留：

```text
基础颜色
基础轮廓
低成本风动或静态表现
```

但这只是夏栎的具体实现。

公共 Runtime 只规定：

> Asset Representation 可以拥有独立 Shader Profile。

禁止把 Shader 逻辑写死在 Runtime。

---

# 13. Shadow LOD

阴影也应作为 Representation 能力的一部分。

例如：

```text
High
→ 完整投影

Mid
→ 简化投影

Low
→ Proxy Shadow

Impostor
→ 默认不投真实几何影
→ 必要时使用 Shadow Proxy
```

Runtime 可以根据 Representation 选择 Shadow Strategy。

例如：

```text
ShadowStrategy =
  Full
  Simplified
  Proxy
  None
```

这样不同资产可以有不同的阴影策略。

---

# 14. Picking 规则

LOD 切换不能破坏编辑器交互。

无论当前是：

```text
High
Mid
Low
Proxy
Impostor
```

用户都必须得到一致的业务对象 ID。

因此：

```text
Render Representation
        ↓
Runtime Pick Mapping
        ↓
Scene Object / Region / Asset
```

渲染表示发生变化，业务对象身份不能变化。

---

# 15. 资产生命周期与缓存

LOD Source 独立缓存。

核心语义：

```text
sourceKey
```

定义资产形态身份。

具体渲染资源：

```text
sourceKey + level
```

形成独立缓存项。

例如：

```text
asset_tree_3a:slot-0
    ├── high
    ├── mid
    └── low
```

每档资源独立创建、独立释放。

Impostor 如果属于独立 Runtime Representation，也可采用独立缓存。

---

# 16. 夏栎在该体系中的定位

夏栎只是第一个真实验证资产。

T009.6 负责：

```text
夏栎 High
夏栎 Mid
夏栎 Low
```

以及：

```text
档间身份一致
面数预算
几何质量
Shader LOD
```

T009 不负责建立“植物专用 Runtime”。

T006 负责：

```text
通用 Chunk
通用 LOD Selection
通用 Render Bucket
通用 Batch Control
远距 Representation 接口
```

T010 负责：

```text
把经过真实消费者验证的能力提炼成公共 Asset Runtime Contract
```

---

# 17. 性能目标

性能验证必须同时观察：

```text
FPS
Frame Time
Draw Calls
Triangles
Visible Instances
LOD 分布
各 Representation 数量
GPU/渲染耗时
```

不要只用 FPS 判断。

压力测试至少应该覆盖：

```text
少量资产
中等数量
大量同类资产
大量不同类资产
多种 LOD 混合
Chunk 跨区
远距离大场景
```

最终判断目标：

> 在资产数量持续增加时，通过 Culling、LOD、Representation 和 Batch 让 GPU 工作量保持可控，而不是依赖单一 InstancedMesh 解决所有性能问题。

---

# 18. 明确禁止的实现方式

## 禁止 1：把 LOD 写进具体植物系统

错误：

```text
TreeLODManager
VegetationLODManager
```

除非未来确实出现独立领域需求，否则统一走 Asset Runtime。

---

## 禁止 2：所有资产固定距离阈值

错误：

```text
100m = Low
200m = Impostor
```

必须至少考虑资产自身屏幕空间尺寸。

---

## 禁止 3：把 level 加进 sourceKey

错误：

```text
sourceKey = assetId + shapeSlot + level
```

正确：

```text
sourceKey = assetId + shapeSlot
cacheKey = sourceKey + level
```

---

## 禁止 4：只有几何 LOD，没有 Shader LOD

高成本程序化材质在 Low 档继续运行 High Shader，会导致 LOD 降级收益大幅下降。

---

## 禁止 5：只有 LOD，没有 Culling

远处低模并不能解决“镜头外几万棵树仍参与渲染”的问题。

---

## 禁止 6：为了性能直接退化逐对象 Mesh

LOD 系统不能破坏当前 InstancedMesh / Chunk Batch 架构。

---

## 禁止 7：为了模仿 Fable5 强行迁移 WebGPU

当前项目是 WebGL2。

第一阶段：

```text
Chunk
+
Frustum Cull
+
LOD
+
Render Bucket
+
InstancedMesh
+
Proxy / Impostor
```

已经足够构成成熟的 WebGL2 Asset Runtime。

WebGPU Compute 应作为未来独立渲染后端能力，不作为当前 LOD 前置条件。

---

# 19. 最终架构定义

最终 Asset Runtime 的职责可以压缩为：

```text
Asset
  ↓
Asset Profile
  ↓
Source
  ↓
Spatial Chunk
  ↓
Visibility Culling
  ↓
LOD / Screen Size Evaluation
  ↓
Representation Selection
  ↓
Render Bucket
  ↓
Batch / Instancing
  ↓
Render / Shadow / Pick
```

其中：

```text
Asset
= “我是什么、我有哪些表现档位”

Runtime
= “现在该用哪一种表现方式、是否应该渲染、如何批量渲染”

Scene
= “这个资产实例是谁、在哪里、有什么业务状态”
```

---

# 20. 一句话原则

**不要设计“树木 LOD”，而要设计“通用 Asset Runtime Representation System”；夏栎只是第一个验证 High/Mid/Low、Shader LOD、Shadow LOD 和大规模批量渲染的真实资产。**

这版可以直接作为后续修改 **T006 / T009.6 / T010** 的架构依据。尤其需要先修掉现有 `T006.1` 的“植物 ≤300/800/2000 tri”旧口径，避免后续 Agent 把公共 LOD 错做成植物专用方案。
