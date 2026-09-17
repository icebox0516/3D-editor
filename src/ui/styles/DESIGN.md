# 编辑器 UI 设计系统 —— 方向 A「暗色专业工作台」

> 状态：T1.8 奠基（用户经设计门选定方向 A，不可更改）。后续所有面板（T2.4 属性面板自动生成、图层/场景树、绘制状态栏等）必须引用 `tokens.css` 变量实现，禁止硬编码颜色/字体。

## 1. 概念：夜间制图台（Night Drafting Table）

一张深夜的制图桌：石墨蓝的桌面层层叠起，唯一的光源是一盏琥珀色工作灯，照亮正中央的图纸——也就是 3D 视口。所有面板都是桌面上的工具与仪表：低调、紧凑、有细线刻度，数值读数像测绘仪器一样以等宽数字对齐。

**一件让人记住的事**：琥珀色只出现在「当前正在被操作的东西」上——激活工具、选中项、聚焦输入框、可撤销的历史点。其余一切让位给视口。

## 2. 色彩

| 令牌 | 值 | 语义 |
|---|---|---|
| `--surface-0` | `#0f1115` | 应用底、视口外框 |
| `--surface-1` | `#16181d` | 面板底（基准层） |
| `--surface-2` | `#1c1f26` | 面板内分组、输入框底 |
| `--surface-3` | `#232730` | 悬停、抬起 |
| `--surface-4` | `#2b3040` | 按压、激活行 |
| `--line-1/2/3` | `#262a33` / `#343a47` / `#465066` | hairline / 输入框边 / 悬停边 |
| `--ink-1/2/3` | `#e6e9ef` / `#b4bac6` / `#7f879a` | 主文 / 次文 / 标签与单位 |
| `--accent` | `#e8a33d` | **唯一强调色**（琥珀），含 hover/active/soft/line/glow 变体 |
| `--danger` `--success` | `#d9534f` `#5faf7a` | 低饱和状态色，仅极少量提示 |
| `--mode-scene` | `var(--accent)` | 工作模式专属色（T7.1 起；T10.2 增至七枚）：场景 = 琥珀（基准工作灯） |
| `--mode-build` | `#d98d6a` | 建造：赤陶 |
| `--mode-road` | `#7ea6c9` | 道路：钢蓝 |
| `--mode-terrain` | `#74ad8a` | 地形：苔绿 |
| `--mode-decoration` | `#6db8ab` | 装饰：青碧 |
| `--mode-annotation` | `#c98ba6` | 标注：绯玫 |
| `--mode-measure` | `#ab9ee6` | 测量：藤紫（T10.2；兼测量覆盖层 WebGL 用色的 CSS 侧对照，见 §5.22） |

规则：
- 表面用「层级」而非「渐变」区分：越靠近用户越浅一档；相邻层至少差一档。
- 禁止紫色渐变、禁止大面积低对比灰字（`--ink-3` 仅用于标签/单位，正文用 `--ink-1/2`）。`--ink-2` 对 `--surface-1` 对比度约 9:1，`--ink-3` 约 4.9:1。
- 琥珀色不作装饰：仅表达「激活 / 选中 / 焦点 / 可操作的主动作」。同一屏幕上不超过一处大面积琥珀填充（主按钮）。
- 模式专属色（T7.1）与状态色同级约束：低饱和、与琥珀同一明度/饱和带，仅用于模式徽标/引导卡的圆点、描边与文字（≤12px 色量），不作大面积填充、不侵犯「琥珀 = 正在操作」语义；analysis 禁用无专属色（measure 已于 T10.2 转正）。
- 视口内的 3D 内容不受 UI 色板约束（环境预设 白天/傍晚/夜景/科技 由 runtime 决定）。

## 3. 字体

- **UI 字体** `--font-ui`：**Archivo**（工业感 grotesque，源自 19 世纪广告字体，字腔紧凑、辨识度高），CJK 回退系统无衬线。禁 Inter / Roboto / system-ui 作主字体。
- **数字字体** `--font-mono`：**IBM Plex Mono**。一切坐标、角度、缩放、尺寸、计数用等宽 + `font-variant-numeric: tabular-nums`，数值列纵向对齐，改值时不抖动。
- 字号阶：10 / 11 / 12 / 13 / 15 / 18。面板正文 12px，标签 11px，分组标题 10–11px 小型大写 + `--tracking-caps` 字距。
- 字重：400 正文、500 标签/按钮、600 分组标题与面板名。

## 4. 密度与布局

- 2px 基准网格（`--sp-1..8` = 2/4/6/8/12/16/24/32）。
- 控件高 `--control-h` 24px；列表行 `--row-h` 26px。
- 布局（T5.1 起为「四区一层 + 边缘垂直工具条」）：主菜单条 `--menubar-h` 32px / 上下文工具条 `--contextbar-h` 34px 两行横贯；主行 = 垂直工具条 `--vtool-w` 48px（常驻占位）+ 左面板列 `--panel-w-left` 260px（拖 180–420）+ 视口 `1fr` + 右面板列 `--panel-w-right` 320px（拖 240–480）；底部浏览器行 `--browser-h-compact` 60px（拖 60–320，展开目标 `--browser-h-expanded` 280px）；状态栏 `--statusbar-h` 22px。区域可隐藏（该列/行宽高归零，视口自动扩展不留空白，需求 §四）；面板分区可折叠为 28px 标题条（PanelFrame）。`--toolbar-h` 38px 留存兼容（顶部两段已由 `--menubar-h`/`--contextbar-h` 接替）。
- 视口占比自检：1920×1080 默认布局宽度占比 ≥65%，左右面板全隐藏 ≥90%（`viewportShare`，需求 §43.1）。
- 面板之间只用 1px `--line-1` 分隔，不用外发光或大圆角卡片。
- 圆角锐利：2 / 3 / 5px。阴影只在浮层（`--shadow-2`），面板顶部用 `--highlight-top` 一条极淡高光表达「抬起」。
- 纹理 `--texture-hatch`：极淡 135° 细斜纹，仅铺在应用底与页头，**不进内容区**，保证可读。

## 5. 组件约定（`app.css` 中以 `ed-` 前缀实现）

| 组件 | 类名 | 要点 |
|---|---|---|
| 面板 | `.ed-panel` `.ed-panel__title` | 标题小型大写；分组 `.ed-section` 之间 hairline |
| 按钮 | `.ed-btn` `.ed-btn--primary` `.ed-btn--ghost` | 默认 surface-2 + line-2；主按钮琥珀填充 + `--accent-ink` 文字；禁用降为 `--ink-disabled` |
| 字段 | `.ed-field` `.ed-field__label` | 标签左 / 值右，标签 `--ink-3` 11px |
| 输入 | `.ed-input` `.ed-input--num` | 数值输入等宽右对齐，聚焦 `--accent-glow` |
| 选择 | `.ed-select` | 原生 select，`color-scheme: dark` 统一菜单 |
| 资产项 | `.ed-asset` `.ed-asset--active` | 分类色块 + 名称；激活时琥珀左侧竖线 + soft 底（T1.8 迷你列表，T2.1 起由资产卡片取代） |
| 键帽 | `.ed-kbd` | 快捷键提示，等宽小字 |
| 读数 | `.ed-readout` | 等宽 tabular 数字 |
| HUD | `.ed-hud` | 视口四角状态层（T5.7 见 §5.10）：左上模式/机位/场景名芯片、右上控制下拉、右下 = 小地图画布（T7.7） |

### 5.1 资产库（T2.1 增补）

| 组件 | 类名 | 要点 |
|---|---|---|
| 搜索框 | `.ed-lib__search` | 标准 `.ed-input`；命中 name/tags，占位文案「搜索名称 / 标签」 |
| 筛选芯片 | `.ed-chip` `.ed-chip--active` | 分类/收藏/全部的紧凑筛选行（20px 高，可换行）；当前筛选琥珀 soft 底 + accent 文字（=「正在被操作」），计数等宽小字 |
| 资产卡片 | `.ed-card` `.ed-card__main` `.ed-card--active` | 双列网格卡片：缩略图（3:2，SVG 占位 → 真实快照替换）+ 名称 + 标签（9px ink-3）；正在放置的卡片琥珀边 + soft 底；缩略图缺失时以等宽首字字形兜底 |
| 收藏星标 | `.ed-card__star` `.ed-card__star--on` | 缩略图右上角 18px 星标按钮；未收藏描线 ink-3，已收藏琥珀填充（localStorage 持久化） |

### 5.2 场景树 / 图层 / 自动参数表单（T2.4 增补）

| 组件 | 类名 | 要点 |
|---|---|---|
| 侧栏容器 | `.ed-side--left/--right` `.ed-panel--fill` | 左栏纵向堆叠「大纲 + 绘制」、右栏 = 检查器单面板（T5.4 三标签，见 §5.7）；`--fill` 等分伸缩（`--layers/--environment` 尺寸类已随 T5.3/T5.4 收编退役） |
| 图标开关 | `.ed-icon-toggle`（`--on`） | 18px 图标二态按钮（role=switch）：场景树/图层的眼睛、锁；开启态琥珀图标 = 生效中；boolean 样式参数用 `.ed-icon-toggle__track` 轨道式开关（开 = 琥珀圆点右移） |
| 滑杆+数值框 | `.ed-slider` `.ed-slider__range` | number 类样式参数标准控件：range（accent-color 琥珀）+ 右侧 52px 等宽数值框；拖动即时显示草稿、松手提交（不逐帧进历史） |
| 取色器 | `.ed-color` `.ed-color__hex` | 原生 color input + `ed-swatch` 色样 + 等宽 hex 读数（§7.2 约定的落地） |
| 场景树分组 | `.ed-tree__group` | T5.3 起按要素类型虚分组（组行 `.ed-tree__group-row` 见 §5.6）；表外类型归「未分层」尾组 |
| 树行 | `.ed-tree__row`（`--selected`/`--locked`）`.ed-tree__name/__focus/__rename` | 行高 `--row-h`：眼睛/锁/名称/定位按钮（T5.3 起眼睛/锁 hover 浮显、类型读数由分组承担，见 §5.6）；选中行琥珀左线 + soft 底；锁定行名称降为 ink-disabled 且不可选；定位按钮悬停显形（琥珀 hover）；双击/F2 行内重命名输入框 |
| 图层行 | `.ed-layer__row`（`--dragging`/`--drop`）`.ed-layer__head/__name/__opacity` | 头行（眼睛/锁/名称/成员计数）+ 透明度滑杆行（草稿松手提交）；拖拽排序：拖动态半透明、落点琥珀顶线 |
| 样式参数表单 | `.ed-style-params` | 由 StyleParameter 声明自动生成的 `.ed-field` 列（label 列 64px）；作用域/预设下拉复用 `.ed-select` |

### 5.3 绘制模式：视图按钮 / 状态栏 / 网格设置（T3.3 增补；T5.6 模式分段与绘制面板退役）

| 组件 | 类名 | 要点 |
|---|---|---|
| 视图按钮 | `.ed-view` `.ed-view__btn` | ghost 小按钮组（透视/顶/前/侧 + F 聚焦 + Home 全景），经相机 Port 生效；F 无选中时禁用 |
| 状态栏 | `.ed-statusbar` `.ed-statusbar__segment`（`--error`） | 底部横贯仪表条（22px）：读数段 = 小型大写标签 + 等宽 tabular 数值（长度/面积/坐标 X·Z）；拦截提示 danger 色；空闲「就绪」；右侧固定快捷键提示 |
| 网格设置 | `.ed-section`（T5.4 迁入 Inspector） | 显示开关（`.ed-icon-toggle__track` 轨道开关）+ 间距/尺寸等宽数值框（草稿失焦/回车提交）；间距 = 绘制吸附步长（环境通道 environment.grid）。原左栏独立面板 `.ed-panel--grid .ed-grid` 随 T5.4 收编退役 |
| 退役登记 | `.ed-mode*`、`.ed-panel--draw`、`.ed-draw__*` | 模式分段（ModeSwitch）与绘制面板（DrawPanel）随 T5.6 退役——职能拆分至垂直工具条（§5.9）与 Context Toolbar（QWER 组 + 绘制中段）；绘制入口 = 垂直条 / 数字键 1–6 / 大纲「创建 ▾」/ 中段切换器 |

布局增补：应用网格新增第三行状态栏（`'statusbar statusbar statusbar'`，高 `--statusbar-h`）；左栏纵向堆叠「场景树 + 图层 + 资产库 + 绘制 + 网格」。视觉令牌零新增（全部复用 §2/§3 既有令牌）。（T5.1 起本段布局描述由 §4「四区一层」接替，资产库暂移底部浏览器条。）

### 5.4 四区一层骨架：面板壳 / 分隔拖柄 / 区域开关（T5.1 增补）

| 组件 | 类名 | 要点 |
|---|---|---|
| 面板壳 | `.ed-frame`（`--collapsed`）`.ed-frame__head/__toggle/__caret/__name/__hide/__content` | 统一面板壳：标题条（28px，沿 `.ed-panel__title` 小型大写）= 折叠按钮（▾ caret 旋转 −90°，整条可点）+ 只读附注 + 可选区域隐藏 × 按钮；折叠收成标题条（内容 `display:none` 挂起，保留滚动/草稿）；尺寸类沿 `--fill/--layers/--draw/--grid/--environment` |
| 分隔拖柄 | `.ed-splitter`（`--x/--y`） | 命中区 4px + 视觉 1px `--line-1`（::after 居中）；hover `--line-3`、拖拽中琥珀 `--accent-line`；focus-visible `--accent-glow`；键盘 ←→/↑↓ 步进 16px；拖拽期间 body 加 `ed-dragging`（禁选 + 统一 resize 光标 + 关闭网格轨道过渡） |
| 区域开关 | `.ed-zone-toggle`（`--hidden`） | 上下文条右端的左/底/右面板组显隐开关（aria-pressed = 可见）：可见 = surface-2 底 + ink-2；隐藏 = 透明底 + ink-disabled；三态皆 hover/focus-visible 可辨 |
| 区域容器 | `.ed-side--left/--right/--bottom` `.ed-side__panels` | 左右列与底部行为可隐藏网格槽（宽/高经 `--zone-*-w/h` 内联变量归零收起，`overflow:hidden`）；`__panels` 纵向堆叠 PanelFrame |
| 占位条 | `.ed-contextbar` `.ed-vtool` | 上下文工具条（`--contextbar-h`，仅承载区域开关，T5.6 填充）与垂直工具条（`--vtool-w`，空占位常驻） |

布局令牌见 §4；新增令牌全部登记于 `tokens.css`（`--menubar-h/--contextbar-h/--vtool-w/--panel-w-left/--panel-w-right/--browser-h-compact/--browser-h-expanded`）。视觉零新装饰（复用 §2 色板与 §6 动效档位）。

### 5.5 主菜单条与保存状态（T5.2 增补）

| 组件 | 类名 | 要点 |
|---|---|---|
| 菜单条 | `.ed-menubar` `.ed-menubar__nav/__spacer/__end/__group` | 主菜单条槽位（`--menubar-h`）：左品牌（沿用 `.ed-brand`）+ 七菜单 + spacer + 右侧常驻组（组间 1px `--line-1` 分隔）；禁用常驻按钮（布局/设置）灰显 + tooltip；顶部提示条已退役（T5.8 Toast 接替，见 §5.11） |
| 顶层菜单按钮 | `.ed-menu__btn`（`--open`） | 透明底 ink-2 文字；hover surface-3；展开态 = 琥珀文字 + surface-3（「正在操作」语义，不作大面积填充）；`aria-haspopup/aria-expanded`，←→ 切换、↓/Enter 展开 |
| 菜单弹层 | `.ed-menu__popup` `.ed-menu__item`（`--disabled`/`--danger`）`.ed-menu__check` `.ed-menu__sep` | surface-1 + line-2 边 + `--shadow-2` 浮层（`--z-popover`）；项 = 勾选位（琥珀 ✓ = 生效中）+ 标签 + 右对齐 `.ed-kbd` 键帽；禁用占位项 ink-disabled 灰显可见不隐藏（需求 §39），tooltip「后续版本提供」；danger 项标签 `--danger` 色；分隔线 line-1 |
| 保存状态点 | `.ed-savestate`（`--saved/--saving/--dirty/--error`）`.ed-savestate__dot` | 6px 圆点 + 2xs 小型大写读数：已保存 `--success` / 保存中 `--accent` + 呼吸（`ed-pulse` 1s）/ 修改未保存 `--ink-3` / 保存失败 `--danger`；`role="status"` |
| 帮助弹层 | `.ed-dialog__scrim` `.ed-dialog` `.ed-dialog__head/__title/__body` `.ed-shortcuts__*` `.ed-about__*` | scrim = `--surface-0` @ 55% 透明（零新增令牌的遮罩组合）；对话框 surface-1 + line-2 + radius-3 + shadow-2；快捷键表按「全局/变换/绘制中」分组（左说明右键帽）；关于 = 产品名 + `.ed-field` 事实表（版本/技术栈等宽读数） |

上下文条增补：`.ed-contextbar__group/__end`——左段承载模式切换（`.ed-mode`）与视图按钮（`.ed-view`）自旧工具条迁入（T5.6/T5.7 收编前临时归宿），右段 `margin-left:auto` 承载区域开关。新增动效一档：`ed-pulse`（保存中状态点呼吸，1s 循环——T5.8 复核结论：保留。保存中属「进行中状态指示」而非操作反馈，Toast 体系（§5.11）面向一次性操作结果（导入/保存失败等），两者语义不重叠；`ed-pulse` 仍为 §6「不做持续动画」唯一例外）。视觉令牌零新增（全部复用 §2 色板 / §4 尺寸 / §6 动效档位）。

### 5.6 Scene Outliner：标签条 / 类型分组树 / 图层删除确认（T5.3 增补）

| 组件 | 类名 | 要点 |
|---|---|---|
| 面板标签条 | `.ed-tabs` `.ed-tabs__tab`（`--active`） | 面板体首行双标签（场景大纲 / 图层管理）：24px 标签 + hairline 底；激活 = ink-1 + 2px 琥珀下划线（正在查看的视图），未激活 ink-3；←→ 键盘切换、focus inset glow；零新令牌 |
| 大纲工具条 | `.ed-outliner__toolbar/__seek/__search/__type/__tools` | 两行紧凑工具区：搜索框（`.ed-input`）+ 类型筛选（`.ed-select`，项带计数）；第二行 展开/收起 + 右侧 创建 ▾ 与 ⋯（P1 占位禁用），按钮 20px 高 |
| 筛选「选中全部结果」（T7.5 增补） | `.ed-outliner__select-all` | 筛选/搜索激活时筛选行内出现（28×24 图标钮，lucide ListChecks 14px）：selectMany 当前过滤结果（锁定对象跳过，与行点选同源）；hover/focus-visible/禁用三态；尺寸较工具条 20px 先例略放大（触达更优，仍属紧凑工具行档） |
| 类型分组树 | `.ed-tree__group-row`（`--collapsed`）`.ed-tree__group-toggle/__caret/__group-label` | 组行 26px：▾ caret（折叠旋转 −90°）+ 类型名（小型大写，点选全组成员）+ 计数 `.ed-readout` + 组级 eye/lock；组间 hairline |
| 行动作浮显 | `.ed-tree__row > .ed-icon-toggle`（同组行） | 对象行/组行的 eye/lock 默认透明（降低视觉噪音），行 hover / `:focus-within` / 开启态（`--on`，如已隐藏/已锁定）浮显——状态可离 Hover 自读 |
| 创建对象下拉 | `.ed-outliner__create .ed-menu__popup` | 复用 `.ed-menu__popup/__item` 弹层原语（surface-1 + line-2 + shadow-2），右对齐锚定；项 = 要素类型 + 右侧 `.ed-kbd` 几何提示；展开按钮文字转琥珀（与菜单展开态同语义） |
| 图层标签工具条 | `.ed-layers__toolbar` | 层数读数 + 「＋ 新建图层」ghost 按钮（20px） |
| 图层删除 | `.ed-layer__delete` `.ed-layer__confirm/__confirm-text/__confirm-delete` `.ed-layer__row--confirming` | 行尾 × hover 浮显、hover 变 danger；两步确认 = 行内确认条（danger 文案 + danger 实底「删除」+ ghost「取消」），确认中行 surface-2 抬起——notice/Toast 通道归 App 层，T5.8 前面板内自持 |
| 图层合并（T8.3 增补） | `.ed-layer__merge-btn`（`--open`）`.ed-layer__merge/__merge-targets` | 行尾 lucide `Combine` 图标钮（hover 浮显琥珀、`::before` 扩展 ≥40px 触达、全场仅一层时禁用）→ 行内目标选择条（删除确认条同构、文案 ink-2 非 danger）：目标 = 排除源自身的真实图层 ghost 钮（名称 + 等宽 ×计数）；点选执行 `MergeLayerCommand`——成员迁移 + 删源**一条可撤销历史**（undo 复活源层快照并回迁成员）；与删除确认互斥展开；空层合并 = 等价删除 |

布局增补：左栏纵向堆叠改为「大纲（`--fill`，双标签）+ 绘制 + 网格」（场景树/图层两面板由 OutlinerPanel 收编，T5.1 骨架的 `--layers` 尺寸类退役）。视觉令牌零新增（复用 §2 色板 / §4 尺寸含 `--row-h` 26px / §6 动效档位）；弹层原语 `.ed-menu__popup/__item` 自 T5.2 主菜单条升格为通用下拉原语。

### 5.7 Inspector 三标签检查器（T5.4 增补）

| 组件 | 类名 | 要点 |
|---|---|---|
| 检查器面板 | `.ed-panel--fill`（sectionKey `right.inspector`） | 右栏单面板：`.ed-tabs` 三标签（对象属性 / 环境设置 / 全局设置，TabStrip 复用 §5.6 标签条）；标签态存 workspaceStore.inspectorTab（跨选变化保持 + 「文件→场景设置」action 跳转目标）；标题条附注 = 当前对象名 / 选中计数 |
| 折叠分组 | `.ed-inspector__group`（`--collapsed`）`__group-head/__group-caret/__group-title/__group-body` | 对象属性标签的分组结构（需求第十七章）：组头 28px 条（与 PanelFrame 标题条同高）= ▸ 展开指示（展开旋至 ▾，80ms）+ 小型大写标题 + 右侧只读附注（`m · deg` / 几何类型）；整条可点折叠，折叠态记 workspaceStore.collapsedSections（键 `inspector.<section>`，默认全展开；旧要素 Transform 置顶，T6.6 起 region 走「基础信息/几何/业务类型/表现样式 + 变换收尾」四分组序）；组间 hairline |
| 只读读数 | `.ed-input[readonly]`（沿 §5.2 既有） | 单选派生值（面积/长度/坐标/ID）与多选 Transform 读数统一为虚线边只读输入（等宽右对齐）；多选 Transform 维持只读首对象值（数值绝对量对 N 对象语义不明，成组变换归 gizmo，T7.5 裁定） |
| 多选汇总条 | `.ed-inspector__summary` `__summary-title/__summary-types/__summary-type/__summary-hint` | surface-2 抬起一块：加粗计数（已选 N 个对象）+ 类型分布行（label + 等宽 ×count；T6.6 起 region 显示「区域」）+ 批量编辑提示（「批量编辑公共属性 · 异值字段显示 Mixed，提交只写入该字段」，T7.5）；`role=status` |
| 多选批量编辑组（T7.5 增补） | `.ed-field__value--multi` `.ed-input--mixed` `.ed-inspector__mixed-tag` | 通用组（图层下拉 Mixed 占位项 / 可见·锁定组级开关）+ 同语义 region 追加组（业务类型 / 表现样式 / 基准高度）；Mixed 占位 = ink-2 斜体 placeholder（可聚焦输入新值覆盖全部对象该键）；无法内联占位的控件（开关/取色器）旁侧虚线标签（`--line-3` 虚线 1px + ink-3 2xs）；批量字段值列 `--multi` 右对齐 flex；预设网格 Mixed 态无高亮项；一切批量经 BatchCommand 一条历史 |
| 多选语义分节（T8.3 增补） | `.ed-inspector__group`（id `multi-region-<semanticType>`） | 全 region 异类型多选按 semantic.type 分节：节头 = 语义定义 label + 等宽 `×N` 计数（「建筑 ×2」）；节内 = T7.5 业务类型/表现样式/基准高度三组同构合并，一切批量命令作用域 = 节内对象集（逐节提交互不误伤、各一条历史）；节序 = 类型在选中集首次出现序；折叠键沿 `inspector.<id>` 记账；纯同类型退化为单节（T7.5 行为等价只多节头）；region+model 混选不出节（通用组仍对全量选中生效）；视觉零新增 |
| 空态图标 | `.ed-inspector__empty-glyph` | 等宽字符 ⌖ 22px 熄灭档（选择意向），配 `.ed-empty` 引导文案（需求 15.2：无系统设置混入）；字符方案，不引图标库（lucide 归 T5.6） |
| 禁用占位行 | `.ed-input:disabled` | 无数据源字段（不透明度对象级 / 投射阴影 / 碰撞 / 标注 / 操作偏好 / 编辑器行为）：灰显可见不隐藏（需求 §39），placeholder「后续版本提供」；有数据源的字段（样式参数已含透明度时）不重复占位 |
| 预设缩略图网格（T6.6 增补） | `.ed-preset-grid` `__item(--active)` `__thumb` `__swatch` `__name` | region 表现样式组：`repeat(auto-fill, minmax(76px, 1fr))` 瓦片网格（`role=radiogroup`）——`meta.thumbnail` data-URI SVG 缩略图 4:3，缺省色块 = defaultParams 的 color 默认值 + 底部名称（溢出省略）；选中 = 琥珀描边 + soft 底（正在使用），点按瞬时琥珀（沿快选条主动作先例）；min-height 44px 触达；视觉令牌零新增 |

布局增补：右栏 = InspectorPanel 单面板（属性 + 环境 + 网格三面板收编，`--environment` 尺寸类退役）；左栏纵向堆叠改为「大纲 + 绘制」（网格设置迁入 Inspector「全局设置」标签）。视觉令牌零新增（复用 §2 色板 / §4 尺寸（组头 28px 与面板标题条同构）/ §6 动效档位）；「全局设置」标签内分组用静态 `.ed-section`（不折叠——折叠分组是对象属性的审查结构，设置项浅平直达）。

### 5.8 Content Browser 底部内容浏览器（T5.5 增补）

| 组件 | 类名 | 要点 |
|---|---|---|
| 双态容器 | `.ed-browser`（`--expanded`） | 紧凑 60px 单行工具条（标题 + 计数读数 + 分类芯片行横向滚动 + 搜索框 + 双态钮 ▼/▲ + ×）↔ 展开 280px = 顶行 + 左分类纵栏 148px + 右资产网格；点芯片 = 选分类并展开，紧凑态输入搜索词自动展开；高度过渡复用 `.ed-app` grid-template-rows `--dur-2`（`body.ed-dragging` 禁用 / `prefers-reduced-motion` 降级已有） |
| 分类芯片/纵栏 | `.ed-chip`（§5.2 既有）/ `.ed-browser__rail-item` | 纵栏 26px 行高 + 等宽计数，当前分类 = 琥珀左线 + soft 底（与大纲树行同语义）；分类哨兵 'all' / '__favorites__' |
| 标签/排序工具行（T8.3 增补） | `.ed-browser__tags` `__chips/__sort` | 展开态顶行下第二行：manifest tags 聚合去重芯片（`.ed-chip` 复用 + 等宽计数，点击切换筛选、再点清除；与分类/搜索 AND 叠加；空 tags 清单显「清单未含标签」读数）+ 排序下拉（`.ed-select`：默认（现状序）/ 名称 / 分类——分类按首现序归组、组内稳定）；筛选与排序均面板会话态 useState 不入持久化；紧凑态整行不渲染（零回归）。名称排序 = Unicode 码点字典序（刻意不用 `localeCompare`——node small-icu 无中文整理数据静默退化，跨环境序不一致） |
| 资产卡片 | `.ed-card` `__main/__thumb/__name/__cat/__cat-dot/__star` | 网格 auto-fill `minmax(150px,1fr)`；卡片 = 缩略图（懒加载真实快照 / 首字符占位）+ 名称 + 分类色标（`categoryMarkColor`：slug 确定性哈希 → HSL，**数据编码色而非 UI 强调色**，不违反琥珀唯一性）+ 收藏星标（localStorage 沿用）；`draggable` grab/grabbing 光标；正在放置卡片琥珀边 + soft 底沿用 |
| 拖放落点高亮 | `.ed-viewport--drop-target` | dragover 时 `::after` 2px `--accent-line` 描边 + `inset 0 0 24px` `--accent-soft` 内光，pointer-events:none（瞬时态琥珀语义）；dragleave/drop 移除 |
| 退役登记 | `.ed-lib__*`、`.ed-asset-group*` | AssetLibraryPanel 收编退役；`--browser-h-compact/--expanded` 令牌已在 tokens.css，零新增 |

### 5.9 垂直工具条 / Context Toolbar / Tooltip / 工作模式（T5.6 增补）

| 组件 | 类名 | 要点 |
|---|---|---|
| 垂直工具条 | `.ed-vtool` `.ed-vtool__items` `.ed-vtool__btn`（`--active`） | 48px 常驻列（`--vtool-w`）六绘制入口：40×40 图标按钮（≥40px 触达）+ 自绘园区图标 24px；激活 = 琥珀左缘 2px 竖线（`::before` 贴列左缘）+ `--accent-soft` 底 + 琥珀字；再次点击同项退出（共享入口 `tools.cancel` → 订阅自动回 select）；数据源 `tools/toolIA.VERTICAL_TOOLS`（键 1–6 同源数字快捷键） |
| 上下文工具条 | `.ed-ctx` `.ed-ctx__group/__btn`（`--active`）`.ed-ctx__toggle`（`--on`） | Context Toolbar 三段式：左段 QWER 图标+键帽钮（激活 = soft 底 + 琥珀字，键盘 W/E/R/Q 与点击经共享入口同路，`store.gizmoMode` 记账保证三钮与最后激活模式一致）｜吸附/网格 toggle（`aria-pressed`；吸附发 `tool.snap`、网格发 `view.grid` actionId——网格不配快捷键，G 已归吸附语义）｜绘制中段 `.ed-ctx__draw`：要素切换器（同几何类已注册要素，`.ed-chip` 复用）+ 几何切换（仅多几何要素）+ 完成提示 `.ed-ctx__draw-hint` + 退出钮 `.ed-ctx__exit`（`tools.cancel`） |
| 模式徽标 | `.ed-ctx__mode-badge` | 琥珀描边（`--accent-line`）1px 芯片 + 小型大写字距：当前派生工作模式名（`deriveMode(activeToolId, drawTarget)`；T5.7 HUD 消费同一数据源） |
| 模式选择器 | `.ed-ctx__mode` `.ed-ctx__mode-btn`（`--open`） | `Scene ▾` 按钮 + `.ed-menu__popup/__item` 通用下拉原语：八模式清单、当前位琥珀 ✓、P0 仅 scene 可手选（`aria-disabled` 灰显可见 + tooltip「后续版本/由绘制派生」） |
| 提示浮层 | `.ed-tooltip__host`（`--right/--bottom/--left/--top`）`.ed-tooltip` | 轻量 tooltip：hover/键盘 focus 触发、出现延迟 ≤300ms（组件定时器 250ms）+ 160ms 淡入、离开即隐；内容 = 名称 + `.ed-kbd` 键帽 + 一句提示；`role=tooltip` + 子元素 `aria-describedby` 注入（读屏可播报）；纯 CSS 贴靠定位不引第三方库 |

布局增补：上下文条左段由 ContextToolbar 占据（`flex:1`，右段 `margin-left:auto` 承载徽标+选择器），视图按钮与区域开关保持其后（T5.7 收编 HUD 前临时归宿）；左栏纵向堆叠只剩大纲（DrawPanel 退役，见 §5.3 退役登记）。视觉令牌零新增（复用 §2 色板 / §4 尺寸 / §6 动效档位）；新增动效一档 `ed-tooltip-in`（160ms 淡入，归入 §6 微交互）。

### 5.10 视口四角 HUD 与状态栏指标（T5.7 增补）

| 组件 | 类名 | 要点 |
|---|---|---|
| HUD 角位容器 | `.ed-hud`（`--tl/--tr/--br`） | 绝对定位于视口容器四角（左上/右上/右下；左下 = 坐标轴指示器 canvas），`pointer-events:none` 透穿不遮挡中心；可交互容器 `.ed-hud__menu` 单独放开 |
| HUD 芯片 | `.ed-hud__chip`（`--name`） | 沿 T1.8 既有芯片（surface-1 86% + blur 6px + line-2 边）：左上三枚 = 模式徽标（`ed-hud__dot` 琥珀点 + toolIA deriveMode/MODES 派生，与 ContextToolbar 徽标同数据源）· 机位（首字母大写英文）· 场景名（超长省略） |
| HUD 控制钮 | `.ed-hud__btn`（`--open`）`.ed-hud__btn-label` | 芯片同构的可点按钮：hover surface-3、展开态琥珀字 + accent-line 边（与菜单展开态同语义）；下拉弹层复用 `.ed-menu__popup/__item` 通用原语（`.ed-hud--tr` 内右缘向下展开、紧凑 128px 最小宽） |
| 视角/渲染下拉 | `.ed-hud__menu` | Perspective ▼（四机位单选 → CameraPort.setMode，不抢工具）与 Shaded ▼（六渲染模式常规/诊断两组 → 环境通道 `environment.renderMode`，与主菜单「视图」checked 同源；T8.4 分组与角标详见 §5.19）；齿轮 Viewport Options：网格 toggle（setGrid）/ 坐标轴 toggle（`environment.axes.visible`）/ 小地图 toggle（T7.7 转正，`workspaceStore.minimapVisible`，与主菜单「视图→小地图」同源） |
| 小地图画布 | `.ed-viewport__minimap` | runtime MinimapRenderer 自建 200×140 canvas（类名 = runtime↔ui 唯一约定，沿 `.ed-viewport__axes` 先例）绝对定位右下角、`pointer-events:auto` + `cursor:pointer`（拖拽/点击平移视角，`touch-action:none`）；弱存在感 = surface-1 72% 半透明 + line-2 细边 + blur(6px)（HUD 芯片同语言）；轮廓为低饱和制图色带（十类语义数据编码色 + 模型中性色，色值单一真相源 = runtime MinimapRenderer `SEMANTIC_MINIMAP_COLORS`，§2 视口内容豁免条目），视野四边形/朝向线琥珀（0xe8a33d = `--accent`，§5.12 runtime WebGL 色值对照先例）；开关 = 齿轮 Viewport Options「小地图」与主菜单「视图→小地图」两路同源（`workspaceStore.minimapVisible`，随 t3d-editor.workspace 快照持久化，缺省显示） |
| 轴指示器画布 | `.ed-viewport__axes` | runtime AxesIndicator 自建 88×88 canvas（类名 = runtime↔ui 唯一约定）绝对定位左下角、`pointer-events:none`；视口内 3D 内容不受 UI 色板约束（§2 既有条目）：X 红 / Y 绿 / Z 蓝行业惯例 |
| 状态栏右段 | `.ed-statusbar__metrics` | Objects（sceneVersion 派生）· Triangles（K/M 缩写）· FPS（1Hz 轮询 EditorHandle.getViewportStats）· Unit: m——复用 `.ed-statusbar__segment` 读数原语 |
| 状态栏游标 | `.ed-statusbar__segment`（X/Y/Z 三对 label+value） | 游标地面坐标定宽两位小数（等宽 tabular，改值不抖动；Y 为地面恒 0.00），离开画布显示 —；与绘制读数（drawStatus，吸附/锁定后落点）并存于左段 |
| 退役登记 | `.ed-view`（机位四钮） | 透视/顶/前/侧四颗机位按钮随 HUD Perspective ▼ 退役（样式类保留）；`.ed-view__btn` 继续承载聚焦 F / 全景 Home 两颗动作钮（上下文条「视图」组）；`.ed-hud--br` 右下占位按钮随小地图转正移除（右下角改由 runtime canvas 承载，样式类保留） |

布局增补：HUD 四角绝对定位不占布局轨道；状态栏左段（绘制读数 + 游标）·中段（指标）·右段（快捷键提示）三段横排。视觉令牌零新增（全部复用 §2 色板 / §3 等宽读数 / §4 尺寸 / §5.9 下拉原语）。

### 5.11 右键上下文菜单与 Toast 反馈（T5.8 增补）

| 组件 | 类名 | 要点 |
|---|---|---|
| 上下文菜单弹层 | `.ed-context__popup`（复用 `.ed-menu__popup/__item/__sep/__check/__kbd` 原语） | 右键点按（<4px 无拖拽，app 层 classifyRightButton 分类）打开：fixed 定位于 client 坐标，越界翻转/收边（组件测量 innerWidth/Height，8px 边距）；四类目标（视口对象/视口空白/大纲行/资产卡片，模型见 `ui/menus/contextMenus.buildContextMenu` 纯函数）；动作复用主菜单 actionId 路由（edit.*/view.*）+ ctx.* 上下文动作 |
| 子菜单 | `.ed-context__sub` `.ed-context__expand` | 移动至图层/创建对象/视角/渲染模式 ▸：父项右侧展开，右缘越界翻到左侧；hover 与 → 键展开、← 收起；▸ 指示 ink-3 |
| 菜单交互 | — | `role="menu"`/`menuitem(checkbox)`、aria-haspopup/aria-disabled；↑↓ 循环、Enter/Space 触发、Esc 关闭（preventDefault 不外溢到全局 ESC 退出手势）、Tab 关闭、点击外部关闭；danger 项 `--danger` 着色（复用 §5.5 原语）；禁用项灰显可见（需求 §39） |
| Toast 浮层 | `.ed-toasts` `.ed-toast`（`--error`）`.ed-toast__text` `.ed-toast__close` | 右下角固定列（`--z-toast`，状态栏上方 12px）：surface-1 + line-2 边 + 左缘 2px 状态线（info = 琥珀 / error = `--danger`，沿 .ed-notice 先例语义）+ shadow-2；TTL 4.5s 自动消失、上限 3 条（超出挤掉最旧）、× 手动关闭；容器 `aria-live="polite"` + 条目 `role="status"`、不抢焦点（无 focus 调用）；条目 `ed-rise` 160ms 入场 |
| 退役登记 | `.ed-notice` `.ed-notice--error` | 顶部提示条随 Toast 体系退役（T5.2 曾承接）；`--z-toast` 令牌 tokens.css 既有（本任务前已登记），零新增令牌 |

手势语义增补（UE/Unity 行业惯例，破坏性交互变更）：左键=选择/确认（工具层）、右拖=旋转、中拖=平移、滚轮=缩放、右键点按=上下文菜单、Esc=唯一退出手势（原右键退出迁移，README 操作指南同步）。视觉令牌零新增（复用 §2 色板 / §4 尺寸 / §5.5 弹层原语 / §6 ed-rise 档位）。

### 5.12 顶点编辑：视口句柄 / 面板激活态 / 上下文中段（T6.8 增补）

| 组件 | 类名/载体 | 要点 |
|---|---|---|
| 视口顶点句柄 | runtime 画布内 `VertexEditImpl` 句柄网格（AUX_LAYER 独立组，不入内容组/RuntimeObjectMap） | 顶点=琥珀球（直径屏幕恒定 13px；常态 `#e8a33d` = `--accent`、hover `#f2b654` = `--accent-hover`、drag `#ffe3ad`）、边中点=半透明八面体（9px；常态 0.55 / hover 0.9 透明度）；depthTest=false + renderOrder 999/1000（恒在最上不被对象遮挡）；屏幕恒定尺寸按相机距离逐帧自适应（`Renderer.renderFrame → vertexEdit.frame()`，沿 TransformControls 语义，无会话 O(1) 早退）；光标反馈 hover=move / 边中点=copy |
| Inspector「编辑顶点」按钮 | `.ed-btn--ghost` + `.ed-btn--ghost-active` | 编辑会话激活态：`--accent-soft` 底 + `--accent-line` 描边 + `--accent` 字（「正在被操作」语义与视口句柄配色同源）；按钮文案双态（编辑顶点 ⇄ 退出编辑）、`aria-pressed` 记账、title 提示完整手势清单 |
| Context Toolbar 编辑态中段 | `.ed-ctx__draw`（复用绘制态原语）+ `.ed-ctx__draw-hint` + `.ed-ctx__exit` | vertex-edit 激活时中段提示「拖动顶点 · Alt+点击边中点插入 · 右键或 Delete 删除 · G 网格 / A 45° · Esc 退出」（T8.1 增 A 键）+ 退出钮（`tools.cancel`，与 Esc 同路）；与绘制中段互斥（contextToolsFor 纯函数分支） |
| 拖拽对齐参考线（T8.1 增补） | runtime 画布内 `AlignGuides` 恒驻组（AUX_LAYER 独立组、Line/Sprite 池化复用不逐帧新建） | **视觉三数值单一对照源**：线宽 1px 等效（LineBasicMaterial 原生栅格线宽，不设 linewidth，Figma 红线 1px 先例）+ 端点 4px 方形标记（Sprite 屏幕恒定尺寸，`GUIDE_ENDPOINT_PX=4`，帧内按相机距离自适应，沿顶点句柄先例）+ 颜色 `0xe8a33d` = `--accent`（琥珀=「正在被操作」，与 TransformControls 轴色、足迹幽灵蓝 0x4ec9ff 三方可区分）；透明度 0.9、depthTest=false + renderOrder 1001（恒在最上）、离地 0.25m（与绘制预览/足迹幽灵统一层高）；仅 translate 拖拽会话期间呈现、松手即逝（整组 visible 开关），不产生对象不入历史；线段端点范围 = 拖拽框与来源框沿参考线延伸轴的范围并集（子代理提案，主代理裁定）；每轴至多一条命中线（边缘 `kind=edge` / 中心线 `kind=center`，视觉同色不区分） |

视口句柄为 WebGL 内绘制（THREE MeshBasicMaterial 色值与 tokens.css `--accent` 系对应，纯 runtime 侧无 CSS 变量通路——对应关系在此登记为单一对照源）。CSS 侧视觉令牌零新增（`--accent-soft`/`--accent-line`/`--accent-hover` 均为 tokens.css 既有）。

### 5.13 显式工作模式体系与上下文工具矩阵（T7.1 增补；§5.9 模式徽标/选择器两行由本节取代；矩阵占位项 T7.6 转正——现分支见 §5.16）

| 组件 | 类名/载体 | 要点 |
|---|---|---|
| 模式徽标（ContextToolbar / HUD 同源） | `.ed-ctx__mode-badge` `.ed-hud__chip--mode`（`--mode-dot` 圆点） | 显示模式 = `combineMode(workspaceStore.mode ⊕ 工具派生)`（toolIA 纯函数）：显式模式全名 + 模式专属色圆点/描边/文字（`--mode-accent` 内联注入，见 §2）；绘制/放置激活期间临时切派生态（面→terrain、line→road、point→annotation、placement→decoration），退出恢复；HUD 徽标下方一行 `hudHint` 操作引导（`.ed-hud__mode-hint`，`--ink-3` 小字）——场景内渲染零改动（门 Q3b） |
| 模式选择器 | `.ed-ctx__mode` + `.ed-menu__popup/__item` | `Scene ▾` 八模式清单（呈现序 = 需求 24 章表序 = Alt+1..6 键序）：六启用可手选（`menuitemradio` + ✓ 当前位）、measure/analysis `aria-disabled` 灰显 + tooltip 排除项提示；切换经 `activateWorkMode` 三路同源（选择器 / Alt+数字 / 视图菜单 `view.mode-*`），激活绘制/放置工具时先 cancel（ESC 同路零 Command） |
| 视图菜单子菜单 | `.ed-menu__item--parent` `.ed-menu__sub` | 「视图 → 工作模式」八项子菜单（T7.1 首个子菜单原语）：父项 ▸ caret + hover/→ 展开、Esc/← 收起回焦；子项 shortcut 键帽 `Alt 1..6`（7/8 预留不显示）；`collectActionIds` 子项展开收录 |
| 中段互斥优先级 | `.ed-ctx__draw` ＞ vertexEdit ＞ road-split ＞ `.ed-ctx__actions` ＞ RegionQuickApply ＞ `.ed-ctx__guide` | 绘制态 ＞ 顶点编辑指引 ＞ 道路分割指引（T7.6）＞ 上下文工具矩阵 ＞ 三步流快选（unclassified 单选）＞ 模式引导芯片（无选中：模式名 · 一行 hudHint，专属色圆点） |
| 上下文工具矩阵 | `.ed-ctx__actions` `.ed-ctx__btn` | `contextActionsFor(selection, activeToolId)` 纯函数数据表（toolIA SEMANTIC_MATRIX 注册制）：单选 building → 复制/轮廓编辑/楼层步进/阵列；单选 road line → 复制/节点编辑/宽度步进/分割/阵列；其他单选 → 复制/阵列；多选 → 对齐/阵列/合并（恰 2 条相邻道路，T7.6 转正——各控件见 §5.16）。复制走 `edit.duplicate`（Ctrl+D 同一路由） |
| 步进器 | `.ed-ctx__stepper`（`__btn/__value/__unit`） | 内联小组件：标签 + −/+ 钮 + 等宽 tabular 读数（`--stepper-w` 按位数定宽防抖）+ 单位；每次步进经 `ChangeSemanticCommand` 写 semantic.properties（一条历史可撤销）；长按 350ms 进入连续档（130ms/步，pointerup/leave/卸载三路清）；min/max 按语义定义参数截断（floors≥1、width≥0），读数低于下界不反向抬升仅在原值上步进 |
| 垂直条「更多」抽屉 | `.ed-vtool__drawer`（`__btn` 40×28 文字钮 + `__drawer-menu`） | T7.1 联动 3：显示模式 `verticalGroup` 组内置顶常驻，其余绘制/资产入口折叠进「更多」（Ellipsis 图标 + 文字）；抽屉内点击可正常激活工具（可达性——门 Q3a）；scene 模式全部展开无抽屉；数字键 1–4 随时直达（tooltip 注明） |
| Inspector 空态引导卡 | `.ed-guide`（`__head/__dot/__title/__desc/__quick`） | 无选中时「对象属性」标签空态主体：显示模式的 `inspectorGuide` 元数据（标题圆点专属色 / 一到两句模式说明 / 快速开始引导条），随模式切换更新；卡下保留既有选择提示（`.ed-guide__empty-hint`）；数据驱动纯展示（toolIA.MODES 单一真相源） |

布局增补：六枚 `--mode-*` 专属色令牌为本节唯一新增（登记见 §2，规则同步增补）；其余复用 §5.9 下拉原语 / §5.12 ghost 激活态语义。交互边界：模式为「工作域焦点」非权限闸门（门 Q2——全部工具任何模式可用、不禁用），三步流（画形状→自由赋类型）不变；`workspaceStore.mode` 随工作区快照持久化（T7.3 落地，见 §5.14）。

### 5.14 工作区布局弹层（T7.3 增补）

| 组件 | 类名/载体 | 要点 |
|---|---|---|
| 布局弹层 | `.ed-layout__popup`（复用 `.ed-menu__popup` 原语 + `__item/__sep/__check`） | 顶栏右侧「布局」按钮（`.ed-layout__btn--open` 展开态琥珀字）下拉三段：预设 / 个人布局 / 动作；右缘锚定 264px；`role=dialog`（含 radiogroup 与命名输入，不用 menu 角色）；Esc/点击外部关闭回焦 |
| 预设组 | `.ed-layout__title` `.ed-layout__preset--current` `.ed-layout__custom` `.ed-layout__meta` | 四预设 radio（`matchPreset` 命中 = accent-soft 底 + 琥珀 ✓；未命中显「当前为自定义布局」）；行尾 `.ed-layout__meta` 等宽 tabular 三区尺寸读数；↑↓ 循环聚焦 |
| 个人布局行 | `.ed-layout__item/__apply/__name/__delete/__empty` | 行 = 应用钮（hover surface-3）+ hover 浮显 × 删除（danger，沿 `.ed-layer__delete` 先例）；空列表友好占位 |
| 保存命名卡 | `.ed-layout__save/__save-input/__save-actions/__hint` | surface-2 抬起行内卡（与图层确认条同构）：`.ed-input` 命名 + 主钮「保存」（空名禁用）/ ghost「取消」+ `role=status` 反馈（空名提示 / 重名「将覆盖」） |
| 行尾图标钮（T8.3 增补） | `.ed-layout__iconbtn` | 个人布局行尾 lucide `Pencil` 重命名 / `Download` 导出（hover 浮显、`::before` inset -11px 扩展 ≥40px 触达——沿 §5.17 `__rowbtn` 规范）；导出 = name + 布局字段 JSON 文件下载（`serializeLayoutExport` sanitize 规整 + pretty 2 空格，文件名 `t3d-layout-<名>.json`） |
| 行内重命名卡（T8.3 增补） | `.ed-layout__rename`（保存命名卡同构复用） | 空名/撞名禁用保存 + `role=status` 三态提示（请输入名称 / 同名已存在 / 改名后条目顺序保持）；Enter 提交 / Esc 取消沿命名卡手势；改名保序（按原键序重写整表，不挪条目到末尾） |
| 导入布局（T8.3 增补） | `.ed-layout__action` + 隐藏 `.ed-layout__file-input` | 动作区「导入布局…」（`Upload` 图标）触发隐藏 file input（accept JSON，同文件可重复选择）：`parseLayoutImport` 双层语义——结构非法（坏 JSON/非对象/缺 name/layout）整体拒收 Toast；字段级非法沿 sanitize 回退；成功存入个人布局表 + Toast 提示；导出→删→导入→应用往返无损（node 测试锁定） |

布局增补：视觉令牌零新增（复用 §2 色板 / §4 尺寸 / §6 动效 / §5.5 弹层原语）；「恢复默认」= default 预设 + 显式模式 scene（T7.3 门裁定）；布局与 mode 随 `t3d-editor.workspace` 快照持久化（订阅防抖 300ms，App mount 恢复，StrictMode 双挂载幂等）。

### 5.15 纯三维工作模式（T7.4 增补）

| 组件 | 类名/载体 | 要点 |
|---|---|---|
| 根修饰类 | `.ed-app--pure3d`（挂 `.ed-app` 根） | `workspaceStore.pure3d`（工作态，不随快照持久化、applyLayout/resetLayout 不触碰）为 true 时 App 装配层挂类：面板区三 `--zone-*` 变量与 hiddenPanels 条件合并归零，`--vtool-w/--contextbar-h/--statusbar-h` 三 token 仅此时内联覆写 0px（非常驻覆写，React 对 undefined 自定义属性键跳过）；布局字段从不被 pure3d 修改 → 退出精确还原免费成立。进入/退出沿 `.ed-app` 既有 `--dur-2`(160ms) 网格轨道过渡（≤200ms 验收线）；类规则对 `.ed-vtool/.ed-contextbar/.ed-statusbar` 补 `overflow:hidden` + `border:0`（.ed-side 已有 overflow；border 归零防 0px 槽内 1px 分隔线残留） |
| 保留面 | MenuBar + ViewportHUD + Toasts/ContextMenu 浮层 | 「极简顶部工具」口径 = 顶栏菜单条（保存状态点/撤销重做/七菜单/布局弹层——观察·演示场景的保存入口）；视口全幅 + HUD 全套（模式徽标/机位/场景名 + 引导行、右上控制排、坐标轴）照常；隐藏 ContextToolbar 行 / 垂直工具条 / 左右底三面板区 / 状态栏 |
| 底部居中提示芯片 | `.ed-hud--bc` + `.ed-hud__chip` | HUD 第五角位（bottom + left:50% + translateX(-50%)，pointer-events:none），仅 pure3d 渲染：一行基础操作速查「Tab 退出纯三维 · 左键选择 · 右键旋转 · 中键平移 · 滚轮缩放 · W/E/R 变换」；芯片视觉复用 `.ed-hud__chip` 既有语言（surface-1 半透明 + blur + line-2 描边） |
| 切换入口 | `toolIA.togglePure3d`（Tab 键 / 视图菜单 `view.pure3d` 三路同源） | 进入时激活 draw-* / placement / vertex-edit 工具先 `tools.cancel()`（ESC 同路零 Command，防隐形状态；vertex-edit 为 T7.4 扩裁）+ 关闭右键菜单浮层；退出只翻位不动工具。input.ts Tab 分支：裸 Tab 才路由（Shift/Ctrl/Alt 叠加让位浏览器组合）、`preventDefault` 阻断焦点遍历、文本输入焦点经 isEditableTarget 豁免；MenuBar 两处与 ContextMenu 的 `case 'Tab'` 补 `stopPropagation`（菜单开着时 Tab 只关菜单不切模式） |

布局增补：视觉令牌零新增（复用 §2 色板 / §4 尺寸 / §6 既有网格过渡）；已知可接受边界——pure3d 下 view.panel-* 仍改 hiddenPanels（退出后生效，不拦截）、帮助弹层开着时 Tab 仍走全局切换（T7.8 GUI 验收裁决）。

### 5.16 对齐 / 阵列 / 道路几何工具与对象吸附（T7.6 增补；§5.13 矩阵占位行由本节取代）

| 组件 | 类名/载体 | 要点 |
|---|---|---|
| 对齐弹层 | `.ed-ctx__action-menu` + `.ed-menu__popup.ed-ctx__align-popup` | 多选（≥2）矩阵「对齐」钮展开八菜单项（X/Z 最小·居中·最大 + X/Z 均布，lucide `Align*`/`*DistributeCenter` 图标），外点关闭、Esc 关层（stopPropagation 防全局退出）；均布 <3 对象 `aria-disabled` 可见；hover/focus 菜单项 → 足迹幽灵预览全体目标位置（移开清除、✓ 位随 previewMode）；点击执行 N 条 TransformCommand 经 BatchCommand 一条历史（均布 = Figma 等间距语义：两端不动、中间等缘距） |
| 阵列 popover | `.ed-ctx__array-popover`（`__field/__field-label/__field-value/__dir-grid/__dir-chip/__array-foot`） | 单选/多选「阵列」钮展开 `role=dialog` 参数卡（240px）：数量 stepper（1..99，副本数不含原件）+ 间距输入（0.1..1000m，失焦钳制回写）+ 8 方向芯片（东=+X、北=−Z，4×2 网格 `aria-pressed`）+ 底部「N × M m · 方向」读数与确认/取消；参数变化实时足迹预览副本集；确认 = N 条 CreateObjectCommand 一条历史 + 选中副本集（副本一次规划 id 同源——`planArrayExecution`，防二次规划 id 漂移）；Esc/外点取消清预览零命令 |
| 道路分割态中段 | `.ed-ctx__draw`（RoadSplitSection，VertexEditSection 同构复用） | 单选 road line 矩阵「分割」钮激活 road-split 工具：复用 §5.12 顶点句柄层显示节点（`beginSession closed:false` 会话 + `onDragEnd` 置空中性化陈旧回调）；点击世界坐标最近内部顶点（index 1..n−2，容差 1.5m，局部点 + live position 偏移——被移动过的道路同样命中）→ SplitRoadCommand 单命令单历史（前段留原对象、后段新建 `${原名} 2`，语义/样式/图层/变换保留）→ 回选择工具并 selectMany 两段；无候选点击 Toast 提示；Esc 零命令退出 |
| 合并钮 | `.ed-ctx__btn`（`Merge` 图标） | visible-when-applicable：恰选 2 条端点相邻（距离 ≤0.5m，世界坐标 = points + position 判定，domain `detectRoadAdjacency` 单一真相源）road line 时出现在多选矩阵；四邻接情形拼接（end-start / end-end / start-start / start-end，丢弃第二段共享端点），结果写入前者（id/名称/图层/语义/样式保留）——MergeRoadCommand 单命令单历史，执行后选中合并结果 |
| 足迹幽灵预览 | PreviewManager `__footprints__` 子组（0x4ec9ff 线框 + 18% 轻填充，共享绘制预览材质） | 对齐/阵列目标位置半透明足迹框（model 编辑层无足迹 → 2×2 占位，与 ghost placeholder 2,2,2 先例一致）；默认抬升 0.25 与绘制预览同层高；整组替换、几何即用即释放；不入 Scene 数据/历史/拾取；UI 经 store.footprintGhost 消费（`FootprintGhostPort` 可选扩展 Port，RectPickPort T2.4 先例，未注入 no-op） |
| 设置「吸附」组 | `.ed-section`（GridSection 同构草稿提交惯例） | 全局设置标签新增三字段：网格吸附开关（`tool.snap` 同源路由——同时管辖绘制落点与移动工具步长）+ 对象吸附开关 + 吸附容差（0.05..5m step 0.05，失焦/回车提交）；读写共享可变对象（DrawGridConfig / ObjectSnapConfig，组合根一份注入）即时生效，会话级偏好不入历史不随场景保存 |

布局增补：视觉令牌零新增（复用 §2 色板 / §5.5 弹层原语 / §5.9 stepper·chip·btn 原语）。对象吸附为 gizmo translate 专属增强（rotate/scale 不吸附）：XZ 两轴独立边对齐、两轴同命中即面对齐，候选 = 其余可见对象足迹四边（排除拖拽目标与不可见/隐藏图层对象），容差默认 0.5m，命中时覆盖网格吸附（`TransformControls.setTranslationSnap` 同款幂等修正模式）；网格吸附经 translationSnap = drawGrid.spacing 与绘制同源。§5.13 矩阵行「占位」表述自此由本节取代（ContextPlaceholderItem 类型已随 T7.6 删除）。

### 5.17 场景模板与批量导入弹层（T8.2 增补）

| 组件 | 类名/载体 | 要点 |
|---|---|---|
| 弹层族外壳 | `.ed-scenedlg__*`（`DialogShell`，`.ed-dialog` 原语） | 四弹层共用（新建确认/模板命名/模板管理/导入预览）：scrim + 标题栏 + 关闭钮；Esc 关闭且 stopPropagation 不外溢全局退出手势；`__lead` 引导语（ink-2）+ `__summary` surface-2 摘要卡（`.ed-field` 标签左值右 + `ed-readout` 等宽）+ `__actions` 右对齐取消/主钮 + `__section-title` 小型大写分区（沿 `.ed-layout__title` 语言）；同一时刻至多一个弹层（app `useSceneDialogs` 受控开关，Promise 型依赖注入 actions） |
| 新建确认 | `ConfirmSceneReplaceDialog` | 「新建场景 ▾」实例化前 dirty 确认（口径沿 beforeunload：dirty/error 才弹，非 dirty 直通零弹层）；三行摘要 = 模板 / 来源（内置 · 个人）/ 规模（N 对象 · M 图层）；初始焦点在「取消」——破坏性操作安全默认（区别于 HelpOverlay 的关闭钮焦点） |
| 命名弹层 | `TemplateNamingDialog`（`__input/__hint`） | 「另存为模板…」：空名禁用保存、重名提示「将覆盖」（LayoutMenu 命名卡语言在 dialog 语境复用）、Enter 提交 / Esc 取消 |
| 模板清单行 | `.ed-tpl__list/__item/__name/__meta/--builtin/__builtin-tag/__rowbtn(--danger)` | 管理弹层行 = 名称 + 等宽「N 对象 · M 图层」meta + 行尾图标钮（lucide `Pencil`/`Trash2`，aria 标注）；`--builtin` 灰显只读 + line-2 描边「内置」标签；`__rowbtn` 视觉 24px、`::before` inset -8px 扩展 ≥40px 触达（图标按钮触达先例的规范化写法）；重命名 = 行内输入 + 保存/取消（Enter/Esc），改名撞名即禁用保存；删除无二次确认（沿 LayoutMenu 先例） |
| 导入预览行 | `.ed-import__list/__row/__icon(--ok/--warn/--fail)/__name/__desc/--failed` + `__summary` | 批量导入三态行，控件形态对齐 Ant Design Upload file list 惯例（零新依赖）：状态图标（`CheckCircle2`/`FileWarning`/`FileX`，success/accent/danger 着色）+ 文件名（溢出省略 title 保底）+ 状态描述（等宽计数）；文件级失败行整体 ink-disabled 置灰不阻断其余；汇总行 role=status 三计数；合计 0 对象 → 确认禁用 + title 说明 |
| 新建场景子菜单 | `MenuSubmenuDef`（`file.new`，MenuBar `SubmenuRow`） | 四区 separator 分区（空场景 / 内置模板 / 用户模板 / 管理入口），无 header 行；用户区空时 disabled 占位行「暂无用户模板——…」（可见不隐藏惯例）；`items` 自 T8.2 放宽 `MenuEntry[]`——separator 不聚焦不占键盘索引（↑↓ 只在可点项间循环） |

布局增补：视觉令牌零新增（复用 §2 色板 / §5.5 dialog 原语 / `.ed-field`·`ed-readout`·`.ed-btn` 既有件）。模板数据流：ui 不碰 io——菜单清单经 `MenuState.templates` 注入、弹层 CRUD 经 App 中转 `io/templates`（localStorage 键 `t3d-editor.templates`，容量 20 套 / 约 1MB 拒存提示清理）；实例化 = `regenerateSceneIds` 深拷贝全量 id 重生成（模板只读、实例全新）。导入语义零新解析逻辑（JsonImporter v2 既有宽限口径，告警 = errors 既有产出）。

### 5.18 批量重命名弹层（T8.3 增补）

| 组件 | 类名/载体 | 要点 |
|---|---|---|
| 弹层 | `.ed-batch-rename__*`（`.ed-dialog`/`.ed-dialog__scrim` 原语） | 多选右键「批量重命名…」（viewport-object 与 outliner-row 两清单 `ctx.batch-rename`，`hasSelection` 门控——actionId 契约快照同步）打开：scrim 点击 / Esc 关闭（stopPropagation 不外溢全局退出手势）、选中集清空自动关闭；标题 =「批量重命名 · N 个对象」 |
| 模式切换 | `__modes/__mode`（`.ed-chip` 复用，`role=tablist/tab`） | 「前缀 + 序号」/「查找替换」单选互斥（Blender Ctrl+F2 / UE Advanced Rename 双先例），共享同一实时预览路径 |
| 参数表单 | `__form`（`.ed-field` 复用） | prefix 模式：前缀（可空 = 纯序号）/ 起始序号 / 步长（≤0 禁用确认——防全部同名）/ 序号位数 1–3 位 padStart 填充；replace 模式：查找（空串禁用确认）/ 替换为（可空 = 删除；split/join 全部出现处替换，「楼1」→「宿舍楼1」高频清理场景） |
| 预览摘要卡 | `__preview/__preview-title/__row/__from/__arrow/__to/__more`（surface-2） | 实时预览固定前 8 条「原名 → 新名」（等宽读数）+ 超出显「…共 N 项」+ 无变化态「无变化」读数——Blender/UE 原生无实时预览的社区诟病点，我方补齐加分项 |
| 确认 | `.ed-scenedlg__actions` 复用 | 确认 = 逐对象 `UpdateObjectCommand(name)` 经 BatchCommand 一条历史（全部无变化 → 不产生空历史）；主钮文案明示「重命名（一条历史 · 可撤销）」；禁用态 title 说明原因（空查找串 / 步长须为正数） |

布局增补：视觉令牌零新增（复用 §2 色板 / §5.17 dialog 原语 / `.ed-field`·`.ed-chip`·`.ed-btn`·`ed-readout` 既有件）。规则求值/预览/命令规划归 `ui/panels/batchRenameModel` 纯函数（node 全覆盖），组件只接线；GUI 行为留阶段验收（T8.6）。

### 5.19 视口诊断渲染档（T8.4 增补）

| 组件/载体 | 类名/来源 | 要点 |
|---|---|---|
| 分组下拉（三路同源） | `.ed-menu__popup/__item` + `__sep`（HUD Shaded ▼ / 视图菜单 / 右键「渲染模式」▸） | 六态单选组按「常规 / 诊断」两段呈现（UE Buffer 子级分组先例——降误触、留扩展空间）：常规组 Shaded/Wireframe/X-Ray、组分隔线、诊断组 灰模（Clay）/ 法线（Normals）/ 孤岛高亮（中文主导命名；**禁用 Isolate 字样**，防与 Maya isolate select 撞车）；separator 不占 actionId、键盘导航跳过；checked 三路同源 `environment.renderMode`（经 `coerceRenderMode` 归一） |
| islands 计数角标 | `.ed-hud__chip--islands`（`ed-hud__chip` 既有语言） | 孤岛高亮激活期间右上控制排首枚芯片：「未归类对象：N」，N=0 显示「全部已归类」（数据卫生验收从纯视觉变可量化）；计数 = `layerId === null` 对象数（`hudModel.countUnclassified` 纯函数），sceneVersion 订阅驱动幂等重读（归层操作实时收敛）；`tabular-nums` 等宽防跳变；中性灰呈现（琥珀已归「正在被操作」语义故不复用）；非 islands 模式不渲染 |
| 诊断配色（视口 3D 内容，§2 豁免条目——不受 UI 色板约束，色值单一真相源 = runtime `RenderModeState`） | `CLAY_COLOR 0x9aa0a6` · `ISLANDS_DIM_COLOR 0x23272e`（opacity 0.35、depthWrite false）· `ISLANDS_HIGHLIGHT_COLOR 0xff6a45` | 灰模 = 中性灰 MeshBasicMaterial（无光影无贴图，参考 ink-3 一带灰阶取不带色偏的中浅灰）；孤岛 = 已归类深灰半透明降暗（不写深度，亮侧可透过暗侧体块读出）+ 未归类暖橙红醒目不透明（与琥珀 accent、足迹幽灵蓝、法线彩色三方可区分）；法线 = RGB=世界空间法线（自写 ShaderMaterial，非 MeshNormalMaterial——后者编码视空间法线，相机旋转颜色游动不满足口径） |
| 会话级语义 | — | 诊断三档为会话级视口态：保存场景时组合根剥离 `environment.renderMode` 键（重新打开回退 shaded）；常规三态照旧随场景文件往返。分遍渲染矩阵（环境遍/内容遍/辅助遍豁免）沿 T6.4，孤岛高亮为四遍（环境 → 暗遍 layer 0 → 亮遍 DIAG_LAYER 4 → 辅助） |

视觉令牌零新增（分组分隔线复用 `.ed-menu__sep`，角标芯片复用 `.ed-hud__chip`）；视口内诊断色值为 runtime 常量（WebGL 侧无 CSS 变量通路，对应关系在此登记为单一对照源，沿 §5.12 先例）。

### 5.20 Outliner 层级树（T8.5 增补）

大纲从「图层虚分组平铺」升级为**层级树默认视图**（「层级｜分类」ghost 双钮组并列切换，`.ed-outliner__view-switch` + `--ghost-active` 压下态；分类视图沿 §5.3 既有行为、组壳不出现）。

| 组件/载体 | 类名/来源 | 要点 |
|---|---|---|
| 树形缩进 | 行内 `padding-left: calc(var(--sp-3) + depth×14px)` + `aria-level` | 每级 14px；叶行 18px 槽位内 2px `--line-3` 色点（`.ed-tree__leaf-dot`，radial-gradient 实现）与组行 caret 同位对齐——替代缩进参考线（弱化竖线噪声） |
| 折叠箭头 | `.ed-tree__caret` / `--closed` | 复用既有 `▾` caret 语义，折叠态 rotate(-90deg)（与分类组行同构）；组行 semibold + `--ink-2` 名称 + 直接成员计数 `ed-readout`；**组行无 eye/lock 开关**（纯组织节点不级联不误导，可见性走图层体系） |
| drop indicator 三态 | `.ed-tree__row--drop-before / --drop-after / --drop-into / --drop-forbidden` + 根区 `.ed-tree__hierarchy--root-drop` | ① 行上/下缘 1px `--accent` 插入线（inset box-shadow）＝排序落点；② 行体 `--accent-soft` 底 + `--accent-line` 1px 描边＝挂入目标；③ `--danger-soft` 底 + `--danger` 1px 描边 + `cursor: not-allowed`＝非法落点（环）；根区落点＝容器底缘 1px 琥珀线 |
| 拖拽源行 | `.ed-tree__row--dragging` | 0.45 透明度压暗（正在搬移提示）；hover 折叠组 800ms 自动展开（`TREE_HOVER_EXPAND_MS`，拖离/换目标重置计时） |

视觉令牌零新增（三态全部复用既有 accent/danger 语义族——琥珀沿「正在被操作」语义、danger 沿「禁止/破坏」语义）。树模型派生/落点三态计算/环检测归 `ui/panels/hierarchyModel` 纯函数（node 全覆盖），800ms 计时归组件。

### 5.21 层叠秩序：弹层逃逸与 z 刻度规范（T9.1 增补）

**病根与解法**：五大工具条/面板均为带 z-index 的 grid/flex item（z-index 对 position:static 的 grid/flex item 同样生效并自成层叠上下文），内联弹层的 z100 只在宿主内有效、对外等效 z10，再按 App DOM 序与同级后来者比拼——由此产生「MenuBar 下拉被 contextbar 盖顶 / contextbar 弹层压不过视口 HUD z20 / vtool flyout 盖不过左面板 / 两处 overflow 裁剪」等症状。解法=**一切弹层经 `AnchoredPopup`（`ui/components/AnchoredPopup.tsx`）portal 至 App 根部浮层容器 `#ed-popup-root`（`.ed-popup-root`，fixed 全屏铺位、pointer-events 透穿直属子元素放开、z 取 `--z-popover`）**；右键菜单 `.ed-context__popup` 沿 T5.8 fixed 样板不动。定位计算（四种贴锚策略/视口 8px 收边/侧向翻边）归 `ui/components/popupLayer.ts` 纯函数（node 单测锁定）。

**四档令牌语义表**（数值见 tokens.css:131-134，T9.1 未动）：

| 令牌 | 值 | 语义 | 合法使用者 |
|---|---|---|---|
| `--z-panel` | 10 | 结构性 chrome | `.ed-menubar` / `.ed-contextbar` / `.ed-panel` / `.ed-statusbar`（例外：`.ed-vtool` 不参与——见硬规则②附注） |
| `--z-hud` | 20 | 视口内浮层 | `.ed-hud` 四角 / `.ed-viewport__axes` / `.ed-viewport__minimap` |
| `--z-popover` | 100 | 逃逸弹层 | `.ed-popup-root` 及其内 AnchoredPopup 弹层；右键菜单 `.ed-context__popup`（fixed）；dialog scrim `.ed-dialog__scrim` |
| `--z-toast` | 1000 | 通知顶层 | `.ed-toasts` |

**两条硬规则**：①**一切弹层必须逃逸宿主层叠上下文**——portal 至根浮层容器（App 根部渲染，置于 ContextMenu/sceneDialogs/Toasts 之前，同档 z 让位后者）或循 ContextMenu 样板 fixed + App 尾部挂载；②**带 z-index 的 grid/flex 工具条容器内禁止渲染浮层**。附注（T9.1 裁定）：`.ed-vtool` 移除 z 参与（z auto）——列内 Tooltip 保留纯 CSS 贴靠方案不逃逸（高频瞬态、逃逸成本高），去 z 解除层叠陷阱使 tooltip 的 `--z-popover` 直达根层（网格分格互不重叠，去 z 无视觉变化；flyout/抽屉已 portal 不依赖本列 z）。Tooltip 同时具备换边避让：贴靠边越屏幕缘翻对侧（`popupLayer.resolveTooltipSide`，近缘向内弹），两侧皆放不下维持原边（宁贴锚不消失）。

**calc 局部加码登记制**：同档内需压过同档兄弟时允许 `calc(令牌 + 1)`，**必须在此登记**（新增未登记者视为违例）：

| 位置 | 声明 | 用途 |
|---|---|---|
| `.ed-dialog` | `z-index: calc(var(--z-popover) + 1)`（=101） | 对话框卡片压过同档 scrim（100） |
| `.ed-splitter` | `z-index: calc(var(--z-panel) + 1)`（=11） | 拖柄压过面板层（10），拖拽全程可见 |

**其他注记**：backdrop-filter（HUD 芯片/小地图/模式引导行）与 color-mix 半透明底均为潜在层叠上下文源，当前无受害后代（其下无更高层后代依赖），不清理，登记备查；弹层统一视口收边 8px（ContextMenu 先例推广，`popupLayer.POPUP_VIEWPORT_MARGIN`）；同档叠放按 DOM 序——`.ed-popup-root` 置于 ContextMenu/sceneDialogs/Toasts 之前，右键菜单、对话框（100/101）、Toast（1000）既有秩序不变。视觉令牌零新增。

### 5.22 测量标注（T10.2 增补）

| 组件/载体 | 类名/来源 | 要点 |
|---|---|---|
| 测量覆盖层（视口 3D 内容，§2 豁免条目——WebGL 侧无 CSS 变量通路，色值单一真相源 = runtime `MeasureOverlay` 常量） | 线/端点 `MEASURE_COLOR 0xab9ee6` · 标签底 `rgba(15,17,21,0.85)` · 标签字 `#ddd9f5` | **覆盖层三数值单一对照源**：线宽 1px 等效（LineBasicMaterial 原生栅格线宽，不设 linewidth，沿 §5.12 参考线 1px 先例）+ 端点 4px 方形标记（Sprite 屏幕恒定，`ENDPOINT_PX=4`，相机距离自适应）+ 标签 canvas 芯片（高 22px / 字 14px / DPR 2x 绘制、文字变更才重绘、`frame()` 屏幕恒定字号）；线透明度 0.95、depthTest:false + renderOrder 1001（与参考线同刻度恒置顶）。**测量用色 = 藤紫 `0xab9ee6` = `--mode-measure`**——与琥珀参考线 `0xe8a33d`（= `--accent`）、足迹幽灵蓝 `0x4ec9ff` 三方可区分（贴立面测量时与二者同屏共存不混淆）；标签深底（surface-0 系）+ 浅藤紫字保任意环境预设下读数可读 |
| 垂直条测量分组 | `.ed-vtool__btn`（复用）+ `.ed-vtool__sep` 分组线 | 距离 `Ruler` / 高度差 `MoveVertical` / 面积 `SquareDashed` / 角度 `Triangle` 四钮（lucide 线性、`currentColor`）；40×40 触达、激活琥珀高亮（左缘竖线 + soft 底——工具激活归琥珀语义，模式专属色只进徽标）；**无数字键**（1–4 已占不扩位，tooltip 不标键帽）；测量模式（Alt+7 / 选择器 / 视图菜单三路同源）置顶本分组，其余模式经「更多」抽屉可达（门 Q2 模式非权限闸门） |
| ContextToolbar 测量态中段 | `.ed-ctx__draw` + `.ed-chip.ed-ctx__chip`（复用）+ `.ed-ctx__measure-count` | measure.* 激活期间中段：四 kind 芯片即切（沿绘制五形状芯片先例，当前位琥珀 soft 底）+ 手势提示 + `N 条` 等宽计数 + 「删除上一条」（`Trash2`，Delete/⌫ 同语义，空表禁用）/「清除全部」（`Eraser`，会话态可重测无确认）两钮；计数与可用态订阅 `measure:changed{count}`（store 桥接），动作经组合根 MeasureSession 端口 |
| 状态栏测量读数段 | `.ed-statusbar__segment`（复用） | `describeMeasureStatus` 纯函数分节：段长/总长（distance）· 空间/水平/ΔH（height，ΔH 可负）· 面积 m²（area）· 角度 °（angle）· 拦截（danger 色，居末）；游标三维坐标 **X·Y·Z 定宽两位小数**（含 y——表面拾取口径，与绘制游标 X·Z 去尾零口径刻意区分）；等宽 tabular 读数；仅含 kind 的复位载荷清段 |
| 模式徽标 / 引导 | `.ed-ctx__mode-badge` `.ed-hud__chip--mode` `.ed-guide`（复用） | `--mode-measure` 藤紫注入 `--mode-accent`（徽标圆点/描边/文字 + Inspector 引导卡圆点，≤12px 色量）；HUD 徽标全名「测量」+ 一行 hudHint 引导（六联动 ⑤⑥ 沿 T7.1） |

布局增补：唯一新增令牌 `--mode-measure`（§2 已登记）；其余全部复用 §2 色板 / §5.9 垂直条·芯片·按钮原语 / §5.10 状态栏读数段 / §5.12 覆盖层先例。测量覆盖层为 WebGL 内绘制（纯 runtime 侧无 CSS 变量通路——对应关系在本节登记为单一对照源，沿 §5.12/§5.19 先例）。

## 6. 动效

- 只做微交互：悬停/按压 `--dur-1` 80ms；面板显隐、提示与 tooltip 淡入 `--dur-2` 160ms；启动一次性淡入 `--dur-3`。曲线统一 `--ease`。
- 不做持续动画（视口帧率优先）。

## 7. 面板扩展指南（T2.4+）

1. 新面板：`.ed-panel` 容器 → `.ed-panel__title` → 若干 `.ed-section`；字段用 `.ed-field`。
2. 自动生成的样式参数（StyleParameter）：`color`→原生 color input 包一层 `.ed-swatch`；`number`→`.ed-input--num` + 右侧单位 `--ink-3`；`boolean`→`.ed-check`；`select`→`.ed-select-wrap > .ed-select`。
3. 需要新颜色时，先问：能否用现有层级/强调变体表达？不能则在 `tokens.css` 增加语义令牌并在此文档登记。

## 8. 图标体系（T5.6 增补）

图标双轨制：**通用图标一律 `lucide-react`，园区特有语义自绘**（`src/ui/icons/custom.ts`）——同风格混排，禁止 emoji 与第三方第二图标库。

### 8.1 lucide 用法规则

- **tree-shaking 按需引入**：只从包根 import 用到的具名图标（`import { MousePointer2, X } from 'lucide-react'`），禁止 `import *`；Vite 生产构建自动摇树，单图标按需打包。
- **风格统一**：一律线性（fill none）+ `strokeWidth 2` + round cap/join（包缺省，勿覆写）；颜色一律 `currentColor`（随文字层级 `--ink-2/3`、激活琥珀联动），禁止图标内硬编码色。
- **尺寸约定**：24px 基准（垂直条全尺寸图标）；上下文条等紧凑区经 `size` 属性收到 13–15px，不缩描边粗细。
- 现用清单（T5.6）：`MousePointer2`（选择）、`Move3d`（移动）、`Rotate3d`（旋转）、`Scale3d`（缩放）、`Magnet`（吸附）、`Grid3x3`（网格）、`X`（退出）、`ChevronDown`（Scene ▼）、`Check`（模式当前位）。

### 8.2 自绘园区图标清单（`src/ui/icons/custom.ts`）

同 lucide 风格骨架（viewBox 24×24 / stroke currentColor / strokeWidth 2 / round cap/join / fill none；键名对齐 `toolIA.VerticalIconKey` = 要素类型 id），仅园区六类要素语义自绘：

| 键 | 组件 | 语义 |
|---|---|---|
| `building` | `BuildingIcon` | 建筑：双塔体块 + 地坪线 + 窗点 |
| `road` | `RoadIcon` | 道路：透视双缘 + 中心虚线 |
| `green` | `GreenIcon` | 绿地：双层冠乔木 + 地坪 |
| `water` | `WaterIcon` | 水面：双行波浪 |
| `parking` | `ParkingIcon` | 停车场：圆角方框 + P 字 |
| `marker` | `MarkerIcon` | 点位：地图钉 + 圆心 |

新图标准入：先查 lucide 是否已有同语义图标（有则用 lucide）；确需自绘时在 `custom.ts` 按上表骨架实现 + 键登记 `CUSTOM_ICONS` + 此处登记清单，禁止在组件内散落内联 SVG。
