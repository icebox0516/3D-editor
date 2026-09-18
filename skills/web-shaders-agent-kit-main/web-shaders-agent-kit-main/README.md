# Web Shaders Agent Kit

> A drop-in starter suite for making AI coding agents (Claude Code, Cursor, Copilot, Windsurf, ChatGPT, and friends) genuinely good at **web shaders** — GLSL, WGSL, WebGL 2, WebGPU, Three.js, and React Three Fiber.

Most agents write plausible-looking shaders that render black, redeclare Three.js's injected uniforms, or ignore color space and aspect ratio. This kit encodes the platform matrix, correct boilerplate, and the pitfalls that fail silently — as a reusable skill, cross-tool rules, a documentation manifest, MCP config, and a system prompt. Take the whole thing or just the pieces you need.

Companion to the [Awesome Web Shaders](https://github.com/owenob1/awesome-web-shaders) list.

## What's inside

| File | Use it in |
|---|---|
| [`skills/web-shaders/SKILL.md`](skills/web-shaders/SKILL.md) | Claude Code / Codex agent **skill** — the full, structured expertise. |
| [`rules/cursor/web-shaders.mdc`](rules/cursor/web-shaders.mdc) | **Cursor** project rule. |
| [`rules/AGENTS.md`](rules/AGENTS.md) | Generic `AGENTS.md` / `CLAUDE.md` / Copilot / Windsurf / Cline rules. |
| [`llms.txt`](llms.txt) | A **documentation manifest** — point an agent at authoritative shader docs. |
| [`mcp/recommended-mcp.json`](mcp/recommended-mcp.json) | Suggested **MCP servers** (Context7 docs, Shadertoy). |
| [`prompts/system-prompt.md`](prompts/system-prompt.md) | A **system prompt** for a chat assistant / custom GPT / Project. |

## Install

**Claude Code** — copy the skill into your project or user skills directory:

```bash
mkdir -p .claude/skills
cp -r skills/web-shaders .claude/skills/
```

Claude loads it automatically when a task matches the skill's description.

**Cursor** — copy the rule into your project:

```bash
mkdir -p .cursor/rules
cp rules/cursor/web-shaders.mdc .cursor/rules/
```

**Copilot / Windsurf / Cline / generic** — copy `rules/AGENTS.md` to your project root (or paste it into `CLAUDE.md` / `.github/copilot-instructions.md` / your Windsurf rules).

**Any agent** — hand it [`llms.txt`](llms.txt) so it fetches real API docs, and merge [`mcp/recommended-mcp.json`](mcp/recommended-mcp.json) into your MCP client config for live docs and Shadertoy access.

**ChatGPT / custom GPT / Claude Project** — paste [`prompts/system-prompt.md`](prompts/system-prompt.md) into the system instructions.

## What it teaches

- **Target first** — WebGL 2 (GLSL ES 3.00) vs WebGPU (WGSL) vs Three.js `ShaderMaterial`/`RawShaderMaterial`/TSL vs R3F, and the correct boilerplate for each.
- **The injected-uniform trap** — what Three.js `ShaderMaterial` already provides so the agent stops redeclaring `position`, `uv`, and the matrices.
- **Correctness** — aspect-ratio, UV origin, sRGB/linear color, tone mapping, premultiplied alpha.
- **Portability footguns** — dynamic array indexing, non-constant loops, integer division, `pow`/`mod` of negatives, precision qualifiers, WGSL alignment.
- **A debugging workflow** — visualize intermediates, read compile errors, verify uniforms, inspect with Spector.js / WebGPU Inspector.

## Contributing

Improvements welcome — especially real gotchas from shipping browser shaders. Open an issue or PR.

## License

[MIT](LICENSE).
