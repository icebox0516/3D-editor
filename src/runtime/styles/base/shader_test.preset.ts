/**
 * runtime/styles/base/shader_test.preset —— 验证用 Shader 预设（测试资产，T6.2）。
 *
 * 职责：证明任意 ShaderMaterial 可挂进样式引擎——uniforms 含 uTime 动画钩子
 *      （uTime 服务自动驱动，D19.7 / T008.1；不经参数通道修改），参数 color/opacity/speed
 *      经 updateStyle 只改 uniforms（不重建对象/材质/几何）。meta 标 category 'test'，
 *      供一致性守门与引擎参数通路（semantic 保留键）端到端验证。
 * 边界：Shader 代码为最小可编译示例（世界坐标波纹），不追求视觉成品；
 *      遵循 types.ts 插件授权规则（update 读 instance.material、dispose 零释放）。
 */
import * as THREE from 'three';
import { SEMANTIC_TYPES, SHAPE_TYPES } from '../../../domain/regions';
import type { StylePresetMeta } from '../../../registries';
import { readColor, readNumber } from '../presetHelpers';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'test.shader',
  name: '测试·时间波纹',
  category: 'test',
  supportedShapes: [...SHAPE_TYPES],
  supportedSemantics: [...SEMANTIC_TYPES],
  defaultParams: [
    { key: 'color', label: '颜色', type: 'color', default: '#3E7BFA' },
    { key: 'opacity', label: '透明度', type: 'number', default: 1, min: 0, max: 1, step: 0.05 },
    { key: 'speed', label: '流速', type: 'number', default: 1, min: 0, max: 4, step: 0.1 },
  ],
};

/** 验证用 Shader 构建：uTime/uColor/uOpacity/uSpeed uniforms + 顶点波纹片元 */
export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const opacity = readNumber(params.opacity, 1, 0, 1);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, // 动画钩子：uTime 服务自动驱动（D19.7 / T008.1），update 不触碰
      uColor: { value: new THREE.Color(readColor(params.color, '#3E7BFA')) },
      uOpacity: { value: opacity },
      uSpeed: { value: readNumber(params.speed, 1, 0, 4) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uOpacity;
      uniform float uSpeed;
      uniform vec3 uColor;
      varying vec3 vPos;
      void main() {
        float wave = sin((vPos.x + vPos.z) * 2.0 + uTime * uSpeed) * 0.5 + 0.5;
        gl_FragColor = vec4(uColor * (0.6 + 0.4 * wave), uOpacity);
      }
    `,
    transparent: opacity < 1,
  });
  const mesh = new THREE.Mesh(geometry, material);

  const instance: StyleInstance = {
    object: mesh,
    material,
    presetId: meta.id,
    supportedShapes: [...meta.supportedShapes],
    update(p) {
      // 授权规则 1：读当前材质；update 只改 uniforms（禁止重建几何/换材质）
      const mat = instance.material as THREE.ShaderMaterial;
      if (typeof p.color === 'string' && p.color !== '') {
        (mat.uniforms.uColor.value as THREE.Color).set(p.color);
      }
      const nextOpacity = readNumber(p.opacity, mat.uniforms.uOpacity.value as number, 0, 1);
      mat.uniforms.uOpacity.value = nextOpacity;
      mat.transparent = nextOpacity < 1;
      if (typeof p.speed === 'number' && Number.isFinite(p.speed)) {
        mat.uniforms.uSpeed.value = readNumber(p.speed, mat.uniforms.uSpeed.value as number, 0, 4);
      }
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
