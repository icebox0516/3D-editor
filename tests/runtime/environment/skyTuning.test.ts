/**
 * tests/runtime/environment/skyTuning.test.ts —— Renderer 环境调参端口测试
 * （T018.4，__sky DEV 面 / 018.5 终调工作台的 runtime 侧）。
 *
 * 口径：node 无 WebGL——SkyCore / PmremEnvironment / SkyRebake / SkyTuning 全 node 可
 * 构造（PMREM backend 经 LazyPmremBackend 工厂注入 mock generator，018.2 先例；调度器
 * 注入同步/手动口径，见 skyRebake.test）。Renderer 接线为源码级结构断言（?raw 先例）。
 *
 * 覆盖：
 * - **三一致**（D29.1，验收口径）：setSunAngles → SkyCore 状态 + 双实例 sunPosition
 *   uniforms + sunLight.position（= sunDirection × LEGACY_SUN_DISTANCE，模长恒
 *   |(80,120,60)|）同步断言；debounced 重烘触发；
 * - IBL 强度：setIblIntensity 直写 scene.environmentIntensity（读口径可见）+ 触发
 *   debounced 重烘（同步调度器下 baked +1 的行为断言）；非法值 RangeError 且直写不发生；
 * - 显示强度：setDisplayIntensity 即时生效且**零重烘**（display-only 单侧，D29.13）；
 *   RangeError 透传（SkyCore 既有语义）；
 * - rebake()：flush 语义（pending 消费 + 立即恰一次；无 pending 直通）；
 * - params() 读回：大气八参 = SkyCore 状态、太阳角反解往返（含 azimuth 归一 [0,360)）、
 *   displayIntensity / iblIntensity / preset 名；
 * - patchAtmosphere 八键白名单（D29.11）：cloudSpeed 及未知键结构性不得进入共享状态
 *  （绕过类型面的运行时注入模拟）——cloudSpeed uniforms 双实例恒 0；
 * - Renderer 接线结构断言：sunLight 字段提升、端口装配仅在 sky 分支（legacy 恒 null，
 *   D29.5 单一开关）、clearEnvironment 取消 pending + 字段置空、renderFrame 帧路径
 *   零调参端口引用（PMREM 严禁进帧路径）。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import rendererSource from '../../../src/runtime/Renderer.ts?raw';
import { environmentPresetOf, skyAtmosphereOfPreset } from '../../../src/runtime/environment/environmentPresets';
import { LazyPmremBackend, PmremEnvironment } from '../../../src/runtime/environment/pmremEnvironment';
import type { PmremGeneratorLike } from '../../../src/runtime/environment/pmremEnvironment';
import { SkyRebake } from '../../../src/runtime/environment/skyRebake';
import type { RebakeScheduler } from '../../../src/runtime/environment/skyRebake';
import { ATMOSPHERE_KEYS, SkyTuning } from '../../../src/runtime/environment/skyTuning';
import { SkyCore, displaySkyUniformsOf, skyUniformsOf } from '../../../src/runtime/environment/skyCore';
import type { SkyAtmosphereParams } from '../../../src/runtime/environment/skyCore';
import { LEGACY_SUN_DISTANCE, sunDirectionOf } from '../../../src/runtime/environment/sunDirection';

/** 手动调度器（pending 单槽；fire 返回被触发的 fn——取消/pending 消费证据） */
function makeManualScheduler(): RebakeScheduler & { fire(): (() => void) | null; hasPending(): boolean } {
  let pending: (() => void) | null = null;
  return {
    schedule(fn) {
      pending = fn;
      return () => {
        pending = null;
      };
    },
    fire() {
      const fn = pending;
      pending = null;
      fn?.();
      return fn;
    },
    hasPending: () => pending !== null,
  };
}

/** 同步调度器（trigger 即执行——重烘行为断言的确定性口径） */
const SYNC_SCHEDULER: RebakeScheduler = {
  schedule(fn) {
    fn();
    return () => {};
  },
};

/** mock generator（fromScene 计数 + 每次新 RT，口径同 pmremEnvironment.test） */
function makeStubGenerator(): { generator: PmremGeneratorLike; calls: () => number } {
  let calls = 0;
  const generator: PmremGeneratorLike = {
    fromScene() {
      calls += 1;
      const rt = new THREE.WebGLRenderTarget(64, 64);
      rt.texture.mapping = THREE.CubeUVReflectionMapping;
      return rt;
    },
    dispose() {},
  };
  return { generator, calls: () => calls };
}

/**
 * 组装被测端口（生产同构接线：SkyCore 写入口回调 → rebake.trigger → pmrem.bake；
 * 初烘显式一次）。presetId / scheduler 可注入差异化。
 */
function makeTuning(presetId = 'day', scheduler: RebakeScheduler = SYNC_SCHEDULER) {
  const scene = new THREE.Scene();
  const stub = makeStubGenerator();
  const preset = environmentPresetOf(presetId);
  let pmrem: PmremEnvironment | null = null;
  const rebake = new SkyRebake(() => pmrem?.bake(), scheduler);
  const sky = new SkyCore(
    skyAtmosphereOfPreset(preset),
    { elevationDeg: preset.sun.elevationDeg, azimuthDeg: preset.sun.azimuthDeg },
    () => rebake.trigger(),
  );
  sky.setDisplayIntensity(preset.displayIntensity); // 生产接线同款（setupSkyEnvironment 构建期一次写入，T018.5）
  pmrem = new PmremEnvironment({ scene, bakeScene: sky.bakeScene, backend: new LazyPmremBackend(() => stub.generator) });
  pmrem.bake(); // 初烘（= baked 1）
  scene.environmentIntensity = preset.iblIntensity; // 生产接线同款（setupSkyEnvironment 初值）
  const sunLight = new THREE.DirectionalLight(preset.sun.color, preset.sun.intensity);
  const initial = sunDirectionOf(preset.sun.elevationDeg, preset.sun.azimuthDeg);
  sunLight.position.set(
    initial.x * LEGACY_SUN_DISTANCE,
    initial.y * LEGACY_SUN_DISTANCE,
    initial.z * LEGACY_SUN_DISTANCE,
  );
  const tuning = new SkyTuning({ scene, sky, pmrem, sunLight, rebake, preset: presetId });
  return { scene, stub, sky, pmrem, sunLight, rebake, tuning };
}

describe('SkyTuning · setSunAngles 三一致（D29.1：天空太阳位 = 光向 = 影向）', () => {
  it('SkyCore 状态 + 双实例 sunPosition uniforms + sunLight.position 同步（× LEGACY_SUN_DISTANCE）', () => {
    const { sky, sunLight, tuning } = makeTuning('day');
    tuning.setSunAngles(30, 200);
    const expected = sunDirectionOf(30, 200);
    // ① SkyCore 状态源
    expect(sky.params.sunDirection.x).toBeCloseTo(expected.x, 12);
    expect(sky.params.sunDirection.y).toBeCloseTo(expected.y, 12);
    expect(sky.params.sunDirection.z).toBeCloseTo(expected.z, 12);
    // ② 双实例 sunPosition uniforms（displaySky + bakeSky）
    for (const instance of [sky.displaySky, sky.bakeSky]) {
      const p = skyUniformsOf(instance).sunPosition.value;
      expect(p.x).toBeCloseTo(expected.x, 12);
      expect(p.y).toBeCloseTo(expected.y, 12);
      expect(p.z).toBeCloseTo(expected.z, 12);
    }
    // ③ 太阳灯位 = sunDirection × LEGACY_SUN_DISTANCE（模长 = |(80,120,60)|——灯位侧
    //    只动向量不动 shadow camera，D29.1 冻结）
    expect(sunLight.position.x).toBeCloseTo(expected.x * LEGACY_SUN_DISTANCE, 9);
    expect(sunLight.position.y).toBeCloseTo(expected.y * LEGACY_SUN_DISTANCE, 9);
    expect(sunLight.position.z).toBeCloseTo(expected.z * LEGACY_SUN_DISTANCE, 9);
    expect(sunLight.position.length()).toBeCloseTo(LEGACY_SUN_DISTANCE, 9);
    sky.dispose();
  });

  it('setSunAngles 触发 debounced 重烘（同步调度器下 baked +1 的行为断言）', () => {
    const { pmrem, sky, tuning } = makeTuning('day');
    expect(pmrem.stats.baked).toBe(1); // 初烘
    tuning.setSunAngles(45, 120);
    expect(pmrem.stats.baked).toBe(2); // 停手即重烘（同步口径）
    sky.dispose();
  });
});

describe('SkyTuning · IBL 强度（直写 + 借道 debounced 重烘刷新）', () => {
  it('setIblIntensity：直写读口径可见 + 触发重烘（同步调度器 baked +1——刷新路径行为断言）', () => {
    const { scene, pmrem, sky, tuning } = makeTuning('day');
    expect(scene.environmentIntensity).toBe(0.15); // 初值 = day 预设 ibl（018.5 重锚 0.15）
    tuning.setIblIntensity(0.55);
    expect(scene.environmentIntensity).toBe(0.55); // 直写立即可读
    expect(pmrem.stats.baked).toBe(2); // 借道重烘被触发（烘焙内容不变纯为刷新）
    sky.dispose();
  });

  it('非法值显式抛错：NaN / ±Infinity / 负数 RangeError 且直写不发生', () => {
    const { scene, sky, tuning } = makeTuning('day');
    for (const bad of [Number.NaN, Infinity, -Infinity, -0.5]) {
      expect(() => tuning.setIblIntensity(bad)).toThrow(RangeError);
    }
    expect(scene.environmentIntensity).toBe(0.15); // 未被污染（018.5 重锚后初值）
    sky.dispose();
  });
});

describe('SkyTuning · 显示强度（display-only 单侧，D29.13）', () => {
  it('setDisplayIntensity 即时生效且零重烘；RangeError 透传（SkyCore 既有语义）', () => {
    const { pmrem, sky, tuning } = makeTuning('day');
    tuning.setDisplayIntensity(0.35);
    expect(displaySkyUniformsOf(sky.displaySky).uDisplayIntensity.value).toBe(0.35);
    expect(pmrem.stats.baked).toBe(1); // 零重烘（显示调暗不进烘焙）
    for (const bad of [Number.NaN, Infinity, -1]) {
      expect(() => tuning.setDisplayIntensity(bad)).toThrow(RangeError);
    }
    expect(displaySkyUniformsOf(sky.displaySky).uDisplayIntensity.value).toBe(0.35); // 拒绝后不写
    sky.dispose();
  });
});

describe('SkyTuning · rebake()（flush 语义——018.5 终调工具）', () => {
  it('pending 存在：立即执行恰一次且旧 pending 消费掉（不得二次触发）', () => {
    const manual = makeManualScheduler();
    const { pmrem, sky, tuning } = makeTuning('day', manual);
    tuning.patchAtmosphere({ cloudCoverage: 0.6 }); // pending
    expect(manual.hasPending()).toBe(true);
    expect(pmrem.stats.baked).toBe(1);
    tuning.rebake();
    expect(pmrem.stats.baked).toBe(2); // 立即重烘
    expect(manual.hasPending()).toBe(false); // pending 消费
    expect(manual.fire()).toBeNull(); // 旧 timer 不再触发
    expect(pmrem.stats.baked).toBe(2);
    sky.dispose();
  });

  it('无 pending 直通执行', () => {
    const manual = makeManualScheduler();
    const { pmrem, sky, tuning } = makeTuning('day', manual);
    tuning.rebake();
    expect(pmrem.stats.baked).toBe(2);
    sky.dispose();
  });
});

describe('SkyTuning · params() 读回', () => {
  it('day 初值：大气八参 = 预设表 + 太阳角反解（50.2/53.1）+ display 0.22 + ibl 0.15（018.5 终调重锚）+ preset 名', () => {
    const { tuning, sky } = makeTuning('day');
    const preset = environmentPresetOf('day');
    const p = tuning.params();
    expect(p.atmosphere).toEqual(skyAtmosphereOfPreset(preset));
    expect(p.sun.elevationDeg).toBeCloseTo(preset.sun.elevationDeg, 9);
    expect(p.sun.azimuthDeg).toBeCloseTo(preset.sun.azimuthDeg, 9);
    expect(p.displayIntensity).toBe(0.22); // 018.5 重锚（day 显示域压缩表值经生产同构接线落地）
    expect(p.iblIntensity).toBe(0.15); // 018.5 重锚（绝对锚强于原表值相对断言）
    expect(p.preset).toBe('day');
    sky.dispose();
  });

  it('setSunAngles 后读回往返一致；azimuth 归一 [0,360)（dusk 240° 读回 240 非 -120）', () => {
    const { tuning, sky } = makeTuning('day');
    tuning.setSunAngles(5, 240);
    const p = tuning.params();
    expect(p.sun.elevationDeg).toBeCloseTo(5, 9);
    expect(p.sun.azimuthDeg).toBeCloseTo(240, 9);
    expect(p.sun.azimuthDeg).toBeGreaterThanOrEqual(0);
    expect(p.sun.azimuthDeg).toBeLessThan(360);
    sky.dispose();
  });

  it('dusk 初值：预设角反解 + ibl 0.85 + preset 名（非 day 预设贯通）', () => {
    const { tuning, sky } = makeTuning('dusk');
    const p = tuning.params();
    expect(p.sun.elevationDeg).toBeCloseTo(5, 9);
    expect(p.sun.azimuthDeg).toBeCloseTo(240, 9);
    expect(p.iblIntensity).toBe(0.85);
    expect(p.preset).toBe('dusk');
    sky.dispose();
  });

  it('pmremStats() = PmremEnvironment counter 快照（owned/live/baked/retired）', () => {
    const { pmrem, sky, tuning } = makeTuning('day');
    tuning.setSunAngles(10, 10); // 一次重烘（同步调度器）
    expect(tuning.pmremStats()).toEqual(pmrem.stats);
    expect(tuning.pmremStats()).toEqual({ baked: 2, retired: 1, owned: 1, live: 1 });
    sky.dispose();
  });
});

describe('SkyTuning · patchAtmosphere 八键白名单（D29.11：cloudSpeed 不暴露）', () => {
  it('白名单常量：恰八键且无 cloudSpeed（satisfies 类型锁 + 运行时结构锁）', () => {
    expect(ATMOSPHERE_KEYS).not.toContain('cloudSpeed');
    expect(ATMOSPHERE_KEYS).toHaveLength(8);
    expect([...ATMOSPHERE_KEYS]).toEqual([
      'turbidity',
      'rayleigh',
      'mieCoefficient',
      'mieDirectionalG',
      'cloudCoverage',
      'cloudDensity',
      'cloudElevation',
      'cloudScale',
    ]);
  });

  it('绕过类型面的运行时注入（模拟控制台调用）：cloudSpeed/未知键不得进共享状态，uniforms 恒 0', () => {
    const { sky, tuning } = makeTuning('day');
    // as unknown 模拟 DEV 控制台绕过 TS 类型面的调用（结构防线测试——非类型面测试）
    tuning.patchAtmosphere({ turbidity: 9, cloudSpeed: 1, time: 42 } as unknown as Partial<SkyAtmosphereParams>);
    expect(sky.params.turbidity).toBe(9); // 白名单内键正常透传
    expect(Object.keys(sky.params)).not.toContain('cloudSpeed'); // 状态零污染
    expect(Object.keys(sky.params)).not.toContain('time');
    for (const instance of [sky.displaySky, sky.bakeSky]) {
      expect(skyUniformsOf(instance).cloudSpeed.value).toBe(0); // 动态云入口结构性不存在
      expect(skyUniformsOf(instance).time.value).toBe(0);
    }
    sky.dispose();
  });
});

describe('Renderer 接线 · 源码结构断言（node 无 WebGL 的确定性口径，018.2 先例）', () => {
  // 源码归一化（仓库文件为 CRLF——多行精确匹配前统一换行符）
  const source = rendererSource.replace(/\r\n/g, '\n');

  /** 提取类成员方法体（签名起点 → 首个 2 空格缩进闭括）；签名/边界漂移时显式失败 */
  function methodBody(signature: string): string {
    const start = source.indexOf(signature);
    if (start < 0) throw new Error(`Renderer.ts 方法签名漂移：找不到「${signature}」——需同步更新 T018.4 结构断言`);
    const end = source.indexOf('\n  }', start);
    if (end < 0) throw new Error(`Renderer.ts 方法体边界漂移：「${signature}」——需同步更新 T018.4 结构断言`);
    return source.slice(start, end);
  }

  it('applyEnvironment：sunLight 字段提升 + skyRebake 句柄带出 + 端口装配（sky 分支专属）', () => {
    const body = methodBody('applyEnvironment(env: SceneEnvironment): void {');
    expect(body).toContain('this.sunLight = new THREE.DirectionalLight'); // T018.4 字段提升（调参端口灯位侧）
    expect(body).toContain('const sun = this.sunLight'); // 分支块局部别名（挂载/阴影/层例外沿用原名）
    expect(body).toContain('this.skyRebake = skyEnv.rebake'); // debounce 句柄带出
    // 端口装配仅在 sky 分支守卫内（legacy 恒 null——D29.5 单一开关不变式）
    expect(source).toContain('if (skyEnv.mode === \'sky\') {\n      this.skyTuningPort = new SkyTuning({');
    // 全文件唯一端口构造点（无第二处旁路装配）
    expect(source.split('this.skyTuningPort = new').length - 1).toBe(1);
  });

  it('clearEnvironment：pending 重烘显式取消 + 调参端口/sunLight 字段置空（PMREM 释放挂链保持）', () => {
    const body = methodBody('private clearEnvironment(): void {');
    expect(body).toContain('this.skyRebake?.cancel()'); // 不跨环境触发（确定性记档口径）
    expect(body).toContain('this.skyRebake = null');
    expect(body).toContain('this.skyTuningPort = null');
    expect(body).toContain('this.sunLight = null'); // 只去引用——灯本体经 envGroup 释放链
    expect(body).toContain('this.pmrem?.dispose()'); // 018.2 释放链保持
  });

  it('skyTuning getter：只读访问面（SkyTuningPort | null）', () => {
    expect(source).toContain('get skyTuning(): SkyTuningPort | null');
  });

  it('renderFrame 帧路径零调参端口引用（PMREM 严禁进每帧路径——触发清单外零入口）', () => {
    const body = methodBody('renderFrame(): void {');
    expect(body.includes('skyTuning')).toBe(false);
    expect(body.includes('pmrem')).toBe(false);
    expect(body.includes('sunLight')).toBe(false);
  });
});
