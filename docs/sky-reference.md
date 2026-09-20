# 天空与环境光照升级方案参考（输入材料归档）

> 2026-09-20 T018 立项 grilling 会话的用户参考方案，逐字归档（D27 `docs/lod-reference.md` 同例）：**输入材料，不再更新；与 DECISIONS.md D29 裁决冲突处以 D29 为准**。
>
> 主要分歧记档：①子任务拆分——本方案 §25 SKY-1~6 六步 → D29 裁决合并 SKY-1+SKY-2 为 018.1 Sky+Sun Core（三一致验收不可拆），共五子任务；②tone mapping——D29 明确 T018 不引入 ACES，保持 NoToneMapping + SRGBColorSpace，以独立线性衰减双旋钮控制（不足则另立 T019，禁止 T018 内切换）；③HemisphereLight——本方案 §17 留「极弱 Safety Fill」后门 → D29 裁决正常路径删除、仅 fallback；④资源验收——D29 增自维护 PMREM target owned/live counter 为确定性依据（renderer.info 仅辅助）；⑤PMREM 触发——D29 增 DEV 调参 debounce 硬约束。方案 §28 十条验收全部采纳并按 D29.7 量化口径补充。

---

# 园区三维编辑器真实天空与环境光照升级方案

## 1. 任务定位

将当前 Renderer 中的：

```text
CanvasTexture 渐变天空
+
HemisphereLight
+
DirectionalLight
```

升级为：

```text
Three.js Sky
+
DirectionalLight Sun
+
PMREM IBL
+
现有 Ground / Grid / Shadow
```

目标不是单独“换一个天空背景”，而是建立统一的：

> **天空 → 太阳 → 环境光 → PBR 材质 → 阴影**

光照关系。

最终建筑、树木、车辆、设施、道路等不同资产都共享同一环境光照系统。

---

# 2. 为什么采用这个方案

当前项目技术栈：

```text
Three.js r186
WebGLRenderer
InstancedMesh
PBR Material
DirectionalLight Shadow
```

因此优先采用 Three.js 官方 WebGL `Sky`，而不是 Fable5 的 WebGPU Atmosphere。

官方 `Sky` 基于 Preetham analytical sky model，直接面向 `WebGLRenderer`。

官方示例已经验证：

```text
Sky
+
Sun Position
+
PMREM
+
scene.environment
```

可以形成完整的天空 + 环境光方案。

PMREM 用于生成预过滤环境贴图，让不同粗糙度的 PBR 材质能够正确使用环境光照。

---

# 3. 最终架构

```text
EnvironmentPreset
        │
        ▼
  SkyController
        │
        ├───────────────┐
        │               │
        ▼               ▼
     Sky Dome       Sun Controller
        │               │
        │               ├── DirectionalLight
        │               │       └── Shadow
        │               │
        ▼               ▼
    Sky Radiance    Sun Direction
        │
        ▼
   PMREMGenerator
        │
        ▼
 scene.environment
        │
        ▼
 ┌──────┼─────────┐
 │      │         │
建筑   植物      车辆/设施
 │      │         │
 └──────PBR───────┘
```

同时保留：

```text
Ground
Grid
Axes
RenderMode
LOD
Shadow
```

这些现有系统不重构。

---

# 4. Environment 的职责重新定义

## Sky

负责：

* 天空颜色；
* 地平线；
* 太阳视觉位置；
* 大气散射基础视觉；
* 天空背景。

## DirectionalLight

负责：

* 太阳直射光；
* 主光方向；
* 阴影；
* 场景主要方向性照明。

## PMREM / scene.environment

负责：

* PBR 环境反射；
* 环境漫反射补光；
* 建筑、树木、金属、车辆等材质的统一环境光照。

## Ground

继续负责：

* 地面；
* 阴影接收。

## Grid

继续负责：

* 编辑器辅助网格。

---

# 5. 不再使用 CanvasGradient 作为正式天空

现有：

```ts
this.scene.background = createSkyTexture(...)
```

的 `day` 正式路径取消。

改为：

```text
Sky Mesh
```

作为环境天空。

允许保留旧 CanvasGradient 作为：

> HDR / Sky 初始化失败时的 fallback。

禁止删除 fallback 后让天空系统成为 Renderer 的硬依赖。

---

# 6. Sky 实现

使用：

```ts
import { Sky } from 'three/addons/objects/Sky.js';
```

建立唯一 Sky 实例：

```ts
private readonly sky = new Sky();
```

推荐挂载到：

```text
envGroup
```

使其继续受到现有 Environment Layer / RenderMode 管理。

Sky 基础配置：

```ts
sky.scale.setScalar(...);
sky.material.uniforms.turbidity.value = ...;
sky.material.uniforms.rayleigh.value = ...;
sky.material.uniforms.mieCoefficient.value = ...;
sky.material.uniforms.mieDirectionalG.value = ...;
sky.material.uniforms.sunPosition.value.copy(...);
```

参数初始值只作为视觉候选，不在第一版永久锁死。

---

# 7. Sky 必须使用“相机中心天空穹顶”

当前编辑器相机允许：

```text
近距离编辑
+
focusAll
+
公里级园区取景
```

因此不能把 Sky 永久固定在：

```text
world origin
```

否则相机远离原点后可能出现天空穹顶边界或裁剪问题。

Runtime 应在渲染前保持：

```ts
sky.position.copy(camera.position);
```

Sky 的视觉方向来自相机视线，位置只负责保证天空始终覆盖视口。

该操作属于轻量级 Runtime 维护，不改变业务 Scene 数据。

---

# 8. 太阳系统

不要让 Sky 自己单独决定太阳方向。

建立唯一：

```text
SunDirection
```

然后同时驱动：

```text
Sky.sunPosition
DirectionalLight.position
```

结构：

```text
SunDirection
      │
      ├── Sky.sunPosition
      │
      └── DirectionalLight.position
```

这样必须保证：

```text
天空中的太阳方向
=
场景太阳光方向
=
阴影方向
```

禁止出现：

```text
天空太阳在东边
阴影却指向东边
```

这种环境不一致。

---

# 9. 太阳方向模型

第一阶段不需要完整时间系统。

先建立：

```ts
sunDirectionOf(elevation, azimuth)
```

这样的纯函数。

例如：

```text
elevation
= 太阳高度角

azimuth
= 太阳方位角
```

它同时输出：

```text
Vector3
```

供：

```text
Sky
DirectionalLight
```

消费。

后续昼夜系统可以只增加：

```text
timeOfDay
→ elevation / azimuth
```

而不改天空底层架构。

---

# 10. PMREM 环境生成

核心流程：

```text
Sky
 ↓
Environment Bake Scene
 ↓
PMREMGenerator.fromScene()
 ↓
WebGLRenderTarget.texture
 ↓
scene.environment
```

Three.js 的 `PMREMGenerator.fromScene()` 正是为这种场景生成预过滤环境贴图，供 PBR IBL 使用。

---

# 11. 单独建立 Environment Bake Scene

不要直接：

```text
PMREMGenerator.fromScene(this.scene)
```

因为主 Scene 包含：

```text
建筑
树
车辆
编辑器辅助对象
Ground
Grid
Gizmo
```

这些都不应该进入天空 IBL。

建立独立：

```ts
private readonly environmentBakeScene = new THREE.Scene();
```

只放：

```text
Sky
```

必要时增加天空专用环境对象。

最终：

```text
Main Scene
= 编辑器真实场景

Environment Bake Scene
= 天空环境
```

职责完全分离。

---

# 12. PMREM 烘焙时关闭太阳圆盘

Three.js 官方 Sky 文档特别提醒：

> 使用 Sky 生成环境贴图时，应暂时隐藏 sun disc，避免环境贴图产生太阳圆盘伪影。

因此：

```text
PMREM 开始
→ showSunDisc = false

PMREM 完成
→ showSunDisc = true
```

这样：

```text
Sky 背景
= 可以看到太阳

PBR environment
= 不直接把太阳圆盘烘成巨大高亮点
```

---

# 13. PMREM 什么时候更新

禁止：

```text
每帧 PMREM
```

正确策略：

```text
普通相机移动
→ 不重新生成 PMREM

普通模型变化
→ 不重新生成 PMREM

LOD 切换
→ 不重新生成 PMREM

太阳角度变化
→ 重新生成 PMREM

EnvironmentPreset 变化
→ 重新生成 PMREM

Sky 参数变化
→ 重新生成 PMREM
```

因此 PMREM 是：

> **环境状态变化时的离线式 GPU 更新，不是每帧渲染路径。**

---

# 14. EnvironmentPreset 改造

继续保留当前：

```text
day
dusk
night
tech
```

但不再让天空主要依赖：

```text
skyTop
skyBottom
```

改为：

```ts
interface EnvironmentPreset {
  sky: {
    turbidity: number;
    rayleigh: number;
    mieCoefficient: number;
    mieDirectionalG: number;
  };

  sun: {
    elevation: number;
    azimuth: number;
    intensity: number;
    color: number;
  };

  ibl: {
    intensity: number;
  };

  ground: {
    color: string;
  };

  grid: {
    major: number;
    minor: number;
  };
}
```

注意：

> 这些参数属于 Runtime 预设，不进入 Scene 持久化业务结构。

现有 `SceneEnvironment` 仍然只负责：

```text
preset
+
grid
+
axes
+
renderMode
```

这样不会污染业务数据模型。

---

# 15. Day 第一阶段视觉基准

第一阶段只重点做好：

```text
day
```

视觉目标：

```text
自然蓝天
+
明显但不刺眼的太阳
+
自然地平线
+
正常天空亮度梯度
+
建筑环境反射
+
树冠环境补光
+
太阳阴影
```

不要求第一阶段同时把：

```text
dusk
night
tech
```

全部做到生产级。

---

# 16. Dusk / Night / Tech 的处理

后续只改变：

```text
Sky Parameters
+
SunDirection
+
Sun Intensity
+
Environment Intensity
```

不改：

```text
Renderer
SkyController
PMREM Pipeline
Shadow Pipeline
```

例如：

```text
day
→ 高太阳 + 明亮天空

dusk
→ 低太阳 + 暖色散射

night
→ 低/无太阳 + 深天空

tech
→ 特殊天空参数
```

这样四种 EnvironmentPreset 共享同一 Runtime。

---

# 17. HemisphereLight 的处理

HDRI/程序化天空已经提供：

```text
scene.environment
```

因此不再让：

```text
HemisphereLight
```

承担主要环境光。

第一阶段建议：

```text
HemisphereLight
→ 删除
```

如果视觉验收发现低频环境补光不足，可以保留极弱辅助光，但其角色只能是：

> Safety Fill

而不是主要环境照明来源。

禁止：

```text
高强度 Sky IBL
+
高强度 HemisphereLight
+
高强度 DirectionalLight
```

三套光源叠加。

---

# 18. 与现有 Shadow 系统关系

保持现有：

```text
DirectionalLight.castShadow = true
```

以及当前：

```text
2048 shadow map
shadow camera
bias
```

第一阶段不调整 Shadow Camera。

职责：

```text
Sky
→ 环境

DirectionalLight
→ 主光 + 阴影
```

这样天空升级不会与 T009.5 Shadow 任务互相污染。

---

# 19. 与现有 LOD 关系

天空升级不得修改：

```text
T006 LOD
Chunk
InstancedMesh
Scatter
sourceKey
level
```

LOD 完全独立。

天空只是：

```text
Renderer Environment
```

对所有资产统一提供环境光照。

---

# 20. 与 PBR Asset 的关系

至少验收：

```text
夏栎
香樟
路灯
建筑/设施 GLB
车辆或其他金属资产
```

重点：

### 树

检查：

```text
叶片明暗
叶片高光
树皮环境光
树冠内部环境补光
```

### 金属

检查：

```text
金属表面环境反射
高光方向
粗糙度响应
```

### 建筑

检查：

```text
不同朝向的亮暗关系
墙体环境色
玻璃/金属环境反射
```

环境升级必须能够明显改善资产真实感，而不仅仅是“天空变好看”。

---

# 21. Renderer 生命周期

增加独立资源所有权：

```ts
private sky: Sky;
private environmentBakeScene: THREE.Scene;
private environmentPmrem: THREE.WebGLRenderTarget | null;
private pmremGenerator: THREE.PMREMGenerator;
```

资源归属：

```text
Renderer
 ├─ Sky
 ├─ PMREMGenerator
 └─ PMREM WebGLRenderTarget
```

Renderer.dispose() 必须：

```text
Sky dispose
PMREM RenderTarget dispose
PMREMGenerator dispose
scene.environment = null
```

---

# 22. Environment 切换生命周期

正确流程：

```text
applyEnvironment()
      ↓
更新 EnvironmentPreset
      ↓
更新 Sky
      ↓
更新 Sun
      ↓
更新 DirectionalLight
      ↓
重新生成 PMREM
      ↓
替换 scene.environment
      ↓
释放旧 PMREM
```

禁止出现：

```text
旧环境 PMREM 留在 GPU
```

造成：

```text
day → dusk → night → day
```

连续切换后 GPU 资源增长。

---

# 23. 渲染顺序

保持当前 RenderMode 多遍机制。

推荐：

```text
Frame
 ↓
Camera / Controls
 ↓
EnvironmentController.update()
 ↓
Sky position = camera position
 ↓
LOD
 ↓
Scene render passes
```

注意：

```text
Sky
```

属于环境显示内容；

```text
scene.environment
```

属于材质环境光；

两者不是一回事。

---

# 24. 性能原则

天空系统的目标：

> **不是零成本，而是把成本限制在“环境变化时”，而不是每帧。**

正常操作：

```text
拖镜头
→ Sky 低成本绘制
→ 不重新 PMREM
```

环境改变：

```text
切 Day/Dusk
→ 一次 PMREM
```

未来时间拖动：

```text
时间连续变化
→ 不允许每个鼠标移动事件无限 PMREM
```

应采用：

```text
节流 / 合并更新 / 松手后最终烘焙
```

时间系统正式立项时再确定具体策略。

---

# 25. 第一阶段实现任务拆分

## SKY-1：Sky Runtime

实现：

* `Sky` 创建；
* 参数配置；
* Camera-centered Sky；
* Sun Position；
* Environment Layer 接入。

---

## SKY-2：Sun Controller

实现：

* elevation / azimuth；
* Sky / DirectionalLight 共用 SunDirection；
* sun color；
* sun intensity；
* 太阳方向一致性。

---

## SKY-3：IBL / PMREM

实现：

* Environment Bake Scene；
* PMREMGenerator；
* Sky → PMREM；
* `scene.environment`；
* environment intensity；
* sun disc bake 保护。

---

## SKY-4：EnvironmentPreset 重构

实现：

```text
day
dusk
night
tech
```

统一改为：

```text
Sky
+
Sun
+
IBL
+
Ground
+
Grid
```

---

## SKY-5：资源生命周期

验证：

```text
Environment switch
+
Renderer dispose
+
StrictMode 双挂载
+
HDR/PMREM 资源释放
```

确保不存在 GPU 资源泄漏。

---

## SKY-6：视觉验收

验收对象：

```text
天空
夏栎
香樟
路灯
GLB
建筑/设施
```

固定机位对比：

```text
旧环境
vs
新环境
```

重点不是只比较天空，而是比较：

```text
整体光照
材质
环境反射
太阳方向
阴影
```

---

# 26. 后续扩展路线

第一阶段：

```text
Sky
+
Sun
+
PMREM
+
IBL
```

第二阶段：

```text
TimeOfDay
↓
Sun Position
↓
Sky
↓
Sun Light
↓
PMREM
```

第三阶段，如果未来真的出现：

```text
大范围 GIS
远山
天气
体积云
长距离视野
```

再评估：

```text
Atmosphere
+
Aerial Perspective
+
Cloud
```

不提前引入 Fable5 级别的 WebGPU 大气管线。

---

# 27. 明确非目标

本任务不做：

* WebGPU 迁移；
* Fable5 Atmosphere 搬运；
* Volumetric Cloud；
* Weather System；
* 动态时间轴；
* Atmospheric Fog；
* Terrain Atmosphere；
* Shadow Camera 重构；
* LOD 重构；
* Asset Shader 重构。

这些属于未来独立能力。

---

# 28. 最终验收

完成后，默认 `day` 场景必须达到：

```text
真实程序化天空
        +
统一太阳方向
        +
自然环境光照
        +
PBR 环境反射
        +
DirectionalLight 阴影
```

并满足：

```text
1. 天空不再使用 CanvasGradient 作为正式路径。
2. Sky 与 DirectionalLight 使用同一太阳方向。
3. scene.environment 使用 PMREM 结果。
4. 资产 PBR 材质明显获得环境光照/反射。
5. Environment 切换不会持续增加 GPU 资源。
6. PMREM 不进入每帧路径。
7. Ground/Grid/Shadow/LOD/RenderMode 不回归。
8. HDR / Sky 初始化异常时能够安全 fallback。
9. Renderer dispose 后环境资源全部释放。
10. npm test / check:layers / typecheck 全绿。
```

# 29. 最终架构原则

> **Sky 决定用户看到的天空，Sun Controller 决定统一太阳方向，DirectionalLight 负责太阳直射光与阴影，PMREM 把天空转化为 PBR 环境光；四者共同组成 Environment Runtime，但环境变化才触发 PMREM 更新，普通相机移动和资产 LOD 不触发环境重新烘焙。**
