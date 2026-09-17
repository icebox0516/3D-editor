/**
 * runtime/styles/water/standard.preset —— 标准水面（迁移自 style_water_standard，T6.3）。
 *
 * 视觉与参数语义与旧路径逐字对齐：材质终值 color #3f8fc4 / opacity 0.8 / transparent /
 * roughness 0.15 / metalness 0.1（旧 v1 材质基线，FrontSide 不设即默认）；
 * flowSpeed 沿旧路径仅数据保存（别名表无映射），参数键名/默认值/范围沿旧 styles.ts（UI 语义连续）。
 * 边界：遵循 types.ts 插件授权规则——update 读 instance.material（引擎可能换绑模板/clone）、
 *      dispose 不释放材质与传入几何（归引擎/调用方）。
 */
import * as THREE from 'three';
import type { StylePresetMeta } from '../../../registries';
import { readColor, readNumber } from '../presetHelpers';
import { SURFACE_SHAPES } from '../presetShapes';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'water.standard',
  name: '标准水面',
  category: 'water',
  thumbnail: svgThumbnail('#3f8fc4', `<path d='M4 16q6-6 12 0t12 0' fill='#fff' fill-opacity='.45'/>`),
  supportedShapes: [...SURFACE_SHAPES],
  supportedSemantics: ['water'],
  defaultParams: [
    { key: 'color', label: '颜色', type: 'color', default: '#3f8fc4' },
    { key: 'opacity', label: '透明度', type: 'number', default: 0.8, min: 0.3, max: 1, step: 0.05 },
    { key: 'flowSpeed', label: '流动速度', type: 'number', default: 0, min: 0, max: 2, step: 0.1 },
  ],
};

export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const opacity = readNumber(params.opacity, 0.8, 0.3, 1);
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(readColor(params.color, '#3f8fc4')),
    opacity,
    transparent: opacity < 1,
    roughness: 0.15,
    metalness: 0.1,
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
      // flowSpeed 沿旧路径仅数据保存，不映射渲染
    },
    setGeometry(next) {
      mesh.geometry = next; // 旧几何归调用方，不在此释放
    },
    dispose() {
      // 授权规则 1/2：材质归引擎（disposeStyle 引用计数释放）、传入几何归调用方
      mesh.removeFromParent();
    },
  };
  return instance;
}
