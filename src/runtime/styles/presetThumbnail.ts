/**
 * runtime/styles/presetThumbnail —— data-URI SVG 缩略图占位生成（T6.3）。
 *
 * 职责：为预设 meta 生成静态色块缩略图（主色背景 + 简单示意图形），
 *      编码后单条 ≤300 字符（meta 矩阵测试锁定）；无外部二进制资产依赖。
 * 边界：纯字符串函数，零 THREE；正式缩略图若改离屏渲染产出，仅替换数据源不动消费方。
 */

/** 生成 data-URI SVG 缩略图：32×32 主色块 + 可选示意图形（glyph 为 SVG 片段字面量） */
export function svgThumbnail(background: string, glyph = ''): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='${background}'/>${glyph}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
