/**
 * runtime/ContextLossWatchdog —— WebGL 上下文丢失看门狗（事件 + 轮询双通道，可 node 单测）。
 *
 * 职责：把 webglcontextlost / webglcontextrestored 变成「可见 + 可恢复」：
 *  - 丢失：preventDefault（保住浏览器自动恢复通道）+ console.error 上报一次。
 *    three 官方对丢失只 console.log（非 error，错误收集器抓不到），且 WebGLRenderer.render()
 *    在上下文丢失后静默空转——不加这道兜底，故障表现为「画布冻结在最后一帧、控制台零错误、
 *    数据层一切正常」，几乎无法定位；
 *  - 恢复：回调 onRestored（调用方借此重设尺寸并立即重绘），并复位「已上报」标记，
 *    若再丢失仍会重新上报；
 *  - 逐帧轮询发现丢失时经 notifyLost() 汇入同一去重上报（事件通道缺席时的兜底）。
 *
 * attach / detach 幂等；事件目标经构造注入（浏览器为承载 WebGL 的 canvas，测试用 EventTarget）。
 * 行为契约由 tests/runtime/ContextLossWatchdog.test.ts 固定。
 */

/** 事件目标最小接口（结构化类型：HTMLCanvasElement 天然满足） */
export interface ContextLossEventTarget {
  addEventListener(type: string, listener: (event: Event) => void): void;
  removeEventListener(type: string, listener: (event: Event) => void): void;
}

export interface ContextLossWatchdogDeps {
  /** 事件目标（承载 WebGL 上下文的 canvas） */
  target: ContextLossEventTarget;
  /** 上下文恢复回调（缺省 no-op；Renderer 借此强制重设尺寸并重绘一帧） */
  onRestored?: () => void;
  /** 丢失上报（缺省 console.error；测试注入收集） */
  reportLost?: (message: string) => void;
}

function reportLostDefault(message: string): void {
  console.error(message);
}

export class ContextLossWatchdog {
  private readonly target: ContextLossEventTarget;
  private readonly onRestored: () => void;
  private readonly reportLost: (message: string) => void;

  private attached = false;
  private lost = false;
  private reported = false;

  constructor(deps: ContextLossWatchdogDeps) {
    this.target = deps.target;
    this.onRestored = deps.onRestored ?? (() => undefined);
    this.reportLost = deps.reportLost ?? reportLostDefault;
  }

  /** 当前是否处于丢失态（事件或轮询任一通道置位） */
  get isLost(): boolean {
    return this.lost;
  }

  /** 开始监听（幂等） */
  attach(): void {
    if (this.attached) return;
    this.attached = true;
    this.target.addEventListener('webglcontextlost', this.handleLost);
    this.target.addEventListener('webglcontextrestored', this.handleRestored);
  }

  /** 移除监听（幂等；dispose 时调用，避免 StrictMode 双挂载下残留监听） */
  detach(): void {
    if (!this.attached) return;
    this.attached = false;
    this.target.removeEventListener('webglcontextlost', this.handleLost);
    this.target.removeEventListener('webglcontextrestored', this.handleRestored);
  }

  /** 上下文丢失（事件或逐帧轮询发现；去重上报一次） */
  notifyLost(): void {
    this.lost = true;
    if (this.reported) return;
    this.reported = true;
    this.reportLost(
      '[ContextLossWatchdog] WebGL 上下文丢失：画面将冻结在最后一帧，等待浏览器恢复（长期未恢复请刷新页面）',
    );
  }

  private readonly handleLost = (event: Event): void => {
    event.preventDefault(); // 必需：阻止默认行为才允许后续 contextrestored
    this.notifyLost();
  };

  private readonly handleRestored = (): void => {
    this.lost = false;
    this.reported = false;
    this.onRestored();
  };
}
