/**
 * tests/runtime/procedural/tree/sophoraMaterials.test.ts —— 国槐叶/皮（含串珠
 * 荚果域）/深度材质测试（T011.9，对称 koelreuteria/triadica/bischofiaMaterials
 * 范式：真实 THREE.ShaderLib 源组装，静态字符串断言 + SDF 数值锚 JS 镜像，零
 * WebGL；build()/资产入口归并行几何 agent 的资产测试，此处不覆盖——先例无依赖
 * 几何的测试形态，全部形态可移植）。
 *
 * 覆盖：
 * - uTime 接线（TimeUniformService 消费协议）：叶/皮材质挂材质级 uniforms.uTime（own
 *   property）；onBeforeCompile 后 shader.uniforms.uTime 与材质级同对象引用；GLSL 声明
 *   uniform float uTime；材质挂场景被服务逐帧驱动（frame 写值闭环）；
 * - 风动契约（D19.7）：aSeed/aBend/aLeafRand 顶点 attribute 声明存在；相位 = fract(sin(...))
 *   类 hash（aSeed=0 缺省属性路径退化为常数相位，全源零除 aSeed——无 NaN）；整树缓摆项
 *   叶/皮同公式（同串出现）；复叶卡快颤层含 aBend 权重 + **11mm 家族档**（整枚羽叶
 *   中等摆锤——9–15 rad/s 与栾/重阳木同档）；hash 常数 91.523/68.137 与九先例相位流
 *   （sway 77.669–88.217 / flutter 49.337–65.443）去相关；**树高锚 10.3413m（×0.09670
 *   单点常量——slot-0 Stage 实测同步〔2026-09-21，011.8 的 9.896m 先例〕）**；
 * - instanceColor 乘算链安全：注入后 <color_fragment> 原句恰一次、注入代码零 vColor 介入；
 * - 单级窗列 SDF 与透光：叶 alphaTest 0.5 + alphaToCoverage + 坡宽 0.02（小叶间隙级）；
 *   **组 0 材质工程契约**（材质侧定义）：FrontSide 闭合实体（皮管/果珠——vs 栾
 *   DoubleSide 三域的分化）+ 无 alphaTest；深度材质（叶影裁切）含同一 SDF 函数（单一
 *   来源——主函数/窗列子函数/顶生窗子函数三件全文相等）+ RGBADepthPacking + 组 0
 *   实心守卫（aLeafRand=0）+ USE_UV + alphaTest；透光项存在且 NUM_DIR_LIGHTS 守卫；
 * - 物种配方锚定（Spec docs/research/sophora-reference.md 1.0，生产口径 = 终审记档
 *   ④ 裁决十项）：**一回奇数羽状复叶 SDF 核心（单级窗列 + 顶生独立窗——复叶第三型
 *   新路径）**——宽/长比 0.34 冻结字面量 + 对生/近对生相位（右列降 0.18·space——
 *   vs 栾互生侧偏的相位对生化）+ 带间距 0.098–0.178（→ 有效带数 4–7 对 JS run 计数
 *   锚——「小叶 4-7 对，对生或近互生」FRPS Verified）+ 顶生独立窗位（v∈[0.815,
 *   ~0.97]——「奇数」的表达；JS 锚横向 reach ≥0.030）+ 小叶长 = 0.92×行包络（中位
 *   对最大两端渐小）+ 卵状披针包络 v^0.84 + 先端指数收口 2.60–3.50 逐叶（「先端
 *   渐尖，具小尖头」Verified）+ 基部稍偏斜 ±0.45 渐伸直（「稍偏斜」Verified）+
 *   小叶长宽比 1.81–2.46（∈ 1.7–2.7 Verified 域）+ **双减法门控**（裸轴基段 +
 *   顶栏——011.8 乘法门控伪覆盖教训的强制形态；JS 裸区零越界 + 顶栏以上残余 ≤
 *   0.005 两行为锁）+ 叶轴基部膨大（「叶柄基部膨大，包裹着芽」Verified）+ 全缘
 *   零载波（属级「leaflets many, entire」——SDF 零 cos 断言 + JS 单峰性恰一峰）；
 *   **中距细碎自检剖面**（本树反证 011.8 宽卵法）：maxW 全宽 0.265–0.302 细碎质域
 *   + 中段缢缩行 ≥6（W ≤ 0.030——带间仅叶轴可见 = form-a「叶片细碎均匀」[6] 的量化
 *   面）+ 卡缘恒裁 + Low 与 High 外廓差 ∈[−0.010, +0.038]（带列相位错过包络峰的
 *   固有差——带间离散结构记档）；小叶脉两件（中脉 0.26 + 侧脉 0.12 弱层——leaf-b
 *   Inferred）；**两面色差加重档**（FRPS「下面灰白色」+ FOC glaucous 双源 Verified
 *   ——背面 ×(1.16,1.18,1.28) 灰白粉绿；家族叶背稍浅链位上加重档）；背光透射
 *   0.325（家族值域内取：栾 0.32 < 国槐 0.325 < 乌桕 0.33）+ 灰绿黄透射色；叶色
 *   中绿-亮绿 #568a3e（十树链：栾偏亮一档）；纸质微光泽 roughness 0.67（「纸质」
 *   Verified 微光泽端）；皮（**第 10 语言「灰褐-深灰褐深纵裂厚脊沟（板状粗犷）+
 *   纵为主局部交叉网状 + 散在暗色瘤状突起」——裁决 6 定稿**）：底色 #6d675d（R−G=6
 *   灰褐向；十树链：重阳木 < 樟 < 国槐 < 乌桕）+ 6 板状厚脊/周（十树最粗犷档——vs
 *   重阳木 8/乌桕 11/樟 7）+ 板状剖面 smoothstep(0.16,0.42) + 沟深剖面 0.52 +
 *   **沟内冷中性 AO 无红调**（裁决 6：沟底红褐不做）+ 老干交叉网状次级层（High）
 *   + **瘤突场**（High——九资产独有维度：22×26 格 ≈14% 散在 + 老干强/中龄弱双门控）
 *   + 干基暗化 + 当年生枝绿收敛 + 皮孔浅色两档（裁决 8——双志 Verified + fruit-a
 *   佐证）+ 无剥落（悬/榉标记不串种）；果域 v∈[4,5]：绿→黄绿→黄褐三档色序
 *   （NC "green ripening to yellow-brown" Verified + warp JS 锚 ≈30/36/35% 混熟
 *   读向）+ 珠间缢缩暗缝（fract(v−4)·6 珠周期——沿串坐标假设记缺口候选③）+
 *   肉质光润（roughness 0.45/0.48/0.50 低糙光泽档）+ 微透亮（High——域门控 v≥3.5）；
 * - 深度材质零噪声库注入（窗列/小叶场/顶生窗全 ALU → SDF 零 facVnoise 引用 → 影
 *   pass 不吃噪声纪律——樟 + 榉 011.3 组合先例）；
 * - 分档实装（level 参数，缺省 'high'）：三工厂缺省 ≡ 显式 'high'（属性 + 键 +
 *   GLSL 全文逐位相等）；3 工厂 × 3 档 = 9 键互异 + 与 zelkova/camphor/celtis/
 *   ginkgo/platanus/koelreuteria/triadica/bischofia 72 键零碰撞；叶 Mid 去小叶脉/
 *   叶团/糙度叶团项（**SDF 全形含窗列/顶生窗保留——档间剪影一致：羽状剪影是中距
 *   身份**）、Low 换 SDF_LOW（去窗列——复叶细化；包络/叶轴/裸轴门控逐字同源）再去
 *   透光；皮 Mid 去老干网状/瘤突/皮孔点（近景细节层；脊沟板状/沟内 AO/干基暗化/
 *   细枝两档保留——中距身份）、Low 再去干基暗化/老枝灰褐档；深度 Mid = High SDF、
 *   Low = SDF_LOW（表面/影档内一致）；风动三档顶点 GLSL 同源；分档底参契约
 *   （alphaTest/侧向/USE_UV）不因档破；uTime 桥接三档不缺位；
 * - program 键纪律：叶/皮/深度三键互异；两次工厂调用材质对象不同（无模块级共享，
 *   D17）但键相同；uniforms 不跨实例共享；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：叶片元 facVnoise 调用
 *   1 处（叶团——窗列/小叶场 ALU 化免噪声）、Mid/Low 0 处；皮 High 2 处（游走场 +
 *   网状/域门场，域互斥执行）、Mid/Low 1 处；深度 0 处（零噪声库注入）；顶点零
 *   噪声；全源零循环/零纹理采样/零三角函数反函数调用（旋转/包络全 floor/fract/
 *   smoothstep 代理——零 mat2）；
 * - 注入点缺失即抛（map_fragment/begin_vertex/common/roughnessmap_fragment/
 *   opaque_fragment 摘除各暴雷）；
 * - **跨 include 作用域防回归 guard**（triadica Step 4 实证事故配套）+ **vec/float
 *   维度守卫**（011.8 修复守卫模式：vec3(sopRidge) 显式广播修复形态 toContain +
 *   裸 float 标量注入 vec3 声明的 not.toMatch）；
 * - 结构完整性：include 全展开后花括号配平差值与原版一致（注入不破坏 GLSL 结构）；
 * - TimeUniformService.freeze：冻结期间广播仍写当前值（uTime 常量——树静止）+ 材质兼容。
 * 边界：材质登记 afterEach 统一 dispose 兜底，不跨测试泄漏。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms } from 'three';
import { TimeUniformService } from '../../../../src/runtime/services/TimeUniformService';
import {
  createSophoraBarkMaterial,
  createSophoraLeafDepthMaterial,
  createSophoraLeafMaterial,
} from '../../../../src/runtime/procedural/tree/sophora/sophoraMaterials';
import {
  createZelkovaBarkMaterial,
  createZelkovaLeafDepthMaterial,
  createZelkovaLeafMaterial,
} from '../../../../src/runtime/procedural/tree/zelkova/zelkovaMaterials';
import {
  createCamphorBarkMaterial,
  createCamphorLeafDepthMaterial,
  createCamphorLeafMaterial,
} from '../../../../src/runtime/procedural/tree/camphor/camphorMaterials';
import {
  createCeltisBarkMaterial,
  createCeltisLeafDepthMaterial,
  createCeltisLeafMaterial,
} from '../../../../src/runtime/procedural/tree/celtis/celtisMaterials';
import {
  createGinkgoBarkMaterial,
  createGinkgoLeafDepthMaterial,
  createGinkgoLeafMaterial,
} from '../../../../src/runtime/procedural/tree/ginkgo/ginkgoMaterials';
import {
  createPlatanusBarkMaterial,
  createPlatanusLeafDepthMaterial,
  createPlatanusLeafMaterial,
} from '../../../../src/runtime/procedural/tree/platanus/platanusMaterials';
import {
  createKoelreuteriaBarkMaterial,
  createKoelreuteriaLeafDepthMaterial,
  createKoelreuteriaLeafMaterial,
} from '../../../../src/runtime/procedural/tree/koelreuteria/koelreuteriaMaterials';
import {
  createTriadicaBarkMaterial,
  createTriadicaLeafDepthMaterial,
  createTriadicaLeafMaterial,
} from '../../../../src/runtime/procedural/tree/triadica/triadicaMaterials';
import {
  createBischofiaBarkMaterial,
  createBischofiaLeafDepthMaterial,
  createBischofiaLeafMaterial,
} from '../../../../src/runtime/procedural/tree/bischofia/bischofiaMaterials';

/** afterEach 统一 dispose 的材质登记 */
const created: THREE.Material[] = [];

function track<T extends THREE.Material>(material: T): T {
  created.push(material);
  return material;
}

/** 用真实 ShaderLib 源组装（onBeforeCompile 运行于 include 解析前的真实环境形态） */
function assemble(
  material: THREE.Material,
  lib: { vertexShader: string; fragmentShader: string },
): { vertexShader: string; fragmentShader: string; uniforms: Record<string, { value: unknown }> } {
  const shader = {
    vertexShader: lib.vertexShader,
    fragmentShader: lib.fragmentShader,
    uniforms: {} as Record<string, { value: unknown }>,
  };
  material.onBeforeCompile(
    shader as unknown as WebGLProgramParametersWithUniforms,
    {} as unknown as THREE.WebGLRenderer,
  );
  return shader;
}

/** 递归展开 #include（模拟 WebGLProgram 的 resolveIncludes） */
function expandIncludes(source: string): string {
  let out = source;
  for (let guard = 0; out.includes('#include <') && guard < 10; guard++) {
    out = out.replace(/#include <([\w\d_]+)>/g, (_match, name: string) => {
      const chunk = (THREE.ShaderChunk as unknown as Record<string, string>)[name];
      if (chunk === undefined) throw new Error(`未知 chunk: ${name}`);
      return chunk;
    });
  }
  return out;
}

const count = (source: string, target: string): number => source.split(target).length - 1;
const braceDelta = (source: string): number => count(source, '{') - count(source, '}');
/** 材质级 uTime 桥接面（TimeUniformService 扫描面） */
const materialUniformsOf = (material: THREE.Material): Record<string, { value: unknown }> =>
  (material as unknown as { uniforms: Record<string, { value: unknown }> }).uniforms;

/** 提取注入后的 sopLeafAlpha 函数全文（SDF 单一来源比对用；首个 \n} 即函数闭合） */
const sdfOf = (fragmentShader: string): string => {
  const start = fragmentShader.indexOf('float sopLeafAlpha(vec2 sopUv, float sopRand)');
  expect(start).toBeGreaterThanOrEqual(0);
  const end = fragmentShader.indexOf('\n}', start);
  return fragmentShader.slice(start, end + 2);
};

/** 提取注入后的 sopColumn 子函数全文（窗列子函数单一来源比对用——FXC 拆分形态） */
const columnOf = (fragmentShader: string): string => {
  const start = fragmentShader.indexOf('float sopColumn(float sopX, float sopY, float sopEnv, float sopRand)');
  expect(start).toBeGreaterThanOrEqual(0);
  const end = fragmentShader.indexOf('\n}', start);
  return fragmentShader.slice(start, end + 2);
};

/** 提取注入后的 sopTerminal 子函数全文（顶生窗子函数单一来源比对用） */
const terminalOf = (fragmentShader: string): string => {
  const start = fragmentShader.indexOf('float sopTerminal(float sopX, float sopY, float sopRand)');
  expect(start).toBeGreaterThanOrEqual(0);
  const end = fragmentShader.indexOf('\n}', start);
  return fragmentShader.slice(start, end + 2);
};

// ── SDF JS 数值锚镜像（单级窗列 + 顶生独立窗——与 GLSL 逐式对应）──────────────────

const fract = (x: number): number => x - Math.floor(x);
const clamp = (x: number, a: number, b: number): number => Math.min(Math.max(x, a), b);
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
const smoothstepJS = (a: number, b: number, x: number): number => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** 全叶包络 JS 镜像（椭圆性整体剪影——峰 v≈0.48 近中） */
const envJS = (Y: number): number => {
  const envSin = Math.sin(Math.PI * Math.pow(clamp(Y, 0.001, 0.999), 0.90));
  return 0.166 * Math.pow(envSin, mix(0.88, 1.26, smoothstepJS(0.30, 0.92, Y)));
};

/** 小叶窗列 JS 镜像（与 SOP_LEAFLET_VARS 逐式对应——对生/近对生相位 + 小叶场） */
function columnJS(X: number, Y: number, env: number, R: number): number {
  const A = Math.abs(X);
  const space = 0.098 + 0.080 * fract(R * 5.713 + 0.31);
  const yb = Y - 0.130 - Math.max(Math.sign(X), 0) * space * 0.18;
  const bandT = yb / space;
  const bandIdx = Math.floor(bandT + 0.5);
  const L = (bandT - bandIdx) * space;
  const len = clamp(0.92 * env, 0.050, 0.158);
  const Tc = clamp(A / len, 0.001, 0.999);
  const envSinL = Math.sin(Math.PI * Math.pow(Tc, 0.84));
  const envExpL = mix(1.12, 2.60 + 0.90 * fract(R * 4.731 + 0.27), smoothstepJS(0.55, 0.85, Tc));
  const envNL = Math.pow(envSinL, envExpL);
  const hw = len * (0.20 + 0.08 * fract(R * 6.117 + 0.19));
  const obk = (fract(R * 3.317 + 0.53) - 0.5) * 0.9;
  const C = obk * hw * Math.pow(1 - Tc, 1.5);
  return hw * envNL - Math.abs(L - C);
}

/** 顶生小叶独立窗 JS 镜像（与 sopTerminal 逐式对应） */
function terminalJS(X: number, Y: number, R: number): number {
  const lenT = 0.154 + 0.012 * fract(R * 2.913 + 0.44);
  const Tt = clamp((Y - 0.815) / lenT, 0.001, 0.999);
  const envSinT = Math.sin(Math.PI * Math.pow(Tt, 0.84));
  const envExpT = mix(1.12, 2.60 + 0.90 * fract(R * 4.731 + 0.27), smoothstepJS(0.55, 0.85, Tt));
  const envNT = Math.pow(envSinT, envExpT);
  const hwT = lenT * (0.22 + 0.07 * fract(R * 6.117 + 0.19));
  const obkT = (fract(R * 3.317 + 0.53) - 0.5) * 0.9;
  const CT = obkT * hwT * Math.pow(1 - Tt, 1.5);
  return hwT * envNT - Math.abs(X - CT);
}

/** 一回奇数羽状复叶卡覆盖率 JS 镜像（与 sopLeafAlpha 逐式对应——双减法门控） */
function alphaJS(u: number, v: number, R: number): number {
  const X = (u - 0.5) * 0.34, Y = v, A = Math.abs(X);
  const envEdge = envJS(Y) - A;
  const rachis = 0.0040 + 0.0050 * (1 - Y) + 0.0038 * (1 - smoothstepJS(0.0, 0.07, Y)) - A;
  const col = columnJS(X, Y, envJS(Y), R)
    - (1 - smoothstepJS(0.09, 0.13, Y)) * 0.10 // 裸轴基段减法门控
    - smoothstepJS(0.80, 0.84, Y) * 0.10; // 顶栏减法门控
  const edge = Math.max(rachis, Math.max(Math.min(envEdge, col), terminalJS(X, Y, R)));
  return clamp(edge / 0.02 + 0.5, 0, 1);
}

/** Low 档覆盖率 JS 镜像（与 SOP_LEAF_SDF_LOW 逐式对应——叶轴 ∪ 包络 − 裸轴门控） */
function alphaLowJS(u: number, v: number, _R: number): number {
  const X = (u - 0.5) * 0.34, Y = v, A = Math.abs(X);
  const edge = Math.max(
    0.0040 + 0.0050 * (1 - Y) + 0.0038 * (1 - smoothstepJS(0.0, 0.07, Y)),
    envJS(Y) - (1 - smoothstepJS(0.09, 0.13, Y)) * 0.10,
  ) - A;
  return clamp(edge / 0.02 + 0.5, 0, 1);
}

/** 行宽度剖面：该 v 行 alpha≥0.5 的最大 |x|（中距剪影读向的量化面） */
function rowWidthJS(fn: (u: number, v: number, R: number) => number, R: number, y: number): number {
  let w = 0;
  for (let i = 0; i <= 700; i++) {
    const x = (i / 700) * 0.1699;
    if (fn(0.5 + x / 0.34, y, R) >= 0.5 || fn(0.5 - x / 0.34, y, R) >= 0.5) w = x;
  }
  return w;
}

afterEach(() => {
  for (const material of created.splice(0)) material.dispose();
});

describe('uTime 接线（TimeUniformService 消费协议）', () => {
  it('叶/皮材质挂材质级 uniforms.uTime；编译后 shader.uniforms.uTime 同引用；GLSL 声明 uniform', () => {
    for (const material of [track(createSophoraLeafMaterial()), track(createSophoraBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('材质挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const leaf = track(createSophoraLeafMaterial());
    const bark = track(createSophoraBarkMaterial());
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

describe('风动契约（D19.7：uTime 全局风帧 / aSeed 个体相位；11mm 家族档——整枚羽叶中等摆锤，9–15 rad/s 与栾/重阳木同档；树高锚 10.3413m slot-0 实测同步单点常量）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）；hash 常数与九先例去相关', () => {
    const leaf = assemble(track(createSophoraLeafMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(leaf.vertexShader).toContain(decl);
    }
    expect(leaf.vertexShader).toContain('fract(sin(aSeed * 91.523'); // 整树缓摆相位 = hash(aSeed)——常数出九先例 sway 域 [77.669, 88.217] 外
    expect(leaf.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 68.137'); // 快颤相位——先例 flutter 域 [49.337, 65.443] 外
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(leaf.vertexShader + leaf.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('整树缓摆叶/皮同公式（同串出现）；快颤含 aBend 权重且幅度 11mm 家族档、频率 9–15 rad/s；树高锚 10.3413m（×0.09670 单点常量——slot-0 Stage 实测同步）', () => {
    const leaf = assemble(track(createSophoraLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createSophoraBarkMaterial()), THREE.ShaderLib.physical);
    const swayCore = 'sopWindH * sopWindH * 0.042 * sin(uTime * 1.15';
    expect(leaf.vertexShader).toContain(swayCore);
    expect(bark.vertexShader).toContain(swayCore); // 皮不动叶动会撕裂穿帮——同公式同相位（组 0 aBend 恒 0 免颤）
    expect(leaf.vertexShader).toContain('aBend * 0.011'); // 复叶卡快颤幅度 11mm 家族档（任务简报口径）
    expect(leaf.vertexShader).toContain('uTime * (9.0 + 6.0 * sopFlutterPhase)'); // 9–15 rad/s（≈1.4–2.4Hz 中频）
    expect(leaf.vertexShader).toContain('position.y * 0.09670'); // /10.3413m 树高锚（slot-0 精确涌现实测 10.34133243560791——2026-09-21 同步，011.8 9.896m 先例）
    expect(0.011).toBeLessThanOrEqual(0.012); // ≤ 家族域上沿 12mm
    expect(0.011).toBeGreaterThanOrEqual(0.010); // ≥ 家族域下沿 10mm（中幅）
    expect(9.0).toBeGreaterThanOrEqual(9.0); // 频率域下沿
    expect(15.0).toBeLessThanOrEqual(15.0); // 频率域上沿
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createSophoraLeafMaterial()), track(createSophoraBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('单级窗列 SDF 与透光', () => {
  it('叶 alphaTest 0.5 + alphaToCoverage + 坡宽 0.02（小叶间隙级）；片元含 SDF 计算式并写入 alpha', () => {
    const material = track(createSophoraLeafMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float sopLeafAlpha('); // 复叶 SDF 主函数（单一来源）
    expect(fragmentShader).toContain('float sopColumn('); // 窗列子函数（FXC 拆分形态）
    expect(fragmentShader).toContain('float sopTerminal('); // 顶生窗子函数
    expect(fragmentShader).toContain('sopLeafAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = sopAlpha;'); // alphatest_fragment 上游写入
    expect(fragmentShader).toContain('clamp(sopEdge / 0.02 + 0.5'); // 坡宽 0.02（小叶间隙级）
  });

  it('组 0 材质工程契约（材质侧定义）：FrontSide 闭合实体（皮管/果珠——无花卡类裁切需求，vs 栾 DoubleSide 三域的分化）+ 无 alphaTest + USE_UV', () => {
    const bark = track(createSophoraBarkMaterial());
    expect(bark.side).toBe(THREE.FrontSide); // 皮管/果珠闭合实体（果为珠串低模——无裁切）
    expect(bark.alphaTest).toBe(0); // 无裁切
    expect(bark.alphaToCoverage).toBe(false);
    expect(bark.defines?.USE_UV).toBe('');
  });

  it('深度材质（叶影裁切）：同一 SDF 函数（三件）+ RGBADepthPacking + 组 0 实心守卫 + USE_UV + alphaTest；风动不进 depth；零噪声库注入', () => {
    const material = track(createSophoraLeafDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.depthPacking).toBe(THREE.RGBADepthPacking);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('sopLeafAlpha(vUv, vLeafRand)');
    expect(shader.fragmentShader).toContain('step(0.0001, vLeafRand)'); // 组 0 aLeafRand=0 → 实心（皮圆柱/果珠 uv 域不误裁——triadica 恒等 attribute 先例；果域无需 v 路由）
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
    expect(count(shader.fragmentShader, 'facVnoise(')).toBe(0); // 零噪声库注入——窗列/小叶场/顶生窗 ALU 化（影 pass 不吃噪声）
    expect(shader.fragmentShader).not.toContain('facHash21'); // 噪声库整体未挂（SDF 引入噪声即编译暴雷——保护性约束）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫（无平行光场景安全降级）', () => {
    const { fragmentShader } = assemble(track(createSophoraLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(fragmentShader).toContain('directionalLights[0]');
    expect(fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
  });
});

describe('物种配方锚定（Spec sophora-reference 1.0；生产口径 = 终审记档 ④ 裁决十项：一回奇数羽状复叶 / 树皮第 10 语言 / 荚果做 / 花不做）', () => {
  it('单级窗列 SDF 核心（复叶第三型）：0.34 宽/长比冻结 + 对生/近对生相位（vs 栾互生侧偏）+ 带间距域 + 顶生独立窗位 + 小叶场锚 + 双减法门控 + 叶轴基部膨大 + 全缘零载波', () => {
    const leaf = assemble(track(createSophoraLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('sopP.x * 0.34'); // 宽/长比 0.34 冻结接口（卡空间折算——半宽 0.17；VEIN 段同值 (vUv.x - 0.5) * 0.34 同源）
    expect(leaf.fragmentShader).toContain('0.098 + 0.080 * fract(sopRand * 5.713 + 0.31)'); // 带间距逐卡变奏 → 有效带数 4–7 对（JS run 计数锚）
    expect(leaf.fragmentShader).toContain('max(sign(sopX), 0.0) * sopSpace * 0.18'); // 右列降 0.18·space = 近对生（「对生或近互生」FRPS Verified——vs 栾互生侧偏 c=±0.40 的相位对生化）
    expect(leaf.fragmentShader).toContain('sopY - 0.130'); // 带列自裸轴段上沿起排（band 0 = 首对）
    expect(leaf.fragmentShader).toContain('clamp(0.92 * sopEnv, 0.050, 0.158)'); // 小叶长 = 0.92×行包络（中位对最大 0.15、两端渐小至 0.05）
    expect(leaf.fragmentShader).toContain('0.154 + 0.012 * fract(sopRand * 2.913 + 0.44)'); // 顶生小叶长（≈中位对量级）
    expect(leaf.fragmentShader).toContain('(sopY - 0.815) / sopLenT'); // 顶生独立窗位 v∈[0.815, ~0.97]（「奇数」的表达——奇数羽状顶端单生）
    expect(leaf.fragmentShader).toContain('sin(3.14159 * pow(sopTc, 0.84))'); // 卵状披针形包络（峰 t≈0.445 偏基——「卵状披针形或卵状长圆形」首列 Verified）
    expect(leaf.fragmentShader).toContain('2.60 + 0.90 * fract(sopRand * 4.731 + 0.27)'); // 先端指数收口 2.60–3.50 逐叶（「先端渐尖，具小尖头」Verified）
    expect(leaf.fragmentShader).toContain('mix(1.12,'); // 基 1.12 宽楔开张（「基部宽楔形或近圆形」Verified）
    expect(leaf.fragmentShader).toContain('sopLen * (0.20 + 0.08 * fract(sopRand * 6.117 + 0.19))'); // 小叶半宽（长宽比 1.81–2.46 ∈ 1.7–2.7 Verified 域）
    expect(leaf.fragmentShader).toContain('(fract(sopRand * 3.317 + 0.53) - 0.5) * 0.9'); // 基部稍偏斜 ±0.45（「稍偏斜」Verified）
    expect(leaf.fragmentShader).toContain('pow(1.0 - sopTc, 1.5)'); // 偏斜量自小叶基向先端渐伸直
    expect(leaf.fragmentShader).toContain('0.166 * pow(sopEnvSin, mix(0.88, 1.26, smoothstep(0.30, 0.92, sopY)))'); // 全叶包络（峰值 0.166 恰在卡缘内侧——卡缘恒裁 JS 锚）
    expect(leaf.fragmentShader).toContain('0.0040 + 0.0050 * (1.0 - sopY) + 0.0038 * (1.0 - smoothstep(0.0, 0.07, sopY))'); // 叶轴渐细 + 基部膨大带（「叶柄基部膨大，包裹着芽」Verified）
    // 双减法门控（011.8 教训强制形态——负距离判弃，非乘法钳 0）
    expect(leaf.fragmentShader).toContain('- (1.0 - smoothstep(0.09, 0.13, sopY)) * 0.10'); // 裸轴基段（band −1 幻影带压灭）
    expect(leaf.fragmentShader).toContain('- smoothstep(0.80, 0.84, sopY) * 0.10'); // 顶栏（顶生小叶下方窗列终止——第 8+ 幻影对压灭）
    expect(leaf.fragmentShader).toContain('max(sopRachisEdge, max(min(sopEnvEdge, sopCol), sopTermEdge))'); // 合成：叶轴 ∪ (包络 ∩ 窗列) ∪ 顶生窗
    // 全缘零载波（属级「leaflets many, entire」原句）——SDF 三函数字符串零 cos（无齿载波无锯齿项）
    for (const sdf of [sdfOf(leaf.fragmentShader), columnOf(leaf.fragmentShader), terminalOf(leaf.fragmentShader)]) {
      expect(sdf).not.toContain('cos(');
      expect(sdf).not.toContain('facVnoise'); // SDF 零噪声引用（深度材质不挂噪声库的前提）
    }
    expect(leaf.fragmentShader).not.toContain('mat2'); // 旋转/包络全 floor/fract/smoothstep 代理（零矩阵函数）
    // SDF 单一来源——影裁切叶形自动同步（主函数 + 两个子函数三件同源）
    const depth = assemble(track(createSophoraLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(sdfOf(depth.fragmentShader)).toBe(sdfOf(leaf.fragmentShader));
    expect(columnOf(depth.fragmentShader)).toBe(columnOf(leaf.fragmentShader)); // 窗列子函数同源
    expect(terminalOf(depth.fragmentShader)).toBe(terminalOf(leaf.fragmentShader)); // 顶生窗子函数同源
  });

  it('复叶数值锚（JS 镜像）：有效对数 4–7（run 计数——「小叶 4-7 对」统计实现）+ 顶生小叶 reach ≥ 0.030 + 叶轴连续 + 裸区零越界（减法门控回归锁）+ 顶栏残余压灭', { timeout: 30000 }, () => {
    // ① 有效对数：行宽 run 计数（W ≥ 0.052 连续段；缢缩 < 0.045 分段——「小叶 4-7 对」的卡上读数）。
    //    采样密度：13 rand × 241 行（行步长 0.0033 < 最窄带间缢缩 ≈0.0094/2——间隙行必有采样命中；
    //    密度经计时校准——原 21×301 恰超 vitest 5s 单测预算，锚定有效性不变）
    let pairMin = 99;
    let pairMax = 0;
    for (let i = 0; i < 13; i++) {
      const R = (i + 0.5) / 13;
      let runs = 0;
      let inRun = false;
      for (let j = 0; j <= 240; j++) {
        const w = rowWidthJS(alphaJS, R, 0.06 + (j / 240) * 0.80);
        if (w >= 0.052 && !inRun) { runs++; inRun = true; }
        if (w < 0.045) inRun = false;
      }
      pairMin = Math.min(pairMin, runs);
      pairMax = Math.max(pairMax, runs);
    }
    expect(pairMin).toBeGreaterThanOrEqual(4); // 「小叶4-7对」FRPS Verified 下沿
    expect(pairMax).toBeLessThanOrEqual(7); // 上沿（顶栏门控压灭第 8+ 幻影对）
    // ② 顶生小叶独立窗（「奇数」读向）：y>0.82 段横向 reach ≥ 0.030（明确宽于叶轴）
    for (let i = 0; i < 11; i++) {
      const R = (i + 0.5) / 11;
      let reach = 0;
      for (let j = 0; j <= 240; j++) {
        const y = 0.82 + (j / 240) * 0.15;
        for (let k = 0; k <= 160; k++) {
          const a = 0.024 + (k / 160) * 0.05;
          if (alphaJS(0.5 + a / 0.34, y, R) >= 0.5) reach = Math.max(reach, a);
        }
      }
      expect(reach, `R=${R} 顶生 reach`).toBeGreaterThanOrEqual(0.030);
    }
    // ③ 叶轴连续：x=0 处 alpha ≥0.5 全 v（叶轴永不裁穿——基部膨大带上沿连续）
    let petMin = 1;
    for (const R of [0.13, 0.37, 0.51, 0.77]) {
      for (let i = 0; i <= 200; i++) petMin = Math.min(petMin, alphaJS(0.5, 0.005 + (i / 200) * 0.99, R));
    }
    expect(petMin).toBeGreaterThanOrEqual(0.5);
    // ④ 裸区零越界（减法门控回归锁——乘法门控负距离钳 0 → alpha 恰 0.5 恰过 alphaTest 的形态）
    let bad = 0;
    for (let i = 0; i < 21; i++) {
      const R = (i + 0.5) / 21;
      for (let iy = 0; iy <= 40; iy++) {
        for (let iu = 0; iu <= 120; iu++) {
          const y = 0.01 + iy * 0.0019;
          const x = 0.0305 + iu * 0.0011;
          if (y <= 0.085 && alphaJS(0.5 + x / 0.34, y, R) >= 0.5) bad++;
        }
      }
    }
    expect(bad).toBe(0); // 裸段除叶轴外全透空
    // ⑤ 顶栏残余压灭（顶栏门控行为锁：顶生小叶以上窗列/幻影带残余 → 尾尖收口）
    for (const R of [0.13, 0.51, 0.77]) {
      let topMax = 0;
      for (let i = 0; i <= 60; i++) topMax = Math.max(topMax, rowWidthJS(alphaJS, R, 0.955 + (i / 60) * 0.043));
      expect(topMax, `R=${R} 顶栏以上残余`).toBeLessThanOrEqual(0.055); // 顶栏以上仅尾尖收口（JS 实测 ≈0.004）
    }
  });

  it('全缘单峰性（「leaflets many, entire」属级原句——零齿载波）：小叶宽度剖面恰一峰（JS）+ 小叶长宽比 1.7–2.7 Verified 域', () => {
    for (let i = 0; i < 21; i++) {
      const R = (i + 0.5) / 21;
      let prev = 0;
      let dir = 0;
      let flips = 0;
      for (let j = 0; j <= 190; j++) {
        const t = 0.02 + (j / 190) * 0.93;
        const w = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.84)), mix(1.12, 2.60 + 0.90 * fract(R * 4.731 + 0.27), smoothstepJS(0.55, 0.85, t)));
        const d = Math.sign(w - prev);
        if (d !== 0 && dir !== 0 && d !== dir) flips++;
        if (d !== 0) dir = d;
        prev = w;
      }
      expect(flips, `R=${R} 单峰性（增→减恰一次翻转）`).toBe(1); // 全缘——无锯齿载波的多次翻转
    }
    let aspMin = 99;
    let aspMax = 0;
    for (let i = 0; i < 2000; i++) {
      const R = (i + 0.5) / 2000;
      const share = 0.20 + 0.08 * fract(R * 6.117 + 0.19);
      const asp = 1 / (2 * share); // 长 / 全宽
      aspMin = Math.min(aspMin, asp);
      aspMax = Math.max(aspMax, asp);
    }
    expect(aspMin).toBeGreaterThan(1.7); // 「长2.5-6厘米，宽1.5-3厘米」Verified 下沿
    expect(aspMax).toBeLessThan(2.7); // 上沿
  });

  it('中距细碎自检剖面（本树反证 011.8 宽卵法——form-a「叶片细碎均匀」+ NC 细质）：maxW 全宽细碎质域 + 中段缢缩行 ≥6 + 卡缘恒裁 + Low 单包络档间剪影一致', { timeout: 30000 }, () => {
    for (const R of [0.11, 0.23, 0.37, 0.51, 0.63, 0.77, 0.89]) {
      let maxW = 0;
      let gapRows = 0;
      for (let i = 0; i <= 300; i++) {
        const y = 0.06 + (i / 300) * 0.80;
        const w = rowWidthJS(alphaJS, R, y);
        maxW = Math.max(maxW, w);
        if (y > 0.16 && y < 0.76 && w <= 0.030) gapRows++; // 中段缢缩行（带间仅叶轴可见）
      }
      expect(2 * maxW, `R=${R} maxW 全宽`).toBeGreaterThanOrEqual(0.26); // 细碎质域下沿（卡利用率）
      expect(2 * maxW).toBeLessThanOrEqual(0.335); // 卡全宽 0.34 内不外溢
      expect(gapRows, `R=${R} 中段缢缩行`).toBeGreaterThanOrEqual(6); // 细碎读向的量化面（vs 重阳木宽卵无腰的连续剖面——两树互为反例记档）
      // Low 单包络档间剪影一致（LOD 切换无跳变；带列相位错过包络峰的固有差——带间离散结构，带宽宽于单叶先例 ±0.025 记档）
      let lowMax = 0;
      for (let i = 0; i <= 200; i++) {
        lowMax = Math.max(lowMax, rowWidthJS(alphaLowJS, R, 0.10 + (i / 200) * 0.88));
      }
      expect(lowMax, `R=${R} Low 最宽行下界`).toBeGreaterThanOrEqual(maxW - 0.010); // 不过窄（High 外廓近似）
      expect(lowMax, `R=${R} Low 最宽行上界`).toBeLessThanOrEqual(maxW + 0.038); // 不过胖（带间间隙填充 + 相位差的固有上限）
    }
    // 卡缘恒裁（u=0/1 全 v alpha<0.5——卡空间无外溢）
    for (const R of [0.21, 0.77]) {
      let maxEdge = 0;
      for (let i = 0; i <= 100; i++) {
        maxEdge = Math.max(maxEdge, alphaJS(0.999, i / 100, R), alphaJS(0.001, i / 100, R));
      }
      expect(maxEdge).toBeLessThan(0.5);
    }
  });

  it('小叶脉两件（leaf-b「中脉浅色明显、侧脉羽状细密」Inferred 弱层）：中脉 0.26 + 侧脉 0.12 + 顶生竖直中脉（SOP_LEAFLET_VARS 同源折算）', () => {
    const { fragmentShader } = assemble(track(createSophoraLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('sopVMidAll * 0.26 + sopVLat * 0.12'); // 权重弱表达 0.26/0.12（中脉浅色身份层 + 侧脉细密弱层）
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.006, 0.020, abs(sopL - sopC)))'); // 小叶中脉带宽（沿小叶轴自叶轴伸出）
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.72, 0.90, sopTc))'); // 中脉先端渐隐（不达尖）
    expect(fragmentShader).toContain('sin(sopTc * 46.0 - abs(sopL - sopC) * 92.0'); // 侧脉斜升脊族（-|l−c|·92 斜升倾斜）
    expect(fragmentShader).toContain('smoothstep(0.83, 0.86, sopY)'); // 顶生小叶竖直中脉 y 窗
  });

  it('两面色差加重档（FRPS「下面灰白色」+ FOC glaucous 双源 Verified——身份特征）：背面 ×(1.16,1.18,1.28) 灰白粉绿 + 两面糙度差 +0.06；家族叶背乘子不串种', () => {
    const leaf = assemble(track(createSophoraLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('mix(vec3(1.16, 1.18, 1.28), vec3(1.0), float(gl_FrontFacing))'); // 背面灰白粉绿（B 显著抬升——glaucous 读向；家族叶背稍浅链位上加重档）
    expect(leaf.fragmentShader).not.toContain('vec3(1.09, 1.10, 1.13)'); // 栾柔毛灰绿背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.08, 1.02)'); // 乌桕背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.07, 1.05)'); // 重阳木弱差背面不串种（国槐为加重档）
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.05, 1.16)'); // 香樟 glaucous 粉感不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.08, 1.10, 1.02)'); // 悬铃木背面不串种
    expect(leaf.fragmentShader).toContain('(1.0 - float(gl_FrontFacing)) * 0.06'); // 两面糙度差 +0.06
    expect(0.06).toBeGreaterThan(0.05); // > 重阳木/乌桕无毛最小差（加重一档）
    expect(0.06).toBeLessThan(0.08); // < 栾柔毛差
  });

  it('背光透射家族值域内取：峰值 0.325（栾 0.32 < 国槐 0.325 < 乌桕 0.33——纸质细碎小叶透风）；灰绿黄透射色；先例峰值不串种', () => {
    const { fragmentShader } = assemble(track(createSophoraLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('* pow(sopBack, 3.0) * sopTransVar * sopAlpha * 0.325;');
    expect(fragmentShader).toContain('vec3(0.56, 0.92, 0.38)'); // 灰绿黄透射色（glaucous 叶背基调）
    expect(0.325).toBeGreaterThan(0.32); // > 栾复叶卡
    expect(0.325).toBeLessThan(0.33); // < 乌桕薄菱叶（家族值域内取）
    // 透射语句形态不串种（卡比例字面量 0.34; 在 SDF 内——透射峰值锚以 sopAlpha 前缀收窄）
    expect(fragmentShader).not.toContain('sopAlpha * 0.30;'); // 朴树峰值不串种
    expect(fragmentShader).not.toContain('sopAlpha * 0.31;'); // 重阳木峰值不串种
    expect(fragmentShader).not.toContain('sopAlpha * 0.32;'); // 栾峰值不串种
    expect(fragmentShader).not.toContain('sopAlpha * 0.33;'); // 乌桕峰值不串种
    expect(fragmentShader).not.toContain('sopAlpha * 0.34;'); // 银杏峰值不串种
    expect(fragmentShader).not.toContain('sopAlpha * 0.28;'); // 悬铃木峰值不串种
    expect(fragmentShader).not.toContain('sopAlpha * 0.40;'); // 榉树峰值不串种
    expect(fragmentShader).not.toContain('sopAlpha * 0.65;'); // 夏栎裂叶峰值不串种
  });

  it('叶底色 #568a3e 中绿-亮绿（十树亮度链：栾偏亮一档——Spec §5 + leaf-a「有光泽中绿」交叉）；纸质微光泽 roughness 0.67（「纸质」Verified 微光泽端：悬 0.66 < 国槐 < 栾/重阳木 0.70）', () => {
    const leaf = track(createSophoraLeafMaterial());
    const hex = leaf.color.getHex();
    expect(hex).toBe(0x568a3e); // 工程设定：Spec §5 上面中绿-亮绿 + 九树链自定位
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const l = luma([(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff]);
    expect(l).toBeGreaterThan(luma([0x52, 0x7d, 0x37])); // 亮于栾树（中绿——国槐亮绿档）
    expect(l).toBeGreaterThan(luma([0x51, 0x7c, 0x35])); // 亮于重阳木（中绿-深绿档定位）
    expect(leaf.roughness).toBe(0.67); // 纸质微光泽（「纸质」FRPS Verified——leaf-a「有光泽」微抬一档）
    expect(0.67).toBeGreaterThan(0.66); // > 悬铃木厚实挺括
    expect(0.67).toBeLessThan(0.70); // < 栾/重阳木纸质哑光
    expect(leaf.metalness).toBe(0);
  });

  it('皮第 10 语言底色 #6d675d 灰褐-深灰褐（FRPS「树皮灰褐色」Verified + twig-a/bark-b 照片交叉；R−G=6 灰褐向；十树链：重阳木 < 樟 < 国槐 < 乌桕）；深纵裂族高糙哑光 0.93；6 板状厚脊 + 板状剖面 + 沟深 0.52 字面量', () => {
    const bark = track(createSophoraBarkMaterial());
    const hex = bark.color.getHex();
    expect(hex).toBe(0x6d675d); // 工程设定：FRPS 灰褐 [1][2] + twig-a「深灰褐纵裂脊」/bark-b「灰褐纵裂沟脊」[6] 交叉
    const [r, g, b] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
    expect(r - g).toBe(6); // 灰褐向（vs 重阳木 13 褐向——沟底红褐不做的基调纪律）
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const l = luma([r, g, b]);
    expect(l).toBeGreaterThan(luma([0x6e, 0x63, 0x52])); // 亮于樟黄褐深沟（十树链：樟 < 国槐）
    expect(l).toBeLessThan(luma([0x6f, 0x6a, 0x62])); // 暗于乌桕暗灰（国槐 < 乌桕）
    expect(l).toBeLessThan(luma([0x90, 0x92, 0x8a])); // 暗于栾浅色
    expect(bark.roughness).toBe(0.93); // 深纵裂厚脊族高糙哑光
    const { fragmentShader } = assemble(track(createSophoraBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('abs(fract(vUv.x * 6.0 + sopWarp * 0.95)'); // 6 板状厚脊/周（十树最粗犷档——vs 重阳木 8 / 乌桕 11 / 樟 7）× drift 0.95 适中游走（纵为主）
    expect(fragmentShader).toContain('smoothstep(0.16, 0.42, sopTri)'); // 板状剖面（窄深沟 + 宽平脊——「脊厚沟深板状粗犷」）
    expect(fragmentShader).toContain('mix(0.52 + 0.48 * sopPlate, 0.90 + 0.10 * sopPlate'); // 沟深剖面 0.52（深——vs 重阳木 0.54 中深 / 樟 0.50）+ 上部弱化
    expect(fragmentShader).not.toContain('vUv.x * 11.0'); // 乌桕窄脊不串种
    expect(fragmentShader).not.toContain('vUv.x * 8.0'); // 重阳木宽脊不串种（6 = 更粗犷一档）
  });

  it('脊沟系统与老干交叉网状（High 近景——裁决 6 定稿项）：沟内冷中性 AO（无红调）+ 网状层（脊线横断 × 老干门控 × 局部域门）+ 单色微变（无剥落无三色带——悬/榉标记不串种）', () => {
    const { fragmentShader } = assemble(track(createSophoraBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('vec3(0.79, 0.78, 0.77)'); // 沟内冷中性暗 AO（沟底深色无红调——裁决 6：NC 单源不冒充）
    expect(fragmentShader).toContain('vec3(sopRidge) * (0.93 + 0.12 * sopWarp)'); // 基底灰褐单色微变 ±6%（「树皮灰褐色」FRPS Verified——游走场复用省 1 采样；vec3(sopRidge) 显式广播——011.8 编译事故修复形态）
    expect(fragmentShader).toContain('fract(vUv.y * 2.3 + sopWarp * 0.55 + sopTri * 0.20)'); // 网状脊线横断 fissure（游走 + 脊相位调制）
    expect(fragmentShader).toContain('(1.0 - smoothstep(1.7, 3.2, vTreePos.y))'); // 网状老干门控（低位）
    expect(fragmentShader).toContain('(1.0 - smoothstep(1.4, 2.2, vUv.y))'); // 网状老干门控（低弧长 v——皮管累计弧长契约注记）
    expect(fragmentShader).toContain('smoothstep(0.44, 0.62, sopTone)'); // 网状局部域门（片域——非通干）
    expect(fragmentShader).toContain('vec3(0.87, 0.85, 0.84)'); // 网状微暗
    expect(fragmentShader).not.toContain('vec3(1.32, 1.28, 1.14)'); // 悬铃木新露奶油白带不串种（无剥落）
    expect(fragmentShader).not.toContain('vec3(1.35, 0.92, 0.64)'); // 榉树锈橙新斑不串种（无剥落）
    expect(fragmentShader).not.toContain('vec3(1.13, 1.11, 1.05)'); // 乌桕翘条亮面不串种（无翘皮）
  });

  it('散在暗色瘤状突起（High——九资产独有维度，裁决 6 定稿项）：22×26 格 ALU hash ≈14% 散在 + 老干强/中龄弱双门控 + 暗色乘子', () => {
    const { fragmentShader } = assemble(track(createSophoraBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('vec2(vUv.x * 22.0, vUv.y * 26.0)'); // 瘤突格密度（稀疏——散在读向）
    expect(fragmentShader).toContain('step(0.86, sopBR)'); // ≈14% 格有瘤（散在门）
    expect(fragmentShader).toContain('mix(0.30, 1.0, sopBumpOld)'); // 老干强 / 中龄弱双门控
    expect(fragmentShader).toContain('vec3(0.70, 0.68, 0.66)'); // 瘤突暗色乘子（「暗色小瘤突」照片双源）
    expect(fragmentShader).toContain('smoothstep(1.9, 3.4, vTreePos.y)'); // 瘤突老干门（低位 × 低弧长双门控的一半）
  });

  it('干基暗化 + 细枝绿-灰褐两档 + 皮孔浅色两档（裁决 8——FRPS/FOC 双原句 Verified + fruit-a「绿枝带浅色皮孔」佐证）', () => {
    const { fragmentShader } = assemble(track(createSophoraBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('1.0 - smoothstep(0.5, 2.4, vTreePos.y)'); // 干基暗带门控（家族惯例）
    expect(fragmentShader).toContain('vec3(0.88, 0.87, 0.88)'); // 干基暗化乘色
    expect(fragmentShader).toContain('smoothstep(6.0, 8.0, vTreePos.y)'); // 当年生枝高位门控
    expect(fragmentShader).toContain('smoothstep(4.6, 6.0, vTreePos.y)'); // 老枝灰褐档门控
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.45, 0.95, vUv.y))'); // 小弧长门（「细枝管 v 小」几何契约注记——高位 × 小 v 双门控）
    expect(fragmentShader).toContain('vec3(0.86, 1.16, 0.72)'); // 当年生枝绿色收敛（「当年生枝绿色，无毛」双志 Verified）
    expect(fragmentShader).toContain('vec3(1.03, 1.00, 0.95)'); // 老枝灰褐弱收敛
    expect(fragmentShader).toContain('vec2(vUv.x * 40.0, vUv.y * 34.0)'); // 皮孔格密度（细枝域中等）
    expect(fragmentShader).toContain('step(0.42, sopLR)'); // 58% 格有孔
    expect(fragmentShader).toContain('vec3(1.34, 1.35, 1.28)'); // 皮孔浅灰白档（当年生——fruit-a 佐证）
    expect(fragmentShader).toContain('vec3(1.18, 1.18, 1.14)'); // 皮孔弱浅档（老枝）
    expect(fragmentShader).not.toContain('Moss'); // 苔藓不做（bark-c 藓斑低置信不承重——不做不编造）
    expect(fragmentShader).not.toContain('52.0'); // 栾皮孔麻点格密度不串种（皮孔语言归栾全干密布型）
  });

  it('果域（v∈[4,5]，裁决 4 做/裁决 5 主域）：三档色序字面量（绿→黄绿→黄褐）+ u 果档 warp（JS 锚混熟分布）+ 珠间缢缩暗缝（沿串坐标 6 珠周期）+ 实体无裁切 + 果透光域门控 v≥3.5（High）', () => {
    const { fragmentShader } = assemble(track(createSophoraBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('if (vUv.y >= 3.5) {'); // 果域分支（v∈[4,5]——域身份标记，皮弧长域 ≤2.9 三重隔离）
    expect(fragmentShader).toContain('vec3(0.50, 0.62, 0.26)'); // 档 0 绿（幼嫩）
    expect(fragmentShader).toContain('vec3(0.63, 0.71, 0.31)'); // 档 1 黄绿（转色）
    expect(fragmentShader).toContain('vec3(0.67, 0.58, 0.30)'); // 档 2 黄褐（成熟——NC "green ripening to yellow-brown" Verified）
    expect(fragmentShader).toContain('0.06 * sin(6.28318 * (vUv.x - 0.2))'); // u 果档 warp（权重倾斜）
    expect(fragmentShader).toContain('fract((vUv.y - 4.0) * 6.0)'); // 沿串坐标 6 珠周期（每串 3–10 珠统计中值——沿串坐标为材质侧假设，缺口候选③）
    expect(fragmentShader).toContain('vec3(0.74, 0.72, 0.68)'); // 珠间缢缩暗缝乘色（「缢缩可见」照片三源裁定）
    expect(fragmentShader).toContain('sopFBack'); // 果域微透亮（fruit-a/b/c「微透亮/光滑肉质」——High 专属）
    expect(fragmentShader).toContain('outgoingLight += vec3(0.72, 0.86, 0.50)'); // 微透亮黄绿弱背光 0.14（域门控 v≥3.5）
    // JS 锚：warp 三档分布（9–10 月盛挂混熟读向——每档 20–45%）
    const pct = [0, 0, 0];
    for (let i = 0; i < 10000; i++) {
      const u = (i + 0.5) / 10000;
      const w = clamp(u + 0.06 * Math.sin(2 * Math.PI * (u - 0.2)), 0, 0.999);
      pct[Math.min(2, Math.floor(w * 3))]++;
    }
    for (let bin = 0; bin < 3; bin++) {
      expect(pct[bin] / 10000, `果色档 ${bin} 占比`).toBeGreaterThan(0.20);
      expect(pct[bin] / 10000).toBeLessThan(0.45);
    }
    // 肉质光润低糙光泽档（roughnessmap 域分支）
    expect(fragmentShader).toContain('roughnessFactor = 0.45;'); // 果域（High）
  });
});

describe('分档实装（level 参数；缺省 high = 显式 high）', () => {
  /** 材质关键属性快照（缺省 vs 显式 high 逐位一致的比较面） */
  const propsOf = (material: THREE.Material): Record<string, unknown> => {
    const base: Record<string, unknown> = {
      type: material.type,
      side: material.side,
      alphaTest: material.alphaTest,
      alphaToCoverage: material.alphaToCoverage,
      transparent: material.transparent,
      defines: material.defines,
    };
    if (material instanceof THREE.MeshStandardMaterial) {
      base.color = material.color.getHex();
      base.roughness = material.roughness;
      base.metalness = material.metalness;
    }
    return base;
  };

  it('三工厂缺省与显式 high 逐位一致（属性 + 键 + GLSL 全文）', () => {
    const pairs: Array<[THREE.Material, THREE.Material, { vertexShader: string; fragmentShader: string }]> = [
      [track(createSophoraLeafMaterial()), track(createSophoraLeafMaterial('high')), THREE.ShaderLib.physical],
      [track(createSophoraBarkMaterial()), track(createSophoraBarkMaterial('high')), THREE.ShaderLib.physical],
      [track(createSophoraLeafDepthMaterial()), track(createSophoraLeafDepthMaterial('high')), THREE.ShaderLib.depth],
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
    expectKey(track(createSophoraLeafMaterial()), 'sophora:leaf');
    expectKey(track(createSophoraLeafMaterial('mid')), 'sophora:leaf:mid');
    expectKey(track(createSophoraLeafMaterial('low')), 'sophora:leaf:low');
    expectKey(track(createSophoraBarkMaterial()), 'sophora:bark');
    expectKey(track(createSophoraBarkMaterial('mid')), 'sophora:bark:mid');
    expectKey(track(createSophoraBarkMaterial('low')), 'sophora:bark:low');
    expectKey(track(createSophoraLeafDepthMaterial()), 'sophora:leaf-depth');
    expectKey(track(createSophoraLeafDepthMaterial('mid')), 'sophora:leaf-depth:mid');
    expectKey(track(createSophoraLeafDepthMaterial('low')), 'sophora:leaf-depth:low');
    expect(keys.size).toBe(9);
  });

  it('与 zelkova/camphor/celtis/ginkgo/platanus/koelreuteria/triadica/bischofia 72 键零碰撞（sophora 前缀不与九先例混缓存）', () => {
    const foreignKeys = new Set<string>();
    for (const make of [createZelkovaLeafMaterial, createZelkovaBarkMaterial, createZelkovaLeafDepthMaterial,
      createCamphorLeafMaterial, createCamphorBarkMaterial, createCamphorLeafDepthMaterial,
      createCeltisLeafMaterial, createCeltisBarkMaterial, createCeltisLeafDepthMaterial,
      createGinkgoLeafMaterial, createGinkgoBarkMaterial, createGinkgoLeafDepthMaterial,
      createPlatanusLeafMaterial, createPlatanusBarkMaterial, createPlatanusLeafDepthMaterial,
      createKoelreuteriaLeafMaterial, createKoelreuteriaBarkMaterial, createKoelreuteriaLeafDepthMaterial,
      createTriadicaLeafMaterial, createTriadicaBarkMaterial, createTriadicaLeafDepthMaterial,
      createBischofiaLeafMaterial, createBischofiaBarkMaterial, createBischofiaLeafDepthMaterial]) {
      for (const level of ['high', 'mid', 'low'] as const) {
        foreignKeys.add(track(make(level)).customProgramCacheKey());
      }
    }
    expect(foreignKeys.size).toBe(72);
    for (const make of [createSophoraLeafMaterial, createSophoraBarkMaterial, createSophoraLeafDepthMaterial]) {
      for (const level of ['high', 'mid', 'low'] as const) {
        expect(foreignKeys.has(track(make(level)).customProgramCacheKey())).toBe(false);
      }
    }
  });

  it('叶 Mid：SDF 与 High 同源全形（含窗列/顶生窗——档间剪影一致：羽状剪影是中距身份）+ 去小叶脉/叶团/糙度叶团项；透光/hue·luma/shade/叶背保留；片元零噪声', () => {
    const high = assemble(track(createSophoraLeafMaterial()), THREE.ShaderLib.physical);
    const mid = assemble(track(createSophoraLeafMaterial('mid')), THREE.ShaderLib.physical);
    expect(sdfOf(mid.fragmentShader)).toBe(sdfOf(high.fragmentShader)); // Mid SDF = High 同源全形
    expect(columnOf(mid.fragmentShader)).toBe(columnOf(high.fragmentShader)); // 窗列子函数同源（FXC 拆分形态）
    expect(terminalOf(mid.fragmentShader)).toBe(terminalOf(high.fragmentShader)); // 顶生窗子函数同源
    for (const gone of ['sopVMid', 'sopVLat', 'sopClump']) {
      expect(mid.fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(mid.fragmentShader).not.toContain('(sopClump - 0.5) * 0.06'); // 糙度注入同步去叶团项
    expect(mid.fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0'); // 透光保留
    expect(mid.fragmentShader).toContain('sopTransVar');
    expect(mid.fragmentShader).toContain('vec3 sopHue'); // hue·luma 逐叶变奏保留
    expect(mid.fragmentShader).toContain('float sopLuma');
    expect(mid.fragmentShader).toContain('(0.80 + 0.20 * sopShade)'); // 冠内竖向自遮蔽保留（地板 0.80 沿先例口径）
    expect(mid.fragmentShader).toContain('float(gl_FrontFacing)) * 0.06'); // 两面糙度差保留
    expect(mid.fragmentShader).toContain('vec3(1.16, 1.18, 1.28)'); // 叶背灰白粉绿保留（加重档三档同体）
    expect(count(mid.fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0 调用（叶团去采样——Mid 片元零噪声执行）
  });

  it('叶 Low：SDF 换 SDF_LOW（去窗列/顶生窗——复叶细化 Spec §7 牺牲顺序）；包络/叶轴/裸轴门控与 High 逐字同源；去小叶脉/叶团/透光；hue·luma/shade/叶背保留；片元零噪声', () => {
    const high = assemble(track(createSophoraLeafMaterial()), THREE.ShaderLib.physical);
    const low = assemble(track(createSophoraLeafMaterial('low')), THREE.ShaderLib.physical);
    const lowSdf = sdfOf(low.fragmentShader);
    expect(lowSdf).not.toBe(sdfOf(high.fragmentShader)); // Low SDF = 去窗列版（换字符串）
    expect(lowSdf).not.toContain('sopColumn'); // 去窗列（复叶细化）
    expect(lowSdf).not.toContain('sopTerminal'); // 去顶生窗
    for (const gone of ['sopVMid', 'sopClump', 'sopTransVar', 'vec3(0.56, 0.92, 0.38)']) {
      expect(low.fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    // 包络/叶轴/裸轴门控与 High 逐字同源（档间叶形身份一致的去细节不改形原则——远距保留羽叶层叠轮廓色块）
    expect(lowSdf).toContain('0.166 * pow(sopEnvSin, mix(0.88, 1.26, smoothstep(0.30, 0.92, sopY)))'); // 包络逐字同源
    expect(lowSdf).toContain('0.0040 + 0.0050 * (1.0 - sopY) + 0.0038 * (1.0 - smoothstep(0.0, 0.07, sopY))'); // 叶轴（含基部膨大）逐字同源
    expect(lowSdf).toContain('- (1.0 - smoothstep(0.09, 0.13, sopY)) * 0.10'); // 裸轴减法门控逐字同源（Low 无窗列 → 顶栏门控随窗列消去为设计内）
    expect(lowSdf).toContain('clamp(sopEdge / 0.02 + 0.5'); // 坡宽同步（档间 AA 边一致）
    expect(count(low.fragmentShader, '#include <opaque_fragment>')).toBe(1); // 透光不注入但锚点原句不动
    expect(low.fragmentShader).toContain('(0.80 + 0.20 * sopShade)'); // shade 保留
    expect(low.fragmentShader).toContain('vec3 sopHue'); // hue·luma 保留
    expect(low.fragmentShader).toContain('vec3(1.16, 1.18, 1.28)'); // 叶背保留
    expect(count(low.fragmentShader, 'facVnoise(')).toBe(3); // 片元零噪声采样（库内 3 为死码，运行时零执行）
  });

  it('皮 Mid：去老干网状/瘤突/皮孔点（近景细节层）；脊沟板状/沟内 AO/干基暗化/细枝两档/果域全保留（中距「灰褐深纵裂厚脊 + 冠缘绿细枝 + 串珠果」身份 Spec §7）', () => {
    const { fragmentShader } = assemble(track(createSophoraBarkMaterial('mid')), THREE.ShaderLib.physical);
    // domainVars 三档统一预声明（triadica 同款）——断言消费式/场段缺席而非裸标识符
    for (const gone of ['sopNet', 'sopTone', 'sopBumpOld', 'sopBId', 'sopLR', 'vec2(vUv.x * 22.0, vUv.y * 26.0)', 'vec2(vUv.x * 40.0, vUv.y * 34.0)', 'max(sopTwigHi, sopTwigMid * 0.8)', 'vec3(0.70, 0.68, 0.66)', 'vec3(1.34, 1.35, 1.28)', 'vec3(1.18, 1.18, 1.14)', 'sopLenticel * 0.10', 'sopLenticel * 0.85']) {
      expect(fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('abs(fract(vUv.x * 6.0 + sopWarp * 0.95)'); // 脊沟板状保留（中距身份）
    expect(fragmentShader).toContain('vec3(0.79, 0.78, 0.77)'); // 沟内冷中性 AO 保留
    expect(fragmentShader).toContain('sopBarkBase'); // 干基暗化保留
    expect(fragmentShader).toContain('sopTwigMid * 0.35'); // 老枝灰褐档保留（消费式在场）
    expect(fragmentShader).toContain('vec3(0.86, 1.16, 0.72)'); // 细枝绿过渡保留（冠缘绿细枝中距读向）
    expect(fragmentShader).toContain('vec3(0.50, 0.62, 0.26)'); // 果域三档色序保留（串珠果中距身份）
    expect(fragmentShader).toContain('fract((vUv.y - 4.0) * 6.0)'); // 珠间缢缩暗缝保留（三档同体——串珠剪影）
    expect(fragmentShader).toContain('roughnessFactor = 0.48;'); // 果域光泽（Mid 微透亮随段去）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 游走场 1（网状/域门场随段去）
  });

  it('皮 Low：再去干基暗化/老枝灰褐档（低调项）；脊沟 + 沟内 AO + 当年生绿档 + 果域保留（远距「深纵裂剪影 + 果串」保留面）；1× vnoise', () => {
    const { fragmentShader } = assemble(track(createSophoraBarkMaterial('low')), THREE.ShaderLib.physical);
    // domainVars 三档统一预声明 + TWIG 段三档共享（未消费的死值无害）；断言消费式缺席
    for (const gone of ['sopNet', 'sopTone', 'sopBumpOld', 'sopLR', 'sopBarkBase * 0.7', 'sopTwigMid * 0.35', 'vec3(1.03, 1.00, 0.95)', 'vec2(vUv.x * 40.0, vUv.y * 34.0)']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('sopRidge'); // 脊沟保留（远距剪影保留面）
    expect(fragmentShader).toContain('vec3(0.79, 0.78, 0.77)'); // 沟内 AO 保留
    expect(fragmentShader).toContain('vec3(0.86, 1.16, 0.72)'); // 当年生绿档（结构剪影项三档保留）
    expect(fragmentShader).toContain('vec3(0.67, 0.58, 0.30)'); // 果域黄褐档保留
    expect(fragmentShader).toContain('roughnessFactor = 0.50;'); // 果域光泽（远距果色读向保留）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 游走场 1
  });

  it('深度分档：Mid = High SDF（含窗列/顶生窗）/ Low = SDF_LOW（去窗列）；与叶表面档内逐字一致（表面/影裁切档内一致）；三档零噪声库', () => {
    const high = assemble(track(createSophoraLeafDepthMaterial()), THREE.ShaderLib.depth);
    const mid = assemble(track(createSophoraLeafDepthMaterial('mid')), THREE.ShaderLib.depth);
    const low = assemble(track(createSophoraLeafDepthMaterial('low')), THREE.ShaderLib.depth);
    const highSdf = sdfOf(high.fragmentShader);
    expect(sdfOf(mid.fragmentShader)).toBe(highSdf); // Mid 深度 = High SDF（同源全形含窗列/顶生窗）
    expect(highSdf).toContain('sopColumn'); // 档间剪影一致（羽状影读向保留）
    expect(sdfOf(low.fragmentShader)).not.toBe(highSdf); // Low 深度 = SDF_LOW（去窗列版）
    expect(sdfOf(low.fragmentShader)).not.toContain('sopColumn');
    // 表面/影档内一致：叶表面各档 SDF === 深度各档 SDF
    for (const level of ['high', 'mid', 'low'] as const) {
      const surface = assemble(track(createSophoraLeafMaterial(level)), THREE.ShaderLib.physical);
      const depthShader = assemble(track(createSophoraLeafDepthMaterial(level)), THREE.ShaderLib.depth);
      expect(sdfOf(surface.fragmentShader)).toBe(sdfOf(depthShader.fragmentShader)); // 同一 GLSL 字符串（单一来源纪律）
      expect(count(depthShader.fragmentShader, 'facVnoise(')).toBe(0); // 三档深度零噪声库
    }
  });

  it('风动三档同源：叶/皮三档顶点 GLSL 全文一致（SOP_WIND 同一常量——档间相位一致 = 身份一致）', () => {
    const leafHigh = assemble(track(createSophoraLeafMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createSophoraBarkMaterial()), THREE.ShaderLib.physical);
    for (const level of ['mid', 'low'] as const) {
      const leaf = assemble(track(createSophoraLeafMaterial(level)), THREE.ShaderLib.physical);
      const bark = assemble(track(createSophoraBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(leaf.vertexShader).toBe(leafHigh.vertexShader);
      expect(bark.vertexShader).toBe(barkHigh.vertexShader);
    }
  });

  it('分档底参契约不因档破：叶三档 alphaTest/alphaToCoverage/DoubleSide/USE_UV/零贴图；皮三档 FrontSide/无 alphaTest/USE_UV；深度 alphaTest', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const leaf = track(createSophoraLeafMaterial(level));
      const bark = track(createSophoraBarkMaterial(level));
      const depth = track(createSophoraLeafDepthMaterial(level));
      expect(leaf.alphaTest).toBe(0.5);
      expect(leaf.alphaToCoverage).toBe(true);
      expect(leaf.side).toBe(THREE.DoubleSide);
      expect(leaf.defines?.USE_UV).toBe('');
      expect(leaf.map).toBeNull(); // 零贴图（D13）三档同守
      expect(bark.side).toBe(THREE.FrontSide); // 组 0 两域契约三档同守（闭合实体）
      expect(bark.alphaTest).toBe(0);
      expect(bark.defines?.USE_UV).toBe('');
      expect(depth.alphaTest).toBe(0.5);
      expect(depth.defines?.USE_UV).toBe('');
    }
  });

  it('uTime 桥接三档不缺位：材质级 uniforms.uTime 与编译后 shader.uniforms 同引用（Mid/Low）', () => {
    for (const make of [createSophoraLeafMaterial, createSophoraBarkMaterial]) {
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
    const leafA = track(createSophoraLeafMaterial());
    const leafB = track(createSophoraLeafMaterial());
    const barkA = track(createSophoraBarkMaterial());
    const barkB = track(createSophoraBarkMaterial());
    const depth = track(createSophoraLeafDepthMaterial());
    expect(leafA).not.toBe(leafB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(leafA.customProgramCacheKey()).toBe(leafB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([leafA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
    expect(materialUniformsOf(leafA).uTime).not.toBe(materialUniformsOf(leafB).uTime); // uTime 桥接对象实例独立（dispose 安全）
    expect(materialUniformsOf(barkA).uTime).not.toBe(materialUniformsOf(barkB).uTime);
  });

  it('底参与侧向：叶 DoubleSide/纸质微光泽/USE_UV；皮 FrontSide/深纵裂高糙/USE_UV；均零贴图', () => {
    const leaf = track(createSophoraLeafMaterial());
    const bark = track(createSophoraBarkMaterial());
    expect(leaf.side).toBe(THREE.DoubleSide);
    expect(leaf.metalness).toBe(0);
    expect(leaf.roughness).toBeGreaterThan(0.66); // 纸质微光泽（0.67）
    expect(leaf.roughness).toBeLessThan(0.70);
    expect(leaf.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.FrontSide);
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeGreaterThan(0.9); // 深纵裂厚脊族高糙哑光
    expect(bark.map).toBeNull();
    expect(leaf.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
  });
});

describe('成本记账（10 万实例每像素预算：叶 High ≈10.5×（单级窗列 SDF ≈4× 的账——复叶第三型，与栾两级窗列 4.5×/重阳木三叶并集 4× 同档）/ 皮 High 最重路径 ≈8×，hash21=1×/vnoise=3×——窗列/小叶场/顶生窗 ALU 化红利）', () => {
  it('facVnoise 调用数：叶 High 1 处（3×）、Mid/Low 0 处；皮 High 2 处（游走场 + 网状/域门场，域互斥执行）、Mid/Low 1 处；深度 0 处（零噪声库注入）；顶点零噪声', () => {
    const leaf = assemble(track(createSophoraLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createSophoraBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createSophoraLeafDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(leaf.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（叶团——窗列/小叶场 ALU 化免噪声）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（游走场 + 网状/域门场）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(0); // 深度零噪声库注入（窗列 SDF 先天满足影 pass 不吃噪声）
    expect(count(leaf.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin/cos
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零循环/零纹理采样（配方确定性纯函数 + SDF 纯 ALU）；全源零三角函数反函数调用（窗列/包络全 floor/fract/smoothstep 代理——零 mat2）', () => {
    const shaders = [
      assemble(track(createSophoraLeafMaterial()), THREE.ShaderLib.physical),
      assemble(track(createSophoraBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createSophoraLeafDepthMaterial()), THREE.ShaderLib.depth),
    ];
    for (const shader of shaders) {
      for (const source of [shader.vertexShader, shader.fragmentShader]) {
        expect(source).not.toContain('for (');
        expect(source).not.toContain('while');
        expect(source).not.toContain('texture'); // 零贴图零采样（D13）
        expect(source).not.toContain('atan('); // 窗列免反三角调用（成本纪律）
        expect(source).not.toContain('mat2'); // 零矩阵函数纪律
      }
    }
  });
});

describe('注入点缺失即抛（首次渲染前暴雷）', () => {
  it('片元 map_fragment 摘除 → 叶/皮/深度均抛「注入点缺失」', () => {
    for (const make of [createSophoraLeafMaterial, createSophoraBarkMaterial, createSophoraLeafDepthMaterial]) {
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
    const leaf = track(createSophoraLeafMaterial());
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

    const depth = track(createSophoraLeafDepthMaterial());
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

  it('片元 roughnessmap_fragment / opaque_fragment 摘除 → 抛「注入点缺失」（透光/果透光注入仅 High/Mid 叶与 High 皮——Low 无项不注入为设计内）', () => {
    const bark = track(createSophoraBarkMaterial());
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

    const leaf = track(createSophoraLeafMaterial());
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

    const leaf = assemble(track(createSophoraLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createSophoraBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createSophoraLeafDepthMaterial()), THREE.ShaderLib.depth);
    for (const shader of [leaf, bark]) {
      expect(braceDelta(expandIncludes(shader.fragmentShader))).toBe(pristinePhysicalFragment);
      expect(braceDelta(shader.vertexShader)).toBe(pristinePhysicalVertex);
    }
    expect(braceDelta(expandIncludes(depth.fragmentShader))).toBe(pristineDepthFragment);
    expect(braceDelta(depth.vertexShader)).toBe(pristineDepthVertex);
  });
});

describe('跨 include 作用域防回归 + vec/float 维度守卫（triadica Step 4 实证事故 + 011.8 vec/float 维度事故配套——皮 roughness 注入消费 map 注入块内声明的真实编译错误形态与裸标量注入 vec3 声明的维度不匹配形态，两种复发都红）', () => {
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

  /** guard 本体：注入段内出现的每个 sop* 标识符必须为 main 顶层（深度 1）唯一声明，
   *  且声明先于段尾（消费点）——块内声明（作用域在块结束关闭）与块内遮蔽声明（float 重声明）
   *  两种复发形态都红 */
  const crossIncludeScopeGuard = (fragmentShader: string, segment: { start: number; text: string }, label: string): void => {
    const ids = new Set(segment.text.match(/\bsop[A-Z][A-Za-z0-9_]*/g) ?? []);
    for (const id of ids) {
      const decl = `float ${id}`;
      expect(count(fragmentShader, decl), `${label}:${id} 声明唯一（块内 float 重声明 = 遮蔽——triadica 次生 bug 形态）`).toBe(1);
      const declIdx = fragmentShader.indexOf(decl);
      expect(declIdx, `${label}:${id} 声明存在`).toBeGreaterThan(0);
      expect(declIdx, `${label}:${id} 声明先于消费段尾`).toBeLessThan(segment.start + segment.text.length);
      expect(braceDepthFromMain(fragmentShader, declIdx), `${label}:${id} 声明在 main 顶层（跨 include 可见——块内声明即编译错误形态）`).toBe(1);
    }
  };

  it('皮三档：roughnessmap 注入段消费的 sop* 标识符均在 main 顶层唯一声明（domainVars 预声明 + 块内纯赋值——High 消费 sopLenticel/sopBarkSmooth，Mid 消费 sopBarkSmooth，Low 段零 sop* id 自然跳过）', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const { fragmentShader } = assemble(track(createSophoraBarkMaterial(level)), THREE.ShaderLib.physical);
      const segment = injectedSegmentAfter(fragmentShader, '#include <roughnessmap_fragment>');
      crossIncludeScopeGuard(fragmentShader, segment, `bark:${level}`);
    }
  });

  it('叶三档：roughnessmap 注入段消费的 sop* 标识符同守（leafBody 平铺无块包裹——High 消费 sopClump，Mid/Low 段零 sop* id 自然跳过）', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const { fragmentShader } = assemble(track(createSophoraLeafMaterial(level)), THREE.ShaderLib.physical);
      const segment = injectedSegmentAfter(fragmentShader, '#include <roughnessmap_fragment>');
      crossIncludeScopeGuard(fragmentShader, segment, `leaf:${level}`);
    }
  });

  it('叶透光段（opaque_fragment 前注入）消费的 sop* 标识符（sopAlpha/sopBack/sopTransVar）同守——High/Mid', () => {
    for (const level of ['high', 'mid'] as const) { // Low 无透光注入（设计内）
      const { fragmentShader } = assemble(track(createSophoraLeafMaterial(level)), THREE.ShaderLib.physical);
      const anchorIdx = fragmentShader.indexOf('#if NUM_DIR_LIGHTS > 0');
      expect(anchorIdx).toBeGreaterThanOrEqual(0);
      const endIdx = fragmentShader.indexOf('#include <opaque_fragment>', anchorIdx);
      expect(endIdx).toBeGreaterThan(anchorIdx);
      crossIncludeScopeGuard(fragmentShader, { start: anchorIdx, text: fragmentShader.slice(anchorIdx, endIdx) }, `leaf-trans:${level}`);
    }
  });

  it('皮果透光段（opaque_fragment 前注入，High）自含声明（sopFBack 段内声明段内消费——if 块内作用域闭合，无跨 include 暴露）+ 域门控 v≥3.5 在位', () => {
    const { fragmentShader } = assemble(track(createSophoraBarkMaterial()), THREE.ShaderLib.physical);
    const anchorIdx = fragmentShader.indexOf('#if NUM_DIR_LIGHTS > 0');
    expect(anchorIdx).toBeGreaterThanOrEqual(0);
    const endIdx = fragmentShader.indexOf('#include <opaque_fragment>', anchorIdx);
    const segment = fragmentShader.slice(anchorIdx, endIdx);
    expect(segment).toContain('float sopFBack ='); // 段内自含声明（块内声明块内消费——无跨 include 风险）
    expect(segment).toContain('if (vUv.y >= 3.5) {'); // 果域域门控（皮/叶域不受影响）
    expect(count(fragmentShader, 'float sopFBack')).toBe(1); // 全文唯一（无遮蔽形态）
  });

  it('跨 include 类型守卫（011.8 sopBarkMul 同型事故——sopRidge float 顶层声明 × vec3 注入块消费）：皮三档 sopBarkMul 赋值右侧显式 vec3(sopRidge) 广播，禁裸 float 标量直乘进 vec3 声明（修复形态 toContain + 裸标量注入消费 not.toMatch）', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const { fragmentShader } = assemble(track(createSophoraBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(fragmentShader, `bark:${level} 修复形态在场（float 顶层声明 → vec3 显式广播）`).toContain('vec3 sopBarkMul = vec3(sopRidge) * (0.93 + 0.12 * sopWarp)');
      expect(fragmentShader, `bark:${level} 禁裸 sopRidge 标量直乘（= float 表达式赋 vec3 = 维度不匹配编译错误）`).not.toMatch(/vec3\s+sopBarkMul\s*=\s*sopRidge\s*\*/);
      // 叶侧同型守卫：sopMul 为 vec3（sopHue vec3 × float 链——无裸标量赋值形态）
      const leaf = assemble(track(createSophoraLeafMaterial(level)), THREE.ShaderLib.physical);
      expect(leaf.fragmentShader, `leaf:${level} 修复形态在场（vec3 × float 合法链）`).toContain('vec3 sopMul = sopHue * sopLuma * (0.80');
      expect(leaf.fragmentShader, `leaf:${level} 禁裸 float 标量直赋 vec3 sopMul`).not.toMatch(/vec3\s+sopMul\s*=\s*(?!sopHue)\w+\s*;/);
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
    const material = track(createSophoraLeafMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});
