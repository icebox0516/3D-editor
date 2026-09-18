/**
 * tests/editor/commands/ChangeAssetSeedCommand.test.ts —— model 变体 seed 重掷命令测试（T008.4）。
 *
 * 覆盖：
 * - execute：seed 与 transform 整体替换、assetId 等其余 asset 字段保留、返回 true；
 * - undo/redo 幂等往返：seed 与 transform 逐位复原（对已删除对象静默）；
 * - 守卫：目标不存在 / 非 model 对象 / 无 seed 的确定性对象 → false 且零副作用；
 * - canExecute：非整数 / 负 seed 拒绝（HistoryManager 前置检查面）；
 * - 快照独立性：execute 后外部改场景值，undo 仍复原到 execute 时捕获的 before。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { EventBus } from '../../../src/core/events/EventBus';
import type { Transform } from '../../../src/core/types';
import type { ModelObject } from '../../../src/domain/assets';
import { SceneManager } from '../../../src/scene/SceneManager';
import { SelectionManager } from '../../../src/scene/SelectionManager';
import type { SceneObject } from '../../../src/scene/SceneObject';
import { HistoryManager } from '../../../src/editor/history/HistoryManager';
import { ChangeAssetSeedCommand } from '../../../src/editor/commands/ChangeAssetSeedCommand';
import type { CommandContext } from '../../../src/editor/commands/CommandContext';

/** 场景对象 → ModelObject 读数通道（测试内联判别放宽；运行时守卫在命令内） */
function asModel(obj: SceneObject | undefined): ModelObject {
  return obj as unknown as ModelObject;
}

function setup() {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const history = new HistoryManager({ sceneManager, selection, eventBus });
  const ctx: CommandContext = { sceneManager, selection, eventBus };
  return { eventBus, sceneManager, selection, history, ctx };
}

const BASE_TRANSFORM: Transform = {
  position: { x: 1, y: 0.03, z: 2 },
  rotation: { x: 0, y: 0.4, z: 0 },
  scale: { x: 1.1, y: 1.1, z: 1.1 },
};

/** 带变体 seed 的 model 对象（点击放置产物形态） */
function modelWithSeed(id: string, seed: number): SceneObject {
  return {
    id,
    type: 'model',
    name: `树 ${id}`,
    visible: true,
    locked: false,
    layerId: null,
    parentId: null,
    transform: { ...BASE_TRANSFORM },
    asset: { assetId: 'asset_tree_3a', seed },
  } as unknown as SceneObject;
}

describe('ChangeAssetSeedCommand：重掷替换', () => {
  let fx: ReturnType<typeof setup>;
  beforeEach(() => {
    fx = setup();
  });

  it('execute：seed/transform 整体替换，assetId 保留，返回 true', () => {
    const obj = modelWithSeed('m1', 41);
    fx.sceneManager.addObject(obj);
    const nextTransform: Transform = {
      position: { x: 1, y: 0.03, z: 2 },
      rotation: { x: 0, y: 0.9, z: 0 },
      scale: { x: 1.2, y: 1.2, z: 1.2 },
    };
    const ok = fx.history.execute(new ChangeAssetSeedCommand('m1', { seed: 87, transform: nextTransform }));
    expect(ok).toBe(true);
    const after = fx.sceneManager.getObject('m1');
    expect(asModel(after).asset).toEqual({
      assetId: 'asset_tree_3a',
      seed: 87,
    });
    expect(after!.transform).toEqual(nextTransform);
  });

  it('undo/redo 往返：seed 与 transform 逐位复原', () => {
    const obj = modelWithSeed('m1', 41);
    fx.sceneManager.addObject(obj);
    const nextTransform: Transform = {
      position: { x: 1, y: 0.03, z: 2 },
      rotation: { x: 0, y: 0.9, z: 0 },
      scale: { x: 1.2, y: 1.2, z: 1.2 },
    };
    fx.history.execute(new ChangeAssetSeedCommand('m1', { seed: 87, transform: nextTransform }));

    expect(fx.history.undo()).toBe(true);
    const undone = fx.sceneManager.getObject('m1');
    expect(asModel(undone).asset.seed).toBe(41);
    expect(undone!.transform).toEqual(BASE_TRANSFORM);

    expect(fx.history.redo()).toBe(true);
    const redone = fx.sceneManager.getObject('m1');
    expect(asModel(redone).asset.seed).toBe(87);
    expect(redone!.transform).toEqual(nextTransform);
  });

  it('守卫：目标不存在 / 非 model / 无 seed → false 且零副作用', () => {
    // 不存在
    expect(
      fx.history.execute(new ChangeAssetSeedCommand('ghost', { seed: 2, transform: BASE_TRANSFORM })),
    ).toBe(false);
    // 非 model（无 asset 引用）
    const shape = {
      id: 's1',
      type: 'shape',
      name: '路',
      visible: true,
      locked: false,
      layerId: null,
      parentId: null,
      transform: { ...BASE_TRANSFORM },
    } as unknown as SceneObject;
    fx.sceneManager.addObject(shape);
    expect(
      fx.history.execute(new ChangeAssetSeedCommand('s1', { seed: 2, transform: BASE_TRANSFORM })),
    ).toBe(false);
    // model 但无 seed（拖放入库的确定性对象）
    const deterministic = {
      ...modelWithSeed('m2', 41),
      asset: { assetId: 'asset_tree_3a' },
    } as unknown as SceneObject;
    fx.sceneManager.addObject(deterministic);
    expect(
      fx.history.execute(new ChangeAssetSeedCommand('m2', { seed: 2, transform: BASE_TRANSFORM })),
    ).toBe(false);
    expect(fx.sceneManager.getObject('m2')!.transform).toEqual(BASE_TRANSFORM);
    // 失败命令不入历史（undo 无可撤销）
    expect(fx.history.undo()).toBe(false);
  });

  it('canExecute：非整数 / 负 seed 拒绝', () => {
    const cmd = new ChangeAssetSeedCommand('m1', { seed: -1, transform: BASE_TRANSFORM });
    expect(cmd.canExecute()).toBe(false);
    const frac = new ChangeAssetSeedCommand('m1', {
      seed: 1.5,
      transform: BASE_TRANSFORM,
    });
    expect(frac.canExecute()).toBe(false);
    const ok = new ChangeAssetSeedCommand('m1', { seed: 0, transform: BASE_TRANSFORM });
    expect(ok.canExecute()).toBe(true);
  });

  it('快照独立性：execute 后外部改场景值，undo 仍复原 execute 时的 before', () => {
    const obj = modelWithSeed('m1', 41);
    fx.sceneManager.addObject(obj);
    const nextTransform: Transform = {
      position: { x: 9, y: 9, z: 9 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 2, y: 2, z: 2 },
    };
    fx.history.execute(new ChangeAssetSeedCommand('m1', { seed: 87, transform: nextTransform }));

    // 外部（如 TransformCommand/gizmo）又改了 transform
    fx.sceneManager.updateObject('m1', {
      transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 1, y: 1, z: 1 }, scale: { x: 1, y: 1, z: 1 } },
    } as Partial<SceneObject>);

    expect(fx.history.undo()).toBe(true); // 撤销的是重掷：复原到 execute 前（41 / BASE）
    const restored = fx.sceneManager.getObject('m1');
    expect(asModel(restored).asset.seed).toBe(41);
    expect(restored!.transform).toEqual(BASE_TRANSFORM);
  });
});
