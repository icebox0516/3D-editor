# platanus Reference Spec

Spec Version: 1.0
Domain: plant
Asset: platanus（悬铃木）
Updated: 2026-09-20

> 关键事实统一写法（各节内联、逐条标注；Source 填来源表编号）：
> Form ∈ {Value, Range, Relative, Qualitative}；Evidence Status ∈ {Verified, Inferred, Unknown}。
> 工程预算（面数/LOD 阈值）不进本文件，归任务书。真实照片本地副本为 `screenshots/ref-tmp/` 下 ref-platanus-*.jpg（不入 git、不进 Runtime）。

## 1. 身份

悬铃木科（Platanaceae）悬铃木属（Platanus）**落叶大乔木**，单属 8–11 种，中国三种（二球/三球/一球）**全部为栽培引入、通常作行道树**（FOC 属级原句 "All three species in China are cultivated, usually as street trees"）[4]。使用语境：中国/世界温带城市公园与行道落叶乔木；本资产服务中距离为主的园区可视化，近景（数米）材质细节需可信，目标龄级锚 = **中龄公园典型单干二球悬铃木**，夏季生长季观感（与夏栎 ≈8m、银杏 8.17m、朴树 ≈8.5m 同语境混植——体量对照见 §2 末条）。秋色黄褐/落叶不建模（记档见 §6）。

- 种定名（重点问题）：**二球悬铃木 Platanus × acerifolia (Ait.) Willd.**（FRPS 学名行 "Platanus × acerifolia (P. orientatis × occidentatis) (Ait.) Willd. Sp. Pl. 4: 474, 1797"，志书原文排印如此），FRPS 第 35(2) 卷 (1979) p.120 收录，俗名行「二球悬铃木 **英国梧桐** 陈嵘，中国树木分类学」；FOC Vol.9 (2003) 同收录（编号 200010587）；OSU 记 World Flora Online (2024) 现接受名 Platanus acerifolia（去 × 号），异名 **P. × hispanica**（iNat/欧洲常用）、P. hybrida——生产统一用 **P. × acerifolia** [1][3][8]
  - Form: Value
  - Evidence Status: Verified
  - Source: [1][3][8]
- 杂交起源：**「本种是三球悬铃木 P. orientalis 与一球悬铃木 P. occidentalis 的杂交种，久经栽培，我国东北、华中及华南均有引种」（FRPS 原句）**；FOC Comment："This widely planted tree is either a hybrid between Platanus occidentalis and P. orientalis **or a cultivar of P. orientalis**; the origin has been much discussed but remains uncertain"（杂交 vs 三球驯化品系两说并存）；Wikipedia EN：17 世纪杂交形成（最可能西班牙或法国南部）[1][3][5]
  - Form: Qualitative
  - Evidence Status: Verified（杂交起源志书明文；具体地点 Uncertain 口径照录）
  - Source: [1][3][5]
- **中国城市语境主力 = 二球（重点问题）**：志书系证据——FOC 属级「中国三种均栽培、通常作行道树」+ FRPS 二球「东北、华中及华南均有引种」（三球仅记「据记载我国晋代即已引种。今陕西户县存有古树」[2]、一球「我国北部及中部」[2] 零星口径）；城市流行度证据——Wikipedia EN「a commonly planted tree in cities throughout the temperate regions of the world」「**almost exclusively planted in urban habitats**」+ 纽约市行道树占比 >10%（受限种植名单原因）[5]；zh.wikipedia 二球条目「已成为纽约、巴黎、上海、南京、马德里等城市的象征之一」「非常耐污染，少虫害……十分适合作为城市绿化的行道树种」[6]。一球/三球在中国为少数栽培（志书分布口径），**长江流域/华北城市三者定量占比无可靠数值来源（Unknown 记档）** [1][2][4][5][6]
  - Form: Qualitative
  - Evidence Status: Verified（主力定性）/ Unknown（定量占比）
  - Source: [1][2][4][5][6]
- **「法国梧桐/英国梧桐」俗名口径（重点问题）**：志书系（陈嵘《中国树木分类学》）——二球=**英国梧桐**、三球=**法国梧桐**、一球=美国梧桐 [1][2]；民间系——zh.wikipedia 二球条目「因**在上海法租界首先引入这个树种作为行道树**，故在中国俗称法国梧桐；但它并非原产法国，与梧桐也无亲属关系」[6]——即城市口语「法国梧桐」实际所指多为二球（上海衡山路/淮海路系）。**生产口径：身份 = 二球悬铃木 P. × acerifolia，俗名记英桐（志书系）/法桐（民间系），不做种下分裂**
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][6]
- 落叶性：落叶乔木（FRPS「落叶大乔木」/FOC "Trees deciduous"）[1][3][4]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][3][4]
- 行道树地位与耐受：Wikipedia「very tolerant of atmospheric pollution and root compaction, and for this reason it is a popular urban roadside tree」（维多利亚时代大规模种植抗伦敦煤烟）；NC「It is widely used in urban areas as a street tree and will do well in large yards or parks as a shade tree」；抗炭疽病强于一球（品种选育方向 'Bloodgood' 等）[5][7]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [5][7]
- **行道修剪语境 vs 公园自然冠（重点问题，形态差异记档）**：行道语境常见**抹头修剪（pollard）**——Wikipedia「commonly pollarded — much shorter with stunted, club-like branches, requiring annual repruning」（树体显著变矮、棒状短枝密集）+ 落叶后大抹头疤；**公园自然冠无修剪伤**——本资产锚定**公园自然冠**（form 系四样木均自然冠，照片 [9]）。两种语境形态根本不同：pollard 相不进生产、记变体档（§6）
  - Form: Qualitative
  - Evidence Status: Verified（pollard 文献）/ Inferred（公园自然冠照片锚定）
  - Source: [5][9]

## 2. 主要尺度

- 物种上限树高：**「落叶大乔木，高30余米」（FRPS 原句）**；FOC "Trees deciduous, to 30 m tall"；Wikipedia「growing 20–40 m (65–130 ft), **exceptionally to 50 m**, with a trunk up to 10 m in circumference」[1][3][5]
  - Form: Value
  - Evidence Status: Verified
  - Source: [1][3][5]
- 栽培成熟域：NC「**It may grow to a height of 70 to 100 feet tall and 60 to 75 feet wide**」≈ 21–30m 高 × 18–23m 宽；OSU「Broadleaf deciduous tree, 70-100 ft (21-30 m)」——合并 **21–30m 高 × 18–23m 宽**（冠幅比 ≈0.6–0.75 与 §3 照片判读一致）[7][8]
  - Form: Range
  - Evidence Status: Verified
  - Source: [7][8]
- **中龄公园个体（目标龄级锚，重点问题）**：无权威文献直接数值。**照片带尺度样木**：form-a（瑞士 Kaiseraugst 2026-08，行人 ≈1.7m 参照）双系统判高 **≈12–14m**、判相「semi-mature（半成熟）」；form-d（比利时 2026-10，行人参照）≈14–16m；form-b（塞瓦斯托波尔 2026-04，行人+长椅参照）≈15–18m（成熟）；form-c（南非 2026-04 南半球夏末，行人+汽车+栅栏参照）≈18–22m（成熟）。推断：**中龄公园典型单干个体 ≈12–14m（照片实测域），成熟公园大树 15–22m**；悬铃木为速生大乔木，**中龄个体显著大于先例锚**（夏栎 ≈8m、银杏 8.17m、朴树 ≈8.5m）——同体量混植需取更年轻个体（≈8–10m 域内无直接样木，Inferred）或接受悬铃木为上层大乔突出量级（≈12–14m，照片实测）；按冠幅比 0.6–0.75 对应 12–14m 个体冠幅 ≈8–10m [9]
  - Form: Range
  - Evidence Status: Inferred（照片带尺度实测 12–14m 双系统一致 + 栽培域交叉）
  - Source: [7][8][9]
- 叶片（阔卵形宽>长口径）：**「叶阔卵形，宽12-25厘米，长10-24厘米」（FRPS 原句）**；FOC "leaf blade broadly ovate, 12–25 × 10–24 cm"；OSU "15-18 cm x 20-25 cm"（长×宽序）；照片实测（标尺两源 + 枝系读数）：leaf-a 17–20 宽 × 14–16 长 / leaf-c 16–19 宽 × 13–15 长（标尺）/ shoot-a 18–22 宽 × 15–18 长——**合并建模域宽 15–22cm × 长 12–18cm，宽>长** [1][3][8][9]
  - Form: Range
  - Evidence Status: Verified（文献）/ Inferred（照片实测）
  - Source: [1][3][8][9]
- 叶柄：**「叶柄长3-10厘米，密生黄褐色毛被」（FRPS 原句）**；FOC "petiole 3–10 cm, densely yellow-brown pubescent"；NC "2 to 4 inches"（≈5–10cm）；照片实测柄长 ≈0.8–1.1 × 叶宽（≈8–18cm 域，大叶配长柄）——**柄长与叶宽同量级** [1][3][7][9]
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][3][7][9]
- **叶柄下芽（身份特征，重点问题）**：FOC 科级原句「**Terminal buds absent; lateral buds ovoid, slightly acute at apex, enclosed by a separate scale at base of petiole**」+「**petiole long, usually enclosing axillary bud at base**」——无顶芽（假二叉分枝的结构根源）、侧芽卵形被叶柄基部包裹（叶柄下芽）；FOC 属级 P. kerrii 段反向佐证「the petiole base does not enclose the axillary bud」为该种例外——**叶柄包芽为悬铃木科通征**，近景叶基建模口径（叶柄基部扩大的喇叭口托住腋芽）[4]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [4]
- 托叶：长约 1–1.5cm、基部鞘状上部开裂（FRPS「托叶中等大，长约1-1.5厘米，基部鞘状，上部开裂」；FOC "Stipules 1–1.5 cm"；OSU 同）——生长期早落，夏季成枝不可见（记档）[1][3][8]
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][3][8]
- 头状果序：**「果枝有头状果序1-2个，稀为3个，常下垂；头状果序直径约2.5厘米，宿存花柱长2-3毫米，刺状」（FRPS 原句）**；FOC "Fruiting branchlets with (1 or)2(or 3) infructescences. Infructescence capitate, ca. 2.5 cm in diam."；Wikipedia「one to three (most often two) dense spherical inflorescences on a pendulous stem」（果约 6 个月成熟，冬末春初陆续散籽）；照片标尺实测 fruit-c **2.5–2.8cm**、估读 shoot-a/fruit-a 2.5–3cm——**「二球」名源确认：典型 2 个一串**（vs 三球 3–5 个 [2]、一球单生 [2]）[1][3][5][9]
  - Form: Value + Range
  - Evidence Status: Verified（文献 + 标尺照片）
  - Source: [1][3][5][9]
- **夏季宿存果序可见性与建模判定（重点问题）**：FOC "**fr. Jun–Oct**"（果期 6–10 月）；照片直接证据三源——shoot-a（**2026-07 意大利生长季盛期**：每梗 2 球、绿褐色、长梗下垂叶下、显著可见）+ fruit-a（2026-10：绿叶仍密、绿褐果球「数米距离显著可见」）+ form-b（2026-04 光秃枝上宿存果球 20–40 个、大多成对、醒目）；NC「The fruits tend to **persist through the winter**」；OSU「they remain on the tree long after leaves have fallen」——**建模判定：宿存球状果序夏季必须建模**（生长季满冠成对果球是悬铃木最强身份信号之一，中距可读、近景清晰；绿褐色径 ≈2.5cm、长梗下垂）[3][7][8][9]
  - Form: Qualitative + Value
  - Evidence Status: Verified（文献果期 + 三季照片 + 双系统交叉）
  - Source: [3][7][8][9]
- 花与物候：花通常 4 数、雌雄同株、聚成圆球形头状花序（雄球黄、雌球红，NC）；**花期 3–5 月、果期 6–10 月**（FOC "Fl. Mar–May, fr. Jun–Oct"）——本资产夏相不建模花（春相记档）[1][3][7]
  - Form: Qualitative + Range
  - Evidence Status: Verified
  - Source: [1][3][7]
- 生长速率：数值无来源（NC/OSU 页未给 rate 数值）——Unknown 记档；定性：栽培 20 年内可达 12m+（NC/OSU 大尺寸域 + form-a 半成熟 12–14m 推断速生，弱推断）[7][8][9]
  - Form: Unknown
  - Evidence Status: Unknown
  - Source: [7][8][9]

## 3. 轮廓与比例

- 冠形发育序列（重点问题）：**幼年金字塔形 → 成熟开张广展**——NC「generally **pyramidal when young** and becomes **open and spreads with age**」；OSU「open, spreading with age」；品种相佐证（'Metzam'/'Morton Circle'/'Yarwood' pyramidal、'Bloodgood' rounded、'Ovation' broadly pyramidal to rounded——NC）[7][8]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [7][8]
- 中龄公园个体锚定相（重点问题）：**阔卵形-圆头形（broadly ovoid to rounded）、顶部略平、轮廓不规则**——form 系四样木全部判读一致（form-a「broadly ovoid to rounded, slightly irregular」/form-b「广卵形至圆形，顶部略平，边缘不规则」/form-c「阔卵形至广展形，轮廓不规则」/form-d「阔卵形至圆头形」），form-a/b/c 三张双系统交叉同判；FRPS/FOC 无冠形描述（志书形态段不涉冠形）。**建模主相 = 阔卵-圆头自然冠、顶部圆化微平、轮廓不规则** [9]
  - Form: Qualitative
  - Evidence Status: Inferred（四样木照片 + 双系统交叉；无文献冠形句）
  - Source: [9]
- 冠幅/树高比：**≈0.6–0.8（典型 0.65–0.75）**——四样木：form-a 0.65–0.70 / form-b 0.6–0.7 / form-c 0.6–0.7 / form-d 0.7–0.8（落叶相略宽读数），前三张双系统交叉一致；NC 栽培域 60–75ft 宽 / 70–100ft 高 ≈0.6–1.07 取主流段 0.6–0.75——**六资产中偏窄端**（银杏 0.55–0.65 最窄、朴树 0.8–0.9/榉树 0.8–0.95 最宽、樟树 0.7–0.85、夏栎 0.8+），速生高干所致 [7][9]
  - Form: Range
  - Evidence Status: Inferred（照片多样木 + 双系统 + 栽培域交叉）
  - Source: [7][9]
- 主干分枝点高度占比（干高/树高）：≈**0.25–0.35**（form-a 0.25–0.30 / form-b 0.3–0.35 / form-c 0.30–0.35 / form-d ≈0.30 四样木）[9]
  - Form: Range
  - Evidence Status: Inferred
  - Source: [9]
- 主干姿态：**单干通直**——form-b「单一主干，无明显的多头分叉」/form-c「单一主干，主干明显通直」/form-d 单干（双系统判读交叉）；行道语境杯状/抹头修剪会产生人为低分叉（§1 修剪记档，公园自然冠不取）[9]
  - Form: Qualitative
  - Evidence Status: Inferred（照片三样木 + 双系统交叉）
  - Source: [9]
- 主枝着生与开张（重点问题）：**骨架枝 4–7 根（典型 5–6）、斜上开展 35–60°（主流 40–55°）、下部大枝明显向四周平展**——四样木：form-a 5–6 枝 35–55° / form-b 4–6 枝 40–60° / form-c 5–7 枝 35–55° / form-d 5–7 枝 40–60° +「lower limbs spread widely（下部大枝平展）」；NC/OSU「open and spreading with age」同向——**大枝开展姿态 = 斜上至平展的广角语言**（非银杏斜上收敛型）[7][8][9]
  - Form: Range + Qualitative
  - Evidence Status: Inferred（照片四样木 + 双系统）/ Verified（open spreading 园艺 [7][8]）
  - Source: [7][8][9]
- **冠层密度与透光观感（重点问题：大叶疏簇 vs 前例小卡密簇）**：**中-疏密、粗质大叶疏簇**——canopy-a（07 月）逆光空隙 **25–30%** / canopy-b（05 月）**20–25%** / form 系整树 20–30%；叶幕组织 = **末枝簇状团块 ≈1/10–1/15 冠幅、外密内疏、内膛细枝网可见**（canopy 双源 + form-c 同判）；叶质**极粗（coarse）**——大叶（15–22cm）在冠面形成六资产中**最粗质**的冠面纹理（canopy/shoot/form 全系判读一致）；中距**单片叶裂片轮廓不可辨**（canopy-a 判读）——**与朴树/樟树类小叶密簇的细质冠面构成根本分化，悬铃木冠面读向 = 大叶疏簇的粗团块 + 中等透光** [9]
  - Form: Relative + Qualitative
  - Evidence Status: Inferred（双源 + 双系统交叉）
  - Source: [9]
- 内膛枝现象：存在——canopy-a/b「inner branchlets visible」+ form-c 外密内疏（光秃内膛细枝网）[9]
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [9]

## 4. 结构层级

部件树：主干（单干通直）→ 骨架枝（4–7 根斜上-平展广角）→ 二级枝 → **末级延伸枝（互生单叶系统，无短枝距状钉突）** → 叶（掌状裂大叶互生一节一叶）+ 宿存成对球状果序（长梗下垂）。

- **叶着生规则（重点问题，挂点语言核心）**：**互生、一节一叶、节间 3–5cm（≈1–2 叶宽）**——shoot-a（07 月）「互生（一节一叶交替）+ 节间约 3–5 cm + 主枝段 8–10 叶」、shoot-b（05 月）「互生一节一叶 + 节间 3–5cm」双源 + shoot-a 双系统交叉一致；FRPS/FOC 互生口径（FOC 科级 "Leaves alternate"）；**末级枝疏朗通透（sparse and airy）**——大叶沿枝单叶等距排布、非簇生（vs 银杏短枝 3–8 叶莲座簇、朴树/樟树小卡密簇）——**悬铃木挂点语言 = 单叶互生疏排，每挂点 1 叶** [3][4][9]
  - Form: Qualitative + Range
  - Evidence Status: Verified（互生文献）/ Inferred（节间与疏朗照片双源）
  - Source: [3][4][9]
- 叶姿态：叶面对枝轴**近垂直、略前倾**（shoot-a 判读）；大叶在枝上平展摊开、背光下微下垂（fruit-a「果球下垂于叶下方」侧证叶片平展）[9]
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [9]
- **掌状裂数（重点问题）**：**「上部掌状5裂，有时7裂或3裂」（FRPS 原句）**；FOC "(3 or)5(or 7)-lobed"；NC "3 to 5 lobed"；OSU "3-5 lobed"——**5 裂为典型主相**（照片：leaf-a/b/c 三源最清晰叶全部 5 裂、shoot-b「5 裂为主少数 3 裂」）——建模主相 5 裂、变体 3/7 裂记档（§6）[1][3][7][8][9]
  - Form: Value + Range
  - Evidence Status: Verified（文献四源）/ Inferred（5 裂为主照片）
  - Source: [1][3][7][8][9]
- **裂深（重点问题：裂片达叶片何处）**：文献无直接深度数值——FRPS 二球无「深裂」措辞（对照三球 FRPS「**中央裂片深裂过半**」[2]、一球「通常3**浅裂**」[2]）；Wikipedia 定位句「**the leaf being more deeply lobed than P. occidentalis but less so than P. orientalis**」（裂深居亲本之间）[5]；OSU 差分句「lobes of leaves are about as long as wide, whereas the leaf lobes of P. occidentalis are wider than long」（裂片长≈宽 ⇒ 裂深约达叶长之半）[8]；照片实测三源 + 交叉：leaf-a/b/c 与 shoot-b 全部判「**sinus 深入叶缘→叶基距离的 1/3–1/2（主流 ≈1/2）**」——**合并口径：裂深约达叶片中部（1/3–1/2，典型 1/2）**，居一球浅裂与三球深裂过半之间 [5][8][9]
  - Form: Range
  - Evidence Status: Verified（居间定位 [5] + 裂片长≈宽推论 [8]）/ Inferred（1/3–1/2 照片三源 + 交叉）
  - Source: [5][8][9]
- **中央裂片形态（重点问题）**：**「中央裂片阔三角形，宽度与长度约相等」（FRPS 原句）**；FOC "central lobe broadly triangular, as long as wide"；OSU 差分键「central leaf lobe not longer than wide」（属级检索表 vs 三球 longer than wide [4]）；照片 leaf-a/b/c 三源 + leaf-b 双系统交叉全部判「阔三角形宽≈长、先端渐尖（pointed）」——**五源一致**；NC "lobes rounded" 记为裂片整体轮廓圆润口径（与先端渐尖不矛盾，小分歧不修正）[1][3][4][8][9]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][3][4][8][9]
- 裂片边缘齿：**「裂片全缘或有1-2个粗大锯齿」（FRPS 原句）**；FOC "lobes entire or coarsely 1- or 2-dentate at margin"；照片 leaf-a「全缘为主偶 1–2 粗齿」/leaf-b「每裂片 0–2 粗齿」/leaf-c 同判——**疏生粗齿口径：每裂片 0–2 枚、全缘为主**（vs 三球「边缘有少数**裂片状**粗齿」更深的缺刻齿 [2]、一球「数个粗大锯齿」[2]）[1][3][9]
  - Form: Qualitative + Value
  - Evidence Status: Verified
  - Source: [1][3][9]
- 叶脉：**「掌状脉3条，稀为5条，常离基部数毫米，或为基出」（FRPS 原句）**；FOC "principal veins 3(or 5), arising from base or lateral 2(or 4) from midvein above base"——**离基掌状 3 脉为主**（侧脉对自中脉基部数毫米以上发出）——近景叶脉建模口径；叶基**截形或微心形**（FRPS「基部截形或微心形」/FOC "base subcordate or truncate"/照片三源截形）[1][3][9]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][3][9]
- 枝系结构：嫩枝密生灰黄色绒毛、**老枝秃净红褐色**（FRPS「嫩枝密生灰黄色绒毛；老枝秃净，红褐色」；FOC "Young branchlets densely gray-yellow tomentose, old ones red-brown, glabrous"）——近景一年生枝红褐/二年生以上灰黄三分色（vs 银杏淡褐黄→灰）[1][3]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][3]
- 果序着位：**长梗下垂**——FOC 科级「Flowering branchlets leafy only at base, **pendulous at least in fruit**」+ FRPS 二球「果枝……常下垂」+ 照片 shoot-a/fruit-a「果球悬挂于细长梗上下垂于叶下方」——果序垂挂于叶幕下方外缘，中距仰视时果球贴冠底边缘排布 [1][3][4][9]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][3][4][9]
- 分枝层级数：3–4 级可见（form 系 + shoot 系判读；无冬季裸枝专项，置信中）[9]
  - Form: Value
  - Evidence Status: Inferred
  - Source: [9]
- 骨架枝数量：≈4–7 根自主干分出（form-a 5–6 / form-b 4–6 / form-c 5–7 / form-d 5–7 四样木）——与先例（5–8）同量级 [9]
  - Form: Range
  - Evidence Status: Inferred
  - Source: [9]

## 5. 材质与表面

- 树皮类型学（重点问题）：**光滑斑块剥落型——「树皮光滑，大片块状脱落」（FRPS 原句）**；FOC 科级 "bark pale brown, gray, and/or white, **smooth, exfoliating in plates**"——非纵裂脊沟型（夏栎/樟树/银杏族）、非浅裂小块型（朴树）：**干面整体光滑、老皮成大片块状剥离、露出光滑新皮，形成多色并存拼贴** [1][4]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][4]
- **色带组成（重点问题，多源定量）**：文献——FOC 科级「pale brown, gray, and/or white」三色 [4]；OSU「Bark exfoliates and is **cream, olive, light brown**, best asset of the tree」（奶油、橄榄、浅褐——OSU 誉为「本树最佳资产」）[8]；NC「**light brown outer bark exfoliates to reveal a creamy olive inner bark**」[7]；Wikipedia「usually pale grey-green, smooth and exfoliating, or buff-brown and not exfoliating」[5]；照片判读（bark-a/b/c 三源 + form 系五源）：**奶油白/米黄 + 浅黄绿-橄榄绿 + 灰褐 三色带并存**，另少量深褐老斑（沟底色）——**合并口径：新露斑奶油白-浅黄绿、过渡斑灰绿-橄榄、老斑灰褐-深褐，同一干上多代斑块并存形成地图状拼贴** [4][5][7][8][9]
  - Form: Qualitative
  - Evidence Status: Verified（文献三色）/ Inferred（色带分布照片）
  - Source: [4][5][7][8][9]
- **斑块尺度（重点问题，相对干径比例）**：≈**干径的 1/8–1/12**、**地图状不规则大片**——照片七次独立读数：bark-a「1/8–1/10」双系统一致 / bark-b「1/8–1/10」/ bark-c「1/8–1/12」/ form-a/b/c 整树判读「1/8–1/10」交叉一致；剥落方式**大片块状剥落（large plates）为主**、非小碎屑（bark-a/b 双源）[9]
  - Form: Relative
  - Evidence Status: Inferred（照片七读数 + 双系统交叉，无文献数值）
  - Source: [9]
- **剥落节奏（重点问题：幼树光滑→成树斑块）**：**幼树干皮大部分光滑、斑块随龄增多**——bark-d（幼树干径 5–8cm，意大利）判读「约 70–80% 树皮仍光滑，仅下部 20–30% 开始出现小片剥落斑块（奶油/浅黄绿/灰褐小斑）」；OSU 图注序列「young trees transitioning to mature bark / trunk, bark - at increasing ages」；FRPS「树皮光滑，大片块状脱落」为成树口径——**中龄 12–14m 个体 = 斑块剥落活跃期**（form-a/b/c 整树干面斑块已占主导）、幼树基段先起斑 [1][8][9]
  - Form: Qualitative + Relative
  - Evidence Status: Inferred（幼树照片 + OSU 序列图注 + FRPS 成树口径合成）
  - Source: [1][8][9]
- 光滑度与对比：新露斑块**光滑、哑光**（bark-a/b/c 三源）；新旧斑块对比**中-高**（新鲜奶油斑 vs 灰褐老斑）；无苔藓/地衣附着判读（三源，干燥气候区样木为主、低置信）[9]
  - Form: Qualitative + Relative
  - Evidence Status: Inferred
  - Source: [9]
- **六资产树皮语言分化定位（重点问题，与榉树「小片暖色斑驳」的分化）**：夏栎/樟树/银杏 纵裂脊沟族 ｜ 朴树 平滑-浅裂小斑单色系 ｜ 榉树 光滑皮+**暖色**小片剥落斑驳 ｜ **悬铃木 光滑大片地图状剥落 + 冷调三色带（奶油白/浅黄绿-橄榄绿/灰褐）**——与榉树同属「光滑剥落」族但三重分化：①色温（榉暖褐调 / 悬冷调**含灰绿**，多色并存 vs 暖色单色系）；②斑尺度（悬 ≈1/8–1/12 干径**大片**地图状 / 榉小片斑驳）；③对比（悬多代斑块高对比拼贴 / 榉柔和）——**悬铃木树皮 = 六资产中唯一「多色带地图拼贴」语言，独特性成立、与榉树不混淆** [7][8][9]
  - Form: Qualitative
  - Evidence Status: Verified（类型文献）/ Inferred（分化对比照片）
  - Source: [7][8][9]
- **叶色（重点问题，生长季成叶）**：**中绿、无毛近净、背面色浅**——文献成叶口径：FRPS「上下两面嫩时有灰黄色毛被，下面的毛被更厚而密，**以后变秃净，仅在背脉腋内有毛**」；Wikipedia「minute, fine, stiff hairs at first, but these wear off and **by late summer the leaves are hairless or nearly so**」；NC「medium to dark green … **undersides of the leaf are a paler green**」；照片判读 canopy 系「medium green 无粉感」+ canopy-b 少量黄绿新叶（05 月 10–15%）+ leaf-a「背脉腋少量毛其余光滑」——**夏季成叶 = 中绿正面/浅绿背面、近无毛（背脉腋残毛近景才可见）、无白粉**（vs 樟树背灰绿粉感）；5 月新叶黄绿调记变体档 [1][5][7][9]
  - Form: Qualitative
  - Evidence Status: Verified（文献）/ Inferred（两面色差与残毛照片）
  - Source: [1][5][7][9]
- 叶面质地：大叶厚实挺括（Wikipedia「thick and stiff-textured」[5]）；哑光-半光泽观感；背光透光中等（大叶面积 + 裂缺）[5][9]
  - Form: Qualitative
  - Evidence Status: Verified（厚革质文献）/ Inferred（光泽照片）
  - Source: [5][9]
- 树龄序列：幼树干皮大部光滑 → 中龄斑块剥落活跃（干面主导） → 老树斑块尺度更大、色带对比强（FRPS 成树口径 + bark/form 系照片合成；老树相定量 Unknown）[1][9]
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [1][9]
- 冠层色域：生长季中绿大叶粗质团块 + 灰绿-奶油斑驳干面拼贴 + 悬垂绿褐果球——三层色彩信号并存（悬铃木中距身份组合）[9]
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [9]

## 6. 变体范围

- 冠形幅度（联动轴）：幼金字塔（NC pyramidal）→ 中龄阔卵-圆头（本资产主相）→ 老龄开张广展不规则（NC/OSU open spreading + form-d 冠幅比 0.7–0.8 落叶相）——**冠幅比全域 ≈0.6–0.8**（建模 8 槽取 0.6–0.75）[7][8][9]
  - Form: Range
  - Evidence Status: Verified（序列园艺源）/ Inferred（全域幅度照片）
  - Source: [7][8][9]
- **裂数幅度（联动轴）**：5 裂主相（≈主流，照片三源全 5 裂 + FRPS「掌状5裂」首选）→ 3 裂（FRPS「有时」/shoot-b 少数判读/一球亲本方向）→ 7 裂（FRPS「有时」/三球亲本方向）——**建模主相 5 裂、混少量 3 裂、7 裂偶发**；裂深同步联动（3 裂偏浅、5 裂达 1/2）；裂片数分布比例定量 Unknown [1][9]
  - Form: Range + Relative
  - Evidence Status: Verified（裂数文献）/ Inferred（分布比例）/ Unknown（精确占比）
  - Source: [1][9]
- 叶大小幅度：宽 12–25cm（FRPS/FOC 全域）→ 照片实测建模域 15–22cm × 长 12–18cm；幼树叶可更极端（FRPS 幼树口径未单列二球、参三球属级趋势，弱推断不承重）[1][3][9]
  - Form: Range
  - Evidence Status: Verified（全域）/ Inferred（建模域）
  - Source: [1][3][9]
- 果序数幅度：每果枝 **1–2 个（典型 2，稀 3）**（FRPS「1-2个，稀为3个」/FOC "(1 or)2(or 3)"）——建模典型成对、少量单球记变体（Wikipedia 收录「Single seed ball per stem」克隆 [5]）[1][3][5]
  - Form: Value + Range
  - Evidence Status: Verified
  - Source: [1][3][5]
- 品种域（园艺证据）：'Bloodgood' 60ft（≈18m，圆头、抗炭疽）/'Metzam' 70ft 金字塔 /'Morton Circle' 金字塔强主轴 /'Ovation' 阔金字塔-圆头 /'Yarwood' 金字塔（NC）——中国公园语境以原种/血统混杂苗为主，品种窄化不进生产、记档 [7]
  - Form: Range
  - Evidence Status: Verified
  - Source: [7]
- **行道 pollard 相（不建模记档）**：抹头修剪「much shorter with stunted, club-like branches, requiring annual repruning」（Wikipedia）——树体矮化 + 棒状短枝密簇 + 大修剪疤，与公园自然冠形态根本不同；本资产锚公园自然冠，pollard 相不进生产 [5]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [5]
- **秋色黄褐（不建模记档）**：NC「Fall color yellow-brown」；FOC/Wikipedia 未强调鲜亮秋色（vs 银杏纯金黄、榉树橙红谱）——悬铃木秋相黄褐-褐、观感平庸 [7]
  - Form: Qualitative
  - Evidence Status: Verified（单源 NC，低置信佐证）
  - Source: [7]
- 双干/多干个体：照片池未见（form 系四样木全单干）；行道杯状修剪人为低分叉不属自然双干——**公园语境单干为绝对典型**，双干变体无证据（Unknown 不预设）[9]
  - Form: Qualitative
  - Evidence Status: Inferred（照片四样木单干一致）
  - Source: [9]
- 树龄联动：幼干光滑少斑 → 中龄斑块活跃（干面拼贴主相）→ 老树大斑强对比；幼金字塔冠 → 中龄阔卵圆头 → 老龄开张；幼相叶可偏大（弱推断）——三序列同向 [1][7][8][9]
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [1][7][8][9]

## 7. 远近景保留优先级

（写到视觉显著性为止；面数/切换距离等工程映射归任务书）

- 远距（>50m）：**阔卵-圆头开张轮廓（冠幅比 0.6–0.75 中偏窄大冠）+ 中绿粗质大叶色块 + 干面奶油/灰绿/灰褐斑驳拼贴剪影**可辨认；掌状裂、果球、节间结构均不可辨，可全部牺牲
- 中距（10–50m，本项目主语境）：**干面三色带地图状斑块剥落（悬铃木最强身份信号，OSU「best asset」）+ 大叶疏簇粗质冠面团块（≈1/10–1/15 冠幅、空隙 20–30%、中距单叶轮廓不可辨但粗质读向可读）+ 斜上-平展骨架枝剪影 + 满冠悬垂绿褐果球（成对、长梗下垂、冠底缘排布，中距隐约可读）**；外密内疏与内膛细枝网
- 近距（数米）：**掌状 5 裂大叶（宽 15–22cm、裂深约 1/2、中央裂片阔三角宽≈长渐尖、每裂片 0–2 粗齿、截形-微心形基、离基掌状 3 脉、正面中绿背面浅绿背脉腋残毛）+ 互生一节一叶疏排（节间 3–5cm）+ 长叶柄（≈叶宽同量级、基部喇叭口包芽）+ 成对球状果序（径 ≈2.5cm、宿存花柱刺状、绿褐、长梗下垂）+ 干面斑块剥落细部（斑块 ≈1/8–1/12 干径、新斑光滑哑光、多代色带）+ 嫩枝灰黄绒毛/老枝红褐秃净**依次进入可辨域
- 牺牲顺序（远→近）：叶脉细节与裂片齿 → 果序刺状表面 → 掌状裂轮廓与裂深 → 互生疏排挂点结构 → 三色带斑驳干面与大叶粗质团块（最后保留）

## 8. 来源证据

| # | 来源 | 类型 | URL/文献 | 检索日期 | 提取内容 |
|---|------|------|----------|----------|----------|
| 1 | 《中国植物志》第 35(2) 卷 (1979) p.120 二球悬铃木（经 iPlant 数据端点提取全文） | 植物学文献 | https://www.iplant.cn/info/Platanus%20acerifolia （数据端点 /ashx/getfrps.ashx?key=Platanus acerifolia） | 2026-09-20 | 二球悬铃木 英国梧桐（陈嵘，中国树木分类学）；学名 Platanus × acerifolia (P. orientatis × occidentatis) (Ait.) Willd.；**落叶大乔木，高30余米，树皮光滑，大片块状脱落；嫩枝密生灰黄色绒毛；老枝秃净，红褐色**；**叶阔卵形，宽12-25厘米，长10-24厘米，上下两面嫩时有灰黄色毛被……以后变秃净，仅在背脉腋内有毛；基部截形或微心形，上部掌状5裂，有时7裂或3裂；中央裂片阔三角形，宽度与长度约相等；裂片全缘或有1-2个粗大锯齿；掌状脉3条，稀为5条，常离基部数毫米，或为基出；叶柄长3-10厘米，密生黄褐色毛被**；托叶长约1-1.5厘米基部鞘状；花通常4数；**果枝有头状果序1-2个，稀为3个，常下垂；头状果序直径约2.5厘米，宿存花柱长2-3毫米，刺状，坚果之间无突出的绒毛**；**本种是三球悬铃木 P. orientalis 与一球悬铃木 P. occidentalis 的杂交种，久经栽培，我国东北、华中及华南均有引种** |
| 2 | 《中国植物志》第 35(2) 卷 (1979) p.120 三球悬铃木 / p.121 一球悬铃木（数据端点全文，种间差分对照轴） | 植物学文献 | 数据端点 getfrps.ashx?key=Platanus orientalis / Platanus occidentalis | 2026-09-20 | 三球（法国梧桐，陈嵘）：高达30米、树皮薄片状脱落；叶宽9-18cm、掌状5-7裂稀3裂、**中央裂片深裂过半**长7-9cm宽4-6cm、边缘少数裂片状粗齿；果序**3-5个稀2个**直径2-2.5cm、小坚果间黄绒毛突出；原产欧东南亚西亚、晋代引种、陕西户县古树（祛汗树）。一球（美国梧桐）：**高40余米**、树皮有浅沟小块状剥落；叶通常**3浅裂**稀5、宽10-22cm、裂片短三角形宽远大于长、边缘数个粗大锯齿；果序**单生稀2个**直径约3cm；原产北美、我国北部中部 |
| 3 | Flora of China Vol.9 (2003) 二球悬铃木种级（数据端点全文） | 植物学文献 | 数据端点 /ashx/getfoc.ashx?key=Platanus acerifolia | 2026-09-20 | Trees deciduous, **to 30 m tall**；young branchlets densely gray-yellow tomentose, old ones red-brown glabrous；Stipules 1–1.5 cm; **petiole 3–10 cm, densely yellow-brown pubescent; leaf blade broadly ovate, 12–25 × 10–24 cm, (3 or)5(or 7)-lobed**, gray-yellow pubescent on both surfaces when young, glabrate and then pubescent only at vein axils abaxially, **principal veins 3(or 5), arising from base or lateral 2(or 4) from midvein above base, base subcordate or truncate; lobes entire or coarsely 1- or 2-dentate at margin; central lobe broadly triangular, as long as wide**；Flowers usually 4-merous；**Fruiting branchlets with (1 or)2(or 3) infructescences. Infructescence capitate, ca. 2.5 cm in diam.** Achenes with persistent style spiniform, 2–3 mm; **Fl. Mar–May, fr. Jun–Oct**；**Cultivated in C, NE, and S China**；Comment: either a hybrid between P. occidentalis and P. orientalis **or a cultivar of P. orientalis; origin uncertain** |
| 4 | Flora of China Vol.9 Platanus 属级 + Platanaceae 科级（数据端点全文） | 植物学文献 | 数据端点 getfoc.ashx?key=Platanus / Platanaceae | 2026-09-20 | 科级：Trees deciduous, monoecious；**bark pale brown, gray, and/or white, smooth, exfoliating in plates**；**Terminal buds absent; lateral buds ovoid, slightly acute at apex, enclosed by a separate scale at base of petiole**；**petiole long, usually enclosing axillary bud at base**；leaf blade simple, large, usually palmately lobed and subpalmately veined, margin coarsely dentate；**Flowering branchlets leafy only at base, pendulous at least in fruit**；One genus 8–11 species、three species (introduced) in China。属级：**All three species in China are cultivated, usually as street trees**；检索表差分键：三球 central leaf lobe **longer than wide** vs 二球/一球 **not longer than wide**；P. kerrii 反例「petiole base does not enclose the axillary bud」佐证叶柄下芽为科通征 |
| 5 | Wikipedia — Platanus × acerifolia (London plane)（WebFetch 全文提取） | 百科（综述口径） | https://en.wikipedia.org/wiki/Platanus_%C3%97_acerifolia | 2026-09-20 | **large deciduous tree growing 20–40 m, exceptionally to 50 m tall, trunk up to 10 m in circumference**；bark usually pale grey-green, smooth and exfoliating, or buff-brown and not exfoliating；leaves thick and stiff-textured, 10–20 cm long × 12–25 cm broad, petiole 3–10 cm；**more deeply lobed than P. occidentalis but less so than P. orientalis**；young leaves hairy at first but **hairless by late summer**；fruit **one to three (most often two)** dense spherical inflorescences on pendulous stem, matures ~6 months to 2–3 cm, breaks up over winter；17th century origin (Spain or S France)；**very tolerant of atmospheric pollution and root compaction … popular urban roadside tree**；**almost exclusively planted in urban habitats**；NYC street trees >10%；**commonly pollarded — much shorter with stunted, club-like branches** |
| 6 | 中文维基百科 — 二球悬铃木（WebFetch 全文提取） | 百科（中文语境） | https://zh.wikipedia.org/wiki/二球悬铃木 | 2026-09-20 | 欧洲人培育成的杂交种（法桐×美桐）；**因「在上海法租界首先引入这个树种作为行道树」，故在中国俗称法国梧桐**；并非原产法国、与梧桐无亲属关系；纽约、巴黎、上海、南京、马德里等城市象征之一；可长到 40m；非常耐污染、少虫害、适合城市行道树；比北美悬铃木抗虫、比三球耐寒 |
| 7 | NC State Extension Gardener Plant Toolbox — Platanus × acerifolia（curl 原始 HTML 提取） | 园艺官方 | https://plants.ces.ncsu.edu/plants/platanus-x-acerifolia/ | 2026-09-20 | London plane tree is a hybrid cross of American sycamore and Oriental planetree；large deciduous shade tree **generally pyramidal when young and becomes open and spreads with age；may grow 70 to 100 feet tall and 60 to 75 feet wide**；**light brown outer bark exfoliates to reveal a creamy olive inner bark**；leaves alternate, **3 to 5 lobed**, medium to dark green, coarse marginal teeth or entire, **undersides paler green**, petiole 2 to 4 inches, **fall color yellow-brown**；fruit ball **two per stalk**, 1 to 1.5 inches, **may remain on the tree through winter**；deeper sinuses and paired balls vs American sycamore；'Bloodgood' 60ft / 'Metzam' 70ft pyramidal / 'Morton Circle' / 'Ovation' / 'Yarwood' |
| 8 | Oregon State University Landscape Plants — Platanus acerifolia（curl 原始 HTML 提取） | 园艺官方 | https://landscapeplants.oregonstate.edu/plants/platanus-acerifolia | 2026-09-20 | Broadleaf deciduous tree, **70-100 ft (21-30 m), open, spreading with age**；**Bark exfoliates and is cream, olive, light brown, best asset of the tree**；leaves alternate, simple, **3-5 lobed, 15-18 cm x 20-25 cm, triangular-ovate or broad triangular**, margins toothed to entire, stipules 1–1.5 cm；fruit globose clusters **about 2.5 cm in diameter, remain on the tree long after leaves have fallen**；**P. × acerifolia leaves have deeper sinuses, lobes about as long as wide** (vs P. occidentalis wider than long)；fruit usually in pairs (vs occidentalis solitary)；WFO 2024 接受名 Platanus acerifolia，syn. × hispanica / hybrida；图注 young trees transitioning to mature bark / trunk bark at increasing ages |
| 9 | iNaturalist research-grade 真实照片（CC BY / CC BY-NC / CC BY-SA，直接视觉证据；本地副本 ref-platanus-*.jpg 不入 git）。**入库 18 张均经双视觉系统独立判读**：第一系统 GLM-4.5V（mcp__4_5v__analyze_image，S3 原图 URL 直喂）+ 第二系统 Qwen2.5-VL-72B（同工具不同视觉后端，独立调用）——form-a/b/c、bark-a、canopy-b、shoot-a、leaf-b 共 8 张承重照片双系统交叉**全部一致**，其余 10 张单系统细判（快筛拼贴板另有分类分流，不入证据）；iNat taxonomy 接受名 Platanus × hispanica（taxon 552449） | 真实照片 | 照片页 https://www.inaturalist.org/photos/<id>：220779405（form-a，瑞士 Kaiseraugst 2026-08 中龄整树带行人，CC-BY-NC）；71766805（form-b，塞瓦斯托波尔 2026-04 成熟大树带行人长椅、无叶+宿存果球，CC-BY-NC）；375035975（form-c，南非 Cape Winelands 2026-04 南半球夏末绿叶大树带行人汽车栅栏，CC-BY-NC）；163762041（form-d，比利时 Saint-Gilles 2026-10 落叶期整树带行人，CC-BY-NC）；299902881（bark-a，CA Whiting Ranch 2026-07 干皮斑块特写，CC-BY-NC）；30548684（bark-b，UT 2025-01 干皮斑块特写，CC-BY-NC）；564940568（bark-c，英国 Corsham Court 2025-09 干皮斑块特写，CC-BY-NC）；476105045（bark-d，意大利 Oltrona 2025-12 幼树干（5–8cm），CC-BY-SA）；299902846（canopy-a，CA 2026-07 冠层对天，CC-BY-NC）；507413956（canopy-b，西班牙 Huesca 2026-05 冠层对天，CC-BY-NC）；4309348（shoot-a，意大利 Calvatone 2021-07 生长季枝叶+成对果序，CC-BY-NC）；38693594（shoot-b，英国 Bristol 2020-05 枝叶裂数裂深，CC-BY-NC）；720648734（leaf-a，英国 Evesham 2022-08 单叶+笔参照，CC-BY-NC）；40564269（leaf-b，加拿大 Hamilton 2021-05 叶近距裂片齿，CC-BY-NC-SA）；583706390（leaf-c，CA Mission Viejo 2024-10 叶+果+标尺，CC-BY-NC）；578213086（fruit-a，英国 Aberystwyth 2024-10 枝上成对果球+绿叶，CC-BY）；232323410（fruit-b，意大利 2025-09 成对果球，CC-BY-SA）；583706417（fruit-c，CA 2024-10 果球+标尺，CC-BY-NC）。原图 CDN：https://inaturalist-open-data.s3.amazonaws.com/photos/<id>/original.{jpg\|jpeg}（S3 HEAD 双试探定扩展名后直取） | 2026-09-20 | 整树（**中龄 form-a 12–14m 人参照半成熟**、冠幅比 0.65–0.70、干高 0.25–0.30、5–6 枝 35–55°、阔卵-圆头、粗质中绿、斑块 1/8–1/10 干径；form-b 15–18m、0.6–0.7、0.3–0.35、4–6 枝 40–60°、光秃+**成对宿存果球 20–40 个醒目**；form-c 18–22m、0.6–0.7、单干通直、外密内疏 20–30%；form-d 14–16m、0.7–0.8 落叶相、下部大枝平展）；树皮（**三色带奶油白/浅黄绿-橄榄/灰褐 + 深褐老斑、斑块 ≈1/8–1/12 干径地图状、大片块状剥落、新斑光滑哑光、新旧对比中-高、无苔藓**；幼树 bark-d 70–80% 光滑仅基段初现小斑）；冠层（**空隙 20–30%、末枝团块 1/10–1/15 冠幅、外密内疏、大叶粗质 coarse、中绿无粉、少量黄绿新叶、中距裂片不可辨**）；枝叶（**互生一节一叶、节间 3–5cm、主枝段 8–10 叶、疏朗通透、叶 15–22 宽 × 12–18 长、叶对枝轴近垂直略前倾**）；叶（**5 裂、裂深 1/3–1/2 主流 1/2、中央裂片阔三角宽≈长先端渐尖、每裂片 0–2 粗齿、截形基、柄 ≈0.8–1.1× 叶宽、背脉腋残毛余光滑、正面中绿背面浅绿**）；果序（**每梗 2 个、径 2.5–2.8cm 标尺实测、绿褐、密刺宿存花柱、长梗下垂叶下、07 月生长季显著可见、04 月光秃枝宿存醒目、10 月绿叶间显著可见**） |

## 域扩展节：plant

（字段定义见 `.zcode/skills/asset-research/references/plant-schema.md` v0.2）

### A. 干与枝

- `trunk_height_ratio`：≈0.25–0.35（form 四样木 0.25–0.30/0.3–0.35/0.30–0.35/≈0.30）
  - Form: Range | Evidence Status: Inferred | Source: [9]
- `trunk_taper_ratio`：Unknown（无可靠近景证据）
  - Form: Unknown | Evidence Status: Unknown
- `basal_flare_ratio`：Unknown（form 系样木根盘不可辨，照片无近基特写）
  - Form: Unknown | Evidence Status: Unknown
- `trunk_lean_angle`：近直立通直（form-b「单一主干无明显多头分叉」/form-c「主干明显通直」双系统交叉）
  - Form: Qualitative | Evidence Status: Inferred | Source: [9]
- `branching_levels`：3–4 级可见（照片判读；无冬态裸枝专项，置信中）
  - Form: Value | Evidence Status: Inferred | Source: [9]
- `scaffold_branch_count`：≈4–7（form 四样木 5–6/4–6/5–7/5–7，典型 5–6）——与先例（5–8）同量级
  - Form: Range | Evidence Status: Inferred | Source: [9]
- `scaffold_angle`（骨架枝仰角，对铅垂方向）：≈35–60°（四样木 35–55°/40–60°/35–55°/40–60°，主流 40–55°）——**斜上至平展广角语言**（open spreading [7][8]）+ 下部大枝平展（form-d）
  - Form: Range | Evidence Status: Verified（open spreading [7][8]）/ Inferred（角度照片）| Source: [7][8][9]
- `branch_angle`（分枝角，子枝对父枝）：数值 Unknown；定性倾向沿上级枝轴开展延伸（广角语言）
  - Form: Unknown | Evidence Status: Unknown
- `branch_orientation`：**螺旋互生散布（alternate）**——FOC 科级 "Leaves alternate" + 枝系无轮生证据（vs 银杏近轮生）——骨架枝排列无轮生口径
  - Form: Qualitative | Evidence Status: Verified（互生叶序）/ Inferred（骨架排列）| Source: [4][9]
- `branch_length_decay`：Unknown
  - Form: Unknown | Evidence Status: Unknown
- `branch_radius_decay`：Unknown
  - Form: Unknown | Evidence Status: Unknown
- `branch_attachment_t`：Unknown
  - Form: Unknown | Evidence Status: Unknown
- `apical_dominance`：幼-中龄较强（幼金字塔 pyramidal [7]）→ 老龄失去主轴转开张广展不规则（open and spreading with age [7][8]）；顶芽缺如（FOC「Terminal buds absent」[4]——合轴分枝，主轴由侧芽接续）
  - Form: Qualitative | Evidence Status: Verified | Source: [4][7][8]
- `branch_curvature`：**斜上-平展开展（ascending-spreading）**；果枝至少果期下垂（FOC「pendulous at least in fruit」[4]）；非下垂枝型、非直立柱型（品种除外）
  - Form: Qualitative | Evidence Status: Verified | Source: [4][7][8]
- `allometry_exponent`：Unknown（不得以面积守恒假设充 Verified）
  - Form: Unknown | Evidence Status: Unknown

### B. 叶与冠

- `leaf_attachment_rule`：**单叶互生疏排（一节一叶）**——叶沿末级枝互生、**节间 3–5cm（≈1–2 叶宽）**、主枝段 8–10 叶、整枝疏朗通透（shoot-a/b 双源 + 交叉）——**末级枝挂点单位 = 单叶，非簇**（与银杏短枝簇、朴树/樟树密簇根本不同；六资产中与榉树类互生疏排同族但叶大一个量级）[3][4][9]
  - Form: Qualitative + Range | Evidence Status: Verified（互生）/ Inferred（节间照片）| Source: [3][4][9]
- `leaf_cluster_density`：**1 叶/挂点**（互生单叶语言；本字段在悬铃木语境 = 单叶挂点，无簇数）——疏簇观感由「大叶 + 大节间」联合产生
  - Form: Value | Evidence Status: Inferred | Source: [9]
- `clump_scale`：冠壳叶团 ≈1/10–1/15 冠幅（canopy-a/b 双源 + 交叉一致——团块为末级枝叶组非叶簇）
  - Form: Relative | Evidence Status: Inferred | Source: [9]
- `leaf_orientation_dist`：叶面对枝轴**近垂直、略前倾**，大叶平展摊开（shoot-a；fruit-a 叶平展果垂侧证）
  - Form: Qualitative | Evidence Status: Inferred | Source: [9]
- `leaf_size`：宽 15–22cm × 长 12–18cm（照片建模域；FRPS/FOC 全域宽 12–25 × 长 10–24）；柄 3–10cm（≈0.8–1.1× 叶宽）；叶片厚实挺括
  - Form: Range | Evidence Status: Verified（文献全域）/ Inferred（建模域照片）| Source: [1][3][5][9]
- `leaf_aspect_ratio`：**长/宽 ≈0.7–0.9（宽>长）**——阔卵形掌状裂口径（FRPS 宽 12–25 > 长 10–24 原句序；照片 15–22 宽 × 12–18 长实测同向）——与银杏扇形宽>高同向、与榉/朴/樟披针-卵形长>宽反向
  - Form: Range | Evidence Status: Verified（文献序）/ Inferred（比值域）| Source: [1][3][9]
- `crown_transparency`：生长季中-疏（逆光空隙 20–30%，canopy-a 25–30%/canopy-b 20–25%/form 系 20–30%）
  - Form: Relative | Evidence Status: Inferred | Source: [9]
- `crown_fill_gradient`：外密内疏（canopy 双源 + form-c「外部密实、内部稀疏」双系统交叉；内膛细枝网可见）
  - Form: Qualitative | Evidence Status: Inferred | Source: [9]
- **掌状裂形态组（schema 无专字段——挂本组记档）**：5 裂典型（3/7 裂变体）；裂深 sinus 达叶缘→叶基距离 **1/3–1/2（典型 1/2）**；中央裂片**阔三角形宽≈长、先端渐尖**；每裂片 0–2 粗齿；叶基截形-微心形；**离基掌状 3 脉**（侧脉对自中脉基部上方数毫米发出）
  - Form: Qualitative + Range | Evidence Status: Verified（形态文献五源）/ Inferred（裂深比例照片）| Source: [1][3][4][8][9]
- **宿存果序组（挂点附属物，挂本组记档）**：每果枝 1–2（典型 2、稀 3）球状果序、径 ≈2.5cm、绿褐色、宿存花柱密刺状、长梗下垂于叶幕下方、**生长季满冠宿存可见**（07 月照片直接证据 + FOC fr. Jun–Oct）——建模判定：**做**
  - Form: Value + Qualitative | Evidence Status: Verified | Source: [1][3][9]

### C. 表皮与芽

- `bark_archetype`：**光滑斑块剥落型（多色带地图拼贴）**——树皮光滑、大片块状脱落（FRPS）；pale brown, gray, and/or white（FOC 科级）；cream, olive, light brown（OSU）；幼树大部光滑→中龄斑块活跃→老树大斑强对比；六资产定位：与榉树同「光滑剥落」族但**冷调三色带 + 大片地图状 + 高对比拼贴**三重分化，与纵裂脊沟族/朴树浅斑型互斥
  - Form: Qualitative | Evidence Status: Verified | Source: [1][4][7][8][9]
- `bark_color`：**三色带并存**——新露斑奶油白-浅黄绿 / 过渡斑灰绿-橄榄 / 老斑灰褐-深褐（+沟底深褐）；NC「light brown outer bark exfoliates to reveal creamy olive inner bark」
  - Form: Qualitative | Evidence Status: Verified（文献三色）/ Inferred（色带分布照片）| Source: [4][7][8][9]
- `bark_relief`：干面整体**光滑-低浮雕**（非脊沟）；斑块凸起差异产生细碎拼贴浮雕；斑块尺度 ≈干径 1/8–1/12、地图状不规则
  - Form: Relative | Evidence Status: Inferred | Source: [1][9]
- `bark_epiphytes`：无-极少苔藓/地衣（bark 三源判读；干燥气候区样木为主，低置信）
  - Form: Qualitative | Evidence Status: Inferred（低置信）| Source: [9]
- `twig_surface`：**嫩枝密生灰黄色绒毛，老枝秃净、红褐色**（FRPS/FOC 双源）——近景一年生枝绒毛灰黄、老枝光滑红褐；皮孔文献未记（Unknown）
  - Form: Qualitative | Evidence Status: Verified / Unknown（皮孔）| Source: [1][3]
- `bud_aspect`：**无顶芽（假二叉/合轴分枝根源）+ 侧芽卵形先端略锐、藏于叶柄基部（叶柄下芽）**（FOC 科级原句）——近景叶基建模口径：叶柄基部鞘状喇叭口包住腋芽
  - Form: Qualitative | Evidence Status: Verified | Source: [4]

## 检索与证据备注

- 网络可达性（2026-09-20 本机）：iplant.cn 数据端点可达（FRPS 二球/三球/一球 + FOC 种级/属级/科级共 9 端点全文提取；FRPS hispanica 键 0 字节——志书无此名条目，印证 × hispanica 为 FOC/Wikipedia 系异名）；Wikipedia EN 与 zh.wikipedia 可达（WebFetch 全文）；NC Extension 与 OSU 园艺库可达（curl 原始 HTML；OSU 正确 slug 为 platanus-acerifolia，带 x 的 slug 404）；iNaturalist api.inaturalist.org / www.observations.json + S3 CDN 可达（taxon 552449 = iNat 接受名 Platanus × hispanica，1970 个 research-grade 观察；votes 排序 300 观察 → 315 张许可+分辨率合格候选 → 前 70 张 S3 HEAD 双试探（jpg/jpeg）全部直取成功；v1 API order=votes 参数无效，改用 www observations.json order_by=votes 先例链路）。WebSearch 配额耗尽（重置 2026-10-04），全程未采用其无来源输出；百度百科未触发（无必须兜底缺口）。
- 图片检索决策：按先例（ginkgo/zelkova/camphor 三轮一致结论：图库水印/苗圃商品图/CG 不可用）跳过 image-search MCP，直接走 iNat research-grade 成熟链路；**species 定向**：任务书锚定二球悬铃木，iNat 池即二球（× hispanica taxon），无种间混池风险。
- **视觉核验口径（本版关键修正，按上一树终审规程执行）**：本子代理会话 Read 工具不返回图像内容（仅转存 CDN 返回 URL，与 ginkgo 调研记档一致），子代理自身视觉通道不可用；判读链路 = **双视觉系统独立调用**：第一系统 GLM-4.5V（mcp__4_5v_mcp__analyze_image，S3 原图 URL 直喂，jpg/jpeg 双试探后的真实扩展名）承担全部 18 张入库照片细判 + 8 块拼贴板快筛分流（板级结论仅候选分流不入证据）；第二系统 Qwen2.5-VL-72B（同一 MCP 工具的不同视觉模型后端，独立调用、不同提问措辞）对 8 张承重照片（form-a/b/c、bark-a、canopy-b、shoot-a、leaf-b）独立交叉——**8/8 全部一致，无矛盾弃用**（ginkgo 终审教训：同系统双问不可靠，须异系统交叉——本次以「不同视觉模型后端」实现异系统，两模型权重/推理链独立；此为当前会话工具面下的最强交叉配置，终审轮若以第三系统复核更佳）。
- 双系统交叉明细（8 张承重）：form-a（12–14m 人参照/0.65–0.70/阔卵圆头/空隙 20–30%/斑块 1/8–1/10 三色带）、form-b（15–18 vs 15–17m/光秃/成对果球 20–40 个/斑块 1/8–1/10）、form-c（18–22 vs 18–20m/绿叶外密内疏/单干通直 0.30–0.35/斑块 1/8–1/12）、bark-a（三色带/1/8–1/10/光滑/大片剥落）、canopy-b（空隙 20–25%/末枝团块/大叶粗质/中绿+嫩黄绿）、shoot-a（互生疏排/叶宽 18–22cm/**每梗 2 果球绿褐下垂、球径 1/6–1/8 叶宽**）、leaf-b（5 裂/裂深 1/2/中央裂片宽≈长/0–2 粗齿/截形基）——数值读数两系统均落同域，比例类主参数（冠幅比/干高占比/斑块尺度/裂深）全部有双系统支撑，仍按规程标 Inferred（照片轴封顶 Inferred，不因双系统一致升格 Verified）。
- 尺度结构事实优先级执行情况：树高/叶宽长/叶柄/托叶/果序直径与个数/物候/裂片形态/叶脉/芽/枝毛被全部以植物志（FRPS 35(2) 二球种级 + FOC Vol.9 种级/属级/科级）为准并逐字复核原句（候选锚 **FRPS 35(2):120 确认属实**——端点 frpslink 字段「第35(2)卷 (1979) >> 120页」）；三球/一球志文仅作种间差分对照轴（不混入二球数值）；Wikipedia/NC/OSU 作园艺语境交叉（体量域/冠形序列/树皮色带/品种域）；照片只作形态佐证与比例推断（全部标 Inferred）。
- 俗名口径溯源：志书系（FRPS 引陈嵘：二球=英国梧桐、三球=法国梧桐、一球=美国梧桐）与民间系（zh wiki：上海法租界首引二球故俗称法国梧桐）**两系并存且指向不同树**——生产口径以种定名为准（P. × acerifolia），俗名分歧不影响建模；「一球/三球在长江流域/华北的实际占比」无定量来源（WebSearch 配额尽、志书仅分布定性），Unknown 记档不阻塞（形态锚定不依赖此值）。
- 原图获取记档：70 张候选 S3 HEAD 双试探（jpg/jpeg）、70 张直取成功（扩展名两种均出现，双试探必要）、18 张入库 screenshots/ref-tmp/（ref-platanus-form-a/b/c/d、bark-a/b/c/d、canopy-a/b、shoot-a/b、leaf-a/b/c、fruit-a/b/c），长边压至 2000px 副本，永不 git add；其余 52 张候选留存 cand/ 目录不入库。form-c 为南非南半球样木（04 月=夏末仍绿叶），地域半球差异已记档其条目。
- 体量混植对照（任务指定）：form-a 中龄实测 12–14m > 先例锚（夏栎 ≈8m、银杏 8.17m、朴树 ≈8.5m）——悬铃木速生大乔木属性使然；若任务书需 ≈8–10m 同体量混植个体，对应更年轻相（幼金字塔-阔卵过渡），照片池无该尺度带参照样木（Inferred，结构性缺口记档）。

## 结构性缺口（Unknown Gate 相关）

- 中国城市一/二/三球悬铃木行道树定量占比（长江流域/华北）：无可靠数值来源（WebSearch 配额尽、志书仅定性「三种均栽培」）——定性主力 = 二球（FOC/Wikipedia/zh wiki 三源 Verified），不阻塞形态建模（种已定名）。
- 枝轴结构数值（`branch_angle` 度数、`branch_length_decay`、`branch_radius_decay`、`branch_attachment_t`、`allometry_exponent`）无文献亦无可靠照片判读——与先例同缺口，不阻塞。
- ≈8–10m 年轻带参照整树样木缺失（form 系最小带参照样木为 12–14m 半成熟）——若工程锚定 ≈8m 同体量混植，年轻相（幼金字塔过渡）仅 NC 品种口径支撑，建议补研或调锚。
- 生长速率数值（年增高 cm）、树龄-尺度对应表：无来源——Unknown。
- 裂片数分布比例（5/3/7 裂各占比）：文献只给「5 裂有时 7 或 3」、照片三源全 5 裂——分布定量 Unknown，建模取 5 裂主相 + 少量 3 裂。
- pollard 行道相的形态数值（矮化高度/短枝密度）：仅文献定性（Wikipedia），无照片入库——不进生产不阻塞。
- 老树相（斑块尺度增大/色带对比增强）定量：无样木判读（form 系最大 18–22m 仍成熟非衰老相）——Unknown，不阻塞中龄主相。

## 终审记档（独立校验子代理，2026-09-20）

规程 D35 终审执行：独立校验子代理（与调研子代理无关、与双系统交叉轮无关的第三只眼）。三步执行——①FRPS/FOC/OSU/NC 一手来源直查逐字复核（iplant 数据端点 getfrps/getfoc + OSU/NC 页面，本轮全部重拉、非转录比对）；②任务指定 3 张关键照片第三视觉判读（mcp__4_5v_mcp__analyze_image，中性提问不含树种名；判读通道：S3 original/large 直链 + 本地副本经 CDN 转存 URL 双通道）；③form-a 判读出现像素级矛盾后按占位复核点③扩大抽查 form-b/c/d。

### 一、硬数值抽查表（16 条，文献轴全部对照一手来源）

| # | Spec 主张 | 来源原句（本轮直查） | 裁定 |
|---|---|---|---|
| 1 | FRPS 35(2):120 收录、学名行、杂交种原句 | 端点命中「第35(2)卷 (1979) >> 120页」；「本种是三球悬铃木 P. orientalis 与一球悬铃木 P. occidentalis 的杂交种，久经栽培」；学名行含志书排印「orientatis」逐字一致 | 一致 |
| 2 | 树高「落叶大乔木，高30余米」 | FRPS 逐字命中；FOC "Trees deciduous, to 30 m tall." | 一致 |
| 3 | 树皮「光滑，大片块状脱落」 | FRPS 逐字命中 | 一致 |
| 4 | 叶宽 12–25 × 长 10–24cm 建模域 15–22 | FRPS「叶阔卵形，宽12-25厘米，长10-24厘米」逐字；FOC "broadly ovate, 12–25 × 10–24 cm"；建模域为照片轴（见二节 leaf-a，同构） | 一致 |
| 5 | 掌状 5 裂有时 7 或 3 | FRPS「上部掌状5裂，有时7裂或3裂」逐字；FOC "(3 or)5(or 7)-lobed"；NC "3 to 5 lobed"；OSU "3-5 lobed" | 一致 |
| 6 | 中央裂片阔三角形宽≈长先端渐尖 | FRPS「中央裂片阔三角形，宽度与长度约相等」逐字；FOC "central lobe broadly triangular, as long as wide"；第三眼判读「宽三角-卵状三角、先端收尖具尖头」同构 | 一致 |
| 7 | 裂片全缘或 1–2 粗大锯齿 | FRPS 逐字；FOC "entire or coarsely 1- or 2-dentate at margin"；第三眼「疏钝齿」同构 | 一致 |
| 8 | 掌状脉 3 条稀 5、常离基 | FRPS「掌状脉3条，稀为5条」；FOC "principal veins 3(or 5), arising from base or lateral 2(or 4) from midvein above base"（离基口径英文对应句命中） | 一致 |
| 9 | 叶柄 3–10cm 密生黄褐毛 | FRPS 逐字；FOC "petiole 3–10 cm, densely yellow-brown pubescent"；NC "2 to 4 inches"；第三眼 0.8–1.1× 叶宽同构 | 一致 |
| 10 | 叶柄下芽（FOC 科级两句） | FOC 科级端点逐字命中 "Terminal buds absent; lateral buds ovoid, slightly acute at apex, enclosed by a separate scale at base of petiole" + "petiole long, usually enclosing axillary bud at base"；第三眼 form-a 叶特写亦判「叶柄基部膨大」间接同构 | 一致 |
| 11 | 托叶长约 1–1.5cm 鞘状 | FRPS「托叶中等大，长约1-1.5厘米，基部鞘状，上部开裂」逐字；FOC "Stipules 1–1.5 cm"；OSU 同 | 一致 |
| 12 | 果序每果枝 1–2 稀 3、径 ≈2.5cm、宿存花柱 2–3mm 刺状 | FRPS「果枝有头状果序1-2个，稀为3个，常下垂；头状果序直径约2.5厘米，宿存花柱长2-3毫米，刺状」逐字；FOC "(1 or)2(or 3) infructescences … ca. 2.5 cm in diam."；OSU "about 2.5 cm in diameter … usually found in pairs" | 一致 |
| 13 | OSU 树皮三色带 cream/olive/light brown | OSU 页逐字命中 "Bark exfoliates and is cream, olive, light brown, best asset of the tree" | 一致 |
| 14 | NC 栽培域 70–100ft 高 × 60–75ft 宽 | NC 页逐字命中 "may grow to a height of 70 to 100 feet tall and 60 to 75 feet wide" | 一致 |
| 15 | 物候 Fl. Mar–May, fr. Jun–Oct | FOC 逐字命中 | 一致 |
| 16 | 嫩枝灰黄绒毛/老枝红褐秃净 | FRPS「嫩枝密生灰黄色绒毛；老枝秃净，红褐色」逐字；FOC "Young branchlets densely gray-yellow tomentose, old ones red-brown, glabrous" | 一致 |

文献轴抽查一致率 **16/16（100%）**，零分歧。未复核项（非承重记档）：FOC 属级 street trees 句、P. kerrii 反例（属级端点本轮未重拉）；iNat 拍摄地/日期/许可元数据（v1 photos API 端点不存在，照片以像素为准）。

### 二、关键照片第三只眼交叉（9 次独立判读）

- **leaf-a（720648734，large.jpg）**：判「掌状裂叶、约 5 裂、裂至叶片半径 1/2–2/3、中央裂片宽三角-卵状三角先端尖头、叶缘疏钝齿、基部截形-心形、柄 ≈0.8–1.1× 叶宽、互生」——与 Spec §4/§B 同构；唯裂深读数偏深端（见处置 2）。
- **bark-a（299902881，large.jpg）**：判「片状剥落确认；灰白 + 灰褐 + 浅褐/淡黄褐 + 沟缝近黑四色系；新露斑浅色光滑 vs 老斑深色粗糙、对比明显；斑块 1.5–3cm / 干径 25–30cm ≈ 1/20–1/10」——剥落方式/色系结构/新旧对比与 Spec §5 同构；olive 绿调未直读（色相命名差异，OSU 原句有 olive、不修正）；斑块尺度读数偏细端（见处置 3）。
- **form-a（220779405）——实质不符（作废）**：S3 original.jpeg 与本地副本 CDN 转存**双通道判读一致为枝叶特写**（掌状裂叶 + 红褐枝条 + 光斑，叶柄基部膨大可见），无整树、无行人。Spec §2/§3/来源表 [9] 所载「瑞士 Kaiseraugst 中龄整树带行人 ≈1.7m 参照、判高 12–14m、冠幅比 0.65–0.70、干高占比 0.25–0.30、骨架 5–6 枝 35–55°」**无像素支撑**。
- **form-b（71766805）——实质不符（作废）**：S3 large.jpg 与本地副本双通道一致判为「石阶缝隙小幼树 ≈1.2–1.5m」，无行人、无长椅、无宿存果球。Spec 所载「15–18m 成熟大树、光秃枝宿存果球 20–40 个醒目」无像素支撑。
- **form-c（375035975）——部分相符（降级）**：判为真实完整大树（仰拍、单主干但约 1/3 高度处 V 形分叉、干形略斜、树皮斑驳剥落），冠幅比（冠幅/树高）≈0.67–0.83 与 Spec 0.6–0.7 重叠一致；但像素中**无行人/汽车/栅栏参照**（Spec 声称三参照判 18–22m），且叶相为黄褐秋末相而非 Spec 所载「绿叶夏末」——绝对尺度降级为无参照粗估（判读粗估 12–18m）。
- **form-d（163762041）——形态同构、参照缺失（降级）**：判为真实整树（单干通直、斑驳皮、阔卵冠、大枝斜上 30–50°、冠幅比 ≈0.67–0.83、透光 25–35%），与 Spec 形态读数同量级；但**无行人参照**（Spec 声称带行人），树高判读粗估 8–12m vs Spec 14–16m（同量级、绝对值支撑薄弱）。

### 三、分歧处置清单

1. **form-a / form-b 证据作废（实质分歧，像素证伪）**：波及——①「中龄公园个体 ≈12–14m」由「照片带尺度实测」降级为「无参照照片粗估 + NC/OSU 栽培域内插」（弱 Inferred；数值不推翻：form-c/d 粗估带 8–18m 与成熟域 21–30m 下沿之间，但不得再称「带行人参照实测」）；②「光秃枝宿存果球 20–40 个」照片证据摘除——「夏季宿存果序必须建模」判定**维持**（shoot-a/fruit-a/fruit-c 照片轴 + FOC fr. Jun–Oct + NC/OSU persist 文献轴未受波及）；③正文 §2/§3/§6/来源表 [9] 中 form-a/b 的全部数值引用与「带参照」表述，v1.1 修订时须摘除或改标作废（本轮终审仅记档不改正文）。
2. **裂深（比例类，中庸）**：Spec 1/3–1/2（典型 1/2）vs 第三眼 1/2–2/3——重叠于 1/2，典型值 1/2 中枢稳固。处置：生产域维持 1/3–1/2、典型 1/2 不变；记档深端可至 2/3（leaf-a 单点、低权重）。
3. **树皮斑块尺度（比例类，中庸）**：Spec ≈1/8–1/12 干径 vs 第三眼 1/20–1/10——重叠于 ≈1/10。处置：生产主口径维持 1/8–1/12（原七读数）不阻塞；记档细碎端可至 1/20（鳞片状小片并存），树皮纹理制作时最小斑块留此带宽。
4. **「冠幅比 0.6–0.8」「干高占比 0.25–0.35」「骨架枝 4–7 根 35–60°」**：第三眼 form-c/d 复核全部落域（0.67–0.83 / ≈0.33 / 30–50°）——参数维持；但有效样木由四张降为两张（form-c/d，均无尺度参照），Evidence Status 维持 Inferred、支撑强度记档降级。
5. **「主干单干通直」弱化**：form-c 第三眼见 1/3 高度 V 形分叉、干形略斜——「通直」由 form-c/d 双源降为 form-d 主源 + form-c 部分支撑；生产维持单干主导口径，容许低位双主枝自然变体（与 §6「双干无证据不预设」不冲突，仅记档容差）。
6. **form-c 季节相修正**：黄褐秋末相（非绿叶夏末）——该照片不得作为夏相证据引用；正面价值：佐证 §6「秋色黄褐」（第三眼直接判读黄褐，补强该单源条目）。

### 四、方法论记档（教训）

- 调研轮「双系统交叉 8/8 一致」对 form-a/b 不成立：两系统对同一 URL 的判读记载与像素内容系统性不符（form-a=叶特写、form-b=台阶幼树），最可能成因为图片拉取失败后双系统各自沿提问措辞生成（同型幻觉），交叉机制对此无免疫力。终审反证手段 = 换通道（S3 直链 ↔ 本地副本 CDN 转存）双通道判读**内容自证**（两通道一致 ⇒ 真实像素；判读内容与提问预期「过度吻合且含提问中未出现的参照物叙述」为幻觉信号）。
- 本轮 400 解析错误均发生于 original 原图（尺寸过大）与 jpg/jpeg 扩展名错配（220779405/375035975/163762041 真实对象为 .jpeg、720648734/299902881 为 .jpg）；large.jpg 变体仅部分 photo id 存在。图片拉取失败时 MCP 偶发不报错而返回幻觉内容（本终审 form-a 第一次调用即此情形）——凡承重判读必须内容自证。
- 终审占位四个复核点全部执行：①硬数值逐字比对通过（16/16）；②第三只眼照片复核发现 form 系系统性不符（form-a/b 作废、form-c/d 降级）——ginkgo 先例风险在悬铃木上部分重演，「双系统一致 + 声称含参照物」不能替代像素复核；③④两条 Inferred 主参数（斑块尺度、裂深）按中庸处置记档。

### 终审结论

**有条件通过**——文献轴（FRPS/FOC/OSU/NC）16/16 逐字复核一致，身份定名、形态硬数值、色带、体量域、物候全部稳固；叶/树皮照片轴第三只眼同构；但 form 系整树判读记载被像素证伪（form-a/b 作废、form-c/d 尺度降级），「中龄 ≈12–14m」降为弱 Inferred、宿存果序照片证据链改由 shoot/fruit 轴独自承担（判定不变）、裂深与斑块尺度两条按中庸记档。条件：生产取用尺度类照片参数（树高绝对值/尺度参照/干形通直度）时以本记档第三节为准，正文 form-a/b 引用于 v1.1 修订时摘除。
