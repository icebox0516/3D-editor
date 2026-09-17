/**
 * editor/tools/draw/DrawPolygonTool —— 多边形绘制工具（T3.2 奠基；T6.5 改产 RegionObject）。
 *
 * 职责：点击加点、双击闭合生成多边形（DrawSession 首环自动闭合 + 顶点顺序就地修复）；
 *      校验自相交与最少顶点（domain validateGeometry 经 DrawSession.complete 触发），
 *      非法完成被拦截：错误经 draw:status 提示、场景与历史零变化、已绘点保留供修正；
 *      面积/周长链/顶点数实时经 draw:status（payload.area / length / vertexCount）。
 * 三步流（T6.5）：完成 → RegionObject（shape.type='polygon'，semantic=unclassified +
 *      default_solid）→ 自动选中 → 回选择工具；每次完成各一条历史（阶段门 2026-09-09）。
 * 边界：零 THREE；双击前半成品只经 PreviewPort；顶点顺序自动修复（顺时针反转）
 *      由 domain 校验就地完成，工具不重复实现。
 */
import type { ShapeType } from '../../../domain/regions';
import type { DrawGridConfig } from './DrawGridConfig';
import { DrawToolBase } from './DrawToolBase';

export class DrawPolygonTool extends DrawToolBase {
  readonly id = 'draw-polygon';
  readonly name = '多边形绘制';

  protected readonly shapeType: ShapeType = 'polygon';

  constructor(drawGrid?: DrawGridConfig) {
    super(drawGrid);
  }
}
