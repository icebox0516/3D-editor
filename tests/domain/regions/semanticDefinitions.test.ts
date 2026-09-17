/**
 * tests/domain/regions/semanticDefinitions.test.ts —— 语义注册表数据测试（T6.1，先测后码）。
 *
 * 覆盖：
 * - SemanticType 十类枚举（需求 §四 定稿顺序）；
 * - 十条内置定义：label / defaultLayerName（中文名）/ properties（road: width、building: height）/
 *   defaultPresetId / defaultBaseHeight（road 0.06 / grass 0.12 / water 0.18，其余 0）；
 * - getSemanticDefinition 查询（未知类型 undefined）。
 * 边界：domain 纯数据表，只读快照断言；defaultLayerName 是语义→默认图层名的单一真相源
 *（主代理裁决 2026-09-11：旧「按要素类型默认图层名表」翻转让 T6.7 收口删除）。
 */
import { describe, expect, it } from 'vitest';
import {
  SEMANTIC_DEFINITIONS,
  SEMANTIC_TYPES,
  getSemanticDefinition,
} from '../../../src/domain/regions';

describe('SEMANTIC_TYPES（十类语义枚举）', () => {
  it('与分域契约 §A / 需求 §四 逐字一致（定稿顺序）', () => {
    expect([...SEMANTIC_TYPES]).toEqual([
      'unclassified',
      'water',
      'grass',
      'plaza',
      'parking',
      'bare_land',
      'road',
      'building',
      'poi',
      'custom',
    ]);
  });
});

describe('内置十条语义定义', () => {
  it('恰好十条，type 与枚举一一对应且顺序一致', () => {
    expect(SEMANTIC_DEFINITIONS).toHaveLength(10);
    expect(SEMANTIC_DEFINITIONS.map((d) => d.type)).toEqual([...SEMANTIC_TYPES]);
  });

  it('label 与 defaultLayerName 取需求 §四 定稿中文名', () => {
    const expected: Record<string, string> = {
      unclassified: '未分类',
      water: '水面',
      grass: '绿地',
      plaza: '广场',
      parking: '停车场',
      bare_land: '裸地',
      road: '道路',
      building: '建筑',
      poi: 'POI',
      custom: '自定义',
    };
    for (const def of SEMANTIC_DEFINITIONS) {
      expect(def.label).toBe(expected[def.type]);
      expect(def.defaultLayerName).toBe(expected[def.type]);
    }
  });

  it('业务参数：road 含 width（默认 6，对齐 v1 registries/definitions/road.ts），building 含 height（默认 10，对齐 v1 building.ts），其余八类为空', () => {
    const byType = new Map<string, (typeof SEMANTIC_DEFINITIONS)[number]>(
      SEMANTIC_DEFINITIONS.map((d) => [d.type, d] as const),
    );

    const road = byType.get('road')!;
    expect(road.properties).toHaveLength(1);
    const width = road.properties[0]!;
    expect(width.key).toBe('width');
    expect(width.label).toBe('宽度');
    expect(width.type).toBe('number');
    expect(width.default).toBe(6);
    expect(typeof width.min).toBe('number');
    expect(typeof width.step).toBe('number');

    const building = byType.get('building')!;
    expect(building.properties).toHaveLength(1);
    const height = building.properties[0]!;
    expect(height.key).toBe('height');
    expect(height.label).toBe('高度');
    expect(height.type).toBe('number');
    expect(height.default).toBe(10);
    expect(typeof height.min).toBe('number');
    expect(typeof height.step).toBe('number');

    for (const type of ['unclassified', 'water', 'grass', 'plaza', 'parking', 'bare_land', 'poi', 'custom']) {
      expect(byType.get(type)!.properties).toEqual([]);
    }
  });

  it('defaultPresetId：T6.3 预设库落地——八类指向专属默认预设，unclassified/bare_land 保持 default_solid', () => {
    const expected: Record<string, string> = {
      unclassified: 'default_solid', // 任务书钉死
      water: 'water.standard',
      grass: 'grass.lawn',
      plaza: 'plaza.paving',
      parking: 'parking.standard',
      bare_land: 'default_solid', // 无专属预设
      road: 'road.standard',
      building: 'building.default',
      poi: 'poi.billboard',
      custom: 'base.flat',
    };
    for (const def of SEMANTIC_DEFINITIONS) {
      expect(def.defaultPresetId).toBe(expected[def.type]);
    }
  });

  it('defaultBaseHeight 数值锁定（唯一数值源）：road 0.06 / grass 0.12 / water 0.18，其余 0', () => {
    const expected: Record<string, number> = {
      unclassified: 0,
      water: 0.18,
      grass: 0.12,
      plaza: 0,
      parking: 0,
      bare_land: 0,
      road: 0.06,
      building: 0,
      poi: 0,
      custom: 0,
    };
    for (const def of SEMANTIC_DEFINITIONS) {
      expect(def.defaultBaseHeight).toBe(expected[def.type]);
    }
  });
});

describe('getSemanticDefinition（查询函数）', () => {
  it('已注册类型返回对应定义', () => {
    expect(getSemanticDefinition('water')?.label).toBe('水面');
    expect(getSemanticDefinition('road')?.defaultBaseHeight).toBe(0.06);
  });

  it('未知类型返回 undefined（消费方自行回退）', () => {
    expect(getSemanticDefinition('alien_type')).toBeUndefined();
    expect(getSemanticDefinition('building_old')).toBeUndefined();
  });
});
