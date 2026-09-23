/**
 * runtime/environment/environmentPresets —— 环境预设统一参数面（T018.3 建面 /
 * T018.5 终值定案，单一真相源）。
 *
 * 契约：day/dusk/night/tech 四预设的**全部**环境参数集中本表——Sky 四大气参数 + 内建云
 * 四参数 + 太阳（角/强度/色）+ IBL 强度 + 地面/网格配色；018.1 的 provisional 大气表
 * （skyCore.SKY_PRESET_ATMOSPHERE）已收口至此删除（不留两份真相）。消费方：
 *  - 正常路径：environmentSetup 事务构建（SkyCore 构造入参 + DirectionalLight + IBL）；
 *  - legacy fallback：skyTop/skyBottom（渐变背景）+ ambient*（Hemi）——**正常路径零读取**，
 *    仅 D29.5 事务式降级路径消费（键保留是 fallback 素材语义，非双真相）。
 * 边界：`SceneEnvironment.preset: string` 只存 id（持久化零改动）；UI 的 id/label 表在
 * app/bootstrap（不入本面）；cloudSpeed 恒 0 **不进预设**（D29.11 静态云——结构上无该键，
 * skyCore 构造期一次写 0，此后无写入路径）。数值口径（T018.5 终调定案）：day 太阳角/
 * 大气/云仍零漂移锚逐位锁定；day iblIntensity 1.0→0.15 与 displayIntensity 0.22 为
 * 018.5 终调**重锚**——重锚依据 = day/tech 过曝走显示域压缩处置（D29.13 机制，不走
 * tone mapping）+ Chrome 153 CDP 视口分带实测与 018.0 legacy 基线对齐（day 天空带
 * luma/rB 与 legacy day 渐变逐位对齐零通道裁剪、地面带通道饱和占比归零脱离 Preetham
 * HDR × NoToneMapping clamp 饱和平台）；dusk/night/tech displayIntensity 1、ibl 维持
 * 018.3 差异化表值（018.3 时代「tech 也过曝」判断被预设差异化终值 elevation 60°/ibl
 * 0.7 消解）。测试锁 day 锚（含重锚值）+ 结构 + 三预设终值绝对锚。
 */
import type { SkyAtmosphereParams } from './skyCore';
import { DAY_SUN_AZIMUTH_DEG, DAY_SUN_ELEVATION_DEG } from './sunDirection';

/**
 * 大气四参数（Preetham）子面：类型与数值语义归 skyCore 的 SkyAtmosphereParams
 * （Pick 保证键名单一真相），预设数值归本表。
 */
export type PresetAtmosphere = Pick<
  SkyAtmosphereParams,
  'turbidity' | 'rayleigh' | 'mieCoefficient' | 'mieDirectionalG'
>;

/**
 * 内建云四参数子面（D29.11）：**cloudSpeed 不在其中**——静态云语义下该 uniform 恒 0
 * 且无任何写入路径，进预设面即打开动态云入口（非目标 D29.10）。
 */
export type PresetCloud = Pick<SkyAtmosphereParams, 'cloudCoverage' | 'cloudDensity' | 'cloudElevation' | 'cloudScale'>;

/** 太阳参数：角（度，sunDirectionOf 入参口径）+ 直射光强度/色（DirectionalLight 直配） */
export interface PresetSun {
  elevationDeg: number;
  azimuthDeg: number;
  intensity: number;
  color: number;
}

/**
 * 统一预设参数面。ground/grid 配色沿用一期值（预设视觉差异主载体 = 天空/太阳/IBL，
 * 任务书裁定）；skyTop/skyBottom/ambient* 五键为 legacy fallback 专用素材。
 */
export interface EnvironmentPreset {
  atmosphere: PresetAtmosphere;
  cloud: PresetCloud;
  sun: PresetSun;
  /** IBL 强度（scene.environmentIntensity，r163+ 内建旋钮；D29.13 预设差异化） */
  iblIntensity: number;
  /**
   * displaySky 单侧显示强度（D29.13 显示域压缩，T018.5 终调入表）：仅 sky 正常路径
   * 消费（setupSkyEnvironment 构建期一次写入）；legacy fallback 分支零消费（渐变背景
   * 无此语义）；不进 PMREM 烘焙（bakeSky 无此键）。
   */
  displayIntensity: number;
  groundColor: string;
  gridMajor: number;
  gridMinor: number;
  /** —— 以下仅 legacy fallback 路径消费（正常路径零读取）—— */
  /** 渐变天空顶部/底部色（createSkyTexture 素材） */
  skyTop: string;
  skyBottom: string;
  /** HemisphereLight 天空色/地面色/强度 */
  ambientSky: number;
  ambientGround: number;
  ambientIntensity: number;
}

/**
 * 四预设统一参数表（T018.5 终值定案）：
 *  - day：太阳角/大气/云 = **零漂移锚**逐位不动（50.2°/53.1° 现行 (80,120,60) 派生
 *    圆整，sunDirection 常量逐位引用 + 018.1 day 大气/云值）；ibl 1.0→0.15 与
 *    displayIntensity 0.22 为 018.5 终调**重锚**（依据见模块头注：显示域压缩处置 +
 *    legacy 对齐实测——地面通道饱和占比归零、天空带与 legacy day 渐变逐位对齐）；
 *  - dusk：低角（~5°）暖浊大气（高 turbidity 长 Mie 瓣）+ 西沉方位 + ibl 0.85——低角
 *    长影方向差异化首次生效（此前四预设同用 day 角）；
 *  - night：低角低强度冷色太阳（月光语义）+ 低 rayleigh 压暗 + ibl 0.35（Preetham
 *    无夜晚语义为已知近似 D29.6——参数只给方向正确初值）；
 *  - tech：冷色深蓝（偏高 rayleigh）低云量 + ibl 0.7（elevation 60°/ibl 0.7 的差异化
 *    终值消解了 018.3 时代的过曝判断）。
 * dusk/night/tech displayIntensity 恒 1（018.5 实测无过曝，day 独走显示域压缩）。
 */
export const ENVIRONMENT_PRESET_TABLE: Readonly<Record<string, EnvironmentPreset>> = {
  day: {
    atmosphere: { turbidity: 3, rayleigh: 1.2, mieCoefficient: 0.005, mieDirectionalG: 0.8 },
    cloud: { cloudCoverage: 0.35, cloudDensity: 0.4, cloudElevation: 0.5, cloudScale: 0.0002 },
    sun: {
      elevationDeg: DAY_SUN_ELEVATION_DEG,
      azimuthDeg: DAY_SUN_AZIMUTH_DEG,
      intensity: 2.4,
      color: 0xffffff,
    },
    iblIntensity: 0.15,
    displayIntensity: 0.22,
    groundColor: '#e6e4de',
    gridMajor: 0x9aa4ae,
    gridMinor: 0xc9cfd6,
    skyTop: '#6ba3e0',
    skyBottom: '#d8e8f4',
    ambientSky: 0xbfd6ea,
    ambientGround: 0x8a8f96,
    ambientIntensity: 0.9,
  },
  dusk: {
    atmosphere: { turbidity: 8, rayleigh: 2.2, mieCoefficient: 0.008, mieDirectionalG: 0.85 },
    cloud: { cloudCoverage: 0.5, cloudDensity: 0.5, cloudElevation: 0.4, cloudScale: 0.0002 },
    sun: { elevationDeg: 5, azimuthDeg: 240, intensity: 1.6, color: 0xffb27a },
    iblIntensity: 0.85,
    displayIntensity: 1,
    groundColor: '#7a746e',
    gridMajor: 0x5a5668,
    gridMinor: 0x847c7a,
    skyTop: '#2e3a5c',
    skyBottom: '#e8927c',
    ambientSky: 0x6a6f96,
    ambientGround: 0x4a4442,
    ambientIntensity: 0.6,
  },
  night: {
    atmosphere: { turbidity: 2, rayleigh: 0.2, mieCoefficient: 0.003, mieDirectionalG: 0.8 },
    cloud: { cloudCoverage: 0.25, cloudDensity: 0.3, cloudElevation: 0.5, cloudScale: 0.0002 },
    sun: { elevationDeg: 15, azimuthDeg: 315, intensity: 0.5, color: 0x8a9cff },
    iblIntensity: 0.35,
    displayIntensity: 1,
    groundColor: '#2c3242',
    gridMajor: 0x3a4560,
    gridMinor: 0x272f42,
    skyTop: '#0a0f1e',
    skyBottom: '#1a2338',
    ambientSky: 0x2a3350,
    ambientGround: 0x1a1e2c,
    ambientIntensity: 0.35,
  },
  tech: {
    atmosphere: { turbidity: 2.5, rayleigh: 1.6, mieCoefficient: 0.004, mieDirectionalG: 0.8 },
    cloud: { cloudCoverage: 0.2, cloudDensity: 0.35, cloudElevation: 0.6, cloudScale: 0.0002 },
    sun: { elevationDeg: 60, azimuthDeg: 70, intensity: 1.2, color: 0x9fd8ff },
    iblIntensity: 0.7,
    displayIntensity: 1,
    groundColor: '#0b1c2a',
    gridMajor: 0x1e5f74,
    gridMinor: 0x123244,
    skyTop: '#04121f',
    skyBottom: '#0a2a3f',
    ambientSky: 0x14364a,
    ambientGround: 0x0a1a26,
    ambientIntensity: 0.55,
  },
};

/**
 * 预设查表（未知预设回退 day——与持久化 `preset: string` 开放键容错口径一致；
 * 返回表内对象引用，消费方不得改写）。
 */
export function environmentPresetOf(preset: string): EnvironmentPreset {
  return ENVIRONMENT_PRESET_TABLE[preset] ?? ENVIRONMENT_PRESET_TABLE.day;
}

/**
 * 预设 → SkyCore 构造入参（atmosphere + cloud 两子面合回八参数共享状态形态；
 * cloudSpeed 不在其中——skyCore 构造期一次写 0）。
 */
export function skyAtmosphereOfPreset(preset: EnvironmentPreset): SkyAtmosphereParams {
  return { ...preset.atmosphere, ...preset.cloud };
}
