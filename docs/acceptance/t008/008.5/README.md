# T008.5 T008 收官验收门取证（2026-09-19）

> 主代理执行验收门（浏览器产品路径 + DEV 驱动面结构数据；agent-browser + `__tree3aPerf`/`__tree3a`）。
> 基线：008.3 锚点定稿（slot-0 + R1 材质）+ 008.6 参考对照表 + T009.3 用户裁定门（8 槽定稿）+ T009.7 四类验收。

## 环境

- dev server 5190（Vite dev）+ agent-browser（chrome-for-testing，CDP）；1920×1080 虚拟显示器（rAF ~10Hz——只影响帧率不影响本门功能/截图/账目取证）。
- 资源账目口径：`window.__tree3aPerf.stats()` = renderer.info（drawCalls/triangles = 上一完整帧；geometries/textures/programs = memory/程序计数）+ 驱动面存活对象数。

## 1. 全链路验收（UI 产品路径）

| 环节 | 证据 |
| --- | --- |
| 入库+缩略图 | 资产库 23 卡含「夏栎」，缩略图为离屏快照树形渲染（`library-thumbnail.png`） |
| Ghost 预览 | 点卡片进放置态，指针在画布内 Ghost 即真树形态（triangles 32428/35062 = 整树非占位盒）；携 seed 槽路由生效 |
| 点击放置 | 视口点击落树；连放 Ghost 续显下一枚（drawCalls 9 = env3+桶4+ghost2） |
| 重掷 | Inspector Dices ×16 + 首放 seed 共 **17 样本**，经真实 domain `shapeSlotOf` 离线对账：**8 槽全覆盖** {0:2,1:2,2:3,3:2,4:2,5:3,6:2,7:1}（含同槽重掷合法）；全程 geometries 恒定零重建 |
| undo/redo | Ctrl+Z ×16 → seed 逐位回放至首放值 161815513；Ctrl+Y ×16 → 复原至末次重掷 462780077 |
| 复制孪生 | Ctrl+D ×5：6 对象全部 seed=462780077、变换独立（+1/+1 递增偏移），存档 JSON 逐字段验证（`roundtrip-scene.json`） |
| Gizmo 编辑 | 移动工具激活后三色轴挂载（像素级定位），拖 X 轴 → 位置 (-104.81,0.03,27.65)→(-95.00,5.00,27.65)，seed 不变；Ctrl+Z 逐位复原 |
| 存档往返 | 导出场景 JSON（blob 拦截取证 6605B）→ **真重载页面**（基线归零）→ 打开…导入 → Objects=6、seed/坐标与导出原树逐位一致、drawCalls=7（单桶重建后再证）；字节级往返由 e2e `tests/app/placement.tree3a.test.ts` 锁定 |

## 2. 同 sourceKey 多实例一致性（核心项）

6 棵同槽树（1 放置 + 5 复制孪生，seed 全等 462780077 → 同 sourceKey）：

| 度量 | 1 棵 | 6 棵 | 判定 |
| --- | --- | --- | --- |
| drawCalls | 7（env3+桶4=2 组×主/影） | **7（恒等）** | 单一 InstancedMesh × 2 groups ✓ |
| geometries（全新会话） | 5（env3+槽源1） | **5（恒等）** | 同 sourceKey 单一 Geometry Source ✓ |
| triangles | 70944 | 425644 ≈ ×6 | 实例全渲染，无逐对象退化 ✓ |

- 三个独立场景各证一次：手放链路 / 重载+存档导入重建 / 驱动面复放（seed 4→slot 5 + Ctrl+D ×5）。
- 实例级差异仅经 instanceMatrix/instanceColor/aSeed 通道（架构由 008.1 硬测试 S1≠S2 同槽同引用锁定；孪生仅 matrix 异、混播森林 seed 各异同桶共染）。
- 视觉：`sixtrees-singlebucket-22m.png`（6 棵同形态可辨、无渲染异常）。

## 3. 零错误五拆

1. **运行时无异常**：全程（~150 步操作）console 零错误零警告、page errors 零。
2. **资源无重复 build**：Ghost 换槽激活 geometries 恒定；重掷 16 次槽间切换零新建；驱动 21 棵（seed 1..21 全 8 槽）= 11 geometries（3 env+8 槽）有界。
3. **Ghost 不触发 dispose**：Ghost 开（+2 dc）→ Esc 关（计数全持）→ 再开换槽（缓存命中零重建）循环两轮。
4. **放置/删除/Undo/Redo 无资源泄漏**：驱动 place/clear 共 23 轮（5 棵×10 + 21 棵×10 + 21 棵×3）——textures=6 / programs=9 恒定；geometries 增量 = 新访问槽源入缓存（D19.4 设计内有界 8 槽，铺满后 31 恒定）；删除全部后 drawCalls 回 3、实例缓冲随池释放。
5. **同 sourceKey 不重复创建 Geometry/Material**：见 2（三次场景恒等账目）。

### 记档：TransformControls gizmo 计数定性（非泄漏）

首次 Gizmo 拖拽懒创建 UI helper：+13 dc / +224 tri / ~+20 geo / +2 programs，切换回选择工具 dc/tri 立即回落（gizmo 摘除），geo/programs 为工具生命周期缓存——**有界不累积**（二拖/undo 计数恒定），归 Renderer 所有，非池/放置链路泄漏。池侧账目以 drawCalls/objects 为准。

## 4. 8 槽统一质量验证（引用基线 + 终态复核）

- `slots-panorama-42m.png`：`__tree3a.mountSlots()`（spacing 11m）+ `viewSlots(42m/35°/16°)` + freezeTime——机器核验 8 棵可辨、形态明显不同（冠形/高矮/疏密）、同种语言一致、无渲染异常，与 T009.3 用户裁定门 8/8 定稿一致。
- 锚点三距离：`anchor-near-12m.png` / `anchor-mid-25m.png` / `anchor-far-50m.png`（`__tree3a.mount()` slot-0 锚点 + `view(35°/8°)` 固定机位 + freezeTime，绿/棕像素验证树体在画）。

## 文件清单

- `library-thumbnail.png` 入库+缩略图 ｜ `sixtrees-singlebucket-22m.png` 同槽 6 棵合批视觉
- `slots-panorama-42m.png` 8 槽全景 ｜ `anchor-{near,mid,far}-*.png` 锚点三距离
- `gizmo-selected.png` 选中+gizmo 态 ｜ `roundtrip-scene.json` 存档往返样本（6 孪生）

## 门槛

`npm test` 181 文件 / 2542 全绿；`check:layers` 446 文件 OK；`typecheck` 零错误。进程清理：dev server / 浏览器 / chrome-for-testing 已停，临时探针已删。
