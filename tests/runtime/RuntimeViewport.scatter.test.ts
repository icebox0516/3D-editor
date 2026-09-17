/**
 * tests/runtime/RuntimeViewport.scatter.test.ts —— 散布实例射线拾取合并测试（T003.3，D18.7）。
 *
 * 覆盖（node 纯数学射线，沿 RuntimeViewport.instanced.test.ts 先例）：
 * - 命中散布 InstancedMesh → pickObject 返回所属源 id（regionId）→ 既有区域选中链路入口；
 * - 公平竞争：散布实例与业务对象同射线时全局按距离取最近（两个方向都验——池/散布/普通
 *   对象互不压制）；
 * - 源隐藏 → 命中被可见性守卫挡下，射线穿透到后方对象（不可见即不可选，所见即所得）；
 * - 未注入散布源（scatterPick 缺省）→ 拾取集合不变（原行为零回归）。
 * 环境：真 ScatterChunkManager + fake 源提供者；散布 root 不挂 contentGroup（Renderer
 *      实装配为 scene 直挂兄弟，经 scatterPick 注入并入射线目标）。
 */
import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import type { ID } from '../../src/core/types';
import type { Vec2 } from '../../src/core/types';
import { scatterChunk } from '../../src/domain/scatter';
import type { ScatterParams } from '../../src/domain/scatter';
import { RuntimeObjectMap } from '../../src/runtime/RuntimeObjectMap';
import { ScatterChunkManager } from '../../src/runtime/scatter/ScatterChunkManager';
import { RuntimeViewport } from '../../src/runtime/services/RuntimeViewport';
import type { InstanceSource } from '../../src/runtime/instancing/InstancedAssetPool';

// ── 构造工具 ────────────────────────────────────────────────

/** 最小画布 fake：pickObject 只读 getBoundingClientRect */
function fakeCanvas(width = 800, height = 600): HTMLCanvasElement {
  return {
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width,
      height,
      x: 0,
      y: 0,
      right: width,
      bottom: height,
      toJSON: () => ({}),
    }),
  } as unknown as HTMLCanvasElement;
}

function rect(minX: number, minZ: number, maxX: number, maxZ: number): Vec2[] {
  return [
    { x: minX, y: minZ },
    { x: maxX, y: minZ },
    { x: maxX, y: maxZ },
    { x: minX, y: maxZ },
  ];
}

function scatterParams(): ScatterParams {
  return {
    polygon: rect(-16, -16, 16, 16),
    densityPerM2: 0.2,
    assets: [{ assetId: 'asset_tree', weight: 1 }],
    seed: 20260917,
  };
}

function makeProvider() {
  const sources = new Map<string, InstanceSource>();
  const provider = vi.fn(async (assetId: string): Promise<InstanceSource> => {
    let source = sources.get(assetId);
    if (!source) {
      source = {
        geometry: new THREE.BoxGeometry(1, 2, 1),
        material: new THREE.MeshStandardMaterial({ color: 0x2e8b57 }),
      };
      sources.set(assetId, source);
    }
    return source;
  });
  return { provider, sources };
}

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** 业务对象根（contentGroup 内）：盒子 Mesh 挂 userData 空的 Group，id 由 map 反查 */
function makeObjectRoot(position: THREE.Vector3): THREE.Group {
  const root = new THREE.Group();
  root.position.copy(position);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshStandardMaterial());
  root.add(mesh);
  root.updateMatrixWorld(true);
  return root;
}

/**
 * 拾取 harness：contentGroup（业务）+ 散布 root（兄弟，经 scatterPick 并入射线）。
 * pickAt 把相机摆在 (x, y+6, z+10) 正对 (x, y, z)，点画布中心（NDC 0,0 穿过目标点）。
 */
function createHarness(withScatter = true) {
  const { provider } = makeProvider();
  const manager = new ScatterChunkManager({ provideSource: provider });
  const map = new RuntimeObjectMap();
  const camera = new THREE.PerspectiveCamera(50, 800 / 600, 0.1, 2000);
  const pickRoot = new THREE.Group(); // contentGroup 等价
  const viewport = new RuntimeViewport(
    fakeCanvas(),
    camera,
    pickRoot,
    map,
    undefined,
    withScatter ? { root: manager.root, resolvePick: (hit) => manager.resolvePick(hit) } : undefined,
  );

  const dropObject = (id: ID, position: THREE.Vector3): void => {
    const root = makeObjectRoot(position);
    pickRoot.add(root);
    map.set(id, root);
    pickRoot.updateMatrixWorld(true);
  };

  const frame = (): void => {
    pickRoot.updateMatrixWorld(true);
    manager.root.updateMatrixWorld(true);
  };

  const pickAt = (x: number, y: number, z: number): ID | null => {
    camera.position.set(x, y + 6, z + 10);
    camera.lookAt(x, y, z);
    camera.updateMatrixWorld(true);
    return viewport.pickObject(400, 300);
  };

  return { manager, map, viewport, dropObject, frame, pickAt };
}

/** 散布区域内取一个确定性实例位置（撒点输出首个实例；无实例时抛错——测试前置失败） */
function firstInstancePosition(params: ScatterParams): { x: number; z: number } {
  const instances = scatterChunk(params, { minX: -32, minZ: -32, maxX: 32, maxZ: 32 });
  expect(instances.length).toBeGreaterThan(0);
  const first = instances[0]!;
  return { x: first.position.x, z: first.position.y };
}

/**
 * pickAt 射线上的参数点：相机在 (x, 6, z+10) 正对 (x,0,z)，t∈[0,1] 为相机到目标段，
 * t>1 为目标身后延伸段。near 遮挡放 t<1、far 对象放 t>1（都在射线上才可比距离）。
 */
function rayPoint(spot: { x: number; z: number }, t: number): THREE.Vector3 {
  return new THREE.Vector3(spot.x, 6 - 6 * t, spot.z + 10 - 10 * t);
}

// ── 测试 ────────────────────────────────────────────────────

describe('RuntimeViewport 散布拾取合并', () => {
  it('命中散布实例 → 返回所属源 id（regionId）', async () => {
    const h = createHarness();
    const params = scatterParams();
    h.manager.setSource('region_grass', params, 0.12);
    await flush();
    h.frame();
    const spot = firstInstancePosition(params);
    expect(h.pickAt(spot.x, 0, spot.z)).toBe('region_grass');
    h.manager.dispose();
  });

  it('公平竞争（全局按距离）：业务对象在散布实例前 → 业务 id；在后 → 散布源 id', async () => {
    const h = createHarness();
    const params = scatterParams();
    h.manager.setSource('region_grass', params);
    await flush();
    h.frame();
    const spot = firstInstancePosition(params);
    // 射线上 t=0.5（相机与实例之间）放业务对象 → 更近，先命中
    h.dropObject('model_near', rayPoint(spot, 0.5));
    expect(h.pickAt(spot.x, 0, spot.z)).toBe('model_near');

    // 反向：t=1.6（实例身后）放业务对象 → 散布实例先命中
    const h2 = createHarness();
    h2.manager.setSource('region_grass', params);
    await flush();
    h2.frame();
    h2.dropObject('model_far', rayPoint(spot, 1.6));
    expect(h2.pickAt(spot.x, 0, spot.z)).toBe('region_grass');
    h.manager.dispose();
    h2.manager.dispose();
  });

  it('源隐藏 → 命中被可见性守卫挡下，射线穿透到身后对象（不可见即不可选）', async () => {
    const h = createHarness();
    const params = scatterParams();
    h.manager.setSource('region_hidden', params);
    await flush();
    h.manager.setSourceVisible('region_hidden', false);
    h.frame();
    const spot = firstInstancePosition(params);
    // 身后 t=1.3 放业务对象：实例命中被守卫丢弃 → 穿透命中业务对象（无守卫则实例先出，本测试即失败）
    h.dropObject('model_behind', rayPoint(spot, 1.3));
    expect(h.pickAt(spot.x, 0, spot.z)).toBe('model_behind');
    h.manager.dispose();
  });

  it('未注入散布源（scatterPick 缺省）→ 拾取集合不变（原行为零回归）', () => {
    const h = createHarness(false);
    h.dropObject('plain_object', new THREE.Vector3(0, 0, 0));
    expect(h.pickAt(0, 0, 0)).toBe('plain_object');
    h.manager.dispose();
  });
});
