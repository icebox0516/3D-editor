/**
 * tests/runtime/procedural/tree/koelreuteriaLod.test.ts —— 栾树 LOD 三档几何不变量
 * 测试（T011.6，对称悬铃木 platanusLod 组织——方法复制；快照数为栾树自己的 2026-09-21
 * 终测锚（花果挂点确定性零 rng 账目法定稿后的 rng 流））。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildKoelreuteriaGeometry 三档，与资产入口契约
 * 互补——本文件锁「档间不变量怎么成立」）：
 * - High 逐位不动：缺省调用（profile + level 双缺省）= 显式 'high' 逐位相等；slot-0
 *   皮面 20782 / rng 消费 28444 快照延续（快照口径 = 槽内跨档恒等；跨槽/跨 seed 消费数
 *   随保留簇数变化 ±0.2%——六先例同机制）；
 * - rng 三档恒等：同 seed 三档 rng 消费次数全等 28444（「发射省略不省略消费」纪律
 *   ——**花果零 rng**（确定性账目），Low 不发射花穗/灯笼但簇位/候选决策照常）；
 * - 档间同源账目：mid/low 的 stats.clusters / clustersCulled / channels / leafCandidates
 *   与 high 逐位全等（Low 壳卡 = High 簇位表驱动的前提）；mid 的 flowerSites/
 *   flowerCards/fruitSites/fruitBalls 与 high 全等（花果档间同源——身份信号全量
 *   保留）；low 花果账目清零（省略记档）；
 * - Mid ⊂ High：Mid 存活卡是 High 存活卡的逐位子集（XZ 位置块精确匹配 + 匹配卡 Y 差
 *   恒为单一贴地平移常量；j % 3 === 1 掩码只作用于烘焙阶段——疏簇 3 选 1）；Mid 逐簇
 *   烘焙叶量 ≤ High 同簇；卡数比 ≈ 0.33 统计口径复核（探针终测 0.325–0.338）；
 *   slot-0/6/7 三槽取证（卡数最少 / 最多 + 锚点）；
 * - Low 壳卡账目：leafCards = 保留簇 × 2、叶组三角 = 保留簇 × 4（8 槽全扫；花果 0）；
 * - 预算锁定（D19.8，家族行沿用）：8 槽 × 3 档总面落锁定预算 High ≤ 40000 且
 *   ≥ 24000（栾树参考下沿——复叶大卡低数量语义记档同 platanus/银杏先例口径；终测带
 *   24134–24680）/ Mid 6000–10000（终测 6318–6642）/ Low 1500–3000（终测 1534–1686）；
 * - 恰 2 组（皮 0 / 复叶卡 1，D15——花果入皮组）；档间 bbox 一致：Mid 与 High XZ 跨
 *   差 ≤ 0.5m、Low XZ 跨差 ≤ 1.4m（**竖向壳卡对大水平复叶卡的结构性覆盖缺口**——
 *   High 大卡近水平伸出 ≈1.45m vs 壳卡水平半幅 ≈0.55m，实测 0.67–1.26，档间连续
 *   记档 + Low 壳卡语言缺口候选归 011.13 族门复核）、Mid/Low 总高差 ≤ 1.0m（L5 末
 *   梢管 Mid/Low 不发射 + 疏簇 3 选 1 掩码下冠顶极值（单卡长 0.93m）可整档缺失——
 *   Mid slot-3 实测 0.81，复叶大卡口径记档）、minY 三档全 0；
 * - Mid/Low 确定性：同 seed 同档两次构建 position/aBend 逐位复现、stats 全等；
 * - 法线健康：三档法线属性存在且逐分量有限无 NaN（花卡/灯笼 flat 法线同样覆盖）。
 * 边界：构建产物 afterEach 统一 dispose；8 槽 × 3 档横扫集中在单测试内复用 24 次构建。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import type { ProceduralLevel } from '../../../../src/domain/assets';
import { buildKoelreuteriaGeometry } from '../../../../src/runtime/procedural/tree/koelreuteria/koelreuteriaGeometry';
import type { KoelreuteriaGeometryResult } from '../../../../src/runtime/procedural/tree/koelreuteria/koelreuteriaGeometry';
import { KOELREUTERIA_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/koelreuteria/koelreuteriaShapeProfile';

const LEVELS: ProceduralLevel[] = ['high', 'mid', 'low'];
const SEED0 = morphSeedOf('asset_tree_koelreuteria', 0);
/** rng 消费快照（slot-0 三档恒等——任何条件跳过消费都违约；槽内快照，跨槽/跨 seed
 *  随保留簇数变化 ±0.2%（通透 roll 计数机制——六先例同款）；花果挂点零 rng */
const RNG_CALLS_LOCK = 28444;
/** High slot-0 皮面快照（皮拓扑恒等不动——koelreuteriaStructure 同款锁） */
const BARK_TRIS_LOCK = 20782;
/** Mid/Low slot-0 皮面（径向/站点降段阶梯 + L5/L2–L5 不发射——发射计划见
 *  koelreuteriaGeometry lodPlanFor） */
const BARK_TRIS_MID = 3882;
const BARK_TRIS_LOW = 330;
/** 档间 bbox 容差：Mid XZ 0.5m（家族口径）；Mid/Low 总高 1.0m（**复叶大卡口径**——
 *  L5 末梢管 Mid/Low 不发射 + 疏簇 3 选 1 掩码下冠顶极值（L5 管尖/顶簇卡，单卡长
 *  ≤0.93m）可整档缺失，Mid 总高差实测带 0–0.81（slot-3 偏冠顶簇掩码最深）、Low
 *  0.03–0.30）；Low XZ 1.4m（**竖向壳卡对大水平复叶卡的结构性覆盖缺口**——High 大卡
 *  近水平伸出 ≈ 簇半径 + 卡长 ≈1.45m vs 壳卡水平半幅 = (簇半径+0.58)×0.60 ≈0.55m，
 *  实测差 0.67–1.26（slot-3 偏冠强势首枝最深）——档间连续记档 + Low 壳卡语言缺口
 *  候选归 011.13 族门复核（大水平卡 vs 竖向交叉壳卡的家族方法张力） */
const SPAN_TOLERANCE_MID = 0.5;
const SPAN_TOLERANCE_LOW_XZ = 1.4;
const SPAN_TOLERANCE_Y = 1.0;

const built: KoelreuteriaGeometryResult[] = [];

function track(result: KoelreuteriaGeometryResult): KoelreuteriaGeometryResult {
  built.push(result);
  return result;
}

/** 槽位构建（seed + 槽 profile + 档位——与资产路径 profileForSeed 同路由口径） */
function buildSlot(slot: number, level: ProceduralLevel = 'high'): KoelreuteriaGeometryResult {
  return track(
    buildKoelreuteriaGeometry(
      mulberry32(morphSeedOf('asset_tree_koelreuteria', slot)),
      KOELREUTERIA_SHAPE_PROFILES[Math.min(slot, KOELREUTERIA_SHAPE_PROFILES.length - 1)]!,
      level,
    ),
  );
}

afterEach(() => {
  for (const { geometry } of built.splice(0)) geometry.dispose();
});

/** bbox 跨度账目（XZ 最大水平跨 / 总高 / minY） */
function spanOf(result: KoelreuteriaGeometryResult): { xz: number; y: number; minY: number } {
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
 *  组 1 纯复叶卡（花果入皮组）——无附加块直扫 */
function leafCardXZ(result: KoelreuteriaGeometryResult): { keys: string[]; y0: number[] } {
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
    const a = track(buildKoelreuteriaGeometry(mulberry32(SEED0)));
    const b = buildSlot(0, 'high');
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.geometry.getAttribute('aBend').array).toEqual(b.geometry.getAttribute('aBend').array);
    expect(a.stats).toEqual(b.stats);
  }, 120000); // 沿先例：套件并行负载下 30s 余量不足，超时上限 120s——断言语义零变化

  it(`slot-0 皮面 ${BARK_TRIS_LOCK} / rng 消费 ${RNG_CALLS_LOCK} 快照延续（High 快照口径）`, () => {
    const stream = mulberry32(SEED0);
    let calls = 0;
    const { stats } = track(
      buildKoelreuteriaGeometry(
        () => {
          calls++;
          return stream();
        },
        KOELREUTERIA_SHAPE_PROFILES[0]!,
        'high',
      ),
    );
    expect(stats.barkTriangles).toBe(BARK_TRIS_LOCK);
    expect(calls).toBe(RNG_CALLS_LOCK);
  }, 120000);
});

describe('rng 消费三档恒等（发射省略不省略消费——花果零 rng、簇位/候选决策照常）', () => {
  it(`同 seed 三档 rng 消费均 ${RNG_CALLS_LOCK}（Mid/Low 发射省略不省略消费的纪律锁——Low 花穗/灯笼不发射但挂点决策零 rng 档间同源）`, () => {
    for (const level of LEVELS) {
      const stream = mulberry32(SEED0);
      let calls = 0;
      track(
        buildKoelreuteriaGeometry(
          () => {
            calls++;
            return stream();
          },
          KOELREUTERIA_SHAPE_PROFILES[0]!,
          level,
        ),
      );
      expect(calls, `slot-0 ${level} 档 rng 消费应与 High 恒等`).toBe(RNG_CALLS_LOCK);
    }
  }, 60000);
});

describe('档间同源账目（簇位表 / 通道 / 候选 / 花果挂点不随档变化）', () => {
  it('mid/low 的 clusters / clustersCulled / channels / leafCandidates 与 high 逐位全等；mid 花果账目与 high 全等（身份信号全量保留）、low 清零（省略记档）', () => {
    const high = buildSlot(0);
    for (const level of ['mid', 'low'] as ProceduralLevel[]) {
      const r = buildSlot(0, level);
      expect(r.stats.clusters, `${level} 簇位表应与 High 同源`).toEqual(high.stats.clusters);
      expect(r.stats.clustersCulled, `${level} 簇剔除账目应与 High 同源`).toBe(high.stats.clustersCulled);
      expect(r.stats.channels, `${level} 通道线段表应与 High 同源`).toEqual(high.stats.channels);
      expect(r.stats.leafCandidates, `${level} 叶候选数应与 High 同源`).toBe(high.stats.leafCandidates);
      if (level === 'mid') {
        expect(r.stats.flowerSites, 'Mid 花序挂点应与 High 同源（全量保留）').toBe(high.stats.flowerSites);
        expect(r.stats.flowerCards, 'Mid 花卡应与 High 同源（身份信号）').toBe(high.stats.flowerCards);
        expect(r.stats.flowerTriangles).toBe(high.stats.flowerTriangles);
        expect(r.stats.fruitSites, 'Mid 果串挂点应与 High 同源（全量保留）').toBe(high.stats.fruitSites);
        expect(r.stats.fruitBalls, 'Mid 灯笼数应与 High 同源（身份信号）').toBe(high.stats.fruitBalls);
        expect(r.stats.fruitTriangles).toBe(high.stats.fruitTriangles);
        expect(r.stats.barkTriangles, 'Mid 皮面降段阶梯').toBe(BARK_TRIS_MID);
      } else {
        expect(r.stats.flowerSites, 'Low 花序挂点账目应清零（省略记档）').toBe(0);
        expect(r.stats.flowerCards, 'Low 花卡应清零（远距亚像素）').toBe(0);
        expect(r.stats.flowerTriangles).toBe(0);
        expect(r.stats.fruitSites, 'Low 果串挂点账目应清零（省略记档）').toBe(0);
        expect(r.stats.fruitBalls, 'Low 灯笼数应清零（远距亚像素）').toBe(0);
        expect(r.stats.fruitTriangles).toBe(0);
        expect(r.stats.barkTriangles, 'Low 皮面极简管').toBe(BARK_TRIS_LOW);
      }
    }
  }, 60000);
});

describe('Mid ⊂ High（j % 3 === 1 掩码只在烘焙阶段生效——疏簇 3 选 1）', () => {
  it('Mid 存活卡 XZ 位置块逐位 ∈ High 卡集（Y 差 = 单一贴地平移常量）、逐簇烘焙叶量 ≤ High 同簇、卡数比 ≈ 0.33（slot-0/6/7）', () => {
    for (const slot of [0, 6, 7]) {
      const high = buildSlot(slot);
      const mid = buildSlot(slot, 'mid');
      // 掩码统计口径：Mid 卡数 ≈ High 存活卡 × 0.33（疏簇 3 选 1——±20% 带内复核；
      // 终测 0.325–0.338）
      expect(mid.stats.leafCards, `slot-${slot} Mid 应有存活卡`).toBeGreaterThan(0);
      const ratio = mid.stats.leafCards / high.stats.leafCards;
      expect(ratio, `slot-${slot} Mid/High 卡数比应 ∈ [0.28, 0.38]（实测 ${ratio.toFixed(4)}）`).toBeGreaterThan(0.28);
      expect(ratio).toBeLessThan(0.38);
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

describe('8 槽 × 3 档横扫（预算锁定 / 恰 2 组 / Low 壳卡与花果账目 / 档间 bbox 一致 / 法线健康）', () => {
  it('总面落锁定预算（High 24–40K / Mid 6–10K / Low 1.5–3K，D19.8）；恰 2 组；组账守恒（组 0 = 皮+花+果、组 1 = 卡）；同槽档间跨度差（Mid XZ ≤0.5 / Low XZ ≤1.4 / 总高 ≤1.0）、minY 全 0；Low 壳卡 = 簇 × 2；法线有限', () => {
    for (let slot = 0; slot < 8; slot++) {
      const spans = {} as Record<ProceduralLevel, { xz: number; y: number; minY: number }>;
      const leafCardsByLevel = {} as Record<ProceduralLevel, number>;
      for (const level of LEVELS) {
        const r = buildSlot(slot, level);
        const total = r.stats.barkTriangles + r.stats.leafTriangles + r.stats.flowerTriangles + r.stats.fruitTriangles;
        // 恰 2 组（皮 0 / 复叶卡 1，D15 免组膨胀——花果入皮组）
        expect(r.geometry.groups, `slot-${slot} ${level} 应恰 2 组`).toHaveLength(2);
        expect(r.geometry.groups[0]!.materialIndex).toBe(0);
        expect(r.geometry.groups[1]!.materialIndex).toBe(1);
        // 组账守恒：组 0 = 皮拓扑 + 花序 + 果串（花果入皮组——材质接口约定）、组 1 = 卡 × 2
        expect(r.geometry.groups[0]!.count / 3, `slot-${slot} ${level} 组 0 三角 = 皮 + 花序 + 果串`).toBe(
          r.stats.barkTriangles + r.stats.flowerTriangles + r.stats.fruitTriangles,
        );
        expect(r.geometry.groups[1]!.count / 3, `slot-${slot} ${level} 组 1 三角 = 卡 × 2`).toBe(
          r.stats.leafCards * 2,
        );
        // 预算锁定（锁定账目与依据见 asset_tree_koelreuteria.asset 模块头）
        if (level === 'high') {
          expect(total, `slot-${slot} High 总面应 ≤ 40000（上限预算）`).toBeLessThanOrEqual(40000);
          // 栾树参考下沿 24000（复叶大卡低数量语义——记档同 platanus/银杏先例口径）
          expect(total, `slot-${slot} High 总面应 ≥ 24000（栾树参考下沿）`).toBeGreaterThanOrEqual(24000);
        } else if (level === 'mid') {
          expect(total, `slot-${slot} Mid 总面应落 6000–10000`).toBeGreaterThanOrEqual(6000);
          expect(total).toBeLessThanOrEqual(10000);
          expect(r.stats.leafCards, `slot-${slot} Mid 卡数应 ≤ High（掩码子集）`).toBeLessThanOrEqual(leafCardsByLevel.high!);
        } else {
          expect(total, `slot-${slot} Low 总面应落 1500–3000`).toBeGreaterThanOrEqual(1500);
          expect(total).toBeLessThanOrEqual(3000);
          // Low 壳卡账目：每保留簇交叉双竖卡（2 卡 × 2 三角）+ 花果省略
          expect(r.stats.leafCards, `slot-${slot} Low 壳卡数应 = 保留簇 × 2`).toBe(r.stats.clusters.length * 2);
          expect(r.stats.leafTriangles, `slot-${slot} Low 叶卡三角应 = 保留簇 × 4`).toBe(r.stats.clusters.length * 4);
          expect(r.stats.flowerTriangles, `slot-${slot} Low 花序应省略`).toBe(0);
          expect(r.stats.fruitTriangles, `slot-${slot} Low 果串应省略`).toBe(0);
        }
        leafCardsByLevel[level] = r.stats.leafCards;
        // 法线健康：属性存在且逐分量有限无 NaN（含花卡/灯笼 flat 法线）
        const nrm = r.geometry.getAttribute('normal');
        expect(nrm, `slot-${slot} ${level} 法线属性应存在`).toBeTruthy();
        let bad = 0;
        for (let i = 0; i < nrm.array.length; i++) if (!Number.isFinite(nrm.array[i])) bad++;
        expect(bad, `slot-${slot} ${level} 法线应有限无 NaN`).toBe(0);
        // bbox：minY 贴地（贴地平移语义不随档变化）
        const s = spanOf(r);
        expect(Math.abs(s.minY), `slot-${slot} ${level} minY 应为 0`).toBeLessThanOrEqual(0.001);
        spans[level] = s;
      }
      // 档间 bbox 一致（Mid XZ ≤0.5m；Low XZ ≤1.4m（竖向壳卡对大水平复叶卡的结构性
      // 覆盖缺口——实测 0.67–1.26，缺口候选归 011.13）/ 总高 ≤1.0m（L5 管不发射 +
      // 掩码下冠顶极值可整档缺失——单卡长 0.93 上界，Mid slot-3 实测 0.81））
      for (const level of ['mid', 'low'] as ProceduralLevel[]) {
        const xzTol = level === 'mid' ? SPAN_TOLERANCE_MID : SPAN_TOLERANCE_LOW_XZ;
        expect(Math.abs(spans[level].xz - spans.high.xz), `slot-${slot} ${level} XZ 跨与 High 差应 ≤ ${xzTol}m`).toBeLessThanOrEqual(xzTol);
        expect(Math.abs(spans[level].y - spans.high.y), `slot-${slot} ${level} 总高与 High 差应 ≤ 1.0m`).toBeLessThanOrEqual(SPAN_TOLERANCE_Y);
      }
    }
  }, 120000);
});
