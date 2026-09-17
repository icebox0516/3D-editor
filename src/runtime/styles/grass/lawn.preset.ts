/**
 * runtime/styles/grass/lawn.preset —— 草地（迁移自 style_green_grass，T6.3）。
 *
 * 视觉与参数语义与旧路径逐字对齐：color #5da45a / roughness 0.95 / metalness 0
 * （不透明，无 opacity 参数——transparent false 为未声明时默认）；
 * reliefStrength=0 沿旧路径仅数据保存（渲染实现由后续阶段决定）。
 * 边界：遵循 types.ts 插件授权规则（update 读 instance.material、dispose 零释放）。
 */
import * as THREE from 'three';
import type { StylePresetMeta } from '../../../registries';
import { readColor } from '../presetHelpers';
import { SURFACE_SHAPES } from '../presetShapes';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'grass.lawn',
  name: '草地',
  category: 'grass',
  thumbnail: svgThumbnail('#5da45a', `<path d='M11 22l4-9 4 9z' fill='#fff' fill-opacity='.4'/>`),
  supportedShapes: [...SURFACE_SHAPES],
  supportedSemantics: ['grass'],
  defaultParams: [
    { key: 'color', label: '颜色', type: 'color', default: '#5da45a' },
    { key: 'reliefStrength', label: '起伏强度', type: 'number', default: 0, min: 0, max: 1, step: 0.05 },
  ],
};

export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(readColor(params.color, '#5da45a')),
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
      // reliefStrength 沿旧路径仅数据保存，不映射渲染
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
