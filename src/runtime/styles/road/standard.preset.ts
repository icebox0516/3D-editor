/**
 * runtime/styles/road/standard.preset —— 标准道路（迁移自 style_road_standard，T6.3）。
 *
 * 视觉与参数语义与旧路径逐字对齐：路面色 #4a4a4f / roughness 0.9 / metalness 0；
 * glow 沿旧别名表映射 emissiveIntensity，但 emissive 色保持黑（默认基线无自发光色）——
 * 旧路径视觉上发光无效（黑 × 强度 = 0），本插件保持同貌：参数存档 + 映射、emissive 不设。
 * 形状支撑（T6.4 R2）：面类五形状 + line——polygon 形状 + road 语义走平面贴地渲染
 * （width 忽略，分域契约 §C），线状带宽几何由 GeometryBuilder 供给，插件只管材质。
 * 边界：遵循 types.ts 插件授权规则（update 读 instance.material、dispose 零释放）。
 */
import * as THREE from 'three';
import type { StylePresetMeta } from '../../../registries';
import { readColor, readNumber } from '../presetHelpers';
import { SURFACE_SHAPES } from '../presetShapes';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'road.standard',
  name: '标准道路',
  category: 'road',
  thumbnail: svgThumbnail('#4a4a4f', `<rect x='5' y='14' width='22' height='4' rx='2' fill='#fff'/>`),
  supportedShapes: [...SURFACE_SHAPES, 'line'],
  supportedSemantics: ['road'],
  defaultParams: [
    { key: 'color', label: '路面色', type: 'color', default: '#4a4a4f' },
    { key: 'glow', label: '发光强度', type: 'number', default: 0, min: 0, max: 5, step: 0.1 },
  ],
};

export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(readColor(params.color, '#4a4a4f')),
    roughness: 0.9,
    metalness: 0,
  });
  material.emissiveIntensity = readNumber(params.glow, 0, 0, 5); // glow→emissiveIntensity（emissive 黑，同貌无效）

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
