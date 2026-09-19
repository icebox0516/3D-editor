/**
 * domain/lod/lodPolicy —— Runtime 全局 LOD 策略常量（T006.1，D27.12）。
 *
 * 职责：选档调度阈值（名义档位边界 + 迟滞带宽）的 Runtime 全局策略常量唯一落点。
 *      调度阈值归全局策略常量而非资产 Profile 是 D27.12 硬裁定——选档语义全资产统一，
 *      禁止 screenSize / maxDistance 等逐资产调度字段（无消费者字段全禁，lod-spec §2.2）；
 *      消费方 = lodEvaluation（缺省阈值）与 006.3 Runtime 接线。
 * 边界：纯数据 + 纯类型，零 THREE；度量口径（m = 视口高归一化视距）归 lodEvaluation 头注。
 *
 * ✅ 数值状态 = **已锁定**（T006.5 验收门，2026-09-19，docs/acceptance/t006/006.5/）：
 *   双档验收（2 万树 / 10 万路灯）+ 推拉换档序列（选档迁移单调、迟滞零震荡、帧间 diff
 *   不超运动基线）+ 视觉核验（档间过渡连续无分层条带）实测通过；数值变更须重开实测
 *   锁定记档（沿「一次锁全量」测试断言联动）。
 *   标定参照：夏栎 r ≈ 5m、默认 fov 50°（tan25° ≈ 0.466）换算成视距——
 *   highToMid = 6 ≈ 64m、midToLow = 16 ≈ 172m、lowToCulled = 60 ≈ 643m。
 */

/** LOD 名义档位边界与迟滞带宽（数值语义 = 统一度量 m 的口径，见 lodEvaluation 头注） */
export interface LodThresholds {
  /** high↔mid 名义边界（视口高归一化视距 m，见 lodEvaluation 头注） */
  highToMid: number;
  /** mid↔low 名义边界 */
  midToLow: number;
  /** low↔culled 名义边界（超远裁剪线；culled 是调度结果非声明档位） */
  lowToCulled: number;
  /** 迟滞带宽（相对比例 0–1）：升档（靠近）方向的换档阈值 = 名义边界 × (1 - bandwidth) */
  hysteresisBand: number;
}

/** Runtime 全局 LOD 阈值（T006.5 实测锁定——锁定依据见模块头注） */
export const LOD_THRESHOLDS: LodThresholds = {
  highToMid: 6,
  midToLow: 16,
  lowToCulled: 60,
  hysteresisBand: 0.15,
};
