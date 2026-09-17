/**
 * ui/components/StatusBar —— 底部状态栏（T3.3 绘制读数；T5.7 增强游标坐标与右段指标）。
 *
 * 数据流（验收断言点）：
 *  - 左段绘制读数：draw:status 事件 → store.drawStatus（EventBus 桥）→
 *    describeDrawStatus（纯函数分节）→ 渲染——长度 / 面积 / 顶点（T6.5 七形状
 *    vertexCount 计数）/ 游标坐标 / 错误提示；空载荷 {}（完成 / 取消后发出）
 *    分节为空。原样保留，不回归。
 *  - 左段测量读数段（T10.2）：measure:status 事件 → store.measureStatus →
 *    describeMeasureStatus（纯函数分节）→ 渲染——段长 / 总长（distance）、三读数
 *    空间/水平/ΔH（height）、面积（area）、角度（angle）、拦截提示、游标三维坐标
 *    （X·Y·Z 定宽两位小数，表面拾取含 y）；仅含 kind 的复位载荷清段。
 *  - 左段游标读数：store.cursorPos（视口 pointermove 30ms 节流 → groundPoint）→
 *    describeCursor → X/Y/Z 三轴定宽两位小数（Y 为地面恒 0.00）；离开画布显示 —。
 *    一致性注记：绘制中 drawStatus.cursor 为吸附/正交/角度锁定后的落点，本读数为
 *    射线地面原值——无吸附修正时两者一致（几何真值口径）。
 *  - 右段指标：Objects（sceneVersion 派生重读门面）· Triangles/FPS（1Hz 轮询
 *    session.getViewportStats，setInterval 组件卸载清理，不进渲染热路径）· Unit: m。
 * 边界：纯展示；数值走等宽 tabular 读数（DESIGN.md「测绘仪器」语义）；
 *      Vec2.y 即世界 Z（CONTRACTS.md #8），展示为 Z。
 */
import { useEffect, useState } from 'react';
import type { DrawStatusPayload, MeasureStatusPayload } from '../../core/events/events';
import { useEditorStore } from '../store';
import { describeCursor, describeViewportMetrics } from '../hud/hudModel';

/** 状态栏读数段（渲染单元；kind 供样式分节，error 用 danger 色） */
export interface DrawStatusSegment {
  kind: 'length' | 'area' | 'vertex' | 'cursor' | 'error';
  label: string;
  value: string;
}

/** 测量读数段（渲染单元；T10.2；kind 供样式分节，error 用 danger 色） */
export interface MeasureStatusSegment {
  kind: 'segment' | 'total' | 'spatial' | 'horizontal' | 'dh' | 'area' | 'angle' | 'cursor' | 'error';
  label: string;
  value: string;
}

/** 数值格式化：最多两位小数、去尾零（0.1+0.2 → 0.3；12.345 → 12.35） */
export function formatMeasure(value: number): string {
  return String(Number(value.toFixed(2)));
}

/** 坐标格式化：定宽两位小数（等宽 tabular 改值不抖动；与绘制游标段口径区分） */
function fixed2(value: number): string {
  return value.toFixed(2);
}

/**
 * 绘制载荷 → 读数段（纯函数）：长度 → 面积 → 顶点（T6.5 七形状 vertexCount）→
 * 坐标（X/Z），错误段居末。空载荷 / null 产出空数组（状态栏复位）。
 */
export function describeDrawStatus(payload: DrawStatusPayload | null): DrawStatusSegment[] {
  if (!payload) return [];
  const segments: DrawStatusSegment[] = [];
  if (typeof payload.length === 'number' && Number.isFinite(payload.length)) {
    segments.push({ kind: 'length', label: '长度', value: `${formatMeasure(payload.length)} m` });
  }
  if (typeof payload.area === 'number' && Number.isFinite(payload.area)) {
    segments.push({ kind: 'area', label: '面积', value: `${formatMeasure(payload.area)} m²` });
  }
  if (typeof payload.vertexCount === 'number' && Number.isFinite(payload.vertexCount)) {
    segments.push({ kind: 'vertex', label: '顶点', value: String(Math.round(payload.vertexCount)) });
  }
  if (payload.cursor && Number.isFinite(payload.cursor.x) && Number.isFinite(payload.cursor.y)) {
    segments.push({
      kind: 'cursor',
      label: '坐标',
      value: `X ${formatMeasure(payload.cursor.x)} · Z ${formatMeasure(payload.cursor.y)}`,
    });
  }
  if (typeof payload.error === 'string' && payload.error !== '') {
    segments.push({ kind: 'error', label: '拦截', value: payload.error });
  }
  return segments;
}

/**
 * 测量载荷 → 读数段（纯函数，T10.2）：distance 段长/总长；height 三读数
 * （空间/水平/ΔH 可负）；area 面积；angle 角度；游标三维坐标（X·Y·Z 定宽两位
 * 小数——含 y 值，表面拾取口径）；error 段居末。仅含 kind 的复位载荷 / null 产出
 * 空数组（状态栏测量段复位，沿 describeDrawStatus 先例）。字段缺省不占位
 * （如 height 未拾首点时无三读数）。
 */
export function describeMeasureStatus(payload: MeasureStatusPayload | null): MeasureStatusSegment[] {
  if (!payload) return [];
  const segments: MeasureStatusSegment[] = [];
  const num = (v: number | undefined): v is number =>
    typeof v === 'number' && Number.isFinite(v);
  switch (payload.kind) {
    case 'distance':
      if (num(payload.segment)) {
        segments.push({ kind: 'segment', label: '段长', value: `${formatMeasure(payload.segment)} m` });
      }
      if (num(payload.total)) {
        segments.push({ kind: 'total', label: '总长', value: `${formatMeasure(payload.total)} m` });
      }
      break;
    case 'height':
      if (num(payload.segment)) {
        segments.push({ kind: 'spatial', label: '空间', value: `${formatMeasure(payload.segment)} m` });
      }
      if (num(payload.horizontal)) {
        segments.push({ kind: 'horizontal', label: '水平', value: `${formatMeasure(payload.horizontal)} m` });
      }
      if (num(payload.dh)) {
        segments.push({ kind: 'dh', label: 'ΔH', value: `${formatMeasure(payload.dh)} m` });
      }
      break;
    case 'area':
      if (num(payload.area)) {
        segments.push({ kind: 'area', label: '面积', value: `${formatMeasure(payload.area)} m²` });
      }
      break;
    case 'angle':
      if (num(payload.angle)) {
        segments.push({ kind: 'angle', label: '角度', value: `${formatMeasure(payload.angle)}°` });
      }
      break;
  }
  if (payload.cursor && num(payload.cursor.x) && num(payload.cursor.y) && num(payload.cursor.z)) {
    segments.push({
      kind: 'cursor',
      label: '坐标',
      value: `X ${fixed2(payload.cursor.x)} · Y ${fixed2(payload.cursor.y)} · Z ${fixed2(payload.cursor.z)}`,
    });
  }
  if (typeof payload.error === 'string' && payload.error !== '') {
    segments.push({ kind: 'error', label: '拦截', value: payload.error });
  }
  return segments;
}

/** 右段指标轮询周期（毫秒）：1Hz 读 getViewportStats */
const STATS_POLL_MS = 1000;

export function StatusBar() {
  const drawStatus = useEditorStore((s) => s.drawStatus);
  const measureStatus = useEditorStore((s) => s.measureStatus);
  const cursorPos = useEditorStore((s) => s.cursorPos);
  const facade = useEditorStore((s) => s.facade);
  const session = useEditorStore((s) => s.session);
  const sceneVersion = useEditorStore((s) => s.sceneVersion);
  const [stats, setStats] = useState<{ fps: number; triangles: number; drawCalls: number }>({
    fps: 0,
    triangles: 0,
    drawCalls: 0,
  });

  // 1Hz 轮询视口指标（fps/triangles；objects 走 sceneVersion 派生重读）——
  // setInterval 本地状态，卸载清理；不进 React 渲染热路径
  useEffect(() => {
    if (!session) return;
    const read = (): void => setStats(session.getViewportStats());
    read();
    const timer = window.setInterval(read, STATS_POLL_MS);
    return () => window.clearInterval(timer);
  }, [session]);

  void sceneVersion; // 订阅版本号以在场景变更时重读对象计数
  const objects = facade?.scene.getObjects().length ?? 0;
  const segments = describeDrawStatus(drawStatus);
  const measureSegments = describeMeasureStatus(measureStatus);
  const cursor = describeCursor(cursorPos);
  const metrics = describeViewportMetrics({ ...stats, objects });

  return (
    <footer className="ed-statusbar" role="status" aria-label="状态栏">
      <div className="ed-statusbar__segments">
        {segments.length === 0 && measureSegments.length === 0 ? (
          <span className="ed-statusbar__idle">就绪</span>
        ) : (
          <>
            {segments.map((segment) => (
              <span
                key={`draw-${segment.kind}`}
                className={`ed-statusbar__segment${segment.kind === 'error' ? ' ed-statusbar__segment--error' : ''}`}
              >
                <span className="ed-statusbar__label">{segment.label}</span>
                <span className="ed-statusbar__value">{segment.value}</span>
              </span>
            ))}
            {measureSegments.map((segment) => (
              <span
                key={`measure-${segment.kind}`}
                className={`ed-statusbar__segment${segment.kind === 'error' ? ' ed-statusbar__segment--error' : ''}`}
              >
                <span className="ed-statusbar__label">{segment.label}</span>
                <span className="ed-statusbar__value">{segment.value}</span>
              </span>
            ))}
          </>
        )}
        <span className="ed-statusbar__segment" aria-label="游标地面坐标">
          <span className="ed-statusbar__label">X</span>
          <span className="ed-statusbar__value">{cursor.x}</span>
          <span className="ed-statusbar__label">Y</span>
          <span className="ed-statusbar__value">{cursor.y}</span>
          <span className="ed-statusbar__label">Z</span>
          <span className="ed-statusbar__value">{cursor.z}</span>
        </span>
      </div>
      <div className="ed-statusbar__metrics">
        {metrics.map((metric) => (
          <span key={metric.id} className="ed-statusbar__segment">
            <span className="ed-statusbar__label">{metric.label}</span>
            <span className="ed-statusbar__value">{metric.value}</span>
          </span>
        ))}
      </div>
      <span className="ed-statusbar__hint">双击 / 松手完成 · Esc 退出 · G 吸附 · Shift 正交 · A 45°</span>
    </footer>
  );
}
