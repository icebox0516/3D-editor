/**
 * tests/runtime/procedural/tree/broadleafBarkRelief.test.ts —— 夏栎树皮近景微起伏测试
 * （T009.4）。
 *
 * 覆盖（零 mock——真实几何构建；锁 emitTube 顶点域低频环向起伏的结构不变量，与
 * broadleafStructure.test.ts（枝干结构语义）/ tree3aShapeSlots.test.ts（8 槽形态向量）
 * 互补——皮面数恒等 20724 与确定性回归由那两文件的既有断言锁死，跑绿即回归通过）：
 * - 起伏存在性与量级带：主干全部环截面半径随 θ 变化（极差/环均径 ≥ 2%——近景轮廓
 *   起伏可辨）且 ≤ 10%（成熟个体「较弱浮雕」端——Spec bark_relief Inferred [6] 的
 *   量级带锁定）；主干最大极差 ≥ 1.2cm（厘米级，主干基径 0.26–0.32m × 幅度比）；
 * - 枝级递减：主干极差 > L1 首环极差 > L5 首环极差；L5 绝对量 < 1mm 级（亚视觉幅度
 *   地板：起径 × 幅度比 < 1.5mm 的管按 0 起伏发射——实测 ≈ 圆，极差 1e-7m 级）；
 * - 环向连续无缝：wrap 顶点对（quad radial−1 的 th1 顶点 vs quad 0 的 th0 顶点，
 *   A/B 两侧）位置差 < 1e-9——环级共享预算值使实测差恰为 0（浮点级无缝）；
 * - 法线解析修正：扰动后法线外向（dot > 0）且与环向径向夹角 < 45°、单位长度
 *   （float32 存储精度域）——平滑外向不平面着色化；
 * - 轴向低频语言：相邻环起伏剖面相关 ≥ 0.9（脊沿轴向缓慢变化——只加低频），首末环
 *   相关 ≤ 0.5（游走存在——非静态贴图亦非环形箍纹；实测 −0.93）；
 * - 参数面与纪律锁：amplitudeRatio = 0 → 主干环极差 ≈ 0（参数真实驱动的退化路径）；
 *   slot-1…7 barkRelief 逐位同 slot-0（树皮微起伏非槽差异维度）；谐波数全为 ≤5 的
 *   整数（主干 radial 12 的奈奎斯特安全域——契约）；slot-0/规范种子 rng 消费次数
 *   = 177234（T009.4 快照——起伏路径零 rng 消费的回归锁，次数变化 = 随机流重排）。
 * 顶点流定位（发射序确定性）：主干（14 环段 × 12 径向 × 6 顶点 = 1008）→ 底盖（36）
 *   → 首骨架枝 L1 管（1044 起）→ 深度优先首链 L2/L3/L4/L5（首 L5 管 2112 起）。
 * 边界：构建产物 afterEach 统一 dispose。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import { buildBroadleafGeometry } from '../../../../src/runtime/procedural/tree/broadleafGeometry';
import type { BroadleafTreeResult } from '../../../../src/runtime/procedural/tree/broadleafGeometry';
import { TREE3A_SHAPE_PROFILES, TREE3A_SLOT0_PROFILE } from '../../../../src/runtime/procedural/tree/tree3aShapeProfile';

const SEED0 = morphSeedOf('asset_tree_3a', 0);

const built: BroadleafTreeResult[] = [];

function buildTracked(seed: number, profile = TREE3A_SLOT0_PROFILE): BroadleafTreeResult {
  const result = buildBroadleafGeometry(mulberry32(seed), profile);
  built.push(result);
  return result;
}

afterEach(() => {
  for (const { geometry } of built.splice(0)) geometry.dispose();
});

/** 皮组某管某段 ring A 的顶点索引（a0 = 每四边形首顶点；发射序见文件头注释） */
function ringVertexIndices(base: number, seg: number, radial: number): number[] {
  return Array.from({ length: radial }, (_, j) => base + (seg * radial + j) * 6);
}

/** 环度量：各顶点到环质心的半径（质心 = 站点中心的二阶近似——均匀 θ 下偏差 ≪ 起伏量） */
function ringRadii(result: BroadleafTreeResult, base: number, seg: number, radial: number): number[] {
  const pos = result.geometry.getAttribute('position');
  const idx = ringVertexIndices(base, seg, radial);
  const cx = idx.reduce((s, v) => s + pos.array[v * 3]!, 0) / radial;
  const cy = idx.reduce((s, v) => s + pos.array[v * 3 + 1]!, 0) / radial;
  const cz = idx.reduce((s, v) => s + pos.array[v * 3 + 2]!, 0) / radial;
  return idx.map((v) =>
    Math.hypot(pos.array[v * 3]! - cx, pos.array[v * 3 + 1]! - cy, pos.array[v * 3 + 2]! - cz),
  );
}

/** 皮组顶点流发射偏移（slot-0 拓扑：主干 14×12 管 + 12 三角底盖 → 首骨架枝 L1 → 深度优先首链） */
const TRUNK_RADIAL = TREE3A_SLOT0_PROFILE.trunk.radial;
const TRUNK_SEGS = TREE3A_SLOT0_PROFILE.trunk.segs;
const TRUNK_TUBE_VERTS = TRUNK_SEGS * TRUNK_RADIAL * 6;
const TRUNK_CAP_VERTS = TRUNK_RADIAL * 3;
const L1_BASE = TRUNK_TUBE_VERTS + TRUNK_CAP_VERTS; // 首骨架枝管起点（1044）
const L1_TUBE_VERTS = TREE3A_SLOT0_PROFILE.levels[0]!.segs * TREE3A_SLOT0_PROFILE.levels[0]!.radial * 6;
const L5_BASE =
  L1_BASE +
  L1_TUBE_VERTS +
  TREE3A_SLOT0_PROFILE.levels[1]!.segs * TREE3A_SLOT0_PROFILE.levels[1]!.radial * 6 +
  TREE3A_SLOT0_PROFILE.levels[2]!.segs * TREE3A_SLOT0_PROFILE.levels[2]!.radial * 6 +
  TREE3A_SLOT0_PROFILE.levels[3]!.segs * TREE3A_SLOT0_PROFILE.levels[3]!.radial * 6; // 首 L5 管（2112）

/** 皮组内顶点索引 → 数组索引换算（皮组恒为组 0） */
const barkStart = 0;

describe('起伏存在性与量级带（主干：厘米级、成熟较弱浮雕端）', () => {
  it('主干全部环截面极差/环均径 ∈ [2%, 10%]，最大极差 ≥ 1.2cm；皮面数恒等 20724', () => {
    const result = buildTracked(SEED0);
    expect(result.stats.barkTriangles, '皮拓扑不受起伏影响（emitTube 只动顶点域）').toBe(20724);
    let maxAbs = 0;
    for (let seg = 0; seg < TRUNK_SEGS; seg++) {
      const radii = ringRadii(result, barkStart, seg, TRUNK_RADIAL);
      const mean = radii.reduce((s, r) => s + r, 0) / radii.length;
      const range = Math.max(...radii) - Math.min(...radii);
      maxAbs = Math.max(maxAbs, range);
      expect(range / mean, `主干环 ${seg} 极差/均径应 ≥ 2%（起伏可辨）`).toBeGreaterThanOrEqual(0.02);
      expect(range / mean, `主干环 ${seg} 极差/均径应 ≤ 10%（成熟较弱浮雕端，不过夸张）`).toBeLessThanOrEqual(0.1);
    }
    expect(maxAbs * 1000, '主干最大极差应 ≥ 12mm（厘米级——基径 0.34–0.42m × 幅度比 3.3%）').toBeGreaterThanOrEqual(12);
  }, 30000);
});

describe('起伏幅度沿枝级递减（主干强末梢弱的比例式挂钩）', () => {
  it('主干极差 > L1 首环极差 > L5 首环极差；L5 绝对量 < 1mm 级（亚视觉地板 → 圆管）', () => {
    const result = buildTracked(SEED0);
    const trunkMax = Math.max(
      ...Array.from({ length: TRUNK_SEGS }, (_, seg) => {
        const radii = ringRadii(result, barkStart, seg, TRUNK_RADIAL);
        return Math.max(...radii) - Math.min(...radii);
      }),
    );
    const l1 = ringRadii(result, L1_BASE, 0, TREE3A_SLOT0_PROFILE.levels[0]!.radial);
    const l1Range = Math.max(...l1) - Math.min(...l1);
    const l5 = ringRadii(result, L5_BASE, 0, TREE3A_SLOT0_PROFILE.levels[4]!.radial);
    const l5Range = Math.max(...l5) - Math.min(...l5);
    expect(trunkMax, '主干极差应大于 L1').toBeGreaterThan(l1Range);
    expect(l1Range, 'L1 首环极差应 ≥ 2mm（粗枝仍有起伏）').toBeGreaterThanOrEqual(0.002);
    expect(l1Range, 'L1 极差应大于 L5').toBeGreaterThan(l5Range);
    expect(l5Range * 1000, 'L5 极差应 < 1mm（末梢亚毫米层被地板跳过——实测圆管）').toBeLessThan(1);
  }, 30000);
});

describe('环向连续无缝（wrap 位浮点级一致）', () => {
  it('主干全环段 + L1 首管 wrap 顶点对位置差 < 1e-9（环级共享预算——实测恰为 0）', () => {
    const result = buildTracked(SEED0);
    const pos = result.geometry.getAttribute('position');
    const checkTube = (base: number, segs: number, radial: number, label: string): void => {
      for (let seg = 0; seg < segs; seg++) {
        // quad j 顶点序：a0 a1 b1 | a0 b1 b0 → wrap 对 = (末 quad a1, quad0 a0) 与 (末 quad b1, quad0 b0)
        const quad = (j: number): number => base + (seg * radial + j) * 6;
        const a1 = quad(radial - 1) + 1;
        const a0 = quad(0);
        const b1 = quad(radial - 1) + 4;
        const b0 = quad(0) + 5;
        for (const [p, q] of [
          [a1, a0],
          [b1, b0],
        ]) {
          const diff = Math.hypot(
            pos.array[p * 3]! - pos.array[q * 3]!,
            pos.array[p * 3 + 1]! - pos.array[q * 3 + 1]!,
            pos.array[p * 3 + 2]! - pos.array[q * 3 + 2]!,
          );
          expect(diff, `${label} 段 ${seg} wrap 顶点对应浮点级一致`).toBeLessThan(1e-9);
        }
      }
    };
    checkTube(0, TRUNK_SEGS, TRUNK_RADIAL, '主干');
    checkTube(L1_BASE, TREE3A_SLOT0_PROFILE.levels[0]!.segs, TREE3A_SLOT0_PROFILE.levels[0]!.radial, 'L1 首管');
  }, 30000);
});

describe('法线解析修正（平滑外向）', () => {
  it('主干环顶点法线：外向 dot > 0、与径向夹角 < 45°（修复后实测 ≤ 8.7°）、单位长度（float32 域）', () => {
    const result = buildTracked(SEED0);
    const pos = result.geometry.getAttribute('position');
    const nrm = result.geometry.getAttribute('normal');
    for (let seg = 0; seg < TRUNK_SEGS; seg++) {
      const idx = ringVertexIndices(barkStart, seg, TRUNK_RADIAL);
      const cx = idx.reduce((s, v) => s + pos.array[v * 3]!, 0) / TRUNK_RADIAL;
      const cy = idx.reduce((s, v) => s + pos.array[v * 3 + 1]!, 0) / TRUNK_RADIAL;
      const cz = idx.reduce((s, v) => s + pos.array[v * 3 + 2]!, 0) / TRUNK_RADIAL;
      for (const v of idx) {
        const nx = nrm.array[v * 3]!;
        const ny = nrm.array[v * 3 + 1]!;
        const nz = nrm.array[v * 3 + 2]!;
        const len = Math.hypot(nx, ny, nz);
        expect(Math.abs(len - 1), '法线应为单位长度（float32 存储精度）').toBeLessThan(1e-6);
        const dot =
          (nx * (pos.array[v * 3]! - cx) + ny * (pos.array[v * 3 + 1]! - cy) + nz * (pos.array[v * 3 + 2]! - cz)) /
          (len * Math.hypot(pos.array[v * 3]! - cx, pos.array[v * 3 + 1]! - cy, pos.array[v * 3 + 2]! - cz));
        expect(dot, '法线应外向').toBeGreaterThan(0);
        expect(dot, '法线与径向夹角应 < 45°（起伏坡度倾斜有界）').toBeGreaterThan(Math.SQRT1_2);
      }
    }
  }, 30000);
});

describe('轴向低频语言（脊沿轴向伸展 + 缓慢游走，非环形箍纹）', () => {
  /** 剖面相关系数 */
  const corr = (a: number[], b: number[]): number => {
    const ma = a.reduce((s, x) => s + x, 0) / a.length;
    const mb = b.reduce((s, x) => s + x, 0) / b.length;
    let num = 0;
    let da = 0;
    let db = 0;
    for (let i = 0; i < a.length; i++) {
      num += (a[i]! - ma) * (b[i]! - mb);
      da += (a[i]! - ma) ** 2;
      db += (b[i]! - mb) ** 2;
    }
    return num / Math.sqrt(da * db);
  };

  it('相邻环起伏剖面相关 ≥ 0.9（沿轴缓变）；首末环相关 ≤ 0.5（游走存在）', () => {
    const result = buildTracked(SEED0);
    const profiles = Array.from({ length: TRUNK_SEGS }, (_, seg) => {
      const radii = ringRadii(result, barkStart, seg, TRUNK_RADIAL);
      const mean = radii.reduce((s, r) => s + r, 0) / radii.length;
      return radii.map((r) => r - mean);
    });
    for (let seg = 0; seg < TRUNK_SEGS - 1; seg++) {
      expect(
        corr(profiles[seg]!, profiles[seg + 1]!),
        `环 ${seg}→${seg + 1} 剖面应缓慢变化（相邻高相关）`,
      ).toBeGreaterThanOrEqual(0.9);
    }
    expect(
      corr(profiles[0]!, profiles[TRUNK_SEGS - 1]!),
      '首末环剖面应已游走开（非静态贴图/环形箍纹；实测 ≈ −0.93）',
    ).toBeLessThanOrEqual(0.5);
  }, 30000);
});

describe('参数面与纪律锁', () => {
  it('amplitudeRatio = 0 → 主干环极差 ≈ 0（参数真实驱动的退化路径）', () => {
    const result = buildTracked(SEED0, {
      ...TREE3A_SLOT0_PROFILE,
      barkRelief: { ...TREE3A_SLOT0_PROFILE.barkRelief, amplitudeRatio: 0 },
    });
    for (let seg = 0; seg < TRUNK_SEGS; seg++) {
      const radii = ringRadii(result, barkStart, seg, TRUNK_RADIAL);
      const range = Math.max(...radii) - Math.min(...radii);
      expect(range, `关起伏后环 ${seg} 应为圆管`).toBeLessThan(1e-6);
    }
  }, 30000);

  it('slot-1…7 barkRelief 逐位同 slot-0（树皮微起伏非槽差异维度）；谐波全为 ≤5 整数', () => {
    const anchor = TREE3A_SHAPE_PROFILES[0]!.barkRelief;
    expect(TREE3A_SHAPE_PROFILES).toHaveLength(8);
    for (let slot = 1; slot < 8; slot++) {
      expect(TREE3A_SHAPE_PROFILES[slot]!.barkRelief, `slot-${slot} barkRelief 应由 spread 继承逐位恒等`).toEqual(anchor);
    }
    for (const k of anchor.harmonics) {
      expect(Number.isInteger(k), '谐波数应为整数（θ 周期性来源）').toBe(true);
      expect(k, '谐波数应 ≤5（主干 radial 12 奈奎斯特安全域——只加低频契约）').toBeLessThanOrEqual(5);
      expect(k).toBeGreaterThanOrEqual(1);
    }
    expect(anchor.amplitudeRatio).toBeGreaterThan(0);
  });

  it('rng 消费次数 = 177234（T009.4 快照——起伏路径零 rng 消费，次数变化 = 随机流重排 = 返工）', () => {
    let calls = 0;
    const stream = mulberry32(SEED0);
    const counting = (): number => {
      calls++;
      return stream();
    };
    const result = buildBroadleafGeometry(counting, TREE3A_SLOT0_PROFILE);
    built.push(result);
    expect(calls, 'slot-0/规范种子的 rng 消费总数应与 T009.4 前快照逐位一致').toBe(177234);
  }, 30000);
});
