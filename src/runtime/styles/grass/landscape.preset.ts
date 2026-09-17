/**
 * runtime/styles/grass/landscape.preset —— 景观（迁移自 style_green_landscape，T6.3）。
 *
 * 视觉与参数语义与旧路径逐字对齐：color #86b95c / roughness 0.9 / metalness 0；
 * reliefStrength=0.4 沿旧路径仅数据保存；其余同 grass.lawn 头注。
 */
import * as THREE from 'three';
import type { StylePresetMeta } from '../../../registries';
import { readColor } from '../presetHelpers';
import { SURFACE_SHAPES } from '../presetShapes';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'grass.landscape',
  name: '景观',
  category: 'grass',
  thumbnail: svgThumbnail('#86b95c', `<path d='M10 23l4-10 4 10z' fill='#fff' fill-opacity='.35'/>`),
  supportedShapes: [...SURFACE_SHAPES],
  supportedSemantics: ['grass'],
  defaultParams: [
    { key: 'color', label: '颜色', type: 'color', default: '#86b95c' },
    { key: 'reliefStrength', label: '起伏强度', type: 'number', default: 0.4, min: 0, max: 1, step: 0.05 },
  ],
};

export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(readColor(params.color, '#86b95c')),
    roughness: 0.9,
    metalness: 0,
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
      // reliefStrength 仅数据保存
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
