/**
 * ui/saveStatus —— 保存状态机（T5.2，纯 reducer，node 可测）。
 *
 * 职责：保存四态（saved / saving / dirty / error）与五事件
 *      （SCENE_CHANGED / SAVE_START / SAVE_OK / SAVE_FAIL / SCENE_LOADED）的
 *      纯状态转移表。App 层接线：dirty 判定靠「节流 500ms 快照对比」驱动
 *      SCENE_CHANGED（openScene 也发 scene:changed，计数法会误报——主代理裁定 5）；
 *      openScene / 新建场景后发 SCENE_LOADED 复位基线。
 * 边界：纯函数零依赖；saving 期间 SCENE_CHANGED 落 dirty、随后 SAVE_OK 落 saved
 *      属预期（保存期间的新修改由下一拍快照对比再发 SCENE_CHANGED 自愈纠正）。
 */

/** 保存状态：已保存 / 保存中（瞬态） / 修改未保存 / 保存失败 */
export type SaveState = 'saved' | 'saving' | 'dirty' | 'error';

/** 状态机事件（由 app 层动作路由发出） */
export type SaveEvent =
  | 'SCENE_CHANGED' // 快照对比发现与基线不同（≠ scene:changed 计数）
  | 'SAVE_START' // 序列化 + 下载开始
  | 'SAVE_OK' // 下载成功（基线已刷新）
  | 'SAVE_FAIL' // 序列化/下载异常（不静默，提示条承接）
  | 'SCENE_LOADED'; // openScene / 新建场景：基线复位

/** 顶部状态点文案（.ed-savestate 着色：success/accent/ink-3/danger） */
export const SAVE_STATE_LABEL: Readonly<Record<SaveState, string>> = {
  saved: '已保存',
  saving: '保存中…',
  dirty: '修改未保存',
  error: '保存失败',
};

/** 转移表：事件 → 目标态（与来源无关；全矩阵见 tests/ui/saveStatus.test.ts） */
const TRANSITIONS: Readonly<Record<SaveEvent, SaveState>> = {
  SCENE_CHANGED: 'dirty',
  SAVE_START: 'saving',
  SAVE_OK: 'saved',
  SAVE_FAIL: 'error',
  SCENE_LOADED: 'saved',
};

/** 状态转移纯函数（未知事件原样返回） */
export function reduceSaveStatus(state: SaveState, event: SaveEvent): SaveState {
  return TRANSITIONS[event] ?? state;
}
