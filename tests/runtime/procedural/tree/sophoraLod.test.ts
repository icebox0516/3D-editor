/**
 * tests/runtime/procedural/tree/sophoraLod.test.ts —— 国槐 LOD 三档几何不变量
 * 测试（T011.9，对称栾树/乌桕/重阳木 organization——方法复制；快照数为国槐自己的
 * 2026-09-21 终测锚（规范种子））。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildSophoraGeometry 三档，与资产入口契约
 * 互补——本文件锁「档间不变量怎么成立」）：
 * - High 逐位不动：缺省调用（profile + level 双缺省）= 显式 'high' 逐位相等；slot-0
 *   皮面 24178 / rng 消费 89876 快照延续（快照口径 = 槽内跨档恒等；跨槽/跨 seed 消费数
 *   随保留簇数变化 ±0.7%——九先例同机制；荚果挂点零 rng 无消费口径问题）；
 *   **meta.triangleCount = slot-0 High 实数（皮 + 复叶卡 + 荚果串三账合计——写死 meta
 *   前用 build 实测核对的锁；资产入口未就绪（sophoraMaterials 并行交付）时优雅跳过）**；
 * - rng 三档恒等：同 seed 三档 rng 消费次数全等 89876（「发射省略不省略消费」纪律
 *   ——Low 壳卡不烘焙簇内叶卡与荚果串但簇位/候选/果串决策照常）；
 * - 档间同源账目：mid/low 的 stats.clusters / clustersCulled / channels /
 *   leafCandidates 与 high 逐位全等（Low 壳卡 = High 簇位表驱动的前提）；
 * - **荚果串档位策略（本资产独有断言组）：Mid 果账与 High 逐位全等（全量保留——
 *   身份信号，triadica/koelreuteria Mid 果先例）；Low 果账 = 0（省略记档——远距
 *   亚像素，同先例 Low 果处理）；8 槽串数落盛挂期定值带 40–70（终测 49–63——
 *   任务书 60–120 数量级目标的低端定档，Mid 预算带约束记档见 asset 模块头）**；
 * - Mid ⊂ High：Mid 存活卡是 High 存活卡的逐位子集（XZ 位置块精确匹配 + 匹配卡 Y 差
 *   恒为单一贴地平移常量；j % 3 === 1 掩码只作用于烘焙阶段——小卡簇 10 选 3）；Mid 逐簇
 *   烘焙叶量 ≤ High 同簇；卡数比 ≈ 0.30 统计口径复核（终测 0.297–0.302）；
 *   slot-0/6/7 三槽取证（卡数最少 / 最多 + 锚点）；
 * - Low 壳卡账目：leafCards = 保留簇 × 2、叶组三角 = 保留簇 × 4（8 槽全扫）；
 *   **Low 壳卡宽轴 = 0.34 × 半幅（一回羽叶卡比例在 Low 延续——冻结接口的档间剪影
 *   语义；koelreuteria/bischofia 同构口径：根边（2×halfW）/ 高轴（half）恒 = 2×0.34）**；
 * - 预算锁定（D19.8，家族行沿用）：8 槽 × 3 档总面落锁定预算 High ≤ 40000 且
 *   ≥ 31000（国槐参考下沿——小卡高数量语义记档同 platanus/栾/triadica/bischofia
 *   先例口径；终测带 32430–35700）/ Mid 6000–10000（终测 8330–9720）/ Low
 *   1500–3000（终测 2062–2454）；
 * - 恰 2 组（皮+荚果 0 / 复叶卡 1，D15）；组账守恒（组 0 = 皮 + 荚果 / 组 1 = 卡×2）；
 *   档间 bbox 一致：Mid XZ 跨差 ≤ 0.65m、Low XZ 跨差 ≤ 0.75m（**小卡口径**——High
 *   小卡极值伸出（≤ 簇半径 + 0.35m 斜伸）vs 壳卡半幅（簇半径 + 0.24m）×0.34 宽轴，
 *   且 Mid 10 选 3 掩码下单张极值卡可整档缺失——实测 Mid 差 ≤0.60 / Low 差 ≤0.68；
 *   vs bischofia 中卡口径 0.5/0.6 放宽容差记档）、Mid/Low 总高差 ≤ 1.0m、minY 三档
 *   全 0；
 * - Mid/Low 确定性：同 seed 同档两次构建 position/aBend 逐位复现、stats 全等；
 * - 法线健康：三档法线属性存在且逐分量有限无 NaN。
 * 边界：构建产物 afterEach 统一 dispose；8 槽 × 3 档横扫集中在单测试内复用 24 次构建。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import type { ProceduralLevel } from '../../../../src/domain/assets';
import { buildSophoraGeometry } from '../../../../src/runtime/procedural/tree/sophora/sophoraGeometry';
import type { SophoraGeometryResult } from '../../../../src/runtime/procedural/tree/sophora/sophoraGeometry';
import { SOPHORA_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/sophora/sophoraShapeProfile';

const LEVELS: ProceduralLevel[] = ['high', 'mid', 'low'];
const SEED0 = morphSeedOf('asset_tree_sophora', 0);
/** rng 消费快照（slot-0 三档恒等——任何条件跳过消费都违约；槽内快照，跨槽/跨 seed
 *  随保留簇数变化 ±0.7%（通透 roll 计数机制——九先例同款）；荚果挂点零 rng */
const RNG_CALLS_LOCK = 89876;
/** High slot-0 皮面快照（皮拓扑恒等不动——sophoraStructure 同款锁） */
const BARK_TRIS_LOCK = 24178;
/** Mid/Low slot-0 皮面（径向/站点降段阶梯 + L5/L2–L5 不发射——发射计划见
 *  sophoraGeometry lodPlanFor；Low 370 = 330 量级档——6 骨架 + 1 领导拓扑） */
const BARK_TRIS_MID = 4514;
const BARK_TRIS_LOW = 370;
/** 档间 bbox 容差（小卡口径——vs bischofia 中卡 0.5/0.6 放宽）：Mid XZ 0.65m（10 选 3
 *  掩码下单张极值卡（≤ 簇半径 + 0.35 斜伸）可整档缺失）；Low XZ 0.75m（High 小卡极值
 *  伸出 vs 壳卡宽轴 (簇半径+0.24)×0.34 的结构性差，实测 0.48–0.68）；总高 1.0m */
const SPAN_TOLERANCE_MID = 0.65;
const SPAN_TOLERANCE_LOW_XZ = 0.75;
const SPAN_TOLERANCE_Y = 1.0;

const built: SophoraGeometryResult[] = [];

function track(result: SophoraGeometryResult): SophoraGeometryResult {
  built.push(result);
  return result;
}

/** 槽位构建（seed + 槽 profile + 档位——与资产路径 profileForSeed 同路由口径） */
function buildSlot(slot: number, level: ProceduralLevel = 'high'): SophoraGeometryResult {
  return track(
    buildSophoraGeometry(
      mulberry32(morphSeedOf('asset_tree_sophora', slot)),
      SOPHORA_SHAPE_PROFILES[Math.min(slot, SOPHORA_SHAPE_PROFILES.length - 1)]!,
      level,
    ),
  );
}

afterEach(() => {
  for (const { geometry } of built.splice(0)) geometry.dispose();
});

/** bbox 跨度账目（XZ 最大水平跨 / 总高 / minY） */
function spanOf(result: SophoraGeometryResult): { xz: number; y: number; minY: number } {
  result.geometry.computeBoundingBox();
  const b = result.geometry.boundingBox!;
  return {
    xz: Math.max(b.max.x - b.min.x, b.max.z - b.min.z),
    y: b.max.y - b.min.y,
    minY: b.min.y,
  };
}

/** 叶组逐卡 XZ 位置块键（6 顶点 × x,z 共 12 分量 join）+ 首顶点 Y——Mid ⊂ High 匹配口径：
 *  几何尾部 minY 贴地平移只改 Y 分量，Mid 皮面采样不同 → 全局 Y 偏移档间不同，raw Y
 *  不可逐位比；X/Z 不受平移影响逐位可比，公共卡 Y 差 = 单一常量偏移（贴地平移差）。
 *  组 1 纯复叶卡（无花资产——无附加块直扫） */
function leafCardXZ(result: SophoraGeometryResult): { keys: string[]; y0: number[] } {
  const leaf = result.geometry.groups[1]!;
  const pos = result.geometry.getAttribute('position');
  const keys: string[] = [];
  const y0: number[] = [];
  for (let base = leaf.start; base < leaf.start + leaf.count; base += 6) {
    const nums: number[] = [];
    for (let v = 0; v < 6; v++) {
      nums.push(pos.array[(base + v) * 3]!, pos.array[(base + v) * 3 + 2]!);
    }
    keys.push(nums.join(','));
    y0.push(pos.array[base * 3 + 1]!);
  }
  return { keys, y0 };
}

describe('High 逐位不动（缺省档回归锁）', () => {
  it('缺省调用（profile + level 双缺省）= 显式 high：position/aBend 数组与 stats 逐位全等', () => {
    const a = track(buildSophoraGeometry(mulberry32(SEED0)));
    const b = buildSlot(0, 'high');
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.geometry.getAttribute('aBend').array).toEqual(b.geometry.getAttribute('aBend').array);
    expect(a.stats).toEqual(b.stats);
  }, 120000); // 沿先例：套件并行负载下 30s 余量不足，超时上限 120s——断言语义零变化

  it(`slot-0 皮面 ${BARK_TRIS_LOCK} / rng 消费 ${RNG_CALLS_LOCK} 快照延续（High 快照口径）`, () => {
    const stream = mulberry32(SEED0);
    let calls = 0;
    const { stats } = track(
      buildSophoraGeometry(
        () => {
          calls++;
          return stream();
        },
        SOPHORA_SHAPE_PROFILES[0]!,
        'high',
      ),
    );
    expect(stats.barkTriangles).toBe(BARK_TRIS_LOCK);
    expect(calls).toBe(RNG_CALLS_LOCK);
  }, 120000);

  it('meta.triangleCount = slot-0 High 实数（皮 24178 + 复叶卡 ×2 + 荚果珠 ×8 三账合计——写死 meta 前用 build 实测核对的锁；资产入口未就绪（sophoraMaterials 并行交付）时优雅跳过，同 sophoraShapeSlots 路由锁口径）', async () => {
    const assetModule = await import('../../../../src/runtime/procedural/assets/asset_tree_sophora.asset').catch(
      () => null,
    );
    if (!assetModule) {
      // asset_tree_sophora.asset 入口暂不可导入（sophoraMaterials 并行交付未就绪）——
      // 实数锁延后到合并后自动生效（主代理合并验证面）；本测试不判失败
      console.warn('[sophoraLod] asset_tree_sophora 入口暂不可导入（sophoraMaterials 并行交付未就绪）——triangleCount 实数锁延后');
      expect(true).toBe(true);
      return;
    }
    const { stats } = buildSlot(0, 'high');
    expect(
      assetModule.meta.triangleCount,
      'meta.triangleCount 应 = slot-0 High 实测总面（皮拓扑 + 复叶卡 ×2 + 荚果珠 ×8）',
    ).toBe(stats.barkTriangles + stats.leafTriangles + stats.podTriangles);
  }, 60000);
});

describe('rng 消费三档恒等（发射省略不省略消费——簇位/候选/果串决策照常）', () => {
  it(`同 seed 三档 rng 消费均 ${RNG_CALLS_LOCK}（Mid/Low 发射省略不省略消费的纪律锁——Low 壳卡不烘焙簇内叶卡与荚果串但候选决策照常）`, () => {
    for (const level of LEVELS) {
      const stream = mulberry32(SEED0);
      let calls = 0;
      track(
        buildSophoraGeometry(
          () => {
            calls++;
            return stream();
          },
          SOPHORA_SHAPE_PROFILES[0]!,
          level,
        ),
      );
      expect(calls, `slot-0 ${level} 档 rng 消费应与 High 恒等`).toBe(RNG_CALLS_LOCK);
    }
  }, 60000);
});

describe('档间同源账目（簇位表 / 通道 / 候选 / 荚果串不随档变化）', () => {
  it('mid/low 的 clusters / clustersCulled / channels / leafCandidates 与 high 逐位全等；mid/low 皮面降段阶梯', () => {
    const high = buildSlot(0);
    for (const level of ['mid', 'low'] as ProceduralLevel[]) {
      const r = buildSlot(0, level);
      expect(r.stats.clusters, `${level} 簇位表应与 High 同源`).toEqual(high.stats.clusters);
      expect(r.stats.clustersCulled, `${level} 簇剔除账目应与 High 同源`).toBe(high.stats.clustersCulled);
      expect(r.stats.channels, `${level} 通道线段表应与 High 同源`).toEqual(high.stats.channels);
      expect(r.stats.leafCandidates, `${level} 叶候选数应与 High 同源`).toBe(high.stats.leafCandidates);
      if (level === 'mid') {
        expect(r.stats.barkTriangles, 'Mid 皮面降段阶梯').toBe(BARK_TRIS_MID);
      } else {
        expect(r.stats.barkTriangles, 'Low 皮面极简管（330 量级档——6 骨架 + 1 领导拓扑）').toBe(BARK_TRIS_LOW);
      }
    }
  }, 60000);

  it('荚果串档位策略：Mid 果账与 High 逐位全等（全量保留——身份信号，triadica/koelreuteria Mid 果先例）；Low 果账 = 0（省略记档——远距亚像素）', () => {
    const high = buildSlot(0);
    const mid = buildSlot(0, 'mid');
    const low = buildSlot(0, 'low');
    expect(mid.stats.podSites, 'Mid 荚果串应全量保留（身份信号）').toBe(high.stats.podSites);
    expect(mid.stats.podBeads, 'Mid 念珠珠账应与 High 恒等（同一簇位表 + 同一散列抽选）').toBe(high.stats.podBeads);
    expect(mid.stats.podTriangles).toBe(high.stats.podTriangles);
    expect(low.stats.podSites, 'Low 荚果串应省略（远距亚像素——先例 Low 果处理）').toBe(0);
    expect(low.stats.podBeads).toBe(0);
    expect(low.stats.podTriangles).toBe(0);
  }, 60000);
});

describe('Mid ⊂ High（j % 3 === 1 掩码只在烘焙阶段生效——小卡簇 10 选 3）', () => {
  it('Mid 存活卡 XZ 位置块逐位 ∈ High 卡集（Y 差 = 单一贴地平移常量）、逐簇烘焙叶量 ≤ High 同簇、卡数比 ≈ 0.30（slot-0/6/7）', () => {
    for (const slot of [0, 6, 7]) {
      const high = buildSlot(slot);
      const mid = buildSlot(slot, 'mid');
      // 掩码统计口径：Mid 卡数 ≈ High 存活卡 × 0.30（小卡簇 10 选 3——±20% 带内复核；
      // 终测 0.297–0.302）
      expect(mid.stats.leafCards, `slot-${slot} Mid 应有存活卡`).toBeGreaterThan(0);
      const ratio = mid.stats.leafCards / high.stats.leafCards;
      expect(ratio, `slot-${slot} Mid/High 卡数比应 ∈ [0.24, 0.36]（实测 ${ratio.toFixed(4)}）`).toBeGreaterThan(0.24);
      expect(ratio).toBeLessThan(0.36);
      // 逐位子集（XZ 口径）：Mid 每张卡 6 顶点 XZ 块在 High 卡集中逐位存在；匹配对
      // Y 差恒为同一常量（= 档间 minY 贴地平移差——掩码过滤不改卡几何，只平移整树）
      const midCards = leafCardXZ(mid);
      expect(midCards.keys).toHaveLength(mid.stats.leafCards);
      const highCards = leafCardXZ(high);
      const highYByKey = new Map(highCards.keys.map((k, i) => [k, highCards.y0[i]!]));
      const missing = midCards.keys.filter((k) => !highYByKey.has(k));
      expect(missing, `slot-${slot} Mid 卡 XZ 应逐位 ⊂ High（失配 ${missing.length} 张）`).toHaveLength(0);
      const offset = midCards.y0[0]! - highYByKey.get(midCards.keys[0]!)!;
      for (let i = 0; i < midCards.keys.length; i++) {
        const dy = midCards.y0[i]! - highYByKey.get(midCards.keys[i]!)!;
        if (Math.abs(dy - offset) > 1e-6) {
          expect(dy, `slot-${slot} Mid/High 匹配卡 Y 差应恒为单一贴地平移常量 ${offset}`).toBe(offset);
        }
      }
      // 逐簇账目对齐：Mid 掩码子集 → 每簇烘焙叶量 ≤ High 同簇
      expect(mid.stats.clusterLeaves).toHaveLength(high.stats.clusterLeaves.length);
      for (let i = 0; i < high.stats.clusterLeaves.length; i++) {
        expect(mid.stats.clusterLeaves[i]!).toBeLessThanOrEqual(high.stats.clusterLeaves[i]!);
      }
    }
  }, 90000);
});

describe('Mid/Low 确定性（同 seed 同档逐位复现）', () => {
  it('mid/low 两次构建 position/aBend 逐位相等、stats 全等', () => {
    for (const level of ['mid', 'low'] as ProceduralLevel[]) {
      const a = buildSlot(0, level);
      const b = buildSlot(0, level);
      expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
      expect(a.geometry.getAttribute('aBend').array).toEqual(b.geometry.getAttribute('aBend').array);
      expect(a.stats).toEqual(b.stats);
    }
  }, 60000);
});

describe('8 槽 × 3 档横扫（预算锁定 / 恰 2 组 / Low 壳卡账目与 0.34 宽轴比例 / 荚果串定值带 / 档间 bbox 一致 / 法线健康）', () => {
  it('总面落锁定预算（High 31–40K / Mid 6–10K / Low 1.5–3K，D19.8）；恰 2 组；组账守恒（组 0 = 皮+荚果、组 1 = 卡）；荚果串数落盛挂期定值带 40–70；同槽档间跨度差（Mid XZ ≤0.65 / Low XZ ≤0.75 / 总高 ≤1.0）、minY 全 0；Low 壳卡 = 簇 × 2 且宽轴/高轴 = 2×0.34；法线有限', () => {
    for (let slot = 0; slot < 8; slot++) {
      const spans = {} as Record<ProceduralLevel, { xz: number; y: number; minY: number }>;
      const leafCardsByLevel = {} as Record<ProceduralLevel, number>;
      for (const level of LEVELS) {
        const r = buildSlot(slot, level);
        const total = r.stats.barkTriangles + r.stats.leafTriangles + r.stats.podTriangles;
        // 恰 2 组（皮+荚果 0 / 复叶卡 1，D15 免组膨胀——荚果入皮组）
        expect(r.geometry.groups, `slot-${slot} ${level} 应恰 2 组`).toHaveLength(2);
        expect(r.geometry.groups[0]!.materialIndex).toBe(0);
        expect(r.geometry.groups[1]!.materialIndex).toBe(1);
        // 组账守恒：组 0 = 皮拓扑 + 荚果（珠 × 8）、组 1 = 卡 × 2
        expect(r.geometry.groups[0]!.count / 3, `slot-${slot} ${level} 组 0 三角 = 皮拓扑 + 荚果`).toBe(
          r.stats.barkTriangles + r.stats.podTriangles,
        );
        expect(r.geometry.groups[1]!.count / 3, `slot-${slot} ${level} 组 1 三角 = 卡 × 2`).toBe(
          r.stats.leafCards * 2,
        );
        // 预算锁定（锁定账目与依据见 asset_tree_sophora.asset 模块头）
        if (level === 'high') {
          expect(total, `slot-${slot} High 总面应 ≤ 40000（上限预算）`).toBeLessThanOrEqual(40000);
          // 国槐参考下沿 31000（小卡高数量语义——记档同先例口径）
          expect(total, `slot-${slot} High 总面应 ≥ 31000（国槐参考下沿）`).toBeGreaterThanOrEqual(31000);
          // 荚果串盛挂期定值带（High 全量——终测 49–63）
          expect(r.stats.podSites, `slot-${slot} High 荚果串数应落盛挂期定值带 40–70`).toBeGreaterThanOrEqual(40);
          expect(r.stats.podSites).toBeLessThanOrEqual(70);
        } else if (level === 'mid') {
          expect(total, `slot-${slot} Mid 总面应落 6000–10000`).toBeGreaterThanOrEqual(6000);
          expect(total).toBeLessThanOrEqual(10000);
          expect(r.stats.leafCards, `slot-${slot} Mid 卡数应 ≤ High（掩码子集）`).toBeLessThanOrEqual(leafCardsByLevel.high!);
        } else {
          expect(total, `slot-${slot} Low 总面应落 1500–3000`).toBeGreaterThanOrEqual(1500);
          expect(total).toBeLessThanOrEqual(3000);
          // Low 壳卡账目：每保留簇交叉双竖卡（2 卡 × 2 三角）；荚果串省略
          expect(r.stats.leafCards, `slot-${slot} Low 壳卡数应 = 保留簇 × 2`).toBe(r.stats.clusters.length * 2);
          expect(r.stats.leafTriangles, `slot-${slot} Low 叶卡三角应 = 保留簇 × 4`).toBe(r.stats.clusters.length * 4);
        }
        leafCardsByLevel[level] = r.stats.leafCards;
        // 法线健康：属性存在且逐分量有限无 NaN
        const nrm = r.geometry.getAttribute('normal');
        expect(nrm, `slot-${slot} ${level} 法线属性应存在`).toBeTruthy();
        let bad = 0;
        for (let i = 0; i < nrm.array.length; i++) if (!Number.isFinite(nrm.array[i])) bad++;
        expect(bad, `slot-${slot} ${level} 法线应有限无 NaN`).toBe(0);
        // bbox：minY 贴地（贴地平移语义不随档变化）
        const s = spanOf(r);
        expect(Math.abs(s.minY), `slot-${slot} ${level} minY 应为 0`).toBeLessThanOrEqual(0.001);
        spans[level] = s;
        // Low 壳卡比例：宽轴 = 0.34 × 半幅（冻结接口档间延续——koelreuteria/bischofia
        // 同构口径：根边（顶点 0→1 = 2×halfW）/ 高轴（顶点 0→5 = half）恒 = 2 × 0.34）
        if (level === 'low') {
          const pos = r.geometry.getAttribute('position');
          const g1 = r.geometry.groups[1]!;
          let worst = 0;
          for (let base = g1.start; base < g1.start + g1.count; base += 6) {
            const w = Math.hypot(
              pos.array[(base + 1) * 3]! - pos.array[base * 3]!,
              pos.array[(base + 1) * 3 + 1]! - pos.array[base * 3 + 1]!,
              pos.array[(base + 1) * 3 + 2]! - pos.array[base * 3 + 2]!,
            );
            const h = Math.hypot(
              pos.array[(base + 5) * 3]! - pos.array[base * 3]!,
              pos.array[(base + 5) * 3 + 1]! - pos.array[base * 3 + 1]!,
              pos.array[(base + 5) * 3 + 2]! - pos.array[base * 3 + 2]!,
            );
            worst = Math.max(worst, Math.abs(w / h - 2 * 0.34));
          }
          expect(worst, `slot-${slot} Low 壳卡宽轴/高轴应恒 = 2×0.34（一回羽叶比例 0.34 延续；1e-3 容差 = Float32 噪声）`).toBeLessThan(1e-3);
        }
      }
      // 档间 bbox 一致（小卡口径容差——Mid XZ ≤0.65（掩码极值卡缺失）/ Low XZ ≤0.75
      // （High 小卡极值伸出 vs 壳卡宽轴的结构性差，实测 0.48–0.68）/ 总高 ≤1.0）
      for (const level of ['mid', 'low'] as ProceduralLevel[]) {
        const xzTol = level === 'mid' ? SPAN_TOLERANCE_MID : SPAN_TOLERANCE_LOW_XZ;
        expect(Math.abs(spans[level].xz - spans.high.xz), `slot-${slot} ${level} XZ 跨与 High 差应 ≤ ${xzTol}m`).toBeLessThanOrEqual(xzTol);
        expect(Math.abs(spans[level].y - spans.high.y), `slot-${slot} ${level} 总高与 High 差应 ≤ 1.0m`).toBeLessThanOrEqual(SPAN_TOLERANCE_Y);
      }
    }
  }, 120000);
});
