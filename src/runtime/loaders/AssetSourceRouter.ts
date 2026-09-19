/**
 * runtime/loaders/AssetSourceRouter —— 复合资产源路由（T002.3 接线，002.1 遗留项①）。
 *
 * 职责：按 AssetDescriptor.kind 把「实例化源 / Ghost 展示对象」两种请求分派到
 *      对应源端——kind:'file' → AssetLoader（GLB 模板缓存），kind:'procedural' →
 *      ProceduralSourceCache（同步构建 + 会话缓存），未注册 reject。消费方两处：
 *      Renderer 把 provideInstanceSource 注入 InstancedAssetPool 的源提供者
 *      （此前直连 AssetLoader，程序化 id 会 reject）、PreviewManager 的 Ghost 源
 *      （此前直连 AssetLoader.instantiate，程序化 Ghost 永远停留占位盒）。
 * Ghost 所有权契约：file 分支返回模板深克隆（clone 语义不变，消费方只挂载/移除）；
 *      procedural 分支返回共享缓存所持资源的 Mesh——**Ghost 方永不 dispose**
 *      （资源归缓存，随 ProceduralSourceCache.dispose 释放；现 hideGhost 只
 *      removeFromParent，语义天然兼容）。
 * 边界：依赖注入取窄接口（assets/loader/procedural 均结构化最小面，node 单测
 *      可注入 fake，不构造 GLTFLoader）；不缓存（两端各自缓存）；零状态。
 */
import * as THREE from 'three';
import type { ID } from '../../core/types';
import { isFileAssetDescriptor } from '../../domain/assets';
import type { ProceduralLevel } from '../../domain/assets';
import type { AssetRegistry } from '../../registries/AssetRegistry';
import type { InstanceSource } from '../instancing/InstancedAssetPool';
import type { ProceduralSourceCache } from '../procedural/ProceduralSourceCache';
import type { AssetLoader } from './AssetLoader';

/** 结构化最小依赖（Renderer 注入真实 AssetLoader / ProceduralSourceCache；测试注 fake） */
export interface AssetSourceRouterDeps {
  /** 统一资产注册表（kind 分派的判据） */
  assets: Pick<AssetRegistry, 'get'>;
  /** GLB 源端（只用到两个加载面） */
  loader: Pick<AssetLoader, 'loadInstanceSource' | 'instantiate'>;
  /** 程序化源端（会话私有缓存，由组合根随渲染器会话创建） */
  procedural: Pick<ProceduralSourceCache, 'load'>;
}

export class AssetSourceRouter {
  private readonly deps: AssetSourceRouterDeps;

  constructor(deps: AssetSourceRouterDeps) {
    this.deps = deps;
  }

  /**
   * 实例化源（InstancedAssetPool / ScatterChunkManager 的 provideSource）：file → GLB
   * 模板抽取（seed/level 概念仅程序化，file 分支不变）；procedural → 构建缓存
   * （seed/preset/level 透传——seed 为对象 seed 槽路由在缓存内完成，T008.1；level 为
   * 档位维度 `sourceKey::level` 缓存键，T006.3 消费 load({level}) 既有 API，键规则归缓存）。
   */
  provideInstanceSource(
    assetId: ID,
    opts?: { seed?: number; preset?: string; level?: ProceduralLevel },
  ): Promise<InstanceSource> {
    const descriptor = this.deps.assets.get(assetId);
    if (!descriptor) {
      return Promise.reject(new Error(`未注册的模型资产: ${assetId}`));
    }
    if (isFileAssetDescriptor(descriptor)) {
      return this.deps.loader.loadInstanceSource(assetId);
    }
    return this.deps.procedural.load(assetId, opts);
  }

  /**
   * Ghost 展示对象（PreviewManager 的 Ghost 源）：file → 模板深克隆（共享几何/材质，
   * 与既有 clone 语义逐位一致）；procedural → 共享缓存源的 Mesh（seed 透传槽路由——
   * 同槽对象 Ghost 与实例桶共用同一 Source；**Ghost 方永不 dispose**，
   * 所有权在缓存——见类头契约）。失败 reject（占位盒保留，由调用方 catch）。
   */
  async provideGhostObject(assetId: ID, seed?: number): Promise<THREE.Object3D> {
    const descriptor = this.deps.assets.get(assetId);
    if (!descriptor) {
      throw new Error(`未注册的模型资产: ${assetId}`);
    }
    if (isFileAssetDescriptor(descriptor)) {
      return this.deps.loader.instantiate(assetId);
    }
    const source = await this.deps.procedural.load(assetId, { seed });
    return new THREE.Mesh(source.geometry, source.material);
  }
}
