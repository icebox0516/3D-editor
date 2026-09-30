# Simple Asset Workflow（轻量简单资产生产方法剖面）

> 归属：`asset-production` 入口（SKILL.md）· 路由键 `workflow: simple-asset` · 架构锚 DECISIONS D36 / D43；跨方法共性规则基座 = `spine.md`（D43），本文件不重复其内容。
>
> **定位**：轻量简单资产的**批量**生产方法剖面——纯代码几何 + 参数化底材 + 可选 shader 配方注入的静态单体/段式件（园区设施件等）；无家族契约层、无形态槽随机路由、无风动、无档位派生需求。首例消费者：园区设施批 A 交通静态（T025.1，2026-09-28 创建本 Workflow）。
>
> **硬边界**（沿 tree.md 同则）：资产数值零出现——面数线 / 尺寸 / 配方参数只存在于 Reference Spec、任务书与资产模块头；不承载 taxonomy（D22，路由按生产方法不按资产分类）；不含执行模式位与任务排程。

## 1. 适用判定

- **适用**：小体量静态件，几何 = THREE 基元组合（Cylinder/Box/Cone/Torus…+ mergeGeometries），材质 = 参数化底材 + facilityMaterials 式配方注入（或纯底材）；缺省单档（不声明 levels/representations）。
- **分裂反查（D36 第 5 条）**：出现下列任一信号即超出本方法域，回报主代理裁定路由——活动件 / 动画语义（→ 联动 T005 或独立子任务，道闸先例）；形态槽随机路由 / 家族契约层需求（→ 相应家族 Workflow）；档位派生需求（档位**声明**仍可按 lod-spec §7 在本方法内落，派生流水线属 tree 域）；SDF / 风动 / 深度材质 alpha 链。
- **一批一方法**：同批成员复杂度须同域——中等件独立立项或拆批（T025 立项批次切分口径）；批规模按任务书（先例 T002.4 一会话一批）。

## 2. Step 总览（轻量批方法）

```
Step 0 Research / 合并 Reference Spec（通用子代理 · asset-research；一批一合并 Spec + 批内逐资产 Gate 留痕）
   ↓
Step 1 几何 + 入口（procedural-asset-agent）——全批 assets/<name>.asset.ts：几何 + 材质分层 + meta
   ∥ Step 2 材质配方（park-shader-agent）——配方谱系复用优先 / 新配方真实编译验证
   （两 Step 文件集不相交，可并行；串行时材质先行——批次简报裁定并声明冻结接口）
   ↓
Step 3 接线与验收（主代理）——共享锁表 / 计数 / profile 实测、Contact Sheet、冒烟
```

编排骨架规则（角色槽 / 恒真规则）= spine §1；read-set 消费链与表格规范 = spine §2；派遣路由按 AGENTS.md「多 Agent 按 Step 派遣」。

### Step 0（差异点：合并 Spec）

- **一批一合并 Spec**（T025 立项裁定）：`docs/research/<batch-slug>-reference.md`——Spec Version 头照常，批内**逐资产独立节**（身份/识别特征 + 硬数值锚 + 材质相）；Gate 判定逐资产独立留痕任务书（不以同族先例为由跳过，D26）。
- **主代理终审（轻量口径，非树族 D38 档）**：硬数值抽查 = 批级承重锚——逐资产至少一项直接进几何参数面的硬数值，独立重拉来源原句逐位比对（不抄调研稿）；照片按身份疑点抽查（双问规程 `asset-research/references/photo-verification.md`，双问不一致即不承重）；终审结论一行化落 Spec，修正直接改写摘要区。
- 开工校验照常（任务书 Spec Version 锚点 vs 当前 Spec，不一致开发代理有权打回）。

### Step 1（差异点：单档两档结构 + 缺省最小化声明）

- 交付面：`assets/<name>.asset.ts`（meta + build 同文件自包含；**无 `<species>/` 四件拆分**——organization.md §2.1 单档资产的轻量形态）。
- **meta 最小化**（parkbench 先例）：taxonomy / presets 必填；levels / representations / triangleCount **多档起才声明**（lod-spec §2.2 首版最小化 + §7 路径速查）；单档缺省 = 不声明。
- 几何纪律：每次调用 new 全部 geometry/material；贴地基准 minY=0；部件→materialIndex **材质分层表**进模块头注释（先例 streetlamp / parkbench 头注范式）；变体 jitter 不进 build。
- **色卡消费（preset）**：支持色卡的资产 build 消费 `params.preset`，只改基调面材质（结构面 / 分层划分不变——D44 #1「冠变干不变」同则移植）；缺省 = 默认卡行为。

### Step 2（差异点：配方谱系复用优先）

- **复用优先**：facilityMaterials 既有配方直接复用（配方键不变 = 跨资产共享 program，设计内去重——assetTaxonomy 收容断言的 `facility:` 前缀通道）；新配方最小集：配方键唯一、注入契约不动（仅明度/细节调制，不触碰 `<color_fragment>`）、hash 成本档同先例、**真实编译 console 零错误零警告再收口**。
- 深度材质：无 SDF alpha 链件（实心体）不声明 customDepthMaterial（先例设施五件同）。

### Step 3（差异点：接线面 = 主代理机械面 + 批级验收）

- **共享面接线**（机械性修改，主代理可写）：`EXPECTED_TAXONOMY` / `EXPECTED_PRESETS` 整表锁加行 + phase1 注册清单/计数 + metadata-taxonomy §5 表 + facilityAssets 表驱动行——**扩充零新增测试文件**；新语义测试按 D40 五者准入（新配方 / 首个设施色卡消费等新行为面）。
- 视觉验收（**首例验收深度 = 轻量但完整**，D30 最低可信证据原则）：三必做机制 = spine §4，实例化——①身份：对照合并 Spec 逐资产一行结论记档；②统一基线 = **一张 Contact Sheet 覆盖全批**（固定机位 + 固定灯光 + 冻结时间，逐资产可辨；参数命名沿 shadow-visual-sop §3）+ 疑点触发逐资产补图；③契约缺口记档（有无都记）。判读纪律：console 零错误零警告（含转台）；孤证多帧仲裁。
- 冒烟：放置链真实消费（点击/拖放入场景 + 缩略图正确）；色卡资产加色点 UI 与换卡放置一轮。

## 3. LOD 与预算（差异点：单档缺省 + 模块头记账）

- 缺省单档（不声明 levels/representations = 单档 'high'）；多档需求出现 = 分裂信号（§1）。
- 预算记账：设施类无 lod-spec §5.2 家族预算行——**模块头工程记录**（streetlamp 先例）；单件面数线由批任务书定档（先例 T002.4 记档）；全局预算四线不破（representation-runtime §九）。

## 4. 派遣面（read-set 消费链，D36 第 6 条）

消费链四环节 / 表格三列化规范 / 派遣简报形状 / 观察钩子 = spine §2。Step 执行者：0 = 通用子代理（asset-research）；1 = procedural-asset-agent；2 = park-shader-agent；3 = 主代理。

read-set 表（轻量批方法必读集）：

| Step | Path | Section（读取上限） | Mode |
|---|---|---|---|
| 0 | asset-research SKILL.md | 全文 | full-read |
| 0 | 当前任务书 | §Research Gate / §重点调研面 | point-read |
| 1 | 本文件（simple-asset.md） | §Step 1 | point-read |
| 1 | organization.md | §2–§2.2 / §4 | point-read |
| 1 | 先例资产文件（streetlamp / parkbench） | 全文（结构 / 分层表 / 边界注释范式） | full-read |
| 1 | lod-spec.md | §2.2 / §7 | point-read |
| 1 | 当前任务书 | 全文 | full-read |
| 1 | 当前 Spec | 消费摘要区（逐资产节） | point-read |
| 2 | 本文件（simple-asset.md） | §Step 2 | point-read |
| 2 | facilityMaterials.ts + facilityGlsl.ts | 全文 | full-read |
| 2 | facilityMaterials.test.ts | 全文（测试组织先例） | full-read |
| 2 | 当前任务书 + 当前 Spec | 材质相 / 分层表 | point-read |
| 3 | spine.md | §4（三必做 / 疑点触发 / 校准护栏） | point-read |
| 3 | shadow-visual-sop.md | §3（固定机位取证规范） | point-read |
| 3 | 当前任务书 | Acceptance / 取证路径 | point-read |

## 5. 验收结构

- **单批**：任务书 Acceptance + 本 Workflow 各 Step 验收点；首例验收深度 = 轻量但完整（§Step 3——Contact Sheet 批级基线 + 逐资产身份结论 + 冒烟 + console 判读；多机位 / 风动 / 档间为疑点触发项非默认项）。
- **Epic 级**：归所属 Epic 定义（T025 收官门——混场景 / 资产库呈现 / 回归口径见 epic 文件）；族级七项骨架 = spine §5 带适用性（轻量域多项不适用，如实记档）。

## 6. 同步机制落点

机制正文（四问筛选器 / 五向分流 / 升格三级 / 完成记录收口）= spine §7。本方法落点：先例 / 知识索引 = `docs/procedural-assets/precedents/simple-asset.md`（方法级非家族级——首例批次建立，批级行：资产入口 + 配方谱系 / 结构先例导航）。
