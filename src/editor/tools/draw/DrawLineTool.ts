/**
 * editor/tools/draw/DrawLineTool —— 路径（线）绘制工具（T3.2 奠基；T6.5 改产 RegionObject）。
 *
 * 职责：点击加点、移动实时预览（含游标弹性段）、双击结束生成路径；
 *      落点过 DrawToolBase 辅助管线（Shift 正交 / A 45° / G 网格吸附）；
 *      长度与顶点数实时经 draw:status（payload.length / vertexCount）。
 * 三步流（T6.5）：完成 → RegionObject（shape.type='line'，closed=false，
 *      semantic=unclassified + default_solid）→ 自动选中 → 回选择工具；
 *      每次完成各一条历史（阶段门 2026-09-09）。
 * 边界：零 THREE；双击前半成品只经 PreviewPort；顶点不足由 DrawSession.complete
 *      前置规则拦截（错误经 draw:status，已绘点保留可续绘）。
 */
import type { ShapeType } from '../../../domain/regions';
import type { DrawGridConfig } from './DrawGridConfig';
import { DrawToolBase } from './DrawToolBase';

export class DrawLineTool extends DrawToolBase {
  readonly id = 'draw-line';
  readonly name = '路径绘制';

  protected readonly shapeType: ShapeType = 'line';

  constructor(drawGrid?: DrawGridConfig) {
    super(drawGrid);
  }
}
