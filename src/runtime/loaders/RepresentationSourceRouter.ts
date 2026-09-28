/**
 * runtime/loaders/RepresentationSourceRouter —— 表示感知源路由契约与运行时门面
 * （T021.1 类型层 → T021.7 门面接线，D41 §十一/§十六）。
 *
 * 职责：「表示 → source provider」开放式扩展结构的类型真相源（021.1）+ 现有路由之上
 *      的**运行时门面**（021.7，渐进扩展不重写）：provideRepresentationSource
 *      (assetId, seed, representation, preset?) → InstanceSource（preset = 色卡，
 *      T024.1 透传位）。内部路由：high/mid/low →
 *      现有 AssetSourceRouter（kind 分派：GLB file 分支忽略 level 恒 high，D28.5 不变
 *      ——GLB 无 representations 声明、有效链单档，canopy 永不被请求；procedural →
 *      ProceduralSourceCache，键 sourceKey::representation 双维）；canopy → 路由表
 *      canopy 行 provider（CanopySourceCache，T021.6 工厂产物 + bounds 成套）；未来
 *      impostor → ImpostorSourceCache（同形加行）。
 * 扩展契约（§十六）：**新增一个 Representation（如未来 Impostor）= 且仅 =**——
 *      ① 扩 domain/lod/representation 的 RuntimeRepresentation 联合类型 +
 *      ② providers 表类型加一行 provider 注册 + ③ 声明面 lod-spec.md 增量修订；
 *      不重写 Runtime（本门面 switch 零改动——h/m/l 直落既有路由，未注册的非构建
 *      表示在类型层被 ProceduralLevel 收窄强制接线）。
 * 防御路径：canopy 请求但 providers 未注册 canopy 行（装配缺项，非生产形态）→ reject
 *      ——调用方（池/散布）sourceReady 保持 false、对象停留当前表示，**不静默回 high**
 *      （021.7 裁定：回退会掩盖接线错误）。
 * 边界：门面零 THREE import（THREE 类型经 InstanceSource 结构引用）；representation
 *      永不进 sourceKey / 形态身份（D19/D23.2）；不重写 AssetSourceRouter /
 *      ProceduralSourceCache / CanopySourceCache（各自持有各自缓存）。
 */
import type { RuntimeRepresentation } from '../../domain/lod/representation';
import type { InstanceSource } from '../instancing/InstancedAssetPool';
import type { AssetSourceRouter } from './AssetSourceRouter';

/**
 * 表示感知源提供者（D41 §十一）：assetId + 对象 seed（槽路由用，同现有
 * provideSource 语义）+ Runtime 表示 + 色卡 preset（T024.1，D44 #3——preset 进
 * sourceKey 分桶，canopy 冠色随卡）→ 实例化源（geometry / material /
 * customDepthMaterial? / bounds? 成套——§10.3 所有权归 Source/Cache）。
 */
export type RepresentationSourceProvider = (
  assetId: string,
  seed: number | undefined,
  representation: RuntimeRepresentation,
  preset?: string,
) => Promise<InstanceSource>;

/**
 * 表示 → provider 路由表（§十六 开放式扩展结构的注册形态）：
 * Partial——未注册表示的资产走现有无表示路由（现状流不动）；Readonly——注册后
 * 表结构不被运行时改写（表由装配期构建，门面消费）。canopy 行由 T021.6
 * CanopySourceCache 注册（021.7 接线完成）；impostor 行按 §六.5 预留承诺届时 = 扩联合
 * 类型 + 本表加一行 + lod-spec 增量修订，不重写 Runtime。
 */
export type RepresentationSourceRouteTable = Readonly<
  Partial<Record<RuntimeRepresentation, RepresentationSourceProvider>>
>;

/** 门面依赖（Renderer 装配注入；测试注 fake——结构化最小面，node 单测无 WebGL） */
export interface RepresentationSourceRouterDeps {
  /** 既有复合源路由（kind 分派 GLB loader / ProceduralSourceCache——high/mid/low 的承接面，渐进不重写） */
  assetRouter: Pick<AssetSourceRouter, 'provideInstanceSource'>;
  /**
   * 非构建表示的 provider 注册表（§十六）：021.7 生产形态 = { canopy: CanopySourceCache
   * 包装 }；canopy 行缺省不注册（门面 reject 防御）——未来 impostor 同形加行。
   */
  providers?: RepresentationSourceRouteTable;
}

/**
 * 表示感知源路由门面（T021.7，D41 §十一——现有路由之上的薄分流层，不重写既有链）：
 * high/mid/low 直落 AssetSourceRouter（构建档位表示，level 透传；GLB file 分支忽略
 * level 恒 high，D28.5）；providers 表注册的非构建表示（canopy）走对应 provider。
 * 零自有缓存（各源端各自持有）；零状态；随 Renderer 会话存亡（组合根装配）。
 */
export class RepresentationSourceRouter {
  private readonly assetRouter: RepresentationSourceRouterDeps['assetRouter'];
  private readonly providers: RepresentationSourceRouteTable;

  constructor(deps: RepresentationSourceRouterDeps) {
    this.assetRouter = deps.assetRouter;
    this.providers = deps.providers ?? {};
  }

  /**
   * 表示感知源入口（两链 provideSource 的统一后端，§十一）：
   * representation 缺省 'high'（与旧闭包 level 缺省语义逐位一致）；seed = 对象 seed
   * （槽路由在源端完成——ProceduralSourceCache / CanopySourceCache 同口径）；
   * preset 为色卡 id（T024.1）：canopy 行透传 provider 第四参、h/m/l 落
   * assetRouter.provideInstanceSource 的 opts.preset（归一在 Renderer 侧 choke
   * point 完成，本门面原样透传）。canopy 请求但 providers 无 canopy 行 → reject
   * （装配缺项防御——调用方 sourceReady 保持 false、对象停留当前表示，不静默回
   * high）。
   */
  provideRepresentationSource(
    assetId: string,
    seed?: number,
    representation?: RuntimeRepresentation,
    preset?: string,
  ): Promise<InstanceSource> {
    const rep = representation ?? 'high';
    const provider = this.providers[rep];
    if (provider) return provider(assetId, seed, rep, preset);
    if (rep === 'canopy') {
      return Promise.reject(
        new Error(`canopy 表示源未注册（装配缺 canopy provider）: ${assetId}`),
      );
    }
    // rep 此处经类型收窄为 'high' | 'mid' | 'low' = ProceduralLevel——直落既有路由
    return this.assetRouter.provideInstanceSource(assetId, { seed, preset, level: rep });
  }
}
