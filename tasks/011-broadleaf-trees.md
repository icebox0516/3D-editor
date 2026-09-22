# T011 阔叶乔木族生产任务集合

> 立项 2026-09-19（初版「第一批四树种」）；2026-09-20 D33 口径改版为开放式集合——规则面向「本 Epic 纳入的树种」表述、不写死数量。前置：T010 5/5 收官（启动条件确认见 010.5）、T006 5/5 收官（Runtime LOD 调度就绪）。**状态：进行中——成员 12 树种：10 done / 2 排产（下一树 011.11 女贞 → 011.12 垂柳），标准模式逐树推进（D16 / D35.1），族级验收门 011.13 未启动。**
>
> 本文件口径（D24 / D36 瘦身 2026-09-22）：只维护族级规则、成员清单、勾选表与族门口径——生产流程正文归 asset-production `workflows/tree.md`，LOD 预算归 `docs/procedural-assets/lod-spec.md` §5.2，完成详情归各子任务书完成记录；**进度流水与 done 长摘要不落本文件**（每树 done 同步 = 勾选一行 + TASKS 行 + PROGRESS 快照 + 先例索引）。

## Goal

阔叶家族从单实例（夏栎，T008/T009 交付）扩为**开放式阔叶乔木生产任务集合**：本 Epic 纳入的每一树种（当前成员见「成员清单与增补规则」）独立走 Reference Spec（D26 Research Gate，**不沿用他树**）+ 阔叶家族契约实例化（数值各自锚定各自 Spec）+ 全链生产（流程正文 = `workflows/tree.md`，D36——本文件不复制）；验收分层按 D30——**011.3 起单资产增量口径**（011.1/011.2 已按当时完整口径完成，全量证据保留），epic 末族级验收门对**执行时点全部纳入成员**收官（不重跑逐树已完成项），家族契约按真实缺口增量修订。

**Epic 边界（D33）**：形态域适配 BroadleafShapeProfile 的阔叶新树种（池见 `docs/research/urban-tree-candidates.md`）直接纳入本 Epic——族门未收官时只做「新增一个子任务 + 族级验收门编号顺延 + 成员清单加行」三个动作，**Epic 规则文本零改动**（族门收官后的追加走增补轮口径、不改已完成编号——见增补规则）；仅当新树种不再适合 BroadleafShapeProfile、需要形成新的植物家族契约时才另立 Epic（针叶族 T012 / 花木族 T013 / 灌木族 T014 / 地被草本族 T015 按家族分立，路线不变）。本 Epic 内不存在「新 family 首例」情形（家族首例 = 夏栎，已在 T008/T009 担任），新纳入成员一律走 D30 增量口径（新 Family 首例流程见 workflow §1，D37）。

## 成员清单与增补规则（D33 · 当前成员唯一维护点）

| # | 树种 | 子任务 | 资产入口 | Spec | 状态 |
|---|------|--------|----------|------|------|
| 1 | 朴树 celtis | 011.1 | `asset_tree_celtis` | `docs/research/celtis-reference.md` | done 2026-09-20 |
| 2 | 香樟 camphor | 011.2 | `asset_tree_camphor` | `docs/research/camphor-reference.md` | done 2026-09-20 |
| 3 | 榉树 zelkova | 011.3 | `asset_tree_zelkova` | `docs/research/zelkova-reference.md` | done 2026-09-20 |
| 4 | 银杏 ginkgo | 011.4 | `asset_tree_ginkgo` | `docs/research/ginkgo-reference.md` | done 2026-09-20 |
| 5 | 悬铃木 platanus | 011.5 | `asset_tree_platanus` | `docs/research/platanus-reference.md` | done 2026-09-20 |
| 6 | 栾树 koelreuteria | 011.6 | `asset_tree_koelreuteria` | `docs/research/koelreuteria-reference.md` | done 2026-09-21 |
| 7 | 乌桕 triadica | 011.7 | `asset_tree_triadica` | `docs/research/triadica-reference.md` | done 2026-09-21 |
| 8 | 重阳木 bischofia | 011.8 | `asset_tree_bischofia` | `docs/research/bischofia-reference.md` | done 2026-09-21 |
| 9 | 国槐 sophora | 011.9 | `asset_tree_sophora` | `docs/research/sophora-reference.md` | done 2026-09-22 |
| 10 | 白蜡树 fraxinus | 011.10 | `asset_tree_fraxinus` | `docs/research/fraxinus-reference.md` | done 2026-09-22 |
| 11 | 女贞 ligustrum | 011.11 | `asset_tree_ligustrum`（规划） | 未产出（随 011.11 Research Gate） | 排产（D34，证据中档注记） |
| 12 | 垂柳 salix | 011.12 | `asset_tree_salix`（规划） | 未产出（随 011.12 Research Gate） | 排产（D34，垂枝冠契约应力位） |

- **夏栎（`asset_tree_3a`，`tree3a-reference.md`）非本 Epic 成员**：家族首例与基线对照（T008/T009 交付），族级验收以基线身份参与（混植同场、性能同量级对照、契约修订零回退锁）。
- **增补规则**：族门未收官时，新树种立项 = ①子任务号顺延（取当前族门号，既有成员编号不重排）②族级验收门编号顺延为最后一环 ③本清单加一行；一树一档（D16）与逐树 Research Gate（D26）照常。**族门收官后的追加（D33.7）**：已完成任务编号与完成记录冻结不改，由后续增补子任务承接（T011 内编号顺延立项，epic 重开增补轮），需要时执行一次增补后的族级复核（族级横向项抽核、不重跑既有单资产已完成项）——收官前可持续增补、收官后不改历史。历史文档中「011.5 族级收口」等编号引用指族级验收门本身，门号顺延后按「T011 族级验收门」理解（历史完成记录不回改，D31.1）。
- **准入判据**：中龄公园典型单干阔叶乔木，形态域可由 BroadleafShapeProfile 承载；超出此域（棕榈/竹类/藤本等需新家族契约）→ 新 Epic，不进本清单。
- **候选池与分流（D34）**：候选池唯一维护点仍为 `docs/research/urban-tree-candidates.md`（D33.5；本次未入选 ≠ 否决）。分流记档：① 乔木型观花 7 种（玉兰/广玉兰/合欢/凤凰木/蓝花楹/羊蹄甲/洋紫荆）归 T013 花木族候选、不进本 Epic（观花为纲 vs 本族荫蔽/行道/园景为纲）；② 纯北方组（毛白杨/旱柳/元宝枫/榆树）、西南组（黄葛树）与石楠（造型灌木双栖，亦可作 T014 候选）留池——分场景立项时增补（D33.7）；③ 弱证据 4 种（鹅掌楸/天竺桂/小叶榕/枫香）留池待补园艺文献再议；④ 女贞证据中档（FRPS 61:153 行道树用途明文、无「广泛栽培」级语句）入选注记；⑤ 垂柳垂枝冠预期触发家族契约缺口（枝角下垂形态域）——按 D31.2 阻塞例外 + 族门收口处理，仍属单干阔叶乔木形态域、不另立族。

## Requirements（族级口径；流程正文见 workflows/tree.md，不在此复制）

- 逐树 Research Gate 留痕与 Spec Version 开工校验（D26）= workflow §Step 0。
- 家族契约实例化与提炼纪律 = `docs/procedural-assets/organization.md` §3–§4；**契约缺口逐树记档——默认只记录、不提前泛化，统一归族级验收门（011.13）收口**；阻塞例外（D31.2）= 最小必要修订 + 夏栎逐位零回退 + 完成记录留痕 + 族门复核（「是否阻塞」由主代理按「不修订则无法继续开发」执行判断，不建抽象定义）。已记档缺口以各树完成记录为准，族门执行时汇总。
- LOD 三档家族预算行（broadleaf 已锁定）与档间不变量 = `lod-spec.md` §5.2 / §7；Shadow 通道 = `shadow-visual-sop.md` §1；8 槽结构计数恒等与伪差异禁令（009.3 口径）= organization.md §3 / workflow §Step 2。
- 视觉验收默认口径 = D30 分层（单资产三必做 + 疑点触发，不设逐树用户门；机器判定为判据、用户异议窗口开放）；校准默认一轮、两轮封顶，疑似结构性问题上收族门（011.2 envMap 先例）。

## Scope

- 预期触碰（**每纳入树种一组**，随成员清单增长）：`src/runtime/procedural/tree/<species>/`（Geometry / Materials / ShapeProfile / Stage）+ `src/runtime/procedural/assets/asset_tree_<species>.asset.ts` 入口（routes glob 自动收割）+ `tests/runtime/procedural/tree/` 新测试 + `docs/research/<asset>-reference.md` Spec 一份。
- 家族契约 `tree/broadleaf/broadleafShapeProfile.ts`：各树会话**默认不动**；缺口记档，修订归族级验收门。
- 不碰：`tree/tree3a/*` 与 `asset_tree_3a.asset.ts`（零回退基线）、T003 散布功能（冻结）、Runtime 调度侧（T006 已收官）、GLB 路径。

## Acceptance（epic 级，族级验收门执行——D30 族级集体验收口径，不重跑逐树已完成项）

验收对象 = **执行时点本 Epic 全部纳入成员**（成员清单）+ 夏栎家族基线对照；成员追加后族门再执行一轮，对象同为当轮全部纳入成员：

- 全部纳入成员横向一致性（基线帧同源比较）+ 树种间真实差异成立（对照各自 Spec「身份/识别特征」节）
- 混植场景（全部纳入成员 + 夏栎同场）检视 + 资产库呈现（plant/broadleaf family 分组）
- 家族预算与 LOD：全部纳入成员预算行复核 + 档间连续抽查（逐树层按需验项不重复跑）
- 全部纳入成员性能实测过 §4.3 阈值表（1/20/100/500/1000 棵 ≥60/60/60/45/30 FPS）+ 资源契约五条 + 与夏栎基线同量级
- 家族契约增量修订完成（真实缺口 → 修订 → 夏栎逐位零回退）或显式记档「无缺口」（已记档：011.1 三条 + 011.2 三条候选）
- 回归三门槛全绿；GLB 与旧资产零变化

## Constraints

- 尺度锚：各树种 Spec 的**中龄公园典型个体**（与夏栎 ≈8m 同语境的可混植量级；具体数值以各自 Spec 为准，不拿夏栎数值换色复用）。
- 派遣路由 / D19 契约锁 / ProceduralBuild 公共签名 / 参考图边界（D13/D26）= AGENTS.md 与 workflow §派遣面 / §Step 0（不在此复制）。

## 子任务（一树一档，D16 会话粒度；开放式集合——新增成员按「成员清单与增补规则」插在族门之前）

- [x] T011.1 朴树全链（done 2026-09-20）→ [011.1-celtis.md](011.1-celtis.md)
- [x] T011.2 香樟全链（done 2026-09-20）→ [011.2-camphor.md](011.2-camphor.md)
- [x] T011.3 榉树全链（done 2026-09-20）→ [011.3-zelkova.md](011.3-zelkova.md)
- [x] T011.4 银杏全链（done 2026-09-20）→ [011.4-ginkgo.md](011.4-ginkgo.md)
- [x] T011.5 悬铃木全链（done 2026-09-20）→ [011.5-platanus.md](011.5-platanus.md)
- [x] T011.6 栾树全链（done 2026-09-21）→ [011.6-koelreuteria.md](011.6-koelreuteria.md)
- [x] T011.7 乌桕全链（done 2026-09-21）→ [011.7-triadica.md](011.7-triadica.md)
- [x] T011.8 重阳木全链（done 2026-09-21）→ [011.8-bischofia.md](011.8-bischofia.md)
- [x] T011.9 国槐全链（done 2026-09-22）→ [011.9-sophora.md](011.9-sophora.md)
- [x] T011.10 白蜡树全链（done 2026-09-22）→ [011.10-fraxinus.md](011.10-fraxinus.md)
- [ ] T011.11 女贞全链（asset_tree_ligustrum；Ligustrum lucidum；常绿第二例（香樟后）+ 革质叶；长江以南；**证据中档**（行道明文、无「广泛栽培」级语句））→ [011.11-ligustrum.md](011.11-ligustrum.md)
- [ ] T011.12 垂柳全链（asset_tree_salix；Salix babylonica；垂枝冠——**契约应力位**（枝角下垂形态域，预期缺口按 D31.2 阻塞例外 + 族门收口）+ 水边场景；全国；强证据 FRPS 20(2):138）→ [011.12-salix.md](011.12-salix.md)
- [ ] T011.13 T011 族级验收门（D30 族级集体验收：全部纳入成员横向一致性 + 树种差异成立 + 混植 + 预算/LOD + 性能 + 契约修订 + 回归；**编号随成员增补顺延为最后一环（D33）**）→ 011.13-acceptance.md

依赖链：按编号串行 → 族级验收门恒为最后一环（新成员插族门之前、族门号顺延、既有编号不重排；顺序非硬功能依赖——各树文件集不相交，串行为维持会话粒度纪律与审查带宽；阻塞级契约缺口按 D31.2 先行最小必要修订再继续）。横向方法族谱（叶形 SDF / 复叶 / 挂点叶序 / 冠形枝姿 / 树皮语言谱系）见 `docs/procedural-assets/precedents/broadleaf.md`（导航索引，D36 第 8 条）。
