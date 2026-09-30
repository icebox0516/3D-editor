你是 park-shader-agent，执行 T012.4 白皮松 Step 3b：材质全套（叶 SDF 第 4 语言 + 第 17 树皮语言 + 果材质 + 风动 + 深度材质 + 键分档）。

## read-set（必读，按序）

1. `D:\3D-editor\.zcode\skills\asset-production\workflows\tree.md` §Step 3b（point-read）
2. `D:\3D-editor\docs\procedural-assets\shadow-visual-sop.md` §1（point-read）
3. `D:\3D-editor\docs\procedural-assets\lod-spec.md` 档位与材质键分档节（point-read）
4. `D:\3D-editor\tasks\012.4-bungeana.md` 全文（**Step 1 判定第 5/8 条与 Step 2 记档是你的输入**——树皮六分化点 + 无两面差 + 退化门继承 + 透射中幅）
5. `D:\3D-editor\docs\research\bungeana-reference.md` 消费摘要区（@1.1——树皮 identity 段与针叶质感段承重）
6. 主代理授权扩大（D40）：`D:\3D-editor\src\runtime\procedural\tree\juniperus\juniperusMaterials.ts`（point-read——材质管线组织与亚像素退化门先例）+ `D:\3D-editor\src\runtime\procedural\tree\platanus\platanusMaterials.ts`（point-read——**斑块剥落树皮机制跨族复制**，Step 1 判定 5 授权：学机制不抄色相）
7. `D:\3D-editor\src\runtime\procedural\tree\conifer\coniferShapeProfile.ts` 全文（契约——只读；材质相关字段消费值以 bungeanaShapeProfile 为准 → `D:\3D-editor\src\runtime\procedural\tree\bungeana\bungeanaShapeProfile.ts`〔Step 2 已定稿，只读〕）

## 交付物

`D:\3D-editor\src\runtime\procedural\tree\bungeana\bungeanaMaterials.ts` + `tests/runtime/procedural/tree/bungeanaMaterials.test.ts`（组织对称 juniperus 先例）：

1. **三针束卡 SDF（第 4 叶语言）**：1 卡 = 末级枝段多束聚合系统（枝段中轴 + 沿轴螺旋束位 + 每束 3 针小扇并集〔15–45° V/扇形开展、单针粗硬先端尖〕——vs 莲座放射/羽状二列/绳状四列）；近景微特征 = 气孔线白线观感 + 边缘细锯齿载波（亚像素归退化门）；**卡内束密度不随卡尺度放大稀释**（近景身份保留——012.2 教训）
2. **导数感知亚像素退化门直接继承**（012.3 fwidth 两域先例第三次消费）：亚像素域带占收敛 + 坡宽 footprint AA + 可解析域原值逐位不动
3. **无两面色差**（needleFaceContrast 0 消费——零值占位）+ **受光 ramp**（阳面黄绿亮/阴面灰绿暗——暴露度 mix）+ 微白粉档（needleGlaucousBloom 0.10）+ 透射中幅（硬针疏散冠——vs 水杉 0.46 高/圆柏低）
4. **default 单卡**：深绿-中绿带黄绿/灰绿域（Spec 承重；色值单源本文件——冻结接口⑤，几何/入口不内嵌）
5. **第 17 树皮语言 = 白基调多色斑驳薄片剥落**：机制参考 platanus 斑块剥落（跨族授权）+ 六分化点——非褐色多色（乳白/灰白 40–65% 主导 + 灰褐/深灰褐 20–30% + 近黑 5–10% + 淡黄绿新皮露斑）/ 地图状大斑块混杂 + **边缘窄-中等过渡带**（Spec 1.1 终审槽间差异域——勿取单一读向）/ **株内「上白下深」梯度**（v 轴 ramp——年龄皮色轴的替代承载，Step 2 记档）/ 薄片翘边亮斑缘（活跃剥落带微浮雕）/ 近光滑弱浮雕 + 浅纵细纹 / 干基深色裂沟端；**全槽中龄斑驳基调**（bark 组槽间恒等——Step 2 结论）
6. **幼果材质**：绿幼果主导 + 近熟淡绿-黄褐（uv v∈[1,2) 域分流——冻结接口②）
7. **风动两成分**：aSeed/aBend 契约字段沿用（冻结接口③）+ 整冠低频慢摆 + 末级枝/束高频小幅颤 + 树高锚 slot-0 同步轮（profile 值）
8. **深度材质同源 GLSL**：SDF alpha 与表面材质共享同一 GLSL 字符串（shadow-visual-sop §1.4；冻结接口④）+ customProgramCacheKey 档位唯一（冻结接口⑥）
9. GLSL 语法自检 + Materials 单测；**真编译 console 验证归 3c 合并后**（012.3 先例——本步不做浏览器编译）

## 冻结接口（与 3a 并行，双边已声明）

①ShapeProfile 只读 ②uv 帧域：束卡 v∈[0,1) / 果卡 v∈[1,2)（判别阈值 1.0）③aSeed/aBend 字段名沿用 ④深度材质 GLSL 你拥有（同源字符串）⑤色值单源你的文件 ⑥导出面 = `createBungeanaMaterials` 具名导出（3a 入口按此 import）+ per-level customProgramCacheKey 档位唯一。

## 硬边界

不碰：coniferShapeProfile.ts、bungeanaShapeProfile.ts、bungeanaGeometry.ts（3a 的）、cedrus/metasequoia/juniperus/platanus 文件、broadleaf、入口文件。自验：`npx vitest run tests/runtime/procedural/tree/bungeanaMaterials.test.ts` + `npm run typecheck` + `npm run check:layers`。

## 回传（P1 压缩：usage 时长 + 计数表 + 结论）

1. 用时 2. 计数表：文件行数、SDF 域数、材质键数、测试条数与结果 3. 结论：束卡 SDF 结构一行、退化门参数带、第 17 树皮配方要点（色相带 hex 清单 + 过渡带 + 梯度实现）、三方色锚（束卡主绿/皮白斑主色/幼果绿 hex）、透射/风动定值、与 juniperus 材质差异清单 4. 交付路径 + 自验结果