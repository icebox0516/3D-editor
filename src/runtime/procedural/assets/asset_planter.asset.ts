/**
 * runtime/procedural/assets/asset_planter.asset —— 程序化设施资产：花箱（T025.2 批 B）。
 *
 * 职责：矩形种植箱的纯代码几何与参数化底材——外板箱体（4 侧板 + 底板）+ 顶部开口
 *      与内衬翻边（PVC 白内衬沿口翻出）+ 下沉土面；真实尺度 1.0×0.5×0.8m（道路
 *      隔离花箱承重锚：高 ≈80cm、宽 ≤50cm——Spec §1.2 [1][3] 双源同句；长取尺寸带
 *      60–150cm 中市政款常见档）；原点 = 底面中心（y=0 是贴地面）。
 *      壁厚 Spec Unknown → 自定 0.03 记档；土面下沉 = 箱高 15%（0.12m，照片比读带
 *      10–20% 内取中，Spec §1.2 Weak）；落地直置无垫脚（Spec §1.2）。
 * 材质分层表（materialIndex → 部件 → 材质；配方实现在 procedural/materials/
 *      facilityMaterials.ts，uv 域 = 默认 Box 展开——每面 0–1）：
 *      0–4  外板 ×5（4 侧 + 底）—— 哑光日晒烤漆：底材 #453229/0.1/0.6 +
 *            paint-matte-fade 注入（深咖啡棕 P1 相，hex Inferred——Spec §1.3
 *            「咖啡棕等深色为主」，无标准 hex 可取）
 *      5–12 内衬 ×8（翻边 ×4 + 内壁 ×4）—— PVC 白内衬：纯底材 #f0eee8/0/0.6
 *            不注入（厂家明示白色内板相，Spec §1.3；批 A 反光件纯底材先例同则）
 *      13   土面      —— 裸土：纯底材 #3c2b20/0/0.95 高粗糙不注入（Spec §1.2/P4
 *            深褐裸土相；箱内蓄排水板语义实存但土面下不可见——不建模记档）
 * 面数账目（实测，T025.2 探针——设施家族无 lod-spec §5.2 预算行，工程记录口径）：
 *      168 三角面 / 336 顶点（14 Box 部件 ×12 面，≤3000 线内）；包围盒 h 0.812
 *      （内衬翻边顶）/ w 1.000（长向）；minY ≈ 0（贴地面）。
 * 边界：每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；合并后部件中间体即弃；变体（jitter）不进
 *      build（T002.3 seed 掷骰烘 transform/instanceColor——hueJitter 5 = 烤漆
 *      色差微漂）；植被填充 = 增补位（T014/T015 植物族落地后联动，任务书裁定 3
 *      ——本资产只交付箱体 + 土面）；土壤块与内衬壁/底板交叠嵌接（交叠面全部
 *      互隐藏于实体内部，不产生可见缝隙也不产生 z-fighting）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import { createFacilityMattePaintMaterial } from '../materials/facilityMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_planter',
  name: '花箱',
  category: 'facility',
  tags: ['设施', '花箱', 'planter'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.05, rotationJitter: 180, hueJitter: 5 }, // 烤漆色差允许微漂
  taxonomy: { category: 'facility', family: 'public-facility' }, // 公共设施（T025 批 B 休憩四件套，任务书裁定 1）
  presets: [], // 色卡：显式无卡（D44 #2 合法态——无材质基调变体面）
  proceduralProfile: { heightRange: { min: 0.81, max: 0.81 }, widthRange: { min: 1.0, max: 1.0 } }, // 细模包围盒实测（T025.2 探针：h 0.812（翻边顶）/ w 1.000（长向））
};

export function build(): InstanceSource {
  const parts: THREE.BufferGeometry[] = [];

  // ── 箱体外板（0–4，深咖啡棕烤漆）────────────────
  // 侧板 4 面：厚 0.03（壁厚 Unknown 自定），高 0.8；前后板全宽 1.0、左右板嵌于其间
  const wallFront = new THREE.BoxGeometry(1.0, 0.8, 0.03);
  wallFront.translate(0, 0.4, 0.235);
  parts.push(wallFront);
  const wallBack = new THREE.BoxGeometry(1.0, 0.8, 0.03);
  wallBack.translate(0, 0.4, -0.235);
  parts.push(wallBack);
  const wallLeft = new THREE.BoxGeometry(0.03, 0.8, 0.44);
  wallLeft.translate(-0.485, 0.4, 0);
  parts.push(wallLeft);
  const wallRight = new THREE.BoxGeometry(0.03, 0.8, 0.44);
  wallRight.translate(0.485, 0.4, 0);
  parts.push(wallRight);
  // 底板：全底面 1.0×0.5，厚 0.03，落地直置
  const bottom = new THREE.BoxGeometry(1.0, 0.03, 0.5);
  bottom.translate(0, 0.015, 0);
  parts.push(bottom);

  // ── 内衬翻边（5–8，PVC 白）──────────────────────
  // 沿口翻边：覆壁顶（0.8–0.812）并向内翻出 0.05（越过壁内侧面 0.22 至 0.17）
  const flangeFront = new THREE.BoxGeometry(1.0, 0.012, 0.08);
  flangeFront.translate(0, 0.806, 0.21);
  parts.push(flangeFront);
  const flangeBack = new THREE.BoxGeometry(1.0, 0.012, 0.08);
  flangeBack.translate(0, 0.806, -0.21);
  parts.push(flangeBack);
  const flangeLeft = new THREE.BoxGeometry(0.08, 0.012, 0.34);
  flangeLeft.translate(-0.46, 0.806, 0);
  parts.push(flangeLeft);
  const flangeRight = new THREE.BoxGeometry(0.08, 0.012, 0.34);
  flangeRight.translate(0.46, 0.806, 0);
  parts.push(flangeRight);

  // ── 内衬内壁（9–12，PVC 白）─────────────────────
  // 衬壁厚 0.012，与外板内侧面留 2mm 暗缝（避免共面）；顶抵翻边底 0.8
  const linerFront = new THREE.BoxGeometry(0.944, 0.77, 0.012);
  linerFront.translate(0, 0.415, 0.212);
  parts.push(linerFront);
  const linerBack = new THREE.BoxGeometry(0.944, 0.77, 0.012);
  linerBack.translate(0, 0.415, -0.212);
  parts.push(linerBack);
  const linerLeft = new THREE.BoxGeometry(0.012, 0.77, 0.424);
  linerLeft.translate(-0.464, 0.415, 0);
  parts.push(linerLeft);
  const linerRight = new THREE.BoxGeometry(0.012, 0.77, 0.424);
  linerRight.translate(0.464, 0.415, 0);
  parts.push(linerRight);

  // ── 土面（13，深褐裸土）─────────────────────────
  // 顶面 y 0.68 = 箱高 0.8 - 下沉 0.12（15%）；四侧嵌进衬壁/外板实体内（无缝隙）
  const soil = new THREE.BoxGeometry(0.95, 0.65, 0.42);
  soil.translate(0, 0.355, 0);
  parts.push(soil);

  const merged = mergeGeometries(parts, true); // groups 顺序 = 输入顺序（材质对齐 materialIndex）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（Box 属性集应一致）`);

  const shell = createFacilityMattePaintMaterial({ color: 0x453229, metalness: 0.1, roughness: 0.6 }); // 外板深咖啡棕（+哑光漆/日晒褪色注入）
  const liner = new THREE.MeshStandardMaterial({ color: 0xf0eee8, metalness: 0, roughness: 0.6 }); // PVC 白内衬（不注入）
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x3c2b20, metalness: 0, roughness: 0.95 }); // 裸土深褐高粗糙（不注入）
  return {
    geometry: merged,
    material: [
      shell, shell, shell, shell, shell, // 0–4 外板
      liner, liner, liner, liner, // 5–8 翻边
      liner, liner, liner, liner, // 9–12 内壁
      soilMat, // 13 土面
    ],
  };
}
