/**
 * domain/lod/lodPolicy —— Runtime 全局 LOD 策略常量（T006.1，D27.12；T021.2 阈值结构候选化，D41 §4.2）。
 *
 * 职责：选档调度阈值（名义区间边界 + 迟滞带宽）的 Runtime 全局策略常量唯一落点。
 *      调度阈值归全局策略常量而非资产 Profile 是 D27.12 硬裁定——选档语义全资产统一，
 *      禁止 screenSize / maxDistance 等逐资产调度字段（无消费者字段全禁，lod-spec §2.2）；
 *      消费方 = lodEvaluation（缺省阈值）与两链选档接线（runtime/instancing、runtime/scatter）。
 * 边界：纯数据 + 纯类型，零 THREE；度量口径（m = 视口高归一化视距，screenFraction = 1/m）
 *      归 lodEvaluation 头注。
 *
 * ⚠️ 数值状态 = **候选（candidate），021.8 A/B 重锁**（T021.2，D41 §4.2「阈值与迟滞
 *   全部候选化」）：新链三边界 + 迟滞带初值直接继承 legacy 三数映射，未经新链实测——
 *   021.6 canopy 内容接入 + 021.7 接线后，由 021.8 标定验收门（吸收 T006.6 Step 3）
 *   视觉 + 性能实测重锁；重锁须连带更新测试「一次锁全量」断言并记档。
 *
 * 📜 历史锁定记档（T006.5 验收门，2026-09-19，docs/acceptance/t006/006.5/）——针对
 *   **旧链**（highToMid / midToLow / lowToCulled）的实测锁定：双档验收（2 万树 / 10 万
 *   路灯）+ 推拉换档序列（选档迁移单调、迟滞零震荡、帧间 diff 不超运动基线）+ 视觉核验
 *   （档间过渡连续无分层条带）实测通过。新链初值同值直承该基线，锁定状态由 T006.5 的
 *   「已锁定」降格为候选（T021.2），重锁归 021.8。
 *
 * legacy 对照（屏占比口径 screenFraction = 1/m，见 lodEvaluation 头注）：
 *   旧三数 midToLow = 16 / lowToCulled = 60 ↔ 新链 midToCanopy = 16 / canopyToCulled = 60
 *   同值直承；6 / 16 / 60 对应资产直径占视口高 16.7% / 6.25% / 1.67%。
 *   标定参照：夏栎 r ≈ 5m、默认 fov 50°（tan25° ≈ 0.466）换算成视距——
 *   highToMid = 6 ≈ 64m、midToCanopy = 16 ≈ 172m、canopyToCulled = 60 ≈ 643m。
 */

/** LOD 名义区间边界与迟滞带宽（数值语义 = 统一度量 m 的口径，见 lodEvaluation 头注） */
export interface LodThresholds {
  /** high↔mid 名义边界（视口高归一化视距 m，见 lodEvaluation 头注） */
  highToMid: number;
  /** mid↔canopy 名义边界（新链第二边界，D41 §4.2；legacy midToLow 同值直承） */
  midToCanopy: number;
  /** canopy↔culled 名义边界（超远裁剪线；culled 是提交终态非表示，D41 §三.1；
   *  legacy lowToCulled 同值直承） */
  canopyToCulled: number;
  /** 迟滞带宽（相对比例 0–1）：升档（靠近）方向的换档阈值 = 名义边界 × (1 - bandwidth) */
  hysteresisBand: number;
}

/**
 * Runtime 全局 LOD 阈值（**候选值，021.8 A/B 重锁**——初值继承 T006.5 legacy 三数映射，
 * 数值状态与历史锁定记档见模块头注）。
 */
export const LOD_THRESHOLDS: LodThresholds = {
  highToMid: 6,
  midToCanopy: 16,
  canopyToCulled: 60,
  hysteresisBand: 0.15,
};
