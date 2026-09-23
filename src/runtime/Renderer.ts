/**
 * runtime/Renderer —— 渲染总管（业务数据 → Three.js 场景的单向映射编排者）。
 *
 * 职责：
 *  1. 初始化 WebGL 上下文、场景、相机（OrbitControls）、默认环境
 *     （Sky 天空网格（T018.1）+ PMREM 环境光照 IBL（T018.2）+ 无限地面大平面 + 网格
 *     辅助线 + 平行光带阴影；初始化失败事务降级 legacy 渐变背景 + Hemi（T018.3））；
 *  2. 经 SceneSync 订阅 EventBus 的 object:* / layer:updated / scene:changed(clear)
 *     事件，驱动 attach / update / detach / 全量重建（事件→操作翻译在 SceneSync，纯逻辑可测）；
 *  3. 对象分派：region 经 RendererRegistry 取 ObjectAdapter（RegionRenderer，样式引擎
 *     纯函数路径）；ModelObject 经
 *     InstancedAssetPool 实例化渲染（同 assetId ≥2 合并为单个 InstancedMesh，单例退化
 *     普通 Mesh；业务层无感——T2.3），源几何/材质来自 AssetLoader 模板缓存；
 *  4. 图层状态应用：可见性（对象 visible ∧ 图层 visible）与透明度（材质基准 × 图层 opacity，
 *     基准值以 WeakMap<Material> 记忆，不污染 userData）；模型实例的可见性按实例
 *     编码进实例矩阵（零缩放：不渲染、不可拾取）；
 *  5. 对外提供 viewport / cameraController / preview 三个 Port 实现供 app 注入 editor 层。
 *  6. 视口运行态（T5.7；渲染模式 T6.4 改场景级 overrideMaterial 分遍）：渲染模式
 *     （environment.renderMode → RenderModeState 状态 + composeRenderPasses 分遍渲染）、
 *     左下角坐标轴指示器（AxesIndicator 第二视图，environment.axes.visible 开关）、
 *     右下角园区导航小地图（MinimapRenderer 第二视图，T7.7；开关经组合根注入）、
 *     1s 滑动窗口帧计数 + renderer.info 快照（getViewportStats）。
 *  7. 健壮性（StrictMode 双挂载 / 上下文故障防线）：
 *     - 渲染循环经 RenderLoop：帧异常兜底上报一次、连败熔断、绝不静默死亡；
 *     - 逐帧自检画布布局尺寸（ViewportResizePolicy）：循环活着就不停在错误宽高比上；
 *     - ContextLossWatchdog 监听 webglcontextlost/restored：丢失 console.error 一次
 *       （three 官方只 console.log 且 render() 静默空转），恢复后强制重设尺寸并立即重绘；
 *     - dispose 不强失共享上下文（双挂载下 A 的释放不得杀死 B）。
 *
 * 边界：只读 Scene 数据（SceneManager 仅 getObject/getObjects/getLayer），
 *      反向修改一律禁止；userData 只存 objectId；本类含 WebGL 初始化，不做 node 单测
 *      （逻辑层 SceneSync/适配器已拆出单测，视觉由 T1.9 GUI 验收兜底）。
 */
import type { ID, Transform } from '../core/types';
import type { EventBus } from '../core/events/EventBus';
import { isModelObject } from '../domain/assets';
import type { ModelObject } from '../domain/assets';
import { applyAssetVariants, shapeSlotOf, sourceKeyOf } from '../domain/assets';
import { BATCH_POLICY } from '../domain/lod/batchPolicy';
import type { RepresentationCapability } from '../domain/lod/representation';
import type { LodDistribution } from './lodDistribution';
import { LodDistributionCounter } from './lodDistribution';
import { BudgetAlert } from './budgetAlert';
import {
  baseLevelOf,
  collectElevationSnapLevels,
  isRegionObject,
  roadBandHalfWidth,
} from '../domain/regions';
import type { SceneEnvironment } from '../scene/SceneData';
import { coerceRenderMode, coerceSceneAxes, coerceSceneGrid } from '../scene/SceneData';
import type { ViewportRenderMode } from '../scene/SceneData';
import type { SceneObject } from '../scene/SceneObject';
import { GROUP_OBJECT_TYPE, isGroupObject } from '../scene/GroupObject';
import type { SceneManager } from '../scene/SceneManager';
import type { AssetRegistry } from '../registries/AssetRegistry';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AxesIndicator } from './AxesIndicator';
import { ContextLossWatchdog } from './ContextLossWatchdog';
import { MinimapRenderer } from './MinimapRenderer';
import { InstancedAssetPool } from './instancing/InstancedAssetPool';
import { hueOffsetToMultiplier } from './instancing/instanceTint';
import type { ObjectAdapter } from './ObjectAdapter';
import { RenderLoop } from './RenderLoop';
import { composeRenderPasses, DIAG_LAYER, ENV_LAYER, RenderModeState } from './RenderModeState';
import { SlidingFrameCounter } from './renderLoopStats';
import { RuntimeObjectMap } from './RuntimeObjectMap';
import { SceneSync } from './SceneSync';
import { ViewportResizePolicy } from './ViewportResizePolicy';
import { applySceneObjectState } from './renderers/objectState';
import { applyLayerOpacityToTree } from './renderers/layerState';
import { createDefaultRendererRegistry } from './renderers/RendererRegistry';
import type { RendererRegistry } from './renderers/RendererRegistry';
import { AssetLoader } from './loaders/AssetLoader';
import { AssetSourceRouter } from './loaders/AssetSourceRouter';
import { ProceduralSourceCache } from './procedural/ProceduralSourceCache';
import { ScatterChunkManager } from './scatter/ScatterChunkManager';
import { RegionScatterSync } from './scatter/RegionScatterSync';
import { CameraController } from './services/CameraController';
import { AlignGuides } from './services/AlignGuides';
import { MeasureOverlay } from './services/MeasureOverlay';
import { GizmoImpl } from './services/GizmoImpl';
import type { FootprintBox, GridSnapSource, ObjectSnapSource, SnapTiersSource } from './services/GizmoImpl';
import { PreviewManager } from './services/PreviewManager';
import { RuntimeViewport } from './services/RuntimeViewport';
import { TimeUniformService } from './services/TimeUniformService';
import { VertexEditImpl } from './services/VertexEditImpl';
import type { VertexSnapPipeline } from './services/VertexEditImpl';
import { RegionRenderer } from './renderers/RegionRenderer';
import type { SkyCore } from './environment/skyCore';
import type { PmremEnvironment } from './environment/pmremEnvironment';
import { environmentPresetOf } from './environment/environmentPresets';
import { createRendererPmremFactory, defaultSkyCoreFactory, setupSkyEnvironment } from './environment/environmentSetup';
import type { SkyRebakePort } from './environment/skyRebake';
import { SkyTuning } from './environment/skyTuning';
import type { SkyTuningPort } from './environment/skyTuning';
import {
  DAY_SUN_AZIMUTH_DEG,
  DAY_SUN_ELEVATION_DEG,
  LEGACY_SUN_DISTANCE,
  sunDirectionOf,
} from './environment/sunDirection';

/** Renderer 装配依赖（app 组合根注入；事件驱动同步与模型资产加载所需） */
export interface RendererDeps {
  eventBus: EventBus;
  sceneManager: SceneManager;
  /** 模型资产注册表（缺省则模型对象仅渲染占位，不加载文件） */
  assets?: AssetRegistry;
  /** 自定义渲染器注册表（缺省用默认注册表：region 渲染器） */
  rendererRegistry?: RendererRegistry;
  /** 初始环境（缺省白天预设） */
  environment?: SceneEnvironment;
  /**
   * 顶点编辑吸附管线（T6.8，组合根注入）：闭包 editor/tools/draw/snap 的
   * gridSnap/orthoLock 纯函数——runtime 不导入 editor（DAG），经注入复用同一函数。
   */
  vertexSnap?: VertexSnapPipeline;
  /**
   * 对象吸附共享配置（T7.6，组合根注入 editor 层 ObjectSnapConfig 同一可变对象；
   * 结构化消费，未注入不吸附）：gizmo translate 拖拽的边/面对齐。
   */
  objectSnap?: ObjectSnapSource;
  /**
   * 网格吸附共享配置（T7.6，组合根注入 editor 层 DrawGridConfig 同一可变对象）：
   * gizmo translate 经 controls.setTranslationSnap 接入（tool.snap 开关同时管辖绘制）。
   */
  gridSnap?: GridSnapSource;
  /**
   * 吸附分级共享配置（T8.1，组合根注入 editor 层 SnapTiersConfig 同一可变对象；
   * 结构化消费，未注入视为总开关开、角度/高度分项关——T7.6 行为零回归）：
   * 总开关 + gizmo rotate 角度步进 + translate Y 高度层吸附。
   */
  snapTiers?: SnapTiersSource;
}

/**
 * 环境预设参数面：T018.3 起收口至 environment/environmentPresets（大气/云/太阳/IBL
 * 预设差异化 + ground/grid + legacy fallback 专用键，单一真相源）——本文件零预设数值，
 * 经 environmentPresetOf(env.preset) 查表（未知预设回退 day）。
 */

/** 地面规模（米）：大平面 + 网格（“无限”观感，一期望远裁剪内） */
const GROUND_SIZE = 2000;
const GRID_DIVISIONS = 400; // 环境未配置 grid 键时的分度：2000m/400 = 5m 格（与 DEFAULT_SCENE_GRID.spacing 统一）
/** 网格距离淡出区间（米）：近处清晰，200m 起渐隐，1000m 完全消失。
 *  只注入网格自身的线材质（禁用全局 scene.fog——focusAll 会拉到千米级取景距离，全局雾会把整个场景雾没） */
const GRID_FADE_START = 200;
const GRID_FADE_END = 1000;

/**
 * 构造网格辅助线（半透明、微抬升防 z-fighting；样式与既有网格一致）。
 * 深度冲突双保险：y 抬升 + polygonOffset 负偏置（把线的深度拉向相机一侧）；
 * 透明线不写深度（depthWrite=false），不遮挡其上方的业务对象。
 * onBeforeCompile 向本材质注入「按相机距离衰减 alpha」——远处亚像素网格线渐隐，
 * 消除相机运动时的混叠抖动（仅作用于网格材质实例，预览线等其它线材质不受影响）。
 */
function makeGridHelper(size: number, divisions: number, major: number, minor: number): THREE.GridHelper {
  const gridHelper = new THREE.GridHelper(size, divisions, major, minor);
  const material = gridHelper.material as THREE.LineBasicMaterial;
  material.transparent = true;
  material.opacity = 0.45;
  material.depthWrite = false; // 透明线不写深度：不遮挡业务对象；与地面的深度冲突由 polygonOffset 兜底
  material.polygonOffset = true;
  material.polygonOffsetFactor = -1;
  material.polygonOffsetUnits = -1;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.gridFadeStart = { value: GRID_FADE_START };
    shader.uniforms.gridFadeEnd = { value: GRID_FADE_END };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vCamDist;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\n\tvCamDist = distance((modelMatrix * vec4(position, 1.0)).xyz, cameraPosition);',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying float vCamDist;\nuniform float gridFadeStart;\nuniform float gridFadeEnd;',
      )
      .replace(
        '#include <fog_fragment>',
        // fog_fragment 锚点在 opaque 输出之前：对 diffuseColor.a 做距离衰减即作用于最终透明度
        '\tdiffuseColor.a *= 1.0 - smoothstep(gridFadeStart, gridFadeEnd, vCamDist);\n\t#include <fog_fragment>',
      );
  };
  // 高于地面防 z-fighting（0.002→0.02：配合 near=1 的深度精度抬到稳定间距，另有 polygonOffset 兜底），
  // 低于贴地表层（road 0.06 起，数值源 = domain semanticDefinitions.defaultBaseHeight）
  gridHelper.position.y = 0.02;
  return gridHelper;
}

/**
 * 构造地面材质（T9.2 贴地共面 z-fighting 消除双保险的地面侧，纯构造可单测）。
 * 深度冲突双保险 = 模型底面微抬（domain/assets MODEL_BASE_HEIGHT，主方案）+
 * 本 polygonOffset 正偏置（兜底手动 y=0 输入的精确共面）：正 factor/units 把地面
 * 深度推离相机一侧，共面平局时地面稳定败给模型面——网格线 -1/-1（拉向相机）先例
 * 的镜像补位。取值 1/1 为 OpenGL 红皮书共面消冲突推荐量级：units 提供最小可分辨
 * 深度的常量分离、factor 覆盖共面多边形坡度差；贴地表层（0.06+）几何间距远大于
 * 1-2 个深度量子，远景关系无可见劣化。诊断档核验（T8.4 分遍）：地面在 ENV_LAYER
 * 由环境遍渲染，override 仅作用于内容遍（composeRenderPasses 环境遍 token='none'），
 * 地面材质（含本偏置）在任何渲染档位下不被替换，无需向 override 池补偏置。
 * receiveShadow 兼容：偏置只影响本材质深度写入，地面不投影（castShadow=false），
 * 阴影接收走光照采样与深度测试无关。
 */
export function makeGroundMaterial(color: THREE.ColorRepresentation): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.95,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
}

/**
 * 非渲染对象类型（T8.5）：纯组织节点（group 组壳）不产 RuntimeObject、不参与拾取/
 * 渲染/变换——attach 静默跳过（区别于未注册类型的 console.warn：那是接线错误信号，
 * group 是合法数据形态）。小地图 / 对象吸附等派生视图经各自守卫天然跳过。
 */
const NON_RENDERABLE_TYPES = new Set<string>([GROUP_OBJECT_TYPE]);

export class Renderer {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;
  /** 业务对象容器（拾取根；预览/环境不在此内） */
  readonly contentGroup = new THREE.Group();
  readonly map = new RuntimeObjectMap();

  readonly viewport: RuntimeViewport;
  readonly cameraController: CameraController;
  readonly preview: PreviewManager;
  /** 变换 Gizmo（GizmoPort 运行时实现，T2.4；app 组合根注入 TransformTool） */
  readonly gizmo: GizmoImpl;
  /** 顶点编辑句柄层（VertexEditPort 运行时实现，T6.8；app 组合根注入 VertexEditTool） */
  readonly vertexEdit: VertexEditImpl;
  /** 拖拽对齐参考线（T8.1 R3；AUX_LAYER 恒驻组，GizmoImpl 命中时驱动） */
  readonly alignGuides: AlignGuides;
  /** 测量覆盖层（T10.1；MeasurePort 运行时实现——AUX_LAYER 恒驻组，测量工具驱动） */
  readonly measureOverlay: MeasureOverlay;

  private readonly deps: RendererDeps;
  private readonly rendererRegistry: RendererRegistry;
  private readonly assetLoader: AssetLoader | null;
  /** 程序化源缓存（T002.3；会话私有，与 AssetLoader 同生命周期——绝不模块级单例，D17） */
  private readonly proceduralCache: ProceduralSourceCache | null;
  /** 复合源路由（T002.3）：kind 分派 GLB loader / 程序化缓存；池与 Ghost 的同源入口 */
  private readonly assetRouter: AssetSourceRouter | null;
  /** 重复资产实例化渲染池（同 assetId ≥2 → 单个 InstancedMesh；单例退化普通 Mesh） */
  private readonly instancedPool: InstancedAssetPool | null;
  /**
   * 散布分块实例化管线（T003.2，D9）：源（散布区域）→ 块 → 每 (源×块×资产) 一个
   * InstancedMesh；逐块视锥剔除（renderFrame 调 frame）。散布实例是管线内部派生数据
   * （D5）：root 挂 scene（contentGroup 兄弟）不参与拾取/大纲/撤销栈。源几何/材质与
   * 池同路由共享，本管绝不 dispose 模板。003.3 前无业务接线（DEV 冒烟面在 app 组合根）。
   */
  readonly scatter: ScatterChunkManager | null;
  /**
   * region ↔ 散布管线绑定（T003.3）：把「区域样式携带散布配方」路由到 scatter 的
   * setSource/recomputeChunks/removeSource/源级显隐。事件仍经 SceneSync 翻译，本 Renderer
   * 在 attach/update/detach/resyncAll/onLayerUpdated 钩子里顺带喂它（散布是横切关注点，
   * 不改 RegionRenderer）。会话私有，随 dispose 链先于 scatter 拆除（D17）。
   */
  private readonly scatterSync: RegionScatterSync | null;
  private readonly sync: SceneSync;
  /** 环境对象组（切换预设时整组重建） */
  private readonly envGroup = new THREE.Group();
  /**
   * 天空核心（T018.1，D29.12）：displaySky/bakeSky 双实例 + 共享参数状态——displaySky
   * 挂 envGroup 随 ENV_LAYER 分遍显示（相机中心跟随见 renderFrame）；bakeSky 仅存
   * bakeScene（PMREM 烘焙由下方 pmrem 消费，T018.2）。T018.3 起随 setupSkyEnvironment
   * 事务构建创建（新路径失败时本字段保持 null——legacy 分支无 sky），clearEnvironment 释放。
   */
  private sky: SkyCore | null = null;
  /**
   * PMREM / IBL 环境贴图（T018.2）：bakeScene → PMREMGenerator.fromScene →
   * scene.environment 的事务管理者（新 RT 就绪 → 替换 → 旧 RT 释放 + owned/retired
   * 记账，见 environment/pmremEnvironment）。setupSkyEnvironment 构建并初烘一次、
   * SkyCore 三写入口回调重烘（失败保留旧环境，T018.3 catch 在构建单元内）、
   * clearEnvironment 释放 RT + 惰性 PMREMGenerator + scene.environment 摘除。
   * **严禁进帧路径**（结构断言锁定 renderFrame 零 PMREM 调用）；legacy 分支本字段 null。
   */
  private pmrem: PmremEnvironment | null = null;
  /**
   * 重烘 debounce 句柄（T018.4，D29 Q6）：setupSkyEnvironment sky 模式结果带出——
   * 三写入口回调（environmentSetup 内包 debounce）与 setIblIntensity 借道的触发面、
   * rebake() flush 强制入口；clearEnvironment **显式取消 pending**（不跨环境触发——
   * 旧 pmrem 已 dispose 时 bake 短路技术上安全，显式取消是确定性记档口径）后置空。
   */
  private skyRebake: SkyRebakePort | null = null;
  /**
   * 环境调参端口（T018.4，environment/skyTuning）：sky 模式经 applyEnvironment 装配
   * （SkyCore 写入口代理 + 太阳角三一致封装 + IBL 强度刷新路径 + 强制重烘 + 只读
   * params/pmremStats）；**legacy/fallback 模式恒 null**（单一开关不变式 D29.5——
   * fallback 态无 DEV 调参）。消费面：app 组合根 __sky DEV 守卫（018.5 终调工作台，
   * 经 skyTuning getter 结构代理）；会话态不进任何持久化（预设切换整组重建即重置）。
   */
  private skyTuningPort: SkyTuning | null = null;
  /**
   * 太阳直射灯（T018.4 从 applyEnvironment 局部变量提升为字段）：调参端口 setSunAngles
   * 三一致封装的灯位侧（sunDirection × LEGACY_SUN_DISTANCE——封装内聚在 Renderer 侧
   * 端口，不散到 DEV 守卫）。释放链不变：灯仍挂 envGroup 经 disposeEnvironmentObjectTree
   * 释放，本字段在 clearEnvironment 只去引用；sky/legacy 两分支均存在。
   */
  private sunLight: THREE.DirectionalLight | null = null;
  /** id → 该对象当前使用的要素适配器（dispose 分派）；模型对象不入此表 */
  private readonly attachedAdapters = new Map<ID, ObjectAdapter>();
  /** 模型对象 id 集合（克隆共享模板资源，detach 时只移除不 dispose） */
  private readonly modelIds = new Set<ID>();
  /** 模型实例填充令牌（防异步竞态） */
  private readonly modelTokens = new Map<ID, number>();
  /** 材质基准透明度记忆（图层透明度乘算的还原依据；不写入 userData） */
  private readonly baseOpacity = new WeakMap<THREE.Material, number>();
  /** 宿主画布（逐帧自检布局尺寸 / 上下文事件监听目标） */
  private readonly canvas: HTMLCanvasElement;
  /** 渲染循环（帧异常兜底 + 连败熔断；见 RenderLoop） */
  private readonly loop: RenderLoop;
  /** 视口尺寸重设判定（RO 回调与逐帧自检共用的幂等源） */
  private readonly sizePolicy = new ViewportResizePolicy();
  /** WebGL 上下文丢失看门狗（丢失上报 + 恢复回调） */
  private readonly contextWatchdog: ContextLossWatchdog;
  /** 1s 滑动窗口帧计数（getViewportStats().fps 数据源；每帧成功渲染后 tick） */
  private readonly frameStats = new SlidingFrameCounter();
  /** 视口渲染模式状态（environment.renderMode 驱动；T6.4 场景级 overrideMaterial 分遍；
   *  T8.4 诊断档：clay/normals 沿三遍分遍换 override，islands 四遍 + 一次性对象换层） */
  private readonly renderModes = new RenderModeState();
  /**
   * islands 诊断分组激活态（T8.4）：true = 未归类对象（layerId === null）已移入
   * DIAG_LAYER。进入/退出经 applyRenderModeChange 一次性遍历（不进帧路径）；
   * 激活期间对象增删/换层经 attach/update 钩子与 scene:changed(removeLayer) 订阅增量维护。
   */
  private islandsActive = false;
  /** islands 分类谓词（活闭包：live 读 SceneManager——attach 即自动落正确侧） */
  private readonly isClassified = (id: ID): boolean => {
    const obj = this.deps.sceneManager.getObject(id);
    return obj !== undefined && obj.layerId !== null;
  };
  /** removeLayer 静默置空成员 layerId（无逐对象事件）→ islands 全量重算的订阅退订句柄 */
  private readonly offIslandsLayerRemoval: () => void;
  /** 左下角坐标轴指示器（第二视图：独立小上下文；environment.axes.visible 驱动开关） */
  private readonly axesIndicator: AxesIndicator;

  /**
   * 全局 uTime 时钟（D19.7 / D12 最小版拉前，T008.1）：每帧一次累计 + 广播，
   * 材质 uniforms 声明 uTime 即自动驱动；无 GPU 资源，随本实例会话存亡（无需 dispose）。
   */
  readonly uTime = new TimeUniformService();
  /**
   * 右下角园区导航小地图（T7.7 第二视图：独立小上下文 + 派生俯视轮廓 scene）。
   * 导航回调（拖拽/点击 → panTargetTo）由 app 组合根经 setNavigate 接线；
   * 显示开关经组合根 EditorHandle.setMinimapVisible（workspaceStore.minimapVisible）。
   */
  readonly minimap: MinimapRenderer;
  /**
   * LOD 总开关（T006.3，D27.13）：true = 选档调度开（散布块粒度 + 放置逐对象，
   * 评估器语义见 domain/lod）；false = 全 High + culled 旁路（回退对比与兜底）。
   * **渲染派生状态**：不进 Scene、不进 Command、不缓存进持久状态——由本渲染器持有、
   * 每帧经 frame/frameLod 透传给两条渲染链（连续渲染下一帧生效）。入口最小面 =
   * setLodEnabled API + app 组合根 URL query（?lod=0/off）。
   */
  private lodEnabled = true;
  /**
   * draw call 预算告警（T006.4）：每帧 render 后喂 renderer.info.render.calls，超
   * BATCH_POLICY.drawCallBudget 且过节流间隔告警一次（console 日志侧；状态栏 UI 不在
   * 本任务）。纯观测面——不做运行时降级（降级手段归档位策略，006.5 验收门裁定）。
   */
  private readonly budgetAlert = new BudgetAlert();
  private disposed = false;

  constructor(canvas: HTMLCanvasElement, deps: RendererDeps) {
    this.deps = deps;
    this.canvas = canvas;

    // ── WebGL / 场景 / 相机 / 控制 ────────────────────────
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio ?? 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    // r186 已移除 PCFSoftShadowMap（传入只会告警并静默降级 PCF）——显式用实际生效的 PCF，消除控制台告警
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.scene = new THREE.Scene();
    // 深度参数：near 0.1→1、far 4000→10000。near/far 从 40000:1 收敛到 10000:1，
    // 24 位深度缓冲在百米视距的精度由毫米级恢复到厘米级——地面(0)/网格/贴地表层
    // （厘米级间距）不再因深度误差小于几何间距而整片条纹 z-fighting；far 提升同时
    // 容纳 focusAll 对千米级场景的取景距离（包围球 + 双视场角适配可达 ~5000m+）。
    // aspect 以画布当前布局尺寸初始化（未布局/零尺寸回退 1，布局稳定后逐帧尺寸自检纠正）。
    const initialAspect = (canvas.clientWidth || 1) / (canvas.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(50, initialAspect, 1, 10000);
    this.camera.position.set(60, 50, 80);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.set(0, 0, 0);
    this.controls.maxPolarAngle = Math.PI / 2 - 0.001; // 不钻到地面以下
    this.controls.minDistance = 2; // 推近下限兜底：near=1 后防止物体/目标越过近裁剪面被裁
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    // 手势重映射（T5.8，UE/Unity 行业惯例）：左键=null（点选/框选/绘制确认归工具层，
    // OrbitControls 对 null 动作落 default→state=NONE，不消费事件）；右拖=旋转、中拖=平移
    //（修饰键对偶保持：右拖+Shift=平移、中拖+Shift=旋转，OrbitControls 内建）；
    // 滚轮=缩放（enableZoom 缺省开）。单指触摸=null（选择语义优先），双指=旋转+缩放。
    // 右键点按（<4px 无拖拽）的上下文菜单分类在 app/input（classifyRightButton）。
    this.controls.mouseButtons = {
      LEFT: null,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    this.controls.touches = { ONE: null, TWO: THREE.TOUCH.DOLLY_ROTATE };

    // 坐标轴指示器（先于 applyEnvironment 创建：环境通道 axes.visible 在其中消费）；
    // 宿主 = 主画布容器（canvas 未挂 DOM 时 parentElement 为 null → 无头形态）
    this.axesIndicator = new AxesIndicator(canvas.parentElement);

    this.scene.add(this.envGroup);
    this.scene.add(this.contentGroup);
    this.applyEnvironment(deps.environment ?? { preset: 'day' });

    // ── 分派与 Port 实现 ──────────────────────────────────
    this.rendererRegistry = deps.rendererRegistry ?? createDefaultRendererRegistry();
    this.assetLoader = deps.assets ? new AssetLoader(deps.assets) : null;
    // T002.3 复合源接入：程序化源缓存（会话私有，随 dispose 链释放）+ kind 分派路由。
    // 池的 provideSource 与 Ghost 源此前直连 AssetLoader（程序化 id 会 reject / Ghost
    // 停留占位盒），现统一改接路由——GLB 路径经路由透传 loader，行为不变。
    const assets = deps.assets;
    this.proceduralCache = assets ? new ProceduralSourceCache() : null;
    this.assetRouter =
      this.assetLoader && this.proceduralCache && assets
        ? new AssetSourceRouter({
            assets,
            loader: this.assetLoader,
            procedural: this.proceduralCache,
          })
        : null;
    // 模型对象改走实例化池（业务层无感：仍逐个 ModelObject attach，
    // 池内同池键 ≥2 合并为一个 InstancedMesh；无资产注册表时保留占位 Group 路径）。
    // T008.1（D19.4）：池键 = sourceKey——查注册表 meta，procedural 且声明 shapeFamily
    // 时按对象 seed 槽路由（seed 缺省按 0，与 ProceduralSourceCache 路由同一约定），
    // 与源缓存共用 domain/assets/shapeFamily 单一真相源；GLB/未声明资产回退 assetId。
    const assetRouter = this.assetRouter;
    // T006.3：源请求携带 level（缓存 sourceKey::level 档位维度）；已声明表示能力查询与
    // 池键路由同源（注册表 meta 单一真相源——T021.2 起选档输入 = 表示能力驱动：
    // representations 声明优先、levels 派生回退，effectiveRepresentationChain 在两链
    // 消费侧按资产缓存有效链；levels 声明缺省 = 单档 high 语义）
    const representationCapabilityOf = (assetId: string): RepresentationCapability | undefined => {
      const descriptor = assets?.get(assetId);
      if (!descriptor || descriptor.kind !== 'procedural') return undefined;
      const meta = descriptor.asset;
      return {
        representations: meta.representations,
        levels:
          meta.levels && meta.levels.length > 0 ? meta.levels.map((item) => item.id) : undefined,
      };
    };
    this.instancedPool = assetRouter
      ? new InstancedAssetPool({
          provideSource: (assetId, seed, level) =>
            assetRouter.provideInstanceSource(assetId, { seed, level }),
          resolvePoolKey: (assetId, seed) => {
            const descriptor = assets?.get(assetId);
            if (!descriptor || descriptor.kind !== 'procedural') return assetId;
            const family = descriptor.asset.shapeFamily;
            return family ? sourceKeyOf(assetId, shapeSlotOf(seed ?? 0, family.size)) : assetId;
          },
          getRepresentationCapability: representationCapabilityOf,
        })
      : null;
    if (this.instancedPool) this.contentGroup.add(this.instancedPool.root);
    // 散布分块管线（T003.2）：同源路由注入（几何/材质与池共享）；variants 查询走资产
    // 注册表的程序化 meta（hueJitter>0 → 逐实例色相微差，同 T002.3 语义只吃色相）。
    // root 挂 scene 而非 contentGroup——RuntimeViewport 拾取根只含 contentGroup.children，
    // 散布实例天然不参与拾取（映射回区域是 003.3 的事）。会话私有，随 dispose 链拆除。
    this.scatter = assetRouter
      ? new ScatterChunkManager({
          provideSource: (assetId, level) =>
            assetRouter.provideInstanceSource(assetId, { level }),
          getAssetVariants: (assetId) => {
            const descriptor = assets!.get(assetId);
            return descriptor && descriptor.kind === 'procedural' ? descriptor.asset.variants : undefined;
          },
          getRepresentationCapability: representationCapabilityOf,
          // T006.4 块自适应合并（生产开）：粗档稀疏 (块×资产) 并入超块合并桶——防
          // 「块×资产×档」批次爆炸（006.3 记档：散布 400m drawCalls 峰值 393）
          sparseMerge: {
            maxInstancesPerChunk: BATCH_POLICY.sparseMergeMaxInstances,
            groupFactor: BATCH_POLICY.mergeGroupFactor,
          },
        })
      : null;
    if (this.scatter) this.scene.add(this.scatter.root);
    // T003.3：region 散布绑定（assetRouter 存在 ⇔ scatter 存在；无资产注册表时无散布）。
    // effectiveVisible 注入复用本类实现（对象 ∧ 图层合成，单一真相源）。
    this.scatterSync = this.scatter
      ? new RegionScatterSync({
          manager: this.scatter,
          sceneManager: deps.sceneManager,
          effectiveVisible: (obj) => this.effectiveVisible(obj),
        })
      : null;

    this.viewport = new RuntimeViewport(
      canvas,
      this.camera,
      this.contentGroup,
      this.map,
      // InstancedMesh 命中携带 instanceId → 池内槽位反查业务 id（实例化路径无逐对象根）
      (hit) => this.instancedPool?.resolvePick(hit) ?? null,
      // T003.3（D18.7）：散布实例纳入拾取——命中映射回源 id（regionId）走既有区域选中链路
      this.scatter
        ? { root: this.scatter.root, resolvePick: (hit) => this.scatter!.resolvePick(hit) }
        : undefined,
    );
    this.cameraController = new CameraController(this.camera, this.controls, this.map);
    // 园区导航小地图（T7.7）：宿主与轴指示器同源（主画布容器 = .ed-viewport）；
    // 独立小上下文渲染派生轮廓 + 视野 overlay，主 renderer.info 口径不受污染
    this.minimap = new MinimapRenderer(canvas.parentElement, {
      eventBus: deps.eventBus,
      sceneManager: deps.sceneManager,
    });
    this.preview = new PreviewManager(this.scene, this.assetRouter);
    // 对齐参考线（T8.1 R3）：恒驻辅助组（拖拽会话期间 visible、松手即逝、不产对象）
    this.alignGuides = new AlignGuides(this.scene);
    // 测量覆盖层（T10.1）：恒驻辅助组（草稿/已提交项，MeasurePort 实现端；
    // 提交层刷新由组合根订阅 measure:changed 驱动，工具草稿经 updateDraft 直推）
    this.measureOverlay = new MeasureOverlay(this.scene);
    // 变换 Gizmo（TransformControls）：拖拽中间变换直接写渲染对象（预览隔离），
    // 结束时一次性 before/after 回调（getTransform 只读场景数据；applyPreview 分派
    // 要素根直写 / 实例池矩阵更新——锚点不在渲染树，须走池 update 所见即所得）。
    // T7.6 吸附注入：objectSnap / gridSnap 为组合根共享可变对象（设置面板即时生效）；
    // T8.1：snapTiers（总开关/角度/高度）+ getElevationLevels/getBaseLevel（高度候选，
    // 经 domain 纯函数从 SceneData 派生——region baseHeight/语义参数、model posY，
    // 不做 GLB 包围盒测量）+ guides（参考线呈现）+ getFootprint/getObjectIds
    // （对象吸附候选与移动框计算，sceneManager 只读）。
    this.gizmo = new GizmoImpl({
      camera: this.camera,
      domElement: canvas,
      scene: this.scene,
      orbit: this.controls,
      // T8.5：组壳无 RuntimeObject（纯组织节点），返回 null 令 GizmoImpl.attach 剔除——
      // 选中集仅含组壳时不挂 gizmo（组不传变换），混合选中时沿多选语义只挂成员
      getTransform: (id) => {
        const obj = this.deps.sceneManager.getObject(id);
        return obj !== undefined && !isGroupObject(obj) ? obj.transform : null;
      },
      applyPreview: (id, t) => this.applyGizmoPreview(id, t),
      objectSnap: deps.objectSnap ?? null,
      gridSnap: deps.gridSnap ?? null,
      snapTiers: deps.snapTiers ?? null,
      getFootprint: (id) => this.getObjectFootprint(id),
      getObjectIds: () => this.deps.sceneManager.getObjects().map((o) => o.id),
      getElevationLevels: (excludeIds) =>
        collectElevationSnapLevels(
          // T9.2：拖拽目标全为模型时候选层含 MODEL_BASE_HEIGHT（承托面 + lift），
          // 其余（region / 混合选中）保持裸值——region 精确贴附语义不变
          this.deps.sceneManager.getObjects().filter((o) => this.effectiveVisible(o)),
          excludeIds,
        ),
      getBaseLevel: (id) => {
        const obj = this.deps.sceneManager.getObject(id);
        return obj ? baseLevelOf(obj) : null;
      },
      guides: this.alignGuides,
    });
    // 顶点编辑句柄层（T6.8）：拖拽预览经 RegionRenderer.applyShapePreview 几何重绑
    // （材质不动），会话结束经 update(id, ['shape']) 按场景数据权威恢复
    this.vertexEdit = new VertexEditImpl({
      camera: this.camera,
      domElement: canvas,
      scene: this.scene,
      orbit: this.controls,
      eventBus: deps.eventBus,
      snap: deps.vertexSnap,
      getRegion: (id) => {
        const root = this.map.get(id);
        const obj = this.deps.sceneManager.getObject(id);
        return root && obj && isRegionObject(obj) ? { root, region: obj } : null;
      },
      previewShape: (id, working) => this.previewRegionShape(id, working),
      restoreShape: (id) => this.update(id, ['shape']),
    });

    // ── 上下文看门狗 + 渲染循环 ──────────────────────────
    // 恢复瞬间 three 会自动重建 GL 状态（重编程序 / 重传纹理）；这里补一次强制全量
    // 尺寸重设并立即重绘，确保恢复后首帧就是正确比例（而非清屏后的空白）。
    this.contextWatchdog = new ContextLossWatchdog({
      target: canvas,
      onRestored: () => {
        this.sizePolicy.reset();
        this.renderFrame();
      },
    });
    this.contextWatchdog.attach();
    this.loop = new RenderLoop({ frame: () => this.renderFrame() });

    // ── 事件驱动同步（attach/update/detach 回调实现）──────
    this.sync = new SceneSync(deps.eventBus, deps.sceneManager, {
      attach: (obj) => this.attach(obj),
      update: (id, keys) => this.update(id, keys),
      detach: (id) => this.detach(id),
      resyncAll: () => this.resyncAll(),
      onLayerUpdated: (layerId) => this.applyLayerToMembers(layerId),
    });
    this.sync.start();
    // islands 分组的静默换层兜底（T8.4）：SceneManager.removeLayer 把成员 layerId 置 null
    // 但不逐对象发事件——激活期间删层会整体改变归类，须全量重算分组（一次性，不进帧路径）
    this.offIslandsLayerRemoval = deps.eventBus.on('scene:changed', (p) => {
      if (this.islandsActive && p.source === 'removeLayer') this.refreshIslandsGrouping();
    });
  }

  // ── 对象同步（SceneSync 回调 / 外部直调）──────────────

  /** 创建并挂载运行时对象（幂等：已存在则按全量刷新处理） */
  attach(obj: SceneObject): void {
    if (this.disposed) return;
    if (this.map.has(obj.id)) {
      this.update(obj.id);
      return;
    }
    if (NON_RENDERABLE_TYPES.has(obj.type)) return; // T8.5：纯组织节点静默跳过（无 RuntimeObject，不刷告警）
    if (isModelObject(obj)) {
      this.attachModel(obj);
      this.applyIslandsLayer(obj.id); // islands 激活：新对象落正确侧（池内分组由池 reconcile 自理）
      return;
    }
    const adapter = this.rendererRegistry.get(obj.type);
    if (!adapter) {
      console.warn(`[Renderer] 未注册渲染器的要素类型，跳过: ${obj.type}（${obj.id}）`);
      return;
    }
    const root = adapter.create(obj);
    this.map.set(obj.id, root);
    this.attachedAdapters.set(obj.id, adapter);
    this.contentGroup.add(root);
    this.applyLayerState(obj, root);
    this.applyIslandsLayer(obj.id); // islands 激活：未归类对象整树移入 DIAG_LAYER
    this.scatterSync?.attach(obj); // T003.3：region → 散布源（非 region / 无配方内部 no-op）
    // 渲染模式为场景级 overrideMaterial（T6.4/T8.4）：新挂载对象零材质处理，下一帧自然被覆盖
  }

  /** 按变更字段增量同步（keys 缺省为全量刷新） */
  update(id: ID, keys?: string[]): void {
    if (this.disposed) return;
    const root = this.map.get(id);
    if (!root) return;
    const obj = this.deps.sceneManager.getObject(id);
    if (!obj) return;
    // T003.3：region 散布从宽重算（任何 keys 都重算生效参数+baseY+可见性，幂等短路零误伤）
    this.scatterSync?.update(id);

    // islands 分组增量维护（T8.4）：换层（object:updated keys 含 layerId）或全量刷新时
    // 重算该对象的诊断侧（幂等；实例池经活谓词 + refreshDiagnostic 精确迁移）
    if (this.islandsActive && (keys === undefined || keys.includes('layerId'))) {
      this.applyIslandsLayer(id);
      this.instancedPool?.refreshDiagnostic(id);
    }

    if (this.modelIds.has(id)) {
      // modelIds 成员在 attach 时已通过 isModelObject 结构判别
      if (this.instancedPool) {
        if (keys !== undefined && !keys.includes('asset')) {
          // 增量：锚点同步 + 只写对应矩阵槽
          applySceneObjectState(root, obj);
          this.instancedPool.update(id, obj.transform, this.effectiveVisible(obj));
        } else {
          // 全量 / 换资产：经池重挂（幂等；跨 assetId 时池内自动迁移）
          this.map.set(obj.id, this.poolAttach(this.instancedPool, obj as ModelObject));
        }
      } else {
        applySceneObjectState(root, obj);
        if (keys === undefined || keys.includes('asset')) {
          this.fillModelInstance(id, root, obj as ModelObject);
        }
      }
      this.applyLayerState(obj, this.map.get(id) ?? root);
      return;
    }
    const adapter = this.attachedAdapters.get(id) ?? this.rendererRegistry.get(obj.type);
    if (!adapter) return;
    adapter.update(root, obj, keys);
    this.applyLayerState(obj, root);
    // 渲染模式为场景级 overrideMaterial（T6.4）：增量更新零模式重应用（样式重建不再需要）
  }

  /** 卸载并释放运行时对象 */
  detach(id: ID): void {
    const root = this.map.delete(id);
    if (!root) return;
    this.scatterSync?.detach(id); // T003.3：region → 摘散布源（幂等；非 region 内部 no-op）
    root.removeFromParent();
    this.instancedPool?.detach(id);
    if (this.modelIds.delete(id)) {
      this.modelTokens.delete(id);
      return; // 克隆共享模板资源：只移除，不 dispose
    }
    const adapter = this.attachedAdapters.get(id);
    this.attachedAdapters.delete(id);
    if (adapter) {
      adapter.dispose(root);
    } else {
      disposeObjectTree(root); // 无适配器记录时的兜底（专属资源语义）
    }
  }

  /** 全量重同步：卸载全部现存，再按场景当前数据重建 */
  resyncAll(): void {
    this.scatterSync?.resyncAll(); // T003.3：清孤儿散布源（clear 不逐对象发事件的兜底；存活源由下方钩子序列驱动）
    for (const id of this.map.ids()) this.detach(id);
    for (const obj of this.deps.sceneManager.getObjects()) this.attach(obj);
  }

  /** 按外部提供的 SceneData 全量同步（对象直取 data，图层/环境一并应用） */
  syncAll(sceneData: {
    objects: SceneObject[];
    environment?: SceneEnvironment;
  }): void {
    for (const id of this.map.ids()) this.detach(id);
    if (sceneData.environment) this.applyEnvironment(sceneData.environment);
    for (const obj of sceneData.objects) this.attach(obj);
  }

  /** Gizmo 拖拽中间变换落渲染对象：要素根直写；实例化模型经池 update 写矩阵（所见即所得） */
  private applyGizmoPreview(id: ID, t: Transform): void {
    const root = this.map.get(id);
    if (!root) return;
    if (this.instancedPool && this.modelIds.has(id)) {
      this.instancedPool.update(id, t);
      return;
    }
    root.position.set(t.position.x, t.position.y, t.position.z);
    root.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z);
    root.scale.set(t.scale.x, t.scale.y, t.scale.z);
  }

  /**
   * 对象的世界 XZ 足迹（T7.6 对象吸附数据源；sceneManager 只读）：
   * region = shape.points + position(x/z) 偏移 min/max（空点列回退位置零框）；道路
   * line region = 中心线 ± width/2 条带边缘（T8.1：条带面才是渲染/对齐的实际边缘，
   * domain roadBandHalfWidth 单一真相源与 GeometryBuilder 同一取参规则）；
   * model = 位置点零尺寸框；不可见对象（对象 visible=false 或所属图层 visible=false）
   * 返回 null（候选与移动框天然排除）。
   */
  private getObjectFootprint(id: ID): FootprintBox | null {
    const obj = this.deps.sceneManager.getObject(id);
    if (!obj || !this.effectiveVisible(obj)) return null;
    const px = obj.transform.position.x;
    const pz = obj.transform.position.z;
    const points = isRegionObject(obj) ? obj.shape.points : [];
    if (points.length === 0) return { minX: px, maxX: px, minZ: pz, maxZ: pz };
    const half = roadBandHalfWidth(obj);
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minZ) minZ = p.y;
      if (p.y > maxZ) maxZ = p.y;
    }
    return { minX: minX + px - half, maxX: maxX + px + half, minZ: minZ + pz - half, maxZ: maxZ + pz + half };
  }

  /**
   * 顶点编辑拖拽/插删预览（T6.8）：工作点列 → RegionRenderer.applyShapePreview
   * 几何重绑（材质/样式实例不动）。自定义注册表无 RegionRenderer 时安全降级为无预览
   * （提交路径不受影响——事件驱动重建照常）。
   */
  private previewRegionShape(
    id: ID,
    working: { type: 'polygon' | 'line' | 'point'; points: { x: number; y: number }[]; closed: boolean },
  ): void {
    const root = this.map.get(id);
    const obj = this.deps.sceneManager.getObject(id);
    if (!root || !obj || !isRegionObject(obj)) return;
    const adapter = this.attachedAdapters.get(id);
    if (adapter instanceof RegionRenderer) {
      adapter.applyShapePreview(root, obj, {
        type: working.type,
        points: working.points,
        baseHeight: obj.shape.baseHeight,
        closed: working.closed,
      });
    }
  }

  // ── 渲染循环 / 尺寸 / 生命周期 ─────────────────────────

  /**
   * LOD 总开关（T006.3）：false = 全 High + culled 旁路（评估器 lodEnabled 语义，
   * 回退对比与兜底）。只写渲染派生态——连续渲染下一帧经 frame/frameLod 生效；
   * 不触发任何场景/命令变更。幂等。
   */
  setLodEnabled(enabled: boolean): void {
    this.lodEnabled = enabled;
  }

  /** LOD 总开关当前态（DEV/验收对照读取） */
  isLodEnabled(): boolean {
    return this.lodEnabled;
  }

  /** 启动渲染循环（幂等）；每帧自检尺寸 + controls.update + render */
  renderLoop(): void {
    if (this.disposed) return;
    this.loop.start();
  }

  /** 停止渲染循环（幂等） */
  stopLoop(): void {
    this.loop.stop();
  }

  /** 渲染单帧（循环内调用；也可外部手动驱动） */
  renderFrame(): void {
    if (this.disposed) return;
    if (this.renderer.getContext().isContextLost()) {
      // render() 在上下文丢失后本就静默空转，这里提前返回并经看门狗去重上报一次，
      // 保证「画布冻结」类故障至少有一条 console.error 可查。
      this.contextWatchdog.notifyLost();
      return;
    }
    this.syncCanvasSize();
    this.controls.update();
    // T018.1 天空相机中心跟随（一次 position 拷贝级轻量维护，非 Scene 数据；shaded 与
    // 分遍两路径共用——bakeSky 不跟随，见 SkyCore.followCamera）
    this.sky?.followCamera(this.camera);
    // D19.7 全局 uTime 时钟：controls 后、render 前——材质 uniforms 声明 uTime 即自动驱动
    //（一期 shader_test 预设为既有消费者；minimap/axes 独立小场景不喂）
    this.uTime.frame(performance.now(), this.scene);
    this.vertexEdit.frame(); // 顶点句柄屏幕恒定尺寸（T6.8；无会话 O(1) 早退）
    this.alignGuides.frame(this.camera, this.canvas.clientHeight); // 参考线端点屏幕恒定尺寸（T8.1；无激活 O(1) 早退）
    this.measureOverlay.frame(this.camera, this.canvas.clientHeight); // 测量端点/标签屏幕恒定尺寸（T10.1；无激活 O(1) 早退）
    this.scatter?.frame(this.camera, this.lodEnabled); // 散布逐块视锥剔除 + 块粒度 LOD 选档（T003.2/T006.3；无源 O(1) 早退）
    this.instancedPool?.frameLod(this.camera, this.lodEnabled); // 放置逐对象 LOD 选档与跨桶迁移（T006.3；无池对象 O(1) 早退）
    if (this.renderModes.current === 'shaded') {
      // 着色模式：单遍照旧（零开销零回归）；相机开全 layer（内容 0 + 环境 2 + 辅助 3 + 诊断 4）
      this.camera.layers.enableAll();
      this.renderer.render(this.scene, this.camera);
    } else {
      // wireframe/X-Ray/clay/normals/islands：场景级 overrideMaterial 分遍渲染
      //（T6.4 R7 → T8.4）——内容像素被全局 override 材质重绘（含 ShaderMaterial 预设），
      // 环境/辅助豁免；islands 双内容遍（暗 layer 0 + 亮 DIAG_LAYER）各取 dim/highlight。
      this.renderModePasses();
    }
    // T006.4 draw call 预算告警（render 后——renderer.info 为上一完整帧口径；分遍模式
    // 为末遍口径，与 getViewportStats 同源）。节流去抖在 BudgetAlert 内（console 侧）
    this.budgetAlert.frame(this.renderer.info.render.calls);
    // 帧成功：计数入滑动窗口（getViewportStats().fps 口径 = 已渲染帧）
    this.frameStats.tick();
    // 坐标轴指示器：主渲染后的第二个小 render（隐藏/无头时零开销空转）
    this.axesIndicator.render(this.camera);
    // 小地图：帧驱动的第三个小 render（内部变化检测 + ~30Hz 节流；隐藏/无头零开销）
    this.minimap.render(this.camera);
  }

  /**
   * 非 shaded 分遍渲染（composeRenderPasses 计划逐遍执行）：
   *  - 帧首 clear 一次（color+depth），遍间 autoClear=false 共享深度缓冲；
   *  - 环境遍（ENV_LAYER）绘制天空背景并更新阴影；内容遍应用 scene.overrideMaterial、
   *    背景置 null（防每遍全屏重绘）、阴影停更——T8.4 起 override 为令牌（primary /
   *    dim / highlight），经 RenderModeState 按当前模式解析为材质（islands 双内容遍
   *    各取其材）；辅助遍（AUX_LAYER）背景 null、阴影停更（Gizmo/绘制预览豁免 override）；
   *  - 帧尾恢复背景/override/阴影与 autoClear 状态（下一帧或外部单帧驱动无残留）。
   */
  private renderModePasses(): void {
    const passes = composeRenderPasses(this.renderModes.current);
    const background = this.scene.background;
    this.renderer.autoClear = false;
    this.renderer.clear(); // 帧首一次：后续各遍叠加共享深度
    for (const pass of passes) {
      this.camera.layers.mask = pass.cameraMask;
      this.scene.background = pass.useBackground ? background : null;
      this.scene.overrideMaterial = this.renderModes.resolveOverrideMaterial(pass.overrideMaterial);
      this.renderer.shadowMap.autoUpdate = pass.updateShadow;
      this.renderer.render(this.scene, this.camera);
    }
    // 恢复（shaded 单遍路径与外部状态零感知）
    this.camera.layers.enableAll();
    this.scene.background = background;
    this.scene.overrideMaterial = null;
    this.renderer.shadowMap.autoUpdate = true;
    this.renderer.autoClear = true;
  }

  /**
   * 视口运行指标快照（EditorHandle.getViewportStats 组合根出口）：
   * fps = 1s 滑动窗口帧率；triangles/drawCalls = 最近一帧 renderer.info.render
   * （autoReset 缺省开：render() 起始重置、完成后留存，本读取即上一完整帧快照）。
   */
  getViewportStats(): { fps: number; triangles: number; drawCalls: number } {
    return {
      fps: this.frameStats.fps(),
      triangles: this.renderer.info.render.triangles,
      drawCalls: this.renderer.info.render.calls,
    };
  }

  /**
   * LOD 分布双口径只读快照（T006.4，D27.9 归因数据——供 006.5 验收报表与调试）：
   * 聚合散布链（chunk×source×level 自有桶 + 合并桶）与放置链（source×level 桶）的
   * 各档实例数 / 各档桶数（口径见 runtime/lodDistribution 头注）。按需调用，不进帧路径。
   */
  getLodDistribution(): LodDistribution {
    const counter = new LodDistributionCounter();
    const scatter = this.scatter?.getLodDistribution();
    if (scatter) counter.addDistribution(scatter);
    const pool = this.instancedPool?.getLodDistribution();
    if (pool) counter.addDistribution(pool);
    return counter.snapshot();
  }

  /**
   * renderer.info 资源计数只读快照（T009.7 性能验收 DEV 驱动面数据源；最小面只读 getter，
   * 不动渲染循环）：geometries/textures = memory 计数（**个数而非字节**——资源契约
   * 「删除无残留 / 连续放置删除无持续增长」的对账口径）；programs = 已编译着色程序数
   * （null 安全）。drawCalls/triangles/fps 见 getViewportStats（上一完整帧）。
   */
  getResourceStats(): { geometries: number; textures: number; programs: number } {
    return {
      geometries: this.renderer.info.memory.geometries,
      textures: this.renderer.info.memory.textures,
      programs: this.renderer.info.programs?.length ?? 0,
    };
  }

  /**
   * 视口尺寸变更（画布 CSS 像素；幂等——同值重复调用不再触发 setSize）。
   * 非正尺寸一律忽略：布局未稳时保持原状，等待下一轮（RO 回调或逐帧自检）重试。
   */
  resize(width: number, height: number): void {
    if (!this.sizePolicy.shouldApply(width, height)) return;
    this.sizePolicy.apply(width, height);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /** 逐帧自检画布布局尺寸（ResizeObserver 之外的第二通道：循环活着就不会停在错误比例上） */
  private syncCanvasSize(): void {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (this.sizePolicy.shouldApply(width, height)) this.resize(width, height);
  }

  /**
   * 停止一切并释放全部资源。
   * 注意：绝不调用 renderer.forceContextLoss()——dev 下 React StrictMode 双挂载会先后创建
   * 两个 Renderer 共用同一 canvas 的同一 WebGL 上下文，强失上下文会连带杀死后来者
   * （这正是「首载冻结在残影帧」这类故障的放大器）。three 的 dispose() 只释放本实例
   * 编译/上传的 GL 对象，不触碰共享上下文本身，对后来者安全。
   */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.loop.dispose();
    this.contextWatchdog.detach();
    this.sync.stop();
    this.offIslandsLayerRemoval(); // 订阅成对退订（T8.4 islands 兜底监听）
    this.gizmo.dispose();
    this.vertexEdit.dispose();
    this.alignGuides.dispose();
    this.measureOverlay.dispose();
    this.axesIndicator.dispose();
    this.minimap.dispose();
    for (const id of this.map.ids()) this.detach(id);
    this.map.clear();
    this.attachedAdapters.clear();
    this.modelIds.clear();
    this.preview.dispose();
    this.instancedPool?.dispose(); // 先于源释放：实例网格共享模板资源，几何/材质由源（loader/缓存）统一释放
    this.scatterSync?.dispose(); // T003.3：先解绑 region↔散布源（记录清空），再整片拆管线
    this.scatter?.dispose(); // 同序拆除散布管线（T003.2）：实例缓冲先释放，共享源随后由 loader/缓存统一处理
    this.assetLoader?.dispose();
    // T002.3：程序化源缓存紧随 loader 释放（两者资源不相交，顺序无耦合；池已先行拆除）。
    // 会话私有实例（D17）——释放后 StrictMode 后挂载的下一渲染器重建自己的缓存，互不影响
    this.proceduralCache?.dispose();
    this.renderModes.dispose(); // 场景级 override 材质释放（T6.4 R7）
    this.clearEnvironment();
    this.controls.dispose();
    this.renderer.dispose();
  }

  // ── 环境预设 ────────────────────────────────────────────

  /**
   * 应用环境预设（整组重建：Sky 天空网格（T018.1）+ PMREM IBL（T018.2）+ 地面 + 网格 +
   * 平行光；T018.3 预设面收口——大气/云/太阳角/IBL 预设差异化首次全生效 + 事务式 fallback
   * 单一开关（Sky/PMREM 初始化失败 → legacy 渐变背景 + Hemi 完整路径，D29.5）；renderMode/
   * axes 键消费）。正常路径零 HemisphereLight（D29.4：环境漫射光全部由 IBL 承担）。
   */
  applyEnvironment(env: SceneEnvironment): void {
    this.clearEnvironment();
    const preset = environmentPresetOf(env.preset);

    // 渲染模式（environment.renderMode，T5.7）：仅变更时一次材质遍历，不进每帧路径
    this.applyRenderModeChange(coerceRenderMode(env.renderMode));
    // 坐标轴指示器开关（environment.axes.visible，T5.7）
    this.axesIndicator.setVisible(coerceSceneAxes(env.axes).visible);

    // T018.3 事务式环境天空段构建（D29.5 单一开关，裁定在 environment/environmentSetup）：
    // 新路径（SkyCore 构造 → displaySky 挂 envGroup → PmremEnvironment 构造 → 初烘）任一步
    // 失败 → 事务清理已建部分 → 完整 legacy 路径（渐变 background + Hemi + day 方向太阳口径）；
    // 每次调用重新尝试新路径（fallback 不粘死，恢复机会留给下次切换）；运行中重烘失败在构建
    // 单元内 catch（保留旧环境不降级，与初烘失败整组降级语义分界）
    const skyEnv = setupSkyEnvironment({
      scene: this.scene,
      envGroup: this.envGroup,
      preset,
      createSky: defaultSkyCoreFactory,
      createPmrem: createRendererPmremFactory(this.renderer),
    });
    if (skyEnv.mode === 'sky') {
      this.sky = skyEnv.sky;
      this.pmrem = skyEnv.pmrem;
      this.skyRebake = skyEnv.rebake; // T018.4：debounce 句柄带出（clearEnvironment cancel）
    }

    // 平行光（太阳，带阴影；两分支共用，仅方向源不同）。sky 模式 = SkyCore 状态源（预设角
    // 经 sunDirectionOf——三一致「天空太阳位 = 光向 = 影向」D29.1，直读 × LEGACY_SUN_DISTANCE
    // ≈ 156.205）；legacy 模式 = 现行太阳常量口径（(80,120,60) 同向同模长，D29.5 降级语义）。
    // shadow camera 2048 / ±160 / near 1 / far 400 / bias 全不动（D29.1 冻结）
    this.sunLight = new THREE.DirectionalLight(preset.sun.color, preset.sun.intensity); // T018.4 字段提升（调参端口灯位侧）
    const sun = this.sunLight; // 本分支块局部别名（挂载/阴影配置/层例外沿用原名）
    const sunDir =
      skyEnv.mode === 'sky'
        ? skyEnv.sky.sunDirection
        : sunDirectionOf(DAY_SUN_ELEVATION_DEG, DAY_SUN_AZIMUTH_DEG);
    sun.position.set(
      sunDir.x * LEGACY_SUN_DISTANCE,
      sunDir.y * LEGACY_SUN_DISTANCE,
      sunDir.z * LEGACY_SUN_DISTANCE,
    );
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -160;
    sun.shadow.camera.right = 160;
    sun.shadow.camera.top = 160;
    sun.shadow.camera.bottom = -160;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 400;
    sun.shadow.bias = -0.0004;
    this.envGroup.add(sun);

    // 无限地面观感：大平面（接收阴影）+ 网格辅助线
    // 材质经 makeGroundMaterial（含 T9.2 共面偏置双保险地面侧，见其注记）
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
      makeGroundMaterial(preset.groundColor),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.envGroup.add(ground);

    // 网格：环境通道配置（environment.grid：显示开关 + 尺寸 + 间距）。键缺省时保持
    // 既有观感（常显 10m 格）；写入后按配置重建——T3.3 主代理裁定，UI GridSettings 经组合根写入
    if (env.grid === undefined) {
      this.envGroup.add(makeGridHelper(GROUND_SIZE, GRID_DIVISIONS, preset.gridMajor, preset.gridMinor));
    } else {
      const grid = coerceSceneGrid(env.grid);
      if (grid.visible) {
        const divisions = Math.min(Math.max(Math.round(grid.size / grid.spacing), 20), 2000);
        this.envGroup.add(makeGridHelper(grid.size, divisions, preset.gridMajor, preset.gridMinor));
      }
    }

    // 环境组整体划入 ENV_LAYER（T6.4 R7 分遍：非 shaded 环境遍独占、内容/辅助遍豁免）；
    // 灯光例外开全 layer——内容遍（相机掩码仅 layer 0）仍需收集灯光供 MeshStandardMaterial
    // 内容对象使用，且阴影 pass 的 object.layers.test(light.layers) 不因灯被挪层而漏投影。
    // legacy 分支的 Hemi 同为灯光例外（构建结果带回引用；正常路径无 Hemi，D29.4）
    this.envGroup.traverse((node) => {
      node.layers.set(ENV_LAYER);
    });
    sun.layers.enableAll();
    if (skyEnv.mode === 'legacy') skyEnv.hemi.layers.enableAll();
    // T018.4 调参端口装配（sky 模式专属——legacy 分支保持 null，D29.5 单一开关不变式：
    // fallback 态无 DEV 调参）：持有本环境 sky/pmrem/sunLight/rebake 四句柄 + 预设名，
    // 随 clearEnvironment 整组置空、applyEnvironment 重建（预设切换即重置——会话态语义）
    if (skyEnv.mode === 'sky') {
      this.skyTuningPort = new SkyTuning({
        scene: this.scene,
        sky: skyEnv.sky,
        pmrem: skyEnv.pmrem,
        sunLight: sun,
        rebake: skyEnv.rebake,
        preset: env.preset,
      });
    }
  }

  /**
   * 环境调参端口（T018.4 只读访问面）：sky 模式非 null；legacy/fallback null——
   * app 组合根 __sky DEV 守卫经本 getter 结构代理（mode live 读、legacy 写入口
   * 显式抛错在守卫层）。实现契约见 environment/skyTuning。
   */
  get skyTuning(): SkyTuningPort | null {
    return this.skyTuningPort;
  }

  /**
   * 清空并释放当前环境资源（Renderer.dispose 经本链覆盖环境全量）。
   * T018.1：sky（displaySky 摘离 envGroup + bakeSky/bakeScene 全量释放）+ 环境树改走
   * disposeEnvironmentObjectTree（Line 几何与灯光 shadow map 纳入释放——legacy 预设
   * 切换线性泄漏 +1 geo/+2 tex 每次的最小修复，改前事实见 docs/acceptance/t018/018.0
   * README ③）。T018.2：PMREM 先于 sky 释放（消费者先撤）——owned RT（含事务替换残留，
   * 事务路径已逐次 retire）+ 惰性 PMREMGenerator + scene.environment 摘除；幂等。
   * T018.3：legacy fallback 分支的 Hemi（envGroup 子节点，无 shadow map 零特殊处理）
   * 与渐变 background（Texture dispose 既有）同样经本链释放——两分支统一出口。
   * T018.4：pending 重烘 debounce 显式取消（不跨环境触发）+ 调参端口/sunLight 字段
   * 置空（sunLight 本体经 envGroup 释放链不变）。
   */
  private clearEnvironment(): void {
    // T018.4：pending 重烘显式取消（不跨环境触发——确定性记档口径）+ 调参端口/
    // sunLight 字段去引用（端口随 applyEnvironment 整组重建；灯本体仍经下方 envGroup
    // 释放链，本字段只去引用不重复释放）
    this.skyRebake?.cancel();
    this.skyRebake = null;
    this.skyTuningPort = null;
    this.sunLight = null;
    this.pmrem?.dispose();
    this.pmrem = null;
    this.sky?.dispose();
    this.sky = null;
    for (const child of [...this.envGroup.children]) {
      child.removeFromParent();
      disposeEnvironmentObjectTree(child);
    }
    const background = this.scene.background;
    if (background instanceof THREE.Texture) background.dispose();
    this.scene.background = null;
  }

  // ── 渲染模式（environment.renderMode 消费，T5.7 → T6.4 场景级 overrideMaterial）──

  /**
   * 渲染模式切换（仅环境变更时调用；幂等——同模式 no-op）：
   * T6.4 起只改状态（连续渲染下一帧经 composeRenderPasses 分遍生效）——
   * 不遍历改写业务材质，样式重建/迟到实例网格零模式耦合；clay/normals 与 wireframe/
   * xray 同为「切换只改状态」零对象遍历。T8.4 islands 例外：需要一次性对象换层
   * 遍历（未归类对象移入 DIAG_LAYER、实例池注入诊断分组），切换时执行、不进帧路径。
   */
  private applyRenderModeChange(next: ViewportRenderMode): void {
    if (next === this.renderModes.current) return;
    const wasIslands = this.renderModes.current === 'islands';
    this.renderModes.setMode(next);
    if (next === 'islands') this.enterIslands();
    else if (wasIslands) this.exitIslands();
  }

  /** islands 激活：常规内容根未归类者移入 DIAG_LAYER + 实例池注入诊断分组（活谓词） */
  private enterIslands(): void {
    this.islandsActive = true;
    this.instancedPool?.setDiagnosticGrouping(this.isClassified, DIAG_LAYER);
    for (const id of this.map.ids()) this.applyIslandsLayer(id);
  }

  /** islands 退出：恢复内容 layer 0 + 实例池并回单网格（分组态撤除） */
  private exitIslands(): void {
    this.islandsActive = false;
    this.instancedPool?.setDiagnosticGrouping(null, DIAG_LAYER);
    for (const id of this.map.ids()) {
      const root = this.map.get(id);
      // 池锚点不在渲染树（parent ≠ contentGroup）——池内网格已由撤除调用恢复，跳过
      if (root && root.parent === this.contentGroup) root.traverse((node) => node.layers.set(0));
    }
  }

  /** islands 激活期间静默换层（removeLayer 置空成员 layerId 无逐对象事件）→ 全量重算 */
  private refreshIslandsGrouping(): void {
    this.instancedPool?.setDiagnosticGrouping(this.isClassified, DIAG_LAYER); // 活谓词重收敛
    for (const id of this.map.ids()) this.applyIslandsLayer(id);
  }

  /**
   * 单对象诊断侧应用（幂等）：未归类（layerId === null）且 islands 激活 → 整树
   * DIAG_LAYER（亮遍）；其余（已归类 / 未激活）→ layer 0。池锚点不在渲染树，跳过
   * （实例化模型的分侧由 InstancedAssetPool 诊断分组负责，单例退化 mesh 同在池内处理）。
   * 注：层切换连带子 Sprite（poi.billboard）入亮遍——Sprite 不被 overrideMaterial
   * 覆盖（T6.4 已知边界沿承），其呈现为原色。
   */
  private applyIslandsLayer(id: ID): void {
    if (!this.islandsActive) return;
    const root = this.map.get(id);
    if (!root || root.parent !== this.contentGroup) return;
    const layer = this.isClassified(id) ? 0 : DIAG_LAYER;
    root.traverse((node) => node.layers.set(layer));
  }

  // ── 图层状态应用 ────────────────────────────────────────

  /** 对象可见性 = 对象 visible ∧ 图层 visible；图层透明度乘算进材质（模型克隆除外） */
  private applyLayerState(obj: SceneObject, root: THREE.Object3D): void {
    root.visible = this.effectiveVisible(obj);
    if (this.modelIds.has(obj.id)) return; // 模型克隆/实例共享模板材质，不做图层透明度乘算
    const layer = obj.layerId !== null ? this.deps.sceneManager.getLayer(obj.layerId) : undefined;
    const layerOpacity = layer && Number.isFinite(layer.opacity) ? layer.opacity : 1;
    this.applyMaterialOpacity(root, Math.min(Math.max(layerOpacity, 0), 1));
  }

  /** 对象有效可见性（对象 visible ∧ 图层 visible；实例池按实例编码进矩阵 / 单例 mesh） */
  private effectiveVisible(obj: SceneObject): boolean {
    const layer = obj.layerId !== null ? this.deps.sceneManager.getLayer(obj.layerId) : undefined;
    return obj.visible && (!layer || layer.visible !== false);
  }

  /** 图层更新 → 重新应用该图层全部成员的可见性/透明度 */
  private applyLayerToMembers(layerId: ID): void {
    const layer = this.deps.sceneManager.getLayer(layerId);
    if (!layer) return;
    this.scatterSync?.onLayerUpdated(layerId); // T003.3：成员 region 的散布源级显隐（参数不触碰）
    for (const objectId of layer.objectIds) {
      const root = this.map.get(objectId);
      if (!root) continue;
      const obj = this.deps.sceneManager.getObject(objectId);
      if (!obj) continue;
      this.applyLayerState(obj, root);
      // 实例池：图层可见性变化需重写实例矩阵（锚点 visible 不影响已合批的实例渲染）
      if (this.instancedPool && this.modelIds.has(objectId)) {
        this.instancedPool.update(objectId, obj.transform, this.effectiveVisible(obj));
      }
    }
  }

  /** 材质透明度 = 基准（首次遇到时记忆）× layerOpacity（还原时 layerOpacity=1）
   *  （T6.4 提取至 renderers/layerState 纯函数并扩展 Sprite 材质乘算——R8 图层联动） */
  private applyMaterialOpacity(root: THREE.Object3D, layerOpacity: number): void {
    applyLayerOpacityToTree(root, layerOpacity, this.baseOpacity);
  }

  // ── 模型对象（AssetLoader 路径）────────────────────────

  /** 挂载模型对象：有资产加载器时走实例化池（同资产合并 InstancedMesh），否则占位 Group */
  private attachModel(obj: ModelObject): void {
    if (this.instancedPool) {
      // 锚点脱离渲染树：场景渲染对象数只取决于池（同资产 1 个网格），
      // 锚点供 RuntimeObjectMap / 包围盒取景使用
      const anchor = this.poolAttach(this.instancedPool, obj);
      this.map.set(obj.id, anchor);
      this.modelIds.add(obj.id);
      this.applyLayerState(obj, anchor);
      return;
    }
    const root = new THREE.Group();
    applySceneObjectState(root, obj);
    this.map.set(obj.id, root);
    this.modelIds.add(obj.id);
    this.contentGroup.add(root);
    this.fillModelInstance(obj.id, root, obj);
    this.applyLayerState(obj, root);
  }

  /** 池化登记：attach 后立即以图层感知的可见性重写实例矩阵（与旧路径 root.visible 语义对齐）；
   *  T002.3：烘焙式变体 hue 微差随 attach / 换资产 / 全量刷新一并复算（同 seed 同色） */
  private poolAttach(pool: InstancedAssetPool, obj: ModelObject): THREE.Object3D {
    const anchor = pool.attach(obj);
    pool.update(obj.id, obj.transform, this.effectiveVisible(obj));
    const tint = this.variantTintColorOf(obj);
    if (tint) pool.setColor(obj.id, tint);
    else pool.clearColor(obj.id);
    return anchor;
  }

  /**
   * 烘焙式变体色相乘子（T002.3，D6）：obj.asset.seed 存在且资产为程序化且声明 hueJitter>0
   * 时，经 domain applyAssetVariants 按 seed 确定性复算 hueOffset → RGB 乘子色（instanceTint
   * 换算）。缩放/旋转已在放置时烘进 transform（Gizmo 所见即所编），此处只补色相——
   * 不克隆材质（合批保持），撤销/重做/场景重载经同路径复算 → 同色逐位一致。
   * 其余情形（GLB / 无 seed / 无 hue 声明）返回 null（白恒等，池零开销）。
   */
  private variantTintColorOf(obj: ModelObject): THREE.Color | null {
    const seed = obj.asset.seed;
    if (seed === undefined) return null;
    const descriptor = this.deps.assets?.get(obj.asset.assetId);
    if (!descriptor || descriptor.kind !== 'procedural') return null;
    const variants = descriptor.asset.variants;
    if (!variants || !((variants.hueJitter ?? 0) > 0)) return null;
    const { hueOffset } = applyAssetVariants(variants, seed);
    return hueOffsetToMultiplier(hueOffset);
  }

  /** 异步加载资产克隆填充 root（令牌防竞态：已卸载/换资产后迟到的结果丢弃） */
  private fillModelInstance(id: ID, root: THREE.Object3D, obj: ModelObject): void {
    if (!this.assetLoader) return;
    const assetId = obj.asset.assetId;
    const token = (this.modelTokens.get(id) ?? 0) + 1;
    this.modelTokens.set(id, token);
    this.assetLoader
      .instantiate(assetId)
      .then((instance) => {
        if (this.disposed || this.map.get(id) !== root) return;
        if (this.modelTokens.get(id) !== token) return;
        root.clear();
        root.add(instance);
      })
      .catch((err) => {
        console.warn('[Renderer] 模型加载失败，保留空占位', assetId, err);
      });
  }
}

// ── 模块级工具 ─────────────────────────────────────────────

// isModelObject 结构判别自 T9.2 起收编入 domain/assets/ModelObject（editor 贴地命令
// 与 runtime 共用单一实现），此处经顶部 import 引入。

/** 递归释放对象树的几何/材质/纹理句柄（专属资源语义；共享克隆勿用） */
function disposeObjectTree(root: THREE.Object3D): void {
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry?.dispose();
      const material = mesh.material;
      if (Array.isArray(material)) {
        for (const m of material) m.dispose();
      } else if (material) {
        material.dispose();
      }
    }
  });
}

/**
 * 递归释放环境对象树的 GPU 资源（T018.1 环境链路专用，导出供 node 单测）。
 * 与 disposeObjectTree 的差异 = 只补环境链路的两个盲区（**不重构其全局语义**——
 * detach 兜底路径仍走原函数）：
 *  - Line / LineSegments（GridHelper 为 LineSegments）：geometry + material——
 *    legacy clearEnvironment 只判 isMesh，网格几何每切换 +1 泄漏（018.0 ③ 实测）；
 *  - 灯光 shadow map 渲染目标（shadow.map / mapPass）：RT 归灯对象私有、材质遍历
 *    天然不可见，WebGLShadowMap 每灯重建不复旧——每切换 +2 纹理泄漏的主力。
 * 环境树全为 applyEnvironment 专属新建（无共享克隆），专属释放语义安全；幂等
 * （three dispose 事件重复派发无 GL 副作用）。
 */
export function disposeEnvironmentObjectTree(root: THREE.Object3D): void {
  root.traverse((node) => {
    // 单一结构断言（沿上方 disposeObjectTree 的 node-as-Mesh 先例）：Mesh 判 isMesh、
    // Line/LineSegments（含 GridHelper）判 isLine，几何/材质字段两者结构同形
    const renderable = node as THREE.Mesh & { isLine?: boolean };
    if (renderable.isMesh || renderable.isLine === true) {
      renderable.geometry?.dispose();
      const material = renderable.material;
      if (Array.isArray(material)) {
        for (const m of material) m.dispose();
      } else if (material) {
        material.dispose();
      }
    }
    const light = node as THREE.DirectionalLight;
    if (light.isLight) {
      // HemisphereLight 无 shadow（undefined 链安全）；mapPass 为部分阴影类型第二 RT
      light.shadow?.map?.dispose();
      light.shadow?.mapPass?.dispose();
    }
  });
}
