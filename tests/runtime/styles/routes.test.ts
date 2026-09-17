/**
 * tests/runtime/styles/routes.test.ts —— 样式插件构建路由测试（T6.2，先测后码）。
 *
 * 覆盖：
 * - import.meta.glob 扫描内置插件（default_solid / default_wireframe / test.shader）建立 presetId → build 路由；
 * - 同文件 meta+build 双导出收割：collectPresetPluginMetas 返回全部 meta（含 category）；
 * - 注入 seam：registerBuildRoute / unregisterBuildRoute / hasBuildRoute（测试不依赖文件系统写入）；
 * - 一致性守门：meta 无 build（灰显判定）/ build 无 meta（不注册不暴露）/ diffPresetConsistency 双向。
 * 边界：路由只存构建函数与 meta，永不进入 registries 层（分层 DAG 由 check:layers 守门）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { ShapeType } from '../../../src/domain/regions';
import type { StylePresetMeta } from '../../../src/registries';
import {
  collectPresetPluginMetas,
  diffPresetConsistency,
  getRouteMeta,
  hasBuildRoute,
  isPresetBuildable,
  listBuildRouteIds,
  registerBuildRoute,
  registerPresetModule,
  unregisterBuildRoute,
} from '../../../src/runtime/styles/routes';
import type { StyleInstance, StylePresetBuild } from '../../../src/runtime/styles/types';

const tempIds: string[] = [];

afterEach(() => {
  for (const id of tempIds.splice(0)) unregisterBuildRoute(id);
});

function tempBuild(): StylePresetBuild {
  return (geometry) => {
    const material = new THREE.MeshStandardMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    const instance: StyleInstance = {
      object: mesh,
      material,
      presetId: '',
      supportedShapes: [],
      update() {},
      setGeometry() {},
      dispose() {},
    };
    return instance;
  };
}

describe('内置插件路由（import.meta.glob 扫描）', () => {
  it('三个内置预设均已建立构建路由', () => {
    const ids = listBuildRouteIds();
    expect(ids).toContain('default_solid');
    expect(ids).toContain('default_wireframe');
    expect(ids).toContain('test.shader');
    expect(ids).toContain('default_solid'); // 幂等：同文件不被重复注册
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('meta 收割齐备：default_solid 线类/语义全支持、test.shader 标 test 类', () => {
    const metas = collectPresetPluginMetas();
    const solid = metas.find((m) => m.id === 'default_solid');
    expect(solid).toBeDefined();
    expect(solid?.category).toBe('base');
    expect(solid?.supportedShapes).toEqual([
      'polygon', 'rectangle', 'circle', 'ellipse', 'freehand', 'line', 'point',
    ]);
    expect(solid?.supportedSemantics).toHaveLength(10);
    expect(metas.find((m) => m.id === 'test.shader')?.category).toBe('test');
    expect(metas.find((m) => m.id === 'default_wireframe')).toBeDefined();
  });

  it('路由内 meta 与收割 meta 同源（getRouteMeta 可查）', () => {
    expect(getRouteMeta('default_solid')?.id).toBe('default_solid');
    expect(getRouteMeta('test.shader')?.name).toBeTypeOf('string');
    expect(getRouteMeta('missing.preset')).toBeUndefined();
  });
});

describe('注入 seam（测试不依赖文件系统）', () => {
  it('registerBuildRoute 后可创建，unregister 后不可', () => {
    const id = 'test.tmp_route';
    tempIds.push(id);
    registerBuildRoute(id, tempBuild());
    expect(hasBuildRoute(id)).toBe(true);
    expect(isPresetBuildable(id)).toBe(true);
    unregisterBuildRoute(id);
    tempIds.pop();
    expect(hasBuildRoute(id)).toBe(false);
    expect(isPresetBuildable(id)).toBe(false);
  });

  it('重复注册同 id 抛错（对齐注册表惯例）', () => {
    const id = 'test.tmp_dup';
    tempIds.push(id);
    registerBuildRoute(id, tempBuild());
    expect(() => registerBuildRoute(id, tempBuild())).toThrow(/已注册/);
  });

  it('seam 注册可携带 meta（engine 参数合并依赖）', () => {
    const id = 'test.tmp_with_meta';
    tempIds.push(id);
    const meta: StylePresetMeta = {
      id, name: '临时', supportedShapes: ['polygon'], supportedSemantics: ['unclassified'], defaultParams: [],
    };
    registerBuildRoute(id, tempBuild(), meta);
    expect(getRouteMeta(id)?.id).toBe(id);
    // seam 注册不进入文件收割清单（collect 只含插件文件 meta）
    expect(collectPresetPluginMetas().map((m) => m.id)).not.toContain(id);
  });
});

describe('插件模块注册（registerPresetModule：glob 扫描的单模块处理规则）', () => {
  it('meta + build 齐备 → 路由 + meta 收割', () => {
    const id = 'test.tmp_module_full';
    tempIds.push(id);
    const meta: StylePresetMeta = {
      id, name: '完整模块', supportedShapes: ['circle'], supportedSemantics: ['water'], defaultParams: [],
    };
    registerPresetModule({ meta, build: tempBuild() });
    expect(hasBuildRoute(id)).toBe(true);
    expect(collectPresetPluginMetas().map((m) => m.id)).toContain(id);
  });

  it('meta 无 build → 收割 meta（UI 灰显用）但无路由（isPresetBuildable 假）', () => {
    const id = 'test.tmp_module_meta_only';
    tempIds.push(id);
    const meta: StylePresetMeta = {
      id, name: '缺构建器', supportedShapes: ['point'], supportedSemantics: ['poi'], defaultParams: [],
    };
    registerPresetModule({ meta });
    expect(hasBuildRoute(id)).toBe(false);
    expect(isPresetBuildable(id)).toBe(false);
    expect(collectPresetPluginMetas().map((m) => m.id)).toContain(id);
  });

  it('build 无 meta → 不注册不暴露（无 id 可路由，天然不进收割清单）', () => {
    const before = collectPresetPluginMetas().length;
    const idsBefore = listBuildRouteIds().length;
    registerPresetModule({ build: tempBuild() });
    expect(collectPresetPluginMetas()).toHaveLength(before);
    expect(listBuildRouteIds()).toHaveLength(idsBefore);
  });

  it('空模块 / 非法 meta → 静默跳过不抛错', () => {
    expect(() => registerPresetModule({})).not.toThrow();
    expect(() => registerPresetModule(null)).not.toThrow();
    expect(() => registerPresetModule({ meta: { name: '缺 id' }, build: tempBuild() })).not.toThrow();
  });
});

describe('双向一致性判定（diffPresetConsistency，测试锁定）', () => {
  it('meta 有 build 无 → missingBuild（UI 灰显 + Toast）；build 有 meta 无 → missingMeta（不暴露）', () => {
    const report = diffPresetConsistency(['a', 'b', 'c'], ['a', 'd']);
    expect(report.missingBuild).toEqual(['b', 'c']);
    expect(report.missingMeta).toEqual(['d']);
  });

  it('完全一致 → 双空', () => {
    expect(diffPresetConsistency(['a', 'b'], ['b', 'a'])).toEqual({ missingBuild: [], missingMeta: [] });
  });
});

describe('路由类型边界', () => {
  it('ShapeType 全集可作 supportedShapes（类型收窄编译校验）', () => {
    const shapes: ShapeType[] = ['polygon', 'rectangle', 'circle', 'ellipse', 'freehand', 'line', 'point'];
    const meta: StylePresetMeta = {
      id: 'test.tmp_shapes', name: '全集', supportedShapes: shapes, supportedSemantics: ['custom'], defaultParams: [],
    };
    tempIds.push('test.tmp_shapes');
    registerPresetModule({ meta, build: tempBuild() });
    expect(getRouteMeta('test.tmp_shapes')?.supportedShapes).toHaveLength(7);
  });
});
