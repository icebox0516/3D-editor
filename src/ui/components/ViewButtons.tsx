/**
 * ui/components/ViewButtons —— 视图动作按钮（T3.3 起；T5.7 机位收编 HUD 后仅存动作钮）。
 *
 * 职责：上下文条「视图」组保留两颗**动作**按钮——聚焦选中（F）与全景（Home），经
 *      store.camera（CameraPort，组合根注入）生效——与 InputController 的 F / Home
 *      全局快捷键同通道（需求 §吸附、网格与视图）；F 需有选中对象才可用。
 * 退役登记（T5.7，主代理裁定）：透视/顶/前/侧四颗**机位**按钮随视口 HUD 右上
 *      「Perspective ▼」落地退役（需求零丢失映射：视图按钮 → HUD）；.ed-view 样式保留。
 * 边界：只经 store 的 Port 引用调用；零 THREE、零 runtime。
 */
import { useEditorStore } from '../store';

export function ViewButtons() {
  const camera = useEditorStore((s) => s.camera);
  const selectedIds = useEditorStore((s) => s.selectedIds);

  return (
    <div className="ed-view" role="group" aria-label="视图">
      <button
        type="button"
        className="ed-btn ed-btn--ghost ed-view__btn"
        disabled={!camera || selectedIds.length === 0}
        title="聚焦选中对象（F）"
        onClick={() => camera?.focusObjects(selectedIds)}
      >
        聚焦 <kbd className="ed-kbd">F</kbd>
      </button>
      <button
        type="button"
        className="ed-btn ed-btn--ghost ed-view__btn"
        disabled={!camera}
        title="全景（Home）"
        onClick={() => camera?.focusAll()}
      >
        全景 <kbd className="ed-kbd">Home</kbd>
      </button>
    </div>
  );
}
