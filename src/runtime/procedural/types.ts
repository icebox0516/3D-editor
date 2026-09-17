/**
 * runtime/procedural/types —— 程序化资产插件契约类型（T002.1，D17；D19.2 参数化）。
 *
 * 职责：定义 *.asset.ts 插件文件的模块形态——meta（身份证）与 build（生成器）
 *      同文件导出；build 为同步函数、可选参签名（D19.2：params.seed = Source/形态
 *      seed 即 morphSeed，绝非对象 asset.seed——见下条契约第一锁；params.preset 为
 *      协议扩展位，v1 无消费方）。旧资产 `build()` 无参声明天然兼容（TS 少参可赋
 *      多参签名，类型层面即证明；变体烘 transform/instanceColor 不进 build，
 *      LOD 到 T006 再扩展签名）。
 * 边界：本文件只有类型，零运行时；build 返回的 InstanceSource 形态真相源在
 *      runtime/instancing/InstancedAssetPool（与 GLB 实例化源同构，池无感混排）。
 */
import type { ProceduralAssetMeta } from '../../domain/assets';
import type { InstanceSource } from '../instancing/InstancedAssetPool';

/** build 入参（全可选；缺省 = 旧行为）：seed = 形态 seed（morphSeed）；preset = 协议扩展位 */
export interface ProceduralBuildParams {
  /**
   * Source/形态 seed（morphSeed，由 assetId + shapeSlot 派生——domain/assets/shapeFamily）。
   * **契约第一锁（D19）**：对象 asset.seed 永不直接传入——不同对象只要路由到同一槽，
   * 传入的 morphSeed 必须逐位相同，因此同 sourceKey 共享同一份 Geometry/Material。
   */
  seed?: number;
  /** 预设扩展位（D19.2：v1 无消费方，不进 Inspector） */
  preset?: string;
}

/** 程序化构建函数：同步、可选参（D19.2 参数化；缺省调用等价旧无参契约）。
 * 契约：每次调用必须构造**新的** geometry/material（不得返回模块级共享对象——缓存会 dispose 所持资源），
 * 所有权随调用移交调用方。 */
export type ProceduralBuild = (params?: ProceduralBuildParams) => InstanceSource;

/** *.asset.ts 模块形态：meta（身份证）+ build（生成器）同文件导出 */
export interface ProceduralAssetModule {
  meta: ProceduralAssetMeta;
  build: ProceduralBuild;
}
