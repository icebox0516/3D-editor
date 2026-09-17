/**
 * ui/panels/batchRenameModel —— 批量重命名模型纯函数（T8.3 §2）。
 *
 * 职责：多选（或单图层筛选集）批量重命名的规则求值与命令规划——
 *   - 两模式单选互斥（Blender Ctrl+F2 / UE Advanced Rename 双先例，阶段门裁定纳入）：
 *     prefix = 前缀 + 序号（起始/步长/位数填充 1..3）、replace = 查找替换
 *     （全部出现处替换；空查找串禁用确认——园区改名清理「楼1」→「宿舍楼1」高频场景）；
 *   - applyBatchRename：名称列表 → 新名称列表（非法步长/空查找串原样返回）；
 *   - batchRenamePreview：实时预览载荷（前 8 条 from→to + more + total——
 *     Blender/UE 原生无实时预览属社区诟病点，我方补齐为加分项）；
 *   - batchRenameCommand：逐对象 UpdateObjectCommand(name) 经 BatchCommand 合一条
 *     历史（N=1 单命令；无变化 → null 不产生空历史）。
 * 边界：纯数据/纯逻辑，零渲染零 React；ui 层只依赖 core/scene（分层 DAG）；
 *      弹层 GUI（模式切换/预览呈现）归 BatchRenameDialog 组件，阶段验收。
 */
import type { SceneObject } from '../../scene/SceneObject';
import type { Command } from '../../editor/commands';
import { BatchCommand } from '../../editor/commands/BatchCommand';
import { UpdateObjectCommand } from '../../editor/commands/UpdateObjectCommand';

/** 两模式（单选互斥，共享同一实时预览路径） */
export type BatchRenameMode = 'prefix' | 'replace';

/** 批量重命名规则（弹层表单 state 的单一形态；非激活模式字段被忽略） */
export interface BatchRenameRule {
  mode: BatchRenameMode;
  /** prefix：前缀（可空 = 纯序号） */
  prefix: string;
  /** prefix：起始序号（默认 1） */
  start: number;
  /** prefix：步长（默认 1；≤0 非法——会产生全部同名） */
  step: number;
  /** prefix：序号位数填充（1/2/3） */
  digits: 1 | 2 | 3;
  /** replace：查找串（空 = 不可提交） */
  find: string;
  /** replace：替换串（可空 = 删除） */
  replaceWith: string;
}

/** 默认规则（起始 1 / 步长 1 / 1 位填充，任务书缺省） */
export function defaultBatchRenameRule(): BatchRenameRule {
  return { mode: 'prefix', prefix: '', start: 1, step: 1, digits: 1, find: '', replaceWith: '' };
}

/** 规则是否可确认（空查找串 / 非法步长禁用确认按钮） */
export function isBatchRenameSubmittable(rule: BatchRenameRule): boolean {
  if (rule.mode === 'replace') return rule.find !== '';
  return Number.isFinite(rule.step) && rule.step > 0 && Number.isFinite(rule.start);
}

/** 单名求值（prefix：前缀 + padStart 序号；replace：split/join 全替换） */
function renameAt(name: string, index: number, rule: BatchRenameRule): string {
  if (rule.mode === 'replace') {
    if (rule.find === '') return name;
    return name.split(rule.find).join(rule.replaceWith);
  }
  const serial = rule.start + index * rule.step;
  return `${rule.prefix}${String(serial).padStart(rule.digits, '0')}`;
}

/** 名称列表 → 新名称列表（保持顺序；不可提交规则原样返回拷贝） */
export function applyBatchRename(names: readonly string[], rule: BatchRenameRule): string[] {
  if (!isBatchRenameSubmittable(rule)) return [...names];
  return names.map((name, index) => renameAt(name, index, rule));
}

/** 预览行（原名 → 新名） */
export interface BatchRenamePreviewRow {
  from: string;
  to: string;
}

/** 实时预览载荷（rows = 前 limit 条；more = 超出上限；total = 全部对象数） */
export function batchRenamePreview(
  names: readonly string[],
  rule: BatchRenameRule,
  limit = 8,
): { rows: BatchRenamePreviewRow[]; more: boolean; total: number } {
  const next = applyBatchRename(names, rule);
  const rows = next
    .slice(0, limit)
    .map((to, index) => ({ from: names[index]!, to }));
  return { rows, more: next.length > limit, total: next.length };
}

/**
 * 命令规划：变名对象逐个 UpdateObjectCommand(name)（沿单对象改名先例——统一
 * UpdateObjectCommand，无 RenameCommand），多个经 BatchCommand 合一条历史；
 * 全部无变化 → null（不产生空历史）。
 */
export function batchRenameCommand(
  objects: readonly SceneObject[],
  rule: BatchRenameRule,
): Command | null {
  if (objects.length === 0) return null;
  const next = applyBatchRename(objects.map((o) => o.name), rule);
  const commands = objects
    .map((obj, index) => ({ obj, name: next[index]! }))
    .filter(({ obj, name }) => name !== obj.name)
    .map(({ obj, name }) => new UpdateObjectCommand(obj.id, { name }));
  if (commands.length === 0) return null;
  return commands.length === 1 ? commands[0]! : new BatchCommand(commands);
}
