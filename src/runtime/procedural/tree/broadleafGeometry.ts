/**
 * runtime/procedural/tree/broadleafGeometry —— 阔叶树（橡树系）CPU 几何生成器（T008.2）。
 *
 * 职责：morphRng（mulberry32 流，消费顺序即契约——同 seed 逐位同结果）驱动的五级递归
 *      分枝拓扑 → 锥度管状枝干（平行传输标架，径向分段随枝级递减 12→4、主干到枝梢锥度
 *      连续）→ 枝梢/冠外层叶卡烘焙，产出树皮/叶两层非索引几何；层间
 *      mergeGeometries(useGroups=true) 恰 2 组（D15 免组膨胀：树皮 0 / 叶 1）。
 *      **结构计数固定**（枝数/环数/径向段/每枝叶卡数不随 seed 变），随机量全部落在连续
 *      参数（角度/长度/曲率/朝向/尺寸）——任意 seed 三角面数与叶卡数恒定，
 *      meta.triangleCount 实数可声明；形态差异由连续扰动承载（中距离剪影目标：不规则
 *      但可信的阔叶树冠——空隙来自枝长差/方位抖动/叶卡随机外扩，无几何体感）。
 * 叶卡属性契约（本任务冻结，008.3 只消费不修改）：
 *      - aLeafRand：Float32 itemSize 1，逐叶 ∈ [0,1)，同一叶卡 6 顶点同值——色相/透光/
 *        大小变奏源；
 *      - aBend：Float32 itemSize 1 ∈ [0,1]，风动摆幅权重 = 离枝距离（卡内根→尖）+
 *        冠内高度权重 hw = (y - 冠底)/(冠顶 - 冠底)：根顶点 0.12·hw（钉枝≈0）、尖顶点
 *        0.52 + 0.44·hw（树顶叶 > 树底叶），卡内根→尖恒非降；
 *      - 树皮层同名属性写恒等值 0（mergeGeometries 全几何属性集一致要求）。
 * 边界：零外部模型（D13）；每次调用全部数据现算（无模块级缓存对象，D17 所有权随调用
 *      移交）；原点 = 底部中心（整体 Y 平移使 minY 精确 = 0，GLB MODEL_BASE_HEIGHT
 *      语义对齐）；叶卡 UV 标准 0–1 四边形域（008.3 SDF 叶形 alpha 消费）；叶法线取
 *      卡面单侧（cross(side, dir)，材质侧向策略由资产层声明）。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** 枝级表：径向分段（主干 12 → 末级 4）/ 环段数 / 每步游走幅度 / 上扬曲率偏置 / 叶卡数（末两级） */
interface LevelSpec {
  radial: number;
  segs: number;
  wander: number;
  upturn: number;
  leafCards: number;
}

/** 五级分枝表（L1 骨架枝 → L5 末梢，L1 另含 1 根领导枝共 6 枝；固定计数 = 面数恒定） */
const LEVELS: LevelSpec[] = [
  { radial: 8, segs: 9, wander: 0.14, upturn: 0.3, leafCards: 0 },
  { radial: 7, segs: 8, wander: 0.18, upturn: 0.22, leafCards: 0 },
  { radial: 6, segs: 5, wander: 0.22, upturn: 0.18, leafCards: 0 },
  { radial: 5, segs: 4, wander: 0.26, upturn: 0.15, leafCards: 7 }, // L4：外段叶
  { radial: 4, segs: 3, wander: 0.3, upturn: 0.12, leafCards: 14 }, // L5：末梢满布叶
];

/** 主干径向分段（任务书：主干 10–12）与环段数 */
const TRUNK = { radial: 12, segs: 14, wander: 0.05, upturn: 0.06 };

/** 子枝挂点参数（t 沿父枝；末位 1.0 = 延伸延续枝）：L1→3 / L2→3 / L3→3 / L4→2 */
const CHILD_PLAN: { ts: number[]; phaseStep: number }[] = [
  { ts: [0.45, 0.72, 1.0], phaseStep: (Math.PI * 2) / 3 },
  { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
  { ts: [0.5, 0.78, 1.0], phaseStep: (Math.PI * 2) / 3 },
  { ts: [0.62, 1.0], phaseStep: Math.PI },
];

/** 叶卡几何常量（米）：卡宽/长抖动域与叶位径向抖动 */
const LEAF = { widthMin: 0.15, widthSpan: 0.08, lenRatioMin: 0.85, lenRatioSpan: 0.3, offsetMax: 0.07 };

/** 叶卡描述子：烘焙前先收集（冠内高度权重需全树冠包围盒，两段式烘焙） */
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

/** 生成结果：合并几何（恰 2 组）+ 面数账目（完成记录 / DEV 出图面消费） */
export interface BroadleafTreeResult {
  geometry: THREE.BufferGeometry;
  stats: { barkTriangles: number; leafTriangles: number; leafCards: number };
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

/**
 * 主生成入口：rng（morphRng）→ 合并几何 + 账目。
 * 拓扑：主干（含根部 flare）→ 5 骨架枝 + 1 领导枝（L1）→ 逐级递归（L2×3 / L3×3 / L4×2 /
 * L5×2 末梢）；枝角/长度/曲率 rng 驱动（骨架枝横展上扬——橡树系冠形；领导枝直立续顶）。
 */
export function buildBroadleafGeometry(rng: () => number): BroadleafTreeResult {
  const bark: BarkSink = { pos: [], nrm: [], uv: [] };
  const leafCards: LeafCard[] = [];

  // ── 全树形态参数（连续域随机——结构计数固定）──
  const totalHeight = 8.1 + rng() * 0.8; // 形态参数域 8.1–8.9m（链式递归达成顶高 ≈0.85×H → 实高 7–8.6m）
  const crownRadius = 2.55 + rng() * 0.5; // 冠幅半径 2.55–3.05m（冠幅 5.1–6.6m 含叶卡外扩）
  const trunkBaseR = 0.26 + rng() * 0.06; // 根径 0.26–0.32m
  const trunkH = totalHeight * (0.4 + rng() * 0.06); // 干高 40–46%
  const lean = randUnit(rng).multiplyScalar(jitter(rng, 0.07)); // 主干倾轴（≤4°）

  // ── 主干：14 环段锥度曲线（根部 flare 1.32×指数衰减 × 0.42 顶径锥度）──
  const trunkPts: THREE.Vector3[] = [];
  const trunkRadii: number[] = [];
  const trunkTopR = trunkBaseR * 0.42;
  let dir = new THREE.Vector3(0, 1, 0).add(lean).normalize();
  let p = new THREE.Vector3(0, 0, 0);
  for (let i = 0; i <= TRUNK.segs; i++) {
    const t = i / TRUNK.segs;
    trunkPts.push(p.clone());
    const taper = trunkBaseR + (trunkTopR - trunkBaseR) * Math.pow(t, 0.85);
    const flare = 1 + 0.32 * Math.exp(-t * 7); // 根部张拉
    trunkRadii.push(Math.max(taper * flare, 0.01));
    if (i < TRUNK.segs) {
      dir.add(randUnit(rng).multiplyScalar(TRUNK.wander)).add(UP.clone().multiplyScalar(TRUNK.upturn * 0.1)).normalize();
      p = p.clone().addScaledVector(dir, trunkH / TRUNK.segs);
    }
  }
  emitTube(bark, trunkPts, trunkRadii, TRUNK.radial, 0.5);
  emitBaseCapTri(bark, trunkPts[0]!, trunkRadii[0]!, TRUNK.radial);

  /** 主干半径插值（挂点处子枝起径连续源） */
  const trunkRadiusAt = (t: number): number => {
    const idx = t * TRUNK.segs;
    const i = Math.min(TRUNK.segs - 1, Math.floor(idx));
    return THREE.MathUtils.lerp(trunkRadii[i]!, trunkRadii[i + 1]!, idx - i);
  };
  const trunkPointAt = (t: number): THREE.Vector3 => {
    const idx = t * TRUNK.segs;
    const i = Math.min(TRUNK.segs - 1, Math.floor(idx));
    return trunkPts[i]!.clone().lerp(trunkPts[i + 1]!, idx - i);
  };

  // ── L1 骨架枝 ×5（横展 55–70°，方位 72° 均分 + ±25° 抖动，挂高 55–95% 干高）──
  const scaffoldCount = 5;
  const phase0 = rng() * Math.PI * 2;
  for (let i = 0; i < scaffoldCount; i++) {
    const az = phase0 + (i / scaffoldCount) * Math.PI * 2 + jitter(rng, 0.44); // 方位抖动 ±25°
    const attachT = 0.55 + (i / scaffoldCount) * 0.35 + jitter(rng, 0.06);
    const length = crownRadius * (0.78 + rng() * 0.28) * (i === 0 ? 1.08 : 1.0); // 首枝主导
    const attach = trunkPointAt(attachT);
    const dirH = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
    const bDir = dirH.clone().multiplyScalar(0.85).add(UP.clone().multiplyScalar(0.25 + rng() * 0.3)).normalize();
    growBranch(bark, leafCards, rng, 0, attach, bDir, length, trunkRadiusAt(attachT) * 0.55, az);
  }
  // ── L1 领导枝 ×1（直立续顶——树冠顶冠量与总高收束；链长 ≈2×本段，段长 ≈(H-干高)/2）──
  const leaderAz = rng() * Math.PI * 2;
  const leaderDir = new THREE.Vector3(Math.cos(leaderAz) * 0.4, 0.92, Math.sin(leaderAz) * 0.4).normalize();
  growBranch(
    bark,
    leafCards,
    rng,
    0,
    trunkPointAt(0.98),
    leaderDir,
    (totalHeight - trunkH) * (0.48 + rng() * 0.08),
    trunkRadiusAt(0.98) * 0.62,
    leaderAz,
  );

  // ── 叶卡烘焙（两段式：先收集，冠内高度权重需全树冠 Y 域）──
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
    },
  };
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
 * 分枝递归：level 0–4（L1–L5）；路径 = 起点方向 + 每步游走 + 上扬偏置（橡树横枝末段
 * 上翘），起径 = 父径 × 级系数（连续锥度）、末径 = 起径 × 0.62；子枝挂点内埋父径内
 * （起点回退 2.5×子径，杜绝接缝黑洞）；末两级沿途发叶卡（外段偏置——受光叶在冠壳）。
 */
function growBranch(
  bark: BarkSink,
  leafCards: LeafCard[],
  rng: () => number,
  level: number,
  start: THREE.Vector3,
  dirIn: THREE.Vector3,
  length: number,
  startR: number,
  phase: number,
): void {
  const spec = LEVELS[level]!;
  const endR = Math.max(startR * 0.62, 0.004);
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
      // 上扬偏置随 t 增强（横枝末段上翘——橡树冠形语言）
      d.add(UP.clone().multiplyScalar(spec.upturn * t * 0.5)).normalize();
      p = p.clone().addScaledVector(d, length / spec.segs);
    }
  }
  emitTube(bark, pts, radii, spec.radial, 0.5);

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

  // 末两级：沿途发叶卡（外段密度——枝梢与冠外层）
  if (spec.leafCards > 0) {
    const inner = level === 3 ? 0.55 : 0.3; // L4 外 45%，L5 外 70%
    for (let i = 0; i < spec.leafCards; i++) {
      const t = THREE.MathUtils.clamp(inner + ((i + 0.5) / spec.leafCards) * (1 - inner) + jitter(rng, 0.06), 0, 1);
      const center = pointAt(t).add(randUnit(rng).multiplyScalar(LEAF.offsetMax * rng()));
      const az = rng() * Math.PI * 2;
      const el = jitter(rng, 0.75); // 仰角 ±43°（水平叶面为主混合）
      const dir = new THREE.Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)).normalize();
      let side = dir.clone().cross(UP);
      if (side.lengthSq() < 1e-4) side = new THREE.Vector3(1, 0, 0);
      side.normalize();
      const roll = rng() * Math.PI; // 卡面滚转（取向全随机——打散规则感）
      side.applyAxisAngle(dir, roll).normalize();
      const width = LEAF.widthMin + rng() * LEAF.widthSpan;
      leafCards.push({
        center,
        dir,
        side,
        width,
        height: width * (LEAF.lenRatioMin + rng() * LEAF.lenRatioSpan),
        rand: rng(),
      });
    }
  }

  // 子级递归（L5 末级无子）
  if (level < LEVELS.length - 1) {
    const plan = CHILD_PLAN[level]!;
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
      const lenRatio = 0.4 + rng() * 0.15 + (level + 1) * 0.03; // 逐级长度衰减 0.43–0.7
      growBranch(
        bark,
        leafCards,
        rng,
        level + 1,
        attach,
        childDir,
        length * lenRatio,
        attachR * (0.55 + level * 0.03),
        childPhase,
      );
    }
  }
}
