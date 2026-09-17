/**
 * tests/editor/tools/measure/fakes —— 测量工具测试共用装置（非测试文件，vitest 不收集）。
 *
 * 提供：FakeSurfaceViewport（屏幕坐标 → 预置表面拾取点）、FakeMeasureOverlay（记录
 * updateDraft/updateMeasurements/clear）、事件构造（pointer/key/ESC）。
 * 装配（fullSetup）在各测试文件内完成——工具构造需持 session/overlay 引用，
 * 装配函数以工厂参数接收（沿 tests/editor/draw/fakes 形态，零 three）。
 */
import type { Vec3 } from '../../../../src/core/types';
import type {
  KeyboardEventInfo,
  MeasureDraft,
  MeasurePort,
  PointerEventInfo,
  ViewportPort,
} from '../../../../src/editor/services/ports';
import type { MeasureItem } from '../../../../src/editor/services/measure';

// ── Fake Port ─────────────────────────────────────────────

/** 预置表面拾取点的 Fake 视口：surfacePoint 按屏幕坐标查表，缺省返回 surfaceDefault（null） */
export class FakeSurfaceViewport implements ViewportPort {
  private readonly surfaceAt = new Map<string, Vec3 | null>();
  surfaceDefault: Vec3 | null = null;

  setSurface(x: number, y: number, p: Vec3 | null): void {
    this.surfaceAt.set(`${x},${y}`, p);
  }

  pickObject(): null {
    return null;
  }

  groundPoint(): null {
    return null;
  }

  surfacePoint(x: number, y: number): Vec3 | null {
    const stored = this.surfaceAt.get(`${x},${y}`);
    return stored === undefined ? this.surfaceDefault : stored; // 显式 null 是合法返回值
  }
}

/** 记录型测量覆盖层 Fake：草稿/已提交/清场调用全留痕 */
export class FakeMeasureOverlay implements MeasurePort {
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

  get lastDraft(): MeasureDraft | null | undefined {
    return this.drafts[this.drafts.length - 1];
  }

  get lastMeasurements(): readonly MeasureItem[] | undefined {
    return this.measurements[this.measurements.length - 1];
  }
}

// ── 事件构造 ──────────────────────────────────────────────

export function pointer(
  x: number,
  y: number,
  overrides: Partial<PointerEventInfo> = {},
): PointerEventInfo {
  return {
    screenX: x,
    screenY: y,
    button: 'left',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...overrides,
  };
}

export function key(k: string, overrides: Partial<KeyboardEventInfo> = {}): KeyboardEventInfo {
  return { key: k, ctrlKey: false, shiftKey: false, altKey: false, ...overrides };
}

export const ESC = key('Escape');
