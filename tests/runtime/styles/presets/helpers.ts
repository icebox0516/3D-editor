/**
 * tests/runtime/styles/presets/helpers —— T6.3 预设契约测试共用工具。
 *
 * 职责：dispose 事件计数、XZ 轮廓几何构造、通用契约断言（meta 形态 + StyleInstance
 *      基础契约 + update 不换 object + setGeometry 重绑 + dispose 零泄漏）。
 * 纪律：需要直接调 instance.update 的用例一律带「与默认值相同的覆写」创建——引擎
 *      判定为有效覆写即独享材质，直写不污染共享模板（materialPool 模块级缓存）。
 */
import { expect } from 'vitest';
import * as THREE from 'three';
import type { SemanticType, ShapeType } from '../../../../src/domain/regions';
import type { StylePresetMeta } from '../../../../src/registries';
import { createStyle, disposeStyle } from '../../../../src/runtime/styles/engine';
import { getRouteMeta } from '../../../../src/runtime/styles/routes';
import type { StyleInstance } from '../../../../src/runtime/styles/types';

/** 统计 dispose 事件次数（Material/BufferGeometry/Texture 均 dispatch 'dispose'） */
export function countDisposes(target: THREE.Material | THREE.BufferGeometry | THREE.Texture): { count: () => number } {
  let n = 0;
  target.addEventListener('dispose', () => {
    n += 1;
  });
  return { count: () => n };
}

/** 面类测试几何：10×10 矩形（XZ 平面贴地） */
export function surfaceGeometry(): THREE.BufferGeometry {
  return new THREE.PlaneGeometry(10, 10).rotateX(-Math.PI / 2);
}

/**
 * 轮廓三角网几何（调用方视角的平面轮廓供给）：ShapeGeometry 三角化（支持凹形）后
 * 转 XZ 平面（rotateX(π/2)：(x,y,0) → (x,0,y)，无镜像）。
 */
export function xzOutlineGeometry(points: ReadonlyArray<readonly [number, number]>): THREE.BufferGeometry {
  const shape = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, z)));
  const geometry = new THREE.ShapeGeometry(shape);
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

/** 顶点 Y 极值（挤出高度断言用） */
export function yExtents(geometry: THREE.BufferGeometry): { minY: number; maxY: number } {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) throw new Error('几何缺少包围盒');
  return { minY: box.min.y, maxY: box.max.y };
}

/** 参数形态断言：key/label/type/default 齐备、number 带全 min/max/step（T6.6 表单消费前提） */
export function assertDefaultParamsForm(meta: StylePresetMeta): void {
  expect(meta.defaultParams.length).toBeGreaterThan(0);
  for (const param of meta.defaultParams) {
    expect(typeof param.key).toBe('string');
    expect(param.key).not.toBe('');
    expect(typeof param.label).toBe('string');
    expect(param.label).not.toBe('');
    expect(['color', 'number', 'boolean', 'select']).toContain(param.type);
    expect(param.default).toBeDefined();
    if (param.type === 'number') {
      const min = param.min;
      const max = param.max;
      expect(typeof min).toBe('number');
      expect(typeof max).toBe('number');
      expect(typeof param.step).toBe('number');
      expect(min!).toBeLessThanOrEqual(param.default as number);
      expect(param.default as number).toBeLessThanOrEqual(max!);
    }
  }
}

/** 从 meta 默认参数推导试改值（color → 深红、number → 区间中点；触发一次 update 路径） */
function deriveUpdateTweaks(meta: StylePresetMeta): Record<string, unknown> {
  const tweaks: Record<string, unknown> = {};
  for (const param of meta.defaultParams) {
    if (param.type === 'color') tweaks[param.key] = '#7a1f3d';
    else if (param.type === 'number') tweaks[param.key] = ((param.min ?? 0) + (param.max ?? 1)) / 2;
  }
  return tweaks;
}
export interface CommonContractOptions {
  id: string;
  shape: ShapeType;
  semantic: SemanticType;
  /** 根对象构造器（默认 Mesh；poi.billboard 为 Sprite） */
  objectType?: new () => THREE.Object3D;
  /** 试改参数（缺省从 meta 推导） */
  updateParams?: Record<string, unknown>;
  /** 创建时并入的语义属性（building.height 通路等） */
  semanticProperties?: Record<string, unknown>;
  /** setGeometry 是否应把新几何重绑到根对象（poi 三套为自建/Sprite 几何，置 false） */
  rebindsGeometry?: boolean;
}

/**
 * 通用契约断言（任务书 F.1 逐项）：meta 完整性、build 返回合规 StyleInstance、
 * update 改参数不换 object 引用、setGeometry 重绑（旧几何不释放）、
 * dispose 不 dispose 传入几何与材质（spy 验证，插件侧纪律）。
 * 返回已 dispose 的实例（调用方无需再清理）。
 */
export function assertCommonContract(options: CommonContractOptions): StyleInstance {
  const meta = getRouteMeta(options.id);
  expect(meta).toBeDefined();
  if (!meta) throw new Error(`预设路由缺失 meta: ${options.id}`);
  expect(meta.id).toBe(options.id);
  expect(meta.name).not.toBe('');
  assertDefaultParamsForm(meta);

  const geometry = surfaceGeometry();
  const geometryDisposes = countDisposes(geometry);
  // 与默认值相同的覆写：引擎判定有效覆写 → 独享材质（直写 update 不污染共享模板）
  const noOpOverride: Record<string, unknown> = {};
  const firstParam = meta.defaultParams[0]!;
  noOpOverride[firstParam.key] = firstParam.default;

  const instance = createStyle(
    geometry,
    options.shape,
    options.semantic,
    options.id,
    noOpOverride,
    options.semanticProperties,
  );
  expect(instance.presetId).toBe(options.id);
  expect(instance.object).toBeInstanceOf(options.objectType ?? THREE.Mesh);
  expect(instance.material).toBeInstanceOf(THREE.Material);
  expect(instance.supportedShapes).toEqual(meta.supportedShapes);

  // update 改参数不换 object 引用（材质可能被引擎换绑，不锁材质身份）
  const object = instance.object;
  instance.update(options.updateParams ?? deriveUpdateTweaks(meta));
  expect(instance.object).toBe(object);

  if (options.rebindsGeometry !== false) {
    const nextGeometry = surfaceGeometry();
    const oldGeometry = (instance.object as THREE.Mesh).geometry;
    const oldDisposes = countDisposes(oldGeometry);
    instance.setGeometry(nextGeometry);
    expect((instance.object as THREE.Mesh).geometry).toBe(nextGeometry);
    expect(oldDisposes.count()).toBe(0); // 旧几何归调用方，不释放
  }

  // dispose（插件侧）：不释放传入几何与材质
  const materialDisposes = countDisposes(instance.material);
  instance.dispose();
  expect(geometryDisposes.count()).toBe(0);
  expect(materialDisposes.count()).toBe(0);
  disposeStyle(instance); // 引擎簿记清理（材质归置）
  return instance;
}
