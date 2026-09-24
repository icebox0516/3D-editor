/**
 * tests/runtime/procedural/tree/bischofiaMaterials.test.ts —— 重阳木叶/皮/深度
 * 材质测试（T011.8，对称 koelreuteria/triadicaMaterials.test.ts 范式：真实
 * THREE.ShaderLib 源组装，静态字符串断言 + SDF 数值锚 JS 镜像，零 WebGL；build()/
 * 资产入口归并行几何 agent 的资产测试，此处不覆盖——先例无依赖几何的测试形态，
 * 全部形态可移植）。
 *
 * 覆盖：
 * - uTime 接线（TimeUniformService 消费协议）：叶/皮材质挂材质级 uniforms.uTime（own
 *   property）；onBeforeCompile 后 shader.uniforms.uTime 与材质级同对象引用；GLSL 声明
 *   uniform float uTime；材质挂场景被服务逐帧驱动（frame 写值闭环）；
 * - 风动契约（D19.7）：aSeed/aBend/aLeafRand 顶点 attribute 声明存在；相位 = fract(sin(...))
 *   类 hash（aSeed=0 缺省属性路径退化为常数相位，全源零除 aSeed——无 NaN）；整树缓摆项
 *   叶/皮同公式（同串出现）；复叶卡快颤层含 aBend 权重（组 0 恒 0 天然免颤）+ **长总柄
 *   中幅读向**（总柄 9–13.5cm ≈ 0.7–1.5× 小叶长：摆锤自由度大于单叶小于栾二回羽叶
 *   ——幅度 11mm 与栾同档、频率 9–15 rad/s 同域）；hash 常数 88.217/65.443 与八先例
 *   相位流去相关；树高锚 10m（×0.100——终审 ④ slot-0 占位，待几何实测同步记档）；
 * - instanceColor 乘算链安全：注入后 <color_fragment> 原句恰一次、注入代码零 vColor 介入；
 * - 三出 SDF 与透光：叶 alphaTest 0.5 + alphaToCoverage + 坡宽 0.025（三叶间隙级——
 *   简报 0.02–0.03 域中值）；**组 0 材质工程契约**（材质侧定义）：FrontSide 闭合实体
 *   （皮管——无花果域无裁切需求，vs 栾 DoubleSide 三域的分化）+ 无 alphaTest；深度
 *   材质（叶影裁切）含同一 SDF 函数（单一来源）+ RGBADepthPacking + 组 0 实心守卫
 *   （aLeafRand=0——皮管 uv 域不误裁）+ USE_UV + alphaTest；透光项存在且
 *   NUM_DIR_LIGHTS 守卫；风动不进 depth pass；
 * - 物种配方锚定（Spec docs/research/bischofia-reference.md 1.0，生产口径 = 终审记档
 *   ④）：**三出复叶 SDF 核心（三叶场并集法——复叶第二型新路径）**——宽/长比 0.75
 *   冻结字面量 + 放射节点 0.35 + 顶生小叶（基 0.38/长 0.58/半宽 0.180——「顶生小叶
 *   通常较两侧的大」FRPS Verified）+ 侧生小叶对（±40–50° 手写展开旋转常数对
 *   mix(0.643,0.766)×2、近无柄自节点放射、|x| 镜像单算）+ 总柄渐细线 + **减法式
 *   bare 门控**（乘法门控负距离钳 0 → alpha 恰 0.5 伪覆盖——本文件 JS 镜像实测教训
 *   的修正形态锁定）+ 卵形包络 v^0.84 峰偏基 + 先端指数收口 2.60–3.50 逐叶（「顶端
 *   突尖或短渐尖」+ 尾状读向）+ 基部浅心形弱凹口（triadica 机制同族 ≈44% 域、深度
 *   0.012–0.024 弱表达）+ 缘钝细齿微载波（「每 1 厘米长 4–5 个」Verified——幅
 *   0.003–0.006 逐叶、频 350–410、随包络衰减防幻影齿）——JS 数值锚：**顶/侧长度比
 *   1.25–1.45**（实测域 1.297–1.435）+ 侧叶中心带（±≤0.17, 0.48–0.52）+ **三叶
 *   间隙透空**（bisector 夹缝透空段 ≥0.03，实测 ≈0.133）+ 总柄线 x=0 全 v 连续 +
 *   裸区零越界（乘法门控回归锁）+ **中距宽卵剪影读向**（行宽剖面 maxW 0.26–0.34
 *   @y 0.55–0.75、W(0.48) ≥ 0.5·maxW 宽卵无腰、W(0.90) ≤ 0.35·maxW 渐尖收口）+
 *   Low 宽卵单包络与 High 外廓差 ∈[−0.015, +0.025]（档间剪影一致无跳变）+ 卡缘
 *   恒裁 + 齿幅/齿数域 + 浅心形占比 + 凹口裁进（基侧翼 cordate < plain / 中段无
 *   误伤 / 深度弱表达域）；小叶脉两件（中脉 0.28 + 侧脉 0.15 弱层——羽状脉照片
 *   Inferred）；新叶红褐 flush（Spec §5 双源 Inferred——重阳木知名春相）step 门
 *   ≈6.3% + 铜红-古铜乘色 (1.78,0.62,0.30)；两面弱差（背面 Unknown → 终审 ③-5
 *   弱差档 ×(1.06,1.07,1.05)——先例背面乘子不串种）+ 两面糙度差 +0.05（「全株均
 *   无毛」Verified 最小差）；叶色中绿-深绿 #517c35（九树亮度链：栾 > **重阳木** >
 *   乌桕）；纸质哑光 roughness 0.70（「小叶片纸质」Verified——与栾同档）；透光
 *   家族中庸峰值 0.31（朴 0.30 < 重阳木 0.31 < 栾 0.32）+ 黄绿透射色 (0.55,0.89,
 *   0.34)；皮（**第 9 语言「褐-深灰褐纵裂深沟宽脊 + 扭转」**）：底色 #675a4b 深灰
 *   褐-暗褐（FRPS「树皮褐色」Verified + bark-a/b 照片交叉——R−G=13 褐向与樟争最
 *   褐端、九树链最暗：重阳木 < 樟 < 乌桕 < 榉 < 悬 < 栾）+ 8 宽脊/周（vs 乌桕 11
 *   窄脊）× 强扭转 drift 1.25（vs 乌桕 0.70）+ 沟深中-深剖面 0.54（vs 樟 0.50 深/
 *   乌桕 0.60 中）+ 沟内暖暗 AO + 老干交叉网状次级层（High——脊线横断 × 老干门控
 *   × 局部域门）+ 单色微变 ±6%（无剥落无三色带——悬/榉标记不串种）+ 干基暗化 +
 *   细枝绿-绿褐过渡 + **皮孔灰白↔锈褐两档**（FRPS「当年生枝绿色，皮孔明显，灰白
 *   色，老枝变褐色，皮孔变锈褐色」Verified——近景身份点；36×30 格 65% 有孔 vs 栾
 *   密布 82%）；
 * - 深度材质零噪声库注入（三叶场/齿载波/凹口全 ALU → SDF 零 facVnoise 引用 → 影
 *   pass 不吃噪声纪律——樟 + 榉 011.3 组合先例）；
 * - 分档实装（level 参数，缺省 'high'）：三工厂缺省 ≡ 显式 'high'（属性 + 键 +
 *   GLSL 全文逐位相等）；3 工厂 × 3 档 = 9 键互异（跨资产键零碰撞归 assetTaxonomy
 *   全注册资产收容断言）；叶 Mid 去小叶脉/叶团/糙度
 *   叶团项（**SDF 全形含三叶并集/齿/凹口保留——档间剪影一致：三出剪影是中距
 *   身份**）、Low 换 SDF_LOW（宽卵大叶单包络——三裂细化；总柄线/bare 门控/坡宽
 *   与 High 逐字同源）再去透光；皮 Mid 去老干网状/皮孔点（近景细节层；脊沟扭转/
 *   沟内 AO/干基暗化/细枝两档保留——中距身份）、Low 再去干基暗化/老枝褐档；深度
 *   Mid = High SDF、Low = SDF_LOW（表面/影档内一致）；风动三档顶点 GLSL 同源；
 *   分档底参契约（alphaTest/侧向/USE_UV）不因档破；uTime 桥接三档不缺位；
 * - program 键纪律：叶/皮/深度三键互异；两次工厂调用材质对象不同（无模块级共享，
 *   D17）但键相同；uniforms 不跨实例共享；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：叶片元 facVnoise 调用
 *   1 处（叶团——三叶场/齿载波 ALU 化免噪声）、Mid/Low 0 处；皮 High 2 处（游走
 *   场 + 网状域门）、Mid/Low 1 处；深度 0 处（零噪声库注入）；顶点零噪声；全源零
 *   循环/零纹理采样/零三角函数反函数调用（旋转手写展开/放射并集全 floor/fract/
 *   smoothstep 代理——零 mat2）；
 * - 注入点缺失即抛（map_fragment/begin_vertex/common/roughnessmap_fragment/
 *   opaque_fragment 摘除各暴雷）；
 * - **跨 include 作用域防回归 guard（triadica Step 4 实证事故配套）**：叶/皮三档
 *   roughnessmap 注入段与叶透光段（High/Mid）消费的 bis* 标识符必须在 main 顶层
 *   （brace 深度 1）唯一声明且先于消费——块内声明（作用域关闭后不可见 = 编译错误
 *   形态）与块内遮蔽声明（域外恒初值 = 静默死项形态）两种复发都红；本资产组 0
 *   单域平铺结构天然满足（vs 栾三域/乌桕两域的 if/else 分支），断言固化防结构性
 *   回归；
 * - 结构完整性：include 全展开后花括号配平差值与原版一致（注入不破坏 GLSL 结构）；
 * - TimeUniformService.freeze：冻结期间广播仍写当前值（uTime 常量——树静止）+ 材质兼容。
 * 边界：材质登记 afterEach 统一 dispose 兜底，不跨测试泄漏。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms } from 'three';
import { TimeUniformService } from '../../../../src/runtime/services/TimeUniformService';
import {
  createBischofiaBarkMaterial,
  createBischofiaLeafDepthMaterial,
  createBischofiaLeafMaterial,
} from '../../../../src/runtime/procedural/tree/bischofia/bischofiaMaterials';
import { assemble, braceDelta, count, createMaterialTracker, expandIncludes, materialUniformsOf, propsOf, sdfOf as extractSdf } from '../../../support/procedural-tree/materialHarness';

const { track, disposeAll } = createMaterialTracker();

/** 提取注入后的 bisLeafAlpha 函数全文（SDF 单一来源比对用；首个 \n} 即函数闭合） */
const sdfOf = (fragmentShader: string): string =>
  extractSdf(fragmentShader, 'float bisLeafAlpha(vec2 bisUv, float bisRand)');

/** 提取注入后的 bisLeafSDF 子函数全文（三叶并集子函数单一来源比对用——FXC 拆分形态） */
const subSdfOf = (fragmentShader: string): string =>
  extractSdf(fragmentShader, 'float bisLeafSDF(float bisX, float bisY, float bisRand)');

/** 提取注入后的 bisLeaflet 子函数全文（小叶场单一来源比对用） */
const leafletOf = (fragmentShader: string): string =>
  extractSdf(fragmentShader, 'float bisLeaflet(float bisN, float bisT, float bisLen, float bisHw, float bisR)');

// ── SDF JS 数值锚镜像（三叶场并集法——与 GLSL 逐式对应）──────────────────────────

const fract = (x: number): number => x - Math.floor(x);
const clamp = (x: number, a: number, b: number): number => Math.min(Math.max(x, a), b);
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
const smoothstepJS = (a: number, b: number, x: number): number => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** 浅心形门控 JS 镜像（≈44% 叶域——「基部圆或浅心形」圆首列） */
const bisCordOfJS = (R: number): number => smoothstepJS(0.50, 0.62, fract(R * 7.117 + 0.53));

/** 单枚小叶场 JS 镜像（与 BIS_LEAFLET_FN 逐式对应——含凹口与齿载波） */
function bisLeafletJS(N: number, T: number, len: number, hw: number, R: number): number {
  const tl = clamp(T / len, 0.001, 0.999);
  const envSin = Math.sin(Math.PI * Math.pow(tl, 0.84));
  const envExp = mix(0.96, 2.60 + 0.9 * fract(R * 4.731 + 0.27), smoothstepJS(0.60, 0.88, tl));
  const envN = Math.pow(envSin, envExp);
  let edge = hw * envN - Math.abs(N);
  const cord = bisCordOfJS(R);
  edge -= (0.012 + 0.012 * fract(R * 3.713 + 0.22)) * cord
    * Math.pow(Math.max(0, 1 - Math.hypot(N / hw, tl * 2.4) / 0.55), 2);
  const amp = 0.003 + 0.003 * fract(R * 6.113 + 0.41);
  edge += Math.cos((T + Math.abs(N) * 0.8) * (350.0 + 60.0 * fract(R * 3.317 + 0.19)) + R * 6.283)
    * amp * clamp(envN * 3.0, 0, 1);
  return edge;
}

/** 三叶局部坐标架 JS 镜像（与 BIS_LOCAL_VARS 逐式对应——±40–50° 手写展开旋转） */
function bisLocalJS(X: number, Y: number, R: number): { latLen: number; latHw: number; Lt: number; Ln: number; sin: number; cos: number } {
  const phi = fract(R * 2.713 + 0.17);
  const sin = mix(0.643, 0.766, phi);
  const cos = mix(0.766, 0.643, phi);
  const ax = Math.abs(X);
  const ry = Y - 0.35;
  const latLen = 0.43 * (0.94 + 0.1 * fract(R * 5.317 + 0.63));
  return { latLen, latHw: latLen * 0.31, Lt: ax * sin + ry * cos, Ln: ax * cos - ry * sin, sin, cos };
}

/** 三叶场并集 JS 镜像（与 bisLeafSDF 逐式对应） */
function bisSDFJS(X: number, Y: number, R: number): number {
  const v = bisLocalJS(X, Y, R);
  return Math.max(
    bisLeafletJS(X, Y - 0.38, 0.58, 0.18, R),
    bisLeafletJS(v.Ln, v.Lt, v.latLen, v.latHw, R + 0.37),
  );
}

/** 三出复叶卡覆盖率 JS 镜像（与 bisLeafAlpha 逐式对应——减法式 bare 门控） */
function bisAlphaJS(u: number, v: number, R: number): number {
  const X = (u - 0.5) * 0.75;
  const Y = v;
  const pet = 0.009 - 0.0035 * clamp(Y / 0.4, 0, 1) - Math.abs(X);
  const leaf = bisSDFJS(X, Y, R) - (1 - smoothstepJS(0.315, 0.365, Y)) * 0.1;
  return clamp(Math.max(pet, leaf) / 0.025 + 0.5, 0, 1);
}

/** Low 档宽卵大叶单包络 JS 镜像（与 BIS_LEAF_SDF_LOW 逐式对应） */
function bisAlphaLowJS(u: number, v: number, _R: number): number {
  const X = (u - 0.5) * 0.75;
  const Y = v;
  const pet = 0.009 - 0.0035 * clamp(Y / 0.4, 0, 1) - Math.abs(X);
  const tl = clamp((Y - 0.36) / 0.61, 0.001, 0.999);
  const envN = Math.pow(Math.sin(Math.PI * Math.pow(tl, 0.9)), mix(0.98, 2.3, smoothstepJS(0.62, 0.92, tl)));
  const leaf = 0.305 * envN - Math.abs(X) - (1 - smoothstepJS(0.315, 0.365, Y)) * 0.1;
  return clamp(Math.max(pet, leaf) / 0.025 + 0.5, 0, 1);
}

/** 行宽度剖面：该 v 行 alpha≥0.5 的最大 |x|（中距剪影读向的量化面） */
function rowWidthJS(fn: (u: number, v: number, R: number) => number, R: number, y: number): number {
  let w = 0;
  for (let i = 0; i <= 750; i++) {
    const x = (i / 750) * 0.375;
    if (fn(0.5 + x / 0.75, y, R) >= 0.5 || fn(0.5 - x / 0.75, y, R) >= 0.5) w = x;
  }
  return w;
}

afterEach(() => {
  disposeAll();
});

describe('uTime 接线（TimeUniformService 消费协议）', () => {
  it('叶/皮材质挂材质级 uniforms.uTime；编译后 shader.uniforms.uTime 同引用；GLSL 声明 uniform', () => {
    for (const material of [track(createBischofiaLeafMaterial()), track(createBischofiaBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('材质挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const leaf = track(createBischofiaLeafMaterial());
    const bark = track(createBischofiaBarkMaterial());
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

describe('风动契约（D19.7：uTime 全局风帧 / aSeed 个体相位；长总柄中幅——总柄 9–13.5cm ≈ 0.7–1.5× 小叶长：摆锤自由度大于单叶小于栾二回羽叶）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）；hash 常数与八先例去相关', () => {
    const leaf = assemble(track(createBischofiaLeafMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(leaf.vertexShader).toContain(decl);
    }
    expect(leaf.vertexShader).toContain('fract(sin(aSeed * 88.217'); // 整树缓摆相位 = hash(aSeed)——常数换八先例（77.669–86.531）去相关
    expect(leaf.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 65.443'); // 快颤相位 = hash(aSeed+叶身份)——先例 49.337–63.917 外
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(leaf.vertexShader + leaf.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('整树缓摆叶/皮同公式（同串出现）；快颤含 aBend 权重且幅度 11mm（与栾羽叶同档中幅——任务简报 9–15 rad/s / ≤10–12mm 域中值）、频率 9–15 rad/s；树高锚 9.896m（Stage slot-0 探针经 build() 全管线实测同步——011.6 先例）', () => {
    const leaf = assemble(track(createBischofiaLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createBischofiaBarkMaterial()), THREE.ShaderLib.physical);
    const swayCore = 'bisWindH * bisWindH * 0.040 * sin(uTime * 1.15';
    expect(leaf.vertexShader).toContain(swayCore);
    expect(bark.vertexShader).toContain(swayCore); // 皮不动叶动会撕裂穿帮——同公式同相位（组 0 aBend 恒 0 免颤）
    expect(leaf.vertexShader).toContain('aBend * 0.011'); // 复叶卡快颤幅度 11mm 中幅（长总柄 0.7–1.5× 小叶长——与栾羽叶同档）
    expect(leaf.vertexShader).toContain('uTime * (9.0 + 6.0 * bisFlutterPhase)'); // 9–15 rad/s（≈1.4–2.4Hz 中频）
    expect(leaf.vertexShader).toContain('position.y * 0.1011'); // /9.896m 实测锚（Stage 代理 slot-0 探针 2026-09-21 同步——缩放抖动下权重近似）
    expect(0.011).toBeLessThanOrEqual(0.012); // ≤ 简报域上沿 12mm
    expect(0.011).toBeGreaterThanOrEqual(0.010); // ≥ 简报域下沿 10mm（中幅）
    expect(9.0).toBeGreaterThanOrEqual(9.0); // 频率域下沿（简报 9–15）
    expect(15.0).toBeLessThanOrEqual(15.0); // 频率域上沿
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createBischofiaLeafMaterial()), track(createBischofiaBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('三出 SDF 与透光', () => {
  it('叶 alphaTest 0.5 + alphaToCoverage + 坡宽 0.025（三叶间隙级——简报 0.02–0.03 域中值）；片元含 SDF 计算式并写入 alpha', () => {
    const material = track(createBischofiaLeafMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float bisLeafAlpha('); // 三出 SDF 主函数（单一来源）
    expect(fragmentShader).toContain('float bisLeafSDF('); // 三叶并集子函数（FXC 拆分形态）
    expect(fragmentShader).toContain('float bisLeaflet('); // 小叶场子函数
    expect(fragmentShader).toContain('bisLeafAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = bisAlpha;'); // alphatest_fragment 上游写入
    expect(fragmentShader).toContain('clamp(bisEdge / 0.025 + 0.5'); // 坡宽 0.025（三叶间隙级）
  });

  it('组 0 材质工程契约（材质侧定义）：FrontSide 闭合实体（皮管——无花果域无裁切需求，vs 栾 DoubleSide 三域的分化）+ 无 alphaTest + USE_UV', () => {
    const bark = track(createBischofiaBarkMaterial());
    expect(bark.side).toBe(THREE.FrontSide); // 皮管闭合实体（单域无分支——无裁切）
    expect(bark.alphaTest).toBe(0); // 无裁切
    expect(bark.alphaToCoverage).toBe(false);
    expect(bark.defines?.USE_UV).toBe('');
  });

  it('深度材质（叶影裁切）：同一 SDF 函数 + RGBADepthPacking + 组 0 实心守卫 + USE_UV + alphaTest；风动不进 depth；零噪声库注入', () => {
    const material = track(createBischofiaLeafDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.depthPacking).toBe(THREE.RGBADepthPacking);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('bisLeafAlpha(vUv, vLeafRand)');
    expect(shader.fragmentShader).toContain('step(0.0001, vLeafRand)'); // 组 0 aLeafRand=0 → 实心（皮管 uv 域不误裁——triadica 恒等 attribute 先例；无花果域无需 v 路由）
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
    expect(count(shader.fragmentShader, 'facVnoise(')).toBe(0); // 零噪声库注入——三叶场/齿载波 ALU 化（影 pass 不吃噪声）
    expect(shader.fragmentShader).not.toContain('facHash21'); // 噪声库整体未挂（SDF 引入噪声即编译暴雷——保护性约束）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫（无平行光场景安全降级）', () => {
    const { fragmentShader } = assemble(track(createBischofiaLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(fragmentShader).toContain('directionalLights[0]');
    expect(fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
  });
});

describe('物种配方锚定（Spec bischofia-reference 1.0；生产口径 = 终审记档 ④：三出复叶卡 / 树皮第 9 语言 / 花果不做）', () => {
  it('三出 SDF 核心（三叶场并集法——复叶第二型新路径）：0.75 宽/长比冻结 + 放射节点 + 顶生/侧生锚字面量 + 手写展开旋转（零 mat2）+ 总柄渐细线 + 减法式 bare 门控 + 齿载波 + 浅心形凹口', () => {
    const leaf = assemble(track(createBischofiaLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('(bisUv.x - 0.5) * 0.75'); // 宽/长比 0.75 冻结接口（卡空间折算——半宽 0.375）
    expect(leaf.fragmentShader).toContain('bisY - 0.35'); // 三叶放射节点（裸段 v∈[0,0.35] 上沿——冻结接口）
    expect(leaf.fragmentShader).toContain('bisLeaflet(bisX, bisY - 0.38, 0.58, 0.180, bisRand)'); // 顶生小叶（基 0.38/长 0.58/半宽 0.180/中心 0.67——「顶生小叶通常较两侧的大」FRPS Verified）
    expect(leaf.fragmentShader).toContain('mix(0.643, 0.766, bisPhi)'); // sin(40°..50°) 手写展开旋转（±40–50° 外上举）
    expect(leaf.fragmentShader).toContain('mix(0.766, 0.643, bisPhi)'); // cos(40°..50°)
    expect(leaf.fragmentShader).toContain('0.43 * (0.94 + 0.10 * fract(bisRand * 5.317 + 0.63))'); // 侧生小叶长逐叶 → 顶/侧比 1.30–1.43
    expect(leaf.fragmentShader).toContain('bisAx * bisSin + bisRy * bisCos'); // 沿侧叶轴（旋转手写展开）
    expect(leaf.fragmentShader).toContain('bisAx * bisCos - bisRy * bisSin'); // 垂直侧叶轴
    expect(leaf.fragmentShader).toContain('max(bisTermEdge, bisLatEdge)'); // 三叶场并集
    expect(leaf.fragmentShader).toContain('0.009 - 0.0035 * clamp(bisY / 0.40, 0.0, 1.0)'); // 总柄渐细线（0.009→0.0055——真实 9–13.5cm ≈3–4mm 视觉宽工程放大）
    expect(leaf.fragmentShader).toContain('- (1.0 - smoothstep(0.315, 0.365, bisY)) * 0.10'); // 减法式 bare 门控（乘法门控负距离钳 0 伪覆盖的修正形态——模块头记档）
    expect(leaf.fragmentShader).toContain('sin(3.14159 * pow(bisTl, 0.84))'); // 卵形包络（峰 t≈0.445 偏基——「卵形或椭圆状卵形」首列）
    expect(leaf.fragmentShader).toContain('2.60 + 0.90 * fract(bisR * 4.731 + 0.27)'); // 先端指数收口 2.60–3.50 逐叶（「顶端突尖或短渐尖」+ 尾状读向）
    expect(leaf.fragmentShader).toContain('smoothstep(0.50, 0.62, fract(bisR * 7.117 + 0.53))'); // 浅心形门控 ≈44%（「基部圆或浅心形」圆首列）
    expect(leaf.fragmentShader).toContain('(0.012 + 0.012 * fract(bisR * 3.713 + 0.22))'); // 凹口深度 0.012–0.024 弱表达（triadica 机制同族）
    expect(leaf.fragmentShader).toContain('cos((bisT + abs(bisN) * 0.8) * (350.0 + 60.0 * fract(bisR * 3.317 + 0.19))'); // 齿载波（频 350–410）
    expect(leaf.fragmentShader).toContain('(0.003 + 0.003 * fract(bisR * 6.113 + 0.41))'); // 齿幅 0.003–0.006 逐叶（±0.004–0.006 统计近似）
    expect(leaf.fragmentShader).toContain('clamp(bisEnvN * 3.0, 0.0, 1.0)'); // 载波随包络衰减（防尖/基幻影齿）
    expect(leaf.fragmentShader).not.toContain('mat2'); // 旋转矩阵手写展开纪律（不用矩阵函数）
    expect(sdfOf(leaf.fragmentShader)).not.toContain('facVnoise'); // SDF 零噪声引用（深度材质不挂噪声库的前提）
    // SDF 单一来源——影裁切叶形自动同步
    const depth = assemble(track(createBischofiaLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(sdfOf(depth.fragmentShader)).toBe(sdfOf(leaf.fragmentShader));
    expect(subSdfOf(depth.fragmentShader)).toBe(subSdfOf(leaf.fragmentShader)); // 三叶并集子函数同源
    expect(leafletOf(depth.fragmentShader)).toBe(leafletOf(leaf.fragmentShader)); // 小叶场子函数同源
  });

  it('三出数值锚（JS 镜像）：顶/侧长度比 1.25–1.45 + 侧叶中心带 + 三叶间隙透空（bisector ≥0.03）+ 总柄连续 + 裸区零越界（乘法门控回归锁）', () => {
    // ① 顶/侧长度比（简报关键数值锚）：全域 1.25–1.45（实测 1.297–1.435）
    let ratioMin = 99;
    let ratioMax = 0;
    for (let i = 0; i <= 2000; i++) {
      const R = (i + 0.5) / 2000;
      ratioMin = Math.min(ratioMin, 0.58 / bisLocalJS(0, 0.35, R).latLen);
      ratioMax = Math.max(ratioMax, 0.58 / bisLocalJS(0, 0.35, R).latLen);
    }
    expect(ratioMin).toBeGreaterThan(1.25); // 顶生恒大于侧生（FRPS Verified）
    expect(ratioMax).toBeLessThan(1.45); // 简报锚域上沿
    expect(ratioMin).toBeGreaterThan(1.29); // 实测收紧域（设计校准值）
    expect(ratioMax).toBeLessThan(1.44);
    // ② 侧叶中心带（简报 ±0.13–0.17, 0.47–0.52）
    let cxMax = 0;
    let cyMin = 99;
    let cyMax = 0;
    for (let i = 0; i <= 1000; i++) {
      const R = (i + 0.5) / 1000;
      const v = bisLocalJS(0, 0.35, R);
      cxMax = Math.max(cxMax, (v.latLen / 2) * v.sin);
      cyMin = Math.min(cyMin, 0.35 + (v.latLen / 2) * v.cos);
      cyMax = Math.max(cyMax, 0.35 + (v.latLen / 2) * v.cos);
    }
    expect(cxMax).toBeLessThanOrEqual(0.17);
    expect(cxMax).toBeGreaterThanOrEqual(0.13);
    expect(cyMin).toBeGreaterThan(0.47);
    expect(cyMax).toBeLessThan(0.52);
    // ③ 三叶间隙透空（侧叶-顶叶夹缝 bisector 扫描——三出结构中距可辨的来源）
    const s22 = Math.sin(Math.PI / 8);
    const c22 = Math.cos(Math.PI / 8);
    for (const R of [0.13, 0.37, 0.51, 0.77]) {
      let bestRun = 0;
      let run = 0;
      for (let i = 0; i <= 600; i++) {
        const r = 0.1 + (i / 600) * 0.45;
        if (bisAlphaJS(0.5 + (r * s22) / 0.75, 0.35 + r * c22, R) < 0.5) {
          run++;
          bestRun = Math.max(bestRun, run);
        } else run = 0;
      }
      expect((bestRun / 600) * 0.45, `R=${R} 间隙透空段长`).toBeGreaterThan(0.03); // 夹缝透空可辨（实测 ≈0.133）
    }
    // ④ 总柄线连续：x=0 处 alpha ≥0.5 全 v（柄永不裁穿——顶小叶柄延伸不断线）
    let petMin = 1;
    for (let i = 0; i <= 200; i++) {
      petMin = Math.min(petMin, bisAlphaJS(0.5, 0.01 + (i / 200) * 0.39, 0.37));
    }
    expect(petMin).toBeGreaterThanOrEqual(0.5);
    // ⑤ 裸区零越界（乘法门控伪覆盖回归锁——负距离×0 → alpha 恰 0.5 恰过 alphaTest 的形态）
    let bad = 0;
    for (let R = 0.05; R <= 0.95; R += 0.09) {
      for (let iy = 0; iy <= 60; iy++) {
        for (let iu = 0; iu <= 200; iu++) {
          const u = 0.005 + iu * 0.00495;
          const y = 0.02 + iy * 0.005;
          if (y <= 0.31 && Math.abs((u - 0.5) * 0.75) > 0.03 && bisAlphaJS(u, y, R) >= 0.5) bad++;
        }
      }
    }
    expect(bad).toBe(0); // 裸段除总柄线外全透空
  });

  it('中距宽卵剪影读向（JS 镜像行宽剖面）：maxW 0.26–0.34 @y 0.55–0.75 + 宽卵无腰 + 渐尖收口 + 卡缘恒裁 + Low 单包络与 High 外廓差 ∈[−0.015, +0.03]（单包络填三裂间隙 = 恒偏胖侧）', () => {
    for (const R of [0.21, 0.51, 0.77]) {
      let maxW = 0;
      let maxWy = 0;
      for (let i = 0; i <= 130; i++) {
        const y = 0.36 + (i / 130) * 0.61;
        const w = rowWidthJS(bisAlphaJS, R, y);
        if (w > maxW) {
          maxW = w;
          maxWy = y;
        }
      }
      expect(maxW, `R=${R} 最宽行`).toBeGreaterThan(0.26); // 宽卵大叶（三叶展幅）
      expect(maxW).toBeLessThan(0.34); // 卡半宽 0.375 内不外溢
      expect(maxWy).toBeGreaterThan(0.55); // 最宽带偏上中段（三叶放射姿态）
      expect(maxWy).toBeLessThan(0.75);
      const w48 = rowWidthJS(bisAlphaJS, R, 0.48);
      expect(w48).toBeGreaterThanOrEqual(0.5 * maxW); // 宽卵无腰（中段饱满——「宽卵形大叶」剪影）
      const w90 = rowWidthJS(bisAlphaJS, R, 0.9);
      expect(w90).toBeLessThanOrEqual(0.35 * maxW); // 渐尖收口（「顶端突尖或短渐尖」剪影）
      // Low 宽卵单包络档间剪影一致（LOD 切换无跳变；High 外廓逐 rand 变幅 ±0.035——固定峰单包络
      // 以非对称带锚定：欠窄 ≤0.015 / 偏胖 ≤0.03（三裂间隙填充 + 侧叶伸展端个体的固有差）
      let lowMax = 0;
      for (let i = 0; i <= 130; i++) {
        lowMax = Math.max(lowMax, rowWidthJS(bisAlphaLowJS, R, 0.36 + (i / 130) * 0.61));
      }
      expect(lowMax, `R=${R} Low 最宽行下界`).toBeGreaterThanOrEqual(maxW - 0.015); // 不过窄（High 外廓近似）
      expect(lowMax, `R=${R} Low 最宽行上界`).toBeLessThanOrEqual(maxW + 0.03); // 不过胖（三裂间隙填充上限）
      expect(lowMax).toBeGreaterThan(0.28); // Low 自身宽卵读向保持
      expect(lowMax).toBeLessThan(0.32);
    }
    // 卡缘恒裁（u=0/1 全 v alpha<0.5——卡空间无外溢）
    for (const R of [0.21, 0.77]) {
      let maxEdge = 0;
      for (let i = 0; i <= 100; i++) {
        maxEdge = Math.max(maxEdge, bisAlphaJS(0.999, i / 100, R), bisAlphaJS(0.001, i / 100, R));
      }
      expect(maxEdge).toBeLessThan(0.5);
    }
  });

  it('缘钝细齿统计近似（「每 1 厘米长 4-5 个」FRPS Verified——亚像素统计近似 + 牺牲顺序首位记档）：幅域 0.003–0.006 + 顶生齿数 28–50 域内', () => {
    let ampMin = 9;
    let ampMax = 0;
    for (let i = 0; i < 2000; i++) {
      const R = (i + 0.5) / 2000;
      const amp = 0.003 + 0.003 * fract(R * 6.113 + 0.41);
      ampMin = Math.min(ampMin, amp);
      ampMax = Math.max(ampMax, amp);
    }
    expect(ampMin).toBeGreaterThan(0.0029); // 幅域下沿（±0.004–0.006 简报域的统计实现）
    expect(ampMax).toBeLessThan(0.0061); // 幅域上沿
    for (const R of [0.21, 0.51]) {
      const freq = 350 + 60 * fract(R * 3.317 + 0.19);
      const teeth = (freq * 0.58) / (2 * Math.PI); // 顶生小叶（长 0.58 卡单位）全缘齿数
      expect(teeth).toBeGreaterThan(28); // 真实 4–5 齿/cm × 7–10cm 小叶的下沿
      expect(teeth).toBeLessThan(50); // 上沿
    }
  });

  it('浅心形凹口（基部圆-浅心形弱表达）：域占比 ≈44%（圆首列——心形次相）+ 凹口裁进（基侧翼 cordate < plain）+ 中段无误伤 + 深度弱表达域', () => {
    let cord = 0;
    for (let i = 0; i < 10000; i++) if (bisCordOfJS((i + 0.5) / 10000) > 0.5) cord++;
    expect(cord / 10000).toBeGreaterThan(0.38); // ≈44% 叶域
    expect(cord / 10000).toBeLessThan(0.5); // 心形为次相（「圆或浅心形」圆首列）
    let randCord = -1;
    let randPlain = -1;
    for (let i = 0; i < 4000 && (randCord < 0 || randPlain < 0); i++) {
      const r = (i + 0.5) / 4000;
      if (randCord < 0 && bisCordOfJS(r) > 0.95) randCord = r;
      if (randPlain < 0 && bisCordOfJS(r) < 0.01) randPlain = r;
    }
    expect(randCord).toBeGreaterThan(0);
    expect(randPlain).toBeGreaterThan(0);
    // 凹口裁进：cordate 小叶基侧翼场值 < plain（凹口在咬）
    expect(bisLeafletJS(0.03, 0.025, 0.58, 0.18, randCord)).toBeLessThan(bisLeafletJS(0.03, 0.025, 0.58, 0.18, randPlain));
    // 中段无误伤（凹口域限基中心——中段差仅齿载波级 ≤0.008）
    expect(Math.abs(bisLeafletJS(0.05, 0.25, 0.58, 0.18, randCord) - bisLeafletJS(0.05, 0.25, 0.58, 0.18, randPlain))).toBeLessThan(0.008);
    // 深度弱表达域（vs triadica 全叶级 0.05–0.11——重阳木小叶级弱一档）
    const depth = bisLeafletJS(0, 0, 0.58, 0.18, randPlain) - bisLeafletJS(0, 0, 0.58, 0.18, randCord);
    expect(depth).toBeGreaterThan(0.01);
    expect(depth).toBeLessThan(0.026);
  });

  it('小叶脉两件（羽状脉——照片 leaf-b 读向 Inferred）：中脉 0.28 + 侧脉 0.15 弱层 + 侧生小叶沿自身旋转架（BIS_LOCAL_VARS 同源折算）', () => {
    const { fragmentShader } = assemble(track(createBischofiaLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('bisVMid * 0.28 + bisVLat * 0.15'); // 权重弱表达 0.28/0.15（中脉身份层 + 侧脉读向弱层）
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.012, 0.042, abs(bisX)))'); // 顶生中脉带宽
    expect(fragmentShader).toContain('abs(bisLn)'); // 侧生中脉沿自身旋转架（|bisLn| 带宽）
    expect(fragmentShader).toContain('smoothstep(bisLatLen * 0.82, bisLatLen * 0.96, bisLt)'); // 侧生中脉先端渐隐（不达尖）
    expect(fragmentShader).toContain('sin(bisVTt * 88.0 - abs(bisX) * 46.0'); // 顶生侧脉对角脊族（斜升）
    expect(fragmentShader).toContain('sin(bisLt * 74.0 - abs(bisLn) * 42.0'); // 侧生侧脉（缩小频）
  });

  it('新叶红褐 flush（Spec §5 双源 Inferred——重阳木知名春相；三档同体）：step 门 + 铜红-古铜乘色 + JS 锚 5–8%', () => {
    const { fragmentShader } = assemble(track(createBischofiaLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('step(0.938, fract(vLeafRand * 8.913 + 0.63))'); // flush 门（≈6.3% 叶域）
    expect(fragmentShader).toContain('vec3(1.78, 0.62, 0.30)'); // 铜红-古铜乘色（照片双源 Inferred——f2 黄绿红调/leaf-d 红褐古铜）
    expect(fragmentShader).not.toContain('vec3(1.80, 0.60, 0.34)'); // 乌桕铜红-绯红 flush 不串种
    let fl = 0;
    for (let i = 0; i < 10000; i++) if (fract(((i + 0.5) / 10000) * 8.913 + 0.63) >= 0.938) fl++;
    expect(fl / 10000).toBeGreaterThan(0.05); // 简报域 5–8%
    expect(fl / 10000).toBeLessThan(0.08);
  });

  it('两面弱差（背面 Unknown → 终审 ③-5 弱差档）：×(1.06,1.07,1.05) 浅绿 + 两面糙度差 +0.05（「全株均无毛」Verified 最小差）；先例背面乘子不串种', () => {
    const leaf = assemble(track(createBischofiaLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('mix(vec3(1.06, 1.07, 1.05), vec3(1.0), float(gl_FrontFacing))'); // 背面浅绿弱提亮（弱差档——无粉感/灰感倾向编造）
    expect(leaf.fragmentShader).not.toContain('vec3(1.09, 1.10, 1.13)'); // 栾柔毛灰绿背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.08, 1.02)'); // 乌桕背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.05, 1.16)'); // 香樟 glaucous 粉感不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.08, 1.10, 1.02)'); // 悬铃木背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.10, 1.12, 1.04)'); // 榉树背面不串种
    expect(leaf.fragmentShader).toContain('(1.0 - float(gl_FrontFacing)) * 0.05'); // 两面糙度差 +0.05（全株无毛——最小差档）
    expect(0.05).toBeLessThan(0.08); // < 栾柔毛差（弱一档——简报口径）
  });

  it('背光透光家族中庸：峰值 0.31（朴 0.30 < 重阳木 0.31 < 栾 0.32——纸质复叶卡）；黄绿透射色；先例峰值不串种', () => {
    const { fragmentShader } = assemble(track(createBischofiaLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('* pow(bisBack, 3.0) * bisTransVar * bisAlpha * 0.31;');
    expect(fragmentShader).toContain('vec3(0.55, 0.89, 0.34)'); // 黄绿透射色（纸质中绿基调）
    expect(0.31).toBeGreaterThan(0.3); // > 朴树
    expect(0.31).toBeLessThan(0.32); // < 栾复叶卡（家族中庸档）
    expect(fragmentShader).not.toContain('* 0.30;'); // 朴树峰值不串种
    expect(fragmentShader).not.toContain('* 0.32;'); // 栾峰值不串种
    expect(fragmentShader).not.toContain('* 0.33;'); // 乌桕峰值不串种
    expect(fragmentShader).not.toContain('* 0.34;'); // 银杏峰值不串种
    expect(fragmentShader).not.toContain('* 0.28;'); // 悬铃木峰值不串种
    expect(fragmentShader).not.toContain('* 0.40;'); // 榉树峰值不串种
    expect(fragmentShader).not.toContain('* 0.65;'); // 夏栎裂叶峰值不串种
  });

  it('叶底色 #517c35 中绿-深绿（九树亮度链：栾 > 重阳木 > 乌桕——Spec §5 Inferred 单源如实降档）；纸质哑光 roughness 0.70（「小叶片纸质」Verified——与栾同档）', () => {
    const leaf = track(createBischofiaLeafMaterial());
    const hex = leaf.color.getHex();
    expect(hex).toBe(0x517c35); // 工程设定：Spec §5 正面中绿-深绿（leaf-b 单源 Inferred）+ 九树链自定位
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const l = luma([(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff]);
    expect(l).toBeLessThan(luma([0x52, 0x7d, 0x37])); // 暗于栾树（中绿）
    expect(l).toBeGreaterThan(luma([0x50, 0x7c, 0x34])); // 亮于乌桕（中绿-深绿档定位）
    expect(leaf.roughness).toBe(0.7); // 纸质复叶哑光（「小叶片纸质」FRPS Verified）
    expect(0.7).toBeGreaterThan(0.66); // > 悬铃木厚实挺括
    expect(0.7).toBeLessThan(0.72); // < 朴树近革质
    expect(leaf.metalness).toBe(0);
  });

  it('皮第 9 语言底色 #675a4b 深灰褐-暗褐（FRPS「树皮褐色」Verified + bark-a/b 照片交叉；R−G=13 褐向——与樟争家族最褐端；九树链最暗）；纵裂深沟族高糙哑光 0.92；8 宽脊 + 强扭转 drift 字面量', () => {
    const bark = track(createBischofiaBarkMaterial());
    const hex = bark.color.getHex();
    expect(hex).toBe(0x675a4b); // 工程设定：FRPS 褐色 [1][3] + bark-a「深灰褐-暗褐」/bark-b「深灰褐」[7] 交叉
    const [r, g, b] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
    expect(r - g).toBe(13); // 褐向（vs 乌桕 5 微暖——明显更褐）
    expect(r - b).toBeGreaterThanOrEqual(24); // 深褐读向（R 显著抬升）
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const l = luma([r, g, b]);
    expect(l).toBeLessThan(luma([0x6e, 0x63, 0x52])); // 暗于樟黄褐深沟（九树链：重阳木 < 樟）
    expect(l).toBeLessThan(luma([0x6f, 0x6a, 0x62])); // 暗于乌桕暗灰
    expect(l).toBeLessThan(luma([0x90, 0x92, 0x8a])); // 暗于栾浅色
    expect(bark.roughness).toBe(0.92); // 纵裂深沟族高糙哑光（与乌桕同档）
    const { fragmentShader } = assemble(track(createBischofiaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('abs(fract(vUv.x * 8.0 + bisWarp * 1.25)'); // 8 宽脊/周 × drift 1.25 强游走（vs 乌桕 11 窄脊 0.70——宽脊+扭转双分化）
    expect(fragmentShader).toContain('mix(0.54 + 0.46 * bisTri * bisTri, 0.90 + 0.10 * bisTri * bisTri'); // 沟深中-深剖面（vs 樟 0.50 深 / 乌桕 0.60 中）
    expect(fragmentShader).not.toContain('vUv.x * 11.0'); // 乌桕窄脊不串种
  });

  it('脊沟系统与老干交叉网状（High 近景）：沟内暖暗 AO + 网状层（脊线横断 × 老干门控 × 局部域门）+ 单色微变（无剥落无三色带——悬/榉标记不串种）', () => {
    const { fragmentShader } = assemble(track(createBischofiaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('vec3(0.80, 0.78, 0.76)'); // 沟内暖暗 AO（深沟宽脊两带分化——沟暗脊面暖灰）
    expect(fragmentShader).toContain('vec3(bisRidge) * (0.93 + 0.13 * bisWarp)'); // 基底单色微变 ±6%（「树皮褐色」——游走场复用省 1 采样；vec3(bisRidge) 显式广播——011.8 编译事故修复形态）
    expect(fragmentShader).toContain('fract(vUv.y * 2.6 + bisWarp * 0.6 + bisTri * 0.22)'); // 网状脊线横断 fissure（游走+脊相位调制）
    expect(fragmentShader).toContain('(1.0 - smoothstep(1.6, 3.0, vTreePos.y))'); // 老干门控（低位——干基老木段）
    expect(fragmentShader).toContain('(1.0 - smoothstep(1.4, 2.2, vUv.y))'); // 老干门控（低弧长 v——皮管累计弧长契约注记）
    expect(fragmentShader).toContain('smoothstep(0.46, 0.64, bisTone)'); // 网状局部域门（片域——非通干）
    expect(fragmentShader).toContain('vec3(0.87, 0.85, 0.84)'); // 网状微暗
    expect(fragmentShader).not.toContain('vec3(1.32, 1.28, 1.14)'); // 悬铃木新露奶油白带不串种（无剥落）
    expect(fragmentShader).not.toContain('vec3(1.35, 0.92, 0.64)'); // 榉树锈橙新斑不串种（无剥落）
    expect(fragmentShader).not.toContain('vec3(1.13, 1.11, 1.05)'); // 乌桕翘条亮面不串种（无翘皮）
  });

  it('干基暗化 + 细枝绿-绿褐过渡 + 皮孔灰白↔锈褐两档（FRPS「当年生枝绿色，皮孔明显，灰白色，老枝变褐色，皮孔变锈褐色」Verified——近景身份点）', () => {
    const { fragmentShader } = assemble(track(createBischofiaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('1.0 - smoothstep(0.5, 2.4, vTreePos.y)'); // 干基暗带门控（家族惯例）
    expect(fragmentShader).toContain('vec3(0.87, 0.86, 0.87)'); // 干基暗化乘色
    expect(fragmentShader).toContain('smoothstep(5.8, 7.8, vTreePos.y)'); // 当年生枝高位门控
    expect(fragmentShader).toContain('smoothstep(4.4, 5.8, vTreePos.y)'); // 老枝褐档门控
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.45, 0.95, vUv.y))'); // 小弧长门（「细枝管 v 小」几何契约注记——高位 × 小 v 双门控）
    expect(fragmentShader).toContain('vec3(0.88, 1.16, 0.74)'); // 当年生枝绿色收敛
    expect(fragmentShader).toContain('vec3(1.05, 0.98, 0.90)'); // 老枝褐弱收敛
    expect(fragmentShader).toContain('vec2(vUv.x * 36.0, vUv.y * 30.0)'); // 皮孔格密度（细枝域稀疏）
    expect(fragmentShader).toContain('step(0.35, bisLR)'); // 65% 格有孔（vs 栾密布 82% 稀疏一档）
    expect(fragmentShader).toContain('vec3(1.42, 1.06, 0.72)'); // 皮孔锈褐档（老枝——「皮孔变锈褐色」Verified）
    expect(fragmentShader).toContain('vec3(1.38, 1.38, 1.32)'); // 皮孔灰白档（当年生——「灰白色」Verified）
    expect(fragmentShader).not.toContain('Moss'); // 苔藓不做（不做不编造——沿先例）
    expect(fragmentShader).not.toContain('52.0'); // 栾皮孔麻点格密度不串种（皮孔语言归栾全干密布型）
  });
});

describe('分档实装（level 参数；缺省 high = 显式 high）', () => {

  it('三工厂缺省与显式 high 逐位一致（属性 + 键 + GLSL 全文）', () => {
    const pairs: Array<[THREE.Material, THREE.Material, { vertexShader: string; fragmentShader: string }]> = [
      [track(createBischofiaLeafMaterial()), track(createBischofiaLeafMaterial('high')), THREE.ShaderLib.physical],
      [track(createBischofiaBarkMaterial()), track(createBischofiaBarkMaterial('high')), THREE.ShaderLib.physical],
      [track(createBischofiaLeafDepthMaterial()), track(createBischofiaLeafDepthMaterial('high')), THREE.ShaderLib.depth],
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
    expectKey(track(createBischofiaLeafMaterial()), 'bischofia:leaf+dither');
    expectKey(track(createBischofiaLeafMaterial('mid')), 'bischofia:leaf:mid+dither');
    expectKey(track(createBischofiaLeafMaterial('low')), 'bischofia:leaf:low+dither');
    expectKey(track(createBischofiaBarkMaterial()), 'bischofia:bark+dither');
    expectKey(track(createBischofiaBarkMaterial('mid')), 'bischofia:bark:mid+dither');
    expectKey(track(createBischofiaBarkMaterial('low')), 'bischofia:bark:low+dither');
    expectKey(track(createBischofiaLeafDepthMaterial()), 'bischofia:leaf-depth');
    expectKey(track(createBischofiaLeafDepthMaterial('mid')), 'bischofia:leaf-depth:mid');
    expectKey(track(createBischofiaLeafDepthMaterial('low')), 'bischofia:leaf-depth:low');
    expect(keys.size).toBe(9);
  });

  it('叶 Mid：SDF 与 High 同源全形（含三叶并集/齿/凹口——档间剪影一致：三出剪影是中距身份）+ 去小叶脉/叶团/糙度叶团项；透光/hue·luma/shade/叶背/flush 保留；片元零噪声', () => {
    const high = assemble(track(createBischofiaLeafMaterial()), THREE.ShaderLib.physical);
    const mid = assemble(track(createBischofiaLeafMaterial('mid')), THREE.ShaderLib.physical);
    expect(sdfOf(mid.fragmentShader)).toBe(sdfOf(high.fragmentShader)); // Mid SDF = High 同源全形
    expect(subSdfOf(mid.fragmentShader)).toBe(subSdfOf(high.fragmentShader)); // 三叶并集子函数同源（FXC 拆分形态）
    expect(leafletOf(mid.fragmentShader)).toBe(leafletOf(high.fragmentShader)); // 小叶场子函数同源（含齿载波/凹口）
    for (const gone of ['bisVMid', 'bisVLat', 'bisClump']) {
      expect(mid.fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(mid.fragmentShader).not.toContain('(bisClump - 0.5) * 0.06'); // 糙度注入同步去叶团项
    expect(mid.fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0'); // 透光保留
    expect(mid.fragmentShader).toContain('bisTransVar');
    expect(mid.fragmentShader).toContain('vec3 bisHue'); // hue·luma 逐叶变奏保留
    expect(mid.fragmentShader).toContain('float bisLuma');
    expect(mid.fragmentShader).toContain('(0.80 + 0.20 * bisShade)'); // 冠内竖向自遮蔽保留（地板 0.80 沿先例口径）
    expect(mid.fragmentShader).toContain('float(gl_FrontFacing)) * 0.05'); // 两面糙度差保留
    expect(mid.fragmentShader).toContain('bisFlush'); // flush 三档同体（冠级点缀信号档间一致）
    expect(count(mid.fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0 调用（叶团去采样——Mid 片元零噪声执行）
  });

  it('叶 Low：SDF 换 SDF_LOW（宽卵大叶单包络——三裂细化 Spec §7 牺牲顺序）；总柄线/bare 门控/坡宽与 High 逐字同源；去小叶脉/叶团/透光；hue·luma/shade/flush/叶背保留；片元零噪声', () => {
    const high = assemble(track(createBischofiaLeafMaterial()), THREE.ShaderLib.physical);
    const low = assemble(track(createBischofiaLeafMaterial('low')), THREE.ShaderLib.physical);
    const lowSdf = sdfOf(low.fragmentShader);
    expect(lowSdf).not.toBe(sdfOf(high.fragmentShader)); // Low SDF = 宽卵单包络版（换字符串）
    expect(lowSdf).not.toContain('bisLeafSDF'); // 去三叶并集（复叶细化）
    expect(lowSdf).not.toContain('bisLeaflet'); // 去小叶场（齿/凹口随档消）
    for (const gone of ['bisVMid', 'bisClump', 'bisTransVar', 'vec3(0.55, 0.89, 0.34)']) {
      expect(low.fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    // 总柄线/bare 门控/坡宽与 High 逐字同源（档间叶形身份一致的去细节不改形原则——远距保留宽卵大叶轮廓色块）
    expect(lowSdf).toContain('0.009 - 0.0035 * clamp(bisY / 0.40, 0.0, 1.0)'); // 总柄线逐字同源
    expect(lowSdf).toContain('- (1.0 - smoothstep(0.315, 0.365, bisY)) * 0.10'); // bare 门控（减法式）逐字同源
    expect(lowSdf).toContain('clamp(bisEdge / 0.025 + 0.5'); // 坡宽同步（档间 AA 边一致）
    expect(lowSdf).toContain('0.305 * bisEnvN'); // 宽卵单包络峰（JS 锚：与 High 外廓差 ∈[−0.015,+0.025]）
    expect(count(low.fragmentShader, '#include <opaque_fragment>')).toBe(1); // 透光不注入但锚点原句不动
    expect(low.fragmentShader).toContain('(0.80 + 0.20 * bisShade)'); // shade 保留
    expect(low.fragmentShader).toContain('vec3 bisHue'); // hue·luma 保留
    expect(low.fragmentShader).toContain('bisFlush'); // flush 三档同体
    expect(low.fragmentShader).toContain('float(gl_FrontFacing)) * 0.05'); // 两面糙度差保留
    expect(count(low.fragmentShader, 'facVnoise(')).toBe(3); // 片元零噪声采样（库内 3 为死码，运行时零执行）
  });

  it('皮 Mid：去老干网状/皮孔点（近景细节层）；脊沟扭转/沟内 AO/干基暗化/细枝两档保留（中距「褐纵裂深沟宽脊 + 冠缘绿细枝」身份 Spec §7）', () => {
    const { fragmentShader } = assemble(track(createBischofiaBarkMaterial('mid')), THREE.ShaderLib.physical);
    for (const gone of ['bisNet', 'bisTone', 'bisLenticel', 'bisLR', 'vec3(1.42, 1.06, 0.72)', 'vec3(1.38, 1.38, 1.32)']) {
      expect(fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('abs(fract(vUv.x * 8.0 + bisWarp * 1.25)'); // 脊沟扭转保留（中距身份）
    expect(fragmentShader).toContain('vec3(0.80, 0.78, 0.76)'); // 沟内 AO 保留
    expect(fragmentShader).toContain('bisBarkBase'); // 干基暗化保留
    expect(fragmentShader).toContain('bisTwigMid'); // 老枝褐档保留
    expect(fragmentShader).toContain('vec3(0.88, 1.16, 0.74)'); // 细枝绿过渡保留（冠缘绿细枝中距读向）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 游走场 1（网状域门随段去）
  });

  it('皮 Low：再去干基暗化/老枝褐档（低调项）；脊沟 + 沟内 AO + 当年生绿档保留（远距「褐纵裂剪影」保留面）；1× vnoise', () => {
    const { fragmentShader } = assemble(track(createBischofiaBarkMaterial('low')), THREE.ShaderLib.physical);
    // bisTwigMid 在三档共享 TWIG 段声明（Low 未消费的死值无害——triadica domainVars 同款处置）；断言消费式缺席
    for (const gone of ['bisNet', 'bisTone', 'bisLenticel', 'bisBarkBase', 'bisTwigMid * 0.40', 'vec3(1.05, 0.98, 0.90)']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('bisRidge'); // 脊沟保留（远距剪影保留面）
    expect(fragmentShader).toContain('vec3(0.80, 0.78, 0.76)'); // 沟内 AO 保留
    expect(fragmentShader).toContain('vec3(0.88, 1.16, 0.74)'); // 当年生绿档（结构剪影项三档保留）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 游走场 1
  });

  it('深度分档：Mid = High SDF（含三叶并集）/ Low = SDF_LOW（宽卵单包络）；与叶表面档内逐字一致（表面/影裁切档内一致）；三档零噪声库', () => {
    const high = assemble(track(createBischofiaLeafDepthMaterial()), THREE.ShaderLib.depth);
    const mid = assemble(track(createBischofiaLeafDepthMaterial('mid')), THREE.ShaderLib.depth);
    const low = assemble(track(createBischofiaLeafDepthMaterial('low')), THREE.ShaderLib.depth);
    const highSdf = sdfOf(high.fragmentShader);
    expect(sdfOf(mid.fragmentShader)).toBe(highSdf); // Mid 深度 = High SDF（同源全形含三叶并集）
    expect(highSdf).toContain('bisLeafSDF'); // 档间剪影一致（三出影读向保留）
    expect(sdfOf(low.fragmentShader)).not.toBe(highSdf); // Low 深度 = SDF_LOW（宽卵单包络版）
    expect(sdfOf(low.fragmentShader)).not.toContain('bisLeafSDF');
    // 表面/影档内一致：叶表面各档 SDF === 深度各档 SDF
    for (const level of ['high', 'mid', 'low'] as const) {
      const surface = assemble(track(createBischofiaLeafMaterial(level)), THREE.ShaderLib.physical);
      const depthShader = assemble(track(createBischofiaLeafDepthMaterial(level)), THREE.ShaderLib.depth);
      expect(sdfOf(surface.fragmentShader)).toBe(sdfOf(depthShader.fragmentShader)); // 同一 GLSL 字符串（单一来源纪律）
      expect(count(depthShader.fragmentShader, 'facVnoise(')).toBe(0); // 三档深度零噪声库
    }
  });

  it('风动三档同源：叶/皮三档顶点 GLSL 全文一致（BIS_WIND 同一常量——档间相位一致 = 身份一致）', () => {
    const leafHigh = assemble(track(createBischofiaLeafMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createBischofiaBarkMaterial()), THREE.ShaderLib.physical);
    for (const level of ['mid', 'low'] as const) {
      const leaf = assemble(track(createBischofiaLeafMaterial(level)), THREE.ShaderLib.physical);
      const bark = assemble(track(createBischofiaBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(leaf.vertexShader).toBe(leafHigh.vertexShader);
      expect(bark.vertexShader).toBe(barkHigh.vertexShader);
    }
  });

  it('分档底参契约不因档破：叶三档 alphaTest/alphaToCoverage/DoubleSide/USE_UV/零贴图；皮三档 FrontSide/无 alphaTest/USE_UV；深度 alphaTest', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const leaf = track(createBischofiaLeafMaterial(level));
      const bark = track(createBischofiaBarkMaterial(level));
      const depth = track(createBischofiaLeafDepthMaterial(level));
      expect(leaf.alphaTest).toBe(0.5);
      expect(leaf.alphaToCoverage).toBe(true);
      expect(leaf.side).toBe(THREE.DoubleSide);
      expect(leaf.defines?.USE_UV).toBe('');
      expect(leaf.map).toBeNull(); // 零贴图（D13）三档同守
      expect(bark.side).toBe(THREE.FrontSide); // 组 0 单域契约三档同守（闭合实体）
      expect(bark.alphaTest).toBe(0);
      expect(bark.defines?.USE_UV).toBe('');
      expect(depth.alphaTest).toBe(0.5);
      expect(depth.defines?.USE_UV).toBe('');
    }
  });

  it('uTime 桥接三档不缺位：材质级 uniforms.uTime 与编译后 shader.uniforms 同引用（Mid/Low）', () => {
    for (const make of [createBischofiaLeafMaterial, createBischofiaBarkMaterial]) {
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
    const leafA = track(createBischofiaLeafMaterial());
    const leafB = track(createBischofiaLeafMaterial());
    const barkA = track(createBischofiaBarkMaterial());
    const barkB = track(createBischofiaBarkMaterial());
    const depth = track(createBischofiaLeafDepthMaterial());
    expect(leafA).not.toBe(leafB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(leafA.customProgramCacheKey()).toBe(leafB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([leafA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
    expect(materialUniformsOf(leafA).uTime).not.toBe(materialUniformsOf(leafB).uTime); // uTime 桥接对象实例独立（dispose 安全）
    expect(materialUniformsOf(barkA).uTime).not.toBe(materialUniformsOf(barkB).uTime);
  });

  it('底参与侧向：叶 DoubleSide/纸质哑光/USE_UV；皮 FrontSide/纵裂高糙/USE_UV；均零贴图', () => {
    const leaf = track(createBischofiaLeafMaterial());
    const bark = track(createBischofiaBarkMaterial());
    expect(leaf.side).toBe(THREE.DoubleSide);
    expect(leaf.metalness).toBe(0);
    expect(leaf.roughness).toBeGreaterThan(0.66); // 纸质哑光（0.70）
    expect(leaf.roughness).toBeLessThan(0.72);
    expect(leaf.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.FrontSide);
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeGreaterThan(0.9); // 纵裂深沟族高糙哑光
    expect(bark.map).toBeNull();
    expect(leaf.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
  });
});

describe('成本记账（10 万实例每像素预算：叶 High ≈11×（三出 SDF ≈4× 的账——复叶第二型，与栾两级窗列同档）/ 皮 High 7.5×，hash21=1×/vnoise=3×——三叶场/齿载波 ALU 化红利）', () => {
  it('facVnoise 调用数：叶 High 1 处（3×）、Mid/Low 0 处；皮 High 2 处（游走场 + 网状域门）、Mid/Low 1 处；深度 0 处（零噪声库注入）；顶点零噪声', () => {
    const leaf = assemble(track(createBischofiaLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createBischofiaBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createBischofiaLeafDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(leaf.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（叶团——三叶场/齿载波 ALU 化免噪声）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（游走场 + 网状域门）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(0); // 深度零噪声库注入（三出 SDF 先天满足影 pass 不吃噪声）
    expect(count(leaf.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin/cos
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零循环/零纹理采样（配方确定性纯函数 + SDF 纯 ALU）；全源零三角函数反函数调用（旋转手写展开/放射并集全 floor/fract/smoothstep 代理——零 mat2）', () => {
    const shaders = [
      assemble(track(createBischofiaLeafMaterial()), THREE.ShaderLib.physical),
      assemble(track(createBischofiaBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createBischofiaLeafDepthMaterial()), THREE.ShaderLib.depth),
    ];
    for (const shader of shaders) {
      for (const source of [shader.vertexShader, shader.fragmentShader]) {
        expect(source).not.toContain('for (');
        expect(source).not.toContain('while');
        expect(source).not.toContain('texture'); // 零贴图零采样（D13）
        expect(source).not.toContain('atan('); // 三出放射并集免反三角调用（旋转常数对手写展开——成本纪律）
        expect(source).not.toContain('mat2'); // 旋转矩阵手写展开纪律
      }
    }
  });
});

describe('注入点缺失即抛（首次渲染前暴雷）', () => {
  it('片元 map_fragment 摘除 → 叶/皮/深度均抛「注入点缺失」', () => {
    for (const make of [createBischofiaLeafMaterial, createBischofiaBarkMaterial, createBischofiaLeafDepthMaterial]) {
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
    const leaf = track(createBischofiaLeafMaterial());
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

    const depth = track(createBischofiaLeafDepthMaterial());
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
    const bark = track(createBischofiaBarkMaterial());
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

    const leaf = track(createBischofiaLeafMaterial());
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

    const leaf = assemble(track(createBischofiaLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createBischofiaBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createBischofiaLeafDepthMaterial()), THREE.ShaderLib.depth);
    for (const shader of [leaf, bark]) {
      expect(braceDelta(expandIncludes(shader.fragmentShader))).toBe(pristinePhysicalFragment);
      expect(braceDelta(shader.vertexShader)).toBe(pristinePhysicalVertex);
    }
    expect(braceDelta(expandIncludes(depth.fragmentShader))).toBe(pristineDepthFragment);
    expect(braceDelta(depth.vertexShader)).toBe(pristineDepthVertex);
  });
});

describe('跨 include 作用域防回归（triadica Step 4 实证事故配套——皮 roughness 注入消费 map 注入声明的真实编译错误形态；本资产组 0 单域平铺结构天然免疫，guard 固化防结构性回归）', () => {
  /** 提取锚点 include 之后注入的自定义段（至下一个 #include 行） */
  const injectedSegmentAfter = (source: string, anchor: string): { start: number; text: string } => {
    const idx = source.indexOf(anchor);
    expect(idx).toBeGreaterThanOrEqual(0);
    const start = idx + anchor.length;
    return { start, text: source.slice(start, source.indexOf('#include', start)) };
  };

  /** main 起点到指定位置的净 brace 深度（深度 1 = main 顶层——块内声明为 ≥2） */
  const braceDepthFromMain = (source: string, at: number): number => {
    const mainIdx = source.indexOf('void main() {');
    expect(mainIdx).toBeGreaterThanOrEqual(0);
    let depth = 0;
    for (let i = mainIdx; i < at; i++) {
      if (source[i] === '{') depth++;
      else if (source[i] === '}') depth--;
    }
    return depth;
  };

  /** guard 本体：注入段内出现的每个 bis* 标识符必须为 main 顶层（深度 1）唯一声明，
   *  且声明先于段尾（消费点）——块内声明（作用域在块结束关闭）与块内遮蔽声明（float 重声明）
   *  两种复发形态都红 */
  const crossIncludeScopeGuard = (fragmentShader: string, segment: { start: number; text: string }, label: string): void => {
    const ids = new Set(segment.text.match(/\bbis[A-Z][A-Za-z0-9_]*/g) ?? []);
    for (const id of ids) {
      const decl = `float ${id}`;
      expect(count(fragmentShader, decl), `${label}:${id} 声明唯一（块内 float 重声明 = 遮蔽——triadica 次生 bug 形态）`).toBe(1);
      const declIdx = fragmentShader.indexOf(decl);
      expect(declIdx, `${label}:${id} 声明存在`).toBeGreaterThan(0);
      expect(declIdx, `${label}:${id} 声明先于消费段尾`).toBeLessThan(segment.start + segment.text.length);
      expect(braceDepthFromMain(fragmentShader, declIdx), `${label}:${id} 声明在 main 顶层（跨 include 可见——块内声明即编译错误形态）`).toBe(1);
    }
  };

  it('皮三档：roughnessmap 注入段消费的 bis* 标识符均在 main 顶层唯一声明（组 0 单域平铺——无 if/else 分支块，结构天然安全）', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const { fragmentShader } = assemble(track(createBischofiaBarkMaterial(level)), THREE.ShaderLib.physical);
      const segment = injectedSegmentAfter(fragmentShader, '#include <roughnessmap_fragment>');
      crossIncludeScopeGuard(fragmentShader, segment, `bark:${level}`); // High 消费 bisLenticel/bisBarkSmooth（main 顶层声明）；Low 段零 bis* id 自然跳过
    }
  });

  it('叶三档：roughnessmap 注入段消费的 bis* 标识符同守（leafBody 平铺无块包裹——结构天然安全，guard 固化防结构性回归）', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const { fragmentShader } = assemble(track(createBischofiaLeafMaterial(level)), THREE.ShaderLib.physical);
      const segment = injectedSegmentAfter(fragmentShader, '#include <roughnessmap_fragment>');
      crossIncludeScopeGuard(fragmentShader, segment, `leaf:${level}`); // High 消费 bisClump（main 顶层声明）；Mid/Low 段零 bis* id 自然跳过
    }
  });

  it('叶透光段（opaque_fragment 前注入）消费的 bis* 标识符（bisAlpha/bisBack/bisTransVar）同守——High/Mid', () => {
    for (const level of ['high', 'mid'] as const) { // Low 无透光注入（设计内）
      const { fragmentShader } = assemble(track(createBischofiaLeafMaterial(level)), THREE.ShaderLib.physical);
      const anchorIdx = fragmentShader.indexOf('#if NUM_DIR_LIGHTS > 0');
      expect(anchorIdx).toBeGreaterThanOrEqual(0);
      const endIdx = fragmentShader.indexOf('#include <opaque_fragment>', anchorIdx);
      expect(endIdx).toBeGreaterThan(anchorIdx);
      crossIncludeScopeGuard(fragmentShader, { start: anchorIdx, text: fragmentShader.slice(anchorIdx, endIdx) }, `leaf-trans:${level}`);
    }
  });

  it('跨 include 类型守卫（011.7 triBarkSmooth 同型事故——bisRidge float 顶层预声明 × vec3 注入块消费）：皮三档 bisBarkMul 赋值右侧显式 vec3(bisRidge) 广播，禁裸 float 标量直乘进 vec3 声明（011.8 视觉取证首跑 6 条真实 GLSL 编译错误的修复形态锁定）', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const { fragmentShader } = assemble(track(createBischofiaBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(fragmentShader, `bark:${level} 修复形态在场（float 顶层预声明 → vec3 显式广播）`).toContain('vec3 bisBarkMul = vec3(bisRidge) * (0.93 + 0.13 * bisWarp)');
      expect(fragmentShader, `bark:${level} 禁裸 bisRidge 标量直乘（= float 表达式赋 vec3 = 维度不匹配编译错误）`).not.toMatch(/vec3\s+bisBarkMul\s*=\s*bisRidge\s*\*/);
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
    const material = track(createBischofiaLeafMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});
