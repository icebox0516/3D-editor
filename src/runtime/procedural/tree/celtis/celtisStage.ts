/**
 * runtime/procedural/tree/celtis/celtisStage —— window.__celtis DEV 出图面（T011.1；
 * 夏栎 tree3aStage 同构复制——T008.2/T008.3/T009.3/T009.5/T009.6 能力面一次交付）。
 *
 * 职责：slot-0 锚点树的构建+挂载+转台+取景句柄工厂——build()（缺省 morphSeed 即锚点）
 *      → Mesh 挂**独立 Group 直挂渲染 scene**（contentGroup 兄弟——天然不参与拾取/大纲/
 *      撤销栈，沿 T003.2 散布 root 的 D5 先例）；连续渲染模式下转台 = 自有 rAF 每帧
 *      转 group（渲染循环逐帧出画，无需侵入 Renderer）；view() 定距/方位/仰角取景
 *      （写主相机 + controls.target——固定机位取证的驱动面；球坐标口径与 tree3aStage
 *      同款 = docs/procedural-assets/shadow-visual-sop.md §3：主方位 az35 / 逆光
 *      az215–275 / 侧方位 az110–125，缺省 25m/35°/8° = M25 机位）。
 *      mountWindDemo(count) 风动验收载体——build() 一次锚点源 → InstancedMesh ×N
 *      间距 8m 一排，桶几何挂 aSeed InstancedBufferAttribute（值各异 → 同槽树不同
 *      相位摆动，D19.7；朴树叶/皮材质同款消费实例 aSeed——整树缓摆同公式同相位）；
 *      mesh 挂 customDepthMaterial（叶影 SDF 裁切——T011.1 起 build 产物自带
 *      source.customDepthMaterial，挂载点同源消费 = 正式场景同一份，SOP §1.4「DEV
 *      同源」；fake build 注入不带字段时才回退自建，见边界段）+ castShadow；
 *      freezeTime/unfreezeTime 转调注入的 time deps（锚点取证冻结风相位，固定机位
 *      三距离截图可比）。
 *      mountSlots 8 槽批量出图面——slot i 各 build({seed: morphSeedOf(id,i)}) 独立
 *      Mesh（跨槽几何各异，InstancedMesh 不适用）4×2 行主序网格（间距缺省 11m——
 *      SOP §3 P42 口径；展开槽冠幅最大 ≈9.9m 防交叠）挂 slots 组直挂 scene 兄弟层；
 *      viewSlots 全景 / viewSlot(i) 单槽特写固定机位（球坐标同 view 语义——「批量
 *      出图 → 分轮裁定」的取证载体）；stats 扩逐槽账目（皮面数槽间恒等 24178 = 拓扑
 *      不变量；叶卡数随槽形态向量各异——**本模块不感知槽内容**，morphSeed → slot →
 *      shapeProfile 路由全在 build 内）；转台旋转目标 = 当前挂载的主组（单树 / slots /
 *      levels；风动排不转——平排观察语义不变）。
 *      mountLevels 档位强制出图面——指定槽三档实例沿 X 一字排开（high 左 / mid 中 /
 *      low 右），build({seed: morphSeedOf(id, slot), level}) 逐档独立 Mesh（castShadow）
 *      + 逐档深度材质同源消费 source.customDepthMaterial（build({level}) 返回的深度
 *      材质已随 level 档位匹配；fake build 不带字段回退自建
 *      createCeltisLeafDepthMaterial(level)）；viewLevels 三树全景 / viewLevel(level)
 *      单档特写（球坐标同 view 语义）；stats 扩 levels 逐档账目。
 *      deps.build 注入位 = 测试 seam（缺省朴树 asset build，产品路径不变——档位透传
 *      断言不依赖真实 level 路由落地时序）。
 * 边界：DEV 专用（组合根 bootstrap import.meta.env.DEV 守卫挂 window.__celtis，
 *      生产零痕迹——本模块与 tree3aStage 同为纯工厂，window 装配归组合根）；资源
 *      所有权归本句柄——unmount/dispose 摘自己的 group 并 dispose source 资源
 *      （geometry/material/customDepthMaterial——深度材质随 source 释放）与自建回退
 *      深度材质/InstancedMesh 实例缓冲（build 契约每次 new 全部资源，绝无缓存共享
 *      误拆；深度材质两路对账：源带的归 disposeSource、fake build 不带字段时回退
 *      自建的进自持数组释放——slots/levels 模式 = 8/3 份 source 逐一释放）；rAF
 *      成对取消、unmount/dispose 幂等（StrictMode 双挂载下先卸载者只拆自己的）；
 *      time deps 未注入时 freeze/unfreeze 为 no-op（测试注桩/独立使用安全）。
 */
import * as THREE from 'three';
import { build, meta } from '../../assets/asset_tree_celtis.asset';
import { morphSeedOf } from '../../../../domain/assets';
import type { ProceduralLevel } from '../../../../domain/assets';
import type { ProceduralBuild } from '../../types';
import { createCeltisLeafDepthMaterial } from './celtisMaterials';
import type { InstanceSource } from '../../../instancing/InstancedAssetPool';

/** 取景依赖：主相机 + 轨道控制目标（结构类型——bootstrap 注入 renderer 实件，测试可注桩） */
export interface CeltisStageDeps {
  /** 挂载目标（渲染 scene；scene 兄弟组不参与拾取——D5） */
  scene: THREE.Object3D;
  camera?: { position: THREE.Vector3 };
  controls?: { target: THREE.Vector3; update(): void };
  /** uTime 时钟控制（结构类型——bootstrap 注入 Renderer.uTime；锚点取证冻结风相位） */
  time?: { freeze(): void; unfreeze(): void };
  /** 构建函数注入位（缺省 = 朴树 asset build；测试注桩 fake build——透传断言不依赖真实
   *  level 路由落地时序；产品路径 bootstrap 不传，行为不变） */
  build?: ProceduralBuild;
}

/** mountSlots 模式逐槽账目（slot 序号 + 该槽皮/叶三角与叶卡数） */
export interface CeltisSlotStats {
  slot: number;
  barkTriangles: number;
  leafTriangles: number;
  leafCards: number;
}

/** mountLevels 模式逐档账目（LOD 档位 + 该档皮/叶三角与叶卡数——档间可比的取证面） */
export interface CeltisLevelStats {
  level: ProceduralLevel;
  barkTriangles: number;
  leafTriangles: number;
  leafCards: number;
}

/** window.__celtis 句柄（类型在 runtime，bootstrap 经 import type 声明 window 槽） */
export interface CeltisHandle {
  /** 构建锚点树并挂载（已挂则先摘再建——同位重建）；x/z 为落点（缺省原点） */
  mount(opts?: { x?: number; z?: number }): void;
  /** 风动演示：build() 一次锚点源 → InstancedMesh ×N（缺省 3）间距 8m 一排挂 scene 兄弟组；
   *  桶几何挂 aSeed 各异（≥2 棵同槽树不同相位摆动的验收载体）；已挂先摘再建 */
  mountWindDemo(count?: number): void;
  /** 8 槽批量挂载（批量出图面）：slot i ∈ 0..7 各 build({seed: morphSeedOf(id,i)})
   *  独立 Mesh（跨槽几何各异——InstancedMesh 不适用）挂一个 'celtis-dev-slots' 组直挂
   *  scene 兄弟层；4×2 行主序网格（slot 0–3 前排 z=0、slot 4–7 后排 z=+spacing；
   *  x=(i%4−1.5)×spacing）；spacing 缺省 11m（SOP §3 P42 口径；展开槽冠幅最大
   *  ≈9.9m 防交叠）；每 Mesh castShadow + customDepthMaterial（与 mount 单树同待遇）；
   *  与 mount/mountWindDemo 互斥（先 unmount 再建） */
  mountSlots(opts?: { spacing?: number }): void;
  /** 档位强制挂载（档间取证面）：指定槽（缺省 0；越界 warn + no-op）三档实例沿 X
   *  一字排开——high 左（−spacing）/ mid 中（0）/ low 右（+spacing），spacing 缺省 11m
   *  （沿用 SLOTS_DEFAULT_SPACING 依据：同槽冠幅 XZ 最大 ≈9.9m 防交叠）；每档
   *  build({seed: morphSeedOf(id, slot), level}) 独立 Mesh（castShadow）+ 逐档深度材质
   *  同源消费 source.customDepthMaterial（level 已档位匹配；fake build 不带字段回退
   *  自建 createCeltisLeafDepthMaterial(level)）；与 mount/mountWindDemo/mountSlots
   *  互斥（先 unmount 再建） */
  mountLevels(opts?: { slot?: number; spacing?: number }): void;
  /** 摘除并释放本句柄自建的全部资源（单树 + 风动演示 + 8 槽批量 + 档位三连——source
   *  资源含其 customDepthMaterial 随 disposeSource 释放、自建回退深度材质随自持数组
   *  释放；幂等） */
  unmount(): void;
  /** 冻结 uTime 时钟（deps.time 未注入 no-op）——锚点取证固定风相位（slots 模式同生效） */
  freezeTime(): void;
  /** 解冻 uTime 时钟（deps.time 未注入 no-op） */
  unfreezeTime(): void;
  /** 转台：speed rad/s（缺省 0.3；0 或负 = 停）；自有 rAF 每帧转当前挂载的主组（单树 / slots / levels） */
  turntable(speed?: number): void;
  /** 固定机位取景：distance 米（缺省 25 = M25）/ azimuthDeg 方位（缺省 35）/ elevationDeg 仰角（缺省 8，水平为 0） */
  view(opts?: { distance?: number; azimuthDeg?: number; elevationDeg?: number }): void;
  /** 8 槽全景固定机位：目标 = 网格中心（组位 + (0, 4.3, spacing/2)）；缺省 distance 42
   *  （SOP P42）/ azimuth 35 / elevation 16——4×2×11m 网格含冠幅实宽 ≈3×11+9.9 ≈ 43m、
   *  纵深 ≈21m，42m 距离 35° 斜视 16° 俯角下 8 棵可辨且留边（垂直半角需求 ≈10° <
   *  典型 fov 25° 余量） */
  viewSlots(opts?: { distance?: number; azimuthDeg?: number; elevationDeg?: number }): void;
  /** 单槽特写机位：球坐标绕该槽树位（复用 view 公式，目标 = 该槽 x/z、视心高 ≈4.3）；
   *  缺省 distance 25 / azimuth 35 / elevation 8（同 view）；slot 越界（<0 或 >7）warn + no-op */
  viewSlot(slot: number, opts?: { distance?: number; azimuthDeg?: number; elevationDeg?: number }): void;
  /** 三树全景固定机位：目标 = 排中心（组位，三树 −s/0/+s 几何中心即组位）视心高 ≈4.3；
   *  缺省 distance 32 / azimuth 35 / elevation 16——三树一字排横向总跨 = 2×11 + 冠幅 9.9
   *  ≈ 32m（同槽冠幅 XZ 最大 ≈9.9m，T011.1 探针实测带），32m 距离 35° 斜视 16° 俯角
   *  下三棵全入画可辨且留边（对齐 viewSlots「distance ≈ 实宽」换算口径；垂直半角
   *  需求 ≈6° 同口径余量内） */
  viewLevels(opts?: { distance?: number; azimuthDeg?: number; elevationDeg?: number }): void;
  /** 单档特写机位（viewSlot 的档位版）：球坐标绕该档树位（复用 view 公式，目标 = 该档
   *  x/z、视心高 ≈4.3）；缺省 distance 25 / azimuth 35 / elevation 8（同 view/viewSlot）；
   *  level 非 high|mid|low 时 warn + no-op */
  viewLevel(level: ProceduralLevel, opts?: { distance?: number; azimuthDeg?: number; elevationDeg?: number }): void;
  /** 账目：挂载态 + 面数（皮/叶三角 + 叶卡数——顶层恒「总量」语义，slots 模式 = 8 棵合计、
   *  levels 模式 = 三档合计） */
  stats(): {
    mounted: boolean;
    barkTriangles: number;
    leafTriangles: number;
    leafCards: number;
    /** mountSlots 模式逐槽账目（8 项；其余模式 = undefined） */
    slots?: CeltisSlotStats[];
    /** mountLevels 模式逐档账目（3 项序 high/mid/low；其余模式 = undefined——不锁真实档
     *  位面数，档间数值由 LOD 代理侧测试覆盖） */
    levels?: CeltisLevelStats[];
  };
  /** 终结：unmount + 停转台（幂等；window 槽摘除由组合根负责） */
  dispose(): void;
}

/** 风动演示 aSeed 值（前 3 实例固定各异；超出走黄金角序列续接，任意 count 互异） */
const WIND_DEMO_SEEDS = [0.13, 0.41, 0.87];
/** 风动演示实例间距（米）——同槽树一排摆动差异的观察距离 */
const WIND_DEMO_SPACING = 8;
/** 形态族槽位数（meta.shapeFamily.size = 8——常量镜像，避免仅取整数为 import 整个 meta 类型面） */
const SLOT_COUNT = 8;
/** slots 网格列数（4×2 行主序：slot 0–3 前排、slot 4–7 后排） */
const SLOT_COLUMNS = 4;
/** slots 缺省间距（米）——SOP §3 P42 网格口径；展开槽冠幅最大 ≈9.9m（widthRange max
 *  9.896，T011.1 探针实测带），11m 留 ≈1m 防交叠 */
const SLOTS_DEFAULT_SPACING = 11;
/** LOD 三档排布与账目序（mountLevels：high 左 / mid 中 / low 右） */
const LEVEL_ORDER: ProceduralLevel[] = ['high', 'mid', 'low'];
/** levels 缺省间距（米）——沿用 SLOTS_DEFAULT_SPACING 防交叠依据（同槽冠幅 XZ 最大 ≈9.9m） */
const LEVELS_DEFAULT_SPACING = SLOTS_DEFAULT_SPACING;
/** viewLevels 缺省距离（米）——三树横向总跨 = 2×11 + 9.9 ≈ 32m，「distance ≈ 实宽」口径（见接口注释） */
const LEVELS_VIEW_DISTANCE = 32;

/** 句柄工厂：资源全封闭于闭包，句柄间零共享 */
export function createCeltisHandle(deps: CeltisStageDeps): CeltisHandle {
  let group: THREE.Group | null = null;
  let source: InstanceSource | null = null;
  /** mount() 单树的叶影裁切深度材质（舞台自持；unmount dispose） */
  let leafDepth: THREE.MeshDepthMaterial | null = null;
  /** 风动演示组与源（mountWindDemo 自建；unmount dispose 含 aSeed 桶几何与实例缓冲） */
  let windGroup: THREE.Group | null = null;
  let windSource: InstanceSource | null = null;
  let windLeafDepth: THREE.MeshDepthMaterial | null = null;
  /** 8 槽批量组与逐槽资源（mountSlots 自建；unmount 逐一 dispose——8 份 source + 8 份深度材质） */
  let slotsGroup: THREE.Group | null = null;
  let slotsSources: InstanceSource[] = [];
  let slotsLeafDepths: THREE.MeshDepthMaterial[] = [];
  /** 当前 slots 网格间距（viewSlots/viewSlot 机位复算用；unmount 归位缺省） */
  let slotsSpacing = SLOTS_DEFAULT_SPACING;
  /** 档位三连组与逐档资源（mountLevels 自建；unmount 逐一 dispose——3 份 source + 3 份深度材质） */
  let levelsGroup: THREE.Group | null = null;
  let levelsSources: InstanceSource[] = [];
  let levelsLeafDepths: THREE.MeshDepthMaterial[] = [];
  /** 当前 levels 排布间距（viewLevels/viewLevel 机位复算用；unmount 归位缺省） */
  let levelsSpacing = LEVELS_DEFAULT_SPACING;
  /** 构建函数（deps.build 注入位——测试 seam；缺省朴树 asset build 行为不变） */
  const buildAsset = deps.build ?? build;
  let rafId = 0;
  let speed = 0;
  let lastT = 0;

  const stopTurntable = (): void => {
    if (rafId !== 0 && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(rafId);
    rafId = 0;
    lastT = 0;
  };

  const spin = (t: number): void => {
    // 转台旋转目标 = 当前挂载的主组（单树 / slots / levels 互斥至多其一；风动排不转——平排观察语义）
    const target = group ?? slotsGroup ?? levelsGroup;
    if (speed <= 0 || !target) {
      rafId = 0;
      return;
    }
    if (lastT !== 0) target.rotation.y += speed * ((t - lastT) / 1000);
    lastT = t;
    rafId = requestAnimationFrame(spin);
  };

  /** InstanceSource 资源释放（build 契约 new 全部——本句柄自建，无共享误拆；
   *  含 source.customDepthMaterial——源带深度材质的释放归此处） */
  const disposeSource = (target: InstanceSource | null): void => {
    if (!target) return;
    target.geometry.dispose();
    const material = target.material;
    if (Array.isArray(material)) for (const m of material) m.dispose();
    else material.dispose();
    target.customDepthMaterial?.dispose();
  };

  /** 槽 i 网格落点（行主序 4×2：col=i%4 定 x 等距、row=floor(i/4) 定 z——前排 0 / 后排 +spacing） */
  const slotOffsetX = (slot: number): number => ((slot % SLOT_COLUMNS) - (SLOT_COLUMNS - 1) / 2) * slotsSpacing;
  const slotOffsetZ = (slot: number): number => Math.floor(slot / SLOT_COLUMNS) * slotsSpacing;
  /** 档位 i（LEVEL_ORDER 下标）X 向落点——high(0) −s / mid(1) 0 / low(2) +s 一字排开 */
  const levelOffsetX = (index: number): number => (index - (LEVEL_ORDER.length - 1) / 2) * levelsSpacing;

  /** 球坐标取景落位（view/viewSlots/viewSlot/viewLevels/viewLevel 共用语义，与 tree3aStage
   *  度→弧度换算同款）：绕 (tx, targetY, tz) 以方位/仰角定距放相机 */
  const placeCamera = (
    tx: number,
    tz: number,
    targetY: number,
    distance: number,
    azimuthDeg: number,
    elevationDeg: number,
  ): void => {
    const az = (azimuthDeg * Math.PI) / 180;
    const el = (elevationDeg * Math.PI) / 180;
    const cosEl = Math.cos(el);
    if (deps.camera) {
      deps.camera.position.set(
        tx + distance * cosEl * Math.cos(az),
        targetY + distance * Math.sin(el),
        tz + distance * cosEl * Math.sin(az),
      );
    }
    if (deps.controls) {
      deps.controls.target.set(tx, targetY, tz);
      deps.controls.update();
    }
  };

  return {
    mount(opts = {}) {
      this.unmount();
      source = buildAsset(); // 缺省 = slot-0 锚点 morphSeed（视觉定调基准树）
      group = new THREE.Group();
      group.name = 'celtis-dev-stage';
      group.position.set(opts.x ?? 0, 0, opts.z ?? 0);
      const mesh = new THREE.Mesh(source.geometry, source.material);
      mesh.castShadow = true; // 锚点取证含树影（地面 receiveShadow 已开）
      // 叶影 SDF 裁切（同源单一真相，SOP §1.4「DEV 同源」）：源带深度材质直接消费（归
      // disposeSource 释放）；仅 fake build 注入不带字段时回退自建（进 leafDepth 自持释放）
      const sourceDepth = source.customDepthMaterial;
      if (sourceDepth) {
        mesh.customDepthMaterial = sourceDepth;
      } else {
        leafDepth = createCeltisLeafDepthMaterial();
        mesh.customDepthMaterial = leafDepth;
      }
      group.add(mesh);
      deps.scene.add(group);
    },
    mountWindDemo(count = 3) {
      this.unmount();
      windSource = buildAsset(); // 一次锚点源——同槽树，形态逐位相同（相位差只在 aSeed）
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
      // 叶影 SDF 裁切（同源单一真相）：源带消费之（归 disposeSource），fake build 不带
      // 字段才回退自建（进 windLeafDepth 自持释放）
      const windSourceDepth = windSource.customDepthMaterial;
      if (windSourceDepth) {
        mesh.customDepthMaterial = windSourceDepth;
      } else {
        windLeafDepth = createCeltisLeafDepthMaterial();
        mesh.customDepthMaterial = windLeafDepth;
      }
      windGroup = new THREE.Group();
      windGroup.name = 'celtis-dev-wind';
      windGroup.add(mesh);
      deps.scene.add(windGroup);
    },
    mountSlots(opts = {}) {
      this.unmount();
      slotsSpacing = opts.spacing ?? SLOTS_DEFAULT_SPACING;
      slotsGroup = new THREE.Group();
      slotsGroup.name = 'celtis-dev-slots';
      for (let slot = 0; slot < SLOT_COUNT; slot++) {
        // 槽形态路由全在 build 内（morphSeed → slot → shapeProfile）；本模块不感知槽内容
        const tree = buildAsset({ seed: morphSeedOf(meta.id, slot) });
        slotsSources.push(tree);
        const mesh = new THREE.Mesh(tree.geometry, tree.material); // 跨槽几何各异——独立 Mesh
        mesh.castShadow = true; // 批量取证含树影（与 mount 单树同待遇）
        // 叶影 SDF 裁切（同源单一真相）：源带消费之（归 disposeSource），fake build 不带
        // 字段才回退自建（进 slotsLeafDepths 自持释放）
        const sourceDepth = tree.customDepthMaterial;
        if (sourceDepth) {
          mesh.customDepthMaterial = sourceDepth;
        } else {
          const depth = createCeltisLeafDepthMaterial();
          slotsLeafDepths.push(depth);
          mesh.customDepthMaterial = depth;
        }
        mesh.position.set(slotOffsetX(slot), 0, slotOffsetZ(slot));
        slotsGroup.add(mesh);
      }
      deps.scene.add(slotsGroup);
    },
    mountLevels(opts = {}) {
      const slot = opts.slot ?? 0;
      if (slot < 0 || slot >= SLOT_COUNT) {
        // 越界 no-op 不动既有挂载（同 viewSlot 语义——坏输入不拆好现场）
        console.warn(`[celtisStage] mountLevels: slot ${slot} 越界（0..${SLOT_COUNT - 1}）——no-op`);
        return;
      }
      this.unmount();
      levelsSpacing = opts.spacing ?? LEVELS_DEFAULT_SPACING;
      levelsGroup = new THREE.Group();
      levelsGroup.name = 'celtis-dev-levels';
      for (let index = 0; index < LEVEL_ORDER.length; index++) {
        const level = LEVEL_ORDER[index]!;
        // 同槽同 seed 三档：档位是唯一变量（档间色/形连续可比的取证前提）；seed 口径同 mountSlots
        const tree = buildAsset({ seed: morphSeedOf(meta.id, slot), level });
        levelsSources.push(tree);
        const mesh = new THREE.Mesh(tree.geometry, tree.material); // 档间几何各异——独立 Mesh
        mesh.castShadow = true; // 档位取证含树影（与 mount 单树同待遇）
        // 逐档叶影 SDF 裁切（同源单一真相）：build({level}) 返回的深度材质已档位匹配——
        // 直接消费（归 disposeSource）；fake build 不带字段才回退自建（进
        // levelsLeafDepths 自持释放，level 随档）
        const sourceDepth = tree.customDepthMaterial;
        if (sourceDepth) {
          mesh.customDepthMaterial = sourceDepth;
        } else {
          const depth = createCeltisLeafDepthMaterial(level);
          levelsLeafDepths.push(depth);
          mesh.customDepthMaterial = depth;
        }
        mesh.position.set(levelOffsetX(index), 0, 0);
        levelsGroup.add(mesh);
      }
      deps.scene.add(levelsGroup);
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
      if (slotsGroup) deps.scene.remove(slotsGroup);
      slotsGroup = null;
      for (const tree of slotsSources) disposeSource(tree); // 8 份 source（几何+双材质）逐一释放
      slotsSources = [];
      for (const depth of slotsLeafDepths) depth.dispose();
      slotsLeafDepths = [];
      slotsSpacing = SLOTS_DEFAULT_SPACING;
      if (levelsGroup) deps.scene.remove(levelsGroup);
      levelsGroup = null;
      for (const tree of levelsSources) disposeSource(tree); // 3 份 source（几何+双材质）逐一释放
      levelsSources = [];
      for (const depth of levelsLeafDepths) depth.dispose();
      levelsLeafDepths = [];
      levelsSpacing = LEVELS_DEFAULT_SPACING;
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
      // 目标高 ≈ 树半高（8.57m 锚点树取 ~4.3m 视心；树未挂时回退原点）
      placeCamera(group?.position.x ?? 0, group?.position.z ?? 0, 4.3, opts.distance ?? 25, opts.azimuthDeg ?? 35, opts.elevationDeg ?? 8);
    },
    viewSlots(opts = {}) {
      // 目标 = 网格中心：组位 + 后排偏移一半（4×2 网格 z 向重心在 spacing/2；未挂时按缺省间距落位）
      const gx = slotsGroup?.position.x ?? 0;
      const gz = slotsGroup?.position.z ?? 0;
      placeCamera(gx, gz + slotsSpacing / 2, 4.3, opts.distance ?? 42, opts.azimuthDeg ?? 35, opts.elevationDeg ?? 16);
    },
    viewSlot(slot, opts = {}) {
      if (slot < 0 || slot >= SLOT_COUNT) {
        console.warn(`[celtisStage] viewSlot: slot ${slot} 越界（0..${SLOT_COUNT - 1}）——no-op`);
        return;
      }
      const gx = slotsGroup?.position.x ?? 0;
      const gz = slotsGroup?.position.z ?? 0;
      placeCamera(gx + slotOffsetX(slot), gz + slotOffsetZ(slot), 4.3, opts.distance ?? 25, opts.azimuthDeg ?? 35, opts.elevationDeg ?? 8);
    },
    viewLevels(opts = {}) {
      // 目标 = 排中心：三树 −s/0/+s 的几何中心即组位（未挂时按原点回退）
      const gx = levelsGroup?.position.x ?? 0;
      const gz = levelsGroup?.position.z ?? 0;
      placeCamera(gx, gz, 4.3, opts.distance ?? LEVELS_VIEW_DISTANCE, opts.azimuthDeg ?? 35, opts.elevationDeg ?? 16);
    },
    viewLevel(level, opts = {}) {
      const index = LEVEL_ORDER.indexOf(level);
      if (index < 0) {
        console.warn(`[celtisStage] viewLevel: 未知档位 ${String(level)}（high|mid|low）——no-op`);
        return;
      }
      const gx = levelsGroup?.position.x ?? 0;
      const gz = levelsGroup?.position.z ?? 0;
      placeCamera(gx + levelOffsetX(index), gz, 4.3, opts.distance ?? 25, opts.azimuthDeg ?? 35, opts.elevationDeg ?? 8);
    },
    stats() {
      if (levelsSources.length > 0) {
        let bark = 0;
        let leaf = 0;
        const levels: CeltisLevelStats[] = levelsSources.map((tree, index) => {
          const levelBark = tree.geometry.groups[0]?.count ?? 0;
          const levelLeaf = tree.geometry.groups[1]?.count ?? 0;
          bark += levelBark;
          leaf += levelLeaf;
          return { level: LEVEL_ORDER[index]!, barkTriangles: levelBark / 3, leafTriangles: levelLeaf / 3, leafCards: levelLeaf / 6 };
        });
        // 顶层保持「总量」语义（三档合计）；不锁真实档位面数（LOD 数值归资产侧测试）
        return { mounted: levelsGroup !== null, barkTriangles: bark / 3, leafTriangles: leaf / 3, leafCards: leaf / 6, levels };
      }
      if (slotsSources.length > 0) {
        let bark = 0;
        let leaf = 0;
        const slots: CeltisSlotStats[] = slotsSources.map((tree, slot) => {
          const slotBark = tree.geometry.groups[0]?.count ?? 0;
          const slotLeaf = tree.geometry.groups[1]?.count ?? 0;
          bark += slotBark;
          leaf += slotLeaf;
          return { slot, barkTriangles: slotBark / 3, leafTriangles: slotLeaf / 3, leafCards: slotLeaf / 6 };
        });
        // 顶层保持「总量」语义（8 棵合计）
        return { mounted: slotsGroup !== null, barkTriangles: bark / 3, leafTriangles: leaf / 3, leafCards: leaf / 6, slots };
      }
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
