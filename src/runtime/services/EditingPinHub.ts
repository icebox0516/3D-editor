/**
 * runtime/services/EditingPinHub —— 编辑态优先级 pin 信号聚合器（T021.7，D41 §十二）。
 *
 * 职责：把四类编辑目标信号（selected / transforming / gizmo target / focusObjects
 *      目标）装配成「每帧派生的只读 pin id 集」，经 Renderer 注入放置链 frameLod 消费
 *      （pinnedSelectionOutcome 域合成 → 强制高档）。装配在组合根（bootstrap）：
 *      本类只提供可组合的信号源注册面 + focus 短窗口登记面，不依赖任何具体编辑服务
 *      （SelectionManager / GizmoImpl / CameraController 互不可见——Renderer 也只见
 *      `getEditingPinIds(): ReadonlySet<ID>` 窄回调）。
 *
 * 形态裁定（派遣简报「每帧派生、零状态残留」）：
 *  - 选中 / gizmo 目标 = **活信号源**（collect 形态：调用方注入闭包 live 读服务现状，
 *    hub 不缓存不订阅——选中集变化下一帧自动反映，零事件接线零残留）；
 *  - transforming ⊆ gizmo target（拖拽仅发生于 attach 集）且非 gizmo 变换路径
 *    （属性面板 / 键盘 nudge / 阵列）作用于选中集——两类活源已覆盖规范四类目标的
 *    前三类，无第三信号面；
 *  - focusObjects 目标 = **短窗口 pin**（时间窗）——本项是规范「相机飞行期间」在现状
 *    下的最小合规裁定，见 FOCUS_PIN_WINDOW_MS 注。
 *
 * 边界：纯 TS 零 THREE；pin 集只含对象 id（渲染派生调度输入），不进 Scene / Command /
 *      撤销重做（§十五.10）；不感知散布链（散布无对象身份，pin 消费面只在放置池）。
 */
import type { ID } from '../../core/types';

/**
 * focus pin 时间窗（**裁定值，非规范锁定**）：规范 §十二 写「focusObjects 目标
 * （相机飞行期间）」，但现状 CameraController.focusBox 是瞬时跳变定位（无飞行动画，
 * 126-141 行直接 copy position/target）——本 Step 禁止新建相机飞行动画系统，故取
 * 最小合规 = focus 调用时对目标 id 登记短时间窗 pin，窗口内强制高档、窗口外自然恢复。
 * 取值依据：① focusBox 取景几何使目标 m ≈ 1.4（直径占视口大半）→ 窗口内外选档
 * 天然 high，窗口本质是防御面（迟滞带内滞留低档的兜底 + 覆盖未来若引入飞行动画的
 * 过渡期）；② 时间窗独立于渲染节奏（暂停/掉帧不拉长 pin）；③ 量级 = 帧周期 ×~40
 * （用户感知「刚聚焦完」的余韵区间）。021.8 复核维持（证据锚
 * docs/acceptance/t021/021.8/calibration/README.md 结论总表⑧）：产品路径实测窗口
 * 607ms ≈ 600 + 帧粒度——canopy 距离选中即 pin 强制 high、到期自动降档，0.6s 余韵
 * 未见偏短（掉档前有充分观察窗）或偏长（非编辑态占用 <0.7s）证据，量级合适。
 */
export const FOCUS_PIN_WINDOW_MS = 600;

/** 活信号源：把当前目标 id 收进调用方集合（live 读——hub 不缓存） */
export type EditingPinSource = (into: Set<ID>) => void;

/** 空集单例（无编辑活动时的 getIds 返回——帧路径零分配、消费方 size===0 快进） */
const EMPTY_IDS: ReadonlySet<ID> = new Set<ID>();

export class EditingPinHub {
  private readonly sources = new Set<EditingPinSource>();
  /** focus 短窗口登记：id → 窗口截止时刻（now 时钟口径，构造注入可测） */
  private readonly focusDeadlines = new Map<ID, number>();
  private readonly now: () => number;

  constructor(now: () => number = () => performance.now()) {
    this.now = now;
  }

  /** 注册活信号源（幂等；重复注册同一函数引用只记一次） */
  addSource(source: EditingPinSource): void {
    this.sources.add(source);
  }

  /** 注销信号源（编辑服务拆除时；未注册为 no-op） */
  removeSource(source: EditingPinSource): void {
    this.sources.delete(source);
  }

  /**
   * focus 短窗口 pin 登记（CameraController.focusObjects 解析到目标后经组合根回调）：
   * 逐 id 记截止时刻（重复 focus 刷新窗口）。过期清理由 getIds 顺带完成（惰性——
   * 无渲染循环消费时残留条目无害：时间基判定，下次调用自清）。
   */
  pinFocus(ids: readonly ID[], windowMs: number = FOCUS_PIN_WINDOW_MS): void {
    const deadline = this.now() + windowMs;
    for (const id of ids) this.focusDeadlines.set(id, deadline);
  }

  /**
   * 每帧派生的 pin id 并集（只读视图，当帧有效——不缓存跨帧）：活源 collect +
   * 未过期 focus 窗口；全空返回共享空集单例（常见路径零分配）。每调用新建结果集
   * （消费方 Renderer → frameLod 同帧同步消费，安全持有）。
   */
  getIds(): ReadonlySet<ID> {
    const out = new Set<ID>();
    for (const collect of this.sources) collect(out);
    if (this.focusDeadlines.size > 0) {
      const current = this.now();
      for (const [id, deadline] of this.focusDeadlines) {
        if (deadline <= current) this.focusDeadlines.delete(id); // 惰性过期清理
        else out.add(id);
      }
    }
    return out.size > 0 ? out : EMPTY_IDS;
  }
}
