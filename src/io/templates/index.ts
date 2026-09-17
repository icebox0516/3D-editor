/**
 * io/templates —— 场景模板（T8.2 第一部分）。
 *
 * 职责：
 *   - 内置模板两套（静态 JSON 随构建打包、零 fetch）：「空园区」（与
 *     createDefaultSceneData() 完全同构——图层名序派生自 semanticDefinitions
 *     defaultLayerName + 模型层，单一真相源）与「示例园区」（6 对象轻量示范，
 *     T7.8 验收园区样例裁剪；shape/semantic/style 三层结构逐字段对照
 *     JsonImporter 产物形态）；模块加载时各经 SceneSerializer.deserialize 校验
 *     一次——坏文件 fail-fast 抛错，属构建期断言（v2 版本门 + 对象结构校验）；
 *   - regenerateSceneIds 纯函数：深拷贝 + 全量 id 重生成（scene → scene_、
 *     layer → layer_、object → region_/model_），一致重映射 object.layerId /
 *     object.parentId / layer.objectIds，陈旧引用剔除沿 bootstrap.openScene
 *     过滤语义——防跨场景 id 冲突与模板原场景污染（「模板只读、实例全新」）。
 * 边界：io 层纯数据模块（零渲染零 THREE）；模板 id（'builtin-empty' 等）为
 *      注册表键命名空间先例（固定字符串），不走 createId 前缀体系；用户模板
 *      localStorage CRUD 见 ./userTemplates（TemplatePayload 持久化形态共用）。
 */
import { createId } from '../../core/id';
import { deepClone } from '../../core/utils';
import type { SceneData } from '../../scene/SceneData';
import type { SceneObject } from '../../scene/SceneObject';
import { SceneSerializer } from '../SceneSerializer';
import emptyCampusJson from './empty-campus.json';
import sampleCampusJson from './sample-campus.json';

// 用户模板 localStorage CRUD 同目录伴生模块（汇总导出便于 app 层单点导入）
export * from './userTemplates';

/** 模板载荷：完整 SceneData 快照 + 清单元数据（builtin = 随构建打包的内置模板） */
export interface TemplatePayload {
  id: string;
  name: string;
  builtin: boolean;
  scene: SceneData;
}

/**
 * 装载内置模板：静态 JSON 经 SceneSerializer.deserialize 校验（fail-fast——
 * 版本门仅认 2.0 + region 三层结构校验；坏文件在模块加载即抛错，构建期断言）。
 */
function loadBuiltinTemplate(id: string, name: string, json: unknown): TemplatePayload {
  const scene = new SceneSerializer().deserialize(JSON.stringify(json));
  return { id, name, builtin: true, scene };
}

/** 内置模板清单（顺序 = 子菜单呈现序：空园区在前） */
export const BUILTIN_TEMPLATES: readonly TemplatePayload[] = [
  loadBuiltinTemplate('builtin-empty', '空园区', emptyCampusJson),
  loadBuiltinTemplate('builtin-sample', '示例园区', sampleCampusJson),
];

/** 按 id 查内置模板（未知 id → undefined，调用方静默处理） */
export function builtinTemplateOf(id: string): TemplatePayload | undefined {
  return BUILTIN_TEMPLATES.find((t) => t.id === id);
}

/**
 * 实例化模板：深拷贝 + 全量 id 重生成。
 * - scene id → createId('scene')；每 layer id → createId('layer')；
 *   每 object id → createId(type === 'model' ? 'model' : 'region')；
 * - object.layerId / object.parentId 按映射重写，指向已不存在的旧 id 落 null；
 * - layer.objectIds 一致重映射，并按 openScene 语义剔除不在本图层（或不存在）
 *   的陈旧引用（SceneManager.addObject 会按 layerId 补齐派生索引）。
 */
export function regenerateSceneIds(data: SceneData): SceneData {
  const clone = deepClone(data);

  const layerIdMap = new Map<string, string>();
  for (const layer of clone.layers) layerIdMap.set(layer.id, createId('layer'));

  const objectIdMap = new Map<string, string>();
  for (const obj of clone.objects) {
    objectIdMap.set(obj.id, createId(obj.type === 'model' ? 'model' : 'region'));
  }

  const objectsById = new Map<string, SceneObject>();
  for (const obj of clone.objects) {
    obj.id = objectIdMap.get(obj.id)!;
    obj.layerId = obj.layerId !== null ? (layerIdMap.get(obj.layerId) ?? null) : null;
    obj.parentId = obj.parentId !== null ? (objectIdMap.get(obj.parentId) ?? null) : null;
    objectsById.set(obj.id, obj);
  }

  for (const layer of clone.layers) {
    layer.id = layerIdMap.get(layer.id)!;
    layer.objectIds = layer.objectIds
      .map((id) => objectIdMap.get(id))
      .filter((id): id is string => id !== undefined)
      .filter((id) => objectsById.get(id)?.layerId === layer.id);
  }

  clone.id = createId('scene');
  return clone;
}
