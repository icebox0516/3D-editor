/**
 * runtime/procedural/tree/celtis/celtisMaterials —— 朴树（asset_tree_celtis）叶/树皮材质
 * + 风动 + 叶影深度材质（T011.1）。
 *
 * 职责：复制夏栎 tree3aMaterials 已验收的配方方法（onBeforeCompile 注入工厂 L2 全套纪律：
 *   replaceOnce 缺失即抛 / customProgramCacheKey 必写且键唯一 / 原生 chunk 原句保留后追加 /
 *   <color_fragment> 绝不触碰），物种配方按朴树自己的 Reference Spec 换装——
 *   Spec docs/research/celtis-reference.md **1.0**（任务书锚点 1.0，开工前已校验一致）。
 *   消费冻结几何契约（与夏栎同款）：组 0 树皮 FrontSide / 组 1 叶卡 DoubleSide，叶卡固有
 *   attribute aLeafRand / aBend + 实例 aSeed；树皮组 aLeafRand 恒 0、aBend 恒 0。
 *
 * 叶（组 1）配方（每条记 Spec 引用；工程校准值标注「工程设定」）：
 *   - SDF 卵形包络：sin(π·v^0.76)^e——v^0.76 预扭曲把 sin 峰推到 v≈0.40 叶长（自基部计；
 *     卵形最宽点在下段，vs 夏栎 v^1.4→0.61 倒卵形最宽偏尖侧）——Spec §4「叶卵形至卵状
 *     椭圆形」Verified [1][3]。长宽比 1.3–2.0 由几何侧管（Spec §6/B leaf_aspect_ratio），
 *     SDF 只管包络。
 *   - 先端急尖至短渐尖（尖——vs 夏栎圆钝）：包络指数沿 v 变化 mix(0.70, 1.15, ↑v)——
 *     基部 0.70 圆钝收口（Spec 基部圆形/钝形 Verified [1][3]），上半段 1.15 收窄提速出
 *     尖（Spec 先端急尖至短渐尖 Verified [1][3]）；纯 ALU 零分支。
 *   - 基部微偏斜：中心线自基部向先端漂移 0.012（极弱——FRPS「基部几乎不偏斜或仅稍偏斜」[1]、
 *     FOC 偏斜截形 [3]；读作两侧不对称的卵形基）。
 *   - 齿限上半部（身份核心）：门控 smoothstep(0.48, 0.56, v) 只放叶上半段齿，下半部近全缘
 *     ——Spec §4「近全缘至仅上半部具齿、每侧 0–16 圆齿」四源一致 Verified [1][3][5][6]；
 *     圆钝齿载波 2π·9（pow² 圆钝，vs 夏栎 pow³ 锐齿）+ 值噪声抖动 20%，幅度峰值 0.030
 *     = 覆盖率坡宽 0.04 的 75% 顶格（alphaTest 0.5 裁切闪烁纪律，沿夏栎口径；Step 4 校准值）。
 *   - 三出脉（决定做）：中脉亮带 + 基出侧脉对（轨迹 0.30·v^0.45·(1−0.45v)——自叶基急升
 *     后近叶缘平行内行、先端前吻合）+ 弱二级脉对比 0.18——FOC 属级「3-veined from base;
 *     secondary veins anastomosing before reaching margin」Verified [4][3]，两叶照一张极显著
 *     一张中等显著 [6]；纯 ALU 淡脉影零采样（成本可控故做，记成本账：ALU ≈ +1×）。
 *   - 两面区分（Spec §5「叶面中-深绿、叶背浅灰绿更暗淡」Verified [3][5][6]）：
 *     底色 #5a8340 中绿偏黄（工程设定——canopy-a/b 受光-半受光折减 + leaf-a/b 上表面交叉
 *     标定；照片判读两树对照「朴树比夏栎更黄更亮」两次一致，较夏栎 #4e7c33 亮度 ≈+17%、
 *     R/G 比更高）；叶背 ×(1.02, 1.00, 1.10) 轻度提亮 + 去饱和 + 冷灰绿偏移（gl_FrontFacing
 *     纯 ALU；vs 夏栎 ×(0.94,1.05,1.16) 粉绿配方——朴树背浅灰绿另配）；「更暗淡」走糙度
 *     通道：背面 roughness +0.12 哑光差（两面光泽差读向）。
 *   - 叶面光泽：roughness 底参 0.72 半光泽（Spec §5 光泽至半光泽 Inferred [6]，近革质观感
 *     ——vs 夏栎 0.85 哑光叶更亮一点的 specular 读向）。
 *   - 背光透射弱化：峰值 0.30 + 透射色 (0.58,0.90,0.38)（vs 夏栎 0.65）——厚纸质至近革质
 *     透光弱 Spec §5 Inferred [2][3][5]；逐叶变奏 t3cTransVar ∈[0.55,1.0]。
 *   - 逐叶变奏 aLeafRand（色相两端冷绿↔暖黄绿、通道摆幅 ≤15% 纪律 + 明度 ±10% 去相关）
 *     + 冠内竖向自遮蔽（冠基 ≈3.0m——干高占比 0.35–0.45 × ≈8m Spec §3 Inferred [8][9]，
 *     区间取值工程设定）+ 中频叶团斑块（High，位置域 1× vnoise）。
 *   - 裁切走 alphaTest 0.5 + alphaToCoverage（MSAA 抗锯边；不 transparent——实例化 + 深度
 *     排序灾难）；零贴图零 DataTexture（D13）。
 *   - 风动两层沿用（工程设定沿夏栎验收常数——频率/幅度/风标为逐树工程调参非物种事实；
 *     朴树目标 ≈8m 与夏栎同语境，树高锚 7.5m 同口径）：整树缓摆 ~0.18Hz / 顶部 ~4.5cm
 *     （aSeed 相位）+ 叶片快颤 2.2–3.7Hz / ≤11mm（aBend 权重）；与皮同公式同相位。
 *
 * 皮（组 0）配方（vs 夏栎深沟脊-板系统整体分化为平滑-浅裂小斑块低浮雕语言）：
 *   - 主调 #7a746a 灰白-灰褐（工程设定——bark-a 受光 ≈(160,155,145)/阴影 ≈(95,88,78) 折中
 *     标定；比夏栎 #5c534a 各通道 +30–34「整体更浅更灰」，任务书口径）；受光偏浅灰/背光偏
 *     褐灰由光照自然给（乘性配方不锁向）——Spec §5 bark_color Verified [2][5][6]。
 *   - 浅裂小斑块低浮雕（Spec bark_archetype/bark_relief Verified [1][2][5][6]——非深沟脊、
 *     非剥落）：裂脊 tri² 剖面 + 沟底 0.76（vs 夏栎 0.44+tri³ 深沟——对比弱化）+ 脊数 9
 *     （vs 夏栎 14，斑块小）+ 裂线游走更缓（warp 1.1 < 1.35）；板块噪声近各向同性小尺度
 *     (7.5,10.5) 弱对比（vs 夏栎竖长板 (4.6,13.5) 强对比）。
 *   - 干上部更平滑色更浅（Spec §5 Verified [2][5][6]、干基更粗糙）：高度门控
 *     smoothstep(0.8,3.4,vTreePos.y) 弱化裂深（0.76+0.24·tri² → 0.93+0.07·tri²）+ 上部
 *     提亮 ×1.07 + 糙度 −0.06（沿夏栎 uv/高度门控手法换数值）。
 *   - 弱水平层纹（bark-a 低置信 Inferred [6]）：**记档不做**——单照片低置信线索 + 噪声
 *     预算纪律，不做不编造。
 *   - 节疤系统：**不实现**——Spec 树皮类型学与照片均无夏栎级节疤语言（朴树皮身份就是
 *     平滑-浅裂小斑块；夏栎节疤为该种特有配方），Mid 档 consequently 无节疤可去。
 *   - 苔藓/地衣**少量**集中干下部（Spec §5 Verified [6] 覆盖度低于夏栎）：噪声带收紧
 *     (0.64,0.88)（vs 夏栎 (0.56,0.86) 覆盖更少）+ 强度 0.55（vs 0.82）+ 灰绿偏移
 *     (0.84,0.97,0.68)（地衣灰绿读向，vs 夏栎饱和绿）。
 *   - 小枝语言：单皮组契约（恰 2 组冻结）枝干统一皮材质——「一年生枝褐色 vs 老枝灰褐分化」
 *     （Spec §4 Verified [3]/Inferred [6]）记档为已知让步（夏栎同项 #16 让步先例）。
 *   - 风动：整树缓摆与叶同公式同相位（aBend 恒 0 快颤层天然不作用）。
 *
 * 深度材质（叶影裁切，customDepthMaterial 契约通道——§1.4 六条全守）：
 *   - 单一来源：MeshDepthMaterial + RGBADepthPacking + alphaTest 0.5，SDF alpha 与叶表面
 *     材质共享同一 GLSL 字符串（表面改叶形深度自动同步，不复制粘贴）。
 *   - 多材质网格守卫：皮组以恒等 attribute（aLeafRand=0）走实心分支，防叶形 SDF 在圆柱
 *     uv 域上误裁出洞。
 *   - 档位匹配：Mid = High SDF 同源全形 / Low = Low SDF 零噪声版（沿夏栎分档语义）。
 *   - 风动不进 depth pass（静态影取舍已裁定）；深度片元除 SDF 自带的齿抖动噪声外零额外
 *     采样（齿噪声随 SDF 单一来源进入——表面/影叶形逐位一致优先，沿夏栎先例口径）。
 *
 * **2026-09-19 Step 4 宏观特写校准记档（主代理视觉验收定向反馈：2.4–2.8m 入冠、单叶
 *   100–130px 下叶缘齿与三出脉不可辨；树皮 5/6 过不动；透射弱为物种方向不动）**：
 *   1) 齿可见度：幅度域 0.040→0.060（峰值 0.020→0.030 u 域，@100px 叶边缘摆幅 ±1.2→
 *      ±1.9px、峰谷 2.5→3.7px）+ 覆盖率坡宽 0.03→0.04（AA 软边 1.9→2.5px 代价——
 *      alphaToCoverage fwidth 消化；换齿幅上限 0.0225→0.030 即 +33%；峰值 = 坡宽×75%
 *      顶格纪律保持）+ 载波规则度 0.75/0.25→0.80/0.20（噪声糊边占比降，齿形更可读；
 *      1× vnoise 采样与成本不变）；齿限上半部门控与 2π·9 载波语义不变（Low SDF return
 *      同步 /0.04——档间 AA 边一致，档间切换无跳变；深度材质随 SDF 单一来源自动同步）。
 *   2) 三出脉/中脉可见度：中脉带半宽 0.020→0.030 u（1.24→1.86px@100px 叶）+ 权重
 *      0.50→0.85；基侧脉对带半宽 0.030→0.040（1.86→2.5px）+ 权重 0.34→0.65；脉色
 *      (1.22,1.14,0.78)→(1.28,1.19,0.74)（相对亮度 1.13→1.19）；albedo 域亮度差：中脉
 *      6.5%→16%、三出脉 4.4%→12.4%（目标带 ≥12–15%）；二级脉 0.14→0.18（3.4% 背景
 *      弱层维持不喧宾）。纯 ALU 零采样、Mid/Low 档位语义不变（Mid 无叶脉）。
 *   3) shade 地板 0.76→0.80（顺手项顶格授权值：宏距暗叶可读性——暗部抬 5%、冠顶不变；
 *      MUL_HIGH/MUL_SIMPLE 两处同步，档间连续）。
 *
 * **2026-09-19 Step 4b 可见度定稿（主代理 256px 离屏幕像素探针复核：Step 4 后中轴 vs 叶肉
 *   sRGB 亮度差恒 +6.5%——有效线性 +15.4%（= 0.85 权 × 脉色 +17.7%）被 sRGB 编码压缩，
 *   仍低于宏观取证可辨阈，视觉模型判「纯色平面」；齿 ±3px@100px 叶判「边缘平滑」）**：
 *   1) 叶脉（机器判据：同款探针中轴亮度差 ≥12% → 需有效线性 ≥+29.5%）：权重/脉色/带宽
 *      三推——中脉权 0.85→1.00（满权）+ 脉色 (1.28,1.19,0.74)→(1.62,1.34,1.00)（相对亮度
 *      1.18→1.375；增量主推 R——G 通道在探针照度（平行 2.2+环境 1.6）下近输出天花板，
 *      R 线性余量大、抗裁切）+ 中脉带 0.008/0.030→0.012/0.040（平顶加宽——线更「实」，
 *      探针/宏距采样不被衰减坡稀释）；三出脉权 0.65→0.75 + 带 0.010/0.040→0.012/0.046
 *      同步推（tri/mid 权比 0.76→0.75 相对关系不破——基侧脉对是身份核心）；二级脉权 0.18
 *      不动（随脉色增亮自然跟随至 sRGB ≈+2.9%，守背景弱层不喧宾）。albedo 线性亮度差：
 *      中脉 15%→37.5%、三出脉 11.5%→28.1% → 探针 sRGB 域自估 ≈+15% / +11.5%（校准锚：
 *      旧配方模型 +6.35% vs 实测 +6.5%，传递模型误差 <0.2pt）。
 *   2) 齿（呈现增强可选项评估后仅取门控项；幅度域 0.060 已顶格不动）：门控坡
 *      (0.42,0.56)→(0.48,0.56) 收窄——齿带严格限上半部（Spec §4「仅上半部具齿」更精确；
 *      旧起坡 0.42 在叶中线以下已有 ≤16% 弱齿）+ 起齿更陡（下半近全缘/上半具齿的身份
 *      二分更锐、齿带更聚焦）。载波 pow²→pow1.8 **否决**：方向与提议理由相反——pow<2
 *      加宽齿身、收窄齿谷（外凸占空比 30.2%→33.4%），「齿谷更开阔」需 pow>2，而那向
 *      夏栎 pow³ 锐齿身份漂移；且占空比变化 ~3% 在取证尺度 <1px。载波密度 9→8 **否决**：
 *      单齿加宽 ~11% 在 100px 叶 ≈0.8px，且 9 为「0–16 齿/侧 × 卡 ≈2× 真叶尺度取中偏密」
 *      的已记档标定，不为亚像素收益破标定。±3px@100px = 真实尺度齿深 ~2.4mm@8cm 叶
 *      （真实朴树齿深上沿）——物理可辨度已如实呈现，判「平滑」是 100px 分辨率极限非
 *      失真，不以失真换可见。深度材质随 SDF 单一来源自动同步。
 *   3) 成本：全部为权重/门控/常量级改动，零新增指令/采样/循环——叶 High 11.5× 记账不变。
 *
 * 分档记档（T011.1，3 工厂可选 level 参数缺省 'high'；档位配套传参归 asset build 路由）：
 *   - 叶 Mid：去叶脉三件（中脉带/三出脉影/弱二级脉——Spec §7 叶脉仅近距可辨，Mid 观距
 *     不可辨）+ 去中频叶团斑块；SDF 全形（卵形+急尖+上半部齿）/透光/叶背/hue·luma/shade/
 *     两面糙度差保留（颜色层次档间连续保留面）。
 *   - 叶 Low：SDF 简化——卵形包络 + 急尖先端 + 基部偏斜漂移（三项与 High 逐字同源——档间
 *     叶形身份一致的去细节不改形原则；去齿载波/齿噪声，片元零噪声采样）+ 去叶脉/叶团/
 *     透光（远距逆光透射不可辨）；hue·luma/shade/叶背保留。
 *   - 皮 Mid：去苔藓地衣（中距不可辨）；脊沟/板块/干上部平滑提亮保留。
 *   - 皮 Low：脊沟保留（裂线游走 vnoise + tri² 浅剖面 + 高度门控 + 沟内弱冷灰 AO）；去板块
 *     噪声采样/苔藓/上部提亮（板块斑驳均值化为常量乘子 vec3(0.985,0.98,0.975)——plate
 *     mix 两端中点，值噪声均值 0.5 精确保均）。
 *   - 深度：Mid = High SDF；Low = Low SDF（表面/影裁切档内一致）。
 *   - customProgramCacheKey 分档唯一（配方变即键变）：'celtis:leaf' / 'celtis:leaf:mid' /
 *     'celtis:leaf:low'；'celtis:bark' / 'celtis:bark:mid' / 'celtis:bark:low'；
 *     'celtis:leaf-depth' / 'celtis:leaf-depth:mid' / 'celtis:leaf-depth:low'（9 键全异）。
 *   - 风动（CELTIS_WIND 同一常量）三档同源不动——档间风相位一致是身份一致的一部分
 *     （同公式同常数同 aBend 语义，D19.7）。
 *
 * 成本记账（10 万实例每像素纪律，hash21=1× / vnoise=3× 口径，沿夏栎记账体例）：
 *   - 叶 High 片元 = 2× 噪声（齿抖动 1× + 叶团斑块 1×）+ SDF/叶脉三件/两面/透光/hue·shade
 *     纯 ALU（sin/cos/smoothstep/pow 折算 ≈ 5.5×——急尖变指数 pow + 三出脉轨迹三项较夏栎
 *     +1×）≈ 11.5×（略超夏栎 10.5× 压线——三出脉为身份特征接受此账，再增先降载）；
 *   - 叶 Mid 片元 = 1× 噪声（齿抖动维持）+ 简化 ALU ≈ 3× ≈ 6×（去叶团 1× + 脉三件 ALU）；
 *   - 叶 Low 片元 = 0× 噪声 + 简化 SDF ALU ≈ 2×；
 *   - 皮 High 片元 = 2× 噪声（裂线游走 + 板块）= 6× + 门控/苔藓 smoothstep 纯 ALU ≈ 1.5×
 *     ≈ 7.5×（节疤系统不实现省夏栎同款账）；
 *   - 皮 Mid 片元 = 6× + ALU ≈ 1.2× ≈ 7.2×（去苔藓门控）；
 *   - 皮 Low 片元 = 1× 噪声（裂线游走）= 3× + 脊沟 ALU ≈ 1× ≈ 4×；
 *   - 顶点 = 两次 sin + 一次法线乘，无循环；深度片元 = SDF 纯 ALU（High/Mid 含 1× 齿抖动
 *     噪声随单一来源进入，Low 零噪声）。
 *
 * uTime 接线（业界标准模式，沿 tree3aMaterials）：材质级 material.uniforms.uTime
 *   （TimeUniformService 的扫描面）与 onBeforeCompile 里 shader.uniforms.uTime 挂同一对象
 *   引用——服务写一次，程序 uniform 即时生效，不触发重编译。
 *
 * 边界：工厂每次调用 new 全部材质（D17 所有权随调用移交，禁止模块级共享对象）；零贴图/
 *   零 DataTexture（D13）；GLSL float 字面量全带小数点；aSeed=0（DEV 普通 Mesh 无该属性，
 *   WebGL 缺省属性值 0）路径相位退化为正常数——hash 无除法无 NaN；与 tree3a 的通用段
 *   （风动公式等）为复制改造非 import（资产私有，跨资产不耦合——organization.md 边界）。
 */
import * as THREE from 'three';
import { FACILITY_GLSL_NOISE } from '../../materials/facilityGlsl';
import type { ProceduralLevel } from '../../../../domain/assets';

/** onBeforeCompile 材质的 uTime 桥接面（TimeUniformService 扫描材质级 uniforms.uTime） */
type TimeBridgedMaterial = THREE.MeshStandardMaterial & {
  uniforms?: Record<string, { value: number }>;
};

/** 单次替换（目标缺失即抛——注入点漂移在首次渲染前暴雷，不静默失效；沿 plantMaterials 范式） */
function replaceOnce(source: string, target: string, replacement: string): string {
  if (!source.includes(target)) throw new Error(`celtis 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 档位缓存键后缀（High 空——首版无既有消费者；配方变即键变纪律） */
const levelKeySuffix = (level: ProceduralLevel): string => (level === 'high' ? '' : `:${level}`);

// ── 风动 GLSL（叶/皮共用：同公式同相位同常数——皮叶同摆）──────────────────────────

/**
 * 风动顶点核心：整树缓摆（aSeed 个体相位）+ 叶片快颤（aBend 权重，树皮恒 0 免颤）。
 * 常数为工程设定沿夏栎验收配方（频率/幅度/风标为逐树工程调参非物种事实；树高锚 7.5m——
 * 朴树目标 ≈8m 同语境同口径，D19.7）。
 */
const CELTIS_WIND = /* glsl */ `
// celtis wind —— uTime = 全局风帧（D19.7）；aSeed = 每棵树个体相位（缺省属性 0 → 常数相位，无除法无 NaN）
float t3cWindPhase = fract(sin(aSeed * 78.233 + 1.37) * 43758.5453);
float t3cWindH = clamp(position.y * 0.1333, 0.0, 1.0); // /7.5m 锚点树高（缩放抖动 ±16% 下权重近似）
float t3cSway = t3cWindH * t3cWindH * 0.045 * sin(uTime * 1.15 + t3cWindPhase * 6.28318 + t3cWindH * 1.4);
// 叶片快颤：ω = 14 + 9φ（2.2–3.7Hz），幅度 ≤11mm；权重 = aBend（卡根≈0 尖大）
float t3cFlutterPhase = fract(sin((aSeed + aLeafRand) * 51.171 + 4.7) * 43758.5453);
float t3cFlutter = aBend * 0.011 * sin(uTime * (14.0 + 9.0 * t3cFlutterPhase) + t3cFlutterPhase * 6.28318);
transformed.xz += vec2(0.894, 0.447) * (t3cSway + t3cFlutter); // 全局风标 normalize(2,1)（相干阵风）
transformed.y -= abs(t3cSway) * 0.18; // 摆动弧线下垂分量
transformed += objectNormal * t3cFlutter * 0.9; // 叶面沿卡法线微扑（树皮 aBend=0 → 恒 0）
`;

/** 顶点声明（叶/皮共用同一常量——皮组 aLeafRand/aBend 恒 0 契约） */
const CELTIS_WIND_DECLARE = /* glsl */ `
attribute float aSeed;
attribute float aBend;
attribute float aLeafRand;
uniform float uTime;
`;

// ── 叶形 SDF（表面材质与深度材质共用——单一来源，禁复制粘贴）──────────────────────

/**
 * 朴树叶形覆盖率（uv 域：u 横向 0–1、v 卡根 0 → 叶尖 1）：
 * 卵形包络（v^0.76 预扭曲把 sin 峰推到 v≈0.40 叶长——卵形最宽点在下段；vs 夏栎 v^1.4→0.61
 * 倒卵形。Spec §4「卵形至卵状椭圆形」Verified [1][3]）× 变指数收口（基部 0.70 圆钝、上半段
 * 1.15 提速出尖——先端急尖至短渐尖 Verified [1][3]，vs 夏栎两端同钝）× 基部微偏斜（中心线
 * 漂移 0.012——FRPS 几乎不偏斜或稍偏斜 [1]/FOC 偏斜截形 [3]）× 齿限上半部（门控
 * smoothstep(0.48,0.56,v)，下半部近全缘——四源一致核心辨识 Verified [1][3][5][6]；圆钝齿
 * 载波 2π·9 pow² + 值噪声抖动 20%，峰值 0.030 = 坡宽 0.04 的 75% 顶格——Step 4 校准：
 * 宏观特写齿可辨性；门控坡 0.42→0.48 为 Step 4b——齿带严格限上半部 + 起齿更陡）；
 * 返回近似符号距离的覆盖率坡（edge/0.04——alphaToCoverage 的 fwidth smoothstep 吃这条坡
 * 抗锯边；坡宽 0.03→0.04 为 Step 4 校准，AA 软边 1.9→2.5px 换齿幅上限 +33%）。齿数域
 * 0–16/侧（Spec §6 Verified [3]）取中偏密的读向（载波 9 周期 × 上半段
 * 门控 ≈ 4–5 可辨齿/侧，卡 ≈2× 真叶尺度换算合域）。
 */
const CELTIS_LEAF_SDF = /* glsl */ `
float t3cLeafAlpha(vec2 t3cUv, float t3cRand) {
  vec2 t3cP = vec2(t3cUv.x - 0.5, t3cUv.y);
  t3cP.x -= 0.012 * t3cP.y; // 基部微偏斜：中心线向先端漂移（极弱，纯 ALU）
  float t3cEnvSin = sin(3.14159 * pow(clamp(t3cP.y, 0.001, 0.999), 0.76)); // v^0.76：最宽点 v≈0.40（卵形）
  float t3cEnv = pow(t3cEnvSin, mix(0.70, 1.15, smoothstep(0.40, 0.95, t3cP.y))); // 基部圆钝 0.70 → 先端急尖 1.15
  float t3cGate = smoothstep(0.48, 0.56, t3cP.y); // 齿限上半部（下半部近全缘——四源一致核心辨识；Step 4b：起坡 0.42→0.48 收窄——齿带严格限上半部 + 起齿更陡）
  // 圆钝齿载波：2π·9 ≈ 9 周期，pow² 出圆钝峰谷（vs 夏栎 pow³ 锐齿），逐叶 -rand·2π 相位错开
  float t3cTooth = pow(0.5 + 0.5 * cos(t3cP.y * 56.55 - t3cRand * 6.28), 2.0);
  float t3cSerr = (t3cTooth * 0.80 + facVnoise(vec2(t3cP.y * 60.0, t3cRand * 13.0)) * 0.20 - 0.5) * 0.060 * t3cGate; // Step 4：幅度域 0.040→0.060（峰值 0.030 = 坡宽×75% 顶格）+ 载波规则度 0.75→0.80（降噪声糊边）
  float t3cEdge = 0.5 * t3cEnv + t3cSerr - abs(t3cP.x);
  return clamp(t3cEdge / 0.04 + 0.5, 0.0, 1.0); // 坡宽 0.03→0.04（Step 4：AA 软边 1.9→2.5px 换齿幅上限 +33%）
}
`;

/**
 * Low 档叶形覆盖率（SDF 单一来源分档——与 High 版同函数名同签名，深度材质按档取用）：
 * 卵形包络 + 急尖先端 + 基部偏斜漂移即可——去齿载波/齿噪声（片元零噪声采样）；Low 壳卡
 * 为大尺度叶团读向（单卡 = 整簇抽象），齿细节在 Low 观距不可辨（Spec §7 牺牲顺序：叶形
 * 细节与锯齿最先牺牲）。包络/收口/漂移三项与 High 版逐字同源（档间叶形身份一致的去细节
 * 不改形原则）。
 */
const CELTIS_LEAF_SDF_LOW = /* glsl */ `
float t3cLeafAlpha(vec2 t3cUv, float t3cRand) {
  vec2 t3cP = vec2(t3cUv.x - 0.5, t3cUv.y);
  t3cP.x -= 0.012 * t3cP.y; // 基部微偏斜（与 High 逐字同源）
  float t3cEnvSin = sin(3.14159 * pow(clamp(t3cP.y, 0.001, 0.999), 0.76)); // v^0.76：最宽点 v≈0.40（卵形）
  float t3cEnv = pow(t3cEnvSin, mix(0.70, 1.15, smoothstep(0.40, 0.95, t3cP.y)));
  float t3cEdge = 0.5 * t3cEnv - abs(t3cP.x);
  return clamp(t3cEdge / 0.04 + 0.5, 0.0, 1.0); // 坡宽与 High 同步（Step 4——档间 AA 边一致，档间切换无跳变）
}
`;

/** 叶片元配方主体（<map_fragment> 后注入——乘性调制 diffuseColor.rgb + alpha 写 diffuseColor.a；
 *  位于 <color_fragment> 之前，与 vColor 乘算交换律安全）。分段拼装（沿夏栎体例：段首 \n、
 *  段尾无换行段间单换行拼接）：High = HEAD + CLUMP + SHADE + VEIN + MUL_HIGH + BACK；
 *  Mid/Low = HEAD + SHADE + MUL_SIMPLE + BACK（去叶团/叶脉三件——叶团乘子 0.94+0.12×t3cClump
 *  均值化 = 1.0 消去，值噪声均值 0.5 精确保均）。 */
const CELTIS_LEAF_HEAD = /* glsl */ `
// celtis:leaf —— SDF 卵形叶覆盖 + 逐叶变奏 + 冠内层次（<color_fragment> 不触碰）
float t3cAlpha = t3cLeafAlpha(vUv, vLeafRand);
diffuseColor.a = t3cAlpha;
// 逐叶身份（aLeafRand）：色相两端（冷绿 ↔ 暖黄绿——朴树冠层较夏栎更黄，蓝端收窄；通道摆幅 ≤15% 纪律）
// + 明度 ±10%（去相关取样）
vec3 t3cHue = mix(vec3(0.92, 1.00, 1.06), vec3(1.10, 1.04, 0.84), fract(vLeafRand * 5.391 + 0.23));
float t3cLuma = 0.90 + 0.20 * fract(vLeafRand * 3.117 + 0.61);`;

/** High 专属：中频叶团斑块（位置域 1× vnoise——Mid/Low 去采样） */
const CELTIS_LEAF_CLUMP = /* glsl */ `
// 冠内：中频叶团斑块（波长 ~1.1m ≈ 叶团身份差；采样偏移与夏栎去相关）
float t3cClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.71, vTreePos.y - vTreePos.z * 0.53) * 0.9 + vec2(4.7, 8.2));`;

/** 冠内竖向自遮蔽（三档共用——颜色层次保留面） */
const CELTIS_LEAF_SHADE = /* glsl */ `
float t3cShade = clamp((vTreePos.y - 3.0) / 3.4, 0.0, 1.0); // 冠基 ≈3.0m（干高占比 0.35–0.45 × ≈8m，Spec §3 Inferred [8][9]；区间取值工程设定）`;

/** High 专属：叶脉三件（中脉亮带 / 三出脉基侧脉对 / 弱二级脉，纯 ALU 零采样） */
const CELTIS_LEAF_VEIN = /* glsl */ `
// 叶脉：中脉亮带 + 三出脉基侧脉对（自叶基弧向先端、先端前吻合——FOC 属级 3-veined from
// base Verified [4]，照片一张极显著/一张中等显著 [6]）+ 弱二级脉（中脉每侧 3–4 条 [3]——
// 弱对比 0.18）；浅黄绿脉色（脉比叶肉亮）；纯 ALU 零采样。Step 4b 可见度定稿：Step 4 的
// albedo 域线性亮度差（中脉 15%/三出脉 11.5%）经 sRGB 编码压缩后探针仅 +6.5% 低于可辨阈
// ——权/色/带宽三推至线性 37.5%/28.1%（探针 sRGB 自估 ≈+15%/+11.5%）
vec2 t3cP = vec2(vUv.x - 0.5, vUv.y);
t3cP.x -= 0.012 * t3cP.y; // 与 SDF 同款中心线漂移（叶脉跟随叶轴）
float t3cVeinMid = 1.0 - smoothstep(0.012, 0.040, abs(t3cP.x)); // Step 4b：带 0.008/0.030→0.012/0.040（平顶加宽线更实——采样不被衰减坡稀释）
float t3cTriPath = 0.30 * pow(t3cP.y, 0.45) * (1.0 - 0.45 * t3cP.y); // 基出侧脉轨迹：自叶基急升后近叶缘平行内行
float t3cVeinTri = (1.0 - t3cVeinMid)
  * (1.0 - smoothstep(0.012, 0.046, abs(abs(t3cP.x) - t3cTriPath))) // Step 4b：带 0.010/0.040→0.012/0.046（基侧脉对身份核心同步推）
  * smoothstep(0.04, 0.12, t3cP.y) * (1.0 - smoothstep(0.80, 0.94, t3cP.y)); // 基部离轴渐显、先端前吻合渐隐
float t3cVeinLat = pow(max(0.0, sin(t3cP.y * 22.0 - abs(t3cP.x) * 30.0 + (vLeafRand - 0.5) * 0.6)), 6.0)
  * (1.0 - t3cVeinMid) * smoothstep(0.08, 0.26, t3cP.y) * (1.0 - smoothstep(0.70, 0.92, t3cP.y));`;

/** High 专属：合成（叶团乘子 + 脉三件调制） */
const CELTIS_LEAF_MUL_HIGH = /* glsl */ `
vec3 t3cMul = t3cHue * t3cLuma * (0.80 + 0.20 * t3cShade) * (0.94 + 0.12 * t3cClump); // Step 4：shade 地板 0.76→0.80（宏距暗部可读性，顺手项顶格授权值）
t3cMul = mix(t3cMul, t3cMul * vec3(1.62, 1.34, 1.00), t3cVeinMid * 1.00 + t3cVeinTri * 0.75 + t3cVeinLat * 0.18); // Step 4b 可见度定稿：中脉满权 1.00 + 脉色相对亮度 1.18→1.375（R 主推抗 G 裁切）——探针 sRGB 中轴 6.5%→自估 ≈+15%；三出脉 0.65→0.75 同步推（tri/mid 相对关系不破）；二级脉 0.18 不动守背景弱层
diffuseColor.rgb *= t3cMul;`;

/** Mid/Low：合成（去叶团/叶脉项——叶团乘子 0.94+0.12×0.5 = 1.0 均值化消去，值噪声均值 0.5 精确保均） */
const CELTIS_LEAF_MUL_SIMPLE = /* glsl */ `
vec3 t3cMul = t3cHue * t3cLuma * (0.80 + 0.20 * t3cShade); // Mid/Low：叶团乘子均值化消去（T011.1）；shade 地板 0.76→0.80（Step 4 与 High 同步）
diffuseColor.rgb *= t3cMul;`;

/** 叶背浅灰绿（三档共用，纯 ALU 零采样零分支） */
const CELTIS_LEAF_BACK = /* glsl */ `
// 叶背浅灰绿更暗淡（Spec §5 Verified [3][5][6]：dark above, duller below / 两叶照上面深绿下面
// 浅灰绿）：gl_FrontFacing 区分背面（WebGL2 内建；DoubleSide 双面片元，背面法线由 three 双面
// 光照自动翻转，此处只调固有色）——背面轻度提亮 + 去饱和 + 冷灰绿偏移（R/G 靠拢、B 相对抬升），
// 幅度克制（vs 夏栎粉绿 ×(0.94,1.05,1.16)——朴树浅灰绿另配）；「更暗淡」走糙度通道（背面
// +0.12 哑光差，见 roughnessmap 注入）；纯 ALU 零采样零分支
diffuseColor.rgb *= mix(vec3(1.02, 1.00, 1.10), vec3(1.0), float(gl_FrontFacing));
`;

/** 叶背光透射（<opaque_fragment> 前注入 outgoingLight——透射项走完整色调映射管线）。
 *  弱化版：厚纸质至近革质透光弱（Spec §5 Inferred [2][3][5]）——峰值 0.30 显著小于夏栎 0.65。 */
const CELTIS_LEAF_TRANSLUCENCY = /* glsl */ `
// celtis:leaf —— 背光透射（弱）：视线与阳光反向时叶背透淡暖绿（叶绿素吸收红蓝 → 透射偏黄绿；
// 近革质叶透光弱——峰值 0.30 vs 夏栎 0.65，Spec §5 Inferred）
#if NUM_DIR_LIGHTS > 0
  float t3cBack = saturate(dot(normalize(vViewPosition), -directionalLights[0].direction));
  float t3cTransVar = 0.55 + 0.45 * fract(vLeafRand * 7.717 + 0.44); // 逐叶透光强度变奏
  outgoingLight += vec3(0.58, 0.90, 0.38) * directionalLights[0].color
    * pow(t3cBack, 3.0) * t3cTransVar * t3cAlpha * 0.30;
#endif
`;

/** 树皮配方主体（<map_fragment> 后注入；uv 域 u=环绕一周 v=累计弧长 ×0.5 + 位置域门控）。
 *  分段拼装（沿夏栎体例）：High = HEAD + RIDGE + PLATE + MOSS + MUL；Mid = HEAD_MID +
 *  RIDGE + PLATE + MUL_MID（去苔藓地衣——中距不可辨）；Low = HEAD_LOW + RIDGE + MUL_LOW
 *  （脊沟保留；去板块采样/苔藓/上部提亮——板块均值化常量乘子）。 */
const CELTIS_BARK_HEAD = /* glsl */ `
// celtis:bark —— 平滑-浅裂小斑块 + 干上部平滑提亮 + 少量苔藓地衣（低浮雕语言，vs 夏栎深沟脊-板）`;

/** Mid 档头注释（内容面与 High 的差仅记档一行） */
const CELTIS_BARK_HEAD_MID = /* glsl */ `
// celtis:bark:mid —— 平滑-浅裂小斑块 + 干上部平滑提亮（T011.1 Mid：去苔藓地衣——中距不可辨）`;

/** Low 档头注释 */
const CELTIS_BARK_HEAD_LOW = /* glsl */ `
// celtis:bark:low —— 浅裂脊沟（T011.1 Low：裂线游走 + tri² 浅剖面 + 高度门控 + 沟内弱冷灰 AO 保留；板块/苔藓/上部提亮去采样）`;

/** 脊-沟核心（三档共用——Low 保留面的唯一采样：裂线游走 vnoise；高度门控为结构剪影项三档保留） */
const CELTIS_BARK_RIDGE = /* glsl */ `
float t3cBarkWarp = facVnoise(vec2(vUv.x * 2.4, vUv.y * 1.8) + vec2(7.3, 5.1)); // 裂线游走（低频，更缓于夏栎）
float t3cBarkTri = abs(fract(vUv.x * 9.0 + t3cBarkWarp * 1.1) * 2.0 - 1.0); // 整数脊数 → u 缝相位连续（9 脊，斑块小）
// 干上部更平滑（Spec §5 Verified [2][5][6]：上部平滑色浅、干基粗糙）——高度门控弱化裂深
float t3cBarkSmooth = smoothstep(0.8, 3.4, vTreePos.y);
// 浅裂：tri² 剖面 + 沟底 0.76（vs 夏栎 0.44 + tri³ 深沟——低浮雕对比弱化，Spec bark_relief Verified [6]）
float t3cBarkRidge = mix(0.76 + 0.24 * t3cBarkTri * t3cBarkTri, 0.93 + 0.07 * t3cBarkTri * t3cBarkTri, t3cBarkSmooth);`;

/** High/Mid：近各向同性小斑块（1× vnoise——Low 去采样） */
const CELTIS_BARK_PLATE = /* glsl */ `
float t3cBarkPlate = facVnoise(vec2(vUv.x * 7.5, vUv.y * 10.5) + vec2(19.7, 6.2)); // 近各向同性小尺度浅斑块（vs 夏栎竖长板）`;

/** High 专属：苔藓/地衣（少量集中干下部——竖向门控 × 收紧噪声高带 × 方位门控） */
const CELTIS_BARK_MOSS = /* glsl */ `
// 苔藓/地衣少量集中干下部（Spec §5 Verified [6]，覆盖度低于夏栎——噪声带收紧 + 强度 0.55 + 灰绿地衣读向）
float t3cBarkMoss = (1.0 - smoothstep(1.6, 3.6, vTreePos.y))
  * smoothstep(0.64, 0.88, t3cBarkWarp * 0.6 + t3cBarkPlate * 0.55)
  * smoothstep(-0.15, 0.75, sin(vUv.x * 6.28318 + 1.2)); // 方位门控（一侧集中一侧干净）`;

/** High：合成（浅斑块冷暖 + 沟内弱 AO + 上部提亮 + 苔藓地衣） */
const CELTIS_BARK_MUL = /* glsl */ `
vec3 t3cBarkMul = t3cBarkRidge
  * mix(vec3(0.90, 0.915, 0.945), vec3(1.07, 1.045, 1.005), t3cBarkPlate); // 浅斑块冷暖弱化（低浮雕）
t3cBarkMul *= mix(vec3(0.93, 0.92, 0.97), vec3(1.03, 1.02, 0.99), smoothstep(0.15, 0.75, t3cBarkTri)); // 沟内弱冷灰 AO（浅沟更弱）
t3cBarkMul *= 1.0 + 0.07 * t3cBarkSmooth; // 干上部色更浅（Spec Verified [2][5][6]）
t3cBarkMul = mix(t3cBarkMul, t3cBarkMul * vec3(0.84, 0.97, 0.68), t3cBarkMoss * 0.55); // 少量灰绿苔藓地衣（强度低于夏栎 0.82）
diffuseColor.rgb *= t3cBarkMul;
`;

/** Mid：合成（去苔藓两行；浅斑块/沟内 AO/上部提亮保留） */
const CELTIS_BARK_MUL_MID = /* glsl */ `
vec3 t3cBarkMul = t3cBarkRidge
  * mix(vec3(0.90, 0.915, 0.945), vec3(1.07, 1.045, 1.005), t3cBarkPlate);
t3cBarkMul *= mix(vec3(0.93, 0.92, 0.97), vec3(1.03, 1.02, 0.99), smoothstep(0.15, 0.75, t3cBarkTri)); // 沟内弱冷灰 AO
t3cBarkMul *= 1.0 + 0.07 * t3cBarkSmooth; // 干上部色更浅
diffuseColor.rgb *= t3cBarkMul;
`;

/** Low：合成（板块均值化常量乘子 = plate mix 两端中点（值噪声均值 0.5 精确保均）；脊沟读向不破） */
const CELTIS_BARK_MUL_LOW = /* glsl */ `
vec3 t3cBarkMul = t3cBarkRidge * vec3(0.985, 0.98, 0.975); // 板块均值化常量乘子（T011.1 Low）
t3cBarkMul *= mix(vec3(0.93, 0.92, 0.97), vec3(1.03, 1.02, 0.99), smoothstep(0.15, 0.75, t3cBarkTri)); // 沟内弱冷灰 AO
diffuseColor.rgb *= t3cBarkMul;
`;

// ── 工厂（每次调用 new 材质 + 独立注入闭包；键不变则共享 program）──────────────────

/**
 * 叶卡材质（组 1）：SDF 卵形叶形 alphaTest 裁切 + 两面区分 + 弱透光 + 逐叶变奏 + 风动。
 * level 分档（T011.1，缺省 'high'）：Mid 去叶脉三件（中脉带/三出脉影/弱二级脉——Spec §7
 * 叶脉仅近距可辨）+ 去叶团斑块（SDF 全形/透光/叶背/hue·luma/shade/两面糙度差保留）；
 * Low 换 CELTIS_LEAF_SDF_LOW（卵形+急尖+偏斜漂移，片元零噪声采样）+ 去透光（远距逆光透射
 * 不可辨）。风动三档同源不动（CELTIS_WIND 同一常量——档间风相位一致 = 身份一致）。
 * 底参：中绿偏黄 #5a8340（工程设定——照片 canopy-a/b + leaf-a/b 交叉标定，较夏栎更黄更亮；
 * Spec §5 中-深绿 Verified [3][5][6]）/ m 0 / r 0.72（半光泽——近革质，Spec §5 Inferred [6]，
 * vs 夏栎 0.85）/ DoubleSide（卡面双面可见，背面法线由 three 双面光照自动翻转）。
 */
export function createCeltisLeafMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x5a8340, // 中绿偏黄（工程设定：照片交叉标定「比夏栎更黄更亮」；Spec §5 中-深绿 Verified）
    metalness: 0,
    roughness: 0.72, // 半光泽（近革质——Spec §5 Inferred [6]；vs 夏栎 0.85 哑光）
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    alphaToCoverage: true, // MSAA 覆盖率抗锯边（WebGL2；非 MSAA 目标退化为硬裁切仍正确）
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡 uv（无贴图材质默认无 USE_UV，显式打开）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime }; // 材质级（TimeUniformService 扫描面）
  const leafSdf = level === 'low' ? CELTIS_LEAF_SDF_LOW : CELTIS_LEAF_SDF; // Mid 表面 SDF = High 同源全形
  const leafBody = level === 'high'
    ? CELTIS_LEAF_HEAD + CELTIS_LEAF_CLUMP + CELTIS_LEAF_SHADE + CELTIS_LEAF_VEIN + CELTIS_LEAF_MUL_HIGH + CELTIS_LEAF_BACK
    : CELTIS_LEAF_HEAD + CELTIS_LEAF_SHADE + CELTIS_LEAF_MUL_SIMPLE + CELTIS_LEAF_BACK; // Mid/Low 同体（档差在 SDF / 透光注入）
  const leafRoughness = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor + (t3cClump - 0.5) * 0.06 + (1.0 - float(gl_FrontFacing)) * 0.12, 0.05, 1.0);'
    : 'roughnessFactor = clamp(roughnessFactor + (1.0 - float(gl_FrontFacing)) * 0.12, 0.05, 1.0); // Mid/Low：叶团糙度项随段去（两面光泽差保留——叶背更暗淡）';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime; // 同一对象引用——服务写一次两边生效
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${CELTIS_WIND_DECLARE}varying float vLeafRand;
varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;
vTreePos = position; // 风动位移前捕获（噪声域稳定——图案不随风游走）
${CELTIS_WIND}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying float vLeafRand;
varying vec3 vTreePos;
${FACILITY_GLSL_NOISE}
${leafSdf}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
${leafBody}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
${leafRoughness}`,
    );
    if (level !== 'low') { // Low 去透光（远距逆光透射不可辨）；High/Mid 注入
      shader.fragmentShader = replaceOnce(
        shader.fragmentShader,
        '#include <opaque_fragment>',
        `${CELTIS_LEAF_TRANSLUCENCY}
#include <opaque_fragment>`,
      );
    }
  };
  material.customProgramCacheKey = () => `celtis:leaf${levelKeySuffix(level)}`;
  return material;
}

/**
 * 树皮材质（组 0）：平滑-浅裂小斑块 + 干上部平滑提亮 + 少量苔藓地衣 + 整树缓摆（与叶同公式
 * 同相位；aBend 恒 0 快颤层天然不作用）。level 分档（T011.1，缺省 'high'）：Mid 去苔藓地衣
 * （脊沟/板块/上部平滑提亮保留）；Low 脊沟保留（裂线游走 vnoise + tri² 浅剖面 + 高度门控 +
 * 沟内弱冷灰 AO），去板块噪声采样/苔藓/上部提亮（板块斑驳均值化为常量乘子——脊沟读向不破）。
 * 风动三档同源不动。
 * 底参：灰白-灰褐主调 #7a746a（工程设定——bark-a 受光/阴影折中，比夏栎 #5c534a 各通道
 * +30–34 更浅更灰；Spec §5 bark_color Verified [2][5][6]）/ m 0 / r 0.92（高糙哑光、平滑
 * 灰皮微弱光泽）/ FrontSide。
 */
export function createCeltisBarkMaterial(level: ProceduralLevel = 'high'): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0x7a746a, // 灰白-灰褐主调（工程设定：bark-a/b 照片折中；Spec §5 Verified [2][5][6]——比夏栎更浅更灰）
    metalness: 0,
    roughness: 0.92,
    side: THREE.FrontSide,
  });
  material.defines = { USE_UV: '' }; // 裂沟/斑块域 = 圆柱 uv（u=环绕一周、v=累计弧长）
  const uTime = { value: 0 };
  (material as TimeBridgedMaterial).uniforms = { uTime };
  const barkBody = level === 'high'
    ? CELTIS_BARK_HEAD + CELTIS_BARK_RIDGE + CELTIS_BARK_PLATE + CELTIS_BARK_MOSS + CELTIS_BARK_MUL
    : level === 'mid'
      ? CELTIS_BARK_HEAD_MID + CELTIS_BARK_RIDGE + CELTIS_BARK_PLATE + CELTIS_BARK_MUL_MID
      : CELTIS_BARK_HEAD_LOW + CELTIS_BARK_RIDGE + CELTIS_BARK_MUL_LOW;
  const barkRoughness = level === 'high'
    ? 'roughnessFactor = clamp(roughnessFactor + (t3cBarkPlate - 0.5) * 0.04 + t3cBarkMoss * 0.04 - t3cBarkTri * t3cBarkTri * 0.05 - t3cBarkSmooth * 0.06, 0.05, 1.0); // 脊面/干上部微光滑（平滑灰皮弱光泽）+ 苔藓微糙'
    : level === 'mid'
      ? 'roughnessFactor = clamp(roughnessFactor + (t3cBarkPlate - 0.5) * 0.04 - t3cBarkTri * t3cBarkTri * 0.05 - t3cBarkSmooth * 0.06, 0.05, 1.0); // Mid：去苔藓糙度项（脊面/上部光滑保留）'
      : 'roughnessFactor = clamp(roughnessFactor - t3cBarkTri * t3cBarkTri * 0.05, 0.05, 1.0); // Low：脊面微光滑保留（板块/苔藓/上部项去）';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
${CELTIS_WIND_DECLARE}varying vec3 vTreePos;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vTreePos = position;
${CELTIS_WIND}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying vec3 vTreePos;
${FACILITY_GLSL_NOISE}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
${barkBody}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
${barkRoughness}`,
    );
  };
  material.customProgramCacheKey = () => `celtis:bark${levelKeySuffix(level)}`;
  return material;
}

/**
 * 叶影裁切深度材质（customDepthMaterial 用）：同一 SDF alpha 函数 + alphaTest 0.5。
 * level 分档（SDF 单一来源分档——档间表面/影裁切叶形一致）：Mid = High SDF（Mid 表面 SDF
 * 与 High 同源全形）；Low = CELTIS_LEAF_SDF_LOW（表面/影裁切档内一致）。
 * 树皮组守卫：aLeafRand=0（树皮恒 0）→ alpha=1 实心——多材质网格共用本深度材质时皮组
 * 不被叶形 SDF 误裁。风动位移不进 depth pass（静态影取舍，见模块头记档）；影 pass 侧向由
 * shadowMap 按主材质 DoubleSide 覆写为双面（叶卡两面皆可投影）；alphaTest 由 shadowMap
 * 按主材质 alphaToCoverage 覆写为 0.5（与本值一致）。
 */
export function createCeltisLeafDepthMaterial(level: ProceduralLevel = 'high'): THREE.MeshDepthMaterial {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.5,
  });
  material.defines = { USE_UV: '' }; // SDF 域 = 叶卡 uv
  const leafSdf = level === 'low' ? CELTIS_LEAF_SDF_LOW : CELTIS_LEAF_SDF; // Mid 深度 = High SDF（同源全形）
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
attribute float aLeafRand;
varying float vLeafRand;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vLeafRand = aLeafRand;`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying float vLeafRand;
${FACILITY_GLSL_NOISE}
${leafSdf}`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <map_fragment>',
      `#include <map_fragment>
diffuseColor.a = mix(1.0, t3cLeafAlpha(vUv, vLeafRand), step(0.0001, vLeafRand)); // 皮组 aLeafRand=0 → 实心`,
    );
  };
  material.customProgramCacheKey = () => `celtis:leaf-depth${levelKeySuffix(level)}`;
  return material;
}
