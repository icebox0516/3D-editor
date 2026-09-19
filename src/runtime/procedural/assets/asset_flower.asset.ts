/**
 * runtime/procedural/assets/asset_flower.asset —— 程序化植物资产：花卉（T003.4）。
 *
 * 职责：花卉的纯代码几何与程序化注入材质——细锥度茎（Ø0.034 根 → Ø0.022 顶）+ 基部
 *      2 片斜上叶 + 6 瓣环布上仰花瓣（薄 Box 扇形展开）+ 压扁二十面体花心 dome；
 *      远看色点、中看花形、近看法线封口无破绽；真实尺度总高约 0.4m；原点 = 底面
 *      中心（y=0 是贴地面，与 GLB 放置的 MODEL_BASE_HEIGHT 语义对齐）。
 *      整资产 136 三角面——刻意极便宜（高密度小尺寸散布货源，几百面量级，
 *      实数声明在 meta.triangleCount）。
 * 材质分层表（materialIndex → 部件 → 材质；阶段二已升级 plantMaterials 程序化注入）：
 *      0 茎 + 2 叶   —— 茎叶绿底 #4c7d3f / m 0 / r 0.9 + flower-green 配方
 *        （位置域径向门控：外圈叶偏蓝深/内圈茎偏黄浅 + 植株尺度斑驳，4× 成本）
 *      1 花瓣环 + 花心 —— 花色粉底 #d2738f / m 0 / r 0.8 + flower-bloom 配方
 *        （位置域：径向瓣根暗晕→瓣尖提亮 + 逐瓣斑驳 + 花心 dome 暖亮门控，4× 成本）
 *      注：花心与花瓣同组同色——阶段二经注入做花心明度差（暖亮乘子近似，见
 *      plantMaterials 取舍说明：真黄芯需几何分组的后续升级点，不为此加第 3 组）。
 * 边界：id 用 asset_flower；分类 plant 与 GLB manifest 既有植物分类同栏。每次
 *      调用 new 全部 geometry/material（所有权随调用移交调用方，缓存会 dispose，
 *      禁止模块级共享对象）；层内 useGroups=false、层间 true → 恰 2 组；花瓣/
 *      叶片均为薄 Box（12 面/片），叶尖不上翘穿地（贴地语义由 minY≈0 测试锁定）；
 *      变体（jitter）不进 build（T002.3 seed 掷骰烘 transform/instanceColor——
 *      花境混色走 hueJitter 通路）；levels 为 LOD 接口位占位（本阶段恒单档
 *      'high' 细模，T006/006.1 实装消费）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ProceduralAssetMeta } from '../../../domain/assets';
import type { InstanceSource } from '../../instancing/InstancedAssetPool';
import { createFlowerBloomMaterial, createFlowerStemLeafMaterial } from '../materials/plantMaterials';

export const meta: ProceduralAssetMeta = {
  id: 'asset_flower',
  name: '花卉',
  category: 'plant',
  tags: ['植物', '花', '花卉', 'flower'],
  defaultScale: { x: 1, y: 1, z: 1 },
  defaultRotation: { x: 0, y: 0, z: 0 },
  variants: { scaleJitter: 0.3, rotationJitter: 180, hueJitter: 15 }, // 花境混色与小尺度体量差
  triangleCount: 136,
  levels: [{ id: 'high' }], // LOD 接口位：单档细模占位
  taxonomy: { category: 'plant' }, // family 不填：花卉属草本/地被，T015 族落地时再定值（无诚实族归属不占位）
  proceduralProfile: { heightRange: { min: 0.39, max: 0.39 }, widthRange: { min: 0.33, max: 0.33 } }, // 细模包围盒实测（T010.2 探针：h 0.3913 / w 0.3287）
};

/** 部件合并：统一转非索引（Cylinder/Box 索引态一致化才能合）；
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
  // ── 绿层（0）：茎 + 2 基叶 ───────────────────────
  const greenParts: THREE.BufferGeometry[] = [];

  // 茎：细锥度圆柱，0 → 0.34（两端封口；根端贴地不可见、顶端没入花心）
  const stem = new THREE.CylinderGeometry(0.011, 0.017, 0.34, 5);
  stem.translate(0, 0.17, 0);
  greenParts.push(stem);

  // 基叶 ×2：薄 Box 斜上 28°，内端贴茎、外端上仰（角点最低 ≈0.047 不穿地）
  for (const azimuth of [15, 195] as const) {
    const leaf = new THREE.BoxGeometry(0.16, 0.012, 0.05);
    leaf.rotateZ((28 * Math.PI) / 180);
    leaf.rotateY((azimuth * Math.PI) / 180);
    leaf.translate(Math.cos((azimuth * Math.PI) / 180) * 0.09, 0.09, -Math.sin((azimuth * Math.PI) / 180) * 0.09);
    greenParts.push(leaf);
  }

  // ── 花层（1）：6 瓣环 + 花心 ─────────────────────
  const bloomParts: THREE.BufferGeometry[] = [];

  // 花瓣 ×6：薄 Box 上仰 18° 环布（rotateY 后 +X 指向环向），内端聚拢茎顶、外端展开
  for (let i = 0; i < 6; i++) {
    const azimuth = (i / 6) * 360;
    const petal = new THREE.BoxGeometry(0.105, 0.014, 0.052);
    petal.rotateZ((18 * Math.PI) / 180);
    petal.rotateY((azimuth * Math.PI) / 180);
    petal.translate(Math.cos((azimuth * Math.PI) / 180) * 0.075, 0.36, -Math.sin((azimuth * Math.PI) / 180) * 0.075);
    bloomParts.push(petal);
  }

  // 花心：压扁二十面体 dome 扣在花瓣环中心（茎顶 0.34 没入其中）
  const core = new THREE.IcosahedronGeometry(0.032, 0);
  core.scale(1, 0.6, 1);
  core.translate(0, 0.375, 0);
  bloomParts.push(core);

  const merged = mergeGeometries([mergeParts(greenParts, false), mergeParts(bloomParts, false)], true); // 层间成组 → 恰 2 组
  if (!merged) throw new Error(`程序化资产 ${meta.id} 层合并不兼容`);

  // 底参不变（阶段一接口），注入配方见材质分层表——hueJitter 花境混色乘算链完整保留
  const green = createFlowerStemLeafMaterial({ color: 0x4c7d3f, metalness: 0, roughness: 0.9 }); // 茎叶绿 + flower-green
  const bloom = createFlowerBloomMaterial({ color: 0xd2738f, metalness: 0, roughness: 0.8 }); // 花色粉 + flower-bloom
  return { geometry: merged, material: [green, bloom] };
}
