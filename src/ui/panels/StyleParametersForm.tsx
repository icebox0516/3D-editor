/**
 * ui/panels/StyleParametersForm —— 样式参数自动生成表单（T2.4；T6.6 起为 region
 * 语义参数表单与预设参数表单共用）。
 *
 * 职责：由参数声明（StyleParameter[]）自动生成控件——
 *      color → 取色器（ColorInput）、number → 滑杆+数值框（NumberSlider，min/max/step）、
 *      boolean → 开关（IconToggle）、select → 下拉（ed-select）；受控组件契约：
 *      { parameters, values, onChange(key, value) }（任务书 Produces）。
 *      值显示由调用方合成（region 版 = resolvePresetValues：默认 < overrides + 钳制，
 *      见 regionInspectorModel；语义参数 = semantic.properties 原值）。
 * 纯逻辑（可测，node 无 DOM）：describeParameterControls（参数声明 → 控件描述符，
 *      测试断言基准）。StyleApplyScope 类型定义于此（region 四档作用域共用）。
 * 边界：ui 层只依赖 core/domain（分层 DAG）；零 THREE；一切控件复用设计系统类名。
 *      T6.7：v1 残留已删——resolveStyle / StyleDefinition 依赖、resolveFormValues、
 *      resolveStyleTargets 与 STYLE_SCOPE_OPTIONS（v1 四档作用域解析；region 版为
 *      REGION_STYLE_SCOPE_OPTIONS 与 resolveRegionStyleTargets，见 regionInspectorModel）。
 */
import type { StyleParameter } from '../../domain/styles';
import { ColorInput } from '../components/ColorInput';
import { IconToggle } from '../components/IconToggle';
import { NumberSlider } from '../components/NumberSlider';

/** 控件描述符：参数声明 → 可渲染控件的最小描述（纯函数产物，测试断言基准） */
export interface ParameterControl {
  key: string;
  label: string;
  kind: 'color' | 'number' | 'boolean' | 'select';
  default: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: StyleParameter['options'];
}

/** 参数声明 → 控件描述符（顺序保持声明序；类型直映射，数值参数透传 min/max/step） */
export function describeParameterControls(parameters: readonly StyleParameter[]): ParameterControl[] {
  return parameters.map((p) => ({
    key: p.key,
    label: p.label,
    kind: p.type,
    default: p.default,
    min: p.min,
    max: p.max,
    step: p.step,
    options: p.options,
  }));
}

/** 样式作用域（需求 §样式系统：样式修改作用域四档；region 版目标解析见 regionInspectorModel） */
export type StyleApplyScope = 'object' | 'type' | 'layer' | 'style';

export interface StyleParametersFormProps {
  parameters: StyleParameter[];
  /** 当前生效值（调用方合成；缺失键回退参数默认值） */
  values: Record<string, unknown>;
  onChange: (key: string, value: string | number | boolean) => void;
}

export function StyleParametersForm({ parameters, values, onChange }: StyleParametersFormProps) {
  const controls = describeParameterControls(parameters);
  if (controls.length === 0) return null;
  return (
    <div className="ed-style-params" role="group" aria-label="样式参数">
      {controls.map((control) => {
        const value = values[control.key] ?? control.default;
        return (
          <div className="ed-field" key={control.key}>
            <label className="ed-field__label" title={control.key}>
              {control.label}
            </label>
            <div className="ed-field__value">
              {control.kind === 'color' ? (
                <ColorInput
                  value={String(value)}
                  ariaLabel={control.label}
                  onChange={(next) => onChange(control.key, next)}
                />
              ) : control.kind === 'number' ? (
                <NumberSlider
                  value={Number(value)}
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  ariaLabel={control.label}
                  onCommit={(next) => onChange(control.key, next)}
                />
              ) : control.kind === 'boolean' ? (
                <IconToggle
                  checked={Boolean(value)}
                  label={`${control.label}开关`}
                  onChange={(next) => onChange(control.key, next)}
                >
                  <span className="ed-icon-toggle__track" aria-hidden="true" />
                </IconToggle>
              ) : (
                <div className="ed-select-wrap">
                  <select
                    className="ed-input ed-select"
                    value={String(value)}
                    aria-label={control.label}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const option = control.options?.find((o) => String(o.value) === raw);
                      onChange(control.key, option && typeof option.value !== 'string' ? option.value : raw);
                    }}
                  >
                    {(control.options ?? []).map((option) => (
                      <option key={String(option.value)} value={String(option.value)}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
