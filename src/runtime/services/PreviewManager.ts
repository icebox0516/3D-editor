/**
 * runtime/services/PreviewManager —— PreviewPort 的运行时实现（依赖倒置实现端）。
 *
 * 职责：管理两类临时预览——放置 Ghost（assetId 异步取展示对象 + 占位盒先行）与
 *      绘制过程预览（顶点标记 sprite + 折线段 + Polygon 半透明填充面 +
 *      测长/测面积文字 sprite，CanvasTexture 绘制）。
 *      2D 框选矩形（SelectTool 经 updateDrawPreview 传入 cursor:null 的闭合四角）沿用
 *      同一通道：有填充面、无测度文字（文字标注仅活跃绘制（游标存在）时显示）。
 *      T002.3 起 Ghost 源经注入的 GhostObjectProvider（组合根接 AssetSourceRouter，
 *      GLB 克隆与程序化 Mesh 同通道分派——此前直连 AssetLoader，程序化 Ghost
 *      永远停留占位盒）。T008.4 起 showGhost 增可选 seed 并透传 provideGhostObject
 *      （shapeFamily 槽路由：Ghost 与落地实例同 seed 同槽，「Ghost 预览即最终形态」；
 *      同 (assetId, seed) 重复调用仅同步变换不重建，防 pointermove 重复取源）。
 * 边界：临时对象全部归本类独立管理（需求 §分层边界规则 5）：不进正式 Scene、
 *      不进 RuntimeObjectMap（不可被拾取）、不产生历史；userData 不写业务映射；
 *      异步加载用令牌防竞态（hideGhost 后迟到的对象不再挂载）；Ghost 展示对象
 *      由提供方定义所有权（GLB 克隆共享模板资源、程序化 Mesh 共享缓存资源——
 *      两者的资源端都禁止 Ghost 方 dispose，本类只挂载/移除，语义一致）；
 *      无 DOM 环境（node 测试/SSR）跳过文字 sprite，不抛错。
 * 实现注记：接口定义在 editor/services/ports（PreviewPort），分层 DAG 禁止
 *      runtime→editor 导入（兄弟层），故不 implements 接口，以结构化类型保持签名一致
 *      （下方 DrawPreviewState 结构与 editor 侧同名接口一致），兼容性由 app 装配时校验。
 */
import type { ID, Transform, Vec2 } from '../../core/types';
import { polygonArea, polylineLength } from '../../core/math';
import type { GeometryType } from '../../domain/geometry';
import * as THREE from 'three';
import { AUX_LAYER } from '../RenderModeState';

/**
 * Ghost 展示对象提供者（结构化最小面；AssetSourceRouter 实现端）：
 * file → 模板深克隆；procedural → 共享缓存源的 Mesh。产物资源归提供方/源端所有，
 * Ghost 方（本类）只挂载/移除、永不 dispose。未注入（null）时 Ghost 恒为占位盒。
 * seed 为可选对象 seed（T008.4）：程序化端按 shapeSlotOf(seed) 槽路由（缺省按 0
 * 路由，由缓存端兜底）；GLB 端忽略该参，行为零变化。
 */
export interface GhostObjectProvider {
  provideGhostObject(assetId: ID, seed?: number): Promise<THREE.Object3D>;
}

/** 绘制预览线的离地高度（高于全部贴地表层 water 0.18 且留 0.03 层距，避免被遮挡） */
const PREVIEW_ELEVATION = 0.25;
/** 填充面离地高度（低于线/点避免遮挡轮廓，高于 water 表层 0.18 保持 0.03 层距） */
const FILL_ELEVATION = 0.21;
/** 文字 sprite 世界高度（米）与画布尺寸 */
const LABEL_HEIGHT = 1.8;
const LABEL_CANVAS_W = 256;
const LABEL_CANVAS_H = 64;

/** 绘制预览状态（结构与 editor/services/ports 的 DrawPreviewState 一致） */
export interface DrawPreviewState {
  geometryType: GeometryType;
  points: Vec2[];
  cursor: Vec2 | null;
  closed: boolean;
}

/** 足迹幽灵（结构与 editor/services/ports 的 FootprintGhost 一致；T7.6 R6） */
export interface FootprintGhost {
  /** 足迹中心（XZ 世界坐标；Vec2 = x, 世界 z） */
  center: Vec2;
  /** 足迹尺寸（米） */
  size: Vec2;
  /** 抬升（缺省统一预览层高 0.25） */
  elevation?: number;
}

export class PreviewManager {
  private readonly ghosts: GhostObjectProvider | null;
  /** 预览容器（独立于业务内容组，不参与拾取） */
  private readonly group = new THREE.Group();

  private ghostRoot: THREE.Group | null = null;
  private ghostAssetId: ID | null = null;
  /** 当前 Ghost 的对象 seed（T008.4；含 undefined 态——与 0 严格区分，去重逐值比较） */
  private ghostSeed: number | undefined;
  /** 异步竞态令牌：每次 hide/show 递增，迟到回调按令牌丢弃 */
  private ghostToken = 0;

  private drawLine: THREE.Line | null = null;
  private drawPoints: THREE.Points | null = null;
  /** Polygon 半透明填充面（DrawPreviewState 驱动） */
  private drawFill: THREE.Mesh | null = null;
  /** 足迹幽灵组（FootprintGhostPort 通道；T7.6 R6 对齐/阵列目标位置预览） */
  private footprintGroup: THREE.Group | null = null;
  /** 测长/测面积文字 sprite（CanvasTexture，活跃绘制时显示） */
  private drawLabel: THREE.Sprite | null = null;
  private labelCanvas: HTMLCanvasElement | null = null;
  private labelTexture: THREE.CanvasTexture | null = null;
  private readonly lineMaterial = new THREE.LineBasicMaterial({ color: 0x4ec9ff });
  private readonly pointsMaterial = new THREE.PointsMaterial({
    color: 0x4ec9ff,
    size: 0.5,
    sizeAttenuation: true,
  });
  /** 填充面材质：半透明双面（Shape→XZ 映射后面片法线朝下，需 DoubleSide） */
  private readonly fillMaterial = new THREE.MeshBasicMaterial({
    color: 0x4ec9ff,
    opacity: 0.18,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  private readonly ghostPlaceholderGeometry = new THREE.BoxGeometry(2, 2, 2);
  private readonly ghostPlaceholderMaterial = new THREE.MeshStandardMaterial({
    color: 0x4ec9ff,
    opacity: 0.35,
    transparent: true,
  });

  constructor(scene: THREE.Scene, ghosts: GhostObjectProvider | null) {
    this.ghosts = ghosts;
    this.group.name = '__preview__';
    scene.add(this.group);
  }

  /**
   * 预览节点入组（T6.4 R7）：子树整体划入 AUX_LAYER——非 shaded 辅助遍独占，
   * 不被内容遍的场景级 overrideMaterial 覆盖（绘制预览豁免，沿 T5.7 现状边界）。
   */
  private addToGroup(node: THREE.Object3D): void {
    node.traverse((child) => {
      child.layers.set(AUX_LAYER);
    });
    this.group.add(node);
  }

  showGhost(assetId: ID, t: Transform, seed?: number): void {
    // 去重（T008.4）：目标未变——当前 Ghost 存在且 (assetId, seed) 与既有值逐值相等
    // （seed 严格 ===，undefined ≠ 0）→ 仅同步变换，不重建；pointermove 逐帧重复调用
    // 不再触发占位盒闪烁与重复异步取源。异步取源进行中（占位盒期）同参调用同样命中，
    // 在途回调按原令牌挂载，无竞态。
    if (this.ghostRoot && this.ghostAssetId === assetId && this.ghostSeed === seed) {
      this.applyTransform(this.ghostRoot, t);
      return;
    }
    this.hideGhost();
    const token = ++this.ghostToken;
    const root = new THREE.Group();
    root.add(new THREE.Mesh(this.ghostPlaceholderGeometry, this.ghostPlaceholderMaterial));
    this.ghostRoot = root;
    this.ghostAssetId = assetId;
    this.ghostSeed = seed;
    this.applyTransform(root, t);
    this.addToGroup(root);

    if (!this.ghosts) return;
    this.ghosts
      .provideGhostObject(assetId, seed)
      .then((instance) => {
        // 竞态防护：令牌过期（已隐藏/已换目标）则丢弃迟到结果
        if (token !== this.ghostToken || this.ghostRoot !== root) return;
        root.clear();
        instance.traverse((child) => {
          child.layers.set(AUX_LAYER); // 展示子树随预览组入辅助层
        });
        root.add(instance);
      })
      .catch((err) => {
        console.warn('[PreviewManager] Ghost 模型加载失败，保留占位盒', assetId, err);
      });
  }

  updateGhost(t: Transform): void {
    if (!this.ghostRoot) return;
    this.applyTransform(this.ghostRoot, t);
  }

  hideGhost(): void {
    this.ghostToken += 1;
    if (this.ghostRoot) {
      this.ghostRoot.removeFromParent();
      this.ghostRoot = null;
    }
    this.ghostAssetId = null;
    this.ghostSeed = undefined;
  }

  /** 当前 Ghost 指向的资产 id（无 Ghost 为 null；诊断用途） */
  getGhostAssetId(): ID | null {
    return this.ghostAssetId;
  }

  /** 当前 Ghost 携带的对象 seed（无 Ghost 为 undefined；诊断用途，T008.4） */
  getGhostSeed(): number | undefined {
    return this.ghostSeed;
  }

  updateDrawPreview(state: DrawPreviewState): void {
    // 顶点标记：已确认点 + 光标点
    const markerPositions: THREE.Vector3[] = [];
    for (const p of state.points) {
      markerPositions.push(new THREE.Vector3(p.x, PREVIEW_ELEVATION, p.y));
    }
    if (state.cursor) {
      markerPositions.push(new THREE.Vector3(state.cursor.x, PREVIEW_ELEVATION, state.cursor.y));
    }
    this.drawPoints = this.syncPoints(markerPositions, this.drawPoints);

    // 折线：LineString/Polygon 显示连线（Polygon 闭合时回到起点），Point 只显示标记
    const linePositions: THREE.Vector3[] = [];
    if (state.geometryType !== 'Point') {
      for (const p of state.points) {
        linePositions.push(new THREE.Vector3(p.x, PREVIEW_ELEVATION, p.y));
      }
      if (state.cursor) {
        linePositions.push(new THREE.Vector3(state.cursor.x, PREVIEW_ELEVATION, state.cursor.y));
      }
      if (state.closed && state.points.length > 0) {
        const first = state.points[0];
        linePositions.push(new THREE.Vector3(first.x, PREVIEW_ELEVATION, first.y));
      }
    }
    this.drawLine = this.syncLine(linePositions, this.drawLine);

    // Polygon 半透明填充面：环 = 已绘点 + 游标（实时所见即面）；框选矩形同通道复用
    const liveRing: Vec2[] = state.cursor ? [...state.points, state.cursor] : [...state.points];
    if (state.geometryType === 'Polygon' && liveRing.length >= 3) {
      this.drawFill = this.syncFill(liveRing, this.drawFill);
    } else if (this.drawFill) {
      this.drawFill.removeFromParent();
      this.drawFill.geometry.dispose();
      this.drawFill = null;
    }

    // 测长/测面积文字 sprite：仅活跃绘制（游标存在）时显示（框选矩形无测度标注）
    const labelText = this.buildLabelText(state);
    if (labelText && state.cursor) {
      this.syncLabel(labelText, state.cursor);
    } else {
      this.removeLabel();
    }
  }

  clear(): void {
    this.hideGhost();
    if (this.drawLine) {
      this.drawLine.removeFromParent();
      this.drawLine.geometry.dispose();
      this.drawLine = null;
    }
    if (this.drawPoints) {
      this.drawPoints.removeFromParent();
      this.drawPoints.geometry.dispose();
      this.drawPoints = null;
    }
    if (this.drawFill) {
      this.drawFill.removeFromParent();
      this.drawFill.geometry.dispose();
      this.drawFill = null;
    }
    this.removeLabel();
  }

  /**
   * 足迹幽灵（FootprintGhostPort 结构化实现，T7.6 R6）：每足迹 = 细线矩形 +
   * 轻填充面（共享绘制预览材质，风格 0x4ec9ff 一致）；整组替换（旧几何释放）；
   * 默认抬升 0.25（与绘制预览统一层高）；零/负尺寸跳过（防退化几何）；
   * 不入正式 Scene、不可拾取、不入历史。
   */
  showFootprints(footprints: readonly FootprintGhost[]): void {
    this.clearFootprints();
    if (footprints.length === 0) return;
    const group = new THREE.Group();
    group.name = '__footprints__';
    for (const f of footprints) {
      const w = f.size.x;
      const d = f.size.y;
      if (!(w > 0) || !(d > 0)) continue;
      const elevation = f.elevation ?? PREVIEW_ELEVATION;
      const halfW = w / 2;
      const halfD = d / 2;
      const corners = [
        new THREE.Vector3(-halfW, 0, -halfD),
        new THREE.Vector3(halfW, 0, -halfD),
        new THREE.Vector3(halfW, 0, halfD),
        new THREE.Vector3(-halfW, 0, halfD),
        new THREE.Vector3(-halfW, 0, -halfD), // 闭合回起点
      ];
      const outline = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(corners),
        this.lineMaterial,
      );
      outline.position.set(f.center.x, elevation, f.center.y);
      group.add(outline);
      const fillGeometry = new THREE.PlaneGeometry(w, d);
      fillGeometry.rotateX(-Math.PI / 2); // XY 平面 → XZ 地面
      const fill = new THREE.Mesh(fillGeometry, this.fillMaterial);
      fill.position.set(f.center.x, elevation, f.center.y);
      group.add(fill);
    }
    if (group.children.length === 0) return; // 全部退化：不挂空组
    this.footprintGroup = group;
    this.addToGroup(group);
  }

  /** 清除足迹幽灵（移除足迹组 + 释放其几何；共享材质保留） */
  clearFootprints(): void {
    const group = this.footprintGroup;
    if (!group) return;
    for (const child of group.children) {
      (child as THREE.Mesh | THREE.Line).geometry.dispose();
    }
    group.removeFromParent();
    this.footprintGroup = null;
  }

  /** 释放本类持有的常驻资源（占位几何/材质/线材质/文字纹理） */
  dispose(): void {
    this.clear();
    this.clearFootprints();
    this.ghostPlaceholderGeometry.dispose();
    this.ghostPlaceholderMaterial.dispose();
    this.lineMaterial.dispose();
    this.pointsMaterial.dispose();
    this.fillMaterial.dispose();
    if (this.labelTexture) {
      this.labelTexture.dispose();
      this.labelTexture = null;
    }
    if (this.drawLabel) {
      this.drawLabel.material.dispose();
      this.drawLabel = null;
    }
    this.labelCanvas = null;
    this.group.removeFromParent();
  }

  /** 按位置列表重建 Points（无位置时移除既有） */
  private syncPoints(positions: THREE.Vector3[], existing: THREE.Points | null): THREE.Points | null {
    if (positions.length === 0) {
      if (existing) {
        existing.removeFromParent();
        existing.geometry.dispose();
      }
      return null;
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(positions);
    if (existing) {
      existing.geometry.dispose();
      existing.geometry = geometry;
      existing.visible = true;
      return existing;
    }
    const points = new THREE.Points(geometry, this.pointsMaterial);
    this.addToGroup(points);
    return points;
  }

  /** 按位置列表重建 Line（少于 2 点时移除既有） */
  private syncLine(positions: THREE.Vector3[], existing: THREE.Line | null): THREE.Line | null {
    if (positions.length < 2) {
      if (existing) {
        existing.removeFromParent();
        existing.geometry.dispose();
      }
      return null;
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(positions);
    if (existing) {
      existing.geometry.dispose();
      existing.geometry = geometry;
      existing.visible = true;
      return existing;
    }
    const line = new THREE.Line(geometry, this.lineMaterial);
    this.addToGroup(line);
    return line;
  }

  /** 按环重建半透明填充面（Shape 在 XY 平面 → rotateX(+90°) 映射到 XZ 地面，y=世界 z） */
  private syncFill(ring: Vec2[], existing: THREE.Mesh | null): THREE.Mesh | null {
    const shape = new THREE.Shape(ring.map((p) => new THREE.Vector2(p.x, p.y)));
    const geometry = new THREE.ShapeGeometry(shape);
    geometry.rotateX(Math.PI / 2);
    if (existing) {
      existing.geometry.dispose();
      existing.geometry = geometry;
      existing.visible = true;
    } else {
      existing = new THREE.Mesh(geometry, this.fillMaterial);
      this.addToGroup(existing);
    }
    existing.position.y = FILL_ELEVATION;
    return existing;
  }

  /** 组装测度文字：线 → 累计长度；面 → 实时面积（与 editor 侧 draw:status 同源公式 core/math） */
  private buildLabelText(state: DrawPreviewState): string | null {
    if (!state.cursor) return null;
    if (state.geometryType === 'LineString') {
      const chain = [...state.points, state.cursor];
      if (chain.length < 2) return null;
      return `L ${polylineLength(chain).toFixed(2)} m`;
    }
    if (state.geometryType === 'Polygon') {
      const ring = [...state.points, state.cursor];
      if (ring.length < 3) return null;
      return `A ${polygonArea(ring).toFixed(2)} m²`;
    }
    return null; // Point 无测度
  }

  /** 重绘/复用文字 sprite（CanvasTexture 常驻一张，重绘内容即可，避免逐帧建纹理） */
  private syncLabel(text: string, anchor: Vec2): void {
    if (typeof document === 'undefined') return; // 无 DOM 环境（node）：跳过文字标注
    if (!this.drawLabel) {
      this.labelCanvas = document.createElement('canvas');
      this.labelCanvas.width = LABEL_CANVAS_W;
      this.labelCanvas.height = LABEL_CANVAS_H;
      this.labelTexture = new THREE.CanvasTexture(this.labelCanvas);
      this.drawLabel = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.labelTexture,
          transparent: true,
          depthTest: false,
        }),
      );
      this.drawLabel.scale.set((LABEL_CANVAS_W / LABEL_CANVAS_H) * LABEL_HEIGHT, LABEL_HEIGHT, 1);
      this.drawLabel.renderOrder = 2;
      this.addToGroup(this.drawLabel);
    }
    const canvas = this.labelCanvas!;
    const ctx = canvas.getContext('2d')!; // createElement('canvas') 原生支持 2d
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(13, 27, 42, 0.82)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 38px system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#bfe9ff';
    ctx.fillText(text, 14, canvas.height / 2 + 2);
    this.labelTexture!.needsUpdate = true;
    this.drawLabel.position.set(anchor.x, LABEL_HEIGHT, anchor.y);
  }

  /** 移除文字 sprite（清场/无测度/无 DOM 时） */
  private removeLabel(): void {
    if (!this.drawLabel) return;
    this.drawLabel.removeFromParent();
    this.drawLabel.material.dispose();
    this.drawLabel = null;
    this.labelTexture?.dispose();
    this.labelTexture = null;
    this.labelCanvas = null;
  }

  /** 应用业务 Transform（位置/弧度旋转/缩放） */
  private applyTransform(root: THREE.Object3D, t: Transform): void {
    root.position.set(t.position.x, t.position.y, t.position.z);
    root.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z);
    root.scale.set(t.scale.x, t.scale.y, t.scale.z);
  }
}
