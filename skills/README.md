# skills/ — 渲染技能参考库（2026-09-18 裁定）

> 按需参考库，非项目 API 真相源。项目技术栈基线：**Three.js 0.186 + WebGL2 + GLSL（ShaderMaterial/onBeforeCompile）**；本库中偏 WebGPU/TSL/NodeMaterial 的内容只取思路，代码与 API 不照搬。全部删除项留存于 git 历史 `8177c1c`，需要时可回取。

## 核心底座（三个，可常驻）

| 技能 | 用途 | 边界 |
|---|---|---|
| **threejs-perf** | InstancedMesh、Draw Call、CPU/GPU Frame Time、批量更新、性能基准方法，与 Runtime 优化任务直接对口 | 其 benchmark 环境不是本项目 2080 Ti 开发档——只取方法与优化模式，**数字不作项目标准** |
| **web-shaders** | GLSL ES、ShaderMaterial、RawShaderMaterial、WebGL2 调试、浏览器 Shader 排错，与 0.186 + WebGL2 栈直接匹配 | park-shader-agent 基础知识 |
| **shader-dev** | 通用 GLSL 技术库：SDF / Noise / Lighting / Water / Shadow / Normal / WebGL2 pitfalls | 不懂项目架构，只作底层 Shader 知识库 |

## 按需参考（五个，不常驻加载）

| 技能 | 何时用 | 边界 |
|---|---|---|
| **threejs-procedural-geometry** | 程序化 Geometry（拓扑、构建、批量生成）参考 | 路线偏新版 Three.js/WebGPU/TSL——只作 procedural 资产方向按需参考，**不作项目 API 真相** |
| **threejs-procedural-vegetation** | **T009 夏栎直接相关**：树形结构、冠层、植被生成、LOD、风动思路 | 实现环境与 WebGL2/GLSL 路线不一致——只借鉴生成方法，**不照搬代码或 API** |
| **threejs-procedural-materials** | 未来研究新材质架构（NodeMaterial/TSL/WebGPU）时 | 与当前 GLSL 主线不同代——优先级低于前两者，不常驻（`examples/tsl-procedural-pbr/` 即该方向实验室） |
| **threejs-debugging** | 仅遇 Three.js Runtime 异常时 | 通用排错知识，版本/API 资料对长期维护 0.186 有价值，但不作每次任务的常驻加载 |
| **threejs-visual-validation** | T008/T009 视觉验收方法论：冻结相机、固定条件、区分视觉/机制/性能证据、避免主观判断 | 验证工具偏 WebGPU——只吸收验证方法，不采用其执行环境 |

## 已删除（去向记录）

- **threejs-scalable-real-time-shadows**：当前 Shadow 目标只是打通 customDepthMaterial + InstancedMesh + Source/Pool 生产链，未遇大规模级联/Coverage 问题；待性能实测证明普通 Shadow 不够再从 git 历史重新引入。
- **threejs-choose-skills**：技能路由器与项目「主代理 + 专业 Agent」路由重复，且偏 WebGPU/TSL 路线，易与 WebGL2 约束冲突。
- **skills-main 其余全部**（android / flutter / pptx / docx / pdf / xlsx 等与本仓库无关）及三个归档外壳目录。

## 后续

基于这 8 个实际剩余技能，重新设计主代理 / threejs-expert / park-shader-agent 的职责与加载规则（另行任务，届时更新 AGENTS.md 路由段）。
