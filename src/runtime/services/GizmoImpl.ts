/**
 * runtime/services/GizmoImpl —— GizmoPort 的运行时实现（依赖倒置实现端，T2.4；T7.5 多对象成组变换；
 * T7.6 translate 对象吸附 + 网格吸附统一接入；T8.1 旋转步进 / 高度层吸附 / 对齐参考线 / 吸附分级总开关）。
 *
 * 职责：用 three TransformControls 实现「挂载选中对象 → 拖拽预览 → 一次性 before/after」：
 *  1. attach(ids)：TransformControls 单次只挂一个对象——挂一个「代理 Object3D」（始终在
 *     场景图中，TransformControls 依赖 parent.matrixWorld）：
 *     - 单目标（1 个 id）：代理姿态同步该对象变换，旋转/缩放绕对象自身原点（T2.4 原行为）；
 *     - 多目标（≥2 个，T7.5）：代理初始姿态 = 选中集质心位置（各目标 transform.position
 *       算术平均）+ 单位旋转 + 单位缩放（组枢轴），旋转/缩放绕质心生效；
 *     - resync()（T8.6 缺陷①）：attach 后场景 transform 外部变化（undo/redo/贴地/
 *       阵列等命令路径）重读写回代理；拖拽会话中无操作（自反馈防护）；
 *  2. 拖拽中（objectChange）：把代理中间变换经 applyPreview 回调写进真实渲染对象——
 *     要素对象直接改其根 Object3D；实例化模型经 InstancedAssetPool.update 写矩阵
 *     （锚点不在渲染树，不能直接 attach，由 Renderer 注入分派实现所见即所得）；
 *     多目标时按增量矩阵 D = proxyFinal ∘ proxyStart⁻¹ 逐目标合成 after_i = D ∘ before_i；
 *     期间零事件零命令（预览隔离）；
 *  3. 拖拽结束（dragging-changed=false）：before 取拖拽开始时的场景数据快照、after 取
 *     代理最终姿态（多目标 = 逐目标增量合成），同一手势 N 目标 = N 次 onDragEnd 回调
 *     （GizmoPort 签名零变更，TransformTool 聚合为一条 BatchCommand）；
 *  4. dragging-changed 同步启停 OrbitControls（拖 gizmo 时禁用轨道旋转）；
 *  5. 吸附（T7.6 → T8.1 分级）：
 *     - 总开关：snapTiers.masterEnabled 压下全部吸附分项（绘制辅助三键不受管辖）；
 *       按住 Ctrl（拖拽会话内）临时反转总状态（XOR，松开/失焦恢复）；
 *     - 网格吸附（translate）：gridSnap（结构化共享配置）snapEnabled 时
 *       controls.setTranslationSnap(spacing)；模式切换/拖拽开始/Ctrl 变化时同步；
 *     - 旋转步进（rotate，T8.1）：snapTiers.angleEnabled 且步长合法时
 *       setRotationSnap(degToRad(step))——TransformControls 语义为相对拖拽起始姿态的
 *       增量步进（非绝对角度网格，three.js 既定行为，非缺陷）；
 *     - 对象吸附（translate）：objectSnap.enabled 时对 proxy.position 施加 XZ 修正
 *       （边对齐 T7.6 + 中心线对齐 T8.1；两轴独立，Y 不吸附）——TransformControls 每次
 *       pointer move 从内部增量重算 position，外部修正不累积、天然幂等；命中时覆盖
 *       网格吸附结果，并经 guides 汇出对齐参考线（拖拽会话期间存在、松手即逝）；
 *     - 高度层吸附（translate Y，T8.1）：snapTiers.elevationEnabled 时对 proxy.position.y
 *       施加底面层修正（候选 = 地面 0 + 其余对象底/顶面派生层，容差复用 objectSnap.threshold；
 *       幂等修正沿对象吸附同款模式）。
 *     拖拽目标 bounds：单选 = 该对象足迹，多选 = 选集足迹并集（拖拽开始时快照 + 代理位移
 *     换算当前位）；候选 = 其余可见对象足迹（排除自身；不可见对象经 getFootprint 返回
 *     null 天然排除）。候选在拖拽开始一次性快照（T7.6 prepareObjectSnap 先例），
 *     拖拽帧内零全场景扫描；总开关关闭也照常快照（Ctrl 反转恢复时免重收集）。
 * 边界：只读业务数据（getTransform 由 Renderer 提供 sceneManager 查询）；不写 Scene、
 *      不发事件、不进历史——命令化归 TransformTool；接口定义在 editor/services/ports
 *      （GizmoPort），分层 DAG 禁止 runtime→editor 导入，故不 implements 而以结构化
 *      类型保持签名一致；增量合成纯函数（transformToMatrix / matrixToTransform /
 *      composeGroupDelta / applyGroupDelta）、对象吸附纯函数（unionFootprint /
 *      collectSnapEdges / snapFootprintDelta）与对齐候选/参考线/高度层纯函数
 *      （collectSnapCandidates / snapFootprintToCandidates / snapElevationDelta）
 *      导出供 node 环境测试。
 */
import type { ID, Transform } from '../../core/types';
import { degToRad } from '../../core/utils';
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { AUX_LAYER } from '../RenderModeState';

/**
 * 对象吸附共享配置（结构化：editor 层 ObjectSnapConfig 由组合根注入同一可变对象，
 * 设置面板开关/容差即时生效；未注入或 enabled=false 不吸附）。
 */
export interface ObjectSnapSource {
  enabled: boolean;
  /** 吸附容差（米；非法值视为关闭） */
  threshold: number;
}

/**
 * 网格吸附共享配置（结构化：editor 层 DrawGridConfig 由组合根注入同一可变对象，
 * gizmo translate 与绘制工具同源开关/步长）。
 */
export interface GridSnapSource {
  snapEnabled: boolean;
  spacing: number;
}

/**
 * 吸附分级共享配置（结构化：editor 层 SnapTiersConfig 由组合根注入同一可变对象，
 * T8.1）：总开关 + 角度/高度分项与步长。masterEnabled 压下全部吸附分项；
 * 按住 Ctrl（拖拽会话内）临时反转（snapActive = masterEnabled XOR ctrlHeld）。
 */
export interface SnapTiersSource {
  /** 吸附总开关（Context Toolbar / 菜单 tool.snap 同源；不影响绘制辅助三键） */
  masterEnabled: boolean;
  /** 角度吸附分项（rotate 模式步进） */
  angleEnabled: boolean;
  /** 角度步长（度；非法值视为不吸附） */
  angleStepDeg: number;
  /** 高度吸附分项（translate Y 轴高度层） */
  elevationEnabled: boolean;
}

/** 世界 XZ 足迹包围盒（对象吸附的数据形态；与编辑层 FootprintBox 同构） */
export interface FootprintBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/**
 * 单轴对齐候选线（T8.1 R3）：候选坐标 + 来源足迹沿参考线延伸轴的范围 + 种类。
 * kind 供参考线视觉区分（边缘 / 中心线）。
 */
export interface SnapCandidateLine {
  axis: 'x' | 'z';
  /** 候选坐标（X 轴候选 = 世界 x 值；Z 轴候选 = 世界 z 值） */
  value: number;
  /** 来源足迹沿参考线延伸轴的范围（X 轴候选 → Z 范围；Z 轴候选 → X 范围） */
  from: number;
  to: number;
  kind: 'edge' | 'center';
}

/** 双轴候选线集合 */
export interface SnapCandidates {
  x: SnapCandidateLine[];
  z: SnapCandidateLine[];
}

/**
 * 对齐参考线（纯数据，T8.1 R3）：一条世界坐标线段——axis 轴上 value 处、沿另一轴
 * 从 from 到 to（端点 = 拖拽框与来源框的延伸范围并集）。editor 层零 THREE，
 * 几何构造归 runtime AlignGuides（本类型为两端共享的数据契约）。
 */
export interface AlignGuide {
  axis: 'x' | 'z';
  /** 线所在坐标（axis 轴上的世界值） */
  value: number;
  /** 线段两端点（沿另一轴的世界坐标） */
  from: number;
  to: number;
  /** 对齐种类（边缘 / 中心线） */
  kind: 'edge' | 'center';
}

/** 对齐参考线呈现端口（结构化：runtime AlignGuides 实现，Renderer 注入；未注入不显示） */
export interface AlignGuidesSink {
  /** 更新当前参考线组（整组替换；空数组隐藏） */
  update(guides: readonly AlignGuide[]): void;
  /** 清除全部参考线（拖拽结束/释放） */
  clear(): void;
}

/** Gizmo 装配依赖（Renderer 提供） */
export interface GizmoImplDeps {
  camera: THREE.Camera;
  /** 拖拽事件监听目标（与 OrbitControls 同一 canvas） */
  domElement: HTMLElement;
  /** gizmo helper 的挂载场景（渲染树） */
  scene: THREE.Object3D;
  /** 拖拽期间需要停用的相机轨道控制（可空） */
  orbit?: { enabled: boolean } | null;
  /** 业务 id → 当前数据变换（拖拽 before 的权威来源；不存在返回 null） */
  getTransform(id: ID): Transform | null;
  /** 拖拽中的中间变换写到渲染对象（要素根 / 实例池矩阵，由 Renderer 分派） */
  applyPreview(id: ID, t: Transform): void;
  /** 对象吸附共享配置（可空：未注入不吸附；T7.6） */
  objectSnap?: ObjectSnapSource | null;
  /** 网格吸附共享配置（可空：未注入不接 translationSnap；T7.6） */
  gridSnap?: GridSnapSource | null;
  /** 吸附分级共享配置（可空：未注入视为总开关开、角度/高度分项关——T7.6 行为零回归） */
  snapTiers?: SnapTiersSource | null;
  /** id → 世界 XZ 足迹（Renderer 从场景数据算；不可见对象返回 null；T7.6 对象吸附） */
  getFootprint?(id: ID): FootprintBox | null;
  /** 场景全部对象 id（对象吸附候选枚举；T7.6） */
  getObjectIds?(): readonly ID[];
  /**
   * 高度吸附候选层（T8.1：地面 0 + 其余对象底/顶面派生层，Renderer 经 domain 纯函数算；
   * T9.2：经 collectElevationSnapLevels 按拖拽目标类型施加模型抬升——全为模型时
   * 候选含 MODEL_BASE_HEIGHT（承托面 + lift），region / 混合选中保持裸值）
   */
  getElevationLevels?(excludeIds: readonly ID[]): number[];
  /** id → 对象底面高度层（T8.1：region = baseHeight+posY、model = posY；拖拽底面基准） */
  getBaseLevel?(id: ID): number | null;
  /** 对齐参考线呈现（可空：未注入吸附修正照常、仅无参考线视觉；T8.1 R3） */
  guides?: AlignGuidesSink | null;
}

/** 拖拽结束信息（结构与 editor GizmoPort.onDragEnd 载荷一致） */
export interface GizmoDragEndInfo {
  objectId: ID;
  before: Transform;
  after: Transform;
}

export class GizmoImpl {
  private readonly controls: TransformControls;
  private readonly helper: THREE.Object3D;
  /** 拖拽代理：始终挂在场景中（TransformControls 要求挂载对象有 parent） */
  private readonly proxy = new THREE.Object3D();
  private readonly deps: GizmoImplDeps;
  /** 当前挂载的业务 id 集（空 = 未挂载；1 个 = 单选原行为，≥2 = 成组枢轴） */
  private targetIds: ID[] = [];
  private dragging = false;
  /** 拖拽开始时各目标的场景数据快照（before 的权威来源；拖拽期间数据不被修改） */
  private beforeMap = new Map<ID, Transform>();
  /** 拖拽开始时代理姿态（多目标增量 D = proxyFinal ∘ proxyStart⁻¹ 的起点） */
  private proxyStart: Transform | null = null;
  private dragEndCb: ((info: GizmoDragEndInfo) => void) | null = null;
  /** 当前 gizmo 模式（吸附仅 translate/rotate 生效） */
  private mode: 'translate' | 'rotate' | 'scale' = 'translate';
  /** 对齐候选线（边 + 中心；拖拽开始时快照；未启用/无候选为 null；T8.1） */
  private snapCandidates: SnapCandidates | null = null;
  /** 拖拽目标足迹并集（拖拽开始时快照；多选 = 并集） */
  private snapBaseBox: FootprintBox | null = null;
  /** snapBaseBox 快照时的代理位置（当前移动框 = base + 代理位移） */
  private snapBaseProxy = { x: 0, y: 0, z: 0 };
  /** 高度吸附候选层（拖拽开始时快照；未启用为 null；T8.1） */
  private snapElevLevels: number[] | null = null;
  /** 拖拽目标底面层快照（多选 = 最低底面；未启用为 null；T8.1） */
  private snapBaseBottom: number | null = null;
  /** 按住 Ctrl（拖拽会话内临时反转吸附总状态；窗口键监听跟踪，T8.1 R4） */
  private ctrlHeld = false;

  constructor(deps: GizmoImplDeps) {
    this.deps = deps;
    this.controls = new TransformControls(deps.camera, deps.domElement);
    this.controls.size = 0.9;
    this.helper = this.controls.getHelper();
    this.helper.visible = false;
    deps.scene.add(this.helper);
    this.proxy.name = '__gizmo_proxy__';
    deps.scene.add(this.proxy);

    // T6.4 R7：Gizmo 手柄/代理划入 AUX_LAYER（非 shaded 辅助遍独占、不被内容 override 覆盖）；
    // TransformControls 自身拾取按 raycaster.layers 过滤（默认仅 layer 0），手柄挪层后
    // 须开全层（three 0.186 getRaycaster 存在），否则变换手柄拾取失效。
    this.helper.traverse((node) => {
      node.layers.set(AUX_LAYER);
    });
    this.proxy.layers.set(AUX_LAYER);
    this.controls.getRaycaster().layers.enableAll();

    this.controls.addEventListener('dragging-changed', (event) => {
      const active = Boolean((event as { value: unknown }).value);
      if (deps.orbit) deps.orbit.enabled = !active;
      if (active) {
        this.dragging = true;
        // 网格/旋转步进配置可能已变（菜单开关/步长）：每次拖拽开始同步一次
        this.syncGridSnap();
        this.syncRotationSnap();
        // before 以拖拽开始时刻的场景数据为准（拖拽期间数据不被修改）
        this.beforeMap = new Map();
        for (const id of this.targetIds) {
          const t = deps.getTransform(id);
          if (t) this.beforeMap.set(id, t);
        }
        this.proxyStart = objectPoseToTransform(this.proxy);
        this.prepareObjectSnap();
      } else if (this.dragging) {
        this.dragging = false;
        this.clearSnapState();
        this.finishDrag();
      }
    });
    this.controls.addEventListener('objectChange', () => {
      if (!this.dragging || this.targetIds.length === 0) return;
      // 对象吸附（仅 translate；命中时对 proxy.position 施加修正，覆盖网格吸附结果；
      // 同时汇出对齐参考线）+ 高度层吸附（Y 轴独立）
      this.applyObjectSnap();
      this.applyElevationSnap();
      if (this.targetIds.length === 1) {
        // 单选：代理姿态即目标姿态（原行为，零矩阵换算噪声）
        const id = this.targetIds[0]!;
        if (this.beforeMap.has(id)) deps.applyPreview(id, objectPoseToTransform(this.proxy));
        return;
      }
      // 多选：增量 D = proxyFinal ∘ proxyStart⁻¹，逐目标 after_i = D ∘ before_i
      const start = this.proxyStart;
      if (!start) return;
      const delta = composeGroupDelta(start, objectPoseToTransform(this.proxy));
      for (const id of this.targetIds) {
        const before = this.beforeMap.get(id);
        if (!before) continue;
        deps.applyPreview(id, applyGroupDelta(before, delta));
      }
    });

    // Ctrl 跟踪（T8.1 R4）：拖拽会话内按住临时反转吸附总状态——XOR 在 snapActive()；
    // keydown/keyup 跟踪（objectChange 不携带修饰键）；blur 复位防卡键。无 window
    // 环境（node 单测）跳过监听。
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.onKeyDown);
      window.addEventListener('keyup', this.onKeyUp);
      window.addEventListener('blur', this.onWindowBlur);
    }
  }

  private readonly onKeyDown = (e: Event): void => {
    const key = (e as KeyboardEvent).key;
    if (key === 'Control' || key === 'Meta') this.setCtrlHeld(true);
  };

  private readonly onKeyUp = (e: Event): void => {
    const key = (e as KeyboardEvent).key;
    if (key === 'Control' || key === 'Meta') this.setCtrlHeld(false);
  };

  private readonly onWindowBlur = (): void => {
    this.setCtrlHeld(false);
  };

  /** Ctrl 状态切换：拖拽中即时重同步网格/旋转步进（对象/高度吸附逐帧按 snapActive 判定） */
  private setCtrlHeld(held: boolean): void {
    if (this.ctrlHeld === held) return;
    this.ctrlHeld = held;
    if (this.dragging) {
      this.syncGridSnap();
      this.syncRotationSnap();
    }
  }

  /**
   * 挂到给定对象集合（空数组等价 detach；解析不到数据的 id 剔除）。
   * 单目标：代理同步该对象变换；多目标：代理 = 质心位置 + 单位旋转/缩放（组枢轴）。
   */
  attach(ids: ID[]): void {
    this.controls.detach();
    this.targetIds = [];
    if (this.resolveAndApplyPose(ids)) this.controls.attach(this.proxy);
  }

  /**
   * 代理重同步（T8.6 缺陷①）：对当前挂载集重读场景 transform 写回 proxy。attach 是
   * 一次性快照，此后场景对象变化（undo/redo/贴地/阵列/属性面板批量改值）不回写
   * proxy——手柄漂移在旧位姿；TransformTool 订阅 scene:changed 后调用本方法。
   * 拖拽会话进行中无操作（自反馈防护：拖拽中 proxy 姿态即真源，外部重同步会打断
   * 手势并污染增量合成的 before 快照）；未挂载无操作。组壳（getTransform → null）
   * 按 attach 同语义剔除，全部失效时等价 detach。不重挂 TransformControls——
   * proxy 引用不变，仅重写姿态（挂载期间拖拽本就持续改写它，语义一致）。
   */
  resync(): void {
    if (this.dragging || this.targetIds.length === 0) return;
    if (!this.resolveAndApplyPose(this.targetIds)) {
      this.controls.detach(); // 挂载集全部失效（如撤销成组）→ 等价 detach
    }
  }

  /**
   * 解析 id → transform（null 剔除，组壳语义）并把代理姿态对齐解析结果：
   * 单目标 = 该对象变换、多目标 = 质心组枢轴；含 updateMatrixWorld。
   * @returns 是否有可挂载目标（false = 全部解析失败）
   */
  private resolveAndApplyPose(ids: readonly ID[]): boolean {
    const resolved: Array<{ id: ID; t: Transform }> = [];
    for (const id of ids) {
      const t = this.deps.getTransform(id);
      if (t) resolved.push({ id, t });
    }
    if (resolved.length === 0) return false;
    this.targetIds = resolved.map((entry) => entry.id);
    applyTransformToObject(
      this.proxy,
      resolved.length === 1 ? resolved[0]!.t : groupPivotTransform(resolved.map((e) => e.t)),
    );
    this.proxy.updateMatrixWorld(true);
    return true;
  }

  detach(): void {
    this.controls.detach();
    this.targetIds = [];
  }

  setMode(mode: 'translate' | 'rotate' | 'scale'): void {
    this.mode = mode;
    this.controls.setMode(mode);
    this.syncGridSnap(); // 网格吸附仅 translate 生效（rotate/scale 置 null）
    this.syncRotationSnap(); // 旋转步进仅 rotate 生效（translate/scale 置 null；T8.1）
  }

  onDragEnd(cb: (info: GizmoDragEndInfo) => void): void {
    this.dragEndCb = cb;
  }

  /** 释放（Renderer.dispose 调用） */
  dispose(): void {
    this.controls.detach();
    this.controls.dispose();
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('keyup', this.onKeyUp);
      window.removeEventListener('blur', this.onWindowBlur);
    }
    this.helper.removeFromParent();
    this.proxy.removeFromParent();
    this.beforeMap.clear();
    this.clearSnapState();
  }

  // ── 吸附（T7.6 对象/网格 → T8.1 分级/旋转/高度/参考线）─────

  /**
   * 吸附总状态（含 Ctrl 临时反转，T8.1 R4）：masterEnabled XOR ctrlHeld。
   * snapTiers 未注入视为总开关开（T7.6 行为零回归）。
   */
  private snapActive(): boolean {
    const master = this.deps.snapTiers ? this.deps.snapTiers.masterEnabled : true;
    return master !== this.ctrlHeld;
  }

  /**
   * 网格吸附同步：gridSnap.snapEnabled 且 translate 模式且总状态开 →
   * translationSnap = spacing，否则 null（关闭）。配置为共享可变对象，
   * 每次模式切换/拖拽开始/Ctrl 变化重读。
   */
  private syncGridSnap(): void {
    const grid = this.deps.gridSnap;
    const spacing =
      grid && grid.snapEnabled && this.snapActive() && Number.isFinite(grid.spacing) && grid.spacing > 0
        ? grid.spacing
        : null;
    this.controls.setTranslationSnap(this.mode === 'translate' ? spacing : null);
  }

  /**
   * 旋转步进同步（T8.1 R1）：snapTiers.angleEnabled 且 rotate 模式且总状态开且步长
   * 合法 → rotationSnap = degToRad(step)，否则 null。TransformControls 旋转吸附为
   * 相对拖拽起始姿态的增量步进（任务书验收口径）。degToRad 取 core/utils
   * （与 editor 层 angleSnapToRadians 同源换算）。
   */
  private syncRotationSnap(): void {
    const tiers = this.deps.snapTiers;
    const stepDeg =
      tiers && tiers.angleEnabled && this.snapActive() && Number.isFinite(tiers.angleStepDeg) && tiers.angleStepDeg > 0
        ? tiers.angleStepDeg
        : null;
    this.controls.setRotationSnap(this.mode === 'rotate' ? (stepDeg !== null ? degToRad(stepDeg) : null) : null);
  }

  /**
   * 拖拽开始：快照对齐候选线（边+中心）+ 拖拽目标足迹并集 + 高度候选层与底面基准
   * （未启用/无数据则空态）。候选在总开关关闭时也照常快照——Ctrl 反转恢复时免重收集，
   * 生效判定归 apply*（每帧按 snapActive 门控）。
   */
  private prepareObjectSnap(): void {
    this.clearSnapState();
    if (this.mode !== 'translate') return;

    // XZ 对齐候选（对象吸附分项）：边 + 中心线（T8.1 中心线为新增维度）
    if (this.deps.objectSnap?.enabled && this.deps.getFootprint && this.deps.getObjectIds) {
      const exclude = new Set(this.targetIds);
      const entries: Array<{ id: ID; box: FootprintBox }> = [];
      for (const id of this.deps.getObjectIds()) {
        if (exclude.has(id)) continue; // 排除拖拽目标自身
        const box = this.deps.getFootprint(id);
        if (box) entries.push({ id, box }); // null（不可见）天然排除
      }
      const candidates = collectSnapCandidates(entries, []);
      if (candidates.x.length > 0 || candidates.z.length > 0) {
        const boxes: FootprintBox[] = [];
        for (const id of this.targetIds) {
          const box = this.deps.getFootprint(id);
          if (box) boxes.push(box);
        }
        const base = unionFootprint(boxes);
        if (base) {
          this.snapCandidates = candidates;
          this.snapBaseBox = base;
          this.snapBaseProxy = { x: this.proxy.position.x, y: this.proxy.position.y, z: this.proxy.position.z };
        }
      }
    }

    // 高度候选层（高度吸附分项，T8.1）：地面 + 其余对象底/顶面层 + 拖拽底面基准
    if (this.deps.snapTiers?.elevationEnabled && this.deps.getElevationLevels && this.deps.getBaseLevel) {
      const levels = this.deps.getElevationLevels(this.targetIds);
      if (levels.length > 0) {
        let baseBottom: number | null = null;
        for (const id of this.targetIds) {
          const level = this.deps.getBaseLevel(id);
          if (level === null || !Number.isFinite(level)) continue;
          baseBottom = baseBottom === null ? level : Math.min(baseBottom, level); // 多选取最低底面
        }
        if (baseBottom !== null) {
          this.snapElevLevels = levels;
          this.snapBaseBottom = baseBottom;
          if (this.snapBaseBox === null) {
            this.snapBaseProxy = { x: this.proxy.position.x, y: this.proxy.position.y, z: this.proxy.position.z };
          }
        }
      }
    }
  }

  /**
   * 对象吸附修正（objectChange 内）：移动框 = 拖拽开始足迹并集 + 代理 XZ 位移，
   * 命中候选线（边对齐或中心线对齐，每轴 |Δ| ≤ threshold 最小者）时对 proxy.position
   * 施加平移增量并汇出参考线。TransformControls 每次移动从内部增量重算 position——
   * 修正不累积、幂等；参考线随命中/未命中整组替换（松手 clearSnapState 清除）。
   */
  private applyObjectSnap(): void {
    if (!this.snapCandidates || !this.snapBaseBox) return;
    const cfg = this.deps.objectSnap;
    if (!cfg?.enabled || !this.snapActive()) {
      this.deps.guides?.clear();
      return;
    }
    const dxTotal = this.proxy.position.x - this.snapBaseProxy.x;
    const dzTotal = this.proxy.position.z - this.snapBaseProxy.z;
    const moving: FootprintBox = {
      minX: this.snapBaseBox.minX + dxTotal,
      maxX: this.snapBaseBox.maxX + dxTotal,
      minZ: this.snapBaseBox.minZ + dzTotal,
      maxZ: this.snapBaseBox.maxZ + dzTotal,
    };
    const result = snapFootprintToCandidates(moving, this.snapCandidates, cfg.threshold);
    if (result) {
      this.proxy.position.x += result.dx;
      this.proxy.position.z += result.dz;
      this.deps.guides?.update(result.guides);
    } else {
      this.deps.guides?.clear();
    }
  }

  /**
   * 高度层吸附修正（objectChange 内，T8.1 R2）：移动底面 = 拖拽开始底面基准 + 代理 Y
   * 位移，命中候选层（|Δ| ≤ threshold 最近者）时对 proxy.position.y 施加增量。
   * 与 XZ 修正同款幂等模式（TransformControls 逐帧从内部增量重算 position.y）；
   * 容差复用 objectSnap.threshold。
   */
  private applyElevationSnap(): void {
    if (this.snapElevLevels === null || this.snapBaseBottom === null) return;
    if (!this.deps.snapTiers?.elevationEnabled || !this.snapActive()) return;
    const threshold = this.deps.objectSnap?.threshold;
    if (threshold === undefined) return;
    const dyTotal = this.proxy.position.y - this.snapBaseProxy.y;
    const movingBottom = this.snapBaseBottom + dyTotal;
    const delta = snapElevationDelta(movingBottom, this.snapElevLevels, threshold);
    if (delta !== null) {
      this.proxy.position.y += delta;
    }
  }

  /** 清空吸附快照态（拖拽结束/释放；参考线一并清除） */
  private clearSnapState(): void {
    this.snapCandidates = null;
    this.snapBaseBox = null;
    this.snapElevLevels = null;
    this.snapBaseBottom = null;
    this.deps.guides?.clear();
  }

  /**
   * 拖拽结束：同一手势一次性回调——单目标直接回调（before 缺失丢弃手势，原行为）；
   * 多目标对每个目标各触发一次 dragEndCb（N 次回调，after_i = D ∘ before_i）。
   */
  private finishDrag(): void {
    const beforeMap = this.beforeMap;
    const start = this.proxyStart;
    this.beforeMap = new Map();
    this.proxyStart = null;
    if (!this.dragEndCb || this.targetIds.length === 0) return;

    if (this.targetIds.length === 1) {
      const id = this.targetIds[0]!;
      const before = beforeMap.get(id);
      if (!before) return;
      this.dragEndCb({ objectId: id, before, after: objectPoseToTransform(this.proxy) });
      return;
    }
    if (!start) return;
    const delta = composeGroupDelta(start, objectPoseToTransform(this.proxy));
    for (const id of this.targetIds) {
      const before = beforeMap.get(id);
      if (!before) continue;
      this.dragEndCb({ objectId: id, before, after: applyGroupDelta(before, delta) });
    }
  }
}

/** Object3D 姿态 → 业务 Transform（纯值快照） */
export function objectPoseToTransform(o: THREE.Object3D): Transform {
  return {
    position: { x: o.position.x, y: o.position.y, z: o.position.z },
    rotation: { x: o.rotation.x, y: o.rotation.y, z: o.rotation.z },
    scale: { x: o.scale.x, y: o.scale.y, z: o.scale.z },
  };
}

/** 业务 Transform → Object3D 姿态（弧度 Euler，与 InstancedAssetPool 的应用语义一致） */
export function applyTransformToObject(o: THREE.Object3D, t: Transform): void {
  o.position.set(t.position.x, t.position.y, t.position.z);
  o.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z);
  o.scale.set(t.scale.x, t.scale.y, t.scale.z);
}

// ── 成组变换纯函数（T7.5；node 环境可测，Euler XYZ 与 Object3D 姿态语义一致）──

/** 业务 Transform → 矩阵（Euler XYZ → 四元数，与 Object3D.rotation 默认序一致） */
export function transformToMatrix(t: Transform): THREE.Matrix4 {
  const quaternion = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(t.rotation.x, t.rotation.y, t.rotation.z, 'XYZ'),
  );
  return new THREE.Matrix4().compose(
    new THREE.Vector3(t.position.x, t.position.y, t.position.z),
    quaternion,
    new THREE.Vector3(t.scale.x, t.scale.y, t.scale.z),
  );
}

/** 矩阵 → 业务 Transform（decompose；四元数 → Euler XYZ） */
export function matrixToTransform(m: THREE.Matrix4): Transform {
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  m.decompose(position, quaternion, scale);
  const euler = new THREE.Euler().setFromQuaternion(quaternion, 'XYZ');
  return {
    position: { x: position.x, y: position.y, z: position.z },
    rotation: { x: euler.x, y: euler.y, z: euler.z },
    scale: { x: scale.x, y: scale.y, z: scale.z },
  };
}

/** 手势增量矩阵 D = proxyFinal ∘ proxyStart⁻¹（proxyStart 为组枢轴初始姿态） */
export function composeGroupDelta(start: Transform, final: Transform): THREE.Matrix4 {
  return transformToMatrix(final).multiply(transformToMatrix(start).invert());
}

/** 增量应用：after = D ∘ before（平移/旋转/缩放绕组枢轴 = proxy 初始位置生效） */
export function applyGroupDelta(before: Transform, delta: THREE.Matrix4): Transform {
  return matrixToTransform(new THREE.Matrix4().multiplyMatrices(delta, transformToMatrix(before)));
}

/** 多目标组枢轴姿态：质心位置（transform.position 算术平均）+ 单位旋转 + 单位缩放 */
export function groupPivotTransform(targets: readonly Transform[]): Transform {
  const n = targets.length;
  const position = { x: 0, y: 0, z: 0 };
  for (const t of targets) {
    position.x += t.position.x / n;
    position.y += t.position.y / n;
    position.z += t.position.z / n;
  }
  return {
    position,
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };
}

// ── 对象吸附纯函数（T7.6；node 环境可测，零 THREE 依赖）──────

/** 吸附候选边集合（每轴独立收集） */
export interface SnapEdges {
  xs: number[];
  zs: number[];
}

/** 足迹并集（各维度极值；空输入 null） */
export function unionFootprint(boxes: readonly FootprintBox[]): FootprintBox | null {
  if (boxes.length === 0) return null;
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const box of boxes) {
    if (box.minX < minX) minX = box.minX;
    if (box.maxX > maxX) maxX = box.maxX;
    if (box.minZ < minZ) minZ = box.minZ;
    if (box.maxZ > maxZ) maxZ = box.maxZ;
  }
  return { minX, maxX, minZ, maxZ };
}

/** 候选边收集：每足迹贡献 minX/maxX/minZ/maxZ（排除集先行过滤） */
export function collectSnapEdges(
  entries: ReadonlyArray<{ id: ID; box: FootprintBox }>,
  excludeIds: readonly ID[],
): SnapEdges {
  const exclude = new Set(excludeIds);
  const xs: number[] = [];
  const zs: number[] = [];
  for (const entry of entries) {
    if (exclude.has(entry.id)) continue;
    xs.push(entry.box.minX, entry.box.maxX);
    zs.push(entry.box.minZ, entry.box.maxZ);
  }
  return { xs, zs };
}

/**
 * 每轴候选择优（纯函数）：移动框的 min/max 与候选边配对（4 组合/轴），取
 * |候选 − 边| 最小且 ≤ threshold 者施加平移增量（delta = 候选 − 边）；
 * 两轴独立，可单轴命中；无命中或修正为零（已对齐）→ null。
 * 阈值非法（≤0 / NaN）恒 null（防误吸）。
 */
export function snapFootprintDelta(
  moving: FootprintBox,
  edges: SnapEdges,
  threshold: number,
): { dx: number; dz: number } | null {
  if (!(threshold > 0) || !Number.isFinite(threshold)) return null;
  const snapAxis = (moveMin: number, moveMax: number, candidates: number[]): number | null => {
    let bestDist = threshold;
    let bestDelta: number | null = null;
    for (const candidate of candidates) {
      for (const edge of [moveMin, moveMax]) {
        const d = Math.abs(candidate - edge);
        if (d <= bestDist) {
          // ≤ 保证首见并列时保留先者（候选序确定性）
          bestDist = d;
          bestDelta = candidate - edge;
        }
      }
    }
    return bestDelta;
  };
  const dx = snapAxis(moving.minX, moving.maxX, edges.xs);
  const dz = snapAxis(moving.minZ, moving.maxZ, edges.zs);
  if (dx === null && dz === null) return null;
  const totalDx = dx ?? 0;
  const totalDz = dz ?? 0;
  if (totalDx === 0 && totalDz === 0) return null;
  return { dx: totalDx, dz: totalDz };
}

// ── 对齐候选 / 参考线 / 高度层纯函数（T8.1；node 环境可测，零 THREE 依赖）──

/**
 * 候选线收集（T8.1 R3，collectSnapEdges 的超集）：每足迹贡献每轴 2 条边 + 1 条中心线
 * 候选（含来源足迹沿参考线延伸轴的范围——X 轴候选带 Z 范围、Z 轴候选带 X 范围；
 * 排除集先行过滤）。中心线为 T8.1 新增维度（同排基线对齐）。
 */
export function collectSnapCandidates(
  entries: ReadonlyArray<{ id: ID; box: FootprintBox }>,
  excludeIds: readonly ID[],
): SnapCandidates {
  const exclude = new Set(excludeIds);
  const x: SnapCandidateLine[] = [];
  const z: SnapCandidateLine[] = [];
  for (const entry of entries) {
    if (exclude.has(entry.id)) continue;
    const { minX, maxX, minZ, maxZ } = entry.box;
    x.push(
      { axis: 'x', value: minX, from: minZ, to: maxZ, kind: 'edge' },
      { axis: 'x', value: maxX, from: minZ, to: maxZ, kind: 'edge' },
      { axis: 'x', value: (minX + maxX) / 2, from: minZ, to: maxZ, kind: 'center' },
    );
    z.push(
      { axis: 'z', value: minZ, from: minX, to: maxX, kind: 'edge' },
      { axis: 'z', value: maxZ, from: minX, to: maxX, kind: 'edge' },
      { axis: 'z', value: (minZ + maxZ) / 2, from: minX, to: maxX, kind: 'center' },
    );
  }
  return { x, z };
}

/** 择优吸附结果（含参考线；snapFootprintToCandidates 产出） */
export interface SnapCandidateResult {
  dx: number;
  dz: number;
  /** 命中轴的参考线（每轴至多一条） */
  guides: AlignGuide[];
}

/**
 * 每轴候选择优 + 参考线产出（纯函数，T8.1 R3；snapFootprintDelta 的超集）：
 * 移动框的 min/max/center 与候选线（边 + 中心）配对，取 |候选 − 参考| 最小且
 * ≤ threshold 者施加平移增量（delta = 候选 − 参考）并产出该轴参考线——端点 =
 * 移动框与来源框沿参考线延伸轴的范围并集。两轴独立，可单轴命中；恰对齐（d=0）
 * 也产出参考线（对齐反馈连续，不闪断）。无任何命中 → null；阈值非法（≤0/NaN）恒 null。
 */
export function snapFootprintToCandidates(
  moving: FootprintBox,
  candidates: SnapCandidates,
  threshold: number,
): SnapCandidateResult | null {
  if (!(threshold > 0) || !Number.isFinite(threshold)) return null;
  const pickAxis = (
    refs: ReadonlyArray<{ value: number }>,
    lines: readonly SnapCandidateLine[],
    otherMin: number,
    otherMax: number,
  ): { delta: number; guide: AlignGuide } | null => {
    let bestDist = threshold;
    let best: { delta: number; guide: AlignGuide } | null = null;
    for (const line of lines) {
      for (const ref of refs) {
        const d = Math.abs(line.value - ref.value);
        if (d < bestDist || (d <= bestDist && best === null)) {
          // < 保证并列时保留先见者（候选序确定性；首见即命中阈值边界 d=threshold）
          bestDist = d;
          best = {
            delta: line.value - ref.value,
            guide: {
              axis: line.axis,
              value: line.value,
              from: Math.min(line.from, otherMin),
              to: Math.max(line.to, otherMax),
              kind: line.kind,
            },
          };
        }
      }
    }
    return best;
  };
  const xRefs = [
    { value: moving.minX },
    { value: moving.maxX },
    { value: (moving.minX + moving.maxX) / 2 },
  ];
  const zRefs = [
    { value: moving.minZ },
    { value: moving.maxZ },
    { value: (moving.minZ + moving.maxZ) / 2 },
  ];
  const xHit = pickAxis(xRefs, candidates.x, moving.minZ, moving.maxZ);
  const zHit = pickAxis(zRefs, candidates.z, moving.minX, moving.maxX);
  if (!xHit && !zHit) return null;
  const guides: AlignGuide[] = [];
  if (xHit) guides.push(xHit.guide);
  if (zHit) guides.push(zHit.guide);
  return { dx: xHit?.delta ?? 0, dz: zHit?.delta ?? 0, guides };
}

/**
 * 高度层吸附择优（纯函数，T8.1 R2）：移动底面与候选层配对，取 |层 − 底面| 最小且
 * ≤ threshold 者返回增量（层 − 底面）；无命中 / 已在层上（零修正）/ 阈值非法 → null。
 */
export function snapElevationDelta(
  movingBottom: number,
  levels: readonly number[],
  threshold: number,
): number | null {
  if (!(threshold > 0) || !Number.isFinite(threshold)) return null;
  if (!Number.isFinite(movingBottom)) return null;
  let bestDist = threshold;
  let bestDelta: number | null = null;
  for (const level of levels) {
    if (!Number.isFinite(level)) continue;
    const d = Math.abs(level - movingBottom);
    if (d < bestDist || (d <= bestDist && bestDelta === null)) {
      // < 保证并列时保留先见候选（候选序确定性）；次句兜底首次恰命中阈值边界
      bestDist = d;
      bestDelta = level - movingBottom;
    }
  }
  if (bestDelta === null || bestDelta === 0) return null;
  return bestDelta;
}
