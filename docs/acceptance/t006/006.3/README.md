# T006.3 块×档分桶 + 换档 — 像素取证与数据（2026-09-19）

T006.3 交付验收取证：006.1 选档评估器接入两条渲染链（散布块粒度 / 放置逐对象）、
chunk×source×level 与 source×level 桶、换档（确定性重撒重建 / 实例跨桶迁移）、
迟滞防抖、拾取跨档一致、LOD 总开关（off = 全 High + culled 旁路）。

环境：NVIDIA GeForce RTX 2080 Ti（ANGLE D3D11）/ Chrome 152.0.7977.83（手动实例，
CDP 9333 直连）/ vite dev（5173）/ 1920×1080 DPR=1 / day 预设 / 主视口 canvas
布局尺寸 1292×932（整页截图含 UI，UI 区域在 diff 中为恒定区）/ 风相位冻结
（`__tree3a.freezeTime()` 冻结全局 uTime——像素等同判定的前提）。
工具：`tools/cdp.mjs`（CDP 驱动）+ `tools/pixel-diff.mjs`（零依赖 PNG 解码差异统计，
均沿 t010.5 先例）；原始数据 `placement-log.json` / `scatter-log.json`；
诊断 `tools/diag-sweep.mjs`（阈值标定）。

标定输入（node 实测）：夏栎（asset_tree_3a，8 槽 × 3 档）包围球半径 ≈ 4.5–4.8m、
scale=1、编辑器相机 fov 50°（tan25° ≈ 0.4663）→ 名义换档视距：high→mid ≈ 60m、
mid→low ≈ 161m、low→culled ≈ 605m（阈值 LOD_THRESHOLDS 候选值 6/16/60 换算）。

## ① 放置链（产品放置路径：`__tree3aPerf.place` 真实命令管线 → InstancedAssetPool）

### 1. 近→远→近穿越阈值带（`placement-far-*.png` 17 帧 + `placement-back-*.png` 15 帧）

triangles（主遍 + 影遍提交口径，slot 混合 9 棵）随距离单调降档、无中间消失帧：

| 距离 | triangles | 档位解读 |
|---|---|---|
| 20–40m | 620,632 | 全 High（9×~69K×2 遍） |
| 55m | 419,448 | 逐对象交错换档（近树 High / 远树 Mid——per-object 粒度） |
| 66–120m | 254,252→149,004 | 渐次全 Mid（149,004 恰 = slot-6 Mid 6,414×2×9 + env，逐位吻合） |
| 150–175m | 114,800→47,696 | Mid→Low 交错（名义线 161m 附近） |
| 200–500m | 34,400 | 全 Low |
| ≥750m | 34,400 | **culled：画面零树**（见 ③；提交口径仍计零缩放实例三角，见「已知口径」） |

回程（back 序列）非对称：45m 仍部分 Mid、30m 才回全 High（去程 40m 已全 High）——
**升档迟滞带（名义线 ×0.85 ≈ 51m）实证**。

### 2. 带内静止防抖（`placement-hold-1..4.png`）

机位停 high↔mid 迟滞带内（55m×0.93 ≈ 51m），连拍 4 帧（间隔 350ms）：
**逐帧 meanAbsDiff = 0、pctChanged = 0（像素等同）**，triangles 522,744 ×4 帧恒定，
drawCalls 35 恒定——带内零换档、零抖动。

### 3. 换档点前后帧 + 总开关对照（D27.13，同机位 150m 仅表示档不同）

`placement-switch-on-mid-150m.png`（LOD on → Mid，triangles 114,800）vs
`placement-switch-off-high-150m.png`（`?lod=off` 重载同参复放 → 全 High，620,632）：
mean 0.159/255，>8 差异 **0.31%**、>32 差异 0.21%、差异行 9.4%、质心 (956,546) =
树体区域——**换档差异局部化于树剪影，99.79% 像素一致（无整屏闪烁/无消失）**。
off 状态下 900m 超远不裁剪（620,632 恒全 High——culled 旁路 ✓）。
**换档点前后帧人工复核窗口开放，006.5 验收门处理（D27.10/D23.7）。**

### 4. 往返确定性（far-20m vs back-20m，同机位全 High）

mean 0.012、0.01% 像素差异（≈ minimap 视锥指示器重绘噪声）——换档往返后渲染
逐位复原。

### 5. 资源有界

geometries 全程 ≤ 24（= 8 槽 × 3 档 + 环境），off 状态 10（仅 high 桶）——
档位桶天然有界（缓存每资产 槽数×档数）。

## ② 散布链（`__scatterSmoke.scatter`：夏栎 320×320m / density 0.003 / 306 实例 / 100 块）

### 1. 近→远→近（`scatter-far/back-*.png` 各 7 帧 + holds 4 帧）

| 距离 | triangles | drawCalls | 可见块 | instances |
|---|---|---|---|---|
| 80m | 2,312,152 | 179 | 45/100 | 306 |
| 120m | 2,459,966 | 221 | 56/100 | 306 |
| 180m | 1,681,594 | 289 | 73/100 | 306 |
| 260m | 1,430,228 | 371 | 95/100 | 306 |
| 400m | 1,033,878 | 393 | 100/100 | 306 |
| 650m | 365,916 | 147 | 100/100 | 306 |
| 1000m | **4**（仅环境） | 3 | 100/100 | 306 |
| 回程 650/400/260/180/120/80 | 100,112 / 968,290 / 1,088,084 / 1,377,466 / 1,521,174 / 2,274,136 | — | — | 306 |

- **instances = 306 全程恒定**：换档 = 确定性重撒重建，实例集合跨档不丢不重（机器证据）；
- 1000m 全场 culled（triangles = 4 = 环境地面）：块组仍过视锥但逐 (块×资产) 网格
  visible=false——**culled 线外块不渲染 ✓**；
- 回程同距三角数普遍低于去程（back-260 1.088M < far-260 1.430M）——块级迟滞实证；
- 80→120m 三角数上升 = 视锥内块数增加（45→56）主导，非档位异常；
- drawCalls 峰值 393（400m）=「块×资产×档」桶数展开——**批次爆炸面移交 006.4 批次控制**（本任务预期内）。

### 2. 带内静止防抖（`scatter-hold-1..4.png`）

名义降档线 260m×0.93 处连拍 4 帧：triangles 1,499,378 ×4 恒定、drawCalls 359 恒定、
像素 diff 0 / 0 / mean 0.003（0% 变化）——带内零抖动。

### 3. 往返确定性（far-80m vs back-80m）

0.03% 像素差异——重撒 + 换档往返后逐位复原（同 seed 确定性）。

## ③ culled 视觉实证（placement-culled-far-1100m.png）

1100m（m ≈ 109 > 60）画面视觉核验：**视口零树**（空地平线）——超远实例零缩放
（槽位矩阵提交仍在 → renderer.info 三角数为提交口径而非像素口径，149K = 冷跳时
停留 Mid 桶的零缩放提交；**画面无树 = culled 生效**）。回视 300m（
placement-culled-back-300m.png）树群恢复可见（vs 1100m 帧 diff：>8 差异 5.5%、
质心 (966,641) = 树区局部恢复）。已知口径记档：culled 实例仍占提交计数与 1 draw
call/桶——归 006.4 批次控制优化面（如桶内全 culled 时 count=0 提交跳过），非本任务
验收项。

## ④ 拾取跨档一致 / 开关回退 / 块生命周期

单测覆盖（tests/runtime/scatter/ScatterChunkManager.lod.test.ts 13 测 +
tests/runtime/InstancedAssetPool.lod.test.ts 6 测 + lodView.test.ts 4 测）：
任意档网格命中 → 同一源 id/业务 id；culled 网格拾取挡板；总开关 off 重建回
high / culled 旁路 / 再开恢复；局部重算保档、区域扩块收敛同档、摘源重建（撤销
重做模型）确定性复原；迟滞带内往返零换档（桶集与源请求零 churn）。

## ⑤ 三门槛

`npm test` 2,624 全绿（187 文件；基线 2,585/183 + 本任务 23 测/3 文件，余为并行
任务 006.2 增量）/ `check:layers` 458 文件过 / `typecheck` 零错。

## 图清单

placement-far-{20,40,55,62,66,72,90,120,150,165,175,200,260,350,500,750,900}m ×17 ｜
placement-back-{750,500,350,260,200,170,150,120,90,70,62,55,45,30,20}m ×15 ｜
placement-hold-{1..4} ×4 ｜ placement-switch-{on-mid-150m, off-high-150m, off-far-900m} ×3 ｜
placement-culled-{far-1100m, back-300m} ×2 ｜ scatter-far-{80,120,180,260,400,650,1000}m ×7 ｜
scatter-back-{650,400,260,180,120,80}m ×6 ｜ scatter-hold-{1..4} ×4
