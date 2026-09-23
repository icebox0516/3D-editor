// T018.3 疑点闭 ⑤b：GL 层 uniform 取证——对 renderer.info.programs 每个真实 GL program：
//  - ACTIVE_UNIFORMS 全名单中筛灯相关名（directionalLights / hemisphereLights / envMap*）
//  - 读 directionalLights[0].direction / .color 当前值（渲染热循环间隙读 = 最近帧上传值）
//  - cacheKey 片段（含灯状态版本线索）
export default async (api) => {
  await api.setViewport(1920, 1080);
  await api.navigate('http://localhost:5173/');
  const ready = await api.evalJs(`(async () => {
    for (let i = 0; i < 60; i++) { if (window.__envProbe?.webgl) return true; await new Promise(r => setTimeout(r, 500)); }
    return false;
  })()`);
  if (!ready) return { error: 'probe not ready' };
  await new Promise((r) => setTimeout(r, 500)); // 让若干帧完成，uniform 为热值

  return api.evalJs(`(() => {
    const r = window.__envProbe.webgl;
    const gl = r.getContext();
    const progs = r.info.programs || [];
    const rows = [];
    for (const p of progs) {
      const pr = p.program;
      const n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS);
      const names = [];
      for (let i = 0; i < n; i++) {
        const info = gl.getActiveUniform(pr, i);
        if (info) names.push(info.name);
      }
      const lightNames = names.filter((x) => /ight|rradiance|nvironment/i.test(x));
      const readU = (name) => {
        const loc = gl.getUniformLocation(pr, name);
        if (loc === null) return null;
        try { return Array.from(gl.getUniform(pr, loc)).map((v) => +v.toFixed(3)); } catch (e) { return 'err:' + e.message; }
      };
      rows.push({
        name: p.name || '(unnamed)',
        type: p.type,
        usedTimes: p.usedTimes,
        cacheKey: String(p.cacheKey).replace(/\\s+/g, ' ').slice(0, 260),
        lightUniformNames: lightNames.slice(0, 14),
        dirLight0Direction: readU('directionalLights[0].direction'),
        dirLight0Color: readU('directionalLights[0].color'),
        hemiLight0Sky: readU('hemisphereLights[0].skyColor'),
      });
    }
    return { programCount: progs.length, rows };
  })()`);
};
