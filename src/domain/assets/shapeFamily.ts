/**
 * domain/assets/shapeFamily —— 形态族三流域 seed 派生与 sourceKey 组装（T008.1，D19.3/D19.4）。
 *
 * 职责：对象只存单 seed S（ModelObject.asset.seed），本模块把它派生成三条互不复用的
 *      随机流域——①shapeSlotOf：S 只负责路由选槽（hash32(S ∥ 'shape') mod N），
 *      绝不喂随机流复用；②morphRng/morphSeedOf：(assetId, slot) 只负责该槽形态几何
 *      （形态算法演化只动这条流）；③instanceRngOf：S 只负责对象表现（缩放/旋转Y/
 *      色相/风相位）。另产 ④aSeedValueOf：S 经 'aseed' 专用域折算 [0,1)，写进桶
 *      InstancedMesh 的 aSeed 逐实例属性（uTime 管「全局风刮到哪一帧」、aSeed 管
 *      「每棵树怎么各吹各的」——D19.7 分工）。
 *      sourceKeyOf 把 (assetId, preset?, slot?) 组装成缓存与池共用的唯一键——
 *      一个 sourceKey = 一份合并 Geometry Source = 池内一个桶。
 * 边界：零 THREE、纯函数（同输入同输出逐位一致）；域分离常量 'shape'/'morph'/
 *      'instance'/'aseed' 三流一属性互不复用；形态结果的稳定性由 shapeSlot +
 *      morphRng 与版本化生成算法共同保证（v1 只承诺当前版本内确定性）。
 */
import { hash32, hashCell, hashString, mulberry32 } from '../../core/random';

/** 域分离常量：槽路由流（只做路由，绝不喂随机流复用） */
const SHAPE_DOMAIN = 'shape';
/** 域分离常量：形态几何流种子域（morphRng 的派生域） */
const MORPH_DOMAIN = 'morph';
/** 域分离常量：对象表现流（缩放/旋转Y/色相/风相位） */
const INSTANCE_DOMAIN = 'instance';
/** 域分离常量：aSeed 逐实例属性折算域（与槽路由/对象表现隔离——只服务风相位类消费） */
const ASEED_DOMAIN = 'aseed';

/**
 * 对象 seed → 形态槽序号（D19.3 ①）：hash32(S ∥ 'shape') mod size。
 * size 来自资产 meta.shapeFamily.size（调用方读注册表；本函数不查表）。
 */
export function shapeSlotOf(seed: number, size: number): number {
  return hash32(seed, SHAPE_DOMAIN) % size;
}

/**
 * (assetId, slot) → 该槽形态流种子（D19.3 ②，契约第一锁的落点）：
 * assetId 经 hashString 数值化后与 slot 混合，再过 'morph' 域分离——
 * 产物就是 morphRng 的种子（morphSeedOf = mulberry32 种子，两函数恒等配套）。
 * **不含对象 seed**：不同对象只要路由到同一槽，morphSeed 逐位相同，
 * 因此 build({ seed: morphSeed }) 命中同一缓存条目、Geometry/Material 同引用。
 */
export function morphSeedOf(assetId: string, slot: number): number {
  return hash32(hashCell(hashString(assetId), slot, 0), MORPH_DOMAIN);
}

/** (assetId, slot) → 该槽形态随机流（形态几何生成专用；种子见 morphSeedOf） */
export function morphRngOf(assetId: string, slot: number): () => number {
  return mulberry32(morphSeedOf(assetId, slot));
}

/** 对象 seed → 对象表现随机流（D19.3 ③：缩放/旋转Y/色相/风相位，不建新几何） */
export function instanceRngOf(seed: number): () => number {
  return mulberry32(hash32(seed, INSTANCE_DOMAIN));
}

/**
 * 对象 seed → aSeed 逐实例属性值：'aseed' 专用域哈希折算 [0,1)（同 seed 同值
 * 逐位确定；与槽路由/对象表现域隔离——改 size 或换槽不影响 aSeed 值）。
 */
export function aSeedValueOf(seed: number): number {
  return hash32(seed, ASEED_DOMAIN) / 4294967296;
}

/**
 * sourceKey 组装（缓存键与池桶键的单一真相源，D19.4）：
 * 无槽 'assetId' / 有槽 'assetId:slot-N'；preset 非空时插在槽段前
 * （'assetId:preset:slot-N'；preset 为协议扩展位，v1 无消费方，空串按缺省归一）。
 */
export function sourceKeyOf(assetId: string, slot?: number, preset?: string): string {
  const presetPart = preset !== undefined && preset !== '' ? `:${preset}` : '';
  return slot === undefined ? `${assetId}${presetPart}` : `${assetId}${presetPart}:slot-${slot}`;
}
