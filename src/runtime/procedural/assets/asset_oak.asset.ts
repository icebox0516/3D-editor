/**
 * runtime/procedural/assets/asset_oak.asset —— 程序化植物资产：橡树（T003.4）。
 *
 * 职责：橡树的纯代码几何与程序化注入材质——锥度树干（Ø0.48 根径 → Ø0.24 梢径，到 2.9m）+
 *      3 根斜伸枝（粗端埋干内、细端没入冠团，露出段读作侧枝）+ 6 团二十面体球簇阔冠
 *      （1 主团 detail2 + 4 侧团 + 1 顶团，三档高度错位、非同心偏移——远看阔冠剪影、
 *      中看冠层有体量层次）；真实尺度总高约 6.1m、冠幅约 5.4m；原点 = 底面中心
 *      （y=0 是贴地根面，与 GLB 放置的 MODEL_BASE_HEIGHT 语义对齐）。
 *      整资产 688 三角面（单株细模 ≤2000 面数纪律，实数声明在 meta.triangleCount）。
 * 材质分层表（materialIndex → 部件 → 材质；阶段二已升级 plantMaterials 程序化注入）：
 *      0 树干 + 3 侧枝 —— 树皮暖褐底 #5a4633 / m 0 / r 0.95 + bark-oak 配方
 *        （uv 域纵向沟脊：整数脊数 + 游走 + 竖长板块，2× vnoise = 6× 成本）
 *      1 冠层 6 球团   —— 叶绿底 #4a7a33 / m 0 / r 0.9 + canopy-oak 配方
 *        （物体空间位置域：团间色相/明度差 + 冠层自遮蔽梯度 + 微斑，4× 成本）
 *      注：层内合并 useGroups=false（免每部件一组放大 draw call——植物按 10 万实例
 *      设计，组数即块×资产的 draw 倍率），层间 true → 恰 2 组。
 * 边界：id 用 asset_oak；分类 plant 与 GLB manifest 既有植物分类同栏（浏览器动态聚合，
 *      天然兼容）。每次调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会
 *      dispose，禁止模块级共享对象）；球团 squash 用 geometry.scale（applyMatrix4 以
 *      逆转置法线矩阵同步变换法线，非法线破绽）；变体（jitter）不进 build（T002.3
 *      seed 掷骰烘 transform/instanceColor——树冠逐实例色相微差走 hueJitter 通路）；
 *      levels 为 LOD 接口位占位（本阶段恒单档 'high' 细模，T006/006.1 实装消费）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import { createOakBarkMaterial, createOakCanopyMaterial } from '../materials/plantMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_oak',
  name: '橡树',
  category: 'plant',
  tags: ['植物', '树', '橡树', 'oak'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.18, rotationJitter: 180, hueJitter: 10 }, // 乔木体量与叶色自然差异
  triangleCount: 688,
  levels: [{ id: 'high' }], // LOD 接口位：单档细模占位
  taxonomy: { category: 'plant', family: 'broadleaf' }, // 阔叶乔木（如实归类：橡树即阔叶；几何为 003.4 旧实现，分类只认树种不认实现代际）
  proceduralProfile: { heightRange: { min: 6.12, max: 6.12 }, widthRange: { min: 5.15, max: 5.15 } }, // 细模包围盒实测（T010.2 探针：h 6.1150 / w 5.1500）
};

/** 部件合并：统一转非索引（Icosahedron 天生非索引、Cylinder 需转，索引态不一致合不出）；
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
  // ── 树皮层（0）：树干 + 3 侧枝 ─────────────────────
  const barkParts: THREE.BufferGeometry[] = [];

  // 树干：锥度圆柱（根 Ø0.48 → 梢 Ø0.24），0 → 2.9（梢端没入主冠团，顶盖不可见）
  const trunk = new THREE.CylinderGeometry(0.12, 0.24, 2.9, 9);
  trunk.translate(0, 1.45, 0);
  barkParts.push(trunk);

  // 侧枝 ×3：粗端（Ø0.20）自干内 2.1m 高度斜伸、细端（Ø0.10）指向邻近冠团；
  // rotateZ(-tilt) 向 +X 倾、rotateY(az) 环布方位——两端均封口且藏于干/冠之内
  for (const [azimuth, tilt] of [[20, 42], [140, 48], [260, 38]] as const) {
    const branch = new THREE.CylinderGeometry(0.05, 0.1, 1.5, 6);
    branch.rotateZ((-tilt * Math.PI) / 180);
    branch.rotateY((azimuth * Math.PI) / 180);
    const axisX = Math.sin((tilt * Math.PI) / 180) * Math.cos((azimuth * Math.PI) / 180);
    const axisZ = -Math.sin((tilt * Math.PI) / 180) * Math.sin((azimuth * Math.PI) / 180);
    branch.translate(axisX * 0.75, 2.1 + Math.cos((tilt * Math.PI) / 180) * 0.75, axisZ * 0.75);
    barkParts.push(branch);
  }

  // ── 冠层（1）：6 团球簇，三档高度错位 ───────────────
  const leafParts: THREE.BufferGeometry[] = [];

  // 球团工厂：二十面体 + 纵向压扁（冠团横阔感）+ 偏移定位
  const blob = (radius: number, detail: number, squash: number, x: number, y: number, z: number): void => {
    const ico = new THREE.IcosahedronGeometry(radius, detail);
    ico.scale(1, squash, 1);
    ico.translate(x, y, z);
    leafParts.push(ico);
  };

  blob(1.8, 2, 0.92, 0.15, 4.35, -0.1); // 主团（detail2 细模）：冠量主体，底部 2.69 与干梢衔接
  blob(1.2, 1, 0.9, 1.5, 3.75, 0.4); // 侧团 ×4：低档位，撑开冠幅
  blob(1.05, 1, 0.88, -1.4, 3.9, -0.55);
  blob(1.15, 1, 0.85, 0.55, 3.55, -1.5);
  blob(1.0, 1, 0.9, -0.75, 4.6, 1.35); // 高位侧团：中档位
  blob(0.85, 1, 0.9, 0.35, 5.35, 0.25); // 顶团：树顶轮廓收束，总高 ≈6.1m

  const merged = mergeGeometries([mergeParts(barkParts, false), mergeParts(leafParts, false)], true); // 层间成组 → 恰 2 组
  if (!merged) throw new Error(`程序化资产 ${meta.id} 层合并不兼容`);

  // 底参不变（阶段一接口），注入配方见材质分层表——注入只做乘法调制，instanceColor
  // 的 hueJitter 逐实例色相微差乘算链（<color_fragment>）完整保留
  const bark = createOakBarkMaterial({ color: 0x5a4633, metalness: 0, roughness: 0.95 }); // 树皮暖褐 + bark-oak
  const leaf = createOakCanopyMaterial({ color: 0x4a7a33, metalness: 0, roughness: 0.9 }); // 叶绿 + canopy-oak
  return { geometry: merged, material: [bark, leaf] };
}
