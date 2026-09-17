/**
 * tests/runtime/procedural/assets/plantAssets.test.ts —— 植物资产包 4 种（T003.4）几何与程序化材质阶段测试。
 *
 * 覆盖（table-driven，橡树/松树/灌木/花卉同口径；零 mock——真实 THREE 对象）：
 * - meta 契约：id 前缀 asset_ 且 4 资产互不重复、name 中文、category='plant'（与 GLB
 *   manifest 既有植物分类同栏）、tags 非空、defaultScale/defaultRotation 字段齐、
 *   variants 数值合法且 hueJitter>0（散布/放置的逐实例色相微差走此通路——植物
 *   资产的核心变体声明）、triangleCount 已声明、levels 接口位存在且恒单档 'high'；
 * - build 语义：两次调用无共享（geometry 与 material 均新实例，杜绝模块级共享
 *   对象——缓存会 dispose 所持资源）；
 * - 材质结构：全部 MeshStandardMaterial + plantMaterials 程序化注入（阶段二升级：
 *   自有 onBeforeCompile + plant: 前缀 program 缓存键；注入只做乘法调制、底参零改动
 *   ——零 map 纹理资源、金属度 0、粗糙度 ≥0.8 哑光有机底材）、材质组数与资产头部
 *   分层表一致（乔木 2 组 / 灌木单组非数组 / 花卉 2 组——组数即块×资产的 draw 倍率）；
 *   数组形态时 material 数 === groups 去重 materialIndex 数（层内合并免逐部件组）；
 * - 几何健康：normal 存在、有限无 NaN 且非全零、uv 存在、position 无 NaN、
 *   computeBoundingBox 后 minY≈0（±0.001 贴地语义）且 maxY 落在各资产真实尺度
 *   高度带、水平延展不塌缩（剪影可辨）、三角面数 ≤2000（单株细模面数纪律）且
 *   与 meta.triangleCount 声明一致（实数声明由测试锁定）、花卉另 ≤400
 *   （高密度散布的极便宜档）；
 * - 注册冒烟：getProceduralBuild(id) 存在（routes 启动 import.meta.glob 扫描已注册）
 *   + ProceduralSourceCache 真实 load 成功（完整缓存生命周期不炸）。
 * 边界：测试内 build/load 出的 geometry/material 登记后由 afterEach 统一 dispose
 *      兜底，不跨测试泄漏 GPU 资源；单值 material 形态（灌木）同槽去重后只
 *      dispose 一次。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { ProceduralAssetMeta } from '../../../../src/domain/assets';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';
import type { ProceduralBuild } from '../../../../src/runtime/procedural/types';
import { getProceduralBuild } from '../../../../src/runtime/procedural/routes';
import { ProceduralSourceCache } from '../../../../src/runtime/procedural/ProceduralSourceCache';
import { build as buildOak, meta as oakMeta } from '../../../../src/runtime/procedural/assets/asset_oak.asset';
import { build as buildPine, meta as pineMeta } from '../../../../src/runtime/procedural/assets/asset_pine.asset';
import { build as buildShrub, meta as shrubMeta } from '../../../../src/runtime/procedural/assets/asset_shrub.asset';
import { build as buildFlower, meta as flowerMeta } from '../../../../src/runtime/procedural/assets/asset_flower.asset';

interface PlantCase {
  label: string;
  meta: ProceduralAssetMeta;
  build: ProceduralBuild;
  /** 真实尺度高度带 [min, max]（米）——任务书钦定的体型规格 */
  heightBand: [number, number];
  /** 水平延展下限（米，双向外沿）：剪影不塌缩成棒子 */
  minSpan: number;
  /** 材质组数期望（组数即块×资产的 draw 倍率）；灌木 = 1 且为单值形态 */
  materialGroups: number;
  /** 三角面数上限（单株细模 ≤2000 纪律；花卉远低于） */
  triangleCap: number;
}

const cases: PlantCase[] = [
  { label: '橡树', meta: oakMeta, build: buildOak, heightBand: [5.5, 8], minSpan: 3, materialGroups: 2, triangleCap: 2000 },
  { label: '松树', meta: pineMeta, build: buildPine, heightBand: [6.5, 9.5], minSpan: 2.5, materialGroups: 2, triangleCap: 2000 },
  { label: '灌木', meta: shrubMeta, build: buildShrub, heightBand: [0.7, 1.3], minSpan: 1, materialGroups: 1, triangleCap: 2000 },
  { label: '花卉', meta: flowerMeta, build: buildFlower, heightBand: [0.25, 0.55], minSpan: 0.2, materialGroups: 2, triangleCap: 400 },
];

const built: InstanceSource[] = [];

/** 跟踪式构建：产物登记进 built，afterEach 统一 dispose 兜底 */
function buildTracked(build: ProceduralBuild): InstanceSource {
  const source = build();
  built.push(source);
  return source;
}

/** material 统一为数组形态（灌木单值形态转单元素数组） */
function materialsOf(source: InstanceSource): THREE.MeshStandardMaterial[] {
  return (Array.isArray(source.material) ? source.material : [source.material]) as THREE.MeshStandardMaterial[];
}

/** 三角面数：索引态读 index，非索引态读 position（植物资产层合并产物为非索引态） */
function triangleCountOf(geometry: THREE.BufferGeometry): number {
  const index = geometry.getIndex();
  return (index ? index.count : geometry.getAttribute('position').count) / 3;
}

afterEach(() => {
  for (const source of built.splice(0)) {
    source.geometry.dispose();
    for (const material of new Set(materialsOf(source))) material.dispose(); // 同槽共享实例只释放一次
  }
});

describe('植物资产包（T003.4）：meta 契约', () => {
  it('id 前缀 asset_ 且 4 资产互不重复', () => {
    const ids = cases.map((c) => c.meta.id);
    for (const id of ids) expect(id.startsWith('asset_')).toBe(true);
    expect(new Set(ids).size).toBe(cases.length);
  });

  it.each(cases)('$label：name 中文 / category 植物 / tags 非空 / 默认姿态字段齐', ({ meta }) => {
    expect(/[\u4e00-\u9fff]/.test(meta.name)).toBe(true);
    expect(meta.category).toBe('plant');
    expect(meta.tags.length).toBeGreaterThan(0);
    for (const axis of ['x', 'y', 'z'] as const) {
      expect(Number.isFinite(meta.defaultScale[axis])).toBe(true);
      expect(Number.isFinite(meta.defaultRotation[axis])).toBe(true);
    }
  });

  it.each(cases)('$label：variants 齐备合法（hueJitter>0 走逐实例色相通路）', ({ meta }) => {
    const { variants: v } = meta;
    expect(v).toBeDefined();
    if (v!.scaleJitter !== undefined) {
      expect(v!.scaleJitter).toBeGreaterThanOrEqual(0);
      expect(v!.scaleJitter).toBeLessThan(1);
    }
    if (v!.rotationJitter !== undefined) expect(v!.rotationJitter).toBeGreaterThan(0);
    expect(v!.hueJitter).toBeDefined(); // 植物包核心变体：树冠/花色的逐实例色相微差
    expect(v!.hueJitter!).toBeGreaterThan(0);
    expect(v!.hueJitter!).toBeLessThanOrEqual(30);
  });

  it.each(cases)('$label：triangleCount 已声明、levels 接口位存在且恒单档 high', ({ meta }) => {
    expect(meta.triangleCount).toBeDefined();
    expect(meta.triangleCount!).toBeGreaterThan(0);
    expect(meta.levels).toBeDefined();
    expect(meta.levels!).toHaveLength(1); // T003.4 单档占位；多档 T006/006.1 扩展
    expect(meta.levels![0]!.id).toBe('high');
  });
});

describe('植物资产包（T003.4）：build 语义（无共享）', () => {
  it.each(cases)('$label：两次调用 geometry 与 material 均为新实例（无模块级共享）', ({ build }) => {
    const a = buildTracked(build);
    const b = buildTracked(build);
    expect(b.geometry).not.toBe(a.geometry);
    const matsA = new Set(materialsOf(a));
    for (const material of materialsOf(b)) expect(matsA.has(material)).toBe(false);
  });
});

describe('植物资产包（T003.4）：材质结构（程序化注入底材 / 组数纪律）', () => {
  it.each(cases)('$label：全 MeshStandardMaterial 程序化注入（plant 键）、零 map 纹理、金属度 0、粗糙度 ≥0.8', ({ build }) => {
    for (const material of materialsOf(buildTracked(build))) {
      expect(material).toBeInstanceOf(THREE.MeshStandardMaterial);
      expect(Object.prototype.hasOwnProperty.call(material, 'onBeforeCompile')).toBe(true); // 阶段二：全部槽位挂注入
      expect(material.customProgramCacheKey().startsWith('plant:')).toBe(true); // plant 命名空间 program 键
      expect(material.map).toBeNull(); // 零纹理资源（D13）——纯 GLSL 乘法调制路线
      expect(material.normalMap).toBeNull();
      expect(material.roughnessMap).toBeNull();
      expect(material.metalnessMap).toBeNull();
      expect(material.metalness).toBe(0); // 有机材质全介质电（底参不被注入改动）
      expect(material.roughness).toBeGreaterThanOrEqual(0.8); // 哑光叶面/树皮底材（运行时缎面走 delta 注入）
    }
  });

  it.each(cases)('$label：材质组数 = $materialGroups（组数即块×资产的 draw 倍率）', ({ build, materialGroups }) => {
    const source = buildTracked(build);
    const mats = materialsOf(source);
    expect(mats.length).toBe(materialGroups);
    if (materialGroups === 1) {
      // 单组形态：单值 material + 无 groups（层内 useGroups=false 合并，单 draw）
      expect(Array.isArray(source.material)).toBe(false);
      expect(source.geometry.groups).toHaveLength(0);
    } else {
      // 多组形态：数组 material，组数与去重 materialIndex 数一致（每材质层恰一组）
      const groups = source.geometry.groups;
      expect(groups.length).toBe(materialGroups);
      const uniqueIndices = new Set(groups.map((g) => g.materialIndex));
      expect(uniqueIndices.size).toBe(materialGroups);
      expect(mats.length).toBe(uniqueIndices.size);
    }
  });
});

describe('植物资产包（T003.4）：几何健康（贴地 / 法线 / uv / 面数纪律）', () => {
  it.each(cases)('$label：minY≈0 贴地、maxY 落在高度带、水平延展 ≥$minSpan', ({ build, heightBand, minSpan }) => {
    const { geometry } = buildTracked(build);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    expect(box).not.toBeNull();

    // 原点 = 底面中心：minY ≈ 0（±0.001）且 maxY 落在任务书体型带
    expect(box!.min.y).toBeGreaterThanOrEqual(-0.001);
    expect(box!.min.y).toBeLessThanOrEqual(0.001);
    expect(box!.max.y).toBeGreaterThanOrEqual(heightBand[0]);
    expect(box!.max.y).toBeLessThanOrEqual(heightBand[1]);

    // 水平延展（双向外沿）：剪影不塌缩
    const spanX = box!.max.x - box!.min.x;
    const spanZ = box!.max.z - box!.min.z;
    expect(Math.max(spanX, spanZ)).toBeGreaterThanOrEqual(minSpan);
  });

  it.each(cases)('$label：法线存在有限非全零、uv 存在、position 无 NaN', ({ build }) => {
    const { geometry } = buildTracked(build);

    const normal = geometry.getAttribute('normal');
    expect(normal).toBeTruthy();
    let normalAlive = false;
    for (let i = 0; i < normal.array.length; i++) {
      expect(Number.isNaN(normal.array[i])).toBe(false); // 法线有限性（NaN 法线 = 光照黑斑）
      if (normal.array[i] !== 0) normalAlive = true;
    }
    expect(normalAlive).toBe(true);

    expect(geometry.getAttribute('uv')).toBeTruthy(); // 部件属性集一致性 + shader 升级域守护

    const position = geometry.getAttribute('position');
    for (let i = 0; i < position.array.length; i++) expect(Number.isNaN(position.array[i])).toBe(false);
  });

  it.each(cases)('$label：三角面数 ≤$triangleCap 且与 meta 声明一致', ({ build, meta, triangleCap }) => {
    const tris = triangleCountOf(buildTracked(build).geometry);
    expect(tris).toBeLessThanOrEqual(triangleCap); // 单株细模面数纪律
    expect(tris).toBe(meta.triangleCount); // 声明即实测（改几何必须同步 meta）
  });
});

describe('植物资产包（T003.4）：注册与缓存冒烟', () => {
  it.each(cases)('$label：getProceduralBuild 已注册', ({ meta }) => {
    expect(getProceduralBuild(meta.id)).toBeInstanceOf(Function);
  });

  it.each(cases)('$label：ProceduralSourceCache load 成功（完整缓存生命周期）', async ({ meta }) => {
    const cache = new ProceduralSourceCache();
    const source = await cache.load(meta.id);
    built.push(source); // afterEach 统一 dispose 兜底
    expect(source.geometry.getAttribute('position')).toBeTruthy();
    cache.dispose(); // 缓存统一释放所持资源（afterEach 对已 dispose 资源幂等无害）
  });
});
