/**
 * editor/tools/ToolManager —— 工具管理器（同一时刻仅一个激活工具）。
 *
 * 职责：register 收纳工具；activate 切换激活（自动 deactivate 上一个、透传 ctx+params、
 *      emit tool:changed{toolId}）；deactivate 退出激活（emit tool:changed{null}）；
 *      cancel 转发退出手势（工具清理临时状态 + 退出激活，零 Command）。
 * 边界：签名以 CONTRACTS.md 为准（构造注入 ToolContext 为既定装配方式的自然补充）；
 *      工具 activate 抛错时本类复位 activeTool=null、广播 tool:changed{null} 并上抛错误，
 *      保证任何时刻 getActiveTool() 要么为 null、要么指向 activate 成功的工具。
 */
import type { EventBus } from '../../core/events/EventBus';
import type { Tool, ToolContext } from './Tool';

export class ToolManager {
  private readonly ctx: ToolContext;
  private readonly tools = new Map<string, Tool>();
  private active: Tool | null = null;

  constructor(ctx: ToolContext) {
    this.ctx = ctx;
  }

  /** 注册工具；重复注册同 id 抛错 */
  register(t: Tool): void {
    if (typeof t !== 'object' || t === null) {
      throw new Error('工具定义不能为空');
    }
    if (typeof t.id !== 'string' || t.id === '') {
      throw new Error('工具定义缺少合法 id');
    }
    if (this.tools.has(t.id)) {
      throw new Error(`工具已注册，禁止重复注册: ${t.id}`);
    }
    this.tools.set(t.id, t);
  }

  /**
   * 激活工具：先 deactivate 上一个（自动清理其临时状态），再激活新工具并透传参数。
   * 重复激活同一工具也走完整切换流程（deactivate → activate，参数可更新）。
   * 工具未注册抛错；activate 抛错时复位为无激活状态并把错误上抛。
   */
  activate(id: string, params?: unknown): void {
    const tool = this.tools.get(id);
    if (!tool) {
      throw new Error(`ToolManager.activate: 工具未注册: ${id}`);
    }
    this.active?.deactivate();
    this.active = tool;
    try {
      tool.activate(this.ctx, params);
    } catch (err) {
      this.active = null;
      this.emitChanged(null);
      throw err;
    }
    this.emitChanged(id);
  }

  /** 退出激活：调用工具 deactivate 并广播 tool:changed{null}；无激活时为无操作 */
  deactivate(): void {
    if (!this.active) return;
    const prev = this.active;
    this.active = null;
    prev.deactivate();
    this.emitChanged(null);
  }

  getActiveTool(): Tool | null {
    return this.active;
  }

  /**
   * 退出手势（ESC / 右键，由 app 层 input 路由）：先让工具 cancel 清理临时状态
   * （不产生任何 Command），再退出激活并广播 tool:changed{null}；无激活时为无操作。
   * 已产生的修改（如已放置对象）不受影响——它们经命令落地，归历史管理。
   */
  cancel(): void {
    if (!this.active) return;
    const prev = this.active;
    this.active = null;
    prev.cancel();
    prev.deactivate();
    this.emitChanged(null);
  }

  private emitChanged(toolId: string | null): void {
    const eventBus: EventBus = this.ctx.eventBus;
    eventBus.emit('tool:changed', { toolId });
  }
}
