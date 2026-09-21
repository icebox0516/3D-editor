# bischofia Reference Spec

Spec Version: 1.0
Domain: plant
Asset: tree_bischofia（重阳木）
Updated: 2026-09-21

> 关键事实统一写法（各节内联、逐条标注；Source 填来源表编号）：
> Form ∈ {Value, Range, Relative, Qualitative}；Evidence Status ∈ {Verified, Inferred, Unknown}。
> 工程预算（面数/LOD 阈值）不进本文件，归任务书。真实照片本地副本为 `screenshots/ref-tmp/` 下 ref-bischofia-*.jpg（不入 git、不进 Runtime）。
> 建模目标相 = **生长季（夏季绿叶相）**；秋色红/橙与冬态宿存果为身份标志但**仅记档不建模**（同 011.6/011.7 秋色纪律）；花（春 4–5 月总状）不属建模相。**夏季相果序可见性极低（幼果 2–3mm 亚厘米级、熟果 5–7mm 且熟期 10–11 月）——建模判定候选 = 不做，判定归任务书 Step 1**（§4 证据链）。

## 1. 身份

大戟科（Euphorbiaceae，FRPS/FOC 口径；APG IV 归叶下珠科 Phyllanthaceae——分类口径记档不影响生产）重阳木**落叶乔木**，各部无毛（FRPS「落叶乔木，高达15米，胸径50厘米，有时达1米……全株均无毛」[1]；FOC "Trees to 15 m tall, 50(-100) cm d.b.h., deciduous, glabrous throughout" [3]）。使用语境：**长江流域城市公园夏绿落叶乔木**，中龄典型单干个体，与夏栎 ≈8m、朴树 ≈8.5m、悬铃木 12–14m、栾树 ≈10m、乌桕 ≈9.5m 同语境混植（体量对照见 §2）。本资产是**家族复叶第二型（三出复叶）+ 伞形开展冠 + 褐色纵裂树皮**语言（vs 011.6 栾树二回羽状复叶首例——复叶卡路径的第二次实例化，异型对照轴）。

- **种定名与命名口径（重点问题，判定结论）**：生产身份 = **Bischofia polycarpa (H. Léveillé) Airy Shaw**（FRPS 44(1):187，1994 [1]；FOC Vol.11 [3]）——异名链 Celtis polycarpa H. Léveillé (1912)、Bischofia racemosa Cheng & C. D. Chu (1963) [1][3]。**与近缘种秋枫 B. javanica 的差分链（七轴，防混种——照片池判读与分布域双重约束）**：
  - 落叶（FRPS「落叶乔木」[1]；FOC "deciduous" [3]）↔ javanica 常绿大乔木高达 40m（FRPS「大乔木，高达40米……为热带和亚热带常绿季雨林中的主要树种」[4]；FOC "Trees to 40 m tall, to 2.3 m d.b.h., **evergreen**" [5]）——**照片实证：form-a（韶关 2025-03-22）三月近裸枝 + 迟发新叶 + 宿存去年果簇 [7]，javanica 三月应满冠常绿叶**
  - 小叶 5–9(–14) × 3–6(–9) cm ↔ javanica 7–15 × 4–8 cm（[1][3] vs [4][5]）
  - 叶缘钝细锯齿**每 1cm 长 4–5 个** ↔ javanica 浅锯齿每 1cm 2–3 个（[1][3] vs [4][5]）——中距照片亚像素不可辨，作近景档差分记档
  - 果径 5–7mm 成熟**褐红色** ↔ javanica 6–13mm 淡褐色（[1][3] vs [4][5]）
  - 果期 10–11 月 ↔ javanica 8–10 月（[1][3] vs [4]）
  - 树皮**褐色 厚 6mm 纵裂** ↔ javanica 灰褐至棕褐 厚约 1cm 近平滑（[1][3] vs [4][5]）
  - 花序**总状**下垂着生新枝下部 ↔ javanica **圆锥花序**腋生、雌花序 15–27cm（[1][3] vs [4]）
  - 分布域：polycarpa「秦岭、淮河流域以南至福建和广东的北部……**在长江中下游平原或农村四旁习见，常栽培为行道树**」[1]；javanica 主华南（海南/台湾/热带亚洲）[4]——**照片池剔除海南/香港观测（javanica 混淆风险），入库 15 张全部长江-华东-华中域**（§8）
  - Form: Value + Qualitative | Evidence Status: Verified | Source: [1][3][4][5][7]
- 俗名链：FRPS「重阳木（南京）乌杨（亨利氏中国植物名录），茄冬树（湖南），红桐（四川），水枧木（广西桂林）」[1]；「重阳木」名义重阳节（果熟期）关联——园艺通名
  - Form: Qualitative | Evidence Status: Verified | Source: [1]
- 分布：FRPS「产于秦岭、淮河流域以南至福建和广东的北部，生于海拔1 000米以下山地林中或平原栽培」[1]；FOC "Evergreen forests, often widely planted; 200-1000 m. Anhui, Fujian, N Guangdong, Guangxi, Guizhou, Hunan, **Jiangsu, Jiangxi**, Shaanxi, Yunnan, **Zhejiang**" [3]——**长江流域乡土种 + 行道树习见**（照片池江苏/上海/湖北/江西/安徽观测承托 [7]）
  - Form: Qualitative | Evidence Status: Verified | Source: [1][3][7]
- 用途：FRPS「木材……材质略重而坚韧……适于建筑、造船、车辆、家具等用材。果肉可酿酒。种子含油量30%」[1]；FOC Comment "fruits…production of distilled liquors; seeds yield 30% oil" [3]；**果为鸟类冬粮（f11 一月上海：鸟啄食宿存果串 [7]）**——园林语境常规乡土乔木
  - Form: Qualitative | Evidence Status: Verified（用途）/ Inferred（鸟食照片单源）| Source: [1][3][7]
- 物候总口径：**花期 4–5 月（春季与叶同时开放）、果期 10–11 月**（FRPS/FOC 一致 [1][3]）；**果宿存至冬-翌年早春**（f11 一月 [7]、form-a 三月下旬 [7] 双源）——**夏季（建模相）树上无熟果，仅幼果发育中**
  - Form: Range | Evidence Status: Verified（花果期）/ Inferred（宿存时长照片双源）| Source: [1][3][7]

## 2. 主要尺度

- 物种上限树高：**「落叶乔木，高达15米，胸径50厘米，有时达1米」（FRPS 原句）**[1]；FOC "Trees to 15 m tall, 50(-100) cm d.b.h." [3]——无园艺数值源（NC 无条目、wiki 三通道超时——检索备注记档）；photo form-a（韶关乡道开放生长成树）判 **7–9m** [7]
  - Form: Value | Evidence Status: Verified | Source: [1][3][7]
- **中龄公园个体（目标龄级锚，重点问题）**：form-a 成树 7–9m（参照物：乡道/电杆/民房，双问一致 [7]）+ FRPS 上限 15m + 速生行道树种（长江中下游习见 [1]）——**生产域 ≈8–12m 合理（与任务锚一致），slot-0 锚 ≈9.5–10m 主代理裁定（终审收口）**；中国公园修剪相样木缺失（结构缺口）
  - Form: Range | Evidence Status: Inferred | Source: [1][7]
- 冠幅：form-a 判**冠幅 ≈0.8–1.0× 树高**（Q1 冠幅≥高 / Q2 0.8–1.0 双问一致 [7]）+ FRPS「树冠伞形状，大枝斜展」[1]——**冠幅/树高 ≈0.8–1.0（开展等幅族）**
  - Form: Range | Evidence Status: Verified（伞形定性）/ Inferred（数值照片单树双问）| Source: [1][7]
- **叶（最高优先，Verified 原句——三出复叶结构组）**：**「三出复叶；叶柄长9-13.5厘米；顶生小叶通常较两侧的大，小叶片纸质，卵形或椭圆状卵形，有时长圆状卵形，长5-9（-14）厘米，宽3-6（-9）厘米，顶端突尖或短渐尖，基部圆或浅心形，边缘具钝细锯齿每1厘米长4-5个；顶生小叶柄长1.5-4（-6）厘米，侧生小叶柄长3-14毫米；托叶小，早落」（FRPS 原句）**[1]；FOC "Leaves palmately 3-foliolate; stipules small, caducous; petiole 9-13.5 cm; terminal petiolule 1.5-4(-6) cm, lateral petiolules 3-14 mm; terminal leaflets usually larger than bilateral ones; leaflet blades ovate or elliptic-ovate, sometimes oblong-ovate, 5-9(-14) × 3-6(-9) cm, papery, base rounded or shallowly cordate, apex acute or shortly acuminate, margins with 4 or 5 teeth per cm" [3]——**复叶建模域：三小叶掌状放射，顶生大（明显小叶柄）+ 两侧小（近无柄 3–14mm），小叶卵形/椭圆状卵形 5–9(–14) × 3–6(–9) cm、纸质、先端突尖-短渐尖、基部圆-浅心形、缘钝细齿 4–5/cm，总柄 9–13.5cm**
  - Form: Range | Evidence Status: Verified | Source: [1][3]
- 照片实测叶（交叉）：leaf-b（宁波七月夏叶，双问一致）判**顶生小叶 7–10 × 5–8cm**（域内中上端）、先端**尾状渐尖**（尾占叶长 1/5–1/4——「短渐尖」的大叶端读向）、基部**浅心形-圆形**、缘照片分辨率下全缘读向（钝细齿亚像素）、**顶生小叶柄 ≈1/3–1/2 小叶长**（≈2.5–5cm——FRPS 顶生小叶柄 1.5–4(–6)cm 域内 [7]）；leaf-a/f2/l6/f10/f8 多源一致「三出复叶 + 卵形小叶 + 渐尖先端」（[7]，叶组级一致；小叶计数读向见 §4 判读注记）
  - Form: Range | Evidence Status: Inferred（照片多源交叉）| Source: [7]
- **花序（重点问题）**：FRPS「花雌雄异株，春季与叶同时开放，组成**总状花序**；**花序通常着生于新枝的下部，花序轴纤细而下垂**；雄花序长8-13厘米；雌花序3-12厘米」[1]；FOC "Inflorescences pendent racemes, on lower parts of previous year branches, generally appearing in spring, male inflorescences 8-13 cm, female 3-12 cm" [3]；照片：canopy-a（赣州四月仰观冠层）判「**下垂串状绿粒序密集**」[7]、leaf-a（同 obs 近景）判「下垂总状 + 密生绿色小球粒」[7]——**花序建模域 3–13cm 总状下垂、绿色-黄绿、着生新枝下部；花期 4–5 月与叶同放（非建模相）**
  - Form: Range + Qualitative | Evidence Status: Verified | Source: [1][3][7]
- **果（重点问题，Verified 原句）**：**「果实浆果状，圆球形，直径5-7毫米，成熟时褐红色」（FRPS 原句）**[1]；FOC "Fruits globose, 5-7 mm in diam., brown-red when mature. Fl. Apr-May, fr. Oct-Nov" [3]；照片实测：fruit-a（武汉 10-24，双问一致）判**总状串 5–10 粒/串、单果 3–6mm、黄褐-枯黄（部分偏绿成熟度不一）、果轴下垂** [7]；fruit-b（上海 11-19，双问一致）判**串 10–30+ 粒、单果 4–6mm、红褐-紫褐** [7]；fruit-c（武汉 10-01）判**3–5mm 干缩紫黑串珠垂挂 + 红褐细枝光滑** [7]；winter-fruit（上海 01-14）判**暗红-黑褐皱缩浆果成串宿存 + 鸟啄食** [7]；form-a（03-22）判**枝端深色小果簇宿存** [7]——**果域：球形浆果 5–7mm（照片 3–6mm 为未熟/干缩端）、绿→黄褐→红褐-紫褐、总状串下垂、熟期 10–11 月、宿存至翌年 3 月**
  - Form: Value + Range + Qualitative | Evidence Status: Verified（文献）/ Inferred（照片色序）| Source: [1][3][7]
- 树皮尺度：FRPS「树皮**褐色，厚6毫米，纵裂**」[1]（Verified 原句——厚度 6mm 为志书罕见显式数值，vs javanica 厚约 1cm 近平滑 [4]）；bark-a（安庆 73 年生，obs 描述原文「树龄：73年」[7]）判主干深灰褐-暗褐**深纵裂、脊宽沟深、裂纹扭曲交错** [7]；bark-b（南京中龄）判**深灰褐纵浅裂窄脊** [7]——8–12m 中龄公园个体干径 ≈25–45cm（推断，无标尺样木）
  - Form: Value + Qualitative | Evidence Status: Verified（色泽厚度文献）/ Inferred（照片）| Source: [1][4][7]
- 生长速率：无直接文献句（FRPS 无速率句；NC/wiki 未获）；行道树习见 + 15m 上限——**速生-中速推断**（弱，不承重）
  - Form: Qualitative | Evidence Status: Unknown | Source: [1]

## 3. 轮廓与比例

- **冠形（重点问题）**：**伞形状-开展圆头（spreading umbrella-rounded）**——FRPS「**树冠伞形状，大枝斜展**」[1]（Verified 原句）；form-a（成树三月相）判「开展不规则圆头-近伞形、顶部略平缓、边缘起伏、横向舒展感强」[7]；young-a（南京九月幼树）判「**冠幅≥高的开展圆头**」[7]——**建模主相 = 单干伞形-开展圆头（顶部圆缓、下缘大枝近水平展出）**（vs 栾树开展圆头-伞形同族、vs 夏栎圆穹致密、vs 乌桕开展圆头——冠形族内最近栾树/乌桕，分化在叶语言与树皮）
  - Form: Qualitative | Evidence Status: Verified（伞形文献）/ Inferred（照片双源）| Source: [1][7]
- 冠幅/树高比：**≈0.8–1.0**（form-a 双问 [7]；幼树 young-a ≥1.0 [7]——幼龄更开张）
  - Form: Range | Evidence Status: Inferred | Source: [7]
- 主干分枝点高度占比：form-a 判**干高 1/4–1/3（约 2–3m 分出大枝）**（双问一致 [7]）——**trunk_height_ratio ≈0.25–0.33**；公园修剪相枝下高或更高（Unknown，方向记档）
  - Form: Range | Evidence Status: Inferred（单树双问）| Source: [7]
- 主干姿态：单干典型；form-a 判「主干较通直，局部倾斜弯曲个体」（双株中右侧一株倾斜 [7]）——直-微弯域
  - Form: Qualitative | Evidence Status: Inferred | Source: [7]
- **叶幕质感（重点问题：三出复叶大叶中细质）**：**中等-粗大叶片、纸质、冠面中细质**——小叶 5–14cm 长的复叶展开读向 ≈ 单叶 10–20cm 级大叶观感（顶+侧三叶展幅 = 总柄 9–13.5cm + 小叶纵向——**单枚复叶整体展幅 ≈20–30cm 级**，计算自 [1][3] 数值）；photo form-a 判「疏松通透、枝结构清晰」[7]、young-a 判「中密」[7]——**中距读向 = 中绿大叶层叠 + 疏松开展冠缘**（vs 悬铃木大叶粗质同量级、vs 栾树大羽叶层叠、vs 朴/樟细碎密簇）
  - Form: Relative + Qualitative | Evidence Status: Inferred（计算 + 照片）| Source: [1][3][7]
- 冠层通透度：form-a（三月近裸枝判枝结构）**生长季叶幕密度 Unknown**；幼树 young-a/young-b 判中密 [7]；canopy-b（武夷山十月仰观）判中密带果 [7]——**推断中-疏通透（开展冠 + 大叶层叠）**
  - Form: Relative | Evidence Status: Inferred | Source: [7]
- 冠层密度梯度：Unknown（无冠内仰观生长季样张）

## 4. 结构层级

部件树：主干（单干典型）→ 骨架枝（斜展-近水平两段姿）→ 二级枝 → 末级枝（**互生三出复叶散布**）→ 新枝下部总状花序（春，雌雄异株）→ 浆果序（秋熟、宿存至冬春）。

- **叶着生语言（核心挂点）**：**三出复叶、散生于枝**——FRPS/FOC 种级无显式叶序句（「三出复叶」「palmately 3-foliolate」[1][3]），leaf-d（五月）判「**互生**（叶痕位判断，不完全确定）」[7] 弱单源 + 大戟科/叶下珠科互生通则——**互生 Inferred**；非簇生、非短枝簇——**挂点单位 = 1 枚具长总柄三出复叶**（vs 栾树大羽叶互生平展疏簇——复叶卡路径先例；vs 乌桕菱形单叶散布）
  - Form: Qualitative | Evidence Status: Inferred（互生单源弱）/ Verified（三出复叶结构）| Source: [1][3][7]
- **三出复叶结构组（重点问题——几何/材质表达核心）**：**顶生小叶大 + 两侧小叶小、三叶从总柄顶端同点放射（掌状三出）**；顶生小叶柄 1.5–4(–6)cm（明显）、侧生小叶柄 3–14mm（**近无柄**）[1][3]；**中远距读向关键：三小叶展幅构成一枚「宽卵形大叶」剪影，唯近景可辨三裂结构**（l1 Q2 判「3 枚从同一点放射」[7]；f3 近景判「单枚掌状脉宽卵大叶」读向 [7]——**同一结构两种距离读向，中距 = 大叶剪影**）；**判读注记（如实记档）：leaf-a（四月赣州）Q1 判「三小叶结构非常清楚」、Q2 判「奇数羽状 5–7 枚+白蜡树属」——双问不一致，小叶计数读向不稳定（相邻两组复叶沿枝重叠读作羽状的伪读可能；javanica 3(–5) 端亦排除——分布域内），该照片不承重定名；三出结构锚 = FRPS/FOC 文献 Verified + l1/l6/f2/f10/f8 多数一致辅证 [7]**
  - Form: Qualitative | Evidence Status: Verified（结构文献）/ Inferred（计数读向稳定性）| Source: [1][3][7]
- 花序着生与姿态：**总状花序着生新枝（上年枝）下部、花序轴纤细下垂**（FRPS [1]；FOC "pendent racemes, on lower parts of previous year branches" [3]）；雌雄异株（[1][3]）——单株仅一性花序；花小无瓣、萼片膜质绿-黄绿（[1][3] + 照片绿粒读向 [7]）——**春相信号（4–5 月与叶同放），非建模相，记档**
  - Form: Qualitative | Evidence Status: Verified | Source: [1][3][7]
- **果序姿态与账目（重点问题——建模判定证据链）**：果沿总状轴排列、**果轴下垂**（fruit-a 双问「下垂-平伸细轴」[7]；fruit-b「细长下垂果轴、串 10–30+ 粒」[7]；fruit-c「串珠状垂挂、错落交叉」[7]）；**熟期 10–11 月**（[1][3]）；**宿存链：10-01 fruit-c 干缩紫黑在树 → 11-19 fruit-b 红褐紫褐满串 → 01-14 winter-fruit 暗红黑褐皱缩 + 鸟食 → 03-22 form-a 枝端深色果簇**[7]——**夏季（建模相 6–8 月）状态：雌花 4–5 月谢后幼果发育中，幼果 ≈2–3mm 绿粒（果径 5–7mm 为熟期域 [1]）、总状轴细弱贴叶层——可见性极低（亚厘米级绿粒 vs 20–30cm 级大叶幕），显著性弱于乌桕绿闭蒴果（1–1.5cm）**——**判定候选：夏相果序不做（记档）；秋冬红果串相（身份标志）不属建模相**
  - Form: Qualitative + Range | Evidence Status: Verified（熟期宿存链多源）/ Inferred（夏季幼果尺度推算）| Source: [1][3][7]
- 分枝角与枝姿（重点问题）：FRPS「大枝**斜展**」[1]（Verified）；form-a 判「中下部大枝**近水平或略下垂**、中上部大枝**斜上**；大枝粗壮（径 ≈1/3–1/2 主干）、虬曲」[7]——**两段枝姿：下部骨架枝近水平开展（70–90°）+ 上部骨架枝斜上（40–60°）+ 端部小枝斜上收口**（「斜展」文献域的开展端读向）
  - Form: Qualitative + Range | Evidence Status: Verified（斜展文献）/ Inferred（角度数值照片）| Source: [1][7]
- 小枝：**当年生枝绿色、皮孔明显灰白色；老枝变褐色、皮孔变锈褐色**（FRPS 原句 [1]；FOC "branchlets green, lenticels gray-white; older branches brown, lenticels rusty" [3]）——**绿色小枝 + 皮孔色序是近景身份点**（与乌桕亮绿小枝同科平行特征）；全株无毛 [1]
  - Form: Qualitative | Evidence Status: Verified | Source: [1][3]
- 芽：**FRPS「芽小，顶端稍尖或钝，具有少数芽鳞」**[1]（Verified——较乌桕/栾树 Unknown 缺口为优）；毫米级近景档
  - Form: Qualitative | Evidence Status: Verified | Source: [1]
- 分枝层级数：3–4 级可见（form-a 三月相枝结构清晰 [7]，弱单源）
  - Form: Value | Evidence Status: Inferred | Source: [7]

## 5. 材质与表面

- **树皮（重点问题，九树皮语言定位）**：**褐色纵裂族：深沟宽脊 + 扭转 + 老树局部网状**——文献：FRPS「**树皮褐色，厚6毫米，纵裂**」[1]（Verified 原句）；FOC "bark brown, ca. 6 mm thick, longitudinally fissured" [3]；照片交叉：bark-a（安庆 73 年生，双问一致）判「**深灰褐-暗褐基色、纵向长条深裂、脊宽沟深、裂纹扭曲交错/主干扭转感、无剥落**、细枝深褐较光滑」[7]；bark-b（南京中龄）判「深灰褐、纵浅裂、窄脊」[7]；fruit-c 判「红褐-灰褐细枝较光滑、线状质感 + 皮孔状小点」[7]——**合并口径：中龄主干褐色-深灰褐纵裂（沟深中-深、脊宽）+ 裂纹局部扭转交织；无剥落、无翘皮、无地图状三色带；细枝红褐-灰褐光滑带皮孔；老树（73 年）深裂宽脊 + 强扭转**
  - **九资产树皮语言分化定位**：夏栎/樟 深纵裂脊沟族 ｜ 朴 平滑-浅裂小斑 ｜ 榉 光滑+暖色薄片剥落 ｜ 银杏 灰褐纵裂 ｜ 悬铃木 光滑大片地图剥落三色带 ｜ 栾 浅色光滑+皮孔麻点 ｜ 乌桕 暗灰窄裂+碎翘 ｜ **重阳木 褐色-深灰褐纵裂深沟宽脊+扭转**——分化点：①基色褐（vs 乌桕暗灰、栾浅灰、银杏灰白——**家族最褐端与樟争位，樟黄褐不规则 vs 重阳木深褐规则纵裂**）；②沟深脊宽（vs 银杏浅纵裂、夏栎窄脊）；③裂纹扭转/局部网状（vs 夏栎顺直脊沟）——「褐纵裂深沟宽脊扭转」语言在家族中独立
  - Form: Qualitative | Evidence Status: Verified（FRPS/FOC 双源 + 厚度数值）/ Inferred（照片侧）| Source: [1][3][7]
- **叶色（重点问题：两面色差 + 新叶色）**：文献无种级叶色句（FRPS/FOC 均无 [1][3]）；照片：leaf-b（七月夏叶）判正面**中绿-深绿、纸质稍光泽**[7]；f2（四月嫩梢）判幼叶**黄绿带红调**[7]；leaf-d（五月）判嫩叶**红褐-古铜色 + 总叶柄红紫**[7]——**正叶中绿-深绿（Inferred 照片单源）；新叶红褐-古铜 flush（照片双源 [7]，重阳木知名春相——园艺红相文献未获 wiki 超时记档）**；两面色差 Unknown（无背面清晰样张——结构缺口）
  - Form: Qualitative | Evidence Status: Inferred | Source: [7]
- 花色材质：**绿色-黄绿**（萼片膜质、无瓣 [1][3]；照片「绿色小球粒」[7]）——春相弱信号，非建模相
  - Form: Qualitative | Evidence Status: Verified（结构）/ Inferred（色照片）| Source: [1][3][7]
- **果色序（重点问题）**：**绿（幼）→ 黄褐-枯黄（10 月未熟端）→ 红褐-紫褐（11 月熟）→ 暗红黑褐皱缩（冬宿存）**——FRPS「成熟时**褐红色**」[1] Verified + fruit-a/b/c/winter-fruit 四点照片色序 [7]；**秋冬相红果串 = 强身份标志（非建模相）**
  - Form: Qualitative | Evidence Status: Verified（熟色文献）/ Inferred（色序照片）| Source: [1][7]
- **秋色（记档不建模）**：**黄绿→黄主导 + 少量橙红**——fruit-b（上海 11-19，双问）判「绿 40–50% / 黄 40–50% / 橙红 <10%、变色叶淡黄绿→黄、个别橙褐」[7]；园艺「秋叶红艳」口径未获文献锚（wiki 超时）——**照片轴 = 黄主导带橙红点缀；沪上 11 月中旬为变色中段**（弱单源 + 未锚园艺红相，不深究——记档不建模）
  - Form: Qualitative | Evidence Status: Inferred | Source: [7]
- 冠层色域（生长季主相）：中绿-深绿大叶层叠 + 零星红褐新梢（春末夏初）+ 褐色纵裂干 + 绿色小枝皮孔——三层信号；**最强身份信号（秋冬红果串/红秋色）均不在建模相**
  - Form: Qualitative | Evidence Status: Inferred | Source: [7]

## 6. 变体范围

- **小叶形轴（重点问题）**：卵形（FRPS 首列 [1]）↔ 椭圆状卵形 ↔ 长圆状卵形（三型 [1][3]）——**卵形-椭圆状卵形主相（中庸域）、长圆状卵形端入变体档**；先端突尖-短渐尖（大叶端尾状读向 [7]）、基部圆-浅心形恒定
  - Form: Qualitative | Evidence Status: Verified（三型文献）| Source: [1][3][7]
- 小叶尺度幅度：5–9(–14) × 3–6(–9) cm（[1][3] 全域）↔ 照片中上端 7–10 × 5–8 [7]——大叶个体与冠层受光位偏大（弱推断）
  - Form: Range | Evidence Status: Verified（域）| Source: [1][3][7]
- 树皮龄级轴：细枝红褐光滑皮孔 ↔ 中龄深灰褐纵浅裂窄脊 ↔ 老树（73 年）深纵裂宽脊强扭转（§5）——**龄级反差大，建模定中龄档**
  - Form: Qualitative | Evidence Status: Verified（端点文献）/ Inferred（中间档照片）| Source: [1][3][7]
- 果序宿存时长变体：熟期 10–11 → 宿存 1 月（winter-fruit [7]）→ 3 月（form-a [7]）——个体/地域变幅 Unknown
  - Form: Qualitative | Evidence Status: Inferred | Source: [7]
- 单干 ↔ 倾斜/微弯干变体：form-a 双株一直一斜 [7]——频率 Unknown
  - Form: Qualitative | Evidence Status: Inferred | Source: [7]
- 幼树开张度：young-a 冠幅≥高（幼龄更开张 [7]）↔ 成树 0.8–1.0——龄级开张梯度
  - Form: Range | Evidence Status: Inferred | Source: [7]
- 新叶红褐 flush 强度变体（f2 黄绿红调 vs leaf-d 红褐古铜——强度不一 [7]）
  - Form: Qualitative | Evidence Status: Inferred | Source: [7]

## 7. 远近景保留优先级

（写到视觉显著性为止；面数/切换距离等工程映射归任务书）

- 远距（>50m）：**伞形-开展圆头轮廓（冠幅比 0.8–1.0）+ 中绿叶幕**可辨认；复叶结构、果序均不可辨
- 中距（10–50m，本项目主语境）：**三出复叶大叶剪影（单复叶展幅 20–30cm 级「宽卵大叶」中细质）+ 开展两段枝姿（下水平-上斜上）+ 褐色纵裂干 + 疏松冠缘**；花（春绿穗）与果（秋冬红串）不属建模相
- 近距（数米）：**复叶全结构（三小叶掌状放射、顶大侧小、顶生小叶柄 1.5–4(–6)cm / 侧生 3–14mm 近无柄、小叶卵形-椭圆状卵形 5–9(–14)×3–6(–9)cm、纸质、先端突尖-短渐尖、基部圆-浅心形、缘钝细齿 4–5/cm、总柄 9–13.5cm）+ 树皮（褐-深灰褐纵裂深沟宽脊、裂纹扭转、细枝红褐光滑皮孔）+ 当年生绿色小枝 + 芽（小、稍尖或钝、少数芽鳞）**依次进入可辨域
- 牺牲顺序（远→近）：托叶（早落）→ 芽与皮孔细节（毫米级）→ 钝细锯齿（亚像素）→ 小叶柄长度差 → 顶/侧小叶大小差 → **三出复叶「宽卵大叶」剪影 + 伞形开展轮廓 + 褐纵裂干（最后保留）**

## 8. 来源证据

| # | 来源 | 类型 | URL/文献 | 检索日期 | 提取内容 |
|---|------|------|----------|----------|----------|
| 1 | 《中国植物志》第 44(1) 卷 (1994) p.187 重阳木 Bischofia polycarpa 种级（iplant 数据端点全文） | 植物学文献 | 数据端点 getfrps.ashx?key=Bischofia polycarpa（frpslink 锚「第44(1)卷 (1994) >> 187页」确认） | 2026-09-21 | **重阳木（南京）乌杨（亨利氏中国植物名录），茄冬树（湖南），红桐（四川），水枧木（广西桂林）图版56: 1**；Bischofia polycarpa (Levl.) Airy Shaw；异名 Celtis polycarpa Lévl. / Bischofia racemoca Cheng et C. D. Chu。**落叶乔木，高达15米，胸径50厘米，有时达1米；树皮褐色，厚6毫米，纵裂；树冠伞形状，大枝斜展，小枝无毛，当年生枝绿色，皮孔明显，灰白色，老枝变褐色，皮孔变锈褐色；芽小，顶端稍尖或钝，具有少数芽鳞；全株均无毛。三出复叶；叶柄长9-13.5厘米；顶生小叶通常较两侧的大，小叶片纸质，卵形或椭圆状卵形，有时长圆状卵形，长5-9（-14）厘米，宽3-6（-9）厘米，顶端突尖或短渐尖，基部圆或浅心形，边缘具钝细锯齿每1厘米长4-5个；顶生小叶柄长1.5-4（-6）厘米，侧生小叶柄长3-14毫米；托叶小，早落。花雌雄异株，春季与叶同时开放，组成总状花序；花序通常着生于新枝的下部，花序轴纤细而下垂；雄花序长8-13厘米；雌花序3-12厘米**……**果实浆果状，圆球形，直径5-7毫米，成熟时褐红色。花期4-5月，果期10-11月。产于秦岭、淮河流域以南至福建和广东的北部，生于海拔1 000米以下山地林中或平原栽培，在长江中下游平原或农村四旁习见，常栽培为行道树**。模式标本采自贵州安顺。木材（心材鲜红色至暗红褐色——记档不可见）建筑造船车辆家具；果肉可酿酒；种子含油量30% |
| 2 | Flora of China Vol.11 重阳木 Bischofia polycarpa 种级（iplant 数据端点全文） | 植物学文献 | 数据端点 getfoc.ashx?key=Bischofia polycarpa | 2026-09-21 | 2. **Bischofia polycarpa** (H. Léveillé) Airy Shaw；Synonym: Celtis polycarpa H. Léveillé; Bischofia racemosa Cheng & C. D. Chu。**Trees to 15 m tall, 50(-100) cm d.b.h., deciduous, glabrous throughout; bark brown, ca. 6 mm thick, longitudinally fissured; older branches brown, lenticels rusty; branchlets green, lenticels gray-white. Leaves palmately 3-foliolate; stipules small, caducous; petiole 9-13.5 cm; terminal petiolule 1.5-4(-6) cm, lateral petiolules 3-14 mm; terminal leaflets usually larger than bilateral ones; leaflet blades ovate or elliptic-ovate, sometimes oblong-ovate, 5-9(-14) × 3-6(-9) cm, papery, base rounded or shallowly cordate, apex acute or shortly acuminate, margins with 4 or 5 teeth per cm. Plants dioecious. Inflorescences pendent racemes, on lower parts of previous year branches, generally appearing in spring, male inflorescences 8-13 cm, female 3-12 cm. Fruits globose, 5-7 mm in diam., brown-red when mature. Fl. Apr-May, fr. Oct-Nov.** Evergreen forests, often widely planted; 200-1000 m. Anhui, Fujian, N Guangdong, Guangxi, Guizhou, Hunan, Jiangsu, Jiangxi, Shaanxi, Yunnan, Zhejiang |
| 3 | 《中国植物志》第 44(1) 卷 秋枫 Bischofia javanica 种级（差分轴专用，iplant 数据端点全文） | 植物学文献 | 数据端点 getfrps.ashx?key=Bischofia javanica | 2026-09-21 | 秋枫（桂海虞衡志）万年青树/赤木/茄冬、加冬（福建、台湾）等。**大乔木，高达40米，胸径可达2.3米；树干圆满通直，但分枝低，主干较短；树皮灰褐色至棕褐色，厚约1厘米，近平滑，老树皮粗糙**……**三出复叶，稀5小叶，总叶柄长8-20厘米；小叶片纸质，卵形、椭圆形、倒卵形或椭圆状卵形，长7-15厘米，宽4-8厘米，顶端急尖或短尾状渐尖，基部宽楔形至钝，边缘有浅锯齿，每1厘米长有2-3个**……**花小，雌雄异株，多朵组成腋生的圆锥花序……雌花序长15-27厘米，下垂**……**果实浆果状，圆球形或近圆球形，直径6-13毫米，淡褐色……花期4-5月，果期8-10月**。常生于海拔800米以下山地潮湿沟谷林中或平原栽培，尤以河边堤岸或行道树为多。**为热带和亚热带常绿季雨林中的主要树种** |
| 4 | Flora of China Vol.11 秋枫 Bischofia javanica 种级（差分轴专用，iplant 数据端点全文） | 植物学文献 | 数据端点 getfoc.ashx?key=Bischofia javanica | 2026-09-21 | **Trees to 40 m tall, to 2.3 m d.b.h., evergreen**; stem straight, branching lower; **bark gray-brown to brown, ca. 1 cm thick, with red latex**; branchlets glabrous. **Leaves palmately 3(-5)-foliolate**; petiole 8-20 cm; terminal petiolule 2-5 cm, lateral petiolules 5-20 mm; **leaflet blades ovate, elliptic, obovate, or elliptic-ovate, 7-15 × 4-8 cm, papery……margins with 2 or 3 teeth per cm**……Inflorescences panicles（圆锥花序）……fr. Aug-Oct（差分轴：evergreen / 3(-5)-foliolate / 7-15cm / 2-3 齿/cm / 果 6-13mm 淡褐——**全部与 polycarpa 对应轴反向**） |
| 5 | iNaturalist research-grade 真实照片（CC BY/CC BY-NC 等，直接视觉证据；判读架构：mcp__4_5v_mcp__analyze_image（GLM-4.5V）直链喂图、中性提问不含树种名、**单帧单调用排队**（011.6/011.7 纪律）；承重照片双问定名（008.6 返修规程：两次独立中性提问一致方定名——**5 张承重 × 2 问全部一致**，见各节内联；1 张双问不一致处置记档见 §4/检索备注） | 真实照片 | iNat taxon Bischofia polycarpa 池 106 obs（inat-bp-all.json + inat-bp-p2.json），**剔除海南/香港观测（javanica 混淆风险）后筛读**。照片页 https://www.inaturalist.org/photos/<id>（原图域随 API 记录：s3 open-data 或 static.inaturalist.org——**m3/b1 为 static 域，S3 猜测 URL 400 教训见检索备注**）：**form-a**=478599246（obs 266374348，2025-03-22 广东韶关新丰乡道成树**双问✓**：7–9m 开展圆头-伞形、干高 1/4–1/3、大枝近水平-上斜两段、虬曲粗壮、三月近裸枝+迟发新叶+枝端宿存果簇+灰褐深裂干，static 域）；**bark-a**=655889567（obs 359484109，2026-04-19 安庆，**obs 描述原文「重阳木 树龄：73年」**，**双问✓**：深灰褐-暗褐纵长深裂、脊宽沟深、裂纹扭曲交错、无剥落、细枝深褐光滑，static 域）；**bark-b**=574599702（obs 317956778，2025-10-01 南京江宁锦山园：深灰褐纵浅裂窄脊）；**leaf-a**=264929697（obs 153393860，2023-04-04 赣州：四月三出复叶+下垂总状绿粒串——**双问不一致处置见 §4**）；**canopy-a**=264929684（同 obs：冠层仰观下垂串状花序密集）；**leaf-b**=531226508（obs 295102212，2025-07-04 宁波**七月夏叶双问✓**：三叶同点放射、顶生 7–10×5–8cm 尾状渐尖、浅心基、全缘读向、顶生小叶柄 1/3–1/2 小叶长）；**leaf-c**=490084476（obs 272405588，2025-04-22 赣州：春季嫩梢三出+幼叶黄绿红调）；**leaf-d**=316668075（obs 181754912，2023-05-02 江西萍乡：**嫩叶红褐-古铜 + 总柄红紫**、小叶 3–5 混读、互生弱读向）；**fruit-a**=588346705（obs 324996017，2025-10-24 武汉武昌**双问✓**：总状串 5–10 粒、果 3–6mm 黄褐-枯黄部分偏绿、果轴下垂-平伸、着生枝中部叶腋）；**fruit-b**=652754790（obs 357861809，2022-11-19 上海世纪公园**双问✓**：串 10–30+ 粒、果 4–6mm 红褐-紫褐、秋叶绿 40–50%/黄 40–50%/橙红 <10%、细枝灰褐-红褐光滑）；**fruit-c**=397988798（obs 224547436，2018-10-01 武汉洪山：干缩紫黑果 3–5mm 串珠垂挂、红褐细枝光滑皮孔点）；**winter-fruit**=607846689（obs 334688629，2026-01-14 上海：**一月宿存暗红-黑褐皱缩浆果成串 + 鸟啄食**、细长小枝横展微下垂）；**young-a**=565668683（obs 313250789，2025-09-12 南京雨花台：幼树开展圆头冠幅≥高、三出复叶阔卵、绿相）；**young-b**=585572324（obs 323606499，2025-10-25 武汉大学珞珈山：**十月末幼树全绿**、三出复叶清晰、细总状绿串）；**canopy-b**=535616559（obs 297410851，2015-10-12 福建武夷山：十月仰观冠层+果） | 2026-09-21 | 判读结论已内联 §2–§6（各照片承重/辅证身份随行标注） |

## 域扩展节：plant

（字段定义见 `.zcode/skills/asset-research/references/plant-schema.md` v0.2）

### A. 干与枝

- `trunk_height_ratio`：**0.25–0.33**（form-a 干高 1/4–1/3 双问 [7]）；公园修剪相 Unknown
  - Form: Range | Evidence Status: Inferred | Source: [7]
- `trunk_taper_ratio`：Unknown
  - Form: Unknown | Evidence Status: Unknown
- `basal_flare_ratio`：Unknown（无基部样张承重）
  - Form: Unknown | Evidence Status: Unknown
- `trunk_lean_angle`：直-微弯域（form-a 双株一直一斜 [7]）——典型直立，倾个体变体档
  - Form: Qualitative | Evidence Status: Inferred | Source: [7]
- `branching_levels`：3–4 级可见（form-a 三月相 [7] 弱单源）
  - Form: Value | Evidence Status: Inferred | Source: [7]
- `scaffold_branch_count`：Unknown（form-a 判 3–5 主枝量级不承重）
  - Form: Unknown | Evidence Status: Unknown | Source: [7]
- `scaffold_angle`：**两段姿——中下部近水平开展（70–90°）+ 中上部斜上（40–60°）**（FRPS「大枝斜展」Verified 定性 [1] + form-a 双问数值带 [7]）
  - Form: Range | Evidence Status: Verified（定性）/ Inferred（数值）| Source: [1][7]
- `branch_orientation`：大枝虬曲（form-a [7]）；端部小枝斜上收口（winter-fruit 细枝横展微下垂 [7] 冠缘读向）
  - Form: Qualitative | Evidence Status: Inferred | Source: [7]
- `branch_length_decay` / `branch_radius_decay` / `branch_attachment_t` / `allometry_exponent`：Unknown（与先例同缺口，不伪造）
  - Form: Unknown | Evidence Status: Unknown
- `apical_dominance`：**弱**（伞形开展冠、无强单领导枝——FRPS 伞形 [1] + form-a [7]）
  - Form: Qualitative | Evidence Status: Verified（伞形定性）/ Inferred（强度）| Source: [1][7]
- `branch_curvature`：**大枝虬曲 + 两段姿（下水平-上斜上）**——非下垂枝型；冠缘细枝微垂读向（winter-fruit [7]）
  - Form: Qualitative | Evidence Status: Inferred | Source: [7]

### B. 叶与冠

- `leaf_attachment_rule`：**三出复叶互生散生**（互生 = 照片弱单源 + 科通则 Inferred [7]；三出 = Verified [1][3]）；非簇生
  - Form: Qualitative | Evidence Status: Verified（三出）/ Inferred（互生）| Source: [1][3][7]
- `leaf_cluster_density`：1 复叶/挂点散布语言；密度以复叶展幅（20–30cm 级）+ 冠通透共同表达
  - Form: Value | Evidence Status: Inferred | Source: [1][3][7]
- `clump_scale`：复叶级中结构单元（总柄 9–13.5 + 小叶 5–14cm——展幅 20–30cm 级）；最大离散信号 = 果序串（至 10–30 粒 × 5–7mm）
  - Form: Relative | Evidence Status: Verified（部件尺度）| Source: [1][3]
- `leaf_orientation_dist`：**长总柄复叶多向摊开、层叠中细质**（总柄 9–13.5cm ≈ 0.7–1.5× 小叶长——摆动自由度大；photo 层叠读向 [7]）
  - Form: Qualitative | Evidence Status: Inferred | Source: [1][3][7]
- `leaf_size`：小叶 5–9(–14) × 3–6(–9) cm + 总柄 9–13.5cm（[1][3] + 照片 7–10×5–8 [7]）
  - Form: Range | Evidence Status: Verified | Source: [1][3][7]
- `leaf_aspect_ratio`：小叶长/宽 ≈**1.3–1.7**（卵形-椭圆状卵形中庸域，计算自 [1][3] 尺寸域；长圆状卵形端 ~1.8）
  - Form: Range | Evidence Status: Verified（域）/ Inferred（比值）| Source: [1][3]
- `crown_transparency`：中-疏（推断——开展冠 + 大叶层叠 + form-a 疏松/幼树中密 [7]；生长季成树冠内样张缺失）
  - Form: Relative | Evidence Status: Inferred | Source: [7]
- `crown_fill_gradient`：Unknown（无冠内仰观生长季样张）
  - Form: Unknown | Evidence Status: Unknown
- **三出复叶形态组（schema 无专字段——挂本组记档，复叶第二型核心）**：三小叶掌状放射；顶生小叶大（柄 1.5–4(–6)cm）+ 侧生小叶小（近无柄 3–14mm）；小叶卵形/椭圆状卵形/长圆状卵形、先端突尖-短渐尖、基部圆-浅心形、缘钝细齿 4–5/cm、纸质；**中远距 = 宽卵大叶剪影（三裂结构近景可辨）**——表达路径判定归任务书 Step 1
  - Form: Qualitative + Range | Evidence Status: Verified | Source: [1][3][7]
- **总状花序形态组（挂点附属物一，非建模相记档）**：下垂总状 3–13cm、着生新枝下部、绿-黄绿无瓣、雌雄异株、4–5 月与叶同放
  - Form: Range + Qualitative | Evidence Status: Verified | Source: [1][3][7]
- **浆果序形态组（挂点附属物二，建模判定候选 = 不做）**：球形浆果 5–7mm、绿→黄褐→红褐-紫褐、总状串下垂 5–30+ 粒、熟期 10–11、宿存至翌年 3 月（鸟粮）；**夏相幼果 2–3mm 亚厘米级、显著性极低**——判定归任务书 Step 1
  - Form: Range + Qualitative | Evidence Status: Verified（尺度色序）/ Inferred（夏相显著性）| Source: [1][3][7]

### C. 表皮与芽

- `bark_archetype`：**褐色纵裂深沟宽脊 + 扭转族（无剥落）**——龄级序列：细枝红褐光滑皮孔 → 中龄深灰褐纵浅裂窄脊 → 老树（73 年）深纵裂宽脊强扭转/局部网状（[1][3][7]）；九资产定位见 §5
  - Form: Qualitative | Evidence Status: Verified | Source: [1][3][7]
- `bark_color`：**褐色**（FRPS [1] / FOC "brown" [3] Verified）→ 照片深灰褐-暗褐读向 [7]；细枝红褐-灰褐；**vs javanica 灰褐-棕褐近平滑** [3 差分]
  - Form: Qualitative | Evidence Status: Verified | Source: [1][3][7]
- `bark_relief`：**中-深**（沟深中-深、脊宽；vs 栾/朴浅、夏栎/樟深——偏深端但厚仅 6mm [1]）
  - Form: Relative | Evidence Status: Verified（厚度）/ Inferred（深浅档）| Source: [1][3][7]
- `bark_epiphytes`：Unknown（无地衣样张记录）
  - Form: Unknown | Evidence Status: Unknown
- `twig_surface`：**当年生枝绿色、皮孔灰白 → 老枝褐色、皮孔锈色**（FRPS/FOC 原句 [1][3] Verified）——**绿色小枝近景身份点**；细枝光滑带皮孔（fruit-c [7]）
  - Form: Qualitative | Evidence Status: Verified | Source: [1][3][7]
- `bud_aspect`：**芽小、顶端稍尖或钝、少数芽鳞**（FRPS 原句 [1] Verified——较前两例 Unknown 为优）
  - Form: Qualitative | Evidence Status: Verified | Source: [1]

## 检索与证据备注

- 网络可达性（2026-09-21 本机）：iplant.cn 数据端点 FRPS polycarpa/javanica + FOC polycarpa/javanica 四端点全文可达（缓存 JSON + 终审独立重拉双口径）；**FRPS/FOC 属级端点（key=Bischofia / 重阳木属）双通道 404**——叶序互生无属级文献锚，按照片弱单源 + 科通则记 Inferred；**Wikipedia EN/zh 三通道超时**（WebFetch×2 + REST API）——园艺交叉（秋色红相/生长速率/NC 档）未获，照片轴承担（§5/§6 如实降档）；WebSearch 未使用（配额纪律）。
- **调研执行事故记档（[1308]，如实）**：本轮调研由通用子代理（asset-research 技能）启动，运行 23.5 分钟后于 17:45 因 **[1308] 用量上限**中断（限额 19:32:21 重置）；**暂存数据完整回收**（FRPS/FOC 四端点 JSON + iNat 106 obs 池 JSON + 34 张候选筛读）——主代理接管完成后续照片判读（Pass A/B）与本 Spec 落盘（文档工作不受「渲染实现不得主代理编写」约束，Spec 终审本属主代理职责，D35.1）；开发子代理派遣顺延至限额重置后。
- **图片判读通道事故与规程再证实（3 条）**：
  1. **URL 权威域教训**：m3（478599246）与 b1（655889567）API 记录域名 = **static.inaturalist.org**（S3 open-data 猜测直链 400/1210「图片输入格式/解析错误」×3）；按 API JSON 权威记录换 static 域（扩展名 .jpeg/.jpg 随记录）后全部成功——**008.6 规程「URL 自 API JSON 提权威扩展名」的域名维度再证实**（011.7 仅扩展名维度）。b2（香港观测，javanica 风险）medium/original 双变体 400——照片级损坏，弃用（原已因种混淆风险计划剔除）。
  2. **工具误路由（3 次）**：数次 analyze_image 意图被误路由至 mcp image-search 工具（InputValidationError）——显式完整工具名重发即恢复，无判读污染（误路由调用未执行判读）。
  3. **双问不一致处置（1 张）**：leaf-a（264929697）Q1「三小叶结构非常清楚」vs Q2「奇数羽状 5–7 枚 + 白蜡树属读向」——**双问不一致，不承重定名**；三出结构锚 = 文献 Verified [1][3] + l1（双问✓「3 枚同点放射」）/f2/f10/f8/young-b 多数一致辅证 [7]。**工程启示记档：三出复叶与羽状复叶在中等分辨率照片上易混读（相邻复叶重叠伪读）——中距视觉验证（Step 4）须设「三出 vs 羽状」专项疑点位**。
- 判读纪律：单帧单调用顺序执行（011.6 并行退化教训）；提问中性不含树种名；承重照片锚点强制措辞（清点小叶数/果径参照/干高占比）；**照片池剔除海南/香港观测（javanica 风险）后判读**——分布域双保险（§1 差分链末轴）。
- 尺度结构事实优先级执行：全部结构数值以 FRPS 44(1):187 + FOC Vol.11 原句为准（含 frpslink 页码锚核对）；javanica 双端点仅作差分轴；照片轴封顶 Inferred；园艺交叉缺位处（秋色红相、生长速率、冠幅园艺数值）如实降档不冒充。

## 结构性缺口（Unknown Gate 相关）

- **生长季成树冠内样张缺失（本 Spec 最大缺口）**：form-a 为三月近裸枝相（枝结构清晰但叶幕密度不可读）、幼树/十月样张为中密推断——生长季成树通透度/密度梯度 Unknown；建议 Step 4 取证机位补冠内仰视。
- **中国公园修剪相样木缺失**：form-a 为乡道开放生长相（干高 1/4–1/3 或为开放生长低位端）——公园修剪枝下高 Unknown，slot 展开域内推。
- **园艺数值源缺位**（NC 无条目 + wiki 超时）：树高/冠幅园艺域、生长速率、秋色「红艳」园艺口径无文献锚——生产域由照片 + FRPS 上限内插（Inferred）；**秋色红相不做文献锚、记档不建模维持**。
- **叶背面色差 Unknown**：无背面清晰样张（两面色差建模取「不区分」或弱差档，Step 1 判定）。
- **互生叶序文献锚缺失**（属级端点 404）：照片弱单源 + 科通则 Inferred——家族互生螺旋挂点方法不受影响（方法层默认）。
- 果序夏相覆盖率定量 Unknown（定性链足：幼果 2–3mm 亚厘米、显著性极低——判定候选不做）。
- 骨架枝定量（数量/仰角精确值/衰减比/异速指数/方位排列）：与先例同缺口，不阻塞。
- 新叶红褐 flush 园艺口径（知名春相）文献未锚（wiki 超时）——照片双源 Inferred 维持。

## 终审记档（主代理，2026-09-21，D35.1 标准模式）

### ① 硬数值独立抽查（33 组，誊录保真 + 跨文献交叉口径——**通道状态如实记档**）

**通道状态（本节执行时全查）**：iplant 数据端点对本机会话应用级 404 重定向（curl 裸/带 cookie/带浏览器头/双编码四式均然；裸域 502；子代理今日 16:4x 首拉成功后转黑——疑站点限流）；iplant 页面 JS 渲染 WebFetch 取不到正文；eFloras WAF 拦截（「The URL you requested has been blocked」）；Wikipedia 三通道连接超时；WebSearch / web_reader 双 MCP 月度限额耗尽（1310，2026-10-04 重置）。**独立重拉不可达——本轮终审以三重替代口径执行**（比 011.7 的「独立重拉」弱一档，如实降记）：
1. **誊录保真审计（33/33 零不一致）**：Spec 全部硬数值引句 vs 缓存端点 JSON（子代理今日首拉、可解析完整、元数据字段健全）逐字 grep 比对——防「引句抄错」层零失误；
2. **FRPS ↔ FOC 跨文献交叉**：中志（1994 中文）与 FOC（2008 英文）两独立文献对全部共享数值逐位一致（15m / 50(–100)cm / 皮褐 6mm 纵裂 / 柄 9–13.5 / 顶小叶柄 1.5–4(–6) / 侧 3–14mm / 小叶 5–9(–14)×3–6(–9) / 齿 4–5/cm / 总状 8–13 与 3–12 / 果 5–7mm 褐红 / 4–5 月与 10–11 月）——javanica 双端点亦然（40m / evergreen / 3(–5) 小叶 / 7–15cm / 2–3 齿 / 果 6–13mm 淡褐）：通道幻觉同时伪造两语言两文献且交叉自洽的概率极低；
3. **页码锚独立吻合**：任务书（前一会话预立，00ac52f 之前）锚 FRPS 44(1):187 == 今日缓存 JSON frpslink 字段「第44(1)卷 (1994) >> 187页」——不同会话不同来源互证；habait 省列含江苏/江西/浙江核过。

| 抽查组（详单 = 上面 grep 清单） | 结果 |
|---|---|
| FRPS polycarpa 16 组（树高/径/皮/冠/枝皮孔/芽/复叶六组/花序三组/果/花果期/产地两句） | ✅ 16/16 逐字 |
| FOC polycarpa 7 组（英文全结构句） | ✅ 7/7 逐字 |
| FRPS javanica 8 组（差分轴） | ✅ 8/8 逐字 |
| FOC javanica 3 组（evergreen/尺寸/齿） | ✅ 3/3 逐字 |
| habait 省列 + 页码锚 | ✅ / ✅ |

**结果：33/33 过零不一致（誊录层）；独立重拉待通道恢复可补跑（不阻塞——三重替代口径已闭合「抄错」与「单通道幻觉」两类风险）。**

### ② 照片终审（008.6 返修规程：两次独立中性提问一致方定名；5 张承重 × 2 问 + 1 张不一致处置）

URL 口径记档（再证实 + 域名维度新增）：S3 open-data 直链（s3.amazonaws.com/photos/<id>/medium.jpg）主力通道；**m3（478599246）与 b1（655889567）API 记录域 = static.inaturalist.org——S3 猜测直链 400/1210 三次、按 API 权威记录换 static 域（.jpeg/.jpg 随记录）后即成功**（011.7 仅扩展名维度，本轮补域名维度：**URL 域名与扩展名都必须自 API JSON 记录取**）。

- **form-a（478599246，韶关乡道成树，2025-03-22 三月相）**：Q1 整树清单——7–9m、冠幅≈高、开展圆头-近伞形、低分枝 1.5–2m、大枝近水平开展+端部上举、虬曲、三月近裸枝+少量迟发新叶+枝端深色果簇宿存、灰褐深裂干。Q2 判别——冠幅/高 0.8–1.0、开展不规则、主干弯曲个体、干高 1/4–1/3、大枝近水平粗壮（径 ≈1/3–1/2 主干）、叶幕疏松、灰褐粗糙皮、深色小点疑似果序。**两问一致，定名成立**（三月近裸枝 = 落叶性照片实证，直接排除常绿 javanica）。
- **bark-a（655889567，安庆 73 年生，2026-04-19）**：Q1——深灰褐-灰黑纵裂深沟宽脊、局部扭曲网状、枝锈色/灰白皮孔。Q2——灰褐-暗褐基色、纵长条深裂、脊宽沟深、裂纹扭曲交错、主干扭转感、细枝深褐较光滑、老树深裂。**两问一致，定名成立**（obs 描述原文「重阳木 树龄：73年」——树龄锚直接来自观测者标注）。
- **leaf-b（531226508，宁波 2025-07-04 夏叶）**：Q1——阔卵-近心形大叶、尾状渐尖、长柄下垂、全缘读向、稍光泽。Q2——**3 枚叶片从同一点放射（掌状三小叶）**、顶生 7–10×5–8cm、尾占叶长 1/5–1/4、基部浅心-圆、缘照片分辨率下全缘、顶生小叶柄 ≈1/3–1/2 小叶长（落 FRPS 1.5–4(–6)cm 域）。**两问一致，定名成立（三出结构的唯一双问照片锚）**。
- **fruit-a（588346705，武汉 2025-10-24）**：Q1——下垂总状串、数十粒、2–5mm、黄褐。Q2——串 5–10 粒沿短细轴、果 3–6mm 黄褐-枯黄部分偏绿（成熟度不一）、轴下垂-平伸、着生枝中部叶腋、旁叶单生读向。**两问一致，定名成立**。
- **fruit-b（652754790，上海世纪公园 2022-11-19）**：Q1——红褐小果成串下垂 + 秋叶变黄、近景。Q2——串 10–30+ 粒、果 4–6mm 红褐-紫褐、秋叶绿 40–50%/黄 40–50%/橙红 <10%、细枝灰褐-红褐光滑。**两问一致，定名成立（熟果色 + 秋色轴双锚）**。
- **leaf-a（264929697，赣州 2023-04-04）双问不一致处置（如实记档）**：Q1「三小叶结构非常清楚（顶 1 侧 2）」vs Q2「奇数羽状 5–7 枚、对生、白蜡树属读向」——**不承重定名**；三出结构锚移至文献 Verified + leaf-b（双问✓）；判读启示：**三出复叶在中等分辨率下与羽状复叶易混读（相邻复叶沿枝重叠伪读为羽状），Step 4 中距身份判定须设「三出 vs 羽状」专项疑点位**。

### ③ 逐项裁决与处置（分歧取中庸）

1. **树高锚（重点）**：form-a 成树 7–9m（乡道开放生长、三月相）+ FRPS 上限 15m + 速生行道种——裁决：**生产域 8–12m 维持 Inferred，slot-0 锚 ≈10m 主代理裁定**（速生伞形开展冠与栾树同量级；高于乌桕 9.5m 半档——上限 15m 且长江行道习见；速生上探 12 变体入高位槽；中国公园修剪相样木缺失维持结构缺口，Step 4 可补）。
2. **夏相果序建模判定（Spec 域证据链 → 终审确认）**：幼果 2–3mm（熟域 5–7mm 上限的未熟端）+ 熟期 10–11 月（夏季无熟果）+ 亚厘米绿粒 vs 20–30cm 级大叶幕——**显著性低于乌桕绿闭蒴果先例（1–1.5cm）一个量级，判定 = 不做（记档）**；秋冬红果串/宿存相（身份标志）非建模相。花（4–5 月春相总状绿穗）同判**不做**（非夏绿建模相——vs 栾树夏花 7–8 月属相内故做，重阳木春花属相外）。
3. **冠幅比**：0.8–1.0 维持（form-a 双问 0.8–1.0 + 幼树 ≥1.0——幼龄开张端入 slot 展开域）。
4. **大枝角域**：FRPS「斜展」文献域 vs form-a「下近水平 70–90° + 上斜上 40–60°」两段读——裁决：**两段姿采纳（照片数值带承重，文献定性兼容——「斜展」的开展端实现），几何侧 scaffold 角域分上下带**。
5. **叶色**：文献无种级叶色句 → 正面中绿-深绿（照片单源 Inferred 封顶）；新叶红褐 flush 照片双源维持 Inferred（园艺红相无文献锚不冒充）；**背面色差 Unknown → 建模取弱差档或不区分（Step 1 定）**。
6. **小出入记档**：Spec §1 差分链内「javanica 雌花序 15–27cm」引 FRPS（FOC 对照无冲突）；FOC polycarpa Description 无独立叶序句维持「互生 Inferred」——无修正项。

### ④ 生产口径终版建议（供 Step 1/开发直接引用）

- 种定名 **Bischofia polycarpa** 维持（七轴差分 + 分布域 + 三月落叶相照片实证）。
- 体量锚：**树高 ≈10m（slot-0）/ 生产域 8–12m / 冠幅比 0.8–1.0 / 单干、干高占比 0.25–0.33**。
- 叶：**三出复叶卡语言（复叶第二型）**——1 卡承载整枚三出复叶（总柄 + 三小叶掌状放射；顶大侧小、侧近无柄 3–14mm、顶小叶柄 1.5–4(–6)cm）；小叶卵形-椭圆状卵形 5–9(–14)×3–6(–9)cm、先端突尖-短渐尖、基圆-浅心、缘钝细齿 4–5/cm（近景档）；总柄 9–13.5cm；**卡比例建议宽/长 ≈0.7–0.85（三出展幅比羽叶宽——终值归 Step 1 冻结）**；复叶全展幅 ≈20–30cm 级 → 卡尺寸工程映射归任务书。
- 枝姿：**两段 scaffold（下带近水平 70–90° / 上带斜上 40–60°）+ 端部小枝上举 + 大枝虬曲 + 冠缘细枝微垂读向**；伞形-开展圆头冠。
- 树皮：**第 9 语言「褐-深灰褐纵裂深沟宽脊 + 裂纹扭转/局部网状、细枝红褐光滑皮孔」**（第 9 = 夏栎1 朴2 樟3 榉4 银杏5 悬铃木6 栾树7 乌桕8 之后）；建模取中龄档（沟深中-深）；**当年生枝绿色 + 皮孔灰白→锈色是近景身份点（材质层候选）**。
- 果序/花：**不做（③-2 裁决）**；秋冬红果串相记档。
- 秋色：黄主导 + 橙红点缀（照片轴）——记档不建模。
- 叶色：正中绿-深绿（Inferred）；新叶红褐 flush 弱表达候选；背面 Unknown 弱差。

### ⑤ 终审结论

**有条件通过（通道降级如实记档 + 裁决六项）**。誊录层 33/33 零不一致；FRPS↔FOC 跨文献交叉闭合单通道幻觉风险；页码锚跨会话吻合；照片轴 5×2 问全部一致定名 + 1 张双问不一致如实处置。与 011.7 金标准的差距 = 独立重拉未执行（六通道全灭，记档于 ①）——**待任一通道恢复可补跑重拉（10 分钟工作量，不影响生产取用）**。Spec 1.0 + 本终审记档 = 生产取用版。
