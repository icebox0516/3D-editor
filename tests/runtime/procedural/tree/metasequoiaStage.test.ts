/**
 * tests/runtime/procedural/tree/metasequoiaStage.test.ts —— window.__metasequoia DEV
 * 出图面句柄测试（T012.2 Step 3c；雪松 cedrusStage.test 同构复制——断言集逐条对应，
 * 数值面换水杉实数；**conifer 转正例 Stage**）。
 *
 * 覆盖（零 WebGL——裸 THREE.Scene + 结构桩相机/控制；window 槽装配归 bootstrap 组合根）：
 * - mount/unmount：group 挂 scene 兄弟层（scene.children 增减）+ stats 账目（皮/羽卡面数
 *   与羽卡数 = 资产恒定值）+ 幂等（重复 mount 同位重建、unmount 空挂安全）；
 * - dispose：幂等；unmount 后资源已 dispose（stats 归零、group 摘除）；
 * - view：结构桩相机/控制——position 按球坐标落位、target 置冠心、update 被调；
 * - StrictMode 双挂载安全：同 scene 两句柄，先卸 A 不拆 B 的挂载（dispose 只摘自己的）；
 * - turntable(0)：无 rAF 环境安全（node 测试环境无 requestAnimationFrame）；
 * - mountWindDemo：InstancedMesh ×N 一排 + aSeed InstancedBufferAttribute 值互异
 *   ∈[0,1) + 间距 10m + castShadow/customDepthMaterial（羽影裁切）；与 mount 互斥重建、
 *   unmount/dispose 幂等清理；freezeTime/unfreezeTime 转调注入 time deps（未注入 no-op）。
 * - mountSlots：8 槽 4×2 行主序网格独立 Mesh（跨槽几何各异——非 InstancedMesh）+
 *   castShadow/customDepthMaterial；stats 逐槽账目（皮组面数落 17652–17776 带 = 皮拓扑
 *   恒 17136 + 球果·枯穗卡 516–640 槽间浮动〔posHash 双器官账目候选池随槽枝路——vs 阔叶
 *   无果皮组恒等先例的水杉差异〕、顶层合计 8×；羽卡数只断言 > 0——不锁具体值，档间/槽间
 *   数值归资产侧测试）；viewSlots 网格中心机位（球坐标公式复算）+ viewSlot(5) 槽位特写 +
 *   越界 warn no-op；与 mount/mountWindDemo 互斥重建、unmount/dispose 幂等（slots 模式
 *   stats 归零）。（8 棵 build 耗时长——相关测试 60000ms）
 * - mountLevels（deps.build 注入 fake——透传断言不依赖真实 level 路由落地时序，不锁
 *   真实档位面数）：build 恰调 3 次同 seed + level 依次 high/mid/low；3 独立 Mesh
 *   一字排开（−s/0/+s）castShadow + 逐档深度材质互异；与 mountSlots/mount 互斥
 *   （既有几何全 dispose）；unmount 3 份 geometry + 6 份双材质 + 3 份深度材质全 dispose
 *   且幂等；stats.levels 3 行序 high/mid/low + 顶层三档合计；viewLevels 缺省机位
 *   球坐标复算 + viewLevel 档位特写绕档树位 + 未知档位 warn no-op。
 * - customDepthMaterial 同源消费（SOP §1.4「DEV 同源」：fake build 带字段 →
 *   mount/mountLevels 挂载与 source.customDepthMaterial 同引用（不自建）、unmount 随
 *   disposeSource 释放恰一次（幂等）；不带字段 → 回退自建进自持释放（两路径行为对账）。
 * 数值锚（vs 雪松差异面——20m 级 conifer 转正例）：slot-0 High 皮组 17652（皮 17136 +
 *   球果 156 + 枯穗 360——组 0 含双器官卡，冻结接口）/ 羽卡 14520 / 7260 卡（**Step 4
 *   密度校准终测 2026-09-29** = 资产预算锁定账目 triangleCount 32172 = 17652 + 14520
 *   〔初版 8396/4198 卡被羽卡 0.18–0.30 + 簇位 12/8 校准取代〕，末两级 L5/L4 羽簇
 *   交叉双卡合计卡数）；取景视心高 13.9（slot-0 羽卡冠域 7.826–19.996 冠心
 *   ≈13.91——vs cedrus 9.7 / ginkgo 5.4 / camphor 5.5 / celtis 4.3，水杉 20m 级全园
 *   最高量级树，metasequoiaStage 模块头「树高参考」）；网格/排距 11（8 槽冠幅 XZ 最大
 *   9.40m 防交叠——vs 雪松 12.45m 配 14m 的水杉实数版）；viewSlots 43 / viewLevels 35
 *   （「distance ≈ 实宽」口径：3×11+9.40 ≈ 42.4 / 2×11+9.40 ≈ 31.4 实宽上取留边
 *   〔35 兼 20m 级树高垂直半角余量——需求 ≈10° < fov 25° 半角 12.5°〕）。
 */
import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { createMetasequoiaHandle } from '../../../../src/runtime/procedural/tree/metasequoia/metasequoiaStage';
import { meta } from '../../../../src/runtime/procedural/assets/asset_tree_metasequoia.asset';
import { morphSeedOf } from '../../../../src/domain/assets';
import type { ProceduralLevel } from '../../../../src/domain/assets';
import { makeControlsStub, makeFakeBuild, makeFakeBuildWithDepth, makeLog } from '../../../support/procedural-tree/stageFixture';

describe('mount / unmount / stats', () => {
  it('mount：group 挂 scene + stats 账目 = slot-0 锚点实数（皮组 17652 / 羽卡 14520 / 7260 卡，Step 4 密度校准终测 = 预算锁定账目 slot-0 High——皮组含球果 156 + 枯穗 360 双器官卡）', () => {
    const scene = new THREE.Scene();
    const handle = createMetasequoiaHandle({ scene });
    handle.mount();
    expect(scene.children).toHaveLength(1);
    const stats = handle.stats();
    expect(stats.mounted).toBe(true);
    expect(stats.barkTriangles).toBe(17652);
    expect(stats.needleTriangles).toBe(14520);
    expect(stats.needleCards).toBe(7260);
    handle.dispose();
    expect(scene.children).toHaveLength(0);
  }, 30000);

  it('mount 落点偏移生效（x/z 透传 group.position）；重复 mount 同位重建不泄漏 group', () => {
    const scene = new THREE.Scene();
    const handle = createMetasequoiaHandle({ scene });
    handle.mount({ x: 5, z: -3 });
    handle.mount({ x: 5, z: -3 });
    expect(scene.children).toHaveLength(1);
    expect(scene.children[0]!.position.x).toBe(5);
    expect(scene.children[0]!.position.z).toBe(-3);
    handle.dispose();
  }, 60000);

  it('unmount/dispose：幂等且 stats 归零（资源已随摘除释放——geometry dispose 幂等无害）', () => {
    const scene = new THREE.Scene();
    const handle = createMetasequoiaHandle({ scene });
    handle.mount();
    handle.unmount();
    handle.unmount(); // 幂等
    expect(() => handle.dispose()).not.toThrow(); // dispose 幂等
    const stats = handle.stats();
    expect(stats.mounted).toBe(false);
    expect(stats.barkTriangles).toBe(0);
    expect(scene.children).toHaveLength(0);
  }, 30000);
});

describe('view 取景（结构桩相机/控制）', () => {
  it('view：相机球坐标落位 + target 置冠心 + update 被调', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const controls = makeControlsStub();
    const handle = createMetasequoiaHandle({ scene, camera, controls });
    handle.mount({ x: 2, z: 4 });
    handle.view({ distance: 30, azimuthDeg: 0, elevationDeg: 0 });
    // az 0°/el 0°：正 +X 方向距离 30，视心高 ≈13.9（锚点树 19.996m 羽卡冠域 7.826–19.996 冠心 ≈13.91——vs cedrus 9.7）
    expect(camera.position.x).toBeCloseTo(32, 5);
    expect(camera.position.y).toBeCloseTo(13.9, 5);
    expect(camera.position.z).toBeCloseTo(4, 5);
    expect(controls.target.x).toBe(2);
    expect(controls.target.z).toBe(4);
    expect(controls.updates).toBe(1);
    handle.dispose();
  }, 30000);
});

describe('StrictMode 双挂载安全（dispose 只摘自己的）', () => {
  it('同 scene 两句柄：dispose(A) 后 B 仍挂载', () => {
    const scene = new THREE.Scene();
    const a = createMetasequoiaHandle({ scene });
    const b = createMetasequoiaHandle({ scene });
    a.mount();
    b.mount({ x: 10 });
    a.dispose();
    expect(scene.children).toHaveLength(1);
    expect(scene.children[0]!.position.x).toBe(10); // B 的树还在
    const stats = b.stats();
    expect(stats.mounted).toBe(true);
    expect(stats.needleCards).toBe(7260);
    b.dispose();
    expect(scene.children).toHaveLength(0);
  }, 60000);
});

describe('turntable（无 rAF 环境安全）', () => {
  it('turntable(0)/turntable(正) 在无 requestAnimationFrame 的测试环境不抛错', () => {
    const scene = new THREE.Scene();
    const handle = createMetasequoiaHandle({ scene });
    handle.mount();
    expect(() => handle.turntable(0)).not.toThrow();
    expect(() => handle.turntable(0.5)).not.toThrow();
    handle.dispose();
  }, 30000);
});

describe('mountWindDemo / freezeTime（风动验收载体）', () => {
  it('默认 3 实例 InstancedMesh 一排：aSeed InstancedBufferAttribute 值互异 ∈[0,1)；间距 10m；customDepthMaterial 羽影裁切', () => {
    const scene = new THREE.Scene();
    const handle = createMetasequoiaHandle({ scene });
    handle.mountWindDemo();
    expect(scene.children).toHaveLength(1);
    expect(scene.children[0]!.name).toBe('metasequoia-dev-wind');
    const mesh = scene.children[0]!.children[0] as THREE.InstancedMesh;
    expect(mesh.isInstancedMesh).toBe(true);
    expect(mesh.count).toBe(3);
    expect(mesh.castShadow).toBe(true); // 风动取证含树影
    expect(mesh.customDepthMaterial).toBeDefined(); // 羽影 SDF 裁切（舞台自持 Mesh 挂载点）
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
    expect(m1.elements[12] - m0.elements[12]).toBeCloseTo(10, 5); // 间距 10m 一排（slot-0 冠幅 6.31m + 留边）
    expect(handle.stats().mounted).toBe(true); // 风动演示也计入挂载态
    handle.dispose();
    expect(scene.children).toHaveLength(0);
  }, 30000);

  it('mountWindDemo(count) 自定义实例数；与 mount 互斥（重建先摘）；unmount 清理幂等', () => {
    const scene = new THREE.Scene();
    const handle = createMetasequoiaHandle({ scene });
    handle.mountWindDemo(5);
    let mesh = scene.children[0]!.children[0] as THREE.InstancedMesh;
    expect(mesh.count).toBe(5);
    const seeds = Array.from((mesh.geometry.getAttribute('aSeed') as THREE.InstancedBufferAttribute).array as Float32Array);
    expect(new Set(seeds).size).toBe(5); // 黄金角续接仍互异
    handle.mount(); // 互斥：mount 先摘风动演示
    expect(scene.children).toHaveLength(1);
    expect(scene.children[0]!.name).toBe('metasequoia-dev-stage');
    expect((scene.children[0]!.children[0] as THREE.Mesh).geometry.hasAttribute('aSeed')).toBe(false); // 单树普通 Mesh 无 aSeed（缺省属性 0 路径）
    handle.mountWindDemo(3);
    mesh = scene.children[0]!.children[0] as THREE.InstancedMesh;
    expect(mesh.count).toBe(3);
    handle.unmount();
    handle.unmount(); // 幂等
    handle.dispose(); // 幂等
    expect(scene.children).toHaveLength(0);
    expect(handle.stats().mounted).toBe(false);
    expect(handle.stats().needleCards).toBe(0);
  }, 60000);

  it('freezeTime/unfreezeTime 转调注入 time deps；未注入 no-op 不抛', () => {
    const calls: string[] = [];
    const handle = createMetasequoiaHandle({
      scene: new THREE.Scene(),
      time: { freeze: () => calls.push('freeze'), unfreeze: () => calls.push('unfreeze') },
    });
    handle.freezeTime();
    handle.unfreezeTime();
    expect(calls).toEqual(['freeze', 'unfreeze']);
    const bare = createMetasequoiaHandle({ scene: new THREE.Scene() });
    expect(() => bare.freezeTime()).not.toThrow(); // deps.time 缺省 no-op（测试/独立使用安全）
    expect(() => bare.unfreezeTime()).not.toThrow();
  });
});

describe('mountSlots / viewSlots / viewSlot（8 槽批量出图面）', () => {
  it('mountSlots：metasequoia-dev-slots 组内 8 独立 Mesh 4×2 行主序网格（spacing 11）；castShadow + customDepthMaterial 与单树同待遇；转台对 slots 组无 rAF 安全', () => {
    const scene = new THREE.Scene();
    const handle = createMetasequoiaHandle({ scene });
    handle.mountSlots();
    expect(scene.children).toHaveLength(1);
    const group = scene.children[0]!;
    expect(group.name).toBe('metasequoia-dev-slots');
    expect(group.children).toHaveLength(8);
    const meshes = group.children as THREE.Mesh[];
    // 行主序 4×2（缺省 spacing 11）：col=i%4 定 x=(col−1.5)×11、row=floor(i/4) 定 z=row×11
    for (let slot = 0; slot < 8; slot++) {
      const mesh = meshes[slot]!;
      expect(mesh.position.x).toBeCloseTo(((slot % 4) - 1.5) * 11, 5);
      expect(mesh.position.z).toBeCloseTo(Math.floor(slot / 4) * 11, 5);
      expect(mesh.castShadow).toBe(true); // 批量取证含树影
      expect(mesh.customDepthMaterial).toBeDefined(); // 逐槽羽影 SDF 裁切
      expect(mesh).toBeInstanceOf(THREE.Mesh); // 跨槽几何各异——独立 Mesh
      expect(mesh).not.toBeInstanceOf(THREE.InstancedMesh);
    }
    // 锚点槽位抽查（「distance ≈ 实宽」网格口径的水杉实数版）：slot 0 (−16.5, 0) / slot 3 (16.5, 0) / slot 7 (16.5, 11)
    expect(meshes[0]!.position.x).toBeCloseTo(-1.5 * 11, 5);
    expect(meshes[3]!.position.x).toBeCloseTo(1.5 * 11, 5);
    expect(meshes[7]!.position.x).toBeCloseTo(1.5 * 11, 5);
    expect(meshes[7]!.position.z).toBeCloseTo(11, 5);
    expect(new Set(meshes.map((m) => m.geometry)).size).toBe(8); // 8 份独立几何（build 契约每次 new）
    expect(() => handle.turntable(0.5)).not.toThrow(); // 转台目标含 slots 组（无 rAF 环境安全）
    handle.dispose();
    expect(scene.children).toHaveLength(0);
  }, 60000);

  it('stats（slots 模式）：8 项逐槽账目，皮组面数落 17652–17776 带（皮拓扑恒 17136 + 球果·枯穗卡 516–640 槽间浮动——posHash 双器官账目候选池随槽枝路，vs 阔叶无果皮组恒等先例的水杉差异）+ 顶层合计 8×；羽卡数只断言 > 0（不锁具体值——数值归资产侧测试）', () => {
    const scene = new THREE.Scene();
    const handle = createMetasequoiaHandle({ scene });
    handle.mountSlots();
    const stats = handle.stats();
    expect(stats.mounted).toBe(true);
    expect(stats.slots).toHaveLength(8);
    for (let slot = 0; slot < 8; slot++) {
      const entry = stats.slots![slot]!;
      expect(entry.slot).toBe(slot);
      expect(entry.barkTriangles, `slot-${slot} 皮组面数应落带（皮恒 17136 + 器官 516–640）`).toBeGreaterThanOrEqual(17136 + 516);
      expect(entry.barkTriangles, `slot-${slot} 皮组面数应落带（皮恒 17136 + 器官 516–640）`).toBeLessThanOrEqual(17136 + 640);
      expect(entry.needleCards).toBeGreaterThan(0); // 羽卡数随槽簇级剔除定——不锁具体值
      expect(entry.needleTriangles).toBe(entry.needleCards * 2); // 卡 = 2 三角
    }
    expect(stats.barkTriangles).toBe(stats.slots!.reduce((sum, s) => sum + s.barkTriangles, 0)); // 顶层 = 8 棵合计
    expect(stats.needleCards).toBe(stats.slots!.reduce((sum, s) => sum + s.needleCards, 0));
    handle.dispose();
  }, 60000);

  it('viewSlots：缺省机位球坐标公式复算落位 + target = 网格中心 (0, 13.9, spacing/2) + update 被调；viewSlot(5) 绕槽 5 树位；viewSlot(9/-1) 越界 warn no-op 不位移', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const controls = makeControlsStub();
    const handle = createMetasequoiaHandle({ scene, camera, controls });
    handle.mountSlots(); // spacing 11 → 网格中心 z = 5.5
    handle.viewSlots(); // 缺省 43 / 35° / 16°——公式复算断言（3×11+9.40 ≈ 42.4 上取留边）
    const d = 43;
    const az = (35 * Math.PI) / 180;
    const el = (16 * Math.PI) / 180;
    expect(camera.position.x).toBeCloseTo(d * Math.cos(el) * Math.cos(az), 5);
    expect(camera.position.y).toBeCloseTo(13.9 + d * Math.sin(el), 5);
    expect(camera.position.z).toBeCloseTo(5.5 + d * Math.cos(el) * Math.sin(az), 5);
    expect(controls.target.x).toBeCloseTo(0, 5);
    expect(controls.target.y).toBeCloseTo(13.9, 5);
    expect(controls.target.z).toBeCloseTo(5.5, 5);
    expect(controls.updates).toBe(1);
    handle.viewSlot(5, { distance: 20, azimuthDeg: 0, elevationDeg: 0 });
    // slot 5：col 1 / row 1 → 树位 (−5.5, 11)；az 0°/el 0° 正 +X 方向 20m
    expect(camera.position.x).toBeCloseTo(14.5, 5);
    expect(camera.position.y).toBeCloseTo(13.9, 5);
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
    const handle = createMetasequoiaHandle({ scene });
    handle.mountSlots();
    expect(scene.children).toHaveLength(1);
    handle.mount(); // 互斥：mount 先摘 slots
    expect(scene.children).toHaveLength(1);
    expect(scene.children[0]!.name).toBe('metasequoia-dev-stage');
    handle.mountWindDemo(); // 互斥：风动先摘单树
    expect(scene.children).toHaveLength(1);
    expect(scene.children[0]!.name).toBe('metasequoia-dev-wind');
    handle.mountSlots({ spacing: 8 }); // 反向互斥 + 自定义间距：slot 7 = (1.5×8, 8)
    expect(scene.children).toHaveLength(1);
    expect(scene.children[0]!.name).toBe('metasequoia-dev-slots');
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
    expect(stats.needleCards).toBe(0);
    expect(stats.slots).toBeUndefined(); // 仅 mountSlots 模式提供逐槽账目
  }, 60000);
});

describe('mountLevels / viewLevels / viewLevel（档位强制出图面——deps.build 注入 fake）', () => {
  it('mountLevels：build 恰调 3 次、同 seed + level 依次 high/mid/low（透传）；3 独立 Mesh 一字排开（−11/0/+11）castShadow + 逐档深度材质互异；slot/spacing 自定义；slot 越界 warn no-op 不拆现场', () => {
    const scene = new THREE.Scene();
    const log = makeLog();
    const handle = createMetasequoiaHandle({ scene, build: makeFakeBuild(log) });
    handle.mountLevels(); // 缺省 slot 0 / spacing 11
    expect(log.params).toHaveLength(3);
    const expectedSeed = morphSeedOf(meta.id, 0); // seed 口径同 mountSlots：morphSeedOf(id, slot)
    expect(log.params.map((p) => p?.seed)).toEqual([expectedSeed, expectedSeed, expectedSeed]); // 同槽同 seed——档位是唯一变量
    expect(log.params.map((p) => p?.level)).toEqual(['high', 'mid', 'low']); // level 透传依次三档
    expect(scene.children).toHaveLength(1);
    const group = scene.children[0]!;
    expect(group.name).toBe('metasequoia-dev-levels');
    const meshes = group.children as THREE.Mesh[];
    expect(meshes).toHaveLength(3);
    // 一字排开：high 左（−s）/ mid 中（0）/ low 右（+s）
    expect(meshes[0]!.position.x).toBeCloseTo(-11, 5);
    expect(meshes[1]!.position.x).toBeCloseTo(0, 5);
    expect(meshes[2]!.position.x).toBeCloseTo(11, 5);
    for (const mesh of meshes) {
      expect(mesh.position.z).toBeCloseTo(0, 5);
      expect(mesh).toBeInstanceOf(THREE.Mesh); // 档间几何各异——独立 Mesh
      expect(mesh.castShadow).toBe(true); // 档位取证含树影
      expect(mesh.customDepthMaterial).toBeDefined(); // 逐档羽影 SDF 裁切
    }
    expect(new Set(meshes.map((m) => m.geometry)).size).toBe(3); // 3 份独立几何（build 契约每次 new）
    expect(new Set(meshes.map((m) => m.customDepthMaterial)).size).toBe(3); // 3 份独立深度材质实例
    expect(() => handle.turntable(0.5)).not.toThrow(); // 转台目标含 levels 组（无 rAF 环境安全）
    // 自定义 slot + spacing：seed 随槽、排距随参
    log.params.length = 0;
    handle.mountLevels({ slot: 5, spacing: 7 });
    expect(log.params.map((p) => p?.seed)).toEqual(Array<number>(3).fill(morphSeedOf(meta.id, 5)));
    const remeshes = scene.children[0]!.children as THREE.Mesh[];
    expect(remeshes[0]!.position.x).toBeCloseTo(-7, 5);
    expect(remeshes[1]!.position.x).toBeCloseTo(0, 5);
    expect(remeshes[2]!.position.x).toBeCloseTo(7, 5);
    // slot 越界：warn + no-op 不动既有挂载
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    handle.mountLevels({ slot: 8 });
    handle.mountLevels({ slot: -1 });
    expect(warn).toHaveBeenCalledTimes(2);
    expect(scene.children).toHaveLength(1); // 现场未拆
    expect(scene.children[0]!.children).toHaveLength(3);
    warn.mockRestore();
    handle.dispose();
    expect(scene.children).toHaveLength(0);
  });

  it('互斥：mountLevels 先释放 mountSlots 既有 8 份几何（dispose 计数）；反向 mount 释放 levels 3 份；账目字段让位', () => {
    const scene = new THREE.Scene();
    const log = makeLog();
    const handle = createMetasequoiaHandle({ scene, build: makeFakeBuild(log) });
    handle.mountSlots(); // fake build 下 8 份快速产出
    const slotsGeometries = log.sources.splice(0).map((s) => s.geometry); // 前 8 份 = slots 的
    const slotsDisposed = slotsGeometries.map(() => 0);
    slotsGeometries.forEach((geo, i) => geo.addEventListener('dispose', () => slotsDisposed[i]!++));
    handle.mountLevels(); // 互斥：先摘 slots
    expect(scene.children).toHaveLength(1);
    expect(scene.children[0]!.name).toBe('metasequoia-dev-levels');
    expect(slotsDisposed).toEqual([1, 1, 1, 1, 1, 1, 1, 1]); // 原 slots 资源已全释放
    let stats = handle.stats();
    expect(stats.slots).toBeUndefined(); // 逐槽账目让位
    expect(stats.levels).toHaveLength(3);
    // 反向互斥：mount 单树释放 levels
    const levelsGeometries = log.sources.splice(0).map((s) => s.geometry); // 3 份 = levels 的
    const levelsDisposed = levelsGeometries.map(() => 0);
    levelsGeometries.forEach((geo, i) => geo.addEventListener('dispose', () => levelsDisposed[i]!++));
    handle.mount();
    expect(scene.children[0]!.name).toBe('metasequoia-dev-stage');
    expect(levelsDisposed).toEqual([1, 1, 1]); // levels 资源已全释放
    stats = handle.stats();
    expect(stats.levels).toBeUndefined(); // 逐档账目让位
    handle.dispose();
    expect(scene.children).toHaveLength(0);
  });

  it('unmount：3 份 geometry + 6 份双材质 + 3 份深度材质全 dispose；二次调用幂等不重复释放；levels 模式 stats 归零', () => {
    const scene = new THREE.Scene();
    const log = makeLog();
    const handle = createMetasequoiaHandle({ scene, build: makeFakeBuild(log) });
    handle.mountLevels();
    const depths = (scene.children[0]!.children as THREE.Mesh[]).map((m) => m.customDepthMaterial as THREE.Material);
    let geoDisposed = 0;
    let matDisposed = 0;
    let depthDisposed = 0;
    for (const source of log.sources) {
      source.geometry.addEventListener('dispose', () => geoDisposed++);
      for (const material of source.material as THREE.Material[]) material.addEventListener('dispose', () => matDisposed++); // 双材质组逐项监听
    }
    for (const depth of depths) depth.addEventListener('dispose', () => depthDisposed++);
    handle.unmount();
    expect(geoDisposed).toBe(3); // 3 份 source 几何
    expect(matDisposed).toBe(6); // 双材质组 ×3
    expect(depthDisposed).toBe(3); // 逐档深度材质
    handle.unmount(); // 幂等
    expect(() => handle.dispose()).not.toThrow();
    expect(geoDisposed).toBe(3); // 不重复释放
    expect(matDisposed).toBe(6);
    expect(depthDisposed).toBe(3);
    expect(scene.children).toHaveLength(0);
    const stats = handle.stats();
    expect(stats.mounted).toBe(false);
    expect(stats.levels).toBeUndefined(); // levels 账目随卸载消失
    expect(stats.needleCards).toBe(0);
  });

  it('stats（levels 模式）：3 项逐档账目序 high/mid/low（fake 组账目 10 皮 / 20 叶 / 10 卡）+ 顶层三档合计', () => {
    const scene = new THREE.Scene();
    const log = makeLog();
    const handle = createMetasequoiaHandle({ scene, build: makeFakeBuild(log) });
    handle.mountLevels();
    const stats = handle.stats();
    expect(stats.mounted).toBe(true);
    expect(stats.levels).toHaveLength(3);
    expect(stats.levels!.map((l) => l.level)).toEqual(['high', 'mid', 'low']); // 账目序 = 排布序
    for (const entry of stats.levels!) {
      expect(entry.barkTriangles).toBe(10); // fake 皮组 30 索引 / 3——任意合法值（真实档位面数归 LOD 侧测试）
      expect(entry.needleTriangles).toBe(20);
      expect(entry.needleCards).toBe(10);
    }
    expect(stats.barkTriangles).toBe(30); // 顶层保持「总量」语义 = 三档合计
    expect(stats.needleTriangles).toBe(60);
    expect(stats.needleCards).toBe(30);
    expect(stats.slots).toBeUndefined(); // 仅 levels 模式提供逐档账目
    handle.dispose();
  });

  it('viewLevels：缺省机位（35/35/16）球坐标公式复算 + target = 排中心 (0, 13.9, 0)；viewLevel 三档特写绕档树位；未知档位 warn no-op 不动相机', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const controls = makeControlsStub();
    const log = makeLog();
    const handle = createMetasequoiaHandle({ scene, camera, controls, build: makeFakeBuild(log) });
    handle.mountLevels(); // spacing 11 → 排中心 = 组位原点
    handle.viewLevels(); // 缺省 35 / 35° / 16°——公式复算断言（2×11+9.40 ≈ 31.4 实宽上取留边 + 20m 级垂直半角余量）
    const d = 35;
    const az = (35 * Math.PI) / 180;
    const el = (16 * Math.PI) / 180;
    expect(camera.position.x).toBeCloseTo(d * Math.cos(el) * Math.cos(az), 5);
    expect(camera.position.y).toBeCloseTo(13.9 + d * Math.sin(el), 5);
    expect(camera.position.z).toBeCloseTo(d * Math.cos(el) * Math.sin(az), 5);
    expect(controls.target.x).toBeCloseTo(0, 5);
    expect(controls.target.y).toBeCloseTo(13.9, 5);
    expect(controls.target.z).toBeCloseTo(0, 5);
    expect(controls.updates).toBe(1);
    handle.viewLevel('low', { distance: 20, azimuthDeg: 0, elevationDeg: 0 });
    // low = +11：az 0°/el 0° 正 +X 方向 20m → 相机 x = 11 + 20、target = 档树位
    expect(camera.position.x).toBeCloseTo(31, 5);
    expect(camera.position.y).toBeCloseTo(13.9, 5);
    expect(camera.position.z).toBeCloseTo(0, 5);
    expect(controls.target.x).toBeCloseTo(11, 5);
    expect(controls.updates).toBe(2);
    handle.viewLevel('high', { azimuthDeg: 0, elevationDeg: 0 });
    // high = −11：缺省距离 25 → 相机 x = −11 + 25
    expect(camera.position.x).toBeCloseTo(14, 5);
    expect(controls.target.x).toBeCloseTo(-11, 5);
    handle.viewLevel('mid', { azimuthDeg: 0, elevationDeg: 0 });
    // mid = 0（排中心）：缺省距离 25
    expect(camera.position.x).toBeCloseTo(25, 5);
    expect(controls.target.x).toBeCloseTo(0, 5);
    // 自定义 spacing 复算档位树位：spacing 7 → high = −7
    handle.mountLevels({ spacing: 7 });
    handle.viewLevel('high', { azimuthDeg: 0, elevationDeg: 0 });
    expect(camera.position.x).toBeCloseTo(18, 5); // −7 + 25
    expect(controls.target.x).toBeCloseTo(-7, 5);
    // 未知档位（类型外运行时垃圾输入）：warn + no-op 不动相机
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    camera.position.set(99, 99, 99); // 位移哨兵
    handle.viewLevel('ultra' as unknown as ProceduralLevel);
    expect(camera.position.x).toBe(99);
    expect(controls.updates).toBe(5); // 5 次成功取景后 no-op 不触发 update
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
    handle.dispose();
  });
});

describe('customDepthMaterial 同源消费（SOP §1.4「DEV 同源」：源带字段消费之，fake 不带回退自建）', () => {
  it('mount：源带深度材质 → mesh.customDepthMaterial 与 source 同引用（不自建）；unmount 随 disposeSource 释放恰一次，幂等不重复', () => {
    const scene = new THREE.Scene();
    const log = makeLog();
    const handle = createMetasequoiaHandle({ scene, build: makeFakeBuildWithDepth(log) });
    handle.mount();
    const mesh = scene.children[0]!.children[0] as THREE.Mesh;
    expect(mesh.customDepthMaterial).toBe(log.sources[0]!.customDepthMaterial); // 同源单一真相
    const depths = log.sources.map((s) => s.customDepthMaterial as THREE.Material);
    let depthDisposed = 0;
    for (const depth of depths) depth.addEventListener('dispose', () => depthDisposed++);
    handle.unmount();
    expect(depthDisposed).toBe(1); // 源带深度材质归 disposeSource 释放（非自持数组）
    handle.unmount(); // 幂等
    expect(() => handle.dispose()).not.toThrow();
    expect(depthDisposed).toBe(1); // 不重复释放
  });

  it('mountLevels：三档消费各自 source.customDepthMaterial（互异引用、逐档 level 匹配）；unmount 释放 3 份源深度材质恰一次，幂等', () => {
    const scene = new THREE.Scene();
    const log = makeLog();
    const handle = createMetasequoiaHandle({ scene, build: makeFakeBuildWithDepth(log) });
    handle.mountLevels();
    const meshes = scene.children[0]!.children as THREE.Mesh[];
    expect(meshes).toHaveLength(3);
    for (let i = 0; i < 3; i++) {
      expect(meshes[i]!.customDepthMaterial).toBe(log.sources[i]!.customDepthMaterial); // 逐档同源
    }
    expect(new Set(meshes.map((m) => m.customDepthMaterial)).size).toBe(3); // 三档互异实例
    const depths = log.sources.map((s) => s.customDepthMaterial as THREE.Material);
    let depthDisposed = 0;
    for (const depth of depths) depth.addEventListener('dispose', () => depthDisposed++);
    handle.unmount();
    expect(depthDisposed).toBe(3); // 全部经 disposeSource 释放（自建回退数组为空——不自建）
    handle.unmount(); // 幂等
    expect(() => handle.dispose()).not.toThrow();
    expect(depthDisposed).toBe(3);
  });

  it('回退路径对账：fake build 不带字段 → 回退自建深度材质挂载并随 unmount 释放恰一次（既有行为不回归）', () => {
    const scene = new THREE.Scene();
    const log = makeLog();
    const handle = createMetasequoiaHandle({ scene, build: makeFakeBuild(log) }); // 不带深度字段
    handle.mount();
    const mesh = scene.children[0]!.children[0] as THREE.Mesh;
    expect(mesh.customDepthMaterial).toBeDefined(); // 回退自建（源不带字段）
    const depth = mesh.customDepthMaterial as THREE.Material;
    let depthDisposed = 0;
    depth.addEventListener('dispose', () => depthDisposed++);
    handle.unmount();
    expect(depthDisposed).toBe(1); // 自建回退进自持 featherDepth 释放
    handle.dispose(); // 幂等
    expect(depthDisposed).toBe(1);
  });
});
