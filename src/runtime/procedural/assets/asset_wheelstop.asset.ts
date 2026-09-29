/**
 * runtime/procedural/assets/asset_wheelstop.asset —— 程序化设施资产：停车挡车器（T025.1）。
 *
 * 职责：车位尾端橡胶挡车器的纯代码几何与参数化底材——梯形棱柱本体（底宽 0.15 /
 *      顶宽 0.05 / 高 0.10 / 长 0.55〔X 轴〕，**自定义 BufferGeometry**——8 角 6 面
 *      手工构面，uv 逐面归一化 0–1 域）+ 顶棱黄反光条（60×16×60mm 细长条骑顶棱）；
 *      原点 = 底面中心（y=0 是贴地面），真实尺度 550×150×100 聚簇锚（含反光条
 *      总高 0.108 ∈ 100–110 带内）。尺寸/形态锚 =
 *      docs/research/traffic-static-reference.md @1.0 §4（厂家聚簇 Medium
 *      550–560×150–160×100–110 + P7 终审判读三棱/梯形截面、黑体顶棱黄条；
 *      橡胶一体为 Step 0 回填主流态，混凝土 L 型 Weak 记档不建模）。
 * 材质分层表（materialIndex → 部件 → 材质；配方实现在 procedural/materials/
 *      facilityMaterials.ts）：
 *      0 梯形本体 —— 橡胶模压：底材 #1f2124/0/0.92 + rubber-mold 注入
 *              （中低频模压色斑 + 细颗粒哑光起伏——T025.1 新配方，黑体取
 *              #1f2124〔P7 黑色橡塑判读〕）
 *      1 顶棱反光条 —— 反光件黄：纯底材不注入 #edc21c + roughness 0.35 +
 *              emissive 同色 0.25（streetlamp 发光板不注入先例的弱化档）
 *              〔黄反光域：P7 顶棱黄反光条 + GB/T 18833 黄反光膜取 #edc21c〕
 *      uv 契约：本体非基元几何手工构面——每面（底/顶/前后坡/两端）独立 4 顶点、
 *      平面法线、uv 归一化到该面 0–1 域（端面梯形按弦向/高度比例映射，域仍满 0–1）；
 *      反光条 Box 每面 0–1 默认展开。两部件属性集一致（position/normal/uv）可合并。
 * 面数账目（实测，T025.1 探针——设施家族无 lod-spec §5.2 预算行，工程记录口径）：
 *      24 三角面 / 48 顶点（≤3000 线内）；包围盒 h 0.11 / w 0.55（长度向，实测
 *      拱高 0.108 两位舍入）；minY = 0（手工构面字面 0，精确）。
 * 边界：每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；合并后部件中间体即弃；变体（jitter）不进
 *      build（T002.3 seed 掷骰烘 transform/instanceColor）。
 * 记档（裁量项）：① 膨胀螺栓位（底盘穿钉孔）可见性 Weak 省略（Spec §4.2 记档，
 *      近观由 rubber-mold 颗粒承质感）；② 截面取直边梯形（Spec §4.2「按照片
 *      三棱为主、弱弧过渡」——直边为主流判读，弧过渡不加线）；③ 反光条骑顶棱
 *      微宽于顶面（60mm vs 50mm）呈模压包覆态，沉入本体 8mm 防底面共面。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import { createFacilityRubberMoldMaterial } from '../materials/facilityMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_wheelstop',
  name: '停车挡车器',
  category: 'facility',
  tags: ['设施', '挡车器', 'wheel stop'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.03, rotationJitter: 180 }, // 全向摆放；橡胶黑体不漂移，无 hueJitter
  taxonomy: { category: 'facility', family: 'road-facility' }, // 道路设施（T025 批 A 交通静态族）
  presets: [], // 色卡：显式无卡（D44 #2 合法态——设施资产无材质基调变体面）
  proceduralProfile: { heightRange: { min: 0.11, max: 0.11 }, widthRange: { min: 0.55, max: 0.55 } }, // 细模包围盒实测（T025.1 探针：h 0.11（含反光条 0.108）/ w 0.55——长度向）
};

/** 梯形截面参数（Spec §4.2 聚簇 550×150×100）：底半宽 0.075 / 顶半宽 0.025 / 高 0.10 / 长 0.55（X 轴） */
const WS_HALF_BOTTOM = 0.075;
const WS_HALF_TOP = 0.025;
const WS_HEIGHT = 0.1;
const WS_LENGTH = 0.55;

/** 四边形面片推入（四角按外视逆时针序 + 平面法线 + 每面 0–1 uv 域；三角 (0,1,2)(0,2,3)） */
function pushQuad(
  pos: number[],
  nrm: number[],
  uv: number[],
  idx: number[],
  corners: ReadonlyArray<readonly [number, number, number]>,
  normal: readonly [number, number, number],
): void {
  const base = pos.length / 3;
  const cornerUvs: ReadonlyArray<readonly [number, number]> = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];
  for (let i = 0; i < 4; i++) {
    pos.push(corners[i][0], corners[i][1], corners[i][2]);
    nrm.push(normal[0], normal[1], normal[2]);
    uv.push(cornerUvs[i][0], cornerUvs[i][1]);
  }
  idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
}

/** 梯形棱柱本体：8 角 6 面手工构面（非基元——uv 逐面归一化，坡面法线解析计算） */
function buildTrapezoidBody(): THREE.BufferGeometry {
  const hb = WS_HALF_BOTTOM;
  const ht = WS_HALF_TOP;
  const h = WS_HEIGHT;
  const x0 = -WS_LENGTH / 2;
  const x1 = WS_LENGTH / 2;
  // 坡面外法线：(0, ±(hb−ht), h) 归一化（前后坡对称）
  const slopeLen = Math.hypot(hb - ht, h);
  const nSlopeY = (hb - ht) / slopeLen;
  const nSlopeZ = h / slopeLen;

  const pos: number[] = [];
  const nrm: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];

  // 底面（y=0，法线 −Y，外视逆时针）
  pushQuad(pos, nrm, uv, idx, [[x0, 0, hb], [x0, 0, -hb], [x1, 0, -hb], [x1, 0, hb]], [0, -1, 0]);
  // 顶面（y=h，法线 +Y）
  pushQuad(pos, nrm, uv, idx, [[x0, h, -ht], [x0, h, ht], [x1, h, ht], [x1, h, -ht]], [0, 1, 0]);
  // 前坡（+Z 侧：底缘 z=hb → 顶缘 z=ht）
  pushQuad(pos, nrm, uv, idx, [[x0, 0, hb], [x1, 0, hb], [x1, h, ht], [x0, h, ht]], [0, nSlopeY, nSlopeZ]);
  // 后坡（−Z 侧）
  pushQuad(pos, nrm, uv, idx, [[x0, 0, -hb], [x0, h, -ht], [x1, h, -ht], [x1, 0, -hb]], [0, nSlopeY, -nSlopeZ]);
  // 端面 ×2（梯形面；uv 按弦向/高度比例映射满 0–1 域；−X 端角序 A,B,C,D、
  // +X 端角序 A,D,C,B——均标准三角 (0,1,2)(0,2,3)，交叉积复核外向）
  const capUv = (z: number, y: number): readonly [number, number] => [(z + hb) / (2 * hb), y / h];
  const pushCap = (x: number, flip: boolean) => {
    // 梯形四角（z,y）：A(−hb,0) B(+hb,0) C(+ht,h) D(−ht,h)
    const corners: ReadonlyArray<readonly [number, number]> = flip
      ? [[-hb, 0], [hb, 0], [ht, h], [-ht, h]]
      : [[-hb, 0], [-ht, h], [ht, h], [hb, 0]];
    const base = pos.length / 3;
    for (const [z, y] of corners) {
      pos.push(x, y, z);
      nrm.push(flip ? -1 : 1, 0, 0);
      const [u, v] = capUv(z, y);
      uv.push(u, v);
    }
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };
  pushCap(x0, true);
  pushCap(x1, false);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(idx);
  return geometry;
}

export function build(): InstanceSource {
  // 本体：梯形棱柱（手工构面，见 buildTrapezoidBody）
  const body = buildTrapezoidBody();
  // 顶棱黄反光条：60mm 宽细长条骑 50mm 顶棱（模压包覆态），沉入本体 8mm 防底面共面
  const strip = new THREE.BoxGeometry(WS_LENGTH, 0.016, 0.06);
  strip.translate(0, WS_HEIGHT, 0);

  const parts = [body, strip];
  const merged = mergeGeometries(parts, true); // groups 顺序 = 输入顺序（材质对齐 materialIndex）
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（本体/反光条属性集应一致）`);

  const rubber = createFacilityRubberMoldMaterial({ color: 0x1f2124, metalness: 0, roughness: 0.92 }); // 橡胶黑体（+模压色斑/颗粒注入）
  const reflective = new THREE.MeshStandardMaterial({
    color: 0xedc21c,
    emissive: 0xedc21c,
    emissiveIntensity: 0.25,
    metalness: 0,
    roughness: 0.35,
  }); // 顶棱黄反光条（不注入）
  return { geometry: merged, material: [rubber, reflective] }; // 0 本体 / 1 反光条
}
