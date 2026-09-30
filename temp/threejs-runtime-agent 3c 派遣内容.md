你是 threejs-runtime-agent，执行 T012.4 白皮松 Step 3c：DEV 出图面 + 物种表回填 + 像素量化交付。前置状态：3a（Geometry 1609 行 + 入口 + Structure/Lod 测试）、3b（Materials 865 行 + 测试 43 条）已合并，typecheck 零错 / check:layers 683 过 / bungeana 套件 109 条全绿。

## read-set（必读）

1. `D:\3D-editor\.zcode\skills\asset-production\workflows\tree.md` §Step 3c（point-read）
2. `D:\3D-editor\docs\procedural-assets\organization.md` §2.1 DEV 出图面（point-read）
3. 主代理授权扩大（D40）：`D:\3D-editor\src\runtime\procedural\tree\juniperus\juniperusStage.ts`（point-read——Stage 同构参照）+ `D:\3D-editor\tests\runtime\procedural\tree\juniperusStage.test.ts`（Stage 测试组织参照）
4. `D:\3D-editor\tasks\012.4-bungeana.md` §Acceptance + Step 1/2 记档（point-read——像素量化与 canopy 机位要求）

## 交付物

1. `D:\3D-editor\src\runtime\procedural\tree\bungeana\bungeanaStage.ts`——同构 juniperusStage（mountSlots / view / mountLevels；import.meta.env.DEV 守卫生产零痕迹）+ bootstrap `window.__bungeana`；**VIEW_TARGET_Y 几何实测定档**（树高锚 ~11.5m——012.3 圆柏 8m 定 4.5 的比例参照）+ `tests/runtime/procedural/tree/bungeanaStage.test.ts`（组织对称先例）
2. **物种表回填 + tripwire 转正**：canopy 物种表（BROADLEAF_CANOPY_MATERIAL_SPECIES）bungeana 行回填 + 既有 tripwire 断言（当前锁 `asset_tree_bungeana` undefined 为绿）转正为正向断言 + **Canopy ≤500 档 tri 实测**（表示链 High → Mid → Canopy → Culled 出生即声明——CROWN_PRESETS 行 0x606d47 已在盘）
3. **GLSL 真编译验证**：dev server + 浏览器，表面/深度全键（bungeana:bark / needle / needle-{level}×N / needle-depth）冷编译 + 档位切换 + 转台——**console 零错误零警告**（结论以真实工具返回为准）
4. **像素量化交付（本步核心）**：M25 基线机位帧 + **冠带绿覆盖像素量化值**（工具复用族先例取证 tools——`temp/t0123-hardwindow.mjs`、`temp/t0123-canopyprobe.mjs` 在盘可改写复用，或 `docs/acceptance/t012/012.3/tools/` 下归档版；**勿会话内从零重建**）；产出落 `D:\3D-editor\docs\acceptance\t012\012.4\`（frames + tools + 简版 README 记量化值）
5. **canopy 取证机位评估**：按包围球体量校验过渡带外机位（012.3 教训：d500 对 8m 树 = culled；白皮松 ~11.5m 体量对应取证带待推）+ distribution 探针佐证（如 canopy 已可渲染）

## 观察项（量化时顺带记档，不扩工）

- **疏散冠密度首验**：M25 冠带绿落带 vs 终值带 33.0/34.3%——Spec 承重「半透光疏散」结构，**显著低于带不必然是缺陷**（任务书 Step 1 判定 4 caveat——对照透天结构证据记档）
- 伞形平顶端型中视距读向（slot-2 老树端顶带 ≥0.8× 中带）
- **白干中距可辨性**（M75 侧机位一张——远景白干 = 第一识别特征，身份承重）
- 束卡中距质感（3 针小扇放射刷状读向）

## 硬边界

不碰：bungeanaGeometry/Materials/ShapeProfile 本体（发现缺陷报告主代理，不擅改）、coniferShapeProfile、cedrus/metasequoia/juniperus/platanus 文件、broadleaf、Runtime 调度侧。调试取证：MCP 结构化数据先过金丝雀（canvas ≈ 主视口才可信），拉不起/失败回退截图；**进程用完即清**（自己拉起的 vite/浏览器收尾停掉）。

## 回传（P1 压缩）

1. 用时 2. 计数表：Stage/测试行数与条数、GLSL 编译键数与 console 结论、Canopy 档实测 tri、M25 冠带绿量化值、canopy 机位带结论 3. 观察项四条一行结论 4. 交付路径 + 自验结果（vitest bungeana 全套 + typecheck + layers）+ 进程清理确认