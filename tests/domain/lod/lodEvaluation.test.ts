/**
 * tests/domain/lod/lodEvaluation.test.ts —— LOD 选档评估器纯函数测试（T006.1，D27.5/D27.6；
 * T021.2 表示链选档改写，D41 §四）。
 *
 * 覆盖：
 * - 透视口径：统一度量 m = (d/r)·tan(fovY/2) 的 tan 折算（fov=90° 退化为 d/r）；
 *   m=1 满屏锚点（screenFraction = 1/m 解释口径，D41 §4.1——仅调试/验收解释、不作
 *   选档输入）；fovY 参与选档（同 d/r 不同 fovY → 不同 m → 不同档）；
 * - 正交口径：m = orthoHeight/(2r)；正交口径不消费相机位姿（类型上即无 cameraPosition）；
 * - 代表 scale 参与归一化：scale ×2 → m 减半 → 档位升（同 view / 同 radius）；
 * - 名义区间档（T021.2 新链）：三边界划分四名义区 high / mid / canopy / culled——
 *   canopy 名义区间 (midToCanopy, canopyToCulled] 落位（本任务解除运行时不可达）；
 *   'low' 无名义区间（到达路径 = 跳档映射承接 canopy 名义区，legacy 资产语义保持）；
 *   边界含下侧（m ≤ 边界归较近档），current 缺省 = 名义档起步；
 * - 迟滞环（单边）：降档过名义线立即、带内保持、升档需越过名义上界 × (1 − band)
 *   （恰在带线上不升——严格小于）、升档跨多档一步到位（culled → high）、
 *   culled 边界同构迟滞；canopy↔mid / canopy↔culled 边界同构迟滞（新链）；
 * - 不完整链跳档（resolveDeclaredRepresentation，T021.2 按 REPRESENTATION_ORDER 泛化）：
 *   等距 tie-break 取更远端（序数更大——保守省面）、序数最近表示、单档恒定（culled 线内）、
 *   culled 线不跳档、representations 缺省/空 = 单档 high 语义；canopy 名义档的承接
 *   （legacy [high,mid,low] → low）与直达（声明 canopy → canopy）；
 * - 表示能力驱动组合（T021.2）：effectiveRepresentationChain 产物作为评估器输入——
 *   representations 声明优先 / levels 派生回退语义经组合断言（13 树种形态 = levels
 *   派生分支，canopy 不可达是正确行为——canopy 可达性由 021.6 接入 + 021.7 接线成立）；
 * - LOD 总开关（D27.13）：false = 恒 'high'（经跳档映射）、culled 旁路（含 current='culled'）、
 *   奇异声明 ['low'] 回 'low' 的取舍回归锁；true 显式开启 = 缺省行为；
 * - 纯函数性：同输入重复调用逐位同输出；
 * - 输入防御：radius/scale 非正（radius × scale ≤ 0）、透视 fovY ∉ (0, π) 抛 Error；
 * - 策略常量：LOD_THRESHOLDS 一次锁全量候选值（T021.2 新链候选初值 = legacy 三数
 *   同值直承，**候选状态、021.8 A/B 重锁**；数值变更须走实测锁定记档）+ thresholds 覆写。
 * 边界：纯函数零 THREE（check:layers 语义：domain 无渲染依赖）。阈值穿越断言一律以
 *      LOD_THRESHOLDS 常量为参照构造边界（相对语义 ±ε），不散落硬编码绝对值。
 *
 * T021.2 改写记档（原断言 → 新断言 → 为何等价）：
 * - 输入字段 declaredLevels → representations、类型 ProceduralLevel → RuntimeRepresentation
 *   （levels 派生链 = 声明等价链；三值域是四值域子集，同名档位序数不变）；
 * - T.midToLow → T.midToCanopy、T.lowToCulled → T.canopyToCulled（候选初值同值直承
 *   16/60，全部数值断言不变）；
 * - 「m 刚过 midToLow → low」→「m 刚过 midToCanopy → low」：名义档从 low 变 canopy，
 *   legacy 链 [high,mid,low] 下跳档承接 canopy → low（|3−2|=1 序数最近）——调度结果
 *   逐位等价；
 * - resolveDeclaredLevel 直测 → resolveDeclaredRepresentation 直测（算法与 tie-break
 *   不变，序数基换 REPRESENTATION_ORDER，三值域下同序）。
 */
import { describe, expect, it } from 'vitest';
import type { Vec3 } from '../../../src/core/types';
import {
  evaluateLodRepresentation,
  normalizedViewDistance,
  resolveDeclaredRepresentation,
} from '../../../src/domain/lod/lodEvaluation';
import type {
  LodEvaluationInput,
  LodSubject,
  LodView,
  OrthographicLodView,
  PerspectiveLodView,
} from '../../../src/domain/lod/lodEvaluation';
import type { LodSelectionOutcome, RuntimeRepresentation } from '../../../src/domain/lod/representation';
import { effectiveRepresentationChain } from '../../../src/domain/lod/representation';
import { LOD_THRESHOLDS } from '../../../src/domain/lod/lodPolicy';

const T = LOD_THRESHOLDS;
/** 全声明链（legacy 三档——T021.2 起 = levels 派生分支的标准形态） */
const FULL: RuntimeRepresentation[] = ['high', 'mid', 'low'];
/** canopy 能力链（乔木声明 canopy 后的目标形态，D41 §三.2 示例） */
const CANOPY_CHAIN: RuntimeRepresentation[] = ['high', 'mid', 'canopy'];
/** 全四表示链（声明 canopy 且保留 low——low 非必经表示 §三.2） */
const ALL_FOUR: RuntimeRepresentation[] = ['high', 'mid', 'low', 'canopy'];
const ORIGIN: Vec3 = { x: 0, y: 0, z: 0 };

/** 透视视图：相机置于 X 轴正向 d 处、主体在原点 → 欧氏距离 = d */
function perspective(d: number, fovY: number): PerspectiveLodView {
  return { kind: 'perspective', cameraPosition: { x: d, y: 0, z: 0 }, fovY };
}

/** 正交视图：配 orthoHeight 使配对 subject(1)（r=1）时 m = orthoHeight/2 恰为给定制 */
function orthoAtM(m: number): OrthographicLodView {
  return { kind: 'orthographic', orthoHeight: 2 * m };
}

/** 主体：置于原点，radius × scale = 有效包围球半径 r */
function subject(radius: number, scale = 1): LodSubject {
  return { point: ORIGIN, radius, scale };
}

/** 主评估器薄封装（默认无 current——名义档起步路径）；返回 = 调度判定产出
 *  （表示或 'culled' 提交终态——LodSelectionOutcome，T021.1 类型迁移，行为断言零改） */
function run(
  view: LodView,
  sub: LodSubject,
  options: Omit<LodEvaluationInput, 'view' | 'subject'> = {},
): LodSelectionOutcome {
  return evaluateLodRepresentation({ view, subject: sub, ...options });
}

/** 迟滞带线：名义边界 × (1 − band)——与评估器同表达式（等值穿越断言依赖逐位一致） */
function bandLine(boundary: number): number {
  return boundary * (1 - T.hysteresisBand);
}

describe('统一度量 m：透视口径', () => {
  it('m = (d/r)·tan(fovY/2)：fov=90° 退化为 d/r（§4.1 主口径折算常数 = 1）', () => {
    // d=10、r=2 → d/r=5；tan(π/4) 浮点 ≈1，容差内相等
    expect(normalizedViewDistance(perspective(10, Math.PI / 2), subject(2))).toBeCloseTo(5, 12);
    expect(normalizedViewDistance(perspective(24, Math.PI / 2), subject(3))).toBeCloseTo(8, 12);
  });

  it('tan 折算：fov=60° → m = (d/r)·tan(30°)', () => {
    const m = normalizedViewDistance(perspective(12, Math.PI / 3), subject(2));
    expect(m).toBeCloseTo(6 * Math.tan(Math.PI / 6), 12); // d/r=6，tan(30°)≈0.5774
  });

  it('m=1 满屏锚点（透视）：d = r 且 fov = 90° → m ≈ 1（直径恰占满视口高；screenFraction = 1/m = 100%，D41 §4.1 解释口径）', () => {
    expect(normalizedViewDistance(perspective(2, Math.PI / 2), subject(2))).toBeCloseTo(1, 12);
    // 非平凡组合同锚：d/r = 2、tan(fovY/2) = 0.5 → m = 1
    const fovY = 2 * Math.atan(0.5);
    expect(normalizedViewDistance(perspective(4, fovY), subject(2))).toBeCloseTo(1, 12);
    // 解释口径锚点：m = 6（候选 highToMid）↔ screenFraction = 1/6 ≈ 16.7%
    expect(1 / normalizedViewDistance(perspective(12, Math.PI / 2), subject(2))).toBeCloseTo(
      1 / 6,
      12,
    );
  });

  it('fovY 参与选档：同 d/r 不同 fovY → m 不同 → 档位不同', () => {
    const near = perspective(T.highToMid, Math.PI / 2); // m ≈ highToMid → 高档
    const wide = perspective(T.highToMid, 2 * Math.atan(2)); // tan(fovY/2)=2 → m = 2·highToMid → 中档
    const m1 = normalizedViewDistance(near, subject(1));
    const m2 = normalizedViewDistance(wide, subject(1));
    expect(m2).toBeGreaterThan(m1);
    expect(run(near, subject(1), { representations: FULL })).toBe('high');
    expect(run(wide, subject(1), { representations: FULL })).toBe('mid');
  });
});

describe('统一度量 m：正交口径', () => {
  it('m = orthoHeight / (2·r)', () => {
    expect(normalizedViewDistance({ kind: 'orthographic', orthoHeight: 40 }, subject(2))).toBe(10);
    expect(normalizedViewDistance({ kind: 'orthographic', orthoHeight: 7 }, subject(3.5))).toBe(1);
  });

  it('正交口径不消费相机位姿：类型上即无 cameraPosition（构造即证），任意视高下评估自洽', () => {
    // OrthographicLodView 只有 kind + orthoHeight——距离概念不存在，选档仅由视高/尺寸比驱动
    expect(run(orthoAtM(T.highToMid * 0.5), subject(1), { representations: FULL })).toBe('high');
    const mid = (T.highToMid + T.midToCanopy) / 2;
    expect(run(orthoAtM(mid), subject(1), { representations: FULL })).toBe('mid');
  });

  it('m=1 满屏锚点（正交）：orthoHeight = 2r → m = 1', () => {
    expect(normalizedViewDistance({ kind: 'orthographic', orthoHeight: 4 }, subject(2))).toBe(1);
  });
});

describe('代表 scale 参与归一化（r = radius × scale）', () => {
  const view = { kind: 'orthographic', orthoHeight: T.highToMid + T.midToCanopy } as const;

  it('scale ×2 → m 减半', () => {
    const m1 = normalizedViewDistance(view, subject(1, 1));
    const m2 = normalizedViewDistance(view, subject(1, 2));
    expect(m2).toBeCloseTo(m1 / 2, 12);
  });

  it('scale ×2 → 档位升：同 view 下中档区实例回高档（大实例更晚降档，§4.4 保守偏高档）', () => {
    expect(run(view, subject(1, 1), { representations: FULL })).toBe('mid');
    expect(run(view, subject(1, 2), { representations: FULL })).toBe('high');
  });
});

describe('名义区间档（current 缺省 = 名义档起步，边界含下侧；T021.2 新链四区）', () => {
  it('m = highToMid → high；m 刚过 highToMid → mid', () => {
    expect(run(orthoAtM(T.highToMid), subject(1), { representations: FULL })).toBe('high');
    expect(run(orthoAtM(T.highToMid * 1.001), subject(1), { representations: FULL })).toBe('mid');
  });

  it('m = midToCanopy → mid；m 刚过 midToCanopy → canopy 名义档（legacy 链跳档承接为 low——与旧链 midToLow 断言逐位等价）', () => {
    expect(run(orthoAtM(T.midToCanopy), subject(1), { representations: FULL })).toBe('mid');
    // 名义档 = canopy（新链第二边界过线）；FULL 未声明 canopy → 序数最近承接 = low
    expect(run(orthoAtM(T.midToCanopy * 1.001), subject(1), { representations: FULL })).toBe('low');
    // 声明 canopy 能力 → canopy 直达（名义区间落位，运行时可达）
    expect(
      run(orthoAtM(T.midToCanopy * 1.001), subject(1), { representations: CANOPY_CHAIN }),
    ).toBe('canopy');
  });

  it('m = canopyToCulled → canopy 名义带内；m 超过 canopyToCulled → culled（legacy 链同位仍 low）', () => {
    const canopyBand = T.midToCanopy + (T.canopyToCulled - T.midToCanopy) * 0.5;
    expect(run(orthoAtM(canopyBand), subject(1), { representations: CANOPY_CHAIN })).toBe('canopy');
    expect(run(orthoAtM(T.canopyToCulled), subject(1), { representations: CANOPY_CHAIN })).toBe(
      'canopy',
    );
    expect(run(orthoAtM(T.canopyToCulled * 2), subject(1), { representations: CANOPY_CHAIN })).toBe(
      'culled',
    );
    expect(run(orthoAtM(T.canopyToCulled), subject(1), { representations: FULL })).toBe('low');
    expect(run(orthoAtM(T.canopyToCulled * 2), subject(1), { representations: FULL })).toBe(
      'culled',
    );
  });

  it("'low' 无名义区间：全四表示链下 canopy 带仍选 canopy（声明 canopy 后 low 不再承接，§三.2 Low 非必经）", () => {
    const canopyBand = T.midToCanopy + (T.canopyToCulled - T.midToCanopy) * 0.5;
    expect(run(orthoAtM(canopyBand), subject(1), { representations: ALL_FOUR })).toBe('canopy');
  });
});

describe('迟滞环（单边：降档立即、升档越带、带内保持）', () => {
  it('任务书环路用例：cur=mid 过 midToCanopy 立即降档（legacy 链 → low）', () => {
    expect(
      run(orthoAtM(T.midToCanopy * 1.001), subject(1), {
        representations: FULL,
        current: 'mid',
      }),
    ).toBe('low');
  });

  it('m 回落至 midToCanopy × 0.99 仍 low（带内保持，不回跳）', () => {
    expect(
      run(orthoAtM(T.midToCanopy * 0.99), subject(1), { representations: FULL, current: 'low' }),
    ).toBe('low');
  });

  it('m 恰在带线 midToCanopy × (1−band) 上 → 仍 low（升档要求严格小于带线）', () => {
    expect(
      run(orthoAtM(bandLine(T.midToCanopy)), subject(1), {
        representations: FULL,
        current: 'low',
      }),
    ).toBe('low');
  });

  it('m 未越带线（× (1−band) × 1.001）→ 仍 low；越过（× 0.999）→ 回 mid', () => {
    const line = bandLine(T.midToCanopy);
    expect(
      run(orthoAtM(line * 1.001), subject(1), { representations: FULL, current: 'low' }),
    ).toBe('low');
    expect(
      run(orthoAtM(line * 0.999), subject(1), { representations: FULL, current: 'low' }),
    ).toBe('mid');
  });

  it('降档立即也适用于 highToMid 边界：cur=high、m 刚过 highToMid → mid', () => {
    expect(
      run(orthoAtM(T.highToMid * 1.001), subject(1), { representations: FULL, current: 'high' }),
    ).toBe('mid');
  });

  it('cur=high 回落带内（highToMid × 0.99）仍 mid，越过 (1−band) 线回 high', () => {
    expect(
      run(orthoAtM(T.highToMid * 0.99), subject(1), { representations: FULL, current: 'mid' }),
    ).toBe('mid');
    expect(
      run(orthoAtM(bandLine(T.highToMid) * 0.999), subject(1), {
        representations: FULL,
        current: 'mid',
      }),
    ).toBe('high');
  });

  it('升档跨多档一步到位：cur=culled、m 很小 → high（不逐档爬）', () => {
    expect(
      run(orthoAtM(T.highToMid * 0.01), subject(1), { representations: FULL, current: 'culled' }),
    ).toBe('high');
  });

  it('culled 边界同构迟滞：过线立即裁、回落带内保持、越带线回 low', () => {
    expect(
      run(orthoAtM(T.canopyToCulled * 1.001), subject(1), {
        representations: FULL,
        current: 'low',
      }),
    ).toBe('culled');
    expect(
      run(orthoAtM(T.canopyToCulled * 0.99), subject(1), {
        representations: FULL,
        current: 'culled',
      }),
    ).toBe('culled');
    expect(
      run(orthoAtM(bandLine(T.canopyToCulled) * 0.999), subject(1), {
        representations: FULL,
        current: 'culled',
      }),
    ).toBe('low');
  });

  it('resolved 与 current 序数相同 → 原样返回 current', () => {
    const mid = (T.highToMid + T.midToCanopy) / 2;
    expect(run(orthoAtM(mid), subject(1), { representations: FULL, current: 'mid' })).toBe('mid');
  });
});

describe('canopy↔mid / canopy↔culled 边界迟滞（T021.2 新链，canopy 能力链）', () => {
  it('cur=mid 过 midToCanopy 立即降 canopy；带内保持 canopy；越带线回 mid', () => {
    expect(
      run(orthoAtM(T.midToCanopy * 1.001), subject(1), {
        representations: CANOPY_CHAIN,
        current: 'mid',
      }),
    ).toBe('canopy');
    expect(
      run(orthoAtM(T.midToCanopy * 0.99), subject(1), {
        representations: CANOPY_CHAIN,
        current: 'canopy',
      }),
    ).toBe('canopy'); // 带内保持（名义带内 + 迟滞带内）
    expect(
      run(orthoAtM(bandLine(T.midToCanopy) * 0.999), subject(1), {
        representations: CANOPY_CHAIN,
        current: 'canopy',
      }),
    ).toBe('mid'); // 越 canopy 名义上界 ×(1−band) 线 → 回 mid
  });

  it('cur=canopy 过 canopyToCulled 立即 culled；回落带内保持 culled；越带线回 canopy', () => {
    expect(
      run(orthoAtM(T.canopyToCulled * 1.001), subject(1), {
        representations: CANOPY_CHAIN,
        current: 'canopy',
      }),
    ).toBe('culled');
    expect(
      run(orthoAtM(T.canopyToCulled * 0.99), subject(1), {
        representations: CANOPY_CHAIN,
        current: 'culled',
      }),
    ).toBe('culled');
    expect(
      run(orthoAtM(bandLine(T.canopyToCulled) * 0.999), subject(1), {
        representations: CANOPY_CHAIN,
        current: 'culled',
      }),
    ).toBe('canopy');
  });

  it('升档跨多档一步到位：cur=culled、m 落 mid 带 → 直达 mid（不逐档爬过 canopy）', () => {
    const mid = (T.highToMid + T.midToCanopy) / 2;
    expect(
      run(orthoAtM(mid), subject(1), { representations: CANOPY_CHAIN, current: 'culled' }),
    ).toBe('mid');
  });
});

describe('不完整链跳档（resolveDeclaredRepresentation，T021.2 泛化到表示链）', () => {
  it('直测：已声明原样；未声明取序数最近表示；等距 tie-break 取更远端（保守省面）', () => {
    expect(resolveDeclaredRepresentation('high', ['high', 'low'])).toBe('high');
    expect(resolveDeclaredRepresentation('low', ['high', 'low'])).toBe('low');
    expect(resolveDeclaredRepresentation('mid', ['high', 'low'])).toBe('low'); // |1−0|=|1−2| 等距 → 取更远端
    expect(resolveDeclaredRepresentation('low', ['high', 'mid'])).toBe('mid');
    expect(resolveDeclaredRepresentation('high', ['mid', 'low'])).toBe('mid');
    expect(resolveDeclaredRepresentation('mid', ['low'])).toBe('low');
  });

  it('canopy 名义档承接（泛化新增）：legacy 链 → low（序数最近）；声明 canopy → 直达；跨档奇距按序数最近', () => {
    expect(resolveDeclaredRepresentation('canopy', ['high', 'mid', 'low'])).toBe('low'); // |3−2|=1
    expect(resolveDeclaredRepresentation('canopy', ['high', 'mid', 'canopy'])).toBe('canopy');
    expect(resolveDeclaredRepresentation('canopy', ['high', 'low'])).toBe('low'); // |3−2|=1 < |3−0|=3
    expect(resolveDeclaredRepresentation('canopy', ['high'])).toBe('high'); // 单档回最近（= 唯一声明）
    expect(resolveDeclaredRepresentation('low', ['mid', 'canopy'])).toBe('canopy'); // |2−1|=|2−3| 等距 → 取更远端（泛化 tie-break）
  });

  it('declared 空 → high（缺省单档语义）', () => {
    expect(resolveDeclaredRepresentation('high', [])).toBe('high');
    expect(resolveDeclaredRepresentation('mid', [])).toBe('high');
    expect(resolveDeclaredRepresentation('low', [])).toBe('high');
    expect(resolveDeclaredRepresentation('canopy', [])).toBe('high');
  });

  it("声明 ['high','low'] 的 mid 区间 → low（等距 tie-break 集成）", () => {
    const mid = (T.highToMid + T.midToCanopy) / 2;
    expect(
      run(orthoAtM(mid), subject(1), { representations: ['high', 'low'], current: 'mid' }),
    ).toBe('low');
  });

  it("声明 ['high','mid'] 的 canopy 区间 → mid（序数最近——原 low 区间断言的等价迁移）", () => {
    const canopyBand = (T.midToCanopy + T.canopyToCulled) / 2;
    expect(run(orthoAtM(canopyBand), subject(1), { representations: ['high', 'mid'] })).toBe('mid');
  });

  it("单档 ['mid']：culled 线内任意距离恒 mid", () => {
    expect(run(orthoAtM(T.highToMid * 0.5), subject(1), { representations: ['mid'] })).toBe('mid');
    expect(run(orthoAtM(T.midToCanopy * 0.5), subject(1), { representations: ['mid'] })).toBe('mid');
    expect(run(orthoAtM(T.canopyToCulled), subject(1), { representations: ['mid'] })).toBe('mid');
  });

  it("单档 ['mid'] 过 culled 线 → culled（跳档不适用于 culled——任何资产都可被超远裁剪）", () => {
    expect(
      run(orthoAtM(T.canopyToCulled * 1.001), subject(1), { representations: ['mid'] }),
    ).toBe('culled');
  });

  it('representations 缺省 / 空数组 → 单档 high 语义（lod-spec §2.2）', () => {
    const mid = (T.highToMid + T.midToCanopy) / 2;
    const canopyBand = (T.midToCanopy + T.canopyToCulled) / 2;
    expect(run(orthoAtM(mid), subject(1))).toBe('high'); // representations 缺省
    expect(run(orthoAtM(canopyBand), subject(1), { representations: [] })).toBe('high');
    expect(run(orthoAtM(T.canopyToCulled * 2), subject(1), { representations: [] })).toBe('culled');
  });
});

describe('表示能力驱动组合（T021.2：effectiveRepresentationChain 产物 = 评估器输入）', () => {
  it('13 树种形态（levels 派生分支）：levels [high,mid,low] 派生链下 canopy 不可达——canopy 带承接 low（正确行为，可达性由 021.6/021.7 成立）', () => {
    // 真实 13 树种未声明 representations（levels 派生分支）——组合断言其选档语义
    const chain = effectiveRepresentationChain({ levels: ['high', 'mid', 'low'] });
    expect(chain).toEqual(['high', 'mid', 'low']);
    const canopyBand = (T.midToCanopy + T.canopyToCulled) / 2;
    for (const m of [T.highToMid * 0.5, T.highToMid * 1.5, canopyBand, T.canopyToCulled * 0.99]) {
      expect(run(orthoAtM(m), subject(1), { representations: chain })).not.toBe('canopy');
    }
    expect(run(orthoAtM(canopyBand), subject(1), { representations: chain })).toBe('low');
    expect(run(orthoAtM(T.canopyToCulled * 1.001), subject(1), { representations: chain })).toBe(
      'culled',
    );
  });

  it('representations 声明优先：声明 canopy（含乱序）→ canopy 可达；levels 不污染', () => {
    const chain = effectiveRepresentationChain({
      representations: ['canopy', 'mid', 'high'],
      levels: ['high', 'low'], // 派生源存在但被声明覆盖
    });
    expect(chain).toEqual(['high', 'mid', 'canopy']);
    const canopyBand = (T.midToCanopy + T.canopyToCulled) / 2;
    expect(run(orthoAtM(canopyBand), subject(1), { representations: chain })).toBe('canopy');
  });

  it('未声明（GLB / 旧资产缺省）：单档 high + 超远 culled（D28.5 语义保持）', () => {
    const chain = effectiveRepresentationChain({});
    expect(chain).toEqual(['high']);
    expect(run(orthoAtM(T.midToCanopy * 2), subject(1), { representations: chain })).toBe('high');
    expect(run(orthoAtM(T.canopyToCulled * 1.001), subject(1), { representations: chain })).toBe(
      'culled',
    );
  });
});

describe('LOD 总开关（D27.13 对照组语义）', () => {
  it('lodEnabled=false：正常资产近景恒 high', () => {
    expect(
      run(orthoAtM(T.highToMid * 0.5), subject(1), {
        representations: FULL,
        lodEnabled: false,
      }),
    ).toBe('high');
  });

  it('lodEnabled=false：culled 旁路——超远 m（含 current=culled）也返回 high', () => {
    const far = orthoAtM(T.canopyToCulled * 2);
    expect(run(far, subject(1), { representations: FULL, lodEnabled: false })).toBe('high');
    expect(
      run(far, subject(1), { representations: FULL, lodEnabled: false, current: 'culled' }),
    ).toBe('high');
  });

  it("lodEnabled=false + 奇异声明：['low'] → low、['mid'] → mid（「Runtime 只请求已声明表示」取舍的回归锁，lod-spec §6）", () => {
    expect(
      run(orthoAtM(T.highToMid * 0.5), subject(1), {
        representations: ['low'],
        lodEnabled: false,
      }),
    ).toBe('low');
    expect(
      run(orthoAtM(T.highToMid * 0.5), subject(1), {
        representations: ['mid'],
        lodEnabled: false,
      }),
    ).toBe('mid');
  });

  it('lodEnabled=false + canopy 能力链：恒 high（canopy 一并旁路）', () => {
    const far = orthoAtM(T.midToCanopy * 3);
    expect(run(far, subject(1), { representations: CANOPY_CHAIN, lodEnabled: false })).toBe('high');
  });

  it('lodEnabled 显式 true = 缺省行为（开关只定义 false 分支）', () => {
    const mid = (T.highToMid + T.midToCanopy) / 2;
    expect(run(orthoAtM(mid), subject(1), { representations: FULL, lodEnabled: true })).toBe('mid');
  });
});

describe('纯函数性（D27.6：每帧派生态，同输入逐位同输出）', () => {
  it('重复调用：评估器与度量函数均逐位一致', () => {
    const cases: LodEvaluationInput[] = [
      {
        view: perspective(T.highToMid * 2, Math.PI / 2),
        subject: subject(2),
        representations: FULL,
      },
      {
        view: orthoAtM(T.midToCanopy * 1.001),
        subject: subject(1),
        representations: ['high', 'low'],
      },
      {
        view: orthoAtM(bandLine(T.midToCanopy) * 0.999),
        subject: subject(1, 2),
        representations: FULL,
        current: 'low',
      },
      { view: orthoAtM(T.canopyToCulled * 2), subject: subject(1), lodEnabled: false },
      {
        view: orthoAtM(T.midToCanopy * 2),
        subject: subject(1),
        representations: CANOPY_CHAIN,
        current: 'canopy',
      },
    ];
    for (const input of cases) {
      const first = evaluateLodRepresentation(input);
      expect(evaluateLodRepresentation(input)).toBe(first);
    }
    const view = perspective(9, Math.PI / 3);
    const m = normalizedViewDistance(view, subject(2));
    expect(normalizedViewDistance(view, subject(2))).toBe(m);
  });
});

describe('输入防御（调用方 bug 早暴露）', () => {
  it('radius ≤ 0 抛 Error（直测与经主评估器均抛）', () => {
    expect(() => normalizedViewDistance(orthoAtM(1), subject(0))).toThrow();
    expect(() => normalizedViewDistance(orthoAtM(1), subject(-2))).toThrow();
    expect(() => run(orthoAtM(1), subject(0), { representations: FULL })).toThrow();
  });

  it('scale ≤ 0 抛 Error（radius × scale ≤ 0）', () => {
    expect(() => normalizedViewDistance(orthoAtM(1), subject(2, 0))).toThrow();
    expect(() => normalizedViewDistance(orthoAtM(1), subject(2, -1))).toThrow();
    expect(() =>
      run(perspective(10, Math.PI / 2), subject(2, 0), { representations: FULL }),
    ).toThrow();
  });

  it('透视 fovY ≤ 0 或 ≥ π 抛 Error；合法 fovY 不抛', () => {
    for (const fovY of [0, -0.1, Math.PI, Math.PI * 1.01]) {
      expect(() => normalizedViewDistance(perspective(10, fovY), subject(1))).toThrow();
    }
    expect(() => normalizedViewDistance(perspective(10, Math.PI / 2), subject(1))).not.toThrow();
  });
});

describe('策略常量与阈值覆写', () => {
  it('LOD_THRESHOLDS 字段齐全且候选值 = 6/16/60/0.15（一次锁全量；T021.2 新链候选初值 = legacy 三数同值直承，**候选状态、021.8 A/B 重锁**——重锁须重开实测记档并连带更新本断言）', () => {
    expect(LOD_THRESHOLDS).toEqual({
      highToMid: 6,
      midToCanopy: 16,
      canopyToCulled: 60,
      hysteresisBand: 0.15,
    });
  });

  it('thresholds 入参可覆写（接线实测调参面）：自定义阈值带独立于全局常量生效', () => {
    const custom = { highToMid: 1, midToCanopy: 2, canopyToCulled: 3, hysteresisBand: 0 };
    expect(run(orthoAtM(1), subject(1), { representations: FULL, thresholds: custom })).toBe('high');
    expect(run(orthoAtM(1.5), subject(1), { representations: FULL, thresholds: custom })).toBe(
      'mid',
    );
    expect(run(orthoAtM(2.1), subject(1), { representations: FULL, thresholds: custom })).toBe(
      'low',
    );
    // band=0：升档带线退化为名义边界本身（m < 边界即升档）
    expect(
      run(orthoAtM(1.999), subject(1), {
        representations: FULL,
        thresholds: custom,
        current: 'low',
      }),
    ).toBe('mid');
  });

  it('thresholds 覆写 + canopy 能力链：自定义阈值带下 canopy 名义区间同步生效', () => {
    const custom = { highToMid: 1, midToCanopy: 2, canopyToCulled: 3, hysteresisBand: 0 };
    expect(
      run(orthoAtM(2.1), subject(1), { representations: CANOPY_CHAIN, thresholds: custom }),
    ).toBe('canopy');
    expect(
      run(orthoAtM(3.1), subject(1), { representations: CANOPY_CHAIN, thresholds: custom }),
    ).toBe('culled');
  });
});
