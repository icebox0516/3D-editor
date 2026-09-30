/**
 * runtime/procedural/assets/asset_cctv_camera.asset —— 程序化设施资产：监控摄像头（T025.3 批 C）。
 *
 * 职责：杆装枪机监控设备（主形态定一档，任务书裁定 3）的纯代码几何与参数化底材——
 *      方形底法兰 + 锥形钢立杆 + 抱箍 + 顶部横臂 + 万向鸭嘴支架（铰接座简化）+
 *      白色筒形枪机（顶置前伸半壳遮阳罩 + 前端深色视窗圈/镜面 + 红外窗点阵 +
 *      尾线接头）+ 杆顶不锈钢装饰球；真实尺度总高 ≈4.0m、横臂净外伸 ≈0.40m；
 *      原点 = 底面中心（y=0 是贴地面）。杆内走线无明线（Spec §1.2 [P2][P3]——
 *      不建外露线缆）。
 * Spec 数值锚（docs/research/device-p1-reference.md @1.0 §1.2，【承重】）：
 *      立杆高 3.5–6m → 取 4.0m（任务书回填裁量，标准带下沿/园区短杆带 2.5–4m 上沿）；
 *      锥形杆口径 上 Φ76–90 / 下 Φ140–180 → 顶 Φ80 / 底 Φ150；横臂 0.4–2m（园区
 *      单枪 0.3–0.5 常用档）→ 臂全长 0.44（自杆心嵌接，净外伸 ≈0.40 = 常用档中值）；
 *      支臂 Φ≥60 → Φ60；枪机壳体长 0.29–0.40m × 截面 0.10–0.17m → 0.35m × Φ130；
 *      底法兰厚 14mm [2] → 0.014（「法兰盘低出周围地面 20–30mm」的埋入语义归放置
 *      层——贴地 minY=0 纪律，法兰下沿贴地）；抱箍圈 Φ10cm 级 [11] → 抱箍 Φ104。
 * 裁量记档：①底法兰边宽无承重源，取 0.24 方（基础锚栓语义协调），地脚栓 = 凸栓头
 *      示意 ×4（无 CSG 开孔——bike_rack 先例同则）；②鸭嘴支架铰接形态简化为
 *      「臂端垂柱 + 铰接短节」两段（Spec §1.1 近景保留项的远观等价形态）；③红外
 *      补光窗 = 6 点环阵简化（照片多灯珠环语义，Spec §1.3）；④遮阳罩 = 半壳顶置
 *      前伸 0.055（两侧 0.25rad 包边贴杆身）；⑤检修手孔不建（杆身细节，远观不可辨）。
 * 材质分层表（materialIndex → 部件 → 材质；配方实现在 procedural/materials/
 *      facilityMaterials.ts，uv 域 = 默认几何展开——圆柱 u=环绕 v=高度）：
 *      0–6、8–10  底法兰 + 栓头 ×4 + 立杆 + 抱箍 + 横臂 + 垂柱 + 铰接节
 *                 —— 喷塑浅灰白杆件：底材 #b9bdc0/0.35/0.5 + metal-brush-pole 注入
 *                 （Spec §1.3 喷塑白/浅灰主相；任务书分层表①）
 *      7          顶部装饰球 —— 不锈钢亮面：纯底材 #cdd2d4/1.0/0.2 不注入
 *                 （Spec §1.3 亮面球头；任务书分层表④——纯底材件照批 A 反光件先例）
 *      11–12      枪机壳体 + 遮阳罩 —— 白壳哑光塑粉：底材 #e8e6e0/0/0.55 +
 *                 grain-fine 注入（Spec §1.3 米白压铸壳体、罩壳同色一体；任务书②）
 *      13–21      视窗圈 + 镜面 + 红外窗点 ×6 + 尾线接头 —— 深色玻璃/接口相：
 *                 纯底材 #17191c/0.25/0.3 不注入（Spec §1.3 深色视窗圈+红外窗；
 *                 任务书分层表③）
 *      注入契约：仅明度/细节调制（<color_fragment> 的 vColor 变体乘算链不动），
 *      静态确定性、零纹理资源；pole 与 shell 各共享一个 program。
 * 面数账目（实测，T025.3 Step 1 探针——设施家族无 lod-spec §5.2 预算行，工程记录）：
 *      768 三角面 / 1036 顶点，单件 ≤3000 线内（任务书裁定 8）；包围盒 h 4.017 /
 *      w 0.763（含横臂侧伸 + 遮阳罩前伸 + 法兰对边）；minY = 0（贴地面）。
 * 边界：每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；合并后部件中间体即弃；变体（jitter）不进
 *      build（T002.3 seed 掷骰烘 transform/instanceColor——喷塑色相不漂移，省略
 *      hueJitter，streetlamp 先例同则）；云台转动属球机域不进本批形态（裁定 3）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import { createFacilityFineGrainMaterial, createFacilityPoleMetalMaterial } from '../materials/facilityMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_cctv_camera',
  name: '监控摄像头',
  category: 'facility',
  tags: ['设施', '监控摄像头', 'cctv'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.05, rotationJitter: 180 }, // 全向摆放（横臂朝向随机真实）；喷塑色相不漂移，省略 hueJitter
  // 设备域无诚实 family 归属——缺席合法态（任务书裁定 2：{category:'facility'} 不填 family）
  taxonomy: { category: 'facility' },
  presets: [], // 色卡：显式无卡（D44 #2 合法态——白壳/灰杆固定相，任务书裁定 6）
  proceduralProfile: { heightRange: { min: 4.02, max: 4.02 }, widthRange: { min: 0.76, max: 0.76 } }, // 细模包围盒实测（Step 1 探针：h 4.017（装饰球顶）/ w 0.763（臂端遮阳罩前伸↔法兰对边））
};

export function build(): InstanceSource {
  const parts: THREE.BufferGeometry[] = [];

  // ── 杆系（0–6、8–10：喷塑浅灰白金属）──────────────
  // 底法兰：0.24 方板 × 14mm 厚（Spec §1.2 [2] 底法兰厚 14mm），下沿贴 y=0
  const flange = new THREE.BoxGeometry(0.24, 0.014, 0.24);
  flange.translate(0, 0.007, 0);
  parts.push(flange);
  // 地脚栓头 ×4：凸栓示意（无 CSG 开孔——bike_rack 先例同则）
  for (const x of [-0.085, 0.085]) {
    for (const z of [-0.085, 0.085]) {
      const bolt = new THREE.CylinderGeometry(0.011, 0.011, 0.008, 6);
      bolt.translate(x, 0.018, z);
      parts.push(bolt);
    }
  }
  // 锥形立杆：顶 Φ80 / 底 Φ150（口径带内），0.014 → 3.95（4.0m 档含法兰）
  const pole = new THREE.CylinderGeometry(0.04, 0.075, 3.936, 16);
  pole.translate(0, 1.982, 0);
  parts.push(pole);
  // 抱箍：横臂与杆连接处的抱箍圈（Φ104，抱箍圈 Φ10cm 级 [11]）
  const collar = new THREE.CylinderGeometry(0.052, 0.052, 0.05, 12);
  collar.translate(0, 3.74, 0);
  parts.push(collar);
  // 杆顶装饰球（7：不锈钢亮面——独立层）
  const ball = new THREE.SphereGeometry(0.042, 12, 9);
  ball.translate(0, 3.975, 0);
  parts.push(ball);
  // 横臂：Φ60 圆管水平侧伸（支臂 Φ≥60 [1][2]），自杆心嵌接净外伸 ≈0.40
  const arm = new THREE.CylinderGeometry(0.03, 0.03, 0.44, 10);
  arm.rotateZ(-Math.PI / 2);
  arm.translate(0.22, 3.74, 0);
  parts.push(arm);
  // 万向鸭嘴支架（简化）：臂端垂柱 + 铰接短节（Spec §1.1 铰接座简化形态）
  const post = new THREE.CylinderGeometry(0.012, 0.012, 0.11, 8);
  post.translate(0.4, 3.655, 0);
  parts.push(post);
  const duck = new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8);
  duck.translate(0.405, 3.525, 0);
  parts.push(duck);

  // ── 枪机总成（11–21）：局部系沿 +X（镜筒轴），整体前倾 12° 臂端下挂 ──
  const CAM_X = 0.4;
  const CAM_Y = 3.4;
  const TILT = (-12 * Math.PI) / 180;
  const placeCam = (g: THREE.BufferGeometry): THREE.BufferGeometry => {
    g.rotateZ(TILT);
    g.translate(CAM_X, CAM_Y, 0);
    return g;
  };
  // 枪机筒：Φ130 × 350（壳体带内 0.29–0.40 × 0.10–0.17）
  const body = new THREE.CylinderGeometry(0.065, 0.065, 0.35, 16);
  body.rotateZ(-Math.PI / 2);
  parts.push(placeCam(body));
  // 遮阳罩：半壳顶置（两侧 0.25rad 包边贴杆身），前伸越过镜面前沿 0.055
  const shield = new THREE.CylinderGeometry(0.068, 0.068, 0.36, 12, 1, true, Math.PI - 0.25, Math.PI + 0.5);
  shield.rotateZ(-Math.PI / 2);
  shield.translate(0.05, 0.02, 0);
  parts.push(placeCam(shield));
  // 前端视窗圈 + 镜面（深色玻璃相）
  const ring = new THREE.CylinderGeometry(0.056, 0.056, 0.02, 12);
  ring.rotateZ(-Math.PI / 2);
  ring.translate(0.172, 0, 0);
  parts.push(placeCam(ring));
  const lens = new THREE.CylinderGeometry(0.034, 0.034, 0.012, 12);
  lens.rotateZ(-Math.PI / 2);
  lens.translate(0.18, 0, 0);
  parts.push(placeCam(lens));
  // 红外窗点阵 ×6（灯珠环语义简化）
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    const dot = new THREE.CircleGeometry(0.011, 6);
    dot.rotateY(Math.PI / 2);
    dot.translate(0.181, Math.cos(a) * 0.047, Math.sin(a) * 0.047);
    parts.push(placeCam(dot));
  }
  // 尾线接头（尾部深色接口——杆内走线无明线，不建外露线缆）
  const tail = new THREE.CylinderGeometry(0.018, 0.018, 0.03, 8);
  tail.rotateZ(-Math.PI / 2);
  tail.translate(-0.19, 0, 0);
  parts.push(placeCam(tail));

  const merged = mergeGeometries(parts, true); // groups 顺序 = 输入顺序（材质对齐 materialIndex）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（基元属性集应一致）`);

  const poleMetal = createFacilityPoleMetalMaterial({ color: 0xb9bdc0, metalness: 0.35, roughness: 0.5 }); // 喷塑浅灰白杆件（+拉丝注入）
  const shell = createFacilityFineGrainMaterial({ color: 0xe8e6e0, metalness: 0, roughness: 0.55 }); // 枪机白壳哑光塑粉（+橘皮细颗粒注入）
  const darkGlass = new THREE.MeshStandardMaterial({ color: 0x17191c, metalness: 0.25, roughness: 0.3 }); // 视窗圈/镜面/红外窗/尾线深色相（不注入——Spec §1.3）
  const ballSteel = new THREE.MeshStandardMaterial({ color: 0xcdd2d4, metalness: 1.0, roughness: 0.2 }); // 顶部装饰球不锈钢亮面（不注入——Spec §1.3）
  return {
    geometry: merged,
    material: [
      poleMetal, poleMetal, poleMetal, poleMetal, poleMetal, // 0–4 法兰 + 栓头 ×4
      poleMetal, poleMetal, // 5–6 立杆 + 抱箍
      ballSteel, // 7 装饰球
      poleMetal, poleMetal, poleMetal, // 8–10 横臂 + 垂柱 + 铰接节
      shell, shell, // 11–12 枪机壳体 + 遮阳罩
      darkGlass, darkGlass, // 13–14 视窗圈 + 镜面
      darkGlass, darkGlass, darkGlass, darkGlass, darkGlass, darkGlass, // 15–20 红外窗 ×6
      darkGlass, // 21 尾线接头
    ],
  };
}
