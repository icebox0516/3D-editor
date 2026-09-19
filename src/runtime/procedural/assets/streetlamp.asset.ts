/**
 * runtime/procedural/assets/streetlamp.asset —— 程序化设施资产：路灯（T002.4；T006.2 两档）。
 *
 * 职责：园区路灯的纯代码几何与参数化底材——双层底座 + 锥度灯杆（下粗上细）+
 *      上仰悬臂 + 灯头（灯壳 + 底面发光板）；真实尺度总高约 4.2m、悬臂外伸约
 *      0.64m；原点 = 底面中心（y=0 是贴地面，与 GLB 放置的 MODEL_BASE_HEIGHT
 *      贴地语义对齐）。径向分段 High 10–16 / Low 4–6，整资产 High 328 / Low 136
 *      三角面（10 万实例面数纪律）。
 * 材质分层表（materialIndex → 部件 → 材质；阶段二已升级 shader 级程序化注入，
 *      配方实现在 procedural/materials/facilityMaterials.ts，uv 域为默认几何展开——
 *      圆柱 u=环绕 v=高度，配方按 v=长度轴设计条纹）：
 *      0 底座下层 ┐
 *      1 底座上层 ├─ 杆件金属：底材 #3d4247/0.85/0.42 + metal-brush-pole 注入
 *      2 灯杆    │  （竖向各向异性拉丝糙度条纹 + 微磨砂颗粒）
 *      3 悬臂    ┘
 *      4 灯壳     —— 深色塑料：底材 #23272b/0/0.55 + grain-fine 注入（橘皮微起伏+白噪微点）
 *      5 发光板   —— 暖白自发光：color+emissive #fff2cc / emissiveIntensity 1.5（不注入，保持纯 emissive）
 *      注入契约：仅明度/细节调制（<color_fragment> 的 vColor 变体乘算链不动），
 *      静态确定性、零纹理资源；0–3 与 4 分别各共享一个 program。
 * LOD（T006.2 非植物第二资产两档——009.6 level 契约跨资产复用验证）：levels 声明
 *      [{high},{low}] 两档（**不完整 LOD 链**——mid 未声明，跳档消费归 006.3 Runtime）；
 *      build 透传 params.level（缺省 'high'——旧无参路径逐位不变）；High = 现状几何
 *      逐位不动（六部件径向分段 16/12/12/10/16/16），Low = **仅降径向分段**至
 *      6/6/6/4/6/6——部件划分、半径、高度、变换、材质分层全部不变，故轮廓剪影
 *      （杆+悬臂+灯头外形）、体量尺寸、materialIndex 0–5 颜色分层语义与 High 一致，
 *      舍弃的只是圆周细分（内部细节）；未声明 mid 的防御回落 = 非 high 一律走 Low
 *      （与 006.1 resolveDeclaredLevel 等距取更低档同语义——Runtime 正常只请求已声明档，
 *      lod-spec §2.3/§6，回落是防御面不是协议依赖）；本资产无 shapeFamily ⇒ 形态身份
 *      = assetId 本身，level 只作缓存档位维度后缀（ProceduralSourceCache `assetId::level`
 *      键，T006.2 扩展），绝不掺形态身份（D19/D23.2）。
 *      材质两档**同配方同底材**（Low 无材质变体——面数已降、配方无变即
 *      customProgramCacheKey 不变，lod-spec §2.3「配方变即键变」）；发光板纯 emissive
 *      两档一致（档间色连续的关键标识）。
 * LOD 预算记账（实测，D19.8——设施家族未立 §5.2 预算行，本账目为工程记录）：
 *      High 328 三角面（4×Σ径向 82）/ 516 顶点；Low 136 三角面（4×Σ径向 34，
 *      ≈ High 41.5%）/ 228 顶点；包围盒 High h 4.2075 / w 0.8944，Low h 差 <0.001、
 *      w 差 0.032（灯头旋件多边形内接致头端微收——剪影外形不变，实测见 T006.2 完成记录）。
 * 边界：每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；发光板只做 emissive 不挂真实光源；
 *      变体（jitter）不进 build（T002.3 seed 掷骰烘 transform/instanceColor）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { createFacilityFineGrainMaterial, createFacilityPoleMetalMaterial } from '../materials/facilityMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_streetlamp',
  name: '路灯',
  category: 'facility',
  tags: ['设施', '路灯', 'streetlamp'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  // 全向摆放；路灯色相不漂移，省略 hueJitter
  variants: { scaleJitter: 0.05, rotationJitter: 180 },
  taxonomy: { category: 'facility', family: 'road-facility' }, // 道路设施（GLB road-facility 目录已有 streetlight 同族）
  proceduralProfile: { heightRange: { min: 4.21, max: 4.21 }, widthRange: { min: 0.89, max: 0.89 } }, // 细模包围盒实测（T010.2 探针：h 4.2075 / w 0.8944——含悬臂外伸与灯头）
  triangleCount: 328, // 实数 = High 档结构计数（多档起声明面取细模档，lod-spec §5.2；Low 136 见模块头 LOD 预算记账）
  levels: [{ id: 'high' }, { id: 'low' }], // LOD 两档（T006.2 不完整链验证——mid 未声明，跳档语义归 006.3 Runtime；D27 首版最小化 [{id}]）
};

/** 径向分段表（High = T002.4 现状逐位不变；Low = 降径向细分，其余几何参数全同） */
const RADIAL_SEGMENTS = {
  high: { basePlate: 16, baseNeck: 12, pole: 12, arm: 10, housing: 16, panel: 16 },
  low: { basePlate: 6, baseNeck: 6, pole: 6, arm: 4, housing: 6, panel: 6 },
} as const;

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.level = LOD 档位（D23/D27.7 Runtime 参数，缺省 'high' = 旧无参路径逐位
  // 不变；不参与形态身份——无 shapeFamily 资产的身份 = assetId，level 只作缓存维度）
  const level = params?.level ?? 'high';
  const seg = level === 'high' ? RADIAL_SEGMENTS.high : RADIAL_SEGMENTS.low;

  // ── 杆件（0–3：金属）─────────────────────────────
  // 底座下层：Ø0.26m 圆盘，底面贴 y=0
  const basePlate = new THREE.CylinderGeometry(0.13, 0.13, 0.05, seg.basePlate);
  basePlate.translate(0, 0.025, 0);
  // 底座上层：收细锥台（0.05 → 0.16）
  const baseNeck = new THREE.CylinderGeometry(0.07, 0.105, 0.11, seg.baseNeck);
  baseNeck.translate(0, 0.105, 0);
  // 灯杆：下粗上细锥度圆柱（Ø0.104 → Ø0.056），0.16 → 4.06
  const pole = new THREE.CylinderGeometry(0.028, 0.052, 3.9, seg.pole);
  pole.translate(0, 0.16 + 1.95, 0);
  // 悬臂：锥度短杆绕 Z 旋 -70°（自杆顶上方以 20° 仰角外伸 0.68m，粗端连杆）
  const arm = new THREE.CylinderGeometry(0.017, 0.026, 0.68, seg.arm);
  arm.rotateZ((-70 * Math.PI) / 180);
  arm.translate(0.32, 4.076, 0); // 悬臂两端中点：杆侧 (0, 3.96) → 灯侧 (0.64, 4.19)

  // ── 灯头（4–5：塑料壳 + 发光板）──────────────────
  // 灯壳：口大上小锥度圆柱，绕 Z 旋 +15°（顶微倾向杆侧、开口朝前下）
  const housing = new THREE.CylinderGeometry(0.07, 0.115, 0.18, seg.housing);
  housing.rotateZ((15 * Math.PI) / 180);
  housing.translate(0.63, 4.07, 0);
  // 发光板：灯壳口沿微凸圆盘，与灯壳同倾角（沿开口方向外推 12mm）
  const panel = new THREE.CylinderGeometry(0.095, 0.095, 0.02, seg.panel);
  panel.rotateZ((15 * Math.PI) / 180);
  panel.translate(0.656, 3.972, 0);

  const parts = [basePlate, baseNeck, pole, arm, housing, panel];
  const merged = mergeGeometries(parts, true); // groups 顺序 = 输入顺序（材质对齐 materialIndex）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（Cylinder 属性集应一致）`);

  const metal = createFacilityPoleMetalMaterial({ color: 0x3d4247, metalness: 0.85, roughness: 0.42 }); // 杆件金属深灰（+拉丝注入）
  const shell = createFacilityFineGrainMaterial({ color: 0x23272b, metalness: 0, roughness: 0.55 }); // 灯壳深色塑料（+细颗粒注入）
  const glow = new THREE.MeshStandardMaterial({
    color: 0xfff2cc,
    emissive: 0xfff2cc,
    emissiveIntensity: 1.5,
    metalness: 0,
    roughness: 0.4,
  }); // 发光板暖白
  return {
    geometry: merged,
    material: [metal, metal, metal, metal, shell, glow], // 0–3 金属 / 4 壳 / 5 板
  };
}
