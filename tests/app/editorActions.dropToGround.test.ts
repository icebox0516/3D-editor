/**
 * tests/app/editorActions.dropToGround.test.ts —— 贴地命令测试（T8.1 R5，先测后码）。
 *
 * 覆盖（任务书 §5 验收口径）：
 * - 抬升对象贴地：y 归 0（region = position.y − 底面层，底面 = baseHeight + position.y）；
 * - 悬于另一对象上方 → 贴其顶面层（候选 = 其余对象底/顶面派生层，复用高度候选管线）；
 * - 单条历史 undo/redo 可逆（单选单条 TransformCommand）；
 * - 多选 = 逐对象贴地合一条 BatchCommand（一次 undo 全部还原）；
 * - 已贴地对象零位移 → 不产生历史条目（全部零位移不 execute）；
 * - 无选中 → 安全无操作。
 * 边界：app 层无头编辑器（createEditor(null)）；高度候选经 domain 纯函数（零 THREE）。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { createEditor } from '../../src/app/bootstrap';
import type { EditorHandle } from '../../src/app/bootstrap';
import { EditorActionsCore } from '../../src/app/editorActionsCore';
import { MODEL_BASE_HEIGHT } from '../../src/domain/assets';
import type { ModelObject } from '../../src/domain/assets';
import { createRegionObject } from '../../src/domain/regions';
import type { RegionObject } from '../../src/domain/regions';

function makeCore(facade: EditorHandle): EditorActionsCore {
  // 复用组合根同一实例语义（history/sceneManager/selection 已在 facade 内）
  return (facade as unknown as { actions: EditorActionsCore }).actions;
}

function makeBuilding(id: string, y: number, height: number, baseHeight = 0): RegionObject {
  const region = createRegionObject({
    shape: {
      type: 'polygon',
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
      ],
      baseHeight,
      closed: true,
    },
    semanticType: 'building',
  });
  region.id = id;
  region.transform.position.y = y;
  region.semantic.properties = { height };
  return region;
}

function makeModel(id: string, y: number): ModelObject {
  return {
    id,
    type: 'model',
    name: 'm',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: {
      position: { x: 0, y, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
    asset: { assetId: 'asset_x' },
  };
}

describe('EditorActionsCore.dropSelectionToGround · 贴地', () => {
  let facade: EditorHandle;
  let actions: EditorActionsCore;

  beforeEach(() => {
    facade = createEditor(null);
    actions = makeCore(facade);
  });

  it('抬升对象 → y 归 0；单条历史 undo/redo 可逆', () => {
    const floating = makeBuilding('region_f', 3, 10); // 底 3 → 目标 0
    facade.scene.addObject(floating);
    facade.selection.select('region_f');
    actions.dropSelectionToGround();
    expect(facade.scene.getObject('region_f')!.transform.position.y).toBe(0);
    facade.history.undo();
    expect(facade.scene.getObject('region_f')!.transform.position.y).toBe(3);
    facade.history.redo();
    expect(facade.scene.getObject('region_f')!.transform.position.y).toBe(0);
  });

  it('region 的 baseHeight 参与底面合成（贴地 = 底面归 0，非 position.y 归 0）', () => {
    const road = makeBuilding('region_r', 5, 10, 0.06); // 底 5.06 → position.y 贴至 −0.06
    facade.scene.addObject(road);
    facade.selection.select('region_r');
    actions.dropSelectionToGround();
    expect(facade.scene.getObject('region_r')!.transform.position.y).toBeCloseTo(-0.06, 10);
  });

  it('悬于另一对象上方 → 贴其顶面层 + lift（高度候选管线复用；模型承托层语义 T9.2）', () => {
    const ground = makeBuilding('region_g', 0, 12); // 顶面 12
    const floating = makeModel('model_f', 15); // 底 15 → 目标 12 + lift
    facade.scene.addObject(ground);
    facade.scene.addObject(floating);
    facade.selection.select('model_f');
    actions.dropSelectionToGround();
    expect(facade.scene.getObject('model_f')!.transform.position.y).toBeCloseTo(
      12 + MODEL_BASE_HEIGHT,
      10,
    );
  });

  it('多选逐对象贴地合一条 BatchCommand（一次 undo 全还原）', () => {
    const ground = makeBuilding('region_g', 0, 10); // 顶 10
    const a = makeModel('model_a', 13);
    const b = makeModel('model_b', 30);
    for (const o of [ground, a, b]) facade.scene.addObject(o);
    facade.selection.selectMany(['model_a', 'model_b']);
    const before = a.transform.position.y;
    actions.dropSelectionToGround();
    expect(facade.scene.getObject('model_a')!.transform.position.y).toBeCloseTo(
      10 + MODEL_BASE_HEIGHT,
      10,
    );
    expect(facade.scene.getObject('model_b')!.transform.position.y).toBeCloseTo(
      10 + MODEL_BASE_HEIGHT,
      10,
    );
    facade.history.undo();
    expect(facade.scene.getObject('model_a')!.transform.position.y).toBe(before);
    expect(facade.scene.getObject('model_b')!.transform.position.y).toBe(30);
  });

  it('已贴地对象零位移 → 不产生历史（undo 不可回退）', () => {
    const grounded = makeBuilding('region_ok', 0, 10);
    facade.scene.addObject(grounded);
    facade.selection.select('region_ok');
    actions.dropSelectionToGround();
    expect(facade.history.canUndo()).toBe(false);
  });

  it('无选中 → 安全无操作', () => {
    expect(() => actions.dropSelectionToGround()).not.toThrow();
    expect(facade.history.canUndo()).toBe(false);
  });
});

describe('贴地承托层语义 · 模型底面微抬（T9.2）', () => {
  let facade: EditorHandle;
  let actions: EditorActionsCore;

  beforeEach(() => {
    facade = createEditor(null);
    actions = makeCore(facade);
  });

  it('模型贴地面 → y = MODEL_BASE_HEIGHT（承托层 0 + lift）', () => {
    const floating = makeModel('model_f', 5); // 底 5 → 地面层 0 + lift
    facade.scene.addObject(floating);
    facade.selection.select('model_f');
    actions.dropSelectionToGround();
    expect(facade.scene.getObject('model_f')!.transform.position.y).toBeCloseTo(MODEL_BASE_HEIGHT, 10);
  });

  it('模型贴道路顶层（baseHeight 0.06 无派生高）→ y = 0.06 + lift（不与道路面共面）', () => {
    const road = makeBuilding('region_road', 0, 0, 0.06); // 底 0.06（height 0 → 无顶面项）
    const floating = makeModel('model_f', 5);
    for (const o of [road, floating]) facade.scene.addObject(o);
    facade.selection.select('model_f');
    actions.dropSelectionToGround();
    expect(facade.scene.getObject('model_f')!.transform.position.y).toBeCloseTo(
      0.06 + MODEL_BASE_HEIGHT,
      10,
    );
  });

  it('混合选中同一承托层：模型 + lift、region 精确贴附（逐对象语义）', () => {
    const road = makeBuilding('region_road', 0, 0, 0.06);
    const model = makeModel('model_m', 5);
    const plaza = makeBuilding('region_p', 5, 10); // 底 5（baseHeight 0）
    for (const o of [road, model, plaza]) facade.scene.addObject(o);
    facade.selection.selectMany(['model_m', 'region_p']);
    actions.dropSelectionToGround();
    expect(facade.scene.getObject('model_m')!.transform.position.y).toBeCloseTo(
      0.06 + MODEL_BASE_HEIGHT,
      10,
    );
    expect(facade.scene.getObject('region_p')!.transform.position.y).toBeCloseTo(0.06, 10);
  });

  it('模型已在地面 lift 层 → 零位移不入历史（y 稳定不动）', () => {
    const grounded = makeModel('model_ok', MODEL_BASE_HEIGHT);
    facade.scene.addObject(grounded);
    facade.selection.select('model_ok');
    actions.dropSelectionToGround();
    expect(facade.history.canUndo()).toBe(false);
    expect(facade.scene.getObject('model_ok')!.transform.position.y).toBeCloseTo(MODEL_BASE_HEIGHT, 10);
  });

  it('模型贴地 undo/redo 往返 y 稳定', () => {
    const floating = makeModel('model_f', 2);
    facade.scene.addObject(floating);
    facade.selection.select('model_f');
    actions.dropSelectionToGround();
    expect(facade.scene.getObject('model_f')!.transform.position.y).toBeCloseTo(MODEL_BASE_HEIGHT, 10);
    facade.history.undo();
    expect(facade.scene.getObject('model_f')!.transform.position.y).toBe(2);
    facade.history.redo();
    expect(facade.scene.getObject('model_f')!.transform.position.y).toBeCloseTo(MODEL_BASE_HEIGHT, 10);
  });
});
