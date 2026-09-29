/**
 * runtime/procedural/assets/asset_road_barrier.asset —— 程序化设施资产：道路隔离栏·京式（T025.1）。
 *
 * 职责：京式道路隔离栏段的纯代码几何与参数化底材——立柱 ×2（80 方管 x ±1.44 +
 *      顶帽）+ 上横梁（40×80 矩形管 y 1.00）+ 下横梁（y 0.12）+ 竖杆密排 ×24
 *      （Φ16 圆钢 r 0.008，跨下梁顶穿上梁、间距 0.115，顶端 U 形弯头统一朝 +X——
 *      torus 半环 + 短回尾段表达）+ 铸铁底座 ×2 + 立柱橙红反光警示块 ×2；真实
 *      尺度段长 ≈3.0m（X 轴标准段长几何——底座外缘 3.12m；多段拼接由放置/散布
 *      承担，D19.2 契约不扩）、总高 1.10m（GA/T 1567 中央隔离档）；原点 = 底面
 *      中心（y=0 是贴地面）。尺寸/形态锚 =
 *      docs/research/traffic-static-reference.md @1.0 §3（京式 = 全国最普及型，
 *      P5 终审双问一致；段长 3m 四源聚簇 / 立柱 80 方双源 / 竖杆 Φ16 / 中央净高
 *      ≥1.1m Strong）。
 * 材质分层表（materialIndex → 部件 → 材质；配方实现在 procedural/materials/
 *      facilityMaterials.ts，uv 域 = 默认几何展开——Box 每面 0–1、圆柱/torus
 *      环绕展开）：
 *      0–5   立柱 ×2 / 顶帽 ×2 / 上下横梁 ×2 ┐
 *      6–77  竖杆组件 ×24（杆+U 弯头+回尾）  ├─ 白漆钢管：底材 #ececea/0.1/0.55 +
 *                                           ┘  metal-brush-worn 注入（全国白主色
 *                                              〔Spec §3.3「颜色多采用白色」〕取
 *                                              #ececea——与人行护栏同配方同底色
 *                                              共享 program，设计内去重）
 *      78–79 反光警示块 ×2 —— 反光件橙红：纯底材不注入 #e0481d + roughness 0.35 +
 *              emissive 同色 0.25（streetlamp 发光板不注入先例的弱化档）
 *              〔橙红域：GA/T 1567 4.1.6 反光警示装置 + P5 判读取 #e0481d〕
 *      80–81 底座 ×2 —— 铸铁黑：底材 #26292c/0.7/0.55 + cast-iron 注入
 *              （粗砂颗粒 + 浇铸色斑——hydrant 底座同配方）
 * 面数账目（实测，T025.1 探针——设施家族无 lod-spec §5.2 预算行，工程记录口径）：
 *      1656 三角面 / 1632 顶点（任务书 ~1500 目标带邻域、≤3000 线内——竖杆组件
 *      64 面/杆 ×24 = 1536 为主项：竖杆开管 12 + U 弯头 torus 4×5×2=40 + 回尾开管 12）；
 *      包围盒 h 1.10 / w 3.12（底座外缘段长向）；minY ≈ 0（float32 残差 −2e-9，
 *      契约口径内）。
 * 边界：每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；合并后部件中间体即弃；变体（jitter）不进
 *      build（T002.3 seed 掷骰烘 transform/instanceColor）；网片式结构型 Weak 不采
 *      （Spec §3.1）。
 * 记档（裁量项）：① U 形弯头 = 半环 torus（环 R 0.03、管 r 0.0085 微粗于竖杆
 *      0.008——接口包胶密封防共面闪烁）+ 回尾短管（沉入上横梁，读感「弯头上挑
 *      回搭上梁」）；统一朝 +X（段长轴一端），散布旋转后随实例朝向；② 竖杆
 *      沉入下横梁 5mm 起、穿上横梁至 1.041 接弯头（焊接态读感）；③ 反光块贴
 *      立柱 +Z 面（行车侧），膨胀螺栓等安装件省略。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import { createFacilityCastIronMaterial, createFacilityWornFrameMetalMaterial } from '../materials/facilityMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_road_barrier',
  name: '道路隔离栏',
  category: 'facility',
  tags: ['设施', '道路隔离栏', '京式护栏', 'road barrier'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.02, rotationJitter: 180 }, // 全向摆放；白漆警示配色不漂移，无 hueJitter
  taxonomy: { category: 'facility', family: 'road-facility' }, // 道路设施（T025 批 A 交通静态族）
  presets: [], // 色卡：显式无卡（D44 #2 合法态——设施资产无材质基调变体面）
  proceduralProfile: { heightRange: { min: 1.1, max: 1.1 }, widthRange: { min: 3.12, max: 3.12 } }, // 细模包围盒实测（T025.1 探针：h 1.10 / w 3.12——底座外缘段长向，标称段长 3.0）
};

/** 竖杆排布：24 根、间距 0.115、段内对称（最外杆弯头回尾距立柱内缘留 10mm） */
const ROD_COUNT = 24;
const ROD_PITCH = 0.115;

export function build(): InstanceSource {
  const parts: THREE.BufferGeometry[] = [];

  // ── 白漆钢管件（0–77）───────────────────────────
  // 立柱 ×2：80 方管，沉入底座 5mm 起至 1.086（x ±1.44）
  for (const x of [-1.44, 1.44]) {
    const post = new THREE.BoxGeometry(0.08, 1.081, 0.08);
    post.translate(x, 0.5455, 0);
    parts.push(post);
    // 柱顶帽：88mm 方盖压顶，盖顶 = 总高 1.10（GA/T 1567 中央档）
    const cap = new THREE.BoxGeometry(0.088, 0.014, 0.088);
    cap.translate(x, 1.093, 0);
    parts.push(cap);
  }
  // 上下横梁：40×80 矩形管（高 0.04 × 深 0.08），长 2.88 两端沉入立柱
  for (const y of [1.0, 0.12]) {
    const beam = new THREE.BoxGeometry(2.88, 0.04, 0.08);
    beam.translate(0, y, 0);
    parts.push(beam);
  }
  // 竖杆组件 ×24：Φ16 圆钢（radial 6 开管）沉入下梁 5mm（0.135）穿上梁至 1.041，
  // 顶端 U 形弯头（半环 torus，XY 面内朝 +X 弯）+ 回尾短管（0.0082 微细于弯头
  // 管 0.0085，接口包胶密封；尾端沉入上梁）
  for (let i = 0; i < ROD_COUNT; i++) {
    const x = (i - (ROD_COUNT - 1) / 2) * ROD_PITCH;
    const rod = new THREE.CylinderGeometry(0.008, 0.008, 0.906, 6, 1, true);
    rod.translate(x, 0.588, 0);
    parts.push(rod);
    // U 弯头：半环（arc π）绕 Y 翻转让出口落 +X 侧——入口切向 +Y（接竖杆顶 1.04）、
    // 出口切向 −Y（落 x+0.06）；管 r 0.0085 微粗于竖杆防接口共面
    const curl = new THREE.TorusGeometry(0.03, 0.0085, 4, 5, Math.PI);
    curl.rotateY(Math.PI);
    curl.translate(x + 0.03, 1.04, 0);
    parts.push(curl);
    // 回尾段：自弯头出口（x+0.06）下行 26mm 沉入上横梁（两端均藏——开管）
    const tail = new THREE.CylinderGeometry(0.0082, 0.0082, 0.026, 6, 1, true);
    tail.translate(x + 0.06, 1.028, 0);
    parts.push(tail);
  }

  // ── 反光警示块 ×2（78–79）───────────────────────
  // 立柱 +Z 行车面橙红小板（60×100×6mm，沉入柱面 2mm）
  for (const x of [-1.44, 1.44]) {
    const reflector = new THREE.BoxGeometry(0.06, 0.1, 0.006);
    reflector.translate(x, 0.86, 0.041);
    parts.push(reflector);
  }

  // ── 铸铁底座 ×2（80–81）────────────────────────
  // 靴形方墩 240×90×180mm（Spec §3.2 底座锚 0.24×0.10×0.18 级），底面贴 y=0
  for (const x of [-1.44, 1.44]) {
    const base = new THREE.BoxGeometry(0.24, 0.09, 0.18);
    base.translate(x, 0.045, 0);
    parts.push(base);
  }

  const merged = mergeGeometries(parts, true); // groups 顺序 = 输入顺序（材质对齐 materialIndex）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（基元属性集应一致）`);

  const white = createFacilityWornFrameMetalMaterial({ color: 0xececea, metalness: 0.1, roughness: 0.55 }); // 白漆钢管（+拉丝/磨损注入）
  const reflective = new THREE.MeshStandardMaterial({
    color: 0xe0481d,
    emissive: 0xe0481d,
    emissiveIntensity: 0.25,
    metalness: 0,
    roughness: 0.35,
  }); // 橙红反光警示块（不注入）
  const castIron = createFacilityCastIronMaterial({ color: 0x26292c, metalness: 0.7, roughness: 0.55 }); // 铸铁黑底座（+粗砂颗粒注入）
  const materials: THREE.Material[] = [];
  for (let i = 0; i < 6 + ROD_COUNT * 3; i++) materials.push(white); // 0–77 钢管件
  materials.push(reflective, reflective); // 78–79 反光块
  materials.push(castIron, castIron); // 80–81 底座
  return { geometry: merged, material: materials };
}
