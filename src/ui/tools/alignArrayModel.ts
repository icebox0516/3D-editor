/**
 * ui/tools/alignArrayModel —— 对齐 / 阵列纯模型（T7.6，R1/R2 裁决）。
 *
 * 职责（与 toolIA / multiEditModel 同风格的纯数据 + 纯函数，node 可测）：
 *  - footprintOf：对象世界足迹包围盒——region = shape.points（局部 XZ）+
 *    transform.position(x/z) 偏移的 min/max；model 等非 region（编辑层无足迹数据）
 *    = 位置点零尺寸框；忽略 rotation/scale（地面编辑语义）；
 *  - alignDeltas：八种对齐模式（X/Z 最小/居中/最大 + X/Z 均布）的目标平移增量——
 *    均布为 Figma 等间距语义（按 minX 排序、最左 minX 与最右 maxX 不动、
 *    gap = (总跨度 − Σ宽度)/(n−1) 可为负；n<3 无中间对象 → 空结果）；
 *  - alignCommand：N 条 TransformCommand（before = 现 transform，after = 仅 position
 *    平移增量，rotation/scale 原样）经 BatchCommand 合一条历史；零增量 → null；
 *  - 阵列：clampArrayPlan（数量 1..99 / 间距 0.1..1000 / 8 方向）+ planArrayCopies
 *    （副本 i 整体平移 = dir · spacing · i；deepClone + 新 id 沿原前缀 + 名称
 *    `${原名} ${i+1}`，semantic/style/layerId 等其余字段保留）+ arrayCommand
 *    （N 条 CreateObjectCommand 经 BatchCommand 一条历史）；多选时阵列单元 = 选集整体；
 *  - alignGhostFootprints / arrayGhostFootprints：足迹预览口（FootprintGhostPort）
 *    的输入计算——目标位置足迹矩形（model 零尺寸 → 2×2 占位，与 ghost placeholder
 *    2,2,2 先例一致）。
 * 边界：纯逻辑零渲染；ui 层只依赖 core/scene/domain/editor（分层 DAG）；一切可见
 *      修改经 Command；执行后选中副本集（selectMany）归组件层（粘贴先例）。
 */
import { createId } from '../../core/id';
import type { ID, Vec2 } from '../../core/types';
import { deepClone } from '../../core/utils';
import { isRegionObject } from '../../domain/regions';
import type { Command } from '../../editor/commands';
import { BatchCommand } from '../../editor/commands/BatchCommand';
import { CreateObjectCommand } from '../../editor/commands/CreateObjectCommand';
import { TransformCommand } from '../../editor/commands/TransformCommand';
import type { SceneObject } from '../../scene/SceneObject';
import type { Transform } from '../../core/types';

// ── 足迹 ────────────────────────────────────────────────────

/** 世界 XZ 足迹包围盒（编辑层语义：忽略 rotation/scale） */
export interface FootprintBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/**
 * 对象 → 世界足迹包围盒（纯函数）：region = points + position(x/z) 偏移的 min/max
 * （空点列回退位置零框）；model 等非 region = 位置点零尺寸框（min=max=center）。
 */
export function footprintOf(obj: SceneObject): FootprintBox {
  const px = obj.transform.position.x;
  const pz = obj.transform.position.z;
  const points = isRegionObject(obj) ? obj.shape.points : [];
  if (points.length === 0) return { minX: px, maxX: px, minZ: pz, maxZ: pz };
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minZ) minZ = p.y;
    if (p.y > maxZ) maxZ = p.y;
  }
  return { minX: minX + px, maxX: maxX + px, minZ: minZ + pz, maxZ: maxZ + pz };
}

// ── 对齐（R1：八模式）──────────────────────────────────────

/** 八种对齐模式（X/Z × 最小/居中/最大/均布） */
export type AlignMode =
  | 'min-x'
  | 'center-x'
  | 'max-x'
  | 'min-z'
  | 'center-z'
  | 'max-z'
  | 'distribute-x'
  | 'distribute-z';

/** 对齐结果：每对象的目标平移增量 */
export interface AlignDelta {
  id: ID;
  dx: number;
  dz: number;
}

/**
 * 八模式对齐目标（纯函数）：输入对象集 + 模式 → 每对象 XZ 平移增量。
 * - X/Z 最小/最大：全体对应边对齐到选集并集极值边；
 * - X/Z 居中：全体中心对齐到选集并集包围盒中心；
 * - X/Z 均布（≥3 对象）：按 minX（minZ）排序，最左对象 minX 与最右对象 maxX 不动，
 *   中间对象依次排布使相邻边缘间距相等 gap=(总跨度−Σ宽度)/(n−1)（可为负，重叠语义）；
 *   n<3 无中间对象 → 空结果（调用方禁用入口）。
 */
export function alignDeltas(objects: readonly SceneObject[], mode: AlignMode): AlignDelta[] {
  if (objects.length === 0) return [];
  const boxes = objects.map((obj) => ({ obj, box: footprintOf(obj) }));

  if (mode === 'distribute-x' || mode === 'distribute-z') {
    if (boxes.length < 3) return [];
    const axis: 'x' | 'z' = mode === 'distribute-x' ? 'x' : 'z';
    const minKey = axis === 'x' ? 'minX' : 'minZ';
    const maxKey = axis === 'x' ? 'maxX' : 'maxZ';
    // 稳定排序：按 min 边升序（次键 = 原序，确定性输出）
    const sorted = [...boxes].sort((a, b) => a.box[minKey] - b.box[minKey]);
    const first = sorted[0]!.box;
    const last = sorted[sorted.length - 1]!.box;
    const span = last[maxKey] - first[minKey];
    const widths = sorted.map((e) => e.box[maxKey] - e.box[minKey]);
    const gap = (span - widths.reduce((sum, w) => sum + w, 0)) / (sorted.length - 1);
    // 逐对象放置：placedMin_i = Σ_{j<i} width_j + i·gap（以最左对象 min 边为基准）
    return sorted.map((entry, i) => {
      const target = first[minKey] + widths.slice(0, i).reduce((sum, w) => sum + w, 0) + i * gap;
      const delta = target - entry.box[minKey];
      return axis === 'x'
        ? { id: entry.obj.id, dx: delta, dz: 0 }
        : { id: entry.obj.id, dx: 0, dz: delta };
    });
  }

  // 极值/居中六模式：全体对齐到选集并集包围盒的对应边/中心
  let unionMinX = Infinity;
  let unionMaxX = -Infinity;
  let unionMinZ = Infinity;
  let unionMaxZ = -Infinity;
  for (const { box } of boxes) {
    if (box.minX < unionMinX) unionMinX = box.minX;
    if (box.maxX > unionMaxX) unionMaxX = box.maxX;
    if (box.minZ < unionMinZ) unionMinZ = box.minZ;
    if (box.maxZ > unionMaxZ) unionMaxZ = box.maxZ;
  }
  const centerX = (unionMinX + unionMaxX) / 2;
  const centerZ = (unionMinZ + unionMaxZ) / 2;

  return boxes.map(({ obj, box }) => {
    let dx = 0;
    let dz = 0;
    switch (mode) {
      case 'min-x':
        dx = unionMinX - box.minX;
        break;
      case 'max-x':
        dx = unionMaxX - box.maxX;
        break;
      case 'center-x':
        dx = centerX - (box.minX + box.maxX) / 2;
        break;
      case 'min-z':
        dz = unionMinZ - box.minZ;
        break;
      case 'max-z':
        dz = unionMaxZ - box.maxZ;
        break;
      case 'center-z':
        dz = centerZ - (box.minZ + box.maxZ) / 2;
        break;
    }
    return { id: obj.id, dx, dz };
  });
}

/** 命令列表包装：空 → null（不产生空历史）；单条 → 直接返回；多条 → BatchCommand */
function wrapCommands(commands: Command[]): Command | null {
  if (commands.length === 0) return null;
  return commands.length === 1 ? commands[0]! : new BatchCommand(commands);
}

/**
 * 对齐命令规划：N 条 TransformCommand（after = 现 transform 仅平移 position，
 * rotation/scale 原样）经 BatchCommand 一条历史；全部零增量 → null。
 */
export function alignCommand(objects: readonly SceneObject[], mode: AlignMode): Command | null {
  const byId = new Map(objects.map((o) => [o.id as ID, o] as const));
  const deltas = alignDeltas(objects, mode).filter((d) => d.dx !== 0 || d.dz !== 0);
  if (deltas.length === 0) return null;
  return wrapCommands(
    deltas.map(({ id, dx, dz }) => {
      const target = byId.get(id)!;
      const before: Transform = target.transform;
      const after: Transform = {
        ...before,
        position: {
          x: before.position.x + dx,
          y: before.position.y,
          z: before.position.z + dz,
        },
      };
      return new TransformCommand(id, before, after);
    }),
  );
}

// ── 阵列（R2）──────────────────────────────────────────────

/** 八方向（世界轴映射：东=+X、北=−Z；对角归一化单位向量） */
export type ArrayDirection =
  | 'east'
  | 'northeast'
  | 'north'
  | 'northwest'
  | 'west'
  | 'southwest'
  | 'south'
  | 'southeast';

/** 方向表（芯片 UI 数据源；步进 = dir · spacing · i） */
export const ARRAY_DIRECTIONS: readonly {
  id: ArrayDirection;
  label: string;
  dx: number;
  dz: number;
}[] = [
  { id: 'east', label: '东', dx: 1, dz: 0 },
  { id: 'northeast', label: '东北', dx: Math.SQRT1_2, dz: -Math.SQRT1_2 },
  { id: 'north', label: '北', dx: 0, dz: -1 },
  { id: 'northwest', label: '西北', dx: -Math.SQRT1_2, dz: -Math.SQRT1_2 },
  { id: 'west', label: '西', dx: -1, dz: 0 },
  { id: 'southwest', label: '西南', dx: -Math.SQRT1_2, dz: Math.SQRT1_2 },
  { id: 'south', label: '南', dx: 0, dz: 1 },
  { id: 'southeast', label: '东南', dx: Math.SQRT1_2, dz: Math.SQRT1_2 },
];

/** 数量 = 副本数（不含原件），默认 3 */
export const ARRAY_COUNT_MIN = 1;
export const ARRAY_COUNT_MAX = 99;
export const ARRAY_DEFAULT_COUNT = 3;
/** 间距 = 相邻副本步距（整体平移步长，米），默认 5 */
export const ARRAY_SPACING_MIN = 0.1;
export const ARRAY_SPACING_MAX = 1000;
export const ARRAY_DEFAULT_SPACING = 5;

/** 阵列参数（已归一） */
export interface ArrayPlan {
  count: number;
  spacing: number;
  direction: ArrayDirection;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, n));
}

/** 参数钳制（非法回退默认；未知方向回退东） */
export function clampArrayPlan(partial: Partial<ArrayPlan>): ArrayPlan {
  const direction = ARRAY_DIRECTIONS.some((d) => d.id === partial.direction)
    ? partial.direction!
    : 'east';
  return {
    count: Math.round(clampNumber(partial.count, ARRAY_COUNT_MIN, ARRAY_COUNT_MAX, ARRAY_DEFAULT_COUNT)),
    spacing: clampNumber(partial.spacing, ARRAY_SPACING_MIN, ARRAY_SPACING_MAX, ARRAY_DEFAULT_SPACING),
    direction,
  };
}

/** 副本 i 的整体平移步进 = dir · spacing · i */
export function arrayOffset(plan: ArrayPlan, i: number): { dx: number; dz: number } {
  const dir = ARRAY_DIRECTIONS.find((d) => d.id === plan.direction)!;
  return { dx: dir.dx * plan.spacing * i, dz: dir.dz * plan.spacing * i };
}

/** 对象快照 → 阵列副本（deepClone + 新 id 沿原前缀 + 平移 + 名称 `${原名} ${i+1}`） */
function arrayCopy(source: SceneObject, i: number, dx: number, dz: number): SceneObject {
  const copy = deepClone(source);
  const prefixMatch = /^([a-z]+)_/.exec(source.id);
  copy.id = createId(prefixMatch ? `${prefixMatch[1]}_` : 'element_');
  copy.transform = {
    ...copy.transform,
    position: {
      x: copy.transform.position.x + dx,
      y: copy.transform.position.y,
      z: copy.transform.position.z + dz,
    },
  };
  copy.name = `${source.name} ${i + 1}`;
  return copy;
}

/**
 * 副本规划（纯函数）：副本 i（i=1..count）= 选集全体各平移 i·步长（外层 i 序、
 * 内层选集序，共 count × M 个）；源对象深拷贝隔离不被修改。
 */
export function planArrayCopies(objects: readonly SceneObject[], plan: ArrayPlan): SceneObject[] {
  const copies: SceneObject[] = [];
  for (let i = 1; i <= plan.count; i++) {
    const { dx, dz } = arrayOffset(plan, i);
    for (const source of objects) copies.push(arrayCopy(source, i, dx, dz));
  }
  return copies;
}

/**
 * 阵列执行规划（纯函数）：副本**一次规划**——命令与副本集同源（确认后「选中副本集」
 * 的数据源；createId 每次调用生成新 id，二次规划会与实际创建对象 id 漂移）。
 */
export interface ArrayExecution {
  command: Command | null;
  /** 与 command 内 CreateObjectCommand 完全同源的副本集（id 即创建 id） */
  copies: SceneObject[];
}

export function planArrayExecution(
  objects: readonly SceneObject[],
  plan: ArrayPlan,
): ArrayExecution {
  if (objects.length === 0) return { command: null, copies: [] };
  const copies = planArrayCopies(objects, plan);
  return {
    command: wrapCommands(copies.map((copy) => new CreateObjectCommand(copy))),
    copies,
  };
}

/** 阵列命令规划：N 条 CreateObjectCommand 经 BatchCommand 一条历史 */
export function arrayCommand(objects: readonly SceneObject[], plan: ArrayPlan): Command | null {
  return planArrayExecution(objects, plan).command;
}

// ── 足迹幽灵预览（R6 输入计算）─────────────────────────────

/** 预览足迹（FootprintGhostPort 的最小输入：中心 + 尺寸；model → 2×2 占位） */
export interface GhostFootprintInput {
  center: Vec2;
  size: Vec2;
}

/** 足迹 → 预览输入（零尺寸 → 2×2 占位框，与 ghost placeholder 先例一致） */
function ghostOf(box: FootprintBox): GhostFootprintInput {
  const w = box.maxX - box.minX;
  const d = box.maxZ - box.minZ;
  const size: Vec2 = w === 0 && d === 0 ? { x: 2, y: 2 } : { x: w, y: d };
  return { center: { x: (box.minX + box.maxX) / 2, y: (box.minZ + box.maxZ) / 2 }, size };
}

/** 对齐预览：每对象目标位置足迹（模式驱动） */
export function alignGhostFootprints(
  objects: readonly SceneObject[],
  mode: AlignMode,
): GhostFootprintInput[] {
  const deltas = alignDeltas(objects, mode);
  const byId = new Map(deltas.map((d) => [d.id, d] as const));
  return objects
    .filter((obj) => byId.has(obj.id))
    .map((obj) => {
      const { dx, dz } = byId.get(obj.id)!;
      const box = footprintOf(obj);
      return ghostOf({
        minX: box.minX + dx,
        maxX: box.maxX + dx,
        minZ: box.minZ + dz,
        maxZ: box.maxZ + dz,
      });
    });
}

/** 阵列预览：count × 选集数个副本足迹（不含原件——原件本体可见） */
export function arrayGhostFootprints(
  objects: readonly SceneObject[],
  plan: ArrayPlan,
): GhostFootprintInput[] {
  const ghosts: GhostFootprintInput[] = [];
  for (let i = 1; i <= plan.count; i++) {
    const { dx, dz } = arrayOffset(plan, i);
    for (const obj of objects) {
      const box = footprintOf(obj);
      ghosts.push(
        ghostOf({
          minX: box.minX + dx,
          maxX: box.maxX + dx,
          minZ: box.minZ + dz,
          maxZ: box.maxZ + dz,
        }),
      );
    }
  }
  return ghosts;
}
