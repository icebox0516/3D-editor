/**
 * tests/runtime/MeasureOverlay.test.ts —— 测量覆盖层渲染测试（T10.1，先测后码）。
 *
 * 覆盖（stage10-measure §B 覆盖层渲染纪律 + MeasurePort 三方法）：
 * - 结构纪律：恒驻组 __measure_overlay__ + AUX_LAYER + depthTest:false + renderOrder 1001；
 * - updateDraft：distance 草稿折线（点列+游标）缓冲写入与 drawRange；null 清草稿；
 * - area 草稿为闭合环（首点回环写入）；angle 草稿 A-B-游标 链；
 * - updateMeasurements：已提交项整组替换、与草稿互不影响、空数组隐藏已提交层；
 * - clear：草稿+已提交全清（组隐藏）；
 * - 池化：重复更新不新建对象（组子数稳定，写缓冲不重建）；
 * - frame：端点标记屏幕恒定 4px（透视相机距离自适应）；标签屏幕恒定字号；
 * - 标签 canvas 纹理：文字变更才重绘（fillText 调用计数）；标签内容按 kind
 *   （段长/总长 Σ/三读数/面积 m²/角度 °，两位小数）——经 document stub 断言。
 * 环境：node（无 WebGL；标签路径经 document stub，无 stub 时标签跳过——PreviewManager 先例）。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import type { MeasureKind, Vec3 } from '../../src/core/types';
import type { MeasureItem } from '../../src/editor/services/measure';
import { MeasureOverlay } from '../../src/runtime/services/MeasureOverlay';
import { AUX_LAYER } from '../../src/runtime/RenderModeState';

const V = (x: number, y: number, z: number): Vec3 => ({ x, y, z });

function makeItem(kind: MeasureKind, points: Vec3[]): MeasureItem {
  return { id: `measure_t${Math.random().toString(36).slice(2, 8)}`, kind, points, createdAt: Date.now() };
}

/** 组内全部节点（含组自身）均在 AUX_LAYER */
function assertAuxLayer(root: THREE.Object3D): void {
  root.traverse((node) => {
    expect(node.layers.mask, `${node.name || node.type} 应在 AUX_LAYER`).toBe(1 << AUX_LAYER);
  });
}

/** document stub（标签 canvas 路径）：记录 fillText/measureText */
function stubDocument() {
  const fillText = vi.fn();
  const measureText = vi.fn((t: string) => ({ width: t.length * 10 }));
  const ctx = {
    font: '',
    textBaseline: '',
    fillStyle: '',
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillText,
    measureText,
  };
  const makeCanvas = () => ({
    width: 0,
    height: 0,
    getContext: () => ctx,
  });
  const doc = {
    createElement: (tag: string) => (tag === 'canvas' ? makeCanvas() : {}),
  };
  vi.stubGlobal('document', doc);
  return { fillText, measureText };
}

/** 池内 Line 的位置缓冲转点列（截取 drawRange） */
function linePoints(line: THREE.Line): Vec3[] {
  const attr = line.geometry.getAttribute('position') as THREE.BufferAttribute;
  const count = line.geometry.drawRange.count;
  const out: Vec3[] = [];
  for (let i = 0; i < count; i++) out.push({ x: attr.getX(i), y: attr.getY(i), z: attr.getZ(i) });
  return out;
}

describe('MeasureOverlay 结构纪律（恒驻组 + AUX + 置顶）', () => {
  it('组名 __measure_overlay__、初始隐藏、整树 AUX_LAYER、depthTest:false、renderOrder 1001', () => {
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);

    const group = scene.children.find((c) => c.name === '__measure_overlay__');
    expect(group).toBeDefined();
    expect(group!.visible).toBe(false);
    overlay.updateDraft({ kind: 'distance', points: [V(0, 0, 0), V(3, 0, 4)], cursor: V(3, 0, 0) });
    expect(group!.visible).toBe(true);

    assertAuxLayer(group!);
    const line = group!.children.find((c) => c instanceof THREE.Line) as THREE.Line;
    expect(line).toBeDefined();
    expect((line.material as THREE.LineBasicMaterial).depthTest).toBe(false);
    expect(line.renderOrder).toBe(1001);
    const sprite = group!.children.find((c) => c instanceof THREE.Sprite) as THREE.Sprite;
    expect(sprite).toBeDefined();
    expect((sprite.material as THREE.SpriteMaterial).depthTest).toBe(false);
    expect(sprite.renderOrder).toBe(1001);
    overlay.dispose();
  });
});

describe('MeasureOverlay updateDraft（草稿缓冲写入）', () => {
  it('distance 草稿：折线 = 已固定点 + 游标（drawRange 3）', () => {
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    overlay.updateDraft({ kind: 'distance', points: [V(0, 0, 0), V(3, 0, 4)], cursor: V(3, 12, 4) });

    const group = scene.children.find((c) => c.name === '__measure_overlay__')!;
    const line = group.children.find((c) => c instanceof THREE.Line) as THREE.Line;
    expect(linePoints(line)).toEqual([V(0, 0, 0), V(3, 0, 4), V(3, 12, 4)]);
    overlay.dispose();
  });

  it('area 草稿：闭合环（首点回环写入末尾，drawRange = n+1）', () => {
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    const ring = [V(0, 0, 0), V(4, 0, 0), V(4, 0, 3)];
    overlay.updateDraft({ kind: 'area', points: ring, cursor: V(0, 0, 3) });

    const group = scene.children.find((c) => c.name === '__measure_overlay__')!;
    const line = group.children.find((c) => c instanceof THREE.Line) as THREE.Line;
    expect(linePoints(line)).toEqual([...ring, V(0, 0, 3), V(0, 0, 0)]); // 点列+游标+回环
    overlay.dispose();
  });

  it('angle 草稿：链 = A-B-游标（第 2 点为角点）；1 固定点时弹性段 A→游标', () => {
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    overlay.updateDraft({ kind: 'angle', points: [V(1, 0, 0), V(0, 0, 0)], cursor: V(0, 0, 1) });

    const group = scene.children.find((c) => c.name === '__measure_overlay__')!;
    const line = group.children.find((c) => c instanceof THREE.Line) as THREE.Line;
    expect(linePoints(line)).toEqual([V(1, 0, 0), V(0, 0, 0), V(0, 0, 1)]);

    // 定 B 前的弹性段：A→游标（实时预览随游标）
    overlay.updateDraft({ kind: 'angle', points: [V(1, 0, 0)], cursor: V(2, 0, 3) });
    expect(linePoints(line)).toEqual([V(1, 0, 0), V(2, 0, 3)]);
    overlay.dispose();
  });

  it('height 草稿：两点链（固定点 + 游标）', () => {
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    overlay.updateDraft({ kind: 'height', points: [V(0, 0, 0)], cursor: V(5, 12, 0) });

    const group = scene.children.find((c) => c.name === '__measure_overlay__')!;
    const line = group.children.find((c) => c instanceof THREE.Line) as THREE.Line;
    expect(linePoints(line)).toEqual([V(0, 0, 0), V(5, 12, 0)]);
    overlay.dispose();
  });

  it('端点标记：固定点 + 游标各一枚（4 枚可见 Sprite）', () => {
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    overlay.updateDraft({ kind: 'distance', points: [V(0, 0, 0), V(3, 0, 4)], cursor: V(3, 12, 4) });

    const group = scene.children.find((c) => c.name === '__measure_overlay__')!;
    // 标记 center 默认 (0.5,0.5)；标签 center (0.5,0)（底边锚定）——以此区分池单元
    const markers = group.children.filter(
      (c) => c instanceof THREE.Sprite && c.center.y === 0.5,
    );
    expect(markers).toHaveLength(3); // 2 固定点 + 1 游标
    overlay.dispose();
  });

  it('updateDraft(null)：清草稿（组隐藏）', () => {
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    overlay.updateDraft({ kind: 'distance', points: [V(0, 0, 0), V(3, 0, 4)], cursor: null });
    overlay.updateDraft(null);
    expect(scene.children.find((c) => c.name === '__measure_overlay__')!.visible).toBe(false);
    overlay.dispose();
  });
});

describe('MeasureOverlay updateMeasurements（已提交层）', () => {
  it('整组替换：已提交项折线写入；与草稿互不影响', () => {
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    overlay.updateMeasurements([makeItem('distance', [V(0, 0, 0), V(3, 0, 4)])]);
    overlay.updateDraft({ kind: 'height', points: [V(10, 0, 0)], cursor: V(10, 5, 0) });

    const group = scene.children.find((c) => c.name === '__measure_overlay__')!;
    const lines = group.children.filter((c) => c instanceof THREE.Line);
    expect(lines).toHaveLength(2); // 1 已提交 + 1 草稿
    const chains = lines.map(linePoints);
    expect(chains).toContainEqual([V(0, 0, 0), V(3, 0, 4)]);
    expect(chains).toContainEqual([V(10, 0, 0), V(10, 5, 0)]);

    // 清草稿不动已提交
    overlay.updateDraft(null);
    const linesAfter = group.children.filter((c) => c instanceof THREE.Line);
    expect(linesAfter.filter((l) => l.visible)).toHaveLength(1);
    expect(linePoints(linesAfter.find((l) => l.visible)!)).toEqual([V(0, 0, 0), V(3, 0, 4)]);

    // 空数组 = 隐藏已提交层
    overlay.updateMeasurements([]);
    expect(linesAfter.filter((l) => l.visible)).toHaveLength(0);
    expect(group.visible).toBe(false);
    overlay.dispose();
  });

  it('多项共存：每项一条折线', () => {
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    overlay.updateMeasurements([
      makeItem('distance', [V(0, 0, 0), V(3, 0, 4)]),
      makeItem('angle', [V(1, 0, 0), V(0, 0, 0), V(0, 0, 1)]),
    ]);
    const group = scene.children.find((c) => c.name === '__measure_overlay__')!;
    expect(group.children.filter((c) => c instanceof THREE.Line)).toHaveLength(2);
    overlay.dispose();
  });
});

describe('MeasureOverlay clear 与池化', () => {
  it('clear：草稿 + 已提交全清（组隐藏）', () => {
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    overlay.updateMeasurements([makeItem('distance', [V(0, 0, 0), V(3, 0, 4)])]);
    overlay.updateDraft({ kind: 'area', points: [V(0, 0, 0)], cursor: V(1, 0, 1) });
    overlay.clear();
    const group = scene.children.find((c) => c.name === '__measure_overlay__')!;
    expect(group.visible).toBe(false);
    expect(group.children.filter((c) => c.visible)).toHaveLength(0);
    overlay.dispose();
  });

  it('池化：同规模重复更新不新建对象（组子数稳定，仅改写缓冲）', () => {
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    overlay.updateDraft({ kind: 'distance', points: [V(0, 0, 0)], cursor: V(3, 0, 4) });
    const group = scene.children.find((c) => c.name === '__measure_overlay__')!;
    const childrenBefore = group.children.length;
    const lineBefore = group.children.find((c) => c instanceof THREE.Line);

    overlay.updateDraft({ kind: 'distance', points: [V(10, 0, 0)], cursor: V(13, 0, 4) });
    overlay.updateDraft({ kind: 'distance', points: [V(20, 0, 0)], cursor: V(23, 0, 4) });

    expect(group.children.length).toBe(childrenBefore);
    const lineAfter = group.children.find((c) => c instanceof THREE.Line);
    expect(lineAfter).toBe(lineBefore); // 同一池对象复用
    expect(linePoints(lineAfter as THREE.Line)).toEqual([V(20, 0, 0), V(23, 0, 4)]);
    overlay.dispose();
  });
});

describe('MeasureOverlay frame（屏幕恒定尺寸）', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('端点标记 4px 屏幕恒定：透视相机按距离自适应（两标记距离不同、屏幕尺寸相同）', () => {
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    // 相机原点正对 -z：近标记 z=-10、远标记 z=-40（同射线距离 10/40）
    overlay.updateDraft({ kind: 'distance', points: [V(0, 0, -10), V(0, 0, -40)], cursor: null });

    const camera = new THREE.PerspectiveCamera(50, 800 / 600, 0.1, 10000);
    camera.position.set(0, 0, 0);
    camera.lookAt(new THREE.Vector3(0, 0, -1));
    camera.updateMatrixWorld(true);

    overlay.frame(camera, 600);

    const group = scene.children.find((c) => c.name === '__measure_overlay__')!;
    // 标记 center 默认 (0.5,0.5)；标签 center (0.5,0)——按标记筛选（frame 只缩放激活标记）
    const sprites = group.children.filter(
      (c) => c instanceof THREE.Sprite && c.center.y === 0.5,
    ) as THREE.Sprite[];
    expect(sprites).toHaveLength(2);
    const worldPerPx = (2 * Math.tan((50 * Math.PI) / 360)) / 600;
    const expectedNear = 4 * worldPerPx * 10;
    const expectedFar = 4 * worldPerPx * 40;
    expect(sprites[0]!.scale.x).toBeCloseTo(expectedNear, 8);
    expect(sprites[1]!.scale.x).toBeCloseTo(expectedFar, 8);
    // 屏幕尺寸恒等：世界尺寸/距离 比值一致
    expect(sprites[0]!.scale.x / 10).toBeCloseTo(sprites[1]!.scale.x / 40, 8);
    overlay.dispose();
  });

  it('正交相机：worldPerPx 取视高比（标记尺寸与距离无关）', () => {
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    overlay.updateDraft({ kind: 'distance', points: [V(0, 0, -10), V(0, 0, -40)], cursor: null });
    const camera = new THREE.OrthographicCamera(-400, 400, 300, -300, 0.1, 10000);
    camera.position.set(0, 0, 0);
    camera.lookAt(new THREE.Vector3(0, 0, -1));
    camera.updateMatrixWorld(true);

    overlay.frame(camera, 600);

    const group = scene.children.find((c) => c.name === '__measure_overlay__')!;
    const sprites = group.children.filter(
      (c) => c instanceof THREE.Sprite && c.center.y === 0.5,
    ) as THREE.Sprite[];
    const expected = 4 * (600 / 600) * 10; // top-bottom=600 → worldPerPx=1；dist=10
    expect(sprites[0]!.scale.x).toBeCloseTo(expected, 8);
    overlay.dispose();
  });
});

describe('MeasureOverlay 标签（canvas 纹理，文字变更才重绘）', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('distance 草稿标签：段长（中点）+ 总长 Σ（末点），两位小数', () => {
    const { fillText } = stubDocument();
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    overlay.updateDraft({ kind: 'distance', points: [V(0, 0, 0), V(3, 0, 4)], cursor: V(3, 0, 4) });

    const texts = fillText.mock.calls.map((c) => c[0] as string);
    expect(texts).toContain('5.00 m'); // 段 (0,0,0)→(3,0,4)
    expect(texts).toContain('Σ 5.00 m'); // 总长（游标与末点重合：累计 5）
    overlay.dispose();
  });

  it('height 标签：三读数（空间/水平/ΔH）', () => {
    const { fillText } = stubDocument();
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    overlay.updateDraft({ kind: 'height', points: [V(0, 0, 0)], cursor: V(5, 12, 0) });

    const texts = fillText.mock.calls.map((c) => c[0] as string);
    expect(texts.some((t) => t.includes('13.00 m') && t.includes('5.00 m') && t.includes('12.00 m'))).toBe(true);
    overlay.dispose();
  });

  it('area 标签：水平投影面积 m²', () => {
    const { fillText } = stubDocument();
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    overlay.updateDraft({
      kind: 'area',
      points: [V(0, 0, 0), V(3, 0, 0)],
      cursor: V(0, 9, 4),
    });

    const texts = fillText.mock.calls.map((c) => c[0] as string);
    expect(texts.some((t) => t.includes('6.00 m²'))).toBe(true);
    overlay.dispose();
  });

  it('angle 标签：∠ABC 度数（°）', () => {
    const { fillText } = stubDocument();
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    overlay.updateDraft({ kind: 'angle', points: [V(1, 0, 0), V(0, 0, 0)], cursor: V(0, 0, 1) });

    const texts = fillText.mock.calls.map((c) => c[0] as string);
    expect(texts.some((t) => t.includes('90.00°'))).toBe(true);
    overlay.dispose();
  });

  it('文字未变更不重绘：同草稿重复 update → fillText 计数不增；变更后 +1', () => {
    const { fillText } = stubDocument();
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    const draft = { kind: 'distance' as const, points: [V(0, 0, 0), V(3, 0, 4)], cursor: V(3, 0, 4) };
    overlay.updateDraft(draft);
    const afterFirst = fillText.mock.calls.length;
    expect(afterFirst).toBeGreaterThan(0);

    overlay.updateDraft({ ...draft, points: [...draft.points], cursor: { ...draft.cursor! } });
    expect(fillText.mock.calls.length).toBe(afterFirst); // 同文字零重绘

    overlay.updateDraft({ ...draft, cursor: V(3, 3, 4) }); // 新读数 → 重绘
    expect(fillText.mock.calls.length).toBeGreaterThan(afterFirst);
    overlay.dispose();
  });

  it('已提交项标签随 updateMeasurements 呈现（清除后隐藏）', () => {
    stubDocument();
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    overlay.updateMeasurements([makeItem('distance', [V(0, 0, 0), V(3, 0, 4)])]);
    const group = scene.children.find((c) => c.name === '__measure_overlay__')!;
    const labels = group.children.filter((c) => c instanceof THREE.Sprite);
    expect(labels.length).toBeGreaterThan(0); // 端点标记 + 标签

    overlay.updateMeasurements([]);
    expect(labels.every((l) => !l.visible)).toBe(true);
    overlay.dispose();
  });

  it('dispose：组移出场景（全释放路径可执行不抛错）', () => {
    stubDocument();
    const scene = new THREE.Scene();
    const overlay = new MeasureOverlay(scene);
    overlay.updateMeasurements([makeItem('area', [V(0, 0, 0), V(4, 0, 0), V(4, 0, 3)])]);
    overlay.updateDraft({ kind: 'distance', points: [V(0, 0, 0)], cursor: V(1, 0, 0) });
    expect(() => overlay.dispose()).not.toThrow();
    expect(scene.children.find((c) => c.name === '__measure_overlay__')).toBeUndefined();
  });
});
