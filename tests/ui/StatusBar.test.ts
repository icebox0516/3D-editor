/**
 * tests/ui/StatusBar.test.ts —— 绘制状态栏数据流测试（自 T3.3 DrawPanel.test 迁入，
 * T5.6 DrawPanel 退役后独立归档；describeDrawStatus 为 StatusBar 导出的纯函数）。
 *
 * 覆盖：
 * - draw:status 事件 payload → store.drawStatus → describeDrawStatus 读数段
 *   （长度/面积/坐标/错误提示）；空载荷复位；
 * - 数值格式化：最多两位小数、去尾零；错误段单独呈现；
 * - detach 后 draw:status 不再影响 store。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import { createEditor } from '../../src/app/bootstrap';
import { useEditorStore } from '../../src/ui/store';
import { describeDrawStatus, describeMeasureStatus } from '../../src/ui/components/StatusBar';

describe('StatusBar 数据流（draw:status → store → 渲染描述）', () => {
  beforeEach(() => {
    useEditorStore.getState().detach();
  });

  it('事件 payload 进 store；describeDrawStatus 产出长度/面积/坐标读数段', () => {
    const eventBus = new EventBus();
    const facade = createEditor(null, { eventBus });
    useEditorStore.getState().attach(facade, eventBus);

    eventBus.emit('draw:status', { length: 12.5, area: 30.25, cursor: { x: 3, y: -4 } });
    const state = useEditorStore.getState();
    expect(state.drawStatus).toEqual({ length: 12.5, area: 30.25, cursor: { x: 3, y: -4 } });
    expect(describeDrawStatus(state.drawStatus)).toEqual([
      { kind: 'length', label: '长度', value: '12.5 m' },
      { kind: 'area', label: '面积', value: '30.25 m²' },
      { kind: 'cursor', label: '坐标', value: 'X 3 · Z -4' },
    ]);

    // 完成后空载荷 {} 复位状态栏
    eventBus.emit('draw:status', {});
    expect(useEditorStore.getState().drawStatus).toEqual({});
    expect(describeDrawStatus(useEditorStore.getState().drawStatus)).toEqual([]);
    useEditorStore.getState().detach();
    facade.dispose();
  });

  it('数值格式化：最多两位小数、去尾零；错误段单独呈现', () => {
    expect(describeDrawStatus({ length: 12.345, cursor: { x: 0.1 + 0.2, y: 100 } })).toEqual([
      { kind: 'length', label: '长度', value: '12.35 m' },
      { kind: 'cursor', label: '坐标', value: 'X 0.3 · Z 100' },
    ]);
    expect(describeDrawStatus({ error: '多边形自相交，请调整顶点' })).toEqual([
      { kind: 'error', label: '拦截', value: '多边形自相交，请调整顶点' },
    ]);
    expect(describeDrawStatus(null)).toEqual([]);
  });

  it('顶点读数段（T6.5 七形状）：vertexCount 呈现在面积后坐标前；缺省不占位', () => {
    expect(
      describeDrawStatus({ length: 8, area: 3, vertexCount: 64, cursor: { x: 1, y: 2 } }),
    ).toEqual([
      { kind: 'length', label: '长度', value: '8 m' },
      { kind: 'area', label: '面积', value: '3 m²' },
      { kind: 'vertex', label: '顶点', value: '64' },
      { kind: 'cursor', label: '坐标', value: 'X 1 · Z 2' },
    ]);
    // 无 vertexCount（如纯游标载荷）不产出顶点段
    expect(describeDrawStatus({ length: 5 }).some((s) => s.kind === 'vertex')).toBe(false);
  });

  it('detach 后 draw:status 不再影响 store', () => {
    const eventBus = new EventBus();
    const facade = createEditor(null, { eventBus });
    useEditorStore.getState().attach(facade, eventBus);
    useEditorStore.getState().detach();

    eventBus.emit('draw:status', { length: 5 });
    expect(useEditorStore.getState().drawStatus).toBeNull();
    facade.dispose();
  });
});

describe('StatusBar 测量读数段（measure:status → store → describeMeasureStatus，T10.2）', () => {
  beforeEach(() => {
    useEditorStore.getState().detach();
  });

  it('distance：段长 / 总长 / 游标三维坐标（定宽两位小数）', () => {
    expect(
      describeMeasureStatus({
        kind: 'distance',
        segment: 3.5,
        total: 12.25,
        cursor: { x: 1.234, y: 5.6, z: -7.89 },
      }),
    ).toEqual([
      { kind: 'segment', label: '段长', value: '3.5 m' },
      { kind: 'total', label: '总长', value: '12.25 m' },
      { kind: 'cursor', label: '坐标', value: 'X 1.23 · Y 5.60 · Z -7.89' },
    ]);
  });

  it('height：三读数（空间 / 水平 / ΔH 可负）', () => {
    expect(
      describeMeasureStatus({
        kind: 'height',
        segment: 5,
        horizontal: 3,
        dh: -4,
        cursor: { x: 0, y: 0, z: 0 },
      }),
    ).toEqual([
      { kind: 'spatial', label: '空间', value: '5 m' },
      { kind: 'horizontal', label: '水平', value: '3 m' },
      { kind: 'dh', label: 'ΔH', value: '-4 m' },
      { kind: 'cursor', label: '坐标', value: 'X 0.00 · Y 0.00 · Z 0.00' },
    ]);
  });

  it('area：面积（m²）；angle：角度（度）', () => {
    expect(describeMeasureStatus({ kind: 'area', area: 42.5 })).toEqual([
      { kind: 'area', label: '面积', value: '42.5 m²' },
    ]);
    expect(describeMeasureStatus({ kind: 'angle', angle: 90.125 })).toEqual([
      { kind: 'angle', label: '角度', value: '90.13°' },
    ]);
  });

  it('error 拦截提示居末；随正常状态载荷自然清除', () => {
    expect(describeMeasureStatus({ kind: 'area', error: '顶点共线，无法围成面积' })).toEqual([
      { kind: 'error', label: '拦截', value: '顶点共线，无法围成面积' },
    ]);
    // 下一次正常状态（复位后新读数）不再携带 error
    expect(describeMeasureStatus({ kind: 'area', area: 1 }).some((s) => s.kind === 'error')).toBe(false);
  });

  it('复位载荷（仅含 kind）清段；null 清段；缺失字段不占位', () => {
    expect(describeMeasureStatus({ kind: 'distance' })).toEqual([]);
    expect(describeMeasureStatus(null)).toEqual([]);
    expect(describeMeasureStatus({ kind: 'height' })).toEqual([]); // 无三读数字段
  });

  it('事件桥接：measure:status → store.measureStatus（与 drawStatus 并行独立）', () => {
    const eventBus = new EventBus();
    const facade = createEditor(null, { eventBus });
    useEditorStore.getState().attach(facade, eventBus);

    eventBus.emit('measure:status', { kind: 'angle', angle: 45 });
    expect(useEditorStore.getState().measureStatus).toEqual({ kind: 'angle', angle: 45 });
    eventBus.emit('measure:status', { kind: 'angle' }); // 复位载荷
    expect(useEditorStore.getState().measureStatus).toEqual({ kind: 'angle' });
    expect(describeMeasureStatus(useEditorStore.getState().measureStatus)).toEqual([]);
    useEditorStore.getState().detach();

    eventBus.emit('measure:status', { kind: 'angle', angle: 45 });
    expect(useEditorStore.getState().measureStatus).toBeNull(); // detach 后不再影响
    facade.dispose();
  });
});
