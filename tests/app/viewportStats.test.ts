/**
 * tests/app/viewportStats.test.ts —— EditorHandle 超集 getViewportStats/getSceneName
 * 与环境扩展键（renderMode / axes）持久化测试（T5.7，先测后码）。
 *
 * 覆盖（组合根超集沿 getGrid 先例，零契约变更）：
 * - getViewportStats：无头（无 Renderer）返回零值不抛错；
 * - getSceneName：缺省「未命名场景」、sceneName 选项、openScene 跟随文件名；
 * - renderMode / axes 走环境通道：setEnvironment 写入 → getEnvironment 可读 →
 *   saveScene → deserialize → openScene 往返保持（沿 environment.grid 持久化先例）。
 */
import { describe, expect, it } from 'vitest';
import { createEditor } from '../../src/app/bootstrap';
import type { EditorHandle } from '../../src/app/bootstrap';
import { SceneSerializer } from '../../src/io/SceneSerializer';
import type { SceneData } from '../../src/scene/SceneData';

describe('EditorHandle 超集：getViewportStats', () => {
  it('无头形态返回零值快照（不抛错；浏览器形态由 GUI 验收覆盖）', () => {
    const facade = createEditor(null);
    expect(facade.getViewportStats()).toEqual({ fps: 0, triangles: 0, drawCalls: 0 });
    facade.dispose();
  });
});

describe('EditorHandle 超集：getSceneName', () => {
  it('缺省场景名「未命名场景」', () => {
    const facade = createEditor(null);
    expect(facade.getSceneName()).toBe('未命名场景');
    facade.dispose();
  });

  it('sceneName 装配选项生效', () => {
    const facade = createEditor(null, { sceneName: '总部园区' });
    expect(facade.getSceneName()).toBe('总部园区');
    facade.dispose();
  });

  it('openScene 后跟随文件场景名', () => {
    const facade: EditorHandle = createEditor(null);
    const data: SceneData = new SceneSerializer().deserialize(facade.saveScene());
    data.name = '外部导入园区';
    facade.openScene(data);
    expect(facade.getSceneName()).toBe('外部导入园区');
    facade.dispose();
  });
});

describe('环境扩展键：renderMode / axes（沿 env.grid 先例）', () => {
  it('setEnvironment 写入 → getEnvironment 读出 → 保存/重开往返保持', () => {
    const facade = createEditor(null);
    facade.setEnvironment({ preset: 'day', renderMode: 'wireframe', axes: { visible: false } });
    expect(facade.getEnvironment().renderMode).toBe('wireframe');
    expect(facade.getEnvironment().axes).toEqual({ visible: false });

    const data: SceneData = new SceneSerializer().deserialize(facade.saveScene());
    expect(data.environment.renderMode).toBe('wireframe');
    expect(data.environment.axes).toEqual({ visible: false });

    // 重开恢复（Renderer.applyEnvironment 消费同一数据通道）
    const reopened = createEditor(null);
    reopened.openScene(data);
    expect(reopened.getEnvironment().renderMode).toBe('wireframe');
    reopened.dispose();
    facade.dispose();
  });

  it('键缺省时环境保持缺省语义（shaded / 轴可见）', () => {
    const facade = createEditor(null);
    expect(facade.getEnvironment().renderMode).toBeUndefined();
    expect(facade.getEnvironment().axes).toBeUndefined();
    facade.dispose();
  });
});
