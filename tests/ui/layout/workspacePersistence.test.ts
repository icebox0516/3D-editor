/**
 * tests/ui/layout/workspacePersistence —— 工作区自动持久化接线测试（先测后码，T7.3）。
 *
 * 覆盖（需求 30 章末段「重新进入编辑器后恢复上次工作状态」）：
 * - mount 恢复：读 t3d-editor.workspace 快照 → 校验/钳制 → 一次性应用（含 mode，
 *   mode 过 MODES enabled 校验——analysis 落 scene；measure T10.2 转正可恢复）；无快照 / 损坏 → 不应用，静默；
 * - 订阅写入：状态变化 → 防抖（默认 300ms）写回快照（含 mode）；窗口内连续变化收敛为
 *   一次写入；dispose 后不再写入；
 * - 默认绑定（useWorkspaceStore）：真实 store 上恢复 + 写回（fake storage + 假时钟）；
 * - StrictMode 双挂载语义：init → dispose → init 幂等（重复应用同一快照无副作用、
 *   订阅在恢复之后启动——不用 INITIAL 覆盖用户快照）。
 * 边界：node 纯逻辑 + 可注入 deps / storage / debounceMs（沿 browserModel 注入先例）；
 *      App.tsx 的 useEffect 接线与刷新页面实况归 T7.8 GUI 目检。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initWorkspacePersistence } from '../../../src/ui/layout/workspacePersistence';
import type { WorkspacePersistenceDeps } from '../../../src/ui/layout/workspacePersistence';
import {
  WORKSPACE_STORAGE_KEY,
  deserializeWorkspaceSnapshot,
  pickLayoutFields,
  serializeWorkspaceSnapshot,
} from '../../../src/ui/layout/layoutPresets';
import { layoutPresetOf } from '../../../src/ui/layout/layoutPresets';
import type { LayoutFields } from '../../../src/ui/layout/layoutPresets';
import type { WorkModeId } from '../../../src/ui/tools/toolIA';
import { PANEL_SIZE_SPECS, useWorkspaceStore } from '../../../src/ui/layout/workspaceStore';

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

/** 注入型 deps：记录 apply 调用，快照可手动推进（minimapVisible 可选，T7.7） */
function fakeDeps(initial: { layout: LayoutFields; mode: string; minimapVisible?: boolean }): {
  deps: WorkspacePersistenceDeps;
  applied: { layout: LayoutFields; mode: string; minimapVisible: boolean }[];
  setSnapshot(snapshot: { layout: LayoutFields; mode: string; minimapVisible?: boolean }): void;
  notify(): void;
} {
  let current = initial;
  const applied: { layout: LayoutFields; mode: string; minimapVisible: boolean }[] = [];
  const listeners = new Set<() => void>();
  return {
    deps: {
      getSnapshot: () => current as never,
      applySnapshot: (snapshot) => {
        applied.push({
          layout: snapshot.layout,
          mode: snapshot.mode,
          minimapVisible: snapshot.minimapVisible === false ? false : true,
        });
      },
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    },
    applied,
    setSnapshot(snapshot) {
      current = snapshot;
      for (const listener of listeners) listener();
    },
    notify() {
      for (const listener of listeners) listener();
    },
  };
}

const DEFAULT_LAYOUT = layoutPresetOf('default').layout;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  // 真实 store 测试后复位，避免污染其他用例
  useWorkspaceStore.getState().resetLayout();
  useWorkspaceStore.getState().setMode('scene');
  useWorkspaceStore.getState().setMinimapVisible(true);
});

// ── mount 恢复 ─────────────────────────────────────────────

describe('initWorkspacePersistence：mount 恢复', () => {
  it('有合法快照 → 一次性应用（含 mode；布局字段 + 模式都到位）', () => {
    const storage = fakeStorage();
    const saved: { layout: LayoutFields; mode: WorkModeId } = {
      layout: layoutPresetOf('build').layout,
      mode: 'road',
    };
    storage.setItem(WORKSPACE_STORAGE_KEY, serializeWorkspaceSnapshot(saved.layout, saved.mode));
    const { deps, applied } = fakeDeps({
      layout: DEFAULT_LAYOUT,
      mode: 'scene',
    });

    initWorkspacePersistence({ storage, deps });
    expect(applied).toHaveLength(1);
    expect(applied[0]!.layout).toEqual(saved.layout);
    expect(applied[0]!.mode).toBe('road');
  });

  it('无快照 / 空字符串 / 损坏 JSON → 不应用，静默不抛错', () => {
    for (const raw of [null, '', '{oops']) {
      const storage = fakeStorage();
      if (raw) storage.setItem(WORKSPACE_STORAGE_KEY, raw);
      const { deps, applied } = fakeDeps({ layout: DEFAULT_LAYOUT, mode: 'scene' });
      expect(() => initWorkspacePersistence({ storage, deps })).not.toThrow();
      expect(applied).toHaveLength(0);
    }
  });

  it('快照含禁用模式（analysis）→ 恢复时 mode 落 scene（enabled 校验在 deserialize；T10.2 measure 转正可恢复）', () => {
    const storage = fakeStorage();
    storage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify({ ...DEFAULT_LAYOUT, mode: 'analysis' }));
    const { deps, applied } = fakeDeps({ layout: DEFAULT_LAYOUT, mode: 'scene' });
    initWorkspacePersistence({ storage, deps });
    expect(applied[0]!.mode).toBe('scene');

    const storageMeasure = fakeStorage();
    storageMeasure.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify({ ...DEFAULT_LAYOUT, mode: 'measure' }));
    const measureFx = fakeDeps({ layout: DEFAULT_LAYOUT, mode: 'scene' });
    initWorkspacePersistence({ storage: storageMeasure, deps: measureFx.deps });
    expect(measureFx.applied[0]!.mode).toBe('measure'); // T10.2 启用后随快照恢复
  });

  it('storage 不可用（null）→ 不恢复、不写入、不抛错', () => {
    const { deps, applied, notify } = fakeDeps({ layout: DEFAULT_LAYOUT, mode: 'scene' });
    const dispose = initWorkspacePersistence({ storage: null, deps });
    expect(applied).toHaveLength(0);
    expect(() => notify()).not.toThrow();
    expect(() => vi.advanceTimersByTime(1000)).not.toThrow();
    dispose();
  });
});

// ── 订阅防抖写回 ───────────────────────────────────────────

describe('initWorkspacePersistence：订阅防抖写回', () => {
  it('状态变化 → 默认 300ms 后写回快照（含 mode）', () => {
    const storage = fakeStorage();
    const { deps, setSnapshot } = fakeDeps({ layout: DEFAULT_LAYOUT, mode: 'scene' });
    initWorkspacePersistence({ storage, deps });

    setSnapshot({ layout: layoutPresetOf('minimal').layout, mode: 'terrain' });
    expect(storage.getItem(WORKSPACE_STORAGE_KEY)).toBeNull(); // 防抖窗口内未写
    vi.advanceTimersByTime(299);
    expect(storage.getItem(WORKSPACE_STORAGE_KEY)).toBeNull();
    vi.advanceTimersByTime(1);
    const written = storage.getItem(WORKSPACE_STORAGE_KEY);
    expect(written).not.toBeNull();
    const back = deserializeWorkspaceSnapshot(written!);
    expect(back!.layout).toEqual(layoutPresetOf('minimal').layout);
    expect(back!.mode).toBe('terrain');
  });

  it('窗口内连续变化收敛为一次写入（写最终态）', () => {
    const storage = fakeStorage();
    const { deps, setSnapshot } = fakeDeps({ layout: DEFAULT_LAYOUT, mode: 'scene' });
    initWorkspacePersistence({ storage, deps, debounceMs: 300 });

    setSnapshot({ layout: layoutPresetOf('build').layout, mode: 'build' });
    vi.advanceTimersByTime(200);
    setSnapshot({ layout: layoutPresetOf('analysis').layout, mode: 'annotation' });
    vi.advanceTimersByTime(200);
    setSnapshot({ layout: layoutPresetOf('minimal').layout, mode: 'scene' });
    vi.advanceTimersByTime(300);

    const back = deserializeWorkspaceSnapshot(storage.getItem(WORKSPACE_STORAGE_KEY)!);
    expect(back!.layout).toEqual(layoutPresetOf('minimal').layout);
    // 写入次数 = 1（收敛）：再次读值不变化即可证明无中间态写入
    const once = storage.getItem(WORKSPACE_STORAGE_KEY);
    vi.advanceTimersByTime(1000);
    expect(storage.getItem(WORKSPACE_STORAGE_KEY)).toBe(once);
  });

  it('自定义 debounceMs 生效（50ms 快速收敛）', () => {
    const storage = fakeStorage();
    const { deps, notify, setSnapshot } = fakeDeps({ layout: DEFAULT_LAYOUT, mode: 'scene' });
    initWorkspacePersistence({ storage, deps, debounceMs: 50 });
    setSnapshot({ layout: layoutPresetOf('build').layout, mode: 'build' });
    vi.advanceTimersByTime(50);
    expect(deserializeWorkspaceSnapshot(storage.getItem(WORKSPACE_STORAGE_KEY)!)!.mode).toBe('build');
    void notify;
  });

  it('dispose：退订 + 清定时器——之后的变化不再写入', () => {
    const storage = fakeStorage();
    const { deps, setSnapshot } = fakeDeps({ layout: DEFAULT_LAYOUT, mode: 'scene' });
    const dispose = initWorkspacePersistence({ storage, deps });
    setSnapshot({ layout: layoutPresetOf('build').layout, mode: 'build' });
    dispose();
    vi.advanceTimersByTime(1000);
    expect(storage.getItem(WORKSPACE_STORAGE_KEY)).toBeNull(); // 定时器被清

    setSnapshot({ layout: layoutPresetOf('minimal').layout, mode: 'scene' });
    vi.advanceTimersByTime(1000);
    expect(storage.getItem(WORKSPACE_STORAGE_KEY)).toBeNull(); // 已退订
  });
});

// ── 默认绑定（真实 useWorkspaceStore）──────────────────────

describe('initWorkspacePersistence：默认绑定 useWorkspaceStore', () => {
  it('恢复：快照写入真实 store（applyLayout + setMode 同一次接线完成）', () => {
    const storage = fakeStorage();
    const saved: { layout: LayoutFields; mode: WorkModeId } = {
      layout: layoutPresetOf('analysis').layout,
      mode: 'decoration',
    };
    storage.setItem(WORKSPACE_STORAGE_KEY, serializeWorkspaceSnapshot(saved.layout, saved.mode));
    const dispose = initWorkspacePersistence({ storage });
    const s = useWorkspaceStore.getState();
    expect(s.leftWidth).toBe(saved.layout.leftWidth);
    expect(s.hiddenPanels).toEqual(saved.layout.hiddenPanels);
    expect(s.mode).toBe('decoration');
    dispose();
  });

  it('写回：store 修改经防抖落入 storage（布局字段 + mode）', () => {
    const storage = fakeStorage();
    const dispose = initWorkspacePersistence({ storage });
    useWorkspaceStore.getState().setPanelSize('left', 400);
    useWorkspaceStore.getState().setPanelHidden('bottom', true);
    useWorkspaceStore.getState().setMode('annotation');
    vi.advanceTimersByTime(300);

    const back = deserializeWorkspaceSnapshot(storage.getItem(WORKSPACE_STORAGE_KEY)!);
    expect(back!.layout.leftWidth).toBe(400);
    expect(back!.layout.hiddenPanels.bottom).toBe(true);
    expect(back!.mode).toBe('annotation');
    dispose();
  });

  it('双挂载（StrictMode）：init → dispose → init 幂等，用户快照不被 INITIAL 覆盖', () => {
    const storage = fakeStorage();
    storage.setItem(
      WORKSPACE_STORAGE_KEY,
      serializeWorkspaceSnapshot({ ...DEFAULT_LAYOUT, leftWidth: 333 }, 'road'),
    );

    const first = initWorkspacePersistence({ storage });
    first();
    const second = initWorkspacePersistence({ storage });

    const s = useWorkspaceStore.getState();
    expect(s.leftWidth).toBe(333);
    expect(s.mode).toBe('road');
    // 第二次挂载后没有把 INITIAL 写进 storage（订阅在恢复之后启动 + 防抖静默）
    vi.advanceTimersByTime(1000);
    const back = deserializeWorkspaceSnapshot(storage.getItem(WORKSPACE_STORAGE_KEY)!);
    expect(back!.layout.leftWidth).toBe(333);
    expect(back!.mode).toBe('road');
    second();
  });

  it('无快照首次运行：保持默认，不写入（直到用户实际改布局）', () => {
    const storage = fakeStorage();
    const dispose = initWorkspacePersistence({ storage });
    vi.advanceTimersByTime(1000);
    expect(storage.getItem(WORKSPACE_STORAGE_KEY)).toBeNull();
    expect(useWorkspaceStore.getState().leftWidth).toBe(PANEL_SIZE_SPECS.left.default);
    dispose();
  });
});

// ── minimapVisible 持久化（T7.7 小地图开关随快照）──────────

describe('minimapVisible 持久化（T7.7：开关随 t3d-editor.workspace 快照）', () => {
  it('恢复：快照 minimapVisible=false → applySnapshot 收到 false（注入 deps）', () => {
    const storage = fakeStorage();
    storage.setItem(
      WORKSPACE_STORAGE_KEY,
      serializeWorkspaceSnapshot(layoutPresetOf('build').layout, 'build', false),
    );
    const { deps, applied } = fakeDeps({ layout: DEFAULT_LAYOUT, mode: 'scene' });
    initWorkspacePersistence({ storage, deps });
    expect(applied[0]!.minimapVisible).toBe(false);
  });

  it('恢复：旧快照（无 minimapVisible 字段）→ 默认 true', () => {
    const storage = fakeStorage();
    storage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify({ ...DEFAULT_LAYOUT, mode: 'scene' }));
    const { deps, applied } = fakeDeps({ layout: DEFAULT_LAYOUT, mode: 'scene' });
    initWorkspacePersistence({ storage, deps });
    expect(applied[0]!.minimapVisible).toBe(true);
  });

  it('真实 store：setMinimapVisible(false) 经防抖写回；下次 init 恢复 false', () => {
    const storage = fakeStorage();
    const dispose = initWorkspacePersistence({ storage });
    useWorkspaceStore.getState().setMinimapVisible(false);
    vi.advanceTimersByTime(300);
    expect(
      deserializeWorkspaceSnapshot(storage.getItem(WORKSPACE_STORAGE_KEY)!)!.minimapVisible,
    ).toBe(false);
    dispose();

    const second = initWorkspacePersistence({ storage });
    expect(useWorkspaceStore.getState().minimapVisible).toBe(false);
    second();
  });
});

// ── 快照不含 pure3d（T7.4 守护：工作态不持久化）──────────────

describe('快照不含 pure3d（T7.4：纯三维为会话工作态，不入 t3d-editor.workspace）', () => {
  it('pure3d = true 时 serializeWorkspaceSnapshot 产物无 pure3d 键（显式字段平铺天然不含）', () => {
    const s = useWorkspaceStore.getState();
    s.setPure3d(true);
    const json = serializeWorkspaceSnapshot(pickLayoutFields(s), s.mode);
    expect(json.includes('pure3d')).toBe(false);
    expect(Object.keys(JSON.parse(json) as Record<string, unknown>)).not.toContain('pure3d');
    s.setPure3d(false); // 复位，不外溢到其他用例
  });
});
