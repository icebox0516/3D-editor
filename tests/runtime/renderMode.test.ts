/**
 * tests/runtime/renderMode.test.ts —— 视口渲染模式状态测试（T5.7 → T6.4 → T8.4 诊断档扩展）。
 *
 * 新行为契约（主代理裁决 R7 + T8.4 任务书）：线框/X-Ray/诊断档不遍历改写业务材质
 * （材质快照/还原机制删除），改为场景级 overrideMaterial + 相机 layer 掩码分遍渲染：
 * - RenderModeState：持有共享 override 材质（wireframe / xray / clay / normals /
 *   islands dim / islands highlight），按当前模式经令牌供给；
 *   shaded 无 override（单遍渲染零开销零回归）；
 * - wireframe override：MeshBasicMaterial + wireframe=true（无光照依赖——内容遍不收集灯）；
 * - xray override：MeshBasicMaterial 半透明（transparent + opacity 0.35 + depthWrite=false，
 *   XRAY_OPACITY_FACTOR 统一值语义——全局材质覆盖，不按对象折减）；
 * - clay override（T8.4）：MeshBasicMaterial 单色（≈UE Lighting Only 语义：无光影无贴图，
 *   非 Lambert+环境光变体）；中性灰、不透明；
 * - normals override（T8.4）：自写 ShaderMaterial——RGB=世界空间法线（mat3(modelMatrix)*normal，
 *   非 three MeshNormalMaterial 的视空间编码），顶点着色器含 USE_INSTANCING 分支
 *   （InstancedMesh 实例矩阵参与法线变换），片元 vNormal*0.5+0.5；
 * - islands override（T8.4）：无单一 primary（getOverrideMaterial → null）——dim/highlight
 *   两材质经令牌解析；dim 深灰半透明、highlight 暖橙红不透明；
 * - 材质身份稳定：模式切换不重建 override 材质（切换只改状态，下一帧生效）；
 * - composeRenderPasses 分遍计划（overrideMaterial 为令牌 'none'|'primary'|'dim'|'highlight'）：
 *   · shaded → 单遍全 layer（背景照常、无 override、阴影照常）；
 *   · wireframe/xray/clay/normals → 三遍：P1 环境（ENV_LAYER、背景=天空、阴影更新）→
 *     P2 内容（layer 0、override='primary'、背景 null、阴影停更）→
 *     P3 辅助（AUX_LAYER、背景 null、无 override、阴影停更）；
 *   · islands → 四遍：P1 环境 → P2 暗遍（layer 0、override='dim'，已归类对象）→
 *     P3 亮遍（DIAG_LAYER=4、override='highlight'，未归类对象）→ P4 辅助；
 *   · 非 shaded 各遍相机掩码两两互不重叠（每对象恰被渲染一次）；
 * - dispose：全部六个 override 材质释放（零泄漏、幂等）。
 * 覆盖范围豁免（沿 T5.7 现状边界）：网格/环境/Gizmo/绘制预览不受 override 覆盖；
 * Sprite 不走 overrideMaterial（three 独立渲染路径，已知边界）。
 */
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  AUX_LAYER,
  CLAY_COLOR,
  DIAG_LAYER,
  ENV_LAYER,
  ISLANDS_DIM_COLOR,
  ISLANDS_HIGHLIGHT_COLOR,
  RenderModeState,
  XRAY_OPACITY_FACTOR,
  composeRenderPasses,
} from '../../src/runtime/RenderModeState';

/** 统计 dispose 事件次数（Material dispatch 'dispose'） */
function countDisposes(target: THREE.Material): { count: () => number } {
  let n = 0;
  target.addEventListener('dispose', () => {
    n += 1;
  });
  return { count: () => n };
}

describe('RenderModeState：override 材质供给', () => {
  it('默认 shaded：无 override 材质（单遍渲染零开销）', () => {
    const state = new RenderModeState();
    expect(state.current).toBe('shaded');
    expect(state.getOverrideMaterial()).toBeNull();
  });

  it('wireframe：MeshBasicMaterial + wireframe=true（无光照依赖）', () => {
    const state = new RenderModeState();
    state.setMode('wireframe');
    const material = state.getOverrideMaterial();
    expect(material).toBeInstanceOf(THREE.MeshBasicMaterial);
    expect((material as THREE.MeshBasicMaterial).wireframe).toBe(true);
  });

  it('xray：MeshBasicMaterial 半透明（opacity=0.35 + transparent + depthWrite=false）', () => {
    const state = new RenderModeState();
    state.setMode('xray');
    const material = state.getOverrideMaterial() as THREE.MeshBasicMaterial;
    expect(material).toBeInstanceOf(THREE.MeshBasicMaterial);
    expect(XRAY_OPACITY_FACTOR).toBeCloseTo(0.35, 5);
    expect(material.opacity).toBeCloseTo(XRAY_OPACITY_FACTOR, 5);
    expect(material.transparent).toBe(true);
    expect(material.depthWrite).toBe(false);
  });

  it('clay：MeshBasicMaterial 单色中性灰（无光影无贴图；不透明、非线框）', () => {
    const state = new RenderModeState();
    state.setMode('clay');
    const material = state.getOverrideMaterial() as THREE.MeshBasicMaterial;
    expect(material).toBeInstanceOf(THREE.MeshBasicMaterial);
    expect(material.color.getHex()).toBe(CLAY_COLOR);
    expect(material.wireframe).toBe(false);
    expect(material.transparent).toBe(false);
    expect(material.map).toBeNull(); // 无贴图（单色灰模语义）
  });

  it('normals：自写 ShaderMaterial（RGB=世界空间法线 + instancing 分支）', () => {
    const state = new RenderModeState();
    state.setMode('normals');
    const material = state.getOverrideMaterial();
    expect(material).toBeInstanceOf(THREE.ShaderMaterial);
    const shader = material as THREE.ShaderMaterial;
    // 世界空间法线：经 modelMatrix 变换（非 MeshNormalMaterial 的视空间 normalMatrix 编码）
    expect(shader.vertexShader).toContain('modelMatrix');
    expect(shader.vertexShader).not.toContain('normalMatrix');
    // InstancedMesh 支持：instanceMatrix 分支（#ifdef USE_INSTANCING 由 three 注入定义）
    expect(shader.vertexShader).toContain('USE_INSTANCING');
    expect(shader.vertexShader).toContain('instanceMatrix');
    // 片元：vNormal * 0.5 + 0.5 编码
    expect(shader.fragmentShader).toContain('0.5');
  });

  it('islands：无单一 primary（getOverrideMaterial → null）；dim/highlight 经令牌解析', () => {
    const state = new RenderModeState();
    state.setMode('islands');
    expect(state.getOverrideMaterial()).toBeNull();
    const dim = state.resolveOverrideMaterial('dim') as THREE.MeshBasicMaterial;
    const highlight = state.resolveOverrideMaterial('highlight') as THREE.MeshBasicMaterial;
    expect(dim).toBeInstanceOf(THREE.MeshBasicMaterial);
    expect(highlight).toBeInstanceOf(THREE.MeshBasicMaterial);
    // dim：深灰半透明（不写深度——亮侧对象可透过暗侧体块被读出，数据卫生语义）
    expect(dim.color.getHex()).toBe(ISLANDS_DIM_COLOR);
    expect(dim.transparent).toBe(true);
    expect(dim.depthWrite).toBe(false);
    // highlight：暖橙红醒目不透明
    expect(highlight.color.getHex()).toBe(ISLANDS_HIGHLIGHT_COLOR);
    expect(highlight.transparent).toBe(false);
    expect(dim).not.toBe(highlight);
    // 令牌越界：非 islands 模式下 dim/highlight 解析为 null
    state.setMode('clay');
    expect(state.resolveOverrideMaterial('dim')).toBeNull();
    expect(state.resolveOverrideMaterial('highlight')).toBeNull();
  });

  it('resolveOverrideMaterial：primary 按模式取主材质；none 恒 null', () => {
    const state = new RenderModeState();
    expect(state.resolveOverrideMaterial('none')).toBeNull();
    state.setMode('wireframe');
    expect(state.resolveOverrideMaterial('primary')).toBe(state.getOverrideMaterial());
    state.setMode('clay');
    expect(state.resolveOverrideMaterial('primary')).toBe(state.getOverrideMaterial());
    state.setMode('normals');
    expect(state.resolveOverrideMaterial('primary')).toBe(state.getOverrideMaterial());
    state.setMode('shaded');
    expect(state.resolveOverrideMaterial('primary')).toBeNull();
  });

  it('材质身份稳定：模式互切不重建 override 材质（切换只改状态）', () => {
    const state = new RenderModeState();
    state.setMode('wireframe');
    const wire = state.getOverrideMaterial();
    state.setMode('xray');
    const xray = state.getOverrideMaterial();
    state.setMode('wireframe');
    expect(state.getOverrideMaterial()).toBe(wire); // 回切复用同实例
    expect(xray).not.toBe(wire); // 两模式各一个共享材质

    state.setMode('clay');
    const clay = state.getOverrideMaterial();
    state.setMode('normals');
    const normals = state.getOverrideMaterial();
    state.setMode('islands');
    const dim = state.resolveOverrideMaterial('dim');
    const highlight = state.resolveOverrideMaterial('highlight');
    state.setMode('clay');
    state.setMode('islands');
    expect(state.resolveOverrideMaterial('dim')).toBe(dim);
    expect(state.resolveOverrideMaterial('highlight')).toBe(highlight);
    expect(clay).not.toBe(normals);
    expect(new Set([wire, xray, clay, normals, dim, highlight]).size).toBe(6);
  });

  it('dispose：全部六个 override 材质释放（零泄漏、幂等）', () => {
    const state = new RenderModeState();
    const materials: THREE.Material[] = [];
    state.setMode('wireframe');
    materials.push(state.getOverrideMaterial()!);
    state.setMode('xray');
    materials.push(state.getOverrideMaterial()!);
    state.setMode('clay');
    materials.push(state.getOverrideMaterial()!);
    state.setMode('normals');
    materials.push(state.getOverrideMaterial()!);
    state.setMode('islands');
    materials.push(state.resolveOverrideMaterial('dim')!);
    materials.push(state.resolveOverrideMaterial('highlight')!);
    expect(materials).toHaveLength(6);
    const counters = materials.map((m) => ({ m, c: countDisposes(m) }));
    state.dispose();
    for (const { c } of counters) expect(c.count()).toBe(1);
    // 幂等
    state.dispose();
    for (const { c } of counters) expect(c.count()).toBe(1);
  });
});

describe('composeRenderPasses：分遍计划', () => {
  it('层常量：内容恒 layer 0（默认），环境 ENV_LAYER=2，辅助 AUX_LAYER=3，诊断 DIAG_LAYER=4', () => {
    expect(ENV_LAYER).toBe(2);
    expect(AUX_LAYER).toBe(3);
    expect(DIAG_LAYER).toBe(4);
  });

  it('shaded → 单遍：全 layer 可见、背景照常、无 override、阴影照常', () => {
    const passes = composeRenderPasses('shaded');
    expect(passes).toHaveLength(1);
    const pass = passes[0]!;
    expect(pass.cameraMask & 1).not.toBe(0); // 含内容层 0
    expect(pass.cameraMask & (1 << ENV_LAYER)).not.toBe(0); // 含环境层
    expect(pass.cameraMask & (1 << AUX_LAYER)).not.toBe(0); // 含辅助层
    expect(pass.useBackground).toBe(true);
    expect(pass.overrideMaterial).toBe('none');
    expect(pass.updateShadow).toBe(true);
  });

  it.each(['wireframe', 'xray', 'clay', 'normals'] as const)(
    '%s → 三遍：环境(带背景+阴影) → 内容(primary override) → 辅助',
    (mode) => {
      const passes = composeRenderPasses(mode);
      expect(passes).toHaveLength(3);

      // P1 环境：ENV_LAYER、背景=天空、无 override、阴影更新
      const env = passes[0]!;
      expect(env.cameraMask).toBe(1 << ENV_LAYER);
      expect(env.useBackground).toBe(true);
      expect(env.overrideMaterial).toBe('none');
      expect(env.updateShadow).toBe(true);

      // P2 内容：layer 0、无背景、override 生效、阴影停更（防三遍重算）
      const content = passes[1]!;
      expect(content.cameraMask).toBe(1);
      expect(content.useBackground).toBe(false);
      expect(content.overrideMaterial).toBe('primary');
      expect(content.updateShadow).toBe(false);

      // P3 辅助：AUX_LAYER、无背景、无 override、阴影停更
      const aux = passes[2]!;
      expect(aux.cameraMask).toBe(1 << AUX_LAYER);
      expect(aux.useBackground).toBe(false);
      expect(aux.overrideMaterial).toBe('none');
      expect(aux.updateShadow).toBe(false);
    },
  );

  it('islands → 四遍：环境 → 暗遍(layer 0, dim) → 亮遍(DIAG_LAYER, highlight) → 辅助', () => {
    const passes = composeRenderPasses('islands');
    expect(passes).toHaveLength(4);

    // P1 环境
    const env = passes[0]!;
    expect(env.cameraMask).toBe(1 << ENV_LAYER);
    expect(env.useBackground).toBe(true);
    expect(env.overrideMaterial).toBe('none');
    expect(env.updateShadow).toBe(true);

    // P2 暗遍：已归类对象（layer 0）、dim override
    const dim = passes[1]!;
    expect(dim.cameraMask).toBe(1);
    expect(dim.useBackground).toBe(false);
    expect(dim.overrideMaterial).toBe('dim');
    expect(dim.updateShadow).toBe(false);

    // P3 亮遍：未归类对象（DIAG_LAYER）、highlight override
    const bright = passes[2]!;
    expect(bright.cameraMask).toBe(1 << DIAG_LAYER);
    expect(bright.useBackground).toBe(false);
    expect(bright.overrideMaterial).toBe('highlight');
    expect(bright.updateShadow).toBe(false);

    // P4 辅助
    const aux = passes[3]!;
    expect(aux.cameraMask).toBe(1 << AUX_LAYER);
    expect(aux.useBackground).toBe(false);
    expect(aux.overrideMaterial).toBe('none');
    expect(aux.updateShadow).toBe(false);
  });

  it.each(['wireframe', 'xray', 'clay', 'normals', 'islands'] as const)(
    '%s → 各遍相机掩码两两互不重叠（每对象恰被渲染一次）',
    (mode) => {
      const passes = composeRenderPasses(mode);
      const masks = passes.map((p) => p.cameraMask);
      for (let i = 0; i < masks.length; i++) {
        for (let j = i + 1; j < masks.length; j++) {
          expect(masks[i]! & masks[j]!).toBe(0);
        }
      }
    },
  );
});
