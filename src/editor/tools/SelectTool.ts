/**
 * editor/tools/SelectTool —— 选择工具（T1.6 点击选择 → T2.4 框选/多选/锁定过滤增强）。
 *
 * 职责：
 *  - 点击：左键经 ViewportPort 射线拾取——命中且未锁定则选择；shift/ctrl+点击切换式多选
 *    （已选移除/未选追加）；点空处清空选中集；
 *  - 框选（T2.4）：空白处按下并拖拽超过阈值 → 屏幕矩形经 RectPickPort.pickInRect 求交，
 *    矩形投影四角经 groundPoint 落到地面由 PreviewPort 绘制闭合多边形预览（临时、不入
 *    场景、不入历史）；松开一次性 selectMany（Ctrl/Shift 按下时与既有选中集取并集）；
 *  - 锁定过滤：对象 locked 或所属图层 locked → 点击视同空点、框选结果剔除
 *    （需求 §选择「锁定」语义；数据仍可经场景树/属性面板解锁）。
 *  - 双击进入顶点编辑（T6.8）：双击命中未锁定 region → 经注入钩子分发
 *    （组合根接线 tools.activate('vertex-edit', { objectId })）；未注入时不响应。
 * 边界：只改 SelectionManager（选中集不是可见场景修改，不经 Command/历史）；
 *      框选拾取能力经构造注入（未注入时退化为纯点击语义，不抛错）；
 *      不写 SceneManager、不触碰渲染对象；cancel 清理框选临时态，零 Command。
 */
import type { PointerEventInfo } from '../services/ports';
import type { RectPickPort } from '../services/ports';
import { isRegionObject } from '../../domain/regions';
import type { Tool, ToolContext } from './Tool';

/** 框选启动阈值（CSS 像素）：位移不超过此值视为点击而非拖拽 */
const MARQUEE_THRESHOLD_PX = 3;

/** 进行中的框选手势（pointerDown 于空白处时建立，pointerUp 消费） */
interface MarqueeState {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** 追加模式（Ctrl/Shift 按下）：完成后与既有选中集取并集 */
  additive: boolean;
  /** 追加模式下要保留的既有选中集快照（按下时捕获，非追加模式已清空） */
  base: string[];
  /** 是否已超过阈值进入拖拽 */
  dragging: boolean;
}

export class SelectTool implements Tool {
  readonly id = 'select';
  readonly name = '选择';

  private ctx: ToolContext | null = null;
  /** 框选拾取能力（可选注入；null 时框选退化） */
  private readonly rectPick: RectPickPort | null;
  /** 双击进入顶点编辑钩子（可选注入；组合根接线 tools.activate('vertex-edit')） */
  private readonly onEnterVertexEdit: ((objectId: string) => void) | null;
  private marquee: MarqueeState | null = null;
  /** 框选预览当前是否在显示（避免无预览时的多余清除调用） */
  private previewShown = false;

  constructor(rectPick: RectPickPort | null = null, onEnterVertexEdit?: (objectId: string) => void) {
    this.rectPick = rectPick;
    this.onEnterVertexEdit = onEnterVertexEdit ?? null;
  }

  activate(ctx: ToolContext): void {
    this.ctx = ctx;
  }

  deactivate(): void {
    this.clearMarqueePreview();
    this.marquee = null;
    this.ctx = null;
  }

  onPointerDown(e: PointerEventInfo): void {
    if (e.button !== 'left') return; // 右键/中键由 app 层统一作为退出手势处理
    const ctx = this.ctx;
    if (!ctx) return;

    const hitId = ctx.viewport.pickObject(e.screenX, e.screenY);
    if (hitId !== null && !this.isLocked(ctx, hitId)) {
      if (e.shiftKey || e.ctrlKey) {
        // 切换式多选：已选移除、未选追加
        if (ctx.selection.isSelected(hitId)) {
          ctx.selection.remove(hitId);
        } else {
          ctx.selection.add(hitId);
        }
      } else {
        ctx.selection.select(hitId);
      }
      return;
    }

    // 空白（或锁定对象）：进入潜在框选——先快照既有选中集（追加模式框选完成时取并集），
    // 再按原点击语义立即清空；拖拽超过阈值后升级为框选，未超过阈值保持清空结果。
    const additive = e.shiftKey || e.ctrlKey;
    const base = additive ? ctx.selection.getSelectedIds() : [];
    this.marquee = {
      x0: e.screenX,
      y0: e.screenY,
      x1: e.screenX,
      y1: e.screenY,
      additive,
      base,
      dragging: false,
    };
    ctx.selection.clear();
  }

  onPointerMove(e: PointerEventInfo): void {
    const m = this.marquee;
    if (!m) return; // 一期无 hover 高亮语义
    m.x1 = e.screenX;
    m.y1 = e.screenY;
    if (!m.dragging) {
      const dx = Math.abs(m.x1 - m.x0);
      const dy = Math.abs(m.y1 - m.y0);
      if (dx < MARQUEE_THRESHOLD_PX && dy < MARQUEE_THRESHOLD_PX) return;
      m.dragging = true;
    }
    this.drawMarqueePreview();
  }

  onPointerUp(_e: PointerEventInfo): void {
    const ctx = this.ctx;
    const m = this.marquee;
    this.marquee = null;
    this.clearMarqueePreview();
    if (!ctx || !m) return;

    if (!m.dragging) return; // 点击空白：清空已在 pointerDown 完成
    const rectPick = this.rectPick;
    if (!rectPick) return; // 无框选能力：保持清空结果（拖拽退化）

    const ids = rectPick
      .pickInRect(m.x0, m.y0, m.x1, m.y1)
      .filter((id) => ctx.sceneManager.getObject(id) !== undefined && !this.isLocked(ctx, id));
    ctx.selection.selectMany(m.additive ? union(m.base, ids) : ids);
  }

  /**
   * 双击 region 对象 → 快捷进入顶点编辑（T6.8 视口入口；钩子由组合根注入）。
   * 前 two 次 pointerdown/click 已按点击选择语义处理（对象已选中），此处只分发入口。
   * 非 region / 空白 / 锁定对象不触发。
   */
  onDoubleClick(e: PointerEventInfo): void {
    const ctx = this.ctx;
    const hook = this.onEnterVertexEdit;
    if (!ctx || !hook) return;
    const hitId = ctx.viewport.pickObject(e.screenX, e.screenY);
    if (hitId === null || this.isLocked(ctx, hitId)) return;
    const obj = ctx.sceneManager.getObject(hitId);
    if (obj && isRegionObject(obj)) hook(hitId);
  }

  /** 退出手势：清理框选临时态；选中集保留（跨工具状态），不产生任何 Command */
  cancel(): void {
    this.clearMarqueePreview();
    this.marquee = null;
  }

  // ── 内部 ────────────────────────────────────────────────

  /** 对象锁定 = 自身 locked ∨ 所属图层 locked；不存在的 id 视同锁定（不可选） */
  private isLocked(ctx: ToolContext, id: string): boolean {
    const obj = ctx.sceneManager.getObject(id);
    if (!obj) return true;
    if (obj.locked) return true;
    if (obj.layerId !== null) {
      const layer = ctx.sceneManager.getLayer(obj.layerId);
      if (layer?.locked) return true;
    }
    return false;
  }

  /** 框选矩形预览：四角投影地面 → 闭合多边形（预览 Port 临时绘制，不入场景/历史） */
  private drawMarqueePreview(): void {
    const ctx = this.ctx;
    const m = this.marquee;
    if (!ctx || !m || !this.rectPick) return; // 无框选能力不画预览
    const corners: Array<[number, number]> = [
      [m.x0, m.y0],
      [m.x1, m.y0],
      [m.x1, m.y1],
      [m.x0, m.y1],
    ];
    const points = [];
    for (const [x, y] of corners) {
      const ground = ctx.viewport.groundPoint(x, y);
      if (!ground) return; // 视线背离地面（如矩形越过地平线）：跳过本帧预览
      points.push({ x: ground.x, y: ground.z });
    }
    ctx.preview.updateDrawPreview({
      geometryType: 'Polygon',
      points,
      cursor: null,
      closed: true,
    });
    this.previewShown = true;
  }

  /** 清除框选预览（空点集；从未绘制时不触 Port） */
  private clearMarqueePreview(): void {
    if (!this.previewShown) return;
    this.previewShown = false;
    this.ctx?.preview.updateDrawPreview({
      geometryType: 'LineString',
      points: [],
      cursor: null,
      closed: false,
    });
  }
}

/** 保持首次出现顺序的并集 */
function union(base: readonly string[], extra: readonly string[]): string[] {
  const out: string[] = [];
  for (const id of [...base, ...extra]) {
    if (!out.includes(id)) out.push(id);
  }
  return out;
}
