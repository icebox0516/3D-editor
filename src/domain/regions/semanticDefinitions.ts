/**
 * domain/regions/semanticDefinitions —— 语义类型枚举与内置语义定义数据（阶段 6 T6.1）。
 *
 * 职责：SemanticType 十类枚举 + SemanticDefinition 结构 + 十条内置定义 + 查询函数；
 *      语义 → 默认图层名的**单一真相源** = 本表 defaultLayerName 字段（主代理裁决 2026-09-11：
 *      旧「按要素类型的默认图层名表」与十类语义图层存在撞键不同值——如旧 water→'Water'、
 *      语义 water→'水面'——硬扩展必破坏共存与既有测试，故本任务不改旧表；旧表与语义图层的
 *      统一翻转让 T6.7 收口）。
 * 边界：纯数据表，零渲染；properties 复用基础契约 StyleParameter 形态（v1 domain/styles 定义，
 *      阶段 6 插件继续复用，见 contracts/legacy-elements.md 退役注记）。
 * 取值依据：
 *  - label / defaultLayerName：需求《绘制需求变更.md》§四 定稿中文名；
 *  - road.width 默认 6 对齐 v1 registries/definitions/road.ts；building.height 默认 10 对齐 v1
 *    registries/definitions/building.ts；
 *  - defaultPresetId：unclassified 钉死 'default_solid'（任务书）；bare_land 无专属预设
 *    （保持 default_solid）；其余八类随 T6.3 预设库落地指向各类默认预设——
 *    water→water.standard / grass→grass.lawn / plaza→plaza.paving / parking→parking.standard /
 *    road→road.standard / building→building.default / poi→poi.billboard / custom→base.flat；
 *    'default_solid' 仍为 T6.2 样式引擎降级兜底基线；
 *  - defaultBaseHeight 为贴地层抬升基准的唯一数值源（road 0.06 / grass 0.12 / water 0.18，
 *    其余 0；v1 runtime SURFACE_ELEVATION 表已随旧要素体系删除），语义见分域契约 §A
 *    高度合成（最终 y = baseHeight + position.y）。
 */
import type { StyleParameter } from '../styles';

/** 十类语义类型（需求 §二#4 / 分域契约 §A 逐字一致；顺序为注册/展示定稿顺序） */
export const SEMANTIC_TYPES = [
  'unclassified',
  'water',
  'grass',
  'plaza',
  'parking',
  'bare_land',
  'road',
  'building',
  'poi',
  'custom',
] as const;

export type SemanticType = (typeof SEMANTIC_TYPES)[number];

/** 未知值是否为合法 SemanticType（守卫，避免散落 includes 判断） */
export function isSemanticType(value: unknown): value is SemanticType {
  return typeof value === 'string' && (SEMANTIC_TYPES as readonly string[]).includes(value);
}

/**
 * 一种语义类型的全部注册信息（registries 层 SemanticRegistry 的注册件形态）。
 * properties 驱动属性面板按类型定义自动生成业务参数控件（road: width / building: height）。
 */
export interface SemanticDefinition {
  /** 语义类型标识（注册键） */
  type: SemanticType;
  /** 显示名（面板类型下拉项） */
  label: string;
  /** 类型默认归属图层名（语义→图层名的单一真相源；归层时按名在场景图层中查找，缺失落「未分层」） */
  defaultLayerName: string;
  /** 业务参数定义（面板据此生成；无参数类型为空数组） */
  properties: StyleParameter[];
  /** 类型默认样式预设 id（T6.3 预设库落地：八类指向专属默认预设；unclassified/bare_land 保持 default_solid） */
  defaultPresetId: string;
  /** 贴地层抬升基准（绘制创建时按语义写入 shape.baseHeight，分域契约 §A 高度合成） */
  defaultBaseHeight: number;
}

/** 十条内置语义定义（顺序同 SEMANTIC_TYPES） */
export const SEMANTIC_DEFINITIONS: readonly SemanticDefinition[] = [
  {
    type: 'unclassified',
    label: '未分类',
    defaultLayerName: '未分类',
    properties: [],
    defaultPresetId: 'default_solid', // 任务书钉死：unclassified 默认预设
    defaultBaseHeight: 0,
  },
  {
    type: 'water',
    label: '水面',
    defaultLayerName: '水面',
    properties: [],
    defaultPresetId: 'water.standard', // T6.3 落地：水面默认预设（标准水面）
    defaultBaseHeight: 0.18, // 贴地抬升基准（层序最高，防与地面/网格 z-fighting）
  },
  {
    type: 'grass',
    label: '绿地',
    defaultLayerName: '绿地',
    properties: [],
    defaultPresetId: 'grass.lawn', // T6.3 落地：绿地默认预设（草地）
    defaultBaseHeight: 0.12, // 贴地抬升基准（层序介于 road 与 water 之间）
  },
  {
    type: 'plaza',
    label: '广场',
    defaultLayerName: '广场',
    properties: [],
    defaultPresetId: 'plaza.paving', // T6.3 落地：广场默认预设（铺装广场，新增 3 套）
    defaultBaseHeight: 0,
  },
  {
    type: 'parking',
    label: '停车场',
    defaultLayerName: '停车场',
    properties: [],
    defaultPresetId: 'parking.standard', // T6.3 落地：停车场默认预设（标准停车区，迁移 2 套）
    defaultBaseHeight: 0,
  },
  {
    type: 'bare_land',
    label: '裸地',
    defaultLayerName: '裸地',
    properties: [],
    defaultPresetId: 'default_solid', // bare_land 无专属预设（T6.3 未覆盖，保持兜底基线）
    defaultBaseHeight: 0,
  },
  {
    type: 'road',
    label: '道路',
    defaultLayerName: '道路',
    properties: [
      // 初始值对齐 v1 registries/definitions/road.ts（centerline 模式默认宽 6m）；
      // 消费方：runtime GeometryBuilder 读 semantic.properties.width 生成带宽面（§C）
      { key: 'width', label: '宽度', type: 'number', default: 6, min: 0, step: 0.1 },
    ],
    defaultPresetId: 'road.standard', // T6.3 落地：道路默认预设（标准道路，迁移 2 套）
    defaultBaseHeight: 0.06, // 贴地抬升基准（贴地表层最低档）
  },
  {
    type: 'building',
    label: '建筑',
    defaultLayerName: '建筑',
    properties: [
      // 初始值对齐 v1 registries/definitions/building.ts（默认高 10m）；
      // 消费方：building 预设在 build 内按 height 挤出（§C，立体感由样式预设实现）
      { key: 'height', label: '高度', type: 'number', default: 10, min: 0, step: 0.5 },
    ],
    defaultPresetId: 'building.default', // T6.3 落地：建筑默认预设（默认建筑，挤出改造 2 套）
    defaultBaseHeight: 0,
  },
  {
    type: 'poi',
    label: 'POI',
    defaultLayerName: 'POI',
    properties: [],
    defaultPresetId: 'poi.billboard', // T6.3 落地：POI 默认预设（图标牌，新增 3 套）
    defaultBaseHeight: 0,
  },
  {
    type: 'custom',
    label: '自定义',
    defaultLayerName: '自定义',
    properties: [],
    defaultPresetId: 'base.flat', // T6.3 落地：自定义默认预设（base 通用纯色，新增 3 套）
    defaultBaseHeight: 0,
  },
];

/** 按类型查内置语义定义；未知类型返回 undefined（消费方自行回退或拒绝） */
export function getSemanticDefinition(type: string): SemanticDefinition | undefined {
  return SEMANTIC_DEFINITIONS.find((def) => def.type === type);
}
