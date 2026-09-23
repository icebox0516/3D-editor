/**
 * tests/runtime/environment/pmremEnvironment.test.ts —— PMREM / IBL 管线测试
 * （T018.2，D29.11/12/13）。
 *
 * 口径：node 无 WebGL——fromScene 经 LazyPmremBackend 工厂注入 mock generator
 * （WebGLRenderTarget 为纯 JS 对象，dispose 事件计数即释放证据，沿
 * environmentDisposal.test.ts 模式）；Renderer 接线为源码级结构断言
 * （renderFrame 帧路径零 PMREM 调用——PMREM 严禁进每帧路径的确定性口径）。
 *
 * 覆盖：
 * - fromScene 实参锁定：sigma=0 / near=1 / far=10000（虚拟相机覆盖天空盒对角
 *   ≈7794——PMREMGenerator 缺省 far=100 会整盒裁掉，依据 node_modules/three/src/
 *   extras/PMREMGenerator.js:107/:336）+ bakeScene 引用直传（非主 Scene）；
 * - LazyPmremBackend 惰性构造：未 bake 零构造、首烘建、复用、dispose 释放并复位、
 *   幂等；
 * - scene.environment 生效：bake 后挂接 owned RT 的 texture（CubeUVReflectionMapping
 *   口径，mock 与生产 _createRenderTarget 同款）；
 * - 事务提交：≥5 轮 bake owned 恒 1、旧 RT 每张恰释放一次、baked/retired 记账、
 *   scene.environment 恒为最新；bake 抛错即传播且上一份成功环境保持（不吞不降级
 *   ——fallback 归 018.3）；
 * - dispose：RT + generator + scene.environment 全释放、幂等、外部改写不误清、
 *   dispose 后 bake 短路；
 * - 主 Scene 防线：bakeScene === scene 构造拒绝（职责分离 D29.12）；
 * - 云参与烘焙（D29.11/12）：bakeScene 内 Sky 云四参与 displaySky 同源 +
 *   showSunDisc 常闭；阴天 patch → 恰一次重烘且重烘读取更新后的 bakeScene；
 * - Renderer 接线结构断言：renderFrame/renderModePasses 帧路径零 PMREM 调用；
 *   clearEnvironment PMREM 释放挂链（T018.3 起 applyEnvironment 侧接线断言在
 *   environmentSetup.test.ts——初烘/重烘/environmentIntensity 移入事务构建单元）。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
// Renderer 源码原文（vite ?raw，先例 tests/registries/StylePresetRegistry.test.ts）——
// node 无 WebGL，Renderer 接线以源码级结构断言锁定
import rendererSource from '../../../src/runtime/Renderer.ts?raw';
import {
  DEFAULT_ENVIRONMENT_INTENSITY,
  LazyPmremBackend,
  PMREM_BAKE_FAR,
  PMREM_BAKE_NEAR,
  PMREM_BAKE_SIGMA,
  PmremEnvironment,
} from '../../../src/runtime/environment/pmremEnvironment';
import type { PmremGeneratorLike } from '../../../src/runtime/environment/pmremEnvironment';
import { SKY_BOX_SCALE, SkyCore, skyUniformsOf } from '../../../src/runtime/environment/skyCore';
import { environmentPresetOf, skyAtmosphereOfPreset } from '../../../src/runtime/environment/environmentPresets';

/** day/dusk 预设大气/云参数（018.3 收口后经统一预设面取值） */
const SKY_PRESET_ATMOSPHERE = {
  day: skyAtmosphereOfPreset(environmentPresetOf('day')),
  dusk: skyAtmosphereOfPreset(environmentPresetOf('dusk')),
} as const;

/** mock generator：记录 fromScene 实参；每次返回新 RT（纯 JS 零 WebGL）；可注入失败 */
interface StubGenerator extends PmremGeneratorLike {
  readonly calls: ReadonlyArray<{ scene: THREE.Scene; sigma: number; near: number; far: number }>;
  readonly disposeCount: () => number;
  /** 让下一次 fromScene 抛错（失败语义测试；缺省参 -1 兜底显形） */
  failNext(): void;
}

function makeStubGenerator(): StubGenerator {
  const calls: { scene: THREE.Scene; sigma: number; near: number; far: number }[] = [];
  let disposes = 0;
  let failNext = false;
  return {
    calls,
    disposeCount: () => disposes,
    failNext() {
      failNext = true;
    },
    fromScene(scene, sigma = -1, near = -1, far = -1) {
      if (failNext) {
        failNext = false;
        throw new Error('mock fromScene 失败');
      }
      calls.push({ scene, sigma, near, far });
      const rt = new THREE.WebGLRenderTarget(64, 64);
      // 生产 PMREMGenerator._createRenderTarget 同款挂接映射（PMREMGenerator.js:718）
      rt.texture.mapping = THREE.CubeUVReflectionMapping;
      return rt;
    },
    dispose() {
      disposes += 1;
    },
  };
}

/** 单目标 dispose 事件计数（three EventDispatcher 语义，同 skyCore.test 口径） */
function countDisposes(rt: THREE.WebGLRenderTarget): () => number {
  let n = 0;
  rt.addEventListener('dispose', () => {
    n += 1;
  });
  return () => n;
}

/** 组装被测环境（真实 THREE.Scene + mock backend；bakeScene 独立可指定） */
function makeEnv(bakeScene = new THREE.Scene()) {
  const scene = new THREE.Scene();
  const generator = makeStubGenerator();
  const env = new PmremEnvironment({ scene, bakeScene, backend: new LazyPmremBackend(() => generator) });
  return { scene, bakeScene, generator, env };
}

describe('fromScene 实参锁定（虚拟相机覆盖天空盒）', () => {
  it('sigma=0 / near=1 / far=10000，bakeScene 引用直传（禁止主 Scene，D29.12）', () => {
    const { bakeScene, generator, env } = makeEnv();
    env.bake();
    env.bake();
    expect(generator.calls).toHaveLength(2);
    for (const call of generator.calls) {
      expect(call.scene).toBe(bakeScene);
      expect(call.sigma).toBe(0);
      expect(call.near).toBe(1);
      expect(call.far).toBe(10000);
    }
    env.dispose();
  });

  it('常量覆盖约束：far > 天空盒对角 √3/2·SKY_BOX_SCALE≈7794（缺省 far=100 整盒裁掉）；near < 半边 4500', () => {
    const diagonal = (Math.sqrt(3) / 2) * SKY_BOX_SCALE; // ≈7794.22（bakeSky 恒在原点，虚拟相机在原点）
    expect(PMREM_BAKE_FAR).toBeGreaterThan(diagonal);
    expect(PMREM_BAKE_NEAR).toBeLessThan(SKY_BOX_SCALE / 2);
    expect(PMREM_BAKE_NEAR).toBeGreaterThan(0);
    expect(PMREM_BAKE_SIGMA).toBe(0); // sigma 记档：0 起步（GGX 预过滤已按 roughness 分档）
    expect(DEFAULT_ENVIRONMENT_INTENSITY).toBe(1); // IBL 强度初值常量（差异化归 018.3/018.5）
  });
});

describe('LazyPmremBackend · 惰性构造与释放', () => {
  it('未 bake 零构造；首次 bake 建；同实例复用；dispose 释放恰一次并复位；幂等', () => {
    let constructed = 0;
    const generator = makeStubGenerator();
    const backend = new LazyPmremBackend(() => {
      constructed += 1;
      return generator;
    });
    expect(backend.generatorConstructed).toBe(false);
    expect(constructed).toBe(0); // 未烘焙会话零构造零开销（惰性）
    const scene = new THREE.Scene();
    backend.bake(scene, 0, 1, 10000);
    expect(constructed).toBe(1);
    expect(backend.generatorConstructed).toBe(true);
    backend.bake(scene, 0, 1, 10000); // 同一 backend 复用同一 generator
    expect(constructed).toBe(1);
    backend.dispose();
    expect(generator.disposeCount()).toBe(1);
    expect(backend.generatorConstructed).toBe(false);
    backend.dispose(); // 幂等
    expect(generator.disposeCount()).toBe(1);
  });
});

describe('PmremEnvironment · 挂接与事务提交', () => {
  it('bake 后 scene.environment = owned RT 的 texture（CubeUVReflectionMapping 挂接口径）', () => {
    const { scene, env } = makeEnv();
    env.bake();
    const rt = env.ownedRenderTarget;
    expect(rt).not.toBeNull();
    expect(scene.environment).toBe(rt!.texture);
    expect(scene.environment!.mapping).toBe(THREE.CubeUVReflectionMapping);
    expect(env.stats).toEqual({ baked: 1, retired: 0, owned: 1, live: 1 });
    env.dispose();
  });

  it('事务提交 7 轮：owned 恒 1、旧 RT 每张恰释放一次、environment 恒为最新', () => {
    const { scene, env } = makeEnv();
    const retiredCounts: Array<() => number> = [];
    const textures: Array<THREE.Texture> = [];
    for (let i = 0; i < 7; i++) {
      env.bake();
      const rt = env.ownedRenderTarget!;
      retiredCounts.push(countDisposes(rt)); // 旧 RT 在下一次 bake 的事务步释放
      textures.push(rt.texture);
      expect(env.stats.owned).toBe(1); // 稳态：当前 scene.environment 那一张（循环切换不增长）
      expect(scene.environment).toBe(textures[i]);
    }
    for (let i = 0; i < 6; i++) expect(retiredCounts[i]()).toBe(1); // 前 6 张全 retire
    expect(retiredCounts[6]()).toBe(0); // 第 7 张持有中
    expect(env.stats).toEqual({ baked: 7, retired: 6, owned: 1, live: 1 });
    env.dispose();
    expect(retiredCounts[6]()).toBe(1); // dispose 释放最后一张 → owned 0
    expect(env.stats.owned).toBe(0);
  });

  it('bake 抛错即传播：scene.environment / owned RT 保持上一份成功环境（不吞不降级，fallback 归 018.3）', () => {
    const { scene, generator, env } = makeEnv();
    env.bake();
    const firstTexture = scene.environment;
    generator.failNext();
    expect(() => env.bake()).toThrow('mock fromScene 失败');
    expect(scene.environment).toBe(firstTexture); // 天然事务性：赋值不发生
    expect(env.ownedRenderTarget!.texture).toBe(firstTexture);
    expect(env.stats).toEqual({ baked: 1, retired: 0, owned: 1, live: 1 });
    env.dispose();
  });
});

describe('PmremEnvironment · dispose 与防线', () => {
  it('dispose：RT 释放 + scene.environment=null + generator 释放；幂等', () => {
    const { scene, generator, env } = makeEnv();
    env.bake();
    const rt = env.ownedRenderTarget!;
    const disposed = countDisposes(rt);
    env.dispose();
    expect(disposed()).toBe(1);
    expect(scene.environment).toBeNull();
    expect(generator.disposeCount()).toBe(1);
    expect(env.stats).toEqual({ baked: 1, retired: 1, owned: 0, live: 0 });
    env.dispose(); // 幂等：零新增事件
    expect(disposed()).toBe(1);
    expect(generator.disposeCount()).toBe(1);
  });

  it('dispose 后 bake 短路（disposed 不复活）', () => {
    const { generator, env } = makeEnv();
    env.bake();
    env.dispose();
    env.bake();
    expect(generator.calls).toHaveLength(1);
  });

  it('environment 已被外部改写时 dispose 不误清（只摘本链挂接的纹理）', () => {
    const { scene, env } = makeEnv();
    env.bake();
    const external = new THREE.Texture();
    scene.environment = external;
    expect(env.stats.live).toBe(0); // 挂接已不由本实例持有
    env.dispose();
    expect(scene.environment).toBe(external); // 不误清外部设置
    expect(env.stats.owned).toBe(0); // RT 仍全量释放
  });

  it('bakeScene === 主 Scene 构造拒绝（职责分离，D29.12）', () => {
    const scene = new THREE.Scene();
    expect(
      () => new PmremEnvironment({ scene, bakeScene: scene, backend: new LazyPmremBackend(() => makeStubGenerator()) }),
    ).toThrow(/bakeScene 不得为主 Scene/);
  });
});

describe('云参与烘焙（D29.11/12）', () => {
  it('bakeScene 内 Sky 云四参与 displaySky 同源；showSunDisc 常闭（太阳盘烘焙保护）', () => {
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day);
    // bakeScene 只含 bakeSky（018.1 契约——从烘焙场景侧取对象再对照，锁定「烘焙消费到什么」
    const baked = core.bakeScene.children[0] as Sky;
    expect(baked).toBe(core.bakeSky);
    core.applyAtmosphere(SKY_PRESET_ATMOSPHERE.dusk);
    core.patchAtmosphere({ cloudCoverage: 0.77, cloudDensity: 0.66 });
    core.setSunDirection(12, 245);
    const d = skyUniformsOf(core.displaySky);
    const b = skyUniformsOf(core.bakeSky);
    for (const key of ['cloudCoverage', 'cloudDensity', 'cloudElevation', 'cloudScale'] as const) {
      expect(b[key].value).toBe(d[key].value); // 同源：阴天参数下 env 反射含云影响的事实基础
    }
    expect(b.showSunDisc.value).toBe(0); // bakeScene 侧太阳盘常闭
    expect(d.showSunDisc.value).toBe(1); // display 侧常开（对照）
    core.dispose();
  });

  it('阴天参数 patch → 恰一次重烘，且重烘读取更新后的 bakeScene（触发链路可测）', () => {
    const scene = new THREE.Scene();
    const generator = makeStubGenerator();
    let env!: PmremEnvironment;
    const core = new SkyCore(SKY_PRESET_ATMOSPHERE.day, undefined, () => env.bake());
    env = new PmremEnvironment({ scene, bakeScene: core.bakeScene, backend: new LazyPmremBackend(() => generator) });
    env.bake(); // 初烘（Renderer.applyEnvironment 同款显式驱动）
    expect(generator.calls).toHaveLength(1);
    core.patchAtmosphere({ cloudCoverage: 0.85, cloudDensity: 0.7 }); // 阴天方向
    expect(generator.calls).toHaveLength(2); // 写入口变更恰一次重烘
    expect(generator.calls[1]!.scene).toBe(core.bakeScene);
    expect(skyUniformsOf(core.bakeSky).cloudCoverage.value).toBe(0.85); // 重烘前云参数已入烘焙侧
    expect(scene.environment).toBe(env.ownedRenderTarget!.texture);
    env.dispose();
    core.dispose();
  });
});

describe('Renderer 接线 · 源码结构断言（node 无 WebGL 的确定性口径）', () => {
  const source = rendererSource;

  /** 提取类成员方法体（签名起点 → 首个 2 空格缩进闭括）；签名/边界漂移时显式失败 */
  function methodBody(signature: string): string {
    const start = source.indexOf(signature);
    if (start < 0) throw new Error(`Renderer.ts 方法签名漂移：找不到「${signature}」——需同步更新 T018.2 结构断言`);
    const end = source.indexOf('\n  }', start);
    if (end < 0) throw new Error(`Renderer.ts 方法体边界漂移：「${signature}」——需同步更新 T018.2 结构断言`);
    return source.slice(start, end);
  }

  it('renderFrame / renderModePasses 帧路径零 PMREM 调用（PMREM 严禁进每帧路径；相机移动/LOD/模型变化禁止触发）', () => {
    for (const body of [methodBody('renderFrame(): void {'), methodBody('private renderModePasses(): void {')]) {
      expect(body.includes('pmrem')).toBe(false);
      expect(body.includes('.bake(')).toBe(false);
    }
  });

  // T018.3 起 applyEnvironment 的初烘/重烘回调/environmentIntensity 接线移入
  // environment/environmentSetup（事务构建单元）——对应结构断言在
  // environmentSetup.test.ts「Renderer 接线」块维护，此处只保留 PMREM 侧链路。

  it('clearEnvironment：PMREM 释放挂入环境链（Renderer.dispose 经此自然覆盖）', () => {
    const body = methodBody('private clearEnvironment(): void {');
    expect(body).toContain('this.pmrem?.dispose()');
  });
});
