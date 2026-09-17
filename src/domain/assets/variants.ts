/**
 * domain/assets/variants —— 烘焙式变体的确定性掷骰（T002.3，D6/D17）。
 *
 * 职责：ProceduralVariants（jitter 半宽声明）+ seed → 变体采样（缩放系数 / Y 旋转
 *      偏移 / 色相偏移）。放置链路（PlacementTool）在放置瞬间 rollVariantSeed 掷新
 *      seed、采样结果烘进 transform（所见即所放），seed 存 ModelObject.asset.seed；
 *      渲染侧（Renderer）按同 seed 复算色相偏移写 instanceColor——撤销/重做/场景
 *      重载经同路径复算，同 seed 同结果逐位一致（D6 烘焙式语义的确定性根基）。
 * 边界：零 THREE、纯函数（rollVariantSeed 为唯一非确定点，仅採 seed 不采样）；
 *      seed → 随机流映射用 core/random mulberry32（整数运算 + Math.imul，跨引擎逐位
 *      一致，不是加密随机但对变体掷骰足够；依据：bryc 十行 PRDF 基准实现）。
 *      jitter 语义严格按 D17 半宽：scaleJitter 乘性 ×U[1-j,1+j]、
 *      rotationJitter 绕 Y ±deg、hueJitter ±deg；负值/非有限值按 0（防御）。
 */
import { mulberry32 } from '../../core/random';
import type { ProceduralVariants } from './AssetDescriptor';

/** 一次变体采样结果（相对标称值的增量；恒等 = 1 / 0 / 0） */
export interface VariantSample {
  /** 均匀缩放乘性系数（1 = 无缩放抖动） */
  scaleFactor: number;
  /** 绕 Y 旋转偏移（弧度；0 = 无旋转抖动） */
  rotationYOffset: number;
  /** 色相偏移（度；0 = 无色相抖动） */
  hueOffset: number;
}

/**
 * 掷新 seed（唯一非确定点：供放置瞬间调用）。
 * 产出非负 31 位整数——覆盖 mulberry32 全定义域且可 JSON 无损落盘（Number.isSafeInteger）。
 */
export function rollVariantSeed(): number {
  return Math.floor(Math.random() * 0x8000_0000);
}

/** jitter 输入防御：非有限或负值按 0（无抖动） */
function jitterOf(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * 确定性变体采样：同 seed 同结果逐位一致（撤销重做/场景重载复算同色同形的根基）。
 * 只对 jitter > 0 的通道消费随机流（各通道独立：后期为资产新增色相声明不改变
 * 同 seed 下既有缩放/旋转的历史值）。variants 缺省或全 0 → 恒等采样（1 / 0 / 0，
 * 不消费随机流）。旋转按 D17 度语义掷骰、按接口契约折算弧度返回。
 */
export function applyAssetVariants(
  variants: ProceduralVariants | undefined,
  seed: number,
): VariantSample {
  const scaleJitter = jitterOf(variants?.scaleJitter);
  const rotationJitter = jitterOf(variants?.rotationJitter);
  const hueJitter = jitterOf(variants?.hueJitter);
  if (scaleJitter === 0 && rotationJitter === 0 && hueJitter === 0) {
    return { scaleFactor: 1, rotationYOffset: 0, hueOffset: 0 };
  }
  const rng = mulberry32(seed);
  const scaleFactor =
    scaleJitter > 0 ? 1 + (rng() * 2 - 1) * scaleJitter : 1; // ×U[1-j, 1+j] 相对乘性
  const rotationYOffset =
    rotationJitter > 0 ? ((rng() * 2 - 1) * rotationJitter * Math.PI) / 180 : 0; // ±deg → rad
  const hueOffset = hueJitter > 0 ? (rng() * 2 - 1) * hueJitter : 0; // ±deg
  return { scaleFactor, rotationYOffset, hueOffset };
}

/** 变体掷骰启用判定：声明存在且任一 jitter > 0（全 0 = 等价无声明，不掷 seed） */
export function hasVariantJitter(variants: ProceduralVariants | undefined): boolean {
  return (
    jitterOf(variants?.scaleJitter) > 0 ||
    jitterOf(variants?.rotationJitter) > 0 ||
    jitterOf(variants?.hueJitter) > 0
  );
}
