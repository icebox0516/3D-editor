# sophora Reference Spec（国槐）

Spec Version: 1.0
Domain: plant
Asset: tree_sophora（国槐）
Updated: 2026-09-21

> 关键事实统一写法（各节内联、逐条标注；Source 填来源表编号）：
> Form ∈ {Value, Range, Relative, Qualitative}；Evidence Status ∈ {Verified, Inferred, Unknown}。
> 工程预算（面数/LOD 阈值）不进本文件，归任务书。真实照片本地副本为 `screenshots/ref-tmp/` 下 ref-sophora-*.jpg（不入 git、不进 Runtime）。

## 1. 身份

豆科（Fabaceae）槐属（**现用口径 Styphnolobium**；志书口径 Sophora s.l.）**落叶乔木**。志书属级形态基准（FOC 属级 Sophora）：「Deciduous or evergreen trees, shrubs, subshrubs, or perennial herbs, rarely twining. **Leaves imparipinnate**; stipules present or absent; **leaflets many, entire**, rarely with stipels.」[3]；属级荚果句「**Legumes cylindric, moniliform, fleshy or leathery**, sometimes winged, indehiscent or tardily dehiscent.」[3]。使用语境：**长江流域城市公园夏绿落叶乔木**，中龄典型个体 ≈8–12m，与夏栎 ≈8m、朴树 ≈8.5m、悬铃木 12–14m 同语境混植。本资产是本家族**首个一回奇数羽状复叶 + 串珠状肉质荚果 + 当年生枝绿色**三重身份信号的成员（vs 栾树二回羽叶 + 灯笼蒴果）。

- **命名口径（重点问题，三源裁定记档）**：
  1. **FRPS 40:92（1994）采 Sophora japonica 口径**：接受名「槐 Sophora japonica Linn. Mant. 1: 68. 1767」，学名行明确将 Styphnolobium 列为异名「——**Styphnolobium japonicum Schott in Wien Zeit. 3: 844, 1831**; Lauener in Not. Bot. Gard. Edinb. 30: 252. 1970; Yakovl. in Nov. Syst. Pl. Vasc. 12: 228. 1975.」[1]
  2. **FOC Vol.10 (2010) 同采 Sophora s.l. 口径**：种级检索号 20「**20. Sophora japonica** Linnaeus, Mant. Pl. 1: 68. 1767.」，Synonym 行列「**Styphnolobium japonicum** (Linnaeus) Schott」[2]；**属级（42. Sophora）Synonym 表将 Styphnolobium 整属列为异名**：「Ammothamnus Bunge; Cephalostigmaton Yakovlev; Edwardsia Salisbury; Goebelia Bunge ex Boissier; Keyserlingia Bunge ex Boissier; **Styphnolobium Schott**; Vexibia Rafinesque.」[3]——**FOC 未拆属，反而将 Styphnolobium 收并入 Sophora 广义**（任务书「FOC 拆属」预期经原句复核证伪，据实记档）
  3. **现代数据库口径（拆属，现用名侧）**：GBIF backbone 检索「Sophora japonica L.」taxonomicStatus = **SYNONYM**（检索 2026-09-21）[5]；iNaturalist 接受名 taxon = **Styphnolobium japonicum**（taxon id 53945，active）[6]；iplant FRPS 数据端点亦以「Styphnolobium japonicum」为检索 key 返回槐条目（Sophora japonica 为 key 返回空，见「检索与证据备注」）[1]
  - **生产锚定（判定）**：资产 id tree_sophora 按任务书锚定**现用名 Styphnolobium japonicum (L.) Schott**；FRPS 40:92 与 FOC Vol.10 的形态描述原句均在该两名下取得（同种实体，无分类学争议，仅属级归置口径之别），引用时注明口径。
  - Form: Value
  - Evidence Status: Verified（三源原句/结构化数据各自支持）
  - Source: [1][2][3][5][6]
- **Otto Kuntze 属归置问题（按 FOC 处理，记档）**：任务书提及 Styphnolobium 曾被 Otto Kuntze 归置入 Sophora、按 FOC 口径处理——FOC 的实际处理即上条：属级异名表将 Styphnolobium Schott 列为 Sophora 异名（不承认拆属）。**本调研未在 FOC/FRPS 原文中取到 Kuntze 人名或其 1891 年归置行为的直接文献句**，该历史脉络本 Spec 不引为原句、仅记档方向（Kuntze 归置 → 后世恢复 Styphnolobium → 现代数据库现用名侧），待需要时补研。
  - Form: Qualitative
  - Evidence Status: Verified（FOC 处理口径）/ Unknown（Kuntze 原句未取到）
  - Source: [2][3]
- **俗名链（FRPS 40:92 原句）**：「20. 槐（神农本草经）　守宫槐（群芳谱），槐花木、槐花树、豆槐、金药树」[1]——槐/国槐为通行中文名（「国槐」为园艺通称，志书用「槐」）
  - Form: Value
  - Evidence Status: Verified
  - Source: [1]
- 落叶性：落叶乔木（FOC 种级 "Trees, to 25 m" + 属级 "Deciduous or evergreen trees" [2][3]；NC 落叶语境 zones 4a–8b [4]）
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [2][3][4]
- 原生分布与栽培（两志矛盾记档，重点问题）：
  - FRPS 原句：「**原产中国，现南北各省区广泛栽培，华北和黄土高原地区尤为多见。日本、越南也有分布，朝鲜并见有野生，欧洲、美洲各国均有引种。**」[1]
  - FOC 原句："Cultivated throughout China [**native to Japan and Korea**; widely cultivated elsewhere]." [2]——FOC 视中国境内全为栽培、原生地日韩
  - NC native range 记 "China North-Central, China South-Central, and China Southeast" [4]（中国原产口径，与 FRPS 一致）
  - **生产读向**：华北-黄土高原为原产核心区（FRPS+NC 双源），长江流域为广泛栽培区——长江流域公园语境成立（栽培个体），与使用语境不冲突；FOC 单源异说记档不采信
  - Form: Qualitative
  - Evidence Status: Verified（各源原句）/ 记档矛盾（FOC vs FRPS+NC）
  - Source: [1][2][4]
- 用途与耐受：FRPS「**树冠优美，花芳香，是行道树和优良的蜜源植物**；花和荚果入药……木材供建筑用。本种由于生境不同，或由于人工选育结果，形态多变，产生许多变种和变型。」[1]；NC 长寿（30–40 年才最佳花期）、耐热/耐空气污染/耐旱、木质弱易风损 [4]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][4]
- 物候总口径：**花期 7–8 月，果期 8–10 月**（FRPS 原句「花期7-8月，果期8-10月」[1]；FOC "Fl. Jul-Aug, fr. Aug-Oct" [2]；NC "terminal panicles in July and August" + 果 "remain on the tree through the winter months" [4]）——**夏花夏末果 + 荚果宿存冬挂**（冬挂直接原句 NC [4]；照片轴 twig-a 冬态未见残果记档、fruit-a 7 月已见嫩果串）
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][2][4][6]

## 2. 主要尺度

- 物种上限树高：**「乔木，高达25米」（FRPS 原句）**[1]；FOC "Trees, to 25 m" [2]
  - Form: Value
  - Evidence Status: Verified
  - Source: [1][2]
- **中龄公园个体（目标龄级锚 ≈8–12m，重点问题）**：NC 栽培域 "Height: 50 ft. 0 in. - 75 ft. 0 in."（≈15–23m，偏老树端）[4]；照片 form-a（大同庭院中龄 9 月整树）判「宽开展冠、干粗、主枝低位放射」（无标定读数）+ form-b（黄山齐云山多干古树，带橙墙/人伞参照）为老树端 [6]——**中龄典型个体取 ≈8–12m（文献域内插 + 与任务锚一致），生产默认 10m**；NC 域上段（15m+）为老树变体端
  - Form: Range
  - Evidence Status: Inferred（文献域内插；照片无量化标定承托）
  - Source: [4][6]
- 冠幅：NC "Width: 50 ft. 0 in. - 75 ft. 0 in."（**与高同域等宽读向**）[4]；照片 form-a 判「**冠宽明显大于高**」[6]——**冠幅比 ≈0.9–1.2（开展等宽-稍宽于高）**，8–12m 个体对应冠幅 ≈8–13m（「冠大荫浓」园艺读向的几何落点）
  - Form: Range
  - Evidence Status: Verified（NC 等宽原句）/ Inferred（照片单源冠宽>高）
  - Source: [4][6]
- **复叶（最高优先，Verified 原句）**：**「羽状复叶长达25厘米」（FRPS 原句）**；FOC "Leaves 15-25 cm" [1][2]；NC "pinnately compound up to 6 to 10 inches long"（15–25cm，吻合）[4]——**复叶总长建模域 15–25cm（一回奇数羽状）**
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][2][4]
- **小叶（最高优先，Verified 原句）**：**「小叶4-7对，对生或近互生，纸质，卵状披针形或卵状长圆形，长2.5-6厘米，宽1.5-3厘米，先端渐尖，具小尖头，基部宽楔形或近圆形，稍偏斜，下面灰白色，初被疏短柔毛，旋变无毛；小托叶2枚，钻状」（FRPS 原句）**；FOC "leaflets 9-15; stipels subulate; blades **ovate-lanceolate or ovate-oblong, 2.5-6 × 1.5-3 cm**, papery, glaucous and sparsely to densely pubescent abaxially, usually becoming glabrate, base broadly cuneate or rounded, apex acuminate, mucronate" [2]；NC "7 to 17 leaflets"、小叶 1–2 in 卵-披针形 [4]——**小叶 4–7 对（=9–15 枚，FOC 计数口径吻合）+ 顶生小叶（奇数羽状），卵状披针形/卵状长圆形 2.5–6 × 1.5–3cm，先端渐尖具小尖头，基部宽楔形或近圆稍偏斜，纸质，缘全缘（属级原句「leaflets many, entire」[3]）**；NC 7–17 上限稍宽记档
  - Form: Range + Qualitative
  - Evidence Status: Verified
  - Source: [1][2][3][4]
- 小叶柄：**志书种级无小叶柄长度原句**（FRPS/FOC 均未记 petiolule）；照片 leaf-a 手持复叶判读小叶近无柄-具短柄着生于叶轴 [6]——**小叶柄短/近无柄（≈1–3mm 级）**
  - Form: Range
  - Evidence Status: Inferred（照片单源，文献无原句）
  - Source: [6]
- 小叶脉型：志书无脉型原句；照片 leaf-b 判「小叶中脉浅色明显、侧脉羽状细密」[6]——**羽状脉（豆科型），中脉显著**
  - Form: Qualitative
  - Evidence Status: Inferred（照片，文献无句）
  - Source: [6]
- **总叶柄/叶轴（身份特征，Verified 原句）**：**「叶柄基部膨大，包裹着芽」（FRPS 原句）**；FOC "**petiole inflated at base, bud hidden**" [1][2]——**叶柄基部膨大包裹腋芽（芽隐藏）**，与「叶轴初被疏柔毛，旋即脱净」[1]、托叶「形状多变，有时呈卵形，叶状，有时线形或钻状，早落」[1] + FOC "stipules ovate to linear, caducous" [2] 合并为复叶基部结构组
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2]
- **圆锥花序（重点问题）**：**「圆锥花序顶生，常呈金字塔形，长达30厘米」（FRPS 原句）**；FOC "Panicles terminal, to 30 cm; bracteole subulate" [1][2]；NC "on 6"-12" long and wide terminal panicles in July and August"（15–30cm）[4]——**顶生金字塔形圆锥花序，建模域 15–30cm**；照片 flower-b 判「宽金字塔形轮廓直接可见」[6]（与「常呈金字塔形」原句吻合的直接视觉证据）
  - Form: Range + Qualitative
  - Evidence Status: Verified
  - Source: [1][2][4][6]
- 花部细节：**「花冠白色或淡黄色，旗瓣近圆形，长和宽约11毫米，具短柄，有紫色脉纹，先端微缺，基部浅心形，翼瓣卵状长圆形，长10毫米，宽4毫米……龙骨瓣阔卵状长圆形，与翼瓣等长，宽达6毫米」（FRPS 原句）**；FOC "Corolla white or creamy yellow, rarely purple-red" [1][2]；NC "small, pea-like creamy white flowers, lightly fragrant" [4]——**单花小（旗瓣 ≈11mm），色白/乳白/淡黄，旗瓣带紫色脉纹（近景细节层）**
  - Form: Value + Qualitative
  - Evidence Status: Verified
  - Source: [1][2][4]
- **荚果（重点问题）**：**「荚果串珠状，长2.5-5厘米或稍长，径约10毫米，种子间缢缩不明显，种子排列较紧密，具肉质果皮，成熟后不开裂，具种子1-6粒；种子卵球形，淡黄绿色，干后黑褐色」（FRPS 原句）**；FOC "Legumes green, **moniliform, 2.5-5 × ca. 1 cm**, obviously constricted between seeds, **indehiscent, fleshy**. Seeds 1-6, yellow-green, black-brown when dry, ovoid." [1][2]；NC "Bean-like pods, 3 to 8 inches long, green ripening to yellow-brown, with constrictions giving a beads on a string look; they remain on the tree through the winter months" [4]——**串珠状（念珠状 moniliform）肉质荚果，志书域 2.5–5cm（或稍长）径约 1cm，绿→黄褐色序，不开裂，种子 1–6 粒；NC 园艺域 7.5–20cm 记为老果/北美栽培宽端**；照片手持 fruit-c 判 8–10cm/4–5 节 [6]（在「或稍长」与 NC 域内）——**建模主域 2.5–8cm（含照片实测上段），变体放宽至 10cm 级**
  - Form: Range + Qualitative
  - Evidence Status: Verified（志书双源）/ Inferred（照片尺度并入）
  - Source: [1][2][4][6]
- **荚果缢缩深度（两志矛盾，照片裁定记档）**：FRPS「种子间缢缩**不明显**，种子排列较紧密」[1] vs FOC "**obviously constricted** between seeds" [2]——直接矛盾；照片轴 fruit-a/b/c 三源一致判读「珠间细缢缩清晰可见、念珠串造型明确」[6]，NC "beads on a string" [4] 同向——**生产口径取「缢缩可见（中度）、串珠造型明确」**（FRPS「不明显」读向不采信，记档）
  - Form: Qualitative
  - Evidence Status: Verified（矛盾记档 + 照片三源裁定方向）
  - Source: [1][2][4][6]
- 树皮尺度：照片 bark-a（承德，带古树保护铭牌）判粗干大树、深沟脊 [6]；干径无标定数值——Unknown（照片不可标定）
  - Form: Unknown
  - Evidence Status: Unknown
  - Source: [6]
- 生长速率：NC "Medium" [4]；年增高数值无来源——Unknown
  - Form: Qualitative / Unknown（数值）
  - Evidence Status: Verified（定性）/ Unknown（数值）
  - Source: [4]

## 3. 轮廓与比例

- 冠形（重点问题）：**开展圆形-宽圆头形（rounded, spreading）**——NC habit "Broad, Erect, Rounded, Spreading"、crown "Rounded" [4]；照片 form-a 判「宽开展冠、冠宽>高、主枝低位放射」、form-b 判「大型开展 gnarled 古树多干、大枝水平-下垂伸展」[6]——**建模主相 = 开展宽圆头形（冠幅 ≥ 高），大枝自低位放射开展**（vs 夏栎圆穹致密、悬铃木阔卵、栾树开展圆头但冠幅 ≈ 高稍窄）——「冠大荫浓」园艺通说的几何读向即此
  - Form: Qualitative
  - Evidence Status: Verified（NC 园艺）/ Inferred（照片双源）
  - Source: [4][6]
- 冠幅/树高比：**≈0.9–1.2**——NC 高宽同域（50–75 ft both）[4] + form-a 冠宽>高 [6]；8–12m 个体对应冠幅 ≈8–13m
  - Form: Range
  - Evidence Status: Inferred（NC 等宽 + 照片单源宽读）
  - Source: [4][6]
- 主干分枝点高度：**低分枝 ↔ 培训高干两相并存（栽培口径，重点问题）**——NC 原句「When open-grown, it tends to branch low to the ground, but can be trained into a tall specimen with an erect trunk」[4]；照片 form-a 主枝低位放射（低分枝相）[6]——**公园/行道语境单干高干（培训相）与庭院开敞低分枝相皆真实；公园行道树语境建议净干 2–3m 级 + 上部开展骨架枝（Inferred，无整树净干实测照片）**
  - Form: Qualitative
  - Evidence Status: Verified（两相栽培原句）/ Inferred（净干数值）
  - Source: [4][6]
- 主干姿态：单干为主（行道/公园培训相）；form-b 多干古树相（老树/庭院变体端）[6]——单干 ↔ 多干轴记档（§6）
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [4][6]
- **冠面质感（重点问题：羽叶细碎复合质感）**：**细质**——一回羽状复叶 15–25cm、小叶 1.5–3cm 宽卵状披针形细碎，冠面由大量平展羽叶层叠构成**细碎均质绿面**（vs 栾树大羽叶 45–70cm 粗结构细碎面、悬铃木大叶粗质、朴树/樟树小卡密簇）——照片 form-a 判「树冠浓密、叶片细碎均匀」[6]
  - Form: Relative + Qualitative
  - Evidence Status: Inferred（叶尺度文献 + 照片单源）
  - Source: [1][2][6]
- 冠层通透度：照片 form-a 判「树冠浓密」（覆盖率高、通透低）[6]——**空隙 ≈10–20%（致密相）**，弱单源；「冠大荫浓」通说同向
  - Form: Relative
  - Evidence Status: Inferred（单源 + 园艺通说）
  - Source: [1][6]
- 冠层密度梯度：无直接照片判读——Unknown（方向性：浓密外壳读向随「荫浓」通说，不承重）
  - Form: Unknown
  - Evidence Status: Unknown

## 4. 结构层级

部件树：主干（单干常见，多干古树变体）→ 骨架枝（低位放射/开展，数量 Unknown）→ 二级枝 → 末级枝（**当年生枝绿色**）→ **一回奇数羽状复叶（互生）** → 顶生金字塔形圆锥花序（7–8 月）→ 串珠状肉质荚果（8 月起，宿存冬挂）→ 冬季落叶（残果挂枝）。

- **复叶结构（最高优先，挂点语言核心）**：**一回奇数羽状复叶**——叶轴 + 小叶 4–7 对（对生或近互生）+ 顶生小叶；小托叶 2 枚钻状；托叶早落（形状多变）；**叶柄基部膨大包裹腋芽**（藏芽结构）[1][2][3]；叶在枝上**互生**（FOC 属级语境 + 照片 leaf-c 判「羽叶沿枝交替着生」[6]）；照片 leaf-a 手持复叶判「小叶沿叶轴对生-近对生排列、顶生小叶在先端」[6]——**挂点单位 = 1 枚 15–25cm 一回羽叶，每挂点结构 = 叶轴 + 9–15 小叶一级（vs 栾树二回两级）**——家族复叶第二例（一回口径），结构复杂度低于栾树
  - Form: Qualitative + Range
  - Evidence Status: Verified（回数/小叶数/对生近互生/藏芽/小托叶/全缘文献）/ Inferred（互生着生照片单源）
  - Source: [1][2][3][6]
- **花序着生与姿态（重点问题）**：**圆锥花序顶生、常呈金字塔形、长达 30cm**（FRPS 原句 [1]；FOC "Panicles terminal, to 30 cm" [2]）——夏末着生于末级枝顶；照片 flower-a 判「顶生圆头形开花簇、淡绿白-乳白与绿叶混色、花小」、flower-b 判「顶生宽金字塔形花序、乳白小花+黄绿圆蕾」[6]——**花序 = 末级枝顶金字塔形-圆头形大型结构，15–30cm 级 ≈ 复叶长度同级**；着色淡（乳白/淡绿白）与叶幕对比弱（详见 §5 花色材质）
  - Form: Qualitative + Range
  - Evidence Status: Verified（顶生/金字塔形/尺度文献）/ Inferred（姿态照片双源）
  - Source: [1][2][4][6]
- 果序姿态：荚果沿结果枝串生、**下垂悬挂**——照片 fruit-a 判「念珠串自枝下垂挂、每串 3–10 节」[6]；NC「remain on the tree through the winter months」[4]——**夏末-秋季生长季可见 + 冬季宿存挂枝**
  - Form: Qualitative
  - Evidence Status: Verified（NC 宿存原句）/ Inferred（下垂姿态照片单源）
  - Source: [4][6]
- **枝姿（重点问题：当年生枝绿色 = 身份特征候选确认）**：**「当年生枝绿色，无毛」（FRPS 原句）**；FOC "**branches of current year green**, glabrous" [1][2]——**双志原句直接确认：一年生枝绿色是本种身份特征**（冬春落叶后近景可辨的独有维度；既有九资产均无此信号）——任务书身份判定问题解决：**是，确认候选并采信**
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2]
- 大枝姿态：NC 开放生长低位分枝、可培训直干 [4]；照片 form-a 主枝放射开展、form-b 大枝水平-下垂 gnarled（老树）[6]；twig-a 冬态判「粗大主枝辐射开展、细枝 zigzag 之字形密网」[6]——**大枝开展-平展、末级枝 zigzag 之字曲折**（之字形分枝为国槐冬态身份读向，照片单源 Inferred）
  - Form: Qualitative
  - Evidence Status: Verified（低位分枝/培训原句）/ Inferred（zigzag 照片单源）
  - Source: [4][6]
- 芽（重点疑点，记档）：**志书无芽形态原句**（FRPS/FOC 种级均无芽鳞/裸芽描述）；仅「叶柄基部膨大，包裹着芽」[1] / "petiole inflated at base, bud hidden" [2]——**芽隐藏于膨大叶柄基内（藏芽结构 Verified），芽本体形态 Unknown**——冬芽近景细节不可考，不进建模
  - Form: Unknown（芽形态）/ Verified（藏芽结构）
  - Evidence Status: Unknown / Verified
  - Source: [1][2]
- 分枝层级数：twig-a 冬态判「主枝-侧枝-细枝 3 级可见、细枝密网」[6]——3–4 级（弱单源）
  - Form: Value
  - Evidence Status: Inferred
  - Source: [6]
- 骨架枝数量/仰角定量：无整树样木标定——Unknown（定性：低位放射开展）

## 5. 材质与表面

- **树皮类型学（重点问题，三源合并）**：
  - FRPS 原句：「**树皮灰褐色，具纵裂纹。**」[1]（深度未言）
  - FOC 原句："Bark **gray-brown, longitudinally striate**" [2]（striate=纵条纹，浅读向）
  - NC 原句："The bark is **grayish brown with deep fissures, furrows, and ridges. The furrows appear reddish-brown.**" [4]（深裂 + 沟红褐）
  - 照片三源 [6]：bark-a（承德古树）「近黑-深褐粗干、深沟脊、厚而不规则脊与块、瘤状突起、断枝残桩与愈合大疤」；bark-b（西安中龄）「灰褐纵裂沟脊、板状粗厚脊」；bark-c（四川干基）「灰褐纵裂脊、密布暗色小瘤突、藓斑」
  - **合并口径：灰褐-深灰褐基调、深-中纵裂沟脊（脊厚沟深、随龄加深）、沟浅红褐读向（NC）、局部暗色瘤状突起/愈合疤**——志书 striate 浅读向判为幼-中龄端或简写，大树深裂由 NC + 照片三源承托
  - Form: Qualitative
  - Evidence Status: Verified（FRPS/FOC/NC 原句）/ Inferred（照片三源合并读向）
  - Source: [1][2][4][6]
- **既有九资产树皮语言分化定位（重点问题）**：朴（平滑-浅裂小斑块）/ 樟（深纵裂）/ 榉（光滑+暖色薄片剥落斑驳）/ 银杏（深纵裂粗糙）/ 悬铃木（光滑大片地图状剥落三色带）/ 栾（浅色光滑+皮孔麻点）/ 乌桕、重阳木、夏栎（既有语言见各自 Spec）——**国槐 = 灰褐-深灰褐深纵裂厚脊沟 + 沟浅红褐 + 局部暗色瘤突**——分化点：①厚脊深沟的板状粗犷感（vs 栾浅色光滑、朴浅裂小斑块）；②沟底浅红褐（vs 樟/夏栎单色沟）；③**暗色瘤状突起 + 愈合疤**（九资产独有维度）——「深裂厚脊 + 瘤突」语言在家族中独立
  - Form: Qualitative
  - Evidence Status: Inferred（分化定位为对照推断）
  - Source: [4][6]
- 树皮附生：照片 bark-c 判「藓斑局部」[6]（干基阴面，低置信不承重）
  - Form: Qualitative
  - Evidence Status: Inferred（低置信）
  - Source: [6]
- **花色材质与冠面读向（重点问题 → 建模判定建议）**：**淡色系低对比信号**——花冠白/乳白/淡黄 [1][2][4]、旗瓣紫脉纹（近景细节）[1]；照片 flower-a 判「淡绿白-乳白与绿叶混色、花小不醒目」、flower-b 判「乳白花+黄绿蕾、金字塔形轮廓」[6]——**中距读向 = 淡黄白-乳白轻雾状覆于绿幕，无强色彩对比**（vs 栾树金黄花团、乌桕白果强信号）——**建模判定建议：不做主相必备件**（理由：①色淡低对比、中距身份贡献弱；②花期 7–8 月窗口短；③国槐身份由冠形+羽叶+串珠果+绿枝+树皮五信号承托已足）；如任务书需要夏花相，可作低频变体档（淡黄白轻覆层，花序金字塔形剪影）
  - Form: Qualitative
  - Evidence Status: Verified（花色文献三源）/ Inferred（冠面读向照片）
  - Source: [1][2][4][6]
- **果色材质与色序（重点问题 → 建模判定建议）**：**绿→黄绿→黄褐色序 + 肉质光润质感**——FRPS「具肉质果皮」[1]、FOC "Legumes green...indehiscent, fleshy" [2]、NC "green ripening to yellow-brown" [4]；照片 fruit-a 判「浅绿-淡黄绿念珠串、微透亮」、fruit-b 判「亮绿光滑肉质」、fruit-c 判「绿-黄绿肉质饱满」[6]——**建模判定建议：做**（理由：①**串珠状 moniliform 造型是豆科槐独有强身份信号**，九资产中无同型果；②可见窗口长——8 月起挂枝、NC 原句宿存至冬；③生长季末（本项目主语境 9–10 月）恰为盛挂期；④绿-黄绿-黄褐色序与叶幕中绿有可辨对比）——果串为夏末秋相 + 冬挂相的核心附属物
  - Form: Qualitative
  - Evidence Status: Verified（色序/肉质/宿存文献三源 + 照片三源）
  - Source: [1][2][4][6]
- **叶色（重点问题：两面色差 = 身份特征候选）**：**上面中绿-亮绿、下面灰白-灰绿白（显著两面色差）**——FRPS「**下面灰白色**，初被疏短柔毛，旋变无毛」[1]；FOC "**glaucous** and sparsely to densely pubescent abaxially" [2]（glaucous=苍绿白色）；照片 leaf-c 判「上面中绿、下面灰绿-近白」[6]、leaf-a 判「上面有光泽中绿」[6]——**深绿/蓝绿读向裁定：中绿-亮绿（非蓝绿族），背面灰白粉绿**——正背面色差为近景-中景身份细节（风翻叶时冠面灰绿闪烁读向，建模可做背面浅色）
  - Form: Qualitative
  - Evidence Status: Verified（两面色文献双源）/ Inferred（冠面闪烁读向）
  - Source: [1][2][6]
- 秋色（记档不建模）：NC "fall color Gold/Yellow, short-lived" [4]——秋相金黄、短暂；无中文语境秋色来源
  - Form: Qualitative
  - Evidence Status: Verified（单源园艺）
  - Source: [4]
- 冠层色域（生长季主相）：细碎中绿-亮绿均质冠面 + 灰褐深裂干 + 夏末淡黄白轻雾花层（可选）→ 秋相串珠果绿-黄褐 + 冬挂 + 落叶后绿枝（当年生）+ zigzag 枝网
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [1][2][4][6]

## 6. 变体范围

- **龙爪槐（垂枝栽培变体，记档不建模——分类地位文献确认）**：FRPS 40:92 原句「**20a3. 龙爪槐（变型）（河北习见树木图说）　蟠槐、倒栽槐　f. pendula** Hort. apud Loud. in Arb. Brit. 2: 564. 1838……**本变型枝和小枝均下垂，并向不同方向弯曲盘悬，形似龙爪，易与其他类型相区别。供栽培观赏。**」[1]——分类地位：槐的**变型**（f. pendula，园艺起源栽培型），枝与小枝全面下垂盘曲；另有近似型「杂蟠槐 f. hybrida Carr.……主枝健壮，向水平方向伸展，小枝细长，下垂」[1]（FRPS 记「未见到这类标本。权录之」）
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1]
- **志书记载的种内变种/变型谱（记档不建模）**[1]：
  - 20a1 槐（原变型）f. japonica「形态特征与原变种同」——**生产主相 = 原变种原变型**
  - 20a2 五叶槐 f. oligophylla「复叶只有小叶1-2对，集生于叶轴先端成为掌状，或仅为规则的掌状分裂」产北京（景山）——掌状少叶异型
  - 20b 毛叶槐 var. pubescens「小叶下面和小叶柄疏被柔毛，中脉基部和小叶柄上毛甚密且较长」——毛被变体
  - 20c 堇花槐（紫花槐）var. violacea「翼瓣和龙骨瓣紫色，旗瓣白色或先端带有紫红脉纹」各地栽培观赏——紫花变体
  - 20d 宜昌槐 var. vestita「小叶上面疏被贴生柔毛，下面密被长柔毛，小枝、小叶柄、叶轴和花序上的茸毛状绒毛到第二年仍宿存」产湖北宜昌——毛被变体（任务书近缘排除名单成员之一）
  - var. praecox「花生在二年生老枝上」/ f. columnalis「体态狭圆柱状」——FRPS 记「我国可能有分布，但未见标本，权录此」
  - FOC 种级 Comment 原句："Many intergrading varieties and horticultural forms exist that are **not worthy of recognition at this level**." [2]——FOC 将全部种下等级归并（Synonym 行含 f. pendula/oligophylla/columnaris/hybrida/variegata、var. praecox/pubescens/vestita/violacea 等）[2]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2]
- 单干 ↔ 多干/低分枝 ↔ 高干轴：单干培训高干（行道/公园主流）↔ 开放生长低分枝（NC 原句两相 [4]）↔ 多干古树（form-b 照片 [6]）——频率 Unknown
  - Form: Qualitative
  - Evidence Status: Verified（两相栽培）/ Inferred（多干频率）
  - Source: [4][6]
- 冠形幅度：开展宽圆头主相（冠幅比 0.9–1.2）↔ 狭圆柱端（f. columnalis 志书记档 [1]，Unknown 相）——建模主相取开展宽圆头
  - Form: Range
  - Evidence Status: Inferred
  - Source: [1][4][6]
- 复叶尺度幅度：15–25cm 主域（志书 [1][2]）；NC 北美 15–25cm 同域 [4]；幼态叶偏大偏圆（照片 192772694 幼株判读「小叶圆-倒卵先端微凹」，幼态相单源不承重，记档）
  - Form: Range
  - Evidence Status: Verified（主域）/ Inferred（幼态）
  - Source: [1][2][4][6]
- 花果物候幅度：花期 7–8 月（FRPS/FOC/NC 三源 [1][2][4]）；果期 8–10 月 + 宿存冬挂（NC [4]）；照片 fruit-a 7 月 20 日已见嫩果串 [6]（果始期与花期衔接）
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][2][4][6]
- 荚果色幅度：绿（幼嫩）→ 黄绿 → 黄褐（成熟 NC "green ripening to yellow-brown" [4]）——同树多串多代并存（推断）
  - Form: Qualitative
  - Evidence Status: Verified（色序）/ Inferred（同树并存）
  - Source: [4][6]

## 7. 远近景保留优先级

（写到视觉显著性为止；面数/切换距离等工程映射归任务书）

- 远距（>50m）：**开展宽圆头轮廓（冠幅 ≥ 高）+ 细碎均质中绿冠面 + 灰褐深裂干**可辨认；复叶结构、花序、单串荚果均不可辨，可全部牺牲
- 中距（10–50m，本项目主语境）：**一回羽叶细碎质感（15–25cm 羽叶层叠）+ 夏末-秋季串珠状果串下垂信号（绿-黄绿-黄褐，2.5–8cm 级）+ 灰褐深纵裂厚脊干 + 当年生枝绿色（落叶期近中距身份信号）+ 开展低位骨架枝剪影**；冠面空隙 10–20% 致密
- 近距（数米）：**一回奇数羽状复叶全结构（小叶 4–7 对 + 顶生小叶、卵状披针形 2.5–6 × 1.5–3cm、先端渐尖具小尖头、基稍偏斜、缘全缘、上面亮绿下面灰白、小托叶钻状、叶柄基膨大藏芽）+ 串珠荚果细部（念珠节间缢缩、肉质光润、径约 1cm、种子间 1–6 粒）+ 树皮细部（深纵裂厚脊沟、沟浅红褐、暗色瘤突与愈合疤）+ 花序细部（金字塔形圆锥序 15–30cm、乳白小花旗瓣紫脉纹，可选）**依次进入可辨域
- 牺牲顺序（远→近）：小叶脉序与小托叶 → 花序细部与花瓣结构 → 小叶缘/先端细节 → 荚果单串节计数 → 复叶羽状结构与串珠果串信号 + 开展冠剪影（最后保留）

## 8. 来源证据

| # | 来源 | 类型 | URL/文献 | 检索日期 | 提取内容 |
|---|------|------|----------|----------|----------|
| 1 | 《中国植物志》第 40 卷 (1994) p.92 槐 Sophora japonica 含 20a–20d 全部变种变型（iplant 数据端点全文） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfrps.ashx?key=Styphnolobium%20japonicum （frpslink 字段确认「第40卷 (1994) >> 092页」，与任务书锚 FRPS 40:92 一致；注意检索 key 为 Styphnolobium japonicum——Sophora japonica 为 key 返回空，见检索备注） | 2026-09-21 | 20. 槐（神农本草经）守宫槐（群芳谱），槐花木、槐花树、豆槐、金药树——Sophora japonica Linn. Mant. 1: 68. 1767……——**Styphnolobium japonicum Schott in Wien Zeit. 3: 844, 1831**; 20a 原变种 var. japonica 图版27: 13-18：**乔木，高达25米；树皮灰褐色，具纵裂纹。当年生枝绿色，无毛。羽状复叶长达25厘米；叶轴初被疏柔毛，旋即脱净；叶柄基部膨大，包裹着芽；托叶形状多变，有时呈卵形，叶状，有时线形或钻状，早落；小叶4-7对，对生或近互生，纸质，卵状披针形或卵状长圆形，长2.5-6厘米，宽1.5-3厘米，先端渐尖，具小尖头，基部宽楔形或近圆形，稍偏斜，下面灰白色，初被疏短柔毛，旋变无毛；小托叶2枚，钻状。圆锥花序顶生，常呈金字塔形，长达30厘米**；花梗比花萼短；小苞片2枚形似小托叶；花萼浅钟状长约4毫米萼齿5近等大圆形或钝三角形被灰白色短柔毛；**花冠白色或淡黄色，旗瓣近圆形，长和宽约11毫米，具短柄，有紫色脉纹，先端微缺，基部浅心形，翼瓣卵状长圆形长10毫米宽4毫米先端浑圆基部斜戟形无皱褶，龙骨瓣阔卵状长圆形与翼瓣等长宽达6毫米**；雄蕊近分离宿存；子房近无毛。**荚果串珠状，长2.5-5厘米或稍长，径约10毫米，种子间缢缩不明显，种子排列较紧密，具肉质果皮，成熟后不开裂，具种子1-6粒；种子卵球形，淡黄绿色，干后黑褐色。花期7-8月，果期8-10月。原产中国，现南北各省区广泛栽培，华北和黄土高原地区尤为多见。日本、越南也有分布，朝鲜并见有野生，欧洲、美洲各国均有引种。树冠优美，花芳香，是行道树和优良的蜜源植物**；20a2 五叶槐 f. oligophylla；**20a3 龙爪槐 f. pendula「枝和小枝均下垂，并向不同方向弯曲盘悬，形似龙爪」**；杂蟠槐 f. hybrida；20b 毛叶槐 var. pubescens；20c 堇花槐 var. violacea；20d 宜昌槐 var. vestita；var. praecox「花生在二年生老枝上」；f. columnalis「体态狭圆柱状」 |
| 2 | Flora of China Vol.10 (2010) 槐 Sophora japonica 种级（检索号 20）（iplant 数据端点全文） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfoc.ashx?key=Sophora%20japonica | 2026-09-21 | 20. Sophora japonica Linnaeus, Mant. Pl. 1: 68. 1767.（槐 huai）——Synonym 行含 **Styphnolobium japonicum (Linnaeus) Schott**、S. japonica f. columnaris/hybrida/oligophylla/pendula/variegata、var. praecox/pubescens/vestita/violacea 等约 22 条。**Trees, to 25 m. Bark gray-brown, longitudinally striate; branches of current year green, glabrous. Leaves 15-25 cm; stipules ovate to linear, caducous; petiole inflated at base, bud hidden; leaflets 9-15; stipels subulate; blades ovate-lanceolate or ovate-oblong, 2.5-6 × 1.5-3 cm, papery, glaucous and sparsely to densely pubescent abaxially, usually becoming glabrate, base broadly cuneate or rounded, apex acuminate, mucronate. Panicles terminal, to 30 cm; bracteole subulate.** Calyx shortly campanulate 3.5-4.5 mm; teeth 5. **Corolla white or creamy yellow, rarely purple-red; standard broadly ovate, ca. 11 mm**; wings ovate-oblong ca. 10 × 4 mm. Stamens 10, unequal, free, persistent. **Legumes green, moniliform, 2.5-5 × ca. 1 cm, obviously constricted between seeds, indehiscent, fleshy. Seeds 1-6, yellow-green, black-brown when dry, ovoid. Fl. Jul-Aug, fr. Aug-Oct.** Habitat: **Cultivated throughout China [native to Japan and Korea; widely cultivated elsewhere]**. Comment: "Many intergrading varieties and horticultural forms exist that are not worthy of recognition at this level. Sophora angustifoliola appears to be merely a narrow-leaved form of this species." |
| 3 | Flora of China Vol.10 槐属 Sophora 属级（检索号 42）（iplant 数据端点全文） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfoc.ashx?key=Sophora | 2026-09-21 | 42. Sophora Linnaeus, Sp. Pl. 1: 373. 1753.（槐属）——"Deciduous or evergreen trees, shrubs, subshrubs, or perennial herbs, rarely twining. **Leaves imparipinnate; stipules present or absent; leaflets many, entire, rarely with stipels.** Racemes terminal or axillary…Stamens 10, free or fused at base…**Legumes cylindric, moniliform, fleshy or leathery, sometimes winged, indehiscent or tardily dehiscent.**"——**Synonym: Ammothamnus Bunge; Cephalostigmaton Yakovlev; Edwardsia Salisbury; Goebelia Bunge ex Boissier; Keyserlingia Bunge ex Boissier; Styphnolobium Schott; Vexibia Rafinesque.**（FOC 将 Styphnolobium 整属列为 Sophora 异名） |
| 4 | NC State Extension — Styphnolobium japonicum（WebFetch 全文提取） | 园艺官方 | https://plants.ces.ncsu.edu/plants/styphnolobium-japonicum/ | 2026-09-21 | **Height: 50 ft. 0 in. - 75 ft. 0 in. Width: 50 ft. 0 in. - 75 ft. 0 in.**（高宽同域）；habit "Broad, Erect, Rounded, Spreading"，**rounded crown**；"When open-grown, it tends to **branch low to the ground** but can be trained into **a tall specimen with an erect trunk**"；Growth Rate Medium；**"The bark is grayish brown with deep fissures, furrows, and ridges. The furrows appear reddish-brown."**；leaves "alternate and **pinnately compound up to 6 to 10 inches long. Each leaf will contain 7 to 17 leaflets**"，leaflets 1–2 inches ovate to lanceolate；fall color "Gold/Yellow" "short-lived"；flowers "small, pea-like **creamy white** flowers" "lightly fragrant" "on **6"-12" long and wide terminal panicles in July and August**"；fruit "**Bean-like pods, 3 to 8 inches long, green ripening to yellow-brown**, with constrictions giving a **beads on a string** look; they **remain on the tree through the winter months**. The seeds are poisonous"；USDA **zones 4a-8b**；native range "China North-Central, China South-Central, and China Southeast"；"Normally **30-40 years are needed for its best flowering**"；tolerates heat/air pollution/drought；weak wood；"an emerging invasive threat in the mid-Atlantic region" |
| 5 | GBIF Backbone Taxonomy（结构化检索） | 数据库 | https://api.gbif.org/v1/species/search?q=Sophora%20japonica&rank=SPECIES&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c | 2026-09-21 | Sophora japonica L. ｜ taxonomicStatus: **SYNONYM**（GBIF backbone 现代口径下 Sophora japonica 为异名；Styphnolobium japonicum (L.) Schott 为接受名侧，另经 species/match 端点双名各自返回 SPECIES 记录） |
| 6 | iNaturalist research-grade 真实照片（直接视觉证据；本地副本 ref-sophora-*.jpg 14 张不入 git；taxon 53945 = Styphnolobium japonicum，2026-09-21 经 /v1/taxa 端点确认 active） | 真实照片 | 照片页 https://www.inaturalist.org/photos/<id>；原图 CDN 双域（inaturalist-open-data.s3.amazonaws.com 与 static.inaturalist.org，扩展名 jpg/jpeg 以 HEAD 探测 + 下载验证为准，逐张记录于下表） | 2026-09-21 | 见下「照片来源明细」 |
| 7 | 任务书（用户提供） | 用户提供 | 主代理派遣指令（本会话） | 2026-09-21 | 使用语境（长江流域城市公园、夏栎 ≈8m 混植、目标 ≈8–12m 族量级锚）、命名口径调研要求（Styphnolobium/Sophora 切换、FOC Vol.10 序号 20、FRPS 40:92 锚）、九项重点调研面清单 |

### 照片来源明细（来源 [6] 展开）

| 槽位 | 文件 | photo id | obs id | 日期 | 地点 | 许可 | 原图 URL（域名/扩展名经 HEAD+下载验证） | 判读摘要（中性描述，不含树种名） |
|------|------|----------|--------|------|------|------|----------|----------------------------------|
| form-a | ref-sophora-form-a.jpg | 323733229 | 185368267 | 2023-09-29 | 山西大同灵丘农业科技园区 | CC-BY-NC | https://inaturalist-open-data.s3.amazonaws.com/photos/323733229/original.jpg | 整树庭院照：单株大树满幅、宽开展冠（冠宽明显>高）、干粗、主枝低位放射、树皮灰褐纵深裂沟深、树冠浓密中绿、栏杆参照〔**终审不承重**：构图主张（整树/干/栏杆）被双问证伪——实仅冠中下部入镜、无干无栏杆；「冠宽>高」支撑撤销，见终审记档③〕 |
| form-b | ref-sophora-form-b.jpg | 456358448 | 254740822 | 2024-11-21 | 安徽黄山齐云山景区 | CC-BY-NC | https://inaturalist-open-data.s3.amazonaws.com/photos/456358448/original.jpg | 整树多干古树：大型开展 gnarled 大枝水平-下垂伸展、苔藓覆干、细碎羽叶、雾天山村、橙墙+人伞参照（老树端体量） |
| leaf-a | ref-sophora-leaf-a.jpg | 675274773 | 369852916 | 2026-06-08 | 云南昆明石林彝族自治县 | CC-BY-NC | https://inaturalist-open-data.s3.amazonaws.com/photos/675274773/original.jpg | 手持复叶近距：羽状复叶、小叶沿叶轴对生-近对生 10–20 枚、小叶椭圆-长圆形 2–4cm、全缘、上面有光泽中绿、幼叶黄绿、叶轴绿色、手持参照 |
| leaf-b | ref-sophora-leaf-b.jpg | 327187064 | 187130752 | 2023-10-11 | 河南安阳太行大峡谷景区 | CC-BY-NC-ND | https://inaturalist-open-data.s3.amazonaws.com/photos/327187064/original.jpg | 枝上复叶侧拍：羽状复叶+顶生小叶在先端、小叶披针形先端尖头全缘、中脉浅色明显、侧脉羽状细密、中-深绿微哑光、稍厚质感、公园背景与标尺柱 |
| leaf-c | ref-sophora-leaf-c.jpg | 578621555 | 320058766 | 2025-09-29 | 陕西西安碑林区（和平门） | C（版权保留） | https://static.inaturalist.org/photos/578621555/original.jpg | 手持枝+羽叶：上面中绿、下面灰绿-近白两面色差清晰、小叶长圆形全缘沿枝互生排列（判读经 static medium URL，S3 无副本） |
| bark-a | ref-sophora-bark-a.jpg | 287149641 | 165855200 | 2023-06-06 | 河北承德双桥区 | CC-BY-NC | https://inaturalist-open-data.s3.amazonaws.com/photos/287149641/original.jpg | 古树粗干近景+冠下仰观：近黑-深褐粗干、深沟脊、厚而不规则脊与块、瘤状突起、断枝残桩与愈合大疤、水平大枝横穿画面、羽叶细碎透光金绿、细枝灰褐下垂、古树保护铭牌 |
| bark-b | ref-sophora-bark-b.jpg | 682459473 | 373430138 | 2026-06-20 | 陕西西安碑林区 | CC-BY-NC | https://inaturalist-open-data.s3.amazonaws.com/photos/682459473/original.jpg | 干基+冠下仰观：粗壮主干灰褐纵裂沟脊、板状粗厚脊、上部枝叶金绿透光（中龄干直接证据） |
| bark-c | ref-sophora-bark-c.jpg | 683917118 | 374188731 | 2026-06-13 | 四川阿坝州 | CC-BY-NC | https://inaturalist-open-data.s3.amazonaws.com/photos/683917118/original.jpg | 干基近景：灰褐纵裂脊、密布暗色小瘤突、局部藓斑、干上萌条、冠下羽叶中绿 |
| flower-a | ref-sophora-flower-a.jpg | 540671245 | 300087608 | 2025-07-22 | 山西运城 | CC-BY-NC | https://inaturalist-open-data.s3.amazonaws.com/photos/540671245/original.jpg | 冠上开花枝仰观：中央主干底部可见、开花枝满布、淡绿白-乳白花与绿叶混色、顶生圆头形花簇、花细小蝶形不醒目 |
| flower-b | ref-sophora-flower-b.jpg | 555934211 | 308159952 | 2025-08-22 | 福建南平武夷山市 | CC-BY-NC | https://inaturalist-open-data.s3.amazonaws.com/photos/555934211/original.jpg | 顶生宽金字塔形圆锥花序特写：淡绿白-乳白小花、花蕾黄绿圆粒、蝶形花冠（金字塔形轮廓直接可见） |
| fruit-a | ref-sophora-fruit-a.jpg | 711517274 | 388488649 | 2026-07-20 | 美国费城 Temple University | CC-BY-NC | https://inaturalist-open-data.s3.amazonaws.com/photos/711517274/original.jpg | 结果枝串珠果簇+羽叶：浅绿-淡黄绿念珠串下垂挂枝、5–15cm、每串 3–10 节圆珠、珠间细缢缩、微透亮、叶轴栗色（挂枝语境直接证据）〔**终审荚果可见性不承重**：双问自相矛盾（无果 vs 念珠串清晰）——荚果锚顶替 fruit-c；附带双问一致佐证：左上绿枝+浅色皮孔〕 |
| fruit-b | ref-sophora-fruit-b.jpg | 426330055 | 239380730 | 2024-09-02 | 北京市海淀区 | CC-BY-NC | https://inaturalist-open-data.s3.amazonaws.com/photos/426330055/original.jpg | 荚果特写：3 枚亮绿念珠状荚果平铺、2–4cm、每串 3–6 节圆珠、光滑肉质、灰色岩石背景 |
| fruit-c | ref-sophora-fruit-c.jpg | 567225330 | 314064945 | 2025-09-15 | 浙江杭州 | C（版权保留） | https://static.inaturalist.org/photos/567225330/original.jpg | 手持念珠果：单串 8–10cm、4–5 节圆珠、绿-黄绿肉质饱满、手持标尺（判读经 static medium URL，S3 无副本） |
| twig-a | ref-sophora-twig-a.jpg | 616353522 | 338878497 | 2026-02-14 | 山西太原 | CC-BY-NC | https://inaturalist-open-data.s3.amazonaws.com/photos/616353522/original.jpg | 冬态冠部仰观：无叶大树、粗大主枝辐射开展、细枝 zigzag 之字形密网呈 lace 轮廓、树皮深灰褐纵裂 ridged（换措辞二次复读一致） |

## 域扩展节：plant

（字段定义见 `.zcode/skills/asset-research/references/plant-schema.md` v0.2）

### A. 干与枝

- `trunk_height_ratio`：两相并存——开放生长低分枝（NC 原句 [4]）↔ 培训高干（行道/公园相，净干 2–3m 级 Inferred）；建模建议公园语境净干占比 ≈0.25–0.35（弱推断）
  - Form: Qualitative / Range | Evidence Status: Verified（两相）/ Inferred（数值）| Source: [4][6]
- `trunk_taper_ratio`：Unknown
  - Form: Unknown | Evidence Status: Unknown
- `basal_flare_ratio`：照片 bark-a 古树干基判「粗厚基部」方向（弱）；无标定——Unknown
  - Form: Unknown | Evidence Status: Unknown / Inferred（方向弱）| Source: [6]
- `trunk_lean_angle`：Unknown（整树照 form-a/b 主干近直，弱读向）
  - Form: Unknown | Evidence Status: Unknown | Source: [6]
- `branching_levels`：3–4 级可见（twig-a 冬态细枝密网，弱单源）
  - Form: Value | Evidence Status: Inferred | Source: [6]
- `scaffold_branch_count`：Unknown（无标定整树样木；form-a 判「主枝低位放射」数量 4–6 级弱读向不承重）
  - Form: Unknown | Evidence Status: Unknown | Source: [6]
- `scaffold_angle`：Unknown（定量）；定性：**大枝自低位放射、开展-平展**（form-a「主枝低位放射」[6]；NC branch low [4]；form-b 老树大枝水平-下垂 gnarled [6]）——开展横展语言
  - Form: Unknown / Qualitative | Evidence Status: Unknown（定量）/ Verified（定性）| Source: [4][6]
- `branch_orientation`：小叶在叶轴上对生或近互生（[1]——叶序非枝序）；骨架枝排列 Unknown
  - Form: Qualitative + Unknown | Evidence Status: Verified（小叶对生）/ Unknown（骨架排列）| Source: [1]
- `branch_length_decay` / `branch_radius_decay` / `branch_attachment_t` / `allometry_exponent`：Unknown（与先例同缺口，不伪造）
  - Form: Unknown | Evidence Status: Unknown
- `apical_dominance`：中庸-失去领导（开放生长圆冠读向；NC rounded + branch low [4]；form-a 冠宽>高 [6]）——非强领导型（vs 银杏/悬铃木直立主轴）
  - Form: Qualitative | Evidence Status: Verified（圆冠园艺）/ Inferred（优势状态读向）| Source: [4][6]
- `branch_curvature`：**大枝开展-平展、老树 gnarled 下垂端 + 末级枝 zigzag 之字形**（twig-a zigzag 单源 [6]；form-b 水平-下垂 [6]）——非整体下垂型（vs 龙爪槐全面下垂 [1]）
  - Form: Qualitative | Evidence Status: Inferred（照片）/ Verified（龙爪槐对照原句 [1]）| Source: [1][6]

### B. 叶与冠

- `leaf_attachment_rule`：**一回羽状复叶在枝上互生**（leaf-c 照片单源 + FOC 属级语境 [3]）；着生于末级枝（当年生绿色枝 [1][2]）
  - Form: Qualitative | Evidence Status: Inferred（互生着生单源）/ Verified（当年生枝着生）| Source: [1][2][3][6]
- `leaf_cluster_density`：1 枚羽叶/挂点；冠面密度由细碎小叶大量层叠产生
  - Form: Value | Evidence Status: Inferred | Source: [1][6]
- `clump_scale`：羽叶（15–25cm）≈ 1/20–1/30 冠幅级结构单元；果串（2.5–8cm）为冠面离散附属信号
  - Form: Relative | Evidence Status: Inferred | Source: [1][2][6]
- `leaf_orientation_dist`：羽叶**平展层叠**（form-a 判「叶片细碎均匀铺展」[6]；无志书「平展」原句——弱于栾树「叶平展」[FRPS 栾树] 的证据位，Inferred）
  - Form: Qualitative | Evidence Status: Inferred | Source: [6]
- `leaf_size`：复叶总长 15–25cm（Verified [1][2]）；小叶 2.5–6 × 1.5–3cm 卵状披针形/卵状长圆形（Verified [1][2]）；小叶 4–7 对 + 顶生（Verified [1]）
  - Form: Range | Evidence Status: Verified | Source: [1][2]
- `leaf_aspect_ratio`（小叶长/宽）：≈1.7–2.7（文献 2.5–6 × 1.5–3cm 推算；照片 leaf-a 读 2–4cm 长圆同域 [6]）
  - Form: Range | Evidence Status: Verified（文献推算）/ Inferred（照片）| Source: [1][2][6]
- `crown_transparency`：空隙 ≈10–20%（form-a「树冠浓密」单源 [6] +「冠大荫浓」通说 [1]）
  - Form: Relative | Evidence Status: Inferred | Source: [1][6]
- `crown_fill_gradient`：Unknown（无判读）
  - Form: Unknown | Evidence Status: Unknown
- **复叶形态组（schema 无专字段——挂本组记档，家族复叶第二例/首例一回口径）**：一回奇数羽状；小叶 4–7 对对生或近互生 + 顶生小叶；小叶全缘（属级 [3]）、先端渐尖具小尖头、基部宽楔形或近圆稍偏斜、纸质；上面中绿亮绿、**下面灰白色**（两面色差 [1][2]）；小托叶 2 枚钻状；托叶多变早落；**叶柄基部膨大包裹腋芽（藏芽）**；叶轴初被疏柔毛旋即脱净；幼态叶偏大偏圆（单源记档）
  - Form: Qualitative + Range | Evidence Status: Verified（除注明外）/ Inferred（幼态）| Source: [1][2][3][6]
- **花序形态组（挂点附属物一）**：顶生金字塔形圆锥花序 15–30cm、花小（旗瓣 ≈11mm）白/乳白/淡黄、旗瓣紫脉纹、微香、花期 7–8 月——**建模判定建议：不做主相必备件，低频变体档可选**（理由记 §5）
  - Form: Range + Qualitative | Evidence Status: Verified | Source: [1][2][4][6]
- **荚果序形态组（挂点附属物二）**：串珠状（moniliform）肉质荚果 2.5–5cm（或稍长，照片实测至 8–10cm）径约 1cm、绿→黄褐色序、不开裂、种子 1–6、珠间缢缩可见（照片裁定）、沿结果枝下垂串生、8 月起挂枝 + 宿存冬挂——**建模判定建议：做**（理由记 §5；判定归任务书终审）
  - Form: Range + Qualitative | Evidence Status: Verified | Source: [1][2][4][6]

### C. 表皮与芽

- `bark_archetype`：**深-中纵裂厚脊沟型（无剥落）+ 局部瘤状突起**——灰褐-深灰褐基调、脊厚沟深（随龄加深）、沟浅红褐（NC [4]）、暗色瘤突与愈合疤（照片三源 [6]）；随树龄序列：幼-中龄纵纹浅裂（FOC striate [2]）→ 大树深裂厚脊（NC + 照片 [4][6]）
  - Form: Qualitative | Evidence Status: Verified（纵裂基调三源）/ Inferred（瘤突/沟红褐照片单-双源）
  - Source: [1][2][4][6]
- `bark_color`：灰褐-深灰褐（FRPS 灰褐色 [1]；NC grayish brown + furrows reddish-brown [4]；照片近黑-深褐古树端 [6]）——单色系基调 + 沟浅红褐暗部
  - Form: Qualitative | Evidence Status: Verified | Source: [1][4][6]
- `bark_relief`：**中-高浮雕**（脊厚沟深、块状；vs 栾浅色光滑低浮雕、朴浅裂低浮雕）——古树端深沟（bark-a [6]）
  - Form: Relative | Evidence Status: Inferred | Source: [4][6]
- `bark_epiphytes`：干基藓斑局部（bark-c 低置信 [6]）
  - Form: Qualitative | Evidence Status: Inferred（低置信）| Source: [6]
- `twig_surface`：**当年生枝绿色、无毛（FRPS/FOC 双原句 [1][2]）**——身份特征（落叶期近景独有信号）；皮孔描述志书无原句——Unknown；老枝灰褐（照片 bark-a 细枝灰褐 [6]）
  - Form: Qualitative + Unknown | Evidence Status: Verified（绿枝）/ Inferred（老枝灰褐）/ Unknown（皮孔）| Source: [1][2][6]
- `bud_aspect`：**芽本体形态 Unknown**（志书无芽描述）；仅藏芽结构 Verified（叶柄基部膨大包裹芽 [1][2]）——冬芽细节不可考，不进建模
  - Form: Unknown / Verified（藏芽）| Evidence Status: Unknown / Verified | Source: [1][2]

## 检索与证据备注

- 网络可达性（2026-09-21 本机）：**iplant.cn 数据端点全链可达**——FOC 种级（key=Sophora japonica，6915B）+ FOC 属级（key=Sophora，36183B）+ FRPS 种级（key=**Styphnolobium japonicum**，10694B，frpslink 确认「第40卷 (1994) >> 092页」任务书锚属实）。**重要通道发现：FRPS 端点以 Sophora japonica 为 key 返回空（200 + 0 字节），以 Styphnolobium japonicum 为 key 返回全文**——iplant FRPS 库按现用名索引条目（FRPS 文本本身仍是 Sophora japonica 口径）；主代理探测的「FRPS JSON 端点 404」实为 302→/404.html（/frps/ashx/ 路径）与空响应（/ashx/ 正确路径 + 旧 key）的组合，端点本身健在。`/frps/Sophora%20japonica` HTML 页 curl 直取为 404 存根（非 JS 渲染页），未消耗 agent-browser 轮次。eFloras curl 可达但任务书所给 taxon_id=200012269 实为 Parkia timoriana（页内容核对证伪），flora_search 检索端点 500——按先例（银杏 Spec 同教训）弃 eFloras，FOC 轴以 iplant 端点全文为准（先例终审验证模式）。**Wikipedia EN 双页 curl+WebFetch 全超时**（与主代理探测一致）。WebSearch 与 web_reader MCP 月度配额均未恢复（2026-10-04 13:58 重置，错误码 1310）——全程未采用其无来源输出（一次测试性调用的训练数据线索 taxon_id=200012283 经 eFloras 直核证伪，未采信）。NC State Extension WebFetch 可达（园艺轴主源）。GBIF API 可达（结构化命名证据）。
- iNat 链路：taxa API 确认 **Styphnolobium japonicum = taxon 53945（active，Japanese pagoda tree）**；api.inaturalist.org v1 observations 端点大响应（>650KB）在本网络中途截断（JSON 尾部损坏），换 **www.inaturalist.org/observations.json**（先例 koelreuteria 同通道）成功：中国池（place_id=6903）39 obs + 无地域世界池 200 obs（photos=true & quality_grade=research），合并去重 437 photo，月份分布峰 7 月（99）/9 月（56）与花果物候吻合。照片池种池纪律：仅取 taxon name = Styphnolobium japonicum 的 obs（f. pendula 龙爪槐在 iNat 无独立 taxon，池内未见明确垂枝形态个体；判读中未见下垂枝型照片）。
- 图片获取与判读：分层抽样 69 张（CN 每 obs 1 张全保留 + 世界池 7/9/10/12/1 月配额）下载 medium；**static.inaturalist.org 并行 ≥5 触发 Cloudflare 拦截（846B 挑战页）**，换 inaturalist-open-data.s3.amazonaws.com S3 CDN 成功 56 张。判读通道 = GLM-4.5V（mcp__4_5v_mcp__analyze_image）直喂**远程 URL**（S3 域稳定可用；**static.inaturalist.org 域被 4.5V 服务端拒收，一律报 1210 格式错**——本地字节完整 JPEG，判定为该域对 4.5V 出口不可达，非照片损坏）。发现两条通道纪律：①4.5V 连续判读约 8–10 张后出现全量 1210 退化（含先前成功 URL），间隔 ≥30s 后恢复（先例「并行视觉调用退化」同型，全程小批量 ≤4、退化即等待）；②**S3 桶对 2025 年中之后上传的部分照片无 medium/original 副本**（HEAD 404，如 578621555/578621432/567225330/300599788/566588416/578621181 等 12 张）——此类照片仅 static 域有副本而 static 域判读不可达，**578621555/567225330 两张在通道纪律发现前经 static medium 判读成功留用**（判读时点 2026-09-21，static 域对 4.5V 拒收为此前一小段窗口后确认），其余 10 张弃。original 下载按「S3 优先双试探扩展名（HEAD 200 验证）→ static 兜底」执行，本地 JPEG 头校验通过。
- **判读架构与诚实记档**：本会话判读通道 = S3 直链 GLM-4.5V 单视觉系统（中性提问不含树种名，逐张独立判读不拼贴——先例证伪拼贴板）；twig-a（616353522）做换措辞二次复读一致（冬态/zigzag/深纵裂三要素复现）。**任务书「主代理终审做两次独立视觉提问」由主代理执行，本 Spec 判读为一系统初判 + 每张中性描述记录**；异系统交叉未在本调研执行（无第二视觉系统可用），承重照片建议主代理终审轮抽验。
- **排除照片记档**：photo 541140642（obs 300337143，湖南岳阳平江 2022-07-23）判读为「腋生下垂总状花序、白花、细长轴悬挂簇」——与槐顶生圆锥花序结构矛盾，疑近缘种误鉴定 obs 或异型个体，**整 obs 排除不入池**；photo 192772694（郑州 2022-05-01 幼株近距）判为幼态/萌条相（小叶圆-倒卵先端微凹），非典型成株相，不入终选仅幼态记档。
- 尺度结构事实优先级执行：树高/复叶/小叶/花序/花部/荚果/物候/绿枝/树皮基调全部以 FRPS 40:92 + FOC Vol.10 原句为准（iplant 端点全文，frpslink 页码锚核对）；NC 作园艺交叉与北美栽培口径（与志书冲突处——荚果 3–8in 宽域、FOC 原生地日韩说——一律记档不采信或标注）；照片轴封顶 Inferred（除直接视觉证据如两面色差、金字塔形轮廓、串珠造型作照片级 Verified-in-image 承托并标注）。

## 结构性缺口（Unknown Gate 相关）

- **中龄 8–12m 带标定单干整树样木缺失**：照片整树仅 form-a（大同庭院中龄，无标定读数）+ form-b（多干古树老树端）——冠幅比 0.9–1.2、净干占比、骨架枝数量/仰角定量全部 Unknown 或弱 Inferred；工程锚定中龄单干相时建议补研（公园整树照片专项带参照物）或在锚点门以文献域 + 主代理裁定收口。
- **花序建模判定的强度证据缺口（低阻塞）**：花色淡（乳白/淡绿白）为中距低对比的判定基于照片双源 + 文献，**「夏花相做不做」终审归主代理/任务书**（本 Spec 建议：不做主相必备件、低频变体档可选——若项目需要 7–8 月相时间切片则翻转）。
- **荚果建模判定待终审**：本 Spec 建议「做」（串珠独有造型 + 长可见窗口），与花不同为强信号——判定归任务书终审。
- **芽形态 Unknown**：志书属级/种级无芽描述，仅藏芽结构（叶柄基膨大包裹芽）；不影响夏绿主相，冬相立项时须专项补研。
- **小叶柄长度无志书原句**：按照片近无柄-短柄 Inferred 记档（≈1–3mm 级），无伪精确。
- **小叶脉型无志书原句**：照片 Inferred（中脉显著、侧脉羽状细密）。
- **骨干枝定量**（数量/仰角/衰减比/异速指数/着生区间）：与先例同缺口，不阻塞。
- **幼态叶相**：单源照片（192772694），不归纳；幼树相建模时须补证。
- **秋色定量**（金黄短暂 NC 单源）：记档不建模。
- **国槐 vs 近缘（白花槐/宜昌槐等）公园语境混植占比**：无来源——FRPS 分布句（华北-黄土高原原产多见）+ 栽培史支持槐绝对主力，判定不阻塞（iNat 中国池 39 obs 全部 taxon 53945 亦旁证）。

## 终审记档（主代理，2026-09-21）

**① 硬数值独立抽查 27/27 全过**：主代理自 iplant 数据端点独立重拉 FRPS 40:92（key=Styphnolobium japonicum，10694B，frpslink「第40卷 (1994) >> 092页」核对）与 FOC Vol.10 种级（key=Sophora japonica，6915B）全文，对 Spec 引用的 27 条硬数值逐位比对——树高 25m/树皮灰褐纵裂/当年生枝绿色/羽状复叶 25cm/叶柄基膨大藏芽/小叶 4-7 对/卵状披针-卵状长圆/2.5-6×1.5-3cm/渐尖小尖头/下面灰白/小托叶 2 钻状/花序顶生金字塔 30cm/旗瓣 11mm/荚果串珠 2.5-5cm 径 10mm/种子 1-6/花期 7-8 果 8-10/FRPS 异名行 + FOC Trees to 25m/leaflets 9-15/Leaves 15-25cm/blades 2.5-6×1.5-3/moniliform 2.5-5×ca.1cm/Synonym 行/current year green/bud hidden/Panicles terminal to 30cm——全部原文命中。两处初判 FAIL 复核为主代理匹配串笔误（漏逗号）与 FOC 原文跨行连字符「con-stricted」（Spec 去连字规范转写正确）。**零不一致。**

**② 照片终审（008.6 返修规程：两次独立中性视觉提问一致方定名）**：判读通道 = 本地完整副本 → Read 工具 CDN 转存 → GLM-4.5V 远程 URL 中性判读（S3/static 直链通道当日退化不可用，CDN 转存通道稳定——与 011.8 Step 4 记档同机制）；提问不含树种名。**承重照片 5 张双问全一致定名**：
- **leaf-a** ✅✅：奇数羽状复叶 ~10–12 枚小叶对生-近对生 + 顶生小叶单生 + 全缘 + 渐尖 + 背面灰白——两问逐点一致（复叶结构照片锚成立）
- **bark-a** ✅✅：灰褐-深灰褐 / 脊宽厚沟深（厘米级）/ 纵为主局部交叉网状 / 暗色瘤疣突散布 / 愈合残桩疤痕——两问一致；**沟底深色无红褐调**（两问独立同报）
- **bark-b** ✅✅：灰褐 / 宽厚脊 + 中等沟深 / 纵为主局部互锁 / 少量散在暗色瘤突 / 粗壮干——两问一致（判读干龄偏「老干」vs 调研记「中龄」，形态语言不受影响）；附冠面「中绿细碎均质叶幕」读向
- **fruit-c** ✅✅：念珠状 4–5 节 / 珠间缢缩可见 / 珠径 0.8–1.2cm / 全长 8–10cm / 黄绿光滑肉质——两问逐点一致（**荚果承重锚，顶替 fruit-a**）
- **twig-a** ✅✅：细枝之字形 zigzag + 末梢尖锐 + 粗大主枝辐射开展 + lace 密网 + 深灰褐纵裂脊树皮——两问一致（冬态身份读向照片锚成立）

**③ 不承重处置两张（011.8 leaf-a 先例口径）**：
- **form-a 不承重**：主代理双问一致否定调研判读摘要的构图主张——画面**无树干、无栏杆/地面/行人、仅树冠中下部入镜**（调研摘要「整树庭院照/干粗/栏杆参照」证伪——疑调研代理判读轮与它照混淆或基于 73% 截断副本误读；主代理已重取完整文件并核 Content-Length 逐字节吻合）；两问在「有无花」上互相矛盾（Q1 花串成片 vs Q2 无花）再加不确定。**冠幅比 0.9–1.2 的照片支撑撤销**，落 NC 等宽域单独承托（Inferred 维持）；Q1「横向铺开幅度大、宽冠推测」弱同向记档不承重
- **fruit-a 不承重（荚果可见性）**：Q1「无果」vs Q2「念珠串清晰」自相矛盾——视觉模型对该照片稀疏小目标不可靠；**荚果身份锚顶替为 fruit-c（双问一致）+ 文献 Verified**。附带收获：两问独立一致读到「左上绿色嫩枝带浅色皮孔」——**当年生枝绿色+皮孔获照片级佐证**（与 FRPS/FOC 双原句互证）

**④ 终审裁决十项**（分歧与开放判定收口；开发 Agent 按本节执行）：
1. **命名口径**：资产按任务书锚定现用名 Styphnolobium japonicum (L.) Schott；任务书「FOC 拆属」表述**证伪记档**（FRPS 40:92 与 FOC Vol.10 均采 Sophora japonica 传统口径、FOC 属级将 Styphnolobium 整属列异名；现用名侧为 FOC 之后现代分子系统处理，GBIF 结构化支持）——形态原句两名同实体，无分类学争议
2. **树高锚**：生产域 8–12m 维持（上限 25m = 老树端不采），**slot-0 锚 ≈10m**（中龄公园个体中庸；开展宽冠树高不宜取高端——冠幅比族内最宽档 0.9–1.2 与树高负相关读向记档）
3. **花建模判定：不做**——乳白/淡绿白低对比 + 7–8 月窗口短 + 身份五信号（冠形+羽叶+串珠果+绿枝+树皮）已足；决策链对照：栾树夏花属相内金黄强信号故做 / 国槐夏花属相内淡色弱信号不做 / 乌桕重阳木花不做——口径一致
4. **荚果建模判定：做**——moniliform 串珠造型九资产独有 + 可见窗口 8 月至冬挂（9–10 月盛挂期属相内）+ 绿→黄褐色序可辨；账目法零 rng 确定性（triadica 绿闭果 / koelreuteria 灯笼串先例）
5. **荚果建模主域**：长 2.5–8cm（志书 2.5–5「或稍长」+ fruit-c 实测 8–10 上段）、珠径 ≈1cm、每串 3–10 珠、**珠间缢缩可见**（照片裁定，FRPS「不明显」不采信——记档）；色序绿→黄绿→黄褐
6. **树皮第 10 语言定稿**：灰褐-深灰褐**深纵裂厚脊沟**（脊厚沟深板状粗犷）+ **纵为主局部交叉网状次级层**（老干/High 近景）+ **散在暗色瘤状突起**（老干身份点，九资产独有维度）+ 愈合疤弱表达；**沟底红褐降级不做**（NC 单源园艺句、照片轴双问皆读沟底深色无红调——Inferred 降 Unknown 级，不冒充）
7. **冠幅比 0.9–1.2 维持**（NC 等宽域承托 Inferred；form-a 照片支撑撤销后证据面收窄如实记档）——族内最开展档（开展宽圆头、冠大荫浓读向的几何落点）
8. **当年生枝绿色+皮孔**：双志原句 Verified + fruit-a 附带照片佐证——材质侧绿枝收敛+皮孔实现（011.8 重阳木当年生枝绿先例同法）
9. **末级枝 zigzag 之字形**：twig-a 双问一致照片锚——夏绿主相叶幕覆盖下弱表达记档（细枝 wander 方向性依据），冬态不建模
10. **小叶叶序**：对生或近互生（FRPS 原句）+ 顶生小叶（奇数羽状）——**与 011.10 白蜡小叶对生形成复叶系内同型不同数值对照轴**（国槐 4–7 对 vs 白蜡预期 2–4 对〔随 011.10 Spec 定〕；对生细节读向两树共享、计数与形态各异）

**⑤ 通道记档（本轮实况，与调研轮差异）**：S3 original 直链对 4.5V 服务端全量 1210 退化（调研轮同型、等待未恢复）；**Read→CDN 转存通道全程稳定**（11 次判读零失败——011.8 Step 4 同机制再证）；本地副本 6 张下载截断（S3 传输不稳，3–211 字节级）——PIL 截断容忍重编码修复 + 1 张 S3 重下 + Content-Length 核对；static.inaturalist.org 当日被 Cloudflare 拦截（original 返回挑战页非 JPEG）。硬数值轴 iplant 双端点全程可达。
