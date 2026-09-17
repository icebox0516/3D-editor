/**
 * registries/CommandRegistry —— 命令注册表（类型 → 命令工厂）。
 *
 * 职责：按命令类型字符串注册工厂函数，create(type, data) 分发工厂产出命令实例，
 *      供编辑层（HistoryManager 等）执行进入撤销栈。
 * 契约注记：CONTRACTS.md 将完整 Command 接口（execute/undo/redo，依赖 CommandContext）
 * 定义在 editor/commands（T1.4 实现）；分层 DAG 禁止 registries 导入 editor，故本注册表
 * 仅依赖「注册身份」所需的最小结构 RegisteredCommand（id/name）。editor 层的完整 Command
 * 结构兼容本类型（TS 结构化类型），其工厂可直接注册；editor 侧如需完整行为签名，
 * 可对 create 返回值做一次结构化收窄（两者结构包含）。
 * 边界：零渲染；不做命令执行（执行属 editor/HistoryManager 职责）。
 */
import type { ID } from '../core/types';

/** 注册表视角的命令最小结构（editor 层完整 Command 的结构子集） */
export interface RegisteredCommand {
  readonly id: ID;
  readonly name: string;
}

/** 命令工厂：由数据构造命令实例（data 形状由具体命令自定义，契约签名为 any） */
export type CommandFactory = (data: any) => RegisteredCommand;

/** 命令注册表：register/create */
export class CommandRegistry {
  private readonly factories = new Map<string, CommandFactory>();

  /** 注册命令工厂；重复注册同 type 抛错 */
  register(type: string, factory: CommandFactory): void {
    if (typeof type !== 'string' || type === '') {
      throw new Error('命令类型缺少合法 type');
    }
    if (typeof factory !== 'function') {
      throw new Error(`命令工厂必须是函数: ${type}`);
    }
    if (this.factories.has(type)) {
      throw new Error(`命令类型已注册，禁止重复注册: ${type}`);
    }
    this.factories.set(type, factory);
  }

  /** 按类型与数据构造命令实例；未注册的 type 抛错 */
  create(type: string, data: any): RegisteredCommand {
    const factory = this.factories.get(type);
    if (!factory) {
      throw new Error(`未注册的命令类型: ${type}`);
    }
    return factory(data);
  }
}
