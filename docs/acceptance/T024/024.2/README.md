# T024.2 回补批一 取证（2026-09-28）

> 测试证据即本任务验收面（D30 增量口径；无 UI 入口——色点 UI 归 024.4，浏览器冒烟与
> Contact Sheet 13 树 × 全卡 / 基线帧逐位视觉证据归 024.5 验收门，沿 024.1 同口径）。

## 批一 6 树秋卡终审值（park-shader-agent 两批交付，四锚 + 冻结变奏域最坏端复核）

| 树 | 卡 | hex | hue | R−G | G−B | 加权亮度 | 证据锚 |
|---|---|---|---|---|---|---|---|
| platanus | 秋·黄褐 | #a88a44 | 42.0° | 30 | 70 | 139.0 | NC "yellow-brown" + form-c 第三眼（Spec §5/§6 @1.0） |
| koelreuteria | 秋·金黄 | #d0bc46 | 51.3° | 20 | 118 | 180.5 | NC "transparent/clear golden yellow" + wiki（@1.0） |
| sophora | 秋·金黄 | #c4a83a | 47.8° | 28 | 110 | 163.8 | NC "Gold/Yellow"（单源权威建卡裁定，@1.0） |
| triadica | 秋·绯红 | #c65e3e | 14.1° | 104 | 32 | 121.4 | NC "bright red" + autumn-a/b 红族 ~55–60% 主导（@1.0） |
| fraxinus | 秋·金黄 | #c8af3c | 49.3° | 25 | 115 | 169.4 | Spec 1.1 增量：主相金黄 45–55°（[13][15] 双照；褐黄末端不入卡） |
| salix | 秋·黄绿 | #789632 | 78.0° | −30 | 100 | 129.6 | Spec 1.1 增量：NC greenish-yellow 主相（弱秋色不造金黄；金黄上端 Unknown 不采） |

最坏端复核：六值两端复合均守目标色相域界（sophora 暖端 48.4° / platanus 冷端 46.3° 微出
锚带但守「不入橙」域界——ginkgo 体例判据为域界，记档于各表注释）。

## 测试证据（全量 4240 全绿 = 4209 + 净 31）

- 6 树材质色卡 describe（6 × 4 测：卡存在+四锚 / 缺省·default·未知→现行 / program 同键
  +GLSL 逐位+透射与 hue 端点冻结 / 三档×autumn+基调-only）——各 `*Materials.test.ts`
- 批量集成 `treePresetBatch.test.ts` 7 测（6 树 build 接线 + triadica 缓存贯通 spot：
  同槽两卡 geometry/深度同引用、两桶）
- 整表锁 `assetColorPresets.test.ts` 6 行增改（7 树双卡现势 + canopy 覆写表同源随动）
- 验证命令：`npm test`（279 文件 / 4240）、`npm run check:layers`（631）、
  `npm run typecheck`（零错）、`npm run check:tasks`（warning 53）

## 补证增量（Step R，asset-research）

- `docs/research/fraxinus-reference.md` 1.0→1.1：增量记档节 + 源表 [13][14][15]
- `docs/research/salix-reference.md` 1.0→1.1：增量记档节 + 源表 [7][8][9]（编号独立于
  fraxinus——各自 Spec 内部顺延）
