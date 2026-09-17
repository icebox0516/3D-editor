/**
 * core/events/EventBus —— 类型化事件总线。
 *
 * 职责：进程内同步发布/订阅，事件名与负载由 EventMap 约束（编译期类型安全）。
 * 边界：纯分发，不做异步、不做通配符、不承载业务逻辑；core 层零依赖。
 */
import type { EventMap } from './events';

/** 某事件的处理函数（按事件名索引时丢失具体负载类型，内部用 any 存储、调用点还原） */
type AnyHandler = (payload: any) => void;

export class EventBus {
  private readonly handlers = new Map<keyof EventMap, AnyHandler[]>();

  /** 订阅事件；返回退订函数（与 off(type, fn) 等价） */
  on<K extends keyof EventMap>(type: K, fn: (p: EventMap[K]) => void): () => void {
    const list = this.handlers.get(type);
    if (list) {
      list.push(fn);
    } else {
      this.handlers.set(type, [fn]);
    }
    return () => this.off(type, fn);
  }

  /** 退订指定处理函数；未注册过则静默忽略（幂等） */
  off<K extends keyof EventMap>(type: K, fn: (p: EventMap[K]) => void): void {
    const list = this.handlers.get(type);
    if (!list) return;
    const index = list.indexOf(fn);
    if (index !== -1) list.splice(index, 1);
    if (list.length === 0) this.handlers.delete(type);
  }

  /** 同步派发事件；遍历快照，允许处理器内安全退订（本轮不影响后续分发，下轮生效） */
  emit<K extends keyof EventMap>(type: K, payload: EventMap[K]): void {
    const list = this.handlers.get(type);
    if (!list || list.length === 0) return;
    for (const fn of [...list]) fn(payload);
  }
}
