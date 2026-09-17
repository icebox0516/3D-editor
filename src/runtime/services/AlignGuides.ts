/**
 * runtime/services/AlignGuides —— 拖拽对齐参考线渲染（T8.1 R3）。
 *
 * 职责：gizmo translate 拖拽期间的对齐参考线可视化——GizmoImpl 吸附命中时经
 *      AlignGuidesSink.update(AlignGuide[]) 汇入「世界坐标线段两端点」纯数据，
 *      本类负责几何构造与呈现：细线（LineBasicMaterial 1px 等效线宽——平台栅格化
 *      原生即 1px，不试图改 linewidth）+ 两端点标记（Sprite，屏幕恒定尺寸，
 *      frame() 按相机距离自适应缩放，沿 VertexEditImpl 句柄先例）。
 *      组恒驻场景（AUX_LAYER 独立组，沿顶点句柄/足迹 ghost 先例：不逐帧新建对象，
 *      Line/Sprite 池化复用，update 只写位置缓冲）；拖拽会话期间存在、松手即逝
 *      （clear 隐藏），不产生对象、不入历史。
 * 配色（DESIGN.md §5.12 runtime 色值对照先例）：--accent #e8a33d——琥珀 =
 * 「当前正在被操作的东西」，参考线是拖拽操作的即时反馈（与 TransformControls
 * 轴色/足迹幽灵蓝 0x4ec9ff 三方可区分）。视觉三数值（1px 线宽 / 4px 端点 /
 * --accent 映射）登记 DESIGN.md 单一对照源。
 * 边界：不写 Scene 数据、不可拾取（AUX_LAYER + 非 contentGroup）、不进 RuntimeObjectMap；
 *      深度测试关闭 + renderOrder 抬升——恒在最上不被建筑遮挡。
 */
import * as THREE from 'three';
import { AUX_LAYER } from '../RenderModeState';
import type { AlignGuide } from './GizmoImpl';

/** 参考线离地高度（米；与绘制预览/足迹幽灵统一层高 0.25） */
const GUIDE_ELEVATION = 0.25;
/** 参考线配色（--accent 令牌对应色值；DESIGN.md §5.12 对照先例） */
const GUIDE_COLOR = 0xe8a33d;
/** 端点标记边长（CSS 像素；屏幕恒定，frame() 自适应缩放） */
const GUIDE_ENDPOINT_PX = 4;
/** 线池上限（每轴至多一条命中 + 余量；超出截断不致无限增长） */
const MAX_GUIDES = 8;
/** renderOrder：高于绘制预览（2）与顶点句柄（999/1000，不同模式不共存） */
const GUIDE_RENDER_ORDER = 1001;

export class AlignGuides {
  /** 恒驻辅助组（visible 按需开关；不逐帧新建） */
  private readonly group = new THREE.Group();
  /** 共享材质（dispose 释放；池化线/标记复用） */
  private readonly lineMaterial = new THREE.LineBasicMaterial({
    color: GUIDE_COLOR,
    transparent: true,
    opacity: 0.9,
    depthTest: false,
  });
  private readonly markerMaterial = new THREE.SpriteMaterial({
    color: GUIDE_COLOR,
    depthTest: false,
  });
  /** 线池 + 端点标记池（markers[2i]/[2i+1] 属 line i） */
  private readonly lines: THREE.Line[] = [];
  private readonly markers: THREE.Sprite[] = [];
  /** 当前激活线数（池超出部分 visible=false） */
  private active = 0;

  constructor(scene: THREE.Object3D) {
    this.group.name = '__align_guides__';
    this.group.visible = false;
    this.group.layers.set(AUX_LAYER);
    scene.add(this.group);
  }

  /** 更新当前参考线组（整组替换；空数组 = 隐藏） */
  update(guides: readonly AlignGuide[]): void {
    const count = Math.min(guides.length, MAX_GUIDES);
    if (count === 0) {
      this.clear();
      return;
    }
    while (this.lines.length < count) this.growPool();
    this.active = count;
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i]!;
      const m0 = this.markers[2 * i]!;
      const m1 = this.markers[2 * i + 1]!;
      if (i < count) {
        const guide = guides[i]!;
        const attr = line.geometry.getAttribute('position') as THREE.BufferAttribute;
        const y = GUIDE_ELEVATION;
        if (guide.axis === 'x') {
          // X 对齐：线沿 Z 延伸
          attr.setXYZ(0, guide.value, y, guide.from);
          attr.setXYZ(1, guide.value, y, guide.to);
        } else {
          // Z 对齐：线沿 X 延伸
          attr.setXYZ(0, guide.from, y, guide.value);
          attr.setXYZ(1, guide.to, y, guide.value);
        }
        attr.needsUpdate = true;
        line.visible = true;
        m0.position.set(attr.getX(0), y, attr.getZ(0));
        m1.position.set(attr.getX(1), y, attr.getZ(1));
        m0.visible = true;
        m1.visible = true;
      } else {
        line.visible = false;
        m0.visible = false;
        m1.visible = false;
      }
    }
    this.group.visible = true;
  }

  /** 清除参考线（拖拽结束/释放；组隐藏，池保留复用） */
  clear(): void {
    this.group.visible = false;
    this.active = 0;
  }

  /**
   * 渲染循环回调（Renderer.renderFrame 每帧调用）：端点标记屏幕恒定尺寸——按相机
   * 距离自适应缩放（沿 VertexEditImpl.frame 同款换算）。无激活线 O(1) 早退。
   * viewHeight = 宿主画布 CSS 高（Renderer 传入；非正回退 800）。
   */
  frame(camera: THREE.Camera, viewHeight: number): void {
    if (this.active === 0 || !this.group.visible) return;
    const viewH = viewHeight > 0 ? viewHeight : 800;
    const worldPerPx =
      camera instanceof THREE.PerspectiveCamera
        ? (2 * Math.tan((camera.fov * Math.PI) / 360)) / viewH
        : Math.abs((camera as THREE.OrthographicCamera).top - (camera as THREE.OrthographicCamera).bottom) / viewH;
    const camPos = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
    const world = new THREE.Vector3();
    for (let i = 0; i < this.active; i++) {
      for (const marker of [this.markers[2 * i]!, this.markers[2 * i + 1]!]) {
        marker.getWorldPosition(world);
        const dist = Math.max(world.distanceTo(camPos), 0.001);
        // 屏幕边长 GUIDE_ENDPOINT_PX → 世界边长 = px · worldPerPx · dist
        const size = GUIDE_ENDPOINT_PX * worldPerPx * dist;
        marker.scale.set(size, size, 1);
      }
    }
  }

  /** 释放本类持有的资源（Renderer.dispose 调用） */
  dispose(): void {
    this.clear();
    for (const line of this.lines) line.geometry.dispose();
    this.lines.length = 0;
    this.markers.length = 0;
    this.lineMaterial.dispose();
    this.markerMaterial.dispose();
    this.group.removeFromParent();
  }

  // ── 内部 ────────────────────────────────────────────────

  /** 扩池一对：一条两点半径线 + 两枚端点 Sprite（预分配位置缓冲，update 只写值） */
  private growPool(): void {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(6), 3).setUsage(THREE.DynamicDrawUsage),
    );
    const line = new THREE.Line(geometry, this.lineMaterial);
    line.layers.set(AUX_LAYER);
    line.renderOrder = GUIDE_RENDER_ORDER;
    line.frustumCulled = false; // 端点动态写入：包围球陈旧会误剔除
    this.group.add(line);
    this.lines.push(line);
    for (let k = 0; k < 2; k++) {
      const marker = new THREE.Sprite(this.markerMaterial);
      marker.layers.set(AUX_LAYER);
      marker.renderOrder = GUIDE_RENDER_ORDER;
      this.group.add(marker);
      this.markers.push(marker);
    }
  }
}
