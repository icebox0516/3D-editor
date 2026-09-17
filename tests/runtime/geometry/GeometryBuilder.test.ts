/**
 * tests/runtime/geometry/GeometryBuilder.test.ts —— RegionShape+RegionSemantic → BufferGeometry（T6.4，先测后码）。
 *
 * 覆盖（任务书 + 主代理裁决 R3/R4/R10）：
 * - 面类五形状（polygon/rectangle/circle/ellipse/freehand）：点列 → 贴地三角网
 *   （顶点在 XZ 平面、y = baseHeight）、UV 世界坐标尺度（米）、法线朝上；
 * - line：恒产条带几何（复用 centerlineRibbonGeometry），width 读
 *   semantic.properties.width（有限数 >0 才用），否则 DEFAULT_LINE_WIDTH=6（R3，
 *   对齐 v1 road 默认宽 6 与 semanticDefinitions road.width 默认 6）；
 * - line 条带 UV：s = 沿中心线累计长度（米）、t ∈ {0,1}（left=0/right=1，R10）；
 * - point：非退化小四边形锚点（R4：中心在锚点、y=baseHeight、带 UV/法线）；
 * - baseHeight 高度合成：全部形状 y 基线 = shape.baseHeight（position.y 由 transform 供给不叠加）；
 * - 退化输入防御：面类 <3 点 / line <2 点 → 空几何（不抛错，上游校验拦截）。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { RegionObject, RegionSemantic, RegionShape } from '../../../src/domain/regions';
import {
  DEFAULT_LINE_WIDTH,
  GeometryBuilder,
  POINT_ANCHOR_SIZE,
} from '../../../src/runtime/geometry/GeometryBuilder';

const RECT_RING = [
  { x: -5, y: -4 },
  { x: 5, y: -4 },
  { x: 5, y: 4 },
  { x: -5, y: 4 },
];

function shape(type: RegionShape['type'], points: { x: number; y: number }[], baseHeight = 0, closed = true): RegionShape {
  return { type, points, baseHeight, closed };
}

function semantic(type: RegionSemantic['type'] = 'unclassified', properties: Record<string, unknown> = {}): RegionSemantic {
  return { type, properties };
}

function build(s: RegionShape, sem: RegionSemantic = semantic()): THREE.BufferGeometry {
  return GeometryBuilder(s, sem);
}

function positionCount(geometry: THREE.BufferGeometry): number {
  return geometry.getAttribute('position')?.count ?? 0;
}

function yExtents(geometry: THREE.BufferGeometry): { minY: number; maxY: number } {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) throw new Error('几何缺少包围盒');
  return { minY: box.min.y, maxY: box.max.y };
}

/** 断言全部顶点法线朝上（y 分量 ≈ 1） */
function expectUpwardNormals(geometry: THREE.BufferGeometry): void {
  const normal = geometry.getAttribute('normal');
  expect(normal, '法线属性存在').toBeDefined();
  for (let i = 0; i < normal.count; i++) {
    expect(normal.getY(i)).toBeGreaterThan(0.9);
  }
}

describe('面类五形状：点列 → 贴地三角网', () => {
  it.each(['polygon', 'rectangle', 'circle', 'ellipse', 'freehand'] as const)(
    '%s：顶点落 XZ 平面（y=0）、法线朝上、UV 世界坐标尺度',
    (type) => {
      const geometry = build(shape(type, RECT_RING));
      expect(positionCount(geometry)).toBeGreaterThan(0);
      const { minY, maxY } = yExtents(geometry);
      expect(minY).toBeCloseTo(0, 6);
      expect(maxY).toBeCloseTo(0, 6);
      expectUpwardNormals(geometry);
      // UV = 世界坐标尺度（ShapeGeometry 自带：uv.x = x、uv.y = -世界 z）
      const position = geometry.getAttribute('position');
      const uv = geometry.getAttribute('uv');
      expect(uv).toBeDefined();
      for (let i = 0; i < Math.min(uv.count, 8); i++) {
        expect(uv.getX(i)).toBeCloseTo(position.getX(i), 5);
        expect(uv.getY(i)).toBeCloseTo(-position.getZ(i), 5);
      }
    },
  );

  it('面类三角化覆盖矩形范围（boundingBox 与点列外沿一致）', () => {
    const geometry = build(shape('rectangle', RECT_RING));
    yExtents(geometry); // 计算 boundingBox
    const box = geometry.boundingBox!;
    expect(box.min.x).toBeCloseTo(-5, 5);
    expect(box.max.x).toBeCloseTo(5, 5);
    expect(box.min.z).toBeCloseTo(-4, 5);
    expect(box.max.z).toBeCloseTo(4, 5);
  });

  it('baseHeight=1.2 → 全部顶点 y=1.2（高度合成基线，position.y 不在此叠加）', () => {
    const geometry = build(shape('polygon', RECT_RING, 1.2));
    const { minY, maxY } = yExtents(geometry);
    expect(minY).toBeCloseTo(1.2, 6);
    expect(maxY).toBeCloseTo(1.2, 6);
  });

  it('退化防御：面类 <3 点 → 空几何（不抛错）', () => {
    const geometry = build(shape('polygon', RECT_RING.slice(0, 2)));
    expect(positionCount(geometry)).toBe(0);
  });
});

describe('line：恒产条带几何（带宽面）', () => {
  const CENTERLINE = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ];

  /** 某中心点横截面上的左右顶点距离（条带宽度） */
  function stripWidthAt(geometry: THREE.BufferGeometry, index: number): number {
    const position = geometry.getAttribute('position');
    const left = new THREE.Vector3(position.getX(index * 2), 0, position.getZ(index * 2));
    const right = new THREE.Vector3(position.getX(index * 2 + 1), 0, position.getZ(index * 2 + 1));
    return left.distanceTo(right);
  }

  it('width=8：条带宽度 8、y=baseHeight、法线朝上（复用 centerlineRibbonGeometry）', () => {
    const geometry = build(
      shape('line', CENTERLINE, 0.06, false),
      semantic('road', { width: 8 }),
    );
    expect(positionCount(geometry)).toBe(2 * CENTERLINE.length); // 每中心点左右两顶点
    expect(stripWidthAt(geometry, 0)).toBeCloseTo(8, 5);
    expect(stripWidthAt(geometry, 1)).toBeCloseTo(8, 5);
    const { minY, maxY } = yExtents(geometry);
    expect(minY).toBeCloseTo(0.06, 6);
    expect(maxY).toBeCloseTo(0.06, 6);
    expectUpwardNormals(geometry);
  });

  it('width 缺省 → DEFAULT_LINE_WIDTH = 6（R3：对齐 v1 road 默认宽与 semanticDefinitions 默认）', () => {
    expect(DEFAULT_LINE_WIDTH).toBe(6);
    const geometry = build(shape('line', CENTERLINE, 0, false), semantic('road', {}));
    expect(stripWidthAt(geometry, 0)).toBeCloseTo(DEFAULT_LINE_WIDTH, 5);
  });

  it.each([
    ['width=0', { width: 0 }],
    ['width 为负', { width: -3 }],
    ['width 非数', { width: 'wide' }],
    ['width NaN', { width: Number.NaN }],
    ['semantic 非 road（无 width 语义）', {}],
  ])('%s → 回退默认宽 6', (_name, properties) => {
    const geometry = build(shape('line', CENTERLINE, 0, false), semantic('road', properties));
    expect(stripWidthAt(geometry, 0)).toBeCloseTo(DEFAULT_LINE_WIDTH, 5);
  });

  it('UV：s = 沿中心线累计长度（米）、t ∈ {0,1}（left=0 / right=1，R10 锁定）', () => {
    const bend = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 4 }, // 折线累计长度 3, 7
    ];
    const geometry = build(shape('line', bend, 0, false), semantic('road', { width: 2 }));
    const uv = geometry.getAttribute('uv');
    expect(uv).toBeDefined();
    // 顶点交错 left[i](2i) / right[i](2i+1)
    expect(uv.getX(0)).toBeCloseTo(0, 5);
    expect(uv.getY(0)).toBeCloseTo(0, 5); // left t=0
    expect(uv.getX(1)).toBeCloseTo(0, 5);
    expect(uv.getY(1)).toBeCloseTo(1, 5); // right t=1
    expect(uv.getX(2)).toBeCloseTo(3, 5);
    expect(uv.getX(3)).toBeCloseTo(3, 5);
    expect(uv.getX(4)).toBeCloseTo(7, 5);
    expect(uv.getX(5)).toBeCloseTo(7, 5);
  });

  it('退化防御：line <2 点 → 空几何（不抛错）', () => {
    const geometry = build(shape('line', [{ x: 0, y: 0 }], 0, false), semantic('road'));
    expect(positionCount(geometry)).toBe(0);
  });
});

describe('point：非退化锚点小四边形（R4）', () => {
  it('锚点 (3,4)、baseHeight=1.2 → 中心 (3,1.2,4)、边长 POINT_ANCHOR_SIZE、带 UV/法线', () => {
    expect(POINT_ANCHOR_SIZE).toBeGreaterThanOrEqual(0.2);
    expect(POINT_ANCHOR_SIZE).toBeLessThanOrEqual(0.5);
    const geometry = build(shape('point', [{ x: 3, y: 4 }], 1.2, false));
    expect(positionCount(geometry)).toBe(4); // 四边形
    const { minY, maxY } = yExtents(geometry);
    expect(minY).toBeCloseTo(1.2, 6);
    expect(maxY).toBeCloseTo(1.2, 6);
    const box = geometry.boundingBox!;
    expect((box.min.x + box.max.x) / 2).toBeCloseTo(3, 5);
    expect((box.min.z + box.max.z) / 2).toBeCloseTo(4, 5);
    expect(box.max.x - box.min.x).toBeCloseTo(POINT_ANCHOR_SIZE, 5);
    expect(box.max.z - box.min.z).toBeCloseTo(POINT_ANCHOR_SIZE, 5);
    expect(geometry.getAttribute('uv')).toBeDefined();
    expectUpwardNormals(geometry);
  });

  it('点列缺省/空 → 锚点回落原点（防御，不抛错）', () => {
    const geometry = build(shape('point', [], 0, false));
    expect(positionCount(geometry)).toBe(4);
    yExtents(geometry); // 计算 boundingBox
    const box = geometry.boundingBox!;
    expect(box.min.x).toBeCloseTo(-POINT_ANCHOR_SIZE / 2, 5);
  });
});

describe('输出纯度', () => {
  it('每次调用产出独立几何对象（不缓存共享）', () => {
    const s = shape('polygon', RECT_RING);
    const a = build(s);
    const b = build(s);
    expect(a).not.toBe(b);
  });

  it('不修改入参 RegionShape / RegionSemantic（只读数据单向消费）', () => {
    const s = shape('line', [{ x: 0, y: 0 }, { x: 5, y: 0 }], 0, false);
    const sem = semantic('road', { width: 4 });
    const shapeSnapshot = JSON.stringify(s);
    const semSnapshot = JSON.stringify(sem);
    build(s, sem);
    expect(JSON.stringify(s)).toBe(shapeSnapshot);
    expect(JSON.stringify(sem)).toBe(semSnapshot);
  });
});

/** 类型完整性 smoke：RegionObject 整体传入路径（RegionRenderer 消费形态） */
describe('RegionObject 输入形态', () => {
  it('从 RegionObject 解构 shape/semantic 构建（与渲染器消费一致）', () => {
    const obj: RegionObject = {
      id: 'region_x',
      type: 'region',
      name: 'r',
      parentId: null,
      layerId: null,
      visible: true,
      locked: false,
      transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      properties: {},
      shape: shape('rectangle', RECT_RING, 0.12),
      semantic: semantic('grass'),
      style: { presetId: 'grass.lawn', overrides: {} },
    };
    const geometry = GeometryBuilder(obj.shape, obj.semantic);
    expect(positionCount(geometry)).toBeGreaterThan(0);
    expect(yExtents(geometry).minY).toBeCloseTo(0.12, 6);
  });
});
