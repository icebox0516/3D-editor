/**
 * tests/tools/generate-assets.test.mjs —— 占位资产生成脚本的 GLB 结构测试（先测后码）。
 *
 * 覆盖（T1.8 验收标准）：
 * - generateAllAssets(outDir) 产出 8 个 GLB（tree/streetlight/car/person/bench/extinguisher/sensor/pavilion）
 *   + manifest.json；
 * - 每个 GLB 为合法 glTF 2.0 Binary：12 字节头（magic 'glTF'、version 2、length = 文件字节数）、
 *   首 chunk 为 JSON（type 0x4E4F534A，长度 4 字节对齐）、次 chunk 为 BIN（type 0x004E4942）；
 * - JSON chunk：asset.version '2.0'；每个 primitive 含 POSITION + NORMAL 属性；
 *   POSITION accessor 具备 min/max；buffers[0].byteLength 与 BIN chunk 长度一致；
 *   所有 bufferView 落在 BIN 范围内；每个 primitive 引用带 baseColorFactor 的材质；
 * - manifest.json：8 条 ModelAsset 形状记录（asset_ 前缀 id、name、category、file 存在、tags、
 *   defaultScale/defaultRotation），文件路径与磁盘产物一致；
 * - 生成确定性：同输入两次生成字节一致（便于提交生成物）。
 */
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ASSET_SPECS, generateAllAssets } from '../../scripts/generate-assets.mjs';

const GLB_MAGIC = 0x46546c67; // 'glTF'
const CHUNK_JSON = 0x4e4f534a; // 'JSON'
const CHUNK_BIN = 0x004e4942; // 'BIN\0'

const EXPECTED_KEYS = ['tree', 'streetlight', 'car', 'person', 'bench', 'extinguisher', 'sensor', 'pavilion'];

/** 解析 GLB 二进制：返回 header + JSON 对象 + BIN Buffer（断言全部结构规则） */
function parseGlb(buffer) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const magic = view.getUint32(0, true);
  const version = view.getUint32(4, true);
  const length = view.getUint32(8, true);

  const jsonLength = view.getUint32(12, true);
  const jsonType = view.getUint32(16, true);
  const jsonText = buffer.subarray(20, 20 + jsonLength).toString('utf8');

  const binOffset = 20 + jsonLength;
  const binLength = view.getUint32(binOffset, true);
  const binType = view.getUint32(binOffset + 4, true);
  const bin = buffer.subarray(binOffset + 8, binOffset + 8 + binLength);

  return {
    magic,
    version,
    length,
    jsonLength,
    jsonType,
    json: JSON.parse(jsonText),
    binLength,
    binType,
    bin,
    magicAscii: buffer.subarray(0, 4).toString('ascii'),
  };
}

describe('scripts/generate-assets.mjs：占位 GLB 生成', () => {
  let outDir;
  let manifest;

  beforeAll(() => {
    outDir = mkdtempSync(join(tmpdir(), 'phase1-assets-'));
    manifest = generateAllAssets(outDir);
  });

  afterAll(() => {
    rmSync(outDir, { recursive: true, force: true });
  });

  it('产出 8 个占位模型规格，键集合固定', () => {
    expect(ASSET_SPECS.map((s) => s.key).sort()).toEqual([...EXPECTED_KEYS].sort());
  });

  it('生成 manifest.json 与 8 个 GLB 文件，路径一一对应', () => {
    const manifestPath = join(outDir, 'manifest.json');
    expect(existsSync(manifestPath)).toBe(true);
    const onDisk = JSON.parse(readFileSync(manifestPath, 'utf8'));
    expect(onDisk).toEqual(manifest);
    expect(onDisk.assets).toHaveLength(8);
    for (const asset of onDisk.assets) {
      expect(asset.file.endsWith('.glb')).toBe(true);
      expect(existsSync(join(outDir, asset.file))).toBe(true);
      // 目录约定 models/{category}/*.glb
      expect(asset.file.startsWith(`models/${asset.category}/`)).toBe(true);
    }
  });

  it('manifest 条目具备 ModelAsset 形状（asset_ 前缀 id / 名称 / 分类 / 标签 / 默认变换）', () => {
    const ids = new Set();
    for (const asset of manifest.assets) {
      expect(asset.id).toMatch(/^asset_[a-z0-9_]+$/);
      expect(ids.has(asset.id)).toBe(false);
      ids.add(asset.id);
      expect(typeof asset.name).toBe('string');
      expect(asset.name.length).toBeGreaterThan(0);
      expect(typeof asset.category).toBe('string');
      expect(Array.isArray(asset.tags)).toBe(true);
      expect(asset.tags.length).toBeGreaterThan(0);
      expect(asset.defaultScale).toEqual({ x: 1, y: 1, z: 1 });
      expect(asset.defaultRotation).toEqual({ x: 0, y: 0, z: 0 });
    }
    // 8 个分类各不相同（植物/道路设施/车辆/人物/公共设施/消防设施/设备/建筑）
    const categories = new Set(manifest.assets.map((a) => a.category));
    expect(categories.size).toBe(8);
  });

  it.each(EXPECTED_KEYS)('%s.glb：12 字节头合法（magic glTF、version 2、length=文件长度）', (key) => {
    const asset = manifest.assets.find((a) => a.id === `asset_${key}`);
    expect(asset).toBeDefined();
    const buffer = readFileSync(join(outDir, asset.file));
    const glb = parseGlb(buffer);
    expect(glb.magicAscii).toBe('glTF');
    expect(glb.magic).toBe(GLB_MAGIC);
    expect(glb.version).toBe(2);
    expect(glb.length).toBe(buffer.byteLength);
    expect(buffer.byteLength % 4).toBe(0);
  });

  it.each(EXPECTED_KEYS)('%s.glb：JSON chunk 在前、BIN chunk 在后，长度 4 字节对齐', (key) => {
    const asset = manifest.assets.find((a) => a.id === `asset_${key}`);
    const glb = parseGlb(readFileSync(join(outDir, asset.file)));
    expect(glb.jsonType).toBe(CHUNK_JSON);
    expect(glb.jsonLength % 4).toBe(0);
    expect(glb.binType).toBe(CHUNK_BIN);
    expect(glb.binLength % 4).toBe(0);
    expect(glb.binLength).toBeGreaterThan(0);
    // 12 头 + (8 + JSON) + (8 + BIN) = 总长
    expect(12 + 8 + glb.jsonLength + 8 + glb.binLength).toBe(glb.length);
  });

  it.each(EXPECTED_KEYS)('%s.glb：glTF 2.0 结构（顶点法线 + 基础色材质 + accessor/bufferView 一致）', (key) => {
    const asset = manifest.assets.find((a) => a.id === `asset_${key}`);
    const glb = parseGlb(readFileSync(join(outDir, asset.file)));
    const json = glb.json;

    expect(json.asset.version).toBe('2.0');
    expect(json.buffers).toHaveLength(1);
    expect(json.buffers[0].byteLength).toBe(glb.binLength);
    expect(typeof json.scene).toBe('number');
    expect(json.scenes[json.scene].nodes.length).toBeGreaterThan(0);
    expect(json.meshes.length).toBeGreaterThan(0);
    expect(json.materials.length).toBeGreaterThan(0);

    // 场景根节点引用的每个 node 必须指向存在的 mesh（或含子节点）
    for (const nodeIndex of json.scenes[json.scene].nodes) {
      const node = json.nodes[nodeIndex];
      expect(node).toBeDefined();
      if (node.mesh !== undefined) expect(json.meshes[node.mesh]).toBeDefined();
    }

    for (const bufferView of json.bufferViews) {
      expect(bufferView.buffer).toBe(0);
      expect(bufferView.byteOffset + bufferView.byteLength).toBeLessThanOrEqual(glb.binLength);
      expect(bufferView.byteOffset % 4).toBe(0);
    }

    for (const mesh of json.meshes) {
      for (const primitive of mesh.primitives) {
        // 顶点法线：POSITION 与 NORMAL 同数量
        expect(primitive.attributes.POSITION).toBeTypeOf('number');
        expect(primitive.attributes.NORMAL).toBeTypeOf('number');
        const position = json.accessors[primitive.attributes.POSITION];
        const normal = json.accessors[primitive.attributes.NORMAL];
        expect(position.type).toBe('VEC3');
        expect(position.componentType).toBe(5126);
        expect(normal.type).toBe('VEC3');
        expect(normal.componentType).toBe(5126);
        expect(normal.count).toBe(position.count);
        expect(position.count % 3).toBe(0); // 三角形列表
        expect(position.count).toBeGreaterThan(0);
        // POSITION accessor 的 min/max（glTF 规范强制）
        expect(position.min).toHaveLength(3);
        expect(position.max).toHaveLength(3);
        for (let i = 0; i < 3; i++) expect(position.min[i]).toBeLessThanOrEqual(position.max[i]);

        // 基础色材质
        expect(primitive.material).toBeTypeOf('number');
        const material = json.materials[primitive.material];
        expect(material.pbrMetallicRoughness.baseColorFactor).toHaveLength(4);
        for (const c of material.pbrMetallicRoughness.baseColorFactor) {
          expect(c).toBeGreaterThanOrEqual(0);
          expect(c).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it.each(EXPECTED_KEYS)('%s.glb：法线为单位向量且 BIN 数据与 accessor 声明的 min/max 一致', (key) => {
    const asset = manifest.assets.find((a) => a.id === `asset_${key}`);
    const glb = parseGlb(readFileSync(join(outDir, asset.file)));
    const json = glb.json;
    const bin = glb.bin;
    for (const mesh of json.meshes) {
      for (const primitive of mesh.primitives) {
        const position = json.accessors[primitive.attributes.POSITION];
        const normal = json.accessors[primitive.attributes.NORMAL];
        const posView = json.bufferViews[position.bufferView];
        const normView = json.bufferViews[normal.bufferView];
        const positions = new Float32Array(
          bin.buffer,
          bin.byteOffset + posView.byteOffset + (position.byteOffset ?? 0),
          position.count * 3,
        );
        const normals = new Float32Array(
          bin.buffer,
          bin.byteOffset + normView.byteOffset + (normal.byteOffset ?? 0),
          normal.count * 3,
        );
        const min = [Infinity, Infinity, Infinity];
        const max = [-Infinity, -Infinity, -Infinity];
        for (let i = 0; i < positions.length; i += 3) {
          for (let d = 0; d < 3; d++) {
            min[d] = Math.min(min[d], positions[i + d]);
            max[d] = Math.max(max[d], positions[i + d]);
          }
        }
        for (let d = 0; d < 3; d++) {
          expect(position.min[d]).toBeCloseTo(min[d], 5);
          expect(position.max[d]).toBeCloseTo(max[d], 5);
        }
        for (let i = 0; i < normals.length; i += 3) {
          const len = Math.hypot(normals[i], normals[i + 1], normals[i + 2]);
          expect(len).toBeCloseTo(1, 4);
        }
      }
    }
  });

  it('模型立于地面之上（最低点 y ≥ 0，放置时贴地）', () => {
    for (const asset of manifest.assets) {
      const glb = parseGlb(readFileSync(join(outDir, asset.file)));
      let minY = Infinity;
      for (const accessor of glb.json.accessors) {
        if (accessor.min && accessor.min.length === 3 && accessor.type === 'VEC3') {
          // 仅 POSITION accessor 携带 min/max
          minY = Math.min(minY, accessor.min[1]);
        }
      }
      expect(minY).toBeGreaterThanOrEqual(-1e-6);
    }
  });

  it('生成确定性：重复生成字节一致', () => {
    const second = mkdtempSync(join(tmpdir(), 'phase1-assets-2-'));
    try {
      const again = generateAllAssets(second);
      expect(again).toEqual(manifest);
      for (const asset of manifest.assets) {
        const a = readFileSync(join(outDir, asset.file));
        const b = readFileSync(join(second, asset.file));
        expect(a.equals(b)).toBe(true);
      }
    } finally {
      rmSync(second, { recursive: true, force: true });
    }
  });
});
