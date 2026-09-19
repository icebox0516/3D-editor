# T006.2 路灯 LOD 两档视觉取证（档间色 / 形连续）

> 取证日期：2026-09-19 ｜ 资产：`asset_streetlamp`（High 328 面 / Low 136 面，≈ 41.5%）

## 取证方式

- **强制档位渲染**：临时取证页（项目根 `__t006_2_preview.html`，取证后已删）直接 `import build` 出两档
  几何，`?mode=` 参数控制呈现——high / low 单档图共用**同一机位**（相机 (4.6, 2.6, 6.6) lookAt (0, 2.0, 0)，
  fov 40°，路灯位于原点），both / both-distant 并排图（High 左 x=-1.15、Low 右 x=+1.15）。
- **浏览器截图**：Vite dev server（localhost:5173）+ agent-browser（Chrome CDP，viewport 1280×880）。
  浏览器 MCP 在子代理不可用，按任务书回退截图路径（无金丝雀问题——取证页即主视口本身）。
- **机位框界机器校验**：页面内置 `__frameCheck()` 把可见灯包围盒 8 角投影 NDC——四张图全部
  `inside: true`（整灯入画，无裁切）；单档机位下 High NDC y 带 [-0.729, 0.807] vs Low [-0.728, 0.806]、
  x 带 [-0.043, 0.175] vs [-0.040, 0.172]——投影范围几乎逐位一致，是档间剪影 / 体量连续的机器佐证。
- 渲染无 page errors（`agent-browser errors` 空）。

## 文件清单

| 文件 | 内容 |
|---|---|
| `streetlamp-high.png` | High 档单灯，固定机位（与 Low 同机位） |
| `streetlamp-low.png` | Low 档单灯，同机位（径向分段 6/6/6/4/6/6，剪影 / 体量 / 颜色分层与 High 一致） |
| `streetlamp-both.png` | 并排近景对比：左 High / 右 Low（透视机位下左右灯有远近大小差，严格档间对照看两张单档图） |
| `streetlamp-both-distant.png` | 并排远景剪影对比（Low 的实际消费距离带） |

## 判读

- 轮廓剪影（杆 + 上仰悬臂 + 灯头）两档一致；体量（总高 4.2m / 含悬臂展幅）一致；
- 颜色分层语义一致：杆件金属 / 灯壳深塑料 / 发光板暖白 emissive 两档同底色同配方
  （材质档间逐位相等另有单测锁，见 `tests/runtime/procedural/assets/streetlampLevels.test.ts`）；
- Low 舍弃的只是圆周细分（近景可见圆柱棱面化），远距下与 High 观感趋同。
