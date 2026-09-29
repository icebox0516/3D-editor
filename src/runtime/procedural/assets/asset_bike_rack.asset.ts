/**
 * runtime/procedural/assets/asset_bike_rack.asset —— 程序化设施资产：自行车架（T025.2 批 B）。
 *
 * 职责：卡位式槽位段（标准段长一档，任务书裁定 6——无长度 build 参数）的纯代码
 *      几何与参数化底材——长条法兰底板 + 前后高低交替弯管圈口 ×4 组 + 螺栓头；
 *      段规格 1.2×0.53×0.36m（Spec §4.2 [20][22][23] 三源聚簇承重锚：法兰底板
 *      承 1.2×0.53 足印、高圈顶 = 0.36）；原点 = 底面中心（y=0 是贴地面）。
 *      卡位结构（停放语义 = 前轮卡入圈口、车体斜置倚架——T026 联动记档不建车）：
 *      每卡位 = 「前低后高」一对圈口（单车自圈口对之间沿 Z 向滚入，车架倚高圈）；
 *      卡位对沿段长 0.6m 均布（位距 ≈600mm 双位承重锚——Spec §4.2 五源聚簇交叉
 *      推断），对内低高架错位 0.265m → 卡位走廊净宽 0.225m : 高圈 0.36m =
 *      1:1.6（P1「圈口宽:高 ≈1:1.6」两问判读承重）；对间 0.335m 死区 = 车位间隔
 *      （占位宽 0.6m 语义）。裁量记档：①弯管 4 组（照片判读 3–5 组带内——每卡位
 *      低高一对 ×2 卡位）；②圈管径照片比读 Φ30–50 级自定 Φ40（Spec §4.2 Weak）；
 *      ③低圈高 0.24 无可靠数值源自定（≈高圈 2/3）；④段宽 0.53 由法兰底板承载
 *      （三源聚簇承重优先——圈口拱跨取 0.44，法兰面全宽记档）；⑤螺栓孔语义 =
 *      凸栓头示意 ×2（P1「双螺栓孔」判读，无 CSG 开孔）；⑥螺旋式/卡槽式/立体式
 *      型制不并入（Spec §4.1 记档）；⑦材质 304 不锈钢原色相承重（P1——热镀锌
 *      喷塑彩涂相并存不采，Spec §4.3）。
 * 材质分层表（materialIndex → 部件 → 材质；配方实现在 procedural/materials/
 *      facilityMaterials.ts，uv 域 = 默认几何展开——圆柱 u=环绕 v=高度、Box 每
 *      面 0–1）：
 *      0–11  弯管圈口 ×4 组（拱 + 支腿 ×2）—— 304 不锈钢原色：底材
 *            #b4b8bc/0.9/0.35 + metal-brush-pole 注入（拉丝原色相，hex Inferred）
 *      12–14 法兰底板 + 螺栓头 ×2 —— 钢制底板：底材 #9aa0a5/0.85/0.4 +
 *            metal-brush-worn 注入（Spec §4.3 底板相，hex Inferred；面缘磨损
 *            ——安装面/棱线磨蹭语义）
 * 面数账目（实测，T025.2 探针——设施家族无 lod-spec §5.2 预算行，工程记录口径）：
 *      1084 三角面 / 988 顶点（半圆拱 ×4 + 支腿 ×8 + 底板 + 栓头，≤3000 线内）；包围盒
 *      h 0.360（高圈顶）/ w 1.200（段长向）；minY ≈ 0（贴地面）。
 * 边界：每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；合并后部件中间体即弃；变体（jitter）不进
 *      build（T002.3 seed 掷骰烘 transform/instanceColor——金属原色不漂移，省略
 *      hueJitter，streetlamp 先例同则）；停放姿态与单车族联动归 T026（本批不建
 *      车，任务书裁定 6）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import { createFacilityPoleMetalMaterial, createFacilityWornFrameMetalMaterial } from '../materials/facilityMaterials';

/** 圈管半径（Φ40，照片比读 Φ30–50 级自定记档） */
const TUBE_R = 0.02;
/** 圈口拱半径（拱跨跨 Z 向：支腿 z ±0.2，外缘 0.44） */
const STAPLE_R = 0.2;
/** 高/低圈总高（高圈 = 段高 0.36 承重锚；低圈 ≈高圈 2/3 自定记档） */
const HOOP_H = { high: 0.36, low: 0.24 } as const;
/** 卡位对内错位半距（低高架 x 间距始末 ±0.1325 → 走廊净宽 0.265 - 2×管径 = 0.225） */
const PAIR_HALF_OFFSET = 0.1325;
/** 卡位中心（位距 0.6m 双位承重锚） */
const SLOT_X = [-0.3, 0.3];
/** 法兰底板（长条：段规格 1.2×0.53 承重，厚 0.012） */
const FLANGE = { l: 1.2, w: 0.53, t: 0.012 } as const;

export const meta: ProceduralAssetMeta = {
  id: 'asset_bike_rack',
  name: '自行车架',
  category: 'facility',
  tags: ['设施', '自行车架', '停车架', 'bike rack'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.05, rotationJitter: 180 }, // 全向摆放；不锈钢原色不漂移，省略 hueJitter
  taxonomy: { category: 'facility', family: 'public-facility' }, // 公共设施（T025 批 B 休憩四件套，任务书裁定 1）
  presets: [], // 色卡：显式无卡（D44 #2 合法态——无材质基调变体面）
  proceduralProfile: { heightRange: { min: 0.36, max: 0.36 }, widthRange: { min: 1.2, max: 1.2 } }, // 细模包围盒实测（T025.2 探针：h 0.360（高圈顶）/ w 1.200（段长向））
};

export function build(): InstanceSource {
  const parts: THREE.BufferGeometry[] = [];

  // ── 弯管圈口 ×4 组（0–11，不锈钢原色）───────────
  // 卡位对「前低后高」：低圈在卡位前侧、高圈在后侧，错位 0.265m；
  // 每组 = 半圆拱（跨 Z 向）+ 支腿 ×2，支腿立于法兰底板顶（0.012）
  const stapleX = [
    { x: SLOT_X[0] - PAIR_HALF_OFFSET, h: HOOP_H.low },
    { x: SLOT_X[0] + PAIR_HALF_OFFSET, h: HOOP_H.high },
    { x: SLOT_X[1] - PAIR_HALF_OFFSET, h: HOOP_H.low },
    { x: SLOT_X[1] + PAIR_HALF_OFFSET, h: HOOP_H.high },
  ];
  for (const staple of stapleX) {
    const postTop = staple.h - STAPLE_R - TUBE_R; // 拱圆心高（拱顶外缘 = h）
    // 支腿 ×2：z ±0.2，自底板顶至拱起點（低圈腿为短桩，拱近贴板）
    for (const z of [-STAPLE_R, STAPLE_R]) {
      const legLen = postTop - FLANGE.t;
      const leg = new THREE.CylinderGeometry(TUBE_R, TUBE_R, legLen, 8);
      leg.translate(staple.x, FLANGE.t + legLen / 2, z);
      parts.push(leg);
    }
    // 半圆拱：XY 面标准半环旋入 Y-Z 面（跨 Z 向），拱顶外缘 = postTop + R + 管径 = h
    const arch = new THREE.TorusGeometry(STAPLE_R, TUBE_R, 8, 12, Math.PI);
    arch.rotateY(Math.PI / 2);
    arch.translate(staple.x, postTop, 0);
    parts.push(arch);
  }

  // ── 法兰底板（12，钢制底板）─────────────────────
  // 长条法兰 1.2×0.53×0.012（段规格足印承重），落地直置
  const plate = new THREE.BoxGeometry(FLANGE.l, FLANGE.t, FLANGE.w);
  plate.translate(0, FLANGE.t / 2, 0);
  parts.push(plate);

  // ── 螺栓头 ×2（13–14，钢制底板同层）────────────
  // 膨胀栓头示意（P1 双螺栓孔判读——凸栓头承载锚固语义，无 CSG 开孔）
  for (const x of [-0.5, 0.5]) {
    const bolt = new THREE.CylinderGeometry(0.01, 0.01, 0.006, 6);
    bolt.translate(x, FLANGE.t + 0.003, 0);
    parts.push(bolt);
  }

  const merged = mergeGeometries(parts, true); // groups 顺序 = 输入顺序（材质对齐 materialIndex）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（Cylinder/Torus/Box 属性集应一致）`);

  const stainless = createFacilityPoleMetalMaterial({ color: 0xb4b8bc, metalness: 0.9, roughness: 0.35 }); // 304 不锈钢原色（+拉丝注入）
  const plateMetal = createFacilityWornFrameMetalMaterial({ color: 0x9aa0a5, metalness: 0.85, roughness: 0.4 }); // 钢制底板（+拉丝/缘磨损注入）
  return {
    geometry: merged,
    material: [
      stainless, stainless, stainless, // 0–2 圈口 1（低）
      stainless, stainless, stainless, // 3–5 圈口 2（高）
      stainless, stainless, stainless, // 6–8 圈口 3（低）
      stainless, stainless, stainless, // 9–11 圈口 4（高）
      plateMetal, plateMetal, plateMetal, // 12–14 底板 + 栓头 ×2
    ],
  };
}
