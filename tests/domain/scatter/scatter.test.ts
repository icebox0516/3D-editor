/**
 * tests/domain/scatter/scatter.test.ts —— 撒点纯函数测试（T003.1，D8/D17）。
 *
 * 覆盖（任务书验收清单全项）：
 * - 确定性：同 seed 双跑逐位一致；不同 seed 结果不同；块级 API 重复调用一致；
 * - 配比统计：40/30/20/10 权重 → 大样本占比区间断言（±5% 绝对容差）；
 * - 边缘衰减单调：按到边界距离分带实测密度单调不降，带宽外恢复标称密度；
 * - 密度换算误差带：均匀层无衰减时 |N − density×area| < 5σ+容差（点均匀落格无偏）；
 * - 凹多边形包含：L 形缺口区零点、全部输出点在多边形内；
 * - 退化输入：<3 顶点 / 零面积 / 密度≤0 / 空配比 / 全无效权重 → 空数组不抛错；
 * - 跨块覆盖：全量 = 逐块 scatterChunk 拼接（排序规范化后逐位一致，半开无缝无重叠，
 *   含负坐标跨原点 + 两层混合 + 衰减开启的复合场景）；
 * - 聚簇语义：clustering=1 时空粗格占比显著高于均匀层（聚集留白可观测）；
 * - 属性值域：rotation/scale/variantSeed/assetId 全部落契约区间；
 * - 参数钳制：clustering 越界与非有限、clusterRadius/scaleRange/weight 非法防御；
 * - 性能：2 万点全量撒点 < 50ms（预热一次排除 JIT 后计时）。
 */
import { describe, expect, it } from 'vitest';
import {
  scatterChunk,
  scatterPolygon,
} from '../../../src/domain/scatter';
import type { ScatterChunk, ScatterInstance, ScatterParams } from '../../../src/domain/scatter';
import { pointInPolygon } from '../../../src/core/math';
import type { Vec2 } from '../../../src/core/types';

/** 矩形环（XZ 平面，绕向无关） */
function rect(minX: number, minZ: number, maxX: number, maxZ: number): Vec2[] {
  return [
    { x: minX, y: minZ },
    { x: maxX, y: minZ },
    { x: maxX, y: maxZ },
    { x: minX, y: maxZ },
  ];
}

/** L 形凹多边形：100×100 缺右上 50×50（凹点在 (50,50)） */
function lShape(): Vec2[] {
  return [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 50 },
    { x: 50, y: 50 },
    { x: 50, y: 100 },
    { x: 0, y: 100 },
  ];
}

/** 基准配方：4 资产 40/30/20/10 */
const MIXED_ASSETS = [
  { assetId: 'oak', weight: 40 },
  { assetId: 'pine', weight: 30 },
  { assetId: 'bush', weight: 20 },
  { assetId: 'flower', weight: 10 },
];

function baseParams(overrides: Partial<ScatterParams> = {}): ScatterParams {
  return {
    polygon: rect(0, 0, 100, 100),
    densityPerM2: 1,
    assets: MIXED_ASSETS,
    seed: 123456789,
    ...overrides,
  };
}

/** 实例序列化（排序规范化比对用；-0 与 0 经 toFixed 归一） */
function instanceKey(i: ScatterInstance): string {
  return [
    i.position.x.toFixed(9),
    i.position.y.toFixed(9),
    i.rotationY.toFixed(9),
    i.scale.toFixed(9),
    String(i.variantSeed),
    i.assetId,
  ].join('|');
}

describe('scatterPolygon：确定性', () => {
  it('同 seed 双跑逐位一致（含两层混合 + 边缘衰减）', () => {
    const params = baseParams({ clustering: 0.6, edgeFalloffM: 8, scaleRange: { min: 0.7, max: 1.3 } });
    const a = scatterPolygon(params);
    const b = scatterPolygon(params);
    expect(a.length).toBeGreaterThan(1000);
    expect(b).toEqual(a);
    expect(b.map(instanceKey)).toEqual(a.map(instanceKey));
  });

  it('不同 seed 结果不同', () => {
    const a = scatterPolygon(baseParams({ seed: 1 }));
    const b = scatterPolygon(baseParams({ seed: 2 }));
    expect(a.length).toBeGreaterThan(0);
    expect(b.map(instanceKey)).not.toEqual(a.map(instanceKey));
  });

  it('聚簇份额边界：clustering=0 全均匀层、clustering=1 全聚簇层（均产出且确定）', () => {
    for (const clustering of [0, 1]) {
      const params = baseParams({ densityPerM2: 0.02, clustering });
      const a = scatterPolygon(params);
      const b = scatterPolygon(params);
      expect(a.length).toBeGreaterThan(50);
      expect(b).toEqual(a);
    }
  });
});

describe('scatterPolygon：配比统计', () => {
  it('40/30/20/10 大样本占比 ±5% 绝对容差', () => {
    const instances = scatterPolygon(baseParams());
    expect(instances.length).toBeGreaterThan(5000);
    const counts = new Map<string, number>();
    for (const i of instances) counts.set(i.assetId, (counts.get(i.assetId) ?? 0) + 1);
    const n = instances.length;
    expect(counts.get('oak')! / n).toBeGreaterThan(0.35);
    expect(counts.get('oak')! / n).toBeLessThan(0.45);
    expect(counts.get('pine')! / n).toBeGreaterThan(0.25);
    expect(counts.get('pine')! / n).toBeLessThan(0.35);
    expect(counts.get('bush')! / n).toBeGreaterThan(0.15);
    expect(counts.get('bush')! / n).toBeLessThan(0.25);
    expect(counts.get('flower')! / n).toBeGreaterThan(0.05);
    expect(counts.get('flower')! / n).toBeLessThan(0.15);
  });

  it('属性值域：rotation ∈[0,2π)、scale ∈ 范围、variantSeed 非负 31 位整数、assetId ∈ 配比表', () => {
    const range = { min: 0.5, max: 1.5 };
    const instances = scatterPolygon(baseParams({ scaleRange: range }));
    const ids = new Set(MIXED_ASSETS.map((a) => a.assetId));
    for (const i of instances) {
      expect(i.rotationY).toBeGreaterThanOrEqual(0);
      expect(i.rotationY).toBeLessThan(Math.PI * 2);
      expect(i.scale).toBeGreaterThanOrEqual(range.min);
      expect(i.scale).toBeLessThanOrEqual(range.max);
      expect(Number.isInteger(i.variantSeed)).toBe(true);
      expect(i.variantSeed).toBeGreaterThanOrEqual(0);
      expect(i.variantSeed).toBeLessThan(0x8000_0000);
      expect(ids.has(i.assetId)).toBe(true);
    }
  });
});

describe('scatterPolygon：边缘衰减', () => {
  it('分带密度单调不降，带宽外恢复标称密度（误差带内）', () => {
    // 100×100 矩形、密度 1、带宽 10：带 0-10 / 10-20 / 中心 80×80 三带
    const falloff = 10;
    const instances = scatterPolygon(baseParams({ edgeFalloffM: falloff }));
    const dist = (p: Vec2): number =>
      Math.min(p.x, p.y, 100 - p.x, 100 - p.y); // 矩形到边界距离
    // 环带 [lo,hi) 面积 = 内缩 lo 正方形 − 内缩 hi 正方形
    const bandArea = (lo: number, hi: number): number =>
      (100 - 2 * lo) * (100 - 2 * lo) - (100 - 2 * hi) * (100 - 2 * hi);
    let band1 = 0; // 0–10（衰减带）
    let band2 = 0; // 10–20（带外，应恢复标称）
    let band3 = 0; // >20（中心，应恢复标称）
    for (const i of instances) {
      const d = dist(i.position);
      if (d < 10) band1++;
      else if (d < 20) band2++;
      else band3++;
    }
    const density1 = band1 / bandArea(0, 10);
    const density2 = band2 / bandArea(10, 20);
    const density3 = band3 / (60 * 60); // 带 3 = 内缩 20 的中心正方形 60×60
    // 单调：越靠边密度越低
    expect(density1).toBeLessThan(density2);
    expect(density2).toBeLessThanOrEqual(density3 * 1.1); // 带外两带同标称（涨落容差）
    // 衰减带明显稀疏（smoothstep 均值 ~0.5 → 显著低于标称）
    expect(density1).toBeLessThan(density3 * 0.75);
    // 带外恢复标称（±6σ 二项涨落 + 边界效应容差）
    expect(density2).toBeGreaterThan(0.8);
    expect(density2).toBeLessThan(1.2);
    expect(density3).toBeGreaterThan(0.85);
    expect(density3).toBeLessThan(1.15);
  });

  it('falloff=0 无衰减：密度换算误差带 |N − density×area| < 5σ+容差', () => {
    const d = 1;
    const instances = scatterPolygon(baseParams({ densityPerM2: d })); // 100×100 → 期望 10000
    const n = instances.length;
    const sigma = Math.sqrt(d * 10000);
    expect(Math.abs(n - d * 10000)).toBeLessThan(5 * sigma + 50);
  });
});

describe('scatterPolygon：凹多边形与包含', () => {
  it('L 形：全部点在多边形内，缺口区零点', () => {
    const instances = scatterPolygon(
      baseParams({ polygon: lShape(), densityPerM2: 0.5 }),
    );
    expect(instances.length).toBeGreaterThan(2000);
    let inNotch = 0;
    for (const i of instances) {
      expect(pointInPolygon(i.position, lShape())).toBe(true);
      if (i.position.x > 50 && i.position.y > 50) inNotch++;
    }
    expect(inNotch).toBe(0);
  });

  it('负坐标多边形（跨原点 cell 索引为负）正常产出且包含', () => {
    const polygon = rect(-60, -40, 60, 40);
    const instances = scatterPolygon(baseParams({ polygon, densityPerM2: 0.5 }));
    expect(instances.length).toBeGreaterThan(1500);
    for (const i of instances) {
      expect(pointInPolygon(i.position, polygon)).toBe(true);
      expect(i.position.x).toBeGreaterThanOrEqual(-60);
      expect(i.position.x).toBeLessThanOrEqual(60);
    }
  });
});

describe('scatterPolygon：退化输入', () => {
  it.each([
    ['少于 3 顶点', { polygon: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }],
    ['零面积（共线）', { polygon: [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 20 }] }],
    ['密度 0', { densityPerM2: 0 }],
    ['密度负值', { densityPerM2: -1 }],
    ['密度非有限', { densityPerM2: Number.NaN }],
    ['空配比', { assets: [] }],
    ['全无效权重', { assets: [{ assetId: 'a', weight: 0 }, { assetId: 'b', weight: -3 }] }],
  ])('%s → 空数组不抛错', (_name, overrides) => {
    expect(scatterPolygon(baseParams(overrides))).toEqual([]);
  });
});

describe('scatterPolygon：聚簇语义', () => {
  /** 最近邻距离中位数（抽样 sample 个点对全体 O(sample·N)；仅小样本/抽样用） */
  function medianNearestNeighbor(instances: ScatterInstance[], sample = instances.length): number {
    const ds: number[] = [];
    const step = Math.max(1, Math.floor(instances.length / sample));
    for (let i = 0; i < instances.length; i += step) {
      let min2 = Infinity;
      for (let j = 0; j < instances.length; j++) {
        if (i === j) continue;
        const dx = instances[i]!.position.x - instances[j]!.position.x;
        const dz = instances[i]!.position.y - instances[j]!.position.y;
        const d2 = dx * dx + dz * dz;
        if (d2 < min2) min2 = d2;
      }
      ds.push(Math.sqrt(min2));
    }
    ds.sort((a, b) => a - b);
    return ds[Math.floor(ds.length / 2)]!;
  }

  it('clustering=1 最近邻中位距离显著小于均匀层（簇内 4 倍密可观测）', () => {
    // 密度 0.02（200 点/百m²×100）：均匀层最近邻中位 ≈ 0.47/√d ≈ 3.3m；
    // 聚簇层簇内局部密度 = 4d（κ 模型）→ 中位 ≈ 1.65m——断言 0.7× 留涨落余量
    const uniform = scatterPolygon(baseParams({ densityPerM2: 0.02, clustering: 0 }));
    const clustered = scatterPolygon(baseParams({ densityPerM2: 0.02, clustering: 1 }));
    expect(Math.abs(clustered.length - uniform.length)).toBeLessThan(
      uniform.length * 0.35,
    );
    expect(medianNearestNeighbor(clustered)).toBeLessThan(
      0.7 * medianNearestNeighbor(uniform),
    );
  });

  it('聚簇观感与密度无关：高密度下簇内/背景密度比仍 ≈ κ（固定 k0 会稀释，回归锁）', () => {
    // d=1、c=1、R=5：期望每簇 k0 = πR²·d·κ ≈ 314 点，簇心步长 H = R√(4π) ≈ 17.7m。
    // 固定 k0=6 的旧设计在此密度下簇内密度 6/πR² ≈ 0.076 << d=1（聚簇反转稀释）——
    // 锁定：100×100 内聚簇结果的空 5×5 粗格显著存在（簇外留白），且总点数仍 ≈ 标称
    const clustered = scatterPolygon(
      baseParams({ densityPerM2: 1, clustering: 1, clusterRadiusM: 5 }),
    );
    expect(clustered.length).toBeGreaterThan(5000);
    const cells = new Set<string>();
    for (const i of clustered) {
      cells.add(`${Math.floor(i.position.x / 5)},${Math.floor(i.position.y / 5)}`);
    }
    // 簇覆盖占比期望 = c/κ = 25% → 非空粗格应显著少于全部 400 格
    expect(cells.size).toBeLessThan(320);
    expect(medianNearestNeighbor(clustered, 400)).toBeLessThan(0.35); // 簇内 4/m² → 中位 < 0.35m
  });
});

describe('scatterPolygon：参数钳制', () => {
  it('clustering 越界/非有限按边界或 0，clusterRadius 非法回退默认——均不抛错且确定', () => {
    for (const clustering of [-0.5, 1.7, Number.NaN, undefined]) {
      const params = baseParams({ densityPerM2: 0.05, clustering, clusterRadiusM: -1 });
      const a = scatterPolygon(params);
      expect(a.length).toBeGreaterThan(0);
      expect(scatterPolygon(params)).toEqual(a);
    }
  });

  it('scaleRange min>max 自动交换，等值恒定', () => {
    const swapped = scatterPolygon(
      baseParams({ scaleRange: { min: 2, max: 0.5 } }),
    );
    for (const i of swapped) {
      expect(i.scale).toBeGreaterThanOrEqual(0.5);
      expect(i.scale).toBeLessThanOrEqual(2);
    }
    const fixed = scatterPolygon(baseParams({ scaleRange: { min: 2, max: 2 } }));
    for (const i of fixed) expect(i.scale).toBe(2);
  });

  it('weight 无效项剔除、有效项仍按权重分布', () => {
    const instances = scatterPolygon(
      baseParams({ assets: [...MIXED_ASSETS, { assetId: 'ghost', weight: 0 }, { assetId: 'nan', weight: Number.NaN }] }),
    );
    expect(instances.every((i) => i.assetId !== 'ghost' && i.assetId !== 'nan')).toBe(true);
    expect(new Set(instances.map((i) => i.assetId))).toEqual(new Set(['oak', 'pine', 'bush', 'flower']));
  });
});

describe('scatterChunk：跨块覆盖', () => {
  /** 复合场景：负坐标跨原点 + 两层混合 + 边缘衰减 + 缩放范围 */
  const compositeParams = (overrides: Partial<ScatterParams> = {}): ScatterParams =>
    baseParams({
      polygon: rect(-55, -35, 65, 45),
      densityPerM2: 0.5,
      clustering: 0.6,
      edgeFalloffM: 6,
      scaleRange: { min: 0.8, max: 1.2 },
      ...overrides,
    });

  /** bbox 全覆盖的 20×20 tile 列表（整 20 对齐，无缝无重叠） */
  function tilesCovering(minX: number, minZ: number, maxX: number, maxZ: number, size = 20): ScatterChunk[] {
    const tiles: ScatterChunk[] = [];
    for (let x = Math.floor(minX / size) * size; x < maxX; x += size) {
      for (let z = Math.floor(minZ / size) * size; z < maxZ; z += size) {
        tiles.push({ minX: x, minZ: z, maxX: x + size, maxZ: z + size });
      }
    }
    return tiles;
  }

  it('全量 = 逐块拼接（排序规范化后逐位一致；两层混合 + 衰减 + 负坐标）', () => {
    const params = compositeParams();
    const full = scatterPolygon(params).map(instanceKey).sort();
    expect(full.length).toBeGreaterThan(2000);
    const tiles = tilesCovering(-55, -35, 65, 45);
    const collected = tiles.flatMap((t) => scatterChunk(params, t)).map(instanceKey).sort();
    // 半开语义：无重叠（收集数 == 全量数）且逐位一致
    expect(collected.length).toBe(full.length);
    expect(collected).toEqual(full);
  });

  it('块级重复调用逐位一致；与全场景无交叠块返回空', () => {
    const params = compositeParams();
    const chunk: ScatterChunk = { minX: -20, minZ: -20, maxX: 20, maxZ: 20 };
    const a = scatterChunk(params, chunk);
    expect(a.length).toBeGreaterThan(0);
    expect(scatterChunk(params, chunk)).toEqual(a);
    // 块内点确实落在块内（半开）
    for (const i of a) {
      expect(i.position.x).toBeGreaterThanOrEqual(chunk.minX);
      expect(i.position.x).toBeLessThan(chunk.maxX);
      expect(i.position.y).toBeGreaterThanOrEqual(chunk.minZ);
      expect(i.position.y).toBeLessThan(chunk.maxZ);
    }
    expect(scatterChunk(params, { minX: 500, minZ: 500, maxX: 600, maxZ: 600 })).toEqual([]);
  });

  it('同 seed 改密度后单块重算结果 = 新密度全量的该块切分（局部重算语义）', () => {
    const chunk: ScatterChunk = { minX: 0, minZ: 0, maxX: 40, maxZ: 40 };
    const params = compositeParams({ densityPerM2: 0.8 });
    const fromChunk = scatterChunk(params, chunk).map(instanceKey).sort();
    const fromFull = scatterPolygon(params)
      .filter((i) => i.position.x >= 0 && i.position.x < 40 && i.position.y >= 0 && i.position.y < 40)
      .map(instanceKey).sort();
    expect(fromChunk).toEqual(fromFull);
  });
});

describe('scatterPolygon：性能', () => {
  it('2 万点全量撒点 < 50ms（含聚簇 + 边缘衰减；预热一次排除 JIT）', () => {
    const params: ScatterParams = {
      polygon: rect(0, 0, 200, 100),
      densityPerM2: 1,
      assets: MIXED_ASSETS,
      clustering: 0.3,
      edgeFalloffM: 8,
      scaleRange: { min: 0.7, max: 1.3 },
      seed: 42,
    };
    scatterPolygon(params); // 预热
    const t0 = performance.now();
    const instances = scatterPolygon(params);
    const elapsed = performance.now() - t0;
    expect(instances.length).toBeGreaterThan(15000);
    expect(instances.length).toBeLessThan(25000);
    expect(elapsed).toBeLessThan(50);
  });
});
