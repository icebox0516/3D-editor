# Simple-Asset 方法先例索引（轻量简单资产批）

> 归属：simple-asset workflow（`.zcode/skills/asset-production/workflows/simple-asset.md`）同步落点（spine §7）；方法级索引（非家族级——本 workflow 服务跨 taxonomy 的轻量件）。首建：T025.1 批 A（2026-09-28）。
>
 > 用途（先例索引 = 方法摘要 + 导航，既非纯导航也非事实源——数值与细节回原任务书 / 原 Spec 核对，D40）：后续批次（T025 B/C/D、T027 等）经本索引检索同型先例，判定「可直接继承 / 按本资产改写 / Unknown」。

## 1. 资产入口（批 A 交通静态，2026-09-28）

| 资产 | 入口 | 方法摘要（结构 × 配方 × 特别点） |
|---|---|---|
| 防撞柱 | `assets/asset_bollard.asset.ts` | 圆管 + 压扁半球顶帽 + 法兰螺栓基座（产品态）+ 反光带套筒；metal-brush-pole（RAL 7040）+ worn 法兰；反光件不注入 |
| 人行护栏段 | `assets/asset_pedestrian_barrier.asset.ts` | 横杆式段栏（立柱 ×2 + 横杆 ×3）；**单值材质形态**（mergeGeometries(parts,false) 无分组——单配方散布主力件合批省分组开销，seedstack 先例） |
| 道路隔离栏（京式） | `assets/asset_road_barrier.asset.ts` | 密竖杆 ×24 + U 弯头（半 torus + 回尾开管，接口包胶防共面闪烁）+ 上下横梁 + 铸铁底座；金属/反光块/底座三分层 |
| 停车挡车器 | `assets/asset_wheelstop.asset.ts` | **梯形棱柱手工 BufferGeometry**（逐面 4 顶点 + 平面法线 + 每面 uv 满 0–1）；rubber-mold 黑 + 顶棱反光条 |
| 交通锥 | `assets/asset_trafficcone.asset.ts` | **首个设施色卡消费**（build 读 params.preset 只改锥体底色——锥变环不变）；grain-fine 塑料 |
| 减速带 | `assets/asset_speedbump.asset.ts` | **圆弧拱段式手工构面**（三点定弧、弧端 y 钳 0 贴地、段间接口不封口）；4 段黄黑交替同配方双色共享 program |

## 2. 配方谱系（facilityMaterials，10 配方）

| 配方 | 语义 | 消费者 |
|---|---|---|
| wood-slats | 年轮+纤维+板间色差 | parkbench（木条） |
| metal-brush-pole | 竖向拉丝糙度 | streetlamp/signpost 杆件、**bollard 柱体** |
| metal-brush-worn | 拉丝+缘磨损 | parkbench 腿架、**pedestrian_barrier/road_barrier 白漆钢管** |
| paint-bin-shell | 漆斑驳+竖划痕 | trashbin 桶身 |
| metal-lathe-lid | 车削环纹 | trashbin 端面 |
| grain-fine | 橘皮微起伏+白噪 | streetlamp 灯壳、trashbin 翻盖板、**trafficcone 锥体+底座** |
| paint-edge-worn | 缘磨损露底 | hydrant 红漆 |
| cast-iron | 粗砂颗粒 | hydrant 底座、**road_barrier 底座** |
| paint-matte-fade | 哑光日晒褪色 | signpost 牌面 |
| **rubber-mold**（T025.1 新增） | 橡胶模压：中低频胶料色斑（vnoise）+ 细颗粒（高频白噪，幅度收小） | **wheelstop 本体、speedbump 黄段/黑段**（双色同键共享 program） |

## 3. 结构先例（可复用模式）

- **单值材质形态**：全部件同配方时 mergeGeometries(parts, false) 不生成分组——单 draw call（散布主力件性能位）；测试断言面为「数组=分组对齐 / 单值=无分组」双形态（facilityAssets.test 先例）。
- **手工构面纪律**：非基元截面（梯形/弧拱）手写 BufferGeometry——逐面 4 顶点、平面解析法线、每面 uv 满 0–1 域（配方按 Box 型 0–1 域设计的前提）、绕序交叉积复核、setIndex 索引化与基元 merge 兼容。
- **反光件处理**：纯底材不注入（亮色 + roughness 0.3–0.4 + emissive 同色 0.25——弱于灯板 1.5 的「暗处可读」档）；色值注释引证据域。
- **段式件标准段长**：D19.2 契约不扩（无长度 build 参数）——护栏/隔离栏/减速带按 Spec 锚定标准段长定一档几何，多段拼接归放置/散布。
- **色卡设施移植**：锥 preset = 只改基调面材质底色（几何/分层/结构面不变）；未知卡防御归默认；swatch 与底色同源。

## 4. 导航

- 批 A Spec：`docs/research/traffic-static-reference.md` @1.0（终审通过 2026-09-28）
- 任务书与完成记录：`tasks/025.1-traffic-static.md`
- 取证：`docs/acceptance/T025/025.1/`
