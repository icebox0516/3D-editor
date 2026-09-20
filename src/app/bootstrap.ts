/**
 * app/bootstrap —— 组合根：装配各层依赖、注入 Port 实现，产出 EditorFacade。
 *
 * 数据流（阶段一闭环）：
 *   createEditor(canvas, opts)
 *     ├─ EventBus（注入或新建）
 *     ├─ SceneManager / SelectionManager                    scene  ── 唯一数据源 + 选中集
 *     ├─ AssetRegistry   ← opts.assets（manifest 清单）
 *     │  StylePresetRegistry ← runtime/styles 插件 meta eager 收割（T6.2：构建函数留
 *     │  runtime 构建路由，注册表纯数据）
 *     │  ToolRegistry / CommandRegistry（基础命令工厂 + T2.4 增补 2 条 + region 三件套）
 *     ├─ HistoryManager({sceneManager, selection, eventBus}) editor ── 一切可见修改经 Command 入栈
 *     ├─ Renderer(canvas, deps)（浏览器）                     runtime ── 订阅 object:* 事件单向映射到 three
 *     │    → viewport / cameraController / preview / gizmo 四个 Port 实现，注入工具
 *     无头（canvas=null）：opts.ports 或 no-op Port（测试 / 服务端）
 *     ├─ ToolManager(ctx) ← SelectTool(框选) / TransformTool(gizmo) / PlacementTool / 七形状绘制
 *     ├─ 默认场景：环境预设「白天」+ 十一图层（T6.7：十类语义图层 + 模型层）
 *     └─ InputController（浏览器）：DOM 事件 → PointerEventInfo/KeyboardEventInfo → ToolManager；
 *        Ctrl+Z/Y、Delete、Ctrl+C/V/D、F/Home、ESC、W/E/R（放置激活时 R 归 PlacementTool）
 *
 *   openScene(data)  ── SceneManager.clear() → addLayer×N → addObject×N（事件驱动 Renderer 重建）
 *                     → applyEnvironment（v2 反序列化已 fail-fast 校验对象类型，无旧类型兜底）
 *   saveScene()      ── { version '2.0', id, name, environment, layers, objects } → SceneSerializer.serialize
 *
 * 边界：app 层可导入一切（分层 DAG 顶端）；three 仅经 runtime 间接使用；
 *      归层（resolveLayerFor）与批量导入（importElements）在此层实现——metadata.layerName → 图层名，
 *      否则按类型默认表（现仅 model；region 走语义注册表路径）；对象入场景一律经
 *      CreateObjectCommand（BatchCommand 合并一条历史）；
 *      订阅联动：object:removed → 选中集同步清除（T4.1 B2，dispose 成对退订）。
 */
import { EventBus } from '../core/events/EventBus';
import { createId } from '../core/id';
import type { ID, Transform, Vec3 } from '../core/types';
import { deepClone } from '../core/utils';
import type { AssetDescriptor, ModelAsset, ModelObject } from '../domain/assets';
import { MODEL_BASE_HEIGHT, MODEL_LAYER_NAME, applyAssetVariants } from '../domain/assets';
import { SEMANTIC_DEFINITIONS } from '../domain/regions';
import type { RegionObject } from '../domain/regions';
import type { Layer } from '../scene/Layer';
import type { SceneData, SceneEnvironment, SceneGrid } from '../scene/SceneData';
import { coerceSceneGrid, isDiagnosticRenderMode } from '../scene/SceneData';
import { SceneManager } from '../scene/SceneManager';
import type { SceneObject } from '../scene/SceneObject';
import { SelectionManager } from '../scene/SelectionManager';
import {
  AssetRegistry,
  CommandRegistry,
  StylePresetRegistry,
  ToolRegistry,
} from '../registries';
import type { EditorFacade } from '../editor/EditorFacade';
import {
  BatchCommand,
  ChangeLayerCommand,
  ChangePropertyCommand,
  ChangePresetCommand,
  ChangeSemanticCommand,
  ChangeShapeCommand,
  CreateObjectCommand,
  DeleteObjectCommand,
  MergeRoadCommand,
  SplitRoadCommand,
  TransformCommand,
  UpdateLayerCommand,
  UpdateObjectCommand,
} from '../editor/commands';
import type { Command } from '../editor/commands';
import { HistoryManager } from '../editor/history/HistoryManager';
import { createModelObjectAt } from '../editor/factories/modelFactory';
import type { CameraPort, FootprintGhostPort, MeasurePort, PreviewPort, ViewportPort } from '../editor/services/ports';
import type { RectPickPort } from '../editor/services/ports';
import { MeasureSession } from '../editor/services/measure';
import { createObjectSnapConfig } from '../editor/services/objectSnapConfig';
import type { ObjectSnapConfig } from '../editor/services/objectSnapConfig';
import { PlacementTool, RoadSplitTool, SelectTool, ToolManager, TransformTool, VertexEditTool } from '../editor/tools';
import { MeasureTool } from '../editor/tools/measure';
import type { ToolContext } from '../editor/tools';
import { VERTEX_EDIT_TOOL_ID } from '../editor/tools';
import type { VertexSnapSession } from '../editor/tools';
import { DrawToolBase } from '../editor/tools/draw/DrawToolBase';
import {
  DrawCircleTool,
  DrawEllipseTool,
  DrawFreehandTool,
  DrawLineTool,
  DrawPointTool,
  DrawPolygonTool,
  DrawRectangleTool,
} from '../editor/tools/draw';
import type { DrawGridConfig } from '../editor/tools/draw';
import { createDrawGridConfig } from '../editor/tools/draw';
import { createVertexSnapPipeline } from '../editor/tools/vertexSnapPipeline';
import { createSnapTiersConfig } from '../editor/services/snapTiersConfig';
import type { SnapTiersConfig } from '../editor/services/snapTiersConfig';
import { Renderer } from '../runtime/Renderer';
import type { ScatterParams } from '../domain/scatter';
import { collectPresetPluginMetas } from '../runtime/styles/routes';
import { collectProceduralAssetMetas } from '../runtime/procedural/routes';
import { createTree3aHandle } from '../runtime/procedural/tree/tree3a/tree3aStage';
import type { Tree3aHandle } from '../runtime/procedural/tree/tree3a/tree3aStage';
import { createCeltisHandle } from '../runtime/procedural/tree/celtis/celtisStage';
import type { CeltisHandle } from '../runtime/procedural/tree/celtis/celtisStage';
import { createCamphorHandle } from '../runtime/procedural/tree/camphor/camphorStage';
import type { CamphorHandle } from '../runtime/procedural/tree/camphor/camphorStage';
import { clearStyleNotifier, setStyleNotifier } from '../runtime/styles/engine';
import type { StyleNotice } from '../runtime/styles/engine';
import { SceneSerializer } from '../io/SceneSerializer';
import { loadManifest as loadManifestData, registerManifestAssets } from '../io/AssetManifest';
import { EditorActionsCore } from './editorActionsCore';
import { InputController } from './input';

// ── 场景默认值 ──────────────────────────────────────────────

/**
 * 默认图层清单：十类语义图层（T6.7 翻转）+ 模型层（顺序即 order）。
 * 语义层名派生自 domain/regions/semanticDefinitions 的 defaultLayerName 字段（单一
 * 真相源——语义归层/大纲分组/默认场景共用一套名字，派生一致性由测试锁定）；模型层
 * 名锚定 domain/assets.MODEL_LAYER_NAME（模型对象非语义类型，资产库模式默认归属）。
 */
export const DEFAULT_LAYER_NAMES: readonly string[] = [
  ...SEMANTIC_DEFINITIONS.map((def) => def.defaultLayerName),
  MODEL_LAYER_NAME,
];

/** 环境预设表（需求 §场景与基础环境：白天/傍晚/夜景/科技；id 与 runtime 预设键一致） */
export const ENVIRONMENT_PRESETS: readonly { id: string; label: string }[] = [
  { id: 'day', label: '白天' },
  { id: 'dusk', label: '傍晚' },
  { id: 'night', label: '夜景' },
  { id: 'tech', label: '科技' },
];
export const DEFAULT_ENVIRONMENT_PRESET = 'day';

// 对象类型 → 默认归属图层名（T6.7：旧「按要素类型的默认图层名表」已删，收口于此）：
// - region 对象归层不走本表——语义对象赋类型自动迁入语义默认图层，已由
//   ChangeSemanticCommand（① 类型切换路径）与 DrawToolBase（绘制完成路径）按语义
//   注册表 defaultLayerName 按名解析，单一真相源 = domain/regions/semanticDefinitions；
// - model 对象归层查「模型」层（domain/assets.MODEL_LAYER_NAME）。

/** 新建场景数据：version 2.0 + 默认环境 + 十一图层（十语义 + 模型） */
export function createDefaultSceneData(name = '未命名场景'): SceneData {
  return {
    version: '2.0',
    id: createId('scene'),
    name,
    environment: { preset: DEFAULT_ENVIRONMENT_PRESET },
    layers: DEFAULT_LAYER_NAMES.map((layerName, order) => ({
      id: createId('layer'),
      name: layerName,
      visible: true,
      locked: false,
      opacity: 1,
      order,
      objectIds: [],
    })),
    objects: [],
  };
}

// ── 归层 ────────────────────────────────────────────────────

/** 按类型默认图层名查当前场景中的图层 id（无对应图层返回 null）；现仅 model 有表项 */
export function defaultLayerIdFor(scene: SceneManager, type: string): ID | null {
  const name = type === 'model' ? MODEL_LAYER_NAME : undefined;
  if (!name) return null;
  return scene.getLayers().find((l) => l.name === name)?.id ?? null;
}

/**
 * 决定对象归属图层：已有合法 layerId 保持 → metadata.layerName 命中图层名 →
 * 类型默认图层表 → null。
 */
export function resolveLayerFor(scene: SceneManager, obj: SceneObject): ID | null {
  if (obj.layerId !== null && scene.getLayer(obj.layerId)) return obj.layerId;
  const named = obj.metadata?.layerName;
  if (typeof named === 'string' && named !== '') {
    const hit = scene.getLayers().find((l) => l.name === named);
    if (hit) return hit.id;
  }
  return defaultLayerIdFor(scene, obj.type);
}

/**
 * 把一组对象（导入产物 RegionObject 或手绘对象）归层后经命令入场景：单个走
 * CreateObjectCommand，多个经 BatchCommand 合并为一条历史（一次撤销整批）。空数组返回 false。
 */
export function importElements(facade: EditorFacade, elements: readonly SceneObject[]): boolean {
  if (elements.length === 0) return false;
  const commands: Command[] = elements.map(
    (el) => new CreateObjectCommand({ ...el, layerId: resolveLayerFor(facade.scene, el) }),
  );
  return facade.history.execute(commands.length === 1 ? commands[0] : new BatchCommand(commands));
}

// ── 资产清单 ────────────────────────────────────────────────

/** 注册资产清单（幂等：已注册 id 跳过）；返回新增数量 */
export function registerAssets(facade: EditorFacade, assets: readonly ModelAsset[]): number {
  return registerManifestAssets(facade.registries.assets, assets);
}

/** 相对 assets 根路径 → 可加载 URL（已是绝对/协议 URL 原样保留） */
function resolveAssetUrl(base: string, path: string): string {
  return /^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('/') ? path : `${base}${path}`;
}

/**
 * 读取 manifest.json（浏览器 fetch）→ io.loadManifest 校验归一 → 解析相对路径。
 * file 与 thumbnail 均为「相对 assets 根」路径（CONTRACTS.md 勘误 2026-09-09），
 * 统一在此（组合根）解析为可加载 URL 后注入 AssetRegistry / 面板；
 * runtime AssetLoader 不感知路径拼接。
 */
export async function loadManifest(url = 'assets/manifest.json'): Promise<ModelAsset[]> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`加载资产清单失败：${url}（HTTP ${response.status}）`);
  const raw: unknown = await response.json();
  const { assets } = loadManifestData(raw);
  const base = url.slice(0, url.lastIndexOf('/') + 1);
  return assets.map((asset) => ({
    ...asset,
    file: resolveAssetUrl(base, asset.file),
    thumbnail: asset.thumbnail !== undefined ? resolveAssetUrl(base, asset.thumbnail) : undefined,
  }));
}

// ── 组合根 ──────────────────────────────────────────────────

/** Port 实现集合（runtime 提供或测试注入） */
export interface EditorPorts {
  viewport: ViewportPort;
  camera: CameraPort;
  preview: PreviewPort;
  /** 测量覆盖层（T10.1：runtime MeasureOverlay 结构化实现；无头 no-op） */
  measure: MeasurePort;
}

/**
 * 组合根门面句柄：契约 EditorFacade 之上的装配期扩展（不进 CONTRACTS.md——
 * 环境预设与相机 Port 是 T2.4 组合根接线出口：UI 面板经 App 层使用，
 * 环境「只改 SceneData.environment 并 emit scene:changed、不入历史」按任务书语义）。
 * T3.3 增补（主代理裁定 2026-09-09）：网格配置走环境通道 + 绘制吸附步长共享对象——
 * getGrid/setGrid 读写 environment.grid（随场景保存），并同步 drawGrid（三绘制工具共享）。
 */
export interface EditorHandle extends EditorFacade {
  /** 相机 Port（场景树定位 / App 层聚焦接线出口） */
  readonly camera: CameraPort;
  /** 绘制网格吸附共享配置（三绘制工具读取；setGrid 更新其 spacing，菜单吸附开关更新 snapEnabled；
   *  T7.6 起 gizmo translate 网格吸附同源消费——tool.snap 同时管辖绘制与 gizmo） */
  readonly drawGrid: DrawGridConfig;
  /**
   * 对象吸附共享配置（T7.6 组合根超集增补，沿 drawGrid 先例）：gizmo translate
   * 边/面对齐开关与容差；设置面板「吸附」组读写同一对象即时生效（会话级偏好不入历史）。
   */
  readonly objectSnap: ObjectSnapConfig;
  /**
   * 吸附分级共享配置（T8.1 组合根超集增补，沿 objectSnap 先例）：总开关（Context
   * Toolbar 吸附钮 / 菜单 tool.snap 同源路由——off 压下全部吸附分项不写分项记忆）+
   * 角度分项/步长 + 高度分项；gizmo 与顶点编辑吸附管线同源消费。会话级偏好不入历史。
   */
  readonly snapTiers: SnapTiersConfig;
  /**
   * 足迹幽灵预览 Port（T7.6 组合根超集增补，沿 camera 先例）：对齐弹层 hover /
   * 阵列 popover 实时参数的目标位置足迹框；runtime PreviewManager 实现，无头为 no-op。
   */
  readonly footprintGhost: FootprintGhostPort;
  /**
   * 测量会话（T10.1 组合根超集增补，沿 camera/drawGrid 先例）：四测量工具共享的
   * 会话态存储——切工具不清空，模式退出/清除全部才清（契约 §A）；T10.2 UI 入口
   * （ContextToolbar 清除全部/删除上一条）经此调用。不入场景 JSON、不入历史。
   */
  readonly measure: MeasureSession;
  /** 编辑动作共享核心（剪贴板/删除/全选；InputController 与 createEditorActions 同实例） */
  readonly actions: EditorActionsCore;
  /** 当前环境（深拷贝） */
  getEnvironment(): SceneEnvironment;
  /** 切换环境预设：改数据 + 发 scene:changed(source='setEnvironment') + 通知 Renderer；不入历史 */
  setEnvironment(env: SceneEnvironment): void;
  /** 当前网格配置：environment.grid 经 coerceSceneGrid 归一；键缺省回退吸附步长缺省值 */
  getGrid(): SceneGrid;
  /** 设置网格：写入 environment.grid（视口渲染 + 场景保存）并同步绘制吸附步长；不入历史 */
  setGrid(grid: SceneGrid): void;
  /**
   * 视口地面投影（拖放落点解析，T5.5）：clientXY（视口 CSS 像素）→ y=0 地面世界坐标；
   * 射线背向地面（如拖到地平线外）返回 null。委托组合根内 viewport Port。
   * 增补注记（2026-09-10，T5.5 主代理预授权）：EditorHandle 组合根门面超集增补
   * （同 T2.4 getEnvironment/setEnvironment 先例），非 EditorFacade 契约变更。
   */
  groundPoint(x: number, y: number): Vec3 | null;
  /**
   * 视口射线拾取（T5.8 右键菜单命中判定）：clientXY（视口 CSS 像素）→ 命中业务对象 id；
   * 无命中返回 null。委托组合根内 viewport Port。沿 groundPoint 先例（组合根门面超集，
   * 非 EditorFacade 契约变更）。无头形态恒 null。
   */
  pickObject(x: number, y: number): ID | null;
  /**
   * 视口运行指标（T5.7 HUD/状态栏 1Hz 轮询；零契约——沿 getGrid 先例的组合根超集）：
   * fps = 1s 滑动窗口帧率；triangles/drawCalls = 最近一帧 renderer.info.render 快照。
   * 无头形态（无 Renderer）返回零值。
   */
  getViewportStats(): { fps: number; triangles: number; drawCalls: number };
  /** 当前场景名（T5.7 HUD 左上芯片；openScene/装配 sceneName 选项时更新） */
  getSceneName(): string;
  /**
   * 小地图显示开关（T7.7，需求 §12.4）：workspaceStore.minimapVisible（随
   * t3d-editor.workspace 快照持久化）→ runtime MinimapRenderer.setVisible。
   * 沿 getGrid 先例的组合根超集，非 EditorFacade 契约变更；无头形态（无 Renderer）no-op。
   */
  setMinimapVisible(visible: boolean): void;
}

export interface CreateEditorOptions {
  /** 事件总线（UI store 桥接需同一实例；缺省新建） */
  eventBus?: EventBus;
  /** Port 注入（测试/无头）；缺省：canvas 非空由 Renderer 提供，否则 no-op */
  ports?: Partial<EditorPorts>;
  /** 启动即注册的资产清单（浏览器端通常在 loadManifest 后经 registerAssets 追加） */
  assets?: readonly ModelAsset[];
  /** 初始环境（缺省预设「白天」） */
  environment?: SceneEnvironment;
  /** 场景名（缺省「未命名场景」） */
  sceneName?: string;
  /** 是否接线 DOM 输入（缺省：canvas 非空即接线） */
  input?: boolean;
  /**
   * 右键点按（无拖拽）→ 上下文菜单请求（T5.8；client CSS 像素坐标 = 抬起点）。
   * 透传 InputController（classifyRightButton tap 分类）；App 装配时做命中判定并打开菜单。
   */
  onContextMenuRequest?: (x: number, y: number) => void;
}

/** 无头 no-op Port（未注入且无 Renderer 时使用：工具可激活，拾取/投影恒 null；机位恒 perspective） */
const NOOP_PORTS: EditorPorts = {
  viewport: { pickObject: () => null, groundPoint: () => null, surfacePoint: () => null },
  camera: {
    getMode: () => 'perspective',
    setMode() {},
    setOrthoLock() {},
    focusObjects() {},
    focusAll() {},
  },
  preview: { showGhost() {}, updateGhost() {}, hideGhost() {}, updateDrawPreview() {}, clear() {} },
  measure: { updateDraft() {}, updateMeasurements() {}, clear() {} },
};

/** 无头足迹幽灵 no-op（T7.6：无 Renderer 时对齐/阵列预览安全无操作） */
const NOOP_FOOTPRINT_GHOST: FootprintGhostPort = {
  showFootprints() {},
  clearFootprints() {},
};

// ── T003.2 DEV 散布冒烟面（003.3 真集成后移除）──────────────

/** 散布冒烟调用参数（透传覆盖；缺省画 120×90m 单资产 asset_trashbin） */
export interface ScatterSmokeOptions {
  /** 源 id（缺省 'smoke-scatter'；同 id 重复调用 = 全量重建） */
  id?: string;
  /** 撒点参数（缺省冒烟缺省值：120×90m 矩形 + density 0.05 + trashbin + 固定 seed） */
  params?: ScatterParams;
  /** 实例世界 y（缺省 0） */
  baseY?: number;
}

/** DEV-only 散布冒烟句柄（window.__scatterSmoke；类型在 app 层，three 经 runtime 间接） */
export interface ScatterSmokeHandle {
  scatter(opts?: ScatterSmokeOptions): void;
  /** 摘除源（无参 = 摘除本钩子 scatter 过的全部源） */
  clear(id?: string): void;
  /** 运行态：drawCalls/triangles 取 renderer.getViewportStats（上一完整帧），块统计取散布管线，
   *  lod = LOD 分布双口径（T006.4 D27.9：各档实例数 + 各档桶数，两链聚合） */
  stats(): {
    drawCalls: number;
    triangles: number;
    totalChunks: number;
    visibleChunks: number;
    instances: number;
    lod: {
      instances: Record<string, number>;
      buckets: Record<string, number>;
    };
  };
}

declare global {
  interface Window {
    __scatterSmoke?: ScatterSmokeHandle;
    __tree3a?: Tree3aHandle;
    __celtis?: CeltisHandle;
    __camphor?: CamphorHandle;
    __tree3aPerf?: Tree3aPerfHandle;
  }
}

/** 冒烟缺省撒点参数：120×90m @ 原点、density 0.05（≈540 实例）、trashbin 单资产、固定 seed */
function defaultSmokeScatterParams(): ScatterParams {
  return {
    polygon: [
      { x: -60, y: -45 },
      { x: 60, y: -45 },
      { x: 60, y: 45 },
      { x: -60, y: 45 },
    ],
    densityPerM2: 0.05,
    assets: [{ assetId: 'asset_trashbin', weight: 1 }],
    seed: 20260916,
    scaleRange: { min: 0.85, max: 1.15 },
  };
}

// ── T009.7 性能验收 DEV 驱动面（window.__tree3aPerf）─────────

/**
 * T009.7 性能验收驱动面 —— 经**产品放置路径**批量放置/清除夏栎 + 性能采样句柄。
 *
 * 口径：句柄只给数据与驱动，阈值/环境（2080 Ti / 1920×1080 / DPR=1 / Shadow 开…）归
 * 任务书 009.7。place 走真实命令管线（CreateObjectCommand×N → BatchCommand →
 * HistoryManager → SceneSync → InstancedAssetPool），渲染侧自然实例化——性能验收
 * 「走池而非 DEV 舞台」的前提；clear 同经 DeleteObjectCommand 批，一次 undo 可回退。
 * 幂等语义（本文件裁定并记档）：再次 place 前自动 clear 自己上次的对象——验收循环
 * place(1)→sample→place(20)→sample→… 无需手动 clear，场景棵数恒等于最近一次 count。
 * 确定性：count/seedBase/spacing/jitter 同参 → 对象 seed 与 transform 逐位一致
 * （id 除外——createId 每次新掷）；seed = seedBase + i 经槽路由自然铺开 8 形态槽。
 */

/** place 参数（批量确定性放置） */
export interface Tree3aPerfPlaceOptions {
  /** 棵数（缺省 100；验收档 1/20/100/500/1000） */
  count?: number;
  /** seed 基（缺省 1；对象 i 的 seed = seedBase + i） */
  seedBase?: number;
  /** 网格间距（米，缺省 11——展开冠幅 ≈8.9m 防交叠，沿 tree3aStage slots 间距口径；
   *  1000 棵 32×32 ≈341m 见方**居中于原点**，任务书口径下不出太阳 shadow camera 覆盖域） */
  spacing?: number;
  /** 变体抖动（缺省 true：以对象 seed 经 domain applyAssetVariants 确定性采样；false 纯网格恒等姿态） */
  jitter?: boolean;
}

/** view 参数（球坐标固定机位；公式沿 tree3aStage.placeCamera 口径，实现复写在组合根侧不改舞台） */
export interface Tree3aPerfViewOptions {
  /** 距离（米；缺省按当前网格 extent 自适应：max((cols−1),(rows−1))×spacing + 冠幅 9，未 place 回退 25） */
  distance?: number;
  /** 方位角（度，缺省 35） */
  azimuthDeg?: number;
  /** 仰角（度，缺省 16；水平为 0） */
  elevationDeg?: number;
}

/** rAF 帧间隔统计（毫秒口径；fps = 1000/mean，百分位 nearest-rank） */
export interface Tree3aPerfFrameStats {
  fps: number;
  mean: number;
  p50: number;
  p95: number;
  max: number;
  /** 采样帧数（不含预热） */
  frames: number;
}

/** stats() 形状：renderer.info（render / memory / programs）+ 本句柄存活对象数 */
export interface Tree3aPerfStats {
  /** 上一完整帧 draw call 数（renderer.info.render.calls，经 Renderer.getViewportStats） */
  drawCalls: number;
  /** 上一完整帧三角数（renderer.info.render.triangles） */
  triangles: number;
  /** 几何计数（renderer.info.memory.geometries——**个数而非字节**，资源契约对账口径） */
  geometries: number;
  /** 纹理计数（renderer.info.memory.textures——个数而非字节） */
  textures: number;
  /** 着色程序数（renderer.info.programs.length） */
  programs: number;
  /** 场景内本句柄放置且仍存活的对象数（撤销后归零、重做复活再计入） */
  objects: number;
}

/** window.__tree3aPerf 句柄（DEV-only；装配见 createEditor，工厂可无头注桩测试） */
export interface Tree3aPerfHandle {
  /** 批量放置（幂等：先自动 clear 上次的）；false = 资产缺失或命令批失败（场景不变） */
  place(opts?: Tree3aPerfPlaceOptions): boolean;
  /** 经真实命令移除本句柄放置的全部存活对象（不碰用户手放的）；false = 无可删对象 */
  clear(): boolean;
  /** 性能快照（形状见 Tree3aPerfStats；无头/未注入视口依赖时渲染字段为零值） */
  stats(): Tree3aPerfStats;
  /** rAF 帧间隔采样（缺省 5000ms；先丢 30 帧预热再计窗——放置/切阴影后的材质与灯重编译等一次性成本不进统计） */
  sampleFrames(durationMs?: number): Promise<Tree3aPerfFrameStats>;
  /** 太阳 castShadow 切换（Shadow 成本 A/B 用；切换后的重编译属一次性，采样方自行 warmup） */
  setSunShadow(on: boolean): void;
  /** 固定机位取景（球坐标绕网格中心=原点，视心高 ≈3.6；无相机依赖时 no-op） */
  view(opts?: Tree3aPerfViewOptions): void;
  /** 终结：clear 自己的对象（经命令，幂等）；window 槽摘除归组合根 dispose */
  dispose(): void;
}

/** 句柄装配依赖（结构类型——浏览器注入 renderer 实件，测试注桩；无头可只给命令面） */
export interface Tree3aPerfDeps {
  /** 命令执行入口（HistoryManager 实件——产品放置路径） */
  history: { execute(command: Command): boolean };
  /** 场景只读面（对象存活对账 + 归「模型」默认层） */
  sceneManager: Pick<SceneManager, 'getObject' | 'getObjects' | 'getLayers'>;
  /** 资产注册表（asset_tree_3a meta：默认姿态 + variants 声明） */
  assets: { get(id: ID): AssetDescriptor | undefined };
  /** 视口侧依赖（可选：stats 数据源 / 机位写入 / 太阳遍历；缺省即无头退化零值/no-op） */
  view?: {
    /** 渲染场景（setSunShadow 遍历 DirectionalLight；结构类型兼容 THREE.Scene.traverse——组合根不引入 three） */
    scene?: { traverse(callback: (node: { castShadow: boolean; isDirectionalLight?: boolean }) => void): void };
    camera?: { position: { set(x: number, y: number, z: number): unknown } };
    controls?: { target: { set(x: number, y: number, z: number): unknown }; update(): void };
    stats?: {
      getViewportStats(): { drawCalls: number; triangles: number };
      getResourceStats(): { geometries: number; textures: number; programs: number };
    };
  };
}

/** 目标资产 id（夏栎——T009 性能验收对象） */
const TREE3A_PERF_ASSET_ID: ID = 'asset_tree_3a';
/** 缺省网格间距（米）：展开冠幅 ≈8.9m，11m 留 ≈2m 防交叠（沿 tree3aStage slots 间距口径） */
const TREE3A_PERF_SPACING = 11;
/** 冠幅估计（米）：view 自适应距离的 extent 余量（9 ≈ XZ 跨上限 8.9 上取整，009.3 实测口径） */
const TREE3A_PERF_CROWN = 9;
/** 取景视心高（米）：树半高口径（沿 tree3aStage.placeCamera 的 3.6） */
const TREE3A_PERF_TARGET_Y = 3.6;
/** 采样预热帧数（丢弃——一次性编译/上传成本不进统计窗） */
const TREE3A_PERF_WARMUP_FRAMES = 30;
/** 采样缺省时长（毫秒） */
const TREE3A_PERF_SAMPLE_MS = 5000;

/** 帧间隔统计（百分位 nearest-rank：升序第 ⌈p·n⌉ 位，1 基） */
function summarizeFrameDeltas(deltas: number[]): Tree3aPerfFrameStats {
  const sorted = [...deltas].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = deltas.reduce((sum, dt) => sum + dt, 0) / n;
  const pick = (p: number): number => sorted[Math.min(Math.max(Math.ceil(p * n), 1), n) - 1]!;
  return { fps: 1000 / mean, mean, p50: pick(0.5), p95: pick(0.95), max: sorted[n - 1]!, frames: n };
}

/** 句柄工厂：放置状态封闭于闭包（placedIds + 最近网格 extent），句柄间零共享 */
export function createTree3aPerfHandle(deps: Tree3aPerfDeps): Tree3aPerfHandle {
  /** 本句柄放置过的对象 id 集（clear/stats 对账——撤销/重做后按场景存活过滤，不追赶历史） */
  const placedIds = new Set<ID>();
  /** 最近一次 place 的网格实宽（view 缺省距离自适应；未 place 为 0 → 回退 25m） */
  let lastExtent = 0;

  /** 内部 clear：只删本句柄放置且仍在场景的对象（经命令批，一次 undo 可回退；幂等） */
  const clearPlaced = (): boolean => {
    const alive = [...placedIds].filter((id) => deps.sceneManager.getObject(id) !== undefined);
    if (alive.length === 0) {
      placedIds.clear();
      return false;
    }
    const ok = deps.history.execute(new BatchCommand(alive.map((id) => new DeleteObjectCommand(id))));
    if (ok) placedIds.clear();
    return ok;
  };

  return {
    place(opts = {}) {
      const descriptor = deps.assets.get(TREE3A_PERF_ASSET_ID);
      if (!descriptor || descriptor.kind !== 'procedural') {
        console.warn(`[tree3aPerf] 资产未注册或非程序化: ${TREE3A_PERF_ASSET_ID}——place no-op`);
        return false;
      }
      const asset = descriptor.asset;
      const count = Math.max(1, Math.floor(opts.count ?? 100));
      const seedBase = Math.floor(opts.seedBase ?? 1);
      const spacing =
        typeof opts.spacing === 'number' && Number.isFinite(opts.spacing) && opts.spacing > 0
          ? opts.spacing
          : TREE3A_PERF_SPACING;
      const jitter = opts.jitter !== false; // 缺省 true
      const layerId = deps.sceneManager.getLayers().find((l) => l.name === MODEL_LAYER_NAME)?.id ?? null;

      // 幂等：先清自己上次的（验收循环 place→sample→place 不叠加，见段首记档）
      clearPlaced();

      // 方形网格（ceil(√count) 列）居中于原点；对象构建对齐 PlacementTool.place 惯例
      //（createModelObjectAt：name=资产名 / 归「模型」层 / seed 随对象落盘）。变体合成 =
      // PlacementTool.buildTransform 同款乘性/加性律（无随机区间/滚轮/R 键项）：
      // scale = defaultScale × scaleFactor、rotY = defaultRotation.y + rotationYOffset；
      // hue 不进 transform——渲染侧按 obj.asset.seed 复算 instanceColor（产品路径同源）
      const columns = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / columns);
      const objects: ModelObject[] = [];
      for (let i = 0; i < count; i++) {
        const seed = seedBase + i;
        const variant = jitter ? applyAssetVariants(asset.variants, seed) : null;
        const scaleFactor = variant?.scaleFactor ?? 1;
        const rotationYOffset = variant?.rotationYOffset ?? 0;
        const transform: Transform = {
          position: {
            x: ((i % columns) - (columns - 1) / 2) * spacing,
            y: MODEL_BASE_HEIGHT, // 贴地抬升（groundPoint y=0 同款落点，T9.2）
            z: (Math.floor(i / columns) - (rows - 1) / 2) * spacing,
          },
          rotation: {
            x: asset.defaultRotation.x,
            y: asset.defaultRotation.y + rotationYOffset,
            z: asset.defaultRotation.z,
          },
          scale: {
            x: asset.defaultScale.x * scaleFactor,
            y: asset.defaultScale.y * scaleFactor,
            z: asset.defaultScale.z * scaleFactor,
          },
        };
        objects.push(createModelObjectAt({ asset, layerId, transform, seed }));
      }
      const ok = deps.history.execute(new BatchCommand(objects.map((o) => new CreateObjectCommand(o))));
      if (!ok) return false;
      for (const o of objects) placedIds.add(o.id);
      lastExtent = Math.max((columns - 1) * spacing, (rows - 1) * spacing) + TREE3A_PERF_CROWN;
      return true;
    },
    clear: clearPlaced,
    stats() {
      const viewport = deps.view?.stats?.getViewportStats();
      const resources = deps.view?.stats?.getResourceStats();
      let objects = 0;
      for (const id of placedIds) if (deps.sceneManager.getObject(id) !== undefined) objects += 1;
      return {
        drawCalls: viewport?.drawCalls ?? 0,
        triangles: viewport?.triangles ?? 0,
        geometries: resources?.geometries ?? 0,
        textures: resources?.textures ?? 0,
        programs: resources?.programs ?? 0,
        objects,
      };
    },
    sampleFrames(durationMs = TREE3A_PERF_SAMPLE_MS) {
      return new Promise<Tree3aPerfFrameStats>((resolve, reject) => {
        if (typeof requestAnimationFrame !== 'function') {
          reject(new Error('[tree3aPerf] 无 requestAnimationFrame（无头环境）——sampleFrames 不可用'));
          return;
        }
        // 连续渲染模式下 rAF 间隔即帧间隔：先丢 30 帧预热（放置/切阴影后的材质与灯重编译、
        // 几何上传等一次性成本不进统计窗），再按累计时长截窗收 delta（毫秒口径）
        const deltas: number[] = [];
        let last = 0;
        let warmed = 0;
        let elapsed = 0;
        const step = (t: number): void => {
          if (last !== 0) {
            const dt = t - last;
            if (warmed < TREE3A_PERF_WARMUP_FRAMES) warmed += 1;
            else {
              deltas.push(dt);
              elapsed += dt;
            }
          }
          last = t;
          if (deltas.length > 0 && elapsed >= durationMs) {
            resolve(summarizeFrameDeltas(deltas));
            return;
          }
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    },
    setSunShadow(on) {
      const scene = deps.view?.scene;
      if (!scene) {
        console.warn('[tree3aPerf] 无视口场景依赖（无头）——setSunShadow no-op');
        return;
      }
      // 遍历渲染场景切 DirectionalLight.castShadow（场景内唯一太阳在 envGroup；结构判别
      // isDirectionalLight，app 层不 import three——沿「three 经 runtime 间接」纪律）
      scene.traverse((node) => {
        if (node.isDirectionalLight === true) node.castShadow = on;
      });
    },
    view(opts = {}) {
      const view = deps.view;
      if (!view?.camera || !view.controls) {
        console.warn('[tree3aPerf] 无相机依赖（无头）——view no-op');
        return;
      }
      // 球坐标落位（公式沿 tree3aStage.placeCamera 口径）：目标 = 网格中心（网格居中于
      // 原点 → (0, 3.6, 0)，3.6 = 视心高≈树半高）；缺省 distance ≈ 网格实宽（沿 viewSlots
      // 「distance ≈ 实宽」换算口径）、方位 35°、俯角 16°
      const distance = opts.distance ?? Math.max(lastExtent, 25);
      const az = ((opts.azimuthDeg ?? 35) * Math.PI) / 180;
      const el = ((opts.elevationDeg ?? 16) * Math.PI) / 180;
      const cosEl = Math.cos(el);
      view.camera.position.set(
        distance * cosEl * Math.cos(az),
        TREE3A_PERF_TARGET_Y + distance * Math.sin(el),
        distance * cosEl * Math.sin(az),
      );
      view.controls.target.set(0, TREE3A_PERF_TARGET_Y, 0);
      view.controls.update();
    },
    dispose() {
      clearPlaced(); // 经命令清自己的对象（幂等）；window 槽摘除归组合根 dispose
    },
  };
}

/** 装配编辑器：返回组合根门面句柄（EditorFacade 契约签名 + 环境/相机接线出口） */
export function createEditor(canvas: HTMLCanvasElement | null, opts: CreateEditorOptions = {}): EditorHandle {
  const eventBus = opts.eventBus ?? new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);

  // ── 注册表 ──
  // T6.9：ElementRegistry/StyleRegistry 已随旧契约类型面删除（JsonImporter v2 零注册表
  // 依赖）；装配仅余资产/工具/命令/样式预设四个注册表。
  const assets = new AssetRegistry();
  // manifest 清单（GLB 文件资产）→ kind:'file' 描述符
  for (const asset of opts.assets ?? []) assets.register({ kind: 'file', asset });
  // ── 程序化资产（T002.1，D7/D17）──
  // eager 收割 *.asset.ts 插件 meta（runtime/procedural 经 import.meta.glob 扫描；app 可导入
  // 一切，注入方向合法）；与 GLB 同库混排。重复 id（含与 manifest 撞名）经 app:notify 告警
  // 跳过、不阻塞启动——与样式预设注册同一容错哲学；注册表级「重复即拒」契约由单测锁定。
  for (const proceduralMeta of collectProceduralAssetMetas()) {
    try {
      assets.register({ kind: 'procedural', asset: proceduralMeta });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      eventBus.emit('app:notify', { message: `程序化资产注册失败已跳过：${reason}`, kind: 'warn' });
    }
  }
  const toolRegistry = new ToolRegistry();
  const commands = createCommandRegistry();

  // ── 样式预设注册表（阶段 6 T6.2 双轨注册之元数据轨）──
  // eager 收割插件文件 meta（runtime/styles 经 import.meta.glob 扫描；app 可导入一切，
  // 注入方向合法）；重复 id（插件文件缺陷）跳过并经 app:notify 告警，不阻塞启动。
  const presets = new StylePresetRegistry();
  for (const presetMeta of collectPresetPluginMetas()) {
    try {
      presets.register(presetMeta);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      eventBus.emit('app:notify', { message: `样式预设注册失败已跳过：${reason}`, kind: 'warn' });
    }
  }
  // 引擎通知通道接线：降级兜底等 runtime 提示 → EventMap 'app:notify'（Toast，T6.5/T6.6 消费）。
  // 条件清除（dispose 时仅清自己的通道）保证多编辑器实例共存安全。
  const styleNotifier = (notice: StyleNotice): void => {
    eventBus.emit('app:notify', notice);
  };
  setStyleNotifier(styleNotifier);

  // ── 历史 ──
  const history = new HistoryManager({ sceneManager, selection, eventBus });

  // ── 编辑动作共享核心（T5.2）：快捷键接线与主菜单动作路由共用（剪贴板互通）──
  const actionsCore = new EditorActionsCore({ history, sceneManager, selection });

  // ── 初始场景数据（环境 + 图层）──
  const initial = createDefaultSceneData(opts.sceneName);
  if (opts.environment) initial.environment = deepClone(opts.environment);

  // ── Renderer（浏览器）→ Port 实现 ──
  // 共享网格吸附配置（绘制工具 / 顶点编辑吸附管线同源；UI GridSettings 经
  // EditorHandle 更新步长，T3.3）——先于 Renderer 创建：顶点编辑吸附管线引用它。
  const drawGrid = createDrawGridConfig();
  // 顶点编辑吸附会话开关（T6.8 G 网格 / T8.1 A 45° 锁定）+ 吸附分级共享配置（T8.1：
  // 总开关 + Ctrl 临时反转在管线内即时计算）。
  const vertexSnapSession: VertexSnapSession = { enabled: true, angleLock: false };
  const snapTiers = createSnapTiersConfig();
  // 顶点编辑吸附管线（T6.8 → T8.1）：editor 层工厂组装 draw/snap 纯函数
  // （Shift 正交 → A 45° → G 网格三段语义与 DrawToolBase.applyAids 完全一致，
  // 单一真相源；runtime 经注入消费——DAG 禁止 runtime→editor 导入）。
  const vertexSnap = createVertexSnapPipeline(vertexSnapSession, drawGrid, snapTiers);
  // 对象吸附共享配置（T7.6）：gizmo translate 边/面对齐开关与容差——组合根构造一份
  // 注入 Renderer → GizmoImpl 与 EditorHandle（设置面板「吸附」组读写同一对象即时生效）
  const objectSnap = createObjectSnapConfig();
  const renderer = canvas
    ? new Renderer(canvas, { eventBus, sceneManager, assets, environment: initial.environment, vertexSnap, objectSnap, gridSnap: drawGrid, snapTiers })
    : null;
  // T006.3 LOD 总开关 URL 入口（最小面：?lod=0/off/false 关闭——渲染派生态，不进
  // Scene/Command/持久状态；无头/缺参缺省开）。回退对比与兜底的调试/验收通道。
  if (renderer && typeof window !== 'undefined') {
    const lodQuery = new URLSearchParams(window.location.search).get('lod');
    if (lodQuery === '0' || lodQuery === 'off' || lodQuery === 'false') {
      renderer.setLodEnabled(false);
    }
  }
  // 小地图导航接线（T7.7）：小地图拖拽/点击 → CameraController.panTargetTo
  //（保持距离姿态平移观察目标；CameraPort 契约零变更，组合根内直达实现端）
  renderer?.minimap.setNavigate((x, z) => renderer.cameraController.panTargetTo(x, z));
  // T003.2 DEV 冒烟面：window.__scatterSmoke（import.meta.env.DEV 守卫，生产构建零痕迹；
  // 无 Renderer（无头）不挂）。003.3 真集成（Feature/Style 驱动）前的临时验收出口——
  // dispose 只摘自己的实例（StrictMode 双挂载下先卸载者不得拆掉后挂载者的钩子）。
  let scatterSmoke: ScatterSmokeHandle | null = null;
  if (import.meta.env.DEV && renderer && typeof window !== 'undefined') {
    const smokeIds = new Set<string>();
    scatterSmoke = {
      scatter(opts = {}) {
        const id = opts.id ?? 'smoke-scatter';
        smokeIds.add(id);
        renderer.scatter?.setSource(id, opts.params ?? defaultSmokeScatterParams(), opts.baseY ?? 0);
      },
      clear(id) {
        for (const target of id ? [id] : [...smokeIds]) renderer.scatter?.removeSource(target);
        if (!id) smokeIds.clear();
      },
      stats() {
        const chunks = renderer.scatter?.getStats() ?? { totalChunks: 0, visibleChunks: 0, instances: 0 };
        const view = renderer.getViewportStats();
        const lod = renderer.getLodDistribution();
        return {
          drawCalls: view.drawCalls,
          triangles: view.triangles,
          ...chunks,
          lod: { instances: { ...lod.instances }, buckets: { ...lod.buckets } },
        };
      },
    };
    window.__scatterSmoke = scatterSmoke;
  }
  // T008.2 DEV 出图面：window.__tree3a（slot-0 锚点树直挂渲染场景——独立 group 挂 scene
  // 兄弟组不参与拾取，沿散布 root D5 先例；转台/固定机位取景供 008.3 剪影自检与锚点取证。
  // T008.3 扩展：mountWindDemo 风动验收（aSeed 相位差异）+ freezeTime 锚点取证冻结风相位
  //（time 注入 Renderer.uTime——同一全局时钟，冻结即整树静止）。实现全在
  // runtime/procedural/tree/tree3a/tree3aStage——组合根只装配，dispose 只摘自己的实例）。
  let tree3a: Tree3aHandle | null = null;
  if (import.meta.env.DEV && renderer && typeof window !== 'undefined') {
    tree3a = createTree3aHandle({
      scene: renderer.scene,
      camera: renderer.camera,
      controls: renderer.controls,
      time: renderer.uTime,
    });
    window.__tree3a = tree3a;
  }
  // T011.1 DEV 出图面：window.__celtis（朴树 slot-0 锚点树直挂渲染场景——夏栎 __tree3a
  // 同构装配：独立 group 挂 scene 兄弟组不参与拾取；mount/mountSlots 8 槽批量 /
  // mountLevels 三档对照 / 风动 / freezeTime / 固定机位 view 系供视觉取证与档位生成
  // 验证。实现全在 runtime/procedural/tree/celtis/celtisStage——组合根只装配，dispose
  // 只摘自己的实例）。
  let celtis: CeltisHandle | null = null;
  if (import.meta.env.DEV && renderer && typeof window !== 'undefined') {
    celtis = createCeltisHandle({
      scene: renderer.scene,
      camera: renderer.camera,
      controls: renderer.controls,
      time: renderer.uTime,
    });
    window.__celtis = celtis;
  }
  // T011.2 DEV 出图面：window.__camphor（香樟 slot-0 锚点树直挂渲染场景——夏栎 __tree3a /
  // 朴树 __celtis 同构装配：独立 group 挂 scene 兄弟组不参与拾取；mount/mountSlots 8 槽批量 /
  // mountLevels 三档对照 / 风动 / freezeTime / 固定机位 view 系供视觉取证与档位生成
  // 验证。实现全在 runtime/procedural/tree/camphor/camphorStage——组合根只装配，dispose
  // 只摘自己的实例）。
  let camphor: CamphorHandle | null = null;
  if (import.meta.env.DEV && renderer && typeof window !== 'undefined') {
    camphor = createCamphorHandle({
      scene: renderer.scene,
      camera: renderer.camera,
      controls: renderer.controls,
      time: renderer.uTime,
    });
    window.__camphor = camphor;
  }
  // T009.7 性能验收 DEV 驱动面：window.__tree3aPerf（import.meta.env.DEV 守卫，生产零痕迹；
  // 无 Renderer（无头）不挂）。经产品放置路径（真实命令管线 → SceneSync → 实例化池）批量
  // 放置/清除夏栎 + 帧采样/资源计数/太阳阴影 A/B/固定机位——句柄只给数据，阈值/环境归
  // 任务书 009.7。dispose 只摘自己的对象与 window 槽（StrictMode 双挂载下先卸载者不得
  // 拆掉后挂载者的钩子）；无头测试经 createTree3aPerfHandle 工厂直接注桩。
  let tree3aPerf: Tree3aPerfHandle | null = null;
  if (import.meta.env.DEV && renderer && typeof window !== 'undefined') {
    tree3aPerf = createTree3aPerfHandle({
      history,
      sceneManager,
      assets,
      view: {
        scene: renderer.scene,
        camera: renderer.camera,
        controls: renderer.controls,
        stats: renderer,
      },
    });
    window.__tree3aPerf = tree3aPerf;
  }
  const ports: EditorPorts = {
    viewport: opts.ports?.viewport ?? renderer?.viewport ?? NOOP_PORTS.viewport,
    camera: opts.ports?.camera ?? renderer?.cameraController ?? NOOP_PORTS.camera,
    preview: opts.ports?.preview ?? renderer?.preview ?? NOOP_PORTS.preview,
    measure: opts.ports?.measure ?? renderer?.measureOverlay ?? NOOP_PORTS.measure,
  };

  // ── 测量会话域（T10.1）──
  // MeasureSession 单例（跨工具存活）+ measure:changed → 覆盖层提交层整组刷新订阅
  //（单一事件源：工具提交 / UI 清除全部 / 删除上一条同路；dispose 成对退订）。
  const measureSession = new MeasureSession(eventBus);
  const offMeasureSync = eventBus.on('measure:changed', () =>
    ports.measure.updateMeasurements(measureSession.list()),
  );

  // ── 工具 ──
  const toolContext: ToolContext = {
    sceneManager,
    selection,
    history,
    registries: { assets },
    viewport: ports.viewport,
    camera: ports.camera,
    preview: ports.preview,
    eventBus,
  };
  const tools = new ToolManager(toolContext);
  // SelectTool 注入框拟能力（RuntimeViewport 实现 pickInRect；无头/Fake 无此能力时为 null 退化）
  //   + 双击进入顶点编辑钩子（T6.8：双击 region → 激活 vertex-edit 携带目标；
  //     未注入时不响应）；TransformTool 注入 Gizmo（Renderer 提供 TransformControls 实现；
  //   无头为 null 桩）。
  const selectTool = new SelectTool(
    (renderer?.viewport as RectPickPort | undefined) ?? null,
    (objectId) => tools.activate(VERTEX_EDIT_TOOL_ID, { objectId }),
  );
  const transformTool = new TransformTool(renderer?.gizmo ?? null);
  // VertexEditTool 注入句柄层 Port（Renderer 提供；无头为 null 桩）与共享吸附会话开关
  const vertexEditTool = new VertexEditTool(renderer?.vertexEdit ?? null, vertexSnapSession);
  // 道路分割工具（T7.6 R4）：复用 T6.8 顶点句柄层 Port 显示节点（closed:false 会话）
  const roadSplitTool = new RoadSplitTool(renderer?.vertexEdit ?? null);
  const drawTools = [
    new DrawPolygonTool(drawGrid),
    new DrawRectangleTool(drawGrid),
    new DrawCircleTool(drawGrid),
    new DrawEllipseTool(drawGrid),
    new DrawFreehandTool(drawGrid),
    new DrawLineTool(drawGrid),
    new DrawPointTool(drawGrid),
  ];
  // 四测量工具（T10.1）：单实现类 + kind 参数，共享 MeasureSession 单例与网格吸附配置
  const measureTools = (['distance', 'height', 'area', 'angle'] as const).map(
    (kind) => new MeasureTool(kind, measureSession, ports.measure, drawGrid),
  );
  for (const tool of [selectTool, transformTool, vertexEditTool, roadSplitTool, new PlacementTool(), ...drawTools, ...measureTools]) {
    tools.register(tool);
    toolRegistry.register(tool);
  }
  // 顶点编辑「双击同一对象 / 面板再点」退出回选择（T6.8）：应用层策略接线，
  // 沿三步流 setExitToSelect 先例（工具层不持 ToolManager）。
  vertexEditTool.setExitToSelect(() => tools.activate(selectTool.id));
  // 道路分割完成后回选择（T7.6 R4，同一先例；工具自身随后 selectMany 两段）
  roadSplitTool.setExitToSelect(() => tools.activate(selectTool.id));
  // 三步流「完成即回选择工具」（T6.5）：六形状工具完成后经注入钩子回选择——工具层不持
  // ToolManager（契约 ToolContext 无此依赖），应用层策略在此接线；点工具保持连续放置
  // （DrawPointTool.exitsOnComplete=false），不注入亦不受影响。
  for (const tool of drawTools) {
    if (tool instanceof DrawToolBase) tool.setExitToSelect(() => tools.activate(selectTool.id));
  }

  // ── 浏览器接线：尺寸 / 渲染循环 / 输入 ──
  // StrictMode 双挂载安全（dev 下 createEditor(A) → dispose(A) → createEditor(B) 共用同一 canvas）：
  //  - 初始 resize 同步执行一次，但真正的纠错主力是 Renderer 渲染循环内的逐帧尺寸自检
  //    （布局未稳时 canvas 为默认 300×150，此时呈现的错误比例帧会在布局稳定后的下一帧被纠正；
  //    旧实现仅靠 ResizeObserver，一旦渲染通道异常就永久停在残影帧上）；
  //  - dispose 各步全部幂等，且不触碰共享 WebGL 上下文（Renderer.dispose 见注）。
  let resizeObserver: ResizeObserver | null = null;
  let input: InputController | null = null;
  if (canvas && renderer) {
    const resize = () => renderer.resize(canvas.clientWidth, canvas.clientHeight);
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
    }
    resize();
    renderer.renderLoop();
    if (opts.input !== false) {
      input = new InputController({
        viewportElement: canvas,
        tools,
        history,
        sceneManager,
        selection,
        camera: ports.camera,
        actions: actionsCore,
        onContextMenuRequest: opts.onContextMenuRequest,
      });
      input.attach();
    }
  }

  // ── 场景状态（SceneManager 之外的场景级字段）──
  let sceneId = initial.id;
  let sceneName = initial.name;
  let environment: SceneEnvironment = initial.environment;
  for (const layer of initial.layers) sceneManager.addLayer(layer);

  // ── 组合根订阅联动（T4.1 B2）──
  // 对象消失（删除 / 撤销创建 / 裸 removeObject）→ 同步清选中：选中集残留消失 id 会让
  // 属性面板继续展示旧对象数据（T3.4 验收观察项）。逐事件处理，不做聚合；
  // 命令路径的 deselectIfSelected 与本订阅幂等叠加（remove 对已移除 id 无二次事件）。
  const unsubscribeSelectionSync = eventBus.on('object:removed', ({ objectId }) => {
    if (selection.isSelected(objectId)) selection.remove(objectId);
  });

  let disposed = false;

  const facade: EditorHandle = {
    scene: sceneManager,
    selection,
    history,
    tools,
    registries: { assets, tools: toolRegistry, commands, presets },
    camera: ports.camera,
    drawGrid,
    objectSnap,
    snapTiers,
    footprintGhost: renderer?.preview ?? NOOP_FOOTPRINT_GHOST,
    actions: actionsCore,
    measure: measureSession,

    getEnvironment(): SceneEnvironment {
      return deepClone(environment);
    },

    setEnvironment(env: SceneEnvironment): void {
      environment = deepClone(env);
      renderer?.applyEnvironment(environment); // 视觉生效：组合根接线（T2.4）
      eventBus.emit('scene:changed', { source: 'setEnvironment' }); // 不入历史（任务书语义）
    },

    getGrid(): SceneGrid {
      return coerceSceneGrid(environment.grid ?? { spacing: drawGrid.spacing });
    },

    setGrid(grid: SceneGrid): void {
      const next = coerceSceneGrid(grid);
      environment = { ...deepClone(environment), grid: next };
      drawGrid.spacing = next.spacing; // 绘制吸附步长即时同步（共享对象，工具下次落点生效）
      renderer?.applyEnvironment(environment); // 网格视觉重建
      eventBus.emit('scene:changed', { source: 'setGrid' }); // 不入历史（环境类配置）
    },

    groundPoint(x: number, y: number): Vec3 | null {
      return ports.viewport.groundPoint(x, y);
    },

    pickObject(x: number, y: number): ID | null {
      return ports.viewport.pickObject(x, y);
    },

    getViewportStats(): { fps: number; triangles: number; drawCalls: number } {
      return renderer?.getViewportStats() ?? { fps: 0, triangles: 0, drawCalls: 0 };
    },

    getSceneName(): string {
      return sceneName;
    },

    setMinimapVisible(visible: boolean): void {
      renderer?.minimap.setVisible(visible); // 无头形态：renderer 为 null，安全 no-op
    },

    openScene(data: SceneData): void {
      tools.deactivate();
      selection.clear();
      sceneManager.clear(); // scene:changed{clear} → Renderer resyncAll（清空视图）
      // v2 反序列化已 fail-fast 校验对象类型（region/model），无旧要素类型兜底（T6.9：
      // 版本门拒绝 v1 文件 + LEGACY_ELEMENT_TYPES 跳过兜底随之删除——死代码收口）。
      const objects = data.objects.map((o) => deepClone(o));
      const objectsById = new Map(objects.map((o) => [o.id, o] as const));
      for (const layer of data.layers) {
        const cloned: Layer = deepClone(layer);
        // 派生索引以文件顺序为基底，剔除不在场景或已改属的陈旧 id；缺失项由 addObject 补齐。
        // 图层列表原样保留（openScene 不改写 layers）。
        cloned.objectIds = cloned.objectIds.filter((id) => objectsById.get(id)?.layerId === cloned.id);
        sceneManager.addLayer(cloned);
      }
      for (const obj of objects) sceneManager.addObject(obj); // object:created → Renderer attach
      sceneId = data.id;
      sceneName = data.name;
      environment = deepClone(data.environment);
      drawGrid.spacing = coerceSceneGrid(data.environment.grid).spacing; // 打开场景同步吸附步长
      renderer?.applyEnvironment(environment);
      history.clear();
    },

    saveScene(): string {
      // 诊断档（clay/normals/islands）为会话级视口态，不入场景文件（T8.4「明确不做」#4）：
      // 保存时剥离 renderMode 键（置 undefined，JSON.stringify 自然丢弃；重新打开回退
      // shaded）；常规三态（shaded/wireframe/xray）照旧随场景往返。SceneSerializer 保持
      // 「environment 整体透传」语义不动——剥离只在组装出口做。
      const outgoing = deepClone(environment);
      if (isDiagnosticRenderMode(outgoing.renderMode)) outgoing.renderMode = undefined;
      const data: SceneData = {
        version: '2.0',
        id: sceneId,
        name: sceneName,
        environment: outgoing,
        layers: sceneManager.getLayers().map((l) => deepClone(l)),
        objects: sceneManager.getObjects().map((o) => deepClone(o)),
      };
      return new SceneSerializer().serialize(data);
    },

    dispose(): void {
      if (disposed) return;
      disposed = true;
      unsubscribeSelectionSync(); // 订阅成对退订（T4.1 B2）
      offMeasureSync(); // 测量提交层同步订阅成对退订（T10.1）
      clearStyleNotifier(styleNotifier); // 引擎通知通道成对清理（仅清自己的，T6.2）
      // T003.2 DEV 冒烟面成对拆除（仅摘自己的实例——双挂载下后挂载者的钩子不受影响）
      if (scatterSmoke && typeof window !== 'undefined' && window.__scatterSmoke === scatterSmoke) {
        delete window.__scatterSmoke;
      }
      // T008.2 DEV 出图面成对拆除（同上：仅摘自己的树与 window 槽）
      if (tree3a && typeof window !== 'undefined' && window.__tree3a === tree3a) {
        tree3a.dispose();
        delete window.__tree3a;
      }
      // T011.1 DEV 出图面成对拆除（同上：仅摘自己的树与 window 槽）
      if (celtis && typeof window !== 'undefined' && window.__celtis === celtis) {
        celtis.dispose();
        delete window.__celtis;
      }
      // T011.2 DEV 出图面成对拆除（同上：仅摘自己的树与 window 槽）
      if (camphor && typeof window !== 'undefined' && window.__camphor === camphor) {
        camphor.dispose();
        delete window.__camphor;
      }
      // T009.7 性能验收驱动面成对拆除（clear 自己的对象——经命令；仅摘自己的 window 槽）
      if (tree3aPerf && typeof window !== 'undefined' && window.__tree3aPerf === tree3aPerf) {
        tree3aPerf.dispose();
        delete window.__tree3aPerf;
      }
      tools.deactivate();
      input?.dispose();
      resizeObserver?.disconnect();
      renderer?.dispose();
    },
  };

  return facade;
}

/** 命令工厂注册（CommandRegistry.create(type, data) 分发）；v1 ChangeStyle/ChangeGeometry 已随旧要素体系退役（T6.7） */
function createCommandRegistry(): CommandRegistry {
  const registry = new CommandRegistry();
  registry.register('CreateObjectCommand', (d: { object: SceneObject }) => new CreateObjectCommand(d.object));
  registry.register('DeleteObjectCommand', (d: { objectId: ID }) => new DeleteObjectCommand(d.objectId));
  registry.register(
    'TransformCommand',
    (d: { objectId: ID; before: SceneObject['transform']; after: SceneObject['transform'] }) =>
      new TransformCommand(d.objectId, d.before, d.after),
  );
  registry.register(
    'ChangePropertyCommand',
    (d: { objectId: ID; patch: Record<string, unknown> }) => new ChangePropertyCommand(d.objectId, d.patch),
  );
  registry.register(
    'ChangeLayerCommand',
    (d: { objectId: ID; layerId: ID | null }) => new ChangeLayerCommand(d.objectId, d.layerId),
  );
  registry.register('BatchCommand', (d: { commands: Command[] }) => new BatchCommand(d.commands));
  registry.register(
    'UpdateObjectCommand',
    (d: { objectId: ID; patch: { name?: string; visible?: boolean; locked?: boolean } }) =>
      new UpdateObjectCommand(d.objectId, d.patch),
  );
  registry.register(
    'UpdateLayerCommand',
    (d: { layerId: ID; patch: { name?: string; visible?: boolean; locked?: boolean; opacity?: number; order?: number } }) =>
      new UpdateLayerCommand(d.layerId, d.patch),
  );
  // 阶段 6 region 三命令工厂（T6.1；过渡期与 v1 并存结束，v1 两条已删）
  registry.register(
    'ChangeShapeCommand',
    (d: { objectId: ID; shape: RegionObject['shape'] }) => new ChangeShapeCommand(d.objectId, d.shape),
  );
  registry.register(
    'ChangeSemanticCommand',
    (d: { objectId: ID; semantic: RegionObject['semantic'] }) => new ChangeSemanticCommand(d.objectId, d.semantic),
  );
  registry.register(
    'ChangePresetCommand',
    (d: { objectId: ID; style: RegionObject['style'] }) => new ChangePresetCommand(d.objectId, d.style),
  );
  // 道路几何两命令（T7.6 R4/R5：shape 级几何命令，单命令单历史）
  registry.register(
    'SplitRoadCommand',
    (d: { objectId: ID; splitIndex: number }) => new SplitRoadCommand(d.objectId, d.splitIndex),
  );
  registry.register(
    'MergeRoadCommand',
    (d: { firstId: ID; secondId: ID }) => new MergeRoadCommand(d.firstId, d.secondId),
  );
  return registry;
}
