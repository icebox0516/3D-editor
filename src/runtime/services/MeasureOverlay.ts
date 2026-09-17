/**
 * runtime/services/MeasureOverlay —— 测量覆盖层渲染（阶段 10，T10.1）。
 *
 * 职责：MeasurePort 的运行时实现（依赖倒置实现端）——四类测量（distance/height/
 *      area/angle）的草稿与已提交项可视化：折线（Line 池，DynamicDrawUsage 缓冲
 *      只写值）+ 端点标记（Sprite 池，frame() 相机距离自适应屏幕恒定 4px）+
 *      标签（canvas 纹理 Sprite，DPR 2x 绘制、文字变更才重绘、frame() 屏幕恒定字号）。
 * 渲染纪律（stage10-measure §B，全沿 AlignGuides 先例）：恒驻组 __measure_overlay__
 *      + 池化（不逐帧新建对象）；AUX_LAYER + depthTest:false + renderOrder 1001
 *      （测量层永远置顶——明示策略，不做遮挡检测降透明）；dispose 释放全部
 *      几何/材质/纹理。不引 CSS2DRenderer/troika（自研先例延续）。
 * 标签内容按 kind（数值单一真相源 = core/math 三维纯函数，与 editor 工具同源）：
 *      distance 段长（段中点）+ 总长 Σ（末点）；height 三读数（空间/水平/ΔH）；
 *      area 水平投影面积 m²（质心）；angle ∠ABC 度数（角点）。单位两位小数。
 * 边界：不写 Scene 数据、不可拾取（AUX_LAYER + 非 contentGroup）、不进 RuntimeObjectMap；
 *      会话数据（MeasureItem）由 editor 层 MeasureSession 持有，本类只读渲染；
 *      无 DOM 环境（node 测试）跳过标签路径，不抛错（PreviewManager 先例）。
 * 实现注记：接口定义在 editor/services/ports（MeasurePort），分层 DAG 禁止
 *      runtime→editor 导入（兄弟层），故本类不 implements 接口，而以结构化类型
 *      （TS structural typing）保持签名一致——兼容性由 app 组合根装配时编译期校验。
 */
import * as THREE from 'three';
import type { MeasureKind, Vec3 } from '../../core/types';
import { angleDeg, dist3, polygonAreaXZ, polylineLength3 } from '../../core/math';
import { AUX_LAYER } from '../RenderModeState';

/** 覆盖层配色（T10.2 令牌色，DESIGN.md §5.22 单一对照源）：藤紫 0xab9ee6 = CSS 侧
 *  --mode-measure——与参考线琥珀 0xe8a33d / 足迹幽灵蓝 0x4ec9ff 三方可区分 */
const MEASURE_COLOR = 0xab9ee6;
/** 端点标记边长（CSS 像素；屏幕恒定，frame() 自适应缩放） */
const ENDPOINT_PX = 4;
/** 标签芯片高度（CSS 像素；屏幕恒定）与字体（CSS 像素） */
const LABEL_CSS_HEIGHT = 22;
const LABEL_CSS_FONT = 14;
/** 标签画布 DPR（2x 绘制，高分屏不发虚） */
const LABEL_DPR = 2;
/** 标签内边距（CSS 像素，左右各一） */
const LABEL_PADDING = 10;
/** renderOrder：与参考线同刻度（高于绘制预览 2 与顶点句柄 999/1000） */
const MEASURE_RENDER_ORDER = 1001;
/** 单条折线容量（顶点数上限：distance 超长链截断；area 闭合环 +1） */
const MAX_LINE_POINTS = 64;
/** 池上限（超出截断不致无限增长；恒驻内存有界） */
const MAX_LINES = 128;
const MAX_MARKERS = 512;
const MAX_LABELS = 256;

/** 草稿形状（结构与 editor/services/ports 的 MeasureDraft 一致） */
interface MeasureDraftShape {
  kind: MeasureKind;
  points: Vec3[];
  cursor: Vec3 | null;
}

/** 测量项形状（结构与 editor/services/measure 的 MeasureItem 一致——runtime 只读渲染） */
interface MeasureItemShape {
  id: string;
  kind: MeasureKind;
  points: Vec3[];
  createdAt: number;
}

/** 单个可视单元（一条折线 + 端点标记集 + 标签集） */
interface VisualSpec {
  chain: Vec3[];
  closed: boolean;
  markers: Vec3[];
  labels: Array<{ text: string; anchor: Vec3 }>;
}

/** 两点中点 */
function midpoint(a: Vec3, b: Vec3): Vec3 {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
}

/** 点列 XZ 质心（y 取均值；面积/环形标签锚点） */
function centroidXZ(points: Vec3[]): Vec3 {
  let x = 0;
  let y = 0;
  let z = 0;
  for (const p of points) {
    x += p.x;
    y += p.y;
    z += p.z;
  }
  const n = points.length;
  return { x: x / n, y: y / n, z: z / n };
}

/** 数值格式化：两位小数 + 单位 */
const fmtM = (v: number): string => `${v.toFixed(2)} m`;
const fmtAngle = (v: number): string => `${v.toFixed(2)}°`;

/** distance 标签：每段段长（段中点）+ 总长 Σ（末点） */
function distanceLabels(chain: Vec3[]): Array<{ text: string; anchor: Vec3 }> {
  const labels: Array<{ text: string; anchor: Vec3 }> = [];
  for (let i = 1; i < chain.length; i++) {
    labels.push({ text: fmtM(dist3(chain[i - 1]!, chain[i]!)), anchor: midpoint(chain[i - 1]!, chain[i]!) });
  }
  if (chain.length >= 2) {
    const last = chain[chain.length - 1]!;
    labels.push({ text: `Σ ${fmtM(polylineLength3(chain))}`, anchor: last });
  }
  return labels;
}

/** height 标签：三读数（空间/水平/ΔH，中点一枚） */
function heightLabels(chain: Vec3[]): Array<{ text: string; anchor: Vec3 }> {
  if (chain.length < 2) return [];
  const a = chain[0]!;
  const b = chain[1]!;
  const horizontal = Math.hypot(b.x - a.x, b.z - a.z);
  const dh = b.y - a.y;
  const text = `空间 ${fmtM(dist3(a, b))}｜水平 ${fmtM(horizontal)}｜ΔH ${fmtM(dh)}`;
  return [{ text, anchor: midpoint(a, b) }];
}

/** area 标签：水平投影面积（质心一枚） */
function areaLabels(ring: Vec3[]): Array<{ text: string; anchor: Vec3 }> {
  if (ring.length < 3) return [];
  return [{ text: `${polygonAreaXZ(ring).toFixed(2)} m²`, anchor: centroidXZ(ring) }];
}

/** angle 标签：∠ABC 度数（角点 B 一枚） */
function angleLabels(chain: Vec3[]): Array<{ text: string; anchor: Vec3 }> {
  if (chain.length < 3) return [];
  const [a, b, c] = chain;
  return [{ text: fmtAngle(angleDeg(a!, b!, c!)), anchor: b! }];
}

/** 草稿 → 可视单元（弹性段 = 末点→cursor；area 闭合环含 cursor） */
function buildDraftSpec(draft: MeasureDraftShape): VisualSpec {
  const cursor = draft.cursor;
  const pts = draft.points;
  switch (draft.kind) {
    case 'distance': {
      const chain = cursor ? [...pts, cursor] : [...pts];
      return { chain, closed: false, markers: chain, labels: distanceLabels(chain) };
    }
    case 'height': {
      const chain = cursor ? [...pts, cursor] : [...pts];
      return { chain, closed: false, markers: chain, labels: heightLabels(chain) };
    }
    case 'area': {
      const ring = cursor ? [...pts, cursor] : [...pts];
      return { chain: ring, closed: true, markers: ring, labels: areaLabels(ring) };
    }
    case 'angle': {
      const chain = cursor ? [...pts, cursor] : [...pts];
      return { chain, closed: false, markers: chain, labels: angleLabels(chain) };
    }
  }
}

/** 已提交项 → 可视单元 */
function buildItemSpec(item: MeasureItemShape): VisualSpec {
  switch (item.kind) {
    case 'distance':
      return { chain: [...item.points], closed: false, markers: item.points, labels: distanceLabels(item.points) };
    case 'height':
      return { chain: [...item.points], closed: false, markers: item.points, labels: heightLabels(item.points) };
    case 'area':
      return { chain: [...item.points], closed: true, markers: item.points, labels: areaLabels(item.points) };
    case 'angle':
      return { chain: [...item.points], closed: false, markers: item.points, labels: angleLabels(item.points) };
  }
}

/**
 * 标签 Sprite（内部池单元）：canvas 纹理 DPR 2x 绘制，文字变更才重绘
 * （同文字零 canvas 操作）；无 DOM 环境跳过纹理路径（aspect 用估算值）。
 * 芯片配色 = T10.2 令牌色（DESIGN §5.22）：深底 surface-0 系 rgba(15,17,21,0.85)
 * + 浅藤紫字 #ddd9f5（--mode-measure #ab9ee6 的浅化文字档），任意环境预设下可读。
 */
class MeasureLabel {
  readonly sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ transparent: true, depthTest: false }),
  );
  private canvas: HTMLCanvasElement | null = null;
  private texture: THREE.CanvasTexture | null = null;
  /** 已绘制在画布上的文字（变更检测；null = 从未绘制） */
  private drawnText: string | null = null;
  /** 画布宽高比（frame() 定宽用；无 DOM 时按字符数估算） */
  aspect = 2;

  constructor() {
    this.sprite.layers.set(AUX_LAYER);
    this.sprite.renderOrder = MEASURE_RENDER_ORDER;
    this.sprite.center.set(0.5, 0); // 底边中心锚定：芯片悬浮于测点上方
  }

  /** 设置文字（同文字零重绘）与位置 */
  set(text: string, anchor: Vec3): void {
    this.sprite.position.set(anchor.x, anchor.y, anchor.z);
    if (text === this.drawnText) return; // 文字变更才重绘纹理（渲染纪律）
    this.drawnText = text;
    if (typeof document === 'undefined') {
      this.aspect = Math.max(1.2, text.length * 0.32); // node：字符宽估算
      return;
    }
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.texture = new THREE.CanvasTexture(this.canvas);
      this.sprite.material.map = this.texture;
      this.sprite.material.needsUpdate = true;
    }
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    const fontPx = LABEL_CSS_FONT * LABEL_DPR;
    ctx.font = `bold ${fontPx}px system-ui, sans-serif`;
    const textW = ctx.measureText(text).width;
    const h = LABEL_CSS_HEIGHT * LABEL_DPR;
    const w = Math.max(
      Math.ceil(textW + LABEL_PADDING * 2 * LABEL_DPR),
      Math.ceil(h * 1.2),
    );
    this.canvas.width = w;
    this.canvas.height = h;
    this.aspect = w / h;
    // 尺寸变更后 font 重置：重设再绘制
    ctx.font = `bold ${fontPx}px system-ui, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(15, 17, 21, 0.85)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ddd9f5';
    ctx.fillText(text, LABEL_PADDING * LABEL_DPR, h / 2 + 1);
    this.texture!.needsUpdate = true;
  }

  /** 释放本单元资源 */
  dispose(): void {
    this.texture?.dispose();
    this.sprite.material.dispose();
    this.sprite.removeFromParent();
  }
}

export class MeasureOverlay {
  /** 恒驻辅助组（visible 按需开关；不逐帧新建） */
  private readonly group = new THREE.Group();
  /** 共享材质（dispose 释放；池化线/标记复用） */
  private readonly lineMaterial = new THREE.LineBasicMaterial({
    color: MEASURE_COLOR,
    transparent: true,
    opacity: 0.95,
    depthTest: false,
  });
  private readonly markerMaterial = new THREE.SpriteMaterial({
    color: MEASURE_COLOR,
    depthTest: false,
  });
  private readonly lines: THREE.Line[] = [];
  private readonly markers: THREE.Sprite[] = [];
  private readonly labels: MeasureLabel[] = [];
  /** 当前草稿/已提交快照（整组替换输入） */
  private draft: MeasureDraftShape | null = null;
  private items: readonly MeasureItemShape[] = [];
  /** 本次 rebuild 激活数（frame() 只遍历激活单元） */
  private activeMarkers = 0;
  private activeLabels = 0;

  constructor(scene: THREE.Object3D) {
    this.group.name = '__measure_overlay__';
    this.group.visible = false;
    this.group.layers.set(AUX_LAYER);
    scene.add(this.group);
  }

  /** 草稿整组替换（null = 清草稿）；弹性段 = points 末点→cursor（area 闭合环+cursor） */
  updateDraft(draft: MeasureDraftShape | null): void {
    this.draft = draft
      ? { kind: draft.kind, points: draft.points.map((p) => ({ ...p })), cursor: draft.cursor ? { ...draft.cursor } : null }
      : null;
    this.rebuild();
  }

  /** 已提交测量项整组替换（空数组 = 隐藏已提交层；草稿不受影响） */
  updateMeasurements(items: readonly MeasureItemShape[]): void {
    this.items = items.map((it) => ({ ...it, points: it.points.map((p) => ({ ...p })) }));
    this.rebuild();
  }

  /** 清全部（草稿 + 已提交；模式退出/清除全部用） */
  clear(): void {
    this.draft = null;
    this.items = [];
    this.rebuild();
  }

  /**
   * 渲染循环回调（Renderer.renderFrame 每帧调用）：端点 4px / 标签字号屏幕恒定——
   * 按相机距离自适应缩放（沿 AlignGuides.frame 同款换算）。无激活单元 O(1) 早退。
   * viewHeight = 宿主画布 CSS 高（Renderer 传入；非正回退 800）。
   */
  frame(camera: THREE.Camera, viewHeight: number): void {
    if (!this.group.visible) return;
    const viewH = viewHeight > 0 ? viewHeight : 800;
    const worldPerPx =
      camera instanceof THREE.PerspectiveCamera
        ? (2 * Math.tan((camera.fov * Math.PI) / 360)) / viewH
        : Math.abs((camera as THREE.OrthographicCamera).top - (camera as THREE.OrthographicCamera).bottom) / viewH;
    const camPos = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
    const world = new THREE.Vector3();
    for (let i = 0; i < this.activeMarkers; i++) {
      const marker = this.markers[i]!;
      marker.getWorldPosition(world);
      const dist = Math.max(world.distanceTo(camPos), 0.001);
      const size = ENDPOINT_PX * worldPerPx * dist;
      marker.scale.set(size, size, 1);
    }
    for (let i = 0; i < this.activeLabels; i++) {
      const label = this.labels[i]!;
      label.sprite.getWorldPosition(world);
      const dist = Math.max(world.distanceTo(camPos), 0.001);
      const h = LABEL_CSS_HEIGHT * worldPerPx * dist;
      label.sprite.scale.set(label.aspect * h, h, 1);
    }
  }

  /** 释放本类持有的资源（Renderer.dispose 调用） */
  dispose(): void {
    this.clear();
    for (const line of this.lines) line.geometry.dispose();
    this.lines.length = 0;
    for (const marker of this.markers) marker.removeFromParent();
    this.markers.length = 0;
    for (const label of this.labels) label.dispose();
    this.labels.length = 0;
    this.lineMaterial.dispose();
    this.markerMaterial.dispose();
    this.group.removeFromParent();
  }

  // ── 内部：池化重建 ──────────────────────────────────────

  /** 整组重建：草稿 + 已提交项 → 池单元认领/写值/隐藏多余（唯一写缓冲入口） */
  private rebuild(): void {
    const specs: VisualSpec[] = [];
    if (this.draft) specs.push(buildDraftSpec(this.draft));
    for (const item of this.items.slice(0, MAX_LINES - 1)) specs.push(buildItemSpec(item));

    let li = 0;
    let mi = 0;
    let ki = 0;
    for (const spec of specs) {
      if (li < MAX_LINES) this.writeLine(li++, spec.chain, spec.closed);
      for (const m of spec.markers) {
        if (mi >= MAX_MARKERS) break;
        const marker = this.ensureMarker(mi++);
        marker.position.set(m.x, m.y, m.z);
        marker.visible = true;
      }
      for (const l of spec.labels) {
        if (ki >= MAX_LABELS) break;
        const label = this.ensureLabel(ki++);
        label.set(l.text, l.anchor);
      }
    }
    // 隐藏多余池单元（池保留复用）
    for (let i = li; i < this.lines.length; i++) this.lines[i]!.visible = false;
    for (let i = mi; i < this.markers.length; i++) this.markers[i]!.visible = false;
    for (let i = ki; i < this.labels.length; i++) this.labels[i]!.sprite.visible = false;
    this.activeMarkers = mi;
    this.activeLabels = ki;
    this.group.visible = li > 0;
  }

  /** 写折线缓冲（容量截断；closed 回环首点；DynamicDrawUsage 只写值不重建） */
  private writeLine(index: number, chain: Vec3[], closed: boolean): void {
    const line = this.ensureLine(index);
    const attr = line.geometry.getAttribute('position') as THREE.BufferAttribute;
    let n = Math.min(chain.length, MAX_LINE_POINTS);
    if (closed && n >= 3 && n < MAX_LINE_POINTS) n += 1; // 回环点（首点写入末尾）
    for (let i = 0; i < n; i++) {
      const p = i < chain.length ? chain[i]! : chain[0]!; // 回环段：末点 = 首点
      attr.setXYZ(i, p.x, p.y, p.z);
    }
    attr.needsUpdate = true;
    line.geometry.setDrawRange(0, n);
    line.visible = n >= 2;
  }

  /** 扩池：一条 64 点容量折线（预分配缓冲） */
  private ensureLine(index: number): THREE.Line {
    while (this.lines.length <= index) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(MAX_LINE_POINTS * 3), 3).setUsage(THREE.DynamicDrawUsage),
      );
      const line = new THREE.Line(geometry, this.lineMaterial);
      line.layers.set(AUX_LAYER);
      line.renderOrder = MEASURE_RENDER_ORDER;
      line.frustumCulled = false; // 端点动态写入：包围球陈旧会误剔除
      this.group.add(line);
      this.lines.push(line);
    }
    return this.lines[index]!;
  }

  /** 扩池：端点标记 Sprite */
  private ensureMarker(index: number): THREE.Sprite {
    while (this.markers.length <= index) {
      const marker = new THREE.Sprite(this.markerMaterial);
      marker.layers.set(AUX_LAYER);
      marker.renderOrder = MEASURE_RENDER_ORDER;
      this.group.add(marker);
      this.markers.push(marker);
    }
    return this.markers[index]!;
  }

  /** 扩池：标签 Sprite（canvas 纹理） */
  private ensureLabel(index: number): MeasureLabel {
    while (this.labels.length <= index) {
      const label = new MeasureLabel();
      this.group.add(label.sprite);
      this.labels.push(label);
    }
    return this.labels[index]!;
  }
}
