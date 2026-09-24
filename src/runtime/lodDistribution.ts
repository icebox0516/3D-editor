/**
 * runtime/lodDistribution —— LOD 分布双口径计数（纯计数模块，node 可测；T006.4，D27.9；
 * T021.3 过渡计数面升级；T021.4 口径升级，D41 §十三）。
 *
 * 职责：批次治理归因数据的聚合容器——各调度判定产出（high/mid/low/canopy/culled）双口径
 *      计数：instances（实例数）+ buckets（桶数），加 T021.3 过渡计数面与 T021.4 升级位
 *      （见下）。散布链（ScatterChunkManager，自有桶 + 合并桶 + 过渡客座桶）与放置链
 *      （InstancedAssetPool，source×level 桶 + 过渡客座桶）各自产出只读快照，
 *      Renderer 经本计数器合并为全场景分布（getLodDistribution 出口，供验收报表与调试）。
 * 口径记档：
 *  - 实例数按「当前展示表示」归档（D27.9 口径；T021.3 起精确到 SelectionState.current
 *    ——排队期按在渲染的旧表示、fade-out 退场期按退场中表示、终态 cull 计 culled；
 *    未评估回退所在桶档）；culled 实例计入 culled（含合并桶中被排除渲染的成员实例）；
 *  - 桶数按「提交口径」：会提交渲染的桶计其档位；整桶零提交（全 culled 隐藏 / count=0）
 *    计入 culled——桶数合计 ≈ 实例桶 draw call 上界口径（不含环境/UI）；
 *  - 过渡计数面（T021.3，D41 §5.2「双表示桶 draw call 增量 ≤ +30」的可观测面——
 *    **只交计数、判定归 021.8**）：
 *      transition.instances = 过渡中实例数（transitionActive 的粒度单元实例合计——
 *          dither 双表示 + fade-out 退场；sourceReady 排队期不计——无第二套渲染）；
 *      transition.buckets = 过渡中桶数（含过渡实例的当档桶 + dither 客座桶）；
 *      transition.dualSubmitBuckets = 双表示并存提交的客座桶数（dither 目标侧桶——
 *          每桶即 +1 draw call 增量的近似口径；fade-out 不增桶不计）；
 *  - T021.4 口径升级（D41 §十三——currentRepresentation / targetRepresentation /
 *    transitioning / culled 全集）：
 *      transitionInstances = 过渡中实例数的顶层命名位（§十三字段名）——**与
 *          transition.instances 同值镜像**（存储单点写于 transition，快照派生只读，
 *          不构成第二套计数）；legacy transition.instances 读写面不变（021.3 断言零回归）；
 *      transitionTargets = targetRepresentation 口径：过渡中粒度单元的实例数按
 *          SelectionState.target 归档（**非过渡单元不计、客座桶不单列**——与
 *          instances / transition 计数面合流不重复计；fade-out 退场的 target 恒 =
 *          current（'culled' 不进 target，D41 §三.1）——退场单元按其当前表示归档，
 *          culled 键恒 0）；
 *      shadowCasterInstances = 阴影投射实例数（提交中且 castShadow 的实例合计）。
 *          **021.5 前现值口径记档**：两链全部建网格点 castShadow 统一 true，故现值 =
 *          提交中实例数；021.5 Shadow Policy 按表示驱动 cast 后由两链喂入改按策略计
 *          （本计数器不感知策略——只聚合调用方判定）。
 * T021.1 类型迁移（D41）：键联合随 LodSelectionOutcome 演化补 'canopy' 键位。
 * 解释口径（T021.2，D41 §4.1）：分布报表与阈值（m 口径，lodPolicy 候选值）对照读数时
 *      统一按 screenFraction = 1/m 折算（资产直径 / 视口高；6/16/60 ↔ 16.7%/6.25%/1.67%）
 *      ——调试与验收解释口径，不作选档输入。
 * 边界：零 THREE / 零 DOM（纯计数；snapshot 返回冻结拷贝，外部只读）。沿 renderLoopStats
 *      先例：Renderer 会话私有持有，绝不模块级单例（D17）。
 */

import type { LodSelectionOutcome, RuntimeRepresentation } from '../domain/lod/representation';

/** 各调度判定产出 → 数量的计数表（五键恒全——snapshot 拷贝含零值键，报表消费免防御） */
export type LodCountMap = Record<LodSelectionOutcome, number>;

/** 过渡计数面（T021.3；口径见模块头注） */
export interface LodTransitionCounts {
  /** 过渡中实例数（transitionActive 粒度单元合计；排队不计） */
  instances: number;
  /** 过渡中桶数（含过渡实例的当档桶 + dither 客座桶） */
  buckets: number;
  /** 双表示并存提交的客座桶数（DC 增量可观测面——判定归 021.8，红线 +30） */
  dualSubmitBuckets: number;
}

/**
 * LOD 分布双口径 + 过渡与升级位（D27.9：各档实例数 + 各档桶数；T021.3：过渡计数面；
 * T021.4：§十三 transitionInstances / transitionTargets / shadowCasterInstances）
 */
export interface LodDistribution {
  /** currentRepresentation 口径：实例数按当前展示表示（含 culled 键） */
  instances: LodCountMap;
  /** 提交口径桶数（整桶零提交计 culled） */
  buckets: LodCountMap;
  /**
   * 过渡中实例数（§十三 transitionInstances 顶层命名位）——transition.instances 的
   * 同值镜像（存储单点：计数器只写 transition.instances，快照派生本字段；两个读面
   * 不构成两套计数）
   */
  transitionInstances: number;
  /**
   * targetRepresentation 口径：过渡中粒度单元的实例数按 SelectionState.target 归档
   * （非过渡单元不计；fade-out target = current；culled 键恒 0）
   */
  transitionTargets: LodCountMap;
  /**
   * 阴影投射实例数（§十三）——021.5 前现值口径：两链 castShadow 统一 true → =
   * 提交中实例数（模块头注记档；021.5 起由两链按 Shadow Policy 喂入）
   */
  shadowCasterInstances: number;
  transition: LodTransitionCounts;
}

const REPRESENTATIONS: readonly LodSelectionOutcome[] = ['high', 'mid', 'low', 'canopy', 'culled'];

function emptyCounts(): LodCountMap {
  return { high: 0, mid: 0, low: 0, canopy: 0, culled: 0 };
}

function emptyTransitionCounts(): LodTransitionCounts {
  return { instances: 0, buckets: 0, dualSubmitBuckets: 0 };
}

export function emptyLodDistribution(): LodDistribution {
  return {
    instances: emptyCounts(),
    buckets: emptyCounts(),
    transitionInstances: 0,
    transitionTargets: emptyCounts(),
    shadowCasterInstances: 0,
    transition: emptyTransitionCounts(),
  };
}

function frozenCounts(map: LodCountMap): LodCountMap {
  for (const rep of REPRESENTATIONS) {
    if (!Number.isFinite(map[rep])) map[rep] = 0;
  }
  return Object.freeze(map);
}

function frozenTransition(counts: LodTransitionCounts): LodTransitionCounts {
  const safe = {
    instances: Number.isFinite(counts.instances) ? counts.instances : 0,
    buckets: Number.isFinite(counts.buckets) ? counts.buckets : 0,
    dualSubmitBuckets: Number.isFinite(counts.dualSubmitBuckets) ? counts.dualSubmitBuckets : 0,
  };
  return Object.freeze(safe);
}

/** 双口径计数器：各链喂入聚合，snapshot 出全场景只读分布 */
export class LodDistributionCounter {
  private readonly dist = emptyLodDistribution();

  /** 累加一档的实例数与桶数（各自可 0——桶计数与实例计数独立累加） */
  add(rep: LodSelectionOutcome, instances: number, buckets = 0): void {
    this.dist.instances[rep] += instances;
    this.dist.buckets[rep] += buckets;
  }

  /**
   * 过渡计数面累加（T021.3）：instances/buckets/dualSubmitBuckets 各自独立累加、
   * 可为 0（当档侧只加桶、客座侧只加 dual 的分工由调用方组织）。
   */
  addTransition(instances = 0, buckets = 0, dualSubmitBuckets = 0): void {
    this.dist.transition.instances += instances;
    this.dist.transition.buckets += buckets;
    this.dist.transition.dualSubmitBuckets += dualSubmitBuckets;
  }

  /**
   * targetRepresentation 口径累加（T021.4 §十三）：过渡中粒度单元的实例数按目标表示
   * 归档。与 instances / transition 计数面合流不重复计——只收调用方已判定
   * transitionActive 的单元（客座桶实例不另计：其目标侧份额由属主单元在此表达）。
   */
  addTransitionTarget(target: RuntimeRepresentation, instances: number): void {
    this.dist.transitionTargets[target] += instances;
  }

  /** 阴影投射实例数累加（T021.4 §十三；现值口径见模块头注——调用方判提交与 cast） */
  addShadowCasters(instances: number): void {
    this.dist.shadowCasterInstances += instances;
  }

  /** 并入一条渲染链的分布快照（Renderer 聚合两链用；T021.4 前旧形字段容缺按 0 并入） */
  addDistribution(other: LodDistribution): void {
    for (const rep of REPRESENTATIONS) {
      this.dist.instances[rep] += other.instances[rep] ?? 0;
      this.dist.buckets[rep] += other.buckets[rep] ?? 0;
      this.dist.transitionTargets[rep] += other.transitionTargets?.[rep] ?? 0;
    }
    const t = other.transition;
    if (t) {
      this.dist.transition.instances += t.instances ?? 0;
      this.dist.transition.buckets += t.buckets ?? 0;
      this.dist.transition.dualSubmitBuckets += t.dualSubmitBuckets ?? 0;
    }
    this.dist.shadowCasterInstances += other.shadowCasterInstances ?? 0;
  }

  /** 只读快照（深冻结拷贝——内部继续累计不受影响；transitionInstances 镜像派生只读） */
  snapshot(): LodDistribution {
    return {
      instances: frozenCounts({ ...this.dist.instances }),
      buckets: frozenCounts({ ...this.dist.buckets }),
      transitionInstances: this.dist.transition.instances,
      transitionTargets: frozenCounts({ ...this.dist.transitionTargets }),
      shadowCasterInstances: this.dist.shadowCasterInstances,
      transition: frozenTransition({ ...this.dist.transition }),
    };
  }

  /** 清零（口径重启） */
  reset(): void {
    this.dist.instances = emptyCounts();
    this.dist.buckets = emptyCounts();
    this.dist.transitionTargets = emptyCounts();
    this.dist.shadowCasterInstances = 0;
    this.dist.transition = emptyTransitionCounts();
  }
}
