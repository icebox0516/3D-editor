/**
 * tests/runtime/procedural/tree/ginkgoMaterials.test.ts —— 银杏叶/树皮/深度材质测试
 * （T011.4，对称 zelkovaMaterials.test.ts 范式：真实 THREE.ShaderLib 源组装，静态字符串
 * 断言，零 WebGL；build()/资产入口归并行几何 agent 的资产测试，此处不覆盖）。
 *
 * 覆盖：
 * - uTime 接线（TimeUniformService 消费协议）：叶/皮材质挂材质级 uniforms.uTime（own
 *   property）；onBeforeCompile 后 shader.uniforms.uTime 与材质级同对象引用；GLSL 声明
 *   uniform float uTime；材质挂场景被服务逐帧驱动（frame 写值闭环）；
 * - 风动契约（D19.7）：aSeed/aBend/aLeafRand 顶点 attribute 声明存在；相位 = fract(sin(...))
 *   类 hash（aSeed=0 缺省属性路径退化为常数相位，全源零除 aSeed——无 NaN）；整树缓摆项
 *   叶/皮同公式（同串出现）；叶片快颤层含 aBend 权重（树皮组恒 0 天然免颤）+ 长柄扇叶颤
 *   读向（幅度 13mm 五树最大 > 香樟 11mm > 榉树 8mm、频率 10–17 rad/s 偏低——叶柄
 *   3–10cm ≈ 叶宽同量级 Verified）；
 * - instanceColor 乘算链安全：注入后 <color_fragment> 原句恰一次、注入代码零 vColor 介入；
 * - SDF 叶形与透光：alphaTest 0.5 + alphaToCoverage；片元含 gkLeafAlpha 计算式与 alpha
 *   写入；深度材质（叶影裁切）含同一 SDF 函数（单一来源）+ RGBADepthPacking + 树皮组守卫
 *   （aLeafRand=0 实心）+ USE_UV + alphaTest；透光项存在且 NUM_DIR_LIGHTS 守卫；风动不进
 *   depth pass；
 * - 物种配方锚定（Spec docs/research/ginkgo-reference.md 1.0，含终审 C 节降级口径——比例类
 *   以文献轴为准）：**扇形包络**（SDF 全新叶形族核心：半周期正弦 sin(π/2·v^1.10) 单调张开
 *   ——JS 数值锚：无内部最宽点、v=1 处最大（vs 先例全周期 sin 内部峰 0.5^(1/p) 收 0——框架
 *   反置的数值锚）；v=0.5 处 ≈67% 半宽（扇形张开读向））+ **顶端宽边半平面 0.965−v**
 *   （Spec §4「顶端宽 5–8cm」Verified——顶端是全宽边非收尖点；斜率 1 保 AA）+ min() 双半
 *   平面合成 + 侧缘全缘平直**无齿载波**（margin entire Verified——62.83 齿频不出现）/
 *   **顶端缺刻系统**（波状载波 cos(x·25.13) ≈2 波谷/侧 + 中央缺刻分型 60/30/10——JS 数值
 *   锚：<0.30 深裂 0.17–0.30 / 0.30–0.90 浅缺 0.02–0.08 / >0.90 近全缘双通道压灭 + 侧缘
 *   门控）/ **二叉分歧辐射脉**（五例唯一非中轴脉型：x/v 射线族坐标免 atan + 载波频率沿 v
 *   翻倍 fork = 二叉读向 + 脉端开放渐隐 0.78–0.90（FOC "open" = 不达缘 Verified——不达缘
 *   即正确）+ 无中脉带（先例中轴脉常量 0.42·pow/0.30·pow/62.83 不出现）权重 0.40 隐约可
 *   见）/ **两面同色无背面通道**（五例首例——Spec §5 两面同色无两面差：注入代码零
 *   gl_FrontFacing、三先例背面乘子配方不串种、两面糙度同值）/ 叶色淡绿-黄绿 #8ab45d
 *   （五树最浅最黄——亮度 > 朴树、G−B 87 > 朴树 67）/ 哑光-半光泽 roughness 0.68（介于
 *   榉树 0.62 与朴树 0.72 之间）/ 薄纸质-半肉质透光中等偏强峰值 0.34（朴树 0.30 < 0.34
 *   < 榉树 0.40 三资产链）+ 亮黄绿透射色 (0.66,0.95,0.38)；皮：**第五种树皮语言**灰褐纵裂
 *   脊沟——底色 #6b665c（R−G=5 < 香樟 11 更灰、B 92 > 香樟 82 冷灰）+ 浅-中纵裂剖面沟底
 *   0.64（朴树 0.76 > 0.64 > 香樟 0.50——终审 C-6 浅-中端）+ 9 窄密脊（vs 香樟 7 宽脊）+
 *   纵脊连续**无横断块状**（香樟 31.4 横断载波不出现）+ 树瘤伴生弱表达（bark-a Inferred
 *   单源——脊沟扰动 + 轻暗，High 专属）+ 上部淡褐黄偏色（当年生枝淡褐黄 Verified）+
 *   苔藓不做（覆盖度低单源低置信——不做不编造）；
 * - 深度材质零噪声库注入（缺刻载波 ALU 化 → SDF 零 facVnoise 引用 → 影 pass 不吃噪声纪律
 *   的更优满足——沿榉树 011.3 组合先例）；
 * - 分档实装（level 参数，缺省 'high'）：三工厂缺省 ≡ 显式 'high'（属性 + 键 + GLSL 全文
 *   逐位相等）；3 工厂 × 3 档 = 9 键互异 + 与 zelkova/camphor 18 键零碰撞（ginkgo 前缀不混
 *   缓存）；叶 Mid 去二叉脉/叶团/糙度叶团项（SDF 全形**含缺刻**保留——档间剪影一致、透光/
 *   hue·luma/shade 保留）、Low 换 SDF_LOW（去缺刻系统；包络/顶边与 High 逐字同源）再去
 *   透光；皮 Mid 去树瘤（脊沟/AO/上部偏色保留）、Low 去树瘤/上部偏色外项（脊沟 + AO 保留
 *   ——中距「树干浅-中纵裂」Spec §7 可辨）；深度 Mid = High SDF（含缺刻）、Low = SDF_LOW
 *   （表面/影档内一致）；风动三档顶点 GLSL 同源；分档底参契约（alphaTest/侧向/USE_UV）不
 *   因档破；uTime 桥接三档不缺位；
 * - program 键纪律：叶/皮/深度三键互异；两次工厂调用材质对象不同（无模块级共享，D17）但
 *   键相同；uniforms 不跨实例共享；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：叶片元 facVnoise 调用 1 处
 *   （叶团斑块——缺刻载波 ALU 化免噪声）、Mid/Low 0 处；皮 High 2 处（裂线游走 + 树瘤域）、
 *   Mid/Low 1 处（裂线游走）；深度 0 处（零噪声库注入）；顶点零噪声；全源零循环/零纹理
 *   采样；
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
  createGinkgoBarkMaterial,
  createGinkgoLeafDepthMaterial,
  createGinkgoLeafMaterial,
} from '../../../../src/runtime/procedural/tree/ginkgo/ginkgoMaterials';
import {
  createCamphorBarkMaterial,
  createCamphorLeafDepthMaterial,
  createCamphorLeafMaterial,
} from '../../../../src/runtime/procedural/tree/camphor/camphorMaterials';
import {
  createZelkovaBarkMaterial,
  createZelkovaLeafDepthMaterial,
  createZelkovaLeafMaterial,
} from '../../../../src/runtime/procedural/tree/zelkova/zelkovaMaterials';

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

/** 提取注入后的 gkLeafAlpha 函数全文（SDF 单一来源比对用；首个 \n} 即函数闭合） */
const sdfOf = (fragmentShader: string): string => {
  const start = fragmentShader.indexOf('float gkLeafAlpha(vec2 gkUv, float gkRand)');
  expect(start).toBeGreaterThanOrEqual(0);
  const end = fragmentShader.indexOf('\n}', start);
  return fragmentShader.slice(start, end + 2);
};

/** 扇形半周期包络 JS 镜像：sin(π/2·v^1.10)——半宽比例（0.5× 系数不改变单调性/比例断言） */
const fanWidth = (v: number): number => Math.sin((Math.PI / 2) * Math.pow(v, 1.10));
/** 中央缺刻深度分型 JS 镜像（GLSL mix/step 链的等价实现） */
const sinusOf = (r2: number): number =>
  r2 < 0.30 ? 0.17 + (0.30 - 0.17) * (r2 / 0.30) : 0.02 + 0.06 * ((r2 - 0.30) / 0.60);

afterEach(() => {
  for (const material of created.splice(0)) material.dispose();
});

describe('uTime 接线（TimeUniformService 消费协议）', () => {
  it('叶/皮材质挂材质级 uniforms.uTime；编译后 shader.uniforms.uTime 同引用；GLSL 声明 uniform', () => {
    for (const material of [track(createGinkgoLeafMaterial()), track(createGinkgoBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('材质挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const leaf = track(createGinkgoLeafMaterial());
    const bark = track(createGinkgoBarkMaterial());
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

describe('风动契约（D19.7：uTime 全局风帧 / aSeed 个体相位；长柄扇叶颤——柄 3–10cm ≈ 叶宽同量级 Verified）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）', () => {
    const leaf = assemble(track(createGinkgoLeafMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(leaf.vertexShader).toContain(decl);
    }
    expect(leaf.vertexShader).toContain('fract(sin(aSeed * 82.537'); // 整树缓摆相位 = hash(aSeed)——常数换朴树/香樟/榉树去相关
    expect(leaf.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 58.219'); // 快颤相位 = hash(aSeed+叶身份)
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(leaf.vertexShader + leaf.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('整树缓摆叶/皮同公式（同串出现）；快颤含 aBend 权重且幅度 13mm 长柄扇叶颤（五树最大 > 先例 11mm）、频率 10+ 偏低；树高锚 8m（×0.125）', () => {
    const leaf = assemble(track(createGinkgoLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createGinkgoBarkMaterial()), THREE.ShaderLib.physical);
    const swayCore = 'gkWindH * gkWindH * 0.045 * sin(uTime * 1.15';
    expect(leaf.vertexShader).toContain(swayCore);
    expect(bark.vertexShader).toContain(swayCore); // 皮不动叶动会撕裂穿帮——同公式同相位
    expect(leaf.vertexShader).toContain('aBend * 0.013'); // 长柄扇叶颤：幅度 13mm 五树最大（柄 3–10cm ≈ 叶宽同量级——长柄摆锤幅度大）
    expect(leaf.vertexShader).toContain('uTime * (10.0 + 7.0 * gkFlutterPhase)'); // 10–17 rad/s（≈1.6–2.7Hz）偏低（长柄摆锤周期长——vs 先例 14+/16+）
    expect(leaf.vertexShader).toContain('position.y * 0.125'); // /8m 锚点树高（银杏目标 ≈8m，D19.7）
    expect(0.013).toBeGreaterThan(0.011); // > 香樟长柄 11mm
    expect(0.013).toBeGreaterThan(0.008); // > 榉树短柄 8mm
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createGinkgoLeafMaterial()), track(createGinkgoBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('SDF 叶形与透光', () => {
  it('alphaTest 0.5 + alphaToCoverage；片元含 SDF 计算式并写入 alpha', () => {
    const material = track(createGinkgoLeafMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float gkLeafAlpha('); // 叶形 SDF 函数（单一来源）
    expect(fragmentShader).toContain('gkLeafAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = gkAlpha;'); // alphatest_fragment 上游写入
  });

  it('深度材质（叶影裁切）：同一 SDF 函数 + RGBADepthPacking + 树皮组守卫实心 + USE_UV + alphaTest；风动不进 depth；零噪声库注入', () => {
    const material = track(createGinkgoLeafDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.depthPacking).toBe(THREE.RGBADepthPacking);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('gkLeafAlpha(vUv, vLeafRand)');
    expect(shader.fragmentShader).toContain('step(0.0001, vLeafRand)'); // 皮组 aLeafRand=0 → 实心（圆柱 uv 域不误裁）
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
    expect(count(shader.fragmentShader, 'facVnoise(')).toBe(0); // 零噪声库注入——缺刻载波 ALU 化（影 pass 不吃噪声的更优满足）
    expect(shader.fragmentShader).not.toContain('facHash21'); // 噪声库整体未挂（SDF 引入噪声即编译暴雷——保护性约束）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫（无平行光场景安全降级）', () => {
    const { fragmentShader } = assemble(track(createGinkgoLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(fragmentShader).toContain('directionalLights[0]');
    expect(fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
  });
});

describe('物种配方锚定（Spec ginkgo-reference 1.0 §2/§4/§5/§7；终审 C 节：比例类以文献轴为准、树皮取浅-中端）', () => {
  it('扇形包络（SDF 全新叶形族核心）：半周期正弦单调张开（JS 数值锚——无内部最宽点、v=1 处最大 = 框架反置）+ 顶端宽边半平面 + min() 合成；深度 SDF 单一来源同步', () => {
    const leaf = assemble(track(createGinkgoLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('sin(1.5708 * pow(clamp(gkP.y, 0.001, 0.999), 1.10))'); // 半周期正弦包络（π/2 非 π——v=1 处最大半宽；Spec §4 扇形/宽楔基 Verified [1][2][3]）
    // JS 数值锚：单调张开（无内部最宽点）——vs 先例全周期 sin 内部峰
    expect(fanWidth(0.2)).toBeLessThan(fanWidth(0.5));
    expect(fanWidth(0.5)).toBeLessThan(fanWidth(0.9));
    expect(fanWidth(0.9)).toBeLessThan(fanWidth(1.0)); // v=1 处最大（先例 v=1 收 0——扇形框架反置）
    expect(fanWidth(0.5)).toBeGreaterThan(0.60); // 中高 ≈67% 半宽（扇形张开读向）
    expect(fanWidth(0.5)).toBeLessThan(0.75);
    // 先例包络最宽点 0.5^(1/p) < 1（内部峰）——扇形最宽点 = 1（顶端）的框架分化数值锚
    const widest = (p: number): number => Math.pow(0.5, 1 / p);
    expect(widest(0.76)).toBeLessThan(1); // 朴树 0.40 内部峰
    expect(widest(1.4)).toBeLessThan(1); // 夏栎 0.61 内部峰
    expect(1.0).toBeGreaterThan(widest(1.4)); // 扇形最宽点 = 顶端
    expect(leaf.fragmentShader).toContain('min(0.5 * gkEnv - gkAbsX, 0.965 - gkP.y - gkDip)'); // 侧缘 × 顶边双半平面 min 合成（顶端全宽边——Spec §4「顶端宽 5–8cm」Verified [1][2][3]）
    expect(leaf.fragmentShader).toContain('clamp(gkEdge / 0.04 + 0.5'); // 坡宽 0.04 沿先例 AA 口径（顶边斜率 1 保锐度）
    const depth = assemble(track(createGinkgoLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(sdfOf(depth.fragmentShader)).toBe(sdfOf(leaf.fragmentShader)); // SDF 单一来源——影裁切叶形自动同步
  });

  it('顶端缺刻系统（60/30/10 分型）：波状载波 ≈2 波谷/侧 + 中央缺刻分型（深裂/浅缺/近全缘）+ 侧缘门控；全缘侧缘无齿载波；SDF 零噪声引用', () => {
    const leaf = assemble(track(createGinkgoLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('cos(gkP.x * 25.13 + gkRand * 6.28)'); // 侧向波状载波（2π·4——全宽 4 周期、逐叶相位错开）
    const waveCycles = 25.13 / (2 * Math.PI);
    expect(waveCycles).toBeCloseTo(4.0, 3); // 4 周期/全宽 = ≈2 波谷/侧（Spec §4 波状缺刻 ≈60% 照片 leaf-a Inferred [7]；25.13 为两位字面量——精度 3）
    // 中央缺刻分型 JS 数值锚（GLSL mix/step 链等价镜像）：<0.30 深裂（2 裂 30%）/ 0.30–0.90 浅缺（波状 60%）/ >0.90 近全缘（10%）
    expect(sinusOf(0.15)).toBeGreaterThan(0.17); // 深裂类
    expect(sinusOf(0.15)).toBeLessThan(0.30);
    expect(sinusOf(0.60)).toBeGreaterThan(0.02); // 浅缺类
    expect(sinusOf(0.60)).toBeLessThan(0.08);
    expect(leaf.fragmentShader).toContain('step(0.30, gkR2)'); // 分型阈值（60/30/10 统计近似——叶位分化归几何侧，契约缺口候选①）
    expect(leaf.fragmentShader).toContain('smoothstep(0.90, 0.97, gkR2)'); // 近全缘类双通道渐灭
    expect(leaf.fragmentShader).toContain('pow(max(0.0, 1.0 - gkAbsX * 3.2), 1.6) * gkSinus'); // 中央缺刻（2 裂读向——中央最深向两侧衰减）
    expect(leaf.fragmentShader).toContain('(1.0 - smoothstep(0.38, 0.47, gkAbsX))'); // 侧缘门控：缺刻只在上半部顶边（侧缘全缘平直纪律）
    expect(leaf.fragmentShader).not.toContain('62.83'); // 全缘无齿载波（margin entire Verified——四先例齿频不出现；榉树齿载波回归的反例回归）
    expect(leaf.fragmentShader).not.toContain('smoothstep(0.48, 0.56'); // 朴树式中部门控不串种
    expect(sdfOf(leaf.fragmentShader)).not.toContain('facVnoise'); // SDF 零噪声引用（深度材质不挂噪声库的前提——缺刻载波 ALU 化沿 011.3 先例）
  });

  it('二叉分歧辐射脉（五例唯一非中轴脉型）：射线族坐标免 atan + 载波频率沿 v 翻倍（二叉读向）+ 脉端开放渐隐（FOC open = 不达缘）+ 无中脉带', () => {
    const { fragmentShader } = assemble(track(createGinkgoLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('gkP.x / max(gkP.y, 0.10)'); // 射线族坐标（沿自叶基放射线恒定——免 atan 的角坐标代理）
    expect(fragmentShader).toContain('mix(1.0, 2.0, smoothstep(0.30, 0.52, gkP.y))'); // 二叉因子：载波频率沿 v 翻倍 = 每脉上行分岔为二（Spec §4「2 脉入叶基反复二叉」Verified [1][3][5]）
    expect(fragmentShader).toContain('gkVeinRatio * 5.5 * gkVeinFork'); // 载波角频 5.5（顶端 ≈6 脉/侧——parallel close 读向）
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.78, 0.90, gkP.y))'); // 脉端开放渐隐（FOC "open" = 脉不达缘 Verified [3]——不达缘即正确表达）
    expect(fragmentShader).toContain('smoothstep(0.10, 0.28, gkP.y)'); // 基部收敛渐显（防射线汇聚摩尔纹）
    expect(fragmentShader).not.toContain('gkVeinMid'); // 无中脉带（五例唯一非中轴脉型——先例框架不适用的记档）
    expect(fragmentShader).not.toContain('0.30 * pow'); // 朴树三出脉基侧脉对不串种
    expect(fragmentShader).not.toContain('0.42 * pow'); // 香樟离基三出脉不串种
    expect(fragmentShader).toContain('gkVein * 0.40'); // 权重 0.40 隐约可见（照片「辐射平行脉隐约可见」[7]——弱于先例主脉层）
    expect(fragmentShader).toContain('vec3(1.55, 1.38, 1.05)'); // 脉色（可见度沿朴树 Step 4b sRGB 压缩教训定标）
  });

  it('两面同色无背面通道（五例首例——Spec §5 两面同色无两面差）：注入代码零 gl_FrontFacing、先例背面乘子不串种、两面糙度同值', () => {
    const leaf = assemble(track(createGinkgoLeafMaterial()), THREE.ShaderLib.physical);
    expect(count(leaf.fragmentShader, 'gl_FrontFacing')).toBe(0); // 两面同色（Spec §5「两面同色、无粉感、无两面差」Inferred [7] + FRPS 单面描述 Verified [1][2]——五例首个无背面通道；任务简报「两面深浅差异」与 Spec 冲突以 Spec 为准）
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.05, 1.16)'); // 香樟 glaucous 背面配方不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.02, 1.00, 1.10)'); // 朴树背面配方不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.10, 1.12, 1.04)'); // 榉树背面配方不串种
    expect(leaf.fragmentShader).not.toContain('float(gl_FrontFacing) * 0.08'); // 无两面糙度差（无毛平滑两面一致）
    const depth = assemble(track(createGinkgoLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).not.toContain('gl_FrontFacing'); // 深度 pass 只裁 alpha，无面色语义
  });

  it('薄纸质-半肉质透光中等偏强：峰值 0.34（朴树 0.30 < 0.34 < 榉树 0.40 三资产链）；透射色亮黄绿基调（淡绿叶透光最亮）', () => {
    const { fragmentShader } = assemble(track(createGinkgoLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('* pow(gkBack, 3.0) * gkTransVar * gkAlpha * 0.34;');
    expect(fragmentShader).toContain('vec3(0.66, 0.95, 0.38)'); // 亮黄绿透射色（淡绿叶透光最亮读向——亮于朴树 (0.58,0.90,0.38) / 榉树 (0.60,0.92,0.34)）
    expect(0.34).toBeGreaterThan(0.30); // > 朴树近革质（Spec §5 薄纸质-半肉质透光中等偏强 Inferred [7]）
    expect(0.34).toBeLessThan(0.40); // < 榉树薄纸质最强
    expect(fragmentShader).not.toContain('* 0.30;'); // 朴树峰值不串种
    expect(fragmentShader).not.toContain('* 0.40;'); // 榉树峰值不串种
    expect(fragmentShader).not.toContain('* 0.22;'); // 香樟峰值不串种
    expect(fragmentShader).not.toContain('* 0.65;'); // 夏栎裂叶峰值不串种
  });

  it('叶底色 #8ab45d 淡绿-黄绿（五树最浅最黄——亮度 > 朴树、G−B 87 > 朴树 67）；哑光-半光泽 roughness 0.68（介于榉树 0.62 与朴树 0.72 之间）', () => {
    const leaf = track(createGinkgoLeafMaterial());
    const hex = leaf.color.getHex();
    expect(hex).toBe(0x8ab45d); // 工程设定：FRPS「淡绿色」Verified [1][2] + 照片中绿-黄绿调 Inferred [7] 交叉——五资产最浅（中距色块与樟树深绿直接区分 Spec §5）
    const [r, g, b] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
    expect(g - b).toBe(87); // 黄绿差最强黄向（朴树 67 / 榉树 64 / 香樟 51）
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    expect(luma([r, g, b])).toBeGreaterThan(luma([0x5a, 0x83, 0x40])); // 亮于朴树（中绿偏黄——四先例最亮）→ 五树最浅
    expect(luma([r, g, b])).toBeGreaterThan(luma([0x4e, 0x7c, 0x33])); // 亮于夏栎
    expect(luma([r, g, b])).toBeGreaterThan(luma([0x3e, 0x6c, 0x2c])); // 亮于榉树
    expect(luma([r, g, b])).toBeGreaterThan(luma([0x33, 0x61, 0x2e])); // 亮于香樟（浓绿最暗）
    expect(leaf.roughness).toBe(0.68); // 哑光-半光泽（Spec §5「非蜡质亮面、非糙毛面」Inferred [7]；介于榉树 0.62 与朴树 0.72 之间）
    expect(0.68).toBeGreaterThan(0.62); // > 榉树半光泽微糙
    expect(0.68).toBeLessThan(0.72); // < 朴树半光泽
    expect(leaf.metalness).toBe(0);
  });

  it('皮底色 #6b665c 灰褐（R−G=5 < 香樟 11 更灰、B 92 > 香樟 82 冷灰——灰褐 vs 黄褐与樟分化）；纵裂脊沟系统（第五种树皮语言）', () => {
    const bark = track(createGinkgoBarkMaterial());
    const hex = bark.color.getHex();
    expect(hex).toBe(0x6b665c); // 工程设定：文献「灰褐色」Verified [1][2] + 照片 grayish-brown Inferred [7] 交叉
    const [r, g, b] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
    expect(r - g).toBe(5); // < 香樟 11（黄褐）——更灰读向（Spec §5 分化点①）
    expect(b).toBeGreaterThan(82); // > 香樟 B 82——冷灰读向（灰褐 vs 黄褐）
    const { fragmentShader } = assemble(track(createGinkgoBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('abs(fract(vUv.x * 9.0 + gkBarkWarp * 0.70) * 2.0 - 1.0)'); // 9 窄密脊（脊宽 ≈干径 1/10–1/15 可至 1/20——vs 香樟 7 宽脊；「脊较窄密」Spec §5 分化点②）
    expect(fragmentShader).toContain('0.64 + 0.36 * gkBarkTri * gkBarkTri'); // 浅-中纵裂剖面沟底 0.64（中龄相 + 终审 C-6 中庸处置取浅-中端）
    expect(0.76).toBeGreaterThan(0.64); // 朴树浅裂 0.76 > 0.64（浅-中）
    expect(0.64).toBeGreaterThan(0.50); // 0.64 > 香樟深沟 0.50
    expect(fragmentShader).not.toContain('0.50 + 0.50'); // 香樟深沟常数不串种
    expect(fragmentShader).not.toContain('0.76 + 0.24'); // 朴树浅裂常数不串种
    expect(fragmentShader).not.toContain('0.44 + 0.56'); // 夏栎深沟常数不串种
    expect(fragmentShader).not.toContain('31.4'); // 无横断块状感通道（香樟「局部横向纹连接成块状」vs 银杏「纵脊连续」——分化点③）
    expect(bark.roughness).toBe(0.91); // 高糙哑光
  });

  it('树瘤伴生（弱证据弱表达——bark-a Inferred 单源）：低频域 + 脊沟扰动 + 轻暗；High 专属；苔藓不做（覆盖度低单源低置信——不做不编造）', () => {
    const { fragmentShader } = assemble(track(createGinkgoBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float gkBurl = smoothstep(0.68, 0.80, gkBurlDomain);'); // 树瘤域（低频高带 ~8–12%）
    expect(fragmentShader).toContain('0.80 + 0.05 * sin(vUv.y * 90.0 + gkBurlDomain * 30.0)'); // 树瘤内脊沟扰动 + 细密乱纹（弱表达）
    expect(fragmentShader).toContain('vec3(0.95, 0.93, 0.91)'); // 树瘤域轻暗
    expect(fragmentShader).not.toContain('Moss'); // 苔藓不做（Spec §5 覆盖度低弱于樟树 + 单源低置信——沿榉树先例）
  });

  it('干上部/细枝：淡褐黄偏色（当年生枝淡褐黄 Verified）+ 裂深弱化；高度门控三档保留', () => {
    const { fragmentShader } = assemble(track(createGinkgoBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float gkBarkSmooth = smoothstep(2.2, 4.6, vTreePos.y);'); // 高度门控（结构剪影项——一年生长枝淡褐黄/老枝灰细纵裂 Verified [1][2]）
    expect(fragmentShader).toContain('vec3(1.08, 1.03, 0.92)'); // 上部淡褐黄偏色（R 抬 B 降——淡褐黄读向）
    expect(fragmentShader).toContain('0.90 + 0.10 * gkBarkTri * gkBarkTri'); // 上部裂深弱化（细枝浅裂趋平滑——弱化幅度介于朴树/香樟）
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
      [track(createGinkgoLeafMaterial()), track(createGinkgoLeafMaterial('high')), THREE.ShaderLib.physical],
      [track(createGinkgoBarkMaterial()), track(createGinkgoBarkMaterial('high')), THREE.ShaderLib.physical],
      [track(createGinkgoLeafDepthMaterial()), track(createGinkgoLeafDepthMaterial('high')), THREE.ShaderLib.depth],
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
    expectKey(track(createGinkgoLeafMaterial()), 'ginkgo:leaf');
    expectKey(track(createGinkgoLeafMaterial('mid')), 'ginkgo:leaf:mid');
    expectKey(track(createGinkgoLeafMaterial('low')), 'ginkgo:leaf:low');
    expectKey(track(createGinkgoBarkMaterial()), 'ginkgo:bark');
    expectKey(track(createGinkgoBarkMaterial('mid')), 'ginkgo:bark:mid');
    expectKey(track(createGinkgoBarkMaterial('low')), 'ginkgo:bark:low');
    expectKey(track(createGinkgoLeafDepthMaterial()), 'ginkgo:leaf-depth');
    expectKey(track(createGinkgoLeafDepthMaterial('mid')), 'ginkgo:leaf-depth:mid');
    expectKey(track(createGinkgoLeafDepthMaterial('low')), 'ginkgo:leaf-depth:low');
    expect(keys.size).toBe(9);
  });

  it('与 zelkova/camphor 18 键零碰撞（ginkgo 前缀不与先例混缓存）', () => {
    const foreignKeys = new Set<string>();
    for (const make of [createZelkovaLeafMaterial, createZelkovaBarkMaterial, createZelkovaLeafDepthMaterial,
      createCamphorLeafMaterial, createCamphorBarkMaterial, createCamphorLeafDepthMaterial]) {
      for (const level of ['high', 'mid', 'low'] as const) {
        foreignKeys.add(track(make(level)).customProgramCacheKey());
      }
    }
    expect(foreignKeys.size).toBe(18);
    for (const make of [createGinkgoLeafMaterial, createGinkgoBarkMaterial, createGinkgoLeafDepthMaterial]) {
      for (const level of ['high', 'mid', 'low'] as const) {
        expect(foreignKeys.has(track(make(level)).customProgramCacheKey())).toBe(false);
      }
    }
  });

  it('叶 Mid：SDF 与 High 同源全形（含缺刻系统——档间剪影一致）+ 去二叉脉/叶团/糙度叶团项；透光/hue·luma/shade 保留；片元零噪声', () => {
    const high = assemble(track(createGinkgoLeafMaterial()), THREE.ShaderLib.physical);
    const mid = assemble(track(createGinkgoLeafMaterial('mid')), THREE.ShaderLib.physical);
    expect(sdfOf(mid.fragmentShader)).toBe(sdfOf(high.fragmentShader)); // Mid SDF = High 同源全形
    expect(sdfOf(mid.fragmentShader)).toContain('gkDip'); // 含缺刻系统（缺刻 ALU 成本可忽略——档间剪影一致保留）
    for (const gone of ['gkVein', 'gkClump', 'gkVeinFork']) {
      expect(mid.fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(mid.fragmentShader).not.toContain('(gkClump - 0.5) * 0.06'); // 糙度注入同步去叶团项
    expect(mid.fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0'); // 透光保留
    expect(mid.fragmentShader).toContain('gkTransVar');
    expect(mid.fragmentShader).toContain('vec3 gkHue'); // hue·luma 逐叶变奏保留
    expect(mid.fragmentShader).toContain('float gkLuma');
    expect(mid.fragmentShader).toContain('(0.80 + 0.20 * gkShade)'); // 冠内竖向自遮蔽保留（地板 0.80 沿先例口径）
    expect(count(mid.fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0 调用（叶团去采样——Mid 片元零噪声执行）
  });

  it('叶 Low：SDF 换 SDF_LOW（去缺刻系统——缺刻细化；包络/顶边与 High 逐字同源）；去叶脉/叶团/透光；hue·luma/shade 保留；片元零噪声', () => {
    const high = assemble(track(createGinkgoLeafMaterial()), THREE.ShaderLib.physical);
    const low = assemble(track(createGinkgoLeafMaterial('low')), THREE.ShaderLib.physical);
    const lowSdf = sdfOf(low.fragmentShader);
    expect(lowSdf).not.toBe(sdfOf(high.fragmentShader)); // Low SDF = 去缺刻版（换字符串）
    for (const gone of ['gkDip', 'gkWave', 'gkSinus', 'gkR2', 'gkVein', 'gkClump', 'gkTransVar', 'vec3(0.66, 0.95, 0.38)']) {
      expect(low.fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    // 包络/顶边两项与 High 逐字同源（档间叶形身份一致的去细节不改形原则——Spec §7 牺牲顺序「缺刻先于扇形轮廓牺牲」）
    expect(lowSdf).toContain('sin(1.5708 * pow(clamp(gkP.y, 0.001, 0.999), 1.10))');
    expect(lowSdf).toContain('min(0.5 * gkEnv - abs(gkP.x), 0.965 - gkP.y)');
    expect(lowSdf).toContain('clamp(gkEdge / 0.04 + 0.5'); // 坡宽同步（档间 AA 边一致）
    expect(count(low.fragmentShader, '#include <opaque_fragment>')).toBe(1); // 透光不注入但锚点原句不动
    expect(low.fragmentShader).toContain('(0.80 + 0.20 * gkShade)'); // shade 保留
    expect(low.fragmentShader).toContain('vec3 gkHue'); // hue·luma 保留
    expect(count(low.fragmentShader, 'facVnoise(')).toBe(3); // 片元零噪声采样（库内 3 为死码，运行时零执行）
  });

  it('皮 Mid：去树瘤（近距细节——中距不可辨）；脊沟/沟内 AO/上部淡褐黄偏色保留', () => {
    const { fragmentShader } = assemble(track(createGinkgoBarkMaterial('mid')), THREE.ShaderLib.physical);
    for (const gone of ['gkBurl', 'vec3(0.95, 0.93, 0.91)', 'sin(vUv.y * 90.0']) {
      expect(fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('gkBarkRidge'); // 脊沟保留（纵裂是身份核心）
    expect(fragmentShader).toContain('vec3(0.88, 0.885, 0.92)'); // 沟内冷灰 AO 保留（与 High 逐字同源）
    expect(fragmentShader).toContain('vec3(1.08, 1.03, 0.92)'); // 上部淡褐黄偏色保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 裂线游走 1（树瘤域去采样）
  });

  it('皮 Low：脊沟保留（中距「树干浅-中纵裂」Spec §7 可辨）；去树瘤/上部偏色外项；1× vnoise', () => {
    const { fragmentShader } = assemble(track(createGinkgoBarkMaterial('low')), THREE.ShaderLib.physical);
    for (const gone of ['gkBurl', 'vec3(1.08, 1.03, 0.92)']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('0.64 + 0.36 * gkBarkTri * gkBarkTri'); // 浅-中纵裂剖面保留
    expect(fragmentShader).toContain('vec3(0.88, 0.885, 0.92)'); // 沟内冷灰 AO 保留（脊沟读向不破）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 裂线游走 1
  });

  it('深度分档：Mid = High SDF（含缺刻）/ Low = SDF_LOW；与叶表面档内逐字一致（表面/影裁切档内一致）；三档零噪声库', () => {
    const high = assemble(track(createGinkgoLeafDepthMaterial()), THREE.ShaderLib.depth);
    const mid = assemble(track(createGinkgoLeafDepthMaterial('mid')), THREE.ShaderLib.depth);
    const low = assemble(track(createGinkgoLeafDepthMaterial('low')), THREE.ShaderLib.depth);
    const highSdf = sdfOf(high.fragmentShader);
    expect(sdfOf(mid.fragmentShader)).toBe(highSdf); // Mid 深度 = High SDF（同源全形含缺刻）
    expect(highSdf).toContain('gkDip'); // 档间剪影一致（缺刻影读向保留）
    expect(sdfOf(low.fragmentShader)).not.toBe(highSdf); // Low 深度 = SDF_LOW（去缺刻）
    expect(sdfOf(low.fragmentShader)).not.toContain('gkDip');
    // 表面/影档内一致：叶表面各档 SDF === 深度各档 SDF
    for (const level of ['high', 'mid', 'low'] as const) {
      const surface = assemble(track(createGinkgoLeafMaterial(level)), THREE.ShaderLib.physical);
      const depthShader = assemble(track(createGinkgoLeafDepthMaterial(level)), THREE.ShaderLib.depth);
      expect(sdfOf(surface.fragmentShader)).toBe(sdfOf(depthShader.fragmentShader)); // 同一 GLSL 字符串（单一来源纪律）
      expect(count(depthShader.fragmentShader, 'facVnoise(')).toBe(0); // 三档深度零噪声库
    }
  });

  it('风动三档同源：叶/皮三档顶点 GLSL 全文一致（GINKGO_WIND 同一常量——档间相位一致 = 身份一致）', () => {
    const leafHigh = assemble(track(createGinkgoLeafMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createGinkgoBarkMaterial()), THREE.ShaderLib.physical);
    for (const level of ['mid', 'low'] as const) {
      const leaf = assemble(track(createGinkgoLeafMaterial(level)), THREE.ShaderLib.physical);
      const bark = assemble(track(createGinkgoBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(leaf.vertexShader).toBe(leafHigh.vertexShader);
      expect(bark.vertexShader).toBe(barkHigh.vertexShader);
    }
  });

  it('分档底参契约不因档破：叶三档 alphaTest/alphaToCoverage/DoubleSide/USE_UV/零贴图；皮 FrontSide；深度 alphaTest', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const leaf = track(createGinkgoLeafMaterial(level));
      const bark = track(createGinkgoBarkMaterial(level));
      const depth = track(createGinkgoLeafDepthMaterial(level));
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
    for (const make of [createGinkgoLeafMaterial, createGinkgoBarkMaterial]) {
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
    const leafA = track(createGinkgoLeafMaterial());
    const leafB = track(createGinkgoLeafMaterial());
    const barkA = track(createGinkgoBarkMaterial());
    const barkB = track(createGinkgoBarkMaterial());
    const depth = track(createGinkgoLeafDepthMaterial());
    expect(leafA).not.toBe(leafB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(leafA.customProgramCacheKey()).toBe(leafB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([leafA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
    expect(materialUniformsOf(leafA).uTime).not.toBe(materialUniformsOf(leafB).uTime); // uTime 桥接对象实例独立（dispose 安全）
    expect(materialUniformsOf(barkA).uTime).not.toBe(materialUniformsOf(barkB).uTime);
  });

  it('底参与侧向：叶 DoubleSide/哑光-半光泽/USE_UV；皮 FrontSide/高糙哑光/USE_UV；均零贴图', () => {
    const leaf = track(createGinkgoLeafMaterial());
    const bark = track(createGinkgoBarkMaterial());
    expect(leaf.side).toBe(THREE.DoubleSide);
    expect(leaf.metalness).toBe(0);
    expect(leaf.roughness).toBeGreaterThan(0.62); // 哑光-半光泽（0.68——介于榉树 0.62 与朴树 0.72）
    expect(leaf.roughness).toBeLessThan(0.72);
    expect(leaf.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.FrontSide);
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeGreaterThanOrEqual(0.88); // 高糙哑光
    expect(bark.map).toBeNull();
    expect(leaf.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
  });
});

describe('成本记账（10 万实例每像素预算：叶 ≤8× / 皮 ≤7.5×，hash21=1×/vnoise=3×——缺刻载波 ALU 化红利）', () => {
  it('facVnoise 调用数：叶 High 1 处（3×）、Mid/Low 0 处；皮 High 2 处（6×）、Mid/Low 1 处（3×）；深度 0 处（零噪声库注入）；顶点零噪声', () => {
    const leaf = assemble(track(createGinkgoLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createGinkgoBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createGinkgoLeafDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(leaf.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（叶团斑块——缺刻载波 ALU 化免噪声）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（裂线游走 + 树瘤域）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(0); // 深度零噪声库注入（缺刻载波 ALU 化先天满足影 pass 不吃噪声）
    expect(count(leaf.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin/cos
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零循环/零纹理采样（配方确定性纯函数 + SDF 纯 ALU）；全源零 atan（射线族坐标 = x/v 代理）', () => {
    const shaders = [
      assemble(track(createGinkgoLeafMaterial()), THREE.ShaderLib.physical),
      assemble(track(createGinkgoBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createGinkgoLeafDepthMaterial()), THREE.ShaderLib.depth),
    ];
    for (const shader of shaders) {
      for (const source of [shader.vertexShader, shader.fragmentShader]) {
        expect(source).not.toContain('for (');
        expect(source).not.toContain('while');
        expect(source).not.toContain('texture'); // 零贴图零采样（D13）
        expect(source).not.toContain('atan'); // 辐射脉免 atan（x/v 射线族坐标——成本纪律）
      }
    }
  });
});

describe('注入点缺失即抛（首次渲染前暴雷）', () => {
  it('片元 map_fragment 摘除 → 叶/皮/深度均抛「注入点缺失」', () => {
    for (const make of [createGinkgoLeafMaterial, createGinkgoBarkMaterial, createGinkgoLeafDepthMaterial]) {
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
    const leaf = track(createGinkgoLeafMaterial());
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

    const depth = track(createGinkgoLeafDepthMaterial());
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

  it('片元 roughnessmap_fragment / opaque_fragment 摘除 → 抛「注入点缺失」（糙度注入仅 High 叶——Mid/Low 无项不注入为设计内）', () => {
    const bark = track(createGinkgoBarkMaterial());
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

    const leaf = track(createGinkgoLeafMaterial());
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

    const leaf = assemble(track(createGinkgoLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createGinkgoBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createGinkgoLeafDepthMaterial()), THREE.ShaderLib.depth);
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
    const material = track(createGinkgoLeafMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});
