/**
 * runtime/styles/parking/tech.preset —— 科技停车区（迁移自 style_parking_tech，T6.3）。
 *
 * 视觉与参数语义与旧路径逐字对齐：底色 #1c2733 → color / emissive #23e0ff /
 * emissiveIntensity 0.4 / roughness 0.5 / metalness 0.2；lineColor（#23e0ff）沿旧路径
 * 仅数据保存（emissive 取自旧 spec 固定基线，非 lineColor 参数联动）。
 * 边界：遵循 types.ts 插件授权规则（update 读 instance.material、dispose 零释放）。
 */
import * as THREE from 'three';
import type { StylePresetMeta } from '../../../registries';
import { readColor } from '../presetHelpers';
import { SURFACE_SHAPES } from '../presetShapes';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'parking.tech',
  name: '科技停车区',
  category: 'parking',
  thumbnail: svgThumbnail('#1c2733', `<circle cx='16' cy='16' r='6' fill='#23e0ff' fill-opacity='.7'/>`),
  supportedShapes: [...SURFACE_SHAPES],
  supportedSemantics: ['parking'],
  defaultParams: [
    { key: 'baseColor', label: '底色', type: 'color', default: '#1c2733' },
    { key: 'lineColor', label: '标线色', type: 'color', default: '#23e0ff' },
  ],
};

export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(readColor(params.baseColor, '#1c2733')),
    emissive: new THREE.Color('#23e0ff'),
    emissiveIntensity: 0.4,
    roughness: 0.5,
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
      if (typeof p.baseColor === 'string' && p.baseColor !== '') mat.color.set(p.baseColor);
      // lineColor 仅数据保存；emissive #23e0ff 为预设固定基线（沿旧 spec，非参数）
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
