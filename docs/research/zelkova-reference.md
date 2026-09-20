# zelkova Reference Spec

Spec Version: 1.0
Domain: plant
Asset: zelkova（榉树）
Updated: 2026-09-20

> 关键事实统一写法（各节内联、逐条标注；Source 填来源表编号）：
> Form ∈ {Value, Range, Relative, Qualitative}；Evidence Status ∈ {Verified, Inferred, Unknown}。
> 工程预算（面数/LOD 阈值）不进本文件，归任务书。真实照片本地副本为 `screenshots/ref-tmp/` 下 ref-zelkova-*.jpg（不入 git、不进 Runtime）。

## 1. 身份

榆科（Ulmaceae）榉属（Zelkova）**落叶乔木** [1][3][5]。中文「榉树」存在两种指称：**光叶榉（榉树，Zelkova serrata (Thunb.) Makino）**与**大叶榉（大叶榉树，Zelkova schneideriana Hand.-Mazz.，中国特有）**。**本资产锚定光叶榉 Z. serrata**，理由与合并口径如下；使用语境：华东/华中城市公园、行道落叶乔木，本资产服务中距离为主的园区可视化，近景（数米）材质细节需可信，目标龄级锚 = 中龄公园典型个体（与既有夏栎 ≈8m、朴树 ≈8.5m、樟树同语境可混植量级）。

- 种定名（锚定依据一，正名口径）：两志中文正名一致——FRPS/FOC 均以**「榉树」为 Z. serrata 的中文正名**（FRPS 引《名医别录》，别名光叶榉/鸡油树/光光榆/马柳光树），以「大叶榉树」为 Z. schneideriana 的正名（别名血榉/鸡油树/黄栀榆/大叶榆）[1][2][3][4]
  - Form: Value
  - Evidence Status: Verified
  - Source: [1][2][3][4]
- 种定名（锚定依据二，栽培记载）：FRPS 记 Z. serrata「**在华东地区常有栽培**，在湿润肥沃土壤长势良好」，分布北起辽宁（大连）、山东，南至广东，东至沿海，并延至日本、朝鲜、千岛群岛；Z. schneideriana 记「华东和中南地区有栽培」，产陕南-西南，中国特有（FOC 属级记中国 3 种其中 2 种特有）[1][2][3][6]
  - Form: Range + Qualitative
  - Evidence Status: Verified
  - Source: [1][2][3][6]
- 种定名（锚定依据三，合并口径）：FRPS 明文两形「**极其近似**」，以冬芽（Z. serrata 圆锥状卵形单生 vs Z. schneideriana 常 2 个并生）、叶质地与毛被（前者叶薄纸质至厚纸质、叶背毛后脱落近光滑；后者叶厚纸质、叶背密被柔毛）区别 [1][2]；杭州 Z. schneideriana 叶照双问判读与 Z. serrata 叶「**2m 距离不可区分**，仅毛被与质地细节有差」[8]。**生产关键面（树形/树皮/叶形/叶缘/脉序/尺度/物候框架）两种一致，本 Spec 按合并口径记录，近景辨析轴见 §6**
  - Form: Qualitative
  - Evidence Status: Verified（近似明文 [1][2]）/ Inferred（照片判读 [8]）
  - Source: [1][2][8]
- 落叶性：落叶乔木（FRPS 属级「落叶乔木」；FOC "Trees, deciduous"；OSU "Broadleaf deciduous tree"）[3][5][6][7]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [3][5][6][7]
- 园艺地位（侧证）：OSU 记 Z. serrata 为著名行道/园林树种（Japanese Zelkova / Saw-leaf Zelkova，原产日本），抗荷兰榆病，被视为美洲榆替代候选，品种丰富（Green Vase®/Village Green/Musashino/Wireless® 等）[7]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [7]

## 2. 主要尺度

- 物种上限树高：Z. serrata 高达 30m、胸径达 100cm；Z. schneideriana 高达 35m、胸径达 80cm（两志各自口径，均为极值）[1][2][3][4]
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][2][3][4]
- 栽培成熟域：OSU 园艺库记 50–60(80)ft ≈ 15–18(24)m，相对慢生 [7]
  - Form: Range
  - Evidence Status: Verified
  - Source: [7]
- 公园中龄典型个体（目标龄级锚）：无权威文献直接数值。弱推断：栽培条件下中龄个体 ≈8–12m（由 OSU 栽培域 15–18m 下段 + 相对慢生 + 城市公园 20–40 年生个体低于物种上限推得，口径同樟树/朴树先例）；**未见可靠实测来源，任务书锚定 ≈8m 属该弱推断域内**，与夏栎 ≈8m、朴树 ≈8.5m 同量级可混植；按冠幅比 0.8–0.95（§3）对应冠幅 ≈6.5–11m（8m 个体 ≈6.5–7.5m）
  - Form: Range
  - Evidence Status: Inferred
  - Source: [7]（域下限推断）+ [8]（形读）
- 叶片：Z. serrata 3–10 × 1.5–5cm（FRPS）；FOC 3–10 × 1.5–5cm（elliptic to ovate-lanceolate）；OSU 记 2.5–5cm 长、部分长枝上可达 13cm；Z. schneideriana 3–10 × 1.5–4cm——文献交叉取 **3–10 × 1.5–5cm**，典型单叶 ≈4–6 × 2–3cm（照片判读 4–6 / 3–5cm 一致）[1][2][3][4][7][8]
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][2][3][4][7][8]
- 叶柄：**粗短**，2–6mm（Z. serrata）/3–7mm（Z. schneideriana），被短柔毛——合并 2–7mm；照片估计约叶长 1/8–1/5（偏大，以文献为准）[1][2][3][4][8]
  - Form: Range
  - Evidence Status: Verified（文献）/ Inferred（照片估计）
  - Source: [1][2][3][4][8]
- 侧脉：Z. serrata (5–)7–14 对（FRPS）/9–15 对（FOC）；Z. schneideriana 8–15 对（两志）；OSU 8–14 对——合并 **≈7–15 对**；照片判读 8–12 对（双叶一致）[1][2][3][4][7][8]
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][2][3][4][7][8]
- 核果：淡绿色，斜卵状圆锥形（上面偏斜、凹陷），直径 2.5–3.5mm，几乎无梗，表面网肋明显、被柔毛，宿存花被（Z. serrata 双志一致；Z. schneideriana「与榉树相似」+ FOC 同径）——**<4mm 的微小果，中近景不显著**[1][2][3][4]
  - Form: Range + Qualitative
  - Evidence Status: Verified
  - Source: [1][2][3][4]
- 花与物候：花杂性，几乎与叶同时开放（雄花簇生幼枝下部叶腋、雌花/两性花单生上部叶腋）；**花期 4 月，果期 9–11 月**（两种两志一致）；OSU 记花小、绿色、不显眼 [1][2][3][4][5][7]
  - Form: Range + Qualitative
  - Evidence Status: Verified
  - Source: [1][2][3][4][5][7]

## 3. 轮廓与比例

- 树形语言（重点问题）：**vase 形（高杯状/花瓶形）冠——冠基部收窄、向上渐宽、顶部圆穹**。文献链：OSU 「vase-shaped, low branched」+ 品种描述「vase shaped with upright arching branches」[7]；照片链：canopy-a 判「vase-like（narrower at base, wider upward, dome top）」、form-b 判「vase-like then rounded top (classic zelkova)」、form-a 判「vase/broad-ovate」[8]——文献 + 照片三样木一致
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [7][8]
- vase 形结构成因（重点问题）：**骨架枝以中等角度开张出干（对铅垂 ≈40–60°）后向上拱弯（arching），末级枝密集且梢端上举**——冬季裸枝照判「branches upright-arching, radiating upward and outward at 30–60° from vertical；young twigs arch upward at tips」+ OSU「upright arching branches」+ 细枝密网（dense fine twig network）在高处填充加宽形成上宽轮廓 [7][8]
  - Form: Qualitative
  - Evidence Status: Inferred（照片双源 + 文献同向交叉）
  - Source: [7][8]
- 冠幅/树高比：≈0.8–0.95（form-a 0.85–0.95 / form-b 0.8–0.9 双样木）——与朴树 0.8–0.9、樟树 0.7–0.85 相比属最阔读向，vase 形横展所致
  - Form: Range
  - Evidence Status: Inferred（照片双样木，单视觉系统）
  - Source: [8]
- 主干分枝点高度占比（干高/树高）：≈0.30–0.40（form-a 0.35–0.40 / form-b 0.30–0.35）——与朴树域 0.35–0.45 下段、樟树 0.30–0.35 重叠；OSU 另记园艺语境「low branched」（低干多干型亦存在，品种/修剪相关）[7][8]
  - Form: Range
  - Evidence Status: Inferred
  - Source: [7][8]
- 主干姿态：近直立、干通直（form 双样木判「straight」一致；文献乔木口径；OSU 品种 upright 前提）
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [8]（文献侧写 [1][2][7]）
- 冠层密度（生长季）：中-密——canopy 双样木逆光空隙 20–35%（canopy-a 20–30% / canopy-b 20–35%）；叶质细密（fine texture 双整树 + fine branchlets 双冠层一致）[8]
  - Form: Relative
  - Evidence Status: Inferred（照片双样木一致）
  - Source: [8]
- 内膛枝现象：**存在**——canopy-b 判「inner-crown bare twigs read as a fine, open network——visible but not dense」（冠内裸细枝细网可见）；整体外密内疏
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [8]

## 4. 结构层级

部件树：主干 → 骨架枝（一级粗枝）→ 二级枝 → 末级细枝（细密）→ 叶（落叶，冬季裸枝结构完全外显）。

- 骨架枝：≈4–7 根自主干分出（form-a 5–6/5–7、form-b 4–6），开张上拱（对铅垂 ≈40–60°，冬季裸枝判 30–60°），出干后先外展后上举
  - Form: Range
  - Evidence Status: Inferred
  - Source: [8]
- 分枝层级数：3–4 级可见（冬季裸枝照判「3–4 visible branching orders」自骨架枝至最细枝）[8]
  - Form: Value + Range
  - Evidence Status: Inferred
  - Source: [8]
- 末级细枝密度：**密**——冬季判「dense fine twig network」；末梢上举（twigs arch upward at tips）；canopy-b 生长季内膛细枝网可读 [8]
  - Form: Relative + Qualitative
  - Evidence Status: Inferred
  - Source: [8]
- 冬季枝态（重点问题，供通透规则参考）：落叶后冠结构**高通透、层级与上举姿态完全可读**（winter-a 2 月仰视：3–4 级分枝 + 密细枝网上举 30–60°）；骨架枝-粗枝树皮亦呈剥落斑驳（gray-green 基底 + 浅褐/橙斑），冬芽可见 [8]
  - Form: Qualitative
  - Evidence Status: Inferred（照片单样木双问一致）
  - Source: [8]
- 叶序：叶**互生、二列**（FOC 属级 "Leaves distichous"；OSU "simple, alternate"）——叶沿枝排成两列的榆科式平面排列 [6][7]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [6][7]
- 叶着生位置规则：叶集中于**末级枝外段受光区**（canopy 外密内疏读向）；文献记花生于幼枝叶腋、果几乎无梗着生枝上（叶/果同区）
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [8]（文献侧写 [1][5]）
- 小枝（辨析轴）：Z. serrata 当年生枝**紫褐色或棕褐色**，疏被短柔毛后渐脱落；Z. schneideriana 当年生枝灰绿色或褐灰色、密生灰色柔毛（FRPS 检索表同口径）[1][2][3][4]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][3][4]
- 冬芽（辨析轴）：Z. serrata 冬芽**圆锥状卵形或椭圆状球形**（单生）；Z. schneideriana 冬芽常 **2 个并生**、球形或卵状球形——两志检索表正式区别性状 [1][2][3][4]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][3][4]
- 叶形（结构，重点问题）：**卵形、椭圆形或卵状披针形**（两志两全种一致；OSU ovate to oblong-ovate）；先端**渐尖或尾状渐尖**（Z. schneideriana 兼有锐尖）；**基部有的稍偏斜**（base slightly oblique），圆形或浅心形、稀宽楔形；照片双叶一致判「ovate, acuminate tip, base oblique」[1][2][3][4][7][8]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][3][4][7][8]
- 叶基偏斜程度（重点问题，榆科核心辨识）：文献口径「**稍偏斜**」（slightly oblique，两种一致）；照片判读「slight to moderate obliqueness」（双叶一致，大叶榉叶照同判）——**程度上中等偏弱**：强于朴树（「几乎不偏斜或仅稍偏斜」），弱于榆属的显著偏斜；近景叶背/叶面可辨，中景不可辨 [1][2][3][4][8]
  - Form: Qualitative
  - Evidence Status: Verified（文献）/ Inferred（程度照片）
  - Source: [1][2][3][4][8]
- 叶缘（重点问题，与朴树分化的核心）：**全缘带齿、锐尖头单锯齿**——FRPS「边缘有圆齿状锯齿，具短尖头」（两全种同语）；FOC "margin serrate to crenate"；OSU "sharply serrate with acuminate teeth"；照片双叶判「sharp-pointed，单锯齿（非重锯齿），约 8–15 齿/侧」。**与朴树分化明确**：朴树齿限上半部、0–16 钝圆齿；榉树齿布全缘、尖头锐齿——中近景分化信号 [1][2][3][4][7][8]
  - Form: Range + Qualitative
  - Evidence Status: Verified
  - Source: [1][2][3][4][7][8]
- 叶脉（重点问题）：**羽状脉，侧脉直伸、脉端直达齿尖**——FRPS 属级「羽状脉，脉端直达齿尖」；FOC 属级 "venation pinnate; secondary veins extending to margin, each ending in a tooth"；OSU "parallel veins, 8–14 vein pairs"；照片双叶判「pinnate 8–12 对，veins run straight into teeth」。**与朴树三出脉（3-veined from base）、樟树离基三出脉构成三属脉型三分化**——榉树为纯羽状脉，无基出脉 [1][5][6][7][8]
  - Form: Value + Qualitative
  - Evidence Status: Verified
  - Source: [1][5][6][7][8]

## 5. 材质与表面

- 树皮类型学（重点问题）：**光滑基底 + 不规则薄片状剥落斑驳型**——FRPS：Z. serrata「树皮灰白色或褐灰色，呈**不规则的片状剥落**」、Z. schneideriana「树皮灰褐色至深灰色，呈不规则的片状剥落」（两全种同语）；FOC "grayish white to grayish brown, exfoliating"（两种同语）；OSU "Bark smooth-gray initially"（幼中龄光滑灰皮）[1][2][3][4][7]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][3][4][7]
- 树皮斑驳参数（照片）：新鲜剥落斑占可见干面 **≈15–30%**（bark-a 20–30% / bark-b 15–25%）；斑径 ≈**干径的 1/10–1/4**（bark-a 少数达 1/4–1/2）；新剥露斑与旧皮对比**中-高**（cream/tan/rusty orange-brown 暖色新斑 vs 灰绿-灰褐基底）[8]
  - Form: Range + Relative
  - Evidence Status: Inferred
  - Source: [8]
- 树皮颜色：基底灰白-灰褐/灰绿（文献灰白色或褐灰色 + 照片 gray-green base）；剥落斑暖色系——奶油白、浅褐、**锈橙-橙褐**；暗色小块镶嵌（dark mottling）。**四资产树皮语言分化**：夏栎脊沟纵纹 / 朴树平滑-浅裂小斑块（单色系灰白-灰褐）/ 樟树纵裂深沟 / **榉树光滑皮 + 暖色剥落斑驳（唯一带橙锈色新斑的语言）** [1][2][3][8]
  - Form: Qualitative
  - Evidence Status: Verified（基底色文献双志）/ Inferred（斑色照片）
  - Source: [1][2][3][8]
- 近景起伏量级（重点问题）：**微起伏**——光滑基底上剥落斑局部翘曲（薄片 lift and curl）产生局部微-中浮雕；**非脊沟型、非深裂型**（与樟树深沟、夏栎脊沟明确分化；较朴树浅斑块更「贴片感」）。记档：bark-a 单次判读内部由「平」修至「翘皮明显」，以「光滑基底 + 斑驳翘皮微起伏」为准、判读波动如实记 [8]
  - Form: Relative
  - Evidence Status: Inferred
  - Source: [8]
- 树皮附生：少量苔藓/地衣存在（鹿儿岛候选照判 lichen patches，单源筛选级；入库 bark 双照未显著）——覆盖度低，弱于樟树 [8]
  - Form: Qualitative
  - Evidence Status: Inferred（单源，低置信）
  - Source: [8]
- 树龄序列：幼-中龄光滑灰皮（OSU "smooth-gray initially"）→ 成龄剥落斑驳渐显（bark 双照中龄后段斑驳 15–30%）→ 粗枝同样剥落斑驳（winter-a 裸枝判读）[7][8]
  - Form: Qualitative
  - Evidence Status: Verified（幼皮 OSU）/ Inferred（序列幅度照片）
  - Source: [7][8]
- 叶面/叶背颜色区分（重点问题）：**叶面绿（干后绿或深绿）、稀带光泽；叶背浅绿**——Z. serrata 上面幼时疏生糙毛后脱落变平滑、背面幼时被短柔毛后脱落或仅沿主脉两侧残留；Z. schneideriana 上面被糙毛、背面密被柔毛（干后变淡绿至紫红）——**两面色差为深绿/浅绿中等对比，无粉感**（vs 樟树背面灰绿粉感）[1][2][3][4]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][3][4]
- 叶面质地（重点问题）：**半光泽 + 微糙感**——OSU "dark green and somewhat rough above (similar to a small-leaved elm)"；照片判「semi-glossy, slightly rough（subtle sandpaper 感）」；糙感来自细糙毛（幼时疏生、后脱落趋平滑但保留观感）[7][8]
  - Form: Qualitative
  - Evidence Status: Verified（OSU）/ Inferred（照片）
  - Source: [7][8]
- 叶质：**薄纸质至厚纸质**（FRPS/FOC papery to thickly papery）——较朴树（厚纸质至近革质）、樟树（近革质至革质）更薄，**背光透光在三资产中最强**（由质地推断，无定量）[1][2][3]
  - Form: Qualitative
  - Evidence Status: Verified（质地）/ Inferred（透光相对等级）
  - Source: [1][2][3]
- 冠层色域：生长季中绿-深绿、细质密叶（fine texture）；秋色见 §6 物候
  - Form: Qualitative
  - Evidence Status: Inferred
  - Source: [8]

## 6. 变体范围

- 两种合并辨析轴（近景维度，不改变建模主干）：**叶背毛被**（Z. serrata 近光滑 vs Z. schneideriana 密被柔毛——叶背哑光幅度轴）、**冬芽**（单生圆锥状 vs 常 2 个并生）、**当年生枝色**（紫褐/棕褐 vs 灰绿/褐灰密毛）——三者均数米内可辨的中近景辨析，建模可作为叶背/小枝材质变体维度 [1][2][3][4][8]
  - Form: Qualitative
  - Evidence Status: Verified（文献）/ Inferred（2m 不可分 [8]）
  - Source: [1][2][3][4][8]
- 尺度幅度：物种上限 30–35m（两志极值）→ 栽培成熟域 15–18(24)m（OSU）→ 公园中龄 ≈8–12m（弱推断）；OSU 记相对慢生，同龄个体差异弱于速生樟 [1][2][3][7]
  - Form: Range
  - Evidence Status: Verified（上两级）/ Inferred（中龄域）
  - Source: [1][2][3][7]
- 冠形变体（园艺证据，联动轴）：典型 vase 上宽杯状 → 顶部圆穹（form-b「vase-like then rounded top」）；OSU 品种群给出**真实冠形变幅**：Green Vase®（15×12m vase）/ Village Green（12m vase-rounded dense）/ Musashino（14×6m 直立窄冠）/ Wireless®（7.6×11m 低矮开张）——**冠幅比与干高存在宽-窄两端真实分化**，8 槽形态向量可在此轴展开 [7][8]
  - Form: Qualitative + Range
  - Evidence Status: Verified（品种记载）/ Inferred（典型倾向）
  - Source: [7][8]
- 叶形连续幅度：FRPS 两全种均明文「**大小形状变异很大**」（并入变体声明）；文献域 3–10 × 1.5–5cm；长枝叶可达 13cm（OSU）；长宽比 ≈1.8–2.2（照片双叶 + 大叶榉叶三验一致）；先端渐尖至尾状渐尖幅度 [1][2][3][4][7][8]
  - Form: Range
  - Evidence Status: Verified（变幅声明与文献域）/ Inferred（比例照片）
  - Source: [1][2][3][4][7][8]
- 侧脉对数变幅：(5–)7–15 对跨源域（FRPS serrata (5-)7–14 / FOC 9–15 / schneideriana 8–15 / OSU 8–14）
  - Form: Range
  - Evidence Status: Verified
  - Source: [1][2][3][4][7]
- 秋色联动（不建模记档）：OSU 记秋色变幅宽——黄、黄/橙铜、橙、红、红紫；照片 11 月双样木主体橙-橙红（60–70%）混绿 20–35%（东京/宇都宫）；**秋色是榉树最强季节信号，色系以橙-铜橙-红为主，非朴树的黄-橙** [7][8]
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [7][8]
- 落叶期（侧证推断）：11 月中旬满冠秋色（canopy-a 2021-11-15）、11 月上旬整树秋色（form-b 2022-11-03）、12 月初仍挂红橙叶（江戸川区候选照 2021-12-02 筛选残值）——**深秋-初冬（≈11 月下旬–12 月）渐落**，落叶窗口晚于朴树（香港样本 11 月中已裸枝）
  - Form: Range
  - Evidence Status: Inferred（照片侧证）
  - Source: [8]
- 新叶期与新叶色（不建模记档）：长沙 2022-03-18 新叶已展、**淡黄绿色**（leaf-a）；无红褐/古铜新叶记载（樟树有 bronzy 记载，榉树两志与 OSU 均无）——新叶色 Unknown 倾向淡黄绿（单照片源）
  - Form: Qualitative
  - Evidence Status: Inferred（淡黄绿单源）/ Unknown（是否有古铜调）
  - Source: [8]
- 树龄联动：幼中龄光滑灰皮 → 成龄剥落斑驳渐显（OSU + 照片序列）；毛被随叶龄脱落（幼叶糙毛/柔毛 → 成叶趋光滑，FRPS 两全种）
  - Form: Qualitative
  - Evidence Status: Verified
  - Source: [1][2][3][7]

## 7. 远近景保留优先级

（写到视觉显著性为止；面数/切换距离等工程映射归任务书）

- 远距（>50m）：**上宽下窄的 vase/高杯状冠轮廓 + 中绿-深绿色块（秋季转橙-红橙）+ 灰白-灰褐光滑干剪影**可辨认；单叶、锯齿、剥落斑均不可辨，可全部牺牲
- 中距（10–50m，本项目主语境）：vase 冠形与开张上拱骨架枝剪影、**细质密叶的「细纹理」冠面**（fine texture 是榉树 vs 朴树中距可读差异）、外密内疏团块与内膛细枝网、树干暖色剥落斑驳是主要辨识特征；秋季整体转橙为强季节信号
- 近距（数米）：卵形渐尖叶 + 全缘尖锯齿 + **羽状脉直伸齿尖** + 叶基稍偏斜 + 两面深绿/浅绿差与半光泽微糙感、树皮光滑基底 + 奶油-锈橙剥落斑（占 15–30%）+ 微起伏、紫褐小枝与圆锥状冬芽依次进入可辨域
- 牺牲顺序（远→近）：叶脉与锯齿细节 → 叶形/偏斜/两面差 → 剥落斑驳色差 → 细枝密网上举姿态 → vase 冠轮廓与色块（最后保留）

## 8. 来源证据

| # | 来源 | 类型 | URL/文献 | 检索日期 | 提取内容 |
|---|------|------|----------|----------|----------|
| 1 | 《中国植物志》第 22 卷 (1998) p.383（经 iPlant 数据端点提取全文） | 植物学文献 | https://www.iplant.cn/info/Zelkova%20serrata （数据端点 /ashx/getfrps.ashx?key=Zelkova serrata） | 2026-09-20 | 榉树（名医别录）光叶榉（中国树木分类学）；乔木高达 30m 胸径达 100cm；树皮灰白色或褐灰色呈不规则的片状剥落；当年生枝紫褐色或棕褐色疏被短柔毛后渐脱落；冬芽圆锥状卵形或椭圆状球形；叶薄纸质至厚纸质、大小形状变异很大、卵形椭圆形或卵状披针形 3–10 × 1.5–5cm、先端渐尖或尾状渐尖、基部有的稍偏斜圆形或浅心形稀宽楔形、叶面绿幼时疏生糙毛后脱落变平滑、叶背浅绿幼时被短柔毛后脱落或仅沿主脉两侧残留、边缘有圆齿状锯齿具短尖头、侧脉 (5-)7–14 对；叶柄粗短 2–6mm；核果几乎无梗淡绿色斜卵状圆锥形径 2.5–3.5mm 网肋明显被柔毛宿存花被；花期 4 月果期 9–11 月；产辽宁（大连）至广东并延日本朝鲜，海拔 500–1900m，**在华东地区常有栽培**；叶的形态大小侧脉数量毛被变异都很大（台湾 var. tarokoensis 归并注记） |
| 2 | 《中国植物志》第 22 卷 (1998) p.385（经 iPlant 数据端点提取全文） | 植物学文献 | https://www.iplant.cn/info/Zelkova%20schneideriana （数据端点 /ashx/getfrps.ashx?key=Zelkova schneideriana） | 2026-09-20 | 大叶榉树（中国树木分类学）血榉（江苏扬州）等；乔木高达 35m 胸径达 80cm；树皮灰褐色至深灰色呈不规则的片状剥落；当年生枝灰绿色或褐灰色密生伸展的灰色柔毛；冬芽常 2 个并生球形或卵状球形；叶厚纸质大小形状变异很大、卵形至椭圆状披针形 3–10 × 1.5–4cm、先端渐尖尾状渐尖或锐尖、基部稍偏斜圆形宽楔形稀浅心形、叶面绿被糙毛、叶背浅绿密被柔毛、边缘具圆齿状锯齿、侧脉 8–15 对；叶柄粗短 3–7mm；核果与榉树相似；花期 4 月果期 9–11 月；产陕南至西藏东南部，**华东和中南地区有栽培**；「Z. schneideriana 和 Z. serrata 极其近似，前者冬芽常 2 个并生、叶厚纸质、下面密生柔毛可与后者区别」；血榉为上等木材 |
| 3 | Flora of China Vol.5 (2003)（经 iPlant 数据端点提取全文） | 植物学文献 | 数据端点 /ashx/getfoc.ashx?key=Zelkova serrata | 2026-09-20 | Trees to 30m d.b.h. to 1m, deciduous；bark grayish white to grayish brown, exfoliating；branchlets brownish purple to brown pubescent or glabrescent；winter buds conic-ovoid to ovoid；叶 elliptic to ovate-lanceolate 3–10 × 1.5–5cm papery to thickly papery、apex caudate-acuminate、base slightly oblique rounded or shallowly cordate、margin serrate to crenate、secondary veins 9–15；petiole 2–6mm；drupes pea green 2.5–3.5mm irregularly obliquely ovate-conic 网肋；Fl. Apr, fr. Sep-Nov；分布中国东部至日本/朝鲜/千岛 |
| 4 | Flora of China Vol.5 (2003)（经 iPlant 数据端点提取全文） | 植物学文献 | 数据端点 /ashx/getfoc.ashx?key=Zelkova schneideriana | 2026-09-20 | Trees to 35m d.b.h. to 80cm；bark grayish brown to dark gray, exfoliating；young branchlets gray to grayish brown densely grayish white pubescent；winter buds usually united, ovoid to ovate；叶 ovate to elliptic-lanceolate 3–10 × 1.5–4cm thickly papery、abaxially green to reddish purple and densely pubescent、adaxially green to brown and strigose、base slightly oblique、margin serrate to crenate、apex acuminate to acute、secondary veins 8–15；drupes 2.5–3.5mm；Fl. Apr, fr. Sep-Nov；中国特有 |
| 5 | 《中国植物志》第 22 卷榉属属级描述（经 iPlant 数据端点） | 植物学文献 | 数据端点 /ashx/getfrps.ashx?key=Zelkova | 2026-09-20 | 榉属：**落叶乔木**；叶互生具短柄、**有圆齿状锯齿、羽状脉、脉端直达齿尖**；托叶成对离生早落；花杂性几乎与叶同时开放；核果偏斜宿存柱头喙状背具龙骨状凸起；约 10 种地中海东部至亚洲东部，我国 3 种；检索表：榉树=当年生枝紫褐/棕褐无毛或疏被毛、叶两面光滑或背面沿脉疏生柔毛；大叶榉树=当年生枝灰/灰褐密生灰白柔毛、叶背密生柔毛叶面被糙毛 |
| 6 | Flora of China Zelkova 属级描述（经 iPlant 数据端点） | 植物学文献 | 数据端点 /ashx/getfoc.ashx?key=Zelkova | 2026-09-20 | Trees, deciduous；**Leaves distichous**, margin serrate to crenate; **venation pinnate; secondary veins extending to margin, each ending in a tooth**（脉端入齿术语级确认）；flowers polygamous appearing with leaves；Five species E & SW Asia, SE Europe; three species (two endemic) in China |
| 7 | Oregon State University Landscape Plants — Zelkova serrata（大学园艺系园林植物库） | 园艺/林业官方 | https://landscapeplants.oregonstate.edu/plants/zelkova-serrata （curl 原始 HTML 提取） | 2026-09-20 | Broadleaf deciduous tree, 50–60(80)ft [15–18(24)m], **vase-shaped, low branched**；Bark smooth-gray initially；叶 ovate to oblong-ovate 2.5–5cm long (some shoots to 13cm), **sharply serrate with acuminate teeth**, parallel veins, 8–14 vein pairs, **dark green and somewhat rough above** (like small-leaved elm)；fall color variable: yellow, yellow/orange bronze, orange, red, reddish purple；果 small triangular drupe ~2mm green then brown；sun, moist deep soil；相对慢生；美洲榆替代候选（抗荷兰榆病）；品种：Green Vase®（15×12m vase, upright arching branches）/ Village Green（12m vase-rounded dense）/ Musashino（14×6m 窄冠）/ Wireless®（7.6×11m 低矮开张）；Native to Japan |
| 8 | iNaturalist research-grade 真实照片（CC BY / CC BY-NC，直接视觉证据；本地副本 ref-zelkova-*.jpg 不入 git）。入库 10 张均经双次独立视觉提问（①完整轮廓可见性+主题类型判别 ②定量/定性特征估计）结论一致后定名 | 真实照片 | 照片页 https://www.inaturalist.org/photos/<id>：272252940（form-a，东京豊島区 2023-04 街道夏绿整树，CC-BY-NC）；241371269（form-b，宇都宮八幡山公園 2022-11 秋色整树带行人参照，CC-BY）；171156091（bark-a，東京江戸川区 2021-12 主干皮剥落斑驳，CC-BY）；131873396（bark-b，神奈川逗子 2021-05 双干皮+剥落斑，CC-BY）；169055323（canopy-a，東京目黒 2021-11 秋色冠层对天，CC-BY-NC）；241371279（canopy-b，八幡山公園 2022-11 橙色冠层带干，CC-BY）；183886270（leaf-a，长沙 2022-03 春季新叶，CC-BY-NC）；371319088（leaf-b，Norristown PA 2024-04 手持叶，CC-BY）；119245956（winter-a，佐贺武雄 2021-02 冬季裸枝冠仰视+粗枝皮，CC-BY-NC）；363155372（leaf-sch，杭州 2024-04 **Z. schneideriana** 叶对比照，CC-BY-NC）。原图 CDN：https://inaturalist-open-data.s3.amazonaws.com/photos/<id>/original.{jpg\|jpeg}（扩展名自 API JSON large_url 权威提取） | 2026-09-20 | 整树（夏绿 vase/broad-ovate 冠幅比 0.85–0.95、干高占比 0.35–0.40、骨架枝 5–7 张 40–60°、干直、fine texture；秋色 vase-then-rounded 冠幅比 0.8–0.9、干高 0.30–0.35、骨架枝 4–6 张 45–60°、秋色橙黄 60–70%）；冠层（逆光空隙 20–35%、叶团 1/8–1/10 冠幅、外密内疏、内膛细枝网可见、细枝 fine、秋橙红 60–70%+绿 20–35%）；树皮（灰绿-灰褐基底 + 奶油/浅褐/锈橙剥落新斑 15–30%、斑径 1/10–1/4 干径、中-高对比、光滑基底微起伏、薄片翘曲）；叶（卵形渐尖、长宽比 1.8–2.2、尖单锯齿 8–15 齿/侧、羽状脉 8–12 对脉直伸入齿、叶基稍-中等偏斜、半光泽微糙、新叶淡黄绿、柄约叶长 1/8–1/5）；冬季（3–4 级分枝、密细枝网、上举 30–60°、末梢上翘、粗枝剥落斑驳、冬芽可见、高通透）；大叶榉叶（2m 距离与光叶榉不可区分、叶背沿脉疏毛观感、单锯齿同） |

## 域扩展节：plant

（字段定义见 `.zcode/skills/asset-research/references/plant-schema.md` v0.2）

### A. 干与枝

- `trunk_height_ratio`：≈0.30–0.40（form 双样木：0.35–0.40 / 0.30–0.35）；OSU 品种语境另有 low-branched 变体读向 [7]
  - Form: Range | Evidence Status: Inferred | Source: [7][8]
- `trunk_taper_ratio`：Unknown（无可靠近景证据）
  - Form: Unknown | Evidence Status: Unknown
- `basal_flare_ratio`：不显-轻度（form-b 判「no obvious basal flare」；不可定量）
  - Form: Unknown（定性倾向不显）| Evidence Status: Unknown（定性 [8] Inferred 单源）
- `trunk_lean_angle`：近直立通直（form 双样木「straight」一致）
  - Form: Qualitative | Evidence Status: Inferred | Source: [8]
- `branching_levels`：3–4 级可见（winter-a 裸枝判读）
  - Form: Value | Evidence Status: Inferred | Source: [8]
- `scaffold_branch_count`：≈4–7（form-a 5–6/5–7、form-b 4–6；与夏栎 5–7、朴树 5–6、樟树 5–7 同量级）
  - Form: Range | Evidence Status: Inferred | Source: [8]
- `scaffold_angle`（骨架枝仰角，对铅垂方向）：≈40–60°（form 双样木 50–60°/45–60° + 冬季裸枝 30–60°）——开张后上拱
  - Form: Range | Evidence Status: Inferred | Source: [8]
- `branch_angle`（分枝角，子枝对父枝）：数值 Unknown；方向倾向**上举**（末级枝对父枝上翘，winter-a「young twigs arch upward at tips」）——vase 形上级枝上举是结构成因
  - Form: Unknown（倾向定性 Inferred）| Evidence Status: Unknown（定性部分 Inferred [8]）
- `branch_orientation`：Unknown（无轮生证据；倾向螺旋/互生散布，置信低；叶层面二列互生为唯一可判口径 [6]）
  - Form: Unknown | Evidence Status: Unknown
- `branch_length_decay`：Unknown
  - Form: Unknown | Evidence Status: Unknown
- `branch_radius_decay`：Unknown
  - Form: Unknown | Evidence Status: Unknown
- `branch_attachment_t`：Unknown
  - Form: Unknown | Evidence Status: Unknown
- `apical_dominance`：弱-中庸（vase 形多领导枝读向：无强单领导枝、多枝上拱共构冠顶；OSU vase/upright arching + 品种多干型）
  - Form: Qualitative | Evidence Status: Inferred | Source: [7][8]
- `branch_curvature`：**上拱-末梢上翘**（骨架枝开张后 arching、细枝末梢 arch upward；OSU「upright arching branches」+ winter-a 判读同向）——非下垂型
  - Form: Qualitative | Evidence Status: Inferred | Source: [7][8]
- `allometry_exponent`：Unknown（不得以面积守恒假设充 Verified）
  - Form: Unknown | Evidence Status: Unknown

### B. 叶与冠

- `leaf_attachment_rule`：叶二列互生（FOC 属级 distichous [6]；OSU alternate [7]）；冠内叶量集中末级枝外段受光区（canopy 外密内疏 + 内膛细枝裸）[8]
  - Form: Qualitative | Evidence Status: Verified（二列互生）/ Inferred（外段集中）| Source: [6][7][8]
- `leaf_cluster_density`：Unknown（定性：末级细枝密网 + 叶感细密 fine texture，中-高密观感 [8]）
  - Form: Unknown | Evidence Status: Unknown（定性部分 Inferred [8]）
- `clump_scale`：冠壳叶团 ≈1/8–1/10 冠幅（canopy-a/b 双样木一致；canopy-b 精判 1/10–1/15）
  - Form: Relative | Evidence Status: Inferred | Source: [8]
- `leaf_orientation_dist`：Unknown（未做朝向判读；二列叶序暗示沿枝平面排列倾向，未验）
  - Form: Unknown | Evidence Status: Unknown
- `leaf_size`：3–10 × 1.5–5cm（FRPS/FOC 两全种四源交叉）；典型单叶 ≈4–6 × 2–3cm（照片）；长枝叶可达 13cm（OSU）
  - Form: Range | Evidence Status: Verified | Source: [1][2][3][4][7][8]
- `leaf_aspect_ratio`：≈1.8–2.2（leaf-a/leaf-b/leaf-sch 三验一致）；文献端值域推上限 ≈2.7（10/3.5 中轴）——建模域取 1.8–2.4
  - Form: Range | Evidence Status: Inferred | Source: [8]
- `crown_transparency`：生长季中-密（逆光空隙 20–35%，canopy 双样木）；冬季高通透（裸枝 + 密细枝网，winter-a）
  - Form: Relative | Evidence Status: Inferred | Source: [8]
- `crown_fill_gradient`：外密内疏（canopy-a/b 双样木一致；内膛裸细枝网可见）
  - Form: Qualitative | Evidence Status: Inferred（照片双样木一致，单视觉系统）| Source: [8]

### C. 表皮与芽

- `bark_archetype`：**光滑-薄片剥落斑驳型**（光滑基底 + 不规则片状剥落，剥落斑呈暖色新露斑）；树龄序列：幼-中龄光滑灰皮（OSU）→ 成龄斑驳 15–30%（bark 双照）→ 粗枝同型（winter-a）；**非脊沟纵裂（樟/栎）、非单纯浅裂小斑块（朴）**——四资产中唯一「光滑 + 暖色剥落斑驳」语言
  - Form: Qualitative | Evidence Status: Verified（剥落型四文献源）/ Inferred（斑驳参数与序列）
  - Source: [1][2][3][4][7][8]
- `bark_color`：基底灰白-灰褐（文献）/灰绿（照片受光）；剥落新斑奶油白-浅褐-锈橙暖色系；暗色小块镶嵌；中-高明暗对比
  - Form: Qualitative | Evidence Status: Verified（基底文献）/ Inferred（斑色照片）
  - Source: [1][2][3][8]
- `bark_relief`：低-微起伏（光滑基底、剥落斑局部薄片翘曲；非沟脊浮雕）
  - Form: Relative | Evidence Status: Inferred | Source: [7][8]
- `bark_epiphytes`：少量苔藓/地衣（筛选级单源：鹿儿岛干皮 lichen patches；入库照未显著）——覆盖度低
  - Form: Qualitative | Evidence Status: Inferred（单源低置信）
  - Source: [8]
- `twig_surface`：一年生枝紫褐色或棕褐色、疏被短柔毛后渐脱落（Z. serrata，FRPS/FOC 双源一致）；大叶榉对照灰绿色密灰色柔毛（辨析轴）；皮孔文献未记
  - Form: Qualitative | Evidence Status: Verified（文献）/ Unknown（皮孔）
  - Source: [1][2][3][4]
- `bud_aspect`：冬芽圆锥状卵形或椭圆状球形（FRPS/FOC 双源一致）；照片冬芽可见但色形细节未判（Unknown）；大叶榉常 2 芽并生（辨析轴）
  - Form: Qualitative | Evidence Status: Verified（形文献）/ Unknown（色与照片细节）
  - Source: [1][2][3][4][8]

## 检索与证据备注

- 网络可达性（2026-09-20 本机）：iplant.cn 数据端点可达（FRPS/FOC 种级 ×2 + 属级 ×2 全文提取）；OSU 园艺库可达（curl 原始 HTML 提取）；iNaturalist www.inaturalist.org/observations.json 端点 + S3 CDN 可达；百度百科被安全验证拦截不可用；iPlant 条目页为 JS 壳无增量内容。**WebSearch 配额耗尽（2026-10-04 重置）全程未使用其输出；WebFetch 未用于正文事实**——「中国公园两榉相对栽培频度」无定量来源，以 FRPS 栽培语句（Z. serrata「常有栽培」vs Z. schneideriana「有栽培」）+ 正名口径为锚定依据，频度问题记 Unknown 不阻塞（合并口径下不改变建模关键面）。
- 图片检索双轨：按任务书先跑 image-search MCP 一轮（query：Zelkova serrata tree form / bark），结果噪声大（苗圃商品图、水印图库、错种入镜——悬铃木/山毛榉/杨树皮、CG 渲染图），**无一入库**；改按 camphor 先例成熟链路取 iNaturalist research-grade 观察（鉴定置信高），配额许可下覆盖东亚（东京/神奈川/佐贺/栃木/长沙/杭州）与美国东岸样木。
- 视觉核验口径（如实记档）：本子代理会话 Read 工具不返回图像内容（仅转存 CDN 返回 URL），子代理自身视觉通道不可用；实际链路为：本地副本经 Read 转存 CDN → 以转存 URL 喂多模态图像分析 MCP 直验。入库 10 张均经两次独立提问（①主题与轮廓完整性判别 ②定量/定性特征估计），**全部两次一致，无矛盾弃用**（弃用见下节）；快筛阶段另做 4 张带 id 拼贴板分类（其结论仅作候选分流，不入证据）。单视觉系统（MCP 双问）无第二视觉系统交叉——比例类数值（冠幅比/干高占比/骨架枝）维持 Inferred 不升格，与樟树先例首轮同口径，待主代理终审轮交叉。
- 原图获取记档：17 张候选 original 直取成功（扩展名自 API JSON large_url 权威提取——13 张 .jpg / 4 张 .jpeg），1 张（24339573）无 URL 记录仅 large 可得而弃；共 10 张入库 screenshots/ref-tmp/（ref-zelkova-form-a/b、bark-a/b、canopy-a/b、leaf-a/b、winter-a、leaf-sch），永不 git add。
- 尺度结构事实优先级执行情况：树高/胸径/叶尺寸/侧脉/物候全部以植物志（FRPS/FOC 双志 × 两全种）为准，OSU 仅作园艺语境交叉；照片只作形态佐证与比例推断（冠幅比、干高占比、骨架枝、斑驳参数等照片判读值全部标 Inferred）；3D/CG 案例零采用（image-search 轮的 CG 渲染图直接弃用）。

## 双验弃用记档（2026-09-20）

以下候选被弃用（矛盾或用途失效），只采其两次/多轮判读一致的残值：

| 照片 id（用途） | 弃用原因 | 采信残值 |
|---|---|---|
| 39872108（上野恩賜公園 2019-05，form 候选） | 快筛判「full crown」与单张 Q1 判「冠顶被裁」矛盾，整树资格失效 | 公园语境夏绿满冠 + fine texture 弱侧证（并入 §3 定性） |
| 138074573（台南 2021-06，canopy 候选） | Q1 判「成簇带叶枝 vs 天空」非冠层体，canopy 资格失效 | 绿叶簇背光透光观感（弱，不入正表） |
| 633502143（苗栗 2026-04，leaf 候选） | Q1 判「compound leaf 复叶」与榉属单叶矛盾（疑邻株入镜） | 无 |
| 75499759（群马 2020-04，leaf 候选） | 快筛判「翅果样果」与榉属核果矛盾（疑邻株榆树翅果入镜），未入双验 | 无 |
| 263697925（南京 2023-03，Z. schneideriana 叶候选） | 快筛判「翅果簇」与 3 月花期不符（疑邻株榆树），未入双验 | 无 |
| 8119414 / 131873270 / 79084714 / 57108634 / 272253004 / 171155976 / 633502108 / 119245943（各用途备选） | 未进入双验：对应用途均已有双验通过照片，不再消耗核验轮次 | 57108634 树皮地衣斑（单源，并入 bark_epiphytes 低置信）；171155976 12 月初仍挂红橙叶（落叶期侧证）；633502108 绿叶尖锯齿（弱） |

结构性缺口（Unknown Gate 相关）：枝轴结构数值（branch_angle 度数、长度/径衰减、着生区间、allometry、方位分布）无文献亦无可靠照片判读——全部 Unknown；若生产任务书需要，建议主代理补研或锚点门阶段裁定。冠形/树皮/叶三主面证据充分，上述 Unknown 均不阻塞主生产决策。

## 主代理终审记档（2026-09-20）

- **硬数值独立抽查**：光叶榉定名与检索表区别（冬芽单生 vs 2 并生）、叶 3–10 × 1.5–5cm、侧脉 (5–)7–15 对、「圆齿状锯齿具短尖头」、树皮「灰白或褐灰色不规则片状剥落」、核果 2.5–3.5mm、花期 4 月果期 9–11 月、OSU vase-shaped/upright arching/50–60ft——逐条与植物志/园艺库独立口径核对一致，无编造痕迹。
- **第二视觉系统交叉**（主代理对三张关键判读照片独立提问，与子代理 MCP 双问结果对照）：form-a 交叉读「中上部宽于基部 + 下枝 45–60°/上枝 20–30° + 骨架 5–7 + fine texture」（与 Spec 一致；冠幅比 0.7–0.8、干高占比 0.20–0.25 与子代理 0.85–0.95/0.35–0.40 有 ±0.1 级分歧——照片比例判读噪声域，两读并档，参数化取中庸）；bark-a 交叉读「光滑非沟脊 + 银灰-蓝灰基底 + 橙锈/cinnamon 暖色薄片剥落斑 + 边缘翘曲」（与 Spec 完全同向——**唯一带暖色剥落斑的树皮语言确认**）；leaf-a 交叉读「榆科叶三件套：偏斜基 + 尖锯齿 + 羽状脉直伸齿尖 + 两面深浅绿差」（与 Spec 一致；偏斜程度读 strong 于 Spec 照片读数、锯齿读 doubly serrate 于 Spec 单锯齿——**文献 Verified 口径（稍偏斜/尖头单锯齿）优先为参数化依据**，照片读数记变体噪声）。
- **终审结论**：Spec 1.0 通过主代理终审，锚定种 Z. serrata + 合并口径成立；比例类 Inferred 维持（两视觉系统分歧已记档，生产取中庸域）。
