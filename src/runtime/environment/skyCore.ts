/**
 * runtime/environment/skyCore —— Sky 双实例核心（T018.1，D29.11/12）。
 *
 * 契约：displaySky + bakeSky 两实例由**同一份参数状态**（SkyParamsState）驱动，任一
 * 参数变更同步写双实例 uniforms（Object3D 单父节点，一实例不能同时挂两 Scene——
 * 双实例而非单实例换挂的根本原因）：
 *  - displaySky：主场景显示侧——由 Renderer 挂 envGroup / ENV_LAYER（受 Environment
 *    Layer / RenderMode 分遍管理，接替 scene.background 语义）、渲染循环每帧
 *    followCamera 相机中心跟随（轻量 Runtime 维护，非 Scene 数据）；showSunDisc 常开；
 *  - bakeSky：仅存于 bakeScene（PMREM 烘焙专用场景，018.2 消费——fromScene(bakeScene)，
 *    禁止 fromScene(主 Scene)）；虚拟相机烘焙无需跟随；showSunDisc 常闭（太阳盘烘焙
 *    保护，官方文档口径）。
 * 内建 Cloud 消费（D29.11）：cloudCoverage/cloudDensity/cloudElevation/cloudScale 四参
 * 数进共享状态；**cloudSpeed 恒 0 且不接 time 驱动**（第一阶段静态云语义锁定）——
 * 构造时一次写入 0，此后无任何写入路径；time uniform 永不触碰（Sky 缺省 0，全局
 * uTime 时钟只认 uniforms.uTime，天然不驱动 Sky 的 time）。动态云/云影/Weather 均为
 * 非目标（D29.10）。
 *
 * 显示侧强度（D29.13，T018.2）：正式路径禁用 scene.backgroundIntensity（Sky 是
 * ENV_LAYER 网格非 scene.background），显示亮度经 Sky 材质自身实现——**仅 displaySky
 * 实例**构造期注入 uDisplayIntensity（默认 1.0 观感零变化；片元辐出乘子，注入点在
 * tonemapping/colorspace 片元块之前——辐射域调强度）；bakeSky 零注入（显示调暗不得
 * 连带 PMREM 烘焙结果变暗——烘焙强度独立是设计要求）。写入口 setDisplayIntensity 是
 * display-only 单侧参数，不进共享状态 SkyParamsState（语义同 showSunDisc 按侧固定）。
 *
 * 边界：本模块不含 PMREM / scene.environment（018.2 在 environment/pmremEnvironment，
 * 经构造注入的 onParamsChanged 回调挂接）；不进 Scene 持久化；预设数值面归
 * environment/environmentPresets（T018.3 统一预设面收口——本模块只持有 SkyAtmosphereParams
 * 类型与双实例驱动，**零预设数值**，避免两份真相）；SkyMesh.js 为 WebGPU/TSL 变体非本
 * 路径（勿混用，D29.14）；相机构造与 far 适配见 SKY_BOX_SCALE 注。写入口
 * applyAtmosphere / patchAtmosphere / setSunDirection 即 018.4 DEV 面与 018.5 终调的
 * 可编程入口（模块导出，非 window UI）。
 */
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { DAY_SUN_AZIMUTH_DEG, DAY_SUN_ELEVATION_DEG, sunDirectionOf } from './sunDirection';
import type { SunDirection } from './sunDirection';

/**
 * Sky 材质 uniforms 的类型化视图（D29.14 类型滞后收口）：@types/three 0.185.4 的
 * Sky.d.ts 未声明 cloud* / showSunDisc / time（运行时 three 0.186.0 已有——uniform
 * 表事实锚点 node_modules/three/examples/jsm/objects/Sky.js:79-91）。自维护接口而非
 * declaration merge（@types 的 `material: ShaderMaterial` 属性声明会与合并接口冲突）；
 * **禁 any 扩散**——唯一受控断言点在 skyUniformsOf 一处，类型面到此为止。
 */
export interface SkyUniforms {
  turbidity: { value: number };
  rayleigh: { value: number };
  mieCoefficient: { value: number };
  mieDirectionalG: { value: number };
  sunPosition: { value: THREE.Vector3 };
  cloudScale: { value: number };
  cloudSpeed: { value: number };
  cloudCoverage: { value: number };
  cloudDensity: { value: number };
  cloudElevation: { value: number };
  showSunDisc: { value: number };
  time: { value: number };
}

/** Sky 材质（ShaderMaterial + 上述 uniforms 视图） */
export type SkyMaterial = THREE.ShaderMaterial & { uniforms: SkyUniforms };

/**
 * Sky 实例 → 类型化 uniforms（唯一受控断言点，见 SkyUniforms 注；只读只写声明过的键，
 * 不经 any 中转）。
 */
export function skyUniformsOf(sky: Sky): SkyUniforms {
  return (sky.material as SkyMaterial).uniforms;
}

/**
 * 显示强度自注入 uniform（D29.13，T018.2）：**自注入键非 Sky 内建**（r186 uniform 表
 * 无此项，skyCore 构造期写入）——独立小接口而非并入 SkyUniforms，**bakeSky 的
 * uniforms 类型不得虚标持有此键**（bakeSky 实例与类型双零注入；禁 any，D29.14）。
 */
export interface SkyDisplayIntensityUniform {
  /** 显示强度乘子（默认 1.0；作用于 texColor——辐射域，tonemapping/colorspace 之前） */
  uDisplayIntensity: { value: number };
}

/** displaySky 材质 uniforms 视图：Sky 内建键 + 显示强度自注入键（只适用于 displaySky） */
export type DisplaySkyUniforms = SkyUniforms & SkyDisplayIntensityUniform;

/** displaySky 材质（ShaderMaterial + 扩展 uniforms 视图） */
export type DisplaySkyMaterial = THREE.ShaderMaterial & { uniforms: DisplaySkyUniforms };

/**
 * displaySky 实例 → 含显示强度键的 uniforms 视图（与 skyUniformsOf 同款受控断言点；
 * 仅对 displaySky 调用——bakeSky 无此键，运行时由测试逐键对照锁定）。
 */
export function displaySkyUniformsOf(sky: Sky): DisplaySkyUniforms {
  return (sky.material as DisplaySkyMaterial).uniforms;
}

/**
 * 单点锚替换（显示强度注入用）：锚点必须**恰好出现一次**——three 升级导致 Sky.js
 * 片元结构漂移时显式抛错，而非静默丢注入（显示亮度旋钮无声失效比构造期失败更难排查）。
 */
function replaceAnchorOnce(source: string, anchor: string, replacement: string, label: string): string {
  const count = source.split(anchor).length - 1;
  if (count !== 1) {
    throw new Error(
      `skyCore 显示强度注入失败：片元锚点「${label}」出现 ${count} 次（预期 1）——` +
        `three Sky.js 片元结构已漂移，需复核 T018.2（D29.13）注入点`,
    );
  }
  return source.replace(anchor, replacement);
}

/**
 * displaySky 显示强度注入（构造期一次，D29.13）：uniforms 挂 uDisplayIntensity
 * （默认 1.0）+ 片元源码两处单点替换：
 *  1. uniform 声明——挂内建 uniform 块尾（`uniform float time;` 唯一出现）；
 *  2. 辐出乘法——Sky.js r186 片元**单一汇合点** `gl_FragColor = vec4( texColor, 1.0 );`
 *     （晴空与云复合分支均汇入 texColor 后一次输出），替换为 texColor 乘强度；该点
 *     位于 `#include <tonemapping_fragment>` / `#include <colorspace_fragment>` 之前
 *     ——辐射域调强度、颜色空间转换前（NoToneMapping 下 tonemapping 空操作是既有
 *     事实，无需处理）。单汇合点 ⇒ 一处注入，无多分支重复。
 * 采用实例 fragmentShader 字符串替换而非 onBeforeCompile：材质构造后尚未编译，
 * 字符串态即最终源（含未解析的 include，编译期由 WebGLProgram 统一展开）——
 * node 无 WebGL 可测、注入结果确定性可断言。
 */
function injectDisplayIntensity(sky: Sky): void {
  const material = sky.material as DisplaySkyMaterial;
  material.uniforms.uDisplayIntensity = { value: 1 };
  material.fragmentShader = replaceAnchorOnce(
    material.fragmentShader,
    'uniform float time;',
    'uniform float time;\nuniform float uDisplayIntensity;',
    'uniform 声明锚',
  );
  material.fragmentShader = replaceAnchorOnce(
    material.fragmentShader,
    'gl_FragColor = vec4( texColor, 1.0 );',
    'gl_FragColor = vec4( texColor * uDisplayIntensity, 1.0 );',
    '辐出汇合点锚',
  );
}

/** 大气 + 内建云共享参数（sunPosition 派生不在其内——见 SkyParamsState） */
export interface SkyAtmosphereParams {
  /** 大气浑浊度（Preetham T：高值暖浊，黄昏/雾霾方向） */
  turbidity: number;
  /** 瑞利散射系数（高值天更蓝更深；低值压暗——night 方向） */
  rayleigh: number;
  /** Mie 散射系数（太阳周边光晕强度） */
  mieCoefficient: number;
  /** Mie 方向性 g（前向散射瓣，0.8 官方默认） */
  mieDirectionalG: number;
  /** 云覆盖（0 无云 1 满覆盖；官方默认 0.4） */
  cloudCoverage: number;
  /** 云密度（Beer 定律不透明度斜率；官方默认 0.4） */
  cloudDensity: number;
  /** 云层高度感（高值云更低更近；官方默认 0.5） */
  cloudElevation: number;
  /** 云噪声尺度（官方默认 0.0002） */
  cloudScale: number;
}

/**
 * 天空盒缩放：Sky 顶点着色器把深度钉在 z=w（远平面）且材质 depthWrite=false——天空
 * 恒为背景、不参与遮挡关系，scale 只需满足「立方体整体留在远裁剪面量级内」的稳健性
 * 约束：对角半径 √3/2 × 9000 ≈ 7794 < camera.far 10000（Renderer 相机 near/far =
 * 1/10000，Renderer.ts:400）；相机中心跟随（followCamera）保证相机恒在盒心（BackSide
 * 内壁全向覆盖，与相机离原点距离无关）。官方示例配比 450000/far 2000000 同量级缩小。
 */
export const SKY_BOX_SCALE = 9000;

/** 共享参数状态（双实例同驱的唯一真相源；sunDirection 派生自 sunDirectionOf） */
export interface SkyParamsState extends SkyAtmosphereParams {
  /** 太阳方向（单位向量）：sunPosition uniforms 与 DirectionalLight.position 双消费同源 */
  sunDirection: SunDirection;
}

/** 太阳角入参（度；构造与 setSunDirection 同口径） */
export interface SunAngles {
  elevationDeg: number;
  azimuthDeg: number;
}

/** Sky 双实例核心（displaySky 主显 / bakeSky 供 018.2 PMREM；契约见模块头注） */
export class SkyCore {
  readonly displaySky: Sky;
  readonly bakeSky: Sky;
  /** PMREM 烘焙专用场景（018.2 消费）：只含 bakeSky，showSunDisc 常闭 */
  readonly bakeScene: THREE.Scene;

  private readonly state: SkyParamsState;
  /**
   * 参数变更回调（T018.2 PMREM 重烘挂点，Renderer 注入）：三写入口
   * （applyAtmosphere/patchAtmosphere/setSunDirection）同步完成后各恰触发一次；
   * 构造期初始同步**不触发**（初烘由 Renderer.applyEnvironment 显式驱动——避免
   * 双烘）；setDisplayIntensity / followCamera 不触发（display-only 单侧参数 /
   * 帧路径——PMREM 严禁进每帧路径，触发清单见 T018.2）；dispose 后写入口短路
   * 先于回调。018.4 DEV 面 debounce 在回调上游包一层，本层不感知。
   */
  private readonly onParamsChanged: (() => void) | null;
  private disposed = false;

  constructor(
    atmosphere: SkyAtmosphereParams,
    sun: SunAngles = { elevationDeg: DAY_SUN_ELEVATION_DEG, azimuthDeg: DAY_SUN_AZIMUTH_DEG },
    /** 参数变更回调（可选；PMREM 重烘接线见上注——不影响既有两参构造） */
    onParamsChanged?: () => void,
  ) {
    this.onParamsChanged = onParamsChanged ?? null;
    this.displaySky = new Sky();
    this.bakeSky = new Sky();
    this.displaySky.scale.setScalar(SKY_BOX_SCALE);
    this.bakeSky.scale.setScalar(SKY_BOX_SCALE);

    // 静态语义锁定（D29.11）：cloudSpeed 构造时一次写 0、此后无写入路径；time 永不
    // 触碰（缺省 0）；showSunDisc 按侧固定（display 常开 / bake 常闭——烘焙太阳盘保护）
    const displayUniforms = skyUniformsOf(this.displaySky);
    displayUniforms.cloudSpeed.value = 0;
    displayUniforms.showSunDisc.value = 1;
    const bakeUniforms = skyUniformsOf(this.bakeSky);
    bakeUniforms.cloudSpeed.value = 0;
    bakeUniforms.showSunDisc.value = 0;

    // 显示强度仅 displaySky 注入（D29.13）——bakeSky 官方源码/uniform 零改动
    injectDisplayIntensity(this.displaySky);

    this.bakeScene = new THREE.Scene();
    this.bakeScene.add(this.bakeSky);

    this.state = {
      ...atmosphere,
      sunDirection: sunDirectionOf(sun.elevationDeg, sun.azimuthDeg),
    };
    this.syncAtmosphere();
    this.syncSunPosition();
  }

  /** 当前共享参数状态（只读快照——DEV 面 / 取证探针读取；修改经写入口） */
  get params(): Readonly<SkyParamsState> {
    return this.state;
  }

  /** 太阳方向（单位向量；DirectionalLight.position 同源读取 × LEGACY_SUN_DISTANCE） */
  get sunDirection(): Readonly<SunDirection> {
    return this.state.sunDirection;
  }

  /** 大气/云参数整体写入（双实例同步；构造后唯一全量写入口）→ 通知 PMREM 重烘 */
  applyAtmosphere(atmosphere: SkyAtmosphereParams): void {
    if (this.disposed) return;
    Object.assign(this.state, atmosphere);
    this.syncAtmosphere();
    this.onParamsChanged?.();
  }

  /**
   * 大气/云参数分量写入（双实例同步；018.4 __sky DEV 面 / 018.5 终调的逐参入口）
   * → 通知 PMREM 重烘（云参数变化即烘焙触发源——阴天 env 反射含云，D29.11/12）。
   */
  patchAtmosphere(patch: Partial<SkyAtmosphereParams>): void {
    if (this.disposed) return;
    Object.assign(this.state, patch);
    this.syncAtmosphere();
    this.onParamsChanged?.();
  }

  /** 太阳角写入（sunDirectionOf → 双实例 sunPosition uniforms + 状态同步）→ 通知 PMREM 重烘 */
  setSunDirection(elevationDeg: number, azimuthDeg: number): void {
    if (this.disposed) return;
    this.state.sunDirection = sunDirectionOf(elevationDeg, azimuthDeg);
    this.syncSunPosition();
    this.onParamsChanged?.();
  }

  /**
   * 相机中心跟随（Renderer.renderFrame 每帧调用；一次 position 拷贝级轻量维护，
   * 非 Scene 数据）。bakeSky 不跟随（PMREM 用虚拟相机，D29.12）。
   */
  followCamera(camera: THREE.Camera): void {
    if (this.disposed) return;
    this.displaySky.position.copy(camera.position);
  }

  /**
   * 显示强度写入（D29.13，T018.2）：**只写 displaySky** 的自注入 uniform——bakeSky
   * 无此键，显示调暗不连带 PMREM 烘焙结果变暗。display-only 单侧参数，不进共享状态
   * SkyParamsState（语义同 showSunDisc；018.4 __sky DEV 面 / 018.5 终调消费）。
   * 非法值（非有限/负数）显式抛错：静默吞错会让调参面拿到「看似生效实则未写」的旋钮。
   */
  setDisplayIntensity(value: number): void {
    if (this.disposed) return;
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(
        `SkyCore.setDisplayIntensity: 非法值 ${value}（须为非负有限数——T018.2 D29.13）`,
      );
    }
    displaySkyUniformsOf(this.displaySky).uDisplayIntensity.value = value;
  }

  /**
   * 全量释放（Renderer.clearEnvironment 调用；幂等）：displaySky 摘离父节点 +
   * 双实例 geometry/material + bakeScene 清空（Scene 本身无自有 GPU 资源）。
   */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.displaySky.removeFromParent();
    this.displaySky.geometry.dispose();
    this.displaySky.material.dispose();
    this.bakeScene.remove(this.bakeSky);
    this.bakeSky.geometry.dispose();
    this.bakeSky.material.dispose();
  }

  /** 大气/云八参数 → 双实例 uniforms（只写这八项 + 构造期的固定项——cloudSpeed/time 永不进本路径） */
  private syncAtmosphere(): void {
    for (const sky of [this.displaySky, this.bakeSky]) {
      const u = skyUniformsOf(sky);
      u.turbidity.value = this.state.turbidity;
      u.rayleigh.value = this.state.rayleigh;
      u.mieCoefficient.value = this.state.mieCoefficient;
      u.mieDirectionalG.value = this.state.mieDirectionalG;
      u.cloudCoverage.value = this.state.cloudCoverage;
      u.cloudDensity.value = this.state.cloudDensity;
      u.cloudElevation.value = this.state.cloudElevation;
      u.cloudScale.value = this.state.cloudScale;
    }
  }

  /** 太阳方向 → 双实例 sunPosition uniforms（各实例自有 Vector3，set 写值不换引用） */
  private syncSunPosition(): void {
    const d = this.state.sunDirection;
    for (const sky of [this.displaySky, this.bakeSky]) {
      skyUniformsOf(sky).sunPosition.value.set(d.x, d.y, d.z);
    }
  }
}
