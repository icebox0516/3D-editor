/**
 * runtime/styles/poi/beam.preset —— 光柱（poi 预设，T6.3 新增，无旧对照）。
 *
 * 设计：插件自建 CylinderGeometry（半径 0.35、单位高、底面贴原点）+ ShaderMaterial
 *      半透明竖向渐变（沿高度 alpha 自底向顶渐隐，pow 1.5 衰减）、AdditiveBlending、
 *      DoubleSide、depthWrite false。柱高经 mesh.scale.y 实现（单位几何缩放）——
 *      update 零几何重建（授权规则 4），法线（水平向）与 uv 渐变均不受 y 缩放影响。
 *      传入 point 几何存引用但不使用不释放（授权规则 2）。
 * 边界：遵循 types.ts 插件授权规则（update 读 instance.material；dispose 释放插件
 *      自建几何，不释放材质与传入几何）。
 */
import * as THREE from 'three';
import type { StylePresetMeta } from '../../../registries';
import { readColor, readNumber } from '../presetHelpers';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

const BEAM_RADIUS = 0.35;

export const meta: StylePresetMeta = {
  id: 'poi.beam',
  name: '光柱',
  category: 'poi',
  thumbnail: svgThumbnail('#66d9ff', `<rect x='15' y='5' width='2' height='22' fill='#fff' fill-opacity='.6'/>`),
  supportedShapes: ['point'],
  supportedSemantics: ['poi'],
  defaultParams: [
    { key: 'color', label: '光色', type: 'color', default: '#66d9ff' },
    { key: 'opacity', label: '透明度', type: 'number', default: 0.6, min: 0.1, max: 1, step: 0.05 },
    { key: 'height', label: '柱高', type: 'number', default: 8, min: 2, max: 30, step: 0.5 },
  ],
};

/** 单位高圆柱（开口无端盖，底面贴 y=0）：高度视觉由 scale.y 供给 */
function createBeamGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(BEAM_RADIUS, BEAM_RADIUS, 1, 24, 1, true);
  geometry.translate(0, 0.5, 0);
  return geometry;
}

export function build(_geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  // _geometry（point 几何）归调用方：光柱视觉不消费传入几何，存档忽略（授权规则 2，不释放）
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(readColor(params.color, '#66d9ff')) },
      uOpacity: { value: readNumber(params.opacity, 0.6, 0.1, 1) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        // 静态空间渐变：沿高度自底（uv.y=0）向顶（uv.y=1）渐隐；非时间动画
        float alpha = uOpacity * pow(1.0 - vUv.y, 1.5);
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const beamGeometry = createBeamGeometry(); // 插件自建视觉几何（实例独占，dispose 释放）
  const mesh = new THREE.Mesh(beamGeometry, material);
  mesh.scale.y = readNumber(params.height, 8, 2, 30);

  const instance: StyleInstance = {
    object: mesh,
    material,
    presetId: meta.id,
    supportedShapes: [...meta.supportedShapes],
    update(p) {
      // 授权规则 1/4：读当前材质；只改 uniforms 与 scale（零几何重建）
      const mat = instance.material as THREE.ShaderMaterial;
      if (typeof p.color === 'string' && p.color !== '') {
        (mat.uniforms.uColor.value as THREE.Color).set(p.color);
      }
      if (p.opacity !== undefined) {
        mat.uniforms.uOpacity.value = readNumber(p.opacity, mat.uniforms.uOpacity.value as number, 0.1, 1);
      }
      if (p.height !== undefined) {
        mesh.scale.y = readNumber(p.height, mesh.scale.y, 2, 30);
      }
    },
    setGeometry() {
      // point 几何归调用方：存档忽略（授权规则 2，不释放）
    },
    dispose() {
      beamGeometry.dispose(); // 插件自建几何释放；材质归引擎、传入几何归调用方
      mesh.removeFromParent();
    },
  };
  return instance;
}
