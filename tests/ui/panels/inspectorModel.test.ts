/**
 * tests/ui/panels/inspectorModel.test.ts —— Inspector 分组模型纯函数测试
 * （T5.4 先测后码；T6.7 重写：region 四分组分派 + 通用组，旧要素五分组断言已删）。
 *
 * 覆盖（vitest node 环境不渲染组件壳，沿 tests/ui 既有纯逻辑形态；GUI 效果留浏览器验收）：
 * - sectionsFor 分组分派：RegionObject（结构判别 isRegionObject）→ 四分组 + 变换组
 *   （分组细节断言归 regionInspectorModel.test）；model 对象 → 通用组
 *   Transform/Metadata/Advanced，Metadata 组携带资产引用只读字段（asset-ref，
 *   T6.7 回归恢复）；普通对象（非 region、无资产引用）→ 通用组无字段；
 * - describeSelection 多选汇总（N 个对象 · 类型分布，label 可注入覆盖 + 兜底表）；
 * - inspectorMode 三态（空 / 单选 / 多选）与 INSPECTOR_EMPTY 空态文案；
 * - inspectorSectionKey 折叠分组键（workspaceStore.collapsedSections 记账键约定）。
 */
import { describe, expect, it } from 'vitest';
import { createId } from '../../../src/core/id';
import type { SceneObject } from '../../../src/scene/SceneObject';
import { createRegionObject } from '../../../src/domain/regions';
import {
  INSPECTOR_EMPTY,
  describeSelection,
  inspectorMode,
  inspectorSectionKey,
  sectionsFor,
} from '../../../src/ui/panels/inspectorModel';

/** 构造最小 SceneObject 探针（默认可见/未锁/未分层/空属性） */
function makeObject(overrides: Partial<SceneObject> = {}): SceneObject {
  return {
    id: createId('element'),
    type: 'zone',
    name: '对象',
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
    ...overrides,
  };
}

/** region 探针（未分类三角形面；结构判别 isRegionObject） */
function regionObject(name = '区域 1'): SceneObject {
  return createRegionObject({
    shape: {
      type: 'polygon',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      baseHeight: 0,
      closed: true,
    },
    name,
  });
}

/** 模型对象（type 'model' + asset 引用；结构判别 assetIdOf） */
function modelObject(assetId = 'asset_tree_01'): SceneObject {
  return {
    ...makeObject({ type: 'model' }),
    asset: { assetId },
  } as unknown as SceneObject;
}

describe('sectionsFor 分组分派', () => {
  it('region 对象 → 四分组（基础信息/几何/业务类型/表现样式）+ 变换组', () => {
    const sections = sectionsFor(regionObject());
    expect(sections.map((s) => s.id)).toEqual([
      'region-basic',
      'region-geometry',
      'region-semantic',
      'region-style',
      'transform',
    ]);
    expect(sections.find((s) => s.id === 'transform')!.hint).toBe('m · deg');
  });

  it('模型对象：通用组 Transform/Metadata/Advanced，Metadata 组携带资产引用只读字段（asset-ref）', () => {
    const sections = sectionsFor(modelObject());
    expect(sections.map((s) => s.id)).toEqual(['transform', 'metadata', 'advanced']);
    const metadata = sections.find((s) => s.id === 'metadata')!;
    expect(metadata.fields).toHaveLength(1);
    expect(metadata.fields![0]).toMatchObject({
      kind: 'asset-ref',
      key: 'asset',
      label: '资产',
      assetId: 'asset_tree_01',
    });
  });

  it('普通对象（非 region、无资产引用）：通用组无字段（数据真相：不出现虚构参数）', () => {
    const sections = sectionsFor(makeObject({ type: 'zone' }));
    expect(sections.map((s) => s.id)).toEqual(['transform', 'metadata', 'advanced']);
    expect(sections.find((s) => s.id === 'metadata')!.fields).toBeUndefined();
  });
});

describe('describeSelection 多选汇总', () => {
  it('N 个对象 + 类型分布（首次出现序；兜底表 model→模型、region→区域、未知回退 type 串）', () => {
    const objects = [
      regionObject('R1'),
      modelObject(),
      regionObject('R2'),
      makeObject({ type: 'zone' }),
    ];
    const summary = describeSelection(objects);
    expect(summary.count).toBe(4);
    expect(summary.distribution).toEqual([
      { type: 'region', label: '区域', count: 2 },
      { type: 'model', label: '模型', count: 1 },
      { type: 'zone', label: 'zone', count: 1 },
    ]);
    const overridden = describeSelection(objects, { typeLabels: { region: '地块' } });
    expect(overridden.distribution[0]).toMatchObject({ label: '地块' });
  });

  it('空选择 → count 0、分布空', () => {
    expect(describeSelection([])).toEqual({ count: 0, distribution: [] });
  });
});

describe('三态与空态文案', () => {
  it('inspectorMode：空 → empty，单 → single，多 → multi', () => {
    expect(inspectorMode([])).toBe('empty');
    expect(inspectorMode(['region_1'])).toBe('single');
    expect(inspectorMode(['region_1', 'model_2'])).toBe('multi');
  });

  it('空态文案纯净：仅选择引导，无系统设置混入', () => {
    expect(INSPECTOR_EMPTY.title).toBe('暂无选中对象');
    expect(INSPECTOR_EMPTY.hint).toBe('请在场景中选择一个对象');
  });
});

describe('折叠分组键（workspaceStore.collapsedSections 记账约定）', () => {
  it('分组键 = inspector.<sectionId>，与面板分区键（区域.面板）命名空间隔离', () => {
    expect(inspectorSectionKey('transform')).toBe('inspector.transform');
    expect(inspectorSectionKey('metadata')).toBe('inspector.metadata');
    expect(inspectorSectionKey('advanced')).toBe('inspector.advanced');
    expect(inspectorSectionKey('region-basic')).toBe('inspector.region-basic');
    // 不与 PanelFrame 分区键（left.scene / right.inspector）冲突
    expect(new Set(['inspector.transform', 'right.inspector']).size).toBe(2);
  });
});
