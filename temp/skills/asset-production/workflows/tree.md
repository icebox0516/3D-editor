# Tree Workflow（树木生产方法）

> 归属：`asset-production` 入口（SKILL.md）· 路由键 `workflow: tree` · 架构锚 DECISIONS D36。
>
> **定位**：树木资产完整生产流程编排的唯一规范正文（D36 第 2 条）。本文件回答「应该检查什么 / 什么时候检查 / 依赖哪个规范 / 需要哪个参数位 / 派给谁 / 产出什么 / 验收什么」。
>
> **硬边界**：①正文数值零出现——一切数值（物理域 / 预算 / 参数 / 计数）只存在于 Reference Spec、docs 工程规范、家族契约、任务书；②不承载 taxonomy（D22——路由按生产方法不按资产分类）；③不含执行模式位（连续轮 vs 标准模式按 DECISIONS 当前有效裁定）；④不含任务排程（预立下一任务由 Epic / TASKS 决定，D36 第 9 条）。

## 1. 适用判定与 Family 参数位

- **适用**：单干树木类资产（主干 + 冠层 + SDF 叶 / 树皮材质 + LOD 档位派生 + Shadow 通道的生产方法域）。
- **分裂反查（D36 第 5 条）**：Step 集合 / Agent 派遣职责面 / 验收结构可由参数位或局部扩展承载 → 留在本 Workflow；无法参数化承载 → 新 Workflow（真实消费者触发，不预建）。

### Family 参数位（当前唯一真实消费者：broadleaf）

| 参数位 | broadleaf 当前值 |
|---|---|
| 家族契约 | `src/runtime/procedural/tree/broadleaf/broadleafShapeProfile.ts`（实例化与提炼纪律见 organization.md §3） |
| LOD 预算 | lod-spec.md §5.2 家族预算行 broadleaf（新家族无行走 §5.3 候选带流程） |
| 视觉验收口径 | D30 增量口径（本家族首例完整验收已毕；**新家族首例例外走完整口径**——D30 第 4 条） |
| 先例 / 知识索引 | `docs/procedural-assets/precedents/broadleaf.md`（存在则同步，D36 第 9 条） |
| 族级规则与状态 | 所属 Epic（阔叶 = `tasks/011-broadleaf-trees.md`：族级契约规则 / 成员清单与增补规则 / 族级验收门 / 依赖与状态——进度流水不落 Epic，完成详情归各任务书完成记录，D36 瘦身口径） |

新 family 进入本 Workflow = 参数位加一行（真实消费者触发）；家族契约默认零触碰（缺口记档归族级验收门；阻塞例外 D31.2 最小必要修订，主代理判定留痕）。

### 新 Family 首例流程（D37——本 Workflow 首个契约消费者）

1. **Epic 立项**（D33）：先创建族 epic 文件（成员清单 / 族门编号 / 增补规则 / 依赖）——族级验收门与成员集合口径由 Epic 承载，首例任务书挂于其下。
2. **Step 0 照走**：Research Gate → 最小充分调研 → Reference Spec。
3. **家族契约草案创建**（Step 2 内执行）：尚无契约可实例化时，由首例创建**契约草案**——字段全部有真实消费点（organization.md §3.1 不变）、一律标注【家族共性候选】（单样本不足以判定家族共性）；数值依据照常全留资产 config（organization.md §3）。
4. **首例完整验收**：D30 第 4 条完整 SOP 口径（契约首证 + 方法复制 + 缺口发现三重职责）。
5. **完成同步**：先例 / 知识索引不存在则由首例建立 `precedents/<family>.md`（见 §6）；流程教训评估照走。
6. **第二例起增量模式**：契约草案经第二个真实消费者消费后**转正定稿**；第二例修订候选字段属草案转正轻量路径，不算契约缺口（D37）。

## 2. 生产脊柱（总览）

```
Step 0 Research / Reference Spec（通用子代理 · asset-research）
   ↓
Step 1 结构分析（主代理）——先例基线对照 + 表达路径判定
   ↓
Step 2 参数化（procedural-asset-agent）——家族契约实例化
   ↓
Step 3 实现（3a 几何 ∥ 3b 材质，文件集不相交并行 → 3c DEV 出图面，合并后）
   ↓
Step 4 视觉验证（主代理 · D30 增量口径）
   ↓
测试与三门槛 → 同步机制（先例索引 / 流程教训评估 / 完成记录收口）
```

派遣路由按 AGENTS.md「多 Agent 按 Step 派遣」；read-set 消费链见 §4。

## 3. Step 详述

### Step 0 Research / Reference Spec（通用子代理，加载 asset-research 技能）

- **Research Gate 判定（D26）逐资产独立留痕于任务书**——不得以「同家族已有先例」为由跳过；强制 / 豁免情形按 D26（豁免四情形留 `Status: waived + Reason + Evidence`；豁免的是调研动作而非 Spec 落盘）。**Gate 先于一切依赖现实对象定义的开发 Step**。
- 调研执行：asset-research 技能 → 结论落盘 `docs/research/<asset>-reference.md`（通用骨架与域 Schema 为**可用字段集**——按 Research Scope 按需填写、可裁剪，最小充分口径见 asset-research；Form / Evidence Status 两轴标注；Spec Version 头）。来源路由按 D32 / asset-research 检索节。
- **主代理采样终审（D38）**：抽样框 = Spec 消费摘要区——硬数值只抽查直接进参数面的承重锚（≈5–8 项，独立重拉权威原句逐位比对、不抄调研稿），照片只双问承重结构 / 比例主张槽位（整树 / 冠形 ≈2–3 张，规程按 `asset-research/references/photo-verification.md`——双问不一致即该照片不承重处置并记档、不取折中），其余信调研稿、保留随时抽查权；终审结论一行化落 Spec（通过 / 修正项 / 日期），**修正直接改写摘要区与正文对应条目**（不追加文末附录节），详细双问过程归任务完成记录。
- **开工校验**：开发 Agent 开工前校验任务书 Spec Version 锚点与当前 Spec 一致（不一致有权打回）。
- 参考图仅用于定调 / 参数制定 / 开发对照 / 固定机位验收，不进产品运行时与代码契约（任务书 Constraint 按 D13）。

### Step 1 结构分析（主代理）

- Spec → **先例方法基线对照**：经 Family 参数位的先例索引检索同型先例 → 逐维度判定「可直接继承 / 需按本资产改写 / Unknown」（新资产无「现状」，以家族先例复制基线为参照系）；每条改写映射实现面（几何 / 参数 / 材质）；先例事实回原任务书 / 原 Spec 核对，索引只导航不承重。
- **表达路径判定**：新形态语言（叶形 SDF / 复叶型 / 挂点叶序 / 花果器官 / 树皮语言等）沿承先例路径 or 分化——判定与理由记入任务书「待裁决位」；可行性预判不可行处即契约缺口候选。
- **可选器官建模判定**（花 / 果 / 季相语义等）：先例账目法（属相内显著性对照 + 生长季主语境覆盖 + 家族独有性），逐条裁决记档；「记档不建模」的语义显式落任务书 Constraints。

### Step 2 参数化（procedural-asset-agent）

- `tree/<asset>/<asset>ShapeProfile.ts`：家族契约实例化——契约字段填本资产数值，**逐字段 Spec 依据 + Evidence Status + 三标注**（【家族共性候选】/【本资产特有】/【工程设定无现实基准】——工程设定明确标注不编造现实依据）。
- **结构计数类字段跨槽恒等**（皮面数恒等 + rng 消费次数恒等 + rng 无条件消费纪律——消费次数与数据分支无关）；槽差异全部落连续形态参数（伪差异禁止项沿家族先例任务）；槽位组织与差量展开语法沿家族先例。
- slot-0 锚点 + 其余槽差量；**涌现值与 Spec 域不符时回调参数面并记档**（探针实测驱动的数值面修正属正常回路）。
- 数值依据全部留资产 config，家族契约不落数值（organization.md §3）。

### Step 3 实现（3a ∥ 3b 文件集不相交并行；3c 合并后）

- **3a 几何 + 入口（procedural-asset-agent）**：`tree/<asset>/<asset>Geometry.ts`——先例方法复制 + 本资产算法细节（干形 / 冠形 / 枝姿 / 挂点 / 器官账目按 Step 1 判定路径与 Spec / profile）；LOD 档位派生同流（档间不变量按 lod-spec，同 rng 流 / 轮廓体量颜色连续）；入口 `assets/asset_tree_<asset>.asset.ts`（meta 同契约：taxonomy / shapeFamily / levels / triangleCount = 细档实数 / proceduralProfile 实测带；build slot→profile 路由 + level 透传 + customDepthMaterial 通道——组织与命名按 organization.md §2）。
- **3b 材质（park-shader-agent）**：`tree/<asset>/<asset>Materials.ts`——叶 SDF（新形最小扩展限定文件内、记缺口候选）+ 缘齿载波 + 脉型 + 两面色差 + 背光透射 + 风动两层（aSeed / aBend 契约字段沿用，树高锚同步轮）+ 树皮配方（语言与先例谱系分化）+ 器官材质若做按先例 + 深度材质同源 GLSL（SDF alpha 与表面材质共享同一 GLSL 字符串——shadow-visual-sop §1.4）+ 材质键分档（customProgramCacheKey 档位唯一）。**GLSL 改动先过真实编译（console 零错误零警告）再收口。**
- **3c DEV 出图面（threejs-runtime-agent，3a/3b 合并后）**：`tree/<asset>/<asset>Stage.ts` 同构家族先例（mountSlots / view / mountLevels；import.meta.env.DEV 守卫，生产零痕迹）+ bootstrap `window.__<asset>`；VIEW_TARGET_Y 几何实测定档；取证机位能力缺口评估（门控型树皮等）记档。
- **并行纪律**：3a / 3b 文件集不相交，冻结接口在派遣简报声明；**跨会话中断恢复者按「中断即未验证」全量重验交付物**（恢复会话重验纪律）。

### Step 4 视觉验证（主代理，D30 增量口径）

- **三必做**：①Spec 身份判定——对照 Spec「身份 / 识别特征」节出结论记档（含与先例的横向对照读向）；②统一基线帧 `baseline.png`（M25 机位 + day 预设固定灯光 + freezeTime——参数与命名按 shadow-visual-sop §3）落 `docs/acceptance/<epic>/<子任务>/`；③契约缺口记档（有无都记，归族级验收门）。
- **疑点触发**（不作默认）：多机位取证 / 离屏探针 / 风动三证据 / console 回读 / LOD 档间视觉复查——由身份判定疑点、任务书疑点清单或开发 agent 自检信号触发；shadow-visual-sop §2 十项检查单在本层为**疑点对照清单**而非必跑清单。
- **判读纪律**：console 零错误零警告（含转台）；LOD 档间连续（逐档可辨、无断崖无卡片感）；风动三证据（运转 / 冻结全零 / 相位互异）；孤证须多帧仲裁。
- **校准护栏（D30 第 5 条）**：默认一轮、两轮封顶——第二轮仍不达标判疑似结构性问题，记族级契约缺口上收族门，不硬磨参数；终态复拍只拍受影响机位 + 一张基线帧。
- 视觉裁定 = 机器判定为判据，用户异议窗口开放（基线帧 + 取证目录可回溯）。取证落档规范（README 判定表 + 证据图 + tools 复现脚本）按 shadow-visual-sop §3。

### 测试与三门槛

- 测试组织对称家族先例（分件：Structure / Lod / ShapeSlots / Materials / Stage 型分件 + 入口 meta / 路由）；注册回归断言扩充零新增文件；子任务内定向自跑通过。
- `npm test` / `npm run check:layers` / `npm run typecheck` 三门槛全绿零回归——**执行模式（逐子任务 or 末轮统一）按 DECISIONS 当前有效裁定**（现为 D35.1 逐子任务）。
- 收尾进程清理（dev server / 浏览器 / 后台任务不留跨会话残留）。

## 4. 派遣面（read-set 消费链，D36 第 6 条）

消费链：**本文件定义各 Step 必读集 → 主代理解析为 resolved paths → 派遣简报只传 resolved paths → 专业代理自读正文**（专业代理不自行猜测该不该加载技能）。

| Step | 执行者 | 必读集（由主代理解析为具体路径下发） |
|---|---|---|
| 0 | 通用子代理 | asset-research SKILL.md + references/*（photo-verification.md 供主代理终审）；当前任务书 §Research Gate / §重点调研面 |
| 1 | 主代理 | 当前 Reference Spec；Family 参数位先例索引；先例原任务书 / 原 Spec（按需） |
| 2 | procedural-asset-agent | 本文件 §Step 2；organization.md §2–§3；家族契约文件；当前任务书（参数位 / 裁决位 / Scope）；当前 Spec |
| 3a | procedural-asset-agent | 本文件 §Step 3a；organization.md；lod-spec.md（§5 预算 / §7 声明路径）；家族契约；当前任务书；当前 Spec |
| 3b | park-shader-agent | 本文件 §Step 3b；shadow-visual-sop.md §1；lod-spec.md（档位与材质键分档节）；当前任务书；当前 Spec |
| 3c | threejs-runtime-agent | 本文件 §Step 3c；organization.md §2.1（DEV 出图面）；家族先例 Stage（按需） |
| 4 | 主代理 | shadow-visual-sop.md §2–§3；DECISIONS D30；当前任务书（疑点清单 / Acceptance） |

派遣简报形状：`Step / Task 路径 / Spec 路径@版本 / 本文件锚点 / Family / Asset 输出路径集 / 冻结接口声明（3a/3b 并行时）`。

## 5. 验收结构

- **单资产**：任务书 Acceptance（三门槛 + D30 三必做 + Spec 终审 + 取证目录）+ 本 Workflow 各 Step 验收点。
- **族级**：族级验收门归所属 Epic（D30 族级集体验收口径——横向一致性 / 真实差异 / 混植 / 预算 / 性能 / 契约收口 / 回归，不重跑单资产已完成项）。族门方法本体不载于本文件——经真实执行（族级验收门首跑）后按 §6 流程教训评估再定是否升格（D20.3）。

## 6. 同步机制（每资产完成时执行）

- **先例 / 知识索引同步**：对应索引存在则加行 / 补项，不存在则由本家族首例建立（真实消费者触发建库，D37）（Family 参数位指定索引）——至少一条资产入口；产生新形态 / 材质 / 结构先例则补对应索引项；不灌水。
- **流程教训评估（D36 第 11 条）**：本资产新发现逐条过**四问筛选器**（当前有效？流程级？跨资产可复用？无更合适归属？）→ **五向分流**：①仅历史事实 → 完成记录；②先例知识 → 索引；③候选流程教训 → 本文件；④工程契约变化 → docs/procedural-assets 对应规范；⑤执行规则变化 → DECISIONS（并修改本文件）。升格三级：主代理直接记档（历史事实）/ 正常同步（索引）/ **主代理提案 + 用户确认**（生产方法或规范变化——重大者独立 grill）。
- **完成记录收口（D36 第 10 条）**：完成记录只记结果、偏离、事故、验证证据与遗留问题，不重复稳定方法论（方法正文在本文件与 docs）。
- 不含任务排程：预立下一任务由 Epic / TASKS 排程规则决定，不属本节。
