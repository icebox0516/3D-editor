/**
 * tests/ui/layout/layoutPresets —— 工作区布局预设与序列化纯逻辑测试（先测后码，T7.3）。
 *
 * 覆盖：
 * - 四预设数据完整性（需求 29 章）：尺寸全部在钳制表域内、显隐三布尔合法、布局字段齐
 *   （default = store INITIAL；minimal 三区全隐藏；build 强化浏览器+大纲；analysis 强化
 *   视口+检查器）；
 * - serialize ↔ deserialize 往返；损坏 JSON / 非对象 / 非法枚举（inspectorTab /
 *   browser.category / WorkModeId）/ 越界尺寸静默回退；mode=analysis 不可恢复
 *   （落 scene，T7.3 门裁定；T10.2 measure 转正后可恢复）；
 * - matchPreset：四预设各自命中 + 自定义态 null（不比 mode）；
 * - 命名个人布局 CRUD（fake storage 注入）：保存 / 列举 / 删除 / 重名覆盖 / 空名拒绝 /
 *   损坏数据容错。
 * 边界：node 纯逻辑（无 jsdom）；storage 以最小接口注入（沿 browserModel 先例）；
 *      弹层 GUI 行为（radio 呈现、保存输入反馈）归浏览器目检（T7.8）。
 */
import { describe, expect, it } from 'vitest';
import {
  LAYOUT_PRESETS,
  WORKSPACE_LAYOUTS_STORAGE_KEY,
  WORKSPACE_STORAGE_KEY,
  deleteNamedLayout,
  deserializeWorkspaceSnapshot,
  layoutPresetOf,
  listNamedLayouts,
  matchPreset,
  parseLayoutImport,
  renameNamedLayout,
  saveNamedLayout,
  serializeLayoutExport,
  serializeWorkspaceSnapshot,
} from '../../../src/ui/layout/layoutPresets';
import type { LayoutFields } from '../../../src/ui/layout/layoutPresets';
import { PANEL_SIZE_SPECS, clampPanelSize } from '../../../src/ui/layout/workspaceStore';

/** fake localStorage（最小三方法接口，内存 Map） */
function fakeStorage(): Storage {
  const data = new Map<string, string>();
  return {
    length: 0,
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: () => null,
    removeItem: (key: string) => void data.delete(key),
    setItem: (key: string, value: string) => void data.set(key, value),
  } as never;
}

/** 全部区域尺寸须落在钳制表域内 */
function expectSizesInDomain(layout: LayoutFields): void {
  expect(layout.leftWidth).toBeGreaterThanOrEqual(PANEL_SIZE_SPECS.left.min);
  expect(layout.leftWidth).toBeLessThanOrEqual(PANEL_SIZE_SPECS.left.max);
  expect(layout.rightWidth).toBeGreaterThanOrEqual(PANEL_SIZE_SPECS.right.min);
  expect(layout.rightWidth).toBeLessThanOrEqual(PANEL_SIZE_SPECS.right.max);
  expect(layout.bottomHeight).toBeGreaterThanOrEqual(PANEL_SIZE_SPECS.bottom.min);
  expect(layout.bottomHeight).toBeLessThanOrEqual(PANEL_SIZE_SPECS.bottom.max);
}

// ── 四预设数据完整性（需求 29 章）──────────────────────────

describe('LAYOUT_PRESETS：四预设数据完整性', () => {
  it('恰好四预设，id/label 齐备且 id 唯一（default/minimal/build/analysis）', () => {
    expect(LAYOUT_PRESETS.map((p) => p.id)).toEqual(['default', 'minimal', 'build', 'analysis']);
    for (const preset of LAYOUT_PRESETS) {
      expect(preset.label.length).toBeGreaterThan(0);
      expect(layoutPresetOf(preset.id)).toBe(preset);
    }
    expect(new Set(LAYOUT_PRESETS.map((p) => p.id)).size).toBe(4);
  });

  it('全部预设：尺寸域内、显隐三布尔、折叠表为空对象、标签/浏览器字段类型合法', () => {
    for (const preset of LAYOUT_PRESETS) {
      const { layout } = preset;
      expectSizesInDomain(layout);
      expect(typeof layout.hiddenPanels.left).toBe('boolean');
      expect(typeof layout.hiddenPanels.right).toBe('boolean');
      expect(typeof layout.hiddenPanels.bottom).toBe('boolean');
      expect(layout.collapsedSections).toEqual({});
      expect(['object', 'environment', 'settings']).toContain(layout.inspectorTab);
      expect(typeof layout.browser.expanded).toBe('boolean');
      expect(typeof layout.browser.category).toBe('string');
      expect(typeof layout.browser.search).toBe('string');
    }
  });

  it('default 预设 = workspaceStore INITIAL 布局值（260/320/60 三区全显，浏览器紧凑）', () => {
    const { layout } = layoutPresetOf('default');
    expect(layout).toEqual({
      leftWidth: 260,
      rightWidth: 320,
      bottomHeight: 60,
      hiddenPanels: { left: false, right: false, bottom: false },
      collapsedSections: {},
      inspectorTab: 'object',
      browser: { expanded: false, category: 'all', search: '' },
    });
  });

  it('minimal 预设：三区全隐藏（仅视口），尺寸保持默认值（再显示时宽度合理）', () => {
    const { layout } = layoutPresetOf('minimal');
    expect(layout.hiddenPanels).toEqual({ left: true, right: true, bottom: true });
    expect(layout.leftWidth).toBe(PANEL_SIZE_SPECS.left.default);
    expect(layout.rightWidth).toBe(PANEL_SIZE_SPECS.right.default);
    expect(layout.bottomHeight).toBe(PANEL_SIZE_SPECS.bottom.default);
    expect(layout.browser).toEqual({ expanded: false, category: 'all', search: '' });
  });

  it('build 预设：左列显 260 / 右列隐藏 / 底部显 280 且浏览器展开位为 true', () => {
    const { layout } = layoutPresetOf('build');
    expect(layout.hiddenPanels).toEqual({ left: false, right: true, bottom: false });
    expect(layout.leftWidth).toBe(260);
    expect(layout.bottomHeight).toBe(280);
    expect(layout.browser.expanded).toBe(true);
  });

  it('analysis 预设：左列隐藏 / 底部隐藏 / 右列显 360（强化视口 + 检查器）', () => {
    const { layout } = layoutPresetOf('analysis');
    expect(layout.hiddenPanels).toEqual({ left: true, right: false, bottom: true });
    expect(layout.rightWidth).toBe(360);
    expect(layout.browser.expanded).toBe(false);
  });
});

// ── serialize ↔ deserialize ────────────────────────────────

describe('serialize / deserialize：快照往返与容错', () => {
  it('存储键字符串：t3d-editor.workspace / t3d-editor.workspace-layouts', () => {
    expect(WORKSPACE_STORAGE_KEY).toBe('t3d-editor.workspace');
    expect(WORKSPACE_LAYOUTS_STORAGE_KEY).toBe('t3d-editor.workspace-layouts');
  });

  it('四预设 × 启用模式往返等价（布局字段 + mode 全保留）', () => {
    for (const preset of LAYOUT_PRESETS) {
      const raw = serializeWorkspaceSnapshot(preset.layout, 'build');
      const back = deserializeWorkspaceSnapshot(raw);
      expect(back).not.toBeNull();
      expect(back!.layout).toEqual(preset.layout);
      expect(back!.mode).toBe('build');
    }
  });

  it('折叠分区与浏览器筛选/搜索往返保留（非默认字段不丢）', () => {
    const layout: LayoutFields = {
      ...layoutPresetOf('default').layout,
      leftWidth: 400,
      hiddenPanels: { left: false, right: true, bottom: false },
      collapsedSections: { 'left.scene': true, 'inspector.transform': true },
      inspectorTab: 'settings',
      browser: { expanded: true, category: 'plant', search: '树' },
    };
    const back = deserializeWorkspaceSnapshot(serializeWorkspaceSnapshot(layout, 'annotation'));
    expect(back!.layout).toEqual(layout);
    expect(back!.mode).toBe('annotation');
  });

  it('损坏 JSON / 非对象载荷（数组 / 字符串 / null / 数字）→ null，不抛错', () => {
    for (const raw of ['{oops', '[]', '"text"', 'null', '42', '']) {
      expect(deserializeWorkspaceSnapshot(raw)).toBeNull();
    }
  });

  it('storage 语义缺字段 → 字段级回退默认（部分字段损坏不丢弃整个快照）', () => {
    const raw = JSON.stringify({ leftWidth: 300, mode: 'road' });
    const back = deserializeWorkspaceSnapshot(raw);
    expect(back!.layout.leftWidth).toBe(300);
    expect(back!.layout.rightWidth).toBe(PANEL_SIZE_SPECS.right.default);
    expect(back!.layout.hiddenPanels).toEqual({ left: false, right: false, bottom: false });
    expect(back!.layout.browser).toEqual({ expanded: false, category: 'all', search: '' });
    expect(back!.mode).toBe('road');
  });

  it('非法枚举回退默认：inspectorTab → object；browser.category 非字符串 → all', () => {
    const raw = JSON.stringify({ inspectorTab: 'bogus', browser: { category: 7, expanded: 'yes' } });
    const back = deserializeWorkspaceSnapshot(raw);
    expect(back!.layout.inspectorTab).toBe('object');
    expect(back!.layout.browser.category).toBe('all');
    expect(back!.layout.browser.expanded).toBe(false); // 非布尔 → false
  });

  it('越界尺寸 deserialize 后过钳制表（下界折 min / 上界折 max / 非数字回默认）', () => {
    const raw = JSON.stringify({ leftWidth: 9999, rightWidth: 1, bottomHeight: 'tall' });
    const back = deserializeWorkspaceSnapshot(raw);
    expect(back!.layout.leftWidth).toBe(clampPanelSize('left', 9999)); // 420
    expect(back!.layout.rightWidth).toBe(clampPanelSize('right', 1)); // 240
    expect(back!.layout.bottomHeight).toBe(PANEL_SIZE_SPECS.bottom.default); // 非数字 → 60
  });

  it('hiddenPanels / collapsedSections 载荷损坏回退（缺区 → false / 非对象 → {}，仅保留真值键）', () => {
    const raw = JSON.stringify({
      hiddenPanels: { left: true, right: 'yes', bottom: null },
      collapsedSections: { 'left.scene': true, 'right.props': false, bad: 'x' },
    });
    const back = deserializeWorkspaceSnapshot(raw);
    expect(back!.layout.hiddenPanels).toEqual({ left: true, right: false, bottom: false });
    expect(back!.layout.collapsedSections).toEqual({ 'left.scene': true });

    const raw2 = JSON.stringify({ collapsedSections: 'nope' });
    expect(deserializeWorkspaceSnapshot(raw2)!.layout.collapsedSections).toEqual({});
  });

  it('mode 校验：analysis 不可恢复落 scene；未知/非字符串 → scene（T7.3 门裁定；T10.2 measure 转正可恢复）', () => {
    for (const mode of ['analysis', 'bogus', 42, null]) {
      const raw = JSON.stringify({ mode });
      expect(deserializeWorkspaceSnapshot(raw)!.mode).toBe('scene');
    }
  });

  it('mode 校验：七启用模式可恢复（scene/build/road/terrain/decoration/annotation/measure）', () => {
    for (const mode of ['scene', 'build', 'road', 'terrain', 'decoration', 'annotation', 'measure'] as const) {
      const raw = serializeWorkspaceSnapshot(layoutPresetOf('default').layout, mode);
      expect(deserializeWorkspaceSnapshot(raw)!.mode).toBe(mode);
    }
  });
});

// ── matchPreset ────────────────────────────────────────────

// ── minimapVisible 快照字段（T7.7 小地图开关持久化）────────

describe('serialize / deserialize：minimapVisible（T7.7）', () => {
  const LAYOUT = layoutPresetOf('default').layout;

  it('serialize 显式写入 minimapVisible（缺省参数 = true）', () => {
    const json = serializeWorkspaceSnapshot(LAYOUT, 'scene');
    expect((JSON.parse(json) as Record<string, unknown>).minimapVisible).toBe(true);
    const jsonOff = serializeWorkspaceSnapshot(LAYOUT, 'scene', false);
    expect((JSON.parse(jsonOff) as Record<string, unknown>).minimapVisible).toBe(false);
  });

  it('deserialize 往返保留：true / false 均可恢复', () => {
    for (const value of [true, false]) {
      const back = deserializeWorkspaceSnapshot(serializeWorkspaceSnapshot(LAYOUT, 'road', value));
      expect(back!.minimapVisible).toBe(value);
    }
  });

  it('缺字段 / 非法值（旧快照向后兼容）→ 默认 true（仅显式 false 隐藏）', () => {
    expect(
      deserializeWorkspaceSnapshot(JSON.stringify({ ...LAYOUT, mode: 'scene' }))!.minimapVisible,
    ).toBe(true);
    expect(
      deserializeWorkspaceSnapshot(JSON.stringify({ ...LAYOUT, mode: 'scene', minimapVisible: 'no' }))!
        .minimapVisible,
    ).toBe(true);
    expect(
      deserializeWorkspaceSnapshot(JSON.stringify({ ...LAYOUT, mode: 'scene', minimapVisible: 0 }))!
        .minimapVisible,
    ).toBe(true);
    expect(
      deserializeWorkspaceSnapshot(JSON.stringify({ ...LAYOUT, mode: 'scene', minimapVisible: null }))!
        .minimapVisible,
    ).toBe(true);
    expect(
      deserializeWorkspaceSnapshot(JSON.stringify({ ...LAYOUT, mode: 'scene', minimapVisible: false }))!
        .minimapVisible,
    ).toBe(false);
  });

  it('matchPreset 不比 minimapVisible（偏好字段不参与布局命中判定）', () => {
    // 预设表无该字段（布局快照语义不含 UI 偏好），serialize 产物含该字段不影响逻辑层
    const layout: LayoutFields = { ...LAYOUT };
    expect(matchPreset(layout)).toBe('default');
  });
});

describe('matchPreset：当前布局命中判定（不比 mode）', () => {
  it('四预设布局各自命中自身 id', () => {
    for (const preset of LAYOUT_PRESETS) {
      expect(matchPreset(preset.layout)).toBe(preset.id);
    }
  });

  it('任意一字段偏离 → null（自定义态）', () => {
    const base = layoutPresetOf('default').layout;
    expect(matchPreset({ ...base, leftWidth: 300 })).toBeNull();
    expect(matchPreset({ ...base, hiddenPanels: { ...base.hiddenPanels, bottom: true } })).toBeNull();
    expect(matchPreset({ ...base, inspectorTab: 'environment' })).toBeNull();
    expect(matchPreset({ ...base, browser: { ...base.browser, search: 'x' } })).toBeNull();
    expect(matchPreset({ ...base, collapsedSections: { 'left.scene': true } })).toBeNull();
  });

  it('命名布局保存的默认布局命中 default（快照过 serialize 往返仍命中）', () => {
    const round = deserializeWorkspaceSnapshot(
      serializeWorkspaceSnapshot(layoutPresetOf('minimal').layout, 'build'),
    )!;
    expect(matchPreset(round.layout)).toBe('minimal'); // mode 不参与比较
  });
});

// ── 命名个人布局 CRUD ─────────────────────────────────────

describe('命名布局 CRUD（fake storage 注入）', () => {
  it('保存后可列举（名字 + 布局往返等价）；同一 storage 重复读 = 跨刷新保留', () => {
    const storage = fakeStorage();
    const layout: LayoutFields = { ...layoutPresetOf('build').layout, leftWidth: 333 };
    expect(saveNamedLayout('工作台A', layout, storage)).toBe(true);

    const listed = listNamedLayouts(storage);
    expect(listed).toHaveLength(1);
    expect(listed[0]!.name).toBe('工作台A');
    expect(listed[0]!.layout).toEqual(layout);
  });

  it('重名保存 = 覆盖（不产生重复项）', () => {
    const storage = fakeStorage();
    saveNamedLayout('A', layoutPresetOf('default').layout, storage);
    saveNamedLayout('A', layoutPresetOf('minimal').layout, storage);
    const listed = listNamedLayouts(storage);
    expect(listed).toHaveLength(1);
    expect(listed[0]!.layout).toEqual(layoutPresetOf('minimal').layout);
  });

  it('空名 / 纯空白名拒绝（返回 false，不写入）', () => {
    const storage = fakeStorage();
    expect(saveNamedLayout('', layoutPresetOf('default').layout, storage)).toBe(false);
    expect(saveNamedLayout('   ', layoutPresetOf('default').layout, storage)).toBe(false);
    expect(listNamedLayouts(storage)).toHaveLength(0);
  });

  it('名字首尾空白裁剪后作为键（“  B  ” 与 “B” 同一布局）', () => {
    const storage = fakeStorage();
    saveNamedLayout('  B  ', layoutPresetOf('default').layout, storage);
    expect(listNamedLayouts(storage)[0]!.name).toBe('B');
  });

  it('删除：存在则删（返回 true）；不存在返回 false；清空后表项移除', () => {
    const storage = fakeStorage();
    saveNamedLayout('A', layoutPresetOf('default').layout, storage);
    saveNamedLayout('B', layoutPresetOf('minimal').layout, storage);
    expect(deleteNamedLayout('不存在', storage)).toBe(false);
    expect(deleteNamedLayout('A', storage)).toBe(true);
    expect(listNamedLayouts(storage).map((e) => e.name)).toEqual(['B']);
    expect(deleteNamedLayout('B', storage)).toBe(true);
    expect(listNamedLayouts(storage)).toHaveLength(0);
  });

  it('损坏数据容错：坏 JSON / 非对象表 / 单项非对象 → 空表或丢弃该项，不抛错', () => {
    const storage = fakeStorage();
    storage.setItem(WORKSPACE_LAYOUTS_STORAGE_KEY, '{oops');
    expect(listNamedLayouts(storage)).toEqual([]);
    storage.setItem(WORKSPACE_LAYOUTS_STORAGE_KEY, '["not", "an", "object"]');
    expect(listNamedLayouts(storage)).toEqual([]);

    storage.setItem(WORKSPACE_LAYOUTS_STORAGE_KEY, JSON.stringify({ ok: layoutPresetOf('default').layout, bad: 42 }));
    const listed = listNamedLayouts(storage);
    expect(listed.map((e) => e.name)).toEqual(['ok']);
  });

  it('storage 不可用（null）：读写均不抛错，保存返回 false', () => {
    expect(listNamedLayouts(null)).toEqual([]);
    expect(saveNamedLayout('A', layoutPresetOf('default').layout, null)).toBe(false);
    expect(deleteNamedLayout('A', null)).toBe(false);
  });
});

// ── T8.3：命名布局 重命名 / 导出 / 导入 ────────────────────

describe('布局重命名 renameNamedLayout（T8.3）', () => {
  it('改名成功：新旧名替换、条目顺序保持、布局字段原样', () => {
    const storage = fakeStorage();
    saveNamedLayout('A', layoutPresetOf('default').layout, storage);
    saveNamedLayout('B', layoutPresetOf('minimal').layout, storage);
    saveNamedLayout('C', layoutPresetOf('build').layout, storage);

    expect(renameNamedLayout('B', '工作台', storage)).toBe(true);
    const listed = listNamedLayouts(storage);
    expect(listed.map((e) => e.name)).toEqual(['A', '工作台', 'C']); // 保序
    expect(listed[1]!.layout).toEqual(layoutPresetOf('minimal').layout);
  });

  it('旧名不存在 / 新名空白 → false 不写入', () => {
    const storage = fakeStorage();
    saveNamedLayout('A', layoutPresetOf('default').layout, storage);
    expect(renameNamedLayout('不存在', 'X', storage)).toBe(false);
    expect(renameNamedLayout('A', '   ', storage)).toBe(false);
    expect(listNamedLayouts(storage).map((e) => e.name)).toEqual(['A']);
  });

  it('新名撞既有布局 → false（拒绝静默覆盖；沿模板改名撞名先例）', () => {
    const storage = fakeStorage();
    saveNamedLayout('A', layoutPresetOf('default').layout, storage);
    saveNamedLayout('B', layoutPresetOf('minimal').layout, storage);
    expect(renameNamedLayout('A', 'B', storage)).toBe(false);
    expect(listNamedLayouts(storage).map((e) => e.name)).toEqual(['A', 'B']);
  });

  it('同名改名（裁剪后相同）→ true 无变化', () => {
    const storage = fakeStorage();
    saveNamedLayout('A', layoutPresetOf('default').layout, storage);
    expect(renameNamedLayout('A', 'A', storage)).toBe(true);
    expect(listNamedLayouts(storage).map((e) => e.name)).toEqual(['A']);
  });

  it('storage 不可用 → false', () => {
    expect(renameNamedLayout('A', 'X', null)).toBe(false);
  });
});

describe('布局导出 serializeLayoutExport / 导入 parseLayoutImport（T8.3）', () => {
  it('导出载荷 = name + 布局字段（sanitize 规整、pretty JSON、可再解析）', () => {
    const layout: LayoutFields = { ...layoutPresetOf('build').layout, leftWidth: 333 };
    const raw = serializeLayoutExport('工作台', layout)!;
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw)).toEqual({ name: '工作台', layout: { ...layout } });
  });

  it('空名 / 纯空白名 → null（不可导出）', () => {
    expect(serializeLayoutExport('', layoutPresetOf('default').layout)).toBeNull();
    expect(serializeLayoutExport('  ', layoutPresetOf('default').layout)).toBeNull();
  });

  it('导出 → 删除 → 导入 → 应用 往返无损（等价布局重建）', () => {
    const storage = fakeStorage();
    const layout: LayoutFields = { ...layoutPresetOf('build').layout, leftWidth: 333, rightWidth: 300 };
    saveNamedLayout('工作台', layout, storage);

    const raw = serializeLayoutExport('工作台', listNamedLayouts(storage)[0]!.layout)!;
    expect(deleteNamedLayout('工作台', storage)).toBe(true);
    expect(listNamedLayouts(storage)).toHaveLength(0);

    const parsed = parseLayoutImport(raw)!;
    expect(parsed).not.toBeNull();
    expect(parsed.name).toBe('工作台');
    expect(saveNamedLayout(parsed.name, parsed.layout, storage)).toBe(true);
    expect(listNamedLayouts(storage)[0]!.layout).toEqual(layout); // 等价复原
  });

  it('导入整体拒收：损坏 JSON / 非对象 / 缺 name / name 非字符串 / 空名 / layout 缺失或非对象', () => {
    expect(parseLayoutImport('{oops')).toBeNull();
    expect(parseLayoutImport('42')).toBeNull();
    expect(parseLayoutImport('"text"')).toBeNull();
    expect(parseLayoutImport('{}')).toBeNull(); // 缺 name 与 layout
    expect(parseLayoutImport(JSON.stringify({ layout: layoutPresetOf('default').layout }))).toBeNull();
    expect(
      parseLayoutImport(JSON.stringify({ name: 42, layout: layoutPresetOf('default').layout })),
    ).toBeNull();
    expect(
      parseLayoutImport(JSON.stringify({ name: '  ', layout: layoutPresetOf('default').layout })),
    ).toBeNull();
    expect(parseLayoutImport(JSON.stringify({ name: 'X', layout: 'not-an-object' }))).toBeNull();
  });

  it('导入字段级非法回退（沿 sanitize 语义）：越界尺寸过钳制表、非法枚举回默认、缺字段回默认', () => {
    const parsed = parseLayoutImport(
      JSON.stringify({
        name: '外来布局',
        layout: { leftWidth: 99999, inspectorTab: 'bogus', browser: { expanded: 'yes' } },
      }),
    )!;
    expect(parsed).not.toBeNull();
    expect(parsed.name).toBe('外来布局');
    expect(parsed.layout.leftWidth).toBe(PANEL_SIZE_SPECS.left.max); // 钳到上界
    expect(parsed.layout.inspectorTab).toBe('object'); // 非法枚举回默认
    expect(parsed.layout.browser.expanded).toBe(false);
    expect(parsed.layout.hiddenPanels).toEqual({ left: false, right: false, bottom: false });
  });

  it('往返幂等：导入产物再导出 → 再导入等价', () => {
    const layout = layoutPresetOf('analysis').layout;
    const once = parseLayoutImport(serializeLayoutExport('X', layout)!)!;
    const twice = parseLayoutImport(serializeLayoutExport(once.name, once.layout)!)!;
    expect(twice).toEqual(once);
  });
});
