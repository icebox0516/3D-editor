/**
 * tests/registries/SemanticRegistry.test.ts —— 语义注册表测试（T6.1，先测后码）。
 *
 * 覆盖：
 * - createSemanticRegistry 工厂预载十条内置定义（与 domain SEMANTIC_DEFINITIONS 同源）；
 * - register / get / has / list 基础语义（模式对齐 ElementRegistry 纯数据形态）；
 * - 重复注册抛错、非法定义抛错、空表行为；
 * - getSemanticDefinition 与注册表数据一致（单一真相源）。
 * 边界：纯数据注册表（零渲染、零构建函数）；本任务不接入 EditorFacade（T6.5/T6.6 接线）。
 */
import { describe, expect, it } from 'vitest';
import {
  SEMANTIC_DEFINITIONS,
  getSemanticDefinition,
} from '../../src/domain/regions';
import type { SemanticDefinition } from '../../src/domain/regions';
import { SemanticRegistry, createSemanticRegistry } from '../../src/registries/SemanticRegistry';

describe('createSemanticRegistry（工厂预载内置定义）', () => {
  it('预载十条内置定义，顺序与 domain 定义一致', () => {
    const registry = createSemanticRegistry();
    expect(registry.list().map((d) => d.type)).toEqual(SEMANTIC_DEFINITIONS.map((d) => d.type));
    expect(registry.list()).toEqual(SEMANTIC_DEFINITIONS);
  });

  it('注册表定义与 getSemanticDefinition 同源一致（单一真相源）', () => {
    const registry = createSemanticRegistry();
    for (const def of registry.list()) {
      expect(registry.get(def.type)).toEqual(getSemanticDefinition(def.type));
    }
  });
});

describe('SemanticRegistry（register / get / has / list）', () => {
  it('空表：list 空、has 假、get undefined', () => {
    const registry = new SemanticRegistry();
    expect(registry.list()).toEqual([]);
    expect(registry.has('water')).toBe(false);
    expect(registry.get('water')).toBeUndefined();
  });

  it('register 后 get/has 可查，list 保持注册顺序', () => {
    const registry = new SemanticRegistry();
    const water: SemanticDefinition = {
      type: 'water',
      label: '水面',
      defaultLayerName: '水面',
      properties: [],
      defaultPresetId: 'default_solid',
      defaultBaseHeight: 0.18,
    };
    const custom: SemanticDefinition = {
      type: 'custom',
      label: '自定义',
      defaultLayerName: '自定义',
      properties: [],
      defaultPresetId: 'default_solid',
      defaultBaseHeight: 0,
    };
    registry.register(water);
    registry.register(custom);
    expect(registry.has('water')).toBe(true);
    expect(registry.get('water')).toBe(water);
    expect(registry.list().map((d) => d.type)).toEqual(['water', 'custom']);
  });

  it('重复注册同 type 抛错', () => {
    const registry = createSemanticRegistry();
    const dup: SemanticDefinition = { ...SEMANTIC_DEFINITIONS[0]! };
    expect(() => registry.register(dup)).toThrow(/已注册/);
  });

  it('非法定义（空对象 / 缺 type）抛错', () => {
    const registry = new SemanticRegistry();
    expect(() => registry.register(null as unknown as SemanticDefinition)).toThrow();
    expect(() => registry.register({} as SemanticDefinition)).toThrow();
    expect(() => registry.register({ label: '无类型' } as unknown as SemanticDefinition)).toThrow();
  });
});
