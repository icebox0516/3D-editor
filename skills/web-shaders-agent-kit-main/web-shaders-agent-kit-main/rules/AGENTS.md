# AGENTS.md — Web shaders

Generic agent instructions for web-shader work. Works as `AGENTS.md`, or copy into `CLAUDE.md`, `.github/copilot-instructions.md`, or a Windsurf/Cline rules file. This is the condensed ruleset; the full reasoning lives in [`skills/web-shaders/SKILL.md`](../skills/web-shaders/SKILL.md).

## Establish the target first

The language and boilerplate depend on where the shader runs:

- **Raw WebGL 2** → GLSL ES 3.00 (`#version 300 es`, `in/out`, `texture()`).
- **Three.js `ShaderMaterial`** → GLSL ES 1.00; `position`/`normal`/`uv` and the camera/model matrices plus `precision` are injected — don't redeclare. `glslVersion: THREE.GLSL3` opts into GLSL 3.
- **Three.js `RawShaderMaterial`** → write the full header including `precision highp float;`.
- **WebGPURenderer** → prefer **TSL** (JS nodes) over raw WGSL.
- **React Three Fiber** → drei `shaderMaterial` + `extend`; update uniforms via a `useFrame` ref, not state.

## Get these right

- Aspect-correct UVs; do color math in linear space and respect sRGB / tone mapping; flip `vUv.y` when textures are inverted.
- WebGL 1 GLSL: no dynamic array indexing or non-constant loops. Integer division truncates. `pow(negative,…)` and `mod` of negatives are footguns.
- Prefer `mix`/`step`/`smoothstep` to branches. WGSL requires explicit numeric types and 16-byte `vec3` padding in uniform structs.
- Reuse functions from **Lygia** (https://lygia.xyz) rather than reimplementing noise/SDF/easing/color.

## Verify

Output intermediates to color to debug, read the console for compile errors, confirm uniform names match exactly between JS and the shader, and describe or screenshot the result — a shader that compiles can still render black. Consult https://threejs.org/docs/llms.txt and the WebGPU/WGSL specs when unsure instead of guessing.
