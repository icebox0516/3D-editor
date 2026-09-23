/**
 * runtime/procedural/tree/broadleafCanopyProxy —— 阔叶远景冠层代理（T021.6 几何面）
 *
 * 职责：全乔木共用的 BroadleafCanopyProxy 几何生成（representation-runtime.md §6.1
 *      统一实现——禁止每树种自建远景冠层算法）：输入 = assetId + morphSeed（按
 *      provideSource 的 assetId 粒度语义做 seed → slot → profile 路由，与各资产
 *      build 内 profileForSeed 同口径），内部驱动该树种现有几何生成器的 **Low 档**
 *      产出冠层场（ClusterRecord 簇位表，家族共享契约 = ./broadleaf/
 *      broadleafClusterField），再从簇场 + Low 壳卡逻辑派生 Canopy Geometry——
 *      不另建独立树冠生成体系：冠 = 入选簇的 Low 式交叉竖卡（同发射拓扑 / 同
 *      aBend 公式常数 / 同 aLeafRand 簇心散列），干 = 简化树干预柱（Low 树皮地面
 *      采样派生基径，簇心质心定向）。
 * 派生链（确定性，零 rng——簇位表的 rng 消费在树种生成器内完成，本模块纯确定性
 *      后处理，同输入逐位同输出）：
 *      seed → slot → profile → 树种 Low 档构建 → stats.clusters（贴地平移前世界坐标）
 *      + 地面偏移 Δ（叶组最低顶点 − 最低簇心：Low 壳卡底边恒在簇心）+ 干基径
 *      （树皮组近地面顶点的最大水平半径）→ 冠参考系（簇场实测：包络半径 / 簇心
 *      Y 域 / 质心）→ k 中心最远点选取（外缘 + 冠顶/冠底 + ±X/±Z 轴极值七种子）→
 *      双卡壳带 / 单卡体内分层 → 包络钳制的簇半径膨胀 → 卡发射 + 干柱发射 →
 *      minY 精确贴地。
 * 预算（≤500 面 / 树，representation-runtime.md §6.2，锁定账目回写 lod-spec §5.2）：
 *      干柱 = 径向 5 × 3 段 × 2 + 底盖 5 = 35 面；冠卡 = 70 簇双卡 + 86 簇单卡
 *      = 226 卡 × 2 = 452 面；合计恒 487 面（簇位 < 156 时按比例退化，13 树种
 *      8 槽实测簇数 292–822 恒不触发）。对照 Low 档 1586–2858 面再压一个量级。
 * 保留 / 舍弃（§六目标）：保留冠幅 / 轮廓 / 冠层体量 / 绿色覆盖率 / 外密内疏 /
 *      树种级冠形差异（簇场即各树种实际涌现的冠形，入选簇位置保留差异）与基本
 *      阴影体量；不保留远景不可辨枝条 / 单叶细节 / 果串 / 叶片 SDF（果串树种
 *      Low 档本就不发射果，canopy 同口径）。跨度连续性基准 = **Mid 过渡对**
 *      （Mid/Low → Canopy 的 dither 对端，D41 §5.1）：canopy 冠包络 = 簇场球包络
 *      + 0.15，13 树种实测落 Mid 跨度 ±0.7m 带内（High 不作紧基准：花果树种
 *      High 含果序外伸——koelreuteria 自家 Low↔High 差即 1.0m；Low 有窄卡收缩
 *      伪影——salix Low 单窄卡低于真实冠幅 1.0m，canopy 反而更贴 Mid/High）。
 *      垂柳（salix）记档：垂帘条纹质感不进 canopy（Low 单窄卡语义），簇场保留
 *      其宽垂冠剪影；如 021.8 视觉验收判定垂柳身份损失，修正方向 = 卡形态数据
 *      驱动化（簇场推导），非每树种算法。
 * 风动属性契约（§6.3，几何面；材质面归 park-shader-agent 后续 Step）：
 *      - aSeed：Float32 itemSize 1，**全 0**——与散布链 High/Mid 几何缺属性的
 *        GL 缺省 0 逐位一致（档间 0=0 同相成立）；放置链池后续挂逐实例
 *        InstancedBufferAttribute('aSeed') 时 setAttribute 覆盖本顶点属性，
 *        自动获得逐实例相位（D20.4 落地后三档零改动同享，禁第三套相位机制）；
 *      - aBend：Low 壳卡同公式同常数（根边 0.12·hw / 尖边 0.52+0.44·hw，
 *        hw = 簇心在**全簇表** Y 域的归一高度——与 Low 逐位同域）——入选簇的
 *        canopy 卡 aBend 与该簇 Low 壳卡逐位同值（测试锁）；
 *      - aLeafRand：簇心 sin 散列（shellCardRandOf 同式同常数，双卡第二卡
 *        derive 错相）——色相 / 透光 / 快颤相位变奏源，与 Low 共享簇逐位同值；
 *      - aCrownQ：Float32 itemSize 1 ∈ [0,1]，卡所在簇的冠内归一径向深度
 *        （0 = 冠心 / 1 = 冠壳，q³ᵈ = 水平径 + 垂直位联合归一）——**内外明暗
 *        梯度数据通道**（canopy 材质消费：壳亮芯暗）；干柱组恒 0；
 *      - 树种级冠色不进几何属性——归 canopy 材质工厂参数（按 assetId 取各树种
 *        叶色，交付契约见模块尾「几何 → 材质属性契约」）。
 * 组序（D15 免组膨胀，恰 2 组）：干柱 0 / 冠卡 1——与各树种 [皮, 叶] 组序同构，
 *      canopy 材质工厂按 [干柱材质, 冠卡材质] 成套。
 * 边界：本模块只交付几何与属性契约，**不做 Runtime 接线**（RepresentationSourceRouter
 *      / CanopySourceCache / provideSource 签名演化 / 选档消费归 021.7）；canopy
 *      材质与 Canopy Depth Material 工厂归 park-shader-agent（本模块头尾契约即其
 *      输入）；每次调用 new 全部几何（所有权随调用移交调用方，D17）；原点语义与
 *      树种几何一致（minY 精确 0，干柱基底 = 树种树干基部 XZ 原点）。
 *
 * ── 几何 → 材质属性契约（park-shader-agent 输入；canopy 几何顶点属性全集）──
 * | 属性        | itemSize | 语义                                              | 值域 / 来源                     |
 * | position    | 3        | 干柱 + 冠卡世界位（minY=0 贴地）                  | 本模块                          |
 * | normal      | 3        | 卡面法线（水平）/ 干柱环面外向法线                | 本模块                          |
 * | uv          | 2        | 卡 0–1 四边形域（同 Low 壳卡）；干柱 (θ, t)       | 本模块                          |
 * | aSeed       | 1        | 风相位种子——恒 0（= 散布缺属性 GL 缺省 0；放置链 | 恒 0；逐实例 aSeed 由池覆盖挂载 |
 * |             |          | 池可挂 InstancedBufferAttribute 覆盖为逐实例）    |                                |
 * | aBend       | 1        | 风动摆幅权重（Low 壳卡同公式：根 0.12·hw/尖      | 卡根→尖非降；干柱恒 0          |
 * |             |          | 0.52+0.44·hw，hw = 全簇表 Y 域归一高度）          |                                |
 * | aLeafRand   | 1        | 逐卡变奏（簇心 sin 散列，双卡错相）——色相 /       | ∈ [0,1)；干柱恒 0              |
 * |             |          | 透光 / 快颤相位源（材质 flutter 相位 =            |                                |
 * |             |          | hash(aSeed + aLeafRand)，同 High 叶材质机制）     |                                |
 * | aCrownQ     | 1        | 冠内归一径向深度（内外明暗梯度通道：0 冠心 /      | ∈ [0,1]；干柱恒 0              |
 * |             |          | 1 冠壳；q³ᵈ 联合水平径与垂直位）                  |                                |
 * 材质工厂参数面（非顶点属性）：树种级冠色（assetId → 各树种叶色）、IBL / 主光
 * 共享 T018 域（MeshStandardMaterial 族自动吃 scene.environment，§6.4）；组序
 * [0=干柱, 1=冠卡] 两材质成套；法线为水平卡面法线（双面读向建议 DoubleSide）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mulberry32 } from '../../../core/random';
import { morphSeedOf } from '../../../domain/assets';
import type { BroadleafShapeProfile } from './broadleaf/broadleafShapeProfile';
import type { BroadleafClusterStatsRecord } from './broadleaf/broadleafClusterField';
import { buildBischofiaGeometry } from './bischofia/bischofiaGeometry';
import { BISCHOFIA_SHAPE_PROFILES } from './bischofia/bischofiaShapeProfile';
import { buildCamphorGeometry } from './camphor/camphorGeometry';
import { CAMPHOR_SHAPE_PROFILES } from './camphor/camphorShapeProfile';
import { buildCeltisGeometry } from './celtis/celtisGeometry';
import { CELTIS_SHAPE_PROFILES } from './celtis/celtisShapeProfile';
import { buildFraxinusGeometry } from './fraxinus/fraxinusGeometry';
import { FRAXINUS_SHAPE_PROFILES } from './fraxinus/fraxinusShapeProfile';
import { buildGinkgoGeometry } from './ginkgo/ginkgoGeometry';
import { GINKGO_SHAPE_PROFILES } from './ginkgo/ginkgoShapeProfile';
import { buildKoelreuteriaGeometry } from './koelreuteria/koelreuteriaGeometry';
import { KOELREUTERIA_SHAPE_PROFILES } from './koelreuteria/koelreuteriaShapeProfile';
import { buildLigustrumGeometry } from './ligustrum/ligustrumGeometry';
import { LIGUSTRUM_SHAPE_PROFILES } from './ligustrum/ligustrumShapeProfile';
import { buildPlatanusGeometry } from './platanus/platanusGeometry';
import { PLATANUS_SHAPE_PROFILES } from './platanus/platanusShapeProfile';
import { buildSalixGeometry } from './salix/salixGeometry';
import { SALIX_SHAPE_PROFILES } from './salix/salixShapeProfile';
import { buildSophoraGeometry } from './sophora/sophoraGeometry';
import { SOPHORA_SHAPE_PROFILES } from './sophora/sophoraShapeProfile';
import { buildTree3aGeometry } from './tree3a/tree3aGeometry';
import { TREE3A_SHAPE_PROFILES } from './tree3a/tree3aShapeProfile';
import { buildTriadicaGeometry } from './triadica/triadicaGeometry';
import { TRIADICA_SHAPE_PROFILES } from './triadica/triadicaShapeProfile';
import { buildZelkovaGeometry } from './zelkova/zelkovaGeometry';
import { ZELKOVA_SHAPE_PROFILES } from './zelkova/zelkovaShapeProfile';

// ── 预算与形态常数（锁定账目：lod-spec §5.2 canopy 列；调值须同步预算表与本模块头）──

/** 双竖卡壳带簇数（外缘交叉双卡——任意水平方位至少一卡正面可读） */
const TWO_CARD_CLUSTERS = 70;
/** 单卡体内簇数（内层绿色体量 + aCrownQ 梯度载体；单卡边缘向可见性即「外密内疏」读向） */
const ONE_CARD_CLUSTERS = 86;
/** 干柱径向分段（干身剪影圆度——canopy 观距 5 边已足） */
const TRUNK_RADIAL = 5;
/** 干柱轴向站点 t 序（3 段直线锥度柱） */
const TRUNK_STATIONS = [0, 0.45, 0.78, 1] as const;
/** 干柱顶径 / 基径（线性锥度——远距剪影的干身收分读向） */
const TRUNK_TOP_TAPER = 0.55;
/** 干柱顶点沿树基→冠心向的跟进比例（部分倾向——冠不对称的干冠偏心跟随，非全幅倒向） */
const TRUNK_TOP_LEAN = 0.5;
/** 干基半径采样带（米，贴地后坐标 y ≤ 此值的树皮组顶点参与干基半径派生——低于任何骨架枝挂点） */
const TRUNK_SAMPLE_BAND = 0.9;
/** 卡半径膨胀余量（米，Low 壳卡 LOW_SHELL_MARGIN 同量级——吞并簇半径常态域） */
const CANOPY_MARGIN = 0.12;
/** 膨胀系数上限（簇数极多树种的膨胀封顶——防卡过大糊死冠形） */
const MAX_INFLATE = 2.1;
/** 包络外溢容差（米）：卡半幅钳制使 canopy 冠包络 ⊆ 簇场球包络 + 此值（簇场球包络
 *  ≈ High 实测冠幅——Low 窄卡树种〔垂柳〕反低于真实冠幅，canopy 以 High 为身份基准） */
const ENVELOPE_POKE = 0.15;

/** 世界向上基向量（只读复用） */
const UP = new THREE.Vector3(0, 1, 0);

/** x → [0,1)（确定性散列分量） */
function fract01(x: number): number {
  return x - Math.floor(x);
}

/** Low 壳卡逐卡身份同式（aLeafRand 契约值 ∈ [0,1)）：簇心 sin 散列 + 第二卡派生错相——
 *  与 13 树种几何文件 shellCardRandOf 同常数同式（零 rng，共享簇逐位同值） */
function shellCardRandOf(cx: number, cy: number, cz: number, derive: number): number {
  const base = fract01(Math.sin(cx * 12.9898 + cy * 78.233 + cz * 37.719) * 43758.5453);
  return derive === 0 ? base : fract01(base * 7.31 + 0.37);
}

// ── 树种接入表（13 树种按 assetId 全可用；buildLow = 该树种现有几何生成器 Low 档）──

/** 树种 Low 档构建结果的结构消费面（各树种 XxxGeometryResult 结构兼容——只消费 geometry + 簇表） */
interface CanopyLowResult {
  geometry: THREE.BufferGeometry;
  stats: { clusters: BroadleafClusterStatsRecord[] };
}

/** 树种接入项：8 槽 profile 表 + Low 档构建函数 */
interface BroadleafCanopySpecies {
  profiles: BroadleafShapeProfile[];
  buildLow: (rng: () => number, profile: BroadleafShapeProfile) => CanopyLowResult;
}

/** 13 树种接入表（T011 全量；新阔叶树种接入 = 加一行，禁每树种远景算法） */
const CANOPY_SPECIES: Record<string, BroadleafCanopySpecies> = {
  asset_tree_3a: { profiles: TREE3A_SHAPE_PROFILES, buildLow: (rng, p) => buildTree3aGeometry(rng, p, 'low') },
  asset_tree_camphor: { profiles: CAMPHOR_SHAPE_PROFILES, buildLow: (rng, p) => buildCamphorGeometry(rng, p, 'low') },
  asset_tree_celtis: { profiles: CELTIS_SHAPE_PROFILES, buildLow: (rng, p) => buildCeltisGeometry(rng, p, 'low') },
  asset_tree_zelkova: { profiles: ZELKOVA_SHAPE_PROFILES, buildLow: (rng, p) => buildZelkovaGeometry(rng, p, 'low') },
  asset_tree_ginkgo: { profiles: GINKGO_SHAPE_PROFILES, buildLow: (rng, p) => buildGinkgoGeometry(rng, p, 'low') },
  asset_tree_bischofia: { profiles: BISCHOFIA_SHAPE_PROFILES, buildLow: (rng, p) => buildBischofiaGeometry(rng, p, 'low') },
  asset_tree_fraxinus: { profiles: FRAXINUS_SHAPE_PROFILES, buildLow: (rng, p) => buildFraxinusGeometry(rng, p, 'low') },
  asset_tree_koelreuteria: { profiles: KOELREUTERIA_SHAPE_PROFILES, buildLow: (rng, p) => buildKoelreuteriaGeometry(rng, p, 'low') },
  asset_tree_ligustrum: { profiles: LIGUSTRUM_SHAPE_PROFILES, buildLow: (rng, p) => buildLigustrumGeometry(rng, p, 'low') },
  asset_tree_platanus: { profiles: PLATANUS_SHAPE_PROFILES, buildLow: (rng, p) => buildPlatanusGeometry(rng, p, 'low') },
  asset_tree_salix: { profiles: SALIX_SHAPE_PROFILES, buildLow: (rng, p) => buildSalixGeometry(rng, p, 'low') },
  asset_tree_sophora: { profiles: SOPHORA_SHAPE_PROFILES, buildLow: (rng, p) => buildSophoraGeometry(rng, p, 'low') },
  asset_tree_triadica: { profiles: TRIADICA_SHAPE_PROFILES, buildLow: (rng, p) => buildTriadicaGeometry(rng, p, 'low') },
};

/** canopy 可用树种 assetId 清单（测试 / 接线侧枚举面；顺序 = 接入表声明序） */
export const BROADLEAF_CANOPY_ASSET_IDS: readonly string[] = Object.keys(CANOPY_SPECIES);

/** 形态族槽位常量（13 树种 meta.shapeFamily.size 一致 = 8；与资产 profileForSeed 同枚举口径） */
const SLOT_COUNT = 8;

/** morphSeed → shapeProfile 路由（与各资产 build 内 profileForSeed 同口径：枚举槽位
 *  morphSeedOf 逐位比对还原 slot，非槽种子与未填槽回落 slot-0——O(8) 纯查表，确定性） */
function profileForSeed(assetId: string, species: BroadleafCanopySpecies, seed: number): BroadleafShapeProfile {
  for (let slot = 0; slot < SLOT_COUNT; slot++) {
    if (seed === morphSeedOf(assetId, slot)) return species.profiles[Math.min(slot, species.profiles.length - 1)]!;
  }
  return species.profiles[0]!;
}

// ── 冠层场收割（cluster 场 + 地面偏移 + 干基半径——全部派生自该树种 Low 档产物）──

/** 冠层场（canopy 生成输入的纯数据形态；簇表坐标 = 贴地平移前世界坐标，groundShift 补齐到最终帧） */
export interface BroadleafCanopyField {
  /** 簇位表（与 High/Mid/Low 三档逐位同源——T009.6 档间不变量；flat 形态 = 树种 stats.clusters） */
  clusters: BroadleafClusterStatsRecord[];
  /** 地面偏移 Δ（最终帧 y = 簇表 y + Δ；派生 = Low 叶组最低顶点 − 最低簇心，Low 壳卡底边恒在簇心） */
  groundShift: number;
  /** 干基半径（米；派生 = Low 树皮组近地面顶点最大水平半径——含树种根部 flare 实宽） */
  trunkBaseRadius: number;
}

/**
 * 收割冠层场：跑该树种现有几何生成器 Low 档（rng 消费与三档恒等——簇位表即 High 同源
 * 簇场），从产物收割簇表 / 地面偏移 / 干基半径，中间几何即弃（dispose——所有权归本函数）。
 * Low 档组 1 恒为纯壳卡（果串树种 Low 不发射果，档间记档），底边恒在簇心 cy——
 * Δ 反演逐树种成立。
 */
export function harvestBroadleafCanopyField(assetId: string, seed?: number): BroadleafCanopyField {
  const species = CANOPY_SPECIES[assetId];
  if (!species) {
    throw new Error(`BroadleafCanopyProxy 无此树种接入: ${assetId}（可用: ${BROADLEAF_CANOPY_ASSET_IDS.join(', ')}）`);
  }
  const morphSeed = seed ?? morphSeedOf(assetId, 0);
  const low = species.buildLow(mulberry32(morphSeed), profileForSeed(assetId, species, morphSeed));
  const clusters = low.stats.clusters;
  if (clusters.length === 0) throw new Error(`BroadleafCanopyProxy 簇场为空: ${assetId}`);
  const pos = low.geometry.getAttribute('position');
  const groups = low.geometry.groups;
  // 地面偏移 Δ：叶组（组 1 = Low 壳卡）最低顶点 y − 最低簇心 cy（壳卡底边在簇心）
  const leaf = groups[1];
  if (!leaf) throw new Error(`BroadleafCanopyProxy Low 档缺叶组: ${assetId}`);
  let minLeafY = Infinity;
  for (let i = leaf.start; i < leaf.start + leaf.count; i++) minLeafY = Math.min(minLeafY, pos.getY(i));
  let minCy = Infinity;
  for (const c of clusters) minCy = Math.min(minCy, c.cy);
  const groundShift = minLeafY - minCy;
  // 干基半径：树皮组（组 0）贴地带（y ≤ TRUNK_SAMPLE_BAND，最终帧地面 = 0）最大水平半径
  const bark = groups[0];
  if (!bark) throw new Error(`BroadleafCanopyProxy Low 档缺皮组: ${assetId}`);
  let trunkBaseRadius = 0.05;
  for (let i = bark.start; i < bark.start + bark.count; i++) {
    if (pos.getY(i) <= TRUNK_SAMPLE_BAND) trunkBaseRadius = Math.max(trunkBaseRadius, Math.hypot(pos.getX(i), pos.getZ(i)));
  }
  low.geometry.dispose();
  return { clusters, groundShift, trunkBaseRadius };
}

// ── 簇选取（k 中心最远点贪心——确定性：严格大于比较 + 低索引破平）──

/** 最远点贪心选取 K 个簇索引：种子 = 最外缘（max ρ）+ 冠顶 / 冠底 + ±X / ±Z 四轴
 *  极值（轴对齐跨度由轴极值簇决定——bbox 跨度连续性的保证位），此后每步取
 *  「距已选集最小距离」最大者 */
function selectClusters(
  clusters: BroadleafClusterStatsRecord[],
  k: number,
  rho: Float64Array,
): number[] {
  const n = clusters.length;
  let outermost = 0;
  let top = 0;
  let bottom = 0;
  let maxX = 0;
  let minX = 0;
  let maxZ = 0;
  let minZ = 0;
  for (let i = 1; i < n; i++) {
    const c = clusters[i]!;
    if (rho[i]! > rho[outermost]!) outermost = i;
    if (c.cy > clusters[top].cy) top = i;
    if (c.cy < clusters[bottom].cy) bottom = i;
    if (c.cx > clusters[maxX].cx) maxX = i;
    if (c.cx < clusters[minX].cx) minX = i;
    if (c.cz > clusters[maxZ].cz) maxZ = i;
    if (c.cz < clusters[minZ].cz) minZ = i;
  }
  const selected: number[] = [];
  const inSet = new Uint8Array(n);
  /** 逐簇距已选集最小距离平方（增量维护——每入选一个簇刷新一次，O(k·n)） */
  const minDistSq = new Float64Array(n).fill(Infinity);
  const distSqTo = (a: number, b: number): number => {
    const dx = clusters[a].cx - clusters[b].cx;
    const dy = clusters[a].cy - clusters[b].cy;
    const dz = clusters[a].cz - clusters[b].cz;
    return dx * dx + dy * dy + dz * dz;
  };
  const admit = (i: number): void => {
    selected.push(i);
    inSet[i] = 1;
    for (let j = 0; j < n; j++) {
      if (!inSet[j]) minDistSq[j] = Math.min(minDistSq[j]!, distSqTo(i, j));
    }
  };
  admit(outermost);
  for (const seed of [top, bottom, maxX, minX, maxZ, minZ]) {
    if (!inSet[seed]!) admit(seed);
  }
  while (selected.length < k) {
    let best = -1;
    let bestD = -1;
    for (let j = 0; j < n; j++) {
      if (inSet[j]) continue;
      const d = minDistSq[j]!;
      if (d > bestD) {
        bestD = d;
        best = j;
      }
    }
    if (best < 0) break;
    admit(best);
  }
  return selected;
}

// ── 几何结果契约 ──

/** canopy 几何生成结果：合并几何（恰 2 组：干柱 0 / 冠卡 1）+ 账目（测试 / 预算锁定消费） */
export interface BroadleafCanopyGeometryResult {
  geometry: THREE.BufferGeometry;
  stats: {
    /** 干柱面数（恒 35 = 5×3×2 + 5 底盖） */
    trunkTriangles: number;
    /** 冠卡面数（双卡 70×4 + 单卡 86×2 = 452；簇位不足时退化） */
    cardTriangles: number;
    /** 总面数（恒 487 ≤ 500 预算红线，13 树种实测不退化） */
    totalTriangles: number;
    /** 簇场总数（= Low 保留簇数，档间同源） */
    clustersTotal: number;
    /** 入选簇数 */
    clustersSelected: number;
    /** 双卡壳带簇数（q³ᵈ 排名前 TWO_CARD_CLUSTERS） */
    twoCardClusters: number;
    /** 单卡体内簇数 */
    oneCardClusters: number;
    /** 膨胀系数 F（sqrt(2n / 总卡数)，钳 [1, 2.1]） */
    inflateFactor: number;
    /** 干基半径（米，Low 树皮地面带派生） */
    trunkBaseRadius: number;
    /** 干柱高（米，基→冠心） */
    trunkHeight: number;
    /** 卡集合水平跨度（米，最终帧 bbox XZ 最大跨） */
    crownSpanXZ: number;
    /** 卡集合总高（米，最终帧 bbox Y 跨） */
    crownSpanY: number;
    /** 地面偏移 Δ（簇表帧 → 最终帧） */
    groundShift: number;
  };
}

/**
 * 单簇冠卡发射（Low 壳卡同构：六顶点卡 / 根边 v=0 尖边 v=1 / aBend 根 0.12·hw 尖
 * 0.52+0.44·hw / aLeafRand 簇心散列 / 卡面法线 = w × UP 水平双面读向；差异仅
 * half = 膨胀后半幅与 aCrownQ 梯度通道）。位置 = 簇心 + Δ（Y 向）± half。
 */
function emitCanopyCard(
  pos: number[],
  nrm: number[],
  uv: number[],
  aSeed: number[],
  aBend: number[],
  aLeafRand: number[],
  aCrownQ: number[],
  cx: number,
  cy: number,
  cz: number,
  w: THREE.Vector3,
  half: number,
  cardRand: number,
  hw: number,
  crownQ: number,
  groundShift: number,
): void {
  const bendRoot = 0.12 * hw; // 根边（簇挂枝端语义）≈ 0——与 Low 壳卡同公式同常数
  const bendTip = 0.52 + 0.44 * hw; // 尖边大；树顶簇 > 树底簇——与 Low/High 同公式
  const y = cy + groundShift;
  const r0x = cx - w.x * half;
  const r0z = cz - w.z * half;
  const r1x = cx + w.x * half;
  const r1z = cz + w.z * half;
  const n = w.clone().cross(UP).normalize();
  // 顶点序（非索引 6 顶点/卡，Low 壳卡同构）：r0 r1 t1 | r0 t1 t0；u = 宽向 0/1，v = 根 0 / 尖 1
  const verts: [number, number, number, number, number, number][] = [
    [r0x, y, r0z, 0, 0, bendRoot],
    [r1x, y, r1z, 1, 0, bendRoot],
    [r1x, y + half, r1z, 1, 1, bendTip],
    [r0x, y, r0z, 0, 0, bendRoot],
    [r1x, y + half, r1z, 1, 1, bendTip],
    [r0x, y + half, r0z, 0, 1, bendTip],
  ];
  for (const [x, vy, z, u, v, b] of verts) {
    pos.push(x, vy, z);
    nrm.push(n.x, n.y, n.z);
    uv.push(u, v);
    aSeed.push(0); // 恒 0——散布缺属性 GL 缺省 0 逐位一致（档间 0=0 同相）
    aBend.push(b);
    aLeafRand.push(cardRand);
    aCrownQ.push(crownQ);
  }
}

/**
 * BroadleafCanopyProxy 几何生成入口（全乔木共用，T021.6 几何面）。
 * 输入 = assetId + morphSeed（缺省 slot-0 锚点——assetId 粒度语义）；输出 = canopy
 * BufferGeometry（恰 2 组：干柱 0 / 冠卡 1）+ 账目。确定性：同 (assetId, seed)
 * 逐位同输出（零 rng 后处理）。Runtime 接线（缓存 / 路由 / 选档）归 021.7。
 */
export function buildBroadleafCanopyGeometry(assetId: string, seed?: number): BroadleafCanopyGeometryResult {
  const species = CANOPY_SPECIES[assetId];
  if (!species) {
    throw new Error(`BroadleafCanopyProxy 无此树种接入: ${assetId}（可用: ${BROADLEAF_CANOPY_ASSET_IDS.join(', ')}）`);
  }
  const morphSeed = seed ?? morphSeedOf(assetId, 0);
  const field = harvestBroadleafCanopyField(assetId, morphSeed);
  const { clusters, groundShift, trunkBaseRadius } = field;
  const n = clusters.length;

  // ── 冠参考系（簇场实测——比 profile 比例更贴该棵树实际涌现冠形）──
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  let crownMinY = Infinity;
  let crownMaxY = -Infinity;
  for (const c of clusters) {
    sumX += c.cx;
    sumY += c.cy;
    sumZ += c.cz;
    crownMinY = Math.min(crownMinY, c.cy);
    crownMaxY = Math.max(crownMaxY, c.cy);
  }
  const centroidX = sumX / n;
  const centroidY = sumY / n;
  const centroidZ = sumZ / n;
  const rho = new Float64Array(n);
  let envelopeR = 0.01; // 簇场水平包络半径 max(ρ + r)
  let envelopeTop = -Infinity; // 簇场顶包络 max(cy + r)
  for (let i = 0; i < n; i++) {
    const c = clusters[i]!;
    rho[i] = Math.hypot(c.cx, c.cz);
    envelopeR = Math.max(envelopeR, rho[i]! + c.radius);
    envelopeTop = Math.max(envelopeTop, c.cy + c.radius);
  }
  const verticalSpan = Math.max(0.01, crownMaxY - crownMinY);

  // ── 簇选取（k 中心最远点 + 三极值种子；双卡壳带 = 入选中 q³ᵈ 排名前 N2）──
  const targetTotal = Math.min(n, TWO_CARD_CLUSTERS + ONE_CARD_CLUSTERS);
  const selected = selectClusters(clusters, targetTotal, rho);
  const targetTwo = Math.min(TWO_CARD_CLUSTERS, selected.length);
  /** q³ᵈ = 水平径向深度 + 垂直位置联合归一（冠壳隶属度——双卡分层与 aCrownQ 共用） */
  const q3dOf = (c: BroadleafClusterStatsRecord): number => {
    const qh = Math.hypot(c.cx, c.cz) / envelopeR;
    const qv = ((c.cy - centroidY) / verticalSpan) * 2;
    return Math.sqrt(qh * qh + qv * qv);
  };
  const ranked = [...selected].sort((a, b) => q3dOf(clusters[b]!) - q3dOf(clusters[a]!) || a - b);
  const twoCardSet = new Set(ranked.slice(0, targetTwo));
  const twoCount = twoCardSet.size;
  const oneCount = selected.length - twoCount;
  const totalCards = twoCount * 2 + oneCount;

  // ── 膨胀系数（卡总面积守恒口径：2n 张 Low 卡 → totalCards 张 canopy 卡）──
  const inflateFactor = Math.min(MAX_INFLATE, Math.max(1, Math.sqrt((2 * n) / totalCards)));

  // ── 冠卡发射（入选序确定性；位置 + Δ，属性值在簇表帧算——与 Low 共享簇逐位同值）──
  const cardPos: number[] = [];
  const cardNrm: number[] = [];
  const cardUv: number[] = [];
  const cardSeed: number[] = [];
  const cardBend: number[] = [];
  const cardRand: number[] = [];
  const cardQ: number[] = [];
  for (const idx of selected) {
    const c = clusters[idx]!;
    const two = twoCardSet.has(idx);
    // 宽轴 = 簇切向水平投影（Low 壳卡同源；近铅垂切向确定性回退 (1,0,0)）
    const w = new THREE.Vector3(c.dirX, 0, c.dirZ);
    if (w.lengthSq() < 1e-6) w.set(1, 0, 0);
    w.normalize();
    // 半幅 = 簇半径 × F + 余量，钳制不越簇场包络 + POKE（水平 / 垂直两向），下限 ≥ 自身球半径
    let half = c.radius * inflateFactor + CANOPY_MARGIN;
    half = Math.min(half, envelopeR + ENVELOPE_POKE - rho[idx]!, envelopeTop + ENVELOPE_POKE - c.cy);
    half = Math.max(half, c.radius);
    // hw = 全簇表 Y 域归一高度（Low crownMinY/MaxY 同域同公式——共享簇 aBend 逐位同值）
    const hw = THREE.MathUtils.clamp((c.cy - crownMinY) / Math.max(0.01, crownMaxY - crownMinY), 0, 1);
    const crownQ = THREE.MathUtils.clamp(q3dOf(c), 0, 1);
    emitCanopyCard(
      cardPos, cardNrm, cardUv, cardSeed, cardBend, cardRand, cardQ,
      c.cx, c.cy, c.cz, w, half,
      shellCardRandOf(c.cx, c.cy, c.cz, 0), hw, crownQ, groundShift,
    );
    if (two) {
      emitCanopyCard(
        cardPos, cardNrm, cardUv, cardSeed, cardBend, cardRand, cardQ,
        c.cx, c.cy, c.cz, new THREE.Vector3(-w.z, 0, w.x), half,
        shellCardRandOf(c.cx, c.cy, c.cz, 1), hw, crownQ, groundShift,
      );
    }
  }

  // ── 干柱（简化树干预柱：基 = 树种干基原点，顶 = 冠心方向部分跟进；直线锥度 + 底盖）──
  const trunkPos: number[] = [];
  const trunkNrm: number[] = [];
  const trunkUv: number[] = [];
  const trunkZero: number[] = [];
  const base = new THREE.Vector3(0, 0, 0);
  const top = new THREE.Vector3(centroidX * TRUNK_TOP_LEAN, centroidY + groundShift, centroidZ * TRUNK_TOP_LEAN);
  const axis = top.clone().sub(base).normalize();
  // 环面标架（右手系 (N, B, a)——与树种 emitTube 绕序约定一致，外向绕制）
  const seedVec = Math.abs(axis.y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
  const frameN = seedVec.clone().sub(axis.clone().multiplyScalar(axis.dot(seedVec))).normalize();
  const frameB = axis.clone().cross(frameN);
  const cosT: number[] = [];
  const sinT: number[] = [];
  for (let j = 0; j < TRUNK_RADIAL; j++) {
    const th = (j / TRUNK_RADIAL) * Math.PI * 2;
    cosT.push(Math.cos(th));
    sinT.push(Math.sin(th));
  }
  const stations = TRUNK_STATIONS.map((t) => ({
    t,
    p: base.clone().lerp(top, t),
    r: THREE.MathUtils.lerp(trunkBaseRadius, trunkBaseRadius * TRUNK_TOP_TAPER, t),
  }));
  /** 单环顶点发射（外向法线 = 环向基投影去轴向分量） */
  const emitTrunkVertex = (s: (typeof stations)[number], j: number): void => {
    const d = new THREE.Vector3(
      cosT[j]! * frameN.x + sinT[j]! * frameB.x,
      cosT[j]! * frameN.y + sinT[j]! * frameB.y,
      cosT[j]! * frameN.z + sinT[j]! * frameB.z,
    );
    const nrm = d.clone().sub(axis.clone().multiplyScalar(d.dot(axis))).normalize();
    trunkPos.push(s.p.x + d.x * s.r, s.p.y + d.y * s.r, s.p.z + d.z * s.r);
    trunkNrm.push(nrm.x, nrm.y, nrm.z);
    trunkUv.push(j / TRUNK_RADIAL, s.t);
    trunkZero.push(0); // aSeed/aBend/aLeafRand/aCrownQ 干柱恒 0（merge 属性集一致）
  };
  for (let i = 0; i < stations.length - 1; i++) {
    const a = stations[i]!;
    const b = stations[i + 1]!;
    for (let j = 0; j < TRUNK_RADIAL; j++) {
      const j1 = (j + 1) % TRUNK_RADIAL;
      // 顶点流 a0 a1 b1 | a0 b1 b0（外向绕制——树种 emitTube 同序）
      emitTrunkVertex(a, j);
      emitTrunkVertex(a, j1);
      emitTrunkVertex(b, j1);
      emitTrunkVertex(a, j);
      emitTrunkVertex(b, j1);
      emitTrunkVertex(b, j);
    }
  }
  // 底盖（扇面封洞：绕序对 −a 外向——近地斜视不穿帮；法线 = −axis）
  const cap = stations[0]!;
  for (let j = 0; j < TRUNK_RADIAL; j++) {
    const j1 = (j + 1) % TRUNK_RADIAL;
    const vOf = (jj: number): THREE.Vector3 =>
      new THREE.Vector3(
        cap.p.x + (cosT[jj]! * frameN.x + sinT[jj]! * frameB.x) * cap.r,
        cap.p.y + (cosT[jj]! * frameN.y + sinT[jj]! * frameB.y) * cap.r,
        cap.p.z + (cosT[jj]! * frameN.z + sinT[jj]! * frameB.z) * cap.r,
      );
    const v0 = vOf(j);
    const v1 = vOf(j1);
    for (const [vtx, u, vv] of [
      [cap.p, 0.5, 0.5],
      [v1, 0.5 + 0.5 * cosT[j1]!, 0.5 + 0.5 * sinT[j1]!],
      [v0, 0.5 + 0.5 * cosT[j]!, 0.5 + 0.5 * sinT[j]!],
    ] as const) {
      trunkPos.push(vtx.x, vtx.y, vtx.z);
      trunkNrm.push(-axis.x, -axis.y, -axis.z);
      trunkUv.push(u, vv);
      trunkZero.push(0);
    }
  }

  // ── minY 精确贴地（干柱底盖 / 环面可能微沉——整树 Y 平移，树种同语义）──
  let minY = Infinity;
  for (let i = 1; i < trunkPos.length; i += 3) minY = Math.min(minY, trunkPos[i]!);
  for (let i = 1; i < cardPos.length; i += 3) minY = Math.min(minY, cardPos[i]!);
  if (minY !== 0 && Number.isFinite(minY)) {
    for (let i = 1; i < trunkPos.length; i += 3) trunkPos[i]! -= minY;
    for (let i = 1; i < cardPos.length; i += 3) cardPos[i]! -= minY;
  }

  // ── 层几何组装（干柱 0 / 冠卡 1——属性集一致：position/normal/uv/aSeed/aBend/aLeafRand/aCrownQ）──
  const mkAttr = (arr: number[]): THREE.BufferAttribute => new THREE.BufferAttribute(new Float32Array(arr), 1);
  const trunkGeo = new THREE.BufferGeometry();
  trunkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(trunkPos), 3));
  trunkGeo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(trunkNrm), 3));
  trunkGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(trunkUv), 2));
  trunkGeo.setAttribute('aSeed', mkAttr(trunkZero));
  trunkGeo.setAttribute('aBend', mkAttr(trunkZero));
  trunkGeo.setAttribute('aLeafRand', mkAttr(trunkZero));
  trunkGeo.setAttribute('aCrownQ', mkAttr(trunkZero));

  const cardGeo = new THREE.BufferGeometry();
  cardGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cardPos), 3));
  cardGeo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(cardNrm), 3));
  cardGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(cardUv), 2));
  cardGeo.setAttribute('aSeed', mkAttr(cardSeed));
  cardGeo.setAttribute('aBend', mkAttr(cardBend));
  cardGeo.setAttribute('aLeafRand', mkAttr(cardRand));
  cardGeo.setAttribute('aCrownQ', mkAttr(cardQ));

  const geometry = mergeGeometries([trunkGeo, cardGeo], true); // 层间成组 → 恰 2 组（干柱 0 / 冠卡 1，D15）
  trunkGeo.dispose();
  cardGeo.dispose();
  if (!geometry) throw new Error('BroadleafCanopyProxy 层合并不兼容（属性集应一致：position/normal/uv/aSeed/aBend/aLeafRand/aCrownQ）');

  const trunkTriangles = trunkPos.length / 9;
  const cardTriangles = cardPos.length / 9;
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox!;
  return {
    geometry,
    stats: {
      trunkTriangles,
      cardTriangles,
      totalTriangles: trunkTriangles + cardTriangles,
      clustersTotal: n,
      clustersSelected: selected.length,
      twoCardClusters: twoCount,
      oneCardClusters: oneCount,
      inflateFactor,
      trunkBaseRadius,
      trunkHeight: top.length(),
      crownSpanXZ: Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z),
      crownSpanY: bb.max.y - bb.min.y,
      groundShift,
    },
  };
}
