/**
 * runtime/procedural/tree/broadleafGeometry —— 夏栎（橡树系）CPU 几何生成器
 * （T008.2 建立，T009.1 结构真实性升级）。
 *
 * 职责：morphRng（mulberry32 流，消费顺序即契约——同 seed 逐位同结果）驱动的五级递归
 *      分枝拓扑 → 锥度管状枝干（平行传输标架，径向分段随枝级递减 12→4、主干到枝梢锥度
 *      连续）→ 枝梢/冠内叶卡烘焙，产出树皮/叶两层非索引几何；层间
 *      mergeGeometries(useGroups=true) 恰 2 组（D15 免组膨胀：树皮 0 / 叶 1）。
 *      形态参数全部来自 shapeProfile（./tree3aShapeProfile——夏栎私有参数面，build 只
 *      负责 slot → profile 路由，不进 ProceduralBuild 公共签名）。
 * 主次分级（T009.1）：①骨架枝内部 rank 强弱势差（首枝主导 ×1.14 强化自 ×1.08）；
 *      ②逐级子/父起径比低级陡末级缓（0.46→0.62，自 008.2 近平的 0.55+0.03·level）；
 *      ③L1 锥度 0.7 通体粗壮（Spec「骨架枝粗壮有力」Verified 的方向性表达）；
 *      ④姿态语言分级——粗枝刚直（wander 0.12）细枝纷乱（0.34）。
 * 冠内通透（T009.1 核心）：显式规则替代「叶卡只挂外段」的涌现式空腔——
 *      ①枝干通道（主干/领导枝/骨架枝基段周围半径带内叶卡硬抑制——主干大枝进冠不被
 *      封死）；②内层密度衰减（冠内归一化径向深度 q 的密度场：壳层满密 → 冠心地板，
 *      外密内疏）；③局部空腔（rng 驱动的冠内空腔球剔卡）。叶卡沿枝挂点自 008.2 的
 *      外段限制放宽至沿途，内层稀疏由密度场接管。Spec：crown_transparency（冠内明显
 *      空隙、逆光透视，Verified 照片）+ crown_fill_gradient（外密内疏，Verified 照片）。
 * 结构计数：皮拓扑（枝数/环数/径向段）槽间恒定 → 皮面数恒等；叶卡候选计数恒定、
 *      实际叶卡数随 seed 在通透规则下确定（同槽同 seed 恒等——确定性不破；
 *      跨槽面数差异为 009.3 八槽形态向量的设计预期）。
 * 叶卡属性契约（008.3 起冻结，本任务只消费不修改）：
 *      - aLeafRand：Float32 itemSize 1，逐叶 ∈ [0,1)，同一叶卡 6 顶点同值——色相/透光/
 *        大小变奏源；
 *      - aBend：Float32 itemSize 1 ∈ [0,1]，风动摆幅权重 = 离枝距离（卡内根→尖）+
 *        冠内高度权重 hw = (y - 冠底)/(冠顶 - 冠底)（存活叶卡 Y 域）：根顶点 0.12·hw
 *        （钉枝≈0）、尖顶点 0.52 + 0.44·hw（树顶叶 > 树底叶），卡内根→尖恒非降；
 *      - 树皮层同名属性写恒等值 0（mergeGeometries 全几何属性集一致要求）。
 * 边界：零外部模型（D13）；每次调用全部数据现算（无模块级缓存对象，D17 所有权随调用
 *      移交）；原点 = 底部中心（整体 Y 平移使 minY 精确 = 0，GLB MODEL_BASE_HEIGHT
 *      语义对齐）；叶卡 UV 标准 0–1 四边形域（008.3 SDF 叶形 alpha 消费）；叶法线取
 *      卡面单侧（cross(side, dir)，材质侧向策略由资产层声明）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { TREE3A_SLOT0_PROFILE } from './tree3aShapeProfile';
import type { Tree3aShapeProfile } from './tree3aShapeProfile';

/** 叶卡描述子：烘焙前先收集（候选 → 通透过滤 → 两段式烘焙，冠内高度权重需存活卡 Y 域） */
interface LeafCard {
  center: THREE.Vector3;
  dir: THREE.Vector3; // 卡长方向（根→尖）
  side: THREE.Vector3; // 卡宽方向（水平随机滚转）
  width: number;
  height: number;
  rand: number; // aLeafRand
}

/** 枝干发射槽：非索引三角形流（pos/normal/uv 三数组同步追加） */
interface BarkSink {
  pos: number[];
  nrm: number[];
  uv: number[];
}

/** 枝干通道线段（点到线段距离 < r 即硬抑制——冠内通透规则①） */
interface ChannelSeg {
  ax: number;
  ay: number;
  az: number;
  bx: number;
  by: number;
  bz: number;
  r2: number; // 半径平方（判定预热）
}

/** 局部空腔球（冠内通透规则③） */
interface CavitySphere {
  center: THREE.Vector3;
  radius: number;
}

/** 构建上下文：发射槽 + 候选叶卡 + 通道表 + 逐级统计（全树共享，逐枝累加） */
interface BuildCtx {
  bark: BarkSink;
  leafCandidates: LeafCard[];
  channels: ChannelSeg[];
  levelBranches: number[]; // L1–L5 枝数（L1 含领导枝）
  levelRadiusSum: number[]; // 各级起径和（均值 = sum / branches——主次分级证据）
  maxY: number; // 全树枝干站点最高点（冠参考系上界）
}

/** 生成结果：合并几何（恰 2 组）+ 面数/结构账目（完成记录 / 结构真实性测试消费） */
export interface BroadleafTreeResult {
  geometry: THREE.BufferGeometry;
  stats: {
    barkTriangles: number;
    leafTriangles: number;
    leafCards: number;
    /** 通透账目：候选数与三条规则的剔卡数（按首个命中规则计——通道 > 空腔 > 密度） */
    leafCandidates: number;
    channelRejects: number;
    voidRejects: number;
    gradientRejects: number;
    /** 主次分级证据：各级枝数与平均起径（米；L1 含领导枝） */
    levelBranches: number[];
    levelMeanStartRadius: number[];
    /** 冠参考系（密度场判定基准，米；世界坐标 = 贴地平移前） */
    crownCenterY: number;
    crownRadius: number;
    crownHalfHeight: number;
    /** 冠内归一化径向深度 q 五分桶（0–0.2 … 0.8+）：候选数与存活数——保留率随 q 递增
     *  即外密内疏的结构化证据（叶卡背景分布由枝路径决定，通透规则的作用在保留率） */
    qCandidates: number[];
    qSurvived: number[];
    /** 通道线段表（诊断/测试口径：ax..bz + 半径 r；世界坐标 = 贴地平移前） */
    channels: { ax: number; ay: number; az: number; bx: number; by: number; bz: number; r: number }[];
  };
}

/** 世界向上基向量（只读复用） */
const UP = new THREE.Vector3(0, 1, 0);

/** rng → [0,1) 均匀；对称抖动 ±span */
function jitter(rng: () => number, span: number): number {
  return (rng() - 0.5) * 2 * span;
}

/** rng → 单位球面随机方向（两次 rng 消费：z 平均分布 + 方位角均匀） */
function randUnit(rng: () => number): THREE.Vector3 {
  const z = rng() * 2 - 1;
  const az = rng() * Math.PI * 2;
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  return new THREE.Vector3(r * Math.cos(az), z, r * Math.sin(az));
}

/** 点到线段距离平方（通道判定；p 在 [a,b] 参数域外取端点距离） */
function distToSegmentSq(
  px: number,
  py: number,
  pz: number,
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
): number {
  const abx = bx - ax;
  const aby = by - ay;
  const abz = bz - az;
  const apx = px - ax;
  const apy = py - ay;
  const apz = pz - az;
  const lenSq = abx * abx + aby * aby + abz * abz;
  const t = lenSq > 1e-12 ? Math.max(0, Math.min(1, (apx * abx + apy * aby + apz * abz) / lenSq)) : 0;
  const dx = apx - abx * t;
  const dy = apy - aby * t;
  const dz = apz - abz * t;
  return dx * dx + dy * dy + dz * dz;
}

/**
 * 锥度管发射：沿站点序列（points/radii 等长）平行传输标架，逐段发射外向绕制四边形
 * （三角形 (a0,b1,b0)/(a0,a1,b1)——右手系 (N,B,T) 下外向），uv = 环向 θ/2π × 累计弧长。
 * 法线取环向径向解析值（cosθ·N + sinθ·B；锥度近 1 时偏差可忽略）。
 */
function emitTube(
  sink: BarkSink,
  points: THREE.Vector3[],
  radii: number[],
  radial: number,
  vScale: number,
): void {
  const stations = points.length;
  const tangents: THREE.Vector3[] = [];
  for (let i = 0; i < stations; i++) {
    const prev = points[Math.max(0, i - 1)]!;
    const next = points[Math.min(stations - 1, i + 1)]!;
    tangents.push(next.clone().sub(prev).normalize());
  }
  // 平行传输法向：首站取与世界上up 最不共线基，后续投影去切向分量
  const normals: THREE.Vector3[] = [];
  const t0 = tangents[0]!;
  let seed = Math.abs(t0.y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
  normals.push(seed.clone().sub(t0.clone().multiplyScalar(t0.dot(seed))).normalize());
  for (let i = 1; i < stations; i++) {
    const t = tangents[i]!;
    const n = normals[i - 1]!.clone().sub(t.clone().multiplyScalar(t.dot(normals[i - 1]!)));
    if (n.lengthSq() < 1e-8) n.copy(seed).sub(t.clone().multiplyScalar(t.dot(seed)));
    normals.push(n.normalize());
  }
  const arcs: number[] = [0];
  for (let i = 1; i < stations; i++) arcs.push(arcs[i - 1]! + points[i]!.distanceTo(points[i - 1]!));

  for (let i = 0; i < stations - 1; i++) {
    const tA = tangents[i]!;
    const nA = normals[i]!;
    const bA = tA.clone().cross(nA); // B = T×N（(N,B,T) 右手系）
    const tB = tangents[i + 1]!;
    const nB = normals[i + 1]!;
    const bB = tB.clone().cross(nB);
    const pA = points[i]!;
    const pB = points[i + 1]!;
    const rA = radii[i]!;
    const rB = radii[i + 1]!;
    const vA = arcs[i]! * vScale;
    const vB = arcs[i + 1]! * vScale;
    for (let j = 0; j < radial; j++) {
      const th0 = (j / radial) * Math.PI * 2;
      const th1 = ((j + 1) / radial) * Math.PI * 2;
      const c0 = Math.cos(th0);
      const s0 = Math.sin(th0);
      const c1 = Math.cos(th1);
      const s1 = Math.sin(th1);
      const a0 = pA.clone().addScaledVector(nA, rA * c0).addScaledVector(bA, rA * s0);
      const a1 = pA.clone().addScaledVector(nA, rA * c1).addScaledVector(bA, rA * s1);
      const b0 = pB.clone().addScaledVector(nB, rB * c0).addScaledVector(bB, rB * s0);
      const b1 = pB.clone().addScaledVector(nB, rB * c1).addScaledVector(bB, rB * s1);
      // 顶点流：a0 a1 b1 | a0 b1 b0（外向绕制，法线解析写入）
      const u0 = j / radial;
      const u1 = (j + 1) / radial;
      for (const [v, n, u, vT] of [
        [a0, [c0, s0], u0, vA],
        [a1, [c1, s1], u1, vA],
        [b1, [c1, s1], u1, vB],
        [a0, [c0, s0], u0, vA],
        [b1, [c1, s1], u1, vB],
        [b0, [c0, s0], u0, vB],
      ] as const) {
        sink.pos.push(v.x, v.y, v.z);
        sink.nrm.push(n[0] * nA.x + n[1] * bA.x, n[0] * nA.y + n[1] * bA.y, n[0] * nA.z + n[1] * bA.z);
        sink.uv.push(u, vT);
      }
    }
  }
}

/** 主干底盖：封住从上方斜看进空心干身的可见洞；扇面 (c, V_j, V_{j+1})，法线 +Y */
function emitBaseCapTri(sink: BarkSink, center: THREE.Vector3, radius: number, radial: number): void {
  const tangent = new THREE.Vector3(0, 1, 0); // 主干首站切向恒近 +Y（lean 幅度 ≤4°）
  const seed = Math.abs(tangent.y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
  const n = seed.clone().sub(tangent.clone().multiplyScalar(tangent.dot(seed))).normalize();
  const b = tangent.clone().cross(n);
  for (let j = 0; j < radial; j++) {
    const th0 = (j / radial) * Math.PI * 2;
    const th1 = ((j + 1) / radial) * Math.PI * 2;
    const v0 = center.clone().addScaledVector(n, radius * Math.cos(th0)).addScaledVector(b, radius * Math.sin(th0));
    const v1 = center.clone().addScaledVector(n, radius * Math.cos(th1)).addScaledVector(b, radius * Math.sin(th1));
    for (const [vtx, u, vv] of [
      [center, 0.5, 0.5],
      [v0, 0.5 + 0.5 * Math.cos(th0), 0.5 + 0.5 * Math.sin(th0)],
      [v1, 0.5 + 0.5 * Math.cos(th1), 0.5 + 0.5 * Math.sin(th1)],
    ] as const) {
      sink.pos.push(vtx.x, vtx.y, vtx.z);
      sink.nrm.push(tangent.x, tangent.y, tangent.z);
      sink.uv.push(u, vv);
    }
  }
}

/**
 * 主生成入口：rng（morphRng）+ shapeProfile → 合并几何 + 账目。
 * 拓扑：主干（含根部 flare）→ 5 骨架枝 + 1 领导枝（L1）→ 逐级递归（L2×3 / L3×3 / L4×2 /
 * L5×2 末梢）；枝角/长度/粗度/曲率 rng 驱动（骨架枝横展上扬——夏栎冠形语言；领导枝
 * 直立续顶）。主次分级与冠内通透规则见模块头。profile 缺省 = slot-0 标准组合
 * （锚点回落——单测直调便捷路径，资产路径显式传槽 profile）。
 */
export function buildBroadleafGeometry(
  rng: () => number,
  profile: Tree3aShapeProfile = TREE3A_SLOT0_PROFILE,
): BroadleafTreeResult {
  const ctx: BuildCtx = {
    bark: { pos: [], nrm: [], uv: [] },
    leafCandidates: [],
    channels: [],
    levelBranches: [0, 0, 0, 0, 0],
    levelRadiusSum: [0, 0, 0, 0, 0],
    maxY: 0,
  };
  const bark = ctx.bark;

  // ── 全树形态参数（shapeProfile 域 + rng 连续抖动——皮结构计数固定）──
  const totalHeight = 8.1 + rng() * 0.8; // 形态参数域 8.1–8.9m（链式递归达成顶高 ≈0.85×H → 实高 7–8.6m）
  const crownRadius = (totalHeight * profile.crownWidthRatio * 0.5) * (0.94 + rng() * 0.12); // 冠幅半径 = 冠幅比驱动（含 ±6% 抖动）
  const trunkBaseR = 0.26 + rng() * 0.06; // 根径 0.26–0.32m
  const trunkH = totalHeight * (0.4 + rng() * 0.06); // 干高 40–46%
  const lean = randUnit(rng).multiplyScalar(jitter(rng, 0.07)); // 主干倾轴（≤4°——已符合项不动）

  // ── 主干：14 环段锥度曲线（根部 flare 1.32×指数衰减 × 0.42 顶径锥度）──
  const trunkPts: THREE.Vector3[] = [];
  const trunkRadii: number[] = [];
  const trunkTopR = trunkBaseR * 0.42;
  let dir = new THREE.Vector3(0, 1, 0).add(lean).normalize();
  let p = new THREE.Vector3(0, 0, 0);
  for (let i = 0; i <= profile.trunk.segs; i++) {
    const t = i / profile.trunk.segs;
    trunkPts.push(p.clone());
    const taper = trunkBaseR + (trunkTopR - trunkBaseR) * Math.pow(t, 0.85);
    const flare = 1 + 0.32 * Math.exp(-t * 7); // 根部张拉
    trunkRadii.push(Math.max(taper * flare, 0.01));
    if (i < profile.trunk.segs) {
      dir.add(randUnit(rng).multiplyScalar(profile.trunk.wander)).add(UP.clone().multiplyScalar(profile.trunk.upturn * 0.1)).normalize();
      p = p.clone().addScaledVector(dir, trunkH / profile.trunk.segs);
    }
  }
  emitTube(bark, trunkPts, trunkRadii, profile.trunk.radial, 0.5);
  emitBaseCapTri(bark, trunkPts[0]!, trunkRadii[0]!, profile.trunk.radial);
  ctx.maxY = Math.max(ctx.maxY, trunkPts[trunkPts.length - 1]!.y);

  /** 主干半径插值（挂点处子枝起径连续源） */
  const trunkRadiusAt = (t: number): number => {
    const idx = t * profile.trunk.segs;
    const i = Math.min(profile.trunk.segs - 1, Math.floor(idx));
    return THREE.MathUtils.lerp(trunkRadii[i]!, trunkRadii[i + 1]!, idx - i);
  };
  const trunkPointAt = (t: number): THREE.Vector3 => {
    const idx = t * profile.trunk.segs;
    const i = Math.min(profile.trunk.segs - 1, Math.floor(idx));
    return trunkPts[i]!.clone().lerp(trunkPts[i + 1]!, idx - i);
  };

  // ── L1 骨架枝 ×5（横展 55–70° 对铅垂，方位 72° 均分 + asymmetry 缩放抖动，挂高 55–95% 干高；
  //    rank 乘子拉开水势差——首枝主导 ×1.14 强化自 ×1.08，弱势枝 ×0.81——主次分级）──
  const scaffoldCount = profile.scaffoldCount;
  const phase0 = rng() * Math.PI * 2;
  for (let i = 0; i < scaffoldCount; i++) {
    const rank = Math.min(i, profile.scaffoldRankLength.length - 1);
    const az = phase0 + (i / scaffoldCount) * Math.PI * 2 + jitter(rng, profile.asymmetry * 0.88); // 方位抖动 ±25°·(asymmetry/0.5)
    const attachT = profile.scaffoldAttachMin + (i / scaffoldCount) * profile.scaffoldAttachSpan + jitter(rng, 0.06);
    // 横展角（对铅垂 55–70°）→ 方向分量：水平 sin / 铅垂 cos
    const tilt = THREE.MathUtils.degToRad(
      profile.scaffoldAngleMin + rng() * (profile.scaffoldAngleMax - profile.scaffoldAngleMin),
    );
    const length = crownRadius * profile.scaffoldRankLength[rank]! * (0.94 + rng() * 0.12);
    const attach = trunkPointAt(attachT);
    const dirH = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
    const bDir = dirH.clone().multiplyScalar(Math.sin(tilt)).add(UP.clone().multiplyScalar(Math.cos(tilt))).normalize();
    const startR = trunkRadiusAt(attachT) * profile.scaffoldThickness * profile.scaffoldRankRadius[rank]!;
    growBranch(ctx, rng, profile, 0, attach, bDir, length, startR, az);
    // 枝干通道②：骨架枝基段保护带（初方向直线近似——主干大枝进冠不被封死）
    ctx.channels.push(
      segOf(attach, attach.clone().addScaledVector(bDir, length * profile.channelLengthRatio), profile.channelRadius * profile.channelBranchScale),
    );
  }
  // ── L1 领导枝 ×1（直立续顶——树冠顶冠量与总高收束；中龄口径，顶枝优势裁决归 009.3）──
  const leaderAz = rng() * Math.PI * 2;
  const leaderDir = new THREE.Vector3(Math.cos(leaderAz) * 0.4, 0.92, Math.sin(leaderAz) * 0.4).normalize();
  const leaderLen = (totalHeight - trunkH) * (profile.leaderLengthRatio + rng() * 0.08);
  const leaderAttach = trunkPointAt(0.98);
  const leaderProtectEnd = leaderAttach.clone().addScaledVector(leaderDir, leaderLen * profile.channelLengthRatio);
  growBranch(
    ctx,
    rng,
    profile,
    0,
    leaderAttach,
    leaderDir,
    leaderLen,
    trunkRadiusAt(0.98) * 0.62,
    leaderAz,
  );
  // 枝干通道①：主干→领导枝保护段终点 = 连续中轴保护带（主干近直立 + 领导枝 0.92 直立，
  // 近共线直线近似）——主干大枝进冠不被封死；骨架枝基段保护带见上
  ctx.channels.push(segOf(new THREE.Vector3(0, 0, 0), leaderProtectEnd, profile.channelRadius));
  ctx.channels.push(segOf(leaderAttach, leaderProtectEnd, profile.channelRadius * profile.channelBranchScale));

  // ── 冠参考系（密度场判定基准）：中心/半高按 profile 比例 × 全树实际高，半径 = 冠幅生成参数 ──
  const treeTopY = ctx.maxY;
  const crownCenterY = treeTopY * profile.crownCenterRatio;
  const crownHalfH = treeTopY * profile.crownHeightRatio * 0.5;
  const crownR = crownRadius * 1.06; // 叶位径向外扩余量

  // ── 局部空腔（规则③）：rng 固定消费（每腔 4 次）——同 seed 同空腔 ──
  const voids: CavitySphere[] = [];
  for (let i = 0; i < profile.voidCount; i++) {
    const d = randUnit(rng); // 2 次
    const rr = profile.voidCenterBias * (0.25 + 0.75 * Math.sqrt(rng())); // 偏内分布
    const center = new THREE.Vector3(
      d.x * rr * crownR,
      crownCenterY + d.y * rr * crownHalfH * 0.8, // 垂直向压扁（冠形）
      d.z * rr * crownR,
    );
    voids.push({ center, radius: profile.voidRadiusMin + rng() * (profile.voidRadiusMax - profile.voidRadiusMin) });
  }

  // ── 冠内通透过滤：通道（硬）→ 空腔（硬）→ 密度场（rng 概率；每卡无条件消费 1 次——确定性）──
  const leafCards: LeafCard[] = [];
  let channelRejects = 0;
  let voidRejects = 0;
  let gradientRejects = 0;
  const qCandidates = [0, 0, 0, 0, 0];
  const qSurvived = [0, 0, 0, 0, 0];
  /** 冠内归一化径向深度（与密度场同口径：水平半径 / 该高度冠壳半径，端盖保护 0.3） */
  const qOf = (c: THREE.Vector3): number => {
    const dy = (c.y - crownCenterY) / crownHalfH;
    const shellFactor = Math.sqrt(Math.max(0, 1 - dy * dy));
    const rShell = Math.max(shellFactor, 0.3) * crownR;
    return Math.hypot(c.x, c.z) / rShell;
  };
  for (const card of ctx.leafCandidates) {
    const c = card.center;
    const qBucket = Math.min(4, Math.floor(qOf(c) / 0.2));
    qCandidates[qBucket]!++;
    const roll = rng(); // 无条件消费（消费次数与数据分支无关）
    let keep = true;
    if (keep) {
      for (const ch of ctx.channels) {
        if (distToSegmentSq(c.x, c.y, c.z, ch.ax, ch.ay, ch.az, ch.bx, ch.by, ch.bz) < ch.r2) {
          keep = false;
          channelRejects++;
          break;
        }
      }
    }
    if (keep) {
      for (const v of voids) {
        if (c.distanceToSquared(v.center) < v.radius * v.radius) {
          keep = false;
          voidRejects++;
          break;
        }
      }
    }
    if (keep) {
      // 内层密度衰减（规则②）：q = 冠内归一化径向深度（与 qOf 同口径）
      const q = qOf(c);
      let density: number;
      if (q >= profile.crownShellStart) density = 1;
      else if (q <= profile.crownCoreStart) density = profile.coreDensityFloor;
      else {
        density =
          profile.coreDensityFloor +
          (1 - profile.coreDensityFloor) *
            ((q - profile.crownCoreStart) / (profile.crownShellStart - profile.crownCoreStart));
      }
      const heightBias = 1 + profile.crownTopBias * ((c.y / treeTopY) * 2 - 1); // 冠顶偏置（slot-0 = 0）
      if (roll >= Math.min(1, Math.max(0, profile.canopyDensity * density * heightBias))) {
        keep = false;
        gradientRejects++;
      }
    }
    if (keep) {
      leafCards.push(card);
      qSurvived[qBucket]!++;
    }
  }

  // ── 叶卡烘焙（两段式：存活卡 Y 域 → 冠内高度权重 aBend）──
  let crownMinY = Infinity;
  let crownMaxY = -Infinity;
  for (const card of leafCards) {
    crownMinY = Math.min(crownMinY, card.center.y);
    crownMaxY = Math.max(crownMaxY, card.center.y);
  }
  const leafPos: number[] = [];
  const leafNrm: number[] = [];
  const leafUv: number[] = [];
  const leafRand: number[] = [];
  const leafBend: number[] = [];
  for (const card of leafCards) {
    const hw = THREE.MathUtils.clamp((card.center.y - crownMinY) / Math.max(0.01, crownMaxY - crownMinY), 0, 1);
    const bendRoot = 0.12 * hw; // 钉枝顶点 ≈ 0
    const bendTip = 0.52 + 0.44 * hw; // 叶尖大；树顶叶 > 树底叶
    const half = card.width / 2;
    const r0 = card.center.clone().addScaledVector(card.side, -half);
    const r1 = card.center.clone().addScaledVector(card.side, half);
    const t0 = r0.clone().addScaledVector(card.dir, card.height);
    const t1 = r1.clone().addScaledVector(card.dir, card.height);
    const n = card.side.clone().cross(card.dir).normalize();
    // 顶点序（非索引 6 顶点/卡）：r0 r1 t1 | r0 t1 t0；根 = 0,1,3 尖 = 2,4,5（aBend 契约序）
    const verts: [THREE.Vector3, number, number, number][] = [
      [r0, 0, 0, bendRoot],
      [r1, 1, 0, bendRoot],
      [t1, 1, 1, bendTip],
      [r0, 0, 0, bendRoot],
      [t1, 1, 1, bendTip],
      [t0, 0, 1, bendTip],
    ];
    for (const [v, u, vv, bend] of verts) {
      leafPos.push(v.x, v.y, v.z);
      leafNrm.push(n.x, n.y, n.z);
      leafUv.push(u, vv);
      leafRand.push(card.rand);
      leafBend.push(bend);
    }
  }

  // ── minY 精确贴地：全树（皮+叶）最低点上移至 0 ──
  let minY = Infinity;
  for (let i = 1; i < bark.pos.length; i += 3) minY = Math.min(minY, bark.pos[i]!);
  for (let i = 1; i < leafPos.length; i += 3) minY = Math.min(minY, leafPos[i]!);
  if (minY !== 0 && Number.isFinite(minY)) {
    for (let i = 1; i < bark.pos.length; i += 3) bark.pos[i]! -= minY;
    for (let i = 1; i < leafPos.length; i += 3) leafPos[i]! -= minY;
  }

  // ── 层几何组装：树皮（aLeafRand/aBend 恒 0——mergeGeometries 属性集一致）──
  const mkAttr = (arr: number[]): THREE.BufferAttribute => new THREE.BufferAttribute(new Float32Array(arr), 1);
  const barkGeo = new THREE.BufferGeometry();
  barkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bark.pos), 3));
  barkGeo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(bark.nrm), 3));
  barkGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(bark.uv), 2));
  barkGeo.setAttribute('aLeafRand', mkAttr(new Array(bark.pos.length / 3).fill(0)));
  barkGeo.setAttribute('aBend', mkAttr(new Array(bark.pos.length / 3).fill(0)));

  const leafGeo = new THREE.BufferGeometry();
  leafGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(leafPos), 3));
  leafGeo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(leafNrm), 3));
  leafGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(leafUv), 2));
  leafGeo.setAttribute('aLeafRand', mkAttr(leafRand));
  leafGeo.setAttribute('aBend', mkAttr(leafBend));

  const geometry = mergeGeometries([barkGeo, leafGeo], true); // 层间成组 → 恰 2 组（皮 0 / 叶 1）
  barkGeo.dispose(); // 合并拷贝数据，层中间体即弃
  leafGeo.dispose();
  if (!geometry) throw new Error('程序化资产 asset_tree_3a 层合并不兼容（属性集应一致：position/normal/uv/aLeafRand/aBend）');

  const groups = geometry.groups;
  return {
    geometry,
    stats: {
      barkTriangles: (groups[0]?.count ?? 0) / 3,
      leafTriangles: (groups[1]?.count ?? 0) / 3,
      leafCards: leafCards.length,
      leafCandidates: ctx.leafCandidates.length,
      channelRejects,
      voidRejects,
      gradientRejects,
      levelBranches: ctx.levelBranches,
      levelMeanStartRadius: ctx.levelBranches.map((n, i) => (n > 0 ? ctx.levelRadiusSum[i]! / n : 0)),
      crownCenterY,
      crownRadius: crownR,
      crownHalfHeight: crownHalfH,
      qCandidates,
      qSurvived,
      channels: ctx.channels.map((ch) => ({
        ax: ch.ax,
        ay: ch.ay,
        az: ch.az,
        bx: ch.bx,
        by: ch.by,
        bz: ch.bz,
        r: Math.sqrt(ch.r2),
      })),
    },
  };
}

/** 通道线段构造（半径平方预热） */
function segOf(a: THREE.Vector3, b: THREE.Vector3, radius: number): ChannelSeg {
  return { ax: a.x, ay: a.y, az: a.z, bx: b.x, by: b.y, bz: b.z, r2: radius * radius };
}

/**
 * 分枝递归：level 0–4（L1–L5）；路径 = 起点方向 + 每步游走 + 上扬偏置（夏栎横枝末段
 * 上翘）；起径 = 父径 × profile.radiusRatio[level]（低级陡末级缓——主次分级）、末径 =
 * 起径 × profile.endRatio[level]（L1 0.7 通体粗壮）；子枝挂点内埋父径内（起点回退
 * 2.5×子径，杜绝接缝黑洞）；末两级沿途发叶卡候选（挂点下限放宽——内层稀疏由冠内
 * 通透密度场接管，不再「只挂外段」）。
 */
function growBranch(
  ctx: BuildCtx,
  rng: () => number,
  profile: Tree3aShapeProfile,
  level: number,
  start: THREE.Vector3,
  dirIn: THREE.Vector3,
  length: number,
  startR: number,
  phase: number,
): void {
  const spec = profile.levels[level]!;
  const endR = Math.max(startR * profile.endRatio[level]!, 0.004);
  const pts: THREE.Vector3[] = [];
  const radii: number[] = [];
  let d = dirIn.clone().normalize();
  // 子枝起点内埋（回退进父枝体内；末级细枝回退量加大遮梢孔）
  const p0 = start.clone().addScaledVector(d, -(startR * 2.5 + 0.015));
  let p = p0;
  for (let i = 0; i <= spec.segs; i++) {
    const t = i / spec.segs;
    pts.push(p.clone());
    radii.push(startR + (endR - startR) * t); // 线性锥度（连续到子级）
    if (i < spec.segs) {
      d.add(randUnit(rng).multiplyScalar(spec.wander)).normalize();
      // 上扬偏置随 t 增强（横枝末段上翘——夏栎冠形语言）
      d.add(UP.clone().multiplyScalar(spec.upturn * t * 0.5)).normalize();
      p = p.clone().addScaledVector(d, length / spec.segs);
    }
  }
  emitTube(ctx.bark, pts, radii, spec.radial, 0.5);
  ctx.levelBranches[level]!++;
  ctx.levelRadiusSum[level]! += startR;
  ctx.maxY = Math.max(ctx.maxY, pts[pts.length - 1]!.y);

  const radiusAt = (t: number): number => {
    const idx = t * spec.segs;
    const i = Math.min(spec.segs - 1, Math.floor(idx));
    return THREE.MathUtils.lerp(radii[i]!, radii[i + 1]!, idx - i);
  };
  const pointAt = (t: number): THREE.Vector3 => {
    const idx = t * spec.segs;
    const i = Math.min(spec.segs - 1, Math.floor(idx));
    return pts[i]!.clone().lerp(pts[i + 1]!, idx - i);
  };

  // 末两级：沿途发叶卡候选（通透过滤在收冠后统一执行）
  const leafCards = level === 3 ? profile.leafCardsL4 : level === 4 ? profile.leafCardsL5 : 0;
  if (leafCards > 0) {
    const inner = level === 3 ? profile.leafInnerStartL4 : profile.leafInnerStartL5;
    for (let i = 0; i < leafCards; i++) {
      const t = THREE.MathUtils.clamp(inner + ((i + 0.5) / leafCards) * (1 - inner) + jitter(rng, 0.06), 0, 1);
      const center = pointAt(t).add(randUnit(rng).multiplyScalar(profile.leafOffsetMax * rng()));
      const az = rng() * Math.PI * 2;
      const el = jitter(rng, 0.75); // 仰角 ±43°（水平叶面为主混合——已符合项不动）
      const dir = new THREE.Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)).normalize();
      let side = dir.clone().cross(UP);
      if (side.lengthSq() < 1e-4) side = new THREE.Vector3(1, 0, 0);
      side.normalize();
      const roll = rng() * Math.PI; // 卡面滚转（取向全随机——打散规则感）
      side.applyAxisAngle(dir, roll).normalize();
      const width = profile.leafWidthMin + rng() * profile.leafWidthSpan;
      ctx.leafCandidates.push({
        center,
        dir,
        side,
        width,
        height: width * (profile.leafLenRatioMin + rng() * profile.leafLenRatioSpan),
        rand: rng(),
      });
    }
  }

  // 子级递归（L5 末级无子）
  if (level < profile.levels.length - 1) {
    const plan = profile.childPlan[level]!;
    for (let i = 0; i < plan.ts.length; i++) {
      const t = Math.min(1, plan.ts[i]! + jitter(rng, 0.05));
      const attach = pointAt(t);
      const attachR = radiusAt(t);
      const isTip = plan.ts[i] === 1.0;
      // 挂点父向（局部切向——侧枝混合用）
      const tTan = pointAt(Math.min(1, t + 0.15)).sub(pointAt(Math.max(0, t - 0.15))).normalize();
      let childDir: THREE.Vector3;
      let childPhase = phase;
      if (isTip) {
        // 延伸枝：延续父向 + 轻微上扬与游走
        childDir = tTan.clone().add(UP.clone().multiplyScalar(0.18)).add(randUnit(rng).multiplyScalar(0.25)).normalize();
      } else {
        // 侧枝：方位按父相位角均分展开（冠向四周填充 + 抖动）
        childPhase = phase + i * plan.phaseStep + jitter(rng, 0.35);
        const h = new THREE.Vector3(Math.cos(childPhase), 0, Math.sin(childPhase));
        childDir = h
          .multiplyScalar(0.8)
          .add(UP.clone().multiplyScalar(0.2 + rng() * 0.35))
          .add(tTan.clone().multiplyScalar(0.25))
          .normalize();
      }
      const lenRatio = profile.lengthRatioBase + rng() * profile.lengthRatioSpan + (level + 1) * 0.03; // 逐级长度衰减
      growBranch(
        ctx,
        rng,
        profile,
        level + 1,
        attach,
        childDir,
        length * lenRatio,
        attachR * profile.radiusRatio[level]!,
        childPhase,
      );
    }
  }
}
