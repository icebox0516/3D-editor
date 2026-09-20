/**
 * runtime/instancing/InstancedAssetPool —— 重复资产实例化渲染池（T2.3）。
 *
 * 职责（需求 §非功能需求·性能「实例化渲染下沉到 AssetRuntime 层，业务层无感知」）：
 *  1. 每池键一个池（T008.1 起键 = sourceKey，缺省 assetId）：业务层仍逐个
 *     ModelObject 调 attach，池内检测同池键 ≥2 实例时切换 InstancedMesh 路径
 *     （同池键全部实例共用一份 geometry/material，一个 Draw Call）；单实例退化
 *     普通 Mesh（带 seed 池例外，见 reconcile 注记）。
 *  2. 成员变化只重建矩阵缓冲（扩容换 InstancedBufferAttribute，Mesh 对象引用稳定）；
 *     单实例 transform 更新只写对应矩阵槽（setMatrixAt ×1，拖拽帧增量）。
 *  3. attach 返回「锚点」：脱离渲染树的 Object3D（供 Renderer 挂 RuntimeObjectMap /
 *     包围盒取景），源就绪后挂共享 Mesh 子节点——不在场景内、不参与渲染与拾取，
 *     故「同资产 500 实例 → 场景渲染对象数为 1 个 InstancedMesh 而非 500 Group」。
 *  4. resolvePick：InstancedMesh 射线命中携带 instanceId → 反查业务 id
 *     （实例化路径没有逐对象根，拾取经渲染对象 → 槽位 → id）。
 *
 * 边界：只读 ModelObject 数据（Scene 唯一数据源，反向修改禁止）；
 *      geometry/material 来自注入的 InstanceSourceProvider（Renderer 接复合源路由
 *      AssetSourceRouter——GLB 与程序化同通道，T002.3；测试接 fake 工厂），池只
 *      挂载/移除、不 dispose 共享模板资源（源端统一释放）；选中高亮与 Ghost 预览
 *      不走本池（PreviewManager 独立路径）；userData 不写业务数据（锚点 id 映射
 *      由 RuntimeObjectMap.set 负责）；池创建的渲染网格统一投影/接收阴影
 *      （castShadow/receiveShadow = true——singleMesh / instancedMesh / 诊断亮网格
 *      三个创建点；源带 customDepthMaterial 时同三点挂影 pass 深度材质，T009.5——
 *      归源所有，池只挂引用不 dispose；锚点补挂 Mesh 不设两者：不进场景仅包围盒）。
 * 实例颜色（T002.3 烘焙式变体色相微差）：源无关颜色槽——setColor(id, color) /
 *      clearColor(id) 只登记「id + 颜色」，池不读 meta/seed（变体采样在调用方）。
 *      InstancedMesh 路径任意实例有色时建 instanceColor 逐槽写（未设色实例白 1,1,1
 *      恒等乘子；着色器内 diffuse × instanceColor 逐分量乘算，不克隆材质破合批）；
 *      无任何颜色的池零开销（不建缓冲，GLB 资产行为零变化）。扩容换 instanceMatrix
 *      缓冲时 instanceColor 同容量重建（three setColorAt 惰性建缓冲按 instanceMatrix.count
 *      定尺寸，缓冲小于槽位数时写越界静默丢失——池自管缓冲对齐）。成员增删
 *      （writeAllSlots）与诊断分组两网格（PoolSplit 主网格 + highlightMesh）颜色随
 *      槽位同步重写。单实例退化 Mesh 路径不带色：共享材质不可染、克隆材质破合批——
 *      文档化边界：hue 微差自同资产第 2 个实例起可见（验收口径 = 连放 20）。
 * 池键分桶（T008.1，D19.4）：池键自 assetId 升级为 sourceKey——池无法自行算槽
 *      （需 meta），经 resolvePoolKey 依赖注入（Renderer 注入 = 查注册表 meta +
 *      domain sourceKeyOf，与源缓存同一真相源；缺省恒 assetId = 行为回退现状）。
 *      同 assetId 不同槽（重掷 seed 换形态）= 不同桶 = 跨池迁移（attach 按池键判定）。
 * aSeed 逐实例属性（T008.1，D19.7）：entry 存 obj.asset.seed（可 null），桶内存在
 *      带 seed 的 entry 时在桶几何上建 aSeed Float32 InstancedBufferAttribute
 *      （itemSize 1），逐槽写「种子哈希折算 [0,1)」（domain aSeedValueOf，'aseed'
 *      域与槽路由/对象表现隔离；同 seed 同值逐位确定；seed 缺失槽写 0.5 域中点
 *      中性值）。缓冲生命周期完全对齐 instanceColor 惯例：惰性建、按
 *      instanceMatrix 容量对齐重建（旧值保留）、writeAllSlots 全量重写、单槽随
 *      setColor 路径同步写。无任何 seed 的池零开销（不建缓冲）；材质未声明
 *      aSeed attribute 时 three 自动忽略（GLB/旧资产行为零变化）。物理边界：
 *      three 仅 instanceMatrix/instanceColor 为对象级实例属性，自定义 aSeed 必须
 *      geometry 绑定——同 sourceKey 只有一个桶，桶间不串扰；aSeed 仅 InstancedMesh
 *      逐实例消费——非实例绘制（Ghost/锚点装饰共享同几何与材质，T008.3 起夏栎
 *      皮/叶材质声明 aSeed）读缓冲首元素（缓冲未建时读 GL 缺省 0）：确定性相位、
 *      无未定义行为；诊断分组 split 两网格共享同几何的同一
 *      aSeed 缓冲（islands 分遍用 override 材质不消费 aSeed，split 期间值惰性，
 *      拆除后 writeAllSlots 按 entries 序全量重写恢复）。资源归属：aSeed 缓冲挂
 *      共享几何上，随几何由源端（缓存/loader）dispose 统一释放，池不 dispose
 *      （与「池不 dispose 共享模板资源」边界一致）。
 * source × level 分桶（T006.3，D27.4/D27.6）：池键 = `${sourceKey}::${level}`——档位是
 *      池桶维度（绝不掺入 sourceKey 形态身份，D23.2）；geometry + material +
 *      customDepthMaterial 随 sourceKey + level 的 InstanceSource 整体成套（缓存
 *      sourceKey::level 条目即天然成套，本池只挂引用）。换档 = 实例跨桶迁移
 *      （复用既有跨池迁移语义：entry 迁移 + 双池 reconcile + 锚点/槽位表随迁），
 *      **不做「桶内换 Source」**——每桶创建时绑定当档源，Mesh 对象跨档重建。
 *      frameLod（Renderer 块剔除后、render 前调）：逐对象评估（006.1 评估器——选档
 *      基准 = High 档源一次派生按 sourceKey 冻结的稳定基准球（T006.6，与当前桶档位
 *      解耦：同机位读数不随迁档平移）× 实例 scale，代表点 = 基准球心过实例矩阵）
 *      → 迁移 / culled。
 *      culled（超远）= 调度结果：不迁移、实例矩阵槽写零缩放（复用「隐藏实例零缩放」
 *      既有机制——entry.matrix 保留真值，槽写入时叠加 culled 判定；单例 Mesh 走
 *      visible=false）。迟滞参考 current 由本池持有（entry.currentLod，逐帧传入评估器
 *      ——评估器无状态，D27.6）；档位是每帧派生态，不进 Scene / Command / 持久状态。
 *      迁移时源未就绪：entry.pendingLevel 登记，源到达后回调迁移（迟到一帧可接受，
 *      旧档持续渲染到新档就绪——换档点无 pop）。LOD 总开关由 Renderer 持有并逐帧
 *      传入（off = 全 High + culled 旁路，经评估器语义）。
 * 桶级提交跳过（T006.4，006.3 遗留治理面）：桶内全部实例零像素（全 hidden 或全 culled
 *      ——零缩放口径）时 InstancedMesh 整体 visible=false（省 1 draw call/桶 + 逐顶点
 *      提交；画面零变化——零缩放实例本就无像素）。恢复 = 任一实例回 renderable 同帧
 *      置回 true（frameLod → writeEntryRenderState → refreshSubmitVisibility，回视恢复
 *      路径不变）；拾取语义不变（零缩放实例本就不可命中，r186 raycaster 不跳 visible=
 *      false 对象也无影响）；迁移/成员变化经 reconcile 尾步同步重算。split 诊断分组态
 *      两侧网格独立判定（dimEntries / brightEntries 各自含 renderable 才提交）。
 * LOD 分布双口径（T006.4，D27.9）：getLodDistribution 只读快照——实例按当前展示表示
 *      （currentLod ?? 桶档）、桶按提交口径（提交中计桶档；整桶隐藏计 culled），
 *      经 runtime/lodDistribution 纯计数器聚合（Renderer 出口合并两链）。
 */
import type { ID, Transform } from '../../core/types';
import { aSeedValueOf } from '../../domain/assets';
import type { ModelObject } from '../../domain/assets';
import type { ProceduralLevel } from '../../domain/assets';
import type { LodRepresentation } from '../../domain/lod/lodEvaluation';
import { evaluateLodRepresentation } from '../../domain/lod/lodEvaluation';
import type { LodDistribution } from '../lodDistribution';
import { LodDistributionCounter } from '../lodDistribution';
import { LodReferenceSphereCache } from '../lodReference';
import { lodViewOfCamera } from './lodView';
import * as THREE from 'three';

/** 实例化源：模板中抽取的可共享几何/材质（InstancedMesh / 单例 Mesh 共用）。
 *  资源语义：全部字段归源所有——与缓存条目/loader 同生命周期，源端统一 dispose
 *  （ProceduralSourceCache.releaseSource / AssetLoader）；消费方（池/散布/Ghost/舞台）
 *  只挂引用、不 dispose（「池不 dispose 共享模板资源」边界）。 */
export interface InstanceSource {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  /**
   * 影 pass 专用深度材质（T009.5 叶影裁切通道）：源资产声明时池在三个建网格点
   * （singleMesh / instancedMesh / 诊断亮网格）挂 mesh.customDepthMaterial——
   * undefined 不赋值保持 three 缺省（GLB/旧资产行为零变化）。归源所有：与
   * geometry/material 同生命周期，源端统一 dispose，消费方只挂引用。
   */
  customDepthMaterial?: THREE.Material;
  /**
   * 点光源影距离材质：**仅类型占位**（T009.5 零实装零消费零 dispose——点光源影
   * 需求出现时再立项，届时挂载/释放与 customDepthMaterial 同规则一并实装）。
   */
  customDistanceMaterial?: THREE.Material;
}

/** 源提供者：assetId + 对象 seed + 档位 → 实例化源（Renderer 注入复合源路由
 * AssetSourceRouter；seed 供源端槽路由定 sourceKey，level 为档位维度（缓存
 * sourceKey::level 键）——无 seed / 无 level 调用兼容，散布等无 seed 消费方照旧） */
export type InstanceSourceProvider = (
  assetId: string,
  seed?: number,
  level?: ProceduralLevel,
) => Promise<InstanceSource>;

/** 池选项 */
export interface InstancedAssetPoolOptions {
  provideSource: InstanceSourceProvider;
  /**
   * 池键解析（T008.1，D19.4）：assetId + 对象 seed → 池桶键。池无法自行算槽（需
   * meta），由 Renderer 注入「查注册表 meta + domain sourceKeyOf」（与源缓存同一
   * 真相源）；缺省恒 assetId（行为回退现状——GLB/未声明形态族资产零变化）。
   * 注：此键是 **sourceKey（形态身份）**——T006.3 起池内部再叠加 level 维度组成
   * 桶键 `${sourceKey}::${level}`，level 绝不进本函数（D23.2）。
   */
  resolvePoolKey?: (assetId: string, seed?: number) => string;
  /**
   * 资产已声明档位查询（T006.3 选档输入）：返回 levels meta 的 id 列表；缺省/空 =
   * 单档语义（评估器按 ['high'] 处理，D27 不完整链跳档由评估器承担）。
   * Renderer 注入「查注册表 procedural meta」；每资产首次查询后池内缓存。
   */
  getDeclaredLevels?: (assetId: string) => ProceduralLevel[] | undefined;
}

/** 单实例登记项（slot = 所在池 entries 的下标） */
interface PoolEntry {
  readonly id: ID;
  /** 由 transform 组合的实例矩阵（隐藏实例 → 零缩放：不渲染、不可拾取；
   *  LOD culled 不改写本值——真值随迁移/恢复可还原，槽写入时叠加 culled 判定） */
  readonly matrix: THREE.Matrix4;
  visible: boolean;
  /** 实例颜色乘子（null = 白恒等乘子；源无关槽——变体采样在调用方） */
  color: THREE.Color | null;
  /** 对象 seed（obj.asset.seed ?? null；aSeed 逐实例属性与源路由的数据源） */
  seed: number | null;
  /**
   * LOD 迟滞参考（T006.3）：当前展示档（含 'culled'），由本池持有、逐帧传入评估器
   * （评估器无状态，D27.6）；undefined = 尚未评估（首帧按名义档起步）。随 entry
   * 跨桶迁移携带（档位状态跟业务对象走，不跟桶走）。
   */
  currentLod: LodRepresentation | undefined;
  /** LOD 超远裁剪态（调度结果）：true = 槽位写零缩放 / 单例 Mesh visible=false */
  culled: boolean;
  /** 换档迁移目标档（源未就绪时登记；源到达回调迁移；null = 无在途迁移） */
  pendingLevel: ProceduralLevel | null;
}

/**
 * 池级诊断分组运行态（T8.4 islands；仅混合池存在——纯一侧退化为整网格换层不建）：
 * 主网格收暗侧（layer 0）、highlightMesh 收亮侧（诊断层），共享源 geometry/material，
 * 只各持一份矩阵缓冲。
 */
interface PoolSplit {
  /** 亮侧临时 InstancedMesh（退出分组 / 池变纯一侧时移除并释放矩阵缓冲） */
  highlightMesh: THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
  /** 暗侧条目序（与主网格槽位 1:1；resolvePick 反查——混合态主网格槽位 ≠ entries 序） */
  dimEntries: PoolEntry[];
  /** 亮侧条目序（与 highlightMesh 槽位 1:1） */
  brightEntries: PoolEntry[];
  /** id → 主网格槽位（混合态 update 路由） */
  dimSlotOf: Map<ID, number>;
  /** id → highlightMesh 槽位 */
  brightSlotOf: Map<ID, number>;
}

/** 每池键（`${sourceKey}::${level}`）一池的运行态（T006.3 起桶维度 = source × level） */
interface AssetPool {
  /** 池桶键（`${sourceKey}::${level}`；pools Map 的键——同 assetId 不同槽或不同档 = 不同桶） */
  readonly key: string;
  /**
   * 桶键的 sourceKey 段（resolvePoolKey 产物，不含 level）——attach 幂等比对与跨档
   * 迁移的目标池配对（同 sourceKey 不同 level 互为档位桶，T006.3）。
   */
  readonly sourceKey: string;
  /** 桶档位（T006.3：桶创建时定死——不做「桶内换 Source」，换档 = 跨桶迁移） */
  readonly level: ProceduralLevel;
  /** 源资产 id（provideSource 发起与告警用） */
  readonly assetId: string;
  /** 实例登记（插入序；undo 重挂追加到尾部） */
  readonly entries: PoolEntry[];
  /** id → 槽位（成员变化后由 reindex 重建；update 的 O(1) 定位） */
  readonly slotOf: Map<ID, number>;
  /** id → 脱离渲染树的锚点（Renderer 的 RuntimeObjectMap 值） */
  readonly anchors: Map<ID, THREE.Object3D>;
  /** 已就绪的实例化源（加载中/失败为 null） */
  source: InstanceSource | null;
  /** 源加载已告警（失败只报一次） */
  failed: boolean;
  /** 单实例退化用的普通 Mesh（离开单例模式仅摘下，保留复用；资源共享不 dispose） */
  singleMesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | null;
  /** 实例化网格（成员 ≥2 时在渲染根；容量不足时换缓冲不换对象） */
  instancedMesh: THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>
    | null;
  /** instanceMatrix 当前容量（槽数） */
  capacity: number;
  /** 混合池诊断分组运行态（T8.4 islands；纯一侧 / 未激活为 null） */
  split: PoolSplit | null;
}

/** 初始容量与扩容策略（翻倍；避免逐实例扩容抖动） */
const MIN_CAPACITY = 4;
function capacityFor(count: number): number {
  let capacity = MIN_CAPACITY;
  while (capacity < count) capacity *= 2;
  return capacity;
}

// 组合/反解的模块级暂存（单线程渲染运行时；three 自身同款惯例）
const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scale = new THREE.Vector3();
/** LOD 代表点暂存（frameLod：High 派生基准球心过实例矩阵，值即时拷入纯数据入参） */
const _subjectPoint = new THREE.Vector3();
/** 恒等白乘子只读源（setColorAt 只读入参；未设色槽位写白 1,1,1） */
const WHITE = new THREE.Color(1, 1, 1);
/** aSeed 属性名（材质声明此 attribute 即消费；three 对未声明材质自动忽略） */
const ASEED_ATTRIBUTE = 'aSeed';
/** seed 缺失槽的 aSeed 值：[0,1) 域中点——无偏中性值（真实身份语义由消费方材质定义） */
const ASEED_NULL_VALUE = 0.5;

/** entry.seed → aSeed 槽值（null → 域中点中性值；其余经 domain 'aseed' 域折算） */
function seedUnitOf(seed: number | null): number {
  return seed === null ? ASEED_NULL_VALUE : aSeedValueOf(seed);
}

/**
 * 桶键组装（T006.3）：`${sourceKey}::${level}`——level 是池桶/缓存共用的档位维度
 * 后缀（与 ProceduralSourceCache 的 `sourceKey::level` 同构口径），绝不掺入
 * sourceKey 形态身份（D23.2）。
 */
function composePoolKey(sourceKey: string, level: ProceduralLevel): string {
  return `${sourceKey}::${level}`;
}

/** LOD 超远裁剪槽矩阵（零缩放：不渲染、不可拾取——同「隐藏实例」既有语义） */
const ZERO_SCALE_MATRIX = new THREE.Matrix4().makeScale(0, 0, 0);

/** Transform（Y 向上、弧度 Euler）→ 实例矩阵；隐藏实例零缩放 */
function composeMatrixInto(target: THREE.Matrix4, t: Transform, visible: boolean): void {
  _euler.set(t.rotation.x, t.rotation.y, t.rotation.z);
  _quaternion.setFromEuler(_euler);
  _position.set(t.position.x, t.position.y, t.position.z);
  if (visible) _scale.set(t.scale.x, t.scale.y, t.scale.z);
  else _scale.set(0, 0, 0);
  target.compose(_position, _quaternion, _scale);
}

/** Transform → Object3D（锚点/单例 Mesh 的直接应用） */
function applyTransformTo(target: THREE.Object3D, t: Transform, visible: boolean): void {
  target.position.set(t.position.x, t.position.y, t.position.z);
  target.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z);
  target.scale.set(t.scale.x, t.scale.y, t.scale.z);
  target.visible = visible;
}

export class InstancedAssetPool {
  /** 渲染根（Renderer 挂入 contentGroup；只含 InstancedMesh / 单例 Mesh） */
  readonly root = new THREE.Group();

  /** 锚点容器（永不加入场景：不渲染、不拾取、不计入场景对象数） */
  private readonly anchorRoot = new THREE.Group();

  private readonly pools = new Map<string, AssetPool>();
  private readonly idToPool = new Map<ID, AssetPool>();
  private readonly provideSource: InstanceSourceProvider;
  /** 池键解析（缺省恒 assetId——无注入时行为回退现状，GLB 池零变化） */
  private readonly resolvePoolKey: (assetId: string, seed?: number) => string;
  /** 资产已声明档位（T006.3 选档输入；每资产缓存一次——帧路径零重复查询） */
  private readonly getDeclaredLevels: (assetId: string) => ProceduralLevel[] | undefined;
  private readonly declaredLevelsCache = new Map<string, ProceduralLevel[]>();
  /**
   * LOD 选档稳定基准（T006.6，D28.2）：sourceKey → High 档派生冻结基准球——选档
   * 输入恒取此（与当前桶档位解耦，见 frameLod）；High 桶源到达时派生（ensurePool）。
   */
  private readonly referenceSpheres = new LodReferenceSphereCache();
  /**
   * 诊断分组态（T8.4 islands，Renderer 在模式切换时一次性注入/撤除）：
   * classify(id) = true → 已归类（暗侧 layer 0）/ false → 未归类（亮侧 highlightLayer）。
   * 激活期间 attach/detach 经 reconcile 自动重算分组；换层（object:updated 含 layerId
   * 键）由 Renderer 调 refreshDiagnostic 重算所在池。
   */
  private diagnostic: { classify: (id: ID) => boolean; highlightLayer: number } | null = null;
  private disposed = false;

  constructor(options: InstancedAssetPoolOptions) {
    this.provideSource = options.provideSource;
    this.resolvePoolKey = options.resolvePoolKey ?? ((assetId) => assetId);
    this.getDeclaredLevels = options.getDeclaredLevels ?? (() => undefined);
    this.root.name = '__instanced_assets__';
  }

  // ── 对 Renderer 暴露的最小接口 ───────────────────────────

  /**
   * 登记模型实例并返回锚点（幂等：同 id 同 sourceKey 视为更新——含 LOD 档位桶内
   * 更新（frameLod 管档位，attach 不感知相机）；同 id sourceKey 变了——换资产或
   * 重掷 seed 换槽——跨池迁移）。新登记从 'high' 桶起步（attach 时无相机评估，
   * 首帧 frameLod 即校正；迟滞无参考按名义档起步，无残留状态）。源未就绪时只登记
   * 矩阵，源到达后一次性建网格。
   */
  attach(obj: ModelObject): THREE.Object3D {
    if (this.disposed) return new THREE.Object3D();
    const seed = obj.asset.seed;
    const existing = this.idToPool.get(obj.id);
    if (existing) {
      if (existing.sourceKey === this.resolvePoolKey(obj.asset.assetId, seed)) {
        const slot = existing.slotOf.get(obj.id)!;
        existing.entries[slot].seed = seed ?? null; // 同槽重掷：aSeed 槽随入口一并刷新
        this.writeEntry(existing, obj.id, obj.transform, obj.visible);
        this.writeEntryInstanceAttrs(existing, obj.id);
        return existing.anchors.get(obj.id)!;
      }
      this.detach(obj.id); // 池键变了（换资产 / 换槽）：先从旧池摘除（含旧池 reconcile）
    }
    const pool = this.ensurePool(obj.asset.assetId, seed, 'high');
    const entry: PoolEntry = {
      id: obj.id,
      matrix: new THREE.Matrix4(),
      visible: obj.visible,
      color: null,
      seed: seed ?? null,
      currentLod: undefined,
      culled: false,
      pendingLevel: null,
    };
    composeMatrixInto(entry.matrix, obj.transform, obj.visible);
    pool.entries.push(entry);
    const anchor = new THREE.Object3D();
    anchor.name = obj.name;
    applyTransformTo(anchor, obj.transform, obj.visible);
    this.anchorRoot.add(anchor);
    pool.anchors.set(obj.id, anchor);
    this.idToPool.set(obj.id, pool);
    this.decorateAnchor(pool, anchor);
    this.reconcile(pool);
    return anchor;
  }

  /** 更新单实例：只写对应矩阵槽（setMatrixAt ×1）；visible 缺省保持原值 */
  update(id: ID, transform: Transform, visible?: boolean): void {
    if (this.disposed) return;
    const pool = this.idToPool.get(id);
    if (!pool) return;
    const slot = pool.slotOf.get(id);
    if (slot === undefined) return;
    const isVisible = visible ?? pool.entries[slot].visible;
    this.writeEntry(pool, id, transform, isVisible);
  }

  /**
   * 设置实例颜色乘子（T002.3 烘焙式变体 hue 微差；源无关槽——不读 meta/seed）。
   * Instanced 路径写 instanceColor 槽（缓冲惰性建、按 instanceMatrix 容量对齐）；
   * 源未就绪只登记在 entry（源到达后全量重写生效）。单实例退化 Mesh 不带色
   * （共享材质不可染、克隆材质破合批——文档化边界：微差自第 2 个实例起可见）。
   * 颜色内部克隆隔离（调用方可安全复用 scratch 色）。
   */
  setColor(id: ID, color: THREE.Color): void {
    if (this.disposed) return;
    const pool = this.idToPool.get(id);
    if (!pool) return;
    const slot = pool.slotOf.get(id);
    if (slot === undefined) return;
    pool.entries[slot].color = color.clone();
    this.writeEntryInstanceAttrs(pool, id);
  }

  /** 清除实例颜色乘子（回到白恒等；幂等；全量路径重写时该槽写白） */
  clearColor(id: ID): void {
    if (this.disposed) return;
    const pool = this.idToPool.get(id);
    if (!pool) return;
    const slot = pool.slotOf.get(id);
    if (slot === undefined || pool.entries[slot].color === null) return;
    pool.entries[slot].color = null;
    this.writeEntryInstanceAttrs(pool, id);
  }

  /** 摘除实例（splice 语义：后续槽位前移，其余实例矩阵值不变）；count 随之减一 */
  detach(id: ID): void {
    if (this.disposed) return;
    const pool = this.idToPool.get(id);
    if (!pool) return;
    const slot = pool.slotOf.get(id);
    if (slot === undefined) return;
    pool.entries.splice(slot, 1);
    const anchor = pool.anchors.get(id);
    if (anchor) {
      anchor.removeFromParent();
      pool.anchors.delete(id);
    }
    this.idToPool.delete(id);
    this.reconcile(pool);
  }

  /** InstancedMesh 命中（携带 instanceId）→ 业务 id；非本池对象/越界 → null */
  resolvePick(hit: THREE.Intersection): ID | null {
    const object = hit.object as THREE.InstancedMesh | null;
    if (!object || !object.isInstancedMesh) return null;
    const index = hit.instanceId;
    if (typeof index !== 'number') return null;
    for (const pool of this.pools.values()) {
      // 混合态主网格槽位 = dimEntries 序（≠ entries 序），亮网格槽位 = brightEntries 序
      if (pool.split) {
        if (pool.split.highlightMesh === object) return pool.split.brightEntries[index]?.id ?? null;
        if (pool.instancedMesh === object) return pool.split.dimEntries[index]?.id ?? null;
        continue;
      }
      if (pool.instancedMesh === object) return pool.entries[index]?.id ?? null;
    }
    return null;
  }

  /**
   * LOD 分布双口径只读快照（T006.4，D27.9 归因数据）：实例按当前展示表示
   * （entry.currentLod ?? 桶档——未评估回退所在桶档）、桶按提交口径（提交中的网格计其
   * 桶档 + split 亮侧独立一桶；整桶零提交（全 culled/hidden 隐藏）计 culled——单例
   * Mesh visible 同判）。O(桶+实例) 遍历，供验收报表/调试按需调用，不进帧路径。
   */
  getLodDistribution(): LodDistribution {
    const counter = new LodDistributionCounter();
    for (const pool of this.pools.values()) {
      for (const entry of pool.entries) {
        counter.add(entry.currentLod ?? pool.level, 1, 0);
      }
      const mesh = pool.instancedMesh;
      if (mesh) {
        counter.add(mesh.visible ? pool.level : 'culled', 0, 1);
        if (pool.split && pool.split.highlightMesh.visible) counter.add(pool.level, 0, 1);
      }
      if (pool.singleMesh) {
        counter.add(pool.singleMesh.visible ? pool.level : 'culled', 0, 1);
      }
    }
    return counter.snapshot();
  }

  // ── LOD 帧路径（T006.3；Renderer 块剔除后、render 前调用）─────────

  /**
   * 逐对象 LOD 评估与换档执行（D27.6 帧内时序：Renderer.renderFrame 在 scatter 剔除
   * 之后、render 之前调用）：
   *  - 评估输入 = High 档派生稳定基准球（T006.6：与当前桶档位解耦——点 = 基准球心
   *    过实例矩阵、radius = 基准半径、scale = 矩阵三轴最大分量——非均匀缩放的保守
   *    口径）+ 006.1 评估器（迟滞参考 current 逐帧由 entry.currentLod 传入）；隐藏
   *    实例跳过（零缩放无选档意义）。
   *  - 目标档 ≠ 桶档 → 跨桶迁移（目标桶源就绪即同步迁移，渲染引用/实例属性完整随迁；
   *    未就绪登记 pendingLevel，源到达回调迁移——旧档持续渲染，无 pop）。
   *  - 'culled'（超远）→ 不迁移，槽写零缩放（复用隐藏实例机制）；恢复即经迟滞回档。
   *  - lodEnabled=false（总开关关）→ 评估器语义恒 High + culled 旁路：在途迁移清空、
   *    mid/low 桶实例全部迁回 high 桶（回退对比与兜底）。
   * 迁移会改写池集合（扩桶/拆空桶），故对 pools 与 entries 均取快照遍历。
   */
  frameLod(camera: THREE.Camera, lodEnabled: boolean): void {
    if (this.disposed || this.pools.size === 0) return;
    camera.updateMatrixWorld();
    const view = lodViewOfCamera(camera);
    for (const pool of [...this.pools.values()]) {
      const source = pool.source;
      if (!source) continue; // 源未就绪：无包围球可评，实例仍在登记矩阵上
      // T006.6：选档基准 = High 档派生冻结的稳定基准球（整球：球心+半径同源——m 与
      // 当前桶档位完全无关，迁档不换选档输入）。防御回退（会话内不可达：attach 起步
      // 即 high 桶、条目首评前基准必已派生，见 ensurePool 到达路径）：当前桶源球过渡
      // （确定性、不冻结）
      const sphere = this.referenceSpheres.get(pool.sourceKey) ?? source.geometry.boundingSphere;
      if (!sphere) continue; // 防御：无球可评（到达路径已算，见彼处），未算即跳过
      const declared = this.declaredLevelsOf(pool.assetId);
      for (const entry of [...pool.entries]) {
        if (!entry.visible) continue; // 隐藏实例：矩阵已零缩放，无选档意义
        // 代表点/scale：实例矩阵作用于 High 派生基准球（非均匀缩放下球心仿射仍正确；
        // scale 取三轴最大分量 = 有效半径保守放大 → 更晚降档，保守偏高档口径）
        entry.matrix.decompose(_position, _quaternion, _scale);
        const scale = Math.max(_scale.x, _scale.y, _scale.z);
        if (scale <= 0) continue;
        _subjectPoint.copy(sphere.center).applyMatrix4(entry.matrix);
        const next = evaluateLodRepresentation({
          view,
          subject: {
            point: { x: _subjectPoint.x, y: _subjectPoint.y, z: _subjectPoint.z },
            radius: sphere.radius,
            scale,
          },
          declaredLevels: declared,
          current: entry.currentLod,
          lodEnabled,
        });
        entry.currentLod = next;
        if (next === 'culled') {
          entry.pendingLevel = null; // 裁剪态无迁移在途
          if (!entry.culled) {
            entry.culled = true;
            this.writeEntryRenderState(pool, entry);
          }
          continue;
        }
        if (entry.culled) {
          entry.culled = false;
          this.writeEntryRenderState(pool, entry);
        }
        if (next === pool.level) {
          if (entry.pendingLevel !== null) entry.pendingLevel = null; // 目标已回本桶
          continue;
        }
        if (entry.pendingLevel === next) continue; // 迁移在途（源未就绪），不重复登记
        entry.pendingLevel = next;
        const target = this.ensurePool(pool.assetId, entry.seed ?? undefined, next);
        if (target.source) this.migrateEntry(pool, target, entry);
      }
    }
  }

  /** 资产声明档位（缓存首次查询；空数组/undefined = 单档语义，评估器自处理） */
  private declaredLevelsOf(assetId: string): ProceduralLevel[] {
    const cached = this.declaredLevelsCache.get(assetId);
    if (cached) return cached;
    const declared = this.getDeclaredLevels(assetId) ?? [];
    this.declaredLevelsCache.set(assetId, declared);
    return declared;
  }

  /**
   * 实例跨桶迁移（换档执行，复用既有跨池迁移语义——D27.4「不引入桶内换 Source」）：
   * entry 连同矩阵/颜色/seed/迟滞状态整体随迁（渲染表示变化不改实例数据），锚点
   * 对象身份不变（RuntimeObjectMap / gizmo 引用稳定），双池 reconcile 收敛网格形态
   * （源桶可能拆空、目标桶建网格/并入实例缓冲——instanceColor/aSeed 由
   * writeAllSlots 全量重写，逐实例属性完整迁移）。
   */
  private migrateEntry(fromPool: AssetPool, toPool: AssetPool, entry: PoolEntry): void {
    const slot = fromPool.slotOf.get(entry.id);
    if (slot === undefined) return; // 快照遍历中已被迁移/摘除（防御）
    if (toPool.source === null) return; // 目标源未就绪：pendingLevel 保持，到达回调再迁
    fromPool.entries.splice(slot, 1);
    toPool.entries.push(entry);
    entry.pendingLevel = null;
    const anchor = fromPool.anchors.get(entry.id);
    if (anchor) {
      fromPool.anchors.delete(entry.id);
      toPool.anchors.set(entry.id, anchor);
    }
    this.idToPool.set(entry.id, toPool);
    this.reindex(fromPool);
    this.reindex(toPool);
    if (anchor) this.rebindAnchorDecoration(toPool, anchor);
    this.reconcile(fromPool);
    this.reconcile(toPool);
  }

  /**
   * 源到达后的在途迁移收敛：把同 sourceKey 家族中 pendingLevel 指向本桶档位的
   * entry 全部迁入（frameLod 登记的迟到迁移；含总开关关闭引发的高档回迁）。
   */
  private applyPendingMigrations(targetPool: AssetPool): void {
    for (const pool of [...this.pools.values()]) {
      if (pool === targetPool || pool.sourceKey !== targetPool.sourceKey) continue;
      for (const entry of [...pool.entries]) {
        if (entry.pendingLevel === targetPool.level) this.migrateEntry(pool, targetPool, entry);
      }
    }
  }

  /**
   * 锚点装饰子网格随档重绑（CameraController.focusObjects 包围盒取景用；锚点不在
   * 渲染树、无影 pass 参与——不设投影与 customDepthMaterial，沿 decorateAnchor 边界）。
   */
  private rebindAnchorDecoration(pool: AssetPool, anchor: THREE.Object3D): void {
    if (!pool.source) return;
    const child = anchor.children[0] as THREE.Mesh | undefined;
    if (child && child.isMesh) {
      child.geometry = pool.source.geometry;
      child.material = pool.source.material;
    } else if (anchor.children.length === 0) {
      anchor.add(new THREE.Mesh(pool.source.geometry, pool.source.material));
    }
  }

  /**
   * 单实例渲染态重写（culled 开关路径）：按当前池形态路由——split 态写对应侧网格
   * 槽、常态写主网格槽、单例 Mesh 写 visible。与 writeEntry 的槽写入同源（矩阵 +
   * culled 零缩放叠加），不触碰锚点（锚点始终真值变换）。
   */
  private writeEntryRenderState(pool: AssetPool, entry: PoolEntry): void {
    const split = pool.split;
    if (split) {
      const bright = split.brightSlotOf.get(entry.id);
      if (bright !== undefined) {
        split.highlightMesh.setMatrixAt(bright, this.slotMatrixOf(entry));
        split.highlightMesh.instanceMatrix.needsUpdate = true;
        split.highlightMesh.computeBoundingSphere();
        return;
      }
      const dim = split.dimSlotOf.get(entry.id);
      if (dim !== undefined && pool.instancedMesh) {
        pool.instancedMesh.setMatrixAt(dim, this.slotMatrixOf(entry));
        pool.instancedMesh.instanceMatrix.needsUpdate = true;
        pool.instancedMesh.computeBoundingSphere();
      }
      return;
    }
    const mesh = pool.instancedMesh;
    const slot = pool.slotOf.get(entry.id);
    if (mesh && slot !== undefined) {
      mesh.setMatrixAt(slot, this.slotMatrixOf(entry));
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    } else if (pool.singleMesh && pool.entries.length === 1 && pool.entries[0] === entry) {
      pool.singleMesh.userData.objectId = entry.id; // 单例反查随写随新
      this.applyEntryToObject(pool.singleMesh, entry);
    }
    this.refreshSubmitVisibility(pool); // T006.4：culled 开关可能翻转整桶提交态
  }

  /** 槽矩阵取值：culled → 零缩放（复用隐藏实例语义）；否则 entry 真值矩阵 */
  private slotMatrixOf(entry: PoolEntry): THREE.Matrix4 {
    return entry.culled ? ZERO_SCALE_MATRIX : entry.matrix;
  }

  /** 实例是否提交像素：visible ∧ 非 culled（零缩放实例零像素——提交跳过判据） */
  private isRenderable(entry: PoolEntry): boolean {
    return entry.visible && !entry.culled;
  }

  /**
   * 桶级提交跳过（T006.4，006.3 遗留面）：桶内无任何 renderable 实例 → InstancedMesh
   * 整体 visible=false（three 对 visible=false 零提交——省整桶 draw call 与逐顶点提交，
   * 画面零变化：全零缩放实例本就无像素）。split 态两侧独立判定；单例 Mesh 不经此处
   * （applyEntryToObject 已合成 visible = visible ∧ ¬culled）。调用点 = 桶成员/渲染态
   * 变化路径收尾（reconcile / writeEntry / writeEntryRenderState）——任一实例回
   * renderable 即整桶恢复提交，回视恢复语义与 006.3 一致。
   */
  private refreshSubmitVisibility(pool: AssetPool): void {
    const split = pool.split;
    if (split) {
      if (pool.instancedMesh) {
        pool.instancedMesh.visible = split.dimEntries.some((entry) => this.isRenderable(entry));
      }
      split.highlightMesh.visible = split.brightEntries.some((entry) => this.isRenderable(entry));
      return;
    }
    if (pool.instancedMesh) {
      pool.instancedMesh.visible = pool.entries.some((entry) => this.isRenderable(entry));
    }
  }

  // ── 诊断分组（T8.4 islands；Renderer 在模式切换时一次性调用，不进帧路径） ──

  /**
   * 激活/撤除诊断分组（幂等）：
   *  - 激活（classify 非 null）：每池按分类谓词收敛到三形态之一——纯暗侧（整网格
   *    layer 0）/ 纯亮侧（整网格换 highlightLayer）/ 混合（主网格收暗侧 + 临时构造
   *    第二个 InstancedMesh 收亮侧，共享源 geometry/material、只重建矩阵缓冲）；
   *  - 撤除（null）：并回单网格、恢复 layer 0、释放亮侧矩阵缓冲；
   *  - 单实例退化 singleMesh 按唯一实例归类整网格换层。
   * classify 为活谓词（Renderer 闭包 live 读 Scene）——激活期间 attach/detach 经
   * reconcile 自动落正确侧；换层经 refreshDiagnostic。
   */
  setDiagnosticGrouping(classify: ((id: ID) => boolean) | null, highlightLayer: number): void {
    if (this.disposed) return;
    this.diagnostic = classify ? { classify, highlightLayer } : null;
    for (const pool of this.pools.values()) this.reconcile(pool);
  }

  /** 某对象换层（object:updated 含 layerId 键）后重算其所在池的分组（幂等 no-op 安全） */
  refreshDiagnostic(id: ID): void {
    if (this.disposed || !this.diagnostic) return;
    const pool = this.idToPool.get(id);
    if (pool) this.reconcile(pool);
  }

  /** 按当前 diagnostic 把池收敛到正确形态（reconcile 尾步；诊断未激活 = 恢复统一形态） */
  private applyDiagnostic(pool: AssetPool): void {
    const diag = this.diagnostic;
    if (!diag) {
      // 撤除/未激活：恢复 layer 0、拆除混合拆分
      pool.instancedMesh?.layers.set(0);
      pool.singleMesh?.layers.set(0);
      const wasSplit = pool.split !== null;
      this.teardownSplit(pool);
      // 分裂 → 统一的槽位序迁移（主网格分裂期间为 dimEntries 序，回统一后为 entries 序）：
      // 矩阵虽已在 activateInstanced 按 entries 序重写，颜色/aSeed 被 writeAllSlots 的
      // 分裂守卫跳过——拆除后补一次全量重写（幂等；仅分裂池走此分支，常态路径零额外开销）
      if (wasSplit && pool.instancedMesh) this.writeAllSlots(pool);
      return;
    }
    if (pool.singleMesh && !pool.instancedMesh) {
      // 单实例退化：普通 Mesh 按唯一实例归类整网格换层
      pool.singleMesh.layers.set(diag.classify(pool.entries[0].id) ? 0 : diag.highlightLayer);
      this.teardownSplit(pool);
      return;
    }
    const mesh = pool.instancedMesh;
    if (!mesh) return; // 源未就绪：无渲染对象（源到达后 reconcile 再收敛）
    const dimEntries: PoolEntry[] = [];
    const brightEntries: PoolEntry[] = [];
    for (const entry of pool.entries) (diag.classify(entry.id) ? dimEntries : brightEntries).push(entry);
    if (dimEntries.length === 0 || brightEntries.length === 0) {
      // 纯一侧：整网格换层（零额外缓冲）
      mesh.layers.set(brightEntries.length === 0 ? 0 : diag.highlightLayer);
      this.teardownSplit(pool);
      mesh.count = pool.entries.length;
      this.writeAllSlots(pool);
      return;
    }
    // 混合：主网格收暗侧（layer 0），临时亮网格收亮侧（highlightLayer）
    mesh.layers.set(0);
    this.ensureSplit(pool, dimEntries, brightEntries);
  }

  /** 建立或更新混合拆分：两网格容量/计数/矩阵/槽位表全量重写（成员或归类变化后） */
  private ensureSplit(pool: AssetPool, dimEntries: PoolEntry[], brightEntries: PoolEntry[]): void {
    const diag = this.diagnostic!;
    const source = pool.source!;
    let split = pool.split;
    if (!split) {
      split = {
        highlightMesh: new THREE.InstancedMesh(source.geometry, source.material, capacityFor(brightEntries.length)),
        dimEntries: [],
        brightEntries: [],
        dimSlotOf: new Map(),
        brightSlotOf: new Map(),
      };
      split.highlightMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      split.highlightMesh.castShadow = true;
      split.highlightMesh.receiveShadow = true;
      // T009.5：亮网格与主网格同待遇——源带影 pass 深度材质则挂（归源所有，只挂引用）
      if (source.customDepthMaterial !== undefined) {
        split.highlightMesh.customDepthMaterial = source.customDepthMaterial;
      }
      split.highlightMesh.layers.set(diag.highlightLayer);
      pool.split = split;
      this.root.add(split.highlightMesh);
    } else if (split.highlightMesh.instanceMatrix.count < brightEntries.length) {
      // 亮侧扩容：重建矩阵缓冲（保留同一 Mesh 对象，渲染引用稳定——沿主网格扩容先例）
      const attribute = new THREE.InstancedBufferAttribute(
        new Float32Array(capacityFor(brightEntries.length) * 16),
        16,
      );
      attribute.setUsage(THREE.DynamicDrawUsage);
      split.highlightMesh.instanceMatrix = attribute;
    }
    const mesh = pool.instancedMesh!;
    mesh.count = dimEntries.length; // 主网格容量 ≥ entries 总数（activateInstanced 已扩）≥ 暗侧数
    split.highlightMesh.count = brightEntries.length;
    split.dimEntries = dimEntries;
    split.brightEntries = brightEntries;
    split.dimSlotOf.clear();
    split.brightSlotOf.clear();
    for (let i = 0; i < dimEntries.length; i++) {
      mesh.setMatrixAt(i, this.slotMatrixOf(dimEntries[i]!));
      split.dimSlotOf.set(dimEntries[i]!.id, i);
    }
    for (let i = 0; i < brightEntries.length; i++) {
      split.highlightMesh.setMatrixAt(i, this.slotMatrixOf(brightEntries[i]!));
      split.brightSlotOf.set(brightEntries[i]!.id, i);
    }
    mesh.instanceMatrix.needsUpdate = true;
    split.highlightMesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    split.highlightMesh.computeBoundingSphere();
    // T002.3/T008.1：两网格颜色随各自侧槽位同步（亮网格扩容后 instanceColor 由
    // writeSideInstanceAttrs 对齐重建）；aSeed 为 geometry 共享缓冲（见其文档边界）
    this.writeSideInstanceAttrs(mesh, dimEntries);
    this.writeSideInstanceAttrs(split.highlightMesh, brightEntries);
  }

  /** 拆除混合拆分（退出诊断 / 池变纯一侧 / 单例化）：移除亮网格并释放其矩阵缓冲 */
  private teardownSplit(pool: AssetPool): void {
    const split = pool.split;
    if (!split) return;
    split.highlightMesh.removeFromParent();
    split.highlightMesh.dispose(); // 释放亮侧实例矩阵缓冲（共享源资源不动）
    pool.split = null;
  }

  /** 停止一切并清空渲染根（共享模板资源由 AssetLoader.dispose 统一释放） */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const pool of this.pools.values()) this.teardownPool(pool);
    this.pools.clear();
    this.idToPool.clear();
    this.referenceSpheres.clear();
    this.anchorRoot.clear();
  }

  // ── 内部：池生命周期 ─────────────────────────────────────

  /**
   * 取或建池（按桶键 `${sourceKey}::${level}`）；建桶时以 (assetId, seed, level) 发起
   * 源加载（同桶只取一次，失败告警一次、不重试）。源到达：补算几何包围球（渲染/剔除
   * 路径用，惰性首算一次——桶内几何共享，全局只算一次；high 桶同时派生选档稳定基准
   * ——T006.6）、补锚点装饰、建网格，并收敛同 sourceKey 家族内在途迁移
   * （applyPendingMigrations——T006.3）。
   */
  private ensurePool(assetId: string, seed: number | undefined, level: ProceduralLevel): AssetPool {
    const sourceKey = this.resolvePoolKey(assetId, seed);
    const key = composePoolKey(sourceKey, level);
    let pool = this.pools.get(key);
    if (pool) return pool;
    pool = {
      key,
      sourceKey,
      level,
      assetId,
      entries: [],
      slotOf: new Map(),
      anchors: new Map(),
      source: null,
      failed: false,
      singleMesh: null,
      instancedMesh: null,
      capacity: 0,
      split: null,
    };
    this.pools.set(key, pool);
    this.provideSource(assetId, seed, level)
      .then((source) => {
        pool.source = source;
        if (!source.geometry.boundingSphere) source.geometry.computeBoundingSphere();
        // T006.6：high 桶源到达即派生选档稳定基准（sourceKey 冻结一次——选档自此与
        // 当前桶档位解耦，迁档不换选档输入；同 key 几何确定性恒等，冻结幂等）
        if (level === 'high') this.referenceSpheres.freezeFromHighSource(sourceKey, source);
        // 源就绪：给已建锚点补包围盒子网格，并为已登记实例一次性建网格
        for (const anchor of pool.anchors.values()) this.decorateAnchor(pool, anchor);
        if (!this.disposed && pool.entries.length > 0) this.reconcile(pool);
        if (!this.disposed) this.applyPendingMigrations(pool);
      })
      .catch((err: unknown) => {
        if (!pool.failed) {
          pool.failed = true;
          console.warn('[InstancedAssetPool] 模型资产源加载失败，实例不渲染', assetId, err);
        }
      });
    return pool;
  }

  /** 成员/源状态变化后收敛到正确形态：0 → 拆池；1 → 单例 Mesh（带 seed 池例外）；
   *  ≥2 → InstancedMesh；诊断分组尾步应用 */
  private reconcile(pool: AssetPool): void {
    this.reindex(pool);
    const count = pool.entries.length;
    if (count === 0) {
      this.teardownPool(pool);
      return;
    }
    const source = pool.source;
    if (!source) return; // 源未就绪：矩阵已登记，待源到达后再收敛
    // 单实例退化判定（D19.7 修订，主代理裁定）：带 seed 的池（任一 entry seed 非 null）
    // 在 count===1 时仍走 InstancedMesh——逐实例属性（aSeed）只存在于 InstancedMesh，
    // 树常单棵放置，aSeed 风动不能因单棵失效；实例化开销对程序化资产可忽略。
    // 无 seed 池保持单例 Mesh 退化（GLB 行为零变化）。
    if (count === 1 && !this.hasSeedEntry(pool)) this.activateSingle(pool, source);
    else this.activateInstanced(pool, source);
    this.applyDiagnostic(pool); // T8.4：激活时按分类落侧；未激活恢复统一 layer 0（幂等）
    this.refreshSubmitVisibility(pool); // T006.4：桶级提交跳过（成员/迁移后重算整桶可提交性）
  }

  /** 池内是否存在带 seed 的 entry（aSeed 缓冲与单实例退化规则的判据） */
  private hasSeedEntry(pool: AssetPool): boolean {
    return pool.entries.some((entry) => entry.seed !== null);
  }

  /** 重建 id → 槽位索引（成员变化后调用） */
  private reindex(pool: AssetPool): void {
    pool.slotOf.clear();
    for (let i = 0; i < pool.entries.length; i++) pool.slotOf.set(pool.entries[i].id, i);
  }

  /** 单实例退化：普通 Mesh 直接承载变换（实例化缓冲不值得）。
   *  单例 Mesh 不经 resolvePick（非 InstancedMesh），拾取反查依赖
   *  userData.objectId（RuntimeObjectMap.findId 沿父链上溯的唯一入口）——
   *  与 entries[0] 恒 1:1，随每次形态收敛同步刷新。
   */
  private activateSingle(pool: AssetPool, source: InstanceSource): void {
    if (pool.instancedMesh) {
      pool.instancedMesh.removeFromParent();
      pool.instancedMesh.dispose(); // 释放实例矩阵缓冲（池专属资源）
      pool.instancedMesh = null;
      pool.capacity = 0;
    }
    if (!pool.singleMesh) {
      pool.singleMesh = new THREE.Mesh(source.geometry, source.material);
      pool.singleMesh.castShadow = true;
      pool.singleMesh.receiveShadow = true;
      // T009.5：源带影 pass 深度材质则挂（复用对象创建点挂一次——源不变于池生命周期）
      if (source.customDepthMaterial !== undefined) {
        pool.singleMesh.customDepthMaterial = source.customDepthMaterial;
      }
    }
    if (pool.singleMesh.userData.objectId !== pool.entries[0].id) {
      pool.singleMesh.userData.objectId = pool.entries[0].id;
    }
    if (pool.singleMesh.parent !== this.root) this.root.add(pool.singleMesh);
    this.applyEntryToObject(pool.singleMesh, pool.entries[0]);
  }

  /** 实例化路径：确保 InstancedMesh 在场（容量不足换矩阵缓冲，Mesh 对象不重建） */
  private activateInstanced(pool: AssetPool, source: InstanceSource): void {
    if (pool.singleMesh && pool.singleMesh.parent !== null) {
      pool.singleMesh.removeFromParent();
      delete pool.singleMesh.userData.objectId; // 离开单例：清反查标记（残留 id 防悬挂）
    }
    const count = pool.entries.length;
    let mesh = pool.instancedMesh;
    if (!mesh) {
      pool.capacity = capacityFor(count);
      mesh = new THREE.InstancedMesh(source.geometry, source.material, pool.capacity);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      // T009.5：源带影 pass 深度材质则挂（Mesh 对象跨扩容复用，创建点挂一次即可）
      if (source.customDepthMaterial !== undefined) mesh.customDepthMaterial = source.customDepthMaterial;
      pool.instancedMesh = mesh;
      this.root.add(mesh);
    } else if (pool.capacity < count) {
      // 扩容：重建矩阵缓冲（保留同一 Mesh 对象，渲染引用稳定）
      pool.capacity = capacityFor(count);
      const attribute = new THREE.InstancedBufferAttribute(
        new Float32Array(pool.capacity * 16),
        16,
      );
      attribute.setUsage(THREE.DynamicDrawUsage);
      mesh.instanceMatrix = attribute;
      // T002.3：instanceColor 同容量重建（three setColorAt 惰性建缓冲按旧 instanceMatrix
      // 容量定尺寸——不同步重建则新槽位写越界静默丢失；旧值在重建内保留，随后全量重写）
      if (mesh.instanceColor) this.ensureColorBuffer(mesh, pool.capacity);
      // T008.1：aSeed 几何绑定的实例缓冲同规则重建（容量对齐 instanceMatrix）
      if (mesh.geometry.hasAttribute(ASEED_ATTRIBUTE)) this.ensureSeedBuffer(mesh, pool.capacity);
    }
    mesh.count = count;
    this.writeAllSlots(pool);
  }

  /** 全量重写槽位矩阵（成员变化路径）：值 = 各实例登记矩阵（culled 叠加零缩放）；
   *  颜色/aSeed 随槽位同步重写 */
  private writeAllSlots(pool: AssetPool): void {
    const mesh = pool.instancedMesh!;
    for (let i = 0; i < pool.entries.length; i++) {
      mesh.setMatrixAt(i, this.slotMatrixOf(pool.entries[i]!));
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    // T002.3/T008.1：成员增删/全量路径颜色与 aSeed 随槽位迁移同步重写（split 态两网格由 ensureSplit 自理）
    if (!pool.split) this.writeSideInstanceAttrs(mesh, pool.entries);
  }

  /** 确保颜色缓冲存在且容量对齐 instanceMatrix 容量（不足则重建，旧值全量保留、余槽白） */
  private ensureColorBuffer(
    mesh: THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>,
    capacity: number,
  ): void {
    const existing = mesh.instanceColor;
    if (existing && existing.count >= capacity) return;
    const next = new THREE.InstancedBufferAttribute(
      new Float32Array(capacity * 3).fill(1),
      3,
    );
    next.setUsage(THREE.DynamicDrawUsage);
    if (existing) next.array.set(existing.array); // 旧值拷贝（新数组更长，新槽缺省白）
    mesh.instanceColor = next;
  }

  /**
   * 确保 aSeed 实例缓冲存在且容量对齐（不足则重建，旧值全量保留、余槽 0.5 中性值）。
   * 缓冲挂在桶几何上（three 自定义实例属性只有 geometry 通道；同 sourceKey 一桶，
   * 不与其他桶串扰）；资源随几何由源端统一释放，池不 dispose。
   */
  private ensureSeedBuffer(
    mesh: THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>,
    capacity: number,
  ): THREE.InstancedBufferAttribute {
    const existing = mesh.geometry.getAttribute(ASEED_ATTRIBUTE) as
      | THREE.InstancedBufferAttribute
      | undefined;
    if (existing && existing.isInstancedBufferAttribute && existing.count >= capacity) {
      return existing;
    }
    const next = new THREE.InstancedBufferAttribute(
      new Float32Array(capacity).fill(ASEED_NULL_VALUE),
      1,
    );
    next.setUsage(THREE.DynamicDrawUsage);
    if (existing && existing.isInstancedBufferAttribute) {
      next.array.set(existing.array); // 旧值拷贝（新数组更长，新槽缺省中性值）
    }
    mesh.geometry.setAttribute(ASEED_ATTRIBUTE, next);
    return next;
  }

  /**
   * 一侧网格全量重写逐实例属性（颜色 + aSeed；split 两侧 / 非分裂全量共用——
   * T008.1 归并颜色与 seed 为单一重写路径）。
   *  从未建对应缓冲且该侧无任何非恒等值 → 零开销跳过（无色无 seed 的池——
   *  GLB/旧资产——行为零变化）。aSeed 为 geometry 绑定、split 两网格共享同一缓冲：
   *  islands 分遍用 override 材质不消费 aSeed，split 期间值惰性，拆除后
   *  writeAllSlots 按 entries 序全量重写恢复（类头文档化边界）。
   */
  private writeSideInstanceAttrs(
    mesh: THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>,
    entries: readonly PoolEntry[],
  ): void {
    const colorIdle = mesh.instanceColor === null && !entries.some((entry) => entry.color !== null);
    const seedIdle =
      !mesh.geometry.hasAttribute(ASEED_ATTRIBUTE) && !entries.some((entry) => entry.seed !== null);
    if (colorIdle && seedIdle) return;
    if (!colorIdle) this.ensureColorBuffer(mesh, mesh.instanceMatrix.count);
    let seedBuffer: THREE.InstancedBufferAttribute | null = null;
    if (!seedIdle) seedBuffer = this.ensureSeedBuffer(mesh, mesh.instanceMatrix.count);
    for (let i = 0; i < entries.length; i++) {
      if (!colorIdle) mesh.setColorAt(i, entries[i].color ?? WHITE);
      if (seedBuffer) seedBuffer.array[i] = seedUnitOf(entries[i].seed);
    }
    if (!colorIdle) mesh.instanceColor!.needsUpdate = true;
    if (seedBuffer) seedBuffer.needsUpdate = true;
  }

  /** 单实例逐实例属性定位（split 态按归类路由到对应网格与侧内槽位；无 InstancedMesh → null） */
  private instanceAttrTargetOf(
    pool: AssetPool,
    id: ID,
  ): {
    mesh: THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
    index: number;
    entry: PoolEntry;
  } | null {
    if (!pool.instancedMesh) return null;
    const split = pool.split;
    if (split) {
      const bright = split.brightSlotOf.get(id);
      if (bright !== undefined) {
        return { mesh: split.highlightMesh, index: bright, entry: split.brightEntries[bright] };
      }
      const dim = split.dimSlotOf.get(id);
      if (dim !== undefined) {
        return { mesh: pool.instancedMesh, index: dim, entry: split.dimEntries[dim] };
      }
      return null;
    }
    const slot = pool.slotOf.get(id);
    return slot === undefined
      ? null
      : { mesh: pool.instancedMesh, index: slot, entry: pool.entries[slot] };
  }

  /**
   * 单实例逐实例属性槽写入（setColor/clearColor/attach 同槽刷新共用）：
   * 目标网格槽位 + 缓冲对齐；未建的恒等通道跳过（无色无 seed 池零开销，
   * 缓冲存在则该槽写恒等值——与其他槽语义一致）。
   */
  private writeEntryInstanceAttrs(pool: AssetPool, id: ID): void {
    const target = this.instanceAttrTargetOf(pool, id);
    if (!target) return;
    const { mesh, index, entry } = target;
    if (entry.color !== null || mesh.instanceColor !== null) {
      this.ensureColorBuffer(mesh, mesh.instanceMatrix.count);
      mesh.setColorAt(index, entry.color ?? WHITE);
      mesh.instanceColor!.needsUpdate = true;
    }
    if (entry.seed !== null || mesh.geometry.hasAttribute(ASEED_ATTRIBUTE)) {
      const buffer = this.ensureSeedBuffer(mesh, mesh.instanceMatrix.count);
      buffer.array[index] = seedUnitOf(entry.seed);
      buffer.needsUpdate = true;
    }
  }

  /** 单实例写入（attach 幂等 / update 共用）：矩阵 + 槽位 + 锚点 + 形态分派 */
  private writeEntry(pool: AssetPool, id: ID, transform: Transform, visible: boolean): void {
    const slot = pool.slotOf.get(id);
    if (slot === undefined) return;
    const entry = pool.entries[slot];
    entry.visible = visible;
    composeMatrixInto(entry.matrix, transform, visible);
    const anchor = pool.anchors.get(id);
    if (anchor) applyTransformTo(anchor, transform, visible);
    const split = pool.split;
    if (split) {
      // 混合拆分态：按归类写入对应网格槽（槽位 = 分组侧内顺序，非 entries 序）
      const mesh = split.brightSlotOf.has(id) ? split.highlightMesh : pool.instancedMesh;
      const target = split.brightSlotOf.has(id)
        ? split.brightSlotOf.get(id)!
        : split.dimSlotOf.get(id);
      if (mesh && target !== undefined) {
        mesh.setMatrixAt(target, this.slotMatrixOf(entry));
        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();
      }
      return;
    }
    const mesh = pool.instancedMesh;
    if (mesh) {
      mesh.setMatrixAt(slot, this.slotMatrixOf(entry)); // 只写对应槽（culled 叠加零缩放）
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    } else if (pool.singleMesh && pool.entries.length === 1) {
      pool.singleMesh.userData.objectId = entry.id; // 单例反查随写随新
      this.applyEntryToObject(pool.singleMesh, entry);
    }
    this.refreshSubmitVisibility(pool); // T006.4：visible 翻转可能翻转整桶提交态
  }

  /** 登记矩阵 → Object3D（单例 Mesh 用；锚点走 applyTransformTo 精确欧拉角；
   *  culled 单例 = visible=false——同隐藏实例语义，矩阵真值不动） */
  private applyEntryToObject(target: THREE.Object3D, entry: PoolEntry): void {
    entry.matrix.decompose(_position, _quaternion, _scale);
    target.position.copy(_position);
    target.quaternion.copy(_quaternion);
    target.scale.copy(_scale);
    target.visible = entry.visible && !entry.culled;
  }

  /** 锚点补挂共享 Mesh 子节点（CameraController.focusObjects 的包围盒来源；不进
   *  场景、无影 pass 参与——故不设投影与 customDepthMaterial，T009.5 任务边界排除） */
  private decorateAnchor(pool: AssetPool, anchor: THREE.Object3D): void {
    if (!pool.source || anchor.children.length > 0) return;
    anchor.add(new THREE.Mesh(pool.source.geometry, pool.source.material));
  }

  /** 拆池：移出渲染根并释放池专属资源（共享 geometry/material 不 dispose） */
  private teardownPool(pool: AssetPool): void {
    if (pool.instancedMesh) {
      pool.instancedMesh.removeFromParent();
      pool.instancedMesh.dispose();
      pool.instancedMesh = null;
      pool.capacity = 0;
    }
    if (pool.singleMesh) {
      pool.singleMesh.removeFromParent();
      delete pool.singleMesh.userData.objectId; // 拆池清反查标记
      pool.singleMesh = null;
    }
    this.teardownSplit(pool); // T8.4：混合拆分的亮网格一并移除释放
    // 注：aSeed 缓冲挂在共享几何上，随几何由源端统一释放（池不 dispose 共享资源——类头边界）
    this.pools.delete(pool.key);
  }
}
