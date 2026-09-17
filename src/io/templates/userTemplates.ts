/**
 * io/templates/userTemplates —— 用户模板 localStorage 存储（T8.2）。
 *
 * 职责：TemplatePayload 的持久化 CRUD（键 t3d-editor.templates，沿
 *      t3d-editor.workspace 命名先例）：
 *   - listUserTemplates：损坏 JSON / 非数组载荷 → 空清单；损坏条目（非对象 /
 *     空 id / 空名 / scene 非法）逐条静默跳过；
 *   - saveUserTemplate：名字首尾裁剪；重名覆盖（沿 saveNamedLayout 先例，
 *     调用方 UI 提示「将覆盖」）；容量兜底——保存后总数 > MAX_COUNT 或总载荷
 *     （全部条目 serialize 后字符串 length 合计）> MAX_TOTAL_CHARS 拒存返回
 *     失败原因；localStorage 真实 QuotaExceededError 同样返回失败；
 *   - rename / delete：按 id 改名（改到既有名 = 覆盖合并，不产生重名）与删除
 *     （清空后移除存储键）。
 * 边界：storage 经参数注入（缺省 globalThis.localStorage，不可用静默 null——
 *      沿 layoutPresets 先例；node 测试注入 fake，绝不直连 globalThis）；
 *      模板 id 用 createId('tpl')（契约 #7 前缀清单增补 tpl_，主代理预裁定）。
 */
import { createId } from '../../core/id';
import { deepClone } from '../../core/utils';
import type { SceneData } from '../../scene/SceneData';
import type { TemplatePayload } from './index';

/** 用户模板表在 localStorage 的键（沿 t3d-editor.workspace 命名先例） */
export const USER_TEMPLATES_STORAGE_KEY = 't3d-editor.templates';

/** 容量兜底：保存后条目总数上限（超过拒存 'count-limit'） */
export const USER_TEMPLATES_MAX_COUNT = 20;

/** 容量兜底：全部条目 serialize 后字符串 length 合计上限（超过拒存 'size-limit'） */
export const USER_TEMPLATES_MAX_TOTAL_CHARS = 1_000_000;

/** 最小 storage 接口（localStorage 子集，便于注入 fake；沿 layoutPresets 先例） */
export interface TemplateStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** 拒存原因（容量两路 + 配额 + 入参/环境不可用） */
export type UserTemplateSaveFailure =
  | 'invalid-name' // 空名（裁剪后）
  | 'storage-unavailable' // localStorage 不可用（隐私模式 / node 测试未注入）
  | 'count-limit' // 保存后总数 > USER_TEMPLATES_MAX_COUNT
  | 'size-limit' // 保存后总载荷 > USER_TEMPLATES_MAX_TOTAL_CHARS
  | 'quota'; // setItem 抛错（含 QuotaExceededError）

export type UserTemplateSaveResult = { ok: true } | { ok: false; reason: UserTemplateSaveFailure };

/** 持久化条目形态（TemplatePayload 的存储投影：builtin 恒 false 不落盘） */
interface StoredUserTemplate {
  id: string;
  name: string;
  scene: SceneData;
}

/** 默认 storage：浏览器 localStorage；不可用（隐私模式/测试环境）返回 null */
function defaultStorage(): TemplateStorage | null {
  try {
    if (typeof globalThis.localStorage !== 'undefined') {
      const ls = globalThis.localStorage;
      return {
        getItem: (k) => ls.getItem(k),
        setItem: (k, v) => ls.setItem(k, v),
        removeItem: (k) => ls.removeItem(k),
      };
    }
  } catch {
    /* 访问 localStorage 本身可能抛错（部分隐私模式） */
  }
  return null;
}

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** 单条载荷结构守卫：id/名字符串合法 + scene 为 v2 SceneData 粗粒度结构 */
function sanitizeEntry(raw: unknown): StoredUserTemplate | null {
  if (!isPlainRecord(raw)) return null;
  const id = typeof raw.id === 'string' ? raw.id : '';
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (id === '' || name === '') return null;
  const scene = raw.scene;
  if (
    !isPlainRecord(scene) ||
    scene.version !== '2.0' ||
    !Array.isArray(scene.layers) ||
    !Array.isArray(scene.objects)
  ) {
    return null;
  }
  return { id, name, scene: scene as unknown as SceneData };
}

/** 读原始条目表（损坏 JSON / 非数组 → 空表；逐条 sanitize 在 list 路径执行） */
function readRawList(storage: TemplateStorage): unknown[] {
  try {
    const raw = storage.getItem(USER_TEMPLATES_STORAGE_KEY);
    if (typeof raw !== 'string' || raw === '') return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** 读取用户模板清单：损坏条目静默跳过（storage 不可用 → 空清单） */
export function listUserTemplates(
  storage: TemplateStorage | null = defaultStorage(),
): TemplatePayload[] {
  if (!storage) return [];
  const entries: TemplatePayload[] = [];
  for (const raw of readRawList(storage)) {
    const entry = sanitizeEntry(raw);
    if (entry === null) continue;
    entries.push({ id: entry.id, name: entry.name, builtin: false, scene: entry.scene });
  }
  return entries;
}

/** 条目 serialize 后字符串 length（容量口径：全表合计） */
function serializedLength(entry: StoredUserTemplate): number {
  return JSON.stringify(entry).length;
}

/**
 * 保存用户模板：重名覆盖（同名旧条目移除后写入新条目，id 重新生成）；
 * 容量两路在写入前判定（count 优先）；写入失败（配额等）→ 'quota'。
 */
export function saveUserTemplate(
  name: string,
  scene: SceneData,
  storage: TemplateStorage | null = defaultStorage(),
): UserTemplateSaveResult {
  const trimmed = name.trim();
  if (trimmed === '') return { ok: false, reason: 'invalid-name' };
  if (!storage) return { ok: false, reason: 'storage-unavailable' };

  const existing = readRawList(storage)
    .map((raw) => sanitizeEntry(raw))
    .filter((e): e is StoredUserTemplate => e !== null)
    .filter((e) => e.name !== trimmed); // 重名覆盖：旧同名条目丢弃
  const next: StoredUserTemplate[] = [
    ...existing,
    { id: createId('tpl'), name: trimmed, scene: deepClone(scene) },
  ];

  if (next.length > USER_TEMPLATES_MAX_COUNT) return { ok: false, reason: 'count-limit' };
  const totalChars = next.reduce((sum, entry) => sum + serializedLength(entry), 0);
  if (totalChars > USER_TEMPLATES_MAX_TOTAL_CHARS) return { ok: false, reason: 'size-limit' };

  try {
    storage.setItem(USER_TEMPLATES_STORAGE_KEY, JSON.stringify(next));
    return { ok: true };
  } catch {
    return { ok: false, reason: 'quota' };
  }
}

/** 重命名：未知 id / 空名 / storage 不可用 → false；改到既有名 → 覆盖合并（不产生重名） */
export function renameUserTemplate(
  id: string,
  name: string,
  storage: TemplateStorage | null = defaultStorage(),
): boolean {
  const trimmed = name.trim();
  if (!storage || trimmed === '') return false;
  const entries = readRawList(storage)
    .map((raw) => sanitizeEntry(raw))
    .filter((e): e is StoredUserTemplate => e !== null);
  const target = entries.find((e) => e.id === id);
  if (!target) return false;
  target.name = trimmed;
  const next = entries.filter((e) => e.id === id || e.name !== trimmed);
  try {
    storage.setItem(USER_TEMPLATES_STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

/** 删除：未知 id → false；清空后移除存储键 */
export function deleteUserTemplate(
  id: string,
  storage: TemplateStorage | null = defaultStorage(),
): boolean {
  if (!storage) return false;
  const entries = readRawList(storage)
    .map((raw) => sanitizeEntry(raw))
    .filter((e): e is StoredUserTemplate => e !== null);
  if (!entries.some((e) => e.id === id)) return false;
  const next = entries.filter((e) => e.id !== id);
  try {
    if (next.length === 0) storage.removeItem(USER_TEMPLATES_STORAGE_KEY);
    else storage.setItem(USER_TEMPLATES_STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}
