# T010.1 家族契约提炼与文件组织规范 — 验收取证

日期：2026-09-19 ｜ 任务书：[tasks/010.1-family-contract.md](../../../tasks/010.1-family-contract.md)

## 交付物

1. **阔叶家族类型契约** `src/runtime/procedural/tree/broadleaf/broadleafShapeProfile.ts`（纯类型零运行时）：
   `BroadleafShapeProfile extends BroadleafCanopyProfile（冠形 5 + 通透 11 + 叶簇 18 扁平 34 字段）, BroadleafBranchProfile（骨架 9 + 逐级分级 4 扁平 13 字段）` + 4 嵌套组（barkRelief / trunk / levels / childPlan，类型 BroadleafBarkRelief / BroadleafLevelTopology / BroadleafChildPlan）。51 字段全部有夏栎真实消费点佐证（tree3aGeometry 全字段消费，grep 可证——无投机字段）。T009.3 消费语义发现并入（crown 三 ratio 不动几何只进密度场；冠垂直摆放驱动链 = 挂高段+横展角+upturn+领导枝链；弱领导枝翻转树顶决定因素）。【阔叶共性候选】/【夏栎特有】逐字段标注原样承接；数值依据全部留资产 config（夏栉 Spec 数值 = 第一实例证据，不作家族真理）。
2. **夏栎迁移为契约第一实例**：tree3aShapeProfile 删本地类型改消费家族契约（8 槽值与数值依据逐位保留）；tree3aGeometry 签名与内部类型改家族契约。
3. **文件重组（推荐四文件结构第一实例）**：
   `assets/asset_tree_3a.asset.ts`（入口，glob 契约位不动）+ `tree/tree3a/{tree3aGeometry, tree3aMaterials, tree3aShapeProfile, tree3aStage}.ts`（git mv 保历史）；命名规范确立——`broadleaf*` 前缀专属家族契约层，资产实现用 `tree3a*`（`buildBroadleafGeometry → buildTree3aGeometry`、`BroadleafTreeResult → Tree3aGeometryResult` 更名让出家族名）；测试 3 文件同步更名（broadleafBarkRelief/Structure/Lod → tree3a*，逻辑零改动）。
4. **规范文档** `docs/procedural-assets/organization.md`：三级职责边界表（Plant Runtime / Family / Asset）+ 两档文件结构（最小单文件 / 推荐四文件）+ 命名规范 + 家族契约方法论六条（提炼纪律/语义数值分离/消费语义记档义务/计数类纪律等）+ 新增资产路径速查。

## 零回退证据

| 判据 | 证据 |
|---|---|
| 三门槛 | `npm test` 2542/2542（181 文件）· `check:layers` 447 文件全过 · `typecheck` 零错 |
| 同 seed 逐位复现 | 既有逐位回归锁全绿：皮面数 20724 槽间恒等 / rng 消费 177234 三档恒等 / High 档逐位不动 / 同 seed 逐位复现 / 材质 BODY fixture 逐字节锁（测试断言零改动，仅 import 路径随迁移更新） |
| 产品路径账目 | DEV 冒烟 stats：barkTriangles 20724 / leafCards 7167 / leafTriangles 14334 = slot-0 锚点锁定值逐位一致；window.__tree3a 与 __tree3aPerf 双句柄挂载成功（bootstrap 接线在 import 更新后完好） |
| 观感零回退 | 固定机位 `levels-slot0-32m.png`（mountLevels+viewLevels 32m+freezeTime）对照 009.6 `levels-slot0-panorama-32m.png`：三档全完整渲染、档间身份一致、无渲染异常；`slot0-near-12m.png` 近景：树皮脊沟质感/叶卡/光影正常（视觉模型核验） |
| 性能零回退 | 构造性论证：迁移零运行时代码改动（git diff 全量 = 类型层 + 文件移动 + 注释；broadleafShapeProfile 为 type-only 文件，编译后零字节）+ 资源契约测试全绿；会话内 sampleFrames 抽样受虚拟显示器 vsync 恒限 ~10Hz 已知口径影响（T009.7 记档），不构成回归读数 |

## 与简报预期不符项（处置记档）

- 测试文件实际零类型 import（只 import 值）——Step 1「测试 import 更新」为空操作，Step 2 补路径/符号更新。
- 旧接口字段注释内嵌的数值证据（slot-0 锚定值/Spec 数值域）随类型上提会丢失——按「数值归资产 config」原则原样落位到 TREE3A_SLOT0_PROFILE 字面量内联注释，tree3a 仍是数值证据唯一真相源。
- Step 2 冻结未动的家族文件内两处过期指向注释（`broadleafGeometry` 散文提及 + `../tree3aShapeProfile` 相对路径差一级）——主代理提交前已修正（纯注释机械修正）。

## 进程清理

dev server 已停、agent-browser 已关、DEV 句柄 dispose/unmount 完成——无跨会话残留。
