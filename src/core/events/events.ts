/**
 * core/events/events —— 全局事件契约（类型化 EventMap）。
 *
 * 职责：集中声明 EventBus 支持的全部事件名及其负载结构，供各层订阅/派发时获得编译期校验。
 * 边界：本文件是 EventMap 的唯一定义点；按 CONTRACTS.md 契约变更规则，增补须先经
 *      契约修订留痕（T3.2 draw:status → 2026-09-11 app:notify → 2026-09-15 阶段 10
 *      measure:status/measure:changed，第十一次修订——代码侧键位增补随各阶段落地）。
 */
import type { ID, MeasureKind, Vec2, Vec3 } from '../types';

/**
 * 绘制状态栏负载（T3.2 绘制工具经 draw:status 驱动状态栏）：
 * - length：当前折线累计长度（米，含游标弹性段；Polygon 为去闭合边的周长链）；
 * - area：当前面实时面积（平方米，环 = 已绘点 + 游标）；
 * - cursor：游标地面坐标（Vec2 = x, 世界 z，已过吸附/锁定管线）；
 * - vertexCount：当前形状顶点计数（仅绘制会话中发出；2026-09-11 阶段 6 审计增补，
 *   用户批准——契约第五次修订预授权点之一，七形状工具随发）；
 * - error：校验/操作拦截提示（随下一次正常状态自然清除）。
 * 各字段按需出现：点工具只发 cursor，线工具加 length，面工具 length+area。
 */
export interface DrawStatusPayload {
  length?: number;
  area?: number;
  cursor?: Vec2;
  vertexCount?: number;
  error?: string;
}

/**
 * 测量状态栏负载（T10.1 增补，2026-09-15 阶段 10 第十一次契约修订；定义见
 * contracts/stage10-measure.md §B，签名逐字一致）：
 * - kind：测量种类（四类）；
 * - segment：当前弹性段长度（distance/height；三维，米）；
 * - total：已固定点累计长度（distance，含弹性段）；
 * - area：实时水平投影面积（area；环 = 已固定点 + 游标，平方米）；
 * - angle：实时角度（angle；度，0–180）；
 * - dh：ΔH（height；米，可负）；
 * - horizontal：水平距离（height；XZ 投影，米）；
 * - cursor：游标拾取点（表面优先口径，世界坐标）；
 * - error：校验拦截（共线/顶点不足）；随下一次正常状态自然清除。
 * 各字段按 kind 最小集出现；完成/取消后发仅含 kind 的复位载荷（沿 draw:status 空载荷
 * 复位先例——kind 为契约必填字段，复位 = 无任何读数字段）。
 */
export interface MeasureStatusPayload {
  kind: MeasureKind;
  segment?: number;
  total?: number;
  area?: number;
  angle?: number;
  dh?: number;
  horizontal?: number;
  cursor?: Vec3;
  error?: string;
}

/** 类型化事件映射：key 为事件名，value 为负载结构 */
export interface EventMap {
  'object:created': { objectId: ID };
  'object:updated': { objectId: ID; keys: string[] };
  'object:removed': { objectId: ID };
  'selection:changed': { selectedIds: ID[] };
  'scene:changed': { source: string };
  'history:changed': { canUndo: boolean; canRedo: boolean };
  'layer:updated': { layerId: ID };
  'tool:changed': { toolId: string | null };
  'style:changed': { objectId: ID };
  'asset:registered': { assetId: ID };
  /** 绘制状态栏数据（T3.2 增补，负载定义见 DrawStatusPayload） */
  'draw:status': DrawStatusPayload;
  /**
   * Toast 通知通道（2026-09-11 阶段 6 审计增补，用户批准——基础契约预授权变更点）：
   * runtime→UI 的全局提示（现状 runtime 无合法 Toast 路径）；首个消费方为样式引擎降级兜底（T6.2）。
   */
  'app:notify': { message: string; kind?: 'info' | 'warn' | 'error' };
  /**
   * 测量状态栏读数（2026-09-15 阶段 10 增补，第十一次契约修订；负载定义见
   * MeasureStatusPayload）：完成/取消后发仅含 kind 的复位载荷（沿 draw:status 先例）。
   */
  'measure:status': MeasureStatusPayload;
  /** 测量会话增删清（MeasureSession 发出；UI「清除全部/删除上一条」可用态） */
  'measure:changed': { count: number };
}
