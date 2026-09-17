# 阶段 8 任务书 × 成熟编辑器惯例 调研报告（冻结存档）

> 冻结日期：2026-09-13 ｜ 性质：过程文档，随 T8.1 阶段门使用后冻结，仅供查阅，不作为执行依据（执行依据=定稿任务书 T8.1–T8.6 + 决策日志门条目）。
> 调研方式：general-purpose 网络调研子代理，官方文档为主（docs.blender.org / docs.unity3d.com / dev.epicgames.com / help.figma.com / threejs.org 等）。
> 结论去向：低成本增补已直落任务书（标注「调研补」）；中成本增项经阶段门 8 问裁定（Q5/Q6/Q7 纳入、Q8 不纳入）；本报告全文为出处与论证存档。

---

调研范围：Unity / Unreal Engine / Blender / Figma / three.js / SketchUp / Maya / Cinema 4D 的官方文档为主，辅以开发者社区一手讨论。所有建议已对照本项目技术现实（TransformControls、SceneData v2、React 中文 UI、无后端 localStorage、HTML5 dnd、命令式单条历史惯例）。

---

## A. 高级吸附与自动对齐（对照 T8.1）

### A.1 主流做法盘点

**旋转角度吸附默认值与档位**

| 工具 | 默认步长 | 档位形态 | 设置入口 |
|---|---|---|---|
| Unity | **15°**（按住 Ctrl 增量吸附） | 单一数值可改 | Edit > Grid and Snap Settings（Move/Rotate/Scale 三分项各自独立增量） |
| UE | **10°** | 档位数组默认 **(5, 10, 15, 30, 45, 60, 90, 120)**，视口工具栏下拉快切 | Level Viewport 工具栏图标 + Editor Preferences > Viewports > Grid Snapping |
| Blender | **5°**（拖拽中按 Ctrl；Ctrl+Shift=1°） | 无 UI 档位选择（社区长期抱怨点） | 3D 视口头部磁铁总开关 + Affect: Move/Rotate/Scale 分项 + Snap To 目标下拉 |
| three.js | `rotationSnap`（**弧度制**，需 `degToRad`） | — | `setRotationSnap()` |

关键语义发现：three.js 官方论坛确认 TransformControls 的吸附语义是「**平移=绝对世界网格、旋转=相对拖拽起始姿态的相对步进**」——15° 步进的结果取决于松手前从什么角度开始拖。Unity 15° 是绝对角度网格（物体从 7° 起拖会落到 15°k）；TransformControls 则是 7°+15°k。这不是缺陷，但必须写进验收口径，否则 T8.6 验收时会误判为 bug。

**吸附开关分层**：主流三种形态并存——①Unity「设置面板统一管增量 + Ctrl 按住临时增强」；②UE「视口旁三独立图标开关（Drag/Rotate/Scale Grid 各自开+增量下拉）+ 设置深处全量分项」；③Blender「磁铁总开关 + Affect 分项（哪些变换模式受影响）+ 目标下拉」；Figma 则是 Preferences 隐式常开 + Ctrl 临时旁路。**共同标配：按住修饰键临时反转当前吸附状态**（开→关、关→开），四家全部如此。

**智能对齐参考线**：Figma 官方文档（正式叫 **snap to objects**：对齐其他对象的「中心和最外点」）明确：参考线**仅在移动/缩放/矢量点编辑的交互期间显示**，为**红色细线**（"A red guide appears on the canvas as a visual indicator"），松手即逝；Ctrl 临时旁路。距离数字徽标是**另一独立功能**（按住 Alt/Option 测距），不属于对齐参考线本体。3D 工具（Unity/UE/Blender）**均无拖拽中对齐参考线**——3D 领域对齐完全靠离散吸附目标（网格/顶点/表面），不做边缘/中心 guide 提示。

**高度/表面吸附**：UE 两条路径——**End 键一次性贴最近表面**（Snap to Floor，Alt+End=轴心贴地）+ 视口工具栏 Surface Snapping 常开开关（含 Rotate to Surface Normal / Surface Offset 两子选项）；Unity 为 Ctrl+Shift 拖拽表面吸附（落到 collider，V 键顶点吸附属排除项不采）；Blender 为 Snap To: Face 目标吸附。主流形态是「**一次性命令贴地**」与「**拖拽中连续表面吸附**」并存。

### A.2 与任务书对照

**吻合点**：默认 15° 与 Unity 默认一致、是 UE 档位数组常用项；「设置五分项 + Context Toolbar 总开关」= UE（分项在设置 + 快速开关在视口旁）与 Blender（总开关）的成熟组合；参考线「仅拖拽期间显示、松手即逝、细线不喧宾夺主」与 Figma 生命周期和视觉规范完全一致；边缘+中心线两类对齐与 Figma「centers and outermost points」两类精确对应；高度吸附（y=0 + 对象底/顶面派生层）在 Unity 表面吸附（AABB 近似意义上）有对应物，且拖拽中连续吸附比 Unity 的按住键形态更贴合既有 T7.6 架构。

**偏差点**：①任务书未标注 rotationSnap 相对步进语义（验收口径歧义）；②参考线无距离徽标——对照 Figma 后**确认这不是缺失**（Figma 距离也是独立功能），维持"不做"合理。

**我方缺失点**（对照主流标配）：①无「按住修饰键临时反转吸附」——Unity/UE/Blender/Figma 四家标配；②无一次性「贴地」命令（UE End 键）——园区场景"把对象放回地面/平台面"是高频操作。

**我方多出点**：拖拽中边缘/中心参考线在 3D 工具无先例（自 2D 设计工具移植）——但园区编辑本质是俯视平面规划思维，属合理领域特化而非过度设计。

### A.3 细化建议（门裁定后去向标注）

1. ✅ 已落任务书：T8.1 §1 验收口径补注 rotationSnap 相对步进语义。
2. ✅ 已落任务书：按住 Ctrl 临时反转吸附总状态（拖拽会话内开→关、关→开）。
3. ✅ 已落任务书：角度步长控件=下拉固定档 5°/15°/45° + 自由数值输入，默认 15°。
4. ✅ 门 Q5 拍板纳入：一次性「贴地」命令（右键菜单+快捷键，y 归 0 或下方最近高度候选层，单条历史）。
5. ✅ 已落任务书：参考线视觉规范数值化（1px 等效线宽 + 3–4px 端点标记 + CSS 令牌色，DESIGN.md 登记）。
6. ✅ 已落任务书：设置 UI 文案区分「吸附」与「绘制辅助锁定」两组概念，总开关只压吸附分项。

---

## B. 场景模板与批量导入（对照 T8.2）

### B.1 主流做法盘点

**起步模板**：Unity Hub 新建项目 = 模板列表（内置+可下载）→ 命名 → Create project，**模板是只读源、项目是完整实例化拷贝**，模板自身永不被实例污染；UE 新项目向导同语义。SketchUp 为欢迎窗 Choose Template（按行业+单位精选少量：Architectural – Feet and Inches / Product Design and Woodworking – Millimeters 等），选定后**成为后续 New 的默认模板**，可在偏好设置改默认。Figma Community 模板 Duplicate to Drafts = 复制实例。四家共同点：模板源与实例严格分离、实例化即全量拷贝。

**批量导入预览**：诚实结论——**主流 3D/设计工具均无"导入前预览清单+确认"先例**：Figma/Miro 批量拖入即导入、错误后置报错；Unity/UE 资产导入是自动后台流+事后 Import Settings，不是确认弹层。但该模式在通用文件上传 UX 实践中有充分依据（Ant Design Upload 组件的 file list 三态行、Filestack/Uploadcare 的预览确认模式均为此设计），且我们是"导入即入库+单条历史"的破坏性较强的操作，预览防错的价值比图片上传场景更高。

### B.2 与任务书对照

**吻合点**：「新建场景 ▾ 从模板新建」+ 模板=完整 SceneData 快照 + 深拷贝 **id 全量重生成** = Unity Hub/Figma duplicate 的"模板只读、实例全新"语义精确对应；内置模板随构建静态打包、少量精选（两套）= SketchUp 内置行业模板的量级判断；用户模板 localStorage 是无后端现实下唯一解。

**偏差点**：模板管理（重命名/删除）主流放专用管理器，我们放子菜单/弹层——量级小可接受。批量导入预览在专业工具无先例，但任务书设计（逐文件三态统计+失败不阻断其余+确认单条历史+取消零副作用）优于主流工具的"即拖即入"，属合理超越而非偏离。

**我方缺失点**：①无「默认模板」概念（SketchUp 有"选后即默认"）——门 Q8 裁定不纳入；②localStorage 容量兜底——无先例参照，属工程必需。

### B.3 细化建议（去向）

1. ✅ 已落任务书：模板实例化确认弹层三行摘要（模板名/来源/对象与图层数）。
2. ✅ 已落任务书：批量导入预览三态行（Ant Design Upload file list 惯例参照；失败行置灰不阻断）。
3. ✅ 已落任务书：用户模板容量上限（20 套或约 1MB 提示清理）。
4. ❌ 门 Q8 裁定不纳入：「设为默认模板」（已入 T8.2 明确不做）。

---

## C. 多对象编辑与工作区增强（对照 T8.3）

### C.1 主流做法盘点

**异类型多选编辑**：主流一律「**仅共同属性**」模型——Unity 多选时同类型共同属性可编辑，**值不一致的字段显示 "-"（dash 占位）**，编辑即应用到全部；异类型只显示属性交集；自定义面板不支持的显示 "Multi-object editing not supported"。UE 多选 Details 显示共同属性、**不同值字段留空**，可编辑后应用到全部。Figma 同为共同可编辑项模型。**无任何主流工具做「按类型分节」**。

**批量重命名**：Blender Batch Rename（**Ctrl+F2**；F2=重命名单个）——操作可叠加按序执行：Find/Replace（支持正则+大小写敏感+捕获组）、Set Name（New/Prefix/Suffix）、Strip Characters、Change Case；作用域 Selected/All；**没有逐项实时预览清单**（仅事后状态栏计数），是社区在 DevTalk 上明确诟病并要求改进的点。UE Content Browser 有 Advanced Rename（前缀/后缀/查找替换/序号）。Unity 无原生（靠商店插件）。即：**"带实时预览的批量重命名"在原生工具里是稀缺品**，我方设计优于 Blender 原生体验。

### C.2 与任务书对照

**吻合点**：通用组（图层/可见/锁定）置顶 = UE「共同属性优先」原则；批量重命名「前缀+起始序号+步长」是 UE 高级重命名的功能子集，而**实时预览**补上了 Blender/UE 都没做好的环节；弹层确认+一条 BatchCommand = 主流撤销语义。

**多出点**：「按语义类型分节」无先例，但主流"共同属性"模型成立的前提是属性面板统一——我们的对象模型是语义类型决定参数面板形态，分节在语义上等价于"并排打开 N 个同类型 Multi-Editor"，且逐节提交互不误伤比交集模型更可用。**属领域合理特化，维持并保留主流的"共同组置顶"原则**。

**缺失点**：①节内参数值不一致时的占位显示语义未定义（Unity "-"/UE 留空是标准答案）；②序号位数与显式默认值未定；③查找替换模式未覆盖。

### C.3 细化建议（去向）

1. ✅ 已落任务书：节内混合值占位「—（混合）」语义，编辑应用到节内全部。
2. ✅ 已落任务书：批量重命名显式默认值（起始 1/步长 1）+ 位数（1/2/3 位填充默认 1）+ 预览前 8 条 + 共 N 项。
3. ✅ 门 Q6 拍板纳入：查找/替换第二模式（与前缀+序号互斥，共享预览；空查找串禁用确认）。

---

## D. 高级渲染模式·视口诊断（对照 T8.4）

### D.1 主流做法盘点

**档位全集**：Unity Scene view Draw Modes（视口左上下拉）= Shaded / Wireframe / Shaded Wireframe / **Unlit（无光照）** + Debug 组（Shadow Cascades / Overdraw / Mipmaps 等，均为引擎管线诊断）。UE View Modes = Lit(Alt+4) / **Unlit(Alt+3，去光仅 BaseColor)** / Wireframe(Alt+2) / **Detail Lighting(Alt+5，中性材质保留法线)** / **Lighting Only(Alt+6，中性灰无贴图无法线)** / Buffer Visualization 子菜单（**World Normal** 等，非一级档）。共同规律：**诊断类收进子级或分组，一级档位保持 4–6 个**。

**Clay/灰模谱系**：「无光影灰模」主流对应物——UE **Lighting Only**（中性灰、无贴图、无法线）、Unity **Unlit**（无光但保留 BaseColor）、Blender Solid 模式内 **Lighting = Flat**（MatCap 是另一档=球面环境贴图着色）。Clay render 一词在建筑可视化圈是通称。

**孤岛高亮**：Unity/UE **均无**「未归类对象高亮」类视口模式——确认为自创语义。同构先例有二：①**Maya Isolate Select**（Ctrl+1：仅显示选中对象——"目标亮/其余暗"骨架相同但方向相反）；②**SketchUp Color by Layer**（按图层色渲染整个模型）——**数据属性驱动视口着色**的成熟范式，AutoCAD ByLayer 同理，「按图层归属二值着色」是它的降暗变体。

### D.2 与任务书对照

**吻合点**：三诊断档全部落在主流档位空间内（Clay≈UE Lighting Only + Blender Flat 合体；Normals≈UE World Normal，提一级合理——总档位 6 个不臃肿）；一次性遍历切换、不进帧路径、不入场景文件 = Unity/UE 视口模式同为 viewport-only 态；AUX 豁免 = Unity Draw Mode 下 Gizmos 独立照常渲染同理；分遍 overrideMaterial 架构本身即 Unity/UE 视口模式的实现惯例。

**偏差点**：命名——UE 的 "Unlit" 是去光保色（不是灰的），纯中性灰在 UE 叫 Lighting Only；我们叫「灰模（Clay）」对园区规划用户更直观且是建筑圈通称，**维持**。孤岛档英文避用 Isolate（防与 Maya isolate select 撞车），中文主导命名。

### D.3 细化建议（去向）

1. ✅ 已落任务书：HUD 下拉「常规/诊断」两组分隔（UE Buffer 类收子级分组先例），视图菜单三路同源。
2. ✅ 已落任务书：孤岛档 HUD 计数角标「未归类对象：N」（N=0 显示「全部已归类」）——数据卫生验收可量化。
3. ✅ 已落任务书：灰模材质选型注记 MeshBasicMaterial 单色（≈UE Lighting Only），防走样成 Lambert+环境光。
4. ✅ 已落任务书：法线档验收口径「RGB=世界空间法线，与 UE World Normal 视觉等价」。
5. ✅ 已落任务书：六档封顶，不仿 Unity Debug 堆 Overdraw/Mipmaps 类引擎管线诊断档。

---

## E. 场景树分组与层级拖拽（对照 T8.5）

### E.1 主流做法盘点

**纯组织节点**：**UE Actor Folders 是 group 设计的逐条直接先例**——Outliner 文件夹非 Actor、**无 transform、纯组织**、可嵌套、拖拽挂入、删文件夹不删成员、可右键 "Make Current Folder" 让新放入的 Actor 自动归入。**Blender Collections 为第二先例**：组织性容器**不传递变换**（官方手册明确 Parenting 才是"移动/旋转/缩放父级会变换子级"的关系）；Ctrl+G=将选中移入新 Collection（2.79 Group 时代同键）。**Unity 是反面对照**：无纯组织节点，empty parent 是 Transform 节点、父子传变换——刻意不走这条路、规避嵌套矩阵，方向与 UE/Blender 一致。

**建组键位**：Ctrl+G 为跨域惯例（Photoshop/Figma/Illustrator/SketchUp/Rhino/PowerPoint 全部如此），**Ctrl+Shift+G=解散**（PS/AI 惯例）。

**层级拖拽**：Unity Hierarchy——**拖到行体上=成为其子级（reparent）、拖到行间间隙=同级排序（sibling index）**，拖拽中有蓝色插入指示；UE Outliner——拖到文件夹=挂入、间隙=排序；Blender 2.90+ 支持手动排序。三家共同骨架 = 「挂入/排序/上提三形态+环拒绝」全部覆盖，此外 UE 文件夹还有两个交互：**拖拽中 hover 折叠文件夹自动展开**、**选文件夹=选中其中全部 Actor**。

**序列化**：UE 文件夹存在关卡文件内、Blender Collections 存 .blend 内——组织结构都是场景数据一等公民。group 进 SceneData 对象列表 + version 2.0 白名单放行，工程上等价且比主流格式（通常静默忽略未知数据）更严格，符合 fail-fast 一贯风格。

### E.2 与任务书对照

**吻合点**（全部维持）：组 transform 恒等纯组织 = UE Folders + Blender Collections 双先例；Ctrl+G / Ctrl+Shift+G 跨域惯例；挂入/排序/上提+环拒绝 = Unity/UE 核心语义；删组不级联（成员上提）= UE 删文件夹不删 Actor 一致；group 白名单放行进场景文件 = UE/Blender 先例。

**我方缺失点**：①**drop indicator 视觉指示**——Unity/UE 拖拽中都有明确插入位置指示，HTML5 dnd 下这是"三形态"可感知的前提；②**hover 折叠组自动展开**（延迟展开）；③**组选择成员的批量路径**——UE 选文件夹=选中成员，"选组=选组壳"的组壳编辑价值低，成员批量选择路径价值高。

### E.3 细化建议（去向）

1. ✅ 已落任务书：drop indicator 三态视觉规范（行上/下半区 1px 插入线=排序；行体高亮=挂入；禁止态+环拒绝 toast）。
2. ✅ 已落任务书：拖拽 hover 折叠组 800ms 自动展开（拖离重置计时）。
3. ✅ 门 Q7 拍板纳入：组行「选择成员」次级动作（双击组行或右键项=仅选成员不选壳）。
4. ✅ 门 Q3 拍板：场景格式 2.0 内增量放行 group（先例充分）。
5. 维持项：组恒等变换、Ctrl+G/Ctrl+Shift+G、删组上提不级联、树/图层双视图并存（与 UE folder+layer 双体系同构）。

---

## 总结：Top 10 细化建议（原报告排序，含去向）

| # | 任务书 | 建议 | 成本 | 去向 |
|---|---|---|---|---|
| 1 | T8.1 §1 | 验收口径补注 rotationSnap 相对步进语义 | 低 | ✅ 已落 |
| 2 | T8.1 §4 | 按住 Ctrl 临时反转吸附 | 低 | ✅ 已落 |
| 3 | T8.5 §3 | drop indicator 三态 + hover 折叠组 800ms 展开 | 低 | ✅ 已落 |
| 4 | T8.3 §1 | 节内混合值占位「—（混合）」语义 | 低 | ✅ 已落 |
| 5 | T8.3 §2 | 批量重命名显式默认值+位数+预览前 8 条 | 低 | ✅ 已落 |
| 6 | T8.4 | HUD 下拉分组 + 孤岛档计数角标 | 低 | ✅ 已落 |
| 7 | T8.1 §3 | 参考线视觉规范数值化 | 低 | ✅ 已落 |
| 8 | T8.2 | 导入预览三态行 + 模板确认摘要 + 容量兜底 | 低 | ✅ 已落 |
| 9 | T8.1 | 一次性贴地命令 | 中 | ✅ 门 Q5 纳入 |
| 10 | T8.5 §3 | 组行「选择成员」次级动作 | 中 | ✅ 门 Q7 纳入 |

门裁量备选：T8.3 查找/替换重命名模式（✅ 门 Q6 纳入）；T8.2 设为默认模板（❌ 门 Q8 不纳入）。

**核心结论**：六份任务书与主流惯例吻合度整体很高；两处属领域特化而非偏离（分节多选编辑、拖拽对齐参考线）；缺口集中在交互细节层，全部低成本补齐，无一触碰契约排除项。

## Sources:

**A 吸附与对齐**
- [Unity Manual — Grid snapping](https://docs.unity3d.com/2020.2/Documentation/Manual/GridSnapping.html)
- [Unity Manual — Position GameObjects（顶点/表面吸附）](https://docs.unity3d.com/6000.1/Documentation/Manual/PositioningGameObjects.html)
- [Unity Discussions — Rotation snapping accuracy（15° 默认）](https://discussions.unity.com/t/rotation-snapping-is-not-accurate-if-pressing-ctrl-after-dragging/1714256)
- [Epic — Actor Snapping in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/actor-snapping-in-unreal-engine?lang=en-US)
- [UE Common Rot Grid Sizes 默认数组（ueHow EditorPreferences 汇总）](https://uehow.web.fc2.com/Contents/Eng/UE4/System/EditorPreferences/EditorPreferences_All.html)
- [Blender Manual — Snapping](https://docs.blender.org/manual/en/latest/editors/3dview/controls/snapping.html)
- [Blender Artists — Angle Snapping（Ctrl=5°/Ctrl+Shift=1°）](https://blenderartists.org/t/angle-snapping/545486)
- [three.js docs — TransformControls（setRotationSnap 弧度制）](https://threejs.org/docs/pages/TransformControls.html)
- [three.js Discourse — 平移绝对/旋转相对吸附语义](https://discourse.threejs.org/t/transformcontrols-snapping-is-absolute-for-translation-but-relative-for-rotation/47420)
- [Figma Learn — Adjust alignment（snap to objects/红色参考线/Ctrl 旁路）](https://help.figma.com/hc/en-us/articles/360039956914-Adjust-alignment-rotation-position-and-dimensions)
- [Drei — TransformControls props](https://drei.docs.pmnd.rs/gizmos/transform-controls)

**B 模板与导入**
- [Unity Hub Docs — Create a new project](https://docs.unity.com/en-us/hub/project-create)
- [Unity Manual — Create your first project](https://docs.unity3d.com/6000.1/Documentation/Manual/create-first-project.html)
- [SketchUp Community — 启动模板与默认模板行为](https://forums.sketchup.com/t/document-show-up-when-i-start-the-program/5103)
- [Google SketchUp: The Missing Manual（Choosing a Template 模板清单）](https://dokumen.pub/google-sketchup-the-missing-manual-1nbsped-0596521464-9780596521462.html)
- [Miro Help — Uploading files to boards（即拖即入、无预览）](https://help.miro.com/hc/en-us/articles/360017731013-Uploading-files-to-boards)
- [Figma Help — Add images and videos to designs](https://help.figma.com/hc/en-us/articles/360040028034-Add-images-and-videos-to-designs)
- [Ant Design — Upload 组件（预览清单三态行参照）](https://ant.design/components/upload/)

**C 多对象编辑与重命名**
- [Unity Manual — Multi-Object Editing](https://docs.unity3d.com/352/Documentation/Manual/Multi-ObjectEditing.html)
- [Unity ScriptReference — CanEditMultipleObjects](https://docs.unity3d.com/ScriptReference/CanEditMultipleObjects.html)
- [Epic — Selecting Actors（多选 Details 同编）](https://dev.epicgames.com/documentation/unreal-engine/selecting-actors-in-unreal-engine?lang=en-US)
- [Epic — Level Editor Details Panel](https://dev.epicgames.com/documentation/unreal-engine/level-editor-details-panel-in-unreal-engine?lang=en-US)
- [Blender Manual — Rename / Batch Rename](https://docs.blender.org/manual/en/latest/files/blend/rename.html)
- [Blender DevTalk — Batch Rename 可用性讨论（无预览之弊）](https://devtalk.blender.org/t/batch-rename-tool-has-very-poor-usability/15025)

**D 视口诊断模式**
- [Unity Manual — Scene view Draw Modes and View Options](https://docs.unity3d.com/6000.2/Documentation/Manual/ViewModes.html)
- [Epic — Viewport Modes in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/viewport-modes-in-unreal-engine?lang=en-US)
- [Blender Manual — Viewport Shading（Studio/MatCap/Flat）](https://docs.blender.org/manual/en/latest/editors/3dview/display/shading.html)
- [Autodesk Maya Help — Show > Isolate Select](https://help.autodesk.com/view/MAYAUL/2025/ENU/?guid=GUID-A15B3808-D3C4-482F-98DD-BC7F45E13A36)
- [Maxon Help — Viewport Solo Mode](https://help.maxon.net/c4d/en-us/Content/html/52991.html)
- [MasterSketchUp — Color by Layer](https://mastersketchup.com/color-by-layer/)

**E 分组与层级**
- [Epic — Outliner（Actor Folders）](https://dev.epicgames.com/documentation/unreal-engine/outliner-in-unreal-engine)
- [UE Forums — World Outliner folders（纯组织、不传变换）](https://forums.unrealengine.com/t/world-outliner-folders-and-groups-quality-of-life-improvements/493193)
- [UE Forums — Make Current Folder](https://forums.unrealengine.com/t/solved-normal-would-love-to-select-the-folder-that-actors-go-in-in-outliner/1168761)
- [Blender Manual — Parenting Objects（父级变换传递）](https://docs.blender.org/manual/en/latest/scene_layout/object/editing/parent.html)
- [Unity Manual — Manage GameObjects in the Hierarchy window（拖拽父子/排序）](https://docs.unity3d.com/6000.2/Documentation/Manual/Hierarchy.html)
- [Unity Manual (2019.2) — Hierarchy（siblings 拖拽语义）](https://docs.unity.cn/2019.2/Documentation/Manual/Hierarchy.html)
- [Blender Artists — Ctrl+G 键位沿革](https://blenderartists.org/t/ctrl-g/1188237)
- [Blender DevTalk — Ctrl+G 绑定讨论](https://devtalk.blender.org/t/ctrl-g-should-be-bound-to-move-to-collection-new-collection-not-create-new-collection/8872)
