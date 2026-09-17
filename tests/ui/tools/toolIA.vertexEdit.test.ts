/**
 * tests/ui/tools/toolIA.vertexEdit.test.ts —— 顶点编辑 UI 入口与上下文条模型（T6.8）。
 *
 * 覆盖：
 * - contextToolsFor：vertex-edit 激活 → 中段提示段（拖动/插入/删除/退出操作指引）；
 *   非 vertex-edit（含 draw-*）时提示段为 null（与绘制中段互斥）；
 * - toggleVertexEdit：面板「编辑顶点」/ 双击共用入口——进入（携带 objectId 激活）→
 *   再触同一对象回选择工具（再次点击退出）→ 再触其它对象重开会话。
 * 边界：tests 路径禁 three；工具经 createEditor(null) 无头装配（port 桩语义已由
 * tests/editor/VertexEditTool.test.ts 覆盖，此处只测 UI 入口路由）。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { createEditor } from '../../../src/app/bootstrap';
import { createRegionObject } from '../../../src/domain/regions';
import { useEditorStore } from '../../../src/ui/store';
import {
  VERTEX_EDIT_TOOL_ID,
  contextToolsFor,
  toggleVertexEdit,
} from '../../../src/ui/tools/toolIA';

function resetStore(): void {
  const s = useEditorStore.getState();
  s.setDrawTarget(null);
  useEditorStore.setState({ lastAreaShape: 'polygon', lastAssetId: null });
}

beforeEach(resetStore);

/** contextToolsFor 状态最小输入 */
function state(activeToolId: string | null) {
  return { activeToolId, gizmoMode: 'translate' as const, snapEnabled: true, gridVisible: true };
}

describe('contextToolsFor（顶点编辑中段提示）', () => {
  it('vertex-edit 激活 → vertexEdit 提示段（含拖动/插入/删除/退出指引）', () => {
    const model = contextToolsFor(state(VERTEX_EDIT_TOOL_ID));
    expect(model.vertexEdit).not.toBeNull();
    const hint = model.vertexEdit!.hint;
    expect(hint).toContain('拖动');
    expect(hint).toContain('插入');
    expect(hint).toContain('Esc');
  });

  it('非 vertex-edit（select / draw-*）→ vertexEdit 段为 null（与绘制中段互斥）', () => {
    expect(contextToolsFor(state('select')).vertexEdit).toBeNull();
    expect(contextToolsFor(state('draw-polygon')).vertexEdit).toBeNull();
    expect(contextToolsFor(state(null)).vertexEdit).toBeNull();
  });
});

describe('toggleVertexEdit（面板按钮 / 双击共用入口）', () => {
  it('进入：激活 vertex-edit 携带目标；再触同一对象 → 回选择工具（再次点击退出）', () => {
    const facade = createEditor(null);
    const region = createRegionObject({
      shape: { type: 'polygon', points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 8 }], baseHeight: 0, closed: true },
    });
    facade.scene.addObject(region);

    toggleVertexEdit(facade.tools, region.id);
    expect(facade.tools.getActiveTool()?.id).toBe(VERTEX_EDIT_TOOL_ID);

    // 再次点击同一对象 → 退出回选择
    toggleVertexEdit(facade.tools, region.id);
    expect(facade.tools.getActiveTool()?.id).toBe('select');
    facade.dispose();
  });

  it('编辑中触达其它对象 → 重开会话（切换编辑目标）', () => {
    const facade = createEditor(null);
    const a = createRegionObject({
      shape: { type: 'polygon', points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 8 }], baseHeight: 0, closed: true },
    });
    const b = createRegionObject({
      shape: { type: 'line', points: [{ x: 0, y: 0 }, { x: 20, y: 4 }], baseHeight: 0, closed: false },
    });
    facade.scene.addObject(a);
    facade.scene.addObject(b);

    toggleVertexEdit(facade.tools, a.id);
    toggleVertexEdit(facade.tools, b.id);
    expect(facade.tools.getActiveTool()?.id).toBe(VERTEX_EDIT_TOOL_ID);
    // 再触 b（当前目标）→ 退出
    toggleVertexEdit(facade.tools, b.id);
    expect(facade.tools.getActiveTool()?.id).toBe('select');
    facade.dispose();
  });
});
