/**
 * runtime/styles/water/dynamic.preset —— 动态水面（迁移自 style_water_dynamic，T6.3）。
 *
 * 视觉与参数语义与旧路径逐字对齐：color #4aa3d9 / opacity 0.75 / transparent /
 * roughness 0.08 / metalness 0.2；flowSpeed=0.8 沿旧路径仅数据保存（一期无波纹动画，
 * 引擎亦无实例 tick 通路——零时间动画纪律）；其余同 water.standard 头注。
 */
import * as THREE from 'three';
import type { StylePresetMeta } from '../../../registries';
import { readColor, readNumber } from '../presetHelpers';
import { SURFACE_SHAPES } from '../presetShapes';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'water.dynamic',
  name: '动态水面',
  category: 'water',
  thumbnail: svgThumbnail('#4aa3d9', `<path d='M4 18q6-6 12 0t12 0' fill='#fff' fill-opacity='.4'/>`),
  supportedShapes: [...SURFACE_SHAPES],
  supportedSemantics: ['water'],
  defaultParams: [
    { key: 'color', label: '颜色', type: 'color', default: '#4aa3d9' },
    { key: 'opacity', label: '透明度', type: 'number', default: 0.75, min: 0.3, max: 1, step: 0.05 },
    { key: 'flowSpeed', label: '流动速度', type: 'number', default: 0.8, min: 0, max: 2, step: 0.1 },
  ],
};

export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const opacity = readNumber(params.opacity, 0.75, 0.3, 1);
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(readColor(params.color, '#4aa3d9')),
    opacity,
    transparent: opacity < 1,
    roughness: 0.08,
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
      const next = readNumber(p.opacity, mat.opacity, 0.3, 1);
      mat.opacity = next;
      mat.transparent = next < 1;
      // flowSpeed 仅数据保存（零时间动画纪律）
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
