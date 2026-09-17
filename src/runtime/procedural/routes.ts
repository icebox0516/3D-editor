/**
 * runtime/procedural/routes —— 程序化资产构建路由注册表（T002.1，D17）。
 *
 * 职责：import.meta.glob 扫描插件文件（src/runtime/procedural/assets/<name>.asset.ts，
 *      同文件导出 meta 与 build）建立 assetId → build 映射；模块处理规则（一致性守门依据，
 *      与 styles 轨的差异点——程序化资产**没有「灰显占位」需求，破损文件就是破损**）：
 *      - meta + build 齐备 → 建立路由 + 收割 meta；
 *      - 缺 meta 或缺 build  → console.warn + 跳过（不建路由、不收割——半份文件无消费价值）；
 *      - 重复 id            → console.warn + 跳过（首个生效）；
 *      - 非法模块（非对象 / meta 缺 id）→ console.warn + 跳过（开发期可见，不阻塞启动）。
 * 边界：本表只存 build 函数与 meta 纯数据，**永不进入 registries 层**（DAG 禁止
 *      registries→runtime）；meta 经 collectProceduralAssetMetas 由组合根（bootstrap）
 *      灌入 AssetRegistry（kind:'procedural'），注册表永不含构建函数。
 * seam：registerProceduralRoute / unregisterProceduralRoute 供测试与动态注册注入临时资产，
 *      不依赖文件系统扫描（vitest 原生支持 import.meta.glob）、不进收割清单。
 */
import type { ProceduralAssetMeta } from '../../domain/assets';
import type { ProceduralAssetModule, ProceduralBuild } from './types';

/** 一条路由记录：构建函数 + 同文件 meta（meta 可缺——seam 注入的裸 build） */
interface RouteEntry {
  meta?: ProceduralAssetMeta;
  build: ProceduralBuild;
}

/** assetId → 路由（仅构建函数 + meta 纯数据） */
const routes = new Map<string, RouteEntry>();

/** 插件文件收割的全部 meta（bootstrap 灌入 AssetRegistry 的数据源） */
const pluginMetas: ProceduralAssetMeta[] = [];

/** 校验未知值是否为合法 ProceduralAssetMeta（防御手写模块漏字段） */
function isAssetMeta(value: unknown): value is ProceduralAssetMeta {
  return typeof value === 'object' && value !== null && typeof (value as { id?: unknown }).id === 'string' && (value as { id: string }).id !== '';
}

/** 校验未知值是否为合法构建函数 */
function isAssetBuild(value: unknown): value is ProceduralBuild {
  return typeof value === 'function';
}

/**
 * 处理单个插件模块（glob 扫描与测试共用）：按文件头注释的一致性规则分派。
 * 返回是否建立了路由。与 styles 轨不同：缺一即整体跳过，不收割 meta。
 */
export function registerProceduralModule(mod: unknown): boolean {
  if (typeof mod !== 'object' || mod === null) {
    console.warn('[procedural-routes] 非法资产模块（非对象），跳过:', mod);
    return false;
  }
  const { meta, build } = mod as ProceduralAssetModule;
  if (!isAssetMeta(meta)) {
    console.warn('[procedural-routes] 资产模块缺合法 meta（缺一即跳过）:', mod);
    return false;
  }
  if (!isAssetBuild(build)) {
    console.warn(`[procedural-routes] 资产模块缺 build（缺一即跳过）: ${meta.id}`);
    return false;
  }
  if (routes.has(meta.id)) {
    console.warn(`[procedural-routes] 程序化资产重复注册，跳过: ${meta.id}`);
    return false;
  }
  routes.set(meta.id, { meta, build });
  pluginMetas.push(meta);
  return true;
}

// ── 注入 seam（测试 / 动态注册；不进收割清单）────────────────

/** 注册构建路由；重复注册同 id 抛错（对齐注册表惯例）；meta 可选（裸 build） */
export function registerProceduralRoute(id: string, build: ProceduralBuild, meta?: ProceduralAssetMeta): void {
  if (typeof id !== 'string' || id === '') throw new Error('程序化路由缺少合法 id');
  if (routes.has(id)) throw new Error(`程序化路由已注册，禁止重复注册: ${id}`);
  routes.set(id, { meta, build });
}

/** 注销构建路由（测试清理）；未注册时静默 */
export function unregisterProceduralRoute(id: string): void {
  routes.delete(id);
}

/** 取构建函数；未注册返回 undefined */
export function getProceduralBuild(id: string): ProceduralBuild | undefined {
  return routes.get(id)?.build;
}

/** 取路由所存 meta 纯数据（T008.1：源缓存槽路由读 shapeFamily 声明）；
 *  未注册或 seam 裸 build 注入（无 meta）返回 undefined */
export function getProceduralMeta(id: string): ProceduralAssetMeta | undefined {
  return routes.get(id)?.meta;
}

/** 路由是否存在（含裸 build 注入） */
export function hasProceduralRoute(id: string): boolean {
  return routes.has(id);
}

// ── 收割出口（bootstrap 装配）──────────────────────────────

/** 全部插件文件 meta 的浅拷贝列表（保持文件扫描顺序；重复 id 只收首个） */
export function collectProceduralAssetMetas(): ProceduralAssetMeta[] {
  return [...pluginMetas];
}

// ── 启动扫描（eager glob：模块加载即收割，无异步竞态）──────
// 约定：插件文件命名 src/runtime/procedural/assets/<name>.asset.ts（一资产一文件）
const pluginModules = import.meta.glob<ProceduralAssetModule>('./assets/**/*.asset.ts', { eager: true });
for (const mod of Object.values(pluginModules)) registerProceduralModule(mod);
