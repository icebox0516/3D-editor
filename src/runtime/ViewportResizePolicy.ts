/**
 * runtime/ViewportResizePolicy —— 视口尺寸重设判定（纯逻辑，可 node 单测）。
 *
 * 职责：决定「当前布局尺寸是否需要应用到渲染器」，统一两路来源（ResizeObserver 回调与
 * 渲染循环的逐帧自检）：
 *  - 非正尺寸（布局未稳 / 元素隐藏）一律不应用——保留原状等待下一轮重试；
 *  - 与已应用尺寸相同则不应用（幂等：重复同值不再触发 setSize，避免无谓的画布清屏）；
 *  - reset 供上下文恢复后强制下一次全量重设。
 *
 * 背景：旧实现只在创建时同步 resize 一次 + 依赖 RO 回调；创建时布局未稳（canvas 仍为默认
 * 300×150）会先呈现一批错误宽高比（aspect=2.0）的帧，若此后渲染通道异常（如上下文丢失），
 * 错误比例的残影帧将永久留存。逐帧自检 + 本判定使「循环活着就不停在错误尺寸上」。
 * 行为契约由 tests/runtime/ViewportResizePolicy.test.ts 固定。
 */
export class ViewportResizePolicy {
  private width = 0;
  private height = 0;

  /** 当前布局尺寸是否应当应用（非正值与已应用过的重复值返回 false） */
  shouldApply(width: number, height: number): boolean {
    if (!(width > 0) || !(height > 0)) return false;
    return width !== this.width || height !== this.height;
  }

  /** 标记已应用（仅接受正尺寸） */
  apply(width: number, height: number): void {
    if (!(width > 0) || !(height > 0)) return;
    this.width = width;
    this.height = height;
  }

  /** 已应用的尺寸（从未应用过返回 null） */
  get applied(): { width: number; height: number } | null {
    if (this.width === 0 || this.height === 0) return null;
    return { width: this.width, height: this.height };
  }

  /** 忘记已应用尺寸（此后首次 shouldApply 必为 true；上下文恢复后全量重建用） */
  reset(): void {
    this.width = 0;
    this.height = 0;
  }
}
