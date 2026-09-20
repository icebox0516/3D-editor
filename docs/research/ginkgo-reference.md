# ginkgo Reference Spec

Spec Version: 1.0
Domain: plant
Asset: ginkgo（银杏）
Updated: 2026-09-20

> 关键事实统一写法（各节内联、逐条标注；Source 填来源表编号）：
> Form ∈ {Value, Range, Relative, Qualitative}；Evidence Status ∈ {Verified, Inferred, Unknown}。
> 工程预算（面数/LOD 阈值）不进本文件，归任务书。真实照片本地副本为 `screenshots/ref-tmp/` 下 ref-ginkgo-*.jpg（不入 git、不进 Runtime）。

## 1. 身份

银杏科（Ginkgoaceae）银杏属（Ginkgo）**落叶乔木**，**单科单属单种**活化石（中生代孑遗）——无种下分类争议 [1][2][3]。使用语境：中国/东亚及世界温带城市公园、行道落叶乔木；本资产服务中距离为主的园区可视化，近景（数米）材质细节需可信，目标龄级锚 = **中龄公园典型单干银杏（雄株口径）**，夏季生长季观感（与夏栎 ≈8m、朴树 ≈8.5m、樟树、榉树同语境可混植量级）。秋色金黄/落叶/种子（白果）均不建模（记档见 §6）。

- 种定名：**Ginkgo biloba Linn.**（银杏，本草纲目；别名白果/公孙树/鸭脚子/鸭掌树），FRPS 第 7 卷 (1978) p.18 收录，下列 12 个栽培变种（洞庭皇/佛指/大马铃等）全部为**果用品种**（核形/种仁品质分化），非形态学亚种——生产口径无需种下分裂 [1]
  - Form: Value
  - Evidence Status: Verified
  - Source: [1][2]
- 单科单属单种确认：FOC Vol.4 Ginkgoaceae 科级直接给出种级形态描述（「银杏属：形态特征与地理分布与科相同」，属下仅 1 种 G. biloba）——科级描述即本种形态学基准 [2][3]
  - Form: Value
  - Evidence Status: Verified
  - Source: [2][3]
- 落叶性：落叶乔木（FRPS「乔木」+「秋季落叶前变为黄色」；FOC 科级 "Trees deciduous"；OSU "Broadleaf deciduous tree"）[1][2][3][4]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][3][4]
- **雄株口径（重点问题）**：雌雄异株（FRPS「球花雌雄异株」；FOC "dioecious"）；城市绿化以雄株为主的三源一致口径——Wikipedia「Many intentionally planted ginkgos are male cultivars … because the male trees will not produce the malodorous seeds」[5]；NC Extension「Seeds from female trees are messy and have foul-smelling flesh, so **planting grafted male trees is often preferable**」+ 品种表标注 'Autumn Gold' "All male cultivar"、'Mariken' "male tree" [6]；OSU「**Seedless (male) cultivars are commercially available**」+ male selections 品种列表 [4]。雌株果实异味机制：种子外种皮「熟时黄色或橙黄色，外被白粉，**有臭味**」（FRPS 原句）[1][2][4][5][6]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][4][5][6]
- **雌雄株形态差异（有据）**：FRPS 原句「枝近轮生，斜上伸展（**雌株的大枝常较雄株开展**）」——雌株大枝较开张、雄株大枝较斜上收敛，志书明文。侧证：商业雄株无性系品种冠形普遍窄化（Princeton Sentry® 18×6m 直立柱状、'Magyar' 15×9m upright、Autumn Gold™ 12×9m 阔圆锥——OSU；'Sky Tower' 18×8ft compact upright——NC），选育方向与「雄株较不开张」读向同向 [1][4][6]
  - Form: Qualitative
  - Evidence Status: Verified（FRPS 原句）/ Inferred（品种侧证）
  - Source: [1][4][6]
- 本资产锚定口径：**雄株形（大枝斜上较收敛、圆锥-广卵冠）**；照片证据（丹霞山 3 月雄球花株 [7]）为雄株直接影像
  - Form: Qualitative
  - Evidence Status: Verified（口径）/ Inferred（影像株性别判定）
  - Source: [1][7]
- 园艺地位：FOC Comment 记「widely cultivated as an ornamental, probably for more than 3000 years … provides shade … often planted near temples」；FRPS「银杏树形优美，春夏季叶色嫩绿，秋季变成黄色，颇为美观，**可作庭园树及行道树**」；OSU/NC 记耐污染、耐旱、城市街道/步行道推荐树种 [1][2][4][6]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][4][6]

## 2. 主要尺度

- 物种上限树高/胸径：**高达 40m、胸径可达 4m**（FRPS/FOC 同句，极值）[1][2]
  - Form: Value
  - Evidence Status: Verified
  - Source: [1][2]
- 栽培成熟域：Wikipedia「normally reaching a height of 20–35 m」；NC Extension「It can grow **50 to 80 feet tall and 30 to 40 feet wide**」≈ 15–24m 高 × 9–12m 宽；OSU「reaches 50+ ft (15+ m) tall」——合并 **15–24m 高 × 9–12m 宽**（冠幅比 ≈0.5–0.6 与 §3 照片判读一致）[4][5][6]
  - Form: Range
  - Evidence Status: Verified
  - Source: [4][5][6]
- 雄株品种冠形域（园艺证据，8 槽形态向量可用轴）：Autumn Gold™ 12×9m（broad conical）/ 'Magyar' 15×9m（upright）/ Princeton Sentry® 18×6m（柱状）/ Shangri-la® 14×7.5m（紧凑密枝）/ NC 另记 'Sky Tower' 5.5×2.4m 紧凑直立——**窄冠-阔圆锥两端真实分化** [4][6]
  - Form: Range
  - Evidence Status: Verified
  - Source: [4][6]
- 公园中龄典型个体（目标龄级锚）：无权威文献直接数值。**照片带尺度样木**：form-c（Buchanan VA，行人 ≈1.7m 参照）判高 **≈8–10m** [7]。弱推断：公园中龄个体 ≈8–12m（栽培域下段 + 慢生-中速 + 照片样木），任务书锚定 ≈8m 在照片实测域内，与四先例同量级可混植；按冠幅比 0.55–0.65（§3）对应冠幅 ≈4.5–8m（8m 个体 ≈4.5–5.5m）
  - Form: Range
  - Evidence Status: Inferred（照片带尺度实测 + 栽培域下段推断）
  - Source: [4][6][7]
- 叶片（扇形宽度口径）：**顶端宽 5–8cm**（FRPS「顶端宽5-8厘米」；FOC「usually 5-8 cm wide」）；OSU 记 3–7.5cm long and wide；Wikipedia「usually 5–10 cm, sometimes up to 15 cm」——文献交叉取**宽 5–8cm（短枝典型叶）**；照片实测叶宽：canopy-b ≈6–8cm / shoot-b 5–7cm / leaf-b ≈7cm（手参照）——照片与文献一致 [1][2][4][5][7]
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][2][4][5][7]
- 幼树/萌生枝极端叶：「幼树及萌生枝上的叶常较大而深裂（**叶片长达 13 厘米，宽 15 厘米**），有时裂片再分裂（这与较原始的化石种类之叶相似）」（FRPS 原句）；FOC "to 13 × 8(-15) cm on young trees"——**中龄公园个体不以幼树极端叶为主相** [1][2]
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][2]
- 叶柄：**细长**，柄长 3–10cm、多为 5–8cm（FRPS）；FOC "(3-)5-8(-10) cm"；照片实测 shoot-b 4–7cm / leaf-b 5–6cm / canopy-b 柄≈叶宽——**柄长与叶宽同量级（≈1:1）**，显著长于榉树粗短柄（2–7mm）三个数量级观感差 [1][2][7]
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][2][7]
- 长枝节间：**(1–)1.5–4cm**（FOC "internodes (1-) 1.5-4 cm"）——长枝叶挂点间距的直接文献值；照片 shoot-a 判 ≈3–5cm（与文献域上段吻合）[2][7]
  - Form: Range
  - Evidence Status: Verified（文献）/ Inferred（照片）
  - Source: [2][7]
- 短枝年伸长量：「they may grow only one to two centimeters in several years」（Wikipedia）——短枝距状观感的成因 [5]
  - Form: Range
  - Evidence Status: Verified
  - Source: [5]
- 种子（白果，不建模记档）：长 2.5–3.5cm、径约 2cm（FRPS「长2.5-3.5厘米，径为2厘米」）；FOC "2.5-3.5 × 1.6-2.2 cm"；具长梗下垂，外种皮肉质熟时黄/橙黄色被白粉有臭味，中种皮白色骨质 2–3 纵脊；**种子 9–10 月成熟**（照片 seed 判「长梗下垂自短枝叶簇」）[1][2][7]
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][2][7]
- 花与物候：球花单性雌雄异株，**生于短枝顶端的鳞片状叶的腋内，呈簇生状**（FRPS/FOC 科级同口径；照片 malecones 判雄球花短枝顶鳞叶腋内 3–6 枚/簇、淡黄绿、≈幼叶长 1/3–1/2）；雄球花葇荑花序状下垂长 1.2–2.2cm（FOC）/2.5cm（OSU）；**花期 3–4 月**（FRPS「花期3-4月」/FOC "Pollination Mar-Apr"）[1][2][3][4][7]
  - Form: Range + Qualitative
  - Evidence Status: Verified
  - Source: [1][2][3][4][7]

## 3. 轮廓与比例

- 冠形发育序列（重点问题）：**「幼年及壮年树冠圆锥形，老则广卵形」（FRPS 原句）**；FOC "crown conical initially, finally broadly ovoid"；Wikipedia「conical crown in youth which becomes progressively broader and more irregular with age」+「angular crown and long, somewhat erratic branches」；OSU「usually pyramidal, excurrent (dominant main leader), but variable」；NC「This tree's pyramidal shape … main attractions」——五源一致 [1][2][4][5][6]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][4][5][6]
- 中龄公园个体锚定相（重点问题）：**圆锥形后段/圆锥→广卵过渡相**——依据链：FRPS 相位界定「幼年及壮年」= 圆锥形（8–12m 公园个体属幼-壮年期，非「老则广卵」相）+ 照片三夏绿样木（≈8–10m 带参照）判「broadly conical to ovoid / broadly conical (pyramidal) to broadly ovoid / conical-ovoid」+ 大树样木（bark-b、fall）判「broadly ovoid, irregular」（老相冠幅比 0.65–0.7 显著更宽）。**建模主相应保留明显圆锥/金字塔读向，顶部圆化、轮廓轻微不规则** [1][7]
  - Form: Qualitative
  - Evidence Status: Inferred（照片三样木 + 文献相位界定交叉）
  - Source: [1][7]
- 冠幅/树高比：**≈0.55–0.65**（中龄三样木：form-a 0.55–0.6 / form-b 0.6 / form-c 0.55；大树两样木 0.65–0.7）——**五资产中最窄冠**（朴树 0.8–0.9、榉树 0.8–0.95、樟树 0.7–0.85、夏栎 0.8+），圆锥/金字塔冠所致；NC 栽培域 30–40ft 宽 / 50–80ft 高 ≈ 0.5–0.6 同向 [6][7]
  - Form: Range
  - Evidence Status: Inferred（照片多样木 + 栽培域交叉）
  - Source: [6][7]
- 主干分枝点高度占比（干高/树高）：≈0.30–0.40（form-a 0.35 / form-b 0.40 / form-c 0.30–0.35 / bark-b 0.35 四样木）[7]
  - Form: Range
  - Evidence Status: Inferred
  - Source: [7]
- 主干姿态：**通直**（form 三样木 + bark-b 判「straight」一致）；excurrent 强领导干（OSU）[4][7]
  - Form: Qualitative
  - Evidence Status: Inferred（照片）/ Verified（excurrent [4]）
  - Source: [4][7]
- 主枝着生与开张（重点问题）：**「枝近轮生，斜上伸展」（FRPS 原句）**——主枝近轮生（whorled/near-whorled）+ 斜上（ascending）；照片判读交叉：form-b「semi-whorled」、form-c「near-whorled」、骨架枝仰角（对铅垂）30–55°（form-a）/35–55°（form-b）/35–50°（form-c）/40–60°（bark-b 大树）——**雄株斜上口径与照片一致** [1][7]
  - Form: Qualitative + Range
  - Evidence Status: Verified（轮生斜上 FRPS）/ Inferred（角度照片）
  - Source: [1][7]
- 冠层密度（生长季）：中-密——canopy-a 逆光空隙 **25–35%**、外密内疏（foliage concentrated at crown periphery）、内膛细枝网可见；叶质**细密 fine texture**（form 三样木一致）[7]
  - Form: Relative
  - Evidence Status: Inferred
  - Source: [7]
- 内膛枝现象：存在——canopy-a 判「thin inner branchlets visible」（冠内细枝可见、不密）[7]
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [7]

## 4. 结构层级

部件树：主干 → 骨架枝（**近轮生**、斜上）→ 二级枝 → **长枝（延伸枝）+ 短枝（距状 spur）二型系统** → 叶（长枝上螺旋散生 / 短枝上莲座簇生）。

- **长短枝二型系统（银杏独有身份特征，重点问题）**：FOC 科级术语级「**branchlets dimorphic: both long and short**」；FRPS「一年生的长枝淡褐黄色，二年生以上变为灰色，并有细纵裂纹；**短枝密被叶痕，黑灰色，短枝上亦可长出长枝**」；Wikipedia 机制描述「短枝自二年生枝叶腋发育、节间极短（数年仅伸长 1–2cm），叶似簇生于短枝顶端，**生殖结构仅生于短枝**；长枝上叶互生间隔展开；短枝经数年可转变为长枝（或反之）」[1][3][5]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][3][5]
- **短枝叶簇数（重点问题，挂点语言核心数值）**：**「叶在一年生长枝上螺旋状散生，在短枝上3-8叶呈簇生状」（FRPS 原句）**；OSU 园艺口径「in clusters of **3-5** per spur」；照片实测三源：canopy-b 判 4–7（3–8）/ shoot-a 判 5–8（4–9）/ shoot-b 判 4–6（3–7）——**文献+园艺+照片合并取 3–8 片/短枝、典型 4–6**；任务书「3–8(–10)」之上限 (–10) **未见独立文献来源**（疑与 FOC 叶柄 "(3-)5-8(-10) cm" 数值串写），照片实测上限 9，建模域以 3–8 为准 [1][4][7]
  - Form: Value + Range
  - Evidence Status: Verified（FRPS 3–8）/ Inferred（典型值与照片实测）
  - Source: [1][4][7]
- 短枝叶簇几何：**辐射状莲座（radial rosette）**——照片 canopy-b「radially arranged like a rosette」+ shoot-a「叶对枝轴近垂直、略前倾」；叶簇在短枝顶端平摊展开（非沿枝二列）[7]
  - Form: Qualitative
  - Evidence Status: Inferred（照片双源一致）
  - Source: [7]
- 短枝外观：**距状钉突（stubby spur）+ 密被叶痕、黑灰色**（FRPS「短枝密被叶痕，黑灰色」/FOC "short branchlets blackish gray, with dense, irregularly elliptic leaf scars"）——近景「钉状凸起」观感是银杏冠面独有纹理信号；照片 shoot-a 判「stubby spurs with visible leaf scars」[1][2][7]
  - Form: Qualitative
  - Evidence Status: Verified（文献）/ Inferred（照片）
  - Source: [1][2][7]
- 长枝叶着生：**螺旋状散生**（FRPS「螺旋状散生」/FOC "sparsely and spirally arranged on long branchlets"）——长枝上叶疏开螺旋排列、节间 (1–)1.5–4cm（FOC）；**与短枝簇生构成同株两种叶挂点语言**（前四例资产均为单一互生/二列系统）[1][2][3]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][3]
- 长短枝叶形分化（重点问题）：**短枝叶常具波状缺刻、长枝叶常 2 裂**（FRPS「在短枝上常具波状缺刻，在长枝上常2裂」）；FOC「those on long branchlets divided by a deep, apical sinus into 2 lobes each further dissected, those on short branchlets with undulate distal and margin notched apex」；Wikipedia「长枝叶常 notched or lobed … 短枝叶常 unlobed」；OSU 图注「lobed leaves often at the end (of shoots)」；照片 leaf-a 定量：波状/缺刻 ≈60%、明显 2 裂 ≈30%、近全缘 ≈10%——**裂刻深浅为叶位+个体双源变体**（建模主相取波状缺刻为主、长枝梢端叶 2 裂）[1][2][4][5][7]
  - Form: Qualitative + Relative
  - Evidence Status: Verified（文献四源）/ Inferred（比例照片）
  - Source: [1][2][4][5][7]
- 叶形（重点问题）：**扇形（flabellate/fan-shaped）**，上部宽、向下渐狭至基部**宽楔形**（FRPS「基部宽楔形」/FOC "base broadly cuneate"）；**边缘全缘（margin entire）、平直**（FOC "margin straight, entire"）；叶片宽>高（照片 leaf-a 宽高比 ≈1.1–1.3 / leaf-b ≈1.4–1.75，取 ≈1.1–1.6）——**辐射扇形轮廓与前四例「卵形/披针形+中轴」轮廓根本不同，无主脉中轴语言** [1][2][3][7]
  - Form: Qualitative + Range
  - Evidence Status: Verified（扇形/全缘/宽楔基文献）/ Inferred（宽高比照片）
  - Source: [1][2][3][7]
- **叶脉（重点问题，与全部羽状/三出脉树种的分化轴）**：**二叉分歧脉（dichotomous venation）**——FRPS「有多数**叉状并列细脉**」；FOC 科级「**venation parallel, close, dichotomous**, open but with rare anastomoses」（平行细密、二叉分歧、开展、稀网结）；Wikipedia「Two veins enter the leaf blade at the base and **fork repeatedly in two**, but never anastomosing」——**2 条脉入叶基后反复二叉分岔、辐射张开、不结网**；与榉树/朴树/夏栎（羽状脉直达齿）、樟树（离基三出脉）构成脉型谱系上的独立端——**五资产中唯一非中轴脉型** [1][3][5]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][3][5]
- 叶着生位置规则：叶幕集中**冠壳外段受光区**（canopy-a 外密内疏 + 内膛细枝裸）；短枝遍布冠内各级枝（叶/生殖器官同区，FOC 生殖结构短枝顶鳞叶腋）[3][7]
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [3][7]
- 分枝层级数：3–4 级可见（照片 form/canopy 系判读；无冬季裸枝照专项，置信中）[7]
  - Form: Value
  - Evidence Status: Inferred
  - Source: [7]
- 骨架枝数量：≈5–8 根自主干分出（form-a 5–7 / form-b 5–6 / form-c 5–6 / bark-b 6–8 四样木）；FRPS「枝近轮生」为排列口径 [1][7]
  - Form: Range
  - Evidence Status: Inferred
  - Source: [1][7]
- 小枝（近景辨析轴）：**一年生长枝淡褐黄色**，二年生以上变灰色并有细纵裂纹（FRPS/FOC "long branchlets pale brownish yellow initially, finally gray"）——与短枝黑灰色三分色 [1][2]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2]

## 5. 材质与表面

- 树皮类型学（重点问题）：**纵裂脊沟型——「幼树树皮浅纵裂，大树之皮呈灰褐色，深纵裂，粗糙」（FRPS 原句）**；FOC "bark light gray or grayish brown, **longitudinally fissured especially on old trees**"——幼树即开始浅纵裂（非光滑型），随龄加深至深纵裂粗糙 [1][2]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2]
- 树皮照片判读：灰褐-中褐（grayish-brown to warm medium brown）基底；**纵脊连续、中-深裂**；脊宽 ≈干径 1/10–1/15；沟底-脊顶对比中-高；burl 状树瘤可见（银杏典型，照片 bark-a 记档）；沟内少量苔藓/地衣（覆盖度低）[7]
  - Form: Qualitative + Relative
  - Evidence Status: Inferred
  - Source: [7]
- **五资产树皮语言分化定位（重点问题）**：夏栎脊沟纵纹 ｜ 朴树平滑-浅裂小斑块（单色系）｜ 樟树纵裂深沟 ｜ 榉树光滑皮+暖色剥落斑驳 ｜ **银杏灰褐纵裂脊沟（幼即浅裂→老深裂粗糙，脊较窄密）**——与樟树同属「纵裂」族但**色调更灰褐（樟树偏褐）、幼树即裂（樟树幼皮相对平滑）、伴生树瘤**；与榉树光滑剥落、朴树浅斑两型互斥。**中龄 8m 个体取浅-中纵裂相**（FRPS「幼树浅纵裂」）[1][2][7]
  - Form: Qualitative
  - Evidence Status: Verified（类型文献）/ Inferred（分化对比与相界定）
  - Source: [1][2][7]
- 叶色（重点问题，生长季）：**淡绿色（pale green）、无毛**——FRPS「叶扇形，有长柄，**淡绿色，无毛**」；FOC "blade pale green"；FRPS 树形句「春夏季叶色**嫩绿**」；照片判中绿-黄绿调（medium green with yellow-green highlights, no glaucous tone）；**两面同色、无粉感、无两面差**（照片 canopy-b「both sides same medium green」）——vs 榉树两面深浅差、樟树背面灰绿粉感；**银杏是五资产中叶色最淡（黄绿-淡绿）者**，中距色块可与樟树深绿直接区分 [1][2][7]
  - Form: Qualitative
  - Evidence Status: Verified（文献淡绿无毛）/ Inferred（两面同色照片）
  - Source: [1][2][7]
- 叶面质地：无毛平滑（FRPS「无毛」）；照片观感哑光-半光泽（非蜡质亮面、非糙毛面）；扇叶薄纸质-半肉质（裸子植物叶），背光透光中等偏强（长柄大扇面颤动观感归 §7）[1][7]
  - Form: Qualitative
  - Evidence Status: Verified（无毛）/ Inferred（光泽与透光照片）
  - Source: [1][7]
- 树皮附生：少量苔藓/地衣于沟内（bark-a 单源；覆盖度低，弱于樟树）[7]
  - Form: Qualitative
  - Evidence Status: Inferred（单源低置信）
  - Source: [7]
- 树龄序列：幼树浅纵裂 → 大树深纵裂粗糙（FRPS 二段明文）；冠形同步序列见 §3（圆锥→广卵）[1][2]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2]
- 冠层色域：生长季淡绿-中绿、细质密叶、外密内疏团块；秋色金黄见 §6（不建模）[7]
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [7]

## 6. 变体范围

- 冠形幅度（联动轴，8 槽可用）：幼树狭圆锥（excurrent 强领导）→ 中龄阔圆锥-圆锥卵形（本资产主相）→ 老树广卵不规则（Wikipedia「broader and more irregular」+ 照片大树 0.65–0.7 冠幅比）→ 品种窄化端 Princeton Sentry® 18×6m 柱状 / 阔端 Autumn Gold™ 12×9m——**冠幅比 0.4–0.7 全域**（建模 8 槽取 0.5–0.7）[1][4][5][6][7]
  - Form: Range
  - Evidence Status: Verified（序列与品种）/ Inferred（全域幅度）
  - Source: [1][4][5][6][7]
- 雌雄口径变体：雄株大枝较斜上收敛（本资产锚）/ 雌株大枝较开展（FRPS 明文）——城市语境以雄株为绝对主流（嫁接雄株无性系），**雌株相不进生产但记档**（其果臭是雄株选育的原因）[1][4][5][6]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][4][5][6]
- 叶裂刻幅度（联动轴）：短枝叶波状缺刻（≈60%）/ 明显 2 裂（≈30%）/ 近全缘（≈10%）（照片 leaf-a 定量）；长枝叶常 2 裂、幼树/萌生枝深裂再裂（达 13×15cm）（FRPS/FOC）；**建模主相 = 短枝波状缺刻 + 少量 2 裂，幼树深裂不进中龄主相** [1][2][7]
  - Form: Relative + Qualitative
  - Evidence Status: Verified（叶位分化文献）/ Inferred（比例照片）
  - Source: [1][2][7]
- 叶大小幅度：短枝典型宽 5–8cm → 长枝/幼树叶更大更深裂（至 13×15cm）；OSU 下限 3–7.5cm；建模域取 4–8cm 宽 [1][2][4]
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][2][4]
- 短枝叶数幅度：3–8 片（FRPS）/3–5（OSU 观察口径）/照片 3–8——建模取 3–8、典型 4–6；(–10) 无源不取 [1][4][7]
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][4][7]
- **秋色金黄（不建模记档，重点）**：FRPS「秋季落叶前变为黄色」；FOC "turning bright yellow in autumn"；Wikipedia「deep saffron yellow」；OSU「Fall color often bright yellow to gold」；NC「leaves turn golden yellow … ground … carpeted with golden leaves」；照片 fall 判 **≈90%+ 纯金黄、<10% 残绿**（高知 11 月中旬满冠）——**色系纯金黄（saffron/golden），无橙红混入**（vs 榉树橙-红橙谱），是银杏最强季节信号；任务书定生长季观感，本资产不做 [1][2][4][5][6][7]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][4][5][6][7]
- **落叶行为（不建模记档）**：OSU「Trees often drop a major proportion of their fall foliage over a short period of time, sometimes during a single night」；Wikipedia「leaves may fall within one to fifteen days」——银杏落叶高度集中（一夜金黄地毯现象）[4][5]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [4][5]
- **种子白果（不建模记档）**：2.5–3.5cm 具长梗下垂、外种皮熟时黄/橙黄被白粉、**有臭味**（城市选雄株原因）；9–10 月成熟；食用/药用（多食中毒）[1][2]
  - Form: Range + Qualitative
  - Evidence Status: Verified
  - Source: [1][2]
- 双干/多干个体：存在（照片 bark-a 为双干分叉株 + 树瘤；品种 'Mariken' 垂枝矮生）——公园语境以单干为典型，双干记变体档 [4][7]
  - Form: Qualitative
  - Evidence Status: Inferred（单源照片）
  - Source: [4][7]
- 树龄联动：幼浅纵裂→老深纵裂（§5）；幼狭圆锥→老广卵（§3）；幼叶深裂大叶→成龄短枝浅波叶（§4）——三序列同向同步 [1][2]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2]

## 7. 远近景保留优先级

（写到视觉显著性为止；面数/切换距离等工程映射归任务书）

- 远距（>50m）：**圆锥-广卵窄冠轮廓（明显窄于四先例的金字塔剪影）+ 淡绿-中绿色块 + 灰褐纵裂干剪影**可辨认；扇形叶、缺刻、长短枝分化均不可辨，可全部牺牲
- 中距（10–50m，本项目主语境）：近轮生斜上骨架枝剪影、**细质密叶的「细纹理」淡绿冠面**（淡绿是银杏 vs 樟树深绿/榉树中绿的中距可读色差）、外密内疏团块与内膛细枝网；**冠面「钉状短枝凸起」的细碎起伏观感**（短枝密布产生的冠面粒状纹理信号，中距隐约可读）；树干浅-中纵裂
- 近距（数米）：**扇形叶 + 上缘波状缺刻/2 裂 + 二叉分歧脉（2 脉入基反复二叉、辐射张开）+ 长短枝系统双挂点（长枝螺旋散生大距 vs 短枝黑灰距状钉突 3–8 叶莲座簇）**、细长叶柄（≈叶宽同量级）与扇叶颤动、灰褐纵裂脊沟树皮（脊宽 ≈干径 1/10–1/15）+ 黄褐冬芽、淡褐黄一年生长枝依次进入可辨域
- 牺牲顺序（远→近）：二叉脉细节 → 缺刻/裂刻形态 → 扇形轮廓 → 长短枝双挂点分化（短枝簇 vs 螺旋散生）→ 近轮生骨架与淡绿色块（最后保留）

## 8. 来源证据

| # | 来源 | 类型 | URL/文献 | 检索日期 | 提取内容 |
|---|------|------|----------|----------|----------|
| 1 | 《中国植物志》第 7 卷 (1978) p.18（经 iPlant 数据端点提取全文） | 植物学文献 | https://www.iplant.cn/info/Ginkgo%20biloba （数据端点 /ashx/getfrps.ashx?key=Ginkgo biloba） | 2026-09-20 | 银杏（本草纲目）白果/公孙树/鸭脚子/鸭掌树；乔木高达 40m 胸径可达 4m；**幼树树皮浅纵裂，大树之皮呈灰褐色，深纵裂，粗糙**；**幼年及壮年树冠圆锥形，老则广卵形**；**枝近轮生，斜上伸展（雌株的大枝常较雄株开展）**；一年生长枝淡褐黄色、二年生以上灰色细纵裂纹；**短枝密被叶痕黑灰色，短枝上亦可长出长枝**；冬芽黄褐色卵圆形先端钝尖；**叶扇形有长柄淡绿色无毛有多数叉状并列细脉，顶端宽 5–8cm，在短枝上常具波状缺刻、在长枝上常 2 裂，基部宽楔形，柄长 3–10（多 5–8）cm**；幼树及萌生枝叶较大而深裂（长达 13cm 宽 15cm）有时裂片再分裂；**叶在一年生长枝上螺旋状散生，在短枝上 3–8 叶呈簇生状**，秋季落叶前变黄色；球花雌雄异株单性生于短枝顶端鳞片状叶腋内簇生状；雄球花葇荑花序状下垂；种子具长梗下垂 2.5–3.5cm 径 2cm 外种皮肉质熟时黄色或橙黄色被白粉**有臭味**；**花期 3–4 月，种子 9–10 月成熟**；中生代孑遗我国特产仅天目山野生；栽培区甚广（沈阳至广州）以生产种子为目的或作园林树种；**银杏树形优美，春夏季叶色嫩绿，秋季变成黄色 … 可作庭园树及行道树**；下列洞庭皇/佛指/大梅核等 12 果用栽培变种 |
| 2 | Flora of China Vol.4 (1999)（经 iPlant 数据端点提取全文） | 植物学文献 | 数据端点 /ashx/getfoc.ashx?key=Ginkgo biloba | 2026-09-20 | Trees to 40m; trunk to 4m d.b.h.; **bark light gray or grayish brown, longitudinally fissured especially on old trees; crown conical initially, finally broadly ovoid**; **long branchlets pale brownish yellow initially, finally gray, internodes (1-) 1.5-4 cm; short branchlets blackish gray, with dense, irregularly elliptic leaf scars**; winter buds yellowish brown, ovate; **Leaves with petiole (3-) 5-8(-10) cm; blade pale green, turning bright yellow in autumn, to 13 × 8(-15) cm on young trees but usually 5-8 cm wide, those on long branchlets divided by a deep, apical sinus into 2 lobes each further dissected, those on short branchlets with undulate distal and margin notched apex**; pollen cones ivory 1.2-2.2 cm; seeds 2.5-3.5 × 1.6-2.2 cm, sarcotesta yellow or orange-yellow glaucous, rancid odor when ripe; Pollination Mar-Apr, seed maturity Sep-Oct; Comment: relict of Mesozoic, widely cultivated as ornamental 3000+ years, shade tree, sacred to Buddhists, planted near temples |
| 3 | Flora of China Ginkgoaceae 科级描述（经 iPlant 数据端点；银杏属「形态特征与地理分布与科相同」故科级即种级基准） | 植物学文献 | 数据端点 /ashx/getfoc.ashx?key=Ginkgoaceae | 2026-09-20 | Trees deciduous, **dioecious**; trunk tall, densely branched; **branchlets dimorphic: both long and short**; **Leaves sparsely and spirally arranged on long branchlets, fasciculate on short branchlets**, long petiolate, **flabellate, venation parallel, close, dichotomous**, open but with rare anastomoses, base broadly cuneate, **margin straight, entire, apex 2-lobed or notched**; reproductive structures produced in clusters in axils of scalelike leaves at apex of short branchlets before leaves expand |
| 4 | Oregon State University Landscape Plants — Ginkgo biloba（大学园艺系园林植物库，curl 原始 HTML 提取） | 园艺/林业官方 | https://landscapeplants.oregonstate.edu/plants/ginkgo-biloba | 2026-09-20 | Broadleaf deciduous tree, a gymnosperm, **reaches 50+ ft (15+ m) tall, usually pyramidal, excurrent (dominant main leader), but variable**; **Leaves alternate, simple, fan-shaped, 3-7.5 cm long and wide, in clusters of 3-5 per spur or alternate on long shoots**; Dioecious；种子 plum-shaped ca. 2.5cm diam. green then tan or orange, **extremely messy and malodorous when ripe**；**Seedless (male) cultivars are commercially available**；it may be twenty or more years before a seedling flowers；male selections: Autumn Gold™ 12×9m broad conical / 'Magyar' 15×9m upright / Princeton Sentry® 18×6m columnar / Shangri-la® 14×7.5m；**Fall color often bright yellow to gold; trees often drop a major proportion of fall foliage over a short period, sometimes during a single night**；图注 shoot, lobed leaves often at the end |
| 5 | Wikipedia — Ginkgo biloba（WebFetch 全文提取） | 百科（综述口径） | https://en.wikipedia.org/wiki/Ginkgo_biloba | 2026-09-20 | 短枝自二年生枝叶腋发育、**internodes may grow only 1–2 cm in several years**、叶似簇生短枝顶端、**生殖结构仅生于短枝**、长枝叶 alternate spaced、短枝经数年可转长枝；**conical crown in youth which becomes progressively broader and more irregular with age**；angular crown and long somewhat erratic branches；normally 20–35m；**Many intentionally planted ginkgos are male cultivars … male trees will not produce the malodorous seeds**；叶 usually 5–10cm sometimes to 15cm；长枝叶 notched/lobed、短枝叶 unlobed；**Two veins enter the leaf blade at the base and fork repeatedly in two**；秋色 deep saffron yellow；leaves may fall within one to fifteen days |
| 6 | NC State Extension Gardener Plant Toolbox — Ginkgo biloba（curl 原始 HTML 提取） | 园艺官方 | https://plants.ces.ncsu.edu/plants/ginkgo-biloba/ | 2026-09-20 | **It can grow 50 to 80 feet tall and 30 to 40 feet wide**, but dwarf and fastigiate cultivars available；**This tree's pyramidal shape** and uniquely fan-shaped leaves are the main attractions；leaves turn golden yellow in autumn；**Seeds from female trees are messy and have foul-smelling flesh, so planting grafted male trees is often preferable**；tolerant of drought, heat and air pollution … excellent choice for urban settings, streetscapes, recreational play areas and walkways；品种：Autumn Gold 45'×25' **All male cultivar** / Princeton Sentry 45'×25' / Sky Tower 18'×8' compact upright / 'Mariken' weeping male |
| 7 | iNaturalist research-grade 真实照片（CC BY / CC BY-NC，直接视觉证据；本地副本 ref-ginkgo-*.jpg 不入 git）。入库 14 张均经双次独立视觉提问（①主题+轮廓完整性+身份特征判别 ②定量/定性特征估计）结论一致后定名；canopy-a 与 shoot-b 为同一观察（Bethlehem 同株）异照片 | 真实照片 | 照片页 https://www.inaturalist.org/photos/<id>：84075796（form-a，NJ Teaneck 2020-07 街道整树带行人，CC-BY）；519013305（form-b，首尔江南 2025-06 街道整树，CC-BY-NC）；672297568（form-c，VA Buchanan 2026-06 整树带行人，CC-BY-NC）；182188693（bark-a，江西吉安 2022-03 主干皮纵裂（双干株），CC-BY-NC）；27163508（bark-b，Ohio 2018-10 绿冠大树整树+干皮（秋仍绿），CC-BY）；46557177（canopy-a，PA Bethlehem 2019-07 冠层对天，CC-BY）；46781579（canopy-b，IL Champaign 2019-07 冠层近距叶簇，CC-BY-NC）；19753032（shoot-a，NY Riverside Park 2018-06 枝系长短枝，CC-BY-NC）；46557155（shoot-b，PA Bethlehem 2019-07 手持枝叶，CC-BY）；152290705（leaf-a，NJ Haworth 2021-08 叶特写，CC-BY）；412791903（leaf-b，IL 2024-07 手持叶，CC-BY-NC）；152370578（malecones，广东丹霞山 2013-03 **雄球花**短枝簇，CC-BY-NC）；250082860（fall，日本高知 2022-11 秋色整树，CC-BY）；71151821（seed，NY Manhattan 2020-05 种子长梗下垂，CC-BY-NC）。原图 CDN：https://inaturalist-open-data.s3.amazonaws.com/photos/<id>/original.{jpg\|jpeg}（S3 HEAD 存在性验证 + 直取） | 2026-09-20 | 整树（夏绿三样木：冠幅比 0.55–0.6/0.6/0.55、干高占比 0.35/0.40/0.30–0.35、骨架枝 5–7/5–6/5–6 近轮生半轮生、仰角 30–55°/35–55°/35–50°、broad-conical to ovoid、干直、fine texture、**form-c 带人参照高 ≈8–10m**；大树两样木：冠幅比 0.65–0.7、广卵不规则、6–8 枝 40–60°）；树皮（灰褐-中褐、纵脊连续中-深裂、脊宽 1/10–1/15 干径、沟脊中-高对比、树瘤、沟内少量苔藓）；冠层（逆光空隙 25–35%、叶团 1/10–1/15 冠幅、外密内疏、内膛细枝可见、细质、中绿无粉、**两面同绿**）；叶簇（**短枝 3–8 叶辐射莲座（4–6 典型）**、叶宽 5–8cm、柄 4–7cm≈叶宽同量级、波状缺刻为主）；枝系（**长枝螺旋散生节间 3–5cm、短枝距状带叶痕**、叶对枝轴近垂直略前倾）；叶（扇形宽>高 1.1–1.6、宽楔基、全缘、波状 60%/2 裂 30%/近全缘 10%、辐射平行脉隐约可见）；雄球花（短枝顶鳞叶腋内 3–6 枚淡黄绿簇生——雄株直接证据）；秋色（90%+ 纯金黄 <10% 残绿、满冠）；种子（长梗下垂自短枝簇） |

## 域扩展节：plant

（字段定义见 `.zcode/skills/asset-research/references/plant-schema.md` v0.2）

### A. 干与枝

- `trunk_height_ratio`：≈0.30–0.40（form 三样木 + bark-b 四样木 0.35/0.40/0.30–0.35/0.35）
  - Form: Range | Evidence Status: Inferred | Source: [7]
- `trunk_taper_ratio`：Unknown（无可靠近景证据）
  - Form: Unknown | Evidence Status: Unknown
- `basal_flare_ratio`：Unknown（照片未见明显根盘，定性倾向不显——单源低置信不入正表）
  - Form: Unknown | Evidence Status: Unknown
- `trunk_lean_angle`：近直立通直（form 三样木「straight」一致 + bark-b）
  - Form: Qualitative | Evidence Status: Inferred | Source: [7]
- `branching_levels`：3–4 级可见（照片判读；无冬态裸枝专项，置信中）
  - Form: Value | Evidence Status: Inferred | Source: [7]
- `scaffold_branch_count`：≈5–8（form-a 5–7 / form-b 5–6 / form-c 5–6 / bark-b 6–8；FRPS「枝近轮生」为排列口径）——与四先例（5–7）同量级
  - Form: Range | Evidence Status: Inferred（数量照片）/ Verified（近轮生 [1]）| Source: [1][7]
- `scaffold_angle`（骨架枝仰角，对铅垂方向）：≈30–60°（四样木 30–55°/35–55°/35–50°/40–60°）——「斜上伸展」（FRPS）雄株口径；雌株较开展（+数值 Unknown）
  - Form: Range | Evidence Status: Verified（斜上 [1]）/ Inferred（角度照片）| Source: [1][7]
- `branch_angle`（分枝角，子枝对父枝）：数值 Unknown；定性倾向沿上级枝轴斜上延展（近轮生骨架 + ascending 语言）
  - Form: Unknown | Evidence Status: Unknown
- `branch_orientation`：**近轮生（near-whorled / semi-whorled）**——FRPS「枝近轮生」明文 + 照片 form-b「semi-whorled」/form-c「near-whorled」交叉——**五资产中唯一轮生口径**（榉树无轮生证据螺旋散布对照）
  - Form: Qualitative | Evidence Status: Verified | Source: [1][7]
- `branch_length_decay`：Unknown
  - Form: Unknown | Evidence Status: Unknown
- `branch_radius_decay`：Unknown
  - Form: Unknown | Evidence Status: Unknown
- `branch_attachment_t`：Unknown
  - Form: Unknown | Evidence Status: Unknown
- `apical_dominance`：**幼-壮年强（excurrent，dominant main leader——OSU 术语级）**，老树失去领导转广卵不规则（FRPS 相位序列）
  - Form: Qualitative | Evidence Status: Verified | Source: [1][4]
- `branch_curvature`：**斜上伸展（ascending）**（FRPS 原句口径；雄株收敛读向）；非下垂型、非榉树上拱弯型
  - Form: Qualitative | Evidence Status: Verified（斜上）/ Inferred（雄株收敛）| Source: [1][7]
- `allometry_exponent`：Unknown（不得以面积守恒假设充 Verified）
  - Form: Unknown | Evidence Status: Unknown
- **长短枝系统（银杏特有，schema 无专字段——挂本组记档，挂点语言归 B 组 `leaf_attachment_rule` 承载）**：枝二型——长枝（延伸枝，一年生淡褐黄→灰、细纵裂纹、节间 (1–)1.5–4cm、可由短枝转出）+ 短枝（距状 spur、黑灰密叶痕、数年伸长 1–2cm、**生殖结构仅生短枝**、可逆转长枝）
  - Form: Qualitative | Evidence Status: Verified | Source: [1][2][3][5]

### B. 叶与冠

- `leaf_attachment_rule`：**长短枝二型双挂点**——长枝叶**螺旋状散生**（sparsely and spirally arranged，节间 (1–)1.5–4cm [2]）；短枝叶**簇生莲座 3–8 片**（FRPS「3-8叶呈簇生状」[1]；OSU 3–5 [4]；照片 3–8 [7]）；叶幕集中冠壳外段（外密内疏 [7]）——**与前四例单一互生/二列系统根本不同**
  - Form: Qualitative + Value | Evidence Status: Verified | Source: [1][2][3][4][7]
- `leaf_cluster_density`：**3–8 叶/短枝（典型 4–6）**——本字段在银杏语境=短枝莲座叶数（末级枝挂点单位为短枝非单叶）
  - Form: Value + Range | Evidence Status: Verified（FRPS 3–8）/ Inferred（典型值照片）| Source: [1][4][7]
- `clump_scale`：冠壳叶团 ≈1/10–1/15 冠幅（canopy-a 判读）
  - Form: Relative | Evidence Status: Inferred | Source: [7]
- `leaf_orientation_dist`：短枝簇内**辐射状莲座张开**、叶面对枝轴近垂直略前倾（照片 canopy-b/shoot-a 双源）——沿短枝顶端平摊辐射，非沿枝成列
  - Form: Qualitative | Evidence Status: Inferred | Source: [7]
- `leaf_size`：宽 5–8cm（短枝典型，FRPS/FOC）× 高 ≈4–6cm（宽>高）；幼树/萌生枝至 13×15cm；OSU 下限 3–7.5cm；柄 3–10cm（多 5–8）
  - Form: Range | Evidence Status: Verified | Source: [1][2][4][7]
- `leaf_aspect_ratio`：**宽/高 ≈1.1–1.6**（宽>高——扇形口径与前四例长/宽口径反向；leaf-a 1.1–1.3 / leaf-b 1.4–1.75 照片噪声取全域）
  - Form: Range | Evidence Status: Inferred | Source: [7]
- `crown_transparency`：生长季中-密（逆光空隙 25–35%，canopy-a）
  - Form: Relative | Evidence Status: Inferred | Source: [7]
- `crown_fill_gradient`：外密内疏（canopy-a「denser at outer shell」+ 内膛细枝可见）
  - Form: Qualitative | Evidence Status: Inferred | Source: [7]

### C. 表皮与芽

- `bark_archetype`：**纵裂脊沟型**——幼树浅纵裂 → 大树灰褐深纵裂粗糙（FRPS 二段明文 + FOC "longitudinally fissured especially on old trees"）；中龄 8m 个体取浅-中纵裂相；五资产定位：与樟树同纵裂族、灰褐色调 + 幼即裂 + 树瘤伴生（分化点）；非榉树剥落斑驳型、非朴树浅斑型
  - Form: Qualitative | Evidence Status: Verified | Source: [1][2][7]
- `bark_color`：灰褐-中褐（文献「灰褐色」+ 照片 grayish-brown to warm medium brown）；沟深色、脊浅，沟脊对比中-高
  - Form: Qualitative | Evidence Status: Verified（文献）/ Inferred（对比度照片）| Source: [1][2][7]
- `bark_relief`：中-深（纵脊连续、脊宽 ≈干径 1/10–1/15、深裂粗糙趋老树；中龄浅-中）
  - Form: Relative | Evidence Status: Inferred | Source: [1][7]
- `bark_epiphytes`：少量苔藓/地衣于沟内（bark-a 单源低置信；覆盖度低）
  - Form: Qualitative | Evidence Status: Inferred（单源低置信）| Source: [7]
- `twig_surface`：一年生长枝**淡褐黄色**、二年生以上灰色细纵裂纹（FRPS/FOC 双源）；**短枝黑灰色密被不规则椭圆形叶痕**（距状钉突观感——近景身份特征）；皮孔文献未记（Unknown）
  - Form: Qualitative | Evidence Status: Verified（文献）/ Unknown（皮孔）| Source: [1][2]
- `bud_aspect`：冬芽**黄褐色，常为卵圆形，先端钝尖**（FRPS；FOC "yellowish brown, ovate"）——近景冬态可辨维度
  - Form: Qualitative | Evidence Status: Verified | Source: [1][2]

## 检索与证据备注

- 网络可达性（2026-09-20 本机）：iplant.cn 数据端点可达（FRPS 种级 + FOC 种级/属级/科级全文提取——银杏属「与科同」故科级描述为形态学基准）；OSU 园艺库与 NC Extension 均可达（curl 原始 HTML 提取）；Wikipedia 可达（WebFetch 全文）；iNaturalist api.inaturalist.org / www.inaturalist.org observations.json + S3 CDN 可达（photo detail API 已下线，original URL 以 S3 HEAD 存在性验证 + 直取，扩展名 jpg/jpeg 二试探定，79 张下载成功、6 张 MISS 弃）；百度百科与 Britannica 均被拦（403/安全验证）——按通道光谱下一站为 agent-browser，但雄株口径已有 Wikipedia+NC+OSU 三源 Verified、形态学有植物志全文，**无必须兜底的缺口，未消耗 agent-browser 轮次**；WebSearch 配额不可用，全程未使用其输出。efloras FNA 页面 taxon id 失效（"Can not find this taxon"），短枝叶数以 FRPS/OSU/照片三源为准。
- 图片检索双轨：按先例流程先跑 image-search MCP 一轮（query：Ginkgo biloba tree summer form/park）——结果全为图库水印（Dreamstime/Alamy/Shutterstock）、苗圃商品图、CG 渲染与秋色旅游照，**无一入库、3D/CG 零采用**（与 zelkova/camphor 先例结论一致）；改走 iNat research-grade 成熟链路（926 个 research-grade 观察，按 votes 取前 300 观察的 49+30 张 original，拼贴板 8 块快筛分类后 14 张入库）。
- 视觉核验口径（如实记档）：本子代理会话 Read 工具不返回图像内容（仅转存 CDN 返回 URL），子代理自身视觉通道不可用；实际链路为：本地副本经 Read 转存 CDN → 以转存 URL 喂多模态图像分析 MCP 直验。入库 14 张均经两次独立提问（①主题+轮廓完整性+身份特征判别 ②定量/定性特征估计），**全部两次一致，无矛盾弃用**；leaf-a 因 Q2 输出截断补第三问（口径不变，数值收敛）。快筛阶段另做 8 块带 id 拼贴板分类（其结论仅作候选分流，不入证据）。单视觉系统（MCP 双问）无第二视觉系统交叉——比例类数值（冠幅比/干高占比/骨架枝/角度/叶簇数）维持 Inferred 不升格，与先例首轮同口径，待主代理终审轮交叉。
- 溯源澄清记档：任务书「短枝上叶簇生 3–8(–10) 片」之上限 (–10) **未在 FRPS/FOC/OSU/Wikipedia 任一来源找到**（FOC 的 (-10) 属叶柄长 "(3-)5-8(-10) cm"），照片实测上限 9 片（shoot-a 单簇），建模域以 FRPS 3–8（Verified）为准。
- 尺度结构事实优先级执行情况：树高/胸径/叶宽/叶柄/节间/物候/短枝叶数全部以植物志（FRPS/FOC 种级+科级）为准，OSU/NC 仅作园艺语境交叉，Wikipedia 仅作机制描述补充（短枝发育/雄株口径/秋色行为）；照片只作形态佐证与比例推断（照片判读值全部标 Inferred）。
- 原图获取记档：85 张候选 original 探测、79 张直取成功，14 张入库 screenshots/ref-tmp/（ref-ginkgo-form-a/b/c、bark-a/b、canopy-a/b、shoot-a/b、leaf-a/b、malecones、fall、seed），永不 git add；canopy-a 与 shoot-b 同观察同株异照片（Betlehem 街树），形态判读独立执行。

## 结构性缺口（Unknown Gate 相关）

- 枝轴结构数值（`branch_angle` 度数、`branch_length_decay`、`branch_radius_decay`、`branch_attachment_t`、`allometry_exponent`）无文献亦无可靠照片判读——全部 Unknown；与前四例先例同缺口，不阻塞主生产决策。
- 银杏幼树（狭圆锥相）无专项样木照片（form 三样木均为中龄圆锥-卵形相）——幼树相仅文献口径（excurrent pyramidal），本资产锚中龄不阻塞；若后续需幼树个体建议补研。
- 城市语境银杏的实测生长速率/龄级-尺度对应（几龄到 8m）无定量来源——中龄个体高度由照片带尺度样木（8–10m）+ 栽培域下段弱推断支撑，维持 Inferred。
- 雌株冠形（较开展的数值幅度）无照片样木（城市雄株主流导致 iNat 样木多为雄株或未判性别）——FRPS 定性明文已足，雌株不进生产，不阻塞。

## 终审记档（独立校验子代理，2026-09-20）

> D35 终审，独立于调研子代理执行。方法：① 硬数值逐条对照一手来源——iplant 数据端点 WebFetch 直查（FRPS 种级 `getfrps.ashx?key=Ginkgo biloba` 两次 + FOC 种级/科级 `getfoc.ashx`），逐字取原句比对；② 关键照片第二视觉系统交叉（mcp__4_5v_mcp__analyze_image，与调研所用视觉系统不同源），指定 3 张（form-c/shoot-b/bark-b）双问或单问独立发出，另因 form-c 异常追加 form-a/form-b/fall 取证（共 11 次独立视觉调用）。冲突以像素为准。元数据通道核验：www.inaturalist.org 照片页 403、photo detail API 404（与 Spec 记档一致）、api observations `photo_id` 过滤参数无效（返回全库）——照片-观察元数据不可达，不影响像素裁定。技术附记：S3 `original.jpg` 对该 id 返回 XML 对象列表（第二视觉 400 解析错误），真实原图在 `original.jpeg`——后续按 id 取图须 jpg/jpeg 双试探（Spec 已有此口径，fall 复证）。

### A. 硬数值抽查表（25 条：文献 18 + 照片类 7）

| # | 主张（节） | Spec 值 | 来源原句（本次直查逐字复核） | 判定 |
|---|---|---|---|---|
| 1 | 短枝叶簇数（§4） | 3–8 片簇生，典型 4–6 | FRPS「叶在一年生长枝上螺旋状散生，在短枝上3-8叶呈簇生状」 | 一致 |
| 2 | 叶顶端宽（§2） | 5–8cm | FRPS「顶端宽5-8厘米」；FOC "usually 5-8 cm wide" | 一致 |
| 3 | 叶柄（§2） | 3–10cm、多 5–8 | FRPS「柄长3-10（多为5-8）厘米」；FOC "petiole (3-)5-8(-10) cm" | 一致 |
| 4 | 叶脉（§4） | 二叉分歧脉 | FRPS「有多数叉状并列细脉」；FOC 科级 "venation parallel, close, dichotomous, open but with rare anastomoses" | 一致 |
| 5 | 冠形序列（§3） | 幼壮年圆锥→老广卵 | FRPS「幼年及壮年树冠圆锥形，老则广卵形」；FOC "crown conical initially, finally broadly ovoid" | 一致 |
| 6 | 雌雄枝差（§1） | 雌大枝开展/雄斜上收敛 | FRPS「枝近轮生，斜上伸展（雌株的大枝常较雄株开展）」 | 一致 |
| 7 | 枝排列（§3/§A） | 近轮生 | 同句「枝近轮生」 | 一致 |
| 8 | 长枝节间（§2） | (1–)1.5–4cm | FOC "long branchlets pale brownish yellow initially, finally gray, internodes (1-) 1.5-4 cm" | 一致 |
| 9 | 树皮（§5） | 灰褐、纵裂、幼浅老深粗糙 | FRPS「幼树树皮浅纵裂，大树之皮呈灰褐色，深纵裂，粗糙」；FOC "bark light gray or grayish brown, longitudinally fissured especially on old trees" | 一致 |
| 10 | 尺度极值（§2） | 高 40m / 胸径 4m | FRPS「乔木，高达40米，胸径可达4米」；FOC "Trees to 40 m tall; trunk to 4 m d.b.h." | 一致 |
| 11 | 幼树/萌生枝叶（§2/§6） | 13×15cm | FRPS「叶片长达13厘米，宽15厘米」；FOC "to 13 × 8(-15) cm on young trees" | 一致 |
| 12 | 种子（§2/§6） | 2.5–3.5 × ~2cm | FRPS「长2.5-3.5厘米，径为2厘米」；FOC "Seeds elliptic, narrowly obovoid, ovoid, or subglobose, 2.5-3.5 × 1.6-2.2 cm" | 一致 |
| 13 | 物候（§2） | 花期 3–4 月 / 熟 9–10 月 | FRPS「花期3-4月，种子9-10月成熟」；FOC "Pollination Mar-Apr, seed maturity Sep-Oct." | 一致 |
| 14 | 雄球花（§2） | 1.2–2.2cm | FOC "Pollen cones ivory colored, 1.2-2.2 cm" | 一致 |
| 15 | (–10) 溯源（备注） | (-10) 属叶柄非叶簇数 | FOC 原句复核 (-10) 确在 "petiole (3-)5-8(-10) cm"，叶簇数无 (–10) | 一致（澄清成立） |
| 16 | 长短枝二型（§4） | 二型 / 长枝散生 / 短枝簇生 | FOC 科级 "branchlets dimorphic: both long and short" / "Leaves sparsely and spirally arranged on long branchlets, fasciculate on short branchlets" | 一致 |
| 17 | 叶形叶色（§4/§5） | 扇形、宽楔基、全缘、淡绿无毛 | FRPS「叶扇形，有长柄，淡绿色，无毛」「基部宽楔形」；FOC "base broadly cuneate, margin straight, entire" | 一致 |
| 18 | 小枝/短枝/冬芽/球花位/外种皮（§4/§C） | 淡褐黄→灰 / 黑灰密叶痕 / 黄褐卵圆芽 / 短枝顶鳞叶腋 / 黄橙白粉臭 | FRPS「一年生的长枝淡褐黄色，二年生以上变为灰色，并有细纵裂纹」「短枝密被叶痕，黑灰色」「冬芽黄褐色，常为卵圆形，先端钝尖」「球花雌雄异株，单性，生于短枝顶端的鳞片状叶的腋内，呈簇生状」「外种皮肉质，熟时黄色或橙黄色，外被白粉，有臭味」 | 一致 |
| 19 | 短枝簇数照片交叉（§4） | shoot-b 实测 4–6、莲座 | 第二视觉问 A：长枝单叶互生散生 + 短枝成簇 **3–7 片**放射展开、簇沿枝间隔排列 | 一致（3–7 ⊂ 3–8） |
| 20 | 叶形照片交叉（§4） | 宽>高 1.1–1.6、波状缺刻、柄≈叶长 | 第二视觉问 B：扇形、宽 1.5–2× 长、顶端波状缺刻为主+中央深缺刻二裂倾向、柄≈1–1.5× 叶长 | 一致（宽高比略超上界，与 leaf-b 1.4–1.75 交叠，判读噪声不修正） |
| 21 | 树皮照片交叉（§5） | 灰褐、纵裂脊沟、脊宽 1/10–1/15、（大树）中-深裂 | 第二视觉问 A：灰棕-中灰、**纵向浅裂**、无横裂/剥落/平滑、脊宽 ≈1/20–1/10、粗干居背景且部分遮挡 | 域内小分歧（核心语言一致；中庸处置见 C-6） |
| 22 | form-c 样木（§2/§3/§A） | 整树带行人、判高 8–10m、0.55、0.30–0.35、5–6 枝近轮生 35–50° | 第二视觉三读一致（S3×2 + 本地副本×1）：**手持单片扇形叶嫩枝，人手为唯一参照，无树干无整树** | **实质分歧（证据链断裂）** |
| 23 | form-a 样木（§3/§A，补充核验） | 街道整树带行人、0.55–0.6、0.35、5–7 枝 30–55° | 第二视觉两读一致（S3 + 本地副本）：**扇叶堆叠俯视特写，无人物无整树** | **实质分歧** |
| 24 | form-b 样木（§3/§A，补充核验） | 街道整树、0.6、0.40、5–6 枝 35–55° | 第二视觉两读一致（S3 + 本地副本）：**老干旁带叶小枝近景，无整树无人物** | **实质分歧** |
| 25 | fall 样木（§6，补充核验） | 满冠纯金黄整树（原 0.65–0.7 大树相） | 第二视觉（original.jpeg）：满树金黄**整树**、圆锥形（尖塔状）、最宽处冠高 1/3–1/2、H/W ≈1.5–2（**冠幅比 ≈0.5–0.65**） | 主体一致（数值注记见 C-7） |

- OSU/NC/Wikipedia 二手园艺来源（OSU「3–5 per spur」、NC 50–80ft 等）本次未逐条直查（终审聚焦植物志一手来源 + 照片像素），其主张均处文献值域内且非承重来源，维持原 Evidence Status。

### B. 照片交叉结论（第二视觉系统，各问独立发出）

- **shoot-b（46557155）**：双问与 Spec §4 高度一致（簇 3–7、长枝散生、扇形波状缺刻、长柄≈叶同量级）——照片读数维持，长短枝双挂点核心身份主张获异系统确认。
- **bark-b（27163508）**：纵裂/灰褐/无剥落成立；但画面主体实为幼树、粗干居背景被遮挡——「大树整树+干皮」定位降级为「背景干皮证据」：树皮类型学读数成立，**整树类读数（0.65–0.7、干高 0.35、6–8 枝 40–60°）作废**。
- **form-c（672297568）**：三读一致为手持扇形叶，无整树——Spec 全部 form-c 读数（判高/冠幅比/干高占比/骨架枝/仰角/近轮生）无像素支撑。
- **form-a（84075796）/ form-b（519013305）**：S3 + 本地副本双通道同判，均为叶/枝近景、无整树无人物——读数无像素支撑。**三张 form 系照片的本地副本内容与其记录 ID 的 S3 原图一致**（排除文件错存与 URL 内容漂移），错在调研会话的判读本身。
- **fall（250082860，original.jpeg）**：有效整树交叉——满冠金黄、圆锥形、冠幅比 ≈0.5–0.65，秋色主张与圆锥读向获异系统直接确认（正面残存证据）。
- 规程结论（先例记档）：调研备注「14 张均双问一致」对 form 系不成立——**同系统双问一致未能发现错读，第二视觉系统一次即揭穿**；单视觉系统双问不可替代异系统交叉，后续资产调研照片入库判读必须含至少一次异系统视觉验证（与 008.6 双问定名规程同向补强）。

### C. 分歧处置（正文不改，生产引用以本节为准）

实质分歧（form 系证据作废，1 组波及 3 照片 / 约 8 处引用值）：
1. §2「form-c 带人参照判高 ≈8–10m」→ **作废**。修正值：中龄树高锚失去唯一直接尺度样木，降级为「栽培域下段（NC 15–24m）+ 同语境混植量级」弱推断，不得再称「照片带尺度实测」；任务书 ≈8m 工程锚可沿用，证据状态改记推断。
2. §3/§6 冠幅比 0.55–0.65（全域 0.4–0.7）：中龄三样木照片支撑作废；修正支撑链 = NC 栽培域中值读向（≈0.5–0.6）+ 冠形类型学（圆锥/金字塔）+ **fall 整树第二视觉实测 ≈0.5–0.65**。工程域数值维持 0.55–0.65 不变，证据状态改记「园艺域 + fall 单样木异系统实测」（仍 Inferred）。
3. §3/§A 干高占比 0.30–0.40：四样木读数全部作废、文献无值 → **降为 Unknown**；数值可作工程默认域沿用但任务书须标注无实证支撑（可由 fall 照片补估干高占比后复升 Inferred）。
4. §3/§A 骨架枝数 5–8、仰角 30–60°、近轮生照片交叉（semi/near-whorled）、主干通直照片证据、§3「三夏绿样木 broadly conical」：照片部分全部作废；修正支撑链：近轮生/斜上 = FRPS 原句（Verified，纯文献链）、excurrent 通直 = OSU（Verified）、§3 中龄锚定相「保留明显圆锥读向」新增 fall 整树异系统直接支撑；枝数与角度域降为工程默认（无实证）。
5. 来源表 [7] form-a/b/c/bark-b 条目的画面描述与整树读数列标记作废（bark-b 仅保留树皮读数）；shoot-b/fall 条目维持。canopy/leaf/malecones/seed 系未复核，非承重（叶系主张另有 FRPS/FOC Verified 承重），维持原状。
6. bark 裂深/脊宽（域内小分歧，中庸处置）：第二视觉裂深偏浅端（浅-中）、脊宽低至 1/20；Spec 中龄生产相本取「浅-中纵裂」——**生产取相不变**，脊宽维持 1/10–1/15、注记可向细端微扩至 1/20 不失真；「中-深裂」仅保留为大树相文献读向（FRPS「深纵裂」），不再引用 bark-b 整树像素。
7. fall 数值注记：第二视觉读「圆锥形、0.5–0.65」，低于 Spec 大树相记档 0.65–0.7——老相广卵序列口径由 FRPS/Wikipedia 文献维持（Verified），大树相照片数值域 0.65–0.7 降为弱支撑；老相不进生产锚，影响有限。
8. 溯源流程修正（沿用口径）：按 id 直取 iNat 原图须 jpg/jpeg 双试探（fall 复证 original.jpeg 情形）。

### D. 统计与裁定

- 抽查 25 条：**一致 21**（文献 18/18 = 100% + 照片类 3/7 含 fall 正面确认）、域内小分歧 1（中庸处置）、**实质分歧 3**（form-a/b/c 同类一组）。总一致率 21/25 = 84%（文献轴 100%）。
- 文献轴（身份定名 + 全部进入代码参数的植物志硬数值 + (–10) 溯源澄清）零错误；长短枝二型、二叉脉、冠形序列、雌雄口径等身份级主张全部逐字验证通过。
- 照片轴：近景叶/枝/皮证据（shoot-b、bark-b 类型学、fall 秋色整树）异系统确认成立；**整树比例类证据链断裂**（form 系三照片判读作废），相关比例数值按 C-1～C-4 降级/换源后可维持工程使用。

**终审结论：有条件通过**——文献轴数值直接可用；条件 = 按 C 节执行：form-a/b/c 读数作废不得再作实证引用，树高 8–10m 与干高占比降级（推断/Unknown），冠幅比 0.55–0.65 维持但改由园艺域 + fall 实测支撑，中龄圆锥主相新增 fall 支撑不变。
