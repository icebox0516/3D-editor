/**
 * editor/tools/PlacementTool —— 模型放置工具（T1.6 建立，T2.2 增强，T002.3 变体掷骰）。
 *
 * 职责：接收 { assetId, continuous, randomRotation, randomScale, mergeBatch } 参数；Ghost 预览经
 *      PreviewPort 跟随鼠标（不进 SceneManager、不入历史）；左键在地面投影处生成
 *      ModelObject 并经 CreateObjectCommand → HistoryManager 落地；continuous 默认 true
 *      （放置后重摇随机值继续）；右键 / ESC 清理 Ghost 退出且已放置对象保留。
 * 增强（T2.2）：
 *   - 放置中滚轮缩放 Ghost（临时系数，每档 ±0.1，夹在 [0.2, 5]），R 键旋转 Ghost +45°/次
 *     （绕 Y 轴）——均为预览参数，与随机值一样在落点时进 CreateObjectCommand 的 transform，
 *     会话内保留、重新激活复位；
 *   - 地面吸附恒开：落点 XZ 由 ViewportPort.groundPoint 的地面平面（y=0）投影保证，
 *     工具不加开关；y 自 T9.2 起为 ground.y + MODEL_BASE_HEIGHT（模型底面微抬，消共面
 *     z-fighting；Ghost 与落地同源，所见即所放）；
 *   - mergeBatch（默认 true）：一次激活会话内的连续放置合并为一个 BatchCommand 历史
 *     （undo 一次全撤、redo 一次全恢复）；false 时逐条入栈（T1.6 语义）。
 * 烘焙式变体（T002.3，D6）：激活时保留完整 descriptor——资产为程序化且声明变体
 *   （任一 jitter > 0）时启用掷骰：每枚放置 rollVariantSeed 掷新 seed →
 *   applyAssetVariants 确定性采样 → scaleFactor/rotationYOffset 与既有随机参数、
 *   R 键、滚轮系数**乘性/加性合成**进 buildTransform（Ghost 与落地同 transform，
 *   所见即所放；hue 不在 Ghost 呈现——instanceColor 在落地时由渲染侧按 seed 复算，
 *   Ghost 显示源模板原色）；seed 经工厂写入 obj.asset.seed 随场景落盘。连续放置
 *   每枚重摇（含新 seed）。GLB（无 variants 声明）路径零变化：不掷 seed、合成项恒等。
 *   拖放路径（App onDrop）有意保持确定性、不注入 seed（与 GLB 拖放同语义）。
 * 边界：零 THREE；不直接写 SceneManager（写操作只见 CreateObjectCommand / BatchCommand）；
 *      cancel/deactivate 只清理临时状态，不产生任何 Command。
 *
 * 随机语义（既定决策）：区间采样值相对资产默认值——
 *   rotation.y = defaultRotation.y + uniform(randomRotation[0..1])（仅绕 Y，Y 向上约定）；
 *   scale = defaultScale × uniform(randomScale[0..1])（均匀系数）。
 * 每放置一枚重摇一次；移动期间随机值保持稳定（Ghost 不抖动，所见即所放）。
 *
 * 会话批次协议（mergeBatch=true）：每次点击先 undo 弹出本会话已提交的批次（其对象随之移除），
 * 再以「全部会话子命令 + 本次新命令」重建更大的 BatchCommand 重新入栈——任意时刻历史中本会话
 * 恰为 1 条且对象即时可见。防御：若 undo 弹出的不是本会话批次（期间有外部命令入栈，以会话首枚
 * 对象是否仍在场景判定），则 redo 还原该命令并另起会话，绝不吞并外部命令。
 */
import type { ID, Transform, Vec3 } from '../../core/types';
import { MODEL_BASE_HEIGHT } from '../../domain/assets';
import { applyAssetVariants, hasVariantJitter, rollVariantSeed } from '../../domain/assets';
import type { AssetCommonMeta, ProceduralVariants } from '../../domain/assets';
import type { ModelObject, VariantSample } from '../../domain/assets';
import { BatchCommand } from '../commands/BatchCommand';
import { CreateObjectCommand } from '../commands/CreateObjectCommand';
import { createModelObjectAt } from '../factories/modelFactory';
import type { KeyboardEventInfo, PointerEventInfo } from '../services/ports';
import type { Tool, ToolContext } from './Tool';

/** 放置工具参数（activate(params) 的既定结构） */
export interface PlacementParams {
  /** 目标资产 id（必须已注册于 AssetRegistry） */
  assetId: ID;
  /** 连续放置：true（默认）放置后保持工具与 Ghost 继续；false 放置一次后停止 */
  continuous?: boolean;
  /** 随机 Y 轴旋转区间（弧度，[min, max]，相对资产 defaultRotation.y） */
  randomRotation?: [number, number];
  /** 随机均匀缩放区间（系数 [min, max]，乘以资产 defaultScale） */
  randomScale?: [number, number];
  /**
   * 放置对象归属图层（缺省 null：由调用方/组合根按默认图层表决定后传入）。
   * 增补注记（T1.8）：向后兼容的可选参数——放置归层随 CreateObjectCommand 一并落地，
   * 避免组合根在事件订阅里绕过命令直接改写 layerId。
   */
  layerId?: ID | null;
  /**
   * 连续放置合并为一次撤销（默认 true）：会话内全部放置打包为一条 BatchCommand 历史；
   * false 时逐条入栈，每次 undo 撤销一枚。增补注记（T2.2）。
   */
  mergeBatch?: boolean;
}

/** 放置对象类型标识（SceneObject.type；构建逻辑自 T5.5 起收编 factories/modelFactory） */

/** 滚轮缩放系数边界与步长（每档 = sign(delta) × STEP） */
const WHEEL_SCALE_MIN = 0.2;
const WHEEL_SCALE_MAX = 5;
const WHEEL_SCALE_STEP = 0.1;
/** R 键单次旋转步长：45°（弧度，绕 Y 轴） */
const KEY_ROTATE_STEP = Math.PI / 4;

export class PlacementTool implements Tool {
  readonly id = 'placement';
  readonly name = '放置';

  private ctx: ToolContext | null = null;
  private params: PlacementParams | null = null;
  private asset: AssetCommonMeta | null = null;
  /** 激活资产的变体声明（T002.3：仅程序化且任一 jitter>0 时非空；GLB 恒 null 零变化） */
  private variants: ProceduralVariants | null = null;
  /** Ghost 是否处于显示态（PreviewPort 无查询接口，本地记账避免重复 show/hide） */
  private ghostVisible = false;
  /** 单次模式（continuous:false）放置完成后置位，直至重新激活 */
  private done = false;
  /** 当前已摇出的随机量：Y 旋转增量与均匀缩放系数 */
  private rolledRotationY = 0;
  private rolledScaleFactor = 1;
  /** 当前已摇出的变体（T002.3）：seed 与其确定性采样结果（同 seed 同结果） */
  private rolledSeed: number | null = null;
  private rolledVariant: VariantSample | null = null;
  /** 滚轮缩放系数（会话内保留；夹在 [WHEEL_SCALE_MIN, WHEEL_SCALE_MAX]） */
  private wheelScaleFactor = 1;
  /** R 键累计旋转量（弧度，绕 Y；会话内保留） */
  private keyRotationY = 0;
  /** 最近一次有效地面投影（wheel/R 后原地刷新 Ghost 用） */
  private lastGround: Vec3 | null = null;
  /** 本会话已入批的创建命令（mergeBatch=true 时逐次并入会话批次） */
  private sessionCommands: CreateObjectCommand[] = [];
  /** 本会话批次是否已在历史栈顶（下次点击需先弹出再重建更大的批） */
  private sessionCommitted = false;
  /** 本会话首枚对象 id（防御：判定 undo 弹出的是否本会话批次） */
  private firstPlacedId: ID | null = null;

  activate(ctx: ToolContext, params?: unknown): void {
    const parsed = this.parseParams(ctx, params);
    this.ctx = ctx;
    this.params = parsed;
    // T002.3：保留完整 descriptor 判 kind——程序化且声明变体（任一 jitter>0）才启用掷骰；
    // GLB（无 variants）路径零变化（不掷 seed、buildTransform 合成项恒等）
    const descriptor = ctx.registries.assets.get(parsed.assetId);
    this.asset = descriptor?.asset ?? null;
    const declared = descriptor?.kind === 'procedural' ? descriptor.asset.variants : undefined;
    this.variants = declared !== undefined && hasVariantJitter(declared) ? declared : null;
    this.ghostVisible = false;
    this.done = false;
    this.lastGround = null;
    this.wheelScaleFactor = 1;
    this.keyRotationY = 0;
    this.resetSession();
    this.roll();
  }

  deactivate(): void {
    this.hideGhost();
    this.reset();
  }

  onPointerMove(e: PointerEventInfo): void {
    const ctx = this.ctx;
    if (!ctx || !this.params || this.done) return;

    const ground = ctx.viewport.groundPoint(e.screenX, e.screenY);
    if (!ground) return; // 射线背向地面：保留 Ghost 上次位置
    this.lastGround = ground;

    const t = this.buildTransform(ground);
    if (this.ghostVisible) {
      ctx.preview.updateGhost(t);
    } else {
      ctx.preview.showGhost(this.params.assetId, t);
      this.ghostVisible = true;
    }
  }

  onPointerDown(e: PointerEventInfo): void {
    if (e.button !== 'left') {
      // 防御路径：右键/中键即退出手势，就地清理（激活态退出由 ToolManager.cancel 负责）
      this.cancel();
      return;
    }
    const ctx = this.ctx;
    if (!ctx || !this.asset || !this.params || this.done) return;

    const ground = ctx.viewport.groundPoint(e.screenX, e.screenY);
    if (!ground) return; // 点击处无地面投影：不放置、不入历史
    this.lastGround = ground;

    // 对象构建走共享工厂（T5.5 抽取；字段语义与原内联字面量逐项等价，行为零变化），
    // transform 传入本工具的采样结果（随机区间 + 变体采样 + R 键 + 滚轮系数，见 buildTransform）；
    // 变体启用时 seed 随对象落盘（渲染侧按 seed 复算 hue，撤销/重做/重载同色）
    const asset = this.asset;
    const object: ModelObject = createModelObjectAt({
      asset,
      layerId: this.params.layerId ?? null,
      transform: this.buildTransform(ground),
      seed: this.rolledSeed ?? undefined,
    });

    const ok = this.commitPlacement(object);
    if (!ok) return; // 执行失败：场景未变，不推进工具状态

    if (this.params.continuous) {
      // 连续放置：重摇下一枚随机值，Ghost 更新为新姿态（未显示则从当前位置亮出）
      this.roll();
      const next = this.buildTransform(ground);
      if (this.ghostVisible) {
        ctx.preview.updateGhost(next);
      } else {
        ctx.preview.showGhost(this.params.assetId, next);
        this.ghostVisible = true;
      }
    } else {
      // 单次放置：隐藏 Ghost 并停止响应后续点击（重新激活后复位）
      this.hideGhost();
      this.done = true;
    }
  }

  onPointerUp(_e: PointerEventInfo): void {
    // 放置语义在 pointerDown 完成
  }

  onKeyDown(e: KeyboardEventInfo): void {
    // 防御路径：ESC 就地清理临时状态（激活态退出由 app 层 input → ToolManager.cancel 负责）
    if (e.key === 'Escape') {
      this.cancel();
      return;
    }
    // R 键旋转 Ghost +45°/次（大小写均生效；Ctrl/Alt 组合多为浏览器/应用级快捷键，忽略）
    if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.altKey) {
      if (!this.ctx || !this.params || this.done) return;
      this.keyRotationY += KEY_ROTATE_STEP;
      this.refreshGhost();
    }
  }

  onWheel(delta: number): void {
    if (!this.ctx || !this.params || this.done) return;
    if (!Number.isFinite(delta) || delta === 0) return;
    const next = this.wheelScaleFactor + Math.sign(delta) * WHEEL_SCALE_STEP;
    this.wheelScaleFactor = Math.min(WHEEL_SCALE_MAX, Math.max(WHEEL_SCALE_MIN, next));
    this.refreshGhost();
  }

  /** 退出手势：清理 Ghost 等临时状态；已放置对象经命令落地，保留不动；零 Command */
  cancel(): void {
    this.hideGhost();
  }

  // ── 内部 ────────────────────────────────────────────────

  /** 校验并固化参数；非法参数抛错（activate 失败 → ToolManager 复位为无激活） */
  private parseParams(
    ctx: ToolContext,
    raw: unknown,
  ): PlacementParams & { continuous: boolean; mergeBatch: boolean } {
    if (typeof raw !== 'object' || raw === null) {
      throw new Error('PlacementTool: 缺少放置参数（需要 { assetId }）');
    }
    const source = raw as Record<string, unknown>;
    if (typeof source.assetId !== 'string' || source.assetId === '') {
      throw new Error('PlacementTool: 参数 assetId 必须是非空字符串');
    }
    if (!ctx.registries.assets.get(source.assetId)) {
      throw new Error(`PlacementTool: 资产未注册: ${source.assetId}`);
    }
    const continuous = source.continuous === undefined ? true : Boolean(source.continuous);
    const mergeBatch = source.mergeBatch === undefined ? true : Boolean(source.mergeBatch);
    const randomRotation = parseRange(source.randomRotation, 'randomRotation');
    const randomScale = parseRange(source.randomScale, 'randomScale');
    const layerId = parseLayerId(source.layerId);
    return { assetId: source.assetId, continuous, mergeBatch, randomRotation, randomScale, layerId };
  }

  /**
   * 落地一次放置：
   * - mergeBatch=false：直接经 CreateObjectCommand 入栈（T1.6 语义）；
   * - mergeBatch=true：先弹出本会话已提交批次（见类头「会话批次协议」），再与其余会话命令
   *   合并重建更大的 BatchCommand 入栈；弹出批次被外部命令顶替时还原并另起会话。
   * 返回是否成功（失败时场景与历史均回到点击前）。
   */
  private commitPlacement(object: ModelObject): boolean {
    const ctx = this.ctx;
    const params = this.params;
    if (!ctx || !params) throw new Error('PlacementTool: 工具未激活即调用'); // 理论不可达：调用点已判空

    const cmd = new CreateObjectCommand(object);
    if (!params.mergeBatch) {
      return ctx.history.execute(cmd);
    }

    let undidSession = false;
    if (this.sessionCommitted) {
      ctx.history.undo(); // 弹出会话批次（其对象随之移除），随后整批重建
      undidSession = true;
      if (this.firstPlacedId !== null && ctx.sceneManager.getObject(this.firstPlacedId) !== undefined) {
        // 弹出的不是本会话批次（期间有外部命令入栈或批次被逐条展开）：还原该命令，另起会话
        ctx.history.redo();
        this.resetSession();
        undidSession = false;
      }
    }

    const batch = new BatchCommand([...this.sessionCommands, cmd]);
    if (!ctx.history.execute(batch)) {
      if (undidSession) {
        // 新批原子失败（内部已回滚）：恢复旧批，场景回到本次点击前
        ctx.history.execute(new BatchCommand([...this.sessionCommands]));
      }
      return false;
    }
    this.sessionCommands.push(cmd);
    this.sessionCommitted = true;
    if (this.firstPlacedId === null) this.firstPlacedId = object.id;
    return true;
  }

  /** 重摇随机量（无对应随机参数时归位恒等值 0 / 1）；
   *  T002.3：变体启用时掷新 seed 并确定性采样（每枚放置重摇，含新 seed） */
  private roll(): void {
    const p = this.params;
    this.rolledRotationY = p?.randomRotation ? uniform(p.randomRotation[0], p.randomRotation[1]) : 0;
    this.rolledScaleFactor = p?.randomScale ? uniform(p.randomScale[0], p.randomScale[1]) : 1;
    if (this.variants) {
      this.rolledSeed = rollVariantSeed();
      this.rolledVariant = applyAssetVariants(this.variants, this.rolledSeed);
    } else {
      this.rolledSeed = null;
      this.rolledVariant = null;
    }
  }

  /**
   * 组装当前放置/Ghost 变换：位置 = 地面点 + 贴地抬升（y = ground.y + MODEL_BASE_HEIGHT，
   * T9.2：模型底面比承托面高 lift，消与地面的精确共面 z-fighting；groundPoint 保证
   * y=0，故落点恒为 lift——Ghost 与落地共用本函数，所见即所放），
   * 姿态 = 资产默认 + 已摇随机量 + 变体旋转偏移 + R 键累计（加性合成）；
   * 缩放 = 资产默认 × 随机系数 × 变体系数 × 滚轮系数（乘性合成）。
   * T002.3 注记：变体 hue 不在 Ghost 呈现（instanceColor 落地时由渲染侧按 seed 复算）；
   * 变体未启用时合成项恒等（×1 / +0），GLB 路径行为零变化。
   */
  private buildTransform(ground: Vec3): Transform {
    const asset = this.asset;
    if (!asset) throw new Error('PlacementTool: 资产未就绪（未激活即调用）'); // 理论不可达：调用点均已判空
    const variantScaleFactor = this.rolledVariant?.scaleFactor ?? 1;
    const variantRotationY = this.rolledVariant?.rotationYOffset ?? 0;
    const scaleFactor = this.rolledScaleFactor * this.wheelScaleFactor * variantScaleFactor;
    return {
      position: { x: ground.x, y: ground.y + MODEL_BASE_HEIGHT, z: ground.z },
      rotation: {
        x: asset.defaultRotation.x,
        y: asset.defaultRotation.y + this.rolledRotationY + this.keyRotationY + variantRotationY,
        z: asset.defaultRotation.z,
      },
      scale: {
        x: asset.defaultScale.x * scaleFactor,
        y: asset.defaultScale.y * scaleFactor,
        z: asset.defaultScale.z * scaleFactor,
      },
    };
  }

  /** wheel/R 后原地刷新 Ghost（未显示或无已知地面点时不触 Port，仅更新内部参数） */
  private refreshGhost(): void {
    const ctx = this.ctx;
    if (!ctx || !this.params || this.done || !this.ghostVisible || !this.lastGround) return;
    ctx.preview.updateGhost(this.buildTransform(this.lastGround));
  }

  /** 隐藏 Ghost（幂等：未显示时不调用 Port） */
  private hideGhost(): void {
    if (!this.ghostVisible) return;
    this.ghostVisible = false;
    this.ctx?.preview.hideGhost();
  }

  /** 会话批次状态复位（activate 另起会话 / 防御路径放弃当前会话） */
  private resetSession(): void {
    this.sessionCommands = [];
    this.sessionCommitted = false;
    this.firstPlacedId = null;
  }

  private reset(): void {
    this.ctx = null;
    this.params = null;
    this.asset = null;
    this.variants = null;
    this.ghostVisible = false;
    this.done = false;
    this.rolledRotationY = 0;
    this.rolledScaleFactor = 1;
    this.rolledSeed = null;
    this.rolledVariant = null;
    this.wheelScaleFactor = 1;
    this.keyRotationY = 0;
    this.lastGround = null;
    this.resetSession();
  }
}

/** [min, max] 区间解析：undefined 透传；结构非法或 min>max 抛错 */
function parseRange(value: unknown, label: string): [number, number] | undefined {
  if (value === undefined) return undefined;
  if (
    !Array.isArray(value) ||
    value.length !== 2 ||
    typeof value[0] !== 'number' ||
    typeof value[1] !== 'number' ||
    !Number.isFinite(value[0]) ||
    !Number.isFinite(value[1])
  ) {
    throw new Error(`PlacementTool: 参数 ${label} 必须是 [number, number]`);
  }
  if (value[0] > value[1]) {
    throw new Error(`PlacementTool: 参数 ${label} 区间非法（min > max）`);
  }
  return [value[0], value[1]];
}

/** layerId 解析：undefined/null → null；非空字符串透传；其余类型抛错 */
function parseLayerId(value: unknown): ID | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' && value !== '') return value;
  throw new Error('PlacementTool: 参数 layerId 必须是非空字符串或 null');
}

/** [min, max] 均匀采样 */
function uniform(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
