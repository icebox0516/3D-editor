/**
 * tests/runtime/procedural/tree/cedrus/cedrusMaterials.test.ts —— 雪松针叶/树皮/深度
 * 材质测试（T012.1 Step 3b，对称 camphorMaterials.test.ts 范式：真实 THREE.ShaderLib
 * 源组装，静态字符串断言，零 WebGL；build()/资产入口归并行几何 agent 的资产测试，
 * 此处不覆盖）。**针叶族（conifer）首例材质测试**——新增语义五者准入（D40）：
 * 莲座簇 SDF 新形态语言 / 受光色差无两面差 / 鳞状树皮新语言位 / 球果域分流 /
 * 风动三成分 + 键分档 + 深度同源。
 *
 * 覆盖：
 * - uTime 接线（TimeUniformService 消费协议）：针/皮材质挂材质级 uniforms.uTime（own
 *   property）；onBeforeCompile 后 shader.uniforms.uTime 与材质级同对象引用；GLSL 声明
 *   uniform float uTime；材质挂场景被服务逐帧驱动（frame 写值闭环）；
 * - 风动契约（D19.7 + 判定 7 两层三成分）：aSeed/aBend/aLeafRand 顶点 attribute 声明
 *   存在；相位 = fract(sin(...)) 类 hash（aSeed=0 缺省属性路径退化为常数相位，全源零除
 *   aSeed——无 NaN）；三成分在位（①整层 0.35Hz×0.025m 高度权重² + ②针簇颤 2.4Hz×
 *   0.05m aBend 权重 + ③顶梢 0.9Hz×0.09m 上 1/4 门控）；整层缓摆针/皮同公式（同串
 *   出现——防撕裂）；**树高锚 16.5**（CEDRUS_TREE_HEIGHT_NOMINAL + 1/16.5 = 0.06061
 *   注入 + 锚同步轮断言）；
 * - instanceColor 乘算链安全：注入后 <color_fragment> 原句恰一次、注入代码零 vColor 介入；
 * - SDF 针形双帧与透光：alphaTest 0.5 + alphaToCoverage；片元含 cedNeedleAlpha 计算式
 *   与 alpha 写入；**莲座簇 v∈[2,3) / 散生单针 v∈[0,1) 双帧路由**（阈值 1.5）；莲座
 *   扇区窗列放射（针数分档 20/14/8 + 角位抖动 + 逐针长宽变奏 + 先端收窄 + 中心 hub
 *   实心 + atan NaN 守卫）；散生包络 v^1.55 最宽 v≈0.64 上部较宽（JS 数值锚）；
 *   深度材质（针影裁切）含同一 SDF 生成器输出（单一来源，**档内表面/影同串**）+
 *   RGBADepthPacking + 组 0 守卫（aLeafRand=0 实心）+ USE_UV + alphaTest；透光项存在
 *   且 NUM_DIR_LIGHTS 守卫；风动不进 depth pass；
 * - 物种配方锚定（Spec cedrus-reference 1.0 §4/§5/§7）：**受光色差无两面差**（暴露度
 *   ramp mix(荫×(0.696,0.750,0.706), 阳银灰蓝×(1.304,1.245,1.288))——端点 =
 *   needleColorShade/Sun 对构造中点 sRGB 比值 × 0.65 软化 JS 锚；**零 gl_FrontFacing /
 *   无 BACK 段**——针叶辐射着生语义）/ 白粉 0.35（气孔线工程映射）/ 幼叶 18% 卡域内
 *   变体 / 构造中点 #6b8273（= profile sun 0x9db3a6 + shade 0x39503f 严格中点 JS 锚；
 *   三处同源 swatch 已按此回写——meta/canopy/本测试锚）/ 糙度 0.66 无两面差 / 透光试探
 *   0.38（家族链 夏栎 0.65 > 雪松 > 银杏 0.34——判定 6 带试探）/ 透射色青绿 (0.60,
 *   0.92,0.46)；**鳞状树皮**（#555049 暗灰-灰褐基 + 砖错位网格 26×72 + 方↔长方两型 +
 *   沟半宽 0.10+0.25×0.45（barkGrooveDepth 浅-中端）+ 块顶×(1.348,1.360,1.340)/沟×
 *   (0.580,0.575,0.557) 端点 JS 锚 + 上部渐光滑 + 一年生小枝淡灰黄 + 干基暗化）；
 *   **球果域分流**（v≥7 宿存中轴 (0.332,0.254,0.162) / v∈[6,7) 幼果 (0.366,0.521,
 *   0.287) / v∈[5,6) 将熟四档量化 绿(0.340,0.480,0.240)→红褐(0.254,0.144,0.072)——
 *   profile hex sRGB→线性端点 JS 锚 + 未熟白粉 High；**球果区实心**（组 0 无 alphaTest、
 *   零 diffuseColor.a 写入——冻结接口）；
 * - 深度材质零噪声库注入（SDF 零 facVnoise 引用——inline sin-hash → 影 pass 不吃噪声）；
 * - 分档实装（level 参数，缺省 'high'）：三工厂缺省 ≡ 显式 'high'（属性 + 键 + GLSL
 *   全文逐位相等）；3 工厂 × 3 档 = 9 键互异；针 Mid 莲座 14 针 + 去簇团/糙度项（受光
 *   色差/白粉/幼叶/透光保留）、Low 8 针星点 + 再去透光、片元零噪声；皮 Mid 去块面
 *   细粒/未熟白粉、Low 再去每块深浅/小枝淡灰黄/干基暗化（鳞块沟剖面剪影保留）；
 *   深度 SDF **随档变体**（20/14/8——档内表面/影一致，vs 樟档位坍缩的分化点）；
 *   风动三档顶点 GLSL 同源；分档底参契约不因档破；uTime 桥接三档不缺位；
 * - program 键纪律：针/皮/深度三键互异；两次工厂调用材质对象不同（无模块级共享，
 *   D17）但键相同；uniforms 不跨实例共享；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：针 High 片元 facVnoise
 *   1 处（簇团）= 3×、Mid/Low 0 处；皮 High 2 处（游走 + 块面细粒）、Mid/Low 1 处；
 *   深度 0 处（零噪声库注入）；顶点零噪声；全源零循环/零纹理采样；
 * - 注入点缺失即抛（map_fragment/begin_vertex/common/roughnessmap_fragment/
 *   opaque_fragment 摘除各暴雷）；
 * - 结构完整性：include 全展开后花括号配平差值与原版一致（注入不破坏 GLSL 结构）；
 * - TimeUniformService.freeze：冻结期间广播仍写当前值（uTime 常量——树静止）+ 材质兼容。
 * 边界：材质登记 afterEach 统一 dispose 兜底，不跨测试泄漏。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms } from 'three';
import { TimeUniformService } from '../../../../src/runtime/services/TimeUniformService';
import {
  CEDRUS_TREE_HEIGHT_NOMINAL,
  createCedrusBarkMaterial,
  createCedrusNeedleDepthMaterial,
  createCedrusNeedleMaterial,
} from '../../../../src/runtime/procedural/tree/cedrus/cedrusMaterials';
import { assemble, braceDelta, count, createMaterialTracker, expandIncludes, materialUniformsOf, propsOf, sdfOf as extractSdf } from '../../../support/procedural-tree/materialHarness';

const { track, disposeAll } = createMaterialTracker();

/** 提取注入后的 cedNeedleAlpha 函数全文（SDF 单一来源比对用；首个 \n} 即函数闭合） */
const sdfOf = (fragmentShader: string): string =>
  extractSdf(fragmentShader, 'float cedNeedleAlpha(vec2 cedUv, float cedRand)');

afterEach(() => {
  disposeAll();
});

describe('uTime 接线（TimeUniformService 消费协议）', () => {
  it('针/皮材质挂材质级 uniforms.uTime；编译后 shader.uniforms.uTime 同引用；GLSL 声明 uniform', () => {
    for (const material of [track(createCedrusNeedleMaterial()), track(createCedrusBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('材质挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const needle = track(createCedrusNeedleMaterial());
    const bark = track(createCedrusBarkMaterial());
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

describe('风动契约（D19.7 + 判定 7：两层三成分；公式沿家族数值记档）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）', () => {
    const needle = assemble(track(createCedrusNeedleMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(needle.vertexShader).toContain(decl);
    }
    expect(needle.vertexShader).toContain('fract(sin(aSeed * 103.719'); // 整树相位 = hash(aSeed)——常数与 13 先例相位流去相关
    expect(needle.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 81.447'); // 颤动相位 = hash(aSeed+卡身份)
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(needle.vertexShader + needle.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('三成分在位：整层 0.35Hz×0.025 / 针簇颤 2.4Hz×0.05（aBend）/ 顶梢 0.9Hz×0.09（上 1/4 门控）；频率 = profile Hz × 2π JS 锚', () => {
    const needle = assemble(track(createCedrusNeedleMaterial()), THREE.ShaderLib.physical);
    // 成分①：整层低频慢摆（层状大枝 massive——Spec §4「整层小幅慢摆」Inferred）
    expect(needle.vertexShader).toContain('cedWindH * cedWindH * 0.025 * sin(uTime * 2.1991');
    // 成分②：层缘垂帘/针簇高频颤（末级细柔——aBend 权重，组 0 恒 0 免颤）
    expect(needle.vertexShader).toContain('aBend * 0.05 * sin(uTime * 15.0796');
    // 成分③：顶梢明显摆幅（上 1/4 渐尖区门控——顶梢专路下垂点头段动态面）
    expect(needle.vertexShader).toContain('cedLeadW * 0.09 * sin(uTime * 5.6549');
    expect(needle.vertexShader).toContain('float cedLeadW = smoothstep(0.70, 0.95, cedWindH);');
    // 频率 JS 锚：windTier/Fringe/LeaderFrequency (Hz) × 2π → rad/s 字面量（5 位内一致）
    expect((0.35 * Math.PI * 2).toFixed(4)).toBe('2.1991');
    expect((2.4 * Math.PI * 2).toFixed(4)).toBe('15.0796');
    expect((0.9 * Math.PI * 2).toFixed(4)).toBe('5.6549');
  });

  it('整层缓摆针/皮同公式（同串出现——皮不动叶动会撕裂穿帮）；树高锚 16.5（×0.06061 锚同步轮）', () => {
    const needle = assemble(track(createCedrusNeedleMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createCedrusBarkMaterial()), THREE.ShaderLib.physical);
    const swayCore = 'cedWindH * cedWindH * 0.025 * sin(uTime * 2.1991';
    const leaderCore = 'cedLeadW * 0.09 * sin(uTime * 5.6549';
    expect(needle.vertexShader).toContain(swayCore);
    expect(bark.vertexShader).toContain(swayCore); // 同公式同相位
    expect(needle.vertexShader).toContain(leaderCore);
    expect(bark.vertexShader).toContain(leaderCore); // 顶梢含干顶（皮组）——三成分皮叶同源
    // 树高锚：CEDRUS_TREE_HEIGHT_NOMINAL = 16.5（slot-0 totalHeight 同源）+ 1/16.5 注入
    expect(CEDRUS_TREE_HEIGHT_NOMINAL).toBe(16.5);
    expect((1 / CEDRUS_TREE_HEIGHT_NOMINAL).toFixed(5)).toBe('0.06061');
    expect(needle.vertexShader).toContain('position.y * 0.06061');
    expect(bark.vertexShader).toContain('position.y * 0.06061');
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createCedrusNeedleMaterial()), track(createCedrusBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('SDF 针形双帧与透光', () => {
  it('alphaTest 0.5 + alphaToCoverage；片元含 SDF 计算式并写入 alpha', () => {
    const material = track(createCedrusNeedleMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float cedNeedleAlpha('); // 针形 SDF 函数（单一来源生成器）
    expect(fragmentShader).toContain('cedNeedleAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = cedAlpha;'); // alphatest_fragment 上游写入
  });

  it('双帧路由：莲座簇卡 v∈[2,3)（阈值 1.5 + 卡内帧 v−2）↔ 散生单针卡 v∈[0,1)——材质侧契约声明', () => {
    const leaf = assemble(track(createCedrusNeedleMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('cedUv.y >= 1.5'); // 帧判据（0.5 隔离带沿家族域纪律）
    expect(leaf.fragmentShader).toContain('vec2(cedUv.x, cedUv.y - 2.0) - 0.5'); // 莲座卡内帧（中心 0.5,0.5 放射）
    expect(leaf.fragmentShader).toContain('pow(clamp(cedUv.y, 0.001, 0.999), 1.55)'); // 散生单针包络
    const depth = assemble(track(createCedrusNeedleDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).toContain('cedUv.y >= 1.5'); // 深度同路由（表面/影一致）
  });

  it('莲座扇区窗列放射：20 针（High）+ 角位抖动 + 逐针长宽变奏 + 先端收窄 + 中心 hub 实心 + atan NaN 守卫', () => {
    const { fragmentShader } = assemble(track(createCedrusNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('20.0 * 0.159155'); // N=20（profile rosetteNeedles High 基准）
    expect(fragmentShader).toContain('cedS += (cedH - 0.5) * 0.42;'); // 角位抖动 ±21% 扇区（近轮生非机械规整）
    expect(fragmentShader).toContain('float cedLen = 0.40 + 0.14 * (fract(cedH * 7.31) - 0.5);'); // 逐针长 0.33–0.47（外缘参差）
    expect(fragmentShader).toContain('float cedW = 0.030 + 0.008 * fract(cedH * 5.17);'); // 逐针半宽 0.030–0.038
    expect(fragmentShader).toContain('1.0 - 0.55 * smoothstep(0.55, 1.0, cedR / max(cedLen, 0.001))'); // 先端锐尖——向针尖收窄（除法守卫）
    expect(fragmentShader).toContain('0.075 - cedR'); // 中心 hub 实心（短枝顶芽——防中心裁穿）
    expect(fragmentShader).toContain('atan(cedP.y, cedP.x + 0.00001)'); // atan(0,0) NaN 守卫
    // 覆盖度 JS 锚：中半径 r=0.3 处针间留隙可辨（近轮生离散针——非实心盘）、近中心 r=0.1 汇聚实心（短枝顶读向）
    const spacingAt = (r: number): number => (Math.PI * 2 / 20) * r;
    expect(spacingAt(0.3)).toBeGreaterThan(0.076); // > 2×最大半宽 0.038 → 中半径针间可见间隙
    expect(spacingAt(0.1)).toBeLessThan(0.060); // < 2×最小半宽 0.030 → 近中心汇聚实心
  });

  it('散生单针包络：最宽 v≈0.64 上部较宽 + 先端锐尖下部渐窄（FRPS Verified——JS 数值锚 vs 家族偏基/倒卵分化）', () => {
    const widest = (p: number): number => Math.pow(0.5, 1 / p);
    expect(widest(1.55)).toBeGreaterThan(0.60); // 上部较宽（vs 朴树 0.40 偏基 / 夏栎 0.61 倒卵——上部更甚）
    expect(widest(1.55)).toBeLessThan(0.68);
  });

  it('深度材质（针影裁切）：同一 SDF + RGBADepthPacking + 组 0 守卫实心 + USE_UV + alphaTest；风动不进 depth；零噪声库注入', () => {
    const material = track(createCedrusNeedleDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.depthPacking).toBe(THREE.RGBADepthPacking);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('cedNeedleAlpha(vUv, vLeafRand)');
    expect(shader.fragmentShader).toContain('step(0.0001, vLeafRand)'); // 组 0 aLeafRand=0 → 实心（皮圆柱/球果 uv 域不误裁）
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
    expect(count(shader.fragmentShader, 'facVnoise(')).toBe(0); // 零噪声库注入——SDF 零噪声引用（影 pass 不吃噪声）
    expect(shader.fragmentShader).not.toContain('facHash21'); // 噪声库整体未挂（SDF 引入噪声即编译暴雷——保护性约束）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫（无平行光场景安全降级）', () => {
    const { fragmentShader } = assemble(track(createCedrusNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(fragmentShader).toContain('directionalLights[0]');
    expect(fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
  });
});

describe('物种配方锚定（Spec cedrus-reference 1.0 §4/§5/§7）', () => {
  it('受光色差（身份核心——crown-b 承重）：暴露度 ramp + 端点 = needleColorShade/Sun 对中点比值 × 0.65 软化（JS 锚）+ 冠基 4.1 同源锚', () => {
    const { fragmentShader } = assemble(track(createCedrusNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float cedExp = clamp((vTreePos.y - 4.1) / 5.0, 0.0, 1.0);'); // 冠基 4.1 = trunkHeightRatio 0.25 × 16.5 锚（slot-0 同源）
    expect(fragmentShader).toContain('vec3 cedLight = mix(vec3(0.696, 0.750, 0.706), vec3(1.304, 1.245, 1.288), cedExp);'); // 荫深绿 ↔ 阳银灰蓝
    // 端点 JS 锚：soften 0.65 下的 sun/shade 乘子（严格中点 ⇒ 两端互补对称——暴露度 0.5 处 = 中点色）
    const soften = (ratio: number): number => 1 + 0.65 * (ratio - 1);
    const sun = 0x9db3a6, shade = 0x39503f, mid = 0x6b8273;
    expect(soften(((sun >> 16) & 0xff) / ((mid >> 16) & 0xff))).toBeCloseTo(1.304, 2);
    expect(soften(((sun >> 8) & 0xff) / ((mid >> 8) & 0xff))).toBeCloseTo(1.245, 2);
    expect(soften(((sun >> 0) & 0xff) / ((mid >> 0) & 0xff))).toBeCloseTo(1.288, 2);
    const harden = (ratio: number): number => 1 - 0.65 * (1 - ratio);
    expect(harden(((shade >> 8) & 0xff) / ((mid >> 8) & 0xff))).toBeCloseTo(0.750, 2);
    expect(harden(((shade >> 0) & 0xff) / ((mid >> 0) & 0xff))).toBeCloseTo(0.706, 2);
  });

  it('无两面色差（针叶辐射着生——契约语义本身）：零 gl_FrontFacing / 无 BACK 段 / 两面糙度同值（vs 阔叶两面差语言分化）', () => {
    const { fragmentShader } = assemble(track(createCedrusNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).not.toContain('gl_FrontFacing'); // 无两面语义（WebGL2 内建双面判定不引入）
    expect(fragmentShader).not.toContain('float(gl_FrontFacing)'); // 色路零两面差
    const depth = assemble(track(createCedrusNeedleDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).not.toContain('gl_FrontFacing'); // 深度 pass 只裁 alpha，无面色语义
  });

  it('白粉 0.35（气孔线工程映射）+ 幼叶 18% 卡域内变体（needleJuvenility 0.40 × 新梢少数相 0.45）', () => {
    const { fragmentShader } = assemble(track(createCedrusNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('cedExp * 0.35'); // needleGlaucousBloom 强度（profile 冻结值）
    expect(fragmentShader).toContain('vec3(1.10, 1.07, 1.14)'); // 银灰粉（B ≥ R > G 去饱和冷灰）
    expect(fragmentShader).toContain('step(fract(vLeafRand * 7.317 + 0.41), 0.18)'); // 幼叶份额（0.40 × 0.45）
    expect(fragmentShader).toContain('vec3(1.15, 1.13, 1.18)'); // 幼叶淡绿银灰（FOC "initially pale green"）
  });

  it('构造中点 #6b8273 = profile sun/shade 严格中点（JS 锚；三处同源 swatch 已按此回写）；糙度 0.66 无两面差', () => {
    const needle = track(createCedrusNeedleMaterial());
    const hex = needle.color.getHex();
    expect(hex).toBe(0x6b8273); // 工程构造中点（暴露度 0.5 处即此色——受光色差 ramp 基点）
    const midCh = (a: number, b: number): number => Math.round((a + b) / 2);
    const sun = 0x9db3a6, shade = 0x39503f;
    expect((midCh((sun >> 16) & 0xff, (shade >> 16) & 0xff) << 16)
      | (midCh((sun >> 8) & 0xff, (shade >> 8) & 0xff) << 8)
      | midCh(sun & 0xff, shade & 0xff)).toBe(0x6b8273); // 严格中点推导自证
    expect(Math.abs(((hex >> 8) & 0xff) - ((0x6b8273 >> 8) & 0xff))).toBe(0); // vs 同源 swatch 精确锚（合并阶段回写 0x6b8a72→0x6b8273 后 ΔG=0——主代理授权机械同步）
    expect(needle.roughness).toBe(0.66); // 针形坚硬角质 + 白粉蜡质（工程设定——family 链樟 0.50 < 雪松 < ginkgo 0.68）
    expect(needle.metalness).toBe(0);
  });

  it('背光透射高（试探值 0.38）：家族链 夏栎 0.65 > 雪松 > 银杏 0.34；透射色青绿向（vs 阔叶黄绿向分化）', () => {
    const { fragmentShader } = assemble(track(createCedrusNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('* pow(cedBack, 3.0) * cedTransVar * cedAlpha * 0.38;');
    expect(fragmentShader).toContain('vec3(0.60, 0.92, 0.46)'); // 青绿基调（灰绿针透光非黄绿透明感——白粉角质读向）
    expect(0.38).toBeGreaterThan(0.34); // > 银杏 0.34（薄纸质）——细针高透
    expect(0.38).toBeLessThan(0.65); // < 夏栎 0.65——坚硬角质 + 蓝灰粉调不取顶级
    expect(fragmentShader).not.toContain('* 0.34;'); // 银杏峰值不串种
    expect(fragmentShader).not.toContain('* 0.65;'); // 夏栎峰值不串种
  });

  it('鳞状树皮（独立新语言位）：暗灰-灰褐基 + 砖错位网格 + 方↔长方两型 + 沟深 0.45 浅-中端剖面 + 块顶/沟色端点（JS 锚）', () => {
    const bark = track(createCedrusBarkMaterial());
    const hex = bark.color.getHex();
    expect(hex).toBe(0x555049); // barkBaseColor（Spec「深灰色，裂成不规则的鳞状块片」FRPS Verified）
    const { fragmentShader } = assemble(track(createCedrusBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('vUv.x * 26.0 + cedWarp * 1.4'); // 周向 26 格（≈6cm @干周 1.6m 假设——3c 校准回路）
    expect(fragmentShader).toContain('vUv.y * 72.0 + cedWarp * 0.8'); // 纵向（v 压缩 [0,4) 契约假设）
    expect(fragmentShader).toContain('cedG.x += mod(floor(cedG.y), 2.0) * 0.5;'); // 奇偶行砖缝错位（防整齐阵列读向）
    expect(fragmentShader).toContain('mix(vec2(1.0, 0.70), vec2(0.70, 1.0)'); // 方 ↔ 长方两型（「3–8cm 方-长方形」bark-a Verified）
    expect(fragmentShader).toContain('1.0 - smoothstep(0.2275, 0.2875, cedGd)'); // 沟半宽 0.10 + 0.25 × barkGrooveDepth 0.45 + 0.06 过渡
    expect(0.10 + 0.25 * 0.45 + 0.06).toBeCloseTo(0.5 - 0.2275, 4); // 剖面阈值自证（沟深强度消费）
    expect(fragmentShader).toContain('vec3(0.580, 0.575, 0.557), vec3(1.348, 1.360, 1.340), cedPlateau'); // 沟近黑 ↔ 块顶浅灰褐
    // 色端 JS 锚：barkGrooveColor/barkPlateColor 对基色 sRGB 比值 × 观感软化 0.85/0.80
    const base = 0x555049, plate = 0x7a7468, groove = 0x2b2823;
    expect(1 + 0.80 * (((plate >> 16) & 0xff) / ((base >> 16) & 0xff) - 1)).toBeCloseTo(1.348, 2);
    expect(1 - 0.85 * (1 - ((groove >> 16) & 0xff) / ((base >> 16) & 0xff))).toBeCloseTo(0.580, 2);
    expect(1 - 0.85 * (1 - ((groove >> 8) & 0xff) / ((base >> 8) & 0xff))).toBeCloseTo(0.575, 2);
    expect(1 - 0.85 * (1 - ((groove >> 0) & 0xff) / ((base >> 0) & 0xff))).toBeCloseTo(0.557, 2);
    expect(fragmentShader).not.toContain('cmpBarkRidge'); // 阔叶脊沟语言不串种（新语言位）
  });

  it('皮域其余：每块深浅 + 上部渐光滑（幼树光滑渐开裂株内梯度）+ 一年生小枝淡灰黄 + 干基暗化', () => {
    const { fragmentShader } = assemble(track(createCedrusBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('0.92 + 0.16 * cedGR'); // 每块深浅（hash 单色变奏）
    expect(fragmentShader).toContain('cedSmoothUp = smoothstep(6.0, 10.0, vTreePos.y);'); // 上部渐光滑（TSO/NC 株内梯度映射）
    expect(fragmentShader).toContain('vec3(1.16, 1.12, 0.90)'); // 一年生小枝淡灰黄（FRPS「淡灰黄色…微有白粉」Verified）
    expect(fragmentShader).toContain('smoothstep(9.0, 11.5, vTreePos.y) * (1.0 - smoothstep(0.45, 0.95, vUv.y))'); // 高位 × 小弧长双门控
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.6, 2.4, vTreePos.y)) * 0.35'); // 干基暗化弱档（家族惯例）
  });

  it('球果域分流（冻结域表）：v≥7 宿存中轴 / v∈[6,7) 幼果 / v∈[5,6) 将熟四档量化——端点 = profile hex sRGB→线性（JS 锚）', () => {
    const { fragmentShader } = assemble(track(createCedrusBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('if (vUv.y >= 7.0)'); // 宿存中轴域
    expect(fragmentShader).toContain('} else if (vUv.y >= 6.0)'); // 当年幼果域
    expect(fragmentShader).toContain('} else if (vUv.y >= 5.0)'); // 将熟球果域
    expect(fragmentShader).toContain('vec3(0.332, 0.254, 0.162)'); // coneAxisColor 0x9c8a70 线性（宿存中轴淡褐淡入）
    expect(fragmentShader).toContain('vec3(0.366, 0.521, 0.287)'); // coneColorYoung 0xa3bf92 线性（当年幼果淡绿带粉）
    expect(fragmentShader).toContain('floor(clamp(vUv.x, 0.0, 0.999) * 4.0) * 0.3333'); // u 色档四档量化（绿→黄绿→转褐→红褐）
    expect(fragmentShader).toContain('vec3(0.340, 0.480, 0.240), vec3(0.254, 0.144, 0.072), cedCu'); // 淡绿 ↔ coneColorMature 0x8a6a4c 线性
    // 线性端点 JS 锚（sRGB→linear：((c+0.055)/1.055)^2.4）
    const s2l = (c: number): number => Math.pow((c / 255 + 0.055) / 1.055, 2.4);
    const mature = 0x8a6a4c, young = 0xa3bf92, axis = 0x9c8a70;
    expect(s2l((mature >> 16) & 0xff)).toBeCloseTo(0.254, 2);
    expect(s2l((mature >> 8) & 0xff)).toBeCloseTo(0.144, 2);
    expect(s2l(young & 0xff)).toBeCloseTo(0.287, 2);
    expect(s2l((axis >> 16) & 0xff)).toBeCloseTo(0.332, 2);
    expect(s2l(axis & 0xff)).toBeCloseTo(0.162, 2);
  });

  it('球果区实心（冻结接口）：组 0 无 alphaTest、零 diffuseColor.a 写入、深度守卫覆盖；未熟白粉 High', () => {
    const bark = track(createCedrusBarkMaterial());
    expect(bark.alphaTest).toBe(0); // 皮管/球果实心闭合实体——无 alpha 裁切（冻结接口「皮组球果区实心」）
    expect(bark.alphaToCoverage).toBe(false);
    const { fragmentShader } = assemble(track(createCedrusBarkMaterial()), THREE.ShaderLib.physical);
    expect(count(fragmentShader, 'diffuseColor.a')).toBe(0); // 全域零 alpha 写入（实心着色）
    expect(fragmentShader).toContain('(1.0 - cedCu) * 0.14'); // 未熟端微白粉（High——「成熟前淡绿色微有白粉」）
    const mid = assemble(track(createCedrusBarkMaterial('mid')), THREE.ShaderLib.physical);
    expect(mid.fragmentShader).not.toContain('(1.0 - cedCu) * 0.14'); // Mid 去未熟白粉（近景细节）
  });
});

describe('分档实装（level 参数；缺省 high = 显式 high）', () => {

  it('三工厂缺省与显式 high 逐位一致（属性 + 键 + GLSL 全文）', () => {
    const pairs: Array<[THREE.Material, THREE.Material, { vertexShader: string; fragmentShader: string }]> = [
      [track(createCedrusNeedleMaterial()), track(createCedrusNeedleMaterial('high')), THREE.ShaderLib.physical],
      [track(createCedrusBarkMaterial()), track(createCedrusBarkMaterial('high')), THREE.ShaderLib.physical],
      [track(createCedrusNeedleDepthMaterial()), track(createCedrusNeedleDepthMaterial('high')), THREE.ShaderLib.depth],
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
    expectKey(track(createCedrusNeedleMaterial()), 'cedrus:needle+dither');
    expectKey(track(createCedrusNeedleMaterial('mid')), 'cedrus:needle:mid+dither');
    expectKey(track(createCedrusNeedleMaterial('low')), 'cedrus:needle:low+dither');
    expectKey(track(createCedrusBarkMaterial()), 'cedrus:bark+dither');
    expectKey(track(createCedrusBarkMaterial('mid')), 'cedrus:bark:mid+dither');
    expectKey(track(createCedrusBarkMaterial('low')), 'cedrus:bark:low+dither');
    expectKey(track(createCedrusNeedleDepthMaterial()), 'cedrus:needle-depth');
    expectKey(track(createCedrusNeedleDepthMaterial('mid')), 'cedrus:needle-depth:mid');
    expectKey(track(createCedrusNeedleDepthMaterial('low')), 'cedrus:needle-depth:low');
    expect(keys.size).toBe(9);
  });

  it('针 Mid：莲座 14 针 + 去簇团噪声/糙度项（受光色差/白粉/幼叶/透光/hue·luma 保留）', () => {
    const { fragmentShader } = assemble(track(createCedrusNeedleMaterial('mid')), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('14.0 * 0.159155'); // 莲座针数 20→14（分档派生）
    expect(fragmentShader).not.toContain('cedClump'); // 簇团去采样（Mid 片元零噪声执行）
    expect(fragmentShader).not.toContain('(cedClump - 0.5) * 0.05'); // 糙度注入随段去（High 才注入）
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0'); // 透光保留
    expect(fragmentShader).toContain('cedTransVar');
    expect(fragmentShader).toContain('cedExp * 0.35'); // 白粉保留
    expect(fragmentShader).toContain('step(fract(vLeafRand * 7.317 + 0.41), 0.18)'); // 幼叶保留
    expect(fragmentShader).toContain('vec3 cedHue'); // hue·luma 逐卡变奏保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0 调用（簇团去采样——Mid 片元零噪声）
  });

  it('针 Low：莲座 8 针星点 + 去透光/簇团；受光色差/白粉/hue·luma 保留；片元零噪声', () => {
    const { fragmentShader } = assemble(track(createCedrusNeedleMaterial('low')), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('8.0 * 0.159155'); // 莲座针数 8「近似星点」（判定 2）
    for (const gone of ['cedClump', 'cedTransVar', 'vec3(0.60, 0.92, 0.46)']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(count(fragmentShader, '#include <opaque_fragment>')).toBe(1); // 透光不注入但锚点原句不动
    expect(fragmentShader).toContain('vec3 cedLight'); // 受光色差保留（颜色层次档间连续保留面）
    expect(fragmentShader).toContain('cedExp * 0.35'); // 白粉保留
    expect(fragmentShader).toContain('vec3 cedHue'); // hue·luma 保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(3); // 片元零噪声采样（库内 3 为死码，运行时零执行）
  });

  it('皮 Mid：去块面细粒（近景细节）；鳞块网格/沟剖面/每块深浅/上部光滑/小枝淡灰黄/干基暗化保留', () => {
    const { fragmentShader } = assemble(track(createCedrusBarkMaterial('mid')), THREE.ShaderLib.physical);
    expect(fragmentShader).not.toContain('cedGF * 6.0'); // 块面细粒去采样
    expect(fragmentShader).not.toContain('0.97 + 0.06 * cedGrain'); // 细粒乘子随段去
    expect(fragmentShader).toContain('vUv.x * 26.0'); // 鳞块网格保留
    expect(fragmentShader).toContain('1.0 - smoothstep(0.2275, 0.2875, cedGd)'); // 沟剖面保留
    expect(fragmentShader).toContain('0.92 + 0.16 * cedGR'); // 每块深浅保留
    expect(fragmentShader).toContain('vec3(1.16, 1.12, 0.90)'); // 小枝淡灰黄保留（中距冠缘读向）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 游走 1 = 1× vnoise
  });

  it('皮 Low：再去每块深浅/小枝淡灰黄/干基暗化（低调项）；鳞块沟剖面剪影 + 上部光滑 + 球果色序保留', () => {
    const { fragmentShader } = assemble(track(createCedrusBarkMaterial('low')), THREE.ShaderLib.physical);
    for (const gone of ['0.92 + 0.16 * cedGR', 'vec3(1.16, 1.12, 0.90)', '(1.0 - smoothstep(0.6, 2.4, vTreePos.y)) * 0.35', 'cedGF * 6.0']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('1.0 - smoothstep(0.2275, 0.2875, cedGd)'); // 鳞块沟剖面剪影（远距身份保留面）
    expect(fragmentShader).toContain('cedSmoothUp'); // 上部光滑门控保留（结构剪影项三档保留）
    expect(fragmentShader).toContain('vec3(0.366, 0.521, 0.287)'); // 球果色序保留（中距直立绿果身份）
    expect(fragmentShader).toContain('vec3(0.332, 0.254, 0.162)'); // 宿存中轴保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 游走 1 = 1× vnoise
  });

  it('深度 SDF 随档变体（20/14/8——莲座针数即 LOD 内容）：三档互异 + 档内表面/影同串（单一来源生成器）', () => {
    const high = assemble(track(createCedrusNeedleDepthMaterial()), THREE.ShaderLib.depth);
    const mid = assemble(track(createCedrusNeedleDepthMaterial('mid')), THREE.ShaderLib.depth);
    const low = assemble(track(createCedrusNeedleDepthMaterial('low')), THREE.ShaderLib.depth);
    const highSdf = sdfOf(high.fragmentShader);
    const midSdf = sdfOf(mid.fragmentShader);
    const lowSdf = sdfOf(low.fragmentShader);
    expect(highSdf).toContain('20.0');
    expect(midSdf).toContain('14.0');
    expect(lowSdf).toContain('8.0');
    expect(new Set([highSdf, midSdf, lowSdf]).size).toBe(3); // 三档 SDF 互异（vs 樟档位坍缩的分化点）
    expect(highSdf).not.toContain('facVnoise'); // SDF 零噪声引用（深度不挂噪声库的前提）
    // 档内表面/影一致：针表面各档 SDF === 深度各档 SDF（同一生成器输出）
    for (const level of ['high', 'mid', 'low'] as const) {
      const surface = assemble(track(createCedrusNeedleMaterial(level)), THREE.ShaderLib.physical);
      const depthShader = assemble(track(createCedrusNeedleDepthMaterial(level)), THREE.ShaderLib.depth);
      expect(sdfOf(surface.fragmentShader)).toBe(sdfOf(depthShader.fragmentShader)); // 同一 GLSL 字符串（单一来源纪律）
      expect(count(depthShader.fragmentShader, 'facVnoise(')).toBe(0); // 三档深度零噪声库
    }
  });

  it('风动三档同源：针/皮三档顶点 GLSL 全文一致（CEDRUS_WIND 同一常量——档间相位一致 = 身份一致）', () => {
    const needleHigh = assemble(track(createCedrusNeedleMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createCedrusBarkMaterial()), THREE.ShaderLib.physical);
    for (const level of ['mid', 'low'] as const) {
      const needle = assemble(track(createCedrusNeedleMaterial(level)), THREE.ShaderLib.physical);
      const bark = assemble(track(createCedrusBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(needle.vertexShader).toBe(needleHigh.vertexShader);
      expect(bark.vertexShader).toBe(barkHigh.vertexShader);
    }
  });

  it('分档底参契约不因档破：针三档 alphaTest/alphaToCoverage/DoubleSide/USE_UV/零贴图；皮 FrontSide/无 alphaTest；深度 alphaTest', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const needle = track(createCedrusNeedleMaterial(level));
      const bark = track(createCedrusBarkMaterial(level));
      const depth = track(createCedrusNeedleDepthMaterial(level));
      expect(needle.alphaTest).toBe(0.5);
      expect(needle.alphaToCoverage).toBe(true);
      expect(needle.side).toBe(THREE.DoubleSide);
      expect(needle.defines?.USE_UV).toBe('');
      expect(needle.map).toBeNull(); // 零贴图（D13）三档同守
      expect(bark.side).toBe(THREE.FrontSide);
      expect(bark.alphaTest).toBe(0); // 球果实心冻结接口三档同守
      expect(bark.defines?.USE_UV).toBe('');
      expect(depth.alphaTest).toBe(0.5);
      expect(depth.defines?.USE_UV).toBe('');
    }
  });

  it('uTime 桥接三档不缺位：材质级 uniforms.uTime 与编译后 shader.uniforms 同引用（Mid/Low）', () => {
    for (const make of [createCedrusNeedleMaterial, createCedrusBarkMaterial]) {
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
  it('针/皮/深度三键互异；两次调用材质对象不同但键相同；uniforms 不跨实例共享', () => {
    const needleA = track(createCedrusNeedleMaterial());
    const needleB = track(createCedrusNeedleMaterial());
    const barkA = track(createCedrusBarkMaterial());
    const barkB = track(createCedrusBarkMaterial());
    const depth = track(createCedrusNeedleDepthMaterial());
    expect(needleA).not.toBe(needleB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(needleA.customProgramCacheKey()).toBe(needleB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([needleA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
    expect(materialUniformsOf(needleA).uTime).not.toBe(materialUniformsOf(needleB).uTime); // uTime 桥接对象实例独立（dispose 安全）
    expect(materialUniformsOf(barkA).uTime).not.toBe(materialUniformsOf(barkB).uTime);
  });

  it('底参与侧向：针 DoubleSide/角质糙度/USE_UV；皮 FrontSide/高糙哑光/USE_UV；均零贴图', () => {
    const needle = track(createCedrusNeedleMaterial());
    const bark = track(createCedrusBarkMaterial());
    expect(needle.side).toBe(THREE.DoubleSide);
    expect(needle.metalness).toBe(0);
    expect(needle.roughness).toBeGreaterThan(0.6); // 针形角质 + 白粉（0.66——哑光-半光泽）
    expect(needle.roughness).toBeLessThan(0.7);
    expect(needle.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.FrontSide);
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeGreaterThanOrEqual(0.9); // 鳞块粗糙高糙哑光
    expect(bark.map).toBeNull();
    expect(needle.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
  });
});

describe('成本记账（10 万实例每像素预算：针 High ≤8× / 皮 High ≤7.5×，hash21=1×/vnoise=3×）', () => {
  it('facVnoise 调用数：针 High 1 处（3×）/ Mid·Low 0 处、皮 High 2 处（6×）/ Mid·Low 1 处、深度 0 处（零噪声库注入）；顶点零噪声', () => {
    const needle = assemble(track(createCedrusNeedleMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createCedrusBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createCedrusNeedleDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(needle.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（簇团斑块——莲座窗列 ALU 化免噪声）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（鳞块游走 + 块面细粒）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(0); // 深度零噪声库注入（SDF 零噪声——影 pass 不吃噪声）
    expect(count(needle.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin/cos（三成分）
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零循环/零纹理采样（配方确定性纯函数 + SDF 纯 ALU）', () => {
    const shaders = [
      assemble(track(createCedrusNeedleMaterial()), THREE.ShaderLib.physical),
      assemble(track(createCedrusBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createCedrusNeedleDepthMaterial()), THREE.ShaderLib.depth),
    ];
    for (const shader of shaders) {
      for (const source of [shader.vertexShader, shader.fragmentShader]) {
        expect(source).not.toContain('for (');
        expect(source).not.toContain('while');
        expect(source).not.toContain('texture'); // 零贴图零采样（D13）
      }
    }
  });
});

describe('注入点缺失即抛（首次渲染前暴雷）', () => {
  it('片元 map_fragment 摘除 → 针/皮/深度均抛「注入点缺失」', () => {
    for (const make of [createCedrusNeedleMaterial, createCedrusBarkMaterial, createCedrusNeedleDepthMaterial]) {
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
    const needle = track(createCedrusNeedleMaterial());
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

    const depth = track(createCedrusNeedleDepthMaterial());
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
    const bark = track(createCedrusBarkMaterial());
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

    const needle = track(createCedrusNeedleMaterial());
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
  it('针/皮（physical）与深度（depth）注入后花括号配平差值与原版一致', () => {
    const pristinePhysicalFragment = braceDelta(expandIncludes(THREE.ShaderLib.physical.fragmentShader));
    const pristinePhysicalVertex = braceDelta(THREE.ShaderLib.physical.vertexShader);
    const pristineDepthFragment = braceDelta(expandIncludes(THREE.ShaderLib.depth.fragmentShader));
    const pristineDepthVertex = braceDelta(THREE.ShaderLib.depth.vertexShader);

    const needle = assemble(track(createCedrusNeedleMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createCedrusBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createCedrusNeedleDepthMaterial()), THREE.ShaderLib.depth);
    for (const shader of [needle, bark]) {
      expect(braceDelta(expandIncludes(shader.fragmentShader))).toBe(pristinePhysicalFragment);
      expect(braceDelta(shader.vertexShader)).toBe(pristinePhysicalVertex);
    }
    expect(braceDelta(expandIncludes(depth.fragmentShader))).toBe(pristineDepthFragment);
    expect(braceDelta(depth.vertexShader)).toBe(pristineDepthVertex);
  });
});

describe('TimeUniformService 兼容（冻结风相位——固定机位取证纪律）', () => {
  it('冻结期间广播仍写当前值（uTime 常量——树静止）；材质对象兼容', () => {
    const clock = new TimeUniformService();
    clock.advance(0);
    clock.advance(500); // 0.5
    clock.freeze();
    clock.advance(2000); // 忽略
    const material = track(createCedrusNeedleMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});
