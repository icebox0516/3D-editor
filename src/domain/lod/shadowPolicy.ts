/**
 * domain/lod/shadowPolicy —— Runtime 阴影策略常量与判定纯函数（T021.5，D41 §七）。
 *
 * 职责：Shadow Policy 三字段（cast / receive / depth）按表示驱动的策略层——初始策略
 *      表 + 查询函数（入参宽化到 LodSelectionOutcome，culled → off）+ 过渡期 cast
 *      判定原语（TransitionCommit.shadowRepresentation 的消费规则）。形态学沿
 *      batchPolicy 先例：const 表 + 查询函数 + 可注入覆盖（测试 / 021.8 A/B 通道）。
 *      落点理由同 LOD_THRESHOLDS / BATCH_POLICY 族：阴影策略与选档一样全资产统一、
 *      禁止逐资产 Profile 字段（D27.12 无消费者字段全禁）；落 domain 纯数据（零 THREE）
 *      使表值与判定规则可 node 直测（「一次锁全量」先例沿）。
 * 消费方：InstancedAssetPool / ScatterChunkManager 两链建网格点与过渡帧路径
 *      （cast / receive / customDepthMaterial 挂载语义在 runtime 执行——「语义在
 *      domain、执行在 runtime」§十三分层惯例），lodDistribution 计数经两链喂入。
 *
 * 初始策略表（D41 §七 + T021.5 主代理裁定；**全部表值 021.8 A/B 可调**——mid depth
 *      与 canopy receive 是点名复核位，改值经覆盖注入或重锁本表并记档）：
 *      high   = { cast: true,  receive: true,  depth: 'full' }（现状——High 全开沿承）
 *      mid    = { cast: true,  receive: true,  depth: 'full' }（simplified 为 021.8
 *               A/B 候选——表值可调即可）
 *      low    = { cast: true,  receive: true,  depth: 'simplified' }
 *      canopy = { cast: true,  receive: false, depth: 'simplified' }（receive=false
 *               是真实行为变化：远景树冠采样阴影成本高、视觉贡献小——021.8 A/B 复核位）
 *      culled（提交终态）= off = { cast: false, receive: false, depth: 'none' }
 *               （终态非表示 §三.1，不进 byRepresentation 表——查询函数宽化入参映射）
 *
 * depth 三档的运行时映射语义（customDepthMaterial 挂载语义，执行归两链 runtime——
 *      接线原语 shadowDepthMaterialOf 在 InstancedAssetPool，两链共用）：
 *      - 'full'：挂 source.customDepthMaterial（现状 SDF 叶影裁切通道；undefined
 *        不赋值保持 three 缺省——现状契约不变）；
 *      - 'simplified'：**冠层轮廓级深度**（§七原话「禁完整叶片 SDF」）——canopy →
 *        挂 source.customDepthMaterial（canopy 源的深度材质本身就是 simplified 构造：
 *        无 SDF / 无 alphaTest / 几何本体 + xz 风摆，broadleafCanopyMaterials T021.6
 *        交付）；low → **不挂**（即便源提供了 LOW SDF 深度材质也跳过——three 缺省
 *        深度材质 = 实心几何深度，零 SDF 计算；静态影取舍沿现状：现有 SDF 深度材质
 *        本就不含风动位移）；
 *      - 'none'：不挂（cast=false 影 pass 不进）。
 *      语义一句话：simplified = 冠层轮廓级深度——canopy 靠专属深度材质达成，low 靠
 *      不挂 SDF 材质达成。
 *
 * 过渡期 cast 判定（消费 021.3 钩子，§5.4 中点切换——isShadowCasterFor 原语）：
 *      mesh(rep) 的 castShadow ⇔ policy(rep).cast ∧ rep === commit.shadowRepresentation。
 *      稳态时 shadowRepresentation === current 天然成立；dither 双表示共存期恰一侧
 *      cast（中点前 current 侧、中点后 target 侧——不做双 Shadow 交叉渐变）；fade-out
 *      退场期 shadowRepresentation 恒 current，cast 持续到 culled（终态零提交由 runtime
 *      的 visible/零缩放机制管辖 + cast/receive 一并置 false 的 belt-and-braces）。
 *      **连续派生（每帧幂等），不消费 midpointCrossed 边沿事件**（该字段留诊断面——
 *      无状态推导优先，记档理由）。receive 为静态按表示设置（建网格点一次设置，不随
 *      过渡翻转）。共享桶的整桶表达 = 成员 OR 语义（mesh 级 castShadow 只能整桶——
 *      执行层记档，见两链 refresh 注）。
 *
 * 生产足迹记档（T021.5，测试同文记档）：
 *      - 本任务生产可见行为变化**仅一项**：low 表示的影从 SDF 叶形裁切变为实心壳卡影
 *        （更致密的远景影）——D41 已裁定初始策略（Low=simplified），与 canopy
 *        receive=false 同组记档为 021.8 A/B 复核位；
 *      - canopy / midpoint 切换路径生产不可达（真实资产未声明 canopy 能力、canopy 源
 *        路由归 021.7）→ 测试用假想声明资产验证执行路径（021.3 先例）；
 *      - streetlamp / GLB 零变化（恒 high=full；streetlamp low 档 source 本就无
 *        customDepthMaterial，不挂行为逐位同现状）。
 *
 * 边界：纯数据 + 纯函数，零 THREE（check:layers 强制）；冻结域不动（Shadow Camera
 *      2048²/±160/near 1/far 400/bias −0.0004、T018 环境、Sun Direction，§七）；
 *      不进资产 Profile、不进 Scene/Command；本模块只出 depth 枚举语义——材质映射
 *      执行在 runtime（材质类型是 THREE 概念）。
 */
import type { LodSelectionOutcome, RuntimeRepresentation, ShadowPolicy } from './representation';

/** 阴影策略控制面（按表示三字段表——覆盖注入形态沿 batchPolicy 先例） */
export type ShadowPolicyTable = Record<RuntimeRepresentation, ShadowPolicy>;

/**
 * Runtime 全局阴影策略初始表（D41 §七 + T021.5 裁定；表值语义与 021.8 复核位见模块
 * 头注。「一次锁全量」：数值变更须记档并连带更新 shadowPolicy 测试断言）。
 */
export const SHADOW_POLICY: ShadowPolicyTable = {
  high: { cast: true, receive: true, depth: 'full' },
  mid: { cast: true, receive: true, depth: 'full' },
  low: { cast: true, receive: true, depth: 'simplified' },
  canopy: { cast: true, receive: false, depth: 'simplified' },
};

/**
 * culled 提交终态策略（§七 Cull = off）：cast/receive false + depth none。终态非表示
 * （D41 §三.1）不进 byRepresentation 表——经查询函数的宽化入参（LodSelectionOutcome）
 * 映射到达。运行时终态零提交由既有 visible/零缩放机制管辖，本值是声明面对齐 +
 * belt-and-braces（cast/receive 一并置 false）+ shadowCasterInstances 计数语义自洽。
 */
export const CULLED_SHADOW_POLICY: ShadowPolicy = { cast: false, receive: false, depth: 'none' };

/** JS 侧手写脏表防御（batchPolicy 先例）：结构完备的表项才放行 */
function isCleanShadowPolicy(entry: unknown): entry is ShadowPolicy {
  if (typeof entry !== 'object' || entry === null) return false;
  const candidate = entry as Partial<ShadowPolicy>;
  return (
    typeof candidate.cast === 'boolean' &&
    typeof candidate.receive === 'boolean' &&
    (candidate.depth === 'full' || candidate.depth === 'simplified' || candidate.depth === 'none')
  );
}

/**
 * 阴影策略查询（纯函数）：调度产出（LodSelectionOutcome——四表示或 'culled' 提交终态）
 * → 三字段策略。'culled' → CULLED_SHADOW_POLICY（off）；表示 → 表值（零克隆，同对象
 * 引用返回）。table 可注入（测试 / 021.8 A/B 通道——如 mid depth 改 simplified 的
 * A/B 对照），缺省 SHADOW_POLICY。JS 侧手写脏表（缺键 / 非布尔 / 非法 depth）防御
 * 收 off（保守方向，同 isBatchMergeAllowed 收 false 先例——脏表不产生半吊子影行为）。
 */
export function shadowPolicyOf(
  outcome: LodSelectionOutcome,
  table: ShadowPolicyTable = SHADOW_POLICY,
): ShadowPolicy {
  if (outcome === 'culled') return CULLED_SHADOW_POLICY;
  const entry = table[outcome];
  return isCleanShadowPolicy(entry) ? entry : CULLED_SHADOW_POLICY;
}

/**
 * 过渡期 cast 判定原语（统一规则的 domain 表达，§5.4 中点切换；执行在两链 runtime）：
 * 桶/网格表示 rep 是否投影 ⇔ policy(rep).cast ∧ rep === shadowRepresentation。
 * shadowRepresentation = TransitionCommit.shadowRepresentation（021.3 钩子，连续派生
 * ——每帧幂等，不消费 midpointCrossed 边沿）：稳态 = current；dither 中点前 current
 * 侧 / 中点后 target 侧（恰一侧 cast）；fade-out 退场恒 current 侧（cast 持续到
 * culled——终态归 runtime 零提交机制，本函数不感知提交态）。共享桶整桶表达取成员
 * OR（mesh 级 castShadow 只能整桶——执行层职责）。
 */
export function isShadowCasterFor(
  representation: RuntimeRepresentation,
  shadowRepresentation: RuntimeRepresentation,
  table: ShadowPolicyTable = SHADOW_POLICY,
): boolean {
  return shadowPolicyOf(representation, table).cast && representation === shadowRepresentation;
}
