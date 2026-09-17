/**
 * runtime/styles/base/holo.preset —— 全息（base 通用预设，T6.3 新增，无旧对照）。
 *
 * 设计：半透明发光感——emissive 与 color 同源（同参数色）、恒 transparent（透明度参数
 *      只控 opacity 不关透明通道）、DoubleSide；glow 映射 emissiveIntensity。
 *      全七形状 × 全十语义。
 * 边界：遵循 types.ts 插件授权规则（update 读 instance.material、dispose 零释放）。
 */
import * as THREE from 'three';
import { SEMANTIC_TYPES, SHAPE_TYPES } from '../../../domain/regions';
import type { StylePresetMeta } from '../../../registries';
import { readColor, readNumber } from '../presetHelpers';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'base.holo',
  name: '全息',
  category: 'base',
  thumbnail: svgThumbnail('#66d9ff', `<circle cx='16' cy='16' r='8' fill='none' stroke='#fff'/>`),
  supportedShapes: [...SHAPE_TYPES],
  supportedSemantics: [...SEMANTIC_TYPES],
  defaultParams: [
    { key: 'color', label: '颜色', type: 'color', default: '#66d9ff' },
    { key: 'opacity', label: '透明度', type: 'number', default: 0.45, min: 0.1, max: 1, step: 0.05 },
    { key: 'glow', label: '发光强度', type: 'number', default: 0.6, min: 0, max: 5, step: 0.1 },
  ],
};

export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const color = readColor(params.color, '#66d9ff');
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color), // 同源发光：emissive 跟随 color 参数
    emissiveIntensity: readNumber(params.glow, 0.6, 0, 5),
    opacity: readNumber(params.opacity, 0.45, 0.1, 1),
    transparent: true, // 恒透明：全息质感基线，不随 opacity=1 关闭
    roughness: 0.4,
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
      if (typeof p.color === 'string' && p.color !== '') {
        mat.color.set(p.color);
        mat.emissive.set(p.color); // 同源联动
      }
      if (p.opacity !== undefined) mat.opacity = readNumber(p.opacity, mat.opacity, 0.1, 1);
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
