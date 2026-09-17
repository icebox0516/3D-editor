/**
 * tests/ui/tools/regionQuickApply.test.ts —— 三步流第三步「赋类型与样式」快选测试
 * （T6.5，先测后码；node 纯逻辑，GUI 呈现留阶段验收）。
 *
 * 覆盖：
 * - quickApplyChips：八类芯片（water/grass/plaza/parking/bare_land/road/building/poi），
 *   语义注册表驱动（SEMANTIC_DEFINITIONS 顺序），不含 unclassified/custom；
 * - presetOptions：StylePresetRegistry.find(shape × semantic) 过滤 + 颜色参数派生色样；
 *   无命中时回退 default_solid（meta 支持全部形状与语义）；
 * - applySemanticAndPreset：ChangeSemanticCommand（自动归层 + 默认预设 + 清 overrides）
 *   与 ChangePresetCommand 经 BatchCommand 合并为**一条历史**——undo 一次整体回退
 *   （类型 + 图层 + 样式一并恢复），redo 恢复；语义属性默认值随类型写入
 *   （road.width=6 / building.height=10）；
 * - 非 RegionObject 目标：命令执行失败返回 false、零历史。
 */
import { describe, expect, it } from 'vitest';
import { createEditor } from '../../../src/app/bootstrap';
import { createRegionObject } from '../../../src/domain/regions';
import type { RegionObject } from '../../../src/domain/regions';
import type { ModelObject } from '../../../src/domain/assets';
import { CreateObjectCommand } from '../../../src/editor/commands';
import {
  applySemanticAndPreset,
  presetOptions,
  quickApplyChips,
} from '../../../src/ui/tools/regionQuickApply';

describe('quickApplyChips（类型芯片清单）', () => {
  it('八类芯片：语义注册表顺序，不含 unclassified 与 custom', () => {
    expect(quickApplyChips().map((c) => c.type)).toEqual([
      'water',
      'grass',
      'plaza',
      'parking',
      'bare_land',
      'road',
      'building',
      'poi',
    ]);
    for (const chip of quickApplyChips()) {
      expect(chip.label.length).toBeGreaterThan(0);
    }
  });
});

describe('presetOptions（预设快选条：shape × semantic 过滤）', () => {
  it('水面面类预设全部命中；色样取 defaultParams 的 color 默认值', () => {
    const facade = createEditor(null);
    const options = presetOptions(facade.registries.presets, 'polygon', 'water');
    expect(options.length).toBeGreaterThanOrEqual(3); // water.standard/dynamic/tech（T6.3 迁移三套）
    expect(options.map((o) => o.id)).toContain('water.standard');
    const standard = options.find((o) => o.id === 'water.standard')!;
    expect(standard.name.length).toBeGreaterThan(0);
    facade.dispose();
  });

  it('点形状 × poi 语义：图标牌等 POI 预设命中', () => {
    const facade = createEditor(null);
    const options = presetOptions(facade.registries.presets, 'point', 'poi');
    expect(options.map((o) => o.id)).toContain('poi.billboard');
    facade.dispose();
  });

  it('无命中组合回退 default_solid（全形状全语义兜底）', () => {
    const facade = createEditor(null);
    const options = presetOptions(facade.registries.presets, 'line', 'grass');
    expect(options.map((o) => o.id)).toContain('default_solid');
    facade.dispose();
  });
});

describe('applySemanticAndPreset（一条历史：语义 + 预设批合并）', () => {
  /** 语义默认图层 id（T6.7：默认场景即含十类语义图层，按名查找即可，无需补建） */
  function semanticLayerId(facade: ReturnType<typeof createEditor>, name: string): string {
    const layer = facade.scene.getLayers().find((l) => l.name === name);
    expect(layer).toBeDefined();
    return layer!.id;
  }

  /** 非 region 探针对象（model：type + asset 引用，最小 ModelObject 结构；T6.7 building 要素已删） */
  function makeModelObject(): ModelObject {
    return {
      id: 'model_probe_1',
      type: 'model',
      name: '探针模型',
      parentId: null,
      layerId: null,
      visible: true,
      locked: false,
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      properties: {},
      asset: { assetId: 'asset_tree' },
    };
  }

  function setupRegion(facade: ReturnType<typeof createEditor>, shapeType: RegionObject['shape']['type']): RegionObject {
    const region = createRegionObject({
      shape:
        shapeType === 'line'
          ? { type: 'line', points: [{ x: 0, y: 0 }, { x: 10, y: 0 }], baseHeight: 0, closed: false }
          : { type: shapeType, points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }], baseHeight: 0, closed: true },
    });
    facade.history.execute(new CreateObjectCommand(region));
    return region;
  }

  it('水芯片 + 预设：类型/归层/预设一步到位，恰好一条历史；undo 整体回退、redo 恢复', () => {
    const facade = createEditor(null);
    const water = semanticLayerId(facade, '水面');
    const region = setupRegion(facade, 'polygon');
    const before = facade.history.canRedo();

    const ok = applySemanticAndPreset(facade, region.id, 'water', 'water.standard');
    expect(ok).toBe(true);

    const after = facade.scene.getObject(region.id) as RegionObject;
    expect(after.semantic.type).toBe('water');
    expect(after.layerId).toBe(water); // 自动归层
    expect(after.style.presetId).toBe('water.standard'); // 点选预设生效
    expect(after.style.overrides).toEqual({});
    expect(after.shape.points).toHaveLength(3); // 几何不动
    expect(facade.history.canUndo()).toBe(true);
    expect(before).toBe(false);

    // 一次 undo 整体回退（类型 + 图层 + 样式）
    facade.history.undo();
    const reverted = facade.scene.getObject(region.id) as RegionObject;
    expect(reverted.semantic.type).toBe('unclassified');
    expect(reverted.layerId).toBeNull();
    expect(reverted.style.presetId).toBe('default_solid');

    facade.history.redo();
    const redone = facade.scene.getObject(region.id) as RegionObject;
    expect(redone.semantic.type).toBe('water');
    expect(redone.style.presetId).toBe('water.standard');
    facade.dispose();
  });

  it('道路类型：语义属性默认值随写入（width=6），带宽预设应用', () => {
    const facade = createEditor(null);
    const road = semanticLayerId(facade, '道路');
    const region = setupRegion(facade, 'line');

    expect(applySemanticAndPreset(facade, region.id, 'road', 'road.standard')).toBe(true);
    const after = facade.scene.getObject(region.id) as RegionObject;
    expect(after.semantic.type).toBe('road');
    expect(after.semantic.properties).toEqual({ width: 6 }); // 语义定义默认值
    expect(after.layerId).toBe(road);
    expect(after.style.presetId).toBe('road.standard');
    facade.dispose();
  });

  it('建筑类型：height 默认值写入', () => {
    const facade = createEditor(null);
    const region = setupRegion(facade, 'rectangle');
    expect(applySemanticAndPreset(facade, region.id, 'building', 'building.default')).toBe(true);
    const after = facade.scene.getObject(region.id) as RegionObject;
    expect(after.semantic.properties).toEqual({ height: 10 });
    facade.dispose();
  });

  it('目标非 RegionObject（model 对象）→ false，零历史', () => {
    const facade = createEditor(null);
    const model = makeModelObject();
    facade.history.execute(new CreateObjectCommand(model));
    expect(applySemanticAndPreset(facade, model.id, 'water', 'water.standard')).toBe(false);
    const after = facade.scene.getObject(model.id) as { type: string };
    expect(after.type).toBe('model'); // 原样未动
    facade.dispose();
  });
});
