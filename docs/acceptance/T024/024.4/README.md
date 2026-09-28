# T024.4 浏览器色点 UI 取证（2026-09-28）

> 浏览器冒烟取证：色点渲染判据 + 选中态持久化 + 四放置入口带卡。工具沿 024.3 cdp.mjs 体例
> （`tools/cdp.mjs` 增裸 `send` 透传——键 4 重放的 `Input.dispatchKeyEvent` 需要），
> 三批脚本 `tools/ui-smoke*.mjs`（首批 01–07 远景帧 + 二批 10–13 近景对照/断言 + 三批 14–15
> 持久化；另 ui-smoke4 为点回默认卡的重渲染补读）。

## 判据 → 证据对照

| 判据 | 证据 | 结果 |
|---|---|---|
| 色点渲染：多卡显 / 单卡·空卡·GLB 不显 | `renderCheck`（31 卡 → stripCount **11** / dotTotal **22** = 11 双卡树 ×2；camphor / ligustrum / asset_trashbin 均 false）+ 帧 10 | ✅ |
| 点选持久化 + 激活态 | `selectCheck`：点秋卡后 store=`{"asset_tree_ginkgo":"autumn"}`，dot title「当前色卡：默认 / 切换到『秋·金黄』」；帧 02/10 | ✅ |
| 点击放置带卡（Ghost + 落地） | 帧 03（Ghost 金黄）+ 帧 04（落地 OBJECTS 1）+ 帧 11 左 1 树金 | ✅ |
| 键 4 重放带卡 | 帧 13：重放 Ghost 半透明金黄预览（OBJECTS 仍 3，TRIANGLES 132.6k→162.2k = Ghost 几何加入） | ✅ |
| 拖放 mime 通道带卡（读 mime 非读存储） | 清存储后仅 mime drop → 帧 11 左 2 树金（存储为空时金色 = 证据：preset 来自 mime 读取） | ✅ |
| 默认卡零变化（无 mime + 无存储选中） | 帧 11 右 1 树**绿**（= 现行默认基调）；帧 07 同证 | ✅ |
| 同树跨卡对照（冠变干不变） | 帧 11/12 同帧三树：两金一绿、干色一致、几何同构——色差即卡差 | ✅ |
| 刷新持久化 | `storeOnBoot`=`{"asset_tree_ginkgo":"autumn"}`（重载前）+ `activeAfterReload`=[false,true] + title「当前色卡：秋·金黄」；帧 14 | ✅ |
| 点回默认卡 = 删条目（默认卡省略不落盘） | `backToDefault` store=`{}`；重渲染补读 active=[true,false]（默认点激活环归位）；帧 15 | ✅ |
| console 零错误零警告 | 二批 `consoleLog` = `[]`（覆盖挂载/点选/放置/拖放全动作） | ✅ |

## 已删卡宽容回退（读侧）

UI 读侧统一走 domain `resolveDeclaredPreset`（单测矩阵覆盖：存留脏 id / 空表 / file kind →
undefined 回默认卡）；PlacementTool 写侧 fail-fast 语义不变（024.1 既有测试守护）。
浏览器端不再单独构造已删卡场景（声明卡集由整表锁锚定，无运行时删卡入口）。

## 通道记档

- 首批脚本二段 `Page.navigate` 后挂起（>3 分钟无产出，01–07 帧已完整产出）——原因未深究
  （疑似同 ws 二次导航后 eval 上下文等待），拆批规避：后续批次一律单 navigate。
- 拖放为合成 DragEvent + DataTransfer（CDP eval 构造），读侧 `getData` 真实消费——非
  input.dispatchDragEvent 原生通道；mime 写侧（dragstart）为真实 UI 事件由 ContentBrowser
  单测与代码审查覆盖。
- 激活态 class 为点击后同步读会读旧态（React 渲染滞后）——断言一律以 store 值 + 重渲染后
  补读为准（ui-smoke4）。
