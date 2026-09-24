/**
 * tests/runtime/procedural/tree/zelkovaMaterials.test.ts —— 榉树叶/树皮/深度材质测试
 * （T011.3，对称 camphorMaterials.test.ts 范式：真实 THREE.ShaderLib 源组装，静态字符串
 * 断言，零 WebGL；build()/资产入口归并行几何 agent 的资产测试，此处不覆盖）。
 *
 * 覆盖：
 * - uTime 接线（TimeUniformService 消费协议）：叶/皮材质挂材质级 uniforms.uTime（own
 *   property）；onBeforeCompile 后 shader.uniforms.uTime 与材质级同对象引用；GLSL 声明
 *   uniform float uTime；材质挂场景被服务逐帧驱动（frame 写值闭环）；
 * - 风动契约（D19.7）：aSeed/aBend/aLeafRand 顶点 attribute 声明存在；相位 = fract(sin(...))
 *   类 hash（aSeed=0 缺省属性路径退化为常数相位，全源零除 aSeed——无 NaN）；整树缓摆项
 *   叶/皮同公式（同串出现）；叶片快颤层含 aBend 权重（树皮组恒 0 天然免颤）+ 短柄硬叶颤
 *   读向（幅度 8mm < 先例 11mm、频率 16–25Hz 偏高——叶柄 2–7mm 粗短 Verified）；
 * - instanceColor 乘算链安全：注入后 <color_fragment> 原句恰一次、注入代码零 vColor 介入；
 * - SDF 叶形与透光：alphaTest 0.5 + alphaToCoverage；片元含 zlkLeafAlpha 计算式与 alpha
 *   写入；深度材质（叶影裁切）含同一 SDF 函数（单一来源）+ RGBADepthPacking + 树皮组守卫
 *   （aLeafRand=0 实心）+ USE_UV + alphaTest；透光项存在且 NUM_DIR_LIGHTS 守卫；风动不进
 *   depth pass；
 * - 物种配方锚定（Spec docs/research/zelkova-reference.md 1.0）：卵形至卵状披针形包络指数
 *   0.70（最宽点 v≈0.37 四树最偏基——vs 朴树 0.76→0.40 / 香樟 0.90→0.46 / 夏栎 1.4→0.61，
 *   JS 数值锚 0.5^(1/0.70)）/先端渐尖至尾状渐尖变指数收口 mix(0.72,1.22)（起坡 0.38 三树
 *   最低——长尾读向）/叶基稍偏斜 0.030·(1−0.7v)（榆科核心辨识：基部最强渐减——vs 朴树
 *   线性 0.012；中等偏弱域断言 0.012 < 0.030 < 0.06 榆属显著域；终审文献 Verified 口径
 *   优先）/尖头单锯齿载波（三树首个全缘反例——回归齿载波：pow 2.6 尖头 vs 朴树 2.0 圆钝；
 *   齿布全缘无中部门控 vs 朴树 0.48 起；10 齿/侧域中；单频载波 = 非重锯齿）/齿调制 ALU 化
 *   （sin 低频调制——SDF 零噪声引用，**齿载波 + 深度零噪声组合首例**）/羽状脉直伸齿尖
 *   （脉型三分化第三型：与齿载波同频 62.83 达缘统计读向 + 斜伸直伸 26.0 + 全叶均匀分布
 *   0.035 起——无特强基出对 vs 朴树三出/香樟离基）/两面区分叶背浅绿无粉感 ×(1.10,1.12,
 *   1.04)（R/G 主导 B 低抬——vs 香樟 B 主导 glaucous ×(1.06,1.05,1.16)；幅度强于朴树）+
 *   背面糙度 +0.08 哑光差（薄纸质两面差最小）/薄纸质透光最强峰值 0.40（> 朴树 0.30 >
 *   香樟 0.22 三资产链）/透射色亮黄绿 (0.60,0.92,0.34)/叶底色 #3e6c2c 深绿（亮度介于
 *   香樟最暗与朴树亮之间、黄绿量级近朴树暗一档）/半光泽微糙 roughness 0.62（somewhat
 *   rough——介于香樟 0.50 革质与朴树 0.72 之间）；皮底色 #787c72 灰白-灰褐带灰绿（R−G=-4
 *   四树唯一 G>R——灰绿读向，亮度 ≈朴树同级）/无脊沟系统（第四种树皮语言——零 tri
 *   剖面零裂线游走）/剥落斑驳（Step 4b 校准 2026-09-20：斑域频率 (6,5) 屏幕可辨性校准
 *   （旧 (11,14) 晶胞 ~7cm 在 2.6m 机位 ≈5px 被 MSAA 磨平——T26 探针暖斑 0.0000）+ 软阈值
 *   smoothstep(0.62,0.72) 占比 ≈26% + 三色带奶油白/浅褐/锈橙（阈值 (0.24,0.48)/(0.55,0.78)
 *   + 锈橙 (1.35,0.92,0.64) 对比微增——唯一带橙锈色新斑语言）+ 斑缘缝暗 0.14 贴片感 +
 *   旧皮暗镶复用采样）/上部紫褐偏色（当年生枝紫褐 Verified）+ 细枝斑驳弱化 0.55/苔藓不做
 *   （覆盖度低单源低置信——不做不编造）；
 * - 深度材质零噪声库注入（齿调制 ALU 化 → SDF 零 facVnoise 引用 → 影 pass 不吃噪声纪律
 *   的更优满足——免朴树齿噪声进 depth 的账）；
 * - 分档实装（level 参数，缺省 'high'）：三工厂缺省 ≡ 显式 'high'（属性 + 键 + GLSL 全文
 *   逐位相等）；3 工厂 × 3 档 = 9 键互异（跨资产键零碰撞归 assetTaxonomy 全注册资产收容断言）；
 *   叶 Mid 去叶脉两件/叶团（SDF 全形**含齿**保留——中距锯齿读向、透光/叶背/
 *   hue·luma/shade 保留）、Low 换 SDF_LOW（去齿——锯齿细化；包络/偏斜/渐尖与 High 逐字
 *   同源）再去透光；皮 Mid 去边缝/暗镶（斑驳本体三色带 + 上部紫褐 + 细枝弱化保留）、
 *   Low 斑驳系统全部去采样（均值化常量乘子 + 上部紫褐保留——光滑皮无脊沟天然零结构项）；
 *   深度 Mid = High SDF（含齿）、Low = SDF_LOW（表面/影档内一致）；风动三档顶点 GLSL
 *   同源；分档底参契约（alphaTest/侧向/USE_UV）不因档破；uTime 桥接三档不缺位；
 * - program 键纪律：叶/皮/深度三键互异；两次工厂调用材质对象不同（无模块级共享，D17）但
 *   键相同；uniforms 不跨实例共享；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：叶片元 facVnoise 调用 1 处
 *   （叶团斑块——齿调制 ALU 化免齿噪声）、Mid/Low 0 处；皮 High/Mid 2 处（斑域 + 斑色）、
 *   Low 0 处；深度 0 处（零噪声库注入）；顶点零噪声；全源零循环/零纹理采样；
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
  createZelkovaBarkMaterial,
  createZelkovaLeafDepthMaterial,
  createZelkovaLeafMaterial,
} from '../../../../src/runtime/procedural/tree/zelkova/zelkovaMaterials';
import { assemble, braceDelta, count, createMaterialTracker, expandIncludes, materialUniformsOf, propsOf, sdfOf as extractSdf } from '../../../support/procedural-tree/materialHarness';

const { track, disposeAll } = createMaterialTracker();

/** 提取注入后的 zlkLeafAlpha 函数全文（SDF 单一来源比对用；首个 \n} 即函数闭合） */
const sdfOf = (fragmentShader: string): string =>
  extractSdf(fragmentShader, 'float zlkLeafAlpha(vec2 zlkUv, float zlkRand)');

afterEach(() => {
  disposeAll();
});

describe('uTime 接线（TimeUniformService 消费协议）', () => {
  it('叶/皮材质挂材质级 uniforms.uTime；编译后 shader.uniforms.uTime 同引用；GLSL 声明 uniform', () => {
    for (const material of [track(createZelkovaLeafMaterial()), track(createZelkovaBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('材质挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const leaf = track(createZelkovaLeafMaterial());
    const bark = track(createZelkovaBarkMaterial());
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

describe('风动契约（D19.7：uTime 全局风帧 / aSeed 个体相位；短柄硬叶颤——叶柄 2–7mm Verified）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）', () => {
    const leaf = assemble(track(createZelkovaLeafMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(leaf.vertexShader).toContain(decl);
    }
    expect(leaf.vertexShader).toContain('fract(sin(aSeed * 77.669'); // 整树缓摆相位 = hash(aSeed)——常数换朴树 78.233/香樟 79.193 去相关
    expect(leaf.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 53.419'); // 快颤相位 = hash(aSeed+叶身份)
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(leaf.vertexShader + leaf.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('整树缓摆叶/皮同公式（同串出现）；快颤含 aBend 权重且幅度 8mm 短柄硬颤（< 先例 11mm）、频率 16+ 偏高；树高锚 8m（×0.125）', () => {
    const leaf = assemble(track(createZelkovaLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createZelkovaBarkMaterial()), THREE.ShaderLib.physical);
    const swayCore = 'zlkWindH * zlkWindH * 0.045 * sin(uTime * 1.15';
    expect(leaf.vertexShader).toContain(swayCore);
    expect(bark.vertexShader).toContain(swayCore); // 皮不动叶动会撕裂穿帮——同公式同相位
    expect(leaf.vertexShader).toContain('aBend * 0.008'); // 短柄硬叶颤：幅度 8mm < 先例 11mm（叶柄 2–7mm 粗短——柄短刚度高）
    expect(leaf.vertexShader).toContain('uTime * (16.0 + 9.0 * zlkFlutterPhase)'); // 16–25Hz 偏高（vs 先例 14+9）
    expect(leaf.vertexShader).toContain('position.y * 0.125'); // /8m 锚点树高（榉树目标 ≈8m，D19.7）
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createZelkovaLeafMaterial()), track(createZelkovaBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('SDF 叶形与透光', () => {
  it('alphaTest 0.5 + alphaToCoverage；片元含 SDF 计算式并写入 alpha', () => {
    const material = track(createZelkovaLeafMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float zlkLeafAlpha('); // 叶形 SDF 函数（单一来源）
    expect(fragmentShader).toContain('zlkLeafAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = zlkAlpha;'); // alphatest_fragment 上游写入
  });

  it('深度材质（叶影裁切）：同一 SDF 函数 + RGBADepthPacking + 树皮组守卫实心 + USE_UV + alphaTest；风动不进 depth；零噪声库注入', () => {
    const material = track(createZelkovaLeafDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.depthPacking).toBe(THREE.RGBADepthPacking);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('zlkLeafAlpha(vUv, vLeafRand)');
    expect(shader.fragmentShader).toContain('step(0.0001, vLeafRand)'); // 皮组 aLeafRand=0 → 实心（圆柱 uv 域不误裁）
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
    expect(count(shader.fragmentShader, 'facVnoise(')).toBe(0); // 零噪声库注入——齿调制 ALU 化（影 pass 不吃噪声的更优满足）
    expect(shader.fragmentShader).not.toContain('facHash21'); // 噪声库整体未挂（SDF 引入噪声即编译暴雷——保护性约束）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫（无平行光场景安全降级）', () => {
    const { fragmentShader } = assemble(track(createZelkovaLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(fragmentShader).toContain('directionalLights[0]');
    expect(fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
  });
});

describe('物种配方锚定（Spec zelkova-reference 1.0 §2/§4/§5/§7；终审：偏斜/锯齿以文献 Verified 口径优先）', () => {
  it('卵形至卵状披针形包络（v^0.70，最宽点 v≈0.37 四树最偏基——披针形细长读向 JS 数值锚）+ 渐尖至尾状渐尖变指数收口；深度 SDF 单一来源同步', () => {
    const leaf = assemble(track(createZelkovaLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('pow(clamp(zlkP.y, 0.001, 0.999), 0.70)'); // 卵形至卵状披针形包络指数（Spec §4 Verified [1][2][3][4][7][8]）
    // JS 数值锚：最宽点 = 0.5^(1/p)——榉树 0.37 四树最偏基（披针形细长），逐级小于朴树 0.40 / 香樟 0.46 / 夏栎 0.61
    const widest = (p: number): number => Math.pow(0.5, 1 / p);
    expect(widest(0.70)).toBeGreaterThan(0.34);
    expect(widest(0.70)).toBeLessThan(0.40);
    expect(widest(0.70)).toBeLessThan(widest(0.76)); // < 朴树 0.40
    expect(widest(0.70)).toBeLessThan(widest(0.90)); // < 香樟 0.46
    expect(widest(0.70)).toBeLessThan(widest(1.4)); // < 夏栎 0.61
    expect(leaf.fragmentShader).toContain('mix(0.72, 1.22, smoothstep(0.38, 0.95, zlkP.y))'); // 基部圆形/浅心形 0.72 → 先端尾状渐尖 1.22（渐尖起坡 0.38 三树最低——长尾读向；vs 朴树 1.15/香樟 1.10 急尖）
    const depth = assemble(track(createZelkovaLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(sdfOf(depth.fragmentShader)).toBe(sdfOf(leaf.fragmentShader)); // SDF 单一来源——影裁切叶形自动同步
  });

  it('叶基稍偏斜（榆科核心辨识）：中心线基部最强 0.030 向先端衰减（vs 朴树线性 0.012）；中等偏弱域（< 榆属显著偏斜记档域 0.06）', () => {
    const leaf = assemble(track(createZelkovaLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('zlkP.x -= 0.030 * (1.0 - 0.7 * zlkP.y);'); // 基部最强渐减（「叶基偏斜」语义——中上恢复近对称；vs 朴树向先端渐强的线性漂移）
    expect(0.030).toBeGreaterThan(0.012); // > 朴树（几乎不偏斜或仅稍偏斜）
    expect(0.030).toBeLessThan(0.06); // < 榆属显著偏斜记档域上界（文献 Verified「稍偏斜」中等偏弱——终审照片 strong 读记变体噪声不采）
    expect(0.030 * (1.0 - 0.7)).toBeCloseTo(0.009, 10); // 尖部残留 0.009——整叶微偏不断轴
  });

  it('尖头单锯齿（三树首个全缘反例——回归齿载波）：pow 2.6 尖头 + 10 齿/侧 + 齿布全缘（无中部门控）+ ALU 低频调制 + SDF 零噪声引用', () => {
    const leaf = assemble(track(createZelkovaLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('pow(0.5 + 0.5 * cos(zlkP.y * 62.83 - zlkRand * 6.28), 2.6)'); // 尖头单锯齿载波：2π·10 = 10 齿/侧（域 8–15 取中），pow 2.6 尖头（vs 朴树 pow 2.0 圆钝）
    expect(leaf.fragmentShader).not.toContain('smoothstep(0.48, 0.56'); // 齿布全缘——无朴树式中部门控（榉树 vs 朴树核心分化：齿布全缘、尖头锐齿）
    expect(leaf.fragmentShader).toContain('sin(zlkP.y * 9.42 - zlkRand * 6.28)'); // 低频齿深调制（ALU 化——免朴树齿抖动噪声；单频载波 = 非重锯齿）
    expect(leaf.fragmentShader).toContain('smoothstep(0.02, 0.10, zlkP.y) * (1.0 - smoothstep(0.94, 0.99, zlkP.y))'); // 端部亚叶缘渐隐（齿布全缘、仅两端收尾）
    expect(leaf.fragmentShader).toContain('clamp(zlkEdge / 0.04 + 0.5'); // 坡宽 0.04 沿先例 AA 口径
    expect(sdfOf(leaf.fragmentShader)).not.toContain('facVnoise'); // SDF 零噪声引用（深度材质不挂噪声库的前提——齿载波 + 深度零噪声组合首例）
    const toothCount = 62.83 / (2 * Math.PI);
    expect(toothCount).toBeGreaterThanOrEqual(8); // 10 齿/侧 ∈ Spec 域 8–15（照片判读 Verified 交叉）
    expect(toothCount).toBeLessThanOrEqual(15);
  });

  it('羽状脉直伸齿尖（脉型三分化第三型——纯羽状脉无基出脉）：与齿载波同频 62.83 达缘读向 + 斜伸直伸 + 全叶均匀分布无特强基出对', () => {
    const { fragmentShader } = assemble(track(createZelkovaLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('sin(zlkP.y * 62.83 - abs(zlkP.x) * 26.0'); // 羽状侧脉：与齿载波同频（每对侧脉对应一齿的达缘统计读向——FOC「脉端直达齿尖」Verified [6]）+ 斜伸直伸
    expect(count(fragmentShader, 'zlkP.y * 62.83')).toBe(2); // 同频恰两处代码：SDF 齿载波 + VEIN 侧脉载波（达缘耦合；注释提及不计）
    const veinPairs = 62.83 / (2 * Math.PI);
    expect(veinPairs).toBeGreaterThanOrEqual(7); // 10 对 ∈ Spec 域 7–15（Verified [1][2][3][4][7][8]）
    expect(veinPairs).toBeLessThanOrEqual(15);
    expect(fragmentShader).toContain('smoothstep(0.035, 0.10, zlkP.y) * (1.0 - smoothstep(0.86, 0.96, zlkP.y))'); // 全叶均匀分布（叶基上方即起——无特强基出对）+ 先端渐尖区渐隐
    expect(fragmentShader).not.toContain('0.30 * pow'); // 朴树三出脉基侧脉对不串种
    expect(fragmentShader).not.toContain('0.42 * pow'); // 香樟离基三出脉不串种
    expect(fragmentShader).toContain('zlkVeinMid * 1.00 + zlkVeinLat * 0.55'); // 中脉满权 + 均匀网 0.55（无主对——vs 朴树三出对 0.75 / 香樟离基对 0.78）
    expect(fragmentShader).toContain('1.0 - smoothstep(0.012, 0.040, abs(zlkP.x))'); // 中脉亮带（朴树 Step 4b 平顶加宽口径）
    expect(fragmentShader).toContain('vec3(1.62, 1.34, 1.00)'); // 脉色（可见度按朴树 Step 4b sRGB 压缩教训定标——R 主推抗 G 裁切）
  });

  it('两面区分：叶背浅绿无粉感 ×(1.10,1.12,1.04)（R/G 主导 B 低抬——vs 香樟 B 主导 glaucous）+ 背面糙度 +0.08 哑光差（薄纸质两面差最小）；深度材质不吃面色', () => {
    const leaf = assemble(track(createZelkovaLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('float(gl_FrontFacing)'); // WebGL2 内建双面判定
    expect(leaf.fragmentShader).toContain('mix(vec3(1.10, 1.12, 1.04), vec3(1.0), float(gl_FrontFacing))'); // 浅绿暖读向无冷灰粉感（Spec §5 Verified [1][2][3][4]——中等深浅对比；幅度强于朴树）
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.05, 1.16)'); // 香樟 glaucous 配方不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.02, 1.00, 1.10)'); // 朴树背面配方不串种
    expect(leaf.fragmentShader).toContain('(1.0 - float(gl_FrontFacing)) * 0.08'); // 叶背哑光差 +0.08（薄纸质毛被脱落两面趋光滑——差小于朴树 +0.12 / 香樟 +0.16）
    const depth = assemble(track(createZelkovaLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).not.toContain('gl_FrontFacing'); // 深度 pass 只裁 alpha，无面色语义
  });

  it('薄纸质透光最强：峰值 0.40 > 朴树 0.30 > 香樟 0.22（三资产链）；透射色亮黄绿基调', () => {
    const { fragmentShader } = assemble(track(createZelkovaLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('* pow(zlkBack, 3.0) * zlkTransVar * zlkAlpha * 0.40;');
    expect(fragmentShader).toContain('vec3(0.60, 0.92, 0.34)'); // 亮黄绿透射色（薄纸亮透调——亮于朴树 (0.58,0.90,0.38) / 香樟浓绿 (0.46,0.84,0.36)）
    expect(0.40).toBeGreaterThan(0.30); // > 朴树近革质（任务书纪律：高于朴树/香樟）
    expect(0.40).toBeGreaterThan(0.22); // > 香樟革质
    expect(fragmentShader).not.toContain('* 0.30;'); // 朴树峰值不串种
    expect(fragmentShader).not.toContain('* 0.22;'); // 香樟峰值不串种
    expect(fragmentShader).not.toContain('* 0.65;'); // 夏栎裂叶峰值不串种
  });

  it('叶底色 #3e6c2c 深绿（亮度介于香樟最暗与朴树亮之间、黄绿量级近朴树暗一档）；半光泽微糙 roughness 0.62', () => {
    const leaf = track(createZelkovaLeafMaterial());
    const hex = leaf.color.getHex();
    expect(hex).toBe(0x3e6c2c); // 工程设定：OSU "dark green" + §5 冠层中绿-深绿交叉（Spec §5 Verified [1][2][3][4][7]）
    const [r, g, b] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
    expect(g - b).toBe(64); // 黄绿量级近朴树 67（亮暖绿系）但暗一档
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    expect(luma([r, g, b])).toBeGreaterThan(luma([0x33, 0x61, 0x2e])); // 亮于香樟（浓绿最暗）
    expect(luma([r, g, b])).toBeLessThan(luma([0x5a, 0x83, 0x40])); // 暗于朴树（中绿偏黄最亮）
    expect(luma([r, g, b])).toBeLessThan(luma([0x4e, 0x7c, 0x33])); // 暗于夏栎
    expect(leaf.roughness).toBe(0.62); // 半光泽微糙（Spec §5 "somewhat rough above" Verified [7][8]；介于香樟 0.50 革质与朴树 0.72 之间）
    expect(leaf.metalness).toBe(0);
  });

  it('皮底色 #787c72 灰白-灰褐带灰绿（R−G=-4 四树唯一 G>R——灰绿读向，亮度 ≈朴树同级）；无脊沟系统（第四种树皮语言）', () => {
    const bark = track(createZelkovaBarkMaterial());
    const hex = bark.color.getHex();
    expect(hex).toBe(0x787c72); // 工程设定：文献「灰白色或褐灰色」+ 照片 gray-green base 交叉（Spec §5 bark_color Verified [1][2][3][4]）
    const [r, g, b] = [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
    expect(r - g).toBe(-4); // 四树唯一 G>R（朴树 +6 / 香樟 +11 / 夏栎 +9 全暖灰）——灰绿读向
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    expect(luma([r, g, b])).toBeGreaterThan(luma([0x6e, 0x63, 0x52])); // 亮于香樟（光滑灰白亮基底 vs 深褐系）
    const { fragmentShader } = assemble(track(createZelkovaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).not.toContain('abs(fract(vUv.x'); // 无脊沟 tri 剖面系统（vs 三先例均有——光滑皮语言）
    expect(fragmentShader).not.toContain('0.76 + 0.24'); // 朴树浅裂常数不串种
    expect(fragmentShader).not.toContain('0.50 + 0.50'); // 香樟深沟常数不串种
    expect(fragmentShader).not.toContain('0.44 + 0.56'); // 夏栎深沟常数不串种
    expect(bark.roughness).toBe(0.88); // 光滑灰皮微弱光泽（smooth-gray——略低于三先例哑光系）
  });

  it('暖色薄片剥落斑驳（身份核心——唯一带橙锈色新斑的语言）：斑域高带软阈值 + 三色带（奶油白/浅褐/锈橙）+ 斑缘缝暗 + 旧皮暗镶复用采样（Step 4b 校准 2026-09-20 屏幕可辨性口径）', () => {
    const { fragmentShader } = assemble(track(createZelkovaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('smoothstep(0.62, 0.72, zlkBarkDomain)'); // 斑域软阈值（面积 ≈26%——Spec §5 15–30% 域中上，Step 4b：旧 (0.60,0.68) ≈33% 出域上沿 → JS 复算 ≈26%）
    expect(fragmentShader).toContain('vec2(vUv.x * 6.0, vUv.y * 5.0)'); // 斑域频率（晶胞 18–25cm ≈干径 26cm 的 1/4–1/2 域 Spec §5 [8]；Step 4b：旧 (11,14) 晶胞 ~7cm 在 2.6m 机位 ≈5px 被 MSAA/软边磨平——T26 探针暖斑 0.0000）
    expect(fragmentShader).toContain('smoothstep(0.24, 0.48, zlkBarkTone)'); // 三色带第一阈（奶油白→浅褐；Step 4b 下移）
    expect(fragmentShader).toContain('smoothstep(0.55, 0.78, zlkBarkTone)'); // 三色带第二阈（→锈橙；Step 4b 下移提锈橙出现率 E[s2] 0.16→0.25）
    expect(fragmentShader).toContain('vec3(1.26, 1.21, 1.10)'); // 奶油白（新露斑亮暖）
    expect(fragmentShader).toContain('vec3(1.16, 1.05, 0.90)'); // 浅褐
    expect(fragmentShader).toContain('vec3(1.35, 0.92, 0.64)'); // 锈橙-橙褐（R>G>B——唯一带橙锈色新斑的语言，终审「橙锈/cinnamon」交叉确认；Step 4b：旧 (1.32,0.96,0.70) R 升 G/B 降——锈橙读向更明）
    expect(fragmentShader).toContain('zlkBarkFlakeW * (1.0 - zlkBarkFlakeW) * 4.0 * 0.14'); // 斑缘缝暗（薄片翘曲边缝阴影——贴片感）
    expect(fragmentShader).toContain('vec3(0.90, 0.88, 0.87)'); // 旧皮暗色小块镶嵌（复用 domain 中低带——零新增采样）
    // 同频偏移双采样：斑域 + 斑色（每斑一色、斑间色异）
    expect(count(fragmentShader, 'vec2(vUv.x * 6.0, vUv.y * 5.0)')).toBe(2);
  });

  it('干上部/细枝：紫褐偏色（当年生枝紫褐 Verified）+ 细枝斑驳弱化；高度门控三档保留；苔藓不做（覆盖度低单源低置信）', () => {
    const { fragmentShader } = assemble(track(createZelkovaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float zlkBarkHigh = smoothstep(2.2, 4.6, vTreePos.y);'); // 高度门控（结构剪影项——Spec §4 twig_surface Verified [1][2][3][4]）
    expect(fragmentShader).toContain('mix(1.0, 0.55, zlkBarkHigh)'); // 细枝斑驳弱化（斑径 < 枝径不可辨）
    expect(fragmentShader).toContain('vec3(1.05, 0.99, 0.97)'); // 上部紫褐偏色（R 抬 G/B 微降）
    expect(fragmentShader).not.toContain('Moss'); // 苔藓不做（Spec §5 覆盖度低弱于樟树 + 入库照片未显著——不做不编造；vs 朴树/香樟有苔藓层）
  });
});

describe('分档实装（level 参数；缺省 high = 显式 high）', () => {

  it('三工厂缺省与显式 high 逐位一致（属性 + 键 + GLSL 全文）', () => {
    const pairs: Array<[THREE.Material, THREE.Material, { vertexShader: string; fragmentShader: string }]> = [
      [track(createZelkovaLeafMaterial()), track(createZelkovaLeafMaterial('high')), THREE.ShaderLib.physical],
      [track(createZelkovaBarkMaterial()), track(createZelkovaBarkMaterial('high')), THREE.ShaderLib.physical],
      [track(createZelkovaLeafDepthMaterial()), track(createZelkovaLeafDepthMaterial('high')), THREE.ShaderLib.depth],
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
    expectKey(track(createZelkovaLeafMaterial()), 'zelkova:leaf+dither');
    expectKey(track(createZelkovaLeafMaterial('mid')), 'zelkova:leaf:mid+dither');
    expectKey(track(createZelkovaLeafMaterial('low')), 'zelkova:leaf:low+dither');
    expectKey(track(createZelkovaBarkMaterial()), 'zelkova:bark+dither');
    expectKey(track(createZelkovaBarkMaterial('mid')), 'zelkova:bark:mid+dither');
    expectKey(track(createZelkovaBarkMaterial('low')), 'zelkova:bark:low+dither');
    expectKey(track(createZelkovaLeafDepthMaterial()), 'zelkova:leaf-depth');
    expectKey(track(createZelkovaLeafDepthMaterial('mid')), 'zelkova:leaf-depth:mid');
    expectKey(track(createZelkovaLeafDepthMaterial('low')), 'zelkova:leaf-depth:low');
    expect(keys.size).toBe(9);
  });

  it('叶 Mid：SDF 与 High 同源全形（含齿载波——中距锯齿读向保留）+ 去叶脉两件/叶团；透光/叶背/hue·luma/shade 保留；片元零噪声', () => {
    const high = assemble(track(createZelkovaLeafMaterial()), THREE.ShaderLib.physical);
    const mid = assemble(track(createZelkovaLeafMaterial('mid')), THREE.ShaderLib.physical);
    expect(sdfOf(mid.fragmentShader)).toBe(sdfOf(high.fragmentShader)); // Mid SDF = High 同源全形
    expect(sdfOf(mid.fragmentShader)).toContain('zlkTooth'); // 含齿载波（中距锯齿是 vs 香樟全缘的辨识差）
    for (const gone of ['zlkVeinMid', 'zlkVeinLat', 'zlkClump']) {
      expect(mid.fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(mid.fragmentShader).not.toContain('(zlkClump - 0.5) * 0.06'); // 糙度注入同步去叶团项
    expect(mid.fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0'); // 透光保留
    expect(mid.fragmentShader).toContain('zlkTransVar');
    expect(mid.fragmentShader).toContain('float(gl_FrontFacing)'); // 叶背浅绿保留
    expect(mid.fragmentShader).toContain('vec3 zlkHue'); // hue·luma 逐叶变奏保留
    expect(mid.fragmentShader).toContain('float zlkLuma');
    expect(mid.fragmentShader).toContain('(0.80 + 0.20 * zlkShade)'); // 冠内竖向自遮蔽保留（地板 0.80 沿先例口径）
    expect(count(mid.fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0 调用（叶团去采样——Mid 片元零噪声执行）
  });

  it('叶 Low：SDF 换 SDF_LOW（去齿——锯齿细化；包络/偏斜/渐尖与 High 逐字同源）；去叶脉/叶团/透光；hue·luma/shade/叶背保留；片元零噪声', () => {
    const high = assemble(track(createZelkovaLeafMaterial()), THREE.ShaderLib.physical);
    const low = assemble(track(createZelkovaLeafMaterial('low')), THREE.ShaderLib.physical);
    const lowSdf = sdfOf(low.fragmentShader);
    expect(lowSdf).not.toBe(sdfOf(high.fragmentShader)); // Low SDF = 去齿版（换字符串）
    for (const gone of ['zlkTooth', 'zlkToothMod', 'zlkGate', 'zlkVeinMid', 'zlkVeinLat', 'zlkClump', 'zlkTransVar', 'vec3(0.60, 0.92, 0.34)']) {
      expect(low.fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    // 包络/偏斜/渐尖三项与 High 逐字同源（档间叶形身份一致的去细节不改形原则）
    expect(lowSdf).toContain('zlkP.x -= 0.030 * (1.0 - 0.7 * zlkP.y);');
    expect(lowSdf).toContain('pow(clamp(zlkP.y, 0.001, 0.999), 0.70)');
    expect(lowSdf).toContain('mix(0.72, 1.22, smoothstep(0.38, 0.95, zlkP.y))');
    expect(lowSdf).toContain('clamp(zlkEdge / 0.04 + 0.5'); // 坡宽同步（档间 AA 边一致）
    expect(count(low.fragmentShader, '#include <opaque_fragment>')).toBe(1); // 透光不注入但锚点原句不动
    expect(low.fragmentShader).toContain('float(gl_FrontFacing)'); // 叶背保留
    expect(low.fragmentShader).toContain('(0.80 + 0.20 * zlkShade)'); // shade 保留
    expect(low.fragmentShader).toContain('vec3 zlkHue'); // hue·luma 保留
    expect(count(low.fragmentShader, 'facVnoise(')).toBe(3); // 片元零噪声采样（库内 3 为死码，运行时零执行）
  });

  it('皮 Mid：去边缝暗线/暗色镶嵌（次级贴片细节）；斑驳本体（斑域 + 三色带）+ 上部紫褐 + 细枝弱化保留', () => {
    const { fragmentShader } = assemble(track(createZelkovaBarkMaterial('mid')), THREE.ShaderLib.physical);
    for (const gone of ['zlkBarkDark', '4.0 * 0.14', 'vec3(0.90, 0.88, 0.87)']) {
      expect(fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('zlkBarkFlake'); // 斑域保留（中距身份）
    expect(fragmentShader).toContain('vec3(1.35, 0.92, 0.64)'); // 三色带保留（锈橙——剥落斑驳色块本体；Step 4b 校准后与 High 同源）
    expect(fragmentShader).toContain('mix(1.0, 0.55, zlkBarkHigh)'); // 细枝斑驳弱化保留
    expect(fragmentShader).toContain('vec3(1.05, 0.99, 0.97)'); // 上部紫褐偏色保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 斑域 + 斑色 = 2× vnoise（斑驳本体采样不省——中距主要辨识特征）
  });

  it('皮 Low：斑驳系统全部去采样（剥落斑远距不可辨——Spec §7 牺牲顺序）；均值化常量乘子 + 上部紫褐偏色（结构剪影项）保留；片元零噪声', () => {
    const { fragmentShader } = assemble(track(createZelkovaBarkMaterial('low')), THREE.ShaderLib.physical);
    for (const gone of ['zlkBarkFlake', 'zlkBarkDomain', 'zlkBarkTone', 'zlkFlakeColor', 'zlkBarkDark']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('vec3(1.025, 0.980, 0.937)'); // 斑驳均值化常量乘子（Step 4b 校准 2026-09-20 按新阈值/色带 JS 采样重算：E[F]=0.241 × 新三色带均值 + 缝暗 + 暗镶完整式合成——旧 (1.036,0.987,0.941) 随旧分布失效）
    expect(fragmentShader).toContain('zlkBarkHigh'); // 高度门控保留（结构剪影项）
    expect(fragmentShader).toContain('vec3(1.05, 0.99, 0.97)'); // 上部紫褐偏色保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0 调用（光滑皮语言无脊沟结构项——Low 最省）
  });

  it('深度分档：Mid = High SDF（含齿）/ Low = SDF_LOW；与叶表面档内逐字一致（表面/影裁切档内一致）；三档零噪声库', () => {
    const high = assemble(track(createZelkovaLeafDepthMaterial()), THREE.ShaderLib.depth);
    const mid = assemble(track(createZelkovaLeafDepthMaterial('mid')), THREE.ShaderLib.depth);
    const low = assemble(track(createZelkovaLeafDepthMaterial('low')), THREE.ShaderLib.depth);
    const highSdf = sdfOf(high.fragmentShader);
    expect(sdfOf(mid.fragmentShader)).toBe(highSdf); // Mid 深度 = High SDF（同源全形含齿）
    expect(highSdf).toContain('zlkTooth'); // 中距锯齿影读向保留
    expect(sdfOf(low.fragmentShader)).not.toBe(highSdf); // Low 深度 = SDF_LOW（去齿）
    expect(sdfOf(low.fragmentShader)).not.toContain('zlkTooth');
    // 表面/影档内一致：叶表面各档 SDF === 深度各档 SDF
    for (const level of ['high', 'mid', 'low'] as const) {
      const surface = assemble(track(createZelkovaLeafMaterial(level)), THREE.ShaderLib.physical);
      const depthShader = assemble(track(createZelkovaLeafDepthMaterial(level)), THREE.ShaderLib.depth);
      expect(sdfOf(surface.fragmentShader)).toBe(sdfOf(depthShader.fragmentShader)); // 同一 GLSL 字符串（单一来源纪律）
      expect(count(depthShader.fragmentShader, 'facVnoise(')).toBe(0); // 三档深度零噪声库
    }
  });

  it('风动三档同源：叶/皮三档顶点 GLSL 全文一致（ZELKOVA_WIND 同一常量——档间相位一致 = 身份一致）', () => {
    const leafHigh = assemble(track(createZelkovaLeafMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createZelkovaBarkMaterial()), THREE.ShaderLib.physical);
    for (const level of ['mid', 'low'] as const) {
      const leaf = assemble(track(createZelkovaLeafMaterial(level)), THREE.ShaderLib.physical);
      const bark = assemble(track(createZelkovaBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(leaf.vertexShader).toBe(leafHigh.vertexShader);
      expect(bark.vertexShader).toBe(barkHigh.vertexShader);
    }
  });

  it('分档底参契约不因档破：叶三档 alphaTest/alphaToCoverage/DoubleSide/USE_UV/零贴图；皮 FrontSide；深度 alphaTest', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const leaf = track(createZelkovaLeafMaterial(level));
      const bark = track(createZelkovaBarkMaterial(level));
      const depth = track(createZelkovaLeafDepthMaterial(level));
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
    for (const make of [createZelkovaLeafMaterial, createZelkovaBarkMaterial]) {
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
    const leafA = track(createZelkovaLeafMaterial());
    const leafB = track(createZelkovaLeafMaterial());
    const barkA = track(createZelkovaBarkMaterial());
    const barkB = track(createZelkovaBarkMaterial());
    const depth = track(createZelkovaLeafDepthMaterial());
    expect(leafA).not.toBe(leafB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(leafA.customProgramCacheKey()).toBe(leafB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([leafA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
    expect(materialUniformsOf(leafA).uTime).not.toBe(materialUniformsOf(leafB).uTime); // uTime 桥接对象实例独立（dispose 安全）
    expect(materialUniformsOf(barkA).uTime).not.toBe(materialUniformsOf(barkB).uTime);
  });

  it('底参与侧向：叶 DoubleSide/半光泽微糙/USE_UV；皮 FrontSide/光滑微光/USE_UV；均零贴图', () => {
    const leaf = track(createZelkovaLeafMaterial());
    const bark = track(createZelkovaBarkMaterial());
    expect(leaf.side).toBe(THREE.DoubleSide);
    expect(leaf.metalness).toBe(0);
    expect(leaf.roughness).toBeGreaterThan(0.55); // 半光泽微糙（0.62——介于香樟 0.50 革质与朴树 0.72 半光泽）
    expect(leaf.roughness).toBeLessThan(0.7);
    expect(leaf.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.FrontSide);
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeGreaterThanOrEqual(0.85); // 光滑灰皮微弱光泽
    expect(bark.map).toBeNull();
    expect(leaf.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
  });
});

describe('成本记账（10 万实例每像素预算：叶 ≤8× / 皮 ≤7.5×，hash21=1×/vnoise=3×——齿调制 ALU 化红利）', () => {
  it('facVnoise 调用数：叶 High 1 处（3×）、Mid/Low 0 处；皮 High/Mid 2 处（6×）、Low 0 处；深度 0 处（零噪声库注入）；顶点零噪声', () => {
    const leaf = assemble(track(createZelkovaLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createZelkovaBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createZelkovaLeafDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(leaf.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（叶团斑块——齿调制 ALU 化免齿噪声）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（斑域 + 斑色）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(0); // 深度零噪声库注入（齿调制 ALU 化先天满足影 pass 不吃噪声）
    expect(count(leaf.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin/cos
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零循环/零纹理采样（配方确定性纯函数 + SDF 纯 ALU）', () => {
    const shaders = [
      assemble(track(createZelkovaLeafMaterial()), THREE.ShaderLib.physical),
      assemble(track(createZelkovaBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createZelkovaLeafDepthMaterial()), THREE.ShaderLib.depth),
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
    for (const make of [createZelkovaLeafMaterial, createZelkovaBarkMaterial, createZelkovaLeafDepthMaterial]) {
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
    const leaf = track(createZelkovaLeafMaterial());
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

    const depth = track(createZelkovaLeafDepthMaterial());
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
    const bark = track(createZelkovaBarkMaterial());
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

    const leaf = track(createZelkovaLeafMaterial());
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

    const leaf = assemble(track(createZelkovaLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createZelkovaBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createZelkovaLeafDepthMaterial()), THREE.ShaderLib.depth);
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
    const material = track(createZelkovaLeafMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});
