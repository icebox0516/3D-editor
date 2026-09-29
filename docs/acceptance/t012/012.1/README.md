# T012.1 雪松视觉验证取证（新 Family 首例完整首例验收——D30/D43 + D37 六步）

> 任务：[tasks/012.1-cedrus.md](../../../tasks/012.1-cedrus.md) ｜ Spec：[docs/research/cedrus-reference.md](../../../docs/research/cedrus-reference.md) **1.0**（终审通过 + 两项修正直写）｜ 口径：tree workflow 完整首例流程——三必做 + 疑点触发全项（契约首证 / 方法复制 / 缺口发现三重职责）
> 环境：Chrome headless（CDP 9333 直驱，tools/cdp.mjs）+ Vite dev（5173）｜ 1920×1080 DPR=1 ｜ WebGL2 ｜ day 预设固定灯光 ｜ freezeTime 冻结风相位（风动双帧除外）｜ asset_tree_cedrus slot-0 锚点（**Step 4 密度校准后终态**：High 37042 = meta triangleCount 实数；8 槽 High 实测带 32224–38382 ⊂ 家族预算行 ≤40000〔slot-2 用满 96%〕）
> 判读通道记档：本会话 Read 工具对本地图片仅返回 CDN 转存 URL——证据帧经转存 URL 喂多模态图像分析 MCP 做**中性判读**（提问不出现树种名/预期答案，011.2 防引导幻觉口径）；机器侧证据（pixel-diff / md5 / stats / console）本地直读。

## D30 三必做结论

### ① Spec 身份判定 —— **通过（特征组合指向雪松，读向不依赖标注）**

| 距离档 | Spec 身份判据 | 判定 | 证据（中性判读摘录） |
|---|---|---|---|
| 近距 | 短枝莲座簇（15–25 针放射）+ 长枝散生针（双挂点）；灰绿-蓝绿-银灰粉调 + 白粉；无两面色差；幼叶淡绿银灰→老叶深绿；鳞状方块片树皮（3–8cm / 沟浅-中 / 不剥落）；球果直立如烛 | ✓ | needle-closeup / crown-7m：**双挂点两型并存均衡**（「starburst clusters at twig ends + scattered single needles along thinner twigs」）；灰绿蓝调 + 白粉读出；幼枝淡色 vs 老叶灰绿差读出；bark-trunk-1p2m：**方-长方板块片**（「cracked dried mud / alligator-like」）、多小板、沟浅-中、块顶-沟对比明确；球果 8–12 枚坐短枝直立（淡绿-褐） |
| 中距 | 层状轮生成层（6–8 主层）；层角梯度（下平展 60–90° / 上上举 30–60°）；层板桌状 + 外缘垂帘；末级细枝下垂；顶梢下垂点头；层间天光带 | ✓ | vis-near-12m：**层状轮生 8–10 层可辨**（含次级层——落终审「6–8 清晰主层 + 次级」口径）、**下平展微垂 / 上上举抱干**、**flattened table-like plates + drooping fringe at layer edges**、末级细枝下垂读出、层间天光带清晰；cone-leader-10m-el28：**顶梢「distinctly curved and drooping」**（3a 实测点头 0.49m 像素可辨） |
| 远距 | 尖塔形窄冠剪影（基部最宽 + 上 1/4 渐尖 + 顶梢细）；阶梯层叠外缘（非光滑圆锥面） | ✓ | baseline / vis-far-50m：**strongly excurrent pointed spire、H/W ≈3:1–4:1**（冠幅比 0.40 域内）；vis-far：**stepped/terraced edges——pagoda-like step pattern**（层叠外缘 = 非光滑锥面，判定 3 达成） |

**层状轮生成层 + 层角梯度 + 层板垂帘缘 + 顶梢点头 + 长短枝双挂点 + 球果如烛 + 灰绿蓝粉调 + 鳞状块片皮 + 尖塔层叠剪影九重身份组合成立**——vs 阔叶 13 树与 ginkgo 先例全部正交（新 Family 形态语言首证：无阔叶先例直接复用，方法管线跨族复制 + 挂点语言层状改写——任务书先例基线全部兑现）。

### ② 统一基线帧 —— `baseline.png`（M25 = 25m/35°/8°，day 预设 + freezeTime）

全族同参数同源（012.2 起族门横向比较基线 + 用户观感复核窗口）；**校准后终态帧**（校准前帧存 `calib-before/baseline.png` 对照）。

### ③ 契约缺口记档（归 T012 族门 012.2，零阻塞）

开发链四 Step 缺口候选归并去重后 12 条：
1. **层数 6–8 变体轴槽间展开**（结构计数恒等阻塞，需家族契约新数值面——ginkgo 长短枝比轴先例）
2. **针卡双帧 uv 域判别通道**（本轮已实装 rosette v∈[2,3) / 散生 v∈[0,1)——族级提炼候选：云杉/冷杉第二例必再遇，可升家族契约字段）
3. **莲座扇区窗列 SDF 族内公共模式提炼**（待第二例）
4. proxy 接入项 **ConiferShapeProfile 双重 cast**（proxy 只路由不消费——接入项泛型化候选，第二例触发）
5. **三成分风动 canopy 退化映射**（顶梢成分无 proxy 槽位、sway 相位耦合 1.2 vs 1.4 记结构性简化）
6. **簇内逐针独立颤不可表达**（单卡抽象连带限制）
7. **受光色差冠层方位语义**（无径深/方位通道——现竖向 ramp + 逐卡抖动近似）
8. **树高锚/冠基/皮网格频率材质侧硬编码无 profile 联动**
9. **球果量级年龄轴展开**（槽间恒等——成熟树结果更重分化留族门）
10. **球果摆动语义**（果卡随皮组刚性——材质层缺口）
11. **Low 壳卡隔簇抽取口径**（族级 Low 壳卡语言横向复核；broadleafCanopyProxy.test conifer 分支已改散列重建对账）
12. **簇卡交叉双卡 / 卡尺度 0.30–0.44 / 散生卡 2/1 / 层隙观感带 / 冠幅带外端 0.25–0.33** 等工程校准值（第二例复验后定契约候选——Step 2 Unknown 留档的层间距 1.5–2m 已探针验证 ⊂ 域；3b SDF 卡内填充率 ~27% 归族门微调位）

另记观察级（非缺口）：**冻结双帧亚像素噪声**——校准后 frozen 双帧 md5 不再逐字节同，pixel-diff pctChangedAny 0.00%（maxAbsDiff=1 单像素、质心在天空区 (1136,320)——非风动残留〔run 态 1.93% 相差两个数量级且质心在冠部〕；判读 = 卡密度上升后 alphaToCoverage 覆盖边缘亚像素抖动，不破「冻结零像素变化」判据量级）。

## 疑点触发项记录（首例全项）

1. **冠层密度（本轮唯一校准项，D30 一轮内两段深化收敛）**：首轮六帧独立判读一致偏疏——中距「sparse / branches read through / winter-dormant 观感」、近景「thin starved tufts + long bare runs」、B25 逆光「90–95% 透天、层板呈细暗线」、8 槽全景「bare-branch 观感」。**第一段回调无效**（散生针卡线密度 4→9/米：覆盖率 14.7→17%——浅调不动观感）。**根因定位**（3a 密度图 + M8 近景探针）：①莲座簇**单面卡无角度覆盖**（卡面⊥枝切向 → 边缘朝向投影近零）；②**卡尺度亚像素**（0.10–0.16m 卡在 M25 处 3–4px 不可辨——簇是「点」质量、缺「面」质量）；③枝上裸段长。**第二段回调（终版）**：莲座簇**交叉双卡**（零 rng 派生 emitOrdinal 偶奇分工）+ 卡尺度 ×3（0.30–0.44m）+ clustersL5/L4 2/1→4/3 + clusterMinSeparation 0.50→0.10 + clusterInnerStart 前移 + childPlan ts 前移（层板内圈裸枝消除）+ longShootCards 3/2→2/1（单针卡 M25 无质量贡献——预算再分配给簇）+ LOW_SHELL_STRIDE 2→3。**复判三面达成**：M25「每层读作厚实连续绿板 + 层间天空带保留（分层不闭合成实心锥）+ dense healthy evergreen」；B25 透天 90–95% → **25–35%**；M8 近景「星形莲座丛独立针叶从中心放射可辨、无粗糙棒梗、纹理精细自然」（3a 担心的星芒过粗未发生）。**量化**：冠区非天空占比 M25 14.7%→**33.0%** / B25 →**26.2%**（3a 无头 Chrome 自查，逐行天空参照口径）；High 带 32224–38382（校准前 31918–33438）仍 ⊆ ≤40000、Mid 6288–9396 / Low 1632–2578 落带；rng 快照 32507→37764（三档恒等）；皮面 28142 恒定（拓扑零变化——校准纯布点/卡参数，骨架身份断言全原值通过）。校准前后对照帧存 `calib-before/`。
2. **风动三证据（终态代码）**：① uTime 运转像素变化 M25 run 双帧 pctChangedAny **2.00%**、变更质心 (950,546) 冠部 ✓；② freezeTime 冻结 pctChangedAny **0.00%**（亚像素噪声见上记档）✓；③ 近景颤动 C7 双帧 pctChangedAny **15.84%**、86.3% 行有差异 ✓（三成分：整层慢摆 + 针簇颤 + 顶梢摆）。
3. **console 纪律**：首轮 26 帧全批 + 复拍批 + 风动补拍批，三轮回读均 **`[]`（零错误零警告）** ✓（含转台）。
4. **LOD 档间连续**：lod-levels-41m 判读**三档同树同轮廓（无收缩）同层位、细节左→右递减无断崖无坍缩** ✓；账目 High 32224–38382 / Mid 6288–9396 / Low 1632–2578 全落家族预算行（校准后带；档间恒等测试锁）。
5. **canopy 远景（产品路径）**：400m place 拉远帧——**尖塔剪影可读（pointed/tiered）、灰绿冠色、无 artifact** ✓；`distribution` 机器侧 `canopy:1` 桶（3c 通道复证）。
6. **GLSL 真实编译**：3c 已验（High/Mid/Low/Canopy 各档编译 + console 零噪声——programs 计数正向证实）。

## 校准需求：**一轮（会话内两段深化）已收敛——无第二轮**：第一段浅回调（线密度）实测无效后定位根因（单面卡角度覆盖 + 卡尺度亚像素 + 裸段），第二段终版回调后全部读数落 Spec 域内；3b SDF 卡内填充率 ~27%（剪影填充 ~55%，距 65–75% 理想带余量）记档为 012.2 族门候选微调位（几何侧预算已用满，填充增益归材质侧）。

## 复现

```bash
# 环境：Vite dev（5173）+ Chrome headless --remote-debugging-port=9333（1920×1080）
node tools/cdp.mjs tools/t0121-visual.mjs      # 首轮全套 26 帧（校准前，calib-before 源）
node tools/cdp.mjs tools/t0121-reshoot.mjs     # 校准后受影响机位 + frozen 复核
node tools/cdp.mjs tools/t0121-wind-final.mjs  # 终态风动双帧对
node tools/pixel-diff.mjs <a.png> <b.png>      # 风动对/冻结对量化
```
