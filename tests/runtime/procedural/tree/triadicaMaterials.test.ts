/**
 * tests/runtime/procedural/tree/triadicaMaterials.test.ts —— 乌桕叶/皮（含绿闭果
 * 域）/深度材质测试（T011.7，对称 koelreuteriaMaterials.test.ts 范式：真实
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
 *   叶/皮同公式（同串出现）；叶片快颤层含 aBend 权重（组 0 恒 0 天然免颤）+ **长柄
 *   飘逸读向**（柄 2.5–6cm ≈ 等长 blade、leaf-c 实测 1–1.5×：幅度 12mm 介于银杏长柄
 *   13mm 与栾 11mm 之间、频率 11–18 rad/s 高于银杏 10–17 一档）；树高锚 9.5m
 *   （×0.1053——终审 ④ ≈9–10m 取中工程锚，几何 slot-0 未落盘记档）；
 * - instanceColor 乘算链安全：注入后 <color_fragment> 原句恰一次、注入代码零 vColor 介入；
 * - 菱形 SDF 与透光：alphaTest 0.5 + alphaToCoverage；片元含 triLeafAlpha 计算式与
 *   alpha 写入；组 0 材质工程契约（FrontSide 闭合实体——无裁切无 alphaTest，vs 栾
 *   DoubleSide 三域的分化）；深度材质（叶影裁切）含同一 SDF 函数（单一来源）+
 *   RGBADepthPacking + 组 0 实心守卫（aLeafRand=0——皮/果域不误裁）+ USE_UV +
 *   alphaTest；透光项存在且 NUM_DIR_LIGHTS 守卫；风动不进 depth pass；
 * - 物种配方锚定（Spec docs/research/triadica-reference.md 1.0，生产口径 = 终审记档
 *   ④）：**菱形/菱状卵形 SDF 核心（第七叶形——指数充满度法新路径）**——全周期包络
 *   v^0.94 峰居中（宽≈长 FOC 检索表 Verified）+ 指数充满度 mix(1.35,1.88)（基阔楔开张
 *   → 中段菱形直缘）+ 上段骤尖指数 ramp 2.95–3.90 逐叶（「顶端骤然紧缩具长短不等
 *   的尖头」FRPS Verified）+ 心形基凹口变奏 ≈34%（「sometimes shallowly cordate」FOC）
 *   + 全缘零载波（樟先例）——JS 数值锚：最宽点 v∈(0.44,0.52) 居中 / 菱形域 hw(0.2)
 *   ∈(0.42,0.62) 且 < 樟卵形同位 0.728（菱 vs 卵分化）/ 骤缩比 hw(0.80)<0.55·hw(0.68)
 *   / 尾宽 hw(0.90)<6% 峰 / 不对称 hw(0.75)<0.75·hw(0.25)（骤尖偏上侧）/ 阔楔基
 *   hw(0.10)∈(0.09,0.17) / **全缘单峰性**（半宽场局部极大恰 1 个——零齿载波的数学
 *   证明）/ 心形域 34% 扫描 + 凹口裁进（cordate 基中心 alpha<0.5、非 cordate ≥0.5）；
 *   腺点（大戟科身份——材质层唯一承载）：GLSL 腺点因子 + JS 锚（±0.028 一对存在/
 *   叶面上不裁/小点非大片）；脉型（羽状 + 基部两出掌状-羽状过渡）：两出起点心形联动
 *   mix(0.15,0.06) + 外展弯拱轨迹 + 侧脉脊族逐叶频 66–78（JS 锚 6–8 对——「侧脉
 *   6-10 对」Verified 域内）+ **脉色偏黄显著** (1.66,1.44,0.86)（NC "Conspicuous
 *   yellow veins"——身份点）；新叶铜红 flush ≈5.5% 三档同体（JS 锚 4–7%）；两面弱
 *   区分（背面 ×(1.06,1.08,1.02) 六树最弱档——先例背面乘子不串种）+ 两面糙度差
 *   +0.05（各部无毛最小差）；叶色中绿-深绿 #507c34（八树亮度链：栾 > 乌桕 > 夏栎）；
 *   光泽中档 roughness 0.58（樟革质 0.50 < 0.58 < 榉 0.62——纸质非革质）；透光中等
 *   偏上峰值 0.33（栾 0.32 < 0.33 < 银杏 0.34——纸质薄菱叶）+ 黄绿透射色；
 *   皮（第七语言「暗灰-灰褐窄纵裂 + 窄条翘皮碎斑」）：底色 #6f6a62 暗色族（八树
 *   亮度链：樟 < 乌桕 < 榉 < 悬 < 栾——暗于全部灰绿/浅色族）+ 11 窄脊浅-中沟剖面
 *   （vs 樟 7 宽脊深沟）+ 裂线游走低频纵向连续 + 沟内冷灰 AO + **翘皮碎斑**（翘皮
 *   域场 (3.4,7.5) u 低频局部域 × v 高频碎段 + 窄竖条族 14 条/周 + 条核亮面 + 条界
 *   翘缝暗（High）——vs 悬铃木大片地图拼贴：条状窄、竖向、碎）+ 干基暗化微渐变
 *   （低调）+ 上部**灰绿**收敛（亮绿小枝大戟科近景点——vs 悬/栾红褐收敛的分化）+
 *   苔藓不做（不做不编造）；
 *   果域（v∈[4,5]，分支阈值 3.5 = 果域下探 0.5 隔离带）：绿闭蒴果中绿带黄两端
 *   (0.56,0.66,0.28)↔(0.66,0.74,0.36) + u 逐果变奏 + 光泽微高 roughness 0.62（域
 *   分支注入）+ 实体无裁切（白蜡相/柱头暗点记档不做）；
 * - 深度材质零噪声库注入（包络/凹口全 ALU → SDF 零 facVnoise 引用 → 影 pass 不吃
 *   噪声纪律——樟全缘先例）；
 * - 分档实装（level 参数，缺省 'high'）：三工厂缺省 ≡ 显式 'high'（属性 + 键 +
 *   GLSL 全文逐位相等）；3 工厂 × 3 档 = 9 键互异（跨资产键零碰撞归 assetTaxonomy
 *   全注册资产收容断言）；叶 Mid 去叶脉三件/腺点/叶团/糙度叶团项
 *   （**SDF 全形含心形凹口保留——档间剪影一致**）、Low 换 SDF_LOW（去心形凹口——
 *   近景基形变奏细化；包络/骤尖收口逐字同源）再去透光，flush 三档同体；皮 Mid 去
 *   条界翘缝暗（脊沟/翘条亮面/干基暗化/果域保留）、Low 再去翘皮碎斑/干基暗化；
 *   深度 Mid = High SDF（含凹口）、Low = SDF_LOW（表面/影档内一致）；风动三档
 *   顶点 GLSL 同源；分档底参契约（alphaTest/侧向/USE_UV）不因档破；uTime 桥接三档
 *   不缺位；
 * - program 键纪律：叶/皮/深度三键互异；两次工厂调用材质对象不同（无模块级共享，
 *   D17）但键相同；uniforms 不跨实例共享；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：叶片元 facVnoise 调用
 *   1 处（叶团——包络/凹口 ALU 化免噪声）、Mid/Low 0 处；皮 High/Mid 2 处（裂线
 *   游走 + 翘皮域场）、Low 1 处；深度 0 处（零噪声库注入）；顶点零噪声；全源零
 *   循环/零纹理采样/零三角函数反函数调用（菱形域全 pow/smoothstep 代理）；
 * - 注入点缺失即抛（map_fragment/begin_vertex/common/roughnessmap_fragment/opaque_fragment
 *   摘除各暴雷）；
 * - **跨 include 作用域防回归 guard（Step 4 实证修复配套）**：皮三档 roughnessmap 注入
 *   段消费的 tri* 标识符（triBarkSmooth/triCurlCore）必须在 main 顶层（brace 深度 1）
 *   唯一声明且先于消费（domainVars 预声明先于 if 域分支块）——块内声明（作用域关闭后
 *   不可见 = 浏览器编译错误形态）与块内 float 遮蔽声明（域外恒初值 = 静默死项形态）
 *   两种复发都红；叶三档 roughness 段与叶透光段（High/Mid）同 guard（leafBody 平铺
 *   无块——结构天然安全，断言固化防结构性回归）；
 * - 结构完整性：include 全展开后花括号配平差值与原版一致（注入不破坏 GLSL 结构）；
 * - TimeUniformService.freeze：冻结期间广播仍写当前值（uTime 常量——树静止）+ 材质兼容。
 * 边界：材质登记 afterEach 统一 dispose 兜底，不跨测试泄漏。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms } from 'three';
import { TimeUniformService } from '../../../../src/runtime/services/TimeUniformService';
import {
  createTriadicaBarkMaterial,
  createTriadicaLeafDepthMaterial,
  createTriadicaLeafMaterial,
} from '../../../../src/runtime/procedural/tree/triadica/triadicaMaterials';
import { assemble, braceDelta, count, createMaterialTracker, expandIncludes, materialUniformsOf, propsOf, sdfOf as extractSdf } from '../../../support/procedural-tree/materialHarness';

const { track, disposeAll } = createMaterialTracker();

/** 提取注入后的 triLeafAlpha 函数全文（SDF 单一来源比对用；首个 \n} 即函数闭合） */
const sdfOf = (fragmentShader: string): string =>
  extractSdf(fragmentShader, 'float triLeafAlpha(vec2 triUv, float triRand)');

// ── SDF JS 数值锚镜像（菱形指数充满度法——与 GLSL 逐式对应）────────────────────────

const fract = (x: number): number => x - Math.floor(x);
const clamp = (x: number, a: number, b: number): number => Math.min(Math.max(x, a), b);
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
const smoothstepJS = (a: number, b: number, x: number): number => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** 心形端门控 JS 镜像（≈34% 叶域） */
const triCordOfJS = (rand: number): number => smoothstepJS(0.60, 0.72, fract(rand * 7.117 + 0.53));

/** 菱形包络半宽 JS 镜像（卡空间 x∈[-0.5,0.5]、v 沿叶轴；与 TRIADICA_LEAF_SDF 逐式对应） */
const triHalfWidthJS = (v: number, rand: number): number => {
  const envSin = Math.sin(Math.PI * Math.pow(clamp(v, 0.001, 0.999), 0.94));
  const topExp = 2.95 + 0.95 * fract(rand * 5.731 + 0.41);
  const exp = mix(mix(1.35, 1.88, smoothstepJS(0.22, 0.55, v)), topExp, smoothstepJS(0.68, 0.86, v));
  return 0.5 * Math.pow(envSin, exp);
};

/** 叶 SDF JS 镜像（含心形凹口——与 TRIADICA_LEAF_SDF 逐式对应） */
function triLeafAlphaJS(u: number, v: number, rand: number): number {
  const x = u - 0.5;
  const notch = (0.05 + 0.06 * fract(rand * 3.713 + 0.22)) * triCordOfJS(rand)
    * Math.pow(Math.max(0, 1 - Math.hypot(x * 1.35, (v - 0.01) * 1.2) / 0.17), 2);
  const edge = triHalfWidthJS(v, rand) - Math.abs(x) - notch;
  return clamp(edge / 0.04 + 0.5, 0, 1);
}

/** 樟卵形包络对照（菱 vs 卵分化断言——camphor 基段指数 0.80 同位半宽比） */
const camphorOvateAt = (v: number): number => Math.pow(Math.sin(Math.PI * Math.pow(v, 0.90)), 0.80);

/** 侧脉脊族 run 计数（|x| 固定行——「侧脉 6–10 对」的卡面统计锚） */
function triVeinRidgeCountJS(rand: number, absx: number): number {
  const freq = 66.0 + 12.0 * fract(rand * 4.317 + 0.63);
  let runs = 0;
  let inRun = false;
  for (let i = 0; i <= 1600; i++) {
    const v = 0.10 + (i / 1600) * 0.80;
    const ridge = Math.pow(Math.max(0, Math.sin(v * freq - absx * 34.0 + (rand - 0.5) * 0.8)), 8.0)
      * smoothstepJS(0.16, 0.28, v) * (1 - smoothstepJS(0.70, 0.86, v));
    if (ridge > 0.15 && !inRun) {
      runs++;
      inRun = true;
    } else if (ridge < 0.08) {
      inRun = false;
    }
  }
  return runs;
}

/** 柄顶腺体对因子 JS 镜像（±0.028、v=0.055） */
const triGlandJS = (u: number, v: number): number =>
  1 - smoothstepJS(0.012, 0.030, Math.hypot(Math.abs(u - 0.5) - 0.028, (v - 0.055) * 1.15));

afterEach(() => {
  disposeAll();
});

describe('uTime 接线（TimeUniformService 消费协议）', () => {
  it('叶/皮材质挂材质级 uniforms.uTime；编译后 shader.uniforms.uTime 同引用；GLSL 声明 uniform', () => {
    for (const material of [track(createTriadicaLeafMaterial()), track(createTriadicaBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('材质挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const leaf = track(createTriadicaLeafMaterial());
    const bark = track(createTriadicaBarkMaterial());
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

describe('风动契约（D19.7：uTime 全局风帧 / aSeed 个体相位；长柄飘逸——柄 2.5–6cm ≈ 等长 blade、leaf-c 实测 1–1.5×，轻质纸质叶近自由摆）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）', () => {
    const leaf = assemble(track(createTriadicaLeafMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(leaf.vertexShader).toContain(decl);
    }
    expect(leaf.vertexShader).toContain('fract(sin(aSeed * 86.531'); // 整树缓摆相位 = hash(aSeed)——常数换七先例去相关
    expect(leaf.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 63.917'); // 快颤相位 = hash(aSeed+叶身份)
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(leaf.vertexShader + leaf.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('整树缓摆叶/皮同公式（同串出现）；快颤含 aBend 权重且幅度 12mm（银杏长柄 13mm > 乌桕 > 栾 11mm）、频率 11+（高于银杏 10+——轻质长柄）；树高锚 9.5m（×0.1053 终审 ④ 取中工程锚）', () => {
    const leaf = assemble(track(createTriadicaLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createTriadicaBarkMaterial()), THREE.ShaderLib.physical);
    const swayCore = 'triWindH * triWindH * 0.044 * sin(uTime * 1.15';
    expect(leaf.vertexShader).toContain(swayCore);
    expect(bark.vertexShader).toContain(swayCore); // 皮不动叶动会撕裂穿帮——同公式同相位（组 0 aBend 恒 0 免颤）
    expect(leaf.vertexShader).toContain('aBend * 0.012'); // 长柄飘逸：幅度 12mm（银杏长柄扇叶 13mm 之下、栾 11mm 之上）
    expect(leaf.vertexShader).toContain('uTime * (11.0 + 7.0 * triFlutterPhase)'); // 11–18 rad/s（≈1.75–2.9Hz——高于银杏 10–17 一档）
    expect(leaf.vertexShader).toContain('position.y * 0.1053'); // /9.5m 锚（终审 ④ ≈9–10m 取中工程锚——slot-0 未落盘记档）
    expect(0.012).toBeLessThan(0.013); // < 银杏长柄扇叶 13mm
    expect(0.012).toBeGreaterThan(0.011); // > 栾 11mm（中高幅）
    expect(11.0).toBeGreaterThan(10.0); // 频率下限 > 银杏 10（轻质叶颤频更高链）
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createTriadicaLeafMaterial()), track(createTriadicaBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('菱形 SDF 与透光', () => {
  it('叶 alphaTest 0.5 + alphaToCoverage；片元含 SDF 计算式并写入 alpha', () => {
    const material = track(createTriadicaLeafMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float triLeafAlpha('); // 菱形 SDF 函数（单一来源）
    expect(fragmentShader).toContain('triLeafAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = triAlpha;'); // alphatest_fragment 上游写入
    expect(fragmentShader).toContain('clamp(triEdge / 0.04 + 0.5'); // 坡宽 0.04（单叶先例 AA 口径）
  });

  it('组 0 材质工程契约（材质侧定义）：FrontSide 闭合实体（皮管/果球——无花卡类裁切需求，vs 栾 DoubleSide 三域的分化）+ 无 alphaTest + USE_UV', () => {
    const bark = track(createTriadicaBarkMaterial());
    expect(bark.side).toBe(THREE.FrontSide); // 皮/果闭合实体（果域实体无裁切——alpha 恒 1）
    expect(bark.alphaTest).toBe(0); // 无裁切（FrontSide 实体组——果域色由域分支承担）
    expect(bark.alphaToCoverage).toBe(false);
    expect(bark.defines?.USE_UV).toBe('');
  });

  it('深度材质（叶影裁切）：同一 SDF 函数 + RGBADepthPacking + 组 0 实心守卫 + USE_UV + alphaTest；风动不进 depth；零噪声库注入', () => {
    const material = track(createTriadicaLeafDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.depthPacking).toBe(THREE.RGBADepthPacking);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('triLeafAlpha(vUv, vLeafRand)');
    expect(shader.fragmentShader).toContain('step(0.0001, vLeafRand)'); // 组 0 aLeafRand=0 → 实心（皮圆柱/果球 uv 域不误裁；果域无需 v 路由——rand=0 即守卫）
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
    expect(count(shader.fragmentShader, 'facVnoise(')).toBe(0); // 零噪声库注入——包络/凹口 ALU 化（影 pass 不吃噪声）
    expect(shader.fragmentShader).not.toContain('facHash21'); // 噪声库整体未挂（SDF 引入噪声即编译暴雷——保护性约束）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫（无平行光场景安全降级）', () => {
    const { fragmentShader } = assemble(track(createTriadicaLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(fragmentShader).toContain('directionalLights[0]');
    expect(fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
  });
});

describe('物种配方锚定（Spec triadica-reference 1.0；生产口径 = 终审记档 ④：菱形主相 6–7 成 + 心形端 3–4 成 / 腺体材质层承载 / 第 8 树皮语言 / 夏季绿闭果）', () => {
  it('菱形 SDF 核心（第七叶形——指数充满度法新路径）：全周期包络峰居中 + 指数充满度 mix(1.35,1.88) + 上段骤尖 ramp 逐叶 + 心形凹口减法 + 全缘零载波；SDF 单一来源', () => {
    const leaf = assemble(track(createTriadicaLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('sin(3.14159 * pow(clamp(triP.y, 0.001, 0.999), 0.94))'); // 全周期包络 v^0.94（峰 ≈0.478 居中——「宽≈长」FOC 检索表 Verified [4]）
    expect(leaf.fragmentShader).toContain('mix(1.35, 1.88, smoothstep(0.22, 0.55, triP.y))'); // 指数充满度（基 1.35 阔楔开张 → 中 1.88 菱形直缘——指数 >1 把凸缘收直）
    expect(leaf.fragmentShader).toContain('2.95 + 0.95 * fract(triRand * 5.731 + 0.41)'); // 上段骤尖指数 ramp 2.95–3.90 逐叶（「长短不等的尖头」FRPS Verified [1]）
    expect(leaf.fragmentShader).toContain('smoothstep(0.60, 0.72, fract(triR * 7.117 + 0.53))'); // 心形端门控 ≈34%（「sometimes shallowly cordate」FOC Verified [3]）
    expect(leaf.fragmentShader).toContain('(0.05 + 0.06 * fract(triRand * 3.713 + 0.22)) * triCordOf(triRand)'); // 凹口深度逐叶 0.05–0.11
    expect(leaf.fragmentShader).toContain('0.5 * triEnv - abs(triP.x) - triNotch'); // 凹口减法合成（platanus dip 机制同族挂叶基中心）
    expect(leaf.fragmentShader).not.toContain('62.83'); // 先例齿载波频不出现（全缘零载波——樟先例）
    expect(leaf.fragmentShader).not.toContain('triTooth'); // 无齿通道（全缘——「全缘」FRPS/FOC Verified [1][3]）
    expect(sdfOf(leaf.fragmentShader)).not.toContain('facVnoise'); // SDF 零噪声引用（深度材质不挂噪声库的前提）
    // SDF 单一来源——影裁切叶形自动同步
    const depth = assemble(track(createTriadicaLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(sdfOf(depth.fragmentShader)).toBe(sdfOf(leaf.fragmentShader));
  });

  it('菱形数值锚（JS 镜像）：最宽点居中 + 菱形域（hw(0.2) 介于菱形直线与樟卵形之间）+ 骤缩比 + 尾宽 + 骤尖不对称 + 阔楔基 + 全缘单峰性', () => {
    const rand = 0.21; // 非 cordate 抽样（triCordOfJS(0.21) ≈ 0——半宽场不带凹口）
    expect(triCordOfJS(rand)).toBeLessThan(0.05);
    // ① 最宽点 v∈(0.44,0.52) 居中（菱形「宽≈长」——vs 卵形族偏基峰 0.40–0.46）
    let widestV = 0;
    let widestW = -1;
    for (let i = 0; i <= 1000; i++) {
      const v = 0.05 + (i / 1000) * 0.9;
      const w = triHalfWidthJS(v, rand);
      if (w > widestW) {
        widestW = w;
        widestV = v;
      }
    }
    expect(widestV).toBeGreaterThan(0.44);
    expect(widestV).toBeLessThan(0.52);
    // ② 菱形域：v=0.2 半宽比 ∈(0.42,0.62)——菱形直线 0.418 之上（饱满）、樟卵形 0.728 之下（收直）
    const ratio02 = triHalfWidthJS(0.2, rand) / widestW;
    expect(ratio02).toBeGreaterThan(0.42);
    expect(ratio02).toBeLessThan(0.62);
    expect(ratio02).toBeLessThan(camphorOvateAt(0.2)); // 菱 vs 卵分化（樟卵形同位显著更宽——凸缘鼓腹）
    // ③ 骤然紧缩：v=0.80 半宽 < 0.55·hw(0.68)（上段指数 ramp 强收缩）——尾尖指数全域端点均满足
    for (const topRand of [0.05, 0.5, 0.95]) {
      expect(triHalfWidthJS(0.80, topRand)).toBeLessThan(0.55 * triHalfWidthJS(0.68, topRand));
      expect(triHalfWidthJS(0.90, topRand)).toBeLessThan(0.06 * widestW); // ④ 细长尾尖（<6% 峰宽）
    }
    // ⑤ 骤尖不对称：上侧收缩强于下侧（hw(0.75) < 0.75·hw(0.25)——骤尖偏上、阔楔偏下）
    expect(triHalfWidthJS(0.75, rand)).toBeLessThan(0.75 * triHalfWidthJS(0.25, rand));
    // ⑥ 阔楔基：hw(0.10) ∈(0.09,0.17)（楔形收放非圆钝——「基部阔楔形或钝」FRPS Verified）
    const base = triHalfWidthJS(0.10, rand);
    expect(base).toBeGreaterThan(0.09);
    expect(base).toBeLessThan(0.17);
    // ⑦ 全缘单峰性：半宽场局部极大恰 1 个（零齿载波的数学证明——齿缘会产生多个局部极大）
    let maxima = 0;
    const hwAt = (v: number): number => triHalfWidthJS(v, rand);
    for (let i = 1; i < 1600; i++) {
      const v = 0.08 + (i / 1600) * 0.84;
      if (hwAt(v) > hwAt(v - 0.0005) && hwAt(v) >= hwAt(v + 0.0005)) maxima++;
    }
    expect(maxima).toBe(1); // 缘相占比 = 100% 全缘（樟先例口径）
  });

  it('心形端变奏（aLeafRand 驱动 ≈34%）：域占比扫描 + 凹口裁进（cordate 基中心 alpha<0.5、非 cordate ≥0.5）+ 腺点肩位不受凹口影响', () => {
    // 域占比 ≈34%（「阔卵-近心形端占 3–4 成」照片读向 [7]）
    let cordate = 0;
    for (let i = 0; i < 10000; i++) if (triCordOfJS((i + 0.5) / 10000) > 0.5) cordate++;
    expect(cordate / 10000).toBeGreaterThan(0.28);
    expect(cordate / 10000).toBeLessThan(0.40);
    // 找一对 cordate / 非 cordate rand
    let randCord = -1;
    let randPlain = -1;
    for (let i = 0; i < 4000 && (randCord < 0 || randPlain < 0); i++) {
      const r = (i + 0.5) / 4000;
      if (randCord < 0 && triCordOfJS(r) > 0.95) randCord = r;
      if (randPlain < 0 && triCordOfJS(r) < 0.01) randPlain = r;
    }
    expect(randCord).toBeGreaterThan(0);
    expect(randPlain).toBeGreaterThan(0);
    // 凹口裁进：cordate 基中心被凹口切进（alpha<0.5），非 cordate 基中心存活（≥0.5）
    expect(triLeafAlphaJS(0.5, 0.02, randCord)).toBeLessThan(0.5);
    expect(triLeafAlphaJS(0.5, 0.02, randPlain)).toBeGreaterThanOrEqual(0.5);
    expect(triLeafAlphaJS(0.5, 0.05, randCord)).toBeLessThan(triLeafAlphaJS(0.5, 0.05, randPlain)); // 凹口深度单调（cordate 基中心存活域更浅）
    // 腺点肩位不受凹口影响：两肩 (±0.028, 0.055) 在 cordate 叶上仍在叶面（叶基两肩——凹口域限中心）
    expect(triLeafAlphaJS(0.5 + 0.028, 0.055, randCord)).toBeGreaterThanOrEqual(0.5);
  });

  it('柄顶腺体对（大戟科身份——材质层唯一承载，High 专属）：GLSL 因子 + JS 锚（±一对存在/叶面上/小点非大片）+ 黄绿亮乘色', () => {
    const leaf = assemble(track(createTriadicaLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('length(vec2(abs(triP.x) - 0.028, (triP.y - 0.055) * 1.15))'); // 腺点对距离场（±0.028、v=0.055——叶基-叶柄交接处）
    expect(leaf.fragmentShader).toContain('vec3(1.85, 1.60, 0.42)'); // 黄绿亮腺点乘色（大戟科身份点）
    expect(leaf.fragmentShader).toContain('triGland * 0.9');
    // JS 锚：一对存在（±两位点因子满）+ 中心/远处为零（小点非大片）+ 在叶面上（alpha ≥0.5）
    expect(triGlandJS(0.5 + 0.028, 0.055)).toBeGreaterThan(0.9);
    expect(triGlandJS(0.5 - 0.028, 0.055)).toBeGreaterThan(0.9);
    expect(triGlandJS(0.5, 0.055)).toBeLessThan(0.5); // 中脉位无腺点（一对分立）
    expect(triGlandJS(0.5, 0.3)).toBe(0); // 叶面中段无
    expect(triGlandJS(0.5 + 0.06, 0.055)).toBeLessThan(0.5); // 小点（0.032 外即无——毫米级）
    expect(triLeafAlphaJS(0.5 + 0.028, 0.055, 0.21)).toBeGreaterThanOrEqual(0.5); // 腺点在叶面上（非裁空区）
  });

  it('脉型（羽状 + 基部两出——掌状-羽状过渡）：两出起点心形联动 + 外展弯拱轨迹不达缘 + 侧脉脊族 66–78 逐叶（JS 锚 6–8 对——「侧脉 6-10 对」Verified 域内）+ 脉色偏黄显著', () => {
    const { fragmentShader } = assemble(track(createTriadicaLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('mix(0.15, 0.06, triCordVein)'); // 两出脉起点心形联动下移（心形叶更贴基 = 掌状-羽状过渡）
    expect(fragmentShader).toContain('0.44 * pow(max(triP.y - triBasalV0, 0.0), 0.62) * (1.0 - 0.42 * triP.y)'); // 两出轨迹（斜升外展、先端前内收——弯拱读向）
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.46, 0.62, triP.y))'); // 两出脉中带前渐隐（不达缘——「离缘 2-5 毫米弯拱网结」Verified [1]）
    expect(fragmentShader).toContain('66.0 + 12.0 * fract(vLeafRand * 4.317 + 0.63)'); // 侧脉频逐叶 66–78
    expect(fragmentShader).toContain('triVeinMid * 1.00 + triVeinBasal * 0.62 + triVeinLat * 0.42'); // 中脉 1.0 / 两出对 0.62 次强 / 侧脉 0.42 纤细弱层
    expect(fragmentShader).toContain('vec3(1.66, 1.44, 0.86)'); // 脉色偏黄显著（NC "Conspicuous yellow veins" Verified [5]——身份点；R 强抬 B 压低）
    expect(fragmentShader).not.toContain('vec3(1.58, 1.36, 1.02)'); // 悬铃木脉色不串种
    expect(fragmentShader).not.toContain('0.42 * pow'); // 樟离基三出内收轨迹公式不串种（乌桕两出为外展弯拱）
    // JS 锚：侧脉对数 6–8（|x|=0.10 行 run 计数——「侧脉6-10对」Verified 的卡面中段统计）
    for (const rand of [0.11, 0.47, 0.83]) {
      const pairs = triVeinRidgeCountJS(rand, 0.10);
      expect(pairs).toBeGreaterThanOrEqual(6);
      expect(pairs).toBeLessThanOrEqual(8);
      expect(pairs).toBeLessThanOrEqual(10); // Verified 上界域内
    }
  });

  it('新叶铜红 flush（低优先变奏，三档同体）：step 域 <6% + 铜红乘色 + 非身份主信号（乘色档不串种）', () => {
    const { fragmentShader } = assemble(track(createTriadicaLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('step(0.945, fract(vLeafRand * 9.417 + 0.71))'); // flush 门（≈5.5% 叶域）
    expect(fragmentShader).toContain('vec3(1.80, 0.60, 0.34)'); // 铜红-绯红偏移乘色（三照片源 Inferred）
    let flush = 0;
    for (let i = 0; i < 10000; i++) if (fract((i / 10000) * 9.417 + 0.71) >= 0.945) flush++;
    expect(flush / 10000).toBeGreaterThan(0.04); // <6% 低概率域（非身份主信号）
    expect(flush / 10000).toBeLessThan(0.07);
  });

  it('两面弱区分（背面 ×(1.06,1.08,1.02) 六树最弱档——「稍浅淡绿非粉绿级」）+ 两面糙度差 +0.05（各部无毛最小差）；先例背面乘子不串种', () => {
    const leaf = assemble(track(createTriadicaLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('mix(vec3(1.06, 1.08, 1.02), vec3(1.0), float(gl_FrontFacing))'); // 背面 R/G 主导微抬（浅淡绿弱色差——无粉感）
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.05, 1.16)'); // 香樟 glaucous 粉感背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.08, 1.10, 1.02)'); // 悬铃木背面乘子不串种（乌桕更弱）
    expect(leaf.fragmentShader).not.toContain('vec3(1.09, 1.10, 1.13)'); // 栾柔毛灰绿背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.10, 1.12, 1.04)'); // 榉树背面乘子不串种
    expect(leaf.fragmentShader).toContain('(1.0 - float(gl_FrontFacing)) * 0.05'); // 两面糙度差 +0.05（「各部均无毛」Verified [1]——最小差 < 悬铃木 0.06）
    expect(0.05).toBeLessThan(0.06);
  });

  it('背光透光中等偏上：峰值 0.33（栾 0.32 < 乌桕 0.33 < 银杏 0.34——纸质薄菱叶）；黄绿透射色；先例峰值不串种', () => {
    const { fragmentShader } = assemble(track(createTriadicaLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('* pow(triBack, 3.0) * triTransVar * triAlpha * 0.33;');
    expect(fragmentShader).toContain('vec3(0.55, 0.91, 0.34)'); // 黄绿透射色（纸质中绿基调）
    expect(0.33).toBeGreaterThan(0.32); // > 栾复叶卡
    expect(0.33).toBeLessThan(0.34); // < 银杏纸质薄叶（家族链相邻档）
    expect(fragmentShader).not.toContain('* 0.30;'); // 朴树峰值不串种
    expect(fragmentShader).not.toContain('* 0.28;'); // 悬铃木峰值不串种
    expect(fragmentShader).not.toContain('* 0.40;'); // 榉树峰值不串种
    expect(fragmentShader).not.toContain('* 0.65;'); // 夏栎裂叶峰值不串种
  });

  it('叶底色 #507c34 中绿-深绿（八树亮度链：栾 > 乌桕 > 夏栎——中绿-深绿档）；光泽中档 roughness 0.58（樟革质 0.50 < 0.58 < 榉 0.62——纸质非革质）', () => {
    const leaf = track(createTriadicaLeafMaterial());
    const hex = leaf.color.getHex();
    expect(hex).toBe(0x507c34); // 工程设定：NC "medium to dark green" [5] + 照片 medium green glossy [7] 交叉
    const [r, g, b] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
    expect(g - b).toBe(72); // 中绿黄绿量级（悬 69 同档——光泽由 specular 承担）
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    expect(luma([r, g, b])).toBeLessThan(luma([0x52, 0x7d, 0x37])); // 暗于栾树（中绿）
    expect(luma([r, g, b])).toBeGreaterThan(luma([0x4e, 0x7c, 0x33])); // 亮于夏栎（中绿-深绿档定位）
    expect(luma([r, g, b])).toBeGreaterThan(luma([0x3e, 0x6c, 0x2c])); // 亮于榉树
    expect(luma([r, g, b])).toBeGreaterThan(luma([0x33, 0x61, 0x2e])); // 亮于香樟（浓绿最暗）
    expect(leaf.roughness).toBe(0.58); // 光泽中档（纸质非革质——gloss 低于香樟革质口径一档）
    expect(0.58).toBeGreaterThan(0.50); // > 香樟革质光泽（糙度更高 = 光泽更低）
    expect(0.58).toBeLessThan(0.62); // < 榉树半光泽微糙
    expect(leaf.metalness).toBe(0);
  });

  it('皮第 8 语言底色 #6f6a62 暗灰-灰褐（八树亮度链暗色族：樟 < 乌桕 < 榉 < 悬 < 栾）；纵裂族高糙哑光 0.92；tri 脊沟剖面在场', () => {
    const bark = track(createTriadicaBarkMaterial());
    const hex = bark.color.getHex();
    expect(hex).toBe(0x6f6a62); // 工程设定：FRPS「暗灰色」+ bark-c「暗灰褐」[7] 交叉
    const [r, g] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff];
    expect(r - g).toBe(5); // 微暖灰褐向（暗灰-灰褐）
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const l = luma([(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff]);
    expect(l).toBeGreaterThan(luma([0x6e, 0x63, 0x52])); // 亮于樟黄褐深沟（暗色族内）
    expect(l).toBeLessThan(luma([0x78, 0x7c, 0x72])); // 暗于榉树灰白
    expect(l).toBeLessThan(luma([0x78, 0x7e, 0x6f])); // 暗于悬铃木灰绿
    expect(l).toBeLessThan(luma([0x90, 0x92, 0x8a])); // 暗于栾树浅色（七树最浅）
    expect(bark.roughness).toBe(0.92); // 纵裂族高糙哑光（vs 悬光滑 0.86 / 栾粉质 0.87）
    const { fragmentShader } = assemble(track(createTriadicaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('abs(fract(vUv.x * 11.0 + triBarkWarp * 0.70)'); // 11 窄脊 tri 剖面（vs 樟 7 宽脊——窄脊族）
    expect(fragmentShader).toContain('0.60 + 0.40 * triBarkTri * triBarkTri'); // 沟浅-中剖面（vs 樟 0.50 深 / 朴 0.76 浅——bark-b 相）
  });

  it('窄条翘皮碎斑（身份核心后半）：翘皮域场 u 低频局部域 × v 高频碎段（条状窄、竖向、碎）+ 窄竖条族 14 条/周 + 条核亮面 + 条界翘缝暗（High）——vs 悬铃木大片地图拼贴分化', () => {
    const { fragmentShader } = assemble(track(createTriadicaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('vec2(vUv.x * 3.4 + 21.0, vUv.y * 7.5 + 13.0)'); // 翘皮域场（u 低频局部域 × v 高频碎段）
    expect(7.5 / 3.4).toBeGreaterThan(1.8); // v 频 >> u 频 = 竖向碎段（条短碎——vs 悬铃木大斑低频两向）
    expect(fragmentShader).toContain('abs(fract(vUv.x * 14.0 + triBarkWarp * 0.50)'); // 窄竖条族 14 条/周（窄条）
    expect(fragmentShader).toContain('smoothstep(0.60, 0.75, triCurlTri)'); // 条核窗（窄条面 ≈1/3 相位宽）
    expect(fragmentShader).toContain('vec3(1.13, 1.11, 1.05)'); // 翘条面浅灰亮（翘起亮缘读向）
    expect(fragmentShader).toContain('vec3(0.72, 0.70, 0.68)'); // 条界翘缝暗（High 近景浮雕）
    expect(fragmentShader).toContain('vec3(0.86, 0.85, 0.92)'); // 沟内冷灰 AO（沟暗脊浅灰两带分化）
    // 悬铃木三色带 / 榉锈橙 / 栾皮孔麻点 / 樟横断不串种
    expect(fragmentShader).not.toContain('vec3(1.32, 1.28, 1.14)');
    expect(fragmentShader).not.toContain('vec3(1.35, 0.92, 0.64)');
    expect(fragmentShader).not.toContain('52.0'); // 栾皮孔格密度不串种（皮孔点不做记档）
    expect(fragmentShader).not.toContain('31.4'); // 樟横断块状通道不串种
  });

  it('干基暗化微渐变（低调）+ 上部灰绿收敛（亮绿小枝大戟科近景点——vs 悬/栾红褐收敛的分化）+ 苔藓不做', () => {
    const { fragmentShader } = assemble(track(createTriadicaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('1.0 - smoothstep(0.6, 2.4, vTreePos.y)'); // 干基暗带门控（老干暗灰深裂读向——低调）
    expect(fragmentShader).toContain('vec3(0.88, 0.87, 0.88)'); // 干基暗化乘色
    expect(fragmentShader).toContain('vec3(0.94, 1.02, 0.88)'); // 上部灰绿收敛（「亮绿色带浅色皮孔」大戟科近景点 [7]）
    expect(fragmentShader).not.toContain('vec3(1.06, 0.94, 0.84)'); // 悬铃木红褐收敛不串种
    expect(fragmentShader).not.toContain('vec3(1.12, 0.96, 0.84)'); // 栾红褐收敛不串种
    expect(fragmentShader).not.toContain('Moss'); // 苔藓不做（bark-a 银灰地衣弱单源不承重——不做不编造）
  });

  it('果域分支（v∈[4,5]，阈值 3.5 隔离带）：绿闭蒴果中绿带黄两端 + u 逐果变奏 + 光泽微高 roughness 0.62（域分支注入）+ 白蜡相/柱头暗点记档不做', () => {
    const { fragmentShader } = assemble(track(createTriadicaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('if (vUv.y >= 3.5) {'); // 果域分支（阈值 3.5 = 果域 4.0 下探 0.5 隔离带——koe 4.5/6.0 三重隔离同款纪律）
    expect(fragmentShader).toContain('} else {'); // 皮域分支
    expect(fragmentShader).toContain('vec3(0.56, 0.66, 0.28)'); // 绿闭果深端（果-c「中绿带黄」[7]）
    expect(fragmentShader).toContain('vec3(0.66, 0.74, 0.36)'); // 绿闭果浅端（两端 per-果变奏）
    expect(fragmentShader).toContain('fract(vUv.x * 13.7 + 0.35)'); // u 逐果随机（几何冻结接口）
    expect(fragmentShader).toContain('if (vUv.y >= 3.5) { roughnessFactor = 0.62; }'); // 果域光泽微高（域分支糙度注入——vs 皮 0.92）
    expect(fragmentShader).not.toContain('vec3(1.00, 0.72, 0.24)'); // 栾金黄花簇不串种（乌桕花不建模记档）
    expect(fragmentShader).not.toContain('waxy'); // 白蜡相不建模（夏季绿闭果口径）
  });
});

describe('分档实装（level 参数；缺省 high = 显式 high）', () => {

  it('三工厂缺省与显式 high 逐位一致（属性 + 键 + GLSL 全文）', () => {
    const pairs: Array<[THREE.Material, THREE.Material, { vertexShader: string; fragmentShader: string }]> = [
      [track(createTriadicaLeafMaterial()), track(createTriadicaLeafMaterial('high')), THREE.ShaderLib.physical],
      [track(createTriadicaBarkMaterial()), track(createTriadicaBarkMaterial('high')), THREE.ShaderLib.physical],
      [track(createTriadicaLeafDepthMaterial()), track(createTriadicaLeafDepthMaterial('high')), THREE.ShaderLib.depth],
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
    expectKey(track(createTriadicaLeafMaterial()), 'triadica:leaf');
    expectKey(track(createTriadicaLeafMaterial('mid')), 'triadica:leaf:mid');
    expectKey(track(createTriadicaLeafMaterial('low')), 'triadica:leaf:low');
    expectKey(track(createTriadicaBarkMaterial()), 'triadica:bark');
    expectKey(track(createTriadicaBarkMaterial('mid')), 'triadica:bark:mid');
    expectKey(track(createTriadicaBarkMaterial('low')), 'triadica:bark:low');
    expectKey(track(createTriadicaLeafDepthMaterial()), 'triadica:leaf-depth');
    expectKey(track(createTriadicaLeafDepthMaterial('mid')), 'triadica:leaf-depth:mid');
    expectKey(track(createTriadicaLeafDepthMaterial('low')), 'triadica:leaf-depth:low');
    expect(keys.size).toBe(9);
  });

  it('叶 Mid：SDF 与 High 同源全形（含心形凹口——档间剪影一致）+ 去叶脉三件/腺点/叶团/糙度叶团项；透光/hue·luma/shade/叶背/flush 保留；片元零噪声', () => {
    const high = assemble(track(createTriadicaLeafMaterial()), THREE.ShaderLib.physical);
    const mid = assemble(track(createTriadicaLeafMaterial('mid')), THREE.ShaderLib.physical);
    expect(sdfOf(mid.fragmentShader)).toBe(sdfOf(high.fragmentShader)); // Mid SDF = High 同源全形
    expect(sdfOf(mid.fragmentShader)).toContain('triNotch'); // 含心形凹口（档间剪影一致——基形变奏是轮廓级）
    for (const gone of ['triVeinMid', 'triVeinBasal', 'triVeinLat', 'triGland', 'triClump', 'triBasalV0', 'triVeinFreq']) {
      expect(mid.fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(mid.fragmentShader).not.toContain('(triClump - 0.5) * 0.06'); // 糙度注入同步去叶团项
    expect(mid.fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0'); // 透光保留
    expect(mid.fragmentShader).toContain('triTransVar');
    expect(mid.fragmentShader).toContain('vec3 triHue'); // hue·luma 逐叶变奏保留
    expect(mid.fragmentShader).toContain('float triLuma');
    expect(mid.fragmentShader).toContain('(0.80 + 0.20 * triShade)'); // 冠内竖向自遮蔽保留（地板 0.80 沿先例口径）
    expect(mid.fragmentShader).toContain('float(gl_FrontFacing)) * 0.05'); // 两面糙度差保留
    expect(mid.fragmentShader).toContain('triFlush'); // flush 三档同体（冠级点缀信号档间一致）
    expect(count(mid.fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0 调用（叶团去采样——Mid 片元零噪声执行）
  });

  it('叶 Low：SDF 换 SDF_LOW（去心形凹口——近景基形变奏细化；包络/骤尖收口与 High 逐字同源）；去叶脉/腺点/叶团/透光；hue·luma/shade/flush/叶背保留；片元零噪声', () => {
    const high = assemble(track(createTriadicaLeafMaterial()), THREE.ShaderLib.physical);
    const low = assemble(track(createTriadicaLeafMaterial('low')), THREE.ShaderLib.physical);
    const lowSdf = sdfOf(low.fragmentShader);
    expect(lowSdf).not.toBe(sdfOf(high.fragmentShader)); // Low SDF = 去凹口版（换字符串）
    expect(lowSdf).not.toContain('triNotch'); // 去心形凹口
    expect(low.fragmentShader).not.toContain('triCordOf'); // 门控函数随段去（Low 无凹口/无叶脉消费者）
    for (const gone of ['triVeinMid', 'triGland', 'triClump', 'triTransVar', 'vec3(0.55, 0.91, 0.34)']) {
      expect(low.fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    // 包络/骤尖收口与 High 逐字同源（档间叶形身份一致的去细节不改形原则——远距保留菱形叶轮廓色块）
    expect(lowSdf).toContain('sin(3.14159 * pow(clamp(triP.y, 0.001, 0.999), 0.94))');
    expect(lowSdf).toContain('mix(1.35, 1.88, smoothstep(0.22, 0.55, triP.y))');
    expect(lowSdf).toContain('2.95 + 0.95 * fract(triRand * 5.731 + 0.41)');
    expect(lowSdf).toContain('clamp(triEdge / 0.04 + 0.5'); // 坡宽同步（档间 AA 边一致）
    expect(count(low.fragmentShader, '#include <opaque_fragment>')).toBe(1); // 透光不注入但锚点原句不动
    expect(low.fragmentShader).toContain('(0.80 + 0.20 * triShade)'); // shade 保留
    expect(low.fragmentShader).toContain('vec3 triHue'); // hue·luma 保留
    expect(low.fragmentShader).toContain('triFlush'); // flush 三档同体
    expect(low.fragmentShader).toContain('float(gl_FrontFacing)) * 0.05'); // 两面糙度差保留
    expect(count(low.fragmentShader, 'facVnoise(')).toBe(3); // 片元零噪声采样（库内 3 为死码，运行时零执行）
  });

  it('皮 Mid：去条界翘缝暗（High 专属近景浮雕读向）；脊沟/翘条亮面/干基暗化/果域全保留（中距「暗灰窄纵裂 + 碎亮斑 + 冠缘绿果」身份）', () => {
    const { fragmentShader } = assemble(track(createTriadicaBarkMaterial('mid')), THREE.ShaderLib.physical);
    expect(fragmentShader).not.toContain('triCurlCrack'); // 条界翘缝去（近景浮雕读向）
    expect(fragmentShader).toContain('triCurlCore'); // 翘条亮面保留（中距碎亮斑身份）
    expect(fragmentShader).toContain('vec2(vUv.x * 3.4 + 21.0, vUv.y * 7.5 + 13.0)'); // 翘皮域场保留
    expect(fragmentShader).toContain('triBarkBase'); // 干基暗化保留
    expect(fragmentShader).toContain('vec3(1.13, 1.11, 1.05)'); // 翘条面亮保留
    expect(fragmentShader).toContain('abs(fract(vUv.x * 11.0'); // 纵裂脊沟保留
    expect(fragmentShader).toContain('vec3(0.56, 0.66, 0.28)'); // 果域绿果保留
    expect(fragmentShader).toContain('vec3(0.94, 1.02, 0.88)'); // 上部灰绿保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 裂线游走 + 翘皮域场（翘缝 ALU 项随段去）
  });

  it('皮 Low：再去翘皮碎斑/干基暗化（远距亚像素/低调项）；纵裂脊沟 + 沟内 AO + 上部灰绿 + 果域保留（远距「暗灰纵裂剪影」保留面）；1× vnoise', () => {
    const { fragmentShader } = assemble(track(createTriadicaBarkMaterial('low')), THREE.ShaderLib.physical);
    // triCurlCore 的 domainVars 预声明三档统一在场（无害）——断言块内赋值表达式缺席（翘皮段随段去）
    for (const gone of ['triCurlCore = smoothstep', 'triCurlField', 'triCurlTri', 'triCurlCrack', 'triBarkBase']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('triBarkRidge'); // 纵裂脊沟保留（远距剪影保留面）
    expect(fragmentShader).toContain('vec3(0.86, 0.85, 0.92)'); // 沟内冷灰 AO 保留
    expect(fragmentShader).toContain('vec3(0.94, 1.02, 0.88)'); // 上部灰绿（结构剪影项三档保留）
    expect(fragmentShader).toContain('vec3(0.56, 0.66, 0.28)'); // 果域绿果保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 裂线游走 1
  });

  it('深度分档：Mid = High SDF（含心形凹口）/ Low = SDF_LOW（去凹口）；与叶表面档内逐字一致（表面/影裁切档内一致）；三档零噪声库', () => {
    const high = assemble(track(createTriadicaLeafDepthMaterial()), THREE.ShaderLib.depth);
    const mid = assemble(track(createTriadicaLeafDepthMaterial('mid')), THREE.ShaderLib.depth);
    const low = assemble(track(createTriadicaLeafDepthMaterial('low')), THREE.ShaderLib.depth);
    const highSdf = sdfOf(high.fragmentShader);
    expect(sdfOf(mid.fragmentShader)).toBe(highSdf); // Mid 深度 = High SDF（同源全形含凹口）
    expect(highSdf).toContain('triNotch'); // 档间剪影一致（心形基影读向保留）
    expect(sdfOf(low.fragmentShader)).not.toBe(highSdf); // Low 深度 = SDF_LOW（去凹口版）
    expect(sdfOf(low.fragmentShader)).not.toContain('triNotch');
    // 表面/影档内一致：叶表面各档 SDF === 深度各档 SDF
    for (const level of ['high', 'mid', 'low'] as const) {
      const surface = assemble(track(createTriadicaLeafMaterial(level)), THREE.ShaderLib.physical);
      const depthShader = assemble(track(createTriadicaLeafDepthMaterial(level)), THREE.ShaderLib.depth);
      expect(sdfOf(surface.fragmentShader)).toBe(sdfOf(depthShader.fragmentShader)); // 同一 GLSL 字符串（单一来源纪律）
      expect(count(depthShader.fragmentShader, 'facVnoise(')).toBe(0); // 三档深度零噪声库
    }
  });

  it('风动三档同源：叶/皮三档顶点 GLSL 全文一致（TRIADICA_WIND 同一常量——档间相位一致 = 身份一致）', () => {
    const leafHigh = assemble(track(createTriadicaLeafMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createTriadicaBarkMaterial()), THREE.ShaderLib.physical);
    for (const level of ['mid', 'low'] as const) {
      const leaf = assemble(track(createTriadicaLeafMaterial(level)), THREE.ShaderLib.physical);
      const bark = assemble(track(createTriadicaBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(leaf.vertexShader).toBe(leafHigh.vertexShader);
      expect(bark.vertexShader).toBe(barkHigh.vertexShader);
    }
  });

  it('分档底参契约不因档破：叶三档 alphaTest/alphaToCoverage/DoubleSide/USE_UV/零贴图；皮三档 FrontSide/无 alphaTest/USE_UV；深度 alphaTest', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const leaf = track(createTriadicaLeafMaterial(level));
      const bark = track(createTriadicaBarkMaterial(level));
      const depth = track(createTriadicaLeafDepthMaterial(level));
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
    for (const make of [createTriadicaLeafMaterial, createTriadicaBarkMaterial]) {
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
    const leafA = track(createTriadicaLeafMaterial());
    const leafB = track(createTriadicaLeafMaterial());
    const barkA = track(createTriadicaBarkMaterial());
    const barkB = track(createTriadicaBarkMaterial());
    const depth = track(createTriadicaLeafDepthMaterial());
    expect(leafA).not.toBe(leafB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(leafA.customProgramCacheKey()).toBe(leafB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([leafA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
    expect(materialUniformsOf(leafA).uTime).not.toBe(materialUniformsOf(leafB).uTime); // uTime 桥接对象实例独立（dispose 安全）
    expect(materialUniformsOf(barkA).uTime).not.toBe(materialUniformsOf(barkB).uTime);
  });

  it('底参与侧向：叶 DoubleSide/光泽中档/USE_UV；皮 FrontSide/纵裂高糙/USE_UV；均零贴图', () => {
    const leaf = track(createTriadicaLeafMaterial());
    const bark = track(createTriadicaBarkMaterial());
    expect(leaf.side).toBe(THREE.DoubleSide);
    expect(leaf.metalness).toBe(0);
    expect(leaf.roughness).toBeGreaterThan(0.50); // 光泽中档（0.58——纸质非革质）
    expect(leaf.roughness).toBeLessThan(0.62);
    expect(leaf.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.FrontSide);
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeGreaterThan(0.9); // 纵裂族高糙哑光
    expect(bark.map).toBeNull();
    expect(leaf.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
  });
});

describe('成本记账（10 万实例每像素预算：叶 High ≈10.5×（全缘免齿载波红利）/ 皮 High 7.5×，hash21=1×/vnoise=3×——包络/凹口 ALU 化红利）', () => {
  it('facVnoise 调用数：叶 High 1 处（3×）、Mid/Low 0 处；皮 High/Mid 2 处（裂线游走 + 翘皮域场）、Low 1 处；深度 0 处（零噪声库注入）；顶点零噪声', () => {
    const leaf = assemble(track(createTriadicaLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createTriadicaBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createTriadicaLeafDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(leaf.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（叶团斑块——包络/凹口 ALU 化免噪声）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（裂线游走 + 翘皮域场）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(0); // 深度零噪声库注入（全缘 SDF 先天满足影 pass 不吃噪声）
    expect(count(leaf.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin/cos
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零循环/零纹理采样（配方确定性纯函数 + SDF 纯 ALU）；全源零三角函数反函数调用（菱形域全 pow/smoothstep 代理——成本纪律）', () => {
    const shaders = [
      assemble(track(createTriadicaLeafMaterial()), THREE.ShaderLib.physical),
      assemble(track(createTriadicaBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createTriadicaLeafDepthMaterial()), THREE.ShaderLib.depth),
    ];
    for (const shader of shaders) {
      for (const source of [shader.vertexShader, shader.fragmentShader]) {
        expect(source).not.toContain('for (');
        expect(source).not.toContain('while');
        expect(source).not.toContain('texture'); // 零贴图零采样（D13）
        expect(source).not.toContain('atan('); // 菱形域免反三角调用（pow/smoothstep 充满度法——成本纪律）
      }
    }
  });
});

describe('注入点缺失即抛（首次渲染前暴雷）', () => {
  it('片元 map_fragment 摘除 → 叶/皮/深度均抛「注入点缺失」', () => {
    for (const make of [createTriadicaLeafMaterial, createTriadicaBarkMaterial, createTriadicaLeafDepthMaterial]) {
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
    const leaf = track(createTriadicaLeafMaterial());
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

    const depth = track(createTriadicaLeafDepthMaterial());
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
    const bark = track(createTriadicaBarkMaterial());
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

    const leaf = track(createTriadicaLeafMaterial());
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

    const leaf = assemble(track(createTriadicaLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createTriadicaBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createTriadicaLeafDepthMaterial()), THREE.ShaderLib.depth);
    for (const shader of [leaf, bark]) {
      expect(braceDelta(expandIncludes(shader.fragmentShader))).toBe(pristinePhysicalFragment);
      expect(braceDelta(shader.vertexShader)).toBe(pristinePhysicalVertex);
    }
    expect(braceDelta(expandIncludes(depth.fragmentShader))).toBe(pristineDepthFragment);
    expect(braceDelta(depth.vertexShader)).toBe(pristineDepthVertex);
  });
});

describe('跨 include 作用域防回归（Step 4 实证修复配套——皮材质 roughness 注入消费 map 注入 else 块内声明的真实编译错误；JS 静态组装零 WebGL 时此类问题不可见，静态 guard 补位）', () => {
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

  /** guard 本体：注入段内出现的每个 tri* 标识符必须为 main 顶层（深度 1）唯一声明，
   *  且声明先于段尾（消费点）——块内声明（作用域在块结束关闭）与块内遮蔽声明（float 重声明）
   *  两种复发形态都红 */
  const crossIncludeScopeGuard = (fragmentShader: string, segment: { start: number; text: string }, label: string): void => {
    const ids = new Set(segment.text.match(/\btri[A-Z][A-Za-z0-9_]*/g) ?? []);
    for (const id of ids) {
      const decl = `float ${id}`;
      expect(count(fragmentShader, decl), `${label}:${id} 声明唯一（块内 float 重声明 = 遮蔽——Step 4 次生 bug 形态）`).toBe(1);
      const declIdx = fragmentShader.indexOf(decl);
      expect(declIdx, `${label}:${id} 声明存在`).toBeGreaterThan(0);
      expect(declIdx, `${label}:${id} 声明先于消费段尾`).toBeLessThan(segment.start + segment.text.length);
      expect(braceDepthFromMain(fragmentShader, declIdx), `${label}:${id} 声明在 main 顶层（跨 include 可见——块内声明即编译错误形态）`).toBe(1);
    }
  };

  it('皮三档：roughnessmap 注入段消费的 tri* 标识符（triBarkSmooth/triCurlCore）均在 main 顶层唯一声明（domainVars 预声明）——块内声明/遮蔽声明复发即红', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const { fragmentShader } = assemble(track(createTriadicaBarkMaterial(level)), THREE.ShaderLib.physical);
      const segment = injectedSegmentAfter(fragmentShader, '#include <roughnessmap_fragment>');
      crossIncludeScopeGuard(fragmentShader, segment, `bark:${level}`);
      // domainVars 预声明两变量在 if 域分支之前（map 注入块内赋值的跨 include 面）
      const preDecl = fragmentShader.indexOf('float triBarkSmooth = 0.0; float triCurlCore = 0.0;');
      expect(preDecl).toBeGreaterThanOrEqual(0);
      expect(preDecl).toBeLessThan(fragmentShader.indexOf('if (vUv.y >= 3.5)')); // 预声明先于域分支块（三档统一——Low 同守）
    }
  });

  it('叶三档：roughnessmap 注入段消费的 tri* 标识符同守（leafBody 平铺无块包裹——结构天然安全，guard 固化防结构性回归）', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const { fragmentShader } = assemble(track(createTriadicaLeafMaterial(level)), THREE.ShaderLib.physical);
      const segment = injectedSegmentAfter(fragmentShader, '#include <roughnessmap_fragment>');
      crossIncludeScopeGuard(fragmentShader, segment, `leaf:${level}`); // High 消费 triClump（main 顶层声明）；Mid/Low 段零 tri* id 自然跳过
    }
  });

  it('叶透光段（opaque_fragment 前注入）消费的 tri* 标识符（triAlpha/triBack/triTransVar）同守——High/Mid', () => {
    for (const level of ['high', 'mid'] as const) { // Low 无透光注入（设计内）
      const { fragmentShader } = assemble(track(createTriadicaLeafMaterial(level)), THREE.ShaderLib.physical);
      const anchorIdx = fragmentShader.indexOf('#if NUM_DIR_LIGHTS > 0');
      expect(anchorIdx).toBeGreaterThanOrEqual(0);
      const endIdx = fragmentShader.indexOf('#include <opaque_fragment>', anchorIdx);
      expect(endIdx).toBeGreaterThan(anchorIdx);
      crossIncludeScopeGuard(fragmentShader, { start: anchorIdx, text: fragmentShader.slice(anchorIdx, endIdx) }, `leaf-trans:${level}`);
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
    const material = track(createTriadicaLeafMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});
