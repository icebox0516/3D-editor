/**
 * editor/commands/UpdateLayerCommand —— 图层属性修改命令（T2.4 增补）。
 *
 * 职责：修改图层展示字段（name / visible / locked / opacity / order——图层面板的
 *      显示/锁/透明度/拖拽排序/重命名）；execute 成功后 layer:updated（Renderer 重应用
 *      成员的可见性与透明度）+ scene:changed；undo/redo 按 patch 键完整往返。
 * 边界：属基础 8 命令之外的按需增补（ChangeLayerCommand 只覆盖对象→图层归属迁移，
 *      不覆盖图层自身属性）；objectIds 为派生索引，不在此修改；图层不存在时 execute
 *      返回 false；从未成功执行时 undo/redo 无操作（幂等）。
 */
import type { ID } from '../../core/types';
import type { Layer } from '../../scene/Layer';
import { CommandBase } from './Command';
import type { CommandContext } from './CommandContext';

/** 允许经本命令修改的图层字段 */
type LayerFieldPatch = Partial<Pick<Layer, 'name' | 'visible' | 'locked' | 'opacity' | 'order'>>;

const PATCHABLE_KEYS = ['name', 'visible', 'locked', 'opacity', 'order'] as const;

export class UpdateLayerCommand extends CommandBase {
  readonly name = 'UpdateLayerCommand';
  private readonly layerId: ID;
  private readonly after: Record<string, unknown>;
  private before: Record<string, unknown> | null = null;

  constructor(layerId: ID, patch: LayerFieldPatch) {
    super();
    this.layerId = layerId;
    const source = patch as Record<string, unknown>;
    for (const key of Object.keys(source)) {
      if (!(PATCHABLE_KEYS as readonly string[]).includes(key)) {
        throw new Error(
          `UpdateLayerCommand: 不支持修改字段 ${key}（仅 name/visible/locked/opacity/order）`,
        );
      }
    }
    this.after = { ...source };
  }

  canExecute(): boolean {
    return Object.keys(this.after).length > 0; // 空补丁无语义
  }

  execute(ctx: CommandContext): boolean {
    const layer = ctx.sceneManager.getLayer(this.layerId);
    if (!layer) return false;
    const record = layer as unknown as Record<string, unknown>;
    const before: Record<string, unknown> = {};
    for (const key of Object.keys(this.after)) {
      before[key] = record[key];
    }
    this.before = before;
    ctx.sceneManager.updateLayer(this.layerId, { ...this.after } as LayerFieldPatch);
    // SceneManager.updateLayer 已发 layer:updated + scene:changed(updateLayer)；
    // 命令级再发一次提供变更归因（T1.5 既定双发语义，订阅方幂等）
    this.emitSceneChanged(ctx);
    return true;
  }

  undo(ctx: CommandContext): void {
    if (!this.before) return;
    ctx.sceneManager.updateLayer(this.layerId, { ...this.before } as LayerFieldPatch);
    this.emitSceneChanged(ctx);
  }

  redo(ctx: CommandContext): void {
    if (!this.before) return; // 从未成功执行过
    ctx.sceneManager.updateLayer(this.layerId, { ...this.after } as LayerFieldPatch);
    this.emitSceneChanged(ctx);
  }
}
