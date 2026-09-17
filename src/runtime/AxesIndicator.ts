/**
 * runtime/AxesIndicator —— 左下角三维坐标轴指示器（T5.7，第二视图）。
 *
 * 结构（需求 §12.3）：88×88 独立 canvas overlay + 第二 Scene（三轴线段 + X/Y/Z 字符
 * canvas 贴图标签）+ 正交相机；每帧将主相机四元数（仅旋转分量）同步给指示器相机，
 * 主渲染后第二个小 render（draw call 增量 = 2：1 条合并线段 + 1 个三标签网格 ≤ 3）。
 *
 * 生命周期与降级：
 *  - 宿主为空或无 DOM（node 测试）：无头形态——场景/相机/姿态逻辑可用，canvas 与
 *    WebGLRenderer 不创建，render() 空转不抛错；
 *  - WebGL 初始化失败（上下文耗尽等）：降级无头并移除空 canvas，主渲染不受影响；
 *  - dispose 释放全部自有资源并移除 canvas；绝不调用 forceContextLoss（Renderer 同款
 *    语义：独立小上下文，dispose 只释放本实例 GL 对象）。
 *
 * 边界：配色走行业惯例 X 红 / Y 绿 / Z 蓝（视口内 3D 内容不受 UI 色板约束，DESIGN.md
 *      §2 已有此条）；不依赖主渲染器（独立上下文），主 renderer.info 不受第二 render
 *      污染（getViewportStats 口径干净）；canvas 定位样式由 ui 层 .ed-viewport__axes 承担。
 */
import * as THREE from 'three';

/** 指示器画布边长（px） */
const AXES_CANVAS_SIZE = 88;
/** 轴长（指示器局部坐标单位；正交视域内） */
export const AXIS_LENGTH = 1;
/** 标签锚点距原点距离（略超轴端，字符贴图不压轴线） */
export const LABEL_INSET = 1.18;
/** 标签四边形边长（指示器局部坐标单位） */
const LABEL_QUAD = 0.3;
/** 正交相机视域半宽（容纳轴端 + 标签，四角旋转不裁剪） */
const FRUSTUM_HALF = 1.42;
/** 正交相机距离（near/far 覆盖原点前后） */
const CAMERA_DISTANCE = 3;

/** 轴配色（行业惯例：X 红 / Y 绿 / Z 蓝） */
const AXIS_COLORS: ReadonlyArray<[number, number, number]> = [
  [0.88, 0.24, 0.19], // X 红
  [0.29, 0.68, 0.35], // Y 绿
  [0.26, 0.46, 0.84], // Z 蓝
];

/** 轴端单位向量（X/Y/Z 顺序） */
const AXIS_ENDS: ReadonlyArray<THREE.Vector3> = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 1),
];

/** 字符贴图单元格尺寸（px；三格横排 X|Y|Z） */
const GLYPH_CELL = 64;

export interface AxesIndicatorOptions {
  /** 画布边长（px；缺省 88） */
  size?: number;
}

export class AxesIndicator {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.OrthographicCamera;

  private readonly canvas: HTMLCanvasElement | null;
  private readonly renderer: THREE.WebGLRenderer | null;
  private readonly axesLine: THREE.LineSegments;
  private readonly labels: THREE.Mesh;
  private readonly labelGeometry: THREE.BufferGeometry;
  private readonly labelMaterial: THREE.MeshBasicMaterial;
  private readonly labelTexture: THREE.CanvasTexture | null;
  private readonly sizePx: number;
  private visible = true;
  private disposed = false;

  constructor(host: HTMLElement | null, options: AxesIndicatorOptions = {}) {
    this.sizePx = options.size ?? AXES_CANVAS_SIZE;

    // ── 三轴线段：单几何合并（6 顶点 + 顶点色）→ 1 个 draw call ──
    const axisVertices = new Float32Array(AXIS_ENDS.length * 2 * 3);
    const axisColors = new Float32Array(AXIS_ENDS.length * 2 * 3);
    AXIS_ENDS.forEach((end, i) => {
      const base = i * 6;
      axisVertices.fill(0, base, base + 3); // 原点端
      axisVertices[base + 3] = end.x * AXIS_LENGTH;
      axisVertices[base + 4] = end.y * AXIS_LENGTH;
      axisVertices[base + 5] = end.z * AXIS_LENGTH;
      const [r, g, b] = AXIS_COLORS[i]!;
      for (let v = 0; v < 2; v += 1) {
        axisColors[base + v * 3] = r;
        axisColors[base + v * 3 + 1] = g;
        axisColors[base + v * 3 + 2] = b;
      }
    });
    const axisGeometry = new THREE.BufferGeometry();
    axisGeometry.setAttribute('position', new THREE.BufferAttribute(axisVertices, 3));
    axisGeometry.setAttribute('color', new THREE.BufferAttribute(axisColors, 3));
    this.axesLine = new THREE.LineSegments(
      axisGeometry,
      new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95, depthTest: false }),
    );
    this.scene.add(this.axesLine);

    // ── X/Y/Z 字符标签：单网格三公告板四边形（canvas 贴图三单元格 UV）→ 1 个 draw call ──
    this.labelTexture = createLabelTexture();
    this.labelGeometry = createLabelGeometry();
    this.labelMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      depthTest: false,
      side: THREE.DoubleSide,
      ...(this.labelTexture ? { map: this.labelTexture } : {}),
    });
    this.labels = new THREE.Mesh(this.labelGeometry, this.labelMaterial);
    this.labels.renderOrder = 1; // 标签恒在轴线上方（同场景内无深度遮挡，渲染序兜底）
    this.scene.add(this.labels);

    // ── 正交相机：固定位置，仅同步主相机旋转 ──
    this.camera = new THREE.OrthographicCamera(
      -FRUSTUM_HALF,
      FRUSTUM_HALF,
      FRUSTUM_HALF,
      -FRUSTUM_HALF,
      0.1,
      CAMERA_DISTANCE * 2,
    );
    this.camera.position.set(0, 0, CAMERA_DISTANCE);
    this.camera.lookAt(0, 0, 0);
    this.updateLabels(); // 初始姿态下的标签铺位

    // ── canvas / WebGLRenderer（宿主为空或无 DOM → 无头形态）──
    let canvas: HTMLCanvasElement | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    if (host !== null && typeof document !== 'undefined') {
      canvas = document.createElement('canvas');
      canvas.className = 'ed-viewport__axes';
      canvas.width = this.sizePx;
      canvas.height = this.sizePx;
      canvas.setAttribute('aria-hidden', 'true');
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio ?? 1, 2));
        renderer.setSize(this.sizePx, this.sizePx, false);
      } catch (err) {
        // 独立小上下文创建失败：降级无头（主渲染不受影响），空 canvas 移除
        console.warn('[AxesIndicator] 指示器 WebGL 初始化失败，坐标轴指示器不可用', err);
        renderer = null;
        canvas.remove();
        canvas = null;
      }
      if (canvas !== null) host.appendChild(canvas);
    }
    this.canvas = canvas;
    this.renderer = renderer;
  }

  /** 是否具备渲染资格（可见且未销毁；无头形态缺渲染器时 render() 内部再判并空转） */
  get isRenderable(): boolean {
    return this.visible && !this.disposed;
  }

  /** 显示开关（Viewport Options 经环境通道 axes.visible 驱动） */
  setVisible(visible: boolean): void {
    this.visible = visible;
    if (this.canvas !== null) this.canvas.style.display = visible ? '' : 'none';
  }

  /** 同步主相机姿态（仅旋转分量：四元数复制，不跟随位置） */
  syncFrom(mainCamera: THREE.Camera): void {
    this.camera.quaternion.copy(mainCamera.quaternion);
  }

  /** 按当前指示器相机姿态重铺标签四边形（公告板：面向相机，锚点不变） */
  updateLabels(): void {
    const position = this.labelGeometry.getAttribute('position') as THREE.BufferAttribute;
    const right = _basisX.set(1, 0, 0).applyQuaternion(this.camera.quaternion);
    const up = _basisY.set(0, 1, 0).applyQuaternion(this.camera.quaternion);
    const half = LABEL_QUAD / 2;
    for (let quad = 0; quad < AXIS_ENDS.length; quad += 1) {
      const anchor = _anchor.copy(AXIS_ENDS[quad]!).multiplyScalar(LABEL_INSET);
      // 四角（逆时针）：(-h,-h) (h,-h) (h,h) (-h,h) —— 与 UV/索引对应
      const corners: ReadonlyArray<[number, number]> = [
        [-half, -half],
        [half, -half],
        [half, half],
        [-half, half],
      ];
      for (let c = 0; c < 4; c += 1) {
        const [rx, uy] = corners[c]!;
        position.setXYZ(
          quad * 4 + c,
          anchor.x + right.x * rx + up.x * uy,
          anchor.y + right.y * rx + up.y * uy,
          anchor.z + right.z * rx + up.z * uy,
        );
      }
    }
    position.needsUpdate = true;
  }

  /**
   * 帧驱动（主渲染后调用）：同步主相机姿态 → 重铺标签 → 第二个小 render。
   * 隐藏或无头时零开销空转（不上传、不绘制）。
   */
  render(mainCamera: THREE.Camera): void {
    if (!this.isRenderable || this.renderer === null) return;
    this.syncFrom(mainCamera);
    this.updateLabels();
    this.renderer.render(this.scene, this.camera);
  }

  /** 释放全部自有资源并移除 canvas（幂等；不触碰主渲染器） */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.axesLine.geometry.dispose();
    (this.axesLine.material as THREE.Material).dispose();
    this.labelGeometry.dispose();
    this.labelMaterial.dispose();
    this.labelTexture?.dispose();
    this.renderer?.dispose(); // 独立小上下文：只释放本实例 GL 对象（无 forceContextLoss）
    this.canvas?.remove();
  }
}

// 模块级暂存（单线程渲染运行时；three 自身同款惯例）
const _basisX = new THREE.Vector3();
const _basisY = new THREE.Vector3();
const _anchor = new THREE.Vector3();

/** X|Y|Z 三单元格字符贴图（无 DOM 环境返回 null → 标签退化为纯色四边形） */
function createLabelTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = GLYPH_CELL * 3;
    canvas.height = GLYPH_CELL;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const glyphs = ['X', 'Y', 'Z'];
    glyphs.forEach((glyph, i) => {
      ctx.fillStyle = '#ffffff';
      ctx.font = `600 ${Math.round(GLYPH_CELL * 0.62)}px 'IBM Plex Mono', Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(glyph, i * GLYPH_CELL + GLYPH_CELL / 2, GLYPH_CELL / 2 + 1);
    });
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  } catch {
    return null;
  }
}

/** 三公告板四边形几何：12 顶点 × UV（各映射贴图一格）× 6 索引/四边形（两三角） */
function createLabelGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12 * 3), 3));
  const uv = new Float32Array(12 * 2);
  for (let quad = 0; quad < AXIS_ENDS.length; quad += 1) {
    const u0 = quad / 3;
    const u1 = (quad + 1) / 3;
    const corners: ReadonlyArray<[number, number]> = [
      [u0, 0],
      [u1, 0],
      [u1, 1],
      [u0, 1],
    ];
    for (let c = 0; c < 4; c += 1) {
      const [u, v] = corners[c]!;
      uv[(quad * 4 + c) * 2] = u;
      uv[(quad * 4 + c) * 2 + 1] = v;
    }
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const indices: number[] = [];
  for (let quad = 0; quad < AXIS_ENDS.length; quad += 1) {
    const b = quad * 4;
    indices.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  geometry.setIndex(indices);
  return geometry;
}
