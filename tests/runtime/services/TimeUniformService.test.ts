/**
 * tests/runtime/services/TimeUniformService.test.ts —— 全局 uTime 时钟与广播测试（T008.1，D19.7 / D12）。
 *
 * 覆盖：
 * - 时间源：advance 首帧建立基准（elapsed 0）、随后按单调时钟差值累计（秒）；
 * - 广播：声明 uTime 的 ShaderMaterial 数值随 advance+apply 推进；不声明 uTime 的
 *   ShaderMaterial 与无 uniforms 的标准材质零触碰；材质数组逐项处理；
 * - 共享材质幂等：同一材质挂多个 Mesh 重复命中写同值无害；
 * - 帧入口 frame(now, root) = advance + apply 组合；
 * - 既有消费者：一期 shader_test 预设（test.shader）材质挂场景后自动被驱动。
 * 边界：node 纯对象（场景图 + 材质可无 WebGL 构造），不渲染。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { TimeUniformService } from '../../../src/runtime/services/TimeUniformService';
import { build as buildShaderTest } from '../../../src/runtime/styles/base/shader_test.preset';

function meshWith(material: THREE.Material | THREE.Material[]): THREE.Mesh {
  return new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
}

describe('时间源（advance）', () => {
  it('首帧建立基准 elapsed 0；随后按差值累计秒；时间回退不倒走（单调保护）', () => {
    const clock = new TimeUniformService();
    expect(clock.advance(1000)).toBe(0); // 基准帧
    expect(clock.elapsed).toBe(0);
    expect(clock.advance(1500)).toBeCloseTo(0.5, 10);
    expect(clock.advance(3500)).toBeCloseTo(2.5, 10);
    clock.advance(2000); // 时钟回退（异常输入防御）：不倒走
    expect(clock.elapsed).toBeCloseTo(2.5, 10);
  });
});

describe('广播（apply）', () => {
  it('声明 uTime 的 ShaderMaterial 被写入 elapsed；不声明者零触碰', () => {
    const clock = new TimeUniformService();
    clock.advance(1000);
    clock.advance(3000); // elapsed = 2
    const withTime = new THREE.ShaderMaterial({ uniforms: { uTime: { value: -1 } } });
    const withoutTime = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(1, 0, 0) } },
    });
    const keepValue = withoutTime.uniforms.uColor.value;
    const standard = new THREE.MeshStandardMaterial();
    const standardBefore = standard.color.getHex();
    const scene = new THREE.Scene();
    scene.add(meshWith(withTime), meshWith(withoutTime), meshWith(standard));
    clock.apply(scene);
    expect(withTime.uniforms.uTime.value).toBeCloseTo(2, 10);
    expect(withoutTime.uniforms.uTime).toBeUndefined();
    expect(withoutTime.uniforms.uColor.value).toBe(keepValue);
    expect(standard.color.getHex()).toBe(standardBefore);
  });

  it('材质数组逐项处理（多材质组 Mesh）', () => {
    const clock = new TimeUniformService();
    clock.advance(0);
    clock.advance(500); // 0.5
    const a = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 } } });
    const b = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 } } });
    const mesh = meshWith([a, b]);
    const root = new THREE.Group().add(mesh);
    clock.apply(root);
    expect(a.uniforms.uTime.value).toBeCloseTo(0.5, 10);
    expect(b.uniforms.uTime.value).toBeCloseTo(0.5, 10);
  });

  it('共享材质重复命中幂等无害（多个 Mesh 同一材质）', () => {
    const clock = new TimeUniformService();
    clock.advance(100);
    clock.advance(1100); // 1
    const shared = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 } } });
    const root = new THREE.Group();
    for (let i = 0; i < 5; i++) root.add(meshWith(shared));
    clock.apply(root);
    expect(shared.uniforms.uTime.value).toBeCloseTo(1, 10);
    clock.apply(root); // 二次广播同值
    expect(shared.uniforms.uTime.value).toBeCloseTo(1, 10);
  });
});

describe('帧入口（frame = advance + apply）', () => {
  it('两帧推进：uTime 从 0 到 1（1000ms）', () => {
    const clock = new TimeUniformService();
    const material = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 } } });
    const scene = new THREE.Scene().add(meshWith(material));
    clock.frame(0, scene);
    expect(material.uniforms.uTime.value).toBe(0);
    clock.frame(1000, scene);
    expect(material.uniforms.uTime.value).toBeCloseTo(1, 10);
  });
});

describe('既有消费者：一期 shader_test 预设（test.shader）', () => {
  it('预设材质挂场景后自动被驱动（uniforms.uTime 已声明，第二消费者验证）', () => {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const instance = buildShaderTest(geometry, {});
    try {
      const material = instance.material as THREE.ShaderMaterial;
      expect(material.uniforms.uTime).toBeDefined(); // 预设声明了 uTime（服务驱动的前提）
      const clock = new TimeUniformService();
      const scene = new THREE.Scene().add(instance.object);
      clock.frame(100, scene);
      expect(material.uniforms.uTime.value as number).toBe(0);
      clock.frame(2100, scene);
      expect(material.uniforms.uTime.value as number).toBeCloseTo(2, 10);
    } finally {
      instance.dispose(); // 插件自建资源零释放（材质归引擎语义）——node 单测自兜底：
      (instance.material as THREE.Material).dispose();
      geometry.dispose();
    }
  });
});
