/**
 * ui/feedback/toastStore —— 轻量 Toast 反馈队列（T5.8，需求第三十四章）。
 *
 * 职责：右下角浮层提示的纯 reducer（toastReducer：push / dismiss / tick）+ zustand
 *      薄封装（useToastStore）。「错误采用轻量 Toast，不使用阻塞式大弹窗」——
 *      既有顶部 notice 条（MenuBar .ed-notice）随本体系退役。
 * 语义：
 *   - push(kind, text, now)：入队（id 单调唯一、expiresAt = now + TTL 4.5s）；
 *     上限 3 条，超出挤掉最旧（先进先出）；
 *   - dismiss(id)：手动关闭（× 钮）；
 *   - tick(now)：驱逐过期条目（now ≥ expiresAt）——Toasts 组件周期驱动；
 *   - 无障碍：浮层容器 aria-live="polite"、条目 role="status"，不抢焦点（无 focus 调用）。
 * 边界：纯模块零 React / 零 DOM（reducer node 可测；呈现归 components/Toasts.tsx）；
 *      与主菜单动作路由的 notify 通道经 App 装配对接（actions deps.notify → push）。
 */
import { create } from 'zustand';

/** Toast 自动消失时长（毫秒） */
export const TOAST_TTL_MS = 4500;

/** 同屏上限（超出挤掉最旧） */
export const TOAST_MAX_VISIBLE = 3;

/** Toast 种类（info = 琥珀左线 / error = danger 左线，沿 .ed-notice 先例语义） */
export type ToastKind = 'info' | 'error';

/** 单条 Toast */
export interface ToastItem {
  /** 唯一 id（React key 与 dismiss 句柄） */
  id: string;
  kind: ToastKind;
  text: string;
  /** 过期时刻（单调时钟毫秒；now ≥ expiresAt 时被 tick 驱逐） */
  expiresAt: number;
}

/** reducer 动作 */
export type ToastAction =
  | { type: 'push'; kind: ToastKind; text: string; now: number }
  | { type: 'dismiss'; id: string }
  | { type: 'tick'; now: number };

/** id 序号（模块级单调；重绘/双挂载下 store 单例保持连续） */
let toastSeq = 0;

/**
 * Toast 队列纯 reducer（node 可测）：
 * push 分配 id 与过期时刻并裁剪到上限（挤掉最旧）；dismiss 按 id 移除；
 * tick 驱逐 now ≥ expiresAt 的条目。全部返回新数组（不可变更新）。
 */
export function toastReducer(state: readonly ToastItem[], action: ToastAction): ToastItem[] {
  switch (action.type) {
    case 'push': {
      const next: ToastItem[] = [
        ...state,
        { id: `toast_${++toastSeq}`, kind: action.kind, text: action.text, expiresAt: action.now + TOAST_TTL_MS },
      ];
      return next.slice(Math.max(0, next.length - TOAST_MAX_VISIBLE));
    }
    case 'dismiss':
      return state.filter((t) => t.id !== action.id);
    case 'tick':
      return state.filter((t) => t.expiresAt > action.now);
  }
}

/** zustand 薄封装：组件经 actions 驱动同一 reducer（单一实现） */
export interface ToastStoreState {
  toasts: ToastItem[];
  /** 入队一条（now 缺省取当前单调时钟） */
  push(kind: ToastKind, text: string, now?: number): void;
  /** 手动关闭一条 */
  dismiss(id: string): void;
  /** 周期驱动：驱逐过期（Toasts 组件定时调用） */
  tick(now?: number): void;
}

/** 单调时钟（node 测试无 performance 时回退 Date.now） */
function nowMs(): number {
  return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
}

export const useToastStore = create<ToastStoreState>((set, get) => ({
  toasts: [],

  push(kind, text, at) {
    set({ toasts: toastReducer(get().toasts, { type: 'push', kind, text, now: at ?? nowMs() }) });
  },

  dismiss(id) {
    set({ toasts: toastReducer(get().toasts, { type: 'dismiss', id }) });
  },

  tick(at) {
    set({ toasts: toastReducer(get().toasts, { type: 'tick', now: at ?? nowMs() }) });
  },
}));

/** 便捷推送（App 装配 notify 通道对接点：actions deps.notify → push） */
export function pushToast(kind: ToastKind, text: string): void {
  useToastStore.getState().push(kind, text);
}
