/**
 * tests/ui/tools/toolIA.test.ts —— 工具信息架构既有用例（T5.6 奠基；T6.5 形状驱动重构后
 * 保留的不变项 + 键表同源断言；新键表/垂直条/数字路由/形状切换的完整覆盖见
 * toolIA.shapes.test.ts）。
 *
 * 覆盖：
 * - MODES：八模式表（T7.1 六模式转正；T10.2 measure 转正，analysis 灰显占位待 T10.3）；
 * - activateTransformTool：激活 + store.gizmoMode 记账（键盘与点击同路）；
 * - 键表同源：menuModel（tool.snap shortcut / SHORTCUT_HELP 工具行）从 toolIA 键表派生。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { createEditor } from '../../../src/app/bootstrap';
import { useEditorStore } from '../../../src/ui/store';
import {
  KEY_TO_TRANSFORM_MODE,
  MODES,
  SELECT_KEY,
  SELECT_TOOL_ID,
  SNAP_KEY,
  TRANSFORM_TOOL_ID,
  VERTICAL_TOOLS,
  AREA_SUBTOOLS,
  activateTransformTool,
} from '../../../src/ui/tools/toolIA';
import { SHORTCUT_HELP, buildMenus } from '../../../src/ui/menus/menuModel';
import type { MenuState } from '../../../src/ui/menus/menuModel';

/** 菜单状态最小夹具（键表同源断言用） */
function menuState(): MenuState {
  return {
    ready: true,
    canUndo: false,
    canRedo: false,
    hasSelection: false,
    hasClipboard: false,
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
    activeToolId: null, // T10.2：测量子菜单 checked 同源断言用（无激活工具）
    templates: [], // T8.2：模板子菜单不在键表断言范围，空清单即可
  };
}

/** 全局 store 记账复位（activateTransformTool 会写入） */
function resetStore(): void {
  useEditorStore.getState().setDrawTarget(null);
  useEditorStore.getState().setGizmoMode('translate');
}

beforeEach(resetStore);

// ── MODES 八模式表 ──────────────────────────────────────────

describe('MODES（八模式表）', () => {
  it('八模式齐备且顺序固定（= 需求 24 章表序）；T7.1 六模式转正可手选', () => {
    expect(MODES.map((m) => m.id)).toEqual([
      'scene',
      'build',
      'road',
      'terrain',
      'decoration',
      'annotation',
      'measure',
      'analysis',
    ]);
    expect(MODES.filter((m) => m.enabled).map((m) => m.id)).toEqual([
      'scene',
      'build',
      'road',
      'terrain',
      'decoration',
      'annotation',
      'measure',
    ]);
    for (const mode of MODES) {
      expect(mode.label.length).toBeGreaterThan(0);
      expect(mode.hint.length).toBeGreaterThan(0);
    }
  });

  it('measure 转正（T10.2：accent/verticalGroup 就位）；analysis 灰显占位（tooltip 后续版本，T10.3 转正）', () => {
    const measure = MODES.find((m) => m.id === 'measure')!;
    const analysis = MODES.find((m) => m.id === 'analysis')!;
    expect(measure.enabled).toBe(true);
    expect(measure.accent).toBe('--mode-measure');
    expect(measure.verticalGroup).toBe('measure');
    expect(analysis.enabled).toBe(false);
    expect(analysis.hint).toContain('后续版本');
  });
});

// ── 共享激活入口 ────────────────────────────────────────────

describe('activateTransformTool（键盘与点击同路）', () => {
  it('激活变换工具并写 store.gizmoMode 记账', () => {
    const facade = createEditor(null);
    activateTransformTool(facade.tools, 'rotate');
    expect(facade.tools.getActiveTool()!.id).toBe(TRANSFORM_TOOL_ID);
    expect(useEditorStore.getState().gizmoMode).toBe('rotate');
    facade.dispose();
  });
});

// ── 键表同源（menuModel 派生） ──────────────────────────────

describe('键表同源（toolIA 为单一真相源）', () => {
  it('工具键常量：Q 选择 / G 吸附 / W-E-R 变换 / 工具 id', () => {
    expect(SELECT_KEY).toBe('q');
    expect(SNAP_KEY).toBe('g');
    expect(KEY_TO_TRANSFORM_MODE).toEqual({ w: 'translate', e: 'rotate', r: 'scale' });
    expect(SELECT_TOOL_ID).toBe('select');
    expect(TRANSFORM_TOOL_ID).toBe('transform');
  });

  it('menuModel tool.snap 为吸附总开关：不带键帽（T8.1——G 归绘制/顶点编辑会话键）', () => {
    const toolMenu = buildMenus(menuState()).find((m) => m.id === 'tool')!;
    const snap = toolMenu.items.find((i) => !('separator' in i) && i.id === 'tool.snap') as {
      shortcut?: string;
    };
    expect(snap.shortcut).toBeUndefined();
  });

  it('SHORTCUT_HELP 工具行从 toolIA 键表派生（Q / 1–4 / ⇧1–5 / W-E-R / G）', () => {
    const row = (label: string) => SHORTCUT_HELP.find((e) => e.label === label);
    const wer = Object.keys(KEY_TO_TRANSFORM_MODE)
      .map((k) => k.toUpperCase())
      .join(' / ');
    expect(row('移动 / 旋转 / 缩放（变换工具）')!.keys).toBe(wer);
    expect(row('网格吸附开关（本工具会话）')!.keys).toBe(SNAP_KEY.toUpperCase());
    expect(row('贴地（选中对象落到下方最近高度层）')!.keys).toBe('End');
    expect(row('选择工具')!.keys).toBe(SELECT_KEY.toUpperCase());
    const vertical = `${VERTICAL_TOOLS[0]!.key}–${VERTICAL_TOOLS[VERTICAL_TOOLS.length - 1]!.key}`;
    expect(row('垂直工具条：区域 / 路径 / 点 / 资产（再按退出；1 记忆上次子工具）')!.keys).toBe(vertical);
    const subKeys = `⇧ ${AREA_SUBTOOLS[0]!.subKey}–${AREA_SUBTOOLS[AREA_SUBTOOLS.length - 1]!.subKey}`;
    expect(row('区域子工具直切：多边形 / 矩形 / 圆形 / 椭圆 / 自由')!.keys).toBe(subKeys);
  });
});
