/**
 * runtime/minimap/viewFootprint —— 主相机视野在地面（y=0）上的投影足迹（T7.7）。
 *
 * 纯函数模块（零 THREE，node 可测；沿 RenderLoop「runtime 内纯逻辑」先例）：
 * 输入相机位姿（position/forward/up）+ 视域参数（透视 fovY/aspect 或 正交半宽高）
 * + 远裁剪距离 → 地面交线四边形 Vec2[4]（业务坐标约定：Vec2 = x, 世界 z）+ 朝向单位向量。
 *
 * 算法（四机位统一覆盖）：
 *  - 四角视线（透视 = 从相机出发的四条发散射线；正交 = 四条平行于 forward 的射线，
 *    起点偏移 ±halfWidth/±halfHeight）；
 *  - 每条射线取 min(地面交点, far 裁剪点)——朝下的角先触地面（perspective/top 的
 *    标准四边形）；永不触地（视线朝上或地面在背后）的角被 far 平面有限化
 *    （front/side 水平机位的有限条带；far 沿轴向计量，斜射线距离 = far/cos 半角）；
 *  - 退化姿态（相机在地面下 / 恰在地面 / far=0 / 零向量）全部回退有限值，不产 NaN。
 *
 * 边界：只做几何换算，不读相机对象、不发事件；heading 垂直俯视回退 (0,-1)=北
 *      （编辑器 front 机位面向 -Z，地图惯例北在上）。
 */
import type { Vec2, Vec3 } from '../../core/types';

/** 透视视域参数（fovY 弧度、aspect = 水平/垂直） */
export interface PerspectiveFrustumInput {
  kind: 'perspective';
  fovY: number;
  aspect: number;
}

/** 正交视域参数（半宽/半高，世界单位） */
export interface OrthoFrustumInput {
  kind: 'ortho';
  halfWidth: number;
  halfHeight: number;
}

export type FrustumInput = PerspectiveFrustumInput | OrthoFrustumInput;

export interface ViewFootprintInput {
  /** 相机世界位置 */
  position: Vec3;
  /** 视线朝向（非单位自动归一；零向量回退 (0,0,-1)） */
  forward: Vec3;
  /** 相机上方向（非单位自动归一；与 forward 共线或零向量回退 (0,1,0)） */
  up: Vec3;
  frustum: FrustumInput;
  /** 远裁剪距离（世界单位；视野与地面不相交时的有限化边界，≤0 时足迹收缩到相机位置） */
  far: number;
}

export interface ViewFootprint {
  /**
   * 地面视野四边形（世界 XZ）：屏幕语义序 [左下, 右下, 右上, 左上]，
   * 水平机位下上缘两点为 far 裁剪点（有限条带）。
   */
  quad: [Vec2, Vec2, Vec2, Vec2];
  /** 朝向单位向量（forward 的 XZ 投影归一；垂直姿态回退 {x:0, y:-1} 北） */
  heading: Vec2;
}

/** 长度 epsilon（零向量判定） */
const EPS = 1e-9;

/** 三维归一（零向量返回 null） */
function normalize3(v: Vec3): Vec3 | null {
  const len = Math.hypot(v.x, v.y, v.z);
  if (len < EPS) return null;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function cross3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function finite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

/**
 * 单条射线的地面足迹点：origin + dir·min(tGround, tFar)。
 * tGround = 与 y=0 平面交点（须 t ≥ 0，即地面在前方且不背向）；
 * tFar = far 轴向平面的斜距（far / cos(dir·forward)，正交时 cos=1）。
 */
function rayGroundPoint(
  origin: Vec3,
  dir: Vec3,
  forward: Vec3,
  far: number,
): Vec2 {
  const cosForward = dir.x * forward.x + dir.y * forward.y + dir.z * forward.z;
  const tFar = cosForward > EPS ? Math.max(far, 0) / cosForward : Math.max(far, 0);
  let t = tFar;
  if (dir.y !== 0) {
    const tGround = -origin.y / dir.y;
    if (tGround >= 0 && tGround < t) t = tGround;
  }
  return { x: finite(origin.x + dir.x * t, origin.x), y: finite(origin.z + dir.z * t, origin.z) };
}

/**
 * 计算视野地面足迹。任何退化输入（零向量 / far≤0 / 地面不相交）均返回有限结果。
 */
export function computeViewFootprint(input: ViewFootprintInput): ViewFootprint {
  const forward = normalize3(input.forward) ?? { x: 0, y: 0, z: -1 };
  let up = normalize3(input.up);
  // up 与 forward 共线（叉积零长）→ 回退：forward 垂直（含俯仰）→ up=(0,0,-1)
  // 屏幕朝北（与主渲染 OrbitControls 顶视惯例一致）；forward 水平 → up=(0,1,0)
  const crossForwardUp = cross3(forward, up ?? { x: 0, y: 1, z: 0 });
  if (up === null || Math.hypot(crossForwardUp.x, crossForwardUp.y, crossForwardUp.z) < EPS) {
    up = forward.y !== 0 ? { x: 0, y: 0, z: -1 } : { x: 0, y: 1, z: 0 };
  }
  const right = normalize3(cross3(forward, up)) ?? { x: 1, y: 0, z: 0 };
  const trueUp = cross3(right, forward);

  const far = Math.max(finite(input.far, 0), 0);
  const p = input.position;

  // 四角射线（屏幕语义：左下/右下/右上/左上）
  let rays: ReadonlyArray<{ origin: Vec3; dir: Vec3 }>;
  if (input.frustum.kind === 'perspective') {
    const fov = finite(input.frustum.fovY, Math.PI / 3);
    const aspect = finite(input.frustum.aspect, 1);
    const tanV = Math.tan(fov / 2);
    const tanH = tanV * Math.max(aspect, EPS);
    const corners: ReadonlyArray<[number, number]> = [
      [-tanH, -tanV],
      [tanH, -tanV],
      [tanH, tanV],
      [-tanH, tanV],
    ];
    rays = corners.map(([rx, ry]) => {
      const dir = normalize3({
        x: forward.x + right.x * rx + trueUp.x * ry,
        y: forward.y + right.y * rx + trueUp.y * ry,
        z: forward.z + right.z * rx + trueUp.z * ry,
      }) ?? { ...forward };
      return { origin: p, dir };
    });
  } else {
    const hw = Math.max(finite(input.frustum.halfWidth, 0), 0);
    const hh = Math.max(finite(input.frustum.halfHeight, 0), 0);
    const corners: ReadonlyArray<[number, number]> = [
      [-hw, -hh],
      [hw, -hh],
      [hw, hh],
      [-hw, hh],
    ];
    rays = corners.map(([rx, ry]) => ({
      origin: {
        x: p.x + right.x * rx + trueUp.x * ry,
        y: p.y + right.y * rx + trueUp.y * ry,
        z: p.z + right.z * rx + trueUp.z * ry,
      },
      dir: forward,
    }));
  }

  const quad = rays.map((ray) => rayGroundPoint(ray.origin, ray.dir, forward, far)) as [
    Vec2,
    Vec2,
    Vec2,
    Vec2,
  ];

  // 朝向：forward 的 XZ 投影归一；垂直姿态（俯/仰视）回退北 (0,-1)
  const hLen = Math.hypot(forward.x, forward.z);
  const heading: Vec2 = hLen < EPS ? { x: 0, y: -1 } : { x: forward.x / hLen, y: forward.z / hLen };

  return { quad, heading };
}
