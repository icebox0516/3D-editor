/**
 * tests/io/JsonImporter.test.ts —— 配置化 JSON 导入器 v2 测试（T6.9 重写，先测后码）。
 *
 * v2 口径（任务书裁决 B/C 逐条锁定）：导入器零注册表依赖（构造无参），按 ImportMapping
 * 直接产出 RegionObject（createRegionObject 工厂等价行为），不再经 ElementRegistry：
 * - 映射形态：version '2.0' / semanticType 十类 / geometry 三格式 + 可选 shape 覆写 /
 *   fields（目标 "name" → 对象名，其余 → semantic.properties；乘数表达式沿用）/ defaults
 *   （presetId、layerName、其余键 → semantic.properties 默认值）；
 * - shape 推断：ring-array → polygon；xy/xyz-array 单点 → point、≥2 点 → line；
 *   显式覆写 polygon + xy/xyz 数据 = 点列视为环（环校验 + 自动补闭合）；line 需 ≥2 点；
 *   point 需恰 1 点；
 * - ring-array 多环：取 rings[0] 外环，内环全部丢弃并逐条记告警（路径定位）；
 * - RegionObject 产出：closed（polygon=true / line·point=false）、baseHeight = 语义
 *   defaultBaseHeight、options 不写；semantic.properties = 语义默认值 ← defaults ← fields；
 *   style = { presetId: defaults.presetId ?? 语义默认, overrides: {} }；
 *   metadata.layerName = defaults.layerName ?? 语义默认图层；id 为 region_ 前缀；
 * - 几何校验宽限（裁决 C）：polygon 过 validateGeometry（环深拷贝，修复后坐标写入
 *   shape.points）——NOT_CLOSED 补闭合点 + 顺时针反转就地修复 → 收录 + errors 附说明；
 *   SELF_INTERSECT / TOO_FEW_VERTICES / INVALID_COORD → 对象排除 + 错误；line/point 直通；
 * - 坐标语义：xy [x,y] → {x,y}；xyz [x,y,z] → {x, y:z}（中间高度分量丢弃）；
 * - 映射配置错误抛错 / 数据错误进 errors 的分流沿用 v1；点分路径与字段级错误定位沿用。
 */
import { describe, expect, it } from 'vitest';
import type { RegionObject } from '../../src/domain/regions';
import { isRegionObject } from '../../src/domain/regions';
import { JsonImporter } from '../../src/io';
import type { ImportMapping } from '../../src/io';
import exampleMappingJson from '../../assets/mappings/building.example.json';

/** 示例映射（JSON 类型推导将字面量放宽为 string，断言收窄回契约类型） */
const exampleMapping: ImportMapping = exampleMappingJson as ImportMapping;

/** 示例数据（tests/io/fixtures/buildings.sample.json 等价内联——字段与映射严格对应） */
const sample = {
  data: {
    buildings: [
      { id: 'B001', name: '总部大楼', floors: 12, footprint: [[0, 0], [40, 0], [40, 20], [0, 20], [0, 0]] },
      { id: 'B002', name: '研发中心', floors: 6, footprint: [[50, 0], [70, 0], [70, 30], [50, 30], [50, 0]] },
      { id: 'B003', name: '门卫室', floors: 2, footprint: [[80, 0], [90, 0], [90, 10], [80, 10], [80, 0]] },
    ],
  },
};

/** 以示例映射为基底派生测试映射（显式给 geometry 时整体替换——不复用示例的 shape 覆写） */
const M = (over: Partial<ImportMapping>): ImportMapping => ({
  ...exampleMapping,
  ...over,
  geometry: over.geometry ?? exampleMapping.geometry,
});

/** 构造一条源数据记录（字段与示例映射对应） */
const b = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  id: 'B000',
  name: '测试建筑',
  floors: 4,
  footprint: [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
  ...over,
});

/** 包一层示例映射的根结构 */
const data = (buildings: unknown[]): unknown => ({ data: { buildings } });

/** 标准闭合逆时针方环 */
const SQUARE: number[][] = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]];

/** 有向面积（鞋带公式）：>0 为逆时针 */
function signedArea(ring: { x: number; y: number }[]): number {
  const n = ring.length - 1; // 去闭合点
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const p = ring[i]!;
    const q = ring[i + 1]!;
    sum += p.x * q.y - q.x * p.y;
  }
  return sum / 2;
}

/**
 * 标准 RegionObject 结构断言（createRegionObject 工厂等价行为锁定）：
 * region_ 前缀 ID、三层结构齐备、默认 transform、style.overrides 空。
 */
function assertStandardRegionShape(obj: RegionObject, semanticType = 'building'): void {
  expect(obj.id).toMatch(/^region_/);
  expect(obj.type).toBe('region');
  expect(obj.parentId).toBeNull();
  expect(obj.visible).toBe(true);
  expect(obj.locked).toBe(false);
  expect(obj.transform).toEqual({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });
  expect(obj.semantic.type).toBe(semanticType);
  expect(obj.style.overrides).toEqual({});
  expect(obj.shape.options).toBeUndefined(); // 导入形状为显式点列，无参数化缓存
}

describe('JsonImporter v2 · 示例映射 + 示例数据（验收标准）', () => {
  const importer = new JsonImporter();

  it('三条记录全部导入为 RegionObject：零错误、ID 唯一且 region_ 前缀', () => {
    const { objects, errors } = importer.parse(sample, M({}));
    expect(errors).toEqual([]);
    expect(objects).toHaveLength(3);
    expect(new Set(objects.map((o) => o.id)).size).toBe(3);
    for (const o of objects) {
      assertStandardRegionShape(o);
      expect(isRegionObject(o)).toBe(true);
    }
  });

  it('示例数据语义产出：name 取源字段、height = floors*3、默认预设/图层/基准高度', () => {
    const { objects } = importer.parse(sample, M({}));
    const hq = objects[0]!;
    expect(hq.name).toBe('总部大楼');
    expect(hq.semantic.properties).toEqual({ height: 36 }); // 语义默认 10 ← floors*3 覆盖
    expect(hq.style.presetId).toBe('building.default'); // 语义默认预设
    expect(hq.metadata).toEqual({ layerName: '建筑' }); // 语义默认图层
    expect(hq.shape.baseHeight).toBe(0); // building defaultBaseHeight
    expect(objects[1]!.semantic.properties.height).toBe(18);
    expect(objects[2]!.semantic.properties.height).toBe(6);
  });

  it('shape 覆写 polygon + xy-array：点列视为环，环显式闭合', () => {
    const { objects, errors } = importer.parse(sample, M({}));
    expect(errors).toEqual([]);
    for (const o of objects) {
      expect(o.shape.type).toBe('polygon');
      expect(o.shape.closed).toBe(true);
      const points = o.shape.points;
      expect(points[0]).toEqual(points[points.length - 1]);
    }
    expect(objects[0]!.shape.points).toEqual([
      { x: 0, y: 0 }, { x: 40, y: 0 }, { x: 40, y: 20 }, { x: 0, y: 20 }, { x: 0, y: 0 },
    ]);
  });

  it('未配置 name 映射时缺省「未命名区域」', () => {
    const mapping = M({ fields: { height: 'floors*3' } });
    const { objects } = importer.parse(data([b()]), mapping);
    expect(objects[0]!.name).toBe('未命名区域');
  });
});

describe('JsonImporter v2 · 三格式与 shape 推断（无覆写）', () => {
  const importer = new JsonImporter();

  it('xy-array 单点 → point（closed=false、points 恰 1 点）', () => {
    const mapping = M({
      semanticType: 'poi',
      geometry: { path: 'pos', format: 'xy-array' },
      fields: {},
    });
    const { objects, errors } = importer.parse(data([b({ pos: [[3, 7]] })]), mapping);
    expect(errors).toEqual([]);
    expect(objects).toHaveLength(1);
    const o = objects[0]!;
    assertStandardRegionShape(o, 'poi');
    expect(o.shape.type).toBe('point');
    expect(o.shape.closed).toBe(false);
    expect(o.shape.points).toEqual([{ x: 3, y: 7 }]);
    expect(o.shape.baseHeight).toBe(0); // poi defaultBaseHeight
  });

  it('xy-array ≥2 点 → line（closed=false，直通不校验）', () => {
    const mapping = M({
      semanticType: 'road',
      geometry: { path: 'centerline', format: 'xy-array' },
      fields: {},
    });
    const { objects, errors } = importer.parse(data([b({ centerline: [[0, 0], [30, 5], [60, 5]] })]), mapping);
    expect(errors).toEqual([]);
    const o = objects[0]!;
    expect(o.shape.type).toBe('line');
    expect(o.shape.closed).toBe(false);
    expect(o.shape.points).toEqual([{ x: 0, y: 0 }, { x: 30, y: 5 }, { x: 60, y: 5 }]);
  });

  it('xyz-array：取 (x, z) 为 Vec2（中间高度分量丢弃）；单点推断 point、多点推断 line', () => {
    const point = M({ semanticType: 'poi', geometry: { path: 'p', format: 'xyz-array' }, fields: {} });
    const r1 = importer.parse(data([b({ p: [[1, 99, 2]] })]), point);
    expect(r1.objects[0]!.shape.type).toBe('point');
    expect(r1.objects[0]!.shape.points).toEqual([{ x: 1, y: 2 }]);

    const line = M({ semanticType: 'road', geometry: { path: 'c', format: 'xyz-array' }, fields: {} });
    const r2 = importer.parse(data([b({ c: [[0, 5, 0], [10, 5, 8]] })]), line);
    expect(r2.objects[0]!.shape.type).toBe('line');
    expect(r2.objects[0]!.shape.points).toEqual([{ x: 0, y: 0 }, { x: 10, y: 8 }]);
  });

  it('xyz-array + polygon 覆写：足迹数据取 (x, z) 走环校验', () => {
    const mapping = M({
      geometry: { path: 'outline', format: 'xyz-array', shape: 'polygon' },
      fields: {},
    });
    const outline = [[0, 0, 0], [10, 0, 0], [10, 0, 10], [0, 0, 10], [0, 0, 0]];
    const { objects, errors } = importer.parse(data([b({ outline })]), mapping);
    expect(errors).toEqual([]);
    expect(objects[0]!.shape.type).toBe('polygon');
    expect(objects[0]!.shape.points).toEqual([
      { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 0, y: 0 },
    ]);
  });

  it('ring-array → polygon（外环点列，环校验）', () => {
    const mapping = M({
      semanticType: 'water',
      geometry: { path: 'rings', format: 'ring-array' },
      fields: {},
    });
    const { objects, errors } = importer.parse(data([b({ rings: [SQUARE] })]), mapping);
    expect(errors).toEqual([]);
    const o = objects[0]!;
    expect(o.shape.type).toBe('polygon');
    expect(o.shape.closed).toBe(true);
    expect(o.shape.points).toEqual([
      { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 0, y: 0 },
    ]);
    expect(o.shape.baseHeight).toBe(0.18); // water defaultBaseHeight（单一真相源）
  });

  it('语义 defaultBaseHeight 全档：road 0.06 / grass 0.12 / water 0.18 / 其余 0', () => {
    for (const [semanticType, expected] of [
      ['road', 0.06], ['grass', 0.12], ['water', 0.18], ['building', 0], ['unclassified', 0],
    ] as const) {
      const mapping = M({
        semanticType,
        geometry: { path: 'footprint', format: 'xy-array', shape: 'polygon' },
        fields: {},
      });
      const { objects } = importer.parse(data([b()]), mapping);
      expect(objects[0]!.shape.baseHeight).toBe(expected);
    }
  });
});

describe('JsonImporter v2 · 显式覆写与数据不符', () => {
  const importer = new JsonImporter();

  it('line 覆写单点 → 报错（path 定位几何字段），对象不入 objects', () => {
    const mapping = M({
      geometry: { path: 'footprint', format: 'xy-array', shape: 'line' },
      fields: {},
    });
    const { objects, errors } = importer.parse(data([b({ footprint: [[1, 1]] })]), mapping);
    expect(objects).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]!.path).toBe('data.buildings[0].footprint');
    expect(errors[0]!.message).toContain('2');
  });

  it('point 覆写多点 → 报错（path 定位几何字段）', () => {
    const mapping = M({
      geometry: { path: 'footprint', format: 'xy-array', shape: 'point' },
      fields: {},
    });
    const { objects, errors } = importer.parse(data([b()]), mapping);
    expect(objects).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]!.path).toBe('data.buildings[0].footprint');
  });
});

describe('JsonImporter v2 · ring-array 多环：取外环 + 内环告警', () => {
  const importer = new JsonImporter();

  it('多环取 rings[0] 为 points；每条内环记一条告警（路径定位 + 说明）', () => {
    const mapping = M({
      semanticType: 'plaza',
      geometry: { path: 'rings', format: 'ring-array' },
      fields: {},
    });
    const rings = [
      [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
      [[2, 2], [4, 2], [4, 4], [2, 4], [2, 2]],
      [[6, 6], [8, 6], [8, 8], [6, 8], [6, 6]],
    ];
    const { objects, errors } = importer.parse(data([b({ rings })]), mapping);
    expect(objects).toHaveLength(1);
    expect(objects[0]!.shape.points).toEqual([
      { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 0, y: 0 },
    ]);
    expect(errors).toHaveLength(2); // 两条内环各一条
    expect(errors[0]!.path).toBe('data.buildings[0].rings[1]');
    expect(errors[0]!.message).toContain('内环丢弃');
    expect(errors[0]!.message).toContain('v2 区域单环');
    expect(errors[1]!.path).toBe('data.buildings[0].rings[2]');
  });
});

describe('JsonImporter v2 · 字段与 defaults 语义', () => {
  const importer = new JsonImporter();

  it('"floors*3" 表达式：小数乘数与点分源路径沿用', () => {
    const decimal = M({ fields: { name: 'name', height: 'levels*2.5' } });
    const r1 = importer.parse(data([b({ levels: 5 })]), decimal);
    expect(r1.objects[0]!.semantic.properties.height).toBe(12.5);

    const dotted = M({ fields: { name: 'name', height: 'attrs.floors*3' } });
    const r2 = importer.parse(data([b({ attrs: { floors: 7 } })]), dotted);
    expect(r2.objects[0]!.semantic.properties.height).toBe(21);
  });

  it('表达式源值非数值 → 字段错误（path 定位到源字段），对象不入 objects', () => {
    const { objects, errors } = importer.parse(data([b({ floors: '十二' })]), M({}));
    expect(objects).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]!.path).toBe('data.buildings[0].floors');
  });

  it('缺映射源字段 → 对象不入 objects；引用它的全部字段映射各报一条定位错误', () => {
    const mapping = M({ fields: { name: 'name', height: 'floors*3', floors: 'floors' } });
    const { objects, errors } = importer.parse(data([b({ floors: undefined })]), mapping);
    expect(objects).toHaveLength(0);
    expect(errors).toHaveLength(2);
    expect(errors.every((e) => e.path === 'data.buildings[0].floors')).toBe(true);
  });

  it('字段值为对象/数组（非 JSON 原始值）→ 字段错误', () => {
    const { objects, errors } = importer.parse(data([b({ floors: { value: 4 } })]), M({}));
    expect(objects).toHaveLength(0);
    expect(errors[0]!.path).toBe('data.buildings[0].floors');
  });

  it('defaults.presetId 覆写语义默认预设；未配置回退语义默认', () => {
    const custom = M({ defaults: { presetId: 'building.glass' } });
    const r1 = importer.parse(data([b()]), custom);
    expect(r1.objects[0]!.style.presetId).toBe('building.glass');

    const r2 = importer.parse(data([b()]), M({}));
    expect(r2.objects[0]!.style.presetId).toBe('building.default');
  });

  it('defaults.layerName 覆写语义默认图层；未配置回退语义默认（写入 metadata.layerName）', () => {
    const custom = M({ defaults: { layerName: '重点建筑' } });
    const r1 = importer.parse(data([b()]), custom);
    expect(r1.objects[0]!.metadata).toEqual({ layerName: '重点建筑' });

    const r2 = importer.parse(data([b()]), M({}));
    expect(r2.objects[0]!.metadata).toEqual({ layerName: '建筑' });
  });

  it('defaults 其余键 → semantic.properties 默认值（字段映射值优先）', () => {
    // 未映射 floors → defaults.floors 生效；height 字段映射优先于 defaults.height
    const mapping = M({
      fields: { name: 'name', height: 'floors*3' },
      defaults: { floors: 2, height: 99 },
    });
    const { objects } = importer.parse(data([b()]), mapping);
    expect(objects[0]!.semantic.properties).toEqual({ height: 12, floors: 2 });
  });

  it('非 building 语义：properties 初始为该语义参数默认值（road.width=6）', () => {
    const mapping = M({
      semanticType: 'road',
      geometry: { path: 'centerline', format: 'xy-array' },
      fields: { name: 'name' },
    });
    const { objects } = importer.parse(data([b({ centerline: [[0, 0], [30, 0]] })]), mapping);
    expect(objects[0]!.semantic.properties).toEqual({ width: 6 });
    expect(objects[0]!.style.presetId).toBe('road.standard');
    expect(objects[0]!.metadata).toEqual({ layerName: '道路' });
  });
});

describe('JsonImporter v2 · 几何校验宽限（裁决 C）', () => {
  const importer = new JsonImporter();

  it('自相交多边形（八字形）→ 排除，错误 path 定位到几何字段', () => {
    const bowtie = [[0, 0], [10, 10], [10, 0], [0, 10], [0, 0]];
    const { objects, errors } = importer.parse(data([b({ footprint: bowtie })]), M({}));
    expect(objects).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]!.path).toBe('data.buildings[0].footprint');
    expect(errors[0]!.message).toContain('相交');
  });

  it('顶点不足（去闭合点后 2 个）→ 排除', () => {
    const { objects, errors } = importer.parse(
      data([b({ footprint: [[0, 0], [10, 0], [0, 0]] })]),
      M({}),
    );
    expect(objects).toHaveLength(0);
    expect(errors[0]!.message).toContain('顶点');
  });

  it('坐标非法（分量非数值）→ 排除，path 定位到坐标点', () => {
    const bad = [[0, 0], [10, 'x'], [10, 10], [0, 10], [0, 0]];
    const { objects, errors } = importer.parse(data([b({ footprint: bad })]), M({}));
    expect(objects).toHaveLength(0);
    expect(errors[0]!.path).toBe('data.buildings[0].footprint[1]');
  });

  it('未闭合环 → 宽限收录：修复后的闭合点写入 shape.points，errors 附「已修复」说明', () => {
    const unclosed = [[0, 0], [10, 0], [10, 10], [0, 10]];
    const { objects, errors } = importer.parse(data([b({ footprint: unclosed })]), M({}));
    expect(objects).toHaveLength(1);
    const points = objects[0]!.shape.points;
    expect(points).toHaveLength(5);
    expect(points[0]).toEqual(points[4]);
    expect(errors).toHaveLength(1);
    expect(errors[0]!.path).toBe('data.buildings[0].footprint');
    expect(errors[0]!.message).toContain('闭合');
  });

  it('顺时针环 → 宽限收录并规整为逆时针，无错误', () => {
    const cw = [[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]];
    const { objects, errors } = importer.parse(data([b({ footprint: cw })]), M({}));
    expect(errors).toEqual([]);
    expect(objects).toHaveLength(1);
    const points = objects[0]!.shape.points;
    expect(signedArea(points)).toBeGreaterThan(0);
    expect(points).toEqual([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 0, y: 0 }]);
  });

  it('混合错误（未闭合 + 自相交）→ 不可修复错误优先，对象仍排除', () => {
    const bad = [[0, 0], [10, 10], [10, 0], [0, 10]];
    const { objects, errors } = importer.parse(data([b({ footprint: bad })]), M({}));
    expect(objects).toHaveLength(0);
    expect(errors.some((e) => e.message.includes('相交'))).toBe(true);
  });

  it('line/point 直通：折线自相交不校验（天然合法收录）', () => {
    const mapping = M({
      semanticType: 'road',
      geometry: { path: 'centerline', format: 'xy-array' },
      fields: {},
    });
    const cross = [[0, 0], [10, 10], [10, 0], [0, 10]];
    const { objects, errors } = importer.parse(data([b({ centerline: cross })]), mapping);
    expect(errors).toEqual([]);
    expect(objects).toHaveLength(1);
    expect(objects[0]!.shape.type).toBe('line');
  });
});

describe('JsonImporter v2 · 字段级错误定位（沿用 v1）', () => {
  const importer = new JsonImporter();

  it('缺几何字段 → errors 带 path=数据项.几何路径；其余对象正常收录', () => {
    const { objects, errors } = importer.parse(data([b(), b({ footprint: undefined })]), M({}));
    expect(objects).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0]!.path).toBe('data.buildings[1].footprint');
    expect(errors[0]!.message).toContain('footprint');
  });

  it('数据项非对象 → errors 定位到下标', () => {
    const { objects, errors } = importer.parse(data([b(), null, 42]), M({}));
    expect(objects).toHaveLength(1);
    expect(errors.map((e) => e.path)).toEqual(['data.buildings[1]', 'data.buildings[2]']);
  });

  it('根数组缺失 / 存在但不是数组 → errors 定位到 rootArray（不抛错）', () => {
    const miss = importer.parse({ meta: '空文件' }, M({}));
    expect(miss.objects).toHaveLength(0);
    expect(miss.errors).toHaveLength(1);
    expect(miss.errors[0]!.path).toBe('data.buildings');

    const notArray = importer.parse({ data: { buildings: 42 } }, M({}));
    expect(notArray.objects).toHaveLength(0);
    expect(notArray.errors[0]!.path).toBe('data.buildings');
  });

  it('导入数据非对象（数组/数值）→ 抛错', () => {
    expect(() => importer.parse([1, 2], M({}))).toThrow(/对象/);
    expect(() => importer.parse(42, M({}))).toThrow(/对象/);
  });
});

describe('JsonImporter v2 · 映射配置守卫（配置错误抛错）', () => {
  const importer = new JsonImporter();

  it('version 非 "2.0" → 抛错（v1 映射形态拒绝）', () => {
    expect(() => importer.parse(data([b()]), M({ version: '1.0' as never }))).toThrow(/version.*2\.0|2\.0.*version/);
  });

  it('semanticType 非十类 → 抛错', () => {
    expect(() => importer.parse(data([b()]), M({ semanticType: 'river' as never }))).toThrow(/semanticType|river/);
  });

  it('geometry.format 非三枚举 → 抛错', () => {
    expect(() =>
      importer.parse(data([b()]), M({ geometry: { path: 'footprint', format: 'wkt' as never } })),
    ).toThrow(/format/);
  });

  it('geometry.shape 覆写非法 → 抛错', () => {
    expect(() =>
      importer.parse(data([b()]), M({ geometry: { path: 'footprint', format: 'xy-array', shape: 'mesh' as never } })),
    ).toThrow(/shape/);
  });

  it('缺 rootArray / 缺 version / fields 值非字符串 / defaults 非对象 → 抛错', () => {
    const { rootArray: _r, ...noRoot } = exampleMapping;
    expect(() => importer.parse(data([b()]), noRoot as ImportMapping)).toThrow(/rootArray/);
    const { version: _v, ...noVersion } = exampleMapping;
    expect(() => importer.parse(data([b()]), noVersion as ImportMapping)).toThrow(/version/);
    expect(() => importer.parse(data([b()]), M({ fields: { height: '' } }))).toThrow(/height/);
    expect(() => importer.parse(data([b()]), M({ defaults: 42 as never }))).toThrow(/defaults/);
  });
});

describe('JsonImporter v2 · 零注册表依赖（构造无参）', () => {
  it('new JsonImporter() 直接可用：示例映射导入成功（无任何注册表注入）', () => {
    const importer = new JsonImporter();
    expect(() => importer.parse(sample, exampleMapping)).not.toThrow();
    const { objects, errors } = importer.parse(sample, exampleMapping);
    expect(errors).toEqual([]);
    expect(objects).toHaveLength(3);
  });

  it('导入对象经 createRegionObject 工厂等价组装：与手绘对象结构一致（同一断言复用）', () => {
    const { objects } = new JsonImporter().parse(data([b()]), M({}));
    const imported = objects[0]!;
    assertStandardRegionShape(imported);
    // 手绘等价对象：同 shape/语义/名称经工厂创建 → 手改 height 与 metadata
    // （createRegionObject 直连对比见 tests/domain/regions；此处锁导入产线结构）
    expect(isRegionObject(imported)).toBe(true);
    expect(imported.layerId).toBeNull(); // 归层由 bootstrap.resolveLayerFor 按名解析
  });
});
