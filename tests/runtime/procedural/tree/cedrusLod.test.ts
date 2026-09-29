/**
 * tests/runtime/procedural/tree/cedrusLod.test.ts —— 雪松 LOD 三档几何不变量测试
 * （T012.1 Step 3a，对称 koelreuteriaLod 组织——方法复制；快照数为雪松自己的
 * 2026-09-29 探针终测锚）。
 *
 * 覆盖（零 mock——真实几何生成；直调 buildCedrusGeometry 三档，与资产入口契约互补
 * ——本文件锁「档间不变量怎么成立」）：
 * - High 逐位不动：缺省调用（profile + level 双缺省）= 显式 'high' 逐位相等；slot-0
 *   皮面 28142 / rng 消费 37764 快照延续（Step 4 密度校准 2026-09-29 后值；快照口径 =
 *   槽内跨档恒等；跨槽 35408–38246 ±4%——通透 roll 计数机制，13 阔叶先例同款）；
 * - rng 三档恒等：同 seed 三档 rng 消费次数全等（「发射省略不省略消费」纪律——
 *   **球果零 rng**（posHash 账目），Low 不发射球果/壳卡不走簇内管线但簇位/候选决策
 *   照常）；
 * - 档间同源账目：mid/low 的 clusters / clustersCulled / channels / needleCandidates /
 *   coneCandidatePool 与 high 逐位全等（Low 壳卡 = High 簇位表驱动的前提）；mid 球果
 *   账目与 high 全等（身份信号全量保留）；low 球果清零（省略记档）；
 * - Mid ⊂ High：Mid 存活卡是 High 存活卡的逐位子集（XZ 位置块精确匹配 + 匹配卡 Y 差
 *   恒为单一贴地平移常量；j % 2 === 0 掩码只作用于烘焙阶段——枝端簇优先 + L4 单簇全
 *   保首卡 + 散生减半）；Mid 卡数比 ≈ 0.52 统计口径复核（实测 0.517–0.540）；slot-0/6/7
 *   三槽取证；
 * - Low 壳卡账目：cards = ⌈保留簇 / 3⌉（隔簇抽取 stride 3——Step 4 密度校准：簇位
 *   1120 → 2464 后 stride 2 越 Low 带上沿，卡面 0.30–0.44 半幅 ≈0.3m 覆盖常态间距）、叶组三角 = cards × 2、球果 0；
 * - 预算锁定（D19.8，conifer 候选带探针实测——T012.1 待裁决位 2，回写 §5.2 归主代理）：
 *   8 槽 × 3 档总面 High ≤ 40000 且 ≥ 30000（conifer 实测参考下沿——皮恒 28142 的
 *   面数底；校准后实测带 32224–38382）/ Mid 6000–10000（实测 6288–9396）/ Low
 *   1500–3000（实测 1632–2578）；
 * - 恰 2 组（皮 0 / 针叶卡 1，D15——球果卡入皮组）；档间 bbox 一致：Mid XZ 差 ≤ 0.5m /
 *   Low XZ 差 ≤ 1.0m（竖向壳卡 vs 平摊针卡伸出——实测 ≤ 0.42）/ 总高差 ≤ 1.0m（实测
 *   ≤ 0.26——L4/L5 末梢管 Mid/Low 不发射 + 掩码下冠顶极值可整档缺失）/ minY 三档全 0；
 * - Mid/Low 确定性：同 seed 同档两次构建 position/aBend 逐位复现、stats 全等；
 * - 法线健康：三档法线属性存在且逐分量有限无 NaN（球果卡 flat 法线同样覆盖）。
 * 边界：构建产物 afterEach 统一 dispose；8 槽 × 3 档横扫集中在单测试内复用 24 次构建。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../../src/core/random';
import { morphSeedOf } from '../../../../src/domain/assets';
import type { ProceduralLevel } from '../../../../src/domain/assets';
import { buildCedrusGeometry } from '../../../../src/runtime/procedural/tree/cedrus/cedrusGeometry';
import type { CedrusGeometryResult } from '../../../../src/runtime/procedural/tree/cedrus/cedrusGeometry';
import { CEDRUS_SHAPE_PROFILES } from '../../../../src/runtime/procedural/tree/cedrus/cedrusShapeProfile';
import { createGeometryTracker, leafCardXZ, spanOf } from '../../../support/procedural-tree/geometryHarness';

const LEVELS: ProceduralLevel[] = ['high', 'mid', 'low'];
const SEED0 = morphSeedOf('asset_tree_cedrus', 0);
/** rng 消费快照（slot-0 三档恒等——任何条件跳过消费都违约；球果账目零 rng；莲座簇
 *  第二卡零 rng 派生——Step 4 密度校准 2026-09-29 后值） */
const RNG_CALLS_LOCK = 37764;
/** High slot-0 皮面快照（皮拓扑恒等不动——cedrusStructure 同款锁） */
const BARK_TRIS_LOCK = 28142;
/** Mid/Low slot-0 皮面（径向/站点降段阶梯 + L4/L5 末级细管不发射——发射计划见
 *  cedrusGeometry lodPlanFor） */
const BARK_TRIS_MID = 3950;
const BARK_TRIS_LOW = 1030;
/** 档间 bbox 容差：Mid XZ 0.5m（家族口径）；Mid/Low 总高 1.0m（L4/L5 末梢管 Mid/Low
 *  不发射 + 掩码下冠顶极值可整档缺失——实测 ≤ 0.26）；Low XZ 1.0m（竖向壳卡对平摊
 *  针卡的结构性覆盖差——实测 ≤ 0.42） */
const SPAN_TOLERANCE_MID = 0.5;
const SPAN_TOLERANCE_LOW_XZ = 1.0;
const SPAN_TOLERANCE_Y = 1.0;

const { track, disposeAll } = createGeometryTracker<CedrusGeometryResult>();

/** 槽位构建（seed + 槽 profile + 档位——与资产路径 profileForSeed 同路由口径） */
function buildSlot(slot: number, level: ProceduralLevel = 'high'): CedrusGeometryResult {
  return track(
    buildCedrusGeometry(
      mulberry32(morphSeedOf('asset_tree_cedrus', slot)),
      CEDRUS_SHAPE_PROFILES[Math.min(slot, CEDRUS_SHAPE_PROFILES.length - 1)]!,
      level,
    ),
  );
}

afterEach(() => {
  disposeAll();
});

describe('High 逐位不动（缺省档回归锁）', () => {
  it('缺省调用（profile + level 双缺省）= 显式 high：position/aBend 数组与 stats 逐位全等', () => {
    const a = track(buildCedrusGeometry(mulberry32(SEED0)));
    const b = buildSlot(0, 'high');
    expect(a.geometry.getAttribute('position').array).toEqual(b.geometry.getAttribute('position').array);
    expect(a.geometry.getAttribute('aBend').array).toEqual(b.geometry.getAttribute('aBend').array);
    expect(a.stats).toEqual(b.stats);
  }, 60000);

  it(`slot-0 皮面 ${BARK_TRIS_LOCK} / rng 消费 ${RNG_CALLS_LOCK} 快照延续（High 快照口径）`, () => {
    const stream = mulberry32(SEED0);
    let calls = 0;
    const { stats } = track(
      buildCedrusGeometry(
        () => {
          calls++;
          return stream();
        },
        CEDRUS_SHAPE_PROFILES[0]!,
        'high',
      ),
    );
    expect(stats.barkTriangles).toBe(BARK_TRIS_LOCK);
    expect(calls).toBe(RNG_CALLS_LOCK);
  }, 60000);
});

describe('rng 消费三档恒等（发射省略不省略消费——球果零 rng、簇位/候选决策照常）', () => {
  it(`同 seed 三档 rng 消费均 ${RNG_CALLS_LOCK}（Mid/Low 发射省略不省略消费的纪律锁——Low 球果/壳卡不走簇内管线但簇位/候选决策零 rng 档间同源）`, () => {
    for (const level of LEVELS) {
      const stream = mulberry32(SEED0);
      let calls = 0;
      track(
        buildCedrusGeometry(
          () => {
            calls++;
            return stream();
          },
          CEDRUS_SHAPE_PROFILES[0]!,
          level,
        ),
      );
      expect(calls, `slot-0 ${level} 档 rng 消费应与 High 恒等`).toBe(RNG_CALLS_LOCK);
    }
  }, 60000);
});

describe('档间同源账目（簇位表 / 通道 / 候选 / 球果候选池不随档变化）', () => {
  it('mid/low 的 clusters / clustersCulled / channels / needleCandidates / coneCandidatePool 与 high 逐位全等；mid 球果账目与 high 全等（身份信号全量保留）、low 清零（省略记档）+ 皮面降段阶梯', () => {
    const high = buildSlot(0);
    for (const level of ['mid', 'low'] as ProceduralLevel[]) {
      const r = buildSlot(0, level);
      expect(r.stats.clusters, `${level} 簇位表应与 High 同源`).toEqual(high.stats.clusters);
      expect(r.stats.clustersCulled, `${level} 簇剔除账目应与 High 同源`).toBe(high.stats.clustersCulled);
      expect(r.stats.channels, `${level} 通道线段表应与 High 同源`).toEqual(high.stats.channels);
      expect(r.stats.needleCandidates, `${level} 卡候选数应与 High 同源`).toBe(high.stats.needleCandidates);
      expect(r.stats.coneCandidatePool, `${level} 球果候选池应与 High 同源`).toBe(high.stats.coneCandidatePool);
      if (level === 'mid') {
        expect(r.stats.conesMature, 'Mid 将熟果应与 High 同源（全量保留）').toBe(high.stats.conesMature);
        expect(r.stats.conesYoung, 'Mid 幼果应与 High 同源（身份信号）').toBe(high.stats.conesYoung);
        expect(r.stats.conesAxis).toBe(high.stats.conesAxis);
        expect(r.stats.coneTriangles).toBe(high.stats.coneTriangles);
        expect(r.stats.barkTriangles, 'Mid 皮面降段阶梯（L4/L5 末级细管不发射）').toBe(BARK_TRIS_MID);
      } else {
        expect(r.stats.conesMature, 'Low 球果应清零（远距亚像素——省略记档）').toBe(0);
        expect(r.stats.conesYoung).toBe(0);
        expect(r.stats.conesAxis).toBe(0);
        expect(r.stats.coneTriangles).toBe(0);
        expect(r.stats.barkTriangles, 'Low 皮面极简管').toBe(BARK_TRIS_LOW);
      }
    }
  }, 60000);
});

describe('Mid ⊂ High（j % 2 === 0 掩码只在烘焙阶段生效——枝端簇优先 + L4 全保 + 散生 3 保 2）', () => {
  it('Mid 存活卡 XZ 位置块逐位 ∈ High 卡集（Y 差 = 单一贴地平移常量）、卡数比 ∈ [0.50, 0.56]（实测 0.517–0.540——掩码每簇保首卡 + 散生减半；slot-0/6/7）', () => {
    for (const slot of [0, 6, 7]) {
      const high = buildSlot(slot);
      const mid = buildSlot(slot, 'mid');
      expect(mid.stats.needleCards, `slot-${slot} Mid 应有存活卡`).toBeGreaterThan(0);
      const ratio = mid.stats.needleCards / high.stats.needleCards;
      expect(ratio, `slot-${slot} Mid/High 卡数比应 ∈ [0.50, 0.56]（实测 ${ratio.toFixed(4)}）`).toBeGreaterThan(0.5);
      expect(ratio).toBeLessThan(0.56);
      // 逐位子集（XZ 口径）：Mid 每张卡 6 顶点 XZ 块在 High 卡集中逐位存在；匹配对
      // Y 差恒为同一常量（= 档间 minY 贴地平移差——掩码过滤不改卡几何，只平移整树）
      const midCards = leafCardXZ(mid);
      expect(midCards.keys).toHaveLength(mid.stats.needleCards);
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

describe('8 槽 × 3 档横扫（预算锁定 / 恰 2 组 / Low 壳卡与球果账目 / 档间 bbox 一致 / 法线健康）', () => {
  it('总面落 conifer 预算带（High 30–40K / Mid 6–10K / Low 1.5–3K，D19.8——候选带探针实测锁定）；恰 2 组；组账守恒；同槽档间跨度差（Mid XZ ≤0.5 / Low XZ ≤1.0 / 总高 ≤1.0）、minY 全 0；Low 壳卡 = ⌈簇/2⌉；法线有限', () => {
    for (let slot = 0; slot < 8; slot++) {
      const spans = {} as Record<ProceduralLevel, { xz: number; y: number; minY: number }>;
      const leafCardsByLevel = {} as Record<ProceduralLevel, number>;
      for (const level of LEVELS) {
        const r = buildSlot(slot, level);
        const total = r.stats.barkTriangles + r.stats.needleTriangles + r.stats.coneTriangles;
        // 恰 2 组（皮 0 / 针叶卡 1，D15 免组膨胀——球果卡入皮组）
        expect(r.geometry.groups, `slot-${slot} ${level} 应恰 2 组`).toHaveLength(2);
        expect(r.geometry.groups[0]!.materialIndex).toBe(0);
        expect(r.geometry.groups[1]!.materialIndex).toBe(1);
        // 组账守恒：组 0 = 皮拓扑 + 球果（球果入皮组——材质接口约定）、组 1 = 卡 × 2
        expect(r.geometry.groups[0]!.count / 3, `slot-${slot} ${level} 组 0 三角 = 皮 + 球果`).toBe(
          r.stats.barkTriangles + r.stats.coneTriangles,
        );
        expect(r.geometry.groups[1]!.count / 3, `slot-${slot} ${level} 组 1 三角 = 卡 × 2`).toBe(
          r.stats.needleCards * 2,
        );
        // 预算锁定（锁定账目与依据见 asset_tree_cedrus.asset 模块头）
        if (level === 'high') {
          expect(total, `slot-${slot} High 总面应 ≤ 40000（候选带上限）`).toBeLessThanOrEqual(40000);
          // conifer 实测参考下沿（皮恒 28142 的面数底——防省面塌方，koelreuteria 参考下沿同口径）
          expect(total, `slot-${slot} High 总面应 ≥ 30000（conifer 参考下沿——校准后实测带 32224–38382）`).toBeGreaterThanOrEqual(30000);
        } else if (level === 'mid') {
          expect(total, `slot-${slot} Mid 总面应落 6000–10000`).toBeGreaterThanOrEqual(6000);
          expect(total).toBeLessThanOrEqual(10000);
          expect(r.stats.needleCards, `slot-${slot} Mid 卡数应 ≤ High（掩码子集）`).toBeLessThanOrEqual(leafCardsByLevel.high!);
        } else {
          expect(total, `slot-${slot} Low 总面应落 1500–3000`).toBeGreaterThanOrEqual(1500);
          expect(total).toBeLessThanOrEqual(3000);
          // Low 壳卡账目：隔簇抽取（stride 3——Step 4 校准）的单切向竖卡 + 球果省略
          expect(r.stats.needleCards, `slot-${slot} Low 壳卡数应 = ⌈保留簇/3⌉`).toBe(Math.ceil(r.stats.clusters.length / 3));
          expect(r.stats.needleTriangles, `slot-${slot} Low 叶卡三角应 = 壳卡 × 2`).toBe(r.stats.needleCards * 2);
          expect(r.stats.coneTriangles, `slot-${slot} Low 球果应省略`).toBe(0);
          // 壳卡走莲座帧 v∈[2,3]（卡内帧闭区间——顶端点 v=3.0 合法；整簇抽象 → 材质
          // Low 8 针「近似星点」中心放射 SDF——双帧 uv 契约合并阶段对齐，壳卡帧自查记档）
          const lowUv = r.geometry.getAttribute('uv');
          const lowLeaf = r.geometry.groups[1]!;
          let badFrame = 0;
          for (let i = lowLeaf.start; i < lowLeaf.start + lowLeaf.count; i++) {
            const v = lowUv.array[i * 2 + 1]!;
            if (v < 2 || v > 3) badFrame++;
          }
          expect(badFrame, `slot-${slot} Low 壳卡 v 应 ⊂ [2,3] 莲座帧`).toBe(0);
        }
        leafCardsByLevel[level] = r.stats.needleCards;
        // 法线健康：属性存在且逐分量有限无 NaN（含球果卡 flat 法线）
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
      // 档间 bbox 一致（Mid XZ ≤0.5m；Low XZ ≤1.0m〔竖向壳卡对平摊针卡的结构性覆盖差
      // ——实测 ≤0.42〕/ 总高 ≤1.0m〔L4/L5 管不发射 + 掩码下冠顶极值可整档缺失——实测 ≤0.26〕）
      for (const level of ['mid', 'low'] as ProceduralLevel[]) {
        const xzTol = level === 'mid' ? SPAN_TOLERANCE_MID : SPAN_TOLERANCE_LOW_XZ;
        expect(Math.abs(spans[level].xz - spans.high.xz), `slot-${slot} ${level} XZ 跨与 High 差应 ≤ ${xzTol}m`).toBeLessThanOrEqual(xzTol);
        expect(Math.abs(spans[level].y - spans.high.y), `slot-${slot} ${level} 总高与 High 差应 ≤ 1.0m`).toBeLessThanOrEqual(SPAN_TOLERANCE_Y);
      }
    }
  }, 120000);
});
