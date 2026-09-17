/**
 * editor/tools/draw/DrawValidationError —— 绘制完成校验失败错误。
 *
 * 职责：DrawSession.complete() 校验不通过时抛出，携带 domain 层 validateGeometry 的
 *      ValidationError 列表，供工具层（T3.2 绘制工具）转成 UI 提示。
 * 边界：仅包装校验错误，不做校验本身（校验逻辑唯一归属 domain/validate）；
 *      code 取首个错误的 code（快捷访问），errors 为完整列表。
 */
import type { ValidationError } from '../../../domain/validate/validateGeometry';

export class DrawValidationError extends Error {
  /** 校验错误完整列表（来自 validateGeometry 或 complete 前置规则） */
  readonly errors: ValidationError[];

  constructor(errors: ValidationError[], message?: string) {
    super(message ?? defaultMessage(errors));
    this.name = 'DrawValidationError';
    this.errors = errors;
  }

  /** 首个错误码快捷访问（无错误时为 null） */
  get code(): ValidationError['code'] | null {
    return this.errors[0]?.code ?? null;
  }
}

function defaultMessage(errors: ValidationError[]): string {
  if (errors.length === 0) return '绘制几何校验失败';
  return errors.map((e) => e.message).join('；');
}
