/**
 * runtime/styles/base/default_wireframe.preset —— 默认线框预设（内置基础插件 2/2，T6.2）。
 *
 * 职责：MeshBasicMaterial 线框渲染，color/opacity 两参数；全形状 × 全语义支持。
 * 边界：同 default_solid——遵循 types.ts 插件授权规则（update 读当前材质、
 *      dispose 不释放材质与传入几何）；线框/X-Ray 全局渲染模式属场景级
 *      overrideMaterial（T6.4），与本预设无耦合。
 */
import * as THREE from 'three';
import { SEMANTIC_TYPES, SHAPE_TYPES } from '../../../domain/regions';
import type { StylePresetMeta } from '../../../registries';
import { readColor, readNumber } from '../presetHelpers';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'default_wireframe',
  name: '默认线框',
  category: 'base',
  supportedShapes: [...SHAPE_TYPES],
  supportedSemantics: [...SEMANTIC_TYPES],
  defaultParams: [
    { key: 'color', label: '颜色', type: 'color', default: '#60A5FA' },
    { key: 'opacity', label: '透明度', type: 'number', default: 1, min: 0, max: 1, step: 0.05 },
  ],
};

/** 默认线框构建：不受光照的基础材质 + wireframe */
export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const opacity = readNumber(params.opacity, 1, 0, 1);
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(readColor(params.color, '#60A5FA')),
    opacity,
    transparent: opacity < 1,
    wireframe: true,
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
      const mat = instance.material as THREE.MeshBasicMaterial;
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
