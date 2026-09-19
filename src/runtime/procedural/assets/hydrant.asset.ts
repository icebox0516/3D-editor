/**
 * runtime/procedural/assets/hydrant.asset —— 程序化设施资产：消防栓（T002.4）。
 *
 * 职责：消火栓的纯代码几何与参数化底材——底部锥台座 + 微锥栓身 + 两圈环形凸筋
 *      （扁圆柱）+ 半嵌顶球 + 顶帽小圆柱尖 + 两侧横伸栓口（绕 Z 旋 90° 横放）；
 *      真实尺度总高约 0.73m、栓身径 0.16–0.18m、栓口高约 0.44m；原点 = 底面
 *      中心（y=0 是贴地面，与 GLB 的 MODEL_BASE_HEIGHT 语义对齐）。径向分段
 *      10–16、球体 (14,10)，整资产约 644 三角面（10 万实例面数纪律）。
 * 材质分层表（materialIndex → 部件 → 材质；阶段二已升级 shader 级程序化注入，
 *      配方实现在 procedural/materials/facilityMaterials.ts，uv 域为默认几何展开
 *      ——圆柱 u=环绕 v=高度、球体 v=纬度（v=1 顶极），磨损按 v 缘设计：恰落在
 *      凸筋两端面 / 栓口端面 / 顶球顶帽一带——真实消防栓的磨损高发区）：
 *      0 底座锥台     —— 深色铸铁：底材 #2f3336/0.7/0.5 + cast-iron 注入
 *                        （粗砂高频颗粒调糙 + 低频浇铸色斑）
 *      1 栓身         ┐
 *      2 环形凸筋下   │
 *      3 环形凸筋上   ├─ 消防红金属漆：底材 #b02222/0.7/0.4 + paint-edge-worn 注入
 *      4 顶球         │  （v 缘噪声破碎磨损→露暗金属底：暗化+金属度升+微降糙；
 *      5 顶帽尖       │   漆面细颗粒高频微扰）
 *      6–7 栓口 ×2   ┘
 *      注入契约：仅明度/细节调制（<color_fragment> 的 vColor 变体乘算链不动），
 *      静态确定性、零纹理资源；底座与红漆各一个 program。
 * 边界：每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；栓口不做链盖/螺纹细节（uv 完整性优先）；
 *      变体（jitter）不进 build（T002.3 seed 掷骰烘 transform/instanceColor）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import { createFacilityCastIronMaterial, createFacilityEdgeWornPaintMaterial } from '../materials/facilityMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_hydrant',
  name: '消防栓',
  category: 'facility',
  tags: ['设施', '消防栓', 'hydrant'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.05, rotationJitter: 180, hueJitter: 5 },
  taxonomy: { category: 'facility', family: 'fire-safety' }, // 消防设施（GLB fire-safety 目录已有 extinguisher 同族）
  proceduralProfile: { heightRange: { min: 0.73, max: 0.73 }, widthRange: { min: 0.38, max: 0.38 } }, // 细模包围盒实测（T010.2 探针：h 0.7300 / w 0.3800——两侧横伸栓口展开）
};

export function build(): InstanceSource {
  const parts: THREE.BufferGeometry[] = [];

  // 底座锥台：下宽上收（Ø0.38 → Ø0.28），0 → 0.10
  const base = new THREE.CylinderGeometry(0.14, 0.19, 0.1, 16);
  base.translate(0, 0.05, 0);
  parts.push(base);

  // 栓身：微锥圆柱（顶 Ø0.164 / 底 Ø0.176），0.10 → 0.64
  const body = new THREE.CylinderGeometry(0.082, 0.088, 0.54, 16);
  body.translate(0, 0.37, 0);
  parts.push(body);

  // 环形凸筋 ×2：扁圆柱凸出栓身 18mm
  for (const y of [0.29, 0.52]) {
    const ring = new THREE.CylinderGeometry(0.102, 0.102, 0.028, 16);
    ring.translate(0, y, 0);
    parts.push(ring);
  }

  // 顶球：半嵌栓身顶（球心 = 栓身顶沿）
  const bonnet = new THREE.SphereGeometry(0.088, 14, 10);
  bonnet.translate(0, 0.64, 0);
  parts.push(bonnet);

  // 顶帽小圆柱尖：基端埋入顶球
  const cap = new THREE.CylinderGeometry(0.014, 0.034, 0.06, 10);
  cap.translate(0, 0.7, 0);
  parts.push(cap);

  // 两侧横伸栓口：Ø0.064 短圆柱绕 Z 旋 90° 横放（内端埋入栓身）
  for (const x of [-0.115, 0.115]) {
    const outlet = new THREE.CylinderGeometry(0.032, 0.032, 0.13, 12);
    outlet.rotateZ(Math.PI / 2);
    outlet.translate(x, 0.44, 0);
    parts.push(outlet);
  }

  const merged = mergeGeometries(parts, true); // groups 顺序 = 输入顺序（材质对齐 materialIndex）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（Cylinder/Sphere 属性集应一致）`);

  const darkBase = createFacilityCastIronMaterial({ color: 0x2f3336, metalness: 0.7, roughness: 0.5 }); // 底座深色铸铁（+铸铁颗粒注入）
  const redPaint = createFacilityEdgeWornPaintMaterial({ color: 0xb02222, metalness: 0.7, roughness: 0.4 }); // 消防红金属漆（+边缘磨损注入）
  return {
    geometry: merged,
    material: [darkBase, redPaint, redPaint, redPaint, redPaint, redPaint, redPaint, redPaint], // 0 底座 / 1–7 红漆件
  };
}
