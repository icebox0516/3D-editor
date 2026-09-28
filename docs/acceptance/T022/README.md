# T022 资产库清理 — 验收取证

日期：2026-09-28 ｜ 会话：主代理直接执行（清理类任务，无渲染实质修改）

## 三门槛（判据式口径：代码执行面变化 → 全量）

| 门槛 | 结果 |
|---|---|
| `npm test` | **4159 全绿**（273 文件；基线 4243 − 净 84 = 删除的 plantAssets/plantMaterials 整文件用例 + 浏览器标签/排序用例 + treeCanopyChain 零变化锁精简） |
| `npm run check:layers` | 625 文件全过（632 − 7 删除文件） |
| `npm run typecheck` | 零错 |

## 视觉冒烟（浏览器展开态）

取证帧：`browser-expanded-state.png`（IAB 1280×276 面板裁剪，Vite dev 5173）

- **结构断言（DOM）**：`ed-browser__bar` 唯一（44px 单行）；`ed-browser__rail` / `ed-browser__tags` / `ed-browser__sort` 全域零残留；网格 `gridSpansFull=true`（1280/1280 占满 body）；31 卡无重复 id；一行 8 列（minmax(150px,1fr)）
- **交互**：分类芯片切换实测——「收藏」→ active+count 1/31（上会话持久化筛选态）、「全部」→ 31/31、「plant」→ 16/31（= 13 乔木 + 3 GLB plant 目录，**四植物删除后计数正确**）；搜索词清空后 31/31
- **console**：应用面零错误零警告（`[RUM] ArmsEventBridge is not available` ×2 为 IAB 宿主注入的遥测桥噪音，非应用代码，记档排除）
- 注：视觉模型对 1280px 宽图初判「工具条两行重复」——DOM 仲裁推翻（barCount=1、titleCount=1、cardCount=31 无重复），读图伪影；「展开」按钮在裁剪帧右缘被截属裁剪伪影，交互实测展开态生效

## 存量场景加载冒烟（含已删四资产 id）

取证帧：`legacy-scene-smoke-viewport.png` ｜ 方法：React fiber 提取 EditorHandle → `openScene`（file.open 同链路：deserialize → openScene）

场景：5 个 model 对象（asset_oak / asset_pine / asset_shrub / asset_flower + 对照 asset_tree_3a），layer/environment 正常声明。

- **不崩溃**：openScene 正常返回、场景名 HUD 更新为「存量场景冒烟」、渲染循环持续（等待 1.8s 后无 error / 无 unhandled rejection）
- **引用降级**：四已删 id 各产生一条设计内降级 warn（`[InstancedAssetPool] 模型资产源加载失败，实例不渲染 | asset_oak`）——实例不渲染正是降级语义，无循环刷屏；对照对象 tree_3a 正常渲染（视口右侧树可见）
- **视口终态**：正常渲染（网格 + 地平线 + 对照树），无崩溃画面 / 错误弹窗
- console「干净」口径记档：零 error + 降级 warn 为设计内行为（每资产一条、不重复），符合「引用降级不崩溃」验收意图

## 零残留检查

- `ed-browser__tags` / `ed-browser__rail`：src 全域零残留（含 app.css / DESIGN.md 同步后）
- `buildTagChips` / `sortAssets` / `AssetSortKey` / `RailSelection`：src + tests 零残留
- `asset_oak` / `asset_pine` / `asset_shrub` / `asset_flower`：src + tests 代码引用零残留（tree_3a 注释两处改族口径；「沿 plantMaterials 范式」等历史溯源注释按任务书范围保留——自述完整的纪律说明，非模块依赖）

## 进程清理

dev server（5173）已停；验收浏览器标签已关。
