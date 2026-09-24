/**
 * tests/runtime/procedural/tree/ligustrumMaterials.test.ts —— 女贞叶/皮（含
 * 肾形核果域）/深度材质测试（T011.11，对称 fraxinusMaterials 组织：真实
 * THREE.ShaderLib 源组装，静态字符串断言 + SDF 数值锚 JS 镜像，零 WebGL；
 * build()/资产入口归并行几何 agent 的资产测试，此处不覆盖——先例无依赖几何的
 * 测试形态，全部形态可移植）。
 *
 * 覆盖（Spec docs/research/ligustrum-reference.md 1.0，生产口径 = 任务书
 * 「待裁决位」十项 + 主代理终审记档修正〔form-cn 整树主张否证 → form-d 单
 * 整树样木主锚〕）：
 * - uTime 接线（TimeUniformService 消费协议）：叶/皮材质挂材质级 uniforms.uTime（own
 *   property）；onBeforeCompile 后 shader.uniforms.uTime 与材质级同对象引用；GLSL 声明
 *   uniform float uTime；材质挂场景被服务逐帧驱动（frame 写值闭环）；
 * - 风动契约（D19.7）：aSeed/aBend/aLeafRand 顶点 attribute 声明存在；相位 = fract(sin(...))
 *   类 hash（aSeed=0 缺省属性路径退化为常数相位，全源零除 aSeed——无 NaN）；整树缓摆项
 *   叶/皮同公式（同串出现）；叶片快颤层含 aBend 权重 + **11mm 家族档** + 12–19 rad/s
 *   （大单叶 6–17cm 摆锤略慢于樟 14–23）；hash 常数 96.441/73.521 与十一先例相位流
 *   （sway 77.669–93.847 / flutter 49.337–70.913）去相关——新值在两域外；
 *   **树高锚 8.4064**（命名常量 LIGUSTRUM_TREE_HEIGHT_NOMINAL 导出 + ×0.11896
 *   GLSL 字面量 + 测试锚断言——待裁决位 10 slot-0；Stage 实测涌现同步轮
 *   2026-09-22〔3c 探针〕）；
 * - instanceColor 乘算链安全：注入后 <color_fragment> 原句恰一次、注入代码零 vColor 介入；
 * - 全缘卵形 SDF 与透光：叶 alphaTest 0.5 + alphaToCoverage + 坡宽 0.04（樟单叶口径）；
 *   组 0 材质工程契约（材质侧定义）：FrontSide 闭合实体（果簇卡双面归几何侧——缺口
 *   候选③）+ 无 alphaTest；深度材质（叶影裁切）含同一 SDF 函数（单一来源——全文相等）
 *   + RGBADepthPacking + 组 0 实心守卫（aLeafRand=0）+ USE_UV + alphaTest；透光项存在
 *   且 NUM_DIR_LIGHTS 守卫；
 * - 物种配方锚定（**樟路径全缘改写**——待裁决位 6/3/7/8）：
 *   SDF = 卵形包络 v^0.84（峰 v≈0.44 偏基——**JS 锚峰位 ∈ [0.42, 0.46] 且低于樟
 *   镜像 0.46**）+ 基部圆形-宽楔 **0.72**（**JS 锚 v=0.10 行半宽 > 樟镜像——基段更圆**）
 *   + 先端**变指数 1.18+0.42·rand ∈ [1.18, 1.60] 逐叶**（域宽于樟固定 1.10——**JS 锚
 *   v=0.90 行半宽域全段锐于樟 0.125**）+ **全缘零载波零噪声零 cos**（SDF 字符串零
 *   facVnoise 零 cos——樟组合先例；JS 锚行宽单调无载波波纹 + 中段饱满无腰 + 两端收尖）
 *   + rand 进 SDF（樟不用——先端域变体轴记档）+ **无裸柄段**（全叶面包络自 v=0 起——
 *   无 bare 门控记档）；
 *   **脉序近零信号**（vs 樟三层 1.00/0.78/0.16 粗显）：中脉弱带 0.12 + 侧脉近零纹
 *   0.04（「侧脉 4-9 对两面稍凸起或有时不明显」Verified）+ **无腺窝无离基三出**
 *   （樟身份件不复制——domatia/tri 标识不串种）；
 *   **革质光泽（待裁决位 3——011.2 缺口 B 口径下限内）**：front roughness **0.44 ∈
 *   [0.42, 0.50]**（「high-gloss polished」多照片读向——较樟 0.50 强一档）+
 *   metalness 0 + 无 envMap；**两面「单面镜」**：背面 ×(1.08, 1.11, 1.04)（G 主导
 *   淡绿、B 最小抬升 = **不提亮偏冷**——vs 樟 ×(1.06,1.05,1.16) B 主导粉感分化）+
 *   两面糙度差 **+0.18**（家族最大档——樟 +0.16；单面镜上面 0.44 亮镜 vs 背面 0.62
 *   哑光）；背光透射 **0.21**（家族链：女贞 0.21 < 樟 0.22 < 悬 0.28 < 朴 0.30 <
 *   …——革质纯粹〔樟「近革质至革质」混合相〕+ 更强镜面 → 透光略弱于樟一档；
 *   简报「樟 0.30 附近」记档修正：樟先例实际峰值 0.22，0.30 为朴树值）+ 深绿透射色；
 *   叶色深绿 #31592c（略深于樟 #33612e——十树亮度链樟位再压暗）；叶团频率 0.80
 *   （团块 1/6–1/4 冠宽——**大于樟 1/8–1/10**：波长 ≈1.25m > 樟 0.87m）；冠基
 *   2.4m nominal 锚；
 *   皮（**第 12 语言「灰褐基调 + 细窄纵脊浅沟低浮雕 + 大体平行少量横连 + 干面细纹
 *   浅色 + 幼干-大枝更平滑」——待裁决位 7**）：底色 #7b776f（R−G=4 中性灰褐；
 *   十一树链：国槐 < 白蜡 < **女贞** < 栾——浅白蜡一档）+ **10 细窄脊/周**（细于
 *   白蜡 8 一档）+ 沟深剖面 **0.74 低浮雕**（vs 白蜡 0.68 / 樟 0.50——浅一档）+
 *   上部弱化门控 smoothstep(2.8,5.0) → **0.96+0.04 更平滑**（幅度大于白蜡）+
 *   **少量横连 0.12 弱档**（vs 樟 0.22 块状横断——游走高带单场门控省采样）+
 *   **细纹浅色亮线 26/u**（fine maple-like——纯 ALU）+ 沟内弱 AO + 干基暗化弱档
 *   （×0.92 权重 0.4）+ **小枝两档**（待裁决位 8：当年生黄褐-红铜 ×(1.20, 1.00,
 *   0.74)——R 主导红铜重于白蜡黄褐 ×(1.16,1.04,0.76) 一档 / 老枝灰褐 ×(1.02,
 *   1.00, 0.95)）+ **小枝皮孔归两档表达**（26×30 格 30% 有孔稀疏 + 微长圆 +
 *   ×(1.14,1.13,1.08) 浅微亮——「疏生圆形或长圆形皮孔」FRPS + NC Conspicuous）+
 *   无剥落（悬/榉/乌桕标记不串种）+ 苔藓不做；
 *   果域（标记轴 ∈ [4,5]，**双轴容错判据 max(u,v) ≥ 3.5**——brief「u∈[4,5]」与
 *   先例「v∈[4,5]」不一致的容错实现；自由轴 = 非标记轴逐果/逐簇编码）：**蓝黑-紫黑
 *   底双端色**（(0.13,0.12,0.19) 深蓝黑 ↔ (0.17,0.11,0.15) 成熟红黑——FRPS 双端
 *   原句）+ **白粉霜覆粉 mix(底, (0.52,0.55,0.60), 0.40+0.25·rand)**（照片三源
 *   「白粉霜感显著」——JS 锚强度域 [0.40, 0.65] + 冷粉 B ≥ R 主导 + 结果暗于粉霜
 *   端）+ 逐簇色档微变 warp + 果端微暗线 ×(0.88,0.86,0.90)·0.55（uv 轴向契约为
 *   材质侧假设——缺口候选③）+ 果面**白粉霜哑光 0.64/0.66/0.68**（粉霜哑非肉质
 *   光润：vs 国槐肉质 0.45 / 白蜡干翅 0.52 显著哑一档）+ **无果透亮**（紫黑熟果
 *   不透明——vs 白蜡嫩绿翅果 High 微透亮不做，记档）；
 * - 深度材质零噪声库注入（全缘 SDF 零 facVnoise + 零 cos → 影 pass 不吃噪声纪律
 *   ——樟全缘先例）；
 * - 分档实装（level 参数，缺省 'high'）：三工厂缺省 ≡ 显式 'high'（属性 + 键 +
 *   GLSL 全文逐位相等）；3 工厂 × 3 档 = 9 键互异（跨资产键零碰撞归 assetTaxonomy
 *   全注册资产收容断言）；叶 Mid 去脉
 *   弱层/叶团/糙度叶团项（SDF 全形保留）、Low 再去透光（SDF 三档同一字符串——档位
 *   坍缩沿樟记档）；皮 Mid 去细纹亮线/皮孔点、Low 再去横连/干基暗化/老枝灰褐档；
 *   深度三档同一 SDF（表面/影档内一致）；风动三档顶点 GLSL 同源；分档底参契约
 *   （alphaTest/侧向/USE_UV）不因档破；uTime 桥接三档不缺位；
 * - program 键纪律：叶/皮/深度三键互异；两次工厂调用材质对象不同（无模块级共享，
 *   D17）但键相同；uniforms 不跨实例共享；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：叶片元 facVnoise 调用
 *   1 处（叶团）、Mid/Low 0 处；皮三档 1 处（游走场）；深度 0 处（零噪声库注入）；
 *   顶点零噪声；全源零循环/零纹理采样/零三角函数反函数调用（零 mat2）；
 * - 注入点缺失即抛（map_fragment/begin_vertex/common/roughnessmap_fragment/
 *   opaque_fragment 摘除各暴雷）；
 * - 跨 include 作用域防回归 guard（triadica Step 4 实证事故配套）+ vec/float
 *   维度守卫（011.8 修复守卫模式：vec3(lguRidge) 显式广播修复形态 toContain +
 *   裸 float 标量注入 vec3 声明的 not.toMatch）；
 * - 结构完整性：include 全展开后花括号配平差值与原版一致（注入不破坏 GLSL 结构）；
 * - TimeUniformService.freeze：冻结期间广播仍写当前值（uTime 常量——树静止）+ 材质兼容。
 * 边界：材质登记 afterEach 统一 dispose 兜底，不跨测试泄漏；**重数值锚测试显式
 *   timeout: 30000**（011.10 全量并行饿超教训——断言零改动机械加固先例）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms } from 'three';
import { TimeUniformService } from '../../../../src/runtime/services/TimeUniformService';
import {
  LIGUSTRUM_TREE_HEIGHT_NOMINAL,
  createLigustrumBarkMaterial,
  createLigustrumLeafDepthMaterial,
  createLigustrumLeafMaterial,
} from '../../../../src/runtime/procedural/tree/ligustrum/ligustrumMaterials';
import { assemble, braceDelta, count, createMaterialTracker, expandIncludes, materialUniformsOf, propsOf, sdfOf as extractSdf } from '../../../support/procedural-tree/materialHarness';

const { track, disposeAll } = createMaterialTracker();

/** 提取注入后的 lguLeafAlpha 函数全文（SDF 单一来源比对用；首个 \n} 即函数闭合） */
const sdfOf = (fragmentShader: string): string =>
  extractSdf(fragmentShader, 'float lguLeafAlpha(vec2 lguUv, float lguRand)');

// ── SDF JS 数值锚镜像（樟路径全缘改写——与 GLSL 逐式对应 + 樟对照镜像）────────────

const fract = (x: number): number => x - Math.floor(x);
const clamp = (x: number, a: number, b: number): number => Math.min(Math.max(x, a), b);
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
const smoothstepJS = (a: number, b: number, x: number): number => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** 女贞包络半宽 JS 镜像（卵形 v^0.84 + 基 0.72 + 先端变指数 1.18–1.60 逐叶） */
const lguHalfWidth = (v: number, R: number): number => {
  const apex = 1.18 + 0.42 * fract(R * 5.317 + 0.29);
  const envSin = Math.sin(Math.PI * Math.pow(clamp(v, 0.001, 0.999), 0.84));
  return 0.5 * Math.pow(envSin, mix(0.72, apex, smoothstepJS(0.45, 0.95, v)));
};

/** 樟包络半宽 JS 对照镜像（camphorMaterials CAMPHOR_LEAF_SDF 逐式——v^0.90 / 0.80→1.10 固定） */
const cmpHalfWidth = (v: number): number => {
  const envSin = Math.sin(Math.PI * Math.pow(clamp(v, 0.001, 0.999), 0.90));
  return 0.5 * Math.pow(envSin, mix(0.80, 1.10, smoothstepJS(0.45, 0.95, v)));
};

/** 女贞叶覆盖率 JS 镜像（与 lguLeafAlpha 逐式对应） */
const alphaJS = (u: number, v: number, R: number): number => {
  const edge = lguHalfWidth(v, R) - Math.abs(u - 0.5);
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
    for (const material of [track(createLigustrumLeafMaterial()), track(createLigustrumBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('材质挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const leaf = track(createLigustrumLeafMaterial());
    const bark = track(createLigustrumBarkMaterial());
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

describe('风动契约（D19.7：uTime 全局风帧 / aSeed 个体相位；11mm 家族档 + 12–19 rad/s 大单叶摆锤略慢于樟；树高锚 8.4064 = ×0.11896〔slot-0 Stage 实测涌现同步轮 2026-09-22——命名常量 + 测试锚断言〕）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）；hash 常数与十一先例去相关（域外）', () => {
    const leaf = assemble(track(createLigustrumLeafMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(leaf.vertexShader).toContain(decl);
    }
    expect(leaf.vertexShader).toContain('fract(sin(aSeed * 96.441'); // 整树缓摆相位 = hash(aSeed)——十一先例 sway 域 [77.669, 93.847] 外
    expect(leaf.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 73.521'); // 快颤相位——先例 flutter 域 [49.337, 70.913] 外
    // 域外自查（数值面）：十一先例相位常数全集（源文件逐位核对）vs 女贞性能新值
    const precedentSway = [77.669, 78.233, 79.193, 81.273, 82.537, 84.913, 86.531, 88.217, 91.523, 93.847];
    const precedentFlutter = [49.337, 51.171, 53.419, 57.431, 58.219, 61.157, 63.917, 65.443, 68.137, 70.913];
    expect(96.441).toBeGreaterThan(Math.max(...precedentSway)); // sway 域外（上侧）
    expect(73.521).toBeGreaterThan(Math.max(...precedentFlutter)); // flutter 域外（上侧）
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(leaf.vertexShader + leaf.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('整树缓摆叶/皮同公式（同串出现）；快颤含 aBend 权重且幅度 11mm 家族档、频率 12–19 rad/s；树高锚 0.11896 = 1/8.4064 实测同步常量（命名常量断言）', () => {
    const leaf = assemble(track(createLigustrumLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createLigustrumBarkMaterial()), THREE.ShaderLib.physical);
    const swayCore = 'lguWindH * lguWindH * 0.044 * sin(uTime * 1.15';
    expect(leaf.vertexShader).toContain(swayCore);
    expect(bark.vertexShader).toContain(swayCore); // 皮不动叶动会撕裂穿帮——同公式同相位（组 0 aBend 恒 0 免颤）
    expect(leaf.vertexShader).toContain('aBend * 0.011'); // 叶片快颤幅度 11mm 家族档
    expect(leaf.vertexShader).toContain('uTime * (12.0 + 7.0 * lguFlutterPhase)'); // 12–19 rad/s（≈1.9–3.0Hz——大单叶 6–17cm 摆锤略慢于樟 14–23）
    expect(leaf.vertexShader).toContain('position.y * 0.11896'); // 树高锚 ×0.11896（1/8.4064——见常量断言；slot-0 Stage 实测同步轮 2026-09-22〔3c 探针〕）
    expect(LIGUSTRUM_TREE_HEIGHT_NOMINAL).toBe(8.4064); // 实测同步树高锚常量（slot-0 Stage 探针 2026-09-22——同步轮单一改动点）
    expect(1 / LIGUSTRUM_TREE_HEIGHT_NOMINAL).toBeCloseTo(0.11896, 5); // GLSL 字面量 = 1/实测树高（5 位小数 = fraxinus 0.09526 同步轮精度口径）
    expect(0.011).toBeLessThanOrEqual(0.012); // ≤ 家族域上沿 12mm
    expect(0.011).toBeGreaterThanOrEqual(0.010); // ≥ 家族域下沿 10mm（中幅）
    expect(12.0).toBeLessThan(14.0); // 频域下沿 < 樟下沿（大单叶略慢）
    expect(19.0).toBeLessThan(23.0); // 频域上沿 < 樟上沿
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createLigustrumLeafMaterial()), track(createLigustrumBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('全缘卵形 SDF 与透光', () => {
  it('叶 alphaTest 0.5 + alphaToCoverage + 坡宽 0.04（樟单叶口径）；片元含 SDF 计算式并写入 alpha', () => {
    const material = track(createLigustrumLeafMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float lguLeafAlpha('); // 全缘 SDF 主函数（单一来源）
    expect(fragmentShader).toContain('lguLeafAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = lguAlpha;'); // alphatest_fragment 上游写入
    expect(fragmentShader).toContain('clamp(lguEdge / 0.04 + 0.5'); // 坡宽 0.04（沿樟 AA 口径）
  });

  it('组 0 材质工程契约（材质侧定义）：FrontSide 闭合实体（皮管；果簇卡双面归几何侧——缺口候选③）+ 无 alphaTest + USE_UV', () => {
    const bark = track(createLigustrumBarkMaterial());
    expect(bark.side).toBe(THREE.FrontSide); // 皮管闭合实体（果簇卡双面渲染归几何侧）
    expect(bark.alphaTest).toBe(0); // 无裁切
    expect(bark.alphaToCoverage).toBe(false);
    expect(bark.defines?.USE_UV).toBe('');
  });

  it('深度材质（叶影裁切）：同一 SDF 函数 + RGBADepthPacking + 组 0 实心守卫 + USE_UV + alphaTest；风动不进 depth；零噪声库注入', () => {
    const material = track(createLigustrumLeafDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.depthPacking).toBe(THREE.RGBADepthPacking);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('lguLeafAlpha(vUv, vLeafRand)');
    expect(shader.fragmentShader).toContain('step(0.0001, vLeafRand)'); // 组 0 aLeafRand=0 → 实心（皮圆柱/果簇卡 uv 域不误裁——triadica 恒等 attribute 先例；果域无需域路由）
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
    expect(count(shader.fragmentShader, 'facVnoise(')).toBe(0); // 零噪声库注入——全缘 SDF ALU 化（影 pass 不吃噪声）
    expect(shader.fragmentShader).not.toContain('facHash21'); // 噪声库整体未挂（SDF 引入噪声即编译暴雷——保护性约束）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫（无平行光场景安全降级）', () => {
    const { fragmentShader } = assemble(track(createLigustrumLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(fragmentShader).toContain('directionalLights[0]');
    expect(fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
  });
});

describe('物种配方锚定（Spec ligustrum-reference 1.0；生产口径 = 任务书待裁决位十项：全缘卵形 SDF 樟路径改写 / 革质单面镜 / 树皮第 12 语言 / 核果做 / 花不做）', () => {
  it('SDF 核心（樟路径改写——待裁决位 6）：v^0.84 卵形包络 + 基 0.72 圆形-宽楔 + 先端变指数 1.18–1.60 逐叶（域宽于樟固定 1.10）+ 全缘零载波（零 cos）+ rand 进 SDF + 无 bare 门控（全叶面自 v=0）', () => {
    const leaf = assemble(track(createLigustrumLeafMaterial()), THREE.ShaderLib.physical);
    const sdf = sdfOf(leaf.fragmentShader);
    expect(sdf).toContain('pow(clamp(lguP.y, 0.001, 0.999), 0.84)'); // 卵形包络 v^0.84（峰 v≈0.44 偏基——vs 樟 v^0.90→0.46）
    expect(sdf).toContain('mix(0.72,'); // 基部圆形-宽楔 0.72（圆于樟 0.80 宽楔）
    expect(sdf).toContain('1.18 + 0.42 * fract(lguRand * 5.317 + 0.29)'); // 先端变指数逐叶 [1.18, 1.60]（「先端锐尖至渐尖」Verified——域宽于樟固定 1.10；rand 进 SDF 记档）
    expect(sdf).not.toContain('cos('); // 全缘零载波零 cos（「叶缘平坦」FRPS Verified——SDF 内唯一三角函数为包络 sin）
    expect(sdf).not.toContain('facVnoise'); // 零噪声引用（深度材质不挂噪声库的前提）
    expect(leaf.fragmentShader).not.toContain('bare'); // 无裸柄段 → 无 bare 门控（樟路径全叶面包络自 v=0 起——记档；乘法门控伪覆盖禁令天然无关）
    // SDF 单一来源——影裁切叶形自动同步
    const depth = assemble(track(createLigustrumLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(sdfOf(depth.fragmentShader)).toBe(sdf);
  });

  it('SDF 数值锚（JS 镜像 + 樟对照镜像）：峰位 v ∈ [0.42, 0.46] 偏基 + 基段 v=0.10 更圆（> 樟镜像）+ 先端 v=0.90 全域锐于樟 0.125 + 变体域宽 + 卡峰半宽 0.5 满卡（长宽比归几何）+ 全缘单调无载波 + 中段饱满无腰 + 两端收尖 + 中脉连续', { timeout: 30000 }, () => {
    // ① 峰位：女贞峰 v ∈ [0.42, 0.46]（卵形偏基——低于樟 0.46 近中）
    let peakV = 0;
    let peakW = 0;
    for (let i = 0; i <= 500; i++) {
      const v = 0.02 + (i / 500) * 0.96;
      const w = lguHalfWidth(v, 0.5);
      if (w > peakW) { peakW = w; peakV = v; }
    }
    expect(peakV).toBeGreaterThanOrEqual(0.42); // 卵形偏基下沿
    expect(peakV).toBeLessThanOrEqual(0.46); // 上沿（≈0.438——vs 樟 0.46 卵状椭圆近中）
    // ② 基段更圆：v=0.10 行半宽 > 樟镜像同位（「基部圆形或近圆形」vs 樟宽楔——基段指数 0.72 < 0.80 的量化面）
    expect(lguHalfWidth(0.10, 0.37)).toBeGreaterThan(cmpHalfWidth(0.10)); // 女贞 0.276 > 樟 0.233
    // ③ 先端域宽于樟且全段锐于樟：v=0.90 行半宽域 [min, max] 全 ≤ 樟固定 0.125
    let apexMin = 99;
    let apexMax = 0;
    for (let i = 0; i < 500; i++) {
      const R = (i + 0.5) / 500;
      const w = lguHalfWidth(0.90, R);
      apexMin = Math.min(apexMin, w);
      apexMax = Math.max(apexMax, w);
    }
    expect(apexMax).toBeLessThan(cmpHalfWidth(0.90)); // 全域锐于樟 0.125（锐尖端 1.18 已强于樟 1.10 急尖）
    expect(apexMin).toBeLessThan(apexMax - 0.03); // 变体域实质（min ≈0.061 渐尖 / max ≈0.105 锐尖——「域宽于樟」）
    // ④ 卡峰半宽 = 0.5 满卡（包络峰行达卡缘——真实长宽比 1.7–2.8 由几何卡承载，SDF 只管包络）
    expect(peakW).toBeGreaterThan(0.499); // 满卡（峰行 env=1 → 0.5·1）
    expect(peakW).toBeLessThanOrEqual(0.5);
    // ⑤ 全缘单调：峰行 alpha 随 |x| 单调不增（零载波波纹——vs 锯齿载波种的行内起伏）
    for (const R of [0.13, 0.51, 0.89]) {
      let prev = 1;
      for (let i = 0; i <= 100; i++) {
        const a = alphaJS(0.5 + (i / 100) * 0.42, peakV, R);
        expect(a, `R=${R} 峰行单调`).toBeLessThanOrEqual(prev + 1e-9);
        prev = a;
      }
    }
    // ⑥ 无腰（单叶全缘连续剖面 vs 复叶缢缩多峰）：行宽剖面单峰——峰前非降、峰后非增（一次峰）
    for (const R of [0.17, 0.51, 0.83]) {
      const w: number[] = [];
      for (let i = 0; i <= 120; i++) w.push(rowWidthJS(0.02 + (i / 120) * 0.96, R));
      let reversals = 0; // 方向翻转计数（+→−）：容差 0.002 内视作平台
      let dir = 0;
      for (let i = 1; i < w.length; i++) {
        const d = w[i] - w[i - 1];
        if (Math.abs(d) < 0.002) continue;
        const nd = Math.sign(d);
        if (dir !== 0 && nd !== dir) reversals++;
        dir = nd;
      }
      expect(reversals, `R=${R} 剖面单峰无腰`).toBe(1); // 卵形单叶连续剖面（复叶系缢缩剖面的反例记档）
    }
    // ⑦ 两端收尖（非方端）：v=0.02 与 v=0.98 行宽 < 0.5·maxW
    for (const R of [0.17, 0.51]) {
      const maxW = rowWidthJS(0.44, R);
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

  it('脉序近零信号（待裁决位 6——vs 樟离基三出粗显 1.00/0.78/0.16）：中脉弱带 0.12 + 侧脉近零纹 0.04 + 频率 40.8（4–9 对统计中值）+ 无腺窝无离基三出（樟身份件不复制）', () => {
    const { fragmentShader } = assemble(track(createLigustrumLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('lguVeinMid * 0.12 + lguVeinLat * 0.04'); // 近零权重（vs 樟三层——身份差分核心）
    expect(fragmentShader).toContain('1.0 - smoothstep(0.008, 0.034, abs(lguP.x))'); // 中脉弱带（窄于樟 0.012–0.040）
    expect(fragmentShader).toContain('sin(lguP.y * 40.8'); // 侧脉细弱弧曲（2π·6.5——「侧脉 4-9 对」统计中值读向）
    expect(0.12).toBeLessThan(0.78); // 中脉弱于樟离基对（0.78）
    expect(0.04).toBeLessThan(0.16); // 侧脉弱于樟二级脉
    expect(fragmentShader).not.toContain('lguDomatia'); // 樟脉腋腺窝不复制（女贞无）
    expect(fragmentShader).not.toContain('lguTri'); // 樟离基三出轨迹不复制（女贞侧脉细弱不显——SDF 域内 lguTri 为树皮段标识，叶片元不应有）
  });

  it('两面「单面镜」弱差（待裁决位 3——背面淡绿无 glaucous 不提亮偏冷）：背面 ×(1.08,1.11,1.04) G 主导 B 最小抬升 + 两面糙度差 +0.18 家族最大档；家族叶背乘子不串种', () => {
    const leaf = assemble(track(createLigustrumLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('mix(vec3(1.08, 1.11, 1.04), vec3(1.0), float(gl_FrontFacing))'); // 背面淡绿（G+0.11 主导 / B+0.04 最小——非灰白粉感）
    const back = [1.08, 1.11, 1.04];
    expect(back[2] - 1.0).toBeLessThan(back[1] - 1.0); // B 抬升 < G 抬升 = 不偏冷（vs 樟 B 主导粉感）
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.05, 1.16)'); // 樟 glaucous 粉感背面不串种（单面镜分化核心）
    expect(leaf.fragmentShader).not.toContain('vec3(1.16, 1.18, 1.28)'); // 国槐灰白加重档不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.09, 1.11, 1.17)'); // 白蜡浅绿-灰绿背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.10, 1.12, 1.04)'); // 榉无粉淡绿背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.09, 1.10, 1.13)'); // 栾柔毛灰绿背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.08, 1.02)'); // 乌桕背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.07, 1.05)'); // 重阳木弱差背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.08, 1.10, 1.02)'); // 悬铃木背面不串种
    expect(leaf.fragmentShader).toContain('(1.0 - float(gl_FrontFacing)) * 0.18'); // 两面糙度差 +0.18（家族最大档——单面镜对比）
    expect(0.18).toBeGreaterThan(0.16); // > 樟 +0.16（单面镜 = 更强亮哑对比）
    expect(0.44 + 0.18).toBeLessThan(0.7); // 背面绝对糙度 ≈0.62 落哑光域（≈樟背面 0.66 同档）
  });

  it('革质光泽（待裁决位 3——011.2 缺口 B 口径下限内）：front roughness 0.44 ∈ [0.42, 0.50]（high-gloss 多照片读向——较樟 0.50 强一档）+ metalness 0 + 无 envMap', () => {
    const leaf = track(createLigustrumLeafMaterial());
    expect(leaf.roughness).toBe(0.44);
    expect(0.44).toBeGreaterThanOrEqual(0.42); // 待裁决位域下沿
    expect(0.44).toBeLessThanOrEqual(0.50); // 域上沿
    expect(0.44).toBeLessThan(0.50); // 较樟 0.50（Step 4b 校准档）更强光泽一档
    expect(leaf.metalness).toBe(0);
    expect(leaf.envMap).toBeNull(); // 不引入 envMap（缺口维持归 011.13——下限口径）
  });

  it('背光透射家族值域内取：峰值 0.21（女贞 0.21 < 樟 0.22 < 悬 0.28 < 朴 0.30 < …——革质纯粹 + 更强镜面 → 略弱于樟；简报「樟 0.30 附近」记档修正：樟实际 0.22、0.30 为朴树值）；深绿透射色；先例峰值不串种', () => {
    const { fragmentShader } = assemble(track(createLigustrumLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('* pow(lguBack, 3.0) * lguTransVar * lguAlpha * 0.21;');
    expect(fragmentShader).toContain('vec3(0.47, 0.83, 0.35)'); // 深绿透射色
    expect(0.21).toBeLessThan(0.22); // < 樟（革质纯粹〔樟「近革质至革质」混合相〕+ 上面更强镜面）
    expect(0.21).toBeGreaterThan(0.15); // 家族域内合理下段
    // 透射语句形态不串种（透射峰值锚以 lguAlpha 前缀收窄）
    expect(fragmentShader).not.toContain('lguAlpha * 0.22;'); // 樟峰值不串种
    expect(fragmentShader).not.toContain('lguAlpha * 0.28;'); // 悬铃木峰值不串种
    expect(fragmentShader).not.toContain('lguAlpha * 0.30;'); // 朴树峰值不串种
    expect(fragmentShader).not.toContain('lguAlpha * 0.31;'); // 重阳木峰值不串种
    expect(fragmentShader).not.toContain('lguAlpha * 0.318;'); // 白蜡峰值不串种
    expect(fragmentShader).not.toContain('lguAlpha * 0.32;'); // 栾峰值不串种
    expect(fragmentShader).not.toContain('lguAlpha * 0.325;'); // 国槐峰值不串种
    expect(fragmentShader).not.toContain('lguAlpha * 0.33;'); // 乌桕峰值不串种
    expect(fragmentShader).not.toContain('lguAlpha * 0.34;'); // 银杏峰值不串种
    expect(fragmentShader).not.toContain('lguAlpha * 0.65;'); // 夏栎裂叶峰值不串种
  });

  it('叶底色 #31592c 深绿（工程设定——NC "dark green" + 照片深绿四源；略深于樟 #33612e）+ 叶团频率 0.80（团块 1/6–1/4 冠宽——大于樟 1/8–1/10）+ 冠基 2.4m nominal 锚', () => {
    const leaf = track(createLigustrumLeafMaterial());
    const hex = leaf.color.getHex();
    expect(hex).toBe(0x31592c); // 工程设定：Spec §5 深绿革质 + 十树亮度链樟位再压暗
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    expect(luma([(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff])).toBeLessThan(luma([0x33, 0x61, 0x2e])); // 深于樟（常绿深绿档再压暗一档）
    const { fragmentShader } = assemble(track(createLigustrumLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('* 0.80 + vec2(47.3, 71.9)'); // 叶团频率 0.80（波长 ≈1.25m——团块 1/6–1/4 冠宽，> 樟 0.87m/1.15 频率）
    expect(fragmentShader).toContain('(vTreePos.y - 2.4) / 2.6'); // 冠基 2.4m nominal 工程锚（干高占比 ≈0.30 × ≈8m——同步轮缺口候选⑤）
  });

  it('皮第 12 语言底色 #7b776f 灰褐-浅灰褐（FRPS「树皮灰褐色」Verified + bark-a/b + form-d 照片交叉；R−G=4 中性灰褐向；十一树链：国槐 < 白蜡 < 女贞 < 栾——浅白蜡一档）；细纹族中低糙 0.88', () => {
    const bark = track(createLigustrumBarkMaterial());
    const hex = bark.color.getHex();
    expect(hex).toBe(0x7b776f); // 工程设定：FRPS 灰褐 [1] + bark-a「灰褐」/bark-b「浅灰-灰褐」/form-d「浅灰细纹」[10] 交叉
    const [r, g, b] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
    expect(r - g).toBe(4); // 中性灰褐向（vs 樟 R−G=11 黄褐向）
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const l = luma([r, g, b]);
    expect(l).toBeGreaterThan(luma([0x7a, 0x74, 0x6b])); // 亮于白蜡（十一树链：白蜡 < 女贞）
    expect(l).toBeLessThan(luma([0x90, 0x92, 0x8a])); // 暗于栾浅色（女贞 < 栾）
    expect(bark.roughness).toBe(0.88); // 细纹浅色低浮雕族中低糙（微泽于白蜡 0.90 一档）
    expect(bark.metalness).toBe(0);
  });

  it('脊沟系统（待裁决位 7）：10 细窄脊/周（细于白蜡 8）+ 沟深 0.74 低浮雕（浅于白蜡 0.68 / 樟 0.50）+ 上部弱化 0.96+0.04 更平滑 + 少量横连 0.12 弱档（vs 樟 0.22）+ 细纹浅色亮线 26/u（fine maple-like）+ 沟内弱 AO + 干基暗化弱档 + 无剥落无苔藓', () => {
    const { fragmentShader } = assemble(track(createLigustrumBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('abs(fract(vUv.x * 10.0 + lguWarp * 0.85)'); // 10 细窄脊/周（脊细于白蜡 8——待裁决位 7）× drift 0.85 纵为主（「大体平行」）
    expect(fragmentShader).toContain('smoothstep(0.30, 0.62, lguTri)'); // 浅宽坡剖面（低浮雕）
    expect(fragmentShader).toContain('mix(0.74 + 0.26 * lguPlate, 0.96 + 0.04 * lguPlate'); // 沟深 0.74 低浮雕（vs 白蜡 0.68 / 樟 0.50）+ 上部近光滑 0.96（幅度大于白蜡 0.94）
    expect(fragmentShader).toContain('smoothstep(2.8, 5.0, vTreePos.y)'); // 幼干-大枝上部弱化门控（「幼干-大枝更平滑」）
    expect(fragmentShader).toContain('lguCut * 0.12'); // 少量横连 0.12 弱档（bark-a「少量横向连接」——vs 樟 0.22 块状横断）
    expect(fragmentShader).toContain('vUv.x * 26.0 + lguWarp * 0.55'); // 细纹浅色亮线 26/u（fine maple-like——与脊列同源平行）
    expect(fragmentShader).toContain('1.0 + 0.035 * lguFineLine'); // 细纹浅色乘子（脊面高频亮线）
    expect(fragmentShader).toContain('vec3(0.90, 0.89, 0.88)'); // 沟内弱 AO（低浮雕弱档）
    expect(fragmentShader).toContain('lguBarkBase * 0.4'); // 干基暗化弱档权重 0.4
    expect(fragmentShader).toContain('vec3(0.92, 0.92, 0.93)'); // 干基暗化乘色（弱档）
    expect(fragmentShader).not.toContain('vUv.x * 8.0'); // 白蜡 8 脊不串种（10 = 细一档）
    expect(fragmentShader).not.toContain('vUv.x * 7.0'); // 樟 7 宽脊不串种
    expect(fragmentShader).not.toContain('vUv.x * 6.0'); // 国槐板状粗脊不串种
    expect(fragmentShader).not.toContain('vec3(1.32, 1.28, 1.14)'); // 悬铃木新露奶油白带不串种（无剥落）
    expect(fragmentShader).not.toContain('vec3(1.35, 0.92, 0.64)'); // 榉锈橙新斑不串种
    expect(fragmentShader).not.toContain('Moss'); // 苔藓不做（Spec §C 阴性弱记不承重——不做不编造）
  });

  it('小枝两档 + 小枝皮孔归两档表达（待裁决位 8——FRPS「枝黄褐色、灰色或紫红色」+「疏生圆形或长圆形皮孔」+ 照片红铜新梢）：当年生黄褐-红铜 ×(1.20,1.00,0.74)（重于白蜡黄褐一档）/ 老枝灰褐 ×(1.02,1.00,0.95) + 皮孔 26×30 格 30% 稀疏 + 微长圆 + 浅微亮', () => {
    const { fragmentShader } = assemble(track(createLigustrumBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('smoothstep(4.8, 6.4, vTreePos.y)'); // 当年生枝高位门控（nominal 8m 尺度）
    expect(fragmentShader).toContain('smoothstep(3.6, 4.8, vTreePos.y)'); // 老枝档门控
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.45, 0.95, vUv.y))'); // 小弧长门（「细枝管 v 小」几何契约注记——高位 × 小 v 双门控）
    expect(fragmentShader).toContain('vec3(1.20, 1.00, 0.74)'); // 当年生枝黄褐-红铜（R+20% / G 平 / B−26% = 红铜新梢——R 主导重于白蜡黄褐 ×(1.16,1.04,0.76) 一档）
    expect(fragmentShader).toContain('vec3(1.02, 1.00, 0.95)'); // 老枝灰褐弱收敛
    expect(fragmentShader).not.toContain('vec3(1.16, 1.04, 0.76)'); // 白蜡黄褐枝不串种（红铜 vs 黄褐——细枝色对照轴）
    expect(fragmentShader).toContain('vec2(vUv.x * 26.0, vUv.y * 30.0)'); // 皮孔格密度（26×30——当年生带内）
    expect(fragmentShader).toContain('step(0.70, lguLR)'); // 30% 格有孔（稀疏门——「疏生」）
    expect(fragmentShader).toContain('length(vec2(lguLF.x * 0.85, lguLF.y * 1.15))'); // 微长圆（x 压 y 拉——「圆形或长圆形」双读向）
    expect(fragmentShader).toContain('vec3(1.14, 1.13, 1.08)'); // 皮孔浅微亮点
  });

  it('果域（标记轴 ∈ [4,5]——双轴容错判据 max(u,v) ≥ 3.5 + 自由轴 = 非标记轴）：蓝黑-紫黑底双端 + 白粉霜覆粉（JS 锚强度域 + 冷粉 B≥R + 结果暗于粉霜端）+ 逐簇色档微变 warp + 果端微暗线 + 果面白粉霜哑光 + 无果透亮', { timeout: 30000 }, () => {
    const { fragmentShader } = assemble(track(createLigustrumBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('if (max(vUv.x, vUv.y) >= 3.5) {'); // 双轴域判据（brief「u∈[4,5]」vs 先例「v∈[4,5]」容错——皮域两轴均 <3.5 不误判；缺口候选③）
    expect(fragmentShader).toContain('vUv.x >= 3.5 ? vUv.y : vUv.x'); // 自由轴 = 非标记轴（逐果/逐簇随机编码——fraxinus「u 自由」先例同构）
    expect(fragmentShader).toContain('vec3(0.13, 0.12, 0.19)'); // 档端深蓝黑（FRPS「深蓝黑色」）
    expect(fragmentShader).toContain('vec3(0.17, 0.11, 0.15)'); // 档端成熟红黑（FRPS「成熟时呈红黑色」）
    expect(fragmentShader).toContain('0.40 + 0.25 * fract(lguFree * 7.317 + 0.41)'); // 白粉霜强度逐果变奏（JS 锚域 [0.40, 0.65])
    expect(fragmentShader).toContain('vec3(0.52, 0.55, 0.60)'); // 蓝灰白粉霜色（B ≥ R 冷向粉霜）
    expect(fragmentShader).toContain('vec3(0.88, 0.86, 0.90)'); // 果端微暗线乘色（熟果下垂簇弱表达——uv 轴向契约为材质侧假设，缺口候选③）
    expect(fragmentShader).toContain('0.92 + 0.16 * fract(lguFree * 31.3)'); // 档内 ±8% 变奏
    expect(fragmentShader).toContain('roughnessFactor = 0.64;'); // 果面白粉霜哑光（粉霜哑非肉质光润——vs 国槐肉质 0.45 / 白蜡干翅 0.52）
    expect(fragmentShader).not.toContain('lguFBack'); // 无果透亮（紫黑熟果不透明——vs 白蜡嫩绿翅果 High 微透亮不做，记档）
    // JS 锚：白粉霜强度域 [0.40, 0.65] + 结果通道约束（冷粉 B ≥ R 主导 + 暗于粉霜端 + 蓝黑主导）
    let bMinusRMin = 99;
    let maxChannel = 0;
    for (let i = 0; i < 2000; i++) {
      const free = (i + 0.5) / 2000;
      const fu = clamp(free + 0.06 * Math.sin(2 * Math.PI * free), 0, 0.999);
      const base = [mix(0.13, 0.17, fu), mix(0.12, 0.11, fu), mix(0.19, 0.15, fu)];
      const bloom = 0.40 + 0.25 * fract(free * 7.317 + 0.41);
      expect(bloom, `free=${free} 白粉霜强度域`).toBeGreaterThanOrEqual(0.40);
      expect(bloom).toBeLessThanOrEqual(0.65);
      const fruit = [mix(base[0], 0.52, bloom), mix(base[1], 0.55, bloom), mix(base[2], 0.60, bloom)];
      bMinusRMin = Math.min(bMinusRMin, fruit[2] - fruit[0]);
      maxChannel = Math.max(maxChannel, ...fruit);
    }
    expect(bMinusRMin).toBeGreaterThan(-0.02); // 冷粉主导（B−R ≥ −0.02——红黑端亦被粉霜拉回近中性，蓝黑读向主导）
    expect(maxChannel).toBeLessThan(0.61); // 结果暗于粉霜端（0.60 上界——紫黑深底读向不被粉霜漂白）
  });
});

describe('分档实装（level 参数；缺省 high = 显式 high）', () => {

  it('三工厂缺省与显式 high 逐位一致（属性 + 键 + GLSL 全文）', () => {
    const pairs: Array<[THREE.Material, THREE.Material, { vertexShader: string; fragmentShader: string }]> = [
      [track(createLigustrumLeafMaterial()), track(createLigustrumLeafMaterial('high')), THREE.ShaderLib.physical],
      [track(createLigustrumBarkMaterial()), track(createLigustrumBarkMaterial('high')), THREE.ShaderLib.physical],
      [track(createLigustrumLeafDepthMaterial()), track(createLigustrumLeafDepthMaterial('high')), THREE.ShaderLib.depth],
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
    expectKey(track(createLigustrumLeafMaterial()), 'ligustrum:leaf+dither');
    expectKey(track(createLigustrumLeafMaterial('mid')), 'ligustrum:leaf:mid+dither');
    expectKey(track(createLigustrumLeafMaterial('low')), 'ligustrum:leaf:low+dither');
    expectKey(track(createLigustrumBarkMaterial()), 'ligustrum:bark+dither');
    expectKey(track(createLigustrumBarkMaterial('mid')), 'ligustrum:bark:mid+dither');
    expectKey(track(createLigustrumBarkMaterial('low')), 'ligustrum:bark:low+dither');
    expectKey(track(createLigustrumLeafDepthMaterial()), 'ligustrum:leaf-depth');
    expectKey(track(createLigustrumLeafDepthMaterial('mid')), 'ligustrum:leaf-depth:mid');
    expectKey(track(createLigustrumLeafDepthMaterial('low')), 'ligustrum:leaf-depth:low');
    expect(keys.size).toBe(9);
  });

  it('叶 Mid：SDF 与 High 同源全形（含先端变指数——档间剪影一致）+ 去脉弱层/叶团/糙度叶团项；透光/hue·luma/shade/叶背保留；片元零噪声', () => {
    const high = assemble(track(createLigustrumLeafMaterial()), THREE.ShaderLib.physical);
    const mid = assemble(track(createLigustrumLeafMaterial('mid')), THREE.ShaderLib.physical);
    expect(sdfOf(mid.fragmentShader)).toBe(sdfOf(high.fragmentShader)); // Mid SDF = High 同源全形（含 rand 先端域）
    for (const gone of ['lguVeinMid', 'lguVeinLat', 'lguClump']) {
      expect(mid.fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(mid.fragmentShader).not.toContain('(lguClump - 0.5) * 0.06'); // 糙度注入同步去叶团项
    expect(mid.fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0'); // 透光保留
    expect(mid.fragmentShader).toContain('lguTransVar');
    expect(mid.fragmentShader).toContain('vec3 lguHue'); // hue·luma 逐叶变奏保留
    expect(mid.fragmentShader).toContain('float lguLuma');
    expect(mid.fragmentShader).toContain('(0.80 + 0.20 * lguShade)'); // 冠内竖向自遮蔽保留（地板 0.80 沿先例口径）
    expect(mid.fragmentShader).toContain('float(gl_FrontFacing)) * 0.18'); // 两面糙度差保留
    expect(mid.fragmentShader).toContain('vec3(1.08, 1.11, 1.04)'); // 叶背淡绿保留（三档同体）
    expect(count(mid.fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0 调用（叶团去采样——Mid 片元零噪声执行）
  });

  it('叶 Low：SDF 与 High 同一字符串（档位坍缩沿樟记档——零噪声全缘全形下「Low = 零噪声版」平凡成立）+ 去脉弱层/叶团/透光；hue·luma/shade/叶背保留；片元零噪声', () => {
    const high = assemble(track(createLigustrumLeafMaterial()), THREE.ShaderLib.physical);
    const low = assemble(track(createLigustrumLeafMaterial('low')), THREE.ShaderLib.physical);
    expect(sdfOf(low.fragmentShader)).toBe(sdfOf(high.fragmentShader)); // 档位坍缩：三档同一 SDF 字符串（见模块头记档）
    for (const gone of ['lguVeinMid', 'lguClump', 'lguTransVar', 'vec3(0.47, 0.83, 0.35)']) {
      expect(low.fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(count(low.fragmentShader, '#include <opaque_fragment>')).toBe(1); // 透光不注入但锚点原句不动
    expect(low.fragmentShader).toContain('(0.80 + 0.20 * lguShade)'); // shade 保留
    expect(low.fragmentShader).toContain('vec3 lguHue'); // hue·luma 保留
    expect(low.fragmentShader).toContain('vec3(1.08, 1.11, 1.04)'); // 叶背保留
    expect(count(low.fragmentShader, 'facVnoise(')).toBe(3); // 片元零噪声采样（库内 3 为死码，运行时零执行）
  });

  it('皮 Mid：去细纹亮线/皮孔点（近景细节层）；脊沟低浮雕/横连/沟内 AO/干基暗化/细枝两档/果域全保留（中距「灰褐细纵脊浅沟 + 冠缘红铜细枝 + 紫黑白粉果簇」身份 Spec §7）', () => {
    const { fragmentShader } = assemble(track(createLigustrumBarkMaterial('mid')), THREE.ShaderLib.physical);
    // domainVars 三档统一预声明（triadica 同款）——断言消费式/场段缺席而非裸标识符
    for (const gone of ['lguLR', 'vec2(vUv.x * 26.0, vUv.y * 30.0)', 'lguLenticel * 0.6', 'lguLenticel * 0.05', 'lguFineLine', '1.0 + 0.035']) {
      expect(fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('abs(fract(vUv.x * 10.0 + lguWarp * 0.85)'); // 脊沟低浮雕保留（中距身份）
    expect(fragmentShader).toContain('lguCut * 0.12'); // 横连保留（大体平行少量横连——语言件）
    expect(fragmentShader).toContain('vec3(0.90, 0.89, 0.88)'); // 沟内弱 AO 保留
    expect(fragmentShader).toContain('lguBarkBase'); // 干基暗化保留
    expect(fragmentShader).toContain('lguTwigMid * 0.30'); // 老枝灰褐档保留（消费式在场）
    expect(fragmentShader).toContain('vec3(1.20, 1.00, 0.74)'); // 细枝红铜过渡保留（冠缘红铜细枝中距读向）
    expect(fragmentShader).toContain('vec3(0.13, 0.12, 0.19)'); // 果域蓝黑端保留（紫黑白粉果簇中距身份）
    expect(fragmentShader).toContain('vec3(0.52, 0.55, 0.60)'); // 白粉霜覆层保留（三档同体——果簇剪影）
    expect(fragmentShader).toContain('roughnessFactor = 0.66;'); // 果域哑光（Mid 逐档微升）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 游走场 1（细纹/皮孔随段去——纯 ALU 无采样损失）
  });

  it('皮 Low：再去横连/干基暗化/老枝灰褐档（低调项）；脊沟 + 沟内 AO + 当年生红铜档 + 果域保留（远距「细纵脊剪影 + 果簇色块」保留面）；1× vnoise', () => {
    const { fragmentShader } = assemble(track(createLigustrumBarkMaterial('low')), THREE.ShaderLib.physical);
    for (const gone of ['lguCut', 'lguBarkBase', 'lguTwigMid * 0.30', 'lguFineLine', 'vec2(vUv.x * 26.0, vUv.y * 30.0)', 'lguLR']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('lguRidge'); // 脊沟保留（远距剪影保留面）
    expect(fragmentShader).toContain('vec3(0.90, 0.89, 0.88)'); // 沟内 AO 保留
    expect(fragmentShader).toContain('vec3(1.20, 1.00, 0.74)'); // 当年生红铜档（结构剪影项三档保留）
    expect(fragmentShader).toContain('vec3(0.17, 0.11, 0.15)'); // 果域红黑端保留（色序双端）
    expect(fragmentShader).toContain('roughnessFactor = 0.68;'); // 果域哑光（远距果色读向保留）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 游走场 1
  });

  it('深度分档：三档同一 SDF（档位坍缩沿樟——表面/影裁切档内一致）；三档零噪声库', () => {
    const high = assemble(track(createLigustrumLeafDepthMaterial()), THREE.ShaderLib.depth);
    const mid = assemble(track(createLigustrumLeafDepthMaterial('mid')), THREE.ShaderLib.depth);
    const low = assemble(track(createLigustrumLeafDepthMaterial('low')), THREE.ShaderLib.depth);
    const highSdf = sdfOf(high.fragmentShader);
    expect(sdfOf(mid.fragmentShader)).toBe(highSdf); // Mid 深度 = High SDF
    expect(sdfOf(low.fragmentShader)).toBe(highSdf); // Low 深度 = 同一 SDF（档位坍缩——键仍分档）
    // 表面/影档内一致：叶表面各档 SDF === 深度各档 SDF
    for (const level of ['high', 'mid', 'low'] as const) {
      const surface = assemble(track(createLigustrumLeafMaterial(level)), THREE.ShaderLib.physical);
      const depthShader = assemble(track(createLigustrumLeafDepthMaterial(level)), THREE.ShaderLib.depth);
      expect(sdfOf(surface.fragmentShader)).toBe(sdfOf(depthShader.fragmentShader)); // 同一 GLSL 字符串（单一来源纪律）
      expect(count(depthShader.fragmentShader, 'facVnoise(')).toBe(0); // 三档深度零噪声库
      expect(sdfOf(depthShader.fragmentShader)).not.toContain('cos('); // SDF 零 cos（全缘零载波——保护性约束）
    }
  });

  it('风动三档同源：叶/皮三档顶点 GLSL 全文一致（LIGUSTRUM_WIND 同一常量——档间相位一致 = 身份一致）', () => {
    const leafHigh = assemble(track(createLigustrumLeafMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createLigustrumBarkMaterial()), THREE.ShaderLib.physical);
    for (const level of ['mid', 'low'] as const) {
      const leaf = assemble(track(createLigustrumLeafMaterial(level)), THREE.ShaderLib.physical);
      const bark = assemble(track(createLigustrumBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(leaf.vertexShader).toBe(leafHigh.vertexShader);
      expect(bark.vertexShader).toBe(barkHigh.vertexShader);
    }
  });

  it('分档底参契约不因档破：叶三档 alphaTest/alphaToCoverage/DoubleSide/USE_UV/零贴图；皮三档 FrontSide/无 alphaTest/USE_UV；深度 alphaTest', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const leaf = track(createLigustrumLeafMaterial(level));
      const bark = track(createLigustrumBarkMaterial(level));
      const depth = track(createLigustrumLeafDepthMaterial(level));
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
    for (const make of [createLigustrumLeafMaterial, createLigustrumBarkMaterial]) {
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
    const leafA = track(createLigustrumLeafMaterial());
    const leafB = track(createLigustrumLeafMaterial());
    const barkA = track(createLigustrumBarkMaterial());
    const barkB = track(createLigustrumBarkMaterial());
    const depth = track(createLigustrumLeafDepthMaterial());
    expect(leafA).not.toBe(leafB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(leafA.customProgramCacheKey()).toBe(leafB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([leafA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
    expect(materialUniformsOf(leafA).uTime).not.toBe(materialUniformsOf(leafB).uTime); // uTime 桥接对象实例独立（dispose 安全）
    expect(materialUniformsOf(barkA).uTime).not.toBe(materialUniformsOf(barkB).uTime);
  });

  it('底参与侧向：叶 DoubleSide/革质强光泽 0.44/USE_UV；皮 FrontSide/细纹族中低糙/USE_UV；均零贴图', () => {
    const leaf = track(createLigustrumLeafMaterial());
    const bark = track(createLigustrumBarkMaterial());
    expect(leaf.side).toBe(THREE.DoubleSide);
    expect(leaf.metalness).toBe(0);
    expect(leaf.roughness).toBeGreaterThan(0.42); // 革质强光泽域（0.44）
    expect(leaf.roughness).toBeLessThan(0.50);
    expect(leaf.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.FrontSide);
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeGreaterThan(0.85); // 细纹族中低糙哑光
    expect(bark.map).toBeNull();
    expect(leaf.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
  });
});

describe('成本记账（10 万实例每像素预算：叶 High ≈7×（全缘近零脉红利——vs 樟 8×）/ 皮 High 最重路径 ≈4.5×（1× vnoise 游走场——横连单场门控省第二采样），hash21=1×/vnoise=3×）', () => {
  it('facVnoise 调用数：叶 High 1 处（3×）、Mid/Low 0 处；皮三档 1 处（游走场）；深度 0 处（零噪声库注入）；顶点零噪声', () => {
    const leaf = assemble(track(createLigustrumLeafMaterial()), THREE.ShaderLib.physical);
    const leafMid = assemble(track(createLigustrumLeafMaterial('mid')), THREE.ShaderLib.physical);
    const bark = assemble(track(createLigustrumBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createLigustrumLeafDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(leaf.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（叶团）
    expect(count(leafMid.fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0（Mid 片元零噪声）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（游走场——皮/果两域取最重；横连单场门控省第二采样）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(0); // 深度零噪声库注入（全缘 SDF 纯 ALU）
    expect(count(leaf.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零循环/零纹理采样（配方确定性纯函数 + SDF 纯 ALU）；全源零三角函数反函数调用（零 mat2）', () => {
    const shaders = [
      assemble(track(createLigustrumLeafMaterial()), THREE.ShaderLib.physical),
      assemble(track(createLigustrumBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createLigustrumLeafDepthMaterial()), THREE.ShaderLib.depth),
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
    for (const make of [createLigustrumLeafMaterial, createLigustrumBarkMaterial, createLigustrumLeafDepthMaterial]) {
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
    const leaf = track(createLigustrumLeafMaterial());
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

    const depth = track(createLigustrumLeafDepthMaterial());
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
    const bark = track(createLigustrumBarkMaterial());
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

    const leaf = track(createLigustrumLeafMaterial());
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

    const leaf = assemble(track(createLigustrumLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createLigustrumBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createLigustrumLeafDepthMaterial()), THREE.ShaderLib.depth);
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

  /** guard 本体：注入段内出现的每个 lgu* 标识符必须为 main 顶层（深度 1）唯一声明，
   *  且声明先于段尾（消费点）——块内声明（作用域在块结束关闭）与块内遮蔽声明（float 重声明）
   *  两种复发形态都红 */
  const crossIncludeScopeGuard = (fragmentShader: string, segment: { start: number; text: string }, label: string): void => {
    const ids = new Set(segment.text.match(/\blgu[A-Z][A-Za-z0-9_]*/g) ?? []);
    for (const id of ids) {
      const decl = `float ${id}`;
      expect(count(fragmentShader, decl), `${label}:${id} 声明唯一（块内 float 重声明 = 遮蔽——triadica 次生 bug 形态）`).toBe(1);
      const declIdx = fragmentShader.indexOf(decl);
      expect(declIdx, `${label}:${id} 声明存在`).toBeGreaterThan(0);
      expect(declIdx, `${label}:${id} 声明先于消费段尾`).toBeLessThan(segment.start + segment.text.length);
      expect(braceDepthFromMain(fragmentShader, declIdx), `${label}:${id} 声明在 main 顶层（跨 include 可见——块内声明即编译错误形态）`).toBe(1);
    }
  };

  it('皮三档：roughnessmap 注入段消费的 lgu* 标识符均在 main 顶层唯一声明（domainVars 预声明 + 块内纯赋值——High 消费 lguBarkSmooth/lguLenticel，Mid 消费 lguBarkSmooth，Low 段零 lgu* id 自然跳过）', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const { fragmentShader } = assemble(track(createLigustrumBarkMaterial(level)), THREE.ShaderLib.physical);
      const segment = injectedSegmentAfter(fragmentShader, '#include <roughnessmap_fragment>');
      crossIncludeScopeGuard(fragmentShader, segment, `bark:${level}`);
    }
  });

  it('叶三档：roughnessmap 注入段消费的 lgu* 标识符同守（leafBody 平铺无块包裹——High 消费 lguClump，Mid/Low 段零 lgu* id 自然跳过）', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const { fragmentShader } = assemble(track(createLigustrumLeafMaterial(level)), THREE.ShaderLib.physical);
      const segment = injectedSegmentAfter(fragmentShader, '#include <roughnessmap_fragment>');
      crossIncludeScopeGuard(fragmentShader, segment, `leaf:${level}`);
    }
  });

  it('叶透光段（opaque_fragment 前注入）消费的 lgu* 标识符（lguAlpha/lguBack/lguTransVar）同守——High/Mid', () => {
    for (const level of ['high', 'mid'] as const) { // Low 无透光注入（设计内）
      const { fragmentShader } = assemble(track(createLigustrumLeafMaterial(level)), THREE.ShaderLib.physical);
      const anchorIdx = fragmentShader.indexOf('#if NUM_DIR_LIGHTS > 0');
      expect(anchorIdx).toBeGreaterThanOrEqual(0);
      const endIdx = fragmentShader.indexOf('#include <opaque_fragment>', anchorIdx);
      expect(endIdx).toBeGreaterThan(anchorIdx);
      crossIncludeScopeGuard(fragmentShader, { start: anchorIdx, text: fragmentShader.slice(anchorIdx, endIdx) }, `leaf-trans:${level}`);
    }
  });

  it('跨 include 类型守卫（011.8 lguBarkMul 同型事故——lguRidge float 顶层声明 × vec3 注入块消费）：皮三档 lguBarkMul 赋值右侧显式 vec3(lguRidge) 广播，禁裸 float 标量直乘进 vec3 声明（修复形态 toContain + 裸标量注入消费 not.toMatch）', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const { fragmentShader } = assemble(track(createLigustrumBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(fragmentShader, `bark:${level} 修复形态在场（float 顶层声明 → vec3 显式广播）`).toContain('vec3 lguBarkMul = vec3(lguRidge) * (0.95 + 0.08 * lguWarp)');
      expect(fragmentShader, `bark:${level} 禁裸 lguRidge 标量直乘（= float 表达式赋 vec3 = 维度不匹配编译错误）`).not.toMatch(/vec3\s+lguBarkMul\s*=\s*lguRidge\s*\*/);
      // 叶侧同型守卫：lguMul 为 vec3（lguHue vec3 × float 链——无裸标量赋值形态）
      const leaf = assemble(track(createLigustrumLeafMaterial(level)), THREE.ShaderLib.physical);
      expect(leaf.fragmentShader, `leaf:${level} 修复形态在场（vec3 × float 合法链）`).toContain('vec3 lguMul = lguHue * lguLuma * (0.80');
      expect(leaf.fragmentShader, `leaf:${level} 禁裸 float 标量直赋 vec3 lguMul`).not.toMatch(/vec3\s+lguMul\s*=\s*(?!lguHue)\w+\s*;/);
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
    const material = track(createLigustrumLeafMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});
