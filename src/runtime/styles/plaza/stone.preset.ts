/**
 * runtime/styles/plaza/stone.preset —— 石材广场（新增预设，T6.3，无旧对照）。
 *
 * 设计：MeshStandardMaterial 暖石材（#b5a288），粗糙度为用户可调参数（0.1–1），
 *      直接映射 material.roughness；无透明参数（不透明基线）。
 * 边界：遵循 types.ts 插件授权规则（update 读 instance.material、dispose 零释放）。
 */
import * as THREE from 'three';
import type { StylePresetMeta } from '../../../registries';
import { readColor, readNumber } from '../presetHelpers';
import { SURFACE_SHAPES } from '../presetShapes';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'plaza.stone',
  name: '石材广场',
  category: 'plaza',
  thumbnail: svgThumbnail('#b5a288', `<rect x='10' y='10' width='12' height='12' fill='#fff' fill-opacity='.25'/>`),
  supportedShapes: [...SURFACE_SHAPES],
  supportedSemantics: ['plaza'],
  defaultParams: [
    { key: 'color', label: '石材色', type: 'color', default: '#b5a288' },
    { key: 'roughness', label: '粗糙度', type: 'number', default: 0.8, min: 0.1, max: 1, step: 0.05 },
  ],
};

export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(readColor(params.color, '#b5a288')),
    roughness: readNumber(params.roughness, 0.8, 0.1, 1),
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geometry, material);

  const instance: StyleInstance = {
    object: mesh,
    material,
    presetId: meta.id,
    supportedShapes: [...meta.supportedShapes],
    update(p) {
      // 授权规则 1：读当前材质（引擎模板共享/写时复制可能已换绑）
      const mat = instance.material as THREE.MeshStandardMaterial;
      if (typeof p.color === 'string' && p.color !== '') mat.color.set(p.color);
      if (p.roughness !== undefined) mat.roughness = readNumber(p.roughness, mat.roughness, 0.1, 1);
    },
    setGeometry(next) {
      mesh.geometry = next; // 旧几何归调用方，不在此释放
    },
    dispose() {
      mesh.removeFromParent();
    },
  };
  return instance;
}
