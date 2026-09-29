/**
 * tests/runtime/procedural/assets/facilityAssets.test.ts —— 设施资产包（T002.4 五件 + T025.1 批 A 六件 + T025.2 批 B 四件）几何与底材阶段测试。
 *
 * 覆盖（table-driven，路灯/公园长椅/垃圾桶/消防栓/标识牌 + 批 A 交通静态六件 + 批 B 休憩四件同口径；零 mock——真实 THREE 对象）：
 * - meta 契约：id 前缀 asset_ 且 15 资产互不重复、name 中文、category='facility'、tags 非空、
 *   defaultScale/defaultRotation 字段齐、variants 若声明则数值合法（scaleJitter∈[0,1)、
 *   rotationJitter>0、hueJitter∈[0,30]）；
 * - build 语义：两次调用无共享（geometry 与 material 均新实例，杜绝模块级共享对象——
 *   缓存会 dispose 所持资源）、material 形态与 groups 对齐（多材质数组 = 分组逐一对齐；
 *   单值形态 = 无分组——seedstack 先例 / T025.1 人行护栏段单配方散布主力件合批省分组）、
 * - 几何健康：normal 属性存在且非全零、uv 属性存在（merge 兼容 + 程序化纹理域守护）、
 *   position 无 NaN、computeBoundingBox 后 minY≈0（±0.001 贴地语义）且 maxY>0、
 *   索引三角面数 ≤ 3000（10 万实例设计的面数纪律）；
 * - 注册冒烟：getProceduralBuild(id) 存在（routes 启动 import.meta.glob 扫描已注册）。
 * 边界：测试内 build 出的 geometry/material 登记后由 afterEach 统一 dispose 兜底，
 *      不跨测试泄漏 GPU 资源；同槽共享材质实例 Set 去重后只 dispose 一次。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { ProceduralAssetMeta } from '../../../../src/domain/assets';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';
import type { ProceduralBuild } from '../../../../src/runtime/procedural/types';
import { getProceduralBuild } from '../../../../src/runtime/procedural/routes';
import { build as buildStreetlamp, meta as streetlampMeta } from '../../../../src/runtime/procedural/assets/streetlamp.asset';
import { build as buildParkbench, meta as parkbenchMeta } from '../../../../src/runtime/procedural/assets/parkbench.asset';
import { build as buildTrashbin, meta as trashbinMeta } from '../../../../src/runtime/procedural/assets/trashbin.asset';
import { build as buildHydrant, meta as hydrantMeta } from '../../../../src/runtime/procedural/assets/hydrant.asset';
import { build as buildSignpost, meta as signpostMeta } from '../../../../src/runtime/procedural/assets/signpost.asset';
import { build as buildBollard, meta as bollardMeta } from '../../../../src/runtime/procedural/assets/asset_bollard.asset';
import { build as buildPedestrianBarrier, meta as pedestrianBarrierMeta } from '../../../../src/runtime/procedural/assets/asset_pedestrian_barrier.asset';
import { build as buildRoadBarrier, meta as roadBarrierMeta } from '../../../../src/runtime/procedural/assets/asset_road_barrier.asset';
import { build as buildWheelstop, meta as wheelstopMeta } from '../../../../src/runtime/procedural/assets/asset_wheelstop.asset';
import { build as buildTrafficcone, meta as trafficconeMeta } from '../../../../src/runtime/procedural/assets/asset_trafficcone.asset';
import { build as buildSpeedbump, meta as speedbumpMeta } from '../../../../src/runtime/procedural/assets/asset_speedbump.asset';
import { build as buildPlanter, meta as planterMeta } from '../../../../src/runtime/procedural/assets/asset_planter.asset';
import { build as buildLeisureTable, meta as leisureTableMeta } from '../../../../src/runtime/procedural/assets/asset_leisure_table.asset';
import { build as buildParasol, meta as parasolMeta } from '../../../../src/runtime/procedural/assets/asset_parasol.asset';
import { build as buildBikeRack, meta as bikeRackMeta } from '../../../../src/runtime/procedural/assets/asset_bike_rack.asset';

interface FacilityCase {
  label: string;
  meta: ProceduralAssetMeta;
  build: ProceduralBuild;
}

const cases: FacilityCase[] = [
  { label: '路灯', meta: streetlampMeta, build: buildStreetlamp },
  { label: '公园长椅', meta: parkbenchMeta, build: buildParkbench },
  { label: '垃圾桶', meta: trashbinMeta, build: buildTrashbin },
  { label: '消防栓', meta: hydrantMeta, build: buildHydrant },
  { label: '标识牌', meta: signpostMeta, build: buildSignpost },
  { label: '防撞柱', meta: bollardMeta, build: buildBollard },
  { label: '人行护栏段', meta: pedestrianBarrierMeta, build: buildPedestrianBarrier },
  { label: '道路隔离栏', meta: roadBarrierMeta, build: buildRoadBarrier },
  { label: '停车挡车器', meta: wheelstopMeta, build: buildWheelstop },
  { label: '交通锥', meta: trafficconeMeta, build: buildTrafficcone },
  { label: '减速带', meta: speedbumpMeta, build: buildSpeedbump },
  { label: '花箱', meta: planterMeta, build: buildPlanter },
  { label: '休闲桌', meta: leisureTableMeta, build: buildLeisureTable },
  { label: '遮阳伞', meta: parasolMeta, build: buildParasol },
  { label: '自行车架', meta: bikeRackMeta, build: buildBikeRack },
];

const built: InstanceSource[] = [];

/** 跟踪式构建：产物登记进 built，afterEach 统一 dispose 兜底 */
function buildTracked(build: ProceduralBuild): InstanceSource {
  const source = build();
  built.push(source);
  return source;
}

/** material 统一为数组形态 */
function materialsOf(source: InstanceSource): THREE.Material[] {
  return Array.isArray(source.material) ? source.material : [source.material];
}

afterEach(() => {
  for (const source of built.splice(0)) {
    source.geometry.dispose();
    for (const material of new Set(materialsOf(source))) material.dispose(); // 同槽共享实例只释放一次
  }
});

describe('设施资产包（T002.4）：meta 契约', () => {
  it('id 前缀 asset_ 且 15 资产互不重复', () => {
    const ids = cases.map((c) => c.meta.id);
    for (const id of ids) expect(id.startsWith('asset_')).toBe(true);
    expect(new Set(ids).size).toBe(cases.length);
  });

  it.each(cases)('$label：name 中文 / category 设施 / tags 非空 / 默认姿态字段齐', ({ meta }) => {
    expect(/[\u4e00-\u9fff]/.test(meta.name)).toBe(true);
    expect(meta.category).toBe('facility');
    expect(meta.tags.length).toBeGreaterThan(0);
    for (const axis of ['x', 'y', 'z'] as const) {
      expect(Number.isFinite(meta.defaultScale[axis])).toBe(true);
      expect(Number.isFinite(meta.defaultRotation[axis])).toBe(true);
    }
  });

  it.each(cases)('$label：variants 若声明则数值合法（jitter 值域守护）', ({ meta }) => {
    const { variants: v } = meta;
    if (!v) return;
    if (v.scaleJitter !== undefined) {
      expect(v.scaleJitter).toBeGreaterThanOrEqual(0);
      expect(v.scaleJitter).toBeLessThan(1);
    }
    if (v.rotationJitter !== undefined) expect(v.rotationJitter).toBeGreaterThan(0);
    if (v.hueJitter !== undefined) {
      expect(v.hueJitter).toBeGreaterThanOrEqual(0);
      expect(v.hueJitter).toBeLessThanOrEqual(30);
    }
  });

  it.each(cases)('$label：presets 声明必须伴随 shapeFamily（seed/preset 参数化构建路径闸门）', ({ meta }) => {
    if (!meta.presets?.length) return;
    // T025.1 视觉验收发现的接线缺口：resolvePoolKey / ProceduralSourceCache 均以
    // shapeFamily 为 seed/preset 声明面——无此声明 → 池键无卡段（同桶）+ build 无参
    // 收不到 params.preset，色卡静默失效（交通锥黄卡首例）。设施域通用不变量锁防复发。
    expect(meta.shapeFamily).toBeDefined();
  });
});

describe('设施资产包（T002.4）：build 语义（无共享 / 分层对齐）', () => {
  it.each(cases)('$label：两次调用 geometry 与 material 均为新实例（无模块级共享）', ({ build }) => {
    const a = buildTracked(build);
    const b = buildTracked(build);
    expect(b.geometry).not.toBe(a.geometry);
    const matsA = new Set(materialsOf(a));
    for (const material of materialsOf(b)) expect(matsA.has(material)).toBe(false);
  });

  it.each(cases)('$label：material 形态与 groups 对齐（数组=分组逐一对齐；单值=无分组）', ({ build }) => {
    const source = buildTracked(build);
    const groups = source.geometry.groups;
    if (Array.isArray(source.material)) {
      expect(groups.length).toBeGreaterThan(0);
      const uniqueIndices = new Set(groups.map((g) => g.materialIndex));
      expect(materialsOf(source).length).toBe(uniqueIndices.size);
    } else {
      // 单值材质形态（seedstack 先例；T025.1 人行护栏段——单配方散布主力件合批省分组开销）
      expect(groups.length).toBe(0);
      expect(source.material).toBeTruthy();
    }
  });
});

describe('设施资产包（T002.4）：几何健康（贴地 / 法线 / uv / 面数）', () => {
  it.each(cases)('$label：minY≈0 贴地、maxY>0、法线非全零、uv 存在、position 无 NaN、面数 ≤3000', ({ build }) => {
    const { geometry } = buildTracked(build);

    // 原点 = 底面中心：boundingBox minY ≈ 0（±0.001）且 maxY > 0
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    expect(box).not.toBeNull();
    expect(box!.min.y).toBeGreaterThanOrEqual(-0.001);
    expect(box!.min.y).toBeLessThanOrEqual(0.001);
    expect(box!.max.y).toBeGreaterThan(0);

    // normal 存在且非全零（merge 后光照可用性）
    const normal = geometry.getAttribute('normal');
    expect(normal).toBeTruthy();
    let normalAlive = false;
    for (let i = 0; i < normal.array.length; i++) {
      if (normal.array[i] !== 0) {
        normalAlive = true;
        break;
      }
    }
    expect(normalAlive).toBe(true);

    // uv 存在（部件属性集一致性守护 + 阶段二程序化纹理映射域）
    expect(geometry.getAttribute('uv')).toBeTruthy();

    // position 无 NaN
    const position = geometry.getAttribute('position');
    let hasNaN = false;
    for (let i = 0; i < position.array.length; i++) {
      if (Number.isNaN(position.array[i])) {
        hasNaN = true;
        break;
      }
    }
    expect(hasNaN).toBe(false);

    // 索引三角面数 ≤ 3000（10 万实例面数纪律）
    const index = geometry.getIndex();
    expect(index).not.toBeNull();
    expect(index!.count / 3).toBeLessThanOrEqual(3000);
  });
});

describe('设施资产包（T002.4）：注册冒烟（import.meta.glob 启动扫描）', () => {
  it.each(cases)('$label：getProceduralBuild 已注册', ({ meta }) => {
    expect(getProceduralBuild(meta.id)).toBeInstanceOf(Function);
  });
});
