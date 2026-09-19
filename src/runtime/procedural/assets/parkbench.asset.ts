/**
 * runtime/procedural/assets/parkbench.asset —— 程序化设施资产：公园长椅（T002.4）。
 *
 * 职责：公园长椅的纯代码几何与参数化底材——4 条纵向坐板木条 + 后仰 10° 的
 *      3 条靠背木条 + 两侧金属腿架（前腿直立 / 后腿随靠背后仰）+ 座下纵梁 +
 *      扶手（含立柱）；真实尺度长 1.7m、座面高 0.43m、靠背顶约 0.81m；
 *      原点 = 底面中心（y=0 是贴地面，与 GLB 的 MODEL_BASE_HEIGHT 语义对齐）。
 *      全 Box 部件 17 个、204 三角面（10 万实例面数纪律）。
 * 材质分层表（materialIndex → 部件 → 材质；阶段二已升级 shader 级程序化注入，
 *      配方实现在 procedural/materials/facilityMaterials.ts，uv 域为默认 Box 展开
 *      ——每面 0–1，pz/±Y 面 v=1 在几何上方，配方按 v=横纹轴设计）：
 *      0–3  坐板木条 ×4 ┐
 *      4–6  靠背木条 ×3 ├─ 木质暖褐：底材 #8a5a33/0/0.8 + wood-slats 注入
 *                     ┘   （v 轴年轮环带 fbm 域扭曲 + 沿 u 纤维细条 + 板间色差；
 *                          板间差异依赖 build 侧每板 uv 烘偏移错域——见
 *                          differentiateWoodUv，变体 hueJitter 8° 经 vColor 叠加其上）
 *      7–8  前腿 ×2     ┐
 *      9–10 后腿 ×2     │
 *      11–12 座下纵梁 ×2 ├─ 金属深灰：底材 #35393d/0.8/0.45 + metal-brush-worn 注入
 *      13–14 扶手 ×2    │  （拉丝糙度条纹 + 面缘窄带磨损微提亮降糙）
 *      15–16 扶手立柱 ×2 ┘
 *      注入契约：仅明度/细节调制（<color_fragment> 的 vColor 变体乘算链不动），
 *      静态确定性、零纹理资源；木与金属各共享一个 program。
 * 边界：id 用 asset_parkbench——manifest 已有 GLB 资产 asset_bench（长椅），统一
 *      注册表跨 kind 共享 id 命名空间、撞名即告警跳过（GLB 先注册者胜，程序化
 *      侧将不可达），故避让改名（与路灯选 streetlamp 避开 GLB streetlight 同则）。
 *      每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；木条不做倒角/榫接细节（uv 完整性优先）；
 *      变体（jitter）不进 build（T002.3 seed 掷骰烘 transform/instanceColor）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import { createFacilityWornFrameMetalMaterial, createFacilityWoodMaterial } from '../materials/facilityMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_parkbench',
  name: '公园长椅',
  category: 'facility',
  tags: ['设施', '长椅', 'parkbench'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.08, rotationJitter: 180, hueJitter: 8 }, // 木色允许自然色差
  taxonomy: { category: 'facility', family: 'public-facility' }, // 公共设施（GLB public-facility 目录已有 bench 同族）
  proceduralProfile: { heightRange: { min: 0.81, max: 0.81 }, widthRange: { min: 1.7, max: 1.7 } }, // 细模包围盒实测（T010.2 探针：h 0.8147（靠背顶）/ w 1.7000（座长向））
};

/** 板条 uv 错域步长（黄金比无理步进，确定性：同 build 同偏移） */
const WOOD_UV_STEP_U = 0.61803398875;
const WOOD_UV_STEP_V = 0.38196601125;

/** 板条 uv 整体平移（板 i 采样域错开）——wood-slats 注入的板间木纹相位与色深微差来源 */
function differentiateWoodUv(slat: THREE.BufferGeometry, woodIndex: number): void {
  const uv = slat.getAttribute('uv') as THREE.BufferAttribute;
  const du = woodIndex * WOOD_UV_STEP_U;
  const dv = woodIndex * WOOD_UV_STEP_V;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) + du, uv.getY(i) + dv);
}

export function build(): InstanceSource {
  const parts: THREE.BufferGeometry[] = [];

  // ── 木质（0–6）──────────────────────────────────
  let woodIndex = 0;
  // 坐板木条 ×4：1.7m 纵向铺开，座面顶 0.43m（板心 0.41）
  for (const z of [-0.1725, -0.0575, 0.0575, 0.1725]) {
    const slat = new THREE.BoxGeometry(1.7, 0.04, 0.095);
    slat.translate(0, 0.41, z);
    differentiateWoodUv(slat, woodIndex++);
    parts.push(slat);
  }
  // 靠背木条 ×3：整体后仰 10°，板心 z = -0.235 - (y - 0.43)·tan10°
  for (const y of [0.53, 0.645, 0.76]) {
    const slat = new THREE.BoxGeometry(1.7, 0.105, 0.035);
    slat.rotateX((-10 * Math.PI) / 180);
    slat.translate(0, y, -0.235 - (y - 0.43) * Math.tan((10 * Math.PI) / 180));
    differentiateWoodUv(slat, woodIndex++);
    parts.push(slat);
  }

  // ── 金属腿架（7–16）─────────────────────────────
  // 前腿 ×2：直立落地（z 向 +Z 为坐前方向）
  for (const x of [-0.72, 0.72]) {
    const leg = new THREE.BoxGeometry(0.05, 0.42, 0.05);
    leg.translate(x, 0.21, 0.17);
    parts.push(leg);
  }
  // 后腿 ×2：与靠背同角后仰 10°，落地端 z≈-0.20、顶端 z≈-0.34（板心 y 取最低角贴地）
  for (const x of [-0.72, 0.72]) {
    const leg = new THREE.BoxGeometry(0.05, 0.8, 0.05);
    leg.rotateX((-10 * Math.PI) / 180);
    leg.translate(x, 0.3983, -0.2695);
    parts.push(leg);
  }
  // 座下纵梁 ×2：贯穿两侧腿架（端头嵌入腿内）
  for (const z of [-0.15, 0.15]) {
    const beam = new THREE.BoxGeometry(1.55, 0.05, 0.05);
    beam.translate(0, 0.37, z);
    parts.push(beam);
  }
  // 扶手 ×2 + 扶手立柱 ×2：立柱自座面抵扶手，扶手后端搭后腿
  for (const x of [-0.72, 0.72]) {
    const rest = new THREE.BoxGeometry(0.05, 0.035, 0.4);
    rest.translate(x, 0.615, -0.07);
    parts.push(rest);
    const post = new THREE.BoxGeometry(0.04, 0.19, 0.04);
    post.translate(x, 0.515, 0.13);
    parts.push(post);
  }

  const merged = mergeGeometries(parts, true); // groups 顺序 = 输入顺序（材质对齐 materialIndex）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（Box 属性集应一致）`);

  const wood = createFacilityWoodMaterial({ color: 0x8a5a33, metalness: 0, roughness: 0.8 }); // 木质暖褐（+木纹注入）
  const metal = createFacilityWornFrameMetalMaterial({ color: 0x35393d, metalness: 0.8, roughness: 0.45 }); // 金属深灰（+拉丝/磨损注入）
  return {
    geometry: merged,
    material: [
      wood, wood, wood, wood, // 0–3 坐板
      wood, wood, wood, // 4–6 靠背
      metal, metal, // 7–8 前腿
      metal, metal, // 9–10 后腿
      metal, metal, // 11–12 座下纵梁
      metal, metal, // 13–14 扶手
      metal, metal, // 15–16 扶手立柱
    ],
  };
}
