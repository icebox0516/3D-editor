/**
 * runtime/procedural/assets/asset_pine.asset —— 程序化植物资产：松树（T003.4）。
 *
 * 职责：松树的纯代码几何与程序化注入材质——锥度树干（Ø0.40 根径 → Ø0.18 梢径，到 2.8m，
 *      梢端没入首层锥）+ 4 层叠锥（半径 1.9 → 0.72 递收、层高 2.7 → 1.8 递减），
 *      上层锥底宽于下层锥在该高度的表面 → 层缘悬垂读作轮生枝层；远看尖塔剪影、
 *      中看层叠体量；真实尺度总高约 7.0m、底冠幅约 3.8m；原点 = 底面中心
 *      （y=0 是贴地根面，与 GLB 放置的 MODEL_BASE_HEIGHT 语义对齐）。
 *      整资产 136 三角面（单株细模 ≤2000 面数纪律，实数声明在 meta.triangleCount）。
 * 材质分层表（materialIndex → 部件 → 材质；阶段二已升级 plantMaterials 程序化注入）：
 *      0 树干          —— 松皮红褐底 #5c4130 / m 0 / r 0.95 + bark-pine 配方
 *        （uv 域细密鳞脊：浅沟 + 近方鳞片斑驳，2× vnoise = 6× 成本）
 *      1 叠锥 ×4 层    —— 松针冷绿底 #2f5e3e / m 0 / r 0.9 + canopy-pine 配方
 *        （物体空间位置域：层间色相差（y 向波长 ≈ 层距）+ 自遮蔽梯度，4× 成本）
 *      注：层内合并 useGroups=false（植物按 10 万实例设计，组数即块×资产的 draw 倍率），
 *      层间 true → 恰 2 组；锥体封闭底盖（悬垂层底可见处不露内腔）。
 * 边界：id 用 asset_pine；分类 plant 与 GLB manifest 既有植物分类同栏。每次调用
 *      new 全部 geometry/material（所有权随调用移交调用方，缓存会 dispose，禁止
 *      模块级共享对象）；叠锥面互不共面（坡度各异）无 z-fighting；变体（jitter）
 *      不进 build（T002.3 seed 掷骰烘 transform/instanceColor）；levels 为 LOD
 *      接口位占位（本阶段恒单档 'high' 细模，T006/006.1 实装消费）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import { createPineBarkMaterial, createPineCanopyMaterial } from '../materials/plantMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_pine',
  name: '松树',
  category: 'plant',
  tags: ['植物', '树', '松树', 'pine'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.15, rotationJitter: 180, hueJitter: 8 }, // 针叶树体量与叶色自然差异
  triangleCount: 136,
  levels: [{ id: 'high' }], // LOD 接口位：单档细模占位
  taxonomy: { category: 'plant', family: 'conifer' }, // 针叶族（T012 建族的第一现役消费者）
  proceduralProfile: { heightRange: { min: 7, max: 7 }, widthRange: { min: 3.77, max: 3.77 } }, // 细模包围盒实测（T010.2 探针：h 7.0000 / w 3.7723）
};

/** 部件合并：统一转非索引（Cylinder/Cone 索引态与组内其他部件一致化才能合）；
 *  useGroups=false 用于同材质层内合并，true 用于层间合并（每层恰一组） */
function mergeParts(parts: THREE.BufferGeometry[], useGroups: boolean): THREE.BufferGeometry {
  const flat = parts.map((part) => {
    if (!part.index) return part;
    const nonIndexed = part.toNonIndexed();
    part.dispose(); // 非索引拷贝已自持数据，索引中间体即弃
    return nonIndexed;
  });
  const merged = mergeGeometries(flat, useGroups);
  for (const part of flat) part.dispose(); // 合并拷贝数据，部件中间体即弃
  if (!merged) throw new Error(`程序化资产 ${meta.id} 部件合并不兼容（属性集应一致：position/normal/uv）`);
  return merged;
}

export function build(): InstanceSource {
  // ── 树皮层（0）：树干 ─────────────────────────────
  const barkParts: THREE.BufferGeometry[] = [];

  // 树干：锥度圆柱（根 Ø0.40 → 梢 Ø0.18），0 → 2.8（梢端没入首层锥体内，顶盖不可见）
  const trunk = new THREE.CylinderGeometry(0.09, 0.2, 2.8, 8);
  trunk.translate(0, 1.4, 0);
  barkParts.push(trunk);

  // ── 针叶层（1）：4 层叠锥，半径与层高双递收 ─────────
  const leafParts: THREE.BufferGeometry[] = [];

  // [半径, 锥高, 底面高]：底缘依次悬垂于下层锥面之外（层缘可见、底盖封口不露腔）
  for (const [radius, height, baseY] of [
    [1.9, 2.7, 1.5], // 首层：1.5 → 4.2
    [1.5, 2.3, 2.75], // 二层：2.75 → 5.05
    [1.1, 1.9, 4.0], // 三层：4.0 → 5.9
    [0.72, 1.8, 5.2], // 顶锥：5.2 → 7.0（总高 ≈7.0m 尖塔收束）
  ] as const) {
    const tier = new THREE.ConeGeometry(radius, height, 13);
    tier.translate(0, baseY + height / 2, 0);
    leafParts.push(tier);
  }

  const merged = mergeGeometries([mergeParts(barkParts, false), mergeParts(leafParts, false)], true); // 层间成组 → 恰 2 组
  if (!merged) throw new Error(`程序化资产 ${meta.id} 层合并不兼容`);

  // 底参不变（阶段一接口），注入配方见材质分层表——hueJitter 逐实例色相微差乘算链完整保留
  const bark = createPineBarkMaterial({ color: 0x5c4130, metalness: 0, roughness: 0.95 }); // 松皮红褐 + bark-pine
  const needle = createPineCanopyMaterial({ color: 0x2f5e3e, metalness: 0, roughness: 0.9 }); // 松针冷绿 + canopy-pine
  return { geometry: merged, material: [bark, needle] };
}
