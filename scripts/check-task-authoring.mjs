#!/usr/bin/env node
// check-task-authoring.mjs — Lean Task 检查（D40）
// v1 report-only：恒 exit 0，不进失败路径；不判合法性，只产信号。
// 信号集：
//   ① 任务书内出现 workflow/docs 规范同名固定段标题
//   ② 任务书与 AGENTS/workflow/docs 的行级重合字节占比（行 trim 后完全一致，长度 ≥20）
//   ③ `基线 NNNN` 按章节报告（Acceptance/Constraints → warning；完成记录 → normal；
//      声明固定外部基线 → allowed）+ 同文件 ≥2 个不同基线数 → warning 并列行号
//   ④ DECISIONS「标题 D 号集合 == 索引 ID 集合」双向核对
// 不做跨任务书比对（防合法资产事实重复误报）。

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const norm = (p) => p.replace(/\\/g, '/');
const readLines = (relPath) => readFileSync(join(root, relPath), 'utf8').split(/\r?\n/);

// ---- 参考文件集（稳定流程唯一来源；.zcode/ 本地私有，缺失则跳过并提示）----

const proceduralDocs = readdirSync(join(root, 'docs/procedural-assets'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => norm(join('docs/procedural-assets', f)));

const refPaths = [
  'AGENTS.md',
  '.zcode/skills/asset-production/workflows/tree.md',
  'docs/task-authoring.md',
  ...proceduralDocs,
];
const missingRefs = refPaths.filter((p) => !existsSync(join(root, p)));
const presentRefs = refPaths.filter((p) => existsSync(join(root, p)));

const refHeadingSet = new Set();
const refLineSet = new Set();
for (const p of presentRefs) {
  for (const line of readLines(p)) {
    const t = line.trim();
    if (/^#{1,4}\s/.test(t)) refHeadingSet.add(t);
    if (t.length >= 20) refLineSet.add(t);
  }
}

// ---- 信号③：基线数提取 ----

const BASELINE_RE = /(?:基线\s*(\d{3,6})|(\d{3,6})\s*(?:全绿|个测试|用例))/g;

function sectionKind(sectionTitle) {
  if (/完成记录/.test(sectionTitle)) return 'record';
  if (/Acceptance|验收/.test(sectionTitle)) return 'acceptance';
  if (/Constraint|约束|禁/.test(sectionTitle)) return 'constraints';
  if (sectionTitle === '(头部)') return 'header';
  return 'other';
}

const KIND_LABEL = { acceptance: 'warning', constraints: 'warning', record: 'normal', header: 'info', other: 'info' };

// ---- 任务书扫描 ----

const taskFiles = readdirSync(join(root, 'tasks'))
  .filter((f) => f.endsWith('.md') && f !== '_template.md')
  .sort();

let totalWarnings = 0;
let totalNormal = 0;

console.log('# check:tasks — Lean Task 报告（report-only，D40 v1）\n');
console.log(`参考文件集（${presentRefs.length}）：${presentRefs.join(' / ')}`);
if (missingRefs.length) console.log(`[info] 跳过本地缺失参考文件：${missingRefs.join(' / ')}（.zcode/ 本地私有属正常）`);
console.log('');

for (const file of taskFiles) {
  const lines = readLines(norm(join('tasks', file)));
  const findings = [];

  let sectionTitle = '(头部)';
  let nonEmptyBytes = 0;
  let overlapBytes = 0;
  const overlapSamples = [];
  const headingHits = [];
  const baselines = []; // { num, line, kind, allowed }

  lines.forEach((line, i) => {
    const t = line.trim();
    if (/^##\s/.test(t)) sectionTitle = t.replace(/^##\s*/, '');
    if (!t) return;

    // ① 同名固定段标题
    if (/^#{1,4}\s/.test(t) && refHeadingSet.has(t)) headingHits.push({ line: i + 1, heading: t });

    // ② 行级重合
    if (t.length >= 20) {
      nonEmptyBytes += Buffer.byteLength(t);
      if (refLineSet.has(t)) {
        overlapBytes += Buffer.byteLength(t);
        if (overlapSamples.length < 3) overlapSamples.push({ line: i + 1, text: t.slice(0, 60) });
      }
    }

    // ③ 基线数（按行扫描，继承当前章节）
    BASELINE_RE.lastIndex = 0;
    let m;
    while ((m = BASELINE_RE.exec(line)) !== null) {
      const num = m[1] ?? m[2];
      const allowed = /外部基线/.test(line);
      const kind = allowed ? 'allowed' : KIND_LABEL[sectionKind(sectionTitle)];
      baselines.push({ num, line: i + 1, kind, section: sectionTitle });
    }
  });

  if (headingHits.length) {
    for (const h of headingHits) findings.push(`[warning] 信号① 同名固定段标题 L${h.line}: ${h.heading}`);
  }
  if (nonEmptyBytes > 0) {
    const ratio = overlapBytes / nonEmptyBytes;
    if (ratio >= 0.05) {
      findings.push(`[warning] 信号② 行级重合字节占比 ${(ratio * 100).toFixed(1)}%（${overlapBytes}/${nonEmptyBytes} B），样例：${overlapSamples.map((s) => `L${s.line}`).join(', ')}`);
    }
  }
  for (const b of baselines) {
    if (b.kind === 'allowed') findings.push(`[allowed] 信号③ 基线 ${b.num}（声明固定外部基线） L${b.line} @ ${b.section}`);
    else if (b.kind === 'warning') findings.push(`[warning] 信号③ 基线 ${b.num} L${b.line} @ ${b.section}`);
    else if (b.kind === 'normal') findings.push(`[normal] 信号③ 基线 ${b.num} L${b.line} @ ${b.section}`);
    else findings.push(`[info] 信号③ 基线 ${b.num} L${b.line} @ ${b.section}`);
  }
  const distinctNums = [...new Set(baselines.map((b) => b.num))];
  if (distinctNums.length >= 2) {
    const detail = distinctNums
      .map((num) => `${num}@L${baselines.filter((b) => b.num === num).map((b) => b.line).join(',L')}`)
      .join('  ');
    findings.push(`[warning] 信号③ 同文件 ${distinctNums.length} 个不同基线数（算术交叉）：${detail}`);
  }

  const warnings = findings.filter((f) => f.startsWith('[warning]')).length;
  const normals = findings.filter((f) => f.startsWith('[normal]')).length;
  totalWarnings += warnings;
  totalNormal += normals;

  if (findings.length) {
    console.log(`## ${file}（warning ${warnings} / normal ${normals}）`);
    for (const f of findings) console.log(`  ${f}`);
    console.log('');
  }
}

// ---- 信号④：DECISIONS 索引双向核对 ----

const decisionsLines = readLines('DECISIONS.md');
const headingIds = new Set();
let inIndex = false;
const indexIds = new Set();
for (const line of decisionsLines) {
  if (/^##\s/.test(line)) inIndex = /^##\s+索引/.test(line);
  if (inIndex) {
    const m = line.match(/^\|\s*(D[\d.]+)\s*\|/);
    if (m) indexIds.add(m[1]);
    continue;
  }
  let m = line.match(/^##\s+\d{4}-\d{2}-\d{2} · (D\d+(?:\.\d+)?)[\s·]/);
  if (m) { headingIds.add(m[1]); continue; }
  m = line.match(/^###\s+(D\d+(?:\.\d+)?)[\s·]/);
  if (m) headingIds.add(m[1]);
}
console.log('## DECISIONS.md 索引双向核对（信号④）');
console.log(`  标题 D 号 ${headingIds.size} 个 / 索引 ID ${indexIds.size} 个`);
const missingInIndex = [...headingIds].filter((id) => !indexIds.has(id)).sort();
const ghostRows = [...indexIds].filter((id) => !headingIds.has(id)).sort();
if (missingInIndex.length) { console.log(`  [warning] 标题有而索引漏登：${missingInIndex.join(', ')}`); totalWarnings++; }
if (ghostRows.length) { console.log(`  [warning] 索引有而标题缺失（幽灵行）：${ghostRows.join(', ')}`); totalWarnings++; }
if (!missingInIndex.length && !ghostRows.length) console.log('  [normal] 集合相等，零漏登零幽灵行');
console.log('');

console.log(`# 汇总：扫描任务书 ${taskFiles.length} 份；warning ${totalWarnings} / normal ${totalNormal}（report-only，不进失败路径；历史文件信号按 D40 历史任务隔离子节只记档不判合法性）`);
