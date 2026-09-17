/**
 * editor/tools/draw/DrawGridConfig —— 绘制网格吸附共享配置（T3.3；T5.2 增开关位）。
 *
 * 职责：三绘制工具（点/线/面）共享的可变配置对象——网格吸附步长与全局吸附开关。
 *      由组合根 bootstrap 构造一份并注入三工具与 EditorHandle（组合根超集），
 *      UI 的 GridSettings 改间距、主菜单「工具 → 吸附」改开关，均经同一对象即时
 *      生效（主代理 2026-09-09 / 2026-09-10 裁定）。
 * 边界：纯数据对象，零 THREE；spacing 默认 5 m 与 SceneGrid 缺省间距统一
 *      （渲染网格/吸附步长/UI 显示一致）；snapEnabled 为会话级偏好，不随场景文件
 *      持久化（openScene 只同步 spacing）。
 */

/** 绘制网格吸附配置（共享可变对象：bootstrap 构造 → 工具读取 / handle 更新） */
export interface DrawGridConfig {
  /** 网格吸附步长（米；非法值由 snap.gridSkip 自然跳过吸附） */
  spacing: number;
  /** 全局吸附开关（默认开；工具内 G 键会话开关与之取「与」——任一关闭即不吸附） */
  snapEnabled: boolean;
}

/** 默认吸附步长（米）：与 DEFAULT_SCENE_GRID.spacing 统一（5 m） */
export const DEFAULT_DRAW_GRID_SPACING = 5;

/** 构造共享配置对象（缺省步长 5 m、吸附开） */
export function createDrawGridConfig(spacing = DEFAULT_DRAW_GRID_SPACING): DrawGridConfig {
  return { spacing, snapEnabled: true };
}
