/**
 * runtime/procedural/assets/asset_seedstack.asset —— DEV 管线验证资产：seed 驱动堆叠方块塔（T008.1）。
 *
 * 职责：D19 参数化 build 契约的最小实证资产——4–6 层 Box 堆叠成塔，每层尺寸/旋转/
 *      色相/错位由 mulberry32(params.seed) 线性派生（消费顺序即契约），同 seed 同
 *      结果逐位一致、异 seed 异形态；总面数 48–72（≤100 面纪律），原点 = 底面中心
 *      （首层底缘精确压 y=0，贴地语义）。
 * 边界：meta 标 category 'dev'（DEV 分类——浏览器产品栏过滤，仅供管线验证与测试，
 *      见 ui/panels/browserModel）；声明 shapeFamily size 4 与最小 variants，供
 *      sourceKey 槽路由 / aSeed / 变体链路端到端测试。每次调用 new 全部
 *      geometry/material（所有权随调用移交调用方，缓存会 dispose，禁止模块级共享
 *      对象）；params.seed 缺省用固定缺省 seed（保证无参路径确定性）。色相以逐层
 *      vertex color 写入（单材质单组、不破合批）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mulberry32 } from '../../../core/random';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import type { ProceduralBuildParams } from '../types';

export const meta: ProceduralAssetMeta = {
  id: 'asset_seedstack',
  name: 'DEV·种子塔',
  category: 'dev',
  tags: ['dev', 'seedstack'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  shapeFamily: { size: 4 }, // D19：4 形态槽（槽路由/缓存分桶的测试面）
  variants: { scaleJitter: 0.1, rotationJitter: 180, hueJitter: 8 },
  triangleCount: 72, // 上界实数：6 层 × 12 面（层数 4–6 由 seed 派生）
  levels: [{ id: 'high' }],
};

/** 无参调用的固定缺省 seed（缩略图/旧通路确定性保证；任意值，锁定不改） */
const DEFAULT_SEED = 20260917;

export function build(params?: ProceduralBuildParams): InstanceSource {
  const rng = mulberry32(params?.seed ?? DEFAULT_SEED);
  const layerCount = 4 + Math.floor(rng() * 3); // 4–6 层
  const parts: THREE.BufferGeometry[] = [];
  let y = 0;
  for (let i = 0; i < layerCount; i++) {
    const width = 0.55 + rng() * 0.5; // 层宽（0.55–1.05m）
    const height = 0.22 + rng() * 0.3; // 层高（0.22–0.52m）
    const box = new THREE.BoxGeometry(width, height, width);
    box.rotateY(rng() * Math.PI); // 层旋转（0–180°）
    box.translate((rng() - 0.5) * 0.16, y + height / 2, (rng() - 0.5) * 0.16); // 堆叠错位（首层底缘 = 0）
    // 逐层色相：暖灰-赭石域内派生（vertex color 写入，单材质单组不破合批）
    const color = new THREE.Color().setHSL(0.06 + rng() * 0.05, 0.32 + rng() * 0.2, 0.42 + rng() * 0.14);
    const vertexCount = box.getAttribute('position').count;
    const colors = new Float32Array(vertexCount * 3);
    for (let v = 0; v < vertexCount; v++) color.toArray(colors, v * 3);
    box.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    y += height;
    parts.push(box);
  }
  const geometry = mergeGeometries(parts, false);
  for (const part of parts) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!geometry) {
    throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（属性集应一致：position/normal/uv/color）`);
  }
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0, roughness: 0.88 });
  return { geometry, material }; // 单材质单值形态（非数组）
}
