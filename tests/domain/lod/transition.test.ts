/**
 * tests/domain/lod/transition.test.ts —— 表示过渡状态机纯函数测试（T021.3，D41 §五）。
 *
 * 覆盖：
 * - 分型表（transitionKindOf）：High↔Mid / Mid↔Low 硬切；{mid|low}↔canopy 双向 dither；
 *   canopy/low → culled fade-out；high/mid → culled 与多级跳档硬切；同值 none；
 * - 过渡带宽度候选常量锁（TRANSITION_BAND_RATIO = 0.25，**候选、021.8 重锁**——
 *   重锁须连带更新本断言并记档）；
 * - 稳态 / 决策回落：full 提交、状态归位（SelectionState 五字段）；
 * - 硬切：源就绪瞬时完成（completed + 状态折叠 target）；未就绪排队（不开始过渡、
 *   不切提交、transition 0 / active false）；排队后就绪 → 当帧完成；
 * - dither 降档：名义线触发 f=0（fade (1,0) 起步无跳变）→ 带内推进（互补恒和 1）→
 *   带末完成（状态折叠、submitCurrent false）；带内回退 f 回落、f=0 客座不提交；
 * - dither 升档：迟滞线触发 f=0（无跳变——防第二震荡源的关键不变量）→ 带内推进 →
 *   深入完成；
 * - fade-out 退场：cull 名义线 f=0 → 带内 fadeCurrent 递减 → f=1 终态 cull
 *   （submitCurrent false）；回退自然回升（无独立锁存）；迟滞线下侧 f 恒 0
 *   （决策翻转点无跳变——un-cull 无 pop 的机制根据）；
 * - sourceReady 门控 dither：未就绪进度钳 0；就绪后跳至 f(m)（冷源追赶）；
 * - 中点事件面：midpointCrossed 仅边沿（上帧 < 0.5 且本帧 ≥ 0.5）；shadowRepresentation
 *   0.5 两侧切换（021.5 接线的判定面）；
 * - 纯函数性：同输入逐位同输出；
 * - thresholds / bandRatio 覆写生效。
 * 边界：纯函数零 THREE（check:layers）。阈值一律经 LOD_THRESHOLDS / TRANSITION_BAND_RATIO
 *      相对构造（带边界 = 名义边界 × (1 + W) 折算），不散落硬编码绝对值。
 */
import { describe, expect, it } from 'vitest';
import {
  steadySelectionState,
  stepTransition,
  transitionKindOf,
  TRANSITION_BAND_RATIO,
} from '../../../src/domain/lod/transition';
import type { TransitionCommit, TransitionStepInput } from '../../../src/domain/lod/transition';
import { LOD_THRESHOLDS } from '../../../src/domain/lod/lodPolicy';
import type { RuntimeRepresentation, SelectionState } from '../../../src/domain/lod/representation';

const T = LOD_THRESHOLDS;
const W = TRANSITION_BAND_RATIO;

/** 名义边界（mid↔canopy 位 dither 带锚点）与带宽 */
const B = T.midToCanopy;
const WIDTH = B * W;
/** cull 退场带（canopyToCulled 锚定）与终态线 */
const CB = T.canopyToCulled;
const CULL_TERMINAL = CB * (1 + W);
/** 升档触发线（迟滞线）与升档带宽（同 B 锚定宽度） */
const UPLINE = B * (1 - T.hysteresisBand);

function stateOf(current: RuntimeRepresentation, target = current): SelectionState {
  return { current, target, sourceReady: true, transition: 0, transitionActive: false };
}

function step(
  state: SelectionState,
  selection: Parameters<typeof stepTransition>[0]['selection'],
  metric: number,
  sourceReady = true,
): { state: SelectionState; commit: TransitionCommit } {
  return stepTransition({
    state,
    selection,
    metric,
    sourceReady,
  } as TransitionStepInput);
}

describe('过渡分型表（D41 §五.1 第一阶段默认 + 021.3 既有链验证位）', () => {
  it('High↔Mid / Mid↔Low 双向硬切；多级跳档硬切', () => {
    expect(transitionKindOf('high', 'mid')).toBe('hard-cut');
    expect(transitionKindOf('mid', 'high')).toBe('hard-cut');
    expect(transitionKindOf('mid', 'low')).toBe('hard-cut');
    expect(transitionKindOf('low', 'mid')).toBe('hard-cut');
    expect(transitionKindOf('high', 'low')).toBe('hard-cut');
    expect(transitionKindOf('low', 'high')).toBe('hard-cut');
    expect(transitionKindOf('canopy', 'high')).toBe('hard-cut');
  });

  it('{mid|low} ↔ canopy 双向 dither（升档方向同为 dither——Fade 专项靠近无 pop）', () => {
    expect(transitionKindOf('mid', 'canopy')).toBe('dither');
    expect(transitionKindOf('canopy', 'mid')).toBe('dither');
    expect(transitionKindOf('low', 'canopy')).toBe('dither');
    expect(transitionKindOf('canopy', 'low')).toBe('dither');
  });

  it('canopy/low → culled fade-out（规范分型 + Low 退场验证载体）；high/mid → culled 硬切', () => {
    expect(transitionKindOf('canopy', 'culled')).toBe('fade-out');
    expect(transitionKindOf('low', 'culled')).toBe('fade-out');
    expect(transitionKindOf('high', 'culled')).toBe('hard-cut');
    expect(transitionKindOf('mid', 'culled')).toBe('hard-cut');
  });

  it('selection === current → none', () => {
    for (const rep of ['high', 'mid', 'low', 'canopy'] as const) {
      expect(transitionKindOf(rep, rep)).toBe('none');
    }
  });
});

describe('策略常量（候选锁）', () => {
  it('TRANSITION_BAND_RATIO = 0.25（候选值，021.8 A/B 重锁——重锁须重开实测记档并连带更新本断言）', () => {
    expect(TRANSITION_BAND_RATIO).toBe(0.25);
  });
});

describe('稳态 / 决策回落', () => {
  it('selection === current：full 提交当前表示、状态归位（五字段）', () => {
    const prev = stateOf('mid', 'canopy'); // 假设的任意旧状态
    const { state, commit } = step(prev, 'mid', 17);
    expect(state).toEqual(steadySelectionState('mid'));
    expect(commit).toMatchObject({
      submitCurrent: true,
      submitTarget: false,
      fadeCurrent: 1,
      fadeTarget: 0,
      completed: false,
      culled: false,
      shadowRepresentation: 'mid',
      midpointCrossed: false,
    });
  });

  it('steadySelectionState 形状 = D41 §10.1 五字段（current==target、无过渡）', () => {
    expect(steadySelectionState('low')).toEqual({
      current: 'low',
      target: 'low',
      sourceReady: true,
      transition: 0,
      transitionActive: false,
    });
  });
});

describe('硬切（瞬时完成 / sourceReady 排队）', () => {
  it('源就绪：瞬时完成——completed + 状态折叠 target、双侧提交切换', () => {
    const { state, commit } = step(stateOf('high'), 'mid', 7, true);
    expect(commit.completed).toBe(true);
    expect(commit.submitCurrent).toBe(false);
    expect(commit.submitTarget).toBe(true);
    expect(commit.fadeTarget).toBe(1);
    expect(state).toEqual(steadySelectionState('mid'));
  });

  it('源未就绪：排队——不开始过渡、不切提交（双表示共存仅存在于排队期旧表示侧）', () => {
    const { state, commit } = step(stateOf('high'), 'mid', 7, false);
    expect(commit).toMatchObject({
      submitCurrent: true,
      submitTarget: false,
      fadeCurrent: 1,
      completed: false,
      culled: false,
    });
    expect(state).toEqual({
      current: 'high',
      target: 'mid',
      sourceReady: false,
      transition: 0,
      transitionActive: false,
    });
  });

  it('排队后源就绪：当帧完成（冷源到达即迁）', () => {
    const queued = step(stateOf('high'), 'mid', 7, false).state;
    const { state, commit } = step(queued, 'mid', 7.2, true);
    expect(commit.completed).toBe(true);
    expect(state).toEqual(steadySelectionState('mid'));
  });
});

describe('dither 降档（Mid → Canopy，名义线触发带 [B, B(1+W)]）', () => {
  it('触发帧 f=0：fade (1,0) 起步——决策翻转点无跳变', () => {
    const { state, commit } = step(stateOf('mid'), 'canopy', B * 1.0001);
    expect(commit.fadeTarget).toBeLessThan(0.001); // f ≈ 0（触发帧起步 (1,0)——渐近语义）
    expect(commit.fadeCurrent).toBeGreaterThan(0.999);
    expect(commit.completed).toBe(false);
    expect(state).toMatchObject({
      current: 'mid',
      target: 'canopy',
      sourceReady: true,
      transitionActive: true, // 过名义线即激活（f 微量 > 0——带内全程过渡态）
    });
  });

  it('带内推进：f 单调、双侧互补恒和 1、双表示提交、transitionActive', () => {
    const half = B + WIDTH * 0.5;
    const { state, commit } = step(stateOf('mid'), 'canopy', half);
    expect(commit.fadeTarget).toBeCloseTo(0.5, 12);
    expect(commit.fadeCurrent).toBeCloseTo(0.5, 12);
    expect(commit.fadeCurrent + commit.fadeTarget).toBeCloseTo(1, 12);
    expect(commit.submitCurrent).toBe(true);
    expect(commit.submitTarget).toBe(true);
    expect(state.transitionActive).toBe(true);
    expect(state.transition).toBeCloseTo(0.5, 12);
  });

  it('带末完成：f=1 → completed、状态折叠 canopy、current 侧零提交', () => {
    const { state, commit } = step(stateOf('mid'), 'canopy', B * (1 + W) * 1.01);
    expect(commit.completed).toBe(true);
    expect(commit.submitCurrent).toBe(false);
    expect(commit.fadeTarget).toBe(1);
    expect(state).toEqual(steadySelectionState('canopy'));
  });

  it('带内回退：f 随 m 回落（可逆——纯 m 函数）；回退过名义线 f=0 客座不提交', () => {
    const mid = step(stateOf('mid'), 'canopy', B + WIDTH * 0.75).state;
    const back = step(mid, 'canopy', B + WIDTH * 0.25);
    expect(back.commit.fadeTarget).toBeCloseTo(0.25, 12);
    const toZero = step(back.state, 'canopy', B - 0.1); // 决策未回（迟滞保持 canopy）
    expect(toZero.commit.fadeTarget).toBe(0);
    expect(toZero.commit.submitTarget).toBe(false);
    expect(toZero.commit.fadeCurrent).toBe(1); // 视觉全 mid——与稳态 mid 无差（无跳变）
  });
});

describe('dither 升档（Canopy → Mid，迟滞线触发带 [B(1−H)−BW, B(1−H)]）', () => {
  it('迟滞线触发帧 f=0：fade (1,0) 起步——canopy 完整呈现无跳变', () => {
    const { commit } = step(stateOf('canopy'), 'mid', UPLINE * 0.999);
    expect(commit.fadeTarget).toBeLessThan(0.005); // f ≈ 0（触发帧起步 (1,0)——渐近语义）
    expect(commit.fadeCurrent).toBeGreaterThan(0.995);
  });

  it('带内推进：near 侧按 (迟滞线 − m)/BW 渐入；深入完成', () => {
    const m = UPLINE - WIDTH * 0.5;
    const { state, commit } = step(stateOf('canopy'), 'mid', m);
    expect(commit.fadeTarget).toBeCloseTo(0.5, 12);
    expect(state.transitionActive).toBe(true);
    const deep = step(stateOf('canopy'), 'mid', UPLINE - WIDTH * 1.5);
    expect(deep.commit.completed).toBe(true);
    expect(deep.state).toEqual(steadySelectionState('mid'));
  });

  it('迟滞线上侧（带外未触发区）：f=0——canopy 完整（迟滞保持语义与 021.2 一致）', () => {
    const { commit } = step(stateOf('canopy'), 'mid', UPLINE * 1.001);
    expect(commit.fadeTarget).toBe(0);
    expect(commit.submitCurrent).toBe(true);
  });
});

describe('fade-out 退场（Canopy/Low → Culled，退场带 [B_c, B_c(1+W)]）', () => {
  it('名义线触发 f=0：完整呈现（Cull 无整片突然消失——退场带起点无跳变）', () => {
    const { state, commit } = step(stateOf('low'), 'culled', CB * 1.0001);
    expect(commit.fadeCurrent).toBeGreaterThan(0.999); // f ≈ 0（退场带起点无跳变）
    expect(commit.culled).toBe(false);
    expect(commit.submitCurrent).toBe(true);
    expect(state).toMatchObject({ current: 'low', target: 'low' }); // 'culled' 不进 target
  });

  it('带内退场：fadeCurrent 递减、transitionActive；带末终态 cull（零提交）', () => {
    const half = CB + (CULL_TERMINAL - CB) * 0.5;
    const mid = step(stateOf('low'), 'culled', half);
    expect(mid.commit.fadeCurrent).toBeCloseTo(0.5, 12);
    expect(mid.state.transitionActive).toBe(true);
    const terminal = step(mid.state, 'culled', CULL_TERMINAL * 1.001);
    expect(terminal.commit.culled).toBe(true);
    expect(terminal.commit.submitCurrent).toBe(false);
    expect(terminal.commit.fadeCurrent).toBe(0);
    expect(terminal.state.transitionActive).toBe(false); // 完成
  });

  it('回退自然回升（无独立锁存）：m 回带内 fade 回升、迟滞线下侧恒满呈现', () => {
    const fading = step(stateOf('low'), 'culled', CB + WIDTH_CULL() * 0.75).state;
    const back = step(fading, 'culled', CB + WIDTH_CULL() * 0.25);
    expect(back.commit.fadeCurrent).toBeCloseTo(0.75, 12);
    expect(back.commit.culled).toBe(false);
    // 迟滞线下侧（决策仍 culled——升档需越 CB×(1−H)）：f 恒 0 → 满呈现
    const hold = step(back.state, 'culled', CB * (1 - T.hysteresisBand) * 0.99);
    expect(hold.commit.fadeCurrent).toBe(1);
    expect(hold.commit.culled).toBe(false);
  });

  it('硬切 cull（high/mid 起点）：瞬时终态（streetlamp/GLB 行为零变化）', () => {
    const { state, commit } = step(stateOf('mid'), 'culled', CB * 1.5);
    expect(commit.culled).toBe(true);
    expect(commit.submitCurrent).toBe(false);
    expect(commit.fadeCurrent).toBe(1); // 满呈现直至瞬时移除（硬切位不写 fade——零缓冲）
    expect(state.transition).toBe(1); // 完成
  });
});

describe('sourceReady 门控（dither）', () => {
  it('未就绪：进度钳 0（排队——不开始过渡）；带深处就绪：跳至 f(m)（冷源追赶）', () => {
    const queued = step(stateOf('mid'), 'canopy', B + WIDTH * 0.8, false);
    expect(queued.state.transition).toBe(0);
    expect(queued.state.transitionActive).toBe(false);
    expect(queued.commit.fadeCurrent).toBe(1); // 旧表示持续渲染
    const caught = step(queued.state, 'canopy', B + WIDTH * 0.8, true);
    expect(caught.state.transition).toBeCloseTo(0.8, 12);
    expect(caught.commit.fadeTarget).toBeCloseTo(0.8, 12);
  });
});

describe('阴影中点切换判定面（§5.4 钩子——策略归 021.5）', () => {
  it('midpointCrossed 仅边沿（上帧 < 0.5 且本帧 ≥ 0.5）；停留不重发', () => {
    const before = step(stateOf('mid'), 'canopy', B + WIDTH * 0.4).state; // f=0.4
    const crossing = step(before, 'canopy', B + WIDTH * 0.6); // f=0.6
    expect(crossing.commit.midpointCrossed).toBe(true);
    expect(crossing.commit.shadowRepresentation).toBe('canopy'); // ≥0.5 → target
    const staying = step(crossing.state, 'canopy', B + WIDTH * 0.7);
    expect(staying.commit.midpointCrossed).toBe(false);
    expect(staying.commit.shadowRepresentation).toBe('canopy');
  });

  it('0.5 下侧 shadow = current；硬切完成帧 shadow = target；fade-out 无目标恒 current', () => {
    const below = step(stateOf('mid'), 'canopy', B + WIDTH * 0.4);
    expect(below.commit.shadowRepresentation).toBe('mid');
    const cut = step(stateOf('high'), 'mid', 7, true);
    expect(cut.commit.shadowRepresentation).toBe('mid');
    const fade = step(stateOf('low'), 'culled', CB + WIDTH_CULL() * 0.6);
    expect(fade.commit.shadowRepresentation).toBe('low');
    // fade-out 中点事件仍发（事件面）；shadow 表示不切换（cull 无目标表示）
    const fromHalf = step({ current: 'low', target: 'low', sourceReady: true, transition: 0.4, transitionActive: true }, 'culled', CB + WIDTH_CULL() * 0.6);
    expect(fromHalf.commit.midpointCrossed).toBe(true);
    expect(fromHalf.commit.shadowRepresentation).toBe('low');
  });
});

describe('纯函数性与覆写', () => {
  it('同输入重复调用逐位同输出', () => {
    const inputs: TransitionStepInput[] = [
      { state: stateOf('mid'), selection: 'canopy', metric: 17.5, sourceReady: true },
      { state: stateOf('canopy'), selection: 'mid', metric: UPLINE - 1, sourceReady: true },
      { state: stateOf('low'), selection: 'culled', metric: 66, sourceReady: true },
      { state: stateOf('high'), selection: 'mid', metric: 9, sourceReady: false },
    ];
    for (const input of inputs) {
      const first = stepTransition(input);
      expect(stepTransition(input)).toEqual(first);
    }
  });

  it('thresholds / bandRatio 覆写：带锚点与宽度随覆写独立于全局常量', () => {
    const custom = { highToMid: 1, midToCanopy: 2, canopyToCulled: 3, hysteresisBand: 0.5 };
    const result = stepTransition({
      state: stateOf('mid'),
      selection: 'canopy',
      metric: 2.5, // 自定义带 [2, 2×(1+0.25)=2.5] 带末 → 完成
      sourceReady: true,
      thresholds: custom,
      bandRatio: 0.25,
    });
    expect(result.commit.completed).toBe(true);
    expect(result.state).toEqual(steadySelectionState('canopy'));
    const narrow = stepTransition({
      state: stateOf('mid'),
      selection: 'canopy',
      metric: 17,
      sourceReady: true,
      bandRatio: 1, // 带宽 = B×1 → 17 落带内 f=(17-16)/16
    });
    expect(narrow.commit.fadeTarget).toBeCloseTo(1 / 16, 12);
  });
});

/** cull 退场带宽（canopyToCulled × W） */
function WIDTH_CULL(): number {
  return CB * W;
}
