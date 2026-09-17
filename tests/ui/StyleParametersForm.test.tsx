/**
 * tests/ui/StyleParametersForm.test.tsx —— 样式参数自动生成测试
 * （T2.4 先测后码；T6.7 重写：v1 styleDefinitions/resolveStyleTargets/STYLE_SCOPE_OPTIONS
 *  用例已删——控件描述符覆盖改以内联参数声明 + 语义注册表参数驱动；作用域目标解析
 *  的 region 版覆盖见 tests/ui/panels/regionInspectorModel.test.ts）。
 *
 * 覆盖（组件不渲染，按「参数声明 → 控件描述符」纯函数断言落地）：
 * - describeParameterControls：四种参数类型 → 控件类型直映射
 *   （color → 取色器、number → 滑杆+数值框（min/max/step 透传）、boolean → 开关、
 *   select → 下拉（options 透传））；顺序保持声明序；key/label/default 透传；
 * - 语义注册表参数完备：SEMANTIC_DEFINITIONS 的业务参数（road.width / building.height）
 *   均可生成合法描述符（表单由语义参数与预设 defaultParams 共用同一声明形态）。
 * 边界：vitest node 环境不渲染组件壳；StyleParametersForm 组件由浏览器验收覆盖。
 */
import { describe, expect, it } from 'vitest';
import type { StyleParameter } from '../../src/domain/styles';
import { SEMANTIC_DEFINITIONS } from '../../src/domain/regions';
import { describeParameterControls } from '../../src/ui/panels/StyleParametersForm';

describe('describeParameterControls：四种参数类型 → 控件描述符', () => {
  it('color/number/boolean/select 直映射，key/label/default/min/max/step/options 透传', () => {
    const parameters: StyleParameter[] = [
      { key: 'color', label: '主体色', type: 'color', default: '#3a7ca5' },
      { key: 'opacity', label: '不透明度', type: 'number', default: 1, min: 0, max: 1, step: 0.05 },
      { key: 'lit', label: '夜间亮灯', type: 'boolean', default: true },
      {
        key: 'roof',
        label: '屋顶形式',
        type: 'select',
        default: 'flat',
        options: [
          { value: 'flat', label: '平顶' },
          { value: 'pitched', label: '坡顶' },
        ],
      },
    ];
    const controls = describeParameterControls(parameters);
    expect(controls.map((c) => `${c.key}:${c.kind}`)).toEqual([
      'color:color',
      'opacity:number',
      'lit:boolean',
      'roof:select',
    ]);
    expect(controls[0]).toMatchObject({ key: 'color', label: '主体色', default: '#3a7ca5' });
    expect(controls[1]).toMatchObject({ min: 0, max: 1, step: 0.05, default: 1 });
    expect(controls[2]).toMatchObject({ kind: 'boolean', default: true });
    expect(controls[3]).toMatchObject({
      default: 'flat',
      options: [
        { value: 'flat', label: '平顶' },
        { value: 'pitched', label: '坡顶' },
      ],
    });
  });

  it('顺序保持声明序；空声明 → 空描述符（表单返回 null 的数据依据）', () => {
    const parameters: StyleParameter[] = [
      { key: 'b', label: 'B', type: 'number', default: 2 },
      { key: 'a', label: 'A', type: 'number', default: 1 },
    ];
    expect(describeParameterControls(parameters).map((c) => c.key)).toEqual(['b', 'a']);
    expect(describeParameterControls([])).toEqual([]);
  });

  it('混合声明快照：number+color（预设参数表的典型形态）', () => {
    const controls = describeParameterControls([
      { key: 'color', label: '颜色', type: 'color', default: '#1b4f72' },
      { key: 'opacity', label: '透明度', type: 'number', default: 0.85, min: 0, max: 1, step: 0.05 },
      { key: 'flowSpeed', label: '流速', type: 'number', default: 1.2, min: 0, max: 3, step: 0.1 },
    ]);
    expect(controls.map((c) => `${c.key}:${c.kind}`)).toEqual([
      'color:color',
      'opacity:number',
      'flowSpeed:number',
    ]);
  });
});

describe('describeParameterControls：语义注册表参数完备（表单共用声明形态）', () => {
  it('SEMANTIC_DEFINITIONS 全部业务参数可生成描述符（road.width=6 / building.height=10）', () => {
    const withParams = SEMANTIC_DEFINITIONS.filter((def) => def.properties.length > 0);
    expect(withParams.map((def) => def.type).sort()).toEqual(['building', 'road']);
    for (const def of withParams) {
      const controls = describeParameterControls(def.properties);
      expect(controls.length).toBe(def.properties.length);
      for (const control of controls) {
        expect(control.label).toBeTruthy();
        expect(['color', 'number', 'boolean', 'select']).toContain(control.kind);
      }
    }
    const road = describeParameterControls(
      SEMANTIC_DEFINITIONS.find((d) => d.type === 'road')!.properties,
    );
    expect(road[0]).toMatchObject({ key: 'width', label: '宽度', kind: 'number', default: 6 });
    const building = describeParameterControls(
      SEMANTIC_DEFINITIONS.find((d) => d.type === 'building')!.properties,
    );
    expect(building[0]).toMatchObject({ key: 'height', label: '高度', kind: 'number', default: 10 });
  });
});
