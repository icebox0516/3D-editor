/**
 * runtime/environment/skyTuning —— Renderer 环境调参端口（T018.4，__sky DEV 面 /
 * 018.5 终调工作台）。
 *
 * 契约：sky 模式环境的最小调参访问面，由 Renderer.applyEnvironment 装配（legacy/
 * fallback 模式恒 null——单一开关不变式 D29.5，fallback 态无 DEV 调参）：
 *  - patchAtmosphere：SkyCore 写入口代理（八键白名单转发，见 ATMOSPHERE_KEYS 注）；
 *  - setSunAngles：**三一致封装**（D29.1「天空太阳位 = 光向 = 影向」）——SkyCore
 *    .setSunDirection（双实例 sunPosition uniforms + debounced 重烘）+ sunLight
 *    .position = sunDirection × LEGACY_SUN_DISTANCE（灯位侧内聚在 Renderer 侧本端口，
 *    不散到 DEV 守卫）；shadow camera 参数零触碰（D29.1 冻结——只动灯位向量）；
 *  - setIblIntensity：直写 scene.environmentIntensity + **借道 debounced 重烘**
 *    （three 0.186 已知限制：environmentIntensity 直写不触发材质 uniform 重传，
 *    WebGLRenderer.js:2738 该赋值在 refreshMaterial 路径内；environment 纹理引用
 *    变化触发 setProgram refreshMaterial 顺带重传 intensity——烘焙内容不变，重烘
 *    纯为刷新，单次 ~30ms DEV 可接受）；
 *  - setDisplayIntensity：display-only 单侧（displaySky 即时生效零重烘，D29.13），
 *    SkyCore 既有 RangeError 语义透传；
 *  - rebake：强制立即重烘（flush 语义——018.5 终调工具）；
 *  - params / pmremStats：只读快照（DEV 面读口径；数值真相源 = SkyCore 状态 /
 *    scene.environmentIntensity / PmremEnvironment counter）。
 *
 * 边界：本端口是**会话态** DEV 工具面——不触碰 SceneData / undo-redo / 预设表
 * （environmentPresets provisional 值归 018.5），调参结果随预设切换整组重建即重置
 * （预期语义）；PMREM 触发清单不新增（写入口 debounced 重烘 + setIblIntensity 借道
 * + rebake() 强制均已在 T018.4 触发清单内，见 skyRebake 模块头注）；cloudSpeed 恒
 * 无写路径（D29.11——白名单结构性排除）。
 */
import * as THREE from 'three';
import { displaySkyUniformsOf } from './skyCore';
import type { SkyAtmosphereParams, SkyCore } from './skyCore';
import type { PmremEnvironment, PmremStats } from './pmremEnvironment';
import type { SkyRebakePort } from './skyRebake';
import { LEGACY_SUN_DISTANCE } from './sunDirection';
import type { SunDirection } from './sunDirection';

/**
 * 大气/云八参数键白名单（cloudSpeed 恒不在——D29.11 静态云锁定）：patchAtmosphere
 * 经白名单过滤后才转发 SkyCore——**结构性**杜绝 cloudSpeed / 未知键经 DEV 面（含绕过
 * 类型面的控制台调用）进入共享状态；`satisfies` 保证白名单无错键/外键（cloudSpeed
 * 即在此被排除），完整性（八键齐备）由显式 params() 构造与单测锁定的双保险覆盖。
 */
export const ATMOSPHERE_KEYS = [
  'turbidity',
  'rayleigh',
  'mieCoefficient',
  'mieDirectionalG',
  'cloudCoverage',
  'cloudDensity',
  'cloudElevation',
  'cloudScale',
] as const satisfies readonly (keyof SkyAtmosphereParams)[];

/** params() 读回形态（__sky 守卫的读口径；全部纯数据，零 THREE 表面） */
export interface SkyTuningParams {
  /** 大气 + 内建云八参数当前值（SkyCore 共享状态快照；cloudSpeed 不在其中） */
  atmosphere: SkyAtmosphereParams;
  /** 太阳角（度；由 sunDirection 状态反解——azimuth 归一 [0,360)） */
  sun: { elevationDeg: number; azimuthDeg: number };
  /** displaySky 显示强度（uDisplayIntensity 当前值；display-only 单侧，D29.13） */
  displayIntensity: number;
  /** IBL 强度（scene.environmentIntensity 当前值） */
  iblIntensity: number;
  /** 构建本环境的预设名（applyEnvironment 入参原值；查表回退口径见 environmentPresetOf） */
  preset: string;
}

/**
 * Renderer 调参端口消费面（bootstrap __sky 守卫结构代理此接口——组合根零 THREE 依赖；
 * legacy/fallback 模式 Renderer 返回 null）。018.5 终调消费口径：DEV 面实时调参 +
 * rebake() 强制重烘 + pmremStats() 只读账目。
 */
export interface SkyTuningPort {
  /** 大气/云参数分量写入（八键白名单内；双实例即时同步 + debounced 重烘） */
  patchAtmosphere(patch: Partial<SkyAtmosphereParams>): void;
  /** 太阳角写入（三一致：SkyCore 双实例 sunPosition + sunLight 灯位 + debounced 重烘） */
  setSunAngles(elevationDeg: number, azimuthDeg: number): void;
  /** IBL 强度写入（直写 + 借道 debounced 重烘刷新材质 uniform——见模块头注） */
  setIblIntensity(value: number): void;
  /** 显示强度写入（display-only 单侧即时生效零重烘；非法值 RangeError 透传） */
  setDisplayIntensity(value: number): void;
  /** 强制立即重烘（flush 语义） */
  rebake(): void;
  /** 当前参数只读快照 */
  params(): SkyTuningParams;
  /** PMREM counter 只读快照（owned/live/baked/retired——epic 验收第 4 条口径） */
  pmremStats(): PmremStats;
}

/** 调参端口装配依赖（Renderer.applyEnvironment sky 分支逐项供给；全部为环境期句柄） */
export interface SkyTuningDeps {
  /** 主场景（scene.environmentIntensity 直写目标） */
  scene: THREE.Scene;
  sky: SkyCore;
  pmrem: PmremEnvironment;
  /** 太阳直射灯（Renderer 字段提升产物——setSunAngles 灯位侧） */
  sunLight: THREE.DirectionalLight;
  /** 重烘 debounce 句柄（environmentSetup sky 模式结果带出） */
  rebake: SkyRebakePort;
  /** 构建本环境的预设名（applyEnvironment 入参原值） */
  preset: string;
}

/** 角度制换算（sunDirection 反解本地用；与 sunDirection.ts 的 DEG2RAD 同一约定） */
const RAD2DEG = 180 / Math.PI;

/**
 * 太阳方向 → 角度读回（sunDirectionOf 的反解；DEV 读口径，非新真相源）：
 * elevation = atan2(y, 水平半径)（[-90,90]）；azimuth = atan2(x,z) 归一 [0,360)——
 * 与 sunDirectionOf 周期折叠语义互逆（任意写入角读回同方向，方位角 240° 读回 240°
 * 而非 -120°）。
 */
function sunAnglesReadback(d: Readonly<SunDirection>): { elevationDeg: number; azimuthDeg: number } {
  return {
    elevationDeg: Math.atan2(d.y, Math.hypot(d.x, d.z)) * RAD2DEG,
    azimuthDeg: (Math.atan2(d.x, d.z) * RAD2DEG + 360) % 360,
  };
}

/**
 * 环境调参端口实现（契约见模块头注）。实例随环境整组创建/丢弃（Renderer.applyEnvironment
 * 装配 / clearEnvironment 置空）——端口持有的全部句柄同属一份环境，预设切换后旧端口
 * 不可再达（Renderer 字段已换新）。
 */
export class SkyTuning implements SkyTuningPort {
  constructor(private readonly deps: SkyTuningDeps) {}

  patchAtmosphere(patch: Partial<SkyAtmosphereParams>): void {
    // 八键白名单过滤（D29.11）：结构性杜绝 cloudSpeed / 未知键进入 SkyCore 共享状态
    //（防绕过类型面的控制台调用污染 state——syncAtmosphere 只写八键，uniform 侧另有防线）
    const filtered: Partial<SkyAtmosphereParams> = {};
    for (const key of ATMOSPHERE_KEYS) {
      const value = patch[key];
      if (value !== undefined) filtered[key] = value;
    }
    this.deps.sky.patchAtmosphere(filtered); // → 双实例即时同步 + debounced 重烘
  }

  setSunAngles(elevationDeg: number, azimuthDeg: number): void {
    this.deps.sky.setSunDirection(elevationDeg, azimuthDeg); // 双实例 sunPosition + debounced 重烘
    // 灯位侧（三一致的第三消费）：同状态源 × legacy 模长——Renderer.applyEnvironment
    // 太阳段同款算式；shadow camera 冻结不动（D29.1——DirectionalLight 目标恒原点，
    // position 决定光向/影向）
    const d = this.deps.sky.sunDirection;
    this.deps.sunLight.position.set(
      d.x * LEGACY_SUN_DISTANCE,
      d.y * LEGACY_SUN_DISTANCE,
      d.z * LEGACY_SUN_DISTANCE,
    );
  }

  setIblIntensity(value: number): void {
    // 非法值显式抛错（与 setDisplayIntensity 同口径——静默吞错会让调参面拿到
    // 「看似生效实则未写」的旋钮）
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(
        `SkyTuning.setIblIntensity: 非法值 ${value}（须为非负有限数——T018.4 D29.13）`,
      );
    }
    this.deps.scene.environmentIntensity = value; // 直写（读口径可见）
    this.deps.rebake.trigger(); // 借道重烘：刷新材质 uniform（three 0.186 限制，见模块头注）
  }

  setDisplayIntensity(value: number): void {
    this.deps.sky.setDisplayIntensity(value); // display-only 单侧零重烘（D29.13）；RangeError 透传
  }

  rebake(): void {
    this.deps.rebake.flush(); // 强制立即（flush：取消 pending 后执行一次）
  }

  params(): SkyTuningParams {
    const state = this.deps.sky.params;
    // 显式八键构造（缺键 = 编译错——与 ATMOSPHERE_KEYS 白名单互为完整性双保险）
    const atmosphere: SkyAtmosphereParams = {
      turbidity: state.turbidity,
      rayleigh: state.rayleigh,
      mieCoefficient: state.mieCoefficient,
      mieDirectionalG: state.mieDirectionalG,
      cloudCoverage: state.cloudCoverage,
      cloudDensity: state.cloudDensity,
      cloudElevation: state.cloudElevation,
      cloudScale: state.cloudScale,
    };
    return {
      atmosphere,
      sun: sunAnglesReadback(state.sunDirection),
      displayIntensity: displaySkyUniformsOf(this.deps.sky.displaySky).uDisplayIntensity.value,
      iblIntensity: this.deps.scene.environmentIntensity,
      preset: this.deps.preset,
    };
  }

  pmremStats(): PmremStats {
    return this.deps.pmrem.stats;
  }
}
