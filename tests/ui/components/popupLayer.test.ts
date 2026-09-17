/**
 * tests/ui/components/popupLayer —— T9.1 弹层层叠治理纯逻辑单测。
 *
 * 覆盖（node 可测部分；视觉叠放关系归 T9.3 像素验收，沿既定方针）：
 *   - 根浮层容器解析：App 渲染的挂载点优先，缺失回退 body（React 树外兜底）；
 *   - 锚定定位纯函数 computeAnchoredPopupRect：四种贴锚策略（下拉左对齐 / 下拉右对齐 /
 *     子菜单右展 / 侧向 flyout）+ 视口收边（8px）+ 侧向右缘翻边 + 下缘上翻；
 *   - Tooltip 换边避让 resolveTooltipSide：贴靠边在屏幕边缘换到对侧，两侧皆不合适
 *     维持原边（不逃逸宿主的 CSS 方案配套，T9.1 门裁定）。
 */
import { describe, expect, it } from 'vitest';
import {
  POPUP_ROOT_ID,
  POPUP_VIEWPORT_MARGIN,
  computeAnchoredPopupRect,
  findPopupRoot,
  resolvePopupContainer,
  resolveTooltipSide,
} from '../../../src/ui/components/popupLayer';

/** 矩形桩（DOMRect 结构子集：纯函数只读六个字段） */
function rect(left: number, top: number, width: number, height: number) {
  return { left, top, right: left + width, bottom: top + height, width, height };
}

/** 最小 doc 桩：node 环境无 document，依赖注入 */
function fakeDoc(root: HTMLElement | null, body: HTMLElement): {
  getElementById(id: string): HTMLElement | null;
  body: HTMLElement;
} {
  return { getElementById: (id: string) => (id === POPUP_ROOT_ID ? root : null), body };
}

describe('popupLayer · 根浮层容器解析', () => {
  it('POPUP_ROOT_ID 为固定挂载点 id', () => {
    expect(POPUP_ROOT_ID).toBe('ed-popup-root');
  });

  it('已注册根容器优先返回（App 渲染的挂载点）', () => {
    const root = {} as HTMLElement;
    const body = {} as HTMLElement;
    expect(resolvePopupContainer(fakeDoc(root, body))).toBe(root);
    expect(findPopupRoot(fakeDoc(root, body))).toBe(root);
  });

  it('根容器缺失时回退 body（React 树未就绪兜底）', () => {
    const body = {} as HTMLElement;
    expect(resolvePopupContainer(fakeDoc(null, body))).toBe(body);
    expect(findPopupRoot(fakeDoc(null, body))).toBeNull();
  });
});

describe('popupLayer · computeAnchoredPopupRect 锚定定位', () => {
  const viewport = { width: 1280, height: 800 };
  const anchor = rect(100, 40, 40, 32); // 通用锚：100..140 × 40..72
  const popup = { width: 200, height: 160 };

  it('below-left：弹层左缘对锚左缘、顶贴锚底（主菜单 / 模式下拉 / 对齐 / 阵列）', () => {
    expect(computeAnchoredPopupRect(anchor, popup, viewport, 'below-left')).toEqual({
      left: 100,
      top: 72,
    });
  });

  it('below-right：弹层右缘对锚右缘、顶贴锚底；越左缘收边到 8（Outliner 创建 / 布局弹层）', () => {
    expect(computeAnchoredPopupRect(anchor, popup, viewport, 'below-right')).toEqual({
      left: POPUP_VIEWPORT_MARGIN, // 140-200=-60 → 左缘下限 8
      top: 72,
    });
  });

  it('submenu-right：自锚右缘外移 4px（--sp-2）、顶上移 4px 抵消弹层 padding（主菜单子弹层）', () => {
    expect(computeAnchoredPopupRect(anchor, popup, viewport, 'submenu-right')).toEqual({
      left: 136,
      top: 36,
    });
  });

  it('flyout-right：自锚右缘外移 4px、顶对锚顶（垂直条 flyout / 抽屉）', () => {
    expect(computeAnchoredPopupRect(anchor, popup, viewport, 'flyout-right')).toEqual({
      left: 144,
      top: 40,
    });
  });

  it('below-left 近右缘：整体内收至视口右缘 8px 内', () => {
    const nearRight = rect(1150, 40, 100, 32);
    const result = computeAnchoredPopupRect(nearRight, popup, viewport, 'below-left');
    expect(result.left).toBe(1280 - POPUP_VIEWPORT_MARGIN - 200); // 1072
    expect(result.left + 200).toBeLessThanOrEqual(1280 - POPUP_VIEWPORT_MARGIN);
    expect(result.top).toBe(72);
  });

  it('flyout-right 右缘越界：翻至锚左侧展开（对侧避让）', () => {
    const nearRight = rect(1200, 40, 40, 32); // right = 1240
    const result = computeAnchoredPopupRect(nearRight, popup, viewport, 'flyout-right');
    expect(result.left).toBe(1200 - 4 - 200); // 锚左缘外 4px
    expect(result.top).toBe(40);
  });

  it('flyout-right 下缘越界：上翻（弹层底对锚底），收边后不越视口下缘', () => {
    const lowAnchor = rect(48, 250, 40, 32); // bottom = 282
    const smallViewport = { width: 1280, height: 300 };
    const tallPopup = { width: 176, height: 120 };
    const result = computeAnchoredPopupRect(lowAnchor, tallPopup, smallViewport, 'flyout-right');
    expect(result.top).toBe(282 - 120); // 上翻：弹层底缘对锚底缘
    expect(result.top + tallPopup.height).toBeLessThanOrEqual(300 - POPUP_VIEWPORT_MARGIN);
  });

  it('弹层宽于视口：左右皆不合适时钉在左缘 8px（不越负）', () => {
    const tinyViewport = { width: 300, height: 800 };
    const widePopup = { width: 400, height: 160 };
    const result = computeAnchoredPopupRect(anchor, widePopup, tinyViewport, 'below-left');
    expect(result.left).toBe(POPUP_VIEWPORT_MARGIN);
  });
});

describe('popupLayer · resolveTooltipSide 换边避让', () => {
  const viewport = { width: 1280, height: 800 };
  const tip = { width: 180, height: 60 };

  it('原边放得下：维持原边（垂直条右贴不受影响）', () => {
    const host = rect(100, 300, 40, 40);
    expect(resolveTooltipSide(host, tip, viewport, 'right')).toBe('right');
  });

  it('右缘放不下且左侧有空间：翻到左侧（近屏幕缘向内弹）', () => {
    const host = rect(1160, 300, 40, 40); // right = 1200，1200+180 > 1272
    expect(resolveTooltipSide(host, tip, viewport, 'right')).toBe('left');
  });

  it('下缘放不下且上方有空间：翻到上方', () => {
    const host = rect(600, 740, 40, 40); // bottom = 780，780+60 > 792
    expect(resolveTooltipSide(host, tip, viewport, 'bottom')).toBe('top');
  });

  it('两侧都放不下：维持原边（宁贴锚不消失）', () => {
    const host = rect(80, 380, 40, 40);
    const cramped = { width: 320, height: 400 }; // 视口 400 宽：右 120+320=440>392、左 80-320<8
    expect(resolveTooltipSide(host, cramped, { width: 400, height: 800 }, 'right')).toBe('right');
  });
});
