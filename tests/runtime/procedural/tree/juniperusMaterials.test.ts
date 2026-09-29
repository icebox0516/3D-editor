/**
 * tests/runtime/procedural/tree/juniperusMaterials.test.ts —— 圆柏鳞卡/刺卡/树皮/
 * 深度材质测试（T012.3 Step 3b，对称 cedrus/metasequoiaMaterials.test.ts 范式：真实
 * THREE.ShaderLib 源组装，静态字符串断言，零 WebGL；build()/资产入口归并行几何
 * agent 的资产测试，此处不覆盖）。**针叶族（conifer）第三例材质测试——新增语义
 * 四者准入（D40）**：绳状鳞卡 SDF 第 3 叶语言（对生行窗列 + 四列错位）/ 双叶型材质
 * （绳卡 + 刺卡双帧同材质——族内首例）/ 浆果白霜层（双熟度 + u 域分类）/ 第 16
 * 树皮语言（灰-灰褐纵长条片剥落）。
 *
 * 覆盖：
 * - uTime 接线（TimeUniformService 消费协议）：鳞卡/皮材质挂材质级 uniforms.uTime
 *   （own property）；onBeforeCompile 后 shader.uniforms.uTime 与材质级同对象引用；
 *   GLSL 声明 uniform float uTime；材质挂场景被服务逐帧驱动（frame 写值闭环）；
 * - 风动契约（D19.7 + 判定 8 **两成分**）：aSeed/aBend/aLeafRand 顶点 attribute
 *   声明存在；相位 = fract(sin(...)) 类 hash（aSeed=0 缺省属性路径退化为常数相位，
 *   全源零除 aSeed——无 NaN）；两成分在位（①整冠 0.30Hz×0.022m 主成分——tier 幅
 *   > fringe 的密实质量体排位 + ②末级鳞枝细幅微颤 1.9Hz×0.018m aBend 权重——幅/
 *   频均低于水杉羽状 0.055/2.6Hz）+ **顶梢成分零在位**（通直无点头——族内可选·
 *   雪松消费位第三例）；整冠摆鳞卡/皮同公式（同串出现——防撕裂）；**树高锚 8**
 *   （JUNIPERUS_TREE_HEIGHT_NOMINAL = profile slot-0 totalHeight 同源 + 1/8 =
 *   0.12500 注入 + 锚同步轮断言——6–10m 级）；
 * - instanceColor 乘算链安全：注入后 <color_fragment> 原句恰一次、注入代码零 vColor
 *   介入；
 * - 三帧卡 SDF 与透光：alphaTest 0.5 + alphaToCoverage；片元含 jnpCardAlpha 计算
 *   式与 alpha 写入；**三帧路由**（绳卡 v∈[0,1) / 浆果卡 v∈[1,2) / 刺卡 v∈[2,3)
 *   ——阈值 1.0/2.0，SDF 生成器三工厂注入同串 + **果色层路由在皮材质**〔器官卡
 *   入组 0 沿 metasequoia——叶材质零果色层〕+ 深度同 SDF 路由）；**绳卡形态第 3
 *   语言**（对生行窗列 N = 绳单元数分档 24/14/8 + 四列域 + 邻列半节距错位 +
 *   奇偶行斜切 + 绳单元带 80% + 细杆包络 + 中轴渐细——**密度不随卡尺度稀释 JS
 *   锚**〔012.2 羽卡亚像素教训：卡幅带 0.18–0.30 ÷ N 节距 > 4mm〕）+
 *   **导数感知亚像素退化门**〔T012.3 Step 4 第二轮·材质域：近景可解析度
 *   jnpRead = max(节距门 1/(N·|∇v|) ∈ (0.9,1.3), 卡宽门 1/|∇u| ∈ (3,12))
 *   ——任一向可读即原值（M25/M8 屏幕尺度域因斜置姿态重叠单门不可分）；
 *   可解析域带占 0.80/坡宽 0.02/剪影原值逐位不动（M8 面向 pitch ≥1.4px/
 *   宽 ≥25px + 斜置可读卡全保护——近景绳列身份不变）；亚像素域（M25 全卡
 *   pitch ≤1.3 两向均不可读）带占→1.00（H1 绳隙→带色收敛）+ 坡宽→fwidth(d)
 *   ≈1px 覆盖 AA（H3 footprint 均值化替代逐点采样 A2C 抖动淡染）+ 剪影厚度
 *   保持 jnpSolidify（H3b——低尾裁除/高段饱和/+0.19 补宽；绳刺共用、刺卡独立
 *   门带 1.2–4.5px）；表面/深度同串——影裁切同步收敛〕；**刺卡帧**
 *   （cedrus sin 单针包络机制直承 + 指数 0.65 披针-钻形最宽 ≈0.35 JS 锚 + 两条
 *   白粉带色层〔帧门 + 双带位 0.5±0.18〕）；浆果帧轮廓 = v 埧圆端带；深度材质含
 *   同一 SDF 生成器输出（单一来源，**档内表面/影同串**）+ RGBADepthPacking +
 *   组 0 守卫（aLeafRand=0 实心——浆果卡同守卫 → 影实心方卡剪影记档）+ USE_UV +
 *   alphaTest；透光项存在且 NUM_DIR_LIGHTS 守卫（组 1 双叶帧均透光——无域门）；
 *   风动不进 depth pass；
 * - 物种配方锚定（Spec juniperus-reference **1.1** §5/§5.1/§5.2/§5.3/§风动——
 *   profile 导入值交叉锚，笔误防线）：**受光色差构造中点式 ramp**（冠基 1.2 =
 *   trunkHeightRatio 0.15 × 8 同源锚 JS + 端点 = needleColorShade/Sun 对构造中点
 *   #4a5d47 的 sRGB 比值 × 0.65 软化 JS 锚——算术对称，暴露度 0.5 = 中点色）；
 *   **无两面色差**（终审修正口径同雪松：零 gl_FrontFacing 负面断言——vs 水杉两面
 *   差的反向分化；深度 pass 同零）/ 白粉 0.15 弱档（整冠灰蓝霜调——cedrus 0.35
 *   档等比弱化 JS 锚）/ 新梢黄绿 10% 卡（0.22 × 0.45）/ 深绿-暗绿基色 #4a5d47
 *   （= profile needleMaterial 严格中点 JS 锚）/ 糙度 0.64 蜡质鳞叶（family 链位）/
 *   **透光低幅 0.28**（家族链 水杉 0.46 > 雪松 0.38 > 圆柏——密质贴枝下调；判定
 *   「透射低幅」）/ 透射色深青绿；**浆果域（皮材质）**（双熟度双色——**u ≥ 0.5
 *   翌年霜熟 / u < 0.5 当年绿幼〔cedrus 两类果机制的 u 域承载〕+ coneClassRatio
 *   0.75 profile 锚 + 暗蓝紫褐/绿幼果线性端点 JS 锚 + **白粉霜层**加性蓝灰覆层
 *   〔「被白粉」FRPS Verified + 中距霜蓝果点身份——三档保留〕+ 蜡质果霜糙度
 *   0.45/0.58 定值）；**第 16 树皮**（#595955 深灰基 + 周向 24 × 纵向 72 段频率/
 *   管程〔v ∈ [0,0.92] 逐管归一契约假设〕条片网格 + 沟半宽 0.08+0.09×0.55 JS 锚
 *   〔第 15 语言公式直承〕+ 三调色端点 JS 锚（沟/脊顶对基色比值 × 0.90/0.70 软化
 *   + **R ≥ G ≥ B 灰-灰褐轴 JS 锚**〔vs 水杉 B 最高红褐基调的色相区分锁〕+ 长纤
 *   维翘边 + 断口沟高位衰减〔枝皮灰长纤维条剥门〕+ 逐段深浅 + 幼枝灰绿株内梯度 +
 *   纤维细纹 High + 干基暗化）；皮材质 DoubleSide + alphaTest 0.5（浆果单面卡
 *   双面读向 + 圆端带裁切——皮域 alpha 恒 1 实心）；
 * - 分档实装（level 参数，缺省 'high'）：三工厂缺省 ≡ 显式 'high'（属性 + 键 +
 *   GLSL 全文逐位相等）；3 工厂 × 3 档 = 9 键互异；鳞卡 Mid 绳单元 14 + 去簇团/
 *   糙度项（受光/白粉/新梢/刺带/透光保留）、Low 8 + 再去透光、片元零噪声；皮 Mid
 *   去翘边微暗/纤维细纹、Low 再去逐段深浅/枝皮灰门/株内梯度/干基暗化（条片三色
 *   剖面 + 断口剪影保留；**白霜层三档保留**——vs cedrus Mid 去白粉的分化断言）；
 *   深度 SDF **随档变体**（24/14/8——档内表面/影一致）；风动三档顶点 GLSL 同源；
 *   分档底参契约不因档破；uTime 桥接三档不缺位；浆果帧糙度三档定值（皮材质）；
 * - program 键纪律：鳞卡/皮/深度三键互异；两次工厂调用材质对象不同（无模块级共
 *   享，D17）但键相同；uniforms 不跨实例共享；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：鳞卡 High 片元
 *   facVnoise 1 处（簇团）、Mid/Low 0 处；皮 High 2 处（游走 + 纤维细纹）、Mid/
 *   Low 1 处；深度 0 处（零噪声库注入）；顶点零噪声；**全源零循环**（绳列窗列直
 *   接求值无三候选循环——vs 水杉羽列固定 3 次循环白名单的分化）/零纹理采样；
 * - 注入点缺失即抛（map_fragment/begin_vertex/common/roughnessmap_fragment/
 *   opaque_fragment 摘除各暴雷）；
 * - 结构完整性：include 全展开后花括号配平差值与原版一致（注入不破坏 GLSL 结构）；
 * - TimeUniformService.freeze：冻结期间广播仍写当前值（uTime 常量——树静止）+
 *   材质兼容。
 * 边界：材质登记 afterEach 统一 dispose 兜底，不跨测试泄漏；雪松/水杉语言不串种
 *   （ced/msq 前缀负面断言——第 3/15/16 语言分化锁）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms } from 'three';
import { TimeUniformService } from '../../../../src/runtime/services/TimeUniformService';
import {
  createJuniperusBarkMaterial,
  createJuniperusNeedleDepthMaterial,
  createJuniperusNeedleMaterial,
  JUNIPERUS_TREE_HEIGHT_NOMINAL,
} from '../../../../src/runtime/procedural/tree/juniperus/juniperusMaterials';
import { JUNIPERUS_SLOT0_PROFILE } from '../../../../src/runtime/procedural/tree/juniperus/juniperusShapeProfile';
import { assemble, braceDelta, count, createMaterialTracker, expandIncludes, materialUniformsOf, propsOf, sdfOf as extractSdf } from '../../../support/procedural-tree/materialHarness';

const { track, disposeAll } = createMaterialTracker();

/** 提取注入后的 jnpCardAlpha 函数全文（SDF 单一来源比对用；首个 \n} 即函数闭合） */
const sdfOf = (fragmentShader: string): string =>
  extractSdf(fragmentShader, 'float jnpCardAlpha(vec2 jnpUv, float jnpRand)');

/** GLSL mix 的 JS 同构（导数门端点 JS 锚用——可解析/亚像素两域行为自证） */
const mixJs = (a: number, b: number, t: number): number => a * (1 - t) + b * t;

afterEach(() => {
  disposeAll();
});

describe('uTime 接线（TimeUniformService 消费协议）', () => {
  it('鳞卡/皮材质挂材质级 uniforms.uTime；编译后 shader.uniforms.uTime 同引用；GLSL 声明 uniform', () => {
    for (const material of [track(createJuniperusNeedleMaterial()), track(createJuniperusBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('材质挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const needle = track(createJuniperusNeedleMaterial());
    const bark = track(createJuniperusBarkMaterial());
    const clock = new TimeUniformService();
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), needle));
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), bark));
    clock.frame(0, scene);
    expect(materialUniformsOf(needle).uTime!.value).toBe(0);
    clock.frame(1000, scene);
    expect(materialUniformsOf(needle).uTime!.value).toBeCloseTo(1, 10); // 服务写一次两边生效
    expect(materialUniformsOf(bark).uTime!.value).toBeCloseTo(1, 10);
  });
});

describe('风动契约（D19.7 + 判定 8：两成分——整冠主成分，顶梢成分不消费）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）', () => {
    const needle = assemble(track(createJuniperusNeedleMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(needle.vertexShader).toContain(decl);
    }
    expect(needle.vertexShader).toContain('fract(sin(aSeed * 111.413 + 6.3)'); // 整树相位 = hash(aSeed)——常数与先例相位流（sway 77.669–107.317）去相关
    expect(needle.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 88.523 + 8.4)'); // 颤动相位 = hash(aSeed+卡身份)——个体 + 逐卡双相位差
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(needle.vertexShader + needle.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('两成分在位：整冠 0.30Hz×0.022（主成分）/ 末级鳞枝微颤 1.9Hz×0.018（aBend）；顶梢成分零在位；频率 = profile Hz × 2π JS 锚', () => {
    const needle = assemble(track(createJuniperusNeedleMaterial()), THREE.ShaderLib.physical);
    // 成分①：整冠低频小幅摆（主成分——密实质量体；Spec §风动读向 Inferred）
    expect(needle.vertexShader).toContain('jnpWindH * jnpWindH * 0.022 * sin(uTime * 1.8850');
    // 成分②：末级鳞枝细幅微颤（幅/频均低于水杉羽状 0.055/2.6Hz——硬质密质读向；aBend 权重，组 0 恒 0 免颤）
    expect(needle.vertexShader).toContain('aBend * 0.018 * sin(uTime * 11.9381');
    // 顶梢成分零在位（主干通直无点头——族内可选·雪松消费位；判定 8 第三例）
    expect(needle.vertexShader).not.toContain('jnpLead');
    expect(count(needle.vertexShader, 'sin(uTime')).toBe(2); // 恰两成分
    // 频率 JS 锚：windTier/FringeFrequency (Hz) × 2π → rad/s 字面量（4 位小数一致）
    expect((0.3 * Math.PI * 2).toFixed(4)).toBe('1.8850');
    expect((1.9 * Math.PI * 2).toFixed(4)).toBe('11.9381');
    // profile 同源锚（材质字面量 = profile wind 组冻结值）
    expect(JUNIPERUS_SLOT0_PROFILE.wind.windTierAmplitude).toBe(0.022);
    expect(JUNIPERUS_SLOT0_PROFILE.wind.windTierFrequency).toBe(0.3);
    expect(JUNIPERUS_SLOT0_PROFILE.wind.windFringeAmplitude).toBe(0.018);
    expect(JUNIPERUS_SLOT0_PROFILE.wind.windFringeFrequency).toBe(1.9);
    expect(JUNIPERUS_SLOT0_PROFILE.wind.windLeaderAmplitude).toBe(0); // 顶梢零值消费占位（不消费第三例）
    // 主成分排位（tier 幅 > fringe——密实质量体主成分）+ family 快颤链 9–23 rad/s 内带（11.94）
    expect(0.022).toBeGreaterThan(0.018);
    expect(1.9 * Math.PI * 2).toBeGreaterThan(9);
    expect(1.9 * Math.PI * 2).toBeLessThan(23);
    expect(1.9).toBeLessThan(2.6); // 频率低于水杉羽状高频细颤（密质读向）
    expect(0.018).toBeLessThan(0.055); // 幅度小于水杉羽状软单元
  });

  it('整冠摆鳞卡/皮同公式（同串出现——皮不动叶动会撕裂穿帮）；树高锚 8（×0.12500 锚同步轮）', () => {
    const needle = assemble(track(createJuniperusNeedleMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createJuniperusBarkMaterial()), THREE.ShaderLib.physical);
    const tierCore = 'jnpWindH * jnpWindH * 0.022 * sin(uTime * 1.8850';
    expect(needle.vertexShader).toContain(tierCore);
    expect(bark.vertexShader).toContain(tierCore); // 同公式同相位
    // 树高锚：JUNIPERUS_TREE_HEIGHT_NOMINAL = 8（slot-0 totalHeight 同源——6–10m 同步轮）+ 1/8 注入
    expect(JUNIPERUS_TREE_HEIGHT_NOMINAL).toBe(8);
    expect(JUNIPERUS_TREE_HEIGHT_NOMINAL).toBe(JUNIPERUS_SLOT0_PROFILE.totalHeight); // 锚同步轮断言（profile 直采源）
    expect((1 / JUNIPERUS_TREE_HEIGHT_NOMINAL).toFixed(5)).toBe('0.12500');
    expect(needle.vertexShader).toContain('position.y * 0.12500');
    expect(bark.vertexShader).toContain('position.y * 0.12500');
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createJuniperusNeedleMaterial()), track(createJuniperusBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('三帧卡 SDF 与透光', () => {
  it('alphaTest 0.5 + alphaToCoverage；片元含 SDF 计算式并写入 alpha（三帧统一写入）', () => {
    const material = track(createJuniperusNeedleMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float jnpCardAlpha('); // 三帧 SDF 函数（单一来源生成器）
    expect(fragmentShader).toContain('jnpCardAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = jnpAlpha;'); // alphatest_fragment 上游写入
    expect(count(fragmentShader, 'diffuseColor.a = jnpAlpha;')).toBe(1);
  });

  it('三帧路由：绳卡 v∈[0,1) / 浆果卡 v∈[1,2) / 刺卡 v∈[2,3)——阈值 1.0/2.0（SDF 三工厂同串 + 果色层路由在皮材质 + 深度同 SDF）', () => {
    const leaf = assemble(track(createJuniperusNeedleMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('if (jnpUv.y < 1.0)'); // SDF 帧判据（绳卡）
    expect(leaf.fragmentShader).toContain('} else if (jnpUv.y < 2.0)'); // SDF 帧判据（浆果 → 刺卡）
    const bark = assemble(track(createJuniperusBarkMaterial()), THREE.ShaderLib.physical);
    expect(bark.fragmentShader).toContain('if (jnpUv.y < 1.0)'); // 皮材质注入同一 SDF 生成器（单一来源——皮/叶/深度三工厂同串）
    expect(bark.fragmentShader).toContain('if (vUv.y >= 1.0)'); // 色层浆果域（沿 metasequoia：器官卡入组 0——色层路由在皮材质）
    expect(bark.fragmentShader).toContain('diffuseColor.a = jnpAlpha;'); // 皮域恒 1 实心 / 浆果域圆端带
    expect(leaf.fragmentShader).not.toContain('if (vUv.y >= 1.0)'); // 叶材质零果色层（组 1 纯双叶帧）
    expect(leaf.fragmentShader).not.toContain('jnpConeM');
    const depth = assemble(track(createJuniperusNeedleDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).toContain('jnpUv.y < 1.0'); // 深度同路由（表面/影一致）
    expect(depth.fragmentShader).toContain('jnpUv.y < 2.0');
  });

  it('绳卡形态第 3 语言：对生行窗列（24 绳单元 High）+ 四列域 + 邻列半节距错位 + 奇偶行斜切 + 绳单元带 80% + 细杆包络 + 中轴渐细（JS 数值锚）', () => {
    const { fragmentShader } = assemble(track(createJuniperusNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('jnpP.y * 24.0 + jnpRand * 24.0'); // N = 24 绳单元（profile rosetteNeedles 24 High 基准 → 冻结单 24/14/8）
    expect(JUNIPERUS_SLOT0_PROFILE.rosetteNeedles).toBe(24); // profile 直采源锚
    expect(fragmentShader).toContain('float jnpRk = floor(clamp(jnpUv.x, 0.001, 0.999) * 4.0);'); // 四列域（鳞叶交互对生四列贴枝 10–30° s06 Verified——vs 水杉横向二列/雪松径向放射）
    expect(fragmentShader).toContain('jnpS += mod(jnpRk, 2.0) * 0.5 + jnpP.x * jnpDir * 0.30;'); // 邻列半节距错位（decussate stagger——绳股编织主载体）+ 奇偶行斜切
    expect(fragmentShader).toContain('float jnpDir = 1.0 - 2.0 * mod(jnpK, 2.0);'); // 奇偶行斜向交替
    // 导数感知亚像素退化门（T012.3 Step 4 第二轮·材质域 H1/H3——中距淡染修复）：
    // 近景可解析度 = max(节距门, 卡宽门)——任一向可读即原值（M25/M8 尺度域因斜置姿态重叠，单门不可分）
    expect(fragmentShader).toContain('float jnpPitchPx = 1.0 / max(fwidth(jnpP.y) * 24.0, 1e-4);'); // 节距 px = 卡长px/N = 1/(N·|∇v|)（High 24——含姿态透视缩并）
    expect(fragmentShader).toContain('float jnpRead = max(smoothstep(0.9, 1.3, jnpPitchPx), smoothstep(3.0, 12.0, 1.0 / max(fwidth(jnpP.x), 1e-4)));'); // 双门 max（阈值带压 M8 主体 pitch 1.4+ 之下——近景保护）
    expect(fragmentShader).toContain('float jnpDuty = mix(1.00, 0.80, jnpRead);'); // H1 带占放宽：亚像素 1.00 ↔ 可解析 0.80（原值）
    expect(fragmentShader).toContain('float jnpBand = min(jnpF, jnpDuty - jnpF);'); // 绳单元带（带占经门——可解析域带 80% + 绳隙 20% 原语义）
    expect(fragmentShader).toContain('float jnpAa = max(0.02, fwidth(jnpD) * (1.0 - jnpRead));'); // H3 AA 坡宽导数化（亚像素 ≈1px 覆盖 AA / 可解析恒 0.02 原值）
    expect(fragmentShader).toContain('float jnpSolidify(float jnpA0, float jnpRead0)'); // H3b 剪影厚度保持重映射（绳卡/刺卡共用——jnpRead 门控）
    expect(fragmentShader).toContain('jnpA = jnpSolidify(clamp(jnpD / jnpAa + 0.5, 0.0, 1.0), jnpRead);'); // 绳卡剪影重映射（同一 jnpRead 门）
    // 近景身份 JS 锚：可解析域（jnpRead=1）带占/坡宽/剪影 = 原值（第一轮 012.2 教训——绳列密度不稀释）
    expect(mixJs(1.0, 0.8, 1)).toBeCloseTo(0.8, 10); // duty → 0.80 原值（带 80% + 绳隙 20%）
    expect(mixJs(1.0, 0.8, 0)).toBe(1.0); // 亚像素域 → 1.00（绳隙→带色收敛——H1）
    expect(Math.max(0.02, 0.5 * (1 - 1))).toBe(0.02); // 可解析域坡宽 → 0.02 原值（fwidth 项乘 (1-1) 消去——近景逐位不动）
    expect(Math.max(0.02, 0.5 * (1 - 0))).toBeCloseTo(0.5, 10); // 亚像素域坡宽 = fwidth(d)（≈1px 覆盖 AA——H3 footprint 均值化）
    // H3b 剪影厚度保持 JS 锚：可解析域（jnpRead=1）→ mix 取原值（近景逐位不动）；亚像素域低尾裁除/高段饱和
    const remapJs = (alpha: number, read: number): number => Math.min(1, Math.max(0, (alpha + (1 - read) * 0.19 - 0.25) / 0.24));
    expect(mixJs(remapJs(0.6, 0), 0.6, 1)).toBe(0.6); // jnpRead=1 → 原值（重映射不消费）
    expect(remapJs(0.60, 0)).toBe(1); // 高段 → 1.0（A2C 4/4 全绿饱和——身份色 g-b 边距 ~11 需 ≥0.85 混合）
    expect(remapJs(0.17, 0)).toBeLessThan(0.5); // 亚像素低尾 → alphaTest 0.5 裁除（淡染尾清除）
    expect(fragmentShader).toContain('0.5 * sqrt(sin(3.14159 * clamp(jnpP.y, 0.005, 0.995))) * (0.82 + 0.18 * jnpP.y)'); // 细杆轮廓包络（半椭圆端帽 + 基部微收）
    expect(fragmentShader).toContain('float jnpRachis = mix(0.014, 0.007, jnpP.y) - abs(jnpP.x);'); // 中轴渐细条（近连续不断裂）
    expect(fragmentShader).toContain('float jnpD = max(min(jnpSil, jnpBand), jnpRachis);'); // (杆 ∩ 带) ∪ 中轴（合成距离——坡宽消费提取）
    // 密度不随卡尺度稀释 JS 锚（012.2 羽卡亚像素教训——012.3 任务书判定 4）：卡幅带
    // 0.18–0.30（profile rosetteCardMin/Span 族校准终值带直采）÷ N=24 → 绳节距 7.5–12.5mm
    const { rosetteCardMin, rosetteCardSpan, rosetteNeedles } = JUNIPERUS_SLOT0_PROFILE;
    expect(rosetteCardMin / rosetteNeedles).toBeGreaterThan(0.004); // 最小节距 > 4mm（近景可辨——非亚像素）
    expect((rosetteCardMin + rosetteCardSpan) / rosetteNeedles).toBeLessThan(0.02); // 最大节距 < 2cm（细密绳状——非粗条读向）
    expect(rosetteCardMin).toBeGreaterThanOrEqual(0.18); // 族密度先验带下界（三杠杆：卡尺度 ≥0.3m 带起步的 0.18–0.30 终值带）
  });

  it('刺卡帧（双叶型 minority——cedrus sin 单针机制直承）：指数 0.65 披针-钻形最宽 ≈0.35（JS 锚）+ 两条白粉带色层（帧门 + 双带位）', () => {
    const needle = assemble(track(createJuniperusNeedleMaterial()), THREE.ShaderLib.physical);
    const { fragmentShader } = needle;
    expect(fragmentShader).toContain('float jnpEnv = sin(3.14159 * pow(jnpNd, 0.65));'); // sin 单针包络（cedrus 机制直承；指数按叶形微调）
    expect(Math.pow(0.5, 1 / 0.65)).toBeGreaterThan(0.3); // 最宽中下段 ≈0.344（FRPS「披针形，先端渐尖」+ NC "awl" 折中——vs 雪松 1.55 最宽 0.60 上部较宽）
    expect(Math.pow(0.5, 1 / 0.65)).toBeLessThan(0.4);
    // 两条白粉带（刺叶上面气孔带 FRPS Verified——近景两调来源；帧门防绳卡误染）
    expect(fragmentShader).toContain('float jnpSpine = step(2.0, vUv.y);'); // v ≥ 2 刺卡帧门（双叶帧色层分化）
    expect(fragmentShader).toContain('abs(abs(vUv.x - 0.5) - 0.18)'); // 双带位 0.5±0.18（横贯刺叶上面的两条气孔带）
    expect(fragmentShader).toContain('jnpLight = mix(jnpLight, jnpLight * vec3(1.17, 1.19, 1.15), jnpSpine * jnpStoma * 0.55);'); // 白粉带提亮（帧门相乘——绳卡帧 jnpSpine=0 不作用）
    expect(fragmentShader).toContain('0.5 * jnpEnv - abs(jnpUv.x - 0.5)'); // 单针对称包络（cedrus 同式）
    expect(fragmentShader).toContain('float jnpSpineRead = smoothstep(1.2, 4.5, 1.0 / max(fwidth(jnpUv.x - 0.5), 1e-4));'); // 刺卡独立门（M25 宽 1.9–3.1px 淡染域 / M8 面向 3.6–10px 保护）
    expect(fragmentShader).toContain('jnpA = jnpSolidify(clamp((0.5 * jnpEnv - abs(jnpUv.x - 0.5)) / 0.02 + 0.5, 0.0, 1.0), jnpSpineRead);'); // 刺卡剪影厚度保持（H3b 共用重映射）
  });

  it('浆果帧轮廓：v 埧圆端带（u = 逐果熟度色档常量——双熟度分类走 u 域；交叉双卡承载体积读向）；横向结构负面断言锁弱化记档', () => {
    const bark = assemble(track(createJuniperusBarkMaterial()), THREE.ShaderLib.physical);
    expect(bark.fragmentShader).toContain('jnpAlpha = jnpCardAlpha(vUv, 0.0);'); // 器官轮廓 = 三帧生成器圆端带（单一来源；aLeafRand 恒 0 传常数）
    expect(bark.fragmentShader).toContain('clamp((0.5 - abs(jnpCb - 0.5)) / 0.08 + 0.5, 0.0, 1.0)'); // 圆端带（器官 AA 肩 0.08——mm 级器官口径）
    // 横向盘形裁切不可表达（u = 色档常量——几何侧果卡顶点 uv.x 同类全同值）：弱化记档（缺口候选②）——负面断言防回归
    expect(bark.fragmentShader).not.toContain('jnpCw');
    expect(bark.fragmentShader).not.toContain('jnpDisc');
    const depth = assemble(track(createJuniperusNeedleDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).toContain('0.5 - abs(jnpCb - 0.5)'); // 深度同串圆端带（单一来源——浆果卡 aLeafRand=0 走实心守卫）
  });

  it('深度材质（针影裁切）：同一 SDF + RGBADepthPacking + 组 0 守卫实心 + USE_UV + alphaTest；风动不进 depth；零噪声库注入', () => {
    const material = track(createJuniperusNeedleDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.depthPacking).toBe(THREE.RGBADepthPacking);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('jnpCardAlpha(vUv, vLeafRand)');
    expect(shader.fragmentShader).toContain('step(0.0001, vLeafRand)'); // 组 0 aLeafRand=0 → 实心（皮圆柱/浆果卡 uv 域不误裁）；叶卡非零 → 三帧裁切
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
    expect(count(shader.fragmentShader, 'facVnoise(')).toBe(0); // 零噪声库注入——SDF 零噪声引用（影 pass 不吃噪声）
    expect(shader.fragmentShader).not.toContain('facHash21'); // 噪声库整体未挂（SDF 引入噪声即编译暴雷——保护性约束）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫（组 1 双叶帧均透光——绳卡主导定档无域门）', () => {
    const { fragmentShader } = assemble(track(createJuniperusNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(fragmentShader).toContain('directionalLights[0]');
    expect(fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
  });
});

describe('物种配方锚定（Spec juniperus-reference 1.1 §5/§5.1/§5.2/§5.3/§风动——profile 导入值交叉锚）', () => {
  it('受光色差（构造中点式 ramp）：冠基 1.2 同源锚 + 端点 = shade/sun 对构造中点 sRGB 比值 × 0.65 软化（JS 锚——算术对称）', () => {
    const { fragmentShader } = assemble(track(createJuniperusNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float jnpExp = clamp((vTreePos.y - 1.2) / 3.5, 0.0, 1.0);'); // 冠基 1.2 = trunkHeightRatio 0.15 × 8 锚（slot-0 同源）
    expect(JUNIPERUS_SLOT0_PROFILE.trunkHeightRatio * JUNIPERUS_SLOT0_PROFILE.totalHeight).toBeCloseTo(1.2, 10); // 同源推导自证
    expect(fragmentShader).toContain('vec3 jnpLight = mix(vec3(0.766, 0.811, 0.789), vec3(1.234, 1.189, 1.211), jnpExp);'); // 荫深绿 ↔ 阳灰绿亮（Spec §5.1 阳面灰绿亮/阴面深绿暗 s02 双读一致）
    // 端点 JS 锚（cedrus 构造中点式）：mid = sun/shade 严格中点；端点 = 1 ∓ 0.65 × (1 − shade/mid) / 1 + 0.65 × (sun/mid − 1)
    const sun = JUNIPERUS_SLOT0_PROFILE.needleMaterial.needleColorSun;
    const shade = JUNIPERUS_SLOT0_PROFILE.needleMaterial.needleColorShade;
    const ch = (hex: number, shift: number): number => (hex >> shift) & 0xff;
    for (const shift of [16, 8, 0]) {
      const mid = (ch(sun, shift) + ch(shade, shift)) / 2;
      expect(1 - 0.65 * (1 - ch(shade, shift) / mid)).toBeGreaterThan(0.7);
      expect(1 - 0.65 * (1 - ch(shade, shift) / mid)).toBeLessThan(0.9);
      expect(1 + 0.65 * (ch(sun, shift) / mid - 1)).toBeGreaterThan(1.1);
      expect(1 + 0.65 * (ch(sun, shift) / mid - 1)).toBeLessThan(1.3);
    }
    // 算术对称自证（荫端 + 阳端 = 2.000 —— 暴露度 0.5 处 = 中点色 ×1.000）
    expect(0.766 + 1.234).toBeCloseTo(2.0, 3);
    expect(0.811 + 1.189).toBeCloseTo(2.0, 3);
    expect(0.789 + 1.211).toBeCloseTo(2.0, 3);
  });

  it('无两面色差（终审修正口径——同雪松、异水杉）：零 gl_FrontFacing + 零两面端点（负面断言）；深度 pass 同零', () => {
    const needle = assemble(track(createJuniperusNeedleMaterial()), THREE.ShaderLib.physical);
    expect(needle.fragmentShader).not.toContain('gl_FrontFacing'); // 无两面色差（vs 水杉 msqFaceMul 的反向分化——族内第三数据点）
    expect(needle.fragmentShader).not.toContain('jnpFace');
    const depth = assemble(track(createJuniperusNeedleDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).not.toContain('gl_FrontFacing'); // 深度 pass 只裁 alpha，无面色语义
    expect('needleFaceContrast' in JUNIPERUS_SLOT0_PROFILE.needleMaterial).toBe(false); // profile 省略即「无两面差」语义（契约零缺口消费）
  });

  it('白粉 0.15 弱档（整冠灰蓝霜调——cedrus 0.35 档等比弱化 JS 锚）+ 新梢黄绿 10% 卡（0.22 × 0.45）', () => {
    const { fragmentShader } = assemble(track(createJuniperusNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('mix(vec3(1.0), vec3(1.04, 1.03, 1.06), jnpExp * 0.15)'); // 白粉弱档（B > R > G 去饱和冷灰——深绿带灰蓝霜调 Observed s01–s04）
    expect(JUNIPERUS_SLOT0_PROFILE.needleMaterial.needleGlaucousBloom).toBe(0.15); // profile 直采源锚
    expect(1 + (0.15 / 0.35) * (1.10 - 1)).toBeCloseTo(1.043, 2); // cedrus 0.35 → (1.10,1.07,1.14) 的等比弱化自证
    expect(1 + (0.15 / 0.35) * (1.14 - 1)).toBeCloseTo(1.06, 2);
    expect(fragmentShader).toContain('step(fract(vLeafRand * 7.513 + 0.37), 0.10)'); // 新梢份额（needleJuvenility 0.22 × 新梢少数相 0.45 ≈ 0.099 → 0.10）
    expect(JUNIPERUS_SLOT0_PROFILE.needleMaterial.needleJuvenility * 0.45).toBeCloseTo(0.10, 2);
    expect(fragmentShader).toContain('vec3(1.12, 1.15, 0.95)'); // 新梢黄绿-灰绿（s08 鳞叶黄绿→深绿渐变直证）
  });

  it('深绿-暗绿基色 #4a5d47（= profile needleMaterial 严格中点 JS 锚）；糙度 0.64 蜡质鳞叶（family 链位）；糙度两面同值', () => {
    const needle = track(createJuniperusNeedleMaterial());
    const hex = needle.color.getHex();
    expect(hex).toBe(0x4a5d47); // 构造中点（暴露度 0.5 处即此色——cedrus 常绿单卡先例）
    const sun = JUNIPERUS_SLOT0_PROFILE.needleMaterial.needleColorSun;
    const shade = JUNIPERUS_SLOT0_PROFILE.needleMaterial.needleColorShade;
    expect(hex).toBe(((Math.round((((sun >> 16) & 0xff) + ((shade >> 16) & 0xff)) / 2) << 16)
      | (Math.round((((sun >> 8) & 0xff) + ((shade >> 8) & 0xff)) / 2) << 8)
      | Math.round((((sun >> 0) & 0xff) + ((shade >> 0) & 0xff)) / 2)) & 0xffffff); // = sun/shade 严格中点（profile 直采源锚）
    expect(sun).toBe(0x64785e); // profile 冻结值（灰绿亮端）
    expect(shade).toBe(0x2f4230); // profile 冻结值（深绿暗端）
    expect(needle.roughness).toBe(0.64); // 鳞叶硬质蜡质贴生（工程设定——family 链：樟 0.50 < 圆柏 0.64 < 雪松 0.66 < ginkgo 0.68 < 水杉 0.70）
    expect(needle.roughness).toBeGreaterThan(0.5);
    expect(needle.roughness).toBeLessThan(0.66); // < 雪松角质（蜡质鳞叶微泽）
    expect(needle.metalness).toBe(0);
  });

  it('背光透射（密质贴枝·低幅试探值 0.28）：家族链 水杉 0.46 > 雪松 0.38 > 圆柏——判定「透射低幅」；透射色深青绿向', () => {
    const { fragmentShader } = assemble(track(createJuniperusNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('* pow(jnpBack, 3.0) * jnpTransVar * jnpAlpha * 0.28;');
    expect(fragmentShader).toContain('vec3(0.42, 0.70, 0.48)'); // 深青绿（深绿-蓝绿灰蓝霜调冠透光读向——vs 水杉亮黄绿 (0.72,0.94,0.38)）
    expect(0.28).toBeLessThan(0.38); // < 雪松 0.38（角质硬针）——密质贴生厚鳞叶透光最弱
    expect(0.28).toBeGreaterThan(0.22); // > 樟 0.22（族内链非尾底）
    expect(fragmentShader).not.toContain('* 0.46;'); // 水杉峰值不串种
    expect(fragmentShader).not.toContain('* 0.38;'); // 雪松峰值不串种
  });

  it('浆果域双熟度双色（皮材质分支，冻结域 v∈[1,2)）：u ≥ 0.5 翌年霜熟 / u < 0.5 当年绿幼（cedrus 两类果机制 u 域承载）+ 线性端点 JS 锚 + coneClassRatio profile 锚', () => {
    const { fragmentShader } = assemble(track(createJuniperusBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float jnpMatC = step(0.5, vUv.x);'); // 熟度分类门（u 域阈值 0.5——冻结接口 3 先例名路线，零新增 attribute）
    expect(fragmentShader).toContain('vec3 jnpConeM = vec3(0.042, 0.044, 0.084) * (0.85 + 0.30 * jnpMg);'); // 暗蓝紫褐果体（coneColorMature）
    expect(fragmentShader).toContain('vec3 jnpConeY = vec3(0.110, 0.195, 0.065) * (0.88 + 0.24 * jnpYg);'); // 绿幼果（coneColorYoung）
    expect(fragmentShader).toContain('vec3 jnpCone = mix(jnpConeY, jnpConeM, jnpMatC);'); // 双熟度并存（判定 5——s08 同枝 green immature + frosted blue 直证）
    // 线性端点 JS 锚（sRGB→线性换算自证）
    const s2l = (c: number): number => Math.pow((c / 255 + 0.055) / 1.055, 2.4);
    const mature = JUNIPERUS_SLOT0_PROFILE.coneColorMature;
    const young = JUNIPERUS_SLOT0_PROFILE.coneColorYoung;
    expect(mature).toBe(0x3a3b52); // profile 冻结值
    expect(young).toBe(0x5d7a48);
    expect(s2l((mature >> 16) & 0xff)).toBeCloseTo(0.042, 2);
    expect(s2l((mature >> 8) & 0xff)).toBeCloseTo(0.044, 2);
    expect(s2l(mature & 0xff)).toBeCloseTo(0.084, 2);
    expect(s2l((young >> 16) & 0xff)).toBeCloseTo(0.110, 2);
    expect(s2l((young >> 8) & 0xff)).toBeCloseTo(0.195, 2);
    expect(s2l(young & 0xff)).toBeCloseTo(0.065, 2);
    expect(JUNIPERUS_SLOT0_PROFILE.coneClassRatio).toBe(0.75); // 霜熟果主导 0.75（几何 posHash 编码——账目归 3a，分类比例 profile 锚）
    expect(fragmentShader).toContain('1.0 - smoothstep(0.32, 0.50, abs(jnpCs - 0.5)) * 0.18'); // 两端收边暗（近球明暗读向）
  });

  it('果白粉霜层（身份特征——三档保留）：加性蓝灰覆层 + 霜量逐果浮动 + 蜡质果霜糙度定值 0.58/0.45', () => {
    const high = assemble(track(createJuniperusBarkMaterial()), THREE.ShaderLib.physical);
    expect(high.fragmentShader).toContain('jnpConeM = mix(jnpConeM, vec3(0.160, 0.180, 0.240), 0.22 + 0.24 * jnpMg);'); // 白粉霜覆层（「熟时暗褐色，被白粉」FRPS Verified + s07 霜蓝 15–20% Observed；霜量 0.22–0.46 随 u 档浮动）
    expect(high.fragmentShader).toContain('roughnessFactor = mix(0.58, 0.45, step(0.5, vUv.x));'); // 浆果帧糙度定值（绿幼果 0.58 / 霜熟果 0.45 蜡质果霜微泽）
    // 白霜层三档保留（中距霜蓝果点布冠 = Spec §7 中距身份信号——vs cedrus Mid 去未熟白粉的分化断言）
    for (const level of ['mid', 'low'] as const) {
      const shader = assemble(track(createJuniperusBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(shader.fragmentShader, `${level} 白霜层保留`).toContain('vec3(0.160, 0.180, 0.240)');
      expect(shader.fragmentShader, `${level} 双色并存保留`).toContain('vec3 jnpCone = mix(jnpConeY, jnpConeM, jnpMatC);');
      expect(shader.fragmentShader, `${level} 糙度定值保留`).toContain('mix(0.58, 0.45, step(0.5, vUv.x))');
    }
  });

  it('第 16 树皮（灰-灰褐纵长条片剥落）：深灰基 + 周向 24 × 纵向 72 段频率/管程条片网格 + 沟半宽 0.08+0.09×0.55（JS 锚）+ 三调色端点（JS 锚）+ R ≥ G ≥ B 灰-灰褐轴', () => {
    const bark = track(createJuniperusBarkMaterial());
    expect(bark.color.getHex()).toBe(0x595955); // barkBaseColor（FRPS「树皮深灰色，纵裂，成条片开裂」Verified [1]）
    expect(JUNIPERUS_SLOT0_PROFILE.bark.barkBaseColor).toBe(0x595955); // profile 直采源锚
    const { fragmentShader } = assemble(track(createJuniperusBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('vUv.x * 24.0 + jnpBarkWarp * 1.5'); // 周向 24 条片列（3c 校准回路）
    expect(fragmentShader).toContain('vUv.y * 72.0 + jnpBarkWarp * 0.6'); // 纵向 72 段频率/管程（v ∈ [0,0.92] 逐管归一契约假设——3a 合并对账面）
    expect(JUNIPERUS_SLOT0_PROFILE.totalHeight / (0.92 * 72)).toBeGreaterThan(0.08); // 主干段长 ≈0.121m ⊂ barkPlateMin/Span 0.08–0.16 近真域自证
    expect(JUNIPERUS_SLOT0_PROFILE.totalHeight / (0.92 * 72)).toBeLessThan(0.16);
    expect(JUNIPERUS_SLOT0_PROFILE.bark.barkPlateMin).toBe(0.08);
    expect(JUNIPERUS_SLOT0_PROFILE.bark.barkPlateSpan).toBe(0.08);
    expect(fragmentShader).toContain('float jnpGh = 0.08 + 0.09 * 0.55;'); // 沟半宽（barkGrooveDepth 0.55 中深端——第 15 语言公式直承）
    expect(JUNIPERUS_SLOT0_PROFILE.bark.barkGrooveDepth).toBe(0.55);
    const gh = 0.08 + 0.09 * 0.55;
    expect((1 - 2 * gh) / (2 * gh)).toBeGreaterThan(2.8); // 脊:沟 ≈ 2.86:1（中深端——脊相对宽于水杉深索 2.5:1）
    expect((1 - 2 * gh) / (2 * gh)).toBeLessThan(3.0);
    expect(fragmentShader).toContain('1.0 - smoothstep(jnpGh - 0.035, jnpGh + 0.035, jnpDe)'); // 陡壁剖面（±0.035 急变）
    expect(fragmentShader).toContain('vec3(0.616, 0.585, 0.555), jnpRidge, jnpPlateau'); // 沟 ↔ 脊
    expect(fragmentShader).toContain('vec3(1.0), vec3(1.244, 1.173, 1.091), smoothstep(0.26, 0.40, jnpDe)'); // 脊侧（基色）→ 脊顶风化灰褐
    // 色端 JS 锚：barkGrooveColor/barkPlateColor 对基色 sRGB 比值 × 0.90/0.70 观感软化
    const base = 0x595955, plate = JUNIPERUS_SLOT0_PROFILE.bark.barkPlateColor, groove = JUNIPERUS_SLOT0_PROFILE.bark.barkGrooveColor;
    expect(plate).toBe(0x786f60);
    expect(groove).toBe(0x33302b);
    expect(1 - 0.9 * (1 - ((groove >> 16) & 0xff) / ((base >> 16) & 0xff))).toBeCloseTo(0.616, 2);
    expect(1 - 0.9 * (1 - ((groove >> 8) & 0xff) / ((base >> 8) & 0xff))).toBeCloseTo(0.585, 2);
    expect(1 - 0.9 * (1 - ((groove >> 0) & 0xff) / ((base >> 0) & 0xff))).toBeCloseTo(0.555, 2);
    expect(1 + 0.7 * (((plate >> 16) & 0xff) / ((base >> 16) & 0xff) - 1)).toBeCloseTo(1.244, 2);
    expect(1 + 0.7 * (((plate >> 8) & 0xff) / ((base >> 8) & 0xff) - 1)).toBeCloseTo(1.173, 2);
    expect(1 + 0.7 * (((plate >> 0) & 0xff) / ((base >> 0) & 0xff) - 1)).toBeCloseTo(1.091, 2);
    // 第 16 语言色相区分锁：脊顶乘子 R ≥ G ≥ B（灰-灰褐轴——vs 水杉 B 最高 1.525 的红褐→灰褐轴反向）
    expect(1.244).toBeGreaterThan(1.173);
    expect(1.173).toBeGreaterThan(1.091);
  });

  it('皮域其余：长纤维翘边 + 断口沟高位衰减（枝皮灰长纤维门）+ 枝皮灰化 + 幼枝灰绿株内梯度 + 逐段深浅 + 纤维细纹（High）+ 干基暗化', () => {
    const { fragmentShader } = assemble(track(createJuniperusBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('sin(jnpBg.y * 47.0 + jnpStripH * 6.28318) * 0.05'); // 长纤维条翘边（缘区高频细须——第 15 机制直承）
    expect(fragmentShader).toContain('1.0 - jnpEdgeZone * 0.12'); // 翘边缘区微暗（High）
    expect(fragmentShader).toContain('jnpStripH * 7.31'); // 纵向段相位逐列错开（断口交错——「不规则」剥落）
    expect(fragmentShader).toContain('1.0 - jnpCross * (0.18 - jnpHi * 0.08)'); // 横向断口沟 + 高位衰减 ×0.18→0.10（条片连续变长 = 枝皮长纤维条剥读向——判定 6 增量）
    expect(fragmentShader).toContain('vec3(0.99, 1.04, 1.05), jnpHi * 0.55'); // 枝皮灰长纤维高位灰化（s04/s02 Observed）
    expect(fragmentShader).toContain('jnpHi = smoothstep(3.8, 6.2, vTreePos.y);'); // 枝皮门（冠区主枝带——8m 树高位域）
    expect(fragmentShader).toContain('vec3(0.95, 1.07, 0.92), jnpTwig * 0.50'); // 幼枝灰绿（株内梯度幼端——幼枝灰绿→干灰褐，判定 6）
    expect(fragmentShader).toContain('0.92 + 0.16 * jnpSegH'); // 逐段深浅（剥落代际明暗）
    expect(fragmentShader).toContain('jnpGrain = facVnoise(vec2(vUv.x * 36.0, vUv.y * 2.5)'); // 纤维细纹（周向高频 × 纵向拉伸——条片表面长纤维拉丝，High）
    expect(fragmentShader).toContain('jnpBarkMul *= 0.97 + 0.06 * jnpGrain;'); // 细纹合成（High）
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.5, 2.0, vTreePos.y)) * 0.35'); // 干基暗化弱档（家族惯例）
  });

  it('浆果帧糙度定值与皮域公式分流（皮材质二分支）；叶材质零器官定值', () => {
    const bark = assemble(track(createJuniperusBarkMaterial()), THREE.ShaderLib.physical);
    expect(bark.fragmentShader).toContain('clamp(0.92 + (1.0 - jnpPlateau) * 0.04 - jnpHi * 0.05'); // 皮域糙度公式（else 分支）
    const needle = assemble(track(createJuniperusNeedleMaterial()), THREE.ShaderLib.physical);
    expect(needle.fragmentShader).not.toContain('mix(0.58, 0.45'); // 叶材质零器官定值（组 1 纯双叶帧）
    expect(needle.fragmentShader).not.toContain('jnpPlateau'); // 皮域变量不进叶材质（域隔离）
  });
});

describe('分档实装（level 参数；缺省 high = 显式 high）', () => {

  it('三工厂缺省与显式 high 逐位一致（属性 + 键 + GLSL 全文）', () => {
    const pairs: Array<[THREE.Material, THREE.Material, { vertexShader: string; fragmentShader: string }]> = [
      [track(createJuniperusNeedleMaterial()), track(createJuniperusNeedleMaterial('high')), THREE.ShaderLib.physical],
      [track(createJuniperusBarkMaterial()), track(createJuniperusBarkMaterial('high')), THREE.ShaderLib.physical],
      [track(createJuniperusNeedleDepthMaterial()), track(createJuniperusNeedleDepthMaterial('high')), THREE.ShaderLib.depth],
    ];
    for (const [defaultMaterial, highMaterial, lib] of pairs) {
      expect(defaultMaterial).not.toBe(highMaterial); // 每次调用 new（D17）
      expect(defaultMaterial.customProgramCacheKey()).toBe(highMaterial.customProgramCacheKey());
      expect(propsOf(defaultMaterial)).toEqual(propsOf(highMaterial)); // 材质关键属性逐位一致
      const a = assemble(defaultMaterial, lib);
      const b = assemble(highMaterial, lib);
      expect(a.vertexShader).toBe(b.vertexShader); // GLSL 全文逐位一致
      expect(a.fragmentShader).toBe(b.fragmentShader);
    }
  });

  it('分档缓存键 3×3 = 9 键互不相同（配方变即键变——分档间不共享 program）', () => {
    const keys = new Set<string>();
    const expectKey = (material: THREE.Material, key: string): void => {
      expect(material.customProgramCacheKey()).toBe(key);
      keys.add(material.customProgramCacheKey());
    };
    expectKey(track(createJuniperusNeedleMaterial()), 'juniperus:needle+dither');
    expectKey(track(createJuniperusNeedleMaterial('mid')), 'juniperus:needle:mid+dither');
    expectKey(track(createJuniperusNeedleMaterial('low')), 'juniperus:needle:low+dither');
    expectKey(track(createJuniperusBarkMaterial()), 'juniperus:bark+dither');
    expectKey(track(createJuniperusBarkMaterial('mid')), 'juniperus:bark:mid+dither');
    expectKey(track(createJuniperusBarkMaterial('low')), 'juniperus:bark:low+dither');
    expectKey(track(createJuniperusNeedleDepthMaterial()), 'juniperus:needle-depth');
    expectKey(track(createJuniperusNeedleDepthMaterial('mid')), 'juniperus:needle-depth:mid');
    expectKey(track(createJuniperusNeedleDepthMaterial('low')), 'juniperus:needle-depth:low');
    expect(keys.size).toBe(9); // 9 键全异（juniperus 前缀不与族先例混缓存）
  });

  it('鳞卡 Mid：绳单元 14 + 去簇团噪声/糙度项（受光色差/白粉/新梢/刺带/透光/hue·luma 保留）', () => {
    const { fragmentShader } = assemble(track(createJuniperusNeedleMaterial('mid')), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('jnpP.y * 14.0'); // 绳单元 24→14（rosetteNeedles 分档递减）
    expect(fragmentShader).not.toContain('0.94 + 0.12 * jnpClump'); // 簇团乘子随段去
    expect(fragmentShader).not.toContain('(jnpClump - 0.5) * 0.05'); // 糙度注入随段去（High 才注入）
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0'); // 透光保留
    expect(fragmentShader).toContain('jnpTransVar');
    expect(fragmentShader).toContain('vec3 jnpLight'); // 受光色差保留
    expect(fragmentShader).toContain('float jnpSpine = step(2.0, vUv.y);'); // 刺卡帧门保留（双叶型档间连续）
    expect(fragmentShader).toContain('step(fract(vLeafRand * 7.513 + 0.37), 0.10)'); // 新梢保留
    expect(fragmentShader).toContain('vec3 jnpHue'); // hue·luma 逐卡变奏保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0 调用（簇团去采样——Mid 片元零噪声）
  });

  it('鳞卡 Low：绳单元 8 + 去透光/簇团；受光色差/白粉/刺带/hue·luma 保留；片元零噪声', () => {
    const { fragmentShader } = assemble(track(createJuniperusNeedleMaterial('low')), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('jnpP.y * 8.0'); // 绳单元 8（冻结单）
    for (const gone of ['jnpTransVar', 'vec3(0.42, 0.70, 0.48)', '0.94 + 0.12 * jnpClump']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(count(fragmentShader, '#include <opaque_fragment>')).toBe(1); // 透光不注入但锚点原句不动
    expect(fragmentShader).toContain('vec3 jnpLight'); // 受光色差保留（颜色层次档间连续保留面）
    expect(fragmentShader).toContain('vec3(1.04, 1.03, 1.06)'); // 白粉弱档保留
    expect(fragmentShader).toContain('vec3 jnpHue'); // hue·luma 保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(3); // 片元零噪声采样（库内 3 为死码，运行时零执行）
  });

  it('皮 Mid：去翘边微暗/纤维细纹（近景细节）；条片网格/三色剖面/断口高位衰减/段深浅/枝皮灰门/株内梯度保留；白霜层保留', () => {
    const { fragmentShader } = assemble(track(createJuniperusBarkMaterial('mid')), THREE.ShaderLib.physical);
    expect(fragmentShader).not.toContain('1.0 - jnpEdgeZone * 0.12'); // 翘边微暗随段去
    expect(fragmentShader).not.toContain('jnpGrain = facVnoise'); // 纤维细纹去采样（近景细节）
    expect(fragmentShader).toContain('vUv.x * 24.0'); // 条片网格保留
    expect(fragmentShader).toContain('1.0 - smoothstep(jnpGh - 0.035, jnpGh + 0.035, jnpDe)'); // 陡壁剖面保留
    expect(fragmentShader).toContain('0.92 + 0.16 * jnpSegH'); // 逐段深浅保留
    expect(fragmentShader).toContain('1.0 - jnpCross * (0.18 - jnpHi * 0.08)'); // 断口沟高位衰减保留
    expect(fragmentShader).toContain('vec3(0.99, 1.04, 1.05), jnpHi * 0.55'); // 枝皮灰门保留（冠区主枝中距读向）
    expect(fragmentShader).toContain('vec3(0.95, 1.07, 0.92), jnpTwig * 0.50'); // 幼枝灰绿保留
    expect(fragmentShader).toContain('vec3(0.160, 0.180, 0.240)'); // 白霜层保留（中距霜蓝果点身份——vs cedrus Mid 去白粉分化）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 游走 1 = 1× vnoise
  });

  it('皮 Low：再去逐段深浅/枝皮灰门/株内梯度/干基暗化（低调项）；条片三色剖面 + 断口剪影保留；白霜层保留', () => {
    const { fragmentShader } = assemble(track(createJuniperusBarkMaterial('low')), THREE.ShaderLib.physical);
    for (const gone of [
      '0.92 + 0.16 * jnpSegH',
      'vec3(0.99, 1.04, 1.05), jnpHi * 0.55',
      'vec3(0.95, 1.07, 0.92), jnpTwig * 0.50',
      '(1.0 - smoothstep(0.5, 2.0, vTreePos.y)) * 0.35',
      '1.0 - jnpEdgeZone * 0.12',
      'jnpGrain = facVnoise',
    ]) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('mix(vec3(0.616, 0.585, 0.555), jnpRidge, jnpPlateau)'); // 条片三色剖面剪影（远距「灰-灰褐纵长条片」保留面——第 16 语言剪影位）
    expect(fragmentShader).toContain('1.0 - jnpCross * 0.18'); // 断口沟保留（剥落段读向——高位衰减项随门去为固定深）
    expect(fragmentShader).toContain('vec3(0.160, 0.180, 0.240)'); // 白霜层保留（三档）
    expect(fragmentShader).toContain('jnpHi = smoothstep(3.8, 6.2, vTreePos.y);'); // 高位门计算保留（STRIPS 共享段——Low 不消费）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 游走 1 = 1× vnoise
  });

  it('深度 SDF 随档变体（24/14/8——绳单元数即 LOD 内容）：三档互异 + 档内表面/影同串（单一来源生成器）', () => {
    const high = assemble(track(createJuniperusNeedleDepthMaterial()), THREE.ShaderLib.depth);
    const mid = assemble(track(createJuniperusNeedleDepthMaterial('mid')), THREE.ShaderLib.depth);
    const low = assemble(track(createJuniperusNeedleDepthMaterial('low')), THREE.ShaderLib.depth);
    const highSdf = sdfOf(high.fragmentShader);
    const midSdf = sdfOf(mid.fragmentShader);
    const lowSdf = sdfOf(low.fragmentShader);
    expect(highSdf).toContain('24.0');
    expect(midSdf).toContain('14.0');
    expect(lowSdf).toContain('8.0');
    expect(new Set([highSdf, midSdf, lowSdf]).size).toBe(3); // 三档 SDF 互异（绳单元递减即 LOD 内容）
    expect(highSdf).not.toContain('facVnoise'); // SDF 零噪声引用（深度不挂噪声库的前提）
    // 导数门进深度 SDF（影裁切同步收敛——亚像素域表面绿增益与影一致；fwidth = ES 3.00 内建零扩展）
    for (const sdf of [highSdf, midSdf, lowSdf]) {
      expect(sdf).toContain('fwidth(jnpP.y)');
      expect(sdf).toContain('jnpDuty');
    }
    // 档内表面/影一致：叶表面各档 SDF === 深度各档 SDF（同一生成器输出）
    for (const level of ['high', 'mid', 'low'] as const) {
      const surface = assemble(track(createJuniperusNeedleMaterial(level)), THREE.ShaderLib.physical);
      const depthShader = assemble(track(createJuniperusNeedleDepthMaterial(level)), THREE.ShaderLib.depth);
      expect(sdfOf(surface.fragmentShader)).toBe(sdfOf(depthShader.fragmentShader)); // 同一 GLSL 字符串（单一来源纪律——shadow-visual-sop §1.4）
      expect(count(depthShader.fragmentShader, 'facVnoise(')).toBe(0); // 三档深度零噪声库
    }
  });

  it('风动三档同源：鳞卡/皮三档顶点 GLSL 全文一致（JUNIPERUS_WIND 同一常量——档间相位一致 = 身份一致）', () => {
    const needleHigh = assemble(track(createJuniperusNeedleMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createJuniperusBarkMaterial()), THREE.ShaderLib.physical);
    for (const level of ['mid', 'low'] as const) {
      const needle = assemble(track(createJuniperusNeedleMaterial(level)), THREE.ShaderLib.physical);
      const bark = assemble(track(createJuniperusBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(needle.vertexShader).toBe(needleHigh.vertexShader);
      expect(bark.vertexShader).toBe(barkHigh.vertexShader);
    }
  });

  it('分档底参契约不因档破：鳞卡三档 alphaTest/alphaToCoverage/DoubleSide/USE_UV/零贴图；皮三档 DoubleSide/器官裁切 alphaTest；深度 alphaTest', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const needle = track(createJuniperusNeedleMaterial(level));
      const bark = track(createJuniperusBarkMaterial(level));
      const depth = track(createJuniperusNeedleDepthMaterial(level));
      expect(needle.alphaTest).toBe(0.5);
      expect(needle.alphaToCoverage).toBe(true);
      expect(needle.side).toBe(THREE.DoubleSide);
      expect(needle.defines?.USE_UV).toBe('');
      expect(needle.map).toBeNull(); // 零贴图（D13）三档同守
      expect(bark.side).toBe(THREE.DoubleSide); // 浆果单面卡双面读向（皮域实心闭合不受影响）
      expect(bark.alphaTest).toBe(0.5); // 浆果卡圆端带裁切（皮域 alpha 恒 1 实心不裁）
      expect(bark.alphaToCoverage).toBe(true);
      expect(bark.defines?.USE_UV).toBe('');
      expect(depth.alphaTest).toBe(0.5);
      expect(depth.defines?.USE_UV).toBe('');
    }
  });

  it('uTime 桥接三档不缺位：材质级 uniforms.uTime 与编译后 shader.uniforms 同引用（Mid/Low）', () => {
    for (const make of [createJuniperusNeedleMaterial, createJuniperusBarkMaterial]) {
      for (const level of ['mid', 'low'] as const) {
        const material = track(make(level));
        const materialUTime = materialUniformsOf(material).uTime;
        expect(materialUTime).toBeDefined();
        const shader = assemble(material, THREE.ShaderLib.physical);
        expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      }
    }
  });
});

describe('program 键纪律与工厂所有权（D17）', () => {
  it('鳞卡/皮/深度三键互异；两次调用材质对象不同但键相同；uniforms 不跨实例共享', () => {
    const needleA = track(createJuniperusNeedleMaterial());
    const needleB = track(createJuniperusNeedleMaterial());
    const barkA = track(createJuniperusBarkMaterial());
    const barkB = track(createJuniperusBarkMaterial());
    const depth = track(createJuniperusNeedleDepthMaterial());
    expect(needleA).not.toBe(needleB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(needleA.customProgramCacheKey()).toBe(needleB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([needleA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
    expect(materialUniformsOf(needleA).uTime).not.toBe(materialUniformsOf(needleB).uTime); // uTime 桥接对象实例独立（dispose 安全）
    expect(materialUniformsOf(barkA).uTime).not.toBe(materialUniformsOf(barkB).uTime);
  });

  it('底参与侧向：鳞卡 DoubleSide/蜡质糙度/USE_UV；皮 DoubleSide（浆果卡双面读向）/高糙哑光/USE_UV；均零贴图；常绿单卡（无 preset 通道）', () => {
    const needle = track(createJuniperusNeedleMaterial());
    const bark = track(createJuniperusBarkMaterial());
    expect(needle.side).toBe(THREE.DoubleSide);
    expect(needle.metalness).toBe(0);
    expect(needle.roughness).toBeGreaterThan(0.6); // 蜡质鳞叶（0.64）
    expect(needle.roughness).toBeLessThan(0.7);
    expect(needle.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.DoubleSide); // 浆果单面卡交叉双卡双面读向（vs 雪松皮 FrontSide——实体球果网格无此需求）
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeGreaterThanOrEqual(0.9); // 纤维条片高糙哑光
    expect(bark.map).toBeNull();
    expect(needle.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
    // 常绿单卡（判定/预设 4：无季相证据不建卡——工厂签名无 preset 尾参，cedrus 同型；
    // 默认参使 Function.length = 0——断言 ≤1 即「至多 level 一参，无 preset 第二参」）
    expect(createJuniperusNeedleMaterial.length).toBeLessThanOrEqual(1);
    expect(track(createJuniperusNeedleMaterial('high')).color.getHex()).toBe(0x4a5d47); // 无卡路径唯一 = 默认卡（材质行为单卡）
  });
});

describe('成本记账（10 万实例每像素预算：鳞卡 High ≤9× / 皮 High ≤8×，hash21=1×/vnoise=3×）', () => {
  it('facVnoise 调用数：鳞卡 High 1 处（3×）/ Mid·Low 0 处、皮 High 2 处（6×）/ Mid·Low 1 处、深度 0 处（零噪声库注入）；顶点零噪声', () => {
    const needle = assemble(track(createJuniperusNeedleMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createJuniperusBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createJuniperusNeedleDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(needle.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（簇团斑块——绳列窗列 ALU 化免噪声）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（条片游走 + 纤维细纹）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(0); // 深度零噪声库注入（SDF 零噪声——影 pass 不吃噪声）
    expect(count(needle.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin（两成分）
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零循环/零纹理采样（绳列窗列直接求值——vs 水杉羽列固定 3 次三候选循环白名单的分化：第 3 语言无跨带长叶约束，单次求值即覆盖）', () => {
    const shaders = [
      assemble(track(createJuniperusNeedleMaterial()), THREE.ShaderLib.physical),
      assemble(track(createJuniperusBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createJuniperusNeedleDepthMaterial()), THREE.ShaderLib.depth),
    ];
    for (const shader of shaders) {
      for (const source of [shader.vertexShader, shader.fragmentShader]) {
        expect(source).not.toContain('for ('); // 零循环（绳列窗列横向带内直接求值——无水杉羽列跨带缺陷面）
        expect(source).not.toContain('while');
        expect(source).not.toContain('texture'); // 零贴图零采样（D13）
      }
    }
  });
});

describe('注入点缺失即抛（首次渲染前暴雷）', () => {
  it('片元 map_fragment 摘除 → 鳞卡/皮/深度均抛「注入点缺失」', () => {
    for (const make of [createJuniperusNeedleMaterial, createJuniperusBarkMaterial, createJuniperusNeedleDepthMaterial]) {
      const material = track(make());
      const lib = material instanceof THREE.MeshDepthMaterial ? THREE.ShaderLib.depth : THREE.ShaderLib.physical;
      expect(() =>
        material.onBeforeCompile(
          {
            vertexShader: lib.vertexShader,
            fragmentShader: lib.fragmentShader.replace('#include <map_fragment>', ''),
            uniforms: {},
          } as unknown as WebGLProgramParametersWithUniforms,
          {} as unknown as THREE.WebGLRenderer,
        ),
      ).toThrow(/注入点缺失/);
    }
  });

  it('顶点 begin_vertex / common 摘除 → 抛「注入点缺失」', () => {
    const needle = track(createJuniperusNeedleMaterial());
    expect(() =>
      needle.onBeforeCompile(
        {
          vertexShader: THREE.ShaderLib.physical.vertexShader.replace('#include <begin_vertex>', ''),
          fragmentShader: THREE.ShaderLib.physical.fragmentShader,
          uniforms: {},
        } as unknown as WebGLProgramParametersWithUniforms,
        {} as unknown as THREE.WebGLRenderer,
      ),
    ).toThrow(/注入点缺失/);

    const depth = track(createJuniperusNeedleDepthMaterial());
    expect(() =>
      depth.onBeforeCompile(
        {
          vertexShader: THREE.ShaderLib.depth.vertexShader.replace('#include <common>', ''),
          fragmentShader: THREE.ShaderLib.depth.fragmentShader,
          uniforms: {},
        } as unknown as WebGLProgramParametersWithUniforms,
        {} as unknown as THREE.WebGLRenderer,
      ),
    ).toThrow(/注入点缺失/);
  });

  it('片元 roughnessmap_fragment / opaque_fragment 摘除 → 抛「注入点缺失」', () => {
    const bark = track(createJuniperusBarkMaterial());
    expect(() =>
      bark.onBeforeCompile(
        {
          vertexShader: THREE.ShaderLib.physical.vertexShader,
          fragmentShader: THREE.ShaderLib.physical.fragmentShader.replace('#include <roughnessmap_fragment>', ''),
          uniforms: {},
        } as unknown as WebGLProgramParametersWithUniforms,
        {} as unknown as THREE.WebGLRenderer,
      ),
    ).toThrow(/注入点缺失/);

    const needle = track(createJuniperusNeedleMaterial()); // High 档含透光 + 糙度注入（两锚点均消费）
    expect(() =>
      needle.onBeforeCompile(
        {
          vertexShader: THREE.ShaderLib.physical.vertexShader,
          fragmentShader: THREE.ShaderLib.physical.fragmentShader.replace('#include <opaque_fragment>', ''),
          uniforms: {},
        } as unknown as WebGLProgramParametersWithUniforms,
        {} as unknown as THREE.WebGLRenderer,
      ),
    ).toThrow(/注入点缺失/);
  });
});

describe('结构完整性（include 全展开后配平差值不变）', () => {
  it('鳞卡/皮（physical）与深度（depth）注入后花括号配平差值与原版一致', () => {
    const pristinePhysicalFragment = braceDelta(expandIncludes(THREE.ShaderLib.physical.fragmentShader));
    const pristinePhysicalVertex = braceDelta(THREE.ShaderLib.physical.vertexShader);
    const pristineDepthFragment = braceDelta(expandIncludes(THREE.ShaderLib.depth.fragmentShader));
    const pristineDepthVertex = braceDelta(THREE.ShaderLib.depth.vertexShader);

    const needle = assemble(track(createJuniperusNeedleMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createJuniperusBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createJuniperusNeedleDepthMaterial()), THREE.ShaderLib.depth);
    for (const shader of [needle, bark]) {
      expect(braceDelta(expandIncludes(shader.fragmentShader))).toBe(pristinePhysicalFragment);
      expect(braceDelta(shader.vertexShader)).toBe(pristinePhysicalVertex);
    }
    expect(braceDelta(expandIncludes(depth.fragmentShader))).toBe(pristineDepthFragment);
    expect(braceDelta(depth.vertexShader)).toBe(pristineDepthVertex);
  });
});

describe('语言分化锁（第 3/15/16 叶皮语言不串种——跨资产前缀负面断言）', () => {
  it('圆柏全源零 ced/msq 标识符（资产私有复制改造——先例变量不泄漏进本资产 program）', () => {
    for (const material of [
      track(createJuniperusNeedleMaterial()),
      track(createJuniperusBarkMaterial()),
      track(createJuniperusNeedleDepthMaterial()),
    ]) {
      const lib = material instanceof THREE.MeshDepthMaterial ? THREE.ShaderLib.depth : THREE.ShaderLib.physical;
      const shader = assemble(material, lib);
      expect(shader.vertexShader + shader.fragmentShader).not.toContain('cedN');
      expect(shader.vertexShader + shader.fragmentShader).not.toContain('msq');
      expect(shader.vertexShader + shader.fragmentShader).not.toContain('cedPlateau');
    }
  });
});

describe('TimeUniformService 兼容（冻结风相位——固定机位取证纪律）', () => {
  it('冻结期间广播仍写当前值（uTime 常量——树静止）；材质对象兼容', () => {
    const clock = new TimeUniformService();
    clock.advance(0);
    clock.advance(500); // 0.5
    clock.freeze();
    clock.advance(2000); // 忽略
    const material = track(createJuniperusNeedleMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});
