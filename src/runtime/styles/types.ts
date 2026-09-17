/**
 * runtime/styles/types —— 样式插件契约（分域契约 contracts/stage6-region.md §C 逐字 + 授权规则）。
 *
 * 职责：StyleInstance（统一返回契约，主框架只经此交互）与 StylePresetBuild（插件构建函数签名）。
 * 边界：仅 runtime / app 可见（§0 分层总则）；本文件是阶段 6 契约中 THREE 类型合法出现处之一。
 *
 * ── 插件授权规则（引擎托管实例的资源归属，2026-09-11 T6.2 定稿）────────────
 * 1. 材质生命周期归引擎：同预设多实例由引擎共享材质模板（materialPool），带 overrides
 *    的实例独享、updateStyle 写时复制提升 clone。因此插件 build 返回的实例：
 *    - update() 实现必须读「当前」材质（引用 instance.material，勿闭包捕获局部变量）——
 *      引擎可能在模板共享/写时复制时换绑材质；
 *    - dispose() 不得 dispose 材质与传入几何（两者分别归引擎与调用方），只释放插件自建
 *      辅助资源（子对象、渲染目标等）；引擎 disposeStyle 统一处理材质释放。
 * 2. 几何归调用方：createStyle 传入、setGeometry 重绑，引擎与插件均不释放几何
 *    （T6.4 RegionRenderer 创建并拥有 BufferGeometry）。
 * 3. 根对象约定：instance.object 应为 Mesh / Line / Points（具 material 槽位），
 *    引擎换绑材质时同步根对象槽位；Group 根的预设不参与模板共享（自管材质）。
 * 4. update() 只改参数/uniform，禁止重建几何（v1 矛盾修正 ①）；形状变更走 setGeometry。
 */
import type * as THREE from 'three';
import type { ShapeType } from '../../domain/regions';

/** 统一返回契约（强制，主框架只经此交互） */
export interface StyleInstance {
  /** 根渲染对象，直接挂场景节点（授权规则 3：Mesh/Line/Points） */
  object: THREE.Object3D;
  /** 主材质（通用批量操作用；引擎可能换绑——update 实现读 instance.material） */
  material: THREE.Material;
  /** 元数据回带：所属预设 id */
  presetId: string;
  /** 元数据回带：支持的形状类型 */
  supportedShapes: ShapeType[];
  /** 只改参数/uniform，禁止重建几何（参数语义见引擎 updateStyle：接收完整解析参数集） */
  update(params: Record<string, unknown>): void;
  /** 形状修改后的几何重绑（旧几何不释放，归调用方） */
  setGeometry(geometry: THREE.BufferGeometry): void;
  /** 释放本实例全部自建资源（授权规则 1：不含材质与传入几何） */
  dispose(): void;
}

/** 插件构建函数：几何 + 解析后参数 → 样式实例（参数含保留键 semantic，见 engine） */
export type StylePresetBuild = (geometry: THREE.BufferGeometry, params: Record<string, unknown>) => StyleInstance;

/** 插件文件（*.preset.ts）的导出形态：同文件导出 meta（纯数据）与 build（本契约） */
export interface StylePresetPluginModule {
  meta?: unknown;
  build?: unknown;
}
