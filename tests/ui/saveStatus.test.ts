/**
 * tests/ui/saveStatus.test.ts —— 保存状态机 reducer 全事件矩阵测试（T5.2，先测后码）。
 *
 * 覆盖（任务书「保存状态机（纯 reducer，node 可测）」）：
 * - SaveState 四态与文案表（已保存 / 保存中… / 修改未保存 / 保存失败）；
 * - reduce 全状态 × 全事件矩阵（4 态 × 5 事件 = 20 格）：
 *   SCENE_CHANGED → dirty（任何来源态）；SAVE_START → saving；SAVE_OK → saved；
 *   SAVE_FAIL → error；SCENE_LOADED → saved（openScene / 新建后的基线复位）。
 * 边界：纯函数零依赖，node 直测；App 层 dirty 判定靠快照对比（本模块只管状态字），
 *      saving 期间 SCENE_CHANGED 落 dirty、随后 SAVE_OK 落 saved 属预期——
 *      节流快照对比会在下一拍重新发 SCENE_CHANGED 纠正（自愈，app 接线测试覆盖）。
 */
import { describe, expect, it } from 'vitest';
import {
  SAVE_STATE_LABEL,
  type SaveState,
  reduceSaveStatus,
} from '../../src/ui/saveStatus';

const ALL_STATES: SaveState[] = ['saved', 'saving', 'dirty', 'error'];

describe('SAVE_STATE_LABEL 文案表', () => {
  it('四态文案齐全（顶部状态点用）', () => {
    expect(SAVE_STATE_LABEL.saved).toBe('已保存');
    expect(SAVE_STATE_LABEL.saving).toBe('保存中…');
    expect(SAVE_STATE_LABEL.dirty).toBe('修改未保存');
    expect(SAVE_STATE_LABEL.error).toBe('保存失败');
  });
});

describe('reduceSaveStatus 全事件矩阵', () => {
  it('SCENE_CHANGED：任何状态 → dirty', () => {
    for (const from of ALL_STATES) {
      expect(reduceSaveStatus(from, 'SCENE_CHANGED')).toBe('dirty');
    }
  });

  it('SAVE_START：任何状态 → saving', () => {
    for (const from of ALL_STATES) {
      expect(reduceSaveStatus(from, 'SAVE_START')).toBe('saving');
    }
  });

  it('SAVE_OK：任何状态 → saved', () => {
    for (const from of ALL_STATES) {
      expect(reduceSaveStatus(from, 'SAVE_OK')).toBe('saved');
    }
  });

  it('SAVE_FAIL：任何状态 → error', () => {
    for (const from of ALL_STATES) {
      expect(reduceSaveStatus(from, 'SAVE_FAIL')).toBe('error');
    }
  });

  it('SCENE_LOADED：任何状态 → saved（openScene / 新建场景基线复位）', () => {
    for (const from of ALL_STATES) {
      expect(reduceSaveStatus(from, 'SCENE_LOADED')).toBe('saved');
    }
  });
});

describe('reduceSaveStatus 典型时序', () => {
  it('命令修改 → 保存成功：saved → dirty → saving → saved', () => {
    let s: SaveState = 'saved';
    s = reduceSaveStatus(s, 'SCENE_CHANGED');
    expect(s).toBe('dirty');
    s = reduceSaveStatus(s, 'SAVE_START');
    expect(s).toBe('saving');
    s = reduceSaveStatus(s, 'SAVE_OK');
    expect(s).toBe('saved');
  });

  it('保存失败 → 再修改 → 再保存成功：error 自愈', () => {
    let s: SaveState = reduceSaveStatus('dirty', 'SAVE_START');
    s = reduceSaveStatus(s, 'SAVE_FAIL');
    expect(s).toBe('error');
    s = reduceSaveStatus(s, 'SCENE_CHANGED');
    expect(s).toBe('dirty');
    s = reduceSaveStatus(s, 'SAVE_START');
    s = reduceSaveStatus(s, 'SAVE_OK');
    expect(s).toBe('saved');
  });

  it('打开场景：dirty/error → SCENE_LOADED → saved', () => {
    expect(reduceSaveStatus('dirty', 'SCENE_LOADED')).toBe('saved');
    expect(reduceSaveStatus('error', 'SCENE_LOADED')).toBe('saved');
  });

  it('冗余事件幂等（dirty 上再发 SCENE_CHANGED 仍 dirty）', () => {
    expect(reduceSaveStatus('dirty', 'SCENE_CHANGED')).toBe('dirty');
    expect(reduceSaveStatus('saved', 'SAVE_OK')).toBe('saved');
  });
});
