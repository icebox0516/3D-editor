/**
 * runtime/procedural/tree/fraxinus/fraxinusGeometry —— 白蜡树（Fraxinus
 * chinensis subsp. chinensis 白蜡树原亚种本尊——种定名终审裁决 1，木犀科梣属
 * 落叶乔木——长江流域城市公园夏绿单干中龄个体 ≈10m，卵圆-圆头开展冠 + 中位分歧
 * + 开展外斜大枝）CPU 几何生成器（T011.10，阔叶家族第十一实例——方法复制自夏栎
 * 第一实例经朴树/香樟/榉树/银杏/悬铃木（单叶先例）/栾树（011.6 复叶首例——复叶卡
 * 路径）/乌桕（011.7 零 rng 果账目 + uv 域隔离断言）/重阳木（011.8 两段 scaffold
 * 角带）/国槐（011.9 一回奇数羽状窗列单级化——**最直接模板**：白蜡 = 直接羽状
 * 第二实例，同型不同数值对照）十次验证的通路 ../sophora/sophoraGeometry，契约字段
 * 语义不变：五级递归分枝拓扑 / 锥度管状枝干 / 枝梢驱动叶簇 / 冠内通透三规则 /
 * 树皮近景微起伏 / LOD 三档同流派生全部沿用；白蜡数值与算法细节差异点见下）。
 *
 * 职责：morphRng（mulberry32 流，消费顺序即契约——同 seed 逐位同结果）驱动的五级
 *      递归分枝拓扑 → 锥度管状枝干（平行传输标架）→ 枝梢驱动**一回羽叶卡（对生
 *      挂点语言）**烘焙 + **匙形翅果帘幕簇**（夏末盛挂身份信号——终审裁决 4 做），
 *      产出树皮/叶两层非索引几何；层间 mergeGeometries(useGroups=true) 恰 2 组
 *      （D15 免组膨胀：皮 0 / 叶 1——**翅果入皮组（组 0）**，材质接口约定见下）。
 *      形态参数类型 = 阔叶家族契约 ../broadleaf/broadleafShapeProfile（白蜡为第十
 *      一实例，零修改实例化），数值与槽组合见 ./fraxinusShapeProfile（全部数值依据
 *      docs/research/fraxinus-reference.md Spec 1.0——**生产一律以文末「终审记档」
 *      ③ 终审裁决八项为唯一事实源**：树高 ≈10m 裁决 2、花不做裁决 3、翅果做裁决 4、
 *      翅果主域裁决 5、树皮第 11 语言裁决 6、冠幅比 0.7–1.0 裁决 7、三重对生裁决 8）；
 *      build 只做 slot → profile 路由，不进 ProceduralBuild 公共签名。
 * 白蜡算法细节差异点（vs sophora 模板，逐条 Spec 引用见 fraxinusShapeProfile 内联
 *      注释；主代理 Step 1 判定为执行依据）：
 *   - 尺度锚：公园单干中龄个体 ≈10m（志书「落叶乔木，高10-12米」直给——裁决 2
 *     罕见志书级体量锚，卵圆开展冠不取高端）——形态参数域树高 9.9–10.7m（初值；
 *     **Step 3 探针回调记档**：弱-中庸领导 0.50 + 卵圆冠的涌现折减（国槐同链
 *     ~1.5m 量级）下实测定档，终测带见 asset 模块头）；干高参数域 0.26–0.34
 *     （trunk_height_ratio Unknown + 中位分歧读向的带内映射）；根径 0.24–0.30m
 *     （DBH Unknown——工程设定，「材理通直」[1] 细干读向取家族带内偏细档）。
 *   - 干形：近直立单干（多干萌生相为变体端——**记档不建模**：结构差异不落连续
 *     参数，家族同款纪律）→ 主干倾轴幅度 ≤2.9°（jitter 0.05）；根部 flare 轻度
 *     1.18×（basal_flare Unknown——家族常量）。
 *   - 树形：**卵圆-圆头开展冠 + 中位分歧 scaffold + 开展外斜大枝 + 弱-中庸领导枝**
 *     （Spec §3 冠形重点问题：form-a 双问「主枝中位分歧、大枝开展外斜」+ form-c
 *     「大骨架枝伸展→圆润开敞冠」+ fruit-c「主枝自主干向上外斜伸」三源 Inferred
 *     [12]——终审裁决 7 冠幅比 0.7–1.0 比国槐 0.9–1.2 窄一档）——几何侧驱动链
 *     （T009.3 消费语义）：**单段角域直读**（scaffoldAngleMin/Max 46–62° 斜上-
 *     开展外斜中带直接消费——**无国槐两段角带**（SCAFFOLD_BAND 不复制：中位分歧
 *     无主枝低位放射身份，槽间角域差异整体平移单段域）+ **挂高段中位**（0.58–0.78
 *     span 0.20——vs 国槐 0.52–0.74 低位：挂高段下缘上抬一档）+ **无国槐干向长度
 *     分级**（SCAFFOLD_LENGTH_TAPER 不复制——低位长枝放射放张为国槐专属语言，白蜡
 *     rank 乘子承担环内势差）+ upturn 链低正（[0.09,…,0.04] 单调递减——端部小枝
 *     斜上收口，圆头冠顶闭合由角域 + 领导链承载）+ 领导枝弱-中庸 0.50（apical
 *     「中庸-失去领导」Inferred [12]——圆头顶由上段骨架链共构）+ 散布方位（骨架
 *     排列 Unknown [12]）。
 *   - **一回羽叶卡对生挂点语言（本树核心分化位，家族复叶第四型 / 对生系首例——
 *     终审裁决 8「三重对生」的几何落地）**：卡路径沿 011.9（1 卡 2 tri 承载整枚
 *     一回奇数羽叶；窗列单级化——小叶严格对生窗列 + 顶生小叶独立窗位 + 裸柄段
 *     更长全部归 fraxinusMaterials 复叶 SDF 层〔冻结接口：v=0 复叶基部（裸柄段）
 *     → v=1 顶生小叶尖、u=0.5 叶轴中轴、宽/长 0.36〕）：家族「叶簇」槽位 = 末级
 *     枝**decussate 对生对散布小卡簇**——簇内复叶卡方位 = **对生对 + 相邻对交互
 *     90°**（φ_j = ⌊j/2⌋×90° + (j mod 2)×180° + 微抖动——「叶对生」属级 Verified
 *     [5][6] 的几何落地〔decussate = 对生叶序的交互对生标准式〕，vs 国槐黄金角
 *     互生螺旋 φ_j = j×137.5°——复叶系内同型不同排列的直接对照轴）；**对内共享
 *     簇内径向位 r̂**（对首卡消费 rng、对次卡复用——同节对生语义：一对复叶自同
 *     一节位向相反方向展开；消费次数由 j 奇偶确定性决定，固定次数纪律不破）；
 *     对生抖动小档（±0.20 rad ≈ ±11.5°——「对生严格」读向：排列可读优先，vs
 *     国槐互生螺旋 0.45 打散）；**平展取向**（PLANE_LIFT 0.11 沿用——羽叶平展
 *     层叠〔域扩展节 B leaf_orientation_dist Inferred [12] 均质细碎冠面〕）+ 略
 *     前倾（FORWARD_TILT 0.24）+ 弱抖动（WOBBLE 0.15）；每簇 10 候选 = 5 个对生
 *     对（对生叶节位合并抽象——真复叶沿枝对生节距 ~3–6cm × 卡长 0.21–0.35 ⇒
 *     ≈4–8 节位的连续节位合并，通透过滤后逐簇存活典型 5–9 枚）；小簇（0.15–0.22）
 *     + 中间距抑制（minSeparation 0.55×径和）；**卡宽/长比冻结 0.36**（aspect =
 *     1/0.36 ≈ 2.7778 恒定、span 0——小叶更大更少（5–7 枚 3–10cm vs 国槐 9–15
 *     枚 2.5–6cm）故略宽于国槐 0.34）；卡宽 0.076–0.126（真复叶 15–25cm Verified
 *     [1][2][3] × ≈1.4 工程映射——011.6/011.8/011.9 复叶映射系数沿用）。
 *   - **匙形翅果帘幕簇（Spec 判定做——终审裁决 4/5：匙形单翅果家族独有造型（vs
 *     国槐念珠肉质/栾灯笼/乌桕绿闭果）+ 可见窗口极长（7–9 月盛挂 + 宿存至翌年 2
 *     月照片双源——覆盖 9–10 月主语境）+ 满冠帘幕显著（fruit-c 双问 very
 *     conspicuous））**：**果簇沿末级枝梢下垂挂、满冠分布**（fruit-a「每簇 10 枚
 *     级下垂簇」+ fruit-c「满冠帘幕」[12]——**vs 国槐念珠串冠缘散点：资格门槛
 *     更宽（q ≥ 0.30 满冠外-中部带 vs 国槐 0.42 冠外带——裁决 5 挂点分布密度
 *     显著高于国槐的账目实现）**）——**零 rng 确定性挂点账目法**（011.6/011.7/
 *     011.9 先例：保留 L5 簇位冠带判据 + 位置散列排序 + 固定步长抽选
 *     （SAMARA_STRIDE）——账目恒等可断言，组 0 带不随 roll 浮动）；**主域单果
 *     3–4cm × 宽 4–6mm 匙形**（「翅果匙形，长3-4厘米，宽4-6毫米」FRPS Verified
 *     [1]——裁决 5）**× 2 家族工程映射 → 果长 0.06–0.08m / 果宽 0.008–0.012m**；
 *     每簇 8–12 果（簇 10 枚级 [12] 的全域确定性分布——果序轴下垂 0.10–0.20m
 *     （真簇 5–10cm ×2）+ 果沿轴散布、果长轴斜下外姿态〔果序下垂密簇 [12]〕）；
 *     几何 = **扁平 quad 面片果，正反双 quad = 4 tri/果**（「双 tri 双面渲染」
 *     冻结接口——双面由几何侧承担〔材质组 0 FrontSide，fraxinusMaterials 缺口
 *     候选③〕：冠下仰观（fruit-c 主视角）背面可见——身份信号关键视角；正面绕序
 *     (p0,p1,p2)/(p0,p2,p3) + 法线 n、反面顶点序反转 + 法线 −n，同 uv 同账）；
 *     **uv 果域标记 v∈[4.0,4.97]**（triadica/sophora 冻结口径——坚果端 v=4.0 /
 *     翼尖 v=4.97：材质按 (v−4.0)/0.97 归一长轴分流果配方；面尖 4.97 < 5）+ **u
 *     = 逐果色档随机 ∈ [0,1)**（位置散列，果内 12 顶点同值——材质果色档通道：
 *     嫩绿→黄绿→淡褐色序同树并存 [12]，冻结接口）；**入皮组（组 0）**——
 *     fraxinusMaterials（park-shader-agent 并行交付）按 v 域分流翅果配方；
 *     aLeafRand/aBend 随皮组恒 0（果簇刚性悬垂——摆动语义归材质层/缺口候选）；
 *     数量级定档 **SAMARA_STRIDE 5 实测（8 槽簇带/果带/Mid 预算落带见 asset 模块
 *     头终测记档——任务书 400–900 果/40–90 簇数量级按 Mid 预算带定档）**；
 *     Low 档翅果省略（triadica/sophora/koelreuteria Low 果省略先例——远距亚像素，
 *     档间连续记档）。
 *   - **uv 域身份标记双重隔离（家族探针断言纪律沿用——platanus v∈[2,3] 与皮管
 *     弧长域碰撞 66 顶点先例教训）**：皮管 v = 累计弧长 × 0.5（10m 级最长枝弧实测
 *     ≤ ≈2.4）｜翅果 v∈[4.0, 4.97]——**皮管弧长域不得侵入 [3,4) 隔离带与 [4,5]
 *     果域**：测试探针断言「v∈[3,4) 顶点数 = 0（隔离带空）+ 果域顶点 = 果 × 12
 *     （双 quad 4 tri × 3 顶点）+ v∈[5,7) 顶点数 = 0（无花资产——裁决 3）+ 皮组
 *     其余顶点 v < 2.5」（fraxinusStructure 测试锁）。
 *   - 骨架：**6 骨架枝 + 1 领导枝**（scaffold_branch_count Unknown + 开展冠多枝
 *     读向 [12]；族内预算行沿用——拓扑 L1=7 → 枝数 [7,21,63,189,378]、簇位 945
 *     （L4 189×1 + L5 378×2）、皮面 24178：主干 406（14 段 ×14 + 底盖 14）+
 *     L1 1008（7 枝 ×9 段 ×8）+ L2 2352（21 ×8 段 ×7）+ L3 3780（63 ×5 段 ×6）+
 *     L4 7560（189 ×4 段 ×5）+ L5 9072（378 ×3 段 ×4）；小卡高数量 + 翅果簇组 0
 *     预算留带内余量）。
 *   - 密度语言：**中通透**（空隙 ≈25–40% 弱双源 Inferred [12]——fruit-c「airy
 *     开放」+ form-c「细枝疏网」；vs 国槐 10–20% 致密端——裁决 7 族门密度横向
 *     对照第二对样本）：canopyDensity 0.86 + 中壳带 0.48 + 芯层地板 0.07（芯层可
 *     空透）+ 空腔 3 个中域 0.46–0.80（vs 国槐 2 个小域——通透相空腔多而大）+
 *     散布平摊浅壳（clusterShellBias 0.42）。
 *   - 树皮近景微起伏：**灰褐浅-中纵裂（浅细脊沟、无剥落无碎翘）+ 幼干-大枝近光滑
 *     + 皮孔小不明显**（第 11 树皮语言，终审裁决 6；FRPS「树皮灰褐色，纵裂」
 *     Verified [1] + 多源中景照片合并 [12]——建模取中龄浅-中纵裂端）——
 *     amplitudeRatio 0.020（**中低档——浮雕幅度比国槐 0.032 低一档**（浅细脊沟
 *     vs 厚脊深沟）；vs 先例樟 0.036/夏栎 0.033/银杏 0.030/重阳 0.028/乌桕 0.027/
 *     朴 0.016/榉-悬 0.014–0.015/栾 0.013）+ 谐波 {4,6}（浅细脊 = 比国槐厚脊
 *     {3,4,6} 细一档的次低谐波 + 奈奎斯特域 7 留 1 档边际）+ drift 3.6 rad/m
 *     （**顺直档**——纵脊长程连续（轴向去相关 ≈2π/3.6 ≈ 1.75m）：顺直脊沟族带内
 *     （银杏 2.6/乌桕 2.8/樟 3.2 邻档），无国槐「纵为主局部交叉」5.5 读向）。
 *     机制不变：纯确定性函数零 rng；幅度 ∝ 局部半径（**亚视觉地板 3.5mm
 *     （FRAXINUS_BARK_RELIEF_MIN_EFFECTIVE，011.8/011.9 同款）**：0.020 下起径
 *     < 0.175m 的管平滑发射，L1 骨架起径 0.08–0.11 在地板下 → **仅主干有效起伏**、
 *     全部分枝管光滑（「幼干-大枝近光滑 + 浅裂显于主干」裁决 6 的几何侧读向——
 *     皮孔/灰褐色调/地衣绿斑归材质层））；主干 radial 14（奈奎斯特域 7 容纳 k=6
 *     留 1 档边际）。
 *   - **嫩枝交互扁平不表达记档**（属级「嫩枝在上下节间交互呈两侧扁平状」Verified
 *     [5]：亚厘米级近景信号，末级管径向 4–5 段下椭圆化不可读且改变管发射法线机制
 *     ——归缺口候选，取舍记 fraxinusShapeProfile 改写项 2）；**无国槐 zigzag
 *     交替偏置**（Spec 无白蜡 zigzag 证据——细级形态由 wander 梯度承载，对照轴
 *     记档）。
 * 不建模（Spec 有事实、几何不表达——记档见 fraxinusShapeProfile 模块头）：一回
 *   羽叶内部结构（小叶 5–7 枚严格对生窗列/顶生近等大/裸柄段 1/4–1/3/小叶三相/
 *   缘整齐锐锯齿/两面色差——归材质 SDF）/花（终审裁决 3 不做——无花冠最弱信号，
 *   无花果域 v∈[5,7] 空）/翅果色序细档与宿存冬态（归材质 u 通道/风格层）/对生
 *   芽序（冬态-早春近景信号，夏绿相不建模）/秋色黄（记档不建模）/山地 gnarled 相
 *   /subsp. rhynchophylla 北方亚种差分/树皮皮孔与地衣绿斑（归材质层）/多干萌生相。
 * 结构计数：皮拓扑（枝数/环数/径向段）槽间恒定 → 皮面数恒等（High 24178 账目见
 *      上）；Mid 4514 = 主干 90（7 段 ×6 + 底盖 6）+ L1 350（7 枝 ×5 段 ×5）+
 *      L2 672（21 ×4 段 ×4）+ L3 1134（63 ×3 段 ×3）+ L4 2268（189 ×2 段 ×3），
 *      L5 不发射；Low 370 = 主干 90 + L1 280（7 枝 ×5 段 ×4）。簇位数 945（L4
 *      189×1 + L5 378×2）/每簇 10 卡为计数类（rng 消费次数恒定），**翅果挂点零
 *      rng**（确定性账目——无消费口径问题），保留簇数与实际叶卡数随 seed 由簇级
 *      距离抑制 + 通透规则确定（同槽同 seed 恒等——确定性不破）。
 * 确定性纪律（家族纪律原样沿用）：簇生成与叶片候选的 rng 消费均为无条件固定次数
 *      （每簇：簇位 3 次（t 抖动/半径/——见 growBranch 实现注释）+ 每卡 7 次（对
 *      首卡）/6 次（对次卡，r̂ 复用——对生对共享节位的确定性消费结构）），被簇级
 *      距离抑制丢弃的簇位足额消费后丢弃；通透 roll 每卡无条件 1 次——任何条件跳过
 *      都禁止（档间同理：Mid/Low 的发射省略不省略消费）。**探针闭包教训（011.3 ③）**：
 *      rng 消费计数必须用包裹 rng 闭包实测（每次调用即计数），不得事后重建流复算
 *      ——消费次数以测试锁定快照为准。结构消费全部固定次数；总消费数随保留簇数
 *      变化（通透 roll 计数 = 存活候选数）——槽内三档恒等（同 seed 同保留簇集）、
 *      跨槽/跨 seed 随保留簇数浮动（实测带见 fraxinusStructure 测试快照注释）。
 * 叶卡属性契约（008.3 起冻结，本任务只消费不修改）：
 *      - aLeafRand：Float32 itemSize 1，逐叶 ∈ [0,1)，同一叶卡 6 顶点同值；皮组
 *        （含翅果）顶点树皮语义位恒 0；
 *      - aBend：Float32 itemSize 1 ∈ [0,1]，卡内根→尖非降（根 0.12·hw / 尖 0.52+
 *        0.44·hw，hw = 冠内高度权重）；树皮层同名属性写恒等值 0；**翅果恒 0**（随
 *        皮组——果簇刚性悬垂，摆动语义归材质层；下垂摆动未表达归缺口候选）。
 * 边界：零外部模型（D13）；每次调用全部数据现算（无模块级缓存对象，D17 所有权随调用
 *      移交）；原点 = 底部中心（整体 Y 平移使 minY 精确 = 0）；叶卡 UV 标准 0–1 四边形
 *      域（v 轴 = 复叶长轴（基部（裸柄段）→ 顶生小叶尖）、u = 0.5 叶轴中轴——一回
 *      羽叶 SDF 消费归 fraxinusMaterials——并行交付，签名冻结：
 *      createFraxinusBarkMaterial / createFraxinusLeafMaterial /
 *      createFraxinusLeafDepthMaterial，均 (level?) => 材质）；**翅果 uv u = 逐果色档
 *      / v∈[4.0,4.97]**（几何身份标记——翅果入皮组接口记档，见上）；叶法线取卡面
 *      单侧（cross(side, dir)）。
 * LOD 三档（T011.10，家族方法逐位复制：level 为 Runtime 可选参数——不参与
 *      shapeSlot/morphSeed/sourceKey 形态身份计算；档位缓存维度 = sourceKey + level 归
 *      ProceduralSourceCache）：三档共用**同一条 rng 消费流**与同一套骨架/簇位/翅果
 *      决策路径，Mid/Low 只在「发射」阶段降密度/降段数——被省略发射的站点/叶候选/果簇
 *      照常决策（果簇零 rng，决策 = 同一簇位表 + 同一区域判据 + 同一散列抽选——逐位
 *      同源），枝路径/簇位/翅果挂点/冠形包络/通透过滤决策逐位同源：
 *      - High：全发射（缺省档；皮面数 24178）；树皮微起伏保留；翅果簇全量烘焙；
 *      - Mid：径向段数降（主干/五级 14/8/7/6/5/4 → 6/5/4/3/3/3——粗枝保圆度、细枝
 *        三边管）+ 轴向站点隔 1 抽 1 发射（站点全算·游走 rng 全消费）+ L5 末梢管不
 *        发射（末梢径亚厘米，Mid 观距亚像素；簇位/果簇挂点照常派生）+ 簇内叶卡掩码
 *        j % 3 === 1（小卡簇 10 候选中 3 张（30%）——被弃候选足额消费 rng 后不进
 *        烘焙；通透过滤对全候选照常执行 → Mid 存活卡 ⊂ High 存活卡逐位同位）+ 树皮
 *        微起伏保留 + **翅果簇全量保留**（身份信号——夏末满冠帘幕中距可读 [12]，
 *        4 tri/果 预算轻）；皮 4514；
 *      - Low：主干 + L1 骨架极简管（径向 6/4、隔 1 抽 1；递归照常走完消费 rng）+
 *        冠 = High 簇位表驱动的壳层卡（每保留簇 2 张交叉竖卡，半幅 = 簇半径 + 0.24m
 *        余量（复叶小卡尺度：卡长 0.21–0.35 的常态伸出中位 ≈ 半卡长——同 sophora
 *        口径；极值叶尖仍由 High 决定冠包络——Low 不涨出，档间 bbox 一致性测试容差
 *        依据见 fraxinusLod）；宽轴 = 0.36 × 半幅——**复叶卡比例在 Low 壳卡延续**）+
 *        **翅果簇不发射**（Low 观距果簇亚像素——省略记档，档间连续记档同
 *        triadica/koelreuteria/sophora Low 果处理先例）；皮 370。
 *      预算锁定账目（8 槽 × 3 档实测带 + 锁定依据）见
 *      ../assets/asset_tree_fraxinus.asset 模块头（预算制 D19.8，家族行沿用）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { FRAXINUS_SLOT0_PROFILE } from './fraxinusShapeProfile';
import type { BroadleafBarkRelief, BroadleafShapeProfile } from '../broadleaf/broadleafShapeProfile';
import type { BroadleafClusterRecord } from '../broadleaf/broadleafClusterField';
import type { ProceduralLevel } from '../../../../domain/assets';

/** 叶卡描述子：烘焙前先收集（候选 → 通透过滤 → 两段式烘焙，冠内高度权重需存活卡 Y 域） */
interface LeafCard {
  center: THREE.Vector3;
  dir: THREE.Vector3; // 卡长方向（根→尖 = 复叶基部（裸柄段）→ 顶生小叶尖；散簇叶恒指簇外平展——卡根朝簇心）
  side: THREE.Vector3; // 卡宽方向（水平随机滚转）
  width: number;
  height: number;
  rand: number; // aLeafRand
  rhat: number; // 簇内归一化半径（对生散簇 shellBias 归一——对内共享节位的结构证据账目）
  clusterIndex: number; // 所属簇（存活后归账 clusterLeaves）
  /** 簇内候选序：Mid 发射掩码 j % 3 === 1 的选择位——候选生成/通透过滤/rng 消费对全
   *  候选照常，掩码只在烘焙阶段生效（Mid 存活卡 ⊂ High 存活卡逐位同位） */
  emitOrdinal: number;
}

/** 叶簇记录：挂点 + 簇中心 + 簇方向（= 挂点枝切向）+ 半径（枝梢驱动叶簇——家族方法沿用；
 *  白蜡语义 = 末级枝 decussate 对生平展散布小卡簇的簇空间 + 翅果簇承载位（L5 簇位 = 果簇候选） */
// ——T021.6 收编家族共享契约：类型真相源 = ../broadleaf/broadleafClusterField（本地名零 churn）
type ClusterRecord = BroadleafClusterRecord;

/** 单枚匙形翅果记录（双 quad 发射原料：坚果端基点 + 果长轴 + 尺寸 + 色档 u） */
interface SamaraFruit {
  /** 坚果端基点（果轴起点——uv v=4.0 端） */
  base: THREE.Vector3;
  /** 果长轴单位向量（坚果端 → 翼尖，斜下外姿态） */
  axis: THREE.Vector3;
  /** 果长（0.06–0.08m——真 3–4cm ×2 家族映射） */
  length: number;
  /** 果宽（0.008–0.012m——真 4–6mm ×2） */
  width: number;
  /** uv u = 逐果色档随机 ∈ [0,1)（位置散列——材质果色档通道：嫩绿→黄绿→淡褐色序
   *  同树并存 [12]，冻结接口） */
  colorRoll: number;
}

/** 翅果簇挂点记录：1 簇下垂果序（8–12 果） */
interface SamaraSite {
  fruits: SamaraFruit[];
}

/** 枝干发射槽：非索引三角形流（pos/normal/uv 三数组同步追加） */
interface BarkSink {
  pos: number[];
  nrm: number[];
  uv: number[];
}

/** 枝干通道线段（点到线段距离 < r 即硬抑制——冠内通透规则①） */
interface ChannelSeg {
  ax: number;
  ay: number;
  az: number;
  bx: number;
  by: number;
  bz: number;
  r2: number; // 半径平方（判定预热）
}

/** 局部空腔球（冠内通透规则③） */
interface CavitySphere {
  center: THREE.Vector3;
  radius: number;
}

/** 构建上下文：发射槽 + 簇表 + 翅果簇表 + 候选叶卡 + 通道表 + 逐级统计（全树共享，逐枝累加） */
interface BuildCtx {
  bark: BarkSink;
  clusters: ClusterRecord[];
  clustersCulled: number; // 簇级距离抑制丢弃的簇位数（工程账目）
  samaras: SamaraSite[]; // 翅果簇挂点表（保留 L5 簇位确定性抽选——档间同源）
  leafCandidates: LeafCard[];
  channels: ChannelSeg[];
  levelBranches: number[]; // L1–L5 枝数（L1 含领导枝）
  levelRadiusSum: number[]; // 各级起径和（均值 = sum / branches——主次分级证据）
  maxY: number; // 全树枝干站点最高点（冠参考系上界）
}

/** 生成结果：合并几何（恰 2 组）+ 面数/结构账目（测试与预算锁定消费） */
export interface FraxinusGeometryResult {
  geometry: THREE.BufferGeometry;
  stats: {
    barkTriangles: number;
    /** 叶卡三角（仅卡——leafCards × 2；翅果三角单列） */
    leafTriangles: number;
    leafCards: number;
    /** 翅果簇账目：挂点数（1 簇/点）/ 果数 / 翅果三角（果 × 4 = 正反双 quad；
     *  Low = 0 省略）。入皮组（组 0）——组 0 三角 = 皮拓扑 + 翅果（守恒） */
    samaraClusters: number;
    samaraFruits: number;
    samaraTriangles: number;
    /** 通透账目：候选数与三条规则的剔卡数（按首个命中规则计——通道 > 空腔 > 密度） */
    leafCandidates: number;
    channelRejects: number;
    voidRejects: number;
    gradientRejects: number;
    /** 主次分级证据：各级枝数与平均起径（米；L1 含领导枝） */
    levelBranches: number[];
    levelMeanStartRadius: number[];
    /** 冠参考系（密度场判定基准，米；世界坐标 = 贴地平移前） */
    crownCenterY: number;
    crownRadius: number;
    crownHalfHeight: number;
    /** 冠内归一化径向深度 q 五分桶（0–0.2 … 0.8+）：候选数与存活数——保留率随 q 递增
     *  即外密内疏的结构化证据 */
    qCandidates: number[];
    qSurvived: number[];
    /** 通道线段表（诊断/测试口径：ax..bz + 半径 r；世界坐标 = 贴地平移前） */
    channels: { ax: number; ay: number; az: number; bx: number; by: number; bz: number; r: number }[];
    /** 叶簇账目：簇列表（挂簇枝级 / 挂点 / 簇中心 / 半径 / 簇方向 = 挂点枝切向单位向量；
     *  世界坐标 = 贴地平移前，与 channels 同口径）与簇级距离抑制丢弃数 */
    clusters: {
      level: number;
      attachX: number;
      attachY: number;
      attachZ: number;
      cx: number;
      cy: number;
      cz: number;
      radius: number;
      dirX: number;
      dirY: number;
      dirZ: number;
    }[];
    clustersCulled: number;
    /** 逐簇存活散簇卡数（索引对齐 clusters）与 min/mean/max */
    clusterLeaves: number[];
    clusterLeafMin: number;
    clusterLeafMean: number;
    clusterLeafMax: number;
    /** 逐存活卡簇内归一化半径（对齐存活卡烘焙序——对生散簇 shellBias 平摊的结构证据） */
    leafRhat: number[];
  };
}

/** 世界向上基向量（只读复用） */
const UP = new THREE.Vector3(0, 1, 0);

/** rng → [0,1) 均匀；对称抖动 ±span */
function jitter(rng: () => number, span: number): number {
  return (rng() - 0.5) * 2 * span;
}

/** rng → 单位球面随机方向（两次 rng 消费：z 平均分布 + 方位角均匀） */
function randUnit(rng: () => number): THREE.Vector3 {
  const z = rng() * 2 - 1;
  const az = rng() * Math.PI * 2;
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  return new THREE.Vector3(r * Math.cos(az), z, r * Math.sin(az));
}

/** 点到线段距离平方（通道判定；p 在 [a,b] 参数域外取端点距离） */
function distToSegmentSq(
  px: number,
  py: number,
  pz: number,
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
): number {
  const abx = bx - ax;
  const aby = by - ay;
  const abz = bz - az;
  const apx = px - ax;
  const apy = py - ay;
  const apz = pz - az;
  const lenSq = abx * abx + aby * aby + abz * abz;
  const t = lenSq > 1e-12 ? Math.max(0, Math.min(1, (apx * abx + apy * aby + apz * abz) / lenSq)) : 0;
  const dx = apx - abx * t;
  const dy = apy - aby * t;
  const dz = apz - abz * t;
  return dx * dx + dy * dy + dz * dz;
}

/** x → [0,1)（确定性散列分量） */
function fract01(x: number): number {
  return x - Math.floor(x);
}

// ── 白蜡一回羽叶卡对生挂点语言常量（结构常数：槽间恒等——改值即改面数与 rng 消费）──

/** decussate 对生对步进角（π/2 = 90°——**对生叶序的交互对生标准式**（decussate：
 *  相邻叶对交互 ±90°），「叶对生」属级 Verified [5][6] 的几何落地——vs 国槐黄金角
 *  互生螺旋 137.5°：复叶系内同型不同排列的直接对照轴，终审裁决 8「三重对生」的
 *  挂点级实现（复叶在枝上对生） */
const DECUSSATE_PAIR_STEP = Math.PI / 2;
/** 对生对方位抖动 ±0.20 rad（≈±11.5°——「对生严格」读向的排列可读优先小档抖动；
 *  vs 国槐互生螺旋 jitter 0.45 打散规则感——白蜡对生对结构是身份信号，抖动只提供
 *  自然不齐） */
const DECUSSATE_JITTER = 0.2;
/** 散簇小卡取向常量（平展语言——连续形态方法常量，非槽差异维度）：羽叶平展层叠
 *  （域扩展节 B leaf_orientation_dist Inferred [12] 均质细碎冠面——平展摊开 +
 *  略前倾 + 弱抖动取向；011.9 同款常量沿用） */
const ALT_FORWARD_TILT = 0.24; // 沿枝向前倾分量（× 簇方向 T）
const ALT_WOBBLE = 0.15; // 弱球面抖动（自然不齐）
const PLANE_LIFT = 0.11; // 叶尖上举分量（平展摊开——011.9 同款）

/** 一回羽叶卡宽/长比（主代理冻结 0.36——材质冻结接口；卡宽 = 0.36 × 卡长；尺寸抖动
 *  仅缩放不改比例；卡 v 轴 = 复叶基部（裸柄段）0 → 顶生小叶尖 1、u = 0.5 叶轴中轴
 *  ——一回羽叶 SDF 按此比例设计对生窗列——材质-几何冻结接口；Low 壳卡宽轴同比例延续） */
const IMPARIPINNATE_OPPOSITE_WIDTH_RATIO = 0.36;

// ── 匙形翅果簇常量（Spec 判定做——终审裁决 4/5；确定性挂点账目法：区域判据 + 位置
//    散列排序 + 固定步长抽选，零 rng 消费——挂点口径槽间恒等（结构常数）──

/** 果带判据（**满冠帘幕带**——fruit-c「满冠分布 very conspicuous」[12]：**q ≥ 0.30
 *  覆盖冠外-中部带**（vs 国槐念珠串 0.42 冠外带——裁决 5「挂点分布密度显著高于国槐
 *  冠缘散点（满冠显著 vs 冠缘散点）」的账目实现：门槛放宽 → 资格簇带更深更广）；
 *  保留 L5 簇位（末级枝梢——果序沿末级枝梢侧生/顶生下垂 [12]） */
const SAMARA_ZONE_Q_MIN = 0.3;
/** 果簇抽选步长（散列序每 5 取 1——满冠帘幕数量级工程定档：实测落 **48–72 簇/树
 *  × 8–12 果 = 390–830 果**（8 槽规范种子，2026-09-22 终测；任务书 400–900 果/
 *  40–90 簇数量级带内定档——Mid 预算带（10000 − 皮 4514 − Mid 叶面）下双面 quad
 *  4 tri/果的串数-果数平衡，中距帘幕剪影可读 [12]、远距省略（Low 档）；无 rng
 *  roll——组 0 带不随 roll 浮动（platanus 果序 rng roll 组 0 带状浮动先例的规避
 *  记档，011.6/011.7/011.9 方法复制） */
const SAMARA_STRIDE = 5;
/** 翅果参数（011.7/011.9 确定性账目方法 + 匙形 quad 选型）：真单果 3–4cm × 宽
 *  4–6mm（「翅果匙形，长3-4厘米，宽4-6毫米」FRPS Verified [1]——裁决 5 主域锚）
 *  × 2 家族工程映射（platanus 果球/栾灯笼/国槐珠串同款 ×2 口径）⇒ 果长 0.06–0.08m
 *  / 果宽 0.008–0.012m；每簇果数 n = 8 + ⌊散列×5⌋ ∈ {8,…,12}（「每簇 10 枚级」
 *  [12] 的全域确定性分布）；果序轴下垂长 0.10–0.20m（真簇 5–10cm ×2——簇尺度
 *  Spec 域扩展节 B 翅果序形态组）+ 果沿轴散布、果长轴斜下外姿态（果序下垂密簇
 *  [12]——果自轴斜下外伸，翼尖朝下） */
const SAMARA_LEN_MIN = 0.06;
const SAMARA_LEN_SPAN = 0.02;
const SAMARA_WID_MIN = 0.008;
const SAMARA_WID_SPAN = 0.004;
const SAMARA_COUNT_BASE = 8;
const SAMARA_COUNT_SPAN = 5;
const SAMARA_AXIS_MIN = 0.1;
const SAMARA_AXIS_SPAN = 0.1;
/** 果域 uv 常量：v ∈ [4.0, 4.97]（果域 v∈[4,5] 冻结口径——triadica/sophora 先例；
 *  坚果端 v=4.0 / 翼尖 v=4.97（材质按 (v−4.0)/0.97 归一长轴分流果配方——坚果端
 *  1.5cm 圆柱 ↔ 翼 1/2 全长的匙形轮廓读向，面尖 4.97 < 5）；u = 逐果色档随机
 *  （位置散列，果内 12 顶点同值——材质果色档通道：嫩绿→黄绿→淡褐色序同树并存
 *  [12]，冻结接口） */
const FRUIT_UV_V_BASE = 4.0;
const FRUIT_UV_V_TIP = 4.97;

// ── LOD 三档发射计划（家族方法复制——档位只改「发射」，不改骨架决策/rng 消费序；
//    翅果：Mid 全量保留（身份信号）/ Low 省略（远距亚像素——triadica/koelreuteria/
//    sophora Low 果处理先例）──

/** LOD 发射档：三档共用同一条 rng 流与同一套骨架/簇位/果簇决策，差异全在发射密度 */
interface LodEmissionPlan {
  /** 逐管径向段 [主干, L1..L5]（High = profile 原值；Mid/Low 为降段阶梯——粗枝保圆度、
   *  细枝三边管：中景圆度可辨层级以下径向 3 已足，再降破管面下限 3） */
  radial: number[];
  /** 逐管轴向发射站点抽取步长（1 = 全发射；>1 = 每隔 step 站发射一站 + 恒保末站——
   *  站点全算·游走 rng 全消费，路径逐位同 High，发射管为同一曲线的弦近似） */
  stationStep: number[];
  /** L1..L5 逐级是否发射管（false = 只递归不发射——子枝/簇位/果簇/rng 照常派生；主干恒发射） */
  emitTube: boolean[];
  /** 簇内叶卡发射掩码（每簇 leavesPerCluster 候选中，仅 j % leafEmitEvery === leafEmitPhase
   *  者进烘焙；候选生成/通透过滤/rng 消费对全候选照常——Mid 存活卡 ⊂ High 存活卡；
   *  小卡簇 10 候选 → j∈{1,4,7} 3 张（30%）） */
  leafEmitEvery: number;
  leafEmitPhase: number;
  /** Low 壳卡模式：不烘焙簇内叶卡与果簇（候选/过滤/果簇决策照常），逐保留簇发射交叉壳卡 */
  shellCards: boolean;
}

/**
 * 档位 → 发射计划（结构依据见模块头 LOD 段；预算记账 = 8 槽实测口径，正式预算带
 * 锁定见 ../assets/asset_tree_fraxinus.asset 模块头）：
 * - High 皮 24178（拓扑恒等不动：主干 406（14 段 ×14 + 底盖 14）+ L1 1008（7 枝 ×9 段
 *   ×8）+ L2 2352（21 ×8 段 ×7）+ L3 3780（63 ×5 段 ×6）+ L4 7560（189 ×4 段 ×5）+
 *   L5 9072（378 ×3 段 ×4））；Mid 皮 4514 = 主干 90（7 段 ×6 + 底盖 6）+ L1 350
 *   （7 枝 ×5 段 ×5）+ L2 672（21 ×4 段 ×4）+ L3 1134（63 ×3 段 ×3）+ L4 2268
 *   （189 ×2 段 ×3），L5 不发射；Low 皮 370 = 主干 90 + L1 280（7 枝 ×5 段 ×4）。
 * - Mid 叶 ≈ High 存活卡 × 掩码率（小卡簇 10 选 3 = 30%）+ 果簇全量；8 槽实测落
 *   6–10K 带。
 * - Low 叶 = 保留簇数 × 2 壳卡 × 2 三角（果簇省略记档）；8 槽实测落 1.5–3K 带。
 */
function lodPlanFor(profile: BroadleafShapeProfile, level: ProceduralLevel): LodEmissionPlan {
  if (level === 'high') {
    // 缺省档全发射：profile 原值直读 + 步长 1（thinStations 原数组透传）——皮面数
    // 24178 / rng 消费快照（fraxinusLod 测试锁）延续
    return {
      radial: [profile.trunk.radial, ...profile.levels.map((l) => l.radial)],
      stationStep: [1, 1, 1, 1, 1, 1],
      emitTube: [true, true, true, true, true],
      leafEmitEvery: 1,
      leafEmitPhase: 0,
      shellCards: false,
    };
  }
  if (level === 'mid') {
    // 径向 14/8/7/6/5/4 → 6/5/4/3/3/3（骨架枝 5 边保中景圆度）+ 隔 1 抽 1 + L5 末梢
    // 不发射（亚厘米径亚像素）+ 叶卡掩码 j%3===1（小卡簇 10 选 3——8 槽实测 High 卡 →
    // Mid 总面落 6–10K 预算带的档率）+ 果簇全量保留（身份信号 [12]）
    return {
      radial: [6, 5, 4, 3, 3, 3],
      stationStep: [2, 2, 2, 2, 2, 2],
      emitTube: [true, true, true, true, false],
      leafEmitEvery: 3,
      leafEmitPhase: 1,
      shellCards: false,
    };
  }
  // Low：主干 + L1 骨架极简管（径向 6/4——干身剪影保圆度、骨架枝 4 边够远距读向）；
  // L2–L5 不发射（递归照常走完消费 rng/派生簇位与果簇）；冠层转壳卡模式（果簇省略）
  return {
    radial: [6, 4, 3, 3, 3, 3],
    stationStep: [2, 2, 2, 2, 2, 2],
    emitTube: [true, false, false, false, false],
    leafEmitEvery: 1,
    leafEmitPhase: 0,
    shellCards: true,
  };
}

/** 轴向站点抽取（step ≤ 1 原数组透传——High 逐位不变；step > 1 每 step 站取一 + 恒保末站） */
function thinStations<T>(list: T[], step: number): T[] {
  if (step <= 1) return list;
  const out: T[] = [];
  for (let i = 0; i < list.length; i += step) out.push(list[i]!);
  const last = list[list.length - 1]!;
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

/** Low 壳卡半幅余量（米）：High 散簇一回羽叶小卡自簇心的最大伸出 ≈ 簇半径 + 卡长
 *  （≤0.35m 斜向——小卡 0.076–0.126 宽 × 长/宽 2.7778 恒比例 ⇒ 卡长 0.21–0.35m），
 *  典型伸出（r̂≤1 壳位 + 对生平摊）中位 ≈ 半卡长 0.11–0.18m——取 0.24（011.9 同款
 *  小卡档）使壳卡吞并簇半径 + 常态伸出域，且极值叶尖仍由 High 决定冠包络（Low 不
 *  涨出——8 槽实测 Low 水平跨恒窄于 High，档间 bbox 一致性测试容差依据见
 *  fraxinusLod） */
const LOW_SHELL_MARGIN = 0.24;
/** Low 每保留簇壳卡数（交叉双竖卡：任意水平方位至少一卡正面可读——确定性几何，非 billboard） */
const LOW_SHELL_CARDS_PER_CLUSTER = 2;

/** Low 壳卡逐卡身份（aLeafRand 契约值 ∈ [0,1)）：簇心 sin 散列 + 第二卡派生错相（零 rng
 *  ——簇位表跨档同源，壳卡身份随簇确定；同簇双卡色相微错开避免同色块读向） */
function shellCardRandOf(cx: number, cy: number, cz: number, derive: number): number {
  const base = fract01(Math.sin(cx * 12.9898 + cy * 78.233 + cz * 37.719) * 43758.5453);
  return derive === 0 ? base : fract01(base * 7.31 + 0.37);
}

/**
 * Low 壳卡发射：簇心交叉竖卡——宽轴 w（水平单位向量）× 宽半幅 = **0.36 × 半幅**
 * （**一回羽叶卡比例 0.36 在 Low 壳卡延续**——档间剪影语义一致）、高轴 UP × 半幅；
 * 六顶点卡 / uv 0–1 四边形域 / aLeafRand / aBend 契约与 High 叶卡同构（根边 v=0
 * （复叶基部/裸柄段）、尖边 v=1（顶生小叶尖）；aBend 根 0.12·hw / 尖 0.52+0.44·hw
 * 与 High 同公式同常数——档间风相位/摆幅语义一致，D19.7）；卡面法线 = w × UP
 * （水平——竖卡双面读向）。
 */
function emitShellCard(
  pos: number[],
  nrm: number[],
  uv: number[],
  rand: number[],
  bend: number[],
  center: THREE.Vector3,
  w: THREE.Vector3,
  half: number,
  cardRand: number,
  hw: number,
): void {
  const bendRoot = 0.12 * hw; // 根边（簇挂枝端语义——复叶基部）≈ 0
  const bendTip = 0.52 + 0.44 * hw; // 尖边大；树顶簇 > 树底簇（同 High 公式）
  const halfW = half * IMPARIPINNATE_OPPOSITE_WIDTH_RATIO; // 复叶卡比例 0.36 延续（宽轴）
  const r0 = center.clone().addScaledVector(w, -halfW);
  const r1 = center.clone().addScaledVector(w, halfW);
  const t0 = r0.clone().addScaledVector(UP, half);
  const t1 = r1.clone().addScaledVector(UP, half);
  const n = w.clone().cross(UP).normalize();
  const verts: [THREE.Vector3, number, number, number][] = [
    [r0, 0, 0, bendRoot],
    [r1, 1, 0, bendRoot],
    [t1, 1, 1, bendTip],
    [r0, 0, 0, bendRoot],
    [t1, 1, 1, bendTip],
    [t0, 0, 1, bendTip],
  ];
  for (const [v, u, vv, b] of verts) {
    pos.push(v.x, v.y, v.z);
    nrm.push(n.x, n.y, n.z);
    uv.push(u, vv);
    rand.push(cardRand);
    bend.push(b);
  }
}

/** 位置确定性散列（salt 分通道——果色档/抽选排序/果参数共用，零 rng） */
function posHash(px: number, py: number, pz: number, salt: number): number {
  return fract01(Math.sin(px * 12.9898 + py * 78.233 + pz * 37.719 + salt * 53.71) * 43758.5453);
}

/**
 * 单枚匙形翅果发射：**扁平 quad 面片正反双 quad = 4 tri/果（12 顶点）**——「双 tri
 * 双面渲染」冻结接口（双面由几何侧承担：材质组 0 FrontSide〔fraxinusMaterials 缺口
 * 候选③〕——冠下仰观（fruit-c 主视角）背面可见，身份信号关键视角）。正面绕序
 * (p0,p1,p2)/(p0,p2,p3) 法线 n = w×d、反面顶点序反转法线 −n（同 uv 同账）；
 * uv 三角 (u,4.0)(u,4.0)(u,4.97)——**果域 v∈[4,5]**（几何身份标记：与叶卡 0–1
 * 四边形域（组 1）及皮管弧长域（v = 累计弧长 × 0.5，10m 级最长枝弧实测 ≤ ≈2.4）
 * 双重隔离；**无花资产（裁决 3）→ v∈[5,7) 域空**）。**u = 逐果色档随机 ∈ [0,1)**
 * （位置散列、果内 12 顶点同值——材质果色档通道：嫩绿→黄绿→淡褐色序同树并存
 * [12]，冻结接口）；**账目入皮组（组 0）**——fraxinusMaterials（park-shader-agent
 * 并行交付、签名冻结）按 v 域分流翅果配方；aLeafRand/aBend 随皮组恒 0（果簇刚性
 * 悬垂——摆动语义归材质层/缺口候选）。
 */
function emitSamara(sink: BarkSink, fruit: SamaraFruit): void {
  // 果宽轴：水平向 ⊥ 果长轴（翼展方向——扁平桨片的宽边；果长轴斜下外时取水平垂直）
  let w = fruit.axis.clone().cross(UP);
  if (w.lengthSq() < 1e-6) w = new THREE.Vector3(1, 0, 0); // 近铅垂果轴的确定性回退
  w.normalize();
  const halfW = fruit.width / 2;
  const d = fruit.axis;
  // quad 四角：坚果端边（v=4.0）p0/p1 → 翼尖边（v=4.97）p2/p3
  const p0 = fruit.base.clone().addScaledVector(w, -halfW);
  const p1 = fruit.base.clone().addScaledVector(w, halfW);
  const p2 = p1.clone().addScaledVector(d, fruit.length);
  const p3 = p0.clone().addScaledVector(d, fruit.length);
  const n = w.clone().cross(d).normalize();
  // 正面（绕序 (p0,p1,p2)/(p0,p2,p3)——法线 n 外向）+ 反面（顶点序反转——法线 −n）；
  // uv：坚果端 v=4.0 / 翼尖 v=4.97（沿果长轴——材质匙形轮廓的长轴坐标）
  const push = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, sign: number): void => {
    const verts: [THREE.Vector3, number][] = [
      [a, FRUIT_UV_V_BASE],
      [b, FRUIT_UV_V_BASE],
      [c, FRUIT_UV_V_TIP],
    ];
    for (const [v, vv] of verts) {
      sink.pos.push(v.x, v.y, v.z);
      sink.nrm.push(sign * n.x, sign * n.y, sign * n.z);
      sink.uv.push(fruit.colorRoll, vv);
    }
  };
  push(p0, p1, p2, 1);
  push(p0, p2, p3, 1);
  push(p1, p0, p3, -1);
  push(p1, p3, p2, -1);
}

// ── 树皮近景微起伏：固定形态常数（方法层，家族沿用）——非槽差异维度，可调面
//    全在 shapeProfile.barkRelief 三字段（白蜡幅度/谐波/游走率见
//    fraxinusShapeProfile）──
/** 谐波权重基线（低次主导；按 harmonics 序循环取用后归一） */
const BARK_RELIEF_WEIGHT_BASE = [0.42, 0.33, 0.25];
/** 相位游走正弦项频率（rad/m）/幅度（rad）——沿轴缓变游走分量 */
const BARK_RELIEF_WANDER_FREQ = 1.6;
const BARK_RELIEF_WANDER_AMP = 0.5;
/** 脊深呼吸（权重沿轴调制）频率（rad/m）/幅度——起伏深浅沿干交错（白蜡浅细纵裂
 *  脊沟的深浅缓变读向 [1][12]；幅度工程设定） */
const BARK_RELIEF_BREATHE_FREQ = 2.4;
const BARK_RELIEF_BREATHE_AMP = 0.3;
/** 亚视觉幅度地板（米，峰值，**3.5mm——011.8/011.9 同款本资产档**）：管起径 ×
 *  amplitudeRatio < 此值 → 该管整体跳过起伏。抬档依据（「幼干-大枝近光滑 + 浅裂
 *  显于主干」裁决 6）：FRPS「纵裂」承于主干 [1] + bark-a 幼干光滑 [12]；0.020
 *  幅度下起径 < 0.175m 的管（L1 骨架起径 0.08–0.11 亦在内）平滑发射 → **仅主干
 *  有效起伏**、全部分枝管光滑（vs 先例 0.0015 亚毫米档（triadica 0.027 下主干 +
 *  L1 有效）——011.8/011.9 抬档先例沿用；皮孔/灰褐色调/地衣绿斑归材质层） */
const FRAXINUS_BARK_RELIEF_MIN_EFFECTIVE = 0.0035;

/** 管起点确定性相位源：位置 + 起径的 sin 散列（零 rng；同位同相位——确定性不破，
 *  跨 seed 因起径/站位差异自然去克隆——主干起点虽恒原点，r0 随 seed 变化） */
function barkReliefPhaseSeed(px: number, py: number, pz: number, r0: number): number {
  return fract01(Math.sin(px * 12.9898 + py * 78.233 + pz * 37.719 + r0 * 53.71) * 43758.5453);
}

/** 单谐波沿轴缓变函数的常量系数（由管起点散列派生；phi(s)/w(s) 见 computeReliefRing） */
interface ReliefHarmonic {
  /** 环向谐波数（整数——θ 周期性的来源） */
  k: number;
  /** 相位原点 */
  psi: number;
  /** 轴向游走率（±drift 域内确定性取值——白蜡 drift 3.6：**顺直档**（轴向去相关
   *  ≈2π/3.6 ≈ 1.75m——纵脊长程连续为主）；顺直脊沟族（银杏 ±2.6/樟 ±3.2/乌桕
   *  ±2.8 纵脊长程连续）/ 国槐 ±5.5 局部交叉 / 重阳 ±6.5 扭转交错 / 悬铃木-榉 ±11
   *  断裂拼贴。速率值 = profile.barkRelief.drift） */
  driftRate: number;
  /** 游走正弦相位 */
  chi: number;
  /** 呼吸正弦相位 */
  omega: number;
  /** 权重基线（归一） */
  baseW: number;
}

/** 单环起伏预算：径向各 θ 位的位移与解析导数（顶点位置/法线共用；cos/sin 一并预算） */
interface ReliefRing {
  d: Float64Array;
  dTheta: Float64Array;
  dS: Float64Array;
  cos: Float64Array;
  sin: Float64Array;
}

/** 逐站点谐波沿轴相位/权重状态（emitTube 单管私有 scratch，避免逐环分配） */
interface ReliefPhaseScratch {
  phi: Float64Array;
  dPhi: Float64Array;
  w: Float64Array;
  dW: Float64Array;
}

/** 管谐波状态：harmonics 序 → 权重基线（循环取 BARK_RELIEF_WEIGHT_BASE 后归一）+
 *  相位/游走/呼吸系数（管起点散列派生的确定性纯函数，零 rng） */
function buildReliefHarmonics(origin: THREE.Vector3, r0: number, relief: BroadleafBarkRelief): ReliefHarmonic[] {
  const seed = barkReliefPhaseSeed(origin.x, origin.y, origin.z, r0);
  const raw = relief.harmonics.map((_, m) => BARK_RELIEF_WEIGHT_BASE[m % BARK_RELIEF_WEIGHT_BASE.length]!);
  const wSum = raw.reduce((sum, w) => sum + w, 0);
  return relief.harmonics.map((k, m) => ({
    k,
    psi: Math.PI * 2 * fract01(seed * (7.31 + 2.93 * m)),
    driftRate: relief.drift * (2 * fract01(seed * (3.77 + 1.71 * m)) - 1),
    chi: Math.PI * 2 * fract01(seed * (5.13 + 2.37 * m)),
    omega: Math.PI * 2 * fract01(seed * (9.29 + 3.17 * m)),
    baseW: raw[m]! / wSum,
  }));
}

/**
 * 填充单环起伏预算：d(θ,s) = A·Σₘ wₘ(s)·cos(kₘθ + φₘ(s))，A = amplitudeRatio × 环基准
 * 半径；d_θ/d_s 为解析导数（法线修正源）。φₘ(s) = ψₘ + driftₘ·s + wander 正弦项
 * （白蜡 driftₘ ±3.6 rad/m——顺直长程）、wₘ(s) = baseWₘ·(1 + breathe 正弦项)
 * （脊沟深浅呼吸）——均弧长 s 的缓变函数。amplitudeRatio ≤ 0（亚视觉地板跳过路径）
 * 时三数组清零——环 cos/sin 仍预算（发射共享）。
 */
function computeReliefRing(
  out: ReliefRing,
  scratch: ReliefPhaseScratch,
  radial: number,
  s: number,
  rBase: number,
  harmonics: ReliefHarmonic[],
  amplitudeRatio: number,
): void {
  for (let j = 0; j < radial; j++) {
    const th = (j / radial) * Math.PI * 2;
    out.cos[j] = Math.cos(th);
    out.sin[j] = Math.sin(th);
  }
  if (amplitudeRatio <= 0) {
    out.d.fill(0);
    out.dTheta.fill(0);
    out.dS.fill(0);
    return;
  }
  const M = harmonics.length;
  for (let m = 0; m < M; m++) {
    const h = harmonics[m]!;
    const wanderArg = BARK_RELIEF_WANDER_FREQ * s + h.chi;
    const breatheArg = BARK_RELIEF_BREATHE_FREQ * s + h.omega;
    scratch.phi[m] = h.psi + h.driftRate * s + BARK_RELIEF_WANDER_AMP * Math.sin(wanderArg);
    scratch.dPhi[m] = h.driftRate + BARK_RELIEF_WANDER_AMP * BARK_RELIEF_WANDER_FREQ * Math.cos(wanderArg);
    scratch.w[m] = h.baseW * (1 + BARK_RELIEF_BREATHE_AMP * Math.sin(breatheArg));
    scratch.dW[m] = h.baseW * BARK_RELIEF_BREATHE_AMP * BARK_RELIEF_BREATHE_FREQ * Math.cos(breatheArg);
  }
  const A = amplitudeRatio * rBase;
  for (let j = 0; j < radial; j++) {
    const th = (j / radial) * Math.PI * 2;
    let d = 0;
    let dTheta = 0;
    let dS = 0;
    for (let m = 0; m < M; m++) {
      const h = harmonics[m]!;
      const arg = h.k * th + scratch.phi[m]!;
      const ca = Math.cos(arg);
      const sa = Math.sin(arg);
      const w = scratch.w[m]!;
      d += w * ca;
      dTheta -= w * h.k * sa;
      dS += scratch.dW[m]! * ca - w * scratch.dPhi[m]! * sa;
    }
    out.d[j] = A * d;
    out.dTheta[j] = A * dTheta;
    out.dS[j] = A * dS;
  }
}

/**
 * 发射单个起伏管顶点：位置 = p + R·(cosθ·N + sinθ·B)（R = r + d——位移沿环向外向）；
 * 法线 = 参数面 X(θ,s) = C(s) + R·e(θ) 导数的解析修正：n ∝ e − (d_θ/R)·ē − d_s·T
 * （ē = −sinθ·N + cosθ·B；量纲：θ 的米制弧长 = R·dθ → 环向坡度 = d_θ/R，s 已是米 →
 * 轴向坡度 = d_s 直接使用不除 R；锥度项沿现状约定忽略——起伏坡度倾斜进法线、平滑
 * 外向、禁平面着色化）；uv 透传不变。
 */
function emitReliefVertex(
  sink: BarkSink,
  ring: ReliefRing,
  j: number,
  p: THREE.Vector3,
  n: THREE.Vector3,
  b: THREE.Vector3,
  t: THREE.Vector3,
  rBase: number,
  u: number,
  vT: number,
): void {
  const c = ring.cos[j]!;
  const s = ring.sin[j]!;
  const R = rBase + ring.d[j]!;
  const g = ring.dTheta[j]! / R; // 环向坡度（θ 米制弧长 = R·dθ → 除 R）
  const h = ring.dS[j]!; // 轴向坡度（s 已是米——不除 R）
  const nx = c + g * s;
  const ny = s - g * c;
  const nz = -h;
  const inv = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);
  sink.pos.push(p.x + (n.x * c + b.x * s) * R, p.y + (n.y * c + b.y * s) * R, p.z + (n.z * c + b.z * s) * R);
  sink.nrm.push(
    (nx * n.x + ny * b.x + nz * t.x) * inv,
    (nx * n.y + ny * b.y + nz * t.y) * inv,
    (nx * n.z + ny * b.z + nz * t.z) * inv,
  );
  sink.uv.push(u, vT);
}

/**
 * 锥度管发射：沿站点序列（points/radii 等长）平行传输标架，逐段发射外向绕制四边形
 * （三角形 (a0,b1,b0)/(a0,a1,b1)——右手系 (N,B,T) 下外向），uv = 环向 θ/2π × 累计弧长。
 * 树皮近景微起伏：每环预算 ReliefRing（位移 + 导数 + cos/sin）后发射——同一环顶点跨
 * 相邻四边形复用同一预算值，wrap 位（j=radial−1 的 th1）直接取 j=0 的预算值，
 * 环向浮点级无缝（顶点位置差恰为 0）；拓扑/绕序/uv 与无起伏路径完全一致。
 */
function emitTube(
  sink: BarkSink,
  points: THREE.Vector3[],
  radii: number[],
  radial: number,
  vScale: number,
  relief: BroadleafBarkRelief,
): void {
  const stations = points.length;
  const tangents: THREE.Vector3[] = [];
  for (let i = 0; i < stations; i++) {
    const prev = points[Math.max(0, i - 1)]!;
    const next = points[Math.min(stations - 1, i + 1)]!;
    tangents.push(next.clone().sub(prev).normalize());
  }
  // 平行传输法向：首站取与世界 up 最不共线基，后续投影去切向分量
  const normals: THREE.Vector3[] = [];
  const t0 = tangents[0]!;
  let seed = Math.abs(t0.y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
  normals.push(seed.clone().sub(t0.clone().multiplyScalar(t0.dot(seed))).normalize());
  for (let i = 1; i < stations; i++) {
    const t = tangents[i]!;
    const n = normals[i - 1]!.clone().sub(t.clone().multiplyScalar(t.dot(normals[i - 1]!)));
    if (n.lengthSq() < 1e-8) n.copy(seed).sub(t.clone().multiplyScalar(t.dot(seed)));
    normals.push(n.normalize());
  }
  const arcs: number[] = [0];
  for (let i = 1; i < stations; i++) arcs.push(arcs[i - 1]! + points[i]!.distanceTo(points[i - 1]!));

  // 起伏预算流：逐管谐波状态（起点散列派生）+ 双环 ping-pong（环 A 沿段间传递复用）。
  // 亚视觉地板（3.5mm）：起径 × 幅度比 < 0.0035 的管（L1 骨架起径 0.08–0.11 亦在
  // 内）整体按 0 起伏发射——仅主干有效起伏、全部分枝管光滑（「幼干-大枝近光滑 +
  // 浅裂显于主干」[1][12] 的几何侧读向，皮孔/色序归材质层；抬档依据见常量注释）
  const effectiveAmplitude =
    relief.amplitudeRatio * radii[0]! >= FRAXINUS_BARK_RELIEF_MIN_EFFECTIVE ? relief.amplitudeRatio : 0;
  const harmonics = buildReliefHarmonics(points[0]!, radii[0]!, relief);
  const scratch: ReliefPhaseScratch = {
    phi: new Float64Array(harmonics.length),
    dPhi: new Float64Array(harmonics.length),
    w: new Float64Array(harmonics.length),
    dW: new Float64Array(harmonics.length),
  };
  const makeRing = (): ReliefRing => ({
    d: new Float64Array(radial),
    dTheta: new Float64Array(radial),
    dS: new Float64Array(radial),
    cos: new Float64Array(radial),
    sin: new Float64Array(radial),
  });
  let ringA = makeRing();
  let ringB = makeRing();
  computeReliefRing(ringA, scratch, radial, arcs[0]!, radii[0]!, harmonics, effectiveAmplitude);

  for (let i = 0; i < stations - 1; i++) {
    const tA = tangents[i]!;
    const nA = normals[i]!;
    const bA = tA.clone().cross(nA); // B = T×N（(N,B,T) 右手系）
    const tB = tangents[i + 1]!;
    const nB = normals[i + 1]!;
    const bB = tB.clone().cross(nB);
    const pA = points[i]!;
    const pB = points[i + 1]!;
    const rA = radii[i]!;
    const rB = radii[i + 1]!;
    const vA = arcs[i]! * vScale;
    const vB = arcs[i + 1]! * vScale;
    computeReliefRing(ringB, scratch, radial, arcs[i + 1]!, rB, harmonics, effectiveAmplitude);
    for (let j = 0; j < radial; j++) {
      const j1 = (j + 1) % radial; // wrap 位取 j=0 预算值——θ=2π ≡ 0 浮点级一致
      const u0 = j / radial;
      const u1 = (j + 1) / radial;
      // 顶点流：a0 a1 b1 | a0 b1 b0（外向绕制——绕序与起伏无关，保持不变）
      emitReliefVertex(sink, ringA, j, pA, nA, bA, tA, rA, u0, vA);
      emitReliefVertex(sink, ringA, j1, pA, nA, bA, tA, rA, u1, vA);
      emitReliefVertex(sink, ringB, j1, pB, nB, bB, tB, rB, u1, vB);
      emitReliefVertex(sink, ringA, j, pA, nA, bA, tA, rA, u0, vA);
      emitReliefVertex(sink, ringB, j1, pB, nB, bB, tB, rB, u1, vB);
      emitReliefVertex(sink, ringB, j, pB, nB, bB, tB, rB, u0, vB);
    }
    const swap = ringA;
    ringA = ringB;
    ringB = swap;
  }
}

/** 主干底盖：封住从上方斜看进空心干身的可见洞；扇面 (c, V_j, V_{j+1})，法线 +Y。
 *  保持无起伏（近地视角不可见——树基 minY=0 贴地，盖沿与管壁首环的 ≤ 5mm 环形错位
 *  由地面遮挡；封洞功能不受影响）。 */
function emitBaseCapTri(sink: BarkSink, center: THREE.Vector3, radius: number, radial: number): void {
  const tangent = new THREE.Vector3(0, 1, 0); // 主干首站切向恒近 +Y（lean 幅度 ≤2.9°）
  const seed = Math.abs(tangent.y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
  const n = seed.clone().sub(tangent.clone().multiplyScalar(tangent.dot(seed))).normalize();
  const b = tangent.clone().cross(n);
  for (let j = 0; j < radial; j++) {
    const th0 = (j / radial) * Math.PI * 2;
    const th1 = ((j + 1) / radial) * Math.PI * 2;
    const v0 = center.clone().addScaledVector(n, radius * Math.cos(th0)).addScaledVector(b, radius * Math.sin(th0));
    const v1 = center.clone().addScaledVector(n, radius * Math.cos(th1)).addScaledVector(b, radius * Math.sin(th1));
    for (const [vtx, u, vv] of [
      [center, 0.5, 0.5],
      [v0, 0.5 + 0.5 * Math.cos(th0), 0.5 + 0.5 * Math.sin(th0)],
      [v1, 0.5 + 0.5 * Math.cos(th1), 0.5 + 0.5 * Math.sin(th1)],
    ] as const) {
      sink.pos.push(vtx.x, vtx.y, vtx.z);
      sink.nrm.push(tangent.x, tangent.y, tangent.z);
      sink.uv.push(u, vv);
    }
  }
}

/**
 * 主生成入口：rng（morphRng）+ shapeProfile → 合并几何 + 账目。
 * 拓扑：主干（含根部 flare）→ 6 骨架枝 + 1 领导枝（L1）→ 逐级递归（L2×3 / L3×3 / L4×3 /
 * L5×2 末梢）；枝角/长度/粗度/曲率 rng 驱动（骨架枝**单段角域直读**（46–62° 斜上-
 * 开展外斜中带——中位分歧 + 开展外斜 [12]，无国槐两段角带）+ upturn 链低正 + 领导枝
 * 弱-中庸 0.50 续顶（圆头冠顶由上段骨架链共构）——卵圆-圆头开展冠的结构成因，Spec
 * §3 per 终审裁决 7；**无 zigzag 交替偏置**（Spec 无白蜡证据——对照轴记档））。
 * 一回羽叶卡挂点：末两级枝梢 decussate 对生平展散布小卡簇（小簇 + 10 候选 = 5 对生
 * 对，对内共享节位 r̂）+ 保留 L5 簇位翅果簇确定性抽选（满冠帘幕带判据 q ≥ 0.30，
 * 见模块头）。主次分级与冠内通透规则见模块头。
 * profile 缺省 = slot-0 标准组合（锚点回落——单测直调便捷路径，资产路径显式传槽
 * profile）。level 缺省 = 'high'（三档同流派生——档位只改发射密度，不改骨架决策/
 * rng 消费序，见 lodPlanFor）。
 */
export function buildFraxinusGeometry(
  rng: () => number,
  profile: BroadleafShapeProfile = FRAXINUS_SLOT0_PROFILE,
  level: ProceduralLevel = 'high',
): FraxinusGeometryResult {
  const lod = lodPlanFor(profile, level);
  const ctx: BuildCtx = {
    bark: { pos: [], nrm: [], uv: [] },
    clusters: [],
    clustersCulled: 0,
    samaras: [],
    leafCandidates: [],
    channels: [],
    levelBranches: [0, 0, 0, 0, 0],
    levelRadiusSum: [0, 0, 0, 0, 0],
    maxY: 0,
  };
  const bark = ctx.bark;

  // ── 全树形态参数（shapeProfile 域 + rng 连续抖动——皮结构计数固定）──
  const totalHeight = 9.2 + rng() * 0.8; // 形态参数域 9.2–10.0m（≈10m 锚——志书「高10-12米」直给（裁决 2 罕见志书级体量锚），卵圆开展冠不取高端；**Step 3 探针回调记档（2026-09-22）**：初值 9.9–10.7 实测涌现 9.10–12.16 正外泄 +1.0–1.5（单段角域直读 + upturn 链的纵向伸展无国槐两段带横展泄压——slot-1 12.16 出 12m 生产域上界），回调 −0.7（配 upturn 链降档 + 两端槽领导比修正）终测带见 asset 模块头）
  const crownRadius = (totalHeight * profile.crownWidthRatio * 0.5) * (0.94 + rng() * 0.12); // 冠幅半径 = 冠幅比驱动（含 ±6% 抖动）——工程域 0.7–1.0 涌现（比国槐 0.9–1.2 窄一档，探针定档见 profile）
  const trunkBaseR = 0.24 + rng() * 0.06; // 根径 0.24–0.30m（DBH Unknown（照片不可标定 [12]）——工程设定，「材理通直」[1] 细干读向取家族带内偏细档）
  const trunkH = totalHeight * (0.26 + rng() * 0.08); // 干高 26–34%（trunk_height_ratio Unknown + 中位分歧读向的带内映射 [12]）
  const lean = randUnit(rng).multiplyScalar(jitter(rng, 0.05)); // 主干倾轴（≤2.9°——单干典型；多干萌生相记档不建模）

  // ── 主干：14 环段锥度曲线（根部 flare 1.18×指数衰减 × 0.42 顶径锥度——basal_flare
  //    Unknown、taper Unknown 沿家族常量）──
  const trunkPts: THREE.Vector3[] = [];
  const trunkRadii: number[] = [];
  const trunkTopR = trunkBaseR * 0.42;
  let dir = new THREE.Vector3(0, 1, 0).add(lean).normalize();
  let p = new THREE.Vector3(0, 0, 0);
  for (let i = 0; i <= profile.trunk.segs; i++) {
    const t = i / profile.trunk.segs;
    trunkPts.push(p.clone());
    const taper = trunkBaseR + (trunkTopR - trunkBaseR) * Math.pow(t, 0.85);
    const flare = 1 + 0.18 * Math.exp(-t * 7); // 根部张拉（轻度——家族常量）
    trunkRadii.push(Math.max(taper * flare, 0.01));
    if (i < profile.trunk.segs) {
      dir.add(randUnit(rng).multiplyScalar(profile.trunk.wander)).add(UP.clone().multiplyScalar(profile.trunk.upturn * 0.1)).normalize();
      p = p.clone().addScaledVector(dir, trunkH / profile.trunk.segs);
    }
  }
  emitTube(
    bark,
    thinStations(trunkPts, lod.stationStep[0]!),
    thinStations(trunkRadii, lod.stationStep[0]!),
    lod.radial[0]!,
    0.5,
    profile.barkRelief,
  );
  // 底盖独立性说明：emitBaseCapTri 保持无起伏（近地视角不可见——盖沿与管壁首环的
  // ≤5mm 环形错位由地面遮挡；封洞功能不受影响）
  emitBaseCapTri(bark, trunkPts[0]!, trunkRadii[0]!, lod.radial[0]!);
  ctx.maxY = Math.max(ctx.maxY, trunkPts[trunkPts.length - 1]!.y);

  /** 主干半径插值（挂点处子枝起径连续源） */
  const trunkRadiusAt = (t: number): number => {
    const idx = t * profile.trunk.segs;
    const i = Math.min(profile.trunk.segs - 1, Math.floor(idx));
    return THREE.MathUtils.lerp(trunkRadii[i]!, trunkRadii[i + 1]!, idx - i);
  };
  const trunkPointAt = (t: number): THREE.Vector3 => {
    const idx = t * profile.trunk.segs;
    const i = Math.min(profile.trunk.segs - 1, Math.floor(idx));
    return trunkPts[i]!.clone().lerp(trunkPts[i + 1]!, idx - i);
  };

  // ── L1 骨架枝 ×6（**单段角域直读**：scaffoldAngleMin/Max 46–62° 斜上-开展外斜
  //    中带直接消费——**无国槐两段角带**（中位分歧无主枝低位放射身份，槽间角域差异
  //    整体平移单段域）；**无国槐干向长度分级**（低位长枝放射放张为国槐专属语言——
  //    白蜡 rank 乘子承担环内势差）；方位 60° 均分 + asymmetry 0.40 散布抖动（骨架
  //    排列 Unknown [12]——散布口径）；挂高 0.58–0.78 干高段 span 0.20（**中位分歧
  //    ——vs 国槐 0.52–0.74 低位：挂高段下缘上抬一档**）──
  const scaffoldCount = profile.scaffoldCount;
  const phase0 = rng() * Math.PI * 2;
  for (let i = 0; i < scaffoldCount; i++) {
    const rank = Math.min(i, profile.scaffoldRankLength.length - 1);
    const az = phase0 + (i / scaffoldCount) * Math.PI * 2 + jitter(rng, profile.asymmetry * 0.88); // 方位抖动 ±25°·(asymmetry/0.5)——散布
    const attachT = profile.scaffoldAttachMin + (i / scaffoldCount) * profile.scaffoldAttachSpan + jitter(rng, 0.06);
    // 起角（对铅垂）→ 方向分量：水平 sin / 铅垂 cos——单段角域直读（确定性随 rng 抽域）
    const tilt = THREE.MathUtils.degToRad(
      profile.scaffoldAngleMin + rng() * (profile.scaffoldAngleMax - profile.scaffoldAngleMin),
    );
    const length = crownRadius * profile.scaffoldRankLength[rank]! * (0.94 + rng() * 0.12);
    const attach = trunkPointAt(attachT);
    const dirH = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
    const bDir = dirH.clone().multiplyScalar(Math.sin(tilt)).add(UP.clone().multiplyScalar(Math.cos(tilt))).normalize();
    const startR = trunkRadiusAt(attachT) * profile.scaffoldThickness * profile.scaffoldRankRadius[rank]!;
    growBranch(ctx, rng, profile, lod, 0, attach, bDir, length, startR, az);
    // 枝干通道②：骨架枝基段保护带（初方向直线近似——主干大枝进冠不被封死）
    ctx.channels.push(
      segOf(attach, attach.clone().addScaledVector(bDir, length * profile.channelLengthRatio), profile.channelRadius * profile.channelBranchScale),
    );
  }
  // ── L1 领导枝 ×1（apical_dominance「中庸-失去领导」Inferred [12]——开展圆冠读向：
  //    圆头顶由上段骨架链共构、领导不翻转树顶；leaderLengthRatio 0.50 弱-中庸带
  //    （国槐 0.48 / 栾 0.50 同带），直立系数 0.92 为家族方法常量）──
  const leaderAz = rng() * Math.PI * 2;
  const leaderDir = new THREE.Vector3(Math.cos(leaderAz) * 0.4, 0.92, Math.sin(leaderAz) * 0.4).normalize();
  const leaderLen = (totalHeight - trunkH) * (profile.leaderLengthRatio + rng() * 0.08);
  const leaderAttach = trunkPointAt(0.98);
  const leaderProtectEnd = leaderAttach.clone().addScaledVector(leaderDir, leaderLen * profile.channelLengthRatio);
  growBranch(
    ctx,
    rng,
    profile,
    lod,
    0,
    leaderAttach,
    leaderDir,
    leaderLen,
    trunkRadiusAt(0.98) * 0.62,
    leaderAz,
  );
  // 枝干通道①：主干→领导枝保护段终点 = 连续中轴保护带（主干近直立 + 领导枝 0.92 直立，
  // 近共线直线近似）——主干大枝进冠不被封死；骨架枝基段保护带见上
  ctx.channels.push(segOf(new THREE.Vector3(0, 0, 0), leaderProtectEnd, profile.channelRadius));
  ctx.channels.push(segOf(leaderAttach, leaderProtectEnd, profile.channelRadius * profile.channelBranchScale));

  // ── 冠参考系（密度场判定基准）：中心/半高按 profile 比例 × 全树实际高，半径 = 冠幅生成参数 ──
  const treeTopY = ctx.maxY;
  const crownCenterY = treeTopY * profile.crownCenterRatio;
  const crownHalfH = treeTopY * profile.crownHeightRatio * 0.5;
  const crownR = crownRadius * 1.06; // 叶位径向外扩余量

  // ── 局部空腔（规则③）：rng 固定消费（每腔 4 次）——同 seed 同空腔 ──
  const voids: CavitySphere[] = [];
  for (let i = 0; i < profile.voidCount; i++) {
    const d = randUnit(rng); // 2 次
    const rr = profile.voidCenterBias * (0.25 + 0.75 * Math.sqrt(rng())); // 偏内分布
    const center = new THREE.Vector3(
      d.x * rr * crownR,
      crownCenterY + d.y * rr * crownHalfH * 0.8, // 垂直向压扁（冠形）
      d.z * rr * crownR,
    );
    voids.push({ center, radius: profile.voidRadiusMin + rng() * (profile.voidRadiusMax - profile.voidRadiusMin) });
  }

  // ── 冠内通透过滤：通道（硬）→ 空腔（硬）→ 密度场（rng 概率；每卡无条件消费 1 次——确定性）──
  const leafCards: LeafCard[] = [];
  let channelRejects = 0;
  let voidRejects = 0;
  let gradientRejects = 0;
  const qCandidates = [0, 0, 0, 0, 0];
  const qSurvived = [0, 0, 0, 0, 0];
  /** 冠内归一化径向深度（与密度场同口径：水平半径 / 该高度冠壳半径，端盖保护 0.3） */
  const qOf = (c: THREE.Vector3): number => {
    const dy = (c.y - crownCenterY) / crownHalfH;
    const shellFactor = Math.sqrt(Math.max(0, 1 - dy * dy));
    const rShell = Math.max(shellFactor, 0.3) * crownR;
    return Math.hypot(c.x, c.z) / rShell;
  };
  for (const card of ctx.leafCandidates) {
    const c = card.center;
    const qBucket = Math.min(4, Math.floor(qOf(c) / 0.2));
    qCandidates[qBucket]!++;
    const roll = rng(); // 无条件消费（消费次数与数据分支无关）
    let keep = true;
    if (keep) {
      for (const ch of ctx.channels) {
        if (distToSegmentSq(c.x, c.y, c.z, ch.ax, ch.ay, ch.az, ch.bx, ch.by, ch.bz) < ch.r2) {
          keep = false;
          channelRejects++;
          break;
        }
      }
    }
    if (keep) {
      for (const v of voids) {
        if (c.distanceToSquared(v.center) < v.radius * v.radius) {
          keep = false;
          voidRejects++;
          break;
        }
      }
    }
    if (keep) {
      // 内层密度衰减（规则②）：q = 冠内归一化径向深度（与 qOf 同口径）
      const q = qOf(c);
      let density: number;
      if (q >= profile.crownShellStart) density = 1;
      else if (q <= profile.crownCoreStart) density = profile.coreDensityFloor;
      else {
        density =
          profile.coreDensityFloor +
          (1 - profile.coreDensityFloor) *
            ((q - profile.crownCoreStart) / (profile.crownShellStart - profile.crownCoreStart));
      }
      const heightBias = 1 + profile.crownTopBias * ((c.y / treeTopY) * 2 - 1); // 冠顶偏置
      if (roll >= Math.min(1, Math.max(0, profile.canopyDensity * density * heightBias))) {
        keep = false;
        gradientRejects++;
      }
    }
    if (keep) {
      leafCards.push(card);
      qSurvived[qBucket]!++;
    }
  }

  // ── 翅果簇挂点确定性抽选（零 rng——消费顺序契约不含果簇；簇位表与档位无关 ⇒
  //    决策逐位同源；011.6/011.7/011.9 方法复制）：**资格 = 保留 L5 簇位（末级枝梢
  //    ——果序沿末级枝梢侧生/顶生下垂 [12]）∧ q ≥ SAMARA_ZONE_Q_MIN（满冠帘幕带
  //    滤——fruit-c「满冠分布 very conspicuous」[12]：q ≥ 0.30 覆盖冠外-中部带，
  //    vs 国槐 0.42 冠外带（裁决 5 满冠显著 vs 冠缘散点））**；位置散列排序 + 固定
  //    步长抽选（每 SAMARA_STRIDE 取 1）→ 下垂果序簇（8–12 果，果参数逐簇/逐果散列
  //    派生——见常量注释）──
  const l5Kept = ctx.clusters.filter((c) => c.level === 4);
  const samaraCands: { h: number; c: ClusterRecord }[] = [];
  for (const c of l5Kept) {
    if (qOf(c.center) >= SAMARA_ZONE_Q_MIN) {
      samaraCands.push({ h: posHash(c.center.x, c.center.y, c.center.z, 1.7), c });
    }
  }
  samaraCands.sort((a, b) => a.h - b.h);
  for (let i = 0; i < samaraCands.length; i += SAMARA_STRIDE) {
    const { c } = samaraCands[i]!;
    // 果簇原料：冠缘径向外向（树轴水平径向——近干簇的确定性回退）+ 下垂果序轴
    const outward = new THREE.Vector3(c.center.x, 0, c.center.z);
    if (outward.lengthSq() < 1e-6) outward.set(1, 0, 0);
    outward.normalize();
    // 果数：n = 8 + ⌊散列×5⌋ ∈ {8,…,12}（「每簇 10 枚级」[12] 的全域确定性分布）
    const countRoll = posHash(c.center.x, c.center.y, c.center.z, 9.1);
    const count = SAMARA_COUNT_BASE + Math.floor(countRoll * SAMARA_COUNT_SPAN);
    // 果序轴：自簇心下垂（-Y 主导 + 水平微斜散列——果序下垂密簇 [12]），轴长
    // 0.10–0.20m（真簇 5–10cm ×2）
    const axisLen = SAMARA_AXIS_MIN + SAMARA_AXIS_SPAN * posHash(c.center.x, c.center.y, c.center.z, 11.3);
    const axisDir = outward
      .clone()
      .multiplyScalar(0.3 * posHash(c.center.x, c.center.y, c.center.z, 13.7))
      .add(UP.clone().multiplyScalar(-1))
      .normalize();
    const fruits: SamaraFruit[] = [];
    for (let k = 0; k < count; k++) {
      // 果挂点：沿轴 t_k + 水平散布（簇内散布半径 0.02–0.05——果沿果序轴散生）
      const t = count > 1 ? k / (count - 1) : 0.5;
      const spreadRoll = posHash(c.center.x + k * 3.13, c.center.y, c.center.z, 17.9);
      const spreadAz = posHash(c.center.x, c.center.y + k * 5.71, c.center.z, 19.3) * Math.PI * 2;
      const spreadR = 0.02 + 0.03 * spreadRoll;
      const base = c.center
        .clone()
        .addScaledVector(axisDir, axisLen * (0.15 + 0.8 * t))
        .add(new THREE.Vector3(Math.cos(spreadAz) * spreadR, 0, Math.sin(spreadAz) * spreadR))
        .addScaledVector(outward, c.radius * 0.4);
      // 果长轴：斜下外（自轴外伸 + 下垂主导——翼尖朝下读向 [12]）；近轴散列微变
      const droop = outward
        .clone()
        .multiplyScalar(0.3 + 0.2 * posHash(base.x, base.y, base.z, 23.1))
        .add(UP.clone().multiplyScalar(-(0.85 + 0.15 * posHash(base.x, base.y, base.z, 29.7))))
        .normalize();
      fruits.push({
        base,
        axis: droop,
        length: SAMARA_LEN_MIN + SAMARA_LEN_SPAN * posHash(base.x, base.y, base.z, 31.9),
        width: SAMARA_WID_MIN + SAMARA_WID_SPAN * posHash(base.x, base.y, base.z, 37.3),
        colorRoll: posHash(base.x, base.y, base.z, 41.3),
      });
    }
    ctx.samaras.push({ fruits });
  }

  // ── 烘焙名单：High = 全存活卡；Mid = 簇内候选序掩码子集（j % every === phase——
  //    小卡簇 10 候选 3 张；通透过滤对全候选照常执行 → Mid 存活卡 ⊂ High 存活卡逐位
  //    同位）；Low 壳卡模式不烘焙簇内叶卡与果簇（候选生成/通透过滤已照常走完——
  //    果簇决策零 rng、决策表档间同源）──
  const bakedCards: LeafCard[] = lod.shellCards
    ? []
    : leafCards.filter((c) => c.emitOrdinal % lod.leafEmitEvery === lod.leafEmitPhase);
  /** 烘焙叶卡数（Low = 保留簇 × 每簇壳卡数——叶组三角 = 该数 × 2） */
  const bakedLeafCount = lod.shellCards
    ? ctx.clusters.length * LOW_SHELL_CARDS_PER_CLUSTER
    : bakedCards.length;
  /** 烘焙翅果簇数（High/Mid 全量保留——身份信号；Low 省略记档） */
  const bakedSamaraClusters = lod.shellCards ? 0 : ctx.samaras.length;
  /** 烘焙翅果果数（High/Mid 全量保留；Low 省略） */
  const bakedSamaraFruits = lod.shellCards ? 0 : ctx.samaras.reduce((s, f) => s + f.fruits.length, 0);

  // ── 簇账目：逐簇烘焙散簇卡量 + 逐烘焙卡簇内归一化半径（烘焙序对齐；Low 壳卡无簇内
  //    径向分布语义——r̂ 记壳面恒 1.0，账目长度与烘焙卡数的既有不变量延续）──
  const clusterLeaves: number[] = new Array(ctx.clusters.length).fill(0);
  const leafRhat: number[] = [];
  if (lod.shellCards) {
    clusterLeaves.fill(LOW_SHELL_CARDS_PER_CLUSTER);
  } else {
    for (const card of bakedCards) {
      if (card.clusterIndex >= 0) clusterLeaves[card.clusterIndex]!++;
      leafRhat.push(card.rhat);
    }
  }

  // ── 叶卡烘焙（两段式：Y 域 → 冠内高度权重 aBend；Mid 的 Y 域取全存活集——与 High
  //    逐位同源，两档公共卡 aBend 恒等；Low 的 Y 域取簇心域）──
  let crownMinY = Infinity;
  let crownMaxY = -Infinity;
  if (lod.shellCards) {
    for (const cluster of ctx.clusters) {
      crownMinY = Math.min(crownMinY, cluster.center.y);
      crownMaxY = Math.max(crownMaxY, cluster.center.y);
    }
  } else {
    for (const card of leafCards) {
      crownMinY = Math.min(crownMinY, card.center.y);
      crownMaxY = Math.max(crownMaxY, card.center.y);
    }
  }
  const leafPos: number[] = [];
  const leafNrm: number[] = [];
  const leafUv: number[] = [];
  const leafRand: number[] = [];
  const leafBend: number[] = [];
  if (lod.shellCards) {
    // ── Low 壳卡烘焙：逐保留簇交叉双竖卡——宽轴 = 簇切向水平投影 / 其水平垂直（任意
    //    水平方位至少一卡正面可读——确定性几何非 billboard）；簇位/簇半径与 High 同源，
    //    半幅吞并簇半径（LOW_SHELL_MARGIN 校准依据见常量注释）；宽轴 = 0.36 × 半幅
    //    （一回羽叶卡比例 0.36 延续——档间剪影语义）；果簇不发射（省略记档）──
    for (const cluster of ctx.clusters) {
      const half = cluster.radius + LOW_SHELL_MARGIN;
      let h = cluster.dir.clone();
      h.y = 0; // 簇切向（挂点枝切向）水平投影
      if (h.lengthSq() < 1e-6) h.set(1, 0, 0); // 近铅垂切向的确定性回退（L5 下垂末梢）
      h.normalize();
      const perp = new THREE.Vector3(-h.z, 0, h.x); // h × UP（水平垂直）
      const hw = THREE.MathUtils.clamp(
        (cluster.center.y - crownMinY) / Math.max(0.01, crownMaxY - crownMinY),
        0,
        1,
      );
      emitShellCard(
        leafPos, leafNrm, leafUv, leafRand, leafBend,
        cluster.center, h, half,
        shellCardRandOf(cluster.center.x, cluster.center.y, cluster.center.z, 0), hw,
      );
      emitShellCard(
        leafPos, leafNrm, leafUv, leafRand, leafBend,
        cluster.center, perp, half,
        shellCardRandOf(cluster.center.x, cluster.center.y, cluster.center.z, 1), hw,
      );
      leafRhat.push(1, 1); // 壳面 r̂ 恒 1.0（壳即簇外壳）
    }
  } else {
    for (const card of bakedCards) {
      const hw = THREE.MathUtils.clamp((card.center.y - crownMinY) / Math.max(0.01, crownMaxY - crownMinY), 0, 1);
      const bendRoot = 0.12 * hw; // 枝轴节位（复叶基部/裸柄段）≈ 0
      const bendTip = 0.52 + 0.44 * hw; // 叶尖（顶生小叶尖）大；树顶叶 > 树底叶
      const half = card.width / 2;
      const r0 = card.center.clone().addScaledVector(card.side, -half);
      const r1 = card.center.clone().addScaledVector(card.side, half);
      const t0 = r0.clone().addScaledVector(card.dir, card.height);
      const t1 = r1.clone().addScaledVector(card.dir, card.height);
      const n = card.side.clone().cross(card.dir).normalize();
      // 顶点序（非索引 6 顶点/卡）：r0 r1 t1 | r0 t1 t0；根 = 0,1,3（复叶基部——uv v=0，
      // 材质 SDF 裸柄段域的低端）尖 = 2,4,5（顶生小叶尖——uv v=1；aBend 契约序）
      const verts: [THREE.Vector3, number, number, number][] = [
        [r0, 0, 0, bendRoot],
        [r1, 1, 0, bendRoot],
        [t1, 1, 1, bendTip],
        [r0, 0, 0, bendRoot],
        [t1, 1, 1, bendTip],
        [t0, 0, 1, bendTip],
      ];
      for (const [v, u, vv, bend] of verts) {
        leafPos.push(v.x, v.y, v.z);
        leafNrm.push(n.x, n.y, n.z);
        leafUv.push(u, vv);
        leafRand.push(card.rand);
        leafBend.push(bend);
      }
    }
  }

  // ── 翅果烘焙（High/Mid 全量：逐果双 quad（emitSamara）——**入皮组（组 0）**：uv
  //    u = 逐果色档 / v∈[4.0,4.97] 果域身份标记 + aLeafRand/aBend 随皮组恒 0（材质
  //    侧冻结接口——按 v 域分流翅果配方，见 emitSamara 注释）；「满冠帘幕下垂果簇」
  //    Spec 判定做（裁决 4/5）的几何侧表达；Low 省略记档 ──
  if (!lod.shellCards) {
    for (const site of ctx.samaras) {
      for (const fruit of site.fruits) {
        emitSamara(bark, fruit);
      }
    }
  }

  // ── minY 精确贴地：全树（皮+叶）最低点上移至 0 ──
  let minY = Infinity;
  for (let i = 1; i < bark.pos.length; i += 3) minY = Math.min(minY, bark.pos[i]!);
  for (let i = 1; i < leafPos.length; i += 3) minY = Math.min(minY, leafPos[i]!);
  if (minY !== 0 && Number.isFinite(minY)) {
    for (let i = 1; i < bark.pos.length; i += 3) bark.pos[i]! -= minY;
    for (let i = 1; i < leafPos.length; i += 3) leafPos[i]! -= minY;
  }

  // ── 层几何组装：树皮（aLeafRand/aBend 恒 0——mergeGeometries 属性集一致）──
  const mkAttr = (arr: number[]): THREE.BufferAttribute => new THREE.BufferAttribute(new Float32Array(arr), 1);
  const barkGeo = new THREE.BufferGeometry();
  barkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bark.pos), 3));
  barkGeo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(bark.nrm), 3));
  barkGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(bark.uv), 2));
  barkGeo.setAttribute('aLeafRand', mkAttr(new Array(bark.pos.length / 3).fill(0)));
  barkGeo.setAttribute('aBend', mkAttr(new Array(bark.pos.length / 3).fill(0)));

  const leafGeo = new THREE.BufferGeometry();
  leafGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(leafPos), 3));
  leafGeo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(leafNrm), 3));
  leafGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(leafUv), 2));
  leafGeo.setAttribute('aLeafRand', mkAttr(leafRand));
  leafGeo.setAttribute('aBend', mkAttr(leafBend));

  const geometry = mergeGeometries([barkGeo, leafGeo], true); // 层间成组 → 恰 2 组（皮 0 / 叶 1——翅果入皮组）
  barkGeo.dispose(); // 合并拷贝数据，层中间体即弃
  leafGeo.dispose();
  if (!geometry) throw new Error('程序化资产 asset_tree_fraxinus 层合并不兼容（属性集应一致：position/normal/uv/aLeafRand/aBend）');

  const groups = geometry.groups;
  /** 组 0 = 皮拓扑 + 翅果（翅果入皮组——材质接口约定）；皮拓扑面数 = 组 0 三角 −
   *  翅果（结构锁 24178 口径不变） */
  const group0Tris = (groups[0]?.count ?? 0) / 3;
  const samaraTris = bakedSamaraFruits * 4;
  return {
    geometry,
    stats: {
      barkTriangles: group0Tris - samaraTris,
      leafTriangles: bakedLeafCount * 2,
      leafCards: bakedLeafCount,
      samaraClusters: bakedSamaraClusters,
      samaraFruits: bakedSamaraFruits,
      samaraTriangles: samaraTris,
      leafCandidates: ctx.leafCandidates.length,
      channelRejects,
      voidRejects,
      gradientRejects,
      levelBranches: ctx.levelBranches,
      levelMeanStartRadius: ctx.levelBranches.map((n, i) => (n > 0 ? ctx.levelRadiusSum[i]! / n : 0)),
      crownCenterY,
      crownRadius: crownR,
      crownHalfHeight: crownHalfH,
      qCandidates,
      qSurvived,
      channels: ctx.channels.map((ch) => ({
        ax: ch.ax,
        ay: ch.ay,
        az: ch.az,
        bx: ch.bx,
        by: ch.by,
        bz: ch.bz,
        r: Math.sqrt(ch.r2),
      })),
      clusters: ctx.clusters.map((c) => ({
        level: c.level,
        attachX: c.attach.x,
        attachY: c.attach.y,
        attachZ: c.attach.z,
        cx: c.center.x,
        cy: c.center.y,
        cz: c.center.z,
        radius: c.radius,
        dirX: c.dir.x,
        dirY: c.dir.y,
        dirZ: c.dir.z,
      })),
      clustersCulled: ctx.clustersCulled,
      clusterLeaves,
      clusterLeafMin: clusterLeaves.length > 0 ? Math.min(...clusterLeaves) : 0,
      clusterLeafMean:
        clusterLeaves.length > 0 ? clusterLeaves.reduce((s, n) => s + n, 0) / clusterLeaves.length : 0,
      clusterLeafMax: clusterLeaves.length > 0 ? Math.max(...clusterLeaves) : 0,
      leafRhat,
    },
  };
}

/** 通道线段构造（半径平方预热） */
function segOf(a: THREE.Vector3, b: THREE.Vector3, radius: number): ChannelSeg {
  return { ax: a.x, ay: a.y, az: a.z, bx: b.x, by: b.y, bz: b.z, r2: radius * radius };
}

/**
 * 分枝递归：level 0–4（L1–L5）；路径 = 起点方向 + 每步游走 + 上举偏置（白蜡
 * upturn [0.09,0.08,0.06,0.05,0.04] 单调递减低正链——端部小枝斜上收口，圆头冠顶
 * 闭合由角域 + 领导链承载主剪影；**无国槐 zigzag 交替偏置**（Spec 无白蜡证据——
 * 细级形态由 wander 梯度承载，对照轴记档））；起径 = 父径 ×
 * profile.radiusRatio[level]、末径 = 起径 × profile.endRatio[level]；子枝挂点内埋
 * 父径内（起点回退 2.5×子径，杜绝接缝黑洞——树皮微起伏仅主干有效（抬档地板），
 * ≪ 内埋余量，接缝安全不变）；末两级 = **一回羽叶卡挂点**（decussate 对生散簇挂
 * 枝梢簇位）；通透过滤在收冠后统一执行，内层稀疏由密度场接管。
 * LOD：站点序列全分辨率计算（游走 rng 全消费——档间逐位同源），管发射按 lod 计划抽稀
 * （径向降段 + 站点隔 1 抽 1 + 未发射级跳过 emitTube）；簇决策/簇内候选生成/果簇
 * 抽选与档位无关（果簇零 rng、簇位表驱动——发射省略不省略消费）。
 */
function growBranch(
  ctx: BuildCtx,
  rng: () => number,
  profile: BroadleafShapeProfile,
  lod: LodEmissionPlan,
  level: number,
  start: THREE.Vector3,
  dirIn: THREE.Vector3,
  length: number,
  startR: number,
  phase: number,
): void {
  const spec = profile.levels[level]!;
  const endR = Math.max(startR * profile.endRatio[level]!, 0.004);
  const pts: THREE.Vector3[] = [];
  const radii: number[] = [];
  let d = dirIn.clone().normalize();
  // 子枝起点内埋（回退进父枝体内；末级细枝回退量加大遮梢孔）
  const p0 = start.clone().addScaledVector(d, -(startR * 2.5 + 0.015));
  let p = p0;
  for (let i = 0; i <= spec.segs; i++) {
    const t = i / spec.segs;
    pts.push(p.clone());
    radii.push(startR + (endR - startR) * t); // 线性锥度（连续到子级）
    if (i < spec.segs) {
      d.add(randUnit(rng).multiplyScalar(spec.wander)).normalize();
      // 上举偏置随 t 增强（末段姿态——白蜡末级低值 0.04 + 游走 = 端部小枝斜上收口；
      // 卵圆-圆头主剪影由骨架侧驱动链承载：单段角域 + 挂高段中位 + 弱-中庸领导）
      d.add(UP.clone().multiplyScalar(spec.upturn * t * 0.5));
      d.normalize();
      p = p.clone().addScaledVector(d, length / spec.segs);
    }
  }
  // 管发射按档位计划：未发射级（Mid L5 / Low L2–L5）只递归不发射——站点/簇位/果簇/rng 照常
  if (lod.emitTube[level]) {
    emitTube(
      ctx.bark,
      thinStations(pts, lod.stationStep[1 + level]!),
      thinStations(radii, lod.stationStep[1 + level]!),
      lod.radial[1 + level]!,
      0.5,
      profile.barkRelief,
    );
  }
  ctx.levelBranches[level]!++;
  ctx.levelRadiusSum[level]! += startR;
  ctx.maxY = Math.max(ctx.maxY, pts[pts.length - 1]!.y);

  const radiusAt = (t: number): number => {
    const idx = t * spec.segs;
    const i = Math.min(spec.segs - 1, Math.floor(idx));
    return THREE.MathUtils.lerp(radii[i]!, radii[i + 1]!, idx - i);
  };
  const pointAt = (t: number): THREE.Vector3 => {
    const idx = t * spec.segs;
    const i = Math.min(spec.segs - 1, Math.floor(idx));
    return pts[i]!.clone().lerp(pts[i + 1]!, idx - i);
  };

  // ── 一回羽叶卡挂点（末两级 L4/L5）──
  // 散簇（家族「枝梢驱动叶簇」的白蜡语义）：枝梢 → 簇空间（⊥ 枝切向平面）→
  // **decussate 对生对散排**复叶小卡——L4 外段 1 簇 / L5 沿途外段 + 枝端共 2 簇
  // （复叶在枝上对生 Verified [5][6]——簇 = 末级枝羽叶组的卡布置球）；簇间间隙 =
  // 「簇只挂枝梢离散位 + 间距抑制」（拓扑相关处的父子/兄弟共位由簇级距离抑制保险，
  // 见下）；L5 簇位表同时为翅果簇承载位表（满冠帘幕带判据 + 散列抽选——主生成段，
  // 零 rng）
  const clusterCount = level === 3 ? profile.clustersL4 : level === 4 ? profile.clustersL5 : 0;
  if (clusterCount > 0) {
    const isL5 = level === 4;
    const inner = isL5 ? profile.clusterInnerStartL5 : profile.clusterInnerStartL4;
    const leavesPerCluster = isL5 ? profile.clusterLeavesL5 : profile.clusterLeavesL4;
    for (let i = clusterCount - 1; i >= 0; i--) {
      // 簇沿枝 t：末位簇 = 枝端（t=1），其余在外段均匀散布（+抖动）；单簇枝落外段中后部。
      //  生成序枝端簇优先（倒序）——散簇上簇级抑制先保证枝端簇位，沿途簇让位
      const spread = clusterCount === 1 ? 0.6 : i / (clusterCount - 1);
      const t = THREE.MathUtils.clamp(inner + spread * (1 - inner) + jitter(rng, 0.05), 0, 1);
      const attach = pointAt(t);
      // 簇方向承接挂点局部切向（簇-枝梢生长关系；t 端点自动退化为单侧差分）
      const tangent = pointAt(Math.min(1, t + 0.15)).sub(pointAt(Math.max(0, t - 0.15))).normalize();
      // 簇半径：profile 域抽样 × 挂簇枝长比例上限 cap（rng 先消费再 cap——消费次数恒定；
      //  短枝梢簇随之缩小：簇尺度随枝条活力，且同枝两簇中心距 > 半径和——簇间间隙成立）
      const radius = Math.min(
        (profile.clusterRadiusMinL5 + rng() * profile.clusterRadiusSpanL5) *
          (isL5 ? 1 : profile.clusterRadiusScaleL4),
        length * profile.clusterRadiusLengthCap,
      );
      // 簇中心 = 挂点沿簇方向前移（极近——簇坐枝梢稍前方，叶量越枝端）
      const center = attach.clone().addScaledVector(tangent, radius * profile.clusterForwardOffset);
      // 簇级显式剔除：与已保留簇中心距 < clusterMinSeparation×(ri+rj) 的簇位丢弃（父子/
      // 兄弟枝梢拓扑共位——后生成者让位）；簇位与叶片 rng 仍无条件消费，消费次数与
      // 数据分支无关（确定性纪律）
      let kept = true;
      for (const k of ctx.clusters) {
        if (center.distanceTo(k.center) < profile.clusterMinSeparation * (radius + k.radius)) {
          kept = false;
          break;
        }
      }
      const clusterIndex = ctx.clusters.length;
      if (kept) {
        ctx.clusters.push({ level, attach: attach.clone(), center: center.clone(), radius, dir: tangent.clone() });
      } else {
        ctx.clustersCulled++;
      }
      // 散簇平面基（⊥ 簇方向 = 挂点枝切向——「羽叶平展层叠」的簇平面 [12]）
      let u1 = tangent.clone().cross(UP);
      if (u1.lengthSq() < 1e-4) u1 = new THREE.Vector3(1, 0, 0); // 近铅垂切向的确定性回退
      u1.normalize();
      const u2 = tangent.clone().cross(u1).normalize();
      /** 对内共享簇内径向位（同节对生语义——一对复叶自同一节位向相反方向展开：对首卡
       *  （j 偶数）消费 rng、对次卡（j 奇数）复用；消费次数由 j 奇偶确定性决定——
       *  固定次数纪律不破，白蜡对生挂点语言的消费结构差异点 vs 国槐逐卡独立 r̂） */
      let pairRhat = 1;
      for (let j = 0; j < leavesPerCluster; j++) {
        // decussate 对生对方位：φ_j = ⌊j/2⌋×90° + (j mod 2)×180° + 微抖动——对内两卡
        // 正对（相差 180° = 对生成对）、相邻对交互 90°（decussate 交互对生标准式：
        // 对 0 列 {0°,180°} / 对 1 列 {90°,270°} / 对 2 列 {180°,0°}（与对 0 同轴——
        // 对生线两正交列交替，「叶对生」属级 Verified [5][6] 的几何落地（裁决 8）；
        // vs 国槐黄金角互生螺旋 φ_j = j×137.5°——复叶系内同型不同排列的直接对照轴）
        const phi =
          Math.floor(j / 2) * DECUSSATE_PAIR_STEP + (j % 2) * Math.PI + jitter(rng, DECUSSATE_JITTER); // 1 次
        const wobble = randUnit(rng); // 2 次（自然不齐的弱球面抖动）
        // 外壳偏置（对内共享）：r̂ = mix(1−shellBias, 1, rng^γ)——对首卡消费、对次卡复用
        // （同节对生）；对生羽叶位宽域平摊分布（簇心 = 枝梢位）
        if (j % 2 === 0) {
          pairRhat =
            1 - profile.clusterShellBias + profile.clusterShellBias * Math.pow(rng(), profile.clusterShellGamma); // 1 次（对首卡）
        }
        const rhat = pairRhat;
        // 对生偏移方向：簇平面辐射正对 + 沿枝向前倾（FORWARD_TILT——羽叶略前倾）+ 弱抖动
        const offsetDir = u1
          .clone()
          .multiplyScalar(Math.cos(phi))
          .add(u2.clone().multiplyScalar(Math.sin(phi)))
          .add(tangent.clone().multiplyScalar(ALT_FORWARD_TILT))
          .add(wobble.clone().multiplyScalar(ALT_WOBBLE))
          .normalize();
        const cardCenter = center.clone().addScaledVector(offsetDir, rhat * radius);
        // 卡尖方向：辐射外向 + 平展上举（「羽叶平展层叠」[12]——PLANE_LIFT）
        const cardDir = offsetDir.clone().add(UP.clone().multiplyScalar(PLANE_LIFT)).normalize();
        let side = cardDir.clone().cross(UP);
        if (side.lengthSq() < 1e-4) side = new THREE.Vector3(1, 0, 0);
        side.normalize();
        const roll = rng() * Math.PI; // 卡面滚转（取向随机——打散规则感；家族共性沿用）1 次
        side.applyAxisAngle(cardDir, roll).normalize();
        // 卡根朝内：cardDir 与簇内偏移方向反向时 dir/side 同取负（卡面不变、根尖互换、
        // 法线不变），叶尖恒指簇外——「羽叶自枝梢节位向外生长」读向（根边 uv v=0 =
        // 复叶基部（裸柄段）= aBend 低端 = 材质 SDF 裸柄段域低端）
        if (cardDir.dot(offsetDir) < 0) {
          cardDir.negate();
          side.negate();
        }
        // 尺寸/aLeafRand 抽样无条件消费（含被剔除簇位——消费次数与 kept 分支无关，
        // 调 clusterMinSeparation 等参数时保留簇随机流不重排——确定性纪律）；
        // 高度抽样恒比例消费（leafAspectSpan = 0——冻结比例 0.36 的纪律位，消费不减）
        const width = profile.leafWidthMin + rng() * profile.leafWidthSpan; // 1 次
        const height = width * (profile.leafAspectMin + rng() * profile.leafAspectSpan); // 1 次
        const rand = rng(); // 1 次
        if (kept) {
          ctx.leafCandidates.push({
            center: cardCenter,
            dir: cardDir,
            side,
            width,
            height,
            rand,
            rhat,
            clusterIndex,
            emitOrdinal: j, // 簇内候选序（Mid 掩码位——见 LeafCard.emitOrdinal 注释）
          });
        }
      }
    }
  }

  // 子级递归（L5 末级无子）
  if (level < profile.levels.length - 1) {
    const plan = profile.childPlan[level]!;
    for (let i = 0; i < plan.ts.length; i++) {
      const t = Math.min(1, plan.ts[i]! + jitter(rng, 0.05));
      const attach = pointAt(t);
      const attachR = radiusAt(t);
      const isTip = plan.ts[i] === 1.0;
      // 挂点父向（局部切向——侧枝混合用）
      const tTan = pointAt(Math.min(1, t + 0.15)).sub(pointAt(Math.max(0, t - 0.15))).normalize();
      let childDir: THREE.Vector3;
      let childPhase = phase;
      if (isTip) {
        // 延伸枝：延续父向 + 轻微上扬与游走
        childDir = tTan.clone().add(UP.clone().multiplyScalar(0.18)).add(randUnit(rng).multiplyScalar(0.25)).normalize();
      } else {
        // 侧枝：方位按父相位角均分展开（冠向四周填充 + 抖动；二级枝对一级枝张角——
        // branch_angle 度数 Unknown（开展外斜/中位分歧定性 Inferred [12]，读向由
        // 角域 + upturn 链承载），家族方法常量承载）
        childPhase = phase + i * plan.phaseStep + jitter(rng, 0.35);
        const h = new THREE.Vector3(Math.cos(childPhase), 0, Math.sin(childPhase));
        childDir = h
          .clone()
          .multiplyScalar(0.8)
          .add(UP.clone().multiplyScalar(0.2 + rng() * 0.35))
          .add(tTan.clone().multiplyScalar(0.25))
          .normalize();
      }
      const lenRatio = profile.lengthRatioBase + rng() * profile.lengthRatioSpan + (level + 1) * 0.03; // 逐级长度衰减
      growBranch(
        ctx,
        rng,
        profile,
        lod,
        level + 1,
        attach,
        childDir,
        length * lenRatio,
        attachR * profile.radiusRatio[level]!,
        childPhase,
      );
    }
  }
}
