/**
 * tests/ui/hud/hudModel.test.ts —— HUD/状态栏读数格式化纯函数测试（T5.7，先测后码）。
 *
 * 覆盖（任务书「读数格式化纯函数：三角面 K/M 缩写、坐标定宽」+ 环境扩展键归一）：
 * - formatTriangles：<1000 原值；k 档一位小数；M 档至多两位小数去尾零（1.28M / 12.5M / 1M）；
 * - formatAxisCoord / describeCursor：定宽两位小数（改值不抖动）、null → 全 —；
 * - formatCameraMode / RENDER_MODES / CAMERA_MODES：机位与渲染模式显示名表；
 * - describeViewportMetrics：Objects/Triangles/FPS/Unit 右段读数段派生；
 * - coerceRenderMode / coerceSceneAxes（scene 层单一真相源）：非法/缺省回退缺省值。
 */
import { describe, expect, it } from 'vitest';
import type { Vec3 } from '../../../src/core/types';
import {
  CAMERA_MODES,
  DIAGNOSTIC_RENDER_MODES,
  RENDER_MODES,
  countUnclassified,
  describeCursor,
  describeIslandCount,
  describeViewportMetrics,
  formatAxisCoord,
  formatCameraMode,
  formatRenderMode,
  formatTriangles,
} from '../../../src/ui/hud/hudModel';
import {
  coerceRenderMode,
  coerceSceneAxes,
  isDiagnosticRenderMode,
} from '../../../src/scene/SceneData';

describe('formatTriangles：K/M 缩写', () => {
  it('小于 1000 显示原值', () => {
    expect(formatTriangles(0)).toBe('0');
    expect(formatTriangles(7)).toBe('7');
    expect(formatTriangles(999)).toBe('999');
  });

  it('k 档：一位小数（X.Xk）', () => {
    expect(formatTriangles(1000)).toBe('1.0k');
    expect(formatTriangles(1500)).toBe('1.5k');
    expect(formatTriangles(12345)).toBe('12.3k');
    expect(formatTriangles(999999)).toBe('1000.0k'); // 未达 M 档保持 k 口径
  });

  it('M 档：至多两位小数、去尾零（需求示例 1.28M）', () => {
    expect(formatTriangles(1280000)).toBe('1.28M');
    expect(formatTriangles(12500000)).toBe('12.5M');
    expect(formatTriangles(2500000)).toBe('2.5M');
    expect(formatTriangles(1000000)).toBe('1M');
  });

  it('非有限数按 0 处理（渲染未就绪兜底）', () => {
    expect(formatTriangles(Number.NaN)).toBe('0');
  });
});

describe('formatAxisCoord / describeCursor：坐标定宽', () => {
  it('定宽两位小数（等宽 tabular 数值列纵向对齐）', () => {
    expect(formatAxisCoord(0)).toBe('0.00');
    expect(formatAxisCoord(124.512)).toBe('124.51');
    expect(formatAxisCoord(-18.2)).toBe('-18.20');
    expect(formatAxisCoord(0.005)).toBe('0.01');
  });

  it('describeCursor：null → 三轴全 —（离开画布复位）', () => {
    expect(describeCursor(null)).toEqual({ x: '—', y: '—', z: '—' });
  });

  it('describeCursor：地面投影 Y 恒 0.00、X/Z 原样定宽', () => {
    const ground: Vec3 = { x: 124.512, y: 0, z: -18.2 };
    expect(describeCursor(ground)).toEqual({ x: '124.51', y: '0.00', z: '-18.20' });
  });
});

describe('机位 / 渲染模式显示名表', () => {
  it('formatCameraMode：首字母大写英文标签', () => {
    expect(formatCameraMode('perspective')).toBe('Perspective');
    expect(formatCameraMode('top')).toBe('Top');
    expect(formatCameraMode('front')).toBe('Front');
    expect(formatCameraMode('side')).toBe('Side');
  });

  it('CAMERA_MODES：四机位完整清单（与 CameraPort.getMode 枚举一致）', () => {
    expect(CAMERA_MODES.map((m) => m.id)).toEqual(['perspective', 'top', 'front', 'side']);
  });

  it('RENDER_MODES：常规三模式完整清单（Shaded / Wireframe / X-Ray）', () => {
    expect(RENDER_MODES.map((m) => m.id)).toEqual(['shaded', 'wireframe', 'xray']);
    expect(formatRenderMode('shaded')).toBe('Shaded');
    expect(formatRenderMode('wireframe')).toBe('Wireframe');
    expect(formatRenderMode('xray')).toBe('X-Ray');
  });

  it('DIAGNOSTIC_RENDER_MODES（T8.4）：诊断三档中文主导命名，避用 Isolate 字样', () => {
    expect(DIAGNOSTIC_RENDER_MODES.map((m) => m.id)).toEqual(['clay', 'normals', 'islands']);
    expect(DIAGNOSTIC_RENDER_MODES.map((m) => m.label)).toEqual(['灰模（Clay）', '法线（Normals）', '孤岛高亮']);
    // 命名禁用 Isolate（防与 Maya isolate select 语义撞车）
    for (const m of [...RENDER_MODES, ...DIAGNOSTIC_RENDER_MODES]) {
      expect(m.label.toLowerCase()).not.toContain('isolate');
    }
    expect(formatRenderMode('clay')).toBe('灰模（Clay）');
    expect(formatRenderMode('normals')).toBe('法线（Normals）');
    expect(formatRenderMode('islands')).toBe('孤岛高亮');
  });
});

describe('islands 计数角标（T8.4：HUD 芯片「未归类对象：N」）', () => {
  it('countUnclassified：layerId === null 计数（0 与多对象用例）', () => {
    expect(countUnclassified([])).toBe(0);
    expect(
      countUnclassified([
        { layerId: 'layer_a' },
        { layerId: null },
        { layerId: 'layer_b' },
        { layerId: null },
        { layerId: null },
      ]),
    ).toBe(3);
    // 全部已归类
    expect(countUnclassified([{ layerId: 'layer_a' }, { layerId: 'layer_b' }])).toBe(0);
  });

  it('describeIslandCount：0 → 全部已归类；N → 未归类对象：N', () => {
    expect(describeIslandCount(0)).toBe('全部已归类');
    expect(describeIslandCount(1)).toBe('未归类对象：1');
    expect(describeIslandCount(42)).toBe('未归类对象：42');
  });
});

describe('describeViewportMetrics：状态栏右段读数', () => {
  it('Objects / Triangles / FPS / Unit: m 四段', () => {
    const segments = describeViewportMetrics({ fps: 60, triangles: 1280000, drawCalls: 42, objects: 128 });
    expect(segments).toEqual([
      { id: 'objects', label: 'Objects', value: '128' },
      { id: 'triangles', label: 'Triangles', value: '1.28M' },
      { id: 'fps', label: 'FPS', value: '60' },
      { id: 'unit', label: 'Unit', value: 'm' },
    ]);
  });

  it('零值不异常（渲染未就绪）', () => {
    const segments = describeViewportMetrics({ fps: 0, triangles: 0, drawCalls: 0, objects: 0 });
    expect(segments.map((s) => s.value)).toEqual(['0', '0', '0', 'm']);
  });
});

describe('环境扩展键归一（scene 层单一真相源）', () => {
  it('coerceRenderMode：六态字面量直通，其余（含缺省）回退 shaded', () => {
    expect(coerceRenderMode('shaded')).toBe('shaded');
    expect(coerceRenderMode('wireframe')).toBe('wireframe');
    expect(coerceRenderMode('xray')).toBe('xray');
    expect(coerceRenderMode('clay')).toBe('clay');
    expect(coerceRenderMode('normals')).toBe('normals');
    expect(coerceRenderMode('islands')).toBe('islands');
    expect(coerceRenderMode(undefined)).toBe('shaded');
    expect(coerceRenderMode('bogus')).toBe('shaded');
    expect(coerceRenderMode(42)).toBe('shaded');
  });

  it('isDiagnosticRenderMode：clay/normals/islands 为真，常规三态与其余为假', () => {
    expect(isDiagnosticRenderMode('clay')).toBe(true);
    expect(isDiagnosticRenderMode('normals')).toBe(true);
    expect(isDiagnosticRenderMode('islands')).toBe(true);
    expect(isDiagnosticRenderMode('shaded')).toBe(false);
    expect(isDiagnosticRenderMode('wireframe')).toBe(false);
    expect(isDiagnosticRenderMode('xray')).toBe(false);
    expect(isDiagnosticRenderMode(undefined)).toBe(false);
  });

  it('coerceSceneAxes：缺省/非法 → visible true；显式 false → false', () => {
    expect(coerceSceneAxes(undefined)).toEqual({ visible: true });
    expect(coerceSceneAxes(null)).toEqual({ visible: true });
    expect(coerceSceneAxes({ visible: true })).toEqual({ visible: true });
    expect(coerceSceneAxes({ visible: false })).toEqual({ visible: false });
    expect(coerceSceneAxes('garbage')).toEqual({ visible: true });
  });
});
