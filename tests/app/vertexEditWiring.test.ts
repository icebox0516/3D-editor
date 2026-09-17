/**
 * tests/app/vertexEditWiring.test.ts —— 组合根顶点编辑接线（T6.8）。
 *
 * 覆盖（无头形态可达部分；浏览器形态的句柄层/吸附管线接线归视觉验收）：
 * - vertex-edit 工具经组合根注册（ToolManager 激活可达 + ToolRegistry 暴露给 ui）；
 * - 无头（port 桩）：activate 携带 objectId 建立会话、cancel 退出、tool:changed 广播。
 * 边界：tests/app 路径禁 three 导入（check:layers 白名单）。
 */
import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { createEditor } from '../../src/app/bootstrap';
import { createRegionObject } from '../../src/domain/regions';

describe('bootstrap 顶点编辑接线', () => {
  it('vertex-edit 已注册：ToolRegistry 暴露且 activate 可达', () => {
    const facade = createEditor(null);
    const ids = facade.registries.tools.list().map((t) => t.id);
    expect(ids).toContain('vertex-edit');

    const region = createRegionObject({
      shape: {
        type: 'polygon',
        points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 8 }],
        baseHeight: 0,
        closed: true,
      },
    });
    facade.scene.addObject(region);
    facade.tools.activate('vertex-edit', { objectId: region.id });
    expect(facade.tools.getActiveTool()?.id).toBe('vertex-edit');
    facade.tools.cancel();
    expect(facade.tools.getActiveTool()).toBeNull();
    facade.dispose();
  });

  it('tool:changed 广播：激活/退出携带 vertex-edit / null（UI 按钮态与自动回选择数据源）', () => {
    const eventBus = new EventBus();
    const seen: Array<string | null> = [];
    const off = eventBus.on('tool:changed', (p) => seen.push(p.toolId));
    const facade = createEditor(null, { eventBus });
    const region = createRegionObject({
      shape: {
        type: 'line',
        points: [{ x: 0, y: 0 }, { x: 12, y: 3 }],
        baseHeight: 0,
        closed: false,
      },
    });
    facade.scene.addObject(region);
    facade.tools.activate('vertex-edit', { objectId: region.id });
    facade.tools.cancel();
    expect(seen).toContain('vertex-edit');
    expect(seen).toContain(null);
    facade.dispose();
    off();
    void vi; // 保持 import 形态一致（无 spy 用例时无害）
  });
});
