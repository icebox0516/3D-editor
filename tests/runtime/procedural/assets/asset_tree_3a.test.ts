/**
 * tests/runtime/procedural/assets/asset_tree_3a.test.ts —— 3A 阔叶树资产契约测试（T008.2）。
 *
 * 覆盖（零 mock——真实 THREE 对象；本文件锁定 008.2 冻结的几何数据契约，008.3 违约应被打回）：
 * - meta 契约：id / plant 分类 / shapeFamily size 8 / variants / levels 三档（T009.6）/
 *   triangleCount 声明；
 * - 可复现基准（本任务核心交付语义）：同 morphSeed 两次 build 全属性（position/normal/uv/
 *   aLeafRand/aBend）逐位相等；异 seed 异形态（position 与 aLeafRand 均不同）；
 *   无参 build = slot-0 锚点（morphSeedOf('asset_tree_3a', 0) 逐位一致——008.3 定调基准树）；
 * - 叶卡属性契约：aLeafRand/aBend Float32 itemSize 1；树皮组恒 0；叶组全覆盖值域合法
 *   （aLeafRand ∈ [0,1) / aBend ∈ [0,1)）；叶卡内（6 顶点/卡）aLeafRand 全等、
 *   aBend 根（钉枝顶点）≤ 尖、UV 标准 0–1 四边形域；树顶叶 aBend 均值 > 树底叶（高度权重语义）；
 * - 几何健康：法线无 NaN 有限、包围盒有限、minY ∈ [-0.01, 0.01]（贴地）、顶高与冠幅落
 *   任务书带（7–9m / 5–7.5m）、恰 2 材质组且材质对应（皮 FrontSide / 叶 DoubleSide 占位）；
 * - 预算与声明：皮 1.5–3 万面 / 叶簇卡 6500–9500 张（T009.2 带——卡宽 0.15–0.23 减半到
 *   0.08–0.13 后的增卡补偿覆盖带，slot-0 实际 7167）；triangleCount 实测
 *   一致（T009.1 起叶卡数随冠内通透规则确定、T009.2 起叠加簇级距离抑制：slot-0 声明
 *   实数、同槽恒等、跨槽差异为 8 槽形态向量设计预期）；两次 build 资源新实例（缓存契约）；
 * - 契约第一锁（D19，缓存路径）：同槽两对象 seed → 同 Source 同引用；异槽异 Source；
 *   8 槽健康横扫（法线/minY/带内——008.5 扩槽的前置保障）；
 * - LOD 档位路由（T009.6）：build 透传 params.level——三档 position 数量逐档递减
 *   （几何分档生效）、组序 [皮, 叶] 契约三档不变、材质 customProgramCacheKey 按档
 *   唯一（high 无后缀 / mid / low）、缺省 = 显式 'high' 逐位一致（High 不回归）。
 * - customDepthMaterial 契约通道（T009.5）：build 返回非空深度材质、三档独立实例、
 *   customProgramCacheKey 分档（tree3a:leaf-depth 系）。
 * 边界：测试内 build/load 产物 afterEach 统一 dispose 兜底，不跨测试泄漏 GPU 资源。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { morphSeedOf, shapeSlotOf } from '../../../../src/domain/assets';
import type { ProceduralLevel } from '../../../../src/domain/assets';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';
import { ProceduralSourceCache } from '../../../../src/runtime/procedural/ProceduralSourceCache';
import { build, meta } from '../../../../src/runtime/procedural/assets/asset_tree_3a.asset';

const ATTRS = ['position', 'normal', 'uv', 'aLeafRand', 'aBend'] as const;

const built: InstanceSource[] = [];

function buildTracked(seed?: number): InstanceSource {
  const source = seed === undefined ? build() : build({ seed });
  built.push(source);
  return source;
}

/** 档位路由构建（slot-0 锚点 seed + level——T009.6 路由测试专用） */
function buildLevelTracked(level: ProceduralLevel): InstanceSource {
  const source = build({ seed: morphSeedOf('asset_tree_3a', 0), level });
  built.push(source);
  return source;
}

function materialsOf(source: InstanceSource): THREE.MeshStandardMaterial[] {
  return (Array.isArray(source.material) ? source.material : [source.material]) as THREE.MeshStandardMaterial[];
}

afterEach(() => {
  for (const source of built.splice(0)) {
    source.geometry.dispose();
    for (const material of new Set(materialsOf(source))) material.dispose();
    source.customDepthMaterial?.dispose(); // T009.5：深度材质随产物释放（测试兜底）
  }
});

describe('meta 契约', () => {
  it('id / plant 分类 / shapeFamily size 8（本任务只交付 slot-0，8 槽差异归 008.5）', () => {
    expect(meta.id).toBe('asset_tree_3a');
    expect(meta.category).toBe('plant');
    expect(meta.shapeFamily).toEqual({ size: 8 });
    expect(meta.name).toMatch(/[\u4e00-\u9fff]/);
    expect(meta.tags.length).toBeGreaterThan(0);
  });

  it('variants 参照 asset_oak 量级 / levels 三档 high|mid|low（D27 最小化声明）/ triangleCount 实数声明', () => {
    expect(meta.variants).toEqual({ scaleJitter: 0.16, rotationJitter: 180, hueJitter: 9 });
    expect(meta.levels).toEqual([{ id: 'high' }, { id: 'mid' }, { id: 'low' }]); // T009.6：首版最小化 [{id}]——阈值归 Runtime 常量不进 Profile
    expect(meta.triangleCount).toBe(35058); // T009.2：皮 20724 恒定 + slot-0 叶簇卡 7167×2（簇级剔除 + 通透规则确定值；多档起声明面取 High 细模档）
  });
});

describe('可复现基准（morphSeed 语义）', () => {
  it('同 morphSeed 两次 build：全属性数组逐位全等（rng 消费顺序即契约）', () => {
    const a = buildTracked(12345);
    const b = buildTracked(12345);
    for (const attr of ATTRS) {
      expect(a.geometry.getAttribute(attr).array).toEqual(b.geometry.getAttribute(attr).array);
    }
  }, 30000);

  it('异 morphSeed 异形态：position 与 aLeafRand 均不同', () => {
    const a = buildTracked(1);
    const b = buildTracked(2);
    expect(a.geometry.getAttribute('position').array).not.toEqual(b.geometry.getAttribute('position').array);
    expect(a.geometry.getAttribute('aLeafRand').array).not.toEqual(b.geometry.getAttribute('aLeafRand').array);
  }, 30000);

  it('无参 build = slot-0 锚点：与 build({seed: morphSeedOf(id, 0)}) 逐位一致（008.3 定调基准树）', () => {
    const a = buildTracked(undefined);
    const b = buildTracked(morphSeedOf('asset_tree_3a', 0));
    for (const attr of ATTRS) {
      expect(a.geometry.getAttribute(attr).array).toEqual(b.geometry.getAttribute(attr).array);
    }
  }, 30000);

  it('两次调用资源新实例（geometry / material 均无模块级共享——缓存契约）', () => {
    const a = buildTracked(9);
    const b = buildTracked(9);
    expect(b.geometry).not.toBe(a.geometry);
    for (const material of materialsOf(b)) expect(materialsOf(a).includes(material)).toBe(false);
  }, 30000);
});

describe('叶卡属性契约（冻结：008.3 只消费）', () => {
  it('aLeafRand / aBend 为 Float32 itemSize 1；树皮组恒 0；叶组全覆盖且值域合法', () => {
    const { geometry } = buildTracked(undefined);
    const rand = geometry.getAttribute('aLeafRand');
    const bend = geometry.getAttribute('aBend');
    expect(rand).toBeInstanceOf(THREE.BufferAttribute);
    expect(bend).toBeInstanceOf(THREE.BufferAttribute);
    expect(rand.itemSize).toBe(1);
    expect(bend.itemSize).toBe(1);
    expect(rand.array).toBeInstanceOf(Float32Array);
    expect(bend.array).toBeInstanceOf(Float32Array);

    const [bark, leaf] = geometry.groups;
    expect(bark).toBeDefined();
    expect(leaf).toBeDefined();
    // 聚合扫描（逐顶点 expect 在 10 万顶点量级下拖垮测试——violation 聚合后一次断言）
    let barkNonZero = 0;
    for (let i = bark!.start; i < bark!.start + bark!.count; i++) {
      if (rand.array[i] !== 0 || bend.array[i] !== 0) barkNonZero++;
    }
    expect(barkNonZero, '树皮组 aLeafRand/aBend 应恒 0').toBe(0);
    let leafBad = 0;
    for (let i = leaf!.start; i < leaf!.start + leaf!.count; i++) {
      const r = rand.array[i]!;
      const b = bend.array[i]!;
      if (!(r >= 0 && r < 1 && b >= 0 && b < 1)) leafBad++;
    }
    expect(leafBad, '叶组 aLeafRand/aBend 应 ∈ [0,1)').toBe(0);
  }, 30000);

  it('叶卡（6 顶点/卡，非索引邻接段）：aLeafRand 全等 / aBend 根≤尖 / UV 标准 0–1 四边形', () => {
    const { geometry } = buildTracked(undefined);
    const leaf = geometry.groups[1]!;
    const rand = geometry.getAttribute('aLeafRand');
    const bend = geometry.getAttribute('aBend');
    const uv = geometry.getAttribute('uv');
    const end = leaf.start + leaf.count;
    const bad: string[] = [];
    for (let base = leaf.start; base < end; base += 6) {
      // 同卡 6 顶点 aLeafRand 全等
      for (let k = 1; k < 6; k++) {
        if (rand.array[base + k] !== rand.array[base]) bad.push(`card@${base} rand v${k}!=v0`);
      }
      // 顶点序契约：根 = 0,1,3（钉枝）尖 = 2,4,5——aBend 根→尖非降（rootMax ≤ tipMin）
      const rootMax = Math.max(bend.array[base]!, bend.array[base + 1]!, bend.array[base + 3]!);
      const tipMin = Math.min(bend.array[base + 2]!, bend.array[base + 4]!, bend.array[base + 5]!);
      if (rootMax > tipMin) bad.push(`card@${base} bend root>tip`);
      // UV 域：根边 v=0、尖边 v=1、u ∈ {0,1}（SDF 叶形 alpha 的干净域）
      for (const k of [0, 1, 3]) {
        if (uv.array[(base + k) * 2 + 1] !== 0) bad.push(`card@${base} v${k} v!=0`);
        if (uv.array[(base + k) * 2] !== 0 && uv.array[(base + k) * 2] !== 1) bad.push(`card@${base} v${k} u∉{0,1}`);
      }
      for (const k of [2, 4, 5]) {
        if (uv.array[(base + k) * 2 + 1] !== 1) bad.push(`card@${base} v${k} v!=1`);
        if (uv.array[(base + k) * 2] !== 0 && uv.array[(base + k) * 2] !== 1) bad.push(`card@${base} v${k} u∉{0,1}`);
      }
      if (bad.length > 4) break; // 失败早退（诊断样本足够）
    }
    expect(bad.join('; ')).toBe('');
  }, 30000);

  it('高度权重语义：树顶叶 aBend 均值 > 树底叶（离枝距离 + 冠内高度）', () => {
    const { geometry } = buildTracked(undefined);
    const leaf = geometry.groups[1]!;
    const bend = geometry.getAttribute('aBend');
    const pos = geometry.getAttribute('position');
    const cards: { y: number; bend: number }[] = [];
    const end = leaf.start + leaf.count;
    for (let base = leaf.start; base < end; base += 6) {
      let y = 0;
      let b = 0;
      for (let k = 0; k < 6; k++) {
        y += pos.array[(base + k) * 3 + 1]!;
        b += bend.array[base + k]!;
      }
      cards.push({ y: y / 6, bend: b / 6 });
    }
    cards.sort((a, b) => a.y - b.y);
    const third = Math.floor(cards.length / 3);
    const bottomMean = cards.slice(0, third).reduce((s, c) => s + c.bend, 0) / third;
    const topMean = cards.slice(-third).reduce((s, c) => s + c.bend, 0) / third;
    expect(topMean).toBeGreaterThan(bottomMean);
  }, 30000);
});

describe('几何健康与材质组结构', () => {
  it('法线/位置有限无 NaN；包围盒有限；minY ∈ [-0.01, 0.01]（底部中心贴地）', () => {
    const { geometry } = buildTracked(undefined);
    let nonFinite = 0;
    for (const attr of ['position', 'normal'] as const) {
      const arr = geometry.getAttribute(attr).array;
      for (let i = 0; i < arr.length; i++) if (!Number.isFinite(arr[i])) nonFinite++;
    }
    expect(nonFinite, 'position/normal 应全部有限无 NaN').toBe(0);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    for (const axis of ['x', 'y', 'z'] as const) {
      expect(Number.isFinite(box.min[axis])).toBe(true);
      expect(Number.isFinite(box.max[axis])).toBe(true);
    }
    expect(box.min.y).toBeGreaterThanOrEqual(-0.01);
    expect(box.min.y).toBeLessThanOrEqual(0.01);
  }, 30000);

  it('真实乔木尺度：顶高 7–9m / 冠幅（水平最大延展）5–7.5m', () => {
    const { geometry } = buildTracked(undefined);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    expect(box.max.y).toBeGreaterThanOrEqual(7);
    expect(box.max.y).toBeLessThanOrEqual(9);
    const span = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);
    expect(span).toBeGreaterThanOrEqual(5);
    expect(span).toBeLessThanOrEqual(7.5);
  }, 30000);
  it('恰 2 材质组且材质对应：皮 0（FrontSide 暖褐）/ 叶 1（DoubleSide 叶绿）；基础占位零注入', () => {
    const source = buildTracked(undefined);
    const mats = materialsOf(source);
    const groups = source.geometry.groups;
    expect(groups).toHaveLength(2);
    expect(groups[0]!.materialIndex).toBe(0);
    expect(groups[1]!.materialIndex).toBe(1);
    expect(mats).toHaveLength(2);
    for (const material of mats) {
      expect(material).toBeInstanceOf(THREE.MeshStandardMaterial);
      expect(material.map).toBeNull(); // 零注入占位（配方归 008.3）
      expect(material.metalness).toBe(0);
    }
    expect(mats[0]!.side).toBe(THREE.FrontSide); // 树皮：封闭管面
    expect(mats[1]!.side).toBe(THREE.DoubleSide); // 叶卡：薄面双面可见
    // 组序对应：组 0 顶点数 = 树皮（含主干底盖）；组 1 = 叶卡（6 顶点/卡整除）
    expect(groups[1]!.count % 6).toBe(0);
  }, 30000);
});

describe('预算与声明（T009.2 叶簇带：皮 1.5–3 万面 / 叶簇卡 6500–9500 张——卡尺寸减半后的增卡补偿覆盖带）', () => {
  it('皮/叶面数与叶卡数落预算带；triangleCount 实测一致（±5%）', () => {
    const { geometry } = buildTracked(undefined);
    const barkTris = geometry.groups[0]!.count / 3;
    const leafTris = geometry.groups[1]!.count / 3;
    const leafCards = geometry.groups[1]!.count / 6;
    expect(barkTris).toBeGreaterThanOrEqual(15000);
    expect(barkTris).toBeLessThanOrEqual(30000);
    expect(leafCards).toBeGreaterThanOrEqual(6500);
    expect(leafCards).toBeLessThanOrEqual(9500);
    const total = barkTris + leafTris;
    expect(Math.abs(total - meta.triangleCount!)).toBeLessThanOrEqual(meta.triangleCount! * 0.05);
  }, 30000);
});

describe('LOD 档位路由（T009.6：build 透传 params.level——几何/材质分档，缺省 = High 逐位不变）', () => {
  it('三档几何分档生效：position 数量 high > mid > low；组序 [皮, 叶] 契约三档不变', () => {
    const counts = {} as Record<ProceduralLevel, number>;
    for (const level of ['high', 'mid', 'low'] as ProceduralLevel[]) {
      const { geometry } = buildLevelTracked(level);
      counts[level] = geometry.getAttribute('position').count;
      const groups = geometry.groups;
      expect(groups, `${level} 应恰 2 材质组`).toHaveLength(2);
      expect(groups[0]!.materialIndex).toBe(0); // 皮（mergeGeometries 层序契约）
      expect(groups[1]!.materialIndex).toBe(1); // 叶
      expect(groups[1]!.count % 6, `${level} 叶组应为 6 顶点/卡整除`).toBe(0);
    }
    expect(counts.high!, 'Mid 应比 High 精简').toBeGreaterThan(counts.mid!);
    expect(counts.mid!, 'Low 应比 Mid 精简').toBeGreaterThan(counts.low!);
  }, 30000);

  it('材质档位分档：customProgramCacheKey 皮/叶按档唯一（high 无后缀 / :mid / :low）', () => {
    const cases: [ProceduralLevel, string, string][] = [
      ['high', 'tree3a:bark', 'tree3a:leaf'],
      ['mid', 'tree3a:bark:mid', 'tree3a:leaf:mid'],
      ['low', 'tree3a:bark:low', 'tree3a:leaf:low'],
    ];
    for (const [level, barkKey, leafKey] of cases) {
      const mats = materialsOf(buildLevelTracked(level));
      expect(mats[0]!.customProgramCacheKey(), `${level} 皮 program 键应分档`).toBe(barkKey);
      expect(mats[1]!.customProgramCacheKey(), `${level} 叶 program 键应分档`).toBe(leafKey);
    }
  }, 30000);

  it('缺省 = 显式 high 逐位一致（asset 路径 High 不回归）', () => {
    const a = buildTracked(undefined); // build() 无参
    const b = buildLevelTracked('high'); // build({ seed: slot-0, level: 'high' })
    for (const attr of ATTRS) {
      expect(a.geometry.getAttribute(attr).array).toEqual(b.geometry.getAttribute(attr).array);
    }
    expect(materialsOf(a)[0]!.customProgramCacheKey()).toBe(materialsOf(b)[0]!.customProgramCacheKey());
  }, 30000);

  it('customDepthMaterial 契约通道（T009.5）：三档各返回非空 MeshDepthMaterial 独立实例、customProgramCacheKey 分档（high 无后缀 / mid 与 high 同 SDF 键分档 / low 独立）', () => {
    const levels = ['high', 'mid', 'low'] as ProceduralLevel[];
    const sources = levels.map((level) => buildLevelTracked(level));
    for (const source of sources) {
      expect(source.customDepthMaterial).toBeInstanceOf(THREE.MeshDepthMaterial);
    }
    expect(new Set(sources.map((s) => s.customDepthMaterial)).size).toBe(3); // 每次调用 new（缓存契约）
    const keys = sources.map((s) => s.customDepthMaterial!.customProgramCacheKey());
    expect(keys).toEqual(['tree3a:leaf-depth', 'tree3a:leaf-depth:mid', 'tree3a:leaf-depth:low']);
  }, 30000);
});

describe('契约第一锁（缓存路径，D19）', () => {
  it('同槽两对象 seed → 同 Source 同引用（Geometry/Material 共享，不重复 build）', async () => {
    const cache = new ProceduralSourceCache();
    // 扫描两个路由到同槽的对象 seed（size 8）
    let a = 0;
    let b = -1;
    const slotOfA = shapeSlotOf(a, 8);
    for (let s = 1; s < 200; s++) {
      if (shapeSlotOf(s, 8) === slotOfA) {
        b = s;
        break;
      }
    }
    expect(b).toBeGreaterThanOrEqual(0);
    const s1 = await cache.load('asset_tree_3a', { seed: a });
    const s2 = await cache.load('asset_tree_3a', { seed: b });
    expect(s2.geometry).toBe(s1.geometry); // 同 sourceKey = 一份 Geometry Source
    // 异槽异 Source（不同形态）
    let c = -1;
    for (let s = 1; s < 200; s++) {
      if (shapeSlotOf(s, 8) !== slotOfA) {
        c = s;
        break;
      }
    }
    const s3 = await cache.load('asset_tree_3a', { seed: c });
    expect(s3.geometry).not.toBe(s1.geometry);
    cache.dispose();
  }, 30000);
  it('8 槽健康横扫：法线有限 / minY 贴地 / 顶高在带 / 同槽重复构建面数恒等（009.3 扩槽前置保障）', () => {
    for (let slot = 0; slot < 8; slot++) {
      const seed = morphSeedOf('asset_tree_3a', slot);
      const first = buildTracked(seed);
      let nonFinite = 0;
      const normal = first.geometry.getAttribute('normal');
      for (let i = 0; i < normal.array.length; i++) if (!Number.isFinite(normal.array[i])) nonFinite++;
      expect(nonFinite, `slot${slot} 法线应有限`).toBe(0);
      first.geometry.computeBoundingBox();
      const box = first.geometry.boundingBox!;
      expect(box.min.y).toBeGreaterThanOrEqual(-0.01);
      expect(box.min.y).toBeLessThanOrEqual(0.01);
      expect(box.max.y).toBeGreaterThanOrEqual(6.8); // 全槽放宽下沿（锚点槽另由上一组锁定 7–9）
      expect(box.max.y).toBeLessThanOrEqual(9.2);
      // T009.1：叶卡数随冠内通透规则确定——槽间面数差异为 8 槽形态向量设计预期，
      // 恒等要求收窄为「同槽同 seed 重复构建面数恒等」（D19 确定性延续）
      const second = buildTracked(seed);
      expect(second.geometry.getAttribute('position').count, `slot${slot} 同槽面数应恒等`).toBe(
        first.geometry.getAttribute('position').count,
      );
      if (slot === 0) {
        // slot-0 锚点 = triangleCount 声明实数（结构计数锁）
        expect(first.geometry.getAttribute('position').count / 3).toBe(meta.triangleCount);
      }
    }
  }, 60000);
});
