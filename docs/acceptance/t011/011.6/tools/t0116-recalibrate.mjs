// T011.6 校准复判（D35 同会话冷启动复验）：全新 profile Chrome 9335（无 program cache）
// → 三档首编译遍历 + 转台一轮 → console 分阶段快照（High / +Mid+Low / +转台）必须全 []
// 观察：L523 KOE_FLOWER_BODY koeFCen/koeFVar 同型未初始化声明——Mid/Low 皮程序是否报同款 X4000
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  // console 钩子（挂载前装好——error+warn 双通道）
  await evalJs(`
    (function () {
      window.__t0116log = [];
      const push = (kind) => (...args) => window.__t0116log.push(kind + ':' + args.map(String).join(' '));
      console.error = push('error'); console.warn = push('warn');
    })()
  `, { awaitPromise: false });

  const snapshot = () => evalJs('(function(){ return window.__t0116log.slice() })()');
  const out = {};

  // 阶段 1：单树 mount（High 皮/叶颜色材质 + 深度材质首编译——含花卡域）
  await evalJs('window.__koelreuteria.mount()');
  await sleep(1500);
  out.stage1_highFirstCompile = await snapshot();

  // 阶段 2：三档 mountLevels（Mid/Low 颜色/深度材质首编译——L523 观察位）
  await evalJs('window.__koelreuteria.unmount()');
  await evalJs('window.__koelreuteria.mountLevels({ slot: 0 })');
  await evalJs('window.__koelreuteria.viewLevels()');
  await sleep(1500);
  out.stage2_levelsMidLowFirstCompile = await snapshot();

  // 阶段 3：转台一轮（动态渲染态）
  await evalJs('window.__koelreuteria.unmount()');
  await evalJs('window.__koelreuteria.mount()');
  await evalJs('window.__koelreuteria.turntable(0.3)');
  await sleep(3000);
  await evalJs('window.__koelreuteria.turntable(0)');
  await evalJs('window.__koelreuteria.dispose()');
  out.stage3_turntable = await snapshot();

  out.finalVerdict = (out.stage3_turntable.length === 0 && out.stage2_levelsMidLowFirstCompile.length === 0 && out.stage1_highFirstCompile.length === 0) ? 'ZERO_ERROR_ZERO_WARN' : 'VIOLATION';
  return out;
};
