/**
 * editor/tools/draw/DrawRectangleTool —— 矩形绘制工具（T6.5：拖拽两角）。
 *
 * 职责：按下定一角、拖拽至对角松开 → rectanglePoints 生成 4 顶点（CCW）→
 *      RegionObject（shape.type='rectangle'，options 缓存 width/height/centerX/centerY）；
 *      反向拖拽自动归一；拖拽期间预览闭合四边形 + 状态栏 length/area/vertexCount=4；
 *      零宽/零高（原地点击）拦截提示；辅助键（Shift 正交 / A 45° / G 吸附）沿基座管线。
 * 边界：参数化形状天然合法（validateRegionShape 直通）；完成即创建 + 自动选中 +
 *      回选择工具（三步流，基座 commitShape）；零 THREE。
 */
import type { ShapeType } from '../../../domain/regions';
import { rectanglePoints } from '../../../domain/regions';
import type { Vec2 } from '../../../core/types';
import type { DrawGridConfig } from './DrawGridConfig';
import { DragShapeToolBase } from './DragShapeToolBase';

export class DrawRectangleTool extends DragShapeToolBase {
  readonly id = 'draw-rectangle';
  readonly name = '矩形绘制';

  protected readonly shapeType: ShapeType = 'rectangle';

  constructor(drawGrid?: DrawGridConfig) {
    super(drawGrid);
  }

  protected override onDragStart(p: Vec2): void {
    this.dragStartPoint = p;
    this.draftPoints = [{ ...p }];
    this.pushDraftPreview();
  }

  protected override onDragMove(p: Vec2): void {
    const start = this.dragStartPoint!;
    this.draftPoints = rectanglePoints(
      Math.abs(p.x - start.x),
      Math.abs(p.y - start.y),
      { x: (p.x + start.x) / 2, y: (p.y + start.y) / 2 },
    );
    this.pushDraftPreview();
  }

  protected override onDragEnd(p: Vec2): void {
    const start = this.dragStartPoint!;
    const width = Math.abs(p.x - start.x);
    const height = Math.abs(p.y - start.y);
    if (width <= 0 || height <= 0) {
      this.resetDrag();
      this.emitStatus({ error: '矩形绘制：请拖拽出两个对角' });
      return;
    }
    const center = { x: (p.x + start.x) / 2, y: (p.y + start.y) / 2 };
    this.completeDrag({
      type: 'rectangle',
      points: rectanglePoints(width, height, center),
      baseHeight: this.initialBaseHeight,
      closed: true,
      options: { width, height, centerX: center.x, centerY: center.y },
    });
  }
}
