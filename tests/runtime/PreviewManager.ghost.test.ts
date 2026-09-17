/**
 * tests/runtime/PreviewManager.ghost.test.ts —— Ghost 源提供者分派测试（T002.3）。
 *
 * 覆盖（node 构造 three 场景图，无 WebGL；Ghost 源为注入的 GhostObjectProvider——
 * 组合根接 AssetSourceRouter，程序化与 GLB 同通道）：
 * - 提供者就绪：showGhost 占位盒先行 → 异步替换为提供对象（子树入 AUX_LAYER）；
 * - 竞态防护：hideGhost 后迟到的提供对象不再挂载（令牌丢弃）；
 * - 失败降级：提供者 reject → 告警一次、占位盒保留；
 * - 无提供者（null）：Ghost 恒为占位盒（不抛错）。
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
  provideGhostObject(assetId: string): Promise<THREE.Object3D>;
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
