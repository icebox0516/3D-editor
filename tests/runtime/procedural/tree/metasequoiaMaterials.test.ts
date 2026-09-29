/**
 * tests/runtime/procedural/tree/metasequoiaMaterials.test.ts —— 水杉羽卡/树皮/深度
 * 材质测试（T012.2 Step 3b，对称 cedrusMaterials.test.ts 范式：真实 THREE.ShaderLib
 * 源组装，静态字符串断言，零 WebGL；build()/资产入口归并行几何 agent 的资产测试，
 * 此处不覆盖）。**针叶族（conifer）第二例材质测试——首个 preset 双卡 + 三帧卡域**。
 * 新增语义六者准入（D40）：羽卡三帧 SDF 新形态语言（对生羽列窗列 + 球果盘 + 枯穗
 * 纺锤）/ 两面温和色差（族内差异轴——vs 雪松无两面差反向）/ 第 15 树皮语言（纵长
 * 条片-纤维剥落）/ 双卡材质变体（T024 模式）/ 深度同源变体（22/14/8 随档）/
 * EXPECTED_PRESETS 行（另见 tests/runtime/procedural/assets/assetColorPresets.test.ts）。
 *
 * 覆盖：
 * - uTime 接线（TimeUniformService 消费协议）：羽/皮材质挂材质级 uniforms.uTime（own
 *   property）；onBeforeCompile 后 shader.uniforms.uTime 与材质级同对象引用；GLSL 声明
 *   uniform float uTime；材质挂场景被服务逐帧驱动（frame 写值闭环）；
 * - 风动契约（D19.7 + 判定 8 **两成分**）：aSeed/aBend/aLeafRand 顶点 attribute 声明
 *   存在；相位 = fract(sin(...)) 类 hash（aSeed=0 缺省属性路径退化为常数相位，全源零除
 *   aSeed——无 NaN）；两成分在位（①整冠 0.32Hz×0.018m 高度权重² + ②末级羽枝颤
 *   2.6Hz×0.055m aBend 权重）+ **顶梢成分零在位**（leader 通直——族内可选·雪松消费
 *   位，判定 4/8）；整冠摆羽/皮同公式（同串出现——防撕裂）；**树高锚 20**
 *   （METASEQUOIA_TREE_HEIGHT_NOMINAL + 1/20 = 0.05000 注入 + 锚同步轮断言）；
 * - instanceColor 乘算链安全：注入后 <color_fragment> 原句恰一次、注入代码零 vColor 介入；
 * - 三帧卡 SDF 与透光：alphaTest 0.5 + alphaToCoverage；片元含 msqCardAlpha 计算式与
 *   alpha 写入；**三帧路由**（羽卡 v∈[0,1) / 球果卡 v∈[1,2) / 枯穗卡 v∈[2,3)——阈值
 *   1.0/2.0，SDF 生成器三工厂注入同串 + **色层路由在皮材质**〔3a 冻结：器官卡入组 0，
 *   羽材质零器官色层〕+ 深度同 SDF 路由）；羽卡形态（对生对数分档 11/7/4 =
 *   22/14/8 元素 + 镜像求值 + 叶角 45–60° 带内 JS 锚 + 卵状椭圆包络 + 胶囊先端钝圆 +
 *   中轴渐细）；器官帧轮廓 = **v 埧圆端带**（u = 逐果/逐穗色档常量〔3a posHash 契约〕
 *   ——横向盘形/4 列/穗轴中线不可表达，负面断言锁弱化记档）；深度材质含同一 SDF
 *   生成器输出（单一来源，**档内表面/影同串**）+ RGBADepthPacking + 组 0 守卫
 *   （aLeafRand=0 实心——器官卡同守卫 → 影实心方卡剪影记档）+ USE_UV +
 *   alphaTest；透光项存在且 NUM_DIR_LIGHTS 守卫 + 羽卡域门控（器官帧不透光）；风动
 *   不进 depth pass；
 * - 物种配方锚定（Spec metasequoia-reference 1.0 §5/§风动/§5.4）：**受光色差阳端锚定
 *   ramp**（冠基 8.0 = trunkHeightRatio 0.40 × 20 同源锚 + 荫端 = needleColorShade/Sun
 *   sRGB 比值 × 0.65 软化 JS 锚——阳端 ×(1,1,1) = swatch 基色锚定，vs 雪松构造中点式）；
 *   **两面温和色差**（needleFaceContrast 0.22 上深下浅——gl_FrontFacing 在位 + 端点
 *   = 1 + 0.22×(0.50,0.64,0.27) JS 锚；**vs 雪松无两面差的反向分化**；深度 pass 零
 *   gl_FrontFacing）/ 幼叶 7% 卡域内变体 / 亮黄绿基色 #8ab65a（= profile
 *   needleColorSun——阳端锚定 + swatch 对齐锚）/ 糙度 0.70 软条形叶（family 链位）/
 *   透光试探 0.46（家族链 0.65 > 水杉 > 雪松 0.38——判定 8 带试探）/ 透射色亮黄绿；
 *   **球果域（皮材质）**（绿近熟 0x55793f 线性端点 JS 锚 + 种鳞行带横沟纹〔「4 列」
 *   周向列纹 u 色档契约下不可表达——负面断言锁弱化记档〕+ vUv.x 色档变奏）；
 *   **枯穗域（皮材质）**（枯褐 0x9a7f4d 线性端点 JS 锚 + 孢子囊痕沿轴格点 + 穗轴
 *   中线不可表达负面断言）；**第 15 树皮**（#7a5138 红褐-桂皮棕基 + 周向 32 × 纵向
 *   96 段频率/管程〔v ∈ [0,0.92] 逐管归一 3a 契约〕条片网格 + 脊:沟 2–3:1 JS 锚
 *   （0.08 + 0.09×0.68 沟半宽）+ 三调色端点 JS 锚（沟/脊顶对基色比值 × 0.90/0.70
 *   软化）+ 长纤维条翘边 + 横向断口 + 逐段深浅 + 幼淡橙褐→老暗红褐株内梯度 + 一年生
 *   小枝淡红绿 + 地衣 High + 干基暗化）；皮材质 DoubleSide + alphaTest 0.5（器官
 *   单面卡双面读向 + 圆端带裁切——皮域 alpha 恒 1 实心）；
 * - preset 双卡（T024 / D44）：default = 现行数值单一定义源（缺省/'default'/未知 id
 *   三路径一致）；autumn = 锈橙-红褐 #a55d2c（= 3a meta swatch 同值三处同源；hue
 *   中带偏红褐 + 深于夏相 JS 锚）；
 *   **program 不增红线**：两卡 GLSL 逐位同源 + customProgramCacheKey 相同（preset
 *   不进键）；
 * - 分档实装（level 参数，缺省 'high'）：三工厂缺省 ≡ 显式 'high'（属性 + 键 + GLSL
 *   全文逐位相等）；3 工厂 × 3 档 = 9 键互异；羽 Mid 羽列 14 元素 + 去簇团/糙度项
 *   （受光/两面差/幼叶/透光保留）、Low 8 元素 + 再去透光、片元零噪声；皮 Mid 去地衣/
 *   翘边微暗、Low 再去逐段深浅/株内梯度/小枝淡红绿/干基暗化（条片三色剖面 + 断口
 *   剪影保留；器官帧三档同体）；深度 SDF **随档变体**（22/14/8——档内表面/影一致）；
 *   风动三档顶点 GLSL 同源；分档底参契约不因档破；uTime 桥接三档不缺位；器官帧
 *   糙度三档定值（皮材质）；
 * - program 键纪律：羽/皮/深度三键互异；两次工厂调用材质对象不同（无模块级共享，
 *   D17）但键相同；uniforms 不跨实例共享；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：羽 High 片元 facVnoise
 *   1 处（簇团）、Mid/Low 0 处；皮 High 2 处（游走 + 地衣）、Mid/Low 1 处；深度
 *   0 处（零噪声库注入）；顶点零噪声；全源零数据依赖循环（羽列 SDF 固定 3 次三候选
 *   循环白名单——编译期常量 trip count 纯 ALU）/零纹理采样；
 * - 注入点缺失即抛（map_fragment/begin_vertex/common/roughnessmap_fragment/
 *   opaque_fragment 摘除各暴雷）；
 * - 结构完整性：include 全展开后花括号配平差值与原版一致（注入不破坏 GLSL 结构）；
 * - TimeUniformService.freeze：冻结期间广播仍写当前值（uTime 常量——树静止）+ 材质兼容。
 * 边界：材质登记 afterEach 统一 dispose 兜底，不跨测试泄漏。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { WebGLProgramParametersWithUniforms } from 'three';
import { TimeUniformService } from '../../../../src/runtime/services/TimeUniformService';
import {
  createMetasequoiaBarkMaterial,
  createMetasequoiaNeedleDepthMaterial,
  createMetasequoiaNeedleMaterial,
  METASEQUOIA_TREE_HEIGHT_NOMINAL,
} from '../../../../src/runtime/procedural/tree/metasequoia/metasequoiaMaterials';
import { assemble, braceDelta, count, createMaterialTracker, expandIncludes, materialUniformsOf, propsOf, sdfOf as extractSdf } from '../../../support/procedural-tree/materialHarness';

const { track, disposeAll } = createMaterialTracker();

/** 提取注入后的 msqCardAlpha 函数全文（SDF 单一来源比对用；首个 \n} 即函数闭合） */
const sdfOf = (fragmentShader: string): string =>
  extractSdf(fragmentShader, 'float msqCardAlpha(vec2 msqUv, float msqRand)');

afterEach(() => {
  disposeAll();
});

describe('uTime 接线（TimeUniformService 消费协议）', () => {
  it('羽/皮材质挂材质级 uniforms.uTime；编译后 shader.uniforms.uTime 同引用；GLSL 声明 uniform', () => {
    for (const material of [track(createMetasequoiaNeedleMaterial()), track(createMetasequoiaBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('材质挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const needle = track(createMetasequoiaNeedleMaterial());
    const bark = track(createMetasequoiaBarkMaterial());
    const clock = new TimeUniformService();
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), needle));
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), bark));
    clock.frame(0, scene);
    expect(materialUniformsOf(needle).uTime!.value).toBe(0);
    clock.frame(1000, scene);
    expect(materialUniformsOf(needle).uTime!.value).toBeCloseTo(1, 10); // 服务写一次两边生效
    expect(materialUniformsOf(bark).uTime!.value).toBeCloseTo(1, 10);
  });
});

describe('风动契约（D19.7 + 判定 8：两成分——顶梢成分不消费）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）', () => {
    const needle = assemble(track(createMetasequoiaNeedleMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(needle.vertexShader).toContain(decl);
    }
    expect(needle.vertexShader).toContain('fract(sin(aSeed * 107.317'); // 整树相位 = hash(aSeed)——常数与先例相位流（sway 77.669–96.441）去相关
    expect(needle.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 84.931'); // 颤动相位 = hash(aSeed+卡身份)——个体 + 逐卡双相位差
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(needle.vertexShader + needle.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('两成分在位：整冠 0.32Hz×0.018 / 末级羽枝颤 2.6Hz×0.055（aBend——主成分）；顶梢成分零在位；频率 = profile Hz × 2π JS 锚', () => {
    const needle = assemble(track(createMetasequoiaNeedleMaterial()), THREE.ShaderLib.physical);
    // 成分①：整冠低频小幅摆（密尖塔冠 + 通直骨干——Spec §风动读向 Inferred）
    expect(needle.vertexShader).toContain('msqWindH * msqWindH * 0.018 * sin(uTime * 2.0106');
    // 成分②：末级羽枝高频细颤（主成分——细软条形叶 + 下垂羽状轻质单元；aBend 权重，组 0 恒 0 免颤）
    expect(needle.vertexShader).toContain('aBend * 0.055 * sin(uTime * 16.3363');
    // 顶梢成分零在位（leader 通直无点头——族内可选·雪松消费位；判定 4/8）
    expect(needle.vertexShader).not.toContain('msqLead');
    expect(count(needle.vertexShader, 'sin(uTime')).toBe(2); // 恰两成分
    // 频率 JS 锚：windTier/FringeFrequency (Hz) × 2π → rad/s 字面量（4 位小数一致）
    expect((0.32 * Math.PI * 2).toFixed(4)).toBe('2.0106');
    expect((2.6 * Math.PI * 2).toFixed(4)).toBe('16.3363');
    // family 快颤链 9–23 rad/s 内带（16.34）
    expect(2.6 * Math.PI * 2).toBeGreaterThan(9);
    expect(2.6 * Math.PI * 2).toBeLessThan(23);
  });

  it('整冠摆羽/皮同公式（同串出现——皮不动叶动会撕裂穿帮）；树高锚 20（×0.05000 锚同步轮）', () => {
    const needle = assemble(track(createMetasequoiaNeedleMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createMetasequoiaBarkMaterial()), THREE.ShaderLib.physical);
    const tierCore = 'msqWindH * msqWindH * 0.018 * sin(uTime * 2.0106';
    expect(needle.vertexShader).toContain(tierCore);
    expect(bark.vertexShader).toContain(tierCore); // 同公式同相位
    // 树高锚：METASEQUOIA_TREE_HEIGHT_NOMINAL = 20（slot-0 totalHeight 同源——18–25m 同步轮）+ 1/20 注入
    expect(METASEQUOIA_TREE_HEIGHT_NOMINAL).toBe(20);
    expect((1 / METASEQUOIA_TREE_HEIGHT_NOMINAL).toFixed(5)).toBe('0.05000');
    expect(needle.vertexShader).toContain('position.y * 0.05000');
    expect(bark.vertexShader).toContain('position.y * 0.05000');
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createMetasequoiaNeedleMaterial()), track(createMetasequoiaBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('三帧卡 SDF 与透光', () => {
  it('alphaTest 0.5 + alphaToCoverage；片元含 SDF 计算式并写入 alpha（三帧统一写入）', () => {
    const material = track(createMetasequoiaNeedleMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float msqCardAlpha('); // 三帧 SDF 函数（单一来源生成器）
    expect(fragmentShader).toContain('msqCardAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = msqAlpha;'); // alphatest_fragment 上游写入（三帧分支前统一）
    expect(count(fragmentShader, 'diffuseColor.a = msqAlpha;')).toBe(1);
  });

  it('三帧路由：羽卡 v∈[0,1) / 球果卡 v∈[1,2) / 枯穗卡 v∈[2,3)——阈值 1.0/2.0（SDF 三工厂同串 + 色层路由在皮材质 + 深度同 SDF）', () => {
    const leaf = assemble(track(createMetasequoiaNeedleMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('if (msqUv.y < 1.0)'); // SDF 帧判据（羽卡）
    expect(leaf.fragmentShader).toContain('} else if (msqUv.y < 2.0)'); // SDF 帧判据（球果 → 枯穗）
    const bark = assemble(track(createMetasequoiaBarkMaterial()), THREE.ShaderLib.physical);
    expect(bark.fragmentShader).toContain('if (msqUv.y < 1.0)'); // 皮材质注入同一 SDF 生成器（单一来源——皮/羽/深度三工厂同串）
    expect(bark.fragmentShader).toContain('if (vUv.y >= 2.0)'); // 色层枯穗域（3a 冻结：器官卡入组 0——色层路由在皮材质）
    expect(bark.fragmentShader).toContain('} else if (vUv.y >= 1.0)'); // 色层球果域
    expect(bark.fragmentShader).toContain('diffuseColor.a = msqAlpha;'); // 皮域恒 1 实心 / 器官域圆端带
    expect(leaf.fragmentShader).not.toContain('if (vUv.y >= 2.0)'); // 羽材质零器官色层（组 1 纯羽卡帧）
    expect(leaf.fragmentShader).not.toContain('if (vUv.y >= 1.0)');
    const depth = assemble(track(createMetasequoiaNeedleDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).toContain('msqUv.y < 1.0'); // 深度同路由（表面/影一致）
    expect(depth.fragmentShader).toContain('msqUv.y < 2.0');
  });

  it('羽卡形态：对生羽列窗列（11 对 = 22 元素 High）+ 镜像求值 + 叶角 45–60° 带内 + 卵状椭圆包络 + 胶囊先端钝圆 + 中轴渐细（JS 数值锚）', () => {
    const { fragmentShader } = assemble(track(createMetasequoiaNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('0.999) * 11.0'); // N = 11 对/侧（profile rosetteNeedles 22 元素 High 基准 → 对生对）
    expect(22 / 2).toBe(11); // 元素/对 恒等派生 JS 锚（冻结单 22/14/8）
    expect(fragmentShader).toContain('abs(msqP.x)'); // 镜像求值——对生成对左右列一次覆盖（MoBot 对生对 Verified）
    expect(fragmentShader).toContain('float msqTh = 0.907 + (fract(msqH * 7.31) - 0.5) * 0.22;'); // 叶角 52° ± 6.3°（逐对抖动）
    expect((0.907 * 180) / Math.PI).toBeGreaterThan(45); // Spec「与小枝轴 45–60°」Verified [2] 带内
    expect((0.907 * 180) / Math.PI).toBeLessThan(60);
    expect(fragmentShader).toContain('pow(sin(3.14159 * clamp(msqYc, 0.02, 0.98)), 0.6)'); // 卵状椭圆包络（3–7 × 1.5–4 cm Verified——中部最宽两端圆收）
    expect(fragmentShader).toContain('sqrt(msqLat * msqLat + (msqT - msqTC) * (msqT - msqTC))'); // 胶囊 SDF——先端钝圆（圆头端帽，vs 雪松针形向尖收窄）
    expect(fragmentShader).toContain('0.80 + 0.36 * fract(msqH * 5.17)'); // 逐叶长 0.80–1.16（长短叶不规则交替 FoC Verified）
    expect(fragmentShader).toContain('float msqW = 0.030 + 0.007 * fract(msqH * 3.17);'); // 逐叶半宽（条形叶 1.2–2mm 卡映射）
    expect(fragmentShader).toContain('mix(0.020, 0.008, clamp(msqP.y, 0.0, 1.0))'); // 中轴渐细条（基部 0.020 → 尖部 0.008）
    // 覆盖度 JS 锚：最宽对叶侧向 reach ≥ 0.49（达卡半宽缘——羽列满幅）+ 中部叶 v 跨度 > 2×对距（相邻羽叶搭接——密羽列读向）
    expect(0.63 * Math.sin(0.907)).toBeGreaterThan(0.49);
    expect(0.63 * Math.cos(0.907)).toBeGreaterThan((2 * 1) / 11);
  });

  it('器官帧轮廓：v 埧圆端带（u = 逐果/逐穗色档常量——3a posHash 契约下无横向坐标；交叉双卡承载体积读向）；横向结构负面断言锁弱化记档', () => {
    const bark = assemble(track(createMetasequoiaBarkMaterial()), THREE.ShaderLib.physical);
    // 圆端带 SDF（两端圆收 AA 肩 0.08——cm 级器官口径；卡幅 = 几何按器官尺寸 + 15% 边距定幅）
    expect(bark.fragmentShader).toContain('msqAlpha = msqCardAlpha(vUv, 0.0);'); // 器官轮廓 = 三帧生成器圆端带（单一来源；aLeafRand 恒 0 传常数）
    expect(bark.fragmentShader).toContain('clamp((0.5 - abs(msqCn - 0.5)) / 0.08 + 0.5, 0.0, 1.0)'); // 球果圆端带（熟时 1.4–2.5 × 1.6–2.3 cm Verified [1][2] 近球形——体积读向由交叉双卡承载）
    expect(bark.fragmentShader).toContain('clamp((0.5 - abs(msqSk - 0.5)) / 0.08 + 0.5, 0.0, 1.0)'); // 枯穗圆端带（3–5cm s04 Observed——窄卡宽比 0.3 几何定幅）
    // 横向结构不可表达（u = 色档常量——几何 emitConeCard/emitStrobilusCard 顶点 uv.x 全同值）：
    // 中心放射盘/纺锤包络/细穗轴中线均需空间横向坐标 → 弱化记档（缺口候选②）——负面断言防回归
    expect(bark.fragmentShader).not.toContain('msqPc');
    expect(bark.fragmentShader).not.toContain('msqPs');
    const depth = assemble(track(createMetasequoiaNeedleDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).toContain('0.5 - abs(msqCn - 0.5)'); // 深度同串圆端带（单一来源——SDF 三帧路由含器官帧，器官卡 aLeafRand=0 走实心守卫）
  });

  it('深度材质（羽影裁切）：同一 SDF + RGBADepthPacking + 组 0 守卫实心 + USE_UV + alphaTest；风动不进 depth；零噪声库注入', () => {
    const material = track(createMetasequoiaNeedleDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.depthPacking).toBe(THREE.RGBADepthPacking);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('msqCardAlpha(vUv, vLeafRand)');
    expect(shader.fragmentShader).toContain('step(0.0001, vLeafRand)'); // 组 0 aLeafRand=0 → 实心（皮圆柱 uv 域不误裁）；器官卡非零 → 三帧裁切
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
    expect(count(shader.fragmentShader, 'facVnoise(')).toBe(0); // 零噪声库注入——SDF 零噪声引用（影 pass 不吃噪声）
    expect(shader.fragmentShader).not.toContain('facHash21'); // 噪声库整体未挂（SDF 引入噪声即编译暴雷——保护性约束）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫 + 羽卡域门控（器官帧不透光）', () => {
    const { fragmentShader } = assemble(track(createMetasequoiaNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(fragmentShader).toContain('directionalLights[0]');
    expect(fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
    expect(fragmentShader).toContain('step(vUv.y, 0.999)'); // 羽卡域门控（球果/枯穗帧透光归零）
  });
});

describe('物种配方锚定（Spec metasequoia-reference 1.0 §5/§5.4/§风动）', () => {
  it('受光色差（阳端锚定 ramp）：冠基 8.0 同源锚 + 荫端 = needleColorShade/Sun 比值 × 0.65 软化（JS 锚）+ 阳端 ×(1,1,1)', () => {
    const { fragmentShader } = assemble(track(createMetasequoiaNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float msqExp = clamp((vTreePos.y - 8.0) / 6.0, 0.0, 1.0);'); // 冠基 8.0 = trunkHeightRatio 0.40 × 20 锚（slot-0 同源）
    expect(0.4 * 20).toBe(8); // 同源推导自证
    expect(fragmentShader).toContain('vec3 msqLight = mix(vec3(0.708, 0.743, 0.783), vec3(1.0), msqExp);'); // 荫深绿 ↔ 阳亮黄绿（阳端 = swatch 基色锚定）
    // 荫端 JS 锚：shade/sun sRGB 比值 × 0.65 软化（1 − 0.65×(1−ratio)）
    const soften = (ratio: number): number => 1 - 0.65 * (1 - ratio);
    const sun = 0x8ab65a, shade = 0x4c6e3c;
    expect(soften(((shade >> 16) & 0xff) / ((sun >> 16) & 0xff))).toBeCloseTo(0.708, 2);
    expect(soften(((shade >> 8) & 0xff) / ((sun >> 8) & 0xff))).toBeCloseTo(0.743, 2);
    expect(soften(((shade >> 0) & 0xff) / ((sun >> 0) & 0xff))).toBeCloseTo(0.783, 2);
  });

  it('两面温和色差（needleFaceContrast 0.22——上深下浅，族内差异轴）：gl_FrontFacing 在位 + 端点 JS 锚；深度 pass 零 gl_FrontFacing（vs 雪松无两面差的反向分化）', () => {
    const { fragmentShader } = assemble(track(createMetasequoiaNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float msqFaceBack = 1.0 - float(gl_FrontFacing);'); // 背（下）面标志（DoubleSide 卡）
    expect(fragmentShader).toContain('vec3 msqFaceMul = mix(vec3(1.0), vec3(1.110, 1.141, 1.059), msqFaceBack);'); // 提亮微去饱和「paler abaxially」
    // 端点 JS 锚：1 + 0.22 × (0.50, 0.64, 0.27)（强度 0.22 温和档工程映射）
    expect(1 + 0.22 * 0.5).toBeCloseTo(1.110, 3);
    expect(1 + 0.22 * 0.64).toBeCloseTo(1.141, 3);
    expect(1 + 0.22 * 0.27).toBeCloseTo(1.059, 3);
    const depth = assemble(track(createMetasequoiaNeedleDepthMaterial()), THREE.ShaderLib.depth);
    expect(depth.fragmentShader).not.toContain('gl_FrontFacing'); // 深度 pass 只裁 alpha，无面色语义
  });

  it('幼叶 7% 卡域内变体（needleJuvenility 0.15 × 新梢少数相 0.45）+ hue·luma 逐卡变奏', () => {
    const { fragmentShader } = assemble(track(createMetasequoiaNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('step(fract(vLeafRand * 6.913 + 0.37), 0.07)'); // 幼叶份额（0.15 × 0.45 ≈ 0.0675 → 0.07）
    expect(0.15 * 0.45).toBeCloseTo(0.07, 2);
    expect(fragmentShader).toContain('vec3(1.12, 1.14, 1.06)'); // 幼叶淡绿（当年生小枝淡绿读向）
    expect(fragmentShader).toContain('vec3(0.97, 1.00, 1.02), vec3(1.04, 1.03, 0.94)'); // hue 两端（冷绿 ↔ 暖黄绿——通道摆幅 ≤15%）
    expect(fragmentShader).toContain('float msqLuma = 0.92 + 0.16 * fract(vLeafRand * 3.613 + 0.53);'); // 明度 ±8%（去相关取样）
  });

  it('亮黄绿基色 #8ab65a（阳端锚定 swatch 对齐——profile needleColorSun）；糙度 0.70 软条形叶（family 链位）；糙度两面同值', () => {
    const needle = track(createMetasequoiaNeedleMaterial());
    const hex = needle.color.getHex();
    expect(hex).toBe(0x8ab65a); // 现行数值（Spec §5.1 上面 bluish/yellowish green Verified + 9 月末亮黄绿 s04 Observed）
    expect(hex).toBe(0x8ab65a & 0xffffff); // = profile needleColorSun（metasequoiaShapeProfile 冻结值——swatch 对齐锚，3a meta 预期同值）
    expect(needle.roughness).toBe(0.70); // 软条形叶薄软哑光（工程设定——family 链：樟 0.50 < 雪松 0.66 < ginkgo 0.68 < 水杉）
    expect(needle.roughness).toBeGreaterThan(0.68); // > ginkgo 薄纸质（软条形更哑）
    expect(needle.metalness).toBe(0);
  });

  it('背光透射（细质地软叶·试探值 0.46）：家族链 夏栎 0.65 > 水杉 > 雪松 0.38；透射色亮黄绿向', () => {
    const { fragmentShader } = assemble(track(createMetasequoiaNeedleMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('* pow(msqBack, 3.0) * msqTransVar * msqAlpha * step(vUv.y, 0.999) * 0.46;');
    expect(fragmentShader).toContain('vec3(0.72, 0.94, 0.38)'); // 亮黄绿基调（亮黄绿冠透光读向）
    expect(0.46).toBeGreaterThan(0.38); // > 雪松 0.38（角质硬针）——软条形落叶叶透光强
    expect(0.46).toBeLessThan(0.65); // < 夏栎 0.65（宽薄阔叶）——窄条形 1.2–2mm 透光面小
    expect(fragmentShader).not.toContain('* 0.38;'); // 雪松峰值不串种
    expect(fragmentShader).not.toContain('* 0.65;'); // 夏栎峰值不串种
  });

  it('球果域（皮材质三分支，冻结域 v∈[1,2)）：绿近熟线性端点（JS 锚）+ 种鳞行带横沟纹 + vUv.x 色档变奏；「4 列」不可表达负面断言', () => {
    const { fragmentShader } = assemble(track(createMetasequoiaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('vec3(0.091, 0.191, 0.050)'); // coneColorMature 0x55793f sRGB→线性（绿近熟——主语境 9–10 月）
    const s2l = (c: number): number => Math.pow((c / 255 + 0.055) / 1.055, 2.4);
    const mature = 0x55793f;
    expect(s2l((mature >> 16) & 0xff)).toBeCloseTo(0.091, 2);
    expect(s2l((mature >> 8) & 0xff)).toBeCloseTo(0.191, 2);
    expect(s2l(mature & 0xff)).toBeCloseTo(0.050, 2);
    expect(fragmentShader).toContain('fract(msqCs * 5.0)'); // 种鳞行带（5 行——交叉双卡复合读向；种鳞 16–24 Verified [1] + s06 盾面 Observed）
    expect(fragmentShader).toContain('1.0 - smoothstep(0.06, 0.14, msqEdge)'); // 横沟纹暗线（嘟唇纹 s06 Observed——u 色档契约下仅 v 埧行带可表达）
    expect(fragmentShader).toContain('0.88 + 0.24 * fract(vUv.x * 7.313 + 0.29)'); // ±12% 变奏（u = 逐果色档——aLeafRand 恒 0 不可用）
    expect(fragmentShader).not.toContain('msqCc'); // 「4 列」周向列纹需横向坐标——u 色档契约下不可表达（弱化记档缺口候选②，负面断言防回归）
    expect(fragmentShader).not.toContain('msqRowPar');
  });

  it('枯穗域（皮材质三分支，冻结域 v∈[2,3)）：枯褐线性端点（JS 锚）+ 散生孢子囊痕沿轴格点 + vUv.x 色档变奏；穗轴中线不可表达负面断言', () => {
    const { fragmentShader } = assemble(track(createMetasequoiaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('vec3(0.323, 0.212, 0.074)'); // strobilusColor 0x9a7f4d sRGB→线性（枯褐）
    const s2l = (c: number): number => Math.pow((c / 255 + 0.055) / 1.055, 2.4);
    const stro = 0x9a7f4d;
    expect(s2l((stro >> 16) & 0xff)).toBeCloseTo(0.323, 2);
    expect(s2l((stro >> 8) & 0xff)).toBeCloseTo(0.212, 2);
    expect(s2l(stro & 0xff)).toBeCloseTo(0.074, 2);
    expect(fragmentShader).toContain('step(msqSh, 0.62) * (1.0 - smoothstep(0.35, 0.65, msqCell))'); // 散生孢子囊痕（沿轴格点暗点带——62% 痕位 + 逐穗色档偏移去克隆）
    expect(fragmentShader).toContain('msqStro *= 1.0 - msqScar * 0.22;'); // 疤痕暗点
    expect(fragmentShader).toContain('0.88 + 0.24 * fract(vUv.x * 5.713 + 0.61)'); // ±12% 变奏（u = 逐穗色档）
    expect(fragmentShader).not.toContain('msqScFr'); // 孢子囊痕二维抖动格点旧式（横向坐标）——u 契约下不可表达，负面断言防回归
    expect(fragmentShader).not.toContain('abs(msqCs.x - 0.5)'); // 穗轴中线需横向坐标——同弱化记档
  });

  it('第 15 树皮（纵长条片-纤维剥落）：红褐-桂皮棕基 + 周向 32 × 纵向 96 段频率/管程条片网格 + 脊:沟 2–3:1（JS 锚）+ 三调色端点（JS 锚）', () => {
    const bark = track(createMetasequoiaBarkMaterial());
    expect(bark.color.getHex()).toBe(0x7a5138); // barkBaseColor（s08 Observed 红褐/桂皮棕 + FoC "dark reddish brown" Verified [2]）
    const { fragmentShader } = assemble(track(createMetasequoiaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('vUv.x * 32.0 + msqBarkWarp * 1.6'); // 周向 32 条片列（宽 ≈4cm @干周 ≈1.3m——3c 校准回路）
    expect(fragmentShader).toContain('vUv.y * 96.0 + msqBarkWarp * 0.6'); // 纵向 96 段频率/管程（v ∈ [0,0.92] 逐管归一 3a 契约——雪松 72 同型口径）
    expect(20 / (0.92 * 96)).toBeGreaterThan(0.12); // 主干段长 ≈0.227m ⊂ barkPlateMin/Span 0.12–0.22 近真域（上缘）自证
    expect(20 / (0.92 * 96)).toBeLessThan(0.25);
    expect(fragmentShader).toContain('float msqGh = 0.08 + 0.09 * 0.68;'); // 沟半宽（barkGrooveDepth 0.68 深端消费）
    const gh = 0.08 + 0.09 * 0.68;
    expect((1 - 2 * gh) / (2 * gh)).toBeGreaterThan(2); // 脊:沟 ∈ 2–3:1（s08 Observed）
    expect((1 - 2 * gh) / (2 * gh)).toBeLessThan(3);
    expect(fragmentShader).toContain('1.0 - smoothstep(msqGh - 0.035, msqGh + 0.035, msqDe)'); // 深索陡壁剖面（±0.035 急变）
    expect(fragmentShader).toContain('vec3(0.609, 0.611, 0.582), msqRidge, msqPlateau'); // 沟 ↔ 脊
    expect(fragmentShader).toContain('vec3(1.0), vec3(1.120, 1.354, 1.525), smoothstep(0.26, 0.40, msqDe)'); // 脊侧 → 脊顶风化灰褐
    // 色端 JS 锚：barkGrooveColor/barkPlateColor 对基色 sRGB 比值 × 0.90/0.70 观感软化
    const base = 0x7a5138, plate = 0x8f7a62, groove = 0x452e1e;
    expect(1 - 0.9 * (1 - ((groove >> 16) & 0xff) / ((base >> 16) & 0xff))).toBeCloseTo(0.609, 2);
    expect(1 - 0.9 * (1 - ((groove >> 8) & 0xff) / ((base >> 8) & 0xff))).toBeCloseTo(0.611, 2);
    expect(1 - 0.9 * (1 - ((groove >> 0) & 0xff) / ((base >> 0) & 0xff))).toBeCloseTo(0.582, 2);
    expect(1 + 0.7 * (((plate >> 16) & 0xff) / ((base >> 16) & 0xff) - 1)).toBeCloseTo(1.120, 2);
    expect(1 + 0.7 * (((plate >> 8) & 0xff) / ((base >> 8) & 0xff) - 1)).toBeCloseTo(1.354, 2);
    expect(1 + 0.7 * (((plate >> 0) & 0xff) / ((base >> 0) & 0xff) - 1)).toBeCloseTo(1.525, 2);
    expect(fragmentShader).not.toContain('cedGd'); // 雪松鳞状语言不串种（第 14/15 语言分化）
    expect(fragmentShader).not.toContain('cedPlateau');
  });

  it('皮域其余：长纤维条翘边 + 横向断口 + 逐段深浅 + 幼淡橙褐→老暗红褐株内梯度 + 一年生小枝淡红绿 + 地衣（High）+ 干基暗化', () => {
    const { fragmentShader } = assemble(track(createMetasequoiaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('sin(msqBg.y * 47.0 + msqStripH * 6.28318) * 0.05'); // 长纤维条翘边（缘区高频细须——横向微扰）
    expect(fragmentShader).toContain('1.0 - msqEdgeZone * 0.12'); // 翘边缘区微暗（High）
    expect(fragmentShader).toContain('msqStripH * 7.31'); // 纵向段相位逐列错开（断口交错——「不规则」剥落）
    expect(fragmentShader).toContain('1.0 - msqCross * 0.18'); // 横向断口沟
    expect(fragmentShader).toContain('0.92 + 0.16 * msqSegH'); // 逐段深浅（剥落代际明暗）
    expect(fragmentShader).toContain('msqSmoothUp = smoothstep(9.0, 14.0, vTreePos.y);'); // 上部幼龄域门
    expect(fragmentShader).toContain('vec3(1.14, 1.05, 0.86), msqSmoothUp * 0.60'); // 幼淡橙褐（FoC "pale orange-brown" Verified [2] 株内梯度）
    expect(fragmentShader).toContain('vec3(1.12, 1.08, 0.98), msqTwig * 0.65'); // 一年生小枝淡红绿（"pinkish green … in 1st year" FoC Verified [1]）
    expect(fragmentShader).toContain('smoothstep(12.0, 15.0, vTreePos.y) * (1.0 - smoothstep(0.5, 1.6, vUv.y))'); // 高位 × 小弧长双门控
    expect(fragmentShader).toContain('vec3(0.92, 0.98, 0.88)'); // 局部地衣灰绿斑（s08 Observed——High 弱表达）
    expect(fragmentShader).toContain('(1.0 - smoothstep(0.6, 2.4, vTreePos.y)) * 0.35'); // 干基暗化弱档（家族惯例）
  });

  it('器官帧糙度三档定值（皮材质三分支）：枯穗 0.88 / 种鳞 0.62（皮域走皮公式、羽卡帧走基糙度 0.70）', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const bark = assemble(track(createMetasequoiaBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(bark.fragmentShader).toContain('roughnessFactor = 0.88;'); // 枯穗干枯高糙
      expect(bark.fragmentShader).toContain('roughnessFactor = 0.62;'); // 种鳞蜡质微泽
      expect(bark.fragmentShader).toContain('clamp(0.93 + (1.0 - msqPlateau) * 0.04'); // 皮域糙度公式（三分支 else）
    }
    const needle = assemble(track(createMetasequoiaNeedleMaterial()), THREE.ShaderLib.physical);
    expect(needle.fragmentShader).not.toContain('roughnessFactor = 0.88;'); // 羽材质零器官定值（组 1 纯羽卡帧）
    expect(needle.fragmentShader).not.toContain('roughnessFactor = 0.62;');
  });
});

describe('preset 双卡（T024 / D44——冠变干不变，program 不增红线）', () => {
  it('default = 现行数值单一定义源：缺省 / 显式 default / 未知 id 三路径一致', () => {
    const omitted = track(createMetasequoiaNeedleMaterial());
    const explicit = track(createMetasequoiaNeedleMaterial('high', 'default'));
    const unknown = track(createMetasequoiaNeedleMaterial('high', 'no-such-card'));
    expect(omitted.color.getHex()).toBe(0x8ab65a); // 亮黄绿（profile needleColorSun 同源）
    expect(explicit.color.getHex()).toBe(0x8ab65a);
    expect(unknown.color.getHex()).toBe(0x8ab65a); // 未知 id 回退 default（值域校验归 Renderer 单一 choke point）
    expect(propsOf(omitted)).toEqual(propsOf(explicit)); // 材质关键属性逐位一致
    expect(omitted.customProgramCacheKey()).toBe(explicit.customProgramCacheKey());
  });

  it('autumn = 锈橙-红褐 #a55d2c（= 3a meta swatch 同值三处同源；hue 中带偏红褐 + 深于夏相——JS 锚；Spec §5.2 五源交叉 + s10/s04 照片）', () => {
    const autumn = track(createMetasequoiaNeedleMaterial('high', 'autumn'));
    const hex = autumn.color.getHex();
    expect(hex).toBe(0xa55d2c); // 3a swatch（锈橙 0xc07632 × 红褐 0x8b4526 中值）——meta ↔ 构造色 ↔ CROWN_PRESETS 三处同源
    expect(hex).not.toBe(0x8ab65a); // 与 default 相异（卡语义成立）
    const r = (hex >> 16) & 0xff, g = (hex >> 8) & 0xff, b = hex & 0xff;
    const hue = (60 * (g - b)) / (r - b); // sRGB 色相（max=R min=B）
    expect(hue).toBeGreaterThan(20); // 红褐端界（< 20° 红褐域外缘）
    expect(hue).toBeLessThan(26); // 锈橙中带偏红褐（终审「中值偏红褐」——不入 > 30° 橙域）
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    const summerLuma = 0.299 * 0x8a + 0.587 * 0xb6 + 0.114 * 0x5a;
    expect(luma).toBeLessThan(summerLuma); // 锈褐相深于亮黄绿（red-bronze/copper 读向）
  });

  it('program 不增红线（D44 #3）：两卡 GLSL 逐位同源 + customProgramCacheKey 相同（preset 不进键）+ 材质对象不同', () => {
    const defaultMaterial = track(createMetasequoiaNeedleMaterial());
    const autumnMaterial = track(createMetasequoiaNeedleMaterial('high', 'autumn'));
    expect(defaultMaterial).not.toBe(autumnMaterial); // 每次调用 new（D17）
    expect(defaultMaterial.customProgramCacheKey()).toBe(autumnMaterial.customProgramCacheKey()); // 同键
    const a = assemble(defaultMaterial, THREE.ShaderLib.physical);
    const b = assemble(autumnMaterial, THREE.ShaderLib.physical);
    expect(a.vertexShader).toBe(b.vertexShader); // GLSL 全文逐位同源（同键不同源 = 复用错程序的暴雷路径）
    expect(a.fragmentShader).toBe(b.fragmentShader);
    expect(materialUniformsOf(defaultMaterial).uTime).not.toBe(materialUniformsOf(autumnMaterial).uTime); // 桥接对象实例独立
  });

  it('皮/深度不随卡（冠变干不变）：bark/depth 工厂无 preset 通道，色不进深度', () => {
    const bark = track(createMetasequoiaBarkMaterial());
    expect(bark.color.getHex()).toBe(0x7a5138); // 皮基调恒定（不随季相卡）
    const depth = track(createMetasequoiaNeedleDepthMaterial());
    expect((depth as unknown as { color?: unknown }).color).toBeUndefined(); // 深度材质无色语义（色不进深度——跨卡共享前提）
  });
});

describe('分档实装（level 参数；缺省 high = 显式 high）', () => {

  it('三工厂缺省与显式 high 逐位一致（属性 + 键 + GLSL 全文）', () => {
    const pairs: Array<[THREE.Material, THREE.Material, { vertexShader: string; fragmentShader: string }]> = [
      [track(createMetasequoiaNeedleMaterial()), track(createMetasequoiaNeedleMaterial('high')), THREE.ShaderLib.physical],
      [track(createMetasequoiaBarkMaterial()), track(createMetasequoiaBarkMaterial('high')), THREE.ShaderLib.physical],
      [track(createMetasequoiaNeedleDepthMaterial()), track(createMetasequoiaNeedleDepthMaterial('high')), THREE.ShaderLib.depth],
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

  it('分档缓存键 3×3 = 9 键互不相同（配方变即键变——分档间不共享 program；preset 不进键）', () => {
    const keys = new Set<string>();
    const expectKey = (material: THREE.Material, key: string): void => {
      expect(material.customProgramCacheKey()).toBe(key);
      keys.add(material.customProgramCacheKey());
    };
    expectKey(track(createMetasequoiaNeedleMaterial()), 'metasequoia:needle+dither');
    expectKey(track(createMetasequoiaNeedleMaterial('mid')), 'metasequoia:needle:mid+dither');
    expectKey(track(createMetasequoiaNeedleMaterial('low')), 'metasequoia:needle:low+dither');
    expectKey(track(createMetasequoiaBarkMaterial()), 'metasequoia:bark+dither');
    expectKey(track(createMetasequoiaBarkMaterial('mid')), 'metasequoia:bark:mid+dither');
    expectKey(track(createMetasequoiaBarkMaterial('low')), 'metasequoia:bark:low+dither');
    expectKey(track(createMetasequoiaNeedleDepthMaterial()), 'metasequoia:needle-depth');
    expectKey(track(createMetasequoiaNeedleDepthMaterial('mid')), 'metasequoia:needle-depth:mid');
    expectKey(track(createMetasequoiaNeedleDepthMaterial('low')), 'metasequoia:needle-depth:low');
    expect(keys.size).toBe(9);
    // preset 不进键（program 不增红线——autumn 与 default 同档同键）
    expect(track(createMetasequoiaNeedleMaterial('high', 'autumn')).customProgramCacheKey())
      .toBe(track(createMetasequoiaNeedleMaterial('high')).customProgramCacheKey());
    expect(track(createMetasequoiaNeedleMaterial('low', 'autumn')).customProgramCacheKey())
      .toBe('metasequoia:needle:low+dither');
  });

  it('羽 Mid：羽列 14 元素（7 对）+ 去簇团噪声/糙度项（受光色差/两面差/幼叶/透光/hue·luma 保留）', () => {
    const { fragmentShader } = assemble(track(createMetasequoiaNeedleMaterial('mid')), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('0.999) * 7.0'); // 羽列对数 11→7（叶元素 22→14 分档派生）
    expect(14 / 2).toBe(7); // 冻结单派生 JS 锚
    expect(fragmentShader).not.toContain('0.94 + 0.12 * msqClump'); // 簇团乘子随段去
    expect(fragmentShader).not.toContain('(msqClump - 0.5) * 0.05'); // 糙度注入随段去（High 才注入）
    expect(fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0'); // 透光保留
    expect(fragmentShader).toContain('msqTransVar');
    expect(fragmentShader).toContain('vec3 msqLight'); // 受光色差保留
    expect(fragmentShader).toContain('vec3 msqFaceMul'); // 两面差保留（颜色层次档间连续保留面）
    expect(fragmentShader).toContain('step(fract(vLeafRand * 6.913 + 0.37), 0.07)'); // 幼叶保留
    expect(fragmentShader).toContain('vec3 msqHue'); // hue·luma 逐卡变奏保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0 调用（簇团去采样——Mid 片元零噪声）
  });

  it('羽 Low：羽列 8 元素（4 对）+ 去透光/簇团；受光色差/两面差/hue·luma 保留；片元零噪声', () => {
    const { fragmentShader } = assemble(track(createMetasequoiaNeedleMaterial('low')), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('0.999) * 4.0'); // 羽列对数 4（8 元素）
    expect(8 / 2).toBe(4);
    for (const gone of ['msqTransVar', 'vec3(0.72, 0.94, 0.38)', '0.94 + 0.12 * msqClump']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(count(fragmentShader, '#include <opaque_fragment>')).toBe(1); // 透光不注入但锚点原句不动
    expect(fragmentShader).toContain('vec3 msqLight'); // 受光色差保留（颜色层次档间连续保留面）
    expect(fragmentShader).toContain('vec3 msqFaceMul'); // 两面差保留
    expect(fragmentShader).toContain('vec3 msqHue'); // hue·luma 保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(3); // 片元零噪声采样（库内 3 为死码，运行时零执行）
  });

  it('皮 Mid：去地衣/翘边微暗（近景细节）；条片网格/三色剖面/断口/段深浅/株内梯度/小枝淡红绿保留', () => {
    const { fragmentShader } = assemble(track(createMetasequoiaBarkMaterial('mid')), THREE.ShaderLib.physical);
    expect(fragmentShader).not.toContain('msqLichenDomain'); // 地衣去采样（弱证据近景细节）
    expect(fragmentShader).not.toContain('1.0 - msqEdgeZone * 0.12'); // 翘边微暗随段去
    expect(fragmentShader).toContain('vUv.x * 32.0'); // 条片网格保留
    expect(fragmentShader).toContain('1.0 - smoothstep(msqGh - 0.035, msqGh + 0.035, msqDe)'); // 深索剖面保留
    expect(fragmentShader).toContain('0.92 + 0.16 * msqSegH'); // 逐段深浅保留
    expect(fragmentShader).toContain('1.0 - msqCross * 0.18'); // 断口沟保留
    expect(fragmentShader).toContain('vec3(1.14, 1.05, 0.86), msqSmoothUp * 0.60'); // 株内梯度保留
    expect(fragmentShader).toContain('vec3(1.12, 1.08, 0.98), msqTwig * 0.65'); // 小枝淡红绿保留（冠缘细枝中距读向）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 游走 1 = 1× vnoise
  });

  it('皮 Low：再去逐段深浅/株内梯度/小枝淡红绿/干基暗化（低调项）；条片三色剖面 + 断口剪影保留', () => {
    const { fragmentShader } = assemble(track(createMetasequoiaBarkMaterial('low')), THREE.ShaderLib.physical);
    for (const gone of [
      '0.92 + 0.16 * msqSegH',
      'vec3(1.14, 1.05, 0.86), msqSmoothUp * 0.60',
      'vec3(1.12, 1.08, 0.98), msqTwig * 0.65',
      '(1.0 - smoothstep(0.6, 2.4, vTreePos.y)) * 0.35',
      'msqLichenDomain',
      '1.0 - msqEdgeZone * 0.12',
    ]) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('mix(vec3(0.609, 0.611, 0.582), msqRidge, msqPlateau)'); // 条片三色剖面剪影（远距「红褐纵长条片」保留面）
    expect(fragmentShader).toContain('1.0 - msqCross * 0.18'); // 断口沟保留（剥落段读向——条片分段身份）
    expect(fragmentShader).toContain('msqSmoothUp = smoothstep(9.0, 14.0, vTreePos.y);'); // 幼龄门控计算保留（STRIPS 共享段——Low 不消费）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 游走 1 = 1× vnoise
  });

  it('深度 SDF 随档变体（22/14/8——羽列叶元素即 LOD 内容）：三档互异 + 档内表面/影同串（单一来源生成器）', () => {
    const high = assemble(track(createMetasequoiaNeedleDepthMaterial()), THREE.ShaderLib.depth);
    const mid = assemble(track(createMetasequoiaNeedleDepthMaterial('mid')), THREE.ShaderLib.depth);
    const low = assemble(track(createMetasequoiaNeedleDepthMaterial('low')), THREE.ShaderLib.depth);
    const highSdf = sdfOf(high.fragmentShader);
    const midSdf = sdfOf(mid.fragmentShader);
    const lowSdf = sdfOf(low.fragmentShader);
    expect(highSdf).toContain('11.0');
    expect(midSdf).toContain('7.0');
    expect(lowSdf).toContain('4.0');
    expect(new Set([highSdf, midSdf, lowSdf]).size).toBe(3); // 三档 SDF 互异（叶元素递减即 LOD 内容）
    expect(highSdf).not.toContain('facVnoise'); // SDF 零噪声引用（深度不挂噪声库的前提）
    // 档内表面/影一致：羽表面各档 SDF === 深度各档 SDF（同一生成器输出）
    for (const level of ['high', 'mid', 'low'] as const) {
      const surface = assemble(track(createMetasequoiaNeedleMaterial(level)), THREE.ShaderLib.physical);
      const depthShader = assemble(track(createMetasequoiaNeedleDepthMaterial(level)), THREE.ShaderLib.depth);
      expect(sdfOf(surface.fragmentShader)).toBe(sdfOf(depthShader.fragmentShader)); // 同一 GLSL 字符串（单一来源纪律——shadow-visual-sop §1.4）
      expect(count(depthShader.fragmentShader, 'facVnoise(')).toBe(0); // 三档深度零噪声库
    }
  });

  it('风动三档同源：羽/皮三档顶点 GLSL 全文一致（METASEQUOIA_WIND 同一常量——档间相位一致 = 身份一致）', () => {
    const needleHigh = assemble(track(createMetasequoiaNeedleMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createMetasequoiaBarkMaterial()), THREE.ShaderLib.physical);
    for (const level of ['mid', 'low'] as const) {
      const needle = assemble(track(createMetasequoiaNeedleMaterial(level)), THREE.ShaderLib.physical);
      const bark = assemble(track(createMetasequoiaBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(needle.vertexShader).toBe(needleHigh.vertexShader);
      expect(bark.vertexShader).toBe(barkHigh.vertexShader);
    }
  });

  it('分档底参契约不因档破：羽三档 alphaTest/alphaToCoverage/DoubleSide/USE_UV/零贴图；皮三档 DoubleSide/器官裁切 alphaTest；深度 alphaTest', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const needle = track(createMetasequoiaNeedleMaterial(level));
      const bark = track(createMetasequoiaBarkMaterial(level));
      const depth = track(createMetasequoiaNeedleDepthMaterial(level));
      expect(needle.alphaTest).toBe(0.5);
      expect(needle.alphaToCoverage).toBe(true);
      expect(needle.side).toBe(THREE.DoubleSide);
      expect(needle.defines?.USE_UV).toBe('');
      expect(needle.map).toBeNull(); // 零贴图（D13）三档同守
      expect(bark.side).toBe(THREE.DoubleSide); // 器官单面卡双面读向（皮域实心闭合不受影响）
      expect(bark.alphaTest).toBe(0.5); // 器官卡圆端带裁切（皮域 alpha 恒 1 实心不裁）
      expect(bark.alphaToCoverage).toBe(true);
      expect(bark.defines?.USE_UV).toBe('');
      expect(depth.alphaTest).toBe(0.5);
      expect(depth.defines?.USE_UV).toBe('');
    }
  });

  it('uTime 桥接三档不缺位：材质级 uniforms.uTime 与编译后 shader.uniforms 同引用（Mid/Low）', () => {
    for (const make of [createMetasequoiaNeedleMaterial, createMetasequoiaBarkMaterial]) {
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
  it('羽/皮/深度三键互异；两次调用材质对象不同但键相同；uniforms 不跨实例共享', () => {
    const needleA = track(createMetasequoiaNeedleMaterial());
    const needleB = track(createMetasequoiaNeedleMaterial());
    const barkA = track(createMetasequoiaBarkMaterial());
    const barkB = track(createMetasequoiaBarkMaterial());
    const depth = track(createMetasequoiaNeedleDepthMaterial());
    expect(needleA).not.toBe(needleB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(needleA.customProgramCacheKey()).toBe(needleB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([needleA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
    expect(materialUniformsOf(needleA).uTime).not.toBe(materialUniformsOf(needleB).uTime); // uTime 桥接对象实例独立（dispose 安全）
    expect(materialUniformsOf(barkA).uTime).not.toBe(materialUniformsOf(barkB).uTime);
  });

  it('底参与侧向：羽 DoubleSide/软叶糙度/USE_UV；皮 DoubleSide（器官卡双面读向）/高糙哑光/USE_UV；均零贴图', () => {
    const needle = track(createMetasequoiaNeedleMaterial());
    const bark = track(createMetasequoiaBarkMaterial());
    expect(needle.side).toBe(THREE.DoubleSide);
    expect(needle.metalness).toBe(0);
    expect(needle.roughness).toBeGreaterThan(0.68); // 软条形叶（0.70——family 链最哑端）
    expect(needle.roughness).toBeLessThan(0.75);
    expect(needle.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.DoubleSide); // 器官单面卡交叉双卡双面读向（vs 雪松皮 FrontSide——实体球果网格无此需求）
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeGreaterThanOrEqual(0.9); // 纤维条片高糙哑光
    expect(bark.map).toBeNull();
    expect(needle.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
  });
});

describe('成本记账（10 万实例每像素预算：羽 High ≤9× / 皮 High ≤8×，hash21=1×/vnoise=3×）', () => {
  it('facVnoise 调用数：羽 High 1 处（3×）/ Mid·Low 0 处、皮 High 2 处（6×）/ Mid·Low 1 处、深度 0 处（零噪声库注入）；顶点零噪声', () => {
    const needle = assemble(track(createMetasequoiaNeedleMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createMetasequoiaBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createMetasequoiaNeedleDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(needle.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（簇团斑块——羽列窗列 ALU 化免噪声）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（条片游走 + 地衣域）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(0); // 深度零噪声库注入（SDF 零噪声——影 pass 不吃噪声）
    expect(count(needle.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin（两成分）
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零数据依赖循环/零纹理采样（SDF 固定 3 次三候选循环白名单——常量 trip count 纯 ALU，成本 ≡ 显式展开）', () => {
    // T012.2 中断残留裁定（2026-09-29 重验轮）：羽列 SDF 三候选胶囊并集修复引入固定次数循环
    // for (int msqC = 0; msqC < 3; msqC++)——k0−1/k0/k0+1 三对叶求并（修复「每卡覆盖 11.3% →
    // ≈55%」羽列跨带缺陷，机制见 metasequoiaMaterials.ts SDF 内 Step 4 注释）。成本记账本意 =
    // 确定性纯函数 + 静态可预算 ALU + 零采样：编译期常量 trip count（3）+ 循环体零分支零采样
    // 零副作用 ⇒ 确定性保持、指令数 ≡ 三份显式展开（WebGL2 驱动对常量循环静态展开是标准
    // 行为）⇒ 不违本意，**裁定白名单放行**。白名单锁死精确签名（逐字符匹配后剥离再断言
    // 零 for）——任何其它循环形态（数据依赖条件/未知 trip count/新循环变量）照旧红灯，守卫面
    // 不放松。vs 展开三份：单一来源生成器（表面/深度同串靠同一函数体保证）× 3 复制 = 调参
    // 三处同步漂移风险 + 性能零收益——裁定不展开。
    const WHITELISTED_FIXED_LOOP = 'for (int msqC = 0; msqC < 3; msqC++)';
    const shaders = [
      assemble(track(createMetasequoiaNeedleMaterial()), THREE.ShaderLib.physical),
      assemble(track(createMetasequoiaBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createMetasequoiaNeedleDepthMaterial()), THREE.ShaderLib.depth),
    ];
    for (const shader of shaders) {
      // 白名单循环只允许出现在片元 SDF（msqCardAlpha 内）且恰一次；顶点零循环
      expect(shader.vertexShader).not.toContain(WHITELISTED_FIXED_LOOP);
      expect(count(shader.fragmentShader, WHITELISTED_FIXED_LOOP)).toBe(1);
      for (const source of [shader.vertexShader, shader.fragmentShader]) {
        expect(source.split(WHITELISTED_FIXED_LOOP).join('')).not.toContain('for ('); // 白名单外零循环
        expect(source).not.toContain('while');
        expect(source).not.toContain('texture'); // 零贴图零采样（D13）
      }
    }
    // 机制数值锚（兑现 SDF Step 4 注释「机制数值锚进单测」承诺——重验轮补锚，纯算术零 WebGL）：
    // ① cot52° 字面量 = cot(0.907) 精确（k0 最近带投影斜率 0.78221）；
    // ② 注释口径漂移界：最长叶 0.73 × 角抖 ±0.11 rad × N(11) ≈ 0.88 带 < 1.5 带（三候选
    //   k0±1 窗口自带带中心 ±1.5 的严格界——名义充分）。已知边界记档：s 空间换算乘
    //   csc52° ≈ 1.27 后联合极端最坏 ≈ 1.9 带 → 罕见单叶尖端 ≤1 带缺口（优雅退化，
    //   邻叶搭接掩盖 + 密度校准轮实测冠带 34.3% 绿覆盖）。
    expect(1 / Math.tan(0.907)).toBeCloseTo(0.78221, 4);
    expect(0.73 * Math.sin(0.11) * 11).toBeLessThan(1.5);
  });
});

describe('注入点缺失即抛（首次渲染前暴雷）', () => {
  it('片元 map_fragment 摘除 → 羽/皮/深度均抛「注入点缺失」', () => {
    for (const make of [createMetasequoiaNeedleMaterial, createMetasequoiaBarkMaterial, createMetasequoiaNeedleDepthMaterial]) {
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
    const needle = track(createMetasequoiaNeedleMaterial());
    expect(() =>
      needle.onBeforeCompile(
        {
          vertexShader: THREE.ShaderLib.physical.vertexShader.replace('#include <begin_vertex>', ''),
          fragmentShader: THREE.ShaderLib.physical.fragmentShader,
          uniforms: {},
        } as unknown as WebGLProgramParametersWithUniforms,
        {} as unknown as THREE.WebGLRenderer,
      ),
    ).toThrow(/注入点缺失/);

    const depth = track(createMetasequoiaNeedleDepthMaterial());
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
    const bark = track(createMetasequoiaBarkMaterial());
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

    const needle = track(createMetasequoiaNeedleMaterial());
    expect(() =>
      needle.onBeforeCompile(
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
  it('羽/皮（physical）与深度（depth）注入后花括号配平差值与原版一致', () => {
    const pristinePhysicalFragment = braceDelta(expandIncludes(THREE.ShaderLib.physical.fragmentShader));
    const pristinePhysicalVertex = braceDelta(THREE.ShaderLib.physical.vertexShader);
    const pristineDepthFragment = braceDelta(expandIncludes(THREE.ShaderLib.depth.fragmentShader));
    const pristineDepthVertex = braceDelta(THREE.ShaderLib.depth.vertexShader);

    const needle = assemble(track(createMetasequoiaNeedleMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createMetasequoiaBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createMetasequoiaNeedleDepthMaterial()), THREE.ShaderLib.depth);
    for (const shader of [needle, bark]) {
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
    const material = track(createMetasequoiaNeedleMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});
