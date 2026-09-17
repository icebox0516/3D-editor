/**
 * tests/app/measureWiring.test.ts —— 测量域组合根装配测试（T10.1，先测后码）。
 *
 * 覆盖（任务清单 §5 + 四不变式之「会话态」）：
 * - 四测量工具注册 ToolRegistry（measure.distance/height/area/angle）经 ToolManager 可激活；
 * - MeasureSession 单例挂 EditorHandle（T10.2 UI 入口「清除全部/删除上一条」的调用端）；
 * - 端到端：注入 viewport.surfacePoint + measure Port fake → 点击/双击完成测量 →
 *   measure:changed 发出、Port 提交层刷新（组合根 measure:changed 订阅驱动）、
 *   会话入项；ESC 只弃草稿；
 * - saveScene 无测量痕迹：测量后保存 JSON 不含 measure_ id、objects/layers/environment
 *   零污染（会话态不入场景 JSON 的契约层断言）；
 * - dispose 成对退订 measure:changed 订阅（二次 add 不再触 Port）。
 */
import { describe, expect, it } from 'vitest';
import type { Vec3 } from '../../src/core/types';
import { EventBus } from '../../src/core/events/EventBus';
import type { MeasureDraft } from '../../src/editor/services/ports';
import type { MeasurePort } from '../../src/editor/services/ports';
import type { MeasureItem } from '../../src/editor/services/measure';
import { createEditor } from '../../src/app/bootstrap';

/** 记录型测量 Port fake */
class RecordingMeasurePort implements MeasurePort {
  readonly drafts: Array<MeasureDraft | null> = [];
  readonly measurements: Array<readonly MeasureItem[]> = [];
  clearCount = 0;

  updateDraft(draft: MeasureDraft | null): void {
    this.drafts.push(draft);
  }

  updateMeasurements(items: readonly MeasureItem[]): void {
    this.measurements.push(items);
  }

  clear(): void {
    this.clearCount += 1;
  }

  get lastMeasurements(): readonly MeasureItem[] | undefined {
    return this.measurements[this.measurements.length - 1];
  }
}

const pointerInfo = (x: number, y: number) => ({
  screenX: x,
  screenY: y,
  button: 'left' as const,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
});

describe('测量域组合根装配', () => {
  it('四测量工具注册并可激活；MeasureSession 单例挂 handle', () => {
    const facade = createEditor(null);
    const ids = facade.registries.tools.list().map((t) => t.id);
    for (const id of ['measure.distance', 'measure.height', 'measure.area', 'measure.angle']) {
      expect(ids).toContain(id);
      facade.tools.activate(id);
      expect(facade.tools.getActiveTool()!.id).toBe(id);
    }
    expect(facade.measure).toBeDefined();
    expect(typeof facade.measure.add).toBe('function');
    facade.dispose();
  });

  it('端到端：surfacePoint 拾取 → 双击完成 → 会话入项 + measure:changed + Port 提交层刷新', () => {
    const eventBus = new EventBus();
    const measure = new RecordingMeasurePort();
    const surface = new Map<string, Vec3>([
      ['10,10', { x: 0, y: 0, z: 0 }],
      ['20,20', { x: 3, y: 0, z: 4 }],
    ]);
    const facade = createEditor(null, {
      eventBus,
      ports: {
        viewport: {
          pickObject: () => null,
          groundPoint: () => null,
          surfacePoint: (x, y) => surface.get(`${x},${y}`) ?? null,
        },
        measure,
      },
    });
    const changed: number[] = [];
    eventBus.on('measure:changed', (p) => changed.push(p.count));

    facade.tools.activate('measure.distance');
    const tool = facade.tools.getActiveTool()!;
    tool.onPointerDown(pointerInfo(10, 10));
    tool.onPointerDown(pointerInfo(20, 20));
    tool.onDoubleClick?.(pointerInfo(20, 20));

    expect(facade.measure.list()).toHaveLength(1);
    expect(facade.measure.list()[0]!.kind).toBe('distance');
    expect(changed).toEqual([1]);
    // 组合根订阅：measure:changed → Port 提交层整组刷新（工具直推叠加，末次含 1 项）
    expect(measure.lastMeasurements).toHaveLength(1);
    expect(measure.drafts.at(-1)).toBeNull(); // 完成后草稿清空
    facade.dispose();
  });

  it('saveScene 无测量痕迹：测量后 JSON 不含 measure_、对象/图层/环境零污染', () => {
    const eventBus = new EventBus();
    const surface = new Map<string, Vec3>([
      ['10,10', { x: 0, y: 0, z: 0 }],
      ['20,20', { x: 5, y: 12, z: 0 }],
    ]);
    const facade = createEditor(null, {
      eventBus,
      ports: {
        viewport: {
          pickObject: () => null,
          groundPoint: () => null,
          surfacePoint: (x, y) => surface.get(`${x},${y}`) ?? null,
        },
        measure: new RecordingMeasurePort(),
      },
    });

    // 两类测量各完成一条（height 两击自动完成 + distance 双击）
    facade.tools.activate('measure.height');
    let tool = facade.tools.getActiveTool()!;
    tool.onPointerDown(pointerInfo(10, 10));
    tool.onPointerDown(pointerInfo(20, 20));
    facade.tools.activate('measure.distance');
    tool = facade.tools.getActiveTool()!;
    tool.onPointerDown(pointerInfo(10, 10));
    tool.onPointerDown(pointerInfo(20, 20));
    tool.onDoubleClick?.(pointerInfo(20, 20));
    expect(facade.measure.list()).toHaveLength(2);

    const json = facade.saveScene();
    expect(json).not.toContain('measure_');
    const data = JSON.parse(json);
    expect(data.objects).toEqual([]);
    expect(data.layers).toHaveLength(11);
    expect(data.environment).toEqual({ preset: 'day' });
    expect(facade.scene.getObjects()).toHaveLength(0);
    facade.dispose();
  });

  it('dispose 成对退订 measure:changed：卸载后 session.add 不再触 Port', () => {
    const eventBus = new EventBus();
    const measure = new RecordingMeasurePort();
    const facade = createEditor(null, { eventBus, ports: { measure } });
    facade.dispose();

    const before = measure.measurements.length;
    facade.measure.add({
      id: 'measure_x',
      kind: 'distance',
      points: [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
      ],
      createdAt: 1,
    });
    expect(measure.measurements.length).toBe(before); // 已退订：不再刷新
  });
});
