/**
 * runtime/environment/sunDirection —— 太阳方向纯函数（T018.1，D29.1「双消费单一真相源」）。
 *
 * 契约：`(elevation°, azimuth°) → 单位方向`，世界系约定与现行太阳常量 (80,120,60) 的
 * 派生关系一致（018.0 README ① 记档）：
 *   elevation = atan(y / √(x²+z²))   —— 地平仰角（°，+Z 水平面以上为正）
 *   azimuth   = atan2(x, z)          —— 自 +Z 轴向 +X 旋转（°）
 * 逆映射：y = sin(e)；水平半径 r = cos(e)；x = r·sin(a)；z = r·cos(a)。
 * 双消费（三一致「天空太阳位 = 光向 = 影向」的唯一出处）：
 *   - Sky.sunPosition uniforms（skyCore 双实例同写，D29.12）；
 *   - DirectionalLight.position（Renderer.applyEnvironment 读 skyCore.sunDirection ×
 *     LEGACY_SUN_DISTANCE 派生——同状态源，见 Renderer 太阳段）。
 * day 首候选（D29.6）：elevation 50.2° / azimuth 53.1°（由 (80,120,60) 精确派生
 * 50.194°/53.130° 圆整而来——新旧对比阴影方向零漂移口径；终值 018.5 视觉验收锁定）。
 *
 * 边界：零 THREE 依赖（node 可测，D27.5 先例）；输出为单位向量（显式归一，浮点
 * 残差收敛到数个 ulp 内）；角度制入参（与 DEV 调参面 / 任务书口径一致，弧度换算仅
 * 在本模块内发生一次）。
 */

/** 单位方向向量（纯数据形态；消费方自行拷入 THREE.Vector3 / light.position） */
export interface SunDirection {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

const DEG2RAD = Math.PI / 180;

/**
 * 仰角/方位角 → 单位方向向量。
 * 输入单位为度；任意角合法（三角函数周期性自然折叠，负仰角 = 地平线下）。
 */
export function sunDirectionOf(elevationDeg: number, azimuthDeg: number): SunDirection {
  const e = elevationDeg * DEG2RAD;
  const a = azimuthDeg * DEG2RAD;
  const cosE = Math.cos(e);
  const x = cosE * Math.sin(a);
  const y = Math.sin(e);
  const z = cosE * Math.cos(a);
  // sin/cos 组合的模长浮点残差（|v| 与 1 差 ≤ 数个 ulp）显式归一——消费方免再归一
  const len = Math.hypot(x, y, z) || 1;
  return { x: x / len, y: y / len, z: z / len };
}

/** day 首候选仰角（°）：atan(120/√(80²+60²)) = 50.194…° 圆整（D29.6） */
export const DAY_SUN_ELEVATION_DEG = 50.2;

/** day 首候选方位角（°）：atan2(80, 60) = 53.130…° 圆整（D29.6） */
export const DAY_SUN_AZIMUTH_DEG = 53.1;

/**
 * legacy 太阳模长：|(80,120,60)| = √(6400+14400+3600) ≈ 156.205。
 * 018.1 太阳段同向同模长替换的「模长」侧（方向侧 = DAY_SUN_* 经 sunDirectionOf）——
 * shadow camera near/far（1/400）与 ±160 视锥对该模长下的位置零改动（D29.1 冻结）。
 */
export const LEGACY_SUN_DISTANCE = Math.hypot(80, 120, 60);
