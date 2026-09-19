/**
 * tests/runtime/procedural/tree/celtisMaterials.test.ts —— 朴树叶/树皮/深度材质测试
 * （T011.1，对称 tree3aMaterials.test.ts 范式：真实 THREE.ShaderLib 源组装，静态字符串
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
 * - SDF 叶形与透光：alphaTest 0.5 + alphaToCoverage；片元含 t3cLeafAlpha 计算式与 alpha
 *   写入；深度材质（叶影裁切）含同一 SDF 函数（单一来源）+ RGBADepthPacking + 树皮组守卫
 *   （aLeafRand=0 实心）+ USE_UV + alphaTest；透光项存在且 NUM_DIR_LIGHTS 守卫；风动不进
 *   depth pass；
 * - 物种配方锚定（Spec docs/research/celtis-reference.md 1.0）：卵形包络指数 0.76（最宽点
 *   ≈40% 叶长——vs 夏栎 1.4→61% 倒卵形）/先端急尖变指数收口 mix(0.70,1.15)/基部微偏斜
 *   漂移/齿限上半部门控（四源一致核心辨识）+ 圆钝齿载波 2π·9 pow² + 噪声频率 60（幅度
 *   峰值 ≤ 坡宽 0.04×75% 纪律）/三出脉基侧脉对（FOC 属级 3-veined from base）+ 中脉亮带 +
 *   弱二级脉/叶背浅灰绿 ×(1.02,1.00,1.10) + 背面糙度 +0.12 哑光差（两面「更暗淡」读向走
 *   光泽差）/透光弱化峰值 0.30（vs 夏栎 0.65——近革质透光弱）/叶底色 #5a8340（较夏栎
 *   #4e7c33 更黄更亮，R−G 暖差更大）/半光泽 roughness 0.72（vs 夏栎 0.85）；皮底色
 *   #7a746a（比夏栎 #5c534a 各通道 +30 更浅更灰）/浅裂 tri² 剖面沟底 0.76（vs 夏栎
 *   0.44+tri³ 深沟）/干上部平滑门控 + 提亮 1.07/苔藓地衣少量（噪声带收紧 + 强度 0.55）/
 *   节疤系统不实现（Spec 无朴树节疤语言）；
 * - Step 4 宏观特写校准锚定（2026-09-19 主代理视觉验收定向反馈：齿/三出脉不可辨）：齿幅度
 *   域 0.040→0.060（峰值 0.030 = 坡宽 0.04×75% 顶格）+ 坡宽 0.03→0.04（AA 软边 1.9→2.5px
 *   代价）+ 载波规则度 0.80/0.20（High/Low SDF return 同步 /0.04）；中脉带半宽 0.030 +
 *   权重 0.85、三出脉带半宽 0.040 + 权重 0.65、脉色 (1.28,1.19,0.74)（albedo 亮度差中脉
 *   16%/三出脉 12.4%）；shade 地板 0.76→0.80（MUL_HIGH/MUL_SIMPLE 同步）；透射/树皮不动；
 * - Step 4b 可见度定稿锚定（2026-09-19 主代理 256px 离屏幕像素探针：中轴 sRGB 亮度差
 *   +6.5% 低于 ≥12% 机器判据——有效线性 +15.4% 被 sRGB 编码压缩；需有效线性 ≥+29.5%）：
 *   脉色 (1.28,1.19,0.74)→(1.62,1.34,1.00)（相对亮度 1.18→1.375，R 主推抗 G 通道输出
 *   裁切）+ 中脉权 0.85→1.00 满权 + 中脉带 0.008/0.030→0.012/0.040、三出脉权 0.65→0.75
 *   + 带 0.010/0.040→0.012/0.046（tri/mid 相对关系 0.76→0.75 不破）+ 二级脉 0.18 不动
 *   （albedo 线性亮度差 中脉 37.5%/三出脉 28.1% → 探针 sRGB 自估 ≈+15%/+11.5%；校准锚：
 *   旧配方模型 +6.35% vs 实测 +6.5%）；齿门控坡 (0.42,0.56)→(0.48,0.56) 收窄（齿带严格
 *   限上半部 + 起齿更陡）；载波 pow1.8 与密度 8 评估否决记档（亚像素收益/身份漂移风险）；
 *   全部为权重/门控/常量级改动——零新增指令/采样，叶 High 11.5× 记账不变；
 * - 分档实装（level 参数，缺省 'high'）：三工厂缺省 ≡ 显式 'high'（属性 + 键 + GLSL 全文
 *   逐位相等）；3 工厂 × 3 档 = 9 键互异；叶 Mid 去叶脉三件/叶团（SDF 全形/透光/叶背/
 *   hue·luma/shade 保留）、Low 换 Low SDF（卵形+急尖+偏斜与 High 逐字同源，片元零
 *   facVnoise 调用）去透光；皮 Mid 去苔藓、Low 去板块采样/上部提亮（均值化常量乘子）；
 *   深度 Mid = High SDF 同源、Low = Low SDF（表面/影档内一致）；风动三档顶点 GLSL 同源；
 *   分档底参契约（alphaTest/侧向/USE_UV）不因档破；uTime 桥接三档不缺位；
 * - program 键纪律：叶/皮/深度三键互异；两次工厂调用材质对象不同（无模块级共享，D17）但
 *   键相同；uniforms 不跨实例共享；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：叶片元 facVnoise 调用 2 处
 *   （齿抖动+叶团斑块；另 3 处为库定义）= 6×、皮 2 处 = 6×、深度 1 处；顶点零噪声；
 *   全源零循环/零纹理采样；
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

afterEach(() => {
  for (const material of created.splice(0)) material.dispose();
});

describe('uTime 接线（TimeUniformService 消费协议）', () => {
  it('叶/皮材质挂材质级 uniforms.uTime；编译后 shader.uniforms.uTime 同引用；GLSL 声明 uniform', () => {
    for (const material of [track(createCeltisLeafMaterial()), track(createCeltisBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('材质挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const leaf = track(createCeltisLeafMaterial());
    const bark = track(createCeltisBarkMaterial());
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

describe('风动契约（D19.7：uTime 全局风帧 / aSeed 个体相位）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）', () => {
    const leaf = assemble(track(createCeltisLeafMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(leaf.vertexShader).toContain(decl);
    }
    expect(leaf.vertexShader).toContain('fract(sin(aSeed * 78.233'); // 整树缓摆相位 = hash(aSeed)
    expect(leaf.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 51.171'); // 快颤相位 = hash(aSeed+叶身份)
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(leaf.vertexShader + leaf.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('整树缓摆叶/皮同公式（同串出现）；叶片快颤层含 aBend 权重', () => {
    const leaf = assemble(track(createCeltisLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createCeltisBarkMaterial()), THREE.ShaderLib.physical);
    const swayCore = 't3cWindH * t3cWindH * 0.045 * sin(uTime * 1.15';
    expect(leaf.vertexShader).toContain(swayCore);
    expect(bark.vertexShader).toContain(swayCore); // 皮不动叶动会撕裂穿帮——同公式同相位
    expect(leaf.vertexShader).toContain('aBend * 0.011'); // 快颤权重 = aBend（树皮组恒 0 天然免颤）
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createCeltisLeafMaterial()), track(createCeltisBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('SDF 叶形与透光', () => {
  it('alphaTest 0.5 + alphaToCoverage；片元含 SDF 计算式并写入 alpha', () => {
    const material = track(createCeltisLeafMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float t3cLeafAlpha('); // 叶形 SDF 函数（单一来源）
    expect(fragmentShader).toContain('t3cLeafAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = t3cAlpha;'); // alphatest_fragment 上游写入
  });

  it('深度材质（叶影裁切）：同一 SDF 函数 + RGBADepthPacking + 树皮组守卫实心 + USE_UV + alphaTest；风动不进 depth', () => {
    const material = track(createCeltisLeafDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.depthPacking).toBe(THREE.RGBADepthPacking);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('t3cLeafAlpha(vUv, vLeafRand)');
    expect(shader.fragmentShader).toContain('step(0.0001, vLeafRand)'); // 皮组 aLeafRand=0 → 实心（圆柱 uv 域不误裁）
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫（无平行光场景安全降级）', () => {
    const { fragmentShader } = assemble(track(createCeltisLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(fragmentShader).toContain('directionalLights[0]');
    expect(fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
  });
});

describe('物种配方锚定（Spec celtis-reference 1.0 §4/§5/§7）', () => {
  it('卵形包络（v^0.76，最宽点 ≈40% 叶长）+ 先端急尖变指数收口 + 基部微偏斜漂移；深度 SDF 单一来源同步', () => {
    const leaf = assemble(track(createCeltisLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('pow(clamp(t3cP.y, 0.001, 0.999), 0.76)'); // 卵形包络指数（v=0.5 → v≈0.40 最宽点；夏栎 1.4→0.61 倒卵形）
    expect(leaf.fragmentShader).toContain('mix(0.70, 1.15, smoothstep(0.40, 0.95, t3cP.y))'); // 基部圆钝 0.70 → 先端急尖 1.15（Spec 先端急尖至短渐尖 Verified [1][3]）
    expect(leaf.fragmentShader).toContain('t3cP.x -= 0.012 * t3cP.y;'); // 基部微偏斜（FRPS 几乎不偏斜或稍偏斜 [1]）
    const depth = assemble(track(createCeltisLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).toContain('pow(clamp(t3cP.y, 0.001, 0.999), 0.76)'); // SDF 单一来源——影裁切叶形自动同步
    expect(depth.fragmentShader).toContain('mix(0.70, 1.15, smoothstep(0.40, 0.95, t3cP.y))');
  });

  it('齿限上半部（四源一致核心辨识）：门控 + 圆钝齿载波 2π·9 pow² + 噪声频率 60；Step 4 幅度 0.060 峰值 0.030 = 坡宽 0.04×75% 顶格；Step 4b 门控坡 (0.48,0.56) 收窄', () => {
    const leaf = assemble(track(createCeltisLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('float t3cGate = smoothstep(0.48, 0.56, t3cP.y);'); // 下半部近全缘（Spec §4 Verified [1][3][5][6]；Step 4b：起坡 0.42→0.48——齿带严格限上半部 + 起齿更陡）
    expect(leaf.fragmentShader).toContain('pow(0.5 + 0.5 * cos(t3cP.y * 56.55 - t3cRand * 6.28), 2.0)'); // 圆钝齿载波（56.55 = 2π·9；pow² 圆钝 vs 夏栎 pow³ 锐齿）
    expect(leaf.fragmentShader).toContain('t3cP.y * 60.0'); // 齿抖动噪声频率（与载波同量级）
    expect(leaf.fragmentShader).toContain('* 0.060 * t3cGate'); // Step 4：幅度域 0.040→0.060（峰值 0.030 = 坡宽 0.04×75% 顶格——宏观特写齿可辨）
    expect(leaf.fragmentShader).toContain('clamp(t3cEdge / 0.04 + 0.5'); // Step 4：坡宽 0.03→0.04（AA 软边 1.9→2.5px 代价换齿幅上限 +33%）
    const depth = assemble(track(createCeltisLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).toContain('t3cTooth'); // SDF 单一来源——影裁切齿形自动同步
    expect(depth.fragmentShader).toContain('* 0.060 * t3cGate'); // 深度随 SDF 单一来源同步（影裁切齿形同幅）
  });

  it('三出脉基侧脉对 + 中脉亮带 + 弱二级脉（FOC 属级 3-veined from base Verified [4]；Step 4b 可见度定稿——权/色/带宽三推，探针 sRGB 中轴自估 ≈+15% 对 ≥12% 判据）', () => {
    const { fragmentShader } = assemble(track(createCeltisLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float t3cTriPath = 0.30 * pow(t3cP.y, 0.45) * (1.0 - 0.45 * t3cP.y);'); // 基出侧脉轨迹（急升后近叶缘平行内行）
    expect(fragmentShader).toContain('abs(abs(t3cP.x) - t3cTriPath)'); // 两侧对称一对（±|x| 距离场）
    expect(fragmentShader).toContain('1.0 - smoothstep(0.012, 0.040, abs(t3cP.x))'); // Step 4b：中脉带 0.008/0.030→0.012/0.040（平顶加宽线更实——采样不被衰减坡稀释）
    expect(fragmentShader).toContain('1.0 - smoothstep(0.012, 0.046, abs(abs(t3cP.x) - t3cTriPath))'); // Step 4b：三出脉带 0.010/0.040→0.012/0.046（基侧脉对身份核心同步推）
    expect(fragmentShader).toContain('t3cVeinMid * 1.00 + t3cVeinTri * 0.75 + t3cVeinLat * 0.18'); // Step 4b：中脉满权 1.00（0.85→）+ 三出脉 0.65→0.75（tri/mid 相对关系 0.76→0.75 不破）+ 二级脉 0.18 不动守背景弱层
    expect(fragmentShader).toContain('vec3(1.62, 1.34, 1.00)'); // Step 4b：脉色相对亮度 1.18→1.375（R 主推抗 G 通道输出裁切——albedo 线性亮度差 中脉 37.5%、三出脉 28.1%）
  });

  it('两面区分：叶背浅灰绿 ×(1.02,1.00,1.10) 去饱和提亮 + 背面糙度 +0.12 哑光差；深度材质不吃面色', () => {
    const leaf = assemble(track(createCeltisLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('float(gl_FrontFacing)'); // WebGL2 内建双面判定
    expect(leaf.fragmentShader).toContain('mix(vec3(1.02, 1.00, 1.10), vec3(1.0), float(gl_FrontFacing))'); // 浅灰绿：R/G 靠拢去饱和 + B 抬升冷灰绿（Spec §5 Verified [3][5][6]；vs 夏栎粉绿另配）
    expect(leaf.fragmentShader).toContain('(1.0 - float(gl_FrontFacing)) * 0.12'); // 叶背更暗淡走光泽差（背面糙度 +0.12 哑光）
    const depth = assemble(track(createCeltisLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).not.toContain('gl_FrontFacing'); // 深度 pass 只裁 alpha，无面色语义
  });

  it('背光透射弱化：峰值 0.30（vs 夏栎 0.65——近革质透光弱 Spec §5 Inferred [2][3][5]）', () => {
    const { fragmentShader } = assemble(track(createCeltisLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('* pow(t3cBack, 3.0) * t3cTransVar * t3cAlpha * 0.30;');
    expect(fragmentShader).not.toContain('* 0.65;'); // 夏栎峰值不串种
  });

  it('叶底色 #5a8340 中绿偏黄（较夏栎 #4e7c33 更黄更亮：R−G 暖差收窄、G−B 蓝差收窄）；半光泽 roughness 0.72', () => {
    const leaf = track(createCeltisLeafMaterial());
    const hex = leaf.color.getHex();
    expect(hex).toBe(0x5a8340); // 工程设定：canopy-a/b + leaf-a/b 照片交叉标定（判读「比夏栎更黄更亮」两树对照两次一致）
    const [r, g, b] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
    expect(r - g).toBe(-41); // 夏栎 R−G = -46——朴树暖差更大（更黄）
    expect(g - b).toBe(67); // 夏栎 G−B = 73——朴树蓝差更小（少蓝绿调）
    expect(leaf.roughness).toBe(0.72); // 半光泽（近革质 Spec §5 Inferred [6]；vs 夏栎 0.85 哑光）
  });

  it('皮底色 #7a746a 灰白-灰褐（比夏栎 #5c534a 各通道 +30 更浅更灰）；浅裂 tri² 剖面沟底 0.76（vs 夏栎 0.44+tri³ 深沟）', () => {
    const bark = track(createCeltisBarkMaterial());
    const hex = bark.color.getHex();
    expect(hex).toBe(0x7a746a); // 工程设定：bark-a 受光 (160,155,145)/阴影 (95,88,78) 折中（Spec §5 bark_color Verified [2][5][6]）
    const [r, g, b] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
    const oak = [0x5c, 0x53, 0x4a];
    expect(r).toBeGreaterThan(oak[0]); // 122 > 92
    expect(g).toBeGreaterThan(oak[1]); // 116 > 83
    expect(b).toBeGreaterThan(oak[2]); // 106 > 74——整体更浅
    expect(r - g).toBe(6); // R≈G 微暖（灰主调微褐）
    const { fragmentShader } = assemble(track(createCeltisBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('0.76 + 0.24 * t3cBarkTri * t3cBarkTri'); // 浅裂 tri² 剖面（沟底 0.76；vs 夏栎 0.44 + 0.56·tri³ 深沟）
    expect(fragmentShader).not.toContain('0.44 + 0.56'); // 夏栎深沟常数不串种
  });

  it('干上部更平滑色更浅（Spec §5 Verified [2][5][6]）：高度门控弱化裂深 + 提亮 1.07 + 糙度回落', () => {
    const { fragmentShader } = assemble(track(createCeltisBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float t3cBarkSmooth = smoothstep(0.8, 3.4, vTreePos.y);'); // 干基粗糙 → 上部平滑
    expect(fragmentShader).toContain('0.93 + 0.07 * t3cBarkTri * t3cBarkTri'); // 上部近平滑剖面（沟深弱化）
    expect(fragmentShader).toContain('1.0 + 0.07 * t3cBarkSmooth'); // 上部提亮
    expect(fragmentShader).toContain('- t3cBarkSmooth * 0.06'); // 上部糙度回落（弱光泽）
  });

  it('苔藓/地衣少量集中干下部（覆盖度低于夏栎）：噪声带收紧 + 强度 0.55 + 灰绿偏移；节疤系统不实现', () => {
    const { fragmentShader } = assemble(track(createCeltisBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('smoothstep(0.64, 0.88'); // 噪声高带收紧（夏栎 0.56–0.86——覆盖更少）
    expect(fragmentShader).toContain('t3cBarkMoss * 0.55'); // 强度 0.55（夏栎 0.82）
    expect(fragmentShader).toContain('vec3(0.84, 0.97, 0.68)'); // 灰绿地衣读向（夏栎饱和绿 (0.80,0.99,0.58)）
    expect(fragmentShader).not.toContain('Knot'); // 朴树无夏栎级节疤语言（Spec 树皮类型学 + 照片未见）——系统不实现
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

  /** 提取注入后的 t3cLeafAlpha 函数全文（SDF 单一来源分档比对用；首个 \n} 即函数闭合） */
  const sdfOf = (fragmentShader: string): string => {
    const start = fragmentShader.indexOf('float t3cLeafAlpha(vec2 t3cUv, float t3cRand)');
    expect(start).toBeGreaterThanOrEqual(0);
    const end = fragmentShader.indexOf('\n}', start);
    return fragmentShader.slice(start, end + 2);
  };

  it('三工厂缺省与显式 high 逐位一致（属性 + 键 + GLSL 全文）', () => {
    const pairs: Array<[THREE.Material, THREE.Material, { vertexShader: string; fragmentShader: string }]> = [
      [track(createCeltisLeafMaterial()), track(createCeltisLeafMaterial('high')), THREE.ShaderLib.physical],
      [track(createCeltisBarkMaterial()), track(createCeltisBarkMaterial('high')), THREE.ShaderLib.physical],
      [track(createCeltisLeafDepthMaterial()), track(createCeltisLeafDepthMaterial('high')), THREE.ShaderLib.depth],
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
    expectKey(track(createCeltisLeafMaterial()), 'celtis:leaf');
    expectKey(track(createCeltisLeafMaterial('mid')), 'celtis:leaf:mid');
    expectKey(track(createCeltisLeafMaterial('low')), 'celtis:leaf:low');
    expectKey(track(createCeltisBarkMaterial()), 'celtis:bark');
    expectKey(track(createCeltisBarkMaterial('mid')), 'celtis:bark:mid');
    expectKey(track(createCeltisBarkMaterial('low')), 'celtis:bark:low');
    expectKey(track(createCeltisLeafDepthMaterial()), 'celtis:leaf-depth');
    expectKey(track(createCeltisLeafDepthMaterial('mid')), 'celtis:leaf-depth:mid');
    expectKey(track(createCeltisLeafDepthMaterial('low')), 'celtis:leaf-depth:low');
    expect(keys.size).toBe(9);
  });

  it('叶 Mid：去叶脉三件（中脉带/三出脉影/弱二级脉——Spec §7 叶脉仅近距可辨）+ 叶团斑块；SDF 全形/透光/叶背/hue·luma/shade 保留', () => {
    const { fragmentShader } = assemble(track(createCeltisLeafMaterial('mid')), THREE.ShaderLib.physical);
    for (const gone of ['t3cVeinMid', 't3cVeinTri', 't3cVeinLat', 't3cTriPath', 't3cClump']) {
      expect(fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).not.toContain('(t3cClump - 0.5) * 0.06'); // 糙度注入同步去叶团项
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0'); // 透光保留
    expect(fragmentShader).toContain('t3cTransVar');
    expect(fragmentShader).toContain('float(gl_FrontFacing)'); // 叶背浅灰绿保留
    expect(fragmentShader).toContain('vec3 t3cHue'); // hue·luma 逐叶变奏保留
    expect(fragmentShader).toContain('float t3cLuma');
    expect(fragmentShader).toContain('(0.80 + 0.20 * t3cShade)'); // 冠内竖向自遮蔽保留（Step 4：地板 0.76→0.80）
    expect(fragmentShader).toContain('t3cGate'); // SDF 全形（卵形+急尖+上半部齿）保留
    expect(fragmentShader).toContain('t3cTooth');
    expect(fragmentShader).toContain('t3cP.y * 60.0'); // 齿抖动噪声维持（Mid 唯一 vnoise 采样）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 齿抖动 1（叶团去采样）= 1× vnoise = 3× 口径
  });

  it('叶 Low：CELTIS_LEAF_SDF_LOW（卵形+急尖+偏斜与 High 逐字同源）片元零噪声采样；去叶脉/叶团/透光；hue·luma/shade/叶背保留', () => {
    const { fragmentShader } = assemble(track(createCeltisLeafMaterial('low')), THREE.ShaderLib.physical);
    for (const gone of ['t3cTooth', 't3cSerr', 't3cGate']) {
      expect(fragmentShader, `Low SDF 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('float t3cEdge = 0.5 * t3cEnv - abs(t3cP.x);'); // Low SDF 边界式（无齿附加项）
    expect(fragmentShader).toContain('pow(clamp(t3cP.y, 0.001, 0.999), 0.76)'); // 卵形包络与 High 逐字同源
    expect(fragmentShader).toContain('mix(0.70, 1.15, smoothstep(0.40, 0.95, t3cP.y))'); // 急尖收口与 High 逐字同源（档间叶形身份一致）
    expect(fragmentShader).toContain('t3cP.x -= 0.012 * t3cP.y;'); // 基部偏斜漂移与 High 逐字同源
    // 片元零噪声采样：facVnoise 出现次数 = 库内 3（定义 1 + facFbm2 体内 2——未被调用，
    // 编译器死码消除，运行时零采样执行）
    expect(count(fragmentShader, 'facVnoise(')).toBe(3);
    for (const gone of ['t3cVeinMid', 't3cVeinTri', 't3cTriPath', 't3cClump', 't3cTransVar', 'vec3(0.58, 0.90, 0.38)']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(count(fragmentShader, '#include <opaque_fragment>')).toBe(1); // 透光不注入但锚点原句不动
    expect(fragmentShader).toContain('float(gl_FrontFacing)'); // 叶背保留
    expect(fragmentShader).toContain('(0.80 + 0.20 * t3cShade)'); // shade 保留（Step 4：地板 0.76→0.80 与 High 同步）
    expect(fragmentShader).toContain('vec3 t3cHue'); // hue·luma 保留
  });

  it('皮 Mid：去苔藓地衣（中距不可辨）；脊沟/板块/干上部平滑提亮保留', () => {
    const { fragmentShader } = assemble(track(createCeltisBarkMaterial('mid')), THREE.ShaderLib.physical);
    expect(fragmentShader).not.toContain('t3cBarkMoss');
    expect(fragmentShader).not.toContain('t3cBarkMoss * 0.04'); // 糙度苔藓项去
    expect(fragmentShader).toContain('t3cBarkWarp'); // 裂线游走保留
    expect(fragmentShader).toContain('0.76 + 0.24 * t3cBarkTri * t3cBarkTri'); // tri² 浅裂剖面保留
    expect(fragmentShader).toContain('t3cBarkPlate'); // 板块保留
    expect(fragmentShader).toContain('1.0 + 0.07 * t3cBarkSmooth'); // 干上部提亮保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 裂线游走 + 板块 = 2× vnoise
  });

  it('皮 Low：脊沟保留（游走 vnoise + tri² + 高度门控 + 沟内弱 AO）；去板块采样/苔藓/上部提亮（板块均值化常量乘子）', () => {
    const { fragmentShader } = assemble(track(createCeltisBarkMaterial('low')), THREE.ShaderLib.physical);
    for (const gone of ['t3cBarkPlate', 't3cBarkMoss']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).not.toContain('1.0 + 0.07 * t3cBarkSmooth'); // 上部提亮去（颜色次细节）
    expect(fragmentShader).toContain('t3cBarkWarp'); // 裂线游走保留（Low 唯一 vnoise 采样）
    expect(fragmentShader).toContain('0.76 + 0.24 * t3cBarkTri * t3cBarkTri'); // tri² 浅裂剖面
    expect(fragmentShader).toContain('t3cBarkSmooth'); // 高度门控保留（结构剪影项——上部裂深弱化）
    expect(fragmentShader).toContain('smoothstep(0.15, 0.75, t3cBarkTri)'); // 沟内弱冷灰 AO
    expect(fragmentShader).toContain('t3cBarkRidge * vec3(0.985, 0.98, 0.975)'); // 板块均值化常量乘子 = plate mix 两端中点（值噪声均值 0.5 保均）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 裂线游走 1 = 1× vnoise = 3× 口径
  });

  it('深度分档：Mid 与 High 的 SDF 段同源一致；Low 用 Low SDF（表面/影裁切档内一致）', () => {
    const high = assemble(track(createCeltisLeafDepthMaterial()), THREE.ShaderLib.depth);
    const mid = assemble(track(createCeltisLeafDepthMaterial('mid')), THREE.ShaderLib.depth);
    const low = assemble(track(createCeltisLeafDepthMaterial('low')), THREE.ShaderLib.depth);
    const highSdf = sdfOf(high.fragmentShader);
    expect(sdfOf(mid.fragmentShader)).toBe(highSdf); // Mid 深度 = High SDF（Mid 表面与 High 同源全形）
    expect(highSdf).toContain('t3cGate'); // 全形标志（上半部齿在位）
    expect(highSdf).toContain('t3cTooth');
    const lowSdf = sdfOf(low.fragmentShader);
    expect(lowSdf).not.toContain('t3cGate'); // Low SDF 去齿
    expect(lowSdf).not.toContain('t3cTooth');
    expect(lowSdf).toContain('float t3cEdge = 0.5 * t3cEnv - abs(t3cP.x);');
    // 表面/影档内一致：叶 Low 表面 SDF === 深度 Low SDF；叶 Mid 表面 SDF === High 全形 SDF
    const lowSurface = assemble(track(createCeltisLeafMaterial('low')), THREE.ShaderLib.physical);
    const midSurface = assemble(track(createCeltisLeafMaterial('mid')), THREE.ShaderLib.physical);
    expect(sdfOf(lowSurface.fragmentShader)).toBe(lowSdf);
    expect(sdfOf(midSurface.fragmentShader)).toBe(highSdf);
    expect(count(low.fragmentShader, 'facVnoise(')).toBe(3); // Low 深度零采样（库内 3）
  });

  it('风动三档同源：叶/皮三档顶点 GLSL 全文一致（CELTIS_WIND 同一常量——档间相位一致 = 身份一致）', () => {
    const leafHigh = assemble(track(createCeltisLeafMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createCeltisBarkMaterial()), THREE.ShaderLib.physical);
    for (const level of ['mid', 'low'] as const) {
      const leaf = assemble(track(createCeltisLeafMaterial(level)), THREE.ShaderLib.physical);
      const bark = assemble(track(createCeltisBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(leaf.vertexShader).toBe(leafHigh.vertexShader);
      expect(bark.vertexShader).toBe(barkHigh.vertexShader);
    }
  });

  it('分档底参契约不因档破：叶三档 alphaTest/alphaToCoverage/DoubleSide/USE_UV/零贴图；皮 FrontSide；深度 alphaTest', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const leaf = track(createCeltisLeafMaterial(level));
      const bark = track(createCeltisBarkMaterial(level));
      const depth = track(createCeltisLeafDepthMaterial(level));
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
    for (const make of [createCeltisLeafMaterial, createCeltisBarkMaterial]) {
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
    const leafA = track(createCeltisLeafMaterial());
    const leafB = track(createCeltisLeafMaterial());
    const barkA = track(createCeltisBarkMaterial());
    const barkB = track(createCeltisBarkMaterial());
    const depth = track(createCeltisLeafDepthMaterial());
    expect(leafA).not.toBe(leafB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(leafA.customProgramCacheKey()).toBe(leafB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([leafA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
    expect(materialUniformsOf(leafA).uTime).not.toBe(materialUniformsOf(leafB).uTime); // uTime 桥接对象实例独立（dispose 安全）
    expect(materialUniformsOf(barkA).uTime).not.toBe(materialUniformsOf(barkB).uTime);
  });

  it('底参与侧向：叶 DoubleSide/半光泽糙度/USE_UV；皮 FrontSide/高糙哑光/USE_UV；均零贴图', () => {
    const leaf = track(createCeltisLeafMaterial());
    const bark = track(createCeltisBarkMaterial());
    expect(leaf.side).toBe(THREE.DoubleSide);
    expect(leaf.metalness).toBe(0);
    expect(leaf.roughness).toBeGreaterThan(0.6); // 半光泽（近革质——vs 夏栎 >0.75 缎面域，朴树更亮一档）
    expect(leaf.roughness).toBeLessThan(0.78);
    expect(leaf.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.FrontSide);
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeGreaterThanOrEqual(0.9); // 高糙哑光（平滑灰皮微弱光泽）
    expect(bark.map).toBeNull();
    expect(leaf.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
  });
});

describe('成本记账（10 万实例每像素预算：叶 ≤11.5× / 皮 ≤7.5×，hash21=1×/vnoise=3×）', () => {
  it('facVnoise 调用数：叶片元 2 处（6×）、皮 2 处（6×）、深度 1 处；顶点零噪声（库内 3 处为定义+未使用的 facFbm2 调用）', () => {
    const leaf = assemble(track(createCeltisLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createCeltisBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createCeltisLeafDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(leaf.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（齿抖动 + 叶团斑块）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（裂线游走 + 板块）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（齿抖动，随 SDF 单一来源进入）
    expect(count(leaf.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin/cos
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零循环/零纹理采样（配方确定性纯函数 + SDF 纯 ALU）', () => {
    const shaders = [
      assemble(track(createCeltisLeafMaterial()), THREE.ShaderLib.physical),
      assemble(track(createCeltisBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createCeltisLeafDepthMaterial()), THREE.ShaderLib.depth),
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
    for (const make of [createCeltisLeafMaterial, createCeltisBarkMaterial, createCeltisLeafDepthMaterial]) {
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
    const leaf = track(createCeltisLeafMaterial());
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

    const depth = track(createCeltisLeafDepthMaterial());
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
    const bark = track(createCeltisBarkMaterial());
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

    const leaf = track(createCeltisLeafMaterial());
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

    const leaf = assemble(track(createCeltisLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createCeltisBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createCeltisLeafDepthMaterial()), THREE.ShaderLib.depth);
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
    const material = track(createCeltisLeafMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});
