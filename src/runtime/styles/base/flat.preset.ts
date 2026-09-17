/**
 * runtime/styles/base/flat.preset —— 纯色（base 通用预设，T6.3 新增，无旧对照）。
 *
 * 设计：MeshStandardMaterial 冷灰蓝单色（#8f98a8，区别于 default_solid 的中性灰 #909399）；
 *      通用基线——全七形状 × 全十语义；side 取 DoubleSide 对齐 default_solid 通用基线
 *      （线/点几何常为单面薄片，双面保证任意视角可见）。
 * 边界：遵循 types.ts 插件授权规则（update 读 instance.material、dispose 零释放）。
 */
import * as THREE from 'three';
import { SEMANTIC_TYPES, SHAPE_TYPES } from '../../../domain/regions';
import type { StylePresetMeta } from '../../../registries';
import { readColor, readNumber } from '../presetHelpers';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'base.flat',
  name: '纯色',
  category: 'base',
  thumbnail: svgThumbnail('#8f98a8', `<circle cx='16' cy='16' r='8' fill='#fff' fill-opacity='.3'/>`),
  supportedShapes: [...SHAPE_TYPES],
  supportedSemantics: [...SEMANTIC_TYPES],
  defaultParams: [
    { key: 'color', label: '颜色', type: 'color', default: '#8f98a8' },
    { key: 'opacity', label: '透明度', type: 'number', default: 1, min: 0, max: 1, step: 0.05 },
  ],
};

export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const opacity = readNumber(params.opacity, 1, 0, 1);
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(readColor(params.color, '#8f98a8')),
    opacity,
    transparent: opacity < 1,
    roughness: 0.9,
    metalness: 0,
    side: THREE.DoubleSide,
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
      const next = readNumber(p.opacity, mat.opacity, 0, 1);
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
