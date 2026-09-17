/**
 * editor/tools/draw/DrawFreehandTool —— 自由形状绘制工具（T6.5：按住跟踪，松手闭合简化）。
 *
 * 职责：按住沿轮廓跟踪（最小间距过滤抖动点）、松手 → 道格拉斯-普克简化
 *      （simplifyFreehand，容差 0.2m）+ Chaikin 平滑（smoothFreehand，1 次迭代、
 *      端点保持）→ 闭合环校验（自相交/顶点不足经 validateGeometry 拦截）→
 *      RegionObject（shape.type='freehand'，options 缓存 simplify/smooth）；
 *      跟踪期间预览开放折线、vertexCount 随跟踪点数增长；拦截时错误提示 + 草稿清空
 *      （手势已结束，重按另起）。
 * 边界：Shift 正交 / A 45° / G 吸附沿基座管线（锚点 = 最近跟踪点）；完成即创建 +
 *      自动选中 + 回选择工具；零 THREE。
 */
import type { ShapeType } from '../../../domain/regions';
import type { Vec2 } from '../../../core/types';
import {
  DEFAULT_SIMPLIFY_TOLERANCE,
  DEFAULT_SMOOTH_ITERATIONS,
  simplifyFreehand,
  smoothFreehand,
} from '../../../domain/regions';
import { validateGeometry } from '../../../domain/validate/validateGeometry';
import type { DrawGridConfig } from './DrawGridConfig';
import { DragShapeToolBase } from './DragShapeToolBase';
import { DrawValidationError } from './DrawValidationError';

/** 跟踪点最小间距（米）：低于此距离不记录，抑制抖动与冗余顶点 */
const MIN_TRACK_DISTANCE = 0.1;

/** 平滑后闭合环的顶点下限（少于 3 点无法成面） */
const MIN_RING_POINTS = 3;

export class DrawFreehandTool extends DragShapeToolBase {
  readonly id = 'draw-freehand';
  readonly name = '自由形状绘制';

  protected readonly shapeType: ShapeType = 'freehand';

  /** 原始跟踪点（简化/平滑的输入；松手时消费） */
  private tracked: Vec2[] = [];

  constructor(drawGrid?: DrawGridConfig) {
    super(drawGrid);
  }

  /** 自由形状跟踪期间为开放折线预览（松手才闭合） */
  protected override areaPreview(): boolean {
    return false;
  }

  /** 辅助锚点 = 最近跟踪点（Shift 正交 / A 45° 沿笔迹生效） */
  protected override dragAnchor(): Vec2 | null {
    return this.tracked.length > 0 ? this.tracked[this.tracked.length - 1]! : this.dragStartPoint;
  }

  protected override onDragStart(p: Vec2): void {
    this.dragStartPoint = p;
    this.tracked = [{ ...p }];
    this.draftPoints = [...this.tracked];
    this.pushDraftPreview();
  }

  protected override onDragMove(p: Vec2): void {
    const last = this.tracked[this.tracked.length - 1]!;
    if (Math.hypot(p.x - last.x, p.y - last.y) >= MIN_TRACK_DISTANCE) {
      this.tracked.push({ ...p });
    }
    this.draftPoints = [...this.tracked];
    this.pushDraftPreview();
  }

  protected override onDragEnd(p: Vec2): void {
    // 收尾点并入（间距足够时）
    const last = this.tracked[this.tracked.length - 1]!;
    if (Math.hypot(p.x - last.x, p.y - last.y) >= MIN_TRACK_DISTANCE) {
      this.tracked.push({ ...p });
    }

    try {
      const ring = this.buildValidatedRing();
      this.completeDrag({
        type: 'freehand',
        points: ring,
        baseHeight: this.initialBaseHeight,
        closed: true,
        options: {
          simplify: DEFAULT_SIMPLIFY_TOLERANCE,
          smooth: DEFAULT_SMOOTH_ITERATIONS,
        },
      });
    } catch (err) {
      this.resetDrag();
      if (err instanceof DrawValidationError) {
        this.emitStatus({ error: err.message });
        return;
      }
      throw err;
    }
  }

  protected override resetDrag(): void {
    super.resetDrag();
    this.tracked = [];
  }

  /**
   * 跟踪点 → 简化 + 平滑 → 闭合环校验：
   * validateGeometry 在深拷贝环上就地补闭合点与顶点顺序修复，返回修复后的开放点列
   * （首尾闭合点去除——shapePoints 契约：闭合由 shape.closed 表达）。
   */
  private buildValidatedRing(): Vec2[] {
    const simplified = simplifyFreehand(this.tracked, DEFAULT_SIMPLIFY_TOLERANCE);
    const smoothed = smoothFreehand(simplified, DEFAULT_SMOOTH_ITERATIONS);
    if (smoothed.length < MIN_RING_POINTS) {
      throw new DrawValidationError([
        { code: 'TOO_FEW_VERTICES', message: '自由形状绘制至少需要 3 个有效点', index: 0 },
      ]);
    }
    const ring = [...smoothed, { ...smoothed[0]! }]; // 显式闭合供环校验
    const geometry = { type: 'Polygon' as const, coordinates: [ring] };
    const result = validateGeometry(geometry);
    if (!result.valid) {
      throw new DrawValidationError(result.errors);
    }
    return geometry.coordinates[0]!.slice(0, -1); // 去闭合点
  }
}
