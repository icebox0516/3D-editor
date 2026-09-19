/**
 * domain/lod/batchPolicy —— Runtime 全局批次控制策略常量（T006.4，D27.12 同纪律）。
 *
 * 职责：批次治理三面的 Runtime 全局策略常量唯一落点——draw call 预算上限（+ 告警节流）、
 *      远距密度降级抽稀比例（散布链消费侧）、稀疏块合并阈值（散布链块自适应合并）。
 *      落点理由（记档）：与 LOD_THRESHOLDS 同族「Runtime 全局策略常量」——批次控制与选档
 *      一样全资产统一、禁止逐资产 Profile 字段（D27.12 无消费者字段全禁）；落 domain 纯数据
 *      （零 THREE）使常量与确定性抽稀规则可 node 直测（「一次锁全量」测试先例沿
 *      LOD_THRESHOLDS）；消费方 = ScatterChunkManager（抽稀/合并）与 Renderer（预算告警）。
 * 边界：纯数据 + 纯函数，零 THREE；不进资产 Profile、不进 Scene/Command；抽稀比例只作用于
 *      降档方向（high 恒 1 = 近处全保真硬约束），撒点确定性契约（domain/scatter）不经参数
 *      扩展——抽稀在 runtime 消费侧按实例稳定序过滤（006.4 记档裁定）。
 *
 * ⚠ 数值状态 = D27 候选值（同 LOD_THRESHOLDS 纪律）：实测锁定前为候选，待 006.5 验收门
 *   实测复核锁定；任何文档 / 代码不得将下列数值当作锁定值引用；候选值变更必须走实测锁定记档。
 */

import type { ProceduralLevel } from '../assets/AssetDescriptor';

/** Runtime 全局批次控制策略（数值语义与消费方见各字段注） */
export interface BatchControlPolicy {
  /**
   * draw call 预算上限（renderer.info.render.calls 口径，主遍 + 影遍合计——分遍渲染模式下
   * 为最后遍口径，与 getViewportStats 同源）。超限 = console 节流告警（不做运行时降级——
   * 治理观测面，降级手段归档位策略）。候选：006.4 压力实测校准（见 docs/acceptance/t006/
   * 006.4），006.5 验收门锁定。
   */
  drawCallBudget: number;
  /** 预算超限告警最小间隔（毫秒）：连续超限帧至多每 interval 一次告警，不刷屏 */
  budgetAlertIntervalMs: number;
  /**
   * 远距密度降级：各档散布实例抽稀保留比例（1 = 全保真）。high 恒 1（近处全保真），
   * 抽稀只作用于降档方向（mid/low）；视觉依据 = 远档张角小、密度感知阈值内（006.4 截图
   * 取证）。消费侧确定性规则见 keepThinnedInstance。
   */
  levelInstanceKeep: Record<ProceduralLevel, number>;
  /**
   * 稀疏块合并阈值：粗档（mid/low）下 (块×资产) 实例数 ≤ 该值时并入超块合并桶（相邻
   * 同资产块共享一个 InstancedMesh——防「块×资产×档」批次爆炸）。high 恒不合并（近处
   * 全保真 + 保持细粒度视锥剔除）。
   */
  sparseMergeMaxInstances: number;
  /** 合并组超块因子（每轴块数；2 = 2×2 块 = 64m 超块 @32m 块。≥2 生效） */
  mergeGroupFactor: number;
}

/**
 * Runtime 全局批次控制策略（D27 候选值——实测锁定前为候选，数值状态见模块头注）。
 * drawCallBudget 依据 006.4 压力实测标定（RTX 2080 Ti / 10 万路灯散布 / 远近混合视角）：
 * LOD on 峰值 531（近景混合机位：92 内容桶 × 6 材质组 × 主遍+影遍）+ ~20% 余量 → 650；
 * LOD off 同场景对照 7773（批次治理效果 93%↓）。见 docs/acceptance/t006/006.4。
 */
export const BATCH_POLICY: BatchControlPolicy = {
  drawCallBudget: 650,
  budgetAlertIntervalMs: 5000,
  levelInstanceKeep: { high: 1, mid: 1, low: 0.5 },
  sparseMergeMaxInstances: 32,
  mergeGroupFactor: 2,
};

/**
 * 确定性抽稀规则（纯函数，同输入逐位同输出——绝不引入每帧随机）：
 * 按实例稳定序（撒点输出 = cell 行序，块内确定性）索引 i 与保留比例 r 判存——
 * `keep(i) = (i·r mod 1) < r`。性质：
 *  - r = 1 恒保留（high 全保真）；r → 0 恒剔除；i = 0 恒保留（r > 0 时）；
 *  - 保留数 = ⌈n·r⌉ 或 ⌈n·r⌉±0（Bresenham 式均匀步进——空间上按 cell 序均匀摊开，
 *    无边缘聚集偏置）；
 *  - 与邻居实例无关（索引即身份）：同 (seed, 块, 档) 结果逐位一致，跨档往返确定性。
 */
export function keepThinnedInstance(index: number, keepRatio: number): boolean {
  if (!(keepRatio > 0)) return false; // ≤0 / NaN：全剔除（比例域防御）
  if (keepRatio >= 1) return true; // 全保真（含 high 恒 1）
  const frac = (index * keepRatio) % 1;
  return frac < keepRatio;
}
