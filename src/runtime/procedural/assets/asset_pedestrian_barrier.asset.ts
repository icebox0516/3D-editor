/**
 * runtime/procedural/assets/asset_pedestrian_barrier.asset —— 程序化设施资产：人行护栏段（T025.1）。
 *
 * 职责：人行道边缘横杆式钢管段栏的纯代码几何与参数化底材——立柱 ×2（40 方管，
 *      x ±0.98，柱顶小盖）+ 横杆 3 道（Ø32 圆管，长 1.96，y ≈ 1.02 / 0.58 /
 *      0.14 上/中/下——中杆镶板位不镶板）+ 柱底轻基座小板 ×2；真实尺度段长
 *      2.0m（X 轴标准段长几何，多段拼接由放置/散布承担，D19.2 契约不扩）、
 *      总高 1.10m（GB 50688 7.5.2 净高锚 + P4 柱距判读取 2m 段）；原点 = 底面
 *      中心（y=0 是贴地面）。尺寸/形态锚 =
 *      docs/research/traffic-static-reference.md @1.0 §2（横杆式非密竖杆 Strong 照片
 *      承重；横杆数两读分歧不承重——任务书 Step 0 回填取 3 道带内中值）。
 * 材质分层表（materialIndex → 部件 → 材质）：全部件单材质不分层——白漆钢管：
 *      底材 #ececea/0.1/0.55 + metal-brush-worn 注入（拉丝糙度条纹 + 面缘窄带
 *      磨损微提亮降糙——城市人行护栏白漆通行色〔Spec §2.3 全国白主色〕取
 *      #ececea）；mergeGeometries(parts, false) 单材质单值形态（seedstack 先例，
 *      非 groups 数组——散布主力件省 draw call）；uv 域 = 默认几何展开（Box 每面
 *      0–1 / 圆柱 u=环绕 v=长度）。
 * 面数账目（实测，T025.1 探针——设施家族无 lod-spec §5.2 预算行，工程记录口径）：
 *      216 三角面 / 372 顶点（≤3000 线内）；包围盒 h 1.10 / w 2.05（立柱外缘段长
 *      2.00 + 基座板外凸 25mm×2）；minY ≈ 0（float32 残差 +1e-10，契约口径内）。
 * 边界：每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；合并后部件中间体即弃；变体（jitter）不进
 *      build（T002.3 seed 掷骰烘 transform/instanceColor）；专用管径 Unknown
 *      （Spec §2.2）——横杆 Ø32 / 立柱 40 方为同族参考域取值。
 * 记档（裁量项）：① 柱底轻基座小板（90×10×90mm）为裁量添加——照片立柱贴地/
 *      轻底座两态并存（Spec §3.6 差异轴），小板给散布件接地视觉锚（外凸 25mm/侧，
 *      实测 w 2.05 > 立柱外缘段长 2.00）；② 横杆取 Ø32 圆管（32 方管域内取圆管
 *      ——市场横杆圆管常见态，radial 12）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import { createFacilityWornFrameMetalMaterial } from '../materials/facilityMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_pedestrian_barrier',
  name: '人行护栏段',
  category: 'facility',
  tags: ['设施', '人行护栏', 'pedestrian barrier'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.02, rotationJitter: 180 }, // 全向摆放；白漆色不漂移，无 hueJitter
  taxonomy: { category: 'facility', family: 'road-facility' }, // 道路设施（T025 批 A 交通静态族）
  presets: [], // 色卡：显式无卡（D44 #2 合法态——设施资产无材质基调变体面）
  proceduralProfile: { heightRange: { min: 1.1, max: 1.1 }, widthRange: { min: 2.05, max: 2.05 } }, // 细模包围盒实测（T025.1 探针：h 1.10 / w 2.05——立柱外缘 2.00 + 基座板外凸 25mm×2）
};

export function build(): InstanceSource {
  const parts: THREE.BufferGeometry[] = [];

  // ── 立柱 ×2 + 柱顶小盖（0–3）─────────────────────
  // 40 方管立柱：x ±0.98（段长 2.0 = 立柱外缘），沉入基座小板 4mm 起至 1.086
  for (const x of [-0.98, 0.98]) {
    const post = new THREE.BoxGeometry(0.04, 1.082, 0.04);
    post.translate(x, 0.546, 0);
    parts.push(post);
    // 柱顶小盖：48mm 方盖压顶，盖顶 = 总高 1.10（GB 50688 净高锚）
    const cap = new THREE.BoxGeometry(0.048, 0.014, 0.048);
    cap.translate(x, 1.093, 0);
    parts.push(cap);
  }

  // ── 横杆 3 道（4–6）────────────────────────────
  // Ø32 圆管（radial 12）长 1.96，两端沉入立柱；y 1.02 / 0.58 / 0.14 上/中/下
  for (const y of [1.02, 0.58, 0.14]) {
    const rail = new THREE.CylinderGeometry(0.016, 0.016, 1.96, 12);
    rail.rotateZ(Math.PI / 2);
    rail.translate(0, y, 0);
    parts.push(rail);
  }

  // ── 柱底轻基座小板 ×2（7–8）────────────────────
  // 90×10×90mm 贴地小板（裁量接地锚，见头注记档①）
  for (const x of [-0.98, 0.98]) {
    const plate = new THREE.BoxGeometry(0.09, 0.01, 0.09);
    plate.translate(x, 0.005, 0);
    parts.push(plate);
  }

  const merged = mergeGeometries(parts, false); // 单材质不分组合批（seedstack 单值形态先例）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（Box/Cylinder 属性集应一致）`);

  const white = createFacilityWornFrameMetalMaterial({ color: 0xececea, metalness: 0.1, roughness: 0.55 }); // 白漆钢管（+拉丝/磨损注入）
  return { geometry: merged, material: white };
}
