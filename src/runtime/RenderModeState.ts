/**
 * runtime/RenderModeState —— 视口渲染模式状态（T5.7 → T6.4 场景级 overrideMaterial 重构
 * → T8.4 诊断档扩展：clay / normals / islands，node 可测）。
 *
 * 职责（主代理裁决 R7 + T8.4 任务书）：六态的**状态与共享 override 材质供给**——
 *  - wireframe / xray：内容组像素由单一全局 override 材质重绘（scene.overrideMaterial +
 *    相机 layer 掩码分遍，见 composeRenderPasses），旧要素 + Region + 实例化模型全覆盖，
 *    ShaderMaterial 预设也被覆盖（插件零配合）；网格/环境/Gizmo/绘制预览豁免（分遍天然隔离）；
 *  - clay 灰模：MeshBasicMaterial 单色（≈UE Lighting Only 语义：无光影无贴图；
 *    选型钉死——不做 Lambert+环境光变体，后者依赖环境预设违反正交性目标）；
 *  - normals 法线：自写微型 ShaderMaterial——RGB = **世界空间法线**
 *    （three MeshNormalMaterial 默认编码视空间法线，相机旋转时颜色游动，不满足验收口径，
 *    故不用）；顶点着色器 normalize(mat3(modelMatrix) * normal)，含 USE_INSTANCING 分支
 *    （InstancedMesh 的 instanceMatrix 参与法线变换——由 three 按对象类型注入 #define），
 *    片元 vNormal * 0.5 + 0.5；
 *  - islands 孤岛高亮（数据卫生档）：无单一 primary override——两条内容遍各取其材：
 *    dim（已归类对象，深灰半透明、不写深度——亮侧对象可透过暗侧体块被读出）与
 *    highlight（未归类对象 = layerId === null，暖橙红醒目不透明）；对象分侧靠
 *    DIAG_LAYER 换层（Renderer 切换时一次性遍历，见 Renderer.applyRenderModeChange），
 *    不在本类职责内；
 *  - shaded：无 override，单遍渲染零开销零回归；
 *  - 模式切换只改状态（连续渲染下一帧生效），不遍历改写业务材质——
 *    旧「材质快照 / 还原」机制整体删除（applyTo / restoreAll 不复存在）。
 * 分遍渲染深坑对策（Renderer.renderFrame 消费 composeRenderPasses）：
 *  - scene.background 每遍全屏重绘 → 内容/辅助遍临时置 null（Renderer 处理）；
 *  - shadowMap.autoUpdate 各遍防重算 → 环境遍 true、其余 false；
 *  - override 用无光照依赖材质（内容遍相机掩码不收集环境组的灯）；
 *  - xray 透明度 XRAY_OPACITY_FACTOR 统一值（全局材质覆盖语义，不按对象折减）；
 *  - TransformControls 自身 raycast 按 layer 过滤 → Gizmo 装配处 enableAll（GizmoImpl 处理）；
 *    同理 islands 把未归类对象挪入 DIAG_LAYER → RuntimeViewport 拾取射线 enableAll；
 *  - Sprite 走 three 独立渲染路径不被 overrideMaterial 覆盖——已知边界（poi.billboard）。
 * 图层透明度语义（T8.4 注记）：场景级 override 下内容遍像素由统一 override 材质重绘，
 *   图层 opacity 乘算**不维持**（沿 T6.4 wireframe/xray 既有降级——xray/dim 透明度为全局
 *   统一值档位语义）；退出诊断档后乘算按材质基准 WeakMap 原值恢复，无残留。
 * 边界：不进每帧路径（仅环境变更时 setMode；材质在构造时创建一次、身份稳定）；
 *      override 材质归本类，dispose 释放（Renderer.dispose 调用）。
 */
import type { ViewportRenderMode } from '../scene/SceneData';
import * as THREE from 'three';

/** xray 透明度（统一值语义：全局 override 材质，不按对象折减；沿 T5.7 系数值） */
export const XRAY_OPACITY_FACTOR = 0.35;

/** 环境组层（地面/网格/天空感/灯光）：内容遍与辅助遍不渲染，环境遍独占 */
export const ENV_LAYER = 2;

/** 辅助组层（Gizmo 手柄/代理、绘制预览）：内容遍与环境遍不渲染，辅助遍独占 */
export const AUX_LAYER = 3;

/**
 * 诊断内容层（T8.4 islands）：未归类对象（layerId === null）在 islands 激活期间移入，
 * 亮遍（highlight override）独占；已归类对象保持 layer 0 由暗遍（dim override）渲染。
 * 与内容 0 / 环境 2 / 辅助 3 互不重叠；拾取射线需 enableAll 才能命中本层对象。
 */
export const DIAG_LAYER = 4;

/**
 * override 令牌（RenderPassPlan.overrideMaterial 的形状）：纯函数只声明「本遍用哪路
 * override」，具体材质由 RenderModeState 按当前模式解析——保持 composeRenderPasses
 * 可测且 islands 两条内容遍可表达不同 override。
 */
export type OverrideToken = 'none' | 'primary' | 'dim' | 'highlight';

/** 单遍渲染计划（Renderer.renderFrame 逐遍消费；分域内实现细节，不外溢） */
export interface RenderPassPlan {
  /** 本遍相机 layer 掩码（camera.layers.mask 直接赋值） */
  cameraMask: number;
  /** 本遍是否绘制 scene.background（背景全屏重绘，仅环境遍 true） */
  useBackground: boolean;
  /** 本遍 override 令牌（经 RenderModeState.resolveOverrideMaterial 解析为材质） */
  overrideMaterial: OverrideToken;
  /** 本遍 shadowMap.autoUpdate（仅环境遍 true——防多遍重算阴影） */
  updateShadow: boolean;
}

/**
 * 按模式产出分遍计划（纯函数，测试锁定）：
 *  - shaded：单遍全 layer（现状语义：背景照常、无 override、阴影照常）；
 *  - wireframe / xray / clay / normals：三遍——环境（背景=天空 + 阴影更新）→
 *    内容（overrideMaterial='primary' + 背景置 null + 阴影停更）→ 辅助（背景 null +
 *    阴影停更）；
 *  - islands：四遍——环境 → 暗遍（layer 0，'dim'，已归类对象）→ 亮遍（DIAG_LAYER，
 *    'highlight'，未归类对象）→ 辅助；
 *  遍间共享深度缓冲（Renderer 侧 autoClear=false + 帧首 clear 一次）。
 */
export function composeRenderPasses(mode: ViewportRenderMode): RenderPassPlan[] {
  if (mode === 'shaded') {
    return [{ cameraMask: 0xffffffff, useBackground: true, overrideMaterial: 'none', updateShadow: true }];
  }
  if (mode === 'islands') {
    return [
      { cameraMask: 1 << ENV_LAYER, useBackground: true, overrideMaterial: 'none', updateShadow: true },
      { cameraMask: 1, useBackground: false, overrideMaterial: 'dim', updateShadow: false },
      { cameraMask: 1 << DIAG_LAYER, useBackground: false, overrideMaterial: 'highlight', updateShadow: false },
      { cameraMask: 1 << AUX_LAYER, useBackground: false, overrideMaterial: 'none', updateShadow: false },
    ];
  }
  return [
    { cameraMask: 1 << ENV_LAYER, useBackground: true, overrideMaterial: 'none', updateShadow: true },
    { cameraMask: 1, useBackground: false, overrideMaterial: 'primary', updateShadow: false },
    { cameraMask: 1 << AUX_LAYER, useBackground: false, overrideMaterial: 'none', updateShadow: false },
  ];
}

/** wireframe override 观感基线（无光照线框；天蓝色系在天空/地面背景上可读） */
const WIREFRAME_COLOR = 0x2f6f9f;
/** xray override 观感基线（无光照半透明白青） */
const XRAY_COLOR = 0xa8cfe0;
/**
 * clay override 观感基线（T8.4）：中性灰单色——参考 DESIGN.md §2 石墨蓝灰阶
 * （ink-3 #7f879a 一带）取不带明显色偏的中浅灰，在四种环境预设的天空/地面上均可读。
 */
export const CLAY_COLOR = 0x9aa0a6;
/**
 * islands dim 观感基线（T8.4）：深灰半透明（已归类对象降暗；不写深度——未归类对象
 * 在其后仍可读，「宁可误亮不可漏亮」数据卫生语义）。
 */
export const ISLANDS_DIM_COLOR = 0x23272e;
/** islands dim 透明度（沿 xray 统一值档位语义） */
export const ISLANDS_DIM_OPACITY = 0.35;
/**
 * islands highlight 观感基线（T8.4）：暖橙红醒目色（未归类对象高亮；视口 3D 内容
 * 不受 UI 色板约束——DESIGN.md §2 既有条目，琥珀已归「正在被操作」语义故不复用）。
 */
export const ISLANDS_HIGHLIGHT_COLOR = 0xff6a45;

/**
 * normals override 着色器（T8.4）：RGB = 世界空间法线。
 * 顶点：normalize(mat3(modelMatrix) * normal)；USE_INSTANCING 分支乘 instanceMatrix
 * （#define 由 three 按渲染对象是否 InstancedMesh 注入，同一材质双形态程序各自编译）；
 * 片元：vNormal * 0.5 + 0.5（[-1,1] → [0,1] 直写 framebuffer——诊断读数语义，不做
 * 输出色彩空间转换，显示值即法线编码值）。
 */
const NORMALS_VERTEX_SHADER = /* glsl */ `
varying vec3 vWorldNormal;
void main() {
  vec3 n = normal;
#ifdef USE_INSTANCING
  n = mat3(instanceMatrix) * n;
#endif
  vWorldNormal = normalize(mat3(modelMatrix) * n);
  vec4 mvPosition = vec4(position, 1.0);
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif
  gl_Position = projectionMatrix * modelViewMatrix * mvPosition;
}
`;

const NORMALS_FRAGMENT_SHADER = /* glsl */ `
varying vec3 vWorldNormal;
void main() {
  gl_FragColor = vec4(normalize(vWorldNormal) * 0.5 + 0.5, 1.0);
}
`;

export class RenderModeState {
  private mode: ViewportRenderMode = 'shaded';
  private readonly wireframeMaterial: THREE.MeshBasicMaterial;
  private readonly xrayMaterial: THREE.MeshBasicMaterial;
  private readonly clayMaterial: THREE.MeshBasicMaterial;
  private readonly normalsMaterial: THREE.ShaderMaterial;
  private readonly islandsDimMaterial: THREE.MeshBasicMaterial;
  private readonly islandsHighlightMaterial: THREE.MeshBasicMaterial;
  private disposed = false;

  constructor() {
    this.wireframeMaterial = new THREE.MeshBasicMaterial({
      color: WIREFRAME_COLOR,
      wireframe: true,
    });
    this.xrayMaterial = new THREE.MeshBasicMaterial({
      color: XRAY_COLOR,
      transparent: true,
      opacity: XRAY_OPACITY_FACTOR,
      depthWrite: false,
    });
    this.clayMaterial = new THREE.MeshBasicMaterial({
      color: CLAY_COLOR,
    });
    this.normalsMaterial = new THREE.ShaderMaterial({
      vertexShader: NORMALS_VERTEX_SHADER,
      fragmentShader: NORMALS_FRAGMENT_SHADER,
    });
    this.islandsDimMaterial = new THREE.MeshBasicMaterial({
      color: ISLANDS_DIM_COLOR,
      transparent: true,
      opacity: ISLANDS_DIM_OPACITY,
      depthWrite: false,
    });
    this.islandsHighlightMaterial = new THREE.MeshBasicMaterial({
      color: ISLANDS_HIGHLIGHT_COLOR,
    });
  }

  /** 当前渲染模式（shaded 缺省） */
  get current(): ViewportRenderMode {
    return this.mode;
  }

  /** 切换目标模式（只写状态 + 供给 override；连续渲染下一帧生效，材质身份恒稳定） */
  setMode(mode: ViewportRenderMode): void {
    this.mode = mode;
  }

  /**
   * 当前模式的主 override 材质（shaded / islands → null——islands 无单一 primary，
   * dim/highlight 两材质经 resolveOverrideMaterial 令牌解析；normals 为 ShaderMaterial，
   * 故返回类型放宽为 Material）。
   */
  getOverrideMaterial(): THREE.Material | null {
    if (this.disposed) return null;
    switch (this.mode) {
      case 'wireframe':
        return this.wireframeMaterial;
      case 'xray':
        return this.xrayMaterial;
      case 'clay':
        return this.clayMaterial;
      case 'normals':
        return this.normalsMaterial;
      default:
        return null;
    }
  }

  /**
   * 分遍令牌 → 材质（Renderer.renderModePasses 逐遍消费）：
   *  - 'primary'：当前模式主 override（wireframe/xray/clay/normals）；
   *  - 'dim' / 'highlight'：仅 islands 模式供给；
   *  - 'none' / 模式与令牌不匹配：null（该遍不覆盖材质）。
   */
  resolveOverrideMaterial(token: OverrideToken): THREE.Material | null {
    if (this.disposed || token === 'none') return null;
    if (token === 'dim' || token === 'highlight') {
      if (this.mode !== 'islands') return null;
      return token === 'dim' ? this.islandsDimMaterial : this.islandsHighlightMaterial;
    }
    return this.getOverrideMaterial();
  }

  /** 释放全部 override 材质（Renderer.dispose 调用；幂等） */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.wireframeMaterial.dispose();
    this.xrayMaterial.dispose();
    this.clayMaterial.dispose();
    this.normalsMaterial.dispose();
    this.islandsDimMaterial.dispose();
    this.islandsHighlightMaterial.dispose();
  }
}
