# T024.5 冒烟面取证（Step 4）

> 任务：[tasks/024.5-acceptance.md](../../../../tasks/024.5-acceptance.md) 冒烟面 ｜ 工具：`../tools/smoke*.mjs`（CDP 驱动沿 024.4/024.5 体例）｜ 服务：主库 dev server 5173（current = 工作树，含 fade-out 修复）

## 结论速览

| # | 用例 | 判定 | 关键证据 |
|---|------|------|----------|
| 1 | 撤销重做带卡（handle + UI 变体） | **PASS** | 帧A≡帧C diff=0；帧A2≡帧C2 diff=0；objects 账目 1→0→1；console 零 |
| 2 | 保存重载保真（带卡） | **PASS** | 模板 JSON `objects[0].asset.preset==='autumn'`；帧D≡帧E diff=0 |
| 3 | 已删卡 id 宽容回退 | **PASS** | 帧F≡默认卡参照帧 diff=0；帧F≠帧D(autumn) diff=9462；console 零 |
| 4 | 存量场景保存重载逐位 | **PASS** | 模板 objects[0].asset **无 preset 键**；帧G≡帧H diff=0 |
| 5 | celtis 沉降像素抽查（哨兵） | **裁定移交** | 严格逐位 FAIL（483px，全部在 DOM 覆盖盒内）；**场景域 diff=0**（沉降态渲染未变） |
| 6 | 色点/Ghost/拖放/重放 | PASS（消费） | 024.4 证据指针（不重跑） |

汇总：`results.json`（summary.pass=5 / fail=0 / adjudication=[case5]）。

## 帧协议（全部像素帧同口径）

`freezeTime(2.5)`（先冻结再创建对象——放置期新建材质拿到确定 uTime）→ 对象就位 → `view({distance:25, azimuthDeg:35, elevationDeg:8})`（M25）→ 池稳定轮询（两采样 400ms 间隔 triangles/drawCalls 稳定）→ `sleep(1100)`（024.3 节奏）→ 截帧 **clip 到 ed-viewport canvas 矩形**（1292x932，布局归一=内容浏览器收起）。像素比对 = pngjs RGBA 全像素逐位（沿 Step-2 `compare-regression.mjs` 体例）。console 判据 = 驱动器 Runtime/Log 域自标签页创建全程收集，零错误零警告。

## 判据 → 证据对照

### 用例 1：撤销重做带卡

**handle 路径**（`smoke1-undo-redo.mjs`）：`place({assetId:'asset_tree_ginkgo', count:1, preset:'autumn', seedBase:1, jitter:false})` → 帧A（objects=1, tri=55798）→ Ctrl+Z → `stats().objects===0`（帧B：drawCalls 7→3、tri 55798→14——对象整批消失，仅地面）→ Ctrl+Shift+Z 重做 → objects===1 → 帧C。**帧A≡帧C 逐位（diff=0）**——对象带卡复活渲染一致。顶栏撤销/重做按钮 disabled 位随账目翻转（canUndo/canRedo 三态读数记档 results.json）。

**重做快捷键裁定**（两种都实测生效，记档）：
- **Ctrl+Shift+Z：生效**（undo→0 → Ctrl+Shift+Z → 1）
- **Ctrl+Y：生效**（再 undo→0 → Ctrl+Y → 1）
- 源码依据：`src/app/input.ts` L215-225（`ctrl+z(+shift)` / `ctrl+y` 两分支均调 `history.redo()`）；UI 变体采用 Ctrl+Shift+Z。

**UI 路径变体**（`smoke2b-undo-redo-ui.mjs`）：boot 前预置 `t3d-editor.asset-presets={"asset_tree_ginkgo":"autumn"}` → boot 读到（秋卡点 `--on` 激活态 `[false,true]`）→ 真实点选秋卡 → 点卡片进放置 → trusted CDP 鼠标事件画布中心落地 → Esc 退出 → **帧A2**（状态栏 Objects=1）→ Ctrl+Z → Objects=0（帧B2）→ Ctrl+Shift+Z → Objects=1 → **帧C2**。**帧A2≡帧C2 逐位（diff=0）**；帧A2≠帧B2（diff=3888，撤销确实移除树——反证非空比对）。对象级带卡证明：落地对象经「另存为模板」断言 `objects[0].asset.preset==='autumn'`（模板 `t0245-smoke-ui-autumn`）。

> **偏离记档①（UI 变体 vs handle 路径帧不逐位比对）**：简报要求「落地帧与 handle 路径帧一致」——逐位不可达且为**产品设计使然**：PlacementTool 点击路径每枚放置重摇变体 seed（源文件头注「连续放置每枚重摇（含新 seed）」；实测落盘 seed=1062224230 vs handle seedBase=1），不同 seed → 不同形态槽/instanceColor → 像素必然不同。替代断言 = UI 路径自身 帧A2≡帧C2 逐位 + 模板 JSON 对象级 `preset==='autumn'`（UI 链带卡）+ 落地/撤销/重做账目翻转。

### 用例 2：保存重载保真（带卡）

`smoke2-save-carded.mjs`：place ginkgo autumn → 帧D → UI「文件 → 另存为模板…」命名 `t0245-smoke-card`（Toast 回执「已保存模板」）→ localStorage 模板 JSON 断言：`objects[0].asset.preset === 'autumn'` ✓（seed=1、assetId=ginkgo、对象数 1）。**preset 落点为 `objects[0].asset.preset`**（简报写 `objects[].preset`——实际序列化形状在 asset 子对象，记档）。

`smoke3-apply-carded.mjs`（刷新后新会话）：freezeTime(2.5) → 「文件 → 新建场景 ▾」子菜单点选 `t0245-smoke-card`（非 dirty 直通零确认弹层；Toast「已从模板新建：… · 1 个对象 · 11 个图层」）→ 状态栏 Objects=1 → M25 → **帧E ≡ 帧D 逐位（diff=0）**——重载后带卡渲染保真。

> **记档②（`stats().objects` 语义）**：模板应用后句柄账目 `stats().objects===0` 属预期——openScene 走 `regenerateSceneIds`（io/templates/index.ts：全量 id 重生成），句柄 placedIds 不跟踪新 id；场景对象数以**状态栏 Objects 读数**（sceneVersion 派生产品路径）断言===1。简报所写「stats().objects===1」按此读法满足。

### 用例 3：已删卡 id 宽容回退

`smoke4-bogus-prep.mjs`：**默认卡参照帧自采**（place ginkgo 无 preset 同协议 → `frame-default-ref.png`；与 Step-2 `regression-default/current/asset_tree_ginkgo.png` 的比对见用例 5 通道分析）→ 复制 card 模板条目改 `preset='no_such_card'`、命名 `t0245-smoke-bogus` 写回 localStorage。

`smoke5-bogus-apply.mjs`（刷新后）：应用 bogus 模板 → **不崩溃**（canvas 存活 / error Toast=0 / 正常应用 Toast）→ **console 零错误零警告** → Objects=1 → M25 帧F。**帧F ≡ 默认卡参照帧（diff=0）**——读侧宽容归一 default 渲染；反证：帧F vs 帧D(autumn) diff=9462 ≠ 0（回退的是 default 而非沿用模板内残值）。

### 用例 4：存量场景（无 preset 对象）保存重载逐位

`smoke6-plain-save.mjs`：place ginkgo **无 preset** → 帧G → 另存 `t0245-smoke-plain` → 断言 `objects[0].asset` **无 `preset` 键**（hasOwnProperty=false——默认卡省略不落盘，createModelObjectAt 省略规则）✓。
`smoke7-plain-apply.mjs`（刷新后）：应用 → Objects=1 → 帧H。**帧G ≡ 帧H（diff=0）**；横向自检：帧G ≡ frame-default-ref（diff=0，同协议默认卡自洽）。

### 用例 5：修复后沉降像素抽查（回归哨兵）——裁定移交

`smoke8-celtis-sentinel.mjs`：place `asset_tree_celtis` 无 preset（Step-2 同参数）→ 帧I vs `regression-default/current/asset_tree_celtis.png`：

- **严格逐位判据：FAIL（diff=483 / 1,204,144 px ≈ 0.04%，maxChannelDiff=36）**
- **场景域判据：PASS（sceneDomainDiff=0）**

取证分析（不改代码回避，全证据链落盘）：
1. **差异全在 DOM 覆盖盒**：483 px 全部位于 `.ed-hud--tl`（场景/Perspective/未命名场景 chips 文本 AA）、`.ed-hud--tr`（Shaded 按钮字形）、小地图边框四角 AA——carve-out 断言 `inDomOverlayBoxes=483 / sceneDomainDiff=0`（`frameI-celtis-diff-mask.png` 红点可视化）。
2. **树内容无关**：ginkgo 今日帧（frame-default-ref）vs Step-2 ginkgo 基线 = **完全相同的 483 px 掩码**（逐位置相同）——差异不随场景内容变。
3. **今日态跨 Chrome 进程稳定**：重启取证 Chrome（同 profile）复拍 `frameI2` → frameI2≡frameI（diff=0），frameI2 vs Step-2 基线仍 483 同掩码——排除本日进程随机光栅态。
4. **工作树无 UI/CSS 改动**（git diff 仅 bootstrap/batchPolicy/Renderer/budgetAlert/InstancedAssetPool/TimeUniformService+tests）——DOM 层无差异源。
5. 结论：**fade-out 修复未改变沉降态场景渲染**（WebGL 帧逐位一致）；483 px 为 Step-2 基线拍摄时点与今日之间的 DOM 文本/小地图边框光栅化微差（同构建同 DOM、内容无关、今日复现稳定——基线时点的浏览器态差异，具体环境诱因不可回溯，通道噪声归类候选，同 024.5 README 既有「通道噪声」先例）。严格逐位口径的 FAIL 与意图口径（沉降态渲染不变）的 PASS 并列移交主代理裁定；如需收口严格口径，建议后续以本批 `frameI2` 为新基线或截帧剔除 DOM 覆盖盒后比对。

### 用例 6：色点切换 / Ghost / 拖放 / 键 4 重放

消费 024.4 证据，不重跑：`docs/acceptance/T024/024.4/frames/`（01-08、10-15 共 15 帧）+ 对应断言批（`024.4/tools/ui-smoke*.mjs` 输出）。本批 UI 变体（用例 1）已顺带复证色点点选 + 点击放置带卡链。

## 偏离与记档汇总

| # | 事项 | 处置 |
|---|------|------|
| ① | UI 路径 vs handle 路径帧不可逐位（放置每枚重摇 seed，设计使然） | 替代断言：UI 自身 A2≡C2 逐位 + 模板 JSON preset 证明 + 账目翻转；源码注记佐证 |
| ② | 模板应用后 `stats().objects===0`（id 重生成，句柄不跟踪） | 场景对象数改经状态栏 Objects（产品路径）断言；简报口径按此读法满足 |
| ③ | preset 序列化落点 = `objects[0].asset.preset`（非顶层 `preset`） | 断言按实际形状，README 记档 |
| ④ | 通道事件：合成 PointerEvent 触发 OrbitControls/TransformControls `setPointerCapture NotFoundError`×3（无活跃 pointer——024.4 收集器不可见、本批收集器可见的通道噪声） | 落地改 **trusted CDP 鼠标事件**（浏览器自动派生真实 pointer）后 console 归零；弃用首跑帧，重跑帧为准 |
| ⑤ | 布局污染：一次中断会话把「内容浏览器展开态」持久化到 `t3d-editor.workspace`（底部停靠 280px → canvas 712 vs 932） | 驱动加 `ensureBrowserCollapsed` 布局归一；受影响帧（UI 变体首跑、帧E 首跑）全部按归一布局重拍；最终帧集统一 1292x932 |
| ⑥ | 用例 5 严格逐位 FAIL（483px DOM 覆盖盒微差）/ 场景域 0 diff | 完整分析见上节；裁定移交主代理 |

## 文件清单

```
smoke/
├── README.md            本文件
├── results.json         逐用例断言结果（账目/模板 JSON 字段/像素 diff/console 计数）
├── logs/                各会话驱动器 stdout（result + consoleLogs）+ 诊断 crop
└── frames/
    ├── frameA-place-carded.png / frameB-undo-empty.png / frameC-redo-carded.png   用例1 handle
    ├── frameA2-ui-land-autumn.png / frameB2-ui-undo-empty.png / frameC2-ui-redo-autumn.png   用例1 UI
    ├── frameD-template-save.png / frameE-reload-apply-carded.png                 用例2
    ├── frame-default-ref.png / frameF-bogus-fallback.png                         用例3
    ├── frameG-plain-save.png / frameH-reload-apply-plain.png                     用例4
    └── frameI-celtis-settled.png / frameI2-celtis-reproc.png / frameI-celtis-diff-mask.png   用例5
```

复跑：`node docs/acceptance/T024/024.5/tools/cdp.mjs docs/acceptance/T024/024.5/tools/smoke<N>-*.mjs`（仓库根 cwd；服务 5173 + 取证 Chrome 9333 需先起）；比对收口 `node docs/acceptance/T024/024.5/tools/smoke-compare.mjs`。
