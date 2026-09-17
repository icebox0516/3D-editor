/**
 * runtime/services/TimeUniformService —— 全局 uTime 时钟与广播（D19.7 / D12 最小版拉前）。
 *
 * 职责：渲染循环的单一时间源——advance(now) 以单调时钟时间戳（Renderer 传
 *      performance.now()）累计 elapsed（秒）；apply(root) 遍历场景树，对每个材质
 *      （含数组）检查 uniforms 是否声明 uTime，声明则写入 elapsed。每帧一次、每
 *      材质一次；不做局部时钟、不做 JS 逐实例 tick（uTime 管「全局风刮到哪一帧」，
 *      aSeed 管「每棵树怎么各吹各的」——D19.7 分工语义）。
 * 边界：不声明 uTime 的材质零开销（一次 uniforms 属性存在性检查）；共享材质重复
 *      命中写同值幂等无害（刻意不用 Set 去重——省一次分配与查表，正确性等价）；
 *      随 Renderer 会话创建/销毁（普通字段，无模块级单例——StrictMode 双挂载安全，
 *      沿 D17.4 惯例）；只扫被喂入的 root（minimap/axesIndicator 独立小场景不喂）；
 *      无 GPU 资源，无需 dispose。
 */
import * as THREE from 'three';

/** 材质 uniforms 的最小结构面（ShaderMaterial 形态；标准材质无 uniforms 属性自然跳过） */
type MaterialWithUniforms = THREE.Material & {
  uniforms?: Record<string, { value: unknown }>;
};

export class TimeUniformService {
  /** 上一帧时间戳（null = 尚未启动；单调保护基准） */
  private last: number | null = null;
  /** 累计时长（秒） */
  private seconds = 0;
  /** 冻结态（008.3 锚点取证：冻结风相位保证固定机位截图可比） */
  private frozen = false;

  /** 帧推进：now = 单调时钟时间戳；首帧建立基准（elapsed 0），随后按增量累计；
   *  时间戳回退/持平（异常输入或同帧重复）忽略——时钟不倒走 */
  advance(now: number): number {
    if (this.frozen) return this.seconds; // 冻结：忽略时间戳，时钟停走（不倒走语义不变）
    if (this.last === null) {
      this.last = now;
    } else if (now > this.last) {
      this.seconds += (now - this.last) / 1000;
      this.last = now;
    }
    return this.seconds;
  }

  /** 冻结时钟（advance 停走、elapsed 保持；幂等）——DEV 取证/调试用 */
  freeze(): void {
    this.frozen = true;
  }

  /** 解冻时钟（恢复按时间戳累计；幂等）——不回补冻结期间的时长 */
  unfreeze(): void {
    this.frozen = false;
  }

  /** 当前累计时长（秒；未启动为 0） */
  get elapsed(): number {
    return this.seconds;
  }

  /** 广播：遍历 root，材质 uniforms 声明 uTime 即写入 elapsed（未声明零触碰） */
  apply(root: THREE.Object3D): void {
    const seconds = this.seconds;
    root.traverse((node) => {
      const material = (node as THREE.Mesh).material;
      if (material === undefined || material === null) return;
      if (Array.isArray(material)) {
        for (const item of material) this.applyToMaterial(item, seconds);
      } else {
        this.applyToMaterial(material, seconds);
      }
    });
  }

  /** 帧入口（Renderer.renderFrame 在 controls.update 后、render 前调用）：累计 + 广播 */
  frame(now: number, root: THREE.Object3D): void {
    this.advance(now);
    this.apply(root);
  }

  private applyToMaterial(material: THREE.Material, seconds: number): void {
    const uniforms = (material as MaterialWithUniforms).uniforms;
    if (uniforms === undefined) return;
    const uTime = uniforms.uTime;
    if (uTime !== undefined) uTime.value = seconds;
  }
}
