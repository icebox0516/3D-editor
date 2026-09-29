/**
 * runtime/procedural/assets/asset_parasol.asset —— 程序化设施资产：遮阳伞（T025.2 批 B）。
 *
 * 职责：中柱立伞（开伞态）的纯代码几何与参数化底材——8 骨波浪裙边大众款伞面 +
 *      直骨 + 顶帽 + 双径中柱 + 圆盘配重底座；伞径 2.4m 主流档（Spec §3.2
 *      [10][11][15] 多源聚簇）、总高 ≈2.43m（承重带 2.1–2.7m 内取伞径主流档配比
 *      ——伞面缘高 1.94 + 顶帽顶 2.43）；原点 = 底面中心（y=0 是贴地面）。
 *      裁量记档：①伞面 = 八片连续曲面（球面冠 R2.0 反解：缘半径 1.2 + 落差
 *      0.40），波浪裙边 = 缘带竖向跌落（骨点高、片中央跌 0.05）；②高档款 8 斜拉
 *      索不建模（大众款直骨无拉索——Spec §3.1 大众款 [P5][11]）；③柱径照片比读
 *      下段 Φ40–48 / 上段 Φ32–38 → Φ44 / Φ34（Spec §3.2 Weak）；④底座圆盘
 *      Φ0.36×0.07（P4 比读：径≈柱裸高 1/4.5、厚≈径 1/5）；⑤伞面摆动 = 风动
 *      候选（T005 联动，任务书裁定 5——本批静态先行，动画位声明不丢失）；⑥侧立
 *      伞 / 四脚折叠篷为邻类不并入（Spec §3.1 记档）。
 * 材质分层表（materialIndex → 部件 → 材质；配方实现在 procedural/materials/
 *      facilityMaterials.ts，uv 域：伞面自建 uv = u 环绕 0–1 / v 顶→缘 0–1，
 *      其余 = 默认圆柱展开——u 环绕 v=高度）：
 *      0     伞面        —— 哑光布面：底材 <色卡>/0/0.8 + grain-fine 注入
 *                          （涤纶/牛津布哑光微颗粒，Spec §3.3）
 *                          ——**preset 消费面（唯一随卡变层，DoubleSide）**
 *      1–10  伞骨 ×8 + 顶帽（柱/帽）—— 骨架金属：底材 #6b6f74/0.85/0.4 +
 *                          metal-brush-pole 注入（骨架铁相 Spec §3.3）
 *      11–12 中柱双径     —— 柱金属：底材 #7d8288/0.85/0.38 + metal-brush-pole
 *                          注入（Spec §3.3 银灰原色相，hex Inferred；与骨架
 *                          同配方异底材，共享 program）
 *      13    底座圆盘     —— 配重盘：底材 #34383b/0.7/0.55 + cast-iron 注入
 *                          （花岗岩/大理石配重盘深灰理石感近似，Spec §3.3/P4）
 * 色卡消费（任务书裁定 4——批 A 交通锥后第二个设施色卡资产）：build 消费
 *      params.preset，未知卡 id 宽容回退 default（读侧归一 resolveDeclaredPreset
 *      已兜底一层，build 防御面只认本资产三卡，缺省路径逐位一致）；只改伞面基调
 *      材质（0 层底材 color），骨架/柱/底座结构面与分层划分不变——D44 #1「冠变
 *      干不变」设施移植同则（**伞变骨不变**）。卡值私有域（主代理 2026-09-29
 *      裁定，引 Spec §3.5 色相证据面）：
 *      default    米白 —— 园区/商业外摆实拍素色主流（[P1][P3] + 黄页88/抖音源）
 *      dark-green 墨绿 —— 厂家标准三色四源聚簇（[16][18][19]）
 *      wine-red   酒红 —— 同三色双证（[16][19] + [P2] 同款换色实存）
 *      拼色/条纹 = 广告促销语境不建卡（Spec §3.5 Weak）。
 * 面数账目（实测，T025.2 探针——设施家族无 lod-spec §5.2 预算行，工程记录口径）：
 *      824 三角面 / 945 顶点（伞面网格 320 + 骨架/柱/底座基元，≤3000 线内；三卡
 *      同几何——preset 不换面数）；包围盒 h 2.428（顶帽顶）/ w 2.434（伞骨端微
 *      露于伞径 2.4 之外，X/Z 轴取大）；minY ≈ 0（贴地面）。
 * 边界：每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；合并后部件中间体即弃；变体（jitter）不进
 *      build（T002.3 seed 掷骰烘 transform/instanceColor——hueJitter 4 = 布面
 *      色差微漂）；单槽形态族（无形态变体）——seed/preset 参数化构建路径声明
 *      闸门与批 A 锥同语义（shapeFamily 缺声明 → 池键无卡段同桶 + build 收不到
 *      preset，色卡静默失效）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { DEFAULT_COLOR_PRESET_ID, type ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { createFacilityCastIronMaterial, createFacilityFineGrainMaterial, createFacilityPoleMetalMaterial } from '../materials/facilityMaterials';

/** 伞面色卡（preset 私有域——build 只改伞面基调面；swatch 与此同源；裁定 4 定稿值） */
const CANOPY_FABRIC_PRESETS: Record<string, number> = {
  [DEFAULT_COLOR_PRESET_ID]: 0xe8e2d0, // 米白（默认卡）：Spec §3.5 素色主流裁定
  'dark-green': 0x2e4b3c, // 墨绿：厂家标准三色（四源聚簇 Spec §3.5）
  'wine-red': 0x7b2d35, // 酒红：厂家标准三色（双证 + [P2] 实存）
};

/** 伞面拓扑常量：8 片 × 每片 4 段圆周细分 × 6 径向圈（顶→缘） */
const CANOPY_PANELS = 8;
const CANOPY_ANGLE_STEPS = CANOPY_PANELS * 4;
const CANOPY_RINGS = 6;
/** 球面冠半径（缘半径 1.2 + 落差 0.40 反解：(1.2² + 0.4²) / (2×0.4)） */
const CANOPY_CAP_R = 2.0;
const CANOPY_EDGE_R = 1.2;
const CANOPY_APEX_Y = 2.34;
/** 波浪裙边跌落深度（片中央 vs 骨点）与缘带起跌位置（v 向） */
const SKIRT_DIP = 0.05;
const SKIRT_BAND = 0.8;

/** 伞面网格：八片连续曲面 + 波浪裙边（骨点高、片中央跌落），u 环绕 / v 顶→缘 */
function buildCanopyGeometry(): THREE.BufferGeometry {
  const thetaMax = Math.asin(CANOPY_EDGE_R / CANOPY_CAP_R);
  const sinMax = Math.sin(thetaMax);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= CANOPY_ANGLE_STEPS; i++) {
    const a = i / CANOPY_ANGLE_STEPS;
    const angle = a * Math.PI * 2;
    for (let j = 0; j < CANOPY_RINGS; j++) {
      const v = j / (CANOPY_RINGS - 1);
      const theta = thetaMax * v;
      const r = 0.035 + (CANOPY_EDGE_R - 0.035) * (Math.sin(theta) / sinMax);
      const y = CANOPY_APEX_Y - CANOPY_CAP_R * (1 - Math.cos(theta));
      // 波浪裙边：跌落量在骨点（a = k/8）为 0、片中央最大，仅作用于外缘带
      const dip = SKIRT_DIP * (0.5 - 0.5 * Math.cos(2 * Math.PI * CANOPY_PANELS * a));
      const t = Math.min(Math.max((v - SKIRT_BAND) / (1 - SKIRT_BAND), 0), 1);
      const fall = t * t * (3 - 2 * t);
      positions.push(r * Math.cos(angle), y - dip * fall, r * Math.sin(angle));
      uvs.push(a, v);
    }
  }
  for (let i = 0; i < CANOPY_ANGLE_STEPS; i++) {
    for (let j = 0; j < CANOPY_RINGS - 1; j++) {
      const a0 = i * CANOPY_RINGS + j;
      const a1 = (i + 1) * CANOPY_RINGS + j;
      indices.push(a0, a1, a0 + 1, a1, a1 + 1, a0 + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** 骨/柱类直管：单位圆柱缩放至 from→to 长度后按方向摆放（确定性纯函数） */
function tubeBetween(radius: number, radialSegments: number, from: THREE.Vector3, to: THREE.Vector3): THREE.CylinderGeometry {
  const direction = new THREE.Vector3().subVectors(to, from);
  const length = direction.length();
  const tube = new THREE.CylinderGeometry(radius, radius, length, radialSegments);
  tube.translate(0, length / 2, 0);
  tube.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()));
  tube.translate(from.x, from.y, from.z);
  return tube;
}

export const meta: ProceduralAssetMeta = {
  id: 'asset_parasol',
  name: '遮阳伞',
  category: 'facility',
  tags: ['设施', '遮阳伞', '太阳伞', 'parasol'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.05, rotationJitter: 180, hueJitter: 4 }, // 布面色差允许微漂
  taxonomy: { category: 'facility', family: 'public-facility' }, // 公共设施（T025 批 B 休憩四件套，任务书裁定 1）
  presets: [
    { id: DEFAULT_COLOR_PRESET_ID, label: '米白', swatch: '#e8e2d0' }, // swatch 与伞面默认卡底色同源（CANOPY_FABRIC_PRESETS default 行）
    { id: 'dark-green', label: '墨绿', swatch: '#2e4b3c' },
    { id: 'wine-red', label: '酒红', swatch: '#7b2d35' },
  ],
  // 单槽形态族（无形态变体）——seed/preset 参数化构建路径的声明闸门：resolvePoolKey /
  // ProceduralSourceCache 均以 shapeFamily 为 seed/preset 声明面（无此声明 → 池键无卡段
  // 同桶 + build 无参收不到 preset，色卡静默失效）。presets 声明必须伴随本声明
  //（批 A 交通锥教训，facilityAssets 通用不变量锁防复发）。
  shapeFamily: { size: 1 },
  proceduralProfile: { heightRange: { min: 2.43, max: 2.43 }, widthRange: { min: 2.43, max: 2.43 } }, // 细模包围盒实测（T025.2 探针：h 2.428（顶帽顶）/ w 2.430（伞骨端微露））
};

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.preset = 色卡 id（裁定 4）：未知卡一律默认卡（缺省路径逐位一致——伞变骨
  // 不变，只改 0 层伞面底材 color）
  const card = params?.preset ?? DEFAULT_COLOR_PRESET_ID;
  const canopyColor = CANOPY_FABRIC_PRESETS[card] ?? CANOPY_FABRIC_PRESETS[DEFAULT_COLOR_PRESET_ID];

  const parts: THREE.BufferGeometry[] = [];

  // ── 伞面（0，preset 消费面）──────────────────────
  parts.push(buildCanopyGeometry());

  // ── 伞骨 ×8（1–8，骨架金属）─────────────────────
  // 直骨自顶帽下方伞顶延伸至裙边骨点（端头微露伞缘 15mm——伞骨端头实态）
  for (let k = 0; k < CANOPY_PANELS; k++) {
    const angle = (k / CANOPY_PANELS) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    parts.push(
      tubeBetween(
        0.006,
        6,
        new THREE.Vector3(0.055 * cos, 2.318, 0.055 * sin),
        new THREE.Vector3(1.215 * cos, 1.935, 1.215 * sin),
      ),
    );
  }

  // ── 顶帽（9–10，骨架金属）───────────────────────
  // 顶帽柱 + 圆顶（盖住伞面顶环开口与柱顶）
  const cap = new THREE.CylinderGeometry(0.028, 0.028, 0.06, 10);
  cap.translate(0, 2.37, 0);
  parts.push(cap);
  const capDome = new THREE.SphereGeometry(0.028, 8, 6);
  capDome.translate(0, 2.4, 0);
  parts.push(capDome);

  // ── 中柱双径（11–12，柱金属）────────────────────
  // 下段 Φ44 / 上段 Φ34（照片比读 Φ40–48 / Φ32–38 带内），分径台阶 y 1.30
  const poleLower = new THREE.CylinderGeometry(0.022, 0.022, 1.23, 12);
  poleLower.translate(0, 0.685, 0);
  parts.push(poleLower);
  const poleUpper = new THREE.CylinderGeometry(0.017, 0.017, 1.06, 12);
  poleUpper.translate(0, 1.83, 0);
  parts.push(poleUpper);

  // ── 底座圆盘（13，配重盘）───────────────────────
  // Φ0.36×0.07 圆盘配重底座（P4 比读径≈柱裸高 1/4.5、厚≈径 1/5）
  const base = new THREE.CylinderGeometry(0.18, 0.18, 0.07, 24);
  base.translate(0, 0.035, 0);
  parts.push(base);

  const merged = mergeGeometries(parts, true); // groups 顺序 = 输入顺序（材质对齐 materialIndex）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（BufferGeometry/Cylinder/Sphere 属性集应一致）`);

  const canopy = createFacilityFineGrainMaterial({ color: canopyColor, metalness: 0, roughness: 0.8 }); // 伞面色卡面（+细颗粒布感注入）
  canopy.side = THREE.DoubleSide; // 伞面双面可见（伞下仰视）
  const ribMetal = createFacilityPoleMetalMaterial({ color: 0x6b6f74, metalness: 0.85, roughness: 0.4 }); // 骨架金属（+拉丝注入）
  const poleMetal = createFacilityPoleMetalMaterial({ color: 0x7d8288, metalness: 0.85, roughness: 0.38 }); // 柱金属（同配方异底材共享 program）
  const counterweight = createFacilityCastIronMaterial({ color: 0x34383b, metalness: 0.7, roughness: 0.55 }); // 配重盘深灰理石感（+铸铁颗粒注入）
  return {
    geometry: merged,
    material: [
      canopy, // 0 伞面
      ribMetal, ribMetal, ribMetal, ribMetal, ribMetal, ribMetal, ribMetal, ribMetal, // 1–8 伞骨
      ribMetal, ribMetal, // 9–10 顶帽
      poleMetal, poleMetal, // 11–12 中柱
      counterweight, // 13 底座
    ],
  };
}
