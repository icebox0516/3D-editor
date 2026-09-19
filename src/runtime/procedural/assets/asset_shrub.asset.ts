/**
 * runtime/procedural/assets/asset_shrub.asset —— 程序化植物资产：灌木（T003.4）。
 *
 * 职责：灌木的纯代码几何与程序化注入材质——5 团二十面体球簇贴地丛生（1 主团 + 4 侧团，
 *      纵向压扁 0.75–0.85 横阔感、偏心错位无几何对称轴），远看浑圆绿丛、中看
 *      多团起伏体量；真实尺度总高约 0.9m、冠幅约 1.9m；原点 = 底面中心（y=0
 *      是贴地面，主/侧团底缘精确压在 0——贴地不悬空不埋土）。整资产 400 三角面
 *      （单株细模 ≤2000 面数纪律，实数声明在 meta.triangleCount）。
 * 材质分层表：单材质单组（灌木是高密度散布货源，组数即块×资产的 draw 倍率——
 *      从 1 不加倍）：叶绿底 #3f7034 / m 0 / r 0.9 + canopy-shrub 配方
 *      （物体空间位置域：团间色相/明度差 + 贴地暗角 + 微斑，1× vnoise + 1× hash = 4×）。
 * 边界：id 用 asset_shrub；分类 plant 与 GLB manifest 既有植物分类同栏。每次调用
 *      new 全部 geometry/material（所有权随调用移交调用方，缓存会 dispose，禁止
 *      模块级共享对象）；单材质以单值（非数组）返回——InstancedMesh/缓存/释放
 *      通路对 Material | Material[] 同构，层内 useGroups=false 合并（无 groups，
 *      单 draw）；变体（jitter）不进 build（T002.3 seed 掷骰烘 transform/
 *      instanceColor）；levels 为 LOD 接口位占位（本阶段恒单档 'high' 细模，
 *      T006/006.1 实装消费）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import { createShrubCanopyMaterial } from '../materials/plantMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_shrub',
  name: '灌木',
  category: 'plant',
  tags: ['植物', '灌木', 'shrub'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.25, rotationJitter: 180, hueJitter: 12 }, // 丛生体量与叶色自然差异大于乔木
  triangleCount: 400,
  levels: [{ id: 'high' }], // LOD 接口位：单档细模占位
  taxonomy: { category: 'plant', family: 'shrub' }, // 灌木族（T014 建族的第一现役消费者）
  proceduralProfile: { heightRange: { min: 0.9, max: 0.9 }, widthRange: { min: 1.69, max: 1.69 } }, // 细模包围盒实测（T010.2 探针：h 0.9000 / w 1.6900；头注「丛幅≈1.9」为估算值，以实测为准）
};

/** 部件合并：Icosahedron 天生非索引，直接同材质合并（useGroups=false → 无组单 draw） */
function mergeParts(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(parts, false);
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（属性集应一致：position/normal/uv）`);
  return merged;
}

export function build(): InstanceSource {
  // 球团工厂：二十面体 + 纵向压扁 + 定位；[半径, 压扁, x, y, z]——底缘 = y - 半径×压扁
  // ≥0 且主/侧₂ 精确压 0（贴地语义由 boundingBox minY=0 测试锁定）
  const parts: THREE.BufferGeometry[] = [];
  const blob = (radius: number, squash: number, x: number, y: number, z: number): void => {
    const ico = new THREE.IcosahedronGeometry(radius, 1);
    ico.scale(1, squash, 1);
    ico.translate(x, y, z);
    parts.push(ico);
  };

  blob(0.6, 0.75, 0, 0.45, 0); // 主团：0 → 0.9（总高来源）
  blob(0.42, 0.8, 0.42, 0.38, 0.18); // 侧团 ×4：偏心错位，撑开丛幅 ≈1.9m
  blob(0.45, 0.8, -0.4, 0.36, -0.25);
  blob(0.38, 0.85, 0.1, 0.34, -0.42);
  blob(0.4, 0.85, -0.15, 0.4, 0.42);

  // 单材质单值形态（非数组）——底参不变，注入配方见分层表；hueJitter 乘算链完整保留
  const leaf = createShrubCanopyMaterial({ color: 0x3f7034, metalness: 0, roughness: 0.9 }); // 叶绿 + canopy-shrub
  return { geometry: mergeParts(parts), material: leaf }; // 单材质单组：非数组形态
}
