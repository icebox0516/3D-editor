/**
 * tests/app/environment.test.ts —— 环境预设切换 / 保存恢复测试（T2.4，先测后码）。
 *
 * 覆盖（任务书：EnvironmentPanel 切换只改 SceneData.environment 并 emit scene:changed，
 *       随场景保存；验收硬项「环境预设切换后保存重开恢复」）：
 * - setEnvironment：更新门面环境、emit scene:changed(source='setEnvironment')、不入历史
 *   （环境切换按任务书只改数据发事件、不入撤销栈）；
 * - getEnvironment：返回当前环境（深拷贝，外部修改不污染）；
 * - 切换后 saveScene → SceneSerializer.deserialize → openScene：环境预设保持；
 * - openScene 同步门面环境（getEnvironment 反映文件内容）；
 * - camera Port 随门面暴露（UI 聚焦接线的组合根出口）。
 */
import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/events/EventBus';
import type { SceneData } from '../../src/scene/SceneData';
import { SceneSerializer } from '../../src/io/SceneSerializer';
import { createEditor } from '../../src/app/bootstrap';

describe('环境预设：切换与保存恢复', () => {
  it('setEnvironment：改数据、发 scene:changed 一次、不入历史', () => {
    const eventBus = new EventBus();
    const facade = createEditor(null, { eventBus });
    const changed = vi.fn();
    eventBus.on('scene:changed', changed);

    expect(facade.getEnvironment()).toEqual({ preset: 'day' });
    facade.setEnvironment({ preset: 'night' });

    expect(facade.getEnvironment()).toEqual({ preset: 'night' });
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith({ source: 'setEnvironment' });
    expect(facade.history.canUndo()).toBe(false); // 不入撤销栈
    facade.dispose();
  });

  it('getEnvironment 返回深拷贝：外部修改不污染门面状态', () => {
    const facade = createEditor(null);
    const env = facade.getEnvironment();
    (env as { preset: string }).preset = 'tech';
    expect(facade.getEnvironment().preset).toBe('day');
    facade.dispose();
  });

  it('切换 → 保存 → 重开恢复（验收硬项）', () => {
    const facade = createEditor(null);
    facade.setEnvironment({ preset: 'tech' });

    const json = facade.saveScene();
    const data: SceneData = new SceneSerializer().deserialize(json);
    expect(data.environment.preset).toBe('tech');

    facade.openScene(data);
    expect(facade.getEnvironment().preset).toBe('tech');

    // 重开后再次保存：环境保持
    const again = new SceneSerializer().deserialize(facade.saveScene());
    expect(again.environment.preset).toBe('tech');
    facade.dispose();
  });

  it('打开其他环境的场景文件：门面环境随之替换', () => {
    const facade = createEditor(null);
    const file = facade.saveScene();
    facade.setEnvironment({ preset: 'dusk' });

    const data = new SceneSerializer().deserialize(file); // day 场景
    facade.openScene(data);
    expect(facade.getEnvironment().preset).toBe('day');
    facade.dispose();
  });

  it('门面暴露 camera Port（组合根接线出口）', () => {
    const facade = createEditor(null);
    expect(typeof facade.camera.focusObjects).toBe('function');
    expect(typeof facade.camera.focusAll).toBe('function');
    facade.dispose();
  });
});
