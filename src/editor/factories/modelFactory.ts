/**
 * editor/factories/modelFactory —— ModelObject 共享构建工厂（T5.5）。
 *
 * 职责：PlacementTool（点击放置，transform 含随机采样语义）与 App 拖放路径（确定性
 *      放置）共用的对象构建唯一入口：新 id（createId('model')）、type=MODEL_OBJECT_TYPE、
 *      name=资产名、asset={assetId} 引用（T002.3 起可选携带变体 seed），其余字段按契约缺省。
 * 变换语义（主代理裁定 2026-09-10；T9.2 增补贴地抬升）：
 *   - transform 显式传入 → 原样深拷贝采用（工具路径：随机旋转/缩放/滚轮系数在调用方采样，
 *     含 y——抬升归各落点路径自加，工厂不改写显式变换）；
 *   - transform 缺省 → 单位变换（rotation 0 / scale 1 / position = 给定值，皆缺省时
 *     XZ 原点 + y = MODEL_BASE_HEIGHT——工厂缺省落点即贴地抬升层），纯确定性、零随机采样；
 *   - defaultAssetTransform 辅助：资产默认姿态（defaultRotation + defaultScale 副本）+
 *     承托面落点（y = position.y + MODEL_BASE_HEIGHT），供拖放路径组装确定性 transform
 *     （任务书「新 id / defaultScale / defaultRotation，无随机采样」的落点）。
 * 边界：editor 层纯函数（分层 DAG：只依赖 core/domain）；零 THREE / 零 DOM；
 *      产物为深拷贝快照——与 CreateObjectCommand 构造即深拷贝的防御语义一致，
 *      调用方后续修改入参不影响已创建对象。
 */
import { createId } from '../../core/id';
import type { ID, Transform, Vec3 } from '../../core/types';
import { MODEL_BASE_HEIGHT } from '../../domain/assets';
import type { AssetCommonMeta, ModelObject } from '../../domain/assets';

/** 放置对象类型标识（SceneObject.type；场景只存 assetId 引用） */
export const MODEL_OBJECT_TYPE = 'model';

const ZERO_ROTATION = { x: 0, y: 0, z: 0 } as const;
const UNIT_SCALE = { x: 1, y: 1, z: 1 } as const;
/** 工厂缺省落点：原点 XZ + 贴地抬升 y（T9.2：模型底面比承托面高 lift，消共面 z-fighting） */
const DEFAULT_REST_POSITION = { x: 0, y: MODEL_BASE_HEIGHT, z: 0 } as const;

/** 单位变换于给定位置（确定性：rotation 0 / scale 1；显式 position 视为调用方已定基准，不抬升） */
function unitTransformAt(position?: Vec3): Transform {
  return {
    position: { ...(position ?? DEFAULT_REST_POSITION) },
    rotation: { ...ZERO_ROTATION },
    scale: { ...UNIT_SCALE },
  };
}

/**
 * 资产默认姿态 + 承托面落点（确定性，无随机采样；拖放路径用）。返回副本，与资产解耦。
 * T9.2：position 语义 = 承托面点（拖放 groundPoint，y=0），产物底面 y = position.y +
 * MODEL_BASE_HEIGHT——模型底面永远比承托面高 lift（XZ 透传不受影响）。
 */
export function defaultAssetTransform(asset: AssetCommonMeta, position: Vec3): Transform {
  return {
    position: { x: position.x, y: position.y + MODEL_BASE_HEIGHT, z: position.z },
    rotation: { ...asset.defaultRotation },
    scale: { ...asset.defaultScale },
  };
}

export interface CreateModelObjectAtInit {
  /** 目标资产（name / assetId 取自此；公共面——file/procedural 两种 kind 通吃） */
  asset: AssetCommonMeta;
  /** 归属图层（null = 无归属，由调用方决定） */
  layerId: ID | null;
  /** 落点位置（仅 transform 缺省时作为单位变换的 position；缺省原点） */
  position?: Vec3;
  /** 完整变换（显式传入原样采用——工具路径的随机采样结果）；缺省 = 单位变换于 position */
  transform?: Transform;
  /**
   * 烘焙式变体 seed（T002.3，可选）：写入 asset.seed 供渲染侧确定性复算变体
   * （缩放/旋转已烘进 transform，seed 驱动 instanceColor 色相复算）。
   * 缺省不写字段——GLB 与拖放路径的对象结构零变化（不变字段零变化）。
   */
  seed?: number;
}

/** 构建一枚待放置的 ModelObject（新 id、契约缺省字段；确定性，无随机采样——seed 由调用方掷） */
export function createModelObjectAt(init: CreateModelObjectAtInit): ModelObject {
  return {
    id: createId('model'),
    type: MODEL_OBJECT_TYPE,
    name: init.asset.name,
    parentId: null,
    layerId: init.layerId,
    visible: true,
    locked: false,
    transform: init.transform ? deepCopyTransform(init.transform) : unitTransformAt(init.position),
    properties: {},
    asset: { assetId: init.asset.id, ...(init.seed !== undefined ? { seed: init.seed } : {}) },
  };
}

/** Transform 浅结构深拷贝（三个向量各一份，足以隔离调用方后续修改） */
function deepCopyTransform(t: Transform): Transform {
  return {
    position: { ...t.position },
    rotation: { ...t.rotation },
    scale: { ...t.scale },
  };
}
