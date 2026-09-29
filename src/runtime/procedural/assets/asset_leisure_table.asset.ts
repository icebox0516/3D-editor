/**
 * runtime/procedural/assets/asset_leisure_table.asset —— 程序化设施资产：休闲桌（T025.2 批 B）。
 *
 * 职责：桌+凳组合位单体（任务书裁定 7）的纯代码几何与参数化底材——圆桌 + 四凳
 *      环绕连体（冲孔金属款 P1 主形态：肾形凳面环绕）+ 四弯管腿 + 中心柱框架 +
 *      桌面中央伞孔；真实尺度桌 Φ0.7m×高 0.72m（Spec §2.2 [7][8][9] 三源聚簇
 *      承重锚）、凳面高 0.42m（≈桌高 55–60% 照片比读带内取值，Spec §2.2 Weak）；
 *      原点 = 底面中心（y=0 是贴地面）。
 *      裁量记档：①肾形凳面以环带扇段近似（Weak 单照片判读，扇段 R0.40–0.56 ×
 *      65° 弧 ×4 等分）；②「满布冲孔阵」以漆面质感表达、不建孔阵（面数红线
 *      ≤3000 裁量，Spec §2.3）；③框架管径照片比读 Φ25–32 级 → 腿管 Φ28 /
 *      中柱 Φ32（Spec §2.2 Weak）；④中央伞孔 = 真实开孔 Φ50mm 级（Spec §2.2
 *      Weak——挤出环带开孔，中柱顶面在孔下 40mm 处可见，伞穿桌孔语义成立，
 *      与遮阳伞成套语境 §5 互证）。
 * 材质分层表（materialIndex → 部件 → 材质；配方实现在 procedural/materials/
 *      facilityMaterials.ts，uv 域 = Box 型 0–1 域——Extrude 件以形状坐标为 uv，
 *      build 侧归一到件包围域后再合并）：
 *      0    桌面       ┐
 *      1–4  凳面 ×4     ├─ 烤漆橙：底材 #b85c1e/0.05/0.55 + paint-matte-fade
 *                        │  注入（P1 橙漆面相，hex Inferred——Spec §2.3 无标准 hex）
 *      5–16  弯管腿 ×4 套 ┐
 *      17   中心柱      ┘─ 黑烤漆钢管：底材 #24262a/0.75/0.45 + metal-brush-pole
 *                          注入（Spec §2.3「钢管弯管 + 烤漆（黑）」）
 * 面数账目（实测，T025.2 探针——设施家族无 lod-spec §5.2 预算行，工程记录口径）：
 *      1912 三角面 / 2484 顶点（桌面挤出环带 + 凳面挤出扇段 + 管件，≤3000 线内）；包围盒
 *      h 0.720（桌面顶）/ w 1.120（凳面外缘径）；minY ≈ 0（贴地面）。
 * 边界：每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；Extrude 非索引几何经 mergeVertices 焊接转
 *      索引（属性全等才合并——锐边法线保留，merge 兼容）；部件中间体即弃；变体
 *      （jitter）不进 build（T002.3 seed 掷骰烘 transform/instanceColor——
 *      hueJitter 4 = 烤漆色差微漂）；桌伞成套为散布/放置语境（非资产耦合，
 *      任务书裁定 7）。
 */
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import { createFacilityMattePaintMaterial, createFacilityPoleMetalMaterial } from '../materials/facilityMaterials';

/** 凳面环带扇段几何（照片判读 Weak：肾形近似——外 R0.56 / 内 R0.40 / 全弧 65°） */
const SEAT_OUTER_R = 0.56;
const SEAT_INNER_R = 0.4;
const SEAT_HALF_ANGLE = (32.5 * Math.PI) / 180;
/** 桌面中央伞孔半径（Φ50mm 级，Spec §2.2） */
const UMBRELLA_HOLE_R = 0.025;

/** Extrude 件 uv 归一：Extrude 以形状坐标为 uv（非 0–1 域），归一到件自身 uv 包围域
 *  ——facility 配方按 Box 型 0–1 域设计（纹理域契约，facilityMaterials.ts 头注） */
function normalizeShapeUv(geometry: THREE.BufferGeometry): void {
  const uv = geometry.getAttribute('uv') as THREE.BufferAttribute;
  let minU = Infinity;
  let maxU = -Infinity;
  let minV = Infinity;
  let maxV = -Infinity;
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    if (u < minU) minU = u;
    if (u > maxU) maxU = u;
    if (v < minV) minV = v;
    if (v > maxV) maxV = v;
  }
  const spanU = Math.max(maxU - minU, 1e-6);
  const spanV = Math.max(maxV - minV, 1e-6);
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) - minU) / spanU, (uv.getY(i) - minV) / spanV);
}

/** 挤出 → uv 归一 → 焊接转索引（Extrude 非索引，mergeGeometries 要求索引一致）→ 平放 */
function weldFlatSlab(slab: THREE.ExtrudeGeometry, baseY: number): THREE.BufferGeometry {
  normalizeShapeUv(slab);
  const welded = mergeVertices(slab); // 属性全等才合并——锐边法线保留，仅消除重复顶点
  slab.dispose();
  welded.rotateX(-Math.PI / 2); // 形状面 XY → 水平 XZ，挤出向 +Y
  welded.translate(0, baseY, 0);
  return welded;
}

export const meta: ProceduralAssetMeta = {
  id: 'asset_leisure_table',
  name: '休闲桌',
  category: 'facility',
  tags: ['设施', '休闲桌', '桌凳', 'leisure table'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.05, rotationJitter: 180, hueJitter: 4 }, // 烤漆色差允许微漂
  taxonomy: { category: 'facility', family: 'public-facility' }, // 公共设施（T025 批 B 休憩四件套，任务书裁定 1）
  presets: [], // 色卡：显式无卡（D44 #2 合法态——无材质基调变体面）
  proceduralProfile: { heightRange: { min: 0.72, max: 0.72 }, widthRange: { min: 1.12, max: 1.12 } }, // 细模包围盒实测（T025.2 探针：h 0.720（桌面顶）/ w 1.120（凳面外缘径））
};

export function build(): InstanceSource {
  const parts: THREE.BufferGeometry[] = [];

  // ── 桌面（0，烤漆橙）────────────────────────────
  // 圆桌 Φ0.7：外 R0.35 / 中央伞孔 R0.025 真实开孔 / 厚 0.04，顶面 = 桌高 0.72
  const topShape = new THREE.Shape();
  topShape.absarc(0, 0, 0.35, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, UMBRELLA_HOLE_R, 0, Math.PI * 2, true);
  topShape.holes.push(hole);
  parts.push(weldFlatSlab(new THREE.ExtrudeGeometry(topShape, { depth: 0.04, bevelEnabled: false, curveSegments: 28 }), 0.68));

  // ── 凳面 ×4（1–4，烤漆橙）───────────────────────
  // 环带扇段（肾形近似）环绕连体：凳面 0.385–0.42，四向 90° 均布
  const seatShape = new THREE.Shape();
  seatShape.absarc(0, 0, SEAT_OUTER_R, -SEAT_HALF_ANGLE, SEAT_HALF_ANGLE, false);
  seatShape.absarc(0, 0, SEAT_INNER_R, SEAT_HALF_ANGLE, -SEAT_HALF_ANGLE, true);
  seatShape.closePath();
  for (let k = 0; k < 4; k++) {
    const seat = weldFlatSlab(new THREE.ExtrudeGeometry(seatShape, { depth: 0.035, bevelEnabled: false, curveSegments: 10 }), 0.385);
    seat.rotateY((k * Math.PI) / 2);
    parts.push(seat);
  }

  // ── 弯管腿 ×4 套（5–16，黑烤漆钢管）─────────────
  // 竖管顶住凳底（顶端嵌入凳面 5mm）→ 1/4 圆弧扫向中心 → 横撑汇入柱轴；
  // 管径 Φ28（照片比读 Φ25–32 级），横撑顶 0.314 < 凳底 0.385 不穿凳
  for (let k = 0; k < 4; k++) {
    const angle = (k * Math.PI) / 2;
    const post = new THREE.CylinderGeometry(0.014, 0.014, 0.39, 8);
    post.translate(0.46, 0.195, 0);
    post.rotateY(angle);
    parts.push(post);
    // 弯管：圆心 (0.34, 0.18) R0.12，自竖管内侧 (0.46, 0.18) 切向扫至 (0.34, 0.30)
    const bend = new THREE.TorusGeometry(0.12, 0.014, 8, 8, Math.PI / 2);
    bend.translate(0.34, 0.18, 0);
    bend.rotateY(angle);
    parts.push(bend);
    const run = new THREE.CylinderGeometry(0.014, 0.014, 0.34, 8);
    run.rotateZ(Math.PI / 2);
    run.translate(0.17, 0.3, 0);
    run.rotateY(angle);
    parts.push(run);
  }

  // ── 中心柱（17，黑烤漆钢管）─────────────────────
  // Φ32 中柱 0 → 0.68（顶面在伞孔下 40mm——孔位可见柱顶，伞穿桌孔语义）
  const column = new THREE.CylinderGeometry(0.016, 0.016, 0.68, 10);
  column.translate(0, 0.34, 0);
  parts.push(column);

  const merged = mergeGeometries(parts, true); // groups 顺序 = 输入顺序（材质对齐 materialIndex）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（Extrude/Cylinder/Torus 属性集应一致）`);

  const paint = createFacilityMattePaintMaterial({ color: 0xb85c1e, metalness: 0.05, roughness: 0.55 }); // 烤漆橙（+哑光漆注入）
  const frame = createFacilityPoleMetalMaterial({ color: 0x24262a, metalness: 0.75, roughness: 0.45 }); // 黑烤漆钢管（+拉丝注入）
  return {
    geometry: merged,
    material: [
      paint, // 0 桌面
      paint, paint, paint, paint, // 1–4 凳面
      frame, frame, frame, // 5–7 腿 1
      frame, frame, frame, // 8–10 腿 2
      frame, frame, frame, // 11–13 腿 3
      frame, frame, frame, // 14–16 腿 4
      frame, // 17 中心柱
    ],
  };
}
