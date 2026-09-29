// 校准自检页面验证：fresh tab mount → stats 应为 Step 4 后实数（7260 卡）
export default async ({ navigate, evalJs }) => {
  await navigate('http://localhost:5181');
  const has = await evalJs('typeof window.__metasequoia');
  if (has !== 'object' && has !== 'undefined') return { has };
  const stats = await evalJs(`window.__metasequoia.mount(), window.__metasequoia.stats ? window.__metasequoia.stats() : 'no-stats-fn'`);
  return { stats };
};
