/**
 * runtime/procedural/assets/asset_trafficcone.asset —— 程序化设施资产：交通锥（T025.1）。
 *
 * 职责：交通锥的纯代码几何与参数化底材——方形底座（0.38×0.045×0.38）+ 锥体
 *      （Cylinder top r 0.030 / bottom r 0.150 / h 0.655 沉入底座 5mm，radial 16，
 *      总高 0.70）+ 白色反光环 1 道（锥面套筒 h 0.08、r+2mm，条顶距锥顶 0.10）；
 *      原点 = 底面中心（y=0 是贴地面）。尺寸/形态锚 =
 *      docs/research/traffic-static-reference.md @1.0 §5（GB/T 24720-2009 Strong：
 *      顶径 60±15 → r 0.030 / 反光面 ≥1 条最小宽 8cm、条顶距顶 10cm、反光面白色 /
 *      底座 4–8 正多边形；市场簇 700×380×380 = 0.70 高度档，Step 0 回填）。
 * 材质分层表（materialIndex → 部件 → 材质；配方实现在 procedural/materials/
 *      facilityMaterials.ts，uv 域 = 默认几何展开——圆柱 u=环绕 v=高度、Box 每面 0–1）：
 *      0 锥体    —— 塑料橘皮面：底材 <色卡>/0/0.5 + grain-fine 注入（PVC/EVA
 *                   哑光微光质感，Spec §5.3）——**preset 消费面（唯一随卡变层）**
 *      1 反光环  —— 反光件白：纯底材不注入 #f2f4f2 + roughness 0.35 + emissive
 *                   同色 0.25（streetlamp 发光板不注入先例的弱化档）
 *                   〔白色：GB/T 24720 5.3「反光面为白色」取 #f2f4f2〕
 *      2 底座    —— 塑料黑：底材 #1a1c1e/0/0.55 + grain-fine 注入（固定不随卡变，
 *                   与锥体同配方共享 program）
 * 色卡消费（T025.1 首个设施色卡——D44 #1「冠变干不变」设施移植：**锥变环不变**）：
 *      build 消费 params.preset——非 'yellow' 一律默认卡（含 undefined / 'default' /
 *      未知 id：读侧归一兜底归 resolveDeclaredPreset，build 防御面只认本资产两卡，
 *      缺省路径逐位一致）；只改锥体基调色（0 层底材 color），几何结构 / 反光环 /
 *      底座分层划分不变。卡值私有域：
 *      default 红   —— GB/T 24720 5.3「锥体内外均宜为红色」+ P8 橙红判读 →
 *                      橙红域 #c44524（标准以色品坐标定义、无标准 hex，Inferred）
 *      yellow  黄   —— P9 荧光黄-柠檬黄域（停车场语境副卡，Spec §5.5）→ #d9c42a
 * 面数账目（实测，T025.1 探针——设施家族无 lod-spec §5.2 预算行，工程记录口径）：
 *      140 三角面 / 224 顶点（≤3000 线内，双卡同几何——preset 不换面数）；包围盒
 *      h 0.70 / w 0.38（底座向）；minY ≈ 0（float32 残差 −9e-10，契约口径内）。
 * 边界：每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；合并后部件中间体即弃；变体（jitter）不进
 *      build（T002.3 seed 掷骰烘 transform/instanceColor——hueJitter 5 = 塑料色差
 *      微漂、警示主色漂移域小）；GB 顶部手持结构（≤0.1H）市场两态并存，素面锥
 *      为一般态不建模（记档）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { DEFAULT_COLOR_PRESET_ID, type ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';
import { createFacilityFineGrainMaterial } from '../materials/facilityMaterials';

/** 锥体色卡（preset 私有域——build 只改锥体基调面；swatch 与此同源） */
const CONE_BODY_PRESETS: Record<string, number> = {
  [DEFAULT_COLOR_PRESET_ID]: 0xc44524, // 红（默认卡）：GB 宜红 + P8 橙红判读 → 橙红域 #c44524
  yellow: 0xd9c42a, // 黄：P9 荧光黄-柠檬黄域 → #d9c42a
};

export const meta: ProceduralAssetMeta = {
  id: 'asset_trafficcone',
  name: '交通锥',
  category: 'facility',
  tags: ['设施', '交通锥', 'traffic cone'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.05, rotationJitter: 180, hueJitter: 5 }, // 塑料色差允许微漂（警示主色漂移域小）
  taxonomy: { category: 'facility', family: 'road-facility' }, // 道路设施（T025 批 A 交通静态族）
  presets: [
    { id: DEFAULT_COLOR_PRESET_ID, label: '红', swatch: '#c44524' }, // swatch 与锥体默认卡底色同源（CONE_BODY_PRESETS default 行）
    { id: 'yellow', label: '黄', swatch: '#d9c42a' }, // 卡 id 入卡 id 域（metadata-taxonomy §2.1 记档归 Step 3 接线）
  ],
  // 单槽形态族（无形态变体）——seed/preset 参数化构建路径的声明闸门：resolvePoolKey /
  // ProceduralSourceCache 均以 shapeFamily 为 seed/preset 声明面（无此声明 → 池键无卡段
  // 同桶 + build 无参收不到 preset，色卡静默失效）。presets 声明必须伴随本声明
  //（T025.1 视觉验收发现的接线缺口，facilityAssets 通用不变量锁防复发）。
  shapeFamily: { size: 1 },
  proceduralProfile: { heightRange: { min: 0.7, max: 0.7 }, widthRange: { min: 0.38, max: 0.38 } }, // 细模包围盒实测（T025.1 探针：h 0.70 / w 0.38——底座向）
};

export function build(params?: ProceduralBuildParams): InstanceSource {
  // params.preset = 色卡 id（T025.1 首个设施色卡消费）：非 'yellow' 一律默认卡
  //（缺省路径逐位一致——锥变环不变，只改 0 层锥体底材 color）
  const bodyColor = params?.preset === 'yellow' ? CONE_BODY_PRESETS.yellow : CONE_BODY_PRESETS[DEFAULT_COLOR_PRESET_ID];

  const parts: THREE.BufferGeometry[] = [];

  // ── 锥体（0，preset 消费面）──────────────────────
  // 圆锥：顶径 Ø60（r 0.030，GB 60±15）/ 底 r 0.150，沉入底座 5mm（0.040–0.700），radial 16
  const cone = new THREE.CylinderGeometry(0.03, 0.15, 0.66, 16);
  cone.translate(0, 0.37, 0);
  parts.push(cone);

  // ── 反光环（1，白色恒定）────────────────────────
  // 锥面套筒（h 0.08，条顶距锥顶 0.10 → y 0.52–0.60；r+2mm 随锥坡 0.0502→0.0647，GB 8cm 锚）
  const band = new THREE.CylinderGeometry(0.0502, 0.0647, 0.08, 16);
  band.translate(0, 0.56, 0);
  parts.push(band);

  // ── 底座（2，黑色恒定）──────────────────────────
  // 方形底座 0.38×0.045×0.38（GB 4–8 正多边形方底主流态 + 市场簇 380）
  const base = new THREE.BoxGeometry(0.38, 0.045, 0.38);
  base.translate(0, 0.0225, 0);
  parts.push(base);

  const merged = mergeGeometries(parts, true); // groups 顺序 = 输入顺序（材质对齐 materialIndex）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（Cylinder/Box 属性集应一致）`);

  const body = createFacilityFineGrainMaterial({ color: bodyColor, metalness: 0, roughness: 0.5 }); // 锥体色卡面（+橘皮微颗粒注入）
  const reflective = new THREE.MeshStandardMaterial({
    color: 0xf2f4f2,
    emissive: 0xf2f4f2,
    emissiveIntensity: 0.25,
    metalness: 0,
    roughness: 0.35,
  }); // 白色反光环（不注入）
  const black = createFacilityFineGrainMaterial({ color: 0x1a1c1e, metalness: 0, roughness: 0.55 }); // 底座黑（+橘皮微颗粒注入）
  return { geometry: merged, material: [body, reflective, black] }; // 0 锥体 / 1 反光环 / 2 底座
}
