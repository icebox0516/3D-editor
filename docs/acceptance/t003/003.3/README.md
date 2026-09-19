# T003.3 Style 配方 + 序列化 · 浏览器端到端验收取证（2026-09-19）

> 代码 2026-09-17 已随全量提交 73ee316 入库（交接快照所记「41 项未提交挂账」已不存在，工作区干净）；本会话为冻结后验收续走收官（T008/T009 双 epic 完结后恢复，基线 2542）。

## 环境

- dev server 5173（Vite）+ agent-browser CDP 驱动，视口 1728×1080（主视口 canvas 1100×712，金丝雀通过）
- 结构化证据源：`window.__scatterSmoke.stats()`（drawCalls/triangles/chunks/instances）；视觉核对 analyze_image（临时 http-server 8077 供图）

## 上会话中断点处置结论（非产品 bug，两处验收读数误判）

1. **「区域意外处于隐藏态」误读**：Inspector 可见开关为动作命名（`label = visible ? '隐藏 X' : '显示 X'`，`checked = region.visible`，InspectorPanel.tsx:743）。checked=true + label「隐藏」实为「当前可见，按钮动作是隐藏」。源码核实 + 本会话新画区域未触任何控件即同态复现，功能正确。
2. **「Triangles=4 无实例」**：本会话同路径复测实例可见正常（下表第 1 行），推断为上会话读取时机/口径问题。散布管线无故障。

## 端到端验收记录（全过）

| 步骤 | 操作 | 结构化证据 | 判定 |
|---|---|---|---|
| 画区域 | 多边形四顶点 + 页内 dblclick 闭合 | Objects=1，~4800m² | ✅ |
| 应用散布样式 | 「散布冒烟（临时）」radio | instances=145 / triangles=146806 / chunks 8 | ✅ 01 图 |
| 改密度局部重算 | 0.03→0.06（提交制） | instances 145→276（≈2×），triangles 翻倍 | ✅ |
| undo/redo 密度 | Ctrl+Z / Ctrl+Shift+Z | 276→145→276 逐位回放 | ✅ |
| 换表面型样式 | 「纯色」 | instances=0 / triangles=6 / chunks=0（换出即清） | ✅ |
| undo 换装 | Ctrl+Z | 276/280614 全恢复（换入即散） | ✅ 02 图 |
| 拾取反查 | 空白点击清选→点散布实例 | 0 选中→「未命名区域 1」selected（D5 派生式） | ✅ |
| seed 重掷 | 「重掷散布种子」 | seed 602415709（派生）→1523935307（显式）；instances 276→212、triangles 变化＝重撒实证 | ✅ 03 图 |
| 重掷可撤销 | Ctrl+Z | seed 回派生值，276/280614 逐位恢复 | ✅ |
| 序列化导出 | 文件→导出场景（blob 钩子拦截） | style = `{presetId: dev.scatter_smoke, seed: 1523935307, overrides:{scatter.densityPerM2:0.06}}` | ✅ |
| 序列化重载 | 文件→打开…（upload） | notify「已打开：1 对象 · 11 图层」；stats 212/215102 与导出 seed 确定性输出逐位一致；Inspector 三要素恢复（散布冒烟选中/密度 0.06/seed 1523935307） | ✅ 04 图 |
| console | 全程 | 零 error（唯一 warning 为下方口径验证的预期告警） | ✅ |

回归：`npm test` 181 文件 **2542 全过** + `check:layers` 446 文件 + `typecheck` 零错。

## 验收方法学记档（本会话新增）

- **agent-browser 原生 click 对本应用部分自定义控件不触发 React onClick**（radio 芯片、重掷按钮、菜单项、取消按钮）；回退 DOM `dispatchEvent(pointerdown) + el.click()` 生效（沿 T008.5「合成点击回退 DOM click」经验，范围扩大）。fill+Enter 对提交制 spinbutton 有效。
- **「导入 JSON…」≠ 场景存档路径**：走 JsonImporter + BUILDING_MAPPING（外部数据元素导入），喂整场景文件得「0 对象 · 1 告警」（预期行为）；场景存档往返 = 文件→导出场景 ↔ 文件→打开…（SceneSerializer 整场景全量替换）。两口径勿混。
- **重掷验收判据**：instance 计数随 seed 波动（泊松采样，276→212），判据用「seed 值变化 + stats 变化 + undo 回放」，勿用计数恒定。
- 密度覆写走 `UpdateObjectCommand`（undo 栈作用于区域对象）；重掷走 `ChangePresetCommand`（InspectorPanel.tsx:1011）。

## 文件

- `01-scatter-applied.png` 应用散布样式后（145 实例可见）
- `02-after-undo-restore.png` 换表面型后 undo，散布全恢复
- `03-seed-rerolled.png` seed 重掷后（重撒布局）
- `04-reloaded-from-json.png` 「打开…」重载后 + 区域选中 + Inspector 三要素恢复
- `scene-roundtrip-sample.json` 序列化往返样本（导出原样，seed=1523935307）
