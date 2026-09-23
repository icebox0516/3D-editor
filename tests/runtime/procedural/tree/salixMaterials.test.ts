/**
 * tests/runtime/procedural/tree/salixMaterials.test.ts —— 垂柳叶/皮/深度材质
 * 测试（T011.12，对称 ligustrumMaterials 组织：真实 THREE.ShaderLib 源组装，
 * 静态字符串断言 + SDF 数值锚 JS 镜像，零 WebGL；build()/资产入口归并行几何
 * agent 的资产测试，此处不覆盖——先例无依赖几何的测试形态，全部形态可移植）。
 *
 * 覆盖（Spec docs/research/salix-reference.md 1.0，生产口径 = 任务书「待裁决
 * 位」十项 + 主代理终审记档 3 项修正〔冠幅比上沿 1.3 / 垂幕域 2/5–2/3 / 叶沿
 * 垂索取向〕）：
 * - uTime 接线（TimeUniformService 消费协议）：叶/皮材质挂材质级 uniforms.uTime
 *   （own property）；onBeforeCompile 后 shader.uniforms.uTime 与材质级同对象引用；
 *   GLSL 声明 uniform float uTime；材质挂场景被服务逐帧驱动（frame 写值闭环）；
 * - 风动契约（D19.7，**垂帘两层**——待裁决位 10）：aSeed/aBend/aLeafRand 顶点
 *   attribute 声明存在；相位 = fract(sin(...)) 类 hash（aSeed=0 缺省属性路径
 *   退化为常数相位，全源零除 aSeed——无 NaN）；**整帘低频摆** 0.92 rad/s
 *   ≈ 0.146Hz（大冠垂帘质量摆慢——vs 先例 1.15 ≈ 0.183Hz）+ 顶部 5.2cm（垂帘
 *   端梢摆幅大一档——0.052 > ligustrum 0.044/zelkova 0.045）叶/皮同公式（同串
 *   出现）；**垂索高频低幅颤动** 17–26 rad/s ≈ 2.7–4.1Hz（细索弹性频域上探
 *   zelkova 16–25 之上）/ 9mm 低幅档（< 11mm 家族中幅）；aBend 权重 = 摆幅沿
 *   索长放大语义（卡根≈0 尖大——冻结接口「梢端摆幅大」）；hash 常数
 *   98.127/76.317 与十一先例相位流（sway 77.669–96.441 / flutter 49.337–
 *   73.521）去相关——新值在两域外上侧；**树高锚 9.8306 = ×0.10172**（命名常量
 *   SALIX_TREE_HEIGHT_NOMINAL 导出 + GLSL 字面量 + 测试锚断言——待裁决位 4
 *   slot-0 生产锚；**同步轮 2026-09-23 已落**：10.0 初值 → 9.8306 = Stage 探针
 *   经正式 build() 路径 slot-0 High 实测涌现，ligustrum 8.0→8.4064 同款流程）；
 * - instanceColor 乘算链安全：注入后 <color_fragment> 原句恰一次、注入代码零
 *   vColor 介入；
 * - 狭披针 SDF 与透光：叶 alphaTest 0.5 + alphaToCoverage + 坡宽 0.04（单叶系
 *   口径）；组 0 材质工程契约（材质侧定义）：FrontSide 闭合实体 + 无 alphaTest
 *   + **无果域**（柔荑花序生长季不可见记档不建模——组 0 纯皮域无 uv 域分支，
 *   vs ligustrum/fraxinus/sophora 两域分支的组织简化记档）；深度材质（叶影
 *   裁切）含同一 SDF 函数（单一来源——全文相等）+ RGBADepthPacking + 组 0
 *   实心守卫（aLeafRand=0）+ USE_UV + alphaTest；透光项存在且 NUM_DIR_LIGHTS
 *   守卫；
 * - 物种配方锚定（**zelkova 卵形-披针路径窄域极端化改写**——待裁决位 5/9/7/8）：
 *   SDF = 狭披针包络 v^0.68（峰 v≈0.361 偏基细长——**JS 锚峰位 ∈ [0.32, 0.40]**）
 *   + 基部楔形 **0.88**（**JS 锚 v=0.10 行半宽 < zelkova 镜像——楔形窄收**）
 *   + 先端长渐尖**变指数 1.85+0.75·rand ∈ [1.85, 2.60] 逐叶域上探**（JS 锚
 *   v=0.90 行半宽域全段锐于 zelkova 镜像 + 域实质宽于 zelkova 固定 1.22）+
 *   **高频细齿载波** 2π·13 = 81.68（13 齿/侧 zelkova 10 频率上探）pow 2.2
 *   微尖 + 幅度 ±0.022 = 坡宽 55%（**JS 锚齿纹在场：行宽剖面振荡符号翻转
 *   ≥8 次**——vs 全缘系单调剖面）+ 端部渐隐门控（亚像素齿防碎片——011.10
 *   顶栏斜坡教训口径）+ **零偏斜**（柳属对称叶——无漂移项）+ rand 进 SDF；
 *   **脉序近零信号**（ligustrum 邻档）：中脉弱带 0.12 + 侧脉近零纹 0.03
 *   （< ligustrum 0.04 更近零一档——「近零侧脉」裁决位口径）+ 近梢渐弱门控；
 *   **叶色黄绿调**：底色 #47782d（亮度链 zelkova < **垂柳** < triadica——
 *   中绿-中深绿档）+ hue 暖端 ×(1.08,1.05,0.90) 黄绿强调 + 叶团频率 0.90
 *   （垂帘细束）+ 冠基 3.0m nominal 锚；**两面色差浅绿微银弱档**（待裁决位 9
 *   ——「下面浅绿（微银光）」带绿非苍白，与旱柳系苍白叶背差分是定名判据）：
 *   背面 ×(1.06,1.10,1.08)（G+0.10 主导 + B+0.08 微银 + R+0.06 最小）+ 两面
 *   糙度差 +0.06 弱档 + 先例叶背乘子全不串种；roughness 0.60（薄细叶半光泽
 *   中上档：triadica 0.58 < 0.60 < zelkova 0.62）；**背光透射上探 0.44**
 *   （家族值域链上沿试探：… < 银杏 0.34 < zelkova 0.40 < **垂柳 0.44** <
 *   夏栎 0.65〔裂叶另档〕——细叶高透）+ 亮黄绿透射色 (0.62,0.93,0.33) +
 *   先例峰值全不串种；
 *   皮（**第 13 语言「暗灰黑基 + 波状不规则纵沟脊 + 沟深、脊浅褐 vs 沟近黑
 *   强对比 + 修剪残桩点缀 + 皮孔不显」——待裁决位 7**）：底色 #56534d（
 *   **全家族最暗皮**——luma < 国槐 #6d675d）+ **7 波状纵沟脊** × drift
 *   **1.30 大幅游走**（波状不规则——vs 女贞 0.85 缓游走/白蜡 0.80）+ 沟深
 *   **0.48 全家族最深档**（vs 樟 0.50/国槐 0.52）陡坡剖面 smoothstep(0.18,
 *   0.44) + **脊浅褐 ×(1.14,1.05,0.86) vs 沟近黑 ×(0.58,0.57,0.56) 双色强
 *   对比**（vs 先例单色系 + 单 AO——语言分化核心）+ 上部弱化门控 + 沟内
 *   近黑强 AO + 干基暗化弱档 + **修剪残桩**（22×26 格 22% 有斑稀疏 + 横向
 *   短椭圆 + ×(0.62,0.58,0.55) 暗色【High】）+ **小枝单档**淡褐黄带紫端
 *   ×(1.24,1.10,0.86)（待裁决位 8——Spec 单句色域无龄级两档信号不做两档，
 *   **仅一档 twig 门**——vs fraxinus/ligustrum 两档差异记档；B 端 0.86 高于
 *   白蜡 0.76/女贞 0.74 =「带紫色」端微调）+ **皮孔不做**（FRPS 无记载——
 *   不记不编造）+ 无剥落（悬/榉/乌桕标记不串种）；
 * - 深度材质零噪声库注入（SDF 零 facVnoise——齿载波 cos 为 ALU，zelkova
 *   组合先例）+ Low SDF 零 cos（去齿）；
 * - 分档实装（level 参数，缺省 'high'）：三工厂缺省 ≡ 显式 'high'（属性 +
 *   键 + GLSL 全文逐位相等）；3 工厂 × 3 档 = 9 键互异（跨资产键零碰撞归
 *   assetTaxonomy 全注册资产收容断言）；叶 Mid 去脉弱层/叶团/糙度叶团项（SDF 全形含细齿保留）、Low 换
 *   SDF_LOW **去齿载波**（亚像素齿牺牲 + 防碎片——zelkova/fraxinus「Low 去
 *   齿」先例）再去透光；皮 Mid 去残桩点、Low 再去干基暗化；深度 Mid=High
 *   SDF / Low=SDF_LOW（表面/影档内一致）；风动三档顶点 GLSL 同源；分档底参
 *   契约（alphaTest/侧向/USE_UV）不因档破；uTime 桥接三档不缺位；
 * - program 键纪律：叶/皮/深度三键互异；两次工厂调用材质对象不同（无模块级
 *   共享，D17）但键相同；uniforms 不跨实例共享；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：叶片元 facVnoise
 *   调用 1 处（叶团）、Mid/Low 0 处；皮三档 1 处（游走场）；深度 0 处（零噪声
 *   库注入）；顶点零噪声；全源零循环/零纹理采样/零三角函数反函数调用（零
 *   mat2）；
 * - 注入点缺失即抛（map_fragment/begin_vertex/common/roughnessmap_fragment/
 *   opaque_fragment 摘除各暴雷）；
 * - 跨 include 作用域防回归 guard（triadica Step 4 实证事故配套）+ vec/float
 *   维度守卫（011.8 修复守卫模式：vec3(slxRidge) 显式广播修复形态 toContain +
 *   裸 float 标量注入 vec3 声明的 not.toMatch）；
 * - 结构完整性：include 全展开后花括号配平差值与原版一致（注入不破坏 GLSL
 *   结构）；
 * - TimeUniformService.freeze：冻结期间广播仍写当前值（uTime 常量——树静止）
 *   + 材质兼容。
 * 边界：材质登记 afterEach 统一 dispose 兜底，不跨测试泄漏；**重数值锚测试
 *   显式 timeout: 30000**（011.10 全量并行饿超教训——断言零改动机械加固先例）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms } from 'three';
import { TimeUniformService } from '../../../../src/runtime/services/TimeUniformService';
import {
  SALIX_TREE_HEIGHT_NOMINAL,
  createSalixBarkMaterial,
  createSalixLeafDepthMaterial,
  createSalixLeafMaterial,
} from '../../../../src/runtime/procedural/tree/salix/salixMaterials';
import { assemble, braceDelta, count, createMaterialTracker, expandIncludes, materialUniformsOf, propsOf, sdfOf as extractSdf } from '../../../support/procedural-tree/materialHarness';

const { track, disposeAll } = createMaterialTracker();

/** 提取注入后的 slxLeafAlpha 函数全文（SDF 单一来源比对用；首个 \n} 即函数闭合） */
const sdfOf = (fragmentShader: string): string =>
  extractSdf(fragmentShader, 'float slxLeafAlpha(vec2 slxUv, float slxRand)');

// ── SDF JS 数值锚镜像（zelkova 路径窄域极端化——与 GLSL 逐式对应 + zelkova 对照镜像）──

const fract = (x: number): number => x - Math.floor(x);
const clamp = (x: number, a: number, b: number): number => Math.min(Math.max(x, a), b);
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
const smoothstepJS = (a: number, b: number, x: number): number => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** 垂柳包络半宽 JS 镜像（狭披针 v^0.68 + 楔形基 0.88 + 先端长渐尖 1.85–2.60 逐叶） */
const slxHalfWidth = (v: number, R: number): number => {
  const apex = 1.85 + 0.75 * fract(R * 5.713 + 0.37);
  const envSin = Math.sin(Math.PI * Math.pow(clamp(v, 0.001, 0.999), 0.68));
  return 0.5 * Math.pow(envSin, mix(0.88, apex, smoothstepJS(0.34, 0.92, v)));
};

/** 榉树包络半宽 JS 对照镜像（zelkovaMaterials ZELKOVA_LEAF_SDF 逐式——v^0.70 / 0.72→1.22 固定） */
const zlkHalfWidth = (v: number): number => {
  const envSin = Math.sin(Math.PI * Math.pow(clamp(v, 0.001, 0.999), 0.70));
  return 0.5 * Math.pow(envSin, mix(0.72, 1.22, smoothstepJS(0.38, 0.95, v)));
};

/** 垂柳齿载波半宽扰动 JS 镜像（2π·13 = 81.68、pow 2.2、幅度 ±0.022 满幅且包络窄区随叶宽按比例缩 min(0.044, 0.72·env)、端部渐隐门控） */
const slxSerrJS = (v: number, R: number): number => {
  const apex = 1.85 + 0.75 * fract(R * 5.713 + 0.37);
  const envSin = Math.sin(Math.PI * Math.pow(clamp(v, 0.001, 0.999), 0.68));
  const env = Math.pow(envSin, mix(0.88, apex, smoothstepJS(0.34, 0.92, v)));
  const tooth = Math.pow(0.5 + 0.5 * Math.cos(v * 81.68 - R * 6.28), 2.2);
  const gate = smoothstepJS(0.02, 0.10, v) * (1 - smoothstepJS(0.94, 0.99, v));
  return (tooth - 0.5) * Math.min(0.044, 0.72 * env) * gate;
};

/** 垂柳叶覆盖率 JS 镜像（与 slxLeafAlpha 逐式对应——含齿载波） */
const alphaJS = (u: number, v: number, R: number): number => {
  const edge = slxHalfWidth(v, R) + slxSerrJS(v, R) - Math.abs(u - 0.5);
  return clamp(edge / 0.04 + 0.5, 0, 1);
};

/** 行宽度剖面：该 v 行 alpha≥0.5 的最大 |x|（卡半宽 0.5——归一化卡空间） */
function rowWidthJS(y: number, R: number): number {
  let w = 0;
  for (let i = 0; i <= 400; i++) {
    const x = (i / 400) * 0.4999;
    if (alphaJS(0.5 + x, y, R) >= 0.5 || alphaJS(0.5 - x, y, R) >= 0.5) w = x;
  }
  return w;
}

afterEach(() => {
  disposeAll();
});

describe('uTime 接线（TimeUniformService 消费协议）', () => {
  it('叶/皮材质挂材质级 uniforms.uTime；编译后 shader.uniforms.uTime 同引用；GLSL 声明 uniform', () => {
    for (const material of [track(createSalixLeafMaterial()), track(createSalixBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('材质挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const leaf = track(createSalixLeafMaterial());
    const bark = track(createSalixBarkMaterial());
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

describe('风动契约（D19.7 垂帘两层：整帘低频摆 0.92 rad/s + 垂索高频低幅颤 17–26 rad/s；树高锚 9.8306 = ×0.10172〔待裁决位 4 slot-0 生产锚——同步轮 2026-09-23 Stage 实测已落：10.0 → 9.8306，ligustrum 8.0→8.4064 同款流程〕）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）；hash 常数与十一先例去相关（域外上侧）', () => {
    const leaf = assemble(track(createSalixLeafMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(leaf.vertexShader).toContain(decl);
    }
    expect(leaf.vertexShader).toContain('fract(sin(aSeed * 98.127'); // 整帘摆相位 = hash(aSeed)——十一先例 sway 域 [77.669, 96.441] 外
    expect(leaf.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 76.317'); // 垂索颤相位——先例 flutter 域 [49.337, 73.521] 外
    // 域外自查（数值面）：十一先例相位常数全集（源文件逐位核对——celtis 复制 tree3a 键位去重）vs 垂柳新值
    const precedentSway = [77.669, 78.233, 79.193, 81.273, 82.537, 84.913, 86.531, 88.217, 91.523, 93.847, 96.441];
    const precedentFlutter = [49.337, 51.171, 53.419, 57.431, 58.219, 61.157, 63.917, 65.443, 68.137, 70.913, 73.521];
    expect(98.127).toBeGreaterThan(Math.max(...precedentSway)); // sway 域外（上侧）
    expect(76.317).toBeGreaterThan(Math.max(...precedentFlutter)); // flutter 域外（上侧）
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(leaf.vertexShader + leaf.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('整帘低频摆叶/皮同公式（同串出现）+ 低频慢于先例 + 顶部 5.2cm 大一档；垂索颤含 aBend 权重（沿索长放大语义）且 9mm 低幅档、17–26 rad/s 频域上探 zelkova 16–25；树高锚 0.10172 = 1/9.8306 同步轮实测值（命名常量断言）', () => {
    const leaf = assemble(track(createSalixLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createSalixBarkMaterial()), THREE.ShaderLib.physical);
    const swayCore = 'slxWindH * slxWindH * 0.052 * sin(uTime * 0.92';
    expect(leaf.vertexShader).toContain(swayCore);
    expect(bark.vertexShader).toContain(swayCore); // 皮不动叶动会撕裂穿帮——同公式同相位（组 0 aBend 恒 0 免颤）
    expect(0.92).toBeLessThan(1.15); // 整帘低频摆慢于先例 1.15 rad/s（大冠垂帘质量分布）
    expect(0.052).toBeGreaterThan(0.045); // 顶部摆幅 > zelkova 0.045（垂帘端梢摆幅大一档）
    expect(0.052).toBeLessThan(0.08); // 家族域内合理上段
    expect(leaf.vertexShader).toContain('aBend * 0.009'); // 垂索颤幅度 9mm 低幅档（细叶轻摆）
    expect(0.009).toBeLessThan(0.011); // < 11mm 家族中幅档（低幅）
    expect(0.009).toBeGreaterThanOrEqual(0.008); // ≥ zelkova 8mm 细叶档
    expect(leaf.vertexShader).toContain('uTime * (17.0 + 9.0 * slxFlutterPhase)'); // 17–26 rad/s（≈2.7–4.1Hz——细索弹性高频）
    expect(17.0).toBeGreaterThan(16.0); // 频域下沿 > zelkova 下沿 16（上探）
    expect(26.0).toBeGreaterThan(25.0); // 频域上沿 > zelkova 上沿 25（上探）
    expect(leaf.vertexShader).toContain('position.y * 0.10172'); // 树高锚 ×0.10172（1/9.8306——见常量断言；同步轮 2026-09-23 Stage 实测已落）
    expect(SALIX_TREE_HEIGHT_NOMINAL).toBe(9.8306); // 树高锚常量（slot-0 High 实测涌现——同步轮 2026-09-23：10.0 → 9.8306，Stage 探针经正式 build() 路径）
    expect(1 / SALIX_TREE_HEIGHT_NOMINAL).toBeCloseTo(0.10172, 5); // GLSL 字面量 = 1/nominal（5 位小数 = fraxinus 0.09526 同步轮精度口径）
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createSalixLeafMaterial()), track(createSalixBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('狭披针 SDF 与透光', () => {
  it('叶 alphaTest 0.5 + alphaToCoverage + 坡宽 0.04（单叶系口径）；片元含 SDF 计算式并写入 alpha', () => {
    const material = track(createSalixLeafMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float slxLeafAlpha('); // 狭披针 SDF 主函数（单一来源）
    expect(fragmentShader).toContain('slxLeafAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = slxAlpha;'); // alphatest_fragment 上游写入
    expect(fragmentShader).toContain('clamp(slxEdge / 0.04 + 0.5'); // 坡宽 0.04（沿先例 AA 口径）
  });

  it('组 0 材质工程契约（材质侧定义）：FrontSide 闭合实体（纯皮域）+ 无 alphaTest + USE_UV + 无果域分支（柔荑花序生长季不可见记档不建模）', () => {
    const bark = track(createSalixBarkMaterial());
    expect(bark.side).toBe(THREE.FrontSide); // 皮管闭合实体（无果域——无第二域）
    expect(bark.alphaTest).toBe(0); // 无裁切
    expect(bark.alphaToCoverage).toBe(false);
    expect(bark.defines?.USE_UV).toBe('');
    const { fragmentShader } = assemble(bark, THREE.ShaderLib.physical);
    expect(fragmentShader).not.toContain('3.5)'); // 无 uv 域身份分支（vs ligustrum/fraxinus/sophora 两域——无果域组织简化记档）
    expect(fragmentShader).not.toContain('ruit'); // 无果域体
  });

  it('深度材质（叶影裁切）：同一 SDF 函数 + RGBADepthPacking + 组 0 实心守卫 + USE_UV + alphaTest；风动不进 depth；零噪声库注入', () => {
    const material = track(createSalixLeafDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.depthPacking).toBe(THREE.RGBADepthPacking);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('slxLeafAlpha(vUv, vLeafRand)');
    expect(shader.fragmentShader).toContain('step(0.0001, vLeafRand)'); // 组 0 aLeafRand=0 → 实心（皮圆柱 uv 域不误裁——triadica 恒等 attribute 先例）
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
    expect(count(shader.fragmentShader, 'facVnoise(')).toBe(0); // 零噪声库注入——齿载波 cos 为 ALU（影 pass 不吃噪声）
    expect(shader.fragmentShader).not.toContain('facHash21'); // 噪声库整体未挂（SDF 引入噪声即编译暴雷——保护性约束）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫（无平行光场景安全降级）', () => {
    const { fragmentShader } = assemble(track(createSalixLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(fragmentShader).toContain('directionalLights[0]');
    expect(fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
  });
});

describe('物种配方锚定（Spec salix-reference 1.0；生产口径 = 任务书待裁决位十项：狭披针 SDF zelkova 路径窄域极端化 / 高频细齿载波 / 浅绿微银弱差 / 透射上探 / 树皮第 13 语言 / 小枝单档）', () => {
  it('SDF 核心（zelkova 路径改写——待裁决位 5）：v^0.68 狭披针包络 + 基 0.88 楔形收窄 + 先端变指数 1.85–2.60 逐叶域上探（宽于 zelkova 固定 1.22）+ 高频细齿载波 81.68（13 齿 zelkova 10 上探）pow 2.2 + 端部渐隐门控 + 零偏斜（柳属对称叶）', () => {
    const leaf = assemble(track(createSalixLeafMaterial()), THREE.ShaderLib.physical);
    const sdf = sdfOf(leaf.fragmentShader);
    expect(sdf).toContain('pow(clamp(slxP.y, 0.001, 0.999), 0.68)'); // 狭披针包络 v^0.68（峰 v≈0.361——vs zelkova v^0.70→0.371）
    expect(sdf).toContain('mix(0.88,'); // 基部楔形 0.88（窄收于圆形系 0.72——「基部楔形」cuneate）
    expect(sdf).toContain('1.85 + 0.75 * fract(slxRand * 5.713 + 0.37)'); // 先端长渐尖变指数逐叶 [1.85, 2.60]（域上探——「先端长渐尖」Verified；rand 进 SDF 记档）
    expect(sdf).toContain('smoothstep(0.34, 0.92, slxP.y)'); // 渐尖起坡 0.34（中下段渐起——长尾读向）
    expect(sdf).toContain('cos(slxP.y * 81.68'); // 高频细齿载波 2π·13 = 81.68（13 齿/侧——zelkova 62.83〔10 齿〕频率上探，「齿极细密」）
    expect(sdf).toContain(', 2.2)'); // pow 2.2 微尖细齿（vs zelkova 2.6 尖头——近全缘观感）
    expect(sdf).toContain('* min(0.044, 0.72 * slxEnv) * slxGate'); // 齿幅度 ±0.022 满幅 = 坡宽 55% + 包络窄区随叶宽按比例缩（amp ≤ 0.72·env 齿谷恒留 0.14·env〔= 半宽的 28%——谷端下探 0.36·env〕中脉带——防长渐尖尾区齿谷裁穿中脉断裂碎片，数值锚首跑实证缺陷修复形态）
    expect(sdf).toContain('smoothstep(0.02, 0.10, slxP.y) * (1.0 - smoothstep(0.94, 0.99, slxP.y))'); // 端部亚叶缘渐隐门控（防 AA 边噪声 + 亚像素齿碎片——011.10 顶栏斜坡教训口径）
    expect(sdf).not.toContain('facVnoise'); // 零噪声引用（深度材质不挂噪声库的前提——齿载波 cos 为 ALU）
    expect(sdf).not.toMatch(/slxP\.x\s*-=/); // 零偏斜（柳属对称叶——vs zelkova 榆科 0.030 基部偏斜漂移）
    // SDF 单一来源——影裁切叶形自动同步
    const depth = assemble(track(createSalixLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(sdfOf(depth.fragmentShader)).toBe(sdf);
  });

  it('SDF 数值锚（JS 镜像 + zelkova 对照镜像）：峰位 v ∈ [0.32, 0.40] 偏基细长 + 基段楔形窄收（< zelkova 镜像）+ 先端 v=0.90 全域锐于 zelkova + 变体域实质宽 + 卡峰半宽 0.5 满卡（长宽比 8–18 归几何）+ 细齿纹在场（行宽剖面振荡 ≥8 次翻转——vs 全缘单调）+ 主形态单峰无腰（容差滤齿）+ 两端收尖 + 中脉连续', { timeout: 30000 }, () => {
    // ① 峰位：垂柳峰 v ∈ [0.32, 0.40]（狭披针偏基——包络 sin 峰唯一于 v^0.68 = 0.5 处）
    let peakV = 0;
    let peakW = 0;
    for (let i = 0; i <= 500; i++) {
      const v = 0.02 + (i / 500) * 0.96;
      const w = slxHalfWidth(v, 0.5);
      if (w > peakW) { peakW = w; peakV = v; }
    }
    expect(peakV).toBeGreaterThanOrEqual(0.32); // 狭披针偏基下沿
    expect(peakV).toBeLessThanOrEqual(0.40); // 上沿（≈0.361——vs zelkova 0.371 更偏基）
    expect(peakV).toBeLessThan(0.371 + 0.005); // 峰位 ≤ zelkova 镜像峰位（0.5^(1/0.70) ≈ 0.3715）——更偏基细长读向
    // ② 基段楔形窄收：v=0.10 行半宽 < zelkova 镜像同位（「基部楔形」vs zelkova 圆形/浅心形——基段指数 0.88 > 0.72 的量化面）
    expect(slxHalfWidth(0.10, 0.37)).toBeLessThan(zlkHalfWidth(0.10)); // 垂柳 ≈0.324 < zelkova ≈0.341
    // ③ 先端域上探且全段锐于 zelkova：v=0.90 行半宽域 [min, max] 全 ≤ zelkova 镜像 0.081
    let apexMin = 99;
    let apexMax = 0;
    for (let i = 0; i < 500; i++) {
      const R = (i + 0.5) / 500;
      const w = slxHalfWidth(0.90, R);
      apexMin = Math.min(apexMin, w);
      apexMax = Math.max(apexMax, w);
    }
    expect(apexMax).toBeLessThan(zlkHalfWidth(0.90)); // 全域锐于 zelkova ≈0.081（长渐尖端 1.85 已强于 zelkova 固定 1.22）
    expect(apexMin).toBeLessThan(apexMax - 0.015); // 变体域实质（min ≈0.009 渐长尖 / max ≈0.030 渐尖——「域上探」逐叶统计）
    // ④ 卡峰半宽 = 0.5 满卡（包络峰行达卡缘——真实长宽比 8–18 由几何细长卡承载，SDF 只管包络）
    expect(peakW).toBeGreaterThan(0.499); // 满卡（峰行 env=1 → 0.5·1）
    expect(peakW).toBeLessThanOrEqual(0.5);
    // ⑤ 细齿纹在场：门内中段行宽 - 包络半宽（serr 项）符号翻转 ≥8 次（13 齿/侧 → 门内 ≈11 齿周期；vs 全缘系 serr ≡ 0）
    for (const R of [0.13, 0.51, 0.89]) {
      let flips = 0;
      let prevSign = 0;
      for (let i = 0; i <= 800; i++) {
        const v = 0.12 + (i / 800) * 0.80; // 门内中段（gate=1 域）
        const s = Math.sign(slxSerrJS(v, R));
        if (s !== 0 && prevSign !== 0 && s !== prevSign) flips++;
        if (s !== 0) prevSign = s;
      }
      expect(flips, `R=${R} 齿纹振荡翻转数`).toBeGreaterThanOrEqual(8); // 细齿载波在场（高频近全缘观感——非全缘系零振荡）
    }
    // ⑥ 主形态单峰无腰（包络半宽剖面——齿为边缘调制、主形态本就是包络性质：hw 剖面无齿直接判，
    //    容差 0.002 同 ligustrum 全缘系口径；齿纹在场性由 ⑤ 独立断言）
    for (const R of [0.17, 0.51, 0.83]) {
      const w: number[] = [];
      for (let i = 0; i <= 120; i++) w.push(slxHalfWidth(0.02 + (i / 120) * 0.96, R));
      let reversals = 0; // 方向翻转计数（+→−）：容差 0.002 内视作平台
      let dir = 0;
      for (let i = 1; i < w.length; i++) {
        const d = w[i] - w[i - 1];
        if (Math.abs(d) < 0.002) continue;
        const nd = Math.sign(d);
        if (dir !== 0 && nd !== dir) reversals++;
        dir = nd;
      }
      expect(reversals, `R=${R} 包络剖面单峰无腰`).toBe(1); // 狭披针单叶连续剖面（vs 复叶系缢缩多峰的反例记档）
    }
    // ⑦ 两端收尖（非方端）：v=0.02 与 v=0.98 行宽 < 0.5·maxW
    for (const R of [0.17, 0.51]) {
      const maxW = rowWidthJS(0.36, R);
      expect(rowWidthJS(0.02, R), `R=${R} 基端收尖`).toBeLessThan(0.5 * maxW);
      expect(rowWidthJS(0.98, R), `R=${R} 先端收尖`).toBeLessThan(0.5 * maxW);
    }
    // ⑧ 中脉连续：u=0.5 处 alpha ≥ 0.5 全 v（叶面永不裁穿）
    for (const R of [0.13, 0.37, 0.51, 0.77]) {
      for (let i = 0; i <= 200; i++) {
        expect(alphaJS(0.5, 0.005 + (i / 200) * 0.99, R), `R=${R} 中脉连续`).toBeGreaterThanOrEqual(0.5);
      }
    }
  });

  it('脉序近零信号（待裁决位 5——ligustrum 近零脉邻档）：中脉弱带 0.12 + 侧脉近零纹 0.03（< ligustrum 0.04 更近零一档——「近零侧脉」裁决口径）+ 近梢渐弱门控', () => {
    const { fragmentShader } = assemble(track(createSalixLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('slxVeinMid * 0.12 + slxVeinLat * 0.03'); // 近零权重（中脉清晰弱亮 + 侧脉近零）
    expect(fragmentShader).toContain('1.0 - smoothstep(0.008, 0.032, abs(slxP.x))'); // 中脉弱带（细叶窄带）
    expect(fragmentShader).toContain('sin(slxP.y * 69.1'); // 侧脉羽状近零纹（≈2π·11 对统计读向不承重）
    expect(0.12).toBeLessThanOrEqual(0.12); // 中脉 = ligustrum 同档弱亮带
    expect(0.03).toBeLessThan(0.04); // 侧脉更近零一档（ligustrum 0.04）
    expect(fragmentShader).not.toContain('slxDomatia'); // 樟脉腋腺窝不复制（垂柳无）
    expect(fragmentShader).not.toContain('slxTri3'); // 樟离基三出轨迹不复制（纯羽状）
  });

  it('两面浅绿微银弱差（待裁决位 9——「下面浅绿（微银光）」带绿非苍白，与旱柳系苍白叶背差分是定名判据）：背面 ×(1.06,1.10,1.08) G 主导 + B 微银抬升 + 两面糙度差 +0.06 弱档；家族叶背乘子不串种', () => {
    const leaf = assemble(track(createSalixLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('mix(vec3(1.06, 1.10, 1.08), vec3(1.0), float(gl_FrontFacing))'); // 背面浅绿微银（G+0.10 主导 / B+0.08 微银 / R+0.06 最小）
    const back = [1.06, 1.10, 1.08];
    expect(back[1] - 1.0).toBeGreaterThan(back[0] - 1.0); // G 抬升 > R 抬升 = 浅绿主导
    expect(back[1] - 1.0).toBeGreaterThan(back[2] - 1.0); // G 抬升 > B 抬升 = 微银非灰白（B 不主导——vs 旱柳系苍白不提亮偏冷）
    expect(leaf.fragmentShader).not.toContain('vec3(1.16, 1.18, 1.28)'); // 国槐灰白加重档不串种（旱柳系苍白同向——垂柳差分判据）
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.05, 1.16)'); // 樟 glaucous 粉感背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.09, 1.11, 1.17)'); // 白蜡灰向背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.10, 1.12, 1.04)'); // 榉无粉淡绿背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.08, 1.11, 1.04)'); // 女贞淡绿背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.09, 1.10, 1.13)'); // 栾柔毛灰绿背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.08, 1.02)'); // 乌桕背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.07, 1.05)'); // 重阳木弱差背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.08, 1.10, 1.02)'); // 悬铃木背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.02, 1.00, 1.10)'); // 朴树背面不串种
    expect(leaf.fragmentShader).toContain('(1.0 - float(gl_FrontFacing)) * 0.06'); // 两面糙度差 +0.06（弱档——sophora 同档）
  });

  it('薄细叶半光泽（工程设定）：front roughness 0.60 ∈ (triadica 0.58, zelkova 0.62) 中上档 + metalness 0 + 无 envMap', () => {
    const leaf = track(createSalixLeafMaterial());
    expect(leaf.roughness).toBe(0.60);
    expect(0.60).toBeGreaterThan(0.58); // > triadica 0.58
    expect(0.60).toBeLessThan(0.62); // < zelkova 0.62（半光泽中上档）
    expect(leaf.metalness).toBe(0);
    expect(leaf.envMap).toBeNull(); // 不引入 envMap（缺口维持归 011.13——下限口径）
  });

  it('背光透射家族值域链上沿试探（待裁决位 9——「细叶高透发光观感」）：峰值 0.44（… < 银杏 0.34 < zelkova 0.40 < **垂柳 0.44** < 夏栎 0.65〔裂叶另档〕）；亮黄绿透射色；先例峰值不串种', () => {
    const { fragmentShader } = assemble(track(createSalixLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('* pow(slxBack, 3.0) * slxTransVar * slxAlpha * 0.44;');
    expect(fragmentShader).toContain('vec3(0.62, 0.93, 0.33)'); // 亮黄绿透射色（细叶背光发光——亮于 zelkova (0.60,0.92,0.34)）
    expect(0.44).toBeGreaterThan(0.40); // > zelkova 单叶系上沿（家族值域链上沿试探）
    expect(0.44).toBeLessThan(0.65); // < 夏栎裂叶另档
    // 透射语句形态不串种（透射峰值锚以 slxAlpha 前缀收窄）
    expect(fragmentShader).not.toContain('slxAlpha * 0.21;'); // 女贞峰值不串种
    expect(fragmentShader).not.toContain('slxAlpha * 0.22;'); // 樟峰值不串种
    expect(fragmentShader).not.toContain('slxAlpha * 0.28;'); // 悬铃木峰值不串种
    expect(fragmentShader).not.toContain('slxAlpha * 0.30;'); // 朴树峰值不串种
    expect(fragmentShader).not.toContain('slxAlpha * 0.31;'); // 重阳木峰值不串种
    expect(fragmentShader).not.toContain('slxAlpha * 0.318;'); // 白蜡峰值不串种
    expect(fragmentShader).not.toContain('slxAlpha * 0.32;'); // 栾峰值不串种
    expect(fragmentShader).not.toContain('slxAlpha * 0.325;'); // 国槐峰值不串种
    expect(fragmentShader).not.toContain('slxAlpha * 0.33;'); // 乌桕峰值不串种
    expect(fragmentShader).not.toContain('slxAlpha * 0.34;'); // 银杏峰值不串种
    expect(fragmentShader).not.toContain('slxAlpha * 0.40;'); // 榉峰值不串种
    expect(fragmentShader).not.toContain('slxAlpha * 0.65;'); // 夏栎裂叶峰值不串种
  });

  it('叶底色 #47782d 中绿-中深绿黄绿向（工程设定——FRPS「上面绿色」+ NC + 照片中绿黄绿调交叉）+ hue 暖端黄绿强调 + 叶团频率 0.90（垂帘细束）+ 冠基 3.0m nominal 锚', () => {
    const leaf = track(createSalixLeafMaterial());
    const hex = leaf.color.getHex();
    expect(hex).toBe(0x47782d); // 工程设定：Spec §5 上面中绿-中深绿 + 阳面黄绿调（hue 暖端承载）
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const [r, g, b] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
    expect(luma([r, g, b])).toBeGreaterThan(luma([0x3e, 0x6c, 0x2c])); // 亮于 zelkova 深绿（中绿-中深绿档）
    expect(luma([r, g, b])).toBeLessThan(luma([0x50, 0x7c, 0x34])); // 暗于 triadica 中绿-深绿
    expect(g - r).toBeGreaterThan(45); // 黄绿向（G−R = 49——黄绿调中上；「阳面/幼叶黄绿调」基调）
    const { fragmentShader } = assemble(track(createSalixLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('vec3(1.08, 1.05, 0.90)'); // hue 暖端黄绿强调（身份色调变奏主导端——通道摆幅 ≤15% 纪律内）
    expect(fragmentShader).toContain('* 0.90 + vec2(41.7, 78.2)'); // 叶团频率 0.90（波长 ≈1.11m——垂帘细束纹理）
    expect(fragmentShader).toContain('(vTreePos.y - 3.0) / 2.8'); // 冠基 3.0m nominal 工程锚（干高占比 ≈0.25–0.35 × ≈10m 域中值——同步轮缺口候选⑤）
  });

  it('皮第 13 语言底色 #56534d 暗灰-灰黑（FRPS「树皮灰黑色」+ FOC/NC gray(ish) black + bark-a「暗灰褐-近黑」交叉——全家族最暗皮：luma < 国槐 #6d675d）；深沟深裂族高糙 0.93', () => {
    const bark = track(createSalixBarkMaterial());
    const hex = bark.color.getHex();
    expect(hex).toBe(0x56534d); // 工程设定：FRPS 灰黑 [1] + FOC "grayish black" [3] + NC "gray-black" [4] + bark-a [6] 交叉
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const l = luma([(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff]);
    expect(l).toBeLessThan(luma([0x6d, 0x67, 0x5d])); // 暗于国槐（全家族最暗皮——「灰黑-近黑」）
    expect(bark.roughness).toBe(0.93); // 深沟深裂族高糙哑光（国槐 0.93 同档）
    expect(bark.metalness).toBe(0);
  });

  it('脊沟系统（待裁决位 7）：7 波状纵沟脊 × drift 1.30 大幅游走（「波状不规则」vs 女贞 0.85/白蜡 0.80）+ 沟深 0.48 全家族最深档（vs 樟 0.50/国槐 0.52）+ 陡坡剖面 + 脊浅褐 ×(1.14,1.05,0.86) vs 沟近黑 ×(0.58,0.57,0.56) 双色强对比 + 上部弱化门控 + 沟内近黑强 AO + 干基暗化弱档 + 无剥落', () => {
    const { fragmentShader } = assemble(track(createSalixBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('abs(fract(vUv.x * 7.0 + slxWarp * 1.30)'); // 7 波状纵沟脊/周 × drift 1.30 大幅游走（「波状不规则纵沟脊」bark-a 双问）
    expect(fragmentShader).toContain('smoothstep(0.18, 0.44, slxTri)'); // 陡坡剖面（沟深——vs 女贞浅宽坡 0.30–0.62）
    expect(fragmentShader).toContain('mix(0.48 + 0.52 * slxPlate'); // 沟深 0.48 全家族最深档（vs 樟 0.50/国槐 0.52——「沟深」）
    expect(fragmentShader).toContain('smoothstep(3.4, 6.0, vTreePos.y)'); // 上部大枝弱化门控（幼干-大枝浅纹）
    expect(fragmentShader).toContain('vec3(1.14, 1.05, 0.86)'); // 脊面浅褐暖乘（「脊浅褐」——双色对比亮端）
    expect(fragmentShader).toContain('vec3(0.58, 0.57, 0.56)'); // 沟内近黑强 AO（「沟近黑」——双色对比暗端；强于国槐沟内冷中性弱档）
    expect(0.48).toBeLessThan(0.50); // 沟深 < 樟 0.50（全家族最深档）
    expect(fragmentShader).toContain('vec3(0.90, 0.90, 0.91)'); // 干基暗化弱档乘色
    expect(fragmentShader).toContain('slxBarkBase * 0.45'); // 干基暗化弱档权重
    expect(fragmentShader).not.toContain('vUv.x * 8.0'); // 白蜡 8 脊不串种（7 = 独立位）
    expect(fragmentShader).not.toContain('vUv.x * 6.0'); // 国槐 6 板状粗脊不串种
    expect(fragmentShader).not.toContain('vUv.x * 10.0'); // 女贞 10 细脊不串种
    expect(fragmentShader).not.toContain('vec3(1.32, 1.28, 1.14)'); // 悬铃木新露奶油白带不串种（无剥落）
    expect(fragmentShader).not.toContain('vec3(1.35, 0.92, 0.64)'); // 榉锈橙新斑不串种
    expect(fragmentShader).not.toContain('Moss'); // 苔藓不做（Spec 无记载不承重——不做不编造）
  });

  it('修剪残桩场（High 专属近景——「常见修剪残桩与愈疤」bark-a 双问）+ 皮孔不做：22×26 格 22% 稀疏 + 横向短椭圆 + 暗色 ×(0.62,0.58,0.55)', () => {
    const { fragmentShader } = assemble(track(createSalixBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('vec2(vUv.x * 22.0, vUv.y * 26.0)'); // 残桩格密度（22×26）
    expect(fragmentShader).toContain('step(0.78, slxSR)'); // 22% 格有斑（稀疏门——「点缀」）
    expect(fragmentShader).toContain('length(vec2(slxSF.x * 1.3, slxSF.y * 0.7))'); // 横向短椭圆（x 拉宽 y 压扁——残桩截面横向读向；重验修正：原 0.7/1.3 因子与「横向」意图相反，已翻转同步）
    expect(fragmentShader).toContain('vec3(0.62, 0.58, 0.55)'); // 残桩暗色短斑（愈疤暗斑）
    expect(fragmentShader).not.toContain('enticel'); // 皮孔不做（FRPS/FOC 垂柳条目无皮孔记载——vs ligustrum 皮孔场/白蜡皮孔弱对比点：不记不编造）
  });

  it('小枝单档淡褐黄带紫端（待裁决位 8——Spec 单句色域无龄级两档信号，不做两档 vs fraxinus/ligustrum 两档先例差异记档）：×(1.24,1.10,0.86)（R 主导淡褐黄 + B 端高于白蜡/女贞 =「带紫色」端微调）+ 仅一档 twig 门', () => {
    const { fragmentShader } = assemble(track(createSalixBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('smoothstep(5.8, 7.6, vTreePos.y)'); // 小枝高位门（nominal 10m 尺度）
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.45, 0.95, vUv.y))'); // 小弧长门（「细枝管 v 小」几何契约注记——高位 × 小 v 双门控）
    expect(fragmentShader).toContain('vec3(1.24, 1.10, 0.86)'); // 淡褐黄-淡褐带紫端单档（FRPS「淡褐黄色、淡褐色或带紫色」——B 端 0.86 > 白蜡 0.76/女贞 0.74 = 紫端微调）
    expect(fragmentShader).not.toContain('slxTwigMid'); // 无第二档（单档——vs fraxinus/ligustrum 两档）
    expect(fragmentShader).not.toContain('vec3(1.16, 1.04, 0.76)'); // 白蜡黄褐两档枝不串种
    expect(fragmentShader).not.toContain('vec3(1.20, 1.00, 0.74)'); // 女贞红铜两档枝不串种
  });
});

describe('分档实装（level 参数；缺省 high = 显式 high）', () => {

  it('三工厂缺省与显式 high 逐位一致（属性 + 键 + GLSL 全文）', () => {
    const pairs: Array<[THREE.Material, THREE.Material, { vertexShader: string; fragmentShader: string }]> = [
      [track(createSalixLeafMaterial()), track(createSalixLeafMaterial('high')), THREE.ShaderLib.physical],
      [track(createSalixBarkMaterial()), track(createSalixBarkMaterial('high')), THREE.ShaderLib.physical],
      [track(createSalixLeafDepthMaterial()), track(createSalixLeafDepthMaterial('high')), THREE.ShaderLib.depth],
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
    expectKey(track(createSalixLeafMaterial()), 'salix:leaf');
    expectKey(track(createSalixLeafMaterial('mid')), 'salix:leaf:mid');
    expectKey(track(createSalixLeafMaterial('low')), 'salix:leaf:low');
    expectKey(track(createSalixBarkMaterial()), 'salix:bark');
    expectKey(track(createSalixBarkMaterial('mid')), 'salix:bark:mid');
    expectKey(track(createSalixBarkMaterial('low')), 'salix:bark:low');
    expectKey(track(createSalixLeafDepthMaterial()), 'salix:leaf-depth');
    expectKey(track(createSalixLeafDepthMaterial('mid')), 'salix:leaf-depth:mid');
    expectKey(track(createSalixLeafDepthMaterial('low')), 'salix:leaf-depth:low');
    expect(keys.size).toBe(9);
  });

  it('叶 Mid：SDF 与 High 同源全形（含细齿载波——档间剪影一致）+ 去脉弱层/叶团/糙度叶团项；透光/hue·luma/shade/叶背保留；片元零噪声', () => {
    const high = assemble(track(createSalixLeafMaterial()), THREE.ShaderLib.physical);
    const mid = assemble(track(createSalixLeafMaterial('mid')), THREE.ShaderLib.physical);
    expect(sdfOf(mid.fragmentShader)).toBe(sdfOf(high.fragmentShader)); // Mid SDF = High 同源全形（含齿）
    for (const gone of ['slxVeinMid', 'slxVeinLat', 'slxClump']) {
      expect(mid.fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(mid.fragmentShader).not.toContain('(slxClump - 0.5) * 0.06'); // 糙度注入同步去叶团项
    expect(mid.fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0'); // 透光保留
    expect(mid.fragmentShader).toContain('slxTransVar');
    expect(mid.fragmentShader).toContain('vec3 slxHue'); // hue·luma 逐叶变奏保留
    expect(mid.fragmentShader).toContain('float slxLuma');
    expect(mid.fragmentShader).toContain('(0.80 + 0.20 * slxShade)'); // 冠内竖向自遮蔽保留（地板 0.80 沿先例口径）
    expect(mid.fragmentShader).toContain('float(gl_FrontFacing)) * 0.06'); // 两面糙度差保留
    expect(mid.fragmentShader).toContain('vec3(1.06, 1.10, 1.08)'); // 叶背浅绿微银保留（三档同体）
    expect(count(mid.fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0 调用（叶团去采样——Mid 片元零噪声执行）
  });

  it('叶 Low：SDF 换零齿版（亚像素齿牺牲 + 防碎片——去 cos 载波；包络/楔形基/长渐尖与 High 逐字同源）+ 去透光；hue·luma/shade/叶背保留；片元零噪声', () => {
    const high = assemble(track(createSalixLeafMaterial()), THREE.ShaderLib.physical);
    const low = assemble(track(createSalixLeafMaterial('low')), THREE.ShaderLib.physical);
    expect(sdfOf(low.fragmentShader)).not.toBe(sdfOf(high.fragmentShader)); // Low SDF = 独立零齿版（vs 女贞档位坍缩——垂柳有齿可去走 zelkova 分档体例）
    const lowSdf = sdfOf(low.fragmentShader);
    expect(lowSdf).not.toContain('cos('); // 去齿载波（亚像素齿 Low 消去——011.10 记档 + zelkova/fraxinus 先例）
    expect(lowSdf).toContain('pow(clamp(slxP.y, 0.001, 0.999), 0.68)'); // 包络与 High 逐字同源
    expect(lowSdf).toContain('1.85 + 0.75 * fract(slxRand * 5.713 + 0.37)'); // 先端变指数与 High 逐字同源（档间叶形身份一致）
    for (const gone of ['slxVeinMid', 'slxClump', 'slxTransVar', 'vec3(0.62, 0.93, 0.33)']) {
      expect(low.fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(count(low.fragmentShader, '#include <opaque_fragment>')).toBe(1); // 透光不注入但锚点原句不动
    expect(low.fragmentShader).toContain('(0.80 + 0.20 * slxShade)'); // shade 保留
    expect(low.fragmentShader).toContain('vec3 slxHue'); // hue·luma 保留
    expect(low.fragmentShader).toContain('vec3(1.06, 1.10, 1.08)'); // 叶背保留
    expect(count(low.fragmentShader, 'facVnoise(')).toBe(3); // 片元零噪声采样（库内 3 为死码，运行时零执行）
  });

  it('皮 Mid：去残桩点（近景细节层）；脊沟波状/双色对比/沟内近黑 AO/干基暗化/小枝单档保留（中距「暗灰黑波状深沟 + 冠缘淡褐黄细枝」身份 Spec §7）', () => {
    const { fragmentShader } = assemble(track(createSalixBarkMaterial('mid')), THREE.ShaderLib.physical);
    for (const gone of ['slxStump', 'slxSR', 'vec2(vUv.x * 22.0, vUv.y * 26.0)', 'vec3(0.62, 0.58, 0.55)', 'slxStump * 0.05']) {
      expect(fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('abs(fract(vUv.x * 7.0 + slxWarp * 1.30)'); // 脊沟波状保留（中距身份）
    expect(fragmentShader).toContain('vec3(1.14, 1.05, 0.86)'); // 脊浅褐保留（双色对比中距读向）
    expect(fragmentShader).toContain('vec3(0.58, 0.57, 0.56)'); // 沟内近黑 AO 保留
    expect(fragmentShader).toContain('slxBarkBase'); // 干基暗化保留
    expect(fragmentShader).toContain('vec3(1.24, 1.10, 0.86)'); // 小枝淡褐黄档保留（冠缘淡褐黄细枝中距读向）
    expect(fragmentShader).toContain('roughnessFactor = 0.93;'); // Mid 糙度常量版（残桩糙度项随段去）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 游走场 1（残桩随段去——纯 ALU 无采样损失）
  });

  it('皮 Low：再去干基暗化（低调项）；脊沟 + 沟内 AO + 脊浅褐 + 小枝档保留（远距「暗色深沟强对比剪影」保留面）；1× vnoise', () => {
    const { fragmentShader } = assemble(track(createSalixBarkMaterial('low')), THREE.ShaderLib.physical);
    for (const gone of ['slxBarkBase', 'slxStump', 'slxSR', 'vec3(0.90, 0.90, 0.91)']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('slxRidge'); // 脊沟保留（远距剪影保留面）
    expect(fragmentShader).toContain('vec3(1.14, 1.05, 0.86)'); // 脊浅褐保留（强对比剪影两带）
    expect(fragmentShader).toContain('vec3(0.58, 0.57, 0.56)'); // 沟内近黑 AO 保留
    expect(fragmentShader).toContain('vec3(1.24, 1.10, 0.86)'); // 小枝淡褐黄档（结构剪影项三档保留）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 游走场 1
  });

  it('深度分档：Mid = High SDF 同源全形（含细齿）/ Low = 零齿版（表面/影档内一致）；三档零噪声库', () => {
    const high = assemble(track(createSalixLeafDepthMaterial()), THREE.ShaderLib.depth);
    const mid = assemble(track(createSalixLeafDepthMaterial('mid')), THREE.ShaderLib.depth);
    const low = assemble(track(createSalixLeafDepthMaterial('low')), THREE.ShaderLib.depth);
    const highSdf = sdfOf(high.fragmentShader);
    expect(sdfOf(mid.fragmentShader)).toBe(highSdf); // Mid 深度 = High SDF
    expect(sdfOf(low.fragmentShader)).not.toBe(highSdf); // Low 深度 = 零齿版（非坍缩）
    expect(sdfOf(low.fragmentShader)).not.toContain('cos('); // Low SDF 零 cos（去齿——保护性约束同 High 齿为 ALU）
    // 表面/影档内一致：叶表面各档 SDF === 深度各档 SDF
    for (const level of ['high', 'mid', 'low'] as const) {
      const surface = assemble(track(createSalixLeafMaterial(level)), THREE.ShaderLib.physical);
      const depthShader = assemble(track(createSalixLeafDepthMaterial(level)), THREE.ShaderLib.depth);
      expect(sdfOf(surface.fragmentShader)).toBe(sdfOf(depthShader.fragmentShader)); // 同一 GLSL 字符串（单一来源纪律）
      expect(count(depthShader.fragmentShader, 'facVnoise(')).toBe(0); // 三档深度零噪声库
    }
  });

  it('风动三档同源：叶/皮三档顶点 GLSL 全文一致（SALIX_WIND 同一常量——档间相位一致 = 身份一致）', () => {
    const leafHigh = assemble(track(createSalixLeafMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createSalixBarkMaterial()), THREE.ShaderLib.physical);
    for (const level of ['mid', 'low'] as const) {
      const leaf = assemble(track(createSalixLeafMaterial(level)), THREE.ShaderLib.physical);
      const bark = assemble(track(createSalixBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(leaf.vertexShader).toBe(leafHigh.vertexShader);
      expect(bark.vertexShader).toBe(barkHigh.vertexShader);
    }
  });

  it('分档底参契约不因档破：叶三档 alphaTest/alphaToCoverage/DoubleSide/USE_UV/零贴图；皮三档 FrontSide/无 alphaTest/USE_UV；深度 alphaTest', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const leaf = track(createSalixLeafMaterial(level));
      const bark = track(createSalixBarkMaterial(level));
      const depth = track(createSalixLeafDepthMaterial(level));
      expect(leaf.alphaTest).toBe(0.5);
      expect(leaf.alphaToCoverage).toBe(true);
      expect(leaf.side).toBe(THREE.DoubleSide);
      expect(leaf.defines?.USE_UV).toBe('');
      expect(leaf.map).toBeNull(); // 零贴图（D13）三档同守
      expect(bark.side).toBe(THREE.FrontSide); // 皮管闭合实体契约三档同守
      expect(bark.alphaTest).toBe(0);
      expect(bark.defines?.USE_UV).toBe('');
      expect(depth.alphaTest).toBe(0.5);
      expect(depth.defines?.USE_UV).toBe('');
    }
  });

  it('uTime 桥接三档不缺位：材质级 uniforms.uTime 与编译后 shader.uniforms 同引用（Mid/Low）', () => {
    for (const make of [createSalixLeafMaterial, createSalixBarkMaterial]) {
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
    const leafA = track(createSalixLeafMaterial());
    const leafB = track(createSalixLeafMaterial());
    const barkA = track(createSalixBarkMaterial());
    const barkB = track(createSalixBarkMaterial());
    const depth = track(createSalixLeafDepthMaterial());
    expect(leafA).not.toBe(leafB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(leafA.customProgramCacheKey()).toBe(leafB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([leafA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
    expect(materialUniformsOf(leafA).uTime).not.toBe(materialUniformsOf(leafB).uTime); // uTime 桥接对象实例独立（dispose 安全）
    expect(materialUniformsOf(barkA).uTime).not.toBe(materialUniformsOf(barkB).uTime);
  });

  it('底参与侧向：叶 DoubleSide/半光泽 0.60/USE_UV；皮 FrontSide/高糙 0.93/USE_UV；均零贴图', () => {
    const leaf = track(createSalixLeafMaterial());
    const bark = track(createSalixBarkMaterial());
    expect(leaf.side).toBe(THREE.DoubleSide);
    expect(leaf.metalness).toBe(0);
    expect(leaf.roughness).toBeGreaterThan(0.58); // 薄细叶半光泽中上档
    expect(leaf.roughness).toBeLessThan(0.62);
    expect(leaf.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.FrontSide);
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeGreaterThan(0.9); // 深沟深裂族高糙哑光
    expect(bark.map).toBeNull();
    expect(leaf.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
  });
});

describe('成本记账（10 万实例每像素预算：叶 High ≈7.5×（齿载波账与 zelkova 8× 同档）/ 皮 High ≈4.5×（1× vnoise 游走场——无果域单域最重路径），hash21=1×/vnoise=3×）', () => {
  it('facVnoise 调用数：叶 High 1 处（3×）、Mid/Low 0 处；皮三档 1 处（游走场）；深度 0 处（零噪声库注入）；顶点零噪声', () => {
    const leaf = assemble(track(createSalixLeafMaterial()), THREE.ShaderLib.physical);
    const leafMid = assemble(track(createSalixLeafMaterial('mid')), THREE.ShaderLib.physical);
    const bark = assemble(track(createSalixBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createSalixLeafDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(leaf.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（叶团）
    expect(count(leafMid.fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0（Mid 片元零噪声）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（游走场）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(0); // 深度零噪声库注入（齿载波 cos ALU 化）
    expect(count(leaf.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零循环/零纹理采样（配方确定性纯函数 + SDF 纯 ALU）；全源零三角函数反函数调用（零 mat2）', () => {
    const shaders = [
      assemble(track(createSalixLeafMaterial()), THREE.ShaderLib.physical),
      assemble(track(createSalixBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createSalixLeafDepthMaterial()), THREE.ShaderLib.depth),
    ];
    for (const shader of shaders) {
      for (const source of [shader.vertexShader, shader.fragmentShader]) {
        expect(source).not.toContain('for (');
        expect(source).not.toContain('while');
        expect(source).not.toContain('texture'); // 零贴图零采样（D13）
        expect(source).not.toContain('atan('); // 零反三角调用（成本纪律）
        expect(source).not.toContain('mat2'); // 零矩阵函数纪律
      }
    }
  });
});

describe('注入点缺失即抛（首次渲染前暴雷）', () => {
  it('片元 map_fragment 摘除 → 叶/皮/深度均抛「注入点缺失」', () => {
    for (const make of [createSalixLeafMaterial, createSalixBarkMaterial, createSalixLeafDepthMaterial]) {
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
    const leaf = track(createSalixLeafMaterial());
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

    const depth = track(createSalixLeafDepthMaterial());
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
    const bark = track(createSalixBarkMaterial());
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

    const leaf = track(createSalixLeafMaterial());
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

    const leaf = assemble(track(createSalixLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createSalixBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createSalixLeafDepthMaterial()), THREE.ShaderLib.depth);
    for (const shader of [leaf, bark]) {
      expect(braceDelta(expandIncludes(shader.fragmentShader))).toBe(pristinePhysicalFragment);
      expect(braceDelta(shader.vertexShader)).toBe(pristinePhysicalVertex);
    }
    expect(braceDelta(expandIncludes(depth.fragmentShader))).toBe(pristineDepthFragment);
    expect(braceDelta(depth.vertexShader)).toBe(pristineDepthVertex);
  });
});

describe('跨 include 作用域防回归 + vec/float 维度守卫（triadica Step 4 实证事故 + 011.8 vec/float 维度事故配套——皮 roughness 注入消费 map 注入段声明的真实编译错误形态与裸标量注入 vec3 声明的维度不匹配形态，两种复发都红）', () => {
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

  /** guard 本体：注入段内出现的每个 slx* 标识符必须为 main 顶层（深度 1）唯一声明，
   *  且声明先于段尾（消费点）——块内声明（作用域在块结束关闭）与块内遮蔽声明（float 重声明）
   *  两种复发形态都红 */
  const crossIncludeScopeGuard = (fragmentShader: string, segment: { start: number; text: string }, label: string): void => {
    const ids = new Set(segment.text.match(/\bslx[A-Z][A-Za-z0-9_]*/g) ?? []);
    for (const id of ids) {
      const decl = `float ${id}`;
      expect(count(fragmentShader, decl), `${label}:${id} 声明唯一（块内 float 重声明 = 遮蔽——triadica 次生 bug 形态）`).toBe(1);
      const declIdx = fragmentShader.indexOf(decl);
      expect(declIdx, `${label}:${id} 声明存在`).toBeGreaterThan(0);
      expect(declIdx, `${label}:${id} 声明先于消费段尾`).toBeLessThan(segment.start + segment.text.length);
      expect(braceDepthFromMain(fragmentShader, declIdx), `${label}:${id} 声明在 main 顶层（跨 include 可见——块内声明即编译错误形态）`).toBe(1);
    }
  };

  it('皮三档：roughnessmap 注入段消费的 slx* 标识符均在 main 顶层唯一声明（垂柳无果域平铺——High 消费 slxWarp/slxStump，Mid/Low 常量版段零 slx* id 自然跳过）', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const { fragmentShader } = assemble(track(createSalixBarkMaterial(level)), THREE.ShaderLib.physical);
      const segment = injectedSegmentAfter(fragmentShader, '#include <roughnessmap_fragment>');
      crossIncludeScopeGuard(fragmentShader, segment, `bark:${level}`);
    }
  });

  it('叶三档：roughnessmap 注入段消费的 slx* 标识符同守（leafBody 平铺无块包裹——High 消费 slxClump，Mid/Low 段零 slx* id 自然跳过）', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const { fragmentShader } = assemble(track(createSalixLeafMaterial(level)), THREE.ShaderLib.physical);
      const segment = injectedSegmentAfter(fragmentShader, '#include <roughnessmap_fragment>');
      crossIncludeScopeGuard(fragmentShader, segment, `leaf:${level}`);
    }
  });

  it('叶透光段（opaque_fragment 前注入）消费的 slx* 标识符（slxAlpha/slxBack/slxTransVar）同守——High/Mid', () => {
    for (const level of ['high', 'mid'] as const) { // Low 无透光注入（设计内）
      const { fragmentShader } = assemble(track(createSalixLeafMaterial(level)), THREE.ShaderLib.physical);
      const anchorIdx = fragmentShader.indexOf('#if NUM_DIR_LIGHTS > 0');
      expect(anchorIdx).toBeGreaterThanOrEqual(0);
      const endIdx = fragmentShader.indexOf('#include <opaque_fragment>', anchorIdx);
      expect(endIdx).toBeGreaterThan(anchorIdx);
      crossIncludeScopeGuard(fragmentShader, { start: anchorIdx, text: fragmentShader.slice(anchorIdx, endIdx) }, `leaf-trans:${level}`);
    }
  });

  it('跨 include 类型守卫（011.8 slxBarkMul 同型事故——slxRidge float 顶层声明 × vec3 注入段消费）：皮三档 slxBarkMul 赋值右侧显式 vec3(slxRidge) 广播，禁裸 float 标量直乘进 vec3 声明（修复形态 toContain + 裸标量注入消费 not.toMatch）', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const { fragmentShader } = assemble(track(createSalixBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(fragmentShader, `bark:${level} 修复形态在场（float 顶层声明 → vec3 显式广播）`).toContain('vec3 slxBarkMul = vec3(slxRidge) * (0.92 + 0.12 * slxWarp)');
      expect(fragmentShader, `bark:${level} 禁裸 slxRidge 标量直乘（= float 表达式赋 vec3 = 维度不匹配编译错误）`).not.toMatch(/vec3\s+slxBarkMul\s*=\s*slxRidge\s*\*/);
      // 叶侧同型守卫：slxMul 为 vec3（slxHue vec3 × float 链——无裸标量赋值形态）
      const leaf = assemble(track(createSalixLeafMaterial(level)), THREE.ShaderLib.physical);
      expect(leaf.fragmentShader, `leaf:${level} 修复形态在场（vec3 × float 合法链）`).toContain('vec3 slxMul = slxHue * slxLuma * (0.80');
      expect(leaf.fragmentShader, `leaf:${level} 禁裸 float 标量直赋 vec3 slxMul`).not.toMatch(/vec3\s+slxMul\s*=\s*(?!slxHue)\w+\s*;/);
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
    const material = track(createSalixLeafMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});
