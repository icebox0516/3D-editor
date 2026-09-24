/**
 * runtime/procedural/tree/treeFadeDither —— 共享 dither fade 材质注入（T021.3，D41 §5.3）。
 *
 * 职责：乔木表示过渡的材质消费面——按逐实例退场度 `aFadeOut`（属性缝契约 =
 *   runtime/instancing/fadeGeometry，Step A 交付）做 Dither / Alpha-Hash 风格溶解/浮现，
 *   不用普通透明度（§5.3）。消费方 = 13 树种叶卡/树皮材质（{mid|low} ↔ canopy dither 的
 *   outgoing/incoming 双角色 + Low→Cull 退场）+ BroadleafCanopyProxy card/trunk（incoming/
 *   outgoing 双角色）。**深度材质一律不注入**（物种 customDepthMaterial 与 canopy depth）：
 *   阴影过渡走中点切换（§5.4，接线归 021.5），不做双 Shadow 交叉渐变——fade 门只进主渲染。
 *
 * ── 必答题：dither 阈值与 alphaTest 0.5 + alphaToCoverage 的合成顺序（three r0.186 实源）──
 * three r0.186 `alphatest_fragment`（USE_ALPHATEST ∧ ALPHA_TO_COVERAGE 双 define 时）：
 *      `diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth(diffuseColor.a), diffuseColor.a );`
 *      `if ( diffuseColor.a == 0.0 ) discard;`
 *   即 SDF 覆盖率坡先经 fwidth 自适应 smoothstep 重映射成 MSAA 覆盖率坡，硬裁切只杀 a==0；
 *   存活片元的 a' 随 gl_FragColor.a 交 GL_SAMPLE_ALPHA_TO_COVERAGE 派生采样掩码（WebGLRenderer
 *   按 material.alphaToCoverage 开状态，WebGLProgram 打 ALPHA_TO_COVERAGE define）。
 * 本模块的 fade 是**独立第二道 discard 门**，不读写 alpha 通道。像素存活条件的精确表述：
 *      存活 ⟺ ( a_sdf 经 smoothstep(0.5, 0.5+fwidth(a_sdf), ·) 重映射后 > 0 )   ← 既有叶裁切
 *              ∧ ( tfdNoise(像素) ≥ aFadeOut )                                  ← fade dither 门
 *   （无 alphaTest 的消费方——树皮 / canopy 卡 / canopy 干柱——只有第二门。）
 * - **A2C 是否/如何吃 fade：不吃。** fade 从不触碰 diffuseColor.a：A2C 的输入值流（SDF 坡 →
 *   fwidth smoothstep 重映射 → gl_FragColor.a → 采样掩码）与无 fade 时逐位相同；被 fade 杀掉的
 *   片元是整片元移除（不写颜色/深度/覆盖掩码），存活片元的边缘 AA 逐位保留。反向亦然：半覆盖
 *   边缘片元与内部片元按同一 tfdNoise 阈值判定，fade 对边缘无偏置——溶解密度处处 = 1 − aFadeOut。
 * - **为何 0.04 坡宽 / 75% 齿幅顶格纪律不被破坏**：该纪律约束的是 SDF alpha 值流的形状（齿/耳
 *   振幅 ≤ 坡宽 75% → 等值线干净穿越 0.5 → 重映射稳定不闪）。fade 注入不触碰 SDF、不触碰
 *   diffuseColor.a、不在 uv 域新增高频项——tfdNoise 是纯屏幕域函数，与 alpha 值流无关，
 *   fwidth(diffuseColor.a) 的求值位置（alphatest_fragment 内）与求值结果零改动。discard 不影响
 *   同 2×2 quad 的导数求值（本注入位于其后，且 helper invocation 语义下导数已定）。
 * - **注入点 = 片元 `#include <alphatest_fragment>` 之后**（three r0.186 meshphysical 片元链：
 *   map → color → alphamap → alphatest → **alphahash** → roughness → …）。这正是 three 为随机
 *   alpha 裁切预留的槽位（alphahash_fragment：`if (diffuseColor.a < getAlphaHashThreshold(
 *   vPosition)) discard;`——同族机制：阈值比较 discard），占用架构原生槽位而非自造位置；两门
 *   为 AND、交换次序不改变存活集合，置于 alphatest 后沿 three 惯例且尽早跳过后续光照计算。
 *   `<color_fragment>`（vColor 逐实例乘算链）零触碰，`#include <alphatest_fragment>` 原句保留。
 *
 * ── dither 图案与稳定性裁定 ──
 * 图案 = 交错梯度噪声 IGN（Jimenez 2014）on gl_FragCoord.xy（**屏幕域**）：
 *      fract(52.9829189 * fract(0.06711056 * x + 0.00583715 * y))
 * - 静止相机逐像素稳定：纯像素坐标函数，无时间项、无逐帧重排（「无明显 dither 闪烁」验收项
 *   的机制根据；fade 进度是 metric 纯函数，相机静止即 fade 静止 → 图像逐帧逐位静止）。
 * - **风动取舍：图案随屏不随物**（记档裁定）。理由：(a) 过渡停滞 + 风动仍在的场景下，随物
 *   图案把噪声域粘在顶点上，叶卡厘米级每帧位移使同屏像素的阈值集重排 → 图案「沸腾」；随屏
 *   图案是屏幕系恒定场，叶在场后摆动，溶解颗粒纹路不动。(b) 像素尺度颗粒无需物体域 hash 的
 *   dFdx 对数尺度量化 + CDF 机制（three getAlphaHashThreshold 全套 ≈ 10× ALU）。(c) 双表示
 *   镜像互补（见下）要求两侧材料在同屏像素读到同一图案值——屏幕域天然保证。
 * - DPR / MSAA：gl_FragCoord 含 0.5 像素中心偏移，逐像素稳定与分辨率档无关。
 *
 * ── 双表示交叉的镜像互补（无空洞 / 无双绘）──
 * direct 变体（13 树种叶/皮）：存活 ⟺ ign ≥ fadeOut；mirrored 变体（canopy card/trunk）：
 *   存活 ⟺ 1−ign ≥ fadeOut ⟺ ign ≤ 1−fadeOut。dither 交叉期互补恒和（outgoing fadeOut=p /
 *   incoming fadeOut=1−p）代入：降档 species 存活 [p,1) ∧ canopy 存活 [0,p]；升档 canopy
 *   存活 [0,1−p) ∧ species 存活 [1−p,1)——两方向均为精确交接（同像素恰一侧存活，除 ign==p
 *   边界等值测度零），**不产生「双表示同像素全死」的透底空洞，也不产生同像素双绘**。若两侧
 *   同用 direct：中点处两侧都只活 [0.5,1)——下半图案全死 = 50% 绝对透底空洞（屏幕域图案对
 *   任意深度片元同值，逐层全杀），故镜像变体是必需设计而非可选。单侧退场（Low→Cull /
 *   Canopy→Cull）不受影响：presence = 1−fadeOut 单调。
 *
 * ── 零回退（tree3a 基线保护）──
 * 几何缺 aFadeOut 属性 → GL 顶点属性缺省 0（与 aSeed 先例同构）；值 0（稳态 / 硬切位零写）→
 *   `tfdNoise < vFadeOut` ⟺ `ign < 0` 恒假（ign ∈ [0,1)）——**零 discard，逐像素行为逐位
 *   不变**。材质参数（alphaTest/alphaToCoverage/side/color/roughness 等）零改动；注入为
 *   append-only（原生 chunk 原句保留），配方段 GLSL 零改动；既有注入（风动/SDF/透光）经
 *   hook 链先于本注入执行、互不触碰锚点。program 内容变化体现在 customProgramCacheKey
 *   追加 '+dither'（direct）/ '+dither:mirror'（mirrored）后缀——配方变即键变纪律。
 *
 * ── 成本记账（10 万实例纪律）──
 * 片元 +≈5 ALU（2 乘 + 2 fract + 1 比较）+ discard，零采样 / 零 uniform / 零分支；顶点 +1
 *   attribute 读取 + 1 varying 赋值；+1 条 varying 传输。相对叶 High 11.5× 基线 <0.5×。
 *
 * 边界：纯注入函数（零 THREE 对象所有权——不 new 不 dispose 不缓存）；不接 Runtime（值写出
 *   节奏 / 槽位路由归 Step A 已交付面）；注入点缺失即抛（首次渲染前暴雷）；GLSL float 字面量
 *   全带小数点。
 */
import * as THREE from 'three';

/**
 * dither 消费的逐实例退场度属性名（≡ runtime/instancing/fadeGeometry 的 FADE_ATTRIBUTE——
 * 字符串契约对齐，不 import 该模块避免材质面向 instancing 的反向耦合；同步由测试锁）。
 */
export const FADE_DITHER_ATTRIBUTE = 'aFadeOut';

/** 缓存键后缀（注入改变 program 内容——配方变即键变纪律） */
export const FADE_DITHER_CACHE_MARKER = '+dither';

/** 镜像图案变体后缀（canopy 侧） */
const FADE_DITHER_MIRROR_MARKER = ':mirror';

/** 单次替换（目标缺失即抛——注入点漂移在首次渲染前暴雷，不静默失效；沿 plantMaterials 范式） */
function replaceOnce(source: string, target: string, replacement: string): string {
  if (!source.includes(target)) throw new Error(`fade 材质注入点缺失: ${target}`);
  return source.replace(target, replacement);
}

/** 交错梯度噪声 IGN（Jimenez 2014）——屏幕域、无时间项、逐像素稳定（见模块头注裁定） */
const IGN_GLSL = 'fract(52.9829189 * fract(0.06711056 * gl_FragCoord.x + 0.00583715 * gl_FragCoord.y))';

/** fade 注入选项 */
export interface TreeFadeDitherOptions {
  /**
   * true = 镜像图案（canopy card/trunk 侧）：pattern = 1 − IGN。与 direct 侧（13 树种叶/皮）
   * 在同屏像素上精确互补——交叉期无透底空洞、无双绘（推导见模块头注）。两侧变体固定：
   * species = direct、canopy = mirrored，不得逐调用混换（互补性建立在家族固定配对上）。
   */
  mirrored?: boolean;
}

/**
 * 把 dither fade 注入已由工厂完成自有注入的材质（hook 链：工厂注入先执行，本注入追加）。
 * 顶点声明 `attribute float aFadeOut`（缺省 0 = 完整呈现）→ varying vFadeOut → 片元
 * alphatest_fragment 之后按 IGN 阈值 discard。零 uniform、零采样、append-only；缓存键在
 * 原键上追加后缀。返回同一材质（链式便利）。重复应用即抛（双注入会产生重复声明）。
 */
export function applyTreeFadeDither(
  material: THREE.MeshStandardMaterial,
  options: TreeFadeDitherOptions = {},
): THREE.MeshStandardMaterial {
  const mirrored = options.mirrored === true;
  const previousHook = material.onBeforeCompile; // 工厂自有注入（风动/SDF/透光）——先执行
  const previousKey = material.customProgramCacheKey;
  const baseKey = previousKey !== undefined ? previousKey.call(material) : material.type;
  if (baseKey.includes(FADE_DITHER_CACHE_MARKER)) {
    throw new Error(`fade dither 重复应用: ${baseKey}`);
  }
  const pattern = mirrored ? `1.0 - ${IGN_GLSL}` : IGN_GLSL;
  const discardBody = `
// tree fade dither —— aFadeOut 退场度门（T021.3）：0 = 完整呈现（本门恒不触发——图案 ∈ [0.0, 1.0) 恒不小于 0），1 = 全退场
// 图案 = 交错梯度噪声（屏幕域 gl_FragCoord）：无时间项纯像素函数——静止相机逐像素逐帧稳定（随屏不随物，模块头注裁定）${mirrored ? '\n// 镜像变体（canopy 侧）：与 direct 侧（13 树种叶/皮）同屏精确互补——交叉期恰一侧存活，无透底空洞无双绘' : ''}
float tfdNoise = ${pattern};
if (tfdNoise < vFadeOut) discard;
`;
  material.onBeforeCompile = (shader, renderer) => {
    if (previousHook !== undefined) previousHook.call(material, shader, renderer); // 工厂注入先行（各自锚点自校验）
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <common>',
      `#include <common>
attribute float aFadeOut;
varying float vFadeOut;`,
    );
    shader.vertexShader = replaceOnce(
      shader.vertexShader,
      '#include <begin_vertex>',
      `#include <begin_vertex>
vFadeOut = aFadeOut;`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <common>',
      `#include <common>
varying float vFadeOut;`,
    );
    shader.fragmentShader = replaceOnce(
      shader.fragmentShader,
      '#include <alphatest_fragment>',
      `#include <alphatest_fragment>
${discardBody}`,
    );
  };
  material.customProgramCacheKey = () => `${baseKey}${FADE_DITHER_CACHE_MARKER}${mirrored ? FADE_DITHER_MIRROR_MARKER : ''}`;
  return material;
}
