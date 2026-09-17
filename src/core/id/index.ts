/**
 * core/id —— 稳定业务 ID 生成。
 *
 * 职责：createId(prefix) 生成 `${prefix}_${base36时间戳}${同毫秒序号}${随机}` 格式的业务 ID。
 * 边界：只保证进程内唯一，不做持久化排序；无任何依赖。
 * 前缀表（CONTRACTS.md #7）：scene_ / element_ / layer_ / style_ / asset_ / model_ / cmd_ / tool_
 */
import type { ID } from '../types';

/** 上一次发号的时间戳（ms）与同毫秒内的序号，保证连发不碰撞 */
let lastTimestamp = -1;
let sequence = 0;

/**
 * 生成带前缀的业务 ID。
 *
 * 结构：`${prefix}_${时间戳(base36)}${同毫秒序号(base36)}${随机(base36)}`。
 * 同一毫秒内靠单调序号、跨毫秒靠时间戳、极端回拨场景靠随机后缀兜底，确保唯一。
 */
export function createId(prefix: string): ID {
  const now = Date.now();
  if (now === lastTimestamp) {
    sequence += 1;
  } else {
    lastTimestamp = now;
    sequence = 0;
  }
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${now.toString(36)}${sequence.toString(36)}${random}`;
}
