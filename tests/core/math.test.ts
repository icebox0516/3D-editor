import { describe, expect, it } from 'vitest';
import {
  dist2,
  dist3,
  polylineLength,
  polylineLength3,
  polygonArea,
  polygonAreaXZ,
  angleDeg,
  isCollinearXZ,
  pointToSegmentDistance,
  segmentsIntersect,
} from '../../src/core/math';

describe('dist2', () => {
  it('返回欧氏距离的平方', () => {
    expect(dist2({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(25);
    expect(dist2({ x: -1, y: -1 }, { x: 2, y: 3 })).toBe(25);
  });

  it('相同点距离平方为 0', () => {
    expect(dist2({ x: 2, y: -7 }, { x: 2, y: -7 })).toBe(0);
  });
});

describe('polylineLength', () => {
  it('累加各段长度', () => {
    // (0,0)->(3,4) = 5；(3,4)->(3,10) = 6；合计 11
    expect(polylineLength([{ x: 0, y: 0 }, { x: 3, y: 4 }, { x: 3, y: 10 }])).toBe(11);
  });

  it('空折线与单点折线长度为 0', () => {
    expect(polylineLength([])).toBe(0);
    expect(polylineLength([{ x: 1, y: 1 }])).toBe(0);
  });
});

describe('polygonArea', () => {
  it('单位正方形面积为 1', () => {
    expect(
      polygonArea([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ]),
    ).toBe(1);
  });

  it('面积与顶点绕向无关（取绝对值）', () => {
    expect(
      polygonArea([
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 0 },
      ]),
    ).toBe(1);
  });

  it('三角形面积：底 2 高 2 → 2', () => {
    expect(polygonArea([{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }])).toBe(2);
  });

  it('顶点少于 3 个时面积为 0', () => {
    expect(polygonArea([])).toBe(0);
    expect(polygonArea([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(0);
  });
});

describe('pointToSegmentDistance', () => {
  it('点在线段上时距离为 0', () => {
    expect(pointToSegmentDistance({ x: 0.5, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 })).toBe(0);
  });

  it('计算垂线距离', () => {
    expect(pointToSegmentDistance({ x: 2, y: 3 }, { x: 0, y: 0 }, { x: 4, y: 0 })).toBeCloseTo(3, 10);
    expect(pointToSegmentDistance({ x: 1, y: 1 }, { x: 0, y: 0 }, { x: 0, y: 4 })).toBeCloseTo(1, 10);
  });

  it('投影越界时钳制到端点（起点/终点侧）', () => {
    // 投影落在 a 之前 → 到 a 的距离
    expect(pointToSegmentDistance({ x: -3, y: 0 }, { x: 0, y: 0 }, { x: 4, y: 0 })).toBeCloseTo(3, 10);
    // 投影落在 b 之后 → 到 b 的距离（勾股 3-4-5）
    expect(pointToSegmentDistance({ x: 7, y: 4 }, { x: 0, y: 0 }, { x: 4, y: 0 })).toBeCloseTo(5, 10);
  });

  it('零长度退化为点到点距离', () => {
    expect(pointToSegmentDistance({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeCloseTo(1, 10);
  });
});

describe('segmentsIntersect', () => {
  it('识别规范相交（十字交叉）', () => {
    expect(
      segmentsIntersect({ x: 0, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }, { x: 4, y: 0 }),
    ).toBe(true);
  });

  it('平行不共线不相交', () => {
    expect(
      segmentsIntersect({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 2 }, { x: 4, y: 2 }),
    ).toBe(false);
  });

  it('不相交的两段返回 false', () => {
    expect(
      segmentsIntersect({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 3, y: 0 }, { x: 4, y: 1 }),
    ).toBe(false);
  });

  it('端点相接算相交', () => {
    expect(
      segmentsIntersect({ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }),
    ).toBe(true);
  });

  it('共线部分重叠算相交', () => {
    expect(
      segmentsIntersect({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 0 }, { x: 6, y: 0 }),
    ).toBe(true);
  });

  it('共线但不相接不算相交', () => {
    expect(
      segmentsIntersect({ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 5, y: 0 }),
    ).toBe(false);
  });

  it('T 形相接（端点落在另一段内部）算相交', () => {
    expect(
      segmentsIntersect({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: -2 }, { x: 2, y: 0 }),
    ).toBe(true);
  });
});

// ── 阶段 10 测量域三维纯函数（T10.1，先测后码；editor 工具与 runtime 覆盖层共用单一真相源）──

describe('dist3（三维欧氏距离）', () => {
  it('3-4-5 三角形与 5-12-13 三角形固定向量', () => {
    expect(dist3({ x: 0, y: 0, z: 0 }, { x: 3, y: 0, z: 4 })).toBeCloseTo(5, 12);
    expect(dist3({ x: 0, y: 0, z: 0 }, { x: 5, y: 12, z: 0 })).toBeCloseTo(13, 12);
  });

  it('任意平移不变性', () => {
    expect(dist3({ x: 10, y: -3, z: 7 }, { x: 13, y: -3, z: 11 })).toBeCloseTo(5, 12);
  });
});

describe('polylineLength3（三维折线累计）', () => {
  it('空/单点折线返回 0', () => {
    expect(polylineLength3([])).toBe(0);
    expect(polylineLength3([{ x: 1, y: 2, z: 3 }])).toBe(0);
  });

  it('两段 5 + 13 = 18', () => {
    const pts = [
      { x: 0, y: 0, z: 0 },
      { x: 3, y: 0, z: 4 },
      { x: 8, y: 12, z: 4 },
    ];
    expect(polylineLength3(pts)).toBeCloseTo(18, 12);
  });
});

describe('polygonAreaXZ（水平投影面积）', () => {
  it('3-4 直角三角形 = 6', () => {
    const pts = [
      { x: 0, y: 5, z: 0 },
      { x: 3, y: 9, z: 0 },
      { x: 0, y: 1, z: 4 },
    ];
    expect(polygonAreaXZ(pts)).toBeCloseTo(6, 12); // y 分量不参与（水平投影口径）
  });

  it('矩形 4×5 = 20；顶点不足 3 个返回 0', () => {
    const rect = [
      { x: 0, y: 0, z: 0 },
      { x: 4, y: 0, z: 0 },
      { x: 4, y: 0, z: 5 },
      { x: 0, y: 0, z: 5 },
    ];
    expect(polygonAreaXZ(rect)).toBeCloseTo(20, 12);
    expect(polygonAreaXZ(rect.slice(0, 2))).toBe(0);
  });
});

describe('angleDeg（∠ABC 三维夹角，度，0–180）', () => {
  it('直角 90°', () => {
    expect(
      angleDeg({ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }),
    ).toBeCloseTo(90, 9);
  });

  it('反向共线 180°；同向共线 0°', () => {
    expect(
      angleDeg({ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: -1, y: 0, z: 0 }),
    ).toBeCloseTo(180, 9);
    expect(
      angleDeg({ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 5, y: 0, z: 0 }),
    ).toBeCloseTo(0, 9);
  });

  it('三维斜面夹角（等边三元代数向量：120°）', () => {
    // A=(1,0,0)，C 绕 y 轴转 120°：(cos120, 0, sin120) = (−0.5, 0, √3/2)
    expect(
      angleDeg({ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: -0.5, y: 0, z: Math.sqrt(3) / 2 }),
    ).toBeCloseTo(120, 9);
  });

  it('含竖直分量的夹角（BA 沿 y、BC 沿 x → 90°）', () => {
    expect(
      angleDeg({ x: 0, y: 3, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 4, y: 0, z: 0 }),
    ).toBeCloseTo(90, 9);
  });
});

describe('isCollinearXZ（XZ 投影共线判定）', () => {
  it('共线三点返回 true（y 各异不影响）', () => {
    expect(
      isCollinearXZ([
        { x: 0, y: 1, z: 0 },
        { x: 4, y: 7, z: 0 },
        { x: 8, y: -2, z: 0 },
      ]),
    ).toBe(true);
  });

  it('非共线返回 false；不足三点返回 false', () => {
    expect(
      isCollinearXZ([
        { x: 0, y: 0, z: 0 },
        { x: 4, y: 0, z: 0 },
        { x: 4, y: 0, z: 3 },
      ]),
    ).toBe(false);
    expect(isCollinearXZ([{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 1 }])).toBe(false);
    expect(isCollinearXZ([])).toBe(false);
  });
});
