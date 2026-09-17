/**
 * ui/layout/workspacePersistence —— 工作区自动持久化接线（T7.3）。
 *
 * 职责（需求 30 章末段「重新进入编辑器后恢复上次工作状态」）：
 *   - mount 恢复：读 t3d-editor.workspace 快照 → deserialize 校验/钳制（含 mode 的
 *     MODES enabled 校验——analysis 落 scene；measure T10.2 转正可恢复）→ 一次性应用（applyLayout +
 *     setMode + setMinimapVisible）；无快照/损坏 → 保持默认，静默不抛错；
 *   - 订阅写回：恢复完成**之后**启动订阅（防 INITIAL 覆盖用户快照）→ 状态变化防抖
 *     ~300ms 写回快照（布局字段 + mode + minimapVisible）；窗口内连续变化收敛为一次写入；
 *   - dispose：退订 + 清定时器（unmount 后零写入）。
 * 边界：ui 层纯接线（node 可测：storage / debounceMs / deps 三路注入，沿 browserModel
 *      先例）；订阅回调只读 workspaceStore 内存态——**不触碰 EditorFacade / EventBus**
 *      （布局与场景数据解耦，T7.3 验收项）。React StrictMode 双挂载幂等：init → dispose
 *      → init 重复应用同一快照无副作用。App.tsx 以 useEffect(() => initWorkspacePersistence(), [])
 *      装配；刷新页面实况归 T7.8 GUI 目检。
 */
import { useWorkspaceStore } from './workspaceStore';
import {
  WORKSPACE_STORAGE_KEY,
  deserializeWorkspaceSnapshot,
  pickLayoutFields,
  serializeWorkspaceSnapshot,
} from './layoutPresets';
import type { WorkspaceSnapshot, WorkspaceStorage } from './layoutPresets';

/** 默认防抖窗口（ms）：拖拽 Splitter 等连续写入收敛为一次落盘 */
export const WORKSPACE_PERSIST_DEBOUNCE_MS = 300;

/** 可注入的 store 绑定（默认绑 useWorkspaceStore；node 测试用 fake 替身） */
export interface WorkspacePersistenceDeps {
  /** 读取当前快照（布局字段 + mode） */
  getSnapshot(): WorkspaceSnapshot;
  /** 应用恢复的快照（含 mode；mode 已过 enabled 校验） */
  applySnapshot(snapshot: WorkspaceSnapshot): void;
  /** 订阅状态变化（返回退订函数） */
  subscribe(listener: () => void): () => void;
}

export interface WorkspacePersistenceOptions {
  /** storage 注入（缺省 = 浏览器 localStorage，不可用 → null 静默降级） */
  storage?: WorkspaceStorage | null;
  /** 防抖窗口（缺省 300ms） */
  debounceMs?: number;
  /** store 绑定注入（缺省 = useWorkspaceStore） */
  deps?: WorkspacePersistenceDeps;
}

/** 默认 storage：沿 layoutPresets/browserModel 先例（localStorage 不可用 → null） */
function defaultStorage(): WorkspaceStorage | null {
  try {
    if (typeof globalThis.localStorage !== 'undefined') {
      const ls = globalThis.localStorage;
      return {
        getItem: (k) => ls.getItem(k),
        setItem: (k, v) => ls.setItem(k, v),
        removeItem: (k) => ls.removeItem(k),
      };
    }
  } catch {
    /* 部分隐私模式访问 localStorage 抛错 */
  }
  return null;
}

/** 默认绑定：workspaceStore（applyLayout + setMode + setMinimapVisible 三入口一次性应用） */
function defaultDeps(): WorkspacePersistenceDeps {
  return {
    getSnapshot: () => {
      const s = useWorkspaceStore.getState();
      return { layout: pickLayoutFields(s), mode: s.mode, minimapVisible: s.minimapVisible };
    },
    applySnapshot: (snapshot) => {
      const store = useWorkspaceStore.getState();
      store.applyLayout(snapshot.layout);
      store.setMode(snapshot.mode);
      store.setMinimapVisible(snapshot.minimapVisible);
    },
    subscribe: (listener) => useWorkspaceStore.subscribe(listener),
  };
}

/**
 * 初始化工作区持久化（App mount 时调用一次）：恢复上次快照 → 订阅防抖写回。
 * 返回 dispose（unmount 退订）。storage 不可用 → 全程空操作（静默降级，不抛错）。
 */
export function initWorkspacePersistence(options: WorkspacePersistenceOptions = {}): () => void {
  const storage = options.storage !== undefined ? options.storage : defaultStorage();
  const deps = options.deps ?? defaultDeps();

  // ① 恢复：无快照 / 损坏 → deserialize 返回 null → 保持默认（静默）
  if (storage) {
    let raw: string | null = null;
    try {
      raw = storage.getItem(WORKSPACE_STORAGE_KEY);
    } catch {
      raw = null;
    }
    if (raw !== null) {
      const snapshot = deserializeWorkspaceSnapshot(raw);
      if (snapshot !== null) deps.applySnapshot(snapshot);
    }
  }

  // ② 订阅（在恢复之后启动——恢复写入不触发落盘，也不让 INITIAL 覆盖用户快照）
  let timer: ReturnType<typeof setTimeout> | null = null;
  const dispose = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const unsubscribe = deps.subscribe(() => {
    if (!storage) return;
    if (timer !== null) clearTimeout(timer); // 窗口内连续变化收敛为一次写入
    timer = setTimeout(() => {
      timer = null;
      try {
        const snapshot = deps.getSnapshot();
        storage.setItem(
          WORKSPACE_STORAGE_KEY,
          serializeWorkspaceSnapshot(snapshot.layout, snapshot.mode, snapshot.minimapVisible),
        );
      } catch {
        /* 配额/隐私模式：本会话布局仅存内存 */
      }
    }, options.debounceMs ?? WORKSPACE_PERSIST_DEBOUNCE_MS);
  });

  return () => {
    dispose();
    unsubscribe();
  };
}
