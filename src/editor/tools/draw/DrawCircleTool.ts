/**
 * editor/tools/draw/DrawCircleTool —— 圆形绘制工具（T6.5：中心按住拖半径）。
 *
 * 职责：按下定圆心、拖拽至半径松开 → circlePoints(radius, 64) 生成 64 顶点 →
 *      RegionObject（shape.type='circle'，options 缓存 radius/segments）；
 *      预览为 64 段闭合多边形；状态栏 length（周长链）/ area（多边形面积）/
 *      vertexCount=64；零半径拦截提示。
 * 边界：参数化形状天然合法；Shift 正交 / A 45°（相对圆心，半径锁轴）/ G 吸附沿基座
 *      管线；完成即创建 + 自动选中 + 回选择工具；零 THREE。
 */
import type { ShapeType } from '../../../domain/regions';
import type { Vec2 } from '../../../core/types';
import { DEFAULT_CIRCLE_SEGMENTS, circlePoints } from '../../../domain/regions';
import type { DrawGridConfig } from './DrawGridConfig';
import { DragShapeToolBase } from './DragShapeToolBase';

/** 圆心（拖拽起点；半径 = 拖拽点到圆心距离） */
function circleCenterOf(p: Vec2): Vec2 {
  return { x: p.x, y: p.y };
}

/** 圆心 + 半径 → 顶点列（circlePoints 以原点为中心，平移到圆心） */
function circleAt(center: Vec2, radius: number): Vec2[] {
  return circlePoints(radius, DEFAULT_CIRCLE_SEGMENTS).map((p) => ({
    x: center.x + p.x,
    y: center.y + p.y,
  }));
}

export class DrawCircleTool extends DragShapeToolBase {
  readonly id = 'draw-circle';
  readonly name = '圆形绘制';

  protected readonly shapeType: ShapeType = 'circle';

  constructor(drawGrid?: DrawGridConfig) {
    super(drawGrid);
  }

  protected override onDragStart(p: Vec2): void {
    this.dragStartPoint = p;
    this.draftPoints = [{ ...p }]; // 零半径草稿（单点，up 时拦截）
    this.pushDraftPreview();
  }

  protected override onDragMove(p: Vec2): void {
    const center = circleCenterOf(this.dragStartPoint!);
    const radius = Math.hypot(p.x - center.x, p.y - center.y);
    this.draftPoints = radius > 0 ? circleAt(center, radius) : [{ ...center }];
    this.pushDraftPreview();
  }

  protected override onDragEnd(p: Vec2): void {
    const center = circleCenterOf(this.dragStartPoint!);
    const radius = Math.hypot(p.x - center.x, p.y - center.y);
    if (radius <= 0) {
      this.resetDrag();
      this.emitStatus({ error: '圆形绘制：请从圆心拖出半径' });
      return;
    }
    this.completeDrag({
      type: 'circle',
      points: circleAt(center, radius),
      baseHeight: this.initialBaseHeight,
      closed: true,
      options: { radius, segments: DEFAULT_CIRCLE_SEGMENTS },
    });
  }
}
