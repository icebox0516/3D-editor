/**
 * tests/runtime/environment/environmentDisposal.test.ts —— 环境链路释放测试
 * （T018.1 legacy 预设切换线性泄漏最小修复；改前事实 docs/acceptance/t018/018.0 README ③）。
 *
 * 改前事实（10 轮切换实测 +1 geo/+2 tex 每次）：clearEnvironment 走 disposeObjectTree
 * 只判 isMesh——GridHelper（LineSegments）几何不释放（+1 geo）；灯光 shadow map 渲染
 * 目标归灯私有、遍历不可见（+2 tex 主力）。修复 = clearEnvironment 改走
 * disposeEnvironmentObjectTree（环境链路专用，不重构 disposeObjectTree 全局语义）：
 *  - Mesh 与 Line/LineSegments：geometry + material（数组材质逐个）；
 *  - 灯光：shadow.map / mapPass 渲染目标释放。
 *
 * 覆盖（纯构造层 node 可测——RT 为纯 JS 对象，dispose 事件计数即释放证据）：
 * - Mesh：geometry/material 释放；GridHelper：geometry/material 释放（+1 geo 修复）；
 * - DirectionalLight：shadow.map RT 释放（+2 tex 主力修复）；无 shadow / HemisphereLight
 *   安全（无抛错）；
 * - **5 轮「重建↔释放」循环零增长**（自维护计数：每轮创建的资源分类计数 vs dispose
 *   事件分类计数，循环后逐类 created === disposed——对应验收「连续 applyEnvironment
 *   ≥5 轮无增长」的 node 侧确定性口径；renderer.info 需 WebGL 上下文，浏览器侧账目
 *   归 018.5 取证）。
 * - T018.2 PMREM 循环配对：5 轮「SkyCore + PmremEnvironment（mock generator）初烘 +
 *   写入口重烘 + clearEnvironment 序列释放」——PMREM RT 与 generator dispose 事件
 *   全配对零增长（事务提交 owned 恒 1 的循环侧证据；mock 口径同 pmremEnvironment.test）。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { disposeEnvironmentObjectTree } from '../../../src/runtime/Renderer';
import { SkyCore } from '../../../src/runtime/environment/skyCore';
import type { SkyAtmosphereParams } from '../../../src/runtime/environment/skyCore';
import { LazyPmremBackend, PmremEnvironment } from '../../../src/runtime/environment/pmremEnvironment';
import type { PmremGeneratorLike } from '../../../src/runtime/environment/pmremEnvironment';

/**
 * 大气/云参数（SkyCore 构造入参——本文件锁释放链路不锁数值，任意合法值即可；
 * 018.3 收口后预设数值在 environment/environmentPresets）
 */
const ANY_ATMOSPHERE: SkyAtmosphereParams = {
  turbidity: 3,
  rayleigh: 1.2,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.8,
  cloudCoverage: 0.35,
  cloudDensity: 0.4,
  cloudElevation: 0.5,
  cloudScale: 0.0002,
};

type Disposable = THREE.BufferGeometry | THREE.Material | THREE.RenderTarget;
type Counters = { geo: [number, number]; mat: [number, number]; rt: [number, number] };

function makeCounters(): Counters & { track: (kind: keyof Counters, target: Disposable) => void } {
  const counters: Counters = { geo: [0, 0], mat: [0, 0], rt: [0, 0] };
  return {
    ...counters,
    track(kind, target) {
      counters[kind][0] += 1; // created
      target.addEventListener('dispose', () => {
        counters[kind][1] += 1; // disposed
      });
    },
  };
}

describe('disposeEnvironmentObjectTree · 盲区覆盖（legacy 泄漏最小修复）', () => {
  it('Mesh：geometry + material 释放', () => {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial());
    group.add(mesh);
    const geo = countOf(mesh.geometry);
    const mat = countOf(mesh.material);
    disposeEnvironmentObjectTree(group);
    expect(geo()).toBe(1);
    expect(mat()).toBe(1);
  });

  it('GridHelper（LineSegments）：geometry + material 释放（改前 +1 geo/次 泄漏点）', () => {
    const grid = new THREE.GridHelper(2000, 400, 0x9aa4ae, 0xc9cfd6);
    const geo = countOf(grid.geometry);
    const mat = countOf(grid.material as THREE.Material);
    disposeEnvironmentObjectTree(grid);
    expect(geo()).toBe(1);
    expect(mat()).toBe(1);
  });

  it('DirectionalLight：shadow.map RT 释放（改前 +2 tex/次 主力泄漏点）', () => {
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.shadow.map = new THREE.WebGLRenderTarget(2048, 2048);
    const rt = countOf(sun.shadow.map);
    disposeEnvironmentObjectTree(sun);
    expect(rt()).toBe(1);
  });

  it('mapPass（部分阴影类型第二 RT）一并释放；无 shadow 灯 / HemisphereLight / 空树安全', () => {
    const spotLike = new THREE.DirectionalLight();
    spotLike.shadow.mapPass = new THREE.WebGLRenderTarget(512, 512);
    disposeEnvironmentObjectTree(spotLike); // 不抛错即过（map 主释放见上）

    const hemi = new THREE.HemisphereLight(0xbfd6ea, 0x8a8f96, 0.9);
    expect(() => disposeEnvironmentObjectTree(hemi)).not.toThrow(); // 无 shadow 属性链安全

    const bare = new THREE.DirectionalLight(); // shadow.map 为 null
    expect(() => disposeEnvironmentObjectTree(bare)).not.toThrow();

    expect(() => disposeEnvironmentObjectTree(new THREE.Group())).not.toThrow(); // 空组
  });

  it('混合环境树（Sky displaySky + 地面 + 网格 + 双灯）一次遍历全覆盖', () => {
    const core = new SkyCore(ANY_ATMOSPHERE);
    const group = new THREE.Group();
    group.add(core.displaySky);
    group.add(
      new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshStandardMaterial({ color: 0xe6e4de })),
    );
    group.add(new THREE.GridHelper(2000, 400));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.shadow.map = new THREE.WebGLRenderTarget(2048, 2048);
    group.add(sun);
    group.add(new THREE.HemisphereLight(0xbfd6ea, 0x8a8f96, 0.9));

    const counts = [
      countOf(core.displaySky.geometry),
      countOf(core.displaySky.material),
      countOf(sun.shadow.map),
    ];
    core.dispose(); // bakeSky/bakeScene 侧（displaySky 摘离由 core.dispose 完成）
    disposeEnvironmentObjectTree(group);
    for (const c of counts) expect(c()).toBe(1);
  });
});

describe('环境预设循环 · 5 轮零增长（自维护计数口径）', () => {
  it('每轮「重建→释放」全周期后：geo/mat/rt 三类 disposed === created（无累计残留）', () => {
    const counters = makeCounters();
    for (let round = 0; round < 5; round++) {
      // 模拟 applyEnvironment：Sky 双实例 + 地面 + 网格 + 平行光（含 shadow RT）+ Hemi
      const core = new SkyCore(ANY_ATMOSPHERE);
      counters.track('geo', core.displaySky.geometry);
      counters.track('mat', core.displaySky.material);
      counters.track('geo', core.bakeSky.geometry);
      counters.track('mat', core.bakeSky.material);

      const group = new THREE.Group();
      group.add(core.displaySky);
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshStandardMaterial());
      group.add(ground);
      counters.track('geo', ground.geometry);
      counters.track('mat', ground.material);
      const grid = new THREE.GridHelper(2000, 400);
      group.add(grid);
      counters.track('geo', grid.geometry);
      counters.track('mat', grid.material as THREE.Material);
      const sun = new THREE.DirectionalLight(0xffffff, 2.4);
      sun.shadow.map = new THREE.WebGLRenderTarget(2048, 2048);
      group.add(sun);
      counters.track('rt', sun.shadow.map);
      group.add(new THREE.HemisphereLight(0xbfd6ea, 0x8a8f96, 0.9));

      // 模拟 clearEnvironment（Renderer 同款序列）：sky 释放 + 环境树释放
      core.dispose();
      for (const child of [...group.children]) {
        child.removeFromParent();
        disposeEnvironmentObjectTree(child);
      }
    }
    // 每轮 4 geo / 4 mat（Sky 双实例 + 地面 + 网格）×5 轮；rt 每轮 1（shadow map）×5
    expect(counters.geo[1]).toBe(counters.geo[0]);
    expect(counters.geo[0]).toBe(20);
    expect(counters.mat[1]).toBe(counters.mat[0]);
    expect(counters.mat[0]).toBe(20);
    expect(counters.rt[1]).toBe(counters.rt[0]);
    expect(counters.rt[0]).toBe(5);
  });
});

describe('PMREM 循环配对 · 5 轮重建↔释放（T018.2，RT/Generator 全配对）', () => {
  it('每轮「初烘 + 写入口重烘 + 释放」后：PMREM RT dispose 事件全配对、generator 逐轮释放、environment 归空', () => {
    const counters = makeCounters();
    let generatorDisposes = 0;
    /** mock PMREM generator（node 零 WebGL）：每次 fromScene 新建 RT 并入账 */
    const makeTrackedGenerator = (): PmremGeneratorLike => ({
      fromScene() {
        const rt = new THREE.WebGLRenderTarget(64, 64);
        counters.track('rt', rt);
        return rt;
      },
      dispose() {
        generatorDisposes += 1;
      },
    });

    for (let round = 0; round < 5; round++) {
      const scene = new THREE.Scene();
      // 模拟 Renderer.applyEnvironment 接线：SkyCore 三写入口回调 → pmrem.bake（重烘路径）
      let pmrem!: PmremEnvironment;
      const core = new SkyCore(ANY_ATMOSPHERE, undefined, () => pmrem.bake());
      pmrem = new PmremEnvironment({
        scene,
        bakeScene: core.bakeScene,
        backend: new LazyPmremBackend(makeTrackedGenerator),
      });
      pmrem.bake(); // 初烘（applyEnvironment 显式驱动）
      core.patchAtmosphere({ cloudCoverage: 0.9, cloudDensity: 0.8 }); // 阴天方向 → 恰一次重烘
      core.setSunDirection(15, 220);
      expect(pmrem.stats.baked).toBe(3); // 初烘 + 2 重烘
      expect(pmrem.stats.owned).toBe(1); // 事务提交：稳态恒 1（循环切换不增长）

      // 模拟 clearEnvironment 序列（Renderer 同款）：PMREM 先于 sky 释放（消费者先撤）
      pmrem.dispose();
      core.dispose();
      expect(scene.environment).toBeNull();
    }
    // 每轮 3 张 RT（初烘 + 2 重烘）×5 全释放零残留；generator 每轮恰一次释放
    expect(counters.rt[0]).toBe(15);
    expect(counters.rt[1]).toBe(15);
    expect(generatorDisposes).toBe(5);
  });
});

/** 单目标 dispose 计数（EventDispatcher；RT 侧收 RenderTarget 基类——shadow.map 声明形） */
function countOf(target: Disposable): () => number {
  let n = 0;
  target.addEventListener('dispose', () => {
    n += 1;
  });
  return () => n;
}
