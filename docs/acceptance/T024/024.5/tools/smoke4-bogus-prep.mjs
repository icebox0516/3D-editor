// T024.5 冒烟用例 3 准备：默认卡参照帧自采（place ginkgo 无 preset → M25 帧）+
// 伪造已删卡模板——复制 t0245-smoke-card 条目 → objects[0].asset.preset 改
// 'no_such_card' → 改名 t0245-smoke-bogus 写回 localStorage（其余条目保持）。
// 用法：node cdp.mjs smoke4-bogus-prep.mjs
import {
  PORT, FRAMES_DIR, M25_VIEW, waitReady, ensureBrowserCollapsed, shootFrame, readTemplatesRaw,
} from './smoke-lib.mjs';

export default async ({ navigate, setViewport, evalJs, screenshot, sleep }) => {
  await setViewport(1920, 1080);
  await navigate(`http://localhost:${PORT}`);
  await waitReady(evalJs, sleep);
  const layout = await ensureBrowserCollapsed(evalJs, sleep);
  await evalJs('window.__tree3aPerf.freezeTime(2.5)');

  // ── 默认卡参照帧（同机位协议自采）──
  const placeOk = await evalJs(
    `window.__tree3aPerf.place({ assetId: 'asset_tree_ginkgo', count: 1, seedBase: 1, spacing: 11, jitter: false })`,
  );
  await evalJs(M25_VIEW);
  const frameDefaultRef = await shootFrame(evalJs, sleep, screenshot, `${FRAMES_DIR}/frame-default-ref.png`, { wantHandleObjects: 1 });

  // ── 伪造 bogus 模板（结构 = TemplatePayload {id, name, scene}；builtin 字段可缺省）──
  const entries = await readTemplatesRaw(evalJs);
  const source = (entries ?? []).find((e) => e.name === 't0245-smoke-card');
  if (!source) throw new Error('t0245-smoke-card not found in localStorage');
  const bogus = JSON.parse(JSON.stringify(source));
  bogus.id = 'tpl_smoke_bogus_manual';
  bogus.name = 't0245-smoke-bogus';
  delete bogus.builtin;
  bogus.scene.objects[0].asset.preset = 'no_such_card';
  const next = [...(entries ?? []).filter((e) => e.name !== 't0245-smoke-bogus'), bogus];
  await evalJs(`localStorage.setItem('t3d-editor.templates', ${JSON.stringify(JSON.stringify(next))}); 'written'`);

  const verify = await readTemplatesRaw(evalJs);
  const bogusEntry = verify.find((e) => e.name === 't0245-smoke-bogus');
  return {
    layout,
    placeOk: placeOk === true,
    frameDefaultRef,
    templateNamesAfter: verify.map((e) => e.name),
    bogusEntry: {
      id: bogusEntry?.id,
      objectCount: bogusEntry?.scene?.objects?.length,
      preset: bogusEntry?.scene?.objects?.[0]?.asset?.preset ?? null,
      seed: bogusEntry?.scene?.objects?.[0]?.asset?.seed ?? null,
      transformPos: bogusEntry?.scene?.objects?.[0]?.transform?.position ?? null,
    },
  };
};
