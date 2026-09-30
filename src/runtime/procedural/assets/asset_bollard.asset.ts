/**
 * runtime/procedural/assets/asset_bollard.asset —— 程序化设施资产：防撞柱（T025.1）。
 *
 * 职责：人行道禁车柱的纯代码几何与参数化底材——φ114 钢管柱体（r 0.057，radial 14）
 *      + 液压成型弧顶帽（压扁半球，柱顶总高 0.80）+ 上部荧光黄反光带 1 道（套筒
 *      r+2mm、宽 0.03、y 0.56–0.59）+ 四道竖向槽口条 + 圆形法兰盘基座（r 0.10
 *      h 0.018 + 4 螺栓小柱）；原点 = 底面中心（y=0 是贴地面，与 GLB 放置的
 *      MODEL_BASE_HEIGHT 贴地语义对齐）。尺寸/形态锚 =
 *      docs/research/traffic-static-reference.md @1.0 §1（Strong：沪道运设养〔2023〕
 *      112 号 + 上海补充图集——φ114 四道槽口 / 露出地面 80cm / 反光膜 3cm 荧光黄 /
 *      RAL 7040；埋深与 C30 混凝土基础在地下不可见，不建模）。
 * 材质分层表（materialIndex → 部件 → 材质；配方实现在 procedural/materials/
 *      facilityMaterials.ts，uv 域 = 默认几何展开——圆柱 u=环绕 v=高度、Box 每面
 *      0–1，配方按 v=长度轴设计条纹）：
 *      0    法兰盘     ┐
 *      1–4  螺栓 ×4    ├─ 深灰金属：底材 #35393d/0.8/0.45 + metal-brush-worn 注入
 *      8–11 槽口条 ×4  ┘  （parkbench 腿架先例色——槽口条共用，分层不增）
 *      5    柱体       ┐ 杆件灰白：底材 #98a0a2/0.6/0.46 + metal-brush-pole 注入
 *      6    弧顶帽     ┘  （RAL 7040 窗灰白域〔沪 112 号文粉末静电喷涂色号〕）
 *      7    反光带     —— 反光件荧光黄：纯底材不注入 #f2e11e + roughness 0.35 +
 *                        emissive 同色 0.25（streetlamp 发光板不注入先例的弱化档
 *                        ——反光膜不是灯，微 emissive 只为暗处可读）
 *                        〔荧光黄域：沪 112 号文 / GB 18833-2012 表8 取 #f2e11e〕
 *      注入契约：仅明度/细节调制（<color_fragment> 的 vColor 变体乘算链不动），
 *      静态确定性、零纹理资源；灰白与深灰分属两配方各共享一个 program。
 * 面数账目（实测，T025.1 探针——设施家族无 lod-spec §5.2 预算行，工程记录口径）：
 *      474 三角面 / 637 顶点（≤3000 线内）；包围盒 h 0.80 / w 0.20（法兰直径）；
 *      minY ≈ 0（float32 残差 +4e-10，契约 toBeCloseTo(0,5) 口径内）。
 * 边界：每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；合并后部件中间体即弃；变体（jitter）不进
 *      build（T002.3 seed 掷骰烘 transform/instanceColor）；固定式/活动式型差与
 *      黄黑环涂变体记档不建模（任务书待裁决位 4）。
 * 记档（裁量项）：① 四道槽口 = 浅凹特征，布尔凹陷不可用，以微凸深色细条表达
 *      （1mm 凸、7mm 宽、竖向 y 0.05–0.75）——读感等效竖线、成本 4×12 面；
 *      ② 基座采产品态法兰 + 4 螺栓（照片可见接地，Spec §1.3）；市政预埋态地面
 *      不可见不建模（两态差异记档）；③ 反光带取 1 道（沪官方一般区域常态；
 *      1–2 道域内取低值）；④ 壁厚 Unknown（Spec §1.2）按实心管柱建模。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import { createFacilityPoleMetalMaterial, createFacilityWornFrameMetalMaterial } from '../materials/facilityMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_bollard',
  name: '防撞柱',
  category: 'facility',
  tags: ['设施', '防撞柱', 'bollard'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.03, rotationJitter: 180 }, // 全向摆放；金属涂装色不漂移，无 hueJitter
  taxonomy: { category: 'facility', family: 'road-facility' }, // 道路设施（T025 批 A 交通静态族）
  presets: [], // 色卡：显式无卡（D44 #2 合法态——设施资产无材质基调变体面）
  proceduralProfile: { heightRange: { min: 0.8, max: 0.8 }, widthRange: { min: 0.2, max: 0.2 } }, // 细模包围盒实测（T025.1 探针：h 0.80 / w 0.20——法兰直径向）
};

export function build(): InstanceSource {
  const parts: THREE.BufferGeometry[] = [];

  // ── 深灰金属（0–4 法兰+螺栓；8–11 槽口条同层）───────
  // 法兰盘：Ø0.20 圆盘基座，底面贴 y=0（产品态接地——膨胀螺栓法兰）
  const flange = new THREE.CylinderGeometry(0.1, 0.1, 0.018, 16);
  flange.translate(0, 0.009, 0);
  parts.push(flange);
  // 4 螺栓小柱：法兰面 45° 起均布（沉入法兰 2mm 防底面共面）
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2 + Math.PI / 4;
    const bolt = new THREE.CylinderGeometry(0.008, 0.008, 0.016, 6);
    bolt.translate(Math.cos(a) * 0.072, 0.024, Math.sin(a) * 0.072);
    parts.push(bolt);
  }

  // ── 杆件灰白（5–6 柱体+弧顶帽）────────────────────
  // 柱体：φ114 圆管（r 0.057），沉入法兰 6mm 起至弧顶帽基线 0.77
  const body = new THREE.CylinderGeometry(0.057, 0.057, 0.758, 14);
  body.translate(0, 0.391, 0);
  parts.push(body);
  // 弧顶帽：液压成型弧顶 = 压扁半球（14 环向对齐柱体、压扁到 0.03 高），总高 0.80
  const dome = new THREE.SphereGeometry(0.057, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  dome.scale(1, 0.03 / 0.057, 1);
  dome.translate(0, 0.77, 0);
  parts.push(dome);

  // ── 反光件（7 荧光黄反光带）──────────────────────
  // 套筒 r+2mm、宽 0.03，柱上部 y 0.56–0.59（沪 3cm 反光膜上部环贴）
  const band = new THREE.CylinderGeometry(0.059, 0.059, 0.03, 14);
  band.translate(0, 0.575, 0);
  parts.push(band);

  // ── 槽口条（8–11，深灰金属层）────────────────────
  // 四道竖向槽口：0/90/180/270° 均布微凸深色细条（1mm 凸、7mm 宽、y 0.05–0.75）
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    const groove = new THREE.BoxGeometry(0.003, 0.7, 0.007);
    groove.rotateY(-a);
    groove.translate(Math.cos(a) * 0.0565, 0.4, Math.sin(a) * 0.0565);
    parts.push(groove);
  }

  const merged = mergeGeometries(parts, true); // groups 顺序 = 输入顺序（材质对齐 materialIndex）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（基元属性集应一致）`);

  const grey = createFacilityPoleMetalMaterial({ color: 0x98a0a2, metalness: 0.6, roughness: 0.46 }); // RAL 7040 灰白（+拉丝注入）
  const dark = createFacilityWornFrameMetalMaterial({ color: 0x35393d, metalness: 0.8, roughness: 0.45 }); // 深灰金属（+拉丝/磨损注入）
  const reflective = new THREE.MeshStandardMaterial({
    color: 0xf2e11e,
    emissive: 0xf2e11e,
    emissiveIntensity: 0.25,
    metalness: 0,
    roughness: 0.35,
  }); // 荧光黄反光膜（不注入）
  return {
    geometry: merged,
    material: [
      dark, dark, dark, dark, dark, // 0–4 法兰+螺栓
      grey, grey, // 5–6 柱体+弧顶帽
      reflective, // 7 反光带
      dark, dark, dark, dark, // 8–11 槽口条
    ],
  };
}
