/**
 * runtime/environment/skyRebake —— PMREM 重烘 debounce 层（T018.4，D29 裁决 Q6）。
 *
 * 契约：SkyCore 三写入口（applyAtmosphere/patchAtmosphere/setSunDirection）的
 * onParamsChanged 回调**上游**包一层 debounce——连续写入口调用（逐参调整 / __sky DEV
 * 面拖动场景）合并为停手后恰一次 PMREM 重烘，禁止逐参数变化连续重烘。天空观感不受
 * 影响：displaySky/bakeSky uniforms 由 SkyCore 写入口即时同步（D29.12），仅 env 反射
 * 延迟一步（停手后 ≤REBAKE_DEBOUNCE_MS）——可接受且更流畅（任务书口径）。**SkyCore
 * 本层零感知**（回调触发语义不变——skyCore 构造注已预留本包层，包层落点在
 * environmentSetup 的 rebake 闭包处）。
 *
 * 调度器可注入（沿 LazyPmremBackend 工厂注入先例）：生产 = TIMER_REBAKE_SCHEDULER
 * （setTimeout/clearTimeout）；node 单测注入同步/手动调度器获得确定性口径——同步调度
 * 器下「写入口变更后恰一次重烘」与 018.2/018.3 既有断言语义逐位一致（测试改注入面
 * 不改断言语义）。
 *
 * REBAKE_DEBOUNCE_MS = 200 记档依据（任务书建议 150–300ms 量级内取中）：下界须显著
 * 大于拖动事件间隔（60Hz ≈16.7ms——确保连续拖动合并为一次）并覆盖逐参连续调整的
 * 操作间隔；上界受 env 反射跟手性约束（>300ms 停手后开始可感知迟滞）。200ms =
 * 60fps 下停手后反射更新 ≤ ~12 帧内跟上、单次 bake ~30ms（018.2 实测 30–33ms 含
 * generator 重编译）预算内无堆帧风险；合并率对连续 N 次写入口恒收敛到恰 1 次。
 *
 * 触发清单（PMREM 严禁进帧路径不变，T018.2 锁定）：applyEnvironment 初烘（显式，
 * 不经本层）+ 三写入口 debounced 重烘（trigger）+ setIblIntensity 借道（T018.4 IBL
 * 刷新路径）+ rebake() 强制（flush）。cancel = clearEnvironment / 环境切换显式取消
 * pending——旧 pmrem 已 dispose 时 bake 短路（disposed flag）技术上安全，显式取消
 * 是确定性记档口径：pending timer 不跨环境触发。
 */
/** 生产调度器用的 debounce 延迟（ms；依据见模块头注） */
export const REBAKE_DEBOUNCE_MS = 200;

/**
 * 重烘调度器注入面：schedule(fn, delayMs) 返回取消函数。
 * 生产 = TIMER_REBAKE_SCHEDULER；node 单测注入同步调度器（立即执行）或手动调度器
 * （测试驱动 fire）——debounce 语义在注入面上可确定性断言。
 */
export interface RebakeScheduler {
  schedule(fn: () => void, delayMs: number): () => void;
}

/** 生产调度器：setTimeout/clearTimeout（真实计时器语义由 fake-timer 单测锁定） */
export const TIMER_REBAKE_SCHEDULER: RebakeScheduler = {
  schedule(fn, delayMs) {
    const id = setTimeout(fn, delayMs);
    return () => clearTimeout(id);
  },
};

/**
 * SkyRebake 最小消费面（Renderer / 调参端口 / environmentSetup 结果带出的形态）：
 * trigger（debounce 触发）/ flush（强制立即）/ cancel（取消 pending）。
 */
export interface SkyRebakePort {
  /** debounce 触发：连续调用合并为停手后恰一次执行（写入口回调 + setIblIntensity 借道） */
  trigger(): void;
  /** 强制立即执行（flush 语义：取消 pending 后立即执行一次——rebake() 终调工具） */
  flush(): void;
  /** 取消 pending（clearEnvironment / 环境切换——不跨环境触发）；无 pending 幂等 */
  cancel(): void;
}

/**
 * PMREM 重烘 debounce 器（契约见模块头注）。执行体由构造注入（environmentSetup 的
 * rebake 闭包——含 018.3 锁定的 catch 语义：重烘失败保留旧环境不降级，catch 在
 * debounce 触发体内原样执行）。生命周期跟随环境：随 setupSkyEnvironment 创建、
 * sky 模式结果带出、clearEnvironment cancel 后丢弃（无 writeEntry 触发即无新 pending）。
 */
export class SkyRebake implements SkyRebakePort {
  private cancelPending: (() => void) | null = null;

  constructor(
    private readonly rebake: () => void,
    private readonly scheduler: RebakeScheduler = TIMER_REBAKE_SCHEDULER,
    private readonly delayMs: number = REBAKE_DEBOUNCE_MS,
  ) {}

  trigger(): void {
    this.cancelPending?.(); // 重触发替换旧 pending（合并语义：只保留最新一次）
    this.cancelPending = this.scheduler.schedule(this.rebake, this.delayMs);
  }

  flush(): void {
    this.cancel(); // pending 消费掉——flush 后旧 timer 不得再触发（双执行防线）
    this.rebake();
  }

  cancel(): void {
    this.cancelPending?.();
    this.cancelPending = null;
  }
}
