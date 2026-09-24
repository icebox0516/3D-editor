/**
 * runtime/instancing/fadeGeometry —— aFadeOut 逐实例 fade 属性缝（T021.3，D41 §5.3）。
 *
 * ── 属性缝契约（park-shader-agent 消费面，精确记档）──────────────────────────
 *  - 名称：`aFadeOut`（InstancedBufferAttribute，挂 InstancedMesh 的 geometry——
 *    three 自定义逐实例属性只有 geometry 通道，与 aSeed 同物理边界）；
 *  - 类型：Float32Array、itemSize 1、**非 normalized**（显式 [0,1] 浮点，逐位写出
 *    无量化；DynamicDrawUsage）；
 *  - 语义：**该实例当前表示的退场度**——0 = 完整呈现，1 = 完全退场；双表示共存期
 *    outgoing 侧 = 过渡进度、incoming 侧 = 1 − 过渡进度（两侧互补，和恒 1）；
 *  - 缺省安全设计（与 aSeed 的 GL 缺省 0 先例 D41 §6.3 同构但方向相反）：材质消费
 *    `aFadeOut` 而几何**缺该属性时 GL 缺省 0 = 完整呈现**——散布链缺属性、硬切位
 *    不写、任何未接线的消费方都不会静默全灭（若语义取「呈现度 1=完整」，GL 缺省
 *    0 会静默全灭——021.3 派遣简报点名的禁态，故取退场度语义）；
 *  - 写出纪律：值变化才写 + needsUpdate 置位（稳态 0 零写零缓冲）；硬切位不建
 *    缓冲（无消费者不写占位数据）；成员增删 / 全量重写路径随槽位同步重写（值缓存
 *    于各链的粒度单元上）。
 *
 * ── 为什么是包装几何而非直挂共享源几何────────────────────────────────────
 *  three 的自定义逐实例属性只能 geometry 绑定，而散布链同 (assetId × representation)
 *  源几何被**多个块桶 / 合并桶共享**——直挂共享几何则各桶实例槽位（0..count）互相
 *  冲突（不同块可同时处于不同过渡进度，需要不同值）；放置链同理：池桶几何经
 *  ProceduralSourceCache 与散布链共享（默认槽），池容量 ≠ 散布桶容量，越界读。
 *  解法 = 包装 BufferGeometry：**共享全部顶点属性对象与索引的引用**（零顶点数据
 *  复制——§10.3「同 sourceKey 不重复 Geometry」按数据面遵守），独占 aFadeOut 实例
 *  缓冲。包装几何由 FadeGeometryPool 池化复用（按源几何的 position 属性对象键），
 *  桶拆除时归还而非 dispose（dispose 会连带释放共享顶点缓冲，触发全使用方重上传）；
 *  会话结束随 GL 上下文消亡（不显式释放，池 clear 即可）。
 *
 * 边界：本模块只做几何包装与缓冲池；值写出节奏 / 槽位路由归两链。零业务语义。
 */
import * as THREE from 'three';

/** fade 属性名（材质声明此 attribute 即消费；three 对未声明材质自动忽略） */
export const FADE_ATTRIBUTE = 'aFadeOut';

/**
 * 包装几何池（每渲染链私有一个实例——绝不模块级单例，D17）：acquire 取或建共享
 * 顶点属性的包装几何，release 归还复用。并发过渡桶数有界（过渡带内的桶），
 * 池峰值内存有界；acquire 时容量不足则重建 fade 缓冲（调用方随后全量重写）。
 */
export class FadeGeometryPool {
  /** 源几何 position 属性对象 → 空闲包装几何列表（属性对象身份 = 源几何身份代理） */
  private readonly idle = new Map<THREE.BufferAttribute, THREE.BufferGeometry[]>();

  /**
   * 取或建包装几何：共享源几何全部顶点属性 / 索引 / 包围盒球引用 + 独占 aFadeOut
   * 实例缓冲（capacity 项，缺省 0 = 完整呈现）。复用路径容量不足时原地换新缓冲。
   */
  acquire(source: THREE.BufferGeometry, capacity: number): THREE.BufferGeometry {
    const key = source.attributes.position as THREE.BufferAttribute | undefined;
    const pooled = key ? this.idle.get(key)?.pop() : undefined;
    if (pooled) {
      this.alignCapacity(pooled, capacity);
      return pooled;
    }
    const wrapper = new THREE.BufferGeometry();
    for (const name of Object.keys(source.attributes)) {
      wrapper.setAttribute(name, source.attributes[name]!);
    }
    wrapper.setIndex(source.index);
    // 包围引用共享（computeBoundingSphere/Box 在包装上零重复计算；源侧惰性计算
    // 先行保证——两链建桶路径均先算包围）
    if (source.boundingBox) wrapper.boundingBox = source.boundingBox;
    if (source.boundingSphere) wrapper.boundingSphere = source.boundingSphere;
    const buffer = new THREE.InstancedBufferAttribute(new Float32Array(capacity), 1);
    buffer.setUsage(THREE.DynamicDrawUsage);
    wrapper.setAttribute(FADE_ATTRIBUTE, buffer);
    return wrapper;
  }

  /** 桶拆除时归还（幂等安全；不 dispose——共享顶点缓冲归源端释放） */
  release(wrapper: THREE.BufferGeometry): void {
    const key = wrapper.attributes.position as THREE.BufferAttribute | undefined;
    if (!key) return;
    let list = this.idle.get(key);
    if (!list) {
      list = [];
      this.idle.set(key, list);
    }
    list.push(wrapper);
  }

  /** 会话结束清空（GL 缓冲随上下文消亡；不触发 dispose 事件） */
  clear(): void {
    this.idle.clear();
  }

  /** 容量对齐（不足换新缓冲填 0；足则原样——值由调用方随后全量重写） */
  private alignCapacity(wrapper: THREE.BufferGeometry, capacity: number): void {
    const existing = wrapper.getAttribute(FADE_ATTRIBUTE) as
      | THREE.InstancedBufferAttribute
      | undefined;
    if (existing && existing.isInstancedBufferAttribute && existing.count >= capacity) return;
    const buffer = new THREE.InstancedBufferAttribute(new Float32Array(capacity), 1);
    buffer.setUsage(THREE.DynamicDrawUsage);
    wrapper.setAttribute(FADE_ATTRIBUTE, buffer);
  }
}

/**
 * 网格的 fade 缓冲就位（不建包装则返回 null）：geometry 已带 aFadeOut（此前过渡过）
 * → 原缓冲返回；否则经池取包装几何换装并返回新缓冲。capacity 由调用方按桶容量给。
 * 调用方随后按槽位写值并置 needsUpdate。
 */
export function ensureFadeBuffer(
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>,
  sourceGeometry: THREE.BufferGeometry,
  pool: FadeGeometryPool,
  capacity: number,
): THREE.InstancedBufferAttribute {
  const existing = mesh.geometry.getAttribute(FADE_ATTRIBUTE) as
    | THREE.InstancedBufferAttribute
    | undefined;
  if (existing && existing.isInstancedBufferAttribute && existing.count >= capacity) {
    return existing;
  }
  if (existing && existing.isInstancedBufferAttribute) {
    // 已包装但容量不足：原地扩（新缓冲填 0，调用方随后全量重写）
    const grown = new THREE.InstancedBufferAttribute(new Float32Array(capacity), 1);
    grown.setUsage(THREE.DynamicDrawUsage);
    mesh.geometry.setAttribute(FADE_ATTRIBUTE, grown);
    return grown;
  }
  const wrapper = pool.acquire(sourceGeometry, capacity);
  mesh.geometry = wrapper;
  return wrapper.getAttribute(FADE_ATTRIBUTE) as THREE.InstancedBufferAttribute;
}

/** 网格是否已带 fade 缓冲（懒建判据——无过渡的桶零开销） */
export function hasFadeBuffer(
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>,
): boolean {
  const attr = mesh.geometry.getAttribute(FADE_ATTRIBUTE);
  return attr !== undefined && (attr as THREE.InstancedBufferAttribute).isInstancedBufferAttribute === true;
}

/**
 * 桶级区间写出（散布链主用：[offset, offset+count) 槽位统一退场度——chunk × asset
 * 粒度过渡态的桶内均匀值；合并桶按成员区间分写）。capacity 由调用方按桶容量给
 * （InstancedMesh → instanceMatrix.count）。
 */
export function writeFadeRange(
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>,
  sourceGeometry: THREE.BufferGeometry,
  pool: FadeGeometryPool,
  offset: number,
  count: number,
  fadeOut: number,
  capacity: number,
): void {
  if (count <= 0 || capacity <= 0) return;
  const buffer = ensureFadeBuffer(mesh, sourceGeometry, pool, capacity);
  const array = buffer.array as Float32Array;
  for (let i = offset; i < Math.min(offset + count, capacity); i++) array[i] = fadeOut;
  buffer.needsUpdate = true;
}
