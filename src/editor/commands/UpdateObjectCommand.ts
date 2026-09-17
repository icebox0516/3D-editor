/**
 * editor/commands/UpdateObjectCommand —— 对象顶层字段修改命令（T2.4 增补）。
 *
 * 职责：修改对象的顶层展示字段（name / visible / locked——场景树重命名、眼睛/锁图标）；
 *      before/after 只快照被 patch 的键，undo/redo 完整往返。
 * 边界：属基础 8 命令之外的按需增补（ChangePropertyCommand 只覆盖 properties 记录，
 *      transform/layerId/style/geometry 各有专命令）；id 不在可改字段内
 *      （SceneManager 禁改 id，误传构造期抛错快速暴露）；对象不存在时 execute 返回
 *      false；从未成功执行时 undo/redo 无操作（幂等）。
 */
import type { ID } from '../../core/types';
import type { SceneObject } from '../../scene/SceneObject';
import { CommandBase } from './Command';
import type { CommandContext } from './CommandContext';

/** 允许经本命令修改的顶层字段（展示性字段；结构性字段各有专命令） */
type ObjectFieldPatch = Partial<Pick<SceneObject, 'name' | 'visible' | 'locked'>>;

const PATCHABLE_KEYS = ['name', 'visible', 'locked'] as const;

export class UpdateObjectCommand extends CommandBase {
  readonly name = 'UpdateObjectCommand';
  private readonly objectId: ID;
  private readonly after: Record<string, unknown>;
  private before: Record<string, unknown> | null = null;

  constructor(objectId: ID, patch: ObjectFieldPatch) {
    super();
    this.objectId = objectId;
    const source = patch as Record<string, unknown>;
    for (const key of Object.keys(source)) {
      if (!(PATCHABLE_KEYS as readonly string[]).includes(key)) {
        throw new Error(`UpdateObjectCommand: 不支持修改字段 ${key}（仅 name/visible/locked）`);
      }
    }
    this.after = { ...source };
  }

  canExecute(): boolean {
    return Object.keys(this.after).length > 0; // 空补丁无语义
  }

  execute(ctx: CommandContext): boolean {
    const target = ctx.sceneManager.getObject(this.objectId);
    if (!target) return false;
    const record = target as unknown as Record<string, unknown>;
    const before: Record<string, unknown> = {};
    for (const key of Object.keys(this.after)) {
      before[key] = record[key];
    }
    this.before = before;
    ctx.sceneManager.updateObject(this.objectId, { ...this.after } as ObjectFieldPatch);
    this.emitSceneChanged(ctx);
    return true;
  }

  undo(ctx: CommandContext): void {
    if (!this.before) return;
    ctx.sceneManager.updateObject(this.objectId, { ...this.before } as ObjectFieldPatch);
    this.emitSceneChanged(ctx);
  }

  redo(ctx: CommandContext): void {
    if (!this.before) return; // 从未成功执行过
    ctx.sceneManager.updateObject(this.objectId, { ...this.after } as ObjectFieldPatch);
    this.emitSceneChanged(ctx);
  }
}
