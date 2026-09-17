/**
 * tests/ui/menus/contextMenus.test.ts —— 四类右键菜单纯模型测试（T5.8，先测后码）。
 *
 * 覆盖需求第三十三章清单 + 任务书 T5.8 定义：
 * - 视口对象（pickObject 命中）：复制 / 粘贴（同位置偏移语义沿用）/ 删除(danger) /
 *   聚焦(F) / 隐藏 / 锁定 / 移动至图层 ▾（图层清单）/ 重命名（聚焦 Inspector 名称字段）
 * - 视口空白：创建对象 ▾（七形状新流程入口，T6.5 同垂直条/创建菜单）/ 视角 ▾ / 渲染模式 ▾ / 网格 /
 *   显示设置(disabled)；绘制中额外首项「取消绘制 (Esc)」
 * - Outliner 行：重命名 / 复制 / 删除(danger) / 隐藏 / 锁定 / 聚焦 / 移动至图层 ▾
 * - Content Browser 卡片：添加到场景（=点击放置）/ 复制(disabled) / 重命名(disabled) /
 *   删除(disabled) / 查看详情(disabled，P1)
 *
 * enabled 矩阵：门面未装配全禁用；复制/删除/聚焦 ← hasSelection；粘贴 ← hasClipboard；
 * 勾选位：视角/渲染模式单选组当前位 + 网格开关；子菜单 = 移动至图层（图层清单）/创建对象。
 * T8.6 观察项①裁决：纯组织组行（object.isGroup）右键菜单不出「隐藏/锁定」——组壳
 * visible/locked 不级联成员，两项属语义误导空转；批量隐藏走「选中组内对象」既有路径。
 * 纯数据模块：node 环境，零 React / 零 THREE。
 */
import { describe, expect, it } from 'vitest';
import { buildContextMenu, isContextMenuItem } from '../../../src/ui/menus/contextMenus';
import type { ContextMenuItemDef, ContextMenuState } from '../../../src/ui/menus/contextMenus';

/** 基准状态（各用例按需覆盖字段） */
const BASE: ContextMenuState = {
  ready: true,
  hasSelection: true,
  hasClipboard: false,
  drawing: false,
  cameraMode: 'perspective',
  renderMode: 'shaded',
  gridVisible: true,
  layers: [
    { id: 'layer_a', name: '建筑' },
    { id: 'layer_b', name: '道路' },
  ],
  object: { id: 'element_1', visible: true, locked: false, isGroup: false },
  // T8.5：选中集含组壳 →「解散组」启用；组目标 →「选中组内对象」可用
  selectionHasGroup: true,
  createEntries: [
    { shapeType: 'polygon', label: '多边形' },
    { shapeType: 'rectangle', label: '矩形' },
    { shapeType: 'circle', label: '圆形' },
    { shapeType: 'ellipse', label: '椭圆' },
    { shapeType: 'freehand', label: '自由形状' },
    { shapeType: 'line', label: '路径' },
    { shapeType: 'point', label: '点' },
  ],
};

/** 展平条目 id 清单（跳过分隔线） */
function ids(menu: ReturnType<typeof buildContextMenu>): string[] {
  return menu.entries.filter(isContextMenuItem).map((e) => e.id);
}

/** 条目 id → 定义映射（跳过分隔线） */
function itemMap(menu: ReturnType<typeof buildContextMenu>): Map<string, ContextMenuItemDef> {
  return new Map(menu.entries.filter(isContextMenuItem).map((e) => [e.id, e] as const));
}

/** 按 id 取子菜单定义（跳过分隔线——T8.4 渲染模式子菜单引入分组 separator） */
function childOf(menu: ReturnType<typeof buildContextMenu>, id: string): ContextMenuItemDef[] {
  return (itemMap(menu).get(id)?.children ?? []).filter(isContextMenuItem);
}

describe('视口对象菜单（pickObject 命中）', () => {
  it('清单与需求第三十三章一致（顺序稳定；T8.3 重命名后追加批量重命名；T8.5 分组段）', () => {
    const menu = buildContextMenu('viewport-object', BASE);
    expect(ids(menu)).toEqual([
      'edit.copy',
      'edit.paste',
      'edit.delete',
      'ctx.group',
      'ctx.ungroup',
      'ctx.focus',
      'ctx.drop-to-ground',
      'ctx.hide',
      'ctx.lock',
      'ctx.move-to-layer',
      'ctx.rename',
      'ctx.batch-rename',
    ]);
  });

  it('分组/解散组（T8.5）：分组 ← hasSelection、解散组 ← 选中含组壳；键帽 Ctrl G / Ctrl ⇧ G', () => {
    const menu = buildContextMenu('viewport-object', BASE);
    const byId = itemMap(menu);
    expect(byId.get('ctx.group')!.enabled).toBe(true);
    expect(byId.get('ctx.group')!.shortcut).toBe('Ctrl G');
    expect(byId.get('ctx.ungroup')!.enabled).toBe(true);
    expect(byId.get('ctx.ungroup')!.shortcut).toBe('Ctrl ⇧ G');

    const noGroup = buildContextMenu('viewport-object', { ...BASE, selectionHasGroup: false });
    expect(itemMap(noGroup).get('ctx.ungroup')!.enabled).toBe(false);
    const noSel = buildContextMenu('viewport-object', { ...BASE, hasSelection: false });
    expect(itemMap(noSel).get('ctx.group')!.enabled).toBe(false);
    expect(itemMap(noSel).get('ctx.ungroup')!.enabled).toBe(false);
  });

  it('批量重命名（T8.3）：有选中启用、无选中禁用', () => {
    const menu = buildContextMenu('viewport-object', BASE);
    expect(itemMap(menu).get('ctx.batch-rename')!.enabled).toBe(true);
    const off = buildContextMenu('viewport-object', { ...BASE, hasSelection: false });
    expect(itemMap(off).get('ctx.batch-rename')!.enabled).toBe(false);
  });

  it('删除为 danger；聚焦标注 F 键帽；贴地标注 End 键帽（T8.1）；重命名/隐藏/锁定启用', () => {
    const menu = buildContextMenu('viewport-object', BASE);
    const byId = itemMap(menu);
    expect(byId.get('edit.delete')!.danger).toBe(true);
    expect(byId.get('ctx.focus')!.shortcut).toBe('F');
    expect(byId.get('ctx.drop-to-ground')!.shortcut).toBe('End');
    expect(byId.get('ctx.rename')!.enabled).toBe(true);
    expect(byId.get('ctx.hide')!.enabled).toBe(true);
    expect(byId.get('ctx.lock')!.enabled).toBe(true);
  });

  it('移动至图层：子菜单 = 图层清单（arg=图层 id）', () => {
    const menu = buildContextMenu('viewport-object', BASE);
    const children = childOf(menu, 'ctx.move-to-layer');
    expect(children.map((c) => c.label)).toEqual(['建筑', '道路']);
    expect(children[0]?.arg).toBe('layer_a');
    expect(children.every((c) => c.enabled)).toBe(true);
  });

  it('enabled 矩阵：无选中 → 复制/删除/聚焦/隐藏/锁定禁用；无剪贴板 → 粘贴禁用', () => {
    const menu = buildContextMenu('viewport-object', { ...BASE, hasSelection: false });
    const byId = itemMap(menu);
    expect(byId.get('edit.copy')!.enabled).toBe(false);
    expect(byId.get('edit.delete')!.enabled).toBe(false);
    expect(byId.get('ctx.focus')!.enabled).toBe(false);
    expect(byId.get('ctx.hide')!.enabled).toBe(false);
    expect(byId.get('ctx.lock')!.enabled).toBe(false);
    expect(byId.get('edit.paste')!.enabled).toBe(false);
    // 有剪贴板 → 粘贴启用
    const pastable = buildContextMenu('viewport-object', { ...BASE, hasClipboard: true });
    expect(itemMap(pastable).get('edit.paste')!.enabled).toBe(true);
  });

  it('隐藏/锁定文案随对象状态切换（显示/解锁反向）', () => {
    const hidden = buildContextMenu('viewport-object', {
      ...BASE,
      object: { id: 'element_1', visible: false, locked: true },
    });
    const byId = itemMap(hidden);
    expect(byId.get('ctx.hide')!.label).toBe('显示');
    expect(byId.get('ctx.lock')!.label).toBe('解锁');
  });

  it('门面未装配（ready=false）→ 全部动作项禁用', () => {
    const menu = buildContextMenu('viewport-object', { ...BASE, ready: false });
    const actionable = menu.entries.filter(isContextMenuItem);
    expect(actionable.every((e) => e.enabled === false)).toBe(true);
  });
});

describe('视口空白菜单', () => {
  it('清单一致：创建对象 ▾ / 视角 ▾ / 渲染模式 ▾ / 网格 / 显示设置(disabled)', () => {
    const menu = buildContextMenu('viewport-blank', BASE);
    expect(ids(menu)).toEqual([
      'ctx.create',
      'ctx.view',
      'ctx.render-mode',
      'view.grid',
      'ctx.display-settings',
    ]);
    const byId = itemMap(menu);
    expect(byId.get('ctx.display-settings')!.enabled).toBe(false); // P1 占位
    expect(byId.get('view.grid')!.checked).toBe(true);
  });

  it('创建对象子菜单 = 七形状新流程入口（arg=shapeType，与垂直条/创建菜单同源）', () => {
    const menu = buildContextMenu('viewport-blank', BASE);
    const children = childOf(menu, 'ctx.create');
    expect(children.map((c) => c.label)).toEqual(['多边形', '矩形', '圆形', '椭圆', '自由形状', '路径', '点']);
    expect(children[0]?.arg).toBe('polygon');
    expect(children[6]?.arg).toBe('point');
  });

  it('视角子菜单：四机位单选组（view.camera-* checked 当前位）', () => {
    const menu = buildContextMenu('viewport-blank', { ...BASE, cameraMode: 'top' });
    const children = childOf(menu, 'ctx.view');
    const checkedIds = children.filter((c) => c.checked).map((c) => c.id);
    expect(checkedIds).toEqual(['view.camera-top']);
    expect(children.map((c) => c.id)).toEqual([
      'view.camera-perspective',
      'view.camera-top',
      'view.camera-front',
      'view.camera-side',
    ]);
  });

  it('渲染模式子菜单：常规/诊断两组单选组（view.render-*，与 HUD Shaded ▼ 同源通道）', () => {
    const menu = buildContextMenu('viewport-blank', { ...BASE, renderMode: 'xray' });
    const children = childOf(menu, 'ctx.render-mode');
    expect(children.map((c) => c.id)).toEqual([
      'view.render-shaded',
      'view.render-wireframe',
      'view.render-xray',
      'view.render-clay',
      'view.render-normals',
      'view.render-islands',
    ]);
    expect(children.filter((c) => c.checked).map((c) => c.id)).toEqual(['view.render-xray']);
    // 常规/诊断两组以 separator 分隔（T8.4 分组呈现）
    const entries = itemMap(menu).get('ctx.render-mode')?.children ?? [];
    expect(entries.some((e) => 'separator' in e)).toBe(true);
    // 诊断档 checked 同源
    const islands = buildContextMenu('viewport-blank', { ...BASE, renderMode: 'islands' });
    expect(childOf(islands, 'ctx.render-mode').filter((c) => c.checked).map((c) => c.id)).toEqual([
      'view.render-islands',
    ]);
  });

  it('绘制中：首项为「取消绘制 (Esc)」+ 分隔线，其后为常规空白菜单', () => {
    const menu = buildContextMenu('viewport-blank', { ...BASE, drawing: true });
    expect(ids(menu)).toEqual([
      'ctx.cancel-draw',
      'ctx.create',
      'ctx.view',
      'ctx.render-mode',
      'view.grid',
      'ctx.display-settings',
    ]);
    const cancel = menu.entries[0] as { id: string; label: string; shortcut?: string; enabled: boolean };
    expect(cancel.label).toBe('取消绘制');
    expect(cancel.shortcut).toBe('Esc');
    expect(cancel.enabled).toBe(true);
    // 首项后是分隔线
    expect('separator' in menu.entries[1]!).toBe(true);
  });

  it('非绘制中不含取消绘制项', () => {
    const menu = buildContextMenu('viewport-blank', BASE);
    expect(ids(menu)).not.toContain('ctx.cancel-draw');
  });

  it('网格 checked 随 gridVisible；ready=false 时动作项禁用', () => {
    const off = buildContextMenu('viewport-blank', { ...BASE, gridVisible: false });
    expect(itemMap(off).get('view.grid')!.checked).toBe(false);

    const notReady = buildContextMenu('viewport-blank', { ...BASE, ready: false });
    const actionable = notReady.entries.filter(isContextMenuItem);
    expect(actionable.every((e) => e.enabled === false)).toBe(true);
  });
});

describe('Outliner 行菜单', () => {
  it('清单一致（重命名在前，删除 danger；T8.3 批量重命名；T8.5 分组段 + 组目标「选中组内对象」）', () => {
    const menu = buildContextMenu('outliner-row', { ...BASE, object: { ...BASE.object!, isGroup: true } });
    expect(ids(menu)).toEqual([
      'ctx.rename',
      'ctx.batch-rename',
      'ctx.group',
      'ctx.ungroup',
      'ctx.select-group-members',
      'edit.copy',
      'edit.delete',
      'ctx.focus',
      'ctx.drop-to-ground',
      'ctx.move-to-layer',
    ]);
    expect(itemMap(menu).get('edit.delete')!.danger).toBe(true);
  });

  it('组行（isGroup）不出「隐藏/锁定」（T8.6 观察项①：组壳纯组织节点，该两项不级联成员属空转）', () => {
    const menu = buildContextMenu('outliner-row', { ...BASE, object: { ...BASE.object!, isGroup: true } });
    expect(ids(menu)).not.toContain('ctx.hide');
    expect(ids(menu)).not.toContain('ctx.lock');
  });

  it('视口对象菜单组壳目标同样过滤「隐藏/锁定」（objectEntries 两处共用，T8.6）', () => {
    const menu = buildContextMenu('viewport-object', { ...BASE, object: { ...BASE.object!, isGroup: true } });
    expect(ids(menu)).not.toContain('ctx.hide');
    expect(ids(menu)).not.toContain('ctx.lock');
  });

  it('非组目标行不出「选中组内对象」（组行专属动作，T8.5）；普通对象行仍含隐藏/锁定', () => {
    const menu = buildContextMenu('outliner-row', BASE); // object.isGroup = false
    expect(ids(menu)).not.toContain('ctx.select-group-members');
    expect(ids(menu)).toContain('ctx.hide');
    expect(ids(menu)).toContain('ctx.lock');
  });

  it('普通对象行隐藏/锁定文案随状态切换（显示/解锁反向，T8.6 回归守护）', () => {
    const menu = buildContextMenu('outliner-row', {
      ...BASE,
      object: { id: 'element_1', visible: false, locked: true, isGroup: false },
    });
    const byId = itemMap(menu);
    expect(byId.get('ctx.hide')!.label).toBe('显示');
    expect(byId.get('ctx.lock')!.label).toBe('解锁');
  });

  it('移动至图层子菜单同视口对象菜单（图层清单）', () => {
    const menu = buildContextMenu('outliner-row', BASE);
    expect(childOf(menu, 'ctx.move-to-layer').map((c) => c.arg)).toEqual(['layer_a', 'layer_b']);
  });

  it('无选中（openContextMenu 前未选中目标）→ 选择类动作禁用', () => {
    const menu = buildContextMenu('outliner-row', { ...BASE, hasSelection: false });
    const byId = itemMap(menu);
    expect(byId.get('edit.copy')!.enabled).toBe(false);
    expect(byId.get('ctx.hide')!.enabled).toBe(false);
  });
});

describe('Content Browser 卡片菜单', () => {
  it('清单一致：添加到场景启用，其余四项 P1 占位禁用', () => {
    const menu = buildContextMenu('asset-card', BASE);
    const byId = itemMap(menu);
    expect(ids(menu)).toEqual([
      'ctx.add-to-scene',
      'ctx.asset-copy',
      'ctx.asset-rename',
      'ctx.asset-delete',
      'ctx.asset-details',
    ]);
    expect(byId.get('ctx.add-to-scene')!.enabled).toBe(true);
    expect(byId.get('ctx.asset-copy')!.enabled).toBe(false);
    expect(byId.get('ctx.asset-rename')!.enabled).toBe(false);
    expect(byId.get('ctx.asset-delete')!.enabled).toBe(false);
    expect(byId.get('ctx.asset-details')!.enabled).toBe(false);
  });

  it('ready=false → 添加到场景也禁用', () => {
    const menu = buildContextMenu('asset-card', { ...BASE, ready: false });
    expect(itemMap(menu).get('ctx.add-to-scene')!.enabled).toBe(false);
  });
});

describe('actionId 契约快照（稳定点分 id，一经定义不得改名）', () => {
  it('全部条目（含子菜单）id 全清单', () => {
    const all = new Set<string>();
    // T8.6：组目标（isGroup）过滤 ctx.hide/ctx.lock → 非组与组目标两轮取并集，
    // 使 ctx.hide/ctx.lock（非组）与 ctx.select-group-members（组，T8.5）均入契约全集
    const objectVariants = [{ ...BASE.object!, isGroup: false }, { ...BASE.object!, isGroup: true }];
    for (const source of ['viewport-object', 'viewport-blank', 'outliner-row', 'asset-card'] as const) {
      for (const object of objectVariants) {
        const menu = buildContextMenu(source, {
          ...BASE,
          drawing: source === 'viewport-blank',
          object,
        });
        for (const entry of menu.entries) {
          if ('separator' in entry) continue;
          all.add(entry.id);
          for (const child of entry.children ?? []) {
            if ('separator' in child) continue; // T8.4 渲染模式子菜单分组 separator 不占 id
            all.add(child.id);
          }
        }
      }
    }
    expect([...all].sort()).toEqual(
      [
        'ctx.add-to-scene',
        'ctx.asset-copy',
        'ctx.asset-delete',
        'ctx.asset-details',
        'ctx.asset-rename',
        'ctx.batch-rename',
        'ctx.cancel-draw',
        'ctx.create',
        'ctx.display-settings',
        'ctx.drop-to-ground',
        'ctx.focus',
        'ctx.group',
        'ctx.hide',
        'ctx.lock',
        'ctx.move-to-layer',
        'ctx.rename',
        'ctx.select-group-members',
        'ctx.ungroup',
        'ctx.view',
        'ctx.render-mode',
        'edit.copy',
        'edit.paste',
        'edit.delete',
        'view.camera-front',
        'view.camera-perspective',
        'view.camera-side',
        'view.camera-top',
        'view.grid',
        'view.render-shaded',
        'view.render-wireframe',
        'view.render-xray',
        'view.render-clay',
        'view.render-normals',
        'view.render-islands',
      ].sort(),
    );
  });
});
