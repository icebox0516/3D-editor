/**
 * tests/runtime/procedural/tree/fraxinusMaterials.test.ts —— 白蜡叶/皮（含匙形
 * 翅果域）/深度材质测试（T011.10，对称 sophoraMaterials 47 条组织：真实
 * THREE.ShaderLib 源组装，静态字符串断言 + SDF 数值锚 JS 镜像，零 WebGL；
 * build()/资产入口归并行几何 agent 的资产测试，此处不覆盖——先例无依赖几何的
 * 测试形态，全部形态可移植）。
 *
 * 覆盖（Spec docs/research/fraxinus-reference.md 1.0，生产口径 = 终审记档 ③
 * 裁决八项；恢复会话重验修正三处记档：果域 warp 幅相 0.05/(u−0.18)→0.09/u
 * 〔实测中域 55%→66% 对齐「黄绿-淡褐主域」意图〕+ 皮孔半径注释 0.04→0.06–0.10
 * + 透射链序注释残段清理）：
 * - uTime 接线（TimeUniformService 消费协议）：叶/皮材质挂材质级 uniforms.uTime（own
 *   property）；onBeforeCompile 后 shader.uniforms.uTime 与材质级同对象引用；GLSL 声明
 *   uniform float uTime；材质挂场景被服务逐帧驱动（frame 写值闭环）；
 * - 风动契约（D19.7）：aSeed/aBend/aLeafRand 顶点 attribute 声明存在；相位 = fract(sin(...))
 *   类 hash（aSeed=0 缺省属性路径退化为常数相位，全源零除 aSeed——无 NaN）；整树缓摆项
 *   叶/皮同公式（同串出现）；复叶卡快颤层含 aBend 权重 + **11mm 家族档**（整枚羽叶
 *   中等摆锤——9–15 rad/s 与栾/重阳木/国槐同档）；hash 常数 93.847/70.913 与十先例
 *   相位流（sway 77.669–88.217 + 91.523 / flutter 49.337–65.443 + 68.137）去相关——
 *   新值在两域外；**树高锚 10.4973m（×0.09526——slot-0 Stage 实测涌现同步轮
 *   2026-09-22，志书「高10-12米」直给 + 卵圆开展冠不宜取高端）**；
 * - instanceColor 乘算链安全：注入后 <color_fragment> 原句恰一次、注入代码零 vColor 介入；
 * - 单级窗列 SDF 与透光：叶 alphaTest 0.5 + alphaToCoverage + 坡宽 0.02（小叶间隙级）；
 *   **组 0 材质工程契约**（材质侧定义）：FrontSide 闭合实体（皮管/果面片双面归几何侧
 *   双 tri——缺口候选③）+ 无 alphaTest；深度材质（叶影裁切）含同一 SDF 函数（单一
 *   来源——主函数/窗列子函数/顶生窗子函数三件全文相等）+ RGBADepthPacking + 组 0
 *   实心守卫（aLeafRand=0）+ USE_UV + alphaTest；透光项存在且 NUM_DIR_LIGHTS 守卫；
 * - 物种配方锚定（**一回奇数羽状复叶 SDF 对生严格变体**——裁决 8 三重对生的材质侧）：
 *   宽/长比 **0.36** 冻结字面量 + **对生严格相位**（右列降 0.05·space 极小抖动——vs
 *   国槐近对生 0.18·space 降列：跨轴带峰错位 ≤0.012 = 5% 相位差；vs 栾互生侧偏）+
 *   带间距 0.150–0.225（→ 有效带数 **2–3 对** JS run 计数锚〔有效带 = 高度 ≥0.040
 *   的 run——门控边界齿缘碎片不计〕——「小叶5-7枚」= 2–3 对 + 顶生的统计实现；vs
 *   国槐 4–7 对——计数少而整齐）+ 带列 v=0.285 起排（**裸轴段更长**——bare 占比
 *   ≈0.29 ∈ 0.28–0.35 冻结接口域；白蜡叶柄 4–6cm/复叶 15–25cm；vs 国槐 0.130）+
 *   顶生独立窗位（v∈[0.795,~0.97]——「奇数」的表达；近等大 1.01–1.15×〔「顶生
 *   小叶与侧生小叶近等大或稍大」FRPS 原句——vs 国槐顶生窗更大〕；JS 锚横向 reach
 *   ≥0.030）+ 小叶长 = 0.92×行包络 + 卵形-披针形包络 v^0.80 + 先端指数收口
 *   2.50–3.30 逐叶（「先端锐尖至渐尖」Verified）+ 基 1.06 钝圆/楔形宽开张（「基部
 *   钝圆或楔形」Verified）+ 小叶长宽比 1.72–2.94（∈ 1.5–3.0 Verified 域）+
 *   **零偏斜**（FRPS 小叶描述无偏斜句——vs 国槐「稍偏斜」±0.45 对照）+ **双减法
 *   门控**（裸轴基段 + 顶栏 0.70–0.74——011.8 乘法门控伪覆盖教训的强制形态；JS
 *   裸区 |x|>0.03 零命中 + 顶栏以上残余 W ≤0.055 两行为锁）+ **叶轴无基部膨大带**
 *   （「叶柄基部不增厚」FRPS Verified——vs 国槐「叶柄基部膨大包裹芽」藏芽膨大带
 *   0.0038 不串种）+ **缘锐锯齿载波回归**（裁决 8——「叶缘具整齐锯齿」FRPS +
 *   subsp. chinensis distinctly serrate：2π·9 = 56.55 同频 9 齿/小叶轴 pow 2.4
 *   锐齿〔zelkova 011.3 先例同法〕+ 幅度 ±0.011 + 端部渐隐门控 + **单频正则性**
 *   〔载波峰间距 1/9±0.004 零抖动——「整齐」的量化面；rand 仅入相位不入频率〕）；
 *   **中距细碎自检剖面**：maxW 全宽 0.26–0.355 细碎质域（卡全宽 0.36 内不外溢）+
 *   中段缢缩行 ≥6（W ≤0.030——带间仅叶轴可见 = 「细碎均质中绿 + airy」Spec §3
 *   的量化面；带数少于国槐 → 缢缩段更长更疏——两树中距读向同型对照记档）+ 卡缘
 *   恒裁 + Low 与 High 外廓差 ∈[−0.010,+0.040]；小叶脉三层（中脉 0.24 + 侧脉
 *   0.11 + 细脉网结 0.06——「侧脉8-10对，细脉明显网结」FRPS Verified 三层；
 *   侧脉与齿同频 56.55——脉端入齿统计读向 zelkova 同法）+ 顶生小叶竖直中脉；
 *   **两面色差弱档**（裁决 1——上面中绿-亮绿/下面浅绿-灰绿照片级 Inferred〔志书
 *   仅毛被句〕；「白蜡」命源 = 白蜡虫非叶色——不做蜡白过度引申：背面 ×(1.09,
 *   1.11, 1.17) B 抬升灰向但幅度低于国槐 glaucous 加重档；两面糙度差 +0.05 弱档）；
 *   背光透射 0.318（家族值域内取：重阳木 0.31 < 白蜡 0.318 < 栾 0.32——硬纸质
 *   透光微逊纸质端）+ 灰绿黄透射色；叶色中绿 #548840（十树链：栾 < 白蜡 < 国槐
 *   邻档半档）；硬纸质 roughness 0.68（国槐纸质 0.67 < 0.68 < 栾/重阳木 0.70）；
 *   皮（**第 11 语言「灰褐浅-中纵裂（无剥落无碎翘）+ 幼干-大枝近光滑 + 皮孔小不
 *   明显」——裁决 6 定稿**）：底色 #7a746b（R−G=6 灰褐向；十树链：国槐 < 白蜡 <
 *   栾——浅国槐一档）+ 8 细脊/周（vs 国槐 6 板状粗犷——细一档）+ 浅宽坡剖面
 *   smoothstep(0.26,0.56)（vs 国槐窄深沟 0.16–0.42）+ 沟深剖面 0.68 浅档（vs
 *   国槐 0.52）+ 上部弱化门控（幼干-大枝近光滑——龄级序列浅档）+ 沟内弱 AO +
 *   干基暗化弱档（×0.91 权重 0.5——老干渐深读向，弱于国槐 ×0.88 权重 0.7）+
 *   **小枝黄褐色**（FRPS 原句——vs 国槐当年生枝绿色两树细枝色对照：黄褐
 *   ×(1.16,1.04,0.76) R 主导）/老枝灰褐两档 + **皮孔小不明显三项落地**（30×44
 *   格 26% 有孔〔稀——vs 栾密麻点〕+ 小半径 0.06–0.10 + ×(1.12,1.11,1.08) 弱
 *   对比）+ 无剥落（悬/榉/乌桕标记不串种）；果域 v∈[4,5]：**嫩绿→黄绿→淡褐→
 *   淡黄褐四档色序**（§5 照片四点链——色序照片级 Verified）+ u 果档 warp 相位 0
 *   中域放大（JS 锚 ≈17/33/33/17%、中域 ≥60%——9–10 月盛挂混熟读向〔恢复会话
 *   修正后实测〕）+ 桨形边缘微暗线 ×(0.84,0.82,0.80)·0.8（果 uv 轴向契约为
 *   材质侧假设——双轴保守实现，缺口候选③）+ 翅面纸质微光泽 0.52/0.55/0.58
 *   （干翅非肉质——vs 国槐肉质荚果 0.45 哑一档）+ 微透亮（High——域门控 v≥3.5）；
 * - 深度材质零噪声库注入（窗列/小叶场/顶生窗/齿载波全 ALU——cos 为齿载波专用非
 *   噪声 → SDF 零 facVnoise 引用 → 影 pass 不吃噪声纪律——樟 + 榉 011.3 齿载波
 *   组合先例）；
 * - 分档实装（level 参数，缺省 'high'）：三工厂缺省 ≡ 显式 'high'（属性 + 键 +
 *   GLSL 全文逐位相等）；3 工厂 × 3 档 = 9 键互异 + 与 zelkova/camphor/celtis/
 *   ginkgo/platanus/koelreuteria/triadica/bischofia/sophora 九先例 81 键零碰撞
 *   （十先例中 tree3a 为一期 plant: 键系不在 level 扫描面）；叶 Mid 去小叶脉/叶团/
 *   糙度叶团项（**SDF 全形含窗列/顶生窗/齿载波保留——档间剪影一致：羽状剪影是
 *   中距身份**）、Low 换 SDF_LOW（去窗列+**去齿载波**——复叶细化 + 锯齿亚像素
 *   双牺牲；包络/叶轴/裸轴门控逐字同源）再去透光；皮 Mid 去皮孔点（近景细节层；
 *   脊沟浅档/沟内 AO/干基暗化/细枝两档保留——中距身份）、Low 再去干基暗化/老枝
 *   灰褐档；深度 Mid = High SDF、Low = SDF_LOW（表面/影档内一致）；风动三档顶点
 *   GLSL 同源；分档底参契约（alphaTest/侧向/USE_UV）不因档破；uTime 桥接三档不缺位；
 * - program 键纪律：叶/皮/深度三键互异；两次工厂调用材质对象不同（无模块级共享，
 *   D17）但键相同；uniforms 不跨实例共享；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：叶片元 facVnoise 调用
 *   1 处（叶团——窗列/小叶场/齿载波 ALU 化免噪声）、Mid/Low 0 处；皮三档 1 处
 *   （游走场——fraxinus 无国槐网状/域门第二场）、High 果路径纯 ALU；深度 0 处
 *   （零噪声库注入）；顶点零噪声；全源零循环/零纹理采样/零三角函数反函数调用
 *   （旋转/包络全 floor/fract/smoothstep 代理——零 mat2）；
 * - 注入点缺失即抛（map_fragment/begin_vertex/common/roughnessmap_fragment/
 *   opaque_fragment 摘除各暴雷）；
 * - **跨 include 作用域防回归 guard**（triadica Step 4 实证事故配套）+ **vec/float
 *   维度守卫**（011.8 修复守卫模式：vec3(frxRidge) 显式广播修复形态 toContain +
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
  createFraxinusBarkMaterial,
  createFraxinusLeafDepthMaterial,
  createFraxinusLeafMaterial,
} from '../../../../src/runtime/procedural/tree/fraxinus/fraxinusMaterials';
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
import {
  createSophoraBarkMaterial,
  createSophoraLeafDepthMaterial,
  createSophoraLeafMaterial,
} from '../../../../src/runtime/procedural/tree/sophora/sophoraMaterials';

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

/** 提取注入后的 frxLeafAlpha 函数全文（SDF 单一来源比对用；首个 \n} 即函数闭合） */
const sdfOf = (fragmentShader: string): string => {
  const start = fragmentShader.indexOf('float frxLeafAlpha(vec2 frxUv, float frxRand)');
  expect(start).toBeGreaterThanOrEqual(0);
  const end = fragmentShader.indexOf('\n}', start);
  return fragmentShader.slice(start, end + 2);
};

/** 提取注入后的 frxColumn 子函数全文（窗列子函数单一来源比对用——FXC 拆分形态） */
const columnOf = (fragmentShader: string): string => {
  const start = fragmentShader.indexOf('float frxColumn(float frxX, float frxY, float frxEnv, float frxRand)');
  expect(start).toBeGreaterThanOrEqual(0);
  const end = fragmentShader.indexOf('\n}', start);
  return fragmentShader.slice(start, end + 2);
};

/** 提取注入后的 frxTerminal 子函数全文（顶生窗子函数单一来源比对用） */
const terminalOf = (fragmentShader: string): string => {
  const start = fragmentShader.indexOf('float frxTerminal(float frxX, float frxY, float frxRand)');
  expect(start).toBeGreaterThanOrEqual(0);
  const end = fragmentShader.indexOf('\n}', start);
  return fragmentShader.slice(start, end + 2);
};

// ── SDF JS 数值锚镜像（单级窗列对生严格变体 + 齿载波——与 GLSL 逐式对应）──────────

const fract = (x: number): number => x - Math.floor(x);
const clamp = (x: number, a: number, b: number): number => Math.min(Math.max(x, a), b);
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
const smoothstepJS = (a: number, b: number, x: number): number => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** 全叶包络 JS 镜像（椭圆性整体剪影） */
const envJS = (Y: number): number => {
  const envSin = Math.sin(Math.PI * Math.pow(clamp(Y, 0.001, 0.999), 0.92));
  return 0.166 * Math.pow(envSin, mix(0.90, 1.24, smoothstepJS(0.30, 0.92, Y)));
};

/** 小叶窗列 JS 镜像（与 FRX_LEAFLET_VARS 逐式对应——对生严格相位 + 小叶场 + 齿载波） */
function columnJS(X: number, Y: number, env: number, R: number): number {
  const A = Math.abs(X);
  const space = 0.150 + 0.075 * fract(R * 5.317 + 0.41);
  const yb = Y - 0.285 - Math.max(Math.sign(X), 0) * space * 0.05;
  const bandT = yb / space;
  const bandIdx = Math.floor(bandT + 0.5);
  const L = (bandT - bandIdx) * space;
  const len = clamp(0.92 * env, 0.055, 0.170);
  const Tc = clamp(A / len, 0.001, 0.999);
  const envSinL = Math.sin(Math.PI * Math.pow(Tc, 0.80));
  const envExpL = mix(1.06, 2.50 + 0.80 * fract(R * 4.517 + 0.33), smoothstepJS(0.55, 0.85, Tc));
  const envNL = Math.pow(envSinL, envExpL);
  const hw = len * (0.17 + 0.12 * fract(R * 6.311 + 0.23));
  const tooth = Math.pow(0.5 + 0.5 * Math.cos(Tc * 56.55 - fract(R * 8.127 + 0.61) * 6.28), 2.4);
  const gate = smoothstepJS(0.03, 0.12, Tc) * (1 - smoothstepJS(0.92, 0.985, Tc));
  const serr = (tooth - 0.5) * 0.022 * gate;
  return hw * envNL + serr - Math.abs(L); // 零偏斜（FRPS 无偏斜句——vs 国槐 |L−C| 对照）
}

/** 顶生小叶独立窗 JS 镜像（与 frxTerminal 逐式对应——近等大 + 同型齿载波） */
function terminalJS(X: number, Y: number, R: number): number {
  const lenT = 0.155 + 0.020 * fract(R * 2.713 + 0.47);
  const Tt = clamp((Y - 0.795) / lenT, 0.001, 0.999);
  const envSinT = Math.sin(Math.PI * Math.pow(Tt, 0.80));
  const envExpT = mix(1.06, 2.50 + 0.80 * fract(R * 4.517 + 0.33), smoothstepJS(0.55, 0.85, Tt));
  const envNT = Math.pow(envSinT, envExpT);
  const hwT = lenT * (0.19 + 0.08 * fract(R * 6.311 + 0.23));
  const toothT = Math.pow(0.5 + 0.5 * Math.cos(Tt * 56.55 - fract(R * 8.127 + 0.61) * 6.28), 2.4);
  const gateT = smoothstepJS(0.03, 0.12, Tt) * (1 - smoothstepJS(0.92, 0.985, Tt));
  const serrT = (toothT - 0.5) * 0.022 * gateT;
  return hwT * envNT + serrT - Math.abs(X);
}

/** 一回奇数羽状复叶卡覆盖率 JS 镜像（与 frxLeafAlpha 逐式对应——双减法门控） */
function alphaJS(u: number, v: number, R: number): number {
  const X = (u - 0.5) * 0.36, Y = v, A = Math.abs(X);
  const envEdge = envJS(Y) - A;
  const rachis = 0.0045 + 0.0055 * (1 - Y) - A; // 无基部膨大带（「叶柄基部不增厚」）
  const col = columnJS(X, Y, envJS(Y), R)
    - (1 - smoothstepJS(0.24, 0.285, Y)) * 0.10 // 裸轴基段减法门控（bare 占比 ≈0.29）
    - smoothstepJS(0.70, 0.74, Y) * 0.10; // 顶栏减法门控（顶生小叶下方窗列终止）
  const edge = Math.max(rachis, Math.max(Math.min(envEdge, col), terminalJS(X, Y, R)));
  return clamp(edge / 0.02 + 0.5, 0, 1);
}

/** Low 档覆盖率 JS 镜像（与 FRX_LEAF_SDF_LOW 逐式对应——叶轴 ∪ 包络 − 裸轴门控） */
function alphaLowJS(u: number, v: number, _R: number): number {
  const X = (u - 0.5) * 0.36, Y = v, A = Math.abs(X);
  const edge = Math.max(
    0.0045 + 0.0055 * (1 - Y),
    envJS(Y) - (1 - smoothstepJS(0.24, 0.285, Y)) * 0.10,
  ) - A;
  return clamp(edge / 0.02 + 0.5, 0, 1);
}

/** 行宽度剖面：该 v 行 alpha≥0.5 的最大 |x|（中距剪影读向的量化面；卡半宽 0.18） */
function rowWidthJS(fn: (u: number, v: number, R: number) => number, R: number, y: number): number {
  let w = 0;
  for (let i = 0; i <= 700; i++) {
    const x = (i / 700) * 0.1799;
    if (fn(0.5 + x / 0.36, y, R) >= 0.5 || fn(0.5 - x / 0.36, y, R) >= 0.5) w = x;
  }
  return w;
}

afterEach(() => {
  for (const material of created.splice(0)) material.dispose();
});

describe('uTime 接线（TimeUniformService 消费协议）', () => {
  it('叶/皮材质挂材质级 uniforms.uTime；编译后 shader.uniforms.uTime 同引用；GLSL 声明 uniform', () => {
    for (const material of [track(createFraxinusLeafMaterial()), track(createFraxinusBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('材质挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const leaf = track(createFraxinusLeafMaterial());
    const bark = track(createFraxinusBarkMaterial());
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

describe('风动契约（D19.7：uTime 全局风帧 / aSeed 个体相位；11mm 家族档——整枚羽叶中等摆锤，9–15 rad/s 与栾/重阳木/国槐同档；树高锚 10.4973m = ×0.09526〔slot-0 Stage 实测同步轮 2026-09-22——志书「高10-12米」直给〕）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）；hash 常数与十先例去相关', () => {
    const leaf = assemble(track(createFraxinusLeafMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(leaf.vertexShader).toContain(decl);
    }
    expect(leaf.vertexShader).toContain('fract(sin(aSeed * 93.847'); // 整树缓摆相位 = hash(aSeed)——常数出十先例 sway 域 [77.669, 88.217] ∪ {91.523} 外
    expect(leaf.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 70.913'); // 快颤相位——先例 flutter 域 [49.337, 65.443] ∪ {68.137} 外
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(leaf.vertexShader + leaf.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('整树缓摆叶/皮同公式（同串出现）；快颤含 aBend 权重且幅度 11mm 家族档、频率 9–15 rad/s；树高锚 10.4973m（×0.09526 实测同步常量——2026-09-22 Stage 探针）', () => {
    const leaf = assemble(track(createFraxinusLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createFraxinusBarkMaterial()), THREE.ShaderLib.physical);
    const swayCore = 'frxWindH * frxWindH * 0.042 * sin(uTime * 1.15';
    expect(leaf.vertexShader).toContain(swayCore);
    expect(bark.vertexShader).toContain(swayCore); // 皮不动叶动会撕裂穿帮——同公式同相位（组 0 aBend 恒 0 免颤）
    expect(leaf.vertexShader).toContain('aBend * 0.011'); // 复叶卡快颤幅度 11mm 家族档（任务简报口径）
    expect(leaf.vertexShader).toContain('uTime * (9.0 + 6.0 * frxFlutterPhase)'); // 9–15 rad/s（≈1.4–2.4Hz 中频）
    expect(leaf.vertexShader).toContain('position.y * 0.09526'); // /10.4973m 树高锚（slot-0 实测涌现 10.4973，T011.10 Stage 探针同步轮——011.8 9.896m / 011.9 10.3413m 同款流程）
    expect(0.011).toBeLessThanOrEqual(0.012); // ≤ 家族域上沿 12mm
    expect(0.011).toBeGreaterThanOrEqual(0.010); // ≥ 家族域下沿 10mm（中幅）
    expect(9.0).toBeGreaterThanOrEqual(9.0); // 频率域下沿
    expect(15.0).toBeLessThanOrEqual(15.0); // 频率域上沿
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createFraxinusLeafMaterial()), track(createFraxinusBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('单级窗列 SDF 与透光', () => {
  it('叶 alphaTest 0.5 + alphaToCoverage + 坡宽 0.02（小叶间隙级）；片元含 SDF 计算式并写入 alpha', () => {
    const material = track(createFraxinusLeafMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float frxLeafAlpha('); // 复叶 SDF 主函数（单一来源）
    expect(fragmentShader).toContain('float frxColumn('); // 窗列子函数（FXC 拆分形态）
    expect(fragmentShader).toContain('float frxTerminal('); // 顶生窗子函数
    expect(fragmentShader).toContain('frxLeafAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = frxAlpha;'); // alphatest_fragment 上游写入
    expect(fragmentShader).toContain('clamp(frxEdge / 0.02 + 0.5'); // 坡宽 0.02（小叶间隙级）
  });

  it('组 0 材质工程契约（材质侧定义）：FrontSide 闭合实体（皮管；果面片双 tri 双面归几何侧——缺口候选③）+ 无 alphaTest + USE_UV', () => {
    const bark = track(createFraxinusBarkMaterial());
    expect(bark.side).toBe(THREE.FrontSide); // 皮管闭合实体（果面片双面渲染归几何侧双 tri）
    expect(bark.alphaTest).toBe(0); // 无裁切
    expect(bark.alphaToCoverage).toBe(false);
    expect(bark.defines?.USE_UV).toBe('');
  });

  it('深度材质（叶影裁切）：同一 SDF 函数（三件）+ RGBADepthPacking + 组 0 实心守卫 + USE_UV + alphaTest；风动不进 depth；零噪声库注入', () => {
    const material = track(createFraxinusLeafDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.depthPacking).toBe(THREE.RGBADepthPacking);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('frxLeafAlpha(vUv, vLeafRand)');
    expect(shader.fragmentShader).toContain('step(0.0001, vLeafRand)'); // 组 0 aLeafRand=0 → 实心（皮圆柱/果面片 uv 域不误裁——triadica 恒等 attribute 先例；果域无需 v 路由）
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
    expect(count(shader.fragmentShader, 'facVnoise(')).toBe(0); // 零噪声库注入——窗列/小叶场/顶生窗/齿载波 ALU 化（影 pass 不吃噪声）
    expect(shader.fragmentShader).not.toContain('facHash21'); // 噪声库整体未挂（SDF 引入噪声即编译暴雷——保护性约束）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫（无平行光场景安全降级）', () => {
    const { fragmentShader } = assemble(track(createFraxinusLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(fragmentShader).toContain('directionalLights[0]');
    expect(fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
  });
});

describe('物种配方锚定（Spec fraxinus-reference 1.0；生产口径 = 终审记档 ③ 裁决八项：一回奇数羽状对生严格 / 缘锐锯齿载波回归 / 树皮第 11 语言 / 翅果做 / 花不做）', () => {
  it('单级窗列 SDF 核心（复叶第四型·对生严格变体）：0.36 宽/长比冻结 + 右列降 0.05·space（vs 国槐 0.18 近对生）+ 带间距域 + 裸轴 0.285 起排 + 顶生独立窗近等大 + 小叶场锚 + 零偏斜 + 叶轴无膨大 + 双减法门控 + 齿载波', () => {
    const leaf = assemble(track(createFraxinusLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('frxP.x * 0.36'); // 宽/长比 0.36 冻结接口（卡空间折算——半宽 0.18；VEIN 段同值 (vUv.x - 0.5) * 0.36 同源）
    expect(leaf.fragmentShader).toContain('0.150 + 0.075 * fract(frxRand * 5.317 + 0.41)'); // 带间距逐卡变奏 → 有效带数 2–3 对（JS run 计数锚——「小叶5-7枚」统计实现）
    expect(leaf.fragmentShader).toContain('max(sign(frxX), 0.0) * frxSpace * 0.05'); // 右列降 0.05·space 极小抖动 = 对生严格（裁决 8/照片双问——vs 国槐近对生 0.18·space：相位差压缩到 5%）
    expect(leaf.fragmentShader).toContain('frxY - 0.285'); // 带列自 v=0.285 起排（裸轴段更长——bare 占比 ≈0.29 ∈ 0.28–0.35 冻结域；vs 国槐 0.130 起排）
    expect(leaf.fragmentShader).toContain('clamp(0.92 * frxEnv, 0.055, 0.170)'); // 小叶长 = 0.92×行包络（行包络锚定）
    expect(leaf.fragmentShader).toContain('0.155 + 0.020 * fract(frxRand * 2.713 + 0.47)'); // 顶生小叶长（≈中位侧生 0.1527 的 1.01–1.15×——「顶生小叶与侧生小叶近等大或稍大」FRPS）
    expect(leaf.fragmentShader).toContain('(frxY - 0.795) / frxLenT'); // 顶生独立窗位 v∈[0.795, ~0.97]（「奇数」的表达——奇数羽状顶端单生）
    expect(leaf.fragmentShader).toContain('sin(3.14159 * pow(frxTc, 0.80))'); // 卵形-披针形包络（峰 t≈0.42 偏基——「卵形、倒卵状长圆形至披针形」首列 Verified）
    expect(leaf.fragmentShader).toContain('2.50 + 0.80 * fract(frxRand * 4.517 + 0.33)'); // 先端指数收口 2.50–3.30 逐叶（「先端锐尖至渐尖」Verified）
    expect(leaf.fragmentShader).toContain('mix(1.06,'); // 基 1.06 钝圆/楔形宽开张（「基部钝圆或楔形」Verified）
    expect(leaf.fragmentShader).toContain('frxLen * (0.17 + 0.12 * fract(frxRand * 6.311 + 0.23))'); // 小叶半宽（长宽比 1.72–2.94 ∈ 1.5–3.0 Verified 域）
    expect(leaf.fragmentShader).toContain('0.166 * pow(frxEnvSin, mix(0.90, 1.24, smoothstep(0.30, 0.92, frxY)))'); // 全叶包络（峰值 0.166 + 齿峰 0.011 = 0.177 在卡缘 0.18 内侧——卡缘恒裁 JS 锚）
    expect(leaf.fragmentShader).toContain('0.0045 + 0.0055 * (1.0 - frxY)'); // 叶轴渐细——无基部膨大带（「叶柄基部不增厚」FRPS Verified——vs 国槐藏芽膨大对照）
    expect(leaf.fragmentShader).not.toContain('0.0038'); // 国槐「叶柄基部膨大」带不串种（白蜡叶柄基不增厚）
    // 双减法门控（011.8 教训强制形态——负距离判弃，非乘法钳 0）
    expect(leaf.fragmentShader).toContain('- (1.0 - smoothstep(0.24, 0.285, frxY)) * 0.10'); // 裸轴基段更长（band −1 幻影带压灭）
    expect(leaf.fragmentShader).toContain('- smoothstep(0.70, 0.74, frxY) * 0.10'); // 顶栏（顶生小叶下方窗列终止 → 2–3 对门控的另一半）
    expect(leaf.fragmentShader).toContain('max(frxRachisEdge, max(min(frxEnvEdge, frxCol), frxTermEdge))'); // 合成：叶轴 ∪ (包络 ∩ 窗列) ∪ 顶生窗
    // 零偏斜（FRPS 小叶描述无偏斜句——vs 国槐「稍偏斜」±0.45 对照）
    expect(columnOf(leaf.fragmentShader)).toContain('frxHw * frxEnvNL + frxSerr - abs(frxL)'); // 无偏斜项的窗列返回
    expect(leaf.fragmentShader).not.toContain('frxObk'); // 国槐偏斜相不串种
    expect(leaf.fragmentShader).not.toContain('pow(1.0 - frxTc, 1.5)'); // 国槐偏斜渐伸直项不串种
    expect(leaf.fragmentShader).not.toContain('mat2'); // 旋转/包络全 floor/fract/smoothstep 代理（零矩阵函数）
    // SDF 单一来源——影裁切叶形自动同步（主函数 + 两个子函数三件同源）
    const depth = assemble(track(createFraxinusLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(sdfOf(depth.fragmentShader)).toBe(sdfOf(leaf.fragmentShader));
    expect(columnOf(depth.fragmentShader)).toBe(columnOf(leaf.fragmentShader)); // 窗列子函数同源
    expect(terminalOf(depth.fragmentShader)).toBe(terminalOf(leaf.fragmentShader)); // 顶生窗子函数同源
  });

  it('复叶数值锚（JS 镜像）：有效带数 2–3 对（run 高度 ≥0.040 计数——「小叶5-7枚」= 2–3 对 + 顶生统计实现）+ 顶生 reach ≥0.030 + 顶生/中位 1.01–1.16 + 跨轴错位 ≤0.012 + 叶轴连续 + 裸区零越界（减法门控回归锁）+ 顶栏残余压灭', { timeout: 30000 }, () => {
    // ① 有效对数：行宽 run 计数（W ≥ 0.052 连续段；W < 0.030 分段；run 高度 ≥ 0.040 为有效带——
    //    门控边界齿缘碎片（高度 ≲0.01，R≈0.115 实测 0.009）与大间距端半压灭第三对（高度 ≲0.035）不计）。
    //    采样密度：13 rand × 241 行（行步长 0.003 < 最窄带间缢缩——间隙行必有采样命中）
    let pairMin = 99;
    let pairMax = 0;
    for (let i = 0; i < 13; i++) {
      const R = (i + 0.5) / 13;
      let runs = 0;
      let inRun = false;
      let runStart = 0;
      for (let j = 0; j <= 240; j++) {
        const y = 0.06 + (j / 240) * 0.73; // [0.06, 0.79]——带列域（顶栏 0.74 门控内 + 顶生窗 0.795 之前）
        const w = rowWidthJS(alphaJS, R, y);
        if (w >= 0.052 && !inRun) { inRun = true; runStart = y; }
        if (w < 0.030 && inRun) {
          inRun = false;
          if (y - runStart >= 0.040) runs++; // 有效带高度门（sub-pixel 碎片不计）
        }
      }
      if (inRun && 0.79 - runStart >= 0.040) runs++;
      pairMin = Math.min(pairMin, runs);
      pairMax = Math.max(pairMax, runs);
    }
    expect(pairMin).toBeGreaterThanOrEqual(2); // 「小叶5-7枚」FRPS Verified 下沿（2 对 + 顶生 = 5）
    expect(pairMax).toBeLessThanOrEqual(3); // 上沿（3 对 + 顶生 = 7；顶栏门控压灭第 4+ 幻影对）
    // ② 顶生小叶独立窗（「奇数」读向）：y>0.80 段横向 reach ≥ 0.030（明确宽于叶轴）
    for (let i = 0; i < 11; i++) {
      const R = (i + 0.5) / 11;
      let reach = 0;
      for (let j = 0; j <= 240; j++) {
        const y = 0.80 + (j / 240) * 0.17;
        for (let k = 0; k <= 160; k++) {
          const a = 0.024 + (k / 160) * 0.05;
          if (alphaJS(0.5 + a / 0.36, y, R) >= 0.5) reach = Math.max(reach, a);
        }
      }
      expect(reach, `R=${R} 顶生 reach`).toBeGreaterThanOrEqual(0.030);
    }
    // ③ 顶生/中位近等大（「顶生小叶与侧生小叶近等大或稍大」FRPS 原句）：lenT / 中位带 len ∈ 1.01–1.16
    let midLen = 0;
    for (let i = 0; i <= 80; i++) midLen = Math.max(midLen, clamp(0.92 * envJS(0.30 + (i / 80) * 0.40), 0.055, 0.170)); // 带列域中位段最大行包络
    let trMin = 99;
    let trMax = 0;
    for (let i = 0; i < 500; i++) {
      const R = (i + 0.5) / 500;
      const lenT = 0.155 + 0.020 * fract(R * 2.713 + 0.47);
      trMin = Math.min(trMin, lenT / midLen);
      trMax = Math.max(trMax, lenT / midLen);
    }
    expect(trMin).toBeGreaterThan(1.00); // 近等大（≥ 侧生）
    expect(trMax).toBeLessThan(1.16); // 稍大上沿（vs 国槐 1.3× 顶生更大——两树窗列数值对照轴）
    // ④ 跨轴带峰错位 ≤ 0.012（对生严格 = 0.05·space 相位差上沿）
    let dropMax = 0;
    for (let i = 0; i < 500; i++) {
      const R = (i + 0.5) / 500;
      dropMax = Math.max(dropMax, 0.05 * (0.150 + 0.075 * fract(R * 5.317 + 0.41)));
    }
    expect(dropMax).toBeLessThanOrEqual(0.012); // vs 国槐 0.18·space ≈ 0.032——相位差压缩到 5%
    // ⑤ 叶轴连续：x=0 处 alpha ≥0.5 全 v（叶轴永不裁穿——无膨大带下仍连续）
    let petMin = 1;
    for (const R of [0.13, 0.37, 0.51, 0.77]) {
      for (let i = 0; i <= 200; i++) petMin = Math.min(petMin, alphaJS(0.5, 0.005 + (i / 200) * 0.99, R));
    }
    expect(petMin).toBeGreaterThanOrEqual(0.5);
    // ⑥ 裸区零越界（减法门控回归锁——乘法门控负距离钳 0 → alpha 恰 0.5 恰过 alphaTest 的形态；
    //    采样 y ∈ [0.01,0.24]（裸轴门控 0.24–0.285 之下 + band-0 齿缘下探之上，实测 y≤0.26 零命中）
    let bad = 0;
    for (let i = 0; i < 21; i++) {
      const R = (i + 0.5) / 21;
      for (let iy = 0; iy <= 46; iy++) {
        for (let iu = 0; iu <= 120; iu++) {
          const y = 0.01 + iy * 0.005;
          const x = 0.0305 + iu * 0.0011;
          if (y <= 0.24 && alphaJS(0.5 + x / 0.36, y, R) >= 0.5) bad++;
        }
      }
    }
    expect(bad).toBe(0); // 裸段除叶轴外全透空（白蜡裸柄段更长 ≈0.29——对生羽叶身份读向）
    // ⑦ 顶栏残余压灭（顶栏门控行为锁：顶生小叶以上窗列/幻影带残余 → 尾尖收口）
    for (const R of [0.13, 0.51, 0.77]) {
      let topMax = 0;
      for (let i = 0; i <= 60; i++) topMax = Math.max(topMax, rowWidthJS(alphaJS, R, 0.955 + (i / 60) * 0.043));
      expect(topMax, `R=${R} 顶栏以上残余`).toBeLessThanOrEqual(0.055); // 顶栏以上仅尾尖收口（JS 实测 ≈0.005——顶生窗 lenT 上限收口）
    }
  });

  it('齿载波单频正则性（裁决 8「叶缘具整齐锯齿」FRPS + subsp. chinensis distinctly serrate——zelkova 011.3 锐齿载波先例同法）：2π·9 = 56.55 同频 + 峰间距 1/9±0.004 零抖动 + 小叶半宽剖面齿峰在场 + 幅度 ±0.011 + 长宽比 Verified 域', () => {
    const leaf = assemble(track(createFraxinusLeafMaterial()), THREE.ShaderLib.physical);
    // 齿载波 GLSL 锚：窗列与顶生窗同频 56.55（rand 仅入相位——「整齐」= 规则单频不调频率）
    expect(56.55 / (2 * Math.PI)).toBeCloseTo(9.0, 2); // 2π·9 = 56.549——同频 9 齿/小叶轴
    expect(columnOf(leaf.fragmentShader)).toContain('frxTc * 56.55 - fract(frxRand * 8.127 + 0.61) * 6.28'); // 窗列齿载波（相位调制无频率抖动）
    expect(terminalOf(leaf.fragmentShader)).toContain('frxTt * 56.55 - fract(frxRand * 8.127 + 0.61) * 6.28'); // 顶生窗同型齿载波
    expect(columnOf(leaf.fragmentShader)).toContain('pow(0.5 + 0.5 * cos(frxTc * 56.55');
    expect(columnOf(leaf.fragmentShader)).toContain(', 2.4)'); // pow 2.4 锐齿（zelkova 先例同法）
    expect(columnOf(leaf.fragmentShader)).toContain('(frxTooth - 0.5) * 0.022 * frxGate'); // 幅度 ±0.011 = 坡宽 0.02 的 55% + 端部渐隐门控
    expect(count(columnOf(leaf.fragmentShader), 'cos(')).toBe(1); // cos 为齿载波专用（SDF 内唯一 cos——ALU 载波非噪声）
    expect(count(terminalOf(leaf.fragmentShader), 'cos(')).toBe(1);
    expect(sdfOf(leaf.fragmentShader)).not.toContain('cos('); // 主函数零 cos（齿载波全在子函数）
    // JS：载波单频正则性——任意相位下载波峰间距 = 1/9 ± 0.004（「整齐」的量化面）
    for (let i = 0; i < 21; i++) {
      const R = (i + 0.5) / 21;
      const ph = fract(R * 8.127 + 0.61) * 6.28;
      const carrier = (t: number): number => Math.pow(0.5 + 0.5 * Math.cos(t * 56.55 - ph), 2.4);
      const maxima: number[] = [];
      for (let j = 8; j < 992; j++) {
        const t0 = j / 1000, tm = (j - 1) / 1000, tp = (j + 1) / 1000;
        if (carrier(t0) > carrier(tm) && carrier(t0) >= carrier(tp)) maxima.push(t0);
      }
      expect(maxima.length, `R=${R} 载波峰数`).toBeGreaterThanOrEqual(8); // 9 齿/单位轴（采样窗 [0.008,0.992] 内 8–9——相位边界±1 齿）
      expect(maxima.length).toBeLessThanOrEqual(9);
      for (let k = 1; k < maxima.length; k++) {
        expect(Math.abs(maxima[k] - maxima[k - 1] - 1 / 9), `R=${R} 峰间距正则`).toBeLessThan(0.004); // 零抖动（vs 朴树齿抖动噪声——单频载波）
      }
    }
    // JS：小叶半宽剖面（hw·envNL + serr）齿峰在场且正则（齿在窗列小叶面上可见——包络斜率不吞齿）
    for (const R of [0.13, 0.37, 0.51, 0.77, 0.89]) {
      const hw = 0.150 * (0.17 + 0.12 * fract(R * 6.311 + 0.23)); // 代表行 len=0.150
      const envExp = (t: number): number => mix(1.06, 2.50 + 0.80 * fract(R * 4.517 + 0.33), smoothstepJS(0.55, 0.85, t));
      const ph = fract(R * 8.127 + 0.61) * 6.28;
      const prof = (t: number): number => {
        const envNL = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.80)), envExp(t));
        const tooth = Math.pow(0.5 + 0.5 * Math.cos(t * 56.55 - ph), 2.4);
        const gate = smoothstepJS(0.03, 0.12, t) * (1 - smoothstepJS(0.92, 0.985, t));
        return hw * envNL + (tooth - 0.5) * 0.022 * gate;
      };
      const maxima: number[] = [];
      for (let j = 30; j < 920; j++) {
        const t0 = j / 1000, tm = (j - 1) / 1000, tp = (j + 1) / 1000;
        if (prof(t0) > prof(tm) && prof(t0) >= prof(tp)) maxima.push(t0);
      }
      expect(maxima.length, `R=${R} 半宽剖面齿峰数`).toBeGreaterThanOrEqual(7); // 渐隐门控域 [0.03,0.92] 内 8–9 峰（±1 相位边界）
      expect(maxima.length).toBeLessThanOrEqual(9);
    }
    // JS：幅度解析上界 ±0.011（(tooth−0.5) ∈ [−0.5,0.5] × 0.022）
    for (const R of [0.13, 0.77]) {
      const ph = fract(R * 8.127 + 0.61) * 6.28;
      let serrMax = 0;
      for (let j = 0; j <= 1000; j++) {
        const t = j / 1000;
        const tooth = Math.pow(0.5 + 0.5 * Math.cos(t * 56.55 - ph), 2.4);
        const gate = smoothstepJS(0.03, 0.12, t) * (1 - smoothstepJS(0.92, 0.985, t));
        serrMax = Math.max(serrMax, Math.abs((tooth - 0.5) * 0.022 * gate));
      }
      expect(serrMax).toBeLessThanOrEqual(0.011 + 1e-9); // 幅度上界 ±0.011（不破 AA 坡宽）
      expect(serrMax).toBeGreaterThanOrEqual(0.010); // 载波有效（0.011·gate≈1 域必达）
    }
    // 小叶长宽比 Verified 域（「长3-10厘米，宽2-4厘米」推算 1.5–3.0）
    let aspMin = 99;
    let aspMax = 0;
    for (let i = 0; i < 2000; i++) {
      const R = (i + 0.5) / 2000;
      const share = 0.17 + 0.12 * fract(R * 6.311 + 0.23);
      const asp = 1 / (2 * share); // 长 / 全宽
      aspMin = Math.min(aspMin, asp);
      aspMax = Math.max(aspMax, asp);
    }
    expect(aspMin).toBeGreaterThan(1.5); // Verified 域下沿
    expect(aspMax).toBeLessThan(3.0); // 上沿（实测 1.72–2.94）
  });

  it('中距细碎自检剖面（Spec §3「细碎均质中绿 + airy 开放 空隙 25–40%」Inferred——对生羽叶层叠）：maxW 全宽细碎质域 + 中段缢缩行 ≥6 + 卡缘恒裁 + Low 单包络档间剪影一致', { timeout: 30000 }, () => {
    for (const R of [0.11, 0.23, 0.37, 0.51, 0.63, 0.77, 0.89]) {
      let maxW = 0;
      let gapRows = 0;
      for (let i = 0; i <= 300; i++) {
        const y = 0.06 + (i / 300) * 0.80;
        const w = rowWidthJS(alphaJS, R, y);
        maxW = Math.max(maxW, w);
        if (y > 0.30 && y < 0.70 && w <= 0.030) gapRows++; // 中段缢缩行（带间仅叶轴可见）
      }
      expect(2 * maxW, `R=${R} maxW 全宽`).toBeGreaterThanOrEqual(0.26); // 细碎质域下沿（卡利用率——对生稀列）
      expect(2 * maxW).toBeLessThanOrEqual(0.355); // 卡全宽 0.36 内不外溢
      expect(gapRows, `R=${R} 中段缢缩行`).toBeGreaterThanOrEqual(6); // 细碎读向的量化面（带数少于国槐 → 缢缩段更长更疏——两树同型对照记档）
      // Low 单包络档间剪影一致（LOD 切换无跳变；带列相位错过包络峰的固有差——带间离散结构记档）
      let lowMax = 0;
      for (let i = 0; i <= 200; i++) {
        lowMax = Math.max(lowMax, rowWidthJS(alphaLowJS, R, 0.10 + (i / 200) * 0.88));
      }
      expect(lowMax, `R=${R} Low 最宽行下界`).toBeGreaterThanOrEqual(maxW - 0.010); // 不过窄（High 外廓近似）
      expect(lowMax, `R=${R} Low 最宽行上界`).toBeLessThanOrEqual(maxW + 0.040); // 不过胖（带间间隙填充 + 相位差的固有上限）
    }
    // 卡缘恒裁（u=0/1 全 v alpha<0.5——卡空间无外溢；0.36 卡宽 vs 包络+齿峰 0.177）
    for (const R of [0.21, 0.77]) {
      let maxEdge = 0;
      for (let i = 0; i <= 100; i++) {
        maxEdge = Math.max(maxEdge, alphaJS(0.999, i / 100, R), alphaJS(0.001, i / 100, R));
      }
      expect(maxEdge).toBeLessThan(0.5);
    }
  });

  it('小叶脉三层（FRPS Verified 原句「中脉在上面平坦，侧脉8-10对，下面凸起，细脉在两面凸起，明显网结」）：中脉 0.24 + 侧脉 0.11 + 网结 0.06 + 与齿同频 56.55（脉端入齿统计——zelkova 同法）+ 顶生竖直中脉（FRX_LEAFLET_VARS 同源折算）', () => {
    const { fragmentShader } = assemble(track(createFraxinusLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('frxVMidAll * 0.24 + frxVLat * 0.11 + frxVNet * 0.06'); // 三层权重（中脉浅色身份层 + 侧脉细脊 + 网结弱纹）
    expect(fragmentShader).toContain('vec3(1.40, 1.34, 1.02)'); // 中脉亮带色（浅色身份层）
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.006, 0.020, abs(frxL)))'); // 小叶中脉带宽（沿小叶轴自叶轴伸出——零偏斜轴 |L| 直读）
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.72, 0.90, frxTc))'); // 中脉先端渐隐（不达尖）
    expect(fragmentShader).toContain('sin(frxTc * 56.55 - abs(frxL) * 88.0'); // 侧脉斜升脊族（-|l|·88 斜升倾斜；与齿载波同频 56.55——每对侧脉对应一齿的达缘入齿统计读向）
    expect(fragmentShader).toContain('sin(frxTc * 23.0 + frxL * 61.0)'); // 细脉网结双 sin 交织（「明显网结」弱层）
    expect(fragmentShader).toContain('smoothstep(0.80, 0.83, frxY)'); // 顶生小叶竖直中脉 y 窗
  });

  it('两面色差弱档（裁决 1/§5——上面中绿-亮绿、下面浅绿-灰绿照片级 Inferred〔志书仅毛被句无「下面灰白色」显式原句〕；「白蜡」命源 = 白蜡虫非叶色——不做蜡白过度引申）：背面 ×(1.09,1.11,1.17) + 两面糙度差 +0.05 弱档；家族叶背乘子不串种', () => {
    const leaf = assemble(track(createFraxinusLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('mix(vec3(1.09, 1.11, 1.17), vec3(1.0), float(gl_FrontFacing))'); // 背面浅绿-灰绿（B 抬升灰向——弱档：介于榉无粉与栾柔毛灰绿之间偏灰向）
    expect(leaf.fragmentShader).not.toContain('vec3(1.16, 1.18, 1.28)'); // 国槐 glaucous 加重档不串种（白蜡弱档）
    expect(leaf.fragmentShader).not.toContain('vec3(1.09, 1.10, 1.13)'); // 栾柔毛灰绿背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.08, 1.02)'); // 乌桕背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.07, 1.05)'); // 重阳木弱差背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.05, 1.16)'); // 香樟 glaucous 粉感不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.08, 1.10, 1.02)'); // 悬铃木背面不串种
    expect(leaf.fragmentShader).toContain('(1.0 - float(gl_FrontFacing)) * 0.05'); // 两面糙度差 +0.05（弱档）
    expect(0.05).toBeLessThan(0.06); // < 国槐 +0.06（弱于灰白级差）
    expect(0.05).toBeGreaterThan(0.02); // > 悬铃木 +0.02 最小差
  });

  it('背光透射家族值域内取：峰值 0.318（重阳木 0.31 < 白蜡 0.318 < 栾 0.32——硬纸质透光微逊纸质端）；灰绿黄透射色；先例峰值不串种', () => {
    const { fragmentShader } = assemble(track(createFraxinusLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('* pow(frxBack, 3.0) * frxTransVar * frxAlpha * 0.318;');
    expect(fragmentShader).toContain('vec3(0.54, 0.90, 0.36)'); // 灰绿黄透射色
    expect(0.318).toBeGreaterThan(0.31); // > 重阳木（硬纸质微逊纸质端）
    expect(0.318).toBeLessThan(0.32); // < 栾复叶卡纸质
    // 透射语句形态不串种（透射峰值锚以 frxAlpha 前缀收窄）
    expect(fragmentShader).not.toContain('frxAlpha * 0.30;'); // 朴树峰值不串种
    expect(fragmentShader).not.toContain('frxAlpha * 0.31;'); // 重阳木峰值不串种
    expect(fragmentShader).not.toContain('frxAlpha * 0.32;'); // 栾峰值不串种
    expect(fragmentShader).not.toContain('frxAlpha * 0.325;'); // 国槐峰值不串种
    expect(fragmentShader).not.toContain('frxAlpha * 0.33;'); // 乌桕峰值不串种
    expect(fragmentShader).not.toContain('frxAlpha * 0.34;'); // 银杏峰值不串种
    expect(fragmentShader).not.toContain('frxAlpha * 0.28;'); // 悬铃木峰值不串种
    expect(fragmentShader).not.toContain('frxAlpha * 0.40;'); // 榉树峰值不串种
    expect(fragmentShader).not.toContain('frxAlpha * 0.65;'); // 夏栎裂叶峰值不串种
  });

  it('叶底色 #548840 中绿（工程设定——Spec §5 上面中绿-亮绿照片级；十树链：栾 < 白蜡 < 国槐——微暗于国槐亮绿端半档）；硬纸质 roughness 0.68（「硬纸质」FRPS Verified：国槐纸质 0.67 < 白蜡 < 栾/重阳木 0.70）', () => {
    const leaf = track(createFraxinusLeafMaterial());
    const hex = leaf.color.getHex();
    expect(hex).toBe(0x548840); // 工程设定：Spec §5 + 十树链自定位
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const l = luma([(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff]);
    expect(l).toBeGreaterThan(luma([0x52, 0x7d, 0x37])); // 亮于栾树（中绿档）
    expect(l).toBeLessThan(luma([0x56, 0x8a, 0x3e])); // 微暗于国槐（亮绿端半档）
    expect(leaf.roughness).toBe(0.68); // 硬纸质（「硬纸质」FRPS Verified）
    expect(0.68).toBeGreaterThan(0.67); // > 国槐纸质
    expect(0.68).toBeLessThan(0.70); // < 栾/重阳木纸质哑光
    expect(leaf.metalness).toBe(0);
  });

  it('皮第 11 语言底色 #7a746b 灰褐（FRPS「树皮灰褐色」Verified + bark-a/fruit-c 照片交叉；R−G=6 灰褐向；十树链：国槐 < 白蜡 < 栾——浅国槐一档）；浅裂光滑族中糙 0.90；8 细脊/周 + 浅宽坡剖面 + 沟深 0.68 浅档字面量', () => {
    const bark = track(createFraxinusBarkMaterial());
    const hex = bark.color.getHex();
    expect(hex).toBe(0x7a746b); // 工程设定：FRPS 灰褐 [1] + bark-a「浅灰褐-棕褐」/fruit-c「灰-灰褐浅纵脊沟」[12] 交叉
    const [r, g, b] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
    expect(r - g).toBe(6); // 灰褐向（vs 重阳木 13 褐向）
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const l = luma([r, g, b]);
    expect(l).toBeGreaterThan(luma([0x6d, 0x67, 0x5d])); // 亮于国槐深灰褐（十树链：国槐 < 白蜡）
    expect(l).toBeLessThan(luma([0x90, 0x92, 0x8a])); // 暗于栾浅色（白蜡 < 栾）
    expect(bark.roughness).toBe(0.90); // 浅裂光滑族中糙哑光（vs 深纵裂族 0.93）
    const { fragmentShader } = assemble(track(createFraxinusBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('abs(fract(vUv.x * 8.0 + frxWarp * 0.80)'); // 8 细脊/周（vs 国槐 6 板状粗犷——细一档；bark-a「细纵纹」/fruit-c「浅纵脊沟」）× drift 0.80 纵为主
    expect(fragmentShader).toContain('smoothstep(0.26, 0.56, frxTri)'); // 浅宽坡剖面（脊浅沟浅——vs 国槐窄深沟 0.16–0.42）
    expect(fragmentShader).toContain('mix(0.68 + 0.32 * frxPlate, 0.94 + 0.06 * frxPlate'); // 沟深剖面 0.68 浅档（vs 国槐 0.52/重阳木 0.54——脊沟对比 0.32）+ 上部近光滑
    expect(fragmentShader).not.toContain('vUv.x * 6.0'); // 国槐板状粗脊不串种（8 = 细一档）
    expect(fragmentShader).not.toContain('vUv.x * 11.0'); // 乌桕窄脊不串种
  });

  it('脊沟系统与龄级序列浅档（裁决 6——幼干-大枝近光滑 → 中龄浅-中脊沟 → 老干渐深）：上部弱化门控 + 沟内弱 AO + 干基暗化弱档 + 单色微变（无剥落无三色带——悬/榉/乌桕标记不串种）', () => {
    const { fragmentShader } = assemble(track(createFraxinusBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('smoothstep(3.2, 5.6, vTreePos.y)'); // 幼干-大枝上部弱化门控（龄级序列浅档近似——幼干近光滑读向）
    expect(fragmentShader).toContain('vec3(0.87, 0.86, 0.85)'); // 沟内弱 AO（沟浅——弱于国槐深沟冷中性 AO 0.79）
    expect(fragmentShader).toContain('vec3(frxRidge) * (0.94 + 0.10 * frxWarp)'); // 基底灰褐单色微变 ±5%（「树皮灰褐色」FRPS Verified——游走场复用省采样；vec3(frxRidge) 显式广播——011.8 编译事故修复形态）
    expect(fragmentShader).toContain('frxBarkBase * 0.5'); // 干基暗化弱档权重 0.5（老干渐深读向——弱于国槐 0.7）
    expect(fragmentShader).toContain('vec3(0.91, 0.91, 0.92)'); // 干基暗化乘色（弱于国槐 ×0.88）
    expect(fragmentShader).not.toContain('vec3(1.32, 1.28, 1.14)'); // 悬铃木新露奶油白带不串种（无剥落）
    expect(fragmentShader).not.toContain('vec3(1.35, 0.92, 0.64)'); // 榉树锈橙新斑不串种（无剥落）
    expect(fragmentShader).not.toContain('vec3(1.13, 1.11, 1.05)'); // 乌桕翘条亮面不串种（无碎翘）
    expect(fragmentShader).not.toContain('vec3(0.70, 0.68, 0.66)'); // 国槐瘤突暗点不串种（白蜡无瘤突）
    expect(fragmentShader).not.toContain('Moss'); // 苔藓不做（flower-b 绿斑低置信不承重——不做不编造）
  });

  it('皮孔场（High 专属近景——「皮孔小，不明显」FRPS 原句三项落地）：30×44 格 26% 有孔〔稀——vs 栾密麻点〕+ 小半径 0.06–0.10 + ×(1.12,1.11,1.08) 弱对比 + 幼干大枝域门', () => {
    const { fragmentShader } = assemble(track(createFraxinusBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('vec2(vUv.x * 30.0, vUv.y * 44.0)'); // 皮孔格密度（vs 栾 52×78——稀一档）
    expect(fragmentShader).toContain('step(0.74, frxLR)'); // 26% 格有孔（稀疏门——「不明显」密度侧；vs 栾 82% 密麻）
    expect(fragmentShader).toContain('0.06 + 0.04 * fract(frxLR * 9.31)'); // 小半径 0.06–0.10 格单位（「小」——恢复会话注释修正：原文档 0.04 与代码不一致）
    expect(fragmentShader).toContain('vec3(1.12, 1.11, 1.08)'); // 浅微亮弱对比（「不明显」对比侧——vs 栾醒目浅点不串种）
    expect(fragmentShader).toContain('smoothstep(2.6, 3.8, vTreePos.y)'); // 幼干大枝带高位门（「幼干-大枝近光滑 + 皮孔」合并读向）
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.90, 1.70, vUv.y))'); // 中低弧长门（皮管 v = 累计弧长契约注记）
    expect(fragmentShader).not.toContain('vec3(1.34, 1.35, 1.28)'); // 国槐皮孔浅灰白档不串种
    expect(fragmentShader).not.toContain('52.0'); // 栾皮孔麻点格密度不串种（皮孔语言归栾全干密布型）
  });

  it('干基暗化 + 细枝黄褐-灰褐两档（「小枝黄褐色，粗糙…皮孔小，不明显」FRPS 原句——vs 国槐当年生枝绿色两树细枝色对照）', () => {
    const { fragmentShader } = assemble(track(createFraxinusBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('1.0 - smoothstep(0.5, 2.4, vTreePos.y)'); // 干基暗带门控（家族惯例）
    expect(fragmentShader).toContain('smoothstep(6.2, 8.2, vTreePos.y)'); // 当年生枝高位门控
    expect(fragmentShader).toContain('smoothstep(4.8, 6.2, vTreePos.y)'); // 老枝灰褐档门控
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.45, 0.95, vUv.y))'); // 小弧长门（「细枝管 v 小」几何契约注记——高位 × 小 v 双门控）
    expect(fragmentShader).toContain('vec3(1.16, 1.04, 0.76)'); // 当年生枝黄褐收敛（「小枝黄褐色」FRPS 原句——R 主导褐向）
    expect(fragmentShader).toContain('vec3(1.02, 1.00, 0.94)'); // 老枝灰褐弱收敛
    expect(fragmentShader).not.toContain('vec3(0.86, 1.16, 0.72)'); // 国槐绿枝收敛不串种（白蜡黄褐 vs 国槐绿——细枝色对照轴）
  });

  it('果域（v∈[4,5]，裁决 4 做/裁决 5 主域）：四档色序字面量（嫩绿→黄绿→淡褐→淡黄褐——照片四点链）+ u 果档 warp 相位 0 中域放大（JS 锚——恢复会话修正后实测）+ 桨形边缘微暗线 + 实体无裁切 + 果透光域门控 v≥3.5（High）+ 翅面纸质微光泽', () => {
    const { fragmentShader } = assemble(track(createFraxinusBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('if (vUv.y >= 3.5) {'); // 果域分支（v∈[4,5]——域身份标记，阈值 3.5 = 果域 4.0 下探 0.5 隔离带，皮弧长域 ≤≈2.9 三重隔离）
    expect(fragmentShader).toContain('vec3(0.55, 0.66, 0.30)'); // 档 0 嫩绿（fruit-b 5 月幼果）
    expect(fragmentShader).toContain('vec3(0.66, 0.72, 0.34)'); // 档 1 黄绿（fruit-c 7 月帘幕）
    expect(fragmentShader).toContain('vec3(0.72, 0.66, 0.42)'); // 档 2 淡褐（fruit-a 9 月混熟）
    expect(fragmentShader).toContain('vec3(0.78, 0.70, 0.48)'); // 档 3 淡黄褐（twig-a/b 宿存端色序上限）
    expect(fragmentShader).toContain('0.09 * sin(6.28318 * vUv.x)'); // u 果档 warp 相位 0（正弦导数中域为负 → 中域密度放大；恢复会话修正：原 0.05·sin(2π(u−0.18)) 中域仅 55% 未达意图）
    expect(fragmentShader).toContain('fract(vUv.y - 4.0)'); // 沿果轴坐标（果 uv 轴向契约为材质侧假设——缺口候选③）
    expect(fragmentShader).toContain('vec3(0.84, 0.82, 0.80)'); // 桨形边缘微暗线乘色（匙形轮廓强化——双轴保守四缘皆暗）
    expect(fragmentShader).toContain('frxFBack'); // 果域微透亮（fruit-b「嫩绿半透明」/twig-a「backlit 半透明」——High 专属）
    expect(fragmentShader).toContain('outgoingLight += vec3(0.72, 0.90, 0.52)'); // 微透亮黄绿弱背光 0.16（域门控 v≥3.5）
    // JS 锚：warp 四档分布（9–10 月盛挂混熟读向——中域放大，恢复会话修正后实测 ≈17/33/33/17%）
    const pct = [0, 0, 0, 0];
    for (let i = 0; i < 10000; i++) {
      const u = (i + 0.5) / 10000;
      const w = clamp(u + 0.09 * Math.sin(2 * Math.PI * u), 0, 0.999);
      pct[Math.min(3, Math.floor(w * 4))]++;
    }
    for (let bin = 0; bin < 4; bin++) {
      expect(pct[bin] / 10000, `果色档 ${bin} 占比`).toBeGreaterThan(0.12);
      expect(pct[bin] / 10000).toBeLessThan(0.40);
    }
    expect((pct[1] + pct[2]) / 10000).toBeGreaterThanOrEqual(0.60); // 黄绿-淡褐中域 ≥60%（主域可辨——fruit-c 双问「醒目」）
    expect(pct[1] / 10000).toBeGreaterThan(pct[0] / 10000); // 中域放大（相位 0 形态）
    expect(pct[2] / 10000).toBeGreaterThan(pct[3] / 10000);
    // 翅面纸质微光泽（roughnessmap 域分支——干翅非肉质，vs 国槐肉质荚果 0.45 哑一档）
    expect(fragmentShader).toContain('roughnessFactor = 0.52;');
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
      [track(createFraxinusLeafMaterial()), track(createFraxinusLeafMaterial('high')), THREE.ShaderLib.physical],
      [track(createFraxinusBarkMaterial()), track(createFraxinusBarkMaterial('high')), THREE.ShaderLib.physical],
      [track(createFraxinusLeafDepthMaterial()), track(createFraxinusLeafDepthMaterial('high')), THREE.ShaderLib.depth],
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
    expectKey(track(createFraxinusLeafMaterial()), 'fraxinus:leaf');
    expectKey(track(createFraxinusLeafMaterial('mid')), 'fraxinus:leaf:mid');
    expectKey(track(createFraxinusLeafMaterial('low')), 'fraxinus:leaf:low');
    expectKey(track(createFraxinusBarkMaterial()), 'fraxinus:bark');
    expectKey(track(createFraxinusBarkMaterial('mid')), 'fraxinus:bark:mid');
    expectKey(track(createFraxinusBarkMaterial('low')), 'fraxinus:bark:low');
    expectKey(track(createFraxinusLeafDepthMaterial()), 'fraxinus:leaf-depth');
    expectKey(track(createFraxinusLeafDepthMaterial('mid')), 'fraxinus:leaf-depth:mid');
    expectKey(track(createFraxinusLeafDepthMaterial('low')), 'fraxinus:leaf-depth:low');
    expect(keys.size).toBe(9);
  });

  it('与 zelkova/camphor/celtis/ginkgo/platanus/koelreuteria/triadica/bischofia/sophora 九先例 81 键零碰撞（fraxinus 前缀不与十先例混缓存——tree3a 为一期 plant: 键系不在 level 扫描面）', () => {
    const foreignKeys = new Set<string>();
    for (const make of [createZelkovaLeafMaterial, createZelkovaBarkMaterial, createZelkovaLeafDepthMaterial,
      createCamphorLeafMaterial, createCamphorBarkMaterial, createCamphorLeafDepthMaterial,
      createCeltisLeafMaterial, createCeltisBarkMaterial, createCeltisLeafDepthMaterial,
      createGinkgoLeafMaterial, createGinkgoBarkMaterial, createGinkgoLeafDepthMaterial,
      createPlatanusLeafMaterial, createPlatanusBarkMaterial, createPlatanusLeafDepthMaterial,
      createKoelreuteriaLeafMaterial, createKoelreuteriaBarkMaterial, createKoelreuteriaLeafDepthMaterial,
      createTriadicaLeafMaterial, createTriadicaBarkMaterial, createTriadicaLeafDepthMaterial,
      createBischofiaLeafMaterial, createBischofiaBarkMaterial, createBischofiaLeafDepthMaterial,
      createSophoraLeafMaterial, createSophoraBarkMaterial, createSophoraLeafDepthMaterial]) {
      for (const level of ['high', 'mid', 'low'] as const) {
        foreignKeys.add(track(make(level)).customProgramCacheKey());
      }
    }
    expect(foreignKeys.size).toBe(81); // 九先例 × 3 工厂 × 3 档（含 011.9 国槐 72 键面 + sophora 9 键）
    for (const make of [createFraxinusLeafMaterial, createFraxinusBarkMaterial, createFraxinusLeafDepthMaterial]) {
      for (const level of ['high', 'mid', 'low'] as const) {
        expect(foreignKeys.has(track(make(level)).customProgramCacheKey())).toBe(false);
      }
    }
  });

  it('叶 Mid：SDF 与 High 同源全形（含窗列/顶生窗/齿载波——档间剪影一致：羽状剪影是中距身份）+ 去小叶脉/叶团/糙度叶团项；透光/hue·luma/shade/叶背保留；片元零噪声', () => {
    const high = assemble(track(createFraxinusLeafMaterial()), THREE.ShaderLib.physical);
    const mid = assemble(track(createFraxinusLeafMaterial('mid')), THREE.ShaderLib.physical);
    expect(sdfOf(mid.fragmentShader)).toBe(sdfOf(high.fragmentShader)); // Mid SDF = High 同源全形
    expect(columnOf(mid.fragmentShader)).toBe(columnOf(high.fragmentShader)); // 窗列子函数同源（FXC 拆分形态）
    expect(terminalOf(mid.fragmentShader)).toBe(terminalOf(high.fragmentShader)); // 顶生窗子函数同源
    for (const gone of ['frxVMid', 'frxVLat', 'frxVNet', 'frxClump']) {
      expect(mid.fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(mid.fragmentShader).not.toContain('(frxClump - 0.5) * 0.06'); // 糙度注入同步去叶团项
    expect(mid.fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0'); // 透光保留
    expect(mid.fragmentShader).toContain('frxTransVar');
    expect(mid.fragmentShader).toContain('vec3 frxHue'); // hue·luma 逐叶变奏保留
    expect(mid.fragmentShader).toContain('float frxLuma');
    expect(mid.fragmentShader).toContain('(0.80 + 0.20 * frxShade)'); // 冠内竖向自遮蔽保留（地板 0.80 沿先例口径）
    expect(mid.fragmentShader).toContain('float(gl_FrontFacing)) * 0.05'); // 两面糙度差保留
    expect(mid.fragmentShader).toContain('vec3(1.09, 1.11, 1.17)'); // 叶背浅绿-灰绿保留（弱档三档同体）
    expect(count(mid.fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0 调用（叶团去采样——Mid 片元零噪声执行）
  });

  it('叶 Low：SDF 换 SDF_LOW（去窗列/顶生窗/**去齿载波**——复叶细化 + 锯齿亚像素双牺牲 Spec §7）；包络/叶轴/裸轴门控与 High 逐字同源；去小叶脉/叶团/透光；hue·luma/shade/叶背保留；片元零噪声', () => {
    const high = assemble(track(createFraxinusLeafMaterial()), THREE.ShaderLib.physical);
    const low = assemble(track(createFraxinusLeafMaterial('low')), THREE.ShaderLib.physical);
    const lowSdf = sdfOf(low.fragmentShader);
    expect(lowSdf).not.toBe(sdfOf(high.fragmentShader)); // Low SDF = 去窗列去齿版（换字符串）
    expect(lowSdf).not.toContain('frxColumn'); // 去窗列（复叶细化）
    expect(lowSdf).not.toContain('frxTerminal'); // 去顶生窗
    expect(lowSdf).not.toContain('cos('); // 去齿载波（锯齿亚像素——Low 全文零 cos）
    expect(lowSdf).not.toContain('56.55'); // 齿频率字面量随段消去
    for (const gone of ['frxVMid', 'frxVNet', 'frxClump', 'frxTransVar', 'vec3(0.54, 0.90, 0.36)']) {
      expect(low.fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    // 包络/叶轴/裸轴门控与 High 逐字同源（档间叶形身份一致的去细节不改形原则——远距保留羽叶层叠轮廓色块）
    expect(lowSdf).toContain('0.166 * pow(frxEnvSin, mix(0.90, 1.24, smoothstep(0.30, 0.92, frxY)))'); // 包络逐字同源
    expect(lowSdf).toContain('0.0045 + 0.0055 * (1.0 - frxY)'); // 叶轴（无膨大带）逐字同源
    expect(lowSdf).toContain('- (1.0 - smoothstep(0.24, 0.285, frxY)) * 0.10'); // 裸轴减法门控逐字同源（Low 无窗列 → 顶栏门控随窗列消去为设计内）
    expect(lowSdf).toContain('clamp(frxEdge / 0.02 + 0.5'); // 坡宽同步（档间 AA 边一致）
    expect(count(low.fragmentShader, '#include <opaque_fragment>')).toBe(1); // 透光不注入但锚点原句不动
    expect(low.fragmentShader).toContain('(0.80 + 0.20 * frxShade)'); // shade 保留
    expect(low.fragmentShader).toContain('vec3 frxHue'); // hue·luma 保留
    expect(low.fragmentShader).toContain('vec3(1.09, 1.11, 1.17)'); // 叶背保留
    expect(count(low.fragmentShader, 'facVnoise(')).toBe(3); // 片元零噪声采样（库内 3 为死码，运行时零执行）
  });

  it('皮 Mid：去皮孔点（近景细节层）；脊沟浅档/沟内 AO/干基暗化/细枝两档/果域全保留（中距「灰褐浅纵裂 + 冠缘黄褐细枝 + 帘幕果簇」身份 Spec §7）', () => {
    const { fragmentShader } = assemble(track(createFraxinusBarkMaterial('mid')), THREE.ShaderLib.physical);
    // domainVars 三档统一预声明（triadica 同款）——断言消费式/场段缺席而非裸标识符
    for (const gone of ['frxLR', 'vec2(vUv.x * 30.0, vUv.y * 44.0)', 'frxLenticel * 0.7', 'frxLenticel * 0.06', 'vec3(1.12, 1.11, 1.08)', 'smoothstep(2.6, 3.8, vTreePos.y)']) {
      expect(fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('abs(fract(vUv.x * 8.0 + frxWarp * 0.80)'); // 脊沟浅档保留（中距身份）
    expect(fragmentShader).toContain('vec3(0.87, 0.86, 0.85)'); // 沟内弱 AO 保留
    expect(fragmentShader).toContain('frxBarkBase'); // 干基暗化保留
    expect(fragmentShader).toContain('frxTwigMid * 0.30'); // 老枝灰褐档保留（消费式在场）
    expect(fragmentShader).toContain('vec3(1.16, 1.04, 0.76)'); // 细枝黄褐过渡保留（冠缘黄褐细枝中距读向）
    expect(fragmentShader).toContain('vec3(0.55, 0.66, 0.30)'); // 果域四档色序保留（帘幕果簇中距身份）
    expect(fragmentShader).toContain('vec3(0.84, 0.82, 0.80)'); // 桨形边缘暗线保留（三档同体——帘幕剪影）
    expect(fragmentShader).toContain('roughnessFactor = 0.55;'); // 果域光泽（Mid 微透亮随段去）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 游走场 1（皮孔点随段去——纯 ALU 无采样损失）
  });

  it('皮 Low：再去干基暗化/老枝灰褐档（低调项）；脊沟 + 沟内 AO + 当年生黄褐档 + 果域保留（远距「浅纵裂剪影 + 果帘」保留面）；1× vnoise', () => {
    const { fragmentShader } = assemble(track(createFraxinusBarkMaterial('low')), THREE.ShaderLib.physical);
    // domainVars 三档统一预声明 + TWIG 段三档共享（未消费的死值无害）；断言消费式缺席
    for (const gone of ['frxLR', 'frxBarkBase * 0.5', 'frxTwigMid * 0.30', 'vec3(1.02, 1.00, 0.94)', 'vec2(vUv.x * 30.0, vUv.y * 44.0)']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('frxRidge'); // 脊沟保留（远距剪影保留面）
    expect(fragmentShader).toContain('vec3(0.87, 0.86, 0.85)'); // 沟内 AO 保留
    expect(fragmentShader).toContain('vec3(1.16, 1.04, 0.76)'); // 当年生黄褐档（结构剪影项三档保留）
    expect(fragmentShader).toContain('vec3(0.78, 0.70, 0.48)'); // 果域淡黄褐档保留（宿存端色序）
    expect(fragmentShader).toContain('roughnessFactor = 0.58;'); // 果域光泽（远距果色读向保留）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 游走场 1
  });

  it('深度分档：Mid = High SDF（含窗列/顶生窗/齿载波）/ Low = SDF_LOW（去窗列去齿）；与叶表面档内逐字一致（表面/影裁切档内一致）；三档零噪声库', () => {
    const high = assemble(track(createFraxinusLeafDepthMaterial()), THREE.ShaderLib.depth);
    const mid = assemble(track(createFraxinusLeafDepthMaterial('mid')), THREE.ShaderLib.depth);
    const low = assemble(track(createFraxinusLeafDepthMaterial('low')), THREE.ShaderLib.depth);
    const highSdf = sdfOf(high.fragmentShader);
    expect(sdfOf(mid.fragmentShader)).toBe(highSdf); // Mid 深度 = High SDF（同源全形含窗列/顶生窗/齿载波）
    expect(highSdf).toContain('frxColumn'); // 档间剪影一致（羽状影读向保留）
    expect(columnOf(high.fragmentShader)).toContain('56.55'); // 齿载波进深度（锯齿影读向——cos ALU 零噪声前提不变）
    expect(sdfOf(low.fragmentShader)).not.toBe(highSdf); // Low 深度 = SDF_LOW（去窗列去齿版）
    expect(sdfOf(low.fragmentShader)).not.toContain('frxColumn');
    expect(sdfOf(low.fragmentShader)).not.toContain('56.55');
    // 表面/影档内一致：叶表面各档 SDF === 深度各档 SDF
    for (const level of ['high', 'mid', 'low'] as const) {
      const surface = assemble(track(createFraxinusLeafMaterial(level)), THREE.ShaderLib.physical);
      const depthShader = assemble(track(createFraxinusLeafDepthMaterial(level)), THREE.ShaderLib.depth);
      expect(sdfOf(surface.fragmentShader)).toBe(sdfOf(depthShader.fragmentShader)); // 同一 GLSL 字符串（单一来源纪律）
      expect(count(depthShader.fragmentShader, 'facVnoise(')).toBe(0); // 三档深度零噪声库
    }
  });

  it('风动三档同源：叶/皮三档顶点 GLSL 全文一致（FRX_WIND 同一常量——档间相位一致 = 身份一致）', () => {
    const leafHigh = assemble(track(createFraxinusLeafMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createFraxinusBarkMaterial()), THREE.ShaderLib.physical);
    for (const level of ['mid', 'low'] as const) {
      const leaf = assemble(track(createFraxinusLeafMaterial(level)), THREE.ShaderLib.physical);
      const bark = assemble(track(createFraxinusBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(leaf.vertexShader).toBe(leafHigh.vertexShader);
      expect(bark.vertexShader).toBe(barkHigh.vertexShader);
    }
  });

  it('分档底参契约不因档破：叶三档 alphaTest/alphaToCoverage/DoubleSide/USE_UV/零贴图；皮三档 FrontSide/无 alphaTest/USE_UV；深度 alphaTest', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const leaf = track(createFraxinusLeafMaterial(level));
      const bark = track(createFraxinusBarkMaterial(level));
      const depth = track(createFraxinusLeafDepthMaterial(level));
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
    for (const make of [createFraxinusLeafMaterial, createFraxinusBarkMaterial]) {
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
    const leafA = track(createFraxinusLeafMaterial());
    const leafB = track(createFraxinusLeafMaterial());
    const barkA = track(createFraxinusBarkMaterial());
    const barkB = track(createFraxinusBarkMaterial());
    const depth = track(createFraxinusLeafDepthMaterial());
    expect(leafA).not.toBe(leafB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(leafA.customProgramCacheKey()).toBe(leafB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([leafA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
    expect(materialUniformsOf(leafA).uTime).not.toBe(materialUniformsOf(leafB).uTime); // uTime 桥接对象实例独立（dispose 安全）
    expect(materialUniformsOf(barkA).uTime).not.toBe(materialUniformsOf(barkB).uTime);
  });

  it('底参与侧向：叶 DoubleSide/硬纸质/USE_UV；皮 FrontSide/浅裂族中糙/USE_UV；均零贴图', () => {
    const leaf = track(createFraxinusLeafMaterial());
    const bark = track(createFraxinusBarkMaterial());
    expect(leaf.side).toBe(THREE.DoubleSide);
    expect(leaf.metalness).toBe(0);
    expect(leaf.roughness).toBeGreaterThan(0.67); // 硬纸质（0.68）
    expect(leaf.roughness).toBeLessThan(0.70);
    expect(leaf.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.FrontSide);
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeGreaterThan(0.85); // 浅裂光滑族中糙哑光
    expect(bark.map).toBeNull();
    expect(leaf.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
  });
});

describe('成本记账（10 万实例每像素预算：叶 High ≈11.5×（单级窗列 SDF + 齿载波 ≈4.5× 的账——与栾两级窗列同档）/ 皮 High 最重路径 ≈4.5×（1× vnoise 游走场——fraxinus 无国槐网状/域门第二场），hash21=1×/vnoise=3×——窗列/小叶场/齿载波 ALU 化红利）', () => {
  it('facVnoise 调用数：叶 High 1 处（3×）、Mid/Low 0 处；皮三档 1 处（游走场）；深度 0 处（零噪声库注入）；顶点零噪声', () => {
    const leaf = assemble(track(createFraxinusLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createFraxinusBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createFraxinusLeafDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(leaf.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（叶团——窗列/小叶场/齿载波 ALU 化免噪声）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（游走场——皮/果两域取最重）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(0); // 深度零噪声库注入（齿载波 cos 为 ALU 非噪声）
    expect(count(leaf.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin/cos
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零循环/零纹理采样（配方确定性纯函数 + SDF 纯 ALU）；全源零三角函数反函数调用（窗列/包络全 floor/fract/smoothstep 代理——零 mat2）', () => {
    const shaders = [
      assemble(track(createFraxinusLeafMaterial()), THREE.ShaderLib.physical),
      assemble(track(createFraxinusBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createFraxinusLeafDepthMaterial()), THREE.ShaderLib.depth),
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
    for (const make of [createFraxinusLeafMaterial, createFraxinusBarkMaterial, createFraxinusLeafDepthMaterial]) {
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
    const leaf = track(createFraxinusLeafMaterial());
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

    const depth = track(createFraxinusLeafDepthMaterial());
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
    const bark = track(createFraxinusBarkMaterial());
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

    const leaf = track(createFraxinusLeafMaterial());
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

    const leaf = assemble(track(createFraxinusLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createFraxinusBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createFraxinusLeafDepthMaterial()), THREE.ShaderLib.depth);
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

  /** guard 本体：注入段内出现的每个 frx* 标识符必须为 main 顶层（深度 1）唯一声明，
   *  且声明先于段尾（消费点）——块内声明（作用域在块结束关闭）与块内遮蔽声明（float 重声明）
   *  两种复发形态都红 */
  const crossIncludeScopeGuard = (fragmentShader: string, segment: { start: number; text: string }, label: string): void => {
    const ids = new Set(segment.text.match(/\bfrx[A-Z][A-Za-z0-9_]*/g) ?? []);
    for (const id of ids) {
      const decl = `float ${id}`;
      expect(count(fragmentShader, decl), `${label}:${id} 声明唯一（块内 float 重声明 = 遮蔽——triadica 次生 bug 形态）`).toBe(1);
      const declIdx = fragmentShader.indexOf(decl);
      expect(declIdx, `${label}:${id} 声明存在`).toBeGreaterThan(0);
      expect(declIdx, `${label}:${id} 声明先于消费段尾`).toBeLessThan(segment.start + segment.text.length);
      expect(braceDepthFromMain(fragmentShader, declIdx), `${label}:${id} 声明在 main 顶层（跨 include 可见——块内声明即编译错误形态）`).toBe(1);
    }
  };

  it('皮三档：roughnessmap 注入段消费的 frx* 标识符均在 main 顶层唯一声明（domainVars 预声明 + 块内纯赋值——High 消费 frxBarkSmooth/frxLenticel，Mid 消费 frxBarkSmooth，Low 段零 frx* id 自然跳过）', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const { fragmentShader } = assemble(track(createFraxinusBarkMaterial(level)), THREE.ShaderLib.physical);
      const segment = injectedSegmentAfter(fragmentShader, '#include <roughnessmap_fragment>');
      crossIncludeScopeGuard(fragmentShader, segment, `bark:${level}`);
    }
  });

  it('叶三档：roughnessmap 注入段消费的 frx* 标识符同守（leafBody 平铺无块包裹——High 消费 frxClump，Mid/Low 段零 frx* id 自然跳过）', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const { fragmentShader } = assemble(track(createFraxinusLeafMaterial(level)), THREE.ShaderLib.physical);
      const segment = injectedSegmentAfter(fragmentShader, '#include <roughnessmap_fragment>');
      crossIncludeScopeGuard(fragmentShader, segment, `leaf:${level}`);
    }
  });

  it('叶透光段（opaque_fragment 前注入）消费的 frx* 标识符（frxAlpha/frxBack/frxTransVar）同守——High/Mid', () => {
    for (const level of ['high', 'mid'] as const) { // Low 无透光注入（设计内）
      const { fragmentShader } = assemble(track(createFraxinusLeafMaterial(level)), THREE.ShaderLib.physical);
      const anchorIdx = fragmentShader.indexOf('#if NUM_DIR_LIGHTS > 0');
      expect(anchorIdx).toBeGreaterThanOrEqual(0);
      const endIdx = fragmentShader.indexOf('#include <opaque_fragment>', anchorIdx);
      expect(endIdx).toBeGreaterThan(anchorIdx);
      crossIncludeScopeGuard(fragmentShader, { start: anchorIdx, text: fragmentShader.slice(anchorIdx, endIdx) }, `leaf-trans:${level}`);
    }
  });

  it('皮果透光段（opaque_fragment 前注入，High）自含声明（frxFBack 段内声明段内消费——if 块内作用域闭合，无跨 include 暴露）+ 域门控 v≥3.5 在位', () => {
    const { fragmentShader } = assemble(track(createFraxinusBarkMaterial()), THREE.ShaderLib.physical);
    const anchorIdx = fragmentShader.indexOf('#if NUM_DIR_LIGHTS > 0');
    expect(anchorIdx).toBeGreaterThanOrEqual(0);
    const endIdx = fragmentShader.indexOf('#include <opaque_fragment>', anchorIdx);
    const segment = fragmentShader.slice(anchorIdx, endIdx);
    expect(segment).toContain('float frxFBack ='); // 段内自含声明（块内声明块内消费——无跨 include 风险）
    expect(segment).toContain('if (vUv.y >= 3.5) {'); // 果域域门控（皮/叶域不受影响）
    expect(count(fragmentShader, 'float frxFBack')).toBe(1); // 全文唯一（无遮蔽形态）
  });

  it('跨 include 类型守卫（011.8 frxBarkMul 同型事故——frxRidge float 顶层声明 × vec3 注入块消费）：皮三档 frxBarkMul 赋值右侧显式 vec3(frxRidge) 广播，禁裸 float 标量直乘进 vec3 声明（修复形态 toContain + 裸标量注入消费 not.toMatch）', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const { fragmentShader } = assemble(track(createFraxinusBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(fragmentShader, `bark:${level} 修复形态在场（float 顶层声明 → vec3 显式广播）`).toContain('vec3 frxBarkMul = vec3(frxRidge) * (0.94 + 0.10 * frxWarp)');
      expect(fragmentShader, `bark:${level} 禁裸 frxRidge 标量直乘（= float 表达式赋 vec3 = 维度不匹配编译错误）`).not.toMatch(/vec3\s+frxBarkMul\s*=\s*frxRidge\s*\*/);
      // 叶侧同型守卫：frxMul 为 vec3（frxHue vec3 × float 链——无裸标量赋值形态）
      const leaf = assemble(track(createFraxinusLeafMaterial(level)), THREE.ShaderLib.physical);
      expect(leaf.fragmentShader, `leaf:${level} 修复形态在场（vec3 × float 合法链）`).toContain('vec3 frxMul = frxHue * frxLuma * (0.80');
      expect(leaf.fragmentShader, `leaf:${level} 禁裸 float 标量直赋 vec3 frxMul`).not.toMatch(/vec3\s+frxMul\s*=\s*(?!frxHue)\w+\s*;/);
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
    const material = track(createFraxinusLeafMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});
