/**
 * runtime/styles/water/tech.preset —— 科技水面（迁移自 style_water_tech，T6.3）。
 *
 * 视觉与参数语义与旧路径逐字对齐：color #0e5f7a / opacity 0.85 / transparent /
 * emissive #00d5ff / emissiveIntensity 0.6 / roughness 0.2 / metalness 0.3；
 * flowSpeed=1.2 沿旧路径仅数据保存；其余同 water.standard 头注。
 */
import * as THREE from 'three';
import type { StylePresetMeta } from '../../../registries';
import { readColor, readNumber } from '../presetHelpers';
import { SURFACE_SHAPES } from '../presetShapes';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'water.tech',
  name: '科技水面',
  category: 'water',
  thumbnail: svgThumbnail('#0e5f7a', `<path d='M4 16q6-6 12 0t12 0' fill='#00d5ff' fill-opacity='.7'/>`),
  supportedShapes: [...SURFACE_SHAPES],
  supportedSemantics: ['water'],
  defaultParams: [
    { key: 'color', label: '颜色', type: 'color', default: '#0e5f7a' },
    { key: 'opacity', label: '透明度', type: 'number', default: 0.85, min: 0.3, max: 1, step: 0.05 },
    { key: 'flowSpeed', label: '流动速度', type: 'number', default: 1.2, min: 0, max: 2, step: 0.1 },
  ],
};

export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const opacity = readNumber(params.opacity, 0.85, 0.3, 1);
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(readColor(params.color, '#0e5f7a')),
    opacity,
    transparent: opacity < 1,
    emissive: new THREE.Color('#00d5ff'),
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.3,
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
      const next = readNumber(p.opacity, mat.opacity, 0.3, 1);
      mat.opacity = next;
      mat.transparent = next < 1;
      // flowSpeed 仅数据保存；emissive #00d5ff 为预设固定基线（沿旧 spec，非参数）
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
