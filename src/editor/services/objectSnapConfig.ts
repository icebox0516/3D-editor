/**
 * editor/services/objectSnapConfig —— 对象吸附共享配置（T7.6 R3）。
 *
 * 职责：gizmo translate 对象吸附的可变共享配置（DrawGridConfig 先例）——开关与
 *      容差。由组合根 bootstrap 构造一份注入 Renderer → GizmoImpl deps 与
 *      EditorHandle（组合根超集字段 objectSnap），UI 设置面板「吸附」组读写同一
 *      对象即时生效（不入历史、不随场景文件持久化——会话级偏好，与 snapEnabled 同语义）。
 * 边界：纯数据对象，零 THREE；runtime 侧以结构化 ObjectSnapSource 消费
 *      （DAG 禁止 runtime→editor 导入，结构兼容由组合根装配保证）。
 */

/** 对象吸附配置（共享可变对象：bootstrap 构造 → GizmoImpl 读取 / handle 更新） */
export interface ObjectSnapConfig {
  /** 对象吸附开关（默认开；关闭时 gizmo translate 仅剩网格吸附） */
  enabled: boolean;
  /** 吸附容差（米；非法值由 GizmoImpl 纯函数视为不吸附） */
  threshold: number;
}

/** 默认吸附容差（米，主代理裁决 0.5） */
export const DEFAULT_OBJECT_SNAP_THRESHOLD = 0.5;

/** 吸附容差合法区间（设置面板钳制；米） */
export const OBJECT_SNAP_THRESHOLD_MIN = 0.05;
export const OBJECT_SNAP_THRESHOLD_MAX = 5;

/** 构造共享配置对象（缺省吸附开、容差 0.5m） */
export function createObjectSnapConfig(
  threshold = DEFAULT_OBJECT_SNAP_THRESHOLD,
): ObjectSnapConfig {
  return { enabled: true, threshold };
}
