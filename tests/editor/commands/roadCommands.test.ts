/**
 * tests/editor/commands/roadCommands.test.ts —— 道路分割/合并命令测试
 * （T7.6 R4/R5，先测后码；R9 测试 3 项）。
 *
 * 覆盖：
 * - SplitRoadCommand：execute 以 live 场景为准切分（原对象 points ← 前段、新建副本
 *   region_ 前缀新 id + 后段 + `${原名} 2`，transform/semantic/style/layerId 保留）、
 *   undo 还原 + 删副本、redo 幂等重放、redo 后再 undo 二次往返；非法目标
 *   （非 region / 非 line / 端点 index）execute false 零副作用；一条历史；
 * - MergeRoadCommand：四邻接情形并入 first（保留 first id/名称/图层/语义/样式，
 *   删除 second）、undo 还原 first shape + 重加 second、redo 幂等；非邻接 execute
 *   false；同 id 拒绝；带 position 偏移的世界坐标合并；一条历史。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { EventBus } from '../../../src/core/events/EventBus';
import { createRegionObject } from '../../../src/domain/regions';
import type { RegionObject } from '../../../src/domain/regions';
import { SceneManager } from '../../../src/scene/SceneManager';
import { SelectionManager } from '../../../src/scene/SelectionManager';
import { HistoryManager } from '../../../src/editor/history/HistoryManager';
import { MergeRoadCommand } from '../../../src/editor/commands/MergeRoadCommand';
import { SplitRoadCommand } from '../../../src/editor/commands/SplitRoadCommand';

// ── 装置 ─────────────────────────────────────────────────────

function makeCtx() {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const history = new HistoryManager({ sceneManager, selection, eventBus });
  return { sceneManager, selection, history };
}

/** 三折点道路线：start (0,0) → (10,0) → end (20,0) */
function roadLine(name = '道路'): RegionObject {
  return createRegionObject({
    shape: {
      type: 'line',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 20, y: 0 },
      ],
      baseHeight: 0.06,
      closed: false,
    },
    semanticType: 'road',
    name,
  });
}

let seq = 0;
function makeSceneWithRoad(): { ctx: ReturnType<typeof makeCtx>; road: RegionObject } {
  const ctx = makeCtx();
  const road = roadLine(`道路 ${++seq}`);
  road.layerId = 'layer_road';
  road.semantic.properties.width = 8;
  ctx.sceneManager.addObject(road);
  return { ctx, road };
}

beforeEach(() => {
  seq = 0;
});

// ── SplitRoadCommand ────────────────────────────────────────

describe('SplitRoadCommand', () => {
  it('execute：原对象取前段、新建副本取后段（region_ 前缀 + `${原名} 2` + 全字段保留）', () => {
    const { ctx, road } = makeSceneWithRoad();
    const command = new SplitRoadCommand(road.id, 1);
    expect(ctx.history.execute(command)).toBe(true);

    const first = ctx.sceneManager.getObject(road.id) as RegionObject;
    expect(first.shape.points).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);

    const second = ctx.sceneManager.getObject(command.createdId) as RegionObject;
    expect(second).toBeDefined();
    expect(second.id).not.toBe(road.id);
    expect(second.id.startsWith('region_')).toBe(true);
    expect(second.name).toBe(`${road.name} 2`);
    expect(second.shape.points).toEqual([
      { x: 10, y: 0 },
      { x: 20, y: 0 },
    ]);
    expect(second.shape.baseHeight).toBe(road.shape.baseHeight);
    expect(second.layerId).toBe('layer_road');
    expect(second.semantic.type).toBe('road');
    expect(second.semantic.properties.width).toBe(8);
    expect(second.style).toEqual(road.style);
    expect(second.transform).toEqual(road.transform);
  });

  it('undo：还原原 shape + 删副本（选中集同步清理）；redo 幂等重放；redo 后再 undo 二次往返', () => {
    const { ctx, road } = makeSceneWithRoad();
    const command = new SplitRoadCommand(road.id, 1);
    ctx.history.execute(command);
    ctx.selection.selectMany([road.id, command.createdId]);

    ctx.history.undo();
    expect((ctx.sceneManager.getObject(road.id) as RegionObject).shape.points).toHaveLength(3);
    expect(ctx.sceneManager.getObject(command.createdId)).toBeUndefined();
    expect(ctx.selection.getSelectedIds()).not.toContain(command.createdId);

    ctx.history.redo();
    expect((ctx.sceneManager.getObject(road.id) as RegionObject).shape.points).toHaveLength(2);
    expect(ctx.sceneManager.getObject(command.createdId)).toBeDefined();

    ctx.history.undo();
    expect((ctx.sceneManager.getObject(road.id) as RegionObject).shape.points).toHaveLength(3);
    expect(ctx.sceneManager.getObject(command.createdId)).toBeUndefined();
    expect(ctx.history.canUndo()).toBe(false); // 全程一条历史
  });

  it('redo 稳定：副本 id 构造时生成一次（多次重放同 id）', () => {
    const { ctx, road } = makeSceneWithRoad();
    const command = new SplitRoadCommand(road.id, 1);
    ctx.history.execute(command);
    const firstId = command.createdId;
    ctx.history.undo();
    ctx.history.redo();
    expect(ctx.sceneManager.getObject(firstId)).toBeDefined();
    ctx.history.undo();
    ctx.history.redo();
    expect(ctx.sceneManager.getObject(command.createdId)!.id).toBe(firstId);
  });

  it('非法目标：非 line / 端点 index / 不存在对象 → execute false 零副作用', () => {
    const { ctx, road } = makeSceneWithRoad();
    // 端点 index（0 / 2）
    expect(ctx.history.execute(new SplitRoadCommand(road.id, 0))).toBe(false);
    expect(ctx.history.execute(new SplitRoadCommand(road.id, 2))).toBe(false);
    // 不存在对象
    expect(ctx.history.execute(new SplitRoadCommand('region_missing', 1))).toBe(false);
    // 非 line region
    const polygon = createRegionObject({
      shape: {
        type: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 5, y: 8 },
        ],
        baseHeight: 0,
        closed: true,
      },
    });
    ctx.sceneManager.addObject(polygon);
    expect(ctx.history.execute(new SplitRoadCommand(polygon.id, 1))).toBe(false);
    expect(ctx.sceneManager.getObjects()).toHaveLength(2);
    expect(ctx.history.canUndo()).toBe(false);
  });
});

// ── MergeRoadCommand ────────────────────────────────────────

describe('MergeRoadCommand', () => {
  it('end-start 相邻：结果写入 first（点列拼接）、删除 second；first id/名称/图层/语义/样式保留', () => {
    const ctx = makeCtxEmpty();
    const first = roadLine('主干道');
    first.layerId = 'layer_a';
    first.semantic.properties.width = 7;
    const second = roadLine('支路');
    second.layerId = 'layer_b';
    second.transform.position = { x: 20, y: 0, z: 0 }; // 世界端点 (20,0) 相接 first.end
    ctx.sceneManager.addObject(first);
    ctx.sceneManager.addObject(second);

    const command = new MergeRoadCommand(first.id, second.id);
    expect(ctx.history.execute(command)).toBe(true);

    const merged = ctx.sceneManager.getObject(first.id) as RegionObject;
    expect(merged.name).toBe('主干道');
    expect(merged.layerId).toBe('layer_a');
    expect(merged.semantic.properties.width).toBe(7);
    expect(merged.shape.points).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
      // second 世界点列 = 局部 (0,0),(10,0),(20,0) + position(20,0) → (20,0),(30,0),(40,0)；
      // 去掉共享端点 (20,0) 后追加 (30,0),(40,0)
      { x: 30, y: 0 },
      { x: 40, y: 0 },
    ]);
    expect(ctx.sceneManager.getObject(second.id)).toBeUndefined();
    expect(ctx.selection.getSelectedIds()).not.toContain(second.id);
  });

  it('end-end 相邻（第二段反向）：拼接按 reverse(second) 相接', () => {
    const ctx = makeCtxEmpty();
    const first = roadLine('正段');
    // second 局部点列反向：(40,0)→(30,0)→(20,0)，end (20,0) ≈ first.end（距离 0）
    const second = createRegionObject({
      shape: {
        type: 'line',
        points: [
          { x: 40, y: 0 },
          { x: 30, y: 0 },
          { x: 20, y: 0 },
        ],
        baseHeight: 0.06,
        closed: false,
      },
      semanticType: 'road',
      name: '反段',
    });
    ctx.sceneManager.addObject(first);
    ctx.sceneManager.addObject(second);

    expect(ctx.history.execute(new MergeRoadCommand(first.id, second.id))).toBe(true);
    const merged = ctx.sceneManager.getObject(first.id) as RegionObject;
    expect(merged.shape.points).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
      { x: 30, y: 0 },
      { x: 40, y: 0 },
    ]);
  });

  it('undo：还原 first shape + 重加 second（含其图层/位置原样）；redo 幂等；一条历史', () => {
    const ctx = makeCtxEmpty();
    const first = roadLine('甲');
    const second = roadLine('乙');
    second.transform.position = { x: 20, y: 0, z: 0 };
    second.layerId = 'layer_b';
    ctx.sceneManager.addObject(first);
    ctx.sceneManager.addObject(second);

    const command = new MergeRoadCommand(first.id, second.id);
    ctx.history.execute(command);

    ctx.history.undo();
    const restoredFirst = ctx.sceneManager.getObject(first.id) as RegionObject;
    expect(restoredFirst.shape.points).toHaveLength(3);
    const restoredSecond = ctx.sceneManager.getObject(second.id) as RegionObject;
    expect(restoredSecond).toBeDefined();
    expect(restoredSecond.layerId).toBe('layer_b');
    expect(restoredSecond.transform.position).toEqual({ x: 20, y: 0, z: 0 });

    ctx.history.redo();
    expect((ctx.sceneManager.getObject(first.id) as RegionObject).shape.points).toHaveLength(5);
    expect(ctx.sceneManager.getObject(second.id)).toBeUndefined();
    expect(ctx.history.canUndo()).toBe(true); // 全程一条历史（execute 一条）
  });

  it('非邻接（端点距离超 0.5m）→ execute false 零副作用', () => {
    const ctx = makeCtxEmpty();
    const first = roadLine('远一');
    const second = roadLine('远二');
    second.transform.position = { x: 100, y: 0, z: 0 };
    ctx.sceneManager.addObject(first);
    ctx.sceneManager.addObject(second);

    expect(ctx.history.execute(new MergeRoadCommand(first.id, second.id))).toBe(false);
    expect(ctx.sceneManager.getObjects()).toHaveLength(2);
    expect((ctx.sceneManager.getObject(first.id) as RegionObject).shape.points).toHaveLength(3);
    expect(ctx.history.canUndo()).toBe(false);
  });

  it('同 id 拒绝（自己并自己无语义）', () => {
    const ctx = makeCtxEmpty();
    const road = roadLine('自环');
    ctx.sceneManager.addObject(road);
    expect(ctx.history.execute(new MergeRoadCommand(road.id, road.id))).toBe(false);
  });

  it('非 line 目标拒绝', () => {
    const ctx = makeCtxEmpty();
    const polygon = createRegionObject({
      shape: {
        type: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 5, y: 8 },
        ],
        baseHeight: 0,
        closed: true,
      },
    });
    const road = roadLine('路');
    ctx.sceneManager.addObject(polygon);
    ctx.sceneManager.addObject(road);
    expect(ctx.history.execute(new MergeRoadCommand(polygon.id, road.id))).toBe(false);
    expect(ctx.history.execute(new MergeRoadCommand(road.id, polygon.id))).toBe(false);
  });
});

function makeCtxEmpty() {
  return makeCtx();
}
