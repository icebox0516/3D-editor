/**
 * runtime/instancing/instanceTint —— 变体色相偏移 → 实例颜色乘子（T002.3）。
 *
 * 职责：domain applyAssetVariants 产出的 hueOffset（度）→ THREE.Color 乘子，供
 *      InstancedAssetPool.setColor 写 instanceColor（three 通路：着色器内
 *      diffuse × instanceColor 逐分量乘算，不克隆材质破合批）。
 * 设计依据（确定性 + 肉眼可辨 + 不克隆材质三约束下的单边近似）：
 *      逐分量乘算无法表达任意材质色的精确色相旋转（那是绕灰轴的矩阵变换），
 *      且若把偏移角直接落在色环同一邻域（±8° 同落红侧），冷暖两方向只差二阶小量
 *      ——微差不可辨。故取「暖冷对向分裂」的染色近似（游戏引擎实例变体常用手法）：
 *      正偏移落暖侧（红→黄，|偏移| 增大沿色环展开）、负偏移落冷侧（青→蓝）；
 *      饱和度随 |偏移| 增强（15° 满格），亮度锚在亮侧（1 - s×0.2）避免整体变暗。
 *      0° 饱和度为 0 → 乘子收敛到精确白，色相分裂点的跳变被白收敛抹平（感知连续）；
 *      同输入同输出（纯 HSL 构造，无随机），撤销/重做/场景重载经同 seed 复算逐位一致。
 * 边界：runtime 纯函数（THREE 合法区）；零随机、零状态；不感知 seed/meta
 *      （变体采样在 domain，本函数只做数值换算）。
 */
import * as THREE from 'three';

/** 饱和度满格的偏移量级（度）：|offset| ≥ 15° 染色强度封顶（微差资产 8° → 约 0.53） */
const FULL_SATURATION_DEG = 15;
/** 满格饱和度对应的亮度回压（乘子平均亮度 ≈ 1，避免大偏移整体变暗） */
const LIGHTNESS_DIP = 0.2;

/**
 * 色相偏移（度）→ 实例颜色乘子。
 * 0（或非有限值）→ 精确白（1,1,1，恒等乘子）；正偏移暖向 / 负偏移冷向，
 * 强度随 |偏移| 增长（15° 封顶）——见类头设计依据。
 */
export function hueOffsetToMultiplier(hueOffsetDeg: number): THREE.Color {
  if (!Number.isFinite(hueOffsetDeg) || hueOffsetDeg === 0) {
    return new THREE.Color(1, 1, 1);
  }
  const magnitude = Math.min(Math.abs(hueOffsetDeg), 360);
  const saturation = Math.min(1, magnitude / FULL_SATURATION_DEG);
  const lightness = 1 - saturation * LIGHTNESS_DIP;
  // 暖冷对向分裂：正 → [0, ~0.5) 暖侧随量级展开；负 → [0.5, 1) 冷侧随量级展开
  const hue = (hueOffsetDeg > 0 ? 0 : 0.5) + magnitude / 360;
  return new THREE.Color().setHSL(hue % 1, saturation, lightness);
}
