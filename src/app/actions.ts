/**
 * app/actions —— 统一 action 路由（T5.2，主代理裁定方案）。
 *
 * 职责：把主菜单（MenuBar 只发 actionId 回调）的动作统一派发到门面 / 共享核心 /
 *      workspaceStore / 帮助弹层——io 解析（SceneSerializer / JsonImporter）与文件
 *      读取只发生在本层（CONTRACTS.md #11：ui 禁 io）；actionId 为稳定点分字符串
 *      （menuModel.collectActionIds 全清单），T5.6 快捷键与 T5.8 右键菜单复用同一路由。
 * 保存语义（阶段门 Q5：dirty 位 + 下载制）：
 *   - 保存 = serialize + Blob 下载；SAVE_START → SAVE_OK / SAVE_FAIL 事件出口，
 *     失败发错误提示（不静默）；「保存中」为瞬态；
 *   - dirty 判定 = 节流 500ms 快照对比（facade.saveScene() 字符串 !== 基线），
 *     不用 scene:changed 计数（openScene 也发该事件，计数法会误报——主代理裁定 5）；
 *     快照回到基线（如 undo 到底）同样发 SCENE_LOADED 复归已保存；
 *   - openScene / 新建场景 / 保存成功 → 刷新基线并复位 saved。
 * 场景模板与批量导入（T8.2）：
 *   - 「新建场景 ▾」实例化（file.new-empty = 内置空园区 / file.new-from-<id> 前缀）：
 *     dirty 确认经 deps.confirmSceneReplace（App 读 saveState，非 dirty 直通零弹层）；
 *     openScene(regenerateSceneIds(模板深拷贝全量 id 重生成)) + 基线复位；
 *   - 「另存为模板…」：当前场景深拷贝 → deps.promptTemplateName 命名 →
 *     deps.saveUserTemplate 入库（拒存原因 → error 提示）→ deps.refreshTemplates；
 *   - 导入 JSON…：多文件（deps.pickFiles）逐文件独立解析 → 预览弹层
 *     （deps.showImportPreview 三态行）→ 确认后全部 objects 合并一次
 *     importElements（BatchCommand 单条历史）；取消零副作用。
 * 边界：node 可测——文件选择 / 下载 / 外链 / 提示 / 弹层回调全部经 deps 注入，
 *      浏览器默认实现（defaultPickFile / defaultPickFiles / defaultDownloadJson）仅在此提供。
 */
import type { RenderMode } from '../ui/menus/menuModel';
import type { ToastKind } from '../ui/feedback/toastStore';
import type { SaveEvent } from '../ui/saveStatus';
import type { InspectorTabId, PanelZone } from '../ui/layout/workspaceStore';
import type { ImportPreviewRow, SceneReplaceSummary } from '../ui/components/SceneDialogs';
import type { ImportMapping } from '../io/JsonImporter';
import { JsonImporter } from '../io/JsonImporter';
import { SceneSerializer } from '../io/SceneSerializer';
import { builtinTemplateOf, regenerateSceneIds } from '../io/templates';
import type { TemplatePayload } from '../io/templates';
import type { UserTemplateSaveFailure, UserTemplateSaveResult } from '../io/templates/userTemplates';
import type { SceneData } from '../scene/SceneData';
import type { RegionObject } from '../domain/regions';
import type { EditorHandle } from './bootstrap';
import { importElements } from './bootstrap';
import type { EditorActionsCore } from './editorActionsCore';
import { MEASURE_SUBTOOLS, activateWorkMode, toggleMeasureTool, togglePure3d } from '../ui/tools/toolIA';
import type { WorkModeId } from '../ui/tools/toolIA';

/** 工作模式子菜单 actionId 前缀（view.mode-<WorkModeId>，T7.1） */
const VIEW_MODE_PREFIX = 'view.mode-';

/** 「新建场景 ▾」模板项 actionId 前缀（file.new-from-<templateId>，T8.2；沿 view.mode- 前缀先例） */
const FILE_NEW_FROM_PREFIX = 'file.new-from-';

/** 「工具 → 测量」子菜单项 actionId 前缀（tool.measure-<kind>，T10.2；沿前缀先例） */
const TOOL_MEASURE_PREFIX = 'tool.measure-';

/** 默认保存文件名（与旧 Toolbar 一致） */
export const SCENE_FILE_NAME = '园区场景.json';

/** 操作反馈提示载荷（T5.8：App 侧对接 Toast 通道；结构同旧 AppNotice） */
export interface ActionNotice {
  kind: ToastKind;
  text: string;
}

/** dirty 快照对比节流窗（毫秒） */
export const DIRTY_CHECK_MS = 500;

/** 文件选择结果（取消为 null） */
export interface PickedFile {
  text: string;
  name: string;
}

/** 浏览器默认文件选择：动态 input[type=file]（复用旧 Toolbar readFile 语义） */
export function defaultPickFile(): Promise<PickedFile | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.display = 'none';
    let settled = false;
    const finish = (result: PickedFile | null): void => {
      if (settled) return;
      settled = true;
      input.value = ''; // 允许重复选择同一文件
      input.remove();
      resolve(result);
    };
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) {
        finish(null);
        return;
      }
      file
        .text()
        .then((text) => finish({ text, name: file.name }))
        .catch(() => finish(null));
    });
    input.addEventListener('cancel', () => finish(null));
    document.body.appendChild(input);
    input.click();
  });
}

/** 浏览器默认多文件选择（T8.2 批量导入）：动态 input[type=file][multiple]——语义沿 defaultPickFile 全部细节（accept / 重复选择 / settled 防重 / cancel → null） */
export function defaultPickFiles(): Promise<PickedFile[] | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.multiple = true;
    input.style.display = 'none';
    let settled = false;
    const finish = (result: PickedFile[] | null): void => {
      if (settled) return;
      settled = true;
      input.value = ''; // 允许重复选择同一文件
      input.remove();
      resolve(result);
    };
    input.addEventListener('change', () => {
      const files = Array.from(input.files ?? []);
      if (files.length === 0) {
        finish(null);
        return;
      }
      Promise.all(files.map((file) => file.text()))
        .then((texts) => finish(texts.map((text, i) => ({ text, name: files[i]!.name }))))
        .catch(() => finish(null));
    });
    input.addEventListener('cancel', () => finish(null));
    document.body.appendChild(input);
    input.click();
  });
}

/** 模板拒存原因 → 用户可读文案（notify error 组装用，导出供测试断言口径） */
export function templateSaveFailureText(reason: UserTemplateSaveFailure): string {
  switch (reason) {
    case 'count-limit':
      return '个人模板已达数量上限（20 套）';
    case 'size-limit':
      return '模板总存储已超容量上限（约 1 MB）';
    case 'quota':
      return '浏览器存储配额不足';
    case 'invalid-name':
      return '模板名称不能为空';
    case 'storage-unavailable':
      return '浏览器存储不可用（隐私模式？）';
  }
}

/** 浏览器默认下载：Blob + URL.createObjectURL（沿用旧 Toolbar 保存模式） */
export function defaultDownloadJson(text: string, fileName: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/** 另存为文件名：园区场景-YYYYMMDD-HHmmss.json */
function timestampedSceneFileName(date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  const datePart = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  const timePart = `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  return `园区场景-${datePart}-${timePart}.json`;
}

/** 动作路由依赖（App 装配；* 号三件为浏览器默认可注入替换） */
export interface EditorActionsDeps {
  facade: EditorHandle;
  /** 编辑动作共享核心（bootstrap 构造，与 InputController 同实例） */
  core: EditorActionsCore;
  /** JSON 导入映射（App 层持有 assets/mappings 配置） */
  importMapping: ImportMapping;
  /** workspaceStore 面板显隐（zone 粒度） */
  getPanelHidden(zone: PanelZone): boolean;
  setPanelHidden(zone: PanelZone, hidden: boolean): void;
  /** workspaceStore 小地图开关（T7.7；随工作区快照持久化） */
  getMinimapVisible(): boolean;
  setMinimapVisible(visible: boolean): void;
  /** workspaceStore Inspector 标签（「设置」类 action 的跳转目标，T5.4） */
  setInspectorTab(tab: InspectorTabId): void;
  /** 保存状态机事件出口（App 接 reduceSaveStatus） */
  emitSaveEvent(event: SaveEvent): void;
  /** 操作反馈提示（T5.8 起 App 对接 Toast 队列；错误/信息不静默） */
  notify(notice: ActionNotice): void;
  /** 帮助弹层（UI 层承接） */
  openHelpDialog(which: 'shortcuts' | 'about'): void;
  /** 渲染模式记账（T5.7 消费） */
  setRenderMode(mode: RenderMode): void;
  /** 文件选择（*浏览器默认 defaultPickFile；file.open 单选用） */
  pickFile(): Promise<PickedFile | null>;
  /** 多文件选择（*浏览器默认 defaultPickFiles；file.import-json 批量导入用，T8.2） */
  pickFiles(): Promise<PickedFile[] | null>;
  /** JSON 下载（*浏览器默认 defaultDownloadJson） */
  downloadJson(text: string, fileName: string): void;
  /** 外链打开（*浏览器默认 window.open） */
  openUrl(url: string): void;
  // ── T8.2 场景模板与批量导入（UI 弹层与存储中转经 App 装配注入；node 测试 fake）──
  /** 用户模板清单（file.new-from-<tpl id> 查载荷；App 实现 = listUserTemplates()） */
  getUserTemplates(): TemplatePayload[];
  /** 保存用户模板（io userTemplates 中转；返回拒存原因供 notify） */
  saveUserTemplate(name: string, scene: SceneData): UserTemplateSaveResult;
  /** 模板存储变化后刷新清单 state（App 更新 menuState.templates） */
  refreshTemplates(): void;
  /** 新建场景 dirty 确认（App 读 saveState：非 dirty resolve(true) 不弹层；dirty 弹确认弹层） */
  confirmSceneReplace(summary: SceneReplaceSummary): Promise<boolean>;
  /** 「另存为模板…」命名弹层（入参 = 既有名清单；null = 取消） */
  promptTemplateName(existingNames: string[]): Promise<string | null>;
  /** 模板管理弹层（UI 承接） */
  openManageTemplates(): void;
  /** 批量导入预览弹层（false = 取消零副作用） */
  showImportPreview(rows: ImportPreviewRow[]): Promise<boolean>;
}

/** 路由实例（dispatch + dirty 快照对比调度） */
export interface EditorActions {
  /** 派发一个 actionId（未知 id 静默无操作） */
  dispatch(actionId: string): void;
  /** 复位保存基线并发出 SCENE_LOADED（装配完成 / openScene / 新建后调用） */
  resetSavedBaseline(): void;
  /** 立即快照对比：与基线不同 → SCENE_CHANGED；回到基线 → SCENE_LOADED（幂等边沿触发） */
  checkDirty(): void;
  /** 节流 500ms 的 checkDirty（App 以 sceneVersion 为调度触发源接线） */
  scheduleDirtyCheck(): void;
  /** 清理定时器（随组合根销毁） */
  dispose(): void;
}

/** 动作路由实现 */
class EditorActionsImpl implements EditorActions {
  private readonly deps: EditorActionsDeps;
  /** 保存基线快照（保存成功 / openScene / 新建时刷新；null = 尚未初始化） */
  private lastSaved: string | null = null;
  /** 最近一次上报的快照（边沿触发：与 lastSaved 或自身重复比较不再发事件） */
  private lastReported: string | null = null;
  private dirtyTimer: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;

  constructor(deps: EditorActionsDeps) {
    this.deps = deps;
  }

  dispatch(actionId: string): void {
    // ── 工作模式（T7.1 视图菜单子菜单 view.mode-<id>；与 Scene ▼ 选择器 / Alt+1..6
    //    三路同源——activateWorkMode 含激活绘制/放置工具的 cancel 语义）──
    if (actionId.startsWith(VIEW_MODE_PREFIX)) {
      activateWorkMode(actionId.slice(VIEW_MODE_PREFIX.length) as WorkModeId, this.deps.facade.tools);
      return;
    }

    // ── 场景模板实例化（T8.2「新建场景 ▾」）：空场景项 = 内置「空园区」模板；
    //    模板项 file.new-from-<id> 前缀分发（沿 view.mode- 前缀先例）──
    if (actionId === 'file.new-empty') {
      void this.newSceneFromTemplate('builtin-empty', true);
      return;
    }
    if (actionId.startsWith(FILE_NEW_FROM_PREFIX)) {
      void this.newSceneFromTemplate(actionId.slice(FILE_NEW_FROM_PREFIX.length), false);
      return;
    }

    // ── 测量子工具（T10.2「工具 → 测量」子菜单；与垂直条分组 / ContextToolbar 芯片
    //    三路同源——toggleMeasureTool 含再点退出语义）──
    if (actionId.startsWith(TOOL_MEASURE_PREFIX)) {
      const kind = actionId.slice(TOOL_MEASURE_PREFIX.length);
      const sub = MEASURE_SUBTOOLS.find((s) => s.kind === kind);
      if (sub) toggleMeasureTool(this.deps.facade.tools, sub.kind);
      return;
    }

    switch (actionId) {
      // ── 文件 ──
      case 'file.open':
        void this.openSceneFromFile();
        break;
      case 'file.save':
      case 'file.export': // P0：导出 = 保存同一下载出口
        this.performSave(SCENE_FILE_NAME);
        break;
      case 'file.save-as':
        this.performSave(timestampedSceneFileName());
        break;
      case 'file.save-as-template':
        void this.saveSceneAsTemplate();
        break;
      case 'file.import-json':
        void this.importJsonFromFiles();
        break;
      case 'file.manage-templates':
        this.deps.openManageTemplates();
        break;
      case 'file.scene-settings':
        // T5.4：定位到右面板 Inspector「全局设置」标签（面板隐藏时恢复显示）
        this.deps.setPanelHidden('right', false);
        this.deps.setInspectorTab('settings');
        break;

      // ── 编辑（共享核心 / 历史）──
      case 'edit.undo':
        this.deps.facade.history.undo();
        break;
      case 'edit.redo':
        this.deps.facade.history.redo();
        break;
      case 'edit.cut':
        this.deps.core.cutSelection();
        break;
      case 'edit.copy':
        this.deps.core.copySelection();
        break;
      case 'edit.paste':
        this.deps.core.pasteClipboard();
        break;
      case 'edit.duplicate':
        // T7.1 上下文工具矩阵「复制」：Ctrl+D 同一路由（原地复制选中，偏移 1m 一条历史）
        this.deps.core.duplicateSelection();
        break;
      case 'edit.delete':
        this.deps.core.deleteSelection();
        break;
      case 'edit.select-all':
        this.deps.core.selectAll();
        break;
      case 'edit.deselect':
        this.deps.core.deselectAll();
        break;

      // ── 场景 / 资产（面板显隐动作）──
      case 'scene.layers':
        this.deps.setPanelHidden('left', false);
        break;
      case 'asset.browser':
        this.deps.setPanelHidden('bottom', false);
        break;

      // ── 工具 ──
      case 'tool.snap':
        // T8.1：吸附总开关（Context Toolbar 吸附钮 / 设置网格分项三路同源）——
        // off 压下全部吸附分项（网格/对象/角度/高度，gizmo 与顶点编辑），不写各分项
        // 记忆，恢复 on 时各分项回设置值；不影响绘制辅助锁定三键（Shift/A/G）。
        this.deps.facade.snapTiers.masterEnabled = !this.deps.facade.snapTiers.masterEnabled;
        break;

      // ── 视图 ──
      case 'view.panel-left':
      case 'view.panel-right':
      case 'view.panel-bottom': {
        const zone = actionId.slice('view.panel-'.length) as PanelZone;
        this.deps.setPanelHidden(zone, !this.deps.getPanelHidden(zone));
        break;
      }
      case 'view.pure3d':
        // T7.4 纯三维模式（与 Tab 键三路同源——togglePure3d 含绘制/放置/顶点编辑
        // cancel 语义 + 关右键菜单；退出只翻位，布局精确还原）
        togglePure3d(this.deps.facade.tools);
        break;
      case 'view.minimap':
        // T7.7 小地图开关（与齿轮 Viewport Options 同源——workspaceStore.minimapVisible，
        // App 装配层订阅 → EditorHandle.setMinimapVisible 驱动 runtime）
        this.deps.setMinimapVisible(!this.deps.getMinimapVisible());
        break;
      case 'view.camera-perspective':
      case 'view.camera-top':
      case 'view.camera-front':
      case 'view.camera-side':
        this.deps.facade.camera.setMode(actionId.slice('view.camera-'.length) as 'perspective' | 'top' | 'front' | 'side');
        break;
      case 'view.render-shaded':
      case 'view.render-wireframe':
      case 'view.render-xray':
      case 'view.render-clay':
      case 'view.render-normals':
      case 'view.render-islands':
        // T8.4 诊断三档同路（诊断档会话级——saveScene 出口剥离 renderMode 键）
        this.deps.setRenderMode(actionId.slice('view.render-'.length) as RenderMode);
        break;
      case 'view.grid': {
        const grid = this.deps.facade.getGrid();
        this.deps.facade.setGrid({ ...grid, visible: !grid.visible });
        break;
      }

      // ── 帮助 ──
      case 'help.shortcuts':
        this.deps.openHelpDialog('shortcuts');
        break;
      case 'help.readme':
        this.deps.openUrl('README.md');
        break;
      case 'help.about':
        this.deps.openHelpDialog('about');
        break;

      default:
        // 未知/占位 actionId（如渲染模式在 T5.7 前由菜单层禁用）：静默无操作
        break;
    }
  }

  resetSavedBaseline(): void {
    this.lastSaved = this.deps.facade.saveScene();
    this.lastReported = this.lastSaved;
    this.deps.emitSaveEvent('SCENE_LOADED');
  }

  checkDirty(): void {
    if (this.lastSaved === null) return; // 尚未初始化基线：等待装配完成复位
    const text = this.deps.facade.saveScene();
    if (text === this.lastSaved) {
      if (this.lastReported !== this.lastSaved) {
        // 快照回到基线（如 undo 到底）：内容与已保存一致，复归已保存
        this.lastReported = this.lastSaved;
        this.deps.emitSaveEvent('SCENE_LOADED');
      }
      return;
    }
    if (text !== this.lastReported) {
      this.lastReported = text;
      this.deps.emitSaveEvent('SCENE_CHANGED');
    }
  }

  scheduleDirtyCheck(): void {
    if (this.disposed) return;
    if (this.dirtyTimer !== null) clearTimeout(this.dirtyTimer);
    this.dirtyTimer = setTimeout(() => {
      this.dirtyTimer = null;
      this.checkDirty();
    }, DIRTY_CHECK_MS);
  }

  dispose(): void {
    this.disposed = true;
    if (this.dirtyTimer !== null) {
      clearTimeout(this.dirtyTimer);
      this.dirtyTimer = null;
    }
  }

  // ── 文件动作实现 ──────────────────────────────────────

  /** 按 id 解析模板载荷（内置注册表 → 用户清单；未知 id → undefined 静默） */
  private findTemplate(templateId: string): TemplatePayload | undefined {
    return builtinTemplateOf(templateId) ?? this.deps.getUserTemplates().find((t) => t.id === templateId);
  }

  /**
   * 实例化模板（T8.2）：dirty 确认（confirmSceneReplace——App 读 saveState，非 dirty
   * 直通零弹层）→ openScene(regenerateSceneIds(深拷贝全量 id 重生成)) + 基线复位。
   * 取消 → 零副作用。emptyScene = 「空场景」项（沿用现文案「已新建场景」）。
   */
  private async newSceneFromTemplate(templateId: string, emptyScene: boolean): Promise<void> {
    const payload = this.findTemplate(templateId);
    if (!payload) return; // 未知 id 静默无操作
    const summary: SceneReplaceSummary = {
      name: payload.name,
      source: payload.builtin ? '内置' : '个人',
      objectCount: payload.scene.objects.length,
      layerCount: payload.scene.layers.length,
    };
    if (!(await this.deps.confirmSceneReplace(summary))) return;
    this.deps.facade.openScene(regenerateSceneIds(payload.scene));
    this.resetSavedBaseline();
    this.deps.notify({
      kind: 'info',
      text: emptyScene
        ? '已新建场景'
        : `已从模板新建：${payload.name} · ${payload.scene.objects.length} 个对象 · ${payload.scene.layers.length} 个图层`,
    });
  }

  /** 「另存为模板…」（T8.2）：当前场景深拷贝 → 命名弹层 → 入库 → 刷新清单 + 提示 */
  private async saveSceneAsTemplate(): Promise<void> {
    let scene: SceneData;
    try {
      scene = new SceneSerializer().deserialize(this.deps.facade.saveScene());
    } catch (err) {
      this.deps.notify({ kind: 'error', text: `另存为模板失败：${(err as Error).message}` });
      return;
    }
    const name = await this.deps.promptTemplateName(this.deps.getUserTemplates().map((t) => t.name));
    if (name === null || name.trim() === '') return; // 取消（或空名防御）→ 零副作用
    const result = this.deps.saveUserTemplate(name, scene);
    if (result.ok) {
      this.deps.refreshTemplates();
      this.deps.notify({ kind: 'info', text: `已保存模板「${name.trim()}」` });
    } else {
      // 容量/配额拒存：不静默，提示清理旧模板（附原因）
      this.deps.notify({
        kind: 'error',
        text: `模板未保存：${templateSaveFailureText(result.reason)}——请删除旧模板后重试`,
      });
    }
  }

  private async openSceneFromFile(): Promise<void> {
    const picked = await this.deps.pickFile();
    if (!picked) return;
    try {
      const data = new SceneSerializer().deserialize(picked.text);
      this.deps.facade.openScene(data);
      this.resetSavedBaseline();
      this.deps.notify({
        kind: 'info',
        text: `已打开 ${picked.name}：${data.objects.length} 个对象 · ${data.layers.length} 个图层`,
      });
    } catch (err) {
      this.deps.notify({ kind: 'error', text: `打开失败：${(err as Error).message}` });
    }
  }

  /**
   * 批量导入（T8.2 多文件）：每文件独立 JSON.parse → JsonImporter（同一映射配置，
   * 零注册表零新解析逻辑）；文件级失败（parse 抛错 = 映射非法/根非对象/非法 JSON）
   * 该行错误态置灰不阻断其余文件。三态行计数口径：拟导入 N = objects.length；
   * 告警 W = errors.length（ImportError 无 severity，沿现单文件口径）；失败 = 文件级。
   * 确认后全部 objects 合并调用一次 importElements（BatchCommand 单条历史）。
   */
  private async importJsonFromFiles(): Promise<void> {
    const picked = await this.deps.pickFiles();
    if (!picked || picked.length === 0) return;

    const rows: ImportPreviewRow[] = [];
    const allObjects: RegionObject[] = [];
    let totalWarnings = 0;
    for (const file of picked) {
      try {
        const raw: unknown = JSON.parse(file.text);
        // JsonImporter v2：零注册表依赖（构造无参），语义默认值直读 domain 单一真相源（T6.9）
        const { objects, errors } = new JsonImporter().parse(raw, this.deps.importMapping);
        if (errors.length > 0) {
          totalWarnings += errors.length;
          console.warn(`[actions] 导入告警 ${file.name}`, errors);
        }
        rows.push({ name: file.name, status: 'ok', objectCount: objects.length, warningCount: errors.length });
        allObjects.push(...objects);
      } catch (err) {
        rows.push({ name: file.name, status: 'failed', message: (err as Error).message });
      }
    }

    if (!(await this.deps.showImportPreview(rows))) return; // 取消 → 零副作用
    const ok = importElements(this.deps.facade, allObjects);
    this.deps.notify({
      kind: ok || totalWarnings === 0 ? 'info' : 'error',
      text: `批量导入：${allObjects.length} 个对象${totalWarnings > 0 ? ` · ${totalWarnings} 条告警（见控制台）` : ''}`,
    });
  }

  /** 保存：序列化 + 下载（整体 try/catch，失败 SAVE_FAIL + 错误提示不静默） */
  private performSave(fileName: string): void {
    this.deps.emitSaveEvent('SAVE_START');
    try {
      const text = this.deps.facade.saveScene();
      this.deps.downloadJson(text, fileName);
      this.lastSaved = text;
      this.lastReported = text;
      this.deps.emitSaveEvent('SAVE_OK');
    } catch (err) {
      this.deps.emitSaveEvent('SAVE_FAIL');
      this.deps.notify({ kind: 'error', text: `保存失败：${(err as Error).message}` });
    }
  }
}

/** 浏览器默认外链打开 */
function defaultOpenUrl(url: string): void {
  window.open(url, '_blank', 'noopener');
}

/**
 * 创建动作路由。pickFile / pickFiles / downloadJson / openUrl 缺省用浏览器实现（node 测试注入 fake）。
 */
export function createEditorActions(
  deps: Omit<EditorActionsDeps, 'pickFile' | 'pickFiles' | 'downloadJson' | 'openUrl'> &
    Partial<Pick<EditorActionsDeps, 'pickFile' | 'pickFiles' | 'downloadJson' | 'openUrl'>>,
): EditorActions {
  return new EditorActionsImpl({
    ...deps,
    pickFile: deps.pickFile ?? defaultPickFile,
    pickFiles: deps.pickFiles ?? defaultPickFiles,
    downloadJson: deps.downloadJson ?? defaultDownloadJson,
    openUrl: deps.openUrl ?? defaultOpenUrl,
  });
}
