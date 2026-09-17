/**
 * scene/Layer —— 图层数据接口。
 *
 * 职责：声明图层的显示属性（visible/locked/opacity/order）与成员索引（objectIds）。
 * 边界：纯数据接口；objectIds 是由 SceneManager 依据对象 layerId 维护的派生索引，
 *      调用方不应手工修改（updateLayer 的 patch 会忽略该字段）。
 */
import type { ID } from '../core/types';

export interface Layer {
  id: ID;
  name: string;
  visible: boolean;
  locked: boolean;
  /** 图层不透明度 [0,1] */
  opacity: number;
  /** 叠加顺序（小者后画在上，具体渲染语义由 runtime 决定） */
  order: number;
  /** 成员对象 ID 列表（派生索引，由 SceneManager 维护） */
  objectIds: ID[];
}
