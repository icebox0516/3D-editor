/**
 * runtime/lodDistribution —— LOD 分布双口径计数（纯计数模块，node 可测；T006.4，D27.9）。
 *
 * 职责：批次治理归因数据的聚合容器——各调度判定产出（high/mid/low/canopy/culled）双口径
 *      计数：instances（实例数）+ buckets（桶数）。散布链（ScatterChunkManager，自有桶 + 合并桶）
 *      与放置链（InstancedAssetPool，source×level 桶）各自产出只读快照，Renderer 经本计数器
 *      合并为全场景分布（getLodDistribution 出口，供 006.5 验收报表与调试）。
 * 口径记档：
 *  - 实例数按「当前展示表示」归档（entry/lod 的 currentLod/current，未评估回退所在桶档）；
 *    culled 实例计入 culled（含合并桶中被排除渲染的成员实例）；
 *  - 桶数按「提交口径」：会提交渲染的桶计其档位；整桶零提交（全 culled 隐藏 / count=0）
 *    计入 culled——桶数合计 ≈ 实例桶 draw call 上界口径（不含环境/UI）。
 * T021.1 类型迁移（D41）：键联合随 LodSelectionOutcome 演化补 'canopy' 键位（最小机械
 *      处理）——canopy 表示自 T021.6 起才有内容、021.2 前选档不产生 canopy，故本键恒 0
 *      直至接线；计数逻辑与数值口径逐位不变。统计口径升级（transition / target /
 *      shadowCaster 全集，D41 §十三）归后续接线任务。
 * 边界：零 THREE / 零 DOM（纯计数；snapshot 返回冻结拷贝，外部只读）。沿 renderLoopStats
 *      先例：Renderer 会话私有持有，绝不模块级单例（D17）。
 */

import type { LodSelectionOutcome } from '../domain/lod/representation';

/** 各调度判定产出 → 数量的计数表（五键恒全——snapshot 拷贝含零值键，报表消费免防御） */
export type LodCountMap = Record<LodSelectionOutcome, number>;

/** LOD 分布双口径（D27.9：各档实例数 + 各档桶数） */
export interface LodDistribution {
  instances: LodCountMap;
  buckets: LodCountMap;
}

const REPRESENTATIONS: readonly LodSelectionOutcome[] = ['high', 'mid', 'low', 'canopy', 'culled'];

export function emptyLodDistribution(): LodDistribution {
  return {
    instances: { high: 0, mid: 0, low: 0, canopy: 0, culled: 0 },
    buckets: { high: 0, mid: 0, low: 0, canopy: 0, culled: 0 },
  };
}

function frozenCounts(map: LodCountMap): LodCountMap {
  for (const rep of REPRESENTATIONS) {
    if (!Number.isFinite(map[rep])) map[rep] = 0;
  }
  return Object.freeze(map);
}

/** 双口径计数器：各链喂入聚合，snapshot 出全场景只读分布 */
export class LodDistributionCounter {
  private readonly dist = emptyLodDistribution();

  /** 累加一档的实例数与桶数（各自可 0——桶计数与实例计数独立累加） */
  add(rep: LodSelectionOutcome, instances: number, buckets = 0): void {
    this.dist.instances[rep] += instances;
    this.dist.buckets[rep] += buckets;
  }

  /** 并入一条渲染链的分布快照（Renderer 聚合两链用） */
  addDistribution(other: LodDistribution): void {
    for (const rep of REPRESENTATIONS) {
      this.dist.instances[rep] += other.instances[rep] ?? 0;
      this.dist.buckets[rep] += other.buckets[rep] ?? 0;
    }
  }

  /** 只读快照（深冻结拷贝——内部继续累计不受影响） */
  snapshot(): LodDistribution {
    return {
      instances: frozenCounts({ ...this.dist.instances }),
      buckets: frozenCounts({ ...this.dist.buckets }),
    };
  }

  /** 清零（口径重启） */
  reset(): void {
    this.dist.instances = { high: 0, mid: 0, low: 0, canopy: 0, culled: 0 };
    this.dist.buckets = { high: 0, mid: 0, low: 0, canopy: 0, culled: 0 };
  }
}
