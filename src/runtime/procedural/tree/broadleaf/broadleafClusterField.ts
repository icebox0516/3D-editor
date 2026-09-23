/**
 * runtime/procedural/tree/broadleaf/broadleafClusterField —— 阔叶家族共享冠层场契约
 * （T021.6 共享契约收编；沿 broadleafShapeProfile「本文件只有类型，零运行时」模式）。
 *
 * 职责：冠层场记录 BroadleafClusterRecord 的家族级唯一定义——T008/T011 以来 13 个树种
 *      几何文件各自独立定义同构 ClusterRecord（形状逐字节相同、无共享类型），本文件将其
 *      收编为共享契约：字段集 = 枝梢驱动叶簇（T009.2）以来全部树种真实消费并验证过的
 *      字段（簇生成 / 簇级距离抑制 / Low 壳卡 / 果串挂点遴选全走本记录——无投机字段）。
 * 消费方（收编后）：
 *   - 13 个 <species>/<species>Geometry.ts 的簇生成与消费（本地名 ClusterRecord =
 *     本类型的别名导入——机械等价收编，生成结果零改动）；
 *   - BroadleafCanopyProxy（../broadleafCanopyProxy，T021.6）：远景冠层代理从本记录
 *     驱动的簇场 + Low 壳卡逻辑派生（representation-runtime.md §6.1「必须从现有
 *     ClusterRecord / Low 档壳卡逻辑派生」的契约落点）。
 * 语义不变量（家族级事实，T009.2 记档延续）：
 *   - 记录为**生成期**形态（THREE.Vector3 字段）；stats 出口的扁平数字形态
 *     （level/attachX../cx../dirX..）是各树种几何结果类型自身的账目契约，不在本文件
 *     重复定义（消费方按结构类型对齐）；
 *   - 簇位表跨档同源（high/mid/low 逐位全等——同 rng 流同骨架决策，T009.6），
 *     坐标口径 = 贴地平移前的世界坐标；
 *   - level 为挂簇枝级（3 = L4 / 4 = L5，五级拓扑实例口径——六七级树种沿用
 *     「末两级挂簇」语义，具体枝级数值归各实例）。
 * 边界：家族类型层，只有类型与文档，零运行时——无工厂、无默认值、无常量。
 */
import type * as THREE from 'three';

/**
 * 冠层场记录（单簇）：挂点 + 簇中心 + 簇方向（= 挂点枝切向）+ 半径。
 * 枝梢驱动叶簇（T009.2）与 Low 壳卡（T009.6）的共同原料；果串树种（白蜡翅果 /
 * 女贞核果 / 悬铃木果球 / 国槐念珠 / 栾树灯笼果 / 重阳闭蒴果）的果挂点遴选同样
 * 从本记录确定性抽选（档间同源）。
 */
export interface BroadleafClusterRecord {
  /** 挂簇枝级（3 = L4 / 4 = L5——「末两级挂簇」为家族语义，具体枝级为实例口径） */
  level: number;
  /** 挂点（枝上簇位） */
  attach: THREE.Vector3;
  /** 簇中心（挂点沿簇方向前移 clusterForwardOffset——叶量越枝端） */
  center: THREE.Vector3;
  /** 簇半径（米，profile 域抽样 × 枝长比例 cap） */
  radius: number;
  /** 簇方向（= 挂点枝切向单位向量——Low 壳卡宽轴的水平投影源） */
  dir: THREE.Vector3;
}

/**
 * 冠层场记录的**出口（账目）形态**：各树种几何结果 stats.clusters 元素的扁平数字
 * 结构（13 树种结构同构；各树种 stats 类型自带该内联形态，本类型为其共享消费面
 * ——BroadleafCanopyProxy 收割簇场时按结构类型对齐，不改树种 stats 契约）。
 * 坐标口径同 BroadleafClusterRecord（贴地平移前世界坐标）。
 */
export interface BroadleafClusterStatsRecord {
  level: number;
  attachX: number;
  attachY: number;
  attachZ: number;
  cx: number;
  cy: number;
  cz: number;
  radius: number;
  dirX: number;
  dirY: number;
  dirZ: number;
}
