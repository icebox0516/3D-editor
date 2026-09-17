/**
 * tests/ui/panels/hierarchyModel.test.ts —— Outliner 层级树模型纯函数测试（T8.5 §3，先测后码）。
 *
 * 覆盖：
 * - buildHierarchyRows：前序平铺（depth/childCount/isGroup/hasChildren），折叠集过滤
 *   （折叠组隐藏整棵子树）；
 * - resolveDropZone：行上/下半区 = before/after 插入线；行体中段 = into（仅组行；
 *   非组行中段按上下半归并）；容器根区 = root；
 * - evaluateDrop：合法挂入/排序/上提；拖到自身/自身后代（环）/挂入非组 → invalid（含 reason）；
 * - buildReparentCommand：三态落点 → ReparentCommand 载荷（into/before/after/root）；
 * - selectGroupMemberIds：组内全部后代成员（不含任何组壳，仅选成员不选壳）；
 * - 展开态：缺省全展开、toggle、拖拽 hover 展开（800ms 计时归组件，纯函数只管集合运算）。
 * 边界：node 纯逻辑，零 React / 零 THREE。
 */
import { describe, expect, it } from 'vitest';
import type { SceneObject } from '../../../src/scene/SceneObject';
import { GROUP_OBJECT_TYPE } from '../../../src/scene/GroupObject';
import {
  buildHierarchyRows,
  buildReparentCommand,
  evaluateDrop,
  isNodeExpanded,
  selectGroupMemberIds,
  toggleNodeExpanded,
  ungroupableIds,
} from '../../../src/ui/panels/hierarchyModel';
import { ReparentCommand } from '../../../src/editor/commands/ReparentCommand';

function obj(id: string, parentId: string | null, type = 'region'): SceneObject {
  return {
    id,
    type,
    name: id,
    parentId,
    layerId: null,
    visible: true,
    locked: false,
    transform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
  };
}

function group(id: string, parentId: string | null): SceneObject {
  return obj(id, parentId, GROUP_OBJECT_TYPE);
}

/** 嵌套两层样例：g1 ⊃ { a, g2 ⊃ { b } }，root 顶层对象 */
function nested(): SceneObject[] {
  return [group('g1', null), obj('a', 'g1'), group('g2', 'g1'), obj('b', 'g2'), obj('root', null)];
}

describe('hierarchyModel：buildHierarchyRows（树派生 + 折叠）', () => {
  it('前序平铺：depth / childCount（直接成员数） / isGroup 正确', () => {
    const rows = buildHierarchyRows(nested(), new Set());
    expect(rows.map((r) => [r.obj.id, r.depth, r.childCount])).toEqual([
      ['g1', 0, 2],
      ['a', 1, 0],
      ['g2', 1, 1],
      ['b', 2, 0],
      ['root', 0, 0],
    ]);
    expect(rows[0]!.isGroup).toBe(true);
    expect(rows[1]!.isGroup).toBe(false);
  });

  it('折叠集：折叠组隐藏整棵子树；缺省全展开', () => {
    expect(buildHierarchyRows(nested(), new Set()).map((r) => r.obj.id)).toEqual([
      'g1',
      'a',
      'g2',
      'b',
      'root',
    ]);
    // 折叠 g1 → g1 整棵子树（含嵌套 g2/b）隐藏
    expect(buildHierarchyRows(nested(), new Set(['g1'])).map((r) => r.obj.id)).toEqual(['g1', 'root']);
    // 折叠 g2（g1 展开）→ 仅隐藏 b
    expect(buildHierarchyRows(nested(), new Set(['g2'])).map((r) => r.obj.id)).toEqual([
      'g1',
      'a',
      'g2',
      'root',
    ]);
  });

  it('展开态集合运算：toggle 翻位、isNodeExpanded 缺省展开', () => {
    expect(isNodeExpanded(new Set(), 'g1')).toBe(true);
    const next = toggleNodeExpanded(new Set(), 'g1');
    expect(isNodeExpanded(next, 'g1')).toBe(false);
    expect(isNodeExpanded(toggleNodeExpanded(next, 'g1'), 'g1')).toBe(true);
  });
});

describe('hierarchyModel：resolveDropZone（行内分区计算）', () => {
  it('组行：上四分位 before / 中段 into / 下四分位 after', async () => {
    const { resolveDropZone } = await import('../../../src/ui/panels/hierarchyModel');
    const rowH = 26;
    expect(resolveDropZone(3, rowH, true)).toBe('before');
    expect(resolveDropZone(13, rowH, true)).toBe('into');
    expect(resolveDropZone(23, rowH, true)).toBe('after');
  });

  it('非组行：无 into 态（上半 before / 下半 after）', async () => {
    const { resolveDropZone } = await import('../../../src/ui/panels/hierarchyModel');
    expect(resolveDropZone(5, 26, false)).toBe('before');
    expect(resolveDropZone(20, 26, false)).toBe('after');
  });
});

describe('hierarchyModel：evaluateDrop（环拒绝等非法落点）', () => {
  const objects = nested();

  it('合法：挂入组 / 非组行排序 / 根区上提', () => {
    expect(evaluateDrop(objects, 'root', { zone: 'into', targetId: 'g1' })).toEqual({
      valid: true,
    });
    expect(evaluateDrop(objects, 'b', { zone: 'before', targetId: 'a' })).toEqual({ valid: true });
    expect(evaluateDrop(objects, 'b', { zone: 'after', targetId: 'root' })).toEqual({ valid: true });
    expect(evaluateDrop(objects, 'g2', { zone: 'root', targetId: null })).toEqual({ valid: true });
  });

  it('非法：拖到自身 / 挂入自身后代（环） / 挂入非组行 / 锚点在自身子树内', () => {
    expect(evaluateDrop(objects, 'g1', { zone: 'into', targetId: 'g1' }).reason).toBe('self');
    expect(evaluateDrop(objects, 'g1', { zone: 'into', targetId: 'g2' }).reason).toBe('cycle');
    expect(evaluateDrop(objects, 'g1', { zone: 'into', targetId: 'b' }).reason).toBe('cycle');
    expect(evaluateDrop(objects, 'root', { zone: 'into', targetId: 'a' }).reason).toBe(
      'into-non-group',
    );
    expect(evaluateDrop(objects, 'g1', { zone: 'before', targetId: 'b' }).reason).toBe('cycle');
    expect(evaluateDrop(objects, 'g1', { zone: 'into', targetId: 'g1' }).valid).toBe(false);
  });

  it('合法自挂自序：拖到非自身行的 before/after 且同层 → 合法（排序）', () => {
    expect(evaluateDrop(objects, 'a', { zone: 'before', targetId: 'g2' }).valid).toBe(true);
  });
});

describe('hierarchyModel：buildReparentCommand（落点 → 命令载荷）', () => {
  it('into → parentId 目标组；root → parentId null；before/after → 锚点', () => {
    const objects = nested();
    const into = buildReparentCommand(objects, 'root', { zone: 'into', targetId: 'g1' });
    expect(into).toBeInstanceOf(ReparentCommand);
    const root = buildReparentCommand(objects, 'b', { zone: 'root', targetId: null });
    expect(root).toBeInstanceOf(ReparentCommand);
    const before = buildReparentCommand(objects, 'b', { zone: 'before', targetId: 'a' });
    expect(before).toBeInstanceOf(ReparentCommand);
    const after = buildReparentCommand(objects, 'b', { zone: 'after', targetId: 'a' });
    expect(after).toBeInstanceOf(ReparentCommand);
    // 非法落点 → null（不产生命令）
    expect(buildReparentCommand(objects, 'g1', { zone: 'into', targetId: 'g2' })).toBeNull();
  });
});

describe('hierarchyModel：组行选择成员 / 解散清单（T8.5）', () => {
  it('selectGroupMemberIds：组内全部后代成员（不含任何组壳，含深层成员）', () => {
    const objects = nested();
    expect(selectGroupMemberIds(objects, 'g1')).toEqual(['a', 'b']); // 不含 g2（壳）
    expect(selectGroupMemberIds(objects, 'g2')).toEqual(['b']);
  });

  it('ungroupableIds：选中集中全部组壳 id（解散组作用域）', () => {
    const objects = nested();
    expect(ungroupableIds(objects, ['g1', 'a', 'g2'])).toEqual(['g1', 'g2']);
    expect(ungroupableIds(objects, ['a', 'b'])).toEqual([]);
  });
});
