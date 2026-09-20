/**
 * tests/runtime/procedural/tree/koelreuteriaMaterials.test.ts —— 栾树叶/皮（含花果
 * 域）/深度材质测试（T011.6，对称 platanusMaterials.test.ts 范式：真实 THREE.ShaderLib
 * 源组装，静态字符串断言 + SDF 数值锚 JS 镜像，零 WebGL；build()/资产入口归并行几何
 * agent 的资产测试，此处不覆盖——platanus 先例无依赖几何的测试形态，全部形态可移植）。
 *
 * 覆盖：
 * - uTime 接线（TimeUniformService 消费协议）：叶/皮材质挂材质级 uniforms.uTime（own
 *   property）；onBeforeCompile 后 shader.uniforms.uTime 与材质级同对象引用；GLSL 声明
 *   uniform float uTime；材质挂场景被服务逐帧驱动（frame 写值闭环）；
 * - 风动契约（D19.7）：aSeed/aBend/aLeafRand 顶点 attribute 声明存在；相位 = fract(sin(...))
 *   类 hash（aSeed=0 缺省属性路径退化为常数相位，全源零除 aSeed——无 NaN）；整树缓摆项
 *   叶/皮同公式（同串出现）；复叶卡快颤层含 aBend 权重（组 0 恒 0 天然免颤）+ **中频
 *   中幅读向**（幅度 11mm < 悬铃木大叶重摆 15mm、频率 9–15 rad/s 略高于悬铃木 8–14
 *   ——二回羽叶大而透风的摆锤读向下调：任务简报「参照悬铃木大叶重摆量级下调」）；
 *   树高锚 9.854m（×0.1015——几何侧 slot-0 精确涌现实测〔Stage 代理探针，2026-09-21
 *   同步〕，材质-几何侧同源锚）；
 * - instanceColor 乘算链安全：注入后 <color_fragment> 原句恰一次、注入代码零 vColor 介入；
 * - 复叶 SDF 与透光：叶 alphaTest 0.5 + alphaToCoverage + 坡宽 0.02（小叶间隙级细一档）；
 *   **组 0 材质工程契约**（材质侧定义）：DoubleSide（花交叉竖卡双面读出）+ alphaTest
 *   0.5 + alphaToCoverage（花卡裁切；皮/果域 alpha 恒 1）；深度材质三分支（叶 SDF 裁切
 *   + 花卡 alpha 裁切 + 皮/果实心守卫）+ RGBADepthPacking + USE_UV；花簇 alpha 与皮
 *   表面单一来源（函数全文相等）；透光项存在且 NUM_DIR_LIGHTS 守卫；果域弱背光域门控；
 *   风动不进 depth pass；
 * - 物种配方锚定（Spec docs/research/koelreuteria-reference.md 1.0，生产口径 = 终审
 *   记档 ④ + 主代理补充证据记档）：**复叶 SDF 核心（两级窗列 lift 折叠法——复叶首例
 *   新路径）**——宽/长比 0.60 冻结字面量 + 羽片带列（lift 折算 tan38° 0.78 + 右侧近
 *   对生降 0.014 + 间距 rand 变奏 0.145–0.173）+ 小叶窗列（freq 21+6rand → 每羽片
 *   5–7 枚 JS 锚 + 互生侧偏 ±0.40len + 斜卵形基部偏斜简化表达 + 小叶向羽片先端渐小）+
 *   羽轴细线 rachilla + 主轴 rachis 全 v 连续 JS 锚 + 羽片基部 bare 门控 + 缘相 70/30
 *   分档（全缘主力 ~70% / 内弯细锯齿 ~30%——JS 锚实测 29.4%）+ 羽片间 V 缺口裁穿
 *   JS 锚（notch < 0.5）+ 羽片对数 4–6 JS 锚 + 包络最宽 v≈0.42 偏中下 + 半宽 0.300
 *   恰满卡无外溢 + 小叶长宽比 ≈1.3（Spec 1.7–2.0 简化表达域 1.1–1.9 JS 锚）/ 小叶
 *   羽状脉（中脉 0.30 + 侧脉 0.15 弱表达——中距弱层）/ 两面区分（背面 ×(1.09,1.10,
 *   1.13) 浅绿-灰绿——B 抬升灰向：柔毛读向；樟 glaucous/悬铃木无粉感乘子不串种）+
 *   两面糙度差 +0.08（密短柔毛 > 悬铃木近无毛 0.06）/ 叶色中绿偏深 #527d37（六树
 *   亮度链：银杏 > 朴树 > 悬铃木 > **栾树** > 夏栎 > 榉 > 樟）/ 纸质哑光 roughness
 *   0.70（悬 0.66 < 0.70 < 朴 0.72——「纸质或近革质」取纸质端）/ 透光中等峰值 0.32
 *   （悬 0.28 < 0.32 < 银杏 0.34——家族中庸档）+ 黄绿透射色 (0.55,0.90,0.35)；
 *   皮（第七语言「浅色光滑 + 皮孔麻点 + 局部浅细纵裂」——主代理补充证据终版）：底色
 *   #90928a 灰白-灰褐（七树最浅——亮于悬铃木/榉树灰绿族）+ 皮孔麻点场（52×78 格
 *   ALU hash、圆点 42%/v 向短条 58% 两型、82% 格有孔高密度、深色 ×(0.74,0.72,0.70)）
 *   + 局部浅细纵裂（≈28 线/周 × 低频门控局部片域 × 微暗——脊浅沟浅）+ 单色调微变
 *   （无剥落无三色带——悬铃木三色带/榉树锈橙标记不串种）+ 上部红褐细枝收敛（一年生
 *   枝红褐照片双源）；
 *   花域（v∈[5,6]）：团块云包络 ∧ 细碎花簇格（6×8 stagger 抖动、u 相位变奏——JS 锚
 *   填充率 ≈37% 疏散读向 + 边缘裁切 + floret 存在）+ 金黄-橙黄两端变奏 (1.00,0.72,
 *   0.24)↔(1.00,0.87,0.44) + 瓣基橙红点 High 近景细节 ×(0.86,0.34,0.20)；
 *   果域（v∈[6,7]）：五档色序字面量（绿/黄绿乳白/鲑粉/玫红/褐）+ u 果档随机 warp
 *   （0.09·sin(2π(u−0.1)) 相位峰落鲑粉/玫红界——JS 锚鲑粉+玫红 >50% 主导 + 单调无逆
 *   映射 + 绿/褐 <20%）+ 膜质网纹 High（1× vnoise）+ 微透光 High 域门控 + 实体无裁切；
 * - 深度材质零噪声库注入（两级窗列/锯齿载波/花簇格全 ALU → SDF/花簇零 facVnoise 引用
 *   → 影 pass 不吃噪声纪律——沿榉 011.3 + 银杏 011.4 + 悬铃木 011.5 组合先例）；
 * - 分档实装（level 参数，缺省 'high'）：三工厂缺省 ≡ 显式 'high'（属性 + 键 + GLSL
 *   全文逐位相等）；3 工厂 × 3 档 = 9 键互异 + 与 ginkgo/zelkova/camphor/platanus
 *   36 键零碰撞；叶 Mid 去小叶脉/叶团/糙度叶团项（**SDF 全形含两级窗列 + 锯齿保留
 *   ——档间剪影一致：复叶羽状剪影是中距身份**）、Low 换 SDF_LOW（去两级窗列——复叶
 *   细化；包络/主轴与 High 逐字同源）再去透光；皮 Mid 去浅细纵裂/果膜/果透光/瓣基
 *   红点（皮孔麻点/花簇/果五档保留——中距身份）、Low 再去皮孔麻点（远距亚像素）；
 *   深度 Mid = High SDF（含两级窗列）、Low = SDF_LOW（表面/影档内一致）；风动三档
 *   顶点 GLSL 同源；分档底参契约（alphaTest/侧向/USE_UV）不因档破；uTime 桥接三档
 *   不缺位；
 * - program 键纪律：叶/皮/深度三键互异；两次工厂调用材质对象不同（无模块级共享，D17）但
 *   键相同；uniforms 不跨实例共享；
 * - 成本记账（10 万实例每像素预算，hash21=1×/vnoise=3×）：叶片元 facVnoise 调用 1 处
 *   （叶团——两级窗列/锯齿/花簇格 ALU 化免噪声）、Mid/Low 0 处；皮 High 2 处（色调
 *   微变 + 果膜网纹）、Mid/Low 1 处；深度 0 处（零噪声库注入）；顶点零噪声；全源零
 *   循环/零纹理采样/零三角函数反函数调用（放射/沿轴窗列全用 floor/fract 代理）；
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
  createKoelreuteriaBarkMaterial,
  createKoelreuteriaLeafDepthMaterial,
  createKoelreuteriaLeafMaterial,
} from '../../../../src/runtime/procedural/tree/koelreuteria/koelreuteriaMaterials';
import {
  createCamphorBarkMaterial,
  createCamphorLeafDepthMaterial,
  createCamphorLeafMaterial,
} from '../../../../src/runtime/procedural/tree/camphor/camphorMaterials';
import {
  createGinkgoBarkMaterial,
  createGinkgoLeafDepthMaterial,
  createGinkgoLeafMaterial,
} from '../../../../src/runtime/procedural/tree/ginkgo/ginkgoMaterials';
import {
  createZelkovaBarkMaterial,
  createZelkovaLeafDepthMaterial,
  createZelkovaLeafMaterial,
} from '../../../../src/runtime/procedural/tree/zelkova/zelkovaMaterials';
import {
  createPlatanusBarkMaterial,
  createPlatanusLeafDepthMaterial,
  createPlatanusLeafMaterial,
} from '../../../../src/runtime/procedural/tree/platanus/platanusMaterials';

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

/** 提取注入后的 koeLeafAlpha 函数全文（SDF 单一来源比对用；首个 \n} 即函数闭合） */
const sdfOf = (fragmentShader: string): string => {
  const start = fragmentShader.indexOf('float koeLeafAlpha(vec2 koeUv, float koeRand)');
  expect(start).toBeGreaterThanOrEqual(0);
  const end = fragmentShader.indexOf('\n}', start);
  return fragmentShader.slice(start, end + 2);
};

/** 提取注入后的 koePinna 子函数全文（形态 A 拆分——两级窗列子函数单一来源比对用） */
const pinnaOf = (fragmentShader: string): string => {
  const start = fragmentShader.indexOf('float koePinna(float koeX, float koeY, float koeEnv, float koeRand)');
  expect(start).toBeGreaterThanOrEqual(0);
  const end = fragmentShader.indexOf('\n}', start);
  return fragmentShader.slice(start, end + 2);
};

/** 提取注入后的 koeFlowerAlpha 函数全文（花簇单一来源比对用） */
const flowerSdfOf = (fragmentShader: string): string => {
  const start = fragmentShader.indexOf('float koeFlowerAlpha(vec2 koeF, out float koeFCen, out float koeFVar)');
  expect(start).toBeGreaterThanOrEqual(0);
  const end = fragmentShader.indexOf('\n}', start);
  return fragmentShader.slice(start, end + 2);
};

// ── SDF JS 数值锚镜像（两级窗列 lift 折叠——与 GLSL 逐式对应）──────────────────────

const fract = (x: number): number => x - Math.floor(x);
const clamp = (x: number, a: number, b: number): number => Math.min(Math.max(x, a), b);
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
const smoothstepJS = (a: number, b: number, x: number): number => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const glMod = (x: number, y: number): number => x - y * Math.floor(x / y); // GLSL mod（结果非负周期）

/** 复叶 SDF JS 镜像（与 KOE_LEAF_SDF 逐式对应——两级窗列 lift 折叠法） */
function koeLeafAlphaJS(u: number, v: number, rand: number): number {
  const px = u - 0.5;
  const X = px * 0.60;
  const Y = v;
  const A = Math.abs(X);
  const envSin = Math.sin(Math.PI * Math.pow(clamp(Y, 0.001, 0.999), 0.80));
  const env = 0.30 * Math.pow(envSin, mix(0.78, 1.18, smoothstepJS(0.30, 0.92, Y)));
  const envEdge = env - A;
  const rachisEdge = 0.013 * (1.0 - 0.5 * Y) - A;
  const space = 0.145 + 0.028 * fract(rand * 5.713 + 0.31);
  const yb = Y - 0.155 - A * 0.78 - Math.max(Math.sign(X), 0) * 0.014;
  const bandT = yb / space;
  const bandIdx = Math.floor(bandT + 0.5);
  const L = (bandT - bandIdx) * space;
  const freq = 21.0 + 6.0 * fract(rand * 4.117 + 0.63);
  const S = A * freq + fract(bandIdx * 0.371 + rand * 0.618) * 8.0;
  const J = Math.floor(S);
  const F = fract(S);
  const lob = Math.pow(Math.sin(Math.PI * F), 1.6);
  const alt = glMod(J, 2.0) * 2 - 1;
  const rem = Math.max(env - A, 0);
  const len = clamp(0.20 * rem, 0.012, 0.046);
  const half = lob * len;
  const c = alt * 0.40 * len * (0.30 + 0.70 * lob);
  const rillEdge = 0.006 - 0.003 * clamp(A / 0.30, 0, 1) - Math.abs(L);
  const featherEdge = half - Math.abs(L - c);
  let pinnaEdge = Math.max(rillEdge, featherEdge);
  const serrOn = fract(rand * 6.113 + 0.37) >= 0.70 ? 1 : 0;
  const tooth = Math.cos((L - c) * 620.0 + J * 2.4) * 0.5 + 0.5;
  pinnaEdge += serrOn * (tooth - 0.5) * 0.010 * (lob >= 0.2 ? 1 : 0);
  pinnaEdge *= smoothstepJS(0.08, 0.13, Y);
  const edge = Math.max(rachisEdge, Math.min(envEdge, pinnaEdge));
  return clamp(edge / 0.02 + 0.5, 0, 1);
}

/** 包络半宽 JS 镜像（卡空间长度单位） */
const koeEnvOf = (v: number): number =>
  0.30 * Math.pow(Math.sin(Math.PI * Math.pow(clamp(v, 0.001, 0.999), 0.80)), mix(0.78, 1.18, smoothstepJS(0.30, 0.92, v)));

/** 羽片对数镜像：带中心落在有效高度带（>bare 门控 0.13、<0.97）且贴轴包络 >0.06 的带数 */
function koePinnaPairsJS(space: number): number {
  let pairs = 0;
  for (let k = 0; k <= 8; k++) {
    const yc = 0.155 + k * space;
    if (yc < 0.13 || yc > 0.97) continue;
    if (koeEnvOf(yc) > 0.06) pairs++;
  }
  return pairs;
}

/** 沿带-2 羽轴行（上升折算）固定 |l| 偏移的 alpha≥0.5 连续段计数 = 该侧小叶数 */
function koeLeafletRunsJS(rand: number, loff: number): number {
  const space = 0.145 + 0.028 * fract(rand * 5.713 + 0.31);
  let runs = 0;
  let inRun = false;
  for (let i = 0; i <= 1200; i++) {
    const a = 0.014 + (i / 1200) * 0.28;
    const y = 0.155 + 2 * space + 0.78 * a + loff;
    const alpha = koeLeafAlphaJS(0.5 - a / 0.60, y, rand);
    if (alpha >= 0.5 && !inRun) {
      runs++;
      inRun = true;
    } else if (alpha < 0.45) {
      inRun = false;
    }
  }
  return runs;
}

/** 花簇 alpha JS 镜像（与 KOE_FLOWER_ALPHA 逐式对应——inline sin-hash ALU） */
function koeFlowerAlphaJS(fu: number, fv: number): number {
  const fx = (fu - 0.5) * 0.65;
  const env = Math.sin(Math.PI * Math.pow(clamp(fv, 0.001, 0.999), 0.90));
  const cx = fx * 6.0;
  const cy = fv * 8.0;
  const idx = Math.floor(cx);
  const idy = Math.floor(cy);
  const R = fract(Math.sin(idx * 127.1 + idy * 311.7 + fu * 9.7) * 43758.5453);
  const ox = (fract(R * 7.31) - 0.5) * 0.44;
  const oy = (fract(R * 3.17) - 0.5) * 0.44;
  let fxr = cx - idx - 0.5 - ox;
  const fyr = cy - idy - 0.5 - oy;
  fxr -= (glMod(idy, 2.0) - 0.5) * 0.5;
  const rad = 0.38 + 0.18 * fract(R * 9.13);
  const blob = rad - Math.hypot(fxr, fyr);
  const side = 0.325 * Math.pow(env, 0.75) - Math.abs(fx);
  return clamp(Math.min(side, blob) / 0.03 + 0.5, 0, 1);
}

/** 果色档 warp JS 镜像（u → w 单调；密度峰落鲑粉/玫红界 0.6） */
const koeFruitWarpJS = (u: number): number => clamp(u + 0.09 * Math.sin(6.28318 * (u - 0.1)), 0, 0.999);

afterEach(() => {
  for (const material of created.splice(0)) material.dispose();
});

describe('uTime 接线（TimeUniformService 消费协议）', () => {
  it('叶/皮材质挂材质级 uniforms.uTime；编译后 shader.uniforms.uTime 同引用；GLSL 声明 uniform', () => {
    for (const material of [track(createKoelreuteriaLeafMaterial()), track(createKoelreuteriaBarkMaterial())]) {
      expect(Object.prototype.hasOwnProperty.call(material, 'uniforms'), '材质级 uniforms（服务扫描面）').toBe(true);
      const materialUTime = materialUniformsOf(material).uTime;
      expect(materialUTime).toBeDefined();
      const shader = assemble(material, THREE.ShaderLib.physical);
      expect((shader.uniforms as Record<string, unknown>).uTime).toBe(materialUTime); // 同对象引用
      expect(shader.vertexShader).toContain('uniform float uTime;');
    }
  });

  it('材质挂场景被逐帧驱动（材质级 → 程序 uniform 闭环）', () => {
    const leaf = track(createKoelreuteriaLeafMaterial());
    const bark = track(createKoelreuteriaBarkMaterial());
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

describe('风动契约（D19.7：uTime 全局风帧 / aSeed 个体相位；复叶大卡中频中幅——悬铃木大叶重摆量级下调：二回羽叶大而透风）', () => {
  it('aSeed/aBend/aLeafRand 顶点声明存在；hash 为 fract(sin(...)) 类（aSeed=0 → 常数相位）', () => {
    const leaf = assemble(track(createKoelreuteriaLeafMaterial()), THREE.ShaderLib.physical);
    for (const decl of ['attribute float aSeed;', 'attribute float aBend;', 'attribute float aLeafRand;']) {
      expect(leaf.vertexShader).toContain(decl);
    }
    expect(leaf.vertexShader).toContain('fract(sin(aSeed * 84.913'); // 整树缓摆相位 = hash(aSeed)——常数换五先例去相关
    expect(leaf.vertexShader).toContain('fract(sin((aSeed + aLeafRand) * 61.157'); // 快颤相位 = hash(aSeed+叶身份)
    // 零除 aSeed（缺省属性 0 路径无 NaN 风险）
    expect(leaf.vertexShader + leaf.fragmentShader).not.toMatch(/\/\s*aSeed/);
  });

  it('整树缓摆叶/皮同公式（同串出现）；快颤含 aBend 权重且幅度 11mm（< 悬铃木大叶重摆 15mm）、频率 9+（略高于悬铃木 8+——羽叶镂空透风）；树高锚 9.854m（×0.1015 几何侧 slot-0 精确涌现实测同源锚）', () => {
    const leaf = assemble(track(createKoelreuteriaLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createKoelreuteriaBarkMaterial()), THREE.ShaderLib.physical);
    const swayCore = 'koeWindH * koeWindH * 0.042 * sin(uTime * 1.15';
    expect(leaf.vertexShader).toContain(swayCore);
    expect(bark.vertexShader).toContain(swayCore); // 皮不动叶动会撕裂穿帮——同公式同相位（组 0 aBend 恒 0 免颤）
    expect(leaf.vertexShader).toContain('aBend * 0.011'); // 复叶卡快颤幅度 11mm 中幅（悬铃木大叶重摆 15mm 量级下调——羽状镂空风阻低）
    expect(leaf.vertexShader).toContain('uTime * (9.0 + 6.0 * koeFlutterPhase)'); // 9–15 rad/s（≈1.4–2.4Hz 中频——略高于悬铃木 8–14 最低频）
    expect(leaf.vertexShader).toContain('position.y * 0.1015'); // /9.854m 锚（几何侧 slot-0 精确涌现实测——材质-几何同源锚）
    expect(0.011).toBeLessThan(0.015); // < 悬铃木 15mm（量级下调链）
    expect(0.011).toBeGreaterThan(0.008); // > 榉树 8mm（中幅不为最小）
    expect(9.0).toBeGreaterThan(8.0); // 频率下限 > 悬铃木 8（透风读向）
  });
});

describe('instanceColor 乘算链安全（<color_fragment> 不触碰）', () => {
  it('注入后 <color_fragment> 原句恰一次；注入代码零 vColor 介入', () => {
    for (const material of [track(createKoelreuteriaLeafMaterial()), track(createKoelreuteriaBarkMaterial())]) {
      const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
      expect(count(fragmentShader, '#include <color_fragment>')).toBe(1); // 原句保留
      expect(fragmentShader).not.toContain('vColor'); // 乘算链不被触碰（交换律安全）
      expect(count(fragmentShader, '#include <map_fragment>')).toBe(1); // 注入锚点原句保留
    }
  });
});

describe('复叶 SDF 与透光', () => {
  it('叶 alphaTest 0.5 + alphaToCoverage + 坡宽 0.02（小叶间隙级细一档）；片元含 SDF 计算式并写入 alpha', () => {
    const material = track(createKoelreuteriaLeafMaterial());
    expect(material.alphaTest).toBe(0.5);
    expect(material.alphaToCoverage).toBe(true); // MSAA 抗锯边（不 transparent——实例化灾难）
    const { fragmentShader } = assemble(material, THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float koeLeafAlpha('); // 复叶 SDF 函数（单一来源）
    expect(fragmentShader).toContain('koeLeafAlpha(vUv, vLeafRand)');
    expect(fragmentShader).toContain('diffuseColor.a = koeAlpha;'); // alphatest_fragment 上游写入
    expect(fragmentShader).toContain('clamp(koeEdge / 0.02 + 0.5'); // 坡宽 0.02（复叶小叶间隙级——vs 单叶先例 0.04）
  });

  it('组 0 材质工程契约（材质侧定义）：DoubleSide（花交叉竖卡双面读出）+ alphaTest 0.5 + alphaToCoverage（花卡裁切）+ USE_UV', () => {
    const bark = track(createKoelreuteriaBarkMaterial());
    expect(bark.side).toBe(THREE.DoubleSide); // 花交叉竖卡双面读出保障（皮圆柱背面 z 遮挡成本可忽略——三域并存取舍）
    expect(bark.alphaTest).toBe(0.5); // 花卡 alpha 裁切
    expect(bark.alphaToCoverage).toBe(true);
    expect(bark.defines?.USE_UV).toBe('');
  });

  it('深度材质（叶影裁切）三分支：叶 SDF + 花 alpha（与皮表面单一来源）+ 皮/果实心守卫 + RGBADepthPacking + USE_UV + alphaTest；风动不进 depth；零噪声库注入', () => {
    const material = track(createKoelreuteriaLeafDepthMaterial());
    expect(material).toBeInstanceOf(THREE.MeshDepthMaterial);
    expect(material.depthPacking).toBe(THREE.RGBADepthPacking);
    expect(material.alphaTest).toBeGreaterThan(0);
    expect(material.defines?.USE_UV).toBe('');
    const shader = assemble(material, THREE.ShaderLib.depth);
    expect(shader.fragmentShader).toContain('koeDepthAlpha(vUv, vLeafRand)'); // 三分支域路由
    expect(shader.fragmentShader).toContain('step(0.0001, koeRand)'); // 皮/果实心守卫（组 0 aLeafRand=0 → 圆柱/八面体域不误裁——platanus 先例）
    expect(shader.fragmentShader).toContain('koeFlowerAlpha(vec2(koeUv.x, koeUv.y - 5.0)'); // 花卡裁切（v∈[4.5,6) 域即身份）
    expect(shader.vertexShader).toContain('attribute float aLeafRand;');
    expect(shader.vertexShader).not.toContain('uTime'); // 风动不进 depth pass（静态影取舍）
    expect(count(shader.fragmentShader, 'facVnoise(')).toBe(0); // 零噪声库注入——两级窗列/锯齿/花簇格 ALU 化（影 pass 不吃噪声）
    expect(shader.fragmentShader).not.toContain('facHash21'); // 噪声库整体未挂（SDF 引入噪声即编译暴雷——保护性约束）
  });

  it('花簇 alpha 单一来源：皮表面与深度材质 koeFlowerAlpha 函数全文逐字相等', () => {
    const bark = assemble(track(createKoelreuteriaBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createKoelreuteriaLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(flowerSdfOf(bark.fragmentShader)).toBe(flowerSdfOf(depth.fragmentShader)); // 同一 GLSL 字符串（表面改形深度自动同步）
  });

  it('透光项存在且 NUM_DIR_LIGHTS 守卫（无平行光场景安全降级）；果域微透光域门控 v≥6', () => {
    const leaf = assemble(track(createKoelreuteriaLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0');
    expect(leaf.fragmentShader).toContain('directionalLights[0]');
    expect(leaf.fragmentShader).toContain('outgoingLight +='); // 透射进完整色调映射管线
    const bark = assemble(track(createKoelreuteriaBarkMaterial()), THREE.ShaderLib.physical);
    expect(bark.fragmentShader).toContain('if (vUv.y >= 6.0) {'); // 果域微透光域门控（花/皮域不受影响）
  });
});

describe('物种配方锚定（Spec koelreuteria-reference 1.0；生产口径 = 终审记档 ④ + 主代理补充证据记档：复叶计数域裁决 2 / 树皮 bark-b 终版 / 花果色序裁决 3）', () => {
  it('复叶 SDF 核心（两级窗列 lift 折叠法——复叶首例新路径）：卡空间 0.60 宽/长比冻结 + lift 折算 + 近对生微降 + 间距 rand 变奏 + 小叶窗列互生侧偏 + 缘相 70/30 分档 + 羽片基部 bare 门控', () => {
    const leaf = assemble(track(createKoelreuteriaLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('koeP.x * 0.60'); // 宽/长比 0.60 冻结接口（卡空间折算——半宽 0.30）
    expect(leaf.fragmentShader).toContain('koeY - 0.155 - koeA * 0.78 - max(sign(koeX), 0.0) * 0.014'); // lift 折算 tan38° 上举 + 右侧近对生降 0.014
    expect(leaf.fragmentShader).toContain('0.145 + 0.028 * fract(koeRand * 5.713 + 0.31)'); // 羽片间距 rand 变奏 → 4–6 对
    expect(leaf.fragmentShader).toContain('21.0 + 6.0 * fract(koeRand * 4.117 + 0.63)'); // 小叶频 21–27（周期 0.037–0.048 → 每羽片 5–7 枚）
    expect(leaf.fragmentShader).toContain('mod(koeJ, 2.0) * 2.0 - 1.0'); // 互生侧别（「互生，很少对生」FRPS Verified [2][4]）
    expect(leaf.fragmentShader).toContain('koeAlt * 0.40 * koeLen * (0.30 + 0.70 * koeLob)'); // 互生侧偏 = 斜卵形基部偏斜简化表达（brief 允许）
    expect(leaf.fragmentShader).toContain('step(0.70, fract(koeRand * 6.113 + 0.37))'); // 缘相 70/30 分档（全缘主力 ~70% / 内弯细锯齿 ~30%——生产口径冻结）
    expect(leaf.fragmentShader).toContain('cos((koeL - koeC) * 620.0 + koeJ * 2.4)'); // 细锯齿载波（≈5 齿/小叶缘——真实齿亚像素的统计近似）
    expect(leaf.fragmentShader).toContain('smoothstep(0.08, 0.13, koeY)'); // 羽片基部 bare 门控（第一对羽片以下裸叶柄）
    expect(leaf.fragmentShader).toContain('0.013 * (1.0 - 0.5 * koeY)'); // 主轴渐细（工程放大——真实 3–4mm 卡分辨率不可读）
    expect(leaf.fragmentShader).toContain('0.006 - 0.003 * clamp(koeA / 0.30'); // 羽轴细线 rachilla（小叶间隙连线——羽片剪影连续性）
    expect(leaf.fragmentShader).toContain('max(koeRachisEdge, min(koeEnvEdge, koePinnaEdge))'); // 合成：主轴 ∪ (包络 ∧ 羽片)
  });

  it('复叶数值锚（JS 镜像）：主轴全 v 连续不裁穿 + 羽片间 V 缺口裁穿（notch < 0.5）+ 每羽片小叶 5–7 枚 + 羽片对数 4–6 对 + 包络峰偏中下且半宽 0.300 恰满卡', () => {
    // ① 主轴连续：x=0 处 alpha ≥ 0.5 全 v（stalk 永不裁穿——JS 锚）
    let rachisMin = 1;
    for (let i = 0; i <= 200; i++) {
      const y = 0.02 + (i / 200) * 0.96;
      rachisMin = Math.min(rachisMin, koeLeafAlphaJS(0.5, y, 0.37));
    }
    expect(rachisMin).toBeGreaterThanOrEqual(0.5);
    // ② 羽片间 V 缺口：a=0.10 带间隙中点裁穿（min(包络,羽片) < 0 → alpha < 0.5）
    for (const rand of [0.13, 0.51, 0.77]) {
      const space = 0.145 + 0.028 * fract(rand * 5.713 + 0.31);
      const yNotch = 0.155 + 1.5 * space + 0.78 * 0.10;
      expect(koeLeafAlphaJS(0.5 - 0.10 / 0.60, yNotch, rand)).toBeLessThan(0.5);
    }
    // ③ 每羽片小叶数（带-2 羽轴行 |l|=±0.02 两侧 run 计数）：5–7 枚（生产口径「每羽片 5–7(–9) 枚」中庸域）
    for (const rand of [0.13, 0.51, 0.77]) {
      const total = koeLeafletRunsJS(rand, 0.020) + koeLeafletRunsJS(rand, -0.020);
      expect(total).toBeGreaterThanOrEqual(5);
      expect(total).toBeLessThanOrEqual(8);
    }
    // ④ 羽片对数（间距全域端点）：4–6 对（生产口径「羽片 4–5(–6) 对」——rand 间距变奏的统计实现）
    expect(koePinnaPairsJS(0.145)).toBeGreaterThanOrEqual(4);
    expect(koePinnaPairsJS(0.145)).toBeLessThanOrEqual(6);
    expect(koePinnaPairsJS(0.173)).toBeGreaterThanOrEqual(4);
    expect(koePinnaPairsJS(0.173)).toBeLessThanOrEqual(6);
    // ⑤ 包络峰偏中下（二回羽叶中下部最宽）+ 半宽 ≤ 0.300 恰满卡无外溢
    let widestV = 0;
    let widestW = -1;
    for (let i = 0; i <= 500; i++) {
      const v = 0.05 + (i / 500) * 0.9;
      const w = koeEnvOf(v);
      if (w > widestW) {
        widestW = w;
        widestV = v;
      }
    }
    expect(widestV).toBeGreaterThan(0.38); // 偏中下（vs 先例卵形族 0.40–0.61）
    expect(widestV).toBeLessThan(0.46);
    expect(widestW).toBeLessThanOrEqual(0.3001); // 半宽 0.300 恰达卡缘（0.60 宽/长比满卡利用）
    expect(widestW).toBeGreaterThan(0.29); // 且未浪费卡面
    // ⑥ 小叶长宽比 ≈1.3（Spec 1.7–2.0 的简化表达——域 1.1–1.9 内；len·1.4 / 周期）
    for (const rem of [0.20, 0.29]) {
      for (const freq of [21.0, 27.0]) {
        const lw = (1.4 * clamp(0.20 * rem, 0.012, 0.046)) * freq;
        expect(lw).toBeGreaterThan(1.1);
        expect(lw).toBeLessThan(1.9);
      }
    }
    // ⑦ 缘相分档实测 ~30%（10k rand 扫描——生产口径 70/30 统计近似）
    let serr = 0;
    for (let i = 0; i < 10000; i++) if (fract((i / 10000) * 6.113 + 0.37) >= 0.70) serr++;
    expect(serr / 10000).toBeGreaterThan(0.27);
    expect(serr / 10000).toBeLessThan(0.33);
    // SDF 单一来源——影裁切叶形自动同步
    const leafSurface = assemble(track(createKoelreuteriaLeafMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createKoelreuteriaLeafDepthMaterial()), THREE.ShaderLib.depth);
    expect(sdfOf(depth.fragmentShader)).toBe(sdfOf(leafSurface.fragmentShader));
  });

  it('小叶羽状脉（中距弱表达——NC "pinnate venation" [9]）：每小叶中脉 0.30 + 侧脉对角 0.15 弱层 + 小叶中点窗', () => {
    const { fragmentShader } = assemble(track(createKoelreuteriaLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('float koeVMid = koeVPeak * (1.0 - smoothstep(0.45, 0.80'); // 中脉（半长渐隐不达缘）
    expect(fragmentShader).toContain('koeVMid * 0.30 + koeVLat * 0.15'); // 权重弱表达 0.30/0.15（中脉身份层 + 侧脉读向弱层）
    expect(fragmentShader).toContain('float koeVPeak = 1.0 - smoothstep(0.08, 0.22, abs(koeFr - 0.5))'); // 小叶中点窗
    expect(fragmentShader).toContain('vec2 koeUv = vUv;'); // 装饰层坐标段与 SDF 共享（KOE_SCALLOP 同源折算）
  });

  it('两面区分（背面浅绿-灰绿——FRPS「下面密被短柔毛」Verified [2][4]）+ 两面糙度差 +0.08（密短柔毛 > 悬铃木近无毛 0.06）', () => {
    const leaf = assemble(track(createKoelreuteriaLeafMaterial()), THREE.ShaderLib.physical);
    expect(leaf.fragmentShader).toContain('mix(vec3(1.09, 1.10, 1.13), vec3(1.0), float(gl_FrontFacing))'); // 背面 B 抬高于 R/G = 灰向（柔毛灰绿读向）
    expect(leaf.fragmentShader).not.toContain('vec3(1.06, 1.05, 1.16)'); // 香樟 glaucous 强粉感背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.08, 1.10, 1.02)'); // 悬铃木无粉感背面不串种
    expect(leaf.fragmentShader).not.toContain('vec3(1.10, 1.12, 1.04)'); // 榉树背面乘子不串种
    expect(leaf.fragmentShader).toContain('(1.0 - float(gl_FrontFacing)) * 0.08'); // 两面糙度差 +0.08（背面柔毛糙）
  });

  it('背光透光中等（家族中庸档）：峰值 0.32（悬铃木厚叶 0.28 < 0.32 < 银杏纸质 0.34——「纸质或近革质」取纸质端）；透射色黄绿基调；先例峰值不串种', () => {
    const { fragmentShader } = assemble(track(createKoelreuteriaLeafMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('* pow(koeBack, 3.0) * koeTransVar * koeAlpha * 0.32;');
    expect(fragmentShader).toContain('vec3(0.55, 0.90, 0.35)'); // 黄绿透射色（纸质叶中绿基调）
    expect(0.32).toBeGreaterThan(0.28); // > 悬铃木厚实挺括
    expect(0.32).toBeLessThan(0.34); // < 银杏纸质薄叶（家族中庸档）
    expect(fragmentShader).not.toContain('* 0.30;'); // 朴树峰值不串种
    expect(fragmentShader).not.toContain('* 0.40;'); // 榉树峰值不串种
    expect(fragmentShader).not.toContain('* 0.65;'); // 夏栎裂叶峰值不串种
  });

  it('叶底色 #527d37 中绿偏深（六树亮度链：银杏 > 朴树 > 悬铃木 > **栾树** > 夏栎 > 榉 > 樟）；纸质哑光 roughness 0.70（悬 0.66 < 0.70 < 朴 0.72）', () => {
    const leaf = track(createKoelreuteriaLeafMaterial());
    const hex = leaf.color.getHex();
    expect(hex).toBe(0x527d37); // 工程设定：Spec §5 正面中绿（偏深）+ leaf-a 深绿 [12] 交叉
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const l = luma([(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff]);
    expect(l).toBeLessThan(luma([0x52, 0x7e, 0x39])); // 暗于悬铃木（中绿）
    expect(l).toBeGreaterThan(luma([0x4e, 0x7c, 0x33])); // 亮于夏栎（中绿偏深档定位）
    expect(leaf.roughness).toBe(0.70); // 纸质叶哑光（「纸质或近革质」取纸质端）
    expect(0.70).toBeGreaterThan(0.66); // > 悬铃木厚实挺括
    expect(0.70).toBeLessThan(0.72); // < 朴树近革质
    expect(leaf.metalness).toBe(0);
  });

  it('皮第七语言：底色 #90928a 灰白-灰褐（七树最浅——亮于悬铃木/榉树灰绿族）+ 光滑粉质感哑光 0.87（vs 纵裂族 0.91–0.93）', () => {
    const bark = track(createKoelreuteriaBarkMaterial());
    const hex = bark.color.getHex();
    expect(hex).toBe(0x90928a); // 工程设定：bark-b「浅灰白-灰褐基色」双系统一致（主代理补充证据）
    const luma = (c: number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const l = luma([(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff]);
    expect(l).toBeGreaterThan(luma([0x78, 0x7e, 0x6f])); // 亮于悬铃木灰绿
    expect(l).toBeGreaterThan(luma([0x78, 0x7c, 0x72])); // 亮于榉树灰白（七树最浅读向 = 「浅色光滑」）
    expect(bark.roughness).toBe(0.87); // 光滑粉质感哑光
    expect(bark.roughness).toBeLessThan(0.91); // < 纵裂族高糙哑光
  });

  it('皮孔麻点场（身份核心，全 ALU 网格 hash）：52×78 格高密度 + 圆点/短条两型（「皮孔圆形至椭圆形」FRPS Verified [2]）+ 82% 格有孔 + 深色麻点 + 单色调微变（无剥落无三色带）', () => {
    const { fragmentShader } = assemble(track(createKoelreuteriaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('vec2(vUv.x * 52.0, vUv.y * 78.0)'); // 皮孔格密度（高密度）
    expect(fragmentShader).toContain('step(0.42, fract(koeLR * 3.17))'); // 短条型 58%（椭圆形——v 向拉长）
    expect(fragmentShader).toContain('mix(1.0, 0.62, koeLDash)'); // v 向压 0.62 = 短条拉长读向
    expect(fragmentShader).toContain('step(0.18, koeLR)'); // 82% 格有孔密度门
    expect(fragmentShader).toContain('vec3(0.74, 0.72, 0.70)'); // 皮孔深色麻点
    expect(fragmentShader).toContain('vec3(0.94 + 0.10 * koeTone)'); // 单色调微变 ±5%（「无剥落、单色调」生产口径）
    // 无剥落族标记不串种（悬铃木三色带 / 榉树锈橙 / 朴树浅裂小斑）
    expect(fragmentShader).not.toContain('vec3(1.32, 1.28, 1.14)'); // 悬铃木新露奶油白带不串种
    expect(fragmentShader).not.toContain('vec3(1.35, 0.92, 0.64)'); // 榉树锈橙新斑不串种
    expect(count(fragmentShader, 'smoothstep(0.38, 0.50')).toBe(0); // 悬铃木三色带阈值链不串种
  });

  it('局部浅细纵裂（High）：≈28 线/周细线 × 低频门控局部片域（「局部浅细纵裂」bark-b）× 微暗；上部红褐细枝收敛（一年生枝红褐照片双源 [12]）', () => {
    const { fragmentShader } = assemble(track(createKoelreuteriaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('abs(fract(vUv.x * 27.8) - 0.5)'); // u 向细线（≈28 线/周——浅细）
    expect(fragmentShader).toContain('smoothstep(0.58, 0.78, koeTone)'); // 低频门控（局部片域——非通干纵裂）
    expect(fragmentShader).toContain('vec3(0.90, 0.89, 0.88)'); // 微暗（浅——脊浅沟浅低浮雕，几何侧最浅档配合）
    expect(fragmentShader).toContain('float koeBarkHigh = smoothstep(1.906, 4.0, vTreePos.y);'); // 冠基 1.906m 上部门控（slot-0 实测同步；带宽 2.1 冠深等比）
    expect(fragmentShader).toContain('vec3(1.12, 0.96, 0.84)'); // 上部红褐收敛
    expect(fragmentShader).not.toContain('Moss'); // 苔藓不做（不做不编造——沿先例）
  });

  it('花域（v∈[5,6]）：三域分支字面量 + 团块云包络 ∧ 细碎花簇格 + 金黄-橙黄两端变奏 + 瓣基橙红点（High 近景）+ JS 锚（疏散填充率/边缘裁切/floret 存在）', () => {
    const { fragmentShader } = assemble(track(createKoelreuteriaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('if (vUv.y >= 6.0) {'); // 果域分支（v∈[6,7]）
    expect(fragmentShader).toContain('} else if (vUv.y >= 4.5) {'); // 花域分支（v∈[4.5,6)——域身份标记，皮弧长域 ≤2.9 三重隔离）
    expect(fragmentShader).toContain('vec2(vUv.x, vUv.y - 5.0)'); // 花域 uv 归一（v∈[5,6] → [0,1]）
    expect(fragmentShader).toContain('(koeF.x - 0.5) * 0.65'); // 花卡宽/长比 0.65 冻结接口
    expect(fragmentShader).toContain('koeFOs'); // 格内 hash 抖动（防阵列读向）
    expect(fragmentShader).toContain('mod(koeFId.y, 2.0) - 0.5'); // 奇偶行错位
    expect(fragmentShader).toContain('sin(dot(koeFId, vec2(127.1, 311.7)) + koeF.x * 9.7)'); // inline sin-hash + u 相位变奏（每卡花簇排布差异）
    expect(fragmentShader).toContain('vec3(1.00, 0.72, 0.24)'); // 金黄-橙黄深端（「花瓣鲜黄」[12] + NC yellow [9]）
    expect(fragmentShader).toContain('vec3(1.00, 0.87, 0.44)'); // 浅金黄端（金黄-橙黄变奏两端）
    expect(fragmentShader).toContain('vec3(0.86, 0.34, 0.20)'); // 瓣基橙红点（「瓣基小片橙红斑块」[12] + NC "touch of red at the base" [9]）
    // JS 锚：疏散填充率（「圆锥花序大型，分枝广展」FRPS Verified——非密团）+ 侧缘裁切 + floret 实体存在
    let fill = 0;
    let tot = 0;
    for (let i = 0; i < 400; i++) {
      for (let j = 0; j < 400; j++) {
        const a = koeFlowerAlphaJS((i + 0.5) / 400, (j + 0.5) / 400);
        tot++;
        if (a >= 0.5) fill++;
      }
    }
    expect(fill / tot).toBeGreaterThan(0.2); // 非空卡（floret 实体存在）
    expect(fill / tot).toBeLessThan(0.55); // 疏散细碎（非密团——间斑裁穿）
    expect(koeFlowerAlphaJS(0.001, 0.5)).toBeLessThan(0.5); // 侧缘裁切（团块云包络）
    let maxAlpha = 0;
    for (let s = 0; s < 400; s++) maxAlpha = Math.max(maxAlpha, koeFlowerAlphaJS(0.3 + (s % 20) * 0.02, 0.4 + Math.floor(s / 20) * 0.01));
    expect(maxAlpha).toBeGreaterThan(0.95); // floret 实心（格心 alpha 满）
  });

  it('果域（v∈[6,7]）：五档色序字面量（绿→黄绿/乳白→鲑粉→玫红→褐）+ u 果档随机 warp（鲑粉+玫红 >50% 主导 + 单调）+ 膜质网纹（High）+ 实体无裁切', () => {
    const { fragmentShader } = assemble(track(createKoelreuteriaBarkMaterial()), THREE.ShaderLib.physical);
    expect(fragmentShader).toContain('vec3(0.55, 0.64, 0.33)'); // 档 0 绿（幼果）
    expect(fragmentShader).toContain('vec3(0.83, 0.83, 0.68)'); // 档 1 黄绿/乳白（初果期浅色相）
    expect(fragmentShader).toContain('vec3(0.93, 0.64, 0.55)'); // 档 2 鲑粉（主相——fruit-b 同序并存 [12]）
    expect(fragmentShader).toContain('vec3(0.83, 0.46, 0.54)'); // 档 3 玫红（主相——NC "rose-pink" [9]）
    expect(fragmentShader).toContain('vec3(0.56, 0.43, 0.34)'); // 档 4 褐（「老熟时褐色」FRPS Verified [2][4]）
    expect(fragmentShader).toContain('0.09 * sin(6.28318 * (vUv.x - 0.1))'); // u 果档随机 warp（相位峰落鲑粉/玫红界 0.6）
    expect(fragmentShader).toContain('facVnoise(vUv * 6.0 + vec2(43.9, 29.1))'); // 膜质网纹（「果瓣膜质，有网状脉纹」属级 Verified [6]——High）
    // JS 锚：五档权重（鲑粉+玫红 >50% 主导 = 生产口径「主相鲑粉-玫红主导」；绿/褐 <20%；warp 单调无逆映射）
    const bins = [0, 0, 0, 0, 0];
    for (let i = 0; i < 100000; i++) bins[Math.floor(koeFruitWarpJS((i + 0.5) / 100000) * 5)]++;
    const pct = bins.map((b) => b / 1000);
    expect(pct[2] + pct[3]).toBeGreaterThan(50); // 鲑粉+玫红主导
    expect(pct[0]).toBeLessThan(20); // 绿（幼果非主相）
    expect(pct[4]).toBeLessThan(20); // 褐（老熟非主相）
    for (let i = 1; i < 1000; i++) {
      expect(koeFruitWarpJS(i / 1000)).toBeGreaterThanOrEqual(koeFruitWarpJS((i - 1) / 1000)); // 单调（无逆映射——档边界稳定）
    }
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
      [track(createKoelreuteriaLeafMaterial()), track(createKoelreuteriaLeafMaterial('high')), THREE.ShaderLib.physical],
      [track(createKoelreuteriaBarkMaterial()), track(createKoelreuteriaBarkMaterial('high')), THREE.ShaderLib.physical],
      [track(createKoelreuteriaLeafDepthMaterial()), track(createKoelreuteriaLeafDepthMaterial('high')), THREE.ShaderLib.depth],
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
    expectKey(track(createKoelreuteriaLeafMaterial()), 'koelreuteria:leaf');
    expectKey(track(createKoelreuteriaLeafMaterial('mid')), 'koelreuteria:leaf:mid');
    expectKey(track(createKoelreuteriaLeafMaterial('low')), 'koelreuteria:leaf:low');
    expectKey(track(createKoelreuteriaBarkMaterial()), 'koelreuteria:bark');
    expectKey(track(createKoelreuteriaBarkMaterial('mid')), 'koelreuteria:bark:mid');
    expectKey(track(createKoelreuteriaBarkMaterial('low')), 'koelreuteria:bark:low');
    expectKey(track(createKoelreuteriaLeafDepthMaterial()), 'koelreuteria:leaf-depth');
    expectKey(track(createKoelreuteriaLeafDepthMaterial('mid')), 'koelreuteria:leaf-depth:mid');
    expectKey(track(createKoelreuteriaLeafDepthMaterial('low')), 'koelreuteria:leaf-depth:low');
    expect(keys.size).toBe(9);
  });

  it('与 ginkgo/zelkova/camphor/platanus 36 键零碰撞（koelreuteria 前缀不与先例混缓存）', () => {
    const foreignKeys = new Set<string>();
    for (const make of [createZelkovaLeafMaterial, createZelkovaBarkMaterial, createZelkovaLeafDepthMaterial,
      createCamphorLeafMaterial, createCamphorBarkMaterial, createCamphorLeafDepthMaterial,
      createGinkgoLeafMaterial, createGinkgoBarkMaterial, createGinkgoLeafDepthMaterial,
      createPlatanusLeafMaterial, createPlatanusBarkMaterial, createPlatanusLeafDepthMaterial]) {
      for (const level of ['high', 'mid', 'low'] as const) {
        foreignKeys.add(track(make(level)).customProgramCacheKey());
      }
    }
    expect(foreignKeys.size).toBe(36);
    for (const make of [createKoelreuteriaLeafMaterial, createKoelreuteriaBarkMaterial, createKoelreuteriaLeafDepthMaterial]) {
      for (const level of ['high', 'mid', 'low'] as const) {
        expect(foreignKeys.has(track(make(level)).customProgramCacheKey())).toBe(false);
      }
    }
  });

  it('叶 Mid：SDF 与 High 同源全形（含两级窗列 + 锯齿——档间剪影一致：复叶羽状剪影是中距身份）+ 去小叶脉/叶团/糙度叶团项；透光/hue·luma/shade/叶背保留；片元零噪声', () => {
    const high = assemble(track(createKoelreuteriaLeafMaterial()), THREE.ShaderLib.physical);
    const mid = assemble(track(createKoelreuteriaLeafMaterial('mid')), THREE.ShaderLib.physical);
    expect(sdfOf(mid.fragmentShader)).toBe(sdfOf(high.fragmentShader)); // Mid SDF = High 同源全形
    expect(sdfOf(mid.fragmentShader)).toContain('koePinnaEdge'); // 主函数合成行在场（档间剪影一致）
    expect(pinnaOf(mid.fragmentShader)).toBe(pinnaOf(high.fragmentShader)); // 两级窗列子函数同源（形态 A 拆分——FXC X4000 规避，数学逐位等价重构）
    expect(pinnaOf(mid.fragmentShader)).toContain('koeSerrOn'); // 含缘相分档锯齿（子函数体内——SDF 源块全形）
    for (const gone of ['koeVMid', 'koeVLat', 'koeClump', 'koeVPeak']) {
      expect(mid.fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(mid.fragmentShader).not.toContain('(koeClump - 0.5) * 0.06'); // 糙度注入同步去叶团项
    expect(mid.fragmentShader).toContain('#if NUM_DIR_LIGHTS > 0'); // 透光保留
    expect(mid.fragmentShader).toContain('koeTransVar');
    expect(mid.fragmentShader).toContain('vec3 koeHue'); // hue·luma 逐叶变奏保留
    expect(mid.fragmentShader).toContain('float koeLuma');
    expect(mid.fragmentShader).toContain('(0.80 + 0.20 * koeShade)'); // 冠内竖向自遮蔽保留（地板 0.80 沿先例口径）
    expect(mid.fragmentShader).toContain('float(gl_FrontFacing)) * 0.08'); // 两面糙度差保留
    expect(count(mid.fragmentShader, 'facVnoise(')).toBe(3); // 库 3 + 0 调用（叶团去采样——Mid 片元零噪声执行）
  });

  it('叶 Low：SDF 换 SDF_LOW（去两级窗列/锯齿——复叶细化 Spec §7 牺牲顺序「羽片对数结构 → 复叶层叠剪影（最后保留）」）；包络/主轴与 High 逐字同源；去叶脉/叶团/透光；hue·luma/shade/叶背保留；片元零噪声', () => {
    const high = assemble(track(createKoelreuteriaLeafMaterial()), THREE.ShaderLib.physical);
    const low = assemble(track(createKoelreuteriaLeafMaterial('low')), THREE.ShaderLib.physical);
    const lowSdf = sdfOf(low.fragmentShader);
    expect(lowSdf).not.toBe(sdfOf(high.fragmentShader)); // Low SDF = 去窗列版（换字符串）
    for (const gone of ['koeSpace', 'koeLob', 'koeSerrOn', 'koeVMid', 'koeClump', 'koeTransVar', 'vec3(0.55, 0.90, 0.35)']) {
      expect(low.fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    // 包络/主轴两项与 High 逐字同源（档间叶形身份一致的去细节不改形原则——远距保留大羽叶层叠轮廓色块）
    expect(lowSdf).toContain('sin(3.14159 * pow(clamp(koeP.y, 0.001, 0.999), 0.80))');
    expect(lowSdf).toContain('mix(0.78, 1.18, smoothstep(0.30, 0.92, koeP.y))');
    expect(lowSdf).toContain('0.013 * (1.0 - 0.5 * koeP.y)');
    expect(lowSdf).toContain('clamp(koeEdge / 0.02 + 0.5'); // 坡宽同步（档间 AA 边一致）
    expect(count(low.fragmentShader, '#include <opaque_fragment>')).toBe(1); // 透光不注入但锚点原句不动
    expect(low.fragmentShader).toContain('(0.80 + 0.20 * koeShade)'); // shade 保留
    expect(low.fragmentShader).toContain('vec3 koeHue'); // hue·luma 保留
    expect(low.fragmentShader).toContain('float(gl_FrontFacing)) * 0.08'); // 两面糙度差保留
    expect(count(low.fragmentShader, 'facVnoise(')).toBe(3); // 片元零噪声采样（库内 3 为死码，运行时零执行）
  });

  it('皮 Mid：去浅细纵裂/果膜网纹/果透光/瓣基红点（近景细节层）；皮孔麻点/花簇/果五档/上部红褐保留（中距身份信号 Spec §7）', () => {
    const { fragmentShader } = assemble(track(createKoelreuteriaBarkMaterial('mid')), THREE.ShaderLib.physical);
    for (const gone of ['koeFis', 'koeRet', 'vec3(0.86, 0.34, 0.20)', '27.8', 'koeFBack']) {
      expect(fragmentShader, `Mid 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('koeDot'); // 皮孔麻点保留（中距身份）
    expect(fragmentShader).toContain('vUv.x * 52.0'); // 皮孔格保留
    expect(fragmentShader).toContain('vec3(0.93, 0.64, 0.55)'); // 果五档保留（鲑粉主相）
    expect(fragmentShader).toContain('vec3(1.00, 0.87, 0.44)'); // 花簇金黄变奏保留
    expect(fragmentShader).toContain('vec3(1.12, 0.96, 0.84)'); // 上部红褐保留
    expect(fragmentShader).toContain('koeFlowerAlpha'); // 花簇 alpha 保留（剪影身份）
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 色调微变 1（果膜/裂线门控去采样）
  });

  it('皮 Low：再去皮孔麻点（远距亚像素）；单色调微变 + 上部红褐 + 果五档 + 花簇金黄保留（几何 Low 花果省略时为死码）', () => {
    const { fragmentShader } = assemble(track(createKoelreuteriaBarkMaterial('low')), THREE.ShaderLib.physical);
    for (const gone of ['koeDot', 'koeLc', 'koeFis', 'koeRet', 'vec3(0.86, 0.34, 0.20)']) {
      expect(fragmentShader, `Low 不应含 ${gone}`).not.toContain(gone);
    }
    expect(fragmentShader).toContain('vec3(0.94 + 0.10 * koeTone)'); // 单色调微变保留（远距浅色光滑剪影）
    expect(fragmentShader).toContain('vec3(1.12, 0.96, 0.84)'); // 上部红褐（结构剪影项三档保留）
    expect(fragmentShader).toContain('vec3(0.83, 0.46, 0.54)'); // 果五档保留
    expect(fragmentShader).toContain('vec3(1.00, 0.72, 0.24)'); // 花簇金黄保留
    expect(count(fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 色调微变 1
  });

  it('深度分档：Mid = High SDF（含两级窗列）/ Low = SDF_LOW（去窗列）；与叶表面档内逐字一致（表面/影裁切档内一致）；三档零噪声库 + 花簇裁切三档在位', () => {
    const high = assemble(track(createKoelreuteriaLeafDepthMaterial()), THREE.ShaderLib.depth);
    const mid = assemble(track(createKoelreuteriaLeafDepthMaterial('mid')), THREE.ShaderLib.depth);
    const low = assemble(track(createKoelreuteriaLeafDepthMaterial('low')), THREE.ShaderLib.depth);
    const highSdf = sdfOf(high.fragmentShader);
    expect(sdfOf(mid.fragmentShader)).toBe(highSdf); // Mid 深度 = High SDF（同源全形含两级窗列）
    expect(highSdf).toContain('koePinnaEdge'); // 档间剪影一致（复叶羽状影读向保留）
    expect(sdfOf(low.fragmentShader)).not.toBe(highSdf); // Low 深度 = SDF_LOW（去窗列版）
    expect(sdfOf(low.fragmentShader)).not.toContain('koeSpace');
    for (const shader of [high, mid, low]) {
      expect(shader.fragmentShader).toContain('koeFlowerAlpha'); // 花簇裁切三档在位（几何 Low 花果省略时为死码）
      expect(count(shader.fragmentShader, 'facVnoise(')).toBe(0); // 三档深度零噪声库
    }
    // 表面/影档内一致：叶表面各档 SDF === 深度各档 SDF
    for (const level of ['high', 'mid', 'low'] as const) {
      const surface = assemble(track(createKoelreuteriaLeafMaterial(level)), THREE.ShaderLib.physical);
      const depthShader = assemble(track(createKoelreuteriaLeafDepthMaterial(level)), THREE.ShaderLib.depth);
      expect(sdfOf(surface.fragmentShader)).toBe(sdfOf(depthShader.fragmentShader)); // 同一 GLSL 字符串（单一来源纪律）
      if (level !== 'low') {
        expect(pinnaOf(surface.fragmentShader)).toBe(pinnaOf(depthShader.fragmentShader)); // 两级窗列子函数同源（形态 A 拆分——Low = SDF_LOW 无子函数）
      }
    }
  });

  it('风动三档同源：叶/皮三档顶点 GLSL 全文一致（KOE_WIND 同一常量——档间相位一致 = 身份一致）', () => {
    const leafHigh = assemble(track(createKoelreuteriaLeafMaterial()), THREE.ShaderLib.physical);
    const barkHigh = assemble(track(createKoelreuteriaBarkMaterial()), THREE.ShaderLib.physical);
    for (const level of ['mid', 'low'] as const) {
      const leaf = assemble(track(createKoelreuteriaLeafMaterial(level)), THREE.ShaderLib.physical);
      const bark = assemble(track(createKoelreuteriaBarkMaterial(level)), THREE.ShaderLib.physical);
      expect(leaf.vertexShader).toBe(leafHigh.vertexShader);
      expect(bark.vertexShader).toBe(barkHigh.vertexShader);
    }
  });

  it('分档底参契约不因档破：叶三档 alphaTest/alphaToCoverage/DoubleSide/USE_UV/零贴图；皮三档 DoubleSide/alphaTest/USE_UV；深度 alphaTest', () => {
    for (const level of ['high', 'mid', 'low'] as const) {
      const leaf = track(createKoelreuteriaLeafMaterial(level));
      const bark = track(createKoelreuteriaBarkMaterial(level));
      const depth = track(createKoelreuteriaLeafDepthMaterial(level));
      expect(leaf.alphaTest).toBe(0.5);
      expect(leaf.alphaToCoverage).toBe(true);
      expect(leaf.side).toBe(THREE.DoubleSide);
      expect(leaf.defines?.USE_UV).toBe('');
      expect(leaf.map).toBeNull(); // 零贴图（D13）三档同守
      expect(bark.alphaTest).toBe(0.5); // 花卡裁切三档在位
      expect(bark.side).toBe(THREE.DoubleSide); // 组 0 三域契约三档同守
      expect(bark.defines?.USE_UV).toBe('');
      expect(depth.alphaTest).toBe(0.5);
      expect(depth.defines?.USE_UV).toBe('');
    }
  });

  it('uTime 桥接三档不缺位：材质级 uniforms.uTime 与编译后 shader.uniforms 同引用（Mid/Low）', () => {
    for (const make of [createKoelreuteriaLeafMaterial, createKoelreuteriaBarkMaterial]) {
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
    const leafA = track(createKoelreuteriaLeafMaterial());
    const leafB = track(createKoelreuteriaLeafMaterial());
    const barkA = track(createKoelreuteriaBarkMaterial());
    const barkB = track(createKoelreuteriaBarkMaterial());
    const depth = track(createKoelreuteriaLeafDepthMaterial());
    expect(leafA).not.toBe(leafB); // 每次调用 new（缓存会 dispose，禁止模块级共享）
    expect(barkA).not.toBe(barkB);
    expect(leafA.customProgramCacheKey()).toBe(leafB.customProgramCacheKey()); // 同配方共享 program
    expect(barkA.customProgramCacheKey()).toBe(barkB.customProgramCacheKey());
    expect(new Set([leafA.customProgramCacheKey(), barkA.customProgramCacheKey(), depth.customProgramCacheKey()]).size).toBe(3);
    expect(materialUniformsOf(leafA).uTime).not.toBe(materialUniformsOf(leafB).uTime); // uTime 桥接对象实例独立（dispose 安全）
    expect(materialUniformsOf(barkA).uTime).not.toBe(materialUniformsOf(barkB).uTime);
  });

  it('底参与侧向：叶 DoubleSide/纸质哑光/USE_UV；皮 DoubleSide（组 0 契约）/光滑粉质感/USE_UV；均零贴图', () => {
    const leaf = track(createKoelreuteriaLeafMaterial());
    const bark = track(createKoelreuteriaBarkMaterial());
    expect(leaf.side).toBe(THREE.DoubleSide);
    expect(leaf.metalness).toBe(0);
    expect(leaf.roughness).toBeGreaterThan(0.66); // 纸质哑光（0.70）
    expect(leaf.roughness).toBeLessThan(0.72);
    expect(leaf.map).toBeNull(); // 零贴图（D13）
    expect(bark.side).toBe(THREE.DoubleSide); // 组 0 三域契约（花交叉竖卡）
    expect(bark.metalness).toBe(0);
    expect(bark.roughness).toBeLessThan(0.9); // 光滑粉质感哑光（vs 纵裂族高糙）
    expect(bark.map).toBeNull();
    expect(leaf.defines?.USE_UV).toBe('');
    expect(bark.defines?.USE_UV).toBe('');
  });
});

describe('成本记账（10 万实例每像素预算：叶 High ≈11×（复叶两级窗列 SDF ≈4.5× 的账——方法里程碑）/ 皮 High 最重路径 ≈5×，hash21=1×/vnoise=3×——两级窗列/锯齿/花簇格 ALU 化红利）', () => {
  it('facVnoise 调用数：叶 High 1 处（3×）、Mid/Low 0 处；皮 High 2 处（色调微变 + 果膜网纹，域互斥执行）、Mid/Low 1 处；深度 0 处（零噪声库注入）；顶点零噪声', () => {
    const leaf = assemble(track(createKoelreuteriaLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createKoelreuteriaBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createKoelreuteriaLeafDepthMaterial()), THREE.ShaderLib.depth);
    // FACILITY_GLSL_NOISE 自身贡献 3 处（定义 1 + facFbm2 函数体内调用 2——fbm2 未被配方使用）
    expect(count(leaf.fragmentShader, 'facVnoise(')).toBe(4); // 库 3 + 调用 1（叶团——两级窗列/锯齿 ALU 化免噪声）
    expect(count(bark.fragmentShader, 'facVnoise(')).toBe(5); // 库 3 + 调用 2（色调微变 + 果膜网纹——域互斥，最重路径 1 次执行）
    expect(count(depth.fragmentShader, 'facVnoise(')).toBe(0); // 深度零噪声库注入（两级窗列 ALU 化先天满足影 pass 不吃噪声）
    expect(count(leaf.vertexShader, 'facVnoise(')).toBe(0); // 顶点风动纯 sin/cos
    expect(count(bark.vertexShader, 'facVnoise(')).toBe(0);
  });

  it('全源零循环/零纹理采样（配方确定性纯函数 + SDF 纯 ALU）；全源零三角函数反函数调用（沿轴窗列 = floor/fract 代理——成本纪律）', () => {
    const shaders = [
      assemble(track(createKoelreuteriaLeafMaterial()), THREE.ShaderLib.physical),
      assemble(track(createKoelreuteriaBarkMaterial()), THREE.ShaderLib.physical),
      assemble(track(createKoelreuteriaLeafDepthMaterial()), THREE.ShaderLib.depth),
    ];
    for (const shader of shaders) {
      for (const source of [shader.vertexShader, shader.fragmentShader]) {
        expect(source).not.toContain('for (');
        expect(source).not.toContain('while');
        expect(source).not.toContain('texture'); // 零贴图零采样（D13）
        expect(source).not.toContain('atan('); // 复叶沿轴窗列免反三角调用（floor/fract 折叠——成本纪律）
      }
    }
  });
});

describe('注入点缺失即抛（首次渲染前暴雷）', () => {
  it('片元 map_fragment 摘除 → 叶/皮/深度均抛「注入点缺失」', () => {
    for (const make of [createKoelreuteriaLeafMaterial, createKoelreuteriaBarkMaterial, createKoelreuteriaLeafDepthMaterial]) {
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
    const leaf = track(createKoelreuteriaLeafMaterial());
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

    const depth = track(createKoelreuteriaLeafDepthMaterial());
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

  it('片元 roughnessmap_fragment / opaque_fragment 摘除 → 抛「注入点缺失」（透光/果透光注入仅 High——Mid/Low 无项不注入为设计内）', () => {
    const bark = track(createKoelreuteriaBarkMaterial());
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

    const leaf = track(createKoelreuteriaLeafMaterial());
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

    const barkHigh = track(createKoelreuteriaBarkMaterial()); // 果域微透光（High）也挂 opaque_fragment
    expect(() =>
      barkHigh.onBeforeCompile(
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

    const leaf = assemble(track(createKoelreuteriaLeafMaterial()), THREE.ShaderLib.physical);
    const bark = assemble(track(createKoelreuteriaBarkMaterial()), THREE.ShaderLib.physical);
    const depth = assemble(track(createKoelreuteriaLeafDepthMaterial()), THREE.ShaderLib.depth);
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
    const material = track(createKoelreuteriaLeafMaterial());
    const scene = new THREE.Scene().add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
    clock.apply(scene);
    expect(materialUniformsOf(material).uTime!.value).toBeCloseTo(0.5, 10); // 静止在冻结帧
  });
});
