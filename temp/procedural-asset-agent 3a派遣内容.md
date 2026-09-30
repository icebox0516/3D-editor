你是 procedural-asset-agent，执行 T012.4 白皮松 Step 3a：几何 + 资产入口 + Structure/Lod 测试 + 族级共享面增行。

## read-set（必读，按序）

1. `D:\3D-editor\.zcode\skills\asset-production\workflows\tree.md` §Step 3a（point-read）
2. `D:\3D-editor\docs\procedural-assets\organization.md` 全文
3. `D:\3D-editor\docs\procedural-assets\lod-spec.md` §5 预算 / §7 声明路径（point-read）
4. `D:\3D-editor\src\runtime\procedural\tree\conifer\coniferShapeProfile.ts` 全文（契约——只读）
5. `D:\3D-editor\tasks\012.4-bungeana.md` 全文（**Step 1 判定 12 条 + Step 2 记档是你的结构输入**；待裁决位含 LOD 预算行）
6. `D:\3D-editor\docs\research\bungeana-reference.md` 消费摘要区（@1.1）
7. 主代理授权扩大（D40）：`D:\3D-editor\src\runtime\procedural\tree\juniperus\juniperusGeometry.ts` + `D:\3D-editor\src\runtime\procedural\assets\asset_tree_juniperus.asset.ts`（point-read——方法管线与入口组织参照，学结构不抄数值）

## 交付物

1. `D:\3D-editor\src\runtime\procedural\tree\bungeana\bungeanaGeometry.ts`——按 Step 1 判定 + bungeanaShapeProfile（Step 2 已定稿，**只读消费**）：
   - **束聚合卡**：1 卡 = 末级枝段多束聚合（3 针束沿枝螺旋排列、束间距 ≈针长 1/3–1/2；卡尺度 0.26–0.32 m 带从 profile；**交叉双卡 + 挂点前移**两杠杆必用——中距浓密板三杠杆）
   - **散生连续冠**：层位字段退化消费直承 012.3 路径（高 tier 密度 + tierGapBand 0 + 大 jitter）
   - **开张卵圆→伞形平顶包络**：exp<1 新端型首用（伞形平顶端 = 顶平截/外抛——slot 轴老树端）
   - **双态低量果账目**：posHash 零 rng（koelreuteria 账目法）+ 一年生绿幼果主导 + 少量近熟果 + 4 tri/果入皮组 + uv v∈[1,2)（冻结接口②）
   - **slot-7 多干近似**：低位粗枝上举渐近（profile 参数已定——trunkHeightRatio 低位端 + tierAngleBase 陡端 + rank 双强）
   - 干基弱膨 ≤1.3；rng 无条件消费纪律（消费次数与数据分支无关）；皮面数跨槽恒等 16884（profile 锁定值）
   - LOD 档位派生：High ≤40000 / Mid 6000–10000 / Low 1500–3000 / Canopy ≤500——档间不变量（同 rng 流 / 轮廓体量颜色连续 / rng 三档恒等）；预估 31–35K，实测出带先调几何再记档
2. `D:\3D-editor\src\runtime\procedural\assets\asset_tree_bungeana.asset.ts` 入口——meta 同契约（taxonomy plant/conifer、shapeFamily、levels、triangleCount = 细档实数、proceduralProfile 实测带）；build slot→profile 路由 + level 透传 + customDepthMaterial 通道接线；**presets 出生即带（D44）：default 单卡**（常绿无季相证据不建卡；卡色值锚 = Spec 叶色记录，色值具体 hex 由 3b Materials 单源定——**入口只引 Materials 工厂产物或占位常量名，不内嵌色值**〔冻结接口⑤〕）；import `createBungeanaMaterials`（3b 并行交付，签名以冻结接口⑥为准——合并前 typecheck 允许红，主代理合并对账消解）
3. 测试件：`tests/runtime/procedural/tree/bungeanaStructure.test.ts` + `bungeanaLod.test.ts`（组织对称 juniperus 先例；五者准入——新结构语义/新预算行；面数带 + 档间恒等 + rng 三档恒等 + 皮面恒等锁）
4. **族级共享面增行**（⚠ 当前文件已含并行 T025 线刚加的行——EXPECTED_PRESETS 现 33 行、taxonomy/注册计数 33、bootstrap 清单已更新：**先读当前状态、在其上增行，勿按旧计数写死**）：CROWN_PRESETS + canopy drift-lock 表 + taxonomy conifer 行计数 3→4 + phase1/bootstrap 注册计数与清单 + assetColorPresets EXPECTED_PRESETS +1（default 单卡行）+ `docs/procedural-assets/metadata-taxonomy.md` §3 conifer 行（若有计数）

## 冻结接口（与 3b 并行，双边已声明）

①ShapeProfile 只读 ②uv 帧域：束卡 v∈[0,1) / 果卡 v∈[1,2)（材质判别阈值 1.0）③aSeed/aBend 契约字段名沿用 ④深度材质 GLSL 由 3b 拥有，入口仅接线 ⑤色值单源 Materials（Geometry/入口零内嵌色值）⑥3b 导出 `createBungeanaMaterials` 具名导出 + per-level customProgramCacheKey 档位唯一。

## 硬边界

不碰：coniferShapeProfile.ts、cedrus/metasequoia/juniperus 全部文件、broadleaf、tree3a、BroadleafCanopyProxy、bungeanaMaterials.ts（3b 的）、Runtime 调度侧。自验：`npx vitest run tests/runtime/procedural/tree/bungeana` + `npm run typecheck` + `npm run check:layers`（入口 import 允许单点红，其余零错）。

## 回传（P1 压缩：usage 时长 + 计数表 + 结论）

1. 用时 2. 计数表：Geometry/入口行数、tri 实测（8 槽×3 档横扫带）、rng 三档恒等值、皮面恒等值、共享面增行清单（文件×行数）3. 结论：预算落带与否、伞形平顶端型实现要点、果账目计数、多干 slot-7 实现一行、与 juniperus 管线差异清单 4. 交付路径 + 自验结果