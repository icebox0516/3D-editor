/**
 * tests/domain/scatter/recipe.test.ts —— 配方覆写解析与撒点输入组装测试（T003.3，D18）。
 *
 * 覆盖：
 * - applyScatterOverrides 白名单：五键各生效；clusterRadiusM/sampler/未知键忽略；
 * - 非法值防御：密度≤0/非有限、聚簇越界钳制、负衰减忽略、scaleRange 非法/自动摆正、
 *   assets 全无效/空表/部分无效（整表替换语义）；
 * - 不可变性：原配方对象与 assets 数组不被修改；
 * - resolveScatterSeed：显式 seed 优先（含负数无符号折算）；缺省派生 hashString(objectId)
 *   确定性（同 id 同值、不同 id 雪崩不同、undefined/非有限回退派生）；
 * - composeScatterParams：配方+覆写+多边形+seed 全量拼装、缺省段透传、
 *   组装结果可直接喂 scatterPolygon（端到端冒烟：覆写密度→点数单调变化）。
 */
import { describe, expect, it } from 'vitest';
import {
  applyScatterOverrides,
  composeScatterParams,
  resolveScatterSeed,
  scatterPolygon,
  type ScatterRecipe,
} from '../../../src/domain/scatter';
import { hashString } from '../../../src/core/random';

const BASE_RECIPE: ScatterRecipe = {
  assets: [
    { assetId: 'oak', weight: 40 },
    { assetId: 'pine', weight: 20 },
  ],
  densityPerM2: 0.02,
  clustering: 0.3,
  clusterRadiusM: 6,
  edgeFalloffM: 2,
  scaleRange: { min: 0.9, max: 1.1 },
};

describe('applyScatterOverrides：白名单', () => {
  it('五键各生效', () => {
    const next = applyScatterOverrides(BASE_RECIPE, {
      'scatter.densityPerM2': 0.05,
      'scatter.clustering': 0.8,
      'scatter.edgeFalloffM': 4,
      'scatter.scaleRange': { min: 1.2, max: 0.8 },
      'scatter.assets': [{ assetId: 'bush', weight: 3 }],
    });
    expect(next.densityPerM2).toBe(0.05);
    expect(next.clustering).toBe(0.8);
    expect(next.edgeFalloffM).toBe(4);
    expect(next.scaleRange).toEqual({ min: 0.8, max: 1.2 }); // 自动摆正
    expect(next.assets).toEqual([{ assetId: 'bush', weight: 3 }]); // 整表替换
  });

  it('白名单外键忽略（clusterRadiusM/sampler/表面裸键/未知前缀）', () => {
    const next = applyScatterOverrides(BASE_RECIPE, {
      'scatter.clusterRadiusM': 99,
      'scatter.sampler': 'poisson',
      densityPerM2: 5, // 表面裸键撞名不生效
      color: '#ff0000',
      'scatter.unknown': 1,
    } as Record<string, unknown>);
    expect(next.clusterRadiusM).toBe(6);
    expect(next.densityPerM2).toBe(0.02);
  });

  it('overrides 缺省/非对象 → 原样配方（新对象）', () => {
    expect(applyScatterOverrides(BASE_RECIPE, undefined)).toEqual(BASE_RECIPE);
    expect(applyScatterOverrides(BASE_RECIPE, {})).toEqual(BASE_RECIPE);
    expect(applyScatterOverrides(BASE_RECIPE, undefined)).not.toBe(BASE_RECIPE);
  });
});

describe('applyScatterOverrides：非法值防御', () => {
  it('密度非正/非有限 → 回退配方值', () => {
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, 'x', null]) {
      const next = applyScatterOverrides(BASE_RECIPE, { 'scatter.densityPerM2': bad });
      expect(next.densityPerM2).toBe(0.02);
    }
  });

  it('聚簇越界钳到 [0,1]、非有限忽略', () => {
    expect(applyScatterOverrides(BASE_RECIPE, { 'scatter.clustering': 1.5 }).clustering).toBe(1);
    expect(applyScatterOverrides(BASE_RECIPE, { 'scatter.clustering': -0.2 }).clustering).toBe(0);
    expect(applyScatterOverrides(BASE_RECIPE, { 'scatter.clustering': Number.NaN }).clustering).toBe(0.3);
  });

  it('负衰减/非有限忽略；0 合法（关衰减）', () => {
    expect(applyScatterOverrides(BASE_RECIPE, { 'scatter.edgeFalloffM': -3 }).edgeFalloffM).toBe(2);
    expect(applyScatterOverrides(BASE_RECIPE, { 'scatter.edgeFalloffM': Number.NaN }).edgeFalloffM).toBe(2);
    expect(applyScatterOverrides(BASE_RECIPE, { 'scatter.edgeFalloffM': 0 }).edgeFalloffM).toBe(0);
  });

  it('scaleRange 非法形态/非正 → 忽略', () => {
    for (const bad of [null, 3, { min: 0, max: 1 }, { min: Number.NaN, max: 1 }, { min: 1 }, 'x']) {
      const next = applyScatterOverrides(BASE_RECIPE, { 'scatter.scaleRange': bad });
      expect(next.scaleRange).toEqual({ min: 0.9, max: 1.1 });
    }
  });

  it('assets 非数组/空表/全无效 → 忽略；部分无效取合法项', () => {
    for (const bad of [null, 3, [], [{ assetId: '', weight: 1 }], [{ assetId: 'a', weight: 0 }]]) {
      const next = applyScatterOverrides(BASE_RECIPE, { 'scatter.assets': bad });
      expect(next.assets).toEqual(BASE_RECIPE.assets);
    }
    const next = applyScatterOverrides(BASE_RECIPE, {
      'scatter.assets': [
        { assetId: 'a', weight: 2 },
        { assetId: '', weight: 5 },
        { assetId: 'b', weight: -1 },
        null,
      ],
    });
    expect(next.assets).toEqual([{ assetId: 'a', weight: 2 }]);
  });

  it('原配方不可变（对象与 assets 数组均不被修改）', () => {
    const recipe: ScatterRecipe = {
      assets: [{ assetId: 'oak', weight: 1 }],
      densityPerM2: 0.1,
    };
    applyScatterOverrides(recipe, {
      'scatter.densityPerM2': 0.5,
      'scatter.assets': [{ assetId: 'pine', weight: 2 }],
    });
    expect(recipe.densityPerM2).toBe(0.1);
    expect(recipe.assets).toEqual([{ assetId: 'oak', weight: 1 }]);
  });
});

describe('resolveScatterSeed：seed 派生与优先级', () => {
  it('显式有限 seed 优先（负数无符号折算）', () => {
    expect(resolveScatterSeed(123, 'region_1')).toBe(123);
    expect(resolveScatterSeed(-1, 'region_1')).toBe(0xffffffff);
  });

  it('缺省/非有限 → 派生 hashString(objectId)：同 id 同值、不同 id 不同', () => {
    expect(resolveScatterSeed(undefined, 'region_1')).toBe(hashString('region_1'));
    expect(resolveScatterSeed(undefined, 'region_1')).toBe(resolveScatterSeed(undefined, 'region_1'));
    expect(resolveScatterSeed(Number.NaN, 'region_1')).toBe(hashString('region_1'));
    const ids = ['region_1', 'region_2', 'region_3', 'region_4'];
    const seeds = new Set(ids.map((id) => resolveScatterSeed(undefined, id)));
    expect(seeds.size).toBe(ids.length); // 雪崩：样本身本互不相同
  });
});

describe('composeScatterParams：组装与端到端', () => {
  const polygon = [
    { x: 0, y: 0 },
    { x: 50, y: 0 },
    { x: 50, y: 50 },
    { x: 0, y: 50 },
  ];

  it('配方+覆写+多边形+seed 全量拼装；缺省段透传 undefined', () => {
    const params = composeScatterParams({
      polygon,
      recipe: { assets: [{ assetId: 'oak', weight: 1 }], densityPerM2: 0.1 },
      overrides: { 'scatter.clustering': 0.5 },
      seed: 42,
    });
    expect(params).toEqual({
      polygon,
      densityPerM2: 0.1,
      assets: [{ assetId: 'oak', weight: 1 }],
      clustering: 0.5,
      clusterRadiusM: undefined,
      edgeFalloffM: undefined,
      scaleRange: undefined,
      seed: 42,
    });
  });

  it('组装结果可直接撒点；覆写密度 → 点数单调上涨；同输入双跑一致', () => {
    const low = composeScatterParams({ polygon, recipe: BASE_RECIPE, seed: 7 });
    const high = composeScatterParams({
      polygon,
      recipe: BASE_RECIPE,
      overrides: { 'scatter.densityPerM2': 0.08 },
      seed: 7,
    });
    const lowPts = scatterPolygon(low);
    const highPts = scatterPolygon(high);
    expect(lowPts.length).toBeGreaterThan(0);
    expect(highPts.length).toBeGreaterThan(lowPts.length * 2);
    expect(scatterPolygon(low).map((i) => JSON.stringify(i))).toEqual(
      lowPts.map((i) => JSON.stringify(i)),
    );
  });

  it('换 seed → 结果不同；同 seed 换表面参数互不干扰撒点位置流', () => {
    const a = composeScatterParams({ polygon, recipe: BASE_RECIPE, seed: 1 });
    const b = composeScatterParams({ polygon, recipe: BASE_RECIPE, seed: 2 });
    const posA = scatterPolygon(a).map((i) => `${i.position.x.toFixed(6)},${i.position.y.toFixed(6)}`);
    const posB = scatterPolygon(b).map((i) => `${i.position.x.toFixed(6)},${i.position.y.toFixed(6)}`);
    expect(posA.join(';')).not.toBe(posB.join(';'));
  });
});
