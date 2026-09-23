/**
 * tests/support/procedural-tree/stageFixture.ts —— Stage 出图面句柄测试共享脚手架
 * （T020 阶段二 Step A：13 树资产 xxxStage.test.ts 五件套合一——原各文件本地定义逐字节
 * 同源，仅注释中的资产名/任务号不同；断言语义零变化，纯脚手架迁移）。
 *
 * 约束：zero WebGL——结构桩相机/控制 + fake build 产出 BoxGeometry 源；window 槽装配归
 * bootstrap 组合根（各 Stage 测试文件头部注释仍描述各自的覆盖面）。
 */
import * as THREE from 'three';
import type { ProceduralBuildParams } from '../../../src/runtime/procedural/types';
import type { InstanceSource } from '../../../src/runtime/instancing/InstancedAssetPool';

/** 结构桩控制目标（对 OrbitControls 的 target/update 结构依赖） */
export function makeControlsStub() {
  const stub = {
    target: new THREE.Vector3(),
    updates: 0,
    update() {
      stub.updates += 1;
    },
  };
  return stub;
}

/** fake build 记录（透传断言）+ 产出引用（dispose 断言） */
export interface FakeBuildLog {
  params: (ProceduralBuildParams | undefined)[];
  sources: InstanceSource[];
}

/** fake build（deps.build seam 注入）：记录调用参数；产出带双材质组的合法 InstanceSource
 *  ——皮组 30 索引 = 10 三角、叶组 60 索引 = 20 三角 = 10 卡（任意合法值，不锁真实档位面数） */
export function makeFakeBuild(log: FakeBuildLog): (params?: ProceduralBuildParams) => InstanceSource {
  return (params) => {
    log.params.push(params);
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    geometry.clearGroups();
    geometry.addGroup(0, 30, 0);
    geometry.addGroup(30, 60, 1);
    const source: InstanceSource = {
      geometry,
      material: [new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()],
    };
    log.sources.push(source);
    return source;
  };
}

/** fake build 变体：产出带 customDepthMaterial 的 InstanceSource——模拟正式 build 契约
 *  （各树 build 均自其接入任务起返回深度材质；不带字段的 makeFakeBuild 即回退路径） */
export function makeFakeBuildWithDepth(log: FakeBuildLog): (params?: ProceduralBuildParams) => InstanceSource {
  return (params) => {
    log.params.push(params);
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    geometry.clearGroups();
    geometry.addGroup(0, 30, 0);
    geometry.addGroup(30, 60, 1);
    const source: InstanceSource = {
      geometry,
      material: [new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()],
      customDepthMaterial: new THREE.MeshDepthMaterial(),
    };
    log.sources.push(source);
    return source;
  };
}

export function makeLog(): FakeBuildLog {
  return { params: [], sources: [] };
}
