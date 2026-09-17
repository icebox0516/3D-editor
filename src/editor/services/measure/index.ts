/**
 * editor/services/measure —— 会话态测量域（阶段 10，contracts/stage10-measure.md §A）。
 *
 * 职责：测量项的会话内存存储（MeasureSession）与纯数据形状（MeasureItem）。
 * 四不变式之「会话态」与「纯数据」在此落地：
 *  - 会话态：测量项只存在于编辑器会话内存，不入场景 JSON、不入 Command 历史、
 *    不入 SceneManager（沿 T8.1 参考线「可见但不入历史」先例）；持久化属排除项；
 *  - 纯数据：MeasureItem 是 editor 层纯数据，渲染由 runtime 经 MeasurePort 完成
 *    （依赖倒置，Port 先例同 PreviewPort；editor 层零 THREE）。
 * 生命周期：ToolManager 生命周期外仍存活——切工具不清空，模式退出/清除全部才清
 *  （由组合根持有单例，T10.2 的 UI 入口经门面调用 clear/removeLast）。
 * 边界：MeasureKind 物理定义在 core/types（EventMap 载荷引用所需，DAG 下 core 是
 *      editor 与 core/events 的唯一公共上游），此处再导出保持契约导入形状。
 */
import type { EventBus } from '../../../core/events/EventBus';
import { createId } from '../../../core/id';
import type { ID, MeasureKind, Vec3 } from '../../../core/types';

export type { MeasureKind } from '../../../core/types';

/** 测量项（纯数据）：points 为世界坐标；distance ≥2 / height =2 / area ≥3 非共线 / angle =3 */
export interface MeasureItem {
  /** createId('measure') 生成（ID 前缀清单 measure_；会话态不序列化） */
  id: ID;
  kind: MeasureKind;
  points: Vec3[];
  /** 提交时序（「删除上一条」依据） */
  createdAt: number;
}

/** 构造测量项（id 与 createdAt 收口：外部只给 kind + 点列） */
export function createMeasureItem(kind: MeasureKind, points: readonly Vec3[]): MeasureItem {
  return {
    id: createId('measure'),
    kind,
    points: points.map((p) => ({ ...p })),
    createdAt: Date.now(),
  };
}

/**
 * 测量会话存储（editor 层）：add/removeLast/clear 后 emit 'measure:changed'{count}
 * （UI「清除全部/删除上一条」可用态与覆盖层已提交层刷新的事件源）。
 */
export class MeasureSession {
  private readonly items: MeasureItem[] = [];
  private readonly eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /** 当前测量项（只读视图；顺序 = 提交时序） */
  list(): readonly MeasureItem[] {
    return this.items;
  }

  /** 追加测量项（emit 'measure:changed'） */
  add(item: MeasureItem): void {
    this.items.push(item);
    this.eventBus.emit('measure:changed', { count: this.items.length });
  }

  /** 删除末项（emit 'measure:changed'）；空表返回 false 且不发事件 */
  removeLast(): boolean {
    if (this.items.length === 0) return false;
    this.items.pop();
    this.eventBus.emit('measure:changed', { count: this.items.length });
    return true;
  }

  /** 清空全部（emit 'measure:changed'，count:0） */
  clear(): void {
    this.items.length = 0;
    this.eventBus.emit('measure:changed', { count: 0 });
  }
}
