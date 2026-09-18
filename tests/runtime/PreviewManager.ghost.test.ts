/**
 * tests/runtime/PreviewManager.ghost.test.ts —— Ghost 源提供者分派测试（T002.3）。
 *
 * 覆盖（node 构造 three 场景图，无 WebGL；Ghost 源为注入的 GhostObjectProvider——
 * 组合根接 AssetSourceRouter，程序化与 GLB 同通道）：
 * - 提供者就绪：showGhost 占位盒先行 → 异步替换为提供对象（子树入 AUX_LAYER）；
 * - 竞态防护：hideGhost 后迟到的提供对象不再挂载（令牌丢弃）；
 * - 失败降级：提供者 reject → 告警一次、占位盒保留；
 * - 无提供者（null）：Ghost 恒为占位盒（不抛错）。
 * - T008.4 seed 透传：showGhost 第三参透传 provideGhostObject（含 undefined 态）；
 *   同 (assetId, seed) 逐值去重不重复取源（占位盒期与挂载后两阶段）；seed 变化
 *   （含 undefined → 0 边界）触发重建；hideGhost 清 seed 且迟到回调不复活。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { PreviewManager } from '../../src/runtime/services/PreviewManager';
import { AUX_LAYER } from '../../src/runtime/RenderModeState';

/** 冲刷微任务队列（提供者 Promise 与后续 .then 链全部落地） */
const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** 取 PreviewManager 挂在场景上的预览容器组 */
function previewGroup(scene: THREE.Scene): THREE.Group {
  const group = scene.children.find((c) => (c as THREE.Group).name === '__preview__') as
    | THREE.Group
    | undefined;
  expect(group).toBeDefined();
  return group!;
}

function makeManager(provider: PreviewManagerLike | null = null): { scene: THREE.Scene; manager: PreviewManager } {
  const scene = new THREE.Scene();
  const manager = new PreviewManager(scene, provider);
  return { scene, manager };
}

/** 与 GhostObjectProvider 结构一致的最小类型（避免私有导出循环） */
interface PreviewManagerLike {
  provideGhostObject(assetId: string, seed?: number): Promise<THREE.Object3D>;
}

const T = { position: { x: 1, y: 0.03, z: 2 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PreviewManager：Ghost 源提供者（T002.3）', () => {
  it('提供者就绪：占位盒先行 → 异步替换为提供对象（子树入 AUX_LAYER）', async () => {
    const provided = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.9, 0.6),
      new THREE.MeshStandardMaterial(),
    );
    const { scene, manager } = makeManager({ provideGhostObject: async () => provided });

    manager.showGhost('asset_proc', T);
    let root = previewGroup(scene).children[0] as THREE.Group;
    expect(root.children[0]).toBeInstanceOf(THREE.Mesh);
    expect(root.children[0]).not.toBe(provided); // 占位盒先行

    await flush();
    root = previewGroup(scene).children[0] as THREE.Group;
    expect(root.children).toHaveLength(1);
    expect(root.children[0]).toBe(provided); // 替换为提供对象
    expect(provided.layers.mask).toBe(1 << AUX_LAYER); // 子树入辅助层

    manager.dispose();
    provided.geometry.dispose();
    (provided.material as THREE.Material).dispose();
  });

  it('竞态防护：hideGhost 后迟到的提供对象不再挂载', async () => {
    const provided = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
    const { scene, manager } = makeManager({
      provideGhostObject: () => new Promise((resolve) => setTimeout(() => resolve(provided), 5)),
    });

    manager.showGhost('asset_proc', T);
    manager.hideGhost(); // 提供者 Promise 尚未解析
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(previewGroup(scene).children).toHaveLength(0); // 迟到对象被丢弃
    manager.dispose();
    provided.geometry.dispose();
    (provided.material as THREE.Material).dispose();
  });

  it('提供者 reject → 告警一次、占位盒保留', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { scene, manager } = makeManager({
      provideGhostObject: async () => {
        throw new Error('未注册的程序化资产: asset_proc');
      },
    });

    manager.showGhost('asset_proc', T);
    await flush();

    expect(warn).toHaveBeenCalledTimes(1);
    const root = previewGroup(scene).children[0] as THREE.Group;
    expect(root.children[0]).toBeInstanceOf(THREE.Mesh); // 占位盒仍在
    manager.dispose();
  });

  it('无提供者（null）→ Ghost 恒为占位盒（不抛错）', async () => {
    const { scene, manager } = makeManager(null);
    manager.showGhost('asset_file', T);
    await flush();
    const root = previewGroup(scene).children[0] as THREE.Group;
    expect(root.children).toHaveLength(1);
    expect(root.children[0]).toBeInstanceOf(THREE.Mesh); // 占位盒未被替换
    manager.dispose();
  });
});

/** 造一个独立资源的展示 Mesh（Ghost 方永不 dispose——测试自持并自清） */
function makeProvided(): THREE.Mesh {
  return new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.5), new THREE.MeshStandardMaterial());
}

/** 清理测试自造的展示 Mesh 资源 */
function disposeProvided(...meshes: THREE.Object3D[]): void {
  for (const m of meshes) {
    m.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) material.forEach((mtl) => mtl.dispose());
      else if (material) material.dispose();
    });
  }
}

describe('PreviewManager：Ghost seed 透传与去重（T008.4）', () => {
  it('seed 透传：showGhost 第三参原样到达 provider（含未传 = undefined）', async () => {
    const provided = makeProvided();
    const provideGhostObject = vi.fn(async () => provided);
    const { manager } = makeManager({ provideGhostObject });

    manager.showGhost('asset_proc', T, 42);
    expect(provideGhostObject).toHaveBeenCalledTimes(1);
    expect(provideGhostObject).toHaveBeenCalledWith('asset_proc', 42);
    expect(manager.getGhostSeed()).toBe(42);

    manager.hideGhost();
    manager.showGhost('asset_proc', T); // 未传 seed → undefined 透传（GLB 侧忽略）
    expect(provideGhostObject).toHaveBeenCalledTimes(2);
    expect(provideGhostObject).toHaveBeenLastCalledWith('asset_proc', undefined);
    expect(manager.getGhostSeed()).toBeUndefined();

    await flush();
    manager.dispose();
    disposeProvided(provided);
  });

  it('去重（挂载后）：同 (assetId, seed) 重复调用仅同步变换——不重复取源、不重建 root、不动已挂展示对象', async () => {
    const provided = makeProvided();
    const provideGhostObject = vi.fn(async () => provided);
    const { scene, manager } = makeManager({ provideGhostObject });

    manager.showGhost('asset_proc', T, 7);
    await flush();
    const rootBefore = previewGroup(scene).children[0];
    expect(rootBefore.children[0]).toBe(provided); // 展示对象已挂载

    const t2 = {
      position: { x: 10, y: 0.5, z: 20 },
      rotation: { x: 0, y: 1.2, z: 0 },
      scale: { x: 2, y: 2, z: 2 },
    };
    manager.showGhost('asset_proc', t2, 7); // pointermove 同目标重放
    expect(provideGhostObject).toHaveBeenCalledTimes(1); // 未重复取源
    const rootAfter = previewGroup(scene).children[0];
    expect(rootAfter).toBe(rootBefore); // root 未重建（无占位盒闪烁）
    expect(rootAfter.children[0]).toBe(provided); // 已挂展示对象未被清除
    expect(rootAfter.position.x).toBe(10); // 仅变换同步
    expect(rootAfter.rotation.y).toBe(1.2);

    manager.dispose();
    disposeProvided(provided);
  });

  it('去重（占位盒期）：取源在途时同参调用同样不重复取源，在途回调正常挂载', async () => {
    const provided = makeProvided();
    const provideGhostObject = vi.fn(
      () => new Promise<THREE.Object3D>((resolve) => setTimeout(() => resolve(provided), 5)),
    );
    const { scene, manager } = makeManager({ provideGhostObject });

    manager.showGhost('asset_proc', T, 7);
    manager.showGhost('asset_proc', T, 7); // 解析前重放
    expect(provideGhostObject).toHaveBeenCalledTimes(1);

    await new Promise((resolve) => setTimeout(resolve, 10));
    const root = previewGroup(scene).children[0] as THREE.Group;
    expect(root.children).toHaveLength(1);
    expect(root.children[0]).toBe(provided); // 原令牌回调挂载一次

    manager.dispose();
    disposeProvided(provided);
  });

  it('seed 变化触发重建：旧 root 卸载、provider 按新 seed 二次取源、新对象挂载', async () => {
    const provided1 = makeProvided();
    const provided2 = makeProvided();
    const provideGhostObject = vi.fn(async (_id: string, seed?: number) =>
      seed === 1 ? provided1 : provided2,
    );
    const { scene, manager } = makeManager({ provideGhostObject });

    manager.showGhost('asset_proc', T, 1);
    await flush();
    const root1 = previewGroup(scene).children[0];
    expect(root1.children[0]).toBe(provided1);

    manager.showGhost('asset_proc', T, 2); // 换 seed → 重建（占位盒先行）
    expect(provideGhostObject).toHaveBeenCalledTimes(2);
    expect(provideGhostObject).toHaveBeenLastCalledWith('asset_proc', 2);
    expect(root1.parent).toBeNull(); // 旧 root 已卸载
    const root2 = previewGroup(scene).children[0];
    expect(root2).not.toBe(root1);
    expect(root2.children[0]).not.toBe(provided2); // 占位盒先行

    await flush();
    expect((previewGroup(scene).children[0] as THREE.Group).children[0]).toBe(provided2);
    expect(manager.getGhostSeed()).toBe(2);

    manager.dispose();
    disposeProvided(provided1, provided2);
  });

  it('边界：seed undefined → 0 逐值不等，触发重建（不误去重）', async () => {
    const created: THREE.Mesh[] = [];
    const provideGhostObject = vi.fn(async () => {
      const mesh = makeProvided();
      created.push(mesh);
      return mesh;
    });
    const { scene, manager } = makeManager({ provideGhostObject });

    manager.showGhost('asset_proc', T); // ghostSeed = undefined
    await flush();
    const root1 = previewGroup(scene).children[0];
    manager.showGhost('asset_proc', T, 0); // 0 ≠ undefined → 重建
    expect(provideGhostObject).toHaveBeenCalledTimes(2);
    expect(provideGhostObject).toHaveBeenLastCalledWith('asset_proc', 0);
    expect(previewGroup(scene).children[0]).not.toBe(root1);
    expect(manager.getGhostSeed()).toBe(0);

    await flush();
    manager.dispose();
    disposeProvided(...created);
  });

  it('hideGhost 清空 seed；迟到回调丢弃不复活，其后同参调用重建而非误去重', async () => {
    const provided = makeProvided();
    const provideGhostObject = vi.fn(
      () => new Promise<THREE.Object3D>((resolve) => setTimeout(() => resolve(provided), 5)),
    );
    const { scene, manager } = makeManager({ provideGhostObject });

    manager.showGhost('asset_proc', T, 9);
    expect(manager.getGhostSeed()).toBe(9);
    manager.hideGhost(); // 取源在途
    expect(manager.getGhostAssetId()).toBeNull();
    expect(manager.getGhostSeed()).toBeUndefined();

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(previewGroup(scene).children).toHaveLength(0); // 迟到对象不复活

    manager.showGhost('asset_proc', T, 9); // 同参——hide 后 ghostRoot 已空 → 重建
    expect(provideGhostObject).toHaveBeenCalledTimes(2);
    await new Promise((resolve) => setTimeout(resolve, 10));
    const root = previewGroup(scene).children[0] as THREE.Group;
    expect(root.children[0]).toBe(provided); // 第二次取源正常挂载
    expect(manager.getGhostSeed()).toBe(9);

    manager.dispose();
    disposeProvided(provided);
  });
});
