/**
 * tests/runtime/procedural/tree/tree3aMaterials.test.ts —— 夏栎叶/树皮材质 + 风动测试（T008.3）。
 *
 * 覆盖（沿 plantMaterials.test.ts 范式：真实 THREE.ShaderLib 源组装，静态字符串断言，
 * 零 WebGL）：
 * - uTime 接线（TimeUniformService 消费协议）：叶/皮材质挂材质级 uniforms.uTime（own
 *   property）；onBeforeCompile 后 shader.uniforms.uTime 与材质级同对象引用（服务写一次
 *   两边生效）；GLSL 声明 uniform float uTime；真实 build() 产物挂场景被 TimeUniformService
 *   逐帧驱动（frame 写值闭环）；
 * - 风动契约：aSeed/aBend/aLeafRand 顶点 attribute 声明存在；相位 = fract(sin(...)) 类
 *   hash（aSeed=0 缺省属性路径退化为常数相位，全源零除 aSeed——无 NaN）；整树缓摆项
 *   （uTime·hash(aSeed) 派生）叶/皮同公式（同串出现）；叶片快颤层含 aBend 权重；
 * - instanceColor 乘算链安全：注入后 <color_fragment> 原句恰一次、注入代码零 vColor 介入
 *   （逐实例色相微差乘算与注入乘法交换律安全）；
 * - SDF 叶形：alphaTest 0.5 + alphaToCoverage；片元含 t3aLeafAlpha 计算式与 alpha 写入；
 *   深度材质（叶影裁切）含同一 SDF 函数（单一来源）+ 树皮组守卫（aLeafRand=0 实心）+
 *   USE_UV + alphaTest；透光项存在且 NUM_DIR_LIGHTS 守卫；
 * - 锚点门 R1 微调参数锚定（2026-09-18 四项）：树皮 tri³ 深沟剖面/沟内冷灰 AO/节疤核+
 *   愈伤环/苔痕方位门控；叶齿载波合成锯齿（噪声频率 42 不升——alphaTest 裁切闪烁纪律）/
 *   中脉沟侧翼/透光峰值 0.65；深度材质同一 SDF 齿形同步；
 * - T009.2 叶形 SDF 重构 + 叶背粉绿（Spec tree3a-reference 1.0 附录 #13/#14）：倒卵形
 *   包络指数 1.4（最宽点 ≈61% 叶长）/5 对圆裂（31.42 = 2π·5）/基部耳形 t3aEar（振幅
 *   ≤ 坡宽 0.03×75%）/齿载波与噪声频率维持；深度材质 SDF 单一来源同步；叶背粉绿
 *   gl_FrontFacing 双面调制（纯 ALU）；旧 4 对裂常数 25.13 退役；
 * - T009.4 树皮底色灰度校正（Spec tree3a-reference 1.0 bark_color Verified [6] / 附录
 *   #15）：底色锁灰主调灰褐 #5c534a——暖差减半（R−G 18→9、R−B 36→18）微暖保留、
 *   相对亮度持平（0.0890→0.0896，整树明度无跳变）；旧暖褐 #63513f 退役；
 * - T009.6 材质分档实装（level 参数，缺省 'high' 现行为逐位不变）：三工厂缺省 ≡ 显式
 *   'high'（材质属性 + 键 + onBeforeCompile 后 GLSL 全文逐位相等）；High 的 map_fragment
 *   注入段与改前单体 BODY 基线全文逐位一致（分段拼装不重排不增删字符）；3 工厂 × 3 档
 *   = 9 键互异且 High 三键沿用原键；叶 Mid 去叶脉三线/叶团（透光/叶背/shade 保留）、
 *   Low 换 Low SDF（片元零 facVnoise 调用）去透光；皮 Mid 去节疤、Low 去板块采样
 *   （均值化常量乘子）；深度 Mid = High SDF 同源、Low = Low SDF（表面/影档内一致）；
 *   风动三档顶点 GLSL 同源；分档底参契约（alphaTest/侧向/USE_UV）不因档破；
 * - program 键纪律：叶/皮/深度三键互异；两次工厂调用材质对象不同（无模块级共享）但键相同；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：叶片元 facVnoise 调用 2 处
 *   （锯齿+斑块；另 1 处为库定义）= 6×、皮 2 处 = 6×；顶点/深度零噪声；全源零循环/
 *   零纹理采样；
 * - 注入点缺失即抛（map_fragment/begin_vertex/roughnessmap_fragment/common 摘除各暴雷）；
 * - 结构完整性：include 全展开后花括号配平差值与原版一致（注入不破坏 GLSL 结构）；
 * - TimeUniformService.freeze/unfreeze：冻结忽略时间戳、解冻恢复累计（不回补）、幂等；
 * - 资产换装：build() 材质组序 [皮, 叶] 键对应、底参与侧向/透明裁切配置。
 * 边界：材质登记 afterEach 统一 dispose 兜底（含 build 产物），不跨测试泄漏。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms } from 'three';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';
import { TimeUniformService } from '../../../../src/runtime/services/TimeUniformService';
import {
  createTree3aBarkMaterial,
  createTree3aLeafDepthMaterial,
  createTree3aLeafMaterial,
} from '../../../../src/runtime/procedural/tree/tree3a/tree3aMaterials';
import { build } from '../../../../src/runtime/procedural/assets/asset_tree_3a.asset';
import { assemble, braceDelta, count, createMaterialTracker, expandIncludes, materialUniformsOf, propsOf, sdfOf as extractSdf } from '../../../support/procedural-tree/materialHarness';

const { track, disposeAll } = createMaterialTracker();
/** build 产物登记（资产换装测试——afterEach 随 disposeAll 一并释放） */
const built: InstanceSource[] = [];

afterEach(() => {
  disposeAll();
  for (const source of built.splice(0)) {
    source.geometry.dispose();
    const material = source.material;
    if (Array.isArray(material)) for (const m of material) m.dispose();
    else material.dispose();
  }
});

describe('uTime 接线（TimeUniformService 消费协议）', () => {
  it('叶/皮材质挂材质级 uniforms.uTime；编译后 shader.uniforms.uTime 同引用；GLSL 声明 uniform', () => {
    for (const material of [track(createTree3aLeafMaterial()), track(createTree3aBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('真实 build() 产物挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const source = build();
    built.push(source);
    const mats = (Array.isArray(source.material) ? source.material : [source.material]) as THREE.MeshStandardMaterial[];
    const clock = new TimeUniformService();
    const scene = new THREE.Scene().add(new THREE.Mesh(source.geometry, source.material));
    clock.frame(0, scene);
    expect(materialUniformsOf(mats[0]!).uTime!.value).toBe(0);
    clock.frame(1000, scene);
    expect(materialUniformsOf(mats[0]!).uTime!.value).toBeCloseTo(1, 10); // 服务写一次两边生效
    expect(materialUniformsOf(mats[1]!).uTime!.value).toBeCloseTo(1, 10);
  });
});

describe('风动契约（D19.7：uTime 全局风帧 / aSeed 个体相位）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）', () => {
    const leaf = assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(leaf.vertexShader).toContain(decl);
    }
    expect(leaf.vertexShader).toContain('fract(sin(aSeed * 78.233'); // 整树缓摆相位 = hash(aSeed)
    expect(leaf.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 51.171'); // 快颤相位 = hash(aSeed+叶身份)
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(leaf.vertexShader + leaf.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('整树缓摆叶/皮同公式（同串出现）；叶片快颤层含 aBend 权重', () => {
    const leaf = assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createTree3aBarkMaterial()), THREE.ShaderLib.physical);
    const swayCore = 't3aWindH * t3aWindH * 0.045 * sin(uTime * 1.15';
    expect(leaf.vertexShader).toContain(swayCore);
    expect(bark.vertexShader).toContain(swayCore); // 皮不动叶动会撕裂穿帮——同公式同相位
    expect(leaf.vertexShader).toContain('aBend * 0.011'); // 快颤权重 = aBend（树皮组恒 0 天然免颤）
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createTree3aLeafMaterial()), track(createTree3aBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('SDF 叶形与透光', () => {
  it('alphaTest 0.5 + alphaToCoverage；片元含 SDF 计算式并写入 alpha', () => {
    const material = track(createTree3aLeafMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float t3aLeafAlpha('); // 叶形 SDF 函数（单一来源）
    expect(fragmentShader).toContain('t3aLeafAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = t3aAlpha;'); // alphatest_fragment 上游写入
  });

  it('深度材质（叶影裁切）：同一 SDF 函数 + 树皮组守卫实心 + USE_UV + alphaTest', () => {
    const material = track(createTree3aLeafDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('t3aLeafAlpha(vUv, vLeafRand)');
    expect(shader.fragmentShader).toContain('step(0.0001, vLeafRand)'); // 皮组 aLeafRand=0 → 实心（圆柱 uv 域不误裁）
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫（无平行光场景安全降级）', () => {
    const { fragmentShader } = assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(fragmentShader).toContain('directionalLights[0]');
    expect(fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
  });
});

describe('锚点门第 1 轮微调参数锚定（2026-09-18 四项，近观 8m）', () => {
  it('树皮：tri³ 深沟剖面 + 沟内冷灰 AO + 节疤核收紧/愈伤环 + 苔痕方位门控 + 脊顶糙度回落', () => {
    const { fragmentShader } = assemble(track(createTree3aBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('0.44 + 0.56 * t3aBarkTri * t3aBarkTri * t3aBarkTri'); // 沟底 0.55·tri² → 0.44·tri³
    expect(fragmentShader).toContain('smoothstep(0.08, 0.72, t3aBarkTri)'); // 沟内 AO 式冷灰压暗
    expect(fragmentShader).toContain('smoothstep(0.72, 0.84, t3aBarkKnotF)'); // 节疤核带收紧（0.66–0.84 → 0.72–0.84）
    expect(fragmentShader).toContain('1.0 - 0.42 * t3aBarkKnot + 0.14 * t3aBarkRim'); // 核加深 0.28→0.42 + 愈伤环 +0.14
    expect(fragmentShader).toContain('smoothstep(-0.15, 0.75, sin(vUv.x * 6.28318 + 1.2))'); // 苔痕方位门控（一侧干净一侧集中）
    expect(fragmentShader).toContain('t3aBarkTri * t3aBarkTri * t3aBarkTri * 0.10'); // 脊顶糙度 −0.10（高光骑脊深度线索）
  });

  it('叶：齿载波合成锯齿（噪声频率 42 不升防裁切闪烁）+ 中脉沟侧翼 + 透光峰值 0.65；深度同 SDF 同步', () => {
    const leaf = assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('float t3aTooth = pow(0.5 + 0.5 * cos(t3aP.y * 37.7 - t3aRand * 6.28), 3.0);'); // 齿载波（纯 ALU）
    expect(leaf.fragmentShader).toContain('t3aP.y * 42.0'); // 锯齿噪声频率维持（升频 → alphaTest 0.5 裁切闪烁）
    expect(leaf.fragmentShader).toContain('t3aVeinFlank'); // 中脉沟侧翼压暗（立体感）
    expect(leaf.fragmentShader).toContain('* t3aTransVar * t3aAlpha * 0.65;'); // 透光峰值 0.45 → 0.65
    const depth = assemble(track(createTree3aLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).toContain('t3aTooth'); // SDF 单一来源——影裁切齿形自动同步
  });
});

describe('T009.2 叶形 SDF 重构 + 叶背粉绿（Spec 1.0 附录 #13/#14，Verified [1][2][5]）', () => {
  it('倒卵形包络（v^1.4 预扭曲，最宽点 ≈61% 叶长）+ 5 对圆裂（2π·5）+ 基部耳形 t3aEar；深度材质 SDF 单一来源同步', () => {
    const leaf = assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('pow(clamp(t3aP.y, 0.001, 0.999), 1.4)'); // 倒卵形包络指数（v=0.5 → v≈0.61 最宽点）
    expect(leaf.fragmentShader).toContain('t3aP.y * 31.42'); // 5 对圆裂（25.13 = 2π·4 → 31.42 = 2π·5，域 4–7 取中）
    expect(leaf.fragmentShader).toContain('float t3aEar = sin(3.14159 * clamp(t3aP.y / 0.15, 0.0, 1.0)) * 0.02;'); // 基部耳形：带 [0,0.15] 钟形，振幅 0.02 ≤ 坡宽 0.03×75%
    expect(leaf.fragmentShader).not.toContain('25.13'); // 旧 4 对裂常数退役
    const depth = assemble(track(createTree3aLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).toContain('pow(clamp(t3aP.y, 0.001, 0.999), 1.4)'); // SDF 单一来源——影裁切叶形自动同步
    expect(depth.fragmentShader).toContain('t3aP.y * 31.42');
    expect(depth.fragmentShader).toContain('t3aEar');
  });

  it('齿载波 6 齿维持 + 锯齿噪声频率 42 不升（锚点门 R1 裁切闪烁纪律；卡长变化 +15% 下密度仍合）', () => {
    const leaf = assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('float t3aTooth = pow(0.5 + 0.5 * cos(t3aP.y * 37.7 - t3aRand * 6.28), 3.0);'); // 6 齿载波维持
    expect(leaf.fragmentShader).toContain('t3aP.y * 42.0'); // 噪声频率不升
  });

  it('叶背粉绿：gl_FrontFacing 双面区分（背面略浅/去饱和/冷绿偏移，纯 ALU 零采样）；深度材质不吃面色', () => {
    const leaf = assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('float(gl_FrontFacing)'); // WebGL2 内建双面判定（背面法线由 three 翻转）
    expect(leaf.fragmentShader).toContain('mix(vec3(0.94, 1.05, 1.16), vec3(1.0), float(gl_FrontFacing))'); // FRPS「叶背粉绿色」调制向量
    const depth = assemble(track(createTree3aLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).not.toContain('gl_FrontFacing'); // 深度 pass 只裁 alpha，无面色语义
  });
});

describe('T009.4 树皮底色灰度校正（Spec tree3a-reference 1.0 bark_color Verified [6] / 附录 #15，2026-09-18）', () => {
  it('底色锁灰主调灰褐 #5c534a：暖差减半（R−G 18→9、R−B 36→18）微暖保留、亮度持平；旧暖褐 #63513f 退役', () => {
    const bark = track(createTree3aBarkMaterial());
    const hex = bark.color.getHex();
    expect(hex).toBe(0x5c534a); // 灰为主调（参考照 ref-oak-bark-a 一般表面饱和度 0.152 对照；旧 #63513f 饱和度 0.364 灰味低于真实）
    const [r, g, b] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
    expect(r - g).toBe(9); // R≈G 微暖保留（受光面暖褐语义）；旧 18 减半
    expect(g - b).toBe(9);
    expect(r - b).toBe(18); // 红蓝暖差减半（旧 36）——灰味提升、读得出不跳色
    // 亮度持平：#5c534a 相对亮度 0.0896 ≈ 旧 #63513f 的 0.0890（+0.7%，整树明度无跳变）
  });
});

describe('T009.6 分档实装（level 参数；缺省 high = 现行为逐位不变）', () => {
  /** 改前基线（T009.6 实装前 tree3aMaterials.ts 单体 TREE3A_LEAF_BODY / TREE3A_BARK_BODY
   *  全文照抄）——逐位锁定 High 路径不变：分段拼装若重排/增删任一字符即在此失败 */
  const LEAF_BODY_BASELINE = `
// tree3a:leaf —— SDF 叶形覆盖 + 逐叶变奏 + 冠内层次（<color_fragment> 不触碰）
float t3aAlpha = t3aLeafAlpha(vUv, vLeafRand);
diffuseColor.a = t3aAlpha;
// 逐叶身份（aLeafRand）：色相两端（冷蓝绿 ↔ 暖黄绿，通道摆幅 ≤15% 纪律）+ 明度 ±10%（去相关取样）
vec3 t3aHue = mix(vec3(0.88, 1.00, 1.10), vec3(1.10, 1.03, 0.82), fract(vLeafRand * 5.391 + 0.23));
float t3aLuma = 0.90 + 0.20 * fract(vLeafRand * 3.117 + 0.61);
// 冠内：竖向自遮蔽（底暗顶亮，伪装冠层 AO）+ 中频叶团斑块（波长 ~1.1m ≈ 叶团身份差）
float t3aClump = facVnoise(vec2(vTreePos.x + vTreePos.z * 0.71, vTreePos.y - vTreePos.z * 0.53) * 0.9 + vec2(9.4, 3.1));
float t3aShade = clamp((vTreePos.y - 2.6) / 3.6, 0.0, 1.0);
// 叶脉明暗：中脉亮带（加宽锐化）+ 中脉沟侧翼压暗（立体感）+ 斜出侧脉（幂次锐化），
// 浅黄绿（叶脉比叶肉亮）；纯 ALU 零采样
vec2 t3aP = vec2(vUv.x - 0.5, vUv.y);
float t3aVeinMid = 1.0 - smoothstep(0.008, 0.024, abs(t3aP.x));
float t3aVeinFlank = (1.0 - t3aVeinMid) * (1.0 - smoothstep(0.024, 0.070, abs(t3aP.x))); // 中脉两侧沟影带
float t3aVeinLat = pow(max(0.0, sin(t3aP.y * 34.0 - abs(t3aP.x) * 26.0 + (vLeafRand - 0.5) * 0.6)), 7.0)
  * (1.0 - t3aVeinMid) * smoothstep(0.03, 0.20, t3aP.y) * (1.0 - smoothstep(0.78, 0.97, t3aP.y));
vec3 t3aMul = t3aHue * t3aLuma * (0.76 + 0.24 * t3aShade) * (0.94 + 0.12 * t3aClump);
t3aMul *= 1.0 - 0.07 * t3aVeinFlank * smoothstep(0.05, 0.28, t3aP.y) * (1.0 - smoothstep(0.74, 0.96, t3aP.y)); // 沟影限中段（两端收）
t3aMul = mix(t3aMul, t3aMul * vec3(1.28, 1.17, 0.68), t3aVeinMid * 0.58 + t3aVeinLat * 0.42);
diffuseColor.rgb *= t3aMul;
// 叶背粉绿（T009.2）：gl_FrontFacing 区分背面（WebGL2 内建；DoubleSide 材质双面片元，
// 背面法线由 three 双面光照自动翻转，此处只调固有色）——FRPS「叶背粉绿色」Verified [1][2]：
// 背面比叶面略浅、轻度去饱和、冷绿偏移（红蓝相对绿抬升），幅度克制（读得出双面差异不跳色）；
// 纯 ALU 零采样零分支；透光项暖绿为背光透射语义，与背面固有色区分不冲突
diffuseColor.rgb *= mix(vec3(0.94, 1.05, 1.16), vec3(1.0), float(gl_FrontFacing));
`;

  const BARK_BODY_BASELINE = `
// tree3a:bark —— 脊-沟-板 + 节疤 + 苔痕（成熟橡皮矩形龟裂；整数脊数 → u 缝相位连续）
float t3aBarkWarp = facVnoise(vec2(vUv.x * 2.7, vUv.y * 2.1) + vec2(11.7, 3.9)); // 脊线游走（低频）
float t3aBarkTri = abs(fract(vUv.x * 14.0 + t3aBarkWarp * 1.35) * 2.0 - 1.0);
// 深沟：tri³ 剖面（脊更窄亮/坡更暗）+ 沟底 0.44（× 板块暗端 × 沟内冷灰 ≈ 0.33 —— 深沟灰褐）
float t3aBarkRidge = 0.44 + 0.56 * t3aBarkTri * t3aBarkTri * t3aBarkTri;
float t3aBarkPlate = facVnoise(vec2(vUv.x * 4.6, vUv.y * 13.5) + vec2(23.1, 8.3)); // 环疏纵密 → 竖长板
// 节疤：低频游走噪声高带（稀疏圆斑；同噪两用零额外采样）——核带收紧（更清晰）+ 愈伤环
float t3aBarkKnotF = t3aBarkWarp + t3aBarkPlate * 0.2;
float t3aBarkKnot = smoothstep(0.72, 0.84, t3aBarkKnotF); // 核：暗斑 + 脊线压平 + 粗糙上翘
float t3aBarkRim = smoothstep(0.62, 0.72, t3aBarkKnotF) * (1.0 - smoothstep(0.80, 0.90, t3aBarkKnotF)); // 愈伤环：核外亮带
// 苔痕：冠下竖向门控（树冠 ~2.7m 起，其下背阴）× 双噪声高带 × 方位门控（一侧集中一侧干净）
float t3aBarkMoss = (1.0 - smoothstep(2.0, 5.2, vTreePos.y))
  * smoothstep(0.56, 0.86, t3aBarkWarp * 0.6 + t3aBarkPlate * 0.55)
  * smoothstep(-0.15, 0.75, sin(vUv.x * 6.28318 + 1.2));
vec3 t3aBarkMul = mix(t3aBarkRidge, 0.74 + 0.2 * t3aBarkRidge, t3aBarkKnot)
  * mix(vec3(0.84, 0.86, 0.88), vec3(1.13, 1.07, 1.00), t3aBarkPlate);
t3aBarkMul *= mix(vec3(0.89, 0.87, 0.97), vec3(1.05, 1.02, 0.98), smoothstep(0.08, 0.72, t3aBarkTri)); // 沟内 AO 式冷灰压暗、脊顶微暖
t3aBarkMul *= 1.0 - 0.42 * t3aBarkKnot + 0.14 * t3aBarkRim; // 节疤核加深 + 愈伤环微亮
t3aBarkMul = mix(t3aBarkMul, t3aBarkMul * vec3(0.80, 0.99, 0.58), t3aBarkMoss * 0.82);
diffuseColor.rgb *= t3aBarkMul;
`;

  /** 提取注入后的 t3aLeafAlpha 函数全文（SDF 单一来源分档比对用；首个 \n} 即函数闭合） */
  const sdfOf = (fragmentShader: string): string =>
    extractSdf(fragmentShader, 'float t3aLeafAlpha(vec2 t3aUv, float t3aRand)');

  it('三工厂缺省与显式 high 逐位一致（属性 + 键 + GLSL 全文）；High 注入段与改前基线逐位一致', () => {
    const pairs: Array<[THREE.Material, THREE.Material, { vertexShader: string; fragmentShader: string }]> = [
      [track(createTree3aLeafMaterial()), track(createTree3aLeafMaterial('high')), THREE.ShaderLib.physical],
      [track(createTree3aBarkMaterial()), track(createTree3aBarkMaterial('high')), THREE.ShaderLib.physical],
      [track(createTree3aLeafDepthMaterial()), track(createTree3aLeafDepthMaterial('high')), THREE.ShaderLib.depth],
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
    // High 注入段与改前基线全文逐位一致（分段拼装不改 High 一字符）——含糙度注入原句
    const leafHigh = assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createTree3aBarkMaterial()), THREE.ShaderLib.physical);
    expect(leafHigh.fragmentShader).toContain(LEAF_BODY_BASELINE);
    expect(barkHigh.fragmentShader).toContain(BARK_BODY_BASELINE);
    expect(leafHigh.fragmentShader).toContain(
      'roughnessFactor = clamp(roughnessFactor - 0.05 + (t3aClump - 0.5) * 0.08 + (t3aVeinMid + t3aVeinLat) * 0.05, 0.05, 1.0);',
    );
    expect(barkHigh.fragmentShader).toContain(
      'roughnessFactor = clamp(roughnessFactor + (t3aBarkPlate - 0.5) * 0.05 + t3aBarkKnot * 0.09 + t3aBarkMoss * 0.05 - t3aBarkTri * t3aBarkTri * t3aBarkTri * 0.10, 0.05, 1.0);',
    );
  });

  it('分档缓存键 3×3 = 9 键互不相同；High 三键沿用原键（零既有消费者破坏）', () => {
    const keys = new Set<string>();
    const expectKey = (material: THREE.Material, key: string): void => {
      expect(material.customProgramCacheKey()).toBe(key);
      keys.add(material.customProgramCacheKey());
    };
    expectKey(track(createTree3aLeafMaterial()), 'tree3a:leaf+dither');
    expectKey(track(createTree3aLeafMaterial('mid')), 'tree3a:leaf:mid+dither');
    expectKey(track(createTree3aLeafMaterial('low')), 'tree3a:leaf:low+dither');
    expectKey(track(createTree3aBarkMaterial()), 'tree3a:bark+dither');
    expectKey(track(createTree3aBarkMaterial('mid')), 'tree3a:bark:mid+dither');
    expectKey(track(createTree3aBarkMaterial('low')), 'tree3a:bark:low+dither');
    expectKey(track(createTree3aLeafDepthMaterial()), 'tree3a:leaf-depth');
    expectKey(track(createTree3aLeafDepthMaterial('mid')), 'tree3a:leaf-depth:mid');
    expectKey(track(createTree3aLeafDepthMaterial('low')), 'tree3a:leaf-depth:low');
    expect(keys.size).toBe(9); // 配方变即键变——分档间不共享 program
  });

  it('叶 Mid：去叶脉三线 + 叶团斑块；SDF 全形/透光/叶背/hue·luma/shade 保留', () => {
    const { fragmentShader } = assemble(track(createTree3aLeafMaterial('mid')), THREE.ShaderLib.physical);
    for (const gone of ['t3aVeinMid', 't3aVeinFlank', 't3aVeinLat', 't3aClump']) {
      expect(fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).not.toContain('(t3aClump - 0.5) * 0.08'); // 糙度注入同步去叶团项
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0'); // 透光保留
    expect(fragmentShader).toContain('t3aTransVar');
    expect(fragmentShader).toContain('float(gl_FrontFacing)'); // 叶背粉绿保留
    expect(fragmentShader).toContain('vec3 t3aHue'); // hue·luma 逐叶变奏保留
    expect(fragmentShader).toContain('float t3aLuma');
    expect(fragmentShader).toContain('(0.76 + 0.24 * t3aShade)'); // 冠内竖向自遮蔽保留
    expect(fragmentShader).toContain('t3aEar'); // SDF 全形（倒卵形+裂+耳+齿）保留
    expect(fragmentShader).toContain('t3aTooth');
    expect(fragmentShader).toContain('t3aP.y * 42.0'); // 锯齿噪声维持（Mid 唯一 vnoise 采样）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 锯齿 1（叶团去采样）= 1× vnoise = 3× 口径
  });

  it('叶 Low：TREE3A_LEAF_SDF_LOW（倒卵形+5 对裂，与 High 包络/裂项逐字同源）片元零噪声采样；去叶脉/叶团/透光；hue·luma/shade/叶背保留', () => {
    const { fragmentShader } = assemble(track(createTree3aLeafMaterial('low')), THREE.ShaderLib.physical);
    for (const gone of ['t3aTooth', 't3aSerr', 't3aEar']) {
      expect(fragmentShader, `Low SDF 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('float t3aEdge = t3aMargin - abs(t3aP.x);'); // Low SDF 边界式（无耳/齿/锯齿附加项）
    expect(fragmentShader).toContain('pow(clamp(t3aP.y, 0.001, 0.999), 1.4)'); // 倒卵形包络与 High 逐字同源
    expect(fragmentShader).toContain('t3aP.y * 31.42'); // 5 对圆裂与 High 逐字同源（档间叶形身份一致）
    // 片元零噪声采样：facVnoise 出现次数 = 库内 3（定义 1 + facFbm2 体内 2——未被调用，
    // 编译器死码消除，运行时零采样执行）
    expect(count(fragmentShader, 'facVnoise(')).toBe(3);
    for (const gone of ['t3aVeinMid', 't3aVeinLat', 't3aClump', 't3aTransVar', 'vec3(0.62, 0.94, 0.34)']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(count(fragmentShader, '#include <opaque_fragment>')).toBe(1); // 透光不注入但锚点原句不动
    expect(fragmentShader).toContain('float(gl_FrontFacing)'); // 叶背保留
    expect(fragmentShader).toContain('(0.76 + 0.24 * t3aShade)'); // shade 保留
    expect(fragmentShader).toContain('vec3 t3aHue'); // hue·luma 保留
  });

  it('皮 Mid：去节疤（核带 + 愈伤环）；脊沟/板块/苔痕保留', () => {
    const { fragmentShader } = assemble(track(createTree3aBarkMaterial('mid')), THREE.ShaderLib.physical);
    for (const gone of ['t3aBarkKnotF', 't3aBarkKnot', 't3aBarkRim']) {
      expect(fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).not.toContain('t3aBarkKnot * 0.09'); // 糙度节疤项去
    expect(fragmentShader).toContain('t3aBarkWarp'); // 脊线游走保留
    expect(fragmentShader).toContain('0.44 + 0.56 * t3aBarkTri * t3aBarkTri * t3aBarkTri'); // tri³ 剖面保留
    expect(fragmentShader).toContain('t3aBarkPlate'); // 板块保留
    expect(fragmentShader).toContain('t3aBarkMoss'); // 苔痕保留
    expect(fragmentShader).toContain('smoothstep(0.08, 0.72, t3aBarkTri)'); // 沟内 AO 保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 脊线游走 + 板块 = 2× vnoise
  });

  it('皮 Low：脊沟保留（游走 vnoise + tri³ + 沟内 AO）；去板块采样/节疤/苔痕（板块均值化常量乘子）', () => {
    const { fragmentShader } = assemble(track(createTree3aBarkMaterial('low')), THREE.ShaderLib.physical);
    for (const gone of ['t3aBarkPlate', 't3aBarkKnot', 't3aBarkMoss']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('t3aBarkWarp'); // 脊线游走保留（Low 唯一 vnoise 采样）
    expect(fragmentShader).toContain('0.44 + 0.56 * t3aBarkTri * t3aBarkTri * t3aBarkTri'); // tri³ 深沟剖面
    expect(fragmentShader).toContain('smoothstep(0.08, 0.72, t3aBarkTri)'); // 沟内冷灰 AO
    expect(fragmentShader).toContain('t3aBarkRidge * vec3(0.985, 0.965, 0.94)'); // 板块均值化常量乘子 = plate mix 两端中点（值噪声均值 0.5 保均）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 脊线游走 1 = 1× vnoise = 3× 口径
  });

  it('深度分档：Mid 与 High 的 SDF 段同源一致；Low 用 Low SDF（表面/影裁切档内一致）', () => {
    const high = assemble(track(createTree3aLeafDepthMaterial()), THREE.ShaderLib.depth);
    const mid = assemble(track(createTree3aLeafDepthMaterial('mid')), THREE.ShaderLib.depth);
    const low = assemble(track(createTree3aLeafDepthMaterial('low')), THREE.ShaderLib.depth);
    const highSdf = sdfOf(high.fragmentShader);
    expect(sdfOf(mid.fragmentShader)).toBe(highSdf); // Mid 深度 = High SDF（Mid 表面与 High 同源全形）
    expect(highSdf).toContain('t3aEar'); // 全形标志（耳/齿在位）
    expect(highSdf).toContain('t3aTooth');
    const lowSdf = sdfOf(low.fragmentShader);
    expect(lowSdf).not.toContain('t3aEar'); // Low SDF 去耳/齿/锯齿
    expect(lowSdf).not.toContain('t3aTooth');
    expect(lowSdf).toContain('float t3aEdge = t3aMargin - abs(t3aP.x);');
    // 表面/影档内一致：叶 Low 表面 SDF === 深度 Low SDF；叶 Mid 表面 SDF === High 全形 SDF
    const lowSurface = assemble(track(createTree3aLeafMaterial('low')), THREE.ShaderLib.physical);
    const midSurface = assemble(track(createTree3aLeafMaterial('mid')), THREE.ShaderLib.physical);
    expect(sdfOf(lowSurface.fragmentShader)).toBe(lowSdf);
    expect(sdfOf(midSurface.fragmentShader)).toBe(highSdf);
    expect(count(low.fragmentShader, 'facVnoise(')).toBe(3); // Low 深度零采样（库内 3）
  });

  it('风动三档同源：叶/皮三档顶点 GLSL 全文一致（TREE3A_WIND 同一常量——档间相位一致 = 身份一致）', () => {
    const leafHigh = assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createTree3aBarkMaterial()), THREE.ShaderLib.physical);
    for (const level of ['mid', 'low'] as const) {
      const leaf = assemble(track(createTree3aLeafMaterial(level)), THREE.ShaderLib.physical);
      const bark = assemble(track(createTree3aBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(leaf.vertexShader).toBe(leafHigh.vertexShader);
      expect(bark.vertexShader).toBe(barkHigh.vertexShader);
    }
  });

  it('分档底参契约不因档破：叶三档 alphaTest/alphaToCoverage/DoubleSide/USE_UV/零贴图；皮 FrontSide；深度 alphaTest', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const leaf = track(createTree3aLeafMaterial(level));
      const bark = track(createTree3aBarkMaterial(level));
      const depth = track(createTree3aLeafDepthMaterial(level));
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
    for (const make of [createTree3aLeafMaterial, createTree3aBarkMaterial]) {
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
  it('叶/皮/深度三键互异；两次调用材质对象不同但键相同', () => {
    const leafA = track(createTree3aLeafMaterial());
    const leafB = track(createTree3aLeafMaterial());
    const barkA = track(createTree3aBarkMaterial());
    const barkB = track(createTree3aBarkMaterial());
    const depth = track(createTree3aLeafDepthMaterial());
    expect(leafA).not.toBe(leafB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(leafA.customProgramCacheKey()).toBe(leafB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([leafA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
  });

  it('底参与侧向：叶 DoubleSide/缎面糙度/USE_UV；皮 FrontSide/高糙度/USE_UV', () => {
    const leaf = track(createTree3aLeafMaterial());
    const bark = track(createTree3aBarkMaterial());
    expect(leaf.side).toBe(THREE.DoubleSide);
    expect(leaf.metalness).toBe(0);
    expect(leaf.roughness).toBeGreaterThan(0.75); // 叶面微缎面（不进塑料区间）
    expect(leaf.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.FrontSide);
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeGreaterThanOrEqual(0.9); // 高糙哑光
    expect(bark.map).toBeNull();
    expect(leaf.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
  });
});

describe('成本记账（10 万实例每像素预算：叶 ≤10× / 皮 ≤6×，hash21=1×/vnoise=3×）', () => {
  it('facVnoise 调用数：叶片元 2 处（6×）、皮 2 处（6×）、深度 1 处；顶点零噪声（库内 3 处为定义+未使用的 facFbm2 调用）', () => {
    const leaf = assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createTree3aBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createTree3aLeafDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(leaf.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（锯齿 + 叶团斑块）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（脊线游走 + 板块）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（锯齿）
    expect(count(leaf.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin/cos
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零循环/零纹理采样（配方确定性纯函数 + SDF 纯 ALU）', () => {
    const shaders = [
      assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical),
      assemble(track(createTree3aBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createTree3aLeafDepthMaterial()), THREE.ShaderLib.depth),
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
  it('片元 map_fragment 摘除 → 叶/皮/深度均抛「注入点缺失」', () => {
    for (const make of [createTree3aLeafMaterial, createTree3aBarkMaterial, createTree3aLeafDepthMaterial]) {
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
    const leaf = track(createTree3aLeafMaterial());
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

    const depth = track(createTree3aLeafDepthMaterial());
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
    const bark = track(createTree3aBarkMaterial());
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

    const leaf = track(createTree3aLeafMaterial());
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

    const leaf = assemble(track(createTree3aLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createTree3aBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createTree3aLeafDepthMaterial()), THREE.ShaderLib.depth);
    for (const shader of [leaf, bark]) {
      expect(braceDelta(expandIncludes(shader.fragmentShader))).toBe(pristinePhysicalFragment);
      expect(braceDelta(shader.vertexShader)).toBe(pristinePhysicalVertex);
    }
    expect(braceDelta(expandIncludes(depth.fragmentShader))).toBe(pristineDepthFragment);
    expect(braceDelta(depth.vertexShader)).toBe(pristineDepthVertex);
  });
});

describe('TimeUniformService.freeze/unfreeze（008.3 锚点取证：冻结风相位）', () => {
  it('冻结忽略时间戳（时钟停走）；解冻恢复累计（不回补冻结期间时长）；幂等', () => {
    const clock = new TimeUniformService();
    clock.advance(1000);
    clock.advance(2000); // elapsed = 1
    clock.freeze();
    clock.freeze(); // 幂等
    expect(clock.advance(9000)).toBeCloseTo(1, 10); // 冻结：忽略时间戳
    expect(clock.elapsed).toBeCloseTo(1, 10);
    clock.unfreeze();
    clock.unfreeze(); // 幂等
    clock.advance(2500); // 从 last=2000 续走 0.5s（不回补冻结期间 7s）
    expect(clock.elapsed).toBeCloseTo(1.5, 10);
  });

  it('冻结期间广播仍写当前值（uTime 常量——树静止）；材质对象兼容', () => {
    const clock = new TimeUniformService();
    clock.advance(0);
    clock.advance(500); // 0.5
    clock.freeze();
    clock.advance(2000); // 忽略
    const material = track(createTree3aLeafMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});

describe('资产换装（asset_tree_3a 双材质组）', () => {
  it('build() 材质组序 [皮, 叶]：键/侧向/uTime 接线与工厂一致', () => {
    const source = build();
    built.push(source);
    const mats = (Array.isArray(source.material) ? source.material : [source.material]) as THREE.MeshStandardMaterial[];
    expect(mats).toHaveLength(2);
    expect(mats[0]!.customProgramCacheKey()).toBe('tree3a:bark+dither'); // 组 0 树皮
    expect(mats[1]!.customProgramCacheKey()).toBe('tree3a:leaf+dither'); // 组 1 叶卡（契约序）
    expect(mats[0]!.side).toBe(THREE.FrontSide);
    expect(mats[1]!.side).toBe(THREE.DoubleSide);
    expect(materialUniformsOf(mats[0]!).uTime).toBeDefined();
    expect(materialUniformsOf(mats[1]!).uTime).toBeDefined();
  }, 30000);
});
