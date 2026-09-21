// T011.9 sophora 真实编译验证 CDP 驱动脚本（配合 011.8 tools/cdp.mjs 使用——端口 9333 手动/无头 Chrome）
// 用法：node docs/acceptance/t011/011.8/tools/cdp.mjs docs/acceptance/t011/011.9/tools/compile-check-driver.mjs
export default async ({ navigate, evalJs, sleep }) => {
  await navigate('http://127.0.0.1:5199/docs/acceptance/t011/011.9/tools/compile-check.html');
  let result = null;
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    result = await evalJs('typeof window.__SOPHORA_COMPILE_CHECK !== "undefined" ? window.__SOPHORA_COMPILE_CHECK : null', { awaitPromise: false });
    if (result) break;
  }
  if (!result) {
    const errs = await evalJs('window.__SOPHORA_ERRORS ?? []', { awaitPromise: false });
    return { ok: false, errors: ['result missing — page did not set __SOPHORA_COMPILE_CHECK', ...errs] };
  }
  // X4000 = FXC 保守误报（011.6 终裁口径——接受记档不追逐）；其余 warning 视为真实告警
  const realWarnings = (result.warnings ?? []).filter((w) => !String(w).includes('X4000'));
  const x4000 = (result.warnings ?? []).filter((w) => String(w).includes('X4000'));
  return { ...result, warnings: realWarnings, x4000, verdict: result.ok && realWarnings.length === 0 ? 'PASS' : 'FAIL' };
};
