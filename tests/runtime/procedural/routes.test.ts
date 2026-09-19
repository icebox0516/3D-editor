/**
 * tests/runtime/procedural/routes.test.ts —— 程序化资产构建路由测试（T002.1，先测后码）。
 *
 * 覆盖：
 * - import.meta.glob 扫描冒烟资产（asset_trashbin）建立 assetId → build 路由；
 * - meta 收割字段值断言（bootstrap 灌 AssetRegistry 的数据源）；
 * - 模块处理规则：meta 与 build 缺一即跳过（与 styles 轨的差异点——无灰显占位）、
 *   重复 id 首个生效、非法输入不抛错；
 * - 注入 seam：registerProceduralRoute / unregisterProceduralRoute / 重复抛错（不依赖文件系统）。
 * 边界：路由只存构建函数与 meta 纯数据，永不进入 registries 层（check:layers 守门）。
 * 隔离：模块级收割清单无法逐条移除——临时 id 一律 test. 前缀 + afterEach 注销路由，
 *      收割清单只做包含 / 相对长度断言（与 styles/routes 测试同手法）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { ProceduralAssetMeta } from '../../../src/domain/assets';
import {
  collectProceduralAssetMetas,
  getProceduralBuild,
  hasProceduralRoute,
  registerProceduralModule,
  registerProceduralRoute,
  unregisterProceduralRoute,
} from '../../../src/runtime/procedural/routes';
import type { ProceduralBuild } from '../../../src/runtime/procedural/types';
import type { InstanceSource } from '../../../src/runtime/instancing/InstancedAssetPool';

const tempIds: string[] = [];

afterEach(() => {
  for (const id of tempIds.splice(0)) unregisterProceduralRoute(id);
});

function tempBuild(): ProceduralBuild {
  return () => ({ geometry: new THREE.BoxGeometry(), material: new THREE.MeshStandardMaterial() });
}

function tempMeta(id: string): ProceduralAssetMeta {
  return {
    id,
    name: `临时资产 ${id}`,
    category: 'test',
    taxonomy: { category: 'dev' }, // T010.2 必填分类（临时管线测试资产 → dev）
    tags: ['test'],
    defaultScale: { x: 1, y: 1, z: 1 },
    defaultRotation: { x: 0, y: 0, z: 0 },
  };
}

/** 释放一次 build 产物的全部资源（测试内直接调用 build 后的卫生收尾） */
function disposeSource(source: InstanceSource): void {
  source.geometry.dispose();
  if (Array.isArray(source.material)) {
    for (const material of source.material) material.dispose();
  } else {
    source.material.dispose();
  }
}

describe('glob 扫描冒烟（import.meta.glob）', () => {
  it('asset_trashbin meta 收割齐备：id/name/category/tags/默认姿态/variants 字段值', () => {
    const metas = collectProceduralAssetMetas();
    const bin = metas.find((m) => m.id === 'asset_trashbin');
    expect(bin).toBeDefined();
    expect(bin?.name).toBe('垃圾桶');
    expect(bin?.category).toBe('facility');
    expect(bin?.tags).toEqual(['设施', '垃圾桶', 'trashbin']);
    expect(bin?.defaultScale).toEqual({ x: 1, y: 1, z: 1 });
    expect(bin?.defaultRotation).toEqual({ x: 0, y: 0, z: 0 });
    expect(bin?.variants).toEqual({ scaleJitter: 0.1, rotationJitter: 180, hueJitter: 6 });
  });

  it('路由可取 build，调用产出 BufferGeometry + material 数组，groups 对齐材质序', () => {
    const build = getProceduralBuild('asset_trashbin');
    expect(build).toBeDefined();
    expect(typeof build).toBe('function');
    const source = build!();
    try {
      expect(source.geometry).toBeInstanceOf(THREE.BufferGeometry);
      expect(Array.isArray(source.material)).toBe(true);
      const groups = source.geometry.groups;
      // mergeGeometries(useGroups)：materialIndex 与材质数组逐槽对齐
      // （T002.4 升级：桶身+竖棱+底座+双层盖+投口翻盖共 16 部件分层，见 trashbin.asset.ts 头部分层表）
      expect(source.material).toHaveLength(groups.length);
      expect(groups.map((g) => g.materialIndex)).toEqual([...groups.keys()]);
      // 原点 = 底面中心（贴地语义）：y=0 是桶底，总高约 0.9m
      source.geometry.computeBoundingBox();
      expect(source.geometry.boundingBox?.min.y).toBeCloseTo(0, 5);
      expect(source.geometry.boundingBox?.max.y).toBeGreaterThan(0.8);
      expect(source.geometry.boundingBox?.max.y).toBeLessThan(1.0);
    } finally {
      disposeSource(source);
    }
  });

  it('build 契约：每次调用构造新资源（两次调用 geometry 引用不同）', () => {
    const build = getProceduralBuild('asset_trashbin')!;
    const a = build();
    const b = build();
    try {
      expect(b.geometry).not.toBe(a.geometry);
      expect(b.material).not.toBe(a.material);
    } finally {
      disposeSource(a);
      disposeSource(b);
    }
  });
});

describe('模块注册规则（registerProceduralModule：glob 扫描的单模块处理规则）', () => {
  it('meta + build 齐备 → 路由 + meta 收割', () => {
    const id = 'test.tmp_module_full';
    tempIds.push(id);
    expect(registerProceduralModule({ meta: tempMeta(id), build: tempBuild() })).toBe(true);
    expect(hasProceduralRoute(id)).toBe(true);
    expect(collectProceduralAssetMetas().map((m) => m.id)).toContain(id);
  });

  it('缺 build → false 且不建路由不收割（与 styles 轨差异：无灰显占位）', () => {
    const before = collectProceduralAssetMetas().length;
    const id = 'test.tmp_module_meta_only';
    expect(registerProceduralModule({ meta: tempMeta(id) })).toBe(false);
    expect(hasProceduralRoute(id)).toBe(false);
    expect(collectProceduralAssetMetas()).toHaveLength(before);
  });

  it('缺 meta → false 不建路由不收割', () => {
    const before = collectProceduralAssetMetas().length;
    expect(registerProceduralModule({ build: tempBuild() })).toBe(false);
    expect(collectProceduralAssetMetas()).toHaveLength(before);
  });

  it('非法输入（null / 空对象 / meta 缺 id）→ false 不抛错不收割', () => {
    const before = collectProceduralAssetMetas().length;
    expect(() => registerProceduralModule(null)).not.toThrow();
    expect(registerProceduralModule(null)).toBe(false);
    expect(registerProceduralModule(undefined)).toBe(false);
    expect(registerProceduralModule({})).toBe(false);
    expect(registerProceduralModule({ meta: { name: '缺 id' }, build: tempBuild() })).toBe(false);
    expect(collectProceduralAssetMetas()).toHaveLength(before);
  });

  it('重复 id → false 且首个生效（路由 build 身份不变，收割不重复）', () => {
    const id = 'test.tmp_module_dup';
    tempIds.push(id);
    const first = tempBuild();
    expect(registerProceduralModule({ meta: tempMeta(id), build: first })).toBe(true);
    expect(registerProceduralModule({ meta: tempMeta(id), build: tempBuild() })).toBe(false);
    expect(getProceduralBuild(id)).toBe(first);
    expect(collectProceduralAssetMetas().filter((m) => m.id === id)).toHaveLength(1);
  });

  it('重复真实资产 id（asset_trashbin）→ false 且原路由与收割不受影响', () => {
    expect(registerProceduralModule({ meta: tempMeta('asset_trashbin'), build: tempBuild() })).toBe(false);
    expect(hasProceduralRoute('asset_trashbin')).toBe(true);
    expect(collectProceduralAssetMetas().filter((m) => m.id === 'asset_trashbin')).toHaveLength(1);
  });
});

describe('注入 seam（测试不依赖文件系统）', () => {
  it('register 后可取 build，unregister 后不可', () => {
    const id = 'test.tmp_route';
    tempIds.push(id);
    const build = tempBuild();
    registerProceduralRoute(id, build);
    expect(hasProceduralRoute(id)).toBe(true);
    expect(getProceduralBuild(id)).toBe(build);
    unregisterProceduralRoute(id);
    tempIds.pop();
    expect(hasProceduralRoute(id)).toBe(false);
    expect(getProceduralBuild(id)).toBeUndefined();
  });

  it('重复注册同 id 抛错（对齐注册表惯例）', () => {
    const id = 'test.tmp_dup_route';
    tempIds.push(id);
    registerProceduralRoute(id, tempBuild());
    expect(() => registerProceduralRoute(id, tempBuild())).toThrow(/已注册/);
  });

  it('seam 注册不进入文件收割清单（collect 只含插件文件 meta）', () => {
    const id = 'test.tmp_route_no_harvest';
    tempIds.push(id);
    registerProceduralRoute(id, tempBuild(), tempMeta(id));
    expect(hasProceduralRoute(id)).toBe(true);
    expect(collectProceduralAssetMetas().map((m) => m.id)).not.toContain(id);
  });

  it('unregister 未注册 id 静默（清理兜底）', () => {
    expect(() => unregisterProceduralRoute('test.never_registered')).not.toThrow();
  });
});
