/**
 * ui/panels/inspectorModel —— Inspector 分组模型纯函数（T5.4；T6.6 增 region 四分组分派；
 * T7.1 空态升级为模式引导卡）。
 *
 * 职责：对象 → 折叠分组清单——RegionObject（type 'region'）走 sectionsForRegion 四分组
 *      「基础信息 / 几何 / 业务类型 / 表现样式」+ 变换组（T6.6，模型见 regionInspectorModel）；
 *      其余对象（model 等）沿用通用组 Transform / Metadata / Advanced（T6.7：旧要素
 *      Element 专属的 Appearance / 类型参数分组已随旧要素体系删除，字段描述符仅保留
 *      region 四分组在用的四种 + 资产引用 asset-ref——model 对象资产引用展示属资产库
 *      模式 UX，挂 Metadata 组（T6.7 回归恢复，不复活旧要素分组））；多选汇总
 *      （N 个对象 · 类型分布）；三态判别与空态文案（T7.1：空态主体 = 模式引导卡
 *      ModeGuideCard，inspectorGuideFor 数据驱动，INSPECTOR_EMPTY.hint 保留为卡下
 *      选择提示）；折叠分组键约定。
 * 边界：纯数据/纯逻辑，零渲染零 React；region 判别经 domain isRegionObject（结构化，
 *      不依赖散落 type 字面量）；ui 层只依赖 core/scene/domain（分层 DAG）。
 */
import type { ID } from '../../core/types';
import { isRegionObject } from '../../domain/regions';
import type { SceneObject } from '../../scene/SceneObject';
import { isGroupObject } from '../../scene/GroupObject';
import type { WorkModeGuide, WorkModeId } from '../tools/toolIA';
import { workModeOf } from '../tools/toolIA';
import { DEFAULT_TYPE_LABELS } from './outlinerModel';
import { sectionsForRegion } from './regionInspectorModel';

// ── 分组清单 ────────────────────────────────────────────────

/**
 * 分组 id（固定组序 = 呈现序）：region 四分组（基础信息/几何/业务类型/表现样式，
 * T6.6）+ 变换组收尾；通用组 Metadata / Advanced（model 等非 region 对象走
 * Transform / Metadata / Advanced）；多选批量编辑组（T7.5：通用公共字段 + 同语义
 * region 追加的业务类型/表现样式/几何基准高度）。
 */
export type InspectorSectionId =
  | 'region-basic'
  | 'region-geometry'
  | 'region-semantic'
  | 'region-style'
  | 'transform'
  | 'metadata'
  | 'advanced'
  | 'multi-common'
  | 'multi-semantic'
  | 'multi-style'
  | 'multi-geometry';

/**
 * 类型参数字段：控件描述符（可渲染的最小描述，测试断言基准）。
 * T6.7：旧要素属性控件（property-number/boolean/text）与派生/坐标的旧要素消费路径
 * 已随旧要素删除——保留 region 四分组在用的四种（几何参数/基准高度/派生只读/坐标）
 * + 资产引用（asset-ref，model 对象挂 Metadata 组，名称由组件经 AssetRegistry 解析）
 * + 变体 seed 只读（variant-seed，model 对象 asset.seed 存在时同组追加，T002.3）。
 */
export type InspectorParamField =
  | {
      /** 参数化形状参数（RegionObject 矩形长宽/圆半径/椭圆两半轴）：经 domain shapeConvert 重生成点列 + options（→ ChangeShapeCommand，T6.6） */
      kind: 'shape-param-number';
      key: string;
      label: string;
      value: number;
      precision: number;
      step: number;
      min?: number;
      unit?: string;
    }
  | {
      /** 基准高度（RegionObject shape.baseHeight，点列原样整体替换；与变换组位置 Y 两层叠加生效，分域契约 §A，T6.6） */
      kind: 'base-height-number';
      key: 'baseHeight';
      label: string;
      value: number;
      precision: number;
      step: number;
      min?: number;
      unit?: string;
    }
  | {
      /** 几何派生只读（面积 / 长度 / 周长 / 顶点数） */
      kind: 'derived-number';
      key: string;
      label: string;
      value: number;
      precision: number;
      unit: string;
    }
  | {
      /** 点位坐标只读（x / 世界 z） */
      kind: 'coord';
      key: string;
      label: string;
      x: number;
      y: number;
    }
  | {
      /** 模型资产引用只读（名称由组件经 AssetRegistry 解析；T6.7 回归恢复） */
      kind: 'asset-ref';
      key: string;
      label: string;
      assetId: string;
    }
  | {
      /** 烘焙式变体 seed 只读（model 对象 asset.seed，程序化资产放置掷出；T002.3——不做变体编辑） */
      kind: 'variant-seed';
      key: 'seed';
      label: string;
      seed: number;
    };

/** 一个折叠分组（组头 28px 条 + 可折叠体） */
export interface InspectorSection {
  id: InspectorSectionId;
  /** 组头显示名（小型大写样式由 CSS 承担） */
  label: string;
  /** 组头右侧只读附注（单位制 / 几何类型） */
  hint?: string;
  /** 字段（region-geometry 组与 metadata 组（model 资产行）携带） */
  fields?: InspectorParamField[];
}

/** sectionsFor 选项 */
export interface SectionsOptions {
  /** 类型 → 中文名（兜底 DEFAULT_TYPE_LABELS → 原始 type 串；多选汇总消费） */
  typeLabels?: Readonly<Record<string, string>>;
}

/** 类型中文名（注入表优先 → 兜底表 → 原始 type 串） */
function typeLabelOf(type: string, labels?: Readonly<Record<string, string>>): string {
  return labels?.[type] ?? DEFAULT_TYPE_LABELS[type] ?? type;
}

/** 结构化判别：具备资产引用即模型对象（ModelObject）；返回 assetId 或 null */
export function assetIdOf(obj: SceneObject): string | null {
  const asset = (obj as { asset?: { assetId?: unknown } }).asset;
  return typeof asset?.assetId === 'string' ? asset.assetId : null;
}

/** 结构化判别：model 对象携带的烘焙式变体 seed（T002.3）；无数值 seed 返回 undefined */
export function variantSeedOf(obj: SceneObject): number | undefined {
  const seed = (obj as { asset?: { seed?: unknown } }).asset?.seed;
  return typeof seed === 'number' && Number.isFinite(seed) ? seed : undefined;
}

/**
 * 对象 → 折叠分组清单。RegionObject（结构判别 isRegionObject）→ 四分组模型
 * sectionsForRegion（T6.6）；组壳（isGroupObject，T8.5）→ 通用组且变换只读注记
 * （纯组织节点不传变换）；其余对象（model 等）走通用组（组序固定：Transform 置顶，
 * Metadata/Advanced 收尾）。model 对象（assetIdOf 命中）的 Metadata 组携带资产引用
 * 只读行（asset-ref，T6.7 回归恢复）与变体 seed 只读行（variant-seed，T002.3——
 * asset.seed 存在时追加，不做变体编辑）。
 */
export function sectionsFor(obj: SceneObject, _opts?: SectionsOptions): InspectorSection[] {
  if (isRegionObject(obj)) return sectionsForRegion(obj); // T6.6：region 四分组分派
  const assetId = assetIdOf(obj);
  const isGroup = isGroupObject(obj);
  const fields: InspectorParamField[] = [];
  if (assetId !== null) {
    fields.push({ kind: 'asset-ref', key: 'asset', label: '资产', assetId });
    const seed = variantSeedOf(obj);
    if (seed !== undefined) fields.push({ kind: 'variant-seed', key: 'seed', label: '变体 Seed', seed });
  }
  return [
    {
      id: 'transform',
      label: '变换',
      hint: isGroup ? '纯组织节点 · 只读' : 'm · deg', // T8.5：组不传变换
    },
    {
      id: 'metadata',
      label: '元数据',
      ...(fields.length > 0 ? { fields } : {}),
    },
    { id: 'advanced', label: '高级' },
  ];
}

// ── 多选汇总 ────────────────────────────────────────────────

/** 类型分布条目 */
export interface SelectionTypeCount {
  type: string;
  label: string;
  count: number;
}

/** 多选汇总（只读汇总条数据） */
export interface SelectionSummary {
  count: number;
  /** 按首次出现序（稳定，无类型字面量） */
  distribution: SelectionTypeCount[];
}

/** 对象列表 → 多选汇总（N 个对象 · 类型分布） */
export function describeSelection(
  objects: readonly SceneObject[],
  opts?: SectionsOptions,
): SelectionSummary {
  const order: string[] = [];
  const counts = new Map<string, number>();
  for (const obj of objects) {
    const count = counts.get(obj.type) ?? 0;
    counts.set(obj.type, count + 1);
    if (count === 0) order.push(obj.type);
  }
  return {
    count: objects.length,
    distribution: order.map((type) => ({
      type,
      label: typeLabelOf(type, opts?.typeLabels),
      count: counts.get(type)!,
    })),
  };
}

// ── 三态与空态 ──────────────────────────────────────────────

/** Inspector 内容三态（空 / 单选分组面板 / 多选只读汇总） */
export type InspectorMode = 'empty' | 'single' | 'multi';

/** 选中集 → 三态判别 */
export function inspectorMode(selectedIds: readonly ID[]): InspectorMode {
  if (selectedIds.length === 0) return 'empty';
  if (selectedIds.length === 1) return 'single';
  return 'multi';
}

/** 空态文案（需求 15.2：仅选择引导，禁止系统设置混入；T7.1 起空态主体为模式引导卡） */
export const INSPECTOR_EMPTY = {
  title: '暂无选中对象',
  hint: '请在场景中选择一个对象',
} as const;

/**
 * 空态模式引导（T7.1 联动 4）：显示模式 → 引导卡文案（模式说明 + 快速开始）。
 * 文案单一真相源 = toolIA.MODES.inspectorGuide；无选中时 Inspector「对象属性」标签
 * 渲染 ModeGuideCard（纯展示组件，随模式切换更新）。
 */
export function inspectorGuideFor(mode: WorkModeId): WorkModeGuide {
  return workModeOf(mode).inspectorGuide;
}

// ── 折叠分组键（workspaceStore.collapsedSections 记账约定）──

/** 分组键：inspector.<sectionId>（与 PanelFrame 分区键「区域.面板」命名空间隔离）。
 *  T8.3：参数放宽为 string——多选分节使用动态 id（multi-region-<semanticType>），
 *  沿同组键约定记账；固定分组 id（InspectorSectionId）仍为其子集。 */
export function inspectorSectionKey(sectionId: string): string {
  return `inspector.${sectionId}`;
}
