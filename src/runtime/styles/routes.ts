/**
 * runtime/styles/routes —— 构建路由注册表（「双轨注册」之构建函数轨，T6.2）。
 *
 * 职责：import.meta.glob 扫描插件文件（src/runtime/styles/<分类>/<name>.preset.ts，
 *      同文件导出 meta 与 build）建立 presetId → build 映射；模块处理规则（一致性守门依据）：
 *      - meta + build 齐备 → 建立路由 + 收割 meta（bootstrap 注册进 StylePresetRegistry）；
 *      - meta 无 build    → 只收割 meta（注册表有条目、路由缺失 → UI 灰显禁用 + Toast，
 *                            isPresetBuildable 判定假；engine 创建走降级兜底）；
 *      - build 无 meta    → 不注册不暴露（无 id 可路由；engine 侧创建仍可经
 *                            registerBuildRoute seam 注入，天然不进注册表收割清单）；
 *      - 非法模块（缺 id / 空模块）→ 跳过并 console.warn（开发期可见，不阻塞启动）。
 * 边界：本表只存构建函数与 meta 纯数据，**永不进入 registries 层**（DAG 禁止
 *      registries→runtime）；registries 层 StylePresetRegistry 永不含构建函数。
 * seam：registerBuildRoute / unregisterBuildRoute 供测试与动态注册注入临时预设，
 *      不依赖文件系统扫描（vitest 原生支持 import.meta.glob）。
 */
import type { StylePresetMeta } from '../../registries';
import type { StylePresetBuild, StylePresetPluginModule } from './types';

/** 一条路由记录：构建函数 + 同文件 meta（meta 可缺——seam 注入的裸 build） */
interface RouteEntry {
  meta?: StylePresetMeta;
  build: StylePresetBuild;
}

/** presetId → 路由（仅构建函数 + meta 纯数据） */
const routes = new Map<string, RouteEntry>();

/** 插件文件收割的全部 meta（bootstrap eager 注册进 StylePresetRegistry 的数据源） */
const pluginMetas: StylePresetMeta[] = [];

/** 校验未知值是否为合法 StylePresetMeta（防御反序列化/手写模块漏字段） */
function isPresetMeta(value: unknown): value is StylePresetMeta {
  return typeof value === 'object' && value !== null && typeof (value as { id?: unknown }).id === 'string' && (value as { id: string }).id !== '';
}

/** 校验未知值是否为合法构建函数 */
function isPresetBuild(value: unknown): value is StylePresetBuild {
  return typeof value === 'function';
}

/**
 * 处理单个插件模块（glob 扫描与测试共用）：按文件头注释的一致性规则分派。
 * 返回是否建立了路由。
 */
export function registerPresetModule(mod: unknown): boolean {
  if (typeof mod !== 'object' || mod === null) return false;
  const { meta, build } = mod as StylePresetPluginModule;
  if (!isPresetMeta(meta)) {
    if (isPresetBuild(build)) console.warn('[style-routes] 插件模块缺合法 meta（build 无 meta 不注册不暴露）:', mod);
    return false;
  }
  if (!isPresetBuild(build)) {
    // meta 无 build：注册表有条目但路由缺失（UI 灰显判定 isPresetBuildable === false）
    if (!routes.has(meta.id)) pluginMetas.push(meta);
    return false;
  }
  if (routes.has(meta.id)) {
    console.warn(`[style-routes] 插件预设重复注册，跳过: ${meta.id}`);
    return false;
  }
  routes.set(meta.id, { meta, build });
  pluginMetas.push(meta);
  return true;
}

// ── 注入 seam（测试 / 动态注册；不进收割清单）────────────────

/** 注册构建路由；重复注册同 id 抛错（对齐注册表惯例）；meta 可选（无 meta 时 engine 跳过形状校验与参数合并） */
export function registerBuildRoute(id: string, build: StylePresetBuild, meta?: StylePresetMeta): void {
  if (typeof id !== 'string' || id === '') throw new Error('构建路由缺少合法 id');
  if (routes.has(id)) throw new Error(`构建路由已注册，禁止重复注册: ${id}`);
  routes.set(id, { meta, build });
}

/** 注销构建路由（测试清理）；未注册时静默 */
export function unregisterBuildRoute(id: string): void {
  routes.delete(id);
}

/** 取构建函数；未注册返回 undefined */
export function getBuildRoute(id: string): StylePresetBuild | undefined {
  return routes.get(id)?.build;
}

/** 路由是否存在（含裸 build 注入）；isPresetBuildable 的底层判定 */
export function hasBuildRoute(id: string): boolean {
  return routes.has(id);
}

/** 取路由携带的 meta；未注册或裸 build 返回 undefined */
export function getRouteMeta(id: string): StylePresetMeta | undefined {
  return routes.get(id)?.meta;
}

/** 全部已路由 presetId（含 seam 注入；测试/一致性比对用） */
export function listBuildRouteIds(): string[] {
  return [...routes.keys()];
}

// ── 一致性判定（UI 灰显 / 守门测试）────────────────────────

/** 预设是否可创建（存在构建路由）；ui 灰显判定数据源（T6.5/T6.6 消费） */
export function isPresetBuildable(id: string): boolean {
  return routes.has(id);
}

/** 双向一致性差异（测试锁定）：missingBuild = 灰显+Toast 名单；missingMeta = 不暴露名单 */
export interface PresetConsistencyReport {
  /** meta 有、build 无 → UI 灰显禁用 + Toast 提示 */
  missingBuild: string[];
  /** build 有、meta 无 → 不注册不暴露（注册表收割源自 meta，天然不出现） */
  missingMeta: string[];
}

/** 比对注册表 meta id 集与路由 id 集，产出双向差异（纯函数） */
export function diffPresetConsistency(
  metaIds: readonly string[],
  buildIds: readonly string[],
): PresetConsistencyReport {
  const metaSet = new Set(metaIds);
  const buildSet = new Set(buildIds);
  return {
    missingBuild: metaIds.filter((id) => !buildSet.has(id)),
    missingMeta: buildIds.filter((id) => !metaSet.has(id)),
  };
}

// ── 收割出口（bootstrap 装配）──────────────────────────────

/** 全部插件文件 meta 的浅拷贝列表（保持文件扫描顺序；重复 id 只收首个） */
export function collectPresetPluginMetas(): StylePresetMeta[] {
  return [...pluginMetas];
}

// ── 启动扫描（eager glob：模块加载即收割，无异步竞态）──────
// 约定：插件文件命名 src/runtime/styles/<分类>/<name>.preset.ts（一预设一文件）
const pluginModules = import.meta.glob<StylePresetPluginModule>('./**/*.preset.ts', { eager: true });
for (const mod of Object.values(pluginModules)) registerPresetModule(mod);
