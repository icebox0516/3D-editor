/**
 * runtime/renderers/RegionRenderer —— RegionObject 渲染器（阶段 6 T6.4，ObjectAdapter 特化）。
 *
 * 职责：RegionObject（shape/semantic/style 三层解耦数据）→ 样式实例生命周期管理：
 *  - create：GeometryBuilder 产 BufferGeometry → createStyle → wrapper Group（map 根）
 *    挂 instance.object 子节点；wrapper 根恒定——预设/类型切换只换 wrapper 内子节点，
 *    保证 RuntimeObjectMap / 框选 / Gizmo 引用稳定；
 *  - update（按 object:updated keys 分派，公共属性恒幂等重应用）：
 *    · 'shape'（或全量）→ 构建器重建几何 → instance.setGeometry 重绑，旧几何由本渲染器
 *      dispose（授权规则 2：几何归调用方）；材质实例与样式参数不动（解耦断言①）；
 *    · 'semantic' 且 semantic.type 变化 = 类型切换 → disposeStyle 旧实例 + createStyle
 *      新实例（**当前 BufferGeometry 原对象复用，几何顶点不动**；presetId/overrides 由
 *      命令层重置，解耦断言②）；同类型 = 业务参数变更 → line 形状按 width 重建几何 +
 *      setGeometry（材质不重建），语义参数经 updateStyle 保留键透传到插件
 *      （building.height → 插件自授权重挤出）；
 *    · 'style'：presetId 与簿记请求值比对——不同 = 切预设 → disposeStyle + createStyle
 *      （BufferGeometry 复用不重建，解耦断言③）；相同 = 调参数 → updateStyle。
 *      ChangeSemanticCommand 参数变更同键形携带 'style'（值未变），presetId 相同比对
 *      自然落入参数路径，可与 semantic 参数合并为一次 updateStyle 调用；
 *    · overrides 键回退边界：引擎 updateStyle 增量合并不支持删键，本渲染器自记上次
 *      应用的 overrides 键集，检测到键被删除（回默认值）时走 dispose+create（几何仍复用）；
 *  - dispose：disposeStyle（材质归置引擎）+ BufferGeometry.dispose（几何归本渲染器）+ 清簿记。
 * 边界：走引擎纯函数（createStyle/updateStyle/disposeStyle），不经旧要素渲染管线；
 *      presetId 簿记用**请求值**（非法预设降级后不重复发降级 Toast）；
 *      子节点 Mesh receiveShadow=true（本渲染器只写 receiveShadow，不覆盖插件自设值）；
 *      castShadow 由各预设对自建 Mesh 自决（building 挤出/平铺 Mesh 为 true，其余面状/
 *      点状预设维持缺省 false）；只读 Scene 数据，公共属性经 applySceneObjectState 单向应用。
 */
import * as THREE from 'three';
import type { RegionObject, RegionShape, SemanticType } from '../../domain/regions';
import { isRegionObject } from '../../domain/regions';
import type { SceneObject } from '../../scene/SceneObject';
import { GeometryBuilder } from '../geometry/GeometryBuilder';
import { ObjectAdapter } from '../ObjectAdapter';
import { createStyle, disposeStyle, updateStyle } from '../styles/engine';
import type { StyleInstance } from '../styles/types';
import { applySceneObjectState } from './objectState';

/** 每个已挂载 wrapper 的样式实例簿记 */
interface RegionRecord {
  /** 当前样式实例（引擎托管材质） */
  instance: StyleInstance;
  /** 本渲染器拥有的输入几何（shape 重建/类型·预设切换的复用基准；几何顶点身份断言锚点） */
  geometry: THREE.BufferGeometry;
  /** 上次应用的语义类型（类型切换判定） */
  semanticType: SemanticType;
  /** 上次请求的 presetId（请求值而非降级后的实例值——避免降级场景重复 Toast） */
  presetId: string;
  /** 上次应用的 overrides 键集（引擎增量合并不支持删键，删除时走 dispose+create） */
  overrideKeys: Set<string>;
}

export class RegionRenderer extends ObjectAdapter {
  /** wrapper 根 → 簿记（渲染器单例共享，按根区分；dispose 清理） */
  private readonly records = new Map<THREE.Object3D, RegionRecord>();

  /** 本渲染器支持判定：RegionObject 三层字段齐备（分派键 'region' 由 RendererRegistry 注册） */
  supports(obj: SceneObject): boolean {
    return isRegionObject(obj);
  }

  create(obj: SceneObject): THREE.Object3D {
    const region = obj as RegionObject;
    const geometry = GeometryBuilder(region.shape, region.semantic);
    const instance = createStyle(
      geometry,
      region.shape.type,
      region.semantic.type,
      region.style.presetId,
      region.style.overrides,
      region.semantic.properties,
    );
    const wrapper = new THREE.Group();
    wrapper.add(instance.object);
    this.applyShadowFlags(instance.object);
    applySceneObjectState(wrapper, region);
    this.records.set(wrapper, {
      instance,
      geometry,
      semanticType: region.semantic.type,
      presetId: region.style.presetId,
      overrideKeys: new Set(Object.keys(region.style.overrides)),
    });
    return wrapper;
  }

  update(root: THREE.Object3D, obj: SceneObject, keys?: string[]): void {
    const region = obj as RegionObject;
    const rec = this.records.get(root);
    if (!rec) {
      console.warn('[RegionRenderer] update 遇到未登记的根对象（应先经 create），跳过');
      return;
    }
    const changed = (key: string): boolean => keys === undefined || keys.includes(key);

    // ① 改 shape：几何重生成 + setGeometry 重绑（旧几何释放；材质与样式参数不动）
    const shapeChanged = changed('shape');
    if (shapeChanged) this.rebuildGeometry(rec, region);

    // ② 改 semantic：类型切换 vs 业务参数变更
    let swapped = false;
    if (changed('semantic') && region.semantic.type !== rec.semanticType) {
      this.swapStyle(root, rec, region); // 类型切换：几何复用（解耦断言②）
      swapped = true;
    }
    let semanticParams = false;
    if (!swapped && changed('semantic')) {
      // 业务参数变更：line 形状按 width 重建几何（width 属语义参数，几何层规则）；
      // shape 键同批时几何已按新点列重建（宽度一并生效），不重复重建
      if (!shapeChanged && region.shape.type === 'line') this.rebuildGeometry(rec, region);
      semanticParams = true;
    }

    // ③ 改 style：切预设 vs 调参数（ChangeSemanticCommand 参数变更同键形携带，值未变）
    let styleParams = false;
    if (!swapped && changed('style')) {
      if (region.style.presetId !== rec.presetId || this.overrideKeyDeleted(rec, region)) {
        this.swapStyle(root, rec, region); // 切预设 / 键删除回退：几何复用（解耦断言③）
        swapped = true;
      } else {
        styleParams = true;
      }
    }

    // 参数路径合并为一次 updateStyle 调用（semantic 属性 + style 覆写）
    if (!swapped && (semanticParams || styleParams)) {
      const params: Record<string, unknown> = {};
      if (styleParams) Object.assign(params, region.style.overrides);
      if (semanticParams) params.semantic = region.semantic.properties;
      updateStyle(rec.instance, params);
      if (styleParams) rec.overrideKeys = new Set(Object.keys(region.style.overrides));
    }

    // 公共属性幂等重应用（transform/visible/name 等）
    applySceneObjectState(root, region);
  }

  dispose(root: THREE.Object3D): void {
    const rec = this.records.get(root);
    if (!rec) return; // 幂等
    this.records.delete(root);
    disposeStyle(rec.instance); // 插件自建资源 + 材质归置（模板引用计数/独享直释）
    rec.geometry.dispose(); // 几何归本渲染器（授权规则 2）
  }

  /**
   * 顶点编辑会话预览（T6.8）：按工作点列重建几何重绑（材质/样式实例不动——与
   * update 的 'shape' 路径同一 rebuildGeometry，非提交态）。会话结束由调用方经
   * update(root, obj, ['shape']) 按场景权威数据恢复（零修改退出回到原参数化形状）。
   */
  applyShapePreview(
    root: THREE.Object3D,
    obj: SceneObject,
    shape: { type: RegionShape['type']; points: RegionShape['points']; baseHeight: number; closed: boolean },
  ): void {
    const rec = this.records.get(root);
    if (!rec) return;
    this.rebuildGeometry(rec, { ...(obj as RegionObject), shape: { ...shape } as RegionShape });
  }

  // ── 内部路径 ───────────────────────────────────────────────

  /** 几何重生成并重绑（旧几何由本渲染器释放；材质/实例不动） */
  private rebuildGeometry(rec: RegionRecord, region: RegionObject): void {
    const next = GeometryBuilder(region.shape, region.semantic);
    const old = rec.geometry;
    rec.geometry = next;
    rec.instance.setGeometry(next); // 旧几何归调用方，插件不释放
    old.dispose();
  }

  /**
   * 换样式实例：dispose 旧 → create 新（**rec.geometry 原对象复用**，几何顶点不动）。
   * wrapper 根恒定，仅换子节点（RuntimeObjectMap/Gizmo/框选引用稳定）。
   */
  private swapStyle(root: THREE.Object3D, rec: RegionRecord, region: RegionObject): void {
    root.remove(rec.instance.object); // 防御（插件 dispose 通常已移除自身）
    disposeStyle(rec.instance);
    const instance = createStyle(
      rec.geometry,
      region.shape.type,
      region.semantic.type,
      region.style.presetId,
      region.style.overrides,
      region.semantic.properties,
    );
    root.add(instance.object);
    this.applyShadowFlags(instance.object);
    rec.instance = instance;
    rec.semanticType = region.semantic.type;
    rec.presetId = region.style.presetId;
    rec.overrideKeys = new Set(Object.keys(region.style.overrides));
  }

  /** 上次应用的 overrides 键是否被删除（引擎增量合并不生效，须走 dispose+create 回默认） */
  private overrideKeyDeleted(rec: RegionRecord, region: RegionObject): boolean {
    for (const key of rec.overrideKeys) {
      if (!(key in region.style.overrides)) return true;
    }
    return false;
  }

  /** 样式根对象阴影标志：Mesh 接收阴影（castShadow 缺省 false；Sprite 无此字段自然跳过） */
  private applyShadowFlags(object: THREE.Object3D): void {
    object.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (mesh.isMesh) mesh.receiveShadow = true;
    });
  }
}
