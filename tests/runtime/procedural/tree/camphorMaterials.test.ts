/**
 * tests/runtime/procedural/tree/camphorMaterials.test.ts —— 香樟叶/树皮/深度材质测试
 * （T011.2，对称 celtisMaterials.test.ts 范式：真实 THREE.ShaderLib 源组装，静态字符串
 * 断言，零 WebGL；build()/资产入口归并行几何 agent 的资产测试，此处不覆盖）。
 *
 * 覆盖：
 * - uTime 接线（TimeUniformService 消费协议）：叶/皮材质挂材质级 uniforms.uTime（own
 *   property）；onBeforeCompile 后 shader.uniforms.uTime 与材质级同对象引用；GLSL 声明
 *   uniform float uTime；材质挂场景被服务逐帧驱动（frame 写值闭环）；
 * - 风动契约（D19.7）：aSeed/aBend/aLeafRand 顶点 attribute 声明存在；相位 = fract(sin(...))
 *   类 hash（aSeed=0 缺省属性路径退化为常数相位，全源零除 aSeed——无 NaN）；整树缓摆项
 *   叶/皮同公式（同串出现）；叶片快颤层含 aBend 权重（树皮组恒 0 天然免颤）；
 * - instanceColor 乘算链安全：注入后 <color_fragment> 原句恰一次、注入代码零 vColor 介入；
 * - SDF 叶形与透光：alphaTest 0.5 + alphaToCoverage；片元含 cmpLeafAlpha 计算式与 alpha
 *   写入；深度材质（叶影裁切）含同一 SDL 函数（单一来源）+ RGBADepthPacking + 树皮组守卫
 *   （aLeafRand=0 实心）+ USE_UV + alphaTest；透光项存在且 NUM_DIR_LIGHTS 守卫；风动不进
 *   depth pass；
 * - 物种配方锚定（Spec docs/research/camphor-reference.md 1.0）：卵状椭圆包络指数 0.90
 *   （最宽点 v≈0.46 近中部微偏基——vs 朴树 0.76→0.40 偏基 / 夏栎 1.4→0.61 倒卵形三分化，
 *   JS 数值锚 0.5^(1/0.90)）/先端急尖变指数收口 mix(0.80,1.10)（基部宽楔至近圆）/无基部
 *   偏斜项（Spec 无偏斜记载——vs 朴树 0.012 漂移）/全缘（无齿载波通道 + SDF 零噪声引用
 *   ——「有时微波状」记档不做）/离基三出脉（离基点 v=0.10 分离 + 斜展 + 先端前吻合 +
 *   弱二级脉 0.28 起）/脉腋腺窝（叶背暗点对 + gl_FrontFacing 门控——决定做记档；上面
 *   隆起不做）/两面区分叶背灰绿粉感 ×(1.06,1.05,1.16) + 背面糙度 +0.16 哑光差（晦暗走
 *   光泽差）/透光弱化峰值 0.22（vs 朴树 0.30——革质透光更弱）/透射色浓绿基调 (0.46,0.84,
 *   0.36)/叶底色 #33612e 浓绿-深绿（较朴树 #5a8340 更深更冷）/革质光泽 roughness 0.50
 *   （vs 朴树 0.72——Step 4b 校准 0.62→0.50：视觉三帧读作偏哑光，Spec §5 有光泽）；皮底色 #6e6352 黄褐-灰褐（暖于朴树 #7a746a——黄褐读向）/纵裂深沟
 *   tri² 剖面沟底 0.50（vs 朴树 0.76 浅裂 / 夏栎 0.44 深沟）+ 7 宽脊（vs 朴树 9）+ 裂线
 *   游走更缓（warp 0.75——纵向连续长沟）/局部横断块状感（sin 峰带 × 块斑门控，加深 22%）/
 *   干上部弱化门控（幅度小于朴树）+ 微提亮 1.04/苔藓沟底门控（香樟特有通道）+ 强度 0.50；
 * - 深度材质零噪声库注入（全缘 SDF 零 facVnoise 引用 → 影 pass 不吃噪声纪律的更优满足）；
 * - 分档实装（level 参数，缺省 'high'）：三工厂缺省 ≡ 显式 'high'（属性 + 键 + GLSL 全文
 *   逐位相等）；3 工厂 × 3 档 = 9 键互异 + 与 celtis 9 键零碰撞（camphor 前缀不混缓存）；
 *   叶 Mid 去叶脉三件/腺窝/叶团（SDF 全形/透光/叶背/hue·luma/shade 保留）、Low 再去透光；
 *   皮 Mid 去苔藓、Low 去块斑采样/横断/上部提亮（均值化常量乘子）；深度三档 SDF 档位坍缩
 *   （High 本已零噪声全形——同一字符串平凡成立，表面/影档内一致）；风动三档顶点 GLSL
 *   同源；分档底参契约（alphaTest/侧向/USE_UV）不因档破；uTime 桥接三档不缺位；
 * - program 键纪律：叶/皮/深度三键互异；两次工厂调用材质对象不同（无模块级共享，D17）但
 *   键相同；uniforms 不跨实例共享；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：叶片元 facVnoise 调用 1 处
 *   （叶团斑块——全缘免齿噪声；另 3 处为库定义）= 3×、皮 2 处 = 6×、深度 0 处（零噪声库
 *   注入）；顶点零噪声；全源零循环/零纹理采样；
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
  createCamphorBarkMaterial,
  createCamphorLeafDepthMaterial,
  createCamphorLeafMaterial,
} from '../../../../src/runtime/procedural/tree/camphor/camphorMaterials';
import {
  createCeltisBarkMaterial,
  createCeltisLeafDepthMaterial,
  createCeltisLeafMaterial,
} from '../../../../src/runtime/procedural/tree/celtis/celtisMaterials';

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

/** 提取注入后的 cmpLeafAlpha 函数全文（SDF 单一来源比对用；首个 \n} 即函数闭合） */
const sdfOf = (fragmentShader: string): string => {
  const start = fragmentShader.indexOf('float cmpLeafAlpha(vec2 cmpUv, float cmpRand)');
  expect(start).toBeGreaterThanOrEqual(0);
  const end = fragmentShader.indexOf('\n}', start);
  return fragmentShader.slice(start, end + 2);
};

afterEach(() => {
  for (const material of created.splice(0)) material.dispose();
});

describe('uTime 接线（TimeUniformService 消费协议）', () => {
  it('叶/皮材质挂材质级 uniforms.uTime；编译后 shader.uniforms.uTime 同引用；GLSL 声明 uniform', () => {
    for (const material of [track(createCamphorLeafMaterial()), track(createCamphorBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('材质挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const leaf = track(createCamphorLeafMaterial());
    const bark = track(createCamphorBarkMaterial());
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

describe('风动契约（D19.7：uTime 全局风帧 / aSeed 个体相位；公式沿朴树数值微调记档）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）', () => {
    const leaf = assemble(track(createCamphorLeafMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(leaf.vertexShader).toContain(decl);
    }
    expect(leaf.vertexShader).toContain('fract(sin(aSeed * 79.193'); // 整树缓摆相位 = hash(aSeed)——常数换朴树 78.233 去相关
    expect(leaf.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 49.337'); // 快颤相位 = hash(aSeed+叶身份)
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(leaf.vertexShader + leaf.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('整树缓摆叶/皮同公式（同串出现）；叶片快颤层含 aBend 权重；树高锚 8m（×0.125）', () => {
    const leaf = assemble(track(createCamphorLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createCamphorBarkMaterial()), THREE.ShaderLib.physical);
    const swayCore = 'cmpWindH * cmpWindH * 0.045 * sin(uTime * 1.15';
    expect(leaf.vertexShader).toContain(swayCore);
    expect(bark.vertexShader).toContain(swayCore); // 皮不动叶动会撕裂穿帮——同公式同相位
    expect(leaf.vertexShader).toContain('aBend * 0.011'); // 快颤权重 = aBend（树皮组恒 0 天然免颤）
    expect(leaf.vertexShader).toContain('position.y * 0.125'); // /8m 锚点树高（香樟目标 ≈8m，D19.7）
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createCamphorLeafMaterial()), track(createCamphorBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('SDF 叶形与透光', () => {
  it('alphaTest 0.5 + alphaToCoverage；片元含 SDF 计算式并写入 alpha', () => {
    const material = track(createCamphorLeafMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float cmpLeafAlpha('); // 叶形 SDF 函数（单一来源）
    expect(fragmentShader).toContain('cmpLeafAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = cmpAlpha;'); // alphatest_fragment 上游写入
  });

  it('深度材质（叶影裁切）：同一 SDF 函数 + RGBADepthPacking + 树皮组守卫实心 + USE_UV + alphaTest；风动不进 depth；零噪声库注入', () => {
    const material = track(createCamphorLeafDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.depthPacking).toBe(THREE.RGBADepthPacking);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('cmpLeafAlpha(vUv, vLeafRand)');
    expect(shader.fragmentShader).toContain('step(0.0001, vLeafRand)'); // 皮组 aLeafRand=0 → 实心（圆柱 uv 域不误裁）
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
    expect(count(shader.fragmentShader, 'facVnoise(')).toBe(0); // 零噪声库注入——全缘 SDF 零噪声引用（影 pass 不吃噪声的更优满足）
    expect(shader.fragmentShader).not.toContain('facHash21'); // 噪声库整体未挂（SDF 引入噪声即编译暴雷——保护性约束）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫（无平行光场景安全降级）', () => {
    const { fragmentShader } = assemble(track(createCamphorLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(fragmentShader).toContain('directionalLights[0]');
    expect(fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
  });
});

describe('物种配方锚定（Spec camphor-reference 1.0 §2/§4/§5/§7）', () => {
  it('卵状椭圆包络（v^0.90，最宽点 v≈0.46 近中部微偏基——三树三分化 JS 数值锚）+ 先端急尖/基部宽楔变指数收口；深度 SDF 单一来源同步', () => {
    const leaf = assemble(track(createCamphorLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('pow(clamp(cmpP.y, 0.001, 0.999), 0.90)'); // 卵状椭圆包络指数（Spec §4 Verified [1][2][6] + 终审「最宽中部」）
    // JS 数值锚：最宽点 = 0.5^(1/p)——香樟 0.46 夹在朴树 0.40（偏基卵形）与夏栎 0.61（倒卵形）之间、近中部微偏基
    const widest = (p: number): number => Math.pow(0.5, 1 / p);
    expect(widest(0.90)).toBeGreaterThan(0.44);
    expect(widest(0.90)).toBeLessThan(0.48);
    expect(widest(0.90)).toBeGreaterThan(widest(0.76)); // > 朴树 0.40
    expect(widest(0.90)).toBeLessThan(widest(1.4)); // < 夏栎 0.61
    expect(leaf.fragmentShader).toContain('mix(0.80, 1.10, smoothstep(0.45, 0.95, cmpP.y))'); // 基部宽楔 0.80 → 先端急尖 1.10（Spec §4 Verified [1][2][5]——vs 朴树 0.70/1.15）
    expect(leaf.fragmentShader).not.toContain('cmpP.x -= '); // 无基部偏斜项（Spec 无香樟偏斜记载——vs 朴树 0.012 漂移）
    const depth = assemble(track(createCamphorLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(sdfOf(depth.fragmentShader)).toBe(sdfOf(leaf.fragmentShader)); // SDF 单一来源——影裁切叶形自动同步
  });

  it('全缘（三树首个全缘叶种——身份核心）：无齿载波通道/无齿门控/无齿噪声/SDF 零噪声引用；「有时微波状」记档不做', () => {
    const leaf = assemble(track(createCamphorLeafMaterial()), THREE.ShaderLib.physical);
    for (const gone of ['cmpTooth', 'cmpSerr', 'cmpGate', '56.55', '* 0.060', 'cmpP.y * 60.0']) {
      expect(leaf.fragmentShader, `全缘叶不应含 ${gone}`).not.toContain(gone); // 朴树齿载波/门控/噪声常数不串种
    }
    expect(leaf.fragmentShader).toContain('float cmpEdge = 0.5 * cmpEnv - abs(cmpP.x);'); // 全缘边界式（无任何边缘附加项）
    expect(sdfOf(leaf.fragmentShader)).not.toContain('facVnoise'); // SDF 零噪声引用（深度材质不挂噪声库的前提）
    expect(leaf.fragmentShader).toContain('clamp(cmpEdge / 0.04 + 0.5'); // 坡宽 0.04 沿朴树 Step 4 AA 口径
  });

  it('离基三出脉（身份核心，vs 朴树三出脉自叶基）：离基点 v=0.10 分离 + 斜展上行 + 先端前吻合 + 弱二级脉', () => {
    const { fragmentShader } = assemble(track(createCamphorLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float cmpTriPath = 0.42 * pow(max(cmpP.y - 0.10, 0.0), 0.55) * (1.0 - 0.52 * cmpP.y);'); // 离基侧脉轨迹（max(v−0.10,0)：v≤0.10 贴中脉，离基点分离——Spec §4 Verified [1][2][3][4][6]）
    const departure = Number('0.10');
    expect(departure).toBeGreaterThanOrEqual(0.08); // 离基点域 v≈0.1–0.2（照片判读 + 终审「自中脉近基部斜出」）
    expect(departure).toBeLessThanOrEqual(0.22);
    expect(fragmentShader).toContain('abs(abs(cmpP.x) - cmpTriPath)'); // 两侧对称一对（±|x| 距离场）
    expect(fragmentShader).toContain('1.0 - smoothstep(0.012, 0.040, abs(cmpP.x))'); // 中脉亮带（朴树 Step 4b 平顶加宽口径）
    expect(fragmentShader).toContain('smoothstep(0.06, 0.14, cmpP.y) * (1.0 - smoothstep(0.80, 0.92, cmpP.y))'); // 离基点渐显、先端前吻合渐隐
    expect(fragmentShader).toContain('smoothstep(0.28, 0.42, cmpP.y) * (1.0 - smoothstep(0.72, 0.90, cmpP.y))'); // 二级脉门控（位于离基对上方——Spec §4「上部每边侧脉 1–3–5(–7) 条」）
    expect(fragmentShader).toContain('cmpVeinMid * 1.00 + cmpVeinTri * 0.78 + cmpVeinLat * 0.16'); // 离基对身份核心权重 0.78（≥朴树 0.75）；二级脉 0.16 守背景弱层
    expect(fragmentShader).toContain('vec3(1.58, 1.36, 1.02)'); // 脉色（可见度按朴树 Step 4b sRGB 压缩教训定标——R 主推抗 G 裁切）
  });

  it('脉腋腺窝（决定做记档）：叶背暗点对 + gl_FrontFacing 门控仅背面；上面隆起不做', () => {
    const { fragmentShader } = assemble(track(createCamphorLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float cmpDomatia'); // 腺窝因子（离基侧脉与中脉交角腋窝处 v≈0.15、|x|≈0.055——Spec §4 Verified [1][2][6]）
    expect(fragmentShader).toContain('vec3(0.70, 0.74, 0.66)'); // 暗灰绿点（窝内柔毛读向）
    expect(fragmentShader).toContain('cmpDomatia * (1.0 - float(gl_FrontFacing))'); // 仅叶背（上面隆起不做记档——弱浮雕读向让位强暗点读向）
    expect(fragmentShader).not.toContain('DomatiaDome'); // 上面隆起不实现
  });

  it('两面区分：叶背灰绿粉感 glaucous ×(1.06,1.05,1.16)（强于朴树）+ 背面糙度 +0.16 哑光差（晦暗走光泽差）；深度材质不吃面色', () => {
    const leaf = assemble(track(createCamphorLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('float(gl_FrontFacing)'); // WebGL2 内建双面判定
    expect(leaf.fragmentShader).toContain('mix(vec3(1.06, 1.05, 1.16), vec3(1.0), float(gl_FrontFacing))'); // 灰绿粉感：R/G 靠拢去饱和 + B 抬升冷灰（Spec §5 Verified [1][2][5][6]；vs 朴树 ×(1.02,1.00,1.10) 幅度更强）
    expect(leaf.fragmentShader).toContain('(1.0 - float(gl_FrontFacing)) * 0.16'); // 叶背晦暗走光泽差（背面糙度 +0.16 哑光——革质两面差大于朴树 +0.12）
    const depth = assemble(track(createCamphorLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).not.toContain('gl_FrontFacing'); // 深度 pass 只裁 alpha，无面色语义
  });

  it('背光透射弱化：峰值 0.22 < 朴树 0.30（革质透光更弱）；透射色浓绿基调', () => {
    const { fragmentShader } = assemble(track(createCamphorLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('* pow(cmpBack, 3.0) * cmpTransVar * cmpAlpha * 0.22;');
    expect(fragmentShader).toContain('vec3(0.46, 0.84, 0.36)'); // 浓绿基调透射色（vs 朴树 (0.58,0.90,0.38) 偏黄）
    expect(0.22).toBeLessThan(0.30); // 峰值带：≤朴树顶格（任务书纪律）
    expect(fragmentShader).not.toContain('* 0.30;'); // 朴树峰值不串种
    expect(fragmentShader).not.toContain('* 0.65;'); // 夏栎峰值不串种
  });

  it('叶底色 #33612e 浓绿-深绿（较朴树 #5a8340 更深更冷：G−B 蓝差收窄、亮度更低）；革质光泽 roughness 0.50', () => {
    const leaf = track(createCamphorLeafMaterial());
    const hex = leaf.color.getHex();
    expect(hex).toBe(0x33612e); // 工程设定：冠层照浓绿 75–85% 基调 + 叶照上面深绿交叉（Spec §5 冠层色域 Verified [5][6]）
    const [r, g, b] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
    expect(g - b).toBe(51); // 朴树 G−B = 67——香樟蓝差更小（更深更冷的浓绿）
    expect(r - g).toBe(-46); // 与夏栎同冷量级（朴树 -41 更暖黄）
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    expect(luma([r, g, b])).toBeLessThan(luma([0x4e, 0x7c, 0x33])); // 深于夏栎
    expect(luma([r, g, b])).toBeLessThan(luma([0x5a, 0x83, 0x40])); // 深于朴树（「亮于朴树」由 specular 承担——革质光泽）
    expect(leaf.roughness).toBe(0.50); // 革质亮泽（Spec §5「近革质至革质」+「有光泽」Verified [1][2][5][6]；vs 朴树 0.72——Step 4b 校准 0.62→0.50，见测试头记档）
    expect(leaf.metalness).toBe(0);
  });

  it('皮底色 #6e6352 黄褐-灰褐（暖于朴树 #7a746a——黄褐读向）；纵裂深沟 tri² 剖面沟底 0.50 + 7 宽脊 + 游走更缓', () => {
    const bark = track(createCamphorBarkMaterial());
    const hex = bark.color.getHex();
    expect(hex).toBe(0x6e6352); // 工程设定：文献「黄褐色」+ 照片灰褐脊面两读向折中（Spec §5 bark_color Verified [1][2][6]）
    const [r, g, b] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
    expect(r - g).toBe(11); // 朴树 R−G = 6——香樟更暖（黄褐读向，文献主调）
    expect(g - b).toBe(17);
    const { fragmentShader } = assemble(track(createCamphorBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('0.50 + 0.50 * cmpBarkTri * cmpBarkTri'); // 纵裂深沟：沟底 0.50（vs 朴树 0.76 浅裂——对比显著强于；缓于夏栎 0.44）
    expect(fragmentShader).toContain('vUv.x * 7.0 + cmpBarkWarp * 0.75'); // 7 宽脊 + 游走 0.75（纵向连续长沟——vs 朴树 9 脊 warp 1.1）
    expect(fragmentShader).not.toContain('0.76 + 0.24'); // 朴树浅裂常数不串种
    expect(fragmentShader).not.toContain('0.44 + 0.56'); // 夏栎深沟常数不串种
  });

  it('局部横断块状感（四照一致 Verified [6]）：sin 峰带 × 块斑门控横断，加深 22%', () => {
    const { fragmentShader } = assemble(track(createCamphorBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('sin(vUv.y * 31.4 + cmpBarkWarp * 5.0)'); // 水平暗裂载波（游走调制去规则感）
    expect(fragmentShader).toContain('smoothstep(0.35, 0.65, cmpBarkBlock)'); // 块斑中带门控（局部性）
    expect(fragmentShader).toContain('cmpBarkRidge *= 1.0 - cmpBarkCut * 0.22;'); // 横断处脊沟加深——纵长沟切分成块状感
    expect(fragmentShader).toContain('vec2(vUv.x * 10.0, vUv.y * 3.4)'); // 竖长块斑（u 密 v 疏——纵向长块）
  });

  it('干上部裂深弱化（幅度小于朴树——樟纵裂中龄即充分发育）+ 微提亮 + 糙度回落', () => {
    const { fragmentShader } = assemble(track(createCamphorBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float cmpBarkSmooth = smoothstep(1.2, 4.2, vTreePos.y);'); // 小枝圆柱平滑读向（Spec §4 twig_surface Verified [1][2]）
    expect(fragmentShader).toContain('0.86 + 0.14 * cmpBarkTri * cmpBarkTri'); // 上部弱化剖面（朴树 0.93+0.07——香樟上干仍裂）
    expect(fragmentShader).toContain('1.0 + 0.04 * cmpBarkSmooth'); // 上部微提亮（幅度小于朴树 0.07）
    expect(fragmentShader).toContain('- cmpBarkSmooth * 0.05'); // 上部糙度回落（淡褐小枝微光）
  });

  it('苔藓少量集中沟底干下（香樟特有沟底门控通道）：高度门控 + 噪声带 + 沟底门控 + 方位门控；强度 0.50', () => {
    const { fragmentShader } = assemble(track(createCamphorBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('(1.0 - smoothstep(1.4, 3.2, vTreePos.y))'); // 树干下段集中（Spec §5 Verified [6]）
    expect(fragmentShader).toContain('smoothstep(0.60, 0.84'); // 噪声高带收紧（覆盖度低）
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.15, 0.55, cmpBarkTri))'); // 沟底门控（「集中沟壑深处」——vs 朴树无此通道，香樟特有）
    expect(fragmentShader).toContain('cmpBarkMoss * 0.50'); // 强度 0.50（朴树 0.55）
    expect(fragmentShader).toContain('vec3(0.80, 0.95, 0.66)'); // 灰绿苔藓读向
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
      [track(createCamphorLeafMaterial()), track(createCamphorLeafMaterial('high')), THREE.ShaderLib.physical],
      [track(createCamphorBarkMaterial()), track(createCamphorBarkMaterial('high')), THREE.ShaderLib.physical],
      [track(createCamphorLeafDepthMaterial()), track(createCamphorLeafDepthMaterial('high')), THREE.ShaderLib.depth],
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
    expectKey(track(createCamphorLeafMaterial()), 'camphor:leaf');
    expectKey(track(createCamphorLeafMaterial('mid')), 'camphor:leaf:mid');
    expectKey(track(createCamphorLeafMaterial('low')), 'camphor:leaf:low');
    expectKey(track(createCamphorBarkMaterial()), 'camphor:bark');
    expectKey(track(createCamphorBarkMaterial('mid')), 'camphor:bark:mid');
    expectKey(track(createCamphorBarkMaterial('low')), 'camphor:bark:low');
    expectKey(track(createCamphorLeafDepthMaterial()), 'camphor:leaf-depth');
    expectKey(track(createCamphorLeafDepthMaterial('mid')), 'camphor:leaf-depth:mid');
    expectKey(track(createCamphorLeafDepthMaterial('low')), 'camphor:leaf-depth:low');
    expect(keys.size).toBe(9);
  });

  it('与 celtis 9 键零碰撞（camphor 前缀不与 celtis 混缓存）', () => {
    const celtisKeys = new Set(
      [
        track(createCeltisLeafMaterial()),
        track(createCeltisLeafMaterial('mid')),
        track(createCeltisLeafMaterial('low')),
        track(createCeltisBarkMaterial()),
        track(createCeltisBarkMaterial('mid')),
        track(createCeltisBarkMaterial('low')),
        track(createCeltisLeafDepthMaterial()),
        track(createCeltisLeafDepthMaterial('mid')),
        track(createCeltisLeafDepthMaterial('low')),
      ].map((material) => material.customProgramCacheKey()),
    );
    expect(celtisKeys.size).toBe(9);
    for (const make of [createCamphorLeafMaterial, createCamphorBarkMaterial, createCamphorLeafDepthMaterial]) {
      for (const level of ['high', 'mid', 'low'] as const) {
        expect(celtisKeys.has(track(make(level)).customProgramCacheKey())).toBe(false);
      }
    }
  });

  it('叶 Mid：去叶脉三件（中脉带/离基三出脉影/弱二级脉）+ 腺窝 + 叶团斑块；SDF 全形/透光/叶背/hue·luma/shade 保留', () => {
    const { fragmentShader } = assemble(track(createCamphorLeafMaterial('mid')), THREE.ShaderLib.physical);
    for (const gone of ['cmpVeinMid', 'cmpVeinTri', 'cmpVeinLat', 'cmpTriPath', 'cmpDomatia', 'cmpClump']) {
      expect(fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).not.toContain('(cmpClump - 0.5) * 0.06'); // 糙度注入同步去叶团项
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0'); // 透光保留
    expect(fragmentShader).toContain('cmpTransVar');
    expect(fragmentShader).toContain('float(gl_FrontFacing)'); // 叶背灰绿粉感保留
    expect(fragmentShader).toContain('vec3 cmpHue'); // hue·luma 逐叶变奏保留
    expect(fragmentShader).toContain('float cmpLuma');
    expect(fragmentShader).toContain('(0.80 + 0.20 * cmpShade)'); // 冠内竖向自遮蔽保留（地板 0.80 沿朴树口径）
    expect(fragmentShader).toContain('pow(clamp(cmpP.y, 0.001, 0.999), 0.90)'); // SDF 全形（卵状椭圆+急尖+全缘）保留
    expect(fragmentShader).toContain('float cmpEdge = 0.5 * cmpEnv - abs(cmpP.x);');
    expect(count(fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0 调用（全缘免齿噪声 + 叶团去采样——Mid 片元零噪声执行）
  });

  it('叶 Low：SDF 与 High 同一字符串（档位坍缩——High 本已零噪声全形）；去叶脉/腺窝/叶团/透光；hue·luma/shade/叶背保留；片元零噪声', () => {
    const { fragmentShader } = assemble(track(createCamphorLeafMaterial('low')), THREE.ShaderLib.physical);
    const highSdf = sdfOf(assemble(track(createCamphorLeafMaterial()), THREE.ShaderLib.physical).fragmentShader);
    expect(sdfOf(fragmentShader)).toBe(highSdf); // Low SDF === High SDF（「零噪声版」沿朴树档位纪律平凡成立——档位坍缩记档）
    for (const gone of ['cmpVeinMid', 'cmpVeinTri', 'cmpTriPath', 'cmpDomatia', 'cmpClump', 'cmpTransVar', 'vec3(0.46, 0.84, 0.36)']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(count(fragmentShader, '#include <opaque_fragment>')).toBe(1); // 透光不注入但锚点原句不动
    expect(fragmentShader).toContain('float(gl_FrontFacing)'); // 叶背保留
    expect(fragmentShader).toContain('(0.80 + 0.20 * cmpShade)'); // shade 保留
    expect(fragmentShader).toContain('vec3 cmpHue'); // hue·luma 保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(3); // 片元零噪声采样（库内 3 为死码，运行时零执行）
  });

  it('皮 Mid：去苔藓（中距不可辨）；脊沟/块斑/横断/干上部弱化保留', () => {
    const { fragmentShader } = assemble(track(createCamphorBarkMaterial('mid')), THREE.ShaderLib.physical);
    expect(fragmentShader).not.toContain('cmpBarkMoss');
    expect(fragmentShader).toContain('cmpBarkWarp'); // 裂线游走保留
    expect(fragmentShader).toContain('0.50 + 0.50 * cmpBarkTri * cmpBarkTri'); // tri² 深沟剖面保留
    expect(fragmentShader).toContain('cmpBarkBlock'); // 块斑保留
    expect(fragmentShader).toContain('cmpBarkCut'); // 横断保留（Mid 中距块状感身份）
    expect(fragmentShader).toContain('1.0 + 0.04 * cmpBarkSmooth'); // 干上部微提亮保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 裂线游走 + 块斑 = 2× vnoise
  });

  it('皮 Low：脊沟保留（游走 vnoise + tri² 深沟 + 高度门控 + 沟内冷灰 AO）；去块斑采样/横断/苔藓/上部提亮（块斑均值化常量乘子）', () => {
    const { fragmentShader } = assemble(track(createCamphorBarkMaterial('low')), THREE.ShaderLib.physical);
    for (const gone of ['cmpBarkBlock', 'cmpBarkMoss', 'cmpBarkCut']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).not.toContain('1.0 + 0.04 * cmpBarkSmooth'); // 上部提亮去（颜色次细节）
    expect(fragmentShader).toContain('cmpBarkWarp'); // 裂线游走保留（Low 唯一 vnoise 采样）
    expect(fragmentShader).toContain('0.50 + 0.50 * cmpBarkTri * cmpBarkTri'); // tri² 深沟剖面
    expect(fragmentShader).toContain('cmpBarkSmooth'); // 高度门控保留（结构剪影项——上部裂深弱化）
    expect(fragmentShader).toContain('smoothstep(0.20, 0.78, cmpBarkTri)'); // 沟内深冷灰 AO
    expect(fragmentShader).toContain('cmpBarkRidge * vec3(0.985, 0.95, 0.915)'); // 块斑均值化常量乘子 = plate mix 两端中点（值噪声均值 0.5 保均）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 裂线游走 1 = 1× vnoise = 3× 口径
  });

  it('深度分档坍缩：三档 SDF 同一字符串 + 与叶表面档内逐字一致（表面/影裁切档内一致平凡成立）；零噪声库三档不挂', () => {
    const high = assemble(track(createCamphorLeafDepthMaterial()), THREE.ShaderLib.depth);
    const mid = assemble(track(createCamphorLeafDepthMaterial('mid')), THREE.ShaderLib.depth);
    const low = assemble(track(createCamphorLeafDepthMaterial('low')), THREE.ShaderLib.depth);
    const highSdf = sdfOf(high.fragmentShader);
    expect(sdfOf(mid.fragmentShader)).toBe(highSdf); // Mid 深度 = High SDF（同源全形）
    expect(sdfOf(low.fragmentShader)).toBe(highSdf); // Low 深度 = High SDF（档位坍缩——High 本已零噪声全缘全形）
    expect(highSdf).toContain('float cmpEdge = 0.5 * cmpEnv - abs(cmpP.x);'); // 全缘边界式在位
    expect(highSdf).not.toContain('facVnoise'); // SDF 零噪声引用（深度不挂噪声库的前提）
    // 表面/影档内一致：叶表面各档 SDF === 深度各档 SDF
    for (const level of ['high', 'mid', 'low'] as const) {
      const surface = assemble(track(createCamphorLeafMaterial(level)), THREE.ShaderLib.physical);
      const depthShader = assemble(track(createCamphorLeafDepthMaterial(level)), THREE.ShaderLib.depth);
      expect(sdfOf(surface.fragmentShader)).toBe(sdfOf(depthShader.fragmentShader)); // 同一 GLSL 字符串（单一来源纪律）
      expect(count(depthShader.fragmentShader, 'facVnoise(')).toBe(0); // 三档深度零噪声库
    }
  });

  it('风动三档同源：叶/皮三档顶点 GLSL 全文一致（CAMPHOR_WIND 同一常量——档间相位一致 = 身份一致）', () => {
    const leafHigh = assemble(track(createCamphorLeafMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createCamphorBarkMaterial()), THREE.ShaderLib.physical);
    for (const level of ['mid', 'low'] as const) {
      const leaf = assemble(track(createCamphorLeafMaterial(level)), THREE.ShaderLib.physical);
      const bark = assemble(track(createCamphorBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(leaf.vertexShader).toBe(leafHigh.vertexShader);
      expect(bark.vertexShader).toBe(barkHigh.vertexShader);
    }
  });

  it('分档底参契约不因档破：叶三档 alphaTest/alphaToCoverage/DoubleSide/USE_UV/零贴图；皮 FrontSide；深度 alphaTest', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const leaf = track(createCamphorLeafMaterial(level));
      const bark = track(createCamphorBarkMaterial(level));
      const depth = track(createCamphorLeafDepthMaterial(level));
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
    for (const make of [createCamphorLeafMaterial, createCamphorBarkMaterial]) {
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
    const leafA = track(createCamphorLeafMaterial());
    const leafB = track(createCamphorLeafMaterial());
    const barkA = track(createCamphorBarkMaterial());
    const barkB = track(createCamphorBarkMaterial());
    const depth = track(createCamphorLeafDepthMaterial());
    expect(leafA).not.toBe(leafB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(leafA.customProgramCacheKey()).toBe(leafB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([leafA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
    expect(materialUniformsOf(leafA).uTime).not.toBe(materialUniformsOf(leafB).uTime); // uTime 桥接对象实例独立（dispose 安全）
    expect(materialUniformsOf(barkA).uTime).not.toBe(materialUniformsOf(barkB).uTime);
  });

  it('底参与侧向：叶 DoubleSide/革质糙度/USE_UV；皮 FrontSide/高糙哑光/USE_UV；均零贴图', () => {
    const leaf = track(createCamphorLeafMaterial());
    const bark = track(createCamphorBarkMaterial());
    expect(leaf.side).toBe(THREE.DoubleSide);
    expect(leaf.metalness).toBe(0);
    expect(leaf.roughness).toBeGreaterThan(0.4); // 革质亮叶（Step 4b 0.50——明确亮于朴树 0.72 一档以上）
    expect(leaf.roughness).toBeLessThan(0.6);
    expect(leaf.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.FrontSide);
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeGreaterThanOrEqual(0.9); // 高糙哑光
    expect(bark.map).toBeNull();
    expect(leaf.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
  });
});

describe('成本记账（10 万实例每像素预算：叶 ≤8× / 皮 ≤7.5×，hash21=1×/vnoise=3×——全缘红利）', () => {
  it('facVnoise 调用数：叶片元 1 处（3×）、皮 2 处（6×）、深度 0 处（零噪声库注入）；顶点零噪声（库内 3 处为定义+未使用的 facFbm2 调用）', () => {
    const leaf = assemble(track(createCamphorLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createCamphorBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createCamphorLeafDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(leaf.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（叶团斑块——全缘免齿噪声）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（裂线游走 + 块斑）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(0); // 深度零噪声库注入（全缘 SDF 先天满足影 pass 不吃噪声）
    expect(count(leaf.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin/cos
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零循环/零纹理采样（配方确定性纯函数 + SDF 纯 ALU）', () => {
    const shaders = [
      assemble(track(createCamphorLeafMaterial()), THREE.ShaderLib.physical),
      assemble(track(createCamphorBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createCamphorLeafDepthMaterial()), THREE.ShaderLib.depth),
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
    for (const make of [createCamphorLeafMaterial, createCamphorBarkMaterial, createCamphorLeafDepthMaterial]) {
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
    const leaf = track(createCamphorLeafMaterial());
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

    const depth = track(createCamphorLeafDepthMaterial());
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
    const bark = track(createCamphorBarkMaterial());
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

    const leaf = track(createCamphorLeafMaterial());
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

    const leaf = assemble(track(createCamphorLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createCamphorBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createCamphorLeafDepthMaterial()), THREE.ShaderLib.depth);
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
    const material = track(createCamphorLeafMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});
