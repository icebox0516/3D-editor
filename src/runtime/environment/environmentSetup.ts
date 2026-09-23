/**
 * runtime/environment/environmentSetup —— 环境天空段事务式构建单元（T018.3，D29.5 单一开关）。
 *
 * 职责：applyEnvironment 的「新路径尝试 → 成功 / 事务降级」裁定，一次调用完成：
 *  - **新路径**：SkyCore 构造（预设大气/云/太阳角）→ displaySky 挂 envGroup →
 *    displaySky 显示强度 = 预设 displayIntensity（display-only 单侧一次写入，T018.5）→
 *    PmremEnvironment 构造 → 初烘 bake → environmentIntensity = 预设值；
 *  - **事务式 fallback**：任一步抛错（Sky 构造 / PMREM 构造或初烘）→ 清理已建部分
 *    （消费者先撤：pmrem 先于 sky 释放，与 Renderer.clearEnvironment 同序）→ **完整
 *    legacy 路径**（createSkyTexture 渐变 scene.background + HemisphereLight +
 *    scene.environment 置 null）+ console.error 记档原因（不静默降级）；
 *  - **单一开关不变式**（单测锁定）：状态二选一无混合态——新路径成功 ⇔ { displaySky
 *    存在 · scene.environment 非空 · 无 Hemi · background null }；fallback ⇔ { 无 sky ·
 *    environment null · Hemi 存在 · background 渐变 }。「真天空但无 IBL」禁止出现；
 *  - **每次调用重新尝试新路径**：失败是环境性的（WebGL 上下文异常等），裁定纯粹基于
 *    本次调用、无粘死状态——恢复机会留给下次 applyEnvironment / 预设切换；
 *  - **运行中重烘失败 ≠ 初烘失败**：SkyCore 三写入口的重烘回调在本单元内 catch——
 *    抛错不传播到写入口调用方（DEV 面/后续消费路径），旧 environment 天然保持
 *    （PmremEnvironment 事务基础：bake 失败赋值不发生），console.error 记档不降级。
 *
 * 可注入面（node 无 WebGL 的确定性测试口径，沿 LazyPmremBackend 工厂先例）：
 *  - createSky：Sky 构造失败注入；
 *  - createPmrem：PMREM 构造失败 / 初烘失败（backend bake 抛错）注入；
 *  - rebakeScheduler：重烘 debounce 调度器（T018.4——生产缺省 TIMER_REBAKE_SCHEDULER，
 *    node 单测注入同步调度器保持「写入口变更后恰一次重烘」同步口径）。
 * 生产工厂见 defaultSkyCoreFactory / createRendererPmremFactory（Renderer 唯一调用方）。
 *
 * 边界：地面/网格/太阳直射光不归本单元（Renderer.applyEnvironment 共用段——两分支
 * 仅太阳方向源不同）；PMREM 事务核心语义归 pmremEnvironment（018.2 锁定，本单元只在其
 * 上包 fallback 决策）；PMREM 严禁进帧路径不变（触发清单 = applyEnvironment 初烘 +
 * 三写入口 **debounced** 重烘（T018.4 包层，D29 Q6）+ setIblIntensity 借道 + rebake()
 * 强制，本单元零帧路径触发源）。
 */
import * as THREE from 'three';
import { SkyCore } from './skyCore';
import type { SkyAtmosphereParams, SunAngles } from './skyCore';
import { DEFAULT_ENVIRONMENT_INTENSITY, LazyPmremBackend, PmremEnvironment } from './pmremEnvironment';
import { skyAtmosphereOfPreset } from './environmentPresets';
import type { EnvironmentPreset } from './environmentPresets';
import { SkyRebake, TIMER_REBAKE_SCHEDULER } from './skyRebake';
import type { RebakeScheduler, SkyRebakePort } from './skyRebake';

/** Sky 构造工厂（注入面：生产 = defaultSkyCoreFactory；测试注入抛错锁定 fallback 路径） */
export type SkyCoreFactory = (
  atmosphere: SkyAtmosphereParams,
  sun: SunAngles,
  onParamsChanged?: () => void,
) => SkyCore;

/** 生产 Sky 构造工厂（直配真实 SkyCore——displaySky/bakeSky 双实例契约见 skyCore） */
export const defaultSkyCoreFactory: SkyCoreFactory = (atmosphere, sun, onParamsChanged) =>
  new SkyCore(atmosphere, sun, onParamsChanged);

/** PMREM 构造工厂（注入面：scene/bakeScene 由调用方锁定，backend 归工厂侧） */
export type PmremFactory = (scene: THREE.Scene, bakeScene: THREE.Scene) => PmremEnvironment;

/**
 * 生产 PMREM 构造工厂：backend = LazyPmremBackend(() => new THREE.PMREMGenerator(renderer))
 * （惰性构造——未烘焙会话零构造；renderer 经闭包注入，本模块不持有其引用）。
 */
export function createRendererPmremFactory(renderer: THREE.WebGLRenderer): PmremFactory {
  return (scene, bakeScene) =>
    new PmremEnvironment({
      scene,
      bakeScene,
      backend: new LazyPmremBackend(() => new THREE.PMREMGenerator(renderer)),
    });
}

/** 构建依赖（scene/envGroup 由 Renderer 持有；preset 为统一预设面查表结果） */
export interface SkyEnvironmentDeps {
  /** 主场景（scene.environment / background 挂接目标） */
  scene: THREE.Scene;
  /** 环境对象组（displaySky / legacy Hemi 的挂载父节点，Renderer 环境链所有） */
  envGroup: THREE.Group;
  preset: EnvironmentPreset;
  createSky: SkyCoreFactory;
  createPmrem: PmremFactory;
  /**
   * 重烘 debounce 调度器（T018.4 注入面）：生产缺省 TIMER_REBAKE_SCHEDULER
   * （setTimeout/clearTimeout）；node 单测注入同步/手动调度器获得确定性口径——
   * 同步调度器下「写入口变更后恰一次重烘」与既有断言语义逐位一致。
   */
  rebakeScheduler?: RebakeScheduler;
}

/**
 * 构建结果（单一开关的判别联合）：sky 模式返回双句柄 + **重烘 debounce 句柄**
 * （T018.4——Renderer 记入 this.sky/this.pmrem/this.skyRebake，clearEnvironment
 * cancel pending 后随释放链清理）；legacy 模式返回 Hemi 引用供 Renderer 灯光层例外
 * （layers.enableAll——内容遍相机掩码仍需收集灯光）。
 */
export type SkyEnvironmentOutcome =
  | { mode: 'sky'; sky: SkyCore; pmrem: PmremEnvironment; rebake: SkyRebakePort }
  | { mode: 'legacy'; reason: string; hemi: THREE.HemisphereLight };

/**
 * 环境天空段事务式构建（契约见模块头注）。幂等前提：调用方先 clearEnvironment 清空
 * 旧环境（Renderer.applyEnvironment 序）；本函数自身不做清理回滚（事务只管本次新建部分）。
 */
export function setupSkyEnvironment(deps: SkyEnvironmentDeps): SkyEnvironmentOutcome {
  const { scene, envGroup, preset, createSky, createPmrem } = deps;
  let sky: SkyCore | null = null;
  let pmrem: PmremEnvironment | null = null;
  try {
    // 运行中重烘回调（D29.5）：三写入口变更 → 恰一次重烘；catch 不传播到写入口调用方，
    // 失败保留旧环境（bake 失败赋值不发生的天然事务性）+ 记档——与初烘失败走 fallback
    // 的语义分界即在此闭包内。
    // T018.4（D29 Q6）：闭包经 SkyRebake debounce 后才作为 onParamsChanged 传入——
    // 「回调上游包层」（skyCore 注已预留），SkyCore 零感知；**catch 语义保持在
    // debounce 触发体内**（timer/flush 触发时执行的就是本 try/catch——连续写入口
    // 合并为停手后恰一次重烘）。调度器注入面沿 LazyPmremBackend 工厂先例。
    const rebake = new SkyRebake(
      (): void => {
        try {
          pmrem?.bake();
        } catch (err) {
          console.error('[Renderer] Sky 参数重烘 PMREM 失败：保留上一份环境（不降级不闪断）', err);
        }
      },
      deps.rebakeScheduler ?? TIMER_REBAKE_SCHEDULER,
    );
    sky = createSky(
      skyAtmosphereOfPreset(preset),
      { elevationDeg: preset.sun.elevationDeg, azimuthDeg: preset.sun.azimuthDeg },
      () => rebake.trigger(),
    );
    envGroup.add(sky.displaySky);
    // 显示域压缩预设接线（T018.5 终调）：构建期一次写入 displaySky 单侧显示强度——
    // display-only 不触发重烘、不影响 bakeSky/PMREM（bakeSky 无此 uniform）；此后 DEV
    // 面 setDisplayIntensity 可会话态覆盖（不持久，下次 applyEnvironment 回表值）。
    sky.setDisplayIntensity(preset.displayIntensity);
    pmrem = createPmrem(scene, sky.bakeScene);
    pmrem.bake(); // 初烘（失败 → 下方事务降级，与运行中重烘失败语义分界；不经 debounce）
    // IBL 强度预设差异化（D29.13）：预设切换伴随 environment 纹理替换（每次 bake 新 RT），
    // 材质刷新自然吃到新强度——纯直写不触发刷新的已知行为仅影响无换图的 DEV 调参（018.4）
    scene.environmentIntensity = preset.iblIntensity;
    return { mode: 'sky', sky, pmrem, rebake };
  } catch (err) {
    console.error('[Renderer] Sky/PMREM 环境初始化失败：事务降级 legacy 环境（渐变背景 + HemisphereLight）', err);
    // 事务清理（消费者先撤，clearEnvironment 同序）：已建的 pmrem/sky 逐级释放——sky.dispose
    // 自带 displaySky 摘离父节点；pmrem.dispose 兜底摘除可能已挂接的 environment（初烘失败
    // 时本为 null，显式防御未来 pmrem 构造器行为变化）
    pmrem?.dispose();
    sky?.dispose();
    scene.environment = null;
    scene.environmentIntensity = DEFAULT_ENVIRONMENT_INTENSITY; // 无 env 时该值无效应，复位确定性
    // 完整 legacy 路径：渐变背景 + Hemi（正常路径零 HemisphereLight，D29.4——仅此分支存在）
    const hemi = new THREE.HemisphereLight(preset.ambientSky, preset.ambientGround, preset.ambientIntensity);
    envGroup.add(hemi);
    scene.background = createSkyTexture(preset.skyTop, preset.skyBottom);
    return { mode: 'legacy', reason: err instanceof Error ? err.message : String(err), hemi };
  }
}

/**
 * 天空渐变纹理（上下双色线性渐变；无 DOM 环境回退顶部色）。
 * **legacy fallback 素材**（T018.1 起渐变天空退出正常路径，T018.3 起由本模块 fallback
 * 分支消费；导出为 node 可测）。太阳/地面观感与正常路径差异为已知降级语义——fallback
 * 目标是可用性保底（无 WebGL 依赖的背景），非视觉等价。
 */
export function createSkyTexture(topColor: string, bottomColor: string): THREE.Texture | THREE.Color {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Color(topColor);
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  } catch {
    return new THREE.Color(topColor);
  }
}
