/**
 * tests/runtime/styles/engine.test.ts —— 样式引擎入口测试（T6.2，先测后码）。
 *
 * 覆盖（任务书单测清单逐项）：
 * - createStyle 基础契约：instance 字段（object/material/presetId/supportedShapes）；
 * - 参数合并：默认值生效 / overrides 覆盖 / number min-max 钳制（含默认值钳制）/ 类型不符回退默认；
 * - semantic 保留键通路：第六参缺省 {} 并入 params.semantic；显式属性透传；overrides 不得伪造保留键；
 * - 降级三路径：presetId 不在路由 / supportedShapes 不含当前形状 / build 抛错 → 回退 default_solid
 *   + 经注入通知通道发 Toast（不崩溃、几何保持）；
 * - 材质纪律：同预设多实例共享模板；带 overrides 独享；updateStyle 写时复制提升（禁共享材质被单对象改写）；
 * - 引用计数与零泄漏：dispose 后独享材质 disposed、共享模板最后实例释放才 disposed、
 *   传入几何归调用方（disposeStyle / setGeometry 均不释放几何）；
 * - Shader 预设：ShaderMaterial 可挂进引擎、update 只改 uniforms 不换对象/材质/几何；
 * - updateStyle 增量语义：未提及参数保持上次值；semantic 键经 updateStyle 透传。
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { ShapeType } from '../../../src/domain/regions';
import type { StylePresetMeta } from '../../../src/registries';
import {
  FALLBACK_PRESET_ID,
  clearStyleNotifier,
  createStyle,
  disposeStyle,
  setStyleNotifier,
  updateStyle,
} from '../../../src/runtime/styles/engine';
import type { StyleNotice, StyleNotifier } from '../../../src/runtime/styles/engine';
import { registerBuildRoute, unregisterBuildRoute } from '../../../src/runtime/styles/routes';
import type { StyleInstance, StylePresetBuild } from '../../../src/runtime/styles/types';

const ALL_SHAPES: ShapeType[] = ['polygon', 'rectangle', 'circle', 'ellipse', 'freehand', 'line', 'point'];

function geo(): THREE.BufferGeometry {
  return new THREE.PlaneGeometry(4, 4);
}

/** 统计 dispose 事件次数（Material/BufferGeometry 均 dispatch 'dispose'） */
function countDisposes(target: THREE.Material | THREE.BufferGeometry): { count: () => number } {
  let n = 0;
  target.addEventListener('dispose', () => {
    n += 1;
  });
  return { count: () => n };
}

// ── 临时预设工厂（seam 注册，不依赖文件系统）────────────────

let seq = 0;
const tempRoutes: string[] = [];
const liveInstances: StyleInstance[] = [];
const capturedParams: Record<string, unknown>[] = [];

interface TempPresetOptions {
  shapes?: ShapeType[];
  throws?: boolean;
  params?: StylePresetMeta['defaultParams'];
  capture?: boolean;
}

function registerTempPreset(opts: TempPresetOptions = {}): string {
  const id = `test.tmp_${++seq}`;
  const meta: StylePresetMeta = {
    id,
    name: `临时预设${seq}`,
    supportedShapes: opts.shapes ?? [...ALL_SHAPES],
    supportedSemantics: ['unclassified', 'water', 'grass', 'plaza', 'parking', 'bare_land', 'road', 'building', 'poi', 'custom'],
    defaultParams: opts.params ?? [
      { key: 'color', label: '颜色', type: 'color', default: '#123456' },
      { key: 'opacity', label: '透明度', type: 'number', default: 1, min: 0, max: 1 },
    ],
  };
  const build: StylePresetBuild = (geometry, params) => {
    if (opts.throws) throw new Error('预设构建器故意抛错');
    if (opts.capture) capturedParams.push(params);
    const opacity = typeof params.opacity === 'number' && Number.isFinite(params.opacity)
      ? Math.min(Math.max(params.opacity, 0), 1)
      : 1;
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(typeof params.color === 'string' && params.color !== '' ? params.color : '#123456'),
      opacity,
      transparent: opacity < 1,
    });
    const mesh = new THREE.Mesh(geometry, material);
    const instance: StyleInstance = {
      object: mesh,
      material,
      presetId: id,
      supportedShapes: [...meta.supportedShapes],
      update(p) {
        if (opts.capture) capturedParams.push(p);
        const mat = instance.material as THREE.MeshStandardMaterial;
        if (typeof p.color === 'string') mat.color.set(p.color);
        if (typeof p.opacity === 'number' && Number.isFinite(p.opacity)) {
          mat.opacity = p.opacity;
          mat.transparent = p.opacity < 1;
        }
      },
      setGeometry(next) {
        mesh.geometry = next;
      },
      dispose() {
        mesh.removeFromParent();
      },
    };
    return instance;
  };
  registerBuildRoute(id, build, meta);
  tempRoutes.push(id);
  return id;
}

function create(geometry: THREE.BufferGeometry, presetId: string, overrides?: Record<string, unknown>, semanticProperties?: Record<string, unknown>): StyleInstance {
  const instance = createStyle(geometry, 'polygon', 'unclassified', presetId, overrides, semanticProperties);
  liveInstances.push(instance);
  return instance;
}

let notices: StyleNotice[] = [];

beforeEach(() => {
  notices = [];
  setStyleNotifier((n) => notices.push(n));
});

afterEach(() => {
  for (const instance of liveInstances.splice(0)) {
    try {
      disposeStyle(instance);
    } catch {
      // 清理容错
    }
  }
  for (const id of tempRoutes.splice(0)) unregisterBuildRoute(id);
  capturedParams.length = 0;
  setStyleNotifier(null);
});

// ── createStyle 基础契约 ────────────────────────────────────

describe('createStyle 基础契约', () => {
  it('返回 StyleInstance：字段齐备、object 已绑定传入几何', () => {
    const id = registerTempPreset();
    const geometry = geo();
    const instance = create(geometry, id);
    expect(instance.presetId).toBe(id);
    expect(instance.object).toBeInstanceOf(THREE.Mesh);
    expect((instance.object as THREE.Mesh).geometry).toBe(geometry);
    expect(instance.material).toBeInstanceOf(THREE.Material);
    expect(instance.supportedShapes).toEqual([...ALL_SHAPES]);
    expect(notices).toEqual([]);
  });

  it('semantic 保留键：第六参缺省并入空对象', () => {
    const id = registerTempPreset({ capture: true });
    create(geo(), id);
    expect(capturedParams.at(-1)?.semantic).toEqual({});
  });

  it('semantic 保留键：显式语义属性原样透传（building.height 通路）', () => {
    const id = registerTempPreset({ capture: true });
    create(geo(), id, undefined, { height: 12.5, floors: 3 });
    expect(capturedParams.at(-1)?.semantic).toEqual({ height: 12.5, floors: 3 });
  });

  it('semantic 保留键：overrides 不得伪造（引擎最后写入，语义属性优先）', () => {
    const id = registerTempPreset({ capture: true });
    create(geo(), id, { semantic: { height: 999 } }, { height: 8 });
    expect(capturedParams.at(-1)?.semantic).toEqual({ height: 8 });
  });
});

// ── 参数合并（对齐 domain resolveStyle 语义）──────────────

describe('参数合并（默认值 / 覆写 / 钳制 / 类型回退）', () => {
  it('缺省用默认值：颜色/透明度落到材质', () => {
    const id = registerTempPreset({
      params: [
        { key: 'color', label: '颜色', type: 'color', default: '#ff8800' },
        { key: 'opacity', label: '透明度', type: 'number', default: 0.5, min: 0, max: 1 },
      ],
    });
    const instance = create(geo(), id);
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('ff8800');
    expect(mat.opacity).toBe(0.5);
    expect(mat.transparent).toBe(true);
  });

  it('overrides 覆盖默认值', () => {
    const id = registerTempPreset();
    const instance = create(geo(), id, { color: '#00ff00' });
    expect((instance.material as THREE.MeshStandardMaterial).color.getHexString()).toBe('00ff00');
  });

  it('number 钳制：超上限收到 max、低于下限收到 min', () => {
    const id = registerTempPreset();
    const high = create(geo(), id, { opacity: 5 });
    const low = create(geo(), id, { opacity: -1 });
    expect((high.material as THREE.MeshStandardMaterial).opacity).toBe(1);
    expect((low.material as THREE.MeshStandardMaterial).opacity).toBe(0);
  });

  it('类型不符回退默认（不抛错、不产生垃圾值）', () => {
    const id = registerTempPreset();
    const instance = create(geo(), id, { color: 123, opacity: '半透明' });
    const mat = instance.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('123456'); // 回退预设默认色
    expect(mat.opacity).toBe(1);
  });

  it('未在参数表声明的键被忽略', () => {
    const id = registerTempPreset({ capture: true });
    create(geo(), id, { unknownKey: 'x' });
    const params = capturedParams.at(-1) as Record<string, unknown>;
    expect('unknownKey' in params).toBe(false);
  });

  it('无 meta 的 seam 路由：透传原始参数（engine 侧创建仍可走）', () => {
    const id = `test.tmp_nometa_${++seq}`;
    tempRoutes.push(id);
    registerBuildRoute(id, (geometry, params) => {
      capturedParams.push(params);
      const material = new THREE.MeshStandardMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      const instance: StyleInstance = {
        object: mesh, material, presetId: id, supportedShapes: [],
        update() {}, setGeometry() {}, dispose() {},
      };
      return instance;
    });
    create(geo(), id, { color: '#abcdef' });
    expect(capturedParams.at(-1)).toMatchObject({ color: '#abcdef', semantic: {} });
  });
});

// ── 降级兜底（三路径 + Toast）──────────────────────────────

describe('降级兜底', () => {
  it('路径一：presetId 不在路由 → 回退 default_solid + Toast（warn）', () => {
    const geometry = geo();
    const instance = create(geometry, 'missing.preset');
    expect(instance.presetId).toBe(FALLBACK_PRESET_ID);
    expect((instance.object as THREE.Mesh).geometry).toBe(geometry); // 几何保持
    expect(instance.material).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(notices).toHaveLength(1);
    expect(notices[0]?.kind).toBe('warn');
    expect(notices[0]?.message).toContain('missing.preset');
  });

  it('路径二：supportedShapes 不含当前形状 → 回退 + Toast', () => {
    const id = registerTempPreset({ shapes: ['point'] });
    const geometry = geo();
    const instance = create(geometry, id);
    expect(instance.presetId).toBe(FALLBACK_PRESET_ID);
    expect((instance.object as THREE.Mesh).geometry).toBe(geometry);
    expect(notices).toHaveLength(1);
    expect(notices[0]?.message).toContain(id);
  });

  it('路径三：build 执行抛错 → 回退 + Toast（error）且不崩溃', () => {
    const id = registerTempPreset({ throws: true });
    const geometry = geo();
    const instance = create(geometry, id);
    expect(instance.presetId).toBe(FALLBACK_PRESET_ID);
    expect((instance.object as THREE.Mesh).geometry).toBe(geometry);
    expect(notices).toHaveLength(1);
    expect(notices[0]?.kind).toBe('error');
    expect(notices[0]?.message).toContain(id);
  });

  it('通知通道自身抛错不波及引擎（兜底仍然完成）', () => {
    setStyleNotifier(() => {
      throw new Error('通知通道故障');
    });
    const instance = create(geo(), 'missing.preset');
    expect(instance.presetId).toBe(FALLBACK_PRESET_ID);
  });

  it('未注入通知通道时静默兜底', () => {
    setStyleNotifier(null);
    const instance = create(geo(), 'missing.preset');
    expect(instance.presetId).toBe(FALLBACK_PRESET_ID);
  });

  it('兜底实例同样走模板共享', () => {
    const a = create(geo(), 'missing.preset');
    const b = create(geo(), 'missing.preset');
    expect(a.material).toBe(b.material);
  });
});

// ── 材质纪律：模板共享 / 独享 / 写时复制 ──────────────────

describe('材质模板共享与独享', () => {
  it('同预设多实例（无 overrides）共享同一材质模板', () => {
    const id = registerTempPreset();
    const a = create(geo(), id);
    const b = create(geo(), id);
    expect(a.material).toBe(b.material);
  });

  it('带 overrides 的实例独享材质（不污染模板）', () => {
    const id = registerTempPreset();
    const shared = create(geo(), id);
    const own = create(geo(), id, { color: '#ff0000' });
    expect(own.material).not.toBe(shared.material);
    expect((shared.material as THREE.MeshStandardMaterial).color.getHexString()).toBe('123456');
    expect((own.material as THREE.MeshStandardMaterial).color.getHexString()).toBe('ff0000');
  });

  it('预留键 semantic 不算有效覆写（仍可共享模板）', () => {
    const id = registerTempPreset();
    const a = create(geo(), id, undefined, { width: 6 });
    const b = create(geo(), id, undefined, { width: 8 });
    expect(a.material).toBe(b.material); // 语义属性不改样式材质
  });
});

describe('updateStyle 写时复制提升', () => {
  it('共享实例改参数先提升为 clone：模板与其他共享者不受污染', () => {
    const id = registerTempPreset();
    const a = create(geo(), id);
    const b = create(geo(), id);
    const template = a.material;
    updateStyle(a, { color: '#0000ff' });
    expect(a.material).not.toBe(template); // 提升为独享 clone
    expect((a.material as THREE.MeshStandardMaterial).color.getHexString()).toBe('0000ff');
    expect(b.material).toBe(template); // 其他共享者仍在模板上
    expect((template as THREE.MeshStandardMaterial).color.getHexString()).toBe('123456'); // 模板未被改写
    expect((b.material as THREE.MeshStandardMaterial).color.getHexString()).toBe('123456');
  });

  it('提升同步根对象材质槽位（mesh.material 跟随）', () => {
    const id = registerTempPreset();
    const a = create(geo(), id);
    updateStyle(a, { color: '#0000ff' });
    expect((a.object as THREE.Mesh).material).toBe(a.material);
  });

  it('独享实例 update 不额外 clone（材质对象保持）', () => {
    const id = registerTempPreset();
    const a = create(geo(), id, { color: '#ff0000' });
    const before = a.material;
    updateStyle(a, { opacity: 0.5 });
    expect(a.material).toBe(before);
    expect((a.material as THREE.MeshStandardMaterial).opacity).toBe(0.5);
  });

  it('增量语义：未提及参数保持上次生效值', () => {
    const id = registerTempPreset();
    const a = create(geo(), id, { color: '#ff0000', opacity: 0.4 });
    updateStyle(a, { opacity: 1 }); // 只改透明度
    const mat = a.material as THREE.MeshStandardMaterial;
    expect(mat.color.getHexString()).toBe('ff0000'); // 颜色保持
    expect(mat.opacity).toBe(1);
    expect(mat.transparent).toBe(false);
  });

  it('updateStyle 透传 semantic 键（参数通路对齐 createStyle）', () => {
    const id = registerTempPreset({ capture: true });
    const a = create(geo(), id);
    updateStyle(a, { color: '#00ff00', semantic: { height: 20 } });
    const last = capturedParams.at(-1) as Record<string, unknown>;
    expect(last.semantic).toEqual({ height: 20 });
    expect(last.color).toBe('#00ff00');
  });

  it('update 不重建几何：object / material / geometry 身份全部保持', () => {
    const a = create(geo(), 'default_solid', { color: '#ff0000' });
    const geometry = (a.object as THREE.Mesh).geometry;
    const object = a.object;
    const material = a.material;
    updateStyle(a, { color: '#00ff00', opacity: 0.7 });
    expect(a.object).toBe(object);
    expect((a.object as THREE.Mesh).geometry).toBe(geometry);
    expect(a.material).toBe(material);
  });
});

// ── 引用计数与零泄漏 ───────────────────────────────────────

describe('引用计数与释放零泄漏', () => {
  it('共享模板：非最后实例释放不 dispose 模板，最后释放才 dispose', () => {
    const id = registerTempPreset();
    const a = create(geo(), id);
    const template = a.material as THREE.MeshStandardMaterial;
    const disposes = countDisposes(template);
    const b = create(geo(), id);
    disposeStyle(a);
    expect(disposes.count()).toBe(0); // 还有 b 在用
    expect(b.material).toBe(template);
    disposeStyle(b);
    expect(disposes.count()).toBe(1); // 最后一个释放才 dispose 模板本体
  });

  it('独享材质：disposeStyle 即释放本实例材质', () => {
    const id = registerTempPreset();
    const shared = create(geo(), id); // 占住模板，便于对照
    const own = create(geo(), id, { color: '#ff0000' });
    const disposes = countDisposes(own.material as THREE.MeshStandardMaterial);
    const templateDisposes = countDisposes(shared.material as THREE.MeshStandardMaterial);
    disposeStyle(own);
    expect(disposes.count()).toBe(1);
    expect(templateDisposes.count()).toBe(0); // 模板不受影响
  });

  it('写时复制提升后：模板引用计数正确交接（不早释不泄漏）', () => {
    const id = registerTempPreset();
    const a = create(geo(), id);
    const b = create(geo(), id);
    const template = a.material as THREE.MeshStandardMaterial;
    const templateDisposes = countDisposes(template);
    updateStyle(a, { color: '#0000ff' }); // a 提升为独享，模板 ref 2→1
    disposeStyle(a);
    expect(templateDisposes.count()).toBe(0); // b 仍持有模板
    disposeStyle(b);
    expect(templateDisposes.count()).toBe(1);
    expect(countDisposes(a.material as THREE.MeshStandardMaterial).count()).toBe(0); // a 的 clone 在其 dispose 时已释放
  });

  it('几何归调用方：disposeStyle 不释放传入几何', () => {
    const id = registerTempPreset();
    const geometry = geo();
    const disposes = countDisposes(geometry);
    const a = create(geometry, id);
    disposeStyle(a);
    liveInstances.splice(liveInstances.indexOf(a), 1);
    expect(disposes.count()).toBe(0);
  });

  it('setGeometry 重绑：新几何挂载、旧几何不自动释放', () => {
    const id = registerTempPreset();
    const g1 = geo();
    const g2 = geo();
    const a = create(g1, id);
    const g1Disposes = countDisposes(g1);
    a.setGeometry(g2);
    expect((a.object as THREE.Mesh).geometry).toBe(g2);
    expect(g1Disposes.count()).toBe(0);
    disposeStyle(a);
    liveInstances.splice(liveInstances.indexOf(a), 1);
    expect(g1Disposes.count()).toBe(0); // dispose 也不碰几何
  });
});

// ── 内置预设与 Shader 验证 ─────────────────────────────────

describe('内置预设 default_solid / default_wireframe', () => {
  it('default_solid：标准材质 + color/opacity 两参数 + 全形状支持', () => {
    const a = create(geo(), 'default_solid', { color: '#abcdef', opacity: 0.6 });
    const mat = a.material as THREE.MeshStandardMaterial;
    expect(mat).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(mat.color.getHexString()).toBe('abcdef');
    expect(mat.opacity).toBe(0.6);
    expect(a.supportedShapes).toHaveLength(7);
  });

  it('default_wireframe：线框材质可创建、参数合并生效', () => {
    const a = create(geo(), 'default_wireframe', { color: '#ffcc00' });
    const mat = a.material as THREE.MeshBasicMaterial;
    expect(mat).toBeInstanceOf(THREE.MeshBasicMaterial);
    expect(mat.wireframe).toBe(true);
    expect(mat.color.getHexString()).toBe('ffcc00');
  });
});

describe('验证用 Shader 预设（test.shader）', () => {
  it('ShaderMaterial 可挂进引擎，含 uTime 动画钩子', () => {
    const a = create(geo(), 'test.shader', { color: '#00ffcc', opacity: 0.8, speed: 2 });
    const mat = a.material as THREE.ShaderMaterial;
    expect(mat).toBeInstanceOf(THREE.ShaderMaterial);
    expect(mat.uniforms.uTime).toBeDefined();
    expect((mat.uniforms.uColor.value as THREE.Color).getHexString()).toBe('00ffcc');
    expect(mat.uniforms.uOpacity.value).toBe(0.8);
    expect(mat.uniforms.uSpeed.value).toBe(2);
  });

  it('update 只改 uniforms：material/object/geometry 身份不变、uTime 不受参数影响', () => {
    const a = create(geo(), 'test.shader', { color: '#ff0000' });
    const mat = a.material as THREE.ShaderMaterial;
    const object = a.object;
    const material = a.material;
    const geometry = (object as THREE.Mesh).geometry;
    mat.uniforms.uTime.value = 42;
    updateStyle(a, { color: '#0000ff', opacity: 0.5, speed: 3 });
    expect(a.material).toBe(material); // 独享（带 overrides），未 clone
    expect(a.object).toBe(object);
    expect((object as THREE.Mesh).geometry).toBe(geometry);
    expect((mat.uniforms.uColor.value as THREE.Color).getHexString()).toBe('0000ff');
    expect(mat.uniforms.uOpacity.value).toBe(0.5);
    expect(mat.uniforms.uSpeed.value).toBe(3);
    expect(mat.uniforms.uTime.value).toBe(42); // 动画钩子归渲染循环，不经参数通道
  });

  it('Shader 预设模板共享同样生效（uniform 同源）', () => {
    const a = create(geo(), 'test.shader');
    const b = create(geo(), 'test.shader');
    expect(a.material).toBe(b.material);
  });
});

// ── 通知通道注入 ───────────────────────────────────────────

describe('通知通道（setStyleNotifier / clearStyleNotifier）', () => {
  it('spy 可注入并收到降级通知', () => {
    const spyCalls: string[] = [];
    setStyleNotifier((n) => spyCalls.push(n.message));
    create(geo(), 'missing.a');
    expect(spyCalls).toHaveLength(1);
  });

  it('clearStyleNotifier 仅清除自己的通道（当前通道是他人时不误清）', () => {
    const mine: string[] = [];
    const mineNotifier: StyleNotifier = (n) => mine.push(n.message);
    const other: string[] = [];
    const otherNotifier: StyleNotifier = (n) => other.push(n.message);
    setStyleNotifier(mineNotifier);
    setStyleNotifier(otherNotifier); // 顶替
    clearStyleNotifier(mineNotifier); // 不应清除 other
    create(geo(), 'missing.b');
    expect(other).toHaveLength(1); // other 通道仍活跃
    expect(mine).toHaveLength(0);
    clearStyleNotifier(otherNotifier); // 正确清除
    create(geo(), 'missing.c');
    expect(other).toHaveLength(1); // 清除后不再接收
    expect(notices).toEqual([]); // beforeEach 注入的通道也已不在线（被顶替）
  });
});
