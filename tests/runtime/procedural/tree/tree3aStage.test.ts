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
 */
import { describe, expect, it } from 'vitest';
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
  it('mount：group 挂 scene + stats 账目 = 资产恒定值（皮 20724 / 叶 11340 / 5670 卡）', () => {
    const scene = new THREE.Scene();
    const handle = createTree3aHandle({ scene });
    handle.mount();
    expect(scene.children).toHaveLength(1);
    const stats = handle.stats();
    expect(stats.mounted).toBe(true);
    expect(stats.barkTriangles).toBe(20724);
    expect(stats.leafTriangles).toBe(11340);
    expect(stats.leafCards).toBe(5670);
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
    expect(stats.leafCards).toBe(5670);
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
