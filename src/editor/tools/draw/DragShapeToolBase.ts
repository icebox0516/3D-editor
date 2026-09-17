/**
 * editor/tools/draw/DragShapeToolBase —— 拖拽类形状工具共享基座（T6.5）。
 *
 * 职责：矩形/圆形/椭圆/自由的「按下 → 拖拽 → 松开完成」公共手势骨架——
 *   - pointerdown（左键）：经落点管线解析锚点，进入拖拽态（onDragStart 钩子）；
 *   - pointermove：拖拽中重投影（onDragMove 钩子，辅助键 Shift/A/G 全沿用基座管线）；
 *     非拖拽移动仅更新游标读数；
 *   - pointerup：结束拖拽（onDragEnd 钩子）——子类在此组装 RegionShape 经 commitShape
 *     提交（三步流：创建 + 自动选中 + 回选择工具）或发拦截提示；
 *   - 双击无语义；ESC/右键走基座 cancel（清草稿零命令）。
 * 边界：零 THREE；半成品只经 pushPreview（面类映射 Polygon 点列，分域契约 §D）；
 *      拖拽态锚点即辅助管线 currentAnchor（Shift 正交 / A 45° 相对锚点生效）。
 */
import type { Vec2 } from '../../../core/types';
import type { DrawStatusPayload } from '../../../core/events/events';
import { polygonArea, polylineLength } from '../../../core/math';
import { getSemanticDefinition } from '../../../domain/regions';
import type { RegionShape } from '../../../domain/regions';
import type { PointerEventInfo } from '../../services/ports';
import type { DrawPreviewState } from '../../services/ports';
import { DrawValidationError } from './DrawValidationError';
import { DrawToolBase } from './DrawToolBase';

export abstract class DragShapeToolBase extends DrawToolBase {
  /** 是否处于按下拖拽中 */
  protected dragging = false;
  /** 当前草稿预览点列（拖拽中持续更新；完成后清空） */
  protected draftPoints: Vec2[] = [];
  /** 草稿是否按闭合形状预览（面类 true） */
  protected draftClosed = false;
  /** 拖拽起点（onDragStart 记录；子类状态机的公共基准） */
  protected dragStartPoint: Vec2 | null = null;

  override onPointerDown(e: PointerEventInfo): void {
    if (e.button !== 'left') {
      this.cancel();
      return;
    }
    const p = this.resolveAidedGround(e);
    if (p === null) return;
    this.trackGround(p, e.shiftKey);
    this.dragging = true;
    this.draftClosed = this.areaPreview();
    this.onDragStart(p);
    this.emitStatus();
  }

  override onPointerMove(e: PointerEventInfo): void {
    const p = this.resolveAidedGround(e);
    if (p === null) return;
    this.trackGround(p, e.shiftKey);
    if (this.dragging) {
      this.onDragMove(p);
    }
    this.emitStatus();
  }

  override onPointerUp(e: PointerEventInfo): void {
    if (e.button !== 'left' || !this.dragging) return;
    const p = this.resolveAidedGround(e);
    this.dragging = false;
    if (p === null) {
      // 抬起无投影（拖出地面）：丢弃草稿防悬死
      this.resetDrag();
      this.emitStatus({ error: `${this.name}: 拖拽超出地面范围，请重试` });
      return;
    }
    this.trackGround(p, e.shiftKey);
    this.onDragEnd(p);
  }

  /** 双击无额外语义（拖拽手势在 up 完成） */
  override onDoubleClick(_e: PointerEventInfo): void {
    // 无操作
  }

  /** 本工具草稿是否按闭合面预览（矩形/圆/椭圆 true；自由跟踪 false，松手才闭合） */
  protected areaPreview(): boolean {
    return true;
  }

  /** 拖拽起点（辅助管线锚点：Shift 正交 / A 45° 相对此点） */
  protected override currentAnchor(): Vec2 | null {
    return this.dragAnchor();
  }

  /** 辅助键切换后原地重投影：拖拽中重放 onDragMove */
  protected override refreshFromLastGround(): void {
    if (this.dragging && this.lastGround) {
      const p = this.applyAids(this.lastGround, this.lastShift);
      this.lastGround = p;
      this.onDragMove(p);
      this.emitStatus();
      return;
    }
    super.refreshFromLastGround();
  }

  /** 拖拽中辅助管线锚点（默认 = 拖拽起点；子类可覆写为形状中心等） */
  protected dragAnchor(): Vec2 | null {
    return this.dragging ? this.dragStartPoint : null;
  }

  /** 推送当前草稿到预览 Port（面类 → Polygon 闭合点列；自由 → LineString 开放折线） */
  protected pushDraftPreview(cursor: Vec2 | null = null): void {
    const state: DrawPreviewState = {
      geometryType: this.draftClosed ? 'Polygon' : 'LineString',
      points: this.draftPoints.map((p) => ({ ...p })),
      cursor: cursor === null ? null : { ...cursor },
      closed: this.draftClosed,
    };
    this.pushPreview(state);
  }

  /** 清拖拽草稿（resetDraft 钩子：activate/cancel/deactivate 复用） */
  protected resetDrag(): void {
    this.dragging = false;
    this.draftPoints = [];
    this.draftClosed = this.areaPreview();
  }

  protected override resetDraft(): void {
    this.resetDrag();
  }

  /** 草稿点计数（vertexCount 载荷） */
  protected override currentVertexCount(): number | undefined {
    return this.draftPoints.length > 0 ? this.draftPoints.length : undefined;
  }

  /** 绘制初始语义的贴地基准高度（unclassified → 0；语义注册表单一真相源） */
  protected get initialBaseHeight(): number {
    return getSemanticDefinition('unclassified')!.defaultBaseHeight;
  }

  /**
   * 完成提交（拖拽版 finishDrawing）：commitShape（创建 + 自动选中 + 回选择）→
   * 成功复位草稿/预览/状态栏；失败或校验拦截（DrawValidationError）发错误提示——
   * 校验拦截时草稿一并复位（拖拽手势已结束，无法原地修正，重拖另起）。
   */
  protected completeDrag(shape: RegionShape): void {
    try {
      if (this.commitShape(shape) !== null) {
        this.lastGround = null;
        this.resetDrag();
        this.clearPreview();
        this.emitStatus(); // 草稿已空 → 复位状态栏
        return;
      }
      this.resetDrag();
      this.emitStatus({ error: `${this.name}: 区域创建失败，请重试` });
    } catch (err) {
      this.resetDrag();
      if (err instanceof DrawValidationError) {
        this.emitStatus({ error: err.message });
        return;
      }
      throw err;
    }
  }

  /**
   * 拖拽类状态发布：cursor = 最近落点管线产出；草稿非空时面类附 length+area、
   * 线类（自由跟踪 / 椭圆半轴阶段）附 length；vertexCount = 草稿点数。
   */
  protected override emitStatus(extra: { error?: string } = {}): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const payload: DrawStatusPayload = { ...extra };
    if (this.lastGround) payload.cursor = { x: this.lastGround.x, y: this.lastGround.y };
    if (this.draftPoints.length > 0) {
      if (this.draftClosed) {
        const ring = [...this.draftPoints, this.draftPoints[0]!];
        payload.length = polylineLength(ring);
        payload.area = polygonArea(this.draftPoints);
      } else {
        payload.length = polylineLength(this.draftPoints);
      }
      payload.vertexCount = this.draftPoints.length;
    }
    ctx.eventBus.emit('draw:status', payload);
  }

  /** 拖拽开始钩子（记录起点、初始化草稿点列与预览） */
  protected abstract onDragStart(p: Vec2): void;

  /** 拖拽移动钩子（更新草稿点列并推送预览） */
  protected abstract onDragMove(p: Vec2): void;

  /** 拖拽结束钩子（组装 RegionShape 提交或发拦截提示） */
  protected abstract onDragEnd(p: Vec2): void;
}
