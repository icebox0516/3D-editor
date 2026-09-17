/**
 * runtime/RenderLoop —— 可注入调度的渲染循环（纯逻辑，可 node 单测）。
 *
 * 职责：驱动每帧渲染回调，并保证循环「不静默死亡」：
 *  1. 帧回调异常不外泄（捕获后上报一次），循环继续排程——瞬时异常不致死，
 *     也不向控制台倾倒未捕获错误；
 *  2. 连续失败达到熔断阈值时停止排程，并补一条明确的终止错误（避免无限刷屏）；
 *  3. start / stop / dispose 幂等；dispose 后永久不可再启动。
 *
 * 排程时序：先执行本帧、成功后再排下一帧（异常帧不占下一次调度）。
 * 边界：不依赖 three / DOM（requestAnimationFrame 经依赖注入，缺省取全局）；
 *      由 Renderer 组合使用；行为契约由 tests/runtime/RenderLoop.test.ts 固定。
 */

export interface RenderLoopDeps {
  /** 每帧回调（渲染一帧；抛错按「帧失败」处理） */
  frame: () => void;
  /** 下一帧调度（缺省 requestAnimationFrame；测试注入假时钟） */
  requestFrame?: (callback: () => void) => number;
  /** 取消已排程帧（缺省 cancelAnimationFrame） */
  cancelFrame?: (handle: number) => void;
  /** 错误上报（缺省 console.error；final=true 表示熔断终止；测试注入收集） */
  reportError?: (err: unknown, final: boolean) => void;
  /** 连续帧失败熔断阈值（缺省 30；<= 0 表示永不熔断） */
  maxConsecutiveErrors?: number;
}

/** 缺省错误上报：首个错误与熔断终止各一条，绝不静默 */
function reportErrorDefault(err: unknown, final: boolean): void {
  if (final) {
    console.error('[RenderLoop] 连续帧渲染失败，渲染循环已停止（页面画面将冻结）', err);
  } else {
    console.error('[RenderLoop] 渲染帧异常，循环继续', err);
  }
}

export class RenderLoop {
  private readonly frame: () => void;
  private readonly requestFrame: (callback: () => void) => number;
  private readonly cancelFrame: (handle: number) => void;
  private readonly reportError: (err: unknown, final: boolean) => void;
  private readonly maxConsecutiveErrors: number;

  private handle: number | null = null;
  private running = false;
  private dead = false;
  private consecutiveErrors = 0;
  private errorReported = false;

  constructor(deps: RenderLoopDeps) {
    this.frame = deps.frame;
    this.requestFrame = deps.requestFrame ?? ((callback) => requestAnimationFrame(callback));
    this.cancelFrame = deps.cancelFrame ?? ((handle) => cancelAnimationFrame(handle));
    this.reportError = deps.reportError ?? reportErrorDefault;
    this.maxConsecutiveErrors = deps.maxConsecutiveErrors ?? 30;
  }

  /** 是否处于运行中（已启动且未停止/未熔断/未销毁） */
  get isRunning(): boolean {
    return this.running && !this.dead;
  }

  /** 启动循环（幂等：已运行或已销毁时 no-op） */
  start(): void {
    if (this.dead || this.running) return;
    this.running = true;
    this.handle = this.requestFrame(this.tick);
  }

  /** 停止循环（幂等：取消已排程帧；可再次 start 恢复） */
  stop(): void {
    if (!this.running) return;
    this.running = false;
    if (this.handle !== null) {
      this.cancelFrame(this.handle);
      this.handle = null;
    }
  }

  /** 停止并永久终结（幂等；之后 start 为 no-op） */
  dispose(): void {
    this.stop();
    this.dead = true;
  }

  private readonly tick = (): void => {
    this.handle = null;
    if (!this.running || this.dead) return;
    let failed = false;
    try {
      this.frame();
    } catch (err) {
      failed = true;
      this.handleFrameError(err);
    }
    if (!this.running || this.dead) return; // 熔断可能已在本帧内停止循环
    if (!failed) {
      this.consecutiveErrors = 0; // 成功一帧即复位连败计数与上报标记
      this.errorReported = false;
    }
    this.handle = this.requestFrame(this.tick);
  };

  /** 帧失败处理：首次上报一次；连败达到阈值则熔断（不再排程）并补终止上报 */
  private handleFrameError(err: unknown): void {
    this.consecutiveErrors += 1;
    if (!this.errorReported) {
      this.reportError(err, false);
      this.errorReported = true;
    }
    const limit = this.maxConsecutiveErrors;
    if (limit > 0 && this.consecutiveErrors >= limit) {
      this.reportError(err, true);
      this.running = false;
    }
  }
}
