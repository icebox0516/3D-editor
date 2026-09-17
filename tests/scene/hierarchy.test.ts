/**
 * tests/scene/hierarchy.test.ts —— parentId 层级派生纯函数测试（T8.5 §1，先测后码）。
 *
 * 覆盖：
 * - childrenIndexOf：按 parentId 建索引、同父兄弟序 = 数组序；
 * - isAncestorOf / descendantsOf：祖先链判定（环检测的数据基础）；
 * - buildHierarchyForest / flattenHierarchy：前序平铺（根 = parentId null 或悬空引用），
 *   深度正确；孤儿（parentId 指向不存在对象）按根处理不崩；
 * - SceneManager.reorderObjects：给定 id 全序重排（未知 id 忽略、遗漏 id 追加保序），
 *   顺序无变化时不发 scene:changed。
 * 边界：node 纯逻辑，零 React / 零 THREE。
 */
import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { SceneManager } from '../../src/scene/SceneManager';
import {
  buildHierarchyForest,
  childrenIndexOf,
  descendantsOf,
  flattenHierarchy,
  isAncestorOf,
} from '../../src/scene/hierarchy';

/** id 直填的最小对象（hierarchy 纯函数只关心 id/parentId/type） */
import type { SceneObject } from '../../src/scene/SceneObject';

function obj(id: string, parentId: string | null): SceneObject {
  return {
    id,
    type: 'region',
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

describe('hierarchy：childrenIndexOf / 后代 / 祖先（T8.5）', () => {
  it('childrenIndexOf：按 parentId 分桶，桶内序 = 数组序', () => {
    const g1 = obj('group_1', null);
    const a = obj('a', 'group_1');
    const b = obj('b', 'group_1');
    const g2 = obj('group_2', 'group_1');
    const c = obj('c', 'group_2');
    const root = obj('r', null);
    const index = childrenIndexOf([g1, a, b, g2, c, root]);
    expect(index.get('group_1')!.map((o) => o.id)).toEqual(['a', 'b', 'group_2']);
    expect(index.get('group_2')!.map((o) => o.id)).toEqual(['c']);
    expect(index.get(null)!.map((o) => o.id)).toEqual(['group_1', 'r']);
  });

  it('descendantsOf / isAncestorOf：嵌套后代全收集，祖先判定含跨层', () => {
    const g1 = obj('group_1', null);
    const a = obj('a', 'group_1');
    const g2 = obj('group_2', 'group_1');
    const c = obj('c', 'group_2');
    const objects = [g1, a, g2, c];
    expect([...descendantsOf(objects, 'group_1')].sort()).toEqual(['a', 'c', 'group_2']);
    expect(isAncestorOf(objects, 'group_1', 'c')).toBe(true); // 跨层祖先
    expect(isAncestorOf(objects, 'group_2', 'c')).toBe(true);
    expect(isAncestorOf(objects, 'c', 'group_1')).toBe(false); // 反向不是
    expect(isAncestorOf(objects, 'group_1', 'group_1')).toBe(false); // 自身不是祖先
  });

  it('环状数据防御：follow parentId 不死循环（descendants 仍可返回）', () => {
    const x = obj('x', 'y');
    const y = obj('y', 'x');
    expect(() => descendantsOf([x, y], 'x')).not.toThrow();
  });
});

describe('hierarchy：森林构建与前序平铺（T8.5）', () => {
  it('前序平铺：根序 = 数组序，子节点缩进深度正确', () => {
    const g1 = obj('group_1', null);
    const a = obj('a', 'group_1');
    const g2 = obj('group_2', 'group_1');
    const c = obj('c', 'group_2');
    const root = obj('r', null);
    const rows = flattenHierarchy(buildHierarchyForest([g1, a, g2, c, root]));
    expect(rows.map((row) => [row.obj.id, row.depth])).toEqual([
      ['group_1', 0],
      ['a', 1],
      ['group_2', 1],
      ['c', 2],
      ['r', 0],
    ]);
  });

  it('孤儿（parentId 指向不存在对象）按根级处理，不崩不错序', () => {
    const a = obj('a', 'missing_parent');
    const b = obj('b', null);
    const rows = flattenHierarchy(buildHierarchyForest([a, b]));
    expect(rows.map((row) => row.obj.id)).toEqual(['a', 'b']);
    expect(rows[0]!.depth).toBe(0);
  });
});

describe('SceneManager.reorderObjects（T8.5 同层排序语义）', () => {
  it('按给定全序重排 getObjects；未知 id 忽略、遗漏 id 追加尾部保原序', () => {
    const bus = new EventBus();
    const scene = new SceneManager(bus);
    const a = obj('a', null);
    const b = obj('b', null);
    const c = obj('c', null);
    scene.addObject(a);
    scene.addObject(b);
    scene.addObject(c);

    scene.reorderObjects(['c', 'a', 'b']);
    expect(scene.getObjects().map((o) => o.id)).toEqual(['c', 'a', 'b']);

    scene.reorderObjects(['b', 'ghost_zzz', 'c']); // a 遗漏 → 追加；未知忽略
    expect(scene.getObjects().map((o) => o.id)).toEqual(['b', 'c', 'a']);
  });

  it('顺序无变化时不发 scene:changed（幂等静默）', () => {
    const bus = new EventBus();
    const scene = new SceneManager(bus);
    const a = obj('a', null);
    const b = obj('b', null);
    scene.addObject(a);
    scene.addObject(b);

    const spy = vi.fn();
    bus.on('scene:changed', spy);
    scene.reorderObjects(['a', 'b']);
    expect(spy).not.toHaveBeenCalled();

    scene.reorderObjects(['b', 'a']);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]![0]).toEqual({ source: 'reorderObjects' });
  });
});
