/**
 * runtime/renderers/layerState —— 图层透明度乘算纯函数（T6.4 R8，自 Renderer 提取）。
 *
 * 职责：图层 opacity 乘算到对象树材质（opacity = 基准 × layerOpacity；transparent 联动）。
 *      基准值以 WeakMap<Material> 记忆（首遇时记录，不污染 userData）；还原时 layerOpacity=1。
 *      与 Renderer.applyLayerState 的旧逻辑逐字一致，唯一扩展：Sprite 材质
 *      （SpriteMaterial 同有 opacity/transparent 字段）同样乘算——RegionObject 的
 *      poi.billboard 预设根对象为 Sprite（T6.4 R8 图层联动验收项）。
 * 边界：材质数组（GLTF 多材质组）跳过（沿旧要素现状语义）；只遍历调用方给定的根。
 */
import type * as THREE from 'three';

/** 材质基准透明度记忆类型（Renderer 持有实例、本函数读写；不写入 userData） */
export type BaseOpacityMap = WeakMap<THREE.Material, number>;

/**
 * 对象树材质透明度乘算（幂等：基准取自首遇记忆，不叠加）。
 * @param root 对象树根（Renderer 传业务对象根）
 * @param layerOpacity 图层透明度 [0,1]（还原语义传 1）
 * @param baseOpacity 基准记忆（跨调用共享，Renderer 持有）
 */
export function applyLayerOpacityToTree(
  root: THREE.Object3D,
  layerOpacity: number,
  baseOpacity: BaseOpacityMap,
): void {
  const clamped = Math.min(Math.max(layerOpacity, 0), 1);
  root.traverse((node) => {
    const candidate = node as THREE.Mesh & THREE.Sprite & { isMesh?: boolean; isSprite?: boolean };
    if (!candidate.isMesh && !candidate.isSprite) return;
    const material = candidate.material as THREE.Material | THREE.Material[] | undefined;
    if (!material || Array.isArray(material)) return; // 多材质组跳过（现状语义）
    let base = baseOpacity.get(material);
    if (base === undefined) {
      base = Number.isFinite(material.opacity) ? material.opacity : 1;
      baseOpacity.set(material, base);
    }
    const effective = base * clamped;
    material.opacity = effective;
    material.transparent = effective < 1;
  });
}
