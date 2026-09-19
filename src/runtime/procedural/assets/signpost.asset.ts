/**
 * runtime/procedural/assets/signpost.asset —— 程序化设施资产：标识牌（T002.4）。
 *
 * 职责：园区指路牌的纯代码几何与参数化底材——方基座 + 银灰立柱 + 0.6×0.34m
 *      薄牌面（正面朝 +Z）+ 顶部蓝色指路色带（比牌面厚 4mm、前后各凸 2mm，
 *      色块分区读作信息牌，不做文字）；真实尺度总高约 2.04m；原点 = 底面中心
 *      （y=0 是贴地面，与 GLB 的 MODEL_BASE_HEIGHT 语义对齐）。整资产仅 84
 *      三角面（10 万实例面数纪律）。
 * 材质分层表（materialIndex → 部件 → 材质；阶段二已升级 shader 级程序化注入，
 *      配方实现在 procedural/materials/facilityMaterials.ts，uv 域为默认几何展开
 *      ——牌面/色带正面 uv 即未来文字/图标绘制域（pz 面 v=1 在几何上方））：
 *      0 基座       —— 深灰金属：底材 #3a3f43/0.75/0.5 + metal-brush-pole 注入
 *                      （与路灯杆件共享配方与 program）
 *      1 立柱       —— 银灰金属：底材 #9aa2a8/0.85/0.35 + metal-brush-pole 注入
 *      2 牌面主体   —— 哑光白漆：底材 #e8eaea/0/0.6 + paint-matte-fade 注入
 *                      （橘皮颗粒 + 极轻 v 向日晒褪色梯度与低频褪色斑）
 *      3 顶部指路带 —— 哑光蓝漆：底材 #2a5caa/0/0.55 + paint-matte-fade 注入（同 program）
 *      注入契约：仅明度/细节调制（<color_fragment> 的 vColor 变体乘算链不动），
 *      静态确定性、零纹理资源；金属与哑光漆各一个 program。
 * 边界：每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；牌面内容用色块表达，不渲染文字纹理；
 *      变体（jitter）不进 build（T002.3 seed 掷骰烘 transform/instanceColor）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import { createFacilityMattePaintMaterial, createFacilityPoleMetalMaterial } from '../materials/facilityMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_signpost',
  name: '标识牌',
  category: 'facility',
  tags: ['设施', '标识牌', 'signpost'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  // 全向摆放；牌面色相不漂移，省略 hueJitter
  variants: { scaleJitter: 0.05, rotationJitter: 180 },
  taxonomy: { category: 'facility', family: 'road-facility' }, // 道路设施（指路牌与路灯/街灯同类；GLB road-facility 目录同粒度）
  proceduralProfile: { heightRange: { min: 2.04, max: 2.04 }, widthRange: { min: 0.6, max: 0.6 } }, // 细模包围盒实测（T010.2 探针：h 2.0400 / w 0.6000（牌面宽向））
};

export function build(): InstanceSource {
  // 基座：方墩，底面贴 y=0
  const base = new THREE.BoxGeometry(0.26, 0.06, 0.26);
  base.translate(0, 0.03, 0);
  // 立柱：Ø0.072 圆柱，0.06 → 1.76（上段隐入牌面背后）
  const post = new THREE.CylinderGeometry(0.036, 0.036, 1.7, 12);
  post.translate(0, 0.91, 0);
  // 牌面主体：0.6 × 0.34 × 0.03 薄板，z 前移使其背面咬住立柱、正面朝 +Z
  const plate = new THREE.BoxGeometry(0.6, 0.34, 0.03);
  plate.translate(0, 1.87, 0.033);
  // 顶部指路色带：同宽薄条，厚 4mm 前后各凸 2mm（避免共面、读作双色信息牌）
  const band = new THREE.BoxGeometry(0.6, 0.08, 0.034);
  band.translate(0, 2.0, 0.033);

  const parts = [base, post, plate, band];
  const merged = mergeGeometries(parts, true); // groups 顺序 = 输入顺序（材质对齐 materialIndex）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（Box/Cylinder 属性集应一致）`);

  const baseMetal = createFacilityPoleMetalMaterial({ color: 0x3a3f43, metalness: 0.75, roughness: 0.5 }); // 基座深灰（+拉丝注入）
  const postMetal = createFacilityPoleMetalMaterial({ color: 0x9aa2a8, metalness: 0.85, roughness: 0.35 }); // 立柱银灰（+拉丝注入）
  const platePaint = createFacilityMattePaintMaterial({ color: 0xe8eaea, metalness: 0, roughness: 0.6 }); // 牌面哑光白（+褪色颗粒注入）
  const bandPaint = createFacilityMattePaintMaterial({ color: 0x2a5caa, metalness: 0, roughness: 0.55 }); // 指路带哑光蓝（+褪色颗粒注入）
  return { geometry: merged, material: [baseMetal, postMetal, platePaint, bandPaint] };
}
