# 程序化资产 LOD 声明与调度规范

> T010.3 产出（2026-09-19）；2026-09-23 T021 立项（D41）起**本文档收窄为 LOD「声明面」唯一真相源**（资产如何声明可用表示、内容契约与家族预算）；**运行面**（选档 / 过渡 / 阴影策略 / 密度 / 批次 / 状态 / 键 / 路由 / 验收口径）唯一真相源 = [`representation-runtime.md`](representation-runtime.md)。`docs/lod-reference.md` 为归档输入材料（D27——不再更新，冲突时以本文档与 DECISIONS.md 为准）。
> 适用范围：一切程序化资产（`*.asset.ts` 插件体系，D17）的 LOD 档位声明与内容交付，以及 T006 Runtime 调度侧的实施依据。GLB 导入资产不适用本规范声明面（其 Proxy 语义收录见 §3，未经验证）。
> 姊妹规范：文件组织与三级职责边界（010.1）→ `organization.md`；元数据与分类契约（010.2）→ `metadata-taxonomy.md`；Shadow 公共能力与视觉验收 SOP（010.4）→ `shadow-visual-sop.md`。
> 决策锚：D27 全节（通用 Asset Runtime LOD 架构）、D23.2（level 契约与双维缓存）、D19（sourceKey 形态身份）、D20.5（统一 Asset Runtime 能力 + 家族预算制）、D19.8（预算制口径）。

## 1. 职责切分总则

一句话原则：**资产声明「有哪些档、每档长什么样」；Runtime 决定「现在用哪档、何时切换、如何批量」。**

| 侧 | 拥有 | 禁止 |
|---|---|---|
| **资产侧**（资产任务，T009.6 型） | `levels` 声明；各档几何 + 材质 + 深度材质内容；档间不变量；预算账目（§5）；强制档位生成验证面（DEV 出图） | 距离判断、相机逻辑、Chunk 逻辑、切换时机、防抖——一切调度 |
| **Runtime 侧**（T006） | 选档评估、hysteresis、切换执行、分桶、批次控制、裁剪、拾取跨档映射、LOD 总开关 | 感知任何具体资产类型；TreeLOD / VegetationLOD 类资产域专属 LOD 系统（D27.1） |

判定口诀：**换一个资产还成立的能力 → Runtime；只有这个资产知道的事实（每档长什么样、预算多少）→ 资产。**

sourceKey 形态身份不变口径（D19/D23.2，硬约束）：`sourceKey = assetId[:preset]:slot-N` 只表达形态身份；level 是缓存/调度的档位维度，**绝不掺入 shapeSlot / morphSeed / sourceKey 计算**——`sourceKey = assetId + slot + level` 一律不合法（lod-reference 禁止 3 收录，D27.4 重申）。

## 2. 档位声明契约（资产侧）

### 2.1 类型枚举——三值定死（D27.7；T021.1 语义收窄）

```ts
export type ProceduralLevel = 'high' | 'mid' | 'low';        // 类型真相源：src/domain/assets/AssetDescriptor.ts
export interface ProceduralLevelDescriptor { id: ProceduralLevel; }  // runtime/procedural/types.ts 的 level 参数复用本类型
```

三值语义 = **Asset Build Capability（资产可直接 Build 的几何档位，T021.1/D41 §三.1 收窄）**——不再兼任 Runtime 远景表示的统一枚举：

| id | 语义 | 内容判据 |
|---|---|---|
| `'high'` | 细模（构建档） | 完整几何细节 + 完整 Shader 配方；近景/默认档 |
| `'mid'` | 中模（构建档） | 几何细节与 Shader 成本同步降（夏栎先例：降枝条段数/叶簇量/叶卡量，材质去脉三线/节疤） |
| `'low'` | 远模（构建档） | 只保轮廓 + 体量 + 颜色层次 + 整体风格，不保持内部结构 |

**Runtime 表示联合真相源在 domain/lod**（两面互指纪律：运行面正文归 `representation-runtime.md` §三，此处只锚声明面语义）：`RuntimeRepresentation = 'high' | 'mid' | 'low' | 'canopy'`（`src/domain/lod/representation.ts`）——high/mid/low 与构建档同名同值（build 出什么档即能展示什么表示），`'canopy'` 是远景冠层代理表示（内容自 T021.6 起提供）；`'impostor'` 架构预留不进联合（§3）、`'culled'` 是提交终态（submit state，非表示非声明档位）。资产声明 Runtime 表示能力走独立 `representations` 字段（§2.2），`levels` 三值语义不被污染。

枚举纪律：**改名 / 扩值是破坏性契约变更，必须过决策门**。（2026-09-23 D41 过决策门 + T021.1 落地：`'canopy'` 转正进入 Runtime 表示联合——运行面类型与有效链见 `representation-runtime.md` §三；本节 `ProceduralLevel` 三值保留为 Asset Build Capability 语义，声明面 `representations` 字段条款见 §2.2。）

### 2.2 meta 声明形态——首版最小化（D27.12；T021.1 增 representations）

```ts
levels?: ProceduralLevelDescriptor[]                    // 夏栎实例：[{ id: 'high' }, { id: 'mid' }, { id: 'low' }]
representations?: RuntimeRepresentation[]               // T021.1（D41 §三.2）：Runtime 表示能力声明，类型真相源 = domain/lod/representation
```

`levels` 首版唯一字段 `id`。以下字段**全部禁止**（无实际消费者，D27.12；出现真实消费者后再经增量决策扩入，沿 010.1 无投机字段纪律）：

| 禁止字段 | 为什么不进 Profile |
|---|---|
| `screenSize` / `maxDistance` | 调度阈值归 Runtime 全局策略常量（§4.1）——选档语义全资产统一，不逐资产配置 |
| `triangleBudget` | 预算归家族预算表（§5）+ 资产模块头账目，是工程记录不是声明能力 |
| `castShadow` / `pickable` | 影走 InstanceSource 契约通道（customDepthMaterial 随档成套，§2.3）；拾取跨档一致是 Runtime 义务（§6）——均无逐档声明消费者 |

缺省语义（T021.1 起三态）：不写 `representations` = 从 `levels` 派生（构建档位即表示能力；不写 `levels` = 单档细模，与显式 `[{ id: 'high' }]` 等价）；两字段均未声明 = 单档 high。`representations` 声明优先于 `levels` 派生（有效链按声明能力生成、不硬编码全链，Runtime 侧纯函数 = domain/lod effectiveRepresentationChain）。

缓存口径现状（声明面快照，键收敛归 021.7）：**未声明多档（不写 `levels` 或单档声明）且未声明 shapeFamily 的资产 = 恒单档**（缓存走纯 assetId 键、build 无参调用、level 一并忽略——ProceduralSourceCache 现行为）；未声明 shapeFamily 但声明多档的资产缓存键 = `assetId::level`、build 以 `build({ level })` 调用（level 只作缓存档位维度，不掺形态身份，D23.2）。streetlamp 先例更新（T021.1）：`asset_streetlamp` 已声明 `representations: ['high', 'low']`——「未声明多档」中间态的唯一消费者由本声明**收编入第一分支**（021.7 键收敛为 `sourceKey + representation` 双维时方可删除该中间分支，收编完成前禁删，D41 §10.2；021.1 本身不改 ProceduralSourceCache 键逻辑——streetlamp 现行为逐位不变）。

不完整链：资产可声明任意非空子集（路灯两档、消防栓仅 high 均合法）；选档遇到未声明档的跳档语义（取最近已声明档）归 Runtime（006.1 实装）。

### 2.3 build 契约——level 消费面

- 签名：`build(params?: { seed?, preset?, level? })`；`level` 缺省 `'high'`——旧资产 `build()` 无参路径逐位不变（TS 少参可赋多参签名，零改动兼容）。
- `level` 不参与 shapeSlot / morphSeed / sourceKey 形态身份计算（D23.2）。
- **档间不变量义务**（资产侧验收面）：同 seed 跨档同 rng 消费流、同骨架决策；轮廓 / 体量 / 颜色档间连续，切换无身份变化（「同一棵树远近都是那棵树」）；minY 贴地语义一致。夏栎先例：三档 rng 消费恒等 177234、簇表跨档逐位全等、Mid 存活卡 ⊂ High。
- 未声明档位的回落由资产 build 自行决定（如仅 high 的资产被请求 low → 回 high）；Runtime 侧只请求已声明档（§6），回落是防御面不是协议依赖。
- **成套交付（D27.4）**：geometry + material + customDepthMaterial 随 sourceKey + level 整体成套——Shader LOD 与 Shadow LOD 因此天然成立，Runtime 无需独立「Shader 档 / 影档」切换机制。材质档位变体在资产材质工厂内（夏栎先例：叶 Mid 去脉三线、叶 Low 去透光、皮 Mid 去节疤、皮 Low 去板块采样/节疤/苔痕、深度 Mid=High SDF / Low=Low SDF）；`customProgramCacheKey` 档位唯一（配方变即键变——夏栎 9 键先例 = 三材质工厂 × 三档，High 三键沿用原键）。

### 2.4 缓存与所有权——level 独立维度（D23.2，已落地）

| 维度 | 键 | 语义 |
|---|---|---|
| 形态身份 | `sourceKey`（assetId[:preset]:slot-N） | 不变量；level 不掺入 |
| 缓存条目 | `sourceKey::level`（ProceduralSourceCache 内部后缀编码） | 双维档位缓存；load/evict 同键规则（resolveEntry 单一真相） |

- 每档独立缓存（条目间 geometry / material 不共享）、独立释放（`evict` 单档单槽精确释放——T006 换档释放旧档的消费面；幂等，未命中返回 false）。
- 条目资源归 Cache 实例所有（dispose / evict 释放 geometry / material / customDepthMaterial）；池不 dispose Source、Ghost 借缓存 Source 不 dispose（既有契约原样保留）。
- 缓存不淘汰（每资产至多 槽数 × 档数 条目，天然有界——D19.4 同推）。

### 2.5 默认消费口径（D27.14，默认可否决）

缩略图 / Ghost / Preview 固定取 High 档。T007 烘焙「取当前档几何」语义保留原句，细化留 T007 立项拷问门。

## 3. Representation 语义集（D27.3 全集；T021.1 与双轨类型对齐）

| 档位 | 语义 | 内容性质 | 进构建枚举（ProceduralLevel） | 进运行表示联合（RuntimeRepresentation） | 进声明（levels / representations） | 状态 |
|---|---|---|---|---|---|---|
| High | 细模 | 完整几何 + 完整 Shader | 是 | 是 | 是 / 是 | **已实装**（夏栎 T009.6） |
| Mid | 中模 | 降几何细节 + 降 Shader 成本 | 是 | 是 | 是 / 是 | **已实装**（夏栎） |
| Low | 远模 | 保轮廓 / 体量 / 颜色层次 | 是 | 是 | 是 / 是 | **已实装**（夏栎） |
| Canopy | 远景冠层代理 | 冠幅 / 轮廓 / 体量 / 绿色覆盖率（预算见运行面 §六.2） | 否（非构建档） | **是**（D41 转正，T021.1 落型） | 否 / **是** | 契约已立（T021.1）；内容 T021.6 BroadleafCanopyProxy |
| Proxy | 代理体 | 主要轮廓 + 基本体量 + 必要颜色/拾取/阴影特征（如 GLB 低模代理） | 否（预留） | 否（预留） | 否（预留） | 规范预留——**未实装未验证** |
| Impostor | 面片替身 | Billboard / 多视角 Atlas（Albedo / Normal / Depth），极远距 | 否（预留） | 否（预留） | 否（预留） | 架构预留不实装（扩展路径 = representation-runtime.md §十六） |
| Culled | 不渲染 | **提交终态（submit state，D41）**：超远 / 被裁剪的最终提交状态（不渲染、不可拾取） | 否 | **否——独立提交状态类型 LodSubmitState，非表示成员**（T021.1 移出联合） | 否 | T006 实装（裁剪既有） |

- **运行表示联合（T021.1 落型）= High / Mid / Low / Canopy**（domain/lod/representation，类型真相源）；提交终态 Culled 独立建模（LodSubmitState）。Proxy / Impostor 仍是规范语义位：不进任何类型枚举、不进声明、不写接口占位代码（防幽灵字段，D27.7/D27.12）。Canopy 内容交付与材质契约见 `representation-runtime.md` §六（运行面），本表 Proxy 行保留为 GLB 低模代理语义位。（2026-09-23 D41 修订 + T021.1 落地：Canopy 转正为第一阶段运行表示〔T021.6 BroadleafCanopyProxy〕、Culled 改为提交状态表述并移出表示联合。）
- **范围门（判定绑定观测指标，006.5 执行）**：十万实例压力下 triangles / draw calls / frame time p95 任一超预算 → Impostor 升级必做。
- GLB Proxy 语义收录：GLB 资产未来可用低模 GLB 作 Proxy 档——语义方向收录，**未经验证**，不在本期任何验收面内；届时过增量决策再定接口。
- **GLB LOD 消费硬约束（D28.5，2026-09-20 升格）**：GLB 资产未来接入多档必须**直接消费现有 Asset Runtime LOD**——扩展点 = `ModelAsset` levels 声明 + `Renderer.declaredLevelsOf` + SourceRouter file 分支 level 透传；**禁止另建 GLB 专用 LOD 体系**（D27.1 资产域专属禁令延续）。现状：GLB 已走共享链（file 分支忽略 level → 恒 High + 超远 culled），仓库零 GLB 专用 LOD 代码；Proxy/Impostor 预留位语义不变。

## 4. 选档语义规范（Runtime 侧，T006 实施依据）

> （2026-09-23 D41 起：本节为 T006 时期实施依据快照——度量 `m`、稳定基准球、正交退化、chunk 代表口径继续有效；表示链阈值与 screenFraction 口径、Selection / Transition Granularity、Bounds 契约以 `representation-runtime.md` §四 为准，阈值重锁归 T021.8。）

### 4.1 度量 = 归一化视距（张角，D27.2）

- 定义：`d` = 相机到资产包围球中心（散布链为 chunk 代表点）的距离，`r` = 包围球半径（含代表 scale），选档度量 = `d / r`（资产对相机张角 / 屏幕占比的单调函数）。
- 基准半径 = **High 档派生的稳定基准**（D28.2，T006.6 实装 2026-09-20）：两链选档输入恒取 High 档源几何一次派生并冻结的 referenceSphere（Runtime 派生缓存：放置链按 sourceKey、散布链按 assetId；放置链代表点 = 基准球心过实例矩阵）——同一实例 / (块×资产) 任意当前档位下选档度量恒定，迁档不换选档输入。**剔除不跟随**：视锥剔除继续用各档真实几何包围球。该基准是 Runtime 派生缓存值，**非资产声明字段**（D28.4）。历史：2026-09-20 前曾取当前档位几何包围球（依赖档间近似同值假设，迁档读数平移由 hysteresis 吸收）——T006.6 Step 1 测试先行修复假前提、Step 2 换轨本语义。
- 为什么：与分辨率 / DPR / 视口尺寸解耦——同一阈值在 1080p 与 4K、不同视口下语义不变。
- 像素口径（如「> 180px 取 High」）仅用于验收报表与调试显示，**不作选档输入**。
- 禁止全资产统一距离阈值（「0–25m High」这类）——建筑 40m 与消防栓 0.8m 同距屏幕占比完全不同。
- 阈值数值 = Runtime 全局策略常量（`LOD_THRESHOLDS` 6/16/60/0.15），**T006.5 验收门实测锁定**（2026-09-19，docs/acceptance/t006/006.5/：双档验收 + 换档序列单调无震荡 + 视觉核验过；数值变更须重开实测记档）。

### 4.2 正交退化口径

正交相机无「距离」概念：退化为**几何尺寸 / 正交视高**之比——与透视张角同一单调语义，阈值带连续可复用。

### 4.3 chunk 代表口径（散布链，候选保守策略）

- 代表距离 = **块最近点**（非块中心——防块远侧实例被高估距离而提前降档）；
- 代表 scale = **块内 max**（最大实例——保守偏高档）。
- 两者为保守策略，T006.5 实测效果确认（选档分布随视距单调迁移、无档位震荡——docs/acceptance/t006/006.5/）；架构不锁死「整块同档」——需要时演进为 chunk 内多 Render Bucket（lod-reference §7 收录为演进方向）。

### 4.4 hysteresis

档位切换阈值带迟滞（升档阈值 ≠ 降档阈值），相机在边界附近来回不抖动换档；迟滞带宽 = Runtime 策略常量（006.1 落地）。

### 4.5 评估器分层——domain 纯函数（D27.5）

| 层 | 位置 | 职责 |
|---|---|---|
| 选档评估器 | `src/domain` 纯函数，零 THREE（check:layers 强制） | 纯数据入（相机位姿 / fovY / 正交标志 + 包围球与代表距离）→ 档位出；node 可测（shapeSlotOf 纯函数先例同构） |
| Runtime 接线 | `src/runtime` | 组织输入（chunk 代表距离 / 代表 scale / 包围球）、维护 hysteresis、执行切换与分桶 |

**散布 / 放置两链共享同一选档语义，不复制逻辑。** LOD 总开关（关 = 全 High，回退对比与兜底）在 006.1 定义、006.3 消费。

### 4.6 档位 = 每帧派生态（D27.6）

档位是相机状态的纯函数，每帧可重算：**不进 Scene、不进 Command、不缓存进持久状态**。帧内时序 = 块剔除之后、render 之前。

## 5. 家族预算表规范

### 5.1 旧口径废止（依据记档）

旧口径（D11 时期旧 T006.1 任务书）：植物统一三档 **粗 ≤300 / 中 ≤800 / 细 ≤2000** 三角形（与 003.4「单株细模 ≤2000」同源纪律——松/花 136、灌 400、橡 688 面的旧小植物时代）。**已废止（D23.3 / D27）**：

1. **尺度失配**：旧数字按 0.4–7m 风格化低模小植物标定；T008 起 3A 级路线夏栎 High 档单株即 ~40K 面，量级差一个数量级以上。
2. **性质失配**：旧口径是「植物专属统一预算」，违背 D20.5「LOD = 统一 Asset Runtime 能力、不同资产不同预算」与 D27.1「禁止资产域专属 LOD」。
3. **D23.3 已定**：triangleCount 是统计/记录字段，预算由**资产族**与 LOD 验收锁定，不构成公共硬契约。

旧数字仅存历史任务记录，不得作为任何新资产的预算依据。

### 5.2 预算表（家族分级制）

预算单位 = 三角形实数（多材质组 = 各组之和）；High 锁单上限，Mid / Low 锁区间——**下限防「省面当目标」观感塌方**（003.4 教训：实交付 136–688 面远没用满预算）。

| 家族 | High | Mid | Low | 状态 | 锁定记录 |
|---|---|---|---|---|---|
| 阔叶乔木 broadleaf（夏栎第一实例） | ≤ 40000 | 6000–10000 | 1500–3000 | 已锁定 2026-09-19（T009.6） | `asset_tree_3a.asset.ts` 模块头账目 + broadleafLod 测试不变量 |

- 预算归**家族级**：同家族共享区间，族内资产按观感用满预算；新家族（针叶 / 花木 / 灌木 / 地被 / 非植物…）立项时新增行，先候选后锁定。
- 预算制口径（D19.8 / D20.5 延续）：预算是工程目标非视觉验收门槛——锁定由「实测面数符合锁定值 + 固定机位观感 + 性能实测」共同裁定；**锁定后实际面数必须符合**（资产侧测试锁不变量）。
- meta `triangleCount` = High 档实数（多档起声明面取细模档；夏栎 35058 = slot-0 High）。

### 5.3 实测锁定流程（新资产 / 新家族 SOP）

1. **候选带**：家族首资产立项时定三档候选区间（参考同尺度已锁家族 ± 观感目标，写任务书）。
2. **实装**：三档同 rng 流派生（档间不变量义务 §2.3）。
3. **探针实测**：全形态槽 × 全档位实测面数带（夏栎 8 槽 × 3 档先例）。
4. **锁定判据**：实测带落候选带内 → 按候选带锁；High 实测低于候选下限 → **按上限锁**（面数预算意义在上限——夏栎 slot-6 实测 28754 < 候选下限 30K 先例）；Mid / Low 实测出带 → 调几何重测，或修带并记档理由。
5. **落盘**：资产模块头「预算锁定账目」（锁定值 + 实测带 + 锁定依据）+ meta `triangleCount` + 测试锁不变量（面数带 + 档间恒等）。
6. **回写本表**：新增 / 更新行 + 状态 + 记录指针。

夏栎第一实例实测数据（量级参照）：皮恒 20724 / 3882 / 330（High / Mid / Low）；High 总面 28754–38780（8 槽带，slot-6 最低 / slot-7 最高；叶卡 4015–9028）；Mid 6414–9650（叶卡 ≈ High 存活卡 × 7/22）；Low 1662–2150（壳卡 = 保留簇 × 2）；rng 消费三档恒等 177234、minY 三档恒 0。

## 6. T006 接缝——职责边界表

> （2026-09-23 D41 起：本表 `level` 维度由 `representation` 接替、`culled` 转为 submit state、新增双表示共存与编辑态 pin——见 `representation-runtime.md` §四.4 / §五 / §十 / §十二；021.1 / 021.7 落地时本表同步改写，历史表述在此之前仅作 T006 语境快照。）

| 事项 | 资产侧（声明与内容交付，T009.6 型任务） | Runtime 侧（调度与消费，T006） |
|---|---|---|
| 档位声明 | `levels` meta（§2） | 读声明构造候选档位链；不完整链跳档（006.1） |
| 档位内容 | `build({level})` 几何+材质+深度材质成套、档间不变量、预算账目（§5） | — |
| 选档 | — | 归一化视距评估器（domain 纯函数）+ 正交退化 + chunk 代表口径 + hysteresis（006.1） |
| 切换 | — | 散布 = 确定性重撒重建；放置 = 实例跨桶迁移（池已有跨池迁移）——复用既有机制，**不引入「桶键不含 level、桶内换 Source」新机制**（D27.4）（006.3） |
| 分桶 | — | 散布 = chunk × source × level；放置 = source × level（006.3） |
| 批次控制 | — | 块尺寸自适应 + 远处合并/密度降级 + draw call 预算上限常量化，防「块×资产×档」批次爆炸（006.4） |
| 缓存 | — | `sourceKey::level` 双维缓存 + evict 换档释放（已落地，T009.6） |
| 裁剪 | — | chunk cull → frustum cull → 选档（看不见的对象不进 LOD；Culled 是调度结果） |
| 拾取 | — | 跨档一致：任意档实例映射回同一业务对象/区域 |
| 总开关 | — | LOD off = 全 High（回退对比与兜底） |
| 档位状态 | — | 每帧派生态：不进 Scene / Command / 持久缓存；块剔除后、render 前（§4.6） |
| 验证面 | 强制档位生成（DEV mountLevels 型出图面）+ 档间取证（T009.6 先例） | 七项观测（D27.9：FPS / frame time p95·p99 / draw calls / triangles / visible instances / LOD 分布双口径 / 各 Representation 桶数）；跳变口径（D27.10：连续相机移动机器 diff + 换档点前后帧人工复核，判「无 pop / 无闪烁」不判「两档图像一致」）；同场景 LOD 开/关对照组（D27.13） |

- 两链验证分工（D27.8）：散布链验 chunk × level 桶机制（当前散布不带 seed 全路由 slot-0 的单 source 限制接受）；多 source × level 交叉桶验证归放置链。
- T006 排期（D27.11）：T010 之后、T011 族建设之前——族建设放量前调度必须就绪；006.1 前置 = T009.6 + 本规范（T010.3）。

## 7. 新资产 LOD 声明路径速查（T011+）

1. 家族已有预算行（§5.2）→ 按行内区间做三档；家族无行 → 走 §5.3 候选带流程。
2. meta 声明 `levels: [{ id }]`（最小化，不加字段）；`triangleCount` 填 High 档实数。
3. build 透传 `params.level`（缺省 `'high'`，旧路径逐位不变）；材质工厂按档变体 + `customProgramCacheKey` 档位唯一；带影裁切的资产深度材质随档匹配（夏栎先例：Mid=High SDF / Low=Low SDF）。
4. 档间不变量测试锁定（同 rng 流 / 轮廓连续 / 面数带）；DEV 强制档位出图面取证。
5. 选档 / 切换 / 分块 / 批次一行不写——那是 T006 的（§6）。
