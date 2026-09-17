/**
 * tests/ui/menus/menuModel.test.ts —— 主菜单模型纯函数测试（T5.2，先测后码）。
 *
 * 覆盖（任务书「菜单模型（纯数据，node 可测）」七菜单清单 + enabled 矩阵）：
 * - 七菜单结构（文件/编辑/场景/资产/工具/视图/帮助）与既定项序；
 * - enabled 矩阵逐项：canUndo/canRedo/hasSelection/hasClipboard/ready 等驱动位；
 * - 禁用占位项恒 disabled（可见不隐藏，需求 §39「新功能准入」）；
 * - checked 位：面板显隐 = !hiddenPanels、视角 = cameraMode、网格 = gridVisible、
 *   吸附 = snapEnabled、渲染模式 = renderMode（T5.7 起启用，环境通道同源）；
 * - action id 全清单唯一且稳定（T5.6 快捷键 / T5.8 右键菜单复用的轻量契约快照）；
 * - 快捷键键帽只标注当前真实生效的组合（input.ts 既有表）。
 * 边界：node 纯逻辑（buildMenus 纯函数）；MenuBar 键盘导航等 GUI 行为留 T5.9 验收。
 */
import { describe, expect, it } from 'vitest';
import {
  ABOUT_INFO,
  SHORTCUT_HELP,
  buildMenus,
  collectActionIds,
  type MenuItemDef,
  type MenuState,
  type MenuSubmenuDef,
} from '../../../src/ui/menus/menuModel';

/** 全开基线（ready 且有撤销/选中/剪贴板）；用例按需覆盖单字段 */
function state(patch: Partial<MenuState> = {}): MenuState {
  return {
    ready: true,
    canUndo: true,
    canRedo: true,
    hasSelection: true,
    hasClipboard: true,
    dirty: false,
    saveState: 'saved',
    panelsHidden: { left: false, right: false, bottom: false },
    cameraMode: 'perspective',
    renderMode: 'shaded',
    gridVisible: true,
    snapEnabled: true,
    readmeAvailable: true,
    workMode: 'scene',
    pure3d: false,
    minimapVisible: true,
    activeToolId: null,
    // T8.2 默认 = 两内置模板 + 空用户清单（App 装配层组装口径）
    templates: [
      { id: 'builtin-empty', name: '空园区', builtin: true },
      { id: 'builtin-sample', name: '示例园区', builtin: true },
    ],
    ...patch,
  };
}

/** 从构建结果中取指定菜单 */
function menuOf(id: string) {
  const menus = buildMenus(state());
  const menu = menus.find((m) => m.id === id);
  if (!menu) throw new Error(`菜单不存在: ${id}`);
  return menu;
}

/** 取指定 action id 的菜单项定义（含子菜单子项展开；separator 不占位） */
function itemOf(menuId: string, actionId: string) {
  const menu = menuOf(menuId);
  const entries = menu.items.flatMap((i): (MenuItemDef | MenuSubmenuDef)[] =>
    'separator' in i
      ? []
      : 'submenu' in i
        ? [i, ...i.items.filter((c): c is MenuItemDef | MenuSubmenuDef => !('separator' in c))]
        : [i],
  );
  const item = entries.find(
    (i): i is MenuItemDef => 'id' in i && !('submenu' in i) && i.id === actionId,
  );
  if (!item) throw new Error(`菜单 ${menuId} 中不存在项: ${actionId}`);
  return item;
}

describe('buildMenus 七菜单结构', () => {
  it('七个菜单按既定顺序（文件/编辑/场景/资产/工具/视图/帮助）', () => {
    const menus = buildMenus(state());
    expect(menus.map((m) => m.id)).toEqual([
      'file',
      'edit',
      'scene',
      'asset',
      'tool',
      'view',
      'help',
    ]);
    expect(menus.map((m) => m.label)).toEqual([
      '文件',
      '编辑',
      '场景',
      '资产',
      '工具',
      '视图',
      '帮助',
    ]);
  });

  it('文件菜单项序：新建场景▾(T8.2 子菜单)/打开/保存/另存为/另存为模板(T8.2) | 导入/导出 | 场景设置(T5.4 启用)', () => {
    const ids = menuOf('file').items
      .filter((i): i is MenuItemDef => 'id' in i && !('submenu' in i))
      .map((i) => i.id);
    expect(ids).toEqual([
      'file.open',
      'file.save',
      'file.save-as',
      'file.save-as-template',
      'file.import-json',
      'file.export',
      'file.scene-settings',
    ]);
    // 「新建场景」子菜单父项占文件菜单首位（父项 id 不派发，仅展开语义）
    const first = menuOf('file').items[0]!;
    expect('submenu' in first && first.id).toBe('file.new');
  });

  it('「新建场景」子菜单（T8.2）：空场景 / separator 分区 / 内置模板 / 用户模板空占位 / 管理项', () => {
    const entries = menuOf('file').items;
    const submenu = entries.find(
      (i): i is MenuSubmenuDef => 'submenu' in i && i.id === 'file.new',
    );
    if (!submenu) throw new Error('file.new 子菜单不存在');
    expect(submenu.label).toBe('新建场景');
    expect(submenu.items.some((i) => 'separator' in i)).toBe(true); // 分区 separator（无 header 行）

    const childIds = submenu.items
      .filter((i): i is MenuItemDef => !('separator' in i))
      .map((i) => i.id);
    expect(childIds).toEqual([
      'file.new-empty',
      'file.new-from-builtin-empty',
      'file.new-from-builtin-sample',
      'file.no-user-templates', // 用户模板空 → disabled 占位行（可见不隐藏）
      'file.manage-templates',
    ]);
    expect(itemOf('file', 'file.new-empty').label).toBe('空场景');
    expect(itemOf('file', 'file.new-from-builtin-empty').label).toBe('空园区');
    expect(itemOf('file', 'file.new-from-builtin-sample').label).toBe('示例园区');
    expect(itemOf('file', 'file.manage-templates').label).toBe('管理模板…');
    const placeholderRow = itemOf('file', 'file.no-user-templates');
    expect(placeholderRow.enabled).toBe(false);
    expect(placeholderRow.label).toBe('暂无用户模板——用「另存为模板…」创建');
  });

  it('「新建场景」子菜单：用户模板非空时无占位行，用户项 file.new-from-<id> 入区', () => {
    const menus = buildMenus(
      state({
        templates: [
          ...state().templates,
          { id: 'tpl_abc123', name: '我的园区', builtin: false },
          { id: 'tpl_def456', name: '二期园区', builtin: false },
        ],
      }),
    );
    const submenu = menus
      .find((m) => m.id === 'file')!
      .items.find((i): i is MenuSubmenuDef => 'submenu' in i && i.id === 'file.new');
    const childIds = submenu!.items
      .filter((i): i is MenuItemDef => !('separator' in i))
      .map((i) => i.id);
    expect(childIds).toEqual([
      'file.new-empty',
      'file.new-from-builtin-empty',
      'file.new-from-builtin-sample',
      'file.new-from-tpl_abc123',
      'file.new-from-tpl_def456',
      'file.manage-templates',
    ]);
    const byId = new Map(submenu!.items.filter((i): i is MenuItemDef => !('separator' in i)).map((i) => [i.id, i]));
    expect(byId.get('file.new-from-tpl_abc123')!.label).toBe('我的园区');
    expect(byId.get('file.new-from-tpl_abc123')!.enabled).toBe(true);
  });

  it('编辑菜单项序：撤销/重做 | 剪切/复制/粘贴/原地复制(T7.1)/删除 | 全选/取消选择 | 批量编辑(disabled)', () => {
    const ids = menuOf('edit').items
      .filter((i): i is MenuItemDef => 'id' in i && !('submenu' in i))
      .map((i) => i.id);
    expect(ids).toEqual([
      'edit.undo',
      'edit.redo',
      'edit.cut',
      'edit.copy',
      'edit.paste',
      'edit.duplicate',
      'edit.delete',
      'edit.select-all',
      'edit.deselect',
      'edit.batch-edit',
    ]);
  });

  it('视图菜单含面板三项 / 纯三维模式(T7.4) / 工作模式子菜单(T7.1) / 视角四项 / 渲染三项+诊断三项(T8.4) / 网格 / 辅助线 / 小地图 / 工作区布局', () => {
    const ids = menuOf('view').items
      .filter((i): i is MenuItemDef => 'id' in i && !('submenu' in i))
      .map((i) => i.id);
    expect(ids).toEqual([
      'view.panel-left',
      'view.panel-right',
      'view.panel-bottom',
      'view.pure3d',
      'view.camera-perspective',
      'view.camera-top',
      'view.camera-front',
      'view.camera-side',
      'view.render-shaded',
      'view.render-wireframe',
      'view.render-xray',
      'view.render-clay',
      'view.render-normals',
      'view.render-islands',
      'view.grid',
      'view.guides',
      'view.minimap',
      'view.workspace',
    ]);
    // 纯三维模式与子菜单父项在面板三项之后（父项 id 不派发，仅展开语义）
    const entries = menuOf('view').items.filter((i) => 'id' in i).map((i) => (i as { id: string }).id);
    expect(entries[3]).toBe('view.pure3d');
    expect(entries[4]).toBe('view.modes');
    // 常规/诊断两组以 separator 分隔（组间分隔线，无 header 行）
    const renderItems = menuOf('view').items;
    const idxShaded = renderItems.findIndex((i) => 'id' in i && i.id === 'view.render-shaded');
    const idxClay = renderItems.findIndex((i) => 'id' in i && i.id === 'view.render-clay');
    const between = renderItems.slice(idxShaded + 1, idxClay);
    expect(between.some((i) => 'separator' in i)).toBe(true);
  });
});

describe('enabled 矩阵', () => {
  it('未就绪（门面未装配）：一切需要门面的动作均禁用（含子菜单父项与子项）', () => {
    const menus = buildMenus(state({ ready: false }));
    const items = menus.flatMap((m) =>
      m.items.flatMap((i): MenuItemDef[] =>
        'separator' in i
          ? []
          : 'submenu' in i
            ? [
                i,
                ...i.items.filter((c): c is MenuItemDef => !('separator' in c) && !('submenu' in c)),
              ]
            : [i],
      ),
    );
    for (const item of items) {
      // 帮助三项为纯 UI（弹层/外链），不依赖门面
      if (item.id.startsWith('help.')) continue;
      expect(item.enabled, `${item.id} 应禁用`).toBe(false);
    }
  });

  it('撤销/重做分别由 canUndo/canRedo 驱动', () => {
    expect(itemOf('edit', 'edit.undo').enabled).toBe(true);
    expect(itemOf('edit', 'edit.redo').enabled).toBe(true);
    const s = state({ canUndo: false, canRedo: false });
    const menus = buildMenus(s);
    const find = (id: string) =>
      menus
        .flatMap((m) => m.items)
        .find((i): i is MenuItemDef => 'id' in i && !('submenu' in i) && i.id === id)!;
    expect(find('edit.undo').enabled).toBe(false);
    expect(find('edit.redo').enabled).toBe(false);
  });

  it('复制/删除/取消选择由 hasSelection 驱动；粘贴由 hasClipboard 驱动', () => {
    const s = state({ hasSelection: false, hasClipboard: false });
    const find = (id: string) => {
      const menus = buildMenus(s);
      return menus
        .flatMap((m) => m.items)
        .find((i): i is MenuItemDef => 'id' in i && !('submenu' in i) && i.id === id)!;
    };
    expect(find('edit.copy').enabled).toBe(false);
    expect(find('edit.delete').enabled).toBe(false);
    expect(find('edit.deselect').enabled).toBe(false);
    expect(find('edit.paste').enabled).toBe(false);

    const s2 = state({ hasSelection: false, hasClipboard: true });
    const menus2 = buildMenus(s2);
    const find2 = (id: string) =>
      menus2
        .flatMap((m) => m.items)
        .find((i): i is MenuItemDef => 'id' in i && !('submenu' in i) && i.id === id)!;
    expect(find2('edit.paste').enabled).toBe(true); // 剪贴板有内容即可粘贴
    expect(find2('edit.copy').enabled).toBe(false); // 无选中仍不可复制
  });

  it('保存中（saveState=saving）保存/另存为/导出禁用（防重入）', () => {
    const s = state({ saveState: 'saving' });
    const find = (id: string) =>
      buildMenus(s)
        .flatMap((m) => m.items)
        .find((i): i is MenuItemDef => 'id' in i && !('submenu' in i) && i.id === id)!;
    expect(find('file.save').enabled).toBe(false);
    expect(find('file.save-as').enabled).toBe(false);
    expect(find('file.export').enabled).toBe(false);
  });

  it('README 不可达时操作说明禁用', () => {
    const s = state({ readmeAvailable: false });
    const item = buildMenus(s)
      .flatMap((m) => m.items)
      .find((i): i is MenuItemDef => 'id' in i && !('submenu' in i) && i.id === 'help.readme')!;
    expect(item.enabled).toBe(false);
    expect(itemOf('help', 'help.readme').enabled).toBe(true); // 可达时启用
  });

  it('禁用占位项恒 disabled（可见不隐藏）：全开基线下仍灰显', () => {
    const disabledAlways = [
      'edit.cut',
      'edit.batch-edit',
      'scene.validate',
      'scene.stats',
      'scene.switch',
      'asset.import-model',
      'asset.materials',
      'tool.annotate',
      'tool.align',
      'tool.array',
      'tool.analyze',
      'view.guides',
      'view.workspace',
      'view.mode-analysis', // T7.1：子菜单内禁用占位（排除项，解禁走按需门）
    ];
    for (const id of disabledAlways) {
      const [menuId] = id.split('.');
      expect(itemOf(menuId, id).enabled, `${id} 应为禁用占位`).toBe(false);
    }
  });

  it('渲染模式三项（T5.7 起生效）：ready 时启用，未就绪禁用', () => {
    expect(itemOf('view', 'view.render-shaded').enabled).toBe(true);
    expect(itemOf('view', 'view.render-wireframe').enabled).toBe(true);
    expect(itemOf('view', 'view.render-xray').enabled).toBe(true);
    const menus = buildMenus(state({ ready: false }));
    const item = menus
      .flatMap((m) => m.items)
      .find((i): i is MenuItemDef => 'id' in i && !('submenu' in i) && i.id === 'view.render-xray')!;
    expect(item.enabled).toBe(false);
  });

  it('诊断三项（T8.4）：ready 时启用，标签中文主导（灰模/法线/孤岛高亮）', () => {
    expect(itemOf('view', 'view.render-clay').label).toBe('灰模（Clay）');
    expect(itemOf('view', 'view.render-normals').label).toBe('法线（Normals）');
    expect(itemOf('view', 'view.render-islands').label).toBe('孤岛高亮');
    for (const id of ['view.render-clay', 'view.render-normals', 'view.render-islands']) {
      expect(itemOf('view', id).enabled).toBe(true);
    }
    const menus = buildMenus(state({ ready: false }));
    const item = menus
      .flatMap((m) => m.items)
      .find((i): i is MenuItemDef => 'id' in i && !('submenu' in i) && i.id === 'view.render-islands')!;
    expect(item.enabled).toBe(false);
  });

  it('view.minimap（T7.7 转正）：checked 随 workspaceStore.minimapVisible，ready 时启用', () => {
    expect(itemOf('view', 'view.minimap').enabled).toBe(true);
    expect(itemOf('view', 'view.minimap').checked).toBe(true);
    const item = buildMenus(state({ minimapVisible: false }))
      .flatMap((m) => m.items)
      .find((i): i is MenuItemDef => 'id' in i && !('submenu' in i) && i.id === 'view.minimap')!;
    expect(item.checked).toBe(false);
    expect(item.enabled).toBe(true);
  });

  it('场景/资产菜单可达项：图层管理 / 资产管理（面板显隐动作）', () => {
    expect(itemOf('scene', 'scene.layers').enabled).toBe(true);
    expect(itemOf('asset', 'asset.browser').enabled).toBe(true);
  });

  it('file.scene-settings 场景设置（T5.4）：ready 时启用（→ 右面板全局设置标签），未就绪禁用', () => {
    expect(itemOf('file', 'file.scene-settings').enabled).toBe(true);
    const menus = buildMenus(state({ ready: false }));
    const item = menus
      .flatMap((m) => m.items)
      .find((i): i is MenuItemDef => 'id' in i && !('submenu' in i) && i.id === 'file.scene-settings')!;
    expect(item.enabled).toBe(false);
  });

  it('删除项带 danger 标记（破坏性操作视觉提示）', () => {
    expect(itemOf('edit', 'edit.delete').danger).toBe(true);
  });
});

describe('checked 位', () => {
  const find = (s: MenuState, id: string) =>
    buildMenus(s)
      .flatMap((m) => m.items)
      .find((i): i is MenuItemDef => 'id' in i && !('submenu' in i) && i.id === id)!;

  it('面板显示 = !hiddenPanels（隐藏后取消勾选）', () => {
    const s = state({ panelsHidden: { left: true, right: false, bottom: true } });
    expect(find(s, 'view.panel-left').checked).toBe(false);
    expect(find(s, 'view.panel-right').checked).toBe(true);
    expect(find(s, 'view.panel-bottom').checked).toBe(false);
  });

  it('视角 checked = cameraMode（单选组）', () => {
    const s = state({ cameraMode: 'top' });
    expect(find(s, 'view.camera-perspective').checked).toBe(false);
    expect(find(s, 'view.camera-top').checked).toBe(true);
    expect(find(s, 'view.camera-front').checked).toBe(false);
    expect(find(s, 'view.camera-side').checked).toBe(false);
  });

  it('网格 checked = gridVisible；吸附 checked = snapEnabled', () => {
    const s = state({ gridVisible: false, snapEnabled: false });
    expect(find(s, 'view.grid').checked).toBe(false);
    expect(find(s, 'tool.snap').checked).toBe(false);
    expect(find(state(), 'view.grid').checked).toBe(true);
    expect(find(state(), 'tool.snap').checked).toBe(true);
  });

  it('渲染模式 checked = renderMode（T5.7：与 HUD Shaded ▼ 同源环境通道；ready 时可点）', () => {
    const s = state({ renderMode: 'wireframe' });
    expect(find(s, 'view.render-shaded').checked).toBe(false);
    expect(find(s, 'view.render-wireframe').checked).toBe(true);
    expect(find(s, 'view.render-xray').checked).toBe(false);
    expect(find(s, 'view.render-wireframe').enabled).toBe(true); // T5.7 渲染消费落地
  });

  it('诊断档 checked = renderMode 六态单选组（T8.4：islands 激活时仅孤岛高亮勾选）', () => {
    const s = state({ renderMode: 'islands' });
    expect(find(s, 'view.render-islands').checked).toBe(true);
    expect(find(s, 'view.render-clay').checked).toBe(false);
    expect(find(s, 'view.render-normals').checked).toBe(false);
    expect(find(s, 'view.render-shaded').checked).toBe(false);
    expect(find(state({ renderMode: 'clay' }), 'view.render-clay').checked).toBe(true);
    expect(find(state({ renderMode: 'normals' }), 'view.render-normals').checked).toBe(true);
  });

  it('纯三维模式 checked = pure3d（T7.4：进入后勾选；ready 时可点）', () => {
    expect(find(state(), 'view.pure3d').checked).toBe(false);
    expect(find(state(), 'view.pure3d').enabled).toBe(true);
    expect(find(state({ pure3d: true }), 'view.pure3d').checked).toBe(true);
  });
});

describe('action id 契约（T5.6 快捷键 / T5.8 右键菜单复用）', () => {
  it('全部 id 唯一、点分两段以上、无空段（段允许数字，如 view.pure3d）', () => {
    const ids = collectActionIds(buildMenus(state()));
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z]+(-[a-z0-9]+)*\.[a-z0-9-]+(\.[a-z0-9-]+)?$/);
    }
  });

  it('id 全清单快照（轻量契约：一经定义不得改名，只可追加；子菜单子项展开收录；separator 不占 id）', () => {
    expect(collectActionIds(buildMenus(state()))).toEqual([
      'file.new-empty',
      'file.new-from-builtin-empty',
      'file.new-from-builtin-sample',
      'file.no-user-templates',
      'file.manage-templates',
      'file.open',
      'file.save',
      'file.save-as',
      'file.save-as-template',
      'file.import-json',
      'file.export',
      'file.scene-settings',
      'edit.undo',
      'edit.redo',
      'edit.cut',
      'edit.copy',
      'edit.paste',
      'edit.duplicate',
      'edit.delete',
      'edit.select-all',
      'edit.deselect',
      'edit.batch-edit',
      'scene.layers',
      'scene.validate',
      'scene.stats',
      'scene.switch',
      'asset.browser',
      'asset.import-model',
      'asset.materials',
      'tool.measure-distance',
      'tool.measure-height',
      'tool.measure-area',
      'tool.measure-angle',
      'tool.annotate',
      'tool.align',
      'tool.snap',
      'tool.array',
      'tool.analyze',
      'view.panel-left',
      'view.panel-right',
      'view.panel-bottom',
      'view.pure3d',
      'view.mode-scene',
      'view.mode-build',
      'view.mode-road',
      'view.mode-terrain',
      'view.mode-decoration',
      'view.mode-annotation',
      'view.mode-measure',
      'view.mode-analysis',
      'view.camera-perspective',
      'view.camera-top',
      'view.camera-front',
      'view.camera-side',
      'view.render-shaded',
      'view.render-wireframe',
      'view.render-xray',
      'view.render-clay',
      'view.render-normals',
      'view.render-islands',
      'view.grid',
      'view.guides',
      'view.minimap',
      'view.workspace',
      'help.shortcuts',
      'help.readme',
      'help.about',
    ]);
  });
});

describe('快捷键键帽（只标注当前真实生效的组合）', () => {
  it('撤销/重做/复制/粘贴/删除带键帽（input.ts 既有快捷键表）', () => {
    expect(itemOf('edit', 'edit.undo').shortcut).toBe('Ctrl Z');
    expect(itemOf('edit', 'edit.redo').shortcut).toBe('Ctrl ⇧ Z');
    expect(itemOf('edit', 'edit.copy').shortcut).toBe('Ctrl C');
    expect(itemOf('edit', 'edit.paste').shortcut).toBe('Ctrl V');
    expect(itemOf('edit', 'edit.delete').shortcut).toBe('Delete');
  });

  it('纯三维模式带 Tab 键帽（T7.4，与 input.ts 路由同源）', () => {
    expect(itemOf('view', 'view.pure3d').shortcut).toBe('Tab');
  });
});

describe('「工具 → 测量」子菜单（T10.2：tool.measure 占位转正）', () => {
  it('父项 tool.measure 为子菜单（父项 id 不派发）；四子工具按 distance/height/area/angle 序', () => {
    const entries = menuOf('tool').items;
    const submenu = entries.find(
      (i): i is MenuSubmenuDef => 'submenu' in i && i.id === 'tool.measure',
    );
    if (!submenu) throw new Error('tool.measure 子菜单不存在');
    expect(submenu.label).toBe('测量');
    expect(submenu.enabled).toBe(true);
    const childIds = submenu.items
      .filter((i): i is MenuItemDef => !('separator' in i))
      .map((i) => i.id);
    expect(childIds).toEqual([
      'tool.measure-distance',
      'tool.measure-height',
      'tool.measure-area',
      'tool.measure-angle',
    ]);
    expect(itemOf('tool', 'tool.measure-distance').label).toBe('距离');
    expect(itemOf('tool', 'tool.measure-height').label).toBe('高度差');
    expect(itemOf('tool', 'tool.measure-area').label).toBe('面积');
    expect(itemOf('tool', 'tool.measure-angle').label).toBe('角度');
  });

  it('checked 随激活测量工具同源（activeToolId = measure.<kind>）', () => {
    const find = (s: MenuState, id: string) =>
      buildMenus(s)
        .flatMap((m) => m.items)
        .flatMap((i): (MenuItemDef | MenuSubmenuDef)[] =>
          'separator' in i
            ? []
            : 'submenu' in i
              ? [i, ...i.items.filter((c): c is MenuItemDef => !('separator' in c))]
              : [i],
        )
        .find((i): i is MenuItemDef => 'id' in i && !('submenu' in i) && i.id === id)!;
    const s = state({ activeToolId: 'measure.height' });
    expect(find(s, 'tool.measure-distance').checked).toBe(false);
    expect(find(s, 'tool.measure-height').checked).toBe(true);
    expect(find(s, 'tool.measure-area').checked).toBe(false);
    expect(find(s, 'tool.measure-angle').checked).toBe(false);
    // 非测量工具激活：四项全不勾
    const idle = buildMenus(state({ activeToolId: 'select' }));
    const measureItems = idle
      .flatMap((m) => m.items)
      .flatMap((i): (MenuItemDef | MenuSubmenuDef)[] =>
        'separator' in i
          ? []
          : 'submenu' in i
            ? [i, ...i.items.filter((c): c is MenuItemDef => !('separator' in c))]
            : [i],
      )
      .filter((i): i is MenuItemDef => 'id' in i && !('submenu' in i) && i.id.startsWith('tool.measure-'));
    expect(measureItems.every((i) => !i.checked)).toBe(true);
  });

  it('未就绪（ready=false）：父项与四子项均禁用', () => {
    const menus = buildMenus(state({ ready: false }));
    const toolMenu = menus.find((m) => m.id === 'tool')!;
    const submenu = toolMenu.items.find(
      (i): i is MenuSubmenuDef => 'submenu' in i && i.id === 'tool.measure',
    )!;
    expect(submenu.enabled).toBe(false);
    for (const child of submenu.items) {
      if ('separator' in child) continue;
      expect(child.enabled).toBe(false);
    }
  });
});

describe('帮助内容静态数据', () => {
  it('快捷键表覆盖撤销/重做/复制/粘贴/删除/聚焦/全景/工具键（来自 input.ts）', () => {
    const keys = SHORTCUT_HELP.map((e) => e.label);
    for (const label of ['撤销', '重做', '复制选中', '粘贴选中', '删除选中', '聚焦选中', '全景']) {
      expect(keys, `缺少 ${label}`).toContain(label);
    }
    expect(SHORTCUT_HELP.length).toBeGreaterThanOrEqual(10);
  });

  it('快捷键表含 Tab 纯三维模式行（T7.4，全局组）', () => {
    const row = SHORTCUT_HELP.find((e) => e.label === '纯三维模式 进入 / 退出');
    expect(row!.keys).toBe('Tab');
    expect(row!.group).toBe('全局');
  });

  it('关于信息含产品名 / 版本 / 技术栈', () => {
    expect(ABOUT_INFO.product).toBeTruthy();
    expect(ABOUT_INFO.version).toBeTruthy();
    expect(ABOUT_INFO.stack).toBeTruthy();
  });
});
