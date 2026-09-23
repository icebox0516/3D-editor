/**
 * tests/runtime/procedural/tree/platanusMaterials.test.ts —— 悬铃木叶/树皮/深度材质测试
 * （T011.5，对称 ginkgoMaterials.test.ts 范式：真实 THREE.ShaderLib 源组装，静态字符串
 * 断言 + SDF 数值锚 JS 镜像，零 WebGL；build()/资产入口归并行几何 agent 的资产测试，
 * 此处不覆盖）。
 *
 * 覆盖：
 * - uTime 接线（TimeUniformService 消费协议）：叶/皮材质挂材质级 uniforms.uTime（own
 *   property）；onBeforeCompile 后 shader.uniforms.uTime 与材质级同对象引用；GLSL 声明
 *   uniform float uTime；材质挂场景被服务逐帧驱动（frame 写值闭环）；
 * - 风动契约（D19.7）：aSeed/aBend/aLeafRand 顶点 attribute 声明存在；相位 = fract(sin(...))
 *   类 hash（aSeed=0 缺省属性路径退化为常数相位，全源零除 aSeed——无 NaN）；整树缓摆项
 *   叶/皮同公式（同串出现）；叶片快颤层含 aBend 权重（树皮组恒 0 天然免颤）+ **大叶长柄
 *   重摆读向**（幅度 15mm 六树最大 > 银杏长柄扇叶 13mm > 香樟 11mm > 榉树 8mm、频率
 *   8–14 rad/s 六树最低 < 银杏 10–17——叶柄 3–10cm ≈ 叶宽同量级 Verified + 叶 15–22cm
 *   大且厚实挺括 → 摆锤质量最大周期最长）；树高锚 12m（×0.0833——中龄 12–14m 照片域
 *   下沿，弱 Inferred 终审降级口径记档）；
 * - instanceColor 乘算链安全：注入后 <color_fragment> 原句恰一次、注入代码零 vColor 介入；
 * - SDF 叶形与透光：alphaTest 0.5 + alphaToCoverage；片元含 pltLeafAlpha 计算式与 alpha
 *   写入；深度材质（叶影裁切）含同一 SDF 函数（单一来源）+ RGBADepthPacking + 树皮组守卫
 *   （aLeafRand=0 实心）+ USE_UV + alphaTest；透光项存在且 NUM_DIR_LIGHTS 守卫；风动不进
 *   depth pass；
 * - 物种配方锚定（Spec docs/research/platanus-reference.md 1.0，终审降级口径：裂深典型
 *   1/2 深端 2/3 / 斑块 1/8–1/12 细端 1/20 / 树高类弱 Inferred）：**掌状裂 SDF 核心**
 *   （叶基放射角窗 dip 族——银杏顶边缺刻 dip 的推广新路径：放射角坐标 t=|x|/max(v,0.10)
 *   免 atan + 主 sinus 窗 t0=0.55 双侧对称 + 下侧 sinus 窗 t0=1.10 浅窗 + v 门控——
 *   JS 数值锚：主 sinus 谷底 v 随深度参数单调、D=0.20 谷底 ≈0.52（裂深 1/2 典型）、
 *   D=0.26 谷底 ≈0.44（深端 2/3 读向）、**中央裂片宽≈长**（谷底全宽/裂片长 ∈0.8–1.4
 *   ——FRPS「中央裂片阔三角形，宽度与长度约相等」Verified 的数值自洽）、**叶下部穿洞
 *   安全**（门控满深点 v=0.42 放射线余量 >0——最大深端 0.26 下仍正）、阔卵包络最宽点
 *   ≈0.44 偏基 + v=0.9 半宽 <30% 峰值（先端渐尖））/ 裂数分型 75/15/10（step 阈值字面量
 *   ——三裂压灭下侧 sinus + 主 sinus ×0.85 偏浅、七裂 ×1.8 加深读向）/ 裂片疏粗齿
 *   （角向低频 cos(t·8.0) ≈1.3 齿/裂片带——大叶低频粗质、幅度 0.008–0.022「全缘为主
 *   偶 1–2 粗齿」统计近似、先例齿频 62.83 不串种）/ **离基掌状 3 脉**（离基点两型 75/25
 *   「常离基……或为基出」Verified 统计 + 外展轨迹伸入侧裂片（掌状辐射——樟离基三出
 *   内收吻合公式 0.42·pow 不串种）+ 稀 5 第二对 15% 整对开关 + 脉端 0.52–0.66 渐隐不
 *   达缘 + 权重 0.75 身份核心）/ 背脉腋残毛（FRPS「仅在背脉腋内有毛」Verified——High
 *   专属亚视觉、仅背面）/ 两面区分（背面 ×(1.08,1.10,1.02) R/G 主导浅绿无粉感——樟
 *   glaucous/榉/朴背面乘子不串种 + 两面糙度差 +0.06 六树最小）/ 叶色中绿 #527e39（六树
 *   亮度链：银杏 > 朴树 > 悬铃木 > 夏栎 > 榉 > 樟——中档）/ 哑光-半光泽 roughness 0.66
 *   （榉 0.62 < 0.66 < 朴 0.72——厚实挺括微光）/ 透光中等偏弱峰值 0.28（樟 0.22 <
 *   0.28 < 朴 0.30——厚于朴树纸质）+ 中绿透射色 (0.56,0.90,0.36)；
 *   皮：**第六种树皮语言**光滑大片地图状斑块剥落三色带拼贴——底色 #787e6f 灰绿（G−R=6
 *   六树最绿读向——vs 榉 #787c72 的 G−R=4）+ 三色带字面量（OSU "cream, olive, light
 *   brown"：新露奶油白-浅黄绿 (1.32,1.28,1.14)/(1.24,1.27,1.05) / 过渡灰绿-橄榄
 *   (1.06,1.11,0.96)/(1.00,1.06,0.92) / 老斑灰褐-浅褐 (0.88,0.86,0.82)/(0.78,0.74,0.70)
 *   ——**冷调含灰绿**与榉锈橙 (1.35,0.92,0.64) 互斥不串种）+ 低频大斑 (3.2,2.8)（vs 榉
 *   (6,5) 更大片——1/8–1/12 干径地图状）+ 破碎场 (7.5,6.5) 细端 1/20 带宽 + 代块缝深褐
 *   + 上部红褐收敛（老枝红褐秃净 Verified）+ **无脊沟系统**（abs(fract( 三角脊剖面不
 *   出现——光滑基底）+ 无横断（樟 31.4 不出现）+ 无苔藓（不做不编造）+ 满干型（中龄
 *   活跃剥落非门控——无基段起斑门控项）；
 * - 深度材质零噪声库注入（dip 窗/齿载波全 ALU → SDF 零 facVnoise 引用 → 影 pass 不吃
 *   噪声纪律——沿榉 011.3 + 银杏 011.4 组合先例）；
 * - 分档实装（level 参数，缺省 'high'）：三工厂缺省 ≡ 显式 'high'（属性 + 键 + GLSL 全文
 *   逐位相等）；3 工厂 × 3 档 = 9 键互异（跨资产键零碰撞归 assetTaxonomy 全注册资产收容断言）；叶 Mid
 *   去离基掌状脉三件/残毛/叶团/糙度叶团项（SDF 全形**含 dip 裂 + 齿**保留——档间剪影
 *   一致）、Low 换 SDF_LOW（去 dip 裂系统/齿/分型——裂形细化；包络/收口与 High 逐字
 *   同源）再去透光；皮 Mid 去破碎场 fine（三色带 + 直缝 + 上部红褐保留——中距最强身份
 *   信号）、Low 三色带拼贴保留（**远距斑驳剪影 Spec §7 保留面——vs 榉树 Low 全去的
 *   分化**）去缝；深度 Mid = High SDF（含 dip 裂）、Low = SDF_LOW（表面/影档内一致）；
 *   风动三档顶点 GLSL 同源；分档底参契约（alphaTest/侧向/USE_UV）不因档破；uTime 桥接
 *   三档不缺位；
 * - program 键纪律：叶/皮/深度三键互异；两次工厂调用材质对象不同（无模块级共享，D17）但
 *   键相同；uniforms 不跨实例共享；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：叶片元 facVnoise 调用 1 处
 *   （叶团斑块——dip 窗/齿载波 ALU 化免噪声）、Mid/Low 0 处；皮 High 2 处（代场 +
 *   破碎场）、Mid/Low 1 处（代场）；深度 0 处（零噪声库注入）；顶点零噪声；全源零循环/
 *   零纹理采样/零 atan（放射角坐标 = x/v 代理）；
 * - 注入点缺失即抛（map_fragment/begin_vertex/common/roughnessmap_fragment/opaque_fragment
 *   摘除各暴雷）；
 * - 结构完整性：include 全展开后花括号配平差值与原版一致（注入不破坏 GLSL 结构）；
 * - TimeUniformService.freeze：冻结期间广播仍写当前值（uTime 常量——树静止）+ 材质兼容。
 * 边界：材质登记 afterEach 统一 dispose 兜底，不跨测试泄漏。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms } from 'three';
import { TimeUniformService } from '../../../../src/runtime/services/TimeUniformService';
import {
  createPlatanusBarkMaterial,
  createPlatanusLeafDepthMaterial,
  createPlatanusLeafMaterial,
} from '../../../../src/runtime/procedural/tree/platanus/platanusMaterials';
import { assemble, braceDelta, count, createMaterialTracker, expandIncludes, materialUniformsOf, propsOf, sdfOf as extractSdf } from '../../../support/procedural-tree/materialHarness';

const { track, disposeAll } = createMaterialTracker();

/** 提取注入后的 pltLeafAlpha 函数全文（SDF 单一来源比对用；首个 \n} 即函数闭合） */
const sdfOf = (fragmentShader: string): string =>
  extractSdf(fragmentShader, 'float pltLeafAlpha(vec2 pltUv, float pltRand)');

// ── SDF JS 数值锚镜像（掌状裂 dip 族——与 GLSL 逐式对应；断言裂深/宽长比/穿洞安全）──

const smoothstepJS = (a: number, b: number, x: number): number => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/** 阔卵包络 JS 镜像：pow(sin(π·v^0.85), mix(0.60,1.22,ss(0.35,0.95,v)))——半宽比例场 */
const envOf = (v: number): number => {
  const clamped = Math.min(Math.max(v, 0.001), 0.999);
  const s = Math.sin(Math.PI * Math.pow(clamped, 0.85));
  const m = smoothstepJS(0.35, 0.95, v);
  return Math.pow(s, 0.60 + (1.22 - 0.60) * m);
};

/**
 * 主 sinus 谷底射线（t = 0.55）上的 edge（无齿项——齿均值 0 不影响边缘位置统计）：
 * edge = 0.5·env(v) − 0.55v − D·win(0.55)·gate(v)；射线上 win ≡ 1（|t−0.55| = 0）。
 */
const edgeOnRay = (v: number, depth1: number): number =>
  0.5 * envOf(v) - 0.55 * v - depth1 * smoothstepJS(0.28, 0.42, v);

/** 主 sinus 谷底 v（沿射线扫描 edge≥0 的最深存活点——谷底 = 裂深的数值锚） */
const sinusBottomV = (depth1: number): number => {
  let bottom = 0;
  for (let i = 0; i <= 1000; i++) {
    const v = 0.30 + (i / 1000) * 0.68;
    if (edgeOnRay(v, depth1) >= 0) bottom = v;
  }
  return bottom;
};

afterEach(() => {
  disposeAll();
});

describe('uTime 接线（TimeUniformService 消费协议）', () => {
  it('叶/皮材质挂材质级 uniforms.uTime；编译后 shader.uniforms.uTime 同引用；GLSL 声明 uniform', () => {
    for (const material of [track(createPlatanusLeafMaterial()), track(createPlatanusBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('材质挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const leaf = track(createPlatanusLeafMaterial());
    const bark = track(createPlatanusBarkMaterial());
    const clock = new TimeUniformService();
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), leaf));
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), bark));
    clock.frame(0, scene);
    expect(materialUniformsOf(leaf).uTime!.value).toBe(0);
    clock.frame(1000, scene);
    expect(materialUniformsOf(leaf).uTime!.value).toBeCloseTo(1, 10); // 服务写一次两边生效
    expect(materialUniformsOf(bark).uTime!.value).toBeCloseTo(1, 10);
  });
});

describe('风动契约（D19.7：uTime 全局风帧 / aSeed 个体相位；大叶长柄重摆——柄 3–10cm ≈ 叶宽同量级 Verified + 大叶厚实挺括）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）', () => {
    const leaf = assemble(track(createPlatanusLeafMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(leaf.vertexShader).toContain(decl);
    }
    expect(leaf.vertexShader).toContain('fract(sin(aSeed * 81.273'); // 整树缓摆相位 = hash(aSeed)——常数换五先例去相关
    expect(leaf.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 57.431'); // 快颤相位 = hash(aSeed+叶身份)
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(leaf.vertexShader + leaf.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('整树缓摆叶/皮同公式（同串出现）；快颤含 aBend 权重且幅度 15mm 六树最大（> 银杏长柄 13mm）、频率 8+ 六树最低（< 银杏 10+）；树高锚 12m（×0.0833 弱 Inferred 终审降级口径）', () => {
    const leaf = assemble(track(createPlatanusLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createPlatanusBarkMaterial()), THREE.ShaderLib.physical);
    const swayCore = 'pltWindH * pltWindH * 0.045 * sin(uTime * 1.15';
    expect(leaf.vertexShader).toContain(swayCore);
    expect(bark.vertexShader).toContain(swayCore); // 皮不动叶动会撕裂穿帮——同公式同相位
    expect(leaf.vertexShader).toContain('aBend * 0.015'); // 大叶长柄重摆：幅度 15mm 六树最大（柄 ≈叶宽同量级 + 大叶质量——摆锤质量最大）
    expect(leaf.vertexShader).toContain('uTime * (8.0 + 6.0 * pltFlutterPhase)'); // 8–14 rad/s（≈1.3–2.2Hz）六树最低（大叶厚实摆锤周期最长——vs 银杏 10–17）
    expect(leaf.vertexShader).toContain('position.y * 0.0833'); // /12m 锚点树高（中龄 12–14m 照片域下沿——弱 Inferred 终审降级口径记档）
    expect(0.015).toBeGreaterThan(0.013); // > 银杏长柄扇叶 13mm（六树最大幅度链）
    expect(0.013).toBeGreaterThan(0.011); // > 香樟 11mm
    expect(8.0).toBeLessThan(10.0); // 频率下限 < 银杏 10（六树最低频链）
    expect(14.0).toBeLessThan(17.0); // 频率上限 < 银杏 17
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createPlatanusLeafMaterial()), track(createPlatanusBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('SDF 叶形与透光', () => {
  it('alphaTest 0.5 + alphaToCoverage；片元含 SDF 计算式并写入 alpha', () => {
    const material = track(createPlatanusLeafMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float pltLeafAlpha('); // 叶形 SDF 函数（单一来源）
    expect(fragmentShader).toContain('pltLeafAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = pltAlpha;'); // alphatest_fragment 上游写入
  });

  it('深度材质（叶影裁切）：同一 SDF 函数 + RGBADepthPacking + 树皮组守卫实心 + USE_UV + alphaTest；风动不进 depth；零噪声库注入', () => {
    const material = track(createPlatanusLeafDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.depthPacking).toBe(THREE.RGBADepthPacking);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('pltLeafAlpha(vUv, vLeafRand)');
    expect(shader.fragmentShader).toContain('step(0.0001, vLeafRand)'); // 皮组 aLeafRand=0 → 实心（圆柱 uv 域不误裁；果序球并入皮组同走实心安全）
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
    expect(count(shader.fragmentShader, 'facVnoise(')).toBe(0); // 零噪声库注入——dip 窗/齿载波 ALU 化（影 pass 不吃噪声）
    expect(shader.fragmentShader).not.toContain('facHash21'); // 噪声库整体未挂（SDF 引入噪声即编译暴雷——保护性约束）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫（无平行光场景安全降级）', () => {
    const { fragmentShader } = assemble(track(createPlatanusLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(fragmentShader).toContain('directionalLights[0]');
    expect(fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
  });
});

describe('物种配方锚定（Spec platanus-reference 1.0 §2/§4/§5/§7；终审降级口径：裂深典型 1/2 深端 2/3 / 比例类以文献轴为准）', () => {
  it('掌状裂 SDF 核心（叶基放射角窗 dip 族——银杏顶边缺刻的推广新路径）：放射角坐标免 atan + 主 sinus 窗 + v 门控 + dip 减法；JS 数值锚——裂深 1/2 典型（D=0.20 谷底 ≈0.52）+ 深端 2/3 读向（D=0.26 谷底 ≈0.44）+ 深度参数单调', () => {
    const leaf = assemble(track(createPlatanusLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('pltAbsX / max(pltP.y, 0.10)'); // 放射角坐标 t = |x|/v（免 atan 射线族代理——沿自叶基放射线恒定）
    expect(leaf.fragmentShader).toContain('sin(3.14159 * pow(clamp(pltP.y, 0.001, 0.999), 0.85))'); // 阔卵包络（峰 v≈0.44 偏基——宽>长阔卵 Spec §2 Verified [1][3]）
    expect(leaf.fragmentShader).toContain('mix(0.60, 1.22, smoothstep(0.35, 0.95, pltP.y))'); // 变指数收口（基 0.60 ≈ 截形基 → 上段 1.22 中央裂片先端渐尖 Verified）
    expect(leaf.fragmentShader).toContain('abs(pltT - 0.55) / 0.30'); // 主 sinus 窗 t0=0.55 半宽 0.30（中央/上侧裂片间 ×2 对称）
    expect(leaf.fragmentShader).toContain('abs(pltT - 1.10) / 0.38'); // 下侧 sinus 窗 t0=1.10（浅窗——5 裂 vs 3 裂分化）
    expect(leaf.fragmentShader).toContain('smoothstep(0.28, 0.42, pltP.y)'); // v 门控（FRPS「上部掌状5裂」Verified + 叶下部穿洞保护）
    expect(leaf.fragmentShader).toContain('0.19 + 0.07 * fract(pltRand * 4.517 + 0.27)'); // 深度逐叶 0.19–0.26（裂深 1/2 典型深端 2/3——终审处置 2 域）
    expect(leaf.fragmentShader).toContain('0.5 * pltEnv + pltSerr - pltAbsX - pltDip1 - pltDip2'); // dip 减法合成（边缘 − 放射窗推进）
    // JS 数值锚：谷底 v 随深度参数单调（越深谷底越低）
    const shallow = sinusBottomV(0.19);
    const typical = sinusBottomV(0.20);
    const deep = sinusBottomV(0.26);
    expect(deep).toBeLessThan(typical);
    expect(typical).toBeLessThan(shallow);
    expect(typical).toBeGreaterThan(0.48); // D=0.20 谷底 ≈0.52 → 裂深 ≈0.48 ≈ 1/2 典型（Spec §4 裂深 1/3–1/2 主流 1/2 + 终审深端 2/3）
    expect(typical).toBeLessThan(0.56);
    expect(deep).toBeGreaterThan(0.40); // 深端 2/3 读向：D=0.26 裂深 ≈0.56（2/3 = 0.67 的可表达域内偏保守——穿洞保护优先）
    expect(deep).toBeLessThan(0.47);
    expect(shallow).toBeLessThan(0.58); // 浅端 1/3：D=0.19 谷底最深 ≈0.535 → 裂深 ≈0.47（全域覆盖 0.44–0.60）
    // SDF 单一来源——影裁切叶形自动同步
    const depth = assemble(track(createPlatanusLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(sdfOf(depth.fragmentShader)).toBe(sdfOf(leaf.fragmentShader));
  });

  it('中央裂片宽≈长（FRPS「中央裂片阔三角形，宽度与长度约相等」Verified [1][3][4][8] 的 SDF 数值自洽锚）+ 叶下部穿洞安全（门控满深点余量 >0）+ 阔卵包络最宽点偏基 + 先端渐尖', () => {
    const typical = sinusBottomV(0.20);
    const lobeHalfWidth = 0.55 * typical; // 谷底 x = t·v = 0.55·v_b（edge=0 联立）
    const lobeLength = 1.0 - typical; // 裂片长 = 顶 − 谷底
    const ratio = (2.0 * lobeHalfWidth) / lobeLength; // 全宽/长
    expect(ratio).toBeGreaterThan(0.8); // 宽≈长 ±20–40% 宽松容差（数值自洽锚——窗参数由裂深主锚定）
    expect(ratio).toBeLessThan(1.4);
    // 叶下部穿洞安全：最大深端 0.26 下门控满深点 v=0.42 的放射线余量仍为正（dip 不误穿叶基）
    expect(edgeOnRay(0.42, 0.26)).toBeGreaterThan(0);
    // 阔卵包络最宽点偏基（v≈0.44——宽>长阔卵读向；vs 先例卵形族 0.40–0.61）
    let widestV = 0;
    let widestW = -1;
    for (let i = 0; i <= 500; i++) {
      const v = 0.05 + (i / 500) * 0.9;
      const w = envOf(v);
      if (w > widestW) {
        widestW = w;
        widestV = v;
      }
    }
    expect(widestV).toBeGreaterThan(0.36); // 偏基（朴 0.40 / 樟 0.46 同族）
    expect(widestV).toBeLessThan(0.50);
    // 中央裂片先端渐尖：v=0.9 处半宽 <30% 峰值（上段 1.22 指数收口）
    expect(envOf(0.9) / widestW).toBeLessThan(0.3);
  });

  it('裂数分型 75/15/10（rand 统计近似——分布定量 Unknown Spec §6 记档）：三裂压灭下侧 sinus + 主 sinus ×0.85 偏浅 / 七裂下侧 ×1.8 加深读向', () => {
    const { fragmentShader } = assemble(track(createPlatanusLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('1.0 - step(0.15, pltR2)'); // 三裂类 15%（Spec §6「有时7裂或3裂」——3 裂偏浅联动）
    expect(fragmentShader).toContain('step(0.90, pltR2)'); // 七裂类 10%（偶发）
    expect(fragmentShader).toContain('mix(1.0, 0.85, pltLobe3) * mix(1.0, 1.06, pltLobe7)'); // 主 sinus 分型乘子（3 裂偏浅 Spec §6「裂深同步联动」）
    expect(fragmentShader).toContain('0.09 * mix(mix(1.0, 1.8, pltLobe7), 0.0, pltLobe3)'); // 下侧 sinus：三裂压灭 0 / 五裂 1 / 七裂 ×1.8（7 裂 = 统计近似读向记档）
  });

  it('裂片疏粗齿（0–2 枚/裂片、全缘为主 Verified [1][3]）：角向低频载波（大叶低频粗质——vs 榉 10 齿/侧高频）+ 钝头 pow 2.0 + 幅度 0.008–0.022 逐叶变奏；先例齿频不串种；SDF 零噪声', () => {
    const leaf = assemble(track(createPlatanusLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('cos(pltT * 8.0 - pltRand * 6.28)'); // 角向低频载波（t 域 8 rad ≈1.3 齿/侧裂片带——疏）
    expect(leaf.fragmentShader).toContain('pow(0.5 + 0.5 * cos(pltT * 8.0 - pltRand * 6.28), 2.0)'); // pow 2.0 钝头粗齿（vs 榉 pow 2.6 尖头）
    expect(leaf.fragmentShader).toContain('0.008 + 0.014 * fract(pltRand * 5.317 + 0.19)'); // 幅度逐叶 0.008–0.022（「全缘为主偶 1–2 粗齿」统计近似——低幅端 ≈ 全缘类）
    expect(0.022).toBeLessThan(0.03); // < 坡宽 0.04 的 75%（裁切闪烁纪律）
    expect(leaf.fragmentShader).not.toContain('62.83'); // 榉树全缘齿频不串种（悬铃木大叶低频疏齿）
    expect(leaf.fragmentShader).not.toContain('sin(1.5708'); // 银杏半周期包络不串种（悬铃木全周期阔卵）
    expect(sdfOf(leaf.fragmentShader)).not.toContain('facVnoise'); // SDF 零噪声引用（深度材质不挂噪声库的前提）
  });

  it('离基掌状 3 脉（FRPS「掌状脉3条，稀为5条，常离基部数毫米，或为基出」Verified [1][3]——樟「离基三出」先例的推广分化：外展伸入侧裂片不吻合内收）：离基两型 75/25 + 外展轨迹 + 稀 5 第二对 15% + 脉端不达缘渐隐 + 权重 0.75', () => {
    const { fragmentShader } = assemble(track(createPlatanusLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('mix(0.10, 0.0, step(0.75, fract(vLeafRand * 6.613 + 0.47)))'); // 离基型 75% v0=0.10 / 基出型 25% v0=0.0（「常离基……或为基出」两型 Verified 统计）
    expect(fragmentShader).toContain('max(pltP.y - pltSupra, 0.0) * (1.25 - 0.50 * smoothstep(0.30, 0.55, pltP.y))'); // 外展轨迹：下段 1.25 外张伸入侧裂片（掌状辐射——vs 樟内收吻合）
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.52, 0.66, pltP.y))'); // 脉端渐隐 0.52–0.66（达裂片中带不达缘——subpalmate 口径）
    expect(fragmentShader).toContain('step(0.85, fract(vLeafRand * 8.417 + 0.63))'); // 稀 5 型第二对 15% 整对开关（FRPS「稀为5条」统计近似）
    expect(fragmentShader).toContain('pltVeinTri * 0.75 + pltVeinTri2 * 0.35'); // 侧脉对 0.75 身份核心（樟离基对 0.78 同级）+ 第二对 0.35 弱层
    expect(fragmentShader).toContain('vec3(1.58, 1.36, 1.02)'); // 浅黄绿脉色（可见度沿朴树 Step 4b sRGB 压缩教训定标）
    expect(fragmentShader).not.toContain('0.42 * pow'); // 樟离基三出内收轨迹公式不串种（悬铃木外展——脉型分化记档）
    expect(fragmentShader).not.toContain('0.30 * pow'); // 朴树三出脉基出对公式不串种
    // 中脉带平顶加宽（先例口径——延中央裂片）
    expect(fragmentShader).toContain('1.0 - smoothstep(0.012, 0.040, abs(pltP.x))');
  });

  it('两面区分（背面浅绿无粉感——NC "undersides paler green" Verified [7]）+ 背脉腋残毛（FRPS「仅在背脉腋内有毛」Verified——High 专属亚视觉仅背面）+ 两面糙度差 +0.06 六树最小', () => {
    const leaf = assemble(track(createPlatanusLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('mix(vec3(1.08, 1.10, 1.02), vec3(1.0), float(gl_FrontFacing))'); // 背面 R/G 主导提亮 B 低抬（浅绿暖读向无粉感）
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.05, 1.16)'); // 香樟 glaucous 粉感背面不串种（B 主导——悬铃木无粉感）
    expect(leaf.fragmentShader).not.toContain('vec3(1.10, 1.12, 1.04)'); // 榉树背面乘子不串种（悬铃木幅度略弱）
    expect(leaf.fragmentShader).not.toContain('vec3(1.02, 1.00, 1.10)'); // 朴树背面乘子不串种
    expect(leaf.fragmentShader).toContain('float pltFuzz = 1.0 - smoothstep(0.030, 0.085'); // 背脉腋残毛域（离基点腋 v≈0.13、|x|≈0.05 椭圆）
    expect(leaf.fragmentShader).toContain('pltFuzz * (1.0 - float(gl_FrontFacing)) * 0.8'); // 仅背面应用（正面隆起不做记档——沿樟腺窝口径）
    expect(leaf.fragmentShader).toContain('vec3(0.94, 0.92, 0.87)'); // 轻暗暖亚视觉弱表达
    expect(leaf.fragmentShader).toContain('(1.0 - float(gl_FrontFacing)) * 0.06'); // 两面糙度差 +0.06（近无毛两面趋光滑——六树最小）
  });

  it('背光透光中等偏弱：峰值 0.28（樟 0.22 < 0.28 < 朴 0.30——厚实挺括 "thick and stiff" Verified [5]）；透射色中绿基调；裂缺背光破碎由 SDF alpha 承担（不加强峰值记档）', () => {
    const { fragmentShader } = assemble(track(createPlatanusLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('* pow(pltBack, 3.0) * pltTransVar * pltAlpha * 0.28;');
    expect(fragmentShader).toContain('vec3(0.56, 0.90, 0.36)'); // 中绿透射色（厚叶中绿基调）
    expect(0.28).toBeGreaterThan(0.22); // > 香樟革质（厚实挺括但薄于革质）
    expect(0.28).toBeLessThan(0.30); // < 朴树厚纸质（"thick and stiff" Verified——透光弱于朴）
    expect(fragmentShader).not.toContain('* 0.30;'); // 朴树峰值不串种
    expect(fragmentShader).not.toContain('* 0.34;'); // 银杏峰值不串种
    expect(fragmentShader).not.toContain('* 0.40;'); // 榉树峰值不串种
    expect(fragmentShader).not.toContain('* 0.65;'); // 夏栎裂叶峰值不串种
  });

  it('叶底色 #527e39 中绿（六树亮度链中档：银杏 > 朴树 > 悬铃木 > 夏栎 > 榉 > 樟）；哑光-半光泽 roughness 0.66（榉 0.62 < 0.66 < 朴 0.72——厚实挺括微光）', () => {
    const leaf = track(createPlatanusLeafMaterial());
    const hex = leaf.color.getHex();
    expect(hex).toBe(0x527e39); // 工程设定：NC "medium green" [7] + 照片中绿无粉感 [9] 交叉——六树链中档（中距色块与银杏淡绿/樟浓绿区分）
    const [r, g, b] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
    expect(g - b).toBe(69); // 中绿黄绿量级（朴树 67 同档——非银杏 87 强黄向）
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    expect(luma([r, g, b])).toBeGreaterThan(luma([0x4e, 0x7c, 0x33])); // 亮于夏栎
    expect(luma([r, g, b])).toBeGreaterThan(luma([0x3e, 0x6c, 0x2c])); // 亮于榉树
    expect(luma([r, g, b])).toBeGreaterThan(luma([0x33, 0x61, 0x2e])); // 亮于香樟（浓绿最暗）
    expect(luma([r, g, b])).toBeLessThan(luma([0x5a, 0x83, 0x40])); // 暗于朴树
    expect(luma([r, g, b])).toBeLessThan(luma([0x8a, 0xb4, 0x5d])); // 暗于银杏（最浅黄绿）
    expect(leaf.roughness).toBe(0.66); // 哑光-半光泽（厚实挺括微光——Spec §5 [5][9]）
    expect(0.66).toBeGreaterThan(0.62); // > 榉树半光泽微糙
    expect(0.66).toBeLessThan(0.72); // < 朴树半光泽
    expect(leaf.metalness).toBe(0);
  });

  it('皮底色 #787e6f 灰绿（G−R=6 六树最绿读向——vs 榉 #787c72 的 G−R=4：冷调灰绿 vs 灰白的色温分化①）；第六语言光滑基底无脊沟系统', () => {
    const bark = track(createPlatanusBarkMaterial());
    const hex = bark.color.getHex();
    expect(hex).toBe(0x787e6f); // 工程设定：Wikipedia "pale grey-green" [5] + OSU olive [8] + 照片 [9] 交叉
    const [r, g] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff]; // B 通道不参与灰绿读向断言（G−R 分化轴）
    expect(g - r).toBe(6); // 六树最绿读向（榉 4 灰绿弱——冷调灰绿分化点①）
    expect(g - r).toBeGreaterThan(4);
    const { fragmentShader } = assemble(track(createPlatanusBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).not.toContain('abs(fract('); // 无 tri 脊沟剖面（光滑基底——FRPS「树皮光滑」Verified [1]；纵裂族脊沟系统不串种）
    expect(fragmentShader).not.toContain('31.4'); // 无横断块状通道（樟「局部横向纹」不串种）
    expect(bark.roughness).toBe(0.86); // 光滑基底微泽（vs 纵裂族 0.91–0.93 高糙哑光）
  });

  it('三色带多代拼贴（OSU "cream, olive, light brown" 原句 Verified [8]——冷调含灰绿 vs 榉锈橙互斥）：新露奶油白-浅黄绿 / 过渡灰绿-橄榄 / 老斑灰褐-浅褐 + 高对比（1.32 vs 0.78 极差）+ 低频大斑（vs 榉 (6,5) 更大片）+ 破碎场细端 1/20 带宽', () => {
    const { fragmentShader } = assemble(track(createPlatanusBarkMaterial()), THREE.ShaderLib.physical);
    // 三色带六端点（每带 fine 二级色变两端）
    expect(fragmentShader).toContain('vec3(1.32, 1.28, 1.14)'); // 新露奶油白（OSU cream）
    expect(fragmentShader).toContain('vec3(1.24, 1.27, 1.05)'); // 新露浅黄绿（NC "creamy olive inner bark"）
    expect(fragmentShader).toContain('vec3(1.06, 1.11, 0.96)'); // 过渡灰绿（**冷调含灰绿**——分化点①核心）
    expect(fragmentShader).toContain('vec3(1.00, 1.06, 0.92)'); // 过渡橄榄（OSU olive）
    expect(fragmentShader).toContain('vec3(0.88, 0.86, 0.82)'); // 老斑灰褐
    expect(fragmentShader).toContain('vec3(0.78, 0.74, 0.70)'); // 老斑浅褐（OSU light brown / FOC "pale brown, gray"）
    expect(1.32 / 0.78).toBeGreaterThan(1.6); // 多代高对比（分化点③——新露 vs 老斑极差 ×1.7）
    expect(fragmentShader).not.toContain('vec3(1.35, 0.92, 0.64)'); // 榉树锈橙新斑不串种（暖色单色系 vs 冷调三色带——互斥分化）
    // 低频大斑地图状（主斑 ≈干径 1/8–1/12——vs 榉 (6,5) 小片斑驳：分化点②）+ 破碎场（细端 1/20 终审带宽 + 地图状曲折边）
    expect(fragmentShader).toContain('vec2(vUv.x * 3.2, vUv.y * 2.8)'); // 代场低频（大片）
    expect(fragmentShader).toContain('vec2(vUv.x * 7.5, vUv.y * 6.5)'); // 破碎场（带内二级色变 + 细碎小斑 + 边缘扰曲）
    expect(6.0 / 3.2).toBeGreaterThan(1.5); // 悬铃木代场频率 < 榉斑域频率 → 斑更大（分化点②数值锚）
    // 代块边缘翘曲缝深褐（贴片感——bark-a「沟缝近黑」终审判读 [9]）
    expect(fragmentShader).toContain('vec3(0.66, 0.62, 0.58)');
    expect(fragmentShader).toContain('abs(pltBarkTone - 0.44)');
    expect(fragmentShader).toContain('abs(pltBarkTone - 0.65)');
  });

  it('满干型剥落（中龄活跃期非门控——Spec §5「斑块已占主导」Inferred [1][8][9]）+ 上部红褐收敛（老枝红褐秃净 Verified [1][3]）+ 新露斑光滑糙度 + 苔藓不做（无苔藓/地衣三源低置信——不做不编造）', () => {
    const { fragmentShader } = assemble(track(createPlatanusBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float pltBarkHigh = smoothstep(3.0, 5.5, vTreePos.y);'); // 干上部/细枝门控（结构剪影项——非剥落门控：满干型记档）
    expect(fragmentShader).toContain('vec3(1.06, 0.94, 0.84)'); // 上部红褐偏色（老枝红褐秃净 Verified；嫩枝灰黄绒毛并入暖向——亚视觉记档）
    expect(fragmentShader).toContain('pltBarkHigh * 0.85'); // 拼贴向红褐均匀收敛（斑径 < 枝径不可辨）
    expect(fragmentShader).not.toContain('Moss'); // 苔藓不做（Spec §5 无苔藓/地衣三源低置信——不做不编造）
    expect(fragmentShader).not.toContain('smoothstep(1.4, 3.2'); // 樟苔藓基段门控不串种（满干型——幼树基段先起斑不建模）
    expect(fragmentShader).toContain('- smoothstep(0.60, 0.70, pltBarkTone) * 0.14'); // 新露斑光滑（OSU "best asset" 光滑新皮哑光微泽）
  });
});

describe('分档实装（level 参数；缺省 high = 显式 high）', () => {

  it('三工厂缺省与显式 high 逐位一致（属性 + 键 + GLSL 全文）', () => {
    const pairs: Array<[THREE.Material, THREE.Material, { vertexShader: string; fragmentShader: string }]> = [
      [track(createPlatanusLeafMaterial()), track(createPlatanusLeafMaterial('high')), THREE.ShaderLib.physical],
      [track(createPlatanusBarkMaterial()), track(createPlatanusBarkMaterial('high')), THREE.ShaderLib.physical],
      [track(createPlatanusLeafDepthMaterial()), track(createPlatanusLeafDepthMaterial('high')), THREE.ShaderLib.depth],
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
    expectKey(track(createPlatanusLeafMaterial()), 'platanus:leaf');
    expectKey(track(createPlatanusLeafMaterial('mid')), 'platanus:leaf:mid');
    expectKey(track(createPlatanusLeafMaterial('low')), 'platanus:leaf:low');
    expectKey(track(createPlatanusBarkMaterial()), 'platanus:bark');
    expectKey(track(createPlatanusBarkMaterial('mid')), 'platanus:bark:mid');
    expectKey(track(createPlatanusBarkMaterial('low')), 'platanus:bark:low');
    expectKey(track(createPlatanusLeafDepthMaterial()), 'platanus:leaf-depth');
    expectKey(track(createPlatanusLeafDepthMaterial('mid')), 'platanus:leaf-depth:mid');
    expectKey(track(createPlatanusLeafDepthMaterial('low')), 'platanus:leaf-depth:low');
    expect(keys.size).toBe(9);
  });

  it('叶 Mid：SDF 与 High 同源全形（含 dip 裂 + 齿——档间剪影一致）+ 去离基掌状脉三件/残毛/叶团/糙度叶团项；透光/hue·luma/shade/叶背保留；片元零噪声', () => {
    const high = assemble(track(createPlatanusLeafMaterial()), THREE.ShaderLib.physical);
    const mid = assemble(track(createPlatanusLeafMaterial('mid')), THREE.ShaderLib.physical);
    expect(sdfOf(mid.fragmentShader)).toBe(sdfOf(high.fragmentShader)); // Mid SDF = High 同源全形
    expect(sdfOf(mid.fragmentShader)).toContain('pltDip1'); // 含主 sinus dip（档间剪影一致——多裂 ALU 成本可忽略）
    expect(sdfOf(mid.fragmentShader)).toContain('pltDip2'); // 含下侧 sinus dip
    for (const gone of ['pltVein', 'pltClump', 'pltSupra', 'pltFuzz', 'pltVeinMid']) {
      expect(mid.fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(mid.fragmentShader).not.toContain('(pltClump - 0.5) * 0.06'); // 糙度注入同步去叶团项
    expect(mid.fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0'); // 透光保留
    expect(mid.fragmentShader).toContain('pltTransVar');
    expect(mid.fragmentShader).toContain('vec3 pltHue'); // hue·luma 逐叶变奏保留
    expect(mid.fragmentShader).toContain('float pltLuma');
    expect(mid.fragmentShader).toContain('(0.80 + 0.20 * pltShade)'); // 冠内竖向自遮蔽保留（地板 0.80 沿先例口径）
    expect(mid.fragmentShader).toContain('float(gl_FrontFacing)) * 0.06'); // 两面糙度差保留
    expect(count(mid.fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0 调用（叶团去采样——Mid 片元零噪声执行）
  });

  it('叶 Low：SDF 换 SDF_LOW（去 dip 裂系统/齿/分型——裂形细化 Spec §7 牺牲顺序「掌状裂轮廓先牺牲前仅去齿脉」末端；包络/收口与 High 逐字同源）；去叶脉/残毛/叶团/透光；hue·luma/shade/叶背保留；片元零噪声', () => {
    const high = assemble(track(createPlatanusLeafMaterial()), THREE.ShaderLib.physical);
    const low = assemble(track(createPlatanusLeafMaterial('low')), THREE.ShaderLib.physical);
    const lowSdf = sdfOf(low.fragmentShader);
    expect(lowSdf).not.toBe(sdfOf(high.fragmentShader)); // Low SDF = 去裂版（换字符串）
    for (const gone of ['pltDip1', 'pltDip2', 'pltTooth', 'pltR2', 'pltLobe3', 'pltVein', 'pltClump', 'pltFuzz', 'pltTransVar', 'vec3(0.56, 0.90, 0.36)']) {
      expect(low.fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    // 包络/收口两项与 High 逐字同源（档间叶形身份一致的去细节不改形原则——远距保留阔卵大叶轮廓色块）
    expect(lowSdf).toContain('sin(3.14159 * pow(clamp(pltP.y, 0.001, 0.999), 0.85))');
    expect(lowSdf).toContain('mix(0.60, 1.22, smoothstep(0.35, 0.95, pltP.y))');
    expect(lowSdf).toContain('clamp(pltEdge / 0.04 + 0.5'); // 坡宽同步（档间 AA 边一致）
    expect(count(low.fragmentShader, '#include <opaque_fragment>')).toBe(1); // 透光不注入但锚点原句不动
    expect(low.fragmentShader).toContain('(0.80 + 0.20 * pltShade)'); // shade 保留
    expect(low.fragmentShader).toContain('vec3 pltHue'); // hue·luma 保留
    expect(low.fragmentShader).toContain('float(gl_FrontFacing)) * 0.06'); // 两面糙度差保留
    expect(count(low.fragmentShader, 'facVnoise(')).toBe(3); // 片元零噪声采样（库内 3 为死码，运行时零执行）
  });

  it('皮 Mid：去破碎场 fine（带内二级色变均值化 + 细碎小斑去采样）；三色带拼贴本体 + 直缝 + 上部红褐保留（中距最强身份信号 Spec §7）', () => {
    const { fragmentShader } = assemble(track(createPlatanusBarkMaterial('mid')), THREE.ShaderLib.physical);
    expect(fragmentShader).not.toContain('pltBarkFine'); // 破碎场去采样
    expect(fragmentShader).toContain('pltBarkTone'); // 代场保留
    expect(fragmentShader).toContain('smoothstep(0.38, 0.50, pltBarkTone)'); // 三色带阈值（与 High 同源）
    expect(fragmentShader).toContain('smoothstep(0.60, 0.70, pltBarkTone)');
    expect(fragmentShader).toContain('vec3(1.28, 1.275, 1.095)'); // 新露均值（fine 0.5 两端中点）
    expect(fragmentShader).toContain('float pltSeam'); // 直缝保留（中距贴片感——去 fine 扰曲）
    expect(fragmentShader).toContain('vec3(1.06, 0.94, 0.84)'); // 上部红褐保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 代场 1（破碎场去采样）
  });

  it('皮 Low：三色带拼贴保留（**远距「斑驳拼贴剪影可辨」Spec §7 保留面——vs 榉树 Low 全均值化的分化**）；去缝/去 fine；上部红褐保留；1× vnoise', () => {
    const { fragmentShader } = assemble(track(createPlatanusBarkMaterial('low')), THREE.ShaderLib.physical);
    for (const gone of ['pltBarkFine', 'pltSeam']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('smoothstep(0.38, 0.50, pltBarkTone)'); // 三色带拼贴保留（远距剪影保留面）
    expect(fragmentShader).toContain('smoothstep(0.60, 0.70, pltBarkTone)');
    expect(fragmentShader).toContain('vec3(1.28, 1.275, 1.095)'); // 三色带均值端点（与 Mid 逐字同源）
    expect(fragmentShader).toContain('vec3(1.06, 0.94, 0.84)'); // 上部红褐（结构剪影项三档保留）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 代场 1
  });

  it('深度分档：Mid = High SDF（含 dip 裂）/ Low = SDF_LOW（去裂）；与叶表面档内逐字一致（表面/影裁切档内一致）；三档零噪声库', () => {
    const high = assemble(track(createPlatanusLeafDepthMaterial()), THREE.ShaderLib.depth);
    const mid = assemble(track(createPlatanusLeafDepthMaterial('mid')), THREE.ShaderLib.depth);
    const low = assemble(track(createPlatanusLeafDepthMaterial('low')), THREE.ShaderLib.depth);
    const highSdf = sdfOf(high.fragmentShader);
    expect(sdfOf(mid.fragmentShader)).toBe(highSdf); // Mid 深度 = High SDF（同源全形含 dip 裂）
    expect(highSdf).toContain('pltDip1'); // 档间剪影一致（裂片影读向保留）
    expect(sdfOf(low.fragmentShader)).not.toBe(highSdf); // Low 深度 = SDF_LOW（去裂版）
    expect(sdfOf(low.fragmentShader)).not.toContain('pltDip1');
    // 表面/影档内一致：叶表面各档 SDF === 深度各档 SDF
    for (const level of ['high', 'mid', 'low'] as const) {
      const surface = assemble(track(createPlatanusLeafMaterial(level)), THREE.ShaderLib.physical);
      const depthShader = assemble(track(createPlatanusLeafDepthMaterial(level)), THREE.ShaderLib.depth);
      expect(sdfOf(surface.fragmentShader)).toBe(sdfOf(depthShader.fragmentShader)); // 同一 GLSL 字符串（单一来源纪律）
      expect(count(depthShader.fragmentShader, 'facVnoise(')).toBe(0); // 三档深度零噪声库
    }
  });

  it('风动三档同源：叶/皮三档顶点 GLSL 全文一致（PLATANUS_WIND 同一常量——档间相位一致 = 身份一致）', () => {
    const leafHigh = assemble(track(createPlatanusLeafMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createPlatanusBarkMaterial()), THREE.ShaderLib.physical);
    for (const level of ['mid', 'low'] as const) {
      const leaf = assemble(track(createPlatanusLeafMaterial(level)), THREE.ShaderLib.physical);
      const bark = assemble(track(createPlatanusBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(leaf.vertexShader).toBe(leafHigh.vertexShader);
      expect(bark.vertexShader).toBe(barkHigh.vertexShader);
    }
  });

  it('分档底参契约不因档破：叶三档 alphaTest/alphaToCoverage/DoubleSide/USE_UV/零贴图；皮 FrontSide；深度 alphaTest', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const leaf = track(createPlatanusLeafMaterial(level));
      const bark = track(createPlatanusBarkMaterial(level));
      const depth = track(createPlatanusLeafDepthMaterial(level));
      expect(leaf.alphaTest).toBe(0.5);
      expect(leaf.alphaToCoverage).toBe(true);
      expect(leaf.side).toBe(THREE.DoubleSide);
      expect(leaf.defines?.USE_UV).toBe('');
      expect(leaf.map).toBeNull(); // 零贴图（D13）三档同守
      expect(bark.side).toBe(THREE.FrontSide);
      expect(bark.defines?.USE_UV).toBe('');
      expect(depth.alphaTest).toBe(0.5);
      expect(depth.defines?.USE_UV).toBe('');
    }
  });

  it('uTime 桥接三档不缺位：材质级 uniforms.uTime 与编译后 shader.uniforms 同引用（Mid/Low）', () => {
    for (const make of [createPlatanusLeafMaterial, createPlatanusBarkMaterial]) {
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
  it('叶/皮/深度三键互异；两次调用材质对象不同但键相同；uniforms 不跨实例共享', () => {
    const leafA = track(createPlatanusLeafMaterial());
    const leafB = track(createPlatanusLeafMaterial());
    const barkA = track(createPlatanusBarkMaterial());
    const barkB = track(createPlatanusBarkMaterial());
    const depth = track(createPlatanusLeafDepthMaterial());
    expect(leafA).not.toBe(leafB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(leafA.customProgramCacheKey()).toBe(leafB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([leafA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
    expect(materialUniformsOf(leafA).uTime).not.toBe(materialUniformsOf(leafB).uTime); // uTime 桥接对象实例独立（dispose 安全）
    expect(materialUniformsOf(barkA).uTime).not.toBe(materialUniformsOf(barkB).uTime);
  });

  it('底参与侧向：叶 DoubleSide/哑光-半光泽/USE_UV；皮 FrontSide/光滑微泽/USE_UV；均零贴图', () => {
    const leaf = track(createPlatanusLeafMaterial());
    const bark = track(createPlatanusBarkMaterial());
    expect(leaf.side).toBe(THREE.DoubleSide);
    expect(leaf.metalness).toBe(0);
    expect(leaf.roughness).toBeGreaterThan(0.62); // 哑光-半光泽（0.66——厚实挺括微光）
    expect(leaf.roughness).toBeLessThan(0.72);
    expect(leaf.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.FrontSide);
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeLessThan(0.9); // 光滑基底微泽（vs 纵裂族高糙哑光）
    expect(bark.map).toBeNull();
    expect(leaf.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
  });
});

describe('成本记账（10 万实例每像素预算：叶 High ≈12×（多裂 SDF +2× 账）/ 皮 High 8×，hash21=1×/vnoise=3×——dip 窗/齿载波 ALU 化红利）', () => {
  it('facVnoise 调用数：叶 High 1 处（3×）、Mid/Low 0 处；皮 High 2 处（6×）、Mid/Low 1 处（3×）；深度 0 处（零噪声库注入）；顶点零噪声', () => {
    const leaf = assemble(track(createPlatanusLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createPlatanusBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createPlatanusLeafDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(leaf.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（叶团斑块——dip 窗/齿载波 ALU 化免噪声）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（代场 + 破碎场）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(0); // 深度零噪声库注入（dip 窗 ALU 化先天满足影 pass 不吃噪声）
    expect(count(leaf.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin/cos
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零循环/零纹理采样（配方确定性纯函数 + SDF 纯 ALU）；全源零 atan（放射角坐标 = x/v 代理——成本纪律）', () => {
    const shaders = [
      assemble(track(createPlatanusLeafMaterial()), THREE.ShaderLib.physical),
      assemble(track(createPlatanusBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createPlatanusLeafDepthMaterial()), THREE.ShaderLib.depth),
    ];
    for (const shader of shaders) {
      for (const source of [shader.vertexShader, shader.fragmentShader]) {
        expect(source).not.toContain('for (');
        expect(source).not.toContain('while');
        expect(source).not.toContain('texture'); // 零贴图零采样（D13）
        expect(source).not.toContain('atan('); // 掌状裂放射角坐标免反三角调用（x/v 射线族——成本纪律；断言匹配调用形式：资产名 platanus 含 atan 子串，裸串断言结构性误伤）
      }
    }
  });
});

describe('注入点缺失即抛（首次渲染前暴雷）', () => {
  it('片元 map_fragment 摘除 → 叶/皮/深度均抛「注入点缺失」', () => {
    for (const make of [createPlatanusLeafMaterial, createPlatanusBarkMaterial, createPlatanusLeafDepthMaterial]) {
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
    const leaf = track(createPlatanusLeafMaterial());
    expect(() =>
      leaf.onBeforeCompile(
        {
          vertexShader: THREE.ShaderLib.physical.vertexShader.replace('#include <begin_vertex>', ''),
          fragmentShader: THREE.ShaderLib.physical.fragmentShader,
          uniforms: {},
        } as unknown as WebGLProgramParametersWithUniforms,
        {} as unknown as THREE.WebGLRenderer,
      ),
    ).toThrow(/注入点缺失/);

    const depth = track(createPlatanusLeafDepthMaterial());
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

  it('片元 roughnessmap_fragment / opaque_fragment 摘除 → 抛「注入点缺失」（透光注入仅 High/Mid 叶——Low 无项不注入为设计内）', () => {
    const bark = track(createPlatanusBarkMaterial());
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

    const leaf = track(createPlatanusLeafMaterial());
    expect(() =>
      leaf.onBeforeCompile(
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
  it('叶/皮（physical）与深度（depth）注入后花括号配平差值与原版一致', () => {
    const pristinePhysicalFragment = braceDelta(expandIncludes(THREE.ShaderLib.physical.fragmentShader));
    const pristinePhysicalVertex = braceDelta(THREE.ShaderLib.physical.vertexShader);
    const pristineDepthFragment = braceDelta(expandIncludes(THREE.ShaderLib.depth.fragmentShader));
    const pristineDepthVertex = braceDelta(THREE.ShaderLib.depth.vertexShader);

    const leaf = assemble(track(createPlatanusLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createPlatanusBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createPlatanusLeafDepthMaterial()), THREE.ShaderLib.depth);
    for (const shader of [leaf, bark]) {
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
    const material = track(createPlatanusLeafMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});
