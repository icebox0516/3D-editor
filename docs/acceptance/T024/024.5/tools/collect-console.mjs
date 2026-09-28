// T024.5 console 判据汇总：扫描 tools/logs/*.json（每次会话的驱动器输出
// { result, consoleLogs }），汇总会话数 / 含条目会话 / 条目分类。
// 已知通道例外（不算应用噪声）：
//   - ANGLE X4122 shader 精度 warning（THREE.WebGLProgram 经 console.warn 转发
//     D3D 编译器诊断——本机 GPU 编译通道产生，两构建同现，非应用缺陷）；
//   - favicon 请求已由驱动器 fulfill 空 200 抑制（不应再出现）。
// 用法：node collect-console.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LOGS = join(HERE, 'logs');

const isKnownChannelNoise = (item) =>
  item.includes('X4122') || item.includes('WebGLProgram: Program Info Log') || item.includes('favicon');

const files = readdirSync(LOGS).filter((f) => f.endsWith('.json')).sort();
const sessions = [];
for (const f of files) {
  const data = JSON.parse(readFileSync(join(LOGS, f), 'utf8'));
  const logs = data.consoleLogs ?? [];
  sessions.push({
    file: f,
    logCount: logs.length,
    items: logs,
    allKnownNoise: logs.length > 0 && logs.every(isKnownChannelNoise),
  });
}
const withItems = sessions.filter((s) => s.logCount > 0);
const unexpected = withItems.filter((s) => !s.allKnownNoise);
const summary = {
  totalSessions: sessions.length,
  sessionsWithConsoleItems: withItems.length,
  sessionsAllKnownNoiseOnly: withItems.filter((s) => s.allKnownNoise).length,
  unexpectedSessions: unexpected.map((s) => ({ file: s.file, items: s.items })),
  verdict: unexpected.length === 0 ? 'PASS：零应用级 console 错误/警告（含条目会话均为已知通道噪声 X4122，两构建同现）' : 'FAIL：存在未归类 console 条目',
};
writeFileSync(join(HERE, '..', 'console-summary.json'), JSON.stringify({ generatedAt: new Date().toISOString(), sessions, summary }, null, 2));
console.log(JSON.stringify(summary, null, 2));
process.exit(unexpected.length === 0 ? 0 : 2);
