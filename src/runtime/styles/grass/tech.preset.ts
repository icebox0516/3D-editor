/**
 * runtime/styles/grass/tech.preset —— 科技绿地（迁移自 style_green_tech，T6.3）。
 *
 * 视觉与参数语义与旧路径逐字对齐：color #0e3f46 / emissive #00e5a0 / emissiveIntensity 0.5 /
 * roughness 0.6 / metalness 0.2；reliefStrength=0 沿旧路径仅数据保存；其余同 grass.lawn 头注。
 */
import * as THREE from 'three';
import type { StylePresetMeta } from '../../../registries';
import { readColor } from '../presetHelpers';
import { SURFACE_SHAPES } from '../presetShapes';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'grass.tech',
  name: '科技绿地',
  category: 'grass',
  thumbnail: svgThumbnail('#0e3f46', `<path d='M11 22l4-9 4 9z' fill='#00e5a0' fill-opacity='.7'/>`),
  supportedShapes: [...SURFACE_SHAPES],
  supportedSemantics: ['grass'],
  defaultParams: [
    { key: 'color', label: '颜色', type: 'color', default: '#0e3f46' },
    { key: 'reliefStrength', label: '起伏强度', type: 'number', default: 0, min: 0, max: 1, step: 0.05 },
  ],
};

export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(readColor(params.color, '#0e3f46')),
    emissive: new THREE.Color('#00e5a0'),
    emissiveIntensity: 0.5,
    roughness: 0.6,
    metalness: 0.2,
  });
  const mesh = new THREE.Mesh(geometry, material);

  const instance: StyleInstance = {
    object: mesh,
    material,
    presetId: meta.id,
    supportedShapes: [...meta.supportedShapes],
    update(p) {
      const mat = instance.material as THREE.MeshStandardMaterial;
      if (typeof p.color === 'string' && p.color !== '') mat.color.set(p.color);
      // reliefStrength 仅数据保存；emissive #00e5a0 为预设固定基线（沿旧 spec，非参数）
    },
    setGeometry(next) {
      mesh.geometry = next;
    },
    dispose() {
      mesh.removeFromParent();
    },
  };
  return instance;
}
