/**
 * editor/tools/draw/DrawPointTool —— 点（POI）绘制工具（T3.2 奠基；T6.5 改产 RegionObject）。
 *
 * 职责：点击即在落点处生成点形状 RegionObject（shape.type='point'，closed=false，
 *      semantic=unclassified + default_solid）并连续绘制（左键确认、右键/ESC 退出）；
 *      锚点 = 上一放置点（连续点绘制时 Shift 正交 / A 45° 锁定 / G 网格吸附仍生效，
 *      便于沿轴/沿网格成排放置）；草稿零滞留——每次点击即完成（DrawSession 取首点）；
 *      每次点击后自动选中新点（三步流赋类型入口）。
 * 历史粒度（阶段门 2026-09-09，T6.5 沿用）：连续点绘制段合并为一条历史——复用 T2.2
 *      PlacementTool 的会话批次原地增长协议（每次点击 undo 弹出本会话批次 → 与新命令
 *      重建更大的 BatchCommand 重新入栈；弹出批次被外部命令顶替时还原并另起会话）；
 *      切换形状/重新激活（= 另一段）另起一段。与面/线工具不同：完成后**保持激活**
 *      （exitsOnComplete=false，连续放置语义），退出（ESC/切工具）时最后放置的点保持
 *      选中——上下文条类型快选随即可用，三步流闭环。
 * 边界：零 THREE；一切创建经 CreateObjectCommand/BatchCommand；半成品无可见预览
 *      （游标标记经 PreviewPort），cancel/deactivate 零 Command。
 */
import type { ID, Vec2 } from '../../../core/types';
import type { RegionShape, ShapeType } from '../../../domain/regions';
import { createRegionObject, getSemanticDefinition } from '../../../domain/regions';
import { BatchCommand } from '../../commands/BatchCommand';
import { CreateObjectCommand } from '../../commands/CreateObjectCommand';
import type { PointerEventInfo } from '../../services/ports';
import type { DrawGridConfig } from './DrawGridConfig';
import { DrawToolBase } from './DrawToolBase';

export class DrawPointTool extends DrawToolBase {
  readonly id = 'draw-point';
  readonly name = '点绘制';

  protected readonly shapeType: ShapeType = 'point';

  /** 点工具保持连续放置：完成后不触发回选择钩子（退出时选中保留） */
  protected readonly exitsOnComplete = false;

  constructor(drawGrid?: DrawGridConfig) {
    super(drawGrid);
  }

  /** 上一放置点（锚点与重复连击去重基准；会话内持续，跨完成不清） */
  private lastPlaced: Vec2 | null = null;
  /** 本会话已入批的创建命令（连续段合并协议） */
  private sessionCommands: CreateObjectCommand[] = [];
  /** 本会话批次是否已在历史栈顶（下次点击需先弹出再重建更大的批） */
  private sessionCommitted = false;
  /** 本会话首枚对象 id（防御：判定 undo 弹出的是否本会话批次） */
  private firstPlacedId: ID | null = null;

  override activate(...args: Parameters<DrawToolBase['activate']>): void {
    super.activate(...args);
    this.lastPlaced = null;
    this.resetBatch();
  }

  override deactivate(): void {
    super.deactivate();
    this.lastPlaced = null;
    this.resetBatch();
  }

  /** 双击无额外语义：点工具每次左键即完成（基座补点逻辑不适用） */
  override onDoubleClick(_e: PointerEventInfo): void {
    // 无操作
  }

  protected override currentAnchor(): Vec2 | null {
    return this.lastPlaced;
  }

  /** 点击即完成：取会话首点组装点形状并按会话批次提交 */
  protected override onPointAdded(p: Vec2): void {
    let shape: RegionShape;
    try {
      // 1 点即成，会话复位（连续绘制）；Point 只需 1 个有限坐标点，管线产出恒满足
      const geometry = this.session.complete();
      if (geometry.type !== 'Point') {
        throw new Error('点绘制会话产出非 Point 几何（防御路径）');
      }
      shape = {
        type: 'point',
        points: [geometry.coordinates],
        baseHeight: getSemanticDefinition('unclassified')!.defaultBaseHeight,
        closed: false,
      };
    } catch {
      // 防御性兜底不发命令
      this.emitStatus({ error: '点绘制校验失败，请重试' });
      return;
    }
    if (this.commitBatched(shape)) {
      this.lastPlaced = p;
    }
  }

  /** 放置后状态：cursor 恒随游标；vertexCount=1（点形状单顶点） */
  protected override currentVertexCount(): number | undefined {
    return this.lastPlaced !== null ? 1 : undefined;
  }

  /**
   * 会话批次提交（连续段合并为一条历史，协议同 PlacementTool）：
   * 已提交过 → undo 弹出本会话批次 → 全部会话命令 + 新命令重建更大的批入栈；
   * 弹出的不是本会话批次（外部命令入栈顶替）→ redo 还原并另起会话；
   * 新批原子失败 → 恢复旧批，场景回到本次点击前。
   * 每次成功后自动选中新点（三步流：上下文条类型快选的数据源）。
   */
  private commitBatched(shape: RegionShape): boolean {
    const ctx = this.ctx;
    if (!ctx) return false;
    const region = createRegionObject({
      shape,
      semanticType: 'unclassified',
      name: this.nextRegionName(),
      layerId: this.resolveInitialLayerId(),
    });
    const cmd = new CreateObjectCommand(region);

    let undidSession = false;
    if (this.sessionCommitted) {
      ctx.history.undo(); // 弹出会话批次（其对象随之移除），随后整批重建
      undidSession = true;
      if (this.firstPlacedId !== null && ctx.sceneManager.getObject(this.firstPlacedId) !== undefined) {
        ctx.history.redo(); // 弹出的不是本会话批次：还原该命令，另起会话
        this.resetBatch();
        undidSession = false;
      }
    }

    const batch = new BatchCommand([...this.sessionCommands, cmd]);
    if (!ctx.history.execute(batch)) {
      if (undidSession) {
        ctx.history.execute(new BatchCommand([...this.sessionCommands])); // 恢复旧批
      }
      this.emitStatus({ error: '点区域创建失败，请重试' });
      return false;
    }
    this.sessionCommands.push(cmd);
    this.sessionCommitted = true;
    if (this.firstPlacedId === null) this.firstPlacedId = region.id;
    ctx.selection.select(region.id); // 自动选中新点（三步流）
    return true;
  }

  /** 会话批次复位（activate 另起一段 / deactivate 清场） */
  private resetBatch(): void {
    this.sessionCommands = [];
    this.sessionCommitted = false;
    this.firstPlacedId = null;
  }
}
