/**
 * registries/StylePresetRegistry —— 样式预设元数据注册表（阶段 6 T6.2，插件化样式引擎「双轨注册」之元数据轨）。
 *
 * 职责：管理 StylePresetMeta（id/name/category?/thumbnail?/supportedShapes/supportedSemantics/defaultParams，
 *      另可选 scatter 散布配方段——T003.3/D18 同构两段可选，纯数据不含构建函数，
 *      形态逐字沿分域契约 contracts/stage6-region.md §B）；find 按 shape × semantic 双维过滤
 *      （ui 预设列表数据源）。v1 StyleRegistry 已随 T6.9 旧契约类型面删除，本表为唯一预设注册表。
 * 边界：纯数据注册表（模式对齐 T6.1 SemanticRegistry 先例），
 *      **永不含构建函数**——构建函数归 runtime/styles 构建路由（DAG 禁止 registries→runtime）；
 *      零渲染（禁止 THREE），只依赖 core/scene/domain。
 * 装配：app/bootstrap 启动时 eager 收割插件文件 meta（经 runtime/styles 路由模块）注册进本表，
 *      EditorFacade.registries.presets 暴露给 ui（ui 读预设元数据唯一途径，禁止 import runtime）。
 */
import type { SemanticType, ShapeType } from '../domain/regions';
import type { ScatterRecipe } from '../domain/scatter';
import type { StyleParameter } from '../domain/styles';

/** 样式预设元数据（分域契约 §B 逐字；id 为注册表键命名空间如 'water.flow'，不属 createId 实例前缀体系） */
export interface StylePresetMeta {
  /** 全局唯一预设 id（注册键，命名空间习惯 '<category>.<name>'；内置兜底 default_solid 例外，T6.1 已钉死） */
  id: string;
  /** 显示名 */
  name: string;
  /** 分类（目录形态 src/runtime/styles/<分类>/；灰显分组/筛选用） */
  category?: string;
  /** 缩略图静态资源引用（工具脚本或离屏渲染产出，非运行时 THREE 对象） */
  thumbnail?: string;
  /** 支持的形状类型（引擎创建前校验；不支持 → 降级兜底） */
  supportedShapes: ShapeType[];
  /** 支持的语义类型（过滤显示用，不参与引擎校验） */
  supportedSemantics: SemanticType[];
  /** 参数定义（沿基础契约 StyleParameter 形态，ui 参数表单据此生成） */
  defaultParams: StyleParameter[];
  /**
   * 散布配方（可选，T003.3/D18「同构两段可选」）：存在即散布型样式（实质 = 表面 + 散布
   * 复合）；纯数据（配比/密度/聚簇/簇半径/边缘衰减/尺寸范围），不含构建函数——散布
   * 渲染归 runtime/scatter 分块管线消费。区域级覆写按 scatter.* 白名单键解析。
   */
  scatter?: ScatterRecipe;
}

/** 样式预设注册表：register/get/list + find(shape×semantic) 过滤（纯数据形态） */
export class StylePresetRegistry {
  private readonly presets = new Map<string, StylePresetMeta>();

  /** 注册预设元数据；重复注册同 id 抛错 */
  register(meta: StylePresetMeta): void {
    if (typeof meta !== 'object' || meta === null) {
      throw new Error('预设元数据不能为空');
    }
    if (typeof meta.id !== 'string' || meta.id === '') {
      throw new Error('预设元数据缺少合法 id');
    }
    if (this.presets.has(meta.id)) {
      throw new Error(`样式预设已注册，禁止重复注册: ${meta.id}`);
    }
    this.presets.set(meta.id, meta);
  }

  /** 按 id 取元数据；未注册返回 undefined */
  get(id: string): StylePresetMeta | undefined {
    return this.presets.get(id);
  }

  /** 全部元数据（保持注册顺序） */
  list(): StylePresetMeta[] {
    return [...this.presets.values()];
  }

  /** 按 形状 × 语义 双维过滤（supportedShapes 与 supportedSemantics 都命中才返回） */
  find(shapeType: ShapeType, semanticType: SemanticType): StylePresetMeta[] {
    return this.list().filter(
      (meta) => meta.supportedShapes.includes(shapeType) && meta.supportedSemantics.includes(semanticType),
    );
  }
}
