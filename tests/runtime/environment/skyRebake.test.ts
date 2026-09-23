/**
 * tests/runtime/environment/skyRebake.test.ts —— PMREM 重烘 debounce 层测试
 * （T018.4，D29 裁决 Q6）。
 *
 * 口径：调度器注入面（沿 LazyPmremBackend 工厂注入先例）——手动调度器（测试驱动
 * fire，取消生效性以「fire 返回被触发的 fn」为直接证据）/ 同步调度器（立即执行，
 * 「写入口变更后恰一次重烘」既有断言语义的注入面形态）/ 生产 TIMER_REBAKE_SCHEDULER
 * 经 fake timers 锁定真实计时器语义；setupSkyEnvironment 集成（deps.rebakeScheduler
 * 注入）验证写入口回调上游包层与跨环境取消。
 *
 * 覆盖：
 * - 合并：连续 N 次 trigger → schedule N 次（每次替换旧 pending）但停手 fire 后恰一次
 *   执行、再 fire 无 pending；调度延迟 = REBAKE_DEBOUNCE_MS（200 记档依据见模块头注）；
 * - 取消：cancel 后 pending 消失（fire 零触发，取消函数被调用）；幂等（无 pending 再
 *   cancel 零调用）；
 * - flush（rebake() 强制入口语义）：pending 存在时立即执行恰一次且旧 pending 消费掉
 *  （fire 不得二次触发）；无 pending 直通执行；
 * - 同步调度器：trigger 即执行——「写入口变更后恰一次重烘」逐位一致（注入面不改语义）；
 * - 生产调度器（fake timers）：199ms 零触发 / 200ms 恰触发（TIMER_REBAKE_SCHEDULER
 *   = setTimeout/clearTimeout 的行为锁定）；
 * - setupSkyEnvironment 集成：sky 模式结果带出 rebake 端口；写入口（patchAtmosphere/
 *   setSunDirection）经 debounce 触发（手动调度器下 pending 可见、fire 后恰一次重烘）；
 *   初烘不经 debounce（构造即一次）；
 * - **跨环境取消**：环境 A 写入口 pending → 模拟 clearEnvironment 序列（cancel →
 *   pmrem/sky 释放）→ 环境切换后 fire——旧 timer 零触发、新环境只有初烘（「pending
 *   取消：环境切换后旧 timer 不触发新环境重烘」）。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import {
  REBAKE_DEBOUNCE_MS,
  SkyRebake,
  TIMER_REBAKE_SCHEDULER,
} from '../../../src/runtime/environment/skyRebake';
import type { RebakeScheduler } from '../../../src/runtime/environment/skyRebake';
import { environmentPresetOf } from '../../../src/runtime/environment/environmentPresets';
import { defaultSkyCoreFactory, setupSkyEnvironment } from '../../../src/runtime/environment/environmentSetup';
import { LazyPmremBackend, PmremEnvironment } from '../../../src/runtime/environment/pmremEnvironment';
import type { PmremGeneratorLike } from '../../../src/runtime/environment/pmremEnvironment';

/**
 * 手动调度器：pending 单槽（trigger 替换旧 pending = 合并语义）；fire 返回被触发的
 * fn（null = 无 pending——取消生效的直接证据）。
 */
function makeManualScheduler(): RebakeScheduler & {
  fire(): (() => void) | null;
  hasPending(): boolean;
  pendingDelay(): number | null;
  scheduleCount(): number;
  cancelCount(): number;
} {
  let pending: (() => void) | null = null;
  let pendingDelay: number | null = null;
  let schedules = 0;
  let cancels = 0;
  return {
    schedule(fn, delayMs) {
      schedules += 1;
      pending = fn;
      pendingDelay = delayMs;
      return () => {
        cancels += 1;
        pending = null;
        pendingDelay = null;
      };
    },
    fire() {
      const fn = pending;
      pending = null;
      pendingDelay = null;
      fn?.();
      return fn;
    },
    hasPending: () => pending !== null,
    pendingDelay: () => pendingDelay,
    scheduleCount: () => schedules,
    cancelCount: () => cancels,
  };
}

/** 同步调度器：schedule 即执行（既有「写入口变更后恰一次重烘」断言的注入面形态） */
const SYNC_SCHEDULER: RebakeScheduler = {
  schedule(fn) {
    fn();
    return () => {};
  },
};

/** mock generator（fromScene 计数口径，同 pmremEnvironment.test 最小面） */
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

describe('SkyRebake · debounce 合并（D29 Q6）', () => {
  it('连续 N 次 trigger → 停手 fire 恰一次执行；再 fire 无 pending（无二次触发）', () => {
    const manual = makeManualScheduler();
    let fired = 0;
    const debounced = new SkyRebake(
      () => {
        fired += 1;
      },
      manual,
    );
    for (let i = 0; i < 10; i++) debounced.trigger(); // 逐参/拖动场景：连续写入口
    expect(manual.scheduleCount()).toBe(10); // 每次都调度（替换旧 pending）
    expect(manual.hasPending()).toBe(true);
    expect(fired).toBe(0); // 停手前零执行
    expect(manual.fire()).toBeTypeOf('function'); // 触发一次
    expect(fired).toBe(1); // 恰一次重烘（合并）
    expect(manual.fire()).toBeNull(); // pending 已消费
    expect(fired).toBe(1);
  });

  it('调度延迟 = REBAKE_DEBOUNCE_MS（200ms 记档：150–300 量级取中，依据见模块头注）', () => {
    const manual = makeManualScheduler();
    const debounced = new SkyRebake(() => {}, manual);
    debounced.trigger();
    expect(manual.pendingDelay()).toBe(REBAKE_DEBOUNCE_MS);
    expect(REBAKE_DEBOUNCE_MS).toBeGreaterThanOrEqual(150);
    expect(REBAKE_DEBOUNCE_MS).toBeLessThanOrEqual(300);
  });

  it('pending 期间再 trigger：旧 pending 被替换（单槽——始终只欠一次执行）', () => {
    const manual = makeManualScheduler();
    let fired = 0;
    const debounced = new SkyRebake(
      () => {
        fired += 1;
      },
      manual,
    );
    debounced.trigger();
    expect(fired).toBe(0);
    debounced.trigger(); // pending 期间再触发：替换而非追加
    expect(manual.scheduleCount()).toBe(2);
    expect(fired).toBe(0);
    manual.fire();
    expect(fired).toBe(1); // 只欠一次：合并语义
  });
});

describe('SkyRebake · cancel / flush', () => {
  it('cancel：pending 消失（fire 零触发）+ 调度器取消函数被调用；幂等', () => {
    const manual = makeManualScheduler();
    let fired = 0;
    const debounced = new SkyRebake(
      () => {
        fired += 1;
      },
      manual,
    );
    debounced.trigger();
    expect(manual.hasPending()).toBe(true);
    debounced.cancel();
    expect(manual.hasPending()).toBe(false);
    expect(manual.cancelCount()).toBe(1); // 显式取消（确定性记档口径）
    expect(manual.fire()).toBeNull(); // 旧 timer 不触发
    expect(fired).toBe(0);
    debounced.cancel(); // 幂等：无 pending 再 cancel 零新增取消调用
    expect(manual.cancelCount()).toBe(1);
  });

  it('flush：pending 存在时立即执行恰一次且旧 pending 消费掉（fire 不得二次触发）', () => {
    const manual = makeManualScheduler();
    let fired = 0;
    const debounced = new SkyRebake(
      () => {
        fired += 1;
      },
      manual,
    );
    debounced.trigger();
    debounced.flush();
    expect(fired).toBe(1); // 立即执行
    expect(manual.hasPending()).toBe(false); // pending 已消费
    expect(manual.fire()).toBeNull(); // 双执行防线：旧 timer 不得再触发
    expect(fired).toBe(1);
  });

  it('flush 无 pending 直通执行（rebake() 强制入口语义）', () => {
    const manual = makeManualScheduler();
    let fired = 0;
    const debounced = new SkyRebake(
      () => {
        fired += 1;
      },
      manual,
    );
    debounced.flush();
    expect(fired).toBe(1);
  });
});

describe('SkyRebake · 调度器注入面', () => {
  it('同步调度器：trigger 即执行——「写入口变更后恰一次重烘」逐位一致（注入面不改语义）', () => {
    let fired = 0;
    const debounced = new SkyRebake(
      () => {
        fired += 1;
      },
      SYNC_SCHEDULER,
    );
    debounced.trigger();
    expect(fired).toBe(1); // 立即执行（同步口径）
    debounced.trigger();
    expect(fired).toBe(2); // 每次写入口各恰一次
  });

  it('生产调度器 TIMER_REBAKE_SCHEDULER：199ms 零触发 / 200ms 恰触发（真实计时器语义）', () => {
    vi.useFakeTimers();
    try {
      let fired = 0;
      const debounced = new SkyRebake(() => {
        fired += 1;
      }); // 缺省 = TIMER_REBAKE_SCHEDULER + REBAKE_DEBOUNCE_MS
      debounced.trigger();
      vi.advanceTimersByTime(REBAKE_DEBOUNCE_MS - 1);
      expect(fired).toBe(0);
      vi.advanceTimersByTime(1);
      expect(fired).toBe(1);
      // clearTimeout 语义：trigger 替换后旧 timer 不触发
      debounced.trigger();
      debounced.trigger();
      vi.advanceTimersByTime(REBAKE_DEBOUNCE_MS);
      expect(fired).toBe(2); // 两次 trigger 合并为一次
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('setupSkyEnvironment · debounce 集成（写入口回调上游包层）', () => {
  /** 组装被测环境（真实 SkyCore + mock backend + 指定调度器） */
  function makeEnv(scheduler: RebakeScheduler, presetId = 'day') {
    const scene = new THREE.Scene();
    const envGroup = new THREE.Group();
    const stub = makeStubGenerator();
    const deps = {
      scene,
      envGroup,
      preset: environmentPresetOf(presetId),
      rebakeScheduler: scheduler,
      createSky: defaultSkyCoreFactory,
      createPmrem: (targetScene: THREE.Scene, bakeScene: THREE.Scene) =>
        new PmremEnvironment({ scene: targetScene, bakeScene, backend: new LazyPmremBackend(() => stub.generator) }),
    };
    return { scene, envGroup, stub, deps };
  }

  it('sky 模式结果带出 rebake 端口；初烘不经 debounce（构造即一次）', () => {
    const manual = makeManualScheduler();
    const { deps } = makeEnv(manual);
    const outcome = setupSkyEnvironment(deps);
    expect(outcome.mode).toBe('sky');
    if (outcome.mode !== 'sky') return;
    expect(outcome.rebake).toBeDefined();
    expect(manual.scheduleCount()).toBe(0); // 初烘显式驱动，零 pending
  });

  it('连续写入口调用（patchAtmosphere ×3 + setSunDirection）→ fire 后恰一次重烘', () => {
    const manual = makeManualScheduler();
    const { deps } = makeEnv(manual);
    const outcome = setupSkyEnvironment(deps);
    if (outcome.mode !== 'sky') throw new Error('预期 sky 模式');
    const bakedBefore = outcome.pmrem.stats.baked; // = 1（初烘）
    outcome.sky.patchAtmosphere({ cloudCoverage: 0.5 });
    outcome.sky.patchAtmosphere({ cloudDensity: 0.6 });
    outcome.sky.patchAtmosphere({ turbidity: 6 });
    outcome.sky.setSunDirection(20, 210);
    expect(manual.scheduleCount()).toBe(4); // 每写入口各触发一次 debounce
    expect(outcome.pmrem.stats.baked).toBe(bakedBefore); // 停手前零重烘
    manual.fire();
    expect(outcome.pmrem.stats.baked).toBe(bakedBefore + 1); // 恰一次重烘
    manual.fire();
    expect(outcome.pmrem.stats.baked).toBe(bakedBefore + 1);
    outcome.pmrem.dispose();
    outcome.sky.dispose();
  });

  it('跨环境取消：环境 A pending → cancel + 释放 → 环境切换后 fire 零触发、新环境只有初烘', () => {
    const manual = makeManualScheduler();
    // 环境 A
    const first = makeEnv(manual, 'day');
    const outcomeA = setupSkyEnvironment(first.deps);
    if (outcomeA.mode !== 'sky') throw new Error('预期 sky 模式');
    outcomeA.sky.patchAtmosphere({ cloudCoverage: 0.7 }); // pending
    expect(manual.hasPending()).toBe(true);
    // 模拟 Renderer.clearEnvironment 序列（预设切换）：cancel → pmrem/sky 释放
    outcomeA.rebake.cancel();
    outcomeA.pmrem.dispose();
    outcomeA.sky.dispose();
    // 环境切换：同 scene/envGroup 构建环境 B（dusk——fallback 不粘死同款重试口径）
    const second = makeEnv(manual, 'dusk');
    const outcomeB = setupSkyEnvironment(second.deps);
    if (outcomeB.mode !== 'sky') throw new Error('预期 sky 模式');
    manual.fire(); // 旧 timer 若未被取消，此刻触发——须零执行
    expect(manual.fire()).toBeNull();
    expect(outcomeB.pmrem.stats.baked).toBe(1); // 新环境只有初烘：旧 timer 未触发新环境重烘
    outcomeB.pmrem.dispose();
    outcomeB.sky.dispose();
  });
});

describe('TIMER_REBAKE_SCHEDULER 常量', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('schedule = setTimeout(fn, delay)、返回 cancel = clearTimeout', () => {
    let fired = 0;
    const cancel = TIMER_REBAKE_SCHEDULER.schedule(() => {
      fired += 1;
    }, 50);
    cancel();
    vi.advanceTimersByTime(100);
    expect(fired).toBe(0); // 取消后不触发
  });
});
