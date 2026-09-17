/**
 * runtime/styles/base/grid.preset —— 网格（base 通用预设，T6.3 新增，无旧对照）。
 *
 * 设计：静态 ShaderMaterial 世界 XZ 网格线——片元按世界坐标 fract 采样网格线
 *      （线色 + 半透明底：线处高 alpha、格内低 alpha），transparent + DoubleSide。
 *      参数 lineColor/cellSize/opacity 全部只改 uniforms（零几何重建、零时间动画——
 *      网格为静态空间图案，无 uTime）。
 * 边界：遵循 types.ts 插件授权规则（update 读 instance.material、dispose 零释放）。
 */
import * as THREE from 'three';
import { SEMANTIC_TYPES, SHAPE_TYPES } from '../../../domain/regions';
import type { StylePresetMeta } from '../../../registries';
import { readColor, readNumber } from '../presetHelpers';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

export const meta: StylePresetMeta = {
  id: 'base.grid',
  name: '网格',
  category: 'base',
  thumbnail: svgThumbnail('#66d9ff', `<path d='M16 5v22M5 16h22' fill='none' stroke='#fff'/>`),
  supportedShapes: [...SHAPE_TYPES],
  supportedSemantics: [...SEMANTIC_TYPES],
  defaultParams: [
    { key: 'lineColor', label: '线色', type: 'color', default: '#66d9ff' },
    { key: 'cellSize', label: '单元格', type: 'number', default: 2, min: 0.5, max: 10, step: 0.5 },
    { key: 'opacity', label: '透明度', type: 'number', default: 0.6, min: 0, max: 1, step: 0.05 },
  ],
};

export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uLineColor: { value: new THREE.Color(readColor(params.lineColor, '#66d9ff')) },
      uCellSize: { value: readNumber(params.cellSize, 2, 0.5, 10) },
      uOpacity: { value: readNumber(params.opacity, 0.6, 0, 1) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorldPos;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorldPos = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uLineColor;
      uniform float uCellSize;
      uniform float uOpacity;
      varying vec3 vWorldPos;
      void main() {
        // 世界 XZ 网格线（fwidth 抗锯齿，WebGL2 内建导数）
        vec2 cell = vWorldPos.xz / uCellSize;
        vec2 grid = abs(fract(cell - 0.5) - 0.5) / fwidth(cell);
        float line = 1.0 - min(min(grid.x, grid.y), 1.0);
        // 线处高不透明度、格内半透明底（同色弱化）
        float alpha = mix(uOpacity * 0.2, uOpacity, line);
        gl_FragColor = vec4(uLineColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false, // 透明网格不写深度，避免与地面 z 冲突
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);

  const instance: StyleInstance = {
    object: mesh,
    material,
    presetId: meta.id,
    supportedShapes: [...meta.supportedShapes],
    update(p) {
      // 授权规则 1：读当前材质；update 只改 uniforms（禁止重建几何）
      const mat = instance.material as THREE.ShaderMaterial;
      if (typeof p.lineColor === 'string' && p.lineColor !== '') {
        (mat.uniforms.uLineColor.value as THREE.Color).set(p.lineColor);
      }
      if (p.cellSize !== undefined) {
        mat.uniforms.uCellSize.value = readNumber(p.cellSize, mat.uniforms.uCellSize.value as number, 0.5, 10);
      }
      if (p.opacity !== undefined) {
        mat.uniforms.uOpacity.value = readNumber(p.opacity, mat.uniforms.uOpacity.value as number, 0, 1);
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
