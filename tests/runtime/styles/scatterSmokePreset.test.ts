/**
 * tests/runtime/styles/scatterSmokePreset.test.ts —— T003.3 dev 散布冒烟预设收割测试。
 *
 * 覆盖（沿 routes.test.ts 先例）：
 * - glob 收割：dev.scatter_smoke 进 collectPresetPluginMetas（bootstrap 注册表同源数据），
 *   路由与 meta 同源（hasBuildRoute / getRouteMeta().scatter 可查——RegionScatterSync 的
 *   配方查询走同一入口）；
 * - meta 完整性：scatter 段数值与任务书钦定一致（配比/密度/聚簇/衰减/尺寸范围）、
 *   形状限定面类、绿地语义可选（UI 样式列表可见性）；
 * - 配比资产真实存在（程序化注册表含 asset_trashbin / asset_hydrant——浏览器验收不空撒）；
 * - build 表面段：flat 材质 Mesh + update 颜色覆写。
 * 边界：003.5 正式样式落地后本预设处置时，此测试随文件一并移除。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { collectProceduralAssetMetas } from '../../../src/runtime/procedural/routes';
import { collectPresetPluginMetas, getRouteMeta, hasBuildRoute } from '../../../src/runtime/styles/routes';
import { build, meta } from '../../../src/runtime/styles/dev/scatter_smoke.preset';

describe('dev.scatter_smoke 预设收割', () => {
  it('glob 收割进 meta 清单，且与构建路由同源（getRouteMeta 可查 scatter 段）', () => {
    const harvested = collectPresetPluginMetas().find((m) => m.id === 'dev.scatter_smoke');
    expect(harvested).toBeDefined();
    expect(harvested).toBe(meta);
    expect(hasBuildRoute('dev.scatter_smoke')).toBe(true);
    expect(getRouteMeta('dev.scatter_smoke')?.scatter).toBe(meta.scatter); // RegionScatterSync 同一查询入口
  });

  it('scatter 段与任务书钦定一致：配比 3:1、密度 0.03、聚簇 0.6/6m、衰减 2m、尺寸 0.9–1.2', () => {
    const scatter = meta.scatter;
    expect(scatter).toBeDefined();
    expect(scatter!.assets).toEqual([
      { assetId: 'asset_trashbin', weight: 3 },
      { assetId: 'asset_hydrant', weight: 1 },
    ]);
    expect(scatter!.densityPerM2).toBeCloseTo(0.03);
    expect(scatter!.clustering).toBe(0.6);
    expect(scatter!.clusterRadiusM).toBe(6);
    expect(scatter!.edgeFalloffM).toBe(2);
    expect(scatter!.scaleRange).toEqual({ min: 0.9, max: 1.2 });
  });

  it('形状限定面类（line/point 不开放）、绿地语义可选（UI 样式列表可见）', () => {
    expect(meta.supportedShapes).not.toContain('line');
    expect(meta.supportedShapes).not.toContain('point');
    expect(meta.supportedShapes.length).toBeGreaterThan(0);
    expect(meta.supportedSemantics).toContain('grass');
    expect(meta.category).toBe('dev');
  });

  it('配比资产真实注册（程序化注册表含两资产 id——验收不空撒）', () => {
    const ids = new Set(collectProceduralAssetMetas().map((m) => m.id));
    expect(ids.has('asset_trashbin')).toBe(true);
    expect(ids.has('asset_hydrant')).toBe(true);
  });

  it('build 表面段：flat 材质 Mesh；update 颜色覆写生效', () => {
    const geometry = new THREE.PlaneGeometry(4, 4);
    const instance = build(geometry, {});
    const mesh = instance.object as THREE.Mesh;
    expect(mesh.isMesh).toBe(true);
    expect((mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial).toBe(true);
    const before = (mesh.material as THREE.MeshStandardMaterial).color.getHexString();
    instance.update({ color: '#123456' });
    expect((mesh.material as THREE.MeshStandardMaterial).color.getHexString()).toBe('123456');
    expect(before).not.toBe('123456');
    instance.dispose();
    geometry.dispose();
    (mesh.material as THREE.MeshStandardMaterial).dispose();
  });
});
