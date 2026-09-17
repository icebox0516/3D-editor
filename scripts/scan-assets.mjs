#!/usr/bin/env node
/**
 * scripts/scan-assets.mjs —— 扫描 assets/models 重生成 manifest.json + SVG 占位缩略图（零外部依赖）。
 *
 * 职责（T2.1）：
 * - 递归扫描 assets/models 下全部 .glb/.gltf（一级目录名即 category，支持自定义分类）；
 * - 增量合并：读取既有 manifest.json，按 file 路径保留旧条目的 id/name/tags/defaultScale/
 *   defaultRotation/metadata（收藏类字段如 metadata.favorite 尽力保留）；目录中已删除的模型
 *   条目剔除、孤儿缩略图清理；新增模型按文件名派生默认值并入；
 * - 为每个模型确定性生成 SVG 占位缩略图（类别色 + 名称首字）写到 assets/thumbnails/*.svg，
 *   manifest.thumbnail 引用其相对 assets 根路径（CONTRACTS.md 勘误：file/thumbnail 一律相对路径，
 *   由组合根 app/bootstrap 解析为可加载 URL）；
 * - metadata.bytes 刷新为当前真实文件尺寸（ThumbnailCache 以 assetId@bytes 为持久 key）。
 * 边界：不解析 GLB 内容（triangles 等旧 metadata 原样保留）；生成完全确定（无时间戳），
 *      产物可提交；启动时浏览器只读清单不重复扫描（需求 §模型资产库）。
 *
 * 用法：`npm run assets:scan`（默认仓库 assets/），或 `node scripts/scan-assets.mjs [assetsDir]`。
 * 测试：tests/scripts/scan-assets.test.mjs（真实临时目录验证扫描/增量合并语义）。
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MANIFEST_VERSION = '1.0';
const GENERATOR = 'scripts/scan-assets.mjs';
const MODEL_EXTENSIONS = ['.glb', '.gltf'];

/** 已知分类 → 中文标签（与 generate-assets.mjs ASSET_SPECS 对齐；未知分类回退目录 slug） */
const CATEGORY_LABELS = {
  building: '建筑',
  plant: '植物',
  vehicle: '车辆',
  character: '人物',
  'road-facility': '道路设施',
  'public-facility': '公共设施',
  'fire-safety': '消防设施',
  device: '设备',
};

/** 分类色（内容色板：缩略图占位/卡片角标用，不进 UI 色板约束范围） */
const CATEGORY_COLORS = {
  building: '#8a6d4b',
  plant: '#3f8a45',
  vehicle: '#b04a42',
  character: '#96705b',
  'road-facility': '#5a7d9a',
  'public-facility': '#7d8a5a',
  'fire-safety': '#c9553f',
  device: '#4f8a8a',
};

/** 未知分类的回退色池（按分类名哈希稳定取色） */
const FALLBACK_COLORS = ['#6b7f9e', '#8a7f4b', '#7f4b66', '#4b7f6b', '#9e6b7f', '#5b6b9e'];

// ── 工具 ────────────────────────────────────────────────────

/** djb2 哈希 → 十六进制（确定性去重后缀 / 回退取色） */
function hashHex(text) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

function categoryLabel(category) {
  return CATEGORY_LABELS[category] ?? category;
}

function categoryColor(category) {
  return CATEGORY_COLORS[category] ?? FALLBACK_COLORS[parseInt(hashHex(category).slice(0, 4), 16) % FALLBACK_COLORS.length];
}

/** 名称首字（ASCII 字母转大写；空名回退 '?'） */
function initialChar(name) {
  const first = [...String(name).trim()][0] ?? '?';
  return /[a-z]/.test(first) ? first.toUpperCase() : first;
}

/** 相对亮度（sRGB 近似）→ 判断占位图上文字用深还是浅 */
function luminance(hex) {
  const v = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** XML 属性转义（名称可能含 & < > "） */
function escapeXml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
}

/** 确定性 SVG 占位缩略图：类别色底 + 名称首字（3:2 比例，紧凑网格友好） */
function buildThumbnailSvg(name, category) {
  const color = categoryColor(category);
  const ink = luminance(color) > 0.55 ? '#10131a' : '#f2f4f8';
  const label = escapeXml(categoryLabel(category));
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="64" viewBox="0 0 96 64" role="img">',
    `<rect width="96" height="64" fill="${color}"/>`,
    `<text x="48" y="30" font-family="Consolas, Menlo, monospace" font-size="30" font-weight="600" fill="${ink}" text-anchor="middle" dominant-baseline="central">${escapeXml(initialChar(name))}</text>`,
    `<text x="48" y="55" font-family="Consolas, Menlo, monospace" font-size="8" fill="${ink}" fill-opacity="0.75" text-anchor="middle">${label}</text>`,
    '</svg>',
    '',
  ].join('\n');
}

/** 文件名 stem → 显示名（'office-building' → 'office building'；中文文件名原样） */
function stemToName(stem) {
  return stem.replace(/[-_]+/g, ' ').trim() || stem;
}

/** 递归收集 models 下全部模型文件，返回相对 assets 根的 posix 路径（按路径排序，产物确定） */
function walkModels(modelsDir) {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (MODEL_EXTENSIONS.includes(name.slice(name.lastIndexOf('.')).toLowerCase())) out.push(full);
    }
  };
  if (existsSync(modelsDir)) walk(modelsDir);
  return out.sort();
}

/** 读取既有 manifest（缺失/损坏 → 空表，扫描器容错重建） */
function readOldManifest(assetsDir) {
  const manifestPath = join(assetsDir, 'manifest.json');
  if (!existsSync(manifestPath)) return new Map();
  try {
    const parsed = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const assets = Array.isArray(parsed?.assets) ? parsed.assets : [];
    const byFile = new Map();
    for (const entry of assets) {
      if (entry && typeof entry.file === 'string' && !byFile.has(entry.file)) byFile.set(entry.file, entry);
    }
    return byFile;
  } catch {
    return new Map();
  }
}

/** 读取既有 SVG 内容（字节一致则跳过写入，避免产物时间戳抖动） */
function readIfDifferent(absPath, content) {
  try {
    return readFileSync(absPath, 'utf8') !== content;
  } catch {
    return true;
  }
}

// ── 扫描主流程 ──────────────────────────────────────────────

/**
 * 扫描 assetsDir/models 重建 assetsDir/manifest.json 与 assetsDir/thumbnails/*.svg；
 * 返回 manifest 对象（与磁盘产物一致）。增量合并按 file 路径保留旧 tags/收藏标记等标注。
 */
export function scanAssets(assetsDir) {
  const modelsDir = join(assetsDir, 'models');
  const thumbnailsDir = join(assetsDir, 'thumbnails');
  const old = readOldManifest(assetsDir);
  const files = walkModels(modelsDir);

  // stem 占用表：首个文件用裸 stem，后续同名追加路径哈希后缀（确定性且唯一）
  const usedKeys = new Set();

  const entries = files.map((abs) => {
    const rel = posix.join('models', ...abs.slice(modelsDir.length + 1).split(/[\\/]+/));
    const category = rel.split('/')[1] ?? 'other';
    const stem = posix.basename(rel).replace(/\.[^.]+$/, '');
    const key = resolveKey(stem, rel, usedKeys);
    const prev = old.get(rel);
    const name = typeof prev?.name === 'string' && prev.name !== '' ? prev.name : stemToName(stem);
    const metadata = {
      ...(prev && typeof prev.metadata === 'object' && prev.metadata !== null ? prev.metadata : {}),
      categoryLabel: categoryLabel(category),
      bytes: statSync(abs).size,
    };
    return {
      id: `asset_${key}`,
      name,
      category,
      file: rel,
      thumbnail: posix.join('thumbnails', `${key}.svg`),
      tags:
        Array.isArray(prev?.tags) && prev.tags.every((t) => typeof t === 'string') && prev.tags.length > 0
          ? [...prev.tags]
          : [categoryLabel(category), stem],
      defaultScale:
        prev?.defaultScale && [prev.defaultScale.x, prev.defaultScale.y, prev.defaultScale.z].every((n) => typeof n === 'number' && Number.isFinite(n))
          ? { ...prev.defaultScale }
          : { x: 1, y: 1, z: 1 },
      defaultRotation:
        prev?.defaultRotation && [prev.defaultRotation.x, prev.defaultRotation.y, prev.defaultRotation.z].every((n) => typeof n === 'number' && Number.isFinite(n))
          ? { ...prev.defaultRotation }
          : { x: 0, y: 0, z: 0 },
      metadata,
    };
  });

  // ── 缩略图：写新内容、清理孤儿 .svg ──
  // 孤儿 = 旧 manifest 引用过、新 manifest 不再引用的 .svg（本脚本自有产物）；
  // 从未被清单引用的文件（用户手工放置）一律不动。
  const referenced = new Set();
  mkdirSync(thumbnailsDir, { recursive: true });
  for (const entry of entries) {
    referenced.add(entry.thumbnail);
    const absThumb = join(assetsDir, ...entry.thumbnail.split('/'));
    const svg = buildThumbnailSvg(entry.name, entry.category);
    if (readIfDifferent(absThumb, svg)) writeFileSync(absThumb, svg);
  }
  if (existsSync(thumbnailsDir)) {
    for (const [file, prev] of old) {
      const thumb = prev?.thumbnail;
      if (typeof thumb === 'string' && thumb.toLowerCase().endsWith('.svg') && !referenced.has(thumb)) {
        rmSync(join(assetsDir, ...thumb.split('/')), { force: true });
      }
    }
  }

  const manifest = { version: MANIFEST_VERSION, generator: GENERATOR, assets: entries };
  mkdirSync(assetsDir, { recursive: true });
  writeFileSync(join(assetsDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

/** stem 占用表：首个文件用裸 stem，后续同 stem 追加 `_<路径哈希>`（确定性且唯一） */
function resolveKey(stem, rel, usedKeys) {
  if (!usedKeys.has(stem)) {
    usedKeys.add(stem);
    return stem;
  }
  let key = `${stem}_${hashHex(rel).slice(0, 6)}`;
  while (usedKeys.has(key)) key = `${key}_`;
  usedKeys.add(key);
  return key;
}

// ── CLI ────────────────────────────────────────────────────
const isMain = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const assetsDir = process.argv[2] ? resolve(process.argv[2]) : join(root, 'assets');
  const manifest = scanAssets(assetsDir);
  for (const asset of manifest.assets) {
    console.log(`  ${asset.id.padEnd(24)} ${asset.file.padEnd(40)} ${String(asset.metadata.bytes).padStart(8)} B  ${asset.thumbnail}`);
  }
  console.log(`[scan-assets] OK：${manifest.assets.length} 个模型 → ${join(assetsDir, 'manifest.json')}`);
}
