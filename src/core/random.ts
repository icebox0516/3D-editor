/**
 * core/random —— 确定性随机基元（零依赖纯函数）。
 *
 * 职责：① mulberry32：seed → [0,1) 随机流（标准实现，bryc/codebasics：Math.imul +
 *      无符号移位全整数运算，无浮点累积误差，同 seed 同序列逐位一致）；② hashCell：
 *      (seed, 整数坐标) → 32 位哈希，供「逐 cell 独立随机流」派生——每个网格 cell 的
 *      随机数只依赖 (seed, i, j) 与消费顺序，与遍历顺序/跳过的 cell 无关（撒点局部
 *      重算与跨块确定性的根基，D8/D17）；③ hashString / hash32：字符串及其数值域
 *      分离混合（D19.3 三流域 seed 派生的基元）。
 * 消费方：domain/assets/variants（变体掷骰）、domain/assets/shapeFamily（形态族派生）、
 *      domain/scatter（撒点）。
 * 边界：core 层零依赖；不是加密随机，仅用于确定性内容生成。
 */

/**
 * mulberry32：seed → [0, 1) 确定性随机流（每次调用推进一次）。
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * (seed, i, j) → 32 位哈希（splitmix 终局混合风格）。
 * i/j 可为任意 32 位整数（含负 cell 索引）；同输入同输出，雪崩充分
 * （相邻 cell / 相邻 seed 的流独立）。撒点用它给每个网格 cell 派生独立 mulberry32 流。
 */
export function hashCell(seed: number, i: number, j: number): number {
  let h = seed >>> 0;
  h = Math.imul(h ^ (i | 0), 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h ^ (j | 0), 0xc2b2ae35);
  h ^= h >>> 16;
  h = Math.imul(h ^ (h >>> 15), 0x27d4eb2f);
  h ^= h >>> 15;
  return h >>> 0;
}

/**
 * 字符串 → 32 位哈希（FNV-1a + 终局混合）；同串同输出。
 * 供 objectId 派生散布缺省 seed（D18：style.seed 缺省时消费端确定性回退，旧场景不闪变）。
 */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x27d4eb2f);
  h ^= h >>> 15;
  return h >>> 0;
}

/**
 * (seed, domain) → 32 位哈希：一条数值 seed 按字符串域分离派生多条互不复用的哈希
 * （D19.3 三流域）。domain 经 hashString 数值化后与 seed 走 hashCell 混合——不做
 * 字符串拼接（零分配），同 seed 不同域 / 不同 seed 同域均充分雪崩。
 */
export function hash32(seed: number, domain: string): number {
  return hashCell(seed >>> 0, hashString(domain), 0);
}
