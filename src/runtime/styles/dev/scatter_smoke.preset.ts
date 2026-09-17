/**
 * runtime/styles/dev/scatter_smoke.preset —— T003.3 端到端验收用临时散布配方（003.5 处置）。
 *
 * 用途：主代理浏览器验收「画区域 → 应用散布配方 → 实例可见 → 改参局部重算 → 换装清除 →
 *      undo 恢复 → 点实例选区域」的端到端链路。正式绿地散布样式（花卉/灌木/自然林地）
 *      在 003.5 落地后本文件即被替换处置（删除或归档），勿以它为样式编写范本。
 * 结构（D18「同构两段可选」）：表面段 = 简单草地色 flat 材质（沿 base/flat.preset 先例）；
 *      scatter 段 = 设施资产配比 asset_trashbin:3 + asset_hydrant:1（真实注册的程序化
 *      资产，密度 0.03/m²——32m 块约 30 实例，验收可见且不炸 draw call）。
 * 边界：遵循 types.ts 插件授权规则（update 读 instance.material、dispose 零释放）。
 */
import * as THREE from 'three';
import type { SemanticType } from '../../../domain/regions';
import { SHAPE_TYPES } from '../../../domain/regions';
import type { StylePresetMeta } from '../../../registries';
import { readColor } from '../presetHelpers';
import { svgThumbnail } from '../presetThumbnail';
import type { StyleInstance } from '../types';

/** 散布型样式只对面类形状开放（line/point 撒点退化，不给入口） */
const FACE_SHAPES = SHAPE_TYPES.filter((t) => t !== 'line' && t !== 'point') as StylePresetMeta['supportedShapes'];

/** 可用语义：绿地为主 + 自定义/未分类/裸地（验收时画任意面类区域均可套用） */
const LAND_SEMANTICS: SemanticType[] = ['grass', 'custom', 'unclassified', 'bare_land'];

export const meta: StylePresetMeta = {
  id: 'dev.scatter_smoke',
  name: '散布冒烟（临时）',
  category: 'dev',
  thumbnail: svgThumbnail('#7aa35c', `<circle cx='11' cy='18' r='3' fill='#4a5a44'/><circle cx='21' cy='14' r='2' fill='#c0392b'/>`),
  supportedShapes: FACE_SHAPES,
  supportedSemantics: LAND_SEMANTICS,
  defaultParams: [
    { key: 'color', label: '颜色', type: 'color', default: '#7aa35c' },
  ],
  scatter: {
    assets: [
      { assetId: 'asset_trashbin', weight: 3 },
      { assetId: 'asset_hydrant', weight: 1 },
    ],
    densityPerM2: 0.03,
    clustering: 0.6,
    clusterRadiusM: 6,
    edgeFalloffM: 2,
    scaleRange: { min: 0.9, max: 1.2 },
  },
};

export function build(geometry: THREE.BufferGeometry, params: Record<string, unknown>): StyleInstance {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(readColor(params.color, '#7aa35c')),
    roughness: 0.95,
    metalness: 0,
    side: THREE.DoubleSide, // 线/点几何薄片同基线（虽不开放，保持通用面类行为一致）
  });
  const mesh = new THREE.Mesh(geometry, material);

  const instance: StyleInstance = {
    object: mesh,
    material,
    presetId: meta.id,
    supportedShapes: [...meta.supportedShapes],
    update(p) {
      // 授权规则 1：读当前材质（引擎模板共享/写时复制可能已换绑）
      if (typeof p.color === 'string' && p.color !== '') {
        (instance.material as THREE.MeshStandardMaterial).color.set(p.color);
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
