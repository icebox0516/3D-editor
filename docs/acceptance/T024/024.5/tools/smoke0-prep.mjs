// T024.5 冒烟前置：读当前 profile 的 localStorage 相关键存量（模板表 / 色点存储），
// 有残留则清空（冒烟判据要求 t3d-editor.templates 从空表开始、asset-presets 由
// S1 末预置）。输出清理前后读数。
// 用法：node cdp.mjs smoke0-prep.mjs
import { PORT, waitReady } from './smoke-lib.mjs';

export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await setViewport(1920, 1080);
  await navigate(`http://localhost:${PORT}`);
  await waitReady(evalJs, sleep);
  const before = {
    templates: await evalJs(`localStorage.getItem('t3d-editor.templates')`),
    assetPresets: await evalJs(`localStorage.getItem('t3d-editor.asset-presets')`),
  };
  await evalJs(`(() => {
    localStorage.removeItem('t3d-editor.templates');
    localStorage.removeItem('t3d-editor.asset-presets');
    return 'cleaned';
  })()`);
  const after = {
    templates: await evalJs(`localStorage.getItem('t3d-editor.templates')`),
    assetPresets: await evalJs(`localStorage.getItem('t3d-editor.asset-presets')`),
  };
  return { before, after };
};
