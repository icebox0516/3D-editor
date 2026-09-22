// T011.11 女贞 Step 4 复拍批（续跑会话）——三项裁定取证：
// ① 树皮第 12 语言双机位 v2：view() targetY 覆盖（runtime-agent 扩展）取裸干段
//    （y≈1.6，冠底 2.52 以下）——原 bark 帧冠心 5.6 目标 1.2m 相机落密冠内被叶幕
//    遮挡失效（判读实证：中性复读见枝叶特写无主干；fraxinus 同机位中通透成立对照）
// ② 核果近距可见性 A/B：果簇渲染实证链 25m✓/12m✓/6m✗/4m✗（az95/az305 暗背景低对比
//    疑点）——az35 受光面 4m + 冠侧 2m×2 仰角 + 冠下仰拍（下垂读向）四机位定谳
// ③ 革质光泽横向 A/B：香樟同机位 macro×2 + C7（011.2 Step 4b 校准终读「温和可辨
//    无锐高光——无 envMap 结构上限」= 家族基线；女贞 0.44 应 ≥ 樟 0.50 读向）
//    + 女贞 macro el0 同 session 复拍（A/B 同 session 锚）
export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  // ── 女贞 slot-0 冻结帧：树皮双机位 v2 + 果簇近距四机位 + macro 同 session 锚 ──
  await evalJs('window.__ligustrum.mount()');
  await evalJs('window.__ligustrum.freezeTime()');
  for (const [name, view] of [
    ['bark-trunk-1p2m-v2', { distance: 1.2, azimuthDeg: 35, elevationDeg: 4, targetY: 1.6 }],   // 树皮 a：干中段裸干（y1.6）
    ['bark-trunk-1p2m-az125-v2', { distance: 1.2, azimuthDeg: 125, elevationDeg: 10, targetY: 1.6 }], // 树皮 b：第二方位
    ['drupes-4m-az35', { distance: 4, azimuthDeg: 35, elevationDeg: 15 }],    // 果 A/B：受光方位 4m（原 az95 同参数对照）
    ['fruit-close-2m-el25', { distance: 2, azimuthDeg: 35, elevationDeg: 25 }],// 果近距 a：冠侧上部（25m 点簇读出方位）
    ['fruit-close-2m-el8', { distance: 2, azimuthDeg: 35, elevationDeg: 8 }], // 果近距 b：冠侧赤道
    ['fruit-underside-3p5m', { distance: 3.5, azimuthDeg: 35, elevationDeg: -20 }], // 果近距 c：冠下仰拍（下垂密簇 vs 天空）
    ['macro-2p8m-el0-s2', { distance: 2.8, azimuthDeg: 35, elevationDeg: 0 }],// 光泽 A/B 同 session 锚（女贞侧）
  ]) {
    await evalJs(`window.__ligustrum.view(${JSON.stringify(view)})`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.11/${name}.png`);
  }
  await evalJs('window.__ligustrum.unmount()');

  // ── 香樟对照（同 session 同灯光同机位——光泽家族基线 A/B）──
  await evalJs('window.__camphor.mount()');
  await evalJs('window.__camphor.freezeTime()');
  for (const [name, view] of [
    ['ref-camphor-macro-el0', { distance: 2.8, azimuthDeg: 35, elevationDeg: 0 }],
    ['ref-camphor-macro-el20', { distance: 2.8, azimuthDeg: 35, elevationDeg: 20 }],
    ['ref-camphor-c7', { distance: 7, azimuthDeg: 35, elevationDeg: 12 }],
  ]) {
    await evalJs(`window.__camphor.view(${JSON.stringify(view)})`);
    await sleep(1200);
    await screenshot(`docs/acceptance/t011/011.11/${name}.png`);
  }
  await evalJs('window.__camphor.unmount()');
  return 'ok';
};
