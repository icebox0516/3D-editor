# 阶段 10 调研报告：测量与分析（成熟编辑器/数字孪生产品对照，冻结存档）

> 调研时间：2026-09-15 ｜ 调研代理：general-purpose（网络调研）｜ 用途：T10.1 阶段门决策输入
> 状态：**冻结只读**——本文件为立项时点快照，后续增补调研另立文件。

## 一、测量工具对照

| 编辑器 | 测量类型 | 交互 | 标注呈现 | 会话态/持久 | 可编辑 |
|---|---|---|---|---|---|
| SketchUp | 距离（卷尺）、角度（量角器）、面积 | 卷尺 2 击（读数入 Measurements 框，箭头键锁轴）；量角器 3 击；面积=选面看 Entity Info 或 Text 工具贴面 | 状态栏读数+可选贴面文字 | 读数会话态；**参考线/参考点是持久实体**，可吸附、可删 | 参考线可删不可改数值 |
| Blender | 距离、角度（Measure 工具属 Annotation 组） | 拖拽画线=距离；拖已有线端点再拉出=转量角器；X/Delete 删除 | 视口内红色线+数字 overlay（渲染图不显示） | **纯会话态，不存入 .blend**；持久需 MeasureIt 插件 | 会话内可拖端点改测量 |
| Unity | 距离（仅插件） | 无内置；EpsilonDelta Measure Tool / 开源 Unity-Measuring-Tape | Gizmo 线+句柄数字 | 插件各异 | — |
| UE5 | 距离、角度 | 视口中键拖拽（仅正交视图）临时读数；Modeling Mode 另有 Measure 工具 | 视口 overlay | 中键读数**会话态**；内置弱致社区自制工具多 | 否 |
| three.js editor | 无测量 | —（仅 select/translate/scale） | — | — | — |
| Web 查看器 | Sketchfab=作者设定包围盒真实尺寸展示（非交互测量）；Spline 未见内置测量 | — | 属性面板 | — | — |
| sbcode 教程/3dViewMeasurement（three.js 社区代表作） | 距离（raycast 对象表面） | 按住 Ctrl 进测量态→2 击定线，ESC/松 Ctrl 取消 | **CSS2D 黑底白字 DOM 标签置于线中点**；线默认深度测试 | 会话态，字典管理随删 | 否 |
| mars3d/SuperMap（数字孪生标准形态） | 距离（空间/贴地）、折线、面积（空间/投影/贴地三口径）、高度差（底/顶/悬浮）、角度、剖面、体积 | 左键逐点、双击/右键结束、点图标整体删 | 3D 场景内线+文字标签（canvas 纹理） | 测量对象持久挂图层树、可删可清空 | 部分 |

## 二、空间分析对照（数字孪生产品标配）

| 能力 | 地位 | 实现要点 | 现成参考 |
|---|---|---|---|
| 日照/阴影 | 高价值标配 | suncalc 算太阳方位/高度角→驱动 DirectionalLight+时间轴动画；进阶=正交相机深度 pass 栅格统计遮挡时长热力图 | three.js 开源 solar-shadow、Sunposition viewer、shadowmap.org（商业） |
| 视域/可视域 | 标配（安防摄像头选址场景） | 观察点虚拟相机渲染深度图，地面/网格 shader 比较深度→绿可见/红不可见（mars3d「合并渲染」即此） | mars3d ViewShed（思路可直接移植）；three.js 无成熟开源件 |
| 通视/剖面 | 标配 | 剖面=沿折线每 d 米采样 raycast 高度→2D 图表；通视=两点间 raycast 命中判定 | mars3d computeSurfacePoints 同思路，需自写 |
| 高程/坡度着色 | 地形类标配，本项目平地意义低 | 顶点色/梯度 shader；坡度=法线与 up 夹角 | 成熟做法多 |
| 场景统计报表 | 数字孪生面板常见、成本最低 | 遍历场景 JSON→分图层数量/包围盒底面积汇总，纯数据无渲染 | 自写 |
| 漫游路径 | 常见 | CatmullRomCurve3+沿线相机动画 | three.js 生态示例多 |

## 三、three.js 实现要点

- **标签**：CSS2D/HTML 浮层——文字清晰可复制、样式活、每帧 `project()` 投影，但**永远置顶不参与遮挡**、数量大时 DOM 开销、截图需含 DOM；canvas 纹理 Sprite——参与深度测试可被遮挡、单 draw call、性能好，但缩放锯齿/改字需重绘纹理。**社区通行折中：少量测量标签用 CSS2D（pointerEvents:none 覆盖层），线用 depthTest:false+高 renderOrder 保「取证可见性」**（sbcode 教程即此组合）；大量文本用 troika-three-text（SDF mesh 文本）。
- **拾取**：raycast 对象表面（贴建筑立面、点在任意空间，需管理可拾取集合+每帧求交）vs 地面平面（稳定但两点只在 y=0）。**主流取舍=「表面优先、地面兜底」**：先 `intersectObjects(对象集)`，未命中再落地面平面；注意相机近水平时射线-平面交点飞远，须 clamp 最大距离。
- **高度差**：两点测量的标签同时给「空间距离+ΔH」双读数（mars3d 式）；贴对象高度=表面 raycast 点的 y 值。

## 四、归纳建议（调研代理 → 阶段门输入）

**必备（测量模式，工作模式第 7 位）**：①两点+折线距离（表面优先/地面兜底拾取，双击/回车结束、ESC 取消、每段+总长）；②高度差双读数（复用高度层系统）；③面积（主口径=水平投影，斜面表面积作副口径标注）。**加分**：④三点角度（SketchUp/Blender 通行范式）；⑤分图层统计报表（零渲染成本、汇报刚需）；⑥日照时间轴+方向光动画版。**不建议 v1**：可视域/通视（深度 pass 或海量 raycast，成本高）、剖面（采样+图表 UI 重）、漫游（另立模式）、体积/淹没/天际线（GIS 需求）。

**持久化口径**：测量=会话态辅助覆盖层（走池化辅助渲染层，同参考线先例），**不入场景 JSON、不入 Command 历史**（社区主流：Blender/UE5/SketchUp 读数均会话态）；需要保留时后续序列化为附注数据。

**三个公认设计坑**：①**标签深度遮挡**——CSS2D 穿墙可见，Sprite 中心被遮整字消失；须择一策略（遮挡检测降透明度，或明示「测量永远置顶」）；②**折线闭合语义**——双击结束会与点击起点闭合冲突（产生重复点），需末点去重+最少点数校验（距离≥2、面积≥3 且非共线），面积必须写明口径（投影 vs 表面，SuperMap/mars3d 均分列）；③**单位与射线退化**——场景单位≠米需全局换算配置；相机近水平时地面平面交点趋于无穷远，须限距或限制射线-平面夹角。

## Sources

- [SketchUp – Measuring Angles and Distances](https://help.sketchup.com/en/sketchup/measuring-angles-and-distances-model-precisely) / [Measurement Tools](https://help.sketchup.com/sketchup-ipad/measurement-tools)
- [Blender Manual – Measure](https://docs.blender.org/manual/en/latest/editors/3dview/toolbar/measure.html) / [MeasureIt 插件](https://www.youtube.com/watch?v=gOjrAR8_8Qw)
- [Epic – How to measure distances in UE](https://dev.epicgames.com/community/learning/tutorials/70z/how-to-measure-distances-in-unreal-engine) / [Modeling Mode](https://dev.epicgames.com/documentation/en-us/unreal-engine/modeling-mode-in-unreal-engine)
- [Unity 论坛测量工具讨论](https://discussions.unity.com/t/is-there-a-simple-way-to-measure-distances-in-unity/911810) / [Unity-Measuring-Tape](https://github.com/dante-signal31/Unity-Measuring-Tape)
- [sbcode – Raycaster Measurements (CSS2D)](https://sbcode.net/threejs/measurements/) / [3dViewMeasurement](https://github.com/ismailazdad/3dViewMeasurement) / [论坛帖](https://discourse.threejs.org/t/allow-measurement-to-3d-object/46457)
- [Mars3D 官网/功能示例](http://mars3d.cn/) / [功能介绍](http://mars3d.cn/docs/guide/) / [分析专题](http://mars3d.cn/docs/issue/analysis/)
- [solar-shadow](https://github.com/smnsht/solar-shadow) / [Sunposition viewer](https://discourse.threejs.org/t/sunposition-3d-viewer/40901) / [Google 3D Tiles 阴影分析](https://discourse.threejs.org/t/shadow-analysis-on-google-3d-tiles/52623) / [shadowmap.org](https://shadowmap.org/)
- [three.js issue #9246 – CSS2D scaling](https://github.com/mrdoob/three/issues/9246)
