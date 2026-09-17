/**
 * editor/factories/groupFactory —— GroupObject 共享构建工厂（T8.5）。
 *
 * 职责：建组命令（GroupCommand）与测试共用的组壳构建唯一入口——新 id（createId('group')，
 *      前缀白名单 CONTRACTS #7 增补）、type=GROUP_OBJECT_TYPE、transform 恒等（纯组织
 *      节点：组不传递变换）、layerId 缺省 null（组无图层语义——可见性走图层体系，
 *      组不改变成员图层归属）、visible/locked 缺省 true/false。
 * 边界：editor 层纯函数（分层 DAG：只依赖 core/scene）；零 THREE / 零 DOM；
 *      产物为全新对象（每次调用独立 transform 向量，与调用方解耦）。
 */
import { createId } from '../../core/id';
import type { ID } from '../../core/types';
import type { GroupObject } from '../../scene/GroupObject';
import { GROUP_OBJECT_TYPE } from '../../scene/GroupObject';

/** 组壳构造入参（全部缺省——最小空壳语义） */
export interface CreateGroupInit {
  /** 组名（缺省「分组」；序号版本由调用方计算后传入） */
  name?: string;
  /** 父组 id（缺省 null = 根级；嵌套组建组时传入） */
  parentId?: ID | null;
}

/** 构建一枚组壳（新 id、恒等变换、契约缺省字段） */
export function createGroupObject(init: CreateGroupInit = {}): GroupObject {
  return {
    id: createId('group'),
    type: GROUP_OBJECT_TYPE,
    name: init.name ?? '分组',
    parentId: init.parentId ?? null,
    layerId: null, // 组无图层语义（成员 layerId 独立）
    visible: true,
    locked: false,
    transform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    properties: {},
  };
}
