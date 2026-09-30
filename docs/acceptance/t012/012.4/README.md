# T012.4 白皮松 Step 3c 交付记录（DEV 出图面 + 物种表回填 + 像素量化 · 2026-09-30）

> 执行：threejs-runtime-agent。环境：vite 5183（会话自建自清）+ Chrome headless CDP 9333（1920×1080，WebGL2 / NVIDIA，会话自建自清）+ `../012.2/tools/cdp.mjs` 直驱管线复用（012.3 同款）。

## 1. 交付件

| 件 | 说明 |
|---|---|
| `src/runtime/procedural/tree/bungeana/bungeanaStage.ts` | juniperusStage 同构（mount / mountWindDemo / mountSlots / mountLevels / view 系 / stats / freezeTime / turntable；import.meta.env.DEV 组合根守卫，生产零痕迹） |
| `src/app/bootstrap.ts` | `window.__bungeana` 四处接线（import / window 槽声明 / DEV 装配 / dispose 成对拆除） |
| `tests/runtime/procedural/tree/bungeanaStage.test.ts` | 组织对称 juniperusStage.test（21 条） |
| 物种表回填 | `broadleafCanopyMaterials.ts` `BROADLEAF_CANOPY_MATERIAL_SPECIES` bungeana 行（风动两成分直录 + 冠色 0x606d47 + 皮色 0x6f675c + variation 逐数转录 bungeanaMaterials）+ `broadleafCanopyProxy.ts` `CANOPY_SPECIES` bungeana 行（数据驱动，算法体零改动）+ tripwire 转正 |
| 测试联动 | broadleafCanopyMaterials.test（17 树种 + tripwire → 正向断言）/ broadleafCanopyProxy.test（17 树种 + conifer 分支 + SPECIES_BUILDERS）/ treeCanopyChain.test（17 乔木入链） |

## 2. VIEW_TARGET_Y 定档（几何实测）

slot-0 High 页内直 build 探针（`t0124-evidence.mjs` yProbe，与 Stage 模块头同口径）：

- 组 1（束卡）冠域 Y **[3.623, 11.376]** → 冠心 (3.623+11.376)/2 ≈ **7.50 → VIEW_TARGET_Y = 7.5**
- 全树高 11.376（组 0 皮+果域 [0, 11.161]）；vs 水杉 13.9 / 雪松 9.7 / 圆柏 4.5——11–12m 级与雪松同档下移半档
- Stage 数值面：slots/levels 间距 **17**（跨槽冠幅最大 15.29〔slot-2 伞形平顶〕防交叠——雪松 12.45 配 14 同款宽冠实数版）/ wind 排距 12 / viewSlots 67 / viewLevels 50

## 3. GLSL 真编译验证 — PASS

- **9 材质键全编译**：`bungeana:needle{,:mid,:low}` / `bungeana:bark{,:mid,:low}` / `bungeana:needle-depth{,:mid,:low}`——经 mount 锚点（high 三键）+ mountLevels 三档（mid/low 六键）真实渲染路径编译；深度材质随 castShadow 影线通道同编译。
- **console 零错误零警告**：主批（冷编译 + M25 基线 + 转台 1.5s + 三档 + slot-2 批 + M75/M12 观察帧）与 canopy 批全程捕获 **零条目**（baseNoise 0 / turntable 后 0 / consoleNoise []）。
- 交叉证据：浏览器路径 stats 与测试锁值全等（17252 / 19500 / 9750）；levels 帧实际出像素（mid 7762 ⊂ 6000–10000 / low 2734 ⊂ 1500–3000 落带实测）。

## 4. 像素量化（M25 · az35 · el8 · day · freezeTime；`baseline.png` + 空场对照 `diag-empty.png`）

| 口径 | 白皮松 slot-0 | 对照（水杉 / 圆柏） |
|---|---|---|
| **同式硬窗 [874,421,1018,767] 绿%** | **45.2** | 34.2 / 22.8 |
| 窗口内绿/mask（实体率） | 58.7% | 65.1% / 55.8% |
| 全帧绿像素 | 34,401 | 22,562 / 13,069 |
| 全帧绿/树剪影（mask） | 55.7% | — / 57.9% |
| 差分树 bbox 带绿（crownband 口径） | 12.1% | —（口径不可直比，012.3 记档） |
| 纵向绿剖面（vprofile 十分位） | 冠绿集中树高 0–40% 带绿 23.6–36.1%、实体率 65.8–85.5%；40% 以下裸干带 0–3% | 裸干比 0.30 结构直读 |

**疏散冠密度首验（观察项①）**：同窗 45.2% **高于** 族先验带 33.0/34.3% +12pp——疏散 caveat（任务书 Step 1 判定 4：显著低于带不必然缺陷）方向未触发（反向超带无缺陷信号）；实体率 58.7% 略低于水杉 65.1% 与「疏散半透光」Spec 读向一致。窗口/带口径对裸干型 conifer 的树 bbox 带稀释问题同 012.3 记档（口径归族门横向验收）。

## 5. canopy 取证机位（包围球体量校验——012.3 教训第三例）

包围球 r ≈ 6.4m（slot-0 bbox 11.376 高 × 9.758 宽，Step 3c 探针）→ m = (d/r)·tan(fov/2) 折算下净 canopy 带 ≈ d220–826。**产品路径 distribution 实测**（place×1）：

| 距离 | 选档 | 备注 |
|---|---|---|
| d80 | mid（迟滞保持，m≈5.8 近 highToMid 线） | |
| d150 | mid（m≈10.9） | |
| d250 | **dual-submit 过渡带**（mid→canopy dither） | 不可作取证帧 |
| **d350** | **canopy:1 · transition 0（净态）** | 取证帧 `canopy-350m.png`（statsAt350: 988 tri canopy 卡 + 14 programs） |
| d500 | canopy:1（m≈36 ⊂ 带内，**非 culled**——vs 圆柏 d500 = culled） | 体量差实证 |

**白皮松 canopy 取证带 = d350–500**（净 canopy 态实测）；勿沿用圆柏 d170–250 带或水杉 d400/500 直取——机位按包围球体量校验（012.2 400m / 012.3 500m 教训的第三数据点：本树体量介于两者之间，带位亦然）。

## 6. 观察项四条（一行结论）

1. **疏散冠密度首验**：同窗 45.2% 高于带（见 §4）——无密度缺陷信号；实体率 58.7% 与疏散半透光读向自洽。
2. **伞形平顶端型（slot-2 M25 纵剖）**：端顶带（树高 0–10%）实体绿率 65.3% vs 冠中带（20–30%）68.1% → 比值 **0.96 ≥ 0.8 ✓**（顶带不秃；0–10% 原始绿% 2.9% 为伞缘薄边占空所致，实体率口径判读）。冠绿集中 0–40% 树高带、中带峰值 27.1%（20–30% 带绿%）——伞形「上密下疏裙摆」纵向结构成立（`slot2-m25.png` + vprofile）。
3. **白干中距可辨性（identity 承重 Unknown ⑤）**：**M75 偏弱**——侧机位 az110 干带均值 rgb(126,143,140)·亮像素 10%、受光面 az35 rgb(138,160,148)·亮像素 24%，白皮斑驳在 M75 不可辨、树干读向「灰褐中调」；M12 近景白/乳白斑块可辨（vision 判读「灰褐基 + 白色乳白斑块，白皮松典型斑驳特征」）。**身份信号随距离衰减快——Step 4 判读输入 / 族门候选**（远景档白干读向强化归主代理裁定，本步零改动）。帧：`m75-side.png` / `m75-az35.png`（消歧帧）/ `m12-near.png`。
4. **束卡中距质感**：M12 vision 判读「三针一束小扇形放射刷状质感，松针束感明显，非普通颗粒叶感」✓；M25 帧判读「细小簇团颗粒感为主、刷状放射弱可辨」——中近距成立、M25 边缘（预期内：束卡 0.26–0.32 亚像素域）。

## 7. 自验（三门槛定向）

- vitest bungeana 全套 5 件 **130 条全绿**（Structure/Lod/ShapeSlots/Materials/Stage）
- 定向联动 4 件 **65 条全绿**（broadleafCanopyProxy / broadleafCanopyMaterials / treeCanopyChain / bungeanaStage）
- typecheck 零错；check:layers **685 文件**过
- 进程清理：vite 5183 / Chrome CDP 9333 会话尾停（自建自清）

## 8. 工具（族先例复用改写——判据常数逐字未动）

- `tools/t0124-evidence.mjs`（主批：金丝雀 + console 捕获 + 空场/基线/三档/slot-2/M75/M12 帧 + yProbe）
- `tools/t0124-canopy.mjs`（多距 distribution 探针 + d350 净态帧）
- `tools/t0124-crownband.mjs` / `tools/t0124-winmask.mjs` / `tools/t0124-bandwindow.mjs`（012.3 同名工具 sed 派生，逻辑零改）
- `tools/t0124-vprofile.mjs`（新增：树 bbox 逐十分位带绿% + 实体率——裸干型 conifer 的带语义直读）
- `tools/t0124-m75sun.mjs`（白干可辨性消歧帧）
- 复用：`../012.2/tools/cdp.mjs`（驱动管线）

## 复现

```
# vite：npx vite --port 5183 --strictPort
# chrome：chrome --headless=new --remote-debugging-port=9333 --window-size=1920,1080 about:blank
cd docs/acceptance/t012/012.4
node ../012.2/tools/cdp.mjs tools/t0124-evidence.mjs
node ../012.2/tools/cdp.mjs tools/t0124-canopy.mjs
node tools/t0124-crownband.mjs diag-empty.png baseline.png
node tools/t0124-winmask.mjs diag-empty.png baseline.png        # 同式硬窗三口径
node tools/t0124-vprofile.mjs slot2-empty.png slot2-m25.png     # 伞形平顶纵向剖面
```
