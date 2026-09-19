/**
 * tests/app/tree3aPerf.test.ts —— T009.7 性能验收 DEV 驱动面测试（window.__tree3aPerf）。
 *
 * 覆盖（无头 node 零 WebGL——createTree3aPerfHandle 工厂直测，真命令管线 + 桩视口依赖；
 * window 槽装配守卫（DEV ∧ Renderer ∧ window）归组合根浏览器形态，此处只锁「无头不挂」）：
 * - place：经 BatchCommand 一条历史入 Scene（数量 / seed 序列 / 归「模型」默认层 /
 *   贴地抬升 y=MODEL_BASE_HEIGHT / 方形网格居中公式 / jitter=false 恒等姿态）；
 * - jitter=true：变体确定性合成对账（applyAssetVariants 乘性/加性律 = PlacementTool
 *   buildTransform 同款公式）；
 * - 幂等再放置：place 后再 place 同参不叠加（自动 clear 上次）；同参两次场景逐位一致
 *   （id 除外——createId 每次新掷）；
 * - clear：移除本句柄对象且不碰用户手放的；经真实命令 → 历史 undo 恢复 / redo 再删；
 * - 撤销联动：place 一条 undo 整批撤空；stats().objects 按场景存活计数（撤销归零、
 *   重做复活再计入）；
 * - stats：桩 renderer.info 字段形状（drawCalls/triangles/geometries/textures/programs/
 *   objects）；无 view 依赖全零值退化；
 * - dispose：clear 自己的对象 + 幂等；
 * - setSunShadow：结构桩 scene traverse 只切 isDirectionalLight 节点；无头 no-op 不抛；
 * - view：球坐标公式复算（tree3aStage.placeCamera 口径）+ place 后缺省距离按网格
 *   extent 自适应；无头 no-op 不抛；
 * - sampleFrames：假 rAF 时序注入——30 帧预热丢弃、nearest-rank 百分位、fps=1000/mean、
 *   durationMs 截窗（0 → 至少 1 帧）；无 rAF 环境 reject。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createId } from '../../src/core/id';
import { MODEL_BASE_HEIGHT, applyAssetVariants } from '../../src/domain/assets';
import type { ModelObject } from '../../src/domain/assets';
import { createEditor, createTree3aPerfHandle, importElements } from '../../src/app/bootstrap';
import type { Tree3aPerfDeps, Tree3aPerfHandle } from '../../src/app/bootstrap';
import manifestJson from '../../assets/manifest.json';

const TREE_ID = 'asset_tree_3a';

/** 无头装配：真命令管线（history/sceneManager/registries 均为组合根实件）+ 可选视口桩 */
function makeHandle(view?: Tree3aPerfDeps['view']): { facade: ReturnType<typeof createEditor>; handle: Tree3aPerfHandle } {
  const facade = createEditor(null, { assets: manifestJson.assets });
  const handle = createTree3aPerfHandle({
    history: facade.history,
    sceneManager: facade.scene,
    assets: facade.registries.assets,
    view,
  });
  return { facade, handle };
}

function modelsOf(facade: ReturnType<typeof createEditor>): ModelObject[] {
  return facade.scene.getObjects((o) => o.type === 'model') as ModelObject[];
}

/** 剥离 id 的对象投影（确定性对账用——id 由 createId 每次新掷，不进比较） */
function stripId(obj: ModelObject): Omit<ModelObject, 'id'> {
  const { id: _id, ...rest } = obj;
  return rest;
}

/** 用户手放对象夹具（非本句柄放置——clear 不得触碰） */
function makeUserModel(): ModelObject {
  return {
    id: createId('model'),
    type: 'model',
    name: '用户手放',
    parentId: null,
    layerId: null,
    visible: true,
    locked: false,
    transform: {
      position: { x: 500, y: MODEL_BASE_HEIGHT, z: 500 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
    asset: { assetId: TREE_ID, seed: 999 },
  };
}

/** 结构桩三维向量（view 机位写入断言用） */
function makeVec3() {
  return {
    x: 0,
    y: 0,
    z: 0,
    set(x: number, y: number, z: number) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    },
  };
}

/** 假 rAF 时钟：advance(count, dt) 同步推进 count 帧、每帧时间戳 +dt（毫秒） */
function stubRafClock() {
  let t = 1000;
  const pending: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback): number => {
    pending.push(cb);
    return pending.length;
  });
  return {
    advance(count: number, dt: number): void {
      for (let i = 0; i < count; i++) {
        t += dt;
        for (const cb of pending.splice(0)) cb(t);
      }
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('place（产品放置路径：真命令管线）', () => {
  it('经命令批入 Scene：数量 / seed 序列 / 默认层 / 贴地抬升 / 居中网格公式 / 无抖动恒等姿态', () => {
    const { facade, handle } = makeHandle();
    const descriptor = facade.registries.assets.get(TREE_ID)!;
    expect(descriptor.kind).toBe('procedural');
    const meta = descriptor.kind === 'procedural' ? descriptor.asset : null!;
    const layerId = facade.scene.getLayers().find((l) => l.name === '模型')!.id;

    expect(handle.place({ count: 10, seedBase: 7, spacing: 5, jitter: false })).toBe(true);
    const models = modelsOf(facade);
    expect(models).toHaveLength(10);
    expect(new Set(models.map((m) => m.asset.seed)).size).toBe(10); // seed 互异 → 槽路由自然铺开
    models.forEach((m, i) => {
      expect(m.type).toBe('model');
      expect(m.asset.assetId).toBe(TREE_ID);
      expect(m.asset.seed).toBe(7 + i); // seedBase + i 确定性序列
      expect(m.layerId).toBe(layerId); // 归「模型」默认层（PlacementTool 同惯例）
      expect(m.visible).toBe(true);
      // 网格：ceil(√10)=4 列 × 3 行，居中于原点（col−1.5 / row−1，各 ×spacing）
      expect(m.transform.position.x).toBeCloseTo(((i % 4) - 1.5) * 5, 12);
      expect(m.transform.position.z).toBeCloseTo((Math.floor(i / 4) - 1) * 5, 12);
      expect(m.transform.position.y).toBe(MODEL_BASE_HEIGHT); // 贴地抬升（T9.2）
      // jitter=false：恒等姿态 = 资产默认（变体合成项 ×1 / +0）
      expect(m.transform.rotation).toEqual(meta.defaultRotation);
      expect(m.transform.scale).toEqual(meta.defaultScale);
    });
    facade.dispose();
  });

  it('jitter=true：变体确定性合成对账（applyAssetVariants 乘性/加性律，PlacementTool 同款公式）', () => {
    const { facade, handle } = makeHandle();
    const descriptor = facade.registries.assets.get(TREE_ID)!;
    const meta = descriptor.kind === 'procedural' ? descriptor.asset : null!;
    expect(handle.place({ count: 16, seedBase: 100, spacing: 6 })).toBe(true); // jitter 缺省 true
    const models = modelsOf(facade);
    models.forEach((m, i) => {
      const sample = applyAssetVariants(meta.variants, 100 + i); // 以对象 seed 为随机源
      expect(m.transform.rotation.y).toBeCloseTo(meta.defaultRotation.y + sample.rotationYOffset, 12);
      expect(m.transform.rotation.x).toBe(meta.defaultRotation.x);
      expect(m.transform.scale.x).toBeCloseTo(meta.defaultScale.x * sample.scaleFactor, 12);
      expect(m.transform.scale.y).toBeCloseTo(meta.defaultScale.y * sample.scaleFactor, 12);
      expect(m.transform.scale.z).toBeCloseTo(meta.defaultScale.z * sample.scaleFactor, 12);
    });
    // 抖动确实发生（rotationJitter 180° → 16 枚旋转几乎必然互异）
    expect(new Set(models.map((m) => m.transform.rotation.y)).size).toBeGreaterThan(1);
    facade.dispose();
  });

  it('幂等再放置：同参两次 place 不叠加（自动 clear 上次）且场景逐位一致（id 除外）', () => {
    const { facade, handle } = makeHandle();
    const opts = { count: 8, seedBase: 42, spacing: 7, jitter: true } as const;
    expect(handle.place(opts)).toBe(true);
    const first = modelsOf(facade).map(stripId);
    expect(first).toHaveLength(8);

    expect(handle.place({ ...opts })).toBe(true); // 幂等：先自动 clear 上次的
    const models = modelsOf(facade);
    expect(models).toHaveLength(8); // 不叠加
    expect(models.map(stripId)).toEqual(first); // 同参 → seed/transform/归层逐位一致
    facade.dispose();
  });
});

describe('clear / 撤销联动', () => {
  it('clear 经真实命令移除自己且不碰用户手放；历史 undo 恢复 / redo 再删', () => {
    const { facade, handle } = makeHandle();
    const user = makeUserModel();
    expect(importElements(facade, [user])).toBe(true);

    expect(handle.place({ count: 5, seedBase: 1 })).toBe(true);
    expect(modelsOf(facade)).toHaveLength(6); // 5 句柄 + 1 用户

    expect(handle.clear()).toBe(true);
    expect(modelsOf(facade)).toHaveLength(1); // 用户手放的保留
    expect(modelsOf(facade)[0]!.id).toBe(user.id);

    expect(facade.history.undo()).toBe(true); // 撤销 clear 批 → 5 棵复活（同 id）
    expect(modelsOf(facade)).toHaveLength(6);
    expect(modelsOf(facade).map((m) => m.asset.seed)).toEqual([999, 1, 2, 3, 4, 5]);
    expect(facade.history.redo()).toBe(true); // 重做 clear → 再删
    expect(modelsOf(facade)).toHaveLength(1);

    expect(handle.clear()).toBe(false); // 无可删对象 → false 且不产生新历史
    facade.dispose();
  });

  it('place 为一条 BatchCommand 历史：一次 undo 整批撤空、redo 复活；stats().objects 按场景存活计数', () => {
    const { facade, handle } = makeHandle();
    expect(handle.place({ count: 12, seedBase: 3 })).toBe(true);
    expect(handle.stats().objects).toBe(12);

    expect(facade.history.undo()).toBe(true); // 一次 undo 整批
    expect(modelsOf(facade)).toHaveLength(0);
    expect(handle.stats().objects).toBe(0); // 撤销后按场景存活过滤（不追赶历史）

    expect(facade.history.redo()).toBe(true);
    expect(modelsOf(facade)).toHaveLength(12);
    expect(handle.stats().objects).toBe(12); // 重做复活再计入
    facade.dispose();
  });

  it('dispose：clear 自己的对象（经命令）+ 幂等', () => {
    const { facade, handle } = makeHandle();
    expect(handle.place({ count: 3 })).toBe(true);
    const user = makeUserModel();
    importElements(facade, [user]);
    handle.dispose();
    expect(modelsOf(facade)).toHaveLength(1); // 只清自己的，用户对象保留
    expect(modelsOf(facade)[0]!.id).toBe(user.id);
    expect(() => handle.dispose()).not.toThrow(); // 幂等
    facade.dispose();
  });
});

describe('stats（renderer.info 口径）', () => {
  it('桩 renderer.info：六字段形状透传 + objects 计数随 clear 归零', () => {
    const { facade, handle } = makeHandle({
      stats: {
        getViewportStats: () => ({ fps: 60, triangles: 12345, drawCalls: 67 }),
        getResourceStats: () => ({ geometries: 8, textures: 3, programs: 12 }),
      },
    });
    expect(handle.place({ count: 4 })).toBe(true);
    expect(handle.stats()).toEqual({
      drawCalls: 67,
      triangles: 12345,
      geometries: 8,
      textures: 3,
      programs: 12,
      objects: 4,
    });
    handle.clear();
    expect(handle.stats().objects).toBe(0);
    facade.dispose();
  });

  it('无 view 依赖（无头）：渲染字段全零值退化，不抛错', () => {
    const { facade, handle } = makeHandle();
    expect(handle.stats()).toEqual({
      drawCalls: 0,
      triangles: 0,
      geometries: 0,
      textures: 0,
      programs: 0,
      objects: 0,
    });
    facade.dispose();
  });
});

describe('setSunShadow（Shadow 成本 A/B）', () => {
  it('结构桩 scene traverse：只切 isDirectionalLight 节点的 castShadow，其余不动', () => {
    const nodes = [
      { castShadow: true, isDirectionalLight: true }, // 太阳
      { castShadow: true, isDirectionalLight: false }, // 普通节点（mesh 等）
      { castShadow: true }, // 无判别字段的对象
    ];
    const { facade, handle } = makeHandle({
      scene: { traverse: (cb) => { for (const n of nodes) cb(n); } },
    });
    handle.setSunShadow(false);
    expect(nodes[0]!.castShadow).toBe(false);
    expect(nodes[1]!.castShadow).toBe(true);
    expect(nodes[2]!.castShadow).toBe(true);
    handle.setSunShadow(true);
    expect(nodes[0]!.castShadow).toBe(true);
    facade.dispose();
  });

  it('无头（无 scene 依赖）no-op 不抛错', () => {
    const { facade, handle } = makeHandle();
    expect(() => handle.setSunShadow(false)).not.toThrow();
    facade.dispose();
  });
});

describe('view（球坐标固定机位，tree3aStage.placeCamera 口径）', () => {
  it('显式参数：az 0°/el 0° 正 +X 方向落位、target 置 (0, 3.6, 0)、update 被调', () => {
    const position = makeVec3();
    const target = makeVec3();
    let updates = 0;
    const { facade, handle } = makeHandle({
      camera: { position },
      controls: { target, update: () => { updates += 1; } },
    });
    handle.view({ distance: 50, azimuthDeg: 0, elevationDeg: 0 });
    expect(position.x).toBeCloseTo(50, 9);
    expect(position.y).toBeCloseTo(3.6, 9);
    expect(position.z).toBeCloseTo(0, 9);
    expect([target.x, target.y, target.z]).toEqual([0, 3.6, 0]);
    expect(updates).toBe(1);
    facade.dispose();
  });

  it('缺省机位自适应：place(100)@11 → 10×10 网格 extent = 9×11+9 = 108m 距离、az 35°、el 16°', () => {
    const position = makeVec3();
    const target = makeVec3();
    const { facade, handle } = makeHandle({
      camera: { position },
      controls: { target, update: () => {} },
    });
    handle.place({ count: 100, spacing: 11 });
    handle.view(); // 缺省：distance = extent、azimuth 35、elevation 16
    const distance = 9 * 11 + 9; // (cols−1)×spacing + 冠幅 9
    const az = (35 * Math.PI) / 180;
    const el = (16 * Math.PI) / 180;
    expect(position.x).toBeCloseTo(distance * Math.cos(el) * Math.cos(az), 9);
    expect(position.y).toBeCloseTo(3.6 + distance * Math.sin(el), 9);
    expect(position.z).toBeCloseTo(distance * Math.cos(el) * Math.sin(az), 9);
    facade.dispose();
  });

  it('无头（无相机依赖）no-op 不抛错', () => {
    const { facade, handle } = makeHandle();
    expect(() => handle.view()).not.toThrow();
    facade.dispose();
  });
});

describe('sampleFrames（假 rAF 时序注入）', () => {
  it('统计公式对账：30 帧预热丢弃 + nearest-rank 百分位 + fps=1000/mean + 变间隔 max', async () => {
    const { facade, handle } = makeHandle();
    const clock = stubRafClock();
    const promise = handle.sampleFrames(400);
    clock.advance(31, 8); // 首帧建立 last + 30 帧预热（8ms 均被丢弃）
    clock.advance(39, 10); // 39 个采样 delta @10ms（elapsed 390 < 400 未收窗）
    clock.advance(1, 100); // 第 40 个 delta @100ms → elapsed 490 ≥ 400 收窗
    const stats = await promise;
    expect(stats.frames).toBe(40); // 8ms 预热帧不进统计
    const mean = (39 * 10 + 100) / 40;
    expect(stats.mean).toBeCloseTo(mean, 10);
    expect(stats.fps).toBeCloseTo(1000 / mean, 10);
    expect(stats.p50).toBe(10); // rank ⌈0.5×40⌉=20 → 升序第 20 位 = 10
    expect(stats.p95).toBe(10); // rank ⌈0.95×40⌉=38 → 升序第 38 位 = 10（100 在第 40 位）
    expect(stats.max).toBe(100);
    facade.dispose();
  });

  it('durationMs 截窗下界：0 也至少采 1 帧再收窗', async () => {
    const { facade, handle } = makeHandle();
    const clock = stubRafClock();
    const promise = handle.sampleFrames(0);
    clock.advance(31, 8); // 预热
    clock.advance(1, 10); // 首个采样 delta 即满足 elapsed ≥ 0
    const stats = await promise;
    expect(stats.frames).toBe(1);
    expect(stats.mean).toBe(10);
    expect(stats.p50).toBe(10);
    expect(stats.p95).toBe(10);
    expect(stats.max).toBe(10);
    expect(stats.fps).toBeCloseTo(100, 10);
    facade.dispose();
  });

  it('无 requestAnimationFrame 环境下 reject（无头安全）', async () => {
    vi.stubGlobal('requestAnimationFrame', undefined);
    const { facade, handle } = makeHandle();
    await expect(handle.sampleFrames(100)).rejects.toThrow('requestAnimationFrame');
    facade.dispose();
  });
});

describe('无头不挂 window 槽（装配守卫）', () => {
  it('createEditor(null) 无 Renderer → __tree3aPerf 不挂 globalThis，dispose 不抛', () => {
    const facade = createEditor(null, { assets: manifestJson.assets });
    expect((globalThis as { __tree3aPerf?: unknown }).__tree3aPerf).toBeUndefined();
    expect(() => facade.dispose()).not.toThrow();
  });
});
