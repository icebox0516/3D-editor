/**
 * tests/runtime/environment/environmentSetup.test.ts —— 环境天空段事务式构建测试
 * （T018.3，D29.5 单一开关 / D29.4 正常路径零 Hemi）。
 *
 * 口径：node 无 WebGL——SkyCore 与 PmremEnvironment 均 node 可构造，PMREM 后端经
 * LazyPmremBackend 工厂注入 mock generator（018.2 先例）；Sky/PMREM 失败经构建工厂
 * 注入抛错锁定。Renderer 接线为源码级结构断言（?raw 先例）。
 *
 * 覆盖：
 * - 成功路径：mode 'sky'——displaySky 挂 envGroup、scene.environment = 初烘 RT、
 *   background null、无 Hemi、environmentIntensity = 预设 ibl（差异化接线：dusk 0.85）、
 *   displaySky uDisplayIntensity = 预设 displayIntensity（T018.5 显示域压缩接线：
 *   day 0.22 / tech 0.2【压缩对】/ dusk·night 1）；
 *   SkyCore 预设接线（大气八参 + 预设太阳角——非 day 角亦贯通）；
 * - **单一开关不变式**（共享断言，两分支同口径）：sky ⇔ environment 非空 ⇔ 无 Hemi ⇔
 *   background null；legacy ⇔ Hemi 存在 + background 渐变 + environment null + 无 sky
 *   ——无混合态（「真天空但无 IBL」禁止出现）；
 * - fallback 三注入路径：Sky 构造失败 / PMREM 初烘失败（backend bake 抛错）/ PMREM
 *   构造失败——均 legacy 完整路径 + console.error 记档 + 事务清理已建部分（初烘失败
 *   路径断言 SkyCore 全量释放：displaySky 摘离 + 双实例几何材质 dispose + bakeScene
 *   清空 + generator 释放）；
 * - **初烘失败 ≠ 重烘失败**：运行中写入口重烘抛错 → 不传播到写入口调用方 +
 *   scene.environment 保持旧 RT + console.error 记档不降级；后端恢复后下次写入口
 *   重烘正常提交（失败不留疤痕）；
 * - fallback 不粘死：同环境对象第一次失败 → legacy，清理后再调用（新工厂）→ sky
 *   模式成功（裁定纯粹基于本次调用）；
 * - createSkyTexture：node 无 DOM 回退 THREE.Color(topColor)（浏览器侧为 CanvasTexture
 *   ——渐变背景 fallback 素材的两种形态）；
 * - Renderer 接线结构断言：applyEnvironment 经 setupSkyEnvironment 构建 + 预设面收口
 *   （environmentPresetOf 查表）+ legacy 太阳方向 day 常量口径；Renderer 全文件零
 *   `new THREE.HemisphereLight`（D29.4——Hemi 仅存在于构建单元 fallback 分支）。
 * - T018.4：重烘回调经 SkyRebake debounce 包层（回调上游）——本文件注入同步调度器
 *   保持全部既有同步断言语义；sky 模式结果带出 rebake 端口、debounce 合并/跨环境
 *   取消语义归 skyRebake.test.ts。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import rendererSource from '../../../src/runtime/Renderer.ts?raw';
import { environmentPresetOf } from '../../../src/runtime/environment/environmentPresets';
import {
  createSkyTexture,
  defaultSkyCoreFactory,
  setupSkyEnvironment,
} from '../../../src/runtime/environment/environmentSetup';
import type { SkyCoreFactory } from '../../../src/runtime/environment/environmentSetup';
import { LazyPmremBackend, PmremEnvironment } from '../../../src/runtime/environment/pmremEnvironment';
import type { PmremGeneratorLike } from '../../../src/runtime/environment/pmremEnvironment';
import type { RebakeScheduler } from '../../../src/runtime/environment/skyRebake';
import { SkyCore, displaySkyUniformsOf, skyUniformsOf } from '../../../src/runtime/environment/skyCore';
import { sunDirectionOf } from '../../../src/runtime/environment/sunDirection';

/**
 * 同步重烘调度器（T018.4 注入面）：trigger 即执行——「写入口变更后恰一次重烘」的既有
 * 断言语义在此注入面下逐位保持（生产 = TIMER_REBAKE_SCHEDULER + 200ms debounce，
 * debounce 单元语义见 skyRebake.test.ts）。
 */
const SYNC_REBAKE_SCHEDULER: RebakeScheduler = {
  schedule(fn) {
    fn();
    return () => {};
  },
};

/** mock generator：记录 fromScene 尝试/成功；每次新 RT（纯 JS 零 WebGL）；可注入失败 */
function makeStubGenerator() {
  const calls: { scene: THREE.Scene; sigma: number; near: number; far: number }[] = [];
  let attempts = 0;
  let disposes = 0;
  let failNext = false;
  let failAll = false;
  const generator: PmremGeneratorLike = {
    fromScene(scene, sigma = -1, near = -1, far = -1) {
      attempts += 1;
      if (failNext || failAll) {
        failNext = false;
        throw new Error('mock fromScene 失败');
      }
      calls.push({ scene, sigma, near, far });
      const rt = new THREE.WebGLRenderTarget(64, 64);
      rt.texture.mapping = THREE.CubeUVReflectionMapping;
      return rt;
    },
    dispose() {
      disposes += 1;
    },
  };
  return {
    generator,
    calls,
    attempts: () => attempts,
    disposeCount: () => disposes,
    failNext() {
      failNext = true;
    },
    /** 持续失败（重烘语义测试：多次写入口均失败不替换旧环境） */
    failAll() {
      failAll = true;
    },
    recover() {
      failAll = false;
    },
  };
}

/** 组装被测依赖（真实 SkyCore + mock backend PMREM；preset 可选差异化） */
function makeDeps(presetId: string = 'day') {
  const scene = new THREE.Scene();
  const envGroup = new THREE.Group();
  const stub = makeStubGenerator();
  const deps = {
    scene,
    envGroup,
    preset: environmentPresetOf(presetId),
    // T018.4：注入同步调度器——重烘回调同步执行（既有断言语义零变化；生产缺省
    // TIMER_REBAKE_SCHEDULER，debounce 合并/取消语义归 skyRebake.test.ts）
    rebakeScheduler: SYNC_REBAKE_SCHEDULER,
    createSky: defaultSkyCoreFactory,
    createPmrem: (targetScene: THREE.Scene, bakeScene: THREE.Scene) =>
      new PmremEnvironment({
        scene: targetScene,
        bakeScene,
        backend: new LazyPmremBackend(() => stub.generator),
      }),
  };
  return { scene, envGroup, stub, deps };
}

/** envGroup 子树按类型收集（不变式断言用） */
function collectByType<T extends THREE.Object3D>(root: THREE.Object3D, ctor: new (...args: never[]) => T): T[] {
  const found: T[] = [];
  root.traverse((node) => {
    if (node instanceof ctor) found.push(node);
  });
  return found;
}

/**
 * 单一开关不变式（D29.5，两分支同口径共享断言）：状态二选一无混合态——
 * sky 模式 ⇔ { Sky 存在 · environment 非空 · 无 Hemi · background null }；
 * legacy 模式 ⇔ { Hemi 存在 · background 非空 · environment null · 无 Sky }。
 */
function assertSingleSwitchState(scene: THREE.Scene, envGroup: THREE.Group, mode: 'sky' | 'legacy'): void {
  const hemis = collectByType(envGroup, THREE.HemisphereLight);
  const skies = collectByType(envGroup, Sky);
  if (mode === 'sky') {
    expect(skies, 'sky 模式：displaySky 挂 envGroup').toHaveLength(1);
    expect(scene.environment, 'sky 模式：IBL 非空（无「真天空但无 IBL」混合态）').not.toBeNull();
    expect(hemis, 'sky 模式：无 Hemi（D29.4）').toHaveLength(0);
    expect(scene.background, 'sky 模式：background null').toBeNull();
  } else {
    expect(hemis, 'legacy 模式：Hemi 存在').toHaveLength(1);
    expect(scene.background, 'legacy 模式：渐变 background 非空').not.toBeNull();
    expect(scene.environment, 'legacy 模式：environment null').toBeNull();
    expect(skies, 'legacy 模式：无 Sky 残留').toHaveLength(0);
  }
}

/** 单目标 dispose 事件计数（three EventDispatcher 语义） */
function countDisposes(target: THREE.BufferGeometry | THREE.Material): () => number {
  let n = 0;
  target.addEventListener('dispose', () => {
    n += 1;
  });
  return () => n;
}

describe('setupSkyEnvironment · 成功路径（新路径 + 预设接线）', () => {
  it('mode sky：displaySky 挂 envGroup / environment = 初烘 RT / background null / 无 Hemi / 初烘恰一次', () => {
    const { scene, envGroup, stub, deps } = makeDeps('day');
    const outcome = setupSkyEnvironment(deps);
    expect(outcome.mode).toBe('sky');
    assertSingleSwitchState(scene, envGroup, 'sky');
    if (outcome.mode !== 'sky') return; // 判别收窄（上方断言已锁定）
    expect(scene.environment).toBe(outcome.pmrem.ownedRenderTarget!.texture);
    expect(outcome.pmrem.stats).toEqual({ baked: 1, retired: 0, owned: 1, live: 1 });
    expect(stub.calls).toHaveLength(1); // 初烘恰一次（构造期零重烘）
    expect(stub.calls[0]!.scene).toBe(outcome.sky.bakeScene); // bakeScene 直传（D29.12）
    // 显示域压缩预设接线（T018.5）：构建期一次写入 displaySky 单侧强度（day 0.22）；
    // display-only 单侧——初烘恰一次（上方）不受影响（不触发重烘、不进 bakeSky）
    expect(displaySkyUniformsOf(outcome.sky.displaySky).uDisplayIntensity.value).toBe(0.22);
    outcome.pmrem.dispose();
    outcome.sky.dispose();
  });

  it('SkyCore 预设接线：大气八参 + 预设太阳角（dusk 5°/240° 非 day 角亦贯通——差异化首次生效）', () => {
    const { scene, deps } = makeDeps('dusk');
    const outcome = setupSkyEnvironment(deps);
    expect(outcome.mode).toBe('sky');
    if (outcome.mode !== 'sky') return;
    const preset = environmentPresetOf('dusk');
    const u = skyUniformsOf(outcome.sky.displaySky);
    expect(u.turbidity.value).toBe(preset.atmosphere.turbidity);
    expect(u.rayleigh.value).toBe(preset.atmosphere.rayleigh);
    expect(u.cloudCoverage.value).toBe(preset.cloud.cloudCoverage);
    const expected = sunDirectionOf(preset.sun.elevationDeg, preset.sun.azimuthDeg);
    expect(u.sunPosition.value.x).toBeCloseTo(expected.x, 12);
    expect(u.sunPosition.value.y).toBeCloseTo(expected.y, 12);
    expect(u.sunPosition.value.z).toBeCloseTo(expected.z, 12);
    // IBL 强度预设差异化接线（day 0.15 / dusk 0.85——018.5 重锚后 day/tech 为最低 ibl 压缩对）
    expect(scene.environmentIntensity).toBe(preset.iblIntensity);
    expect(preset.iblIntensity).not.toBe(1);
    // displayIntensity 预设接线（dusk 1：低太阳正对机位的自然眩光非过曝，018.5 终值；
    // day/tech 为唯二走显示域压缩的预设）
    expect(displaySkyUniformsOf(outcome.sky.displaySky).uDisplayIntensity.value).toBe(preset.displayIntensity);
    expect(preset.displayIntensity).toBe(1);
    outcome.pmrem.dispose();
    outcome.sky.dispose();
  });
});

describe('setupSkyEnvironment · fallback 注入路径（D29.5 事务降级）', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('Sky 构造失败 → legacy 完整路径（PMREM 零触达 + console.error 记档）', () => {
    const { scene, envGroup, stub, deps } = makeDeps('night');
    const failingSky: SkyCoreFactory = () => {
      throw new Error('mock Sky 构造失败');
    };
    const outcome = setupSkyEnvironment({ ...deps, createSky: failingSky });
    expect(outcome.mode).toBe('legacy');
    if (outcome.mode !== 'legacy') return;
    expect(outcome.reason).toContain('mock Sky 构造失败');
    assertSingleSwitchState(scene, envGroup, 'legacy');
    // legacy Hemi 参数 = 预设 ambient* 键（fallback 素材消费面）
    const preset = environmentPresetOf('night');
    expect(outcome.hemi.color.getHex()).toBe(preset.ambientSky);
    expect(outcome.hemi.groundColor.getHex()).toBe(preset.ambientGround);
    expect(outcome.hemi.intensity).toBe(preset.ambientIntensity);
    // 渐变背景（node 无 DOM → Color 回退形态，色 = skyTop）
    expect(scene.background).toBeInstanceOf(THREE.Color);
    expect((scene.background as THREE.Color).getHexString()).toBe(preset.skyTop.slice(1));
    // PMREM 未触达：构造工厂未执行、零 bake、零 generator 释放
    expect(stub.calls).toHaveLength(0);
    expect(stub.disposeCount()).toBe(0);
    // 失败可见性：console.error 记档原因（不静默降级）
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('降级'), expect.any(Error));
  });

  it('PMREM 初烘失败（backend bake 抛错）→ legacy 完整路径 + 事务清理已建 SkyCore', () => {
    const { scene, envGroup, stub, deps } = makeDeps('day');
    stub.failNext(); // 首次 bake（初烘）抛错
    // 包一层记录构造产物（事务清理证据：已建的 SkyCore 须全量释放）
    let created: SkyCore | null = null;
    const recordingSky: SkyCoreFactory = (atmosphere, sun, onParamsChanged) => {
      created = new SkyCore(atmosphere, sun, onParamsChanged);
      return created;
    };
    const outcome = setupSkyEnvironment({ ...deps, createSky: recordingSky });
    expect(outcome.mode).toBe('legacy');
    if (outcome.mode !== 'legacy') return;
    assertSingleSwitchState(scene, envGroup, 'legacy');
    // 事务清理：SkyCore 全量释放——displaySky 摘离 envGroup + bakeScene 清空 +
    // generator（backend）释放（消费者先撤同序）；初烘尝试恰一次（fromScene 抛错，
    // 成功调用记录为 0）
    expect(stub.attempts()).toBe(1);
    expect(stub.calls).toHaveLength(0);
    expect(stub.disposeCount()).toBe(1);
    const sky = created!;
    expect(sky.displaySky.parent).toBeNull();
    expect(sky.bakeScene.children).toHaveLength(0);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('降级'), expect.any(Error));
  });

  it('PMREM 构造失败 → legacy 完整路径（第三注入路径：事务覆盖 PMREM 构造步）', () => {
    const { scene, envGroup, deps } = makeDeps('tech');
    const outcome = setupSkyEnvironment({
      ...deps,
      createPmrem: () => {
        throw new Error('mock PMREM 构造失败');
      },
    });
    expect(outcome.mode).toBe('legacy');
    if (outcome.mode !== 'legacy') return;
    expect(outcome.reason).toContain('mock PMREM 构造失败');
    assertSingleSwitchState(scene, envGroup, 'legacy');
    const preset = environmentPresetOf('tech');
    expect(outcome.hemi.color.getHex()).toBe(preset.ambientSky);
    expect(scene.environmentIntensity).toBe(1); // legacy 复位 DEFAULT（无 env 时无效应）
    expect(errorSpy).toHaveBeenCalled();
  });

  it('初烘失败的事务清理逐资源证据：双 Sky 几何/材质各恰释放一次（监听挂构造期先于清理）', () => {
    const { scene, stub, deps } = makeDeps('day');
    stub.failNext();
    let geoCounts: Array<() => number> = [];
    let matCounts: Array<() => number> = [];
    const outcome = setupSkyEnvironment({
      ...deps,
      createSky: (atmosphere, sun, onParamsChanged) => {
        const sky = new SkyCore(atmosphere, sun, onParamsChanged);
        geoCounts = [sky.displaySky.geometry, sky.bakeSky.geometry].map(countDisposes);
        matCounts = [sky.displaySky.material, sky.bakeSky.material].map(countDisposes);
        return sky;
      },
    });
    expect(outcome.mode).toBe('legacy');
    // 事务清理恰一次释放：四目标（双实例几何/材质）各 dispose 事件 1 次（无泄漏无双释放）
    for (const c of geoCounts) expect(c()).toBe(1);
    for (const c of matCounts) expect(c()).toBe(1);
    expect(scene.environment).toBeNull();
    expect(scene.background).not.toBeNull();
    expect(stub.disposeCount()).toBe(1);
  });
});

describe('setupSkyEnvironment · 运行中重烘失败（≠ 初烘失败，D29.5）', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('写入口重烘抛错：不传播到调用方 + environment 保持旧 RT + console.error 记档不降级', () => {
    const { scene, envGroup, stub, deps } = makeDeps('day');
    const outcome = setupSkyEnvironment(deps);
    expect(outcome.mode).toBe('sky');
    if (outcome.mode !== 'sky') return;
    const firstRT = outcome.pmrem.ownedRenderTarget!;
    const firstTexture = scene.environment;
    stub.failAll(); // 持续失败：两个写入口的重烘均抛错（不替换旧环境）
    // SkyCore 三写入口 → 重烘回调（构建单元内 catch）：异常不传播到写入口调用方
    expect(() => outcome.sky.patchAtmosphere({ cloudCoverage: 0.9, cloudDensity: 0.8 })).not.toThrow();
    expect(() => outcome.sky.setSunDirection(12, 245)).not.toThrow();
    // 旧 environment 保持（天然事务性：失败赋值不发生）+ 不降级（sky/displaySky 无恙）
    expect(scene.environment).toBe(firstTexture);
    expect(scene.environment).toBe(firstRT.texture);
    assertSingleSwitchState(scene, envGroup, 'sky');
    // 记档不降级：console.error 各恰一次，无 fallback 降级日志
    expect(errorSpy).toHaveBeenCalledTimes(2);
    for (const call of errorSpy.mock.calls) {
      expect(String(call[0])).toContain('重烘');
    }
    // 失败 bake 不入账（baked 仍 1，owned 不变）
    expect(outcome.pmrem.stats).toEqual({ baked: 1, retired: 0, owned: 1, live: 1 });
    outcome.pmrem.dispose();
    outcome.sky.dispose();
  });

  it('后端恢复后下次写入口重烘正常提交（失败不留疤痕：新 RT 替换 + 旧 RT 释放）', () => {
    const { scene, stub, deps } = makeDeps('day');
    const outcome = setupSkyEnvironment(deps);
    if (outcome.mode !== 'sky') throw new Error('预期 sky 模式');
    const firstRT = outcome.pmrem.ownedRenderTarget!;
    let firstDisposed = 0;
    firstRT.addEventListener('dispose', () => {
      firstDisposed += 1;
    });
    stub.failNext();
    outcome.sky.setSunDirection(30, 200); // 失败重烘（catch 吞）
    outcome.sky.setSunDirection(30, 201); // 恢复后重烘（正常提交）
    expect(outcome.pmrem.stats).toEqual({ baked: 2, retired: 1, owned: 1, live: 1 });
    expect(scene.environment).toBe(outcome.pmrem.ownedRenderTarget!.texture);
    expect(firstDisposed).toBe(1); // 事务替换：旧 RT 恰释放一次
    outcome.pmrem.dispose();
    outcome.sky.dispose();
  });
});

describe('setupSkyEnvironment · fallback 不粘死（每次调用重新尝试新路径）', () => {
  it('同环境对象：第一次 Sky 构造失败 → legacy；清理后再调用（工厂恢复）→ sky 模式成功', () => {
    const { scene, envGroup, stub, deps } = makeDeps('day');
    let skyFails = true;
    const togglingSky: SkyCoreFactory = (atmosphere, sun, onParamsChanged) => {
      if (skyFails) throw new Error('mock Sky 构造失败（第一次）');
      return new SkyCore(atmosphere, sun, onParamsChanged);
    };
    // 第一次：失败 → legacy
    const first = setupSkyEnvironment({ ...deps, createSky: togglingSky });
    expect(first.mode).toBe('legacy');
    assertSingleSwitchState(scene, envGroup, 'legacy');
    // 模拟 clearEnvironment（Renderer 切换预设序列：legacy 环境整组释放）
    for (const child of [...envGroup.children]) child.removeFromParent();
    scene.background = null;
    // 第二次：工厂恢复 → 新路径成功（裁定无粘死状态）
    skyFails = false;
    const second = setupSkyEnvironment({ ...deps, createSky: togglingSky });
    expect(second.mode).toBe('sky');
    if (second.mode === 'sky') {
      assertSingleSwitchState(scene, envGroup, 'sky');
      second.pmrem.dispose();
      second.sky.dispose();
    }
    expect(stub.calls).toHaveLength(1); // 仅第二次初烘
  });
});

describe('createSkyTexture · legacy 渐变素材', () => {
  it('node 无 DOM 回退 THREE.Color(topColor)；色值逐位一致', () => {
    const result = createSkyTexture('#2e3a5c', '#e8927c');
    if (typeof document === 'undefined') {
      expect(result).toBeInstanceOf(THREE.Color);
      expect((result as THREE.Color).getHexString()).toBe('2e3a5c');
    } else {
      // 浏览器/happy-dom 形态：CanvasTexture + SRGBColorSpace（形态分支，node 侧不达）
      expect(result).toBeInstanceOf(THREE.Texture);
      expect((result as THREE.Texture).colorSpace).toBe(THREE.SRGBColorSpace);
    }
  });
});

describe('Renderer 接线 · 源码结构断言（node 无 WebGL 的确定性口径，018.2 先例）', () => {
  const source = rendererSource;

  /** 提取类成员方法体（签名起点 → 首个 2 空格缩进闭括）；签名/边界漂移时显式失败 */
  function methodBody(signature: string): string {
    const start = source.indexOf(signature);
    if (start < 0) throw new Error(`Renderer.ts 方法签名漂移：找不到「${signature}」——需同步更新 T018.3 结构断言`);
    const end = source.indexOf('\n  }', start);
    if (end < 0) throw new Error(`Renderer.ts 方法体边界漂移：「${signature}」——需同步更新 T018.3 结构断言`);
    return source.slice(start, end);
  }

  it('applyEnvironment：经 setupSkyEnvironment 事务构建 + environmentPresetOf 统一预设面查表', () => {
    const body = methodBody('applyEnvironment(env: SceneEnvironment): void {');
    expect(body).toContain('setupSkyEnvironment({');
    expect(body).toContain('environmentPresetOf(env.preset)');
    expect(body).toContain('defaultSkyCoreFactory');
    expect(body).toContain('createRendererPmremFactory(this.renderer)');
    // sky 模式句柄记入实例字段（renderFrame 相机跟随 / clearEnvironment 释放链消费）
    expect(body).toContain('this.sky = skyEnv.sky');
    expect(body).toContain('this.pmrem = skyEnv.pmrem');
  });

  it('applyEnvironment：legacy 分支太阳方向 = day 常量口径 + Hemi 灯光层例外', () => {
    const body = methodBody('applyEnvironment(env: SceneEnvironment): void {');
    expect(body).toContain('sunDirectionOf(DAY_SUN_ELEVATION_DEG, DAY_SUN_AZIMUTH_DEG)');
    expect(body).toContain("skyEnv.mode === 'sky'"); // 方向源按分支
    expect(body).toContain("skyEnv.mode === 'legacy'");
    expect(body).toContain('skyEnv.hemi.layers.enableAll()');
  });

  it('Renderer 全文件零 HemisphereLight 构造（D29.4 正常路径零 Hemi——fallback 构造在 environmentSetup）', () => {
    expect(source.includes('new THREE.HemisphereLight')).toBe(false);
  });

  it('预设面收口：Renderer 零本地预设数值表（表在 environment/environmentPresets）', () => {
    expect(source).toContain("from './environment/environmentPresets'");
    expect(source).toContain("from './environment/environmentSetup'");
    // 旧本地表特征（skyTop/sunIntensity 顶层键）不再出现于 Renderer
    expect(source.includes('sunIntensity')).toBe(false);
    expect(source.includes('ambientSky')).toBe(false);
  });
});
