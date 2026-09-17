/**
 * tests/ui/layout/workspaceStore —— 四区一层布局工作区状态（T5.1）。
 *
 * 覆盖：clampPanelSize 钳制表（左 180–420 / 右 240–480 / 底 60–320，需求 §四默认空间比例）；
 *      store 写入钳制、区域隐藏按区独立切换、分区折叠按键独立切换、resetLayout 复位默认；
 *      Inspector 标签态（inspectorTab：跨选变化保持 + 「设置」action 跳转目标，T5.4）与
 *      Inspector 折叠分组键（inspectorModel.inspectorSectionKey 记账）；
 *      viewportShare 视口宽度占比——1920×1080 默认布局 ≥65%、左右全隐藏 ≥90%（需求 §四/§43.1）；
 *      pure3d 纯三维工作模式（T7.4）：默认 false、setPure3d 幂等写入、applyLayout /
 *      resetLayout 均不触碰（工作态非布局态）。
 * 边界：node 纯逻辑测试（无 jsdom / 无 React 渲染，沿 tests/ui 既有先例）；
 *      Splitter / PanelFrame 的 GUI 行为（拖拽、折叠动画）归浏览器目检，不在此测。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { layoutPresetOf } from '../../../src/ui/layout/layoutPresets';
import {
  BROWSER_EXPANDED_H,
  PANEL_SIZE_SPECS,
  clampPanelSize,
  useWorkspaceStore,
  viewportShare,
} from '../../../src/ui/layout/workspaceStore';
import { inspectorSectionKey } from '../../../src/ui/panels/inspectorModel';

describe('clampPanelSize 钳制表', () => {
  it('钳制表 = 需求 §四：左 180–420 默认 260 / 右 240–480 默认 320 / 底 60–320 默认 60', () => {
    expect(PANEL_SIZE_SPECS.left).toEqual({ min: 180, max: 420, default: 260 });
    expect(PANEL_SIZE_SPECS.right).toEqual({ min: 240, max: 480, default: 320 });
    expect(PANEL_SIZE_SPECS.bottom).toEqual({ min: 60, max: 320, default: 60 });
  });

  it('低于下界钳到 min、高于上界钳到 max、区间内原样通过', () => {
    expect(clampPanelSize('left', 0)).toBe(180);
    expect(clampPanelSize('left', 999)).toBe(420);
    expect(clampPanelSize('left', 260)).toBe(260);
    expect(clampPanelSize('right', 100)).toBe(240);
    expect(clampPanelSize('right', 600)).toBe(480);
    expect(clampPanelSize('right', 300)).toBe(300);
    expect(clampPanelSize('bottom', 10)).toBe(60);
    expect(clampPanelSize('bottom', 400)).toBe(320);
    expect(clampPanelSize('bottom', 180)).toBe(180);
  });
});

describe('useWorkspaceStore', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().resetLayout();
  });

  it('初始状态 = 钳制表默认值，三区全可见，无折叠分区，Inspector 标签缺省「对象属性」', () => {
    const s = useWorkspaceStore.getState();
    expect(s.leftWidth).toBe(PANEL_SIZE_SPECS.left.default);
    expect(s.rightWidth).toBe(PANEL_SIZE_SPECS.right.default);
    expect(s.bottomHeight).toBe(PANEL_SIZE_SPECS.bottom.default);
    expect(s.hiddenPanels).toEqual({ left: false, right: false, bottom: false });
    expect(s.collapsedSections).toEqual({});
    expect(s.inspectorTab).toBe('object');
  });

  it('setPanelSize 越界写入被钳制、界内写入生效（三区一致）', () => {
    const s = useWorkspaceStore.getState();
    s.setPanelSize('left', 999);
    expect(useWorkspaceStore.getState().leftWidth).toBe(420);
    s.setPanelSize('right', 10);
    expect(useWorkspaceStore.getState().rightWidth).toBe(240);
    s.setPanelSize('bottom', 400);
    expect(useWorkspaceStore.getState().bottomHeight).toBe(320);
    s.setPanelSize('left', 200);
    expect(useWorkspaceStore.getState().leftWidth).toBe(200);
    s.setPanelSize('bottom', 160);
    expect(useWorkspaceStore.getState().bottomHeight).toBe(160);
    // 写入尺寸不影响可见性与折叠
    expect(useWorkspaceStore.getState().hiddenPanels).toEqual({ left: false, right: false, bottom: false });
  });

  it('togglePanelHidden 按区独立切换，互不影响', () => {
    const s = useWorkspaceStore.getState();
    s.togglePanelHidden('left');
    expect(useWorkspaceStore.getState().hiddenPanels).toEqual({ left: true, right: false, bottom: false });
    s.togglePanelHidden('left');
    expect(useWorkspaceStore.getState().hiddenPanels).toEqual({ left: false, right: false, bottom: false });
    s.togglePanelHidden('right');
    s.togglePanelHidden('bottom');
    expect(useWorkspaceStore.getState().hiddenPanels).toEqual({ left: false, right: true, bottom: true });
  });

  it('setPanelHidden 幂等写入（供工具条开关与面板组隐藏按钮共用）', () => {
    const s = useWorkspaceStore.getState();
    s.setPanelHidden('right', true);
    expect(useWorkspaceStore.getState().hiddenPanels.right).toBe(true);
    s.setPanelHidden('right', true);
    expect(useWorkspaceStore.getState().hiddenPanels.right).toBe(true);
    s.setPanelHidden('right', false);
    expect(useWorkspaceStore.getState().hiddenPanels.right).toBe(false);
  });

  it('toggleCollapsed 按分区键独立切换；展开后键清除（回到空表）', () => {
    const s = useWorkspaceStore.getState();
    s.toggleCollapsed('left.scene');
    expect(useWorkspaceStore.getState().collapsedSections).toEqual({ 'left.scene': true });
    s.toggleCollapsed('right.props');
    expect(useWorkspaceStore.getState().collapsedSections).toEqual({ 'left.scene': true, 'right.props': true });
    s.toggleCollapsed('left.scene');
    expect(useWorkspaceStore.getState().collapsedSections).toEqual({ 'right.props': true });
    s.toggleCollapsed('right.props');
    expect(useWorkspaceStore.getState().collapsedSections).toEqual({});
  });

  it('resetLayout 把弄脏的全部字段复位默认（尺寸 / 隐藏 / 折叠 / Inspector 标签 / 浏览器状态）', () => {
    const s = useWorkspaceStore.getState();
    s.setPanelSize('left', 420);
    s.setPanelSize('right', 240);
    s.setPanelSize('bottom', 320);
    s.togglePanelHidden('left');
    s.togglePanelHidden('right');
    s.togglePanelHidden('bottom');
    s.toggleCollapsed('left.scene');
    s.toggleCollapsed('browser.assets');
    s.setInspectorTab('settings');
    s.setBrowserExpanded(true);
    s.setBrowserCategory('plant');
    s.setBrowserSearch('树');

    useWorkspaceStore.getState().resetLayout();
    const after = useWorkspaceStore.getState();
    expect(after.leftWidth).toBe(260);
    expect(after.rightWidth).toBe(320);
    expect(after.bottomHeight).toBe(60);
    expect(after.hiddenPanels).toEqual({ left: false, right: false, bottom: false });
    expect(after.collapsedSections).toEqual({});
    expect(after.inspectorTab).toBe('object');
    expect(after.browser).toEqual({ expanded: false, category: 'all', search: '' });
  });

  it('inspectorTab 标签态：三标签可切换且跨选变化保持（store 持有，非组件内 state）', () => {
    const s = useWorkspaceStore.getState();
    s.setInspectorTab('environment');
    expect(useWorkspaceStore.getState().inspectorTab).toBe('environment');
    s.setInspectorTab('settings');
    expect(useWorkspaceStore.getState().inspectorTab).toBe('settings');
    s.setInspectorTab('object');
    expect(useWorkspaceStore.getState().inspectorTab).toBe('object');
  });

  it('Inspector 折叠分组键独立切换（inspector.<section> 命名空间），展开后键清除', () => {
    const s = useWorkspaceStore.getState();
    const transformKey = inspectorSectionKey('transform');
    const metadataKey = inspectorSectionKey('metadata');
    s.toggleCollapsed(transformKey);
    expect(useWorkspaceStore.getState().collapsedSections).toEqual({ [transformKey]: true });
    s.toggleCollapsed(metadataKey);
    expect(useWorkspaceStore.getState().collapsedSections).toEqual({
      [transformKey]: true,
      [metadataKey]: true,
    });
    // 与面板分区键互不干扰
    s.toggleCollapsed('right.inspector');
    expect(useWorkspaceStore.getState().collapsedSections).toEqual({
      [transformKey]: true,
      [metadataKey]: true,
      'right.inspector': true,
    });
    s.toggleCollapsed(transformKey);
    expect(useWorkspaceStore.getState().collapsedSections[transformKey]).toBeUndefined();
  });
});

describe('useWorkspaceStore：browser 状态（T5.5 Content Browser）', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().resetLayout();
  });

  it('初始状态：紧凑未展开 / 分类「全部」/ 搜索为空', () => {
    expect(useWorkspaceStore.getState().browser).toEqual({ expanded: false, category: 'all', search: '' });
  });

  it('setBrowserCategory / setBrowserSearch 独立写入，互不影响展开位与行高', () => {
    const s = useWorkspaceStore.getState();
    s.setBrowserCategory('vehicle');
    s.setBrowserSearch('car');
    const after = useWorkspaceStore.getState();
    expect(after.browser).toEqual({ expanded: false, category: 'vehicle', search: 'car' });
    expect(after.bottomHeight).toBe(PANEL_SIZE_SPECS.bottom.default);
  });

  it('setBrowserExpanded(true)：展开位 + 底部行高 → 展开目标高（经钳制入口）', () => {
    useWorkspaceStore.getState().setBrowserExpanded(true);
    const after = useWorkspaceStore.getState();
    expect(after.browser.expanded).toBe(true);
    expect(after.bottomHeight).toBe(BROWSER_EXPANDED_H);
    expect(after.bottomHeight).toBe(280);
  });

  it('setBrowserExpanded(false)：收回紧凑，行高回到钳制下界（60）', () => {
    const s = useWorkspaceStore.getState();
    s.setBrowserExpanded(true);
    useWorkspaceStore.getState().setBrowserExpanded(false);
    const after = useWorkspaceStore.getState();
    expect(after.browser.expanded).toBe(false);
    expect(after.bottomHeight).toBe(60);
    expect(after.browser.category).toBe('all'); // 收起不清筛选/搜索（会话内保持）
  });

  it('BROWSER_EXPANDED_H 在底部钳制域内（60–320）', () => {
    expect(BROWSER_EXPANDED_H).toBeGreaterThanOrEqual(PANEL_SIZE_SPECS.bottom.min);
    expect(BROWSER_EXPANDED_H).toBeLessThanOrEqual(PANEL_SIZE_SPECS.bottom.max);
  });
});

describe('useWorkspaceStore：applyLayout 一次性应用（T7.3 预设/个人布局/持久化恢复共用）', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().resetLayout();
  });

  it('一次性应用全部布局字段（尺寸/显隐/折叠/标签/浏览器），不等价多次 set 也一次生效', () => {
    useWorkspaceStore.getState().applyLayout({
      leftWidth: 400,
      rightWidth: 300,
      bottomHeight: 280,
      hiddenPanels: { left: false, right: true, bottom: false },
      collapsedSections: { 'left.scene': true, 'inspector.transform': true },
      inspectorTab: 'settings',
      browser: { expanded: true, category: 'plant', search: '树' },
    });
    const s = useWorkspaceStore.getState();
    expect(s.leftWidth).toBe(400);
    expect(s.rightWidth).toBe(300);
    expect(s.bottomHeight).toBe(280);
    expect(s.hiddenPanels).toEqual({ left: false, right: true, bottom: false });
    expect(s.collapsedSections).toEqual({ 'left.scene': true, 'inspector.transform': true });
    expect(s.inspectorTab).toBe('settings');
    expect(s.browser).toEqual({ expanded: true, category: 'plant', search: '树' });
  });

  it('越界尺寸经钳制表折回域内（与逐字段 set 同一钳制入口）', () => {
    useWorkspaceStore.getState().applyLayout({
      leftWidth: 9999,
      rightWidth: 1,
      bottomHeight: -5,
      hiddenPanels: { left: true, right: false, bottom: false },
      collapsedSections: {},
      inspectorTab: 'object',
      browser: { expanded: false, category: 'all', search: '' },
    });
    const s = useWorkspaceStore.getState();
    expect(s.leftWidth).toBe(PANEL_SIZE_SPECS.left.max);
    expect(s.rightWidth).toBe(PANEL_SIZE_SPECS.right.min);
    expect(s.bottomHeight).toBe(PANEL_SIZE_SPECS.bottom.min);
  });

  it('applyLayout 不触碰 mode（mode 是工作态非布局态，T7.1/T7.3 裁定）', () => {
    useWorkspaceStore.getState().setMode('terrain');
    useWorkspaceStore.getState().applyLayout({
      leftWidth: 260,
      rightWidth: 320,
      bottomHeight: 60,
      hiddenPanels: { left: false, right: false, bottom: false },
      collapsedSections: {},
      inspectorTab: 'object',
      browser: { expanded: false, category: 'all', search: '' },
    });
    expect(useWorkspaceStore.getState().mode).toBe('terrain');
    useWorkspaceStore.getState().setMode('scene');
  });

  it('入参对象与 store 内部状态不共享引用（事后改入参不影响 store）', () => {
    const layout = {
      leftWidth: 300,
      rightWidth: 320,
      bottomHeight: 60,
      hiddenPanels: { left: false, right: false, bottom: false },
      collapsedSections: {} as Record<string, boolean>,
      inspectorTab: 'object' as const,
      browser: { expanded: false, category: 'all', search: '' },
    };
    useWorkspaceStore.getState().applyLayout(layout);
    layout.hiddenPanels.left = true;
    layout.collapsedSections['x.y'] = true;
    layout.browser.search = '后写';
    const s = useWorkspaceStore.getState();
    expect(s.hiddenPanels.left).toBe(false);
    expect(s.collapsedSections).toEqual({});
    expect(s.browser.search).toBe('');
  });

  it('「恢复默认」动作 = default 预设 + mode scene（T7.3 门裁定）：脏状态后组合复位', () => {
    // 弄脏：布局 + 模式
    useWorkspaceStore.getState().applyLayout({
      leftWidth: 420,
      rightWidth: 480,
      bottomHeight: 320,
      hiddenPanels: { left: true, right: true, bottom: true },
      collapsedSections: { 'left.scene': true },
      inspectorTab: 'environment',
      browser: { expanded: true, category: 'vehicle', search: 'car' },
    });
    useWorkspaceStore.getState().setMode('build');
    // 恢复默认（LayoutMenu「恢复默认」按钮的同一组合语义）
    useWorkspaceStore.getState().applyLayout(layoutPresetOf('default').layout);
    useWorkspaceStore.getState().setMode('scene');
    const s = useWorkspaceStore.getState();
    expect(s.leftWidth).toBe(PANEL_SIZE_SPECS.left.default);
    expect(s.rightWidth).toBe(PANEL_SIZE_SPECS.right.default);
    expect(s.bottomHeight).toBe(PANEL_SIZE_SPECS.bottom.default);
    expect(s.hiddenPanels).toEqual({ left: false, right: false, bottom: false });
    expect(s.collapsedSections).toEqual({});
    expect(s.inspectorTab).toBe('object');
    expect(s.browser).toEqual({ expanded: false, category: 'all', search: '' });
    expect(s.mode).toBe('scene');
  });
});

describe('useWorkspaceStore：pure3d 纯三维工作模式（T7.4）', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().resetLayout();
    useWorkspaceStore.getState().setPure3d(false);
  });

  it('初始默认 false（非纯三维）', () => {
    expect(useWorkspaceStore.getState().pure3d).toBe(false);
  });

  it('setPure3d 写入 + 幂等（同值不通知订阅者——沿 setMode 写法）', () => {
    let notified = 0;
    const unsub = useWorkspaceStore.subscribe(() => {
      notified += 1;
    });
    useWorkspaceStore.getState().setPure3d(true);
    expect(useWorkspaceStore.getState().pure3d).toBe(true);
    expect(notified).toBe(1);
    useWorkspaceStore.getState().setPure3d(true); // 同值幂等：不再通知
    expect(useWorkspaceStore.getState().pure3d).toBe(true);
    expect(notified).toBe(1);
    useWorkspaceStore.getState().setPure3d(false);
    expect(useWorkspaceStore.getState().pure3d).toBe(false);
    expect(notified).toBe(2);
    unsub();
  });

  it('applyLayout 不触碰 pure3d（工作态非布局态，T7.4 裁定）', () => {
    useWorkspaceStore.getState().setPure3d(true);
    useWorkspaceStore.getState().applyLayout({
      leftWidth: 260,
      rightWidth: 320,
      bottomHeight: 60,
      hiddenPanels: { left: false, right: false, bottom: false },
      collapsedSections: {},
      inspectorTab: 'object',
      browser: { expanded: false, category: 'all', search: '' },
    });
    expect(useWorkspaceStore.getState().pure3d).toBe(true);
  });

  it('resetLayout 不触碰 pure3d（工作态不复位，沿 T7.1 mode 裁定）', () => {
    useWorkspaceStore.getState().setPure3d(true);
    useWorkspaceStore.getState().resetLayout();
    expect(useWorkspaceStore.getState().pure3d).toBe(true);
  });
});

describe('useWorkspaceStore：minimapVisible 小地图开关（T7.7）', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().resetLayout();
    useWorkspaceStore.getState().setMinimapVisible(true);
  });

  it('默认 true（显示小地图；beforeEach 已复位到默认态）', () => {
    expect(useWorkspaceStore.getState().minimapVisible).toBe(true);
  });

  it('setMinimapVisible 写入 + 幂等（同值不通知订阅者——沿 setMode/setPure3d 写法）', () => {
    let notified = 0;
    const unsub = useWorkspaceStore.subscribe(() => {
      notified += 1;
    });
    useWorkspaceStore.getState().setMinimapVisible(false);
    expect(useWorkspaceStore.getState().minimapVisible).toBe(false);
    expect(notified).toBe(1);
    useWorkspaceStore.getState().setMinimapVisible(false); // 同值幂等：不再通知
    expect(useWorkspaceStore.getState().minimapVisible).toBe(false);
    expect(notified).toBe(1);
    useWorkspaceStore.getState().setMinimapVisible(true);
    expect(useWorkspaceStore.getState().minimapVisible).toBe(true);
    expect(notified).toBe(2);
    unsub();
  });

  it('applyLayout / resetLayout 均不触碰 minimapVisible（UI 偏好非布局字段，沿 mode/pure3d 裁定）', () => {
    useWorkspaceStore.getState().setMinimapVisible(false);
    useWorkspaceStore.getState().applyLayout(layoutPresetOf('build').layout);
    expect(useWorkspaceStore.getState().minimapVisible).toBe(false);
    useWorkspaceStore.getState().resetLayout();
    expect(useWorkspaceStore.getState().minimapVisible).toBe(false);
    useWorkspaceStore.getState().setMinimapVisible(true); // 复位，不外溢
  });
});

describe('viewportShare 视口宽度占比（需求 §四 / §43.1）', () => {
  const VISIBLE = { left: false, right: false, bottom: false };
  const ALL_HIDDEN = { left: true, right: true, bottom: true };

  it('1920×1080 默认布局 ≥65%（≈(1920−48−260−320)/1920）', () => {
    const share = viewportShare(1920, 1080, {
      leftWidth: PANEL_SIZE_SPECS.left.default,
      rightWidth: PANEL_SIZE_SPECS.right.default,
      hiddenPanels: VISIBLE,
    });
    expect(share).toBeCloseTo((1920 - 48 - 260 - 320) / 1920, 5);
    expect(share).toBeGreaterThanOrEqual(0.65);
  });

  it('左右面板全隐藏 ≥90%（垂直工具条 48px 常驻）', () => {
    const share = viewportShare(1920, 1080, {
      leftWidth: PANEL_SIZE_SPECS.left.default,
      rightWidth: PANEL_SIZE_SPECS.right.default,
      hiddenPanels: ALL_HIDDEN,
    });
    expect(share).toBeCloseTo((1920 - 48) / 1920, 5);
    expect(share).toBeGreaterThanOrEqual(0.9);
  });

  it('越界宽度按钳制表折算；窗口过窄时结果截在 [0,1]', () => {
    // 传入越界宽度：按 min/max 折算后再计算
    const clamped = viewportShare(1920, 1080, {
      leftWidth: 99999,
      rightWidth: 0,
      hiddenPanels: VISIBLE,
    });
    expect(clamped).toBeCloseTo((1920 - 48 - 420 - 240) / 1920, 5);

    // 极窄窗口：占比下截 0，永不出现负数 / 超过 1
    const tiny = viewportShare(300, 400, {
      leftWidth: 420,
      rightWidth: 480,
      hiddenPanels: VISIBLE,
    });
    expect(tiny).toBe(0);
  });

  it('单侧隐藏 = 只扣除另一侧与垂直工具条', () => {
    const share = viewportShare(1920, 1080, {
      leftWidth: 260,
      rightWidth: 320,
      hiddenPanels: { left: true, right: false, bottom: false },
    });
    expect(share).toBeCloseTo((1920 - 48 - 320) / 1920, 5);
  });
});
