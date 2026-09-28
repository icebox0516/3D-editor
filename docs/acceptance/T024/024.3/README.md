# T024.3 回补批二 取证（2026-09-28）

> 13 树卡集全量收官 + Contact Sheet（024.2 遗留承接）。本目录 = 批二材质终值表 +
> Contact Sheet 基线帧/拼图 + console 取证；024.5 验收门横向一致性面直接消费本套证据。

## 批二 4 树秋卡终审值（park-shader-agent 两批交付，四锚 + 冻结变奏域最坏端复核）

| 树 | 卡 | hex | hue | R−G | G−B | 加权亮度 | 证据锚 |
|---|---|---|---|---|---|---|---|
| tree3a | 秋·黄褐 | #99792b | 42.5° | 32 | 78 | 121.7 | Forestry England「叶秋转黄褐」Verified + Spec §6 季节联动 + form-b 老树秋色整树（@1.0） |
| celtis | 秋·黄 | #b89c38 | 46.9° | 28 | 100 | 153.0 | OSU "yellow leaf fall color" + 温州秋色照片黄橙棕 + §6 季节联动 Verified（@1.0）——黄主相不入橙红 |
| zelkova | 秋·橙铜 | #c4804a | 26.6° | 68 | 54 | 142.2 | OSU 秋色变幅「黄、黄/橙铜、橙、红、红紫」+ 11 月双样木主体橙-橙红 60–70%（@1.0）——变幅宽/残绿不可表达记档 |
| bischofia | 秋·红橙 | #c57551 | 18.6° | 80 | 36 | 136.8 | Spec 1.1 增量：文献四源红相裁决（浙农林期刊「11 月中旬-12 月上旬｜红」+ 百度百科园艺 + 双新闻源）+ iNat 杭州双帧红相直证——峰相红-红橙基调 |

最坏端复核：tree3a / celtis 两端复合偏黄向方向记档（守黄褐/黄主相域界）；zelkova 双端均
守域（27.2° / 28.9°）；bischofia 冷端 19.4° / 暖端 21.7°——与 triadica 猩红（14.1°）变奏
全域 hue 差 ≥5.3° 且亮度差 ≥12.7，双轴出邻域（种间分离专项：hue +4.5° / R−G −24 /
亮度 +15.4 三轴分离，硬要求达成）。

## 秋色谱系横向可辨（终审核对，M1 报告）

- tree3a #99792b vs platanus #a88a44：同黄褐域异档（亮度 121.7 vs 139.0，更深褐一档）；
  与 triadica 同亮度带但 hue 42.5° vs 14.1° 强分离。
- celtis #b89c38 vs sophora #c4a83a：金黄段近档（亮度 153.0 vs 163.8 深一档）。
- zelkova #c4804a：橙-铜橙 26.6° 恰落 celtis 黄 46.9° ↔ triadica 绯红 14.1° 三分化中点。
- bischofia #c57551：红橙 18.6° 恰落 zelkova 橙 26.6° ↔ triadica 绯红 14.1° 之间——
  红橙谱系四分：celtis 黄 46.9° → zelkova 橙 26.6° → 重阳木红橙 18.6° → 乌桕猩红 14.1°。

## Step R 补证（bischofia 秋色，asset-research）

- `docs/research/bischofia-reference.md` 1.0→1.1：append-only 增量记档节 + 源表 [8]–[12]
  （期刊 [8] / 百度百科园艺 [9] / 浦东发布 [10] / 江苏网 [11] / iNat 秋季交叉 [12]）。
- 结论：**红相（红-红橙）裁决成立**——1.0「黄主导」重定位为 11 月中旬变色中段过渡态
  （fruit-b 照片单点如实并记）；时序窗口 = 变色起 ≈11 月中旬 → 峰 ≈11 月下旬-12 月上旬。
- 通道事故记档于增量节（Wikipedia 六通道合计超时 / 百度百科 WebFetch 403→agent-browser /
  GLM-4.5V MCP 不可用改会话目判双问——架构偏差已记档）。

## Contact Sheet（13 树 × 全卡，统一基线帧 M25）

- 工具：`tools/`（cdp.mjs 驱动 + contact-shot.mjs 拍帧 + montage.mjs 拼图 + shot-montage.mjs
  截图；复制自 t011.13 体例，screenshot 增 captureBeyondViewport）。
- 产品路径：`window.__tree3aPerf.place({assetId, count: 1, seedBase: 1, spacing: 11,
  jitter: false, preset?})` → BatchCommand → SceneSync → Pool → 缓存分桶（024.1 全链）；
  `view({distance: 25, azimuthDeg: 35, elevationDeg: 8})` 统一机位。
- 帧清单：`frames/`（13 × default + 11 × autumn = 24 帧）；拼图 `contact-sheet-13.png`。
- 判据：default 与 autumn 同树对照可辨、跨树秋色谱系可辨；console 零错误零警告
  （contact-shot.mjs 全批收集）。
- 风动 uTime 未冻结记档：perf 句柄无 freezeTime——M25 距离缓摆 ≤4.5cm 顶部幅、帧间
  身份与色相不受影响（色卡可辨性判据不受风相位影响）。

## 测试证据

- 三树 + bischofia 材质色卡 describe（各 4 测：autumn 四锚锁 / 默认卡零变化结构锁 /
  program 不增三档锁 / 三档×autumn 基调-only）——各 `*Materials.test.ts`
- canopy drift-lock：broadleafCanopyMaterials.test.ts（SPECIES_LEAF_AUTUMN 扩至 11 树）
- 批量集成 `treePresetBatch.test.ts`（批一 6 树 + 批二 4 树 build 接线参数化 + triadica
  缓存贯通 spot 不重跑——机制树无关，批内参数化即接线证明）
- 整表锁 `assetColorPresets.test.ts`（13 树终态卡集全量 + canopy 覆写表同源随动）
- DEV 驱动面：`tests/app/tree3aPerf.test.ts` T024.3 扩展双锁（place 携 preset 逐枚落盘 +
  缺省/'default' 均不落盘）
- 验证命令：`npm test`（全量）、`npm run check:layers`、`npm run typecheck`、
  `npm run check:tasks`（终值见任务书完成记录）

## 常绿两树终态裁定（不建卡记档）

- camphor：default 单卡——秋相证据为「基调不变 + 斑驳叠加信号」（Spec §5「全年常绿基调
  不变，斑驳是叠加信号」深秋老叶 15–25% 黄绿斑驳 Verified），非整冠基调移动、不可经
  材质基调变体表达（斑驳亦不可经变奏承载——变奏域跨卡冻结 = program 不增红线）；不派
  Step R（表达性裁定非证据缺口）。
- ligustrum：default 单卡——无秋色相（Spec 无秋色记录 + 冬季四样木 12–2 月满叶浓绿
  Verified = 秋色相不存在的正面证据）；不派补证（缺证相不存在的镜像情形）。
- 材质文件零 diff（无卡即无参数化）；meta 注释终态裁定记档（asset_tree_camphor /
  asset_tree_ligustrum）。
