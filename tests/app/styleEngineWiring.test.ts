/**
 * tests/app/styleEngineWiring.test.ts —— 组合根样式引擎接线测试（T6.2）。
 *
 * 覆盖：
 * - bootstrap eager 收割插件 meta → facade.registries.presets（StylePresetRegistry）暴露给 ui；
 * - 引擎通知通道接线：setStyleNotifier → eventBus.emit('app:notify')（EventMap 2026-09-11 增补）；
 * - dispose 成对清理通知通道（clearStyleNotifier 条件清除，多实例共存安全）。
 * 边界：tests/app 路径禁 three 导入（check:layers 白名单），几何参数经 Parameters<> 间接引用类型。
 */
import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { createEditor } from '../../src/app/bootstrap';
import { createStyle, disposeStyle } from '../../src/runtime/styles/engine';
import { StylePresetRegistry } from '../../src/registries/StylePresetRegistry';

/**
 * 间接获得 BufferGeometry 类型（本测试文件禁 three 导入）；仅被 Mesh 持有，不触发渲染。
 * 桩需带 morphAttributes: {} —— Mesh 构造器 updateMorphTargets 会读该字段。
 */
type EngineGeometry = Parameters<typeof createStyle>[0];
const dummyGeometry = { morphAttributes: {} } as unknown as EngineGeometry;

describe('bootstrap 预设元数据收割（facade.registries.presets）', () => {
  it('presets 为 StylePresetRegistry，含三个内置插件 meta', () => {
    const facade = createEditor(null);
    expect(facade.registries.presets).toBeInstanceOf(StylePresetRegistry);
    const ids = facade.registries.presets.list().map((m) => m.id);
    expect(ids).toContain('default_solid');
    expect(ids).toContain('default_wireframe');
    expect(ids).toContain('test.shader');
    expect(facade.registries.presets.get('default_solid')?.name).toBeTypeOf('string');
    facade.dispose();
  });

  it('find 按 shape × semantic 可过滤（ui 灰显数据源）', () => {
    const facade = createEditor(null);
    const hits = facade.registries.presets.find('polygon', 'water');
    expect(hits.map((m) => m.id)).toContain('default_solid');
    expect(facade.registries.presets.find('polygon', 'nope' as never)).toEqual([]);
    facade.dispose();
  });
});

describe('引擎通知通道接线（app:notify Toast 通路）', () => {
  it('降级通知经 eventBus 发出 app:notify（kind=warn）', () => {
    const eventBus = new EventBus();
    const handler = vi.fn();
    const off = eventBus.on('app:notify', handler);
    const facade = createEditor(null, { eventBus });
    const instance = createStyle(dummyGeometry, 'polygon', 'unclassified', 'nope.preset');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'warn', message: expect.stringContaining('nope.preset') }),
    );
    disposeStyle(instance);
    facade.dispose();
    off();
  });

  it('dispose 成对清理通道：后续引擎通知不再打到已销毁编辑器的总线', () => {
    const eventBus = new EventBus();
    const handler = vi.fn();
    const off = eventBus.on('app:notify', handler);
    const facade = createEditor(null, { eventBus });
    facade.dispose();
    const instance = createStyle(dummyGeometry, 'polygon', 'unclassified', 'nope.preset');
    disposeStyle(instance);
    expect(handler).not.toHaveBeenCalled();
    off();
  });
});
