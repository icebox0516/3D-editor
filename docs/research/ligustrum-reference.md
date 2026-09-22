# ligustrum Reference Spec（女贞）

Spec Version: 1.0
Domain: plant
Asset: tree_ligustrum（女贞）
Updated: 2026-09-22

> 关键事实统一写法（各节内联、逐条标注；Source 填来源表编号）：
> Form ∈ {Value, Range, Relative, Qualitative}；Evidence Status ∈ {Verified, Inferred, Unknown}。
> 工程预算（面数/LOD 阈值）不进本文件，归任务书。真实照片本地副本为 `screenshots/ref-tmp/` 下 ref-ligustrum-*.jpg（不入 git、不进 Runtime）。
> 建模目标相 = **生长季（夏绿叶相）+ 常绿全年基调**；落叶变型 f. latifolium 仅记档不建模（江苏特有，§6）。
> **花（5–7 月白色圆锥花序）判定建议：主相不做、可选低频变体档**（花序大而显著但花期不覆盖 9–10 月主语境，理由记 §5；判定归任务书 Step 1）。
> **核果（蓝黑被白粉肾形果，果期 7 月至翌年 5 月）判定建议：做**（超长可见窗口 + 满冠下垂密簇 + 覆盖主语境，理由记 §5；判定归任务书 Step 1）。
> **D34 证据中档注记执行**：FRPS 61:153 有「植株并可作丁香、桂花的砧木或行道树」用途明文、无「广泛栽培」级语句——结构尺度轴按 FRPS/FOC 原句如实锚定，形态变体轴多源交叉补强（照片 18 张双问 + NC State 园艺轴），Evidence 弱项在「结构性缺口」节显式上报。

## Research Scope（本次生产真正需要确认的现实事实）

- 种定名：L. lucidum vs 近缘 L. japonicum（日本女贞）判据链；「大叶女贞」苗市俗名口径记档
- 常绿性表达：全年绿叶相 + 冠层密度 + 叶面反光观感（vs 香樟先例口径）
- 革质叶：形/尺度/缘/先端/光泽/脉显隐/叶柄
- 花与核果：尺度、颜色、着生、花期果期、生长季可见性 → 建模判定素材
- 冠形与体量：中龄公园/行道个体树高/冠幅/干高（族量级锚 ≈8m 语境）；卵圆冠？分枝点
- 树皮色纹、枝姿、叶色两面差

## 1. 身份

女贞（Ligustrum lucidum W. T. Aiton），**木犀科（Oleaceae）女贞属（Ligustrum）**——与白蜡树（梣属）同科（FRPS 第 61 卷即木犀科卷）[1][3]。**常绿乔木（稀灌木）**[1][2]（FOC 广义种记 "evergreen or deciduous"——含落叶变型，见 §6；生产锚定常绿原变型 f. lucidum）。使用语境：**长江流域及以南城市公园、行道、绿篱的常绿阔叶乔木，南方城市绿化主力常绿树之一**；本资产服务中距离为主的园区可视化，目标龄级锚 = 中龄公园典型个体 ≈6–10m（照片 + 园艺轴推断，见 §2），与夏栎 ≈8m、朴树 ≈8.5m、香樟同语境可混植。

- **种定名（最高优先，三源裁定记档）**：
  1. **FRPS 61:153（1992）口径**：女贞为**独立种、种下分两变型**——「15. 女贞（神农本草经）　青蜡树（江苏），大叶蜡树（江西），白蜡树（广西），蜡树（湖南）……Ligustrum lucidum Ait.……」[1]，subplist 含 f. lucidum（原变型）与 f. latifolium（落叶女贞，江苏）[1]。
  2. **FOC Vol.15（1996）口径**：13. Ligustrum lucidum W. T. Aiton 独立种，synonym 列 L. lucidum f. latifolium (W. C. Cheng) P. S. Hsu 等；Comment 明确「evergreen plants with (4 or)5 or 6(-9) primary veins = f. lucidum, deciduous plants with 7-11 primary veins = f. latifolium」[2]。
  3. **现代数据库口径**：GBIF backbone「Ligustrum lucidum W.T.Aiton」taxonomicStatus = **ACCEPTED**（检索 2026-09-22）[6]。
  - Form: Value
  - Evidence Status: Verified
  - Source: [1][2][6]
- **近缘种差分（重点问题：L. lucidum vs 日本女贞 L. japonicum，判据链）**：
  1. **体量与习性**：lucidum「灌木或乔木，高可达 25 米」[1] / "Shrubs or trees to 25 m" [2] vs japonicum「**大型常绿灌木，高 3-5 米**」[5]——乔木 vs 大灌木级差；
  2. **果形（FRPS 明文裁定的核心差分）**：lucidum「**果肾形或近肾形**，长 7-10 毫米，径 4-6 毫米」[1] vs japonicum「**果长圆形或椭圆形**，长 8-10 毫米，宽 6-7 毫米」[5]；FRPS 女贞条目异名讨论原句直接给出裁定逻辑：「L. taquetii Levl. 无疑是本种的异名，**因其果实为肾形，而 L. japonicum Thunb. 的果实为椭圆形**」[1]；
  3. **叶形与质地**：lucidum「叶革质，**卵形、长卵形或椭圆形至宽椭圆形，长 6-17 厘米，宽 3-8 厘米**」[1] vs japonicum「叶**厚革质，椭圆形或宽卵状椭圆形，稀卵形，长 5-8（-10）厘米，宽 2.5-5 厘米**」[5]——lucidum 叶显著更大更长（长端 17 vs 8-10cm）；
  4. **花冠裂片（任务书问项）**：lucidum「花冠长 4-5 毫米，花冠管长 1.5-3 毫米，**裂片长 2-2.5 毫米，反折**」[1]（FOC："Corolla 4-5 mm; tube ca. as long as lobes. Stamens approaching apex" [2]）vs japonicum「花冠长 5-6 毫米，花冠管长 3-3.5 毫米，**裂片……先端稍内折，盔状**……雄蕊伸出花冠管外」[5]——lucidum 裂片反折、雄蕊内藏近喉部，japonicum 裂片盔状、雄蕊伸出；
  5. **命名混淆史记档**：FRPS 女贞异名列末「**L. japonicum auct. non Thunb. 1784: Rehd. 1934**」[1]——历史上曾有作者把女贞误定为日本女贞（近缘混淆方向为 lucidum 被误冠 japonicum 名）；
  6. **园艺侧交叉**：NC State 将 L. lucidum（Glossy Privet）与 L. japonicum（Japanese Privet）作**两个独立种并列**且注「It is not as cold-hardy as Japanese privet (Ligustrum japonicum)」[7]。
  - 判定：**生产身份 = L. lucidum f. lucidum（女贞原变型本尊，常绿型）**；japonicum 为日本—琉球分布的近缘大灌木，非长江流域城市绿化对象（其果椭圆形、株高 3–5m，与本项目乔木语境不混）。照片池检索按 taxon 77740 精确匹配，无 japonicum 混入路径（iplant FOC 端点 key=japonicum 反被模糊匹配至台湾女贞 L. amamianum——FOC 中国范围内 japonicum 本尊无独立条目，差分依据取 FRPS 61:151 全文 [5] + NC State [7]，记档）。
  - Form: Value + Qualitative
  - Evidence Status: Verified（判据 1–4 各原句双源）
  - Source: [1][2][5][7]
- **「大叶女贞」苗市俗名口径（重点问题，记档）**：iPlant.cn 物种信息卡俗名字段：「**大叶女贞**、冬青、落叶女贞」[8]——苗市「大叶女贞」即 L. lucidum（与「小叶女贞」L. quihoui 相对）；FRPS 民间俗名链「**大叶蜡树（江西）**」[1] 与之同构（「大叶」命名逻辑一致，方向性互证，弱推断）。**注意**：俗名「冬青」与冬青属 Ilex（冬青科）撞名——苗市/口语语境的「冬青」指女贞时属讹用/地方名，本资产定名与建模不采该词。
  - Form: Qualitative
  - Evidence Status: Inferred（俗名记档 = 聚合器单源 [8] + FRPS 同构俗名 [1]；非承重事实，身份由 [1][2][6] 承担）
  - Source: [1][8]
- **常绿性（重点问题，身份轴）**：「**叶片常绿，革质**」（FRPS 种级原句）[1]；FOC 广义种含落叶变型但常绿型 = f. lucidum（Comment 原句见上）[2]。照片轴多源直接证据：**武汉 1 月枝叶浓绿健壮**（leaf-winter，双问）[10]、**皇藏峪国家森林公园 12 月冠层在落叶树裸枝背景中满密深绿**（canopy-a，双问「邻树皆裸而中央冠全绿 yes」）[10]、**杭州植物园 12 月整树满叶**（form-cn，双问）[10]、**美国北卡校园 2 月整树满叶**（form-d，双问）[10]——**中国冬季绿叶相照片级 Verified（四样木互证，含长江流域语境双样木）**。
  - Form: Qualitative
  - Evidence Status: Verified（文献 [1][2] + 照片四样木 [10]）
  - Source: [1][2][10]
- 分布与生境：FRPS「产于长江以南至华南、西南各省区，向西北分布至陕西、甘肃。生海拔 2 900 米以下疏、密林中。朝鲜也有分布，印度、尼泊尔有栽培。」[1]；FOC 省域 "Anhui, Fujian, Gansu, Guangdong, Guangxi, Guizhou, Hainan, Henan, Hubei, Hunan, Jiangsu, Jiangxi, Shaanxi, Sichuan, Xizang, Yunnan, Zhejiang" [2]；NC State "native to southern China to Hainan and Southern Korea"、美国南部归化/入侵 [7]。照片轴：iNat 中国池大量记录北至济南、青岛、西安、郑州（栽培个体）[10]——**北方栽培扩展为照片级事实**（长江以南原生 + 向北城市栽培）。
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][7][10]
- **用途与 D34 注记（行道树用途明文）**：FRPS「种子油可制肥皂；花可提取芳香油；果含淀粉，可供酿酒或制酱油；枝、叶上放养白蜡虫，能生产白蜡，蜡可供工业及医药用；果入药称女贞子，为强壮剂；叶药用，具有解热镇痛的功效；**植株并可作丁香、桂花的砧木或行道树**。」[1]——**行道树用途为 FRPS 一句明文**（D34：无「广泛栽培」级更强语句；城市绿化主力地位由 NC State 归化史 [7] + iNat 中国池城市记录密度 [10] 多源补强，非志书直给）。
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][7][10]

## 2. 主要尺度

- **树高（志书级数值锚）**：**「灌木或乔木，高可达 25 米」（FRPS 原句）**[1]；FOC "Shrubs or trees to 25 m" [2]——**25m 为物种上限口径（无典型值直给）**；NC State 园艺栽培域 "Height: 15–50 ft"（≈4.6–15.2m）且「usually grows as a shrub 12 to 15 feet tall, but if trained as a tree could grow to 30 feet tall」（≈3.7–4.6m 灌木相 / 修剪成树 ≈9m）[7]；照片整树样木：**杭州植物园中龄 ≈6–7m**（form-cn，双问）、**北卡校园中龄 ≈8m**（form-d，双问）[10]——**中龄公园/行道典型个体 ≈6–10m（文献域下段 + 照片双样木，Inferred 档；弱于白蜡「高10-12米」直给级——D34 中档如实标注）**；**生产主域建议 6–10m、slot-0 ≈8m**（与夏栎 ≈8m 同档，建议归任务书）。
  - Form: Range
  - Evidence Status: Verified（25m 上限 [1][2]）/ Inferred（中龄典型域——园艺域 [7] + 照片双样木 [10] 推断）
  - Source: [1][2][7][10]
- 胸径/干径：无文献数值、无标定照片——Unknown
  - Form: Unknown
  - Evidence Status: Unknown
- **叶（最高优先，革质轴核心，FRPS 原句）**：**「叶片常绿，革质，卵形、长卵形或椭圆形至宽椭圆形，长 6-17 厘米，宽 3-8 厘米，先端锐尖至渐尖或钝，基部圆形或近圆形，有时宽楔形或渐狭，叶缘平坦，上面光亮，两面无毛，中脉在上面凹入，下面凸起，侧脉 4-9 对，两面稍凸起或有时不明显；叶柄长 1-3 厘米，上面具沟，无毛。」（FRPS 原句）**[1]；FOC "leaf blade ovate to sometimes broadly elliptic or elliptic to lanceolate, 6-17 × 3-8 cm, leathery or papery……apex acute to acuminate or sometimes obtuse; primary veins 4-11 on each side of midrib, slightly raised or obscure" [2]；NC State "Leaves are glossy, green, opposite, simple, coriaceous, with 6 to 8 pairs of lateral veins that are sunken on the undersurface……Leaf Length: 3-6 inches"（7.6–15.2cm）[7]——**生产口径：卵形-长卵形-椭圆形-宽椭圆形（FOC 端含披针形）6–17 × 3–8cm、革质、全缘平坦（无锯齿、缘不增厚卷曲）、先端锐尖至渐尖或钝、上面光亮、侧脉 4–9 对（FOC 至 11）不明显-稍凸起、叶柄 1–3cm 上面具沟**。照片交叉（双问）：leaf-a 判「椭圆-披针形、全缘、锐尖、革质、侧脉 5–7 对**细弱弧曲不显**、柄短于叶长 1/10」[10]；leaf-winter 判「叶 8–12cm、深绿有光泽、健壮」[10]；leaf-b 判「卵-宽椭圆、全缘、渐尖、**强光泽革质**（"high-gloss polished"）」[10]。
  - Form: Range + Qualitative
  - Evidence Status: Verified
  - Source: [1][2][7][10]
- **叶柄**：1–3cm、上面具沟 [1]（camphor 2–3cm 同档——**长柄叶**近景辨识维度延续）；照片 leaf-a 判 ≈1/10 叶长（0.6–1.7cm 读向）[10]
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][10]
- **圆锥花序（重点问题）**：**「圆锥花序顶生，长 8-20 厘米，宽 8-25 厘米；花序梗长 0-3 厘米；花序轴及分枝轴无毛，紫色或黄棕色，果时具棱……花无梗或近无梗……花冠长 4-5 毫米」（FRPS 原句）**[1]；FOC "Panicles terminal, 8-20 × 8-25 cm" [2]；NC State "Flower Inflorescence: Panicle……creamy white flowers" [7]——**顶生圆锥花序 8–20 × 8–25cm（常超过叶长）、宽塔形、白色-乳白**；照片（flower-a 双问）：「**金字塔形顶生圆锥花序、长于叶片**、乳白 4 瓣、盛花覆盖冠面 10–30%、花序自枝端直立-稍外斜」[10]。
  - Form: Range + Qualitative
  - Evidence Status: Verified
  - Source: [1][2][7][10]
- **核果（最高优先，建模判定核心，FRPS 原句）**：**「果肾形或近肾形，长 7-10 毫米，径 4-6 毫米，深蓝黑色，成熟时呈红黑色，被白粉；果梗长 0-5 毫米。花期 5-7 月，果期 7 月至翌年 5 月。」（FRPS 原句）**[1]；FOC "Fruit deep blue-black, ripening red-black, reniform or nearly so, 7-10 × 4-6 mm. Fl. May-Jul, fr. Jul-May." [2]；NC State "Fruits are 1/4-inch, semi-fleshy, olive-like drupes that are blue-black. They persist into winter." [7]——**肾形（一侧扁/微凹）核果 7–10 × 4–6mm、深蓝黑色被白粉、果期 7 月至翌年 5 月（超长窗口）**。照片色序链（双问）[10]：**绿-白绿未熟果**（fruit-unripe，南京 9 月中，「green/whitish-green unripe + reniform + ~7mm」）→ **紫黑-蓝黑熟果满冠下垂密簇**（fruit-b，黄冈 10 月，「purple-black + bloom + 6–8mm + 每簇 60–80 + 下垂」；fruit-c，圣保罗 8 月，「reniform + glaucous + blue-black + ~8mm + 每簇 50–70 + drooping」）→ **冬季宿存**（fruit-a，奥斯汀 2 月，「reniform + 白粉蓝黑 + ~10mm + 每簇 40–60」；fruit-d，布宜诺斯艾利斯 9 月南半球早春宿存；canopy-b，圣何塞 12 月冠内紫黑果簇）。
  - Form: Range + Qualitative
  - Evidence Status: Verified（形/尺度/色文献双源 + 色序照片四点链）
  - Source: [1][2][7][10]
- 物候总口径：**花期 5–7 月，果期 7 月至翌年 5 月**（FRPS [1]；FOC "Fl. May-Jul, fr. Jul-May" [2] 双源一致）——**9–10 月主语境 = 熟果盛挂相（紫黑被白粉满冠下垂簇）+ 满密常绿冠**。
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][2][7][10]

## 3. 轮廓与比例

- **冠形（重点问题）**：**卵圆形-广卵形冠（broad-ovate）**——志书无冠形原句；整树照片双样木双问一致：form-cn（杭州植物园 12 月）「single trunk + **broad-ovate crown**、冠幅比 0.8–0.9、分枝点 0.3」、form-d（北卡 2 月）「**broad-ovate**、0.8、0.3」[10]；canopy-b 判冠轮廓「rounded（圆头读向）」[10]——**建模主相 = 卵圆-广卵形单干冠（与香樟「广卵形」同族读向，女贞端稍紧）**。任务书立项假设「卵圆形冠」获照片双样木支持。
  - Form: Qualitative
  - Evidence Status: Inferred（照片双样木双问一致 + 无文献句——弱于香樟「树冠广卵形」文献双源级，如实标注）
  - Source: [10]
- **冠幅/树高比**：**≈0.8–0.9**（form-cn 0.8–0.9 / form-d 0.8，双问各自内一致）[10]；form-a（构图不完整样本）「冠幅读向 ≥ 高（1.0–1.2）」为开展端变体读向 [10]——**生产域 0.8–1.0（0.8–0.9 主档 + 开展端 1.0）**。
  - Form: Range
  - Evidence Status: Inferred（照片双样木）
  - Source: [10]
- **主干分枝点高度占比（干高/树高）**：**≈0.30**（form-cn ≈0.3 / form-d ≈0.3 / bark-b ≈0.3，三样本双问一致）[10]——中低分枝（冠下压、干较矮读向，与香樟 0.30–0.35 同档）；行道树修剪提干个体会更高（园艺语境推断，无照片标定）。
  - Form: Range
  - Evidence Status: Inferred（照片三样本）
  - Source: [10]
- 主干姿态：**单干典型**（form-cn/form-d 双问一致 single trunk [10]；乔木相文献 [1]）；**丛生多干端存在**（form-b 美国归化林地个体「双干低分歧 + 基部萌条」双问一致 [10]——归化/免修剪语境端；NC State 记其美国常见灌木屏植相 [7]）——**公园/行道修剪语境单干为主、萌生丛生为变体端**。
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [1][7][10]
- **冠层密度（重点问题：常绿满密读向，vs 香樟先例）**：**满密高覆盖**——canopy-a（12 月）「绿色覆盖 85–95%、天光空隙仅 5–10%、离散大团块（0.5–1m 级、约 1/4–1/5 冠宽）、深绿」双问一致；canopy-b（12 月）「85–90% 覆盖、空隙 10–15%、团块 1/6–1/8 冠宽、街距光泽可见」双问一致 [10]——**空隙 ≈5–15%、与香樟（10–15%）同密档（常绿密冠档）**；团块尺度 ≈1/6–1/4 冠宽（香樟 1/8–1/10——**女贞团块读向略大、冠面更整块**）。冬季四样木满密浓绿（canopy-a/b + form-cn + form-d + leaf-winter 中国语境）[10]。
  - Form: Relative
  - Evidence Status: Verified（冬季满密读向本身照片直接证据多源）/ Inferred（密度等级数值化为判读）
  - Source: [10]
- 冠层密度梯度：canopy-a/b 判「离散团块融合的外壳 + 冠内偶见空细枝」（「a couple of leafless thin branches inside」）；外密内疏读向（与香樟同构，幅度小）。
  - Form: Qualitative
  - Evidence Status: Inferred（弱，照片二源）
  - Source: [10]

## 4. 结构层级

部件树：主干（单干典型）→ 骨架枝（中角开展）→ 二级枝 → 末级枝（黄褐-灰-紫红、圆柱形、皮孔）→ **对生单叶（常绿革质）** → 顶生圆锥花序（5–7 月，白）→ **肾形核果下垂簇（7 月至翌年 5 月）** → 全年常绿。

- **叶序（最高优先——对生单叶 = 身份结构）**：**「叶对生，单叶，叶片纸质或革质，全缘」（FRPS 女贞属属级原句 61:136）**[3]；FOC 属级 "Leaves opposite, simple, short petiolate; leaf blade entire" [4]；NC State "Leaf Arrangement: Opposite" [7]；照片双问：leaf-a「**opposite pairs** + 顶芽单叶」、leaf-winter「**opposite——数出 4–5 组对生叶对**」[10]——**对生单叶全缘 = 女贞属身份结构，文献三源 + 照片双样本双问**。⚠ leaf-b 照片双问在排列位分歧（Q1 opposite vs Q2 alternate）——该照片不承重叶序主张（记档，分歧见检索备注）；叶序事实由 leaf-a/leaf-winter 双问 + 文献三源承托。**家族定位：与白蜡（对生复叶）共享「对生」位但为对生单叶（先例无同型——朴/樟/栎/槐/栾均互生）——对生单叶为家族首例挂点语言**。
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [3][4][7][10]
- **着花着果位（重点问题）**：圆锥花序**顶生**于当年生枝端 [1][2]（属级「聚伞花序常排列成圆锥花序，多顶生于小枝顶端，稀腋生」[3]）；果期花序轴「紫色或黄棕色，**果时具棱**」[1]；照片：flower-a「terminal at branch tips、金字塔形、直立-外斜」[10]、fruit-b/c「果簇自枝端**下垂悬挂**（果重压枝）」[10]、fruit-unripe「broad branching panicle-shaped clusters 顶生」[10]——**挂点单位 = 枝端单个大圆锥果序（数十果/序），熟果下垂、满冠分布**。
  - Form: Qualitative + Range
  - Evidence Status: Verified（着生位文献双源 + 姿态照片多源）
  - Source: [1][2][3][10]
- 小枝：**「枝黄褐色、灰色或紫红色，圆柱形，疏生圆形或长圆形皮孔」（FRPS 原句）**[1]；FOC "Branchlets terete" [2]；NC State "Stem Lenticels: Conspicuous" [7]；照片 leaf-winter 判细枝「绿-棕褐色」[10]、leaf-b 判新枝端红铜色 [10]——一年生枝黄褐-灰-紫红（新梢带红调）、皮孔圆形/长圆形可见。
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][7][10]
- 芽：FRPS 种级无芽描述（女贞条目无芽原句——与白蜡不同级，如实记）；照片 leaf-b 见「reniform dark bud」（单问，弱）[10]——芽形态 Unknown（常绿树种冬芽近景证据天然少）。
  - Form: Unknown
  - Evidence Status: Unknown
  - Source: [10]
- 分枝角与枝姿：骨架枝**中角开展（30–60° 对铅垂）**（form-a/form-cn/form-d 双问均 medium [10]）；末级枝外斜-稍下垂（果序重压下垂 [10]）；bark-b 判「圆头冠 + 中角分枝」[10]。定量仰角 Unknown。
  - Form: Qualitative / Unknown（定量）
  - Evidence Status: Inferred（定性）/ Unknown（定量）
  - Source: [10]
- 分枝层级数：≥3 级可见（整树照三级 + 末级细枝网；弱单源）。
  - Form: Range
  - Evidence Status: Inferred
  - Source: [10]

## 5. 材质与表面

- **叶面光泽（重点问题：革质 specular 现实基准，011.2 缺口 B 口径）**：**「上面光亮」（FRPS 原句）**[1]；NC State "Leaf Feel: **Glossy**……glossy, green" [7]；照片多源：leaf-b 双问「**强镜面光泽、抛光革质（"high-gloss polished leathery"）**、深绿」、canopy-b「街距光泽可见（"glossy at street scale"）」、flower-a「dark green, **glossy** (leathery) foliage」、leaf-winter「glossy healthy」[10]；leaf-a（手持背光样本）判「半光泽（semi-glossy）」[10]——**合成口径：上面深绿强光泽（革质 specular 真实存在、中距街距可读；背光/阴面样本读向半光泽）**。**vs 香樟先例**：樟「上面深绿光泽」+「背面灰绿粉感（glaucous）」双信号；**女贞 = 上面光泽 + 背面无粉被**（FRPS 两面无毛、无 glaucous 句 [1][2]）——**女贞光泽轴更「单面镜」、樟为「亮面+粉背」组合，材质表达可分化**。
  - Form: Qualitative
  - Evidence Status: Verified（文献双源 + 照片四源多问一致；leaf-a 单样本半光泽读向如实并存）
  - Source: [1][2][7][10]
- **叶两面色差（重点问题）**：FRPS「上面光亮，两面无毛」——**无「下面色淡/灰白」显式原句**（弱于樟「下面黄绿色或灰绿色晦暗」级）；照片 leaf-a 双问判「**下面浅绿（paler green）**、中脉明显、次脉不显」[10]；leaf-b 判叶背「淡绿白」读向 [10]——**两面色差存在但弱（淡绿级，非灰白粉感级）——照片级单-双源，Inferred 如实**。
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [1][10]
- **脉显隐（重点问题）**：FRPS「侧脉 4-9 对，**两面稍凸起或有时不明显**」[1]；NC State「6 to 8 pairs of lateral veins **sunken on the undersurface**」[7]；leaf-a 双问「侧脉 **5–7 对细弱弧曲、不显**（faint arcuate, secondary inconspicuous）」[10]——**羽状脉细弱不显（vs 樟离基三出脉粗显、朴三出基脉）——中距脉序近零信号、近距淡信号**。
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][7][10]
- **叶缘（重点问题）**：「**叶缘平坦**」全缘 [1]（属级「全缘」[3][4]）；照片双问一致 entire 平坦 [10]——**全缘平坦、无软骨缘/波缘**（vs 樟「软骨质缘有时微波状」——**女贞缘更平直，SDF 缘载波零需求**）。
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][3][4][10]
- 新叶色：flower-b 判枝端新叶「红铜-古铜色（reddish-bronze new tips）」[10]（单照片源，双问一致于该照片内部）——新梢带红调（弱单源，变体轴记档）。
  - Form: Qualitative
  - Evidence Status: Inferred（弱）
  - Source: [10]
- **树皮（重点问题，文献 + 照片双样本合并）**：**「树皮灰褐色」（FRPS 原句，无裂型描述）**[1]；照片双样本双问：bark-a（黄冈沿江大道行道树 10 月）「**灰褐色、细窄脊 + 浅沟、纵行大体平行（少量横向连接）、细纹浅色槭树状质感（fine maple-like texture）**、成熟段」、bark-b（奥斯汀 8 月）「**浅灰-灰褐、细鳞片状微翘（fine scaly-shreddy）、纵裂轻微、浅色细密纹理（light fine texture）**」[10]——**合并口径：灰褐-浅灰褐基调、细窄纵脊浅沟（中龄即细浅纹、非深裂）、无大片剥落无厚脊**。**vs 先例语言谱系**：樟（黄褐-灰褐不规则**深**纵裂脊宽沟深）/ 白蜡（灰褐浅-中纵裂幼干近光滑皮孔）/ 栾（浅色光滑皮孔麻点）——**女贞 = 灰褐细浅纵纹-细鳞质感（浮雕低、沟浅），与樟同向但浅一档、与白蜡幼干相最近但无醒目皮孔读向**（FRPS 女贞皮孔句在枝不在干：枝「疏生圆形或长圆形皮孔」[1]）。
  - Form: Qualitative
  - Evidence Status: Verified（灰褐色 [1]）/ Inferred（裂型与浮雕——照片双样本双问 + 无志书裂型句；**中国语境中龄主干特写仅 1 张（bark-a）——弱项记档**）
  - Source: [1][10]
- **果实表面（重点问题）**：「**深蓝黑色，成熟时呈红黑色，被白粉**」[1]（FOC 同 [2]）；照片三源双问一致「**白粉霜感（glaucous bloom）显著**、蓝黑-紫黑」[10]；NC State "blue-black……persist into winter" [7]——**材质信号 = 蓝黑底 + 白粉霜（哑光粉覆感）+ 密簇下垂**。
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][7][10]
- **花色材质与建模判定（重点问题）**：花冠白色（属级「花冠白色」[3][4]）、单花 4–5mm 4 裂、圆锥花序 8–20 × 8–25cm 顶生常超叶长、盛花覆盖冠面 10–30%（flower-a 双问）[10]——**中距读向 = 白色塔形花穗满冠点布（显著信号）**。**建模判定建议：主相不做、可选低频变体档**（理由：①花期 5–7 月**不覆盖 9–10 月主语境**（对照栾树 7–9 月花期覆盖主语境而做、国槐 7–8 月乳白弱信号不做——女贞信号强但时窗错位）；②常绿身份由密冠 + 革质光泽 + 果序三信号承托已足；③若需夏相可作低频档：白点簇层覆盖 10–30% 冠面）。判定归任务书 Step 1。
  - Form: Qualitative
  - Evidence Status: Verified（结构文献双源 + 冠面覆盖照片）
  - Source: [1][2][3][10]
- **果序建模判定（重点问题）**：**建议做**（理由：①**可见窗口极长——果期 7 月至翌年 5 月 [1][2] + NC State persist into winter [7] + 照片四点链（9 月绿果→10 月紫黑→12 月冠内果→2 月宿存）[10]，完全覆盖 9–10 月主语境**；②**肾形 + 白粉 + 蓝黑 = 属内独有造型**（家族果序谱：白蜡匙形翅果/国槐念珠荚/栾灯笼囊/乌桕三裂果/朴核果/樟球形核果/夏栎橡子——女贞肾形白粉浆果核果独立）；③满冠下垂密簇为夏末-冬显著特征（每簇数十果、下垂悬垂 [10]）；④紫黑被白粉与深绿叶幕可辨对比）；**账目法零 rng 确定性（triadica 绿闭果 / fraxinus 翅果帘幕先例同法）**。判定归任务书 Step 1。
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][7][10]
- 冠层色域（生长季主相）：深绿-中绿浓密革质冠面（光泽斑驳）+ 灰褐细纹干 + 夏末-秋冬紫黑白粉果簇满冠下垂 → 春季白花塔穗（低频）+ 新梢红铜调。
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [10]

## 6. 变体范围

- **种内变型轴（FRPS 口径记档）**：f. lucidum（原变型，常绿、侧脉 (4–)5–6(–9) 对）vs **f. latifolium 落叶女贞**（江苏低海拔丘陵；「叶片纸质，椭圆形、长卵形至披针形，侧脉 7-11 对，相互平行，常与主脉几近垂直」[1]；FOC Comment 常绿 (4 or)5 or 6(-9) 脉 vs 落叶 7–11 脉 [2]）——**生产锚定 f. lucidum 常绿型；落叶变型不入相**。
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2]
- 叶形幅度：卵形 ↔ 长卵形 ↔ 椭圆形至宽椭圆形主型 [1]（FOC 端含 lanceolate [2]）；先端锐尖-渐尖-钝 [1]；尺度 6–17 × 3–8cm 全域；NC State 记 Lanceolate/Ovate 型谱 [7]——**卵形-长卵形主相、宽椭圆-披针形端入变体档**。
  - Form: Qualitative + Range
  - Evidence Status: Verified
  - Source: [1][2][7]
- 单干 ↔ 丛生轴：修剪乔木相单干典型（form-cn/form-d [10]）↔ 归化/灌篱相多干萌生（form-b 双干低分歧 [10] + NC State 灌木屏植 [7]）——**公园/行道语境单干主相、丛生为低频变体端**。
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [7][10]
- 冠形幅度：卵圆-广卵主相（0.8–0.9）↔ 开展端 1.0–1.2（form-a [10]）。
  - Form: Range
  - Evidence Status: Inferred
  - Source: [10]
- 果簇宿存变幅：盛挂 8–10 月 → 宿存至翌年 2 月（美国样本 [10]）/冠内残留 12 月（中国样本 [10]）——FRPS 记果期至翌年 5 月 [1]，个体/地域宿存幅度 Unknown。
  - Form: Qualitative
  - Evidence Status: Verified（窗口）/ Unknown（幅度定量）
  - Source: [1][10]
- 新叶红铜调：flower-b 单照片源 [10]——低频变体信号记档。
  - Form: Qualitative
  - Evidence Status: Inferred（弱单源）
  - Source: [10]

## 7. 远近景保留优先级

（写到视觉显著性为止；面数/切换距离等工程映射归任务书）

- 远距（>50m）：**卵圆-广卵满密深绿冠轮廓 + 全年常绿色块（冬季与落叶树混植时满密浓绿即强辨识）+ 灰褐细纹干剪影**可辨认；单叶、果簇均不可辨，可全部牺牲。
- 中距（10–50m，本项目主语境）：**密冠团块体量（空隙 5–15%、团块 1/6–1/4 冠宽）+ 革质光泽斑驳观感（街距可读）+ 秋冬紫黑白粉果簇满冠下垂信号（每簇数十果、枝端下垂）+ 卵圆冠剪影 + 对生叶形成的规整冠面质感**。
- 近距（数米）：**对生单叶全结构（卵-椭圆 6–17 × 3–8cm、全缘平坦、先端锐尖-渐尖、革质上面光亮/下面淡绿、侧脉 4–9 对不显、叶柄 1–3cm 具沟）+ 核果细部（肾形 7–10 × 4–6mm、蓝黑被白粉、果序下垂）+ 树皮细部（灰褐细窄纵脊浅沟-细鳞）+ 小枝（黄褐-紫红、皮孔）**依次进入可辨域。
- 牺牲顺序（远→近）：脉序与叶柄细节 → 果单果轮廓与簇计数 → 叶序对生规整感 + 果簇满冠信号 + 革质光泽观感 → 卵圆满密常绿冠轮廓（最后保留）。

## 8. 来源证据

| # | 来源 | 类型 | URL/文献 | 检索日期 | 提取内容 |
|---|------|------|----------|----------|----------|
| 1 | 《中国植物志》第 61 卷 (1992) p.153 女贞 Ligustrum lucidum（iplant 数据端点全文） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfrps.ashx?key=Ligustrum%20lucidum（frpslink 字段确认「第61卷 (1992) >> 153页」，与 D34 锚 FRPS 61:153 一致） | 2026-09-22 | 「15. 女贞（神农本草经）　青蜡树（江苏），大叶蜡树（江西），白蜡树（广西），蜡树（湖南）　Ligustrum lucidum Ait.……15a. 女贞（原变型）f. lucidum」「**灌木或乔木，高可达25米；树皮灰褐色。枝黄褐色、灰色或紫红色，圆柱形，疏生圆形或长圆形皮孔。叶片常绿，革质，卵形、长卵形或椭圆形至宽椭圆形，长6-17厘米，宽3-8厘米，先端锐尖至渐尖或钝，基部圆形或近圆形，有时宽楔形或渐狭，叶缘平坦，上面光亮，两面无毛，中脉在上面凹入，下面凸起，侧脉4-9对，两面稍凸起或有时不明显；叶柄长1-3厘米，上面具沟，无毛。圆锥花序顶生，长8-20厘米，宽8-25厘米；花序梗长0-3厘米；花序轴及分枝轴无毛，紫色或黄棕色，果时具棱；……花无梗或近无梗，长不超过1毫米；花萼无毛，长1.5-2毫米，齿不明显或近截形；花冠长4-5毫米，花冠管长1.5-3毫米，裂片长2-2.5毫米，反折……果肾形或近肾形，长7-10毫米，径4-6毫米，深蓝黑色，成熟时呈红黑色，被白粉；果梗长0-5毫米。花期5-7月，果期7月至翌年5月。**」「产于长江以南至华南、西南各省区，向西北分布至陕西、甘肃。生海拔2 900米以下疏、密林中。朝鲜也有分布，印度、尼泊尔有栽培。」「种子油可制肥皂；花可提取芳香油；果含淀粉，可供酿酒或制酱油；枝、叶上放养白蜡虫，能生产白蜡，蜡可供工业及医药用；果入药称女贞子，为强壮剂；叶药用，具有解热镇痛的功效；**植株并可作丁香、桂花的砧木或行道树**。」「Leveille根据朝鲜标本发表的 L. taquetii Levl.无疑是本种的异名，因其果实为肾形，而 L. japonicum Thunb.的果实为椭圆形。」异名列末「L. japonicum auct. non Thunb. 1784: Rehd. 1934」；15b. 落叶女贞 f. latifolium（江苏）「叶片纸质，椭圆形、长卵形至披针形，侧脉7-11对，相互平行，常与主脉几近垂直」 |
| 2 | Flora of China Vol.15 (1996) 13. Ligustrum lucidum W. T. Aiton 种级（iplant 数据端点全文） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfoc.ashx?key=Ligustrum%20lucidum（vol 字段确认 Vol.15 (1996)，Oleaceae → Ligustrum） | 2026-09-22 | "Shrubs or trees to 25 m, evergreen or deciduous, glabrous. Branchlets terete. Petiole 1-3 cm; leaf blade ovate to sometimes broadly elliptic or elliptic to lanceolate, 6-17 × 3-8 cm, leathery or papery, base rounded or sometimes attenuate, apex acute to acuminate or sometimes obtuse; primary veins 4-11 on each side of midrib, slightly raised or obscure. **Panicles terminal, 8-20 × 8-25 cm**; rachis angular in fruit. Flowers sessile or nearly so. Calyx 1.5-2 mm. **Corolla 4-5 mm; tube ca. as long as lobes.** Stamens approaching apex of corolla lobes; anthers 1-1.5 mm. **Fruit deep blue-black, ripening red-black, reniform or nearly so, 7-10 × 4-6 mm. Fl. May-Jul, fr. Jul-May.**" Habitat: "Woods; below 2900 m. Anhui, Fujian, Gansu, Guangdong, Guangxi, Guizhou, Hainan, Henan, Hubei, Hunan, Jiangsu, Jiangxi, Shaanxi, Sichuan, Xizang, Yunnan, Zhejiang." Comment: "Evergreen plants with (4 or)5 or 6(-9) primary veins……recognized as f. lucidum, whereas deciduous plants with 7-11 primary veins……as f. latifolium……Grown for culturing wax insects to obtain white wax. The fruit is used as a tonic." Synonym 含 L. lucidum f. latifolium |
| 3 | 《中国植物志》第 61 卷 (1992) p.136 女贞属 Ligustrum 属级（iplant 数据端点全文） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfrps.ashx?key=Ligustrum（frpslink「第61卷 (1992) >> 136页」） | 2026-09-22 | 「9．女贞属——Ligustrum Linn.」「落叶或常绿、半常绿的灌木、小乔木或乔木。**叶对生，单叶，叶片纸质或革质，全缘；具叶柄。**聚伞花序常排列成圆锥花序，多顶生于小枝顶端，稀腋生；花两性；……**花冠白色**，近辐状、漏斗状或高脚碟状，花冠管长于裂片或近等长，裂片4枚，花蕾时呈镊合状排列；雄蕊2枚，着生于近花冠管喉部，内藏或伸出……**果为浆果状核果**，内果皮膜质或纸质……」「约45种……我国产29种，1亚种，9变种，1变型，其中2种系栽培」 |
| 4 | Flora of China Vol.15 9. Ligustrum Linnaeus 属级（iplant 数据端点全文） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfoc.ashx?key=Ligustrum | 2026-09-22 | "Shrubs or small trees, deciduous or evergreen. **Leaves opposite, simple, short petiolate; leaf blade entire.** Inflorescences terminal panicles of cymes, rarely lateral. Flowers bisexual……**Corolla white, rotate, funnelform, or salverform, 4-lobed**……Stamens 2, inserted at mouth of corolla tube, included or exserted……**Fruit a berrylike drupe** with membranous or papery endocarp" |
| 5 | 《中国植物志》第 61 卷 (1992) p.151 日本女贞 Ligustrum japonicum（iplant 数据端点全文） | 植物学文献 | 数据端点 https://www.iplant.cn/ashx/getfrps.ashx?key=Ligustrum%20japonicum（frpslink「第61卷 (1992) >> 151页」） | 2026-09-22 | 「14. 日本女贞（中国树木分类学）图版42: 4-6　Ligustrum japonicum Thunb.……」「**大型常绿灌木，高3-5米，无毛。**……叶片**厚革质，椭圆形或宽卵状椭圆形，稀卵形，长5-8（-10）厘米，宽2.5-5厘米**，先端锐尖或渐尖，基部楔形、宽楔形至圆形，叶缘平或微反卷，上面深绿色，光亮，**下面黄绿色**，具不明显腺点……圆锥花序塔形……**花冠长5-6毫米，花冠管长3-3.5毫米，裂片与花冠管近等长或稍短，长2.5-3毫米，先端稍内折，盔状；雄蕊伸出花冠管外**……**果长圆形或椭圆形，长8-10毫米，宽6-7毫米**，直立，呈紫黑色，外被白粉。花期6月，果期11月。」（近缘差分原句全文；FRPS 女贞条目裁定句见 [1]） |
| 6 | GBIF Backbone Taxonomy（结构化检索） | 数据库 | https://api.gbif.org/v1/species/search?q=Ligustrum%20lucidum&rank=SPECIES&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c | 2026-09-22 | Ligustrum lucidum W.T.Aiton ｜ taxonomicStatus: **ACCEPTED**（另两条 hort./Buch.-Ham. 异名 DOUBTFUL/SYNONYM 记档） |
| 7 | NC State Extension Gardener Plant Toolbox — Ligustrum lucidum（Glossy Privet）（大学园艺系库，curl 原始 HTML 提取） | 园艺官方 | https://plants.ces.ncsu.edu/plants/ligustrum-lucidum/ | 2026-09-22 | "broadleaf evergreen shrub in the olive (Oleaceae) family native to southern China and Korea"；"Height: 15 ft. 0 in. - 50 ft. 0 in. Width: 8 ft. 0 in. - 15 ft. 0 in."；"usually grows as a shrub 12 to 15 feet tall, but if trained as a tree could grow to 30 feet tall"；"The dark green leaves are **glossy, pointed and opposite**"；"Leaves are glossy, green, opposite, simple, **coriaceous**, with 6 to 8 pairs of lateral veins that are **sunken on the undersurface**.……Leaf Length: 3-6 inches；Leaf Shape: Lanceolate Ovate；Leaf Margin: Entire；Leaf Arrangement: Opposite；Stem Lenticels: Conspicuous"；"blooms in late spring to early summer and has small, creamy white flowers"；"**Fruits are 1/4-inch, semi-fleshy, olive-like drupes that are blue-black. They persist into winter.**"；"It is not as cold-hardy as Japanese privet (Ligustrum japonicum)"（L. japonicum 独立种并列佐证） |
| 8 | iPlant.cn 物种信息卡 Ligustrum lucidum（俗名字段） | 聚合器 | https://www.iplant.cn/info/Ligustrum%20lucidum | 2026-09-22 | 「俗名：**大叶女贞**、冬青、落叶女贞」（苗市俗名口径记档用；非分类学承重源） |
| 9 | 任务书（用户提供） | 用户提供 | tasks/011.11-ligustrum.md + 主代理派遣指令（本会话） | 2026-09-22 | 使用语境（长江以南城市绿化主力、族量级锚 ≈8m）、D34 证据中档注记、十一项重点调研面（种定名/常绿表达/革质叶/花/核果/冠形体量/树皮/枝姿/叶色）、近缘排除名单（L. japonicum）、照片纪律 |
| 10 | iNaturalist research-grade 真实照片（直接视觉证据；本地副本 ref-ligustrum-*.jpg 18 张不入 git；taxon 77740 = Ligustrum lucidum species，2026-09-22 经 /taxa/search.json 确认 active；检索 www.inaturalist.org/observations.json taxon_id=77740 quality_grade=research photos=true——中国池 place_id=6903 100 obs + 世界池 order_by=votes 100 obs；**全部 18 张经两次独立中性视觉提问（GLM-4.5V），承重主张双问一致方入库；分歧处置见检索备注**） | 真实照片 | 照片页 https://www.inaturalist.org/photos/<id>；原图 https://inaturalist-open-data.s3.amazonaws.com/photos/<id>/original.jpg（17/18 original 直下、1 张 large 回退；PIL 全量解码验证） | 2026-09-22 | 见下「照片来源明细」 |

### 照片来源明细（来源 [10] 展开）

| 槽位 | 文件 | photo id | obs id | 日期 | 地点 | 许可 | 原图 URL | 判读摘要（中性描述，不含树种名）+ 双问结果 |
|------|------|----------|--------|------|------|------|----------|----------------------------------|
| form-cn | ref-ligustrum-form-cn.jpg | 601186940 | 331402416 | 2025-12-19 | 杭州植物园（浙江） | CC-BY-NC | S3 original.jpg | 整树（构图先验通过）：单干、干基可见、**卵圆-广卵冠**、冠幅比 0.8–0.9、分枝点 ≈0.3、12 月满叶浓绿（背景落叶对照）、树高 ≈6–7m、干浅灰-灰褐细纹——双问一致 ✅✅ |
| form-d | ref-ligustrum-form-d.jpg | 469342560 | 261264472 | 2025-02-03 | UNC Greensboro 校园（美国北卡） | CC-BY-NC | S3 original.jpg | 整树（构图先验通过）：单干、**broad-ovate 冠**、0.8、分枝 0.3、2 月深冬满叶常绿、树高 ≈8m、皮浅色细纹、空隙 ≈10%——双问一致 ✅✅ |
| form-a | ref-ligustrum-form-a.jpg | 32590526 | 21089657 | 2019-03-09 | Austin 科罗拉多河畔（美国德州） | CC-BY-NC | S3 original.jpg | 河畔树（**构图不完整**：顶部截断+干基遮挡——不承重干结构与冠比）；承重：3 月满叶常绿 + 满冠**紫黑浆果下垂簇**（每簇数十果）、冠面开展不规则（开展端读向 1.0–1.2）、中角分枝——承重项双问一致；干结构两问分歧（单干隐约 vs 丛生）记档 ⚠ |
| form-b | ref-ligustrum-form-b.jpg | 51782077 | 32991205 | 2019-08-21 | Austin 林地（美国德州） | CC-BY-NC | S3 original.jpg | 林地个体（**构图不完整**：上部截断——不承重冠形）；承重：**双干低分歧 + 基部萌条**（丛生端样本）、皮灰褐近光滑、8 月满叶——承重项双问一致；全树可见性两问分歧记档 ⚠ |
| form-c→fruit-d | ref-ligustrum-form-c.jpg | 434378728 | 243589868 | 2024-09-22 | Puerto Madero 布宜诺斯艾利斯（阿根廷） | CC-BY | S3 original.jpeg | 判读为**带果枝条非整树**（双问一致改判槽位）：背景单干可见、常绿革质光泽叶 + **暗紫黑宿存果簇**（南半球 9 月早春 = 越冬宿存果）——双问一致 ✅✅ |
| canopy-a | ref-ligustrum-canopy-a.jpg | 255780035 | 148520716 | 2022-12-07 | 皇藏峪国家森林公园（安徽宿州） | CC-BY-NC | S3 original.jpg | 冬季林冠仰视：**邻树皆裸而中央冠满密深绿**（常绿直接证据）、绿色覆盖 85–95%、空隙 5–10%、**离散大团块 0.5–1m 级（≈1/4–1/5 冠宽）**——双问一致 ✅✅（中国语境常绿密度锚） |
| canopy-b | ref-ligustrum-canopy-b.jpg | 171691663 | 102676917 | 2021-12-07 | San Jose 街区（美国加州） | CC-BY-NC | S3 original.jpg | 12 月街冠：**深绿冠内挂暗紫黑果簇**（每簇 20–50）、覆盖 85–90%/空隙 10–15%、团块 1/6–1/8 冠宽、**街距叶面光泽可读**、圆头轮廓——双问一致 ✅✅ |
| leaf-a | ref-ligustrum-leaf-a.jpg | 15099769 | 10790222 | 2018-04-11 | Travis County（美国德州） | CC-BY | S3 original.jpeg | 手持叶特写：**椭圆-披针形、全缘、锐尖、革质**、侧脉 5–7 对**细弱弧曲不显**、**对生**排列 + 顶芽单叶、**下面浅绿**、柄短（≈1/10 叶长）、此样本光泽读向半光泽（背光手持）——双问一致 ✅✅（照片尺寸估计仅定性记档） |
| leaf-b | ref-ligustrum-leaf-b.jpg | 607945323 | 334737584 | 2025-12-27 | 始丰湖国家湿地公园（浙江天台） | CC-BY-NC | S3 original.jpg | 枝叶特写：**卵-宽椭圆、全缘平坦、渐尖、深绿强光泽（"high-gloss polished"）**、叶背淡绿读向、枝端暗色芽体——双问一致于光泽/形/缘；**叶序两问分歧（opposite vs alternate）→ 本片不承重叶序** ⚠ |
| leaf-winter | ref-ligustrum-leaf-winter.jpg | 698792994 | 381905201 | 2026-01-14 | 武汉洪山区（湖北） | CC-BY-NC | S3 original.jpg | **1 月枝叶浓绿健壮**（中国长江流域冬季绿叶相直接证据）、叶 8–12cm、具光泽、**对生（数出 4–5 组叶对）**、地面落叶/休眠背景——双问一致 ✅✅ |
| flower-a | ref-ligustrum-flower-a.jpg | 285807127 | 165129947 | 2023-06-02 | 东湖绿道（湖北武汉） | CC-BY-NC | S3 original.jpg | 盛花期枝序：**金字塔形顶生圆锥花序、长于叶片**、乳白-白 4 瓣、小花密集、盛花覆盖冠面 10–30%、背景深绿革质叶、红砖墙城市语境——双问一致 ✅✅（花轴唯一承重照片） |
| flower-b | ref-ligustrum-flower-b.jpg | 279548523 | 161717224 | 2023-05-15 | 公园路（江西赣州） | CC-BY-NC | S3 original.jpg | 5 月树冠侧视：**无花可见**（改判冠面观察照）：深绿光泽叶 + **枝端红铜-古铜色新叶**（新梢红调单源信号）、细枝绿褐——双问一致（内容=无花冠面）✅✅；**花主张不承重**（原槽位预期未命中，记档） |
| fruit-a | ref-ligustrum-fruit-a.jpg | 62696099 | 39511841 | 2020-02-27 | Roy G. Guerrero Park（美国德州奥斯汀） | CC-BY-NC | S3 original.jpg | **2 月宿存果**：**肾形（一侧扁/凹）**、**蓝黑被白粉霜（glaucous bloom 显著）**、≈10mm、每簇 40–60、果序自叶腋-枝端**下垂**、宿存于满叶常绿枝——双问一致 ✅✅（果形承重锚） |
| fruit-b | ref-ligustrum-fruit-b.jpg | 220920033 | 129950539 | 2021-10-23 | 沿江大道行道树（湖北黄冈） | CC-BY-NC | S3 original.jpg | 10 月熟果：**紫黑被白粉**、≈6–8mm、**每簇 60–80 果密簇下垂**、叶背残留枯花/果序痕、中国行道语境——颜色/密簇/下垂双问一致；**果形两问读向分歧（椭长 vs 圆）且与 fruit-a 肾形读向有出入 → 本片不承重果形**（形由 fruit-a/c 承重）⚠ |
| fruit-c | ref-ligustrum-fruit-c.jpg | 255455428 | 148353053 | 2022-08-05 | Jardim Esmeralda 街道（巴西圣保罗） | CC-BY-SA | S3 original.jpeg | 8 月盛挂：**肾形 + 白粉 + 蓝黑**、≈8mm、每簇 50–70、**下垂悬挂**、深绿革质光泽叶同屏——双问一致 ✅✅（南半球冬季=果盛期互证） |
| fruit-unripe | ref-ligustrum-fruit-unripe.jpg | 735857150 | 400948579 | 2026-09-17 | 南京新河街（江苏） | CC-BY-NC | S3 **large 回退**（original 全扩展名 404） | 9 月中未熟果：**绿-白绿色未熟**、**肾形**、≈7mm、**宽分枝圆锥果序顶生**、绿柄-紫轴、深绿光泽叶、街道语境——双问一致 ✅✅（色序起点锚 + 主语境时点态） |
| bark-a | ref-ligustrum-bark-a.jpg | 220920059 | 129950539 | 2021-10-23 | 沿江大道行道树（湖北黄冈） | CC-BY-NC | S3 original.jpg | 主干皮（中国行道语境）：**灰褐、细窄脊 + 浅沟、纵行大体平行（少量横向连接）、细纹浅色槭树状质感**、成熟段、无深沟无剥落——双问一致 ✅✅ |
| bark-b | ref-ligustrum-bark-b.jpg | 51782092 | 32991205 | 2019-08-21 | Austin（美国德州） | CC-BY-NC | S3 original.jpg | 干+冠：**浅灰-灰褐细鳞片状微翘纹理、纵裂轻微**、分枝点 ≈0.3、圆头密冠满叶——双问一致 ✅✅ |

## 域扩展节：plant

（字段定义见 `.zcode/skills/asset-research/references/plant-schema.md` v0.2）

### A. 干与枝

- `trunk_height_ratio`：≈0.30（form-cn / form-d / bark-b 三样本双问一致 [10]）
  - Form: Range | Evidence Status: Inferred | Source: [10]
- `trunk_taper_ratio`：Unknown（无近距标定）
  - Form: Unknown | Evidence Status: Unknown
- `basal_flare_ratio`：Unknown（form-cn 干基可见但不可定量）
  - Form: Unknown | Evidence Status: Unknown
- `trunk_lean_angle`：近直立（form-cn/form-d 单干直立读向 [10]）
  - Form: Qualitative | Evidence Status: Inferred | Source: [10]
- `branching_levels`：≥3 级（弱单源 [10]）
  - Form: Range | Evidence Status: Inferred | Source: [10]
- `scaffold_branch_count`：Unknown（整树照片未计数判读）
  - Form: Unknown | Evidence Status: Unknown
- `scaffold_angle`：中角（30–60° 对铅垂；form-a/cn/d 双问 medium [10]）；定量 Unknown
  - Form: Qualitative / Unknown | Evidence Status: Inferred（定性）/ Unknown（定量）| Source: [10]
- `branch_orientation`：**叶-枝对生体系**（叶对生属级 [3][4] + 照片 [10]）；骨架枝排列 Unknown（照片未见可判轮生/螺旋模式）
  - Form: Qualitative + Unknown | Evidence Status: Verified（叶对生）/ Unknown（骨架排列）| Source: [3][4][10]
- `branch_length_decay` / `branch_radius_decay` / `branch_attachment_t` / `allometry_exponent`：Unknown（与先例同缺口，不伪造）
  - Form: Unknown | Evidence Status: Unknown
- `apical_dominance`：中庸-弱（卵圆冠顶部圆钝、无强领导枝读向 [10]）
  - Form: Qualitative | Evidence Status: Inferred | Source: [10]
- `branch_curvature`：骨架枝中角外斜、末级枝外斜-稍下垂（果序重压下垂显著 [10]）；非下垂枝型
  - Form: Qualitative | Evidence Status: Inferred | Source: [10]

### B. 叶与冠

- `leaf_attachment_rule`：**单叶对生于枝**（属级「叶对生」[3][4]；leaf-a/leaf-winter 双问 [10]）；叶集中于末级枝外段（canopy 读向）
  - Form: Qualitative | Evidence Status: Verified（对生）/ Inferred（外段集中）| Source: [3][4][10]
- `leaf_cluster_density`：Unknown（定性：末级枝叶量中-高密观感 Inferred [10]）
  - Form: Unknown | Evidence Status: Unknown（定性部分 Inferred）| Source: [10]
- `clump_scale`：冠面团块 ≈1/6–1/4 冠宽（canopy-a 1/4–1/5 大团块 / canopy-b 1/6–1/8 [10]——**较香樟 1/8–1/10 团块略大读向**）
  - Form: Relative | Evidence Status: Inferred | Source: [10]
- `leaf_orientation_dist`：Unknown（未做朝向判读；冠面光泽斑驳暗示叶面多向受光）
  - Form: Unknown | Evidence Status: Unknown
- `leaf_size`：6–17 × 3–8cm（FRPS/FOC 逐字一致 [1][2]）；典型单叶 ≈8–12 × 3.5–6cm（照片交叉 [10]）
  - Form: Range | Evidence Status: Verified | Source: [1][2][7][10]
- `leaf_aspect_ratio`：≈1.7–2.8（文献域 6–17/3–8 推算 + 照片椭圆-卵形读向）
  - Form: Range | Evidence Status: Verified（文献推算）| Source: [1][10]
- `crown_transparency`：**空隙 ≈5–15%（高密常绿档）**（canopy-a 5–10% / canopy-b 10–15% [10]；与香樟 10–15% 同档）
  - Form: Relative | Evidence Status: Inferred（等级判读）/ Verified（冬季满密读向本身四样木）| Source: [10]
- `crown_fill_gradient`：外密内疏（团块外壳 + 冠内偶见空细枝 [10]，弱二源）
  - Form: Qualitative | Evidence Status: Inferred | Source: [10]
- **叶形组（挂点语言核心，对生单叶全缘首例）**：单叶对生、卵形-长卵形-椭圆形-宽椭圆形 6–17 × 3–8cm、先端锐尖-渐尖、基部圆形-宽楔形、**全缘平坦**、革质上面光亮/下面淡绿、侧脉 4–9 对不显、叶柄 1–3cm 具沟——**vs 香樟：同为全缘革质光泽单叶，差分 = 对生（樟互生）+ 卵形端更宽 + 脉细弱不显（樟离基三出粗显）+ 缘平坦（樟软骨缘微波）+ 背面无粉感（樟 glaucous）**
  - Form: Qualitative + Range | Evidence Status: Verified | Source: [1][2][3][7][10]
- **果序形态组（挂点附属物）**：顶生圆锥果序（花后膨大）8–20 × 8–25cm 级、每序数十果（20–80 [10]）、肾形核果 7–10 × 4–6mm 蓝黑被白粉、熟果下垂满冠、果期 7 月至翌年 5 月——**建模判定建议：做**（§5）
  - Form: Range + Qualitative | Evidence Status: Verified | Source: [1][2][7][10]
- **花序形态组（挂点附属物二）**：顶生圆锥花序 8–20 × 8–25cm 白色、花冠 4–5mm 4 裂反折、花期 5–7 月——**建模判定建议：主相不做、可选低频变体档**（§5）
  - Form: Range + Qualitative | Evidence Status: Verified | Source: [1][2][3][10]

### C. 表皮与芽

- `bark_archetype`：**细浅纵纹-细鳞型（低浮雕、无剥落）**——灰褐-浅灰褐基调；中龄即细窄脊浅沟（bark-a 中国行道 [10]）、幼-中龄细鳞微翘（bark-b [10]）；FRPS 仅「灰褐色」无裂型句 [1]——**志书裂型缺失，照片双样本承托（弱项记档）**；**vs 樟深纵裂：女贞浅一档；vs 白蜡幼干近光滑：相近但女贞皮孔在枝不在干**
  - Form: Qualitative | Evidence Status: Verified（灰褐色 [1]）/ Inferred（裂型照片双样本 [10]）
  - Source: [1][10]
- `bark_color`：灰褐（志书 [1]）；浅灰-灰褐（照片 [10]）；沟浅脊浅对比弱（vs 樟脊宽沟深对比显著）
  - Form: Qualitative | Evidence Status: Verified / Inferred | Source: [1][10]
- `bark_relief`：**低**（细窄脊 + 浅沟；「fine maple-like texture」[10]——vs 樟中-强浮雕）
  - Form: Relative | Evidence Status: Inferred | Source: [10]
- `bark_epiphytes`：未见显著苔藓/地衣（bark-a/b [10]）——阴性弱记（不承重）
  - Form: Qualitative | Evidence Status: Inferred（弱）| Source: [10]
- `twig_surface`：**「枝黄褐色、灰色或紫红色，圆柱形，疏生圆形或长圆形皮孔」（FRPS [1]）**；NC State "Stem Lenticels: Conspicuous" [7]；照片新梢绿褐-红铜调 [10]
  - Form: Qualitative | Evidence Status: Verified | Source: [1][7][10]
- `bud_aspect`：Unknown（FRPS 种级无芽描述；常绿冬芽近景证据天然少——单问弱读「reniform dark bud」[10] 不承重）
  - Form: Unknown | Evidence Status: Unknown

## 检索与证据备注

- 网络可达性（2026-09-22 本机）：**iplant.cn 数据端点全链可达**——FRPS 女贞（key=Ligustrum lucidum，7464B，frpslink「第61卷 (1992) >> 153页」**任务书 D34 锚 FRPS 61:153 核实属实**）+ FRPS 日本女贞（61:151）+ FRPS 女贞属（61:136）+ FOC 种级/属级共 5 端点全文。**FOC key=Ligustrum japonicum 被端点模糊匹配至台湾女贞 L. amamianum（Koidzumi）**——FOC 中国范围内无 japonicum 本尊独立条目（该种为日本-琉球分布），近缘差分全文取 **FRPS 61:151**（日本女贞有完整 FRPS 条目）+ NC State 园艺侧独立种并列佐证，处置记档。GBIF API 可达（ACCEPTED）。**NC State Extension 有完整条目**（与白蜡树调研时 NC 无条目相反——本树园艺轴由 NC State 承担）；**OSU Landscape Plants 无条目**（slug 404，园艺轴单库记档）。Wikipedia 未用；WebSearch 未用。
- iNat 链路：taxa/search.json 确认 **taxon 77740 = Ligustrum lucidum species（active）**；检索 taxon_id=77740（species 精确位，**不含种下与近缘混入路径**——检索池内无 japonicum/sinense/quihoui/compactum 条目，照片判读亦未见引入栽培混淆个体）；中国池（place_id=6903）100 obs + 世界池（order_by=votes）100 obs；www.inaturalist.org/observations.json 端点全程稳定。
- 图片获取与校验：51 张 medium 快筛（PIL 验证）→ 17 槽位 original 下载：首轮 11/17 直下成功，6 张传输截断（26–178 字节级，与先例同型）→ **original 重试修复 5 张 + large 回退 1 张（fruit-unripe，original 全扩展名 404）**；后补 form-d 1 张直下成功——**终态 18/18 PIL 全量解码验证通过、长边 ≤2000px 转存**。
- 判读架构：**GLM-4.5V（mcp__4_5v_mcp__analyze_image）S3 medium 直链**（约 40 次判读调用全程稳定无退化；小批量纪律执行）；本地 contact sheet 经 Read→CDN 转存 URL 喂 MCP 快筛（sheet 快筛仅做槽位分类不承重——首轮全 ID 标签被误读后改用大序号索引修复）；**承重照片全部执行两次独立中性提问（photo-verification.md §1 双问一致口径），提问不含树种名**。会话内两次误触 image-search MCP（空参数报错与一次有返回）——返回为水印苗圃照，**URL 权威口径不满足（§3），全数弃用不采**，未进入任何证据链。
- **双问分歧处置记档（三例，均不取折中）**：①leaf-b 叶序两问冲突（opposite vs alternate）→ 该片不承重叶序（叶序由 leaf-a/leaf-winter 双问 + 文献三源承托）；②fruit-b 果形读向（椭长）与 fruit-a/c（肾形）出入 → 该片不承重果形（果形由 fruit-a/c/unripe 三片双问 + 文献双源承托——肾形坐实）；③form-a 干结构两问冲突 + form-b 全树可见性两问冲突 → 两片各自不承重该主张（干结构/冠比由 form-cn/form-d 双通过样本承托）。
- 排除照片记档：obs 102676917（San Jose）另两张判为**幼苗/幼株**（17–19 号快筛位）——幼态不承重整树主张，仅取其冠内果照（canopy-b）；obs 148520716 另一张（255780042）判果簇过曝——取 255780035（canopy-a）；obs 21089657 另两张（32590535/32590549）与 form-a 同 obs 重复视角；obs 129950539 第三张（220920076）皮特写分辨率弱——取 220920059。
- 尺度结构事实优先级执行：树高/叶/叶柄/花序/花冠/果/果期/物候/小枝/皮孔/树皮色全部以 FRPS 61:153 + FOC Vol.15 原句为准（frpslink 页码锚核对：153 女贞 / 151 日本女贞 / 136 属级）；japonicum 差分数值取 FRPS 61:151 原句；园艺轴（NC State 栽培体量/光泽/脉凹陷/宿存）仅作交叉侧证；照片轴封顶 Inferred（常绿冬季读向、宿存果照等为照片直接证据如实标注）；照片尺寸估计不承重绝对数值（无标定参照，§5 像素内参照物口径）。

## 结构性缺口（Unknown Gate 相关）

- **中龄典型树高档（D34 中档核心弱项）**：FRPS 仅「高可达 25 米」上限口径、**无典型值直给**（弱于白蜡「高10-12米」级）——中龄 6–10m 域 = NC State 栽培域（4.6–15m）+ 整树照片双样木（6–7m / 8m）推断，**Inferred 如实；slot-0 ≈8m 为建议档，锚点门可裁**。
- **冠形/冠幅比/干高比照片双样木但均栽培语境**：form-cn（植物园）+ form-d（美国校园）——无标定参照（比例靠构图判读）；行道提干修剪相（更高分枝点）无样本，属园艺推断。
- **中国语境中龄主干特写仅 1 张（bark-a 黄冈行道）**：树皮裂型/浮雕为「文献色 + 照片双样本（其一美国）」合并——**建议族门横向对照或验收期补 1 张中国中龄主干特写**（koelreuteria 同型缺口教训）。
- **花轴照片单源承重**：flower-a 一张双问（结构由 FRPS/FOC 双源承托已足）；花建模判定若为「做」，建议补充盛花整树照。
- **芽形态 Unknown**：FRPS 女贞条目无芽描述、照片无冬芽近景——近景冬芽维度缺失，不阻塞（常绿密冠语境芽信号弱）。
- **「大叶女贞」俗名单源**（iPlant 聚合器 [8]）——非承重（身份由 FRPS/FOC/GBIF 承担），记档口径。
- **骨干枝定量**（数量/仰角精确值/衰减比/异速指数/着生区间）：与先例同缺口，不阻塞。
- **新叶红铜调弱单源**：flower-b 单照片（双问一致于片内）——变体轴低频信号，可选。
- 叶背色文献显式句缺失（FRPS 两面无毛句非叶色句）：两面色差 = 照片级 Inferred（leaf-a 双问 + leaf-b 读向）。

## 主代理终审记档（2026-09-22，D26 硬数值独立抽查 + 主代理独立双问照片终审）

**硬数值独立抽查（全过）**：自 iPlant 数据端点独立重拉全文（FRPS 第 61 卷 p.153 种级/变型级/产地/用途/裁定句全文 7464B + FOC Vol.15 种级 Description/Synonym/Habitat/Comment 原文）逐位比对 Spec 转写——**33 项零偏差**：①FRPS「灌木或乔木，高可达 25 米；树皮灰褐色」②「枝黄褐色、灰色或紫红色，圆柱形，疏生圆形或长圆形皮孔」③「叶片常绿，革质，卵形、长卵形或椭圆形至宽椭圆形，长 6-17 厘米，宽 3-8 厘米，先端锐尖至渐尖或钝，基部圆形或近圆形，有时宽楔形或渐狭，叶缘平坦，上面光亮，两面无毛」④「中脉在上面凹入，下面凸起，侧脉 4-9 对，两面稍凸起或有时不明显」⑤「叶柄长 1-3 厘米，上面具沟，无毛」⑥「圆锥花序顶生，长 8-20 厘米，宽 8-25 厘米；花序梗长 0-3 厘米；花序轴及分枝轴无毛，紫色或黄棕色，果时具棱」⑦「花冠长 4-5 毫米，花冠管长 1.5-3 毫米，裂片长 2-2.5 毫米，反折」⑧「果肾形或近肾形，长 7-10 毫米，径 4-6 毫米，深蓝黑色，成熟时呈红黑色，被白粉；果梗长 0-5 毫米」⑨「花期 5-7 月，果期 7 月至翌年 5 月」⑩产地句（长江以南至华南西南、陕西甘肃、海拔 2900m 以下、朝鲜分布、印度尼泊尔栽培）⑪用途句（白蜡虫/女贞子/「植株并可作丁香、桂花的砧木或行道树」D34 锚）⑫裁定句（「L. taquetii ……因其果实为肾形，而 L. japonicum Thunb. 的果实为椭圆形」）⑬异名句「L. japonicum auct. non Thunb. 1784: Rehd. 1934」⑭15b 落叶女贞 f. latifolium 差分句（纸质/披针形/侧脉 7-11 对近垂直）⑮frpslink 页码锚「第 61 卷 (1992) >> 153 页」+ FOC 11 项（"to 25 m"/"Petiole 1-3 cm"/"6-17 × 3-8 cm, leathery or papery"/"primary veins 4-11 on each side of midrib, slightly raised or obscure"/"Panicles terminal, 8-20 × 8-25 cm; rachis angular in fruit"/"Corolla 4-5 mm; tube ca. as long as lobes"/"Stamens approaching apex"/"reniform or nearly so, 7-10 × 4-6 mm"/"Fl. May-Jul, fr. Jul-May"/Comment 两变型脉数裁定/16 省域）——**全部逐字吻合，无转写偏差**。

**照片终审（主代理独立双问，Read→CDN 转存通道 6 张承重照片；双问不一致即不承重处置）**：

| 照片 | 主代理双问结论 | 与调研稿比对 | 裁定 |
|---|---|---|---|
| **form-cn** | **两问一致判「局部果枝照」**：仅中上部枝条入画、无干基无树顶、完整树冠轮廓不可判；叶黄绿秋末相 + 紫黑簇生下垂果实满枝（果相承重部分与调研稿一致） | **矛盾**——调研稿记「整树构图先验通过：单干、卵圆-广卵冠 0.8–0.9、分枝 0.3、≈6–7m」 | **否证**：整树主张（冠形/冠幅比/干高比/树高/单干）全部**不承重**；降级为果相+秋末绿叶参考照 |
| form-d | 完整树（干基到树顶全入画）、**单干**、卵圆-广卵冠（中下部最宽上收顶钝）、**冠幅比 0.75–0.85**、**分枝点 ≈0.30**、树高 **≈8m（三层砖楼参照）**、**冬季满叶常绿**（背景枯草+裸枝落叶树）、覆盖 88–93%/空隙 7–12%、团块 ≈1/6–1/8 冠宽、干灰褐-浅灰细纵浅纹、中龄 | 一致（0.8/0.3/≈8m/满叶/细纹干） | **通过**——升为**唯一整树锚**（双系统一致） |
| canopy-a | 落叶树裸枝背景中**中央树冠满密常绿深绿**（常绿直接证据成立）、覆盖 ≈90%、空隙 5–15%、大团块 1/6–1/4 冠宽、远距中景 | 一致（85–95%/5–10% 域内） | **通过**——中国冬季常绿密度锚坐实 |
| leaf-a | **对生成对 + 顶芽单叶**、椭圆-披针全缘锐尖、革质光亮、侧脉细弱不显、**下面浅绿** | 一致 | **通过**——叶形 + 对生叶序锚坐实 |
| leaf-winter | 1 月**浓绿健壮有光泽**（地面落叶休眠背景）、**对生 4–5 组可数**、8–12cm | 一致（另见叶缘零星虫咬微缺刻——不影响全缘判定，生物损伤非形态） | **通过**——中国冬季常绿 + 对生锚坐实 |
| fruit-a | **肾形（一侧扁/凹）**、蓝黑**被白粉霜**、下垂密簇 40+、2 月宿存于满叶常绿枝 | 一致 | **通过**——果形 + 果相锚坐实 |
| bark-a | 灰褐、**细窄纵脊 + 浅沟大体平行**、低浮雕、无深沟无剥落无厚脊、干中下段成熟皮 | 一致 | **通过**——树皮语言锚坐实 |

**终审裁决（消费口径修正与确认，正文 §3 证据基础以本节为准）**：

1. **form-cn 整树主张否证**（双问不一致即不承重、不取折中——photo-verification §1）：§3「冠形 / 冠幅比 / 干高比」与 §2 树高双样木中 form-cn 一支撤除——**修正后证据基础 = form-d 单样木主锚（冠幅比 0.75–0.85 / 分枝 0.30 / ≈8m，双系统一致）+ canopy-b 圆头轮廓侧证 + bark-b 分枝点 0.3 侧证**；整树由双样木降为「单整树样木 + 两侧证」——档位维持 Inferred 如实记（样木量有限不升格）。冠形「卵圆-广卵」结论本身经 form-d 双系统一致确认，**方向不变、置信微降**。
2. **树高锚维持 ≈8m / 主域 6–10m**：form-d ≈8m（建筑参照、双系统一致）+ NC State 栽培域 4.6–15.2m + form-a 量级侧证——锚点依据仍足（弱于白蜡志书直给级，D34 中档口径如实）。
3. **承重结构链确认**（消费读向）：对生单叶全缘革质光亮（leaf-a + leaf-winter + 属级三源）+ 常绿满密冬相（canopy-a + form-d + leaf-winter 三点）+ 肾形白粉蓝黑核果满冠下垂簇（fruit-a + 文献双源）+ 灰褐细浅纵纹树皮（bark-a + form-d 干读向）+ 卵圆-广卵单干中低分枝冠（form-d）——与香樟（互生 + 离基三出脉 + 深纵裂 + 粉背）语言分化清晰。
4. **花轴单源提醒**：flower-a 未入本次终审（花建模判定建议为「不做」，单源不承重阻断）；若后续族门或变体档需要花的表达，须先补盛花整树照。
5. **果簇密度数值采信口径**：每簇 40–80 果为照片判读量级（fruit-a 40+/fruit-b 60–80/fruit-c 50–70），绝对数值不承重（无标定），建模取「数十果/序」量级即可。

**终审结论**：Spec 1.0 **通过**（硬数值 33 项零偏差 + 承重照片 5/6 双问通过、1 张按规程否证降级并修正证据基础）。开发 Agent 可开工；Step 1 消费以本节修正后口径为准。
