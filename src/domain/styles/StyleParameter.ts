/**
 * domain/styles/StyleParameter —— 样式/语义参数元数据形态。
 *
 * 职责：声明参数控件类型与参数定义（key/label/type/default/min/max/step/options）——
 *      语义定义（domain/regions/semanticDefinitions）与样式预设元数据
 *      （registries/StylePresetRegistry）共用的参数表形态，UI 参数表单据此生成。
 * 边界：纯数据，零渲染；T6.9 自 StyleDefinition.ts 迁入（v1 StyleDefinition /
 *      MaterialSpec / StyleReference / resolveStyle 已随旧要素体系删除）。
 */

/** 参数控件类型：color 取色器 / number 滑块或输入 / boolean 开关 / select 下拉 */
export type StyleParameterType = 'color' | 'number' | 'boolean' | 'select';

export interface StyleParameter {
  /** 参数键（region style.overrides 与语义 properties 以此键引用） */
  key: string;
  /** 面板显示名 */
  label: string;
  type: StyleParameterType;
  /** 预设默认值 */
  default: string | number | boolean;
  /** number 参数下界（解析钳制用） */
  min?: number;
  /** number 参数上界 */
  max?: number;
  /** number 参数步进（UI 用，不参与解析） */
  step?: number;
  /** select 参数的候选项 */
  options?: { value: string | number; label: string }[];
}
