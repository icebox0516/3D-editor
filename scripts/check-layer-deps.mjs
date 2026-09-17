#!/usr/bin/env node
/**
 * check-layer-deps.mjs —— 分层 DAG + three 导入白名单检查（守护脚本，零外部依赖）
 *
 * 依据 docs/archive/plan-phase1/CONTRACTS.md（一期契约，分层 DAG 仍由本脚本强制执行）：
 *  1. 分层 DAG：core ← scene ← domain ← registries ← (editor | runtime | io) ← ui ← app
 *     - core 不依赖任何层；scene→core；domain→core,scene；registries→core,scene,domain
 *     - editor/runtime/io→core,scene,domain,registries（兄弟层之间禁止互导）
 *     - ui→core,scene,domain,registries,editor（禁止导入 runtime/io）
 *     - app（src/app/** 与入口 src/main.tsx、src/App.tsx）可导入一切
 *  2. three 白名单：`three` 与 `three/examples/*` 仅允许出现在 src/runtime/**、src/app/**、src/main.tsx
 *  3. tests/** 不受 DAG 限制，但受 three 白名单限制（runtime 单测允许 three）
 *
 * 违规输出格式：`文件 -> 违规导入 -> 原因`，并 exit 1；全绿 exit 0。
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, relative, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC_DIR = join(ROOT, 'src')
const TESTS_DIR = join(ROOT, 'tests')
const SRC_REL = 'src'
const TESTS_REL = 'tests'

const LAYERS = ['core', 'scene', 'domain', 'registries', 'editor', 'runtime', 'io', 'ui', 'app']

// 各层允许依赖的其他层（同层互导默认允许；app 之外兄弟兄层禁止互导）
const ALLOWED_DEPS = {
  core: [],
  scene: ['core'],
  domain: ['core', 'scene'],
  registries: ['core', 'scene', 'domain'],
  editor: ['core', 'scene', 'domain', 'registries'],
  runtime: ['core', 'scene', 'domain', 'registries'],
  io: ['core', 'scene', 'domain', 'registries'],
  ui: ['core', 'scene', 'domain', 'registries', 'editor'], // 禁止 runtime / io
  app: LAYERS.filter((l) => l !== 'app'),
}

// three / three/examples 导入白名单
function isThreeImport(spec) {
  return spec === 'three' || spec.startsWith('three/')
}

function threeAllowed(relPosixPath) {
  if (relPosixPath.startsWith('src/runtime/')) return true
  if (relPosixPath.startsWith('src/app/')) return true
  if (relPosixPath === 'src/main.tsx') return true
  // tests/**：不受 DAG 限制，但 three 仅限 runtime 单测（按路径含 runtime 段判定）
  if (relPosixPath.startsWith('tests/') && relPosixPath.split('/').includes('runtime')) return true
  return false
}

// ── 文件收集 ────────────────────────────────────────────────
function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(ts|tsx|mts|cts)$/.test(name) && !/\.d\.ts$/.test(name)) out.push(full)
  }
  return out
}

const files = [...walk(SRC_DIR), ...walk(TESTS_DIR)]

// ── import 解析（正则即可，无需 AST）────────────────────────
// 覆盖：import x from '...' / export {x} from '...' / import '...' / import('...') / require('...')
const IMPORT_RE =
  /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|\bimport\s+)(["'])((?:[^"'\n])+)\1/g

function extractSpecifiers(code) {
  const specs = []
  for (const m of code.matchAll(IMPORT_RE)) specs.push(m[2])
  return specs
}

// 相对路径规范化（处理 ./ ../ 与多余分隔符），返回路径段数组
function normalizeSegments(path) {
  const out = []
  for (const seg of path.split(/[\\/]+/)) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') out.pop()
    else out.push(seg)
  }
  return out
}

// 绝对路径 -> 相对仓库根的 posix 路径（统一分隔符，便于输出与判断）
function toRelPosix(absPath) {
  return relative(ROOT, absPath).split(/[\\/]+/).join('/')
}

/**
 * 判定导入目标层：
 * - 相对导入：解析目标绝对路径，若在 src/ 内按其一级目录定层（无层名则视作 app，如 src/main.tsx、src/App.tsx）
 * - three：特殊标记
 * - 其他裸包名（react/zustand 等外部依赖）：不限制
 */
function classifyImport(fromAbs, spec) {
  if (!spec.startsWith('.')) {
    if (isThreeImport(spec)) return { kind: 'three' }
    return { kind: 'external' }
  }
  const fromRel = normalizeSegments(toRelPosix(fromAbs))
  fromRel.pop() // 去掉文件名，得到所在目录段
  // 注意：'..' 必须与文件所在目录合并后再归一化（合并前单独归一化会丢失向上跳转语义）
  const targetSegs = normalizeSegments(`${fromRel.join('/')}/${spec}`)
  if (targetSegs[0] !== SRC_REL) return { kind: 'external' } // 指向 src 之外（如静态资源），不管
  const layer = LAYERS.includes(targetSegs[1]) ? targetSegs[1] : 'app'
  return { kind: 'layer', layer, targetRel: targetSegs.join('/') }
}

// 文件所属层（src 下按一级目录；入口/游离文件视作 app；tests/ 下不做 DAG）
function layerOfFile(absPath) {
  const rel = toRelPosix(absPath)
  if (rel.startsWith('tests/')) return null
  const segs = rel.split('/')
  const layer = segs[1] !== undefined && LAYERS.includes(segs[1]) ? segs[1] : 'app'
  return layer
}

// ── 校验主流程 ──────────────────────────────────────────────
const violations = []

for (const file of files) {
  const relFile = toRelPosix(file)
  const code = readFileSync(file, 'utf8')
  const layer = layerOfFile(file)

  for (const spec of extractSpecifiers(code)) {
    const info = classifyImport(file, spec)

    if (info.kind === 'three') {
      if (!threeAllowed(relFile)) {
        violations.push(
          `${relFile} -> ${spec} -> three 白名单违规：three/three/examples 仅允许出现在 src/runtime/**、src/app/**、src/main.tsx（tests/ 仅 runtime 单测）`,
        )
      }
      continue
    }

    if (info.kind !== 'layer') continue
    if (layer === null) continue // tests/** 不受 DAG 限制

    if (info.layer !== layer && !ALLOWED_DEPS[layer].includes(info.layer)) {
      violations.push(
        `${relFile} -> ${spec} -> 分层 DAG 违规：${layer} 层禁止导入 ${info.layer} 层（core ← scene ← domain ← registries ← editor|runtime|io ← ui ← app）`,
      )
    }
  }
}

// ── 输出 ────────────────────────────────────────────────────
if (violations.length > 0) {
  console.error(`[check-layer-deps] 发现 ${violations.length} 处违规：`)
  for (const v of violations) console.error(`  ${v}`)
  process.exit(1)
} else {
  console.log(`[check-layer-deps] OK：已检查 ${files.length} 个 TS/TSX 文件，分层 DAG 与 three 白名单全部通过`)
  process.exit(0)
}
