/**
 * runtime/environment/pmremEnvironment —— PMREM / IBL 环境贴图管线（T018.2，D29.12/13）。
 *
 * 职责：`SkyCore.bakeScene → PMREMGenerator.fromScene → scene.environment` 的全链
 * 事务管理——全仓 MeshStandardMaterial 资产（三树叶皮/路灯/Ground/GLB）零材质改动
 * 自动获得环境光照与反射（envMap/PMREM 此前全仓零使用，材质无感知接入）。
 *  - 烘焙对象**只能是 bakeScene**（只含 bakeSky 的独立场景，D29.12 职责分离——
 *    主 Scene 直烘会把业务对象/地面/网格烘进环境贴图），构造期显式拒绝同引用；
 *  - 事务提交：新 RT 就绪 → `scene.environment` 替换 → 旧 RT dispose——失败时
 *    （fromScene 抛错）赋值不发生、上一份成功环境保持（天然事务性）；
 *  - 自维护 counter（owned/retired 记账，epic 验收第 4 条确定性依据——
 *    renderer.info 字段跨版本口径差异仅辅助）；
 *  - 触发清单锁定：**仅环境状态变化**（applyEnvironment 初烘 + SkyCore 三写入口
 *    回调重烘）；相机移动/模型变化/LOD 切换/渲染循环帧路径零 PMREM 调用
 *    （结构断言锁定，PMREM 严禁进每帧路径）。
 *
 * 失败语义（T018.2）：本子任务不做 fallback 分支——bake 抛错即传播，不吞不降级
 * （018.3 事务式单一开关 + 运行中失败保留旧环境）。
 *
 * fromScene 虚拟相机参数锁定依据（three 0.186.0 源码
 * node_modules/three/src/extras/PMREMGenerator.js）：
 *  - `fromScene(scene, sigma=0, near=0.1, far=100)`（:107）——缺省 far=100；
 *  - `_sceneToCubeUV` 内 `new PerspectiveCamera(90, 1, near, far)`（:336），相机
 *    位于 options.position 缺省原点（:46 `_origin`）；
 *  - bakeSky 为 SKY_BOX_SCALE=9000 的 BoxGeometry(1,1,1) 网格且恒在原点（不跟随
 *    相机）——虚拟相机到内壁面距 4500、到盒角 √3/2×9000 ≈ 7794.22。**缺省
 *    far=100 < 4500 会把 bakeSky 整盒远裁剪掉**（空环境贴图）。锁定 near=1 /
 *    far=10000：near 只需 < 4500（取主相机同值 1，Renderer.ts 相机 1/10000 同一
 *    量级约定）；far > 7794.22 且与主相机 far / SKY_BOX_SCALE 注释口径一致
 *    （≈22% 余量容纳后续 scale 微调）。
 *  - sigma=0 起步记档：Preetham 天空本身连续平滑，PMREM GGX 预过滤已按 roughness
 *    分档模糊；sigma>0 会额外做两级球面高斯（PMREMGenerator._blur）压高频，对
 *    本天空收益微小徒增两 pass——018.5 视觉验收若见烘焙噪点再评估启用。
 *
 * PMREMGenerator 生命周期：惰性构造（首次 bake 时经工厂创建，挂 Renderer 环境
 * 链——applyEnvironment 建 / clearEnvironment 释，Renderer.dispose 经 clearEnvironment
 * 自然覆盖）；r186 其内部材质/pingPong RT/lodMeshes 均实例自有（源码 dispose 注释
 * "static class" 为历史残留口径）——StrictMode 双挂载两 Renderer 各自持有互不串扰。
 */
import * as THREE from 'three';

/** 烘焙模糊半径（弧度）：0 起步记档（依据见模块头注；018.5 视需要再评估） */
export const PMREM_BAKE_SIGMA = 0;
/** 虚拟立方体相机 near：须 < 天空盒半边 4500；取主相机同值 1（同一量级约定） */
export const PMREM_BAKE_NEAR = 1;
/** 虚拟立方体相机 far：须 > 天空盒对角 √3/2×9000≈7794.22（缺省 100 会整盒裁掉）；取主相机 far 同值 */
export const PMREM_BAKE_FAR = 10000;
/**
 * `scene.environmentIntensity` legacy 复位初值（IBL 侧旋钮，three r163+ 内建；D29.13）：
 * 1.0 = PMREM 辐照原值直通。正常路径的预设差异化强度在 environmentPresets 的
 * iblIntensity（T018.3 收口）；本常量仅作 legacy fallback 分支复位值（无 env 时该
 * 旋钮无效应，复位只为确定性）。
 */
export const DEFAULT_ENVIRONMENT_INTENSITY = 1;

/**
 * PMREMGenerator 最小消费面（fromScene/dispose）：接口化仅为可注入 mock（node 无
 * WebGL 的确定性测试口径）；参数形沿 @types/three 0.185.4 签名（可选参），使
 * `new THREE.PMREMGenerator(renderer)` 结构兼容直配。
 */
export interface PmremGeneratorLike {
  fromScene(
    scene: THREE.Scene,
    sigma?: number,
    near?: number,
    far?: number,
    options?: { size?: number; position?: THREE.Vector3 },
  ): THREE.WebGLRenderTarget;
  dispose(): void;
}

/** PMREM 后端：fromScene 事务的实际执行者（生产 = PMREMGenerator 惰性包装；测试 = mock） */
export interface PmremBackend {
  /** 执行一次烘焙（实参由 PmremEnvironment 以锁定常量传入） */
  bake(bakeScene: THREE.Scene, sigma: number, near: number, far: number): THREE.WebGLRenderTarget;
  /** 释放后端自有资源（生产 = PMREMGenerator.dispose）；幂等 */
  dispose(): void;
}

/**
 * 惰性 PMREM 后端（生产实现）：generator 首次 bake 才构造（未烘焙会话零构造零
 * 开销），此后同一实例复用；dispose 释放并复位。工厂注入 renderer 闭包——本类
 * 不直接持有 renderer 引用（node 测试注入 mock 工厂无需 WebGLRenderer 实体）。
 */
export class LazyPmremBackend implements PmremBackend {
  private generator: PmremGeneratorLike | null = null;

  constructor(private readonly createGenerator: () => PmremGeneratorLike) {}

  /** generator 是否已构造（惰性构造状态只读——测试/诊断口径） */
  get generatorConstructed(): boolean {
    return this.generator !== null;
  }

  bake(bakeScene: THREE.Scene, sigma: number, near: number, far: number): THREE.WebGLRenderTarget {
    this.generator ??= this.createGenerator();
    return this.generator.fromScene(bakeScene, sigma, near, far);
  }

  dispose(): void {
    this.generator?.dispose();
    this.generator = null;
  }
}

/** 自维护 counter 口径（epic T018 验收第 4 条确定性依据；renderer.info 仅辅助） */
export interface PmremStats {
  /** 成功 bake 并接管的 RT 总数（fromScene 返回即 +1） */
  baked: number;
  /** 经事务替换或 dispose 释放的 RT 总数 */
  retired: number;
  /** 当前持有 RT 数 = baked - retired（稳态 1 = 当前 scene.environment 那张；dispose 后 0） */
  owned: number;
  /** scene.environment 是否挂接本实例当前 RT（1/0）——外部改写 environment 即 0 */
  live: 0 | 1;
}

/** PmremEnvironment 构造依赖 */
export interface PmremEnvironmentOptions {
  /** 主场景（scene.environment 挂接目标） */
  scene: THREE.Scene;
  /** PMREM 烘焙专用场景（SkyCore.bakeScene——只含 bakeSky；禁止主 Scene，D29.12） */
  bakeScene: THREE.Scene;
  /** PMREM 后端（生产 = LazyPmremBackend(() => new THREE.PMREMGenerator(renderer))；测试注入 mock） */
  backend: PmremBackend;
}

/**
 * PMREM / IBL 环境贴图事务管理器（契约见模块头注）。生命周期跟随 Renderer 环境
 * 链：applyEnvironment 创建并初烘一次、SkyCore 写入口回调重烘、clearEnvironment
 * dispose（RT + 后端 generator + scene.environment 摘除）——幂等。
 */
export class PmremEnvironment {
  private currentRT: THREE.WebGLRenderTarget | null = null;
  private bakedCount = 0;
  private retiredCount = 0;
  private disposed = false;

  constructor(private readonly options: PmremEnvironmentOptions) {
    // 职责分离防线（D29.12）：烘焙场景必须是独立 bakeScene——主 Scene 直烘会把
    // 业务对象/地面/网格烘进环境贴图；构造期显式拒绝（早失败优于静默错烘）
    if (options.bakeScene === options.scene) {
      throw new Error(
        'PmremEnvironment: bakeScene 不得为主 Scene（职责分离，D29.12/T018.2）——须传入 SkyCore.bakeScene',
      );
    }
  }

  /** counter 只读快照（测试可读口径见 PmremStats） */
  get stats(): PmremStats {
    return {
      baked: this.bakedCount,
      retired: this.retiredCount,
      owned: this.bakedCount - this.retiredCount,
      live: this.currentRT !== null && this.options.scene.environment === this.currentRT.texture ? 1 : 0,
    };
  }

  /** 当前持有的 PMREM RT（scene.environment 挂接的那张；未烘/disposed 后为 null） */
  get ownedRenderTarget(): THREE.WebGLRenderTarget | null {
    return this.currentRT;
  }

  /**
   * 事务烘焙一次：fromScene(bakeScene, 锁定常量) → 替换 scene.environment → 旧 RT 释放。
   * 失败语义（T018.2）：fromScene 抛错即传播（不吞不降级，fallback 归 018.3）——
   * 抛错时下方赋值全不发生，scene.environment 保持上一份成功环境（天然事务性）。
   * 触发面：applyEnvironment 初烘 + SkyCore 三写入口回调；**严禁接入帧路径**。
   */
  bake(): void {
    if (this.disposed) return;
    const next = this.options.backend.bake(this.options.bakeScene, PMREM_BAKE_SIGMA, PMREM_BAKE_NEAR, PMREM_BAKE_FAR);
    const previous = this.currentRT;
    this.currentRT = next;
    this.bakedCount += 1;
    // 先替换后释放旧 RT：保证 scene.environment 任意时刻都指向有效纹理（不留空窗）
    this.options.scene.environment = next.texture;
    if (previous !== null) {
      previous.dispose();
      this.retiredCount += 1;
    }
  }

  /**
   * 全量释放（Renderer.clearEnvironment 调用；幂等）：owned RT + 后端 generator +
   * scene.environment 摘除。environment 已被外部改写时不误清（只摘本链挂接的
   * 纹理——防误伤未来手动环境面）；dispose 后 bake 短路（不复活）。
   */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    const rt = this.currentRT;
    this.currentRT = null;
    if (rt !== null) {
      if (this.options.scene.environment === rt.texture) {
        this.options.scene.environment = null;
      }
      rt.dispose();
      this.retiredCount += 1;
    }
    this.options.backend.dispose();
  }
}
