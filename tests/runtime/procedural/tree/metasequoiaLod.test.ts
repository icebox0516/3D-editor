/**
 * tests/runtime/procedural/tree/metasequoiaLod.test.ts —— 水杉 LOD 三档几何不变量
 * 测试（T012.2 Step 3a，对称 cedrusLod 组织——方法复制；快照数为水杉自己的
 * 2026-09-29 探针终测锚）。**conifer 预算行已锁**（T012.1，非候选带流程）——本文件
 * 锁实测落带 + 档间不变量。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildMetasequoiaGeometry 三档，与资产入口契约
 * 互补——本文件锁「档间不变量怎么成立」）：
 * - High 逐位不动：缺省调用（profile + level 双缺省）= 显式 'high' 逐位相等；slot-0
 *   皮面 17136 / rng 消费 50463 快照延续（快照口径 = 槽内跨档恒等；Step 4 密度校准
 *   后新锁——簇位 6/4 → 12/8 的 7×5126 簇 rng + 2×4237 通透 roll）；
 * - rng 三档恒等：同 seed 三档 rng 消费次数全等（「发射省略不省略消费」纪律——
 *   **双器官零 rng**（posHash 账目），Low 不发射器官/壳卡不走簇内管线但簇位/候选
 *   决策照常）；
 * - 档间同源账目：mid/low 的 clusters / clustersCulled / channels / needleCandidates /
 *   cone·strobili 候选池与 high 逐位全等（Low 壳卡 = High 簇位表驱动的前提）；mid
 *   双器官账目与 high 全等（身份信号全量保留）；low 双器官清零（省略记档）；
 * - Mid ⊂ High：Mid 存活卡是 High 存活卡的逐位子集（XZ 位置块精确匹配 + 匹配卡 Y 差
 *   恒为单一贴地平移常量；**站点级掩码 siteOrdinal % 3 === 0——整簇保留交叉双卡**
 *   （「交叉双卡 High/Mid 保留」的 Mid 实现；%3 = Step 4 密度校准同步值——簇位 ×2
 *   后原 %2 出 Mid 带上限），存活簇位抽 2/3、每簇双卡俱全）；Mid 卡数比 ≈ 0.36
 *   统计口径复核（实测 0.345–0.388）；slot-0/6/7 三槽取证；
 * - Low 壳卡账目：cards = ⌈保留簇 / 5⌉（隔簇抽取 stride 5——Step 4 密度校准同步值
 *   ：簇位量级升至 5000+ 的预算适配）× 单切向竖卡（「Low 单卡」冻结接口）、叶组
 *   三角 = cards × 2、双器官 0、
 *   aBend 沿用簇位弧长权重（沿枝弧长语义 Low 不失）、壳卡走羽卡帧 v∈[0, 0.99]；
 * - 预算锁定（D19.8，conifer 已锁行）：8 槽 × 3 档总面 High ≤ 40000（Step 4 密度
 *   校准后实测带 27088–35156——slot-6 疏松最低 / slot-7 与 slot-2 密簇最高）/
 *   Mid 6000–10000（实测 7090–9654）/ Low 1500–3000（实测 2076–2838）；
 * - 恰 2 组（皮 0 / 羽卡 1，D15——球果/枯穗卡入皮组）；档间 bbox 一致：Mid XZ 差
 *   ≤ 0.5m / Low XZ 差 ≤ 1.0m（竖向壳卡 + LOW_SHELL_MARGIN 0.20 余量的伸出——
 *   实测 ≤ 0.31）/ 总高差 ≤ 1.0m（实测 ≤ 0.25——壳卡顶簇 +0.20 余量上探）/ minY
 *   三档全 0；
 * - Mid/Low 确定性：同 seed 同档两次构建 position/aBend 逐位复现、stats 全等；
 * - 法线健康：三档法线属性存在且逐分量有限无 NaN（器官卡 flat 法线同样覆盖）。
 * 边界：构建产物 afterEach 统一 dispose；8 槽 × 3 档横扫集中在单测试内复用 24 次构建。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import type { ProceduralLevel } from '../../../../src/domain/assets';
import { buildMetasequoiaGeometry } from '../../../../src/runtime/procedural/tree/metasequoia/metasequoiaGeometry';
import type { MetasequoiaGeometryResult } from '../../../../src/runtime/procedural/tree/metasequoia/metasequoiaGeometry';
import { METASEQUOIA_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/metasequoia/metasequoiaShapeProfile';
import { createGeometryTracker, leafCardXZ, spanOf } from '../../../support/procedural-tree/geometryHarness';

const LEVELS: ProceduralLevel[] = ['high', 'mid', 'low'];
const SEED0 = morphSeedOf('asset_tree_metasequoia', 0);
/** rng 消费快照（slot-0 三档恒等——任何条件跳过消费都违约；双器官账目零 rng；
 *  交叉双卡第二卡零 rng 派生；**Step 4 密度校准后新锁** = 骨架 6107 + 簇位
 *  7×5126（clustersL5/L4 12/8）+ 通透 roll 2×4237） */
const RNG_CALLS_LOCK = 50463;
/** High slot-0 皮面快照（皮拓扑恒等不动——metasequoiaStructure 同款锁） */
const BARK_TRIS_LOCK = 17136;
/** Mid/Low slot-0 皮面（径向/站点降段阶梯 + L4/L5 末级细管不发射——发射计划见
 *  metasequoiaGeometry lodPlanFor） */
const BARK_TRIS_MID = 2874;
const BARK_TRIS_LOW = 786;
/** 档间 bbox 容差：Mid XZ 0.5m（家族口径）；Mid/Low 总高 1.0m（壳卡顶簇 +0.20 余量
 *  上探——实测 ≤ 0.25）；Low XZ 1.0m（竖向壳卡 + LOW_SHELL_MARGIN 的结构性伸出
 *  ——实测 ≤ 0.31） */
const SPAN_TOLERANCE_MID = 0.5;
const SPAN_TOLERANCE_LOW_XZ = 1.0;
const SPAN_TOLERANCE_Y = 1.0;

const { track, disposeAll } = createGeometryTracker<MetasequoiaGeometryResult>();

/** 槽位构建（seed + 槽 profile + 档位——与资产路径 profileForSeed 同路由口径） */
function buildSlot(slot: number, level: ProceduralLevel = 'high'): MetasequoiaGeometryResult {
  return track(
    buildMetasequoiaGeometry(
      mulberry32(morphSeedOf('asset_tree_metasequoia', slot)),
      METASEQUOIA_SHAPE_PROFILES[Math.min(slot, METASEQUOIA_SHAPE_PROFILES.length - 1)]!,
      level,
    ),
  );
}

afterEach(() => {
  disposeAll();
});

describe('High 逐位不动（缺省档回归锁）', () => {
  it('缺省调用（profile + level 双缺省）= 显式 high：position/aBend 数组与 stats 逐位全等', () => {
    const a = track(buildMetasequoiaGeometry(mulberry32(SEED0)));
    const b = buildSlot(0, 'high');
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.geometry.getAttribute('aBend').array).toEqual(b.geometry.getAttribute('aBend').array);
    expect(a.stats).toEqual(b.stats);
  }, 60000);

  it(`slot-0 皮面 ${BARK_TRIS_LOCK} / rng 消费 ${RNG_CALLS_LOCK} 快照延续（High 快照口径）`, () => {
    const stream = mulberry32(SEED0);
    let calls = 0;
    const { stats } = track(
      buildMetasequoiaGeometry(
        () => {
          calls++;
          return stream();
        },
        METASEQUOIA_SHAPE_PROFILES[0]!,
        'high',
      ),
    );
    expect(stats.barkTriangles).toBe(BARK_TRIS_LOCK);
    expect(calls).toBe(RNG_CALLS_LOCK);
  }, 60000);
});

describe('rng 消费三档恒等（发射省略不省略消费——双器官零 rng、簇位/候选决策照常）', () => {
  it(`同 seed 三档 rng 消费均 ${RNG_CALLS_LOCK}（Mid/Low 发射省略不省略消费的纪律锁——Low 器官/壳卡不走簇内管线但簇位/候选决策零 rng 档间同源）`, () => {
    for (const level of LEVELS) {
      const stream = mulberry32(SEED0);
      let calls = 0;
      track(
        buildMetasequoiaGeometry(
          () => {
            calls++;
            return stream();
          },
          METASEQUOIA_SHAPE_PROFILES[0]!,
          level,
        ),
      );
      expect(calls, `slot-0 ${level} 档 rng 消费应与 High 恒等`).toBe(RNG_CALLS_LOCK);
    }
  }, 60000);
});

describe('档间同源账目（簇位表 / 通道 / 候选 / 器官候选池不随档变化）', () => {
  it('mid/low 的 clusters / clustersCulled / channels / needleCandidates / 器官候选池与 high 逐位全等；mid 双器官账目与 high 全等（身份信号全量保留）、low 清零（省略记档）+ 皮面降段阶梯', () => {
    const high = buildSlot(0);
    for (const level of ['mid', 'low'] as ProceduralLevel[]) {
      const r = buildSlot(0, level);
      expect(r.stats.clusters, `${level} 簇位表应与 High 同源`).toEqual(high.stats.clusters);
      expect(r.stats.clustersCulled, `${level} 簇剔除账目应与 High 同源`).toBe(high.stats.clustersCulled);
      expect(r.stats.channels, `${level} 通道线段表应与 High 同源`).toEqual(high.stats.channels);
      expect(r.stats.needleCandidates, `${level} 卡候选数应与 High 同源`).toBe(high.stats.needleCandidates);
      expect(r.stats.coneCandidatePool, `${level} 球果候选池应与 High 同源`).toBe(high.stats.coneCandidatePool);
      expect(r.stats.strobiliCandidatePool, `${level} 枯穗候选池应与 High 同源`).toBe(high.stats.strobiliCandidatePool);
      if (level === 'mid') {
        expect(r.stats.conesBaked, 'Mid 球果应与 High 同源（全量保留）').toBe(high.stats.conesBaked);
        expect(r.stats.coneTriangles).toBe(high.stats.coneTriangles);
        expect(r.stats.strobiliBaked, 'Mid 枯穗应与 High 同源（身份信号）').toBe(high.stats.strobiliBaked);
        expect(r.stats.strobiliTriangles).toBe(high.stats.strobiliTriangles);
        expect(r.stats.barkTriangles, 'Mid 皮面降段阶梯（L4/L5 末级细管不发射）').toBe(BARK_TRIS_MID);
      } else {
        expect(r.stats.conesBaked, 'Low 球果应清零（远距亚像素——省略记档）').toBe(0);
        expect(r.stats.strobiliBaked, 'Low 枯穗应清零（远距亚像素）').toBe(0);
        expect(r.stats.coneTriangles).toBe(0);
        expect(r.stats.strobiliTriangles).toBe(0);
        expect(r.stats.barkTriangles, 'Low 皮面极简管').toBe(BARK_TRIS_LOW);
      }
    }
  }, 60000);
});

describe('Mid ⊂ High（站点级掩码 siteOrdinal % 3 === 0——整簇保留交叉双卡，只在烘焙阶段生效）', () => {
  it('Mid 存活卡 XZ 位置块逐位 ∈ High 卡集（Y 差 = 单一贴地平移常量）、卡数比 ∈ [0.32, 0.41]（实测 0.345–0.388——存活簇位抽 2/3 × 每簇双卡俱全〔%3 掩码〕；slot-0/6/7）', () => {
    for (const slot of [0, 6, 7]) {
      const high = buildSlot(slot);
      const mid = buildSlot(slot, 'mid');
      expect(mid.stats.needleCards, `slot-${slot} Mid 应有存活卡`).toBeGreaterThan(0);
      const ratio = mid.stats.needleCards / high.stats.needleCards;
      expect(ratio, `slot-${slot} Mid/High 卡数比应 ∈ [0.32, 0.41]（实测 ${ratio.toFixed(4)}）`).toBeGreaterThan(0.32);
      expect(ratio).toBeLessThan(0.41);
      // 逐位子集（XZ 口径）：Mid 每张卡 6 顶点 XZ 块在 High 卡集中逐位存在；匹配对
      // Y 差恒为同一常量（= 档间 minY 贴地平移差——掩码过滤不改卡几何，只平移整树；
      // 1e-4 容差 = Float32 在 15–25m 量级的顶点量化噪声，vs 雪松 1e-6——槽树高更高
      // 一档的等精度口径）
      const midCards = leafCardXZ(mid);
      expect(midCards.keys).toHaveLength(mid.stats.needleCards);
      const highCards = leafCardXZ(high);
      const highYByKey = new Map(highCards.keys.map((k, i) => [k, highCards.y0[i]!]));
      const missing = midCards.keys.filter((k) => !highYByKey.has(k));
      expect(missing, `slot-${slot} Mid 卡 XZ 应逐位 ⊂ High（失配 ${missing.length} 张）`).toHaveLength(0);
      const offset = midCards.y0[0]! - highYByKey.get(midCards.keys[0]!)!;
      for (let i = 0; i < midCards.keys.length; i++) {
        const dy = midCards.y0[i]! - highYByKey.get(midCards.keys[i]!)!;
        if (Math.abs(dy - offset) > 1e-4) {
          expect(dy, `slot-${slot} Mid/High 匹配卡 Y 差应恒为单一贴地平移常量 ${offset}`).toBe(offset);
        }
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

describe('8 槽 × 3 档横扫（预算锁定 / 恰 2 组 / Low 壳卡与器官账目 / 档间 bbox 一致 / 法线健康）', () => {
  it('总面落 conifer 已锁预算带（High ≤ 40K——Step 4 校准后实测 27088–35156 / Mid 6–10K——7090–9654 / Low 1.5–3K——2076–2838）；恰 2 组；组账守恒；同槽档间跨度差（Mid XZ ≤0.5 / Low XZ ≤1.0 / 总高 ≤1.0）、minY 全 0；Low 壳卡 = ⌈簇/5⌉ + 羽卡帧 + aBend 沿用；法线有限', () => {
    for (let slot = 0; slot < 8; slot++) {
      const spans = {} as Record<ProceduralLevel, { xz: number; y: number; minY: number }>;
      const leafCardsByLevel = {} as Record<ProceduralLevel, number>;
      for (const level of LEVELS) {
        const r = buildSlot(slot, level);
        const total = r.stats.barkTriangles + r.stats.needleTriangles + r.stats.coneTriangles + r.stats.strobiliTriangles;
        // 恰 2 组（皮 0 / 羽卡 1，D15 免组膨胀——器官卡入皮组）
        expect(r.geometry.groups, `slot-${slot} ${level} 应恰 2 组`).toHaveLength(2);
        expect(r.geometry.groups[0]!.materialIndex).toBe(0);
        expect(r.geometry.groups[1]!.materialIndex).toBe(1);
        // 组账守恒：组 0 = 皮拓扑 + 双器官（器官卡入皮组——材质接口约定）、组 1 = 卡 × 2
        expect(r.geometry.groups[0]!.count / 3, `slot-${slot} ${level} 组 0 三角 = 皮 + 器官`).toBe(
          r.stats.barkTriangles + r.stats.coneTriangles + r.stats.strobiliTriangles,
        );
        expect(r.geometry.groups[1]!.count / 3, `slot-${slot} ${level} 组 1 三角 = 卡 × 2`).toBe(
          r.stats.needleCards * 2,
        );
        // 预算锁定（锁定账目与依据见 asset_tree_metasequoia.asset 模块头）
        if (level === 'high') {
          expect(total, `slot-${slot} High 总面应 ≤ 40000（已锁 conifer 行上限）`).toBeLessThanOrEqual(40000);
          // 探针实测参考带（防省面塌方：实测带 23808–27356 收窄 ±5% 容差）
          expect(total, `slot-${slot} High 总面应 ≥ 26000（实测带下沿 27088 −4%）`).toBeGreaterThanOrEqual(26000);
        } else if (level === 'mid') {
          expect(total, `slot-${slot} Mid 总面应落 6000–10000`).toBeGreaterThanOrEqual(6000);
          expect(total).toBeLessThanOrEqual(10000);
          expect(r.stats.needleCards, `slot-${slot} Mid 卡数应 ≤ High（站点掩码子集）`).toBeLessThanOrEqual(leafCardsByLevel.high!);
        } else {
          expect(total, `slot-${slot} Low 总面应落 1500–3000`).toBeGreaterThanOrEqual(1500);
          expect(total).toBeLessThanOrEqual(3000);
          // Low 壳卡账目：隔簇抽取（stride 3）的单切向竖卡 + 双器官省略
          expect(r.stats.needleCards, `slot-${slot} Low 壳卡数应 = ⌈保留簇/5⌉`).toBe(Math.ceil(r.stats.clusters.length / 5));
          expect(r.stats.needleTriangles, `slot-${slot} Low 叶卡三角应 = 壳卡 × 2`).toBe(r.stats.needleCards * 2);
          expect(r.stats.coneTriangles, `slot-${slot} Low 球果应省略`).toBe(0);
          expect(r.stats.strobiliTriangles, `slot-${slot} Low 枯穗应省略`).toBe(0);
          // 壳卡走羽卡帧 v∈[0, 0.99]（整簇抽象 → 材质 Low 档 8 元素羽 SDF 同帧——
          // 「Low 单卡」冻结接口）+ aBend 沿用（沿枝弧长语义 Low 不失——非恒零）
          const lowUv = r.geometry.getAttribute('uv');
          const lowBend = r.geometry.getAttribute('aBend');
          const lowLeaf = r.geometry.groups[1]!;
          let badFrame = 0;
          let maxBend = 0;
          for (let i = lowLeaf.start; i < lowLeaf.start + lowLeaf.count; i++) {
            const v = lowUv.array[i * 2 + 1]!;
            if (v < 0 || v > 0.99 + 1e-6) badFrame++;
            maxBend = Math.max(maxBend, lowBend.array[i]!);
          }
          expect(badFrame, `slot-${slot} Low 壳卡 v 应 ⊂ [0, 0.99] 羽卡帧`).toBe(0);
          expect(maxBend, `slot-${slot} Low 壳卡 aBend 应非恒零（簇位弧长权重沿用）`).toBeGreaterThan(0.1);
        }
        leafCardsByLevel[level] = r.stats.needleCards;
        // 法线健康：属性存在且逐分量有限无 NaN（含器官卡 flat 法线）
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
      // 档间 bbox 一致（Mid XZ ≤0.5m；Low XZ ≤1.0m〔竖向壳卡 + 0.20 余量的结构性
      // 伸出——实测 ≤0.31〕/ 总高 ≤1.0m〔壳卡顶簇上探——实测 ≤0.25〕）
      for (const level of ['mid', 'low'] as ProceduralLevel[]) {
        const xzTol = level === 'mid' ? SPAN_TOLERANCE_MID : SPAN_TOLERANCE_LOW_XZ;
        expect(Math.abs(spans[level].xz - spans.high.xz), `slot-${slot} ${level} XZ 跨与 High 差应 ≤ ${xzTol}m`).toBeLessThanOrEqual(xzTol);
        expect(Math.abs(spans[level].y - spans.high.y), `slot-${slot} ${level} 总高与 High 差应 ≤ 1.0m`).toBeLessThanOrEqual(SPAN_TOLERANCE_Y);
      }
    }
  }, 120000);
});
