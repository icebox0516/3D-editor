/**
 * scene/SceneObject —— 场景内一切可编辑、可保存对象的统一基类接口。
 *
 * 职责：声明对象的身份（id/type/name）、层级归属（parentId/layerId）、
 *      显示状态（visible/locked）、空间变换（transform）与开放业务数据（properties/metadata）。
 * 边界：纯数据接口，不含行为与渲染语义；Element（domain）与 ModelObject 均由此派生。
 */
import type { ID, Transform } from '../core/types';

export interface SceneObject {
  /** 稳定业务 ID（element_ / model_ / scene_ 前缀，core/id 生成） */
  id: ID;
  /** 类型标识（注册制/保留字段；现状合法值：'region'（RegionObject）/ 'model'（ModelObject）/ 'group'（GroupObject，T8.5 纯组织节点）） */
  type: string;
  name: string;
  /** 父对象 ID（层级树挂靠：组壳或组成员非 null；根级对象为 null——T8.5 起真实层级） */
  parentId: ID | null;
  /** 所属图层 ID；null 表示未归属任何图层 */
  layerId: ID | null;
  visible: boolean;
  locked: boolean;
  /** 世界坐标变换（position/rotation(弧度)/scale，Y 向上） */
  transform: Transform;
  /** 业务属性（由对象类型收窄，如 RegionObject 的语义参数经 semantic.properties 承载） */
  properties: Record<string, unknown>;
  /** 附加元数据（不入业务逻辑，可随场景保存） */
  metadata?: Record<string, unknown>;
}
