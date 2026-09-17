/**
 * editor/tools/draw/DrawToolBase —— 七形状绘制工具共享基座（T3.2 奠基，T6.5 形状驱动重构）。
 *
 * 职责：收敛七工具（多边形/矩形/圆形/椭圆/自由/线/点）的公共交互语义——
 *   - 激活参数 { shape, perspective? } 校验（须为合法 ShapeType 且与本工具 shapeType 一致）；
 *   - 进入绘制：默认 CameraPort.setMode('top') + setOrthoLock(true)（网格显示/间距归
 *     环境通道 environment.grid，工具只消费共享吸附步长配置）；perspective:true 保留用户
 *     当前机位仅锁旋转；退出恢复进入前机位（getMode 记录 / setMode 还原，T4.1 B3）+ 解锁；
 *   - 落点管线：地面投影 → Shift 正交锁定 / A 键 45° 锁定（互斥，Shift 优先）→ G 键网格吸附
 *     （默认开，步长 = 共享配置 drawGrid.spacing），产出同时驱动游标与落点；
 *   - 预览与会话：半成品只经 PreviewPort.updateDrawPreview（DrawPreviewState 快照，
 *     面类五形状映射 Polygon 点列、line→LineString、point→Point，分域契约 §D 预览映射），
 *     不触 SceneManager、不产生 Command；
 *   - 状态栏：draw:status 事件（payload 见 core/events DrawStatusPayload）——移动/落点/
 *     辅助键切换/完成/拦截时发出，vertexCount 随七形状发出（2026-09-11 预授权增补）、
 *     面类附 length+area、line 附 length；错误随下一次正常状态自然清除；
 *   - 完成 → createRegionObject（semantic=unclassified + default_solid）→ CreateObjectCommand
 *     入历史 → 自动选中新对象 → 完成钩子（组合根注入 setExitToSelect：三步流「回选择工具」
 *     的应用层策略；点工具覆写 exitsOnComplete=false 保持连续放置段合并撤销语义）；
 *     归层按语义注册表 defaultLayerName 完成时按名解析（「未分类」缺层 → null）。
 * 边界：零 THREE；工具不直接写 SceneManager（创建经命令）；cancel/deactivate 只清理临时状态，
 *      零 Command；一切扩展经 shapeType 抽象与受保护钩子，禁止散落形状字符串判断。
 */
import { polygonArea, polylineLength } from '../../../core/math';
import type { ID, Vec2, Vec3 } from '../../../core/types';
import type { DrawStatusPayload } from '../../../core/events/events';
import {
  clonePoints,
  createRegionObject,
  getSemanticDefinition,
} from '../../../domain/regions';
import type { RegionObject, RegionShape, ShapeType } from '../../../domain/regions';
import { isShapeType } from '../../../domain/regions';
import type { GeometryType } from '../../../domain/geometry';
import type {
  LineStringGeometryData,
  PointGeometryData,
  PolygonGeometryData,
} from '../../../domain/geometry';
import { CreateObjectCommand } from '../../commands/CreateObjectCommand';
import type { KeyboardEventInfo, PointerEventInfo } from '../../services/ports';
import type { DrawPreviewState } from '../../services/ports';
import type { Tool, ToolContext } from '../Tool';
import { DrawSession } from './DrawSession';
import { DrawValidationError } from './DrawValidationError';
import type { DrawGridConfig } from './DrawGridConfig';
import { createDrawGridConfig } from './DrawGridConfig';
import { angleLock, gridSnap, orthoLock } from './snap';

/** 七形状绘制工具统一激活参数（CONTRACTS.md Tool 契约的 activate(params) 自定义结构） */
export interface DrawToolParams {
  /** 形状类型（须与本工具 shapeType 一致；守卫误接线） */
  shape: ShapeType;
  /** 透视绘制开关：true 保留用户当前机位（不切顶视），仅锁旋转 */
  perspective?: boolean;
}

/** 角度锁定步长（度） */
const ANGLE_STEP_DEG = 45;

/** 绘制初始语义（三步流第一步：未分类区域） */
const INITIAL_SEMANTIC = 'unclassified' as const;

/** 面类形状（预览映射 Polygon / closed=true；line→LineString、point→Point） */
export const AREA_SHAPE_TYPES: readonly ShapeType[] = [
  'polygon',
  'rectangle',
  'circle',
  'ellipse',
  'freehand',
];

/** ShapeType → DrawPreviewState.geometryType（分域契约 §D「几何两套标准」① 预览映射） */
export function previewGeometryTypeOf(shape: ShapeType): GeometryType {
  if (AREA_SHAPE_TYPES.includes(shape)) return 'Polygon';
  if (shape === 'line') return 'LineString';
  return 'Point';
}

export abstract class DrawToolBase implements Tool {
  abstract readonly id: string;
  abstract readonly name: string;

  /**
   * 共享网格吸附配置（组合根注入；缺省独立对象 = 5 m + 吸附开）。
   * UI GridSettings 经组合根超集更新 spacing、主菜单「工具 → 吸附」更新
   * snapEnabled（T5.2），绘制中即时生效；snapEnabled 与会话级 G 键开关取「与」。
   */
  protected readonly drawGrid: DrawGridConfig;

  /** 本工具产出的形状类型（决定会话种类与 RegionShape.type） */
  protected abstract readonly shapeType: ShapeType;

  /** 完成后是否触发完成钩子（三步流回选择工具；点工具覆写 false 保持连续放置） */
  protected readonly exitsOnComplete: boolean = true;

  protected ctx: ToolContext | null = null;
  protected perspective = false;
  /** 绘制会话（activate 时按预览几何类型重建；构造期占位，禁用前不被消费） */
  protected session = new DrawSession('Point');
  /** A 键 45° 锁定开关（默认关） */
  protected lock45 = false;
  /** G 键网格吸附开关（默认开；步长取共享配置） */
  protected gridSnapEnabled = true;
  /** 最近一次落点管线产出（辅助键切换后原地重投影用；拖拽类工具复用为拖拽重投影基准） */
  protected lastGround: Vec2 | null = null;
  protected lastShift = false;
  /** 本工具是否切过顶视（退出恢复判定；perspective:true 恒 false） */
  private enteredTop = false;
  /** 进入绘制前的用户机位（activate 记录、deactivate 还原；perspective:true 不消费） */
  private savedMode: 'perspective' | 'top' | 'front' | 'side' = 'perspective';
  /** 是否已向 PreviewPort 推过绘制预览（清理时避免空触 Port） */
  private previewShown = false;
  /** 完成钩子（组合根注入：完成 → 回选择工具的应用层策略） */
  private exitToSelect: (() => void) | null = null;

  constructor(drawGrid?: DrawGridConfig) {
    this.drawGrid = drawGrid ?? createDrawGridConfig();
  }

  /**
   * 注入完成钩子（三步流「完成即回选择工具」）：app/bootstrap 装配时调用，
   * 工具层不持有 ToolManager（契约 ToolContext 无此依赖），策略归组合根。
   */
  setExitToSelect(hook: (() => void) | null): void {
    this.exitToSelect = hook;
  }

  activate(ctx: ToolContext, params?: unknown): void {
    const parsed = this.parseParams(params);
    this.ctx = ctx;
    this.perspective = parsed.perspective;
    this.session = new DrawSession(previewGeometryTypeOf(this.shapeType));
    this.lock45 = false;
    this.gridSnapEnabled = true;
    this.lastGround = null;
    this.lastShift = false;
    this.previewShown = false;
    this.enteredTop = false;
    this.savedMode = ctx.camera.getMode(); // 记录原机位（在切 top 之前取）
    if (!this.perspective) {
      ctx.camera.setMode('top');
      this.enteredTop = true;
    }
    ctx.camera.setOrthoLock(true);
    this.resetDraft();
  }

  deactivate(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    this.clearDraft();
    ctx.camera.setOrthoLock(false);
    if (this.enteredTop) ctx.camera.setMode(this.savedMode); // 还原进入前机位（不承诺自由姿态快照）
    this.enteredTop = false;
    this.ctx = null;
  }

  onPointerMove(e: PointerEventInfo): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const p = this.resolveAidedGround(e);
    if (p === null) return; // 射线背离地面：保留游标上次位置
    this.trackGround(p, e.shiftKey);
    this.session.moveCursor(p);
    this.refreshPreview();
    this.emitStatus();
  }

  onPointerDown(e: PointerEventInfo): void {
    if (e.button !== 'left') {
      // 防御路径：右键/中键即取消手势（激活态退出由 ToolManager.cancel 负责）
      this.cancel();
      return;
    }
    const ctx = this.ctx;
    if (!ctx) return;
    const p = this.resolveAidedGround(e);
    if (p === null) return; // 无地面投影：不落点、不入历史
    this.trackGround(p, e.shiftKey);

    const anchor = this.currentAnchor();
    const duplicate = anchor !== null && anchor.x === p.x && anchor.y === p.y;
    if (!duplicate) {
      this.session.addPoint(p);
      this.onPointAdded(p);
    }
    this.session.moveCursor(p);
    this.refreshPreview();
    this.emitStatus();
  }

  onPointerUp(_e: PointerEventInfo): void {
    // 点击类工具完成语义在 pointerDown / 双击；拖拽类工具覆写
  }

  /** 双击：位置为新点时补入（去重）后完成；点/拖拽工具覆写为无操作 */
  onDoubleClick(e: PointerEventInfo): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const p = this.resolveAidedGround(e);
    if (p !== null) {
      this.trackGround(p, e.shiftKey);
      const last = this.draftLastPoint();
      if (last === null || last.x !== p.x || last.y !== p.y) {
        this.session.addPoint(p);
      }
      this.session.moveCursor(p);
    }
    this.finishDrawing();
  }

  onKeyDown(e: KeyboardEventInfo): void {
    const ctx = this.ctx;
    if (!ctx) return;
    if (e.key === 'Escape') {
      // 防御路径：就地清草稿（激活态退出由 app 层 input → ToolManager.cancel 负责）
      this.cancel();
      return;
    }
    if (e.ctrlKey || e.altKey) return; // 组合键归浏览器/应用级快捷键
    const key = e.key.toLowerCase();
    if (key === 'a') {
      this.lock45 = !this.lock45;
      this.refreshFromLastGround();
    } else if (key === 'g') {
      this.gridSnapEnabled = !this.gridSnapEnabled;
      this.refreshFromLastGround();
    }
  }

  /** 退出手势：丢弃草稿、清预览（零 Command）；已落地对象归历史管理，保留不动 */
  cancel(): void {
    if (!this.ctx) return;
    this.session.cancel();
    this.resetDraft();
    this.clearPreview();
    this.emitStatus(); // 草稿已空 → 复位状态栏
  }

  // ── 子类扩展点 ──────────────────────────────────────────

  /** 锚点：落点管线中正交/角度锁定的参照（默认 = 草稿末点；点工具覆写为上一放置点） */
  protected currentAnchor(): Vec2 | null {
    return this.draftLastPoint();
  }

  /** 草稿末点（重复连击去重的比对基准；与锚点独立） */
  protected draftLastPoint(): Vec2 | null {
    const points = this.session.state.points;
    return points.length > 0 ? points[points.length - 1]! : null;
  }

  /** 确认落点后的钩子：点工具在此即时完成；线/面工具等待双击 */
  protected onPointAdded(_p: Vec2): void {
    // 线/面：加点即可，完成在双击
  }

  /**
   * 提交形状产物：组装 RegionObject（unclassified + default_solid + 完成时归层）→
   * CreateObjectCommand 一条历史 → 自动选中 → 完成钩子（exitsOnComplete）。
   * 返回创建的对象（失败返回 null：场景与历史回到完成前）。
   */
  protected commitShape(shape: RegionShape): RegionObject | null {
    const ctx = this.ctx;
    if (!ctx) return null;
    const region = createRegionObject({
      shape,
      semanticType: INITIAL_SEMANTIC,
      name: this.nextRegionName(),
      layerId: this.resolveInitialLayerId(),
    });
    if (!ctx.history.execute(new CreateObjectCommand(region))) {
      return null;
    }
    ctx.selection.select(region.id); // 三步流：自动选中新对象（上下文条类型/样式快选的数据源）
    if (this.exitsOnComplete) this.exitToSelect?.();
    return region;
  }

  /** 草稿复位钩子（activate/cancel 时清理拖拽类工具的会话外状态；点击类工具无额外状态） */
  protected resetDraft(): void {
    // 基座无额外状态；拖拽类工具覆写
  }

  /** 拖拽/跟踪中的预览推送（点击类工具经 refreshPreview 走会话快照；拖拽类直接给点列） */
  protected pushPreview(state: DrawPreviewState): void {
    const ctx = this.ctx;
    if (!ctx) return;
    this.previewShown = true;
    ctx.preview.updateDrawPreview(state);
  }

  /** 当前状态的顶点计数（vertexCount 载荷；默认 = 会话点数，拖拽类工具覆写） */
  protected currentVertexCount(): number | undefined {
    const count = this.session.state.points.length;
    return count > 0 ? count : undefined;
  }

  /** 辅助键切换后按最近落点原地重投影（游标/预览/状态同步刷新；拖拽类覆写补拖拽态刷新） */
  protected refreshFromLastGround(): void {
    if (!this.ctx || !this.lastGround) return;
    const p = this.applyAids(this.lastGround, this.lastShift);
    this.lastGround = p;
    this.session.moveCursor(p);
    this.refreshPreview();
    this.emitStatus();
  }

  /** 双击完成：组装校验（DrawSession → validateGeometry）→ 成功提交并复位；失败发错误状态并保留草稿 */
  private finishDrawing(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    try {
      const geometry = this.session.complete(); // 成功即复位会话（支持连续绘制）
      if (this.commitShape(this.buildRegionShape(geometry)) !== null) {
        this.lastGround = null;
        this.clearPreview();
        this.emitStatus(); // 草稿已空 → 复位状态栏
      } else {
        this.emitStatus({ error: `${this.name}: 区域创建失败，请重试` });
      }
    } catch (err) {
      if (err instanceof DrawValidationError) {
        // 自相交/顶点不足等：拦截并提示，已绘点保留供修正
        this.emitStatus({ error: err.message });
        return;
      }
      throw err;
    }
  }

  // ── 内部 ─────────────────────────────-───────────────

  /** 激活参数校验：非法抛错（activate 失败 → ToolManager 复位为无激活） */
  private parseParams(raw: unknown): { perspective: boolean } {
    if (typeof raw !== 'object' || raw === null) {
      throw new Error(`${this.name}: 缺少激活参数（需要 { shape }）`);
    }
    const source = raw as Record<string, unknown>;
    if (!isShapeType(source.shape)) {
      throw new Error(`${this.name}: 参数 shape 必须是合法形状类型（实际：${String(source.shape)}）`);
    }
    if (source.shape !== this.shapeType) {
      throw new Error(`${this.name}: 形状不匹配（工具支持 ${this.shapeType}，收到 ${source.shape}）`);
    }
    return { perspective: source.perspective === undefined ? false : Boolean(source.perspective) };
  }

  /** 地面投影 + 辅助管线（null = 无有效投影） */
  protected resolveAidedGround(e: PointerEventInfo): Vec2 | null {
    const ctx = this.ctx;
    if (!ctx) return null;
    const ground = ctx.viewport.groundPoint(e.screenX, e.screenY);
    if (!ground) return null;
    return this.applyAids({ x: ground.x, y: ground.z }, e.shiftKey); // Vec2.y 即世界 z
  }

  /** 记录最近落点与 Shift 态（辅助键切换重投影基准） */
  protected trackGround(p: Vec2, shiftKey: boolean): void {
    this.lastGround = p;
    this.lastShift = shiftKey;
  }

  /** 落点管线：正交锁定（Shift，主轴取偏移大者）或 45° 锁定（A）→ 网格吸附（G，默认开） */
  protected applyAids(raw: Vec2, shiftKey: boolean): Vec2 {
    let p = raw;
    const from = this.currentAnchor();
    if (from) {
      if (shiftKey) {
        const axis: 'x' | 'z' =
          Math.abs(p.x - from.x) >= Math.abs(p.y - from.y) ? 'x' : 'z';
        p = orthoLock(from, p, axis);
      } else if (this.lock45) {
        p = angleLock(from, p, ANGLE_STEP_DEG);
      }
    }
    // 全局开关（菜单）与会话开关（G 键）取「与」——任一关闭即不吸附（T5.2）
    if (this.gridSnapEnabled && this.drawGrid.snapEnabled) {
      p = gridSnap(p, this.drawGrid.spacing);
    }
    return p;
  }

  /** 校验后的 GeometryData → RegionShape（polygon 环去重复闭合点；闭合由 closed 表达） */
  private buildRegionShape(
    geometry: PointGeometryData | LineStringGeometryData | PolygonGeometryData,
  ): RegionShape {
    const def = getSemanticDefinition(INITIAL_SEMANTIC)!;
    if (geometry.type === 'Point') {
      return {
        type: 'point',
        points: [geometry.coordinates],
        baseHeight: def.defaultBaseHeight,
        closed: false,
      };
    }
    if (geometry.type === 'LineString') {
      return {
        type: 'line',
        points: clonePoints(geometry.coordinates),
        baseHeight: def.defaultBaseHeight,
        closed: false,
      };
    }
    const ring = geometry.coordinates[0]!;
    // 首尾闭合点去除（shapePoints 契约：点列不重复闭合点，闭合由 closed 表达）
    const open = ring.length > 1 && ring[0]!.x === ring.at(-1)!.x && ring[0]!.y === ring.at(-1)!.y
      ? ring.slice(0, -1)
      : ring;
    return {
      type: this.shapeType,
      points: clonePoints(open),
      baseHeight: def.defaultBaseHeight,
      closed: true,
    };
  }

  /** 未分类默认图层解析（语义注册表单一真相源；「未分类」层缺省不存在 → null 落未分层） */
  protected resolveInitialLayerId(): ID | null {
    const def = getSemanticDefinition(INITIAL_SEMANTIC)!;
    return this.ctx?.sceneManager.getLayers().find((l) => l.name === def.defaultLayerName)?.id ?? null;
  }

  /** 「未命名区域 N」：场景现存 region 计数 + 1（undo 后可能重号——名称非唯一键，可接受） */
  protected nextRegionName(): string {
    const count = this.ctx?.sceneManager.getObjects((o) => o.type === 'region').length ?? 0;
    return `未命名区域 ${count + 1}`;
  }

  /** 推送会话快照到预览 Port（半成品唯一可见通道） */
  private refreshPreview(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    this.pushPreview(this.session.state);
  }

  /** 清空绘制预览（从未推送时不触 Port） */
  protected clearPreview(): void {
    const ctx = this.ctx;
    if (!ctx || !this.previewShown) return;
    this.previewShown = false;
    ctx.preview.clear();
  }

  /** 丢弃草稿并清预览（deactivate 复用） */
  private clearDraft(): void {
    this.session.cancel();
    this.resetDraft();
    this.clearPreview();
  }

  /** 发出绘制状态：cursor 恒随游标；面类附 length+area；线附 length；vertexCount 随七形状 */
  protected emitStatus(extra: { error?: string } = {}): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const state = this.session.state;
    const payload: DrawStatusPayload = { ...extra };
    if (state.cursor) payload.cursor = { x: state.cursor.x, y: state.cursor.y };
    const isArea = previewGeometryTypeOf(this.shapeType) === 'Polygon';
    if (this.shapeType !== 'point') {
      const chain = state.cursor ? [...state.points, state.cursor] : [...state.points];
      payload.length = polylineLength(chain);
      if (isArea) payload.area = polygonArea(chain);
    }
    const vertexCount = this.currentVertexCount();
    if (vertexCount !== undefined) payload.vertexCount = vertexCount;
    ctx.eventBus.emit('draw:status', payload);
  }
}

/** 地面投影 Vec3(x, y=0, z) → 业务 Vec2(x, 世界 z) */
export function toVec2(ground: Vec3): Vec2 {
  return { x: ground.x, y: ground.z };
}
