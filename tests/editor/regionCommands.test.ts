/**
 * tests/editor/regionCommands.test.ts —— 阶段 6 命令三件套测试（T6.1，先测后码）。
 *
 * 覆盖（模式沿 v1 ChangeStyle/ChangeGeometry/ChangeLayer 命令先例）：
 * - ChangeShapeCommand：整体替换 shape（类型切换/points/options/baseHeight 同承载）、
 *   execute/undo/redo 往返、快照隔离、非 RegionObject 或缺失目标返回 false、幂等重放；
 * - ChangeSemanticCommand（语义层一切变更，分域契约 §A 注记）：
 *   ①类型切换 = semantic + layerId（按新类型 defaultLayerName 在场景按名查找，缺失落 null）
 *     + style 重置（新类型 defaultPresetId + overrides 清空），一条历史整体回退；
 *   ②类型不变 = 仅替换 semantic，layerId/style 原样；
 * - ChangePresetCommand：只改 style 层，emit style:changed + scene:changed（沿 v1 先例）。
 * 边界：三条命令对非 region 目标一律 execute false（按对象 type 区分）；零 THREE。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { createId } from '../../src/core/id';
import type { Layer } from '../../src/scene/Layer';
import type { SceneObject } from '../../src/scene/SceneObject';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import type { RegionObject, RegionShape } from '../../src/domain/regions';
import type { CommandContext } from '../../src/editor/commands/CommandContext';
import { ChangePresetCommand } from '../../src/editor/commands/ChangePresetCommand';
import { ChangeSemanticCommand } from '../../src/editor/commands/ChangeSemanticCommand';
import { ChangeShapeCommand } from '../../src/editor/commands/ChangeShapeCommand';

function makeRegion(overrides: Partial<RegionObject> = {}): RegionObject {
  return {
    id: createId('region'),
    type: 'region',
    name: '未命名区域 1',
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
    shape: {
      type: 'polygon',
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 3 },
        { x: 0, y: 3 },
      ],
      baseHeight: 0,
      closed: true,
    },
    semantic: { type: 'unclassified', properties: {} },
    style: { presetId: 'default_solid', overrides: {} },
    ...overrides,
  };
}

/** 非 region 对象夹具（type 'building'：三条命令对其 execute false；v1 Element 已删） */
function makeElement(): SceneObject {
  return {
    id: createId('element'),
    type: 'building',
    name: '建筑',
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
  };
}

function makeLayer(overrides: Partial<Layer> = {}): Layer {
  return {
    id: createId('layer'),
    name: '图层',
    visible: true,
    locked: false,
    opacity: 1,
    order: 0,
    objectIds: [],
    ...overrides,
  };
}

function setup() {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const ctx: CommandContext = { sceneManager, selection, eventBus };
  return { ctx, eventBus, sceneManager, selection };
}

function getRegion(sm: SceneManager, id: string): RegionObject {
  const obj = sm.getObject(id);
  if (!obj) throw new Error(`测试夹具：对象不存在（${id}）`);
  return obj as RegionObject;
}

// ── ChangeShapeCommand ──────────────────────────────────────

describe('ChangeShapeCommand', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('execute 整体替换 shape；undo 恢复 before；redo 重放 after；scene:changed 归因命令名', () => {
    const region = makeRegion();
    fx.sceneManager.addObject(region);
    const before = region.shape;
    const next: RegionShape = {
      type: 'circle',
      points: [
        { x: 5, y: 0 },
        { x: 0, y: 5 },
      ],
      baseHeight: 0.18,
      closed: true,
      options: { radius: 5, segments: 64 },
    };
    const cmd = new ChangeShapeCommand(region.id, next);
    expect(cmd.name).toBe('ChangeShapeCommand');
    expect(cmd.canExecute()).toBe(true);

    const changed = vi.fn();
    fx.eventBus.on('scene:changed', changed);
    expect(cmd.execute(fx.ctx)).toBe(true);
    expect(getRegion(fx.sceneManager, region.id).shape).toEqual(next);
    expect(changed).toHaveBeenCalledWith({ source: 'ChangeShapeCommand' });

    cmd.undo(fx.ctx);
    expect(getRegion(fx.sceneManager, region.id).shape).toEqual(before);

    cmd.redo(fx.ctx);
    expect(getRegion(fx.sceneManager, region.id).shape).toEqual(next);
  });

  it('目标不存在或非 RegionObject：execute 返回 false 且无命令级事件', () => {
    const element = makeElement();
    fx.sceneManager.addObject(element);

    const changed = vi.fn();
    fx.eventBus.on('scene:changed', changed);

    const cmdMissing = new ChangeShapeCommand('region_nope', makeRegion().shape);
    expect(cmdMissing.execute(fx.ctx)).toBe(false);

    const cmdElement = new ChangeShapeCommand(element.id, makeRegion().shape);
    expect(cmdElement.execute(fx.ctx)).toBe(false);
    expect(changed).not.toHaveBeenCalled();
  });

  it('快照隔离：构造后修改传入 shape 不影响 redo 内容', () => {
    const region = makeRegion();
    fx.sceneManager.addObject(region);
    const next: RegionShape = { type: 'line', points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], baseHeight: 0, closed: false };
    const cmd = new ChangeShapeCommand(region.id, next);
    next.points[0]!.x = 999; // 构造后被外部篡改
    cmd.execute(fx.ctx);
    cmd.undo(fx.ctx);
    cmd.redo(fx.ctx);
    expect(getRegion(fx.sceneManager, region.id).shape.points[0]!.x).toBe(0);
  });

  it('canExecute：非法形状类型拒绝', () => {
    const bad = { type: 'blob', points: [], baseHeight: 0, closed: true } as unknown as RegionShape;
    expect(new ChangeShapeCommand('region_x', bad).canExecute()).toBe(false);
  });

  it('幂等重放：对象已移除时 undo/redo 不抛错', () => {
    const region = makeRegion();
    fx.sceneManager.addObject(region);
    const cmd = new ChangeShapeCommand(region.id, makeRegion().shape);
    expect(cmd.execute(fx.ctx)).toBe(true);
    fx.sceneManager.removeObject(region.id);
    expect(() => {
      cmd.undo(fx.ctx);
      cmd.redo(fx.ctx);
    }).not.toThrow();
  });
});

// ── ChangeSemanticCommand ───────────────────────────────────

describe('ChangeSemanticCommand（语义层一切变更）', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('①类型切换：semantic 替换 + 自动迁入类型默认图层（按名查找）+ style 重置为默认预设；一条历史整体回退', () => {
    const waterLayer = makeLayer({ name: '水面' });
    const roadLayer = makeLayer({ name: '道路' });
    fx.sceneManager.addLayer(waterLayer);
    fx.sceneManager.addLayer(roadLayer);
    const region = makeRegion({
      layerId: null,
      semantic: { type: 'unclassified', properties: {} },
      style: { presetId: 'default_solid', overrides: { opacity: 0.5 } },
    });
    fx.sceneManager.addObject(region);

    const cmd = new ChangeSemanticCommand(region.id, { type: 'water', properties: {} });
    expect(cmd.name).toBe('ChangeSemanticCommand');
    expect(cmd.canExecute()).toBe(true);
    expect(cmd.execute(fx.ctx)).toBe(true);

    const after = getRegion(fx.sceneManager, region.id);
    expect(after.semantic).toEqual({ type: 'water', properties: {} });
    expect(after.layerId).toBe(waterLayer.id); // 自动归层：按 defaultLayerName='水面' 命中
    expect(after.style).toEqual({ presetId: 'water.standard', overrides: {} }); // overrides 清空 + 类型默认预设（T6.3 defaultPresetId 落地）
    // 图层派生索引同步（SceneManager 依 layerId 维护）
    expect(waterLayer.objectIds).toContain(region.id);

    // 一条历史整体回退：semantic + layerId + style 同时恢复
    cmd.undo(fx.ctx);
    const undone = getRegion(fx.sceneManager, region.id);
    expect(undone.semantic).toEqual({ type: 'unclassified', properties: {} });
    expect(undone.layerId).toBe(null);
    expect(undone.style).toEqual({ presetId: 'default_solid', overrides: { opacity: 0.5 } });
    expect(waterLayer.objectIds).not.toContain(region.id);

    cmd.redo(fx.ctx);
    const redone = getRegion(fx.sceneManager, region.id);
    expect(redone.semantic).toEqual({ type: 'water', properties: {} });
    expect(redone.layerId).toBe(waterLayer.id);
    expect(redone.style).toEqual({ presetId: 'water.standard', overrides: {} });
  });

  it('自动归层遇目标图层缺失：layerId 落 null（未分层，任务书明文许可）', () => {
    const region = makeRegion({ layerId: null });
    fx.sceneManager.addObject(region);
    const cmd = new ChangeSemanticCommand(region.id, { type: 'water', properties: {} });
    expect(cmd.execute(fx.ctx)).toBe(true);
    expect(getRegion(fx.sceneManager, region.id).layerId).toBe(null); // 场景无「水面」图层
  });

  it('类型切换时从原属图层迁出（含已有归属的场景）', () => {
    const grassLayer = makeLayer({ name: '绿地' });
    const roadLayer = makeLayer({ name: '道路' });
    fx.sceneManager.addLayer(grassLayer);
    fx.sceneManager.addLayer(roadLayer);
    const region = makeRegion({ layerId: grassLayer.id });
    fx.sceneManager.addObject(region);
    expect(grassLayer.objectIds).toContain(region.id);

    const cmd = new ChangeSemanticCommand(region.id, { type: 'road', properties: { width: 8 } });
    expect(cmd.execute(fx.ctx)).toBe(true);
    const after = getRegion(fx.sceneManager, region.id);
    expect(after.layerId).toBe(roadLayer.id);
    expect(after.semantic).toEqual({ type: 'road', properties: { width: 8 } });
    expect(grassLayer.objectIds).not.toContain(region.id);
    expect(roadLayer.objectIds).toContain(region.id);
  });

  it('②类型不变：仅替换 semantic（业务参数变更），layerId 与 style 原样不动', () => {
    const style = { presetId: 'water.flow', overrides: { opacity: 0.4 } };
    const region = makeRegion({
      semantic: { type: 'road', properties: { width: 6 } },
      style,
    });
    fx.sceneManager.addObject(region);
    const cmd = new ChangeSemanticCommand(region.id, { type: 'road', properties: { width: 12 } });
    expect(cmd.execute(fx.ctx)).toBe(true);
    const after = getRegion(fx.sceneManager, region.id);
    expect(after.semantic).toEqual({ type: 'road', properties: { width: 12 } });
    expect(after.style).toEqual(style);
    expect(after.layerId).toBe(null);

    cmd.undo(fx.ctx);
    expect(getRegion(fx.sceneManager, region.id).semantic).toEqual({ type: 'road', properties: { width: 6 } });
    expect(getRegion(fx.sceneManager, region.id).style).toEqual(style);
  });

  it('目标不存在或非 RegionObject：execute 返回 false', () => {
    const element = makeElement();
    fx.sceneManager.addObject(element);
    expect(new ChangeSemanticCommand('region_nope', { type: 'water', properties: {} }).execute(fx.ctx)).toBe(false);
    expect(new ChangeSemanticCommand(element.id, { type: 'water', properties: {} }).execute(fx.ctx)).toBe(false);
  });

  it('canExecute：未知语义类型拒绝', () => {
    const cmd = new ChangeSemanticCommand('region_x', { type: 'alien' as never, properties: {} });
    expect(cmd.canExecute()).toBe(false);
  });

  it('快照隔离：构造后篡改入参不影响重放内容', () => {
    const region = makeRegion();
    fx.sceneManager.addObject(region);
    const next = { type: 'road' as const, properties: { width: 6 } };
    const cmd = new ChangeSemanticCommand(region.id, next);
    next.properties.width = 999;
    cmd.execute(fx.ctx);
    cmd.undo(fx.ctx);
    cmd.redo(fx.ctx);
    expect(getRegion(fx.sceneManager, region.id).semantic).toEqual({ type: 'road', properties: { width: 6 } });
  });
});

// ── ChangePresetCommand ─────────────────────────────────────

describe('ChangePresetCommand', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('execute 替换 style 层并广播 style:changed + scene:changed；undo/redo 往返；只动 style', () => {
    const region = makeRegion({
      semantic: { type: 'water', properties: {} },
      style: { presetId: 'default_solid', overrides: {} },
    });
    fx.sceneManager.addObject(region);
    const cmd = new ChangePresetCommand(region.id, { presetId: 'water.flow', overrides: { opacity: 0.5 } });
    expect(cmd.name).toBe('ChangePresetCommand');
    expect(cmd.canExecute()).toBe(true);

    const styleChanged = vi.fn();
    const changed = vi.fn();
    fx.eventBus.on('style:changed', styleChanged);
    fx.eventBus.on('scene:changed', changed);
    expect(cmd.execute(fx.ctx)).toBe(true);

    const after = getRegion(fx.sceneManager, region.id);
    expect(after.style).toEqual({ presetId: 'water.flow', overrides: { opacity: 0.5 } });
    // 只动 style 层：shape/semantic/layerId 原样
    expect(after.shape).toEqual(region.shape);
    expect(after.semantic).toEqual({ type: 'water', properties: {} });
    expect(styleChanged).toHaveBeenCalledWith({ objectId: region.id });
    expect(changed).toHaveBeenCalledWith({ source: 'ChangePresetCommand' });

    cmd.undo(fx.ctx);
    expect(getRegion(fx.sceneManager, region.id).style).toEqual({ presetId: 'default_solid', overrides: {} });
    expect(styleChanged).toHaveBeenCalledTimes(2);

    cmd.redo(fx.ctx);
    expect(getRegion(fx.sceneManager, region.id).style).toEqual({ presetId: 'water.flow', overrides: { opacity: 0.5 } });
  });

  it('目标不存在或非 RegionObject：execute 返回 false 且无命令级事件', () => {
    const element = makeElement();
    fx.sceneManager.addObject(element);
    const styleChanged = vi.fn();
    fx.eventBus.on('style:changed', styleChanged);

    expect(new ChangePresetCommand('region_nope', { presetId: 'p', overrides: {} }).execute(fx.ctx)).toBe(false);
    expect(new ChangePresetCommand(element.id, { presetId: 'p', overrides: {} }).execute(fx.ctx)).toBe(false);
    expect(styleChanged).not.toHaveBeenCalled();
  });

  it('canExecute：空 presetId 拒绝', () => {
    expect(new ChangePresetCommand('region_x', { presetId: '', overrides: {} }).canExecute()).toBe(false);
  });

  it('快照隔离：构造后篡改入参 style 不影响重放内容', () => {
    const region = makeRegion();
    fx.sceneManager.addObject(region);
    const next = { presetId: 'water.flow', overrides: { opacity: 0.5 } };
    const cmd = new ChangePresetCommand(region.id, next);
    next.overrides.opacity = 9;
    cmd.execute(fx.ctx);
    cmd.undo(fx.ctx);
    cmd.redo(fx.ctx);
    expect(getRegion(fx.sceneManager, region.id).style.overrides).toEqual({ opacity: 0.5 });
  });
});
