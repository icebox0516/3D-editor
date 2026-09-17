/**
 * runtime/styles/road/asphalt.preset —— 沥青道路（迁移自 style_road_asphalt，T6.3）。
 *
 * 视觉与参数语义与旧路径逐字对齐：路面色 #333338 / roughness 0.95 / metalness 0；
 * glow 同貌策略（emissiveIntensity 映射 + emissive 保持黑）见 road.standard 头注。
 * 形状支撑（T6.4 R2）：面类五形状 + line，同 road.standard（贴地渲染，width 忽略）。
 * 边界：遵循 types.ts 插件授权规则（update 读 instance.material、dispose 零释放）。
 */
import * as THREE from 'three';
import type { StylePresetMeta } from '../../../registries';
import { readColor, readNumber } from '../presetHelpers';
import { SURFACE_SHAPES } from '../presetShapes';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'road.asphalt',
  name: '沥青道路',
  category: 'road',
  thumbnail: svgThumbnail('#333338', `<rect x='5' y='15' width='22' height='3' fill='#fff' fill-opacity='.7'/>`),
  supportedShapes: [...SURFACE_SHAPES, 'line'],
  supportedSemantics: ['road'],
  defaultParams: [
    { key: 'color', label: '路面色', type: 'color', default: '#333338' },
    { key: 'glow', label: '发光强度', type: 'number', default: 0, min: 0, max: 5, step: 0.1 },
  ],
};

export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(readColor(params.color, '#333338')),
    roughness: 0.95,
    metalness: 0,
  });
  material.emissiveIntensity = readNumber(params.glow, 0, 0, 5);

  const mesh = new THREE.Mesh(geometry, material);

  const instance: StyleInstance = {
    object: mesh,
    material,
    presetId: meta.id,
    supportedShapes: [...meta.supportedShapes],
    update(p) {
      const mat = instance.material as THREE.MeshStandardMaterial;
      if (typeof p.color === 'string' && p.color !== '') mat.color.set(p.color);
      if (p.glow !== undefined) mat.emissiveIntensity = readNumber(p.glow, mat.emissiveIntensity, 0, 5);
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
