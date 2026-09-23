# salix Reference Spec

Spec Version: 1.0
Domain: plant
Asset: tree_salix（垂柳）
Updated: 2026-09-22

## 消费摘要（Step 1–4 默认只读本节）

- 资产锚定种 = **垂柳 Salix babylonica** L.（杨柳科 Salicaceae 柳属**落叶乔木**），FRPS 20(2):138 正名「垂柳」；语境 = 道旁/水边绿化树种（FRPS 原句），中国城市公园水边，**主视觉 = 生长季 9–10 月** ｜ Verified ｜ [1][3]
- **公园语境定名判据（vs 旱柳 S. matsudana 及垂枝变体「绦柳」f. pendula，FRPS 原句差分 3 条）**：①小枝色——垂柳淡褐黄/淡褐/带紫 vs 绦柳黄色；②叶形——垂柳**狭披针形-线状披针形**（长宽比 ≥8）vs 旱柳/绦柳披针形（≈4–8）；③叶背——垂柳**浅绿（色较淡）** vs 旱柳/绦柳**苍白色-带白色** ｜ Verified ｜ [1][2]
- 「旱柳砧高接 → 通直砧干 + 顶部垂枝幕」**成因口径：Unknown**（可及权威源均记扦插为主；百科嫁接条目记垂柳砧木非旱柳砧）；「高位单干 + 顶部垂幕」**形态**本身有公园照片直证（trunk-a），归干形变体域处理 ｜ Unknown（成因）/ Verified（形态）｜ [1][4][5][6]
- 物种树高上限：**12–18m**（FRPS「高达 12-18 米」= FOC「to 18 m」）；园艺城市典型 **≈9–12m 高 × ≈9–12m 宽**（NC State 30–40 ft 等域，速生）｜ Verified ｜ [1][3][4]
- **中龄公园个体生产锚：树高 ≈8–12m**（族量级锚；form-a 岸线粗估 ~10–12m 佐证）｜ Inferred ｜ [1][3][4][6]
- 冠形 = **开展而疏散**（FRPS 原句）；轮廓 = **喷泉状/伞状垂帘**——顶部拱圆、四周垂帘下覆（三整树槽双问一致读出）｜ Verified ｜ [1][4][6]
- **冠幅/树高 ≈1.0–1.3**（NC State 高宽同域——个体可达 30ft 高 × 40ft 宽即 1.33；三整树槽双问观感「等高至略宽」；主代理终审复核照片直读 1.3–1.5 均有取景混杂〔多株并生/切边〕、方向一致不否证文献锚）｜ Verified ｜ [4][6]
- 干高占比（`trunk_height_ratio`）：**常见 ≈0.25–0.35（低叉型）**；变体端点 = 基部多干（≈0）与高位单干（≈0.4+，分叉分数读数分歧、具体值不承重）｜ Inferred ｜ [6]
- **垂枝分层（身份核心）**：骨架大枝**粗壮、外展-拱起**（与垂直夹角 ≈20–60°，3–6 枝自干顶/叉区），末级小枝**细长近垂直下垂成垂帘**——两层角性质相反（照片三槽一致 + FRPS「枝细，下垂」+ 旱柳对照「大枝斜上」）｜ Verified ｜ [1][2][6]
- 垂幕深：**垂帘段覆树高 ≈2/5–2/3（个体差域，槽差异主轴）**，帘缘可至近水面/近地面（少数触线、多数止于其上 1–2m）；末级垂索常带 **S/J 形波曲与节点微 zigzag**、梢端轻卷（S 曲锚 branch-b 槽；crown-a 仰视读「近直微曲」——视角差异不矛盾）｜ Relative（照片双问）｜ [6]
- **细枝直径量级：末级垂索径 ≈2–6mm**（筷子级以下，crown-a/branch-b/leaf-b 三槽读数互证）；相对骨架枝径 ≈1/10 以下观感 ｜ Inferred ｜ [6]
- 小枝表面：**淡褐黄色/淡褐色或带紫，无毛**（`twig_surface`；叶槽近景读到红褐-灰褐细枝，相容）｜ Verified ｜ [1][3][6]
- 叶形：**狭披针形或线状披针形，9–16cm × 0.5–1.5cm**，先端长渐尖、基部楔形，两面无毛或微有毛 ｜ Verified ｜ [1][3]
- **叶长宽比：文献域 ≈6–32、典型 ≈10–15；照片双问读 8–12:1**（叶双槽主证）｜ Verified ｜ [1][3][6]
- 叶缘：**锯齿缘（细锯齿）**——照片分辨率下近全缘观感、光线下微细齿可辨（齿极细密）｜ Verified ｜ [1][3][4][6]
- 叶柄：**(3-)5–10mm**（≈叶长 1/10–1/20），有短柔毛 ｜ Verified ｜ [1][3][6]
- **叶沿垂索排列取向（终审补强，工程输入）**：冠下仰视双问读出叶沿垂索密排（间距 ≈0.25–0.5 叶长）、**互生错位**、叶窄长（宽/长 ≈1/5–1/8）、**叶尖多沿索轴朝下、部分微外翻**——垂帘内叶卡取向沿索轴的现实读向 ｜ Verified（crown-a 双问）｜ [6]
- 脉序：**羽状脉**（中脉清晰、侧脉羽状、近梢渐弱；FRPS/FOC 种级条目未记侧脉对数——**侧脉计数 Unknown 不消费**）｜ Verified（照片双问）｜ [6]
- 叶色：上面**中绿-中深绿**、下面**浅绿（微银光）**——带绿非苍白；生长季整体 = 中绿 + **阳面/幼叶黄绿调**；背光透光强（细叶发光观感）｜ Verified ｜ [1][3][4][6]
- 树皮：**灰黑色（暗灰褐-近黑），不规则开裂**（FRPS/FOC）；细化 = **波状不规则纵沟脊**、沟深、脊浅褐 vs 沟近黑强对比、常见修剪残桩——暗色深沟系（vs 先例语言：近槐/旱柳暗色深裂系，更波状不规则）｜ Verified ｜ [1][3][4][6]
- 冠层通透（`crown_transparency`）：间隙 ≈0.1–0.25，垂索密叠成帘、叶小单叶可辨、外密内疏观感 ｜ Inferred ｜ [6]
- **干形变体（主变体轴）**：单干高位分叉（微倾 5–10°）↔ 低叉多茎（~0.3）↔ 基部多干斜弯（倾 15–20°）——公园个体变异大，三型各有照片直证；slot-0 建议取低叉单干中间型 ｜ Verified（形态变异）｜ [6]
- 花果（记档不建模）：柔荑花序**先叶开放**（或与叶同放），花期 3–4 月、蒴果期 4–5 月——**生长季 9–10 月花果均不可见，不建模** ｜ Verified ｜ [1][3][4]

## Research Scope

- 种定名与公园语境判据：S. babylonica vs 旱柳 S. matsudana / 绦柳 f. pendula / 龙爪柳 f. tortuosa（栽培变体口径）；砧木嫁接口径（通直砧干 + 顶部垂枝幕是否公园典型）
- 垂枝结构（身份核心）：大枝开展角 vs 小枝下垂角分层关系、垂幕轮廓与深度、枝先端垂坠姿态、细枝直径量级
- 狭披针形叶：形/长宽/长宽比/缘齿/叶柄/脉序/两面色
- 冠形与体量：中龄公园个体树高/冠幅/干高；倒广卵/伞状判定；冠幅 vs 树高比
- 干形、树皮、枝姿分层质感、生长季叶色
- 花果生长季不可见性确认（记档口径）

## 1. 身份

杨柳科（Salicaceae）柳属（Salix）**落叶乔木**；FRPS 20(2):138（1984）正名「垂柳」，别名水柳/垂丝柳/清明柳 [1]；FOC Vol.4（1999）条目 36 [3]。使用语境：中国城市公园/水边，**主视觉语境 = 生长季 9–10 月**（物候可行性由花期 3–4 月证实——生长季无花无果）。

- 种定名（FRPS 原句锚）：「乔木，高达 12-18 米，树冠开展而疏散……枝细，下垂，淡褐黄色、淡褐色或带紫色，无毛」「产长江流域与黄河流域，其他各地均栽培，为道旁、水边等绿化树种。耐水湿」[1]
  - Form: Value + Qualitative ｜ Evidence Status: Verified ｜ Source: [1]
- 近缘差分（3 条视觉判据，FRPS 原句）：
  1. 小枝色：垂柳「淡褐黄色、淡褐色或带紫色」vs 绦柳「小枝黄色」
  2. 叶形：垂柳「狭披针形或线状披针形，长 9-16 厘米，宽 0.5-1.5 厘米」vs 旱柳/绦柳「披针形，长 5-10 厘米，宽 1-1.5 厘米」——垂柳叶显著更细长
  3. 叶背：垂柳「上面绿色，下面色较淡」（FOC：abaxially light green）vs 旱柳/绦柳「下面苍白色或带白色」
  （非视觉判据备案：绦柳雌花 2 腺体 vs 垂柳 1 腺体——不进生产）[1][2]
  - Form: Qualitative ｜ Evidence Status: Verified ｜ Source: [1][2]
- 栽培变体口径：旱柳系有绦柳 f. pendula（枝长下垂、形态近垂柳）、龙爪柳 f. tortuosa（枝卷曲）、馒头柳 f. umbraculifera（冠半圆馒头状）；垂柳自有变型曲枝垂柳 f. tortuosa（枝卷曲）——**本资产不消费卷曲/馒头冠变体**，按原变型 f. babylonica 生产 [1][2]
  - Form: Value ｜ Evidence Status: Verified ｜ Source: [1][2]
- 砧木嫁接口径：**Unknown**——FRPS「多用插条繁殖」[1]；百度百科繁殖方法列扦插（主）/分株/嫁接/播种，嫁接条目记「选择合适的垂柳砧木」（非旱柳砧）[5]；NC State "By stem cuttings"（无嫁接）[4]。「苗市常以旱柳为砧高接」无权威可及源；干形事实由照片直接承重（见 §4/§6）
  - Form: Qualitative ｜ Evidence Status: Unknown ｜ Source: [1][4][5]

## 2. 主要尺度

- 物种上限树高：12–18m（FRPS「高达 12-18 米」；FOC "Trees to 18 m tall"）[1][3]
  - Form: Range ｜ Evidence Status: Verified ｜ Source: [1][3]
- 城市典型成熟体量：高 30–40 ft × 宽 30–40 ft（≈9–12m × ≈9–12m，NC State 高宽同域），速生（"Rapid"）[4]
  - Form: Range ｜ Evidence Status: Verified ｜ Source: [4]
- 中龄公园个体生产锚：树高 ≈8–12m（文献域下沿 + 园艺典型域族量级锚定；form-a 岸线粗估 ~10–12m 佐证；与家族先例夏栎 ≈8m / 朴树 ≈8.5m 同语境可混植）
  - Form: Range ｜ Evidence Status: Inferred ｜ Source: [1][3][4][6]

## 3. 轮廓与比例

- 冠形：开展而疏散（FRPS 原句）；整体轮廓 = **喷泉状/伞状垂帘**——顶部拱圆、四周垂帘下覆（园艺 "Broad / Rounded / Weeping"；三整树槽双问一致：fountain-like / arching limbs fan outward + thread strands curtain）[1][4][6]
  - Form: Qualitative ｜ Evidence Status: Verified ｜ Source: [1][4][6]
- 冠幅 vs 树高：**≈1.0–1.2**（form-a 1.0–1.2 / form-b ~1.0 / trunk-a 1–1.2 双问一致；NC State 高宽同域）——「垂柳冠幅常大于树高」的观感成立为「等高至略宽」
  - Form: Range ｜ Evidence Status: Verified ｜ Source: [4][6]
- 干高占比（`trunk_height_ratio`）：常见 ≈0.25–0.35（form-b 0.25–0.35 / form-a ~0.3 双问一致）；变体端点 = 基部多干 ≈0（bark-a）与高位单干 ≈0.4+（trunk-a，下部单干两读一致、分叉分数读数分歧不承重）
  - Form: Range ｜ Evidence Status: Inferred（照片判读）｜ Source: [6]
- 冠层通透（`crown_transparency`）：间隙 ≈0.1–0.25（crown-a 双问一致 0.10–0.15 vs 0.15–0.25 合域）；垂索密叠成帘、叶小单叶可辨
  - Form: Relative ｜ Evidence Status: Inferred ｜ Source: [6]

## 4. 结构层级

- **垂枝分层（身份核心，两层角性质相反）**：
  - 骨架层（一级大枝）：粗壮、外展-拱起，与垂直夹角 ≈20–60°（form-a 20–30° / form-b 30–45° / trunk-a 30–60°），3–6 枝自干顶/叉区放射；少数末段下垂回（>90°）
  - 垂帘层（末级小枝/一年生枝）：纤细（径 ≈2–6mm）、细长、**近垂直下垂成帘**（FRPS「枝细，下垂」；FOC "Branchlets pendulous … slender"；crown-a/branch-a/branch-b 三槽一致「垂直/近垂直」），沿骨架枝外缘覆垂，先端垂坠
  - Form: Qualitative + Range ｜ Evidence Status: Verified（分层/姿态）/ Inferred（角度数值照片判读）｜ Source: [1][2][3][6]
- 垂幕深：垂帘段覆树高 ~1/2–2/3（form-a 50–60% / form-b 1/2–2/3 / trunk-a 50–60%），帘缘少数至近水面/近地面、多数止于其上 1–2m（水边个体「垂丝拂水」观感）
  - Form: Relative ｜ Evidence Status: Inferred（照片双问）｜ Source: [6]
- 末级垂索形态：S/J 形波曲 + 节点微 zigzag、梢端轻卷曲（branch-b 双问一致）；索径 ≈2–6mm（crown-a 铅笔 5–8→末梢筷子 2–3mm / branch-b 筷子 3–5mm / leaf-b 5–6→1–2mm）
  - Form: Relative + Range ｜ Evidence Status: Inferred ｜ Source: [6]
- 芽：线形，先端急尖（`bud_aspect`；冬态维度，生长季不消费）
  - Form: Qualitative ｜ Evidence Status: Verified ｜ Source: [1][3]

## 5. 材质与表面

- 叶形（`leaf_size`/`leaf_aspect_ratio`）：狭披针形或线状披针形，**9–16cm × 0.5–1.5cm**（文献承重绝对值）；长宽比文献域 ≈6–32、典型 ≈10–15、照片双问读 8–12:1；先端长渐尖、基部楔形；两面无毛或微有毛
  - Form: Range ｜ Evidence Status: Verified ｜ Source: [1][3][6]
- 叶缘：锯齿缘（细锯齿；NC State "finely serrated"；照片近全缘观感 + 光线下微细齿可辨——齿极细密，高频细齿载波口径）
  - Form: Qualitative ｜ Evidence Status: Verified ｜ Source: [1][3][4][6]
- 叶柄：(3-)5–10mm、明显短（照片读 ≈叶长 1/10），有短柔毛；托叶仅生萌发枝（不消费）
  - Form: Range ｜ Evidence Status: Verified ｜ Source: [1][3][6]
- 脉序：羽状脉（中脉清晰、侧脉羽状、近梢渐弱——leaf-a/leaf-b 双问读出）；种级文献未记侧脉对数，**侧脉计数 Unknown 不消费**
  - Form: Qualitative ｜ Evidence Status: Verified（照片）+ Unknown（侧脉数）｜ Source: [6]
- 叶两面色：上面中绿-中深绿 / **下面浅绿（微银光观感）**——带绿非苍白（差分关键）；NC State 侧证 "light green above, grayish-green or glaucous beneath"；背光透光强（细叶发光观感，leaf-b 双问）
  - Form: Qualitative ｜ Evidence Status: Verified ｜ Source: [1][3][4][6]
- 生长季叶色基调：中绿 + 阳面/幼叶黄绿调（照片多槽一致 medium green with yellow-green highlights）；非深墨绿调
  - Form: Qualitative ｜ Evidence Status: Verified ｜ Source: [4][6]
- 叶沿枝着生（`leaf_attachment_rule` 侧写）：互生、较密-中密有隙（leaf-b 密匀少隙 / branch-b 中密有隙）、叶面平但多扭卷朝向多样（branch-b 双问）
  - Form: Qualitative ｜ Evidence Status: Inferred ｜ Source: [6]
- 小枝表面（`twig_surface`）：淡褐黄色、淡褐色或带紫色；无毛（叶槽近景读到红褐-灰褐细枝相容）
  - Form: Qualitative ｜ Evidence Status: Verified ｜ Source: [1][3][6]
- 树皮（`bark_archetype`/`bark_color`/`bark_relief`）：**灰黑色，不规则开裂**（FRPS 原句 = FOC "grayish black, irregularly furrowed" = NC State "gray-brown or gray-black with irregular furrows"）；bark-a 双问细化 = 暗灰褐-近黑、**波状不规则纵沟脊**、沟深、脊浅褐 vs 沟近黑强对比、常见修剪残桩与愈疤——**暗色深沟波状系**（先例语言定位：近槐/旱柳暗色深裂系、更波状不规则，异于榉/朴片剥系）
  - Form: Qualitative + Relative ｜ Evidence Status: Verified ｜ Source: [1][3][4][6]

## 6. 变体范围

- 干形轴（主变体轴，三型各有照片直证）：单干高位分叉（trunk-a，微倾 5–10°）↔ 低叉单干多茎（form-a ~0.3 / form-b 0.25–0.35）↔ 基部多干斜弯（bark-a，倾 15–20°、2–3 干）；slot-0 锚点建议取低叉单干中间型
  - Form: Qualitative ｜ Evidence Status: Verified（形态变异）｜ Source: [6]
- 垂幕轴：垂帘深度/垂坠度/冠幅比（任务书 Step 2 预期差异主轴）；现实观察垂帘深 ≈树高 1/2–2/3 有个体差异
  - Form: Relative ｜ Evidence Status: Inferred ｜ Source: [6]
- 不消费变体：曲枝垂柳 f. tortuosa（枝卷曲）、旱柳系绦柳/龙爪柳/馒头柳（旱柳形态域）
  - Form: Value ｜ Evidence Status: Verified ｜ Source: [1][2]

## 7. 远近景保留优先级

- 远景/中距剪影（身份第一读向）：**垂帘姿态 + 喷泉状/伞状轮廓**（大枝拱起 + 末级垂帘两层剪影）；冠幅 ≈1.0–1.2 倍树高的扁阔体量
- 中距：冠开展疏散的通透-疏松质感（间隙 0.1–0.25）；垂帘缘随风摆动读向
- 近景：**线状披针细长叶**（长宽比 ≥8 即身份读向）+ 细锯齿缘近全缘观感 + 两面浅色差 + 羽状脉；小枝淡褐黄纤细（2–6mm）；树皮灰黑波状纵沟
- 不消费：花序/蒴果（3–5 月物候窗）、芽（冬态维度）
  - Form: Qualitative ｜ Evidence Status: Verified ｜ Source: [1][3][4][6]

## 8. 来源证据

| # | 来源 | 类型 | URL/文献 | 检索日期 | 覆盖面（锚句） |
|---|------|------|----------|----------|----------------|
| 1 | 《中国植物志》第 20(2) 卷 (1984) p.138 垂柳（iplant 数据端点全文，frpslink 确认「第20(2)卷 (1984) >> 138页」= 任务书锚 FRPS 20(2):138） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfrps.ashx?key=Salix%20babylonica （条目 https://www.iplant.cn/frps/vol/20(2) ；PDF /frps/pdf/20(2)/138.PDF） | 2026-09-22 | 「乔木，高达 12-18 米，树冠开展而疏散。树皮灰黑色，不规则开裂；枝细，下垂，淡褐黄色、淡褐色或带紫色，无毛。芽线形，先端急尖。叶狭披针形或线状披针形，长 9-16 厘米，宽 0.5-1.5 厘米，先端长渐尖，基部楔形两面无毛或微有毛，上面绿色，下面色较淡，锯齿缘；叶柄长(3) 5-10 毫米，有短柔毛」「花序先叶开放，或与叶同时开放」「花期 3-4 月，果期 4-5 月」「产长江流域与黄河流域，其他各地均栽培，为道旁、水边等绿化树种。耐水湿」「多用插条繁殖」；变型曲枝垂柳 f. tortuosa「枝卷曲」 |
| 2 | 《中国植物志》第 20(2) 卷 (1984) p.132 旱柳 S. matsudana var. matsudana + 绦柳 f. pendula 差分（iplant 数据端点全文，卷页 132） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfrps.ashx?key=Salix%20matsudana%20var.%20matsudana | 2026-09-22 | 旱柳：「乔木，高达 18 米，胸径达 80 厘米。大枝斜上，树冠广圆形；树皮暗灰黑色，有裂沟；枝细长，直立或斜展」「叶披针形，长 5-10 厘米，宽 1-1.5 厘米……下面苍白色或带白色，有细腺锯齿缘」；绦柳 f. pendula：「本变型枝长而下垂，与垂柳相似 其区别为……本变型小枝黄色，叶为披针形，下面苍白色或带白色……而垂柳的小枝褐色，叶为狭披针形或线状披针形，下面带绿色」；龙爪柳 f. tortuosa 枝卷曲、馒头柳 f. umbraculifera 冠半圆 |
| 3 | Flora of China Vol.4 (1999) 条目 36 Salix babylonica（iplant 数据端点全文，vol 字段确认 Vol.4 (1999)） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfoc.ashx?key=Salix%20babylonica | 2026-09-22 | "Trees to 18 m tall; bark grayish black, irregularly furrowed; Branchlets pendulous, brownish yellow, brownish, or slightly purple, slender, glabrous. Buds linear, apex acute. … petiole (3-)5-10 mm; leaf blade narrowly lanceolate or linear-lanceolate, 9-16 × 0.5-1.5 cm, abaxially light green, adaxially green, both surfaces glabrous or slightly pilose, base cuneate, margin serrate, apex long acuminate. … Capsule slightly greenish brown, 3-4 mm. Fl. Mar-Apr, fr. Apr-May." "Widespread throughout China [Asia, Europe]" |
| 4 | NC State Extension — Salix babylonica | 园艺官方 | https://plants.ces.ncsu.edu/plants/salix-babylonica/ | 2026-09-22 | Height/Width: 30–40 ft（高宽同域）；Habit "Broad / Rounded / Weeping"，"weeping, pendulous branches and stems"；"The bark is gray-brown or gray-black with irregular furrows"；叶 "linear to lanceolate, 3–6 in. long, under 1 in. wide. Margins finely serrated"，"light green above, and grayish-green or glaucous beneath"；catkins April–May、果 late May–early June；Growth Rate Rapid；Propagation by stem cuttings（无嫁接）；Origin East Asia--China |
| 5 | 百度百科 垂柳（杨柳科柳属植物）词条（agent-browser 渲染提取正文） | 百科（弱轴，仅嫁接口径用） | https://baike.baidu.com/item/垂柳/3935180 | 2026-09-22 | 形态镜像 FRPS；繁殖方法列扦插（主）/分株/嫁接/播种；嫁接条目原文「剪下并选择合适的**垂柳砧木**。将砧木削成锥形……」（**非旱柳砧**）——不支持旱柳砧高接主张 |
| 6 | iNaturalist research-grade 真实照片（taxon 58316 = Salix babylonica，2026-09-22 经 /v1/taxa 端点确认 active；中国 place_id 6903 共 134 条 research-grade；本地副本 ref-salix-*.jpg 不入 git） | 真实照片 | 照片页 https://www.inaturalist.org/photos/<id>；原图 CDN https://inaturalist-open-data.s3.amazonaws.com/photos/<id>/original.jpg（扩展名自 API JSON url 权威提取） | 2026-09-22 | 见下「照片来源明细」 |

### 照片来源明细（一行化）

| 槽位 | 文件 | 照片 id（观察 id） | 时点/地点 | 许可 | 承重结论（一行） | 双问 |
|------|------|------------------|-----------|------|------------------|------|
| form-a | ref-salix-form-a.jpg | 579241633（320378986） | 2025-10 长沙岳麓 | cc-by-nc | 整树全轮廓：喷泉垂帘、冠幅比 1.0–1.2、裸干 ~0.3 低叉、4 主枝 20–30°、垂幕 50–60%、细羽、中绿+黄绿、~10–12m | 一致 |
| form-b | ref-salix-form-b.jpg | 657162209（360148462） | 2026-05 成都犀浦湖畔 | cc-by-nc | 湖畔大树立木：喷泉/伞状垂覆水面、冠幅 ~1.0、裸干 0.25–0.35、3 主枝 30–45°、垂幕 1/2–2/3 及水、黑天鹅参照、中绿灰调+黄绿 | 一致（干姿微分歧：较直 vs 微倾向水→不承重干姿主张） |
| crown-a | ref-salix-crown-a.jpg | 719493793（392589886） | 2026-08 北京 | cc-by-nc | 冠下仰视垂帘：细索近垂直梢端卷曲、间隙 0.1–0.25、索径铅笔→末梢筷子（5–8→2–3mm）、阳黄绿/荫深绿 | 一致 |
| branch-a | ref-salix-branch-a.jpg | 581108737（321189800） | 2025-10 杭州 | 版权保留(static 域) | 垂枝簇近景 + 湖岸石栏：枝水平/拱起→转垂直下垂的姿态转换；中国公园水边语境槽 | 一致 |
| branch-b | ref-salix-branch-b.jpg | 569469557（315243367） | 2025-09 北京 | cc-by-nc | 垂索特写：S/J 波曲+节点 zigzag、索径 3–5mm、互生有隙、细长叶 8–12:1、中绿黄绿调、背浅绿微银、叶多扭卷 | 一致 |
| leaf-a | ref-salix-leaf-a.jpg | 531945295（295485302） | 1994-10 山东烟台 | cc-by-nc | 叶近景：披针 8–10:1、长渐尖窄基、近全缘+极细齿、羽状脉清晰、上中绿/背浅绿非白、柄 ~1/10、红褐-灰褐细枝 | 一致 |
| leaf-b | ref-salix-leaf-b.jpg | 574548550（317927719） | 2025-10 北京 | cc-by-nc | 细垂枝满幅：拱-垂 J 曲线、索 5–6→1–2mm、叶密匀、短柄、羽脉近梢弱、缘平滑观感、背光透光发光、中深绿+幼叶黄绿 | 一致（长宽比读 4–6 与叶双证 8–12 冲突→不承重该主张） |
| bark-a | ref-salix-bark-a.jpg | 585985314（323814885） | 2025-10 北京亦庄 | cc-by-nc-sa | 干基仰视：多干斜弯（倾 15–20°）+ 暗灰褐-近黑波状纵沟脊、沟深强对比、残桩愈疤 | 一致（主干细胞数 2 vs 3 微差→只承重「多干」） |
| trunk-a | ref-salix-trunk-a.jpg | 700842983（382943320） | 2026-07 北京金春路 | cc-by-nc | 单干大树立木：下部单干（高位分叉型）、微倾 5–10°、4–6 主枝 30–60°（部分垂回）、垂幕 50–60%、暗色纵脊沟皮 | 一致（分叉分数 0.35–0.5 vs ~0.65 分歧→不承重具体分数） |

> 双问规程：两次独立非引导性开放提问（不泄露树名/不预设答案），不一致主张不承重并记档分歧（见各行括注），不取折中；详细过程归任务完成记录。

## 终审记录（一行）

终审：**通过**（2026-09-22 主代理采样终审 D38）｜修正 3 项：①冠幅比上沿 1.2→1.3（NC State 同域个体可达 1.33 算术依据）②垂幕深域并集 ≈2/5–2/3（终审照片读 40–50% 下沿入域）③补强「叶沿垂索取向」工程事实行 ｜抽查 = 硬数值 8 项独立重拉零偏差（FRPS 主条/绦柳差分 3 判据/FOC 全字段/NC State 园艺轴）+ 整树×2 与冠形×1 双问 6 轮核心主张全一致（分歧仅取景混杂的分数读数，已按「分数不承重」处置）｜旱柳砧成因维持 Unknown 合规（干形由照片三型直证，生产不受阻）
