/**
 * tests/ui/tools/alignArrayModel.test.ts —— 对齐 / 阵列纯模型测试（T7.6，先测后码）。
 *
 * 覆盖（R9 测试 1/2/3 项）：
 * - footprintOf：region 足迹 = shape.points（局部 XZ）+ transform.position(x/z) 偏移的
 *   min/max；model 等非 region = 位置点零尺寸框；空点列 region 同样回退位置零框；
 * - alignDeltas 八模式目标值：X/Z 最小/居中/最大 + X/Z 均布（Figma 等间距语义：
 *   按 minX 排序、最左 minX 与最右 maxX 不动、gap 可为负）；n<3 均布 → 空结果；
 * - alignCommand：N 条 TransformCommand 经 BatchCommand 一条历史；只平移 position，
 *   rotation/scale 原样；undo 完整还原；
 * - 阵列：clampArrayPlan 钳制（数量 1..99 / 间距 0.1..1000）、方向步进（8 方向单位向量，
 *   东=+X、北=−Z、对角归一化）、planArrayCopies（新 id 沿原前缀 / 名称 `${原名} ${i+1}` /
 *   semantic·style·layerId·transform 其余字段保留）、arrayCommand 单条历史；
 * - 足迹幽灵预览：alignGhostFootprints / arrayGhostFootprints（model 零尺寸 → 2×2 占位）。
 */
import { describe, expect, it } from 'vitest';
import { createId } from '../../../src/core/id';
import { createRegionObject } from '../../../src/domain/regions';
import type { RegionObject } from '../../../src/domain/regions';
import type { SceneObject } from '../../../src/scene/SceneObject';
import { EventBus } from '../../../src/core/events/EventBus';
import { SceneManager } from '../../../src/scene/SceneManager';
import { SelectionManager } from '../../../src/scene/SelectionManager';
import { HistoryManager } from '../../../src/editor/history/HistoryManager';
import {
  ARRAY_DEFAULT_COUNT,
  ARRAY_DEFAULT_SPACING,
  alignCommand,
  alignDeltas,
  alignGhostFootprints,
  arrayCommand,
  arrayGhostFootprints,
  clampArrayPlan,
  footprintOf,
  planArrayCopies,
  planArrayExecution,
} from '../../../src/ui/tools/alignArrayModel';
import type { ArrayDirection } from '../../../src/ui/tools/alignArrayModel';

// ── 夹具 ────────────────────────────────────────────────────

/** 10×4 矩形足迹（局部 0..10 × 0..4）region，position 平移到 (px, pz) */
function rectAt(px: number, pz: number, name = '区域'): RegionObject {
  const region = createRegionObject({
    shape: {
      type: 'polygon',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 4 },
        { x: 0, y: 4 },
      ],
      baseHeight: 0,
      closed: true,
    },
    name,
  });
  region.transform.position = { x: px, y: 0, z: pz };
  return region;
}

/** 非 region（model 等）对象：位置 (px, pz) 点 */
function plainAt(px: number, pz: number): SceneObject {
  return {
    id: createId('model_'),
    type: 'model',
    name: '模型',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: {
      position: { x: px, y: 0, z: pz },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
  };
}

const A = rectAt(0, 0, 'A'); // 足迹 X 0..10，Z 0..4
const B = rectAt(30, 20, 'B'); // 足迹 X 30..40，Z 20..24
const C = plainAt(50, 2); // 点 (50, 2)，零尺寸
const ABC = [A, B, C];

/** 按对象 id 取 delta */
function deltaOf(deltas: ReadonlyArray<{ id: string; dx: number; dz: number }>, id: string) {
  return deltas.find((d) => d.id === id)!;
}

// ── footprintOf ─────────────────────────────────────────────

describe('footprintOf（世界足迹包围盒）', () => {
  it('region：points 局部 XZ + position(x/z) 偏移的 min/max', () => {
    expect(footprintOf(A)).toEqual({ minX: 0, maxX: 10, minZ: 0, maxZ: 4 });
    expect(footprintOf(B)).toEqual({ minX: 30, maxX: 40, minZ: 20, maxZ: 24 });
  });

  it('负向偏移同样成立', () => {
    const region = rectAt(-15, -8);
    expect(footprintOf(region)).toEqual({ minX: -15, maxX: -5, minZ: -8, maxZ: -4 });
  });

  it('model / 空点列 region：位置点零尺寸框（min=max=center）', () => {
    expect(footprintOf(C)).toEqual({ minX: 50, maxX: 50, minZ: 2, maxZ: 2 });
    const empty = createRegionObject({
      shape: { type: 'polygon', points: [], baseHeight: 0, closed: true },
    });
    empty.transform.position = { x: 7, y: 0, z: -3 };
    expect(footprintOf(empty)).toEqual({ minX: 7, maxX: 7, minZ: -3, maxZ: -3 });
  });
});

// ── alignDeltas（八模式）────────────────────────────────────

describe('alignDeltas（八种对齐目标）', () => {
  it('X 最小：全体 minX 对齐到选集最小 minX（0）', () => {
    const deltas = alignDeltas(ABC, 'min-x');
    expect(deltaOf(deltas, A.id)).toEqual({ id: A.id, dx: 0, dz: 0 });
    expect(deltaOf(deltas, B.id).dx).toBe(-30);
    expect(deltaOf(deltas, C.id).dx).toBe(-50);
    expect(deltaOf(deltas, A.id).dz).toBe(0);
  });

  it('X 最大：全体 maxX 对齐到选集最大 maxX（并集 0..50 → 50）', () => {
    const deltas = alignDeltas(ABC, 'max-x');
    expect(deltaOf(deltas, A.id).dx).toBe(40); // 10 → 50
    expect(deltaOf(deltas, B.id).dx).toBe(10); // 40 → 50
    expect(deltaOf(deltas, C.id).dx).toBe(0);
  });

  it('X 居中：全体中心对齐到并集包围盒中心（(0+50)/2 = 25）', () => {
    const deltas = alignDeltas(ABC, 'center-x');
    // A 中心 5 → +20；B 中心 35 → −10；C 中心 50 → −25
    expect(deltaOf(deltas, A.id).dx).toBe(20);
    expect(deltaOf(deltas, B.id).dx).toBe(-10);
    expect(deltaOf(deltas, C.id).dx).toBe(-25);
  });

  it('Z 最小 / Z 最大 / Z 居中（选集 Z 并集 0..24）', () => {
    expect(deltaOf(alignDeltas(ABC, 'min-z'), C.id).dz).toBe(-2);
    expect(deltaOf(alignDeltas(ABC, 'max-z'), A.id).dz).toBe(20);
    // Z 中心 12：A 中心 2 → +10；B 中心 22 → −10；C 中心 2 → +10
    const centers = alignDeltas(ABC, 'center-z');
    expect(deltaOf(centers, A.id).dz).toBe(10);
    expect(deltaOf(centers, B.id).dz).toBe(-10);
    expect(deltaOf(centers, C.id).dz).toBe(10);
    expect(deltaOf(centers, A.id).dx).toBe(0);
  });

  it('X 均布：最左 minX 与最右 maxX 不动，中间对象等间距（gap=15）', () => {
    // 排序序 A(0..10) B(30..40) C(50..50)：跨度 50 − Σ宽 20 → gap = 15
    // B → minX 25（dx −5）；C → minX 50（dx 0）
    const deltas = alignDeltas(ABC, 'distribute-x');
    expect(deltaOf(deltas, A.id).dx).toBe(0);
    expect(deltaOf(deltas, B.id).dx).toBe(-5);
    expect(deltaOf(deltas, C.id).dx).toBe(0);
  });

  it('X 均布：总跨度不足 Σ宽 → gap 为负（重叠，确定性输出）', () => {
    // 三块 X 0..10 / 9..19 / 10..20：跨度 20 − Σ宽 30 → gap = −5
    // b 目标 minX = 10 − 5 = 5（dx −4）；c 目标 minX = 20 − 10 = 10（dx 0，maxX 不动）
    const a = rectAt(0, 0, '密A');
    const b = rectAt(9, 0, '密B');
    const c = rectAt(10, 0, '密C');
    const deltas = alignDeltas([a, b, c], 'distribute-x');
    expect(deltaOf(deltas, a.id).dx).toBe(0);
    expect(deltaOf(deltas, b.id).dx).toBe(-4);
    expect(deltaOf(deltas, c.id).dx).toBe(0);
  });

  it('Z 均布：按 minZ 排序同理（Z 维独立计算）', () => {
    // Z：A 0..4，B 20..24，C 点 2 → 排序 A(0) C(2) B(20)：跨度 24 − Σ深 8 → gap = (24−8)/2 = 8
    // C → minZ = 0+4+8 = 12（dz +10）；B → minZ = 4+0+16 = 20（dz 0）
    const deltas = alignDeltas(ABC, 'distribute-z');
    expect(deltaOf(deltas, A.id).dz).toBe(0);
    expect(deltaOf(deltas, C.id).dz).toBe(10);
    expect(deltaOf(deltas, B.id).dz).toBe(0);
  });

  it('均布 n=2 边界：无中间对象 → 空结果（无命令）', () => {
    expect(alignDeltas([A, B], 'distribute-x')).toEqual([]);
    expect(alignDeltas([A], 'distribute-x')).toEqual([]);
  });

  it('两对象已对齐 → 零增量（确定性）', () => {
    const a = rectAt(0, 0, '同A');
    const b = rectAt(30, 0, '同B');
    const deltas = alignDeltas([a, b], 'min-z');
    expect(deltaOf(deltas, a.id).dz).toBe(0);
    expect(deltaOf(deltas, b.id).dz).toBe(0);
  });
});

// ── alignCommand（命令规划）────────────────────────────────

describe('alignCommand（N 条 TransformCommand 经 BatchCommand 一条历史）', () => {
  function makeCtx() {
    const eventBus = new EventBus();
    const sceneManager = new SceneManager(eventBus);
    const selection = new SelectionManager(eventBus);
    const history = new HistoryManager({ sceneManager, selection, eventBus });
    return { sceneManager, selection, history };
  }

  it('执行：全体平移到对齐位、rotation/scale 原样、一条历史', () => {
    const { sceneManager, history } = makeCtx();
    const a = rectAt(0, 0, '对齐A');
    const b = rectAt(30, 20, '对齐B');
    b.transform.rotation = { x: 0, y: Math.PI / 4, z: 0 };
    b.transform.scale = { x: 2, y: 2, z: 2 };
    sceneManager.addObject(a);
    sceneManager.addObject(b);

    const command = alignCommand([a, b], 'min-x');
    expect(command).not.toBeNull();
    expect(history.execute(command!)).toBe(true);

    const after = sceneManager.getObject(b.id)!;
    expect(after.transform.position.x).toBe(0);
    expect(after.transform.position.z).toBe(20); // 只动 X
    expect(after.transform.rotation.y).toBeCloseTo(Math.PI / 4, 12);
    expect(after.transform.scale).toEqual({ x: 2, y: 2, z: 2 });

    history.undo();
    const restored = sceneManager.getObject(b.id)!;
    expect(restored.transform.position).toEqual({ x: 30, y: 0, z: 20 });
    expect(history.canUndo()).toBe(false); // 一条历史：一次 undo 即回起点
  });

  it('空增量 → null（不产生空历史）', () => {
    const a = rectAt(0, 0, '零A');
    const b = rectAt(30, 0, '零B');
    expect(alignCommand([a, b], 'min-z')).toBeNull();
  });
});

// ── 阵列 ────────────────────────────────────────────────────

describe('clampArrayPlan（参数钳制）', () => {
  it('缺省：数量 3 / 间距 5 / 方向东', () => {
    const plan = clampArrayPlan({});
    expect(plan.count).toBe(ARRAY_DEFAULT_COUNT);
    expect(plan.spacing).toBe(ARRAY_DEFAULT_SPACING);
    expect(plan.direction).toBe<ArrayDirection>('east');
  });

  it('数量钳 1..99；间距钳 0.1..1000；未知方向回退东', () => {
    expect(clampArrayPlan({ count: 0 }).count).toBe(1);
    expect(clampArrayPlan({ count: 100 }).count).toBe(99);
    expect(clampArrayPlan({ spacing: 0 }).spacing).toBeCloseTo(0.1, 10);
    expect(clampArrayPlan({ spacing: 2000 }).spacing).toBe(1000);
    expect(clampArrayPlan({ direction: '逆时针' as ArrayDirection }).direction).toBe('east');
  });
});

describe('planArrayCopies（副本规划）', () => {
  it('副本 i 整体平移 = dir · spacing · i（东 = +X）', () => {
    const a = rectAt(10, 20, '源');
    const copies = planArrayCopies([a], clampArrayPlan({ count: 3, spacing: 5, direction: 'east' }));
    expect(copies).toHaveLength(3);
    expect(copies[0]!.transform.position).toEqual({ x: 15, y: 0, z: 20 });
    expect(copies[1]!.transform.position).toEqual({ x: 20, y: 0, z: 20 });
    expect(copies[2]!.transform.position).toEqual({ x: 25, y: 0, z: 20 });
  });

  it('北 = −Z；对角方向归一化（东北 = (+√2/2, −√2/2)）', () => {
    const a = rectAt(0, 0, '源');
    const north = planArrayCopies([a], clampArrayPlan({ count: 1, spacing: 10, direction: 'north' }));
    expect(north[0]!.transform.position).toEqual({ x: 0, y: 0, z: -10 });

    const diag = planArrayCopies([a], clampArrayPlan({ count: 2, spacing: 10, direction: 'northeast' }));
    expect(diag[0]!.transform.position.x).toBeCloseTo(10 * Math.SQRT1_2, 10);
    expect(diag[0]!.transform.position.z).toBeCloseTo(-10 * Math.SQRT1_2, 10);
  });

  it('副本：新 id 沿原前缀、名称 `${原名} ${i+1}`、semantic/style/layerId/transform 其余保留', () => {
    const a = rectAt(0, 0, '树');
    a.layerId = 'layer_test';
    a.transform.rotation = { x: 0, y: 1, z: 0 };
    const copies = planArrayCopies([a], clampArrayPlan({ count: 2, spacing: 5 }));
    for (const raw of copies) {
      const copy = raw as RegionObject;
      expect(copy.id).not.toBe(a.id);
      expect(copy.id.startsWith('region_')).toBe(true);
      expect(copy.type).toBe('region');
      expect(copy.layerId).toBe('layer_test');
      expect(copy.semantic).toEqual(a.semantic);
      expect(copy.style).toEqual(a.style);
      expect(copy.shape).toEqual(a.shape);
      expect(copy.transform.rotation).toEqual({ x: 0, y: 1, z: 0 });
    }
    expect(copies[0]!.name).toBe('树 2');
    expect(copies[1]!.name).toBe('树 3');
  });

  it('多选：每个副本 = 选集全体各平移 i·步长（N×M 个，i 外层序）', () => {
    const a = rectAt(0, 0, '甲');
    const b = plainAt(100, 0);
    const copies = planArrayCopies([a, b], clampArrayPlan({ count: 2, spacing: 5 }));
    expect(copies).toHaveLength(4);
    // i=1：a+5、b+5；i=2：a+10、b+10
    expect(copies.map((c) => c.transform.position.x)).toEqual([5, 105, 10, 110]);
  });

  it('源对象不被修改（深拷贝隔离）', () => {
    const a = rectAt(0, 0, '源');
    const before = JSON.stringify(a);
    planArrayCopies([a], clampArrayPlan({ count: 3, spacing: 5 }));
    expect(JSON.stringify(a)).toBe(before);
  });
});

describe('arrayCommand（一条历史）', () => {
  it('N 条 CreateObjectCommand 经 BatchCommand：一次 undo 全部移除', () => {
    const eventBus = new EventBus();
    const sceneManager = new SceneManager(eventBus);
    const selection = new SelectionManager(eventBus);
    const history = new HistoryManager({ sceneManager, selection, eventBus });
    const a = rectAt(0, 0, '阵A');
    const b = rectAt(50, 0, '阵B');
    sceneManager.addObject(a);
    sceneManager.addObject(b);

    const command = arrayCommand([a, b], clampArrayPlan({ count: 3, spacing: 5 }));
    expect(command).not.toBeNull();
    expect(history.execute(command!)).toBe(true);
    expect(sceneManager.getObjects()).toHaveLength(8); // 2 源 + 6 副本

    history.undo();
    expect(sceneManager.getObjects()).toHaveLength(2);
  });
});

describe('planArrayExecution（副本 id 同源——确认后选中副本集的数据源）', () => {
  it('同一批副本支撑命令与选中集：执行后副本 id 全部在场景（防二次规划 id 漂移）', () => {
    const eventBus = new EventBus();
    const sceneManager = new SceneManager(eventBus);
    const selection = new SelectionManager(eventBus);
    const history = new HistoryManager({ sceneManager, selection, eventBus });
    const a = rectAt(0, 0, '源');
    sceneManager.addObject(a);

    const { command, copies } = planArrayExecution([a], clampArrayPlan({ count: 3, spacing: 5 }));
    expect(command).not.toBeNull();
    expect(copies).toHaveLength(3);
    expect(history.execute(command!)).toBe(true);
    for (const copy of copies) {
      expect(sceneManager.getObject(copy.id)).toBeDefined(); // copies 即创建集
    }

    history.undo();
    for (const copy of copies) {
      expect(sceneManager.getObject(copy.id)).toBeUndefined();
    }
  });

  it('空选集：command null + 空副本（不产生空历史）', () => {
    const { command, copies } = planArrayExecution([], clampArrayPlan({}));
    expect(command).toBeNull();
    expect(copies).toEqual([]);
  });
});

// ── 足迹幽灵预览 ────────────────────────────────────────────

describe('alignGhostFootprints / arrayGhostFootprints（预览足迹）', () => {
  it('对齐预览：每对象目标位置足迹（model 零尺寸 → 2×2 占位）', () => {
    const a = rectAt(0, 0, '预A');
    const b = rectAt(30, 0, '预B');
    const m = plainAt(100, 0);
    const ghosts = alignGhostFootprints([a, b, m], 'min-x');
    expect(ghosts).toHaveLength(3);
    // a：0..10 → 中心 (5, 2)，尺寸 (10, 4)
    expect(ghosts[0]).toEqual({ center: { x: 5, y: 2 }, size: { x: 10, y: 4 } });
    // b 原 30..40（中心 35,2）→ dx −30 → 中心 (5,2)
    expect(ghosts[1]).toEqual({ center: { x: 5, y: 2 }, size: { x: 10, y: 4 } });
    // model：位置 100 → dx −100 → 0；零尺寸 → 2×2 占位
    expect(ghosts[2]).toEqual({ center: { x: 0, y: 0 }, size: { x: 2, y: 2 } });
  });

  it('阵列预览：count × 选集数，副本偏移后的足迹', () => {
    const a = rectAt(0, 0, '阵预');
    const ghosts = arrayGhostFootprints([a], clampArrayPlan({ count: 2, spacing: 5, direction: 'east' }));
    expect(ghosts).toHaveLength(2);
    // 原 0..10（中心 5,2）→ +5 → 中心 (10,2)；+10 → 中心 (15,2)
    expect(ghosts[0]).toEqual({ center: { x: 10, y: 2 }, size: { x: 10, y: 4 } });
    expect(ghosts[1]).toEqual({ center: { x: 15, y: 2 }, size: { x: 10, y: 4 } });
  });
});
