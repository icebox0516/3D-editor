/**
 * runtime/styles/plaza/paving.preset —— 铺装广场（新增预设，T6.3，无旧对照）。
 *
 * 设计：MeshStandardMaterial 单色铺装（暖灰中性色，高粗糙漫反射）；
 *      color + opacity 两参数（透明时自动 transparent）。
 * 边界：遵循 types.ts 插件授权规则（update 读 instance.material、dispose 零释放）。
 */
import * as THREE from 'three';
import type { StylePresetMeta } from '../../../registries';
import { readColor, readNumber } from '../presetHelpers';
import { SURFACE_SHAPES } from '../presetShapes';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'plaza.paving',
  name: '铺装广场',
  category: 'plaza',
  thumbnail: svgThumbnail('#a8a29a', `<circle cx='16' cy='16' r='6' fill='#fff' fill-opacity='.4'/>`),
  supportedShapes: [...SURFACE_SHAPES],
  supportedSemantics: ['plaza'],
  defaultParams: [
    { key: 'color', label: '铺装色', type: 'color', default: '#a8a29a' },
    { key: 'opacity', label: '透明度', type: 'number', default: 1, min: 0.3, max: 1, step: 0.05 },
  ],
};

export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const opacity = readNumber(params.opacity, 1, 0.3, 1);
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(readColor(params.color, '#a8a29a')),
    opacity,
    transparent: opacity < 1,
    roughness: 0.95,
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
      const next = readNumber(p.opacity, mat.opacity, 0.3, 1);
      mat.opacity = next;
      mat.transparent = next < 1;
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
