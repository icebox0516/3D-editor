/**
 * tests/runtime/environment/environmentPresets.test.ts —— 环境预设统一参数面测试
 * （T018.3，单一真相源收口）。
 *
 * 覆盖：
 * - 结构完整性：四预设全键齐备（atmosphere 4 / cloud 4 / sun 4 / iblIntensity +
 *   displayIntensity + groundColor + gridMajor/gridMinor + fallback 专用 5 键），
 *   各子面键名恰为约定集（不多不少——多键即面漂移）；
 * - cloudSpeed 不进预设面（D29.11 静态云结构锁定：递归键遍历零命中）；
 * - 未知预设回退 day（持久化 preset: string 开放键容错口径；引用相等 = 表对象直配）；
 * - **day 零漂移锚回归锁 + 018.5 终调重锚**：太阳角与 sunDirection 常量逐位一致
 *   （50.2°/53.1°）+ 大气/云与 018.1 day 值逐位一致（硬编码期望——改表须过本测试
 *   即显式重锚）+ ibl 0.15 / displayIntensity 0.22（018.5 显示域压缩终调重锚）+
 *   一期直射光强度/色沿用；
 * - dusk/night/tech 终值绝对锚定（018.5 定案）：day/tech ibl 压缩重排后原「< day」相对
 *   断言失效，改绝对值逐位锁（ibl 0.85 / 0.35 / 0.15 + displayIntensity 1 / 1 / 0.2
 *   ——绝对锚是加严不是放松）+ day/tech 为最低 ibl 压缩对的重排语义 + 四预设太阳仰角
 *   互异；
 * - ground/grid/fallback 键沿用一期值（迁移防丢值——硬编码全预设对照）；
 * - skyAtmosphereOfPreset：两子面合回 SkyCore 八参数入参形态（键集恰 8）。
 */
import { describe, expect, it } from 'vitest';
import {
  ENVIRONMENT_PRESET_TABLE,
  environmentPresetOf,
  skyAtmosphereOfPreset,
} from '../../../src/runtime/environment/environmentPresets';
import {
  DAY_SUN_AZIMUTH_DEG,
  DAY_SUN_ELEVATION_DEG,
} from '../../../src/runtime/environment/sunDirection';

const PRESET_IDS = ['day', 'dusk', 'night', 'tech'] as const;

/** 递归收集对象图全部键名（cloudSpeed 结构断言用） */
function collectKeys(value: unknown, into: Set<string> = new Set()): Set<string> {
  if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      into.add(key);
      collectKeys(child, into);
    }
  }
  return into;
}

describe('环境预设面 · 结构完整性（单一真相源）', () => {
  it('四预设全键齐备：atmosphere 4 / cloud 4 / sun 4 / ibl + display + ground/grid + fallback 专用 5 键', () => {
    for (const id of PRESET_IDS) {
      const preset = ENVIRONMENT_PRESET_TABLE[id];
      expect(preset, `预设 ${id} 存在`).toBeDefined();
      expect(Object.keys(preset).sort()).toEqual(
        [
          'atmosphere',
          'cloud',
          'sun',
          'iblIntensity',
          'displayIntensity',
          'groundColor',
          'gridMajor',
          'gridMinor',
          'skyTop',
          'skyBottom',
          'ambientSky',
          'ambientGround',
          'ambientIntensity',
        ].sort(),
      );
      expect(Object.keys(preset.atmosphere).sort()).toEqual(['mieCoefficient', 'mieDirectionalG', 'rayleigh', 'turbidity']);
      expect(Object.keys(preset.cloud).sort()).toEqual(['cloudCoverage', 'cloudDensity', 'cloudElevation', 'cloudScale']);
      expect(Object.keys(preset.sun).sort()).toEqual(['azimuthDeg', 'color', 'elevationDeg', 'intensity']);
      expect(typeof preset.iblIntensity).toBe('number');
      expect(Number.isFinite(preset.iblIntensity)).toBe(true);
      expect(typeof preset.displayIntensity).toBe('number');
      expect(Number.isFinite(preset.displayIntensity)).toBe(true);
    }
  });

  it('cloudSpeed 不进预设面（D29.11 静态云：结构上无该键，递归键遍历零命中）', () => {
    const keys = collectKeys(ENVIRONMENT_PRESET_TABLE);
    expect(keys.has('cloudSpeed')).toBe(false);
  });

  it('全部数值键为有限数、色值为合法形态（string hex / number）', () => {
    for (const id of PRESET_IDS) {
      const preset = ENVIRONMENT_PRESET_TABLE[id];
      const numbers = [
        preset.iblIntensity,
        preset.displayIntensity,
        preset.gridMajor,
        preset.gridMinor,
        preset.ambientSky,
        preset.ambientGround,
        preset.ambientIntensity,
        preset.sun.elevationDeg,
        preset.sun.azimuthDeg,
        preset.sun.intensity,
        preset.sun.color,
        ...Object.values(preset.atmosphere),
        ...Object.values(preset.cloud),
      ];
      for (const n of numbers) expect(Number.isFinite(n), `${id} 数值键有限`).toBe(true);
      expect(preset.groundColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(preset.skyTop).toMatch(/^#[0-9a-f]{6}$/i);
      expect(preset.skyBottom).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('环境预设面 · 预设查表', () => {
  it('未知预设回退 day（引用相等 = 表内对象直配，无复制路径）', () => {
    expect(environmentPresetOf('day')).toBe(ENVIRONMENT_PRESET_TABLE.day);
    for (const id of PRESET_IDS) expect(environmentPresetOf(id)).toBe(ENVIRONMENT_PRESET_TABLE[id]);
    expect(environmentPresetOf('nonexistent-preset')).toBe(ENVIRONMENT_PRESET_TABLE.day);
    expect(environmentPresetOf('')).toBe(ENVIRONMENT_PRESET_TABLE.day);
  });
});

describe('环境预设面 · day 零漂移锚回归锁（018.1 现值逐位一致 + 018.5 终调重锚）', () => {
  const day = ENVIRONMENT_PRESET_TABLE.day;

  it('太阳角 = sunDirection 常量逐位一致（50.2°/53.1°，(80,120,60) 派生圆整）', () => {
    expect(day.sun.elevationDeg).toBe(DAY_SUN_ELEVATION_DEG);
    expect(day.sun.azimuthDeg).toBe(DAY_SUN_AZIMUTH_DEG);
    expect(day.sun.elevationDeg).toBe(50.2);
    expect(day.sun.azimuthDeg).toBe(53.1);
  });

  it('大气/云 = 018.1 day 值逐位一致（改表须显式重锚本测试）', () => {
    expect(day.atmosphere).toEqual({ turbidity: 3, rayleigh: 1.2, mieCoefficient: 0.005, mieDirectionalG: 0.8 });
    expect(day.cloud).toEqual({ cloudCoverage: 0.35, cloudDensity: 0.4, cloudElevation: 0.5, cloudScale: 0.0002 });
  });

  it('ibl 0.15 + display 0.22（018.5 终调重锚：显示域压缩处置 + legacy 对齐实测）+ 直射光强度/色沿用一期值', () => {
    // 018.5 重锚依据（Chrome 153 CDP 视口分带实测，对照 018.0 legacy 基线）：
    //  - ibl 1.0→0.15：地面带通道饱和占比 0.87→0（脱离 Preetham HDR × NoToneMapping
    //    clamp 254 饱和平台），阴影对比回归；018.3 时代「day 过曝」定论的处置落地；
    //  - displayIntensity 0.22：天空带 luma 154 / rB 0.508 与 legacy day 渐变
    //    （154.7/0.517）逐位对齐、零通道裁剪（0.28 仍有 63% 蓝通道裁剪故弃选）。
    // 太阳角/大气/云仍零漂移锚逐位锁定（上方两条测试不动）。
    expect(day.iblIntensity).toBe(0.15);
    expect(day.displayIntensity).toBe(0.22);
    expect(day.sun.intensity).toBe(2.4);
    expect(day.sun.color).toBe(0xffffff);
  });
});

describe('环境预设面 · dusk/night/tech 差异化（T018.5 终值绝对锚定）', () => {
  // 018.5 重排说明：day/tech ibl 压至 0.15 后二者同为最低 ibl 预设（压缩对），原
  // 「dusk/night/tech < day」相对断言随之失效——改为绝对值锚定（逐位锁死而非只锁方向，
  // 加严不是放松）；displayIntensity：day 0.22 / tech 0.2（压缩对）/ dusk·night 1
  // （低太阳正对机位的自然眩光，非显示域过曝）。
  const day = ENVIRONMENT_PRESET_TABLE.day;
  const dusk = ENVIRONMENT_PRESET_TABLE.dusk;
  const night = ENVIRONMENT_PRESET_TABLE.night;
  const tech = ENVIRONMENT_PRESET_TABLE.tech;

  it('dusk：低太阳角（~5° 量级）暖浊大气 + ibl 0.85 / display 1（终值绝对锚）', () => {
    expect(dusk.sun.elevationDeg).toBeLessThan(10); // 低角长影（差异化首次生效的载体）
    expect(dusk.atmosphere.turbidity).toBeGreaterThan(day.atmosphere.turbidity); // 暖浊方向
    expect(dusk.iblIntensity).toBe(0.85); // 018.5 终值定案（原「< day」随 day 压缩失效）
    expect(dusk.displayIntensity).toBe(1);
  });

  it('night：低角低强度太阳（月光语义）+ 低 rayleigh + ibl 0.35 / display 1（终值绝对锚）', () => {
    expect(night.sun.elevationDeg).toBeLessThan(day.sun.elevationDeg);
    expect(night.sun.intensity).toBeLessThan(day.sun.intensity / 2); // 低强度（月光）
    expect(night.atmosphere.rayleigh).toBeLessThan(day.atmosphere.rayleigh); // 低 rayleigh 压暗
    expect(night.iblIntensity).toBe(0.35); // 绝对锚严格强于原「< 0.5」方向断言（0.35 < 0.5 仍真）
    expect(night.displayIntensity).toBe(1);
  });

  it('tech：冷色偏高 rayleigh + 低云量 + ibl 0.15 / display 0.2（压缩对终值绝对锚）', () => {
    expect(tech.atmosphere.rayleigh).toBeGreaterThan(day.atmosphere.rayleigh); // 偏高 rayleigh 深蓝
    expect(tech.cloud.cloudCoverage).toBeLessThan(day.cloud.cloudCoverage); // 低云量
    // 018.5 终调重锚（原表值 ibl 0.7 / display 1 经复测推翻）：tech 与 day 同为显示域
    // 压缩预设、同 0.15 压缩口径——ibl 0.15 下 metalness=1 三球粗糙度阶梯纯白占比
    // 0.63/0.78/0.91→0.23/0.20/0.08 阶梯可辨、地面 luma 75→39 回归 legacy 暗蓝语义；
    // display 0.2 消天空满白裁剪（白占比 1.0→0，冷蓝渐变 + 云带 + 地面阴影可见）。
    expect(tech.iblIntensity).toBe(0.15);
    expect(tech.displayIntensity).toBe(0.2);
  });

  it('ibl 压缩重排：day/tech 压缩对为最低 ibl（两者 0.15，严格低于 night 0.35 与 dusk 0.85）', () => {
    // 018.5 终调重锚：day 与 tech 同为 0.15——day 侧保持严格大小断言（对 night/dusk），
    // tech 侧由原 toBeLessThan(day) 改为 0.15 相等锁（相等锁强于大小方向断言，非放松）。
    expect(day.iblIntensity).toBe(0.15);
    expect(tech.iblIntensity).toBe(0.15);
    expect(day.iblIntensity).toBeLessThan(night.iblIntensity); // 0.15 < 0.35
    expect(tech.iblIntensity).toBeLessThan(night.iblIntensity);
    expect(day.iblIntensity).toBeLessThan(dusk.iblIntensity); // 0.15 < 0.85
    expect(tech.iblIntensity).toBeLessThan(dusk.iblIntensity);
  });

  it('四预设太阳仰角互异（预设差异化首次生效：此前四预设同用 day 角）', () => {
    const elevations = new Set(PRESET_IDS.map((id) => ENVIRONMENT_PRESET_TABLE[id].sun.elevationDeg));
    const azimuths = new Set(PRESET_IDS.map((id) => ENVIRONMENT_PRESET_TABLE[id].sun.azimuthDeg));
    expect(elevations.size).toBe(4);
    expect(azimuths.size).toBe(4);
  });
});

describe('环境预设面 · 一期值沿用（迁移防丢值，全预设硬编码对照）', () => {
  /** 一期 Renderer.ENVIRONMENT_PRESETS 沿用键（018.3 收口迁移源；太阳角/ibl/大气云为新差异化面不在其内） */
  const LEGACY_VALUES: Record<
    string,
    {
      sunIntensity: number;
      sunColor: number;
      groundColor: string;
      gridMajor: number;
      gridMinor: number;
      skyTop: string;
      skyBottom: string;
      ambientSky: number;
      ambientGround: number;
      ambientIntensity: number;
    }
  > = {
    day: {
      sunIntensity: 2.4,
      sunColor: 0xffffff,
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
      sunIntensity: 1.6,
      sunColor: 0xffb27a,
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
      sunIntensity: 0.5,
      sunColor: 0x8a9cff,
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
      sunIntensity: 1.2,
      sunColor: 0x9fd8ff,
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

  it('groundColor/grid*/fallback 5 键 + sun 强度色逐位沿用一期值', () => {
    for (const id of PRESET_IDS) {
      const preset = ENVIRONMENT_PRESET_TABLE[id];
      const legacy = LEGACY_VALUES[id];
      expect(preset.groundColor).toBe(legacy.groundColor);
      expect(preset.gridMajor).toBe(legacy.gridMajor);
      expect(preset.gridMinor).toBe(legacy.gridMinor);
      expect(preset.skyTop).toBe(legacy.skyTop);
      expect(preset.skyBottom).toBe(legacy.skyBottom);
      expect(preset.ambientSky).toBe(legacy.ambientSky);
      expect(preset.ambientGround).toBe(legacy.ambientGround);
      expect(preset.ambientIntensity).toBe(legacy.ambientIntensity);
      expect(preset.sun.intensity).toBe(legacy.sunIntensity);
      expect(preset.sun.color).toBe(legacy.sunColor);
    }
  });
});

describe('skyAtmosphereOfPreset · 预设 → SkyCore 入参形态', () => {
  it('两子面合回八参数（键集恰 8，值逐位 = 预设子面）', () => {
    for (const id of PRESET_IDS) {
      const preset = ENVIRONMENT_PRESET_TABLE[id];
      const atmosphere = skyAtmosphereOfPreset(preset);
      expect(Object.keys(atmosphere).sort()).toEqual(
        [
          'turbidity',
          'rayleigh',
          'mieCoefficient',
          'mieDirectionalG',
          'cloudCoverage',
          'cloudDensity',
          'cloudElevation',
          'cloudScale',
        ].sort(),
      );
      expect(atmosphere).toEqual({ ...preset.atmosphere, ...preset.cloud });
    }
  });
});
