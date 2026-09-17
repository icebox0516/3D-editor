/**
 * tests/app/defaultLayers.semantic.test.ts —— 默认图层翻转派生一致性测试（T6.7 C 节，先测后码）。
 *
 * 覆盖：
 * - DEFAULT_LAYER_NAMES = 十类语义图层（顺序 = SEMANTIC_TYPES 序、名称 = 语义定义
 *   defaultLayerName）再追加「模型」第十一层——派生而非重复字面量（单一真相源 =
 *   domain/regions/semanticDefinitions.defaultLayerName，锁定派生关系）；
 * - createDefaultSceneData 的图层清单与 DEFAULT_LAYER_NAMES 逐项一致（order 递增）；
 * - 语义归层接线现状锁定：ChangeSemanticCommand / DrawToolBase 已按语义 defaultLayerName
 *   归层（现状断言：场景中存在语义图层名即可命中）；model 归层查「模型」层
 *   （defaultLayerIdFor(scene, 'model')）。
 * 边界：旧「按要素类型默认图层名表」已删除；未注册类型归层回退 null（现状兼容）。
 */
import { describe, expect, it } from 'vitest';
import {
  SEMANTIC_DEFINITIONS,
  SEMANTIC_TYPES,
} from '../../src/domain/regions/semanticDefinitions';
import {
  DEFAULT_LAYER_NAMES,
  createDefaultSceneData,
  createEditor,
  defaultLayerIdFor,
} from '../../src/app/bootstrap';

describe('默认图层翻转：十类语义图层 + 模型层（T6.7 C）', () => {
  it('DEFAULT_LAYER_NAMES 由 SEMANTIC_DEFINITIONS 派生：十语义层（序 = SEMANTIC_TYPES、名 = defaultLayerName）+ 模型', () => {
    expect(DEFAULT_LAYER_NAMES).toEqual([
      ...SEMANTIC_TYPES.map((type) => {
        const def = SEMANTIC_DEFINITIONS.find((d) => d.type === type)!;
        return def.defaultLayerName;
      }),
      '模型',
    ]);
  });

  it('语义图层名清单 = 未分类/水面/绿地/广场/停车场/裸地/道路/建筑/POI/自定义（需求 §四 默认图层列定稿）', () => {
    expect(DEFAULT_LAYER_NAMES).toEqual([
      '未分类', '水面', '绿地', '广场', '停车场', '裸地', '道路', '建筑', 'POI', '自定义', '模型',
    ]);
    expect(DEFAULT_LAYER_NAMES).toHaveLength(11);
  });

  it('createDefaultSceneData 图层与 DEFAULT_LAYER_NAMES 逐项一致（order 递增、layer_ 前缀）', () => {
    const data = createDefaultSceneData('语义图层场景');
    expect(data.layers.map((l) => l.name)).toEqual([...DEFAULT_LAYER_NAMES]);
    data.layers.forEach((layer, i) => {
      expect(layer.order).toBe(i);
      expect(layer.id).toMatch(/^layer_/);
      expect(layer.objectIds).toEqual([]);
    });
  });

  it('model 归层查「模型」层；未注册类型回退 null（defaultLayerIdFor 迁移后语义）', () => {
    const facade = createEditor(null);
    const layers = facade.scene.getLayers();
    const modelLayer = layers.find((l) => l.name === '模型')!;
    expect(modelLayer).toBeDefined();
    expect(defaultLayerIdFor(facade.scene, 'model')).toBe(modelLayer.id);
    expect(defaultLayerIdFor(facade.scene, 'alien_type')).toBeNull();
    facade.dispose();
  });
});
