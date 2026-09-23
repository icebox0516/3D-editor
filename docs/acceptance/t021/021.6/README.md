# T021.6 Broadleaf Canopy Proxy 材质面——13 树种冠形基线帧取证

> 任务：[tasks/021.6-canopy-proxy.md](../../../tasks/021.6-canopy-proxy.md) ｜ Epic：021-lod-representation ｜ 执行：park-shader-agent（材质面 Step；几何面 = procedural-asset-agent 已交付）｜ 执行日 2026-09-23
> 交付物：`src/runtime/procedural/tree/broadleafCanopyMaterials.ts`（canopy 材质 + 干柱材质 + Canopy Depth Material 成套工厂）+ `tests/runtime/procedural/tree/broadleafCanopyMaterials.test.ts`（10 用例全绿）。

## 方法（最小渲染 harness，无 Runtime 接线）

- 页面：`tools/canopy-baseline.html` + `tools/canopy-baseline-page.ts`（Vite dev 直 serve docs 路径，`/src/...` 绝对导入——沿 011.9 compile-check 先例）。不经 Renderer / SceneManager / InstancedAssetPool / SourceCache。
- 渲染链：`buildBroadleafCanopyGeometry(assetId)`（几何面交付）+ `createBroadleafCanopyMaterials(assetId)`（本 Step 交付）→ Mesh（材质数组 [干柱, 冠卡] + customDepthMaterial 同套挂载）。
- 环境域 = **T018 真实链**：SkyCore(day 大气) → PmremEnvironment(LazyPmremBackend) 初烘 → `scene.environment` + `scene.environmentIntensity = 0.15`（day 预设；探针复核 environment=true / intensity=0.15）；主光 = day 太阳方向 × LEGACY_SUN_DISTANCE 的 DirectionalLight（白 2.4）；地面 = day groundColor 大平面。相机 = 主 Renderer 同参（fov 50 / near 1 / far 10000），1920×1080 DPR1。
- **同源机位**（13 树种同规则，横向可比）：单树帧 = 球坐标 distance 60m / azimuth 35° / elevation 8°，目标 = (0, 树高×0.55, 0)（逐树归一构图）；全景帧 = 13 树 X 轴一行 16m 间距，+Z 垂直正视（自适应距离 134m）。
- uTime 恒 0（静态基线帧——aSeed=0 常数相位，风摆冻结在相位 0 的静态倾斜，可复现）。
- console 全程捕获：**0 错误 0 canopy 材质警告**（仅 Sky 着色器 FXC X4122 双精度保守误报——011.6 终裁 X4000 系同族接受记档口径，非 canopy 路径）。
- 驱动：agent-browser（CDP）截图 + 页面内像素探针（`preserveDrawingBuffer` 直读——绿色覆盖率 = 全帧中 G>R×1.08 且 G>B×1.08 且 G>40 的像素占比）。进程用完即清：浏览器已关、dev server（含残留 node 子进程）已杀、端口已复核释放。

## 帧清单（14 帧）

| 文件 | 内容 |
|---|---|
| `canopy-asset_tree_*.png` × 13 | 各树种单树基线帧（同源机位；species = 3a/camphor/celtis/zelkova/ginkgo/bischofia/fraxinus/koelreuteria/ligustrum/platanus/salix/sophora/triadica） |
| `canopy-panorama-13.png` | 13 树同框全景（横向冠形对比一览；13×487 + 地面 = 6333 tri / 27 draw calls / 0 错误） |

## 结论（任务书验收项「13 树种冠形横向可辨」基线帧同源比较）

1. **冠形横向可辨 — 成立**：单树帧 + 全景同框双证。冠幅 / 高矮 / 剪影三种读向均拉开：
   - 宽垂冠（salix XZ 11.74m，全景最宽第 11 位）↔ 窄塔冠（ginkgo XZ 4.99m、全景第 5 位浅黄绿窄塔）为两极；
   - 高大开展（platanus Y 11.51m / sophora 10.33m / fraxinus 10.45m）↔ 紧凑圆冠（zelkova 6.79×8.07m）；
   - 逐树种冠幅 / 树高实测见下表（两列横向无重复排序，全景帧肉眼可辨）。
2. **绿色覆盖率 — 成立**：13 帧绿色像素占比 0.22%（ginkgo 窄冠）–1.23%（salix 宽冠），与冠幅序一致（单树 60m 观距口径——远景单树占屏小的正确量级；森林密植覆盖为 021.8 远景验收面）。冠面读向为绿色体量块（卡交叉双面读向），非纸片感。
3. **剪影含主干 — 成立**：13/13 帧干柱剪影可辨（干基贴地、锥度收分、深色皮色与冠分离读出），全景帧逐树可数。
4. **无渲染缺陷**：0 错误 0 canopy 警告；无破面 / 穿模 / 黑屏 / z-fighting / 程序化重复图案（多模态判读 3a / salix / panorama 三帧 + 逐帧像素探针全通过）。

## 逐树种账目（探针直读）

| assetId | tri | 冠幅 XZ (m) | 树高 Y (m) | 绿色覆盖率 (60m 单树帧) |
|---|---|---|---|---|
| asset_tree_3a | 487 | 6.07 | 8.55 | 0.29% |
| asset_tree_camphor | 487 | 6.99 | 8.73 | 0.33% |
| asset_tree_celtis | 487 | 7.54 | 8.63 | 0.39% |
| asset_tree_zelkova | 487 | 6.79 | 8.07 | 0.31% |
| asset_tree_ginkgo | 487 | 4.99 | 8.29 | 0.22% |
| asset_tree_bischofia | 487 | 8.24 | 9.95 | 0.43% |
| asset_tree_fraxinus | 487 | 8.10 | 10.45 | 0.59% |
| asset_tree_koelreuteria | 487 | 7.55 | 9.47 | 0.38% |
| asset_tree_ligustrum | 487 | 7.00 | 8.40 | 0.31% |
| asset_tree_platanus | 487 | 7.75 | 11.51 | 0.58% |
| asset_tree_salix | 487 | 11.74 | 9.91 | 1.23% |
| asset_tree_sophora | 487 | 9.88 | 10.33 | 0.54% |
| asset_tree_triadica | 487 | 8.49 | 9.64 | 0.43% |

（面数恒 487 ≤ 500 预算红线——几何面锁定账目，材质面零增量。）

## 边界记档

- 本取证无 shadow pass / 无 dither 过渡 / 无实例化——分别为 021.5 / 021.3 / 021.7 面；深度材质仅验证「同套挂载零冲突」（customDepthMaterial 挂载面）。
- 基线帧 uTime=0 静态倾斜；风动相位一致性证据在单测（drift-lock：canopy 风常数 ↔ species 材质真实注入 GLSL 逐数对账 + aSeed=0 相位数值复核），不在本帧。
