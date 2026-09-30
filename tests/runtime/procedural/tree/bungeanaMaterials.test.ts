/**
 * tests/runtime/procedural/tree/bungeanaMaterials.test.ts —— 白皮松束卡/树皮/
 * 深度材质测试（T012.4 Step 3b，对称 juniperusMaterials.test.ts 范式：真实
 * THREE.ShaderLib 源组装，静态字符串断言，零 WebGL；build()/资产入口归并行几何
 * agent 的资产测试，此处不覆盖）。**针叶族（conifer）第四例材质测试——新增语义
 * 四者准入（D40）**：三针束卡 SDF 第 4 叶语言（螺旋束位行窗列 + 三针小扇）/
 * 导数感知亚像素退化门第三次消费（双域分治）/ 双态两年熟果（幼果主导反向档）/
 * 第 17 树皮语言（白基调多色斑驳薄片剥落）。
 *
 * 覆盖：
 * - uTime 接线（TimeUniformService 消费协议）：束卡/皮材质挂材质级 uniforms.uTime
 *   （own property）；onBeforeCompile 后 shader.uniforms.uTime 与材质级同对象引用；
 *   GLSL 声明 uniform float uTime；材质挂场景被服务逐帧驱动（frame 写值闭环）；
 * - 风动契约（D19.7 + 判定 9 **两成分**）：aSeed/aBend/aLeafRand 顶点 attribute
 *   声明存在；相位 = fract(sin(...)) 类 hash（aSeed=0 缺省属性路径退化为常数相位，
 *   全源零除 aSeed——无 NaN）；两成分在位（①整冠 0.30Hz×0.02m + ②末级枝/束高频
 *   小幅颤 2.4Hz×0.014m aBend 权重——**频 > 圆柏鳞枝 1.9Hz / 幅 < 其 0.018：硬针
 *   束惯量小读向**）+ **顶梢成分零在位**（直立刚硬无点头——族内可选·雪松消费位
 *   零占位第三例）；整冠摆束卡/皮同公式（同串出现——防撕裂）；**树高锚 11.5**
 *   （BUNGEANA_TREE_HEIGHT_NOMINAL = profile slot-0 totalHeight 同源 + 1/11.5 =
 *   0.08696 注入 + 锚同步轮断言——11–12m 域）；
 * - instanceColor 乘算链安全：注入后 <color_fragment> 原句恰一次、注入代码零 vColor
 *   介入；
 * - 双帧卡 SDF 与透光：alphaTest 0.5 + alphaToCoverage；片元含 bngCardAlpha 计算
 *   式与 alpha 写入；**双帧路由**（束卡 v∈[0,1) / 果卡 v∈[1,2)——阈值 1.0，SDF
 *   三工厂注入同串 + **果色层路由在皮材质**〔器官卡入组 0 沿族先例——束材质零果
 *   色层〕+ 深度同 SDF 路由）；**束卡形态第 4 语言**（螺旋束位行窗列 N = 束单元数
 *   分档 12/8/5 + 137.5° 叶序角横向游走 + 束位抖动 ±13% + 三针小扇〔中央直 + 两侧
 *   ±开展幅 0.085–0.135〕+ 边缘细锯齿载波 + 刷形 plateau 包络 + 末级枝段中轴渐细
 *   ——**束密度不随卡尺度稀释 JS 锚**〔012.2 教训：卡幅带 0.26–0.32 ÷ N 束间距
 *   ⊂ Spec 2–5cm 域〕）+ **导数感知亚像素退化门第三次消费**〔双域分治：域① 束
 *   节距 px = 1/(N·|∇v|) ∈ (0.9,1.3) 归带占收敛 0.84→1.00 / 域② 针划宽 px =
 *   0.084/|∇u| ∈ (1.2,4.5) 归扇填充收敛〔圆柏刺卡薄元素门带直承〕；min 合成
 *   AA 坡宽 max(0.02, fwidth(d)) + 剪影厚度保持 bngSolidify（H3b——低尾裁除/
 *   高段饱和/+0.19 补宽）；可解析域原值逐位不动；表面/深度同串——影裁切同步
 *   收敛〕；果卡帧轮廓 = v 埧圆端带；深度材质含同一 SDF 生成器输出（单一来源，
 *   **档内表面/影同串**）+ RGBADepthPacking + 组 0 守卫（aLeafRand=0 实心——果卡
 *   同守卫 → 影实心方卡剪影记档）+ USE_UV + alphaTest；透光项存在且
 *   NUM_DIR_LIGHTS 守卫；风动不进 depth pass；
 * - 物种配方锚定（Spec bungeana-reference **1.1** §针束机制/§5.1/§5.2/§5.3/§风动
 *   ——profile 导入值交叉锚，笔误防线）：**受光色差构造中点式 ramp**（冠基 3.45 =
 *   trunkHeightRatio 0.30 × 11.5 同源锚 JS + 端点 = needleColorShade/Sun 对构造
 *   中点 #606d47 的 sRGB 比值 × 0.65 软化 JS 锚——算术对称，暴露度 0.5 = 中点色）；
 *   **无两面色差**（族内第 4 数据点：零 gl_FrontFacing 负面断言——同雪松/圆柏
 *   「无差」轴、异水杉；深度 pass 同零）/ 微白粉 0.10 微档（cedrus 0.35 档等比
 *   弱化 JS 锚——谱系第四数据点）/ 新梢黄绿 9% 卡（0.20 × 0.45）/ 深绿-中绿基色
 *   #606d47（= profile needleMaterial 严格中点 JS 锚）/ 糙度 0.67 硬针角质
 *   （family 链位）/ **气孔线白线**（束坐标同式重算 + 针划可解析门同步）/ **透光
 *   中幅 0.42**（家族链 水杉 0.46 > 白皮松 > 雪松 0.38 > 圆柏——硬针疏散冠判定
 *   「透射中幅」）/ 透射色中绿偏黄绿；**双态果域（皮材质）**（u ≥ 0.5 二年生
 *   近熟淡绿-黄褐 / u < 0.5 一年生绿幼果主导 0.75〔幼果主导反向档 vs 圆柏熟果
 *   主导 0.75〕+ 线性端点 JS 锚 + 覆瓦鳞糙度 0.58/0.50 定值）；**第 17 树皮**
 *   （灰褐基 #6f675c + 代场 (7.0, 83.0) 物理各向同性〔v ∈ [0,0.92] 逐管归一契约
 *   假设——3a 合并对账面〕+ **乳白主导带全比值无软化 JS 锚**〔barkPlateColor
 *   0xd9d5c6 对基色——identity 白〕+ 近黑软化端点 JS 锚 + 淡黄绿新皮露斑色比 +
 *   边缘窄-中等过渡带〔0.12/0.08〕+ **株内「上白下深」大梯度**〔tone 高度偏移
 *   ——年龄皮色轴替代承载〕+ 薄片翘边亮斑缘 + 浅纵细纹弱浮雕 + 干基裂沟端 +
 *   barkGrooveDepth 0.18 族内最低档）；皮材质 DoubleSide + alphaTest 0.5（果单面
 *   卡双面读向 + 圆端带裁切——皮域 alpha 恒 1 实心）；
 * - 分档实装（level 参数，缺省 'high'）：三工厂缺省 ≡ 显式 'high'（属性 + 键 +
 *   GLSL 全文逐位相等）；3 工厂 × 3 档 = 9 键互异；束卡 Mid 束单元 8 + 去簇团/
 *   糙度项（受光/白粉/新梢/气孔线/透光保留）、Low 5 + 再去透光，片元零噪声；
 *   皮 Mid 去破碎场 fine/细纹、Low 再去株内梯度消费/新皮/亮缘/干基暗化（三色带
 *   拼贴保留——远距白干剪影保留面）；深度 SDF **随档变体**（12/8/5——档内表面/
 *   影一致）；风动三档顶点 GLSL 同源；分档底参契约不因档破；uTime 桥接三档不缺位；
 * - program 键纪律：束卡/皮/深度三键互异；两次工厂调用材质对象不同（无模块级共
 *   享，D17）但键相同；uniforms 不跨实例共享；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：束卡 High 片元
 *   facVnoise 1 处（簇团）、Mid/Low 0 处；皮 High 2 处（代场 + 破碎场）、Mid/
 *   Low 1 处；深度 0 处（零噪声库注入）；顶点零噪声；**全源零循环**（螺旋束位
 *   行窗列直接求值——沿圆柏无循环白名单）/零纹理采样；
 * - 注入点缺失即抛（map_fragment/begin_vertex/common/roughnessmap_fragment/
 *   opaque_fragment 摘除各暴雷）；
 * - 结构完整性：include 全展开后花括号配平差值与原版一致（注入不破坏 GLSL 结构）；
 * - TimeUniformService.freeze：冻结期间广播仍写当前值（uTime 常量——树静止）+
 *   材质兼容。
 * 边界：材质登记 afterEach 统一 dispose 兜底，不跨测试泄漏；雪松/水杉/圆柏/悬铃木
 *   语言不串种（ced/msq/jnp/plt 前缀负面断言——第 4/15/16/17 语言分化锁）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms } from 'three';
import { TimeUniformService } from '../../../../src/runtime/services/TimeUniformService';
import {
  createBungeanaBarkMaterial,
  createBungeanaMaterials,
  createBungeanaNeedleDepthMaterial,
  createBungeanaNeedleMaterial,
  BUNGEANA_TREE_HEIGHT_NOMINAL,
} from '../../../../src/runtime/procedural/tree/bungeana/bungeanaMaterials';
import { BUNGEANA_SLOT0_PROFILE } from '../../../../src/runtime/procedural/tree/bungeana/bungeanaShapeProfile';
import { assemble, braceDelta, count, createMaterialTracker, expandIncludes, materialUniformsOf, propsOf, sdfOf as extractSdf } from '../../../support/procedural-tree/materialHarness';

const { track, disposeAll } = createMaterialTracker();

/** 提取注入后的 bngCardAlpha 函数全文（SDF 单一来源比对用；首个 \n} 即函数闭合） */
const sdfOf = (fragmentShader: string): string =>
  extractSdf(fragmentShader, 'float bngCardAlpha(vec2 bngUv, float bngRand)');

/** GLSL mix 的 JS 同构（导数门端点 JS 锚用——可解析/亚像素两域行为自证） */
const mixJs = (a: number, b: number, t: number): number => a * (1 - t) + b * t;

afterEach(() => {
  disposeAll();
});

describe('uTime 接线（TimeUniformService 消费协议）', () => {
  it('束卡/皮材质挂材质级 uniforms.uTime；编译后 shader.uniforms.uTime 同引用；GLSL 声明 uniform', () => {
    for (const material of [track(createBungeanaNeedleMaterial()), track(createBungeanaBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('材质挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const needle = track(createBungeanaNeedleMaterial());
    const bark = track(createBungeanaBarkMaterial());
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

describe('风动契约（D19.7 + 判定 9：两成分——整冠慢摆 + 末级枝/束高频小幅颤；顶梢成分不消费）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）', () => {
    const needle = assemble(track(createBungeanaNeedleMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(needle.vertexShader).toContain(decl);
    }
    expect(needle.vertexShader).toContain('fract(sin(aSeed * 95.137 + 5.7)'); // 整树相位 = hash(aSeed)——常数与先例相位流（sway 77.669–111.413）去相关
    expect(needle.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 72.311 + 7.9)'); // 颤动相位 = hash(aSeed+卡身份)——个体 + 逐卡双相位差
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(needle.vertexShader + needle.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('两成分在位：整冠 0.30Hz×0.02 / 末级束颤 2.4Hz×0.014（aBend）；顶梢成分零在位；频率 = profile Hz × 2π JS 锚', () => {
    const needle = assemble(track(createBungeanaNeedleMaterial()), THREE.ShaderLib.physical);
    // 成分①：整冠低频慢摆（细长斜展枝整冠质量体；Spec §风动读向 Inferred）
    expect(needle.vertexShader).toContain('bngWindH * bngWindH * 0.02 * sin(uTime * 1.8850');
    // 成分②：末级枝/束高频小幅颤（频 > 圆柏鳞枝 1.9Hz / 幅 < 其 0.018——硬针束惯量小读向；aBend 权重，组 0 恒 0 免颤）
    expect(needle.vertexShader).toContain('aBend * 0.014 * sin(uTime * 15.0796');
    // 顶梢成分零在位（直立刚硬无点头——族内可选·雪松消费位零占位第三例〔水杉/圆柏/白皮松〕）
    expect(needle.vertexShader).not.toContain('bngLead');
    expect(count(needle.vertexShader, 'sin(uTime')).toBe(2); // 恰两成分
    // 频率 JS 锚：windTier/FringeFrequency (Hz) × 2π → rad/s 字面量（4 位小数一致）
    expect((0.3 * Math.PI * 2).toFixed(4)).toBe('1.8850');
    expect((2.4 * Math.PI * 2).toFixed(4)).toBe('15.0796');
    // profile 同源锚（材质字面量 = profile wind 组冻结值）
    expect(BUNGEANA_SLOT0_PROFILE.wind.windTierAmplitude).toBe(0.02);
    expect(BUNGEANA_SLOT0_PROFILE.wind.windTierFrequency).toBe(0.3);
    expect(BUNGEANA_SLOT0_PROFILE.wind.windFringeAmplitude).toBe(0.014);
    expect(BUNGEANA_SLOT0_PROFILE.wind.windFringeFrequency).toBe(2.4);
    expect(BUNGEANA_SLOT0_PROFILE.wind.windLeaderAmplitude).toBe(0); // 顶梢零值占位（不消费第三例）
    expect(BUNGEANA_SLOT0_PROFILE.wind.windLeaderFrequency).toBe(0);
    // 束颤读向 JS 锚：频率 > 圆柏鳞枝 1.9（硬针惯量小）⊂ family 快颤链 9–23 rad/s；幅度 < 圆柏 0.018 且 < 整冠主成分 0.02
    expect(2.4).toBeGreaterThan(1.9);
    expect(2.4 * Math.PI * 2).toBeGreaterThan(9);
    expect(2.4 * Math.PI * 2).toBeLessThan(23);
    expect(0.014).toBeLessThan(0.018);
    expect(0.014).toBeLessThan(0.02);
  });

  it('整冠摆束卡/皮同公式（同串出现——皮不动叶动会撕裂穿帮）；树高锚 11.5（×0.08696 锚同步轮）', () => {
    const needle = assemble(track(createBungeanaNeedleMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createBungeanaBarkMaterial()), THREE.ShaderLib.physical);
    const tierCore = 'bngWindH * bngWindH * 0.02 * sin(uTime * 1.8850';
    expect(needle.vertexShader).toContain(tierCore);
    expect(bark.vertexShader).toContain(tierCore); // 同公式同相位
    // 树高锚：BUNGEANA_TREE_HEIGHT_NOMINAL = 11.5（slot-0 totalHeight 同源——11–12m 同步轮）+ 1/11.5 注入
    expect(BUNGEANA_TREE_HEIGHT_NOMINAL).toBe(11.5);
    expect(BUNGEANA_TREE_HEIGHT_NOMINAL).toBe(BUNGEANA_SLOT0_PROFILE.totalHeight); // 锚同步轮断言（profile 直采源）
    expect((1 / BUNGEANA_TREE_HEIGHT_NOMINAL).toFixed(5)).toBe('0.08696');
    expect(needle.vertexShader).toContain('position.y * 0.08696');
    expect(bark.vertexShader).toContain('position.y * 0.08696');
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createBungeanaNeedleMaterial()), track(createBungeanaBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('双帧卡 SDF 与透光', () => {
  it('alphaTest 0.5 + alphaToCoverage；片元含 SDF 计算式并写入 alpha（双帧统一写入）', () => {
    const material = track(createBungeanaNeedleMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float bngCardAlpha('); // 双帧 SDF 函数（单一来源生成器）
    expect(fragmentShader).toContain('bngCardAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = bngAlpha;'); // alphatest_fragment 上游写入
    expect(count(fragmentShader, 'diffuseColor.a = bngAlpha;')).toBe(1);
  });

  it('双帧路由：束卡 v∈[0,1) / 果卡 v∈[1,2)——阈值 1.0（SDF 三工厂同串 + 果色层路由在皮材质 + 深度同 SDF）', () => {
    const leaf = assemble(track(createBungeanaNeedleMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('if (bngUv.y < 1.0)'); // SDF 帧判据（束卡）
    expect(leaf.fragmentShader).toContain('} else {'); // 双帧生成器（束卡 → 果卡）
    const bark = assemble(track(createBungeanaBarkMaterial()), THREE.ShaderLib.physical);
    expect(bark.fragmentShader).toContain('if (bngUv.y < 1.0)'); // 皮材质注入同一 SDF 生成器（单一来源——皮/束/深度三工厂同串）
    expect(bark.fragmentShader).toContain('if (vUv.y >= 1.0)'); // 色层果卡域（沿族先例：器官卡入组 0——色层路由在皮材质）
    expect(bark.fragmentShader).toContain('diffuseColor.a = bngAlpha;'); // 皮域恒 1 实心 / 果卡域圆端带
    expect(leaf.fragmentShader).not.toContain('if (vUv.y >= 1.0)'); // 束材质零果色层（组 1 纯束卡帧）
    expect(leaf.fragmentShader).not.toContain('bngConeM');
    const depth = assemble(track(createBungeanaNeedleDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).toContain('bngUv.y < 1.0'); // 深度同路由（表面/影一致）
    expect(depth.fragmentShader).not.toContain('bngUv.y < 2.0'); // 双帧（vs 圆柏三帧——束生单律无双叶帧）
  });

  it('束卡形态第 4 语言：螺旋束位行窗列（12 束单元 High）+ 137.5° 叶序游走 + 束位抖动 + 三针小扇 + 锯齿载波 + 刷形 plateau 包络 + 中轴渐细（JS 数值锚）', () => {
    const { fragmentShader } = assemble(track(createBungeanaNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('bngP.y * 12.0 + bngRand * 12.0'); // N = 12 束单元（profile rosetteNeedles 12 High 基准 → 冻结单 12/8/5）
    expect(BUNGEANA_SLOT0_PROFILE.rosetteNeedles).toBe(12); // profile 直采源锚
    expect(fragmentShader).toContain('float bngCw = 0.11 * cos(bngK * 2.3998 + bngRand * 6.28318);'); // 螺旋束位横向游走（137.5° phyllotaxis——束沿枝螺旋排列 s04/s05 Verified 的投影承载）
    expect(fragmentShader).toContain('bngS += (bngH - 0.5) * 0.26;'); // 束位抖动 ±13%（非机械规整）
    // 三针小扇（束内 3 针 V/扇形开展 15–45° s04/s05 Verified）：中央直 + 两侧 ±开展
    expect(fragmentShader).toContain('float bngSpread = 0.085 + 0.05 * fract(bngH * 7.313 + 0.31);'); // 开展幅逐束浮动
    expect(0.085 + 0.05 * 0).toBeGreaterThan(0.08); // 开展幅域下端（15° 端工程映射）
    expect(0.085 + 0.05 * 1).toBeLessThan(0.14); // 开展幅域上端（45° 端工程映射）
    expect(fragmentShader).toContain('float bngNs = bngWFill - min(abs(bngXr - bngSpread * bngFl), abs(bngXr + bngSpread * bngFl));'); // 两侧针并集（V 形开展）
    expect(fragmentShader).toContain('float bngNc = bngWFill - abs(bngXr);'); // 中央针（slope 0）
    expect(fragmentShader).toContain('float bngWBase = 0.042 * (1.0 - 0.42 * bngFl);'); // 针半宽（粗硬 + 先端尖收 42%）
    expect(fragmentShader).toContain('0.16 * sin(bngFl * 43.98 + bngH * 6.28318)'); // 边缘细锯齿载波（FRPS Verified——亚像素归退化门）
    expect(fragmentShader).toContain('pow(sin(3.14159 * clamp(bngP.y, 0.005, 0.995)), 0.42)'); // 刷形 plateau 包络（蓬松放射——vs 圆柏细杆绳列）
    expect(fragmentShader).toContain('float bngAxis = mix(0.016, 0.008, bngP.y) - abs(bngP.x);'); // 末级枝段中轴渐细条（近连续不断裂）
    expect(fragmentShader).toContain('float bngD = max(min(bngSil, bngTuft), bngAxis);'); // (刷形轮廓 ∩ 束并集) ∪ 枝轴（合成距离——坡宽消费提取）
    // 密度不随卡尺度稀释 JS 锚（012.2 羽卡亚像素教训——判定 3 明文近景身份保位）：
    // 卡幅带 0.26–0.32（profile rosetteCardMin/Span 族终值带 0.24–0.32 直采）÷ N=12 → 束节距 2.2–2.7cm ⊂ Spec 束间距 2–5cm（≈针长 1/3–1/2）
    const { rosetteCardMin, rosetteCardSpan, rosetteNeedles } = BUNGEANA_SLOT0_PROFILE;
    expect(rosetteCardMin / rosetteNeedles).toBeGreaterThan(0.02); // 最小束节距 > 2cm（Spec 域下端——近景可辨）
    expect((rosetteCardMin + rosetteCardSpan) / rosetteNeedles).toBeLessThan(0.05); // 最大束节距 < 5cm（Spec 域上端）
    expect(rosetteCardMin).toBeGreaterThanOrEqual(0.24); // 族密度先验带下界（012.3 几何轮终值带 0.24–0.32 直采起步）
  });

  it('导数感知亚像素退化门第三次消费（双域分治）：节距门归带占 / 针划门归扇填充 / min 合成 AA + 剪影补偿；可解析域原值逐位不动（JS 锚）', () => {
    const { fragmentShader } = assemble(track(createBungeanaNeedleMaterial()), THREE.ShaderLib.physical);
    // 域① 束节距 px = 1/(N·|∇v|)〔0.9,1.3〕（沿圆柏绳卡门带——行窗列同型）
    expect(fragmentShader).toContain('float bngPitchPx = 1.0 / max(fwidth(bngP.y) * 12.0, 1e-4);');
    expect(fragmentShader).toContain('float bngReadPitch = smoothstep(0.9, 1.3, bngPitchPx);');
    // 域② 针划宽 px = 2×针半宽/|∇u|〔1.2,4.5〕（圆柏刺卡薄元素门带直承——束卡薄元素针列同型）
    expect(fragmentShader).toContain('float bngStrokePx = 0.084 / max(fwidth(bngP.x), 1e-4);');
    expect(fragmentShader).toContain('float bngReadStroke = smoothstep(1.2, 4.5, bngStrokePx);');
    // 双域分治：带占收敛归节距门 / 扇填充收敛归针划门 / AA 与剪影补偿归 min 合成（vs 圆柏 max 合成的分化）
    expect(fragmentShader).toContain('float bngRead = min(bngReadPitch, bngReadStroke);');
    expect(fragmentShader).toContain('float bngDuty = mix(1.00, 0.84, bngReadPitch);'); // H1-带占：亚像素 1.00（束隙→束色收敛）↔ 可解析 0.84 原值
    expect(fragmentShader).toContain('float bngWFill = mix(bngSpread + bngWBase, bngW, bngReadStroke);'); // H1-束内：亚像素针划→扇并集填充收敛
    expect(fragmentShader).toContain('float bngAa = max(0.02, fwidth(bngD) * (1.0 - bngRead));'); // H3 AA 坡宽导数化（亚像素 ≈1px 覆盖 AA / 可解析恒 0.02 原值）
    expect(fragmentShader).toContain('float bngSolidify(float bngA0, float bngRead0)'); // H3b 剪影厚度保持重映射（min 合成门控）
    expect(fragmentShader).toContain('bngA = bngSolidify(clamp(bngD / bngAa + 0.5, 0.0, 1.0), bngRead);'); // 束卡剪影重映射
    // 近景身份 JS 锚：可解析域（read=1）带占/针宽/坡宽/剪影 = 原值逐位不动（012.2 教训——束列密度不稀释）
    expect(mixJs(1.0, 0.84, 1)).toBeCloseTo(0.84, 10); // duty → 0.84 原值（束带 84% + 束隙 16%）
    expect(mixJs(1.0, 0.84, 0)).toBe(1.0); // 亚像素域 → 1.00（束隙→束色收敛——H1）
    expect(mixJs(0.11 + 0.042, 0.042, 1)).toBeCloseTo(0.042, 10); // 针划宽 → 原值（开展中值扇下仍细针划）
    expect(mixJs(0.11 + 0.042, 0.042, 0)).toBeCloseTo(0.152, 10); // 亚像素域 → 扇并集填充（束单元实心化——M25 淡染对策）
    expect(Math.max(0.02, 0.5 * (1 - 1))).toBe(0.02); // 可解析域坡宽 → 0.02 原值（fwidth 项乘 (1-1) 消去——近景逐位不动）
    expect(Math.max(0.02, 0.5 * (1 - 0))).toBeCloseTo(0.5, 10); // 亚像素域坡宽 = fwidth(d)（≈1px 覆盖 AA——H3 footprint 均值化）
    // H3b 剪影厚度保持 JS 锚：可解析域（read=1）→ mix 取原值（近景逐位不动）；亚像素域低尾裁除/高段饱和
    const remapJs = (alpha: number, read: number): number => Math.min(1, Math.max(0, (alpha + (1 - read) * 0.19 - 0.25) / 0.24));
    expect(mixJs(remapJs(0.6, 0), 0.6, 1)).toBe(0.6); // read=1 → 原值（重映射不消费）
    expect(remapJs(0.60, 0)).toBe(1); // 高段 → 1.0（A2C 4/4 全绿饱和——身份色边距需 ≥0.85 混合）
    expect(remapJs(0.17, 0)).toBeLessThan(0.5); // 亚像素低尾 → alphaTest 0.5 裁除（淡染尾清除）
  });

  it('果卡帧轮廓：v 埧圆端带（u = 逐果态类色档常量——双态分类走 u 域；交叉双卡承载体积读向）', () => {
    const bark = assemble(track(createBungeanaBarkMaterial()), THREE.ShaderLib.physical);
    expect(bark.fragmentShader).toContain('bngAlpha = bngCardAlpha(vUv, 0.0);'); // 器官轮廓 = 双帧生成器圆端带（单一来源；aLeafRand 恒 0 传常数）
    expect(bark.fragmentShader).toContain('clamp((0.5 - abs(bngCb - 0.5)) / 0.08 + 0.5, 0.0, 1.0)'); // 圆端带（器官 AA 肩 0.08——mm–cm 级器官口径）
    const depth = assemble(track(createBungeanaNeedleDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).toContain('0.5 - abs(bngCb - 0.5)'); // 深度同串圆端带（单一来源——果卡 aLeafRand=0 走实心守卫）
  });

  it('深度材质（束影裁切）：同一 SDF + RGBADepthPacking + 组 0 守卫实心 + USE_UV + alphaTest；风动不进 depth；零噪声库注入', () => {
    const material = track(createBungeanaNeedleDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.depthPacking).toBe(THREE.RGBADepthPacking);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('bngCardAlpha(vUv, vLeafRand)');
    expect(shader.fragmentShader).toContain('step(0.0001, vLeafRand)'); // 组 0 aLeafRand=0 → 实心（皮圆柱/果卡 uv 域不误裁）；束卡非零 → 双帧裁切
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
    expect(count(shader.fragmentShader, 'facVnoise(')).toBe(0); // 零噪声库注入——SDF 零噪声引用（影 pass 不吃噪声）
    expect(shader.fragmentShader).not.toContain('facHash21'); // 噪声库整体未挂（SDF 引入噪声即编译暴雷——保护性约束）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫（组 1 束卡帧透光——无域门）', () => {
    const { fragmentShader } = assemble(track(createBungeanaNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(fragmentShader).toContain('directionalLights[0]');
    expect(fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
  });
});

describe('物种配方锚定（Spec bungeana-reference 1.1 §针束机制/§5.1/§5.2/§5.3/§风动——profile 导入值交叉锚）', () => {
  it('受光色差（构造中点式 ramp）：冠基 3.45 同源锚 + 端点 = shade/sun 对构造中点 sRGB 比值 × 0.65 软化（JS 锚——算术对称）', () => {
    const { fragmentShader } = assemble(track(createBungeanaNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float bngExp = clamp((vTreePos.y - 3.45) / 3.5, 0.0, 1.0);'); // 冠基 3.45 = trunkHeightRatio 0.30 × 11.5 锚（slot-0 同源）
    expect(BUNGEANA_SLOT0_PROFILE.trunkHeightRatio * BUNGEANA_SLOT0_PROFILE.totalHeight).toBeCloseTo(3.45, 10); // 同源推导自证
    expect(fragmentShader).toContain('vec3 bngLight = mix(vec3(0.844, 0.851, 0.918), vec3(1.156, 1.149, 1.073), bngExp);'); // 阴灰绿暗 ↔ 阳黄绿亮（Spec §5.2 受光色差主律 s04/s05 Observed）
    // 端点 JS 锚（cedrus 构造中点式）：mid = sun/shade 严格中点；端点 = 1 ∓ 0.65 × (1 − shade/mid) / 1 + 0.65 × (sun/mid − 1)
    const sun = BUNGEANA_SLOT0_PROFILE.needleMaterial.needleColorSun;
    const shade = BUNGEANA_SLOT0_PROFILE.needleMaterial.needleColorShade;
    const ch = (hex: number, shift: number): number => (hex >> shift) & 0xff;
    for (const shift of [16, 8, 0]) {
      const mid = (ch(sun, shift) + ch(shade, shift)) / 2;
      expect(1 - 0.65 * (1 - ch(shade, shift) / mid)).toBeGreaterThan(0.8);
      expect(1 - 0.65 * (1 - ch(shade, shift) / mid)).toBeLessThan(0.95);
      expect(1 + 0.65 * (ch(sun, shift) / mid - 1)).toBeGreaterThan(1.05);
      expect(1 + 0.65 * (ch(sun, shift) / mid - 1)).toBeLessThan(1.2);
    }
    // 算术对称自证（荫端 + 阳端 ≈ 2.000——暴露度 0.5 处 = 中点色 ×1.000）
    expect(0.844 + 1.156).toBeCloseTo(2.0, 3);
    expect(0.851 + 1.149).toBeCloseTo(2.0, 3);
    expect(0.918 + 1.073).toBeCloseTo(2.0, 1); // B 通道舍入差（1.991）——1 位容差
  });

  it('无两面色差（族内第 4 数据点——同雪松/圆柏「无差」轴、异水杉）：零 gl_FrontFacing + 零两面端点（负面断言）；深度 pass 同零', () => {
    const needle = assemble(track(createBungeanaNeedleMaterial()), THREE.ShaderLib.physical);
    expect(needle.fragmentShader).not.toContain('gl_FrontFacing'); // 无两面色差（判定 8——气孔线为两侧白线观感非块状两面差）
    expect(needle.fragmentShader).not.toContain('bngFace');
    const depth = assemble(track(createBungeanaNeedleDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).not.toContain('gl_FrontFacing'); // 深度 pass 只裁 alpha，无面色语义
    expect('needleFaceContrast' in BUNGEANA_SLOT0_PROFILE.needleMaterial).toBe(false); // profile 省略即「无两面差」语义（契约零缺口消费）
  });

  it('微白粉 0.10 微档（cedrus 0.35 档等比弱化 JS 锚——谱系第四数据点）+ 新梢黄绿 9% 卡（0.20 × 0.45）', () => {
    const { fragmentShader } = assemble(track(createBungeanaNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('mix(vec3(1.0), vec3(1.03, 1.02, 1.04), bngExp * 0.10)'); // 微白粉（B > R > G 去饱和冷灰——浅色细线 + 微白粉感 Observed s04/s05）
    expect(BUNGEANA_SLOT0_PROFILE.needleMaterial.needleGlaucousBloom).toBe(0.10); // profile 直采源锚（微档）
    expect(1 + (0.10 / 0.35) * (1.10 - 1)).toBeCloseTo(1.03, 2); // cedrus 0.35 → (1.10,1.07,1.14) 的等比弱化自证
    expect(1 + (0.10 / 0.35) * (1.14 - 1)).toBeCloseTo(1.04, 2);
    expect(fragmentShader).toContain('step(fract(vLeafRand * 7.513 + 0.37), 0.09)'); // 新梢份额（needleJuvenility 0.20 × 新梢少数相 0.45 ≈ 0.09）
    expect(BUNGEANA_SLOT0_PROFILE.needleMaterial.needleJuvenility * 0.45).toBeCloseTo(0.09, 2);
    expect(fragmentShader).toContain('vec3(1.12, 1.15, 0.95)'); // 新梢黄绿-灰绿（一年生小枝浅黄绿 Verified [1]+s04/s06）
  });

  it('深绿-中绿基色 #606d47（= profile needleMaterial 严格中点 JS 锚）；糙度 0.67 硬针角质（family 链位）；糙度两面同值', () => {
    const needle = track(createBungeanaNeedleMaterial());
    const hex = needle.color.getHex();
    expect(hex).toBe(0x606d47); // 构造中点（暴露度 0.5 处即此色——cedrus 常绿单卡先例）
    const sun = BUNGEANA_SLOT0_PROFILE.needleMaterial.needleColorSun;
    const shade = BUNGEANA_SLOT0_PROFILE.needleMaterial.needleColorShade;
    expect(hex).toBe(((Math.round((((sun >> 16) & 0xff) + ((shade >> 16) & 0xff)) / 2) << 16)
      | (Math.round((((sun >> 8) & 0xff) + ((shade >> 8) & 0xff)) / 2) << 8)
      | Math.round((((sun >> 0) & 0xff) + ((shade >> 0) & 0xff)) / 2)) & 0xffffff); // = sun/shade 严格中点（profile 直采源锚）
    expect(sun).toBe(0x77864f); // profile 冻结值（黄绿亮端）
    expect(shade).toBe(0x49543e); // profile 冻结值（灰绿暗端）
    expect(needle.roughness).toBe(0.67); // 硬针角质（工程设定——family 链：圆柏 0.64 < 雪松 0.66 < 白皮松 < ginkgo 0.68）
    expect(needle.roughness).toBeGreaterThan(0.66); // > 雪松角质（硬针微粗）
    expect(needle.roughness).toBeLessThan(0.68); // < ginkgo
    expect(needle.metalness).toBe(0);
  });

  it('背光透射（硬针疏散冠·中幅 0.42）：家族链 水杉 0.46 > 白皮松 > 雪松 0.38 > 圆柏 0.28——判定「透射中幅」；透射色中绿偏黄绿向', () => {
    const { fragmentShader } = assemble(track(createBungeanaNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('* pow(bngBack, 3.0) * bngTransVar * bngAlpha * 0.42;');
    expect(fragmentShader).toContain('vec3(0.54, 0.82, 0.42)'); // 中绿偏黄绿（深绿-中绿带黄绿/灰绿域冠透光读向——vs 水杉亮黄绿 (0.72,0.94,0.38) / 圆柏深青绿 (0.42,0.70,0.48)）
    expect(0.42).toBeLessThan(0.46); // < 水杉 0.46（软羽状高幅）——硬针厚质下调
    expect(0.42).toBeGreaterThan(0.38); // > 雪松 0.38（角质密簇）——疏散半透光结构逼近高档
    expect(0.38).toBeGreaterThan(0.28); // 家族链内序自证（雪松 > 圆柏）
    expect(fragmentShader).not.toContain('* 0.46;'); // 水杉峰值不串种
    expect(fragmentShader).not.toContain('* 0.38;'); // 雪松峰值不串种
  });

  it('气孔线白线（近景束卡微特征）：束坐标同式重算 + 针划可解析门同步（亚像素域白线归零）+ 中线窄带提亮', () => {
    const { fragmentShader } = assemble(track(createBungeanaNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float bngScD = min(abs(bngScX), min(abs(bngScX - bngScSp * bngScFl), abs(bngScX + bngScSp * bngScFl)));'); // 最近针划中线（与 SDF 三针同式）
    expect(fragmentShader).toContain('float bngScGate = smoothstep(1.2, 4.5, 0.084 / max(fwidth(vUv.x - 0.5), 1e-4));'); // 针划可解析门（与 SDF 域②同式——退化门色层同步第三次消费）
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.005, 0.013, bngScD)) * bngScGate * 0.50'); // 中线窄带提亮（门控相乘——亚像素域归零）
    expect(fragmentShader).toContain('vec3(1.13, 1.14, 1.10)'); // 白线提亮端点（「背腹两侧均有气孔线」FRPS Verified 的浅色细线观感）
  });

  it('双态果域双色（皮材质分支，冻结域 v∈[1,2)）：u ≥ 0.5 二年生近熟淡绿-黄褐 / u < 0.5 一年生绿幼果主导（幼果主导反向档）+ 线性端点 JS 锚 + coneClassRatio profile 锚', () => {
    const { fragmentShader } = assemble(track(createBungeanaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float bngMatC = step(0.5, vUv.x);'); // 态类分类门（u 域阈值 0.5——juniperus 先例名路线，零新增 attribute）
    expect(fragmentShader).toContain('vec3 bngConeY = vec3(0.109, 0.195, 0.058) * (0.88 + 0.24 * bngYg);'); // 一年生绿幼果（coneColorYoung——主导）
    expect(fragmentShader).toContain('vec3 bngConeM = vec3(0.361, 0.314, 0.102) * (0.88 + 0.24 * bngMg);'); // 二年生近熟淡绿-黄褐（coneColorMature）
    expect(fragmentShader).toContain('vec3 bngCone = mix(bngConeY, bngConeM, bngMatC);'); // 双态并存（判定 6——两年熟机制）
    // 线性端点 JS 锚（sRGB→线性换算自证）
    const s2l = (c: number): number => Math.pow((c / 255 + 0.055) / 1.055, 2.4);
    const mature = BUNGEANA_SLOT0_PROFILE.coneColorMature;
    const young = BUNGEANA_SLOT0_PROFILE.coneColorYoung;
    expect(mature).toBe(0xa2985a); // profile 冻结值（近熟淡绿-黄褐——「成熟前淡绿色，熟时淡黄褐色」FRPS Verified 半熟外推）
    expect(young).toBe(0x5d7a44); // profile 冻结值（绿幼果）
    expect(s2l((mature >> 16) & 0xff)).toBeCloseTo(0.361, 2);
    expect(s2l((mature >> 8) & 0xff)).toBeCloseTo(0.314, 2);
    expect(s2l(mature & 0xff)).toBeCloseTo(0.102, 2);
    expect(s2l((young >> 16) & 0xff)).toBeCloseTo(0.109, 2);
    expect(s2l((young >> 8) & 0xff)).toBeCloseTo(0.195, 2);
    expect(s2l(young & 0xff)).toBeCloseTo(0.058, 2);
    expect(BUNGEANA_SLOT0_PROFILE.coneClassRatio).toBe(0.25); // 幼果主导端（vs 圆柏熟果主导 0.75 反向档——判定 6「幼果主导」；几何 posHash 编码归 3a，分类比例 profile 锚）
    expect(fragmentShader).toContain('1.0 - smoothstep(0.32, 0.50, abs(bngCs - 0.5)) * 0.18'); // 两端收边暗（卵圆明暗读向）
    expect(fragmentShader).toContain('roughnessFactor = mix(0.58, 0.50, step(0.5, vUv.x));'); // 果卡糙度定值（绿幼果 0.58 / 近熟 0.50 覆瓦鳞哑光-半泽）
  });

  it('第 17 树皮（白基调多色斑驳薄片剥落）：灰褐基 + 代场 (7.0, 83.0) 物理各向同性 + 乳白主导带全比值无软化（JS 锚）+ 近黑软化端点（JS 锚）+ 淡黄绿新皮色比', () => {
    const bark = track(createBungeanaBarkMaterial());
    expect(bark.color.getHex()).toBe(0x6f675c); // barkBaseColor（灰褐/深灰褐次要色带 20–30% Observed s07/s08）
    expect(BUNGEANA_SLOT0_PROFILE.bark.barkBaseColor).toBe(0x6f675c); // profile 直采源锚
    const { fragmentShader } = assemble(track(createBungeanaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('facVnoise(vec2(vUv.x * 7.0, vUv.y * 83.0)'); // 代场（地图状大斑块——u 环绕/v 主管弧两向物理同尺度）
    // 物理各向同性 JS 锚：主管弧 ≈11.5m × v∈[0,0.92] / 76 斑 → ≈0.151m ⊂ barkPlateMin/Span 0.10–0.20 工程推断域
    expect(BUNGEANA_SLOT0_PROFILE.totalHeight / (0.92 * 83)).toBeGreaterThan(0.10);
    expect(BUNGEANA_SLOT0_PROFILE.totalHeight / (0.92 * 83)).toBeLessThan(0.20);
    expect(BUNGEANA_SLOT0_PROFILE.bark.barkPlateMin).toBe(0.10);
    expect(BUNGEANA_SLOT0_PROFILE.bark.barkPlateSpan).toBe(0.10);
    expect(BUNGEANA_SLOT0_PROFILE.bark.barkGrooveDepth).toBe(0.18); // 弱浮雕族内最低（vs 雪松 0.45 / 圆柏 0.55 / 水杉 0.68——「表面近光滑紧贴」Verified）
    // 白基调多色四带：乳白主导带全比值无软化（identity 白——远景白干第一识别特征）
    expect(fragmentShader).toContain('bngWhite = smoothstep(0.44, 0.56, bngTj);'); // 乳白主导带（中等过渡 0.12——Spec @1.1 终审槽间差异域中端；阈值中心 0.50 → ≈50% 份额 ⊂ 40–65% 域；纯赋值赋域变量）
    expect(0.44).toBeLessThan(0.5);
    expect(0.56).toBeGreaterThan(0.5); // 阈值带跨噪声均值 0.5 → 白带为多数带（白基调 identity）
    expect(fragmentShader).toContain('mix(bngBrown, vec3(1.955, 2.068, 2.152), bngWhite)'); // 乳白/灰白主导（barkPlateColor 0xd9d5c6 对基色全比值——无软化）
    const base = 0x6f675c, plate = BUNGEANA_SLOT0_PROFILE.bark.barkPlateColor, groove = BUNGEANA_SLOT0_PROFILE.bark.barkGrooveColor;
    expect(plate).toBe(0xd9d5c6); // profile 冻结值（乳白/灰白主导 40–65%——白基调 identity 色）
    expect(groove).toBe(0x342f29); // profile 冻结值（近黑 5–10%）
    expect(((plate >> 16) & 0xff) / ((base >> 16) & 0xff)).toBeCloseTo(1.955, 3); // 全比值自证（identity 白无观感软化——vs 族先例脊顶 0.70 软化的分化）
    expect(((plate >> 8) & 0xff) / ((base >> 8) & 0xff)).toBeCloseTo(2.068, 3);
    expect(((plate >> 0) & 0xff) / ((base >> 0) & 0xff)).toBeCloseTo(2.152, 3);
    // 近黑带软化端点 JS 锚：barkGrooveColor 对基色比值 × 0.90 软化
    expect(fragmentShader).toContain('mix(bngBarkMul, vec3(0.522, 0.511, 0.501), bngDark)'); // 近黑小斑/节疤
    expect(fragmentShader).toContain('bngDark = 1.0 - smoothstep(0.14, 0.22, bngTj);'); // 近黑带（窄过渡 0.08——Spec @1.1 终审槽间差异域窄端；阈值中心 0.18 → ≈8–12% ⊂ 5–10% 域上沿）
    expect(1 - 0.9 * (1 - ((groove >> 16) & 0xff) / ((base >> 16) & 0xff))).toBeCloseTo(0.522, 2);
    expect(1 - 0.9 * (1 - ((groove >> 8) & 0xff) / ((base >> 8) & 0xff))).toBeCloseTo(0.511, 2);
    expect(1 - 0.9 * (1 - ((groove >> 0) & 0xff) / ((base >> 0) & 0xff))).toBeCloseTo(0.501, 2);
    // 淡黄绿新皮露斑（FRPS「露出淡黄绿色的新皮」Verified——0xa6b078 工程映射对基色比值）
    expect(fragmentShader).toContain('mix(bngBarkMul, vec3(1.496, 1.709, 1.304), bngNew)'); // 新皮露斑（最新剥落代 ≈8%）
    expect(166 / 111).toBeCloseTo(1.496, 2); // 0xa6b078 = (166,176,120) 工程映射色比自证（R 通道 1.4955 三位舍入——2 位容差）
    expect(176 / 103).toBeCloseTo(1.709, 2);
    expect(120 / 92).toBeCloseTo(1.304, 2);
  });

  it('皮域其余：株内「上白下深」大梯度（tone 高度偏移）+ 薄片翘边亮斑缘 + 浅纵细纹弱浮雕 + 干基裂沟端 + 灰褐 fine 二级色变 + 糙度分流', () => {
    const { fragmentShader } = assemble(track(createBungeanaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float bngWhiteRamp = clamp((vTreePos.y - 1.5) / 6.5, 0.0, 1.0);'); // 高度 ramp 域（干基 → 上部主干/大枝带）
    expect(fragmentShader).toContain('float bngToneH = bngTone + mix(-0.10, 0.14, bngWhiteRamp);'); // 上白下深：干基白带收缩 -0.10 / 上部扩张 +0.14（s07 Verified 族内最强株内梯度——年龄皮色轴替代承载，Step 2 记档）
    expect(-0.10).toBeLessThan(0.14); // 梯度方向自证（下深上白）
    expect(fragmentShader).toContain('bngBarkMul *= 1.0 + bngRim * 0.14;'); // 薄片翘边亮斑缘（活跃剥落带——深浅交界处窄窗亮缘；vs platanus 代块缝深褐的分化）
    expect(fragmentShader).toContain('1.0 - abs(bngTj - 0.50) / 0.045'); // 亮缘窗（白↔灰褐交界）
    expect(fragmentShader).toContain('float bngStria = 0.5 + 0.5 * sin(vUv.x * 6.28318 * 60.0 + bngTone * 2.7);'); // 浅纵细纹（周向 60 列 + tone 扰曲——「近光滑紧贴 + 浅纵细纹」Verified）
    expect(fragmentShader).toContain('bngBarkMul *= 1.0 - bngStria * 0.045;'); // 细纹弱暗（barkGrooveDepth 0.18 族内最低的弱浮雕承载）
    expect(fragmentShader).toContain('float bngBase = 1.0 - smoothstep(0.6, 1.8, vTreePos.y);'); // 干基老皮带
    expect(fragmentShader).toContain('bngBarkMul *= 1.0 - bngBase * (0.10 + 0.10 * bngStria);'); // 干基暗化 + 裂沟加深（老树基部段浅纵裂——FRPS 老树皮段裂沟端）
    expect(fragmentShader).toContain('vec3 bngBrown = mix(vec3(0.85, 0.84, 0.82), vec3(1.0), smoothstep(0.35, 0.65, bngFine));'); // 灰褐 ↔ 深灰褐（fine 带内二级色变——次要色带）
    expect(fragmentShader).toContain('bngFine = facVnoise(vec2(vUv.x * 16.0, vUv.y * 190.0)'); // 破碎场（带内二级 + 细碎小斑 + 边缘扰曲——platanus 机制；纯赋值赋域变量）
    expect(fragmentShader).toContain('bngTj = bngToneH + (bngFine - 0.5) * 0.10;'); // 阈值扰曲（地图状曲折边）
    // 糙度分流：乳白斑光滑（白皮新露近光滑 identity 光泽）+ 近黑斑微糙；皮域公式在 else 分支
    expect(fragmentShader).toContain('clamp(0.84 - bngWhite * 0.10 + bngDark * 0.05, 0.05, 1.0)');
    const needle = assemble(track(createBungeanaNeedleMaterial()), THREE.ShaderLib.physical);
    expect(needle.fragmentShader).not.toContain('mix(0.58, 0.50'); // 束材质零器官定值（组 1 纯束卡帧）
    expect(needle.fragmentShader).not.toContain('bngWhite'); // 皮域变量不进束材质（域隔离）
  });
});

describe('分档实装（level 参数；缺省 high = 显式 high）', () => {

  it('三工厂缺省与显式 high 逐位一致（属性 + 键 + GLSL 全文）', () => {
    const pairs: Array<[THREE.Material, THREE.Material, { vertexShader: string; fragmentShader: string }]> = [
      [track(createBungeanaNeedleMaterial()), track(createBungeanaNeedleMaterial('high')), THREE.ShaderLib.physical],
      [track(createBungeanaBarkMaterial()), track(createBungeanaBarkMaterial('high')), THREE.ShaderLib.physical],
      [track(createBungeanaNeedleDepthMaterial()), track(createBungeanaNeedleDepthMaterial('high')), THREE.ShaderLib.depth],
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

  it('聚合导出 createBungeanaMaterials（冻结接口⑥）：三件套独立对象 + 各自档位键 + 每次调用 new', () => {
    const setHigh = createBungeanaMaterials();
    const setHigh2 = createBungeanaMaterials();
    track(setHigh.needle); track(setHigh.bark); track(setHigh.depth);
    track(setHigh2.needle); track(setHigh2.bark); track(setHigh2.depth);
    expect(setHigh.needle).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(setHigh.bark).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(setHigh.depth).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(setHigh.needle).not.toBe(setHigh2.needle); // 每次调用 new（D17——禁止模块级共享）
    expect(setHigh.bark).not.toBe(setHigh2.bark);
    expect(setHigh.depth).not.toBe(setHigh2.depth);
    expect(setHigh.needle.customProgramCacheKey()).toBe(track(createBungeanaNeedleMaterial()).customProgramCacheKey()); // 与单工厂同键同配方
    expect(setHigh.bark.customProgramCacheKey()).toBe(track(createBungeanaBarkMaterial()).customProgramCacheKey());
    expect(setHigh.depth.customProgramCacheKey()).toBe(track(createBungeanaNeedleDepthMaterial()).customProgramCacheKey());
    const setMid = createBungeanaMaterials('mid');
    track(setMid.needle); track(setMid.bark); track(setMid.depth);
    expect(setMid.needle.customProgramCacheKey()).toBe('bungeana:needle:mid+dither'); // level 透传三工厂
    expect(setMid.depth.customProgramCacheKey()).toBe('bungeana:needle-depth:mid');
  });

  it('分档缓存键 3×3 = 9 键互不相同（配方变即键变——分档间不共享 program）', () => {
    const keys = new Set<string>();
    const expectKey = (material: THREE.Material, key: string): void => {
      expect(material.customProgramCacheKey()).toBe(key);
      keys.add(material.customProgramCacheKey());
    };
    expectKey(track(createBungeanaNeedleMaterial()), 'bungeana:needle+dither');
    expectKey(track(createBungeanaNeedleMaterial('mid')), 'bungeana:needle:mid+dither');
    expectKey(track(createBungeanaNeedleMaterial('low')), 'bungeana:needle:low+dither');
    expectKey(track(createBungeanaBarkMaterial()), 'bungeana:bark+dither');
    expectKey(track(createBungeanaBarkMaterial('mid')), 'bungeana:bark:mid+dither');
    expectKey(track(createBungeanaBarkMaterial('low')), 'bungeana:bark:low+dither');
    expectKey(track(createBungeanaNeedleDepthMaterial()), 'bungeana:needle-depth');
    expectKey(track(createBungeanaNeedleDepthMaterial('mid')), 'bungeana:needle-depth:mid');
    expectKey(track(createBungeanaNeedleDepthMaterial('low')), 'bungeana:needle-depth:low');
    expect(keys.size).toBe(9); // 9 键全异（bungeana 前缀不与族先例混缓存）
  });

  it('束卡 Mid：束单元 8 + 去簇团噪声/糙度项（受光色差/白粉/新梢/气孔线/透光/hue·luma 保留）', () => {
    const { fragmentShader } = assemble(track(createBungeanaNeedleMaterial('mid')), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('bngP.y * 8.0'); // 束单元 12→8（rosetteNeedles 分档递减）
    expect(fragmentShader).toContain('bngScS = vUv.y * 8.0'); // 气孔线重算同源分档（HEAD level 函数）
    expect(fragmentShader).not.toContain('0.94 + 0.12 * bngClump'); // 簇团乘子随段去
    expect(fragmentShader).not.toContain('(bngClump - 0.5) * 0.05'); // 糙度注入随段去（High 才注入）
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0'); // 透光保留
    expect(fragmentShader).toContain('bngTransVar');
    expect(fragmentShader).toContain('vec3 bngLight'); // 受光色差保留
    expect(fragmentShader).toContain('float bngScGate'); // 气孔线白线保留（近景微特征）
    expect(fragmentShader).toContain('step(fract(vLeafRand * 7.513 + 0.37), 0.09)'); // 新梢保留
    expect(fragmentShader).toContain('vec3 bngHue'); // hue·luma 逐卡变奏保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0 调用（簇团去采样——Mid 片元零噪声）
  });

  it('束卡 Low：束单元 5 + 去透光/簇团；受光色差/白粉/气孔线/hue·luma 保留；片元零噪声', () => {
    const { fragmentShader } = assemble(track(createBungeanaNeedleMaterial('low')), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('bngP.y * 5.0'); // 束单元 5（冻结单）
    for (const gone of ['bngTransVar', 'vec3(0.54, 0.82, 0.42)', '0.94 + 0.12 * bngClump']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(count(fragmentShader, '#include <opaque_fragment>')).toBe(1); // 透光不注入但锚点原句不动
    expect(fragmentShader).toContain('vec3 bngLight'); // 受光色差保留（颜色层次档间连续保留面）
    expect(fragmentShader).toContain('vec3(1.03, 1.02, 1.04)'); // 微白粉保留
    expect(fragmentShader).toContain('float bngScGate'); // 气孔线保留（纯 ALU 零采样）
    expect(fragmentShader).toContain('vec3 bngHue'); // hue·luma 保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(3); // 片元零噪声采样（库内 3 为死码，运行时零执行）
  });

  it('皮 Mid：去破碎场 fine/细纹（近景细节）；三色带/株内梯度/新皮单门/直缘亮线/干基暗化保留', () => {
    const { fragmentShader } = assemble(track(createBungeanaBarkMaterial('mid')), THREE.ShaderLib.physical);
    expect(fragmentShader).not.toContain('bngFine = facVnoise'); // 破碎场去采样（近景细节）
    expect(fragmentShader).not.toContain('bngStria = 0.5 + 0.5 * sin'); // 浅纵细纹去（近景细节）
    expect(fragmentShader).not.toContain('(0.10 + 0.10 * bngStria)'); // 裂沟加深项随细纹去
    expect(fragmentShader).toContain('facVnoise(vec2(vUv.x * 7.0, vUv.y * 83.0)'); // 代场保留
    expect(fragmentShader).toContain('float bngToneH = bngTone + mix(-0.10, 0.14, bngWhiteRamp);'); // 株内梯度保留（中距「上白下深」身份读向）
    expect(fragmentShader).toContain('vec3(1.955, 2.068, 2.152)'); // 乳白主导带保留
    expect(fragmentShader).toContain('vec3(1.496, 1.709, 1.304)'); // 新皮露斑保留（tone 单门版）
    expect(fragmentShader).toContain('vec3(0.522, 0.511, 0.501)'); // 近黑带保留
    expect(fragmentShader).toContain('1.0 + bngRim * 0.14'); // 直缘亮线保留（活跃剥落带中距读向）
    expect(fragmentShader).toContain('smoothstep(0.6, 1.8, vTreePos.y)'); // 干基暗化保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 代场 1 = 1× vnoise
  });

  it('皮 Low：再去株内梯度消费/新皮/亮缘/干基暗化（低调项）；三色带拼贴保留（远距白干剪影保留面）；代场梯度计算段共享保留', () => {
    const { fragmentShader } = assemble(track(createBungeanaBarkMaterial('low')), THREE.ShaderLib.physical);
    for (const gone of [
      'vec3(1.496, 1.709, 1.304)', // 新皮露斑去
      '1.0 + bngRim * 0.14', // 亮缘去
      'bngFine = facVnoise', // 破碎场去
      'bngStria = 0.5 + 0.5 * sin', // 细纹去
      'smoothstep(0.6, 1.8, vTreePos.y)) * 0.10', // 干基暗化消费去（TONE 共享段的梯度计算保留）
    ]) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('float bngToneH = bngTone + mix(-0.10, 0.14, bngWhiteRamp);'); // TONE 共享段保留（Low 不消费——同圆柏 STRIPS 体例）
    expect(fragmentShader).toContain('vec3(1.955, 2.068, 2.152)'); // 乳白主导带保留（远距「白斑驳干剪影」Spec §7 远景保留面——白干第一识别的 Low 承载）
    expect(fragmentShader).toContain('vec3(0.522, 0.511, 0.501)'); // 近黑带保留（白斑驳对比剪影）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 代场 1 = 1× vnoise
  });

  it('深度 SDF 随档变体（12/8/5——束单元数即 LOD 内容）：三档互异 + 档内表面/影同串（单一来源生成器）', () => {
    const high = assemble(track(createBungeanaNeedleDepthMaterial()), THREE.ShaderLib.depth);
    const mid = assemble(track(createBungeanaNeedleDepthMaterial('mid')), THREE.ShaderLib.depth);
    const low = assemble(track(createBungeanaNeedleDepthMaterial('low')), THREE.ShaderLib.depth);
    const highSdf = sdfOf(high.fragmentShader);
    const midSdf = sdfOf(mid.fragmentShader);
    const lowSdf = sdfOf(low.fragmentShader);
    expect(highSdf).toContain('12.0');
    expect(midSdf).toContain('8.0');
    expect(lowSdf).toContain('5.0');
    expect(new Set([highSdf, midSdf, lowSdf]).size).toBe(3); // 三档 SDF 互异（束单元递减即 LOD 内容）
    expect(highSdf).not.toContain('facVnoise'); // SDF 零噪声引用（深度不挂噪声库的前提）
    // 导数门进深度 SDF（影裁切同步收敛——亚像素域表面绿增益与影一致；fwidth = ES 3.00 内建零扩展）
    for (const sdf of [highSdf, midSdf, lowSdf]) {
      expect(sdf).toContain('fwidth(bngP.y)');
      expect(sdf).toContain('bngWFill');
      expect(sdf).toContain('bngSolidify');
    }
    // 档内表面/影一致：束表面各档 SDF === 深度各档 SDF（同一生成器输出）
    for (const level of ['high', 'mid', 'low'] as const) {
      const surface = assemble(track(createBungeanaNeedleMaterial(level)), THREE.ShaderLib.physical);
      const depthShader = assemble(track(createBungeanaNeedleDepthMaterial(level)), THREE.ShaderLib.depth);
      expect(sdfOf(surface.fragmentShader)).toBe(sdfOf(depthShader.fragmentShader)); // 同一 GLSL 字符串（单一来源纪律——shadow-visual-sop §1.4）
      expect(count(depthShader.fragmentShader, 'facVnoise(')).toBe(0); // 三档深度零噪声库
    }
  });

  it('风动三档同源：束卡/皮三档顶点 GLSL 全文一致（BUNGEANA_WIND 同一常量——档间相位一致 = 身份一致）', () => {
    const needleHigh = assemble(track(createBungeanaNeedleMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createBungeanaBarkMaterial()), THREE.ShaderLib.physical);
    for (const level of ['mid', 'low'] as const) {
      const needle = assemble(track(createBungeanaNeedleMaterial(level)), THREE.ShaderLib.physical);
      const bark = assemble(track(createBungeanaBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(needle.vertexShader).toBe(needleHigh.vertexShader);
      expect(bark.vertexShader).toBe(barkHigh.vertexShader);
    }
  });

  it('分档底参契约不因档破：束卡三档 alphaTest/alphaToCoverage/DoubleSide/USE_UV/零贴图；皮三档 DoubleSide/器官裁切 alphaTest；深度 alphaTest', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const needle = track(createBungeanaNeedleMaterial(level));
      const bark = track(createBungeanaBarkMaterial(level));
      const depth = track(createBungeanaNeedleDepthMaterial(level));
      expect(needle.alphaTest).toBe(0.5);
      expect(needle.alphaToCoverage).toBe(true);
      expect(needle.side).toBe(THREE.DoubleSide);
      expect(needle.defines?.USE_UV).toBe('');
      expect(needle.map).toBeNull(); // 零贴图（D13）三档同守
      expect(bark.side).toBe(THREE.DoubleSide); // 果单面卡双面读向（皮域实心闭合不受影响）
      expect(bark.alphaTest).toBe(0.5); // 果卡圆端带裁切（皮域 alpha 恒 1 实心不裁）
      expect(bark.alphaToCoverage).toBe(true);
      expect(bark.defines?.USE_UV).toBe('');
      expect(depth.alphaTest).toBe(0.5);
      expect(depth.defines?.USE_UV).toBe('');
    }
  });

  it('uTime 桥接三档不缺位：材质级 uniforms.uTime 与编译后 shader.uniforms 同引用（Mid/Low）', () => {
    for (const make of [createBungeanaNeedleMaterial, createBungeanaBarkMaterial]) {
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
  it('束卡/皮/深度三键互异；两次调用材质对象不同但键相同；uniforms 不跨实例共享', () => {
    const needleA = track(createBungeanaNeedleMaterial());
    const needleB = track(createBungeanaNeedleMaterial());
    const barkA = track(createBungeanaBarkMaterial());
    const barkB = track(createBungeanaBarkMaterial());
    const depth = track(createBungeanaNeedleDepthMaterial());
    expect(needleA).not.toBe(needleB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(needleA.customProgramCacheKey()).toBe(needleB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([needleA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
    expect(materialUniformsOf(needleA).uTime).not.toBe(materialUniformsOf(needleB).uTime); // uTime 桥接对象实例独立（dispose 安全）
    expect(materialUniformsOf(barkA).uTime).not.toBe(materialUniformsOf(barkB).uTime);
  });

  it('底参与侧向：束卡 DoubleSide/硬针糙度/USE_UV；皮 DoubleSide（果卡双面读向）/近光滑微泽/USE_UV；均零贴图；常绿单卡（无 preset 通道）', () => {
    const needle = track(createBungeanaNeedleMaterial());
    const bark = track(createBungeanaBarkMaterial());
    expect(needle.side).toBe(THREE.DoubleSide);
    expect(needle.metalness).toBe(0);
    expect(needle.roughness).toBeGreaterThan(0.66); // 硬针角质（0.67）
    expect(needle.roughness).toBeLessThan(0.68);
    expect(needle.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.DoubleSide); // 果单面卡交叉双卡双面读向（vs 无器官单面卡资产的 FrontSide 皮）
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeGreaterThanOrEqual(0.8); // 近光滑微泽（0.84——「表面近光滑紧贴」）
    expect(bark.roughness).toBeLessThan(0.9);
    expect(bark.map).toBeNull();
    expect(needle.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
    // 常绿单卡（判定/预设 4：无季相证据不建卡——工厂签名无 preset 尾参，cedrus/juniperus 同型；
    // 默认参使 Function.length = 0——断言 ≤1 即「至多 level 一参，无 preset 第二参」）
    expect(createBungeanaNeedleMaterial.length).toBeLessThanOrEqual(1);
    expect(track(createBungeanaNeedleMaterial('high')).color.getHex()).toBe(0x606d47); // 无卡路径唯一 = 默认卡（材质行为单卡）
  });
});

describe('成本记账（10 万实例每像素预算：束卡 High ≤10× / 皮 High ≤8×，hash21=1×/vnoise=3×）', () => {
  it('facVnoise 调用数：束卡 High 1 处（3×）/ Mid·Low 0 处、皮 High 2 处（6×）/ Mid·Low 1 处、深度 0 处（零噪声库注入）；顶点零噪声', () => {
    const needle = assemble(track(createBungeanaNeedleMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createBungeanaBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createBungeanaNeedleDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(needle.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（簇团斑块——螺旋束位/三针扇/锯齿 ALU 化免噪声）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（代场 + 破碎场）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(0); // 深度零噪声库注入（SDF 零噪声——影 pass 不吃噪声）
    expect(count(needle.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin（两成分）
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零循环/零纹理采样（螺旋束位行窗列 + 三针小扇直接求值——沿圆柏无循环白名单：无跨带长叶约束，单次求值即覆盖）', () => {
    const shaders = [
      assemble(track(createBungeanaNeedleMaterial()), THREE.ShaderLib.physical),
      assemble(track(createBungeanaBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createBungeanaNeedleDepthMaterial()), THREE.ShaderLib.depth),
    ];
    for (const shader of shaders) {
      for (const source of [shader.vertexShader, shader.fragmentShader]) {
        expect(source).not.toContain('for ('); // 零循环（三针小扇 min/max 组合直接求值——无循环展开面）
        expect(source).not.toContain('while');
        expect(source).not.toContain('texture'); // 零贴图零采样（D13）
      }
    }
  });
});

describe('注入点缺失即抛（首次渲染前暴雷）', () => {
  it('片元 map_fragment 摘除 → 束卡/皮/深度均抛「注入点缺失」', () => {
    for (const make of [createBungeanaNeedleMaterial, createBungeanaBarkMaterial, createBungeanaNeedleDepthMaterial]) {
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
    const needle = track(createBungeanaNeedleMaterial());
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

    const depth = track(createBungeanaNeedleDepthMaterial());
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
    const bark = track(createBungeanaBarkMaterial());
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

    const needle = track(createBungeanaNeedleMaterial()); // High 档含透光 + 糙度注入（两锚点均消费）
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
  it('束卡/皮（physical）与深度（depth）注入后花括号配平差值与原版一致', () => {
    const pristinePhysicalFragment = braceDelta(expandIncludes(THREE.ShaderLib.physical.fragmentShader));
    const pristinePhysicalVertex = braceDelta(THREE.ShaderLib.physical.vertexShader);
    const pristineDepthFragment = braceDelta(expandIncludes(THREE.ShaderLib.depth.fragmentShader));
    const pristineDepthVertex = braceDelta(THREE.ShaderLib.depth.vertexShader);

    const needle = assemble(track(createBungeanaNeedleMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createBungeanaBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createBungeanaNeedleDepthMaterial()), THREE.ShaderLib.depth);
    for (const shader of [needle, bark]) {
      expect(braceDelta(expandIncludes(shader.fragmentShader))).toBe(pristinePhysicalFragment);
      expect(braceDelta(shader.vertexShader)).toBe(pristinePhysicalVertex);
    }
    expect(braceDelta(expandIncludes(depth.fragmentShader))).toBe(pristineDepthFragment);
    expect(braceDelta(depth.vertexShader)).toBe(pristineDepthVertex);
  });
});

describe('语言分化锁（第 4/15/16/17 叶皮语言不串种——跨资产前缀负面断言）', () => {
  it('白皮松全源零 ced/msq/jnp/plt 标识符（资产私有复制改造——先例变量不泄漏进本资产 program）', () => {
    for (const material of [
      track(createBungeanaNeedleMaterial()),
      track(createBungeanaBarkMaterial()),
      track(createBungeanaNeedleDepthMaterial()),
    ]) {
      const lib = material instanceof THREE.MeshDepthMaterial ? THREE.ShaderLib.depth : THREE.ShaderLib.physical;
      const shader = assemble(material, lib);
      expect(shader.vertexShader + shader.fragmentShader).not.toContain('cedN');
      expect(shader.vertexShader + shader.fragmentShader).not.toContain('msq');
      expect(shader.vertexShader + shader.fragmentShader).not.toContain('jnp');
      expect(shader.vertexShader + shader.fragmentShader).not.toContain('plt');
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
    const material = track(createBungeanaNeedleMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});
