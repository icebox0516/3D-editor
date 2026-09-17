/**
 * runtime/procedural/tree/tree3aStage —— window.__tree3a DEV 出图面（T008.2；T008.3 扩风动）。
 *
 * 职责：slot-0 锚点树的构建+挂载+转台+取景句柄工厂——build()（缺省 morphSeed 即锚点）
 *      → Mesh 挂**独立 Group 直挂渲染 scene**（contentGroup 兄弟——天然不参与拾取/大纲/
 *      撤销栈，沿 T003.2 散布 root 的 D5 先例）；连续渲染模式下转台 = 自有 rAF 每帧
 *      转 group（渲染循环逐帧出画，无需侵入 Renderer）；view() 定距/方位/仰角取景
 *      （写主相机 + controls.target——008.3 剪影自检与锚点取证的固定机位驱动）。
 *      T008.3 扩展：mountWindDemo(count) 风动验收载体——build() 一次锚点源 →
 *      InstancedMesh ×N 间距 8m 一排，桶几何挂 aSeed InstancedBufferAttribute（值各异
 *      → 同槽树不同相位摆动，D19.7）；mesh 挂 customDepthMaterial（叶影 SDF 裁切——
 *      舞台自持 Mesh 有挂载点，产品路径 InstanceSource 无此通道，取舍见 tree3aMaterials
 *      头记档）+ castShadow；freezeTime/unfreezeTime 转调注入的 time deps（锚点取证
 *      冻结风相位，固定机位三距离截图可比）。
 * 边界：DEV 专用（组合根 import.meta.env.DEV 守卫挂 window，生产零痕迹）；资源所有权
 *      归本句柄——unmount/dispose 摘自己的 group 并 dispose 自建 geometry/material/
 *      深度材质/InstancedMesh 实例缓冲（build 契约每次 new 全部资源，绝无缓存共享误拆）；
 *      rAF 成对取消、unmount/dispose 幂等（StrictMode 双挂载下先卸载者只拆自己的）；
 *      time deps 未注入时 freeze/unfreeze 为 no-op（测试注桩/独立使用安全）。
 */
import * as THREE from 'three';
import { build } from '../assets/asset_tree_3a.asset';
import { createTree3aLeafDepthMaterial } from './tree3aMaterials';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';

/** 取景依赖：主相机 + 轨道控制目标（结构类型——bootstrap 注入 renderer 实件，测试可注桩） */
export interface Tree3aStageDeps {
  /** 挂载目标（渲染 scene；scene 兄弟组不参与拾取——D5） */
  scene: THREE.Object3D;
  camera?: { position: THREE.Vector3 };
  controls?: { target: THREE.Vector3; update(): void };
  /** uTime 时钟控制（结构类型——bootstrap 注入 Renderer.uTime；锚点取证冻结风相位） */
  time?: { freeze(): void; unfreeze(): void };
}

/** window.__tree3a 句柄（类型在 runtime，bootstrap 经 import type 声明 window 槽） */
export interface Tree3aHandle {
  /** 构建锚点树并挂载（已挂则先摘再建——同位重建）；x/z 为落点（缺省原点） */
  mount(opts?: { x?: number; z?: number }): void;
  /** 风动演示：build() 一次锚点源 → InstancedMesh ×N（缺省 3）间距 8m 一排挂 scene 兄弟组；
   *  桶几何挂 aSeed 各异（≥2 棵同槽树不同相位摆动的验收载体）；已挂先摘再建 */
  mountWindDemo(count?: number): void;
  /** 摘除并释放本句柄自建的全部资源（单树 + 风动演示；幂等） */
  unmount(): void;
  /** 冻结 uTime 时钟（deps.time 未注入 no-op）——锚点取证固定风相位 */
  freezeTime(): void;
  /** 解冻 uTime 时钟（deps.time 未注入 no-op） */
  unfreezeTime(): void;
  /** 转台：speed rad/s（缺省 0.3；0 或负 = 停）；自有 rAF 每帧转 group */
  turntable(speed?: number): void;
  /** 固定机位取景：distance 米（缺省 25）/ azimuthDeg 方位（缺省 35）/ elevationDeg 仰角（缺省 8，水平为 0） */
  view(opts?: { distance?: number; azimuthDeg?: number; elevationDeg?: number }): void;
  /** 账目：挂载态 + 面数（皮/叶三角 + 叶卡数） */
  stats(): { mounted: boolean; barkTriangles: number; leafTriangles: number; leafCards: number };
  /** 终结：unmount + 停转台（幂等；window 槽摘除由组合根负责） */
  dispose(): void;
}

/** 风动演示 aSeed 值（前 3 实例固定各异；超出走黄金角序列续接，任意 count 互异） */
const WIND_DEMO_SEEDS = [0.13, 0.41, 0.87];
/** 风动演示实例间距（米）——同槽树一排摆动差异的观察距离 */
const WIND_DEMO_SPACING = 8;

/** 句柄工厂：资源全封闭于闭包，句柄间零共享 */
export function createTree3aHandle(deps: Tree3aStageDeps): Tree3aHandle {
  let group: THREE.Group | null = null;
  let source: InstanceSource | null = null;
  /** mount() 单树的叶影裁切深度材质（舞台自持；unmount dispose） */
  let leafDepth: THREE.MeshDepthMaterial | null = null;
  /** 风动演示组与源（mountWindDemo 自建；unmount dispose 含 aSeed 桶几何与实例缓冲） */
  let windGroup: THREE.Group | null = null;
  let windSource: InstanceSource | null = null;
  let windLeafDepth: THREE.MeshDepthMaterial | null = null;
  let rafId = 0;
  let speed = 0;
  let lastT = 0;

  const stopTurntable = (): void => {
    if (rafId !== 0 && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(rafId);
    rafId = 0;
    lastT = 0;
  };

  const spin = (t: number): void => {
    if (speed <= 0 || !group) {
      rafId = 0;
      return;
    }
    if (lastT !== 0) group.rotation.y += speed * ((t - lastT) / 1000);
    lastT = t;
    rafId = requestAnimationFrame(spin);
  };

  /** InstanceSource 资源释放（build 契约 new 全部——本句柄自建，无共享误拆） */
  const disposeSource = (target: InstanceSource | null): void => {
    if (!target) return;
    target.geometry.dispose();
    const material = target.material;
    if (Array.isArray(material)) for (const m of material) m.dispose();
    else material.dispose();
  };

  return {
    mount(opts = {}) {
      this.unmount();
      source = build(); // 缺省 = slot-0 锚点 morphSeed（008.3 视觉定调基准树）
      group = new THREE.Group();
      group.name = 'tree3a-dev-stage';
      group.position.set(opts.x ?? 0, 0, opts.z ?? 0);
      const mesh = new THREE.Mesh(source.geometry, source.material);
      mesh.castShadow = true; // 锚点取证含树影（地面 receiveShadow 已开）
      leafDepth = createTree3aLeafDepthMaterial(); // 叶影 SDF 裁切（皮组守卫实心）
      mesh.customDepthMaterial = leafDepth;
      group.add(mesh);
      deps.scene.add(group);
    },
    mountWindDemo(count = 3) {
      this.unmount();
      windSource = build(); // 一次锚点源——同槽树，形态逐位相同（相位差只在 aSeed）
      const geometry = windSource.geometry;
      const total = Math.max(1, Math.floor(count));
      const mesh = new THREE.InstancedMesh(geometry, windSource.material, total);
      const seeds = new Float32Array(total);
      const matrix = new THREE.Matrix4();
      for (let i = 0; i < total; i++) {
        matrix.makeTranslation((i - (total - 1) / 2) * WIND_DEMO_SPACING, 0, 0); // 一排等距
        mesh.setMatrixAt(i, matrix);
        // 前 3 固定种子（验收口径）；超出黄金角序列续接（任意 count 互异）
        seeds[i] = i < WIND_DEMO_SEEDS.length ? WIND_DEMO_SEEDS[i]! : (0.13 + i * 0.6180339887) % 1;
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere(); // 覆盖全实例（几何球不含实例位移，不补则整排误剔除）
      geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1)); // 逐实例风相位（InstancedAssetPool 同款绑定方式）
      mesh.castShadow = true;
      windLeafDepth = createTree3aLeafDepthMaterial();
      mesh.customDepthMaterial = windLeafDepth;
      windGroup = new THREE.Group();
      windGroup.name = 'tree3a-dev-wind';
      windGroup.add(mesh);
      deps.scene.add(windGroup);
    },
    unmount() {
      stopTurntable();
      speed = 0;
      if (group) deps.scene.remove(group);
      group = null;
      disposeSource(source);
      source = null;
      if (leafDepth) leafDepth.dispose();
      leafDepth = null;
      if (windGroup) deps.scene.remove(windGroup);
      windGroup = null;
      disposeSource(windSource); // 含桶几何上的 aSeed 实例缓冲（随几何释放）
      windSource = null;
      if (windLeafDepth) windLeafDepth.dispose();
      windLeafDepth = null;
    },
    freezeTime() {
      deps.time?.freeze();
    },
    unfreezeTime() {
      deps.time?.unfreeze();
    },
    turntable(fast = 0.3) {
      speed = fast;
      if (speed <= 0) {
        stopTurntable();
        return;
      }
      if (rafId === 0 && typeof requestAnimationFrame === 'function') rafId = requestAnimationFrame(spin);
    },
    view(opts = {}) {
      const distance = opts.distance ?? 25;
      const az = ((opts.azimuthDeg ?? 35) * Math.PI) / 180;
      const el = ((opts.elevationDeg ?? 8) * Math.PI) / 180;
      const gx = group?.position.x ?? 0;
      const gz = group?.position.z ?? 0;
      // 目标高 ≈ 树半高（7.5m 锚点树取 ~3.6m 视心；树未挂时回退原点）
      const targetY = 3.6;
      const cosEl = Math.cos(el);
      if (deps.camera) {
        deps.camera.position.set(
          gx + distance * cosEl * Math.cos(az),
          targetY + distance * Math.sin(el),
          gz + distance * cosEl * Math.sin(az),
        );
      }
      if (deps.controls) {
        deps.controls.target.set(gx, targetY, gz);
        deps.controls.update();
      }
    },
    stats() {
      const geometry = source?.geometry ?? windSource?.geometry;
      const bark = geometry?.groups[0]?.count ?? 0;
      const leaf = geometry?.groups[1]?.count ?? 0;
      return { mounted: (group ?? windGroup) !== null, barkTriangles: bark / 3, leafTriangles: leaf / 3, leafCards: leaf / 6 };
    },
    dispose() {
      this.unmount();
    },
  };
}
