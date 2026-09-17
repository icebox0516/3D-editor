/**
 * runtime/renderers/RendererRegistry —— 对象渲染器注册表（注册制扩展，CONTRACTS.md #6）。
 *
 * 职责：object.type → ObjectAdapter 的分派表；Renderer 按 SceneObject.type 查表取渲染器，
 *      业务代码不散落 if (type === '…') 判断。新增对象类型渲染器只需 register。
 * 边界：渲染侧分派表（v1 时代与 registries 层 ElementRegistry 平行的入口，该注册表
 *      已随 T6.9 旧契约类型面删除），零业务知识；
 *      T6.7（2026-09-12）：v1 五旧要素渲染器（building/road/green/water/marker，
 *      旧材质工厂路径）已随旧要素体系删除——默认注册表只注册
 *      'region'（RegionRenderer，样式引擎纯函数路径，分域契约 §C/§D 渲染分支）；
 *      未注册类型由 Renderer 告警跳过。
 */
import type { ObjectAdapter } from '../ObjectAdapter';
import { RegionRenderer } from './RegionRenderer';

export class RendererRegistry {
  private readonly adapters = new Map<string, ObjectAdapter>();

  /** 注册渲染器；重复注册同 elementType 抛错 */
  register(elementType: string, renderer: ObjectAdapter): void {
    if (typeof elementType !== 'string' || elementType === '') {
      throw new Error('渲染器注册键（elementType）不能为空');
    }
    if (this.adapters.has(elementType)) {
      throw new Error(`要素渲染器已注册，禁止重复注册: ${elementType}`);
    }
    this.adapters.set(elementType, renderer);
  }

  /** 注销（不存在时静默无操作） */
  unregister(elementType: string): void {
    this.adapters.delete(elementType);
  }

  /** 按要素类型取渲染器；未注册返回 undefined */
  get(elementType: string): ObjectAdapter | undefined {
    return this.adapters.get(elementType);
  }

  has(elementType: string): boolean {
    return this.adapters.has(elementType);
  }

  /** 全部已注册类型（保持注册顺序） */
  types(): string[] {
    return [...this.adapters.keys()];
  }
}

/** 装配默认注册表：region（RegionObject，阶段 6 形状驱动 + 样式引擎管线） */
export function createDefaultRendererRegistry(): RendererRegistry {
  const registry = new RendererRegistry();
  registry.register('region', new RegionRenderer()); // 样式引擎纯函数路径，无旧渲染管线依赖
  return registry;
}
