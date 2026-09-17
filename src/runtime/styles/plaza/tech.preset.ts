/**
 * runtime/styles/plaza/tech.preset —— 科技广场（新增预设，T6.3，无旧对照）。
 *
 * 设计：深底发光（风格对齐 parking.tech）——底色 #101c2c + emissive #23e0ff 固定基线，
 *      glow 参数映射 emissiveIntensity（默认 0.5）；roughness 0.5 / metalness 0.2。
 * 边界：遵循 types.ts 插件授权规则（update 读 instance.material、dispose 零释放）。
 */
import * as THREE from 'three';
import type { StylePresetMeta } from '../../../registries';
import { readColor, readNumber } from '../presetHelpers';
import { SURFACE_SHAPES } from '../presetShapes';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'plaza.tech',
  name: '科技广场',
  category: 'plaza',
  thumbnail: svgThumbnail('#101c2c', `<rect x='10' y='10' width='12' height='12' fill='#23e0ff' fill-opacity='.5'/>`),
  supportedShapes: [...SURFACE_SHAPES],
  supportedSemantics: ['plaza'],
  defaultParams: [
    { key: 'color', label: '底色', type: 'color', default: '#101c2c' },
    { key: 'glow', label: '发光强度', type: 'number', default: 0.5, min: 0, max: 5, step: 0.1 },
  ],
};

export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(readColor(params.color, '#101c2c')),
    emissive: new THREE.Color('#23e0ff'),
    emissiveIntensity: readNumber(params.glow, 0.5, 0, 5),
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
      // 授权规则 1：读当前材质（引擎模板共享/写时复制可能已换绑）
      const mat = instance.material as THREE.MeshStandardMaterial;
      if (typeof p.color === 'string' && p.color !== '') mat.color.set(p.color);
      if (p.glow !== undefined) mat.emissiveIntensity = readNumber(p.glow, mat.emissiveIntensity, 0, 5);
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
