/**
 * tests/runtime/environment/skyCore.test.ts —— Sky 双实例核心测试（T018.1，D29.11/12）。
 *
 * 覆盖（纯构造层，零 WebGL——Sky = Mesh + ShaderMaterial，node 可实例化）：
 * - 双实例结构：displaySky/bakeSky 两实例；bakeScene 只含 bakeSky（PMREM 场景职责分离）；
 *   displaySky 初始无父（挂载归 Renderer envGroup）；
 * - showSunDisc 按侧固定：display 常开 1 / bake 常闭 0（烘焙太阳盘保护）；
 * - 内建云静态语义锁定（D29.11）：cloudSpeed 双实例恒 0；time uniform 初始 0 且
 *   任何状态操作（apply/patch/setSunDirection/followCamera）后仍 0——不接 time 驱动；
 * - 共享参数同步：applyAtmosphere / patchAtmosphere → 双实例 8 参数 uniforms 逐键一致
 *   且等于状态源；setSunDirection → 双实例 sunPosition 同步；
 * - 三一致（D29.1）：sunPosition uniforms = sunDirectionOf(50.2°,53.1°)（day 派生）；
 *   lightPos = sunDirection × LEGACY_SUN_DISTANCE 与 uniforms 同向且模长 = |(80,120,60)|；
 * - 相机跟随：followCamera 拷贝 displaySky.position；bakeSky 不跟随（恒在原点）；
 * - SKY_BOX_SCALE 适配：对角半径 √3/2·scale < camera.far 10000（量级约束注释的锁定）；
 * - dispose：双实例 geometry/material 各恰好释放一次（dispose 事件计数）、displaySky
 *   摘离父节点、bakeScene 清空、幂等（二次调用零新增事件）；
 * - 显示侧强度（D29.13，T018.2）：uDisplayIntensity 仅 displaySky 注入、默认 1.0；
 *   片元含辐射域乘法（tonemapping/colorspace 之前、汇合点唯一）；setDisplayIntensity
 *   生效且非法值拒绝；bakeSky 零污染（uniforms 无该键、片元源与官方 Sky 逐字节一致、
 *   写入口调用后 bakeSky uniforms 逐键无变化——显示调暗不进烘焙）。
 * - 参数变更回调（T018.2 PMREM 重烘挂点）：三写入口各恰触发一次；构造期初始同步
 *   不触发（初烘由 applyEnvironment 显式驱动）；setDisplayIntensity / followCamera /
 *   dispose 后不触发（display-only 单侧参数与帧路径不进 PMREM 触发清单）。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import {
  SKY_BOX_SCALE,
  SkyCore,
  displaySkyUniformsOf,
  skyUniformsOf,
} from '../../../src/runtime/environment/skyCore';
import type { SkyUniforms } from '../../../src/runtime/environment/skyCore';
import { environmentPresetOf, skyAtmosphereOfPreset } from '../../../src/runtime/environment/environmentPresets';
import {
  DAY_SUN_AZIMUTH_DEG,
  DAY_SUN_ELEVATION_DEG,
  LEGACY_SUN_DISTANCE,
  sunDirectionOf,
} from '../../../src/runtime/environment/sunDirection';

/**
 * 四预设大气/云参数组（018.3 收口后经统一预设面取值——skyCore 零预设数值，测试参数
 * 语义不变；预设查表回退测试在 environmentPresets.test.ts）
 */
const SKY_PRESET_ATMOSPHERE = {
  day: skyAtmosphereOfPreset(environmentPresetOf('day')),
  dusk: skyAtmosphereOfPreset(environmentPresetOf('dusk')),
  night: skyAtmosphereOfPreset(environmentPresetOf('night')),
  tech: skyAtmosphereOfPreset(environmentPresetOf('tech')),
} as const;

/** 计数目标对象的 dispose 事件次数（three EventDispatcher 语义） */
function countDisposes(
  target: THREE.BufferGeometry | THREE.Material | THREE.WebGLRenderTarget,
): { count: () => number } {
  let n = 0;
  target.addEventListener('dispose', () => {
    n += 1;
  });
  return { count: () => n };
}

describe('SkyCore · 双实例结构（D29.12）', () => {
  it('displaySky/bakeSky 两实例；bakeScene 只含 bakeSky；displaySky 初始无父', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    expect(core.displaySky).toBeInstanceOf(Sky);
    expect(core.bakeSky).toBeInstanceOf(Sky);
    expect(core.displaySky).not.toBe(core.bakeSky);
    expect(core.bakeScene.children).toEqual([core.bakeSky]);
    expect(core.displaySky.parent).toBeNull();
    core.dispose();
  });

  it('showSunDisc 按侧固定：display 常开 1 / bake 常闭 0（烘焙太阳盘保护）', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    expect(skyUniformsOf(core.displaySky).showSunDisc.value).toBe(1);
    expect(skyUniformsOf(core.bakeSky).showSunDisc.value).toBe(0);
    // 状态操作不改变按侧固定值
    core.applyAtmosphere(SKY_PRESET_ATMOSPHERE.night);
    core.setSunDirection(30, 200);
    expect(skyUniformsOf(core.displaySky).showSunDisc.value).toBe(1);
    expect(skyUniformsOf(core.bakeSky).showSunDisc.value).toBe(0);
    core.dispose();
  });

  it('SKY_BOX_SCALE 适配：scale 已设且对角半径 √3/2·scale < camera.far 10000', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    expect(core.displaySky.scale.x).toBe(SKY_BOX_SCALE);
    expect(core.bakeSky.scale.x).toBe(SKY_BOX_SCALE);
    // BoxGeometry(1,1,1) 半对角 = √3/2；相机 far=10000（Renderer.ts:400）——量级约束
    const diagonalRadius = (Math.sqrt(3) / 2) * SKY_BOX_SCALE;
    expect(diagonalRadius).toBeLessThan(10000);
    core.dispose();
  });
});

describe('SkyCore · 内建云静态语义锁定（D29.11：cloudSpeed=0 不接 time）', () => {
  it('cloudSpeed 双实例恒 0；time 初始 0', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    for (const sky of [core.displaySky, core.bakeSky]) {
      expect(skyUniformsOf(sky).cloudSpeed.value).toBe(0);
      expect(skyUniformsOf(sky).time.value).toBe(0);
    }
    core.dispose();
  });

  it('任意状态操作后 time 仍 0、cloudSpeed 仍 0（无任何 time 驱动接线）', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    const camera = new THREE.PerspectiveCamera();
    for (let i = 0; i < 5; i++) {
      core.applyAtmosphere(SKY_PRESET_ATMOSPHERE.tech);
      core.patchAtmosphere({ cloudCoverage: 0.1 * i, turbidity: 1 + i });
      core.setSunDirection(10 + i, 100 + i);
      camera.position.set(i, i, i);
      core.followCamera(camera); // 帧驱动路径也不触碰 time
    }
    for (const sky of [core.displaySky, core.bakeSky]) {
      expect(skyUniformsOf(sky).time.value).toBe(0);
      expect(skyUniformsOf(sky).cloudSpeed.value).toBe(0);
    }
    core.dispose();
  });
});

describe('SkyCore · 共享参数状态双实例同步', () => {
  it('构造即同步：双实例 8 参数 = 预设初值（day provisional 表）', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    const expected = SKY_PRESET_ATMOSPHERE.day;
    for (const sky of [core.displaySky, core.bakeSky]) {
      const u = skyUniformsOf(sky);
      expect(u.turbidity.value).toBe(expected.turbidity);
      expect(u.rayleigh.value).toBe(expected.rayleigh);
      expect(u.mieCoefficient.value).toBe(expected.mieCoefficient);
      expect(u.mieDirectionalG.value).toBe(expected.mieDirectionalG);
      expect(u.cloudCoverage.value).toBe(expected.cloudCoverage);
      expect(u.cloudDensity.value).toBe(expected.cloudDensity);
      expect(u.cloudElevation.value).toBe(expected.cloudElevation);
      expect(u.cloudScale.value).toBe(expected.cloudScale);
    }
    expect(core.params.turbidity).toBe(expected.turbidity);
    core.dispose();
  });

  it('applyAtmosphere 整体写：双实例同步换表', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    core.applyAtmosphere(SKY_PRESET_ATMOSPHERE.dusk);
    for (const sky of [core.displaySky, core.bakeSky]) {
      expect(skyUniformsOf(sky).turbidity.value).toBe(SKY_PRESET_ATMOSPHERE.dusk.turbidity);
      expect(skyUniformsOf(sky).cloudCoverage.value).toBe(SKY_PRESET_ATMOSPHERE.dusk.cloudCoverage);
    }
    core.dispose();
  });

  it('patchAtmosphere 分量写：只改目标键、其余保持、双实例同步', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    core.patchAtmosphere({ cloudCoverage: 0.7 });
    for (const sky of [core.displaySky, core.bakeSky]) {
      const u = skyUniformsOf(sky);
      expect(u.cloudCoverage.value).toBe(0.7);
      expect(u.turbidity.value).toBe(SKY_PRESET_ATMOSPHERE.day.turbidity); // 未触碰
      expect(u.rayleigh.value).toBe(SKY_PRESET_ATMOSPHERE.day.rayleigh);
    }
    core.dispose();
  });

  it('setSunDirection：双实例 sunPosition + 状态源同步更新', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    core.setSunDirection(30, 200);
    const expected = sunDirectionOf(30, 200);
    for (const sky of [core.displaySky, core.bakeSky]) {
      const p = skyUniformsOf(sky).sunPosition.value;
      expect(p.x).toBeCloseTo(expected.x, 12);
      expect(p.y).toBeCloseTo(expected.y, 12);
      expect(p.z).toBeCloseTo(expected.z, 12);
    }
    expect(core.sunDirection.x).toBeCloseTo(expected.x, 12);
    core.dispose();
  });

  it('sunPosition 各实例自有 Vector3（不共享引用——单实例改写不串扰）', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    const a = skyUniformsOf(core.displaySky).sunPosition.value;
    const b = skyUniformsOf(core.bakeSky).sunPosition.value;
    expect(a).not.toBe(b);
    a.set(9, 9, 9); // 外部野写不串扰另一实例（同步只经写入口发生）
    expect(b.x).not.toBe(9);
    core.dispose();
  });
});

describe('SkyCore · 三一致（天空太阳位 = 光向 = 影向，D29.1）', () => {
  it('sunPosition uniforms = sunDirectionOf(50.2°, 53.1°)（day 派生，缺省构造角）', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day); // 缺省 = DAY 候选角
    const expected = sunDirectionOf(DAY_SUN_ELEVATION_DEG, DAY_SUN_AZIMUTH_DEG);
    for (const sky of [core.displaySky, core.bakeSky]) {
      const p = skyUniformsOf(sky).sunPosition.value;
      expect(p.x).toBeCloseTo(expected.x, 12);
      expect(p.y).toBeCloseTo(expected.y, 12);
      expect(p.z).toBeCloseTo(expected.z, 12);
    }
    core.dispose();
  });

  it('光位 = sunDirection × LEGACY_SUN_DISTANCE 与 uniforms 同向同源、模长 = |(80,120,60)|', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    const d = core.sunDirection;
    // Renderer.applyEnvironment 太阳段同款算式（同状态源 × legacy 模长）
    const lightPos = { x: d.x * LEGACY_SUN_DISTANCE, y: d.y * LEGACY_SUN_DISTANCE, z: d.z * LEGACY_SUN_DISTANCE };
    const lightLen = Math.hypot(lightPos.x, lightPos.y, lightPos.z);
    expect(lightLen).toBeCloseTo(LEGACY_SUN_DISTANCE, 9); // 同模长
    const u = skyUniformsOf(core.displaySky).sunPosition.value;
    // 同向：光位归一 == uniforms（uniforms 本为单位向量）
    const lightUnit = { x: lightPos.x / lightLen, y: lightPos.y / lightLen, z: lightPos.z / lightLen };
    expect(Math.abs(u.x - lightUnit.x)).toBeLessThan(1e-12);
    expect(Math.abs(u.y - lightUnit.y)).toBeLessThan(1e-12);
    expect(Math.abs(u.z - lightUnit.z)).toBeLessThan(1e-12);
    core.dispose();
  });
});

describe('SkyCore · 相机中心跟随 / 释放', () => {
  it('followCamera：displaySky.position 拷贝相机位；bakeSky 不跟随（恒在原点）', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(120, 80, -45);
    core.followCamera(camera);
    expect(core.displaySky.position.equals(camera.position)).toBe(true);
    expect(core.bakeSky.position.length()).toBe(0); // bake 虚拟相机语义，不跟随
    core.dispose();
  });

  it('dispose：双实例 geometry/material 各恰好一次；displaySky 摘离；bakeScene 清空；幂等', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    const parent = new THREE.Group();
    parent.add(core.displaySky); // 模拟 Renderer envGroup 挂载
    const targets = [
      core.displaySky.geometry,
      core.displaySky.material,
      core.bakeSky.geometry,
      core.bakeSky.material,
    ];
    const counters = targets.map((t) => countDisposes(t));
    core.dispose();
    for (const c of counters) expect(c.count()).toBe(1);
    expect(core.displaySky.parent).toBeNull(); // 已摘离 envGroup
    expect(core.bakeScene.children).toHaveLength(0);
    // 幂等：二次调用零新增事件；写入口进入 disposed 短路
    core.dispose();
    for (const c of counters) expect(c.count()).toBe(1);
    core.patchAtmosphere({ turbidity: 99 });
    expect(core.params.turbidity).not.toBe(99);
  });
});

describe('SkyCore · 预设无关的构造入参', () => {
  it('四组预设大气/云参数均可驱动构造（统一预设面经 skyAtmosphereOfPreset 取值贯通）', () => {
    for (const key of ['day', 'dusk', 'night', 'tech'] as const) {
      const core = new SkyCore(SKY_PRESET_ATMOSPHERE[key]);
      expect(skyUniformsOf(core.displaySky).turbidity.value).toBe(SKY_PRESET_ATMOSPHERE[key].turbidity);
      core.dispose();
    }
  });
});

/** Sky 内建 12 键 uniforms 值快照（bakeSky 逐键对照用——引用不变、值变即感知） */
function snapshotSkyUniforms(u: SkyUniforms): Record<string, unknown> {
  return {
    turbidity: u.turbidity.value,
    rayleigh: u.rayleigh.value,
    mieCoefficient: u.mieCoefficient.value,
    mieDirectionalG: u.mieDirectionalG.value,
    sunPosition: u.sunPosition.value.toArray(),
    cloudScale: u.cloudScale.value,
    cloudSpeed: u.cloudSpeed.value,
    cloudCoverage: u.cloudCoverage.value,
    cloudDensity: u.cloudDensity.value,
    cloudElevation: u.cloudElevation.value,
    showSunDisc: u.showSunDisc.value,
    time: u.time.value,
  };
}

describe('SkyCore · 显示侧强度（D29.13：仅 displaySky 注入，bakeSky 零污染）', () => {
  it('displaySky 注入 uDisplayIntensity 默认 1.0（构造即观感零变化）', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    expect(displaySkyUniformsOf(core.displaySky).uDisplayIntensity.value).toBe(1);
    core.dispose();
  });

  it('片元注入：uniform 声明 + texColor 乘法均在 tonemapping/colorspace 之前（辐射域）且各只出现一次', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    const fs = core.displaySky.material.fragmentShader;
    const declAt = fs.indexOf('uniform float uDisplayIntensity;');
    const mulAt = fs.indexOf('texColor * uDisplayIntensity');
    const toneAt = fs.indexOf('#include <tonemapping_fragment>');
    const colorAt = fs.indexOf('#include <colorspace_fragment>');
    expect(declAt).toBeGreaterThanOrEqual(0);
    expect(mulAt).toBeGreaterThan(declAt); // 先声明后使用
    // 辐射域约束：乘法在 tonemapping 与 colorspace 片元块之前
    expect(toneAt).toBeGreaterThan(mulAt);
    expect(colorAt).toBeGreaterThan(mulAt);
    // 汇合点唯一：声明 + 乘法恰好两次出现，无多分支重复注入
    expect(fs.split('uDisplayIntensity').length - 1).toBe(2);
    core.dispose();
  });

  it('setDisplayIntensity 生效：只写 displaySky 的 uDisplayIntensity', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    core.setDisplayIntensity(0.35);
    expect(displaySkyUniformsOf(core.displaySky).uDisplayIntensity.value).toBe(0.35);
    // 状态操作不影响显示强度（不进 SkyParamsState——display-only 单侧参数）
    core.applyAtmosphere(SKY_PRESET_ATMOSPHERE.night);
    expect(displaySkyUniformsOf(core.displaySky).uDisplayIntensity.value).toBe(0.35);
    core.dispose();
  });

  it('非法值拒绝：NaN / ±Infinity / 负数抛 RangeError 且不写 uniform', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    for (const bad of [Number.NaN, Infinity, -Infinity, -0.5]) {
      expect(() => core.setDisplayIntensity(bad)).toThrow(RangeError);
    }
    expect(displaySkyUniformsOf(core.displaySky).uDisplayIntensity.value).toBe(1);
    core.dispose();
  });

  it('bakeSky 零污染：uniforms 无该键、片元源与官方 Sky 逐字节一致', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    expect(Object.keys(skyUniformsOf(core.bakeSky))).not.toContain('uDisplayIntensity');
    const pristine = new Sky(); // 未注入的官方 Sky 原样参照
    expect(core.bakeSky.material.fragmentShader).toBe(pristine.material.fragmentShader);
    pristine.geometry.dispose();
    pristine.material.dispose();
    core.dispose();
  });

  it('setDisplayIntensity 后 bakeSky 内建 12 键 uniforms 逐键无变化（显示调暗不进烘焙）', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    const before = snapshotSkyUniforms(skyUniformsOf(core.bakeSky));
    core.setDisplayIntensity(0.2);
    expect(snapshotSkyUniforms(skyUniformsOf(core.bakeSky))).toEqual(before);
    core.dispose();
  });
});

describe('SkyCore · 参数变更回调（T018.2 PMREM 重烘挂点）', () => {
  it('三写入口各恰触发一次；构造期初始同步不触发（初烘由 applyEnvironment 显式驱动）', () => {
    let fired = 0;
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day, undefined, () => {
      fired += 1;
    });
    expect(fired).toBe(0); // 构造同步零触发——避免与显式初烘双烘
    core.applyAtmosphere(SKY_PRESET_ATMOSPHERE.night);
    expect(fired).toBe(1);
    core.patchAtmosphere({ cloudCoverage: 0.8 });
    expect(fired).toBe(2);
    core.setSunDirection(20, 210);
    expect(fired).toBe(3);
    core.dispose();
  });

  it('setDisplayIntensity / followCamera 不触发（display-only 与帧路径不进 PMREM 触发清单；time 亦无驱动）', () => {
    let fired = 0;
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day, undefined, () => {
      fired += 1;
    });
    const camera = new THREE.PerspectiveCamera();
    for (let i = 0; i < 5; i++) {
      camera.position.set(i, i, i);
      core.followCamera(camera); // 渲染循环每帧调用——连续 N 帧零重烘
      core.setDisplayIntensity(0.5); // 显示侧调整不影响烘焙（D29.13）
    }
    expect(fired).toBe(0);
    // time 不构成触发源的结构面：cloudSpeed=0 恒锁 + time 恒 0（上方静态语义组已覆盖，
    // 此处补「帧驱动路径后回调仍零触发」）
    for (const sky of [core.displaySky, core.bakeSky]) {
      expect(skyUniformsOf(sky).time.value).toBe(0);
      expect(skyUniformsOf(sky).cloudSpeed.value).toBe(0);
    }
    core.dispose();
  });

  it('dispose 后写入口不触发（disposed 短路先于回调）', () => {
    let fired = 0;
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day, undefined, () => {
      fired += 1;
    });
    core.dispose();
    core.patchAtmosphere({ turbidity: 5 });
    core.setSunDirection(10, 10);
    core.applyAtmosphere(SKY_PRESET_ATMOSPHERE.tech);
    expect(fired).toBe(0);
  });
});
