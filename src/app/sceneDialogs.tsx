/**
 * app/sceneDialogs —— 场景模板与批量导入弹层接线（T8.2）。
 *
 * 职责：为 createEditorActions 提供四个 Promise 型弹层依赖（actions 只发请求，
 *      本 hook 持受控开关并在用户手势上 resolve——app 层组合，ui 组件零副作用）：
 *   - confirmSceneReplace：读当前 saveState——非 dirty/error 直通 true **零弹层**
 *     （dirty 语义口径沿 beforeunload 守卫）；dirty 时弹三行摘要确认弹层；
 *   - promptTemplateName：「另存为模板…」命名弹层（空名禁用/重名「将覆盖」在组件内）；
 *   - showImportPreview：批量导入三态行预览（确认/取消 resolve）；
 *   - openManageTemplates：管理弹层（数据 = 内置只读 + 用户清单 TemplateListItem
 *     映射；CRUD 直调 io/templates userTemplates——app 可导入 io，改名/删除后
 *     刷新弹层数据与菜单清单并 Toast 反馈，删除无二次确认沿 LayoutMenu 先例）。
 * 边界：app 层（可导入 io/ui）；storage 只经 userTemplates 模块（localStorage
 *      不可用时 CRUD 静默降级，弹层数据照常渲染内置区）；同一时刻至多一个弹层。
 */
import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ConfirmSceneReplaceDialog,
  ImportPreviewDialog,
  ManageTemplatesDialog,
  TemplateNamingDialog,
} from '../ui/components/SceneDialogs';
import type {
  ImportPreviewRow,
  SceneReplaceSummary,
  TemplateListItem,
} from '../ui/components/SceneDialogs';
import type { SaveState } from '../ui/saveStatus';
import { pushToast } from '../ui/feedback/toastStore';
import { BUILTIN_TEMPLATES, deleteUserTemplate, listUserTemplates, renameUserTemplate } from '../io/templates';

/** 受控弹层状态（同一时刻至多一个；resolve 回调挂在状态里由手势触发） */
type DialogState =
  | { kind: 'confirm-replace'; summary: SceneReplaceSummary; resolve: (v: boolean) => void }
  | { kind: 'naming'; existingNames: string[]; resolve: (v: string | null) => void }
  | { kind: 'manage' }
  | { kind: 'import-preview'; rows: ImportPreviewRow[]; resolve: (v: boolean) => void };

/** TemplatePayload → 管理弹层清单条目（计数 meta 用） */
function toListItem(t: {
  id: string;
  name: string;
  builtin: boolean;
  scene: { objects: unknown[]; layers: unknown[] };
}): TemplateListItem {
  return {
    id: t.id,
    name: t.name,
    builtin: t.builtin,
    objectCount: t.scene.objects.length,
    layerCount: t.scene.layers.length,
  };
}

/** 管理弹层数据快照：内置在前 + 用户清单直读 localStorage（与会话内改动一致） */
function manageItemsSnapshot(): TemplateListItem[] {
  return [...BUILTIN_TEMPLATES.map(toListItem), ...listUserTemplates().map(toListItem)];
}

/** useSceneDialogs 返回的动作句柄（注入 createEditorActions）与弹层元素 */
export interface SceneDialogs {
  confirmSceneReplace(summary: SceneReplaceSummary): Promise<boolean>;
  promptTemplateName(existingNames: string[]): Promise<string | null>;
  showImportPreview(rows: ImportPreviewRow[]): Promise<boolean>;
  openManageTemplates(): void;
  /** 受控弹层元素（App 根部渲染；null = 无弹层） */
  element: ReactNode;
}

/**
 * 场景弹层接线。getSaveState / onTemplatesChanged 须稳定（App 以 ref 读 saveState、
 * useCallback 包刷新回调），本 hook 返回的动作句柄随之稳定——可安全被组合根
 * mount effect 的 createEditorActions 闭包捕获。
 */
export function useSceneDialogs(
  getSaveState: () => SaveState,
  onTemplatesChanged: () => void,
): SceneDialogs {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [manageItems, setManageItems] = useState<TemplateListItem[]>([]);

  const close = useCallback((): void => setDialog(null), []);

  const confirmSceneReplace = useCallback(
    (summary: SceneReplaceSummary): Promise<boolean> => {
      const state = getSaveState();
      // 非 dirty 直通（零弹层）；dirty / error（保存失败未处理）弹确认——沿 beforeunload 口径
      if (state !== 'dirty' && state !== 'error') return Promise.resolve(true);
      return new Promise((resolve) => setDialog({ kind: 'confirm-replace', summary, resolve }));
    },
    [getSaveState],
  );

  const promptTemplateName = useCallback((existingNames: string[]): Promise<string | null> => {
    return new Promise((resolve) => setDialog({ kind: 'naming', existingNames, resolve }));
  }, []);

  const showImportPreview = useCallback((rows: ImportPreviewRow[]): Promise<boolean> => {
    return new Promise((resolve) => setDialog({ kind: 'import-preview', rows, resolve }));
  }, []);

  const openManageTemplates = useCallback((): void => {
    setManageItems(manageItemsSnapshot());
    setDialog({ kind: 'manage' });
  }, []);

  const onRename = useCallback(
    (id: string, name: string): void => {
      if (renameUserTemplate(id, name)) {
        setManageItems(manageItemsSnapshot());
        onTemplatesChanged();
        pushToast('info', `模板已重命名为「${name}」`);
      } else {
        pushToast('error', '重命名失败：模板不存在或名称为空');
      }
    },
    [onTemplatesChanged],
  );

  const onDelete = useCallback(
    (id: string): void => {
      if (deleteUserTemplate(id)) {
        setManageItems(manageItemsSnapshot());
        onTemplatesChanged();
        pushToast('info', '模板已删除');
      } else {
        pushToast('error', '删除失败：模板不存在');
      }
    },
    [onTemplatesChanged],
  );

  let element: ReactNode = null;
  if (dialog?.kind === 'confirm-replace') {
    element = (
      <ConfirmSceneReplaceDialog
        summary={dialog.summary}
        onConfirm={() => {
          dialog.resolve(true);
          close();
        }}
        onCancel={() => {
          dialog.resolve(false);
          close();
        }}
      />
    );
  } else if (dialog?.kind === 'naming') {
    element = (
      <TemplateNamingDialog
        existingNames={dialog.existingNames}
        onSubmit={(name) => {
          dialog.resolve(name);
          close();
        }}
        onCancel={() => {
          dialog.resolve(null);
          close();
        }}
      />
    );
  } else if (dialog?.kind === 'manage') {
    element = (
      <ManageTemplatesDialog items={manageItems} onRename={onRename} onDelete={onDelete} onClose={close} />
    );
  } else if (dialog?.kind === 'import-preview') {
    element = (
      <ImportPreviewDialog
        rows={dialog.rows}
        onConfirm={() => {
          dialog.resolve(true);
          close();
        }}
        onCancel={() => {
          dialog.resolve(false);
          close();
        }}
      />
    );
  }

  return { confirmSceneReplace, promptTemplateName, showImportPreview, openManageTemplates, element };
}
