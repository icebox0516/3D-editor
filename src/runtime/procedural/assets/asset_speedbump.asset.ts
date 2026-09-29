/**
 * runtime/procedural/assets/asset_speedbump.asset —— 程序化设施资产：减速带（T025.1）。
 *
 * 职责：黄黑段式橡胶减速带的纯代码几何与参数化底材——4 段 × 0.5m 交替（黄黑
 *      黄黑，总长 2.0〔X 轴〕）× 弦深 0.35〔Z 轴〕× 拱高 0.045；每段 = 圆弧拱
 *      截面棱柱（**自定义 BufferGeometry**——弧面/端面/底面手工构面，uv 逐面
 *      归一化 0–1 域；弧截面两端自然落地 = 端部斜坡收边〔P11 终审判读「端部呈
 *      斜坡状收低」，无强端头证据 Unknown 不加端头件〕）；原点 = 底面中心
 *      （y=0 是贴地面）。尺寸/形态锚 = docs/research/traffic-static-reference.md
 *      @1.0 §6（交安汇 Strong 负面结论「无全国产品标准」；橡胶规格族聚簇
 *      250/500/1000 × 300/350 × 30/40/50——单段长取 500、宽取 350、拱高取中 45）。
 * 材质分层表（materialIndex → 部件 → 材质；配方实现在 procedural/materials/
 *      facilityMaterials.ts）：
 *      0 黄段 ×2 —— 橡胶模压：底材 #d9a516/0/0.92 + rubber-mold 注入
 *              （交通黄〔Spec §6.3 黄黑分段着色、P11 逐段单色交替〕取 #d9a516）
 *      1 黑段 ×2 —— 橡胶模压：底材 #212327/0/0.92 + rubber-mold 注入
 *              ——同配方不同底色共享一个 program（底色差异走材质 uniform，
 *              设计内去重——T025.1 新配方 rubber-mold 的双色消费首例）
 *      uv 契约：非基元几何手工构面——拱面 u=弧向 0–1 / v=段长向 0–1，端面与
 *      底面各自归一化满 0–1 域；四段属性集一致（position/normal/uv）可合并。
 * 面数账目（实测，T025.1 探针——设施家族无 lod-spec §5.2 预算行，工程记录口径）：
 *      86 三角面 / 106 顶点（≤3000 线内）；包围盒 h 0.05（拱高 0.045 两位舍入）/
 *      w 2.00（段长向）；minY = 0（手工构面端点钳 0，精确）。
 * 边界：每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；合并后部件中间体即弃；变体（jitter）不进
 *      build（T002.3 seed 掷骰烘 transform/instanceColor——无 hueJitter，警示
 *      双色不宜漂移）；总长 2.0 = 标准段拼接几何（4×0.5），跨车道延铺由放置/
 *      散布承担（D19.2 契约不扩）。
 * 记档（裁量项）：① 表面人字防滑纹省略（远观无效细节——rubber-mold 颗粒承
 *      近观质感，Spec §6.2 Inferred）；② 段间接口面不封口——相邻段拱面同截面
 *      逐点续接、外观无缝，封口反成共面内墙（z-fight 防御）；仅两端最外端面
 *      封口；③ 弧向 8 分段（圆心角 57.7° 低拱缓面足够）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import { createFacilityRubberMoldMaterial } from '../materials/facilityMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_speedbump',
  name: '减速带',
  category: 'facility',
  tags: ['设施', '减速带', 'speed bump'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.02, rotationJitter: 180 }, // 全向摆放；黄黑警示双色不漂移，无 hueJitter
  taxonomy: { category: 'facility', family: 'road-facility' }, // 道路设施（T025 批 A 交通静态族）
  presets: [], // 色卡：显式无卡（D44 #2 合法态——设施资产无材质基调变体面）
  proceduralProfile: { heightRange: { min: 0.05, max: 0.05 }, widthRange: { min: 2, max: 2 } }, // 细模包围盒实测（T025.1 探针：h 0.04（拱高 0.045 两位舍入）/ w 2.00——段长向）
};

/** 减速带截面参数（Spec §6.2 聚簇）：弦深 0.35 / 拱高 0.045 / 单段长 0.5 / 弧向分段 8 */
const SB_CHORD = 0.35;
const SB_RISE = 0.045;
const SB_SEG_LEN = 0.5;
const SB_ARC_DIV = 8;
/** 过弦两端与拱顶三点的圆弧半径（R = (c²/4 + h²) / 2h）与半圆心角 */
const SB_ARC_R = (SB_CHORD * SB_CHORD) / 4 + SB_RISE * SB_RISE;
const ARC_RADIUS = SB_ARC_R / (2 * SB_RISE);
const HALF_ANGLE = Math.asin(SB_CHORD / 2 / ARC_RADIUS);

/** 单段圆弧拱棱柱（弧面 + 底面 + 可选外端面；端点 y 钳 0 保 minY 精确贴地） */
function buildArchSegment(x0: number, x1: number, capStart: boolean, capEnd: boolean): THREE.BufferGeometry {
  const centerY = SB_RISE - ARC_RADIUS;
  const pos: number[] = [];
  const nrm: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];

  // 拱面：θ ∈ [−α, +α] 双排顶点（u = 弧向 0–1，v = 段长向 0–1）
  const rowA: number[] = []; // x0 排
  const rowB: number[] = []; // x1 排
  for (let i = 0; i <= SB_ARC_DIV; i++) {
    const theta = -HALF_ANGLE + (2 * HALF_ANGLE * i) / SB_ARC_DIV;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    // 弦端点（i=0/N）数学上 y=0——浮点噪声钳 0（minY=0 精确贴地语义）
    const y = i === 0 || i === SB_ARC_DIV ? 0 : centerY + ARC_RADIUS * cos;
    rowA.push(pos.length / 3);
    pos.push(x0, y, ARC_RADIUS * sin);
    nrm.push(0, cos, sin);
    uv.push(i / SB_ARC_DIV, 0);
    rowB.push(pos.length / 3);
    pos.push(x1, y, ARC_RADIUS * sin);
    nrm.push(0, cos, sin);
    uv.push(i / SB_ARC_DIV, 1);
  }
  for (let i = 0; i < SB_ARC_DIV; i++) {
    idx.push(rowA[i], rowA[i + 1], rowB[i + 1], rowA[i], rowB[i + 1], rowB[i]); // 外向绕序（交叉积复核）
  }

  // 底面：y=0 弦面矩形（法线 −Y）
  const b0 = pos.length / 3;
  pos.push(x0, 0, -SB_CHORD / 2, x0, 0, SB_CHORD / 2, x1, 0, SB_CHORD / 2, x1, 0, -SB_CHORD / 2);
  nrm.push(0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0);
  uv.push(0, 0, 0, 1, 1, 1, 1, 0);
  idx.push(b0, b0 + 2, b0 + 1, b0, b0 + 3, b0 + 2);

  // 端面：弧多边形扇形收敛（u = 弦向 0–1 / v = 拱高向 0–1）；仅外露端收口
  //（段间接口不封——相邻段拱面逐点续接，封口反成共面内墙，见头注记档②）
  const cap = (x: number, outward: number) => {
    const fan: number[] = [];
    for (let i = 0; i <= SB_ARC_DIV; i++) {
      const theta = -HALF_ANGLE + (2 * HALF_ANGLE * i) / SB_ARC_DIV;
      const y = i === 0 || i === SB_ARC_DIV ? 0 : centerY + ARC_RADIUS * Math.cos(theta);
      const z = ARC_RADIUS * Math.sin(theta);
      fan.push(pos.length / 3);
      pos.push(x, y, z);
      nrm.push(outward, 0, 0);
      uv.push((z + SB_CHORD / 2) / SB_CHORD, y / SB_RISE);
    }
    for (let i = 1; i < SB_ARC_DIV; i++) {
      // 扇形三角自 fan[0] 展开；outward=−1（x0 端）反向绕序保外向
      if (outward < 0) idx.push(fan[0], fan[i + 1], fan[i]);
      else idx.push(fan[0], fan[i], fan[i + 1]);
    }
  };
  if (capStart) cap(x0, -1);
  if (capEnd) cap(x1, 1);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(idx);
  return geometry;
}

export function build(): InstanceSource {
  // 4 段 × 0.5m 交替黄黑黄黑，总长 2.0 居中；仅最外两端封口
  const parts: THREE.BufferGeometry[] = [];
  for (let s = 0; s < 4; s++) {
    const x0 = -2 * SB_SEG_LEN + s * SB_SEG_LEN;
    parts.push(buildArchSegment(x0, x0 + SB_SEG_LEN, s === 0, s === 3));
  }
  const merged = mergeGeometries(parts, true); // groups 顺序 = 输入顺序（材质对齐 materialIndex）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（弧拱段属性集应一致）`);

  const yellow = createFacilityRubberMoldMaterial({ color: 0xd9a516, metalness: 0, roughness: 0.92 }); // 交通黄段（+模压色斑/颗粒注入）
  const black = createFacilityRubberMoldMaterial({ color: 0x212327, metalness: 0, roughness: 0.92 }); // 黑段（同配方不同底色共享 program）
  return { geometry: merged, material: [yellow, black, yellow, black] }; // 0 黄 / 1 黑 / 2 黄 / 3 黑
}
