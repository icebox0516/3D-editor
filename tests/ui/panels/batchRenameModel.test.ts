/**
 * tests/ui/panels/batchRenameModel.test.ts —— 批量重命名模型纯函数测试（T8.3 先测后码）。
 *
 * 覆盖（任务书 §2 + 边界裁定 4）：
 * - 前缀+序号模式：前缀（可空 = 纯序号）/ 起始序号 / 步长 / 位数填充（1/2/3 位）；
 * - 查找/替换模式：全部出现处替换（「楼1」→「宿舍楼1」高频用例）、无命中原样、
 *   查找串可被清空替换（replaceWith 空 = 删除）；
 * - 可提交判定：replace 空查找串禁用；prefix 步长 ≤0 禁用（防全部同名）；
 * - 预览：前 8 条 from→to + 超出 more + 总数 total；
 * - 命令规划：逐对象 UpdateObjectCommand(name) 合一条 BatchCommand（N=1 单命令）、
 *   无任何变化 → null、一条历史一次 undo 全部复原。
 * 边界：node 环境纯逻辑（无 jsdom）；弹层 GUI 行为留阶段验收。
 */
import { describe, expect, it } from 'vitest';
import { EventBus } from '../../../src/core/events/EventBus';
import { SceneManager } from '../../../src/scene/SceneManager';
import { SelectionManager } from '../../../src/scene/SelectionManager';
import { HistoryManager } from '../../../src/editor/history/HistoryManager';
import { createRegionObject } from '../../../src/domain/regions';
import type { RegionObject } from '../../../src/domain/regions';
import {
  applyBatchRename,
  batchRenameCommand,
  batchRenamePreview,
  isBatchRenameSubmittable,
} from '../../../src/ui/panels/batchRenameModel';
import type { BatchRenameRule } from '../../../src/ui/panels/batchRenameModel';

const TRIANGLE = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
] as const;

function makeRegion(name: string): RegionObject {
  return createRegionObject({
    shape: { type: 'polygon', points: [...TRIANGLE], baseHeight: 0, closed: true },
    semanticType: 'building',
    name,
  });
}

function prefixRule(overrides: Partial<BatchRenameRule> = {}): BatchRenameRule {
  return { mode: 'prefix', prefix: '', start: 1, step: 1, digits: 1, find: '', replaceWith: '', ...overrides };
}

function replaceRule(find: string, replaceWith: string): BatchRenameRule {
  return { mode: 'replace', prefix: '', start: 1, step: 1, digits: 1, find, replaceWith };
}

describe('applyBatchRename：前缀+序号模式', () => {
  it('前缀 + 起始 1 步长 1 → 逐项编号', () => {
    expect(applyBatchRename(['楼A', '楼B', '楼C'], prefixRule({ prefix: '宿舍' }))).toEqual([
      '宿舍1',
      '宿舍2',
      '宿舍3',
    ]);
  });

  it('位数填充：digits 2/3 → padStart 补零', () => {
    expect(applyBatchRename(['a', 'b'], prefixRule({ prefix: '栋', digits: 2 }))).toEqual([
      '栋01',
      '栋02',
    ]);
    expect(applyBatchRename(['a'], prefixRule({ prefix: 'P', digits: 3 }))).toEqual(['P001']);
  });

  it('起始序号与步长可配（start 5 step 10 → 5/15/25）', () => {
    expect(applyBatchRename(['x', 'y', 'z'], prefixRule({ start: 5, step: 10 }))).toEqual([
      '5',
      '15',
      '25',
    ]);
  });

  it('空前缀 = 纯序号重命名', () => {
    expect(applyBatchRename(['任意旧名', '另一旧名'], prefixRule())).toEqual(['1', '2']);
  });

  it('步长 ≤0 视为非法 → 原样返回（拷贝，不改输入语义）', () => {
    const names = ['a', 'b'];
    expect(applyBatchRename(names, prefixRule({ step: 0 }))).toEqual(['a', 'b']);
    expect(applyBatchRename(names, prefixRule({ step: -2 }))).toEqual(['a', 'b']);
  });

  it('空列表 → 空列表', () => {
    expect(applyBatchRename([], prefixRule())).toEqual([]);
  });
});

describe('applyBatchRename：查找/替换模式', () => {
  it('全部出现处替换（「楼1」→「宿舍楼1」高频用例）', () => {
    expect(applyBatchRename(['楼1', '楼2', '操场'], replaceRule('楼', '宿舍楼'))).toEqual([
      '宿舍楼1',
      '宿舍楼2',
      '操场',
    ]);
  });

  it('同一名字内多次出现全替换；替换串空 = 删除', () => {
    expect(applyBatchRename(['楼-楼'], replaceRule('楼', '舍'))).toEqual(['舍-舍']);
    expect(applyBatchRename(['楼1', '楼2'], replaceRule('楼', ''))).toEqual(['1', '2']);
  });

  it('空查找串 → 原样返回（不可提交，UI 禁用确认）', () => {
    expect(applyBatchRename(['a', 'b'], replaceRule('', 'x'))).toEqual(['a', 'b']);
    expect(isBatchRenameSubmittable(replaceRule('', 'x'))).toBe(false);
  });
});

describe('isBatchRenameSubmittable（确认按钮门控）', () => {
  it('prefix 合法参数 → true；步长 ≤0 → false', () => {
    expect(isBatchRenameSubmittable(prefixRule({ prefix: '宿舍' }))).toBe(true);
    expect(isBatchRenameSubmittable(prefixRule({ step: 0 }))).toBe(false);
  });

  it('replace 查找串非空 → true（替换串可为空）', () => {
    expect(isBatchRenameSubmittable(replaceRule('楼', ''))).toBe(true);
  });
});

describe('batchRenamePreview（实时预览：前 8 条 + 共 N 项）', () => {
  it('超出上限：rows 截断 8 条 + more + total = 全部对象数', () => {
    const names = Array.from({ length: 10 }, (_, i) => `旧名${i + 1}`);
    const preview = batchRenamePreview(names, prefixRule({ prefix: '新' }));
    expect(preview.rows).toHaveLength(8);
    expect(preview.rows[0]).toEqual({ from: '旧名1', to: '新1' });
    expect(preview.rows[7]).toEqual({ from: '旧名8', to: '新8' });
    expect(preview.more).toBe(true);
    expect(preview.total).toBe(10);
  });

  it('未超上限：全量 rows + more=false', () => {
    const preview = batchRenamePreview(['楼1', '楼2'], replaceRule('楼', '宿舍楼'));
    expect(preview.rows).toEqual([
      { from: '楼1', to: '宿舍楼1' },
      { from: '楼2', to: '宿舍楼2' },
    ]);
    expect(preview.more).toBe(false);
    expect(preview.total).toBe(2);
  });
});

describe('batchRenameCommand（逐对象改名合一条历史）', () => {
  function setup() {
    const eventBus = new EventBus();
    const sceneManager = new SceneManager(eventBus);
    const selection = new SelectionManager(eventBus);
    const history = new HistoryManager({ sceneManager, selection, eventBus });
    return { sceneManager, selection, history };
  }

  it('多对象改名 → 一条 BatchCommand；undo 一次全部复原', () => {
    const fx = setup();
    const objects = [makeRegion('楼A'), makeRegion('楼B'), makeRegion('楼C')];
    for (const obj of objects) fx.sceneManager.addObject(obj);

    expect(fx.history.execute(batchRenameCommand(objects, prefixRule({ prefix: '宿舍' }))!)).toBe(true);
    expect(objects.map((o) => o.name)).toEqual(['宿舍1', '宿舍2', '宿舍3']);

    let depth = 0;
    while (fx.history.undo()) depth += 1;
    expect(depth).toBe(1); // 一条历史
    expect(objects.map((o) => o.name)).toEqual(['楼A', '楼B', '楼C']);
  });

  it('查找替换模式同样单条历史（「楼1」→「宿舍楼1」）', () => {
    const fx = setup();
    const objects = [makeRegion('楼1'), makeRegion('楼2')];
    for (const obj of objects) fx.sceneManager.addObject(obj);

    expect(fx.history.execute(batchRenameCommand(objects, replaceRule('楼', '宿舍楼'))!)).toBe(true);
    expect(objects.map((o) => o.name)).toEqual(['宿舍楼1', '宿舍楼2']);

    fx.history.undo();
    expect(objects.map((o) => o.name)).toEqual(['楼1', '楼2']);
  });

  it('N=1 → 直接单命令（不包 Batch）', () => {
    const cmd = batchRenameCommand([makeRegion('a')], prefixRule({ prefix: 'x' }))!;
    expect(cmd.name).toBe('UpdateObjectCommand');
  });

  it('全部无变化 → null（不产生空历史）', () => {
    expect(batchRenameCommand([makeRegion('楼1')], replaceRule('不存在', 'x'))).toBeNull();
    // prefix 步长非法 → 不改名 → null
    expect(batchRenameCommand([makeRegion('a')], prefixRule({ step: 0 }))).toBeNull();
    expect(batchRenameCommand([], prefixRule())).toBeNull();
  });

  it('部分对象新名恰与旧名相同 → 只对变化对象产命令', () => {
    const cmd = batchRenameCommand([makeRegion('宿舍1'), makeRegion('楼B')], prefixRule({ prefix: '宿舍' }))!;
    expect(cmd.name).toBe('UpdateObjectCommand'); // 仅 1 条变化 → 单命令
  });
});
