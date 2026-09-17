/**
 * tests/editor/SelectTool.vertexEdit.test.ts —— 选择工具双击进入顶点编辑测试（T6.8，先测后码）。
 *
 * 覆盖（任务书验收 1 项的视口入口）：
 * - 双击命中 region 对象 → 注入的 onEnterVertexEdit 钩子收到 objectId；
 * - 双击命中非 region 对象 / 空白 / 锁定对象 → 钩子不触发；
 * - 未注入钩子（默认装配缺省）→ 双击安全无操作。
 * 边界：沿 SelectTool.test 范式（Fake ViewportPort 拾取可控）。
 */
import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import type { ID } from '../../src/core/types';
import type { ModelObject } from '../../src/domain/assets';
import type { RegionObject } from '../../src/domain/regions';
import { SceneManager } from '../../src/scene/SceneManager';
import { SelectionManager } from '../../src/scene/SelectionManager';
import { AssetRegistry } from '../../src/registries/AssetRegistry';
import { HistoryManager } from '../../src/editor/history/HistoryManager';
import type { ToolContext } from '../../src/editor/tools';
import { SelectTool } from '../../src/editor/tools/SelectTool';
import { ToolManager } from '../../src/editor/tools/ToolManager';
import type { CameraPort, PreviewPort, ViewportPort } from '../../src/editor/services/ports';

class PickViewport implements ViewportPort {

  /** 测量拾取（T10.1 ViewportPort 增补）：本工具测试不消费，恒 null */
  surfacePoint(): null {
    return null;
  }
  hit: ID | null = null;
  pickObject(): ID | null {
    return this.hit;
  }
  groundPoint() {
    return { x: 0, y: 0, z: 0 };
  }
}
class NullCamera implements CameraPort {
  getMode(): 'perspective' | 'top' | 'front' | 'side' {
    return 'perspective';
  }
  setMode(): void {}
  setOrthoLock(): void {}
  focusObjects(): void {}
  focusAll(): void {}
}
class NullPreview implements PreviewPort {
  showGhost(): void {}
  updateGhost(): void {}
  hideGhost(): void {}
  updateDrawPreview(): void {}
  clear(): void {}
}

function makeRegion(id: string, locked = false): RegionObject {
  return {
    id,
    type: 'region',
    name: '区域',
    parentId: null,
    layerId: null,
    visible: true,
    locked,
    transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    properties: {},
    shape: { type: 'polygon', points: [], baseHeight: 0, closed: true },
    semantic: { type: 'unclassified', properties: {} },
    style: { presetId: 'default_solid', overrides: {} },
  };
}

function setup(onEnterVertexEdit?: (objectId: ID) => void) {
  const eventBus = new EventBus();
  const sceneManager = new SceneManager(eventBus);
  const selection = new SelectionManager(eventBus);
  const history = new HistoryManager({ sceneManager, selection, eventBus });
  const viewport = new PickViewport();
  const ctx: ToolContext = {
    sceneManager,
    selection,
    history,
    registries: { assets: new AssetRegistry() },
    viewport,
    camera: new NullCamera(),
    preview: new NullPreview(),
    eventBus,
  };
  const tools = new ToolManager(ctx);
  const tool = new SelectTool(null, onEnterVertexEdit);
  tools.register(tool);
  tools.activate('select');
  return { sceneManager, selection, viewport, tools, tool };
}

const DBL = { screenX: 10, screenY: 10, button: 'left', ctrlKey: false, shiftKey: false, altKey: false } as const;

describe('SelectTool 双击进入顶点编辑', () => {
  it('双击命中 region → onEnterVertexEdit(objectId)', () => {
    const hook = vi.fn();
    const fx = setup(hook);
    fx.sceneManager.addObject(makeRegion('region_a'));
    fx.viewport.hit = 'region_a';

    fx.tool.onDoubleClick({ ...DBL });
    expect(hook).toHaveBeenCalledWith('region_a');
  });

  it('双击命中非 region 对象 / 空白 → 钩子不触发', () => {
    const hook = vi.fn();
    const fx = setup(hook);
    const model: ModelObject = {
      id: 'model_m',
      type: 'model',
      name: '模型',
      parentId: null,
      layerId: null,
      visible: true,
      locked: false,
      transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      properties: {},
      asset: { assetId: 'asset_tree' },
    };
    fx.sceneManager.addObject(model);
    fx.viewport.hit = 'model_m';
    fx.tool.onDoubleClick({ ...DBL });
    expect(hook).not.toHaveBeenCalled();

    fx.viewport.hit = null;
    fx.tool.onDoubleClick({ ...DBL });
    expect(hook).not.toHaveBeenCalled();
  });

  it('双击锁定对象 → 钩子不触发（锁定不可编辑）', () => {
    const hook = vi.fn();
    const fx = setup(hook);
    fx.sceneManager.addObject(makeRegion('region_locked', true));
    fx.viewport.hit = 'region_locked';
    fx.tool.onDoubleClick({ ...DBL });
    expect(hook).not.toHaveBeenCalled();
  });

  it('未注入钩子：双击安全无操作', () => {
    const fx = setup();
    fx.sceneManager.addObject(makeRegion('region_b'));
    fx.viewport.hit = 'region_b';
    expect(() => fx.tool.onDoubleClick({ ...DBL })).not.toThrow();
  });
});
