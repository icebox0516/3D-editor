/**
 * runtime/procedural/assets/asset_manhole.asset —— 程序化设施资产：井盖（T025.3 批 C）。
 *
 * 职责：球墨铸铁圆形检查井盖（框 + 盖主形态定一档，任务书裁定 5）的纯代码几何与
 *      单一配方底材——宽边框环（框缘微凸剪影，外缘均布浇筑凹孔）+ 内沉座入盖盘
 *      （满布十字网格防滑纹 + 中央圆形字章凸环 + 矩形字样槽 ×2）；真实尺度
 *      Φ0.85 × 视觉露出高 0.015m（框缘顶）；原点 = 底面中心（y=0 是贴地面，
 *      路面线），三向外观圆盘贴地件。井室/窨井腔不建模（任务书裁定 5——贴地
 *      圆盘放置语义）。
 * Spec 数值锚（docs/research/device-p1-reference.md @1.0 §3.2，【承重】）：
 *      净开孔规格 600/700/800/900 系列、Φ700 = 圆形主流档 → 框净开孔 Φ0.70；
 *      盖盘外径 ≈ 净开孔 +100–200（推断带）→ **Φ0.78**（任务书回填定稿——座入
 *      内沉语义）；防滑花纹面高 3–8mm【承重】→ 网纹 +3.5 / 字章 +6 / 字槽缘
 *      +3.5（全落带内，峰均低于框缘）；**齐平安装 ±3–5mm 偏差带【承重·Strong
 *      多导则聚簇】→ 盖面基面 +0.005（带中值，高于路面）**；「盖面低于框缘」
 *      [P3 内沉判读] → 内沉 10mm，框缘顶 +0.015 = 全件 maxY（§3.1 远景保留项
 *      「贴地灰黑圆盘 + 框缘微凸剪影」）。
 * 裁量记档：①**总高语义修正（主代理裁定 2026-09-29）**：[40]「700×850×80」的
 *      80 = 框体产品深度（埋入路面结构部分——井室不建模，归放置层语义），不消费
 *      为视觉露出高；视觉露出 = 齐平 ±3–5mm（盖面 +0.005）+ 内沉 10mm（框缘
 *      +0.015）承重——原「盖面高于框缘」读向作废（任务书回填歧义修正，修正责任
 *      在主代理）；P3「≈盘径 10–15%」深读数不可信不采；Speedbump/Wheelstop 家族
 *      先例同则（建视觉露出高而非产品埋深）；②浇筑孔 8 个（Spec 8–10 带内，
 *      椭圆孔简化小圆）= **真凹孔**铸出：框顶环带按孔位分段（Ring 弧段）+ 沉孔
 *      筒（内壁镜像法线）+ 沉腔托板——孔不凸出，maxY 恒 = 框缘顶；③字样槽 =
 *      抽象矩形凸槽缘 ×2（规格槽 + 标准槽语义），**不做文字**（文字属贴图域，
 *      任务书回填红线）；④网格贯穿字槽域（铸纹整体语义，不做避让裁剪）；⑤盖缘
 *      裙边 + 沉腔托板封框内空腔（防掠射角透视）。
 * 材质分层表（materialIndex → 部件 → 材质；配方实现在 procedural/materials/
 *      facilityMaterials.ts，uv 域 = 默认几何展开——圆柱/环面 u=环绕、Ring/Circle
 *      平面展开）：**整件单配方 → 单值材质形态（merge 不分组，1 draw call）**：
 *      全件        框环 + 盖盘 + 网纹 + 字章 + 字槽 + 浇筑孔 —— 球墨铸铁灰黑：
 *                  底材 #2f3236/0.55/0.62 + cast-iron 注入（Spec §3.3 灰黑铸铁
 *                  原色单相；任务书分层表①——「粗砂颗粒」即铸铁相）
 *      注入契约：仅明度/细节调制（<color_fragment> 的 vColor 变体乘算链不动），
 *      静态确定性、零纹理资源。
 * 面数账目（实测，T025.3 Step 1 探针——设施家族无 lod-spec §5.2 预算行，工程记录）：
 *      1224 三角面 / 1581 顶点，单件 ≤3000 线内（任务书裁定 8——圆盘最轻件）；
 *      包围盒 h 0.015（框缘顶 = 微凸剪影）/ w 0.850（框外径）；minY = 0（贴地面）。
 * 边界：每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；合并后部件中间体即弃；整件单配方 → merge
 *      useGroups=false + 单值材质（无分组形态——任务书几何纪律单配方分支）；变体
 *      （jitter）不进 build（T002.3 seed 掷骰烘 transform/instanceColor——铸铁
 *      原色不漂移，省略 hueJitter）；盖型差异（雨/污/电字样语义）不进色卡（裁定 5）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import { createFacilityCastIronMaterial } from '../materials/facilityMaterials';

/** 框环几何（外径 Φ0.85、净开孔 Φ0.70【承重】；框缘顶 +0.015 = 全件 maxY 微凸剪影） */
const FRAME = { rOut: 0.425, rBore: 0.35, rimY: 0.015 } as const;
/** 盘几何（盖盘外径 Φ0.78 任务书回填定稿；盖面基面 +0.005 = 齐平带 ±3–5mm 中值，低于框缘 10mm 内沉） */
const COVER = { r: 0.39, faceY: 0.005 } as const;
/** 十字网格防滑纹（R 0.37 步距 0.055；峰 = 盖面 +3.5mm——花纹面高 3–8mm 带内） */
const GRID = { r: 0.37, step: 0.055, barW: 0.008, h: 0.004, cy: 0.0065 } as const;
/** 浇筑凹孔（孔 Φ26 @ r 0.4075；孔筒 0.005→0.015 沉入，顶缘与框缘齐平） */
const DRAIN = { rHole: 0.013, rPos: 0.4075, tubeH: 0.01, floorR: 0.019, floorY: 0.0045 } as const;

export const meta: ProceduralAssetMeta = {
  id: 'asset_manhole',
  name: '井盖',
  category: 'facility',
  tags: ['设施', '井盖', '路面', 'manhole'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.05, rotationJitter: 180 }, // 全向摆放（字样槽朝向随机真实）；铸铁原色不漂移，省略 hueJitter
  // 路面附属语义归 road-facility（候选文档 §2.A / §7——GLB road-facility 目录同域，任务书裁定 2）
  taxonomy: { category: 'facility', family: 'road-facility' },
  presets: [], // 色卡：显式无卡（D44 #2 合法态——球墨铸铁单相；盖型字样差异 = 几何/贴图域非色调语义，裁定 5）
  proceduralProfile: { heightRange: { min: 0.015, max: 0.015 }, widthRange: { min: 0.85, max: 0.85 } }, // 细模包围盒实测（Step 1 探针修正后：h 0.015（框缘顶——齐平微凸剪影）/ w 0.850（框外径））
};

/** 矩形字样槽凸缘（4 条边条围合——抽象槽不做文字，任务书回填红线；峰 = 盖面 +3.5mm） */
function pushSlotFrame(
  parts: THREE.BufferGeometry[],
  cx: number,
  cz: number,
  w: number,
  d: number,
): void {
  const cy = 0.006; // h 0.005 → 顶 0.0085（盖面 0.005 +3.5mm 带内，低于框缘）
  const t = 0.006;
  const top = new THREE.BoxGeometry(w, 0.005, t);
  top.translate(cx, cy, cz + d / 2 - t / 2);
  parts.push(top);
  const bottom = new THREE.BoxGeometry(w, 0.005, t);
  bottom.translate(cx, cy, cz - d / 2 + t / 2);
  parts.push(bottom);
  const left = new THREE.BoxGeometry(t, 0.005, d - t * 2);
  left.translate(cx - w / 2 + t / 2, cy, cz);
  parts.push(left);
  const right = new THREE.BoxGeometry(t, 0.005, d - t * 2);
  right.translate(cx + w / 2 - t / 2, cy, cz);
  parts.push(right);
}

export function build(): InstanceSource {
  const parts: THREE.BufferGeometry[] = [];

  // ── 宽边框环（框壁 + 顶环带分段 + 内沉井筒壁）────────
  // 框外壁：Φ0.85 × 露出高 0.015，下沿贴 y=0（开放筒——底面贴地不可见；
  // [40] 80 埋深不建模——主代理裁定，裁量记档①）
  const wall = new THREE.CylinderGeometry(FRAME.rOut, FRAME.rOut, FRAME.rimY, 40, 1, true);
  wall.translate(0, FRAME.rimY / 2, 0);
  parts.push(wall);
  // 框顶环带：净开孔 0.35 → 外缘 0.425，按 8 孔位分段（弧段让位浇筑凹孔——孔口
  // 由沉孔筒壁承接，衔接圆 = 孔筒顶缘圆，切线闭合无缝隙）
  const drainDelta = Math.asin(DRAIN.rHole / DRAIN.rPos); // 孔口角半径（切向闭合）
  const segLen = Math.PI / 4 - drainDelta * 2;
  for (let k = 0; k < 8; k++) {
    const seg = new THREE.RingGeometry(
      FRAME.rBore, FRAME.rOut, 6, 1,
      -((k + 1) * Math.PI / 4 - drainDelta), segLen, // world φ = -θ（rotateX(-π/2) 映射）
    );
    seg.rotateX(-Math.PI / 2);
    seg.translate(0, FRAME.rimY, 0);
    parts.push(seg);
  }
  // 内沉井筒壁：净开孔筒自框缘顶下沉至盖面（内壁朝轴——内沉深度 cues 面，
  // scale(-1,1,1) 翻法线/绕向，先镜像后平移）
  const bore = new THREE.CylinderGeometry(FRAME.rBore, FRAME.rBore, FRAME.rimY - COVER.faceY, 40, 1, true);
  bore.scale(-1, 1, 1);
  bore.translate(0, (FRAME.rimY + COVER.faceY) / 2, 0);
  parts.push(bore);

  // ── 盖盘（座入内沉：盖面 +0.005 = 齐平带中值）────
  // 盖面：Φ0.78 圆面
  const cover = new THREE.CircleGeometry(COVER.r, 48);
  cover.rotateX(-Math.PI / 2);
  cover.translate(0, COVER.faceY, 0);
  parts.push(cover);
  // 盖缘裙边：盖盘板厚示意（0 → 盖面），封框内空腔下缘
  const skirt = new THREE.CylinderGeometry(COVER.r, COVER.r, COVER.faceY, 48, 1, true);
  skirt.translate(0, COVER.faceY / 2, 0);
  parts.push(skirt);

  // ── 十字网格防滑纹 ×26（双向正交条，铸出语义）────
  for (let k = -6; k <= 6; k++) {
    const d = k * GRID.step;
    const len = 2 * Math.sqrt(GRID.r * GRID.r - d * d); // 端头收进盘缘内
    const alongX = new THREE.BoxGeometry(len, GRID.h, GRID.barW);
    alongX.translate(0, GRID.cy, d);
    parts.push(alongX);
    const alongZ = new THREE.BoxGeometry(GRID.barW, GRID.h, len);
    alongZ.translate(d, GRID.cy, 0);
    parts.push(alongZ);
  }

  // ── 中央圆形字章凸环（+6mm = 花纹域上限，峰 0.0112 < 框缘）──
  const stamp = new THREE.TorusGeometry(0.085, 0.006, 6, 20);
  stamp.rotateX(Math.PI / 2);
  stamp.translate(0, 0.006, 0);
  parts.push(stamp);

  // ── 矩形字样槽 ×2（抽象槽缘——规格槽 + 标准槽语义）──
  pushSlotFrame(parts, 0, 0.22, 0.136, 0.048); // 上部规格槽
  pushSlotFrame(parts, 0, -0.23, 0.091, 0.034); // 下部标准槽

  // ── 浇筑凹孔 ×8（真凹孔：沉孔筒内壁 + 沉腔托板——孔不凸出，
  //    maxY 恒 = 框缘顶；裁剪②）────────────────────
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const px = Math.cos(a) * DRAIN.rPos;
    const pz = Math.sin(a) * DRAIN.rPos;
    // 沉孔筒：内壁朝轴（镜像法线），顶缘与框缘齐平（衔接环带弧段切口）
    const tube = new THREE.CylinderGeometry(DRAIN.rHole, DRAIN.rHole, DRAIN.tubeH, 6, 1, true);
    tube.scale(-1, 1, 1);
    tube.translate(px, FRAME.rimY - DRAIN.tubeH / 2, pz);
    parts.push(tube);
  }
  // 沉腔托板：孔位环带底的整片托板（封框内空腔 + 孔底——掠射角防透视）
  const pocketFloor = new THREE.RingGeometry(0.385, FRAME.rOut, 40);
  pocketFloor.rotateX(-Math.PI / 2);
  pocketFloor.translate(0, DRAIN.floorY, 0);
  parts.push(pocketFloor);

  const merged = mergeGeometries(parts, false); // 整件单配方 → 不分组（单值材质形态，1 draw call）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（基元属性集应一致）`);

  const castIron = createFacilityCastIronMaterial({ color: 0x2f3236, metalness: 0.55, roughness: 0.62 }); // 球墨铸铁灰黑单相（+粗砂颗粒注入——Spec §3.3）
  return { geometry: merged, material: castIron };
}
