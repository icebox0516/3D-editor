/**
 * runtime/styles/building/default.preset —— 默认建筑（改造自 style_building_default，T6.3）。
 *
 * 挤出预设：平面轮廓（调用方 XZ 三角网）+ semantic.height → 立体挤出（侧面+顶面单材质
 * 单 Mesh）；墙体材质基线沿旧 spec：color #b0a99f / roughness 0.85 / metalness 0。
 * 参数沿旧 buildingParams（primaryColor/opacity/glow；glow 同貌策略 = emissiveIntensity
 * 映射 + emissive 保持黑）。挤出实现与资源归属见 buildingExtrude.ts 头注。
 */
import { createBuildingPreset } from './buildingExtrude';

const { meta, build } = createBuildingPreset({
  id: 'building.default',
  name: '默认建筑',
  color: '#b0a99f',
  roughness: 0.85,
  metalness: 0,
  glyph: `<rect x='10' y='9' width='12' height='15' fill='#fff' fill-opacity='.35'/>`,
});

export { meta, build };
