/**
 * domain/lod/lodEvaluation —— LOD 选档评估器纯函数（T006.1，D27.5/D27.6；T021.2 表示链
 * 选档改写，D41 §四）。
 *
 * 统一度量 m = 「视口高归一化视距」（lod-spec §4.1/§4.2，D27.2；T006 语义不变，公式逐
 * 操作符不变）：
 * - 透视：m = (d / r) · tan(fovY / 2)，其中 d = |cameraPosition − point|，
 *   r = radius × scale（有效包围球半径，代表 scale 参与归一化——大实例更晚降档）；
 * - 正交：m = orthoHeight / (2 · r)（正交退化 = 几何尺寸 / 正交视高，§4.2）；
 * - 语义锚点：m = 1 恰好资产直径占满视口高度；m 越小资产屏幕占比越大（越近）。
 *   透视式与 §4.1 主口径 d / r 只差 tan(fovY / 2) 折算常数（fov = 90° 时严格相等），
 *   使阈值带与分辨率 / DPR / 视口 / fov 解耦，且透视 / 正交两相机口径同一单调语义、
 *   阈值带连续可复用（§4.2）。
 *
 * screenFraction 解释口径（T021.2，D41 §4.1）：screenFraction（资产直径 / 视口高度）
 * = **1 / m**——调试与验收的统一解释口径，不作选档输入（选档只消费 m；像素口径仅
 * 验收报表，禁止进选档）。锚点：m = 1 ↔ screenFraction 100%；候选阈值 6 / 16 / 60
 * ↔ 屏占比 16.7% / 6.25% / 1.67%（lodPolicy legacy 对照）。
 *
 * 职责：纯数据入（视图 + 主体 + 有效表示链 + 迟滞参考）→ 目标表示 / 提交终态出。
 *      评估器无状态、选档是每帧派生态（D27.6）：结果不缓存进持久状态、不进 Scene /
 *      Command，迟滞参考 current 由调用方持有并逐帧传入。
 * 输入驱动（T021.2，D41 §三.2 能力声明驱动）：declaredLevels 三档声明输入切换为
 *      representations 有效表示链输入——消费 021.1 的 effectiveRepresentationChain
 *      （representations 声明优先、levels 派生回退语义保持），调用方（两链接线）按资产
 *      缓存链一次、帧路径零重复归一，评估器本身不感知声明面字段。
 * 边界：零 THREE（check:layers 强制）。frustum cull 不在本评估器职责——帧内时序 =
 *      块剔除 → frustum cull → 选档，本评估器的 culled 仅「超远距」口径（lod-spec §6）；
 *      散布 / 放置两链共享同一选档语义（D27.5），散布链粒度 region × chunk × asset、
 *      代表口径（块最近点 / 桶内 max scale，D41 §4.4 保守偏高档）由接线组织成 subject，
 *      评估器不感知 chunk。
 */
import type { Vec3 } from '../../core/types';
import { LOD_THRESHOLDS } from './lodPolicy';
import type { LodThresholds } from './lodPolicy';
import { REPRESENTATION_ORDER } from './representation';
import type { LodSelectionOutcome, RuntimeRepresentation } from './representation';

/**
 * 透视视图口径（fovY 弧度——编辑器内部惯例，见 core/types Euler 弧度注释）
 */
export interface PerspectiveLodView {
  kind: 'perspective';
  cameraPosition: Vec3;
  fovY: number;
}

/** 正交视图口径：orthoHeight = 正交视高（世界单位）；正交无距离概念、不消费相机位姿（§4.2） */
export interface OrthographicLodView {
  kind: 'orthographic';
  orthoHeight: number;
}

export type LodView = PerspectiveLodView | OrthographicLodView;

/** 评估主体：代表点 / 包围球 / 代表 scale 的具体取值口径由接线组织（见各字段注） */
export interface LodSubject {
  /** 代表点：放置链 = 资产包围球中心（per-object 粒度，D41 §4.4）；散布链 = 块 AABB
   *  最近点（region × chunk × asset 粒度共享块盒代表点，§4.3 候选保守策略——由
   *  runtime 接线组织，评估器不感知 chunk） */
  point: Vec3;
  /** 基础包围球半径（源几何，未乘 scale） */
  radius: number;
  /** 代表 scale：放置链 = 对象 scale；散布链 = 桶内最大实例 scale（保守偏高档 §4.4） */
  scale: number;
}

export interface LodEvaluationInput {
  view: LodView;
  subject: LodSubject;
  /**
   * 已声明有效表示链（T021.2 表示能力驱动）：effectiveRepresentationChain 产物
   * （representations 声明优先、levels 派生回退——021.1 契约；调用方按资产缓存一次，
   * 帧路径零重复归一）。缺省/空 = ['high']（lod-spec §2.2 缺省单档语义）。
   */
  representations?: readonly RuntimeRepresentation[];
  /** 当前展示档位（hysteresis 参考，由调用方持有——评估器本身无状态 D27.6）；
   *  缺省 = 无迟滞参考，按名义档起步 */
  current?: LodSelectionOutcome;
  /** 缺省 LOD_THRESHOLDS（候选值，021.8 重锁） */
  thresholds?: LodThresholds;
  /** LOD 总开关（本层定义、接线消费）：false = 目标恒 resolveDeclaredRepresentation('high')
   *  （经跳档映射，见 evaluateLodRepresentation 注），culled 一并旁路——回退对比与兜底
   *  语义（D27.13 对照组） */
  lodEnabled?: boolean;
}

/**
 * 表示序数（跳档与迟滞方向的比较基 = REPRESENTATION_ORDER 固定序，T021.2 泛化）：
 * high=0 → mid=1 → low=2 → canopy=3，向远端方向单调递增（「更低档」= 序数更大的
 * 更远表示——保守省面方向的语义基）。
 */
const REPRESENTATION_ORDINAL: Record<RuntimeRepresentation, number> = {
  high: 0,
  mid: 1,
  low: 2,
  canopy: 3,
};

/**
 * 调度判定序数（T021.1 类型迁移；T021.2 起对表示链生效）：表示按 REPRESENTATION_ORDER
 * 固定序；culled 视为最远端（固定序之后）。高/中/低/canopy/culled 相对序数关系与
 * T021.1 迁移期一致。
 */
function representationOrdinal(rep: LodSelectionOutcome): number {
  if (rep === 'culled') return REPRESENTATION_ORDER.length;
  const index = REPRESENTATION_ORDER.indexOf(rep);
  return index >= 0 ? index : 0; // 防御（类型完备；运行时 rep 恒为四值域成员）
}

/**
 * 统一度量 m（视口高归一化视距，定义与依据见模块头注）：正交 / 透视两口径的落点，
 * 独立可测。输入防御（调用方 bug 早暴露）：radius × scale ≤ 0 抛 Error；
 * 透视口径 fovY ≤ 0 或 ≥ π 抛 Error。
 */
export function normalizedViewDistance(view: LodView, subject: LodSubject): number {
  const r = subject.radius * subject.scale;
  if (r <= 0) {
    throw new Error(
      `LOD 有效包围球半径必须为正（radius × scale > 0），收到 ${subject.radius} × ${subject.scale}`,
    );
  }
  if (view.kind === 'perspective') {
    if (view.fovY <= 0 || view.fovY >= Math.PI) {
      throw new Error(`透视 fovY 必须落在开区间 (0, π)（弧度），收到 ${view.fovY}`);
    }
    const dx = view.cameraPosition.x - subject.point.x;
    const dy = view.cameraPosition.y - subject.point.y;
    const dz = view.cameraPosition.z - subject.point.z;
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return (d / r) * Math.tan(view.fovY / 2);
  }
  return view.orthoHeight / (2 * r);
}

/**
 * 不完整链跳档（T021.2 按 REPRESENTATION_ORDER 泛化到表示链，旧 resolveDeclaredLevel
 * 退役）：target 已声明 → 原样；未声明 → 按固定序取序数最近的已声明表示，两侧等距取
 * 更远端（序数更大——tie-break = 保守省面，「预算内档位保守 / 远处降档优先」治理原则，
 * lod-spec §1）；declared 空 → 'high'（缺省单档语义 §2.2）。
 * 典型承接：legacy 资产（levels 派生 [high, mid, low]）在 canopy 名义区
 * (midToCanopy, canopyToCulled] 的名义档 canopy 跳档到 low（|3−2| = 1 最近）——
 * 初值下与旧链 midToLow/lowToCulled 三档语义逐位一致。
 */
export function resolveDeclaredRepresentation(
  target: RuntimeRepresentation,
  declared: readonly RuntimeRepresentation[],
): RuntimeRepresentation {
  if (declared.length === 0) return 'high';
  if (declared.includes(target)) return target;
  const targetOrdinal = REPRESENTATION_ORDINAL[target];
  let best = declared[0]!;
  for (const rep of declared.slice(1)) {
    const bestDelta = Math.abs(REPRESENTATION_ORDINAL[best] - targetOrdinal);
    const delta = Math.abs(REPRESENTATION_ORDINAL[rep] - targetOrdinal);
    if (
      delta < bestDelta ||
      (delta === bestDelta && REPRESENTATION_ORDINAL[rep] > REPRESENTATION_ORDINAL[best])
    ) {
      best = rep;
    }
  }
  return best;
}

/**
 * current 的名义上界（升档迟滞参照线 b）。名义区间链 = high | mid | canopy | culled
 * （三边界四名义区，D41 §4.2 新链）：mid→highToMid、canopy→midToCanopy、
 * culled→canopyToCulled。low 非名义档（新链无 low 名义区间）——其迟滞参照线取
 * midToCanopy：legacy [high, mid, low] 资产经跳档映射承接 canopy 名义区，名义带上沿
 * 与 canopy 同线（初值 16 = legacy midToLow 逐位继承，迁移期行为逐位一致）。
 * high 无上界——升档分支要求 resolved 序数严格小于 current，current = 'high' 时不可能
 * 进入该分支，Infinity 仅为类型完备兜底（不可达路径）。
 */
function nominalUpperBoundOf(rep: LodSelectionOutcome, thresholds: LodThresholds): number {
  switch (rep) {
    case 'high':
      return Number.POSITIVE_INFINITY;
    case 'mid':
      return thresholds.highToMid;
    case 'low':
      return thresholds.midToCanopy;
    case 'canopy':
      return thresholds.midToCanopy;
    case 'culled':
      return thresholds.canopyToCulled;
  }
}

/**
 * 主评估器：统一度量 m → 名义区间 → 跳档映射（culled 除外）→ 单边迟滞。
 * 名义区间（T021.2 canopy 落位）：三边界划分四名义区 high / mid / canopy / culled——
 * canopy 名义区间 (midToCanopy, canopyToCulled] 自本任务起运行时可达（声明 canopy 能力
 * 的资产）；'low' 在新链无名义区间，仅经跳档映射承接 canopy 名义区（legacy 资产）。
 * 迟滞方向依据「远处降档优先」治理约束（lod-spec §1）：降档（远离）过名义线立即执行；
 * 升档（靠近）需越过 current 名义上界 × (1 − hysteresisBand) 才换档，
 * 升档一步跨多档时直接到 resolved（不逐档爬）。
 * 纯函数：同输入逐位同输出；迟滞参考 current 由调用方传入（评估器无状态，D27.6）。
 */
export function evaluateLodRepresentation(input: LodEvaluationInput): LodSelectionOutcome {
  const declared = input.representations ?? [];
  // LOD 总开关关 = 目标恒 resolveDeclaredRepresentation('high', ...)：正常资产即 'high'；
  // culled 一并旁路（超远也不裁）。取舍记档：未声明 high 的奇异资产回最近已声明表示而非
  // 升造 high——保持「Runtime 只请求已声明表示」纪律（lod-spec §6；回落是防御面不是
  // 协议依赖，§2.3）。
  if (input.lodEnabled === false) {
    return resolveDeclaredRepresentation('high', declared);
  }
  const thresholds = input.thresholds ?? LOD_THRESHOLDS;
  const m = normalizedViewDistance(input.view, input.subject);

  // 名义区间档（边界含下侧：m ≤ 边界归较近档）。名义产出域 = 四表示 + culled：
  // 'low' 无名义区间（新链三边界 → high / mid / canopy / culled 四区），low 的到达
  // 路径只有跳档映射（见 resolveDeclaredRepresentation 注）——运行时产出域含 low。
  let nominal: LodSelectionOutcome;
  if (m <= thresholds.highToMid) nominal = 'high';
  else if (m <= thresholds.midToCanopy) nominal = 'mid';
  else if (m <= thresholds.canopyToCulled) nominal = 'canopy';
  else nominal = 'culled';

  // culled 不跳档——任何资产（含单档）都可被超远裁剪；表示才过跳档映射
  const resolved: LodSelectionOutcome =
    nominal === 'culled' ? 'culled' : resolveDeclaredRepresentation(nominal, declared);

  const current = input.current;
  if (current === undefined) return resolved; // 无迟滞参考 = 名义档起步
  const currentOrdinal = representationOrdinal(current);
  const resolvedOrdinal = representationOrdinal(resolved);
  if (resolvedOrdinal === currentOrdinal) return current;
  if (resolvedOrdinal > currentOrdinal) return resolved; // 降档方向：过名义线立即执行
  // 升档方向：单边迟滞——m 越过 current 名义上界 × (1 − hysteresisBand) 才换档，带内保持
  const upperBound = nominalUpperBoundOf(current, thresholds);
  return m < upperBound * (1 - thresholds.hysteresisBand) ? resolved : current;
}
