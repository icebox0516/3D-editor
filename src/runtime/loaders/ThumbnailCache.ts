/**
 * runtime/loaders/ThumbnailCache —— 资产缩略图两级缓存 + 离屏快照生产。
 *
 * 职责（T2.1 两级缩略图策略的第 ② 级）：
 * - ThumbnailCache：内存 Map → 持久层（ThumbnailStore）→ 生产者（离屏渲染快照）；
 *   同 key 只生产一次（内存/在途去重），生产结果 best-effort 写入持久层；
 *   持久 key = assetId@文件尺寸（metadata.bytes；文件变更 → 尺寸变 → key 变 → 旧快照失效）。
 * - IndexedDbThumbnailStore：持久层默认实现（浏览器），一切 IndexedDB 故障静默降级（best-effort）。
 * - OffscreenSnapshotter：生产者默认实现——独立小尺寸 WebGLRenderer 离屏渲染 GLB 模板，
 *   透明背景 PNG dataURL；任何环境缺失（无 document/WebGL）或加载失败 → null。
 * - 程序化源分支（T002.2 资产库混排）：thumbnailKey 泛化到最小结构签名（程序化 meta 无
 *   metadata.bytes → key = id@?，与 GLB 同 key 空间、全库 id 唯一不撞）；ThumbnailCache.getProcedural
 *   与 get 同语义共用生产链；OffscreenSnapshotter.captureProcedural 走 routes 路由一次性 build
 *   （不走 ProceduralSourceCache——对齐 GLB 快照的独立加载模式），快照后即 dispose 产物。
 * 边界：three 仅在本层使用（白名单）；快照生产者以接口注入（node 测试用 fake 覆盖
 *   缓存命中/替换语义，不测真实 WebGL 渲染——阶段门裁定 3）；
 *      UI 不感知本模块，由组合根（App）在首次放置资产时触发并在完成后回填面板数据。
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { ModelAsset, ProceduralAssetMeta } from '../../domain/assets';
import { getProceduralBuild } from '../procedural/routes';

// ── 接口 ────────────────────────────────────────────────────

/** 快照生产者：为资产生成真实缩略图（dataURL）；不可用时返回 null（不抛错）。
 * captureProcedural 可选（GLB-only 生产者无需实现）；缺省 → 缓存层解析 null。 */
export interface ThumbnailSnapshotProducer {
  capture(asset: ModelAsset): Promise<string | null>;
  captureProcedural?(meta: ProceduralAssetMeta): Promise<string | null>;
}

/** 持久层：键值存取（字符串）；实现自行兜底故障（抛错由 ThumbnailCache 吞掉） */
export interface ThumbnailStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

/** 持久 key 的最小结构签名：ModelAsset（有 metadata.bytes）与 ProceduralAssetMeta（无 metadata）均结构兼容 */
export interface ThumbnailKeySource {
  id: string;
  /** 附加元数据（GLB 的 bytes 参与 key 破除文件变更缓存；程序化 meta 无此字段 → id@?） */
  metadata?: { bytes?: unknown };
}

/** 持久 key：assetId + 文件尺寸（metadata.bytes 缺失用 '?'；程序化无 bytes → id@?，全库 id 唯一不撞 key） */
export function thumbnailKey(asset: ThumbnailKeySource): string {
  const bytes = asset.metadata?.bytes;
  return `${asset.id}@${typeof bytes === 'number' && Number.isFinite(bytes) ? bytes : '?'}`;
}

// ── ThumbnailCache ──────────────────────────────────────────

export class ThumbnailCache {
  private readonly store: ThumbnailStore;
  /** key → 已就绪快照（内存级） */
  private readonly memory = new Map<string, string>();
  /** key → 生产中 Promise（并发去重） */
  private readonly pending = new Map<string, Promise<string | null>>();

  constructor(opts: { store?: ThumbnailStore } = {}) {
    this.store = opts.store ?? noopStore();
  }

  /**
   * 取缩略图：内存 → 持久层 → 生产者。同 key 并发调用共享一次生产；
   * 生产者失败/返回 null → 解析 null（下次可重试）；持久层任何故障均降级不冒泡。
   */
  get(asset: ModelAsset, producer: ThumbnailSnapshotProducer): Promise<string | null> {
    return this.fetch(thumbnailKey(asset), () => producer.capture(asset));
  }

  /**
   * 取程序化资产缩略图：与 get 完全同语义（内存 → 持久层 → 生产 → best-effort 写入），
   * 且共享同一 key 空间与并发去重表（程序化无 bytes → key = id@?）；
   * producer 未实现 captureProcedural → 解析 null（不缓存，可换生产者重试）。
   */
  getProcedural(meta: ProceduralAssetMeta, producer: ThumbnailSnapshotProducer): Promise<string | null> {
    return this.fetch(thumbnailKey(meta), () =>
      producer.captureProcedural ? producer.captureProcedural(meta) : Promise.resolve(null),
    );
  }

  /** key 级取数（get / getProcedural 共用）：内存 → 在途去重 → 生产链 */
  private fetch(key: string, produce: () => Promise<string | null>): Promise<string | null> {
    const cached = this.memory.get(key);
    if (cached !== undefined) return Promise.resolve(cached);

    const inflight = this.pending.get(key);
    if (inflight) return inflight;

    // 在产 Promise 内联清理 pending（settle 即删，等待方恢复时表已更新，可立即重试）
    const produced = this.load(key, produce).then(
      (url) => {
        if (url !== null) this.memory.set(key, url);
        this.pending.delete(key);
        return url;
      },
      () => {
        this.pending.delete(key);
        return null;
      },
    );
    this.pending.set(key, produced);
    return produced;
  }

  private async load(key: string, produce: () => Promise<string | null>): Promise<string | null> {
    // 1) 持久层（故障 → 视为未命中）
    try {
      const stored = await this.store.get(key);
      if (typeof stored === 'string' && stored !== '') return stored;
    } catch {
      /* best-effort */
    }
    // 2) 生产（失败/不可用 → null）
    let url: string | null = null;
    try {
      url = await produce();
    } catch {
      return null;
    }
    if (url === null || url === '') return null;
    // 3) best-effort 持久化（失败不影响本次返回）
    try {
      await this.store.set(key, url);
    } catch {
      /* best-effort */
    }
    return url;
  }

  /** 只读内存：未生产过返回 null，不触发生产 */
  peek(asset: ModelAsset): string | null {
    return this.memory.get(thumbnailKey(asset)) ?? null;
  }

  /** 只读内存（程序化版）：与 peek 同语义，key 空间与 get / getProcedural 共享 */
  peekProcedural(meta: ProceduralAssetMeta): string | null {
    return this.memory.get(thumbnailKey(meta)) ?? null;
  }

  /** 清空内存缓存（持久层保留）；测试/资源回收用 */
  clear(): void {
    this.memory.clear();
  }
}

/** 无持久层实现（默认：纯内存缓存） */
function noopStore(): ThumbnailStore {
  return {
    async get() {
      return null;
    },
    async set() {
      /* no-op */
    },
  };
}

// ── IndexedDbThumbnailStore ─────────────────────────────────

const IDB_NAME = 't3d-editor';
const IDB_STORE = 'thumbnails';

/**
 * IndexedDB 持久层（浏览器）：跨会话保留真实快照。
 * 无 indexedDB（node/隐私模式等）或任何 IDB 故障 → get 返回 null / set 静默，绝不冒泡。
 */
export class IndexedDbThumbnailStore implements ThumbnailStore {
  private db: Promise<IDBDatabase> | null = null;

  private open(): Promise<IDBDatabase> {
    if (!this.db) {
      this.db =
        typeof indexedDB === 'undefined'
          ? Promise.reject(new Error('IndexedDB 不可用'))
          : new Promise<IDBDatabase>((resolvePromise, rejectPromise) => {
              try {
                const request = indexedDB.open(IDB_NAME, 1);
                request.onupgradeneeded = () => {
                  const db = request.result;
                  if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
                };
                request.onsuccess = () => resolvePromise(request.result);
                request.onerror = () => rejectPromise(request.error ?? new Error('IndexedDB 打开失败'));
              } catch (err) {
                rejectPromise(err as Error);
              }
            });
      // 打开失败不缓存坏结果（下次重试）
      this.db.catch(() => {
        this.db = null;
      });
    }
    return this.db;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.request<string | null>(
        (store) => store.get(key),
        'readonly',
        (result): string | null => (typeof result === 'string' ? result : null),
      );
    } catch {
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      await this.request((store) => store.put(value, key), 'readwrite', () => undefined);
    } catch {
      /* best-effort */
    }
  }

  /** 事务内执行一次请求（mode: readonly/readwrite），oncomplete 后经 convert 取值 */
  private async request<T>(
    use: (store: IDBObjectStore) => IDBRequest,
    mode: IDBTransactionMode,
    convert: (result: unknown) => T,
  ): Promise<T> {
    const db = await this.open();
    return new Promise<T>((resolvePromise, rejectPromise) => {
      const tx = db.transaction(IDB_STORE, mode);
      const request = use(tx.objectStore(IDB_STORE));
      tx.oncomplete = () => resolvePromise(convert(request.result));
      tx.onerror = () => rejectPromise(tx.error ?? new Error('IndexedDB 事务失败'));
      tx.onabort = () => rejectPromise(tx.error ?? new Error('IndexedDB 事务中止'));
    });
  }
}

// ── OffscreenSnapshotter（真实生产者，浏览器专用）──────────

/**
 * 离屏快照生产者：独立小画布 WebGLRenderer 加载 GLB → 框取 → PNG dataURL（透明底）。
 * 懒创建渲染器（首次 capture 才建 WebGL 上下文），dispose 释放；
 * 应用 defaultScale/defaultRotation 以呈现「放置后的样子」。
 * 程序化资产经 captureProcedural（T002.2）：routes 路由一次性 build → 同一渲染管线。
 */
export class OffscreenSnapshotter implements ThumbnailSnapshotProducer {
  private readonly loader = new GLTFLoader();
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private readonly width: number;
  private readonly height: number;

  constructor(opts: { width?: number; height?: number } = {}) {
    this.width = opts.width ?? 128;
    this.height = opts.height ?? 96;
  }

  async capture(asset: ModelAsset): Promise<string | null> {
    try {
      if (typeof document === 'undefined') return null; // 无 DOM（测试/SSR）
      const renderer = this.ensureRenderer();
      const gltf = await this.loader.loadAsync(asset.file);
      const model = gltf.scene;
      model.scale.set(asset.defaultScale.x, asset.defaultScale.y, asset.defaultScale.z);
      model.rotation.set(asset.defaultRotation.x, asset.defaultRotation.y, asset.defaultRotation.z);
      model.updateMatrixWorld(true);

      this.scene!.add(model);
      this.frameCamera(model);
      renderer.render(this.scene!, this.camera!);
      const url = renderer.domElement.toDataURL('image/png');
      this.scene!.remove(model);
      return url;
    } catch {
      return null; // WebGL 不可用 / 模型加载失败：保持 SVG 占位
    }
  }

  /**
   * 程序化资产快照：routes 路由 → 一次性 build（不走 ProceduralSourceCache——对齐 GLB
   * 快照的独立加载模式，模板缓存留给放置管线）→ 复用本类渲染管线。
   * 契约：build 产物所有权随调用移交 → try/finally 无论渲染成败都 dispose
   * （geometry + material 单值/数组）。未注册 id / 无 document / build 抛错 → null（不抛错）。
   */
  async captureProcedural(meta: ProceduralAssetMeta): Promise<string | null> {
    const build = getProceduralBuild(meta.id);
    if (!build) return null; // 未注册 id（meta 与路由不一致）
    try {
      if (typeof document === 'undefined') return null; // 无 DOM（测试/SSR）
      const renderer = this.ensureRenderer();
      const source = build();
      try {
        const mesh = new THREE.Mesh(source.geometry, source.material);
        mesh.scale.set(meta.defaultScale.x, meta.defaultScale.y, meta.defaultScale.z);
        mesh.rotation.set(meta.defaultRotation.x, meta.defaultRotation.y, meta.defaultRotation.z);
        mesh.updateMatrixWorld(true);

        this.scene!.add(mesh);
        this.frameCamera(mesh);
        renderer.render(this.scene!, this.camera!);
        const url = renderer.domElement.toDataURL('image/png');
        this.scene!.remove(mesh);
        return url;
      } finally {
        // 一次性产物即弃：独立于渲染成败释放 GPU 资源（所有权契约）
        source.geometry.dispose();
        if (Array.isArray(source.material)) {
          for (const material of source.material) material.dispose();
        } else {
          source.material.dispose();
        }
      }
    } catch {
      return null; // WebGL 不可用 / build 抛错：保持 SVG 占位
    }
  }

  /** 懒建离屏渲染器 + 灯光 + 相机（一次） */
  private ensureRenderer(): THREE.WebGLRenderer {
    if (this.renderer) return this.renderer;
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(this.width, this.height, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xf4f6fa, 0x2a2f3a, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xd9e2f2, 0.5);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    const camera = new THREE.PerspectiveCamera(32, this.width / this.height, 0.01, 1000);

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    return renderer;
  }

  /** 包围盒框取：相机置于中心斜上方，距离按包围球半径与视锥角推导 */
  private frameCamera(model: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const radius = Math.max(sphere.radius, 1e-3);
    const fitDistance = radius / Math.sin(THREE.MathUtils.degToRad(this.camera!.fov) / 2);
    const distance = fitDistance * 1.12;
    const direction = new THREE.Vector3(1, 0.55, 1).normalize();
    this.camera!.position.copy(center).addScaledVector(direction, distance);
    this.camera!.near = Math.max(distance - radius * 2, 0.01);
    this.camera!.far = distance + radius * 2;
    this.camera!.lookAt(center);
    this.camera!.updateProjectionMatrix();
  }

  dispose(): void {
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
    this.renderer = null;
    this.scene = null;
    this.camera = null;
  }
}
