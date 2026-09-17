/**
 * io/AssetManifest —— 资产清单（manifest.json）读取与 AssetRegistry 灌注。
 *
 * 职责：loadManifest(json) 校验并归一化清单数据为 ModelAsset[]（T2.1 接口 Produces）；
 *      registerManifestAssets 把清单幂等灌注进 AssetRegistry（重复 id 跳过）。
 * 边界：io 层纯数据（分层 DAG：只依赖 core/scene/domain/registries，零渲染）；
 *      路径语义遵循 CONTRACTS.md 勘误（2026-09-09）：file/thumbnail 为相对 assets 根的
 *      原样路径，本模块不做任何 URL 解析——「相对路径 → 可加载 URL」由组合根
 *      app/bootstrap.loadManifest 统一完成，runtime AssetLoader 不感知路径拼接。
 */
import type { ModelAsset } from '../domain/assets';
import type { AssetRegistry } from '../registries/AssetRegistry';

/** 清单解析错误（结构非法 / 版本不识别 / 条目缺字段），信息含定位（如 assets[1].file） */
export class AssetManifestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssetManifestError';
  }
}

const MANIFEST_VERSION = '1.0';

function fail(path: string, reason: string): never {
  throw new AssetManifestError(`资产清单非法：${path} ${reason}`);
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

/** 条目必须是普通对象 */
function asEntry(raw: unknown, index: number): Record<string, unknown> {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    fail(`assets[${index}]`, '必须是对象');
  }
  return raw as Record<string, unknown>;
}

function requireString(entry: Record<string, unknown>, field: string, index: number): string {
  const value = entry[field];
  if (typeof value !== 'string' || value.trim() === '') {
    fail(`assets[${index}].${field}`, '必须是非空字符串');
  }
  return value;
}

/** 三轴向量：缺轴补默认值，提供的轴必须是有限数值 */
function readVec3(
  entry: Record<string, unknown>,
  field: string,
  index: number,
  fallback: number,
): { x: number; y: number; z: number } {
  const raw = entry[field];
  if (raw === undefined) return { x: fallback, y: fallback, z: fallback };
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    fail(`assets[${index}].${field}`, '必须是 { x, y, z } 对象');
  }
  const src = raw as Record<string, unknown>;
  const axis = (key: 'x' | 'y' | 'z'): number => {
    const v = src[key];
    if (v === undefined) return fallback;
    if (!isFiniteNumber(v)) fail(`assets[${index}].${field}.${key}`, '必须是有限数值');
    return v;
  };
  return { x: axis('x'), y: axis('y'), z: axis('z') };
}

/**
 * 解析清单 JSON（已 JSON.parse 的对象）：校验版本与条目结构，归一化可选字段
 * （tags→[]、defaultScale→{1,1,1}、defaultRotation→{0,0,0}、metadata 原样保留）。
 * 非法输入抛 AssetManifestError（含条目定位），由调用方决定降级策略。
 */
export function loadManifest(json: unknown): { assets: ModelAsset[] } {
  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    fail('根节点', '必须是对象');
  }
  const root = json as Record<string, unknown>;
  if (root.version !== MANIFEST_VERSION) {
    fail('version', `不识别的清单版本 ${JSON.stringify(root.version ?? null)}（支持 "${MANIFEST_VERSION}"）`);
  }
  if (!Array.isArray(root.assets)) {
    fail('assets', '必须是数组');
  }

  const seen = new Set<string>();
  const assets: ModelAsset[] = (root.assets as unknown[]).map((raw, index) => {
    const entry = asEntry(raw, index);
    const asset: ModelAsset = {
      id: requireString(entry, 'id', index),
      name: requireString(entry, 'name', index),
      category: requireString(entry, 'category', index),
      file: requireString(entry, 'file', index),
      tags: readTags(entry, index),
      defaultScale: readVec3(entry, 'defaultScale', index, 1),
      defaultRotation: readVec3(entry, 'defaultRotation', index, 0),
    };
    if (seen.has(asset.id)) fail(`assets[${index}].id`, `重复的资产 id: ${asset.id}`);
    seen.add(asset.id);

    const thumbnail = entry.thumbnail;
    if (thumbnail !== undefined) {
      if (typeof thumbnail !== 'string' || thumbnail === '') {
        fail(`assets[${index}].thumbnail`, '必须是非空字符串');
      }
      asset.thumbnail = thumbnail;
    }
    if (entry.metadata !== undefined) {
      if (typeof entry.metadata !== 'object' || entry.metadata === null || Array.isArray(entry.metadata)) {
        fail(`assets[${index}].metadata`, '必须是对象');
      }
      asset.metadata = { ...(entry.metadata as Record<string, unknown>) };
    }
    return asset;
  });

  return { assets };
}

/** tags：缺省 []；必须为数组；非字符串项过滤（手工编辑容错） */
function readTags(entry: Record<string, unknown>, index: number): string[] {
  const raw = entry.tags;
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) fail(`assets[${index}].tags`, '必须是字符串数组');
  return raw.filter((t): t is string => typeof t === 'string');
}

/**
 * 把清单资产幂等灌注进 AssetRegistry（包装 kind='file' 描述符；已注册 id 跳过，不覆盖）；
 * 返回新增数量。manifest 灌注发生在组合根（app/bootstrap），UI 只读注册表。
 */
export function registerManifestAssets(registry: AssetRegistry, assets: readonly ModelAsset[]): number {
  let added = 0;
  for (const asset of assets) {
    if (registry.get(asset.id)) continue;
    registry.register({ kind: 'file', asset });
    added += 1;
  }
  return added;
}
