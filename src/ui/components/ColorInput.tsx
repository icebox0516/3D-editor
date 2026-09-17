/**
 * ui/components/ColorInput —— 取色器（T2.4，设计系统 ed-color）。
 *
 * 职责：原生 color input（DESIGN.md §7.2「color → 原生 color input 包一层 ed-swatch」）
 *      + 当前色样回显；非法色值（非 #rrggbb）回退黑样、input 值兜底 #000000。
 * 边界：纯受控组件，值变化即回调（取色器自身即预览，无草稿态）；零编辑器依赖。
 */
interface ColorInputProps {
  value: string;
  onChange: (next: string) => void;
  ariaLabel: string;
}

const HEX_RGB = /^#[0-9a-fA-F]{6}$/;

function safeHex(value: string): string {
  return HEX_RGB.test(value) ? value : '#000000';
}

export function ColorInput({ value, onChange, ariaLabel }: ColorInputProps) {
  const safe = safeHex(value);
  return (
    <span className="ed-color">
      <input
        type="color"
        value={safe}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="ed-swatch" aria-hidden="true" style={{ ['--swatch' as string]: safe }} />
      <span className="ed-color__hex ed-readout">{safe.toLowerCase()}</span>
    </span>
  );
}
