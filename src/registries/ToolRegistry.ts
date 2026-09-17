/**
 * registries/ToolRegistry —— 工具注册表。
 *
 * 契约注记：CONTRACTS.md 将完整 Tool 接口（activate/onPointerDown 等，依赖 ToolContext）
 * 定义在 editor/tools（T1.4 实现）；分层 DAG 禁止 registries 导入 editor，故本注册表仅
 * 依赖「注册身份」所需的最小结构 RegisteredTool（id/name）。editor 层的完整 Tool 结构
 * 兼容本类型（TS 结构化类型），可直接注册，无需适配层。
 * 边界：零依赖纯数据存取；零渲染。
 */

/** 注册表视角的工具最小结构（editor 层完整 Tool 的结构子集） */
export interface RegisteredTool {
  readonly id: string;
  readonly name: string;
}

/** 工具注册表：register/unregister/get/list */
export class ToolRegistry {
  private readonly tools = new Map<string, RegisteredTool>();

  /** 注册工具；重复注册同 id 抛错 */
  register(t: RegisteredTool): void {
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

  /** 注销工具（不存在时静默无操作） */
  unregister(id: string): void {
    this.tools.delete(id);
  }

  /** 按工具 id 取实例；未注册返回 undefined */
  get(id: string): RegisteredTool | undefined {
    return this.tools.get(id);
  }

  /** 全部工具（保持注册顺序） */
  list(): RegisteredTool[] {
    return [...this.tools.values()];
  }
}
