/**
 * editor/services/PointerEventInfo —— 输入事件信息类型出口（便捷转发）。
 *
 * 职责：T1.6 产出文件清单要求的独立出口；实际定义集中在 ports.ts
 * （含 KeyboardEventInfo，与 ViewportPort 等共享同一契约来源），
 * 本文件仅做转发，避免重定义签名（CONTRACTS.md：源码不得重定义契约）。
 */
export type { KeyboardEventInfo, PointerEventInfo } from './ports';
