/**
 * editor/tools/draw/DrawSession —— 绘制会话（半成品的临时管理者）。
 *
 * 职责：绘制过程中临时收纳 geometryType 与已落点坐标、跟踪游标、对外暴露预览状态
 *      （DrawPreviewState 快照，供 PreviewPort.updateDrawPreview 渲染临时预览）；
 *      complete() 按几何类型的前置规则组装 GeometryData，并统一经 domain 层
 *      validateGeometry 校验（自相交/非法坐标拦截、顶点顺序自动修复），非法抛
 *      DrawValidationError（含 ValidationError 列表）供工具层提示。
 * 边界：纯逻辑，零 three、零 DOM；不持有 SceneManager——半成品零接触正式场景与历史，
 *      完成产物交由工具层经 CreateObjectCommand 落地（CONTRACTS.md #3/#4）；
 *      complete 规则：Point 需 1 点（多余点取首点，点工具一次点击即完成）；
 *      LineString ≥2 点；Polygon ≥3 点且首环自动闭合（首尾点补齐，已闭合不重复补）。
 */
import type { Vec2 } from '../../../core/types';
import type { GeometryType, LineStringGeometryData, PointGeometryData, PolygonGeometryData } from '../../../domain/geometry';
import type { ValidationError } from '../../../domain/validate/validateGeometry';
import { validateGeometry } from '../../../domain/validate/validateGeometry';
import type { DrawPreviewState } from '../../services/ports';
import { DrawValidationError } from './DrawValidationError';

/** 深拷贝单点，隔离会话内外（入参/产物互不影响） */
function copyPoint(p: Vec2): Vec2 {
  return { x: p.x, y: p.y };
}

export class DrawSession {
  readonly geometryType: GeometryType;

  private points: Vec2[] = [];
  private cursor: Vec2 | null = null;

  constructor(geometryType: GeometryType) {
    this.geometryType = geometryType;
  }

  /** 预览状态快照：外部篡改不污染会话内部；closed 表示预览按闭合形状渲染（Polygon） */
  get state(): DrawPreviewState {
    return {
      geometryType: this.geometryType,
      points: this.points.map(copyPoint),
      cursor: this.cursor === null ? null : copyPoint(this.cursor),
      closed: this.geometryType === 'Polygon',
    };
  }

  /** 落一个点（复制入参） */
  addPoint(p: Vec2): void {
    this.points.push(copyPoint(p));
  }

  /** 移动游标到当前位置（复制入参），仅影响预览，不参与校验 */
  moveCursor(p: Vec2): void {
    this.cursor = copyPoint(p);
  }

  /**
   * 完成绘制：前置点数规则 → 组装 GeometryData（Polygon 首环自动闭合）→
   * validateGeometry 校验（顶点顺序等就地自动修复）→ 失败抛 DrawValidationError
   * （保留已绘点供用户修正）→ 成功返回标准几何并复位会话（支持连续绘制）。
   * 返回具体几何联合（Point/LineString/Polygon，供调用方按 type 判别收窄）。
   */
  complete(): PointGeometryData | LineStringGeometryData | PolygonGeometryData {
    let geometry: PointGeometryData | LineStringGeometryData | PolygonGeometryData;
    if (this.geometryType === 'Point') {
      this.requireMinPoints(1, 'Point 绘制需要 1 个点');
      geometry = { type: 'Point', coordinates: copyPoint(this.points[0]!) };
    } else if (this.geometryType === 'LineString') {
      this.requireMinPoints(2, 'LineString 绘制至少需要 2 个点');
      geometry = { type: 'LineString', coordinates: this.points.map(copyPoint) };
    } else {
      this.requireMinPoints(3, 'Polygon 绘制至少需要 3 个点');
      geometry = { type: 'Polygon', coordinates: [this.buildClosedRing()] };
    }

    const result = validateGeometry(geometry);
    if (!result.valid) {
      throw new DrawValidationError(result.errors);
    }
    this.reset();
    return geometry;
  }

  /** 取消绘制：丢弃全部临时点与游标（ESC / 右键），不产生任何产物 */
  cancel(): void {
    this.reset();
  }

  /** 组装闭合外环：复制已绘点，首尾未闭合时补首点（已闭合不重复补） */
  private buildClosedRing(): Vec2[] {
    const ring = this.points.map(copyPoint);
    const first = ring[0]!;
    const last = ring[ring.length - 1]!;
    if (first.x !== last.x || first.y !== last.y) {
      ring.push(copyPoint(first));
    }
    return ring;
  }

  /** 前置点数规则：不足即抛 DrawValidationError(TOO_FEW_VERTICES) */
  private requireMinPoints(min: number, message: string): void {
    if (this.points.length < min) {
      const error: ValidationError = { code: 'TOO_FEW_VERTICES', message, index: 0 };
      throw new DrawValidationError([error]);
    }
  }

  private reset(): void {
    this.points = [];
    this.cursor = null;
  }
}
