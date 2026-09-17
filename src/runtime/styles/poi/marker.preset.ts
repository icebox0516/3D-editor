/**
 * runtime/styles/poi/marker.preset —— 地面标记（poi 预设，T6.3 新增，无旧对照）。
 *
 * 设计：插件自建 RingGeometry（内 0.6 / 外 1.0，48 段）rotateX(-π/2) 贴地（法线朝 +Y）+
 *      MeshStandardMaterial emissive（color 与 emissive 同源、glow → emissiveIntensity）；
 *      size 经 mesh.scale 等比缩放（零几何重建）。传入 point 几何存引用但不使用不释放
 *      （授权规则 2）。DoubleSide：俯视主视角 + 仰视兜底可见。
 * 边界：遵循 types.ts 插件授权规则（update 读 instance.material；dispose 释放插件自建
 *      几何，不释放材质与传入几何）。
 */
import * as THREE from 'three';
import type { StylePresetMeta } from '../../../registries';
import { readColor, readNumber } from '../presetHelpers';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'poi.marker',
  name: '地面标记',
  category: 'poi',
  thumbnail: svgThumbnail('#ffb454', `<circle cx='16' cy='18' r='6' fill='none' stroke='#fff' stroke-width='3'/>`),
  supportedShapes: ['point'],
  supportedSemantics: ['poi'],
  defaultParams: [
    { key: 'color', label: '标记色', type: 'color', default: '#ffb454' },
    { key: 'size', label: '尺寸', type: 'number', default: 1.5, min: 0.5, max: 4, step: 0.1 },
    { key: 'glow', label: '发光强度', type: 'number', default: 1.2, min: 0, max: 5, step: 0.1 },
  ],
};

/** 贴地圆环几何（XZ 平面，法线 +Y）：插件自建，实例独占 */
function createMarkerGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.RingGeometry(0.6, 1.0, 48);
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

export function build(_geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  // _geometry（point 几何）归调用方：标记视觉不消费传入几何，存档忽略（授权规则 2，不释放）
  const color = readColor(params.color, '#ffb454');
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color), // 发光标记：emissive 与 color 同源
    emissiveIntensity: readNumber(params.glow, 1.2, 0, 5),
    roughness: 0.6,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const markerGeometry = createMarkerGeometry();
  const mesh = new THREE.Mesh(markerGeometry, material);
  mesh.scale.setScalar(readNumber(params.size, 1.5, 0.5, 4));

  const instance: StyleInstance = {
    object: mesh,
    material,
    presetId: meta.id,
    supportedShapes: [...meta.supportedShapes],
    update(p) {
      // 授权规则 1/4：读当前材质；只改参数与 scale（零几何重建）
      const mat = instance.material as THREE.MeshStandardMaterial;
      if (typeof p.color === 'string' && p.color !== '') {
        mat.color.set(p.color);
        mat.emissive.set(p.color); // 同源联动
      }
      if (p.size !== undefined) mesh.scale.setScalar(readNumber(p.size, mesh.scale.x, 0.5, 4));
      if (p.glow !== undefined) mat.emissiveIntensity = readNumber(p.glow, mat.emissiveIntensity, 0, 5);
    },
    setGeometry() {
      // point 几何归调用方：存档忽略（授权规则 2，不释放）
    },
    dispose() {
      markerGeometry.dispose(); // 插件自建几何释放；材质归引擎、传入几何归调用方
      mesh.removeFromParent();
    },
  };
  return instance;
}
