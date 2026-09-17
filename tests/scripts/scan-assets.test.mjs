/**
 * tests/scripts/scan-assets.test.mjs —— 资产清单扫描脚本测试（先测后码，操作真实临时目录）。
 *
 * 覆盖（T2.1 验收标准 1）：
 * - 首次扫描：扫描 assets/models 下全部 .glb/.gltf 生成 manifest.json（version 1.0、条目含
 *   id/name/category/file/tags/defaultScale/defaultRotation/metadata.bytes）；
 * - SVG 占位缩略图：确定性生成（同输入字节一致），写到 assets/thumbnails/*.svg，
 *   manifest.thumbnail 为相对 assets 根路径；内容含类别色与名称首字；
 * - 增量合并（按 file 路径）：重扫保留旧条目的 id/name/tags/defaultScale/defaultRotation/
 *   metadata（含收藏类字段 best-effort）；新增模型并入默认值；删除的模型条目剔除、孤儿缩略图清理；
 * - 未知分类回退 slug；同名不同目录 id 去重；非模型文件忽略；models 目录缺失不抛错。
 * 边界：真实临时目录操作，测后清理；脚本纯 Node（无 three）。
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { scanAssets } from '../../scripts/scan-assets.mjs';

/** 造一个假模型文件（扫描器不解析 GLB 内容，任意字节即可） */
function writeModel(assetsDir, relPath, size = 64) {
  const abs = join(assetsDir, ...relPath.split('/'));
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, Buffer.alloc(size, 0xab));
  return abs;
}

function readManifest(assetsDir) {
  return JSON.parse(readFileSync(join(assetsDir, 'manifest.json'), 'utf8'));
}

describe('scripts/scan-assets.mjs：首次扫描', () => {
  let dir;

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'scan-assets-first-'));
    writeModel(dir, 'models/plant/tree.glb', 100);
    writeModel(dir, 'models/vehicle/car.glb', 200);
    writeModel(dir, 'models/vehicle/truck.gltf', 300);
    writeModel(dir, 'models/vehicle/notes.txt', 50); // 非模型：忽略
    writeModel(dir, 'models/plant/texture.png', 50); // 非模型：忽略
    scanAssets(dir);
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('扫描 glb/gltf 生成 manifest：条目形状齐全、按 file 排序、忽略非模型文件', () => {
    const manifest = readManifest(dir);
    expect(manifest.version).toBe('1.0');
    expect(manifest.generator).toBe('scripts/scan-assets.mjs');
    expect(manifest.assets.map((a) => a.file)).toEqual([
      'models/plant/tree.glb',
      'models/vehicle/car.glb',
      'models/vehicle/truck.gltf',
    ]);

    const tree = manifest.assets[0];
    expect(tree.id).toBe('asset_tree');
    expect(tree.category).toBe('plant');
    expect(tree.name).toBe('tree'); // 新文件：名称由文件名派生
    expect(Array.isArray(tree.tags)).toBe(true);
    expect(tree.tags.length).toBeGreaterThan(0);
    expect(tree.defaultScale).toEqual({ x: 1, y: 1, z: 1 });
    expect(tree.defaultRotation).toEqual({ x: 0, y: 0, z: 0 });
    expect(tree.metadata.bytes).toBe(100); // 真实文件尺寸
  });

  it('缩略图：相对路径引用 + 文件存在 + 内容含名称首字 + 确定性', () => {
    const manifest = readManifest(dir);
    for (const asset of manifest.assets) {
      expect(asset.thumbnail).toMatch(/^thumbnails\/[a-z0-9_-]+\.svg$/);
      expect(existsSync(join(dir, asset.thumbnail))).toBe(true);
      const svg = readFileSync(join(dir, asset.thumbnail), 'utf8');
      expect(svg).toContain('<svg');
      expect(svg).toContain(asset.name[0].toUpperCase()); // 名称首字
    }
    // 确定性：同输入重扫，SVG 字节一致
    const before = readFileSync(join(dir, 'thumbnails/tree.svg'), 'utf8');
    scanAssets(dir);
    expect(readFileSync(join(dir, 'thumbnails/tree.svg'), 'utf8')).toBe(before);
  });

  it('已知分类带中文 categoryLabel，未知分类回退 slug', () => {
    const manifest = readManifest(dir);
    const tree = manifest.assets.find((a) => a.id === 'asset_tree');
    expect(tree.metadata.categoryLabel).toBe('植物');
  });
});

describe('scripts/scan-assets.mjs：增量合并与边界', () => {
  /** 本组所有临时目录，统一清理 */
  const dirs = [];
  const newDir = (tag) => {
    const dir = mkdtempSync(join(tmpdir(), `scan-assets-${tag}-`));
    dirs.push(dir);
    return dir;
  };
  afterAll(() => {
    for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  });

  it('按 file 合并：旧 tags/name/收藏标记/defaultScale 保留；新增并入；删除剔除；孤儿缩略图清理', () => {
    const dir = newDir('merge');
    writeModel(dir, 'models/plant/tree.glb', 100);
    writeModel(dir, 'models/vehicle/car.glb', 200);
    scanAssets(dir);

    // 手工标注：tags、中文名、收藏标记、默认缩放（模拟用户/上游对清单的加工）
    const first = readManifest(dir);
    const tree = first.assets.find((a) => a.id === 'asset_tree');
    tree.name = '行道树';
    tree.tags = ['乔木', '行道树'];
    tree.defaultScale = { x: 2, y: 2, z: 2 };
    tree.metadata.favorite = true;
    writeFileSync(join(dir, 'manifest.json'), JSON.stringify(first, null, 2));

    // 目录变更：删除 car、新增 truck
    rmSync(join(dir, 'models/vehicle/car.glb'));
    writeModel(dir, 'models/vehicle/truck.glb', 400);

    const merged = scanAssets(dir);
    expect(merged.assets.map((a) => a.file)).toEqual(['models/plant/tree.glb', 'models/vehicle/truck.glb']);

    const keptTree = merged.assets[0];
    expect(keptTree.name).toBe('行道树');
    expect(keptTree.tags).toEqual(['乔木', '行道树']);
    expect(keptTree.defaultScale).toEqual({ x: 2, y: 2, z: 2 });
    expect(keptTree.metadata.favorite).toBe(true); // 收藏类字段尽力保留
    expect(keptTree.metadata.bytes).toBe(100);

    const addedTruck = merged.assets[1];
    expect(addedTruck.id).toBe('asset_truck');
    expect(addedTruck.name).toBe('truck');
    expect(addedTruck.defaultScale).toEqual({ x: 1, y: 1, z: 1 });

    // car 已删：条目消失 + 孤儿缩略图清理
    expect(existsSync(join(dir, 'thumbnails/car.svg'))).toBe(false);
    expect(existsSync(join(dir, 'thumbnails/tree.svg'))).toBe(true);
    expect(existsSync(join(dir, 'thumbnails/truck.svg'))).toBe(true);
  });

  it('未知分类：categoryLabel 回退目录 slug', () => {
    const dir = newDir('unknown-cat');
    writeModel(dir, 'models/misc/rock.glb', 10);
    const manifest = scanAssets(dir);
    expect(manifest.assets[0].category).toBe('misc');
    expect(manifest.assets[0].metadata.categoryLabel).toBe('misc');
  });

  it('同名不同目录：id 与缩略图文件均唯一且确定', () => {
    const dir = newDir('dup');
    writeModel(dir, 'models/a/box.glb', 10);
    writeModel(dir, 'models/b/box.glb', 20);
    const manifest = scanAssets(dir);
    const ids = manifest.assets.map((a) => a.id);
    expect(new Set(ids).size).toBe(2);
    expect(ids[0]).toBe('asset_box');
    expect(ids[1]).toMatch(/^asset_box_/);
    const thumbs = manifest.assets.map((a) => a.thumbnail);
    expect(new Set(thumbs).size).toBe(2);
    for (const t of thumbs) expect(existsSync(join(dir, t))).toBe(true);
    // 确定性：重扫 id 稳定
    expect(scanAssets(dir).assets.map((a) => a.id)).toEqual(ids);
  });

  it('models 目录缺失/为空：产出空清单不抛错', () => {
    const dir = newDir('empty');
    const manifest = scanAssets(dir);
    expect(manifest.assets).toEqual([]);
    expect(readManifest(dir)).toEqual(manifest);
    mkdirSync(join(dir, 'models'), { recursive: true });
    expect(scanAssets(dir).assets).toEqual([]);
  });

  it('thumbnails 目录中无关文件不被清理', () => {
    const dir = newDir('keep');
    writeModel(dir, 'models/plant/tree.glb', 100);
    scanAssets(dir);
    mkdirSync(join(dir, 'thumbnails'), { recursive: true });
    writeFileSync(join(dir, 'thumbnails/README.txt'), 'keep');
    writeFileSync(join(dir, 'thumbnails/custom.svg'), '<svg/>');
    scanAssets(dir);
    expect(existsSync(join(dir, 'thumbnails/README.txt'))).toBe(true);
    expect(existsSync(join(dir, 'thumbnails/custom.svg'))).toBe(true);
  });

  it('旧 manifest 中无对应模型的条目不并入新清单', () => {
    const dir = newDir('ghost');
    writeModel(dir, 'models/plant/tree.glb', 100);
    scanAssets(dir);
    const first = readManifest(dir);
    first.assets.push({
      id: 'asset_ghost',
      name: '幽灵',
      category: 'plant',
      file: 'models/plant/ghost.glb',
      tags: [],
      defaultScale: { x: 1, y: 1, z: 1 },
      defaultRotation: { x: 0, y: 0, z: 0 },
    });
    writeFileSync(join(dir, 'manifest.json'), JSON.stringify(first));
    const merged = scanAssets(dir);
    expect(merged.assets.map((a) => a.file)).toEqual(['models/plant/tree.glb']);
  });
});
