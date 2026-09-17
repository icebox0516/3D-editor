/**
 * ui/components/popupLayer —— 弹层层叠治理纯逻辑（T9.1）。
 *
 * 职责（node 可测的挂载策略部分；视觉叠放归 T9.3 像素验收，沿既定方针）：
 *   - 根浮层容器解析：App 根部渲染的挂载点（#ed-popup-root，z 取 --z-popover）优先，
 *     缺失时回退 body——弹层 portal 后逃逸宿主层叠上下文（带 z-index 的 grid/flex
 *     工具条/面板自成层叠上下文，内联弹层的 z 只在宿主内有效）；
 *   - 锚定定位纯函数：锚 rect + 弹层实测尺寸 → 视口坐标 left/top。四种贴锚策略
 *     （语义与改造前 CSS 锚定一一对应：below-left=原 top:100%/left:0、
 *     below-right=原 left:auto/right:0、submenu-right=原 .ed-menu__sub、
 *     flyout-right=原 .ed-vtool__menu）+ 视口收边（沿右键菜单 8px 先例）；
 *     锚定语义不变：贴锚展开、对齐关系照旧，仅在越出视口时收边/翻边
 *     （原内联渲染下同样越界，只是被相邻区域盖住不可见）；
 *   - Tooltip 换边避让：贴靠边在屏幕边缘放不下时翻到对侧（近缘向内弹），
 *     两侧皆不合适维持原边——Tooltip 保留纯 CSS 方案不逃逸（T9.1 门裁定），
 *     本函数是其唯一的测量后决策点。
 * 边界：纯函数 + 依赖注入（doc/rect 均参数化，node 环境无 DOM 也可测）；
 *      偏移常量与 tokens.css 对应（--sp-2 = 4px），令牌改值需同步此处。
 */
/** Tooltip 贴靠边（换边避让只在成对边之间翻转；组件侧消费见 Tooltip.tsx） */
export type TooltipSide = 'right' | 'bottom' | 'left' | 'top';

/** App 根部浮层挂载点 id（App.tsx 渲染 .ed-popup-root） */
export const POPUP_ROOT_ID = 'ed-popup-root';

/** 视口安全边距（沿右键菜单 ContextMenu 收边先例 8px） */
export const POPUP_VIEWPORT_MARGIN = 8;

/** 锚定偏移（= tokens.css --sp-2 = 4px：子弹层抵消弹层 padding / flyout 列右缘外隙） */
const ANCHOR_OFFSET_PX = 4;

/** 弹层挂载目标解析所需的最小 doc 形状（依赖注入，node 可测） */
export interface PopupDoc {
  getElementById(id: string): HTMLElement | null;
  body: HTMLElement;
}

/** 矩形只读子集（DOMRect 结构兼容，纯函数不触碰 DOM） */
export interface RectLike {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface SizeLike {
  width: number;
  height: number;
}

/** 锚定策略（贴锚语义，portal 化前后一致） */
export type PopupPlacement =
  | 'below-left' // 弹层左缘对锚左缘、顶贴锚底（主菜单下拉 / 模式下拉 / 对齐 / 阵列）
  | 'below-right' // 弹层右缘对锚右缘、顶贴锚底（布局弹层 / Outliner 创建下拉）
  | 'submenu-right' // 自锚右缘外移 4px、顶上移 4px 抵消弹层 padding（主菜单子弹层）
  | 'flyout-right'; // 自锚右缘外移 4px、顶对锚顶（垂直条 flyout / 「更多」抽屉）

/** 查找根浮层容器（App 渲染的挂载点；未渲染返回 null） */
export function findPopupRoot(doc: PopupDoc): HTMLElement | null {
  return doc.getElementById(POPUP_ROOT_ID);
}

/** 弹层 portal 挂载目标：根浮层容器优先，缺失回退 body（React 树未就绪兜底） */
export function resolvePopupContainer(doc: PopupDoc): HTMLElement {
  return findPopupRoot(doc) ?? doc.body;
}

/** 区间钳制（lo > hi 时钉在 lo：弹层大于视口时贴安全边距，不越负） */
function clamp(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), Math.max(lo, hi));
}

/**
 * 锚定定位：锚 rect + 弹层尺寸 + 视口尺寸 → 弹层左上角视口坐标。
 * 越界处理：侧向弹层（submenu/flyout）右缘越界翻至锚左侧、下缘越界上翻（弹层底对锚底）；
 * 下拉类（below-*）不翻边只收边；全部结果收在视口 8px 安全边距内。
 */
export function computeAnchoredPopupRect(
  anchor: RectLike,
  popup: SizeLike,
  viewport: SizeLike,
  placement: PopupPlacement,
): { left: number; top: number } {
  const m = POPUP_VIEWPORT_MARGIN;
  const vw = viewport.width;
  const vh = viewport.height;
  const sideAnchored = placement === 'submenu-right' || placement === 'flyout-right';

  let left: number;
  let top: number;
  switch (placement) {
    case 'below-left':
      left = anchor.left;
      top = anchor.bottom;
      break;
    case 'below-right':
      left = anchor.right - popup.width;
      top = anchor.bottom;
      break;
    case 'submenu-right':
      left = anchor.right - ANCHOR_OFFSET_PX;
      top = anchor.top - ANCHOR_OFFSET_PX;
      break;
    case 'flyout-right':
      left = anchor.right + ANCHOR_OFFSET_PX;
      top = anchor.top;
      break;
  }

  // 右缘：侧向弹层翻至锚左侧（对侧避让）；下拉类直接收边
  if (left + popup.width > vw - m) {
    left = sideAnchored ? anchor.left - ANCHOR_OFFSET_PX - popup.width : left;
  }
  left = clamp(left, m, vw - m - popup.width);

  // 下缘：侧向弹层上翻（弹层底缘对锚底缘），再统一收边
  if (sideAnchored && top + popup.height > vh - m) {
    top = anchor.bottom - popup.height;
  }
  top = clamp(top, m, vh - m - popup.height);

  return { left, top };
}

/** Tooltip 对侧映射（换边避让只在成对边之间翻转） */
const OPPOSITE_SIDE: Record<TooltipSide, TooltipSide> = {
  right: 'left',
  left: 'right',
  bottom: 'top',
  top: 'bottom',
};

/**
 * Tooltip 换边避让：preferred 边在视口内放不下时翻到对侧；对侧也放不下维持原边
 * （宁贴锚不消失）。视口安全边距同 POPUP_VIEWPORT_MARGIN。
 */
export function resolveTooltipSide(
  host: RectLike,
  tooltip: SizeLike,
  viewport: SizeLike,
  preferred: TooltipSide,
): TooltipSide {
  const m = POPUP_VIEWPORT_MARGIN;
  const fits = (side: TooltipSide): boolean => {
    switch (side) {
      case 'right':
        return host.right + tooltip.width <= viewport.width - m;
      case 'left':
        return host.left - tooltip.width >= m;
      case 'bottom':
        return host.bottom + tooltip.height <= viewport.height - m;
      case 'top':
        return host.top - tooltip.height >= m;
    }
  };
  if (fits(preferred)) return preferred;
  const opposite = OPPOSITE_SIDE[preferred];
  if (fits(opposite)) return opposite;
  return preferred;
}
