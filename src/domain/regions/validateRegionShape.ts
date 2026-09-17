/**
 * domain/regions/validateRegionShape —— RegionShape 校验适配器（阶段 6 T6.1）。
 *
 * 职责：把 RegionShape 映射到既有 validateGeometry 语义（分域契约 §D「几何两套标准」② 校验复用）：
 *   - polygon / freehand（面类手绘）→ 外环 = points 的 PolygonGeometryData，复用环校验：
 *     自相交拦截、顶点不足拦截、未闭合补点与顺时针反转的 autoFixed 语义原样透传；
 *   - rectangle / circle / ellipse（参数化形状，顶点由纯函数生成）与 line / point → 直通合法
 *     （任务书：天然合法，恒 { valid: true, errors: [], autoFixed: false }）。
 * 边界：纯适配——validateGeometry 的就地修复（补闭合点/反转）作用于适配层深拷贝副本，
 *      本函数不改动传入 shape.points；业务几何两套标准的其余映射（绘制预览/导入）不在此职责内。
 */
import { deepClone } from '../../core/utils';
import { validateGeometry } from '../validate/validateGeometry';
import type { ValidationResult } from '../validate/validateGeometry';
import type { RegionShape } from './RegionObject';

/** 校验 RegionShape（面类环校验复用 validateGeometry；参数化形状与线/点直通合法） */
export function validateRegionShape(shape: RegionShape): ValidationResult {
  if (shape.type === 'polygon' || shape.type === 'freehand') {
    // 外环深拷贝：validateGeometry 对 coordinates 就地修复，不得反写调用方数据
    const geometry = { type: 'Polygon' as const, coordinates: [deepClone(shape.points)] };
    return validateGeometry(geometry);
  }
  return { valid: true, errors: [], autoFixed: false };
}
