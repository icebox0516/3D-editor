# T023 取证 —— 生产脊柱 spine 提取（workflow 体系升级「spine + 方法剖面」）

任务书：`tasks/023-spine-extraction.md`（D43）｜日期：2026-09-28｜类型：纯技能 / 文档面（`.zcode/` 本地私有 R1；git 变更面 = AGENTS.md / DECISIONS.md / 任务书 / 导航 / 本目录——代码执行面零变化，`npm test` 按 D40 判据不触发）。

## 变更面

| 文件 | 变更 |
|---|---|
| `.zcode/skills/asset-production/spine.md` | 新建——九项迁入（Step 编排骨架 / read-set 消费链 / 测试纪律 / 同步机制 / 抽象三必做 / 族级门七项骨架 / 新 Family 首例 D37 六步 / 头部自治条款 / 头部定位句原文照录） |
| `.zcode/skills/asset-production/workflows/tree.md` | 剖面化改写——删与 spine 重复段落改引用锚（新族首例流程 / 读取顺序细则 / 三必做机制 / 校准护栏·人工门 / 测试纪律正文 / 同步机制正文）；保留乔木方法剖面全部条目（适用判定 / Family 参数位 / 器官账目 / slot-0 槽差量 / 几何与 LOD 档位 / SDF·树皮·风动·深度材质 / Stage / 风动三证据 / M25+day+freezeTime / read-set 必读表） |
| `.zcode/skills/asset-production/SKILL.md` | 路由两步化（判复杂度/方法 → 选 workflow）+ 路由表 spine 声明行 + 新 Workflow 创建纪律（方法差异剖面 + 禁复制 spine + read-set 只列真实差异） |
| `AGENTS.md` | 三处：技能结构补 spine 层（入口路由 → spine + workflows）；任务粒度行与资产验收三层原则行的新族首例句式改写（P0——「完整 SOP 例外」→「按所属 Workflow 定义的首例验收深度执行，D30 最低可信证据原则」） |
| `DECISIONS.md` | D43 新条（D36 边界句 + D30 最低可信证据原则两段照录 + 六项裁定 + 记档附注）+ 索引行 D43 新增 + D30/D36 Note 补注 |

## 验收判定表

| 验收项 | 判据 | 结果 |
|---|---|---|
| 提取完整性①（无同文重复） | tree.md × spine.md trim 后逐行比对（≥8 字符） | **PASS**——重复 1 行 = `\|---\|---\|`（markdown 表格分隔线，结构性符号非规则正文）；spine 60 非空行 / tree 105 非空行 |
| 提取完整性②（spine 无资产语义） | 反例词审查：树种 / SDF / 树皮 / 风动 / 叶 / 冠 / M25 / slot-0 | **PASS**——零命中。「槽」命中均为「角色槽」（任务书待裁决位 3 原词，与乔木槽位 slot 无关）；「树木」唯一命中 = spine §6 第 4 步「不再统一要求树木级完整 SOP」（D30 增补用户原文的否定式范围澄清，非资产语义） |
| 引用完整性（Step 0–4 走查） | tree.md 剖面化后各 Step 经 spine 锚点可还原完整流程 | **PASS**——见下表，read-set 链闭合（tree.md 表新增 Step 1 / Step 4 两行 spine.md point-read） |
| `check:layers` | 恒跑 | **PASS**——625 个 TS/TSX 文件，分层 DAG 与 three 白名单全部通过 |
| `typecheck` | 恒跑 | **PASS**——零错误 |
| `npm test` | 三门槛判据（D40） | **不触发**——代码执行面零变化（`git status` 仅 .md / docs 变更，`.zcode/` 本地私有） |
| `check:tasks` | report-only 不新增 warning | **PASS**——warning 53 / normal 107，与改前基线逐位一致（改前同为 53 / 107）；DECISIONS 索引双向核对零漏登零幽灵行 |

## Step 0–4 引用走查（引用完整性证据）

| 环节 | tree.md 剖面保留内容 | 经 spine 锚点还原的共性规则 |
|---|---|---|
| Step 0 Research | Gate 逐资产留痕 / asset-research 执行 / **D38 采样终审树族数值（≈5–8 项 / ≈2–3 张）留剖面** / 开工校验 / 参考图边界（D13） | Gate 时序规则 = spine §1；Gate 强制·豁免细则 = read-set 行 asset-research SKILL full-read |
| Step 1 结构分析 | 先例方法基线对照 / 表达路径判定 / 可选器官账目判定（乔木特有：花果季相） | 最小上下文读取顺序 + 观察钩子 = spine §2（read-set 表已挂 spine §2 point-read） |
| Step 2 参数化 | 契约实例化三标注 / 结构计数跨槽恒等 / slot-0 锚点 + 槽差量 / 涌现值回调 / 数值留 config | 新 family 无契约分支 = spine §6 第 3 步（契约草案创建） |
| Step 3 实现 | 3a 几何+入口（LOD 档位派生同流）/ 3b 材质（叶 SDF·树皮·风动两层·深度材质同源 GLSL）/ 3c DEV 出图面——全文保留 | 并行文件集不相交 + 冻结接口 + 中断即未验证 = spine §1 |
| Step 4 视觉验证 | **M25 机位 + day 预设 + freezeTime 基线帧** / 风动三证据 / LOD 档间连续（乔木实例化参数留剖面） | 三必做 + 疑点触发 + 判读纪律 + 校准护栏 + 人工裁定门例外 + 异议窗口 = spine §4（read-set 表已挂 spine §4 point-read） |
| 测试与三门槛 | 乔木测试组织（分件对称家族先例 / 注册回归断言扩充零新增文件） | 五者准入 + 公共能力不复制 + 三门槛判据式引用 = spine §3 |
| 族级验收门 | family-specific 检查项归 Epic（Broadleaf 实现留 011.13）；先例索引落点 = Family 参数位 | 七项骨架（带适用性）= spine §5 |
| 同步机制 | 乔木落点（precedents/<family>.md）；不含任务排程 | 四问筛选器 / 五向分流 / 升格三级 / 完成记录收口 = spine §7 |

## 复现命令

```bash
# 提取完整性①：tree × spine 逐行重复检查
node -e "const fs=require('fs');const rd=p=>fs.readFileSync(p,'utf8').split(/\r?\n/).map(l=>l.trim());const s=new Set(rd('.zcode/skills/asset-production/spine.md').filter(l=>l.length>=8));console.log(rd('.zcode/skills/asset-production/workflows/tree.md').filter(l=>s.has(l)))"
# 提取完整性②：spine 资产语义反例词审查
grep -n "树种\|SDF\|树皮\|风动\|M25\|slot-0\|冠层" .zcode/skills/asset-production/spine.md   # 预期零命中
# 三门槛（本任务 npm test 判据不触发）
npm run check:layers && npm run typecheck && npm run check:tasks
```
