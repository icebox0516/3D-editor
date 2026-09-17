/**
 * runtime/procedural/materials/facilityGlsl —— 设施资产程序化材质公共 GLSL 库（T002.4 阶段二）。
 *
 * 职责：设施材质注入配方的公共噪声函数（hash / 值噪声 / 2 阶 FBM），纯字符串模块、
 *      零 THREE 引用——禁止在各配方里复制粘贴噪声实现（修 bug 漏改之源）。
 * 命名：全部 fac 前缀，避开 three chunk 命名空间（common chunk 有 rand 等）。
 * 成本（park-shader 成本表口径，hash21 = 1×）：facVnoise ≈ 3×、facFbm2 ≈ 6×；
 *      设施配方主体 ≤ 6× 预算内（10 万实例设计的每像素纪律）。
 * 约束：确定性纯函数（同输入同输出，无时间/uniform 依赖）；GLSL ES 1 兼容写法。
 */
export const FACILITY_GLSL_NOISE = /* glsl */ `
float facHash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float facVnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = facHash21(i);
  float b = facHash21(i + vec2(1.0, 0.0));
  float c = facHash21(i + vec2(0.0, 1.0));
  float d = facHash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float facFbm2(vec2 p) {
  return facVnoise(p) * 0.667 + facVnoise(p * 2.17 + vec2(11.3, 7.9)) * 0.333;
}
`;
