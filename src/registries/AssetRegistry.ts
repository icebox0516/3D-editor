/**
 * registries/AssetRegistry —— 统一资产注册表（T002.1 扩展：AssetDescriptor 混排）。
 *
 * 职责：管理统一资产描述符（D7/D17——GLB 文件资产与程序化资产同库混排，按 kind 可辨识分派），
 *      支持按 id / 分类（findByCategory）/ 关键词（search）/ kind（findByKind）检索；
 *      文件扫描/加载/缓存由 runtime 与 manifest 体系负责，程序化 build 路由在 runtime/procedural，
 *      注册表只存元数据（build 函数永不进入本层——分层 DAG 禁止 registries→runtime）。
 * 边界：只依赖 core/domain（分层 DAG）；零渲染。
 */
import type { ID } from '../core/types';
import type { AssetDescriptor } from '../domain/assets';

/** 资产注册表：register/unregister/get/list/findByCategory/findByKind/search */
export class AssetRegistry {
  private readonly assets = new Map<ID, AssetDescriptor>();

  /** 注册资产描述符；重复注册同 id 抛错（跨 kind 同样拒绝——全库共享 id 命名空间） */
  register(a: AssetDescriptor): void {
    if (typeof a !== 'object' || a === null) {
      throw new Error('资产定义不能为空');
    }
    const kind: unknown = a.kind; // 经 unknown 中转比较：联合类型直比会被收窄成 never（运行时防御仍需覆盖 JS 调用方）
    if (kind !== 'file' && kind !== 'procedural') {
      throw new Error(`资产定义缺少合法 kind（'file' | 'procedural'）: ${String(kind)}`);
    }
    if (typeof a.asset !== 'object' || a.asset === null || typeof a.asset.id !== 'string' || a.asset.id === '') {
      throw new Error('资产定义缺少合法 id');
    }
    const existing = this.assets.get(a.asset.id);
    if (existing) {
      throw new Error(`资产已注册，禁止重复注册: ${a.asset.id}（已存在 kind='${existing.kind}'，重复注册 kind='${a.kind}'）`);
    }
    this.assets.set(a.asset.id, a);
  }

  /** 注销资产（不存在时静默无操作） */
  unregister(id: ID): void {
    this.assets.delete(id);
  }

  /** 按资产 id 取描述符；未注册返回 undefined */
  get(id: ID): AssetDescriptor | undefined {
    return this.assets.get(id);
  }

  /** 全部资产描述符（保持注册顺序） */
  list(): AssetDescriptor[] {
    return [...this.assets.values()];
  }

  /** 按分类过滤（保持注册顺序）；无匹配返回空数组 */
  findByCategory(c: string): AssetDescriptor[] {
    return this.list().filter((a) => a.asset.category === c);
  }

  /** 按 kind 过滤（'file' = GLB 文件资产 / 'procedural' = 程序化资产）；保持注册顺序 */
  findByKind(kind: AssetDescriptor['kind']): AssetDescriptor[] {
    return this.list().filter((a) => a.kind === kind);
  }

  /**
   * 关键词搜索：匹配 name 或 tags（包含语义，不区分大小写；两种 kind 公共字段）。
   * 空白关键词返回空数组（UI 输入框清空时应展示全量 list 而非调用 search）。
   */
  search(q: string): AssetDescriptor[] {
    const query = q.trim().toLowerCase();
    if (query === '') return [];
    return this.list().filter((a) => {
      const inName = a.asset.name.toLowerCase().includes(query);
      const inTags = a.asset.tags.some((t) => t.toLowerCase().includes(query));
      return inName || inTags;
    });
  }
}
