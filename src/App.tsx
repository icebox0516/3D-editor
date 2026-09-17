/**
 * App —— 应用外壳（app 层）：四区一层布局（T5.1）组装——主菜单条（T5.2：七菜单 +
 *        右侧常驻撤销/重做/保存/状态点 + 提示条承接）/ 上下文条（T5.6 ContextToolbar：
 *        QWER 组 + 吸附/网格 toggle + 绘制中段 + 模式徽标/Scene 选择器 + 视图动作钮
 *        （T5.7 起仅聚焦 F/全景 Home——机位收编 HUD）+ 面板组显隐开关）/ 垂直工具条
 *        （T5.6：六类绘制入口 48px 常驻列）/ 左面板组（大纲（场景大纲 + 图层管理双标签，
 *        T5.3）；T5.6 DrawPanel 退役后绘制入口归垂直条与 Context Toolbar）/ 视口
 *        （T5.7 四角 HUD：模式/机位/场景名 + Perspective ▼ / Shaded ▼ / Viewport Options，
 *        左下坐标轴指示器为 runtime 自建 canvas）/ 右面板组（检查器三标签：对象属性 +
 *        环境设置 + 全局设置（网格设置自左栏迁入），T5.4）/ 底部内容浏览器（ContentBrowser
 *        双态 60/280 + 拖放放置，T5.5）/ 底部状态栏（T3.3 绘制读数 + T5.7 游标坐标与
 *        Objects/Triangles/FPS/Unit 指标），并把组合根 createEditor 产出的 EditorHandle
 *        与 EventBus 桥接进 zustand store；布局尺寸与显隐归 workspaceStore（拖宽经
 *        Splitter、折叠经 PanelFrame、显隐经上下文条开关、Inspector 标签经
 *        workspaceStore.inspectorTab）。
 *
 * 数据流：
 *   mount → createEditor(canvas, { eventBus })（Renderer + Port + 工具 + 默认场景 + 输入接线）
 *         → store.attach(facade, eventBus, { camera })（UI 订阅 selection/history/tool/scene/draw 事件）
 *         → createEditorActions({ facade, core: facade.actions, workspace, ... })（T5.2 统一路由：
 *            菜单/常驻区只发 actionId；io 解析与文件读取全在 app 层动作内）
 *         → actions.resetSavedBaseline()（保存基线 → saved）
 *         → loadManifest() → registerAssets()（资产列表可点击 → 放置模式）
 *   保存状态机：sceneVersion（scene:changed 递增）→ actions.scheduleDirtyCheck()（节流
 *            500ms 快照对比，≠ 基线 → SCENE_CHANGED → dirty；= 基线 → SCENE_LOADED）
 *            → reduceSaveStatus 纯 reducer → 顶部状态点；beforeunload 在 dirty/error 时拦截
 *   菜单动作 → onAction(actionId) → actions.dispatch（文件/编辑/场景/资产/工具/视图/帮助）
 *   工作区持久化（T7.3）→ initWorkspacePersistence()：mount 恢复 t3d-editor.workspace
 *             快照（布局字段 + mode）→ 订阅防抖 300ms 写回；与场景数据完全解耦
 *   纯三维模式（T7.4，需求 14 章）→ Tab 键 / 视图菜单 view.pure3d 三路同源
 *             （toolIA.togglePure3d：进入取消绘制/放置/顶点编辑 + 关右键菜单）；
 *             zone 变量 + 三 token 内联归零隐藏面板/工具条/状态栏，根挂 ed-app--pure3d
 *             （布局字段不动，退出精确还原；HUD 底部提示芯片仅纯三维渲染）
 *   资产点击 → tools.activate('placement', …)；首次交互后 ThumbnailCache（内存 + IndexedDB）
 *             经 OffscreenSnapshotter 离屏快照替换 SVG 占位缩略图
 *   资产拖放 → 视口 drop → EditorHandle.groundPoint（clientXY 原样）→ editor 层共享工厂
 *             createModelObjectAt（确定性姿态）→ CreateObjectCommand → 选中 → Inspector
 *             自动打开（右面板隐藏则恢复 + 切「对象属性」）；无效落点 Toast 提示不入历史
 *   绘制入口（T5.6 起）→ 垂直工具条 / 数字键 1–6 / 大纲「创建 ▾」/ Context Toolbar 中段
 *             切换器 → toolIA 共享入口（activate + store 记账）→ tools.activate('draw-*',
 *             { elementType, perspective: false })（T3.2 三工具）；draw:status → store →
 *             底部状态栏（长度 / 面积 / 坐标 / 拦截提示）
 *   手势（T5.8 行业惯例迁移）→ 左键=选择/确认（工具层）；右拖=旋转、中拖=平移、滚轮=缩放
 *             （OrbitControls.mouseButtons 重映射）；右键点按（<4px 无拖拽）→ InputController
 *             classifyRightButton → onContextMenuRequest → 此处 pickObject 命中判定 →
 *             命中未选中先归一选中 → store.openContextMenu（四类菜单，ContextMenu 组件呈现，
 *             动作复用 actions 路由 + ctx.* 上下文处理器）；ESC=唯一退出手势
 *   环境面板 → facade.setEnvironment({ preset })；网格面板 → facade.setGrid（environment.grid
 *             + 绘制吸附步长共享对象，均改数据 + 发事件 + Renderer 应用；不入历史）——
 *             T5.4 起两面板收编进 InspectorPanel 的「环境设置 / 全局设置」标签，接线不变
 *   任意工具退出（ESC → tool:changed(null)）→ 自动回到选择工具，视口始终可选中
 *   操作反馈（T5.8）→ 全部走右下角 Toast（ui/feedback/toastStore 队列：导入结果 / 保存失败 /
 *             资产清单失败 / 无效放置位置 / 拖放未注册；顶部 notice 条已退役）
 * 边界：io 层解析只在 app 层（动作路由内；ui 组件只见 EditorFacade / store / actionId）；
 *      环境预设 / 网格切换经组合根句柄（EditorHandle.setEnvironment/setGrid，T2.4/T3.3 接线出口）。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { EventBus } from './core/events/EventBus';
import type { AssetCommonMeta, AssetDescriptor } from './domain/assets';
import type { ImportMapping } from './io/JsonImporter';
import { BUILTIN_TEMPLATES, listUserTemplates, saveUserTemplate } from './io/templates';
import buildingMappingJson from '../assets/mappings/building.example.json';
import { coerceRenderMode } from './scene/SceneData';
import { isShapeType } from './domain/regions';
import {
  ENVIRONMENT_PRESETS,
  createEditor,
  defaultLayerIdFor,
  loadManifest,
  registerAssets,
} from './app/bootstrap';
import type { EditorHandle } from './app/bootstrap';
import { createEditorActions } from './app/actions';
import type { EditorActions } from './app/actions';
import { useSceneDialogs } from './app/sceneDialogs';
import {
  ContentBrowser,
  ContextMenu,
  ContextToolbar,
  InspectorPanel,
  MenuBar,
  OutlinerPanel,
  Splitter,
  StatusBar,
  Toasts,
  VerticalToolbar,
  ViewButtons,
  Viewport,
  SHAPE_CREATE_ENTRIES,
  enterShapeDraw,
  initWorkspacePersistence,
  pushToast,
  reduceSaveStatus,
  useEditorStore,
  useWorkspaceStore,
  ASSET_DRAG_MIME,
  isAssetDrag,
  parseAssetDragId,
  BatchRenameDialog,
  POPUP_ROOT_ID,
} from './ui';
import type {
  ContextMenuItemDef,
  ContextMenuState,
  HelpDialog,
  MenuState,
  PanelZone,
  RenderMode,
  SaveState,
  TemplateSummary,
} from './ui';
import { BatchCommand } from './editor/commands/BatchCommand';
import { ChangeLayerCommand } from './editor/commands/ChangeLayerCommand';
import { CreateObjectCommand } from './editor/commands';
import { UpdateObjectCommand } from './editor/commands/UpdateObjectCommand';
import { createModelObjectAt, defaultAssetTransform } from './editor/factories/modelFactory';
import { isGroupObject } from './scene/GroupObject';
import { selectGroupMemberIds } from './ui/panels/hierarchyModel';
import { IndexedDbThumbnailStore, OffscreenSnapshotter, ThumbnailCache } from './runtime/loaders/ThumbnailCache';

/** 阶段一内置导入映射（assets/mappings/building.example.json；可配置映射选择器属后续任务） */
const BUILDING_MAPPING = buildingMappingJson as ImportMapping;

/** 内置模板清单摘要（T8.2 menuState.templates 前段；随构建打包不可变） */
const BUILTIN_TEMPLATE_SUMMARIES: TemplateSummary[] = BUILTIN_TEMPLATES.map((t) => ({
  id: t.id,
  name: t.name,
  builtin: true,
}));

const SELECT_TOOL_ID = 'select';
const PLACEMENT_TOOL_ID = 'placement';
/** 拖放落点高亮类（挂 .ed-viewport 容器：dragover 加 / dragleave·drop 移除） */
const VIEWPORT_DROP_TARGET_CLASS = 'ed-viewport--drop-target';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const facadeRef = useRef<EditorHandle | null>(null);
  /** 统一动作路由（菜单/常驻区 → actionId → 门面/共享核心/workspace/帮助弹层） */
  const actionsRef = useRef<EditorActions | null>(null);
  /** 真实缩略图缓存（内存 + IndexedDB）与离屏快照生产者（懒建 WebGL，随组合根销毁） */
  const thumbnailsRef = useRef<{ cache: ThumbnailCache; snapshotter: OffscreenSnapshotter } | null>(null);
  /** 内容浏览器数据源：统一描述符（GLB + 程序化混排；自注册表读出，T002.2） */
  const [assets, setAssets] = useState<AssetDescriptor[]>([]);
  /** 程序化资产缩略图（assetId → dataURL；离屏快照异步回填，T002.2） */
  const [proceduralThumbnails, setProceduralThumbnails] = useState<Map<string, string>>(
    () => new Map(),
  );
  /** 保存状态机（纯 reducer 驱动；事件来自 actions 路由的快照对比/保存出口） */
  const [saveState, setSaveState] = useState<SaveState>('saved');
  /** 帮助弹层（help.shortcuts / help.about 动作 → 受控开关） */
  const [helpDialog, setHelpDialog] = useState<HelpDialog>(null);
  /** 无事件通道的会话态：吸附开关（机位/渲染模式走 store 与环境通道，T5.7） */
  const [snapEnabled, setSnapEnabled] = useState(true);
  /** 吸附设置变更 tick（drawGrid/objectSnap 共享对象无事件通道，变更后驱动重读，T7.6） */
  const [snapSettingsTick, setSnapSettingsTick] = useState(0);
  /** README.md 可达（HEAD 探测；不可达则「操作说明」禁用） */
  const [readmeAvailable, setReadmeAvailable] = useState(false);
  /** 内部剪贴板空/非空变化 tick（facade.actions.subscribe → hasClipboard 位） */
  const [clipboardTick, setClipboardTick] = useState(0);
  /** 用户模板清单摘要（T8.2「新建场景 ▾」子菜单数据源；localStorage 直读刷新） */
  const [userTemplateSummaries, setUserTemplateSummaries] = useState<TemplateSummary[]>([]);
  /** 批量重命名弹层开关（T8.3 ctx.batch-rename 上下文动作；选中集清空自动关闭） */
  const [batchRenameOpen, setBatchRenameOpen] = useState(false);
  /** saveState 实时读（sceneDialogs dirty 确认口径；组合根 mount 闭包防陈旧捕获） */
  const saveStateRef = useRef(saveState);
  saveStateRef.current = saveState;

  /** 刷新用户模板清单 state（另存/改名/删除后；actions deps.refreshTemplates 同源） */
  const refreshTemplates = useCallback(() => {
    setUserTemplateSummaries(listUserTemplates().map((t) => ({ id: t.id, name: t.name, builtin: false })));
  }, []);

  // ── T8.2 场景模板与批量导入弹层（dirty 确认 / 命名 / 管理 / 导入预览）──
  const sceneDialogs = useSceneDialogs(useCallback(() => saveStateRef.current, []), refreshTemplates);

  /** 订阅场景版本：环境面板的当前预设据此重读（setEnvironment/openScene 均发 scene:changed） */
  const sceneVersion = useEditorStore((s) => s.sceneVersion);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const activeToolId = useEditorStore((s) => s.activeToolId);
  /** 机位会话记账（T5.7：菜单 checked 与 HUD Perspective ▼ 同源；无事件通道，各 setMode 入口写回） */
  const cameraMode = useEditorStore((s) => s.cameraMode);
  const setCameraMode = useEditorStore((s) => s.setCameraMode);
  /** 打开中的上下文菜单目标（T5.8；呈现归 ContextMenu 组件） */
  const contextMenuTarget = useEditorStore((s) => s.contextMenu);

  // ── 布局状态（T5.1 四区一层）：区域尺寸/显隐 → 菜单 checked 位 + CSS Grid 轨道内联变量 ──
  const leftWidth = useWorkspaceStore((s) => s.leftWidth);
  const rightWidth = useWorkspaceStore((s) => s.rightWidth);
  const bottomHeight = useWorkspaceStore((s) => s.bottomHeight);
  const hiddenPanels = useWorkspaceStore((s) => s.hiddenPanels);
  /** 显式工作模式（T7.1：视图菜单模式子菜单 checked 位；徽标/HUD 经 combineMode 消费） */
  const workMode = useWorkspaceStore((s) => s.mode);
  /** 纯三维工作模式（T7.4：视图菜单 checked 位；zone 变量覆写 + 根类名消费） */
  const pure3d = useWorkspaceStore((s) => s.pure3d);

  /** 触发真实缩略图生产（首次交互或程序化注册时；命中缓存零开销）。T002.2 起按 kind 分派：
   *  file → GLB 离屏快照替换 SVG 占位（懒：已有 dataURL 即跳过）；
   *  procedural → 程序化源一次性 build 快照（无占位 SVG，失败 toast 提示 + 首字形兜底，不阻塞浏览） */
  const kickThumbnail = useCallback((descriptor: AssetDescriptor) => {
    const thumbnails = thumbnailsRef.current;
    if (!thumbnails) return;
    if (descriptor.kind === 'file') {
      const asset = descriptor.asset;
      if (asset.thumbnail === undefined || asset.thumbnail.startsWith('data:')) return;
      thumbnails.cache
        .get(asset, thumbnails.snapshotter)
        .then((url) => {
          if (!url) return;
          setAssets((prev) =>
            prev.map((d) =>
              d.kind === 'file' && d.asset.id === asset.id
                ? { kind: 'file', asset: { ...d.asset, thumbnail: url } }
                : d,
            ),
          );
        })
        .catch(() => undefined);
      return;
    }
    const meta = descriptor.asset;
    thumbnails.cache
      .getProcedural(meta, thumbnails.snapshotter)
      .then((url) => {
        if (!url) {
          pushToast('info', `程序化资产「${meta.name}」缩略图生成失败，已用占位图`);
          return;
        }
        setProceduralThumbnails((prev) => {
          if (prev.get(meta.id) === url) return prev;
          const next = new Map(prev);
          next.set(meta.id, url);
          return next;
        });
      })
      .catch(() => undefined);
  }, []);

  // ── 组合根装配（一次）──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const eventBus = new EventBus();
    // 右键点按（分类器 tap）：命中判定 + 选中归一 → store 菜单目标（T5.8）。
    // 绘制/放置中恒走空白菜单（首项「取消绘制」优先级最高）；命中对象未在选中集
    // → 先单选（行业惯例：右键菜单作用于选中集，多选右键成员保持多选语义）。
    const facade = createEditor(canvas, {
      eventBus,
      onContextMenuRequest: (x, y) => {
        const active = facade.tools.getActiveTool()?.id ?? null;
        const drawing = active !== null && active !== SELECT_TOOL_ID && active !== 'transform';
        if (!drawing) {
          const hit = facade.pickObject(x, y);
          if (hit !== null) {
            if (!facade.selection.isSelected(hit)) facade.selection.select(hit);
            useEditorStore.getState().openContextMenu({ source: 'viewport-object', x, y, objectId: hit });
            return;
          }
        }
        useEditorStore.getState().openContextMenu({ source: 'viewport-blank', x, y });
      },
    });
    facadeRef.current = facade;
    const detachStore = useEditorStore
      .getState()
      .attach(facade, eventBus, {
        camera: facade.camera,
        session: facade,
        footprintGhost: facade.footprintGhost, // 对齐/阵列足迹预览（T7.6，runtime PreviewManager）
        measure: facade.measure, // 测量会话（T10.2 删除上一条/清除全部动作端口，组合根单例）
      });

    // 统一动作路由（T5.2）：菜单只发 actionId；io 与文件读取在动作内。
    // T8.2 场景模板与批量导入：弹层走 sceneDialogs（受控 UI），存储 CRUD 走
    // io/templates userTemplates（localStorage 直读，会话内改动即时可见）。
    const actions = createEditorActions({
      facade,
      core: facade.actions,
      importMapping: BUILDING_MAPPING,
      getPanelHidden: (zone) => useWorkspaceStore.getState().hiddenPanels[zone],
      setPanelHidden: (zone, hidden) => useWorkspaceStore.getState().setPanelHidden(zone, hidden),
      // 小地图开关（T7.7）：与齿轮 Viewport Options「小地图」同源（workspaceStore 记账）
      getMinimapVisible: () => useWorkspaceStore.getState().minimapVisible,
      setMinimapVisible: (visible) => useWorkspaceStore.getState().setMinimapVisible(visible),
      setInspectorTab: (tab) => useWorkspaceStore.getState().setInspectorTab(tab),
      emitSaveEvent: (event) => setSaveState((s) => reduceSaveStatus(s, event)),
      notify: (n) => pushToast(n.kind, n.text),
      openHelpDialog: (which) => setHelpDialog(which),
      // 渲染模式（T5.7）：环境通道 environment.renderMode——菜单与 HUD Shaded ▼ 同源
      // （scene:changed → sceneVersion 驱动两处 checked 重读），随场景保存/打开往返
      setRenderMode: (mode) => {
        const current = facade;
        current.setEnvironment({ ...current.getEnvironment(), renderMode: mode });
      },
      openUrl: (url) => window.open(url, '_blank', 'noopener'),
      // T8.2：模板清单 / dirty 确认 / 命名 / 管理弹层 / 多文件导入预览
      getUserTemplates: () => listUserTemplates(),
      saveUserTemplate: (name, scene) => saveUserTemplate(name, scene),
      refreshTemplates,
      confirmSceneReplace: sceneDialogs.confirmSceneReplace,
      promptTemplateName: sceneDialogs.promptTemplateName,
      openManageTemplates: sceneDialogs.openManageTemplates,
      showImportPreview: sceneDialogs.showImportPreview,
    });
    actions.resetSavedBaseline();
    actionsRef.current = actions;
    refreshTemplates(); // T8.2：用户模板清单初始装载（localStorage 直读）

    // 剪贴板空/非空 → 菜单「粘贴」enabled 位
    const offClipboard = facade.actions.subscribe(() => setClipboardTick((t) => t + 1));

    // 操作说明链接可达性（README 不随产物分发时禁用）
    fetch('README.md', { method: 'HEAD' })
      .then((response) => setReadmeAvailable(response.ok))
      .catch(() => setReadmeAvailable(false));

    // 缩略图两级缓存：IndexedDB 持久 + 离屏 WebGL 快照（首次放置某资产后替换 SVG 占位图）
    thumbnailsRef.current = {
      cache: new ThumbnailCache({ store: new IndexedDbThumbnailStore() }),
      snapshotter: new OffscreenSnapshotter(),
    };

    // 程序化资产缩略图自动生成（T002.2）：无 SVG 占位可显示，注册即快照；命中持久缓存零重生成，
    // 失败降级占位图 + toast（kick 内处理），不阻塞库浏览。新增资产 = 新 *.asset.ts 文件自动覆盖。
    for (const descriptor of facade.registries.assets.findByKind('procedural')) {
      kickThumbnail(descriptor);
    }

    // 工具退出后回到选择工具（右键 / ESC 退出放置后视口仍可点选）
    const offTool = eventBus.on('tool:changed', (p) => {
      if (p.toolId === null) facade.tools.activate(SELECT_TOOL_ID);
    });
    facade.tools.activate(SELECT_TOOL_ID);

    // ── 拖放放置（T5.5，验收 43.3）：ContentBrowser 卡片 dragstart → 视口 dragover
    //    高亮 → drop：clientXY 原样传 groundPoint（RuntimeViewport.toNDC 内部自减 rect）
    //    → editor 层共享工厂确定性构建 → CreateObjectCommand → 选中 → Inspector 联动。
    //    监听挂 canvas（ui 不 import app，接线归 App 层）；高亮类挂 .ed-viewport 容器 ──
    const dropTargetEl = canvas.parentElement; // Viewport 组件的 section.ed-viewport
    const onDragOver = (e: DragEvent): void => {
      if (!e.dataTransfer || !isAssetDrag(e.dataTransfer.types)) return; // 非资产拖拽不拦截
      e.preventDefault(); // 允许 drop
      e.dataTransfer.dropEffect = 'copy';
      dropTargetEl?.classList.add(VIEWPORT_DROP_TARGET_CLASS);
    };
    const onDragLeave = (): void => {
      dropTargetEl?.classList.remove(VIEWPORT_DROP_TARGET_CLASS);
    };
    const onDrop = (e: DragEvent): void => {
      onDragLeave();
      const dataTransfer = e.dataTransfer;
      if (!dataTransfer || !isAssetDrag(dataTransfer.types)) return;
      e.preventDefault();
      const current = facadeRef.current;
      const assetId = parseAssetDragId(
        dataTransfer.getData(ASSET_DRAG_MIME),
        dataTransfer.getData('text/plain'),
      );
      if (!current || !assetId) return;
      const descriptor = current.registries.assets.get(assetId);
      if (!descriptor) {
        pushToast('error', `拖放的资产未注册: ${assetId}`);
        return;
      }
      const asset = descriptor.asset; // 公共面（id/name/默认姿态）——建对象与 kind 无关（T002.1）
      const ground = current.groundPoint(e.clientX, e.clientY); // clientXY 原样（toNDC 自减 rect）
      if (!ground) {
        pushToast('info', '无效放置位置'); // 不产生命令/历史
        return;
      }
      const object = createModelObjectAt({
        asset,
        layerId: defaultLayerIdFor(current.scene, 'model'),
        // 确定性：资产默认姿态，无随机采样——T002.3 起有意保持不注入变体 seed（与 GLB
        // 拖放同语义：烘焙式变体掷骰只在点击放置链路 PlacementTool，拖放永远是标称形态）
        transform: defaultAssetTransform(asset, ground),
      });
      if (!current.history.execute(new CreateObjectCommand(object))) return; // 失败：场景未变
      current.selection.select(object.id);
      // Inspector 自动打开（43.3）：右面板隐藏则恢复显示，并切到「对象属性」标签
      useWorkspaceStore.getState().setPanelHidden('right', false);
      useWorkspaceStore.getState().setInspectorTab('object');
      kickThumbnail(descriptor); // 拖放也是首次交互：真实缩略图生产（两种 kind；best-effort）
    };
    canvas.addEventListener('dragover', onDragOver);
    canvas.addEventListener('dragleave', onDragLeave);
    canvas.addEventListener('drop', onDrop);

    let cancelled = false;
    loadManifest()
      .then((list) => {
        if (cancelled) return;
        registerAssets(facade, list);
        // 数据源 = 注册表全量描述符（GLB + 程序化混排；程序化在 createEditor 时已注册，T002.2）
        setAssets(facade.registries.assets.list());
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.warn('[App] 资产清单加载失败', err);
        pushToast('error', '资产清单加载失败：请先运行 npm run assets:scan');
        setAssets(facade.registries.assets.list()); // 程序化资产不依赖 manifest，照常浏览
      });

    return () => {
      cancelled = true;
      canvas.removeEventListener('dragover', onDragOver);
      canvas.removeEventListener('dragleave', onDragLeave);
      canvas.removeEventListener('drop', onDrop);
      offTool(); // 先退订，避免 dispose → deactivate → tool:changed(null) 触发重新激活
      offClipboard();
      actions.dispose();
      actionsRef.current = null;
      detachStore();
      thumbnailsRef.current?.snapshotter.dispose();
      thumbnailsRef.current = null;
      facade.dispose();
      facadeRef.current = null;
    };
  }, [kickThumbnail]);

  // ── 工作区自动持久化（T7.3，需求 30 章末段）：mount 恢复上次布局 + 工作模式 →
  //    订阅防抖写回（t3d-editor.workspace）。ui 本地状态接线，不触碰 facade/EventBus；
  //    StrictMode 双挂载幂等（恢复在订阅前、重复应用同一快照无副作用）──
  useEffect(() => initWorkspacePersistence(), []);

  // ── 小地图开关接线（T7.7）：workspaceStore.minimapVisible（随工作区快照持久化）
  //    → 组合根 EditorHandle.setMinimapVisible → runtime MinimapRenderer.setVisible。
  //    ui 层不 import runtime；恢复的快照值经本 effect 最终一致（mount 时先按当前态设置，
  //    持久化恢复改写 store 后再次触发）──
  const minimapVisible = useWorkspaceStore((s) => s.minimapVisible);
  useEffect(() => {
    facadeRef.current?.setMinimapVisible(minimapVisible);
  }, [minimapVisible]);

  // ── dirty 快照对比调度：scene:changed → 节流 500ms 对比（命令双发天然收敛）──
  useEffect(() => {
    actionsRef.current?.scheduleDirtyCheck();
  }, [sceneVersion]);

  // ── 脏退出守卫：dirty / 保存失败未处理时拦截关闭/刷新 ──
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent): void => {
      if (saveState === 'dirty' || saveState === 'error') {
        e.preventDefault();
        e.returnValue = ''; // 部分浏览器需显式赋值
      }
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [saveState]);

  // ── 工具切换会改机位（绘制进入/退出切顶视/还原）→ 刷新菜单/HUD 机位 checked ──
  useEffect(() => {
    const facade = facadeRef.current;
    if (facade) setCameraMode(facade.camera.getMode());
  }, [activeToolId, setCameraMode]);

  // ── 无事件通道的会话态重读（动作派发后 / 菜单展开时）：机位与吸附总开关 checked 位据此同步 ──
  const refreshSessionState = useCallback(() => {
    const facade = facadeRef.current;
    if (facade) {
      setCameraMode(facade.camera.getMode());
      setSnapEnabled(facade.snapTiers.masterEnabled); // T8.1：总开关（菜单/工具条同源）
    }
  }, [setCameraMode]);

  // ── 菜单/常驻区唯一出口：actionId → 统一路由；随后刷新无事件通道的会话态 ──
  const onAction = useCallback(
    (actionId: string) => {
      actionsRef.current?.dispatch(actionId);
      refreshSessionState();
    },
    [refreshSessionState],
  );

  // ── 环境预设切换：只改数据发事件（组合根应用视觉），不入历史 ──
  const onEnvironmentChange = useCallback((preset: string) => {
    facadeRef.current?.setEnvironment({ preset });
  }, []);

  // ── 网格配置：组合根写 environment.grid + 同步绘制吸附步长（T3.3 主代理裁定）──
  const onApplyGrid = useCallback((grid: Parameters<EditorHandle['setGrid']>[0]) => {
    facadeRef.current?.setGrid(grid);
  }, []);

  // ── 吸附设置（T7.6 R3 → T8.1 R4 分级）：共享对象直写即时生效（gizmo/顶点管线同源）；
  //     tick 驱动面板重读。总开关归 Context Toolbar 吸附钮 / 菜单 tool.snap（onToggleGridSnap
  //     不再走该路由——网格分项独立写 drawGrid.snapEnabled）──
  const snapSettings = (() => {
    const facade = facadeRef.current;
    if (!facade) return null;
    return {
      gridSnapEnabled: facade.drawGrid.snapEnabled,
      objectSnapEnabled: facade.objectSnap.enabled,
      objectSnapThreshold: facade.objectSnap.threshold,
      angleSnapEnabled: facade.snapTiers.angleEnabled,
      angleSnapStepDeg: facade.snapTiers.angleStepDeg,
      elevationSnapEnabled: facade.snapTiers.elevationEnabled,
    };
  })();
  void snapSettingsTick; // 设置变更后重读组合根共享对象

  const onToggleGridSnap = useCallback(() => {
    // 网格分项（T8.1）：直写共享对象（同时管辖绘制 G 网格与 gizmo 网格步长；
    // 总开关归 Context Toolbar / 菜单 tool.snap，两者分离）
    const facade = facadeRef.current;
    if (!facade) return;
    facade.drawGrid.snapEnabled = !facade.drawGrid.snapEnabled;
    setSnapSettingsTick((t) => t + 1);
  }, []);

  const onToggleObjectSnap = useCallback(() => {
    const facade = facadeRef.current;
    if (!facade) return;
    facade.objectSnap.enabled = !facade.objectSnap.enabled; // 共享对象直写：gizmo 下次拖拽生效
    setSnapSettingsTick((t) => t + 1);
  }, []);

  const onObjectSnapThreshold = useCallback((value: number) => {
    const facade = facadeRef.current;
    if (!facade) return;
    const clamped = Math.min(5, Math.max(0.05, Number.isFinite(value) ? value : 0.5));
    facade.objectSnap.threshold = clamped;
    setSnapSettingsTick((t) => t + 1);
  }, []);

  const onToggleAngleSnap = useCallback(() => {
    const facade = facadeRef.current;
    if (!facade) return;
    facade.snapTiers.angleEnabled = !facade.snapTiers.angleEnabled;
    setSnapSettingsTick((t) => t + 1);
  }, []);

  const onAngleSnapStep = useCallback((value: number) => {
    const facade = facadeRef.current;
    if (!facade) return;
    const clamped = Math.min(360, Math.max(0.1, Number.isFinite(value) ? value : 15));
    facade.snapTiers.angleStepDeg = clamped;
    setSnapSettingsTick((t) => t + 1);
  }, []);

  const onToggleElevationSnap = useCallback(() => {
    const facade = facadeRef.current;
    if (!facade) return;
    facade.snapTiers.elevationEnabled = !facade.snapTiers.elevationEnabled;
    setSnapSettingsTick((t) => t + 1);
  }, []);

  // ── 资产点击 → 放置模式（归入 Models 图层）；首次点击触发真实缩略图生产（best-effort）──
  const onPickAsset = useCallback(
    (asset: AssetCommonMeta) => {
      const facade = facadeRef.current;
      if (!facade) return;
      useEditorStore.getState().setPlacingAssetId(asset.id);
      useEditorStore.getState().setLastAssetId(asset.id); // 资产组入口（键 4 / 垂直条）重放记忆
      facade.tools.activate(PLACEMENT_TOOL_ID, {
        assetId: asset.id,
        layerId: defaultLayerIdFor(facade.scene, 'model'),
      });
      canvasRef.current?.focus();

      // 首次点击 → 离屏快照替换 SVG 占位缩略图；命中缓存则零开销（第二次点击不再渲染）。
      // 两种 kind 同路（T002.2）：GLB 懒快照；程序化启动已自动生成，此处即缓存命中/失败重试
      const descriptor = facade.registries.assets.get(asset.id);
      if (descriptor) kickThumbnail(descriptor);
    },
    [kickThumbnail],
  );

  const environmentPreset = facadeRef.current?.getEnvironment().preset ?? ENVIRONMENT_PRESETS[0].id;
  const sceneGrid = facadeRef.current?.getGrid();
  /** 渲染模式自环境通道派生（sceneVersion 驱动重读；菜单与 HUD Shaded ▼ 同源） */
  const renderMode: RenderMode = coerceRenderMode(facadeRef.current?.getEnvironment().renderMode);
  void sceneVersion; // 版本号变化时重读当前环境预设与网格配置
  void clipboardTick; // 剪贴板变化时重读 hasClipboard

  // ── 上下文菜单（T5.8）：状态汇总 + 动作路由 ──
  /** 菜单目标对象（视口命中 / 大纲行；隐藏/锁定文案与 Toggle 基准） */
  const contextObject =
    contextMenuTarget && 'objectId' in contextMenuTarget
      ? facadeRef.current?.scene.getObject(contextMenuTarget.objectId)
      : undefined;
  /** buildContextMenu 纯模型的输入（App 从各 store / 门面汇总） */
  const contextState: ContextMenuState = {
    ready: facadeRef.current !== null,
    hasSelection: selectedIds.length > 0,
    hasClipboard: facadeRef.current?.actions.hasClipboard() ?? false,
    drawing:
      activeToolId !== null && activeToolId !== SELECT_TOOL_ID && activeToolId !== 'transform',
    cameraMode,
    renderMode,
    gridVisible: sceneGrid?.visible ?? true,
    layers: (facadeRef.current?.scene.getLayers() ?? []).map((l) => ({ id: l.id, name: l.name })),
    object: contextObject
      ? {
          id: contextObject.id,
          visible: contextObject.visible,
          locked: contextObject.locked,
          isGroup: isGroupObject(contextObject), // T8.5：组行专属「选中组内对象」
        }
      : undefined,
    // T8.5：选中集含组壳 →「解散组」可用（解散作用域 = 选中集内全部组壳）
    selectionHasGroup:
      facadeRef.current !== null &&
      selectedIds.some((id) => {
        const obj = facadeRef.current!.scene.getObject(id);
        return obj !== undefined && isGroupObject(obj);
      }),
    createEntries: SHAPE_CREATE_ENTRIES,
  };

  /** 菜单条目派发：通用 actionId 走 actions 路由；ctx.* 上下文动作在此处理 */
  const onContextAction = useCallback(
    (item: ContextMenuItemDef) => {
      const facade = facadeRef.current;
      const actions = actionsRef.current;
      if (!facade || !actions) return;
      const target = useEditorStore.getState().contextMenu;
      const arg = item.arg;

      // 通用动作（与主菜单同路）：剪贴板/删除 + 机位/渲染模式/网格
      if (
        item.id === 'edit.copy' ||
        item.id === 'edit.paste' ||
        item.id === 'edit.delete' ||
        item.id.startsWith('view.camera-') ||
        item.id.startsWith('view.render-') ||
        item.id === 'view.grid'
      ) {
        actions.dispatch(item.id);
        refreshSessionState();
        return;
      }

      switch (item.id) {
        case 'ctx.cancel-draw':
          facade.tools.cancel(); // 唯一退出手势同路（ESC）
          break;
        case 'ctx.create': {
          // T6.5 七形状新流程入口：arg = 形状类型（多边形/矩形/圆形/椭圆/自由/路径/点）
          if (arg !== undefined && isShapeType(arg)) enterShapeDraw(facade, arg);
          break;
        }
        case 'ctx.focus': {
          const ids = facade.selection.getSelectedIds();
          if (ids.length > 0) facade.camera.focusObjects(ids);
          break;
        }
        case 'ctx.drop-to-ground': {
          // 贴地（T8.1 R5）：y 落到下方最近高度候选层；与 End 键同一动作核心
          facade.actions.dropSelectionToGround();
          break;
        }
        case 'ctx.hide':
        case 'ctx.lock': {
          // 作用于选中集（右键目标已归一进选中集）；目标态取菜单目标对象的反相，全组统一
          const objects = facade
            .selection.getSelectedIds()
            .map((id) => facade.scene.getObject(id))
            .filter((o): o is NonNullable<typeof o> => o !== undefined);
          if (objects.length === 0) break;
          const next =
            item.id === 'ctx.hide'
              ? !(contextObject?.visible ?? true)
              : !(contextObject?.locked ?? false);
          const commands = objects.map((o) =>
            item.id === 'ctx.hide'
              ? new UpdateObjectCommand(o.id, { visible: next })
              : new UpdateObjectCommand(o.id, { locked: next }),
          );
          facade.history.execute(commands.length === 1 ? commands[0] : new BatchCommand(commands));
          break;
        }
        case 'ctx.move-to-layer': {
          if (!arg) break;
          const commands = facade
            .selection.getSelectedIds()
            .filter((id) => facade.scene.getObject(id) !== undefined)
            .map((id) => new ChangeLayerCommand(id, arg));
          if (commands.length > 0) {
            facade.history.execute(commands.length === 1 ? commands[0] : new BatchCommand(commands));
          }
          break;
        }
        case 'ctx.rename': {
          // 聚焦 Inspector 名称字段：恢复右面板 + 切「对象属性」，渲染后聚焦稳定 id 的输入框。
          // 延迟 150ms：面板恢复/标签切换的 React commit 会重建输入框，0ms 聚焦会被重建夺回
          // T7.4：纯三维模式下先退出（防在隐藏面板里聚焦不可见输入框——防隐形状态原则）
          if (useWorkspaceStore.getState().pure3d) {
            useWorkspaceStore.getState().setPure3d(false);
          }
          useWorkspaceStore.getState().setPanelHidden('right', false);
          useWorkspaceStore.getState().setInspectorTab('object');
          const objectId = target && 'objectId' in target ? target.objectId : null;
          if (objectId) {
            window.setTimeout(() => document.getElementById(`name-${objectId}`)?.focus(), 150);
          }
          break;
        }
        case 'ctx.group':
          // T8.5：建组（与 Ctrl+G 同一动作核心；组名自动编号，一条历史）
          facade.actions.groupSelection();
          break;
        case 'ctx.ungroup':
          // T8.5：解散选中集内全部组（成员上提，一条历史）
          facade.actions.ungroupSelection();
          break;
        case 'ctx.select-group-members': {
          // T8.5：仅选组内成员不选壳（组行专属；深层成员收全、嵌套组壳剔除）
          const objectId = target && 'objectId' in target ? target.objectId : null;
          if (objectId) {
            const ids = selectGroupMemberIds(facade.scene.getObjects(), objectId);
            if (ids.length > 0) facade.selection.selectMany(ids);
          }
          break;
        }
        case 'ctx.batch-rename': {
          // T8.3：批量重命名弹层（作用域 = 选中集；模型纯函数在 ui/panels/batchRenameModel）
          setBatchRenameOpen(true);
          break;
        }
        case 'ctx.add-to-scene': {
          // = 点击卡片放置（同 onPick 通道）。资产 id 优先取菜单目标的 assetId
          // （模型项不带 arg——assetCardMenu 构造时未知目标卡片；item.arg 留作键盘派发通道）
          const assetId = (target && 'assetId' in target ? target.assetId : null) ?? arg ?? null;
          const descriptor = assetId ? facade.registries.assets.get(assetId) : undefined;
          if (descriptor) onPickAsset(descriptor.asset);
          break;
        }
        default:
          break; // P1 占位（disabled）不经此处派发
      }
    },
    [contextObject, onPickAsset, refreshSessionState],
  );

  /** 菜单状态汇总（纯函数 buildMenus 的输入） */
  const menuState: MenuState = {
    ready: facadeRef.current !== null,
    canUndo,
    canRedo,
    hasSelection: selectedIds.length > 0,
    hasClipboard: facadeRef.current?.actions.hasClipboard() ?? false,
    dirty: saveState === 'dirty' || saveState === 'error',
    saveState,
    panelsHidden: hiddenPanels,
    cameraMode,
    renderMode,
    gridVisible: sceneGrid?.visible ?? true,
    snapEnabled,
    readmeAvailable,
    workMode,
    pure3d,
    minimapVisible,
    // T10.2：「工具 → 测量」子菜单 checked 位（与垂直条/芯片激活态同源）
    activeToolId,
    // T8.2：「新建场景 ▾」子菜单数据源（内置在前 + 用户清单；空用户区显占位行）
    templates: [...BUILTIN_TEMPLATE_SUMMARIES, ...userTemplateSummaries],
  };

  // T7.4 纯三维模式：面板区三变量与 hiddenPanels 条件合并归零（pure3d 从不写
  // hiddenPanels，退出还原免费成立）；vtool/contextbar/statusbar 三 token 仅 pure3d
  // 时内联覆写 0px（React 对 undefined 值的自定义属性键会跳过——非 pure3d 时条件
  // 展开省略键，不常驻覆写令牌）
  const zoneVars = {
    '--zone-left-w': pure3d || hiddenPanels.left ? '0px' : `${leftWidth}px`,
    '--zone-right-w': pure3d || hiddenPanels.right ? '0px' : `${rightWidth}px`,
    '--zone-bottom-h': pure3d || hiddenPanels.bottom ? '0px' : `${bottomHeight}px`,
    ...(pure3d
      ? { '--vtool-w': '0px', '--contextbar-h': '0px', '--statusbar-h': '0px' }
      : {}),
  } as CSSProperties;

  return (
    <div className={`ed-app${pure3d ? ' ed-app--pure3d' : ''}`} style={zoneVars}>
      <MenuBar
        state={menuState}
        saveState={saveState}
        onAction={onAction}
        onMenuOpen={refreshSessionState}
        helpDialog={helpDialog}
        onHelpClose={() => setHelpDialog(null)}
      />
      <div className="ed-contextbar" role="toolbar" aria-label="上下文工具条">
        {/* T5.6：Context Toolbar 入驻左段（QWER + 吸附/网格 + 绘制中段 + 模式徽标/Scene 选择器）；
            T5.7：四机位按钮收编视口 HUD「Perspective ▼」，上下文条保留聚焦/全景两颗动作钮；
            区域开关保持右段 */}
        <ContextToolbar
          snapEnabled={snapEnabled}
          gridVisible={menuState.gridVisible}
          onAction={onAction}
        />
        <div className="ed-contextbar__group">
          <ViewButtons />
        </div>
        <div className="ed-contextbar__end">
          <ZoneToggle zone="left" label="左面板" />
          <ZoneToggle zone="bottom" label="浏览器" />
          <ZoneToggle zone="right" label="右面板" />
        </div>
      </div>
      <VerticalToolbar />
      <div className="ed-side ed-side--left" aria-label="左面板组">
        <div className="ed-side__panels">
          {/* T5.3：场景树 + 图层两面板收编为 OutlinerPanel 双标签（场景大纲 / 图层管理）；
              T5.4：网格设置迁入右面板 Inspector「全局设置」标签；T5.6：DrawPanel 退役
              （垂直工具条 + Context Toolbar 绘制中段接管），左栏只剩大纲 */}
          <OutlinerPanel onHideZone={() => useWorkspaceStore.getState().setPanelHidden('left', true)} />
        </div>
        <Splitter
          axis="x"
          label="调整左面板宽度"
          getValue={() => useWorkspaceStore.getState().leftWidth}
          onResize={(px) => useWorkspaceStore.getState().setPanelSize('left', px)}
        />
      </div>
      <Viewport canvasRef={canvasRef} />
      <div className="ed-side ed-side--right" aria-label="右面板组">
        <Splitter
          axis="x"
          invert
          label="调整右面板宽度"
          getValue={() => useWorkspaceStore.getState().rightWidth}
          onResize={(px) => useWorkspaceStore.getState().setPanelSize('right', px)}
        />
        <div className="ed-side__panels">
          {/* T5.4：属性 + 环境 + 网格三面板收编为 InspectorPanel 三标签（对象属性 / 环境设置 / 全局设置） */}
          <InspectorPanel
            onHideZone={() => useWorkspaceStore.getState().setPanelHidden('right', true)}
            environmentPresets={ENVIRONMENT_PRESETS}
            environmentPreset={environmentPreset}
            onEnvironmentChange={onEnvironmentChange}
            grid={sceneGrid ?? null}
            onApplyGrid={onApplyGrid}
            snap={snapSettings}
            onToggleGridSnap={onToggleGridSnap}
            onToggleObjectSnap={onToggleObjectSnap}
            onObjectSnapThreshold={onObjectSnapThreshold}
            onToggleAngleSnap={onToggleAngleSnap}
            onAngleSnapStep={onAngleSnapStep}
            onToggleElevationSnap={onToggleElevationSnap}
            onAction={onAction}
          />
        </div>
      </div>
      <div className="ed-side ed-side--bottom" aria-label="底部内容浏览器">
        <Splitter
          axis="y"
          label="调整底部浏览器高度"
          getValue={() => useWorkspaceStore.getState().bottomHeight}
          onResize={(px) => useWorkspaceStore.getState().setPanelSize('bottom', px)}
        />
        <div className="ed-side__panels">
          {/* T5.5：ContentBrowser 双态（紧凑 60 / 展开 280）+ 拖放放置；点击放置等价保留。
              T002.2：统一描述符混排（GLB + 程序化）+ 程序化缩略图快照回填 */}
          <ContentBrowser
            assets={assets}
            proceduralThumbnails={proceduralThumbnails}
            onPick={onPickAsset}
            onHideZone={() => useWorkspaceStore.getState().setPanelHidden('bottom', true)}
          />
        </div>
      </div>
      <StatusBar />
      {/* T9.1 根浮层容器：工具条/面板弹层（AnchoredPopup）portal 挂载点——逃逸宿主
          层叠上下文（带 z-index 的 grid/flex 工具条自成层叠上下文，内联弹层 z 只在
          宿主内有效）；置于 ContextMenu/sceneDialogs/Toasts 之前，同档 z 让位后者。
          fixed 全屏铺位不参与网格布局、pointer-events 透穿（见 app.css .ed-popup-root） */}
      <div id={POPUP_ROOT_ID} className="ed-popup-root" />
      {/* T5.8：右键上下文菜单（store.contextMenu 驱动；定位/键盘/点击外部关闭归组件）与
          右下角 Toast 浮层（操作反馈，顶部 notice 条退役） */}
      <ContextMenu state={contextState} onAction={onContextAction} />
      {/* T8.2：场景模板与批量导入弹层（dirty 确认 / 命名 / 管理 / 导入预览；受控开关在 sceneDialogs） */}
      {sceneDialogs.element}
      {/* T8.3：批量重命名弹层（选中集作用域；前缀+序号 / 查找替换双模式 + 实时预览） */}
      {batchRenameOpen ? <BatchRenameDialog onClose={() => setBatchRenameOpen(false)} /> : null}
      <Toasts />
    </div>
  );
}

/** 上下文条右端的面板组显隐开关（隐藏后的恢复入口 + 可见状态指示） */
function ZoneToggle({ zone, label }: { zone: PanelZone; label: string }) {
  const hidden = useWorkspaceStore((s) => s.hiddenPanels[zone]);
  const setPanelHidden = useWorkspaceStore((s) => s.setPanelHidden);
  return (
    <button
      type="button"
      className={`ed-zone-toggle${hidden ? ' ed-zone-toggle--hidden' : ''}`}
      aria-pressed={!hidden}
      title={hidden ? `显示${label}` : `隐藏${label}`}
      onClick={() => setPanelHidden(zone, !hidden)}
    >
      {label}
    </button>
  );
}
