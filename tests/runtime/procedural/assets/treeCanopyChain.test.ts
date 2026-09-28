/**
 * tests/runtime/procedural/assets/treeCanopyChain.test.ts —— 13 乔木 canopy 能力声明
 * 与全链选档测试（T021.7 接线，D41 §三.2/§四）。
 *
 * 覆盖（零 mock——真实 13 树种 meta + domain 纯函数选档）：
 * - 声明面：13 乔木 representations = ['high','mid','canopy']（链形 High → Mid →
 *   Canopy → Culled）且 levels 三档保持 [high,mid,low]（构建面零触碰回归锁）；
 *   声明集与 BroadleafCanopyProxy 工厂接入表逐 id 一致（声明 ⊆ 工厂可产——canopy
 *   请求永不落防御路径）；
 * - 零变化锁：设施资产（hydrant/parkbench/trashbin/signpost）无 representations
 *   声明；seedstack（shapeFamily + 单档 levels）与 streetlamp（['high','low']）
 *   声明零变化（T022 删 v1 四低模植物后不再参与本锁）；
 * - 全链选档（it.each 13 树种，链 = effectiveRepresentationChain(真实声明)）：
 *   m ≤ highToMid → high / (highToMid, midToCanopy] → mid / (midToCanopy,
 *   canopyToCulled] → canopy（**canopy 可达——021.7 起预期行为变化**）/ 越过
 *   canopyToCulled → culled；升档迟滞：current=canopy 带内保持、越 (1−band) 线回 mid；
 *   降档立即（mid → canopy 过名义线即切）；
 * - 退场分型：canopy → culled = fade-out（aFadeOut 退场带）、mid → canopy = dither
 *   （双表示共存）——021.3 分型表在新声明链上的组合锁。
 * 边界：只读 meta 纯数据与 domain 纯函数，零 THREE 实例化（check:layers 语义）；
 *      阈值以 LOD_THRESHOLDS 常量相对构造（±ε），021.8 重锁时随常量走。
 */
import { describe, expect, it } from 'vitest';
import type { Vec3 } from '../../../../src/core/types';
import { effectiveRepresentationChain } from '../../../../src/domain/lod/representation';
import type { RuntimeRepresentation } from '../../../../src/domain/lod/representation';
import { evaluateLodRepresentation } from '../../../../src/domain/lod/lodEvaluation';
import { transitionKindOf } from '../../../../src/domain/lod/transition';
import { LOD_THRESHOLDS } from '../../../../src/domain/lod/lodPolicy';
import { BROADLEAF_CANOPY_ASSET_IDS } from '../../../../src/runtime/procedural/tree/broadleafCanopyProxy';

import { meta as tree3a } from '../../../../src/runtime/procedural/assets/asset_tree_3a.asset';
import { meta as celtis } from '../../../../src/runtime/procedural/assets/asset_tree_celtis.asset';
import { meta as camphor } from '../../../../src/runtime/procedural/assets/asset_tree_camphor.asset';
import { meta as zelkova } from '../../../../src/runtime/procedural/assets/asset_tree_zelkova.asset';
import { meta as ginkgo } from '../../../../src/runtime/procedural/assets/asset_tree_ginkgo.asset';
import { meta as platanus } from '../../../../src/runtime/procedural/assets/asset_tree_platanus.asset';
import { meta as koelreuteria } from '../../../../src/runtime/procedural/assets/asset_tree_koelreuteria.asset';
import { meta as triadica } from '../../../../src/runtime/procedural/assets/asset_tree_triadica.asset';
import { meta as bischofia } from '../../../../src/runtime/procedural/assets/asset_tree_bischofia.asset';
import { meta as sophora } from '../../../../src/runtime/procedural/assets/asset_tree_sophora.asset';
import { meta as fraxinus } from '../../../../src/runtime/procedural/assets/asset_tree_fraxinus.asset';
import { meta as ligustrum } from '../../../../src/runtime/procedural/assets/asset_tree_ligustrum.asset';
import { meta as salix } from '../../../../src/runtime/procedural/assets/asset_tree_salix.asset';
import { meta as seedstack } from '../../../../src/runtime/procedural/assets/asset_seedstack.asset';
import { meta as streetlamp } from '../../../../src/runtime/procedural/assets/streetlamp.asset';
import { meta as hydrant } from '../../../../src/runtime/procedural/assets/hydrant.asset';
import { meta as parkbench } from '../../../../src/runtime/procedural/assets/parkbench.asset';
import { meta as trashbin } from '../../../../src/runtime/procedural/assets/trashbin.asset';
import { meta as signpost } from '../../../../src/runtime/procedural/assets/signpost.asset';

const T = LOD_THRESHOLDS;
const ORIGIN: Vec3 = { x: 0, y: 0, z: 0 };

/** 13 乔木 meta（顺序 = canopy 工厂接入表 CANOPY_SPECIES 声明序，与 BROADLEAF_CANOPY_ASSET_IDS 对照断言） */
const TREES = [tree3a, camphor, celtis, zelkova, ginkgo, bischofia, fraxinus, koelreuteria, ligustrum, platanus, salix, sophora, triadica];

/** 正交视图：配 orthoHeight 使 r=1 时 m 恰为给定制 */
function orthoAtM(m: number) {
  return { kind: 'orthographic', orthoHeight: 2 * m } as const;
}

/** 主评估器薄封装（r = radius × scale = 1；current = 迟滞参考，缺省名义档起步） */
function select(
  m: number,
  chain: readonly RuntimeRepresentation[],
  current?: 'canopy' | 'mid',
) {
  return evaluateLodRepresentation({
    view: orthoAtM(m),
    subject: { point: ORIGIN, radius: 1, scale: 1 },
    representations: chain,
    ...(current !== undefined ? { current } : {}),
  });
}

describe('13 乔木 canopy 能力声明（T021.7）', () => {
  it('声明面：13 乔木 representations = ["high","mid","canopy"] 且 levels 三档保持 [high,mid,low]（构建面零触碰）——声明集与 canopy 工厂接入表逐 id 一致', () => {
    expect(TREES).toHaveLength(13);
    expect(TREES.map((meta) => meta.id)).toEqual(BROADLEAF_CANOPY_ASSET_IDS); // 声明 ⊆ 工厂可产
    for (const meta of TREES) {
      expect(meta.representations, `${meta.id} canopy 链声明`).toEqual(['high', 'mid', 'canopy']);
      expect(meta.levels?.map((l) => l.id), `${meta.id} 构建档位保持三档`).toEqual(['high', 'mid', 'low']);
      expect(meta.shapeFamily?.size, `${meta.id} 形态族 8 槽`).toBe(8);
    }
  });

  it('零变化锁：设施资产无 representations 声明；seedstack / streetlamp 声明零变化', () => {
    for (const meta of [hydrant, parkbench, trashbin, signpost]) {
      expect(meta.representations, `${meta.id} 无表示声明（恒单档 / levels 语义不变）`).toBeUndefined();
    }
    expect(seedstack.representations).toBeUndefined(); // shapeFamily + 单档 levels——键走 family 分支不变
    expect(seedstack.levels?.map((l) => l.id)).toEqual(['high']);
    expect(streetlamp.representations).toEqual(['high', 'low']); // 021.1 收编声明原样
    expect(streetlamp.levels?.map((l) => l.id)).toEqual(['high', 'low']);
  });
});

describe('13 树种全链选档（真实声明链——021.7 起 canopy 可达的预期行为变化锁）', () => {
  it.each(TREES.map((meta) => ({ id: meta.id })))(
    '$id：m ≤ highToMid high / 至 midToCanopy mid / 至 canopyToCulled canopy / 越线 culled + 升档迟滞 + 退场分型',
    ({ id }) => {
      const meta = TREES.find((m) => m.id === id)!;
      const chain = effectiveRepresentationChain({
        representations: meta.representations,
        levels: meta.levels?.map((l) => l.id),
      });
      expect(chain).toEqual(['high', 'mid', 'canopy']);
      // 名义区间（边界含下侧：m ≤ 边界归较近档）
      expect(select(T.highToMid * 0.99, chain)).toBe('high');
      expect(select(T.highToMid * 1.01, chain)).toBe('mid');
      expect(select(T.midToCanopy, chain)).toBe('mid'); // m = 16 归 mid
      expect(select(T.midToCanopy * 1.001, chain)).toBe('canopy'); // mid→canopy@16：过名义线即切（降档立即）
      expect(select(T.canopyToCulled, chain)).toBe('canopy'); // m = 60 归 canopy
      expect(select(T.canopyToCulled * 1.001, chain)).toBe('culled'); // canopy→culled@60：超远退场
      // 升档迟滞（current = canopy，回程）：带内保持、越过 (1 − band) 线才回 mid
      const bandLine = T.midToCanopy * (1 - T.hysteresisBand);
      expect(select(T.midToCanopy * 0.99, chain, 'canopy')).toBe('canopy'); // 名义线内带外保持
      expect(select(bandLine * 1.01, chain, 'canopy')).toBe('canopy'); // 迟滞带内保持（无震荡）
      expect(select(bandLine * 0.99, chain, 'canopy')).toBe('mid'); // 越迟滞线升档
      // 退场分型（021.3 分型表在新声明链上的组合锁）
      expect(transitionKindOf('mid', 'canopy')).toBe('dither'); // 双表示共存（dither 交叉）
      expect(transitionKindOf('canopy', 'culled')).toBe('fade-out'); // aFadeOut 退场带（超远 culled 走 fade）
    },
  );
});
