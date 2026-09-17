/**
 * io/SceneSerializer —— 场景数据（SceneData ⇄ JSON 字符串）互转。
 *
 * 职责：serialize 把 SceneData 转为标准场景 JSON 文本（version "2.0"，2 空格缩进，
 *      三层字段整体透传）；deserialize 做 JSON 解析与版本校验（不识别的版本抛带版本号
 *      与「v1 旧格式已停止支持」提示的错误），缺 objects / layers 字段抛定位错误；
 *      对 id / name / environment 缺省宽容回退。
 *      v2 对象类型 fail-fast（T6.9 按需门裁决：v1 旧数据兼容整体不做）：
 *      objects[i].type 合法值 'region' | 'model' | 'group'（group 为 T8.5 增量放行的
 *      纯组织节点，2.0 前向兼容——版本号不变），其余报路径化错误；region 对象须
 *      shape/semantic/style 三层齐备且 shape.type / semantic.type 为合法枚举、
 *      shape.points 为数组（结构级校验，不做深层校验——数字合法性/自相交归
 *      domain 校验管线）；model / group 对象不做结构校验（持久化语义不变）。
 * 边界：只做数据与 JSON 的互转，不含业务规则（几何合法性归 domain/validate）；
 *      零渲染（禁止 THREE）；场景文件只存数据定义与引用；产物为全新对象，
 *      与调用方数据不共享引用。io→domain 导入方向合法（分层 DAG）。
 */
import { createId } from '../core/id';
import { isSemanticType, isShapeType } from '../domain/regions';
import type { Layer } from '../scene/Layer';
import type { SceneData, SceneEnvironment } from '../scene/SceneData';
import type { SceneObject } from '../scene/SceneObject';

/** 当前场景文件版本（T6.9：v2 正式接管；v1 旧格式停止支持） */
export const SCENE_VERSION = '2.0';

/** 兼容的读取版本集合（仅 "2.0"；v1 旧数据兼容不做——用户裁决 2026-09-12） */
const SUPPORTED_VERSIONS = new Set<string>([SCENE_VERSION]);

/** 缺省环境（场景文件未提供 environment 时的回退值） */
const DEFAULT_ENVIRONMENT: SceneEnvironment = { preset: 'day' };

/** 场景对象合法类型（v2：region 三层结构 + model 资产引用 + group 纯组织节点（T8.5 增量，
 * 2.0 前向兼容放行——version 不变）；v1 旧要素类型已停止支持） */
const OBJECT_TYPES = ['region', 'model', 'group'] as const;

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * v2 对象类型与 region 三层结构校验（fail-fast，错误带路径定位）：
 * type 合法值 region/model/group；region 须三层齐备且 shape.type / semantic.type 合法枚举、
 * shape.points 为数组。model / group 不做结构校验（group 为纯组织节点，只有基座字段，
 * T8.5 增量放行——组层级（parentId 指向）随数组整体透传，序列化天然保序）。
 */
function assertValidObjects(objects: unknown[]): asserts objects is SceneObject[] {
  for (let i = 0; i < objects.length; i++) {
    const item = objects[i];
    const path = `objects[${i}]`;
    if (!isPlainRecord(item)) {
      throw new Error(`场景文件 "objects" 数组元素必须是对象（路径：${path}）`);
    }
    if (!(OBJECT_TYPES as readonly string[]).includes(item.type as string)) {
      throw new Error(
        `不支持的场景对象类型："${String(item.type)}"（路径：${path}.type，合法类型：${OBJECT_TYPES.join('/')}；v1 旧要素对象已随 v2 格式停止支持）`,
      );
    }
    if (item.type === 'region') {
      for (const layer of ['shape', 'semantic', 'style'] as const) {
        if (!isPlainRecord(item[layer])) {
          throw new Error(
            `场景文件对象缺少必需字段 "${layer}"（路径：${path}.${layer}，region 对象须 shape/semantic/style 三层齐备）`,
          );
        }
      }
      const shape = item.shape as Record<string, unknown>;
      if (!isShapeType(shape.type)) {
        throw new Error(
          `场景文件字段 "shape.type" 非法："${String(shape.type)}"（路径：${path}.shape.type，合法值：polygon/rectangle/circle/ellipse/freehand/line/point）`,
        );
      }
      if (!Array.isArray(shape.points)) {
        throw new Error(`场景文件字段 "shape.points" 必须是数组（路径：${path}.shape.points）`);
      }
      const semantic = item.semantic as Record<string, unknown>;
      if (!isSemanticType(semantic.type)) {
        throw new Error(
          `场景文件字段 "semantic.type" 非法："${String(semantic.type)}"（路径：${path}.semantic.type，合法值：unclassified/water/grass/plaza/parking/bare_land/road/building/poi/custom）`,
        );
      }
    }
  }
}

export class SceneSerializer {
  /** SceneData → 标准场景 JSON 文本（纯转换，深字段按原样序列化） */
  serialize(data: SceneData): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * 场景 JSON 文本 → SceneData。
   * 抛错（均带定位信息）：非法 JSON / 根非对象 / 缺 version / 不识别的版本（信息含
   * 版本号与旧版停止支持提示）/ 对象类型非法或 region 三层结构缺失（v2 fail-fast）/
   * 缺 objects / layers 或二者非数组。
   */
  deserialize(json: string): SceneData {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch (err) {
      throw new Error(`场景文件不是合法 JSON：${(err as Error).message}`);
    }
    if (!isPlainRecord(parsed)) {
      throw new Error('场景文件根必须是 JSON 对象');
    }

    if (typeof parsed.version !== 'string' || parsed.version === '') {
      throw new Error(`场景文件缺少 version 字段（路径：version，当前支持：${[...SUPPORTED_VERSIONS].join('/')}）`);
    }
    if (!SUPPORTED_VERSIONS.has(parsed.version)) {
      throw new Error(
        `不支持的场景文件版本：${parsed.version}（路径：version，当前支持：${[...SUPPORTED_VERSIONS].join('/')}；v1 旧格式已停止支持，请使用新版本保存的场景文件）`,
      );
    }

    if (parsed.objects === undefined) {
      throw new Error('场景文件缺少必需字段 "objects"（路径：objects，应为对象数组）');
    }
    if (!Array.isArray(parsed.objects)) {
      throw new Error('场景文件字段 "objects" 必须是数组（路径：objects）');
    }
    if (parsed.layers === undefined) {
      throw new Error('场景文件缺少必需字段 "layers"（路径：layers，应为图层数组）');
    }
    if (!Array.isArray(parsed.layers)) {
      throw new Error('场景文件字段 "layers" 必须是数组（路径：layers）');
    }

    assertValidObjects(parsed.objects);

    return {
      version: SCENE_VERSION,
      id: typeof parsed.id === 'string' && parsed.id !== '' ? parsed.id : createId('scene'),
      name: typeof parsed.name === 'string' ? parsed.name : '未命名场景',
      environment:
        isPlainRecord(parsed.environment) &&
        typeof parsed.environment.preset === 'string' &&
        parsed.environment.preset !== ''
          ? (parsed.environment as SceneEnvironment)
          : { ...DEFAULT_ENVIRONMENT },
      layers: parsed.layers as Layer[],
      objects: parsed.objects as SceneObject[],
    };
  }
}
