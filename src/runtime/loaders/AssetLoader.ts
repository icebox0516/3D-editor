/**
 * runtime/loaders/AssetLoader —— 模型资产加载器（GLB）。
 *
 * 职责：ModelAsset → THREE.Group；「同 assetId 缓存共享 geometry/material，多实例克隆」——
 *      每个资产只加载一次（缓存 Promise 模板），每个放置实例 clone(true)
 *      （three 克隆语义：几何/材质引用共享，变换独立）。
 *      T2.3 增补：loadInstanceSource —— 从模板抽取可共享的实例化源，
 *      供 InstancedAssetPool 构建 InstancedMesh（同资产全部实例共用一份几何/材质，
 *      一个 Draw Call）；多 Mesh 模板烘焙合并为单 geometry + 材质数组（T5.9：
 *      此前只取首个 Mesh，实例化渲染与拾取只覆盖首部件）。
 * 边界：实例化源与克隆体一样共享模板资源，消费方（池/克隆挂载方）只挂载/移除，
 *      不 dispose 其几何/材质（模板资源统一由本类 dispose 释放；
 *      多 Mesh 合并几何是本类派生资源，同样由本类释放）；
 *      场景只存 assetId 引用，文件路径来自 AssetRegistry。
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { isFileAssetDescriptor } from '../../domain/assets';
import type { ModelAsset } from '../../domain/assets';
import type { AssetRegistry } from '../../registries/AssetRegistry';
import type { InstanceSource } from '../instancing/InstancedAssetPool';

export class AssetLoader {
  private readonly assets: AssetRegistry;
  private readonly loader = new GLTFLoader();
  /** assetId → 模板加载 Promise（缓存：同资产不重复加载/解析） */
  private readonly templates = new Map<string, Promise<THREE.Object3D>>();
  /** assetId →（实例化用）默认变换，随注册信息取用 */
  private readonly defaults = new Map<string, ModelAsset>();
  /** assetId → 实例化源 Promise（缓存：多 Mesh 合并只做一次，结果复用） */
  private readonly instanceSources = new Map<string, Promise<InstanceSource>>();
  /** 多 Mesh 模板派生的合并几何（本类专属资源，dispose 释放；单 Mesh 引用共享不在此列） */
  private readonly derivedGeometries = new Set<THREE.BufferGeometry>();

  constructor(assets: AssetRegistry) {
    this.assets = assets;
  }

  /** 加载（或复用缓存）资产模板；资产未注册或文件加载失败 → reject */
  load(asset: ModelAsset): Promise<THREE.Object3D> {
    this.defaults.set(asset.id, asset);
    let template = this.templates.get(asset.id);
    if (!template) {
      template = this.loader.loadAsync(asset.file).then((gltf) => gltf.scene);
      this.templates.set(asset.id, template);
      // 失败不缓存坏结果：下次加载重试
      template.catch(() => this.templates.delete(asset.id));
    }
    return template;
  }

  /** 按 assetId 加载模板（经 AssetRegistry 查注册信息） */
  loadById(assetId: string): Promise<THREE.Object3D> {
    const cachedDefault = this.defaults.get(assetId);
    if (cachedDefault) return this.load(cachedDefault);
    const descriptor = this.assets.get(assetId);
    if (!descriptor) return Promise.reject(new Error(`未注册的模型资产: ${assetId}`));
    // GLB 加载器只处理文件资产；程序化源走 runtime/procedural 缓存（002.3 接线），此处明确拒绝
    if (!isFileAssetDescriptor(descriptor)) {
      return Promise.reject(new Error(`非 GLB 文件资产（kind='${descriptor.kind}'）: ${assetId}`));
    }
    return this.load(descriptor.asset);
  }

  /**
   * 实例化：返回模板的深克隆（共享几何/材质，独立变换）。
   * 消费方卸载实例时只做 parent.remove，不得 dispose 其几何/材质。
   */
  async instantiate(assetId: string): Promise<THREE.Object3D> {
    const template = await this.loadById(assetId);
    return template.clone(true);
  }

  /**
   * 实例化源（T2.3）：模板 → 可共享 geometry/material（InstancedMesh 构造参数）。
   * 复用模板缓存（同资产只加载一次）；模板中无可实例化 Mesh → reject。
   * T5.9 修正：多 Mesh 模板（如凉亭 = 底座+柱×4+顶+尖顶）烘焙各节点世界变换后
   * 合并为单 geometry（材质沿 groups 对齐为数组）——此前只取首个 Mesh，导致
   * 实例化渲染与射线拾取只覆盖首部件（用户点击模型视觉主体永远选不中）。
   * 合并结果缓存复用；形态不可合并（属性/索引/蒙皮不一致）保守回退首 Mesh。
   */
  loadInstanceSource(assetId: string): Promise<InstanceSource> {
    let source = this.instanceSources.get(assetId);
    if (!source) {
      source = this.loadById(assetId).then((template) => {
        const extracted = extractInstanceSource(template, assetId);
        if (extracted.derived) this.derivedGeometries.add(extracted.source.geometry);
        return extracted.source;
      });
      source.catch(() => this.instanceSources.delete(assetId)); // 失败不缓存坏结果
      this.instanceSources.set(assetId, source);
    }
    return source;
  }

  /** 是否已缓存该资产的模板加载 */
  isCached(assetId: string): boolean {
    return this.templates.has(assetId);
  }

  /** 释放全部模板资源（几何/材质/纹理）与派生合并几何；已发放的克隆随之失去共享资源，应先于本方法移除 */
  dispose(): void {
    for (const promise of this.templates.values()) {
      promise.then((template) => disposeObjectTree(template)).catch(() => undefined);
    }
    this.templates.clear();
    this.defaults.clear();
    for (const geometry of this.derivedGeometries) geometry.dispose();
    this.derivedGeometries.clear();
    this.instanceSources.clear();
  }
}

/** extract 结果（derived = geometry 为本类派生合并资源，dispose 时需释放） */
export interface Extracted {
  readonly source: InstanceSource;
  readonly derived: boolean;
}

/** 模板树 → 实例化源：单 Mesh 引用共享；多 Mesh 烘焙节点变换合并（groups × 材质数组）。
 *  导出仅供测试（node 无 GLTFLoader，纯函数直测；GLTFLoader 部分由阶段门/browser 覆盖）。
 */
export function extractInstanceSource(template: THREE.Object3D, assetId: string): Extracted {
  const meshes: THREE.Mesh[] = [];
  template.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) meshes.push(node as THREE.Mesh);
  });
  if (meshes.length === 0) {
    throw new Error(`模型模板无可实例化 Mesh: ${assetId}`);
  }
  const first = meshes[0];
  const firstMaterial = first.material as THREE.Material | THREE.Material[];
  if (meshes.length === 1) {
    return { source: { geometry: first.geometry, material: firstMaterial }, derived: false };
  }
  if (!mergeableMeshes(meshes)) {
    // 形态不可合并（蒙皮 / 属性或索引不一致）：保守回退首 Mesh（T2.3 旧语义）
    return { source: { geometry: first.geometry, material: firstMaterial }, derived: false };
  }
  template.updateMatrixWorld(true);
  const baked: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  for (const mesh of meshes) {
    baked.push(mesh.geometry.clone().applyMatrix4(mesh.matrixWorld));
    const material = mesh.material;
    materials.push(Array.isArray(material) ? material[0] : material);
  }
  const merged = mergeGeometries(baked, true); // groups 顺序 = 输入顺序（材质对齐 materialIndex）
  for (const part of baked) part.dispose(); // 合并拷贝数据，烘焙中间体即弃
  if (!merged) {
    return { source: { geometry: first.geometry, material: firstMaterial }, derived: false };
  }
  return { source: { geometry: merged, material: materials }, derived: true };
}

/** 可合并性预检：非蒙皮 + 全体 index 形态一致 + attributes / morphAttributes 键集一致 */
function mergeableMeshes(meshes: THREE.Mesh[]): boolean {
  const first = meshes[0];
  if ((first as THREE.SkinnedMesh).isSkinnedMesh) return false;
  const indexed = first.geometry.index !== null;
  const attrKeys = Object.keys(first.geometry.attributes).sort().join(',');
  const morphKeys = Object.keys(first.geometry.morphAttributes).sort().join(',');
  return meshes.every((mesh) => {
    if ((mesh as THREE.SkinnedMesh).isSkinnedMesh) return false;
    const geometry = mesh.geometry;
    return (
      (geometry.index !== null) === indexed &&
      Object.keys(geometry.attributes).sort().join(',') === attrKeys &&
      Object.keys(geometry.morphAttributes).sort().join(',') === morphKeys
    );
  });
}

/** 递归释放对象树的全部几何与材质（模板专属资源） */
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
