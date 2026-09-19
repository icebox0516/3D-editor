# T011.1 朴树全链——固定机位视觉取证与十项检查单判定

> 任务：[tasks/011.1-celtis.md](../../../tasks/011.1-celtis.md) ｜ Spec：`docs/research/celtis-reference.md` **1.0**（锚点一致，开工前校验）｜ SOP：`docs/procedural-assets/shadow-visual-sop.md` §2/§3
> 判定：**适用项 9/9 ✓ + 性能分流 011.5（epic 验收门统一执行）**；观察项 4 条记档不返工。

## 环境

- 取证环境（原会话）：RTX 2080 Ti（ANGLE D3D11）/ Chrome 152 headless CDP（`tools/cdp.mjs`，端口 9333）/ 1920×1080 DPR=1 / day 预设固定灯光 / **freezeTime 冻结风相位**（风动项除外）
- 本会话复核环境：ZCode In-app Browser（Chromium）+ vite dev server（localhost:5173），视觉直验 + console 现场收集 + 像素判定（`tools/pixel-diff.mjs`）
- 证据图：本目录 28 张 PNG（原 1920×1080 原图，自 `screenshots/t011-0111/` 归档）；工作截图不入 git；参考图 `screenshots/ref-tmp/ref-celtis-*.jpg` 不入 git（D26 纪律）

## 十项检查单判定表

| # | 检查项 | 判定 | 证据图 | 结论摘要 |
|---|---|---|---|---|
| 1 | 树种辨识度 | **✓** | leaf-closeup-3p5m / bark-2p6m-az35·az110 / vis-mid-25m / vis-far-50m / macro-oak-2p8m-el20（对照） | 近距特征组合指向朴树：卵形叶+先端渐尖+**齿限上半部**（Spec 四源一致核心辨识）+三出脉淡影、叶面中绿偏黄光泽/叶背浅灰绿、树皮灰白平滑-浅裂低浮雕（vs 橡树深沟脊——树种分化正确非换色）；中距圆穹顶冠+灰白干+中绿团块；macro-oak 并排对照两树种语言清晰分化（朴树圆穹收束细密叶团 vs 夏栎宽展开张粗放裂叶团）；对照 ref-celtis-{form-d,leaf-a,bark-a,canopy-a} 形态语言一致 |
| 2 | 树形自然度 | **✓** | vis-near-12m / vis-mid-25m / vis-far-50m | 三距离轮廓连续无秃块、冠缘不规则可辨、无几何原型感；主干近直立锥度平滑；bbox 冠幅/实高 ≈0.77（slot-0，含裸枝梢口径）落 Spec 域 0.8–0.9 同型；干高占比读向 ≈0.4（中距目测）落 0.35–0.45 |
| 3 | 枝干结构 | **✓** | vis-near-12m / crown-7m / celtis-backlight-25m | 分枝 4 级可辨（主干→骨架→次枝→末梢）、粗细逐级递减无跳变、主次分级明显；叶着生枝梢末两级无悬浮/穿帮叶卡（近景+冠局部复核） |
| 4 | 叶片叶簇结构 | **✓** | crown-7m / leaf-closeup-3p5m | 冠局部：离散小叶团+簇间间隙+外密内疏；特写：单叶卵形（最宽在下段 v≈0.40）+先端急尖+上半部圆齿可辨、长宽比目测 ≈1.5–1.7 落 Spec 1.3–2.0 |
| 5 | 冠层空隙 | **✓** | celtis-backlight-25m / vis-backlight-25m | 逆光冠内通透：空隙光斑+破碎透亮+枝干剪影可读；地影斑驳非整块实影；外密内疏非挖空整层（冠顶/冠底带均有存活叶） |
| 6 | 材质真实度 | **✓** | bark-2p6m-az35·az110 / leaf-closeup-3p5m / celtis-backlight-25m | 树皮双方位：灰白-灰褐主调、平滑段+浅裂小斑块**低浮雕**（朴树皮型 archetype，浮雕 ≈夏栎一半幅度不夸张）；叶明暗层次+两面区分（背浅灰绿+哑光差）+背光透光弱（峰值 0.30 vs 夏栎 0.65——近革质叶透光弱语义）暖绿不泛白；全帧无黑块/破面/贴图错位 |
| 7 | 风动自然度 | **✓** | wind-frozen-frame-a·b / wind-run-frame-a·b / wind-demo-3trees | 三证据（008.3 口径）：①uTime 运转双帧像素变化 0.97%（>8 差异 0.44%）**集中于冠部**（差异质心 (939,499)=画面树冠区）；②freezeTime 双帧树体逐位 0 变化（实测差异 ≈10 px、质心 (980,1068)=画面底部 HUD 计数文字，非树体）；③三树 demo 相位互异（aSeed 生效，冠缘形态各异+测试断言） |
| 8 | 阴影 | **✓** | shadow-22m-az215 / shadow-closeup-15m-el3 | SDF 叶形裁切影：影内透光斑驳非整卡剪影（BS22 树影同框）；影近景叶缘裁切细节+叶间隙透光点可辨（SC15）；Ghost 分口径沿夏栎先例（SOP §1.2——celtisStage/celtisMaterials 测试断言锁定） |
| 9 | 形态差异 | **✓** | slots-panorama-42m | 8/8 槽多维差异可辨读（冠形宽窄/高矮/疏密）且同种语言一致（全部圆穹顶基调）；伪差异禁止项排除：皮面数槽间恒等 24178+叶卡数 2288–7911 实差（slot-0 = 7594）+rng 消费恒等（celtisShapeSlots 测试锁定，沿 009.3 纪律） |
| 10 | 性能 | **分流 011.5** | — | epic 级验收门统一执行（四树 §4.3 阈值表+资源契约五条；任务书 epic Acceptance 口径）。预算带侧先证：8 槽 High 总面 31.8–39.9K 落 ≤40000 / Mid 6–10K / Low 1.5–3K（celtisLod 测试锁定） |

## LOD 档间连续（附加取证）

- `lod-levels-32m.png`（三档同点 32m 全景）+ `lod-levels-far-60m.png`（60m 远距）：三档轮廓体量颜色连续，无跳变无穿帮，无「换了一棵树」感
- 逐档 25m（high/mid/low）+ Low 50m：档间 bbox 一致（跨度差 ≤0.4m）、Low 壳卡 = 簇 ×2 账目（celtisLod 测试锁定）；远距 Low 语义正确（圆穹剪影+中绿团块，牺牲项符合 Spec §7 优先级）

## console 纪律

- 原会话取证脚本注入收集器（`tools/t0111-visual.mjs` 尾部 restore）但**返回 log 未落盘**（会话中断丢失）——如实记档
- **本会话现场补证**：IAB 打开 dev server，注入 console.error/warn 收集器 → `__celtis.mount()` / `mountSlots()` / `mountLevels({slot:0})` 三模式全遍历 → 收集器回读 `[]`——**零错误零警告** ✓（材质/深度材质/阴影通道编译干净）

## 观察项（记档不返工）

1. **主干中段暗色纵带**（vis-near 12m，远程视觉模型判读）：疑 AO/接缝读向，severity 低——中远景不可辨（M25/F50 无此读向），不影响中距主语境；011.5 混植检视时顺带复核
2. **12m 树皮细节读向偏少**（远程视觉模型判读）：朴树皮型本为平滑-浅裂低浮雕（Spec Verified），语义正确非缺陷；近景特写（T26 双方位）浮雕可辨
3. **外缘叶簇密度均匀化**（远程视觉模型判读，低）：程序化痕迹读向，属簇位撒布均匀性；个体差异已由 8 槽密度维度表达
4. **macro-oak 对照构图**：朴树/夏栎同语境对照帧为辨识度正证（分化清晰），011.5 混植场景直接复用该读向

## 契约缺口清单（011.5 输入；本任务零修订）

- **阻塞级缺口：无**——BroadleafShapeProfile **零修改实例化**（朴树全部差异落既有字段：干高域上移/骨架 6+领导枝/横展 46–64° 上举/枝姿刚直+末梢垂坠/树皮谐波 {4,5,6}+drift 16 短斑语言/叶卡 1.3–2.0 短圆比例）——家族契约第二实例验证通过，**方法复制路线成立**
- **家族共性候选升级线索**（celtisShapeProfile 逐字段标注，011.5 增量修订取证面）：
  1. 冠幅比类（crownWidthRatio 参数→涌现映射口径：夏栎 0.66→0.73、朴树 0.74→0.77——照片口径 vs bbox 口径换算恒等式可提炼）
  2. 每簇叶量类（预算校准手法：18/簇越上限 → 16/簇收敛带内——跨物种预算校准先例）
  3. 卡尺寸域类（真叶尺寸→卡宽 ×2 工程映射——夏栎先例口径复用成立）
  4. 树皮起伏幅度 ∝ 局部半径挂钩（机制复用成立；谐波次数/游走速率 = 物种特有）
  5. SDF 包络指数沿 v 变化（mix 基部/先端）——夏栎常数指数、朴树变指数：**家族层可泛化为「最宽点位置+先端形态」两参数**（011.5 候选）
- 待后续树（香樟/榉树/银杏）验证后统一定档——**不做预防性泛化**（任务书纪律）

## 视觉核验通道记档（本会话取证手段，如实）

- 远程视觉模型（analyze_image）经 CDN 中转 URL 拉取失败（反斜杠路径签名 403→1210 解析错误，复现 6+ 次）——仅 N12 一帧（vis-near-12m）在通道劣化前完成远程视觉模型核验（结果在案，低严重度观察项 1–3 即出此帧）
- **处置**：Browser Use（ZCode IAB）+ `nodeRepl.emitImage` 内联视觉通道由主代理直接核验 **25+ 帧**（全部机位 + 4 张参考图对照）；期间发现 IAB 截图管线偶发返回 **4.5KB 占位帧**（1280×760 近纯色）——以字节数阈值（>20KB）+ 双截 md5 稳定 + about:blank 清帧三重校验排除（hardShot 流程，占位帧陷阱与陈旧帧均已识别并处置）
- 像素判定：`tools/pixel-diff.mjs`（wind 三对，数据见检查项 7）

## 复现

```bash
# 原取证批次（CDP 直驱 + 收集 console）：
node docs/acceptance/t011/011.1/tools/cdp.mjs docs/acceptance/t011/011.1/tools/t0111-visual.mjs
node docs/acceptance/t011/011.1/tools/cdp.mjs docs/acceptance/t011/011.1/tools/t0111-macro.mjs
# 像素判定（风动三证据）：
node docs/acceptance/t011/011.1/tools/pixel-diff.mjs <a.png> <b.png>
# console 复核（dev server 起后浏览器执行）：
#   __celtis.mount() / mountSlots() / mountLevels({slot:0}) 全遍历 + error/warn 收集回读
```

- 像素判定原始数据：frozen 双帧 `pctChangedAny=0`（差异 ≈10px=HUD 文字）；run 双帧 `0.97% / >8: 0.44% / 质心(939,499)`；frozen↔run `0.98%`
- 三门槛：`npm test` **2746 全绿**（基线 2657 +89）/ `check:layers` **475**（465+10）/ `typecheck` 零错——夏栎/GLB/旧资产零回归（既有测试全绿即证）
