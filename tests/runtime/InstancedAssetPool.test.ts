/**
 * tests/runtime/InstancedAssetPool.test.ts —— 实例化资产池测试（先测后码）。
 *
 * 覆盖（T2.3 验收标准，node 下统计、无需 WebGL——three 场景图对象可纯构造）：
 * - 池化合并：同 assetId 500 实例 → 渲染根仅 1 个 InstancedMesh（而非 500 Group），
 *   每实例矩阵与其 transform 一致（池根恒等 → 实例矩阵即世界矩阵）；
 * - 单实例退化普通 Mesh；第二实例加入升级 InstancedMesh；回到单实例再退化；
 * - 删除中间实例：其余实例矩阵不变、count 减一；重挂（undo → object:created → attach）
 *   后 count 与各 id 矩阵复原；
 * - 增量更新：更新单实例 transform 只写对应矩阵槽（spy 断言 setMatrixAt 调用次数 = 1）；
 * - 容量增长重建矩阵缓冲而非重建对象（InstancedMesh 实例引用稳定）；
 * - 隐藏实例零缩放矩阵（单例模式退化为 mesh.visible=false）；
 * - anchor（供 Renderer 挂 RuntimeObjectMap 的脱离渲染树锚点）与 resolvePick（拾取反查）；
 * - 源加载失败降级：告警一次、渲染根保持空、后续操作不崩。
 * - T009.5 customDepthMaterial：源带深度材质三建网格点（singleMesh/instancedMesh/
 *   诊断亮网格）挂同一引用；不带 → undefined（three 缺省）；锚点补挂 Mesh 不挂；
 *   池任何生命周期点不 dispose（深度材质归源所有）。
 * 边界：GLB 加载用注入的 fake geometry/material 工厂替代（InstanceSourceProvider），
 *      本文件不触碰 AssetLoader / WebGL。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import type { ID, Transform } from '../../src/core/types';
import { aSeedValueOf } from '../../src/domain/assets';
import type { ModelObject } from '../../src/domain/assets';
import { InstancedAssetPool } from '../../src/runtime/instancing/InstancedAssetPool';
import type {
  InstanceSource,
  InstanceSourceProvider,
} from '../../src/runtime/instancing/InstancedAssetPool';

// ── 构造工具 ────────────────────────────────────────────────

/** 与业务侧一致的确定性变换（第 i 个实例） */
function transformAt(i: number): Transform {
  return {
    position: { x: i * 3, y: 0, z: (i % 7) * 5 },
    rotation: { x: 0, y: i * 0.1, z: 0 },
    scale: { x: 1 + (i % 3) * 0.25, y: 1 + (i % 5) * 0.2, z: 1 },
  };
}

function makeModel(
  id: ID,
  assetId: string,
  t: Transform,
  visible = true,
  seed?: number,
): ModelObject {
  return {
    id,
    type: 'model',
    name: `模型-${id}`,
    parentId: null,
    layerId: null,
    visible,
    locked: false,
    transform: t,
    properties: {},
    asset: seed === undefined ? { assetId } : { assetId, seed },
  };
}

/** 与池内组合逻辑一致的期望矩阵（隐藏实例 → 零缩放）；
 *  实例矩阵缓冲为 Float32Array，期望值同样过一遍 float32 舍入后做精确比较 */
function expectedMatrix(t: Transform, visible = true): THREE.Matrix4 {
  const scale = visible ? t.scale : { x: 0, y: 0, z: 0 };
  const composed = new THREE.Matrix4().compose(
    new THREE.Vector3(t.position.x, t.position.y, t.position.z),
    new THREE.Quaternion().setFromEuler(
      new THREE.Euler(t.rotation.x, t.rotation.y, t.rotation.z),
    ),
    new THREE.Vector3(scale.x, scale.y, scale.z),
  );
  return new THREE.Matrix4().fromArray(Float32Array.from(composed.elements));
}

function fakeSource(): InstanceSource {
  return {
    geometry: new THREE.BoxGeometry(1, 2, 1),
    material: new THREE.MeshStandardMaterial({ color: 0x2e8b57 }),
  };
}

/** fake 源提供者：每 assetId 一份共享源（模拟模板缓存去重），异步解析 */
function makeProvider() {
  const sources = new Map<string, InstanceSource>();
  const provider = vi.fn(async (assetId: string): Promise<InstanceSource> => {
    let source = sources.get(assetId);
    if (!source) {
      source = fakeSource();
      sources.set(assetId, source);
    }
    return source;
  });
  return { provider, sources };
}

/** 冲刷微任务队列（源 Promise 与后续 .then 链全部落地） */
const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** 构造最小射线命中（resolvePick 只读 object / instanceId 两个字段） */
function hitOf(object: THREE.Object3D, instanceId: number): THREE.Intersection {
  return { object, instanceId } as unknown as THREE.Intersection;
}

/** 取渲染根中该资产的网格对象（单例 Mesh 或 InstancedMesh） */
function meshOf(pool: InstancedAssetPool, index = 0): THREE.Mesh {
  const child = pool.root.children[index];
  expect(child).toBeDefined();
  return child as THREE.Mesh;
}

// ── 测试 ────────────────────────────────────────────────────

describe('InstancedAssetPool：同资产多实例合并', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    warn.mockRestore();
  });

  it('500 实例同一资产 → 渲染根仅 1 个 InstancedMesh、count=500，每实例矩阵与 transform 一致', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    const N = 500;
    for (let i = 0; i < N; i++) {
      pool.attach(makeModel(`model_${i}`, 'asset_tree', transformAt(i)));
    }
    await flush();

    // 池根仅 1 个渲染对象（而非 500 个 Group）；可渲染网格遍历计数同为 1
    expect(pool.root.children).toHaveLength(1);
    const mesh = pool.root.children[0];
    expect(mesh).toBeInstanceOf(THREE.InstancedMesh);
    expect((mesh as THREE.InstancedMesh).count).toBe(N);
    let renderables = 0;
    pool.root.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) renderables += 1;
    });
    expect(renderables).toBe(1);

    // 池根恒等变换 → 实例矩阵即世界矩阵；逐实例与 transform 组合结果一致
    const m = new THREE.Matrix4();
    for (let i = 0; i < N; i++) {
      (mesh as THREE.InstancedMesh).getMatrixAt(i, m);
      expect(m.equals(expectedMatrix(transformAt(i)))).toBe(true);
    }

    // 同资产源只取一次（模板缓存去重）
    expect(provider).toHaveBeenCalledTimes(1);
    pool.dispose();
  });

  it('不同 assetId 各自成池：2 资产 → 2 个 InstancedMesh，各自 count 正确', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 3; i++) pool.attach(makeModel(`tree_${i}`, 'asset_tree', transformAt(i)));
    for (let i = 0; i < 2; i++) pool.attach(makeModel(`lamp_${i}`, 'asset_lamp', transformAt(i + 100)));
    await flush();

    expect(pool.root.children).toHaveLength(2);
    const counts = pool.root.children.map((c) => (c as THREE.InstancedMesh).count).sort();
    expect(counts).toEqual([2, 3]);
    expect(provider).toHaveBeenCalledTimes(2);
    pool.dispose();
  });

  it('单实例退化为普通 Mesh；第二实例加入升级 InstancedMesh；回到单实例再退化', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    const tA = transformAt(0);
    const tB = transformAt(1);

    pool.attach(makeModel('a', 'asset_tree', tA));
    await flush();
    expect(pool.root.children).toHaveLength(1);
    const single = meshOf(pool);
    expect(single).toBeInstanceOf(THREE.Mesh);
    expect(single).not.toBeInstanceOf(THREE.InstancedMesh);
    expect(single.position.x).toBeCloseTo(tA.position.x);
    expect(single.position.z).toBeCloseTo(tA.position.z);
    expect(single.rotation.y).toBeCloseTo(tA.rotation.y);
    expect(single.scale.y).toBeCloseTo(tA.scale.y);

    pool.attach(makeModel('b', 'asset_tree', tB));
    expect(pool.root.children).toHaveLength(1);
    const instanced = meshOf(pool) as THREE.InstancedMesh;
    expect(instanced).toBeInstanceOf(THREE.InstancedMesh);
    expect(instanced.count).toBe(2);

    pool.detach('b');
    expect(pool.root.children).toHaveLength(1);
    const backToSingle = meshOf(pool);
    expect(backToSingle).toBeInstanceOf(THREE.Mesh);
    expect(backToSingle).not.toBeInstanceOf(THREE.InstancedMesh);
    expect(backToSingle.position.x).toBeCloseTo(tA.position.x);
    pool.dispose();
  });
});

describe('InstancedAssetPool：删除恢复与增量更新', () => {
  it('删除中间实例：其余实例矩阵不变、count 减一；重挂（undo 路径）后 count 与矩阵复原', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    const N = 5;
    for (let i = 0; i < N; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;
    expect(mesh.count).toBe(N);

    // 删除中间实例 m2（splice 语义：其后实例槽位前移，剩余 id → 槽 = [m0,m1,m3,m4]）
    pool.detach('m2');
    expect(mesh.count).toBe(N - 1);
    const remaining: ID[] = ['m0', 'm1', 'm3', 'm4'];
    const m = new THREE.Matrix4();
    remaining.forEach((id, slot) => {
      mesh.getMatrixAt(slot, m);
      expect(m.equals(expectedMatrix(transformAt(Number(id.slice(1)))))).toBe(true);
    });

    // undo 恢复（object:created → attach）：count 复原，各 id 矩阵与其 transform 一致
    pool.attach(makeModel('m2', 'asset_tree', transformAt(2)));
    expect(mesh.count).toBe(N);
    [...remaining, 'm2'].forEach((id, slot) => {
      mesh.getMatrixAt(slot, m);
      expect(m.equals(expectedMatrix(transformAt(Number(id.slice(1)))))).toBe(true);
    });
    pool.dispose();
  });

  it('500 规模删除中间实例：count=499，其余全部实例矩阵保持与其 transform 一致', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    const N = 500;
    for (let i = 0; i < N; i++) pool.attach(makeModel(`model_${i}`, 'asset_tree', transformAt(i)));
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;

    pool.detach('model_250');
    expect(mesh.count).toBe(N - 1);
    const m = new THREE.Matrix4();
    for (let i = 0; i < N; i++) {
      if (i === 250) continue;
      const slot = i < 250 ? i : i - 1;
      mesh.getMatrixAt(slot, m);
      expect(m.equals(expectedMatrix(transformAt(i)))).toBe(true);
    }
    pool.dispose();
  });

  it('更新单实例 transform 只写对应矩阵槽（setMatrixAt 恰好调用 1 次）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 3; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;

    const spy = vi.spyOn(mesh, 'setMatrixAt');
    const moved = transformAt(1);
    moved.position.x = 999;
    pool.update('m1', moved);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();

    const m = new THREE.Matrix4();
    mesh.getMatrixAt(1, m);
    expect(m.equals(expectedMatrix(moved))).toBe(true);
    // 相邻槽不受影响
    mesh.getMatrixAt(0, m);
    expect(m.equals(expectedMatrix(transformAt(0)))).toBe(true);
    mesh.getMatrixAt(2, m);
    expect(m.equals(expectedMatrix(transformAt(2)))).toBe(true);
    pool.dispose();
  });

  it('容量增长重建矩阵缓冲而非重建对象：InstancedMesh 实例引用稳定', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 3; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;
    expect(mesh.count).toBe(3);

    for (let i = 3; i < 9; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    expect(pool.root.children).toHaveLength(1);
    expect(pool.root.children[0]).toBe(mesh); // 同一对象，非重建
    expect(mesh.count).toBe(9);
    const m = new THREE.Matrix4();
    for (let i = 0; i < 9; i++) {
      mesh.getMatrixAt(i, m);
      expect(m.equals(expectedMatrix(transformAt(i)))).toBe(true);
    }
    pool.dispose();
  });

  it('重复 attach 同一 ModelObject 视为更新：count 不变、矩阵刷新', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 2; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;

    const moved = transformAt(0);
    moved.position.z = 777;
    pool.attach(makeModel('m0', 'asset_tree', moved));
    expect(mesh.count).toBe(2);
    const m = new THREE.Matrix4();
    mesh.getMatrixAt(0, m);
    expect(m.equals(expectedMatrix(moved))).toBe(true);
    pool.dispose();
  });
});

describe('InstancedAssetPool：可见性与降级', () => {
  it('隐藏实例 → 该槽零缩放矩阵（不渲染、不可拾取）；可见实例不受影响', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    pool.attach(makeModel('shown', 'asset_tree', transformAt(0)));
    pool.attach(makeModel('hidden', 'asset_tree', transformAt(1), false));
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;
    expect(mesh.count).toBe(2);

    const m = new THREE.Matrix4();
    mesh.getMatrixAt(0, m);
    expect(m.equals(expectedMatrix(transformAt(0)))).toBe(true);
    mesh.getMatrixAt(1, m);
    expect(m.equals(expectedMatrix(transformAt(1), false))).toBe(true);
    // 线性块（旋转×缩放）全零（±0 同为无宽度）→ 退化三角形不产生片元；平移保留
    for (const i of [0, 1, 2, 4, 5, 6, 8, 9, 10]) expect(Math.abs(m.elements[i])).toBe(0);
    expect(m.elements[12]).toBeCloseTo(transformAt(1).position.x);
    expect(m.elements[14]).toBeCloseTo(transformAt(1).position.z);
    pool.dispose();
  });

  it('单实例隐藏 → mesh.visible=false（单例退化路径的可见性）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    pool.attach(makeModel('only', 'asset_tree', transformAt(0), false));
    await flush();
    expect(meshOf(pool).visible).toBe(false);
    pool.update('only', transformAt(0), true);
    expect(meshOf(pool).visible).toBe(true);
    pool.dispose();
  });

  it('update 传入 visible 同步实例可见性；detach 未登记 id 安全（幂等）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 2; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;

    pool.update('m0', transformAt(0), false);
    const m = new THREE.Matrix4();
    mesh.getMatrixAt(0, m);
    expect(m.equals(expectedMatrix(transformAt(0), false))).toBe(true);

    expect(() => pool.update('ghost', transformAt(0))).not.toThrow();
    expect(() => pool.detach('ghost')).not.toThrow();
    expect(mesh.count).toBe(2);
    pool.dispose();
  });

  it('源加载失败：告警一次、渲染根保持空、登记的实例操作不崩', async () => {
    const provider: InstanceSourceProvider = vi.fn(() =>
      Promise.reject(new Error('GLB 404')),
    );
    const pool = new InstancedAssetPool({ provideSource: provider });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    pool.attach(makeModel('a', 'asset_tree', transformAt(0)));
    pool.attach(makeModel('b', 'asset_tree', transformAt(1)));
    await flush();

    expect(pool.root.children).toHaveLength(0);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(() => pool.update('a', transformAt(3))).not.toThrow();
    expect(() => pool.detach('a')).not.toThrow();
    expect(() => pool.attach(makeModel('c', 'asset_tree', transformAt(2)))).not.toThrow();
    expect(pool.root.children).toHaveLength(0);
    warn.mockRestore();
    pool.dispose();
  });
});

describe('InstancedAssetPool：anchor 与拾取反查', () => {
  it('attach 返回脱离渲染树的锚点：变换同步、不入场景统计；源就绪后挂共享 Mesh 子节点供包围盒取景', async () => {
    const { provider, sources } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    const t = transformAt(0);
    const anchor = pool.attach(makeModel('a', 'asset_tree', t));

    expect(anchor).toBeInstanceOf(THREE.Object3D);
    expect(pool.root.children).not.toContain(anchor);
    expect(anchor.position.x).toBeCloseTo(t.position.x);
    expect(anchor.rotation.y).toBeCloseTo(t.rotation.y);
    expect(anchor.scale.x).toBeCloseTo(t.scale.x);

    await flush();
    expect(pool.root.children).toHaveLength(1); // 只有 InstancedMesh
    expect(anchor.children).toHaveLength(1);
    const helper = anchor.children[0] as THREE.Mesh;
    expect(helper.isMesh).toBe(true);
    expect(helper.geometry).toBe(sources.get('asset_tree')!.geometry); // 共享模板几何
    pool.dispose();
  });

  it('update 同步锚点变换；detach 释放锚点', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    pool.attach(makeModel('a', 'asset_tree', transformAt(0)));
    pool.attach(makeModel('b', 'asset_tree', transformAt(1)));
    const anchorA = pool.attach(makeModel('a', 'asset_tree', transformAt(0))); // 幂等取同锚点
    const moved = transformAt(5);
    pool.update('a', moved);
    expect(anchorA.position.x).toBeCloseTo(moved.position.x);
    expect(anchorA.position.z).toBeCloseTo(moved.position.z);

    pool.detach('a');
    expect(anchorA.parent).toBeNull();
    pool.dispose();
  });

  it('resolvePick：InstancedMesh 命中 instanceId → 业务 id；越界/非池对象 → null', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 3; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;

    expect(pool.resolvePick(hitOf(mesh, 2))).toBe('m2');
    expect(pool.resolvePick(hitOf(mesh, 0))).toBe('m0');
    expect(pool.resolvePick(hitOf(mesh, 99))).toBeNull();
    expect(pool.resolvePick(hitOf(new THREE.Mesh(), 0))).toBeNull();
    pool.dispose();
  });

  it('同 id 换资产 → 迁移到新池：旧池 count 减一、新池 count 加一', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 2; i++) pool.attach(makeModel(`t${i}`, 'asset_tree', transformAt(i)));
    pool.attach(makeModel('l0', 'asset_lamp', transformAt(10)));
    await flush();
    expect(pool.root.children).toHaveLength(2);

    pool.attach(makeModel('t0', 'asset_lamp', transformAt(20))); // t0 换成路灯

    // tree 池只剩 t1 → 退化单例 Mesh；lamp 池 [l0, t0] → InstancedMesh count=2
    expect(pool.root.children).toHaveLength(2);
    const instancedChildren = pool.root.children.filter(
      (c) => (c as THREE.InstancedMesh).isInstancedMesh,
    );
    expect(instancedChildren).toHaveLength(1);
    const lampMesh = instancedChildren[0] as THREE.InstancedMesh;
    expect(lampMesh.count).toBe(2);
    expect(pool.resolvePick(hitOf(lampMesh, 1))).toBe('t0');
    pool.dispose();
  });
});

describe('InstancedAssetPool：生命周期', () => {
  it('dispose：清空渲染根；dispose 后 attach 不再渲染', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 2; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    expect(pool.root.children).toHaveLength(1);

    pool.dispose();
    expect(pool.root.children).toHaveLength(0);
    pool.attach(makeModel('later', 'asset_tree', transformAt(0)));
    await flush();
    expect(pool.root.children).toHaveLength(0);
  });
});

// ── T8.4 诊断分组（islands 孤岛高亮；Renderer 在 islands 切换时一次性调用） ──

/** 诊断分组的层号（与 runtime DIAG_LAYER 同值；测试自备避免向上耦合常量导出细节） */
const DIAG = 4;

/** 分类谓词工厂：brightIds 集合内的 id 归亮侧（未归类），其余暗侧 */
function classifyBy(brightIds: ID[]) {
  const bright = new Set(brightIds);
  return (id: ID) => !bright.has(id);
}

/** 池内全部渲染对象的层号集合 */
function layerMaskOf(obj: THREE.Object3D): number {
  return obj.layers.mask;
}

describe('InstancedAssetPool：诊断分组（T8.4 islands）', () => {
  it('纯暗侧池（全部已归类）：整网格保持 layer 0，不构造亮网格', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 3; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;

    pool.setDiagnosticGrouping(classifyBy([]), DIAG);
    expect(pool.root.children).toHaveLength(1); // 无第二网格
    expect(layerMaskOf(mesh)).toBe(1); // layer 0（暗侧）
    expect(mesh.count).toBe(3);
    pool.dispose();
  });

  it('纯亮侧池（全部未归类）：整网格换层到诊断层，仍单网格', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 3; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;

    pool.setDiagnosticGrouping(classifyBy(['m0', 'm1', 'm2']), DIAG);
    expect(pool.root.children).toHaveLength(1); // 纯一侧退化为整网格换层
    expect(layerMaskOf(mesh)).toBe(1 << DIAG);
    expect(mesh.count).toBe(3);
    pool.dispose();
  });

  it('混合池：临时构造第二个 InstancedMesh（共享 geometry/material），一暗一亮分层', async () => {
    const { provider, sources } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 4; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    const source = sources.get('asset_tree')!;
    const mesh = meshOf(pool) as THREE.InstancedMesh;

    // m1/m3 未归类（亮侧）；m0/m2 已归类（暗侧）
    pool.setDiagnosticGrouping(classifyBy(['m1', 'm3']), DIAG);
    expect(pool.root.children).toHaveLength(2);
    const [primary, brightMesh] = pool.root.children as [THREE.InstancedMesh, THREE.InstancedMesh];
    expect(primary).toBe(mesh); // 主网格对象稳定
    expect(brightMesh).toBeInstanceOf(THREE.InstancedMesh);
    // 一暗一亮分层
    expect(layerMaskOf(primary)).toBe(1);
    expect(layerMaskOf(brightMesh)).toBe(1 << DIAG);
    // 共享源资源（只重建矩阵缓冲，不克隆几何/材质）
    expect(brightMesh.geometry).toBe(source.geometry);
    expect(brightMesh.material).toBe(source.material);
    // 暗侧 2 + 亮侧 2
    expect(primary.count).toBe(2);
    expect(brightMesh.count).toBe(2);
    // 各实例矩阵与其 transform 一致（槽位 = 分组侧内顺序）
    const m = new THREE.Matrix4();
    primary.getMatrixAt(0, m);
    expect(m.equals(expectedMatrix(transformAt(0)))).toBe(true); // m0 暗侧槽 0
    primary.getMatrixAt(1, m);
    expect(m.equals(expectedMatrix(transformAt(2)))).toBe(true); // m2 暗侧槽 1
    brightMesh.getMatrixAt(0, m);
    expect(m.equals(expectedMatrix(transformAt(1)))).toBe(true); // m1 亮侧槽 0
    brightMesh.getMatrixAt(1, m);
    expect(m.equals(expectedMatrix(transformAt(3)))).toBe(true); // m3 亮侧槽 1
    pool.dispose();
  });

  it('混合池拾取反查：两网格命中各自槽位 → 业务 id（暗侧经分组槽位，非 entries 序）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 4; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();

    pool.setDiagnosticGrouping(classifyBy(['m1', 'm3']), DIAG);
    const [primary, brightMesh] = pool.root.children as [THREE.InstancedMesh, THREE.InstancedMesh];
    expect(pool.resolvePick(hitOf(primary, 0))).toBe('m0');
    expect(pool.resolvePick(hitOf(primary, 1))).toBe('m2');
    expect(pool.resolvePick(hitOf(brightMesh, 0))).toBe('m1');
    expect(pool.resolvePick(hitOf(brightMesh, 1))).toBe('m3');
    expect(pool.resolvePick(hitOf(primary, 9))).toBeNull();
    pool.dispose();
  });

  it('混合池增量更新：update 按归类写入对应网格槽（相邻槽互不污染）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 4; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    pool.setDiagnosticGrouping(classifyBy(['m1', 'm3']), DIAG);
    const [primary, brightMesh] = pool.root.children as [THREE.InstancedMesh, THREE.InstancedMesh];

    const movedBright = transformAt(1);
    movedBright.position.x = 999;
    pool.update('m1', movedBright); // 亮侧实例 → 亮网格槽
    const movedDim = transformAt(2);
    movedDim.position.z = 888;
    pool.update('m2', movedDim); // 暗侧实例 → 主网格槽

    const m = new THREE.Matrix4();
    brightMesh.getMatrixAt(0, m);
    expect(m.equals(expectedMatrix(movedBright))).toBe(true);
    primary.getMatrixAt(1, m);
    expect(m.equals(expectedMatrix(movedDim))).toBe(true);
    // 相邻槽不受影响
    brightMesh.getMatrixAt(1, m);
    expect(m.equals(expectedMatrix(transformAt(3)))).toBe(true);
    primary.getMatrixAt(0, m);
    expect(m.equals(expectedMatrix(transformAt(0)))).toBe(true);
    pool.dispose();
  });

  it('refreshDiagnostic：对象换层（layerId 键变更）后跨侧迁移，矩阵保持与其 transform 一致', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 4; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    // 初始亮侧 = m1/m3；m1 随后归层 → 迁入暗侧（Renderer 在 object:updated(layerId)
    // 后换活谓词分类结果并调用 refreshDiagnostic，此处模拟该序列）
    const brightIds = new Set<ID>(['m1', 'm3']);
    pool.setDiagnosticGrouping((id) => !brightIds.has(id), DIAG);
    brightIds.delete('m1'); // m1 归层：活谓词分类结果翻转
    pool.refreshDiagnostic('m1');

    const [primary, brightMesh] = pool.root.children as [THREE.InstancedMesh, THREE.InstancedMesh];
    expect(primary.count).toBe(3); // m0/m1/m2
    expect(brightMesh.count).toBe(1); // m3
    expect(pool.resolvePick(hitOf(primary, 1))).toBe('m1');
    const m = new THREE.Matrix4();
    primary.getMatrixAt(1, m);
    expect(m.equals(expectedMatrix(transformAt(1)))).toBe(true);
    brightMesh.getMatrixAt(0, m);
    expect(m.equals(expectedMatrix(transformAt(3)))).toBe(true);
    pool.dispose();
  });

  it('islands 激活期间成员增删：attach/detach 自动重算分组（新实例落正确侧）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    pool.attach(makeModel('m0', 'asset_tree', transformAt(0)));
    pool.attach(makeModel('m1', 'asset_tree', transformAt(1)));
    await flush();
    // 活谓词（Renderer 闭包 live 读 Scene）：分类随数据源变化
    const brightIds = new Set<ID>(['m1']);
    pool.setDiagnosticGrouping((id) => !brightIds.has(id), DIAG);
    let [primary, brightMesh] = pool.root.children as [THREE.InstancedMesh, THREE.InstancedMesh];
    expect(primary.count).toBe(1);
    expect(brightMesh.count).toBe(1);

    // 新增未归类实例 → 亮侧 +1
    brightIds.add('new1');
    pool.attach(makeModel('new1', 'asset_tree', transformAt(5)));
    [primary, brightMesh] = pool.root.children as [THREE.InstancedMesh, THREE.InstancedMesh];
    expect(brightMesh.count).toBe(2);
    expect(pool.resolvePick(hitOf(brightMesh, 1))).toBe('new1');

    // 删除唯一暗侧实例 → 池变纯亮侧 → 整网格换层（拆除第二网格）
    pool.detach('m0');
    expect(pool.root.children).toHaveLength(1);
    const unified = pool.root.children[0] as THREE.InstancedMesh;
    expect(layerMaskOf(unified)).toBe(1 << DIAG);
    expect(unified.count).toBe(2);
    expect(pool.resolvePick(hitOf(unified, 0))).toBe('m1');
    pool.dispose();
  });

  it('退出诊断分组：并回单网格、恢复 layer 0，矩阵与拾取反查复原', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 4; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    const meshBefore = meshOf(pool) as THREE.InstancedMesh;

    pool.setDiagnosticGrouping(classifyBy(['m1', 'm3']), DIAG);
    expect(pool.root.children).toHaveLength(2);

    pool.setDiagnosticGrouping(null, DIAG);
    expect(pool.root.children).toHaveLength(1); // 并回单网格
    const restored = pool.root.children[0] as THREE.InstancedMesh;
    expect(restored).toBe(meshBefore); // 主网格对象引用稳定
    expect(layerMaskOf(restored)).toBe(1); // 恢复 layer 0
    expect(restored.count).toBe(4);
    const m = new THREE.Matrix4();
    for (let i = 0; i < 4; i++) {
      restored.getMatrixAt(i, m);
      expect(m.equals(expectedMatrix(transformAt(i)))).toBe(true);
    }
    expect(pool.resolvePick(hitOf(restored, 2))).toBe('m2');
    pool.dispose();
  });

  it('单实例退化路径：singleMesh 按唯一实例归类整网格换层；退出恢复', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    pool.attach(makeModel('only', 'asset_tree', transformAt(0)));
    await flush();
    const single = meshOf(pool);
    expect(layerMaskOf(single)).toBe(1);

    pool.setDiagnosticGrouping(classifyBy(['only']), DIAG); // 未归类 → 亮侧
    expect(pool.root.children).toHaveLength(1);
    expect(layerMaskOf(meshOf(pool))).toBe(1 << DIAG);

    pool.setDiagnosticGrouping(null, DIAG);
    expect(layerMaskOf(meshOf(pool))).toBe(1);
    pool.dispose();
  });

  it('dispose 于分组激活期间：亮网格一并拆除（渲染根清空）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 4; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    pool.setDiagnosticGrouping(classifyBy(['m1', 'm3']), DIAG);
    expect(pool.root.children).toHaveLength(2);

    pool.dispose();
    expect(pool.root.children).toHaveLength(0);
  });
});

// ── T002.3 实例颜色（烘焙式变体 hue 微差；源无关颜色槽——只吃 id + 颜色）──

/** 取槽位颜色（无缓冲 = 白恒等；getColorAt 同款语义） */
function colorAt(mesh: THREE.InstancedMesh, slot: number): THREE.Color {
  const color = new THREE.Color();
  mesh.getColorAt(slot, color);
  return color;
}

describe('InstancedAssetPool：实例颜色（T002.3）', () => {
  it('setColor 写入对应槽 instanceColor；未设色实例写白恒等乘子；缓冲容量对齐矩阵缓冲', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 3; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;

    expect(mesh.instanceColor).toBeNull(); // 未设色前零开销（GLB 池行为零变化）
    pool.setColor('m1', new THREE.Color(1, 0.25, 0.5));

    expect(mesh.instanceColor).not.toBeNull();
    expect(mesh.instanceColor!.count).toBe(mesh.instanceMatrix.count); // 容量对齐（防越界静默丢失）
    expect(colorAt(mesh, 0).equals(new THREE.Color(1, 1, 1))).toBe(true); // 未设色 → 白
    expect(colorAt(mesh, 1).equals(new THREE.Color(1, 0.25, 0.5))).toBe(true);
    expect(colorAt(mesh, 2).equals(new THREE.Color(1, 1, 1))).toBe(true);
    pool.dispose();
  });

  it('无任何颜色的池永不建 instanceColor（行为零变化）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 3; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    pool.detach('m0'); // 成员增删路径也不建
    await flush();
    expect((meshOf(pool) as THREE.InstancedMesh).instanceColor).toBeNull();
    pool.dispose();
  });

  it('成员增删槽位迁移：颜色随 entries 前移（splice 后槽-色对齐）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 3; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;
    const red = new THREE.Color(1, 0.25, 0.5);
    const blue = new THREE.Color(0.25, 0.5, 1);
    pool.setColor('m1', red);
    pool.setColor('m2', blue);

    pool.detach('m0'); // m1/m2 前移到槽 0/1，颜色随槽迁移
    expect(mesh.count).toBe(2);
    expect(colorAt(mesh, 0).equals(red)).toBe(true);
    expect(colorAt(mesh, 1).equals(blue)).toBe(true);

    pool.attach(makeModel('m2b', 'asset_tree', transformAt(9))); // 新实例无色 → 白
    expect(colorAt(mesh, 2).equals(new THREE.Color(1, 1, 1))).toBe(true);
    pool.dispose();
  });

  it('clearColor 回白恒等乘子（缓冲保留不拆）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 2; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;
    pool.setColor('m0', new THREE.Color(1, 0.25, 0.5));
    pool.clearColor('m0');

    expect(mesh.instanceColor).not.toBeNull();
    expect(colorAt(mesh, 0).equals(new THREE.Color(1, 1, 1))).toBe(true);
    pool.clearColor('m0'); // 幂等
    expect(colorAt(mesh, 0).equals(new THREE.Color(1, 1, 1))).toBe(true);
    pool.dispose();
  });

  it('扩容换矩阵缓冲时 instanceColor 同步重建：既有颜色随槽保留', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 3; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;
    const capacityBefore = mesh.instanceMatrix.count;
    const red = new THREE.Color(1, 0.25, 0.5);
    pool.setColor('m1', red);
    expect(mesh.instanceColor!.count).toBe(capacityBefore);

    for (let i = 3; i < 9; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i))); // 4 → 16 扩容
    expect(mesh.count).toBe(9);
    expect(mesh.instanceColor).not.toBeNull();
    expect(mesh.instanceColor!.count).toBe(mesh.instanceMatrix.count); // 同容量重建（越界坑）
    expect(colorAt(mesh, 1).equals(red)).toBe(true); // 既有颜色保留在正确槽
    for (let i = 0; i < 9; i++) {
      if (i === 1) continue;
      expect(colorAt(mesh, i).equals(new THREE.Color(1, 1, 1))).toBe(true);
    }
    pool.dispose();
  });

  it('单实例退化 Mesh 不带色；回到 ≥2 实例化后 entry 颜色生效（微差自第 2 枚可见）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    pool.attach(makeModel('a', 'asset_tree', transformAt(0)));
    await flush();
    const single = meshOf(pool);
    pool.setColor('a', new THREE.Color(1, 0.25, 0.5)); // 单例路径：只登记 entry
    expect((single as THREE.InstancedMesh).instanceColor).toBeUndefined(); // 普通 Mesh 无该槽

    pool.attach(makeModel('b', 'asset_tree', transformAt(1))); // 升级 InstancedMesh
    const mesh = meshOf(pool) as THREE.InstancedMesh;
    expect(colorAt(mesh, 0).equals(new THREE.Color(1, 0.25, 0.5))).toBe(true); // 登记色落地
    expect(colorAt(mesh, 1).equals(new THREE.Color(1, 1, 1))).toBe(true);
    pool.dispose();
  });

  it('update 变换不扰动颜色（增量路径只写矩阵槽）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 3; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;
    const red = new THREE.Color(1, 0.25, 0.5);
    pool.setColor('m1', red);

    const moved = transformAt(1);
    moved.position.x = 999;
    pool.update('m1', moved);
    expect(colorAt(mesh, 1).equals(red)).toBe(true);
    const m = new THREE.Matrix4();
    mesh.getMatrixAt(1, m);
    expect(m.equals(expectedMatrix(moved))).toBe(true);
    pool.dispose();
  });

  it('诊断分组两网格颜色随槽位一致（混合拆分态 setColor 按侧路由）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 4; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();
    const red = new THREE.Color(1, 0.25, 0.5);
    const blue = new THREE.Color(0.25, 0.5, 1);

    pool.setDiagnosticGrouping(classifyBy(['m1', 'm3']), DIAG); // m1/m3 亮侧
    const [primary, brightMesh] = pool.root.children as [THREE.InstancedMesh, THREE.InstancedMesh];

    expect(primary.instanceColor).toBeNull(); // 暗侧无色 → 亮侧网格外的缓冲不建
    pool.setColor('m1', red); // 亮侧实例 → 亮网格槽 0
    pool.setColor('m3', blue); // 亮侧实例 → 亮网格槽 1
    pool.setColor('m0', red); // 暗侧实例 → 主网格槽 0

    expect(colorAt(brightMesh, 0).equals(red)).toBe(true);
    expect(colorAt(brightMesh, 1).equals(blue)).toBe(true);
    expect(primary.instanceColor).not.toBeNull();
    expect(colorAt(primary, 0).equals(red)).toBe(true);
    expect(colorAt(primary, 1).equals(new THREE.Color(1, 1, 1))).toBe(true); // m2 未设色

    // 退出分组并回单网格：颜色按 entries 序 [m0, m1, m2, m3] = [red, red, 白, blue] 复原
    pool.setDiagnosticGrouping(null, DIAG);
    const unified = pool.root.children[0] as THREE.InstancedMesh;
    expect(colorAt(unified, 0).equals(red)).toBe(true);
    expect(colorAt(unified, 1).equals(red)).toBe(true);
    expect(colorAt(unified, 2).equals(new THREE.Color(1, 1, 1))).toBe(true);
    expect(colorAt(unified, 3).equals(blue)).toBe(true);
    pool.dispose();
  });
});

// ── T008.1 池键分桶（sourceKey）与 aSeed 逐实例属性（D19.4 / D19.7）──────────

/** 槽路由池键模拟：seed % 4 为槽（模拟 domain shapeSlotOf 的分桶语义，隔离单测不引 meta） */
function slotPoolKey(assetId: string, seed?: number): string {
  return seed === undefined ? assetId : `${assetId}:slot-${seed % 4}`;
}

/** 取桶几何上的 aSeed 缓冲（无则 null） */
function seedAttrOf(mesh: THREE.InstancedMesh): THREE.InstancedBufferAttribute | null {
  const attr = mesh.geometry.getAttribute('aSeed');
  return attr instanceof THREE.InstancedBufferAttribute ? attr : null;
}

/** 期望 aSeed 值过一遍 float32 舍入（缓冲为 Float32Array——与矩阵期望值同惯例精确比较） */
function f32Seed(seed: number): number {
  return Float32Array.of(aSeedValueOf(seed))[0];
}

describe('InstancedAssetPool：池键分桶（resolvePoolKey 注入）', () => {
  it('同 sourceKey 多实例一个桶；同 assetId 不同槽 → 不同桶（各自源加载）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider, resolvePoolKey: slotPoolKey });
    // seed 0 与 4 → 同槽 0 → 同桶
    pool.attach(makeModel('a', 'asset_tree', transformAt(0), true, 0));
    pool.attach(makeModel('b', 'asset_tree', transformAt(1), true, 4));
    await flush();
    expect(pool.root.children).toHaveLength(1);
    expect(provider).toHaveBeenCalledTimes(1);
    expect(provider).toHaveBeenNthCalledWith(1, 'asset_tree', 0);

    // seed 1 → 槽 1 → 新桶
    pool.attach(makeModel('c', 'asset_tree', transformAt(2), true, 1));
    await flush();
    expect(pool.root.children).toHaveLength(2);
    expect(provider).toHaveBeenCalledTimes(2);
    expect(provider).toHaveBeenNthCalledWith(2, 'asset_tree', 1);
    const counts = pool.root.children.map((c) => (c as THREE.InstancedMesh).count).sort();
    expect(counts).toEqual([1, 2]);
    pool.dispose();
  });

  it('同 id 重掷 seed 换槽 → 跨池迁移（旧桶成员减一，新桶成员加一）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider, resolvePoolKey: slotPoolKey });
    pool.attach(makeModel('a', 'asset_tree', transformAt(0), true, 0));
    pool.attach(makeModel('b', 'asset_tree', transformAt(1), true, 4));
    await flush();
    expect(pool.root.children).toHaveLength(1);
    const before = pool.root.children[0] as THREE.InstancedMesh;

    // a 重掷为 seed 1（槽 1，异桶）→ 迁移
    pool.attach(makeModel('a', 'asset_tree', transformAt(5), true, 1));
    await flush();
    expect(pool.root.children).toHaveLength(2);
    expect(before.count).toBe(1); // 旧桶只剩 b
    const sorted = pool.root.children.map((c) => (c as THREE.InstancedMesh).count).sort();
    expect(sorted).toEqual([1, 1]);
    pool.dispose();
  });

  it('无 seed 调用（散布式）走缺省 assetId 池键路径（resolvePoolKey 收到 undefined）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider, resolvePoolKey: slotPoolKey });
    pool.attach(makeModel('a', 'asset_tree', transformAt(0)));
    await flush();
    expect(provider).toHaveBeenNthCalledWith(1, 'asset_tree', undefined);
    pool.dispose();
  });
});

describe('InstancedAssetPool：aSeed 逐实例属性（D19.7）', () => {
  it('带 seed 的桶：aSeed InstancedBufferAttribute 逐槽写 aSeedValueOf、容量对齐 instanceMatrix', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    pool.attach(makeModel('a', 'asset_tree', transformAt(0), true, 1001));
    pool.attach(makeModel('b', 'asset_tree', transformAt(1), true, 2002));
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;
    const attr = seedAttrOf(mesh);
    expect(attr).not.toBeNull();
    expect(attr!.itemSize).toBe(1);
    expect(attr!.count).toBe(mesh.instanceMatrix.count);
    expect(attr!.array[0]).toBe(f32Seed(1001));
    expect(attr!.array[1]).toBe(f32Seed(2002));
    pool.dispose();
  });

  it('无任何 seed 的池零开销：不建 aSeed 缓冲（GLB/旧资产行为零变化）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    pool.attach(makeModel('a', 'asset_tree', transformAt(0)));
    pool.attach(makeModel('b', 'asset_tree', transformAt(1)));
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;
    expect(seedAttrOf(mesh)).toBeNull();
    pool.dispose();
  });

  it('混合桶：seed 缺失槽写 0.5 域中点中性值', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    pool.attach(makeModel('a', 'asset_tree', transformAt(0), true, 42)); // 槽 0 带 seed
    pool.attach(makeModel('b', 'asset_tree', transformAt(1))); // 槽 1 无 seed
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;
    const attr = seedAttrOf(mesh)!;
    expect(attr.array[0]).toBe(f32Seed(42));
    expect(attr.array[1]).toBe(0.5);
    pool.dispose();
  });

  it('扩容保留旧值：aSeed 随 instanceMatrix 容量重建，先写槽位逐位不变', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 4; i++) {
      pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i), true, 100 + i));
    }
    await flush();
    const mesh = meshOf(pool) as THREE.InstancedMesh;
    const before = Array.from(seedAttrOf(mesh)!.array.slice(0, 4));
    expect(mesh.instanceMatrix.count).toBe(4);

    pool.attach(makeModel('m9', 'asset_tree', transformAt(9), true, 999)); // 5 实例 → 扩容 8
    await flush();
    const attr = seedAttrOf(mesh)!;
    expect(mesh.instanceMatrix.count).toBe(8);
    expect(attr.count).toBe(8); // 容量对齐重建
    const after = Array.from(attr.array.slice(0, 4));
    expect(after).toEqual(before); // 旧值保留
    expect(attr.array[4]).toBe(f32Seed(999));
    pool.dispose();
  });

  it('成员增删全量重写：detach 中间实例后 aSeed 随槽位前移', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 3; i++) {
      pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i), true, 10 + i));
    }
    await flush();
    pool.detach('m1'); // 中间槽
    const mesh = meshOf(pool) as THREE.InstancedMesh;
    const attr = seedAttrOf(mesh)!;
    expect(mesh.count).toBe(2);
    expect(attr.array[0]).toBe(f32Seed(10));
    expect(attr.array[1]).toBe(f32Seed(12)); // m2 前移到槽 1
    pool.dispose();
  });

  it('带 seed 的池单实例仍走 InstancedMesh（D19.7 单实例退化规则修订）；无 seed 池保持单例 Mesh', async () => {
    const { provider } = makeProvider();
    const seeded = new InstancedAssetPool({ provideSource: provider });
    seeded.attach(makeModel('only', 'asset_tree', transformAt(0), true, 7));
    await flush();
    expect(seeded.root.children[0]).toBeInstanceOf(THREE.InstancedMesh);
    expect(seedAttrOf(seeded.root.children[0] as THREE.InstancedMesh)).not.toBeNull();
    seeded.dispose();

    const plain = new InstancedAssetPool({ provideSource: provider });
    plain.attach(makeModel('only', 'asset_tree', transformAt(0)));
    await flush();
    expect(plain.root.children[0]).toBeInstanceOf(THREE.Mesh);
    expect(plain.root.children[0]).not.toBeInstanceOf(THREE.InstancedMesh);
    plain.dispose();
  });

  it('诊断分组 split 两侧与拆除恢复：aSeed 不抛错，拆除后按 entries 序全量重写（颜色同路）', async () => {
    const { provider } = makeProvider();
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 4; i++) {
      pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i), true, 10 + i));
    }
    await flush();
    const red = new THREE.Color(1, 0.25, 0.5);

    pool.setDiagnosticGrouping(classifyBy(['m1', 'm3']), DIAG); // m1/m3 亮侧（split）
    expect(pool.root.children).toHaveLength(2); // 主网格 + 亮网格，不抛错
    const [, brightMesh] = pool.root.children as [THREE.InstancedMesh, THREE.InstancedMesh];
    pool.setColor('m1', red); // split 态单槽写：亮侧网格
    expect(colorAt(brightMesh, 0).equals(red)).toBe(true);

    // 拆除分组：矩阵/颜色/aSeed 按 entries 序全量复原
    pool.setDiagnosticGrouping(null, DIAG);
    expect(pool.root.children).toHaveLength(1);
    const unified = pool.root.children[0] as THREE.InstancedMesh;
    expect(colorAt(unified, 1).equals(red)).toBe(true);
    const attr = seedAttrOf(unified)!;
    for (let i = 0; i < 4; i++) expect(attr.array[i]).toBe(f32Seed(10 + i));
    pool.dispose();
  });
});

// ── T009.5 customDepthMaterial（影 pass 深度材质通道——源所有，池只挂引用） ──

describe('InstancedAssetPool：customDepthMaterial 挂载（T009.5）', () => {
  /** 带（deep=true）/不带深度材质的 fake 源提供者（同 assetId 共享一份源——模拟缓存去重） */
  function makeDepthProvider(withDepth: boolean) {
    const depth = withDepth ? new THREE.MeshDepthMaterial() : undefined;
    const source: InstanceSource = {
      geometry: new THREE.BoxGeometry(1, 2, 1),
      material: new THREE.MeshStandardMaterial({ color: 0x2e8b57 }),
      ...(depth !== undefined ? { customDepthMaterial: depth } : {}),
    };
    return {
      provider: vi.fn(async (): Promise<InstanceSource> => source),
      source,
      depth,
    };
  }

  it('源带 customDepthMaterial：三个建网格点挂载同一引用（singleMesh → instancedMesh → 诊断亮网格）', async () => {
    const { provider, source, depth } = makeDepthProvider(true);
    const pool = new InstancedAssetPool({ provideSource: provider });

    // 单实例退化 Mesh（无 seed 路径）
    pool.attach(makeModel('only', 'asset_tree', transformAt(0)));
    await flush();
    const single = meshOf(pool) as THREE.Mesh;
    expect(single.customDepthMaterial).toBe(depth);
    expect(single.customDepthMaterial).toBe(source.customDepthMaterial); // 源字段同一引用

    // 升级 InstancedMesh
    pool.attach(makeModel('b', 'asset_tree', transformAt(1)));
    const instanced = meshOf(pool) as THREE.InstancedMesh;
    expect(instanced).toBeInstanceOf(THREE.InstancedMesh);
    expect(instanced.customDepthMaterial).toBe(depth);

    // 诊断混合拆分：亮网格同待遇挂载
    pool.setDiagnosticGrouping(classifyBy(['b']), DIAG);
    const [primary, brightMesh] = pool.root.children as [THREE.InstancedMesh, THREE.InstancedMesh];
    expect(primary.customDepthMaterial).toBe(depth);
    expect(brightMesh.customDepthMaterial).toBe(depth);
    pool.dispose();
  });

  it('源不带 customDepthMaterial：建网格点不赋值（undefined 保持 three 缺省——GLB/旧资产零变化）', async () => {
    const { provider } = makeDepthProvider(false);
    const pool = new InstancedAssetPool({ provideSource: provider });
    pool.attach(makeModel('a', 'asset_tree', transformAt(0)));
    pool.attach(makeModel('b', 'asset_tree', transformAt(1)));
    await flush();
    expect((meshOf(pool) as THREE.InstancedMesh).customDepthMaterial).toBeUndefined();

    // 诊断拆分亮网格同样不赋值
    pool.setDiagnosticGrouping(classifyBy(['b']), DIAG);
    const [, brightMesh] = pool.root.children as [THREE.InstancedMesh, THREE.InstancedMesh];
    expect(brightMesh.customDepthMaterial).toBeUndefined();
    pool.dispose();
  });

  it('锚点补挂 Mesh 不挂深度材质（不进场景仅包围盒——T009.5 任务边界排除）', async () => {
    const { provider } = makeDepthProvider(true);
    const pool = new InstancedAssetPool({ provideSource: provider });
    const anchor = pool.attach(makeModel('a', 'asset_tree', transformAt(0)));
    await flush();
    expect(anchor.children).toHaveLength(1);
    const helper = anchor.children[0] as THREE.Mesh;
    expect(helper.isMesh).toBe(true);
    expect(helper.customDepthMaterial).toBeUndefined();
    pool.dispose();
  });

  it('池 dispose/拆池/拆分均不 dispose 深度材质（源所有权——池只挂引用的反向断言）', async () => {
    const { provider, depth } = makeDepthProvider(true);
    const depthDispose = vi.spyOn(depth!, 'dispose');
    const pool = new InstancedAssetPool({ provideSource: provider });
    for (let i = 0; i < 4; i++) pool.attach(makeModel(`m${i}`, 'asset_tree', transformAt(i)));
    await flush();

    // 拆分建亮网格 → 拆除分组（teardownSplit 释放矩阵缓冲不触深度材质）
    pool.setDiagnosticGrouping(classifyBy(['m1', 'm3']), DIAG);
    pool.setDiagnosticGrouping(null, DIAG);
    // 拆池（detach 清空成员 → teardownPool）→ 整池 dispose
    for (let i = 0; i < 4; i++) pool.detach(`m${i}`);
    pool.dispose();
    expect(depthDispose).not.toHaveBeenCalled(); // 深度材质归源所有，池任何生命周期点不释放
    depthDispose.mockRestore();
  });
});
