/**
 * runtime/procedural/assets/asset_ev_charger.asset —— 程序化设施资产：交流充电桩（T025.3 批 C）。
 *
 * 职责：落地式交流充电桩（一体柜式主形态定一档，任务书裁定 4——桩柱式记 Spec 摘要
 *      不建档）的纯代码几何与参数化底材——大圆角正面钣金柜体 + 正面上部黑色操作
 *      面板（LCD 屏 + 刷卡区 + 急停圆钮语义）+ 顶部指示灯带点缀 + 深灰踢脚 +
 *      侧面枪座挂置充电枪（白枪头 + 黑缆弧线下垂）；真实尺度 0.34×0.151×1.40m
 *      （W×D×H，轴向映射 X×Z×Y）；原点 = 底面中心（y=0 是贴地面）。
 * Spec 数值锚（docs/research/device-p1-reference.md @1.0 §2.2，【承重】）：
 *      一体柜单枪 **340×151×1400mm** [16] 直用（任务书 Value 承重锚）；操作面板
 *      占正面 ≈50–70%（上部）[P2][P3 双问] → 面板 280×780 占正面 ≈51%；屏 LCD
 *      2.8–4.3 寸 [16][18][21] → 屏面 95×65（对角 ≈115mm ≈ 4.3 寸档）；枪线
 *      4–5m【承重】[18][22][23] → **不按 1:1 建模**（挂置态余缆弧线语义——4–5m
 *      整根线缆远超件体尺度，弧线段代表余缆走向，裁量记档）；底部踢脚/法兰
 *      [P1][P2] → 深灰踢脚微凸柜体。
 * 裁量记档：①柜体正面大圆角 = 主 Box + 两侧贴板 + 双 1/4 圆角柱拼合（P2 圆角
 *      语义，圆角半径 45mm 无量值源自定）；②急停圆钮红相（Spec §2.4 P2 屏/急停/
 *      刷卡判读——紧急停车钮工业惯例红）；③枪体 = 锥形枪头 + 握把 + 枪嘴环三段
 *      简化（GB/T 20234 七孔轮廓不建——无标准原文，Spec §2.4 枪形由照片承重）；
 *      ④指示灯带 = 顶部静态点缀面（三态跑马为动效域不建，Spec §2.2 识别特征）；
 *      ⑤屏面/刷卡区同层深色高光（黑面板对比分区为主识别面）。
 * 材质分层表（materialIndex → 部件 → 材质；配方实现在 procedural/materials/
 *      facilityMaterials.ts，uv 域 = 默认几何展开——Box 每面 0–1、圆柱 u=环绕）：
 *      0、11       踢脚 + 枪座 —— 铸铁深灰：底材 #3a3d40/0.6/0.6 + cast-iron 注入
 *                  （Spec §2.3 底座「深灰/黑踢脚」[P1][P2]；枪座 Spec 无独立色相锚
 *                  ——金属挂件随底座深灰裁量；任务书分层表④深灰候选）
 *      1–5         柜体主 Box + 侧板 ×2 + 圆角柱 ×2 —— 钣金白烤漆：底材
 *                  #e9eae6/0.1/0.5 + paint-matte-fade 注入（Spec §2.3 白主调
 *                  静电喷塑；任务书分层表①）
 *      6–8         操作面板 + LCD 屏 + 刷卡区 —— 黑面板高光：纯底材 #14161a/
 *                  0.3/0.25 不注入（Spec §2.3 黑色高光玻璃/亚克力面；任务书②）
 *      9           急停圆钮 —— 深红：纯底材 #c23b22/0.1/0.4 不注入（P2 急停语义）
 *      10          指示灯带 —— 淡绿自发光点缀：纯底材 emissive 不注入
 *                  （Spec §2.2 三态指示识别特征；任务书⑤）
 *      12–13       枪头白壳 + 握把 —— 白壳塑粉：底材 #e8e6e0/0/0.5 + grain-fine
 *                  注入（Spec §2.3 枪头白/灰壳；任务书③grain-fine 候选采纳）
 *      14–15       枪嘴环 + 黑缆 —— 黑色缆料：纯底材 #121316/0.1/0.6 不注入
 *                  （Spec §2.3 黑色缆线；任务书③）
 *      注入契约：仅明度/细节调制（<color_fragment> 的 vColor 变体乘算链不动），
 *      静态确定性、零纹理资源；white / gun / cast 各共享一个 program。
 * 面数账目（实测，T025.3 Step 1 探针——设施家族无 lod-spec §5.2 预算行，工程记录）：
 *      616 三角面 / 703 顶点，单件 ≤3000 线内（任务书裁定 8）；包围盒 h 1.400 /
 *      w 0.473（柜宽 0.34 + 侧挂枪缆外扬）；minY = 0（贴地面）。
 * 边界：每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；合并后部件中间体即弃；变体（jitter）不进
 *      build（T002.3 seed 掷骰烘 transform/instanceColor——白主调不漂移，省略
 *      hueJitter）；拔枪/插枪动画 = T005 联动记档不进本批（任务书裁定 4——枪
 *      静态挂置）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import {
  createFacilityCastIronMaterial,
  createFacilityFineGrainMaterial,
  createFacilityMattePaintMaterial,
} from '../materials/facilityMaterials';

/** 柜体三围（Spec §2.2 [16] 一体柜单枪 340×151×1400mm【承重】，X×Z×Y 轴向映射） */
const CAB = { w: 0.34, d: 0.151, y0: 0.06, y1: 1.4 } as const;
/** 正面大圆角半径（P2 圆角语义，无量值源自定记档） */
const CORNER_R = 0.045;
/** 踢脚（底部深灰基座，微凸柜体） */
const PLINTH = { w: 0.35, d: 0.16, h: 0.06 } as const;

export const meta: ProceduralAssetMeta = {
  id: 'asset_ev_charger',
  name: '交流充电桩',
  category: 'facility',
  tags: ['设施', '交流充电桩', '充电桩', 'ev charger'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.05, rotationJitter: 180 }, // 全向摆放（正面朝向随机真实）；白主调不漂移，省略 hueJitter
  // 设备域无诚实 family 归属——缺席合法态（任务书裁定 2：{category:'facility'} 不填 family）
  taxonomy: { category: 'facility' },
  presets: [], // 色卡：显式无卡（D44 #2 合法态——白柜+绿饰带固定双层材质相非变体，任务书裁定 6）
  proceduralProfile: { heightRange: { min: 1.4, max: 1.4 }, widthRange: { min: 0.47, max: 0.47 } }, // 细模包围盒实测（Step 1 探针：h 1.400（柜顶）/ w 0.473（侧挂枪缆外扬↔柜背））
};

export function build(): InstanceSource {
  const parts: THREE.BufferGeometry[] = [];
  const cabH = CAB.y1 - CAB.y0;
  const cabCy = CAB.y0 + cabH / 2;
  const flatW = CAB.w / 2 - CORNER_R; // 正面平直段半宽 0.125
  const cornerCz = CAB.d / 2 - CORNER_R; // 圆角柱心 z 0.0305

  // ── 踢脚（0：铸铁深灰）──────────────────────────
  const plinth = new THREE.BoxGeometry(PLINTH.w, PLINTH.h, PLINTH.d);
  plinth.translate(0, PLINTH.h / 2, 0);
  parts.push(plinth);

  // ── 柜体（1–5：钣金白，正面大圆角拼合）──────────
  // 主 Box：平直段全深
  const main = new THREE.BoxGeometry(flatW * 2, cabH, CAB.d);
  main.translate(0, cabCy, 0);
  parts.push(main);
  // 两侧贴板：圆角柱后侧至柜背（z 自柜背 -0.0755 至圆角柱心 0.0305）
  for (const sx of [-1, 1]) {
    const slab = new THREE.BoxGeometry(CORNER_R, cabH, cornerCz + CAB.d / 2);
    slab.translate(sx * (flatW + CORNER_R / 2), cabCy, (cornerCz - CAB.d / 2) / 2);
    parts.push(slab);
  }
  // 1/4 圆角柱 ×2：正面两竖棱（θ 从 +Z 扫到 ±X）
  for (const sx of [-1, 1]) {
    const corner = new THREE.CylinderGeometry(
      CORNER_R, CORNER_R, cabH, 6, 1, false,
      sx < 0 ? -Math.PI / 2 : 0, Math.PI / 2,
    );
    corner.translate(sx * flatW, cabCy, cornerCz);
    parts.push(corner);
  }

  // ── 正面上部黑色操作面板（6–8：深色高光）────────
  // 面板 280×780（占正面 ≈51%，Spec ≈50–70% 带内），y 0.57–1.35
  const panel = new THREE.BoxGeometry(0.28, 0.78, 0.012);
  panel.translate(0, 0.96, CAB.d / 2 + 0.006);
  parts.push(panel);
  // LCD 屏 95×65（对角 ≈115mm ≈ 4.3 寸档 [16]）
  const screen = new THREE.BoxGeometry(0.095, 0.065, 0.006);
  screen.translate(0, 1.14, CAB.d / 2 + 0.0155);
  parts.push(screen);
  // 刷卡区（屏下感应区语义）
  const card = new THREE.BoxGeometry(0.1, 0.055, 0.004);
  card.translate(-0.055, 0.97, CAB.d / 2 + 0.0145);
  parts.push(card);

  // ── 急停圆钮（9：深红）+ 指示灯带（10：淡绿自发光）──
  const estop = new THREE.CylinderGeometry(0.02, 0.02, 0.012, 10);
  estop.rotateX(Math.PI / 2);
  estop.translate(0.08, 0.97, CAB.d / 2 + 0.0155);
  parts.push(estop);
  const strip = new THREE.BoxGeometry(0.28, 0.018, 0.006);
  strip.translate(0, 1.385, CAB.d / 2 + 0.0035);
  parts.push(strip);

  // ── 侧面枪座 + 充电枪（+X 侧挂，枪头白壳 + 黑缆弧线）──
  // 枪座（11：铸铁深灰——金属挂件语义）
  const holster = new THREE.BoxGeometry(0.03, 0.12, 0.09);
  holster.translate(CAB.w / 2 + 0.015, 1.02, 0);
  parts.push(holster);
  // 枪头（12：白壳锥形，握把上/枪嘴下挂置态）
  const gunHead = new THREE.CylinderGeometry(0.028, 0.04, 0.11, 10);
  gunHead.translate(0.215, 0.88, 0.005);
  parts.push(gunHead);
  // 握把（13：白壳）
  const grip = new THREE.BoxGeometry(0.036, 0.11, 0.055);
  grip.translate(0.215, 0.985, 0.005);
  parts.push(grip);
  // 枪嘴环（14：黑）
  const nozzle = new THREE.CylinderGeometry(0.026, 0.026, 0.03, 8);
  nozzle.translate(0.215, 0.815, 0.005);
  parts.push(nozzle);
  // 黑缆弧线（15：挂置态余缆下垂——枪线 4–5m 不按 1:1 建模，裁量记档；
  // bike_rack 弯管 tube 先例：CatmullRom + TubeGeometry）
  const cablePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.205, 1.035, -0.005), // 握把尾部引出
    new THREE.Vector3(0.27, 1.0, 0.01),
    new THREE.Vector3(0.285, 0.84, 0.02), // 外扬垂弧最低段
    new THREE.Vector3(0.245, 0.68, 0.015),
    new THREE.Vector3(0.17, 0.63, 0.005),
    new THREE.Vector3(0.15, 0.605, 0), // 没入柜侧（端头藏入体内）
  ]);
  const cable = new THREE.TubeGeometry(cablePath, 28, 0.011, 6, false);
  parts.push(cable);

  const merged = mergeGeometries(parts, true); // groups 顺序 = 输入顺序（材质对齐 materialIndex）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（基元属性集应一致）`);

  const castIron = createFacilityCastIronMaterial({ color: 0x3a3d40, metalness: 0.6, roughness: 0.6 }); // 踢脚+枪座铸铁深灰（+粗砂颗粒注入）
  const white = createFacilityMattePaintMaterial({ color: 0xe9eae6, metalness: 0.1, roughness: 0.5 }); // 柜体钣金白烤漆（+漆颗粒/轻褪色注入）
  const darkPanel = new THREE.MeshStandardMaterial({ color: 0x14161a, metalness: 0.3, roughness: 0.25 }); // 操作面板黑面高光（不注入——Spec §2.3）
  const estopRed = new THREE.MeshStandardMaterial({ color: 0xc23b22, metalness: 0.1, roughness: 0.4 }); // 急停圆钮深红（不注入）
  const stripGlow = new THREE.MeshStandardMaterial({
    color: 0xd8ede0,
    emissive: 0x9fd8b8,
    emissiveIntensity: 0.35,
    metalness: 0,
    roughness: 0.5,
  }); // 指示灯带淡绿点缀（不注入——静态 emissive，streetlamp 发光板先例同则）
  const gunWhite = createFacilityFineGrainMaterial({ color: 0xe8e6e0, metalness: 0, roughness: 0.5 }); // 枪头白壳塑粉（+橘皮细颗粒注入）
  const cableBlack = new THREE.MeshStandardMaterial({ color: 0x121316, metalness: 0.1, roughness: 0.6 }); // 枪嘴环+黑缆（不注入——Spec §2.3）
  return {
    geometry: merged,
    material: [
      castIron, // 0 踢脚
      white, white, white, white, white, // 1–5 柜体拼合
      darkPanel, darkPanel, darkPanel, // 6–8 面板 + 屏 + 刷卡区
      estopRed, // 9 急停钮
      stripGlow, // 10 指示灯带
      castIron, // 11 枪座
      gunWhite, gunWhite, // 12–13 枪头 + 握把
      cableBlack, cableBlack, // 14–15 枪嘴环 + 黑缆
    ],
  };
}
