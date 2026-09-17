/**
 * scene/SceneData —— 场景文件（序列化/反序列化）的顶层结构。
 *
 * 职责：声明场景版本、环境、图层与对象的集合；io 层 SceneSerializer 的输入输出类型。
 * 边界：纯数据接口，不含加载/保存行为；版本固定 '2.0'（T6.9 v2 接管；v1 旧格式
 *      已停止支持——SceneSerializer 版本门直接拒绝，无兼容读取）。
 */
import type { ID } from '../core/types';
import type { Layer } from './Layer';
import type { SceneObject } from './SceneObject';

/** 场景环境：preset 预设名 + 开放扩展字段（天空盒、光照参数等，由 runtime 解释） */
export interface SceneEnvironment {
  preset: string;
  [k: string]: unknown;
}

/**
 * 环境网格配置（SceneEnvironment 扩展键 `grid` 的形状）。
 * 主代理裁定（2026-09-09，T3.3）：网格配置走环境通道，零契约变更——索引签名天然允许
 * 该键，openScene/saveScene 通道持久化；runtime Renderer 消费 visible/size/spacing 控
 * GridHelper，editor 绘制工具消费 spacing 作吸附步长（bootstrap 桥接）。
 */
export interface SceneGrid {
  /** 网格显示开关 */
  visible: boolean;
  /** 网格总尺寸（米，地面边长） */
  size: number;
  /** 网格间距（米，一格边长；= 绘制吸附步长） */
  spacing: number;
}

/** 网格缺省值：间距 5 m（观感与吸附折中；与绘制吸附默认、Renderer fallback 分度统一） */
export const DEFAULT_SCENE_GRID: SceneGrid = { visible: true, size: 2000, spacing: 5 };

/**
 * 任意来源（环境扩展键 / UI 输入）→ 合法 SceneGrid：字段非法或缺失回退缺省值，
 * spacing 钳制 [0.1, 100] 米、size 钳制 [100, 4000] 米（防除零与离谱量级）。
 * 纯函数，scene/runtime/app 共用。
 */
export function coerceSceneGrid(value: unknown): SceneGrid {
  const source = (typeof value === 'object' && value !== null ? value : {}) as Partial<Record<keyof SceneGrid, unknown>>;
  const spacing = clampNumber(source.spacing, DEFAULT_SCENE_GRID.spacing, 0.1, 100);
  const size = clampNumber(source.size, DEFAULT_SCENE_GRID.size, 100, 4000);
  return { visible: source.visible !== false, size, spacing };
}

/**
 * 视口渲染模式（SceneEnvironment 扩展键 `renderMode` 的形状，T5.7 → T8.4 六态）。
 * 主代理裁定（2026-09-11）：渲染模式走环境通道（沿 env.grid 先例，零契约变更），
 * UI（主菜单 / HUD Shaded ▼）与 runtime（Renderer 分遍渲染）共用本归一函数。
 * T8.4 增补诊断三档（clay / normals / islands）：**会话级视口态，不入场景文件**——
 * 保存时由组合根剥离该键（bootstrap.saveScene），重新打开回退 shaded；
 * 常规三态（shaded / wireframe / xray）键随场景保存 / 打开往返。
 */
export type ViewportRenderMode = 'shaded' | 'wireframe' | 'xray' | 'clay' | 'normals' | 'islands';

/** 诊断档字面量集合（T8.4）：会话级视口态，持久化时剥离 */
export const DIAGNOSTIC_RENDER_MODES = ['clay', 'normals', 'islands'] as const;

export type DiagnosticRenderMode = (typeof DIAGNOSTIC_RENDER_MODES)[number];

/** 任意来源 → 是否诊断档（clay/normals/islands 为真；常规三态与其余为假） */
export function isDiagnosticRenderMode(value: unknown): value is DiagnosticRenderMode {
  return (DIAGNOSTIC_RENDER_MODES as readonly unknown[]).includes(value);
}

/** 渲染模式缺省值：着色（shaded） */
export const DEFAULT_RENDER_MODE: ViewportRenderMode = 'shaded';

/** 任意来源（环境扩展键 / UI 输入）→ 合法渲染模式：非六态字面量回退 shaded */
export function coerceRenderMode(value: unknown): ViewportRenderMode {
  return value === 'wireframe' || value === 'xray' || isDiagnosticRenderMode(value)
    ? (value as ViewportRenderMode)
    : DEFAULT_RENDER_MODE;
}

/**
 * 视口坐标轴指示器配置（SceneEnvironment 扩展键 `axes` 的形状，T5.7）。
 * 与 grid 同一环境通道：键随场景保存 / 打开往返，runtime AxesIndicator 消费 visible。
 */
export interface SceneAxes {
  /** 坐标轴指示器显示开关（左下角 HUD） */
  visible: boolean;
}

/** 坐标轴缺省值：可见 */
export const DEFAULT_SCENE_AXES: SceneAxes = { visible: true };

/** 任意来源（环境扩展键 / UI 输入）→ 合法 SceneAxes：缺省/非法回退可见 */
export function coerceSceneAxes(value: unknown): SceneAxes {
  const source = (typeof value === 'object' && value !== null ? value : {}) as Partial<Pick<SceneAxes, 'visible'>>;
  return { visible: source.visible !== false };
}

/** 数值读取：有限且 >0 则钳制到 [min,max]，否则回退 fallback */
function clampNumber(raw: unknown, fallback: number, min: number, max: number): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw <= 0) return fallback;
  return Math.min(Math.max(raw, min), max);
}

export interface SceneData {
  /** 场景文件版本（当前固定 '2.0'；v1 旧格式停止支持） */
  version: '2.0';
  id: ID;
  name: string;
  environment: SceneEnvironment;
  layers: Layer[];
  objects: SceneObject[];
}
