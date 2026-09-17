#!/usr/bin/env node
/**
 * scripts/generate-assets.mjs —— 程序生成占位 GLB 模型 + assets/manifest.json（零外部依赖）。
 *
 * 职责：纯 Node 手写 glTF 2.0 Binary（12 字节头 + JSON chunk + BIN chunk），不依赖 three；
 *      生成 8 个低多边形占位模型（tree / streetlight / car / person / bench / extinguisher /
 *      sensor / pavilion），每个模型含顶点法线（平直着色）与 PBR 基础色材质；
 *      同步产出 manifest.json（ModelAsset 形状的资产清单，供 AssetRegistry 启动读取）。
 * 边界：生成完全确定（无随机、无时间戳），产物可提交；模型底面贴地（min y = 0，Y 向上），
 *      尺寸为米制真实比例，便于 PlacementTool 直接落地放置；
 *      仅为阶段一验收的视觉占位——正式资产由 T2.1 扫描脚本接管（scan-assets.mjs）。
 *
 * 用法：`npm run assets:generate`（写入仓库 assets/），或 `node scripts/generate-assets.mjs [outDir]`。
 * 测试：tests/tools/generate-assets.test.mjs（导入 generateAllAssets 写入临时目录后断言二进制结构）。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── glTF 常量 ──────────────────────────────────────────────
const GLB_MAGIC = 0x46546c67; // 'glTF'
const GLB_VERSION = 2;
const CHUNK_JSON = 0x4e4f534a; // 'JSON'
const CHUNK_BIN = 0x004e4942; // 'BIN\0'
const COMPONENT_FLOAT = 5126;
const TARGET_ARRAY_BUFFER = 34962;
const MODE_TRIANGLES = 4;

// ── 几何构造（非索引三角形列表 + 平直法线；Y 向上，底面 y=0）──────────

/** 三角形集合：每项为 [p0, p1, p2]，p = [x, y, z]；绕向逆时针朝外 */
function tri(a, b, c) {
  return [a, b, c];
}

/** 轴对齐长方体：中心 (cx, cy, cz)，尺寸 w(x) h(y) d(z) */
function box(w, h, d, cx = 0, cy = 0, cz = 0) {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const y0 = cy - h / 2;
  const y1 = cy + h / 2;
  const z0 = cz - d / 2;
  const z1 = cz + d / 2;
  const p = {
    a: [x0, y0, z0], b: [x1, y0, z0], c: [x1, y1, z0], d: [x0, y1, z0], // 背面 (z0)
    e: [x0, y0, z1], f: [x1, y0, z1], g: [x1, y1, z1], h: [x0, y1, z1], // 正面 (z1)
  };
  return [
    // +Z 正面
    tri(p.e, p.f, p.g), tri(p.e, p.g, p.h),
    // -Z 背面
    tri(p.b, p.a, p.d), tri(p.b, p.d, p.c),
    // +X 右
    tri(p.f, p.b, p.c), tri(p.f, p.c, p.g),
    // -X 左
    tri(p.a, p.e, p.h), tri(p.a, p.h, p.d),
    // +Y 顶
    tri(p.h, p.g, p.c), tri(p.h, p.c, p.d),
    // -Y 底
    tri(p.a, p.b, p.f), tri(p.a, p.f, p.e),
  ];
}

/**
 * 圆柱 / 圆台 / 圆锥（radiusTop=0）：底面圆心 (cx, baseY, cz)，沿 +Y 延伸 height，
 * segments 段侧面 + 顶底盖（半径为 0 的一侧不生成盖）。
 */
function cylinder(radiusTop, radiusBottom, height, segments, cx = 0, baseY = 0, cz = 0) {
  const tris = [];
  const yTop = baseY + height;
  const ring = (radius, y) => {
    const pts = [];
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push([cx + Math.cos(angle) * radius, y, cz + Math.sin(angle) * radius]);
    }
    return pts;
  };
  const bottom = ring(radiusBottom, baseY);
  const top = ring(radiusTop, yTop);
  const apexTop = [cx, yTop, cz];
  const apexBottom = [cx, baseY, cz];

  for (let i = 0; i < segments; i++) {
    const j = (i + 1) % segments;
    // 侧面（绕向：从外侧看逆时针）
    if (radiusTop > 0) {
      tris.push(tri(bottom[i], top[i], top[j]));
      tris.push(tri(bottom[i], top[j], bottom[j]));
    } else {
      tris.push(tri(bottom[i], apexTop, bottom[j]));
    }
    // 顶盖（法线 +Y）
    if (radiusTop > 0) tris.push(tri(top[i], apexTop, top[j]));
    // 底盖（法线 -Y）
    if (radiusBottom > 0) tris.push(tri(bottom[j], apexBottom, bottom[i]));
  }
  return tris;
}

/** 低多边形 UV 球：中心 (cx, cy, cz) */
function sphere(radius, widthSegments, heightSegments, cx = 0, cy = 0, cz = 0) {
  const tris = [];
  const point = (u, v) => {
    const theta = u * Math.PI * 2;
    const phi = v * Math.PI;
    return [
      cx + radius * Math.sin(phi) * Math.cos(theta),
      cy + radius * Math.cos(phi),
      cz + radius * Math.sin(phi) * Math.sin(theta),
    ];
  };
  for (let y = 0; y < heightSegments; y++) {
    const v0 = y / heightSegments;
    const v1 = (y + 1) / heightSegments;
    for (let x = 0; x < widthSegments; x++) {
      const u0 = x / widthSegments;
      const u1 = (x + 1) / widthSegments;
      const a = point(u0, v0);
      const b = point(u0, v1);
      const c = point(u1, v1);
      const d = point(u1, v0);
      // 极点处退化三角形跳过（y=0 时 a==d，y=最后时 b==c）
      if (y !== 0) tris.push(tri(a, c, d));
      if (y !== heightSegments - 1) tris.push(tri(a, b, c));
    }
  }
  return tris;
}

/** 绕 X 轴旋转 90°（把 Y 向圆柱放平成沿 Z 的轮轴），随后平移 */
function rotateX90(tris, dx = 0, dy = 0, dz = 0) {
  return tris.map((t) => t.map(([x, y, z]) => [x + dx, -z + dy, y + dz]));
}

/** 绕 Y 轴旋转任意角度（弧度） */
function rotateY(tris, angle, dx = 0, dy = 0, dz = 0) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return tris.map((t) => t.map(([x, y, z]) => [x * c + z * s + dx, y + dy, -x * s + z * c + dz]));
}

// ── 颜色 ────────────────────────────────────────────────────

/** sRGB 十六进制 → 线性 RGB（glTF baseColorFactor 为线性空间） */
function hexToLinear(hex) {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  return channels.map((c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
}

/** 零件：名称 + 三角形集合 + 材质参数 */
function part(name, tris, color, { metallic = 0, roughness = 0.85 } = {}) {
  return { name, tris, color, metallic, roughness };
}

// ── 8 个占位模型规格 ────────────────────────────────────────

const TREE = () => [
  part('trunk', cylinder(0.14, 0.2, 1.7, 8), '#6b4a2d', { roughness: 0.95 }),
  part('crown-lower', cylinder(0, 1.3, 2.0, 8, 0, 1.3), '#3f8a45'),
  part('crown-upper', cylinder(0, 0.9, 1.6, 8, 0, 2.6), '#4fa356'),
];

const STREETLIGHT = () => [
  part('base', cylinder(0.14, 0.18, 0.25, 8), '#3a3f47', { metallic: 0.4, roughness: 0.6 }),
  part('pole', cylinder(0.06, 0.09, 5.8, 8, 0, 0.25), '#4a5058', { metallic: 0.5, roughness: 0.5 }),
  part('arm', box(1.4, 0.08, 0.08, 0.7, 6.05, 0), '#4a5058', { metallic: 0.5, roughness: 0.5 }),
  part('lamp', box(0.6, 0.14, 0.32, 1.35, 5.98, 0), '#2f343b', { metallic: 0.3, roughness: 0.5 }),
  part('bulb', box(0.5, 0.03, 0.24, 1.35, 5.9, 0), '#ffe9a8', { roughness: 0.2 }),
];

const CAR = () => {
  const wheel = (dx, dz) => rotateX90(cylinder(0.34, 0.34, 0.24, 10), dx, 0.34, dz);
  return [
    part('body', box(4.2, 0.62, 1.8, 0, 0.66, 0), '#c8402f', { metallic: 0.2, roughness: 0.4 }),
    part('cabin', box(2.1, 0.58, 1.55, -0.2, 1.24, 0), '#8fb4c9', { metallic: 0.5, roughness: 0.15 }),
    part('wheel-fl', wheel(1.35, 0.85), '#1c1c1f', { roughness: 0.9 }),
    part('wheel-fr', wheel(1.35, -0.85), '#1c1c1f', { roughness: 0.9 }),
    part('wheel-rl', wheel(-1.35, 0.85), '#1c1c1f', { roughness: 0.9 }),
    part('wheel-rr', wheel(-1.35, -0.85), '#1c1c1f', { roughness: 0.9 }),
  ];
};

const PERSON = () => [
  part('leg-l', box(0.17, 0.85, 0.2, -0.11, 0.425, 0), '#2f3d5c'),
  part('leg-r', box(0.17, 0.85, 0.2, 0.11, 0.425, 0), '#2f3d5c'),
  part('torso', box(0.46, 0.62, 0.26, 0, 1.16, 0), '#d9822b'),
  part('arm-l', box(0.11, 0.58, 0.14, -0.3, 1.15, 0), '#d9822b'),
  part('arm-r', box(0.11, 0.58, 0.14, 0.3, 1.15, 0), '#d9822b'),
  part('head', sphere(0.13, 8, 6, 0, 1.62, 0), '#e0b08a'),
];

const BENCH = () => [
  part('leg-l', box(0.08, 0.42, 0.42, -0.8, 0.21, 0), '#3b3f45', { metallic: 0.5, roughness: 0.6 }),
  part('leg-r', box(0.08, 0.42, 0.42, 0.8, 0.21, 0), '#3b3f45', { metallic: 0.5, roughness: 0.6 }),
  part('seat', box(1.8, 0.06, 0.46, 0, 0.45, 0), '#9a6b3c', { roughness: 0.9 }),
  part('backrest', box(1.8, 0.4, 0.05, 0, 0.72, -0.21), '#9a6b3c', { roughness: 0.9 }),
];

const EXTINGUISHER = () => [
  part('body', cylinder(0.09, 0.09, 0.5, 10, 0, 0.02), '#c9241a', { metallic: 0.3, roughness: 0.4 }),
  part('foot', cylinder(0.1, 0.1, 0.02, 10), '#2a2a2e', { roughness: 0.9 }),
  part('neck', cylinder(0.05, 0.06, 0.08, 8, 0, 0.52), '#2a2a2e', { metallic: 0.6, roughness: 0.4 }),
  part('handle', box(0.16, 0.025, 0.03, 0.02, 0.62, 0), '#2a2a2e', { metallic: 0.6, roughness: 0.4 }),
  part('hose', box(0.03, 0.3, 0.03, -0.11, 0.35, 0), '#1a1a1c', { roughness: 0.95 }),
];

const SENSOR = () => [
  part('base', box(0.3, 0.06, 0.3, 0, 0.03, 0), '#3a3f47', { metallic: 0.4, roughness: 0.6 }),
  part('pole', cylinder(0.035, 0.045, 2.1, 8, 0, 0.06), '#7c848f', { metallic: 0.6, roughness: 0.4 }),
  part('head', box(0.32, 0.2, 0.2, 0, 2.26, 0), '#e6e8eb', { metallic: 0.2, roughness: 0.5 }),
  part('lens', sphere(0.06, 8, 6, 0, 2.26, 0.13), '#1f6fd0', { metallic: 0.2, roughness: 0.2 }),
  part('indicator', box(0.06, 0.02, 0.02, 0.1, 2.37, 0.1), '#e8a33d', { roughness: 0.3 }),
];

const PAVILION = () => {
  const column = (dx, dz) => cylinder(0.11, 0.13, 2.7, 8, dx, 0.3, dz);
  return [
    part('platform', box(4.2, 0.3, 4.2, 0, 0.15, 0), '#a89f92', { roughness: 0.9 }),
    part('column-1', column(1.6, 1.6), '#8b5a3c', { roughness: 0.85 }),
    part('column-2', column(-1.6, 1.6), '#8b5a3c', { roughness: 0.85 }),
    part('column-3', column(1.6, -1.6), '#8b5a3c', { roughness: 0.85 }),
    part('column-4', column(-1.6, -1.6), '#8b5a3c', { roughness: 0.85 }),
    part('rim', box(3.9, 0.14, 3.9, 0, 3.07, 0), '#6e4630', { roughness: 0.85 }),
    // 四棱锥屋顶：4 段圆锥旋转 45° 使棱对齐平台边
    part('roof', rotateY(cylinder(0, 2.95, 1.35, 4), Math.PI / 4, 0, 3.14, 0), '#5c3d2e', { roughness: 0.8 }),
    part('finial', sphere(0.12, 8, 6, 0, 4.55, 0), '#e8a33d', { metallic: 0.8, roughness: 0.3 }),
  ];
};

/** 占位资产规格表：key 即文件名/ID 后缀；category 为目录 slug；categoryLabel 为需求文档分类名 */
export const ASSET_SPECS = [
  { key: 'tree', name: '行道树', category: 'plant', categoryLabel: '植物', tags: ['植物', '树', 'tree'], build: TREE },
  { key: 'streetlight', name: '路灯', category: 'road-facility', categoryLabel: '道路设施', tags: ['道路设施', '灯', 'streetlight'], build: STREETLIGHT },
  { key: 'car', name: '轿车', category: 'vehicle', categoryLabel: '车辆', tags: ['车辆', '汽车', 'car'], build: CAR },
  { key: 'person', name: '行人', category: 'character', categoryLabel: '人物', tags: ['人物', '行人', 'person'], build: PERSON },
  { key: 'bench', name: '长椅', category: 'public-facility', categoryLabel: '公共设施', tags: ['公共设施', '座椅', 'bench'], build: BENCH },
  { key: 'extinguisher', name: '灭火器', category: 'fire-safety', categoryLabel: '消防设施', tags: ['消防设施', '灭火器', 'extinguisher'], build: EXTINGUISHER },
  { key: 'sensor', name: '环境传感器', category: 'device', categoryLabel: '设备', tags: ['设备', '传感器', 'sensor'], build: SENSOR },
  { key: 'pavilion', name: '凉亭', category: 'building', categoryLabel: '建筑', tags: ['建筑', '亭', 'pavilion'], build: PAVILION },
];

// ── GLB 编码 ────────────────────────────────────────────────

/** 4 字节向上对齐 */
function align4(n) {
  return (n + 3) & ~3;
}

/** 三角形集合 → 展平的 Float32 位置/法线数组（每面 3 顶点，平直法线） */
function flattenTriangles(tris) {
  const positions = new Float32Array(tris.length * 9);
  const normals = new Float32Array(tris.length * 9);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  tris.forEach(([a, b, c], i) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz) || 1;
    nx /= len; ny /= len; nz /= len;
    [a, b, c].forEach((p, k) => {
      const o = i * 9 + k * 3;
      positions[o] = p[0]; positions[o + 1] = p[1]; positions[o + 2] = p[2];
      normals[o] = nx; normals[o + 1] = ny; normals[o + 2] = nz;
      for (let d = 0; d < 3; d++) {
        if (p[d] < min[d]) min[d] = p[d];
        if (p[d] > max[d]) max[d] = p[d];
      }
    });
  });
  // 消除 -0 / 浮点噪声，保证 min/max 与 Float32 数据一致
  const f32 = (v) => Math.fround(v) + 0;
  return { positions, normals, min: min.map(f32), max: max.map(f32), count: tris.length * 3 };
}

/**
 * 零件列表 → GLB Buffer。每个零件一个 node/mesh/material，共享单一 BIN buffer。
 * 结构：12 字节头 | JSON chunk（空格补齐）| BIN chunk（零补齐）。
 */
export function buildGlb(parts, modelName) {
  const binParts = [];
  let binLength = 0;
  const bufferViews = [];
  const accessors = [];
  const materials = [];
  const meshes = [];
  const nodes = [];

  const pushView = (typedArray) => {
    const bytes = Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
    const byteOffset = binLength;
    binParts.push(bytes);
    binLength += bytes.byteLength;
    const padding = align4(binLength) - binLength;
    if (padding > 0) {
      binParts.push(Buffer.alloc(padding));
      binLength += padding;
    }
    bufferViews.push({ buffer: 0, byteOffset, byteLength: bytes.byteLength, target: TARGET_ARRAY_BUFFER });
    return bufferViews.length - 1;
  };

  parts.forEach((p, index) => {
    const geometry = flattenTriangles(p.tris);
    const positionView = pushView(geometry.positions);
    const normalView = pushView(geometry.normals);
    accessors.push({
      bufferView: positionView,
      byteOffset: 0,
      componentType: COMPONENT_FLOAT,
      count: geometry.count,
      type: 'VEC3',
      min: geometry.min,
      max: geometry.max,
    });
    const positionAccessor = accessors.length - 1;
    accessors.push({
      bufferView: normalView,
      byteOffset: 0,
      componentType: COMPONENT_FLOAT,
      count: geometry.count,
      type: 'VEC3',
    });
    const normalAccessor = accessors.length - 1;

    const [r, g, b] = hexToLinear(p.color).map((c) => Number(c.toFixed(5)));
    materials.push({
      name: `${p.name}-material`,
      pbrMetallicRoughness: {
        baseColorFactor: [r, g, b, 1],
        metallicFactor: p.metallic,
        roughnessFactor: p.roughness,
      },
      doubleSided: false,
    });
    meshes.push({
      name: p.name,
      primitives: [
        {
          attributes: { POSITION: positionAccessor, NORMAL: normalAccessor },
          material: materials.length - 1,
          mode: MODE_TRIANGLES,
        },
      ],
    });
    nodes.push({ name: p.name, mesh: index });
  });

  const json = {
    asset: { version: '2.0', generator: '3d-editor placeholder generator (scripts/generate-assets.mjs)' },
    scene: 0,
    scenes: [{ name: modelName, nodes: nodes.map((_, i) => i) }],
    nodes,
    meshes,
    materials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: binLength }],
  };

  const jsonBytes = Buffer.from(JSON.stringify(json), 'utf8');
  const jsonPadded = Buffer.concat([jsonBytes, Buffer.alloc(align4(jsonBytes.length) - jsonBytes.length, 0x20)]);
  const bin = Buffer.concat(binParts, binLength);

  const totalLength = 12 + 8 + jsonPadded.length + 8 + bin.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(GLB_MAGIC, 0);
  header.writeUInt32LE(GLB_VERSION, 4);
  header.writeUInt32LE(totalLength, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonPadded.length, 0);
  jsonHeader.writeUInt32LE(CHUNK_JSON, 4);

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(bin.length, 0);
  binHeader.writeUInt32LE(CHUNK_BIN, 4);

  return Buffer.concat([header, jsonHeader, jsonPadded, binHeader, bin], totalLength);
}

// ── 生成入口 ────────────────────────────────────────────────

/**
 * 生成全部占位模型到 outDir（models/{category}/{key}.glb）并写入 outDir/manifest.json；
 * 返回 manifest 对象。确定性输出：同规格多次生成字节一致。
 */
export function generateAllAssets(outDir) {
  const assets = ASSET_SPECS.map((spec) => {
    const parts = spec.build();
    const glb = buildGlb(parts, spec.name);
    const relFile = posix.join('models', spec.category, `${spec.key}.glb`);
    const absFile = join(outDir, ...relFile.split('/'));
    mkdirSync(dirname(absFile), { recursive: true });
    writeFileSync(absFile, glb);
    const triangles = parts.reduce((sum, p) => sum + p.tris.length, 0);
    return {
      id: `asset_${spec.key}`,
      name: spec.name,
      category: spec.category,
      file: relFile,
      tags: [...spec.tags],
      defaultScale: { x: 1, y: 1, z: 1 },
      defaultRotation: { x: 0, y: 0, z: 0 },
      metadata: {
        placeholder: true,
        categoryLabel: spec.categoryLabel,
        triangles,
        bytes: glb.length,
      },
    };
  });

  const manifest = {
    version: '1.0',
    generator: 'scripts/generate-assets.mjs',
    assets,
  };
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

// ── CLI ────────────────────────────────────────────────────
const isMain = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const outDir = process.argv[2] ? resolve(process.argv[2]) : join(root, 'assets');
  const manifest = generateAllAssets(outDir);
  for (const asset of manifest.assets) {
    console.log(`  ${asset.id.padEnd(20)} ${asset.file.padEnd(40)} ${String(asset.metadata.triangles).padStart(4)} tris  ${asset.metadata.bytes} B`);
  }
  console.log(`[generate-assets] OK：${manifest.assets.length} 个占位 GLB + manifest.json → ${outDir}`);
}
