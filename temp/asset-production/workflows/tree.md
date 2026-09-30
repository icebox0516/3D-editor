# Tree Workflow（乔木生产方法剖面）

> 归属：`asset-production` 入口（SKILL.md）· 路由键 `workflow: tree` · 架构锚 DECISIONS D36；跨方法共性规则基座 = `spine.md`（D43），本文件不重复其内容。
>
> **定位**：乔木生产方法剖面正文（D36 第 2 条 + D43「spine + 方法剖面」两层结构——跨方法共性规则归 spine.md）。本文件回答「乔木怎么生产」：适用判定 / Family 参数位 / Step 0–4 乔木方法差异 / read-set 必读表 / 验收与同步落点。
>
> **硬边界**：①资产数值零出现——一切资产数值（物理域 / 预算 / 参数 / 计数）只存在于 Reference Spec、docs 工程规范、家族契约、任务书（方法级标定参数〔D38 采样档 / 基线帧参数名〕除外）；②不承载 taxonomy（D22——路由按生产方法不按资产分类）；③不含执行模式位（连续轮 vs 标准模式按 DECISIONS 当前有效裁定）；④不含任务排程（预立下一任务由 Epic / TASKS 决定，D36 第 9 条）。

## 1. 适用判定与 Family 参数位

- **适用**：单干树木类资产（主干 + 冠层 + SDF 叶 / 树皮材质 + LOD 档位派生 + Shadow 通道的生产方法域）。
- **分裂反查（D36 第 5 条）**：Step 集合 / Agent 派遣职责面 / 验收结构可由参数位或局部扩展承载 → 留在本 Workflow；无法参数化承载 → 新 Workflow（真实消费者触发，不预建）。

### Family 参数位（真实消费者：broadleaf / conifer——conifer 由 T012 立项触发加行，2026-09-28）

| 参数位 | broadleaf 当前值 | conifer 当前值 |
|---|---|---|
| 家族契约 | `src/runtime/procedural/tree/broadleaf/broadleafShapeProfile.ts`（实例化与提炼纪律见 organization.md §3） | `src/runtime/procedural/tree/conifer/coniferShapeProfile.ts`（**T012.1 首例创建草案**，D37.2——字段全有真实消费点、全标【家族共性候选】，第二例真实消费后转正定稿） |
| LOD 预算 | lod-spec.md §5.2 家族预算行 broadleaf（已锁定） | §5.3 候选带流程（T012 立项定候选带，012.1 探针实测锁定回写 §5.2） |
| 视觉验收口径 | D30 增量口径（本家族首例完整验收已毕；**新家族首例按所属 Workflow 定义的首例验收深度执行**——tree = 完整首例流程，D30 最低可信证据原则） | T012.1 = 新 Family 首例完整首例流程（spine §6 D37 六步）→ 后续成员 D30 增量口径 |
| 先例 / 知识索引 | `docs/procedural-assets/precedents/broadleaf.md`（存在则同步，D36 第 9 条） | `docs/procedural-assets/precedents/conifer.md`（T012.1 首建；**族内无先例时 Step 1 经 broadleaf 索引跨族方法复制**——方法管线〔几何/材质/测试/Stage〕共享、形态语言改写，任务书锚定） |
| 族级规则与状态 | 所属 Epic（阔叶 = `tasks/011-broadleaf-trees.md`：族级契约规则 / 成员清单与增补规则 / 族级验收门 / 依赖与状态——进度流水不落 Epic，完成详情归各任务书完成记录，D36 瘦身口径） | 所属 Epic（针叶 = `tasks/012-conifer-trees.md`，同构口径） |

新 family 进入本 Workflow = 参数位加一行（真实消费者触发）；家族契约默认零触碰（缺口记档归族级验收门；阻塞例外 D31.2 最小必要修订，主代理判定留痕）。

新 Family 首例流程 = spine §6（D37 六步，跨 Workflow 通用）；本方法为复杂方法，首例验收深度 = tree 完整首例流程（D30 最低可信证据原则）。

## 2. Step 总览（乔木方法）

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

编排骨架规则（角色槽 / 恒真规则）= spine §1；read-set 消费链与表格规范 = spine §2；派遣路由按 AGENTS.md「多 Agent 按 Step 派遣」。

## 3. Step 详述

### Step 0 Research / Reference Spec（通用子代理，加载 asset-research 技能）

- Research Gate 判定逐资产独立留痕于任务书，不以「同家族已有先例」为由跳过；强制 / 豁免情形与执行细则按 D26 与 asset-research（时序规则 = spine §1「Gate 先于依赖现实对象的开发 Step」；豁免的是调研动作而非 Spec 落盘）。
- 调研执行：asset-research 技能 → 结论落盘 `docs/research/<asset>-reference.md`（骨架字段集按 Research Scope 按需填写、可裁剪；Form / Evidence Status 两轴标注；Spec Version 头）。来源路由按 D32 / asset-research 检索节。
- **主代理采样终审（D38，树族口径）**：硬数值只抽查直接进参数面的承重锚 **≈5–8 项**（独立重拉权威原句逐位比对、不抄调研稿）；照片只双问承重结构 / 比例主张槽位（整树 / 冠形 **≈2–3 张**，规程按 `asset-research/references/photo-verification.md`——双问不一致即该照片不承重处置并记档、不取折中）；其余信调研稿、保留随时抽查权；终审结论一行化落 Spec（通过 / 修正项 / 日期），修正直接改写摘要区与正文对应条目（不追加文末附录节），详细双问过程归任务完成记录。
- **开工校验**：开发 Agent 开工前校验任务书 Spec Version 锚点与当前 Spec 一致（不一致有权打回）。
- 参考图仅用于定调 / 参数制定 / 开发对照 / 固定机位验收，不进产品运行时与代码契约（任务书 Constraint 按 D13）。

### Step 1 结构分析（主代理）

- Spec → **先例方法基线对照**：经 Family 参数位的先例索引检索同型先例 → 逐维度判定「可直接继承 / 需按本资产改写 / Unknown」（新资产无「现状」，以家族先例复制基线为参照系）；每条改写映射实现面（几何 / 参数 / 材质）；先例索引 = **方法摘要 + 导航**（既非纯导航、也非事实源——数值与细节仍回原任务书 / 原 Spec 核对，D40）。
- **先例杠杆适用性判定纪律**：判「先例经验杠杆不适用本资产」须像素级或先例双证据支撑，禁纯推理否决（012.2「羽卡聚合单元例外」判定被像素实测证伪记档）。
- 读取顺序与观察钩子 = spine §2（先例索引 → 承重数值定点读 → 不足报授权扩大；完成记录记读取深度）。
- **表达路径判定**：新形态语言（叶形 SDF / 复叶型 / 挂点叶序 / 花果器官 / 树皮语言等）沿承先例路径 or 分化——判定与理由记入任务书「待裁决位」；可行性预判不可行处即契约缺口候选。
- **可选器官建模判定**（花 / 果 / 季相语义等）：先例账目法（属相内显著性对照 + 生长季主语境覆盖 + 家族独有性），逐条裁决记档；「记档不建模」的语义显式落任务书 Constraints。

### Step 2 参数化（procedural-asset-agent）

- `tree/<asset>/<asset>ShapeProfile.ts`：家族契约实例化——契约字段填本资产数值，**逐字段 Spec 依据 + Evidence Status + 三标注**（【家族共性候选】/【本资产特有】/【工程设定无现实基准】——工程设定明确标注不编造现实依据）。
- **结构计数类字段跨槽恒等**（皮面数恒等 + rng 消费次数恒等 + rng 无条件消费纪律——消费次数与数据分支无关）；槽差异全部落连续形态参数（伪差异禁止项沿家族先例任务）；槽位组织与差量展开语法沿家族先例。
- slot-0 锚点 + 其余槽差量；**涌现值与 Spec 域不符时回调参数面并记档**（探针实测驱动的数值面修正属正常回路）。
- **密度/卡尺度初值先验**：密度类参数从 Family 先例索引所记同族校准终值带起步（无终值带时记档初值依据）；初版密度显著低于终值带即疑点信号。
- **参数面自检断言**：模块头算术摘要 vs 数据行一致性断言 + 拓扑展开（皮面数等）断言入测试——拦截笔误类缺陷（012.1 childPlan 笔误实证）。
- 数值依据全部留资产 config，家族契约不落数值（organization.md §3）。

### Step 3 实现（3a ∥ 3b 文件集不相交并行；3c 合并后）

- 并行纪律与中断恢复 = spine §1（文件集不相交 + 冻结接口在派遣简报声明〔含隐式接口清单〕；中断即未验证）；**合并对账**：3a∥3b 合并（3c 派遣前）对冻结接口单显式对账，偏离处显式裁定记档——不靠下游重验顺带发现。
- **3a 几何 + 入口（procedural-asset-agent）**：`tree/<asset>/<asset>Geometry.ts`——先例方法复制 + 本资产算法细节（干形 / 冠形 / 枝姿 / 挂点 / 器官账目按 Step 1 判定路径与 Spec / profile）；LOD 档位派生同流（档间不变量按 lod-spec，同 rng 流 / 轮廓体量颜色连续）；入口 `assets/asset_tree_<asset>.asset.ts`（meta 同契约：taxonomy / shapeFamily / levels / triangleCount = 细档实数 / proceduralProfile 实测带；build slot→profile 路由 + level 透传 + customDepthMaterial 通道——组织与命名按 organization.md §2）。
- **3b 材质（park-shader-agent）**：`tree/<asset>/<asset>Materials.ts`——叶 SDF（新形最小扩展限定文件内、记缺口候选）+ 缘齿载波 + 脉型 + 两面色差 + 背光透射 + 风动两层（aSeed / aBend 契约字段沿用，树高锚同步轮）+ 树皮配方（语言与先例谱系分化）+ 器官材质若做按先例 + 深度材质同源 GLSL（SDF alpha 与表面材质共享同一 GLSL 字符串——shadow-visual-sop §1.4）+ 材质键分档（customProgramCacheKey 档位唯一）。**GLSL 改动先过真实编译（console 零错误零警告）再收口。**
- **3c DEV 出图面（threejs-runtime-agent，3a/3b 合并后）**：`tree/<asset>/<asset>Stage.ts` 同构家族先例（mountSlots / view / mountLevels；import.meta.env.DEV 守卫，生产零痕迹）+ bootstrap `window.__<asset>`；VIEW_TARGET_Y 几何实测定档；取证机位能力缺口评估（门控型树皮等）记档；**像素量化交付**：交付必含 M25 基线机位帧 + 冠带绿覆盖像素量化值（工具复用族先例取证 tools，勿会话内重建）——密度/可见性异常在 3c 即暴露，不流入 Step 4。

### Step 4 视觉验证（主代理，D30 增量口径）

- 三必做机制与证据形式 = spine §4；乔木实例化：①身份判定——对照 Spec「身份 / 识别特征」节出结论记档（含与先例的横向对照读向）；②统一基线帧 `baseline.png` = **M25 机位 + day 预设固定灯光 + freezeTime**（参数与命名按 shadow-visual-sop §3）落 `docs/acceptance/<epic>/<子任务>/`；③契约缺口记档（归族级验收门）。
- **疑点触发清单（乔木）**：多机位取证 / 离屏探针 / **风动三证据**（运转 / 冻结全零 / 相位互异；叶可见性经像素确认后采集或复验）/ console 回读 / LOD 档间视觉复查——触发机制按 spine §4（不作默认）；shadow-visual-sop §2 十项检查单在本层为**疑点对照清单**而非必跑清单。
- **判读纪律（乔木）**：console 零错误零警告（含转台）；LOD 档间连续（逐档可辨、无断崖无卡片感）；风动三证据；孤证须多帧仲裁。
- 校准护栏与人工裁定门例外 = spine §4（一轮默认两轮封顶、上收不硬磨；锚点门 / 形态筛选门任务书明确标注才触发——008.3 / 009.3 先例）。
- 视觉裁定 = 机器判定为判据，用户异议窗口开放（基线帧 + 取证目录可回溯）；取证落档规范（README 判定表 + 证据图 + tools 复现脚本）按 shadow-visual-sop §3——README 判定表含**像素量化数值列**（012.2 起实际做法成文）；canopy 远景取证机位须在表示过渡带外（dual-submit + 雾化区不可读）并配 distribution 探针佐证（012.2 400m 机位教训；012.3 实测 d500 对 8m 小树 = culled——**机位按包围球体量校验**）。

### 测试与三门槛

- 测试纪律与三门槛判据式口径 = spine §3（五者准入 / 公共能力不复制 / 执行模式按 DECISIONS 当前有效裁定）。
- 乔木测试组织对称家族先例（分件：Structure / Lod / ShapeSlots / Materials / Stage 型分件 + 入口 meta / 路由）；注册回归断言扩充零新增文件；子任务内定向自跑通过。

## 4. 派遣面（read-set 消费链，D36 第 6 条）

消费链四环节 / 表格三列化规范 / 派遣简报形状 / 观察钩子 = spine §2。Step 执行者：0 = 通用子代理（asset-research）；1 / 4 = 主代理；2 / 3a = procedural-asset-agent；3b = park-shader-agent；3c = threejs-runtime-agent（派遣路由按 AGENTS.md「多 Agent 按 Step 派遣」）。

read-set 表（乔木方法必读集）：

| Step | Path | Section（读取上限） | Mode |
|---|---|---|---|
| 0 | asset-research SKILL.md | 全文 | full-read |
| 0 | asset-research references/* | photo-verification.md 供主代理终审 | on-demand |
| 0 | 当前任务书 | §Research Gate / §重点调研面 | point-read |
| 1 | 当前 Reference Spec | 消费摘要区（证据层按需，D38） | point-read |
| 1 | Family 参数位先例索引 | 全文（方法摘要 + 导航） | full-read |
| 1 | 先例原任务书 / 原 Spec | 承重数值对应节 | point-read |
| 1 | spine.md | §2（读取顺序与观察钩子） | point-read |
| 2 | 本文件（tree.md） | §Step 2 | point-read |
| 2 | organization.md | §2–§3 | point-read |
| 2 | 家族契约文件 | 全文 | full-read |
| 2 | 当前任务书 | 参数位 / 裁决位 / Scope | point-read |
| 2 | 当前 Spec | 消费摘要区 | point-read |
| 3a | 本文件（tree.md） | §Step 3a | point-read |
| 3a | organization.md | 全文 | full-read |
| 3a | lod-spec.md | §5 预算 / §7 声明路径 | point-read |
| 3a | 家族契约文件 | 全文 | full-read |
| 3a | 当前任务书 | 全文 | full-read |
| 3a | 当前 Spec | 消费摘要区 | point-read |
| 3b | 本文件（tree.md） | §Step 3b | point-read |
| 3b | shadow-visual-sop.md | §1 | point-read |
| 3b | lod-spec.md | 档位与材质键分档节 | point-read |
| 3b | 当前任务书 | 全文 | full-read |
| 3b | 当前 Spec | 消费摘要区 | point-read |
| 3c | 本文件（tree.md） | §Step 3c | point-read |
| 3c | organization.md | §2.1（DEV 出图面） | point-read |
| 3c | 家族先例 Stage | 按需 | on-demand |
| 4 | spine.md | §4（三必做 / 疑点触发 / 校准护栏） | point-read |
| 4 | shadow-visual-sop.md | §2–§3 | point-read |
| 4 | DECISIONS D30 | 该条（主代理点名定向读取） | point-read |
| 4 | 当前任务书 | 疑点清单 / Acceptance | point-read |

## 5. 验收结构

- **单资产**：任务书 Acceptance（三门槛判据式口径 + spine §4 三必做 + Spec 终审 + 取证目录）+ 本 Workflow 各 Step 验收点。
- **族级**：七项骨架 = spine §5（带适用性，不重跑单资产已完成项）；family-specific 检查项归各 Epic 定义（Broadleaf 实现留在 011.13 完成记录，不复制进本文件）；更多家族真实执行后按 §6 同步机制评估升格（D20.3）。

## 6. 同步机制落点（乔木）

机制正文（四问筛选器 / 五向分流 / 升格三级 / 完成记录收口 / 索引维护规则）= spine §7。本方法落点：先例 / 知识索引 = Family 参数位指定（`precedents/<family>.md`）；不含任务排程。
