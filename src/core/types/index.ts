/**
 * core/types —— 全层公共基础类型与运行时类型守卫。
 *
 * 职责：ID 别名、二维/三维向量、欧拉角（弧度）、Transform 复合结构，
 *      以及供反序列化/外部数据入口使用的对应类型守卫。
 * 边界：纯类型 + 纯函数守卫，不含业务逻辑，零导入（core 不依赖任何层与任何外部包）。
 *
 * 坐标约定（CONTRACTS.md #8）：编辑器内部世界坐标，Y 向上，地面为 XZ 平面（y=0）；
 * 业务几何 Vec2 = (x, 世界 z)，即 Vec2.y 存放世界 z 分量。
 */

/** 业务 ID：字符串，由 core/id 的 createId(prefix) 生成（CONTRACTS.md #7 前缀表） */
export type ID = string;

/** 业务二维向量（业务几何坐标）：y 分量即世界 z */
export interface Vec2 {
  x: number;
  y: number;
}

/** 三维向量（世界坐标，Y 向上） */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * 测量种类（阶段 10 会话态测量域，contracts/stage10-measure.md §A）。
 * 物理定义在 core 的原因：core/events 的 MeasureStatusPayload（EventMap）需引用本类型，
 * 而 DAG 禁止 core→editor 导入——editor/services/measure 对本类型做再导出（单一真相源在 core）。
 */
export type MeasureKind = 'distance' | 'height' | 'area' | 'angle';

/** 欧拉角（弧度，非角度） */
export interface Euler {
  x: number;
  y: number;
  z: number;
}

/** 变换复合结构：位移 + 旋转（弧度）+ 缩放 */
export interface Transform {
  position: Vec3;
  rotation: Euler;
  scale: Vec3;
}

/** 有限数值判断（拒绝 NaN / Infinity，几何坐标必须有限） */
function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

/** Vec2 守卫：非 null 对象且 x/y 均为有限数值（多余字段容忍） */
export function isVec2(v: unknown): v is Vec2 {
  return (
    typeof v === 'object' &&
    v !== null &&
    isFiniteNumber((v as Vec2).x) &&
    isFiniteNumber((v as Vec2).y)
  );
}

/** Vec3 守卫：非 null 对象且 x/y/z 均为有限数值 */
export function isVec3(v: unknown): v is Vec3 {
  return (
    typeof v === 'object' &&
    v !== null &&
    isFiniteNumber((v as Vec3).x) &&
    isFiniteNumber((v as Vec3).y) &&
    isFiniteNumber((v as Vec3).z)
  );
}

/** Euler 守卫：非 null 对象且 x/y/z 均为有限数值（结构同 Vec3，语义为弧度） */
export function isEuler(v: unknown): v is Euler {
  return isVec3(v);
}

/** Transform 守卫：position/scale 为 Vec3，rotation 为 Euler */
export function isTransform(v: unknown): v is Transform {
  if (typeof v !== 'object' || v === null) return false;
  const t = v as Record<string, unknown>;
  return isVec3(t.position) && isEuler(t.rotation) && isVec3(t.scale);
}
