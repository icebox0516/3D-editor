# fraxinus Reference Spec（白蜡树）

Spec Version: 1.0
Domain: plant
Asset: tree_fraxinus（白蜡树）
Updated: 2026-09-21

> 关键事实统一写法（各节内联、逐条标注；Source 填来源表编号）：
> Form ∈ {Value, Range, Relative, Qualitative}；Evidence Status ∈ {Verified, Inferred, Unknown}。
> 工程预算（面数/LOD 阈值）不进本文件，归任务书。真实照片本地副本为 `screenshots/ref-tmp/` 下 ref-fraxinus-*.jpg（不入 git、不进 Runtime）。
> 建模目标相 = **生长季（夏季绿叶相）**；秋色黄仅记档不建模（任务书口径）；花（4–5 月无瓣弱信号）判定建议不做；**翅果（7–9 月盛挂 + 宿存至冬）判定建议做**（判定归任务书 Step 1，理由记 §4/§5）。

## 1. 身份

木犀科（Oleaceae）梣属（**Fraxinus**，志书用字「梣属」，中文亦通称白蜡树属）**落叶乔木**。使用语境：**长江流域城市公园夏绿落叶乔木**，中龄典型个体 ≈8–12m（志书级数值锚，见 §2），与夏栎 ≈8m、朴树 ≈8.5m、国槐 ≈8–12m、悬铃木 12–14m 同语境混植。本资产是本家族**第三个复叶型（一回奇数羽状复叶 + 小叶对生严格 + 复叶在枝上对生）**成员，身份信号组合 = **对生芽序 + 匙形单翅果帘幕 + 幼干近光滑带皮孔 + 无花冠花**（vs 国槐复叶互生+念珠荚果、栾树二回羽叶+灯笼果）。

- **种定名（最高优先，近缘分合三源裁定记档）**：
  1. **FRPS 61:30（1992）口径**：白蜡树为**独立种、无种下等级**——「20. 白蜡树（四川，中国树木分类学）　图版8: 7-10　Fraxinus chinensis Roxb. Fl. Ind. 1: 150. 1820……——F. chinensis var. rotundata Lingelsh. l. c. 29. 1920.」[1]——var. rotundata 列为异名，条目内无变种变型（subsplist 字段为空）。**任务书问「尖萼梣 var. acuminata? / 大叶蜡树 var. rhynchophylla?」经原句复核均不成立**：FRPS 61 将大叶蜡树处理为**独立种花曲柳 F. rhynchophylla**（61:29，第 19 条，其异名行明载「——F. chinensis Roxb. var. rhynchophylla (Hance) Hemsl.」即历史上曾为白蜡树的变种 [7]）；尖萼梣为另一独立种（FOC 作 F. odontocalyx [6]），均不在白蜡树条目内。
  2. **FOC Vol.15（1996）口径**：白蜡树**含两个亚种**——检索表原句「16a subsp. chinensis 白蜡树(原亚种)：Terminal leaflets 2-4(-6) cm broad, ovate, ovate-lanceolate, to lanceolate or elliptic to ovate-oblong, short to long acuminate, margin distinctly serrate」vs「16b subsp. rhynchophylla 花曲柳：Terminal leaflets (2.5-)3.5-5(-7) cm broad, usually broadly ovate to elliptic, sometimes ± lanceolate, short acuminate to acuminate or caudate, margin crenate-serrate」[2]——**FOC 将 FRPS 的花曲柳（大叶蜡树）降级归并为 F. chinensis subsp. rhynchophylla**。**任务书预测「FOC 可能将苦枥木 F. retusa 等归并」经原句复核证伪**：FOC 的苦枥木为独立种 F. insularis（检索号 11，有白色花冠——与白蜡树无花冠检索表级差分 [6][8]），未并入 chinensis。
  3. **现代数据库口径**：GBIF backbone「Fraxinus chinensis Roxb.」taxonomicStatus = **ACCEPTED**（检索 2026-09-21）[9]。
  - Form: Value
  - Evidence Status: Verified（三源原句/结构化数据各自支持）
  - Source: [1][2][6][7][8][9]
- **长江流域公园语境种定名判定（重点问题，判定结论）**：生产身份 = **Fraxinus chinensis subsp. chinensis（白蜡树原亚种本尊）**。判据链：
  1. 分布（Verified）：FRPS「产于南北各省区。多为栽培，也见于海拔800-1600米山地杂木林中。越南、朝鲜也有分布。」[1]；FOC subsp. chinensis "Throughout China [Korea, Vietnam]" [3]——全域栽培种；
  2. 近缘亚种排除（Verified）：subsp. rhynchophylla（花曲柳）FOC 原生省「Gansu, Hebei, Heilongjiang, Henan, Jilin, Liaoning, Shaanxi, Shandong, Shanxi」[4]——**东北+黄河流域北方型，原生分布不含长江流域**（FRPS 61:29「产于东北和黄河流域各省……见于长江流域各省，福建、云南和西藏也有栽培」[7]——长江流域仅栽培记录）；且花曲柳小叶显著更大（顶生小叶宽 (2.5-)3.5-5(-7) cm vs 原亚种 2-4(-6) cm）[2][4]；
  3. 栽培主力（Verified）：FRPS 属级原句「其中以白蜡树最常见于栽培，历史悠久，尤以西南各省最盛」[5]——**城市栽培主力即白蜡树本尊**；
  4. 长江流域原生近缘苦枥木 F. insularis（FOC 分布含 Jiangsu, Jiangxi, Zhejiang, Anhui, Hubei [8]）为 20–30m 山地大乔木、有白花冠 [8]，非城市绿化栽培对象（栽培记录无源，方向性 Inferred）。
  - Form: Value
  - Evidence Status: Verified（判据 1–3 各原句）/ Inferred（整体判定为判据链归纳 + 苦枥木非栽培对象方向性）
  - Source: [1][3][4][5][7][8]
- **俗名与「白蜡」命源（重点问题，考据记档）**：「20. 白蜡树（四川，中国树木分类学）」[1]——**「白蜡」得名于放养白蜡虫生产白蜡的经济用途，非叶背蜡感**：FRPS 原句「本种在我国栽培历史悠久，分布甚广。**主要经济用途为放养白蜡虫生产白蜡**，尤以西南各省栽培最盛。」[1] + 属级「放养白蜡虫（Ericerus pela，蚣科，半翅目），取蜡为工业上重要原料。其中以白蜡树最常见于栽培，历史悠久，尤以西南各省最盛。」[5]——D34 注记：经济用途（白蜡虫放养史）仅此一句记档，形态锚定城市绿化个体。
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][5]
- 落叶性：落叶乔木（FRPS「落叶乔木，高10-12米」[1]；FOC 属级 "Trees or rarely shrubs, deciduous or rarely evergreen" [6]）
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][6]
- 分布与生境：南北各省区、多为栽培、山地杂木林 800–1600m（FRPS [1]）；FOC "Throughout China [Japan, Korea, Russia, Vietnam]" [2]——**长江流域公园语境 = 栽培个体**，成立
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2]
- 用途与耐受：FRPS「性耐瘠薄干旱，在轻度盐碱地也能生长。植株萌发力强，材理通直，生长迅速」[1]；属级「可作园林绿化的观赏树和行道树」[5]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][5]
- 物候总口径：**花期 4–5 月（与叶同放），果期 7–9 月**（FRPS 原句「花期4-5月，果期7-9月」[1]；FOC subsp. chinensis "Fl. Apr-May, fr. Jul-Sep" [3]）——照片轴扩展：**5 月已见嫩绿翅果**（fruit-b 北京奥森 2024-05-11 [12]）→ **7–9 月盛挂帘幕**（fruit-c 山东九仙山 2025-07-29、fruit-a 吉林汪清 2018-09-03 [12]）→ **翌年 2 月宿存干果挂枝**（twig-b 北京猫耳山 2026-02-08、twig-a 北京莲花池公园 2025-02-18 [12] 双源）——**翅果宿存冬挂为照片级事实（志书无宿存原句，记档）**
  - Form: Range
  - Evidence Status: Verified（花果期文献双源）/ Inferred（宿存时长照片双源）
  - Source: [1][3][12]

## 2. 主要尺度

- **树高（志书级数值锚，罕见直给）**：**「落叶乔木，高10-12米」（FRPS 原句）**[1]；FOC 种级 "Trees 3-20 m"（广义种含北方大叶亚种与全域变幅）[2]、subsp. chinensis 随种级 [3]——**志书「高10-12米」即典型成熟个体量级，与任务 ≈8–12m 族量级锚直接吻合；生产主域 8–12m（幼-中龄下探 + 志书域），生产默认 10m（建议，判定归任务书）**；FOC 20m 上端为老树/北方亚种端
  - Form: Value + Range
  - Evidence Status: Verified
  - Source: [1][2][3]
- **中龄公园个体（目标龄级锚 ≈8–12m，重点问题）**：志书 10–12m 直给 + 照片 form-a（烟台山坡开花树，无标定）/ form-c（韩国北汉山岩坡树，人参照但山地相）[12]——**中龄典型个体 ≈8–12m 由志书直接承托（Verified 文献 + 照片无标定）**；公园修剪相带参照样木缺失（结构性缺口记档）
  - Form: Range
  - Evidence Status: Verified（志书直给）/ Inferred（龄级对应）
  - Source: [1][12]
- 冠幅：**志书无冠幅原句**（FRPS/FOC 均无）——照片 form-c 判「大骨架枝开展→圆润开敞冠」[12]（冠幅≈高读向，无标定不承重）——**冠幅/树高 ≈0.7–1.0（开展等幅读向，弱 Inferred）**；带参照整树样木缺失
  - Form: Range
  - Evidence Status: Inferred（弱）
  - Source: [12]
- **复叶（最高优先，Verified 原句）**：**「羽状复叶长15-25厘米；叶柄长4-6厘米，基部不增厚；叶轴挺直，上面具浅沟，初时疏被柔毛，旋即秃净」（FRPS 原句）**[1]；FOC "Leaves 12-35 cm; petiole 3-9 cm"（广义种域宽，含北方亚种）[2]、subsp. chinensis 叶随种级（12)–35 域内 [3]——**复叶总长建模域 15–25cm（FRPS 种级域），一回奇数羽状**
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][2][3]
- **小叶（最高优先，Verified 原句）**：**「小叶5-7枚，硬纸质，卵形、倒卵状长圆形至披针形，长3-10厘米，宽2-4厘米，顶生小叶与侧生小叶近等大或稍大，先端锐尖至渐尖，基部钝圆或楔形，叶缘具整齐锯齿，上面无毛，下面无毛或有时沿中脉两侧被白色长柔毛，中脉在上面平坦，侧脉8-10对，下面凸起，细脉在两面凸起，明显网结；小叶柄长3-5毫米」（FRPS 原句）**[1]；FOC 种级 "leaflets 3-7(-9); petiolule 2-15 mm; leaflet blade broadly ovate, ovate, to lanceolate or elliptic to obovate-lanceolate, 4-16 × 2-7 cm (terminal much larger), papery to somewhat leathery...margin regularly serrate to crenate-serrate, sometimes entire in lower half, apex acute to long acuminate or caudate; primary veins 5-10 on each side"（广义种）[2]；subsp. chinensis "Leaflets (3-)5-7(-9), ovate, ovate-lanceolate, to lanceolate or elliptic to obovate-oblong, terminal leaflet (4-)7-10(-12) × 2-4(-6) cm...margin distinctly serrate" [3]——**生产口径（subsp. chinensis）：小叶 5–7 枚（FOC 端 3–7(-9) 记变体域）、卵形-倒卵状长圆形-披针形 3–10 × 2–4cm、顶生小叶与侧生近等大或稍大、先端锐尖至渐尖、基部钝圆或楔形、缘整齐锯齿（锐齿）、小叶柄 3–5mm、硬纸质、侧脉 8–10 对**；FOC "(terminal much larger)" 与 FRPS「近等大或稍大」张力记档（FRPS 种级口径优先，照片 leaf-a 判读为大小渐变顶生稍大 [12]，两读相容）
  - Form: Range + Qualitative
  - Evidence Status: Verified
  - Source: [1][2][3][12]
- **小叶排列（对生，重点问题——与国槐对照轴）**：**FRPS 种级无「小叶对生」显式原句**（仅「小叶5-7枚」[1]）；承托链：①照片三源直接证据——leaf-b（泰安 8 月）「5–7 小叶沿中轴对生排列」、leaf-c（泰山 5 月）「5–7 leaflets arranged oppositely along a central stalk (rachis)」、flower-b/leaf 系列同向 [12]；②FRPS 近缘花曲柳条目「小叶着生处具关节」[7]；③属级对生叶序（见 §4）——**小叶沿叶轴对生 = 照片级 Verified-in-image + 文献侧 Inferred**；对照国槐「小叶4-7对，对生或近互生」（对生松、对数多 4–7 对）vs **白蜡 2–3 对 + 顶生（5–7 枚）、对生严格**——复叶系内同型不同数值对照轴（计数少而整齐 vs 国槐多而对生近互生混）
  - Form: Qualitative
  - Evidence Status: Verified（照片级）/ Inferred（志书显式句缺失）
  - Source: [1][7][12]
- **花序（重点问题）**：**「圆锥花序顶生或腋生枝梢，长8-10厘米；花序梗长2-4厘米，无毛或被细柔毛，光滑，无皮孔」（FRPS 原句）**[1]；FOC "Panicles terminal or lateral, 5-10 cm" [2]——**圆锥花序 5–10cm，顶生或侧生枝梢（含腋生读向）**；照片 flower-a/b/c 判读花簇「从叶腋垂挂、密集多分枝」[12]（侧生位为主的读向，与「腋生枝梢」原句吻合）
  - Form: Range + Qualitative
  - Evidence Status: Verified
  - Source: [1][2][12]
- **花部（身份特征：无花冠）**：**「花雌雄异株；雄花密集，花萼小，钟状，长约1毫米，无花冠，花药与花丝近等长；雌花疏离，花萼大，桶状，长2-3毫米，4浅裂，花柱细长，柱头2裂」（FRPS 原句）**[1]；FOC "Flowers dioecious, opening with leaves. Staminate flowers congested; calyx cupular, 1-1.5 mm; **corolla absent**. Pistillate flowers lax; calyx tubular, 2-3 mm." [2]；FOC 属级检索表第一差分「Flowers without corolla →（chinensis 支）」[6]——**雌雄异株、与叶同放、无花冠（仅绿萼 1–3mm）**——照片 flower-a「淡黄绿色小花密集簇」、flower-b「tiny, brownish to greenish-yellow, lacking showy petals, compact fuzzy-looking bunches」、leaf-c 同 [12]——**中距读向 = 淡黄绿-褐绿色细碎绒粒状小簇，无醒目花部结构**
  - Form: Value + Qualitative
  - Evidence Status: Verified
  - Source: [1][2][6][12]
- **翅果（最高优先，Verified 原句）**：**「翅果匙形，长3-4厘米，宽4-6毫米，上中部最宽，先端锐尖，常呈犁头状，基部渐狭，翅平展，下延至坚果中部，坚果圆柱形，长约1.5厘米；宿存萼紧贴于坚果基部，常在一侧开口深裂」（FRPS 原句）**[1]；FOC "Samara spatulate to very narrowly so, 2.5-4 cm × 3-7(-15) mm; wing decurrent to middle or lower part of nutlet" [2]、subsp. chinensis "Samara spatulate to very narrowly so, 3-3.5(-4) cm × 3.5-7(-15) mm" [3]——**匙形（勺形）单翅果：全长 3–4cm × 宽 4–6mm（生产域），上中部最宽、先端锐尖常呈犁头状（切口状缺刻读向）、翅下延至坚果中部、坚果圆柱形约 1.5cm（翅约占全长的 1/2）、宿存萼贴坚果基部**；照片 fruit-herb（纸上标本）「单翅一端椭圆窄体一端扁平长翅」、fruit-a「匙形桨状 samaras 成下垂簇」[12]
  - Form: Range + Qualitative
  - Evidence Status: Verified
  - Source: [1][2][3][12]
- 树皮尺度：主干干径无标定照片——Unknown；志书无干径原句
  - Form: Unknown
  - Evidence Status: Unknown
- 生长速率：FRPS「生长迅速」[1]（定性）；年增高数值无来源——Unknown
  - Form: Qualitative / Unknown（数值）
  - Evidence Status: Verified（定性）/ Unknown（数值）
  - Source: [1]

## 3. 轮廓与比例

- **冠形（重点问题）**：**卵圆-圆头开展形（rounded, spreading）**——志书无冠形原句；照片三源：form-c（韩国北汉山 10 月）「大骨架枝自主干中上部伸展→宽圆-圆润开敞冠、细枝疏网 airy」[12]、form-a（烟台 4 月山坡）「宽阔疏展卵圆-圆顶树冠」[12]、fruit-c（九仙山 7 月冠下仰观）「主枝自主干向上外斜伸、冠圆润开张」[12]——**建模主相 = 卵圆-圆头开展冠（骨架枝自中上部分歧外展、冠面由细碎羽叶 + 夏末翅果帘幕构成）**（vs 国槐开展宽圆头冠幅≥高、夏栎圆穹致密）——照片全为山地/风景区相，公园中龄样木缺失（缺口记档）
  - Form: Qualitative
  - Evidence Status: Inferred（照片三源 + 无文献句）
  - Source: [12]
- 冠幅/树高比：**≈0.7–1.0（弱推断）**——无志书冠幅句、无标定样木；form-c 开展圆冠读向 [12]
  - Form: Range
  - Evidence Status: Inferred（弱，结构性缺口）
  - Source: [12]
- 主干分枝点高度：Unknown（无整树标定；form-b 岩坡树「短倾斜干 + 多主枝低分歧」为山地暴露相不承托 [12]）
  - Form: Unknown
  - Evidence Status: Unknown
  - Source: [12]
- 主干姿态：单干典型（FRPS「材理通直」[1] 读向 + 照片 form-a/c 单干 [12]）；多干/萌生（萌发力强 [1]）为变体端
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [1][12]
- **冠面质感（重点问题：对生羽叶细碎 + 两面色差）**：**细质**——一回羽状复叶 15–25cm、小叶 3–10cm 卵-披针形沿叶轴对生排列，冠面由大量对生羽叶层叠构成**细碎均质绿面**（质感与国槐同档同型、较栾树大羽叶细）——照片 fruit-c 判「羽状复叶细碎、冠面 airy 开放」[12]
  - Form: Relative + Qualitative
  - Evidence Status: Inferred
  - Source: [1][12]
- 冠层通透度：fruit-c 判「airy 开放」（覆盖率约 60–75% 读向）[12]、form-c「细枝疏网」[12]——**空隙 ≈25–40%（中通透，疏朗读向）**——弱双源（vs 国槐 10–20% 致密端）
  - Form: Relative
  - Evidence Status: Inferred
  - Source: [12]
- 冠层密度梯度：无直接判读——Unknown

## 4. 结构层级

部件树：主干（单干典型）→ 骨架枝（开展分歧，数量 Unknown）→ 二级枝 → 末级枝（**小枝黄褐色、对生节间**）→ **一回奇数羽状复叶（复叶在枝上对生）** → 圆锥花序侧生/顶生（4–5 月，无瓣）→ **匙形单翅果簇（7–9 月盛挂、宿存至冬）** → 冬季落叶（宿存干果挂枝）。

- **复叶结构（最高优先，挂点语言核心）**：**一回奇数羽状复叶 + 对生叶序（复叶在枝上对生）+ 小叶沿叶轴对生**——属级原句「**叶对生**，奇数羽状复叶，稀在枝梢呈3枚轮生状，有小叶3至多枚」[5]（FRPS 属级）；FOC 属级 "Leaves odd-pinnate, **opposite** or rarely whorled at branch apices" [6]；种级结构 = 叶轴（挺直、上面浅沟）+ 小叶 5–7 枚（2–3 对对生 + 顶生 1 枚）+ 小叶柄 3–5mm + 叶柄 4–6cm 基部不增厚 [1]——**挂点单位 = 1 枚 15–25cm 一回对生羽叶；复叶对生（枝上）+ 小叶对生（轴上）双级对生 = 梣属身份结构**（vs 国槐复叶互生+小叶对生或近互生）；照片 leaf-a/b/c 三源 [12]
  - Form: Qualitative + Range
  - Evidence Status: Verified（属级叶序原句 + 种级小叶数文献）/ Inferred（小叶对生照片级）
  - Source: [1][5][6][12]
- **嫩枝扁平状（对生叶序衍生特征，属级原句）**：「嫩枝在上下节间交互呈两侧扁平状」[5]——对生叶序的横截面衍生（近景枝几何细节）
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [5]
- **芽（重点问题——对生芽序 = 身份特征候选确认）**：**「芽阔卵形或圆锥形，被棕色柔毛或腺毛」（FRPS 种级原句）**[1] + 属级「芽大，多数具芽鳞2-4对，稀为裸芽」[5]；FOC 种级 "buds broadly ovoid or conical, brown tomentose, pubescent or glandular hairy" [2]——照片 bud-a（北京灵山 4 月早春）判读「**buds arranged in an opposite fashion — paired buds sit across from each other at the nodes**；阔卵形-圆穹顶状、黑褐-深绿褐色、较大、微粗鳞片状、萌动开裂吐绿」[12]——**对生芽序（黑褐色阔卵形对生芽对）= 身份特征确认：文献芽形/被毛原句 Verified + 对生排列照片级（与属级对生叶序互证）**——落叶期-早春近景独有信号（冬态身份锚，既有资产均无对生芽信号；国槐芽藏于膨大叶柄基不可见）
  - Form: Qualitative
  - Evidence Status: Verified（芽形/被毛/芽鳞文献）/ Inferred（对生排列照片单源双问候选——主代理终审确认）
  - Source: [1][2][5][12]
- **小枝（FRPS 原句）**：「**小枝黄褐色，粗糙，无毛或疏被长柔毛，旋即秃净，皮孔小，不明显**」[1]；FOC "Branchlets glabrous, sparsely villous puberulent or tomentose" [2]——一年生枝黄褐色、粗糙、皮孔小不明显；照片 twig-b 冬态细枝灰褐-深灰褐 [12]、bud-a 枝灰褐-浅褐 [12]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][12]
- **花序着生与姿态（重点问题）**：圆锥花序**顶生或腋生枝梢**、5–10cm、常下垂（照片「hang from the leaf axils」「drooping clusters」[12]）——着生于当年生枝梢/叶腋、与叶同放（4–5 月）
  - Form: Qualitative + Range
  - Evidence Status: Verified（着生位文献）/ Inferred（下垂姿态照片）
  - Source: [1][2][12]
- **果序姿态（重点问题——帘幕状下垂簇）**：翅果沿果序轴**密生成簇、下垂悬挂**——照片 fruit-a「大量黄绿-淡褐匙形桨状翅果下垂簇（每簇 10 枚级）」、fruit-c「elongated flattened winged fruits (samaras) hang in dense drooping bunches...a very conspicuous feature（满冠显著特征）」、fruit-b「5 月嫩绿果簇细弱下垂」[12]——**果序 = 侧生/顶生下垂密簇，单果 3–4cm 匙形，簇尺度 5–10cm 级，夏末满冠分布成帘幕感**（vs 国槐念珠串稀疏、栾树粉团大果序）
  - Form: Qualitative + Range
  - Evidence Status: Verified（单果文献）/ Inferred（簇密度与冠面分布照片）
  - Source: [1][12]
- 分枝角与枝姿：大枝开展-外斜（照片 form-c/fruit-c「spreading outward and upward」[12]）；骨架枝数量/仰角定量 Unknown
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [12]
- 分枝层级数：3–4 级可见（form-c 冬态疏网 [12]，弱单源）
  - Form: Value
  - Evidence Status: Inferred
  - Source: [12]

## 5. 材质与表面

- **树皮类型学（重点问题，文献+多源中景照片合并）**：**「树皮灰褐色，纵裂。」（FRPS 原句）**[1]（深度未言）；照片轴（无主干特写，多源中景枝干合并 [12]）：bark-a（北京 6 月幼干）「幼干光滑、浅灰褐-棕褐、细纵纹 + 圆-椭圆皮孔」；flower-b/leaf-c（泰山 5 月枝干）「大枝光滑-细纹理灰-灰白、小皮孔 + 绿斑（地衣/藻）」；fruit-c（九仙山 7 月）「干灰-灰褐、浅纵脊沟（年轻干）」；leaf-c 背景粗干「深色纵脊沟 darker furrowed」；form-c（北汉山 10 月）「主干暗灰褐-近炭色」——**合并口径：灰褐基调（幼干近光滑浅灰褐带皮孔 → 中龄浅-中纵裂脊沟 → 老干深纵脊沟暗灰褐），无剥落、无翘皮、无地图状**；近缘参照花曲柳「树皮灰褐色，光滑，老时浅裂」[7]（属内语言连续）
  - Form: Qualitative
  - Evidence Status: Verified（FRPS 纵裂原句）/ Inferred（龄级序列照片多源合并；主干特写缺失）
  - Source: [1][7][12]
- **既有十资产树皮语言分化定位（重点问题）**：朴（平滑-浅裂小斑块）/ 樟（深纵裂）/ 榉（光滑+暖色薄片剥落斑驳）/ 银杏（深纵裂粗糙）/ 悬铃木（光滑大片地图剥落三色带）/ 栾（浅色光滑+皮孔麻点）/ 乌桕（暗灰窄裂碎翘）/ 重阳木（褐宽脊扭转）/ 国槐（板状厚脊+瘤突）/ 夏栎（基线）——**白蜡 = 灰褐-灰白浅-中纵裂（幼中龄近光滑带皮孔、老树渐深）**——分化点：①**幼干-大枝近光滑 + 皮孔**（vs 栾全龄浅色光滑+密麻点：白蜡皮孔「小，不明显」[1]、栾皮孔密集醒目；vs 国槐厚脊深沟、樟深纵裂）；②纵裂纹细而浅（中龄端，vs 银杏/樟深裂）；③无剥落无碎翘（vs 榉/悬铃木/乌桕）——「**浅色近光滑-浅细纵裂 + 不明显皮孔**」语言在家族中独立（与栾最近，分化在皮孔显著度与老树走向）
  - Form: Qualitative
  - Evidence Status: Inferred（分化定位为对照推断；主干特写缺失约束置信）
  - Source: [1][12]
- **叶色与两面色差（重点问题）**：**上面中绿-亮绿、下面色淡（浅绿-灰绿）**——FRPS「上面无毛，下面无毛或有时沿中脉两侧被白色长柔毛」[1]（毛被句非叶色句——**志书无「下面灰白色」显式原句**，与国槐「下面灰白色」句不同级）；照片 leaf-b 判「上面中-深绿有光泽、下面明显更浅（浅绿-灰绿）、纸质半透明感、风翻可见两面色差」[12]——**两面色差存在（照片级）但弱于国槐灰白级**；「蜡感来源考」裁定：命名源于白蜡虫白蜡非叶色（§1）——叶背淡绿读向不做「白蜡感」过度引申
  - Form: Qualitative
  - Evidence Status: Inferred（两面色差照片单源强读 + 文献毛被句间接）
  - Source: [1][12]
- 新叶色：bud-a/leaf-c 判早春新叶「亮黄绿-黄绿带微红褐调（幼嫩部分）」[12]——弱双源
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [12]
- **花色材质与建模判定（重点问题）**：淡黄绿-褐绿色、无瓣、单花毫米级（萼 1–3mm）[1][2]；照片三源一致「不醒目、绒粒状小簇」[12]——**建模判定建议：不做**（理由：①无花冠+毫米级+淡色，中距身份贡献近零；②花期 4–5 月与叶同放（新叶同屏），窗口短；③身份由对生芽序+羽叶对生+翅果帘幕+树皮四信号承托已足）——决策链对照：栾树金黄强信号做 / 国槐乳白弱信号不做 / **白蜡无瓣最弱信号不做**（口径一致）；如任务书需要春相可作低频变体档（淡黄绿细碎粒层）
  - Form: Qualitative
  - Evidence Status: Verified（花部结构文献三源）/ Inferred（冠面读向照片）
  - Source: [1][2][12]
- **果色材质与建模判定（重点问题）**：**嫩绿（5–6 月）→ 黄绿-淡褐（7–9 月熟）→ 干枯淡黄褐-浅棕（宿存冬态）**——照片色序链：fruit-b「嫩绿微透明」[12] → fruit-a「黄绿-淡褐」[12] → fruit-c「黄绿-淡黄绿帘幕」[12] → twig-a/b「淡黄褐-浅棕纸质半透明（backlit）」[12]——**建模判定建议：做**（理由：①**匙形/线状披针形单翅果是梣属独有造型**，家族内无同型果（国槐念珠肉质、栾树灯笼膨壳、乌桕绿闭果、朴核果、悬铃木球果）；②可见窗口极长——7–9 月盛挂 + 宿存至翌年 2 月（照片双源），覆盖本项目 9–10 月主语境；③夏末满冠帘幕状下垂簇为冠面显著特征（fruit-c「very conspicuous」[12]）；④黄绿-淡褐与叶幕中绿可辨对比）——夏末秋相核心附属物；账目法零 rng 确定性（triadica 绿闭果 / koelreuteria 灯笼串 / sophora 念珠先例同法）
  - Form: Qualitative
  - Evidence Status: Verified（色序照片四点链 + 单果文献）
  - Source: [1][12]
- 秋色（记档不建模）：无中文志书秋色句；照片 form-c（韩国 10 月）「树叶黄化、早秋相」[12]——秋相黄（弱单源照片，任务书口径记档不建模）
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [12]
- 冠层色域（生长季主相）：细碎中绿-亮绿均质冠面（下面浅绿翻叶闪烁弱信号）+ 灰褐浅纵裂干 + 夏末黄绿翅果帘幕 → 秋相黄 + 冬态宿存淡黄褐翅果 + 对生黑褐芽
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [12]

## 6. 变体范围

- **种内亚种轴（重点问题，FRPS vs FOC 分合记档）**：FRPS 独立种口径（白蜡树 F. chinensis 61:30 [1] ↔ 花曲柳 F. rhynchophylla 61:29 [7]）vs FOC 亚种口径（subsp. chinensis ↔ subsp. rhynchophylla [2]）——**生产锚定 subsp. chinensis（原亚种）**；subsp. rhynchophylla 差分数值记档（若语境翻转为北方城市可切换）：顶生小叶宽 (2.5-)3.5-5(-7) cm 显著更大、阔卵形-椭圆、缘圆齿锯齿（crenate-serrate）、翅果较窄 2.5-4cm × 4.5-7mm、果期 9–10 月、树高 12–15m、树皮光滑老时浅裂 [4][7]
  - Form: Qualitative + Range
  - Evidence Status: Verified
  - Source: [1][2][4][7]
- 异名记档：var. rotundata Lingelsh. 1920（FRPS 列白蜡树异名 [1]）；var. rhynchophylla (Hance) Hemsl. 1889（FRPS 列花曲柳异名行 [7]——历史上白蜡树变种，FOC 降为亚种 [2]）
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][7]
- 小叶数幅度：5–7 枚主域（FRPS [1]）；FOC (3-)5-7(-9) 端值 [3] 记变体（3 枚贫叶端、9 枚多叶端）
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][3]
- 小叶形幅度：卵形 ↔ 倒卵状长圆形 ↔ 披针形三型 [1]——**卵形-卵状披针形主相（中庸）、披针形窄端与倒卵状长圆形端入变体档**；先端锐尖至渐尖、基部钝圆或楔形恒定
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1]
- 叶缘幅度：整齐锯齿主相（FRPS [1]）；FOC "sometimes entire in lower half"（下半部近全缘端 [2]）——齿深浅幅度：锐齿（subsp. chinensis distinctly serrate [3]）
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][3]
- 复叶尺度幅度：15–25cm（FRPS 种级 [1]）↔ FOC 广义种 12–35cm [2]（含北方亚种）——生产取种级域
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][2]
- 单干 ↔ 多干轴：单干典型 ↔ 萌发力强萌生多干端（FRPS「植株萌发力强」[1]）——频率 Unknown
  - Form: Qualitative
  - Evidence Status: Verified（萌发性）/ Unknown（频率）
  - Source: [1]
- 果簇宿存时长变体：盛挂 7–9 月 → 宿存至翌年 2 月（照片 [12]）——个体/地域变幅 Unknown
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [12]
- 冠形幅度：卵圆-圆头开展主相 ↔ 山地暴露 gnarled 端（form-b 岩坡扭曲 [12]，公园语境不入主相）
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [12]

## 7. 远近景保留优先级

（写到视觉显著性为止；面数/切换距离等工程映射归任务书）

- 远距（>50m）：**卵圆-圆头开展轮廓 + 细碎均质中绿冠面 + 灰褐浅纵裂干**可辨认；复叶结构、单簇翅果均不可辨，可全部牺牲
- 中距（10–50m，本项目主语境）：**一回羽叶细碎对生质感（15–25cm 羽叶层叠）+ 夏末-秋季翅果帘幕信号（黄绿-淡褐匙形果 3–4cm 下垂密簇、满冠分布）+ 灰褐浅纵裂近光滑干（皮孔）+ 开展骨架枝剪影**；冠层空隙 25–40% 疏朗
- 近距（数米）：**一回奇数羽状复叶全结构（小叶 5–7 枚沿叶轴对生 + 顶生、卵形-披针形 3–10 × 2–4cm、缘整齐锐锯齿、先端锐尖-渐尖、基部钝圆-楔形、上面中绿亮绿下面浅绿灰绿、小叶柄 3–5mm）+ 翅果细部（匙形 3–4cm × 4–6mm、上中部最宽、先端锐尖犁头状、翅下延至坚果中部、坚果 1.5cm、宿存萼）+ 树皮细部（幼干光滑皮孔 → 老干浅-中纵脊沟）+ 对生芽序（黑褐阔卵形芽对，落叶期-早春）+ 花序细部（淡黄绿无瓣绒粒簇，可选不承重）**依次进入可辨域
- 牺牲顺序（远→近）：小叶脉序（侧脉 8–10 对）与叶柄细节 → 花序细部 → 小叶缘齿与先端 → 翅果单果轮廓与簇计数 → 羽叶对生结构 + 翅果帘幕信号 + 开展冠剪影（最后保留）

## 8. 来源证据

| # | 来源 | 类型 | URL/文献 | 检索日期 | 提取内容 |
|---|------|------|----------|----------|----------|
| 1 | 《中国植物志》第 61 卷 (1992) p.30 白蜡树 Fraxinus chinensis（iplant 数据端点全文） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfrps.ashx?key=Fraxinus%20chinensis（frpslink 字段确认「第61卷 (1992) >> 030页」，与任务书锚 FRPS 61:30 一致；检索 key=Fraxinus chinensis 直接命中，现用名即志书名） | 2026-09-21 | 「20. 白蜡树（四川，中国树木分类学）　图版8: 7-10　Fraxinus chinensis Roxb. Fl. Ind. 1: 150. 1820; DC. Prodr. 8: 277. 1844; Hemsl. in Journ. Linn. Soc. Bot. 26: 85. 1889; Lingelsh. in Bot. Jahrb. 40: 216. 1907 et in Publ. Arn. Arb. 4(4): 260. 1914 et in Engl. Pflanzenr. 72(Ⅳ-243): 28, f. 8, A. 1920; Gagnep. in Lecomte, Fl. Gen. Indo-Chine 3: 1065. 1933; Hand.-Mazz. Symb. Sin. 7:1005. 1936; 陈嵘, 中国树木分类学 1058, 图941. 1937; 中国高等植物图鉴 3: 345, 图4644. 1974; 华北树木志 568, 图602. 1984; 云南植物志 4. 611. 1986. ——F. chinensis var. rotundata Lingelsh. l. c. 29. 1920.」「**落叶乔木，高10-12米；树皮灰褐色，纵裂。芽阔卵形或圆锥形，被棕色柔毛或腺毛。小枝黄褐色，粗糙，无毛或疏被长柔毛，旋即秃净，皮孔小，不明显。羽状复叶长15-25厘米；叶柄长4-6厘米，基部不增厚；叶轴挺直，上面具浅沟，初时疏被柔毛，旋即秃净；小叶5-7枚，硬纸质，卵形、倒卵状长圆形至披针形，长3-10厘米，宽2-4厘米，顶生小叶与侧生小叶近等大或稍大，先端锐尖至渐尖，基部钝圆或楔形，叶缘具整齐锯齿，上面无毛，下面无毛或有时沿中脉两侧被白色长柔毛，中脉在上面平坦，侧脉8-10对，下面凸起，细脉在两面凸起，明显网结；小叶柄长3-5毫米。圆锥花序顶生或腋生枝梢，长8-10厘米；花序梗长2-4厘米，无毛或被细柔毛，光滑，无皮孔；花雌雄异株；雄花密集，花萼小，钟状，长约1毫米，无花冠，花药与花丝近等长；雌花疏离，花萼大，桶状，长2-3毫米，4浅裂，花柱细长，柱头2裂。翅果匙形，长3-4厘米，宽4-6毫米，上中部最宽，先端锐尖，常呈犁头状，基部渐狭，翅平展，下延至坚果中部，坚果圆柱形，长约1.5厘米；宿存萼紧贴于坚果基部，常在一侧开口深裂。花期4-5月，果期7-9月。**」「产于南北各省区。多为栽培，也见于海拔800-1600米山地杂木林中。越南、朝鲜也有分布。」「本种在我国栽培历史悠久，分布甚广。**主要经济用途为放养白蜡虫生产白蜡**，尤以西南各省栽培最盛。贵州西南部山区栽的枝叶特别宽大，常在山地呈半野生状态。性耐瘠薄干旱，在轻度盐碱地也能生长。植株萌发力强，材理通直，生长迅速，柔软坚韧，供编制各种用具；树皮也作药用。」「本种最迟于18世纪末期已引入印度、日本以及欧洲和美国。模式标本采自原产我国引种于印度的植株。」 |
| 2 | Flora of China Vol.15 (1996) 16. Fraxinus chinensis Roxburgh 种级（iplant 数据端点全文） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfoc.ashx?key=Fraxinus%20chinensis（vol 字段确认 Vol.15 (1996)，Oleaceae → Fraxinus） | 2026-09-21 | "Trees 3-20 m. Branchlets glabrous, sparsely villous puberulent or tomentose; buds broadly ovoid or conical, brown tomentose, pubescent or glandular hairy. Leaves 12-35 cm; petiole 3-9 cm; axis puberulent or pilose at first, leaflet joint glabrous or densely tomentose; **leaflets 3-7(-9); petiolule 2-15 mm; leaflet blade broadly ovate, ovate, to lanceolate or elliptic to obovate-lanceolate, 4-16 × 2-7 cm (terminal much larger), papery to somewhat leathery, glabrous or villous, sometimes villous only along veins abaxially, base blunt or cuneate, margin regularly serrate to crenate-serrate, sometimes entire in lower half, apex acute to long acuminate or caudate; primary veins 5-10 on each side of midrib. Panicles terminal or lateral, 5-10 cm. Flowers dioecious, opening with leaves. Staminate flowers congested; calyx cupular, 1-1.5 mm; corolla absent. Pistillate flowers lax; calyx tubular, 2-3 mm. Samara spatulate to very narrowly so, 2.5-4 cm × 3-7(-15) mm; wing decurrent to middle or lower part of nutlet.**" Habitat: "Slopes, along rivers, roadsides, mixed woods; 800-2300 m. **Throughout China** [Japan, Korea, Russia, Vietnam]"；种下检索表（keylist）：16a subsp. chinensis（顶生小叶宽 2-4(-6) cm、ovate-lanceolate、margin distinctly serrate）vs 16b subsp. rhynchophylla 花曲柳（顶生小叶宽 (2.5-)3.5-5(-7) cm、broadly ovate to elliptic、margin crenate-serrate） |
| 3 | Flora of China Vol.15 16a. F. chinensis subsp. chinensis 白蜡树(原亚种)（iplant 数据端点全文） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfoc.ashx?key=Fraxinus%20chinensis%20subsp.%20chinensis | 2026-09-21 | "Leaflets (3-)5-7(-9), ovate, ovate-lanceolate, to lanceolate or elliptic to obovate-oblong, terminal leaflet (4-)7-10(-12) × 2-4(-6) cm, villous beside basal part of midrib abaxially, rarely tomentose or almost glabrous, **margin distinctly serrate**, apex short to long acuminate; primary veins 6-12 on each side of midrib. **Samara spatulate to very narrowly so, 3-3.5(-4) cm × 3.5-7(-15) mm. Fl. Apr-May, fr. Jul-Sep.**" Habitat: "Mixed woods in montane regions; 800-2300 m. **Throughout China** [Korea, Vietnam]" |
| 4 | Flora of China Vol.15 16b. F. chinensis subsp. rhynchophylla (Hance) E. Murray 花曲柳（iplant 数据端点全文） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfoc.ashx?key=Fraxinus%20chinensis%20subsp.%20rhynchophylla | 2026-09-21 | "Leaflets 3-7, terminal leaflet broadly ovate to elliptic, sometimes ± lanceolate, (4-)5-9(-12) × (2.5-)3.5-5(-7) cm, villous to tomentose beside basal part of midrib abaxially, sometimes brownish, margin crenate-serrate, apex short acuminate to acuminate or caudate; primary veins (5 or)6-9 on each side of midrib. Samara narrowly to very narrowly spatulate, 2.5-4 cm × 4.5-7 mm. Fl. Apr-May, fr. Sep-Oct." Habitat: "Slopes, along rivers, roadsides; 0-1500 m. **Gansu, Hebei, Heilongjiang, Henan, Jilin, Liaoning, Shaanxi, Shandong, Shanxi** [Japan, Korea, Russia]"（北方型原生分布，不含长江流域） |
| 5 | 《中国植物志》第 61 卷 (1992) p.5 梣属 Fraxinus 属级（iplant 数据端点全文） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfrps.ashx?key=Fraxinus（frpslink「第61卷 (1992) >> 005页」） | 2026-09-21 | 「2. 梣属——Fraxinus Linn.」「**落叶乔木，稀灌木。芽大，多数具芽鳞2-4对，稀为裸芽。嫩枝在上下节间交互呈两侧扁平状。叶对生，奇数羽状复叶，稀在枝梢呈3枚轮生状，有小叶3至多枚；叶柄基部常增厚或扩大；小叶叶缘具锯齿或近全缘。**花小，单性、两性或杂性，雌雄同株或异株；圆锥花序顶生或腋生于枝端，或着生于去年生枝上；苞片线形至披针形，早落或缺如；花梗细；花芳香，花萼小，钟状或杯状，萼齿4枚，或为不整齐的裂片状，或退化至无花萼；**花冠4裂至基部，白色至淡黄色，裂片线形、匙形或舌状，早落或退化至无花冠**；雄蕊通常2枚……子房2室……**果为含1枚或偶有2枚种子的坚果，扁平或凸起，先端迅速发育伸长成翅，翅长于坚果，故称单翅果**……」「约60余种……我国产27种，1变种，其中1种系栽培，遍及各省区。」「本属有许多种是重要的材用树种……**可作园林绿化的观赏树和行道树**，也可作护田与堤岸保土树种。本属植物有重要经济价值，一是有几种的树皮作为中药"秦皮"……**一是放养白蜡虫（Ericerus pela，蚧科，半翅目），取蜡为工业上重要原料。其中以白蜡树最常见于栽培，历史悠久，尤以西南各省最盛。**」 |
| 6 | Flora of China Vol.15 梣属 Fraxinus 属级（iplant 数据端点全文） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfoc.ashx?key=Fraxinus | 2026-09-21 | "Trees or rarely shrubs, deciduous or rarely evergreen. **Leaves odd-pinnate, opposite or rarely whorled at branch apices**; petiole and petiolule often basally thickened. Inflorescences terminal or axillary toward end of branches, or lateral on branches of previous year, paniculate...Calyx 4-toothed...**Corolla white to yellowish, 4-lobed, divided to base or absent**...**Fruit a samara with apically elongated wing.**" 属级分种检索表第一差分「6 Flowers **without corolla** → 7 Leaflets broadly ovate, ovate, to lanceolate, 2-7 cm wide → **16 Fraxinus chinensis 白蜡树**」（无花冠+宽小叶=白蜡树支）；couplet 11/16/22 含苦枥木 F. insularis（Leaflets 3-5(-7), glabrous；corolla white 支）与尖萼梣 F. odontocalyx（margin serrate, blade sparsely dotted）各自独立种条目 |
| 7 | 《中国植物志》第 61 卷 (1992) p.29 花曲柳 Fraxinus rhynchophylla（iplant 数据端点全文） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfrps.ashx?key=Fraxinus%20rhynchophylla（frpslink「第61卷 (1992) >> 029页」） | 2026-09-21 | 「19. 花曲柳（东北，东北木本植物图志）**大叶白蜡树（中国树木分类学），大叶梣（河北习见树木图说）**图版9:1-4　Fraxinus rhynchophylla Hance in Journ. Bot. 7: 164. 1869……**——F. chinensis Roxb. var. rhynchophylla (Hance) Hemsl.** in Journ. Linn. Soc. Bot. 26: 86. 1889……——F. hopeiensis Tang 1931……」「落叶大乔木，高12-15米，**树皮灰褐色，光滑，老时浅裂。冬芽阔卵形，顶端尖，黑褐色，具光泽，内侧密被棕色曲柔毛。当年生枝淡黄色，通直，无毛，去年生枝暗褐色，皮孔散生。**羽状复叶长15-35厘米；叶柄长4-9厘米，基部膨大；叶轴上面具浅沟，**小叶着生处具关节**，节上有时簇生棕色曲柔毛；小叶5-7枚，革质，阔卵形、倒卵形或卵状披针形，长3-11(-15)厘米，宽2-6(-8)厘米，营养枝的小叶较宽大，**顶生小叶显著大于侧生小叶**……上面深绿色……下面色淡……花期4-5月，果期9-10月。」「产于东北和黄河流域各省。生山坡、河岸、路旁，海拔1500米以下……**见于长江流域各省，福建、云南和西藏也有栽培**。」（FRPS 口径独立种 + 历史变种名链 + 北方原生） |
| 8 | Flora of China Vol.15 11. Fraxinus insularis Hemsley 苦枥木（iplant 数据端点全文） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfoc.ashx?key=Fraxinus%20insularis | 2026-09-21 | "Trees 20-30 m...leaflet blade oblong, elliptic-lanceolate, or lanceolate, 6-9(-13) × 2-3.5(-4.5) cm...**Corolla white; lobes spatulate, ca. 2 mm**...Samara red to brown, long spatulate, 2-4 cm × 3.5-4.5 mm...Fl. Apr-May, fr. Jul-Sep." Habitat: "**Anhui, Fujian, Gansu, Guangdong, Guangxi, Guizhou, Hainan, Hubei, Hunan, Jiangsu, Jiangxi**, Shaanxi, Sichuan, Taiwan, Yunnan, Zhejiang [Japan]"（长江流域原生近缘、有白花冠、20-30m——FOC 未归并入 chinensis，任务书归并预测证伪记档） |
| 9 | GBIF Backbone Taxonomy（结构化检索） | 数据库 | https://api.gbif.org/v1/species/search?q=Fraxinus%20chinensis&rank=SPECIES&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c | 2026-09-21 | Fraxinus chinensis Roxb. ｜ taxonomicStatus: **ACCEPTED**（现代数据库现用名侧；species/match 端点返回 SPECIES 记录无 accepted 重定向） |
| 10 | NC State Extension Plant Toolbox（园艺轴——**无条目记档**） | 园艺官方 | https://plants.ces.ncsu.edu/plants/fraxinus-chinensis/（HTTP 404）；站内搜索 "fraxinus chinensis" 返回 "We couldn't find any plants using the term 'fraxinus chinensis'"，Fraxinus 属仅收录北美本土种（americana/angustifolia/caroliniana/latifolia/nigra/pennsylvanica/profunda/quadrangulata） | 2026-09-21 | **NC 无中国白蜡树条目——园艺轴降级**：体量/树皮园艺交叉改由 FRPS 志书直给（高10-12米）+ 照片轴承托；本行仅作通道记档 |
| 11 | 任务书（用户提供） | 用户提供 | 主代理派遣指令（本会话） | 2026-09-21 | 使用语境（长江流域城市公园、≈8–12m 族量级锚）、FRPS 61:30 / FOC Vol.15 结构尺度锚、十项重点调研面（种定名/复叶/冠形/枝姿芽序/树皮/花/翅果/叶色/变体/D34）、近缘排除名单（苦枥木/尖萼梣/白枪杆/大叶梣/美国白蜡/欧洲白蜡）、通道现状与照片纪律 |
| 12 | iNaturalist research-grade 真实照片（直接视觉证据；本地副本 ref-fraxinus-*.jpg 16 张不入 git；taxon 537565 = Fraxinus chinensis species + 1057060 = subsp. chinensis，2026-09-21 经 /v1/taxa 端点确认均 active；**601637 subsp. rhynchophylla 检索池排除记档**） | 真实照片 | 照片页 https://www.inaturalist.org/photos/<id>；原图 https://inaturalist-open-data.s3.amazonaws.com/photos/<id>/original.jpg（16/16 HEAD 200 验证，扩展名均 .jpg）；检索 www.inaturalist.org/observations.json taxon_id=537565 photos=true quality_grade=research（中国池 place_id=6903 79 obs + 世界池 200 obs） | 2026-09-21 | 见下「照片来源明细」 |

### 照片来源明细（来源 [12] 展开）

| 槽位 | 文件 | photo id | obs id | taxon 核对 | 日期 | 地点 | 许可 | 原图 URL | 判读摘要（中性描述，不含树种名） |
|------|------|----------|--------|-----------|------|------|------|----------|----------------------------------|
| form-a | ref-fraxinus-form-a.jpg | 646680991 | 354498740 | Fraxinus chinensis | 2026-04-26 | 山东烟台 | CC-BY-NC | S3 original.jpg | 春季山坡开花树整株：宽阔疏展卵圆-圆顶树冠、树干可见至地面、新叶亮黄绿、远距花不可辨、林地山坡背景 |
| form-b | ref-fraxinus-form-b.jpg | 580042283 | 320783153 | Fraxinus chinensis | 2025-10-09 | 韩国北汉山国立公园 | CC-BY-NC | S3 original.jpg | 岩坡整树（人头参照）：短倾斜干 + 多开展扭曲主枝 = 宽圆开敞冠、山地暴露 gnarled 相、叶早秋黄化（山地端变体，不承托公园主相） |
| form-c | ref-fraxinus-form-c.jpg | 580042269 | 320783153 | Fraxinus chinensis | 2025-10-09 | 韩国北汉山国立公园 | CC-BY-NC | S3 original.jpg | 树体上部中距：主干暗灰褐-近炭色、大骨架枝开展→圆润开敞冠、细枝疏网 airy、羽状复叶中距不可辨、早秋黄化 |
| leaf-a | ref-fraxinus-leaf-a.jpg | 675833183 | 369962545 | Fraxinus chinensis | 2026-06-09 | 北京松山森林景区 | CC-BY-NC | S3 original.jpg | 手持复叶近距：羽状复叶沿中轴排列小叶多枚、森林背景（手持鉴定照语境） |
| leaf-b | ref-fraxinus-leaf-b.jpg | 546216714 | 303060979 | Fraxinus chinensis | 2025-08-02 | 山东泰安 | CC-BY-NC | S3 original.jpg | 叶部近距：5–7 小叶沿中轴对生排列、小叶卵形-长圆卵形上面中-深绿有光泽、下面明显更浅（浅绿-灰绿）、纸质半透明感、背面仰视视角 |
| leaf-c | ref-fraxinus-leaf-c.jpg | 659009807 | 361109696 | Fraxinus chinensis | 2026-05-13 | 山东泰山圣水井 | CC-BY-NC | S3 original.jpg | 枝叶+花+干皮中景：5–7 小叶沿叶轴对生、新叶亮黄绿、**花簇从叶腋垂挂（极小褐-黄绿色无醒目花瓣、紧凑绒毛状束）**、枝光滑-细纵裂灰白-灰褐带皮孔、背景粗干深色纵脊沟 |
| flower-a | ref-fraxinus-flower-a.jpg | 659003502 | 361109696 | Fraxinus chinensis | 2026-05-13 | 山东泰山圣水井 | CC-BY-NC | S3 original.jpg | 花簇特写：密集淡黄绿色小花簇、花极小不醒目、绿叶背景 |
| flower-b | ref-fraxinus-flower-b.jpg | 659003533 | 361109696 | Fraxinus chinensis | 2026-05-13 | 山东泰山圣水井 | CC-BY-NC | S3 original.jpg | 花序结构中景：密集多分枝花簇从叶腋垂挂、绿-暗棕紫色、单花毫米级颗粒串珠感、无瓣可辨；大枝光滑灰树皮带绿斑（地衣/藻）+ 皮孔 |
| fruit-a | ref-fraxinus-fruit-a.jpg | 24592283 | 16358813 | Fraxinus chinensis | 2018-09-03 | 吉林汪清 | CC0 | S3 original.jpg | 果期盛挂：细枝 + 大量黄绿-淡褐匙形桨状翅果下垂簇（每簇 10 枚级）+ 羽状复叶同屏 |
| fruit-b | ref-fraxinus-fruit-b.jpg | 380026927 | 214970431 | Fraxinus chinensis | 2024-05-11 | 北京奥林匹克森林公园 | CC-BY-NC | S3 original.jpg | 幼果期：细枝 + 绿色窄桨状带翅果下垂簇、嫩绿半透明（5 月已挂果——果期始点照片锚） |
| fruit-c | ref-fraxinus-fruit-c.jpg | 544189910 | 301973186 | Fraxinus chinensis | 2025-07-29 | 山东五莲九仙山风景区 | CC-BY-NC | S3 original.jpg | 冠下仰观满冠翅果：大量细长扁平匙形翅果密集成帘幕状下垂簇、黄绿-淡黄绿、**满冠显著特征（very conspicuous）**；主枝外斜、冠圆润开张；干灰-灰褐浅纵脊沟 |
| twig-a | ref-fraxinus-twig-a.jpg | 470918076 | 262079902 | Fraxinus chinensis | 2025-02-18 | 北京莲花池公园 | CC-BY-NC-ND | S3 original.jpg | 公园冬态：无叶大枝 + 大量淡黄褐-浅棕纸质扁平翅果簇宿存挂枝（backlit 半透明）；骨架枝中-宽角分歧、细疏通透冠；大枝皮光滑-微纹理灰-灰褐 |
| twig-b | ref-fraxinus-twig-b.jpg | 614157146 | 337797041 | Fraxinus chinensis | 2026-02-08 | 北京房山猫耳山 | CC-BY-NC | S3 original.jpg | 冬态枝近距：细枝 + 干褐色翅果簇下垂（2 月宿存）、细枝灰褐-深灰褐较光滑、蓝天背景 |
| bud-a | ref-fraxinus-bud-a.jpg | 640718892 | 351126316 | Fraxinus chinensis | 2026-04-19 | 北京门头沟灵山风景区 | CC-BY-NC | S3 original.jpg | 早春枝端特写：**芽成对生于节上（对生排列）**、芽阔卵形-圆穹顶状、黑褐-深绿褐色、较大、微粗鳞片状、萌动开裂吐绿；枝灰褐-浅褐较光滑、被白粉感；新叶亮绿披针形带微红褐调 |
| bark-a | ref-fraxinus-bark-a.jpg | 530658590 | 294798943 | Fraxinus chinensis | 2025-06-23 | 北京 | CC-BY-NC | S3 original.jpg | 幼干+叶：**幼干光滑、浅灰褐-棕褐、细纵纹 + 圆-椭圆皮孔**；复叶上面中绿下面浅绿-灰白两面色差（部分叶有虫害斑） |
| fruit-herb | ref-fraxinus-fruit-herb.jpg | 651963074 | 357449513 | Fraxinus chinensis | 2026-05-02 | 北京门头沟潭柘寺绝石梁 | CC-BY-NC | S3 original.jpg | 纸上翅果标本（5 月采集）：多枚细长扁平单翅果平铺、一端窄椭圆体一端扁平长翅（匙形轮廓 1D 展示） |

## 域扩展节：plant

（字段定义见 `.zcode/skills/asset-research/references/plant-schema.md` v0.2）

### A. 干与枝

- `trunk_height_ratio`：Unknown（无整树标定；照片山地相为主）
  - Form: Unknown | Evidence Status: Unknown
- `trunk_taper_ratio`：Unknown
  - Form: Unknown | Evidence Status: Unknown
- `basal_flare_ratio`：Unknown（无近基特写）
  - Form: Unknown | Evidence Status: Unknown
- `trunk_lean_angle`：Unknown（照片单干近直弱读向）
  - Form: Unknown | Evidence Status: Unknown | Source: [12]
- `branching_levels`：3–4 级可见（form-c 疏网 [12]，弱单源）
  - Form: Value | Evidence Status: Inferred | Source: [12]
- `scaffold_branch_count`：Unknown（无标定整树样木）
  - Form: Unknown | Evidence Status: Unknown
- `scaffold_angle`：Unknown（定量）；定性：**骨架枝自中上部开展分歧、外斜伸展**（form-c/fruit-c 照片 [12]）
  - Form: Unknown / Qualitative | Evidence Status: Unknown（定量）/ Inferred（定性）| Source: [12]
- `branch_orientation`：**对生（复叶对生 + 芽对生 + 嫩枝交互扁平）**——属级「叶对生」[5][6] + bud-a 对生芽照片 [12]；骨架枝排列 Unknown
  - Form: Qualitative + Unknown | Evidence Status: Verified（叶/芽对生）/ Unknown（骨架排列）| Source: [5][6][12]
- `branch_length_decay` / `branch_radius_decay` / `branch_attachment_t` / `allometry_exponent`：Unknown（与先例同缺口，不伪造）
  - Form: Unknown | Evidence Status: Unknown
- `apical_dominance`：中庸-失去领导（开展圆冠读向 [12]；非强领导型）
  - Form: Qualitative | Evidence Status: Inferred | Source: [12]
- `branch_curvature`：大枝开展-外斜、末级枝斜展-稍下垂（果序明显下垂 [12]）；非下垂枝型
  - Form: Qualitative | Evidence Status: Inferred | Source: [12]

### B. 叶与冠

- `leaf_attachment_rule`：**复叶在枝上对生**（属级「叶对生」[5][6]）；着生于末级枝（当年生黄褐小枝 [1]）
  - Form: Qualitative | Evidence Status: Verified | Source: [1][5][6]
- `leaf_cluster_density`：1 枚羽叶/挂点；冠面密度由细碎小叶大量层叠产生
  - Form: Value | Evidence Status: Inferred | Source: [1][12]
- `clump_scale`：羽叶（15–25cm）≈ 1/20–1/30 冠幅级结构单元；翅果簇（5–10cm 级下垂密簇）为冠面离散大信号
  - Form: Relative | Evidence Status: Inferred | Source: [1][12]
- `leaf_orientation_dist`：羽叶平展层叠（照片均质细碎冠面读向 [12]；无「平展」文献原句——弱于栾树「叶平展」证据位）
  - Form: Qualitative | Evidence Status: Inferred | Source: [12]
- `leaf_size`：复叶总长 15–25cm（Verified [1]）；小叶 3–10 × 2–4cm 卵形-倒卵状长圆形-披针形（Verified [1]）；小叶 5–7 枚 + 顶生（Verified [1]）
  - Form: Range | Evidence Status: Verified | Source: [1][3]
- `leaf_aspect_ratio`（小叶长/宽）：≈1.5–3.0（文献 3–10 × 2–4cm 推算，卵形端窄、披针形端宽）
  - Form: Range | Evidence Status: Verified（文献推算）| Source: [1]
- `crown_transparency`：空隙 ≈25–40%（fruit-c airy 开放 + form-c 疏网 [12] 弱双源）
  - Form: Relative | Evidence Status: Inferred | Source: [12]
- `crown_fill_gradient`：Unknown（无判读）
  - Form: Unknown | Evidence Status: Unknown
- **复叶形态组（schema 无专字段——挂本组记档，家族复叶第三例/对生系首例）**：一回奇数羽状；**复叶对生（枝上）+ 小叶对生（轴上，照片级）**；小叶 5–7 枚 + 顶生；小叶卵形-倒卵状长圆形-披针形 3–10 × 2–4cm、先端锐尖至渐尖、基部钝圆或楔形、**缘整齐锐锯齿**（vs 国槐全缘——复叶系缘齿对照轴：白蜡锐齿 vs 国槐全缘）、硬纸质、侧脉 8–10 对细脉网结、小叶柄 3–5mm、叶柄基部不增厚（vs 国槐叶柄基膨大藏芽）、上面无毛下面沿中脉有时白色长柔毛、**顶生小叶与侧生近等大或稍大**（vs 花曲柳顶生显著更大 [7]——亚种差分点）
  - Form: Qualitative + Range | Evidence Status: Verified（除小叶对生为照片级 Inferred 外）| Source: [1][2][3][5][6][7][12]
- **花序形态组（挂点附属物一）**：圆锥花序顶生或腋生枝梢 5–10cm、雌雄异株、与叶同放、**无花冠**（雄萼钟状 1mm/雌萼桶状 2–3mm）、淡黄绿-褐绿色——**建模判定建议：不做**（理由记 §5；判定归任务书终审）
  - Form: Range + Qualitative | Evidence Status: Verified | Source: [1][2][12]
- **翅果序形态组（挂点附属物二）**：匙形单翅果 3–4cm × 4–6mm、上中部最宽、先端锐尖常呈犁头状、翅下延至坚果中部（坚果圆柱形 1.5cm、翅约占全长 1/2）、宿存萼贴坚果基；果序下垂密簇（5–10cm 级、每簇 10 枚级）、夏末满冠帘幕状；色序嫩绿→黄绿-淡褐→干枯淡黄褐；7–9 月盛挂 + 宿存至翌年 2 月（照片双源）——**建模判定建议：做**（理由记 §5；判定归任务书终审）
  - Form: Range + Qualitative | Evidence Status: Verified（单果文献）/ Inferred（簇密度/宿存照片）| Source: [1][2][3][12]

### C. 表皮与芽

- `bark_archetype`：**浅-中纵裂型（无剥落）+ 幼干近光滑**——灰褐基调；龄级序列：幼干光滑浅灰褐-棕褐带皮孔（bark-a [12]）→ 中龄浅-中纵脊沟灰褐（fruit-c [12]）→ 老干深纵脊沟暗灰褐-近炭（leaf-c 背景/form-c [12]）；FRPS「树皮灰褐色，纵裂」[1]；近缘花曲柳「光滑，老时浅裂」[7]
  - Form: Qualitative | Evidence Status: Verified（纵裂基调文献）/ Inferred（龄级序列照片合并；**主干特写缺失**）
  - Source: [1][7][12]
- `bark_color`：灰褐-灰白（幼干）→ 灰褐（中龄）→ 暗灰褐-近炭（老干）；枝级光滑灰白-灰褐带地衣绿斑（flower-b [12]）
  - Form: Qualitative | Evidence Status: Verified（灰褐 [1]）/ Inferred（序列照片）
  - Source: [1][12]
- `bark_relief`：**低-中浮雕**（幼干近光滑；中龄脊浅沟浅；老树渐深——vs 国槐厚脊深沟、樟深纵裂）
  - Form: Relative | Evidence Status: Inferred | Source: [12]
- `bark_epiphytes`：大枝地衣/藻绿斑局部（flower-b 泰山 [12]，低置信不承重）
  - Form: Qualitative | Evidence Status: Inferred（低置信）| Source: [12]
- `twig_surface`：**「小枝黄褐色，粗糙，无毛或疏被长柔毛，旋即秃净，皮孔小，不明显」（FRPS 原句 [1]）**；**嫩枝在上下节间交互呈两侧扁平状（属级 [5]）**；冬态细枝灰褐-深灰褐较光滑（twig-b [12]）
  - Form: Qualitative | Evidence Status: Verified | Source: [1][5][12]
- `bud_aspect`：**「芽阔卵形或圆锥形，被棕色柔毛或腺毛」（种级 [1]）+ 芽鳞 2–4 对（属级 [5]）**；照片 bud-a：**对生芽序 + 黑褐-深绿褐阔卵形较大芽、萌动吐绿 [12]**——对生黑褐芽为落叶期-早春近景身份信号（照片级待主代理双问终审确认）
  - Form: Qualitative | Evidence Status: Verified（形态文献）/ Inferred（对生排列照片级）
  - Source: [1][2][5][12]

## 检索与证据备注

- 网络可达性（2026-09-21/22 本机）：**iplant.cn 数据端点全链可达**——FRPS 白蜡树（key=Fraxinus chinensis，4104B，frpslink「第61卷 (1992) >> 030页」任务书锚 61:30 核实属实）+ FRPS 花曲柳（key=F. rhynchophylla，「029页」）+ FRPS 属级（key=Fraxinus，「005页」）+ FOC 种级/subsp. chinensis/subsp. rhynchophylla/属级/苦枥木（key=F. insularis）共 8 端点全文；**本种检索 key=Fraxinus chinensis 直接命中（现用名=志书名，无需异名 key 切换——与国槐 Styphnolobium 教训不同）**。FRPS 苦枥木 key=F. retusa 返回空（FRPS 库或按中文名索引该条，未深究——FOC insularis 端点已取到苦枥木差分所需全文，不阻塞）。**NC State Extension 无 Fraxinus chinensis 条目**（fraxinus-chinensis slug 404 + 站内搜索零命中，仅收录北美本土种）——园艺轴降级记档。Wikipedia EN curl 超时（000，与先例一致）。WebSearch/web_reader MCP 配额未恢复（错误 1310，2026-10-04 重置；测试一次即走通道光谱，其训练数据兜底输出不采信）。GBIF API 可达（ACCEPTED 结构化确认）。
- iNat 链路：taxa 端点确认三个相关 taxon——**537565 F. chinensis（species）+ 1057060 subsp. chinensis + 601637 subsp. rhynchophylla**；**检索 taxon_id=537565 隐含子类群**，返回池内 subsp. rhynchophylla（花曲柳）占中国池 34/79、世界池 116/200——**近缘排除核心动作：按 obs taxon.name 过滤，仅保留 Fraxinus chinensis 与 F. chinensis chinensis（原亚种），剔除 subsp. rhynchophylla 共 150 obs**（保留 subsp. chinensis 的 obs 因其即白蜡树本尊原亚种，生产身份实体）；美国白蜡 F. americana / 欧洲白蜡 F. excelsior 不在同一 taxon 检索树内（无混入路径，照片判读亦未见引入栽培个体）。www.inaturalist.org/observations.json 端点全程稳定（api v1 未使用——先例截断教训）。
- 图片获取与校验：中国池过滤后 45 obs 共 73 photo + 世界池过滤后 84 obs 共 130 photo 候选；S3 medium 下载 53 张（26 张 404 无 S3 副本——含北京 2024-08/09/10 月部分果期照片与南京 3 月冬态照片，按 HEAD 404 即弃纪律未强取 static 域）；**original 下载 16/16 成功且 PIL 全量解码零截断**（本轮 S3 传输稳定，未见先例 3–211 字节级截断）；长边压 2000px 转存 ref-fraxinus-*.jpg；16 张 original URL 逐一 HEAD 200 验证（均 original.jpg 扩展名）。
- 判读架构与诚实记档：判读通道 = **GLM-4.5V（mcp__4_5v_mcp__analyze_image）S3 直链 medium**（约 28 次判读调用全程稳定，无 1210 退化——与上一树后期退化实况不同，本轮未触发；小批量 ≤4 张/组纪律执行）；提问中性不含树种名。本会话 Read 工具对图片返回 CDN 转存 URL 而非内联视觉（与 sophora 终审轮同机制），调研判读未使用该通道。**任务书「主代理终审两次独立视觉提问」归主代理执行**——承重照片建议优先抽验：bud-a（对生芽序主张）、leaf-b（小叶对生+两面色差）、fruit-c（帘幕显著性）、twig-a/b（冬态宿存）。
- **排除照片记档（近缘/内容排除）**：①检索池级：subsp. rhynchophylla 150 obs（见上）；②内容级：photo 516533786（obs 287276929，北京 2025-05-28）判读为地面草本幼株——非目标树照片，排除；photo 537861436（obs 298591521，济南 2025-06-04）判读为单叶互生掌状脉叶片——与羽状复叶矛盾（疑树下幼苗/他种混拍），排除；photo 735294442/735294476（obs 400663355，海参崴街道 2026-09-16）后者判读单叶互生全缘+圆形绿果——与白蜡复叶+翅果矛盾，**整 obs 排除**（俄远东池混淆风险记档）；photo 649698452/649698610（obs 356270194，哥伦比亚 Bucaramanga 2026-04-27）为保护笼+轮胎圈幼树苗——幼态排除；photo 604795533（obs 333162309，呼和浩特 2026-01-03）判读为带叶枝特写——1 月严寒与落叶性矛盾（obs 季节标注存疑），排除不承重；photo 585595648（obs 323617417，首尔 2025-10-28）叶部病害暗光特写——判读价值低排除；photo 659003533 首轮误判苗圃（换措辞复判为枝叶花中景后入库 flower-b）。
- 尺度结构事实优先级执行：树高/复叶/小叶/花序/花部/翅果/物候/芽/小枝/树皮基调全部以 FRPS 61:30 + FOC Vol.15 原句为准（iplant 端点全文，frpslink 页码锚核对：030 页白蜡树/029 页花曲柳/005 页属级）；FOC 广义种数值（叶 12–35cm、小叶 3–7(-9)、4–16 × 2–7cm）与 subsp. chinensis 数值并列记档、**生产取 FRPS 种级 = subsp. chinensis 域**；照片轴封顶 Inferred（除直接视觉证据如对生芽序、小叶对生、两面色差、翅果帘幕、宿存冬挂作照片级承托并标注）。

## 结构性缺口（Unknown Gate 相关）

- **公园中龄 8–12m 带参照单干整树样木缺失（本 Spec 最大照片缺口）**：照片池整树为山地/风景区相（form-a 烟台山坡、form-b/c 韩国北汉山岩坡 gnarled）——冠幅比 0.7–1.0、净干占比、骨架枝数量/仰角定量全部 Unknown 或弱 Inferred；**志书「高10-12米」直接承担体量锚（罕见志书级数值）**，形态侧建议锚点门以文献域 + 主代理裁定收口，或补研公园整树照片。
- **树皮主干特写缺失**：多源中景枝干合并（幼干/大枝/背景粗干）+ FRPS「灰褐色，纵裂」承托；**树皮色板/细节档制作前建议补 1–2 张真实中龄主干特写**（koelreuteria 先例同型缺口教训——中景证据不承托浮雕定量）。
- **小叶对生的志书种级显式句缺失**：照片三源 + 花曲柳「小叶着生处具关节」间接——Inferred 承托（置信高但如实标注）。
- **对生芽序照片单源**：bud-a 一张（文献芽形 Verified + 属级对生叶序互证）——建议主代理双问终审确认后升级。
- **叶背色志书显式句缺失**：FRPS 仅毛被句（「下面无毛或有时沿中脉两侧被白色长柔毛」）——两面色差按照片级 Inferred（弱于国槐「下面灰白色」Verified 级）；「白蜡」命源已裁定为白蜡虫（经济）非叶色（§1），叶背不做蜡白过度引申。
- **翅果宿存时长文献句缺失**：照片双源（2 月）承托 Inferred；志书无宿存原句。
- **骨干枝定量**（数量/仰角/衰减比/异速指数/着生区间）：与先例同缺口，不阻塞。
- **长江流域城市 subsp. chinensis vs 近缘栽培占比定量**：无一手来源——判据链（分布+栽培史+亚种原生域）Inferred 承托，可被用户实地语境推翻。
- 秋色定量（黄，弱单源照片）：记档不建模。

## 终审记档（主代理，2026-09-22）

**① 硬数值独立抽查 34/34 全过**：主代理自 iplant 数据端点独立重拉 FRPS 61:30（key=Fraxinus chinensis，4104B，frpslink「第61卷 (1992) >> 030页」核对）与 FOC Vol.15 种级全文，对 Spec 引用的 34 条硬数值逐位比对——高 10-12 米/树皮灰褐纵裂/芽阔卵形圆锥被棕色柔毛或腺毛/小枝黄褐粗糙皮孔小不明显/复叶 15-25cm/叶柄 4-6cm 基部不增厚/小叶 5-7 枚/3-10×2-4cm/顶生近等大或稍大/锐尖至渐尖/整齐锯齿/侧脉 8-10 对/小叶柄 3-5mm/花序 8-10cm/无花冠/雌萼 2-3mm/翅果匙形 3-4cm×4-6mm/上中部最宽犁头状/翅下延坚果中部/坚果 1.5cm/花期 4-5 果 7-9/白蜡虫经济用途句/var. rotundata 异名行 + FOC leaflets 3-7(-9)/petiolule 2-15mm/blade 4-16×2-7 (terminal much larger)/corolla absent/samara 2.5-4cm×3-7(-15)mm/wing decurrent/calyx 1-1.5mm/panicles 5-10cm/Throughout China——全部原文命中（一处初判 FAIL 复核为主代理单复数笔误〔Samaras→Samara〕，Spec 引用正确）。**零不一致。**

**② 照片终审（008.6 返修规程：两次独立视觉提问一致方定名）**：判读通道 = Read 工具本地副本 → CDN 转存 URL → GLM-4.5V 中性判读（提问不含树种名）；**承重照片 5 张双问全一致定名，零不承重处置**（011.9 两张不承重教训后本树调研判读质量核验通过）：
- **leaf-b** ✅✅：小叶沿中轴**成对对生** + **顶生单独小叶** + **5–7 枚** + **细密整齐锯齿** + 先端尖 + **上面深绿有光泽下面浅绿-灰绿两面色差** + 卵形-卵状披针形——两问逐点一致（复叶结构照片锚成立）
- **bud-a** ✅✅：**对生芽序确认**——两问各自数出 4–5 组对生芽对（每个节左右各一枚正对）；芽阔卵形-圆锥形、黑褐-深绿褐、较大、部分开裂吐绿；枝灰褐较光滑被白粉感——**单源主张按 Spec 建议升级双问确认**（与属级对生叶序互证，对生芽序 = 白蜡身份特征采信）
- **fruit-c** ✅✅：匙形桨状翅果单果 **3–4cm**、**下垂密集成帘幕状簇**、**满冠分布**、黄绿-淡黄绿、与绿叶对比醒目、**画面主导特征 very conspicuous**——两问逐点一致（翅果建模判定「做」的照片锚成立）
- **form-a** ✅✅：**构图先验通过（011.9 form-a 教训）**——两问均确认整树可见（树干+地面入镜）；宽阔卵圆-圆顶冠、冠幅≈树高或略大、主枝中位分歧、大枝开展外斜、细碎叶幕、春季新叶相、干灰褐浅纵纹——冠形照片锚成立
- **twig-a** ✅✅：冬季无叶 + **大量扁平带翅桨状果淡黄褐-浅棕成簇下垂宿存** + 大枝开展中-宽角 + 大枝皮光滑-微纹理灰-灰褐 + 疏朗通透冬态——两问一致（**宿存冬挂照片锚成立**，与 twig-b 双源）

**③ 终审裁决八项**（分歧与开放判定收口；开发 Agent 按本节执行）：
1. **种定名**：资产锚定 **Fraxinus chinensis subsp. chinensis（白蜡树原亚种本尊）**——判据链维持（FRPS 独立种无种下等级 + FOC 两亚种口径 + subsp. rhynchophylla 北方原生不含长江流域 + 属级「白蜡树最常见于栽培」）；任务书「尖萼梣 var. acuminata / 大叶蜡树 var. rhynchophylla 为白蜡树种下等级」表述证伪记档（FRPS 口径：花曲柳为独立种；FOC 口径：降为亚种）；「白蜡」命源 = 白蜡虫产蜡（非叶背蜡感——叶背不做蜡白过度引申）
2. **树高锚**：生产域 8–12m（**志书「高10-12米」直给——罕见志书级体量锚**；幼-中龄下探），**slot-0 锚 ≈10m**（与 011.9 国槐同档；卵圆开展冠不宜取高端）
3. **花建模判定：不做**——无花冠（萼 1–3mm）+ 淡黄绿-褐绿 + 4–5 月与叶同放窗口短；决策链四树口径一致（栾金黄强信号做 / 国槐乳白弱不做 / 乌桕重阳木不做 / **白蜡无瓣最弱不做**）；身份四信号（对生芽序+羽叶对生+翅果帘幕+树皮）承托已足
4. **翅果建模判定：做**——匙形单翅果家族独有造型（vs 国槐念珠肉质/栾灯笼/乌桕绿闭果/悬铃木球果）+ 可见窗口极长（7–9 盛挂 + 宿存至翌年 2 月照片双源）+ 满冠帘幕显著（fruit-c 双问）+ 覆盖 9–10 月主语境；账目法零 rng 确定性（先例同法）
5. **翅果建模主域**：单果 3–4cm × 宽 4–6mm、匙形（上中部最宽、先端锐尖常犁头状）、翅下延至坚果中部（坚果 ≈1.5cm、翅约占全长 1/2）、簇 5–10cm 级每簇 10 枚级、色序嫩绿→黄绿-淡褐；**帘幕读向 = 果簇密度显著高于国槐念珠串**（满冠显著 vs 冠缘散点——挂点分布账目定档依据）
6. **树皮第 11 语言定稿**：**灰褐浅-中纵裂（无剥落无碎翘）+ 幼干-大枝近光滑 + 皮孔小不明显**——龄级序列幼干光滑浅灰褐带皮孔 → 中龄浅-中纵脊沟 → 老干渐深；分化点：vs 栾（全龄浅色光滑+密麻点醒目——白蜡皮孔小不明显且老树走向纵裂渐深）、vs 国槐（板状厚脊+瘤突——白蜡浅细脊沟）；**主干特写缺失如实记档**（多源中景合并 + FRPS 原句承托；族门 011.13 可横向对照复核）——材质侧按「浅色近光滑-浅细纵裂 + 不明显皮孔」实现
7. **冠幅比 0.7–1.0 维持**（form-a 双问「冠幅≈高或略大」落上段 + form-c 开展读向；弱 Inferred 如实）——卵圆-圆头开展冠（vs 国槐 0.9–1.2 最宽档——白蜡窄一档）；冠层空隙 25–40% 中通透（vs 国槐 10–20% 致密端——**两树通透度对照为族门密度横向定量提供第二对样本**）
8. **对生结构双级化**：复叶在枝上对生（属级 Verified）+ 小叶沿轴对生（照片级双问确认）+ 对生芽序（双问确认）——**三重对生为白蜡身份结构**；几何侧挂点语言对生化（vs 国槐黄金角互生螺旋——复叶系内同型不同排列的直接对照）；小叶 5–7 枚（2–3 对+顶生，vs 国槐 4–7 对——计数少而整齐）；缘整齐锐锯齿（vs 国槐全缘——复叶系缘齿对照轴：材质 SDF 载波回归〔011.3 榉齿载波先例〕）

**④ 通道记档（本轮实况）**：iplant 8 端点全链可达（本种现用名=志书名直接命中，无需异名 key 切换）；NC State 无 chinensis 条目（园艺轴降级——体量锚由志书直给承担）；调研轮 4.5V S3 直链判读约 28 次全程稳定（与 011.9 后期退化实况不同）；终审轮 Read→CDN 转存通道 10 判读零失败零退化；original 下载 16/16 PIL 全量解码零截断。
