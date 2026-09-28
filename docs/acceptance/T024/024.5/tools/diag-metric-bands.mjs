// T024.5 诊断脚本（临时）：确定性复算 place 网格 → 每树 m → 过渡带人口。
// 判别：449 级联冻结人口（canopy 起步 × m∈(canopyToCulled, canopyToCulled*(1+W))）
// 与 probe 观测（A 225 / B 296）对照；150 带内人口对照 near-gate 观测（A 196 / B 0）。
// 纯读 src（域纯函数 + 资产 build），零运行时状态、零浏览器。跑法：
//   npx vite-node docs/acceptance/T024/024.5/tools/diag-metric-bands.mjs
import * as THREE from 'three';
import { applyAssetVariants, morphSeedOf, shapeSlotOf, MODEL_BASE_HEIGHT } from '../../../../../src/domain/assets';
import { LOD_THRESHOLDS } from '../../../../../src/domain/lod/lodPolicy';
import { collectProceduralAssetMetas, getProceduralBuild, getProceduralMeta } from '../../../../../src/runtime/procedural/routes';
import { buildBroadleafCanopyGeometry } from '../../../../../src/runtime/procedural/tree/broadleafCanopyProxy';

// 触发 *.asset.ts 自注册（与 collectProceduralAssetMetas 同一 glob 模式）
const mods = import.meta.glob('../../../../../src/runtime/procedural/assets/*.asset.ts', { eager: true });
for (const [path, mod] of Object.entries(mods)) {
  if (mod && typeof mod === 'object' && 'meta' in mod) {
    // routes 的注册在模块副作用里完成（registerProceduralRoute）——eager import 即注册
    void path;
  }
}

const ASSETS_13 = [
  'asset_tree_3a', 'asset_tree_celtis', 'asset_tree_camphor', 'asset_tree_zelkova',
  'asset_tree_ginkgo', 'asset_tree_platanus', 'asset_tree_koelreuteria', 'asset_tree_triadica',
  'asset_tree_bischofia', 'asset_tree_sophora', 'asset_tree_fraxinus', 'asset_tree_ligustrum',
  'asset_tree_salix',
];

// ── bootstrap 常量复刻（T024.5 简报口径）─────────────────────
const TARGET_Y = 3.6; // TREE3A_PERF_TARGET_Y
const FOV_Y = 50; // Renderer PerspectiveCamera(50, ...)
const TAN = Math.tan(((FOV_Y / 2) * Math.PI) / 180);
const spacing = 10;
const count = 2000;
const seedBase = 1;

function cameraPos(distance) {
  const az = (35 * Math.PI) / 180;
  const el = (16 * Math.PI) / 180;
  return new THREE.Vector3(
    distance * Math.cos(el) * Math.cos(az),
    TARGET_Y + distance * Math.sin(el),
    distance * Math.cos(el) * Math.sin(az),
  );
}

// ── 每资产每槽 High 基准球（T006.6：freezeFromHighSource 同口径）+ canopy 代理球 ──
const refSpheres = new Map(); // `${assetId}#${slot}` -> {center, radius}
const canopySpheres = new Map();
function sphereOf(cache, assetId, slot) {
  const key = `${assetId}#${slot}`;
  let s = cache.get(key);
  if (s) return s;
  let src;
  let geometry;
  if (cache === refSpheres) {
    const build = getProceduralBuild(assetId);
    src = build({ seed: morphSeedOf(assetId, slot), level: 'high' });
    geometry = src.geometry;
  } else {
    geometry = buildBroadleafCanopyGeometry(assetId, morphSeedOf(assetId, slot)).geometry;
  }
  geometry.computeBoundingSphere();
  const b = geometry.boundingSphere;
  s = { center: b.center.clone(), radius: b.radius };
  cache.set(key, s);
  if (cache === refSpheres) src.geometry.dispose();
  else geometry.dispose();
  return s;
}

// ── place 复刻（bootstrap place 同式）────────────────────────
function simulate(assetIds) {
  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  const trees = [];
  for (let i = 0; i < count; i++) {
    const assetId = assetIds[i % assetIds.length];
    const meta = getProceduralMeta(assetId);
    const seed = seedBase + i;
    const variant = applyAssetVariants(meta.variants, seed);
    const slot = shapeSlotOf(seed, meta.shapeFamily.size);
    const scaleMax = Math.max(
      meta.defaultScale.x * (variant.scaleFactor ?? 1),
      meta.defaultScale.y * (variant.scaleFactor ?? 1),
      meta.defaultScale.z * (variant.scaleFactor ?? 1),
    );
    trees.push({ i, assetId, slot, scaleMax, pos: new THREE.Vector3(
      ((i % columns) - (columns - 1) / 2) * spacing,
      MODEL_BASE_HEIGHT,
      (Math.floor(i / columns) - (rows - 1) / 2) * spacing,
    )});
  }
  return trees;
}

function metricAt(trees, cam, useCanopySphere = false) {
  const _q = new THREE.Quaternion();
  const _e = new THREE.Euler();
  const _s = new THREE.Vector3();
  const _c = new THREE.Vector3();
  return trees.map((t) => {
    const meta = getProceduralMeta(t.assetId);
    const sphere = sphereOf(useCanopySphere ? canopySpheres : refSpheres, t.assetId, t.slot);
    _e.set(meta.defaultRotation.x, meta.defaultRotation.y, meta.defaultRotation.z);
    _q.setFromEuler(_e);
    _s.setScalar(t.scaleMax);
    _c.copy(sphere.center).applyQuaternion(_q).multiply(_s).add(t.pos);
    const d = cam.distanceTo(_c);
    return (d / (sphere.radius * t.scaleMax)) * TAN;
  });
}

function classify(m) {
  const { highToMid, midToCanopy, canopyToCulled } = LOD_THRESHOLDS;
  if (m <= highToMid) return 'high';
  if (m <= midToCanopy) return 'mid';
  if (m <= canopyToCulled) return 'canopy';
  return 'culled';
}

function report(name, assetIds) {
  const trees = simulate(assetIds);
  const cam150 = cameraPos(150);
  const cam449 = cameraPos(449);
  const m150 = metricAt(trees, cam150, false);
  const m449 = metricAt(trees, cam449, false);
  const { midToCanopy, canopyToCulled } = LOD_THRESHOLDS;
  const W = 0.25;
  const ditherHi = midToCanopy * (1 + W); // 20
  const fadeHi = canopyToCulled * (1 + W); // 75

  // 150 静止带内人口（near-gate 预期 tInst：dither (16,20] + fade (60,75)）
  const at150 = m150.map((m) => classify(m));
  let dither150 = 0, fade150 = 0;
  for (const m of m150) {
    if (m > midToCanopy && m <= ditherHi) dither150++;
    if (m > canopyToCulled && m < fadeHi) fade150++;
  }
  const hist150 = {};
  for (const r of at150) hist150[r] = (hist150[r] ?? 0) + 1;

  // 级联仿真：pull 前状态 = 150 静止终态（决策历史：steady 表示 = nominal；带内者 current = 旧侧表示）
  // currentAtPull：m∈(16,20] → 'mid'（dither 降档未完成）；m∈(60,75) → 'canopy'（fade 未完成）；其余 = nominal
  let frozen = 0, instantCull = 0, toMid = 0, staysCanopy = 0, ditherActive449 = 0, fadeActive449 = 0;
  for (let k = 0; k < trees.length; k++) {
    const m0 = m150[k], m1 = m449[k];
    const current = m0 > midToCanopy && m0 <= ditherHi ? 'mid'
      : m0 > canopyToCulled && m0 < fadeHi ? 'canopy'
      : at150[k];
    const dec = classify(m1); // 降档方向无迟滞
    if (dec === 'culled') {
      if (current === 'canopy') {
        if (m1 < fadeHi) { frozen++; fadeActive449++; }
        else instantCull++;
      } else instantCull++; // high/mid 起步 = hard-cut 瞬时 cull
    } else if (dec === 'canopy' && current === 'mid') {
      // 升档 dither（迟滞线锚定 16*0.85=13.6；150 侧 current='mid' 只有带内者——此处只统计带间漂移）
      const f = (midToCanopy * (1 - LOD_THRESHOLDS.hysteresisBand) - m1) / (midToCanopy * W);
      if (f > 0 && f < 1) { ditherActive449++; }
      else if (f >= 1) toMid++;
      else staysCanopy++;
    } else if (dec === 'canopy' && current === 'canopy') staysCanopy++;
  }
  console.log(`\n== ${name} ==`);
  console.log(`150 名义分布:`, hist150, `| 带内: dither=${dither150} fade=${fade150} (near-gate 预期 tInst=${dither150 + fade150})`);
  console.log(`449 级联: 冻结(canopy×(60,75))=${frozen} 瞬时cull=${instantCull} 升档dither带内=${ditherActive449} →mid完成=${toMid} 留canopy=${staysCanopy}`);
  // spawn@449 对照：culled = m449 > 75（高起步 hard-cut，无 fade）
  const culledSpawn = m449.filter((m) => m > fadeHi).length;
  const canopySpawn = m449.filter((m) => m <= canopyToCulled && m > midToCanopy).length;
  const midSpawn = m449.filter((m) => m <= midToCanopy && m > LOD_THRESHOLDS.highToMid).length;
  console.log(`449 spawn: culled=${culledSpawn} canopy=${canopySpawn} mid=${midSpawn}`);
  // canopy 球回退对照（若基准球未命中，m 用 canopy 代理球重算）
  const m449c = metricAt(trees, cam449, true);
  const frozenFallback = m449c.filter((m) => m > canopyToCulled && m < fadeHi).length;
  const culledFallback = m449c.filter((m) => m > fadeHi).length;
  console.log(`[对照] 若用 canopy 球: 449 带内=${frozenFallback} culled=${culledFallback}`);
}

// 每资产球半径一览（tree3a 8 槽 high vs canopy）
console.log('== tree3a 槽球对照（high 基准 vs canopy 代理）==');
for (let slot = 0; slot < 8; slot++) {
  const h = sphereOf(refSpheres, 'asset_tree_3a', slot);
  const c = sphereOf(canopySpheres, 'asset_tree_3a', slot);
  console.log(`slot${slot}: high r=${h.radius.toFixed(2)} center.y=${h.center.y.toFixed(2)} | canopy r=${c.radius.toFixed(2)} center.y=${c.center.y.toFixed(2)}`);
}

report('B 单卡 tree3a', ['asset_tree_3a']);
report('A/C 混植 13 树', ASSETS_13);
