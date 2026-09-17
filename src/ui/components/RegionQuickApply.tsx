/**
 * ui/components/RegionQuickApply —— 三步流第三步「赋类型与样式」快选（T6.5）。
 *
 * 职责：绘制完成后的未分类 RegionObject 选中时浮出于上下文工具条——
 *   - 类型芯片：八类（water/grass/plaza/parking/bare_land/road/building/poi，语义
 *     注册表驱动 quickApplyChips）+「更多」（打开右侧检查器对象标签，完整操作归 T6.6）；
 *     点击芯片 = 暂存类型（琥珀描边），不立即发命令；
 *   - 样式缩略图快选条：暂存类型 × 选中形状双维过滤（EditorFacade.registries.presets，
 *     **禁止 import runtime**，分域契约 §0 规则 2）；色样取 defaultParams 的 color 默认值；
 *     点击缩略图 = ChangeSemanticCommand（自动归层）+ ChangePresetCommand 经
 *     BatchCommand 合并为一条历史（applySemanticAndPreset，2026-09-11 审计定稿）；
 *   - 暂存类型默认 = 当前选中类型；应用成功后快选条随新语义刷新（切换其他预设仍可单点）。
 * 边界：纯 UI 组件（数据经 props/模型函数，命令组装归 regionQuickApply 模块）；
 *      仅当选中单个 unclassified RegionObject 时呈现（已分类对象的完整操作归 T6.6 面板）。
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { EditorFacade } from '../../editor/EditorFacade';
import type { SemanticType, ShapeType } from '../../domain/regions';
import { useEditorStore } from '../store';
import { useWorkspaceStore } from '../layout/workspaceStore';
import { applySemanticAndPreset, presetOptions, quickApplyChips } from '../tools/regionQuickApply';
import type { QuickPresetOption } from '../tools/regionQuickApply';

/** 快选条呈现模型（RegionQuickApply 组件的受控输入） */
export interface RegionQuickApplyProps {
  facade: EditorFacade;
  /** 目标对象 id（单选中的未分类 RegionObject） */
  objectId: string;
  /** 目标形状（预设过滤维 1） */
  shapeType: ShapeType;
  /** 目标当前语义（预设过滤维 2 + 芯片当前态） */
  semanticType: SemanticType;
}

export function RegionQuickApply({ facade, objectId, shapeType, semanticType }: RegionQuickApplyProps) {
  /** 暂存类型（芯片点击写入；预设点击消费） */
  const [stagedType, setStagedType] = useState(semanticType);
  const sceneVersion = useEditorStore((s) => s.sceneVersion);
  void sceneVersion; // 应用后经版本号刷新派生（预设清单随语义切换）
  const stagedRef = useRef(stagedType);
  stagedRef.current = stagedType;

  // 目标语义变化（撤销/另选对象）→ 暂存态跟随复位
  useEffect(() => {
    setStagedType(semanticType);
  }, [semanticType, objectId]);

  const chips = useMemo(() => quickApplyChips(), []);
  const presets: QuickPresetOption[] = useMemo(
    () => presetOptions(facade.registries.presets, shapeType, stagedType),
    [facade, shapeType, stagedType],
  );
  const stagedDef = chips.find((c) => c.type === stagedType);

  /** 应用：类型 + 预设一条历史（失败 Toast 由调用侧错误通道兜底——此处静默保序） */
  const apply = (presetId: string): void => {
    applySemanticAndPreset(facade, objectId, stagedRef.current, presetId);
  };

  /** 更多：打开右侧检查器对象标签（完整类型/参数/样式操作归 T6.6 四分组面板） */
  const openInspector = (): void => {
    useWorkspaceStore.getState().setPanelHidden('right', false);
    useWorkspaceStore.getState().setInspectorTab('object');
  };

  return (
    <div className="ed-qa" role="group" aria-label="区域类型与样式快选">
      <span className="ed-qa__label">类型</span>
      <span className="ed-qa__chips" role="group" aria-label="业务类型芯片">
        {chips.map((chip) => {
          const staged = chip.type === stagedType;
          const current = chip.type === semanticType;
          return (
            <button
              key={chip.type}
              type="button"
              className={`ed-chip ed-qa__chip${staged ? ' ed-qa__chip--staged' : ''}${current ? ' ed-chip--active' : ''}`}
              aria-pressed={staged}
              title={`暂存类型：${chip.label}（再点右侧样式缩略图一步应用）`}
              onClick={() => setStagedType(chip.type)}
            >
              {chip.label}
            </button>
          );
        })}
        <button
          type="button"
          className="ed-chip ed-qa__chip ed-qa__chip--more"
          title="更多类型与参数（右侧检查器）"
          onClick={openInspector}
        >
          更多
          <ChevronRight size={11} aria-hidden="true" />
        </button>
      </span>

      <span className="ed-qa__label">样式</span>
      <span className="ed-qa__presets" role="group" aria-label={`${stagedDef?.label ?? '类型'}样式预设`}>
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="ed-qa__preset"
            title={`${stagedDef?.label ?? ''} · ${preset.name}（一步应用类型与样式）`}
            onClick={() => apply(preset.id)}
          >
            <span
              className="ed-qa__swatch"
              style={preset.color !== undefined ? { backgroundColor: preset.color } : undefined}
              aria-hidden="true"
            />
            <span className="ed-qa__preset-name">{preset.name}</span>
          </button>
        ))}
      </span>
    </div>
  );
}
