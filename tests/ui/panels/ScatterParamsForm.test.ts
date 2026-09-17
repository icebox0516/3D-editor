/**
 * tests/ui/panels/ScatterParamsForm.test.ts —— 散布参数表单纯函数测试（T003.3，D18）。
 *
 * 覆盖：
 * - describeScatterControls：5 控件（密度/聚簇/边缘衰减/尺寸下限/上限）键与值域；
 *   生效值 = 配方默认 < 覆写合成 + 控件值域钳制；缺省段（无 scaleRange）回落 1/1；
 * - scatterAssetShares：相对权重折算百分比（40/30/20/10 → 57.1/42.9 整表替换案例）、
 *   非法项剔除、全无效 → 空行；覆写整表替换后按新表折算。
 */
import { describe, expect, it } from 'vitest';
import type { ScatterRecipe } from '../../../src/domain/scatter';
import {
  describeScatterControls,
  scatterAssetShares,
} from '../../../src/ui/panels/ScatterParamsForm';

const RECIPE: ScatterRecipe = {
  assets: [
    { assetId: 'asset_oak', weight: 40 },
    { assetId: 'asset_pine', weight: 30 },
    { assetId: 'asset_bush', weight: 20 },
    { assetId: 'asset_flower', weight: 10 },
  ],
  densityPerM2: 0.02,
  clustering: 0.3,
  edgeFalloffM: 2,
  scaleRange: { min: 0.9, max: 1.1 },
};

describe('describeScatterControls：控件描述与生效值', () => {
  it('五控件键序固定：密度/聚簇/边缘衰减/尺寸下限/尺寸上限', () => {
    const controls = describeScatterControls(RECIPE, undefined);
    expect(controls.map((c) => `${c.key}${c.bound ?? ''}`)).toEqual([
      'scatter.densityPerM2',
      'scatter.clustering',
      'scatter.edgeFalloffM',
      'scatter.scaleRangemin',
      'scatter.scaleRangemax',
    ]);
    expect(controls.map((c) => c.value)).toEqual([0.02, 0.3, 2, 0.9, 1.1]);
  });

  it('生效值 = 配方默认 < 覆写（白名单解析复用 domain 单一真相源）', () => {
    const controls = describeScatterControls(RECIPE, {
      'scatter.densityPerM2': 0.08,
      'scatter.clustering': 0.7,
      'scatter.edgeFalloffM': 4,
      'scatter.scaleRange': { min: 0.7, max: 1.3 },
    });
    expect(controls.map((c) => c.value)).toEqual([0.08, 0.7, 4, 0.7, 1.3]);
  });

  it('白名单外覆写不影响控件值；缺省 scaleRange 回落 1/1', () => {
    const minimal: ScatterRecipe = { assets: [{ assetId: 'a', weight: 1 }], densityPerM2: 0.1 };
    const controls = describeScatterControls(minimal, { 'scatter.clusterRadiusM': 99, color: '#fff' });
    expect(controls.map((c) => c.value)).toEqual([0.1, 0, 0, 1, 1]);
  });

  it('极端覆写钳到控件值域（滑条不越界；提交侧 sanitization 兜底）', () => {
    const controls = describeScatterControls(RECIPE, {
      'scatter.densityPerM2': 5,
      'scatter.clustering': 2,
      'scatter.edgeFalloffM': 99,
      'scatter.scaleRange': { min: 0.01, max: 50 },
    });
    expect(controls.map((c) => c.value)).toEqual([1, 1, 20, 0.2, 3]);
  });
});

describe('scatterAssetShares：配比折算百分比', () => {
  it('40/30/20/10 → 40.0/30.0/20.0/10.0（相对权重语义）', () => {
    expect(scatterAssetShares(RECIPE, undefined).map((s) => s.percent)).toEqual([40, 30, 20, 10]);
  });

  it('非整一权重等价折算：4/3/2/1 同上；非法项剔除', () => {
    const recipe: ScatterRecipe = {
      assets: [
        { assetId: 'a', weight: 4 },
        { assetId: 'b', weight: 3 },
        { assetId: 'bad', weight: 0 },
        { assetId: 'c', weight: 2 },
        { assetId: 'd', weight: 1 },
      ],
      densityPerM2: 0.1,
    };
    const shares = scatterAssetShares(recipe, undefined);
    expect(shares.map((s) => s.assetId)).toEqual(['a', 'b', 'c', 'd']);
    expect(shares.map((s) => s.percent)).toEqual([40, 30, 20, 10]);
  });

  it('覆写配比整表替换 → 按新表折算', () => {
    const shares = scatterAssetShares(RECIPE, {
      'scatter.assets': [
        { assetId: 'asset_oak', weight: 3 },
        { assetId: 'asset_bush', weight: 1 },
      ],
    });
    expect(shares.map((s) => `${s.assetId}:${s.percent}`)).toEqual(['asset_oak:75', 'asset_bush:25']);
  });

  it('全无效配比 → 空行（与撒点空结果同口径）', () => {
    const recipe: ScatterRecipe = {
      assets: [{ assetId: 'a', weight: -1 }],
      densityPerM2: 0.1,
    };
    expect(scatterAssetShares(recipe, undefined)).toEqual([]);
  });
});
