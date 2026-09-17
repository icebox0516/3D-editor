/**
 * domain/assets/ModelObject —— 场景中的模型放置对象。
 *
 * 职责：复用 SceneObject 的通用能力（选择/变换/图层/保存），以 asset 引用承载资产实例。
 * 边界：纯数据；模型文件本体不进场景，运行时按 assetId 加载并实例化。
 */
import type { SceneObject } from '../../scene';
import type { AssetReference } from './AssetReference';

export interface ModelObject extends SceneObject {
  asset: AssetReference;
}

/**
 * 模型对象的默认归属图层名（单一真相源）。
 * T6.7（2026-09-12）：默认图层翻转为十类语义图层 + 模型层——十语义层名派生自
 * domain/regions/semanticDefinitions 的 defaultLayerName；模型对象非语义类型，
 * 其默认层名锚定在此（app 组合根 DEFAULT_LAYER_NAMES 追加第十一层、ui 放置入口
 * 归层查找共用；domain 层可被 app/ui 两侧导入，不违反 DAG）。
 */
export const MODEL_LAYER_NAME = '模型';

/**
 * 模型贴地抬升常量（T9.2 贴地共面 z-fighting 消除，单一数值源——沿
 * semanticDefinitions.defaultBaseHeight「唯一数值源」先例；editor/runtime/app 共用）。
 * 语义：模型底面永远比承托面高 lift——不止地面层（含道路顶 0.06 / 楼顶等派生层）。
 * 五路落点全部引用本常量（点击放置 buildTransform / 拖放 defaultAssetTransform /
 * 工厂缺省 / 贴地命令承托层 / gizmo 高度吸附候选层），全仓不得出现第二处魔数。
 * 取值依据：0.03 > 网格线抬升 0.02（模型底面高于网格层）、< road baseHeight 0.06
 * （贴地表层最低档）——夹在既有层序之间不与任何一层冲突；与地面 y=0 的精确共面
 * 深度平局（光栅化舍入决定胜负 → 闪烁）由此拉开稳定间距，另由地面材质
 * polygonOffset 正偏置兜底手动 y=0 输入（Renderer.makeGroundMaterial）。
 * 边界注记：旧场景（v2.0 透传）y=0 模型不迁移，仍由地面偏置兜底。
 */
export const MODEL_BASE_HEIGHT = 0.03;

/**
 * 结构判别：含合法 asset 引用的对象视为 ModelObject（域类型无运行时标记；
 * Renderer/贴地命令共用的单一实现——T9.2 自 Renderer 私有函数收编入域）。
 */
export function isModelObject(obj: SceneObject): obj is ModelObject {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'asset' in obj &&
    typeof (obj as ModelObject).asset?.assetId === 'string'
  );
}
