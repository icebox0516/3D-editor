// T011.6 页面内消元实验（9340 全新 profile）：抓深度材质 fragment+vertex 原源，
// 三组手动 link 看 Program Info Log——P0 原文基线 / P1 花分支去 out 参调用 / P2 赋值再 return
// （纯页面内实验，零生产码改动）
import { writeFileSync } from 'node:fs';
export default async ({ navigate, setViewport, evalJs, sleep }) => {
  await navigate('http://localhost:5173');
  await setViewport(1920, 1080);

  await evalJs(`(function () {
    window.__cap = { lastVertex: null, frag: null };
    const proto = WebGL2RenderingContext.prototype;
    const orig = proto.compileShader;
    proto.compileShader = function (sh) {
      const src = this.getShaderSource(sh) || '';
      const isVertex = this.getShaderParameter(sh, this.SHADER_TYPE) === this.VERTEX_SHADER;
      if (isVertex && src.includes('vHighPrecisionZW')) {
        window.__cap.lastVertex = src;
      }
      if (!isVertex && src.includes('koeDepthAlpha')) {
        window.__cap.frag = src;
      }
      return orig.call(this, sh);
    };
  })()`, { awaitPromise: false });

  await evalJs('window.__koelreuteria.mount()');
  await sleep(2000);

  const resultJson = await evalJs(`(async function () {
    const cap = window.__cap;
    if (!cap.frag || !cap.lastVertex) return JSON.stringify({ err: 'capture-miss', hasFrag: !!cap.frag, hasVx: !!cap.lastVertex });
    const gl = document.createElement('canvas').getContext('webgl2');
    function tryLink(fragSrc) {
      const vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vs, cap.lastVertex); gl.compileShader(vs);
      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fs, fragSrc); gl.compileShader(fs);
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) return 'FS-COMPILE-FAIL: ' + gl.getShaderInfoLog(fs).slice(0, 200);
      const p = gl.createProgram();
      gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
      const log = gl.getProgramInfoLog(p) || '(empty)';
      gl.deleteProgram(p); gl.deleteShader(vs); gl.deleteShader(fs);
      return log;
    }
    const orig = cap.frag;
    const origNeedle = 'float koeDCen = 0.0; float koeDVar = 0.0;';
    if (!orig.includes(origNeedle)) return JSON.stringify({ err: 'needle-miss（修复版不在源里）' });
    // P1：花分支整体替换为 return 1.0（消 out 参调用——koeFlowerAlpha 定义保留但无调用点）
    const p1 = orig.replace('return koeFlowerAlpha(vec2(koeUv.x, koeUv.y - 5.0), koeDCen, koeDVar); // 花卡裁切（Color/Depth 同源 GLSL）', 'return 1.0;');
    // P2：赋值再 return（out 参调用挪出 return 位置）
    const p2 = orig.replace('return koeFlowerAlpha(vec2(koeUv.x, koeUv.y - 5.0), koeDCen, koeDVar); // 花卡裁切（Color/Depth 同源 GLSL）', 'float koeDRet = koeFlowerAlpha(vec2(koeUv.x, koeUv.y - 5.0), koeDCen, koeDVar); return koeDRet;');
    const leafNeedle = 'return mix(1.0, koeLeafAlpha(koeUv, koeRand), step(0.0001, koeRand));';
    const p3 = orig.replace(leafNeedle, 'return step(0.0001, koeRand);');
    const p4 = p3.replace('return koeFlowerAlpha(vec2(koeUv.x, koeUv.y - 5.0), koeDCen, koeDVar);', 'return 1.0;');
    const p5 = orig.replace('diffuseColor.a = koeDepthAlpha(vUv, vLeafRand);', 'diffuseColor.a = 1.0;');
    const n1 = 'float koeEnv = 0.30 * pow(koeEnvSin, mix(0.78, 1.18, smoothstep(0.30, 0.92, koeY)));';
    const n2 = 'float koeLob = pow(sin(3.14159 * koeFr), 1.6);';
    const p6 = orig.replace(n1, 'float koeEnv = 0.30 * pow(max(koeEnvSin, 0.0), mix(0.78, 1.18, smoothstep(0.30, 0.92, koeY)));');
    const p7 = orig.replace(n2, 'float koeLob = pow(max(sin(3.14159 * koeFr), 0.0), 1.6);');
    const p8 = orig.replace(n1, 'float koeEnv = 0.30 * pow(max(koeEnvSin, 0.0), mix(0.78, 1.18, smoothstep(0.30, 0.92, koeY)));').replace(n2, 'float koeLob = pow(max(sin(3.14159 * koeFr), 0.0), 1.6);');
    var NL = String.fromCharCode(10);
    const pinna = ['  float koeRillEdge = 0.006 - 0.003 * clamp(koeA / 0.30, 0.0, 1.0) - abs(koeL);', '  float koeFeatherEdge = koeHalf - abs(koeL - koeC);', '  float koePinnaEdge = max(koeRillEdge, koeFeatherEdge);'].join(NL);
    const pinnaRepl = ['float koeRillEdge = 0.0;', 'float koeFeatherEdge = 0.0;', 'float koePinnaEdge = 0.0;'].join(NL);
    const p9 = orig.replace(pinna, pinnaRepl);
    const bandN1 = '  float koeYb = koeY - 0.155 - koeA * 0.78 - max(sign(koeX), 0.0) * 0.014;';
    const p10 = p9.replace(bandN1, '  float koeYb = koeY - 0.155 - koeA * 0.78 - 0.0;');
    const bandN2 = '  float koeBandT = koeYb / koeSpace;';
    const p11 = p10.replace(bandN2, '  float koeBandT = koeYb * 6.8965517;');
    const mixNeedle = 'return mix(1.0, koeLeafAlpha(koeUv, koeRand), step(0.0001, koeRand));';
    const p12 = orig.replace(mixNeedle, 'return mix(1.0, 0.5, step(0.0001, koeRand));');
    const p13 = orig.replace(mixNeedle, 'float koeTmpLA = koeLeafAlpha(koeUv, koeRand); return mix(1.0, koeTmpLA, step(0.0001, koeRand));');
    const modNeedle = 'float koeAlt = mod(koeJ, 2.0) * 2.0 - 1.0;';
    const p14 = orig.replace(modNeedle, 'float koeAlt = (koeJ - 2.0 * floor(koeJ * 0.5)) * 2.0 - 1.0;');
    function replaceLines(src, from, to, repl) {
      const ls = src.split(NL);
      const out2 = ls.slice(0, from - 1).concat(repl.split(NL), ls.slice(to));
      return out2.join(NL);
    }
    const winRepl = ['  float koeLfFreq = 24.0;', '  float koeS = koeA * koeLfFreq;', '  float koeJ = floor(koeS);', '  float koeFr = fract(koeS);', '  float koeLob = 0.5;', '  float koeAlt = 1.0;', '  float koeRem = max(koeEnv - koeA, 0.0);', '  float koeLen = clamp(0.20 * koeRem, 0.012, 0.046);', '  float koeHalf = 0.5 * koeLen;', '  float koeC = 0.4 * koeLen;'].join(NL);
    const bandRepl = ['  float koeSpace = 0.159;', '  float koeYb = koeY - 0.155 - koeA * 0.78 - 0.014;', '  float koeBandT = koeYb / koeSpace;', '  float koeBandIdx = floor(koeBandT + 0.5);', '  float koeL = (koeBandT - koeBandIdx) * koeSpace;'].join(NL);
    const envRepl = ['  float koeEnvSin = 0.5;', '  float koeEnv = 0.2 * pow(koeEnvSin, mix(0.78, 1.18, smoothstep(0.30, 0.92, koeY)));'].join(NL);
    const p18 = replaceLines(orig, 147, 148, envRepl);
    const serrRepl = ['  float koeSerrOn = 0.0;', '  float koeTooth = 0.5;'].join(NL);
    const p19 = replaceLines(orig, 175, 176, serrRepl);
    const sinRepl = '  float koeEnvSin = 0.5 + 0.5 * koeY;';
    const p20 = replaceLines(orig, 147, 147, sinRepl);
    const halfRepl = ['  float koeL = 0.0;', '  float koeHalf = 0.02;', '  float koeC = 0.0;', '  float koeRillEdge = 0.006 - 0.003 * clamp(koeA / 0.30, 0.0, 1.0);', '  float koeFeatherEdge = koeHalf - abs(koeL - koeC);', '  float koePinnaEdge = max(koeRillEdge, koeFeatherEdge);', '  float koeEdge = max(koeRachisEdge, min(koeEnvEdge, koePinnaEdge));', '  return clamp(koeEdge / 0.02 + 0.5, 0.0, 1.0);'].join(NL);
    const p23 = replaceLines(orig, 153, 180, halfRepl);
    const out = {
      P23_halfBody: tryLink(p23),
    };
    return JSON.stringify(out);
  })()`);
  const capRaw = await evalJs('window.__cap.frag');
  if (capRaw) writeFileSync('docs/acceptance/t011/011.6/tools/depth-frag.glsl', capRaw);
  writeFileSync('docs/acceptance/t011/011.6/tools/ablation-result.json', resultJson);
  return JSON.parse(resultJson);
};
