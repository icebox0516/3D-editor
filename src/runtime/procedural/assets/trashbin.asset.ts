/**
 * runtime/procedural/assets/trashbin.asset —— 程序化资产：垃圾桶（T002.1 冒烟 → T002.4 升级）。
 *
 * 职责：园区垃圾桶的纯代码几何与参数化底材——微锥金属桶身 + 10 根环布竖棱
 *      （金属板凹凸感）+ 矮底座环 + 双层收边顶盖（宽薄盖沿 + 上层小凸顶）+
 *      投口（近黑内衬 + 前缘微抬的有色翻盖板，翻盖感而非黑洞）；真实尺度
 *      直径约 0.6m、总高约 0.9m；原点 = 底面中心（y=0 是桶底，与 GLB 放置的
 *      MODEL_BASE_HEIGHT 贴地语义对齐）。整资产约 464 三角面（10 万实例面数纪律）。
 * 材质分层表（materialIndex → 部件 → 材质；阶段二已升级 shader 级程序化注入，
 *      配方实现在 procedural/materials/facilityMaterials.ts，uv 域为默认几何展开
 *      ——圆柱 u=环绕 v=高度（v=1 顶端）、Box 每面 0–1，配方按 v=高度轴设计）：
 *      0  桶身          ┐
 *      1–10 竖棱 ×10   ├─ 桶身金属漆：底材 #3f6b52/0.6/0.5 + paint-bin-shell 注入
 *                     ┘   （漆面斑驳 fbm + 竖向使用划痕（u 高频 v 低频露亮金属）+
 *                          v 缘接触暗带——竖棱上下端与桶沿/桶脚的 AO 感暗部）
 *      11 底座环       —— 深灰金属：color #2b302c / metalness 0.7 / roughness 0.5（不注入）
 *      12 盖沿          ┐
 *      13 凸顶         ├─ 盖深灰金属：底材 #39413c/0.75/0.42 + metal-lathe-lid 注入
 *                     ┘   （侧面环向细纹；端面径向同心环——车削纹理，物体法线门控）
 *      14 投口内衬     —— 近黑哑光：color #14181a / metalness 0 / roughness 0.9（不注入）
 *      15 投口翻盖板   —— 亮绿薄板：底材 #52805f/0.5/0.5 + grain-fine 注入
 *                         （橘皮微起伏+白噪微点，保持色相不动）
 *      注入契约：仅明度/细节调制（<color_fragment> 的 vColor 变体乘算链不动），
 *      静态确定性、零纹理资源；桶身/盖/翻盖板各一个 program。
 * 边界：id 保持 asset_trashbin 不变（已放置场景存档引用此 id，改 id 断旧档；
 *      缩略图持久缓存 key 不含版本，旧缓存陈旧为已知边界不处理）。每次调用
 *      new 全部 geometry/material（所有权随调用移交调用方，缓存会 dispose，
 *      禁止模块级共享对象）；竖棱用细 Box 环布等效 CSG；变体（jitter）不进
 *      build（T002.3 seed 掷骰烘 transform/instanceColor）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import {
  createFacilityBinShellPaintMaterial,
  createFacilityFineGrainMaterial,
  createFacilityLatheMetalMaterial,
} from '../materials/facilityMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_trashbin',
  name: '垃圾桶',
  category: 'facility',
  tags: ['设施', '垃圾桶', 'trashbin'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.1, rotationJitter: 180, hueJitter: 6 },
  taxonomy: { category: 'facility', family: 'public-facility' }, // 公共设施（细分与 GLB public-facility 目录同粒度，T016 归并消费）
  proceduralProfile: { heightRange: { min: 0.9, max: 0.9 }, widthRange: { min: 0.68, max: 0.68 } }, // 细模包围盒实测（T010.2 探针：h 0.8993 / w 0.6800——桶身 Ø0.60 + 投口翻盖前伸）
};

export function build(): InstanceSource {
  const parts: THREE.BufferGeometry[] = [];

  // 桶身：微锥圆柱（顶 Ø0.60 / 底 Ø0.57），0.05 → 0.73
  const body = new THREE.CylinderGeometry(0.3, 0.285, 0.68, 20);
  body.translate(0, 0.39, 0);
  parts.push(body);

  // 竖棱 ×10：细 Box 环布外表面（径向凸出约 15mm，金属板凹凸感）
  for (let i = 0; i < 10; i++) {
    const rib = new THREE.BoxGeometry(0.06, 0.62, 0.03);
    const angle = (i / 10) * Math.PI * 2;
    rib.rotateY(angle);
    rib.translate(Math.sin(angle) * 0.295, 0.39, Math.cos(angle) * 0.295);
    parts.push(rib);
  }

  // 底座环：矮圆柱收脚，0 → 0.06
  const baseRing = new THREE.CylinderGeometry(0.31, 0.31, 0.06, 20);
  baseRing.translate(0, 0.03, 0);
  parts.push(baseRing);

  // 盖沿：宽薄圆盘（Ø0.68），0.73 → 0.80
  const lidRim = new THREE.CylinderGeometry(0.34, 0.34, 0.07, 20);
  lidRim.translate(0, 0.765, 0);
  parts.push(lidRim);

  // 凸顶：上层小锥台收边（顶 Ø0.40 / 底 Ø0.49），0.80 → 0.86
  const dome = new THREE.CylinderGeometry(0.2, 0.245, 0.06, 20);
  dome.translate(0, 0.83, 0);
  parts.push(dome);

  // 投口内衬：近黑薄板贴凸顶（翻盖缝隙里读作暗腔）
  const throat = new THREE.BoxGeometry(0.3, 0.008, 0.12);
  throat.translate(0, 0.864, 0);
  parts.push(throat);

  // 投口翻盖板：有色薄板前缘微抬 5°（翻盖感），后缘埋入凸顶
  const flap = new THREE.BoxGeometry(0.26, 0.035, 0.1);
  flap.rotateX((-5 * Math.PI) / 180);
  flap.translate(0, 0.8775, 0);
  parts.push(flap);

  const merged = mergeGeometries(parts, true); // groups 顺序 = 输入顺序（材质对齐 materialIndex）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（Cylinder/Box 属性集应一致）`);

  const shellPaint = createFacilityBinShellPaintMaterial({ color: 0x3f6b52, metalness: 0.6, roughness: 0.5 }); // 桶身深绿金属漆（+斑驳/划痕注入）
  const baseDark = new THREE.MeshStandardMaterial({ color: 0x2b302c, metalness: 0.7, roughness: 0.5 }); // 底座深灰金属（保持参数化）
  const lidMetal = createFacilityLatheMetalMaterial({ color: 0x39413c, metalness: 0.75, roughness: 0.42 }); // 盖深灰金属（+车削环纹注入）
  const innerDark = new THREE.MeshStandardMaterial({ color: 0x14181a, metalness: 0, roughness: 0.9 }); // 投口内近黑哑光（保持参数化）
  const flapPaint = createFacilityFineGrainMaterial({ color: 0x52805f, metalness: 0.5, roughness: 0.5 }); // 翻盖亮绿薄板（+细颗粒注入）
  return {
    geometry: merged,
    material: [
      shellPaint, // 0 桶身
      shellPaint, shellPaint, shellPaint, shellPaint, shellPaint, // 1–5 竖棱
      shellPaint, shellPaint, shellPaint, shellPaint, shellPaint, // 6–10 竖棱
      baseDark, // 11 底座环
      lidMetal, lidMetal, // 12 盖沿 / 13 凸顶
      innerDark, // 14 投口内衬
      flapPaint, // 15 投口翻盖板
    ],
  };
}
