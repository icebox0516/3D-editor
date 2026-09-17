/**
 * tests/editor/commands/groupCommands.test.ts —— 分组/解散/换父命令测试（T8.5 §2，先测后码）。
 *
 * 覆盖（任务书硬性要求）：
 * - GroupCommand：选中对象收编为新组子级；单条历史；undo/redo 完整复原（含数组顺序）；
 *   成员 transform 世界语义零变化（组壳恒等变换断言）；
 * - UngroupCommand：解散 = 成员上提父级（不删成员）；单条历史；undo/redo 复原（含顺序）；
 *   嵌套组解散（孙组上提后仍为组）；
 * - ReparentCommand：挂入组 / 同层插入排序 / 上提根级三种落点；环检测拒绝（挂到自身
 *   或后代 = execute false 零副作用）；无变化 no-op（不入历史）；undo/redo 复原（含顺序）；
 * - 删除组（DeleteObjectCommand 组感知）：仅删组节点、成员上提父级，成员世界 transform
 *   零变化断言；undo 复原含成员 parentId 与数组顺序。
 * 边界：node 纯逻辑；零 React / 零 THREE。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { EventBus } from '../../../src/core/events/EventBus';
import { SceneManager } from '../../../src/scene/SceneManager';
import { SelectionManager } from '../../../src/scene/SelectionManager';
import type { SceneObject } from '../../../src/scene/SceneObject';
import type { CommandContext } from '../../../src/editor/commands/CommandContext';
import { HistoryManager } from '../../../src/editor/history/HistoryManager';
import { GroupCommand } from '../../../src/editor/commands/GroupCommand';
import { UngroupCommand } from '../../../src/editor/commands/UngroupCommand';
import { ReparentCommand } from '../../../src/editor/commands/ReparentCommand';
import { DeleteObjectCommand } from '../../../src/editor/commands/DeleteObjectCommand';
import { GROUP_OBJECT_TYPE } from '../../../src/scene/GroupObject';

function obj(id: string, parentId: string | null, x = 0): SceneObject {
  return {
    id,
    type: 'region',
    name: id,
    parentId,
    layerId: null,
    visible: true,
    locked: false,
    transform: {
      position: { x, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
  };
}

function group(id: string, parentId: string | null): SceneObject {
  return { ...obj(id, parentId), type: GROUP_OBJECT_TYPE };
}

function setup() {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const ctx: CommandContext = { sceneManager, selection, eventBus };
  const history = new HistoryManager(ctx);
  return { ctx, eventBus, sceneManager, selection, history };
}

const orderOf = (scene: SceneManager): string[] => scene.getObjects().map((o) => o.id);

/** 成员世界变换快照（position/rotation/scale 逐分量；「挂组不改世界变换」断言基准） */
function worldTransforms(scene: SceneManager): Record<string, SceneObject['transform']> {
  const out: Record<string, SceneObject['transform']> = {};
  for (const o of scene.getObjects()) out[o.id] = o.transform;
  return out;
}

describe('GroupCommand（建组，T8.5）', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('选中对象收编为新组子级：单条历史，组壳恒等变换，成员 transform 零变化', () => {
    const a = obj('a', null, 1);
    const b = obj('b', null, 2);
    fx.sceneManager.addObject(a);
    fx.sceneManager.addObject(b);
    const beforeTransforms = worldTransforms(fx.sceneManager);

    expect(fx.history.execute(new GroupCommand(['a', 'b'], '测试组'))).toBe(true);

    const objects = fx.sceneManager.getObjects();
    const g = objects.find((o) => o.type === GROUP_OBJECT_TYPE)!;
    expect(g).toBeDefined();
    expect(g.name).toBe('测试组');
    expect(g.parentId).toBeNull();
    expect(g.transform).toEqual({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    }); // 组壳恒等
    expect(fx.sceneManager.getObject('a')!.parentId).toBe(g.id);
    expect(fx.sceneManager.getObject('b')!.parentId).toBe(g.id);
    // 成员世界变换零变化（组不传递变换）
    expect(worldTransforms(fx.sceneManager).a).toEqual(beforeTransforms.a);
    expect(worldTransforms(fx.sceneManager).b).toEqual(beforeTransforms.b);
    expect(fx.history.canUndo()).toBe(true);

    let depth = 0;
    while (fx.history.undo()) depth += 1;
    expect(depth).toBe(1); // 单条历史
  });

  it('undo/redo 完整复原（含数组顺序）', () => {
    const a = obj('a', null);
    const b = obj('b', null);
    fx.sceneManager.addObject(a);
    fx.sceneManager.addObject(b);
    const beforeOrder = orderOf(fx.sceneManager);

    const cmd = new GroupCommand(['a', 'b']);
    fx.history.execute(cmd);
    const groupId = fx.sceneManager
      .getObjects()
      .find((o) => o.type === GROUP_OBJECT_TYPE)!.id;
    const afterOrder = orderOf(fx.sceneManager);
    expect(afterOrder).not.toEqual(beforeOrder);

    expect(fx.history.undo()).toBe(true);
    expect(orderOf(fx.sceneManager)).toEqual(beforeOrder); // 顺序复原
    expect(fx.sceneManager.getObject('a')!.parentId).toBeNull();
    expect(fx.sceneManager.getObject('b')!.parentId).toBeNull();
    expect(fx.sceneManager.getObjects().some((o) => o.type === GROUP_OBJECT_TYPE)).toBe(false);

    expect(fx.history.redo()).toBe(true);
    expect(orderOf(fx.sceneManager)).toEqual(afterOrder); // 顺序复原（redo）
    expect(fx.sceneManager.getObject('a')!.parentId).toBe(groupId);
    expect(fx.sceneManager.getObject(groupId)).toBeDefined();
  });

  it('成员来自不同父级 → 新组落根级；成员同父 → 组落该父级', () => {
    const g0 = group('g0', null);
    const a = obj('a', null);
    const b = obj('b', 'g0');
    for (const o of [g0, a, b]) fx.sceneManager.addObject(o);

    fx.history.execute(new GroupCommand(['a', 'b']));
    const g1 = fx.sceneManager.getObjects().find((o) => o.type === GROUP_OBJECT_TYPE && o.id !== 'g0')!;
    expect(g1.parentId).toBeNull(); // 混父 → 根级

    fx.history.undo();
    const c = obj('c', 'g0');
    fx.sceneManager.addObject(c);
    fx.history.execute(new GroupCommand(['b', 'c']));
    const g2 = fx.sceneManager.getObjects().find((o) => o.type === GROUP_OBJECT_TYPE && o.id !== 'g0')!;
    expect(g2.parentId).toBe('g0'); // 同父 → 落父级
    expect(fx.sceneManager.getObject('b')!.parentId).toBe(g2.id);
  });

  it('组可嵌套：对组与对象混合建组', () => {
    const ga = group('ga', null);
    const b = obj('b', null);
    fx.sceneManager.addObject(ga);
    fx.sceneManager.addObject(b);
    fx.history.execute(new GroupCommand(['ga', 'b']));
    const outer = fx.sceneManager
      .getObjects()
      .find((o) => o.type === GROUP_OBJECT_TYPE && o.id !== 'ga')!;
    expect(fx.sceneManager.getObject('ga')!.parentId).toBe(outer.id);
    expect(fx.sceneManager.getObject('b')!.parentId).toBe(outer.id);
  });

  it('空成员 / 成员全部不存在 → canExecute false 或 execute false 零副作用', () => {
    expect(new GroupCommand([]).canExecute()).toBe(false);
    const a = obj('a', null);
    fx.sceneManager.addObject(a);
    expect(fx.history.execute(new GroupCommand(['ghost_1']))).toBe(false);
    expect(fx.history.canUndo()).toBe(false);
    expect(orderOf(fx.sceneManager)).toEqual(['a']);
  });
});

describe('UngroupCommand（解散，T8.5）', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('解散 = 成员上提父级（不删成员），单条历史，undo/redo 复原（含顺序）', () => {
    const outer = group('outer', null);
    const inner = group('inner', 'outer');
    const a = obj('a', 'inner');
    const b = obj('b', 'inner');
    for (const o of [outer, inner, a, b]) fx.sceneManager.addObject(o);
    const beforeOrder = orderOf(fx.sceneManager);

    expect(fx.history.execute(new UngroupCommand(['inner']))).toBe(true);

    // inner 删除，成员上提到 outer（组父级），成员保留
    expect(fx.sceneManager.getObject('inner')).toBeUndefined();
    expect(fx.sceneManager.getObject('a')!.parentId).toBe('outer');
    expect(fx.sceneManager.getObject('b')!.parentId).toBe('outer');
    expect(fx.sceneManager.getObject('a')).toBeDefined();
    expect(fx.sceneManager.getObject('b')).toBeDefined();
    const afterOrder = orderOf(fx.sceneManager);

    let depth = 0;
    while (fx.history.undo()) depth += 1;
    expect(depth).toBe(1); // 单条历史
    expect(orderOf(fx.sceneManager)).toEqual(beforeOrder); // 顺序复原
    expect(fx.sceneManager.getObject('inner')).toBeDefined();
    expect(fx.sceneManager.getObject('a')!.parentId).toBe('inner');

    expect(fx.history.redo()).toBe(true);
    expect(orderOf(fx.sceneManager)).toEqual(afterOrder);
    expect(fx.sceneManager.getObject('a')!.parentId).toBe('outer');
  });

  it('解散根级组：成员上提到根（parentId null）', () => {
    const g = group('g', null);
    const a = obj('a', 'g');
    for (const o of [g, a]) fx.sceneManager.addObject(o);
    fx.history.execute(new UngroupCommand(['g']));
    expect(fx.sceneManager.getObject('a')!.parentId).toBeNull();
    expect(fx.sceneManager.getObject('g')).toBeUndefined();
  });

  it('空组解散 = 仅删节点；批量解散多组一条历史', () => {
    const g1 = group('g1', null);
    const g2 = group('g2', null);
    fx.sceneManager.addObject(g1);
    fx.sceneManager.addObject(g2);
    expect(fx.history.execute(new UngroupCommand(['g1', 'g2']))).toBe(true);
    expect(fx.sceneManager.getObjects()).toHaveLength(0);

    let depth = 0;
    while (fx.history.undo()) depth += 1;
    expect(depth).toBe(1); // 多组并一条历史
    expect(orderOf(fx.sceneManager)).toEqual(['g1', 'g2']);
  });

  it('非组对象传入 → 跳过（不解散普通对象）', () => {
    const a = obj('a', null);
    fx.sceneManager.addObject(a);
    expect(fx.history.execute(new UngroupCommand(['a']))).toBe(false);
    expect(fx.sceneManager.getObject('a')).toBeDefined();
    expect(fx.history.canUndo()).toBe(false);
  });
});

describe('ReparentCommand（拖拽换父/排序/上提，T8.5）', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('挂入组：落为该组子级（append 至组子级末尾），undo/redo 复原（含顺序）', () => {
    const g = group('g', null);
    const a = obj('a', 'g');
    const b = obj('b', null);
    for (const o of [g, a, b]) fx.sceneManager.addObject(o);
    const beforeOrder = orderOf(fx.sceneManager);

    expect(fx.history.execute(new ReparentCommand('b', { kind: 'into', parentId: 'g' }))).toBe(true);
    expect(fx.sceneManager.getObject('b')!.parentId).toBe('g');
    // b 落到 g 子级末尾：数组中 g 子树之后
    expect(orderOf(fx.sceneManager).indexOf('b')).toBeGreaterThan(orderOf(fx.sceneManager).indexOf('a'));
    const afterOrder = orderOf(fx.sceneManager);

    expect(fx.history.undo()).toBe(true);
    expect(orderOf(fx.sceneManager)).toEqual(beforeOrder);
    expect(fx.sceneManager.getObject('b')!.parentId).toBeNull();

    expect(fx.history.redo()).toBe(true);
    expect(orderOf(fx.sceneManager)).toEqual(afterOrder);
    expect(fx.sceneManager.getObject('b')!.parentId).toBe('g');
  });

  it('同层插入排序：before/after 锚点，仅数组顺序变化（parentId 不变）', () => {
    const a = obj('a', null);
    const b = obj('b', null);
    const c = obj('c', null);
    for (const o of [a, b, c]) fx.sceneManager.addObject(o);
    expect(orderOf(fx.sceneManager)).toEqual(['a', 'b', 'c']);

    // 把 c 移到 a 之前
    expect(fx.history.execute(new ReparentCommand('c', { kind: 'before', anchorId: 'a' }))).toBe(true);
    expect(orderOf(fx.sceneManager)).toEqual(['c', 'a', 'b']);
    expect(fx.sceneManager.getObject('c')!.parentId).toBeNull();

    // undo 复原顺序
    expect(fx.history.undo()).toBe(true);
    expect(orderOf(fx.sceneManager)).toEqual(['a', 'b', 'c']);
    expect(fx.history.redo()).toBe(true);
    expect(orderOf(fx.sceneManager)).toEqual(['c', 'a', 'b']);

    // after：a 移到 c 之后——已在位 → no-op 不入历史
    expect(fx.history.execute(new ReparentCommand('a', { kind: 'after', anchorId: 'c' }))).toBe(false);
    expect(orderOf(fx.sceneManager)).toEqual(['c', 'a', 'b']);
    // b 移到 c 之后 → [c, b, a]
    expect(fx.history.execute(new ReparentCommand('b', { kind: 'after', anchorId: 'c' }))).toBe(true);
    expect(orderOf(fx.sceneManager)).toEqual(['c', 'b', 'a']);
    expect(fx.history.canUndo()).toBe(true);
  });

  it('after 锚点带子树：插到锚点整棵子树之后；已在位再执行 = no-op', () => {
    const x = obj('x', null);
    const g = group('g', null);
    const child = obj('child', 'g');
    for (const o of [x, g, child]) fx.sceneManager.addObject(o);
    expect(orderOf(fx.sceneManager)).toEqual(['x', 'g', 'child']);

    // x 移到 g 之后（应落 g 子树之后而非 g 与 child 之间）
    expect(fx.history.execute(new ReparentCommand('x', { kind: 'after', anchorId: 'g' }))).toBe(true);
    expect(orderOf(fx.sceneManager)).toEqual(['g', 'child', 'x']);
    // 已在子树后 → 无变化 no-op 不入历史
    expect(fx.history.execute(new ReparentCommand('x', { kind: 'after', anchorId: 'g' }))).toBe(false);

    const y = obj('y', null);
    fx.sceneManager.addObject(y); // [g, child, x, y]
    // 把 y 移到 x 之前 → [g, child, y, x]
    expect(fx.history.execute(new ReparentCommand('y', { kind: 'before', anchorId: 'x' }))).toBe(true);
    expect(orderOf(fx.sceneManager)).toEqual(['g', 'child', 'y', 'x']);
  });

  it('上提根级：into parentId=null 落根级末尾', () => {
    const g = group('g', null);
    const a = obj('a', 'g');
    for (const o of [g, a]) fx.sceneManager.addObject(o);
    expect(fx.history.execute(new ReparentCommand('a', { kind: 'into', parentId: null }))).toBe(true);
    expect(fx.sceneManager.getObject('a')!.parentId).toBeNull();
    expect(orderOf(fx.sceneManager)).toEqual(['g', 'a']); // 根级末尾
  });

  it('环检测：挂到自身 / 挂到自己的后代 → execute false 零副作用', () => {
    const g1 = group('g1', null);
    const g2 = group('g2', 'g1');
    const a = obj('a', 'g2');
    for (const o of [g1, g2, a]) fx.sceneManager.addObject(o);
    const before = orderOf(fx.sceneManager);

    expect(fx.history.execute(new ReparentCommand('g1', { kind: 'into', parentId: 'g1' }))).toBe(false); // 自身
    expect(fx.history.execute(new ReparentCommand('g1', { kind: 'into', parentId: 'g2' }))).toBe(false); // 直接后代
    expect(fx.history.execute(new ReparentCommand('g1', { kind: 'into', parentId: 'a' }))).toBe(false); // 跨层后代
    // 锚点在自己的子树内（排序落点成环）
    expect(fx.history.execute(new ReparentCommand('g1', { kind: 'before', anchorId: 'a' }))).toBe(false);
    expect(fx.history.canUndo()).toBe(false);
    expect(orderOf(fx.sceneManager)).toEqual(before);
    expect(fx.sceneManager.getObject('g2')!.parentId).toBe('g1');
  });

  it('无变化 no-op（同父同位）：不入历史', () => {
    const a = obj('a', null);
    const b = obj('b', null);
    for (const o of [a, b]) fx.sceneManager.addObject(o);
    // b 已是根级末尾 → into null 无变化
    expect(fx.history.execute(new ReparentCommand('b', { kind: 'into', parentId: null }))).toBe(false);
    expect(fx.history.canUndo()).toBe(false);
  });

  it('对象/锚点不存在 → execute false', () => {
    const a = obj('a', null);
    fx.sceneManager.addObject(a);
    expect(fx.history.execute(new ReparentCommand('ghost', { kind: 'into', parentId: null }))).toBe(false);
    expect(fx.history.execute(new ReparentCommand('a', { kind: 'into', parentId: 'ghost' }))).toBe(false);
    expect(fx.history.execute(new ReparentCommand('a', { kind: 'before', anchorId: 'ghost' }))).toBe(false);
  });
});

describe('DeleteObjectCommand：组感知删除（T8.5 删组不删成员）', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('删除组 = 仅删组节点、成员上提父级；成员世界 transform 零变化；undo 复原', () => {
    const outer = group('outer', null);
    const inner = group('inner', 'outer');
    const a = obj('a', 'inner');
    for (const o of [outer, inner, a]) fx.sceneManager.addObject(o);
    a.transform.position = { x: 3, y: 4, z: 5 };
    const beforeTransform = { ...a.transform.position };
    const beforeOrder = orderOf(fx.sceneManager);

    expect(fx.history.execute(new DeleteObjectCommand('inner'))).toBe(true);

    expect(fx.sceneManager.getObject('inner')).toBeUndefined(); // 组已删
    expect(fx.sceneManager.getObject('a')).toBeDefined(); // 成员保留
    expect(fx.sceneManager.getObject('a')!.parentId).toBe('outer'); // 上提父级
    expect(fx.sceneManager.getObject('a')!.transform.position).toEqual(beforeTransform); // 世界 transform 零变化

    expect(fx.history.undo()).toBe(true);
    expect(fx.sceneManager.getObject('inner')).toBeDefined();
    expect(fx.sceneManager.getObject('a')!.parentId).toBe('inner');
    expect(orderOf(fx.sceneManager)).toEqual(beforeOrder); // 顺序复原

    expect(fx.history.redo()).toBe(true);
    expect(fx.sceneManager.getObject('a')!.parentId).toBe('outer');
  });

  it('删除普通对象行为零回归（无成员上提语义）', () => {
    const a = obj('a', null);
    fx.sceneManager.addObject(a);
    expect(fx.history.execute(new DeleteObjectCommand('a'))).toBe(true);
    expect(fx.sceneManager.getObjects()).toHaveLength(0);
    expect(fx.history.undo()).toBe(true);
    expect(fx.sceneManager.getObject('a')).toBeDefined();
  });
});
