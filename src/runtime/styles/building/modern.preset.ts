/**
 * runtime/styles/building/modern.preset —— 现代建筑（改造自 style_building_modern，T6.3）。
 *
 * 挤出预设：平面轮廓（调用方 XZ 三角网）+ semantic.height → 立体挤出（侧面+顶面单材质
 * 单 Mesh）；墙体材质基线沿旧 spec：color #d8d8dc / roughness 0.5 / metalness 0.15。
 * 参数沿旧 buildingParams（primaryColor/opacity/glow；glow 同貌策略 = emissiveIntensity
 * 映射 + emissive 保持黑）。挤出实现与资源归属见 buildingExtrude.ts 头注。
 */
import { createBuildingPreset } from './buildingExtrude';

const { meta, build } = createBuildingPreset({
  id: 'building.modern',
  name: '现代建筑',
  color: '#d8d8dc',
  roughness: 0.5,
  metalness: 0.15,
  glyph: `<rect x='10' y='9' width='12' height='15' fill='#fff' fill-opacity='.5'/>`,
});

export { meta, build };
