/**
 * domain/scatter/recipe —— Style 配方的散布段：覆写解析 + 撒点输入组装（T003.3，D18）。
 *
 * 职责：Style 预设携带可选 scatter 配方块（assets 配比 + 密度/聚簇/簇半径/边缘衰减/
 *      尺寸范围，纯数据），区域级 overrides 按白名单覆写后与区域多边形、seed 组装成
 *      ScatterParams 喂 003.1 撒点函数 / 003.2 分块管线。
 * 裁定（D18）：
 *   - 同构两段可选：scatter 块挂在 StylePresetMeta 上与表面段（defaultParams+build）并存；
 *   - 覆写白名单 = 全参减簇半径：densityPerM2/clustering/edgeFalloffM/scaleRange/assets
 *     可覆写（assets 整表替换），clusterRadiusM/sampler 不开放；键一律 `scatter.` 前缀
 *     （防与表面参数裸键撞名；表面键保持裸名，存量场景兼容）；
 *   - seed 独立位不进 overrides：缺省派生 hashString(objectId)（确定性，旧场景/未重掷
 *     区域不闪变），重掷经命令显式写入。
 * 边界：纯函数零 THREE 零 DOM（分层检查自然约束）；非法覆写值防御性忽略（回退配方值，
 *      不抛错——覆写可来自手改的场景文件）；深层值合法性兜底归 scatter.ts prepareContext。
 */
import { hashString } from '../../core/random';
import type { Vec2 } from '../../core/types';
import type { ScatterAssetWeight, ScatterParams, ScatterScaleRange } from './scatter';

/** 散布配方（Style 预设散布段，纯数据；形状/种子/采样器不属于配方——来自区域与管线） */
export interface ScatterRecipe {
  /** 资产配比表（相对权重归一化：概率 = wᵢ/Σw；≤0/非有限项剔除、全无效空散布） */
  assets: ScatterAssetWeight[];
  /** 目标密度（点/m²，>0 有效） */
  densityPerM2: number;
  /** 聚簇份额 0–1（0=全均匀，1=全聚簇；缺省 0） */
  clustering?: number;
  /** 簇半径（米；缺省 5）——配方内部参，不进区域覆写白名单 */
  clusterRadiusM?: number;
  /** 边缘衰减带宽（米；0/缺省 = 无衰减） */
  edgeFalloffM?: number;
  /** 尺寸范围（缺省 {min:1, max:1} 无缩放抖动） */
  scaleRange?: ScatterScaleRange;
}

/** 区域级可覆写键全集（白名单单一真相源；UI 参数组与覆写解析共用） */
export const SCATTER_OVERRIDE_KEYS = [
  'scatter.densityPerM2',
  'scatter.clustering',
  'scatter.edgeFalloffM',
  'scatter.scaleRange',
  'scatter.assets',
] as const;

export type ScatterOverrideKey = (typeof SCATTER_OVERRIDE_KEYS)[number];

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

/** 覆写配比表防御：[{assetId, weight}] 中合法项（非空 id + 有限正权重）；全无效 → null（视为无此覆写） */
function sanitizeAssets(v: unknown): ScatterAssetWeight[] | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  const out: ScatterAssetWeight[] = [];
  for (const item of v) {
    if (
      typeof item === 'object' &&
      item !== null &&
      typeof (item as ScatterAssetWeight).assetId === 'string' &&
      (item as ScatterAssetWeight).assetId !== '' &&
      isFiniteNumber((item as ScatterAssetWeight).weight) &&
      (item as ScatterAssetWeight).weight > 0
    ) {
      out.push({ assetId: (item as ScatterAssetWeight).assetId, weight: (item as ScatterAssetWeight).weight });
    }
  }
  return out.length > 0 ? out : null;
}

/** 覆写尺寸范围防御：{min,max} 均有限正数（顺序自动摆正）；非法 → null（视为无此覆写） */
function sanitizeScaleRange(v: unknown): ScatterScaleRange | null {
  if (typeof v !== 'object' || v === null) return null;
  const r = v as Partial<ScatterScaleRange>;
  if (!isFiniteNumber(r.min) || !isFiniteNumber(r.max) || r.min <= 0 || r.max <= 0) return null;
  return { min: Math.min(r.min, r.max), max: Math.max(r.min, r.max) };
}

/**
 * 应用白名单覆写 → 生效配方（新对象，原配方不可变）。
 * 只认 SCATTER_OVERRIDE_KEYS 五键，其余（含 clusterRadiusM/sampler/表面裸键）原样忽略；
 * 非法值防御回退配方值不抛错；assets 为整表替换语义（不做逐 assetId 增量合并）。
 */
export function applyScatterOverrides(
  recipe: ScatterRecipe,
  overrides: Record<string, unknown> | undefined,
): ScatterRecipe {
  const next: ScatterRecipe = { ...recipe, assets: [...recipe.assets] };
  if (!overrides || typeof overrides !== 'object') return next;

  const density = overrides['scatter.densityPerM2'];
  if (isFiniteNumber(density) && density > 0) next.densityPerM2 = density;

  const clustering = overrides['scatter.clustering'];
  if (isFiniteNumber(clustering)) next.clustering = Math.min(1, Math.max(0, clustering));

  const edgeFalloff = overrides['scatter.edgeFalloffM'];
  if (isFiniteNumber(edgeFalloff) && edgeFalloff >= 0) next.edgeFalloffM = edgeFalloff;

  const scaleRange = sanitizeScaleRange(overrides['scatter.scaleRange']);
  if (scaleRange) next.scaleRange = scaleRange;

  const assets = sanitizeAssets(overrides['scatter.assets']);
  if (assets) next.assets = assets;

  return next;
}

/**
 * 区域散布 seed 解析（D18）：显式 seed 优先（有限数即可，负数按无符号折算）；
 * 缺省派生 hashString(objectId)——同区域恒同值（旧场景/未重掷不闪变），
 * 不同区域天然不同（objectId 全局唯一）。
 */
export function resolveScatterSeed(seed: number | undefined, objectId: string): number {
  if (isFiniteNumber(seed)) return seed >>> 0;
  return hashString(objectId);
}

/**
 * 组装撒点输入：区域多边形 + 配方 + 覆写 + seed → ScatterParams。
 * 纯拼装不做撒点防御（<3 顶点/零面积/密度≤0 等由 scatter.ts 返回空数组）；
 * polygon 直接引用调用方数组（撒点函数只读）。
 */
export function composeScatterParams(input: {
  polygon: Vec2[];
  recipe: ScatterRecipe;
  overrides?: Record<string, unknown>;
  seed: number;
}): ScatterParams {
  const effective = applyScatterOverrides(input.recipe, input.overrides);
  return {
    polygon: input.polygon,
    densityPerM2: effective.densityPerM2,
    assets: effective.assets,
    clustering: effective.clustering,
    clusterRadiusM: effective.clusterRadiusM,
    edgeFalloffM: effective.edgeFalloffM,
    scaleRange: effective.scaleRange,
    seed: input.seed,
  };
}
