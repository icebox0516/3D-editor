/**
 * tests/runtime/procedural/assets/trafficconePreset.test.ts —— 交通锥色卡消费测试（T025.1，首个设施色卡）。
 *
 * 覆盖（D40 五者准入 = 新增行为：设施域 build 消费 params.preset 的首个实例——T024 消费链设施侧首证）：
 * - 缺省路径逐位一致：build() / build({preset:'default'}) 的锥体色同为默认卡（D44 #3 语义）；
 * - 锥变环不变：跨卡（default/yellow）build 的 geometry 逐位同构（position 逐元素相等 +
 *   同三角面数 + 同分组结构）；反光环与底座材质色跨卡逐位相同；唯一差异 = 锥体底材 color
 *   （D44 #1「冠变干不变」设施移植——锥体=基调面，环/底座=结构面）；
 * - 未知卡 id 防御归默认卡（读侧归一在 resolveDeclaredPreset 单一 choke point；build
 *   防御面只认本资产两卡，非 'yellow' 一律默认）；
 * - 卡色锚：默认卡 #c44524（GB/T 24720 5.3 宜红 + P8 橙红判读域）、'yellow' #d9c42a
 *   （P9 荧光黄-柠檬黄域）——锚值与资产模块 CONE_BODY_PRESETS 同源；
 * - meta 声明与消费同源：presets id 序 [default, yellow]，swatch hex 与锥体卡色值相等。
 * 边界：本文件只锁 build 消费面；sourceKey 分桶 / 缓存共享 / resolveDeclaredPreset 归
 *      T024 体系测试（ginkgoPresetPipeline 通用能力已覆盖，不复制）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { build, meta } from '../../../../src/runtime/procedural/assets/asset_trafficcone.asset';
import { DEFAULT_COLOR_PRESET_ID } from '../../../../src/domain/assets';
import type { InstanceSource } from '../../../../src/runtime/instancing/InstancedAssetPool';

const built: InstanceSource[] = [];

/** 跟踪式构建：产物登记进 built，afterEach 统一 dispose 兜底 */
function buildTracked(preset?: string): InstanceSource {
  const source = build(preset === undefined ? undefined : { preset });
  built.push(source);
  return source;
}

afterEach(() => {
  for (const source of built.splice(0)) {
    source.geometry.dispose();
    for (const material of Array.isArray(source.material) ? source.material : [source.material]) material.dispose();
  }
});

/** 分层（模块头材质分层表）：0 锥体（preset 面）/ 1 反光环（白，固定）/ 2 底座（黑，固定） */
function colorOf(source: InstanceSource, index: number): THREE.Color {
  const materials = Array.isArray(source.material) ? source.material : [source.material];
  return (materials[index] as THREE.MeshStandardMaterial).color;
}

describe('交通锥色卡消费（T025.1 首个设施色卡——锥变环不变）', () => {
  it('缺省路径逐位一致：build() 与显式 default 卡的锥体同为默认卡红 #c44524', () => {
    expect(colorOf(buildTracked(), 0).getHexString()).toBe('c44524');
    expect(colorOf(buildTracked(DEFAULT_COLOR_PRESET_ID), 0).getHexString()).toBe('c44524');
  });

  it('yellow 卡只改锥体色 #d9c42a；反光环与底座色跨卡逐位相同（锥变环不变）', () => {
    const def = buildTracked();
    const yel = buildTracked('yellow');
    expect(colorOf(yel, 0).getHexString()).toBe('d9c42a');
    expect(colorOf(yel, 1).getHexString()).toBe(colorOf(def, 1).getHexString()); // 反光环白恒定
    expect(colorOf(yel, 2).getHexString()).toBe(colorOf(def, 2).getHexString()); // 底座黑恒定
  });

  it('锥变环不变·几何面：跨卡 geometry 逐位同构（position 逐元素相等 / 同面数 / 同分组结构）', () => {
    const def = buildTracked();
    const yel = buildTracked('yellow');
    expect(yel.geometry.getIndex()!.count).toBe(def.geometry.getIndex()!.count);
    expect(yel.geometry.groups.length).toBe(def.geometry.groups.length);
    const pa = def.geometry.getAttribute('position');
    const pb = yel.geometry.getAttribute('position');
    expect(pb.count).toBe(pa.count);
    let mismatches = 0;
    for (let i = 0; i < pa.count * 3; i++) {
      if (pa.array[i] !== pb.array[i]) mismatches++;
    }
    expect(mismatches, 'preset 不得改几何（position 跨卡逐元素相等）').toBe(0);
  });

  it('未知卡 id 防御归默认卡（读侧归一在 resolveDeclaredPreset；build 防御面只认本资产两卡）', () => {
    expect(colorOf(buildTracked('nonexistent-card'), 0).getHexString()).toBe('c44524');
  });

  it('meta 声明与消费同源：presets id 序 [default, yellow]，swatch hex 与锥体卡色值相等', () => {
    expect(meta.presets.map((p) => p.id)).toEqual([DEFAULT_COLOR_PRESET_ID, 'yellow']);
    const def = buildTracked();
    const yel = buildTracked('yellow');
    expect(meta.presets[0]!.swatch).toBe(`#${colorOf(def, 0).getHexString()}`);
    expect(meta.presets[1]!.swatch).toBe(`#${colorOf(yel, 0).getHexString()}`);
  });

  it('presets 声明伴随 shapeFamily 单槽声明（seed/preset 参数化构建路径闸门——池键卡段 + build preset 透传前提）', () => {
    // resolvePoolKey / ProceduralSourceCache 均以 shapeFamily 为 seed/preset 声明面：
    // 无此声明 → 池键无卡段（同桶）+ build 无参收不到 params.preset，色卡静默失效
    //（T025.1 视觉验收发现的接线缺口；facilityAssets 通用不变量锁同口径防复发）。
    expect(meta.shapeFamily).toBeDefined();
    expect(meta.shapeFamily!.size).toBe(1); // 单槽（无形态变体）——跨卡同几何语义的声明面
  });
});
