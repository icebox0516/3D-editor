/**
 * tests/domain/lod/lodEvaluation.test.ts —— LOD 选档评估器纯函数测试（T006.1，D27.5/D27.6）。
 *
 * 覆盖：
 * - 透视口径：统一度量 m = (d/r)·tan(fovY/2) 的 tan 折算（fov=90° 退化为 d/r）；
 *   m=1 满屏锚点；fovY 参与选档（同 d/r 不同 fovY → 不同 m → 不同档）；
 * - 正交口径：m = orthoHeight/(2r)；正交口径不消费相机位姿（类型上即无 cameraPosition）；
 * - 代表 scale 参与归一化：scale ×2 → m 减半 → 档位升（同 view / 同 radius）；
 * - 名义区间档：三边界含下侧（m ≤ 边界归较近档），current 缺省 = 名义档起步；
 * - 迟滞环（单边）：降档过名义线立即、带内保持、升档需越过名义上界 × (1 − band)
 *   （恰在带线上不升——严格小于）、升档跨多档一步到位（culled → high）、
 *   culled 边界同构迟滞；任务书环路用例（mid→low→带内→回 mid）逐点验证；
 * - 不完整链跳档：等距 tie-break 取更低档、序数最近档、单档恒定（culled 线内）、
 *   culled 线不跳档、declared 缺省/空 = 单档 high 语义；
 * - LOD 总开关（D27.13）：false = 恒 'high'（经跳档映射）、culled 旁路（含 current='culled'）、
 *   奇异声明 ['low'] 回 'low' 的取舍回归锁；true 显式开启 = 缺省行为；
 * - 纯函数性：同输入重复调用逐位同输出；
 * - 输入防御：radius/scale 非正（radius × scale ≤ 0）、透视 fovY ∉ (0, π) 抛 Error；
 * - 策略常量：LOD_THRESHOLDS 一次锁全量候选值（候选值变更须走实测锁定记档）+ thresholds 覆写。
 * 边界：纯函数零 THREE（check:layers 语义：domain 无渲染依赖）。阈值穿越断言一律以
 *      LOD_THRESHOLDS 常量为参照构造边界（相对语义 ±ε），不散落硬编码绝对值。
 */
import { describe, expect, it } from 'vitest';
import type { Vec3 } from '../../../src/core/types';
import type { ProceduralLevel } from '../../../src/domain/assets/AssetDescriptor';
import {
  evaluateLodRepresentation,
  normalizedViewDistance,
  resolveDeclaredLevel,
} from '../../../src/domain/lod/lodEvaluation';
import type {
  LodEvaluationInput,
  LodRepresentation,
  LodSubject,
  LodView,
  OrthographicLodView,
  PerspectiveLodView,
} from '../../../src/domain/lod/lodEvaluation';
import { LOD_THRESHOLDS } from '../../../src/domain/lod/lodPolicy';

const T = LOD_THRESHOLDS;
/** 全声明链（三档齐备——跳档与迟滞语义的名义参照） */
const FULL: ProceduralLevel[] = ['high', 'mid', 'low'];
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

/** 主评估器薄封装（默认无 current——名义档起步路径） */
function run(
  view: LodView,
  sub: LodSubject,
  options: Omit<LodEvaluationInput, 'view' | 'subject'> = {},
): LodRepresentation {
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

  it('m=1 满屏锚点（透视）：d = r 且 fov = 90° → m ≈ 1（直径恰占满视口高）', () => {
    expect(normalizedViewDistance(perspective(2, Math.PI / 2), subject(2))).toBeCloseTo(1, 12);
    // 非平凡组合同锚：d/r = 2、tan(fovY/2) = 0.5 → m = 1
    const fovY = 2 * Math.atan(0.5);
    expect(normalizedViewDistance(perspective(4, fovY), subject(2))).toBeCloseTo(1, 12);
  });

  it('fovY 参与选档：同 d/r 不同 fovY → m 不同 → 档位不同', () => {
    const near = perspective(T.highToMid, Math.PI / 2); // m ≈ highToMid → 高档
    const wide = perspective(T.highToMid, 2 * Math.atan(2)); // tan(fovY/2)=2 → m = 2·highToMid → 中档
    const m1 = normalizedViewDistance(near, subject(1));
    const m2 = normalizedViewDistance(wide, subject(1));
    expect(m2).toBeGreaterThan(m1);
    expect(run(near, subject(1), { declaredLevels: FULL })).toBe('high');
    expect(run(wide, subject(1), { declaredLevels: FULL })).toBe('mid');
  });
});

describe('统一度量 m：正交口径', () => {
  it('m = orthoHeight / (2·r)', () => {
    expect(normalizedViewDistance({ kind: 'orthographic', orthoHeight: 40 }, subject(2))).toBe(10);
    expect(normalizedViewDistance({ kind: 'orthographic', orthoHeight: 7 }, subject(3.5))).toBe(1);
  });

  it('正交口径不消费相机位姿：类型上即无 cameraPosition（构造即证），任意视高下评估自洽', () => {
    // OrthographicLodView 只有 kind + orthoHeight——距离概念不存在，选档仅由视高/尺寸比驱动
    expect(run(orthoAtM(T.highToMid * 0.5), subject(1), { declaredLevels: FULL })).toBe('high');
    const mid = (T.highToMid + T.midToLow) / 2;
    expect(run(orthoAtM(mid), subject(1), { declaredLevels: FULL })).toBe('mid');
  });

  it('m=1 满屏锚点（正交）：orthoHeight = 2r → m = 1', () => {
    expect(normalizedViewDistance({ kind: 'orthographic', orthoHeight: 4 }, subject(2))).toBe(1);
  });
});

describe('代表 scale 参与归一化（r = radius × scale）', () => {
  const view = { kind: 'orthographic', orthoHeight: T.highToMid + T.midToLow } as const;

  it('scale ×2 → m 减半', () => {
    const m1 = normalizedViewDistance(view, subject(1, 1));
    const m2 = normalizedViewDistance(view, subject(1, 2));
    expect(m2).toBeCloseTo(m1 / 2, 12);
  });

  it('scale ×2 → 档位升：同 view 下中档区实例回高档（大实例更晚降档，§4.3 保守偏高档）', () => {
    expect(run(view, subject(1, 1), { declaredLevels: FULL })).toBe('mid');
    expect(run(view, subject(1, 2), { declaredLevels: FULL })).toBe('high');
  });
});

describe('名义区间档（current 缺省 = 名义档起步，边界含下侧）', () => {
  it('m = highToMid → high；m 刚过 highToMid → mid', () => {
    expect(run(orthoAtM(T.highToMid), subject(1), { declaredLevels: FULL })).toBe('high');
    expect(run(orthoAtM(T.highToMid * 1.001), subject(1), { declaredLevels: FULL })).toBe('mid');
  });

  it('m = midToLow → mid；m 刚过 midToLow → low', () => {
    expect(run(orthoAtM(T.midToLow), subject(1), { declaredLevels: FULL })).toBe('mid');
    expect(run(orthoAtM(T.midToLow * 1.001), subject(1), { declaredLevels: FULL })).toBe('low');
  });

  it('m = lowToCulled → low；m 超过 lowToCulled → culled', () => {
    expect(run(orthoAtM(T.lowToCulled), subject(1), { declaredLevels: FULL })).toBe('low');
    expect(run(orthoAtM(T.lowToCulled * 2), subject(1), { declaredLevels: FULL })).toBe('culled');
  });
});

describe('迟滞环（单边：降档立即、升档越带、带内保持）', () => {
  it('任务书环路用例：cur=mid 过 midToLow 立即降 low', () => {
    expect(
      run(orthoAtM(T.midToLow * 1.001), subject(1), { declaredLevels: FULL, current: 'mid' }),
    ).toBe('low');
  });

  it('m 回落至 midToLow × 0.99 仍 low（带内保持，不回跳）', () => {
    expect(
      run(orthoAtM(T.midToLow * 0.99), subject(1), { declaredLevels: FULL, current: 'low' }),
    ).toBe('low');
  });

  it('m 恰在带线 midToLow × (1−band) 上 → 仍 low（升档要求严格小于带线）', () => {
    expect(
      run(orthoAtM(bandLine(T.midToLow)), subject(1), { declaredLevels: FULL, current: 'low' }),
    ).toBe('low');
  });

  it('m 未越带线（× (1−band) × 1.001）→ 仍 low；越过（× 0.999）→ 回 mid', () => {
    const line = bandLine(T.midToLow);
    expect(
      run(orthoAtM(line * 1.001), subject(1), { declaredLevels: FULL, current: 'low' }),
    ).toBe('low');
    expect(
      run(orthoAtM(line * 0.999), subject(1), { declaredLevels: FULL, current: 'low' }),
    ).toBe('mid');
  });

  it('降档立即也适用于 highToMid 边界：cur=high、m 刚过 highToMid → mid', () => {
    expect(
      run(orthoAtM(T.highToMid * 1.001), subject(1), { declaredLevels: FULL, current: 'high' }),
    ).toBe('mid');
  });

  it('cur=high 回落带内（highToMid × 0.99）仍 mid，越过 (1−band) 线回 high', () => {
    expect(
      run(orthoAtM(T.highToMid * 0.99), subject(1), { declaredLevels: FULL, current: 'mid' }),
    ).toBe('mid');
    expect(
      run(orthoAtM(bandLine(T.highToMid) * 0.999), subject(1), {
        declaredLevels: FULL,
        current: 'mid',
      }),
    ).toBe('high');
  });

  it('升档跨多档一步到位：cur=culled、m 很小 → high（不逐档爬）', () => {
    expect(
      run(orthoAtM(T.highToMid * 0.01), subject(1), { declaredLevels: FULL, current: 'culled' }),
    ).toBe('high');
  });

  it('culled 边界同构迟滞：过线立即裁、回落带内保持、越带线回 low', () => {
    expect(
      run(orthoAtM(T.lowToCulled * 1.001), subject(1), { declaredLevels: FULL, current: 'low' }),
    ).toBe('culled');
    expect(
      run(orthoAtM(T.lowToCulled * 0.99), subject(1), { declaredLevels: FULL, current: 'culled' }),
    ).toBe('culled');
    expect(
      run(orthoAtM(bandLine(T.lowToCulled) * 0.999), subject(1), {
        declaredLevels: FULL,
        current: 'culled',
      }),
    ).toBe('low');
  });

  it('resolved 与 current 序数相同 → 原样返回 current', () => {
    const mid = (T.highToMid + T.midToLow) / 2;
    expect(run(orthoAtM(mid), subject(1), { declaredLevels: FULL, current: 'mid' })).toBe('mid');
  });
});

describe('不完整链跳档（resolveDeclaredLevel）', () => {
  it('直测：已声明原样；未声明取序数最近档；等距 tie-break 取更低档（保守省面）', () => {
    expect(resolveDeclaredLevel('high', ['high', 'low'])).toBe('high');
    expect(resolveDeclaredLevel('low', ['high', 'low'])).toBe('low');
    expect(resolveDeclaredLevel('mid', ['high', 'low'])).toBe('low'); // |1−0|=|1−2| 等距 → 取低
    expect(resolveDeclaredLevel('low', ['high', 'mid'])).toBe('mid');
    expect(resolveDeclaredLevel('high', ['mid', 'low'])).toBe('mid');
    expect(resolveDeclaredLevel('mid', ['low'])).toBe('low');
  });

  it('declared 空 → high（缺省单档语义）', () => {
    expect(resolveDeclaredLevel('high', [])).toBe('high');
    expect(resolveDeclaredLevel('mid', [])).toBe('high');
    expect(resolveDeclaredLevel('low', [])).toBe('high');
  });

  it("声明 ['high','low'] 的 mid 区间 → low（等距 tie-break 集成）", () => {
    const mid = (T.highToMid + T.midToLow) / 2;
    expect(
      run(orthoAtM(mid), subject(1), { declaredLevels: ['high', 'low'], current: 'mid' }),
    ).toBe('low');
  });

  it("声明 ['high','mid'] 的 low 区间 → mid（序数最近）", () => {
    const lowBand = (T.midToLow + T.lowToCulled) / 2;
    expect(run(orthoAtM(lowBand), subject(1), { declaredLevels: ['high', 'mid'] })).toBe('mid');
  });

  it("单档 ['mid']：culled 线内任意距离恒 mid", () => {
    expect(run(orthoAtM(T.highToMid * 0.5), subject(1), { declaredLevels: ['mid'] })).toBe('mid');
    expect(run(orthoAtM(T.midToLow * 0.5), subject(1), { declaredLevels: ['mid'] })).toBe('mid');
    expect(run(orthoAtM(T.lowToCulled), subject(1), { declaredLevels: ['mid'] })).toBe('mid');
  });

  it("单档 ['mid'] 过 culled 线 → culled（跳档不适用于 culled——任何资产都可被超远裁剪）", () => {
    expect(run(orthoAtM(T.lowToCulled * 1.001), subject(1), { declaredLevels: ['mid'] })).toBe(
      'culled',
    );
  });

  it('declared 缺省 / 空数组 → 单档 high 语义（lod-spec §2.2）', () => {
    const mid = (T.highToMid + T.midToLow) / 2;
    const lowBand = (T.midToLow + T.lowToCulled) / 2;
    expect(run(orthoAtM(mid), subject(1))).toBe('high'); // declaredLevels 缺省
    expect(run(orthoAtM(lowBand), subject(1), { declaredLevels: [] })).toBe('high');
    expect(run(orthoAtM(T.lowToCulled * 2), subject(1), { declaredLevels: [] })).toBe('culled');
  });
});

describe('LOD 总开关（D27.13 对照组语义）', () => {
  it('lodEnabled=false：正常资产近景恒 high', () => {
    expect(
      run(orthoAtM(T.highToMid * 0.5), subject(1), { declaredLevels: FULL, lodEnabled: false }),
    ).toBe('high');
  });

  it('lodEnabled=false：culled 旁路——超远 m（含 current=culled）也返回 high', () => {
    const far = orthoAtM(T.lowToCulled * 2);
    expect(run(far, subject(1), { declaredLevels: FULL, lodEnabled: false })).toBe('high');
    expect(
      run(far, subject(1), { declaredLevels: FULL, lodEnabled: false, current: 'culled' }),
    ).toBe('high');
  });

  it("lodEnabled=false + 奇异声明：['low'] → low、['mid'] → mid（「Runtime 只请求已声明档」取舍的回归锁，lod-spec §6）", () => {
    expect(
      run(orthoAtM(T.highToMid * 0.5), subject(1), { declaredLevels: ['low'], lodEnabled: false }),
    ).toBe('low');
    expect(
      run(orthoAtM(T.highToMid * 0.5), subject(1), { declaredLevels: ['mid'], lodEnabled: false }),
    ).toBe('mid');
  });

  it('lodEnabled 显式 true = 缺省行为（开关只定义 false 分支）', () => {
    const mid = (T.highToMid + T.midToLow) / 2;
    expect(run(orthoAtM(mid), subject(1), { declaredLevels: FULL, lodEnabled: true })).toBe('mid');
  });
});

describe('纯函数性（D27.6：每帧派生态，同输入逐位同输出）', () => {
  it('重复调用：评估器与度量函数均逐位一致', () => {
    const cases: LodEvaluationInput[] = [
      {
        view: perspective(T.highToMid * 2, Math.PI / 2),
        subject: subject(2),
        declaredLevels: FULL,
      },
      { view: orthoAtM(T.midToLow * 1.001), subject: subject(1), declaredLevels: ['high', 'low'] },
      {
        view: orthoAtM(bandLine(T.midToLow) * 0.999),
        subject: subject(1, 2),
        declaredLevels: FULL,
        current: 'low',
      },
      { view: orthoAtM(T.lowToCulled * 2), subject: subject(1), lodEnabled: false },
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
    expect(() => run(orthoAtM(1), subject(0), { declaredLevels: FULL })).toThrow();
  });

  it('scale ≤ 0 抛 Error（radius × scale ≤ 0）', () => {
    expect(() => normalizedViewDistance(orthoAtM(1), subject(2, 0))).toThrow();
    expect(() => normalizedViewDistance(orthoAtM(1), subject(2, -1))).toThrow();
    expect(() => run(perspective(10, Math.PI / 2), subject(2, 0), { declaredLevels: FULL })).toThrow();
  });

  it('透视 fovY ≤ 0 或 ≥ π 抛 Error；合法 fovY 不抛', () => {
    for (const fovY of [0, -0.1, Math.PI, Math.PI * 1.01]) {
      expect(() => normalizedViewDistance(perspective(10, fovY), subject(1))).toThrow();
    }
    expect(() => normalizedViewDistance(perspective(10, Math.PI / 2), subject(1))).not.toThrow();
  });
});

describe('策略常量与阈值覆写', () => {
  it('LOD_THRESHOLDS 字段齐全且锁定值 = 6/16/60/0.15（一次锁全量；T006.5 实测锁定，数值变更须重开实测记档并连带更新本断言）', () => {
    expect(LOD_THRESHOLDS).toEqual({
      highToMid: 6,
      midToLow: 16,
      lowToCulled: 60,
      hysteresisBand: 0.15,
    });
  });

  it('thresholds 入参可覆写（006.3 接线实测调参面）：自定义阈值带独立于全局常量生效', () => {
    const custom = { highToMid: 1, midToLow: 2, lowToCulled: 3, hysteresisBand: 0 };
    expect(run(orthoAtM(1), subject(1), { declaredLevels: FULL, thresholds: custom })).toBe('high');
    expect(run(orthoAtM(1.5), subject(1), { declaredLevels: FULL, thresholds: custom })).toBe('mid');
    expect(
      run(orthoAtM(2.1), subject(1), { declaredLevels: FULL, thresholds: custom }),
    ).toBe('low');
    // band=0：升档带线退化为名义边界本身（m < 边界即升档）
    expect(
      run(orthoAtM(1.999), subject(1), { declaredLevels: FULL, thresholds: custom, current: 'low' }),
    ).toBe('mid');
  });
});
