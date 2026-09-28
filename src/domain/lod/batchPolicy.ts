/**
 * domain/lod/batchPolicy —— Runtime 批次与密度策略常量（T006.4 立项；T021.4 批次键
 * 迁移 + 密度职责废止重定义，D41）。
 *
 * 职责：批次治理（draw call 预算上限 + 告警节流、合批允许面按表示配置、稀疏块合并
 *      阈值）+ 密度抽稀确定性规则原语（Density 输入面——与表示完全独立，§八）。
 *      落点理由（记档，沿 T006.4）：与 LOD_THRESHOLDS 同族「Runtime 全局策略常量」——
 *      批次控制与选档一样全资产统一、禁止逐资产 Profile 字段（D27.12 无消费者字段
 *      全禁）；落 domain 纯数据（零 THREE）使常量与确定性规则可 node 直测（「一次锁
 *      全量」测试先例沿 LOD_THRESHOLDS）。消费方 = ScatterChunkManager（合批允许面 /
 *      合并阈值 / 密度输入面）与 Renderer（预算告警，经 runtime/budgetAlert）。
 * 边界：纯数据 + 纯函数，零 THREE；不进资产 Profile、不进 Scene/Command；撒点确定性
 *      契约（domain/scatter）不经参数扩展——抽稀在 runtime 消费侧按实例稳定序过滤
 *      （006.4 记档裁定沿）。
 *
 * ✅ 数值状态 = **已锁定（drawCallBudget 024.5 重测重锁）**（T006.5 验收门
 *   2026-09-19 docs/acceptance/t006/006.5/；021.8 重锁 2026-09-24；024.5 重锁
 *   2026-09-28）：
 *   - sparseMergeMaxInstances / mergeGroupFactor / budgetAlertIntervalMs：锁定值不动
 *     （合并桶压缩 4,096 → ~300 桶运行实测通过）；数值变更须重开实测锁定记档（沿
 *     「一次锁全量」测试断言联动）。
 *   - drawCallBudget = 2000：**024.5 重测重锁**（沿 021.8「重测重锁」先例，D41 §九
 *     / D45）——T024 双卡混植（材质卡预设）后 DC 包络重测（证据锚：
 *     docs/acceptance/T024/024.5/perf-mixed/results.json）：2000 实例 × 13 树 ×
 *     {default, autumn} 双卡最重合法包络 = 真近机位(D150) DC 1677 沉降态（中景
 *     1461 / far 449m 801）。021.8 重锁值 1500 在双卡混植近景合法机位持续误报
 *     观测告警（budgetAlert 是批次治理观测告警、非降级——误报本身污染信号）→
 *     重锁值 = 最重实测 1677 × ~1.19 跨机余量：正常包络（≤1677）零误报，结构性
 *     批次爆炸（>2000 级）仍触发。单卡基线（021.8：混植 13 种最重 1011 @真近
 *     D150，叙述见下）保留记档——预算行仍作单卡回归基线记录。消费面（budgetAlert
 *     超限告警）保留不删——纯观测治理面。
 *   - batchMergeAllowed：第一版 = legacy 等值面（high 恒否、其余允许）——批次键从
 *     level 迁移到 representation，允许面本身不变（§九「第一版保留不动」）；canopy
 *     桶实测数过多时才提升区域级合批（021.8 判定）。
 *
 * 密度职责废止记档（T021.4，D41 §八）：T006.4 的 `levelInstanceKeep:
 * Record<ProceduralLevel, number>`（T006.5 锁定值 { high: 1, mid: 1, low: 0.5 }）把
 * 「几何降档」与「实例抽稀」耦合——**该模型被 D41 六概念分离整体取代**：Density 是
 * 与 Representation 完全独立的 Policy（表示 = 树变成什么；密度 = 树还保留多少棵），
 * 不再按档位/表示配置保留比例。全表示（High/Mid/Low/Canopy）默认密度 100%
 * （DENSITY_FULL_KEEP）；**不得自动继承旧 low=0.5 半量行为**（几何降档不触发实例
 * 抽稀——选档换表示不丢实例）。75% / 50% 只存在于 021.8 Density 专项的独立 A/B
 * 通道（§十四：100% 达预算不得为进一步优化默认降密）——本模块只保留确定性规则原语
 * （keepThinnedInstance / thinInstances）作为该通道的输入面，**不实装档位旋钮**
 * （防幽灵字段纪律 D27.7/D27.12：无消费者的配置位全禁）。
 */

import type { RuntimeRepresentation } from './representation';

/** Runtime 全局批次控制策略（数值语义与消费方见各字段注） */
export interface BatchControlPolicy {
  /**
   * draw call 预算上限（renderer.info.render.calls 口径，主遍 + 影遍合计——分遍渲染模式下
   * 为最后遍口径，与 getViewportStats 同源）。超限 = console 节流告警（不做运行时降级——
   * 治理观测面，降级手段归表示/密度策略）。006.4 实测标定 + 006.5 验收门锁定（见
   * docs/acceptance/t006/006.4 与 006.5）；021.8 重测重锁 1500（单卡混植最重
   * 1011 × ~1.5 余量，D41 §九）；024.5 双卡混植重测重锁 2000（最重实测 1677 ×
   * ~1.19 跨机余量，D45——重锁记档与证据锚见模块头注）。
   */
  drawCallBudget: number;
  /** 预算超限告警最小间隔（毫秒）：连续超限帧至多每 interval 一次告警，不刷屏 */
  budgetAlertIntervalMs: number;
  /**
   * 合批允许面：各表示是否允许并入超块合并桶（D41 §九——批次策略键从 level 迁移
   * 绑 representation，isBatchMergeAllowed 消费）。第一版 = legacy 等值面：
   * high 恒否（近处全保真 + 保持细粒度视锥剔除），mid / low / canopy 允许（canopy
   * 天然适合 chunk × asset × canopy 远景合批，§九）。32m 块 + 2×2 稀疏合并第一版
   * 保留不动（sparseMergeMaxInstances / mergeGroupFactor）。
   */
  batchMergeAllowed: Record<RuntimeRepresentation, boolean>;
  /**
   * 稀疏块合并阈值：允许合批表示下 (块×资产) 实例数 ≤ 该值时并入超块合并桶（相邻
   * 同资产块共享一个 InstancedMesh——防「块×资产×表示」批次爆炸）。
   */
  sparseMergeMaxInstances: number;
  /** 合并组超块因子（每轴块数；2 = 2×2 块 = 64m 超块 @32m 块。≥2 生效） */
  mergeGroupFactor: number;
}

/**
 * Runtime 全局批次控制策略（T006.5 实测锁定 + drawCallBudget 021.8 / 024.5 两轮
 * 重测重锁——依据见模块头注）。
 * drawCallBudget 依据 006.4 压力实测标定（RTX 2080 Ti / 10 万路灯散布 / 远近混合视角）：
 * LOD on 峰值 531（近景混合机位：92 内容桶 × 6 材质组 × 主遍+影遍）+ ~20% 余量 → 650
 * （legacy 历史口径）；LOD off 同场景对照 7773（批次治理效果 93%↓）。见
 * docs/acceptance/t006/006.4。
 * 021.8 重测重锁追加段：T021 加入 Canopy / 双表示 / Shadow 表示后 DC 包络重测（Phase A
 * 标定 + Phase C 实测，docs/acceptance/t021/021.8/）——2000 混植 13 种最重合法包络 =
 * 真近机位(D150) DC 1011，legacy 650 在混植近景/中景合法机位持续误报 → 1500 =
 * 1011 × ~1.5 余量（正常包络零误报、千级以上结构性批次爆炸仍触发，D41 §九）——
 * 单卡混植基线，保留记档。
 * 024.5 重测重锁追加段（沿 021.8 先例，D45）：T024 双卡混植（2000 实例 × 13 树 ×
 * {default, autumn} 材质卡）DC 包络重测（docs/acceptance/T024/024.5/perf-mixed/
 * results.json）——最重合法包络 = 真近机位(D150) DC 1677 沉降态（中景 1461 /
 * far 449m 801），1500 在双卡近景合法机位持续误报 → 2000 = 1677 × ~1.19 跨机余量
 * （正常包络零误报、>2000 级结构性批次爆炸仍触发）。
 */
export const BATCH_POLICY: BatchControlPolicy = {
  drawCallBudget: 2000,
  budgetAlertIntervalMs: 5000,
  batchMergeAllowed: { high: false, mid: true, low: true, canopy: true },
  sparseMergeMaxInstances: 32,
  mergeGroupFactor: 2,
};

/**
 * 合批允许面判定（纯函数，D41 §九 isBatchMergeAllowed(representation) 形态）：
 * 批次策略键 = RuntimeRepresentation（非 ProceduralLevel）。policy 可注入（测试 /
 * 021.8 重锁通道），缺省 BATCH_POLICY。JS 侧手写脏表（缺键 / 非布尔）防御收 false。
 */
export function isBatchMergeAllowed(
  representation: RuntimeRepresentation,
  policy: BatchControlPolicy = BATCH_POLICY,
): boolean {
  return policy.batchMergeAllowed[representation] === true;
}

/**
 * Density Policy 现值（T021.4，D41 §八）：全表示默认密度 100%（保留比例 1）。
 * 「Cull = 0%」是提交终态语义（culled 单元零提交）——不进本常量（终态不是表示，
 * §三.1）。消费：ScatterChunkManager 写入路径（选档换表示不丢实例——100% 下
 * thinInstances 零拷贝返回）。75% / 50% 归 021.8 Density 专项 A/B 通道，本值是
 * 唯一运行时密度（不实装档位旋钮——防幽灵字段 D27.7）。
 */
export const DENSITY_FULL_KEEP = 1;

/**
 * 确定性抽稀规则（纯函数，同输入逐位同输出——绝不引入每帧随机）：
 * 按实例稳定序（撒点输出 = cell 行序，块内确定性）索引 i 与保留比例 r 判存——
 * `keep(i) = (i·r mod 1) < r`。性质：
 *  - r = 1 恒保留（100% 全保真）；r → 0 恒剔除；i = 0 恒保留（r > 0 时）；
 *  - 保留数 = ⌈n·r⌉ 或 ⌈n·r⌉±0（Bresenham 式均匀步进——空间上按 cell 序均匀摊开，
 *    无边缘聚集偏置）；
 *  - 与邻居实例无关（索引即身份）：同 (seed, 块, 密度) 结果逐位一致，跨密度往返确定性。
 */
export function keepThinnedInstance(index: number, keepRatio: number): boolean {
  if (!(keepRatio > 0)) return false; // ≤0 / NaN：全剔除（比例域防御）
  if (keepRatio >= 1) return true; // 全保真（含 DENSITY_FULL_KEEP）
  const frac = (index * keepRatio) % 1;
  return frac < keepRatio;
}

/**
 * 实例列表密度过滤（Density 输入面，T021.4 §八）：按密度（保留比例）对实例稳定序做
 * 确定性过滤——keepThinnedInstance 逐索引判定。**密度与表示完全独立**（本函数不感知
 * 表示——Density Policy 从档位语义剥离的结构表达）：运行时写入路径恒以
 * DENSITY_FULL_KEEP 调用（100% 默认下行为 = 不抽稀，≥1 零拷贝返回原列表）；
 * density ∈ (0,1) 的降密值只存在于 021.8 Density 专项 A/B 通道（测试经本注入面
 * 显式变化论证「同表示不同密度」独立性，不实装运行时旋钮）。
 */
export function thinInstances<T>(list: readonly T[], density: number): readonly T[] {
  if (density >= 1) return list; // 100% 全保真：零拷贝（默认行为 = 不抽稀）
  const kept: T[] = [];
  for (let i = 0; i < list.length; i++) {
    if (keepThinnedInstance(i, density)) kept.push(list[i]!);
  }
  return kept;
}
