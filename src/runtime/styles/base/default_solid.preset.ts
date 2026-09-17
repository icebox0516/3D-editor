/**
 * runtime/styles/base/default_solid.preset —— 默认实体预设（降级兜底基线，T6.2）。
 *
 * 职责：MeshStandardMaterial 标准实体渲染，color/opacity 两个参数；
 *      全形状 × 全语义支持——引擎降级三路径（presetId 缺失 / 形状不支持 / build 抛错）
 *      一律回退本预设（FALLBACK_PRESET_ID，domain semanticDefinitions.defaultPresetId 过渡期基线）。
 * 边界：遵循 types.ts 插件授权规则——update 读 instance.material（引擎可能换绑模板/clone）、
 *      dispose 不释放材质与传入几何（归引擎/调用方）。
 */
import * as THREE from 'three';
import { SEMANTIC_TYPES, SHAPE_TYPES } from '../../../domain/regions';
import type { StylePresetMeta } from '../../../registries';
import { readColor, readNumber } from '../presetHelpers';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'default_solid',
  name: '默认实体',
  category: 'base',
  supportedShapes: [...SHAPE_TYPES],
  supportedSemantics: [...SEMANTIC_TYPES],
  defaultParams: [
    { key: 'color', label: '颜色', type: 'color', default: '#909399' },
    { key: 'opacity', label: '透明度', type: 'number', default: 1, min: 0, max: 1, step: 0.05 },
  ],
};

/** 默认实体构建：贴地表面适用 DoubleSide（面片正反均可见） */
export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const opacity = readNumber(params.opacity, 1, 0, 1);
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(readColor(params.color, '#909399')),
    opacity,
    transparent: opacity < 1,
    roughness: 0.9, // 建筑场景友好默认（对齐 v1 材质基线）
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
      // 授权规则 1/2：材质归引擎（disposeStyle 引用计数释放）、传入几何归调用方
      mesh.removeFromParent();
    },
  };
  return instance;
}
