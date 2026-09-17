/**
 * editor/tools/draw/DrawEllipseTool —— 椭圆绘制工具（T6.5：两轴拖拽）。
 *
 * 职责：两段拖拽定双半轴——
 *   - 第一段：按下定中心，水平拖拽松开 → radiusX = |dx|（预览为半轴线 LineString）；
 *   - 第二段：再次按下（任意处）拖拽，垂直分量定 radiusY → ellipsePoints(rx, ry, 64)
 *     生成 64 顶点 → RegionObject（shape.type='ellipse'，options 缓存 radiusX/radiusY/segments）；
 *   - 任一半轴为零拦截提示（第一段失败回到初始；第二段失败停留第二段可重拖）；
 *   - ESC/右键取消整段草稿回到初始。
 * 边界：参数化形状天然合法；Shift 正交 / A 45°（相对中心）/ G 吸附沿基座管线；
 *      完成即创建 + 自动选中 + 回选择工具；零 THREE。
 */
import type { ShapeType } from '../../../domain/regions';
import type { Vec2 } from '../../../core/types';
import { DEFAULT_CIRCLE_SEGMENTS, ellipsePoints } from '../../../domain/regions';
import type { DrawGridConfig } from './DrawGridConfig';
import { DragShapeToolBase } from './DragShapeToolBase';

/** 两阶段状态机：定 X 半轴 → 定 Y 半轴 */
type EllipseStage = 'axis-x' | 'axis-y';

/** 中心 + 双半轴 → 顶点列（ellipsePoints 以原点为中心，平移） */
function ellipseAt(center: Vec2, radiusX: number, radiusY: number): Vec2[] {
  return ellipsePoints(radiusX, radiusY, DEFAULT_CIRCLE_SEGMENTS).map((p) => ({
    x: center.x + p.x,
    y: center.y + p.y,
  }));
}

export class DrawEllipseTool extends DragShapeToolBase {
  readonly id = 'draw-ellipse';
  readonly name = '椭圆绘制';

  protected readonly shapeType: ShapeType = 'ellipse';

  /** 中心与已定 X 半轴（第一段完成后进入第二段） */
  private center: Vec2 | null = null;
  private radiusX = 0;
  private stage: EllipseStage = 'axis-x';

  constructor(drawGrid?: DrawGridConfig) {
    super(drawGrid);
  }

  /** 两阶段均以中心为辅助锚点（半轴沿轴拖拽时 Shift/A 相对中心生效） */
  protected override dragAnchor(): Vec2 | null {
    return this.center ?? this.dragStartPoint;
  }

  protected override onDragStart(p: Vec2): void {
    this.dragStartPoint = p;
    if (this.stage === 'axis-x') {
      this.center = p;
      this.draftClosed = false;
      this.draftPoints = [{ ...p }];
    } else {
      this.refreshAxisYDraft(p);
    }
    this.pushDraftPreview();
  }

  protected override onDragMove(p: Vec2): void {
    if (this.stage === 'axis-x') {
      const center = this.center!;
      this.draftClosed = false;
      this.draftPoints = [{ ...center }, { ...p }]; // 半轴线预览
    } else {
      this.refreshAxisYDraft(p);
    }
    this.pushDraftPreview();
  }

  protected override onDragEnd(p: Vec2): void {
    if (this.stage === 'axis-x') {
      const center = this.center!;
      const radiusX = Math.abs(p.x - center.x);
      if (radiusX <= 0) {
        this.resetToStageX();
        this.emitStatus({ error: '椭圆绘制：先从中心水平拖出长半轴' });
        return;
      }
      this.radiusX = radiusX;
      this.stage = 'axis-y';
      this.draftClosed = true;
      this.refreshAxisYDraft(p);
      this.pushDraftPreview();
      this.emitStatus();
      return;
    }
    const center = this.center!;
    const radiusY = Math.abs(p.y - center.y);
    if (radiusY <= 0) {
      // 停留第二段：保持中心与 radiusX，用户可直接重拖 Y 半轴
      this.refreshAxisYDraft(p);
      this.emitStatus({ error: '椭圆绘制：再垂直拖出短半轴' });
      return;
    }
    this.completeDrag({
      type: 'ellipse',
      points: ellipseAt(center, this.radiusX, radiusY),
      baseHeight: this.initialBaseHeight,
      closed: true,
      options: { radiusX: this.radiusX, radiusY, segments: DEFAULT_CIRCLE_SEGMENTS },
    });
  }

  protected override resetDrag(): void {
    super.resetDrag();
    this.resetToStageX();
  }

  /** 回到第一阶段（清中心与半轴） */
  private resetToStageX(): void {
    this.center = null;
    this.radiusX = 0;
    this.stage = 'axis-x';
    this.draftClosed = false;
    this.draftPoints = [];
  }

  /** 第二段草稿：Y 半轴随拖拽点垂直分量更新（X 半轴已锁定） */
  private refreshAxisYDraft(p: Vec2): void {
    const center = this.center!;
    const radiusY = Math.abs(p.y - center.y);
    this.draftClosed = true;
    this.draftPoints =
      radiusY > 0 ? ellipseAt(center, this.radiusX, radiusY) : [{ ...center }];
  }
}
