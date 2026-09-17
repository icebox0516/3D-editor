/**
 * ui/Viewport —— 三维视口宿主（canvas 容器 + 四角 HUD + 游标坐标采样）。
 *
 * 职责：渲染承载 WebGL 的 <canvas>（Renderer 由 app 组合根挂载到该 canvas，UI 不触碰 three）、
 *      视口四角 HUD（ViewportHUD，T5.7：左上模式/机位/场景名、右上机位与渲染模式下拉 +
 *      视口选项、右下小地图占位；左下坐标轴指示器为 runtime 自建 canvas）与游标地面坐标
 *      采样（pointermove 30ms 节流 → session.groundPoint → store.cursorPos，状态栏读数；
 *      离开画布清空）。
 * 边界：ui 层零 THREE、零 runtime；HUD 只读 zustand store 与组合根注入的会话服务。
 */
import { useEffect } from 'react';
import type { ReactNode, RefObject } from 'react';
import { ViewportHUD } from './hud/ViewportHUD';
import { useEditorStore } from './store';

/** 游标采样节流窗（毫秒）：pointermove 高频事件 → 状态栏 30fps 级读数足够 */
const CURSOR_THROTTLE_MS = 30;

interface ViewportProps {
  /** 由 app 组合根持有的 canvas 引用（createEditor(canvas) 的挂载点） */
  canvasRef: RefObject<HTMLCanvasElement | null>;
  children?: ReactNode;
}

export function Viewport({ canvasRef, children }: ViewportProps) {
  // 游标地面坐标采样：节流 30ms → session.groundPoint（clientXY 原样，Port 内自减 rect）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let lastSampled = 0;
    const onPointerMove = (e: PointerEvent): void => {
      if (e.timeStamp - lastSampled < CURSOR_THROTTLE_MS) return;
      lastSampled = e.timeStamp;
      const session = useEditorStore.getState().session;
      if (!session) return;
      useEditorStore.getState().setCursorPos(session.groundPoint(e.clientX, e.clientY));
    };
    const onPointerLeave = (): void => {
      useEditorStore.getState().setCursorPos(null);
    };
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);
    return () => {
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [canvasRef]);

  return (
    <section className="ed-viewport" aria-label="三维视口">
      <canvas ref={canvasRef} className="ed-viewport__canvas" tabIndex={0} />
      <ViewportHUD />
      {children}
    </section>
  );
}
