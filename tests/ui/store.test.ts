/**
 * tests/ui/store.test.ts —— zustand store 对 EventBus 的桥接测试。
 *
 * 覆盖：attach 初始同步（选中/历史/工具）；selection:changed / history:changed / tool:changed /
 *      scene:changed 驱动状态更新（scene:changed 每次递增 sceneVersion，重复事件幂等无害）；
 *      放置模式资产记账随 tool:changed(null) 清空；detach 后事件不再影响状态且 facade 置 null。
 * 边界：仅依赖 core/editor/app（bootstrap 无头装配），不涉及 React 渲染。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { ChangePropertyCommand } from '../../src/editor/commands/ChangePropertyCommand';
import { CreateObjectCommand } from '../../src/editor/commands/CreateObjectCommand';
import { createEditor } from '../../src/app/bootstrap';
import { createRegionObject } from '../../src/domain/regions';
import type { RegionObject } from '../../src/domain/regions';
import type { EditorHandle } from '../../src/app/bootstrap';
import { useEditorStore } from '../../src/ui/store';

/** region 探针：经 CreateObjectCommand 入场景（T6.7：v1 elements.create 夹具已删） */
function addRegion(facade: EditorHandle, name = '区域 1'): RegionObject {
  const region = createRegionObject({
    shape: {
      type: 'polygon',
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 3 },
      ],
      baseHeight: 0,
      closed: true,
    },
    name,
  });
  facade.history.execute(new CreateObjectCommand(region));
  return region;
}

describe('useEditorStore ↔ EventBus 桥接', () => {
  beforeEach(() => {
    useEditorStore.getState().detach();
  });

  it('attach 时按门面当前状态初始同步', () => {
    const eventBus = new EventBus();
    const facade = createEditor(null, { eventBus });
    const el = addRegion(facade);
    facade.selection.select(el.id);
    facade.tools.activate('select');

    useEditorStore.getState().attach(facade, eventBus);
    const s = useEditorStore.getState();
    expect(s.facade).toBe(facade);
    expect(s.selectedIds).toEqual([el.id]);
    expect(s.canUndo).toBe(true);
    expect(s.canRedo).toBe(false);
    expect(s.activeToolId).toBe('select');
    facade.dispose();
  });

  it('事件驱动：选中 / 历史 / 工具 / 场景版本号', () => {
    const eventBus = new EventBus();
    const facade = createEditor(null, { eventBus });
    useEditorStore.getState().attach(facade, eventBus);
    const v0 = useEditorStore.getState().sceneVersion;

    const el = addRegion(facade, '区域 2');
    expect(useEditorStore.getState().canUndo).toBe(true);
    expect(useEditorStore.getState().sceneVersion).toBeGreaterThan(v0);

    facade.selection.select(el.id);
    expect(useEditorStore.getState().selectedIds).toEqual([el.id]);

    const v1 = useEditorStore.getState().sceneVersion;
    facade.history.execute(new ChangePropertyCommand(el.id, { height: 20 }));
    expect(useEditorStore.getState().sceneVersion).toBeGreaterThan(v1); // 命令驱动 2 次 scene:changed：递增幂等无害

    facade.history.undo();
    expect(useEditorStore.getState().canRedo).toBe(true);

    facade.tools.activate('select');
    expect(useEditorStore.getState().activeToolId).toBe('select');
    facade.tools.deactivate();
    expect(useEditorStore.getState().activeToolId).toBeNull();
    facade.dispose();
  });

  it('放置模式资产记账：setPlacingAssetId 后 tool:changed(null) 自动清空', () => {
    const eventBus = new EventBus();
    const facade = createEditor(null, {
      eventBus,
      assets: [
        {
          id: 'asset_tree',
          name: '树',
          category: 'plant',
          file: 'x.glb',
          tags: [],
          defaultScale: { x: 1, y: 1, z: 1 },
          defaultRotation: { x: 0, y: 0, z: 0 },
        },
      ],
    });
    useEditorStore.getState().attach(facade, eventBus);

    useEditorStore.getState().setPlacingAssetId('asset_tree');
    facade.tools.activate('placement', { assetId: 'asset_tree' });
    expect(useEditorStore.getState().activeToolId).toBe('placement');
    expect(useEditorStore.getState().placingAssetId).toBe('asset_tree');

    facade.tools.cancel();
    expect(useEditorStore.getState().activeToolId).toBeNull();
    expect(useEditorStore.getState().placingAssetId).toBeNull();

    // 切到非放置工具同样清空
    useEditorStore.getState().setPlacingAssetId('asset_tree');
    facade.tools.activate('select');
    expect(useEditorStore.getState().placingAssetId).toBeNull();
    facade.dispose();
  });

  it('detach 后事件不再影响状态，facade 置 null', () => {
    const eventBus = new EventBus();
    const facade = createEditor(null, { eventBus });
    const off = useEditorStore.getState().attach(facade, eventBus);
    off();
    expect(useEditorStore.getState().facade).toBeNull();
    const before = useEditorStore.getState().sceneVersion;
    const el = addRegion(facade, '区域 3');
    facade.selection.select(el.id);
    expect(useEditorStore.getState().sceneVersion).toBe(before);
    expect(useEditorStore.getState().selectedIds).toEqual([]);
    facade.dispose();
  });

  it('services.camera 注入：面板可经 store 取相机 Port 聚焦；detach 后置空', () => {
    const eventBus = new EventBus();
    const facade = createEditor(null, { eventBus });
    const focused: string[][] = [];
    const camera = {
      getMode(): 'perspective' | 'top' | 'front' | 'side' {
        return 'perspective';
      },
      setMode(): void {},
      setOrthoLock(): void {},
      focusObjects(ids: string[]): void {
        focused.push([...ids]);
      },
      focusAll(): void {},
    };

    useEditorStore.getState().attach(facade, eventBus, { camera });
    const port = useEditorStore.getState().camera;
    expect(port).toBe(camera);
    port?.focusObjects(['element_x']);
    expect(focused).toEqual([['element_x']]);

    useEditorStore.getState().detach();
    expect(useEditorStore.getState().camera).toBeNull();

    // 未注入 services：camera 为 null（不抛错）
    useEditorStore.getState().attach(facade, eventBus);
    expect(useEditorStore.getState().camera).toBeNull();
    useEditorStore.getState().detach();
    facade.dispose();
  });

  it('services.session 注入（T5.7）：HUD/状态栏经 store 取视口会话服务；detach 后置空', () => {
    const eventBus = new EventBus();
    const facade = createEditor(null, { eventBus });
    useEditorStore.getState().attach(facade, eventBus, { session: facade });
    const session = useEditorStore.getState().session;
    expect(session).toBe(facade);
    expect(session?.getSceneName()).toBe('未命名场景');
    expect(session?.getViewportStats()).toEqual({ fps: 0, triangles: 0, drawCalls: 0 });
    expect(typeof session?.groundPoint).toBe('function');
    expect(session?.getEnvironment().preset).toBe('day');

    useEditorStore.getState().detach();
    expect(useEditorStore.getState().session).toBeNull();
    facade.dispose();
  });

  it('游标坐标与机位记账（T5.7）：setCursorPos / setCameraMode 写入，attach 复位缺省', () => {
    const eventBus = new EventBus();
    const facade = createEditor(null, { eventBus });
    useEditorStore.getState().attach(facade, eventBus);
    useEditorStore.getState().setCursorPos({ x: 1.5, y: 0, z: -2.5 });
    useEditorStore.getState().setCameraMode('top');
    expect(useEditorStore.getState().cursorPos).toEqual({ x: 1.5, y: 0, z: -2.5 });
    expect(useEditorStore.getState().cameraMode).toBe('top');

    // 离开画布清空 + 重挂复位
    useEditorStore.getState().setCursorPos(null);
    expect(useEditorStore.getState().cursorPos).toBeNull();
    useEditorStore.getState().setCameraMode('front');
    useEditorStore.getState().attach(facade, eventBus);
    expect(useEditorStore.getState().cameraMode).toBe('perspective');
    expect(useEditorStore.getState().cursorPos).toBeNull();
    useEditorStore.getState().detach();
    facade.dispose();
  });

  it('测量事件桥接（T10.2）：measure:changed → measureCount；attach 复位、detach 清零', () => {
    const eventBus = new EventBus();
    const facade = createEditor(null, { eventBus });
    useEditorStore.getState().attach(facade, eventBus);
    expect(useEditorStore.getState().measureCount).toBe(0);

    eventBus.emit('measure:changed', { count: 1 });
    expect(useEditorStore.getState().measureCount).toBe(1);
    eventBus.emit('measure:changed', { count: 3 });
    expect(useEditorStore.getState().measureCount).toBe(3);
    eventBus.emit('measure:changed', { count: 0 });
    expect(useEditorStore.getState().measureCount).toBe(0);

    // 重挂复位（上一会话残留不泄漏）
    eventBus.emit('measure:changed', { count: 2 });
    useEditorStore.getState().attach(facade, eventBus);
    expect(useEditorStore.getState().measureCount).toBe(0);

    useEditorStore.getState().detach();
    eventBus.emit('measure:changed', { count: 5 });
    expect(useEditorStore.getState().measureCount).toBe(0); // detach 后不再影响
    facade.dispose();
  });

  it('services.measure 注入（T10.2）：ContextToolbar 删除上一条/清除全部经 store 端口调用组合根会话', () => {
    const eventBus = new EventBus();
    const facade = createEditor(null, { eventBus });
    useEditorStore.getState().attach(facade, eventBus, { measure: facade.measure });
    const port = useEditorStore.getState().measure;
    expect(port).toBe(facade.measure); // MeasureSession 单例（组合根生命周期）

    // removeLast：空表 false；入两项后删一
    expect(port?.removeLast()).toBe(false);
    facade.measure.add({ id: 'measure_a', kind: 'distance', points: [], createdAt: 1 });
    facade.measure.add({ id: 'measure_b', kind: 'angle', points: [], createdAt: 2 });
    expect(port?.removeLast()).toBe(true);
    expect(useEditorStore.getState().measureCount).toBe(1); // measure:changed 桥接同步

    port?.clear();
    expect(facade.measure.list()).toHaveLength(0);
    expect(useEditorStore.getState().measureCount).toBe(0);

    useEditorStore.getState().detach();
    expect(useEditorStore.getState().measure).toBeNull(); // detach 后置空

    // 未注入 services：measure 为 null（不抛错）
    useEditorStore.getState().attach(facade, eventBus);
    expect(useEditorStore.getState().measure).toBeNull();
    useEditorStore.getState().detach();
    facade.dispose();
  });
});
