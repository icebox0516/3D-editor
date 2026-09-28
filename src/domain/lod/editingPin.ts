/**
 * domain/lod/editingPin —— 编辑态优先级 pin 判定纯函数（T021.7，D41 §十二）。
 *
 * 职责：「pin 集与选档结果的合成」的 domain 表达——编辑态四类目标（selected /
 *      transforming / gizmo target / focusObjects 相机飞行目标）在 Scheduler 层
 *      每帧强制 `High`（含 Shadow full + Fade 1 的规范要求由高档位策略/过渡机制
 *      自然承载：high 档 ShadowPolicy = {cast, receive, depth:'full'}、硬切完成即
 *      满呈现）。pin 是**每帧派生覆盖**：不写 SelectionState 持久字段、不进 Scene /
 *      Command / 撤销重做（§十五.10「修改 Scene 持久数据保存 LOD 状态」禁令的
 *      正面表述）；编辑结束（目标退出 pin 集）下一帧恢复正常调度（选档评估器以
 *      当帧距离重判，迟滞参考 current 已随 pin 期收敛为高档）。
 * 边界：纯函数零 THREE（check:layers 强制）；不感知 pin 集从哪来（选中服务 /
 *      gizmo / focus 窗口的信号装配归组合根，见 runtime/services/EditingPinHub）；
 *      与 LOD 总开关正交（lodEnabled=false 本就恒 high，pin 覆盖同值幂等）。
 * 语义细节（与 evaluateLodRepresentation 的 lodEnabled=false 分支同纪律）：
 *      pin 目标档经 resolveDeclaredRepresentation('high', declared) 跳档映射——
 *      未声明 high 的奇异资产回落最近已声明表示，保持「Runtime 只请求已声明表示」
 *      （lod-spec §6；回落是防御面不是协议依赖，§2.3）。'culled' 是调度产出而非
 *      表示：pin 覆盖对 culled 同样生效（被 pin 的超远对象强制高档解除裁剪——
 *      选中远处对象/聚焦远处目标时所见即所得）。
 */
import { resolveDeclaredRepresentation } from './lodEvaluation';
import type { LodSelectionOutcome, RuntimeRepresentation } from './representation';

/**
 * 编辑态 pin 合成（纯函数）：调度判定产出在 pin 期覆盖为「该资产有效链内的
 * high」（跳档映射防未声明请求）；未 pin 时原样返回（identity——零行为变化，
 * 既有调度路径不经过本函数的分支语义不变）。
 * 消费方：放置链 frameLod 逐对象合成（散布链无对象身份，不消费 pin——D41 §十二
 * pin 目标是编辑对象 id，散布实例映射回区域是 T003.3 语义、无逐实例身份）。
 */
export function pinnedSelectionOutcome(
  selection: LodSelectionOutcome,
  pinned: boolean,
  declared: readonly RuntimeRepresentation[],
): LodSelectionOutcome {
  if (!pinned) return selection;
  return resolveDeclaredRepresentation('high', declared);
}
