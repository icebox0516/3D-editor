# T011.1 朴树全链——固定机位视觉取证（Step 4 机器判定）

> 任务：[tasks/011.1-celtis.md](../../../tasks/011.1-celtis.md) ｜ Spec：`docs/research/celtis-reference.md` **1.0**（锚点一致，开工前校验）｜ SOP：`docs/procedural-assets/shadow-visual-sop.md` §2/§3 ｜ 判定：主代理（终态 = 材质 Step 4b 定稿后全批复拍）
> 结论：**适用项全过（2 项特征记档 + 4 项低严重度观察记档不返工）；性能分流 011.5**；console 零错误零警告；用户异议窗口开放。

## 环境

- Chrome 152.0.7977.83 headless（CDP 9333 直驱，tools/cdp.mjs）+ Vite dev（5173）｜ 1920×1080 DPR=1 ｜ WebGL2 ｜ day 预设固定灯光（sun (80,120,60) + 2048² shadow）｜ freezeTime 冻结风相位（风动双帧除外）
- 驱动面 = DEV 句柄 `window.__celtis*`（celtisStage 工厂，bootstrap 组合根装配；DEV=正式同源深度材质——celtisStage 测试锁同一实例）
- 视觉核验链路（如实记档）：本机 Read 走 CDN 转存 → 多模态图像分析 MCP（analyze_image）结构化提问（与 Spec 调研同链路，终态会话 13 帧核验成功）；像素级判据 = 零依赖 pixel-diff.mjs + 离屏着色器探针 t0111-leafprobe.mjs（256px 正交单片叶 readPixels 数值分析）

## 十项检查单判定表

| # | 检查项 | 判定 | 证据图 | 结论摘要 |
|---|---|---|---|---|
| 1 | 树种辨识度 | **✓** | vis-near/mid/far-*.png + macro-oak-2p8m-el20（对照） | 宽圆穹顶开张冠 + 浅灰干 + 中绿偏黄叶团 + 近距卵形急尖叶 + faint 三出脉——特征组合对照 Spec §1/§4 指向朴树非「通用一棵树」；macro-oak 并排对照：朴树圆穹收束细密叶团 vs 夏栎宽展开张裂叶团，两树种语言明确分化（非换色复用） |
| 2 | 树形自然度 | **✓** | vis-near/mid/far-*.png | 三距离轮廓连续无秃块、冠缘不规则、无几何原型感、主干近直立锥度平滑；slot-0 冠幅/实高 0.862 ∈ 照片域 0.8–0.9 |
| 3 | 枝干结构 | **✓** | vis-near-12m / vis-backlight-25m / crown-7m | 4–5 级可辨（主干→骨架→次枝→末梢）、粗细逐级递减无跳变、主次分级明显（rank 势差）、叶着生末梢无悬浮/穿帮叶卡 |
| 4 | 叶片叶簇结构 | **✓（齿记档）** | macro-2p4m / leaf-closeup-3p5m / crown-7m | 簇团离散+间隙+外密内疏 ✓；卵形+最宽点偏基（v≈0.40）+急尖先端 ✓、长宽比域 1.3–2.0 ✓；**中脉+三出脉 faint but present**（宏观与 3.5m 双确认；探针 +13.9% ≥12% 判据）；**叶缘齿掩码级实现经像素探针证实**（幅度 0.060 = 坡宽×75% 防闪烁顶格），但取证分辨率下视觉模型不可辨——±3px@100px 叶 = 真实齿深 ≈2.4mm@8cm 叶的物理等价投影（参考照片手持 0.3m 特写才显见），不为可见度做超真实放大——记档，异议窗口开放 |
| 5 | 冠层空隙 | **✓** | vis-backlight-25m / celtis-backlight-25m / shadow-22m | 逆光透枝可辨、透光色暖绿不泛白、地影斑驳非整块、无挖空整层 |
| 6 | 材质真实度 | **✓（两记档）** | bark-2p6m-az35/110 / bark-low-shaded-3p2m / macro-* | 皮：浅灰主调/平滑-浅裂小斑块**低浮雕**/干上部更平滑更浅/低位背阴面 4/4 过（vs 橡树脊沟语言明确分化）；叶：两面区分 faint（背浅灰绿+哑光差）、光泽感、无破面无闪烁。记档①：暗部叶 25–30%（橡树同口径 15–20%——透射 0.30 vs 0.65 物种方向，Spec Inferred 近革质透光弱）；记档②：苔痕「几乎不可察」（Spec 少量——边缘过非阻塞，候选微调 011.5） |
| 7 | 风动自然度 | **✓** | wind-run/frozen-frame-*.png + wind-demo-3trees | ①运转双帧 0.97% 像素变化（>8 差异 0.44%，质心 (939,499)=冠部）②冻结双帧 pctChangedAny=0 / Gt8=0（逐位 0 变化）③三树 aSeed 相位互异（celtisStage 测试断言 + demo 存档照） |
| 8 | 阴影 | **✓** | shadow-22m-az215 / shadow-closeup-15m-el3 | SDF 裁切影：影内透光斑驳可辨、影缘叶团簇破碎（非矩形/非整卡剪影）、影轮廓与宽圆穹冠对应、影基不分离；Ghost 分口径（产品路径）归 011.5 |
| 9 | 形态差异 | **✓** | slots-panorama-42m / slots-panorama-50m-wide | 8/8 槽读向各异（歪斜散枝/宽扁/高穹/下垂疏枝/…）且全部仍读作朴树（同种语言一致）；50m 宽幅修正 42m 版右缘裁切；伪差异禁止项排除：皮面数槽间恒等 24178 + rng 消费恒等 + ≥3 维连续参数实测可分（celtisShapeSlots 测试锁，009.3 纪律） |
| 10 | 性能 | **分流 011.5** | — | 产品路径棵数阈值表 + 资源契约五条 + Shadow A/B 归 epic 验收门（§4 口径）；本任务面数账目已锁预算带（下表） |

## 面数/预算账目（8 槽 × 3 档，celtisLod 测试 + 页内 stats() 双口径）

| 档 | 实测带 | 家族行预算 | 判定 |
|---|---|---|---|
| High | 31556–39366（slot-0 39366 = 皮 24178 + 叶 15188/卡 7594） | ≤ 40000 | ✓（贴上限余量 634 面，确定性数值） |
| Mid | 6782–9262 | 6000–10000 | ✓ 全带 |
| Low | 2154–2758 | 1500–3000 | ✓ 全带 |

档间不变量（测试锁）：三档 rng 消费恒等（slot-0 快照 155072）、簇表跨档全等、Mid 存活卡 ⊂ High 逐位、minY 三档恒 0、皮恒 24178/4514/370。slot-0 锚点：总高 8.57 ∈ 锚域 7.5–8.8、视觉冠底/实高 0.363 ∈ 0.35–0.45（8 槽带 0.30–0.45 = 终审「个体差异幅度大」口径的槽维度展开）。

## LOD 档间连续（附加取证）

lod-levels-32m（三档同点全景：轮廓/体量/颜色一致无身份跳变，mid→low 渐进无断崖）+ lod-levels-far-60m + level-{high,mid,low}-25m 逐档 + level-low-50m（Low 远距口径：圆穹剪影完整/干色浅灰可辨/团块色域有层次——Spec §7 牺牲顺序正确）。

## 材质校准记档（Step 4 → Step 4b 两轮，叶脉/齿可见度）

1. 首轮交付：齿幅度 0.040/中脉权重 0.50——宏观不可辨（视觉模型 + 探针 +6.5% 实测）。
2. **Step 4**（park-shader-agent）：齿幅度 0.040→0.060（峰值 0.030 = 坡宽×75% 顶格）+ 载波规则度 0.75→0.80 + 脉权重上调（中脉 0.85/三出 0.65）。
3. **Step 4b 定稿**（新实例）：脉色 (1.28,1.19,0.74)→(1.62,1.34,1.00)（R 主推抗输出裁切）+ 中脉满权 + 带半宽 (0.008,0.030)→(0.012,0.040) + 三出脉带加宽 + 齿门控收窄 (0.42,0.56)→(0.48,0.56)（下半近全缘身份二分更锐）；齿幅度/pow/密度三选项否决理由与物理论证记档于 celtisMaterials.ts 模块头 Step 4b 段。
4. **终测**：离屏探针中轴亮度差 6.5%→**13.9%**（判据 ≥12% ✓）；宏观 + 3.5m 特写均「faint but present」✓；权重/门控级零新增指令，叶 High 成本 11.5× 不变。

## 观察项（记档不返工，异议窗口覆盖）

1. 主干中段暗色纵带（vis-near 12m，低严重度）：中远景不可辨，011.5 混植检视顺带复核
2. 12m 树皮细节读向偏少：朴树皮型本为平滑-浅裂低浮雕（Spec Verified），语义正确；T26 双方位浮雕可辨
3. 外缘叶簇密度均匀化（低）：簇位撒布均匀性读向，个体差异已由 8 槽密度维度表达
4. 苔痕几乎不可察：见检查项 6 记档②

## console 纪律

主取证批次注入 error/warn 收集器全程收集，批末回读 **`[]`（零错误零警告）** ✓——材质/深度材质/阴影通道编译干净。

## 复现

```bash
# vite dev 5173 + Chrome headless CDP 9333 后：
node docs/acceptance/t011/011.1/tools/cdp.mjs docs/acceptance/t011/011.1/tools/t0111-visual.mjs   # 主批次（十机位+风动+8槽+LOD+console）
node docs/acceptance/t011/011.1/tools/cdp.mjs docs/acceptance/t011/011.1/tools/t0111-macro.mjs    # 宏观特写+橡树对照
node docs/acceptance/t011/011.1/tools/cdp.mjs docs/acceptance/t011/011.1/tools/t0111-leafprobe.mjs # 离屏着色器探针（齿/脉数值判据）
node docs/acceptance/t011/011.1/tools/cdp.mjs docs/acceptance/t011/011.1/tools/t0111-final.mjs    # 宽幅8槽+低位树皮
node docs/acceptance/t011/011.1/tools/pixel-diff.mjs <a.png> <b.png>                              # 风动双帧像素判定
```

- 三门槛（终态）：`npm test` **2746 全绿**（基线 2657 +89：celtisStructure 14 + celtisLod 7 + celtisShapeSlots 11 + celtisMaterials 36 + celtisStage 21）/ `check:layers` **475**（465+10）/ `typecheck` 零错——夏栎/GLB/旧资产零回归（既有测试全绿即证；基线测试文件仅动四处 30s→120s 超时上限，断言语义零变化——套件并行负载增长后 30s 余量不足的基建修正，记档）
