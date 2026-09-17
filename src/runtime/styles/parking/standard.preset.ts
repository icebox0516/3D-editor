/**
 * runtime/styles/parking/standard.preset —— 标准停车区（迁移自 style_parking_standard，T6.3）。
 *
 * 视觉与参数语义与旧路径逐字对齐：底色 #6e7178 → color / roughness 0.9 / metalness 0；
 * lineColor（标线色 #e8e8ea）沿旧路径仅数据保存（别名表无映射，标线渲染归后续阶段）。
 * 边界：遵循 types.ts 插件授权规则（update 读 instance.material、dispose 零释放）。
 */
import * as THREE from 'three';
import type { StylePresetMeta } from '../../../registries';
import { readColor } from '../presetHelpers';
import { SURFACE_SHAPES } from '../presetShapes';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'parking.standard',
  name: '标准停车区',
  category: 'parking',
  thumbnail: svgThumbnail('#6e7178', `<circle cx='16' cy='16' r='6' fill='#fff' fill-opacity='.5'/>`),
  supportedShapes: [...SURFACE_SHAPES],
  supportedSemantics: ['parking'],
  defaultParams: [
    { key: 'baseColor', label: '底色', type: 'color', default: '#6e7178' },
    { key: 'lineColor', label: '标线色', type: 'color', default: '#e8e8ea' },
  ],
};

export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(readColor(params.baseColor, '#6e7178')),
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
      // 授权规则 1：读当前材质（引擎模板共享/写时复制可能已换绑）
      const mat = instance.material as THREE.MeshStandardMaterial;
      if (typeof p.baseColor === 'string' && p.baseColor !== '') mat.color.set(p.baseColor);
      // lineColor 沿旧路径仅数据保存，不映射渲染
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
