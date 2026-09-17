/**
 * tests/runtime/GizmoImpl.alignGuides.test.ts —— 对齐参考线 + 高度层吸附纯函数测试
 * （T8.1 R2/R3，先测后码；沿 T7.6 GizmoImpl.objectSnap.test 形态）。
 *
 * 覆盖：
 * - collectSnapCandidates：每足迹贡献 4 边 + 2 中心候选（含来源延伸范围与 kind 标记）；
 *   排除集过滤；空输入空候选；
 * - snapFootprintToCandidates：边缘对齐（min/max ↔ 边）、中心线对齐（center ↔ center）、
 *   阈值边界、择优（距离最小）、单轴命中、已对齐 null、参考线端点 = 两框延伸范围并集；
 * - snapElevationDelta：底面层吸附择优（≤ threshold 最近）、超阈值 null、已对齐 null、
 *   非法阈值恒 null。
 * 边界：node 环境只测纯函数（TransformControls 交互与参考线渲染归浏览器验收）。
 */
import { describe, expect, it } from 'vitest';
import type { ID } from '../../src/core/types';
import {
  collectSnapCandidates,
  snapElevationDelta,
  snapFootprintToCandidates,
} from '../../src/runtime/services/GizmoImpl';
import type { FootprintBox } from '../../src/runtime/services/GizmoImpl';

const box = (minX: number, maxX: number, minZ: number, maxZ: number): FootprintBox => ({
  minX,
  maxX,
  minZ,
  maxZ,
});

describe('collectSnapCandidates · 候选线收集（边 + 中心）', () => {
  it('每足迹贡献 X 轴 2 边 + 1 中心、Z 轴同构（含来源延伸范围与 kind）', () => {
    const entries: Array<{ id: ID; box: FootprintBox }> = [
      { id: 'region_a', box: box(10, 20, 30, 40) }, // 中心 (15, 35)
    ];
    const candidates = collectSnapCandidates(entries, []);
    const xValues = candidates.x.map((c) => c.value);
    const xKinds = candidates.x.map((c) => c.kind);
    expect(xValues).toEqual([10, 20, 15]);
    expect(xKinds).toEqual(['edge', 'edge', 'center']);
    // 来源延伸范围：X 轴候选沿 Z 延伸 = 框的 Z 范围
    for (const c of candidates.x) {
      expect(c.from).toBe(30);
      expect(c.to).toBe(40);
    }
    const zValues = candidates.z.map((c) => c.value);
    expect(zValues).toEqual([30, 40, 35]);
  });

  it('排除集过滤', () => {
    const entries: Array<{ id: ID; box: FootprintBox }> = [
      { id: 'region_a', box: box(0, 1, 0, 1) },
      { id: 'region_b', box: box(10, 20, 30, 40) },
    ];
    const candidates = collectSnapCandidates(entries, ['region_a']);
    expect(candidates.x).toHaveLength(3); // 仅 b
    expect(candidates.x.map((c) => c.value)).toEqual([10, 20, 15]);
  });

  it('空输入 → 双轴空候选', () => {
    const candidates = collectSnapCandidates([], []);
    expect(candidates.x).toEqual([]);
    expect(candidates.z).toEqual([]);
  });
});

describe('snapFootprintToCandidates · 择优吸附 + 参考线产出', () => {
  const threshold = 0.5;

  it('边缘对齐：moving.min 命中候选边 → 修正 + edge 参考线（端点 = 两框 Z 范围并集）', () => {
    const candidates = collectSnapCandidates(
      [{ id: 'src', box: box(10, 20, 0, 8) }],
      [],
    );
    const result = snapFootprintToCandidates(box(9.7, 12, 20, 24), candidates, threshold);
    expect(result).not.toBeNull();
    expect(result!.dx).toBeCloseTo(0.3, 10);
    expect(result!.dz).toBe(0);
    expect(result!.guides).toHaveLength(1);
    const guide = result!.guides[0]!;
    expect(guide.axis).toBe('x');
    expect(guide.kind).toBe('edge');
    expect(guide.value).toBe(10);
    // 参考线沿 Z：覆盖 moving(20..24) 与来源(0..8) 的并集
    expect(guide.from).toBe(0);
    expect(guide.to).toBe(24);
  });

  it('中心线对齐：moving 中心 ↔ 候选中心 → 修正 + center 参考线', () => {
    // 来源中心 x=15（边 10/20）；moving 中心 x=14.6 → 距 0.4 → dx=+0.4
    // （边参考 12.8/16.4 距边 2.8/3.6 出阈——纯中心命中）
    const candidates = collectSnapCandidates([{ id: 'src', box: box(10, 20, 0, 8) }], []);
    const result = snapFootprintToCandidates(box(12.8, 16.4, 100, 104), candidates, threshold);
    expect(result).not.toBeNull();
    expect(result!.dx).toBeCloseTo(0.4, 10);
    const guide = result!.guides.find((g) => g.kind === 'center');
    expect(guide).toBeDefined();
    expect(guide!.axis).toBe('x');
    expect(guide!.value).toBe(15);
    expect(guide!.from).toBe(0);
    expect(guide!.to).toBe(104);
  });

  it('Z 轴独立命中：中心线沿 X 延伸', () => {
    const candidates = collectSnapCandidates([{ id: 'src', box: box(0, 8, 10, 20) }], []);
    // 来源 z 中心 15；moving z (13.2, 17.2) 中心 15.2 → 距 0.2 → dz = −0.2
    const result = snapFootprintToCandidates(box(100, 104, 13.2, 17.2), candidates, threshold);
    expect(result).not.toBeNull();
    expect(result!.dz).toBeCloseTo(-0.2, 10);
    expect(result!.dx).toBe(0);
    const guide = result!.guides[0]!;
    expect(guide.axis).toBe('z');
    expect(guide.kind).toBe('center');
    expect(guide.value).toBe(15);
    expect(guide.from).toBe(0); // 来源 X 范围 0..8 与 moving 100..104 并集
    expect(guide.to).toBe(104);
  });

  it('两轴同时命中 → 双轴修正 + 两条参考线', () => {
    const candidates = collectSnapCandidates([{ id: 'src', box: box(10, 20, 10, 20) }], []);
    // X：moving.min 9.8 → 候选 10（0.2）；Z：moving.min 9.9 → 候选 10（0.1）
    const result = snapFootprintToCandidates(box(9.8, 12, 9.9, 12), candidates, threshold);
    expect(result!.dx).toBeCloseTo(0.2, 10);
    expect(result!.dz).toBeCloseTo(0.1, 10);
    expect(result!.guides).toHaveLength(2);
  });

  it('阈值边界：恰 ≤ 吸、略超不吸', () => {
    const candidates = collectSnapCandidates([{ id: 'src', box: box(10, 20, 10, 20) }], []);
    expect(snapFootprintToCandidates(box(9.5, 12, 100, 104), candidates, threshold)).not.toBeNull();
    expect(snapFootprintToCandidates(box(9.49, 12, 100, 104), candidates, threshold)).toBeNull();
  });

  it('恰对齐（d=0）→ 零修正但产出参考线（对齐反馈连续不闪断）', () => {
    const candidates = collectSnapCandidates([{ id: 'src', box: box(10, 20, 10, 20) }], []);
    const result = snapFootprintToCandidates(box(10, 13, 100, 104), candidates, threshold);
    expect(result).not.toBeNull();
    expect(result!.dx).toBe(0);
    expect(result!.dz).toBe(0); // Z 轴远离候选（100..104 vs 10..20）
    expect(result!.guides).toHaveLength(1);
    expect(result!.guides[0]!.kind).toBe('edge');
    expect(result!.guides[0]!.value).toBe(10);
  });

  it('无候选 / 非法阈值 → null', () => {
    expect(snapFootprintToCandidates(box(9.9, 12, 9.9, 12), { x: [], z: [] }, threshold)).toBeNull();
    const candidates = collectSnapCandidates([{ id: 'src', box: box(10, 20, 10, 20) }], []);
    expect(snapFootprintToCandidates(box(9.9, 12, 100, 104), candidates, 0)).toBeNull();
    expect(snapFootprintToCandidates(box(9.9, 12, 100, 104), candidates, Number.NaN)).toBeNull();
  });

  it('距离择优：同轴多候选在阈内取最近（边缘更近 → edge；中心更近 → center）', () => {
    const candidates = collectSnapCandidates([{ id: 'src', box: box(10, 20, 10, 20) }], []);
    // moving x (9.7, 14.1)：min 距边 10 为 0.3；中心 11.9 距候选中心 15 = 3.1 → 取边
    const edge = snapFootprintToCandidates(box(9.7, 14.1, 100, 104), candidates, threshold);
    expect(edge!.dx).toBeCloseTo(0.3, 10);
    expect(edge!.guides[0]!.kind).toBe('edge');
    // moving x (13.7, 15.9)：中心 14.8 距候选中心 15 为 0.2；min 13.7 距边 10 = 3.7 → 取中心
    const center = snapFootprintToCandidates(box(13.7, 15.9, 100, 104), candidates, threshold);
    expect(center!.dx).toBeCloseTo(0.2, 10);
    expect(center!.guides[0]!.kind).toBe('center');
  });
});

describe('snapElevationDelta · 高度层吸附择优', () => {
  const levels = [0, 2.06, 10];

  it('底面在候选 0.3 内 → 吸附到最近层', () => {
    expect(snapElevationDelta(2.36, levels, 0.5)).toBeCloseTo(-0.3, 10); // 2.36 → 2.06
    expect(snapElevationDelta(9.8, levels, 0.5)).toBeCloseTo(0.2, 10); // 9.8 → 10
  });

  it('等距并列取先见候选（候选序确定性）', () => {
    expect(snapElevationDelta(0.4, [0, 0.8], 0.5)).toBeCloseTo(-0.4, 10); // → 0
    expect(snapElevationDelta(0.25, levels, 0.5)).toBeCloseTo(-0.25, 10);
  });

  it('超出全部候选阈值 → null', () => {
    expect(snapElevationDelta(5, levels, 0.5)).toBeNull();
  });

  it('恰在层上（零修正）→ null', () => {
    expect(snapElevationDelta(10, levels, 0.5)).toBeNull();
  });

  it('阈值边界：恰 ≤ 吸（0.5 距离）', () => {
    expect(snapElevationDelta(2.56, levels, 0.5)).toBeCloseTo(-0.5, 10);
  });

  it('非法阈值 → 恒 null；空候选 → null', () => {
    expect(snapElevationDelta(0.1, levels, 0)).toBeNull();
    expect(snapElevationDelta(0.1, levels, Number.NaN)).toBeNull();
    expect(snapElevationDelta(0.1, [], 0.5)).toBeNull();
  });
});
