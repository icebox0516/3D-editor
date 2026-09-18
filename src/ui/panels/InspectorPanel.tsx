/**
 * ui/panels/InspectorPanel —— 右面板三标签检查器（T5.4）。
 *
 * 职责：右面板收编为「对象属性 | 环境设置 | 全局设置」三标签（需求第十六章）——
 *   对象属性：按 inspectorModel.sectionsFor 产出折叠分组（region 四分组
 *     「基础信息/几何/业务类型/表现样式」+ 变换组，T6.6；model 等其余对象走
 *     变换/元数据/高级通用组，T6.7）——组头 28px 条 + ▸ 展开指示，
 *     折叠态存 workspaceStore.collapsedSections（键 inspector.<section>，会话内持久、
 *     默认全展开、变换置顶）；空态净化为「暂无选中对象」引导（需求 15.2，
 *     无任何系统设置混入）；多选只读汇总（N 个对象 · 类型分布）+ Transform 只读
 *     显示首个值（P0 防误改；批量编辑归 T7.5）。
 *   环境设置：环境预设下拉（EnvironmentPanel 等价迁入，接线回调不变；渲染模式组
 *     归 T5.7，本任务不显示）。
 *   全局设置：网格显示/间距/尺寸（GridSettings 等价迁入，setGrid 链路不变）+
 *     Unit: m 只读行 + 操作偏好/编辑器行为 disabled 占位 + 快捷键项（经 actionId
 *     跳「帮助→快捷键」弹层）。
 * 边界：标签选择存 workspaceStore.inspectorTab（跨选变化保持 + 「设置」action 跳转
 *   目标）；对象数据一律按 sceneVersion 从门面重读（SceneManager 唯一数据源）；
 *   一切可见修改经 Command（变换→TransformCommand、样式/预设→ChangePresetCommand
 *   （批量经 BatchCommand 合一条历史）、类型/业务参数→ChangeSemanticCommand、形状→
 *   ChangeShapeCommand、名称/可见→UpdateObjectCommand、图层归属→ChangeLayerCommand）；
 *   无数据源字段 disabled 占位不做假数据（需求第十九章数据真相底线）。
 *   T6.7：旧要素 Element 分支（外观组/类型参数组 + v1 样式命令链路）已删。
 */
import { useEffect, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { degToRad } from '../../core/utils';
import type { Transform } from '../../core/types';
import {
  SHAPE_TYPES,
  applyParametricValue,
  convertShape,
  getSemanticDefinition,
  isRegionObject,
  isSemanticType,
  isShapeType,
} from '../../domain/regions';
import type { RegionObject, RegionShape, RegionStyle } from '../../domain/regions';
import type { SceneGrid } from '../../scene/SceneData';
import type { SceneObject } from '../../scene/SceneObject';
import { isGroupObject } from '../../scene/GroupObject';
import { BatchCommand } from '../../editor/commands/BatchCommand';
import { ChangeAssetSeedCommand } from '../../editor/commands/ChangeAssetSeedCommand';
import { ChangeLayerCommand } from '../../editor/commands/ChangeLayerCommand';
import { ChangePresetCommand } from '../../editor/commands/ChangePresetCommand';
import { ChangeSemanticCommand } from '../../editor/commands/ChangeSemanticCommand';
import { ChangeShapeCommand } from '../../editor/commands/ChangeShapeCommand';
import { TransformCommand } from '../../editor/commands/TransformCommand';
import { UpdateObjectCommand } from '../../editor/commands/UpdateObjectCommand';
import type { Command } from '../../editor/commands';
import type { EditorFacade } from '../../editor/EditorFacade';
import { ANGLE_STEP_PRESETS_DEG } from '../../editor/services/snapTiersConfig';
import { ColorInput } from '../components/ColorInput';
import { IconToggle } from '../components/IconToggle';
import { ModeGuideCard } from '../components/ModeGuideCard';
import { NumberSlider } from '../components/NumberSlider';
import { PanelFrame } from '../components/PanelFrame';
import { TabStrip } from '../components/TabStrip';
import { SHAPE_DRAW_LABELS, VERTEX_EDIT_TOOL_ID, toggleVertexEdit } from '../tools/toolIA';
import type { InspectorTabId } from '../layout/workspaceStore';
import { useWorkspaceStore } from '../layout/workspaceStore';
import { useEditorStore } from '../store';
import { NumberField } from './NumberField';
import { StyleParametersForm } from './StyleParametersForm';
import type { StyleApplyScope } from './StyleParametersForm';
import {
  INSPECTOR_EMPTY,
  assetIdOf,
  describeSelection,
  inspectorMode,
  inspectorSectionKey,
  sectionsFor,
  variantSeedOf,
} from './inspectorModel';
import type { InspectorParamField } from './inspectorModel';
import { DEFAULT_TYPE_LABELS, buildGroupToggleCommand } from './outlinerModel';
import {
  MIXED,
  batchBaseHeightCommand,
  batchLayerCommand,
  batchPresetCommand,
  batchPresetOverrideCommand,
  batchSemanticPropertyCommand,
  batchSemanticTypeCommand,
  convergePresetParams,
  multiEditFieldsOf,
  multiRegionSectionsOf,
} from './multiEditModel';
import type { MultiParamField, MultiRegionSection } from './multiEditModel';
import {
  REGION_STYLE_SCOPE_OPTIONS,
  REGION_TYPE_LABEL,
  presetOverrideUpdate,
  presetSeedUpdate,
  presetSelect,
  regionPresetOptions,
  resolvePresetValues,
  resolveRegionStyleTargets,
  semanticPropertyChange,
  semanticTypeChange,
  semanticTypeOptions,
  withTargetSeed,
} from './regionInspectorModel';
import { ScatterParamsForm } from './ScatterParamsForm';
import { resolveScatterSeed } from '../../domain/scatter';
import { resampleVariantTransform, rollVariantSeed } from '../../domain/assets';
import { Dices } from 'lucide-react';

const RAD_TO_DEG = 180 / Math.PI;

/** 三标签（对象属性 / 环境设置 / 全局设置） */
const TABS = [
  { id: 'object', label: '对象属性' },
  { id: 'environment', label: '环境设置' },
  { id: 'settings', label: '全局设置' },
] as const;

/** 环境预设选项（预设表由组合根提供；EnvironmentPanel 迁入） */
export interface EnvironmentOption {
  id: string;
  label: string;
}

interface InspectorPanelProps {
  /** 隐藏所在面板组（右列整组收起；恢复经上下文条开关）。由装配层注入 */
  onHideZone?: () => void;
  /** 环境设置标签：预设表（组合根 ENVIRONMENT_PRESETS） */
  environmentPresets: readonly EnvironmentOption[];
  /** 环境设置标签：当前预设 id（App 按 sceneVersion 重读） */
  environmentPreset: string;
  /** 环境设置标签：切换回调（App 接组合根 setEnvironment，不入历史） */
  onEnvironmentChange(presetId: string): void;
  /** 全局设置标签：当前网格配置（组合根 getGrid；null = 组合根未就绪） */
  grid: SceneGrid | null;
  /** 全局设置标签：应用回调（App 接组合根 setGrid） */
  onApplyGrid(grid: SceneGrid): void;
  /**
   * 全局设置标签「吸附」组配置快照（T7.6 → T8.1 分级扩项：网格/对象/角度/高度
   * 四分项 + 容差 + 角度步长；null = 组合根未就绪不显示该组）
   */
  snap: {
    gridSnapEnabled: boolean;
    objectSnapEnabled: boolean;
    objectSnapThreshold: number;
    angleSnapEnabled: boolean;
    angleSnapStepDeg: number;
    elevationSnapEnabled: boolean;
  } | null;
  /** 网格吸附分项（App 写 drawGrid.snapEnabled 共享对象——同时管辖绘制 G 网格） */
  onToggleGridSnap(): void;
  /** 对象吸附分项（App 写组合根 objectSnap.enabled 共享对象，即时生效） */
  onToggleObjectSnap(): void;
  /** 吸附容差提交（App 写 objectSnap.threshold，0.05..5 钳制归 App） */
  onObjectSnapThreshold(value: number): void;
  /** 角度吸附分项（App 写 snapTiers.angleEnabled，gizmo rotate 步进开关） */
  onToggleAngleSnap(): void;
  /** 角度步长提交（App 写 snapTiers.angleStepDeg，0.1..360 钳制归 App；度） */
  onAngleSnapStep(value: number): void;
  /** 高度吸附分项（App 写 snapTiers.elevationEnabled，gizmo Y 轴高度层开关） */
  onToggleElevationSnap(): void;
  /** 统一动作路由出口（快捷键项 → help.shortcuts 弹层）。由装配层注入 */
  onAction?(actionId: string): void;
}

export function InspectorPanel(props: InspectorPanelProps) {
  const facade = useEditorStore((s) => s.facade);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const sceneVersion = useEditorStore((s) => s.sceneVersion);
  void sceneVersion; // 订阅版本号：场景/对象/环境变更时重读

  const tab = useWorkspaceStore((s) => s.inspectorTab);
  const setInspectorTab = useWorkspaceStore((s) => s.setInspectorTab);

  const single =
    selectedIds.length === 1 && facade ? facade.scene.getObject(selectedIds[0]!) : undefined;

  /** 标题条附注：对象标签展示当前对象名 / 选中计数（其他标签无） */
  const titleExtra =
    tab !== 'object' ? null : selectedIds.length > 1 ? (
      <span className="ed-readout">{selectedIds.length} 选中</span>
    ) : single ? (
      <span className="ed-readout" title={single.name}>
        {single.name}
      </span>
    ) : null;

  return (
    <PanelFrame
      sectionKey="right.inspector"
      title="检查器"
      className="ed-panel--fill"
      titleExtra={titleExtra}
      onHide={props.onHideZone}
    >
      <TabStrip
        tabs={TABS}
        activeId={tab}
        onChange={(id) => setInspectorTab(id as InspectorTabId)}
        ariaLabel="右面板视图"
      />
      {tab === 'object' ? (
        <ObjectTab facade={facade} selectedIds={selectedIds} />
      ) : tab === 'environment' ? (
        <EnvironmentTab
          presets={props.environmentPresets}
          current={props.environmentPreset}
          onChange={props.onEnvironmentChange}
        />
      ) : (
        <SettingsTab
          grid={props.grid}
          onApplyGrid={props.onApplyGrid}
          snap={props.snap}
          onToggleGridSnap={props.onToggleGridSnap}
          onToggleObjectSnap={props.onToggleObjectSnap}
          onObjectSnapThreshold={props.onObjectSnapThreshold}
          onToggleAngleSnap={props.onToggleAngleSnap}
          onAngleSnapStep={props.onAngleSnapStep}
          onToggleElevationSnap={props.onToggleElevationSnap}
          onAction={props.onAction}
        />
      )}
    </PanelFrame>
  );
}

// ── 对象属性标签 ────────────────────────────────────────────

function ObjectTab({
  facade,
  selectedIds,
}: {
  facade: EditorFacade | null;
  selectedIds: readonly string[];
}) {
  const mode = inspectorMode(selectedIds);

  if (mode === 'empty' || !facade) return <EmptySelection facade={facade} />;

  if (mode === 'single') {
    const obj = facade.scene.getObject(selectedIds[0]!);
    if (!obj) {
      return (
        <div className="ed-empty">
          <strong>对象不存在</strong>
          已被删除或场景已重载
        </div>
      );
    }
    return <SingleObjectEditor facade={facade} obj={obj} />;
  }

  const objects = selectedIds
    .map((id) => facade.scene.getObject(id))
    .filter((o): o is SceneObject => o !== undefined);
  if (objects.length === 0) return <EmptySelection facade={facade} />;
  return <MultiSelection facade={facade} objects={objects} />;
}

/**
 * 空态（T7.1 联动 4）：门面就绪 → 模式引导卡（显示模式说明 + 快速开始，随模式切换
 * 更新，数据驱动纯展示）；未就绪 → 通用空态引导（需求 15.2：无系统设置混入）。
 */
function EmptySelection({ facade }: { facade: EditorFacade | null }) {
  if (facade !== null) return <ModeGuideCard />;
  return (
    <div className="ed-panel__body">
      <div className="ed-empty ed-inspector__empty">
        <span className="ed-inspector__empty-glyph" aria-hidden="true">
          ⌖
        </span>
        <strong>{INSPECTOR_EMPTY.title}</strong>
        {INSPECTOR_EMPTY.hint}
      </div>
    </div>
  );
}

/** 类型中文名注入表（注册表 label 优先；T6.7 注册表空表装配，兜底 DEFAULT_TYPE_LABELS） */
function typeLabelsOf(_facade: EditorFacade): Record<string, string> {
  return {};
}

/** 单选：折叠分组面板（sectionsFor 驱动；组体渲染按组 id 分派——region 四分组 / 通用组） */
function SingleObjectEditor({ facade, obj }: { facade: EditorFacade; obj: SceneObject }) {
  const sections = sectionsFor(obj, { typeLabels: typeLabelsOf(facade) });
  const region = isRegionObject(obj) ? obj : null;
  // T8.5：组壳为纯组织节点——Transform 只读（不传变换；成员批量操作走组行「选中组内对象」）
  const isGroup = isGroupObject(obj);

  return (
    <div className="ed-panel__body">
      {sections.map((section) => (
        <Group key={section.id} section={section}>
          {section.id === 'region-basic' && region ? (
            <RegionBasicBody facade={facade} region={region} />
          ) : section.id === 'region-geometry' && region ? (
            <RegionGeometryBody facade={facade} region={region} fields={section.fields ?? []} />
          ) : section.id === 'region-semantic' && region ? (
            <RegionSemanticBody facade={facade} region={region} />
          ) : section.id === 'region-style' && region ? (
            <RegionStyleBody facade={facade} region={region} />
          ) : section.id === 'transform' ? (
            <>
              <TransformBody facade={facade} obj={obj} editable={!isGroup} />
              {isGroup ? (
                <div className="ed-field">
                  <span className="ed-field__label">注记</span>
                  <div className="ed-field__value">
                    <span
                      className="ed-readout"
                      title="组为纯组织节点：不传递变换、不级联显隐；双击大纲组行可仅选中组内对象批量操作"
                    >
                      分组不传递变换 · 双击组行选中成员
                    </span>
                  </div>
                </div>
              ) : null}
            </>
          ) : section.id === 'metadata' ? (
            <MetadataBody facade={facade} obj={obj} fields={section.fields ?? []} />
          ) : (
            <AdvancedBody />
          )}
        </Group>
      ))}
    </div>
  );
}

/** 折叠分组：28px 组头（▸ 指示 + 小型大写标题 + 只读附注）+ 组体。
 *  section.id 放宽为 string（T8.3 多选分节动态 id：multi-region-<semanticType>）。 */
function Group({
  section,
  children,
}: {
  section: { id: string; label: string; hint?: string };
  children: ReactNode;
}) {
  const key = inspectorSectionKey(section.id);
  const collapsed = useWorkspaceStore((s) => s.collapsedSections[key] === true);
  const toggleCollapsed = useWorkspaceStore((s) => s.toggleCollapsed);

  return (
    <section
      className={`ed-inspector__group${collapsed ? ' ed-inspector__group--collapsed' : ''}`}
      data-section={section.id}
    >
      <button
        type="button"
        className="ed-inspector__group-head"
        aria-expanded={!collapsed}
        title={collapsed ? `展开「${section.label}」分组` : `折叠「${section.label}」分组`}
        onClick={() => toggleCollapsed(key)}
      >
        <span className="ed-inspector__group-caret" aria-hidden="true">
          ▸
        </span>
        <span className="ed-inspector__group-title">{section.label}</span>
        {section.hint ? <span className="ed-readout">{section.hint}</span> : null}
      </button>
      <div className="ed-inspector__group-body" hidden={collapsed}>
        {children}
      </div>
    </section>
  );
}

/** 无数据源字段的 disabled 占位行（可见不隐藏；不做假数据） */
function PlaceholderField({ label, id }: { label: string; id: string }) {
  return (
    <div className="ed-field">
      <label className="ed-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="ed-field__value">
        <input
          id={id}
          className="ed-input"
          disabled
          placeholder="后续版本提供"
          aria-label={label}
        />
      </div>
    </div>
  );
}

/** Transform 组体：位置/旋转/缩放三排九值（度 ⇄ 弧度换算沿 PropertyPanel 语义） */
function TransformBody({
  facade,
  obj,
  editable,
}: {
  facade: EditorFacade | null;
  obj: SceneObject;
  editable: boolean;
}) {
  const t = obj.transform;

  /** 以当前场景实际变换为 before，替换单个分量后经 TransformCommand 提交 */
  const commit = (mutate: (next: Transform) => void) => {
    if (!facade) return;
    const live = facade.scene.getObject(obj.id);
    if (!live) return;
    const before: Transform = {
      position: { ...live.transform.position },
      rotation: { ...live.transform.rotation },
      scale: { ...live.transform.scale },
    };
    const after: Transform = {
      position: { ...before.position },
      rotation: { ...before.rotation },
      scale: { ...before.scale },
    };
    mutate(after);
    facade.history.execute(new TransformCommand(obj.id, before, after));
  };

  const axes = ['x', 'y', 'z'] as const;

  /** 只读读数（多选态）：等宽右对齐，沿用 .ed-input[readonly] 视觉 */
  const readOnly = (value: number, precision: number, ariaLabel: string) => (
    <input
      className="ed-input ed-input--num"
      readOnly
      value={Number.isFinite(value) ? value.toFixed(precision) : ''}
      aria-label={ariaLabel}
    />
  );

  return (
    <>
      <div className="ed-field">
        <span className="ed-field__label">位置</span>
        <div className="ed-triplet">
          {axes.map((axis) =>
            editable ? (
              <NumberField
                key={axis}
                axis={axis}
                ariaLabel={`位置 ${axis}`}
                value={t.position[axis]}
                precision={2}
                step={0.5}
                onCommit={(v) => commit((next) => void (next.position[axis] = v))}
              />
            ) : (
              <span key={axis} className="ed-axis" data-axis={axis}>
                {readOnly(t.position[axis], 2, `位置 ${axis}`)}
              </span>
            ),
          )}
        </div>
      </div>
      <div className="ed-field">
        <span className="ed-field__label">旋转</span>
        <div className="ed-triplet">
          {axes.map((axis) =>
            editable ? (
              <NumberField
                key={axis}
                axis={axis}
                ariaLabel={`旋转 ${axis}（度）`}
                value={t.rotation[axis] * RAD_TO_DEG}
                precision={1}
                step={5}
                onCommit={(deg) => commit((next) => void (next.rotation[axis] = degToRad(deg)))}
              />
            ) : (
              <span key={axis} className="ed-axis" data-axis={axis}>
                {readOnly(t.rotation[axis] * RAD_TO_DEG, 1, `旋转 ${axis}（度）`)}
              </span>
            ),
          )}
        </div>
      </div>
      <div className="ed-field">
        <span className="ed-field__label">缩放</span>
        <div className="ed-triplet">
          {axes.map((axis) =>
            editable ? (
              <NumberField
                key={axis}
                axis={axis}
                ariaLabel={`缩放 ${axis}`}
                value={t.scale[axis]}
                precision={2}
                step={0.1}
                min={0.01}
                onCommit={(v) => commit((next) => void (next.scale[axis] = v))}
              />
            ) : (
              <span key={axis} className="ed-axis" data-axis={axis}>
                {readOnly(t.scale[axis], 2, `缩放 ${axis}`)}
              </span>
            ),
          )}
        </div>
      </div>
    </>
  );
}

// ── 共享字段（MetadataBody 与 RegionBasicBody 同构控件，命令通道一致）──

/** 名称字段：草稿编辑 → UpdateObjectCommand（外部重命名/撤销在非编辑态同步回显） */
function NameField({ facade, obj }: { facade: EditorFacade; obj: SceneObject }) {
  const [draft, setDraft] = useState(obj.name);

  // 外部重命名（大纲 / 撤销重做）在非编辑时同步回显
  useEffect(() => {
    setDraft(obj.name);
  }, [obj.name]);

  const commitName = () => {
    const next = draft.trim();
    if (next !== '' && next !== obj.name) {
      facade.history.execute(new UpdateObjectCommand(obj.id, { name: next }));
    } else {
      setDraft(obj.name);
    }
  };

  const onNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
    else if (e.key === 'Escape') {
      setDraft(obj.name);
      e.currentTarget.blur();
    }
  };

  return (
    <div className="ed-field">
      <label className="ed-field__label" htmlFor={`name-${obj.id}`}>
        名称
      </label>
      <div className="ed-field__value">
        <input
          id={`name-${obj.id}`}
          className="ed-input"
          value={draft}
          aria-label="对象名称"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitName}
          onKeyDown={onNameKeyDown}
        />
      </div>
    </div>
  );
}

/** 图层归属下拉：迁移 → ChangeLayerCommand（空值 = 未分层） */
function LayerSelectField({ facade, obj }: { facade: EditorFacade; obj: SceneObject }) {
  const layers = [...facade.scene.getLayers()].sort((a, b) => a.order - b.order);

  return (
    <div className="ed-field">
      <label className="ed-field__label" htmlFor={`layer-${obj.id}`}>
        图层
      </label>
      <div className="ed-field__value">
        <div className="ed-select-wrap">
          <select
            id={`layer-${obj.id}`}
            className="ed-input ed-select"
            value={obj.layerId ?? ''}
            aria-label="图层归属"
            onChange={(e) =>
              facade.history.execute(
                new ChangeLayerCommand(obj.id, e.target.value === '' ? null : e.target.value),
              )
            }
          >
            <option value="">未分层</option>
            {layers.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

/** 只读文本字段（类型 / ID 等） */
function ReadonlyTextField({
  label,
  id,
  value,
  title,
  numeric = false,
}: {
  label: string;
  id: string;
  value: string;
  title?: string;
  numeric?: boolean;
}) {
  return (
    <div className="ed-field">
      <label className="ed-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="ed-field__value">
        <input
          id={id}
          className={`ed-input${numeric ? ' ed-input--num' : ''}`}
          readOnly
          value={value}
          title={title}
          aria-label={`${label}（只读）`}
        />
      </div>
    </div>
  );
}

/**
 * Metadata 组体：名称（可编辑）→ UpdateObjectCommand；类型/ID 只读；图层下拉 → ChangeLayerCommand；
 * 资产引用只读行（asset-ref，model 对象——名称经 AssetRegistry 解析，未注册显示 id 原文，
 * T6.7 回归恢复，沿 HEAD 原实现迁移）；变体 seed 只读行（variant-seed，程序化资产放置
 * 掷出、随场景落盘，渲染侧按 seed 复算变体——只读可见即可，T002.3）。
 */
function MetadataBody({
  facade,
  obj,
  fields,
}: {
  facade: EditorFacade;
  obj: SceneObject;
  fields: readonly InspectorParamField[];
}) {
  const typeLabel = DEFAULT_TYPE_LABELS[obj.type] ?? obj.type;
  const isGroup = isGroupObject(obj); // T8.5：组壳无图层语义（成员 layerId 独立，不下拉误导）

  return (
    <>
      <NameField facade={facade} obj={obj} />
      <ReadonlyTextField label="类型" id={`type-${obj.id}`} value={typeLabel} />
      {!isGroup ? <LayerSelectField facade={facade} obj={obj} /> : null}
      <ReadonlyTextField label="ID" id={`id-${obj.id}`} value={obj.id} title={obj.id} numeric />
      {fields.map((field) => {
        // asset-ref：资产名经 AssetRegistry 解析（只读）；variant-seed：seed 原文只读；
        // 其余种类不属于本组（数据真相：不出现）
        if (field.kind === 'asset-ref') {
          const descriptor = facade.registries.assets.get(field.assetId);
          return (
            <div className="ed-field" key={field.key}>
              <span className="ed-field__label">{field.label}</span>
              <div className="ed-field__value">
                <input
                  className="ed-input"
                  readOnly
                  value={descriptor ? descriptor.asset.name : `${field.assetId}（未注册）`}
                  title={field.assetId}
                  aria-label={`${field.label}（只读）`}
                />
              </div>
            </div>
          );
        }
        if (field.kind === 'variant-seed') {
          // T008.4 重掷：新 seed → ChangeAssetSeedCommand（可撤销）；transform 经
          // resampleVariantTransform 按新旧采样差换算（用户 gizmo 编辑保留），
          // 槽路由/色相/风相位由渲染侧按新 seed 自动复算
          const rerollVariantSeed = (): void => {
            const oldSeed = variantSeedOf(obj);
            if (oldSeed === undefined) return;
            const id = assetIdOf(obj);
            const descriptor = id !== null ? facade.registries.assets.get(id) : undefined;
            const variants = descriptor?.kind === 'procedural' ? descriptor.asset.variants : undefined;
            const nextSeed = rollVariantSeed();
            facade.history.execute(
              new ChangeAssetSeedCommand(obj.id, {
                seed: nextSeed,
                transform: resampleVariantTransform(variants, oldSeed, nextSeed, obj.transform),
              }),
            );
          };
          return (
            <div className="ed-field" key={field.key}>
              <label className="ed-field__label" htmlFor={`seed-${obj.id}`}>
                {field.label}
              </label>
              <div className="ed-field__value">
                <input
                  id={`seed-${obj.id}`}
                  className="ed-input ed-input--num"
                  readOnly
                  value={`${field.seed}`}
                  title="烘焙式变体 seed：放置瞬间掷出，渲染侧按 seed 确定性复算变体（同 seed 同结果）；不可编辑"
                  aria-label={`${field.label}（只读）`}
                />
                <button
                  type="button"
                  className="ed-btn ed-btn--ghost"
                  title="重掷变体 seed：按新 seed 重算形态槽与实例表现（缩放/旋转增量换算，位置与手调保留；可撤销）"
                  aria-label="重掷变体 seed"
                  onClick={rerollVariantSeed}
                >
                  <Dices size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        }
        return null;
      })}
    </>
  );
}

// ── region 四分组组体（T6.6）────────────────────────────────

/** 基础信息组体：名称/类型只读（区域）/图层/锁定/可见/ID 只读——沿用既有控件与命令通道 */
function RegionBasicBody({ facade, region }: { facade: EditorFacade; region: RegionObject }) {
  return (
    <>
      <NameField facade={facade} obj={region} />
      <ReadonlyTextField label="类型" id={`rtype-${region.id}`} value={REGION_TYPE_LABEL} />
      <LayerSelectField facade={facade} obj={region} />
      <div className="ed-field">
        <span className="ed-field__label">锁定</span>
        <div className="ed-field__value">
          <IconToggle
            checked={region.locked}
            label={`${region.locked ? '解锁' : '锁定'} ${region.name}`}
            onChange={(next) =>
              facade.history.execute(new UpdateObjectCommand(region.id, { locked: next }))
            }
          >
            <span className="ed-icon-toggle__track" aria-hidden="true" />
          </IconToggle>
        </div>
      </div>
      <div className="ed-field">
        <span className="ed-field__label">可见</span>
        <div className="ed-field__value">
          <IconToggle
            checked={region.visible}
            label={`${region.visible ? '隐藏' : '显示'} ${region.name}`}
            onChange={(next) =>
              facade.history.execute(new UpdateObjectCommand(region.id, { visible: next }))
            }
          >
            <span className="ed-icon-toggle__track" aria-hidden="true" />
          </IconToggle>
        </div>
      </div>
      <ReadonlyTextField label="ID" id={`id-${region.id}`} value={region.id} title={region.id} numeric />
    </>
  );
}

/**
 * 几何组体：形状类型下拉（七类，切换经 convertShape 按包围盒/中心自动转换 →
 * ChangeShapeCommand）；参数化尺寸（圆半径/椭圆两半轴/矩形长宽，改值经 domain
 * applyParametricValue 重生成点列 + options，单条 ChangeShapeCommand）；基准高度
 * （shape.baseHeight，与变换组位置 Y 两层叠加生效，分域契约 §A 高度合成）；顶点数/
 * 面积/周长派生只读；「编辑顶点」（T6.8 解禁：激活顶点编辑会话；编辑中呈退出态，
 * 再点 / Esc / 双击同一对象退出——三路同经 toggleVertexEdit 与 ToolManager.cancel）。
 */
function RegionGeometryBody({
  facade,
  region,
  fields,
}: {
  facade: EditorFacade;
  region: RegionObject;
  fields: readonly InspectorParamField[];
}) {
  const shape = region.shape;
  const activeToolId = useEditorStore((s) => s.activeToolId);
  const editing = activeToolId === VERTEX_EDIT_TOOL_ID;

  const commitShape = (next: RegionShape) => {
    facade.history.execute(new ChangeShapeCommand(region.id, next));
  };

  const onShapeTypeChange = (value: string) => {
    if (!isShapeType(value) || value === shape.type) return;
    commitShape(convertShape(shape, value));
  };

  return (
    <>
      <div className="ed-field">
        <label className="ed-field__label" htmlFor={`shape-${region.id}`}>
          形状类型
        </label>
        <div className="ed-field__value">
          <div className="ed-select-wrap">
            <select
              id={`shape-${region.id}`}
              className="ed-input ed-select"
              value={shape.type}
              aria-label="形状类型"
              onChange={(e) => onShapeTypeChange(e.target.value)}
            >
              {SHAPE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {SHAPE_DRAW_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {fields.map((field) => {
        const id = `geo-${region.id}-${field.key}`;
        if (field.kind === 'shape-param-number') {
          return (
            <div className="ed-field" key={field.key}>
              <label className="ed-field__label" htmlFor={id}>
                {field.label}
              </label>
              <div className="ed-field__value">
                <NumberField
                  ariaLabel={field.label}
                  value={field.value}
                  precision={field.precision}
                  step={field.step}
                  min={field.min}
                  onCommit={(v) => commitShape(applyParametricValue(shape, field.key, v))}
                />
                {field.unit ? <span className="ed-field__unit">{field.unit}</span> : null}
              </div>
            </div>
          );
        }
        if (field.kind === 'base-height-number') {
          return (
            <div className="ed-field" key={field.key}>
              <label
                className="ed-field__label"
                htmlFor={id}
                title="基准高度与变换组「位置 Y」两层叠加生效（最终高度 = 基准高度 + 位置 Y）"
              >
                {field.label}
              </label>
              <div className="ed-field__value">
                <NumberField
                  ariaLabel="基准高度（米）"
                  value={field.value}
                  precision={field.precision}
                  step={field.step}
                  min={field.min}
                  onCommit={(v) => commitShape({ ...shape, baseHeight: v })}
                />
                {field.unit ? <span className="ed-field__unit">{field.unit}</span> : null}
              </div>
            </div>
          );
        }
        if (field.kind === 'derived-number') {
          return (
            <div className="ed-field" key={field.key}>
              <span className="ed-field__label">{field.label}</span>
              <div className="ed-field__value">
                <input
                  className="ed-input ed-input--num"
                  readOnly
                  value={field.value.toFixed(field.precision)}
                  aria-label={`${field.label}（只读）`}
                />
                <span className="ed-field__unit">{field.unit}</span>
              </div>
            </div>
          );
        }
        if (field.kind === 'coord') {
          return (
            <div className="ed-field" key={field.key}>
              <span className="ed-field__label">{field.label}</span>
              <div className="ed-field__value">
                <span className="ed-axis" data-axis="x">
                  <input
                    className="ed-input ed-input--num"
                    readOnly
                    value={field.x.toFixed(2)}
                    aria-label="坐标 X（只读）"
                  />
                </span>
                <span className="ed-axis" data-axis="z">
                  <input
                    className="ed-input ed-input--num"
                    readOnly
                    value={field.y.toFixed(2)}
                    aria-label="坐标 Z（只读）"
                  />
                </span>
                <span className="ed-field__unit">m</span>
              </div>
            </div>
          );
        }
        return null; // 其余种类字段不属于几何组（数据真相：不出现）
      })}
      <div className="ed-field">
        <span className="ed-field__label">顶点</span>
        <div className="ed-field__value">
          <button
            type="button"
            className={`ed-btn ed-btn--ghost${editing ? ' ed-btn--ghost-active' : ''}`}
            aria-pressed={editing}
            title={
              editing
                ? '退出顶点编辑（Esc / 双击同一对象同效）'
                : '进入顶点编辑：拖动顶点、Alt+点击边中点插入、右键或 Delete 删除（Esc 退出）'
            }
            onClick={() => toggleVertexEdit(facade.tools, region.id)}
          >
            {editing ? '退出编辑' : '编辑顶点'}
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * 业务类型组体：类型下拉（十类，SEMANTIC_DEFINITIONS 驱动）→ ChangeSemanticCommand
 * 类型切换（默认参数整体替换；自动归层/默认预设/overrides 清空由命令内部完成，一条历史）；
 * 业务参数表单按语义注册 properties 定义动态生成 → 同命令 ② 路径（类型不变，仅 properties）。
 */
function RegionSemanticBody({ facade, region }: { facade: EditorFacade; region: RegionObject }) {
  const semantic = region.semantic;
  const def = getSemanticDefinition(semantic.type);

  const onTypeChange = (value: string) => {
    if (!isSemanticType(value) || value === semantic.type) return;
    facade.history.execute(new ChangeSemanticCommand(region.id, semanticTypeChange(value)));
  };

  return (
    <>
      <div className="ed-field">
        <label className="ed-field__label" htmlFor={`sem-${region.id}`}>
          类型
        </label>
        <div className="ed-field__value">
          <div className="ed-select-wrap">
            <select
              id={`sem-${region.id}`}
              className="ed-input ed-select"
              value={semantic.type}
              aria-label="业务类型"
              onChange={(e) => onTypeChange(e.target.value)}
            >
              {semanticTypeOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {def && def.properties.length > 0 ? (
        <StyleParametersForm
          parameters={def.properties}
          values={semantic.properties}
          onChange={(key, value) =>
            facade.history.execute(
              new ChangeSemanticCommand(region.id, semanticPropertyChange(semantic, key, value)),
            )
          }
        />
      ) : null}
    </>
  );
}

/**
 * 表现样式组体：预设缩略图网格（EditorFacade.registries.presets 按 shape × semantic
 * 过滤，无命中回退 default_solid；选中高亮；缩略图 meta.thumbnail，缺省色块兜底）；
 * 参数控件由当前预设 defaultParams 自动生成（显示值 = 默认 < overrides 合成 + 钳制；
 * 改值 = presetId 不变的 update 路径，runtime reconcile 不闪变）；四档作用域批量应用
 * （当前对象/同类型/当前图层/同预设）→ 批量 ChangePresetCommand 经 BatchCommand 合一条撤销。
 */
function RegionStyleBody({ facade, region }: { facade: EditorFacade; region: RegionObject }) {
  const [scope, setScope] = useState<StyleApplyScope>('object');
  const options = regionPresetOptions(
    facade.registries.presets,
    region.shape.type,
    region.semantic.type,
  );
  const meta = facade.registries.presets.get(region.style.presetId);

  /** 作用域 → 目标集 → ChangePresetCommand（多个经 BatchCommand 合并一条历史；载荷按目标继承各自 seed——D18 区域私有） */
  const commitStyle = (next: RegionStyle) => {
    const live = facade.scene.getObject(region.id);
    if (!live) return;
    const targets = resolveRegionStyleTargets(scope, live, facade.scene.getObjects());
    const commands = targets.map((id) => {
      const target = facade.scene.getObject(id);
      const payload =
        target && isRegionObject(target) ? withTargetSeed(next, target.style) : next;
      return new ChangePresetCommand(id, payload);
    });
    if (commands.length === 0) return;
    facade.history.execute(commands.length === 1 ? commands[0]! : new BatchCommand(commands));
  };

  /** seed 重掷（D18-5：区域私有——仅当前对象，不随作用域批量；经命令可撤销） */
  const rerollSeed = () => {
    facade.history.execute(
      new ChangePresetCommand(region.id, presetSeedUpdate(region.style, rollVariantSeed())),
    );
  };

  return (
    <>
      <div className="ed-preset-grid" role="radiogroup" aria-label="样式预设">
        {options.map((preset) => {
          const active = preset.id === region.style.presetId;
          return (
            <button
              key={preset.id}
              type="button"
              className={`ed-preset-grid__item${active ? ' ed-preset-grid__item--active' : ''}`}
              role="radio"
              aria-checked={active}
              title={preset.name}
              onClick={() => commitStyle(presetSelect(preset.id, region.style))}
            >
              {preset.thumbnail ? (
                <img
                  className="ed-preset-grid__thumb"
                  src={preset.thumbnail}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <span
                  className="ed-preset-grid__swatch"
                  style={preset.color !== undefined ? { backgroundColor: preset.color } : undefined}
                  aria-hidden="true"
                />
              )}
              <span className="ed-preset-grid__name">{preset.name}</span>
            </button>
          );
        })}
      </div>
      {meta ? (
        <>
          <StyleParametersForm
            parameters={meta.defaultParams}
            values={resolvePresetValues(meta.defaultParams, region.style.overrides)}
            onChange={(key, value) =>
              commitStyle(presetOverrideUpdate(region.style, key, value))
            }
          />
          {meta.scatter ? (
            <ScatterParamsForm
              recipe={meta.scatter}
              overrides={region.style.overrides}
              seed={resolveScatterSeed(region.style.seed, region.id)}
              onOverride={(key, value) => commitStyle(presetOverrideUpdate(region.style, key, value))}
              onRerollSeed={rerollSeed}
            />
          ) : null}
        </>
      ) : (
        <div className="ed-empty">
          <strong>预设未注册</strong>
          {region.style.presetId}
        </div>
      )}
      <div className="ed-field">
        <label className="ed-field__label" htmlFor={`scope-${region.id}`}>
          作用域
        </label>
        <div className="ed-field__value">
          <div className="ed-select-wrap">
            <select
              id={`scope-${region.id}`}
              className="ed-input ed-select"
              value={scope}
              aria-label="样式修改作用域"
              onChange={(e) => setScope(e.target.value as StyleApplyScope)}
            >
              {REGION_STYLE_SCOPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

/** Advanced 组体：碰撞 / 标注 disabled 占位（无数据源，不做假数据） */
function AdvancedBody() {
  return (
    <>
      <PlaceholderField label="碰撞" id="advanced-collision" />
      <PlaceholderField label="标注" id="advanced-annotation" />
    </>
  );
}

// ── 多选批量编辑（T7.5）：Mixed 显示 + 逐字段提交 ─────────────

/** Mixed 占位文案（等宽读数区显示；数值字段聚焦后输入即覆盖全部对象该字段） */
const MIXED_PLACEHOLDER = 'Mixed';

/** 数值字段 Mixed 态：占位显示 + 聚焦输入新值提交（空/非法回退不提交） */
function MixedNumberField({
  id,
  mixed,
  value,
  precision,
  step,
  min,
  max,
  ariaLabel,
  onCommit,
}: {
  id?: string;
  mixed: boolean;
  value: number;
  precision: number;
  step?: number;
  min?: number;
  max?: number;
  ariaLabel: string;
  onCommit(next: number): void;
}) {
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);

  // 外部值变化（撤销/重做/收敛变化）在非编辑态清空草稿（Mixed 占位重新生效）
  useEffect(() => {
    if (!editing) setDraft('');
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() === '') {
      setDraft(''); // 未输入：保持 Mixed 占位，不提交
      return;
    }
    const next = Number(draft);
    if (!Number.isFinite(next)) {
      setDraft('');
      return;
    }
    const clamped = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, next));
    setDraft('');
    onCommit(clamped);
  };

  return (
    <input
      id={id}
      className={`ed-input ed-input--num${mixed ? ' ed-input--mixed' : ''}`}
      type="number"
      inputMode="decimal"
      value={editing ? draft : mixed ? '' : Number.isFinite(value) ? value.toFixed(precision) : ''}
      placeholder={mixed ? MIXED_PLACEHOLDER : undefined}
      title={mixed ? '多个对象该字段值不同（Mixed）——输入新值将应用到全部选中对象' : undefined}
      step={step}
      min={min}
      max={max}
      aria-label={ariaLabel}
      onFocus={() => setEditing(true)}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        else if (e.key === 'Escape') {
          setDraft('');
          setEditing(false);
          e.currentTarget.blur();
        }
      }}
    />
  );
}

/** Mixed 只读占位（布尔/选择等无法内联占位的字段旁侧读数） */
function MixedTag() {
  return (
    <span className="ed-readout ed-inspector__mixed-tag" title="多个对象该字段值不同（Mixed）">
      Mixed
    </span>
  );
}

/** 批量显隐/锁定开关：组级开关语义（任一未开 → 全开；全开 → 全关），Mixed 旁侧读数 */
function MultiFlagToggle({
  facade,
  objects,
  field,
  label,
}: {
  facade: EditorFacade;
  objects: readonly SceneObject[];
  field: 'visible' | 'locked';
  label: string;
}) {
  const allOn = objects.every((o) => o[field]);
  const mixed = !allOn && objects.some((o) => o[field]);
  const nextValue = !allOn; // planGroupToggle 语义：任一未开 → 开

  return (
    <>
      <IconToggle
        checked={allOn}
        label={`${nextValue ? '开启' : '关闭'}全部选中对象的${label}`}
        title={`批量${nextValue ? '开启' : '关闭'}${label}（一条历史，可一次撤销）`}
        onChange={() => {
          const cmd = buildGroupToggleCommand(objects, field);
          if (cmd) facade.history.execute(cmd);
        }}
      >
        <span className="ed-icon-toggle__track" aria-hidden="true" />
      </IconToggle>
      {mixed ? <MixedTag /> : null}
    </>
  );
}

/**
 * 参数字段（语义参数 / 预设参数共用，T7.5 Mixed 态）：number → Mixed 数值框或滑杆；
 * color → 取色器（Mixed 时旁侧读数，取色即应用到全部）；boolean → 开关（Mixed 旁侧
 * 读数，点击拉齐组级语义）；select → 下拉（Mixed 占位项禁选）。
 */
function MultiParamFieldRow({
  field,
  ariaLabelPrefix,
  onCommit,
}: {
  field: MultiParamField;
  ariaLabelPrefix: string;
  onCommit(key: string, value: string | number | boolean): void;
}) {
  const mixed = field.value === MIXED;
  const value = mixed ? undefined : (field.value as string | number | boolean);

  return (
    <div className="ed-field" key={field.key}>
      <label className="ed-field__label" title={field.key}>
        {field.label}
      </label>
      <div className="ed-field__value ed-field__value--multi">
        {field.type === 'number' ? (
          mixed ? (
            <MixedNumberField
              mixed
              value={Number.NaN}
              precision={field.step !== undefined && field.step < 1 ? 1 : 0}
              step={field.step}
              min={field.min}
              max={field.max}
              ariaLabel={`${ariaLabelPrefix} ${field.label}`}
              onCommit={(next) => onCommit(field.key, next)}
            />
          ) : (
            <NumberSlider
              value={Number(value)}
              min={field.min}
              max={field.max}
              step={field.step}
              ariaLabel={`${ariaLabelPrefix} ${field.label}`}
              onCommit={(next) => onCommit(field.key, next)}
            />
          )
        ) : field.type === 'color' ? (
          <>
            {mixed ? <MixedTag /> : null}
            <ColorInput
              value={String(value ?? '#000000')}
              ariaLabel={`${ariaLabelPrefix} ${field.label}`}
              onChange={(next) => onCommit(field.key, next)}
            />
          </>
        ) : field.type === 'boolean' ? (
          <>
            <IconToggle
              checked={value === true}
              label={`${field.label}（批量：${value === true ? '关闭' : '开启'}全部选中对象）`}
              onChange={(next) => onCommit(field.key, next)}
            >
              <span className="ed-icon-toggle__track" aria-hidden="true" />
            </IconToggle>
            {mixed ? <MixedTag /> : null}
          </>
        ) : (
          <div className="ed-select-wrap">
            <select
              className="ed-input ed-select"
              value={mixed ? '__mixed__' : String(value)}
              aria-label={`${ariaLabelPrefix} ${field.label}`}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '__mixed__') return;
                const option = field.options?.find((o) => String(o.value) === raw);
                onCommit(field.key, option && typeof option.value !== 'string' ? option.value : raw);
              }}
            >
              {mixed ? (
                <option value="__mixed__" disabled>
                  {MIXED_PLACEHOLDER}
                </option>
              ) : null}
              {(field.options ?? []).map((option) => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 多选批量编辑（T7.5 → T8.3 分节扩展）：汇总条（保留）+ 公共字段批量编辑——
 * 通用组（任意混选，作用域 = 全量选中）：图层下拉（Mixed 占位）/ 可见/锁定（组级开关语义）；
 * 全 region 选中集按 semantic.type 分节（T8.3）：每节头 = 类型名 + 计数（「建筑 ×2」），
 * 节内复用 T7.5 同类型语义组（类型切换 / 参数 / 预设 / 基准高度），作用域 = 节内
 * 对象集——逐节提交互不误伤（节 A 改参数不动节 B），每节操作各自单条历史；
 * 纯同类型多选退化为单节（与 T7.5 行为等价）；region+model 混选只显示通用组；
 * Transform 组维持只读显示首对象值（数值绝对量对 N 对象语义不明，成组变换归 gizmo）；
 * 名称多选态不做批量编辑（批量重命名归大纲右键弹层，T8.3 §2）。
 * 一切批量经 BatchCommand 合一条历史；Mixed 字段提交只写该字段到作用域全部对象。
 */
function MultiSelection({
  facade,
  objects,
}: {
  facade: EditorFacade;
  objects: readonly SceneObject[];
}) {
  const summary = describeSelection(objects);
  const fields = multiEditFieldsOf(objects);
  const first = objects[0]!;
  const layers = [...facade.scene.getLayers()].sort((a, b) => a.order - b.order);

  /** 异类型分节（全 region 选中集；混入 model → 空数组只显通用组） */
  const sections = multiRegionSectionsOf(objects);

  const commitCommand = (cmd: Command | null) => {
    if (cmd) facade.history.execute(cmd);
  };

  return (
    <div className="ed-panel__body">
      <div className="ed-inspector__summary" role="status">
        <strong className="ed-inspector__summary-title">已选 {summary.count} 个对象</strong>
        <div className="ed-inspector__summary-types">
          {summary.distribution.map((entry) => (
            <span key={entry.type} className="ed-inspector__summary-type">
              <span className="ed-inspector__summary-label">{entry.label}</span>
              <span className="ed-readout">×{entry.count}</span>
            </span>
          ))}
        </div>
        <span className="ed-inspector__summary-hint">
          批量编辑公共属性 · 异值字段显示 Mixed，提交只写入该字段
        </span>
      </div>

      <Group
        section={{
          id: 'multi-common',
          label: '批量编辑',
          hint: `${fields.count} 对象`,
        }}
      >
        <div className="ed-field">
          <label className="ed-field__label" htmlFor="multi-layer">
            图层
          </label>
          <div className="ed-field__value">
            <div className="ed-select-wrap">
              <select
                id="multi-layer"
                className="ed-input ed-select"
                value={fields.layerId === MIXED ? '__mixed__' : (fields.layerId ?? '')}
                aria-label="图层归属（批量）"
                onChange={(e) => {
                  if (e.target.value === '__mixed__') return;
                  commitCommand(
                    batchLayerCommand(objects, e.target.value === '' ? null : e.target.value),
                  );
                }}
              >
                {fields.layerId === MIXED ? (
                  <option value="__mixed__" disabled>
                    {MIXED_PLACEHOLDER}
                  </option>
                ) : null}
                <option value="">未分层</option>
                {layers.map((layer) => (
                  <option key={layer.id} value={layer.id}>
                    {layer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="ed-field">
          <span className="ed-field__label">可见</span>
          <div className="ed-field__value ed-field__value--multi">
            <MultiFlagToggle facade={facade} objects={objects} field="visible" label="可见" />
          </div>
        </div>
        <div className="ed-field">
          <span className="ed-field__label">锁定</span>
          <div className="ed-field__value ed-field__value--multi">
            <MultiFlagToggle facade={facade} objects={objects} field="locked" label="锁定" />
          </div>
        </div>
      </Group>

      {sections.map((section) => (
        <Group
          key={section.semanticType}
          section={{
            id: `multi-region-${section.semanticType}`,
            label: section.label,
            hint: `×${section.regions.length}`,
          }}
        >
          <MultiRegionSectionBody facade={facade} section={section} />
        </Group>
      ))}

      <Group section={{ id: 'transform', label: '变换', hint: '首个对象 · m · deg' }}>
        <TransformBody facade={null} obj={first} editable={false} />
      </Group>
    </div>
  );
}

/**
 * 分节体（T8.3）：节内 = T7.5 业务类型/表现样式/几何三组同构合并——
 * 类型下拉（切换 = 新类型默认参数，节对象重分节即时生效）/ 语义参数 Mixed 态 /
 * 预设网格（节内 shape × semantic 双维过滤）/ 预设参数 Mixed 态 / 基准高度；
 * 一切命令作用域 = section.regions（节内对象集），各自单条历史。
 */
function MultiRegionSectionBody({
  facade,
  section,
}: {
  facade: EditorFacade;
  section: MultiRegionSection;
}) {
  const fields = section.fields;
  const domId = `multi-${section.semanticType}`;

  const presetOptions = regionPresetOptions(
    facade.registries.presets,
    section.regions[0]!.shape.type,
    section.semanticType,
  );
  const activePresetId = fields.presetId;
  const presetMeta =
    activePresetId !== MIXED ? facade.registries.presets.get(activePresetId) : undefined;
  const presetParams = presetMeta
    ? convergePresetParams(section.regions, presetMeta.defaultParams)
    : null;

  const commitCommand = (cmd: Command | null) => {
    if (cmd) facade.history.execute(cmd);
  };

  return (
    <>
      <div className="ed-field">
        <label className="ed-field__label" htmlFor={`${domId}-type`}>
          类型
        </label>
        <div className="ed-field__value">
          <div className="ed-select-wrap">
            <select
              id={`${domId}-type`}
              className="ed-input ed-select"
              value={section.semanticType}
              aria-label={`业务类型（批量 · ${section.label}）`}
              onChange={(e) => {
                if (!isSemanticType(e.target.value) || e.target.value === section.semanticType)
                  return;
                commitCommand(batchSemanticTypeCommand(section.regions, e.target.value));
              }}
            >
              {semanticTypeOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {fields.semanticParams.map((field) => (
        <MultiParamFieldRow
          key={field.key}
          field={field}
          ariaLabelPrefix={`批量参数 · ${section.label}`}
          onCommit={(key, value) =>
            commitCommand(batchSemanticPropertyCommand(section.regions, key, value))
          }
        />
      ))}

      <div className="ed-preset-grid" role="radiogroup" aria-label={`样式预设（批量 · ${section.label}）`}>
        {presetOptions.map((preset) => {
          const active = activePresetId === preset.id; // Mixed 时无高亮项
          return (
            <button
              key={preset.id}
              type="button"
              className={`ed-preset-grid__item${active ? ' ed-preset-grid__item--active' : ''}`}
              role="radio"
              aria-checked={active}
              title={`${preset.name}（应用到「${section.label}」节全部 ${section.regions.length} 个对象）`}
              onClick={() => commitCommand(batchPresetCommand(section.regions, presetSelect(preset.id)))}
            >
              {preset.thumbnail ? (
                <img
                  className="ed-preset-grid__thumb"
                  src={preset.thumbnail}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <span
                  className="ed-preset-grid__swatch"
                  style={
                    preset.color !== undefined ? { backgroundColor: preset.color } : undefined
                  }
                  aria-hidden="true"
                />
              )}
              <span className="ed-preset-grid__name">{preset.name}</span>
            </button>
          );
        })}
      </div>
      {presetParams ? (
        presetParams.map((field) => (
          <MultiParamFieldRow
            key={field.key}
            field={field}
            ariaLabelPrefix={`批量样式参数 · ${section.label}`}
            onCommit={(key, value) =>
              commitCommand(batchPresetOverrideCommand(section.regions, key, value))
            }
          />
        ))
      ) : fields.presetId === MIXED ? (
        <div className="ed-field">
          <span className="ed-field__label">预设参数</span>
          <div className="ed-field__value">
            <input
              className="ed-input ed-input--mixed"
              readOnly
              value=""
              placeholder={MIXED_PLACEHOLDER}
              aria-label={`预设参数（${section.label} · Mixed）`}
              title="节内对象预设不同——先点选一个预设统一后再调参"
            />
          </div>
        </div>
      ) : null}
      {/* 多选态隐藏作用域选择器：节对象集本身即作用域（T7.5 裁定沿用于分节） */}

      <div className="ed-field">
        <label
          className="ed-field__label"
          htmlFor={`${domId}-base-height`}
          title="基准高度与变换组「位置 Y」两层叠加生效（最终高度 = 基准高度 + 位置 Y）"
        >
          基准高度
        </label>
        <div className="ed-field__value">
          <MixedNumberField
            id={`${domId}-base-height`}
            mixed={fields.baseHeight === MIXED}
            value={fields.baseHeight === MIXED ? Number.NaN : fields.baseHeight}
            precision={2}
            step={0.1}
            min={0}
            ariaLabel={`基准高度（批量 · ${section.label}，米）`}
            onCommit={(v) => commitCommand(batchBaseHeightCommand(section.regions, v))}
          />
          <span className="ed-field__unit">m</span>
        </div>
      </div>
    </>
  );
}

// ── 环境设置标签（EnvironmentPanel 等价迁入）─────────────────

function EnvironmentTab({
  presets,
  current,
  onChange,
}: {
  presets: readonly EnvironmentOption[];
  current: string;
  onChange(presetId: string): void;
}) {
  return (
    <div className="ed-panel__body">
      <div className="ed-section">
        <h3 className="ed-section__title">
          <span>环境预设</span>
          <span className="ed-readout">随场景保存</span>
        </h3>
        <div className="ed-field">
          <label className="ed-field__label" htmlFor="environment-preset">
            预设
          </label>
          <div className="ed-field__value">
            <div className="ed-select-wrap">
              <select
                id="environment-preset"
                className="ed-input ed-select"
                value={current}
                aria-label="环境预设"
                onChange={(e) => onChange(e.target.value)}
              >
                {presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* 渲染模式（Shaded/Wireframe/X-Ray）的消费归 T5.7——避免不可用控件，本标签不显示该组 */}
    </div>
  );
}

// ── 全局设置标签（GridSettings 等价迁入 + 吸附组 + 只读行 + 占位分组）──

/** 吸附组配置快照（App 从组合根共享对象读取；T7.6 R3 → T8.1 R4 分级扩项） */
interface SnapSettings {
  gridSnapEnabled: boolean;
  objectSnapEnabled: boolean;
  objectSnapThreshold: number;
  angleSnapEnabled: boolean;
  angleSnapStepDeg: number;
  elevationSnapEnabled: boolean;
}

function SettingsTab({
  grid,
  onApplyGrid,
  snap,
  onToggleGridSnap,
  onToggleObjectSnap,
  onObjectSnapThreshold,
  onToggleAngleSnap,
  onAngleSnapStep,
  onToggleElevationSnap,
  onAction,
}: {
  grid: SceneGrid | null;
  onApplyGrid(grid: SceneGrid): void;
  snap: SnapSettings | null;
  onToggleGridSnap(): void;
  onToggleObjectSnap(): void;
  onObjectSnapThreshold(value: number): void;
  onToggleAngleSnap(): void;
  onAngleSnapStep(value: number): void;
  onToggleElevationSnap(): void;
  onAction?(actionId: string): void;
}) {
  return (
    <div className="ed-panel__body">
      {grid ? <GridSection current={grid} onApply={onApplyGrid} /> : null}
      {snap ? (
        <SnapSection
          current={snap}
          onToggleGridSnap={onToggleGridSnap}
          onToggleObjectSnap={onToggleObjectSnap}
          onThreshold={onObjectSnapThreshold}
          onToggleAngleSnap={onToggleAngleSnap}
          onAngleStep={onAngleSnapStep}
          onToggleElevationSnap={onToggleElevationSnap}
        />
      ) : null}
      <div className="ed-section">
        <h3 className="ed-section__title">
          <span>单位</span>
        </h3>
        <div className="ed-field">
          <label className="ed-field__label" htmlFor="settings-unit">
            单位
          </label>
          <div className="ed-field__value">
            <input
              id="settings-unit"
              className="ed-input"
              readOnly
              value="m（米）"
              aria-label="单位（只读）"
            />
          </div>
        </div>
      </div>
      <div className="ed-section">
        <h3 className="ed-section__title">
          <span>快捷键</span>
        </h3>
        <div className="ed-field">
          <span className="ed-field__label">快捷键表</span>
          <div className="ed-field__value">
            <button
              type="button"
              className="ed-btn ed-btn--ghost"
              onClick={() => onAction?.('help.shortcuts')}
            >
              查看快捷键
            </button>
          </div>
        </div>
      </div>
      {/* P1 占位：分组标题可见、内容禁用（需求 §39 新功能准入精神） */}
      <div className="ed-section">
        <h3 className="ed-section__title">
          <span>操作偏好</span>
        </h3>
        <PlaceholderField label="撤销步数" id="prefs-undo-steps" />
        <PlaceholderField label="自动保存" id="prefs-autosave" />
      </div>
      <div className="ed-section">
        <h3 className="ed-section__title">
          <span>编辑器行为</span>
        </h3>
        <PlaceholderField label="默认工具" id="behavior-default-tool" />
        <PlaceholderField label="视口导航" id="behavior-navigation" />
      </div>
    </div>
  );
}

/**
 * 吸附组（T7.6 R3 → T8.1 R4 分级扩项，沿 GridSection 草稿提交惯例）：
 * 网格 / 对象 / 角度 / 高度四分项开关 + 吸附容差（0.05..5）+ 角度步长（下拉固定档
 * 5°/15°/45° + 自由数值输入，UE 快切 + Unity 自由值合体）。开关即时生效；配置为会话级
 * 偏好（共享可变对象），不入历史、不随场景保存。总开关归 Context Toolbar 吸附钮 /
 * 菜单 tool.snap（off 压下全部分项、不写分项记忆），不在本组重复暴露；文案显式区分
 * 「吸附」与「绘制辅助锁定」（Shift 正交 / A 角度 / G 网格三键——工具内会话键，
 * 不受本组与总开关影响）两组概念。
 */
function SnapSection({
  current,
  onToggleGridSnap,
  onToggleObjectSnap,
  onThreshold,
  onToggleAngleSnap,
  onAngleStep,
  onToggleElevationSnap,
}: {
  current: SnapSettings;
  onToggleGridSnap(): void;
  onToggleObjectSnap(): void;
  onThreshold(value: number): void;
  onToggleAngleSnap(): void;
  onAngleStep(value: number): void;
  onToggleElevationSnap(): void;
}) {
  const [thresholdDraft, setThresholdDraft] = useState(`${current.objectSnapThreshold}`);
  const [angleStepDraft, setAngleStepDraft] = useState(`${current.angleSnapStepDeg}`);

  // 外部来源变更（组合根重建等）时同步草稿
  useEffect(() => {
    setThresholdDraft(`${current.objectSnapThreshold}`);
  }, [current.objectSnapThreshold]);
  useEffect(() => {
    setAngleStepDraft(`${current.angleSnapStepDeg}`);
  }, [current.angleSnapStepDeg]);

  /** 文本输入 → 正数（米）；非法输入回退现值 */
  const parseThreshold = (raw: string): number => {
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) return current.objectSnapThreshold;
    return value;
  };

  /** 角度步长下拉档（含「自定义」哨兵；现值不在档内时显示自定义） */
  const stepPresetValue = ANGLE_STEP_PRESETS_DEG.includes(current.angleSnapStepDeg)
    ? `${current.angleSnapStepDeg}`
    : 'custom';
  /** 自由数值 → 合法步长（度）；非法输入回退现值 */
  const parseAngleStep = (raw: string): number => {
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) return current.angleSnapStepDeg;
    return value;
  };

  return (
    <div className="ed-section">
      <h3 className="ed-section__title">
        <span>吸附</span>
        <span className="ed-readout">移动 / 旋转工具 · 会话偏好</span>
      </h3>
      <div className="ed-field">
        <label className="ed-field__label" htmlFor="snap-grid">
          网格吸附
        </label>
        <div className="ed-field__value">
          <button
            id="snap-grid"
            type="button"
            role="switch"
            aria-checked={current.gridSnapEnabled}
            className={`ed-icon-toggle${current.gridSnapEnabled ? ' ed-icon-toggle--on' : ''}`}
            title={current.gridSnapEnabled ? '关闭网格吸附（移动工具步长与绘制 G 网格）' : '开启网格吸附（移动工具步长与绘制 G 网格）'}
            aria-label={current.gridSnapEnabled ? '关闭网格吸附' : '开启网格吸附'}
            onClick={onToggleGridSnap}
          >
            <span className="ed-icon-toggle__track" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="ed-field">
        <label className="ed-field__label" htmlFor="snap-object">
          对象吸附
        </label>
        <div className="ed-field__value">
          <button
            id="snap-object"
            type="button"
            role="switch"
            aria-checked={current.objectSnapEnabled}
            className={`ed-icon-toggle${current.objectSnapEnabled ? ' ed-icon-toggle--on' : ''}`}
            title={
              current.objectSnapEnabled
                ? '关闭对象吸附（移动工具边/面/中心线对齐）'
                : '开启对象吸附（移动工具边/面/中心线对齐）'
            }
            aria-label={current.objectSnapEnabled ? '关闭对象吸附' : '开启对象吸附'}
            onClick={onToggleObjectSnap}
          >
            <span className="ed-icon-toggle__track" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="ed-field">
        <label className="ed-field__label" htmlFor="snap-angle">
          角度吸附
        </label>
        <div className="ed-field__value">
          <button
            id="snap-angle"
            type="button"
            role="switch"
            aria-checked={current.angleSnapEnabled}
            className={`ed-icon-toggle${current.angleSnapEnabled ? ' ed-icon-toggle--on' : ''}`}
            title={
              current.angleSnapEnabled
                ? '关闭角度吸附（旋转工具步进）'
                : '开启角度吸附（旋转工具步进；相对拖拽起始姿态步进）'
            }
            aria-label={current.angleSnapEnabled ? '关闭角度吸附' : '开启角度吸附'}
            onClick={onToggleAngleSnap}
          >
            <span className="ed-icon-toggle__track" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="ed-field">
        <label className="ed-field__label" htmlFor="snap-angle-step">
          角度步长
        </label>
        <div className="ed-field__value">
          <div className="ed-select-wrap">
            <select
              id="snap-angle-step"
              className="ed-input ed-select"
              value={stepPresetValue}
              aria-label="角度步长档位（度）"
              disabled={!current.angleSnapEnabled}
              onChange={(e) => {
                if (e.target.value !== 'custom') onAngleStep(Number(e.target.value));
              }}
            >
              {ANGLE_STEP_PRESETS_DEG.map((preset) => (
                <option key={preset} value={`${preset}`}>
                  {preset}°
                </option>
              ))}
              <option value="custom">自定义…</option>
            </select>
          </div>
          <input
            id="snap-angle-step-value"
            className="ed-input ed-input--num"
            type="number"
            min={0.1}
            max={360}
            step={1}
            value={angleStepDraft}
            aria-label="角度步长（度，自由数值）"
            disabled={!current.angleSnapEnabled}
            onChange={(e) => setAngleStepDraft(e.target.value)}
            onBlur={() => onAngleStep(parseAngleStep(angleStepDraft))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onAngleStep(parseAngleStep(angleStepDraft));
            }}
          />
          <span className="ed-field__unit">°</span>
        </div>
      </div>
      <div className="ed-field">
        <label className="ed-field__label" htmlFor="snap-elevation">
          高度吸附
        </label>
        <div className="ed-field__value">
          <button
            id="snap-elevation"
            type="button"
            role="switch"
            aria-checked={current.elevationSnapEnabled}
            className={`ed-icon-toggle${current.elevationSnapEnabled ? ' ed-icon-toggle--on' : ''}`}
            title={
              current.elevationSnapEnabled
                ? '关闭高度吸附（移动工具 Y 轴高度层）'
                : '开启高度吸附（移动工具 Y 轴贴地面/相邻对象顶底面层）'
            }
            aria-label={current.elevationSnapEnabled ? '关闭高度吸附' : '开启高度吸附'}
            onClick={onToggleElevationSnap}
          >
            <span className="ed-icon-toggle__track" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="ed-field">
        <label className="ed-field__label" htmlFor="snap-threshold">
          吸附容差
        </label>
        <div className="ed-field__value">
          <input
            id="snap-threshold"
            className="ed-input ed-input--num"
            type="number"
            min={0.05}
            max={5}
            step={0.05}
            value={thresholdDraft}
            aria-label="吸附容差（米）"
            disabled={!current.objectSnapEnabled}
            onChange={(e) => setThresholdDraft(e.target.value)}
            onBlur={() => onThreshold(parseThreshold(thresholdDraft))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onThreshold(parseThreshold(thresholdDraft));
            }}
          />
          <span className="ed-field__unit">m</span>
        </div>
      </div>
      <div className="ed-field">
        <span className="ed-field__label">绘制辅助锁定</span>
        <div className="ed-field__value">
          <span
            className="ed-readout"
            title="绘制 / 顶点编辑工具内会话键（与「吸附」分项相互独立，不受总开关影响）"
          >
            Shift 正交 · A 角度 · G 网格
          </span>
        </div>
      </div>
    </div>
  );
}

/** 网格组（GridSettings 吸收）：显示开关即时提交；间距/尺寸草稿失焦/回车提交 */
function GridSection({ current, onApply }: { current: SceneGrid; onApply(grid: SceneGrid): void }) {
  const [draft, setDraft] = useState<SceneGrid>(current);

  // 外部来源变更（打开场景 / 组合根重建 / 菜单网格开关）时同步草稿
  useEffect(() => {
    setDraft(current);
  }, [current]);

  const commit = (patch: Partial<SceneGrid>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    onApply(next);
  };

  /** 文本输入 → 正数（米）；非法输入回退 fallback */
  const parseMeterInput = (raw: string, fallback: number): number => {
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) return fallback;
    return value;
  };

  return (
    <div className="ed-section">
      <h3 className="ed-section__title">
        <span>网格</span>
        <span className="ed-readout">间距 = 吸附步长</span>
      </h3>
      <div className="ed-field">
        <label className="ed-field__label" htmlFor="grid-visible">
          显示
        </label>
        <div className="ed-field__value">
          <button
            id="grid-visible"
            type="button"
            role="switch"
            aria-checked={draft.visible}
            className={`ed-icon-toggle${draft.visible ? ' ed-icon-toggle--on' : ''}`}
            title={draft.visible ? '隐藏视口网格' : '显示视口网格'}
            aria-label={draft.visible ? '隐藏视口网格' : '显示视口网格'}
            onClick={() => commit({ visible: !draft.visible })}
          >
            <span className="ed-icon-toggle__track" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="ed-field">
        <label className="ed-field__label" htmlFor="grid-spacing">
          间距
        </label>
        <div className="ed-field__value">
          <input
            id="grid-spacing"
            className="ed-input ed-input--num"
            type="number"
            min={0.1}
            max={100}
            step={0.5}
            value={draft.spacing}
            aria-label="网格间距（米）"
            onChange={(e) => setDraft({ ...draft, spacing: parseMeterInput(e.target.value, draft.spacing) })}
            onBlur={() => commit({})}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit({});
            }}
          />
          <span className="ed-field__unit">m</span>
        </div>
      </div>
      <div className="ed-field">
        <label className="ed-field__label" htmlFor="grid-size">
          尺寸
        </label>
        <div className="ed-field__value">
          <input
            id="grid-size"
            className="ed-input ed-input--num"
            type="number"
            min={100}
            max={4000}
            step={100}
            value={draft.size}
            aria-label="网格尺寸（米）"
            onChange={(e) => setDraft({ ...draft, size: parseMeterInput(e.target.value, draft.size) })}
            onBlur={() => commit({})}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit({});
            }}
          />
          <span className="ed-field__unit">m</span>
        </div>
      </div>
    </div>
  );
}
