/**
 * tests/app/actions.test.ts —— 统一 action 路由测试（T5.2，先测后码）。
 *
 * 覆盖（任务书「Action 路由（app 层）」+ 主代理裁定 4/5）：
 * - createEditorActions 的 dispatch：编辑/视图/工具/帮助各 actionId → 正确派发
 *   （经 headless createEditor 门面 + vi.spyOn 调用断言；io 读取与下载注入 fake）；
 * - 保存语义：SAVE_START → 下载 → SAVE_OK；下载异常 → SAVE_FAIL + 错误提示（不静默）；
 *   另存为时间戳文件名；保存成功后基线刷新（快照对比不再报 dirty）；
 * - dirty 判定 = 快照对比（非计数）：场景变更 → checkDirty → SCENE_CHANGED；
 *  openScene / 新建后 → SCENE_LOADED；scheduleDirtyCheck 节流 500ms（假时钟）；
 * - 文件动作：file.open 走 SceneSerializer → openScene；file.import-json 走
 *   JsonImporter（T6.9 v2：零注册表，building 映射 → region 导入成功 + 语义默认
 *   预设/归层；文件读取取消（null）零动作）；
 * - 共享核心：菜单复制/粘贴与 InputController 同一 EditorActionsCore 实例
 *  （bootstrap 构造并注入两处，剪贴板互通）。
 * 边界：node 环境——pickFile/downloadJson/openUrl/openHelpDialog/notify/emitSaveEvent
 *      全部注入 fake；浏览器默认实现（Blob 下载 / 动态 input 选文件）不进测试。
 * T6.7：对象夹具由 v1 building 要素转 region（openScene 对旧类型跳过兜底）。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { CreateObjectCommand } from '../../src/editor/commands/CreateObjectCommand';
import type { SceneObject } from '../../src/scene/SceneObject';
import { createRegionObject } from '../../src/domain/regions';
import type { RegionObject } from '../../src/domain/regions';
import type { ImportMapping } from '../../src/io/JsonImporter';
import { BUILTIN_TEMPLATES } from '../../src/io/templates';
import type { TemplatePayload } from '../../src/io/templates';
import type { UserTemplateSaveResult } from '../../src/io/templates/userTemplates';
import buildingMappingJson from '../../assets/mappings/building.example.json';
import { createEditor, DEFAULT_LAYER_NAMES } from '../../src/app/bootstrap';
import type { EditorHandle } from '../../src/app/bootstrap';
import { createEditorActions } from '../../src/app/actions';
import type { ActionNotice, EditorActions, EditorActionsDeps, PickedFile } from '../../src/app/actions';
import type { ImportPreviewRow, SceneReplaceSummary } from '../../src/ui/components/SceneDialogs';
import type { SaveEvent } from '../../src/ui/saveStatus';
import type { PanelZone } from '../../src/ui/layout/workspaceStore';

const BUILDING_MAPPING = buildingMappingJson as ImportMapping;

/** 假时钟下的微任务冲刷（pickFile promise 链） */
async function flushAsync(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/** region 探针对象（T6.7：v1 building 夹具已删） */
function makeObject(name = '对象', x = 0, z = 0): SceneObject {
  const region = createRegionObject({
    shape: {
      type: 'polygon',
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 3 },
      ],
      baseHeight: 0,
      closed: true,
    },
    name,
  });
  return {
    ...region,
    transform: { ...region.transform, position: { x, y: 0, z } },
  };
}

interface Fixture {
  facade: EditorHandle;
  events: SaveEvent[];
  notices: ActionNotice[];
  downloads: Array<{ text: string; fileName: string }>;
  urls: string[];
  dialogs: string[];
  renderModes: string[];
  panelOps: Array<{ zone: PanelZone; hidden: boolean }>;
  minimapOps: boolean[];
  inspectorTabs: string[];
  setPickResult: (r: { text: string; name: string } | null) => void;
  actions: EditorActions;
  /** T8.2 场景模板：确认弹层调用记录与应答 */
  confirmCalls: SceneReplaceSummary[];
  setConfirmResult: (v: boolean) => void;
  /** 命名弹层调用记录（每次传入的既有名清单）与应答（null = 取消） */
  namingCalls: string[][];
  setNamingResult: (v: string | null) => void;
  /** 注入的用户模板清单（file.new-from-<id> 查载荷） */
  userTemplates: TemplatePayload[];
  /** saveUserTemplate 调用记录与应答 */
  saveTemplateCalls: Array<{ name: string; text: string }>;
  setSaveTemplateResult: (r: UserTemplateSaveResult) => void;
  refreshTemplatesCount: () => number;
  manageDialogOpens: () => number;
  /** T8.2 批量导入：多文件选择结果与预览弹层记录 */
  setPickFilesResult: (v: PickedFile[] | null) => void;
  previewRows: ImportPreviewRow[][];
  setPreviewResult: (v: boolean) => void;
}

function setup(): Fixture {
  const facade = createEditor(null, { eventBus: new EventBus() });
  const events: SaveEvent[] = [];
  const notices: ActionNotice[] = [];
  const downloads: Array<{ text: string; fileName: string }> = [];
  const urls: string[] = [];
  const dialogs: string[] = [];
  const renderModes: string[] = [];
  const panelOps: Array<{ zone: PanelZone; hidden: boolean }> = [];
  const minimapOps: boolean[] = [];
  const inspectorTabs: string[] = [];
  const hidden = { left: false, right: false, bottom: false };
  let minimapVisible = true;
  let pickResult: { text: string; name: string } | null = null;

  // T8.2 场景模板 / 批量导入 fake（沿 pickFile 注入先例）
  const confirmCalls: SceneReplaceSummary[] = [];
  let confirmResult = true; // 缺省 = 「非 dirty 直通」语义（App 实现非 dirty resolve(true)）
  const namingCalls: string[][] = [];
  let namingResult: string | null = null;
  const userTemplates: TemplatePayload[] = [];
  const saveTemplateCalls: Array<{ name: string; text: string }> = [];
  let saveTemplateResult: UserTemplateSaveResult = { ok: true };
  let refreshCount = 0;
  let manageOpens = 0;
  let pickFilesResult: PickedFile[] | null = null;
  const previewRows: ImportPreviewRow[][] = [];
  let previewResult = true;

  const deps: EditorActionsDeps = {
    facade,
    core: facade.actions,
    importMapping: BUILDING_MAPPING,
    getPanelHidden: (zone) => hidden[zone],
    setPanelHidden: (zone, value) => {
      hidden[zone] = value;
      panelOps.push({ zone, hidden: value });
    },
    getMinimapVisible: () => minimapVisible,
    setMinimapVisible: (value) => {
      minimapVisible = value;
      minimapOps.push(value);
    },
    setInspectorTab: (tab) => inspectorTabs.push(tab),
    emitSaveEvent: (event) => events.push(event),
    notify: (notice) => notices.push(notice),
    openHelpDialog: (which) => dialogs.push(which),
    openUrl: (url) => urls.push(url),
    setRenderMode: (mode) => renderModes.push(mode),
    pickFile: async () => pickResult,
    pickFiles: async () => pickFilesResult,
    downloadJson: (text, fileName) => {
      downloads.push({ text, fileName });
    },
    // T8.2：模板清单 / 确认与命名弹层 / 存储中转（App 层实现，node 注入 fake）
    getUserTemplates: () => userTemplates,
    saveUserTemplate: (name, scene) => {
      saveTemplateCalls.push({ name, text: JSON.stringify(scene) });
      return saveTemplateResult;
    },
    refreshTemplates: () => {
      refreshCount += 1;
    },
    confirmSceneReplace: (summary) => {
      confirmCalls.push(summary);
      return Promise.resolve(confirmResult);
    },
    promptTemplateName: (existingNames) => {
      namingCalls.push(existingNames);
      return Promise.resolve(namingResult);
    },
    openManageTemplates: () => {
      manageOpens += 1;
    },
    showImportPreview: (rows) => {
      previewRows.push(rows);
      return Promise.resolve(previewResult);
    },
  };

  const actions = createEditorActions(deps);
  actions.resetSavedBaseline();
  events.length = 0; // 基线复位的 SCENE_LOADED 不计入用例断言

  return {
    facade,
    events,
    notices,
    downloads,
    urls,
    dialogs,
    renderModes,
    panelOps,
    minimapOps,
    inspectorTabs,
    setPickResult: (r) => {
      pickResult = r;
    },
    actions,
    confirmCalls,
    setConfirmResult: (v) => {
      confirmResult = v;
    },
    namingCalls,
    setNamingResult: (v) => {
      namingResult = v;
    },
    userTemplates,
    saveTemplateCalls,
    setSaveTemplateResult: (r) => {
      saveTemplateResult = r;
    },
    refreshTemplatesCount: () => refreshCount,
    manageDialogOpens: () => manageOpens,
    setPickFilesResult: (v) => {
      pickFilesResult = v;
    },
    previewRows,
    setPreviewResult: (v) => {
      previewResult = v;
    },
  };
}

describe('createEditorActions 编辑路由（经共享核心与门面）', () => {
  let fx: Fixture;
  beforeEach(() => {
    fx = setup();
  });

  it('edit.undo / edit.redo → 门面 history', () => {
    const undo = vi.spyOn(fx.facade.history, 'undo');
    const redo = vi.spyOn(fx.facade.history, 'redo');
    fx.actions.dispatch('edit.undo');
    fx.actions.dispatch('edit.redo');
    expect(undo).toHaveBeenCalledTimes(1);
    expect(redo).toHaveBeenCalledTimes(1);
  });

  it('edit.copy + edit.paste：副本入场景（共享核心与键盘快捷键同一实现）', () => {
    const obj = makeObject('总部', 3, 7);
    fx.facade.scene.addObject(obj);
    fx.facade.selection.select(obj.id);

    fx.actions.dispatch('edit.copy');
    expect(fx.facade.scene.getObjects()).toHaveLength(1); // 复制零命令

    fx.actions.dispatch('edit.paste');
    const objects = fx.facade.scene.getObjects();
    expect(objects).toHaveLength(2);
    const copy = objects.find((o) => o.id !== obj.id)!;
    expect(copy.name).toBe('总部');
    expect(copy.transform.position.x).toBe(4); // +1m 偏移
    expect(fx.facade.selection.getSelectedIds()).toEqual([copy.id]);
  });

  it('edit.cut：复制 + 删除（对象消失、剪贴板有货可粘贴）', () => {
    const obj = makeObject();
    fx.facade.scene.addObject(obj);
    fx.facade.selection.select(obj.id);

    fx.actions.dispatch('edit.cut');
    expect(fx.facade.scene.getObjects()).toHaveLength(0);
    fx.actions.dispatch('edit.paste');
    expect(fx.facade.scene.getObjects()).toHaveLength(1); // 剪贴板有内容
  });

  it('edit.delete：删除选中（可撤销）', () => {
    const obj = makeObject();
    fx.facade.scene.addObject(obj);
    fx.facade.selection.select(obj.id);
    fx.actions.dispatch('edit.delete');
    expect(fx.facade.scene.getObjects()).toHaveLength(0);
    fx.facade.history.undo();
    expect(fx.facade.scene.getObjects()).toHaveLength(1);
  });

  it('edit.select-all：选中全部未锁定对象（锁定对象与其成员被排除）；edit.deselect 清空', () => {
    const a = makeObject('A');
    const b = makeObject('B');
    const locked = makeObject('L');
    locked.locked = true;
    for (const o of [a, b, locked]) fx.facade.scene.addObject(o);

    fx.actions.dispatch('edit.select-all');
    expect(fx.facade.selection.getSelectedIds().sort()).toEqual([a.id, b.id].sort());

    fx.actions.dispatch('edit.deselect');
    expect(fx.facade.selection.getSelectedIds()).toEqual([]);
  });
});

describe('createEditorActions 文件路由', () => {
  let fx: Fixture;
  beforeEach(() => {
    fx = setup();
  });

  it('file.save：SAVE_START → 下载序列化 JSON → SAVE_OK；基线刷新后不再报 dirty', () => {
    fx.actions.dispatch('file.save');
    expect(fx.events).toEqual(['SAVE_START', 'SAVE_OK']);
    expect(fx.downloads).toHaveLength(1);
    expect(fx.downloads[0]!.fileName).toBe('园区场景.json');
    expect(fx.downloads[0]!.text).toBe(fx.facade.saveScene());

    // 保存成功后未变更 → 快照对比零事件
    fx.actions.checkDirty();
    expect(fx.events).toEqual(['SAVE_START', 'SAVE_OK']);
  });

  it('file.save 下载异常：SAVE_FAIL + 错误提示（不静默）', () => {
    const failing = setup();
    failing.actions = createEditorActions({
      facade: failing.facade,
      core: failing.facade.actions,
      importMapping: BUILDING_MAPPING,
      getPanelHidden: () => false,
      setPanelHidden: () => undefined,
      getMinimapVisible: () => true,
      setMinimapVisible: () => undefined,
      setInspectorTab: () => undefined,
      emitSaveEvent: (e) => failing.events.push(e),
      notify: (n) => failing.notices.push(n),
      openHelpDialog: () => undefined,
      openUrl: () => undefined,
      setRenderMode: () => undefined,
      pickFile: async () => null,
      pickFiles: async () => null,
      downloadJson: () => {
        throw new Error('磁盘不可写');
      },
      getUserTemplates: () => [],
      saveUserTemplate: () => ({ ok: true }),
      refreshTemplates: () => undefined,
      confirmSceneReplace: async () => true,
      promptTemplateName: async () => null,
      openManageTemplates: () => undefined,
      showImportPreview: async () => false,
    });
    expect(() => failing.actions.dispatch('file.save')).not.toThrow();
    expect(failing.events).toEqual(['SAVE_START', 'SAVE_FAIL']);
    expect(failing.notices).toHaveLength(1);
    expect(failing.notices[0]!.kind).toBe('error');
    expect(failing.notices[0]!.text).toContain('保存失败');
  });

  it('file.save-as：时间戳文件名（园区场景-YYYYMMDD-HHmmss.json）', () => {
    fx.actions.dispatch('file.save-as');
    expect(fx.downloads).toHaveLength(1);
    expect(fx.downloads[0]!.fileName).toMatch(/^园区场景-\d{8}-\d{6}\.json$/);
    expect(fx.events).toEqual(['SAVE_START', 'SAVE_OK']);
  });

  it('file.export = 保存同动作（P0 同一下载出口）', () => {
    fx.actions.dispatch('file.export');
    expect(fx.downloads).toHaveLength(1);
    expect(fx.events).toEqual(['SAVE_START', 'SAVE_OK']);
  });

  it('file.new-empty（T8.2）：实例化内置「空园区」模板（11 图层 = 十语义 + 模型，零对象）+ SCENE_LOADED + 基线刷新', async () => {
    const open = vi.spyOn(fx.facade, 'openScene');
    fx.actions.dispatch('file.new-empty');
    await flushAsync();
    expect(open).toHaveBeenCalledTimes(1);
    const data = open.mock.calls[0]![0];
    expect(data.version).toBe('2.0');
    expect(data.layers).toHaveLength(11); // T6.7：十类语义图层 + 模型层
    expect(data.layers.map((l) => l.name)).toEqual([...DEFAULT_LAYER_NAMES]);
    expect(data.objects).toHaveLength(0);
    expect(fx.events).toContain('SCENE_LOADED');
    fx.actions.checkDirty();
    expect(fx.events).not.toContain('SCENE_CHANGED'); // 新场景即基线
    expect(fx.notices[0]).toEqual({ kind: 'info', text: '已新建场景' });
  });

  it('file.open：读文件 → 反序列化 → openScene + SCENE_LOADED + 提示', async () => {
    const obj = makeObject('打开的对象', 5, 5);
    const sceneJson = serializeWithObject(fx.facade, obj);
    fx.setPickResult({ text: sceneJson, name: '测试场景.json' });
    const open = vi.spyOn(fx.facade, 'openScene');

    fx.actions.dispatch('file.open');
    await flushAsync();

    expect(open).toHaveBeenCalledTimes(1);
    expect(fx.facade.scene.getObjects()).toHaveLength(1);
    expect(fx.events).toContain('SCENE_LOADED');
    expect(fx.events).not.toContain('SCENE_CHANGED');
    expect(fx.notices[0]!.kind).toBe('info');
    expect(fx.notices[0]!.text).toContain('测试场景.json');
  });

  it('file.open 取消选择（pickFile 返回 null）：零动作零事件', async () => {
    fx.setPickResult(null);
    const open = vi.spyOn(fx.facade, 'openScene');
    fx.actions.dispatch('file.open');
    await flushAsync();
    expect(open).not.toHaveBeenCalled();
    expect(fx.events).toEqual([]);
  });

  it('file.open 非法 JSON：错误提示、场景不被破坏', async () => {
    fx.setPickResult({ text: '{oops', name: 'bad.json' });
    const open = vi.spyOn(fx.facade, 'openScene');
    fx.actions.dispatch('file.open');
    await flushAsync();
    expect(open).not.toHaveBeenCalled();
    expect(fx.notices[0]!.kind).toBe('error');
    expect(fx.notices[0]!.text).toContain('打开失败');
  });

  it('file.import-json（T8.2 多文件，单文件路径）：building 映射 → region 入场景（楼层×3 高度/语义默认预设/建筑层）+ info Toast', async () => {
    fx.setPickFilesResult([
      {
        text: JSON.stringify({
          data: { buildings: [{ name: 'A 座', floors: 6, footprint: [[0, 0], [10, 0], [10, 8], [0, 0]] }] },
        }),
        name: '外部数据.json',
      },
    ]);
    fx.actions.dispatch('file.import-json');
    await flushAsync();

    // JsonImporter v2 零注册表：直接产出 building 语义 RegionObject，经命令入场景
    const objects = fx.facade.scene.getObjects();
    expect(objects).toHaveLength(1);
    const region = objects[0] as RegionObject;
    expect(region.type).toBe('region');
    expect(region.name).toBe('A 座');
    expect(region.semantic.type).toBe('building');
    expect(region.semantic.properties.height).toBe(18); // floors*3 表达式
    expect(region.shape.type).toBe('polygon'); // geometry.shape 显式覆写
    expect(region.style.presetId).toBe('building.default'); // 语义默认预设
    const buildingLayer = fx.facade.scene.getLayers().find((l) => l.name === '建筑');
    expect(buildingLayer).toBeDefined();
    expect(region.layerId).toBe(buildingLayer!.id); // 语义默认图层（metadata.layerName 归层）
    expect(fx.facade.history.canUndo()).toBe(true); // 一条导入历史
    expect(fx.notices).toHaveLength(1);
    expect(fx.notices[0]!.kind).toBe('info');
    expect(fx.notices[0]!.text).toContain('批量导入：1 个对象');
    // JsonImporter 自身映射语义的回归覆盖见 tests/io/JsonImporter.test.ts
  });
});

describe('createEditorActions 场景模板路由（T8.2）', () => {
  let fx: Fixture;
  beforeEach(() => {
    fx = setup();
  });

  it('file.new-empty：confirmSceneReplace 收到三行摘要（空园区 · 内置 · 0 对象 11 图层）', async () => {
    fx.actions.dispatch('file.new-empty');
    await flushAsync();
    expect(fx.confirmCalls).toEqual([
      { name: '空园区', source: '内置', objectCount: 0, layerCount: 11 },
    ]);
    expect(fx.facade.scene.getLayers()).toHaveLength(11);
  });

  it('dirty 确认取消（confirm=false）：零副作用——不 openScene、零事件、零提示', async () => {
    fx.setConfirmResult(false);
    const open = vi.spyOn(fx.facade, 'openScene');
    fx.actions.dispatch('file.new-empty');
    await flushAsync();
    expect(open).not.toHaveBeenCalled();
    expect(fx.events).toEqual([]);
    expect(fx.notices).toEqual([]);
  });

  it('file.new-from-builtin-sample：实例化示例园区（6 对象/11 图层，id 全量重生成 ≠ 模板原 id）+ 模板文案', async () => {
    const open = vi.spyOn(fx.facade, 'openScene');
    fx.actions.dispatch('file.new-from-builtin-sample');
    await flushAsync();

    expect(fx.confirmCalls).toEqual([
      { name: '示例园区', source: '内置', objectCount: 6, layerCount: 11 },
    ]);
    expect(open).toHaveBeenCalledTimes(1);
    const data = open.mock.calls[0]![0];
    expect(data.objects).toHaveLength(6);
    expect(data.layers).toHaveLength(11);
    // id 全量重生成：与模板原 id 零交集（防跨场景冲突与模板污染）
    const template = BUILTIN_TEMPLATES.find((t) => t.id === 'builtin-sample')!;
    const templateIds = new Set([
      template.scene.id,
      ...template.scene.layers.map((l) => l.id),
      ...template.scene.objects.map((o) => o.id),
    ]);
    const newIds = [data.id, ...data.layers.map((l) => l.id), ...data.objects.map((o) => o.id)];
    for (const id of newIds) expect(templateIds.has(id)).toBe(false);
    // 引用一致重映射：对象 layerId 指向同名图层
    for (const obj of data.objects) {
      const layer = data.layers.find((l) => l.id === obj.layerId)!;
      expect(layer.objectIds).toContain(obj.id);
    }
    expect(fx.events).toContain('SCENE_LOADED');
    expect(fx.notices[0]!.kind).toBe('info');
    expect(fx.notices[0]!.text).toBe('已从模板新建：示例园区 · 6 个对象 · 11 个图层');
  });

  it('file.new-from-<用户模板 id>：来源「个人」，经 deps.getUserTemplates 查载荷', async () => {
    const scene = BUILTIN_TEMPLATES[1]!.scene;
    fx.userTemplates.push({ id: 'tpl_user1', name: '我的园区', builtin: false, scene });
    const open = vi.spyOn(fx.facade, 'openScene');
    fx.actions.dispatch('file.new-from-tpl_user1');
    await flushAsync();

    expect(fx.confirmCalls).toEqual([
      { name: '我的园区', source: '个人', objectCount: scene.objects.length, layerCount: scene.layers.length },
    ]);
    expect(open).toHaveBeenCalledTimes(1);
    expect(fx.notices[0]!.text).toContain('已从模板新建：我的园区');
  });

  it('file.new-from-<未知 id>：静默无操作（不确认、不 openScene）', async () => {
    const open = vi.spyOn(fx.facade, 'openScene');
    fx.actions.dispatch('file.new-from-tpl_nope');
    await flushAsync();
    expect(fx.confirmCalls).toEqual([]);
    expect(open).not.toHaveBeenCalled();
    expect(fx.notices).toEqual([]);
  });

  it('file.save-as-template：命名 → 当前场景深拷贝入库 → 刷新清单回调 + info 提示', async () => {
    fx.facade.scene.addObject(makeObject('总部'));
    fx.setNamingResult('我的模板');
    fx.userTemplates.push({ id: 'tpl_old', name: '旧模板', builtin: false, scene: BUILTIN_TEMPLATES[0]!.scene });

    fx.actions.dispatch('file.save-as-template');
    await flushAsync();

    // 命名弹层收到既有名清单（重名「将覆盖」判定依据）
    expect(fx.namingCalls).toEqual([['旧模板']]);
    expect(fx.saveTemplateCalls).toHaveLength(1);
    expect(fx.saveTemplateCalls[0]!.name).toBe('我的模板');
    // 入库载荷 = 当前场景快照（serialize → deserialize 深拷贝，与门面序列化一致）
    const saved = JSON.parse(fx.saveTemplateCalls[0]!.text);
    expect(saved).toEqual(JSON.parse(fx.facade.saveScene()));
    expect(fx.refreshTemplatesCount()).toBe(1);
    expect(fx.notices[0]).toEqual({ kind: 'info', text: '已保存模板「我的模板」' });
  });

  it('file.save-as-template 容量拒存：notify error（附原因与清理提示）+ 仍刷新清单', async () => {
    fx.setNamingResult('超限模板');
    fx.setSaveTemplateResult({ ok: false, reason: 'count-limit' });
    fx.actions.dispatch('file.save-as-template');
    await flushAsync();
    expect(fx.notices[0]!.kind).toBe('error');
    expect(fx.notices[0]!.text).toContain('模板未保存');
    expect(fx.notices[0]!.text).toContain('上限');
    expect(fx.notices[0]!.text).toContain('删除旧模板');
  });

  it('file.save-as-template 取消（命名 null）：零副作用', async () => {
    fx.setNamingResult(null);
    fx.actions.dispatch('file.save-as-template');
    await flushAsync();
    expect(fx.saveTemplateCalls).toEqual([]);
    expect(fx.refreshTemplatesCount()).toBe(0);
    expect(fx.notices).toEqual([]);
  });

  it('file.manage-templates：打开模板管理弹层回调', () => {
    fx.actions.dispatch('file.manage-templates');
    expect(fx.manageDialogOpens()).toBe(1);
  });
});

describe('createEditorActions 批量导入（T8.2 多文件）', () => {
  let fx: Fixture;
  beforeEach(() => {
    fx = setup();
  });

  /** 单文件 building 数据（name/floors 可注入） */
  function buildingFile(name: string, buildingName: string, floors: number): PickedFile {
    return {
      text: JSON.stringify({
        data: { buildings: [{ name: buildingName, floors, footprint: [[0, 0], [10, 0], [10, 8], [0, 0]] }] },
      }),
      name,
    };
  }

  it('三文件两好一坏：逐文件独立解析 → 预览行三态数据正确（文件级失败不阻断）', async () => {
    fx.setPickFilesResult([
      buildingFile('a.json', 'A 座', 6),
      {
        // rootArray 缺失：parse 返回 errors 非空 objects 空 → 成功行「0 对象 · 1 告警」
        text: JSON.stringify({ nothing: true }),
        name: 'b.json',
      },
      { text: '{oops', name: 'c.json' }, // JSON.parse 抛错 → 文件级失败态
    ]);
    fx.actions.dispatch('file.import-json');
    await flushAsync();

    expect(fx.previewRows).toHaveLength(1);
    expect(fx.previewRows[0]).toEqual([
      { name: 'a.json', status: 'ok', objectCount: 1, warningCount: 0 },
      { name: 'b.json', status: 'ok', objectCount: 0, warningCount: 1 },
      { name: 'c.json', status: 'failed', message: expect.stringContaining('JSON') },
    ]);
  });

  it('确认：全部文件 objects 合并一次 importElements——单条历史 undo 一次全消 / redo 复原 + 汇总提示', async () => {
    fx.setPickFilesResult([buildingFile('a.json', 'A 座', 6), buildingFile('b.json', 'B 座', 3)]);
    fx.actions.dispatch('file.import-json');
    await flushAsync();

    expect(fx.facade.scene.getObjects()).toHaveLength(2);
    expect(fx.facade.history.canUndo()).toBe(true);

    // 单历史：undo 一次全部移除
    fx.facade.history.undo();
    expect(fx.facade.scene.getObjects()).toHaveLength(0);
    // redo 复原
    fx.facade.history.redo();
    expect(fx.facade.scene.getObjects()).toHaveLength(2);

    expect(fx.notices[0]!.kind).toBe('info');
    expect(fx.notices[0]!.text).toBe('批量导入：2 个对象');
  });

  it('告警汇总：宽限告警计入汇总文案（N 条告警见控制台沿现路径）', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      fx.setPickFilesResult([buildingFile('a.json', 'A 座', 6), { text: JSON.stringify({ nothing: true }), name: 'b.json' }]);
      fx.actions.dispatch('file.import-json');
      await flushAsync();
      expect(fx.facade.scene.getObjects()).toHaveLength(1);
      expect(fx.notices[0]!.text).toBe('批量导入：1 个对象 · 1 条告警（见控制台）');
      expect(warn).toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it('取消（预览 false）：零副作用——不入场景、零历史、零提示', async () => {
    fx.setPickFilesResult([buildingFile('a.json', 'A 座', 6)]);
    fx.setPreviewResult(false);
    fx.actions.dispatch('file.import-json');
    await flushAsync();
    expect(fx.facade.scene.getObjects()).toHaveLength(0);
    expect(fx.facade.history.canUndo()).toBe(false);
    expect(fx.notices).toEqual([]);
  });

  it('取消选择（pickFiles null）：不弹预览', async () => {
    fx.setPickFilesResult(null);
    fx.actions.dispatch('file.import-json');
    await flushAsync();
    expect(fx.previewRows).toEqual([]);
    expect(fx.facade.scene.getObjects()).toHaveLength(0);
  });

  it('全部文件合计 0 对象（rows 断言——确认禁用口径的数据源）', async () => {
    fx.setPickFilesResult([{ text: JSON.stringify({ nothing: true }), name: '空.json' }]);
    fx.setPreviewResult(false); // UI 禁用确认的数据面留 T8.6 GUI；此处仅锁 rows 口径
    fx.actions.dispatch('file.import-json');
    await flushAsync();
    expect(fx.previewRows[0]).toEqual([
      { name: '空.json', status: 'ok', objectCount: 0, warningCount: 1 },
    ]);
    expect(fx.facade.scene.getObjects()).toHaveLength(0);
  });
});

describe('createEditorActions 视图 / 工具 / 场景 / 资产 / 帮助路由', () => {
  let fx: Fixture;
  beforeEach(() => {
    fx = setup();
  });

  it('view.camera-* → 相机 Port setMode', () => {
    const setMode = vi.spyOn(fx.facade.camera, 'setMode');
    fx.actions.dispatch('view.camera-top');
    fx.actions.dispatch('view.camera-front');
    fx.actions.dispatch('view.camera-side');
    fx.actions.dispatch('view.camera-perspective');
    expect(setMode.mock.calls.map((c) => c[0])).toEqual(['top', 'front', 'side', 'perspective']);
  });

  it('view.grid：切换 environment.grid.visible（经 setGrid 通道）', () => {
    expect(fx.facade.getGrid().visible).toBe(true);
    fx.actions.dispatch('view.grid');
    expect(fx.facade.getGrid().visible).toBe(false);
    fx.actions.dispatch('view.grid');
    expect(fx.facade.getGrid().visible).toBe(true);
  });

  it('view.panel-*：按当前状态取反写入 workspaceStore', () => {
    fx.actions.dispatch('view.panel-left');
    fx.actions.dispatch('view.panel-bottom');
    expect(fx.panelOps).toEqual([
      { zone: 'left', hidden: true },
      { zone: 'bottom', hidden: true },
    ]);
    fx.actions.dispatch('view.panel-left'); // 已隐藏 → 显示
    expect(fx.panelOps[2]).toEqual({ zone: 'left', hidden: false });
  });

  it('view.minimap（T7.7）：按当前状态取反写 workspaceStore.minimapVisible', () => {
    fx.actions.dispatch('view.minimap');
    fx.actions.dispatch('view.minimap');
    expect(fx.minimapOps).toEqual([false, true]);
  });

  it('view.render-* → setRenderMode 记账（T5.7 消费；T8.4 诊断三档同路）', () => {
    fx.actions.dispatch('view.render-wireframe');
    fx.actions.dispatch('view.render-xray');
    fx.actions.dispatch('view.render-shaded');
    expect(fx.renderModes).toEqual(['wireframe', 'xray', 'shaded']);
    fx.actions.dispatch('view.render-clay');
    fx.actions.dispatch('view.render-normals');
    fx.actions.dispatch('view.render-islands');
    expect(fx.renderModes).toEqual(['wireframe', 'xray', 'shaded', 'clay', 'normals', 'islands']);
  });

  it('tool.snap：取反吸附总开关（T8.1——压下全部吸附分项不写分项记忆；网格分项独立）', () => {
    expect(fx.facade.snapTiers.masterEnabled).toBe(true);
    fx.actions.dispatch('tool.snap');
    expect(fx.facade.snapTiers.masterEnabled).toBe(false);
    expect(fx.facade.drawGrid.snapEnabled).toBe(true); // 网格分项记忆不被总开关改写
    fx.actions.dispatch('tool.snap');
    expect(fx.facade.snapTiers.masterEnabled).toBe(true);
  });

  it('scene.layers / asset.browser：面板显隐动作（确保可见）', () => {
    fx.actions.dispatch('scene.layers');
    fx.actions.dispatch('asset.browser');
    expect(fx.panelOps).toEqual([
      { zone: 'left', hidden: false },
      { zone: 'bottom', hidden: false },
    ]);
  });

  it('file.scene-settings：右面板恢复显示 + 切到「全局设置」标签（T5.4 Inspector 跳转）', () => {
    fx.actions.dispatch('file.scene-settings');
    expect(fx.panelOps).toEqual([{ zone: 'right', hidden: false }]);
    expect(fx.inspectorTabs).toEqual(['settings']);
    // 再次派发幂等（面板已可见仍写显示、标签重设）
    fx.actions.dispatch('file.scene-settings');
    expect(fx.panelOps[1]).toEqual({ zone: 'right', hidden: false });
    expect(fx.inspectorTabs).toEqual(['settings', 'settings']);
  });

  it('help.readme → openUrl；help.shortcuts/about → 弹层回调', () => {
    fx.actions.dispatch('help.readme');
    fx.actions.dispatch('help.shortcuts');
    fx.actions.dispatch('help.about');
    expect(fx.urls).toEqual(['README.md']);
    expect(fx.dialogs).toEqual(['shortcuts', 'about']);
  });

  it('未知 actionId：零异常零派发', () => {
    expect(() => fx.actions.dispatch('nope.nope')).not.toThrow();
    expect(fx.events).toEqual([]);
  });
});

describe('dirty 判定：快照对比（非计数）', () => {
  let fx: Fixture;
  beforeEach(() => {
    fx = setup();
  });
  afterEach(() => {
    fx.actions.dispose();
  });

  it('场景对象变更 → checkDirty → SCENE_CHANGED；内容相同不重复误报', () => {
    fx.facade.scene.addObject(makeObject());
    fx.actions.checkDirty();
    expect(fx.events).toContain('SCENE_CHANGED');

    // 未再变更：对比结果与基线不同（上一拍未保存）→ 保持 dirty 语义（幂等）
    fx.events.length = 0;
    fx.actions.checkDirty();
    expect(fx.events).toEqual([]); // 基线仍为旧快照？——保存成功才刷新基线，dirty 期间无新事件语义
  });

  it('环境类变更（setGrid）也算 dirty（随场景保存）', () => {
    fx.facade.setGrid({ ...fx.facade.getGrid(), visible: false });
    fx.actions.checkDirty();
    expect(fx.events).toContain('SCENE_CHANGED');
  });

  it('非持久化变更（吸附开关）不触发 dirty', () => {
    fx.actions.dispatch('tool.snap');
    fx.actions.checkDirty();
    expect(fx.events).toEqual([]);
  });

  it('undo 回到基线：快照与已保存一致 → SCENE_LOADED 复归已保存（dirty ⇔ 快照≠基线）', () => {
    const obj = makeObject('命令创建');
    fx.facade.history.execute(new CreateObjectCommand(obj));
    fx.actions.checkDirty();
    expect(fx.events).toContain('SCENE_CHANGED');

    fx.events.length = 0;
    fx.facade.history.undo(); // 回到空场景 = 基线
    fx.actions.checkDirty();
    expect(fx.events).toEqual(['SCENE_LOADED']);
  });

  it('保存成功刷新基线 → checkDirty 复归无事件', () => {
    fx.facade.scene.addObject(makeObject());
    fx.actions.checkDirty();
    expect(fx.events).toContain('SCENE_CHANGED');

    fx.actions.dispatch('file.save');
    fx.events.length = 0;
    fx.actions.checkDirty();
    expect(fx.events).toEqual([]);
  });

  it('scheduleDirtyCheck：500ms 节流收敛为一次对比；dispose 清定时器', () => {
    vi.useFakeTimers();
    try {
      fx.facade.scene.addObject(makeObject());
      fx.actions.scheduleDirtyCheck();
      fx.actions.scheduleDirtyCheck();
      fx.actions.scheduleDirtyCheck();
      expect(fx.events).toEqual([]); // 未到节流窗不发

      vi.advanceTimersByTime(499);
      expect(fx.events).toEqual([]);
      vi.advanceTimersByTime(1);
      expect(fx.events).toEqual(['SCENE_CHANGED']);

      // dispose 后不再调度
      fx.events.length = 0;
      fx.actions.dispose();
      fx.facade.scene.addObject(makeObject('再来一个'));
      fx.actions.scheduleDirtyCheck();
      vi.advanceTimersByTime(1000);
      expect(fx.events).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });
});

/** 在门面上以「当前默认场景 + 一个对象」生成合法场景 JSON（序列化器产线一致） */
function serializeWithObject(facade: EditorHandle, obj: SceneObject): string {
  facade.scene.addObject(obj);
  const text = facade.saveScene();
  facade.scene.removeObject(obj.id);
  facade.history.clear();
  return text;
}
