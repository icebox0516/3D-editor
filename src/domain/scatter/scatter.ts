/**
 * domain/scatter/scatter —— 种子化确定性撒点纯函数（T003.1，D8/D17）。
 *
 * 职责：多边形（XZ 平面）+ 配方参数 + seed → 实例描述列表（位置/旋转/缩放/
 *      变体 seed/资产 id）。算法按 D17 grill 裁定：**抖动网格为 v1 唯一采样器**——
 *      密度直控（点/m²，正好是配方参数形态）、网格与世界原点对齐（非 bbox 对齐，
 *      保证多边形编辑后未受影响区域的 cell 哈希不变 → 局部重算天然成立）。
 *      聚簇 = 簇心网格 + 簇内二次撒点两层级；边缘衰减 = 密度场调制（保留概率随
 *      到边界距离 smoothstep 单调上升）。泊松盘记为后续可选增强（sampler 类型位预留）。
 *
 * 确定性根基：每个网格 cell 的随机流 = mulberry32(hashCell(seed, i, j))——只依赖
 *      (seed, cell 坐标, 层 salt) 与流内消费顺序，与遍历顺序、跳过的 cell 无关；
 *      同输入双跑逐位一致（撤销/重做、改参局部重算、跨块计算的共同根基）。
 *
 * 两层结构（clustering = 聚簇份额 c ∈ [0,1]）：
 *      均匀层：密度 d·(1-c)，步长 h=1/√d_u 的网格每 cell 一点、cell 内 U[0,h)² 抖动
 *              ——点恒落在自己 cell 内，块级计算无需外扩即可无漏覆盖；
 *      聚簇层：密度 d·c，每簇期望点数 k0 = κ·d_c·πR²（κ=4：簇内局部密度恒为
 *              标称 4 倍，聚簇观感与密度无关；k0≈6@R=5m·d_c=0.02），簇心网格步长
 *              H=√(k0/d_c)=R·√(πκ)（只由簇半径决定——密度全部体现在簇内点数），
 *              簇心 cell 内抖动定位，簇内 k~k0·U[0.6,1.4] 个点在半径 R 内极坐标
 *              均匀撒——簇内点可越出簇心 cell，块级遍历需外扩 R+H。
 *
 * 边界：纯函数、零 THREE 零 DOM、不读场景状态（分层检查自然约束 domain 层）；
 *      退化输入（<3 顶点/零面积/密度≤0/空配比）返回空数组不抛错。
 */
import { pointInPolygon, pointToSegmentDistance, polygonArea } from '../../core/math';
import type { Vec2 } from '../../core/types';
import { hashCell, mulberry32 } from '../../core/random';

/** v1 唯一采样器：抖动网格（D17）；泊松盘为后续可选增强（届时扩联合类型即可） */
export type ScatterSampler = 'jitter-grid';

/** 资产配比项：weight > 0 参与（非正/非有限项剔除）；配比按权重统计分布 */
export interface ScatterAssetWeight {
  assetId: string;
  weight: number;
}

/** 均匀缩放采样范围 [min, max]；min/max 非法自动交换，等值 = 恒定 */
export interface ScatterScaleRange {
  min: number;
  max: number;
}

/** 撒点输入（Style 配方的散布参数形态，D4；密度单位点/m² 为 D17 裁定） */
export interface ScatterParams {
  /** 多边形环（XZ 平面，Vec2=(x,世界z)）；不要求显式闭合；支持凹多边形 */
  polygon: Vec2[];
  /** 目标密度（点/m²，>0 有效） */
  densityPerM2: number;
  /** 资产配比表（空或全无效 → 空结果） */
  assets: ScatterAssetWeight[];
  /** 聚簇份额 0–1（0=全均匀，1=全聚簇；缺省 0；非有限钳到 0） */
  clustering?: number;
  /** 簇半径（米；缺省 5；非正回退默认） */
  clusterRadiusM?: number;
  /** 边缘衰减带宽（米；0/缺省 = 无衰减——带内保留概率随边界距离 smoothstep 升到 1） */
  edgeFalloffM?: number;
  /** 尺寸范围（缺省 {min:1, max:1} 无缩放抖动） */
  scaleRange?: ScatterScaleRange;
  /** 撒点种子（同 seed 同输出逐位一致） */
  seed: number;
  /** 采样器（缺省 'jitter-grid'，v1 唯一值） */
  sampler?: ScatterSampler;
}

/** 撒点输出实例：位置为 XZ 平面（y 由地表决定，消费方负责）；variantSeed 喂 T002.3 applyAssetVariants */
export interface ScatterInstance {
  position: Vec2;
  /** 绕 Y 旋转（弧度，[0,2π) 均匀） */
  rotationY: number;
  /** 均匀缩放（scaleRange 内均匀采样） */
  scale: number;
  /** 变体种子（非负 31 位整数，同 T002.3 rollVariantSeed 定义域） */
  variantSeed: number;
  assetId: string;
}

/** 空间块（XZ 轴对齐；半开语义 [min,max)——块拼接无缝无重叠） */
export interface ScatterChunk {
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
}

/** 聚簇层流 salt：与均匀层同 (i,j) cell 的随机流独立 */
const CLUSTER_LAYER_SALT = 0x9e3779b9;
/**
 * 簇内局部密度相对标称密度的放大倍数（κ=4）：任何密度下簇内恒 4 倍密——
 * 聚簇观感与密度无关（每簇点数随密度缩放，而非固定值在高密度下被稀释）。
 */
const CLUSTER_DENSITY_BOOST = 4;
const DEFAULT_CLUSTER_RADIUS_M = 5;

/** 钳制到 [0,1]；非有限按 0 */
function clamp01(v: number | undefined): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0;
}

/** 正数防御：非有限/非正回退 fallback */
function positiveOr(v: number | undefined, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : fallback;
}

/** 边缘衰减保留概率：带宽外恒 1，带内 smoothstep(dist/falloff)——随边界距离单调不降 */
function edgeKeepProbability(distToBoundary: number, falloffM: number): number {
  if (falloffM <= 0) return 1;
  const u = Math.min(1, Math.max(0, distToBoundary / falloffM));
  return u * u * (3 - 2 * u);
}

/** 点到多边形边界最短距离（逐边取 min；n<3 时 Infinity） */
function distToPolygonBoundary(p: Vec2, ring: Vec2[]): number {
  let min = Infinity;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const d = pointToSegmentDistance(p, ring[j]!, ring[i]!);
    if (d < min) min = d;
  }
  return min;
}

/** 归一化后的撒点上下文（参数防御 + 几何预计算，两层共用） */
interface ScatterContext {
  ring: Vec2[];
  /** 有效配比的累积权重表（升序累积，末项恒 1） */
  cumulative: { assetId: string; at: number }[];
  seed: number;
  clustering: number;
  clusterRadius: number;
  edgeFalloff: number;
  scaleMin: number;
  scaleMax: number;
  /** 均匀层步长（clustering=1 时无层，置 0 表示跳过） */
  uniformStep: number;
  /** 聚簇层簇心步长（clustering=0 时无层，置 0 表示跳过） */
  clusterStep: number;
  /** 每簇期望点数（κ·d_c·πR²，≥1） */
  pointsPerCluster: number;
  bbox: { minX: number; minZ: number; maxX: number; maxZ: number };
}

function prepareContext(params: ScatterParams): ScatterContext | null {
  const ring = params.polygon;
  if (!Array.isArray(ring) || ring.length < 3 || polygonArea(ring) <= 0) return null;
  const density = params.densityPerM2;
  if (typeof density !== 'number' || !Number.isFinite(density) || density <= 0) return null;

  const cumulative: { assetId: string; at: number }[] = [];
  let total = 0;
  for (const a of params.assets ?? []) {
    if (typeof a?.weight === 'number' && Number.isFinite(a.weight) && a.weight > 0) {
      total += a.weight;
      cumulative.push({ assetId: a.assetId, at: total });
    }
  }
  if (cumulative.length === 0) return null;
  for (const c of cumulative) c.at /= total;

  const clustering = clamp01(params.clustering);
  const densityUniform = density * (1 - clustering);
  const densityCluster = density * clustering;
  const clusterRadius = positiveOr(params.clusterRadiusM, DEFAULT_CLUSTER_RADIUS_M);
  const edgeFalloff = Math.max(0, positiveOr(params.edgeFalloffM, 0));
  const pointsPerCluster =
    densityCluster > 0
      ? Math.max(
          1,
          Math.round(
            Math.PI * clusterRadius * clusterRadius * densityCluster * CLUSTER_DENSITY_BOOST,
          ),
        )
      : 0;

  let scaleMin = 1;
  let scaleMax = 1;
  const range = params.scaleRange;
  if (range && Number.isFinite(range.min) && Number.isFinite(range.max)) {
    scaleMin = Math.min(range.min, range.max);
    scaleMax = Math.max(range.min, range.max);
  }

  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;
  for (const p of ring) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minZ) minZ = p.y;
    if (p.y > maxZ) maxZ = p.y;
  }

  return {
    ring,
    cumulative,
    seed: params.seed >>> 0,
    clustering,
    clusterRadius,
    edgeFalloff,
    scaleMin,
    scaleMax,
    uniformStep: densityUniform > 0 ? 1 / Math.sqrt(densityUniform) : 0,
    clusterStep: densityCluster > 0 ? Math.sqrt(pointsPerCluster / densityCluster) : 0,
    pointsPerCluster,
    bbox: { minX, minZ, maxX, maxZ },
  };
}

/** cell (i,j) → cell 角点（世界对齐网格原点 0） */
function cellOrigin(step: number, i: number, j: number): Vec2 {
  return { x: i * step, y: j * step };
}

/**
 * 采样一个保留点的属性（配比选择/旋转/缩放/变体 seed），从 rng 流按固定顺序消费。
 * 调用时机：该点已通过「多边形包含 + 边缘衰减」筛选。
 */
function sampleInstanceAttributes(ctx: ScatterContext, rng: () => number, position: Vec2): ScatterInstance {
  const pick = rng();
  let assetId = ctx.cumulative[ctx.cumulative.length - 1]!.assetId;
  for (const c of ctx.cumulative) {
    if (pick < c.at) {
      assetId = c.assetId;
      break;
    }
  }
  const rotationY = rng() * Math.PI * 2;
  const scale = ctx.scaleMin + rng() * (ctx.scaleMax - ctx.scaleMin);
  const variantSeed = Math.floor(rng() * 0x8000_0000);
  return { position, rotationY, scale, variantSeed, assetId };
}

/**
 * 点筛选：多边形包含 + 边缘衰减掷骰（衰减淘汰不消费属性流——同输入同路径，确定性保持）。
 */
function keepPoint(ctx: ScatterContext, rng: () => number, p: Vec2): boolean {
  if (!pointInPolygon(p, ctx.ring)) return false;
  if (ctx.edgeFalloff > 0) {
    const keep = edgeKeepProbability(distToPolygonBoundary(p, ctx.ring), ctx.edgeFalloff);
    if (rng() >= keep) return false;
  }
  return true;
}

/** cell 索引范围（半开 [i0,i1)×[j0,j1)）：与 AABB [x0,x1)×[z0,z1) 相交的步长 step 网格 cell */
function cellRangeOverlapping(
  step: number,
  x0: number,
  z0: number,
  x1: number,
  z1: number,
): { i0: number; j0: number; i1: number; j1: number } {
  return {
    i0: Math.floor(x0 / step),
    j0: Math.floor(z0 / step),
    i1: Math.ceil(x1 / step),
    j1: Math.ceil(z1 / step),
  };
}

/**
 * 均匀层发射：遍历范围内每 cell 产一点（cell 角点 + U[0,step)² 抖动，点恒在 cell 内），
 * 过筛选后采样属性。out.push 顺序 = cell 行序（固定 → 确定性）。
 */
function emitUniformLayer(
  ctx: ScatterContext,
  range: { i0: number; j0: number; i1: number; j1: number },
  out: ScatterInstance[],
): void {
  const h = ctx.uniformStep;
  for (let i = range.i0; i < range.i1; i++) {
    for (let j = range.j0; j < range.j1; j++) {
      const rng = mulberry32(hashCell(ctx.seed, i, j));
      const o = cellOrigin(h, i, j);
      const p = { x: o.x + rng() * h, y: o.y + rng() * h };
      if (keepPoint(ctx, rng, p)) out.push(sampleInstanceAttributes(ctx, rng, p));
    }
  }
}

/**
 * 聚簇层发射：簇心 cell 内 U[0,step)² 抖动定位簇心，簇内 k~k0·U[0.6,1.4] 个点在
 * 半径 R 内极坐标均匀撒（r=R·√u 消除极坐标向心密集），逐点过筛选与属性采样。
 * 簇心不要求落在多边形内（只是数学锚点，产出点自会过包含判定）。
 */
function emitClusterLayer(
  ctx: ScatterContext,
  range: { i0: number; j0: number; i1: number; j1: number },
  out: ScatterInstance[],
): void {
  const H = ctx.clusterStep;
  const R = ctx.clusterRadius;
  const meanCount = ctx.pointsPerCluster;
  for (let i = range.i0; i < range.i1; i++) {
    for (let j = range.j0; j < range.j1; j++) {
      const rng = mulberry32(hashCell(ctx.seed ^ CLUSTER_LAYER_SALT, i, j));
      const o = cellOrigin(H, i, j);
      const cx = o.x + rng() * H;
      const cz = o.y + rng() * H;
      const count = Math.max(1, Math.round(meanCount * (0.6 + rng() * 0.8)));
      for (let k = 0; k < count; k++) {
        const r = R * Math.sqrt(rng());
        const theta = rng() * Math.PI * 2;
        const p = { x: cx + r * Math.cos(theta), y: cz + r * Math.sin(theta) };
        if (keepPoint(ctx, rng, p)) out.push(sampleInstanceAttributes(ctx, rng, p));
      }
    }
  }
}

/**
 * 全量撒点：遍历多边形 bbox 覆盖的网格 cell（均匀层）+ bbox 外扩 R 的簇心 cell（聚簇层）。
 * 同输入双跑逐位一致；不接渲染/UI（003.2 分块管线按块调用 scatterChunk）。
 */
export function scatterPolygon(params: ScatterParams): ScatterInstance[] {
  const ctx = prepareContext(params);
  if (!ctx) return [];
  const out: ScatterInstance[] = [];
  if (ctx.uniformStep > 0) {
    const { minX, minZ, maxX, maxZ } = ctx.bbox;
    emitUniformLayer(ctx, cellRangeOverlapping(ctx.uniformStep, minX, minZ, maxX, maxZ), out);
  }
  if (ctx.clusterStep > 0) {
    const R = ctx.clusterRadius;
    const { minX, minZ, maxX, maxZ } = ctx.bbox;
    emitClusterLayer(
      ctx,
      cellRangeOverlapping(ctx.clusterStep, minX - R, minZ - R, maxX + R, maxZ + R),
      out,
    );
  }
  return out;
}

/**
 * 撒点影响半径（米）：多边形 bbox 之外、仍可能改变某块实例内容的最大距离 =
 * edgeFalloff + clusterRadius + clusterStep（聚簇层关闭时簇项不计——簇心步长为 0
 * 即无越界产点源）。消费方（003.2 computeAffectedChunks）据此对 bbox 保守外扩求
 * 受影响块集合：簇心在 bbox 外 R+H 内仍可向多边形内产点（块级撒点需外扩的同一
 * 几何），边界移动会使 falloff 带内 keep 掷骰翻转（改变块内实例的存留）。
 * 纯派生：复用 prepareContext 归一化（默认值/钳制单一真相源，不在消费方重复实现）。
 */
export function scatterInfluenceRadius(params: ScatterParams): number {
  const ctx = prepareContext(params);
  if (!ctx) return 0;
  return ctx.edgeFalloff + (ctx.clusterStep > 0 ? ctx.clusterRadius + ctx.clusterStep : 0);
}

/**
 * 块级撒点：只返回最终位置落在 chunk（半开 [min,max)）内的实例。
 * 与全量的关系（003.2 跨块编辑只重算受影响块的根基）：均匀层点恒在发起 cell 内 →
 * 直接取 chunk∩bbox 覆盖 cell；聚簇层簇内点可越出簇心 cell 达 R → 簇心 cell 范围
 * 外扩 R+H 后再按位置过滤。同参数下「全量按块切分」与「逐块调用」结果逐位一致
 * （单测锁定）；cell 哈希与遍历顺序无关 → 单块重算无需邻居块参与。
 */
export function scatterChunk(params: ScatterParams, chunk: ScatterChunk): ScatterInstance[] {
  const ctx = prepareContext(params);
  if (!ctx) return [];
  const inChunk = (p: Vec2): boolean =>
    p.x >= chunk.minX && p.x < chunk.maxX && p.y >= chunk.minZ && p.y < chunk.maxZ;
  const x0 = Math.max(chunk.minX, ctx.bbox.minX);
  const z0 = Math.max(chunk.minZ, ctx.bbox.minZ);
  const x1 = Math.min(chunk.maxX, ctx.bbox.maxX);
  const z1 = Math.min(chunk.maxZ, ctx.bbox.maxZ);
  if (x0 >= x1 || z0 >= z1) return [];

  const out: ScatterInstance[] = [];
  if (ctx.uniformStep > 0) {
    const all: ScatterInstance[] = [];
    emitUniformLayer(ctx, cellRangeOverlapping(ctx.uniformStep, x0, z0, x1, z1), all);
    for (const inst of all) if (inChunk(inst.position)) out.push(inst);
  }
  if (ctx.clusterStep > 0) {
    const H = ctx.clusterStep;
    const R = ctx.clusterRadius;
    const pad = R + H;
    const all: ScatterInstance[] = [];
    emitClusterLayer(
      ctx,
      cellRangeOverlapping(ctx.clusterStep, x0 - pad, z0 - pad, x1 + pad, z1 + pad),
      all,
    );
    for (const inst of all) if (inChunk(inst.position)) out.push(inst);
  }
  return out;
}
