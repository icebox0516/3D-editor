/**
 * tests/runtime/procedural/tree/tree3aStage.test.ts —— window.__tree3a DEV 出图面句柄测试（T008.2）。
 *
 * 覆盖（零 WebGL——裸 THREE.Scene + 结构桩相机/控制；window 槽装配归 bootstrap 组合根）：
 * - mount/unmount：group 挂 scene 兄弟层（scene.children 增减）+ stats 账目（皮/叶面数与
 *   叶卡数 = 资产恒定值）+ 幂等（重复 mount 同位重建、unmount 空挂安全）；
 * - dispose：幂等；unmount 后资源已 dispose（stats 归零、group 摘除）；
 * - view：结构桩相机/控制——position 按球坐标落位、target 置树心、update 被调；
 * - StrictMode 双挂载安全：同 scene 两句柄，先卸 A 不拆 B 的挂载（dispose 只摘自己的）；
 * - turntable(0)：无 rAF 环境安全（node 测试环境无 requestAnimationFrame）；
 * - T008.3 mountWindDemo：InstancedMesh ×N 一排 + aSeed InstancedBufferAttribute 值互异
 *   ∈[0,1) + 间距 8m + castShadow/customDepthMaterial（叶影裁切）；与 mount 互斥重建、
 *   unmount/dispose 幂等清理；freezeTime/unfreezeTime 转调注入 time deps（未注入 no-op）。
 * - T009.3 mountSlots：8 槽 4×2 行主序网格独立 Mesh（跨槽几何各异——非 InstancedMesh）+
 *   castShadow/customDepthMaterial；stats 逐槽账目（皮面数槽间恒等 20724 = 拓扑不变量、
 *   顶层合计 8×；叶卡数只断言 > 0——形态向量表未落地时槽间可同，不锁具体值）；
 *   viewSlots 网格中心机位（球坐标公式复算）+ viewSlot(5) 槽位特写 + 越界 warn no-op；
 *   与 mount/mountWindDemo 互斥重建、unmount/dispose 幂等（slots 模式 stats 归零）。
 *   （8 棵 build 耗时长——相关测试 60000ms）
 */
import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { createTree3aHandle } from '../../../../src/runtime/procedural/tree/tree3aStage';

/** 结构桩控制目标（对 OrbitControls 的 target/update 结构依赖） */
function makeControlsStub() {
  const stub = {
    target: new THREE.Vector3(),
    updates: 0,
    update() {
      stub.updates += 1;
    },
  };
  return stub;
}

describe('mount / unmount / stats', () => {
  it('mount：group 挂 scene + stats 账目 = slot-0 锚点实数（皮 20724 / 叶 14334 / 7167 卡，T009.2 枝梢驱动叶簇后）', () => {
    const scene = new THREE.Scene();
    const handle = createTree3aHandle({ scene });
    handle.mount();
    expect(scene.children).toHaveLength(1);
    const stats = handle.stats();
    expect(stats.mounted).toBe(true);
    expect(stats.barkTriangles).toBe(20724);
    expect(stats.leafTriangles).toBe(14334);
    expect(stats.leafCards).toBe(7167);
    handle.dispose();
    expect(scene.children).toHaveLength(0);
  });

  it('mount 落点偏移生效（x/z 透传 group.position）；重复 mount 同位重建不泄漏 group', () => {
    const scene = new THREE.Scene();
    const handle = createTree3aHandle({ scene });
    handle.mount({ x: 5, z: -3 });
    handle.mount({ x: 5, z: -3 });
    expect(scene.children).toHaveLength(1);
    expect(scene.children[0]!.position.x).toBe(5);
    expect(scene.children[0]!.position.z).toBe(-3);
    handle.dispose();
  });

  it('unmount/dispose：幂等且 stats 归零（资源已随摘除释放——geometry dispose 幂等无害）', () => {
    const scene = new THREE.Scene();
    const handle = createTree3aHandle({ scene });
    handle.mount();
    handle.unmount();
    handle.unmount(); // 幂等
    expect(() => handle.dispose()).not.toThrow(); // dispose 幂等
    const stats = handle.stats();
    expect(stats.mounted).toBe(false);
    expect(stats.barkTriangles).toBe(0);
    expect(scene.children).toHaveLength(0);
  });
});

describe('view 取景（结构桩相机/控制）', () => {
  it('view：相机球坐标落位 + target 置树心 + update 被调', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const controls = makeControlsStub();
    const handle = createTree3aHandle({ scene, camera, controls });
    handle.mount({ x: 2, z: 4 });
    handle.view({ distance: 30, azimuthDeg: 0, elevationDeg: 0 });
    // az 0°/el 0°：正 +X 方向距离 30，视心高 ≈3.6（锚点树半高）
    expect(camera.position.x).toBeCloseTo(32, 5);
    expect(camera.position.y).toBeCloseTo(3.6, 5);
    expect(camera.position.z).toBeCloseTo(4, 5);
    expect(controls.target.x).toBe(2);
    expect(controls.target.z).toBe(4);
    expect(controls.updates).toBe(1);
    handle.dispose();
  });
});

describe('StrictMode 双挂载安全（dispose 只摘自己的）', () => {
  it('同 scene 两句柄：dispose(A) 后 B 仍挂载', () => {
    const scene = new THREE.Scene();
    const a = createTree3aHandle({ scene });
    const b = createTree3aHandle({ scene });
    a.mount();
    b.mount({ x: 10 });
    a.dispose();
    expect(scene.children).toHaveLength(1);
    expect(scene.children[0]!.position.x).toBe(10); // B 的树还在
    const stats = b.stats();
    expect(stats.mounted).toBe(true);
    expect(stats.leafCards).toBe(7167);
    b.dispose();
    expect(scene.children).toHaveLength(0);
  });
});

describe('turntable（无 rAF 环境安全）', () => {
  it('turntable(0)/turntable(正) 在无 requestAnimationFrame 的测试环境不抛错', () => {
    const scene = new THREE.Scene();
    const handle = createTree3aHandle({ scene });
    handle.mount();
    expect(() => handle.turntable(0)).not.toThrow();
    expect(() => handle.turntable(0.5)).not.toThrow();
    handle.dispose();
  });
});

describe('mountWindDemo / freezeTime（T008.3 风动验收载体）', () => {
  it('默认 3 实例 InstancedMesh 一排：aSeed InstancedBufferAttribute 值互异 ∈[0,1)；间距 8m；customDepthMaterial 叶影裁切', () => {
    const scene = new THREE.Scene();
    const handle = createTree3aHandle({ scene });
    handle.mountWindDemo();
    expect(scene.children).toHaveLength(1);
    expect(scene.children[0]!.name).toBe('tree3a-dev-wind');
    const mesh = scene.children[0]!.children[0] as THREE.InstancedMesh;
    expect(mesh.isInstancedMesh).toBe(true);
    expect(mesh.count).toBe(3);
    expect(mesh.castShadow).toBe(true); // 风动取证含树影
    expect(mesh.customDepthMaterial).toBeDefined(); // 叶影 SDF 裁切（舞台自持 Mesh 挂载点）
    const aSeed = mesh.geometry.getAttribute('aSeed') as THREE.InstancedBufferAttribute;
    expect(aSeed).toBeInstanceOf(THREE.InstancedBufferAttribute);
    expect(aSeed.itemSize).toBe(1);
    const seeds = Array.from(aSeed.array as Float32Array);
    expect(new Set(seeds).size).toBe(3); // 同槽树相位互异——「不同相位摆动」验收前提
    for (const seed of seeds) {
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(seed).toBeLessThan(1);
    }
    const m0 = new THREE.Matrix4();
    const m1 = new THREE.Matrix4();
    mesh.getMatrixAt(0, m0);
    mesh.getMatrixAt(1, m1);
    expect(m1.elements[12] - m0.elements[12]).toBeCloseTo(8, 5); // 间距 8m 一排
    expect(handle.stats().mounted).toBe(true); // 风动演示也计入挂载态
    handle.dispose();
    expect(scene.children).toHaveLength(0);
  }, 30000);

  it('mountWindDemo(count) 自定义实例数；与 mount 互斥（重建先摘）；unmount 清理幂等', () => {
    const scene = new THREE.Scene();
    const handle = createTree3aHandle({ scene });
    handle.mountWindDemo(5);
    let mesh = scene.children[0]!.children[0] as THREE.InstancedMesh;
    expect(mesh.count).toBe(5);
    const seeds = Array.from((mesh.geometry.getAttribute('aSeed') as THREE.InstancedBufferAttribute).array as Float32Array);
    expect(new Set(seeds).size).toBe(5); // 黄金角续接仍互异
    handle.mount(); // 互斥：mount 先摘风动演示
    expect(scene.children).toHaveLength(1);
    expect(scene.children[0]!.name).toBe('tree3a-dev-stage');
    expect((scene.children[0]!.children[0] as THREE.Mesh).geometry.hasAttribute('aSeed')).toBe(false); // 单树普通 Mesh 无 aSeed（缺省属性 0 路径）
    handle.mountWindDemo(3);
    mesh = scene.children[0]!.children[0] as THREE.InstancedMesh;
    expect(mesh.count).toBe(3);
    handle.unmount();
    handle.unmount(); // 幂等
    handle.dispose(); // 幂等
    expect(scene.children).toHaveLength(0);
    expect(handle.stats().mounted).toBe(false);
    expect(handle.stats().leafCards).toBe(0);
  }, 60000);

  it('freezeTime/unfreezeTime 转调注入 time deps；未注入 no-op 不抛', () => {
    const calls: string[] = [];
    const handle = createTree3aHandle({
      scene: new THREE.Scene(),
      time: { freeze: () => calls.push('freeze'), unfreeze: () => calls.push('unfreeze') },
    });
    handle.freezeTime();
    handle.unfreezeTime();
    expect(calls).toEqual(['freeze', 'unfreeze']);
    const bare = createTree3aHandle({ scene: new THREE.Scene() });
    expect(() => bare.freezeTime()).not.toThrow(); // deps.time 缺省 no-op（测试/独立使用安全）
    expect(() => bare.unfreezeTime()).not.toThrow();
  });
});

describe('mountSlots / viewSlots / viewSlot（T009.3 8 槽批量出图面）', () => {
  it('mountSlots：tree3a-dev-slots 组内 8 独立 Mesh 4×2 行主序网格（spacing 11）；castShadow + customDepthMaterial 与单树同待遇；转台对 slots 组无 rAF 安全', () => {
    const scene = new THREE.Scene();
    const handle = createTree3aHandle({ scene });
    handle.mountSlots();
    expect(scene.children).toHaveLength(1);
    const group = scene.children[0]!;
    expect(group.name).toBe('tree3a-dev-slots');
    expect(group.children).toHaveLength(8);
    const meshes = group.children as THREE.Mesh[];
    // 行主序 4×2（缺省 spacing 11）：col=i%4 定 x=(col−1.5)×11、row=floor(i/4) 定 z=row×11
    for (let slot = 0; slot < 8; slot++) {
      const mesh = meshes[slot]!;
      expect(mesh.position.x).toBeCloseTo(((slot % 4) - 1.5) * 11, 5);
      expect(mesh.position.z).toBeCloseTo(Math.floor(slot / 4) * 11, 5);
      expect(mesh.castShadow).toBe(true); // 批量取证含树影
      expect(mesh.customDepthMaterial).toBeDefined(); // 逐槽叶影 SDF 裁切
      expect(mesh).toBeInstanceOf(THREE.Mesh); // 跨槽几何各异——独立 Mesh
      expect(mesh).not.toBeInstanceOf(THREE.InstancedMesh);
    }
    // 锚点槽位抽查（任务书口径）：slot 0 (−16.5, 0) / slot 3 (16.5, 0) / slot 7 (16.5, 11)
    expect(meshes[0]!.position.x).toBeCloseTo(-1.5 * 11, 5);
    expect(meshes[3]!.position.x).toBeCloseTo(1.5 * 11, 5);
    expect(meshes[7]!.position.x).toBeCloseTo(1.5 * 11, 5);
    expect(meshes[7]!.position.z).toBeCloseTo(11, 5);
    expect(new Set(meshes.map((m) => m.geometry)).size).toBe(8); // 8 份独立几何（build 契约每次 new）
    expect(() => handle.turntable(0.5)).not.toThrow(); // 转台目标含 slots 组（无 rAF 环境安全）
    handle.dispose();
    expect(scene.children).toHaveLength(0);
  }, 60000);

  it('stats（slots 模式）：8 项逐槽账目，皮面数槽间恒等 20724（拓扑不变量）+ 顶层合计 8×；叶卡数只断言 > 0（向量表未落地槽间可同——不锁具体值）', () => {
    const scene = new THREE.Scene();
    const handle = createTree3aHandle({ scene });
    handle.mountSlots();
    const stats = handle.stats();
    expect(stats.mounted).toBe(true);
    expect(stats.slots).toHaveLength(8);
    for (let slot = 0; slot < 8; slot++) {
      const entry = stats.slots![slot]!;
      expect(entry.slot).toBe(slot);
      expect(entry.barkTriangles).toBe(20724); // 皮拓扑槽间恒定
      expect(entry.leafCards).toBeGreaterThan(0); // 叶卡数随簇级剔除定——不锁具体值
      expect(entry.leafTriangles).toBe(entry.leafCards * 2); // 卡 = 2 三角
    }
    expect(stats.barkTriangles).toBe(8 * 20724); // 顶层保持「总量」语义 = 8 棵合计
    expect(stats.leafCards).toBe(stats.slots!.reduce((sum, s) => sum + s.leafCards, 0));
    handle.dispose();
  }, 60000);

  it('viewSlots：缺省机位球坐标公式复算落位 + target = 网格中心 (0, 3.6, spacing/2) + update 被调；viewSlot(5) 绕槽 5 树位；viewSlot(9/-1) 越界 warn no-op 不位移', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const controls = makeControlsStub();
    const handle = createTree3aHandle({ scene, camera, controls });
    handle.mountSlots(); // spacing 11 → 网格中心 z = 5.5
    handle.viewSlots(); // 缺省 42 / 35° / 16°——公式复算断言
    const d = 42;
    const az = (35 * Math.PI) / 180;
    const el = (16 * Math.PI) / 180;
    expect(camera.position.x).toBeCloseTo(d * Math.cos(el) * Math.cos(az), 5);
    expect(camera.position.y).toBeCloseTo(3.6 + d * Math.sin(el), 5);
    expect(camera.position.z).toBeCloseTo(5.5 + d * Math.cos(el) * Math.sin(az), 5);
    expect(controls.target.x).toBeCloseTo(0, 5);
    expect(controls.target.y).toBeCloseTo(3.6, 5);
    expect(controls.target.z).toBeCloseTo(5.5, 5);
    expect(controls.updates).toBe(1);
    handle.viewSlot(5, { distance: 20, azimuthDeg: 0, elevationDeg: 0 });
    // slot 5：col 1 / row 1 → 树位 (−5.5, 11)；az 0°/el 0° 正 +X 方向 20m
    expect(camera.position.x).toBeCloseTo(14.5, 5);
    expect(camera.position.y).toBeCloseTo(3.6, 5);
    expect(camera.position.z).toBeCloseTo(11, 5);
    expect(controls.target.x).toBeCloseTo(-5.5, 5);
    expect(controls.target.z).toBeCloseTo(11, 5);
    expect(controls.updates).toBe(2);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    camera.position.set(99, 99, 99); // 位移哨兵——越界调用不得动相机
    handle.viewSlot(9);
    handle.viewSlot(-1);
    expect(camera.position.x).toBe(99);
    expect(camera.position.z).toBe(99);
    expect(controls.updates).toBe(2); // no-op 不触发 update
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
    handle.dispose();
  }, 60000);

  it('互斥与幂等：mountSlots ↔ mount/mountWindDemo 重建 scene.children 恒 1；自定义 spacing 生效；unmount/dispose 幂等、slots 模式 stats 归零', () => {
    const scene = new THREE.Scene();
    const handle = createTree3aHandle({ scene });
    handle.mountSlots();
    expect(scene.children).toHaveLength(1);
    handle.mount(); // 互斥：mount 先摘 slots
    expect(scene.children).toHaveLength(1);
    expect(scene.children[0]!.name).toBe('tree3a-dev-stage');
    handle.mountWindDemo(); // 互斥：风动先摘单树
    expect(scene.children).toHaveLength(1);
    expect(scene.children[0]!.name).toBe('tree3a-dev-wind');
    handle.mountSlots({ spacing: 8 }); // 反向互斥 + 自定义间距：slot 7 = (1.5×8, 8)
    expect(scene.children).toHaveLength(1);
    expect(scene.children[0]!.name).toBe('tree3a-dev-slots');
    const meshes = scene.children[0]!.children as THREE.Mesh[];
    expect(meshes[7]!.position.x).toBeCloseTo(1.5 * 8, 5);
    expect(meshes[7]!.position.z).toBeCloseTo(8, 5);
    handle.unmount();
    handle.unmount(); // 幂等
    expect(() => handle.dispose()).not.toThrow(); // dispose 幂等
    expect(scene.children).toHaveLength(0);
    const stats = handle.stats();
    expect(stats.mounted).toBe(false);
    expect(stats.barkTriangles).toBe(0);
    expect(stats.leafCards).toBe(0);
    expect(stats.slots).toBeUndefined(); // 仅 mountSlots 模式提供逐槽账目
  }, 60000);
});
