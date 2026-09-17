/**
 * tests/app/regionCommandRegistry.test.ts —— 组合根命令工厂注册测试（T6.1，先测后码）。
 *
 * 锁定：阶段 6 命令三件套（ChangeShape/ChangeSemantic/ChangePreset）已注册进
 * createCommandRegistry（键名 = 命令类名，沿现有十条模式），可经
 * facade.registries.commands.create 构造出对应命令实例。
 */
import { describe, expect, it } from 'vitest';
import { createEditor } from '../../src/app/bootstrap';
import { ChangePresetCommand } from '../../src/editor/commands/ChangePresetCommand';
import { ChangeSemanticCommand } from '../../src/editor/commands/ChangeSemanticCommand';
import { ChangeShapeCommand } from '../../src/editor/commands/ChangeShapeCommand';
import type { RegionShape } from '../../src/domain/regions';

const sampleShape: RegionShape = {
  type: 'polygon',
  points: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
  ],
  baseHeight: 0,
  closed: true,
};

describe('createCommandRegistry：region 三命令工厂注册', () => {
  it('ChangeShapeCommand 工厂可构造对应实例', () => {
    const facade = createEditor(null);
    const cmd = facade.registries.commands.create('ChangeShapeCommand', {
      objectId: 'region_x',
      shape: sampleShape,
    });
    expect(cmd).toBeInstanceOf(ChangeShapeCommand);
    expect(cmd.name).toBe('ChangeShapeCommand');
    facade.dispose();
  });

  it('ChangeSemanticCommand 工厂可构造对应实例', () => {
    const facade = createEditor(null);
    const cmd = facade.registries.commands.create('ChangeSemanticCommand', {
      objectId: 'region_x',
      semantic: { type: 'water', properties: {} },
    });
    expect(cmd).toBeInstanceOf(ChangeSemanticCommand);
    expect(cmd.name).toBe('ChangeSemanticCommand');
    facade.dispose();
  });

  it('ChangePresetCommand 工厂可构造对应实例', () => {
    const facade = createEditor(null);
    const cmd = facade.registries.commands.create('ChangePresetCommand', {
      objectId: 'region_x',
      style: { presetId: 'default_solid', overrides: {} },
    });
    expect(cmd).toBeInstanceOf(ChangePresetCommand);
    expect(cmd.name).toBe('ChangePresetCommand');
    facade.dispose();
  });
});
