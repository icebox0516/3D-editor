/**
 * registries/SemanticRegistry —— 语义注册表（「注册-定义-工厂-实例」扩展入口，阶段 6 T6.1）。
 *
 * 职责：管理 SemanticDefinition（type/label/defaultLayerName/properties/defaultPresetId/
 *      defaultBaseHeight）；createSemanticRegistry 工厂预载 domain 十条内置定义。
 *      新语义类型接入 = 向本表注册（需求 §四），框架内禁止散落 if (type === 'water') 判断
 *      （CONTRACTS.md #6）。
 * 边界：纯数据注册表（模式对齐分域契约 §B StylePresetRegistry 形态），
 *      永不含渲染/构建函数；只依赖 core/scene/domain（分层 DAG）。
 * 接线注记：本任务不接入 EditorFacade（无消费者）；T6.5（自动归层）/T6.6（类型面板）接线，
 *      届时经组合根装配暴露（registries.semantics）。
 */
import { SEMANTIC_DEFINITIONS } from '../domain/regions';
import type { SemanticDefinition } from '../domain/regions';

/** 语义注册表：register/get/has/list（纯数据形态） */
export class SemanticRegistry {
  private readonly defs = new Map<string, SemanticDefinition>();

  /** 注册语义定义；重复注册同 type 抛错 */
  register(def: SemanticDefinition): void {
    if (typeof def !== 'object' || def === null) {
      throw new Error('语义定义不能为空');
    }
    // 经 unknown 收窄：防御反序列化/JS 调用方传入非法 type（类型层已是窄联合，直接比较会误报无交集）
    const type: unknown = def.type;
    if (typeof type !== 'string' || type === '') {
      throw new Error('语义定义缺少合法 type');
    }
    if (this.defs.has(def.type)) {
      throw new Error(`语义类型已注册，禁止重复注册: ${def.type}`);
    }
    this.defs.set(def.type, def);
  }

  /** 按类型取定义；未注册返回 undefined */
  get(type: string): SemanticDefinition | undefined {
    return this.defs.get(type);
  }

  /** 是否已注册该类型 */
  has(type: string): boolean {
    return this.defs.has(type);
  }

  /** 全部定义（保持注册顺序） */
  list(): SemanticDefinition[] {
    return [...this.defs.values()];
  }
}

/** 语义注册表工厂：预载 domain 十条内置语义定义（单一真相源 SEMANTIC_DEFINITIONS） */
export function createSemanticRegistry(): SemanticRegistry {
  const registry = new SemanticRegistry();
  for (const def of SEMANTIC_DEFINITIONS) {
    registry.register(def);
  }
  return registry;
}
