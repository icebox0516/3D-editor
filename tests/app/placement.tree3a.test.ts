/**
 * tests/app/placement.tree3a.test.ts —— T008.4 放置全链路 e2e（asset_tree_3a）。
 *
 * 覆盖（无头 editor 级全链，FakePort + 真 manifest + createEditor 组合根，零 THREE）：
 * - 点击放置：Ghost 携 seed 与落地对象同 seed 同 transform（所见即所放——
 *   槽路由 seed 维度对齐；运行时几何共享由 ProceduralSourceCache/AssetSourceRouter
 *   层测试锁定，本文件锁 editor 侧链路语义）；
 * - 重掷：Inspector 同款组合（resampleVariantTransform + ChangeAssetSeedCommand）→
 *   seed 换新、transform 采样差换算（用户 gizmo 编辑保留语义的数学对账）、
 *   assetId 不动；undo/redo 逐位复原；
 * - 复制孪生（D19.8）：duplicateSelection → assetId+seed 全同、仅 id/transform 异
 *   （偏移 1m）；撤销复原；
 * - 撤销链作用域：放置（会话批）/重掷/复制三条历史逐层回退与重做（含空场 → 全复原）；
 * - 存档往返：saveScene → deserialize → openScene 后 seed/transform 逐位一致 +
 *   二次保存字节级一致。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import type { ID, Transform, Vec3 } from '../../src/core/types';
import { deepClone } from '../../src/core/utils';
import type { ModelObject } from '../../src/domain/assets';
import { resampleVariantTransform } from '../../src/domain/assets';
import { ChangeAssetSeedCommand } from '../../src/editor/commands/ChangeAssetSeedCommand';
import type {
  CameraPort,
  DrawPreviewState,
  PointerEventInfo,
  PreviewPort,
  ViewportPort,
} from '../../src/editor/services/ports';
import type { EditorFacade } from '../../src/editor/EditorFacade';
import { EditorActionsCore } from '../../src/app/editorActionsCore';
import { createEditor } from '../../src/app/bootstrap';
import { SceneSerializer } from '../../src/io/SceneSerializer';
import manifestJson from '../../assets/manifest.json';

const TREE_ID = 'asset_tree_3a';

// ── Fake Port（沿 phase1.acceptance.test.ts 同款；Preview 增 seed 记录）────────

class FakeViewport implements ViewportPort {
  surfacePoint(): null {
    return null;
  }
  pickObject(): ID | null {
    return null;
  }
  groundPoint(x: number, y: number): Vec3 | null {
    return { x, y: 0, z: y };
  }
}

class FakeCamera implements CameraPort {
  getMode(): 'perspective' | 'top' | 'front' | 'side' {
    return 'perspective';
  }
  setMode(): void {}
  setOrthoLock(): void {}
  focusObjects(): void {}
  focusAll(): void {}
}

class FakePreview implements PreviewPort {
  visible = false;
  readonly shown: Array<{ assetId: ID; seed?: number; t: Transform }> = [];
  hideCount = 0;
  showGhost(assetId: ID, t: Transform, seed?: number): void {
    this.visible = true;
    this.shown.push({ assetId, seed, t: deepClone(t) });
  }
  updateGhost(_t: Transform): void {
    if (!this.visible) throw new Error('updateGhost 在未 showGhost 时调用');
  }
  hideGhost(): void {
    this.visible = false;
    this.hideCount += 1;
  }
  updateDrawPreview(_state: DrawPreviewState): void {}
  clear(): void {
    this.visible = false;
  }
}

const left = (x: number, y: number): PointerEventInfo => ({
  screenX: x,
  screenY: y,
  button: 'left',
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
});

function modelsOf(facade: EditorFacade): ModelObject[] {
  return facade.scene.getObjects((o) => o.type === 'model') as ModelObject[];
}

/** Inspector 重掷按钮同款组合（载荷预计算 + 命令执行） */
function reroll(facade: EditorFacade, objectId: ID, newSeed: number): boolean {
  const obj = facade.scene.getObject(objectId) as ModelObject | undefined;
  const oldSeed = obj?.asset.seed;
  if (!obj || typeof oldSeed !== 'number') return false;
  const descriptor = facade.registries.assets.get(obj.asset.assetId);
  const variants = descriptor?.kind === 'procedural' ? descriptor.asset.variants : undefined;
  return facade.history.execute(
    new ChangeAssetSeedCommand(objectId, {
      seed: newSeed,
      transform: resampleVariantTransform(variants, oldSeed, newSeed, obj.transform),
    }),
  );
}

describe('T008.4 放置全链路 e2e：asset_tree_3a', () => {
  let preview: FakePreview;
  let facade: EditorFacade;
  let actions: EditorActionsCore;

  beforeEach(() => {
    preview = new FakePreview();
    facade = createEditor(null, {
      ports: { viewport: new FakeViewport(), camera: new FakeCamera(), preview },
      assets: manifestJson.assets,
    });
    actions = new EditorActionsCore({
      history: facade.history,
      sceneManager: facade.scene,
      selection: facade.selection,
    });
  });

  it('入库可放置：Ghost 与落地同 seed 同 transform（所见即所放）', () => {
    // 入库（bootstrap 自动注册程序化资产；phase1 [1] 已锁注册清单，此处只验可用）
    const descriptor = facade.registries.assets.get(TREE_ID);
    expect(descriptor?.kind).toBe('procedural');

    facade.tools.activate('placement', { assetId: TREE_ID });
    const tool = facade.tools.getActiveTool()!;
    tool.onPointerMove(left(10, 10));
    tool.onPointerDown(left(10, 10));

    const tree = modelsOf(facade)[0]!;
    expect(tree.asset.assetId).toBe(TREE_ID);
    expect(typeof tree.asset.seed).toBe('number');
    // T008.4 核心：Ghost 预览携当前掷出的 seed（同 seed → 同槽 → 同几何）
    expect(preview.shown[0]!.seed).toBe(tree.asset.seed);
    expect(preview.shown[0]!.t).toEqual(tree.transform);
  });

  it('重掷换一棵：seed 换新 + transform 采样差换算 + assetId 不动；undo/redo 逐位复原', () => {
    facade.tools.activate('placement', { assetId: TREE_ID });
    const tool = facade.tools.getActiveTool()!;
    tool.onPointerMove(left(10, 10));
    tool.onPointerDown(left(10, 10));
    const tree = modelsOf(facade)[0]!;
    const oldSeed = tree.asset.seed!;
    const oldTransform = deepClone(tree.transform);

    // 模拟 gizmo 手调（重掷必须保留的用户编辑）
    const userTransform: Transform = {
      position: oldTransform.position,
      rotation: { ...oldTransform.rotation, y: oldTransform.rotation.y + 0.7 },
      scale: { x: 1.6, y: 2.1, z: 1.6 },
    };
    facade.scene.updateObject(tree.id, { transform: userTransform });

    expect(reroll(facade, tree.id, 987654321)).toBe(true);
    const rerolled = facade.scene.getObject(tree.id) as ModelObject;
    expect(rerolled.asset.seed).toBe(987654321);
    expect(rerolled.asset.assetId).toBe(TREE_ID); // 资产引用不动
    // 采样差换算对账：scale ×(new/old)、rotY +(new−old)、位置与用户非均匀缩放保留
    const descriptor = facade.registries.assets.get(TREE_ID)!;
    const variants = descriptor.kind === 'procedural' ? descriptor.asset.variants : undefined;
    expect(rerolled.transform).toEqual(resampleVariantTransform(variants, oldSeed, 987654321, userTransform));

    // undo → 回到手调后状态（重掷前的 before 快照）；redo → 回到重掷后
    expect(facade.history.undo()).toBe(true);
    const undone = facade.scene.getObject(tree.id) as ModelObject;
    expect(undone.asset.seed).toBe(oldSeed);
    expect(undone.transform).toEqual(userTransform);
    expect(facade.history.redo()).toBe(true);
    expect((facade.scene.getObject(tree.id) as ModelObject).asset.seed).toBe(987654321);
  });

  it('复制孪生（D19.8）：assetId+seed 全同、仅 id/transform 异（偏移 1m）；撤销复原', () => {
    facade.tools.activate('placement', { assetId: TREE_ID });
    const tool = facade.tools.getActiveTool()!;
    tool.onPointerMove(left(10, 10));
    tool.onPointerDown(left(10, 10));
    const tree = modelsOf(facade)[0]!;

    facade.selection.select(tree.id);
    actions.duplicateSelection();

    const models = modelsOf(facade);
    expect(models).toHaveLength(2);
    const twin = models.find((m) => m.id !== tree.id)!;
    expect(twin.asset).toEqual(tree.asset); // 孪生：同资产同 seed（不自动换 seed）
    expect(twin.id).not.toBe(tree.id);
    expect(twin.transform.position.x).toBeCloseTo(tree.transform.position.x + 1, 12);
    expect(twin.transform.rotation).toEqual(tree.transform.rotation);

    expect(facade.history.undo()).toBe(true); // 撤销复制只移除孪生
    expect(modelsOf(facade)).toHaveLength(1);
    expect(modelsOf(facade)[0]!.id).toBe(tree.id);
  });

  it('撤销链作用域：放置/重掷/复制三条历史逐层回退到空场，重做全复原', () => {
    facade.tools.activate('placement', { assetId: TREE_ID });
    const tool = facade.tools.getActiveTool()!;
    tool.onPointerMove(left(10, 10));
    tool.onPointerDown(left(10, 10));
    const tree = modelsOf(facade)[0]!;
    reroll(facade, tree.id, 111222333);
    facade.selection.select(tree.id);
    actions.duplicateSelection();
    expect(modelsOf(facade)).toHaveLength(2);
    const twinState = deepClone(modelsOf(facade));

    expect(facade.history.undo()).toBe(true); // 复制退
    expect(modelsOf(facade)).toHaveLength(1);
    expect(facade.history.undo()).toBe(true); // 重掷退
    expect((modelsOf(facade)[0] as ModelObject).asset.seed).not.toBe(111222333);
    expect(facade.history.undo()).toBe(true); // 放置退（会话批一条）
    expect(modelsOf(facade)).toHaveLength(0);

    expect(facade.history.redo()).toBe(true);
    expect(facade.history.redo()).toBe(true);
    expect(facade.history.redo()).toBe(true);
    const restored = modelsOf(facade).map((m) => deepClone(m));
    expect(restored).toEqual(twinState); // 重做到位：重掷后 seed + 孪生逐位复原
  });

  it('存档往返：seed/transform 落盘重建逐位一致 + 二次保存字节级一致', () => {
    facade.tools.activate('placement', { assetId: TREE_ID });
    const tool = facade.tools.getActiveTool()!;
    tool.onPointerMove(left(10, 10));
    tool.onPointerDown(left(10, 10));
    const tree = modelsOf(facade)[0]!;
    reroll(facade, tree.id, 424242424);

    const before = deepClone(modelsOf(facade));
    const json = facade.saveScene();
    const data = new SceneSerializer().deserialize(json);
    expect(data.objects).toHaveLength(1);

    facade.openScene(data);
    expect(modelsOf(facade)).toHaveLength(1);
    const reopened = modelsOf(facade)[0]!;
    expect(reopened.asset.assetId).toBe(TREE_ID);
    expect(reopened.asset.seed).toBe(424242424); // seed 落盘 → 同 seed 同槽重建
    expect(reopened.transform).toEqual(before[0]!.transform);
    expect(facade.saveScene()).toBe(json); // 二次保存字节级一致
  });
});
