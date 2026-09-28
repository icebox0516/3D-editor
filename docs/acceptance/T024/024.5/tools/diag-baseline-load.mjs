// 临时诊断：5174 装载期 console 收集 + __tree3aPerf 就绪探测
export default async ({ navigate, evalJs, sleep }) => {
  await navigate('http://localhost:5174');
  await sleep(6000);
  const ready = await evalJs(`typeof window.__tree3aPerf === 'object' && window.__tree3aPerf !== null`);
  const tree3a = await evalJs(`typeof window.__tree3a === 'object'`);
  return { ready, tree3a };
};
