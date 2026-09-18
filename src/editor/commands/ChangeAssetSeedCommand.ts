/**
 * editor/commands/ChangeAssetSeedCommand —— ModelObject 变体 seed 重掷命令（T008.4）。
 *
 * 职责：整体替换 model 对象的 asset.seed，并同步替换 transform（调用侧经
 *      domain/assets resampleVariantTransform 预采样的重掷变换——变体合成项
 *      按新旧 seed 采样差换算，用户 gizmo 编辑保留）。渲染侧按 object:updated
 *      keys 含 'asset' 重挂实例池：shapeFamily 槽路由、instanceColor 色相、
 *      aSeed 风相位全部随新 seed 复算（新 seed 允许路由回同槽——共享同一 Source、
 *      仅实例表现变化，D19 契约内正常行为）。
 * 载荷：after 为构造时预计算的 { seed, transform }（CommandContext 无 registries，
 *      沿 ChangePresetCommand 收预计算载荷先例；变体声明由调用侧经注册表解析）。
 * 边界：目标必须是携带数值 asset.seed 的 ModelObject（isModelObject + seed 守卫；
 *      拖放入库的确定性对象无 seed → 无变体通道 → execute 返回 false）；
 *      before/after 快照深拷贝，undo/redo 幂等对已删除对象静默；asset 其余字段
 *      （assetId 等）随快照保留，不被重掷波及。
 */
import { deepClone } from '../../core/utils';
import type { ID, Transform } from '../../core/types';
import { isModelObject } from '../../domain/assets';
import type { ModelObject } from '../../domain/assets';
import type { SceneObject } from '../../scene/SceneObject';
import { CommandBase } from './Command';
import type { CommandContext } from './CommandContext';

/** 重掷载荷（调用侧预计算：新 seed + 重采样 transform） */
export interface AssetSeedNext {
  seed: number;
  transform: Transform;
}

/** 对象 asset + transform 的整体快照（before/after 同构） */
interface AssetSeedState {
  asset: ModelObject['asset'];
  transform: Transform;
}

export class ChangeAssetSeedCommand extends CommandBase {
  readonly name = 'ChangeAssetSeedCommand';
  private readonly objectId: ID;
  private readonly next: AssetSeedNext;
  private before: AssetSeedState | null = null;
  private after: AssetSeedState | null = null;

  constructor(objectId: ID, next: AssetSeedNext) {
    super();
    this.objectId = objectId;
    this.next = deepClone(next);
  }

  canExecute(): boolean {
    // seed 与 rollVariantSeed 同域（非负 31 位整数，JSON 无损落盘）；transform 结构由类型保证
    return (
      Number.isInteger(this.next.seed) && this.next.seed >= 0 && Number.isFinite(this.next.seed)
    );
  }

  execute(ctx: CommandContext): boolean {
    const target = ctx.sceneManager.getObject(this.objectId);
    if (!target || !isModelObject(target)) return false; // 对象不存在，或非 model 对象
    const currentSeed = target.asset.seed;
    if (typeof currentSeed !== 'number' || !Number.isFinite(currentSeed)) {
      return false; // 无 seed 的确定性对象（拖放入库）无变体通道
    }
    this.before = { asset: deepClone(target.asset), transform: deepClone(target.transform) };
    this.after = { asset: { ...this.before.asset, seed: this.next.seed }, transform: deepClone(this.next.transform) };
    this.apply(ctx, this.after);
    return true;
  }

  undo(ctx: CommandContext): void {
    if (this.before) this.apply(ctx, this.before);
  }

  redo(ctx: CommandContext): void {
    if (this.after) this.apply(ctx, this.after);
  }

  /** 应用一组快照（深拷贝下发，防快照与场景引用共享） */
  private apply(ctx: CommandContext, state: AssetSeedState): void {
    ctx.sceneManager.updateObject(this.objectId, {
      asset: deepClone(state.asset),
      transform: deepClone(state.transform),
    } as Partial<SceneObject>);
    this.emitSceneChanged(ctx);
  }
}
