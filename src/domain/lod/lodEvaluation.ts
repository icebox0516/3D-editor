/**
 * domain/lod/lodEvaluation —— LOD 选档评估器纯函数（T006.1，D27.5/D27.6）。
 *
 * 统一度量 m = 「视口高归一化视距」（lod-spec §4.1/§4.2，D27.2）：
 * - 透视：m = (d / r) · tan(fovY / 2)，其中 d = |cameraPosition − point|，
 *   r = radius × scale（有效包围球半径，代表 scale 参与归一化——大实例更晚降档）；
 * - 正交：m = orthoHeight / (2 · r)（正交退化 = 几何尺寸 / 正交视高，§4.2）；
 * - 语义锚点：m = 1 恰好资产直径占满视口高度；m 越小资产屏幕占比越大（越近）。
 *   透视式与 §4.1 主口径 d / r 只差 tan(fovY / 2) 折算常数（fov = 90° 时严格相等），
 *   使阈值带与分辨率 / DPR / 视口 / fov 解耦，且透视 / 正交两相机口径同一单调语义、
 *   阈值带连续可复用（§4.2）。
 *
 * 职责：纯数据入（视图 + 主体 + 声明链 + 迟滞参考）→ 目标档位出。评估器无状态、
 *      档位是每帧派生态（D27.6）：结果不缓存进持久状态、不进 Scene / Command，
 *      迟滞参考 current 由调用方持有并逐帧传入。
 * 边界：零 THREE（check:layers 强制）。frustum cull 不在本评估器职责——帧内时序 =
 *      块剔除 → frustum cull → 选档，本评估器的 culled 仅「超远距」口径（lod-spec §6）；
 *      散布 / 放置两链共享同一选档语义（D27.5），chunk 代表口径（块最近点 / 块内 max
 *      scale，§4.3 候选保守策略）由 006.3 Runtime 接线组织成 subject，评估器不感知 chunk。
 */
import type { Vec3 } from '../../core/types';
import type { ProceduralLevel } from '../assets/AssetDescriptor';
import { LOD_THRESHOLDS } from './lodPolicy';
import type { LodThresholds } from './lodPolicy';

/**
 * 展示档位全集（D27.3 本期实装范围 = High / Mid / Low + Culled）：
 * 'culled' 仅超远距调度结果（D27.7 不进 ProceduralLevel 枚举——调度结果非声明档位）。
 */
export type LodRepresentation = ProceduralLevel | 'culled';

/** 透视视图口径（fovY 弧度——编辑器内部惯例，见 core/types Euler 弧度注释） */
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

/** 评估主体：代表点 / 包围球 / 代表 scale 的具体取值口径由 006.3 接线组织（见各字段注） */
export interface LodSubject {
  /** 代表点：放置链 = 资产包围球中心；散布链 = chunk 最近点（§4.3 候选保守策略，
   *  由 006.3 runtime 接线组织，评估器不感知 chunk） */
  point: Vec3;
  /** 基础包围球半径（源几何，未乘 scale） */
  radius: number;
  /** 代表 scale：放置链 = 对象 scale；散布链 = 块内 max（保守偏高档 §4.3） */
  scale: number;
}

export interface LodEvaluationInput {
  view: LodView;
  subject: LodSubject;
  /** 已声明档位；缺省/空 = ['high']（lod-spec §2.2 缺省单档语义） */
  declaredLevels?: ProceduralLevel[];
  /** 当前展示档位（hysteresis 参考，由调用方持有——评估器本身无状态 D27.6）；
   *  缺省 = 无迟滞参考，按名义档起步 */
  current?: LodRepresentation;
  /** 缺省 LOD_THRESHOLDS */
  thresholds?: LodThresholds;
  /** LOD 总开关（本层定义、006.3 消费）：false = 目标恒 'high'（经跳档映射，见
   *  evaluateLodRepresentation 注），culled 一并旁路——回退对比与兜底语义（D27.13 对照组） */
  lodEnabled?: boolean;
}

/** 声明档位序数（跳档与迟滞方向的比较基）：high=0 → low=2，向低档 / 远离方向单调递增 */
const LEVEL_ORDINAL: Record<ProceduralLevel, number> = { high: 0, mid: 1, low: 2 };

/** 展示档位序数：声明档沿用 LEVEL_ORDINAL，culled 视为 3（最远端） */
function representationOrdinal(rep: LodRepresentation): number {
  return rep === 'culled' ? 3 : LEVEL_ORDINAL[rep];
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
 * 不完整链跳档：target 已声明 → 原样；未声明 → 按档位序取序数最近的已声明档，
 * 两侧等距取更低档（tie-break = 保守省面——「预算内档位保守 / 远处降档优先」治理原则，
 * lod-spec §1）；declared 空 → 'high'（缺省单档语义 §2.2）。
 */
export function resolveDeclaredLevel(
  target: ProceduralLevel,
  declared: ProceduralLevel[],
): ProceduralLevel {
  if (declared.length === 0) return 'high';
  if (declared.includes(target)) return target;
  const targetOrdinal = LEVEL_ORDINAL[target];
  let best = declared[0];
  for (const level of declared.slice(1)) {
    const bestDelta = Math.abs(LEVEL_ORDINAL[best] - targetOrdinal);
    const delta = Math.abs(LEVEL_ORDINAL[level] - targetOrdinal);
    if (delta < bestDelta || (delta === bestDelta && LEVEL_ORDINAL[level] > LEVEL_ORDINAL[best])) {
      best = level;
    }
  }
  return best;
}

/**
 * current 档的名义上界（升档迟滞参照线 b）：mid→highToMid、low→midToLow、culled→lowToCulled。
 * high 无上界——升档分支要求 resolved 序数严格小于 current，current = 'high' 时不可能进入
 * 该分支，Infinity 仅为类型完备兜底（不可达路径）。
 */
function nominalUpperBoundOf(rep: LodRepresentation, thresholds: LodThresholds): number {
  switch (rep) {
    case 'high':
      return Number.POSITIVE_INFINITY;
    case 'mid':
      return thresholds.highToMid;
    case 'low':
      return thresholds.midToLow;
    case 'culled':
      return thresholds.lowToCulled;
  }
}

/**
 * 主评估器：统一度量 m → 名义区间档 → 跳档映射（culled 除外）→ 单边迟滞。
 * 迟滞方向依据「远处降档优先」治理约束（lod-spec §1）：降档（远离）过名义线立即执行；
 * 升档（靠近）需越过 current 名义上界 × (1 − hysteresisBand) 才换档，
 * 升档一步跨多档时直接到 resolved（不逐档爬）。
 * 纯函数：同输入逐位同输出；迟滞参考 current 由调用方传入（评估器无状态，D27.6）。
 */
export function evaluateLodRepresentation(input: LodEvaluationInput): LodRepresentation {
  const declared = input.declaredLevels ?? [];
  // LOD 总开关关 = 目标恒 resolveDeclaredLevel('high', ...)：正常资产即 'high'；
  // culled 一并旁路（超远也不裁）。取舍记档：未声明 high 的奇异资产回最近已声明档而非
  // 升造 high——保持「Runtime 只请求已声明档」纪律（lod-spec §6；回落是防御面不是协议依赖，§2.3）。
  if (input.lodEnabled === false) {
    return resolveDeclaredLevel('high', declared);
  }
  const thresholds = input.thresholds ?? LOD_THRESHOLDS;
  const m = normalizedViewDistance(input.view, input.subject);

  // 名义区间档（边界含下侧：m ≤ 边界归较近档）
  let nominal: LodRepresentation;
  if (m <= thresholds.highToMid) nominal = 'high';
  else if (m <= thresholds.midToLow) nominal = 'mid';
  else if (m <= thresholds.lowToCulled) nominal = 'low';
  else nominal = 'culled';

  // culled 不跳档——任何资产（含单档）都可被超远裁剪；声明档才过跳档映射
  const resolved: LodRepresentation =
    nominal === 'culled' ? 'culled' : resolveDeclaredLevel(nominal, declared);

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
