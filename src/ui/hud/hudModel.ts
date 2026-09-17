/**
 * ui/hud/hudModel —— HUD 与状态栏读数的纯格式化模型（T5.7，node 可测）。
 *
 * 职责：
 *  - 数字读数格式化：三角面 K/M 缩写（X.Xk / X.XXM）、坐标定宽两位小数（等宽
 *    tabular 列纵向对齐，改值不抖动）、机位/渲染模式显示名（首字母大写英文，需求 §12）；
 *  - 读数段派生：describeCursor（游标三轴 / 离开画布 —）、describeViewportMetrics
 *    （状态栏右段 Objects / Triangles / FPS / Unit: m）；
 *  - 下拉数据表：CAMERA_MODES（HUD Perspective ▼ 四机位）与 RENDER_MODES +
 *    DIAGNOSTIC_RENDER_MODES（Shaded ▼ 常规三态 + 诊断三档两组，T8.4）——与
 *    CameraPort.getMode 枚举 / scene 层 ViewportRenderMode 字面量同源（ui 禁 runtime
 *    导入，字面量集合由测试锁定一致）；islands 计数角标纯函数（T8.4）。
 * 边界：纯函数零依赖 store；渲染模式值经 scene 层 coerceRenderMode 归一（单一真相源）。
 */
import type { Vec3 } from '../../core/types';
import type { ID } from '../../core/types';
import { coerceRenderMode } from '../../scene/SceneData';
import type { ViewportRenderMode } from '../../scene/SceneData';
import type { CameraModeId } from '../store';

// ── 数字格式化 ────────────────────────────────────────────────

/** 三角面数缩写：<1000 原值；k 档一位小数（1.0k）；M 档至多两位小数去尾零（1.28M / 12.5M / 1M） */
export function formatTriangles(count: number): string {
  if (!Number.isFinite(count)) return '0'; // 渲染未就绪兜底
  if (count < 1000) return String(Math.max(0, Math.round(count)));
  if (count < 1_000_000) return `${(count / 1000).toFixed(1)}k`;
  const text = (count / 1_000_000).toFixed(2).replace(/\.?0+$/, '');
  return `${text}M`;
}

/** 坐标轴读数：定宽两位小数（非有限数 — 兜底） */
export function formatAxisCoord(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : '—';
}

/** 游标读数（三轴定宽；null = 离开画布 → 全 —） */
export interface CursorReadout {
  x: string;
  y: string;
  z: string;
}

export function describeCursor(pos: Vec3 | null): CursorReadout {
  if (!pos) return { x: '—', y: '—', z: '—' };
  return { x: formatAxisCoord(pos.x), y: formatAxisCoord(pos.y), z: formatAxisCoord(pos.z) };
}

// ── 显示名表（HUD 下拉 / 芯片） ───────────────────────────────

/** 四机位清单（HUD Perspective ▼；id 集 = CameraPort.getMode 枚举） */
export const CAMERA_MODES: ReadonlyArray<{ id: CameraModeId; label: string }> = [
  { id: 'perspective', label: 'Perspective' },
  { id: 'top', label: 'Top' },
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
];

/** 机位显示名（首字母大写英文，需求 §12.1/12.2） */
export function formatCameraMode(mode: CameraModeId): string {
  return CAMERA_MODES.find((m) => m.id === mode)?.label ?? CAMERA_MODES[0]!.label;
}

/** 常规三渲染模式清单（HUD Shaded ▼ 常规组；id 集 = scene 层 ViewportRenderMode 前三态） */
export const RENDER_MODES: ReadonlyArray<{ id: ViewportRenderMode; label: string }> = [
  { id: 'shaded', label: 'Shaded' },
  { id: 'wireframe', label: 'Wireframe' },
  { id: 'xray', label: 'X-Ray' },
];

/**
 * 诊断三档清单（T8.4 HUD Shaded ▼ 诊断组，组间分隔线呈现）：
 * 中文主导命名；孤岛高亮禁用 Isolate 字样（防与 Maya isolate select 语义撞车）。
 */
export const DIAGNOSTIC_RENDER_MODES: ReadonlyArray<{ id: ViewportRenderMode; label: string }> = [
  { id: 'clay', label: '灰模（Clay）' },
  { id: 'normals', label: '法线（Normals）' },
  { id: 'islands', label: '孤岛高亮' },
];

/** 渲染模式显示名（六态；未知回退 Shaded） */
export function formatRenderMode(mode: ViewportRenderMode): string {
  const found = [...RENDER_MODES, ...DIAGNOSTIC_RENDER_MODES].find((m) => m.id === mode);
  return found?.label ?? RENDER_MODES[0]!.label;
}

/** 环境值 → 渲染模式（scene 层归一函数转出；HUD/菜单 checked 同源入口） */
export function renderModeOfEnvironment(value: unknown): ViewportRenderMode {
  return coerceRenderMode(value);
}

// ── islands 计数角标（T8.4；HUD 芯片「未归类对象：N」） ───────

/** 未归类对象计数：layerId === null 的场景对象数（N=0 = 全部已归类） */
export function countUnclassified(objects: ReadonlyArray<{ layerId: ID | null }>): number {
  let count = 0;
  for (const o of objects) if (o.layerId === null) count += 1;
  return count;
}

/** 计数芯片文案：0 → 全部已归类；N → 未归类对象：N（数字等宽由 CSS 保证） */
export function describeIslandCount(count: number): string {
  return count === 0 ? '全部已归类' : `未归类对象：${count}`;
}

// ── 状态栏右段读数 ────────────────────────────────────────────

/** 状态栏轮询采样（objects 由 sceneVersion 派生重读；其余 1Hz 取自 getViewportStats） */
export interface ViewportStatsSample {
  fps: number;
  triangles: number;
  drawCalls: number;
  objects: number;
}

/** 右段读数段（Objects / Triangles / FPS / Unit: m，需求 §12.5） */
export interface MetricSegment {
  id: 'objects' | 'triangles' | 'fps' | 'unit';
  label: string;
  value: string;
}

export function describeViewportMetrics(sample: ViewportStatsSample): MetricSegment[] {
  return [
    { id: 'objects', label: 'Objects', value: String(Math.max(0, Math.round(sample.objects))) },
    { id: 'triangles', label: 'Triangles', value: formatTriangles(sample.triangles) },
    { id: 'fps', label: 'FPS', value: String(Math.max(0, Math.round(sample.fps))) },
    { id: 'unit', label: 'Unit', value: 'm' },
  ];
}
