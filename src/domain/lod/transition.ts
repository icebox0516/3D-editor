/**
 * domain/lod/transition —— 表示过渡状态机纯函数（T021.3，D41 §五）。
 *
 * 职责：Selection（021.2 评估器，含迟滞——防选择震荡）之后的「怎么切」：
 *      dither / fade / 硬切分型 + sourceReady 排队 + metric 空间过渡带推进 + 提交决策
 *      （双表示各提交与否、fade 值、完成迁移、阴影中点事件、终态 cull）。
 *      运行面规范唯一真相源 = docs/procedural-assets/representation-runtime.md §五；
 *      本模块只实现机制，不感知资产类型（§十五.1）、不接 Shadow 实际行为（中点切换
 *      只暴露判定面，策略与接线归 021.5）、不做双 Shadow 交叉渐变（§5.4）。
 *
 * 帧推进口径裁定（任务书留白「deltaTime 或 metric 步进」按规范裁定 = **metric 步进**）：
 *      §5.2「过渡带宽度定义在 metric 空间（候选比例，021.8 锁定）」——过渡进度是
 *      统一度量 m 的纯函数，不是墙钟时间函数。性质：
 *      - 帧率无关、确定性（同 m 同进度）、可逆（相机回退 fade 反向回落）；
 *      - 状态机不引入第二震荡源：所有 fade 值 = 当前决策对 (current, target) 下 m 的
 *        连续单调函数，唯一的状态量是 SelectionState 本身（D41 §10.1 五字段原形，
 *        不设第三字段——pending 并入 target + sourceReady）；
 *      - 代价记档：静止相机停在带内时双表示持续并存（可观测面 =
 *        lodDistribution transition.dualSubmitBuckets，红线 +30 的判定归 021.8）。
 *
 * 过渡带锚定（防跳变的关键不变量，双向过渡都从 (1,0) 起步、在 (0,1) 完成）：
 *      - 降档带 [B, B·(1+W)]（B = 名义边界，W = TRANSITION_BAND_RATIO）——名义线触发，
 *        触发帧 f=0 → fade 无跳变；
 *      - 升档带 [B·(1−H) − B·W, B·(1−H)]（H = hysteresisBand）——迟滞线触发（决策层
 *        021.2 语义：升档需越过名义上界 × (1−H)），触发帧 f=0 → fade 无跳变；
 *      - fade-out 退场带 [B_c, B_c·(1+W)]（B_c = canopyToCulled）——决策过线触发退场、
 *        回退线内自然回升（迟滞线下侧 f 恒 0，决策翻转点无跳变）；终态 cull 在 f=1，
 *        恢复（un-cull）随 f<1 自动解除，无独立锁存。
 *      - 迟滞带（选档）与过渡带（fade）参数分离不共用（§五开篇硬规则）。
 *
 * 硬切型（High↔Mid、Mid↔Low、多级跳档、非 {low,canopy} 起点的 cull）= 瞬时完成；
 *      双表示共存仅存在于 sourceReady 排队期（旧表示持续渲染到新档源就绪——沿既有
 *      pendingLevel / lod.pending 语义，迟到一帧可接受）。硬切位不写 fade 值
 *      （无消费者不写占位数据——D41 派遣简报裁定）。
 *
 * 边界：纯函数零 THREE（check:layers 强制）；不回引 runtime；selection 输入 =
 *      LodSelectionOutcome（决策层产出，含 'culled' 提交终态——终态不是表示 §三.1，
 *      不进 SelectionState.target）。
 */
import { LOD_THRESHOLDS } from './lodPolicy';
import type { LodThresholds } from './lodPolicy';
import { REPRESENTATION_ORDER } from './representation';
import type { LodSelectionOutcome, RuntimeRepresentation, SelectionState } from './representation';

/**
 * 过渡分型（D41 §五.1 第一阶段默认 + 021.3 派遣简报既有链验证位）：
 * - 'hard-cut'：瞬时切换（High↔Mid、Mid↔Low、多级跳档、非退场起点的 cull）；
 * - 'dither'：双表示交叉渐变（{mid|low} ↔ canopy 两个方向——「Mid/Low → Canopy」
 *   规范写的是降档方向，升档方向同为 dither：Fade 专项「靠近 / 往返无明显 pop」
 *   要求升档也走交叉渐变，且升档带锚定在迟滞线（见模块头注）保证触发帧无跳变）；
 * - 'fade-out'：单表示退场（Canopy → Culled 规范分型；Low → Culled 为既有链的
 *   fade 机制验证载体——021.3 派遣简报明文。High/Mid 起点的 cull 不走 fade
 *   （无该两位的退场分型授权，维持瞬时 cull 现状——streetlamp/GLB 行为零变化））；
 * - 'none'：selection === current（稳态 / 决策回落）。
 */
export type TransitionKind = 'none' | 'hard-cut' | 'dither' | 'fade-out';

/** fade-out 退场分型的合法起点表示（§五.1 Canopy→Cull + 021.3 简报 Low 退场验证载体） */
const CULL_FADE_OUT_FROM: ReadonlySet<RuntimeRepresentation> = new Set(['low', 'canopy']);

/**
 * 过渡带宽度（**候选值，021.8 A/B 重锁**，D41 §5.2）：metric 空间的相对比例——
 * 带宽 = 触发边界 × RATIO（降档带 / fade-out 带锚定名义边界，升档带锚定迟滞线，
 * 宽度同为 边界 × RATIO）。初值 0.25：与迟滞带 0.15 同量级偏宽（过渡带覆盖迟滞带
 * 之上的一段行程，屏占比 6.25% 档位处 m 跨度 4）；未经实测——021.6 canopy 内容
 * 接入后由 021.8 标定验收门重锁，重锁须连带更新测试「一次锁全量」断言并记档。
 */
export const TRANSITION_BAND_RATIO = 0.25;

/** 表示序数（与 lodEvaluation 的调度序数同基 = REPRESENTATION_ORDER 固定序） */
function ordinalOf(rep: RuntimeRepresentation): number {
  const index = REPRESENTATION_ORDER.indexOf(rep);
  return index >= 0 ? index : 0; // 防御（类型完备；运行时 rep 恒为四值域成员）
}

/**
 * 过渡分型判定（纯函数，按表示对查表——不感知资产类型 §十五.1）：
 * selection === current → 'none'；'culled' → 起点在 CULL_FADE_OUT_FROM 为
 * 'fade-out' 否则 'hard-cut'；表示对含 canopy 且另一侧为 mid/low → 'dither'
 * （双向）；其余（相邻几何档位对 / 多级跳档）→ 'hard-cut'。
 */
export function transitionKindOf(
  current: RuntimeRepresentation,
  selection: LodSelectionOutcome,
): TransitionKind {
  if (selection === current) return 'none';
  if (selection === 'culled') {
    return CULL_FADE_OUT_FROM.has(current) ? 'fade-out' : 'hard-cut';
  }
  if (selection === 'canopy') {
    return current === 'mid' || current === 'low' ? 'dither' : 'hard-cut';
  }
  if (current === 'canopy') {
    return selection === 'mid' || selection === 'low' ? 'dither' : 'hard-cut';
  }
  return 'hard-cut';
}

/**
 * 表示对的名义边界（dither 带锚点；非 dither 对返回值不消费）：
 * 对内最大序数 ≥ low（2）→ midToCanopy（{mid,low} / {low,canopy} / {mid,canopy}
 * 的名义线——021.2 名义区间三边界口径，low 经跳档承接 canopy 名义区同线），
 * 否则 highToMid（{high,mid}）。
 */
function pairBoundaryOf(
  a: RuntimeRepresentation,
  b: RuntimeRepresentation,
  thresholds: LodThresholds,
): number {
  return Math.max(ordinalOf(a), ordinalOf(b)) >= 2
    ? thresholds.midToCanopy
    : thresholds.highToMid;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** 稳态 SelectionState（current === target、无过渡；两链首评 / 完成归位共用） */
export function steadySelectionState(rep: RuntimeRepresentation): SelectionState {
  return { current: rep, target: rep, sourceReady: true, transition: 0, transitionActive: false };
}

/**
 * 单帧提交决策（状态机输出面；消费方 = 两链执行层，映射到各自桶/实例机制）：
 * - submitCurrent / submitTarget：双表示各是否提交像素（false = 无需建桶 / 整桶
 *   零提交——fade 0 的客座侧不提交，省 DC 且避免无消费者期的双渲染）；
 * - fadeCurrent / fadeTarget：双侧呈现度 [0,1]（1 = 完整呈现，0 = 完全退场；
 *   两侧互补恒和 1——dither 交叉语义）。**GL 属性缝消费的是退场度 = 1 − 呈现度**
 *   （runtime aFadeOut，缺省安全 0 = 完整呈现，见 fadeGeometry 契约注）；
 * - completed：本帧完成迁移（current := target）——硬切源就绪即时 / dither 带末；
 * - culled：终态 cull（本帧起零提交）——硬切 cull 瞬时 / fade-out 到 0；
 * - shadowRepresentation / midpointCrossed：阴影中点切换判定面（§5.4 只留钩子——
 *   transition 跨 0.5 时 shadow 表示应从 current 切到 target，事件 = 上帧 < 0.5
 *   且本帧 ≥ 0.5 的边沿；策略与 Shadow 接线归 021.5，本任务零 Shadow 行为）。
 *   fade-out 型退场无目标表示：shadow 恒 current、midpointCrossed 仍发事件面。
 */
export interface TransitionCommit {
  readonly submitCurrent: boolean;
  readonly submitTarget: boolean;
  readonly fadeCurrent: number;
  readonly fadeTarget: number;
  readonly completed: boolean;
  readonly culled: boolean;
  readonly shadowRepresentation: RuntimeRepresentation;
  readonly midpointCrossed: boolean;
}

/** 状态机单帧输入（SelectionState 上一帧值由两链持有传入——评估器无状态惯例同构） */
export interface TransitionStepInput {
  /** 上一帧 SelectionState（本状态机零内部簿记：固定带锚定下全部输出可由输入重导） */
  state: SelectionState;
  /** 本帧选档判定产出（021.2 评估器输出 = 决策层，含迟滞；'culled' 为提交终态） */
  selection: LodSelectionOutcome;
  /** 本帧统一度量 m（过渡带推进输入；两链与选档同一 subject 口径算得） */
  metric: number;
  /** 目标表示 Source 是否就绪（排队语义：false = 等待，不开始过渡、不切提交；
   *  'culled' 无目标源恒视为就绪——调用方传 true） */
  sourceReady: boolean;
  /** 缺省 LOD_THRESHOLDS（候选值，021.8 重锁） */
  thresholds?: LodThresholds;
  /** 缺省 TRANSITION_BAND_RATIO（候选值，021.8 重锁） */
  bandRatio?: number;
}

/** 状态机单帧输出：推进后的 SelectionState + 提交决策（输入对象不复用、零突变） */
export interface TransitionStepResult {
  readonly state: SelectionState;
  readonly commit: TransitionCommit;
}

/**
 * 过渡状态机主步进（纯函数：同输入逐位同输出）。分支总览见模块头注；
 * 不变量：任何决策翻转点的 fade 值连续（触发帧恒 (1,0)——过渡不得引入第二震荡源）。
 */
export function stepTransition(input: TransitionStepInput): TransitionStepResult {
  const thresholds = input.thresholds ?? LOD_THRESHOLDS;
  const band = input.bandRatio ?? TRANSITION_BAND_RATIO;
  const prev = input.state;
  const current = prev.current;
  const selection = input.selection;
  const m = input.metric;

  // 稳态 / 决策回落到当前表示：fade-out 反向在迟滞线下侧恒 f=0、dither 未完成回退
  // 在名义线下侧恒 f=0——决策翻转点的呈现度与本帧稳态呈现度逐位一致（无跳变）
  if (selection === current) {
    return {
      state: steadySelectionState(current),
      commit: {
        submitCurrent: true,
        submitTarget: false,
        fadeCurrent: 1,
        fadeTarget: 0,
        completed: false,
        culled: false,
        shadowRepresentation: current,
        midpointCrossed: false,
      },
    };
  }

  const kind = transitionKindOf(current, selection);

  // 终态 cull：fade-out 型按退场带推进（§5.1 Canopy→Cull；Low→Cull 既有链验证载体）；
  // 其余起点瞬时终态（现状行为零变化——streetlamp / GLB / 多级跳档）
  if (selection === 'culled') {
    if (kind === 'fade-out') {
      const boundary = thresholds.canopyToCulled;
      const f = clamp01((m - boundary) / (boundary * band));
      return {
        state: {
          current,
          target: current, // 'culled' 不进 target（提交终态非表示，§三.1）
          sourceReady: true,
          transition: f,
          transitionActive: f > 0 && f < 1,
        },
        commit: {
          submitCurrent: f < 1,
          submitTarget: false,
          fadeCurrent: 1 - f,
          fadeTarget: 0,
          completed: false,
          culled: f >= 1,
          shadowRepresentation: current,
          midpointCrossed: prev.transition < 0.5 && f >= 0.5,
        },
      };
    }
    return {
      state: { current, target: current, sourceReady: true, transition: 1, transitionActive: false },
      commit: {
        // fadeCurrent = 1（满呈现直至瞬时移除）：硬切位无 fade 消费——消费侧据此
        // 零写零缓冲（「无消费者不写占位数据」，021.3 派遣简报裁定）
        submitCurrent: false,
        submitTarget: false,
        fadeCurrent: 1,
        fadeTarget: 0,
        completed: false,
        culled: true,
        shadowRepresentation: current,
        midpointCrossed: false,
      },
    };
  }

  // 表示目标（selection 为 rep ≠ current）
  const target = selection;

  // 硬切：源就绪瞬时完成；未就绪排队（不开始过渡、不切提交——双表示共存仅存在于
  // 排队期的旧表示侧，沿既有 pendingLevel / lod.pending 语义）
  if (kind === 'hard-cut') {
    if (!input.sourceReady) {
      return {
        state: { current, target, sourceReady: false, transition: 0, transitionActive: false },
        commit: {
          submitCurrent: true,
          submitTarget: false,
          fadeCurrent: 1,
          fadeTarget: 0,
          completed: false,
          culled: false,
          shadowRepresentation: current,
          midpointCrossed: false,
        },
      };
    }
    return {
      state: steadySelectionState(target),
      commit: {
        submitCurrent: false,
        submitTarget: true,
        fadeCurrent: 0,
        fadeTarget: 1,
        completed: true,
        culled: false,
        shadowRepresentation: target,
        midpointCrossed: false,
      },
    };
  }

  // dither：带宽 = 名义边界 × band（metric 空间）。降档带锚名义线、升档带锚迟滞线
  // （锚定依据见模块头注）；源未就绪时进度保持 0（排队），就绪后跳到 f(m) 补齐
  // （冷源迟到一帧可接受——沿既有语义）
  const boundary = pairBoundaryOf(current, target, thresholds);
  const width = boundary * band;
  const downgrade = ordinalOf(target) > ordinalOf(current);
  const f = downgrade
    ? clamp01((m - boundary) / width)
    : clamp01((boundary * (1 - thresholds.hysteresisBand) - m) / width);
  const progressed = input.sourceReady ? f : 0;
  const completed = progressed >= 1;
  return {
    state: completed
      ? steadySelectionState(target)
      : {
          current,
          target,
          sourceReady: input.sourceReady,
          transition: progressed,
          transitionActive: input.sourceReady && progressed > 0,
        },
    commit: {
      submitCurrent: !completed,
      submitTarget: !completed && progressed > 0,
      fadeCurrent: completed ? 0 : 1 - progressed,
      fadeTarget: progressed,
      completed,
      culled: false,
      shadowRepresentation: progressed >= 0.5 ? target : current,
      midpointCrossed: prev.transition < 0.5 && progressed >= 0.5,
    },
  };
}
