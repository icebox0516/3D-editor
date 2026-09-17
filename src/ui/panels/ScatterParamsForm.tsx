/**
 * ui/panels/ScatterParamsForm —— 散布参数自动生成表单（T003.3，D18）。
 *
 * 职责：预设散布配方（ScatterRecipe）+ 区域覆写 → 参数控件——密度/聚簇份额/
 *      边缘衰减/尺寸范围（min/max 两滑条）经 NumberSlider 提交制改动写
 *      scatter.* 覆写键；配比为只读展示（相对权重折算百分比，D18-2；配比编辑
 *      UI 留 003.5/T004）；seed 只读显示（生效值 = 显式 seed ?? 派生 hash(objectId)）
 *      + 重掷按钮（经命令写新 seed，区域私有——D18-5）。
 * 纯逻辑（可测，node 无 DOM）：describeScatterControls（配方+覆写 → 控件描述符
 *      与生效值）、scatterAssetShares（配比折算百分比）——测试断言基准。
 * 边界：ui 层只依赖 core/domain（分层 DAG）；零 THREE；控件复用设计系统类名
 *      （ed-field/ed-btn ed-btn--ghost）；一切改动经调用方 onChange → Command。
 */
import { Dices } from 'lucide-react';
import type { ScatterRecipe } from '../../domain/scatter';
import { applyScatterOverrides } from '../../domain/scatter';
import { NumberSlider } from '../components/NumberSlider';

/** 散布数值控件描述符（纯函数产物，测试断言基准；生效值 = 配方默认 < 覆写 + 钳制） */
export interface ScatterControl {
  /** 覆写键（scatter.* 白名单键；尺寸范围经表单组装为整对象提交） */
  key: 'scatter.densityPerM2' | 'scatter.clustering' | 'scatter.edgeFalloffM' | 'scatter.scaleRange';
  /** 尺寸范围子通道（仅 key=scatter.scaleRange 有意义） */
  bound?: 'min' | 'max';
  label: string;
  min: number;
  max: number;
  step: number;
  precision: number;
  unit?: string;
  /** 当前生效值 */
  value: number;
}

/** 密度滑条值域（点/m²）：0.001–1 线性（v1 定档；003.5 内容配齐后按需再调） */
const DENSITY_RANGE = { min: 0.001, max: 1, step: 0.001, precision: 3 } as const;
/** 尺寸范围滑条值域：0.2–3（相对标称缩放） */
const SCALE_RANGE = { min: 0.2, max: 3, step: 0.05, precision: 2 } as const;

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * 配方 + 覆写 → 控件描述符与生效值（密度/聚簇/边缘衰减/尺寸下限/尺寸上限，共 5 个）。
 * 生效值经 applyScatterOverrides 合成（白名单/防御单一真相源），显示值钳到控件值域
 * （极端覆写不越出滑条；提交时 sanitization 兜底）。
 */
export function describeScatterControls(
  recipe: ScatterRecipe,
  overrides: Record<string, unknown> | undefined,
): ScatterControl[] {
  const effective = applyScatterOverrides(recipe, overrides);
  const range = effective.scaleRange ?? { min: 1, max: 1 };
  return [
    {
      key: 'scatter.densityPerM2',
      label: '密度',
      ...DENSITY_RANGE,
      unit: '点/m²',
      value: clamp(effective.densityPerM2, DENSITY_RANGE.min, DENSITY_RANGE.max),
    },
    {
      key: 'scatter.clustering',
      label: '聚簇',
      min: 0,
      max: 1,
      step: 0.05,
      precision: 2,
      value: clamp(effective.clustering ?? 0, 0, 1),
    },
    {
      key: 'scatter.edgeFalloffM',
      label: '边缘衰减',
      min: 0,
      max: 20,
      step: 0.5,
      precision: 1,
      unit: 'm',
      value: clamp(effective.edgeFalloffM ?? 0, 0, 20),
    },
    {
      key: 'scatter.scaleRange',
      bound: 'min',
      label: '尺寸下限',
      ...SCALE_RANGE,
      value: clamp(range.min, SCALE_RANGE.min, SCALE_RANGE.max),
    },
    {
      key: 'scatter.scaleRange',
      bound: 'max',
      label: '尺寸上限',
      ...SCALE_RANGE,
      value: clamp(range.max, SCALE_RANGE.min, SCALE_RANGE.max),
    },
  ];
}

/** 配比只读行（生效配比折算百分比；非法权重项剔除——展示与撒点同口径） */
export interface ScatterAssetShare {
  assetId: string;
  weight: number;
  /** 折算百分比（0–100，一位小数）；全无效配比恒 0 */
  percent: number;
}

/** 生效配比 → 折算百分比行（整表替换语义下覆写配比即新表） */
export function scatterAssetShares(
  recipe: ScatterRecipe,
  overrides: Record<string, unknown> | undefined,
): ScatterAssetShare[] {
  const effective = applyScatterOverrides(recipe, overrides);
  const valid = effective.assets.filter(
    (a) => typeof a.weight === 'number' && Number.isFinite(a.weight) && a.weight > 0,
  );
  const total = valid.reduce((sum, a) => sum + a.weight, 0);
  return valid.map((a) => ({
    assetId: a.assetId,
    weight: a.weight,
    percent: total > 0 ? Math.round((a.weight / total) * 1000) / 10 : 0,
  }));
}

export interface ScatterParamsFormProps {
  recipe: ScatterRecipe;
  overrides: Record<string, unknown> | undefined;
  /** 生效 seed（调用方 resolveScatterSeed 合成：显式 seed ?? 派生 hash(objectId)） */
  seed: number;
  /** 覆写提交（key = 白名单键；尺寸范围以整对象 {min,max} 提交） */
  onOverride: (key: string, value: unknown) => void;
  /** seed 重掷（调用方经命令执行——区域私有，不随作用域批量） */
  onRerollSeed: () => void;
}

export function ScatterParamsForm({
  recipe,
  overrides,
  seed,
  onOverride,
  onRerollSeed,
}: ScatterParamsFormProps) {
  const controls = describeScatterControls(recipe, overrides);
  const shares = scatterAssetShares(recipe, overrides);
  const range = applyScatterOverrides(recipe, overrides).scaleRange ?? { min: 1, max: 1 };

  /** 尺寸滑条提交：与另一端点合成整对象（applyScatterOverrides 会摆正顺序，这里只组表） */
  const commitScale = (bound: 'min' | 'max', next: number) => {
    onOverride('scatter.scaleRange', {
      min: bound === 'min' ? next : range.min,
      max: bound === 'max' ? next : range.max,
    });
  };

  return (
    <div className="ed-style-params" role="group" aria-label="散布参数">
      {controls.map((control) => (
        <div className="ed-field" key={`${control.key}${control.bound ?? ''}`}>
          <label className="ed-field__label" title={control.key}>
            {control.label}
            {control.unit ? <span className="ed-field__unit">{control.unit}</span> : null}
          </label>
          <div className="ed-field__value">
            <NumberSlider
              value={control.value}
              min={control.min}
              max={control.max}
              step={control.step}
              precision={control.precision}
              ariaLabel={control.label}
              onCommit={(next) => {
                if (control.key === 'scatter.scaleRange' && control.bound) {
                  commitScale(control.bound, next);
                } else {
                  onOverride(control.key, next);
                }
              }}
            />
          </div>
        </div>
      ))}
      {shares.length > 0 ? (
        <div className="ed-field">
          <label className="ed-field__label" title="scatter.assets">
            配比
          </label>
          <div className="ed-field__value">
            <ul className="ed-scatter-mix" aria-label="资产配比（只读）">
              {shares.map((s) => (
                <li key={s.assetId}>
                  <span className="ed-scatter-mix__asset">{s.assetId}</span>
                  <span className="ed-scatter-mix__percent">{s.percent.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
      <div className="ed-field">
        <label className="ed-field__label" title="style.seed">
          种子
        </label>
        <div className="ed-field__value">
          <span className="ed-scatter-seed" aria-label="散布种子（只读）">
            {seed}
          </span>
          <button
            type="button"
            className="ed-btn ed-btn--ghost"
            title="重掷种子（重新撒布）"
            aria-label="重掷散布种子"
            onClick={onRerollSeed}
          >
            <Dices size={14} aria-hidden="true" />
            重掷
          </button>
        </div>
      </div>
    </div>
  );
}
