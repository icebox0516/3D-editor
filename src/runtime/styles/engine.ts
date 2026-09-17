/**
 * runtime/styles/engine —— 样式引擎统一入口（纯函数形态，T6.2）。
 *
 * 职责（分域契约 §C）：
 *   createStyle(geometry, shapeType, semanticType, presetId, overrides?, semanticProperties?)
 *     校验（presetId 在路由、supportedShapes 含 shapeType）→ 参数合并（meta 默认值 ← overrides，
 *     number 钳制 / 类型不符回退默认——语义沿 v1 resolveStyle 先例，现存实现在 params 模块）→ 保留键 semantic 并入
 *     （semanticProperties 缺省 {}）→ 构建路由 → build → 材质策略（模板共享/独享）；
 *     三类失败（路由缺失 / 形状不支持 / build 抛错）一律降级 default_solid 重建实例 + 经注入
 *     通知通道发 Toast（EventMap 'app:notify'，2026-09-11 增补），不崩溃。
 *   updateStyle(instance, params)：增量覆写（未提及参数保持上次值）→ 写时复制提升 → instance.update；
 *   disposeStyle(instance)：插件自建资源释放 + 材质归置（独享直释 / 模板引用计数）。
 *
 * 资源归属（几何与材质，代码级注明）：
 *   - 几何：归调用方（T6.4 RegionRenderer）——createStyle 传入、setGeometry 重绑，
 *     引擎与插件均不释放（含 disposeStyle 路径）；
 *   - 材质：归引擎——无覆写实例共享 presetId 模板（materialPool，默认参数形态、
 *     无 params 签名维度——带覆写实例从不入池，见 materialPool 头注）；
 *     带有效覆写（保留键 semantic 除外）的实例独享材质；
 *     updateStyle 对共享模板实例改参数先提升为 clone（写时复制——禁止共享材质被单对象改写）；
 *     disposeStyle 引用计数释放，最后一个实例释放才 dispose 模板本体。
 *
 * 状态说明：契约称「纯函数无状态」指不持有调用间会话状态、可独立并发调用；
 *   引擎持有的三类模块级结构（通知通道、实例簿记 WeakMap、材质模板池）均为
 *   基础设施缓存而非业务状态。通知通道经 setStyleNotifier 注入（组合根接到
 *   eventBus.emit('app:notify')），引擎不依赖 EventBus（保持 runtime 零事件耦合）。
 */
import type * as THREE from 'three';
import type { SemanticType, ShapeType } from '../../domain/regions';
import { build as defaultSolidBuild, meta as defaultSolidMeta } from './base/default_solid.preset';
import { getTemplate, releaseTemplate, retainTemplate, setTemplate } from './materialPool';
import { resolvePresetParams } from './params';
import { getBuildRoute, getRouteMeta } from './routes';
import type { StyleInstance } from './types';

/** 降级兜底预设 id（与 domain semanticDefinitions.defaultPresetId 过渡期基线一致） */
export const FALLBACK_PRESET_ID = defaultSolidMeta.id;

// ── 通知通道（注入式；组合根 → eventBus 'app:notify'，测试 → spy）──

export interface StyleNotice {
  message: string;
  kind?: 'info' | 'warn' | 'error';
}

export type StyleNotifier = (notice: StyleNotice) => void;

let notifier: StyleNotifier | null = null;

/** 注入/替换/清空通知通道（null = 静默） */
export function setStyleNotifier(fn: StyleNotifier | null): void {
  notifier = fn;
}

/** 条件清除：仅当当前通道是自己时清除（多编辑器实例共存不误伤，bootstrap dispose 用） */
export function clearStyleNotifier(fn: StyleNotifier): void {
  if (notifier === fn) notifier = null;
}

function notify(message: string, kind: 'info' | 'warn' | 'error' = 'warn'): void {
  if (!notifier) return;
  try {
    notifier({ message, kind });
  } catch {
    // 通知通道自身故障不波及引擎主流程
  }
}

// ── 实例簿记（WeakMap：实例 → 材质归属 + 上次覆写）──────────

interface InstanceRecord {
  presetId: string;
  /** 当前材质是否为共享模板（true：dispose/update 走引用计数/写时复制路径） */
  sharesTemplate: boolean;
  /** 上次生效的用户覆写（updateStyle 增量合并基底；不含保留键 semantic） */
  lastOverrides: Record<string, unknown>;
}

const records = new WeakMap<StyleInstance, InstanceRecord>();

/** 剥离保留键 semantic（引擎专管语义属性通路，用户覆写不得伪造） */
function omitReserved(overrides?: Record<string, unknown>): Record<string, unknown> {
  if (typeof overrides !== 'object' || overrides === null) return {};
  const { semantic: _reserved, ...rest } = overrides;
  return rest;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** 把材质换绑到实例与根对象材质槽位（Mesh/Line/Points；Group 根无槽位则只改簿记面） */
function bindMaterial(instance: StyleInstance, material: THREE.Material): void {
  instance.material = material;
  const obj = instance.object as THREE.Object3D & { material?: unknown };
  if (obj && 'material' in obj) obj.material = material;
}

/**
 * 材质策略（创建时）：
 *   有效覆写（保留键除外）非空 → 独享插件自建材质；
 *   否则 → 共享模板：首个实例的材质即模板本体，后续实例弃用插件新材质改绑模板并释放前者。
 * 返回是否落在共享模板上。
 */
function applyMaterialPolicy(instance: StyleInstance, presetId: string, effective: Record<string, unknown>): boolean {
  if (Object.keys(effective).length > 0) return false; // 独享：clone 语义由插件全参构建体现
  const template = getTemplate(presetId);
  if (!template) {
    setTemplate(presetId, instance.material);
    return true;
  }
  const fresh = instance.material; // 弃用本次插件新材质（与模板同构：同为默认参数构建产物）
  bindMaterial(instance, template.material);
  fresh.dispose();
  retainTemplate(presetId);
  return true;
}

/** 写时复制提升：共享实例改参数前克隆模板为独享材质，模板引用计数 -1 */
function promoteToClone(instance: StyleInstance, record: InstanceRecord): void {
  const template = getTemplate(record.presetId);
  if (template) {
    const clone = template.material.clone();
    bindMaterial(instance, clone);
    releaseTemplate(record.presetId);
  }
  record.sharesTemplate = false; // 模板记录缺失（不变量破坏）时退化为独享，保底可用
}

// ── 引擎入口 ───────────────────────────────────────────────

/**
 * 创建样式实例。
 * semanticType 仅用于降级提示上下文（supportedSemantics 为 UI 过滤显示用，不参与引擎校验）；
 * semanticProperties 缺省 {}，经保留键 semantic 并入 build 参数（building 预设读
 * params.semantic.height 挤出——参数通路 2026-09-11 审计定稿）。
 */
export function createStyle(
  geometry: THREE.BufferGeometry,
  shapeType: ShapeType,
  semanticType: SemanticType,
  presetId: string,
  overrides?: Record<string, unknown>,
  semanticProperties?: Record<string, unknown>,
): StyleInstance {
  const build = getBuildRoute(presetId);
  if (!build) {
    notify(`样式预设不存在或未注册构建器（${presetId}），已回退默认实体样式`, 'warn');
    return buildFallback(geometry);
  }
  const meta = getRouteMeta(presetId);
  if (meta && !meta.supportedShapes.includes(shapeType)) {
    notify(`样式预设 ${presetId} 不支持形状「${shapeType}」（语义 ${semanticType}），已回退默认实体样式`, 'warn');
    return buildFallback(geometry);
  }

  const effective = omitReserved(overrides);
  const params: Record<string, unknown> = meta
    ? { ...resolvePresetParams(meta.defaultParams, effective), semantic: semanticProperties ?? {} }
    : { ...effective, semantic: semanticProperties ?? {} }; // 裸 build（seam 注入无 meta）：透传原始参数

  let instance: StyleInstance;
  try {
    instance = build(geometry, params);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    notify(`样式预设 ${presetId} 构建失败（${reason}），已回退默认实体样式`, 'error');
    return buildFallback(geometry);
  }

  const sharesTemplate = applyMaterialPolicy(instance, presetId, effective);
  records.set(instance, { presetId, sharesTemplate, lastOverrides: effective });
  return instance;
}

/** 降级兜底：default_solid 静态导入直连（不依赖路由状态，恒可用）+ 默认参数 + 模板共享策略 */
function buildFallback(geometry: THREE.BufferGeometry): StyleInstance {
  const params = { ...resolvePresetParams(defaultSolidMeta.defaultParams), semantic: {} };
  const instance = defaultSolidBuild(geometry, params);
  const sharesTemplate = applyMaterialPolicy(instance, FALLBACK_PRESET_ID, {});
  records.set(instance, { presetId: FALLBACK_PRESET_ID, sharesTemplate, lastOverrides: {} });
  return instance;
}

/**
 * 更新样式参数（只改参数/uniform，禁止重建几何——插件契约）。
 * 增量语义：本次 params 合并到上次覆写之上（未提及参数保持上次生效值），再对 meta
 * 默认值解析（钳制/类型回退）；透传 params.semantic（若为对象）对齐 createStyle 通路。
 * 共享模板实例先写时复制提升（禁共享材质被单对象改写），再委托 instance.update；
 * 引擎托管外的实例（非 createStyle 产物）直接透传。
 */
export function updateStyle(instance: StyleInstance, params: Record<string, unknown>): void {
  const record = records.get(instance);
  if (!record) {
    instance.update(params);
    return;
  }
  const effective = omitReserved(params);
  const merged: Record<string, unknown> = { ...record.lastOverrides, ...effective };
  const meta = getRouteMeta(record.presetId);
  const resolved: Record<string, unknown> = meta
    ? resolvePresetParams(meta.defaultParams, merged)
    : { ...merged };
  if (isPlainObject(params.semantic)) resolved.semantic = params.semantic;

  if (record.sharesTemplate) promoteToClone(instance, record);
  record.lastOverrides = merged;
  instance.update(resolved);
}

/**
 * 释放样式实例：
 *   1) 插件自建资源（instance.dispose——授权规则：不含材质与传入几何）；
 *   2) 材质归置——共享模板 → 引用计数 -1（最后一个实例释放才 dispose 模板本体）；
 *      独享材质 → 直接 dispose；非托管实例 → 全权交插件自身 dispose 纪律。
 * 几何恒不释放（归调用方，T6.4 RegionRenderer 创建并拥有）。
 */
export function disposeStyle(instance: StyleInstance): void {
  const record = records.get(instance);
  try {
    instance.dispose();
  } finally {
    if (record) {
      if (record.sharesTemplate) {
        releaseTemplate(record.presetId);
      } else {
        instance.material.dispose();
      }
      records.delete(instance);
    }
  }
}
