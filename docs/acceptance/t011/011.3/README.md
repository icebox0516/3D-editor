# T011.3 榉树视觉验证取证（D30 增量口径首跑）

> 任务：[tasks/011.3-zelkova.md](../../../tasks/011.3-zelkova.md) ｜ Spec：[docs/research/zelkova-reference.md](../../../docs/research/zelkova-reference.md) 1.0 ｜ 口径：SOP §5 Step 4 单资产层（D30）——三必做 + 疑点触发项，非十项全量
> 环境：Chrome 153.0.8010.52 headless（CDP 9333 直驱，tools/cdp.mjs）+ Vite dev（5173）｜ 1920×1080 DPR=1 ｜ WebGL2 ｜ day 预设固定灯光 ｜ freezeTime 冻结风相位（风动双帧除外）｜ asset_tree_zelkova slot-0 锚点（High 36820 面）

## D30 三必做结论

### ① Spec 身份判定 —— **通过（特征组合指向榉树，不依赖标注）**

| 距离档 | Spec §7 判据 | 判定 | 证据 |
|---|---|---|---|
| 近距 | 卵形渐尖叶 + 全缘尖锯齿 + 羽状脉直伸齿尖 + 叶基偏斜 + 两面深/浅绿 + 树皮光滑基底 + 奶油-锈橙剥落斑 15–30% | ✓ | leaf-closeup-3p5m / macro-2p8m×2 中性判读：ovate、tip acuminate、**base asymmetric 多叶可辨**、**sharp 单锯齿布全缘 ~10–20 齿/侧**、**pinnate 侧脉斜伸达缘**；干腰探针帧判读：光滑灰绿基底 + **奶油/浅棕斑 20–30%（落 Spec 域）+ 橙棕/锈橙斑少量存在 + 斑片剥落读向 + 斑径 1/8–1/5 干宽**（probe-bark-trunk-el35d8/el30d5） |
| 中距 | vase 冠形 + 开张上拱骨架枝剪影 + 细质密叶 + 剥落斑驳主干 | ✓ | baseline.png 中性判读：**vase/oval 冠最宽位于冠高 60–70% 段、上宽下窄**；骨架 5–6 枝开张后上拱；fine texture 细质叶；灰绿干 |
| 远距 | 上宽下窄 vase 剪影 + 中绿-深绿色块 | ✓ | vis-far-50m 判读：**冠中部最宽、向上收窄、基部窄于中段**（vase 读向成立）；读作 elm-like（榆科近缘——方向正确，非 oak/poplar/cone）；「airy/open patchy」读向与 Spec 细质通透（空隙 20–35% 三树最疏端）一致，见疑点记档② |

**榆科叶三件套（偏斜基/尖锯齿/脉入齿）+ vase 冠 + 暖色剥落斑驳皮三重身份组合成立**——vs 三先例分化明确（脉型三分化完成：朴三出脉/樟离基三出/榉纯羽状；树皮第四语言：唯一带橙锈新斑）。

### ② 统一基线帧 —— `baseline.png`（M25 = 25m/35°/8°，day 预设 + freezeTime）

Step 4b 校准后终态复拍版在位（全族同参数同源，011.5 族门横向比较基线 + 用户观感复核窗口）。

### ③ 契约缺口记档（本任务零修订，归 011.5）

- **A（继承实证，011.1/011.2 已记不重复立项）**：偏冠相干方位偏置 / 干长比率字段化 / 冠幅比涌现映射 / 起伏∝半径挂钩
- **B（011.2 已记）**：常绿语义位 / 叶族公共 specular·envMap / 树皮沟内层次——榉树无新增证据
- **C（本任务新增观察级）**：①椭球密度场参考系 vs 上宽冠形近似（低冠区叶量几何驱动为主，若族门判冠基过疏可议非对称参考系扩展）；②局部斑片状树皮起伏无专用通道（斑驳身份由材质色层承担，几何起伏近似「贴片感」够用）；③二列叶序（distichous）未表达（Spec Unknown 未验，近景叶姿需求出现时属家族级簇内朝向扩展）
- **D（本任务新增，取证工具面）**：**门控型树皮语言的取证机位适配**——zelkova 斑驳有 2.2–4.6m 高度门控（满斑区在干腰 <2.2m），而 Stage `view()` 注视点恒为冠心 5.3m → SOP 标准 T26 机位（2.6m/35°/−15°）画面覆盖 3m+ 弱化区+细枝，**拍不到满斑干腰**（camphor/celtis 树皮无高度门控全高同质，先例未暴露此缺口）。本任务处置：补 el−35° R8m / el−30° R5m 仰视探针帧入档；族门记档：Stage 低目标机位能力（view 任意 target 高参数）或 SOP T26 低干变体口径
- **E（几何侧记档）**：slot-3 偏冠质心 0.71m/×1.40 弱于香樟 ×1.66 锚（强 upturn 下 rank 乘子回调所致）——011.5 横向复核偏冠可辨性

## 疑点触发项记录（D30：按疑点驱动，不跑全量十项）

1. **风动三证据**（新参数面：短柄硬叶快颤 16–25Hz/≤8mm vs 先例 2.2–3.7Hz/11mm）：
   - ① uTime 运转像素变化：run 双帧 pctChangedAny **0.86%**、变更质心 (953,599) 冠部 ✓（pixel-diff）
   - ② freezeTime 冻结逐位 0：frozen 双帧 pctChangedAny **0.00**（较 011.1/011.2 更干净——无 HUD 残留）✓
   - ③ aSeed 相位互异：zelkovaStage 测试锁（mountWindDemo aSeed 互异断言）✓
2. **LOD 档间连续**（Mid 含齿 SDF 新降档语义）：lod-levels-32m 三档全景 + 逐档 25m + Low 50m——中性判读（B25 同批）无身份跳变信号；**首轮脚本 API 误用**（view() 覆盖 viewLevel 注视点致 mid/low 帧同帧，md5 查出）→ t0113-lod-retake.mjs 重拍 4 张全异 ✓（SOP §3 纪律 4 截图竞态防误判执行记录）
3. **树皮斑驳双弱疑点 → 校准一轮（D30 护栏内）**：
   - 发现：T26 帧像素探针暖斑占比 0.0000 + 1.2m 特写判读斑径 1/10–1/15 干宽、覆盖 5–8%、无锈橙
   - 根因（主代理诊断）：斑域频率 (11,14)（uv.y=弧长×0.5 米域）→ 晶胞 ~7cm 在 2.6m 机位 ≈5px 被磨平 + 三色带锈橙端 P(tone>0.735)≈15% × 26% ≈ 4% 面积不可辨；噪声分布/注入链/USE_UV 均核实正常（非渲染缺失）
   - 校准（park-shader-agent 一轮）：频率 (11,14)→(6,5)（斑径×3–4）、软阈值 (0.60,0.68)→(0.62,0.72)、三色带阈值重排（锈橙出现率提升）、锈橙乘子对比 ×1.33、Low 均值化乘子采样重算 (1.036,0.987,0.941)→(1.025,0.980,0.937)——38 材质测试同步
   - 复测：干腰探针帧中性判读**奶油/浅棕斑 20–30%（落 Spec 域 15–30%）+ 锈橙少量 + 剥落片状读向** ✓；锈橙面积 4.5%→6.0%（值噪声分布能力上沿记档，单斑屏幕像素量升约一个量级——可辨性主力）
4. **密度读向疑点（不触发校准，记档）**：B25 逆光判读空隙 ~40–50%、F50 判读「airy」——高于 Spec 照片域 20–35%。裁定不校准：视觉读数含细质小卡碎读向 + 透光最强（0.40 三资产最高）+ 冠缘破碎成分，机器侧设计值带内（存活卡率 0.55、canopyDensity 0.78、簇壳覆盖 ≈72%→空隙 ≈28%）；密度上调动几何 profile 有预算带上探风险（slot-7 已 37.5K/40K）；**011.5 族门横向同源基线比较时复核**（对照三先例密度读向定量）
5. **console 纪律**：主批次 + 校准终态复拍两轮全批收集回读均 **`[]`（零错误零警告）** ✓

## 探针与工具记档

- 像素探针对准失败记档（如实）：bark 探针固定几何窗在 T26 帧（0.0007）与干腰仰视帧（0.4%）均未对准树干带（画面构图 = 仰角透视 + 门控分区 + 冠层遮挡，几何猜窗不可靠）——**以三层证据收口**（噪声分布 JS 复算 P≈26%/33% 数学正确 + 材质测试锁参数 + 中性视觉判读干腰落域 20–30%）；教训：门控型树皮的探针窗应由判读给坐标或裁剪帧判读，不用几何猜窗
- 风动双帧/LOD 重拍/干腰探针帧均 md5 校验唯一（SOP §3 纪律 4）

## 复现

```bash
# vite dev 5173 + Chrome headless CDP 9333 后：
node docs/acceptance/t011/011.3/tools/cdp.mjs docs/acceptance/t011/011.3/tools/t0113-visual.mjs      # 主批次（10 机位+风动+8槽+LOD+console）
node docs/acceptance/t011/011.3/tools/cdp.mjs docs/acceptance/t011/011.3/tools/t0113-lod-retake.mjs  # LOD 逐档（viewLevel 修正版）
node docs/acceptance/t011/011.3/tools/cdp.mjs docs/acceptance/t011/011.3/tools/t0113-barkcloseup.mjs # 1.2m 干特写（校准前证据）
node docs/acceptance/t011/011.3/tools/cdp.mjs docs/acceptance/t011/011.3/tools/t0113-trunkview.mjs   # 干腰仰视探针帧（门控区取证）
node docs/acceptance/t011/011.3/tools/cdp.mjs docs/acceptance/t011/011.3/tools/t0113-retake.mjs       # 校准终态复拍（D30：受影响机位+baseline）
node docs/acceptance/t011/011.3/tools/pixel-diff.mjs <a.png> <b.png>                                  # 风动双帧像素判定
node docs/acceptance/t011/011.3/tools/t0113-barkprobe.mjs                                             # 暖斑像素探针（窗口失准记档见上）
```

- 三门槛（终态）：`npm test` **2945 全绿**（基线 2850 + 95：zelkovaStructure/…Lod/…Materials/…ShapeSlots/…Stage + 入口/路由/基线四处扩）/ `check:layers` **496** / `typecheck` 零错——夏栎/朴树/香樟/GLB/旧资产零回归（既有测试全绿即证）；家族契约文件零触碰
- 进程清理：Chrome CDP 9333 + vite 5173 会话尾停（AGENTS.md 进程纪律）
