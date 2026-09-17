/**
 * editor/commands/ChangeSemanticCommand —— RegionObject 语义层一切变更命令（阶段 6 T6.1）。
 *
 * 职责（分域契约 §A 注记，一条历史整体回退）：
 *  - ①类型切换：semantic 替换 + 自动迁入新类型默认图层 + style 重置（新类型 defaultPresetId +
 *    overrides 清空）；undo 时三项（semantic/layerId/style）一并恢复；
 *  - ②业务参数变更（类型不变）：仅替换 semantic，layerId 与 style 原样不动。
 * 边界：自动归层按新类型 defaultLayerName 在场景图层**按名查找**（命令内部完成，不 import app；
 *      语义→默认图层名的单一真相源 = 语义注册表 defaultLayerName 字段，主代理裁决 2026-09-11，
 *      旧「按要素类型默认图层名表」已于 T6.7 删除）；目标图层缺失 → layerId=null 落「未分层」（任务书
 *      明文许可，沿 bootstrap defaultLayerIdFor 现状语义）；目标必须是 RegionObject，否则
 *      execute 返回 false；快照深拷贝；undo/redo 幂等。
 */
import { deepClone } from '../../core/utils';
import type { ID } from '../../core/types';
import { getSemanticDefinition, isRegionObject } from '../../domain/regions';
import type { RegionSemantic, RegionStyle, SemanticType } from '../../domain/regions';
import type { SceneObject } from '../../scene/SceneObject';
import { CommandBase } from './Command';
import type { CommandContext } from './CommandContext';

/** 语义层快照（execute 时一次性采集；类型切换涉及三字段联动） */
interface SemanticSnapshot {
  semantic: RegionSemantic;
  layerId: ID | null;
  style: RegionStyle;
}

/** 语义变更载荷：类型 + 完整业务参数（面板提交整体替换 properties） */
export interface SemanticChange {
  type: SemanticType;
  properties: Record<string, unknown>;
}

export class ChangeSemanticCommand extends CommandBase {
  readonly name = 'ChangeSemanticCommand';
  private readonly objectId: ID;
  private readonly after: SemanticChange;
  private before: SemanticSnapshot | null = null;
  private planned: SemanticSnapshot | null = null;
  /** 是否成功执行过（区分「未执行」与「before 恰为空值」） */
  private executed = false;

  constructor(objectId: ID, next: SemanticChange) {
    super();
    this.objectId = objectId;
    this.after = deepClone(next);
  }

  canExecute(): boolean {
    // 语义类型必须在注册定义内（内置十类；自定义类型接入走注册制后由注册表判定）
    return (
      getSemanticDefinition(this.after.type) !== undefined &&
      typeof this.after.properties === 'object' &&
      this.after.properties !== null
    );
  }

  execute(ctx: CommandContext): boolean {
    const target = ctx.sceneManager.getObject(this.objectId);
    if (!target || !isRegionObject(target)) {
      return false; // 对象不存在，或非 RegionObject
    }
    const def = getSemanticDefinition(this.after.type);
    if (!def) return false; // 防御：绕过 canExecute 的直接调用

    this.before = {
      semantic: deepClone(target.semantic),
      layerId: target.layerId,
      style: deepClone(target.style),
    };

    const nextSemantic: RegionSemantic = deepClone(this.after);
    this.planned =
      target.semantic.type === this.after.type
        ? {
            // ②业务参数变更：几何顶点不动、归层与样式原样
            semantic: nextSemantic,
            layerId: target.layerId,
            style: deepClone(target.style),
          }
        : {
            // ①类型切换：自动迁入类型默认图层（按名查找，缺失落 null=未分层）+ 重置样式
            semantic: nextSemantic,
            layerId:
              ctx.sceneManager.getLayers().find((layer) => layer.name === def.defaultLayerName)?.id ?? null,
            style: { presetId: def.defaultPresetId, overrides: {} },
          };
    this.executed = true;
    this.apply(ctx, this.planned);
    return true;
  }

  undo(ctx: CommandContext): void {
    if (!this.executed || !this.before) return;
    this.apply(ctx, this.before);
  }

  redo(ctx: CommandContext): void {
    if (!this.executed || !this.planned) return;
    this.apply(ctx, this.planned);
  }

  /** 应用一次语义层快照（semantic/layerId/style 一并落库 + 广播） */
  private apply(ctx: CommandContext, snapshot: SemanticSnapshot): void {
    ctx.sceneManager.updateObject(this.objectId, {
      semantic: deepClone(snapshot.semantic),
      layerId: snapshot.layerId,
      style: deepClone(snapshot.style),
    } as Partial<SceneObject>);
    this.emitSceneChanged(ctx);
  }
}
