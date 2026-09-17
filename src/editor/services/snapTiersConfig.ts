/**
 * editor/services/snapTiersConfig —— 吸附分级共享配置（T8.1 R4）。
 *
 * 职责：吸附体系的「总开关 + 新分项（角度/高度）+ 角度步长」共享可变配置——
 *      沿 ObjectSnapConfig / DrawGridConfig 先例（组合根构造一份注入 runtime 与
 *      EditorHandle，会话级偏好：不入历史、不随场景文件持久化）。分项语义：
 *      - masterEnabled：总开关（Context Toolbar 吸附钮 / 菜单 tool.snap 同源路由；
 *        off = 压下全部吸附分项不写各分项记忆，on = 恢复各分项设置值；不影响绘制
 *        辅助锁定三键 Shift/A/G——两组概念显式区分）；
 *      - angleEnabled / angleStepDeg：gizmo rotate 角度步进（TransformControls
 *        rotationSnap，弧度换算；相对拖拽起始姿态的增量步进——three.js 既定语义）；
 *      - elevationEnabled：gizmo translate Y 轴高度层吸附（容差复用 ObjectSnapConfig）；
 *      - 按住 Ctrl 拖拽 = 总状态临时反转（masterEnabled XOR ctrl；gizmo 与顶点编辑
 *        两路在消费点即时计算）。
 * 边界：纯数据对象，零 THREE；runtime 侧以结构化 SnapTiersSource 消费
 *      （DAG 禁止 runtime→editor 导入，结构兼容由组合根装配保证）。
 */
import { degToRad } from '../../core/utils';

/** 吸附分级配置（共享可变对象：bootstrap 构造 → GizmoImpl/顶点管线读取 / handle 更新） */
export interface SnapTiersConfig {
  /** 吸附总开关（默认开；off 压下全部吸附分项，不写各分项记忆） */
  masterEnabled: boolean;
  /** 角度吸附分项（gizmo rotate 步进） */
  angleEnabled: boolean;
  /** 角度步长（度；非法值由 angleSnapToRadians 视为不吸附） */
  angleStepDeg: number;
  /** 高度吸附分项（gizmo translate Y 轴高度层） */
  elevationEnabled: boolean;
}

/** 默认角度步长（度；Unity 默认 / UE 常用档，任务书调研定稿） */
export const DEFAULT_ANGLE_STEP_DEG = 15;

/** 下拉固定档（UE 下拉快切；配合自由数值输入 = Unity 自由值合体） */
export const ANGLE_STEP_PRESETS_DEG: readonly number[] = [5, 15, 45];

/** 步长合法区间（设置面板钳制；度） */
export const ANGLE_STEP_MIN = 0.1;
export const ANGLE_STEP_MAX = 360;

/**
 * 步长（度）→ 弧度（TransformControls.setRotationSnap 入参）；
 * 非法（≤0 / 非有限）→ null（不吸附）。
 */
export function angleSnapToRadians(stepDeg: number): number | null {
  if (!Number.isFinite(stepDeg) || stepDeg <= 0) return null;
  return degToRad(stepDeg);
}

/** 构造共享配置对象（缺省：总开关开 / 角度开 15° / 高度开） */
export function createSnapTiersConfig(
  angleStepDeg = DEFAULT_ANGLE_STEP_DEG,
): SnapTiersConfig {
  return { masterEnabled: true, angleEnabled: true, angleStepDeg, elevationEnabled: true };
}
